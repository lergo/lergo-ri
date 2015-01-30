if [ "$1" != "" ];then
    TESTME_KEY="$1"
fi

openssl aes-256-cbc -d -a -in build/vagrant-build.json.enc -out conf/dev/vagrant-build.json -pass pass:$TESTME_KEY