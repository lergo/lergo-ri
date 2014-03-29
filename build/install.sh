install_main(){
    yum -y install dos2unix wget

    eval "`wget --no-cache --no-check-certificate -O - http://get.gsdev.info/gsat/1.0.0/install_gsat.sh | dos2unix `"

    install_mongo

    install_node

    install_nginx

    install_git

    DIST=/var/www/lergo
    rm -Rf $DIST
    mkdir -p $DIST
    cd $DIST

    echo "cloning git repositories"

    git clone --recursive https://github.com/lergo/lergo-ri.git
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

    cd /var/www/lergo/lergo-ri/build
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



