source /etc/sysconfig/lergo

LOGFILE=/var/log/lergo_auto_update
CURRENT_BUILD_FILE=/var/www/lergo/build.id
VERSION_BEFORE=""
if [ -e $CURRENT_BUILD_FILE ]; then
     VERSION_BEFORE="`cat $CURRENT_BUILD_FILE`"
fi


FILESIZE=$(stat -c%s "$LOGFILE")
if [ $FILESIZE -gt 1000000 ]; then
     rm -rf $LOGFILE
fi



chmod +x /var/www/lergo/lergo-ri/build/*.sh
chmod +x /var/www/lergo/lergo-ri/*.sh
/etc/init.d/lergo upgrade >> $LOGFILE 2>&1
chmod +x /etc/init.d/lergo

VERSION_AFTER=""
if [ -e $CURRENT_BUILD_FILE ]; then
     VERSION_AFTER="`cat $CURRENT_BUILD_FILE`"
fi



if [ "$VERSION_BEFORE" != "$VERSION_AFTER" ]; then
    /etc/init.d/lergo restart >> $LOGFILE 2>&1
fi


if [ "$POST_UPGRADE_HOOK_URL" != "" ]; then
    wget -O - "$POST_UPGRADE_HOOK_URL" || echo "running system tests failed"
fi



######
# use this script to auto update lergo
# use crontab -e to add the line
#
# * * * * * /usr/bin/update_lergo.sh
