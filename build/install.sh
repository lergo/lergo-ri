install_main(){

    if [ ! -f /etc/sysconfig/lergo ]; then
        echo "must have /etc/sysconfig/lergo defined before installation"
        exit 1
    fi

    source /etc/sysconfig/lergo

    yum -y install dos2unix wget

    eval "`wget --no-cache --no-check-certificate -O - http://get.gsdev.info/gsat/1.0.0/install_gsat.sh | dos2unix `"

    install_mongo

    install_node

    if [ -h /usr/bin/bower ]; then
        echo "bower already installed. skipping ... "
    else
        npm install -g bower
    fi

    if [ -h /usr/bin/grunt ]; then
        echo "grunt-cli is already installed. skipping.. "
    else
        npm install -g grunt-cli
    fi

    install_ruby
    install_compass

    install_nginx

    install_git

    DIST=/var/www/lergo
    rm -Rf $DIST
    mkdir -p $DIST
    cd $DIST

    echo "cloning git repositories"

    git clone --recursive https://github.com/lergo/lergo-ri.git

    cd lergo-ri

    echo `pwd`
    git fetch
    git branch -a
    git checkout LERGO4_LERGO5
    cd ..


    git clone https://github.com/lergo/lergo-ui.git

    echo "stopping iptables service"
    service iptables stop

    if [ -h  /etc/nginx/conf.d/lergo.conf ]; then
        echo "symbolic link to nginx already exists. skipping ... "
    else
        echo "creating link to nginx configuration"
        ln -s /var/www/lergo/lergo-ri/build/nginx.conf /etc/nginx/conf.d/lergo.conf
        service nginx restart
    fi
}


upgrade_main(){

    cd /var/www/lergo/lergo-ri
    git pull

    cd /var/www/lergo/lergo-ui
    git pull
    rm -Rf app/bower_components
    bower --allow-root install --config.interactive=false
    grunt build


    cd /var/www/lergo/lergo-ri/build
    source nginx.conf.template > nginx.conf
    service nginx restart


}

set -e
if [ "$1" == "upgrade" ];then

    echo "upgrading"
    upgrade_main
else
    echo "installing"
    install_main
    upgrade_main
fi



