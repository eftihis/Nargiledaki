# Shisha Bar Website – Product Requirements Document (PRD)

## 1. Overview
A responsive, content-driven website for a shisha bar that showcases available shisha flavours, supports English & Greek localisation, and lays foundation for future e-commerce style ordering via WhatsApp. Content is managed through Sanity Headless CMS and presented in a visually engaging carousel that utilises CSS Scroll-Driven Animations inspired by `example/example.css`. **Implementation will rely solely on vanilla HTML, CSS and modern JavaScript (ES modules) – no front-end framework.**

---

## 2. Goals & Success Metrics
1. **Showcase Flavours** – Users can browse all available shisha flavours in a smooth, mobile-friendly carousel.
2. **Centralised Content Management** – Staff can add/edit flavours in Sanity Studio without touching code.
3. **Multilingual Support** – All flavour details & UI copy are available in English and Greek; visitors can switch languages.
4. **Future Ordering Workflow** – Architecture supports adding flavours to a cart and launching a pre-filled WhatsApp message (MVP to be scoped later).

Success will be measured by:
• Time to publish a new flavour (< 5 min, non-technical staff).
• ≤ 2 sec Largest Contentful Paint on 4G mobile.
• Carousel works in latest 2 versions of major browsers & iOS/Android webviews.

---

## 3. Information Architecture
```
/            – Home (hero, top flavours, CTA to /menu)
/menu        – Carousel of all flavours (EN/GR)
  /[slug]    – Flavour detail page (optional, phase-2)
/assets      – Static assets (optimised images, logos)
```

---

## 4. CMS Schema (Sanity)
Document: **flavour**
| Field                | Type       | Validation & Notes                                   |
|----------------------|-----------|------------------------------------------------------|
| `name`               | string     | Required, locale-aware (`name.en`, `name.el`)        |
| `description`        | text       | Required, rich text, locale-aware                    |
| `price`              | number     | Required, currency €                                 |
| `smokingTime`        | number     | Required, minutes (int, 30-180)                      |
| `image`              | image      | Required, 1200×1200 preferred size                   |
| `tags`               | array      | Ref → `tag` docs (e.g., *Nicotine-Free*, *Premium*)  |
| `slug`               | slug       | Auto-generated from `name.en`                        |

Document: **tag**
| Field  | Type   | Notes                               |
|--------|--------|-------------------------------------|
| `title`| string | Required, locale-aware              |
| `icon` | image  | Optional (e.g., pictogram)          |

Global: **siteSettings** (for locale-aware UI copy, contact info, WhatsApp number, etc.)

---

## 5. Functional Requirements
1. **Carousel Menu (/menu)**
   • Displays flavour items as `li` elements inside a horizontally scrolling `ul`.
   • Uses CSS Scroll-Driven Animation (`scroll-timeline`, `@scroll`, etc.) to scale/translate items for a cover-flow effect (see `example/example.css`).
   • Snaps each item to centre on drag/scroll (CSS `scroll-snap` toggled via class).
   • Shows flavour `image`, `name`, `price`, and `tags`. Tags rendered as small badges.
   • Responsive `--cover-size` variable: Desktop 15 rem, Tablet 9 rem, Mobile 6 rem.
2. **Localisation**
   • Language toggle in site header (EN/GR).
   • Implemented with a simple language switcher that reloads content in the chosen language (query parameter or separate translated HTML files).
3. **Sanity Integration**
   • Client-side fetch from Sanity's public, read-only dataset using GROQ queries. Optionally, a lightweight Node build script can pre-render HTML for better SEO during deployment.
   • GROQ query returns both language datasets.
4. **Accessibility**
   • Images include `alt` text from `description`.
   • Carousel usable via keyboard (arrow keys & focus styling).
5. **SEO & Social**
   • Each flavour has `og:image`, `title`, `description` meta.
6. **Performance**
   • Images served in WebP/AVIF via Sanity CDN with appropriate `srcset`.
7. **Analytics**
   • Track clicks on "Order via WhatsApp".

---

## 6. Non-Functional Requirements
• **Tech Stack**: Next.js 14, TypeScript, CSS Modules/Tailwind (TBD), Sanity v3.
• **Tech Stack**: Vanilla HTML5, CSS3 (with modern native features such as Scroll-Driven Animations), and JavaScript ES Modules; optional lightweight bundler (e.g., Vite) for local dev convenience; Sanity v3.
• **Hosting**: Vercel or Netlify; preview builds on PRs.
• **Browser Support**: Edge 109+, Chrome 109+, Firefox 109+, Safari 15.6+.
• **Security**: Environment variables for Sanity tokens; no sensitive data in repo.

---

## 7. Future Roadmap (Out of Scope for v1)
1. **Shopping Cart & Checkout** – Persist flavour selections (localStorage), aggregate order, deep-link into WhatsApp API with pre-filled message.
2. **User Accounts / Loyalty** – Save favourite flavours, reward points.
3. **Events & Promotions** – CMS-driven events section.

---

## 8. Open Questions
1. Final list of flavour tags? (*Nicotine-Free*, *Ice*, *Fruit*, etc.)
2. Design assets: logo, colour palette, typography guidelines.
3. Which localisation framework preferred (next-i18next vs built-in)?

---

*Last updated: {{DATE}}* 