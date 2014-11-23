if [ "$1" != "" ];then
    TESTME_KEY="$1"
fi

openssl aes-256-cbc -a -salt -in conf/dev/testMe.json -out build/vagrant/synced_folder/testMe.json.enc -pass  pass:$TESTME_KEY