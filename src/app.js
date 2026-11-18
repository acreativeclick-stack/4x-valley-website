(()=>{
 'use strict';
 const $=(selector,root=document)=>root.querySelector(selector);
 const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];
 const store={read(key){if(!window.ValleyConsent?.has('functional'))return [];try{return JSON.parse(localStorage.getItem('4xvalley:'+key+':v1')||'[]');}catch{return[];}},write(key,value){if(!window.ValleyConsent?.has('functional'))return false;try{localStorage.setItem('4xvalley:'+key+':v1',JSON.stringify(value));return true;}catch{return false;}}};
 let toastTimer;
 function notify(message){const area=$('#site-toast');if(!area)return;area.textContent=message;area.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{area.hidden=true;},3400);}
 const menuButton=$('#menu-toggle'), mobileNav=$('#mobile-nav');
 function closeMenu(restore=false){if(!menuButton||!mobileNav)return;const wasOpen=menuButton.getAttribute('aria-expanded')==='true';mobileNav.hidden=true;menuButton.setAttribute('aria-expanded','false');$('.menu-open-icon',menuButton)?.removeAttribute('hidden');$('.menu-close-icon',menuButton)?.setAttribute('hidden','');if(restore&&wasOpen)menuButton.focus();}
 menuButton?.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')==='true';mobileNav.hidden=open;menuButton.setAttribute('aria-expanded',String(!open));$('.menu-open-icon',menuButton)?.toggleAttribute('hidden',!open);$('.menu-close-icon',menuButton)?.toggleAttribute('hidden',open);});
 $$('#mobile-nav a').forEach(link=>link.addEventListener('click',()=>closeMenu()));
 document.addEventListener('keydown',event=>{if(event.key==='Escape'){closeMenu(true);$$('.nav-dropdown[open]').forEach(details=>{details.open=false;$('summary',details).focus();});}});
 document.addEventListener('click',event=>{$$('.nav-dropdown[open]').forEach(details=>{if(!details.contains(event.target))details.open=false;});});
 $$('.dropdown-panel a').forEach(link=>link.addEventListener('click',()=>{link.closest('details').open=false;}));
 window.matchMedia('(min-width:1321px)').addEventListener('change',event=>{if(event.matches)closeMenu();});

 const chart=$('#lesson-chart');
 if(chart){
  const buttons=$$('[data-chart-mode]');
  buttons.forEach(button=>button.addEventListener('click',()=>{const body=button.dataset.chartMode==='body';buttons.forEach(control=>control.setAttribute('aria-pressed',String(control===button)));$('#body-annotation').style.display=body?'':'none';$('#wick-annotation').style.display=body?'none':'';$('#chart-note').textContent=body?'The body shows where the price opened and closed. A hollow candle closes above its opening price.':'The wicks show the highest and lowest prices reached during this 15-minute period.';}));
  const small=window.matchMedia('(max-width:560px)');const adapt=()=>chart.setAttribute('viewBox',small.matches?'130 0 390 260':'0 0 520 260');adapt();small.addEventListener('change',adapt);
 }
 const seriesButtons=$$('[data-series]');
 function setSeries(part){seriesButtons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.series===part)));let count=0;$$('[data-part]').forEach(item=>{const show=part==='all'||item.dataset.part===part;item.hidden=!show;if(show)count++;});const status=$('#session-status');if(status)status.textContent=part==='all'?`Showing all ${count} sessions`:`Showing ${count} sessions from Part ${part}`;}
 seriesButtons.forEach(button=>button.addEventListener('click',()=>setSeries(button.dataset.series)));
 const initialSeries=new URLSearchParams(location.search).get('series');if(seriesButtons.length&&['2','3'].includes(initialSeries))setSeries(initialSeries);

 const search=$('#catalog-search'), typeButtons=$$('[data-catalog-type]');let catalogType='all';
 function filterCatalog(){if(!search)return;const query=search.value.trim().toLocaleLowerCase();let count=0;$$('[data-search-item]').forEach(item=>{const show=(catalogType==='all'||item.dataset.itemType===catalogType)&&item.dataset.searchItem.toLocaleLowerCase().includes(query);item.hidden=!show;if(show)count++;});$$('[data-catalog-group]').forEach(group=>{group.hidden=!$$('[data-search-item]',group).some(item=>!item.hidden);});const status=$('#catalog-status');if(status)status.textContent=`${count} ${count===1?'result':'results'}${query?' for “'+search.value.trim()+'”':''}`;$('#catalog-empty')?.toggleAttribute('hidden',count>0);}
 search?.addEventListener('input',filterCatalog);
 typeButtons.forEach(button=>button.addEventListener('click',()=>{catalogType=button.dataset.catalogType;typeButtons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));filterCatalog();}));
 if(search){const query=new URLSearchParams(location.search).get('q');if(query)search.value=query;filterCatalog();}

 function favorites(){const value=store.read('favorites');return Array.isArray(value)?value.filter(v=>typeof v==='string'):[];}
 function refreshSaved(){const saved=new Set(favorites());$$('[data-save]').forEach(button=>{const active=saved.has(button.dataset.save);button.setAttribute('aria-pressed',String(active));const label=$('.save-label',button);if(label)label.textContent=active?'Saved':'Save';button.setAttribute('aria-label',`${active?'Remove':'Save'} ${button.dataset.itemName||'item'}${active?' from Favorites':' to Favorites'}`);});if($('#favorites-list')){let count=0;$$('[data-favorite-item]').forEach(item=>{const visible=saved.has(item.dataset.favoriteItem);item.hidden=!visible;if(visible)count++;});$('#favorites-empty')?.toggleAttribute('hidden',count>0);const status=$('#favorites-status');if(status)status.textContent=`${count} saved ${count===1?'item':'items'} in this browser`;}}
 $$('[data-save]').forEach(button=>button.addEventListener('click',()=>{if(!window.ValleyConsent?.has('functional')){window.ValleyConsent?.open();notify('Allow functional storage to save items. Browsing remains available without it.');return;}const saved=new Set(favorites()),key=button.dataset.save,had=saved.has(key);if(had)saved.delete(key);else saved.add(key);if(!store.write('favorites',[...saved])){notify('This browser cannot save items right now.');return;}refreshSaved();notify(had?'Removed from Favorites.':'Saved to Favorites in this browser.');}));refreshSaved();window.addEventListener('valley:consentchange',refreshSaved);
 window.addEventListener('storage',event=>{if(event.key==='4xvalley:favorites:v1')refreshSaved();});

 const study=$('[data-study]');if(study){const key=study.dataset.study;function refresh(){const values=store.read('studied'),saved=Array.isArray(values)&&values.includes(key);study.setAttribute('aria-pressed',String(saved));$('.study-label',study).textContent=saved?'Marked as studied':'Mark as studied';$('#study-status').textContent=saved?'You marked this recording as studied in this browser.':'Your study marker is stored only in this browser.';}window.addEventListener('valley:consentchange',refresh);study.addEventListener('click',()=>{if(!window.ValleyConsent?.has('functional')){window.ValleyConsent?.open();notify('Allow functional storage to save a study marker.');return;}const values=store.read('studied'),saved=new Set(Array.isArray(values)?values:[]);if(saved.has(key))saved.delete(key);else saved.add(key);if(!store.write('studied',[...saved])){notify('This browser cannot save study markers right now.');return;}refresh();});refresh();}

 const planSummary=$('#selected-plan-summary');if(planSummary){const plan=new URLSearchParams(location.search).get('plan');const yearly=plan==='yearly',monthly=plan==='monthly';if(yearly||monthly){$('#selected-plan-name').textContent=yearly?'Trader Yearly':'Trader Monthly';$('#selected-plan-price').textContent=yearly?planSummary.dataset.yearly:planSummary.dataset.monthly;planSummary.hidden=false;}else planSummary.hidden=true;}
 const topicSelect=$('#contact-topic');if(topicSelect){const topic=new URLSearchParams(location.search).get('topic');if([...topicSelect.options].some(option=>option.value===topic))topicSelect.value=topic;}
 const contact=$('#contact-email-form');if(contact){$('[data-contact-submit]',contact)?.removeAttribute('disabled');contact.addEventListener('submit',event=>{event.preventDefault();if(!contact.reportValidity())return;const fields=new FormData(contact);const subject=`4X Valley — ${fields.get('topic')||'General enquiry'}`;const body=`Name: ${fields.get('name')}\nEmail: ${fields.get('email')}\n\n${fields.get('message')}`;location.href=`mailto:${encodeURIComponent(contact.dataset.recipient)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;$('#contact-form-status').textContent='Your email app will open a draft. Review it and send it there; this website has not sent the message.';});}
})();
