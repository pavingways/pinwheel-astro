npm run build || exit 1
bash scripts/check-placeholders.sh || exit 1
node scripts/check-html-nesting.js || exit 1
rsync -avr --delete-before  \
                         --exclude '.*'  \
                         --exclude '_deploy-dev.sh' \
/Users/Rocco/Develop/pavingways/pavingways.com/dist/* root@164.90.218.79:/var/www/pumptrack/www/
