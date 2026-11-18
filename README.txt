4X VALLEY — EU EDUCATION WEBSITE HANDOFF
Version 2.2.0 | 18 November 2026

STATUS: READY FOR PRIVATE TECHNICAL REVIEW / HOSTING SETUP
NOT CLEARED FOR PUBLIC EU LAUNCH WHILE OWNER DETAILS / REVIEWS ARE PENDING.

The owner confirmed education only, across all EU countries, and authorised
placeholders. This supersedes the previous broker/membership promotion build.
Use this version of the package. The online design prototype is an older draft.

DELIVERABLE
52 responsive static HTML pages, local brand logo, font, icons, portraits and
an original SVG teaching visual. No npm dependencies or production Node server.
Upload ONLY the CONTENTS of public/ as a static site. Keep source, test reports,
configuration and this handoff outside the public document root.

The pages include the full catalogue, 3 programs, 5 public topic guides,
8 recording-information pages, people, software references, access information,
support/contact, favorites, sitemap, 404 and 6 legal/privacy information pages.
The former IB route is a noindex retired stub and redirects to About when
redirect rules are applied. It is deliberately absent from navigation/sitemaps.

SCOPE CHANGES
- Removed account-credit bonuses, broker promotions/referrals, IB marketing,
  performance/legends claims, unverified expert and 24/7 service claims.
- Replaced the unrelated external video with a local, original chart diagram.
- Renamed the program display title Forex Learning Path. The older filename is
  retained so existing links still resolve; this is not a promise of outcomes.
- Copy trading is a general information page, without a service/execution link.
- Kept general educational materials and illustrative chart interaction.
- Paid offers, prices, account sign-in/reset and lesson-playback portal links
  are not enabled. The old portal and actual recordings were not certified.
  Public information pages explain this honestly. No fake forms or payments.

COOKIE / DEVICE-STORAGE CONTROLS
First layer: Reject all, Accept all, Manage preferences. Reject and Accept use
the same size and styling. No pre-selected optional purposes, cookie wall or
scroll-to-consent. Closing preferences gives no consent. Footer Cookie settings
and the persistent Privacy choices button reopen the panel on every page.

Essential: local privacy-choice record, without a visitor identifier.
Optional functional: local Favorites and study markers. Neither is read or
written before permission; withdrawal removes both. Refusing does not block
browsing. Legacy saved items are cleared when no valid permission exists.

No analytics or advertising provider is active. These categories are disabled.
Accept all grants only currently available purposes, not unspecified future
vendors. Meta has no configured ID, no noscript pixel and no automatic request.
A dormant, consent-gated loader is in source. Do not enable it simply to run
ads: complete the privacy/vendor/transfer review, policies and launch checks,
supply a real ID, then test its real behaviour and cookies before publishing.
The build rejects activation while required fields/reviews are incomplete.
Adding a provider/ID or changing the policy version changes the signature and
requires fresh consent. Meta defaults/autoconfiguration are disabled in code;
do not enable automatic advanced matching or add a separate tag manager/pixel.
Marketing withdrawal revokes consent, removes known first-party Meta cookies
and reloads the active vendor context. Earlier permitted requests cannot be
undone. Other tags, server-side events, extensions and backend trackers are
outside this package and must be audited separately.

Choice expiry is 180 days, a design setting rather than a uniform EU legal rule.
Missing/invalid/expired records or storage-write failures keep optional purposes
off. If a browser blocks all storage modification, persistent withdrawal may
also require clearing that site's data in the browser. Test supported browsers.
Consent evidence is local only; this package is not a server-side consent log.

PREVIEW AND REBUILD
Use Node.js 18+ (a supported Node LTS is preferable). No npm install is needed.
  npm run build
  npm test
  npm run check
  npm run preview
Open http://127.0.0.1:8743/ . Use HTTP rather than file:// for SVG sprite support.

The build safely recreates only its verified generated public/ directory.
Edit src/config.mjs, src/data.mjs, src/eu-pages.mjs, src/render.mjs,
src/pages.css, src/privacy.css, src/app.js and the consent source modules.
src/approved-homepage.html retains only base styles and the teaching card.
Hashed CSS/JS filenames prevent stale asset reuse. The deployable build has no
design-tool/CDN/font/video dependency and no automatic third-party requests.

scripts/privacy-probe.js is local QA instrumentation, not deployed. The local
preview server adds it only for ?qa=1, showing observed storage access/resource
requests in the Local privacy test panel. Its reset button clears disposable
test consent/saved data only for this localhost origin.

HOSTING
1. Use a separate password-protected staging hostname for this review build.
   noindex/robots exclusions are supplied; they are NOT access protection.
2. Back up the existing site and route configuration before a production change.
   Do not overwrite an existing ASP.NET web.config, account app or database.
3. Upload public/ contents to a clean static document root. Remove superseded
   generated HTML/assets from that deployment so old promotions do not remain.
4. Apply _headers and _redirects where supported; they are not universal server
   configuration. Merge the matching hosting-examples configuration on Apache,
   IIS or NGINX. Preserve existing application routes outside this static site.
5. Apply HTTPS, correct MIME types, 404 handling, privacy CSP and crawler rules.
   The default CSP allows local resources only, with media blocked. It does not
   itself implement consent. Do not weaken it to insert unreviewed tags.
6. Test actual response headers, links, consent, mobile navigation and caching
   on the intended host. Host/plugin-injected tracking must be absent or gated.

PUBLIC RELEASE GATE
SITE_MANIFEST.json lists 13 placeholder fields and 3 uncompleted review flags.
Fill the operator/contact details and approved legal fragments in src/legal/:
terms.html, privacy.html, risk.html, notice.html, consumer.html.
Set the corresponding legalApproved flags only after the text is approved.
Complete operator, actual curriculum and target-country requirements reviews.
Review rights/permission for trainer portraits and confirm profile identities.
Review hosting logs, processors, retention and transfers; no identity is guessed.
Rebuild, rerun tests, then run:
  npm run check:release
It intentionally fails while launch blockers remain. All pages are currently
noindex and robots disallows crawling; the XML sitemap stays empty until ready.

Even a passing configuration check is not legal approval for all 27 EU states.
See EU_REVIEW_AND_LAUNCH_REQUIREMENTS.txt for limitations and official sources.
Paid enrolment/portal links remain disabled even after filling legal fields:
reconnecting them is a separate implementation and review, not a config toggle.

TEST EVIDENCE
TEST_REPORT.json: structural links, assets, anchors, excluded promotions,
privacy controls and staging checks. CONSENT_TEST_REPORT.json: consent engine,
expiry, blocked storage and Meta loader tested with simulated network only.
BROWSER_QA.json: earlier 17 November responsive/UI/storage checks and limits.
CONTROL_VISIBILITY_AUDIT.json: 2.0.1 text visibility regression checks for all
52 pages, plus expanded menus and privacy preferences.
RISK_WARNING_AUDIT.json: current 2.2.0 coverage of the warning, page layout and
default control visibility at six viewport widths on every page.
HERO_IMAGE_AUDIT.json: current hero-image loading, responsive sizes and placement.
HERO_IMAGE_PROVENANCE.json: Magnific creations, page mapping and credit costs.
SOCIAL_LINKS_AUDIT.json: Facebook/Instagram page sections and shared footer links.
RISK_PAGE_AUDIT.json: draft-panel removal on the Risk information page.
Changed pages are rechecked at six widths. Unchanged pages retain prior browser
checks after SHA-256 byte-identity checks; audit records identify the baseline.
review-previews/: current desktop/mobile screenshots. FILE_MANIFEST.sha256:
per-file integrity. ZIP verification/checksums accompany the archives.

The package is a technical implementation and conservative content revision.
It does not certify the business, unreviewed course videos or public campaigns
as lawful in every country. No live deployment or ad campaign was launched.

VISIBILITY FIX — 18 NOVEMBER 2026
Prose-link colours now exclude button components. This restores the labels on
10 primary buttons. Small labels on purple program cards use full opacity.
CONTROL_VISIBILITY_AUDIT.json records rendered contrast/visibility checks and
local hover/focus stylesheet checks: 364 page/state/viewport combinations,
with no failures, plus 7 shared-control checks. Desktop (1366px) and mobile
(390px) cover default, hover and focus rules; tablet (768px) covers default.
Hover/focus rules use equal-specificity attribute aliases in a preview-only
fixture. Native keyboard focus was also sampled on the documentation button.
Its default label contrast is 7.33:1. The QA fixture is not deployed.

EDUCATION / RISK NOTICE — VERSION 2.0.2
Every page displays the approved warning directly below the navigation, before
its main content. It is ordinary visible page content, with no dismissal or
consent dependency, and links to risk-disclosure.html. This is a conservative
presentation choice, not a statement that every education-only EU website is
legally required to use this banner. The public release gate above still applies.

HERO IMAGERY — VERSION 2.1.0
Ten original editorial images were generated through Magnific MCP in the
4X Valley project, using Google Nano Banana 2.1, at a total cost of 650 credits.
Every page has an image matched to its topic. The homepage uses a wide study
scene; inner pages place the image beside the text and stack it below on mobile.
Images use local, content-hashed WebP files at 640, 1280 and 1920 pixels wide.
No image depends on Magnific or another remote service when the site runs.
Generated people and interfaces are illustrative, not named staff or actual
platform screenshots. Existing trainer portraits and software reference links
remain in their respective content sections. Synthetic diagrams in photographs
are decorative; the separate candle lesson remains the teaching diagram.
Full-resolution PNG masters are saved beside this project in
../generated-hero-masters/ and retained in the Magnific 4X Valley project.
Upload only public/ contents. Image masters are not needed by the deployed site.

CONTACT FORM — VERSION 2.2.0
The Contact page prepares an email draft to contact@4xvalley.com. The visitor
reviews and sends it through their own email app. The website does not send or
store the enquiry and must never display a server-delivery success claim.
A configured email app is needed. Direct website delivery requires a separate
mail/form service integration; no such provider is configured in this package.
CONTACT_FORM_TEST_REPORT.json covers validation and exact draft content using
a simulated DOM with intercepted mailto navigation; no real email was sent.
CONTACT_FORM_AUDIT.json records the actual rendered form and native validation.
