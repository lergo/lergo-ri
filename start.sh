cd "$(dirname "$0")"

echo `pwd`

killall phantomjs
PIDNAME=lergo.pid
PIDFILE=/var/run/$PIDNAME
PIDNUMBER=`cat $PIDFILE`
PROCFILE=/proc/$PIDNUMBER

if [ -e $PROCFILE ] && kill -0 $PIDNUMBER; then
    echo 'Service already running' >&2
    return 1
fi

if [ "$USE_FOREVER" = "true" ]; then
    echo "using forever" >&2
    forever server.js --pidfile /var/run/lergo.pid  -l /var/log/lergo.log -o /var/log/lergo.log -e /var/log/lergo.log  --minUptime 120000 &> /var/log/lergo.log &
    echo "forever started" >&2
else
    echo 'Starting service...' >&2
    node server.js &
    echo $! > /var/run/lergo.pid
    echo 'Service started' >&2
fi

