# Zain Technologies Ltd. Website

This directory contains the GitHub Pages site for **Zain Technologies Ltd.**

## Information Architecture

The site is structured as a multi-page corporate experience optimised for GitHub Pages hosting.

| Page | Purpose | Key Sections |
| --- | --- | --- |
| `index.html` | Entry point and executive overview | Hero, quick stats, solutions grid, industry coverage, testimonials, CTA |
| `about.html` | Company narrative and leadership | Story timeline, mission & values, leadership profiles, culture |
| `services.html` | Comprehensive catalogue of offerings | Digital transformation, AI & analytics, infrastructure & cybersecurity, product engineering, managed ops, bullet coverage of memorandum objectives |
| `governance.html` | Memorandum & Articles of Association | Interactive table of contents, expandable sections for Memorandum clauses (I–V & 1–7), Articles (preliminary, share capital, governance, etc.), downloadable PDF stub |
| `contact.html` | Engagement touchpoints | Regional presence, enquiry form (static), contact directory, map placeholder |

### Global Elements

- Responsive navigation with mobile drawer
- Secondary footer navigation with social and legal links
- Shared meta tags for SEO and social sharing
- System-aware light/dark theme with accessible toggle
- Consistent colour palette inspired by company brand (midnight blue, electric orange, white)

### Assets & Components

- `assets/css/styles.css` — Global styles using CSS custom properties, fluid type, theme tokens, and utility helpers.
- `assets/js/main.js` — Handles mobile navigation, smooth in-page scrolling, accordion interactions, form enhancements, and theme persistence.
- `assets/img/` — Logo SVG, Apple touch icon, and decorative illustrations.
- `manifest.webmanifest` — Web app manifest with icons and brand metadata for installable experiences.

### Content Sources

- Founder profile (`profiles/README_MehediHossain95.md`)
- Organisation overview (`profiles/README_ZainTechnologies22.md`)
- Memorandum & Articles text (provided by client)

### Deployment

The site is designed for static hosting on GitHub Pages. No build step is required; commit the files to the `main` branch of `zaintechnologiesltd.github.io`.

## Local Preview

```bash
cd zaintechnologiesltd.github.io
python -m http.server 8000
```

Visit <http://localhost:8000> in your browser to browse the site locally.

## Accessibility & SEO Enhancements

- Skip navigation link and keyboard-friendly mobile menu
- Responsive typography, fluid grids, and reduced motion-friendly transitions
- Descriptive meta tags, Open Graph previews, sitemap, and robots directives
- Client-side acknowledgement for enquiry form submissions
- Accessible dark-mode control with `aria-pressed` state and persistent preference storage
- Apple touch icon and manifest metadata for rich mobile bookmarking

## Theme & PWA Features

- Click the theme toggle to switch between light and dark modes; right-click (or long-press on touch devices) to revert to system preference.
- Preferences are stored in `localStorage` when explicitly set, otherwise the site follows `prefers-color-scheme`.
- Manifest and icons enable “Add to Home Screen” support across modern browsers.
