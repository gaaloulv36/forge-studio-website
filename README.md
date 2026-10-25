# Open Forge Studio website

The official site for **Open Forge Studio**: products, custom work, and contact.
Plain HTML, CSS and JavaScript with no build step and no dependencies. Hosted on GitHub Pages.

**Live:** https://gaaloulv36.github.io/open-forge-studio-website/

## Structure

```
index.html              Home (hero, ticker, 01 Products, 02 Custom work, 03 Why / About, CTA)
thermoforge/index.html  ThermoForge product page
vaultforge/index.html   VaultForge product page (placeholders until details are filled in)
contact/index.html      Contact form (Formspree) + LinkedIn / email / GitHub
404.html                Not-found page
assets/css/styles.css   All styles. Brand colours and fonts are the variables at the top.
assets/js/main.js       Mobile menu, scroll reveal, card glow, contact form
assets/img/             Favicons and social preview (Open Graph) images
tools/                  Helpers for regenerating images and previewing at phone width (not linked from the site)
```

## Run it locally

Any static file server works. From this folder:

```bash
python -m http.server 8080
# or: npx serve .
```

Then open http://localhost:8080.

To see a page at phone width with animations finished, open
http://localhost:8080/tools/preview.html?src=/&w=375 (change `src` to `/thermoforge/` etc.).

## Editing text

Open the page's `index.html` in any editor and change the text between the tags. Sections are marked with
comments like `<!-- ============ 02 / Custom work ============ -->`.

The header and footer are repeated in each page, so a change to a nav link or the footer needs to be made in
all five HTML files (search for the text and replace it everywhere).

### Placeholders to fill in

Search the project for `[` to find them all:

| Placeholder | Where |
|---|---|
| `[YOUR LINKEDIN URL]` | All pages (closing CTA, footer, contact) |
| `[YOUR EMAIL]` | All pages (footer, contact) |
| `[ONE OR TWO SENTENCES ABOUT YOU…]` | `index.html`, section 03 |
| `[YOUR TERMS…]` | `index.html`, section 03, item B |
| `[PLATFORM · TECH STACK]` | `index.html`, VaultForge card |
| `[SCREENSHOT: …]` | Product pages, section 03 |
| VaultForge `[…]` | `vaultforge/index.html` |
| `YOUR_FORM_ID` | `contact/index.html` |

Placeholders inside the page text are wrapped in `<span class="ph">…</span>`, which shows them in orange.
When you replace one, remove the span too.

### Adding screenshots

Save the image in `assets/img/` (for example `thermoforge-processes.png`, about 1600×1000), then replace the
placeholder in the product page:

```html
<div class="shot">[SCREENSHOT: ThermoForge processes tab]</div>
```
with
```html
<div class="shot"><img src="../assets/img/thermoforge-processes.png" alt="ThermoForge processes tab with two flagged processes" loading="lazy"></div>
```

### Contact form (Formspree)

1. Create a free account at https://formspree.io and create a new form.
2. Copy the form ID (the part after `/f/` in its endpoint, for example `xyzabcd`).
3. In `contact/index.html`, replace `YOUR_FORM_ID` in `action="https://formspree.io/f/YOUR_FORM_ID"`.

Until then, the form shows a "not connected yet" message instead of sending.
Links like `contact/?product=thermoforge` pre-select the product in the form.

### Design system

All brand values are CSS variables at the top of `assets/css/styles.css` (`--ember`, `--thermo`, `--vault`…).
Product pages set their accent with `style="--accent: var(--thermo)"` on `<body>`.

Fonts: Space Grotesk (headings), Inter (body) and Space Mono (the small uppercase labels, class `hud`).

The layout is one bordered column (`.frame`). Each section is built the same way:

```html
<section class="section" id="…">
  <span class="rule-line"></span>               <!-- full-width top line -->
  <div class="frame">
    <div class="bar hud">…01 / Title…</div>       <!-- sticky section label -->
    <div class="section-intro"><h2>…</h2><p>…</p></div>
    <div class="cells c-3">…</div>               <!-- grid with shared 1px borders -->
  </div>
</section>
```

Grids: `cells c-2 / c-3 / c-4 / c-6`. Inside a grid use `.cell` (text block), `.card` (label strip + media + body)
or `.cta-cell` (wide call-to-action that turns light on hover). `span-2`, `span-3`, `span-all` widen a cell.

## Social preview images and favicons

`assets/img/og-*.png` (1200×630) and the PNG icons are generated from `tools/og/og.html` and
`tools/og/icon.html` with headless Microsoft Edge:

```bash
bash tools/render-images.sh
```

Edit the text for each product in `tools/og/og.html`, then re-run the script.
LinkedIn caches previews; use https://www.linkedin.com/post-inspector/ to refresh after a change.

## Deploying

The site is served by GitHub Pages from the `main` branch root. Push to `main` and it updates within a minute or two.

If you add a custom domain later, update the absolute URLs in the `<meta property="og:…">` and
`<link rel="canonical">` tags, and change `<base href>` in `404.html` to `/`.
