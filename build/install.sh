
init(){
    eval "`wget --no-cache --no-check-certificate -O - http://get.gsdev.info/gsat/1.0.0/install_gsat.sh | dos2unix `"
    SYSCONFIG_FILE=lergo read_sysconfig
}

install_main(){

    init



    yum -y install dos2unix wget



    install_mongo
    service mongod start

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



    DIST=/var/www/lergo

    rm -Rf $DIST
    mkdir -p $DIST
    cd $DIST


    echo "stopping iptables service"
    service iptables stop

    if [ -h  /etc/nginx/conf.d/lergo.conf ]; then
        echo "symbolic link to nginx already exists. skipping ... "
    else
        echo "creating link to nginx configuration"
        ln -s /var/www/lergo/lergo-ri/build/nginx.conf /etc/nginx/conf.d/lergo.conf
        service nginx restart
    fi

    if [ -h /etc/init.d/lergo ]; then
        echo "lergo service is already installed"
    else
        ln -s /var/www/lergo/lergo-ri/build/service.sh /etc/init.d/lergo
    fi
}


upgrade_main(){

     LATEST_BUILD_ID=`wget --no-cache --no-check-certificate -O - https://guymograbi.ci.cloudbees.com/job/build-lergo/ws/build.id`
     CURRENT_BUILD_ID=""
     if [ -e /var/www/lergo/build.id ]; then
        CURRENT_BUILD_ID=`cat /var/www/lergo/build.id`
     fi

    echo "current build is [$CURRENT_BUILD_ID] and latest is [$LATEST_BUILD_ID]"

     if [ "$CURRENT_BUILD_ID" = "$LATEST_BUILD_ID" ]; then
        echo "nothing to upgrade"
        exit 0
     fi
     init

    mkdir -p /var/www/lergo/lergo-ri
    mkdir -p /var/www/lergo/lergo-ui

    BACKEND_URL=https://guymograbi.ci.cloudbees.com/job/build-lergo/ws/lergo-ri/dist/lergo-ri-0.0.0.tgz
    npm install $BACKEND_URL -g --prefix /var/www/lergo/lergo-ri

    FRONTEND_URL=https://guymograbi.ci.cloudbees.com/job/build-lergo/ws/lergo-ui/dist/lergo-ui-0.0.0.tgz
    npm install $FRONTEND_URL -g --prefix /var/www/lergo/lergo-ui

    cd /var/www/lergo/lergo-ri/build

    source nginx.conf.template > nginx.conf
    service nginx restart

    source service.template.sh > service.sh
    chmod +x service.sh


    if [ -z $ME_CONF_URL ];then
        echo "missing me conf url"
        exit 1
    else
        echo "updating configuration"
        cd /var/www/lergo/lergo-ri
        mkdir -p conf/dev/
        run_wget -O conf/dev/meConf.js $ME_CONF_URL

    fi

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



