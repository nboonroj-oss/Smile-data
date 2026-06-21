# Clinic stock receive — deployable prototype

A standalone React + Vite app for the stock receive screen: camera barcode
scanning (where supported), manual entry fallback, lot/expiry tracking, and
scan-to-increment quantity, matching the data model in the system
architecture document (`stock_lots`, `stock_movements`).

**This is a frontend-only prototype.** There is no backend or database —
"Confirm and post to stock" just clears the on-screen list. It's meant to
validate the workflow and to be a real starting point for wiring up to the
actual API described in the architecture doc (`POST /stock/receive`).

## Run locally

Requires [Node.js](https://nodejs.org) 18+.

```bash
npm install
npm run dev
```

Open the printed `localhost` URL. On a phone, camera scanning requires
HTTPS or `localhost` — `npm run dev` alone won't expose camera access to
other devices on your network. To test scanning on your phone, deploy it
first (see below) and open the deployed URL on your phone, or use
`npm run dev -- --host` plus a tool like `ngrok` to get a temporary HTTPS
tunnel to your machine.

## Deploy to Vercel (free tier)

1. Push this folder to a GitHub repo (or upload it directly if using
   Vercel's drag-and-drop import).
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. Vercel auto-detects the Vite framework from `vercel.json` — no
   configuration needed. Click **Deploy**.
4. You'll get a live URL like `your-project.vercel.app` within about a
   minute.

## Deploy to Netlify (free tier)

1. Push this folder to a GitHub repo, or drag the project folder directly
   onto [app.netlify.com/drop](https://app.netlify.com/drop) for an
   instant deploy with no git required.
2. If deploying via GitHub: go to
   [app.netlify.com/start](https://app.netlify.com/start), pick the repo.
   `netlify.toml` already sets the build command and output folder.
3. Click **Deploy site**.

## Browser support note

Live camera barcode scanning uses the browser's native `BarcodeDetector`
API, currently supported in Chrome/Edge (desktop and Android). Safari and
Firefox don't support it yet — the app detects this and shows a message
pointing to manual entry instead of failing silently. To support all
browsers in production, swap in a JS decoder library such as
[ZXing-js](https://github.com/zxing-js/library), as noted in the
architecture document's barcode scanning section — it decodes from the
camera feed in JS rather than relying on native browser support.

## Try the demo catalog

Since there's no backend, a handful of products are hardcoded in
`src/catalog.js`. Try scanning or manually entering one of these SKUs:

- `BOTOX-50U`
- `FILLER-1ML`
- `MOUNJARO-5MG`
- `LIPORASE-VIAL`
- `HIFU-TIP`

Scanning/entering the same SKU + lot twice increments the quantity instead
of creating a duplicate line, matching the "scan again to increase
quantity" behavior from the spec.

## Wiring up the real backend

When the API exists, the only changes needed are in `src/App.jsx`:

- Replace `src/catalog.js`'s static `CATALOG` object with a `GET
  /products` fetch on load.
- In `handleSubmit`, replace the local state clear with a real
  `POST /stock/receive` call per item, per the API structure in the
  architecture doc.
- `BarcodeScanner.jsx` is already decoupled from the rest of the app via
  the `onDetect(rawValue)` callback, so no changes are needed there.
