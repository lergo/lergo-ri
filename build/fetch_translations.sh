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
    LOCALE_URL="https://phraseapp.com/api/v2/projects/64675c00c0c4482c9fd203fe3e887d55/locales/${1}/download?access_token=${PHRASEAPP_TOKEN}&file_format=nested_json"
    wget -O $TRANSLATIONS_BASE/$1.json "$LOCALE_URL"
}

fetch_location en
fetch_location he
fetch_location ar
fetch_location ru



