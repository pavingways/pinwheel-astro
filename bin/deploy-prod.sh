npm run build || exit 1
bash scripts/check-placeholders.sh || exit 1
node scripts/check-hreflang.js || exit 1
rsync -avr --delete-before  \
                         --exclude '.*'  \
                         --exclude '_deploy-dev.sh' \
                         --exclude '_deploy-prod.sh' \
/Users/Rocco/Develop/pavingways/pavingways.com/dist/* /Users/Rocco/Develop/pavingways/pavingways.github.io/
cp .gitignore /Users/Rocco/Develop/pavingways/pavingways.github.io/
cd /Users/Rocco/Develop/pavingways/pavingways.github.io/
git add .
git commit -am "release $(date +'%Y-%m-%d')"
git push origin master
cd - || exit
