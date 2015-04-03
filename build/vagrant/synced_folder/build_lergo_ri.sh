set -e
source "/etc/ENVIRONMENT_VARIABLES.sh" || echo "no environment variables"
if [ "$DEBUG_SCRIPT" = "true" ];then
    set -v
    set -x
fi

echo "cloning ri repository"
rm -rf lergo-ri || echo "lergo-ri folder does not exist"
git clone "https://github.com/lergo/lergo-ri.git"
cd lergo-ri

echo "checking out $LERGO_RI_BRANCH branch"
git checkout develop





build_ri(){
    echo "build_ri try :: $1"
    if [ ! -d node_modules ]; then
        rm -Rf node_modules
    fi
    echo "installing"
    npm install || return 1
    echo "installing finished"

    if [ "$RUN_RI_TESTS" = "true" ];then
        echo "decrypting me.json for tests"

        source /vagrant/build_decrypt_test_me_json.sh &>2 /dev/null

        echo "running test before"
        grunt testBefore || exit 1
    else
        echo "not running tests"
    fi

    echo "running grunt.."
    grunt --no-color || exit 1


    if [ "$UPLOAD_COVERAGE" = "true" ];then
        source /vagrant/build_decrypt_s3_json.sh &>2 /dev/null
        echo "uploading coverate for ri"
        grunt uploadStatus --no-color

    fi

    if [ "$RUN_RI_TESTS" = "true" ];then
        grunt testAfter || exit 1
    fi

    cd dist
    npm install --production || return 1

# echo "running npm install on contextify"
# MY_DIR=`pwd`
# cd node_modules/email-templates/node_modules/juice2/node_modules/jsdom/node_modules/contextify/
# npm install
# cd $MY_DIR
# echo "finished running install on contextify"

    npm pack

}

for i in 1 2 3 4 5 6 7 8 9; do build_ri $i && break || sleep 1; done

cd ../..
echo "build ri finished. I am at folder [`pwd`]"
