
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

    if [ -h /etc/init.d/lergo ]; then
        echo "lergo service is already installed"
    else
        ln -s /var/www/lergo/lergo-ri/build/service.sh /etc/init.d/lergo
    fi
}


upgrade_main(){
     init

    cd /var/www/lergo/lergo-ri
    git pull
    rm -Rf node_modules
    npm install

    cd /var/www/lergo/lergo-ui
    git pull
    rm -Rf app/bower_components
    bower --allow-root install --config.interactive=false

    rm -Rf node_modules
    npm install
    grunt build


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



