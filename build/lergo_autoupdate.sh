chmod +x /var/www/lergo/lergo-ri/build/*.sh
chmod +x /var/www/lergo/lergo-ri/*.sh
/etc/init.d/lergo upgrade > /var/log/lergo_auto_update 2>&1
chmod +x /etc/init.d/lergo
/etc/init.d/lergo restart >> /var/log/lergo_auto_update 2>&1



######
# use this script to auto update lergo
# use crontab -e to add the line
#
# * * * * * /usr/bin/update_lergo.sh
