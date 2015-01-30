if [ "$1" != "" ];then
    TESTME_KEY="$1"
fi

openssl aes-256-cbc -a -salt -in conf/dev/vagrant.pem -out build/vagrant.pem.enc -pass  pass:$TESTME_KEY