# ##################################################### #
#
# This script assume the following directory hierarchy  #
# root                                                  #
#   +---- lergo-ri                                      #
#             +------- build                            #
#                        +------- jekins.sh             #
#   +---- lergo-ui                                      #
#                                                       #
# To run it, you should use the following commands      #
#       cp lergo-ri/build/jenkins.sh .                  #
#        chmod +x ./jenkins.sh                          #
#        source ./jenkins.sh                            #
#                                                       #
#                                                       #
# ##################################################### #


# prerequisites to install on jenkins before each build
 
export DISPLAY=:1
Xvfb :1 &
 
#
# Fetch node, grunt, bower, npm deps, ruby for compass...
#
 
#cd $1
 
curl -s -o ./use-node https://repository-cloudbees.forge.cloudbees.com/distributions/ci-addons/node/use-node
NODE_VERSION=0.10.24 . ./use-node


install_bower_cli(  ){
    npm cache clear
    echo "install bower cli retry ::: $1"
    npm install -g grunt-cli bower
}


for i in 1 2 3 4 5 6 7 8 9; do install_bower_cli $i && break || sleep 1; done
 
curl -s -o ./use-ruby https://repository-cloudbees.forge.cloudbees.com/distributions/ci-addons/ruby/use-ruby
RUBY_VERSION=2.0.0-p247 \
source ./use-ruby
 
gem install --conservative compass

rm -f build.id
echo "building lergo-ui"
cd lergo-ui

install_dependencies(  ){
    echo "retry ::: $1"
    npm cache clear
    if [ ! -e node_modules ]; then
        rm -Rf node_modules
    fi
    npm install || return 1

    if [ ! -e app/bower_components ]; then
       rm -Rf app/bower_components
    fi
    bower cache clean
    bower install || return 1
}

for i in 1 2 3 4 5 6 7 8 9; do install_dependencies $i && break || sleep 1; done

grunt --no-color
grunt s3:uploadCoverage --no-color

COMMITS_TEMPLATE=dist/views/version/_commits.html
VERSION_TEMPLATE=dist/views/version/_version.html
echo "<h1>UI</h1>" > $COMMITS_TEMPLATE
git log  --abbrev=30 --pretty=format:"%h|%an|%ar|%s" -10 | column -t -s '|' >> $COMMITS_TEMPLATE
echo "<h1>BACKEND</h1>" >> $COMMITS_TEMPLATE
cd ..
cd lergo-ri
git log  --abbrev=30 --pretty=format:"%h|%an|%ar|%s" -10 | column -t -s '|' >> ../lergo-ui/$COMMITS_TEMPLATE
cd ..
cd lergo-ui
echo "Build Number : $BUILD_NUMBER <br/> Build ID : $BUILD_ID <br/> Build Name : $BUILD_DISPLAY_NAME <br/> Job Name : $JOB_NAME <br/> Build Tag : $BUILD_TAG <br/>" > $VERSION_TEMPLATE


cd dist 
npm install --production
npm pack

cd ../../

echo "building lergo-ri"

cd lergo-ri
build/build_decrypt_test_me_json.sh
build/build_decrypt_s3_json.sh


build_ri(){
    echo "build_ri try :: $1"
    if [ ! -d node_modules ]; then
        rm -Rf node_modules
    fi
    npm install || return 1
    grunt testBefore || exit 1
    grunt build --no-color || exit 1
    grunt testAfter || exit 1
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


# for future test needs, we have a mongo db for testing for free from cloudbees.
# please note that it is ok to show user/password as this DB is special just for testing.
# it has limited options and we clear it on every commit.
# mongo oceanic.mongohq.com:10078/AvJhGdIv7OYD8AV9va8w -u root -proot  --eval "db.dropDatabase()"


cd ..
cd ..
echo $BUILD_ID > build.id
if [ -e artifacts ]; then
   echo "artifacts folder already exists. deleting it"
   rm -Rf artifacts
   mkdir artifacts
else
   mkdir artifacts
fi

\cp -f lergo-ri/dist/*.tgz artifacts
\cp -f lergo-ui/dist/*.tgz artifacts
\cp -f build.id artifacts
\cp -f lergo-ri/build/install.sh artifacts