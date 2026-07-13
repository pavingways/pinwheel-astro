// Scans the built site in dist/ for tag constructs that are invalid HTML
// and that browsers silently "repair" (breaking styling in the process):
//   - <p> or other block-level elements inside <h1>..<h6>
//   - block-level elements (p, div, ul, ...) inside <p>
// Historic blog-post bodies (frozen WordPress imports) are skipped.
//
// Usage: yarn build && node scripts/check-html-nesting.js

const fs = require("fs");
const path = require("path");

const DIST = path.resolve(__dirname, "..", "dist");

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

const BLOCK = "p|div|ul|ol|li|table|section|article|aside|header|footer|form|blockquote|pre|h[1-6]";
// paragraphs are implicitly closed by any block-level open tag, so an
// explicit </p> is not required for the construct to be broken
const P_WITH_BLOCK = new RegExp(`<p(?:\\s[^>]*)?>(?:(?!</p>|<(?:${BLOCK})[\\s>]).)*<(?:${BLOCK})[\\s>]`, "is");
const HEADING_WITH_BLOCK = new RegExp(`<(h[1-6])(?:\\s[^>]*)?>(?:(?!</h[1-6]).)*<(?:${BLOCK})[\\s>]`, "is");

const problems = [];
for (const file of htmlFiles(DIST)) {
  const rel = path.relative(DIST, file);
  // skip everything below /blog/ except the index itself (frozen post bodies);
  // segment-based so a slug ending in "...blog" can't masquerade as the index
  const segments = rel.split(path.sep);
  const blogIdx = segments.indexOf("blog");
  if (blogIdx !== -1 && segments.length > blogIdx + 2) continue;
  const html = fs.readFileSync(file, "utf8");
  const heading = html.match(HEADING_WITH_BLOCK);
  if (heading) problems.push(`${rel}: block element inside <${heading[1]}>: ${heading[0].slice(0, 100).replace(/\s+/g, " ")}`);
  const p = html.match(P_WITH_BLOCK);
  if (p) problems.push(`${rel}: block element inside <p>: ${p[0].slice(0, 100).replace(/\s+/g, " ")}`);
}

if (problems.length) {
  console.error(`HTML nesting check: ${problems.length} problem(s)`);
  for (const p of problems) console.error("  " + p);
  process.exit(1);
}
console.log("HTML nesting check: no invalid heading/<p> nesting found.");
