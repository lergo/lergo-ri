cd "$(dirname "$0")"
echo `pwd`
node server.js &
echo $! > /var/run/lergo.pid