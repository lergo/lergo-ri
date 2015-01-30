if [ "$1" != "" ];then
    TESTME_KEY="$1"
fi

openssl aes-256-cbc -d -a -in build/vagrant/synced_folder/testMe.json.enc -out conf/dev/testMe.json -pass pass:$TESTME_KEY