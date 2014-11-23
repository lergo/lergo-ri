if [ "$1" != "" ];then
    TESTME_KEY="$1"
fi

openssl aes-256-cbc -d -a -in build/vagrant/synced_folder/s3.json.enc -out conf/dev/s3.json -pass pass:$TESTME_KEY