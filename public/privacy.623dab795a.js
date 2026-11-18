(()=>{
"use strict";
const CONSENT_SETTINGS={"available":{"functional":true,"analytics":false,"marketing":false},"retentionDays":180,"metaPixelId":"","signature":"738409b721"};
const CONSENT_KEY = '4xvalley:consent:v2';
const OPTIONAL_KEYS = ['4xvalley:favorites:v1', '4xvalley:studied:v1'];

function createConsentManager({storage, signature, available, retentionDays = 180, now = Date.now, onChange = () => {}}) {
  let record = null;
  const lifetime = retentionDays * 86400000;
  const denied = () => ({functional:false, analytics:false, marketing:false});
  const purge = () => {for (const key of OPTIONAL_KEYS) {try {storage.removeItem(key);} catch {}}};
  function valid(value) {
    return value && value.schema === 2 && value.signature === signature &&
      Number.isFinite(value.createdAt) && value.createdAt <= now() + 60000 &&
      Number.isFinite(value.expiresAt) && value.expiresAt > now() &&
      value.expiresAt > value.createdAt && value.expiresAt - value.createdAt <= lifetime &&
      ['accept','reject','custom'].includes(value.action) &&
      ['functional','analytics','marketing'].every(key => typeof value.choices?.[key] === 'boolean' && (!value.choices[key] || available[key]));
  }
  try {const value = JSON.parse(storage.getItem(CONSENT_KEY)); if(valid(value)) record = value;} catch {}
  if(!record?.choices.functional) purge();
  function refresh() {
    if(record && !valid(record)) {record = null; purge(); try {storage.removeItem(CONSENT_KEY);} catch {} onChange(null);}
  }
  function choose(action, requested = {}) {
    const choices = denied();
    for(const key of Object.keys(choices)) choices[key] = !!available[key] && (action === 'accept' || (action === 'custom' && requested[key] === true));
    const value = {schema:2, signature, createdAt:now(), expiresAt:now()+lifetime, action, choices};
    try {storage.setItem(CONSENT_KEY, JSON.stringify(value));} catch {record=null; try {storage.removeItem(CONSENT_KEY);} catch {} purge(); onChange(null); return false;}
    record=value;
    if(!choices.functional) purge();
    onChange(value);
    return true;
  }
  return {
    has(key) {refresh(); return record?.choices[key] === true;},
    current() {refresh(); return record ? {...record, choices:{...record.choices}} : null;},
    choose,
    sync() {try {const value=JSON.parse(storage.getItem(CONSENT_KEY));record=valid(value)?value:null;} catch {record=null;} if(!record?.choices.functional)purge();onChange(record);}
  };
}

// Bundled after consent-core.mjs. CONSENT_SETTINGS is inserted by the build.
const banner=document.getElementById('cookie-banner');
const dialog=document.getElementById('cookie-preferences');
const launcher=document.getElementById('privacy-launcher');
const privacyStatus=document.getElementById('privacy-status');
let lastFocus, metaLoaded=false, previousMarketing=false;
let safeStorage;
try {safeStorage=window.localStorage;} catch {safeStorage={getItem(){throw Error('Storage unavailable');},setItem(){throw Error('Storage unavailable');},removeItem(){}};}
function clearMetaCookies() {
  for(const name of ['_fbp','_fbc']) {
    document.cookie=name+'=; Max-Age=0; Path=/; SameSite=Lax';
    const host=location.hostname.split('.');
    for(let i=0;i<host.length-1;i++) document.cookie=name+'=; Max-Age=0; Path=/; Domain=.'+host.slice(i).join('.')+'; SameSite=Lax';
  }
}
function applyMarketing(allowed) {
  if(allowed && CONSENT_SETTINGS.available.marketing && !metaLoaded) {
    // Never inserted until a positive, successfully stored marketing choice.
    const fbq=window.fbq=function(){fbq.callMethod?fbq.callMethod.apply(fbq,arguments):fbq.queue.push(arguments);};
    fbq.queue=[];fbq.loaded=true;fbq.version='2.0';window._fbq=fbq;
    fbq('consent','grant');fbq('set','autoConfig',false,CONSENT_SETTINGS.metaPixelId);
    fbq('init',CONSENT_SETTINGS.metaPixelId);fbq('track','PageView');
    const script=document.createElement('script');script.id='consented-meta-pixel';script.async=true;script.src='https://connect.facebook.net/en_US/fbevents.js';document.head.append(script);
    metaLoaded=true;
  }
  if(!allowed) {
    if(metaLoaded) {window.fbq?.('consent','revoke');document.getElementById('consented-meta-pixel')?.remove();}
    clearMetaCookies();
    if(previousMarketing && metaLoaded && manager.current()) location.reload();
  }
  previousMarketing=allowed;
}
function changed(record) {
  banner.hidden=!!record;launcher.hidden=!record;
  applyMarketing(record?.choices.marketing===true);
  window.dispatchEvent(new CustomEvent('valley:consentchange',{detail:record?.choices||{functional:false,analytics:false,marketing:false}}));
}
const manager=createConsentManager({storage:safeStorage,signature:CONSENT_SETTINGS.signature,available:CONSENT_SETTINGS.available,retentionDays:CONSENT_SETTINGS.retentionDays,onChange:changed});
function openPreferences() {
  lastFocus=document.activeElement;
  const choices=manager.current()?.choices||{};
  for(const key of ['functional','analytics','marketing']) {
    const input=document.getElementById('consent-'+key);input.checked=!!choices[key];input.disabled=!CONSENT_SETTINGS.available[key];
  }
  if(!dialog.open) dialog.showModal();
}
function closePreferences() {dialog.close();lastFocus?.focus();}
function decide(action) {
  const choices={};for(const key of ['functional','analytics','marketing']) choices[key]=document.getElementById('consent-'+key).checked;
  if(manager.choose(action,choices)) {
    if(dialog.open) closePreferences();
    privacyStatus.textContent=action==='reject'?'Optional storage rejected. Your privacy choice was saved.':'Your privacy choices were saved.';
    setTimeout(()=>{privacyStatus.textContent='';},5000);
  } else privacyStatus.textContent='Your choice could not be saved. Optional storage and tracking remain off. Check your browser storage settings.';
}
document.querySelectorAll('[data-consent-open]').forEach(button=>button.addEventListener('click',openPreferences));
document.querySelectorAll('[data-consent-action]').forEach(button=>button.addEventListener('click',()=>decide(button.dataset.consentAction)));
document.getElementById('close-preferences').addEventListener('click',closePreferences);
dialog.addEventListener('cancel',()=>{lastFocus?.focus();});
window.ValleyConsent={has:category=>manager.has(category),open:openPreferences};
window.addEventListener('storage',event=>{if(event.key===CONSENT_KEY||event.key===null)manager.sync();});
window.addEventListener('focus',()=>manager.current());
document.addEventListener('visibilitychange',()=>{if(!document.hidden)manager.current();});
setInterval(()=>manager.current(),60000);
changed(manager.current());

})();