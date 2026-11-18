// Preview-only fixture: preserves stylesheet ordering/specificity while aliasing
// hover/focus pseudo-classes to test attributes. Never copied to public/.
(async()=>{
 const cssURL=document.querySelector('link[rel="stylesheet"]').href;
 const css=await(await fetch(cssURL)).text();
 const style=document.createElement('style');
 style.textContent=css.replace(/:hover\b/g,':is(:hover,[data-qa-hover])').replace(/:focus-visible\b/g,':is(:focus-visible,[data-qa-focus])')+'\n*,*::before,*::after{transition:none!important;animation:none!important}';
 document.head.append(style);
 const panel=document.createElement('aside');panel.id='control-audit-panel';panel.style.cssText='position:fixed;top:0;right:0;z-index:1000;background:white;color:black;border:1px solid black;padding:8px;font:14px Arial;display:flex;gap:8px';
 panel.innerHTML='<button type="button" data-qa-state="default">Default styles</button><button type="button" data-qa-state="hover">Hover styles</button><button type="button" data-qa-state="focus">Keyboard focus styles</button><output id="control-audit-state">default</output>';
 document.body.append(panel);
 panel.querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>{
  document.querySelectorAll('a[href],button,summary,input').forEach(el=>{if(panel.contains(el))return;el.toggleAttribute('data-qa-hover',button.dataset.qaState==='hover');el.toggleAttribute('data-qa-focus',button.dataset.qaState==='focus');});
  document.getElementById('control-audit-state').textContent=button.dataset.qaState;
 }));
})();
