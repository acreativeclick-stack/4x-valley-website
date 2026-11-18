import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import config from '../src/config.mjs';

const code=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const cases=[];
function setup(fields={},valid=true){
 const events={},button={disabled:true,removeAttribute(name){if(name==='disabled')this.disabled=false;}},status={textContent:''};
 const form={dataset:{recipient:config.contact.email},fields,reportValidity:()=>valid,querySelector:selector=>selector==='[data-contact-submit]'?button:null,querySelectorAll:()=>[],addEventListener:(name,fn)=>{events[name]=fn;}};
 const nodes={'#contact-email-form':form,'#contact-form-status':status};
 const document={querySelector:s=>nodes[s]||null,querySelectorAll:()=>[],addEventListener(){}};
 const location={search:'',href:''};
 const context={document,location,window:{matchMedia:()=>({matches:false,addEventListener(){}}),addEventListener(){},ValleyConsent:{has:()=>false}},FormData:class{constructor(f){this.values=f.fields;}get(key){return this.values[key]??null;}},URLSearchParams,setTimeout,clearTimeout,console};
 vm.runInNewContext(code,context);
 return {button,status,location,submit(){let prevented=false;events.submit({preventDefault(){prevented=true;}});return prevented;}};
}
let form=setup({},false);
assert.equal(form.button.disabled,false);
assert.equal(form.submit(),true);
assert.equal(form.location.href,'');
cases.push('JavaScript enables the form; invalid inputs do not prepare a draft.');

const fields={name:'Zoë & Co',email:'learner@example.com',topic:'Courses and learning',message:'A question about EUR/USD & charts.\nPlease explain the next lesson.'};
form=setup(fields);
assert.equal(form.submit(),true);
const [target,query]=form.location.href.split('?');
assert.equal(decodeURIComponent(target),'mailto:contact@4xvalley.com');
const params=new URLSearchParams(query);
assert.equal(params.get('subject'),'4X Valley — Courses and learning');
assert.equal(params.get('body'),`Name: ${fields.name}\nEmail: ${fields.email}\n\n${fields.message}`);
cases.push('Valid enquiries prepare the supplied recipient, topic and complete message.');
assert.equal([...params.keys()].join(','),'subject,body');
assert.match(form.status.textContent,/review it and send it there/i);
assert.match(form.status.textContent,/has not sent the message/i);
cases.push('Unicode, ampersands and line breaks survive encoding; status never claims delivery.');

form=setup({...fields,topic:'',message:'Question &cc=other@example.com?subject=changed'});
form.submit();
const alternate=new URLSearchParams(form.location.href.split('?')[1]);
assert.equal(alternate.get('subject'),'4X Valley — General enquiry');
assert.equal(alternate.get('cc'),null);
assert.match(alternate.get('body'),/&cc=other@example.com/);
cases.push('Blank topics use General enquiry; message text cannot add URL headers.');

const report={passed:true,checkedAt:new Date().toISOString(),tests:cases.length,cases,recipient:config.contact.email,scope:'Actual website form handler in a simulated DOM with captured mailto navigation. No external email app was opened and no email was sent.'};
fs.writeFileSync(new URL('../CONTACT_FORM_TEST_REPORT.json',import.meta.url),JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
