cd "$(dirname "$0")"

echo `pwd`

SYSCONFIG=/etc/sysconfig/lergo
source $SYSCONFIG &> /dev/null

killall phantomjs
PIDNAME=lergo.pid
PIDFILE=/var/run/$PIDNAME
PIDNUMBER=`cat $PIDFILE`
PROCFILE=/proc/$PIDNUMBER

if [ -e $PROCFILE ] && kill -0 $PIDNUMBER; then
    echo 'Service already running' >&2
    exit 1
fi

if [ "$USE_FOREVER" = "true" ]; then
    echo "using forever" >&2
    mkdir -p /var/log/lergo
    forever  start --pidFile /var/run/lergo.pid  -l /var/log/lergo/process.log -o /var/log/lergo/process.output -e /var/log/lergo/process.error  --append --minUptime 120000 server.js
    echo "forever started" >&2
else
    echo 'Starting service...' >&2
    node server.js &
    echo $! > /var/run/lergo.pid
    echo 'Service started' >&2
fi

