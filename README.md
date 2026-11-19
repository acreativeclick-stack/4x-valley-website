# 4X Valley education website

Version **2.2.1**. Responsive static website with 52 pages, local brand assets,
Magnific hero images, risk information and opt-in device-storage controls.

This snapshot is prepared for private technical review and hosting setup.
The owner-approved legal/contact placeholders and release review gates remain
listed in `SITE_MANIFEST.json` and `README.txt`.

## Deployment packages

- [Full source and deployment package](packages/4X_Valley_EU_Education_Deployment_Package.zip)
- [Upload-ready static site](packages/4X_Valley_EU_Education_Upload_Ready.zip)
- [ZIP SHA-256 checksums](packages/SHA256SUMS.txt)

Upload the **contents of `public/`** to the static document root, or extract the
upload-ready ZIP there. Keep source files, reports and package archives outside
the public document root. Read [the deployment handoff](README.txt) for host
configuration examples and the existing public-release requirements.

## Local development

Node.js 18+ is required. There are no npm dependencies to install.

```sh
npm run build
npm test
npm run check
npm run preview
```

The preview is served at `http://127.0.0.1:8743/`.

## Contents and verification

- `src/`: page content, rendering, styles and local image/font assets.
- `public/`: generated static website snapshot.
- `hosting-examples/`: examples for static hosting configuration.
- `review-previews/`: saved desktop and mobile previews.
- `HERO_IMAGE_PROVENANCE.json`: the ten Magnific images, page mapping and costs.
- `HERO_IMAGE_AUDIT.json`: 312 passing page/viewport image checks.
- `RISK_WARNING_AUDIT.json`: current warning, layout and default-control checks.
- `SOCIAL_LINKS_AUDIT.json`: Facebook/Instagram page and footer checks.
- `RISK_PAGE_AUDIT.json`: six risk-page checks after draft-panel removal; unchanged-page coverage is verified by SHA-256.
- `TRAINER_UPDATE_AUDIT.json`: Junned name, original portrait, navigation and 36 responsive checks.
- `CONTACT_FORM_AUDIT.json`: responsive form and native invalid-input checks.
- `CONTACT_FORM_TEST_REPORT.json`: four email-draft tests; no real email sent.
- `CONSENT_TEST_REPORT.json`: 13 passing consent tests.
- `FILE_MANIFEST.sha256`: integrity hashes for the original website package files.

The ZIPs are versioned deployment snapshots. After changing the source, rebuild
and validate the site before producing replacement packages. This repository
does not automatically deploy or publish the website.

## Contact form

The form prepares an email draft to **contact@4xvalley.com** using the visitor's
email app. The visitor reviews and sends it there. Automatic website delivery
requires a separately configured form/mail service. No enquiry is sent or saved
by the static website itself.
