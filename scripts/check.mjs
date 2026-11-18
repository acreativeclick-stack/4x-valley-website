import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import config from '../src/config.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dir=path.join(root,'public');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'SITE_MANIFEST.json'),'utf8'));
const errors=[],warnings=[],graph=new Map(),documents=new Map(),ids=new Map(),external=new Set();
const files=fs.readdirSync(dir).filter(file=>file.endsWith('.html'));
for(const file of files){const html=fs.readFileSync(path.join(dir,file),'utf8');documents.set(file,html);const all=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);ids.set(file,new Set(all));const duplicates=all.filter((id,i)=>all.indexOf(id)!==i);if(duplicates.length)errors.push(`${file}: duplicate IDs ${duplicates}`);if((html.match(/<h1\b/g)||[]).length!==1)errors.push(`${file}: must contain exactly one h1`);if(!/<title>[^<]+<\/title>/.test(html))errors.push(`${file}: missing title`);if(!/name="description"/.test(html))errors.push(`${file}: missing description`);if(/<iconify-icon|cdn\.tailwindcss|supabase\.co|fonts\.googleapis|code\.iconify/.test(html))errors.push(`${file}: unbundled design dependency`);graph.set(file,new Set());}
function decode(s){return s.replaceAll('&amp;','&').replaceAll('&#39;',"'").replaceAll('&quot;','"');}
function exactFile(relative){const parts=relative.split('/').filter(Boolean);let current=dir;for(const part of parts){if(part==='..')return false;if(!fs.existsSync(current)||!fs.statSync(current).isDirectory())return false;const entries=fs.readdirSync(current);if(!entries.includes(part))return false;current=path.join(current,part);}return fs.existsSync(current)&&fs.statSync(current).isFile();}
let links=0,assetRefs=0,anchorRefs=0;
for(const [file,html] of documents){
 for(const match of html.matchAll(/<(a|link|script|img|source|video|use)\b[^>]*?\b(href|src|poster)="([^"]*)"/g)){
  const [full,tag,attribute,value]=match;const raw=decode(value);if(!raw){errors.push(`${file}: empty ${attribute}`);continue;}if(tag==='a')links++;else assetRefs++;
  if(raw==='#'){errors.push(`${file}: placeholder href="#"`);continue;}
  if(/^(https:|mailto:|tel:|data:)/.test(raw)){if(raw.startsWith('https:'))external.add(raw);continue;}
  if(/^(javascript:|http:|file:)/i.test(raw)){errors.push(`${file}: unsupported URL ${raw}`);continue;}
  const url=new URL(raw,'https://local.invalid/'+file);const relative=decodeURIComponent(url.pathname).replace(/^\//,'')||'index.html';
  if(!exactFile(relative)){errors.push(`${file}: missing local file ${raw}`);continue;}
  if(tag==='a'&&relative.endsWith('.html'))graph.get(file).add(relative);
  if(url.hash){anchorRefs++;const target=decodeURIComponent(url.hash.slice(1));let targetIds=ids.get(relative);if(!targetIds&&relative.endsWith('.svg')){targetIds=new Set([...fs.readFileSync(path.join(dir,relative),'utf8').matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]));}if(targetIds&&!targetIds.has(target))errors.push(`${file}: missing anchor ${raw}`);}
 }
 // Poster is a second attribute on video and is checked separately.
 for(const [,poster] of html.matchAll(/\bposter="([^"]+)"/g)){if(!/^https:|^data:/.test(poster)&&!exactFile(new URL(poster,'https://local.invalid/'+file).pathname.slice(1)))errors.push(`${file}: missing poster ${poster}`);}
 for(const img of html.matchAll(/<img\b([^>]+)>/g))if(!/\balt="[^"]*"/.test(img[1]))errors.push(`${file}: image without alt`);
 for(const [,srcset] of html.matchAll(/\bsrcset="([^"]+)"/g))for(const candidate of srcset.split(',')){const url=candidate.trim().split(/\s+/)[0];assetRefs++;if(!exactFile(new URL(url,'https://local.invalid/'+file).pathname.slice(1)))errors.push(`${file}: missing responsive image ${url}`);}
 if((html.match(/data-hero-image=/g)||[]).length!==1)errors.push(`${file}: expected one hero image`);
 for(const form of html.matchAll(/<(input|textarea|select)\b([^>]+)>/g)){const attrs=form[2],type=attrs.match(/type="([^"]+)"/)?.[1];if(['hidden','submit','button'].includes(type))continue;const id=attrs.match(/id="([^"]+)"/)?.[1];if(!id||(!html.includes(`for="${id}"`)&&!attrs.includes('aria-label=')))errors.push(`${file}: unlabeled form control`);}
}
for(const file of fs.readdirSync(dir).filter(f=>f.endsWith('.js'))){try{new vm.Script(fs.readFileSync(path.join(dir,file),'utf8'));}catch(error){errors.push(`${file}: ${error.message}`);}}
for(const file of fs.readdirSync(dir).filter(f=>f.endsWith('.css'))){const css=fs.readFileSync(path.join(dir,file),'utf8');for(const match of css.matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g)){const url=match[1];if(!url.startsWith('data:')&&!url.startsWith('https:')&&!exactFile(new URL(url,'https://local.invalid/'+file).pathname.slice(1)))errors.push(`${file}: missing CSS asset ${url}`);if(url.startsWith('https:'))errors.push(`${file}: remote CSS asset ${url}`);}}
const reached=new Set(),queue=['index.html'];while(queue.length){const page=queue.shift();if(reached.has(page))continue;reached.add(page);for(const next of graph.get(page)||[])if(!reached.has(next))queue.push(next);}
for(const file of files)if(file!=='404.html'&&!manifest.pages.find(p=>p.file===file)?.retired&&!reached.has(file))errors.push(`Unreachable page: ${file}`);
if(files.length!==manifest.pageCount)errors.push('Page manifest count does not match output');
const home=documents.get('index.html');if((home.match(/data-part=/g)||[]).length!==8)errors.push('Homepage must keep all 8 recordings');
if(!documents.get('terms.html').includes('noindex')&&!config.legalApproved.terms)errors.push('Placeholder legal pages must be noindex');
if(manifest.placeholderFields.length)warnings.push(`${manifest.placeholderFields.length} owner-supplied fields remain placeholders by request.`);
for(const [file,html] of documents){
 if(!html.includes('id="cookie-banner"')||!html.includes('id="cookie-preferences"'))errors.push(`${file}: missing privacy controls`);
 if(/traders become legends|250 credit|live trading sessions with experts|avoramarkets\.com|mindvalley|https:\/\/4xvalley\.com\/(auth[?"/]|register[?"/]|user\/)/i.test(html))errors.push(`${file}: excluded promotion or unreviewed account destination`);
 if(/<(?:script|img|source|iframe)\b[^>]*\bsrc="https?:/i.test(html))errors.push(`${file}: automatic external resource`);
 if(manifest.staging&&!html.includes('name="robots" content="noindex,follow"'))errors.push(`${file}: staging page is indexable`);
 if(html.indexOf(manifest.assets.privacy)>html.indexOf(manifest.assets.js))errors.push(`${file}: privacy must initialise before optional storage`);
}
if(manifest.launchBlockers.length)warnings.push('Private review build: public launch remains blocked by '+manifest.launchBlockers.length+' configuration/review items.');
if(process.argv.includes('--release')&&manifest.launchBlockers.length)errors.push('Public release blocked: complete and review SITE_MANIFEST.json launchBlockers.');
const report={passed:errors.length===0,checkedAt:new Date().toISOString(),pages:files.length,linksChecked:links,assetReferencesChecked:assetRefs,anchorReferencesChecked:anchorRefs,reachablePages:reached.size,externalDestinations:[...external].sort(),warnings,errors};
fs.writeFileSync(path.join(root,'TEST_REPORT.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify({passed:report.passed,pages:report.pages,linksChecked:links,assetReferencesChecked:assetRefs,anchorReferencesChecked:anchorRefs,reachablePages:reached.size,warnings,errors},null,2));
if(errors.length)process.exitCode=1;

