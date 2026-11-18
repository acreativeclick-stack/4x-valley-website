import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createConsentManager,CONSENT_KEY,OPTIONAL_KEYS} from '../src/consent-core.mjs';
let passed=0;
const results=[];
function test(name,fn){fn();passed++;results.push(name);}
function setup(seed={},options={}){
 const data=new Map(Object.entries(seed)),access=[];let time=100000000;
 const storage={getItem(k){access.push(['get',k]);return data.get(k)||null;},setItem(k,v){if(options.fail)throw Error('Denied');access.push(['set',k]);data.set(k,v);},removeItem(k){access.push(['remove',k]);data.delete(k);}};
 const manager=createConsentManager({storage,signature:'policy-a',available:{functional:true,analytics:false,marketing:!!options.marketing},now:()=>time,...options});
 return {manager,data,access,advance:ms=>time+=ms,storage};
}
test('No stored choice grants nothing; legacy functional data is deleted without reading it',()=>{const s=setup({[OPTIONAL_KEYS[0]]:'["old"]'});assert.equal(s.manager.has('functional'),false);assert.equal(s.data.has(OPTIONAL_KEYS[0]),false);assert.deepEqual(s.access.filter(([type])=>type==='get').map(([,key])=>key),[CONSENT_KEY]);});
test('Accept enables only described available categories',()=>{const s=setup();assert.equal(s.manager.choose('accept'),true);assert.deepEqual(s.manager.current().choices,{functional:true,analytics:false,marketing:false});});
test('Reject preserves only the essential refusal and purges optional data',()=>{const s=setup();s.manager.choose('accept');s.data.set(OPTIONAL_KEYS[0],'["course"]');s.manager.choose('reject');assert.equal(s.data.has(OPTIONAL_KEYS[0]),false);assert.equal(s.manager.current().action,'reject');assert.equal(s.manager.has('functional'),false);});
test('Custom preferences are granular and unavailable purposes cannot be enabled',()=>{const s=setup({}, {marketing:true});s.manager.choose('custom',{functional:true,analytics:true,marketing:false});assert.deepEqual(s.manager.current().choices,{functional:true,analytics:false,marketing:false});});
test('Consent expires in an open tab and purges functional data',()=>{const s=setup();s.manager.choose('accept');s.data.set(OPTIONAL_KEYS[1],'["lesson"]');s.advance(181*86400000);assert.equal(s.manager.has('functional'),false);assert.equal(s.data.has(OPTIONAL_KEYS[1]),false);});
test('Changed vendor/policy signature requires a new choice',()=>{const s=setup();s.manager.choose('accept');const manager=createConsentManager({storage:s.storage,signature:'policy-b',available:{functional:true,analytics:false,marketing:false},now:()=>100000000});assert.equal(manager.current(),null);});
test('Malformed, forged, future or expired records fail closed',()=>{for(const value of ['{bad','null',JSON.stringify({schema:2,signature:'policy-a',createdAt:99999999999,expiresAt:999999999999,action:'accept',choices:{functional:true,analytics:true,marketing:true}})])assert.equal(setup({[CONSENT_KEY]:value}).manager.current(),null);});
test('A denied storage write cannot activate optional purposes',()=>{const s=setup({}, {fail:true,marketing:true});assert.equal(s.manager.choose('accept'),false);assert.equal(s.manager.has('marketing'),false);assert.equal(s.manager.has('functional'),false);});
test('A failed withdrawal write removes the prior grant where deletion remains possible',()=>{const s=setup({}, {marketing:true});s.manager.choose('accept');s.storage.setItem=()=>{throw Error('Quota denied');};assert.equal(s.manager.choose('reject'),false);assert.equal(s.data.has(CONSENT_KEY),false);assert.equal(s.manager.has('marketing'),false);});
test('Cross-tab withdrawal clears saved items in the receiving tab',()=>{const s=setup();s.manager.choose('accept');s.data.set(OPTIONAL_KEYS[0],'["course"]');const v=JSON.parse(s.data.get(CONSENT_KEY));v.choices.functional=false;v.action='reject';s.data.set(CONSENT_KEY,JSON.stringify(v));s.manager.sync();assert.equal(s.manager.has('functional'),false);assert.equal(s.data.has(OPTIONAL_KEYS[0]),false);});

// Exercise the actual browser loader without sending any real network requests.
function loader(marketing){
 const controls=new Map(),listeners=new Map(),requests=[],calls=[];const data=new Map();let reloads=0;
 const element=id=>{if(!controls.has(id))controls.set(id,{hidden:true,checked:false,disabled:false,open:false,textContent:'',addEventListener(type,fn){this[type]=fn;},showModal(){this.open=true;},close(){this.open=false;},focus(){},remove(){}});return controls.get(id);};
 const rejects=[element('reject-banner'),element('reject-dialog')],accepts=[element('accept-banner'),element('accept-dialog')];
 rejects.forEach(v=>v.dataset={consentAction:'reject'});accepts.forEach(v=>v.dataset={consentAction:'accept'});const save=element('save');save.dataset={consentAction:'custom'};
 const document={hidden:false,activeElement:null,cookie:'',head:{append(script){requests.push(script.src);}},getElementById:element,querySelectorAll(selector){return selector==='[data-consent-action]'?[...rejects,...accepts,save]:[];},createElement(){return {};},addEventListener(){}};
 const window={localStorage:{getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)},addEventListener(type,fn){listeners.set(type,fn);},dispatchEvent(){}};
 const context={document,window,location:{hostname:'example.test',reload(){reloads++;}},CustomEvent:class{},setInterval(){},setTimeout(){},CONSENT_SETTINGS:{signature:'loader-test',available:{functional:true,analytics:false,marketing},retentionDays:180,metaPixelId:marketing?'123456789':''}};
 vm.runInNewContext(fs.readFileSync(new URL('../src/consent-core.mjs',import.meta.url),'utf8').replace(/^export /gm,'')+'\n'+fs.readFileSync(new URL('../src/privacy.js',import.meta.url),'utf8'),context);
 return {controls,requests,calls,window,accept:()=>accepts[0].click(),reject:()=>rejects[0].click(),save:()=>save.click(),reloads:()=>reloads};
}
test('Unconfigured Meta stays absent before and after Accept all',()=>{const s=loader(false);assert.deepEqual(s.requests,[]);s.accept();assert.deepEqual(s.requests,[]);});
test('Configured Meta stays blocked for rejection and functional-only preferences',()=>{const s=loader(true);s.reject();assert.deepEqual(s.requests,[]);s.controls.get('consent-functional').checked=true;s.save();assert.deepEqual(s.requests,[]);});
test('Marketing grant loads Meta once; withdrawal revokes and reloads the vendor context',()=>{const s=loader(true);assert.deepEqual(s.requests,[]);s.accept();assert.deepEqual(s.requests,['https://connect.facebook.net/en_US/fbevents.js']);s.accept();assert.equal(s.requests.length,1);s.reject();assert.equal(s.reloads(),1);assert.ok(s.window.fbq.queue.some(args=>args[0]==='consent'&&args[1]==='revoke'));});
const report={passed:true,checkedAt:new Date().toISOString(),tests:passed,cases:results,scope:'Consent engine and actual Meta loader with a simulated DOM/network sink. No real Pixel ID or external Meta request was used.'};
fs.writeFileSync(new URL('../CONSENT_TEST_REPORT.json',import.meta.url),JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
