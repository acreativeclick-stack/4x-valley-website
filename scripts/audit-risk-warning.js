// Read-only rendered DOM check, run through the documented CUA evaluator.
(() => {
 const warning=document.getElementById('education-risk-warning');
 if(!warning)return {present:false,failures:['Missing warning']};
 const header=document.querySelector('.site-header'),main=document.getElementById('main');
 const rect=warning.getBoundingClientRect(),style=getComputedStyle(warning);
 const rgb=value=>(value.match(/[\d.]+/g)||[]).slice(0,3).map(Number);
 const luminance=c=>c.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
 const bg=luminance(rgb(style.backgroundColor));
 const textChecks=[...warning.querySelectorAll('p,strong,a')].map(el=>{
  const s=getComputedStyle(el),fg=luminance(rgb(s.color));
  return {tag:el.tagName,color:s.color,fontSize:s.fontSize,contrast:Number(((Math.max(fg,bg)+.05)/(Math.min(fg,bg)+.05)).toFixed(2)),visible:s.visibility==='visible'&&Number(s.opacity)>0&&el.getClientRects().length>0};
 });
 const text=warning.textContent.replace(/\s+/g,' ').trim();
 const expected='Education only. Forex and leveraged products carry a high risk of loss. Examples are illustrative and do not constitute personalised investment advice. Education does not guarantee trading profits. Read risk information.';
 const afterNavigation=warning.previousElementSibling===header;
 const beforeMain=warning.nextElementSibling===main;
 const fitsViewport=rect.top>=-1&&rect.bottom<=innerHeight&&rect.left>=0&&rect.right<=document.documentElement.clientWidth+1;
 const failures=[];
 if(document.querySelectorAll('#education-risk-warning').length!==1)failures.push('Warning must appear once');
 if(text!==expected)failures.push('Warning copy differs');
 if(!afterNavigation||!beforeMain)failures.push('Warning must sit between navigation and main content');
 if(!fitsViewport)failures.push('Warning is clipped or requires scrolling on initial load');
 if(warning.querySelector('a')?.getAttribute('href')!=='risk-disclosure.html')failures.push('Missing risk information link');
 if(textChecks.some(c=>!c.visible||c.contrast<4.5||Number(c.fontSize.replace('px',''))<16))failures.push('Warning text is not sufficiently readable');
 if(warning.querySelector('button,input'))failures.push('Warning must not require dismissal or consent');
 return {present:true,text,afterNavigation,beforeMain,fitsViewport,height:Math.round(rect.height),top:Math.round(rect.top),background:style.backgroundColor,textChecks,failures};
})()
