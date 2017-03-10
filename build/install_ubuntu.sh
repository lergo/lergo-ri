# tested on ami : ami-9a380b87

set -e

run_wget(){
    wget --no-cache --no-check-certificate $*
}

sudo_wget(){
    sudo wget --no-cache --no-check-certificate $*
}

init(){

    source /etc/sysconfig/lergo
    sudo bash -c "echo installing..." # check that I am a sudoer
}

install_main(){

    init

    ( which dos2unix && echo "dos2unix installed.." ) || ( echo "installing dos2unix..." && sudo apt-get  -y install dos2unix && echo "dos2unix installed successfully..." )
    ( which wget && echo "wget installed..." ) || ( echo "installing wget..." && sudo-apt-get -y install wget && echo "wget installed successfully..." )


    ( which mongod && echo "mongo installed..." ) || ( echo "installing mongo..." && sudo apt-get install -y mongodb && echo "mongo installed successfully..." )

    /etc/init.d/mongodb start || echo "mongo start failed. probably already running. moving on... "

    ( which node && echo "node already installed..." ) || ( echo "installing nodejs-legacy..." && sudo apt-get install -y nodejs-legacy &&  echo "nodejs installed successfully..." )

    ( which npm && echo "npm already installed..." ) || ( echo "installing npm ... " && sudo apt-get install -y npm && echo "npm installed successfully..." )


    PHANTOMJS_INSTALLED=` ( which phantomjs && echo 0 ) || echo 1 `
    if [ "$PHANTOMJS_INSTALLED" = "1" ]; then
        echo "phantomjs already installed. skipping ... "
    else
        echo "installing phantomjs..."
        sudo npm install -g phantomjs
        # yum install -y freetype
        # yum install -y fontconfig
        # yum install -y gcc-c++

        echo "phantomjs installed successfully... "
    fi


    ( which forever && echo "forever already installed...") || ( echo "installing forever..." && sudo npm install -g forever && echo "forever installed successfully..." )


    ( which nginx && echo "nginx already installed..." ) || ( echo "installing nginx..." && sudo apt-get -y install nginx && echo "nginx installed successfully..." )


    DIST=/var/www/lergo

    sudo rm -Rf $DIST
    sudo mkdir -p $DIST
    cd $DIST

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
            sudo mkdir -p $LERGO_RI_LOCATION
        fi

        if [ -z "$BACKEND_URL" ];then
            BACKEND_URL=https://guymograbi.ci.cloudbees.com/job/build-lergo/ws/artifacts/lergo-ri-0.0.0.tgz
            echo "BACKEND_URL not specified. using default [$BACKEND_URL]"
        fi
        echo "downloading backend"
        sudo wget $BACKEND_URL -O $LERGO_RI_LOCATION/lergo-ri.tgz

        cd $LERGO_RI_LOCATION
        sudo tar -tzf lergo-ri.tgz >/dev/null
        if [ $? != 0 ]; then
            echo  "tar file is incorrect"; exit 1
        else
            echo "tar file is ok"
        fi

        sudo rm -Rf package
        sudo tar -xzvf lergo-ri.tgz
        sudo ln -Tfs /var/www/lergo/lib/lergo-ri/package /var/www/lergo/lergo-ri

        if [ "$SEO_SUPPORT" != "false" ];then
            echo "installing phantom by default"
            cd /var/www/lergo/lergo-ri
            sudo npm rebuild # generates the .bin folder that is missing from package
            sudo npm install phantom
        fi

       # npm install $BACKEND_URL --verbose -g --prefix /var/www/lergo
       # ln -Tfs /var/www/lergo/lib/node_modules/lergo-ri/ /var/www/lergo/lergo-ri


        echo "installing ui"
        LERGO_UI_LOCATION=/var/www/lergo/lib/lergo-ui
        if [ ! -e $LERGO_UI_LOCATION ]; then
            sudo mkdir -p $LERGO_UI_LOCATION
        fi

        if [ -z "$FRONTEND_URL" ];then
            FRONTEND_URL=https://guymograbi.ci.cloudbees.com/job/build-lergo/ws/artifacts/lergo-ui-0.0.0.tgz
            echo "FRONTEND_URL not specified. using default [$FRONTEND_URL]"
        fi

        sudo wget $FRONTEND_URL -O $LERGO_UI_LOCATION/lergo-ui.tgz

        cd $LERGO_UI_LOCATION
        sudo rm -Rf package
        sudo tar -xzvf lergo-ui.tgz
        sudo ln -Tfs /var/www/lergo/lib/lergo-ui/package /var/www/lergo/lergo-ui

        #npm install $FRONTEND_URL --verbose -g --prefix /var/www/lergo/
        #ln -Tfs /var/www/lergo/lib/node_modules/lergo-ui/ /var/www/lergo/lergo-ui

        sudo bash -c "echo $LATEST_BUILD_ID > $CURRENT_BUILD_FILE"
        echo "latest build successfully installed. currently installed build is $LATEST_BUILD_ID"
     fi

     init

     cd /var/www/lergo/lergo-ri/build

    echo "updating nginx conf... and with ssl certificates..."


     if [ -z $SSL_CERTIFICATE_KEY ];then
        echo "missing ssl certificate key"
        exit 1
     else
        echo "updating ssl certificate"
        sudo mkdir -p /etc/ssl/private/
        sudo chmod 755 /etc/ssl/private/
        sudo_wget -O /etc/ssl/private/ssl.certificate.key "$SSL_CERTIFICATE_KEY"
        echo " certificate key installed "
        sudo_wget -O /etc/ssl/private/ssl.certificate "$SSL_CERTIFICATE"
        echo " ssl certificate installed "
        sudo_wget -O /etc/ssl/private/dhparam.pem  "$DHPARAM"
        echo " dhparam pem installed ... this should give us A+ "
        echo ""

     fi



     sudo -E bash -c "export DOMAIN=\"$DOMAIN\"; export MORE_DOMAINS=\"$MORE_DOMAINS\"; source ./nginx.conf.template > nginx.conf"
     sudo ln -Tfs /var/www/lergo/lergo-ri/build/nginx.conf /etc/nginx/sites-enabled/lergo.conf



     sudo /etc/init.d/nginx restart

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
        sudo mkdir -p conf/dev/
        run_wget -O /tmp/meConf.js "$ME_CONF_URL"
        sudo mv /tmp/meConf.js conf/dev/meConf.js

     fi

     if [ -z $ME_JSON_URL ];then
             echo "missing me json url"
             exit 1
          else
             echo "updating me json configuration"
             cd /var/www/lergo/lergo-ri
             sudo mkdir -p conf/dev/
             run_wget -O /tmp/me.json "$ME_JSON_URL"
             sudo mv /tmp/me.json conf/dev/me.json

     fi

     if [ "$PHRASEAPP_TOKEN" != "" ];then
        echo "phraseapp token exists. fetching translations"
        sudo -E bash -c "/var/www/lergo/lergo-ri/build/fetch_translations.sh"
     else
        echo "phraseapp token does not exist. not fetching translations"
     fi



    if [ -h /etc/init.d/lergo ]; then
        echo "lergo service is already installed"
    else
        sudo ln -s /var/www/lergo/lergo-ri/build/service.sh /etc/init.d/lergo
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



