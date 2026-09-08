# pavingways.com

Astro site (theme-forked from Themefisher Pinwheel).

## Blog posts

**Read `EDITORIAL.md` before creating, editing, or publishing any blog post.** It is
the source of truth for: the editorial pipeline (which posts are planned/live and
what's still needed for each), the publish checklist, featured-post slot rules, the
cover-image generation command, and house rules (categories, required frontmatter,
FAQ→JSON-LD, internal linking, AI disclosure). Don't duplicate that content here —
this file only covers things EDITORIAL.md doesn't.

**No invented facts.** Client names, numbers, pipeline/infrastructure details and
company history only go in copy with the team's explicit sign-off. Skeleton posts in
`src/content/blog/` that are blocked on real input from Jörg/Rocco/Diana say so in a
`{/* TODO */}` comment — ask before filling those in rather than drafting plausible
content.

## Positioning

Full-lifecycle app partner "since 2006" (requirements → development → store
deployment → years of maintenance). Team of three: **Diana** (digital marketing),
**Jörg** (software development), **Rocco** (software engineering & consulting) — only
Rocco's full name is public (imprint); don't invent Diana's/Jörg's last names.

Focus offers: cross-platform dev (Ionic/Capacitor, React Native, Flutter), CI/CD with
fastlane + test automation, productized app-maintenance subscription, app
marketing/ASO. AI/MCP integration is a **differentiator page, not the headline
identity** — and that offer needs validation with existing clients before it gets a
page built. Never use "günstig" in copy.

Trust-asset clients: Deutsche Telekom, DVAG, VHV, Suva, Coop, PostFinance, HSLU, FHNW,
Eppendorf — NDA/logo rights need clearing before naming them in case studies.

## Hosting & deployment

Deployed to **GitHub Pages** — `bin/deploy-prod.sh` builds `dist/` and rsyncs it into
the sibling repo `../pavingways.github.io` (CNAME www.pavingways.com), then commits
and pushes there. `bin/deploy-dev.sh` rsyncs to a DigitalOcean box (pumptrack)
instead — a separate site, not a staging mirror of prod.

GitHub Pages cannot do server-side redirects — every redirect must be a static
meta-refresh page or client-side JS.

**URL policy: never rename existing URLs.** `/blog/` stays `/blog/`; archive posts
(2006–2014, category `historic`) stay untouched and are never edited for style/rules
that apply to new posts.

## i18n

German lives at `/de/`, English at `/en/` (`prefixDefaultLocale: true,
redirectToDefaultLocale: false`). `/` is a client-side language-detector page
(`src/pages/index.astro`). Every page stamps its language via an inline script in
`Base.astro`. Blog posts are **single-language** via `language:` frontmatter — pairs
across languages (translated posts, divergent-slug pages) declare each other via
`translation:` frontmatter; same-slug routes (home, blog index, categories) pair
automatically. Run `yarn check-hreflang` after touching routing/redirects/blog i18n —
it validates the built `dist/` and exits 1 on one-sided pairs. The i18n
`fallback: en→de` option must stay **removed** (its generated stubs shadow real pages
sharing a route pattern).

## Analytics

GoatCounter (cookieless), site code `pavingways`. Conversion events wired in
`Base.astro`: `contact-phone`, `contact-email`, `contact-calendly`. Rocco wants to move
away from Calendly toward a custom contact form (decided, not yet built).

## Contact form

Endpoint is a self-made service Rocco provides (200 = success, error status + JSON
error object) — configured as `config.contact.form_endpoint`. Confirm it's pointed at
the real URL, not the `/api/contact` placeholder, before deploying changes that touch it.

## Useful commands

```
npm run dev               # local dev server
npm run build              # production build
npm run check-hreflang     # validate de/en pairing in dist/
npm run check-placeholders # deploy guard against leftover template placeholders
npm run check-nesting      # HTML nesting validation
npm run deploy-dev         # build + deploy to the DigitalOcean dev box (bin/deploy-dev.sh)
npm run deploy-prod        # build + deploy to GitHub Pages (bin/deploy-prod.sh)
node scripts/gen-blog-image.js --out <slug> --badges <icon,icon,icon,icon>  # blog cover image, see EDITORIAL.md
```
