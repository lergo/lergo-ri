#!/bin/sh -e

# use this script during jenkins.sh build
# this should hide secret environment variables


openssl aes-256-cbc -d -a -in conf/s3.json.enc -out $LERGO_S3 -pass pass:$TESTME_KEY