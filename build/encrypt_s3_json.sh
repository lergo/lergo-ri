if [ "$1" != "" ];then
    TESTME_KEY="$1"
fi

openssl aes-256-cbc -a -salt -in conf/dev/s3.json -out conf/s3.json.enc -pass  pass:$TESTME_KEY