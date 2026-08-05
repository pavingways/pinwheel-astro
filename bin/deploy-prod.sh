cd "$(dirname "$0")/.." || exit 1
REPO_ROOT="$(pwd)"

ORG="$(git remote get-url origin | sed -E 's#.*[:/]([^/]+)/[^/]+$#\1#')"
PAGES_DIR="$(find "$(dirname "$REPO_ROOT")" -maxdepth 1 -type d -iname "${ORG}.github.io*" | head -1)"
if [ -z "$PAGES_DIR" ]; then
  echo "Could not find a ${ORG}.github.io sibling directory next to $REPO_ROOT" >&2
  exit 1
fi

npx update-browserslist-db@latest || exit 1
npm run build || exit 1
bash scripts/check-placeholders.sh || exit 1
node scripts/check-hreflang.js || exit 1
node scripts/check-html-nesting.js || exit 1
rsync -avr --delete-before  \
  --exclude '.*'  \
  --exclude '_deploy-dev.sh' \
  --exclude '_deploy-prod.sh' \
  dist/* "$PAGES_DIR/"
cp .gitignore "$PAGES_DIR/"
cd "$PAGES_DIR" || exit 1
git add .
git commit -am "release $(date +'%Y-%m-%d')"
git push origin master
cd - || exit
