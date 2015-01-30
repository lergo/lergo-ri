
#!/bin/sh
### BEGIN INIT INFO
# Provides:          cwpm
# Required-Start:    $local_fs $network $named $time $syslog
# Required-Stop:     $local_fs $network $named $time $syslog
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Description:       A pool manager for cloudify widget
### END INIT INFO

SYSCONFIG=/etc/sysconfig/lergo
source $SYSCONFIG &> /dev/null
INSTALL_LOCATION=/var/www/lergo/lergo-ri

SERVICE_NAME=lergo
PIDNAME=$SERVICE_NAME
PIDFILE=/var/run/$SERVICE_NAME.pid
LOGFILE=/var/log/$SERVICE_NAME.log

START_SCRIPT="$INSTALL_LOCATION/start.sh"
chmod +x $START_SCRIPT
STOP_SCRIPT="$INSTALL_LOCATION/stop.sh"
chmod +x $STOP_SCRIPT
STATUS_SCRIPT="$INSTALL_LOCATION/status.sh"
chmod +x $STATUS_SCRIPT
RUNAS=root


start() {
  su -c "$START_SCRIPT" $RUNAS
}

stop() {
  su -c "$STOP_SCRIPT" $RUNAS
}

restart(){
   if [ "$USE_FOREVER" = "true" ]; then
       forever restart server.js
   else
       stop
       start
   fi
}

status(){
    su -c "$STATUS_SCRIPT" $RUNAS
}

upgrade(){
    cd $INSTALL_LOCATION/build
    ./upgrade.sh
}


case "$1" in
  start)
    start
    ;;
  stop)
    stop
    ;;
  upgrade)
    upgrade
    ;;
  status)
    status
    ;;
  restart)
    restart
    ;;
  *)
    echo "Usage: $0 {start|stop|restart|upgrade}"
esac

