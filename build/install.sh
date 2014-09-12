
init(){
    eval "`wget --no-cache --no-check-certificate -O - http://get.gsdev.info/gsat/1.0.0/install_gsat.sh | dos2unix `"
    SYSCONFIG_FILE=lergo read_sysconfig
}

install_main(){

    init

    yum -y install dos2unix wget



    install_mongo
    /etc/init.d/mongod start || echo "mongo start failed. probably already running. moving on... "

    install_node

    if [ -h /usr/bin/bower ]; then
        echo "bower already installed. skipping ... "
    else
        npm install -g bower
    fi

    if [ -h /usr/bin/phantomjs ]; then
        echo "phantomjs already installed. skipping ... "
    else
        npm install -g phantomjs
        yum install -y freetype
        yum install -y fontconfig
        yum install -y gcc-c++
    fi




    if [ -h /usr/bin/grunt ]; then
        echo "grunt-cli is already installed. skipping.. "
    else
        npm install -g grunt-cli
    fi

    if [ -h /usr/bin/forever ]; then
        echo "forever is already installed. skipping.. "
    else
        npm install -g forever
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

    init

     if [ -z "$BUILD_ID_URL" ]; then
         BUILD_ID_URL="https://guymograbi.ci.cloudbees.com/job/build-lergo/ws/artifacts/build.id"
     fi
     LATEST_BUILD_ID=`wget --no-cache --no-check-certificate -O - $BUILD_ID_URL`
     CURRENT_BUILD_FILE=/var/www/lergo/build.id
     CURRENT_BUILD_ID=""
     if [ -e $CURRENT_BUILD_FILE ]; then
        CURRENT_BUILD_ID=`cat $CURRENT_BUILD_FILE`
     fi

    echo "current build is [$CURRENT_BUILD_ID] and latest is [$LATEST_BUILD_ID]"

     if [ "$LATEST_BUILD_ID" != "" ] && [ "$CURRENT_BUILD_ID" != "$LATEST_BUILD_ID" ]; then
        echo "moving to tmp - hopefully this will resolve the issue"
        cd /tmp
        echo "seems like there's a new build. I will install it"

        # mkdir -p /var/www/lergo/lergo-ri
        # mkdir -p /var/www/lergo/lergo-ui

        echo "install ui"
        LERGO_RI_LOCATION=/var/www/lergo/lib/lergo-ri
        if [ ! -e $LERGO_RI_LOCATION ]; then
            mkdir -p $LERGO_RI_LOCATION
        fi

        if [ -z "$BACKEND_URL" ];then
            BACKEND_URL=https://guymograbi.ci.cloudbees.com/job/build-lergo/ws/artifacts/lergo-ri-0.0.0.tgz
            echo "BACKEND_URL not specified. using default [$BACKEND_URL]"
        fi
        wget $BACKEND_URL -O $LERGO_RI_LOCATION/lergo-ri.tgz

        cd $LERGO_RI_LOCATION
        rm -Rf package
        tar -xzvf lergo-ri.tgz
        ln -Tfs /var/www/lergo/lib/lergo-ri/package /var/www/lergo/lergo-ri

        if [ "$SEO_SUPPORT" != "false" ];then
            echo "installing phantom by default"
            cd /var/www/lergo/lergo-ri
            npm install phantom
        fi

       # npm install $BACKEND_URL --verbose -g --prefix /var/www/lergo
       # ln -Tfs /var/www/lergo/lib/node_modules/lergo-ri/ /var/www/lergo/lergo-ri


        echo "installing ui"
        LERGO_UI_LOCATION=/var/www/lergo/lib/lergo-ui
        if [ ! -e $LERGO_UI_LOCATION ]; then
            mkdir -p $LERGO_UI_LOCATION
        fi

        if [ -z "$FRONTEND_URL" ];then
            FRONTEND_URL=https://guymograbi.ci.cloudbees.com/job/build-lergo/ws/artifacts/lergo-ui-0.0.0.tgz
            echo "FRONTEND_URL not specified. using default [$FRONTEND_URL]"
        fi

        wget $FRONTEND_URL -O $LERGO_UI_LOCATION/lergo-ui.tgz

        cd $LERGO_UI_LOCATION
        rm -Rf package
        tar -xzvf lergo-ui.tgz
        ln -Tfs /var/www/lergo/lib/lergo-ui/package /var/www/lergo/lergo-ui

        #npm install $FRONTEND_URL --verbose -g --prefix /var/www/lergo/
        #ln -Tfs /var/www/lergo/lib/node_modules/lergo-ui/ /var/www/lergo/lergo-ui

        echo $LATEST_BUILD_ID > $CURRENT_BUILD_FILE
        echo "latest build successfully installed. currently installed build is $LATEST_BUILD_ID"
     fi

     init

     cd /var/www/lergo/lergo-ri/build

    echo "updating nginx conf"
     source ./nginx.conf.template > nginx.conf
     /etc/init.d/nginx restart

    #"echo "updating service file"
    # source ./service.template.sh > service.sh
     chmod +x service.sh

     chmod +x /var/www/lergo/lergo-ri/build/*.sh


     if [ -z $ME_CONF_URL ];then
        echo "missing me conf url"
        exit 1
     else
        echo "updating configuration"
        cd /var/www/lergo/lergo-ri
        mkdir -p conf/dev/
        run_wget -O conf/dev/meConf.js $ME_CONF_URL

     fi

     if [ -z $ME_JSON_URL ];then
             echo "missing me json url"
             exit 1
          else
             echo "updating me json configuration"
             cd /var/www/lergo/lergo-ri
             mkdir -p conf/dev/
             run_wget -O conf/dev/me.json $ME_JSON_URL

     fi

     if [ "$PHRASEAPP_TOKEN" != "" ];then
        echo "phraseapp token exists. fetching translations"
        /var/www/lergo/lergo-ri/build/fetch_translations.sh
     else
        echo "phraseapp token does not exist. not fetching translations"
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



