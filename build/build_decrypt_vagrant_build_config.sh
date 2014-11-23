#!/bin/sh -e

# use this script during jenkins.sh build
# this should hide secret environment variables
# run this script from lergo-ri root folder


openssl aes-256-cbc -d -a -in build/vagrant-build.json.enc -out $VAGRANT_BUILD_CONF -pass pass:$TESTME_KEY