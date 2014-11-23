#!/bin/sh -e

# use this script during jenkins.sh build
# this should hide secret environment variables


openssl aes-256-cbc -d -a -in /vagrant/testMe.json.enc -out $LERGO_ME_CONF -pass pass:$TESTME_KEY