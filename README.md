# Fernwood Animal Hospital — Website

A fully responsive veterinary clinic website. No longer a pure static
handoff — it's a deployable **Netlify project with a staff-editable CMS
layer** (Decap CMS + DecapBridge for auth). See `DEPLOYMENT.md` for the
one-time setup walkthrough.

## What's included
Sticky glass nav with mobile menu · animated hero with a "vitals trail"
signature motif (a heartbeat line whose peaks are paw prints, used as the
hero underline and the top scroll-progress bar) · About with mission/vision/
values and animated counters · Meet Our Veterinarians (4 profiles) · 22
animated service cards · Why Choose Us (10 features) · Pet Wellness
membership plans · Adoption & Community · filterable masonry Gallery with
lightbox · Testimonials carousel · full Booking form with validation +
success modal · Emergency & after-hours section · Pet Care Tips articles ·
Facilities & infection-control strip with a virtual tour modal · Awards/
certifications · Patient Forms, financing, patient-portal and prescription-
refill demo modals · accepted payment/insurance strip · FAQ accordion ·
Newsletter · Contact (map embed, click-to-call, WhatsApp/Messenger) · full
footer · floating action buttons · back-to-top · mock AI pet-care chat
assistant · cookie banner · dark mode toggle · page loader · JSON-LD
`VeterinaryCare` schema · Open Graph/Twitter meta.

## Stack
Custom CSS (no framework) using CSS variables for the design system, Google
Fonts (Poppins/Inter/Manrope/Nunito), Font Awesome 6 icons, AOS.js for scroll
reveals, vanilla JS. Design palette follows the brief exactly: white, soft
sage, pastel sky blue, warm sand, soft lavender, light gray, and deep forest
green for headings/CTAs, with one muted brick accent reserved for emergency
elements.

## Netlify + Decap CMS/DecapBridge architecture
Every piece of editable copy — hero, about, community, emergency section,
every section's heading/subtext, clinic contact info, and 9 repeating
collections (vets, services, wellness plans, gallery, testimonials, tips,
FAQ, awards, why-us features) — lives as JSON under `content/`, editable
through a visual CMS at `/admin`.

**The architecture problem this solves:** this is a plain static site with
no build tooling, and Decap's folder collections (one file per item) have no
way to be "listed" by a browser fetching static files directly. The fix:
`scripts/build-content.js` runs on every Netlify deploy (`netlify.toml`),
aggregating `content/**/*.json` into flat arrays under `data/*.json`, which
`js/script.js` fetches at runtime. The full loop — staff edits a field in
`/admin` → Decap CMS commits JSON to GitHub → Netlify auto-builds → site
updates — needs no server or database, just Git as the datastore.

`js/script.js` fetches each `data/*.json` file and falls back to a complete
hardcoded `FALLBACK` object (mirroring the seed content) if any fetch fails —
covering both opening `index.html` directly via `file://` (where `fetch()` of
local files is blocked) and the brief window before a site's first Netlify
build. Both paths were tested explicitly: the fallback path renders the full
page with zero JS errors when `data/*.json` is unreachable, and the live
fetch path was verified by editing a real content file, rebuilding, and
confirming the change appeared on the page (then reverting).

**What's deliberately *not* CMS-wired:** page `<title>`/meta description/OG
tags/JSON-LD schema (need to exist before JS runs, for crawlers), and the
brand name/logo (a rebrand is a bigger job than a content edit). Full
rationale in `DEPLOYMENT.md`.

**Files added for this:** `content/` (76 seed JSON files across 6 settings
files + 9 collections), `data/` (15 compiled JSON files, checked in as a
working baseline), `scripts/build-content.js`, `admin/config.yml` +
`admin/index.html`, `netlify.toml`, `package.json`, `.gitignore`,
`images/uploads/.gitkeep`, `DEPLOYMENT.md`.

## Mobile & tablet responsive audit
Tested across 12 real viewports (iPhone SE through iPad Pro 12.9, plus
laptop/desktop) in a headless browser. Two real bugs were found and fixed:

- **Genuine 26px horizontal overflow at 320px width** (the narrowest common
  phone). Root cause: CSS Grid/Flexbox items default to `min-width:auto`,
  which refuses to shrink below the item's natural content width — once the
  hero's two-column layout collapsed to one column on mobile, this forced
  the whole page wider than the viewport. Fixed by adding `min-width:0` to
  the affected grid children, plus a defensive `overflow-x:hidden` on
  `html` (not just `body` — fixed/absolutely-positioned elements escape
  `body`'s own containing block and aren't clipped by its overflow setting).
- **Several tap targets under the 40px usability minimum** — the hamburger
  button, dark mode/language toggles, gallery filter pills, and testimonial
  carousel dots were all enlarged to proper touch-friendly sizes (44px
  where straightforward; the carousel dots keep a small 9px visual dot but
  now sit inside a 40px invisible hit area).

Re-verified after fixes: zero horizontal overflow and no undersized tap
targets across all 12 viewports, no overlapping fixed UI controls (cookie
banner, chat widget, back-to-top, FAB stack), and every interactive feature
still functions correctly on mobile.

## Before going live
- Follow `DEPLOYMENT.md` to connect GitHub, Netlify, and DecapBridge, then
  edit content through `/admin`.
- Replace placeholder Unsplash photography via `/admin` once set up.
- Wire the booking form, newsletter, refill request, and patient-portal
  login to a real backend or practice management system.
- Replace the mock chat assistant with a real provider.
- Update the JSON-LD schema in `index.html` by hand (stays developer-edited).
- Compile/minify CSS and JS for production and add a real favicon.

## Verification notes
No outbound internet access in the sandbox where this was built, so CDN
assets (Google Fonts, Font Awesome, AOS, Unsplash images) couldn't be
visually screenshot-tested against live network calls. Everything else was
verified directly: structural checks (balanced tags, no duplicate ids, every
anchor resolves, all 101 JSON files parse), the full `node scripts/build-
content.js` pipeline run from a clean state, both the fallback and live-fetch
content-loading paths, the 12-viewport responsive audit, and a full headless
functional pass (mobile menu, dark mode, gallery filter + lightbox, FAQ
accordion, testimonial carousel, booking form validation + success modal,
virtual tour/patient-portal modals, chat assistant) — all with zero console
errors. A real visual pass in a live browser with internet access is
recommended before launch.
