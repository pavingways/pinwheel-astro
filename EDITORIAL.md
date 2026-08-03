# Editorial calendar & blog workflow

The blog archive (2006–2014, category `historic`) stays untouched. New cornerstone
posts exist to feed the money pages and LinkedIn — target cadence: **one post per
month**, zero in a crunch month is fine.

## Pipeline

| # | Post | Lang | Status | Planned |
|---|---|---|---|---|
| 1 | Was kostet eine App? Der ehrliche Überblick 2026 / What Does an App Cost? | DE+EN | **live on merge** — CHF ranges need Rocco's sign-off; EN twin paired via `translation:` | Jul 2026 |
| 2 | App-Wartung: Was nach dem Launch wirklich anfällt / App Maintenance: What Really Happens After Launch | DE+EN | **live** — `featured: true` so it shows in the top block on `/blog/`; extended with concrete platform examples (16KB pages, CocoaPods sunset, Liquid Glass, new devices) | Aug 2026 |
| 3 | Ionic/Capacitor vs. React Native vs. Flutter: So wählen wir aus / How We Choose | DE+EN | written, `draft: true` | Sep 2026 |
| 4 | Our production fastlane pipeline for iOS & Android in 2026 | EN | **skeleton — needs real pipeline facts from Jörg/Rocco** | Oct 2026 |
| 5 | 20 years of shipping mobile apps: what changed, what didn't | EN | **skeleton — needs real history; the LinkedIn anniversary piece** | Nov 2026 |
| 6 | Making your API usable by AI agents with MCP | EN | not created — gated on AI offer validation with existing clients | tbd |

## Publishing a scheduled draft

1. Open the post in `src/content/blog/`, review content (and the date — set it to the actual publish day).
2. Remove the `draft: true` line.
3. Merge + deploy. The post appears in the blog index, RSS feeds and sitemap automatically.
4. Diana: repurpose into LinkedIn post(s) — for our size, LinkedIn distribution beats organic search in year one.

## Featured posts

`featured: true` pulls a post into the highlighted block at the top of `/blog/`, above
the "Latest posts" heading — regardless of its `date`. This is why the newest post by
date doesn't automatically show up first: a featured post always outranks non-featured
posts, even newer ones.

- Featured posts render side by side (two per row), sorted newest-`date`-first among
  themselves — same as the rest of the site.
- To make a new post the top item on the page: either set `featured: true` on it (it
  joins the featured row) or unset `featured` on whatever currently holds that slot.
- Keep it to 2–3 featured posts at a time. Unset `featured` on older ones as new
  cornerstone posts take over, unless you deliberately want them side by side.

## Post images

Every new post gets a generated cover image instead of reusing `blog-default*.webp` —
run:

```
node scripts/gen-blog-image.js --out <slug> --badges <icon,icon,icon,icon> [--checked 3]
```

- `--out` — becomes the filename: `public/images/blog-<slug>.webp` (1600×850, matches
  the aspect ratio of the existing default images).
- `--badges` — exactly 4 icon names, comma-separated, for the top-left/top-right/
  bottom-left/bottom-right positions around the phone mockup. Available icons: `shield`
  (security), `refresh` (OS/store updates), `certificate` (store policies/compliance),
  `gear` (maintenance/settings), `chart` (cost/growth), `lock` (privacy). Add new icons
  to the `ICONS` registry in the script if a post needs a theme none of these cover.
- `--checked` — how many of the 4 checklist rows on the phone screen render as "done"
  (default 3).

No text is baked into the image, so **one file covers both the DE and EN twin** — point
`image:` at the same `/images/blog-<slug>.webp` in both frontmatter files. Colors are
hardcoded from `src/config/theme.json` (`TEAL`/`LIME`/`NAVY` constants at the top of the
script) — update them there if the brand palette changes.

Example (this post): `node scripts/gen-blog-image.js --out app-maintenance-after-launch --badges shield,refresh,certificate,gear`

## House rules for new posts

- **Language pairing**: single-language posts are fine (archive precedent). If both languages exist, pair them with `translation:` frontmatter in *both* files.
- **Category**: new posts use `insights` (never `historic` — that fences off the archive).
- **Frontmatter**: give every post a real `description` (meta description + RSS) and a real `author`.
- **FAQ sections** (`## Häufige Fragen` / `## Frequently asked questions` with `###` questions) automatically emit FAQPage JSON-LD — use one on high-intent posts.
- **Internal links**: every post should link at least one money page (`/de/app-entwicklung/`, `/de/app-wartung/`, …) and end with a soft CTA to `/de/kontakt/` / `/en/contact/`.
- **No invented facts**: client names, numbers and war stories only with the team's sign-off (and naming approval where clients are identifiable).
