# Editorial calendar & blog workflow

The blog archive (2006–2014, category `historic`) stays untouched. New cornerstone
posts exist to feed the money pages and LinkedIn — target cadence: **one post per
month**, zero in a crunch month is fine.

## Pipeline

| # | Post | Lang | Status | Planned |
|---|---|---|---|---|
| 1 | Was kostet eine App? Der ehrliche Überblick 2026 | DE | **live on merge** — CHF ranges need Rocco's sign-off | Jul 2026 |
| 2 | Ionic/Capacitor vs. React Native vs. Flutter: So wählen wir aus / How We Choose | DE+EN | written, `draft: true` | Aug 2026 |
| 3 | App-Wartung: Was nach dem Launch wirklich anfällt | DE | written, `draft: true` | Sep 2026 |
| 4 | Our production fastlane pipeline for iOS & Android in 2026 | EN | **skeleton — needs real pipeline facts from Jörg/Rocco** | Oct 2026 |
| 5 | 20 years of shipping mobile apps: what changed, what didn't | EN | **skeleton — needs real history; the LinkedIn anniversary piece** | Nov 2026 |
| 6 | Making your API usable by AI agents with MCP | EN | not created — gated on AI offer validation with existing clients | tbd |

## Publishing a scheduled draft

1. Open the post in `src/content/blog/`, review content (and the date — set it to the actual publish day).
2. Remove the `draft: true` line.
3. Merge + deploy. The post appears in the blog index, RSS feeds and sitemap automatically.
4. Diana: repurpose into LinkedIn post(s) — for our size, LinkedIn distribution beats organic search in year one.

## House rules for new posts

- **Language pairing**: single-language posts are fine (archive precedent). If both languages exist, pair them with `translation:` frontmatter in *both* files.
- **Category**: new posts use `insights` (never `historic` — that fences off the archive).
- **Frontmatter**: give every post a real `description` (meta description + RSS) and a real `author`.
- **FAQ sections** (`## Häufige Fragen` / `## Frequently asked questions` with `###` questions) automatically emit FAQPage JSON-LD — use one on high-intent posts.
- **Internal links**: every post should link at least one money page (`/de/app-entwicklung/`, `/de/app-wartung/`, …) and end with a soft CTA to `/de/kontakt/` / `/en/contact/`.
- **No invented facts**: client names, numbers and war stories only with the team's sign-off (and naming approval where clients are identifiable).
