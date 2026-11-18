export const CONSENT_KEY = '4xvalley:consent:v2';
export const OPTIONAL_KEYS = ['4xvalley:favorites:v1', '4xvalley:studied:v1'];

export function createConsentManager({storage, signature, available, retentionDays = 180, now = Date.now, onChange = () => {}}) {
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
