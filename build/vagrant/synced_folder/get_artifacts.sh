set -e
source "/etc/ENVIRONMENT_VARIABLES.sh" || echo "no environment variables"
if [ "$DEBUG_SCRIPT" = "true" ];then
    set -v
    set -x
fi


get_artifacts(){
    rm -f build.id || echo "build.id file does not exist"
    echo $BUILD_ID > build.id
    if [ -e "$ARTIFACTS_HOME" ]; then
        echo "artifacts folder [$ARTIFACTS_HOME] already exists. deleting it"
        rm -Rf $ARTIFACTS_HOME
        mkdir -p $ARTIFACTS_HOME
    else
        mkdir -p $ARTIFACTS_HOME
    fi

    \cp -f lergo-ri/dist/*.tgz $ARTIFACTS_HOME
    \cp -f lergo-ui/dist/*.tgz $ARTIFACTS_HOME
    \cp -f build.id $ARTIFACTS_HOME
    \cp -f lergo-ri/build/install.sh $ARTIFACTS_HOME
}

upload_artifacts(){
    cd /vagrant/tasks
    npm install
    grunt s3:uploadArtifacts
    grunt s3:uploadArtifactsLatest
}

get_artifacts
upload_artifacts