# Deploying Fernwood Animal Hospital to Netlify + Decap CMS (via DecapBridge)

This site is a static build (no framework), plus one small Node script that
lets staff edit content through a visual CMS at `/admin` without touching code.

**How it works, in one sentence:** staff edit a field in `/admin` → Decap CMS
commits a JSON file to GitHub → Netlify rebuilds → `scripts/build-content.js`
aggregates `content/**/*.json` into `data/*.json` → the live site fetches
those files and updates. No database, no server to maintain.

---

## Status for this site

- ✅ `admin/config.yml` is already wired to the real DecapBridge site
  (`johnpaullegaspi/veterinary-clinic-website`, identity/gateway URLs filled
  in — no placeholders left).
- ⬜ Confirm the GitHub repo `johnpaullegaspi/veterinary-clinic-website`
  actually contains this project's files (push everything in this folder if
  you haven't yet).
- ⬜ Confirm Netlify is deploying that exact repo, and that the live URL
  matches `site_url` in `admin/config.yml`
  (`https://fernwood-animal-hospital.netlify.app`).
- ⬜ Visit `https://fernwood-animal-hospital.netlify.app/admin/` and log in
  via DecapBridge to confirm the CMS loads.

If steps 1–3 are already done, skip to **"6. Start editing"** below.

---

## 0. What's already done for you

- ✅ All content is seeded in `content/` (settings + 9 collections, ~76 files)
- ✅ `scripts/build-content.js` aggregates it into `data/*.json` — tested and working
- ✅ `js/script.js` fetches `data/*.json` at runtime, with a complete fallback
  baked in for the rare case a fetch fails (e.g. opening the file directly)
- ✅ `admin/config.yml` maps every editable field to a friendly CMS form
- ✅ `netlify.toml` runs the build script on every deploy

You only need to do the one-time setup below.

---

## 1. Push this project to GitHub

Create a new **GitHub** repository (public or private both work) and push
everything in this folder to it. DecapBridge currently supports GitHub and
GitLab; this guide assumes GitHub.

## 2. Deploy the site to Netlify

1. Go to [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import an existing project**.
2. Pick your GitHub repo.
3. Build settings are already set via `netlify.toml`:
   - Build command: `node scripts/build-content.js`
   - Publish directory: `.` (repo root)
4. Deploy. Note your site's URL (e.g. `https://fernwood-vet.netlify.app`) —
   you'll need it in step 4.

## 3. Create a free DecapBridge account

**Already done for this site** — skip to step 4. (Kept here for reference if
you ever need to recreate the DecapBridge site, e.g. after deleting and
re-adding it.)

Decap CMS needs an identity/auth layer to let non-developers log in and
commit changes. Netlify's own Identity service is deprecated, so this project
uses **[DecapBridge](https://decapbridge.com)** instead — free for small
sites, no Netlify Identity required.

1. Sign up at [decapbridge.com](https://decapbridge.com/auth/signup) (Google,
   Microsoft, or email).
2. In the DecapBridge dashboard, click **Create New Site**.
3. Fill in:
   - **Git provider:** GitHub
   - **Repository:** `your-username/your-repository` (must match exactly)
   - **GitHub access token:** a fine-grained personal access token with
     **read + write access to the repo's Contents** (and **Pull requests**
     too, if you turn on Editorial Workflow later). Create one at
     GitHub → Settings → Developer settings → Personal access tokens →
     Fine-grained tokens.
   - **Admin URL:** `https://your-site.netlify.app/admin/index.html` (the
     URL from step 2)
4. Save. DecapBridge will show you an **Identity URL** and **Gateway URL**
   that look like:
   ```
   identity_url: https://auth.decapbridge.com/sites/your-site-id
   gateway_url:  https://gateway.decapbridge.com
   ```

## 4. Wire DecapBridge into `admin/config.yml`

**Already done for this site** — `admin/config.yml` already has the real
`repo`, `identity_url`, and `gateway_url` values from DecapBridge. Skip to
step 5, unless you ever recreate the DecapBridge site (its ID changes each
time), in which case update the `backend:` block with the new values:

```yaml
backend:
  name: git-gateway
  repo: your-username/your-repository      # <- from step 1
  branch: main
  identity_url: https://auth.decapbridge.com/sites/your-site-id   # <- from DecapBridge
  gateway_url: https://gateway.decapbridge.com                     # <- from DecapBridge
```

Commit and push. Netlify will redeploy automatically.

## 5. Invite your staff

Back in the DecapBridge dashboard, invite collaborators by email (or let them
sign in with Google/Microsoft). They don't need a GitHub account at all.

## 6. Start editing

Visit `https://your-site.netlify.app/admin/` and log in. You'll see the
content model on the left:

- **Site Settings** — clinic info, hero copy, about copy, community/emergency
  sections, and every section's heading/subtext, all as single editable forms
- **Veterinarians, Services, Wellness Plans, Gallery Photos, Testimonials,
  Pet Care Tips, FAQ, Awards & Certifications, Why Choose Us Features** —
  folder collections where you can add, remove, and reorder individual items

Every save commits straight to GitHub and triggers a new Netlify build
(usually live within a minute).

---

## What's *not* wired to the CMS (by design)

- **Page `<title>`, meta description, Open Graph tags, and the JSON-LD
  schema** in `index.html` stay developer-edited. They need to exist before
  any JavaScript runs so search engines and social crawlers see them —
  templating them would need a build-time HTML rewrite beyond this project's
  scope. Update them by hand when the clinic's core details change.
- **The brand name/logo** in the nav and footer is static — a full rebrand
  is a bigger job than a content edit.
- **The virtual tour** (Facilities section) reuses the facility photos
  already in the page; it isn't a separate CMS collection.
- **The mock AI chat assistant, patient portal, and prescription refill
  modals** are demo UI only — see the main README's "Before going live"
  section for what to connect before launch.

## Local development

To preview content changes locally before pushing:

```bash
node scripts/build-content.js   # regenerates data/*.json from content/
python3 -m http.server 8000     # or any static server
# visit http://localhost:8000
```

To test the CMS locally against a local Git repo instead of GitHub, see
[Decap's "Working with a Local Git Repository" guide](https://decapcms.org/docs/working-with-a-local-git-repository/)
— run `npx decap-server` alongside your local server and set
`local_backend: true` in `admin/config.yml`.

## Troubleshooting

- **"Failed to load config.yml"** — make sure `admin/config.yml` is valid
  YAML (an online YAML linter will catch typos fast) and was actually
  deployed (check the Netlify deploy log).
- **Login redirects but nothing happens** — double check `identity_url` and
  `gateway_url` in `config.yml` match exactly what DecapBridge gave you, and
  that the Admin URL you registered with DecapBridge matches your real
  `/admin/index.html` URL.
- **Changes saved in the CMS but not showing on the live site** — check the
  Netlify deploy log; `scripts/build-content.js` logs exactly which
  collections it aggregated and how many items it found in each.
