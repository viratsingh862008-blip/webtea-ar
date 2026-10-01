# WebTea AR

A self-hosted WebAR foundation for WebTea HQ.

## Experience

QR code → mobile WebAR page → interactive floating image → destination URL.

## Stack

- Vite + React + TypeScript
- MindAR image tracking
- A-Frame
- QRCode
- Vercel-compatible static deployment

## Development

```bash
npm install
npm run dev
```

Build and verify:

```bash
npm test
npm run build
```

## Product direction

The system will evolve into a reusable client workflow where an operator can upload an AR target image, configure a destination URL, generate the AR experience, and export a QR code.