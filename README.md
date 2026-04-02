# I'm Pumpkin — Travel Blog

A bilingual (English/Vietnamese) travel blog by **Ngọc Thái Thị Bảo**, built with Eleventy and hosted on Firebase for free.

## Tech Stack

| Layer       | Choice                  |
|-------------|-------------------------|
| SSG         | Eleventy v3 (Nunjucks)  |
| CMS         | Decap CMS               |
| Hosting     | Firebase Hosting (free) |
| CI/CD       | GitHub Actions          |
| CSS         | Vanilla CSS             |
| Fonts       | Playfair Display + Inter|

## Pages

| Page          | English              | Vietnamese             |
|---------------|----------------------|------------------------|
| Home          | `/en/`               | `/vi/`                 |
| Blog listing  | `/en/blog/`          | `/vi/blog/`            |
| About         | `/en/about/`         | `/vi/about/`           |
| Gallery       | `/en/gallery/`       | `/vi/gallery/`         |
| Social Media  | `/en/social-media/`  | `/vi/social-media/`    |
| Contact       | `/en/contact/`       | `/vi/contact/`         |
| Blog posts    | `/en/posts/*`        | `/vi/posts/*`          |

## SEO

Every page includes:

- Open Graph and Twitter Card meta tags
- JSON-LD structured data (WebSite, BlogPosting, BreadcrumbList)
- `hreflang` alternate language links
- XML sitemap with bilingual annotations
- `robots.txt`
- Canonical URLs
- Semantic HTML with proper heading hierarchy

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm

### Install dependencies

```bash
npm install
```

### Run locally

```bash
npm start
```

Visit `http://localhost:8080/en/`

### Run with CMS

```bash
npm run dev
```

This starts both the Eleventy dev server and the Decap CMS local backend. Visit `http://localhost:8080/admin/` to create and edit posts with the visual editor.

### Build for production

```bash
npm run build
```

Output is generated in the `_site/` directory.

## Project Structure

```
src/
├── _data/                  # Global data (site config, i18n, navigation)
├── _includes/
│   ├── layouts/            # base.njk, page.njk, post.njk
│   └── partials/           # nav, footer, post-card, seo, jsonld
├── en/                     # English content
│   ├── posts/              # Blog posts (Markdown)
│   ├── blog/               # Blog listing page
│   ├── index.njk           # Home
│   ├── about.njk
│   ├── contact.njk
│   ├── gallery.njk
│   └── social-media.njk
├── vi/                     # Vietnamese content (mirrors en/)
├── assets/
│   ├── css/style.css       # Single stylesheet
│   └── js/main.js          # Minimal JS (nav toggle, lightbox)
├── uploads/                # CMS-uploaded images
├── admin/                  # Decap CMS admin panel
├── sitemap.njk
├── robots.njk
└── index.html              # Root redirect to /en/
```

## Before Deploying

1. **Replace placeholder images** in `src/uploads/blog/` with real photos
2. **Set up Formspree** — create a form at [formspree.io](https://formspree.io) and replace `YOUR_FORM_ID` in `src/en/contact.njk` and `src/vi/contact.njk`
3. **Replace Instagram embed URLs** — update the `EXAMPLE1/2/3` placeholders in `src/en/social-media.njk` and `src/vi/social-media.njk` with real Instagram post/reel URLs
4. **Update social media URLs** in `src/_data/site.js` if the handles differ
5. **Set up Firebase**
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init hosting
   ```
   Select `_site` as the public directory and decline the single-page app option.
6. **Deploy manually**
   ```bash
   npm run build
   firebase deploy --only hosting
   ```
7. **Set up auto-deploy** — push to GitHub and add a `FIREBASE_SERVICE_ACCOUNT` repository secret for the GitHub Actions workflow in `.github/workflows/deploy.yml`

## Writing Blog Posts

### Via the CMS (recommended)

1. Run `npm run dev`
2. Go to `http://localhost:8080/admin/`
3. Click **Blog Posts → New Blog Post**
4. Fill in the fields for both English and Vietnamese
5. Save and publish — the Markdown files are created automatically

### Via Markdown

Create a new `.md` file in both `src/en/posts/` and `src/vi/posts/` with this frontmatter:

```markdown
---
title: "Your Post Title"
description: "Short summary for SEO (150-160 characters)"
date: 2026-04-02
featuredImage: /uploads/blog/your-image.jpg
featuredImageAlt: "Alt text for the image"
category: travel
tags:
  - tag1
  - tag2
featured: false
---

Your post content here...
```

## License

ISC
