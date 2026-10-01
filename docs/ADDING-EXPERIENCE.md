# Adding an Experience

## Fastest production path

1. Open /studio.
2. Enter the final public HTTPS base URL.
3. Choose a stable slug, such as rp-events-menu.
4. Enter the destination URL.
5. Upload the card image.
6. Keep QR camera AR unless true image tracking is needed.
7. Generate the QR.
8. Download the deployment ZIP.
9. Unzip it at the repository root.
10. Commit and deploy.

The resulting QR is:

https://YOUR-DOMAIN/ar/rp-events-menu

## Image-tracked mode

Use this when the printed artwork itself should be recognized by the camera.

The .mind file must be generated from the printed reference image with MindAR's target compiler. The manifest's targetUrl points to that file.

The card image and the tracking image can be the same physical artwork, or separate assets.

## Editing a live destination

Do not change the slug when you only need to change the destination. Edit destinationUrl in the manifest and redeploy. The existing QR remains unchanged.

## File layout

public/experiences/<slug>/
  experience.json
  card.webp
  target.mind   # image-target mode only
