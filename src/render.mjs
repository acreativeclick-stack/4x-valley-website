import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import config from './config.mjs';
import {consentMarkup} from './consent-markup.mjs';
import {getHeroMedia} from './hero-media.mjs';
import {programs,topics,trainers,lessons,benefits,platforms} from './data.mjs';

export const srcDir=path.dirname(fileURLToPath(import.meta.url));
export const approved=fs.readFileSync(path.join(srcDir,'approved-homepage.html'),'utf8');
export const e=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
export const icon=(name,cls='')=>`<svg class="icon ${e(cls)}" aria-hidden="true" focusable="false"><use href="./assets/icons.svg#${e(name)}"></use></svg>`;
export const link=(label,url,cls='text-link',attrs='')=>`<a class="${e(cls)}" href="${e(url)}"${/^https:/.test(url)?' target="_blank" rel="noopener"':''} ${attrs}>${label}</a>`;
export const btn=(label,url,kind='btn-primary')=>link(`${e(label)} ${icon(/^https:/.test(url)?'arrow-up-right':'arrow-right')}`,url,'btn '+kind);
export const placeholder=(name,label)=>`<span class="placeholder" data-placeholder="${e(name)}">[${e(label)}]</span>`;
export const companyName=()=>config.company.legalName?e(config.company.legalName):placeholder('company.legalName','Legal company name');
export function saveButton(key,name){return `<button class="save-button" type="button" data-save="${e(key)}" data-item-name="${e(name)}" aria-pressed="false" aria-label="Save ${e(name)} to Favorites">${icon('heart')}<span class="save-label">Save</span></button>`;}
export function art(program,index=1){
 const cover=`<div class="cover-label"><span>4X VALLEY / PROGRAMS</span><span>${String(index).padStart(2,'0')}</span></div>`;
 let inside='';
 if(program.art==='currency')inside='<div class="currency-art" aria-hidden="true"><span>EUR</span><span class="slash">/</span><span style="color:var(--up)">USD</span></div>';
 if(program.art==='candles')inside='<div class="cover-grid" aria-hidden="true"></div><div class="mini-candles" aria-hidden="true">'+Array.from({length:5},()=>'<i class="mini-candle"></i>').join('')+'</div>';
 if(program.art==='path')inside='<svg class="path-art" viewBox="0 0 300 140" aria-hidden="true"><path d="M15 118H91V84H166V49H247V16H285" fill="none" stroke="#F8F5ED" stroke-width="2"/><path d="M15 131H285M15 96H285M15 61H285M15 26H285" fill="none" stroke="#F8F5ED" opacity=".13"/><circle cx="91" cy="84" r="5" fill="#7A12D4" stroke="#F8F5ED" stroke-width="2"/><circle cx="166" cy="49" r="5" fill="#7A12D4" stroke="#F8F5ED" stroke-width="2"/><circle cx="247" cy="16" r="5" fill="#F8F5ED"/></svg>';
 return `<div class="program-art ${program.art==='currency'?'dark':program.art==='candles'?'lilac':'violet'}">${cover}${inside}<div class="cover-foot"><span>${e(program.label.toUpperCase())}</span><span>4X101</span></div></div>`;
}
export function programCard(program,index=1,attributes=''){return `<article class="catalog-program" ${attributes}><a class="program" href="${program.file}">${art(program,index)}<div class="program-info"><div><h3>${e(program.name)}</h3><p>Featured program</p></div>${icon('arrow-up-right')}</div></a>${saveButton('program:'+program.id,program.name)}</article>`;}
export function recording(lesson,attributes=''){return `<article class="recording-card" ${attributes}><a href="${lesson.file}"><span class="play-circle">${icon('play')}</span><span><strong>${e(lesson.name)}</strong><span class="meta">Recorded session / Part ${lesson.part}</span></span></a>${saveButton('lesson:'+lesson.key,lesson.name)}</article>`;}
export function trainerCards(){return `<div class="trainer-grid">${trainers.map((trainer,index)=>`<article class="trainer"><a href="trainer-${trainer.id}.html"><div class="trainer-portrait"><img src="./assets/${trainer.image}" alt="${e(trainer.name)}" width="200" height="264" loading="lazy"></div><div class="trainer-name"><div><h3>${e(trainer.name)}</h3><p>4X Valley trainer</p></div><span>${String(index+1).padStart(2,'0')}</span></div></a></article>`).join('')}</div>`;}
export function features(items=benefits){return `<ul class="bullet-list">${items.map(item=>`<li>${icon('check')}<span>${e(item)}</span></li>`).join('')}</ul>`;}
export function featureRows(items){return `<div class="feature-list">${items.map(([title,copy],index)=>`<div class="feature-row"><span class="number">${String(index+1).padStart(2,'0')}</span><div><h3>${e(title)}</h3><p>${e(copy)}</p></div></div>`).join('')}</div>`;}
export function riskNote(){return `<aside class="risk-note"><p>Trading can lead to losses. Educational examples do not promise financial results. ${link('Read the risk information','risk-disclosure.html','inline-link')}</p></aside>`;}
export function educationRiskWarning(){return `<aside class="site-risk-warning" id="education-risk-warning" aria-label="Risk warning"><div class="wrap"><p><strong>Education only.</strong> Forex and leveraged products carry a high risk of loss. Examples are illustrative and do not constitute personalised investment advice. Education does not guarantee trading profits. <a href="risk-disclosure.html">Read risk information</a>.</p></div></aside>`;}
export function topicRows(){return `<div class="topic-list">${topics.map(topic=>`<a class="topic-row" href="topic-${topic.id}.html"><div><strong>${e(topic.name)}</strong><p>${e(topic.intro)}</p></div>${icon('arrow-up-right')}</a>`).join('')}</div>`;}
export function faq(items){return `<div class="faq-list">${items.map(([q,a])=>`<details><summary>${e(q)}</summary><div><p>${e(a)}</p></div></details>`).join('')}</div>`;}
export function breadcrumb(title,parent){return `<nav class="breadcrumb" aria-label="Breadcrumb"><a href="index.html">Home</a>${icon('chevron-right')}${parent?`<a href="${e(parent.file)}">${e(parent.title)}</a>${icon('chevron-right')}`:''}<span aria-current="page">${e(title)}</span></nav>`;}
export function heroPicture(file){
 const media=getHeroMedia(file),home=file==='index.html';
 const imagePath=width=>'./assets/heroes/'+media.files[width].file;
 const sizes=home?'(max-width: 640px) calc(100vw - 40px), (max-width: 1400px) calc(100vw - 80px), 1320px':'(max-width: 800px) calc(100vw - 40px), (max-width: 1200px) 44vw, 600px';
 return `<figure class="hero-media${home?' hero-media-home':''}" data-hero="${e(media.key)}"><img data-hero-image="${e(media.key)}" src="${e(imagePath('1280'))}" srcset="${[640,1280,1920].map(w=>`${e(imagePath(String(w)))} ${w}w`).join(', ')}" sizes="${sizes}" width="${media.width}" height="${media.height}" alt="${e(media.alt)}" decoding="async" fetchpriority="high">${media.caption?`<figcaption>${e(media.caption)}</figcaption>`:''}</figure>`;
}
export function hero(title,intro,{label='4X Valley',dark=false,parent,actions=''}={}){return `<section class="page-hero${dark?' dark':''}"><div class="wrap">${breadcrumb(title,parent)}<div class="page-hero-layout"><div class="page-hero-copy"><p class="eyebrow">${e(label)}</p><h1>${e(title)}</h1><p class="lead">${e(intro)}</p>${actions?`<div class="hero-page-actions">${actions}</div>`:''}</div><!--PAGE_HERO_IMAGE--></div></div></section>`;}
export const section=(html,cls='')=>`<section class="content-section ${e(cls)}"><div class="wrap">${html}</div></section>`;
export const cta=(title='Keep your learning moving.',copy='Explore the library, meet the trainers, and choose your next step.',label='Browse the library',url='courses.html')=>section(`<div class="closing-inner"><div><h2>${e(title)}</h2><p>${e(copy)}</p></div>${btn(label,url)}</div>`);
function navA(label,file,active,id){return `<a id="${id}" href="${file}"${file===active?' aria-current="page"':''}>${label}</a>`;}
function drop(label,items,active){return `<details class="nav-dropdown${items.some(item=>item[1]===active)?' is-active':''}"><summary>${label} ${icon('chevron-down','icon-sm')}</summary><div class="dropdown-panel">${items.map(([name,file])=>link(e(name),file,'',file===active?'aria-current="page"':'')).join('')}</div></details>`;}
export function header(active){
 const courseLinks=[['Course library','courses.html'],['Recorded sessions','recorded-sessions.html'],...topics.map(t=>[t.name,`topic-${t.id}.html`]),['Favorites','favorites.html'],['Coming soon','coming-soon.html']];
 const tradingLinks=[['Read a chart','trading.html'],['Explore markets','markets.html']];
 const platformLinks=[['All platforms','platforms.html'],...platforms.map(p=>[p.name,p.file])];
 return `<a id="skip-to-content" class="skip" href="#main">Skip to content</a><header class="site-header"><div class="wrap header-inner"><a id="header-home" class="brand" href="index.html" aria-label="4X Valley home"><img src="./assets/4x-valley-flat.svg" width="80" height="68" alt="4X Valley"></a><nav class="desktop-nav" aria-label="Main navigation">${navA('About Us','about.html',active,'nav-about')}${drop('Courses',courseLinks,active)}${drop('Learning',tradingLinks,active)}${drop('Software',platformLinks,active)}${navA('Trainers','trainers.html',active,'nav-trainers')}${navA('Contact Us','contact.html',active,'nav-contact')}</nav><div class="header-actions">${navA('Member access','sign-in.html',active,'header-sign-in')}${link('Browse courses','courses.html','btn btn-light','id="header-browse-courses"')}</div><button class="mobile-menu-button" id="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-nav">Menu <span class="menu-open-icon">${icon('menu')}</span><span class="menu-close-icon" hidden>${icon('x')}</span></button></div><nav class="mobile-nav" id="mobile-nav" aria-label="Mobile navigation" hidden>${navA('About Us','about.html',active,'mobile-about')}<details><summary>Courses ${icon('chevron-down','icon-sm')}</summary>${courseLinks.map(([name,file])=>link(e(name),file,'')).join('')}</details><details><summary>Trading ${icon('chevron-down','icon-sm')}</summary>${tradingLinks.map(([name,file])=>link(e(name),file,'')).join('')}</details><details><summary>Platform ${icon('chevron-down','icon-sm')}</summary>${platformLinks.map(([name,file])=>link(e(name),file,'')).join('')}</details>${navA('Trainers','trainers.html',active,'mobile-trainers')}${navA('Membership','membership.html',active,'mobile-membership')}${navA('Copy-trading concepts','social-trading.html',active,'mobile-social')}${navA('Contact Us','contact.html',active,'mobile-contact')}${navA('Member access','sign-in.html',active,'mobile-sign-in')}${navA('New enrolments','register.html',active,'mobile-register')}</nav></header>`;
}
export function footer(active){
 const socials=[['Facebook','facebook'],['X / Twitter','x'],['Instagram','instagram'],['YouTube','youtube'],['LinkedIn','linkedin']];
 const list=(items)=>items.map(([name,file])=>link(e(name),file,'',file===active?'aria-current="page"':'')).join('');
 return `<footer class="footer" id="contact"><div class="wrap"><div class="footer-grid"><div class="footer-brand"><a id="footer-home" href="index.html" aria-label="4X Valley home"><img src="./assets/4x-valley-flat.svg" width="106" height="90" loading="lazy" alt="4X Valley"></a><p>Forex concepts, chart foundations,<br>and a clearer way to keep learning.</p></div><nav class="footer-column" aria-label="Learning links"><h3>Keep learning</h3>${list([['Explore courses','courses.html'],['Recorded sessions','recorded-sessions.html'],['Meet the trainers','trainers.html'],['Membership','membership.html'],['Favorites','favorites.html']])}</nav><nav class="footer-column" aria-label="Company links"><h3>About us</h3>${list([['Who we are','about.html'],['Careers','careers.html'],['Support','support.html'],['Contact us','contact.html'],['Operator information','legal-notice.html']])}</nav><nav class="footer-column" aria-label="Social links"><h3>Follow along</h3><div class="footer-socials">${socials.map(([name,key])=>link(e(name),config.social[key]||`social-links.html#${key}`,'')).join('')}</div></nav></div><p class="footer-risk">General education and illustrative examples. No personalised investment advice, trade signals, brokerage accounts or referral offers are provided through this website. Forex and leveraged products can cause significant losses; education does not guarantee an outcome.</p><div class="footer-bottom"><span>© ${new Date().getUTCFullYear()} 4X Valley. All rights reserved.</span><nav class="footer-legal" aria-label="Legal and page navigation">${link('Terms','terms.html','')}${link('Privacy','privacy.html','')}${link('Cookies','cookies.html','')}<button type="button" class="privacy-footer-button" data-consent-open>Cookie settings</button>${link('Consumer information','consumer-rights.html','')}${link('Risk information','risk-disclosure.html','')}${link('Sitemap','sitemap.html','')}<a id="back-to-top" href="#top">Back to top ${icon('arrow-up','icon-sm')}</a></nav></div></div></footer>`;
}
export function documentPage(page,body,assets){
 const canonical=config.origin.replace(/\/$/,'')+(page.file==='index.html'?'/':'/'+page.file);
 if(page.file!=='index.html'){
  if(!body.includes('<!--PAGE_HERO_IMAGE-->'))throw Error('Missing hero layout for '+page.file);
  body=body.replace('<!--PAGE_HERO_IMAGE-->',heroPicture(page.file));
 }
 return `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#29103F"><title>${e(page.title)} | 4X Valley</title><meta name="description" content="${e(page.description)}">${(page.noindex||assets.staging)?'<meta name="robots" content="noindex,follow">':''}<link rel="canonical" href="${e(canonical)}"><meta property="og:type" content="website"><meta property="og:title" content="${e(page.title)} | 4X Valley"><meta property="og:description" content="${e(page.description)}"><meta property="og:url" content="${e(canonical)}"><meta property="og:image" content="${e(config.origin.replace(/\/$/,'')+'/assets/learning-preview.svg')}"><link rel="icon" href="./assets/favicon.svg" type="image/svg+xml"><link rel="preload" href="./assets/fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="./${assets.css}"><script src="./${assets.privacy}" defer></script><script src="./${assets.js}" defer></script></head><body><div class="min-h-screen w-full" id="top">${header(page.file)}${educationRiskWarning()}<main id="main">${body}</main>${footer(page.file)}${consentMarkup(assets.consentSettings)}<div class="toast" id="site-toast" role="status" aria-live="polite" hidden></div></div></body></html>\n`;
}

export function localize(html){
 const prefix='https://vgbujcuwptvheqijyjbe.supabase.co/storage/v1/object/public/hmac-uploads/projects/62a12185-9d58-41e4-a1ca-2a89195c6aa3/';
 const urls={
  'brand-assets/assets-4x-valley-flat.svg/4x-valley-flat.svg':'4x-valley-flat.svg',
  'content-assets/hero-video-poster/hero-video-poster.jpg':'hero-video-poster.jpg',
  'content-assets/hero-background/hero-background.jpg':'hero-background.jpg',
  'content-assets/trainers-magda/magda-karapetyan.png':'magda-karapetyan.png',
  'content-assets/trainers-sanj/sanj-kumar.png':'sanj-kumar.png',
  'content-assets/trainers-akash/akash-ghadiyali.png':'akash-ghadiyali.png',
  'brand-assets/assets-avora-markets.png/avora-markets.png':'avora-markets.png'
 };
 for(const [url,file] of Object.entries(urls))html=html.replaceAll(prefix+url,'./assets/'+file);
 
 return html.replace(/<iconify-icon([^>]*)><\/iconify-icon>/g,(_,attrs)=>{const name=attrs.match(/icon="lucide:([^"]+)"/)?.[1];const cls=attrs.match(/class="([^"]+)"/)?.[1]||'';return icon(name||'circle-help',cls);});
}

export const baseCss=localize([...approved.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m=>m[1]).join('\n'));
export const candle=localize(approved.match(/<article class="lesson-card"[\s\S]*?<\/article>/)[0]);
export function legalContent(kind,title){
 const file=path.join(srcDir,'legal',kind+'.html');
 if(config.legalApproved[kind]){if(!fs.existsSync(file)||!fs.readFileSync(file,'utf8').trim())throw new Error(`Approved legal content is missing: src/legal/${kind}.html`);return fs.readFileSync(file,'utf8');}
 return `<div class="legal-body"><span class="draft-badge">Placeholder — approved text pending</span><div class="placeholder-panel"><h2>${e(title)}</h2><p>${placeholder('legal.'+kind,'Insert the approved '+title.toLowerCase()+' text here')}</p><dl><dt>Legal company name</dt><dd>${companyName()}</dd><dt>Registered address</dt><dd>${config.company.address?e(config.company.address):placeholder('company.address','Registered address')}</dd><dt>Governing jurisdiction</dt><dd>${config.company.jurisdiction?e(config.company.jurisdiction):placeholder('company.jurisdiction','Jurisdiction')}</dd><dt>Contact email</dt><dd>${config.contact.email?e(config.contact.email):placeholder('contact.email','Contact email')}</dd><dt>Effective date</dt><dd>${placeholder('legal.'+kind+'.effectiveDate','Effective date')}</dd></dl></div></div>`;
}
