PIDFILE=lergo.pid
PROCFILE=/proc/`cat $PIDFILE`
if [ -e $PROCFILE ]; then
    echo "service is running"
    exit 0
else
    echo "service is stopped"
    exit 0
fi