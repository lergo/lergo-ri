
echo 'encrypting jeffkey4lergo'
if [ "$1" != "" ];then
    TESTME_KEY="$1"
fi

openssl aes-256-cbc -a -salt -in conf/dev/jeffkey4lergo.pem -out build/jeffkey4lergo.pem.enc -pass  pass:$TESTME_KEY