import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import config from './config.mjs';
import {sourceReferences} from './data.mjs';
import {srcDir,baseCss,documentPage} from './render.mjs';
import {makePages} from './eu-pages.mjs';

if(config.mode!=='eu-education-only')throw Error('This package supports the education-only offering.');
const project=fs.realpathSync(path.dirname(srcDir));
const out=path.resolve(project,'public');
// Regenerate ONLY this verified generated directory; never follow a symlink.
if(path.dirname(out)!==project||path.basename(out)!=='public')throw Error('Unsafe generated directory');
if(fs.existsSync(out)&&fs.lstatSync(out).isSymbolicLink())throw Error('Generated directory cannot be a symlink');
if(fs.existsSync(out))fs.rmSync(out,{recursive:true,force:true});
fs.mkdirSync(path.join(out,'assets/fonts'),{recursive:true});
for(const file of ['4x-valley-flat.svg','learning-preview.svg','magda-karapetyan.png','sanj-kumar.png','akash-ghadiyali.png'])fs.copyFileSync(path.join(srcDir,'assets',file),path.join(out,'assets',file));
fs.copyFileSync(path.join(srcDir,'assets/fonts/inter-latin.woff2'),path.join(out,'assets/fonts/inter-latin.woff2'));
fs.cpSync(path.join(srcDir,'assets/heroes'),path.join(out,'assets/heroes'),{recursive:true});
fs.cpSync(path.join(project,'licenses'),path.join(out,'licenses'),{recursive:true});
const icons=JSON.parse(fs.readFileSync(path.join(srcDir,'assets/icons.json'),'utf8'));
const symbols=Object.entries(icons.icons).map(([name,item])=>`<symbol id="${name}" viewBox="0 0 ${item.width||icons.width||24} ${item.height||icons.height||24}">${item.body.replaceAll('stroke-width="2"','stroke-width="1.75"')}</symbol>`).join('');
fs.writeFileSync(path.join(out,'assets/icons.svg'),`<svg xmlns="http://www.w3.org/2000/svg"><defs>${symbols}</defs></svg>`);
const logo=fs.readFileSync(path.join(srcDir,'assets/4x-valley-flat.svg'),'utf8');
const logoInner=logo.replace(/^[\s\S]*?<svg\b[^>]*>/,'').replace(/<\/svg>\s*$/,'');
fs.writeFileSync(path.join(out,'assets/favicon.svg'),`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 230 230"><rect width="230" height="230" rx="36" fill="#29103F"/><svg x="20" y="30" width="190" height="169" viewBox="248 292 199 169">${logoInner}</svg></svg>`);
const missing=[];
for(const [group,object] of Object.entries({company:config.company,contact:config.contact,social:config.social}))for(const [key,value] of Object.entries(object))if(!value)missing.push(group+'.'+key);
for(const [key,value] of Object.entries(config.legalApproved))if(!value)missing.push('legal.'+key);
const launchBlockers=[...missing,...Object.entries(config.review).filter(([,value])=>!value).map(([key])=>'review.'+key)];
const marketing=!!config.consent.meta.approved&&/^\d{5,25}$/.test(config.consent.meta.pixelId);
if(config.consent.meta.approved&&(!marketing||launchBlockers.length))throw Error('Meta requires a valid ID, completed operator/privacy/legal information and review before activation.');
const hash=value=>crypto.createHash('sha256').update(value).digest('hex').slice(0,10);
const available={functional:config.consent.functional,analytics:false,marketing};
const consentSettings={available,retentionDays:config.consent.retentionDays,metaPixelId:marketing?config.consent.meta.pixelId:'',signature:hash(JSON.stringify({policyVersion:config.consent.policyVersion,available,meta:marketing?config.consent.meta.pixelId:'none',purposes:'favorites-study;meta-pageview-audiences'}))};
const css=baseCss.replace(/url\([^)]*hero-background[^)]*\)/g,'none')+'\n'+fs.readFileSync(path.join(srcDir,'pages.css'),'utf8')+'\n'+fs.readFileSync(path.join(srcDir,'privacy.css'),'utf8');
const js=fs.readFileSync(path.join(srcDir,'app.js'),'utf8');
const privacy='(()=>{\n"use strict";\nconst CONSENT_SETTINGS='+JSON.stringify(consentSettings)+';\n'+fs.readFileSync(path.join(srcDir,'consent-core.mjs'),'utf8').replace(/^export /gm,'')+'\n'+fs.readFileSync(path.join(srcDir,'privacy.js'),'utf8')+'\n})();';
const assets={css:`styles.${hash(css)}.css`,js:`app.${hash(js)}.js`,privacy:`privacy.${hash(privacy)}.js`,consentSettings,staging:launchBlockers.length>0};
for(const [key,content] of [['css',css],['js',js],['privacy',privacy]])fs.writeFileSync(path.join(out,assets[key]),content);
const pages=makePages(consentSettings);
if(new Set(pages.map(p=>p.file)).size!==pages.length)throw Error('Duplicate page');
for(const page of pages)fs.writeFileSync(path.join(out,page.file),documentPage(page,page.body,assets));
const sitemap=pages.filter(p=>!p.retired&&!p.noindex&&!assets.staging).map(p=>`<url><loc>${config.origin.replace(/\/$/,'')}/${p.file==='index.html'?'':p.file}</loc></url>`).join('');
fs.writeFileSync(path.join(out,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemap}</urlset>`);
fs.writeFileSync(path.join(out,'robots.txt'),assets.staging?'User-agent: *\nDisallow: /\n':`User-agent: *\nAllow: /\nSitemap: ${config.origin}/sitemap.xml\n`);
fs.writeFileSync(path.join(out,'_redirects'),'/4xdesktop.aspx /platform-desktop.html 301\n/mt5-ios.aspx /platform-ios.html 301\n/android.aspx /platform-android.html 301\n/mt5-android.aspx /platform-android.html 301\n/IB-broker.aspx /about.html 301\n/become-ib.html /about.html 301\n');
const csp=`default-src 'self'; script-src 'self'${marketing?' https://connect.facebook.net':''}; style-src 'self' 'unsafe-inline'; img-src 'self' data:${marketing?' https://www.facebook.com':''}; font-src 'self'; media-src 'none'; connect-src 'self'${marketing?' https://www.facebook.com https://connect.facebook.net':''}; object-src 'none'; base-uri 'self'; frame-ancestors 'self'; form-action 'self'; upgrade-insecure-requests`;
fs.writeFileSync(path.join(out,'_headers'),`/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n  Content-Security-Policy: ${csp}\n${assets.staging?'  X-Robots-Tag: noindex, nofollow\n':''}`);
const legalSources=[
 ['https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:02002L0058-20091219','ePrivacy Article 5(3): terminal storage/access and exceptions; implemented through national law.'],
 ['https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng','GDPR Articles 7 and 13: consent, withdrawal and information duties.'],
 ['https://www.edpb.europa.eu/system/files/documents/2023-01/edpb_20230118_report_cookie_banner_taskforce_en.pdf','Cookie banner taskforce findings: positive action, first-layer rejection, no pre-ticked optional choices or deceptive presentation.'],
 ['https://www.esma.europa.eu/sites/default/files/2026-01/Finfluencers_factsheet_EN.pdf','Education/recommendation distinction, truthful presentation and disclosures. A disclaimer is insufficient for actual regulated advice.'],
 ['https://www.esma.europa.eu/publications-data/questions-answers/1982','CFD monetary-incentive Q&A. Original account-credit promotion removed; national product-intervention rules must be checked.'],
 ['https://europa.eu/youreurope/business/selling-in-eu/selling-goods-services/ecommerce-distance-selling/index_en.htm','Seller identity, total price, distance-contract and digital-content consumer information.'],
 ['https://eur-lex.europa.eu/eli/dir/2023/2673/oj/eng','Online withdrawal-function requirements; national measures apply from 19 June 2026. Actual contracting platform requires review.']
].map(([url,usedFor])=>({url,usedFor}));
const manifest={name:config.name,version:'2.1.0-eu-education',generatedAt:new Date().toISOString(),mode:config.mode,origin:config.origin,pageCount:pages.length,pages:pages.map(({body,...p})=>p),assets,staging:assets.staging,publicLaunchReady:!assets.staging,placeholdersPermitted:config.allowPlaceholders,placeholderFields:missing,launchBlockers,paidEnrolmentEnabled:false,legacyPortalConnected:false,externalRuntimeDependencies:marketing?[{type:'consented advertising only',url:'https://connect.facebook.net/en_US/fbevents.js'}]:[],sources:[...sourceReferences,...legalSources]};
fs.writeFileSync(path.join(project,'SITE_MANIFEST.json'),JSON.stringify(manifest,null,2));
fs.writeFileSync(path.join(project,'CONTENT_SOURCES.json'),JSON.stringify(manifest.sources,null,2));
console.log(JSON.stringify({pages:pages.length,output:out,staging:assets.staging,launchBlockers:launchBlockers.length,marketing,assets:{css:assets.css,js:assets.js,privacy:assets.privacy}}));
