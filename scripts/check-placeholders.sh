#!/usr/bin/env bash
# Fails when known placeholder text from the original theme is about to ship.
# Run after `yarn build`; wired into bin/deploy-*.sh.
cd "$(dirname "$0")/.." || exit 2

if [ ! -d dist ]; then
  echo "dist/ not found — run \`yarn build\` first."
  exit 2
fi

# historic blog posts are excluded: their content is frozen
matches=$(grep -rlEi "Download The Theme|Donec sollicitudin|Eleanor Pena|lorem ipsum|David Cameron|meta limited|themefisher" dist --include='*.html' | grep -v "/blog/")

if [ -n "$matches" ]; then
  echo "Placeholder content found in dist/ — aborting:"
  echo "$matches"
  exit 1
fi

# unfinished content: skeleton pages (e.g. demo case studies) carry "TODO:"
# markers — they must not reach production. Case-sensitive on purpose;
# /blog/ is excluded so archive posts and articles about code stay unaffected
todos=$(grep -rl "TODO:" dist --include='*.html' | grep -v "/blog/")

if [ -n "$todos" ]; then
  echo "TODO markers found in dist/ — finish or re-draft this content before deploying:"
  echo "$todos"
  exit 1
fi

echo "dist/ is clean of known placeholder content."
