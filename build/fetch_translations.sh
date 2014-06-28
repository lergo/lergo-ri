set -e
eval "`wget --no-cache --no-check-certificate -O - http://get.gsdev.info/gsat/1.0.0/install_gsat.sh | dos2unix `"
SYSCONFIG_FILE=lergo read_sysconfig

TRANSLATIONS_BASE=/var/www/lergo/lergo-ui/translations

check_exists PHRASEAPP_TOKEN

fetch_location(){
    LOCALE_URL="https://phraseapp.com/api/v1/translations/download?auth_token=$PHRASEAPP_TOKEN&locale_name=$1&format=nested_json"
    wget -O $TRANSLATIONS_BASE/$1.json "$LOCALE_URL"
}

fetch_location en
fetch_location he
fetch_location ar
fetch_location ru



