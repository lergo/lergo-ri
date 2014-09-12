PIDFILE=lergo.pid
PIDNUMBER=`cat /var/run/$PIDFILE`
PROCFILE=/proc/$PIDNUMBER
if [ ! -e $PROCFILE ] || ! kill -0 $PIDNUMBER; then
    echo 'Service not running' >&2
    return 1
fi

if [ "$USE_FORVER" = "true" ];then
    echo "stopping forever" >&2
    forever stop server.js
    echo "forever stopped" >&2
else
    echo 'Stopping service...' >&2
    kill -15 $(cat "$PIDFILE") && rm -f "$PIDFILE"
    echo 'Service stopped' >&2
fi

