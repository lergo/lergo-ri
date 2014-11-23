if [ "$1" != "" ];then
    TESTME_KEY="$1"
fi

openssl aes-256-cbc -a -salt -in conf/dev/vagrant-build.json -out build/vagrant-build.json.enc -pass  pass:$TESTME_KEY