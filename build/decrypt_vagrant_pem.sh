if [ "$1" != "" ];then
    TESTME_KEY="$1"
fi

openssl aes-256-cbc -d -a -in build/vagrant.pem.enc -out conf/dev/vagrant.pem -pass pass:$TESTME_KEY