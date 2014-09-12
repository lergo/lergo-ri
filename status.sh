PIDFILE=lergo.pid
PROCFILE=/proc/`cat $PIDFILE`
if [ -e $PROCFILE ]; then
    echo "service is running"
    return 0
else
    echo "service is stopped"
    return 0
fi