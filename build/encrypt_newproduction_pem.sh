
echo 'encrypt newproduction.pem'
if [ "$1" != "" ];then
    TESTME_KEY="$1"
fi

openssl aes-256-cbc -a -salt -in conf/dev/newproduction.pem -out build/newproduction.pem.enc -pass  pass:$TESTME_KEY