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

cd "$PAGES_DIR" || exit 1

MAX_ATTEMPTS=5
attempt=1
while :; do
  # Sync to whatever origin/master currently is. Safe even if it has commits we
  # don't know about: the tree below is always fully regenerated from dist/,
  # so there is nothing local to lose by resetting first.
  git fetch origin master || exit 1
  git reset --hard origin/master || exit 1

  rsync -avr --delete-before  \
    --exclude '.*'  \
    --exclude '_deploy-dev.sh' \
    --exclude '_deploy-prod.sh' \
    "$REPO_ROOT/dist/"* ./
  cp "$REPO_ROOT/.gitignore" ./

  git add .
  if git diff --cached --quiet; then
    echo "Nothing to commit."
  else
    git commit -m "release $(date +'%Y-%m-%d')" || exit 1
  fi

  if git push origin master; then
    break
  fi

  if [ "$attempt" -ge "$MAX_ATTEMPTS" ]; then
    echo "Push rejected after $attempt attempts — giving up." >&2
    exit 1
  fi
  echo "Push rejected (remote moved); re-syncing and retrying ($attempt/$MAX_ATTEMPTS)..." >&2
  attempt=$((attempt + 1))
done

cd "$REPO_ROOT" || exit