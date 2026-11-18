// Read-only DOM audit, executed through the documented CUA browser evaluator.
// Excludes intentionally hidden labels, closed disclosures and disabled controls.
(() => {
 const rgba=value=>{const v=value.match(/[\d.]+/g)?.map(Number);return v?.length>=3?[...v.slice(0,3),v[3]??1]:[0,0,0,0];};
 const over=(fg,bg)=>{const a=fg[3]+bg[3]*(1-fg[3]);return a?[0,1,2].map(i=>(fg[i]*fg[3]+bg[i]*bg[3]*(1-fg[3]))/a).concat(a):[0,0,0,0];};
 const luminance=c=>c.slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
 const contrast=(a,b)=>{const la=luminance(a),lb=luminance(b);return(Math.max(la,lb)+.05)/(Math.min(la,lb)+.05);};
 const visible=el=>{
  if(!el.getClientRects().length||el.closest('#control-audit-panel')||el.disabled)return false;
  for(let p=el;p;p=p.parentElement){const s=getComputedStyle(p);if(p.hidden||s.display==='none')return false;if(p.tagName==='DETAILS'&&!p.open&&!p.querySelector('summary')?.contains(el))return false;}
  return true;
 };
 const rows=[];
 for(const [index,el] of [...document.querySelectorAll('a[href],button,summary,input[type="submit"]')].entries()) {
  if(!visible(el))continue;
  // Include nested label elements: a child class must not hide part of a label.
  const textChecks=[];
  for(const parent of [el,...el.querySelectorAll('span,strong,p,h2,h3,em')]){
   const text=parent.textContent.trim();if(!text||!visible(parent))continue;
   const style=getComputedStyle(parent),r=parent.getBoundingClientRect();
   if(style.clip!=='auto'||(style.overflow==='hidden'&&r.width<=1&&r.height<=1))continue;
   const layers=[];let opacity=1;
   for(let p=parent;p;p=p.parentElement){const s=getComputedStyle(p);layers.push(rgba(s.backgroundColor));opacity*=Number(s.opacity);}
   let bg=[255,255,255,1];for(const layer of layers.reverse())bg=over(layer,bg);
   let fg=rgba(style.webkitTextFillColor||style.color);fg[3]*=opacity;fg=over(fg,bg);
   const ratio=contrast(fg,bg),size=Number(style.fontSize.replace('px','')),weight=Number(style.fontWeight)||400;
   const minimum=size>=24||(size>=18.66&&weight>=700)?3:4.5;
   textChecks.push({text,color:style.color,textFill:style.webkitTextFillColor,background:bg.slice(0,3).map(Math.round),contrast:Number(ratio.toFixed(2)),minimum,opacity,visibility:style.visibility});
  }
  if(!textChecks.length)continue;
  rows.push({index,tag:el.tagName,classes:el.className,label:el.getAttribute('aria-label')||el.textContent.trim().replace(/\s+/g,' ').slice(0,120),href:el.getAttribute('href'),textChecks});
 }
 const failures=rows.filter(row=>row.textChecks.some(c=>c.contrast+.01<c.minimum||c.opacity===0||c.visibility!=='visible'));
 return {width:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,h1:document.querySelectorAll('h1').length,privacyControls:!!document.getElementById('cookie-banner')&&!!document.getElementById('cookie-preferences'),brokenImages:[...document.images].filter(i=>i.complete&&i.naturalWidth===0).map(i=>i.getAttribute('src')),controls:rows.length,buttonCount:rows.filter(r=>r.tag==='BUTTON'||r.classes.split(/\s+/).includes('btn')).length,failures,rows};
})()
