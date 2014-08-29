cd "$(dirname "$0")"
echo `pwd`
killall phantomjs
node server.js &
echo $! > /var/run/lergo.pid