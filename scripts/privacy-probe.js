// Local QA only. serve.mjs inserts this script ONLY with ?qa=1; never copied to public/.
(()=>{
 const key='4xvalley:consent:v2',optional=['4xvalley:favorites:v1','4xvalley:studied:v1'];
 const get=Storage.prototype.getItem,set=Storage.prototype.setItem;
 const access=[],violations=[],errors=[];
 function allowed(){try{return JSON.parse(get.call(localStorage,key))?.choices.functional===true;}catch{return false;}}
 for(const [method,original] of [['getItem',get],['setItem',set]])Storage.prototype[method]=function(k,...args){if(optional.includes(k)){const entry={method,key:k,allowed:allowed()};access.push(entry);if(!entry.allowed)violations.push(entry);}return original.call(this,k,...args);};
 addEventListener('error',event=>errors.push(event.message));
 addEventListener('DOMContentLoaded',()=>{
  const panel=document.createElement('details');panel.id='qa-panel';panel.style.cssText='padding:24px;background:#fff;color:#111;font:14px monospace;overflow-wrap:anywhere';
  panel.innerHTML='<summary>Local privacy test panel</summary><button id="qa-reset" type="button">Reset test consent and saved items</button><pre id="qa-observation" style="white-space:pre-wrap"></pre>';
  document.body.append(panel);
  document.getElementById('qa-reset').addEventListener('click',()=>{[key,...optional].forEach(k=>localStorage.removeItem(k));location.reload();});
  function update(){let record;try{record=JSON.parse(get.call(localStorage,key));}catch{}const data={consent:record,optionalKeys:optional.filter(k=>get.call(localStorage,k)!==null),access,violations,errors,remoteResources:performance.getEntriesByType('resource').map(r=>r.name).filter(u=>!u.startsWith(location.origin))};document.getElementById('qa-observation').textContent=JSON.stringify(data,null,2);}
  update();setInterval(update,150);
 });
})();
