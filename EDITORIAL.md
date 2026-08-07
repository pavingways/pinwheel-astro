# Editorial calendar & blog workflow

The blog archive (2006–2014, category `historic`) stays untouched. New cornerstone
posts exist to feed the money pages and LinkedIn — target cadence: **one post per
month**, zero in a crunch month is fine.

## Pipeline

| # | Post                                                                                          | Lang | Status | Planned |
|---|-----------------------------------------------------------------------------------------------|---|---|---|
| 1 | Was kostet eine App? Der ehrliche Überblick 2026 / What Does an App Cost?                     | DE+EN | **live on merge** — CHF ranges need Rocco's sign-off; EN twin paired via `translation:` | Jul 2026 |
| 2 | App-Wartung: Was nach dem Launch wirklich anfällt / App Maintenance: What Really Happens After Launch | DE+EN | **live** — extended with concrete platform examples (16KB pages, CocoaPods sunset, Liquid Glass, new devices); `categories: [insights, technology]` | Aug 2026 |
| 3 | Ionic/Capacitor vs. React Native vs. Flutter: So wählen wir aus / How We Choose               | DE+EN | **live** — FAQ section, `aiAssisted: true` and a generated cover image added before publish | Aug 2026 |
| 4 | Our production fastlane pipeline for iOS & Android in 2026                                    | EN | **skeleton — needs real pipeline facts from Jörg/Rocco** | Oct 2026 |
| 5 | 20 years of shipping mobile apps: what changed, what didn't                                   | EN | **skeleton — needs real history; the LinkedIn anniversary piece** | Nov 2026 |
| 6 | Making your API usable by AI agents with MCP                                                  | EN | not created — gated on AI offer validation with existing clients | tbd |

## Publishing a scheduled draft

1. Open the post in `src/content/blog/`, review content, and set `date` to the actual
   current date (today) — never leave the original planned-month placeholder in place.
   This is a standing rule: always use today's date when a draft goes live, do it as
   part of finishing/publishing the post, no need to check in about it first.
2. Remove the `draft: true` line.
3. Merge + deploy. The post appears in the blog index, RSS feeds and sitemap automatically.
4. Diana: repurpose into LinkedIn post(s) — for our size, LinkedIn distribution beats organic search in year one.

## Featured posts

The top block of `/blog/` (above the "Latest posts" heading) always shows exactly two
posts, side by side:

- **Slot 1 is always the single newest post by `date`** — never manually overridden.
- **Slot 2 is the manually flagged `featured` post, if one exists** (anywhere in the
  archive, not just recent posts) — otherwise it falls back to the second-newest post.
  Setting `featured: true` on a post is how you replace slot 2 with it.

So with zero posts flagged `featured` (the current state — nothing is featured right
now), the top block is simply the two newest posts, which is the common case. Flip
`featured: true` on a post only when you deliberately want to keep something in that
second slot regardless of newer posts arriving (e.g. a cornerstone piece you want
visible longer than its natural spot in the date order).

- `featured` is **manual-only** — nothing sets or clears it automatically, and it does
  not default to `true` (schema default is `false`).
- Only one `featured` post is used at a time. If more than one post happens to be
  flagged, the most recent one wins slot 2; the others render normally further down
  the list — so don't rely on flagging several at once.
- Unset `featured` on a post once you no longer want it pinned; the top block then
  reverts to newest + second-newest automatically.
- Implementation: `splitFeaturedPosts()` in `src/lib/utils/sortFunctions.ts`, used by
  both `src/pages/{de,en}/blog/index.astro` (top block + pagination count) and
  `src/pages/{de,en}/blog/page/[slug].astro` (so the two top posts aren't repeated on
  page 2+).

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
  Additionally, whenever a post substantively discusses specific technologies —
  naming frameworks, platforms, languages or dev tools as a real topic, not just a
  passing generic mention of "apps" or "cross-platform" — add `technology` too, e.g.
  `categories: [insights, technology]`. Applied retroactively to all three live
  cornerstone posts (cost, maintenance, framework comparison), since all three name
  concrete frameworks/platforms/tools. Skeleton posts (#4 fastlane, #5 20-years) will
  almost certainly qualify too once actually written — decide when writing them, not
  before.
- **Frontmatter**: give every post a real `description` (meta description + RSS) and a real `author`.
- **FAQ sections** (`## Häufige Fragen` / `## Frequently asked questions` with `###` questions) automatically emit FAQPage JSON-LD — use one on high-intent posts.
- **Internal links**: every post should link at least one money page (`/de/app-entwicklung/`, `/de/app-wartung/`, …) and end with a soft CTA to `/de/kontakt/` / `/en/contact/`.
- **No invented facts**: client names, numbers and war stories only with the team's sign-off (and naming approval where clients are identifiable).
- **AI disclosure**: every new post generated with AI help gets `aiAssisted: true` in its frontmatter. `BlogSingle.astro` renders the localized disclosure line (`blog.ai_disclosure` in `src/lib/i18n.json`) under the byline automatically — no manual text needed in the post body.
