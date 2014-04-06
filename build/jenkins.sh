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
NODE_VERSION=0.8.14 . ./use-node

npm install -g grunt-cli bower

curl -s -o ./use-ruby https://repository-cloudbees.forge.cloudbees.com/distributions/ci-addons/ruby/use-ruby
RUBY_VERSION=2.0.0-p247 \
source ./use-ruby

gem install --conservative compass

rm -f build.id
echo "building lergo-ui"
cd lergo-ui

npm install
bower install
grunt build --no-color

cd dist
npm install --production
npm pack

cd ../../

echo "building lergo-ri"

cd lergo-ri
npm install
grunt build --no-color
cd dist
npm install --production
npm pack


# for future test needs, we have a mongo db for testing for free from cloudbees.
# please note that it is ok to show user/password as this DB is special just for testing.
# it has limited options and we clear it on every commit.
mongo oceanic.mongohq.com:10078/AvJhGdIv7OYD8AV9va8w -u root -proot  --eval "db.dropDatabase()"


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