# Pumpkin Blog 🎒

A travel blog for Bao Ngoc ("Pumpkin"). Static site built with **Eleventy**, hosted on **Firebase**, with a friendly web editor at **`/admin`** so Pumpkin can write posts without touching code.

---

## Quick map of the project

```
pumpkin-blog-new/
├── src/                     ← all site source
│   ├── _data/               ← site config, translations
│   ├── _includes/           ← layouts (base/page/post) + partials (header/footer)
│   ├── posts/               ← blog posts as markdown (3 sample posts included)
│   ├── assets/              ← CSS, JS, images
│   │   └── images/destinations/
│   │       ├── himachal-pradesh/   ← drop her photos here (hero.jpg + 01-05.jpg)
│   │       ├── bangkok/
│   │       └── koh-kood/
│   ├── admin/               ← Decap CMS (the editor UI Pumpkin uses)
│   ├── index.njk            ← home page (parallax featured + social section)
│   ├── blogs.njk            ← blog list with world map + pins
│   ├── about.njk
│   ├── gallery.njk
│   └── contact.njk
├── cloudflare-worker/       ← OAuth proxy for Decap (one-time deploy)
├── .github/workflows/       ← auto-deploy to Firebase on git push
├── firebase.json            ← Firebase Hosting config
├── firestore.rules          ← Firestore security (locks down contact form)
├── .eleventy.js             ← build config
├── package.json
└── README.md                ← you are here
```

---

## Run it locally first (5 minutes)

You need Node.js 18+ installed.

```bash
cd D:\Projects\BaoNgoc\pumpkin-blog-new
npm install
npm start
```

Open http://localhost:8080 — you should see the site with the parallax home page, three sample blog posts, and the world map on `/blogs/`.

> **No real photos yet?** That's fine. The site builds, but image tiles will be broken until you drop her photos into `src/assets/images/destinations/<destination>/`. See [Add real photos](#1-add-her-photos) below.

---

## What's already done ✅

- ✅ Home page with profile-photo hero + 3 featured-blog parallax sections + social-cards section
- ✅ Blog list page with vintage world map and animated pins
- ✅ Individual blog post template (photo-and-prose layout, with drop-cap, blockquotes, gallery)
- ✅ About page with 3-paragraph bio in Pumpkin's voice
- ✅ Gallery page with destination filter tabs and lightbox
- ✅ Contact form that stores submissions in Firestore
- ✅ Newsletter signup form (in footer) that stores emails in Firestore
- ✅ SEO basics: per-page meta tags, Open Graph, Twitter cards, JSON-LD, sitemap.xml, robots.txt
- ✅ Bilingual scaffolding (EN + VI translation dictionary, language toggle in header)
- ✅ Firestore security rules (writes-only contact form, no public reads)
- ✅ Decap CMS at `/admin` — Pumpkin's editor (needs setup steps below)
- ✅ GitHub Actions config to auto-deploy to Firebase on push to `main`
- ✅ Cloudflare Worker code for Decap GitHub OAuth

---

## What needs to be done (in order) 📋

### 1. Add her photos

Drop her photos into the right folders. Naming convention:

```
src/assets/images/profile/pumpkin.jpg              ← her portrait (hero on home + about)
src/assets/images/destinations/himachal-pradesh/
    hero.jpg                                       ← big photo at top of post
    01.jpg, 02.jpg, 03.jpg, 04.jpg, 05.jpg         ← gallery photos
src/assets/images/destinations/bangkok/
    (same structure)
src/assets/images/destinations/koh-kood/
    (same structure)
```

Recommended sizes:
- Hero photos: 1600×1000 px (16:10), JPG, ~250KB each
- Gallery: 1200×1200 px (square), JPG, ~150KB each
- Profile: 800×1000 px (4:5), JPG, ~120KB

If your photo names differ, edit the `hero` and `gallery` paths in `src/posts/*.md`.

### 2. Update social media handles

Open **`src/_data/site.js`** and replace the placeholder handles:

```js
social: {
  instagram: { handle: "@your.real.handle", url: "https://instagram.com/your.real.handle" },
  youtube:   { handle: "@yourchannel",     url: "https://youtube.com/@yourchannel" },
  tiktok:    { handle: "@your.real.handle", url: "https://tiktok.com/@your.real.handle" }
}
```

### 3. Set up Firebase

Create the Firebase project that hosts everything.

1. Go to https://console.firebase.google.com → **Add project** → name it (e.g. `pumpkin-blog`)
2. Skip Google Analytics if you want
3. In the project, click **Build → Firestore Database** → **Create database** → start in **production mode** → pick a region close to Vietnam (e.g. `asia-southeast1`)
4. **Build → Hosting** → **Get started** (skip the CLI walkthrough; we already have config)
5. **Project settings** (gear icon) → scroll down to **Your apps** → click `</>` (web)
   - Nickname: `pumpkin-blog-web`
   - Don't tick "Also set up Firebase Hosting"
   - Click **Register app**
   - Copy the `firebaseConfig` object that appears

6. **Paste those config values into TWO files:**
   - `src/_data/site.js` → the `firebase: { ... }` block
   - `src/assets/js/firebase-init.js` → the `firebaseConfig` object

7. Update `.firebaserc` with your project ID:
   ```json
   { "projects": { "default": "your-project-id-here" } }
   ```

8. Install Firebase CLI on your machine and log in:
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

9. Push the Firestore rules (so the contact form works):
   ```bash
   firebase deploy --only firestore:rules
   ```

### 4. First deploy to Firebase Hosting

```bash
npm run build
firebase deploy --only hosting
```

Your site is now live at `https://your-project-id.web.app`. Open it and check everything renders.

### 5. Set up GitHub repo + auto-deploy

Decap CMS commits Pumpkin's blog posts to GitHub, and a GitHub Action then redeploys to Firebase. Setup:

1. Create a repo at https://github.com/new (private is fine)
2. From the project folder:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/pumpkin-blog-new.git
   git push -u origin main
   ```

3. Create a Firebase service account for the GitHub Action:
   - Firebase Console → **Project settings → Service accounts → Generate new private key**
   - A JSON file downloads. Open it. Copy the entire contents.

4. In your GitHub repo: **Settings → Secrets and variables → Actions → New repository secret**
   - Name: `FIREBASE_SERVICE_ACCOUNT`, value: paste the JSON
   - Name: `FIREBASE_PROJECT_ID`, value: your Firebase project ID

5. Push a small change to `main` and watch the **Actions** tab — it should build and redeploy automatically.

### 6. Set up Decap CMS so Pumpkin can publish from `/admin`

This is the trickiest one-time setup. After this, Pumpkin's workflow is dead simple.

**6a. Register a GitHub OAuth app** (free)

- Go to https://github.com/settings/developers → **New OAuth App**
- Application name: `Pumpkin Blog Admin`
- Homepage URL: `https://your-project-id.web.app`
- Authorization callback URL: `https://decap-oauth-proxy.YOUR-WORKER-NAME.workers.dev/callback`
  (you'll get this URL in step 6b — for now, put a placeholder; you can edit it later)
- Click **Register application**
- Copy the **Client ID**
- Click **Generate a new client secret** → copy the secret

**6b. Deploy the OAuth proxy to Cloudflare Workers** (free tier, 5 minutes)

Cloudflare Workers gives you a tiny serverless URL that handles the GitHub OAuth handshake.

```bash
cd cloudflare-worker
npm install -g wrangler
wrangler login                                # opens a browser, sign up free
wrangler deploy                               # deploys the worker
```

After deploy, Wrangler prints a URL like `https://decap-oauth-proxy.your-name.workers.dev`. Save it.

Now set the GitHub credentials as secrets on the worker:
```bash
wrangler secret put GITHUB_CLIENT_ID          # paste your Client ID when prompted
wrangler secret put GITHUB_CLIENT_SECRET      # paste the secret
```

Go back to your GitHub OAuth app and update the **Authorization callback URL** to:
```
https://decap-oauth-proxy.your-name.workers.dev/callback
```

**6c. Point Decap CMS at your repo + worker**

Open `src/admin/config.yml` and replace:
- `repo: YOUR-GITHUB-USERNAME/pumpkin-blog-new` → your real repo path
- `base_url: https://decap-oauth-proxy.YOUR-WORKER.workers.dev` → your worker URL

Commit, push, GitHub Action redeploys. Done.

**6d. Test it**

Visit `https://your-project-id.web.app/admin/`. Click **Login with GitHub**. You should see Decap's editor UI with the existing 3 posts. Try editing one or creating a new one. Save → publish → wait ~2 min for Action to rebuild → refresh the public site.

### 7. Once everything works: hand it to Pumpkin

Send her this message:

> Hey Pumpkin! Your site is live at `https://your-project-id.web.app` 💖
>
> To write a new blog:
> 1. Go to `https://your-project-id.web.app/admin/`
> 2. Click "Login with GitHub" (use the GitHub account I shared with you)
> 3. Click "New Blog Post"
> 4. Fill in title, destination, country, date, hero photo, body — and tick "Featured" if you want it on the home page (only the 3 most recent featured posts show there)
> 5. Click "Publish"
>
> The site will rebuild automatically in ~2 minutes. Refresh the home page to see it live.

---

## Pumpkin's editing workflow (after setup)

| Action | Where |
|---|---|
| Write a new post | `/admin/` → New Blog Post |
| Edit an existing post | `/admin/` → click a post |
| Mark a post as featured (home page) | Tick the "Featured" box in the editor |
| Add photos | Drag into the editor's image fields |
| See published site | Wait 2 min after Publish, then refresh |
| Read contact form messages | Firebase Console → Firestore → `messages` collection |
| See newsletter signups | Firebase Console → Firestore → `newsletter` collection |

---

## Customising things

**Change the site title / tagline / SEO defaults**
→ `src/_data/site.js`

**Change UI text (button labels, page headings, etc.)**
→ `src/_data/translations.js` (both `en` and `vi`)

**Change colours / fonts / spacing**
→ `src/assets/css/main.css` — top of the file has CSS variables (`--c-bg`, `--c-accent`, `--font-display`, etc.)

**Change which posts appear as "Featured" on the home page**
→ Either tick "Featured" in `/admin/` for that post, or set `featured: true` in the markdown frontmatter. The home page automatically picks the 3 most recent featured posts.

**Add a new destination**
→ `/admin/` → New Blog Post → fill in fields → Publish.
Or manually: drop a new `.md` file in `src/posts/` matching the format of the existing ones.

**Buy a custom domain (when ready)**
→ Buy domain at Namecheap / Google Domains / etc.
→ Firebase Console → Hosting → Add custom domain → follow DNS steps
→ Update `site.url` in `src/_data/site.js`

---

## Things to know

### What's NOT done yet (flagged for later)

- 🟡 **Vietnamese pages**: The translation dictionary exists but page routing for `/vi/` isn't wired up. The lang toggle just shows an "coming soon" alert. To finish: set up Eleventy i18n plugin or duplicate templates under `/vi/`.
- 🟡 **Newsletter integration**: Signups save to Firestore but aren't synced to a mailing tool. When ready, integrate Buttondown or ConvertKit by hooking the Firestore `newsletter` collection to their API via a Cloud Function.
- 🟡 **Real OG image**: `/assets/images/og-image.jpg` is referenced but doesn't exist. Drop in a 1200×630 share image.
- 🟡 **`favicon.ico`**: An SVG favicon is included; for older browsers, also add a 32×32 `favicon.ico` in `/src/`.

### Why this stack

| Choice | Why |
|---|---|
| Eleventy | Static, fastest possible site, perfect SEO, no runtime cost |
| Decap CMS | Free, open-source, gives Pumpkin a real editor; commits markdown to git so content is portable |
| Firebase Hosting | Free tier covers a personal blog easily; CDN built-in; instant rollback |
| Firestore | Free tier handles ~50K contact form submissions/month; rules-based security |
| Cloudflare Worker | Free OAuth proxy for Decap (Decap can't store the GitHub client secret in the browser) |
| GitHub Actions | Auto-deploys on every Decap publish — Pumpkin never sees a deploy script |

### Costs

Everything here is on free tiers. You'd start paying only at scale (~10K monthly visitors / massive image hosting). Realistic monthly cost for a personal travel blog: **$0**.

### Maintenance

- Run `npm update` once every couple of months to pull in security patches
- Rotate the Firebase service account key once a year
- Renew the domain (when you get one) annually

---

## Troubleshooting

**"Build fails locally"** → Make sure you're on Node 18+ (`node -v`). Delete `node_modules` and `package-lock.json`, run `npm install` again.

**"Contact form doesn't submit"** → Open browser DevTools → Console. Most likely you haven't pasted Firebase config into `firebase-init.js`, or the Firestore rules haven't been deployed (`firebase deploy --only firestore:rules`).

**"Decap login redirects to a blank page"** → The OAuth callback URL on GitHub doesn't match your worker URL. Re-check both.

**"Pumpkin published a post but nothing changed on the site"** → Check the **Actions** tab in your GitHub repo — the build might have failed. Click into the latest run to see the error.

**"World map pins are in the wrong place"** → Edit `mapX` (0–1000) and `mapY` (0–560) in the post's frontmatter. The map's coordinate system is the SVG's viewBox: 0,0 is top-left of a roughly equirectangular world.

---

## Credits & licences

- Fonts: Bricolage Grotesque, Instrument Serif, Manrope (Google Fonts, free)
- GSAP: free for non-commercial use; commercial use requires a license. This blog qualifies as non-commercial; if Pumpkin starts running ads or affiliate links, get a Club GreenSock license.

Made with care for Pumpkin 🎃 — go write somewhere warm.
