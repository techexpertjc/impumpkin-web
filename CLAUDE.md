# CLAUDE.md

> Context, decisions, and pending work for the Pumpkin travel blog project.
> If you (Claude, future-me, a new contributor) are picking this up — read this file first.

---

## At a glance

A travel blog for **Bao Ngoc** ("Pumpkin") — Vietnamese, social media marketer, loves cultures and food. Built as a static **Eleventy** site, hosted on **Firebase**, with a web-based **Decap CMS** editor at `/admin` so Pumpkin can write blog posts without ever touching markdown or git.

Three featured destinations are baked in as sample posts: **Himachal Pradesh (India)**, **Bangkok (Thailand)**, **Koh Kood (Thailand)**. The home page features them in a parallax-style "magazine spread" hero strip; the `/blogs/` page shows them as pins on a vintage world map.

---

## How this project came to be

The user (Pumpkin's partner) asked for animation/background ideas for a travel blog. I proposed six directions: layered parallax, animated map with drawn route, polaroid stack, globe zoom, horizontal panorama, and color-and-time wash. He picked two and I built standalone HTML demos for both:

1. **Vintage atlas demo** — sepia parchment, drawn route across continents, polaroids appearing at each stop. (Inspired the `/blogs/` map page.)
2. **Illustrated parallax demo** — modernist travel posters, hand-coded SVG layered scenes (sky/far/mid/front), big poster typography, mouse-and-scroll parallax. (Became the home page foundation.)

The user picked the **parallax style for the home page** and **the map for the blog list page**. We agreed on the project-wide goals (SEO-friendly, Firebase-hosted, protected admin route for non-technical Pumpkin, bilingual EN+VI, contact form, newsletter signup, gallery), I asked 13 clarifying questions, he answered all of them, and I scaffolded the full Eleventy + Decap + Firebase project.

This file lives alongside the scaffold so the *why* behind every decision is recoverable later.

---

## Architecture decisions and why

### Eleventy (not Next.js, Astro, Hugo, WordPress, Ghost)

The site is content-heavy but **interaction-light** outside of the home page parallax. Eleventy compiles to plain HTML+CSS+JS, gets perfect Lighthouse scores out of the box, and has no runtime. It's also the simplest static generator to teach someone — markdown files in, HTML files out, with Nunjucks for templating.

Alternatives considered:
- **Next.js / Astro** — overkill for a personal blog with no real interactive state. Astro was the close runner-up and would have been a fine choice; I went with Eleventy for build speed and minimum dependency surface.
- **WordPress / Ghost** — would have given Pumpkin a CMS for free, but the ongoing maintenance burden (security patches, hosting cost, plugin churn) is real and the SEO+performance ceiling is lower.
- **Hugo** — fast but its templating language is harder to read than Nunjucks.

### Decap CMS (not TinaCMS, Sanity, Contentful, Ghost)

Pumpkin needs a real editor UI ("she doesn't know md files"). Decap commits posts as markdown directly to GitHub, which means **content stays in the repo** — fully portable, version-controlled, and free. The editor is hosted as static files (`/admin/index.html`), no third-party service to depend on long-term.

Alternatives considered:
- **TinaCMS** — more polished UI, but free tier requires their cloud service (Tina Cloud) and content is less portable.
- **Sanity** — beautiful, but a third-party DB tier you're chained to.
- **Ghost** — requires a Node server, which means Firebase Hosting alone isn't enough.
- **A custom admin built on Firebase Auth + Firestore + a rich-text editor** — possible, ~2 days of work, brittle, and we'd be reinventing what Decap already does.

The **tradeoff with Decap** is the GitHub OAuth requirement: Pumpkin needs a GitHub account and the partner has to deploy a tiny OAuth proxy (Cloudflare Worker, ~30 lines). One-time setup pain in exchange for zero ongoing cost or vendor lock-in.

### Firebase Hosting (not Netlify, Vercel, Cloudflare Pages)

The user explicitly asked for Firebase. Firebase Hosting is fine for static sites (CDN-backed, free tier generous, fast in Asia), and **Firestore** is a natural fit for the contact form and newsletter list — same project, one billing surface.

If we'd been free to pick: **Netlify** would have been ergonomically nicer (Decap was originally Netlify CMS, and Netlify Identity + Git Gateway sidesteps the OAuth-proxy headache entirely). But the contact form's database choice would still have pulled Firebase in, so we'd have ended up split between two providers anyway. Sticking to all-Firebase keeps it simpler operationally.

### Cloudflare Workers for the OAuth proxy

Decap CMS needs a server-side OAuth handshake with GitHub (the client_secret can't be in the browser). The two practical options:

- **Netlify hosts the OAuth proxy as part of Netlify Identity** — but this would only work if hosting on Netlify, which we aren't.
- **Tiny standalone OAuth proxy** — runs anywhere with HTTPS. Cloudflare Workers free tier is the cheapest, fastest option (100K requests/day free, deploys in ~30 seconds via wrangler).

The worker code is in `cloudflare-worker/worker.js` and is ~30 lines. The README walks through deployment.

### GitHub as the content store + GitHub Actions for deploy

Decap commits posts to GitHub. A GitHub Action (`.github/workflows/deploy.yml`) listens for pushes to `main`, runs `npm run build`, and deploys to Firebase Hosting. So Pumpkin's "Publish" button in `/admin` triggers a chain:

```
[Pumpkin clicks Publish in /admin]
  → Decap commits markdown file to GitHub
  → GitHub Action triggers
  → Eleventy builds the site
  → Firebase Hosting receives new files
  → Pumpkin's site updates (~2 min total)
```

She never sees any of this. She clicks Publish and ~2 minutes later her post is live.

### A single CSS file (not Tailwind, not CSS-in-JS, not modules)

`src/assets/css/main.css` is one file, ~700 lines, organized by section (tokens → reset → header/footer → home → blogs → posts → about → gallery → contact). For a site this size, splitting CSS adds more cognitive overhead than it saves. Tailwind would have made the templates noisier and Pumpkin (or whoever edits later) would have had to learn it.

Tokens at the top of the file are the only thing you need to touch for visual changes:

```css
--c-bg: #f6f1e8;        /* warm parchment background */
--c-ink: #1f1a14;       /* primary text */
--c-accent: #b04830;    /* aged red — links, CTAs, accents */
--font-display: 'Bricolage Grotesque';
--font-serif: 'Instrument Serif';
--font-body: 'Manrope';
```

### Bilingual scaffolded but not fully wired

The user asked for English + Vietnamese. Doing i18n *properly* in Eleventy means duplicating routes (`/en/about/` and `/vi/about/`), which roughly doubles the build complexity. For v1, I:

- Built the full `translations.js` dictionary with **every UI string in EN and VI** ready to go
- Added a language toggle in the header
- Made the toggle currently show a "Vietnamese coming soon" alert
- Designed the post frontmatter with `title`, `title_vi`, `excerpt`, `excerpt_vi`, `body`, `body_vi` fields so Pumpkin can already start writing bilingual content
- Left the routing layer for v1.1

This is a deliberate "ship the 80% now, finish the last 20% when there's actual VI content" call. If the user ever asks to finish it, the work is: install `eleventy-plugin-i18n` (or do it manually), add a `_data/locale.js`, duplicate the page templates under `/vi/`, and read the `*_vi` fields from the post frontmatter.

---

## Design decisions and why

### Visual split: dark/illustrated home, photo-driven inner pages

The home page is the "showpiece" — meant to make a strong impression and showcase the parallax. Inner pages (blogs, gallery, about, contact) prioritize **content legibility over visual flourish**. So the home is moodier and more layered; the rest is clean parchment-tone with strong typography.

This split was explicit in the requirements ("dark/illustrated for home, photo-driven for inner pages"), and it's also good practice: visitors arrive impressed, then read comfortably.

### Fonts

| Font | Role | Why |
|---|---|---|
| **Bricolage Grotesque** | Display, headings, nav | Modern, geometric, distinctive without being trendy |
| **Instrument Serif** | Italic accents, blockquotes | Elegant italic, evokes diary/journal feel — perfect for travel writing |
| **Manrope** | Body text, UI | Highly readable at small sizes, neutral, free |

All from Google Fonts. The combination feels editorial without being pretentious. Pumpkin's voice is warm + a little wry, and these fonts support that.

### Parallax approach: scene composer (50+ illustrated elements)

**This evolved across two iterations.** Initial v1 used the same generic silhouette shapes recolored across all 3 featured posts. That was wrong — the original parallax demo's whole appeal was that *Iceland looked like Iceland and Kyoto looked like Kyoto*. So we built a full **scene composer** in v2.

Each featured post's home-page scene is composed from a library of ~50 illustrated SVG elements organized by layer:

- **Sky decorations** (~10): sun (large/small), crescent moon, full moon, soft clouds, cloud wisps, twinkling stars (animated), flying birds (animated), hot-air balloon (gentle bob), aurora band (animated wave)
- **Far / background** (~12): snowy mountains, jagged peaks, rolling hills, forest mountains, desert dunes, modern city skyline, pagoda/temple skyline, lighthouse — plus underwater far layer (manta ray, distant sea turtle, school of fish, sunken ship)
- **Mid layer** (~14): pine forest, deciduous forest, jungle canopy, mid-distance city silhouette, sailboats (3 boats), fishing boats (3 boats) — plus underwater (clownfish pair, angelfish, blue tang school, jellyfish, jellyfish school, octopus, seahorse, sea turtle close-up)
- **Foreground** (~14): palm trees, pine cluster, sandy shore, ocean waves, jungle leaves/fronds, cherry blossom branch, snow drift, rocks cluster — plus underwater (coral reef, kelp forest, anemone cluster, sea fan, sandy bottom, sunken anchor)
- **Atmosphere overlays** (~6): falling snow, falling rain, drifting fog, fireflies, rising bubbles, plankton particles — all CSS-animated

**Two scene types**: `skyscape` (above water — sky/mountains/forests/coasts) and `underwater` (light rays, sea creatures, coral reefs).

**12 sky/water gradient presets**: sunrise, sunset, golden_hour, clear_day, overcast, twilight, starry_night, beach_day, sunlit_shallows, deep_blue, coral_reef, twilight_ocean. Each preset sets a coordinated palette via CSS variables that the SVG elements pick up via `currentColor`.

**Position slots, not pixel coordinates.** Pumpkin picks from named slots: `sky_left` / `sky_center` / `sky_right` for sky decorations; for far/mid/front layers she just picks ONE element each that spans the full width of that layer. Free XY positioning was deliberately deferred to v2 — slots are easier for a non-designer to think about and prevent visual disasters.

**The current 3 sample posts have hand-tuned scenes:**
- **Himachal Pradesh**: clear_day + snowy mountains + pine forest + pine cluster + sun + soft cloud + falling snow atmosphere
- **Bangkok**: sunset + pagoda skyline + city silhouette + rocks + cloud wisps + small sun (no atmosphere — the city skyline is busy enough)
- **Koh Kood**: beach_day + rolling hills (distant island) + sailboats + palm trees + sun + soft cloud

When Pumpkin marks a new post as featured, she'll get the scene composer fields in the Decap admin and pick her own composition. If she leaves it blank, defaults kick in (`clear_day` preset cycling).

### World map on /blogs — full atlas/journey experience

The `/blogs/` page is the **showpiece of the site alongside the home page** — not a card grid, not a list. It's a single scrolling story:

- The world map is a **fixed background** that stays visible the entire time
- Each blog post is a **full-viewport section** with scroll-snap, presented as a "chapter" in a vintage field notebook
- As you scroll into a new section, the **route line draws** from the previous destination's pin, a **small plane flies along the route**, the new **pin drops with a back-out bounce**, the destination's **content card animates in**, and the **polaroid photo + visa stamp + boarding-pass ticket** all reveal in sequence
- Posts are ordered **chronologically** (oldest first) via a new `journey` collection — the route reads as Pumpkin's actual travel history
- Roman numerals (I, II, III) label each chapter and appear inside each pin
- Page furniture in the corners ("Field Notebook · Vol. I", page numbers in roman numerals, etc.) reinforces the journal aesthetic
- Progress dots on the left side show where you are in the journey
- The compass rotates subtly as you scroll, the map breathes (1.03× scale)

This was adapted from the original `travel-demo.html` atlas demo, made data-driven so any new blog post Pumpkin creates automatically becomes a chapter — she just needs to set `mapX`/`mapY` for the pin position and the system handles route generation, plane animation, chapter numbering, and stamp/ticket placement.

**Why no separate "list" view?** With 3 posts the atlas experience is the right call. If she ever has 30+ posts, the page will get long — at that point we add `/archive/` with a card grid and the atlas page becomes "Featured journey" or similar. Flagged in pending below.

### Why Fraunces + Caveat + Space Mono on the blogs page only

The blogs page uses 4 fonts that are NOT loaded on the rest of the site: **Fraunces** (variable serif with italic + soft axes — for the editorial display type), **Crimson Pro** (body), **Space Mono** (technical/map labels), and **Caveat** (handwritten polaroid captions and tags). These are loaded in `{% block extraCss %}` only on `/blogs/`, so the rest of the site stays light. The fonts together carry the "vintage atlas / field notebook" aesthetic that wouldn't land with just the site-default Bricolage + Manrope.

---

## Content decisions

### Voice: first-person, slightly literary, warm

The user said: "in her voice... 2-3 paragraphs of 2-5 lines... mention she's a social media marketer and loves to travel, she's from Vietnam and loves to try different culture."

I drafted the About page and sample post bodies in a voice that feels like a young, observant traveler — sentences that occasionally break into a single line for rhythm, light humor, no clichés ("life-changing journey," "off the beaten path"). The bio mentions:
- Real name: Bao Ngoc
- Nickname: Pumpkin
- Vietnamese
- Social media marketer
- Loves food, slow travel, cultures

**This is a draft.** Pumpkin will likely want to rewrite it in her own actual voice. The structure (3 paragraphs, ~4 lines each) is right; the words are placeholder until she edits.

### Sample posts

The three sample posts (Himachal Pradesh, Bangkok, Koh Kood) are **fully written** with real content, not lorem ipsum. Each is ~250 words, includes a blockquote, ends with a "if you go" practical note. They serve two purposes:

1. The site doesn't look empty when she opens it
2. They're examples she can edit/replace as templates

She should rewrite them with her actual experiences before launch, but they demonstrate the format and the post template renders properly.

### Voice flags

- The bio mentions "Vietnamese means food is a love language" — this is intentionally a small cultural detail, not stereotyping. If Pumpkin reads it and it feels off, easy to delete.
- The Bangkok post fictionalizes a tuk-tuk driver named Aroon. **Replace with real anecdote** before launch.
- The Himachal post mentions a monkey stealing an apple. Cute but fictional. Replace.

---

## File structure (annotated)

```
pumpkin-blog-new/
├── src/                                 ← all source goes through Eleventy
│   ├── _data/                           ← available as global vars in templates
│   │   ├── site.js                      ← title, social, Firebase config, nav, SEO defaults
│   │   └── translations.js              ← every UI string in EN + VI
│   │
│   ├── _includes/
│   │   ├── layouts/
│   │   │   ├── base.njk                 ← HTML shell, fonts, SEO meta, JSON-LD
│   │   │   ├── page.njk                 ← thin wrapper around base for generic pages
│   │   │   └── post.njk                 ← blog post layout (hero, body, gallery)
│   │   └── partials/
│   │       ├── header.njk               ← fixed nav + lang toggle
│   │       └── footer.njk               ← newsletter form + socials + copyright
│   │
│   ├── posts/                           ← BLOG CONTENT — markdown files
│   │   ├── posts.json                   ← collection config (all posts inherit from this)
│   │   ├── himachal-pradesh.md
│   │   ├── bangkok.md
│   │   └── koh-kood.md
│   │
│   ├── assets/
│   │   ├── css/main.css                 ← ALL styles, ~700 lines, sectioned
│   │   ├── js/
│   │   │   ├── firebase-init.js         ← initializes Firestore SDK once
│   │   │   ├── main.js                  ← nav toggle, lang toggle, newsletter form
│   │   │   ├── parallax.js              ← home page GSAP animations + mouse parallax
│   │   │   ├── contact-form.js          ← contact page → Firestore /messages
│   │   │   └── gallery.js               ← gallery filter tabs + lightbox
│   │   └── images/
│   │       ├── profile/                 ← Pumpkin's portrait (pumpkin.jpg)
│   │       ├── destinations/            ← per-destination folders for hero + gallery
│   │       └── favicon.svg
│   │
│   ├── admin/
│   │   ├── index.html                   ← loads Decap CMS UI
│   │   └── config.yml                   ← defines Pumpkin's editor fields
│   │
│   ├── index.njk                        ← HOME (hero + 3 featured + socials)
│   ├── blogs.njk                        ← BLOG LIST (world map + cards)
│   ├── about.njk                        ← ABOUT (sticky photo + bio)
│   ├── gallery.njk                      ← GALLERY (filtered grid + lightbox)
│   ├── contact.njk                      ← CONTACT (form → Firestore)
│   ├── sitemap.njk                      ← generates /sitemap.xml
│   └── robots.txt
│
├── cloudflare-worker/                   ← OAuth proxy for Decap (deploy once)
│   ├── worker.js
│   └── wrangler.toml
│
├── .github/workflows/deploy.yml         ← auto-deploy on push to main
│
├── firebase.json                        ← hosting config + cache headers
├── firestore.rules                      ← security: writes only, no public reads
├── firestore.indexes.json               ← empty (no compound queries yet)
├── .firebaserc                          ← project ID (REPLACE_ME)
│
├── .eleventy.js                         ← Eleventy build config
├── package.json
├── README.md                            ← setup walkthrough (read this to deploy)
└── CLAUDE.md                            ← you are here
```

---

## How key things work

### Featured posts on the home page

- The home page (`src/index.njk`) loops over `collections.featuredPosts`
- That collection is defined in `.eleventy.js` and filters all posts to those with `featured: true`, sorts by date desc, takes the first 3
- Each post becomes a `.scene-featured` section with a CSS theme picked by index (warm/cool/blush, cycling)
- `parallax.js` finds every `.scene-featured` on the page and assembles a GSAP timeline for the entry animation, then sets up scroll-driven and mouse-driven parallax on the layers

**To change which posts are featured:** Tick "Featured" in `/admin/`, or set `featured: true` in the post markdown. Most-recent-first wins; only 3 ever show.

### The world map / journey on /blogs

Adapted from the original travel-demo.html atlas. The page is a single scrolling story with the map fixed in the background.

**Files involved:**
- `src/blogs.njk` — the page template, loops over `collections.journey` (chronological asc)
- `src/assets/css/blogs-atlas.css` — all atlas-specific styles, scoped to `body.page-blogs`
- `src/assets/js/blogs-atlas.js` — GSAP timeline orchestration

**Build-time generation** (Nunjucks loops in `blogs.njk`):
- One `<g class="pin-group">` per post, positioned at `mapX,mapY`
- One `<path id="route-N">` and one `<path id="glow-N">` per *consecutive pair* of posts (so N-1 routes for N posts). The path is a quadratic bezier `M x1,y1 Q midX,midY x2,y2` where `midY` is offset 60 units above the midpoint to create an upward-arcing flight path
- One `.atlas-dest` section per post, with `data-pin="<index>"` and `data-route="route-<N>"` (empty on first section since there's no route to draw before the first stop)

**Runtime animation** (`blogs-atlas.js`, GSAP + ScrollTrigger + MotionPath):
1. On scroll into a section, find its associated route path
2. Animate `stroke-dashoffset` from `length` → `0` (draws the route)
3. Animate `#plane` along the route using `MotionPathPlugin` with `autoRotate`
4. Drop the pin with `back.out(2.4)` ease
5. Stagger-fade the content card children
6. Polaroid drops in with rotation
7. Stamp scales in, ticket fades up
8. Each animation only plays once per section (`played` flag), so reverse-scrolling doesn't replay

**Scroll snap** is enabled on `body.page-blogs` (mandatory y-axis snap with `scroll-snap-stop: always`). Each section has `scroll-margin-top: 76px` so it snaps below the fixed header. Snap is **disabled below 700px viewport** because mandatory snap feels rigid on phones.

**Roman numerals** are computed via the `romanNumeral` filter in `.eleventy.js` (handles 1-20, falls back to plain numbers above that).

**Page numbers** (the corner label "— iii —") update via a `ScrollTrigger.onToggle` watching each section. The `atlas-page-num` element fades out, swaps text, fades in.

### Old map on /blogs (cards + simple pins)

REMOVED. The previous version of `blogs.njk` had a vintage map at the top with all pins, then a card grid of all posts below. We replaced it with the full atlas/journey experience above. If we ever need a card-grid archive view (when post count gets unwieldy), see "Pending: archive page" below.

### The contact form

`src/contact.njk` has a vanilla HTML form. `src/assets/js/contact-form.js` intercepts submit, validates locally, and writes to Firestore `messages` collection via the JS SDK.

Security:
- **Honeypot field** named `website` — hidden from real users, bots fill it in. If filled, we silently "succeed" and don't write.
- **Firestore rules** in `firestore.rules` enforce required fields, types, and length limits server-side. The browser SDK can't bypass them.
- No reads/updates/deletes allowed from the client. Pumpkin reads messages in the Firebase Console.

### The newsletter signup

Same pattern as the contact form, simpler: just an email goes to Firestore `newsletter` collection. **No mailing-tool integration yet** — see Pending below. For now the user/Pumpkin would manually export the list and import to Buttondown/ConvertKit when ready.

### Admin/CMS auth flow (Decap)

1. Pumpkin visits `/admin/`
2. Decap UI loads, shows "Login with GitHub"
3. She clicks → Decap calls `<oauth-proxy>/auth` (Cloudflare Worker)
4. Worker redirects her to GitHub OAuth
5. She authorizes; GitHub redirects to `<oauth-proxy>/callback?code=...`
6. Worker exchanges the code for an access token (using the GitHub client_secret stored as a Wrangler secret)
7. Worker `postMessage`s the token back to the `/admin/` page
8. Decap uses the token for subsequent GitHub API calls (read posts, commit new posts, upload images)

The client_secret never touches the browser. The worker is the only place that knows it.

### Deploy pipeline

```
Pumpkin clicks Publish in /admin
  ├→ Decap calls GitHub API to commit a markdown file
  ├→ Push to main triggers .github/workflows/deploy.yml
  ├→ GitHub Action checks out, npm ci, npm run build
  └→ FirebaseExtended/action-hosting-deploy uploads _site/ to Firebase Hosting
       └→ ~30s later, the site reflects the change
```

For local dev: `npm start` runs `eleventy --serve --watch` on port 8080.

---

## What's done ✅

Core build:
- [x] Eleventy config with collections, filters, plugins
- [x] All 5 main pages built and rendering (home, blogs, about, gallery, contact)
- [x] 3 sample blog posts with full content
- [x] Blog post template with hero, drop-cap, blockquotes, gallery
- [x] Header with nav + active state + lang toggle
- [x] Footer with newsletter form + social links + copyright
- [x] Mobile responsive (breakpoints at 800px and 900px)

Home page:
- [x] Hero section with profile photo + intro + CTA
- [x] 3 featured-post parallax scenes (sky/far/title/mid/front layers)
- [x] GSAP entry animations + scroll parallax + mouse parallax
- [x] Theme cycling (warm/cool/blush)
- [x] Social cards section at the bottom

Blogs page (atlas/journey):
- [x] Vintage world map fixed as background, stays visible while scrolling
- [x] Each post is a full-viewport snap section (chapter)
- [x] Routes draw between consecutive destinations as you scroll into each
- [x] Plane flies along each route segment using GSAP MotionPath
- [x] Pin drops with back-out bounce on enter
- [x] Polaroid + stamp + boarding-pass ticket reveal per section
- [x] Roman numeral chapter numbering, page numbers in corner update on scroll
- [x] Compass rotates and map breathes subtly with scroll
- [x] Chronological order (oldest first) via `journey` collection
- [x] Snap disabled on mobile (feels rigid on small screens)

Other pages:
- [x] About page with sticky photo and 3-paragraph bio
- [x] Gallery with destination filter tabs and lightbox (keyboard accessible)
- [x] Contact form with validation, honeypot, loading state, success/error UX

Backend integrations:
- [x] Firestore SDK initialized once (firebase-init.js)
- [x] Contact form writes to /messages
- [x] Newsletter writes to /newsletter
- [x] Firestore security rules (writes only, type+length validation)

CMS:
- [x] Decap CMS at /admin
- [x] Full collection config with all post fields (EN + VI)
- [x] Editorial workflow enabled (drafts before publish)
- [x] Image upload field for hero + gallery
- [x] Cloudflare Worker OAuth proxy (~30 lines)

SEO + meta:
- [x] Per-page meta tags (title, description, keywords, canonical)
- [x] Open Graph + Twitter card meta
- [x] JSON-LD structured data (BlogPosting on posts, WebSite on others)
- [x] Sitemap.xml auto-generated
- [x] Robots.txt (allow all, disallow /admin)
- [x] Cache headers in firebase.json (immutable for images, 1 week for CSS/JS, 1 hour for HTML)

DevOps:
- [x] GitHub Actions workflow for auto-deploy
- [x] firebase.json with hosting config
- [x] .gitignore
- [x] Build tested locally — produces 9 pages in ~210ms, 244KB total

Docs:
- [x] README.md with full setup walkthrough
- [x] CLAUDE.md (this file)
- [x] Inline comments on every non-obvious file
- [x] Placeholder README.txt files in image folders telling user what to drop where

---

## What's pending ⏳ (in priority order)

### High priority — required before public launch

- [ ] **Real photos.** Drop into `src/assets/images/profile/pumpkin.jpg` and `src/assets/images/destinations/<dest>/{hero,01,02,03,04,05}.jpg`. Recommended dimensions in README §1.
- [ ] **Real social handles** in `src/_data/site.js` (currently `@pumpkin.travels` placeholders).
- [ ] **Firebase project setup** — create project, paste config into 2 files (README §3). Without this, contact form and newsletter won't work.
- [ ] **First Firebase deploy** to get a live `*.web.app` URL.
- [ ] **GitHub repo + Action** for auto-deploy (README §5).
- [ ] **Decap + Cloudflare Worker setup** so Pumpkin can use `/admin` (README §6). This is the longest single setup but it's one-time.
- [ ] **Pumpkin reviews + rewrites** the About page bio and the 3 sample post bodies in her actual voice.

### Medium priority — finish post-launch

- [ ] **Vietnamese routing.** Currently the lang toggle just shows an alert. Need to:
  1. Set up i18n in Eleventy — either install `eleventy-plugin-i18n` or build it manually with `eleventyComputed`
  2. Duplicate page templates under `/vi/` or use frontmatter-based locale routing
  3. Read `*_vi` fields from post frontmatter
  4. Wire the lang toggle to switch between `/page/` and `/vi/page/`
  5. Add `<link rel="alternate" hreflang="vi" ...>` to base layout for SEO
- [ ] **Newsletter integration.** Right now signups land in Firestore. To actually send newsletters:
  - Easiest: Manually export from Firestore, import to Buttondown / ConvertKit / MailerLite once a month
  - Better: Cloud Function on Firestore `onCreate` for `/newsletter/{id}` that calls the mailing tool's API
- [ ] **OG share image.** `og-image.jpg` is referenced in meta tags but doesn't exist yet. Make a 1200×630 with site title + Pumpkin's photo. Drop it at `src/assets/images/og-image.jpg`.
- [ ] **`favicon.ico`** for legacy browsers (SVG favicon already exists). Generate from the SVG and drop in `src/`.
- [ ] **Logo image.** `src/assets/images/logo.png` is referenced in JSON-LD; replace with a real logo or remove the reference.

### Low priority — discussed and deliberately deferred

- [ ] **Comments on posts.** User explicitly said no. Don't re-add without asking.
- [ ] **Search.** No search yet. If she has 30+ posts, consider Pagefind (build-time, no JS dependency).
- [ ] **Reading time / word count on posts.** Easy to add via an Eleventy filter; deferred for simplicity.
- [ ] **Related posts widget.** Same — easy via tags collection, but adds noise to the post page.
- [ ] **Per-post custom parallax illustrations.** The system supports it (override silhouette SVG per post via frontmatter), but we deliberately chose the photo+generic-silhouette approach so Pumpkin can self-serve new featured posts without an illustrator.
- [ ] **Tag pages** (e.g., `/tags/food/`). Posts have tags but no per-tag listing page. Add `src/tag.njk` with pagination if needed.
- [ ] **Archive page (`/archive/`)** with a simple card grid. Currently `/blogs/` is the full atlas/journey experience which works great for ~3-15 posts. When she has 30+ posts, add `/archive/` as a skimmable grid for "I want to find a specific post" use cases.
- [ ] **RSS feed.** The plugin is installed but no `feed.xml` template was generated. Add one if she wants RSS subscribers.
- [ ] **Analytics.** None installed. Consider Plausible (privacy-friendly, paid) or skip.

---

## Known issues / gotchas 🚨

### CSS variables in scenes are inline-set per scene
In `index.njk` each `.scene-featured` gets its theme via inline `style="--c-sky-1: ...; --c-far: ...;"`. This is intentional (theme cycling per index) but means **don't try to override theme colors in main.css** — they'll get overridden by the inline style. To change themes, edit the `themes` array in `index.njk`.

### GSAP licence
GSAP is free for non-commercial use. **If Pumpkin ever monetizes** (sponsored posts, ads, affiliate links), get a Club GreenSock license. The home page is the only thing that uses GSAP, so worst-case you can swap to native CSS scroll-timeline animations.

### Decap requires Pumpkin to have a GitHub account
There's no way around this with the GitHub backend. The first time the partner sets this up, he should:
1. Create a GitHub account for Pumpkin (or use her existing one)
2. Add her as a **Collaborator** on the repo (Settings → Collaborators → Add)
3. Send her the `/admin` URL once everything's deployed

### Image paths in markdown frontmatter are absolute
Posts have `hero: /assets/images/destinations/.../hero.jpg`. These are absolute paths from the deployed site root, not relative to the markdown file. If you move folders, update the frontmatter.

### Map coordinate system is the SVG viewBox, not lat/long
Don't try to enter `13.7563` for Bangkok's latitude — the map uses arbitrary 0-1000 / 0-560 SVG coordinates. To find the right value, open the rendered `/blogs/` page and visually estimate, or measure in a vector tool. The CMS validates `mapX: 0–1000` and `mapY: 0–560`.

### Firestore rules deploy is separate from Hosting deploy
`firebase deploy --only hosting` does NOT deploy `firestore.rules`. You need `firebase deploy --only firestore:rules` (or just `firebase deploy` to do everything). If the contact form starts returning permission errors after a rules change, that's why.

### Hot-reload doesn't pick up `.eleventy.js` changes
If you edit the Eleventy config, you need to stop and restart `npm start`. Markdown / template / CSS / JS edits hot-reload fine.

### The atlas blogs page won't work without `mapX`/`mapY` on posts
Every post needs `mapX` (0–1000) and `mapY` (0–560) in its frontmatter, or the pin won't render and the route won't compute. If a post is missing these, it'll silently skip the pin. The CMS validates these fields so this should only happen if someone bypasses the CMS and edits markdown directly.

### Mobile experience for the blogs page
Mandatory scroll-snap is disabled below 700px viewport (`scroll-snap-type: none` for that media query) because forced snap feels rigid on phones — the page becomes a continuous scroll instead. The two-column dest layout collapses to single column. Photos go to ~42vh tall. Tested on iPhone-width and Android-width simulator widths.

### "Build fails on first run because of Eleventy version"
We pinned `@11ty/eleventy-plugin-rss` to `^1.2.0` (compatible with Eleventy 2.x). If someone upgrades Eleventy to 3.x, also bump the RSS plugin to ^2.x. The original mismatch wasted ~5 minutes diagnosing.

---

## External dependencies and costs

| Service | Tier | What we use it for | Realistic monthly cost |
|---|---|---|---|
| Firebase Hosting | Spark (free) | Static file hosting + CDN | $0 |
| Firestore | Spark (free) | Contact + newsletter writes | $0 (cap: 50K writes/month) |
| GitHub | Free | Repo + Actions | $0 (cap: 2000 Action minutes/month) |
| Cloudflare Workers | Free | OAuth proxy | $0 (cap: 100K requests/day) |
| Google Fonts | Free | 3 typefaces | $0 |
| GSAP | Free for non-commercial | Home page animations | $0 (until monetization) |
| Decap CMS | Open source | Editor UI | $0 |

Realistic monthly cost for a personal travel blog: **$0** until ~50K monthly visitors or ~50K contact submissions. The first thing to break the free tier would probably be Firestore writes if a spam wave hits the contact form — the honeypot + rate limits should mostly prevent this, but worth monitoring.

---

## Conversation history (key decisions, in order)

1. **User asked for animation/background ideas for a travel blog.** Six directions proposed. → Picked drawn-route-on-map first.
2. **Built atlas demo** (1191 lines, vintage parchment + GSAP MotionPath + polaroids). User then asked for the parallax option too.
3. **Built parallax demo** (1293 lines, illustrated SVG scenes + GSAP timeline + mouse parallax). User loved it.
4. **User asked twice "where did you get the assets from"** — answered: SVG continents/illustrations were hand-coded, parchment textures via SVG noise filters, fonts from Google, GSAP from CDN, Unsplash photos only in the atlas demo (parallax demo has zero external images).
5. **User asked how to maintain/add new destinations.** Explained these were prototypes. Recommended Eleventy + Decap CMS for production.
6. **User chose Eleventy.** Explained the architecture: Eleventy at build time, GSAP at runtime, markdown files with frontmatter, Nunjucks templates loop the data, animation code becomes data-driven.
7. **User asked about specific project details.** Asked 13 clarifying questions. User answered all of them:
   - Project path: `D:\Projects\BaoNgoc\pumpkin-blog-new`
   - Pumpkin = Bao Ngoc, Vietnamese, social media marketer
   - 3 destinations: Himachal Pradesh, Bangkok, Koh Kood
   - ~5 photos per destination, in destination folders
   - About: 2-3 paragraphs first-person
   - Socials: Instagram, YouTube, TikTok
   - Contact form → Firestore
   - No domain yet
   - Visual split: dark home, photo inner pages
   - Blog format: photo-and-prose
   - Bilingual EN+VI
   - No comments
   - Newsletter signup yes
8. **Confirmed architecture in plain language**, then scaffolded everything in this conversation. Build verified (9 pages, 244KB, 210ms build).
9. **User asked for this CLAUDE.md file** to capture everything.

---

## For future Claude (or future me)

### Useful patterns in this codebase

- **Theme cycling on home page scenes** — see `src/index.njk`, the `themes` array. Lets you have visual variety across featured posts without per-post art direction.
- **Translation dictionary in `_data/translations.js`** — lookup with `{% set t = translations[locale or 'en'] %}` then `{{ t.someKey }}`.
- **Eleventy collections in `.eleventy.js`** — `posts` (all sorted by date) and `featuredPosts` (filtered + max 3). Add new collections here, not in templates.
- **Honeypot pattern** in contact-form.js — hidden field named `website`. Effective against ~95% of spam bots without affecting UX.
- **Inline CSS variables for per-instance theming** in `.scene-featured` — useful pattern for per-card or per-post colors without exploding the stylesheet.

### Where to add things

| Task | File |
|---|---|
| New page | `src/<page>.njk`, set `permalink` in frontmatter |
| New post | `src/posts/<slug>.md` with full frontmatter (or use `/admin/`) |
| Change site-wide info (title, socials, Firebase keys) | `src/_data/site.js` |
| Change UI strings | `src/_data/translations.js` |
| Change colors / fonts | Top of `src/assets/css/main.css` (CSS variables) |
| Change build behavior | `.eleventy.js` |
| Change hosting cache rules | `firebase.json` |
| Change CMS fields | `src/admin/config.yml` |
| Add a new post field | Update both `src/admin/config.yml` (CMS) and the post template (`src/_includes/layouts/post.njk` or `src/index.njk` if it's used on home) |

### Don't touch without thinking

- **`firestore.rules`** — these are the only thing protecting Firestore from spam/abuse. Test changes locally with the Firestore emulator before pushing.
- **The `.scene-featured` HTML structure** in `src/index.njk` — `parallax.js` queries it by class names. If you rename layers, update the JS.
- **`firebase-init.js` config values** — paste from Firebase Console exactly. A typo = silent failure on every form submit.
- **Decap `config.yml` `repo:` field** — has to match the actual GitHub repo path or login fails.

### Test before deploying

```bash
npm run clean
npm run build
ls _site                                        # should have 9 pages + assets
npx http-server _site -p 8080                   # or python3 -m http.server 8080 -d _site
# open http://localhost:8080 and click around
```

The build is tiny and fast (~250ms), so do this every time before pushing.

### What I'd do next if I had another hour

1. Wire up Vietnamese routing properly (highest user-visible value)
2. Add a Cloud Function that pings Pumpkin on Telegram/email when a new contact message arrives (so she doesn't have to check Firestore manually)
3. Add a "Reading time" filter and show it on post cards + post detail
4. Replace the SVG continents with a slightly more detailed (but still stylized) world map — current one is recognizable but not flattering
5. Add a 404 page that's on-brand instead of Firebase's default

---

*Last updated: when this scaffold was created. If you make significant changes, update this file too — future you will thank you.*
