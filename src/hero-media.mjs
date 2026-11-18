import fs from 'node:fs';

const images=JSON.parse(fs.readFileSync(new URL('./hero-images.json',import.meta.url),'utf8'));
export const pageHeroImages={
 'index.html':'study','about.html':'community','courses.html':'library',
 'recorded-sessions.html':'library',
 'course-forex-mystery-hub.html':'research','course-tradessmart-fx.html':'chart',
 'course-forex-success-path.html':'library',
 'topic-trading-basics.html':'study','topic-technical-analysis.html':'chart',
 'topic-fundamental-analysis.html':'research','topic-risk-management.html':'risk',
 'topic-trading-strategies.html':'risk','trading.html':'chart','markets.html':'research',
 'trainers.html':'classroom','trainer-magda-karapetyan.html':'classroom',
 'trainer-sanj-kumar.html':'classroom','trainer-akash-ghadiyali.html':'classroom',
 'membership.html':'library','membership-monthly.html':'library','membership-yearly.html':'library',
 'sign-in.html':'privacy','register.html':'study','forgot-password.html':'privacy',
 'platforms.html':'devices','platform-desktop.html':'devices','platform-ios.html':'devices','platform-android.html':'devices',
 'become-ib.html':'support','social-trading.html':'community','support.html':'support',
 'contact.html':'support','careers.html':'classroom','favorites.html':'library',
 'coming-soon.html':'library','terms.html':'privacy','privacy.html':'privacy',
 'risk-disclosure.html':'risk','legal-notice.html':'privacy','consumer-rights.html':'privacy',
 'cookies.html':'privacy','social-links.html':'community','404.html':'support','sitemap.html':'library'
};
export function getHeroMedia(file){
 const key=file.startsWith('lesson-juneed-')?'library':pageHeroImages[file];
 if(!key||!images[key])throw Error('Missing hero image for '+file);
 return {key,...images[key]};
}
