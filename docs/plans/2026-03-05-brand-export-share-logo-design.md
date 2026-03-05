# Brand Builder: Export, Share & Logo Design

## Summary

Add three capabilities to the Brand Builder:
1. Logo upload that integrates into all preview cards and the share URL
2. Shareable URL-encoded links for both the builder and the brand guide
3. A dedicated `/brand` route that renders a polished, read-only brand guideline page with PDF export

## Architecture

Single new HTML file (`brand-guide.html`) served at `/brand`. No database — all state lives in URL query params. Logo is base64-encoded and compressed into the URL. The builder at `/` gets a Share button and logo upload control added.

## 1. Logo Upload & Preview Integration

### Upload UX
- New control group in the control strip: drag-and-drop zone or click-to-upload
- Accepts PNG, SVG, JPG
- File read via `FileReader` as base64 data URL, stored in `state.logo`
- Small preview thumbnail shown after upload, with a remove button

### Preview Card Integration
Logo replaces the "G" icon/lettermark in these cards:
- Logo on Dark (replaces icon + "GUIDECOM" text with logo image)
- Logo on Light
- Social Post (icon area)
- Email Header (icon area)
- Dashboard (nav icon)

Logo constrained to max ~120px wide in preview cards.

If no logo uploaded, existing "G" placeholder remains.

### URL Encoding
- Logo resized to max 200px wide before encoding (keeps base64 small)
- Stored as `&logo=<base64>` query param
- Typical small logo: 2-8KB base64, fits in URL (browsers support 2000+ chars)

## 2. Share Link & URL State Encoding

### URL Format
```
/brand?p=0&a=2&t=1&ar=3&m=0&r=2&s=1&i=0&b=1&logo=<base64>
```

Params: `p`=palette, `a`=accent, `t`=type, `ar`=artwork, `m`=motion, `r`=radius, `s`=spacing, `i`=icon, `b`=button, `logo`=compressed base64.

### Share Button
- Added to builder header area
- On click: encodes current state into `/brand?...` URL, copies to clipboard
- Toast confirmation: "Link copied!"

### Two Link Types
- `/?p=0&a=2...` — opens builder with settings pre-loaded (editable)
- `/brand?p=0&a=2...` — opens read-only brand guide

### Builder State Loading
On page load, the builder reads URL params and initializes state from them. This enables sharing editable links too.

## 3. Brand Guide Page (`/brand`)

### New File: `brand-guide.html`
Self-contained HTML file with embedded CSS and JS (same pattern as builder).

### Page Sections
1. **Header** — Logo (if uploaded), "Brand Guidelines" title, accent color bar
2. **Color Palette** — All 6 swatches with hex values, labeled (Primary, Surface, Accent, Secondary, Light BG, White)
3. **Typography** — Heading + body font names rendered in their actual fonts, with size/weight specs
4. **Design Tokens** — Border radius, spacing, icon style, button style as a reference grid
5. **Usage Examples** — Same 7 preview cards from builder, rendered read-only
6. **Footer** — "Edit in Builder" link (encodes state to `/?...`), "Download PDF" button

### PDF Export
- "Download PDF" triggers `window.print()`
- `@media print` stylesheet:
  - Clean backgrounds with `-webkit-print-color-adjust: exact`
  - Hide "Edit" and "Download" buttons
  - Page breaks between sections
  - Optimized for A4/Letter

### Visual Style
- Uses the selected palette as the page theme (dark palette = dark guide page)
- Professional, deliverable quality — something you'd hand to a client
- Same Google Fonts loaded as the builder
- Same CSS custom property system for theming

## Server Changes

Add one route to `server.js`:
```javascript
app.get('/brand', (req, res) => {
  res.sendFile(path.join(__dirname, 'brand-guide.html'));
});
```

## State Object Changes

Add `logo` field to existing state:
```javascript
let state = {
  palette: 0,
  accent: 0,
  type: 0,
  art: 0,
  motion: 0,
  radius: 2,
  spacing: 1,
  icon: 0,
  button: 0,
  logo: null  // base64 data URL or null
};
```

## Shared Code

The brand guide page needs access to the same palette/typography/artwork/button definitions as the builder. Since both files are standalone HTML with embedded JS, the config data (palettes array, typography options, etc.) will be duplicated in the brand guide file. This is acceptable for the architecture pattern — no build tools or shared modules.
