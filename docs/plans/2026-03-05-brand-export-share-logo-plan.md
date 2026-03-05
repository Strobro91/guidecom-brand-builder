# Brand Export, Share & Logo Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add logo upload with preview integration, URL-encoded shareable links, and a dedicated `/brand` route that renders a polished read-only brand guideline page with PDF export.

**Architecture:** Extend the existing single-file HTML pattern. Add `state.logo` (base64 data URL) to the builder state. Encode all state into URL query params for sharing. Create a new `brand-guide.html` served at `/brand` that reads those params and renders a read-only brand guideline page. PDF via `window.print()` with a `@media print` stylesheet.

**Tech Stack:** Vanilla HTML/CSS/JS, Express.js, FileReader API, URL/URLSearchParams API, Canvas API (for logo resizing)

---

### Task 1: Add Logo Upload Control to Builder

**Files:**
- Modify: `guidecom-brand-builder.html:781-791` (state object)
- Modify: `guidecom-brand-builder.html:969-1016` (control strip HTML in render function)

**Step 1: Add `logo` to state object**

At line 791, add `logo: null` to the state object:

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
  logo: null,    // base64 data URL or null
};
```

**Step 2: Add logo upload CSS**

Add these styles after the existing `.control-group` styles (around line 180):

```css
/* ===================== LOGO UPLOAD ===================== */
.logo-upload-zone {
  border: 2px dashed var(--border);
  border-radius: var(--radius);
  padding: 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.25s ease;
  position: relative;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.logo-upload-zone:hover {
  border-color: var(--accent);
  background: color-mix(in srgb, var(--accent) 5%, transparent);
}
.logo-upload-zone.has-logo {
  border-style: solid;
  border-color: var(--border);
}
.logo-upload-zone input[type="file"] {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}
.logo-upload-zone .upload-hint {
  font-size: 12px;
  color: var(--text-muted);
}
.logo-upload-zone .upload-icon {
  font-size: 20px;
  color: var(--text-muted);
}
.logo-preview-thumb {
  max-width: 120px;
  max-height: 60px;
  object-fit: contain;
}
.logo-remove-btn {
  font-size: 11px;
  color: var(--text-muted);
  background: none;
  border: 1px solid var(--border);
  border-radius: var(--radius-btn);
  padding: 4px 10px;
  cursor: pointer;
  font-family: 'Outfit', sans-serif;
  transition: all 0.2s ease;
}
.logo-remove-btn:hover {
  color: #ff6b6b;
  border-color: #ff6b6b;
}
```

**Step 3: Add logo upload control group to the render function**

In the render function, inside the control strip div (after the Motion control group, around line 1015), add a new Logo control group:

```javascript
<div class="control-group">
  <div class="control-title">Logo</div>
  <div class="logo-upload-zone ${state.logo ? 'has-logo' : ''}" id="logoDropZone">
    ${state.logo
      ? `<img src="${state.logo}" class="logo-preview-thumb" alt="Logo"/>
         <button class="logo-remove-btn" onclick="event.stopPropagation(); removeLogo()">Remove</button>`
      : `<div class="upload-icon">↑</div>
         <div class="upload-hint">Drop logo or click to upload<br/>PNG, SVG, JPG</div>`
    }
    <input type="file" accept="image/png,image/jpeg,image/svg+xml" onchange="handleLogoUpload(event)" />
  </div>
</div>
```

**Step 4: Add logo upload handler functions**

After the `replayMotion()` function (around line 1280), add:

```javascript
// ============================================================
// LOGO UPLOAD
// ============================================================
function handleLogoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    // Resize to max 200px wide for URL-friendliness
    const img = new Image();
    img.onload = function() {
      const maxW = 200;
      let w = img.width;
      let h = img.height;
      if (w > maxW) {
        h = Math.round(h * (maxW / w));
        w = maxW;
      }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      state.logo = canvas.toDataURL('image/png', 0.8);
      render();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function removeLogo() {
  state.logo = null;
  render();
}
```

**Step 5: Commit**

```bash
git add guidecom-brand-builder.html
git commit -m "feat: add logo upload control to brand builder"
```

---

### Task 2: Integrate Logo into Preview Cards

**Files:**
- Modify: `guidecom-brand-builder.html:1021-1032` (Logo on Dark card)
- Modify: `guidecom-brand-builder.html:1034-1045` (Logo on Light card)
- Modify: `guidecom-brand-builder.html:1057-1065` (Social Post card)
- Modify: `guidecom-brand-builder.html:1080-1091` (Email Header card)
- Modify: `guidecom-brand-builder.html:1094-1161` (Dashboard card)

**Step 1: Create a logo rendering helper**

Add this helper before the `render()` function (around line 885):

```javascript
function renderLogo(fontFamily, textColor, accentColor, size) {
  if (state.logo) {
    return `<img src="${state.logo}" style="max-height: ${size}px; max-width: ${size * 3}px; object-fit: contain;" alt="Logo"/>`;
  }
  if (size <= 36) {
    // Small: just use icon
    return renderIcon(String(size), accentColor, 'transparent', fontFamily);
  }
  // Default: text logo
  return `<div class="logo-text" style="font-family: ${fontFamily}; color: ${textColor};">guide<span style="color: ${accentColor};">com</span></div>`;
}

function renderLogoWithText(fontFamily, textColor, accentColor, taglineColor, taglineFont) {
  if (state.logo) {
    return `<img src="${state.logo}" style="max-height: 60px; max-width: 200px; object-fit: contain;" alt="Logo"/>`;
  }
  return `<div class="logo-text" style="font-family: ${fontFamily}; color: ${textColor};">guide<span style="color: ${accentColor};">com</span></div>
          <div class="tagline-text" style="color: ${taglineColor}; font-family: ${taglineFont};">The guided commerce platform.</div>`;
}
```

**Step 2: Update Logo on Dark card (line ~1022-1032)**

Replace the logo-text and tagline-text divs in the Logo on Dark card:

```javascript
<!-- 1. Logo on dark -->
<div class="preview-card ${motCls}" id="card-logo-dark">
  <div class="preview-label">${isL ? 'Logo on Dark' : 'Logo on Dark'}</div>
  <div class="preview-body ${artCls}" style="background: ${darkBg}; color: ${accent};">
    ${renderLogoWithText(typ.heading, '#fff', accent, 'rgba(255,255,255,0.4)', typ.body)}
    <div class="btn-row">
      ${renderBtn('Book a Demo →', accent, accentD, darkBgSolid, typ.body, true)}
      ${renderBtn('Learn More', accent, accentD, darkBgSolid, typ.body, false)}
    </div>
  </div>
</div>
```

**Step 3: Update Logo on Light card (line ~1034-1045)**

```javascript
<!-- 2. Logo on light -->
<div class="preview-card ${motCls}" id="card-logo-light">
  <div class="preview-label">Logo on Light</div>
  <div class="preview-body ${artCls}" style="background: ${isL ? p.gradient : p.lightBg}; color: ${isL ? accent : accentD};">
    ${renderLogoWithText(typ.heading, lightText, lightAccent, lightTextDim, typ.body)}
    <div class="btn-row">
      ${renderBtn('Book a Demo →', p.textOnLight, p.textOnLightDim, '#fff', typ.body, true)}
      ${renderBtn('Learn More', lightText, lightTextDim, lightBg, typ.body, false)}
    </div>
  </div>
</div>
```

**Step 4: Update Social Post card icon (line ~1061)**

Replace the `renderIcon` call with `renderLogo`:

```javascript
${state.logo ? renderLogo(typ.heading, heroText, accent, 44) : renderIcon('44', isL ? p.textOnLight : accent, isL ? '#fff' : darkBgSolid, typ.heading)}
```

**Step 5: Update Email Header card icon (line ~1084)**

Replace the icon + "guidecom" text:

```javascript
<div style="display: flex; align-items: center; gap: 10px;">
  ${state.logo
    ? `<img src="${state.logo}" style="max-height: 36px; max-width: 120px; object-fit: contain;" alt="Logo"/>`
    : `${renderIcon('36', accent, darkBgSolid, typ.heading)}
       <div style="font-family: ${typ.heading}; font-size: 18px; font-weight: 700; color: #fff; letter-spacing: -0.3px;">guidecom</div>`
  }
</div>
```

**Step 6: Update Dashboard nav icon (line ~1101)**

Replace the icon + "guidecom" text in the nav bar:

```javascript
<div style="display: flex; align-items: center; gap: 8px;">
  ${state.logo
    ? `<img src="${state.logo}" style="max-height: 28px; max-width: 100px; object-fit: contain;" alt="Logo"/>`
    : `${renderIcon('28', accent, darkBgSolid, typ.heading)}
       <span style="font-family: ${typ.heading}; font-size: 14px; font-weight: 700; color: #fff;">guidecom</span>`
  }
</div>
```

**Step 7: Commit**

```bash
git add guidecom-brand-builder.html
git commit -m "feat: integrate uploaded logo into all preview cards"
```

---

### Task 3: URL State Encoding & Share Button

**Files:**
- Modify: `guidecom-brand-builder.html` (header area, state functions, init)

**Step 1: Add Share button CSS**

Add after the existing header styles (around line 60):

```css
/* ===================== SHARE / EXPORT BAR ===================== */
.header-actions {
  display: flex;
  gap: 10px;
  margin-top: 16px;
}
.btn-share {
  padding: 10px 20px;
  border-radius: 100px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: 1.5px solid var(--accent);
  background: var(--accent);
  color: var(--bg);
  font-family: 'Outfit', sans-serif;
  letter-spacing: 0.3px;
  transition: all 0.25s ease;
}
.btn-share:hover {
  filter: brightness(1.1);
}
.btn-export {
  padding: 10px 20px;
  border-radius: 100px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: 1.5px solid var(--border);
  background: transparent;
  color: var(--text-dim);
  font-family: 'Outfit', sans-serif;
  letter-spacing: 0.3px;
  transition: all 0.25s ease;
}
.btn-export:hover {
  border-color: var(--text-dim);
  color: var(--text);
}
.toast {
  position: fixed;
  bottom: -60px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--accent);
  color: var(--bg);
  padding: 12px 28px;
  border-radius: 100px;
  font-size: 13px;
  font-weight: 600;
  font-family: 'Outfit', sans-serif;
  z-index: 9999;
  transition: bottom 0.3s ease;
  white-space: nowrap;
}
.toast.show {
  bottom: 32px;
}
```

**Step 2: Add Share and Export buttons to the header HTML**

In the body HTML (around line 566-574 in the static HTML area), add action buttons after the header paragraph:

Find the existing header `<p>` tag and add after it:

```html
<div class="header-actions">
  <button class="btn-share" onclick="shareLink()">Share Brand Guide</button>
  <button class="btn-export" onclick="exportBrandGuide()">Export as PDF</button>
</div>
```

**Step 3: Add state encoding/decoding functions**

After the logo upload functions, add:

```javascript
// ============================================================
// URL STATE ENCODING / DECODING
// ============================================================
function encodeStateToParams() {
  const params = new URLSearchParams();
  params.set('p', state.palette);
  params.set('a', state.accent);
  params.set('t', state.type);
  params.set('ar', state.art);
  params.set('m', state.motion);
  params.set('r', state.radius);
  params.set('s', state.spacing);
  params.set('i', state.icon);
  params.set('b', state.button);
  if (state.logo) {
    // Compress: strip the data URL prefix, just keep the base64
    const b64 = state.logo.split(',')[1];
    params.set('logo', b64);
  }
  return params.toString();
}

function decodeStateFromParams() {
  const params = new URLSearchParams(window.location.search);
  if (!params.has('p')) return false; // no state in URL

  state.palette = parseInt(params.get('p')) || 0;
  state.accent = parseInt(params.get('a')) || 0;
  state.type = parseInt(params.get('t')) || 0;
  state.art = parseInt(params.get('ar')) || 0;
  state.motion = parseInt(params.get('m')) || 0;
  state.radius = parseInt(params.get('r')) || 2;
  state.spacing = parseInt(params.get('s')) || 1;
  state.icon = parseInt(params.get('i')) || 0;
  state.button = parseInt(params.get('b')) || 0;

  if (params.has('logo')) {
    state.logo = 'data:image/png;base64,' + params.get('logo');
  }
  return true;
}

function shareLink() {
  const params = encodeStateToParams();
  const url = window.location.origin + '/brand?' + params;
  navigator.clipboard.writeText(url).then(() => {
    showToast('Brand guide link copied!');
  }).catch(() => {
    // Fallback: select a temporary input
    const tmp = document.createElement('input');
    tmp.value = url;
    document.body.appendChild(tmp);
    tmp.select();
    document.execCommand('copy');
    document.body.removeChild(tmp);
    showToast('Brand guide link copied!');
  });
}

function exportBrandGuide() {
  const params = encodeStateToParams();
  const url = window.location.origin + '/brand?' + params;
  window.open(url, '_blank');
}

function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}
```

**Step 4: Load state from URL on init**

Replace the init section (lines 1285-1286):

```javascript
// ============================================================
// INIT
// ============================================================
decodeStateFromParams();
renderTabs();
render();
```

**Step 5: Commit**

```bash
git add guidecom-brand-builder.html
git commit -m "feat: add share link and URL state encoding/decoding"
```

---

### Task 4: Create Brand Guide Page (`brand-guide.html`)

**Files:**
- Create: `brand-guide.html`
- Modify: `server.js` (add `/brand` route)

**Step 1: Add the `/brand` route to server.js**

After the existing `/` route:

```javascript
app.get('/brand', (req, res) => {
  res.sendFile(path.join(__dirname, 'brand-guide.html'));
});
```

**Step 2: Create `brand-guide.html`**

This is a large file. Create `brand-guide.html` as a self-contained HTML page that:

1. Imports the same Google Fonts as the builder
2. Duplicates the palette/typography/artwork/radius/spacing/icon/button option arrays from the builder
3. On load, reads URL query params via `decodeStateFromParams()` to reconstruct the state
4. Renders a read-only brand guideline layout with these sections:

**Header section:**
- Logo image (if present in URL) or text "Brand Guidelines"
- Accent color horizontal bar
- "Edit in Builder" link (encodes state back to `/?...`)
- "Download PDF" button (calls `window.print()`)

**Color Palette section:**
- Title: "Color Palette"
- 6 color swatches from the selected palette, displayed as large cards with:
  - Color fill block
  - Label (Primary Dark, Surface, Accent, etc.)
  - Hex value

**Typography section:**
- Title: "Typography"
- Heading font: name, sample text rendered in the font, specs (weight, size)
- Body font: name, sample text rendered in the font, specs

**Design Tokens section:**
- Title: "Design Tokens"
- Grid showing: Border Radius (with visual example), Spacing, Icon Style (rendered icon), Button Style (rendered buttons)

**Usage Examples section:**
- Title: "Usage Examples"
- Same 7 preview cards from the builder, rendered identically using the same rendering helpers (renderBtn, renderIcon, renderLogo)
- No motion animations (static display)

**Footer:**
- "Edit in Builder" link
- Built with Guidecom Brand Builder credit

**Visual style:**
- Uses the selected palette's page colors (pageBg, pageSurface, etc.)
- Same CSS custom property system
- Clean, spacious layout with generous padding
- Max-width 1100px, centered

**Step 3: Add print stylesheet to brand-guide.html**

Include a `@media print` block:

```css
@media print {
  .no-print { display: none !important; }
  body { background: white !important; }
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  .guide-section { break-inside: avoid; page-break-inside: avoid; }
  .preview-grid { break-before: page; }
}
```

The "Edit in Builder" link and "Download PDF" button get `class="no-print"`.

**Step 4: Commit**

```bash
git add brand-guide.html server.js
git commit -m "feat: add brand guide page with PDF export at /brand route"
```

---

### Task 5: Polish & Responsive Design

**Files:**
- Modify: `brand-guide.html` (responsive breakpoints)
- Modify: `guidecom-brand-builder.html` (logo upload responsive)

**Step 1: Add responsive styles to brand-guide.html**

```css
@media (max-width: 1000px) {
  .guide-header { padding: 40px 24px; }
  .guide-section { padding: 32px 24px; }
  .color-grid { grid-template-columns: repeat(3, 1fr); }
  .preview-grid { grid-template-columns: 1fr; }
  .token-grid { grid-template-columns: 1fr 1fr; }
}

@media (max-width: 600px) {
  .color-grid { grid-template-columns: repeat(2, 1fr); }
  .token-grid { grid-template-columns: 1fr; }
  .guide-header h1 { font-size: 28px; }
}
```

**Step 2: Test the logo upload control at small breakpoints**

Ensure the logo upload zone stacks properly in the control strip at 1200px and 1000px breakpoints. The existing responsive rules for `.control-strip` (grid columns) should handle this, but verify the drag zone doesn't overflow.

**Step 3: Verify the full flow end-to-end**

1. Open builder at `/`
2. Select palette, accent, typography, etc.
3. Upload a logo
4. Click "Share Brand Guide" — verify URL is copied
5. Open the URL — verify brand guide renders correctly with all settings + logo
6. Click "Download PDF" — verify print dialog opens with clean layout
7. Click "Edit in Builder" — verify builder opens with same settings

**Step 4: Commit**

```bash
git add guidecom-brand-builder.html brand-guide.html
git commit -m "polish: responsive design and end-to-end flow verification"
```

---

### Task Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Logo upload control + handler | `guidecom-brand-builder.html` |
| 2 | Logo integration into preview cards | `guidecom-brand-builder.html` |
| 3 | URL encoding, share button, toast | `guidecom-brand-builder.html` |
| 4 | Brand guide page + server route | `brand-guide.html`, `server.js` |
| 5 | Polish, responsive, end-to-end test | Both HTML files |
