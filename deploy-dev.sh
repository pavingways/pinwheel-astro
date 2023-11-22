rsync -avr --delete-before  \
                         --exclude '.*'  \
                         --exclude '_deploy-dev.sh' \
/Users/Rocco/Develop/playground/pinwheel-astro/dist/* root@164.90.218.79:/var/www/skatepark/www/
