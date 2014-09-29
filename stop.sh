cd "$(dirname "$0")"

echo `pwd`

SYSCONFIG=/etc/sysconfig/lergo
source $SYSCONFIG &> /dev/null
      /var/run/lergo.pid

PIDFILE=lergo.pid
PIDNUMBER=`cat /var/run/$PIDFILE`
PROCFILE=/proc/$PIDNUMBER
if [ ! -e $PROCFILE ] || ! kill -0 $PIDNUMBER; then
    echo 'Service not running' >&2
    exit 1
fi

if [ "$USE_FOREVER" = "true" ];then
    echo "stopping forever" >&2
    forever stop server.js
    echo "forever stopped" >&2
else
    echo 'Stopping service...' >&2
    kill -15 $(cat "/var/run/$PIDFILE") && rm -f "/var/run/$PIDFILE"
    echo 'Service stopped' >&2
fi

