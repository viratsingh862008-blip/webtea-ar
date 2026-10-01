# WebTea AR

Self-hosted WebAR infrastructure for WebTea HQ.

## What it does

Production flow:

QR → /ar/<slug> → camera experience → floating interactive card → destination URL

The QR contains only the short experience URL. The image, destination and AR settings live in a static experience manifest inside the repository.

## Two AR modes

### QR camera AR

This is the zero-target mode. The QR opens the camera, and the configured image is presented as a polished floating card over the live camera feed. Tapping the card opens the destination.

Recommended default for menus and campaigns where the QR itself is the trigger.

### Image-tracked AR

This uses MindAR image tracking. The QR opens the experience and the camera searches for the configured image target. Once the target is found, the interactive card is rendered in the tracked AR scene.

Generate a .mind target with the MindAR Target Compiler:
https://hiukim.github.io/mind-ar-js-doc/tools/compile/

## Stack

- Vite + React + TypeScript
- MindAR 1.2.5 for image tracking
- A-Frame 1.5.0 for the MindAR image-tracking renderer
- node-qrcode for client-side QR generation
- fflate for client-side deployment ZIP creation
- Vercel-compatible static deployment

MindAR is open source under MIT and supports image tracking through its A-Frame integration. The official MindAR installation documentation demonstrates A-Frame 1.5.0, so this project pins that version for the tracking mode even though newer A-Frame releases exist.

Official MindAR documentation:
https://hiukim.github.io/mind-ar-js-doc/

Official installation documentation:
https://github.com/hiukim/mind-ar-js/blob/master/docs/installation.md

## Routes

- / — project landing page
- /studio — AR Studio
- /ar/<slug> — published experience
- /ar/<slug>?image=...&href=... — query-driven development preview

## Add a published experience manually

Create:

public/
└── experiences/
    └── restaurant-menu/
        ├── experience.json
        └── card.webp

Example manifest:

{
  "id": "restaurant-menu",
  "title": "Restaurant Menu",
  "subtitle": "Tap to explore the full menu.",
  "imageUrl": "/experiences/restaurant-menu/card.webp",
  "destinationUrl": "https://example.com/menu",
  "mode": "qr",
  "theme": "editorial",
  "ctaLabel": "Open menu",
  "fallbackEnabled": true
}

The published QR URL is:

https://YOUR-DOMAIN/ar/restaurant-menu

## AR Studio workflow

Open /studio.

1. Set the final public HTTPS base URL.
2. Give the experience a stable slug.
3. Enter the destination URL.
4. Upload the AR card image.
5. Choose QR camera AR or image-tracked AR.
6. For image tracking, upload the matching .mind target.
7. Generate the QR.
8. Download the deployment ZIP.
9. Unzip the pack at the repository root, commit it, and deploy.

The ZIP contains the manifest, uploaded card, optional .mind target, QR PNG, and deployment notes.

## Important publishing detail

Print the QR only after the final public domain is known. Because the QR points to /ar/<slug>, the same QR remains valid while the destination URL inside the manifest changes.

A destination can therefore change later without reprinting the QR, as long as the experience slug and public domain remain the same.

## Camera requirements

Camera access requires a secure browser context. Production deployments should use HTTPS. Vercel provides HTTPS for deployed domains.

## Local development

npm install
npm run dev

Verification:

npm run typecheck
npm run lint
npm test
npm run build

## Deployment

This repository is a standard Vite static app.

Build command: npm run build
Output directory: dist
Install command: npm install

The included vercel.json handles SPA routing for /ar/* and /studio, and sets camera/security headers.

## Folder structure

src/
  components/
    ARExperience.tsx
    ImageTargetAR.tsx
    QrAR.tsx
    Studio.tsx
  lib/
    camera.ts
    experience.ts
    loader.ts
    qr.ts
    registry.ts
    studio.ts
  types/
    experience.ts

public/
  experiences/
  qr/

## License

The WebTea AR application code is intended to be reusable under the MIT License. Third-party packages retain their own licenses.
