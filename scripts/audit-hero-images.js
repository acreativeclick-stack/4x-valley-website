// Read-only rendered checks for the local responsive hero imagery.
(() => {
 const images=[...document.querySelectorAll('img[data-hero-image]')],failures=[];
 if(images.length!==1)return {failures:['Expected one hero image'],imageCount:images.length};
 const image=images[0],frame=image.closest('figure'),section=image.closest('.page-hero,.eu-hero');
 const copy=section?.querySelector('.page-hero-copy'),heading=section?.querySelector('h1');
 const rect=image.getBoundingClientRect(),copyRect=(copy||heading)?.getBoundingClientRect();
 const style=getComputedStyle(image),variants=(image.getAttribute('srcset')||'').split(',').map(v=>v.trim().split(/\s+/));
 const loaded=image.complete&&image.naturalWidth>0;
 const separated=!!copyRect&&(copyRect.right<=rect.left+1||copyRect.bottom<=rect.top+1);
 const local=!!image.currentSrc&&new URL(image.currentSrc).origin===location.origin&&new URL(image.currentSrc).pathname.startsWith('/assets/heroes/');
 if(!loaded)failures.push('Hero image not loaded');
 if(!section||!frame)failures.push('Image not in hero figure');
 if(!separated)failures.push('Hero image overlaps its text');
 if(!local)failures.push('Hero image is not served locally');
 if(!image.alt.trim())failures.push('Missing alternative text');
 if(variants.map(v=>v[1]).join(',')!=='640w,1280w,1920w')failures.push('Missing responsive image variants');
 if(style.visibility!=='visible'||Number(style.opacity)===0||rect.width<=0||rect.height<=0)failures.push('Hero image hidden');
 if(rect.left<0||rect.right>document.documentElement.clientWidth+1)failures.push('Hero image overflows viewport');
 if(copy&&copy.scrollWidth>copy.clientWidth+1)failures.push('Hero text overflows its column');
 return {key:image.getAttribute('data-hero-image'),imageCount:images.length,loaded,local,separated,alt:image.alt,currentFile:image.currentSrc.split('/').pop(),displayWidth:Math.round(rect.width),displayHeight:Math.round(rect.height),responsiveWidths:variants.map(v=>v[1]),caption:frame?.querySelector('figcaption')?.textContent||'',failures};
})()
