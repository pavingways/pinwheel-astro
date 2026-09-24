// Checks hreflang integrity of the built site in dist/:
// every page that emits a de/en hreflang pair must (1) reference itself
// correctly, (2) point at a page that actually exists, and (3) be referenced
// back by that page. Catches one-sided `translation:` frontmatter pairs.
// Also checks canonical URLs on indexable localized pages and the homepage
// language alternatives in both HTML and the sitemap.
//
// Usage: yarn build && node scripts/check-hreflang.js

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const BASE = require(path.join(ROOT, "src/config/config.json")).site.base_url;

if (!fs.existsSync(DIST)) {
  console.error("dist/ not found — run `yarn build` first.");
  process.exit(2);
}

function* htmlFiles(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* htmlFiles(p);
    else if (entry.name.endsWith(".html")) yield p;
  }
}

const pairOf = (file) => {
  const html = fs.readFileSync(file, "utf8");
  const pair = {};
  for (const [, lang, href] of html.matchAll(/hreflang="(de|en)" href="([^"]+)"/g)) {
    pair[lang] = href.replace(BASE, "");
  }
  return pair.de && pair.en ? pair : null;
};

const fileFor = (urlPath) => path.join(DIST, urlPath.replace(/\/$/, ""), "index.html");
const urlOf = (file) =>
  file.replace(DIST, "").replace(/\\/g, "/").replace(/\/index\.html$/, "/") || "/";

// Built HTML/XML uses quoted attributes; read them independently of their order.
const attributes = (tag) => Object.fromEntries(
  [...tag.matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/g)].map(([, name, , value]) => [name, value])
);
const linksOf = (markup) => [...markup.matchAll(/<(?:xhtml:)?link\b[^>]*>/g)]
  .map(([tag]) => attributes(tag));

let checked = 0;
let canonicalsChecked = 0;
const problems = [];
for (const file of [...htmlFiles(path.join(DIST, "de")), ...htmlFiles(path.join(DIST, "en"))]) {
  const self = urlOf(file);
  const html = fs.readFileSync(file, "utf8");
  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1] ?? "";
  const metas = [...head.matchAll(/<meta\b[^>]*>/gi)].map(([tag]) => attributes(tag));
  const excluded = metas.some((meta) =>
    (meta.name?.toLowerCase() === "robots" && /\bnoindex\b/i.test(meta.content ?? "")) ||
    meta["http-equiv"]?.toLowerCase() === "refresh"
  );
  if (!excluded) {
    canonicalsChecked++;
    const canonicals = linksOf(head).filter((link) => link.rel === "canonical");
    const expected = new URL(self, BASE).href;
    if (canonicals.length !== 1 || canonicals[0].href !== expected) {
      problems.push(`${self}: expected exactly one canonical to ${expected}, found ${JSON.stringify(canonicals)}`);
    }
  }

  const pair = pairOf(file);
  if (!pair) continue;
  checked++;
  const selfLang = self.startsWith("/de/") ? "de" : "en";
  const otherLang = selfLang === "de" ? "en" : "de";

  if (pair[selfLang] !== self) {
    problems.push(`${self}: hreflang ${selfLang} points at ${pair[selfLang]} instead of itself`);
    continue;
  }
  const counterpartFile = fileFor(pair[otherLang]);
  if (!fs.existsSync(counterpartFile)) {
    problems.push(`${self}: hreflang ${otherLang} -> ${pair[otherLang]} does not exist`);
    continue;
  }
  const back = pairOf(counterpartFile);
  if (!back || back[selfLang] !== self) {
    problems.push(
      `${self}: counterpart ${pair[otherLang]} does not point back (found: ${back ? back[selfLang] : "no hreflang pair"})`
    );
  }
}

const homeAlternates = { de: new URL("/de/", BASE).href, en: new URL("/en/", BASE).href, "x-default": new URL("/", BASE).href };
const checkHomeAlternates = (markup, label) => {
  const links = linksOf(markup).filter((link) => link.rel === "alternate" && link.hreflang);
  if (links.length !== 3 || Object.entries(homeAlternates).some(([lang, href]) =>
    links.filter((link) => link.hreflang === lang && link.href === href).length !== 1
  )) {
    problems.push(`${label}: expected exactly the de, en and x-default homepage alternatives`);
  }
};
const sitemapEntries = fs.readdirSync(DIST)
  .filter((file) => /^sitemap-\d+\.xml$/.test(file))
  .flatMap((file) => [...fs.readFileSync(path.join(DIST, file), "utf8").matchAll(/<url>([\s\S]*?)<\/url>/g)]
    .map(([, entry]) => entry));
for (const home of ["/", "/de/", "/en/"]) {
  checkHomeAlternates(fs.readFileSync(fileFor(home), "utf8"), `${home} HTML`);
  const url = new URL(home, BASE).href;
  const entries = sitemapEntries.filter((entry) => entry.match(/<loc>(.*?)<\/loc>/)?.[1] === url);
  if (entries.length !== 1) {
    problems.push(`${home}: expected exactly one sitemap entry, found ${entries.length}`);
  } else {
    checkHomeAlternates(entries[0], `${home} sitemap`);
  }
}

console.log(`hreflang/canonical check: ${checked} pages with de/en pairs, ${canonicalsChecked} indexable pages, 3 homepage sitemap entries, ${problems.length} problem(s)`);
problems.forEach((p) => console.log("  PROBLEM " + p));
process.exit(problems.length ? 1 : 0);
