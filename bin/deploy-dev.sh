cd "$(dirname "$0")/.." || exit 1
npx update-browserslist-db@latest || exit 1
npm run build || exit 1
bash scripts/check-placeholders.sh || exit 1
node scripts/check-html-nesting.js || exit 1
rsync -avr --delete-before  \
                         --exclude '.*'  \
                         --exclude '_deploy-dev.sh' \
dist/* root@pilatustools.com:/var/www/pumptrack/www/
