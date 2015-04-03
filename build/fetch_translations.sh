#! /bin/bash

# when pointing cron to this file, omit the extension.
# /etc/cron.hourly/fetch_translation --> .../lergo-ri/build/fetch_translations.sh
# otherwise cron will silently ignore

# the shebang (! /bin/sh ) is also crucial for cron. don't remove it.

set -e

source /etc/sysconfig/lergo

TRANSLATIONS_BASE=/var/www/lergo/lergo-ui/translations

if [ "$PHRASEAPP_TOKEN" = "" ]; then
    echo "PHRASEAPP_TOKEN is missing"
    exit 1
fi


fetch_location(){
    LOCALE_URL="https://phraseapp.com/api/v1/translations/download?auth_token=$PHRASEAPP_TOKEN&locale_name=$1&format=nested_json"
    wget -O $TRANSLATIONS_BASE/$1.json "$LOCALE_URL"
}

fetch_location en
fetch_location he
fetch_location ar
fetch_location ru



