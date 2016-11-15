set -e
source "/etc/ENVIRONMENT_VARIABLES.sh" || echo "no environment variables"
if [ "$DEBUG_SCRIPT" = "true" ];then
    set -v
    set -x
fi

pre_build_ui(){


    echo "cloning ui repository"
    rm -rf lergo-ui || echo "lergo-ui folder does not exist"
    git clone "https://github.com/lergo/lergo-ui.git"
    cd lergo-ui

    echo "checking out $LERGO_UI_BRANCH branch"
    git checkout oct29


}

install_ui_dependencies(  ){
    echo "retry ::: $1"
    npm cache clear
    if [ ! -e node_modules ]; then
        rm -Rf node_modules
    fi
    npm install || return 1

    if [ ! -e app/bower_components ]; then
       rm -Rf app/bower_components
    fi
    bower --config.interactive=false cache clean
    bower --config.interactive=false install || return 1
}

build_ui(){

    grunt --no-color

    if [ "$UPLOAD_COVERAGE" = "true" ]; then
        echo "uploading coverage"
        source /vagrant/build_decrypt_s3_json.sh
        grunt uploadStatus --no-color
    else
        echo "upload coverage is switched off. skipping... "
    fi



    if [ "$POPULATE_BUILD_PAGE" = "true" ];then
        COMMITS_TEMPLATE=dist/views/version/_commits.html
        VERSION_TEMPLATE=dist/views/version/_version.html

        set +e

        echo "<h1>UI</h1>" > $COMMITS_TEMPLATE
        git log  --abbrev=30 --pretty=format:"%h|%an|%ar|%s" -10 | column -t -s '|' >> $COMMITS_TEMPLATE
        echo "<h1>BACKEND</h1>" >> $COMMITS_TEMPLATE
        cd ..
        cd lergo-ri
        git log  --abbrev=30 --pretty=format:"%h|%an|%ar|%s" -10 | column -t -s '|' >> ../lergo-ui/$COMMITS_TEMPLATE
        cd ..
        cd lergo-ui
        echo "Build Number : $BUILD_NUMBER <br/> Build ID : $BUILD_ID <br/> Build Name : $BUILD_DISPLAY_NAME <br/> Job Name : $JOB_NAME <br/> Build Tag : $BUILD_TAG <br/>" > $VERSION_TEMPLATE

        set -e
    else
        echo "skipping build page population..."
    fi


    cd dist
    npm install --production
    npm pack

    cd ../../
    echo "finished building lergo ui"
    echo "I am at [`pwd`] folder"
}


pre_build_ui
for i in 1 2 3 4 5 6 7 8 9; do install_ui_dependencies $i && break || sleep 1; done
build_ui

