# Open Forge Studio website

The official site for **Open Forge Studio**: products, custom work, and contact.
Plain HTML, CSS and JavaScript with no build step and no dependencies. Hosted on GitHub Pages.

**Live:** https://gaaloulv36.github.io/open-forge-studio-website/

## Structure

```
index.html              Home (ecosystem hero with orbiting app cards, 01 Products, 02 Security, 03 Features, 04 Pricing, CTA)
products/index.html     All products (available now + in the works); the header's "Explore Open Forge Studio" button opens it
thermoforge/index.html  ThermoForge product page
vaultforge/index.html   VaultForge product page (placeholders until details are filled in)
contact/index.html      Contact form (Formspree) + LinkedIn / email / GitHub
404.html                Not-found page
assets/css/styles.css   All styles. Theme colours (dark + light) and fonts are the variables at the top.
assets/js/script.js     Theme toggle, mobile menu, scroll reveal, hero orbit animation, contact form
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
http://localhost:8080/tools/preview.html?src=/&w=375 (change `src` to `/thermoforge/` etc., add `&theme=light`).

## Editing text

Open the page's `index.html` in any editor and change the text between the tags. Sections are marked with
comments like `<!-- ============ 02 / Security ============ -->`.

The header and footer are repeated in each page, so a change to a nav link or the footer needs to be made in
all five HTML files (search for the text and replace it everywhere).

### Placeholders to fill in

Search the project for `[` to find them all:

| Placeholder | Where |
|---|---|
| `[SCREENSHOT: …]` | Product pages, section 03 |
| VaultForge `[…]` (platform, stack, features, key derivation) | `vaultforge/index.html` |
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

All colours are CSS variables at the top of `assets/css/styles.css`. Dark is the default (`:root, [data-theme="dark"]`);
`[data-theme="light"]` redefines the same variables. Main tokens: `--bg`, `--surface`, `--border`, `--text`,
`--muted`, `--accent` (cyan), `--success` (green, for "secured / active" status).
Product icon colours are `--tone-vault`, `--tone-thermo`… used with the classes `tone-vault`, `tone-thermo`…

Theme: a short inline script in each page's `<head>` sets `data-theme` on `<html>` before the page paints
(saved choice, else the system setting, else dark). The sun/moon button (`.theme-toggle`) switches it and saves the
choice in `localStorage` under `ofs-theme`.

Font: JetBrains Mono for everything (text, headings, buttons, labels), loaded from Google Fonts as one variable
font (weights 300–800). It's set once as `--font-mono` in `styles.css`; `--font-sans` is an alias of it.

Each section is built the same way:

```html
<section class="section" id="…">
  <div class="container">
    <header class="section-head">
      <div>
        <p class="index-tag"><span class="n">02</span><span class="sep">/</span>Title</p>
        <h2>…</h2>
      </div>
      <p class="lead">…</p>
    </header>
    <div class="duo">…cards…</div>          <!-- or trio, product-grid, modules, pricing -->
  </div>
</section>
```

Building blocks: `.card` (lifts and glows on hover), `.pill` / `.pill-success` (status), `.index-badge`
(`01 / VaultForge`), `.app-icon`, `.checklist`, `.btn btn-primary` / `.btn btn-outline`, `.module` (numbered feature).

Animations: add `slide-up` or `fade-in` to any element and it animates in when scrolled into view.
Stagger with `style="--d:.1s"`. Everything respects the visitor's reduced-motion setting.

The header and footer are the same on every page. After changing them in `index.html`, copy the change to the other
four pages (links there start with `../`; `404.html` uses root links because of its `<base href>`).

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
