// Checks hreflang integrity of the built site in dist/:
// every page that emits a de/en hreflang pair must (1) reference itself
// correctly, (2) point at a page that actually exists, and (3) be referenced
// back by that page. Catches one-sided `translation:` frontmatter pairs.
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

let checked = 0;
const problems = [];
for (const file of [...htmlFiles(path.join(DIST, "de")), ...htmlFiles(path.join(DIST, "en"))]) {
  const pair = pairOf(file);
  if (!pair) continue;
  checked++;
  const self = urlOf(file);
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

console.log(`hreflang check: ${checked} pages with de/en pairs, ${problems.length} problem(s)`);
problems.forEach((p) => console.log("  PROBLEM " + p));
process.exit(problems.length ? 1 : 0);
