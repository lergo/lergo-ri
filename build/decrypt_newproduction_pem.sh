echo 'decrypt new production pem'
echo 'TESTME_KEY with -md md5: '

openssl aes-256-cbc -d -a -in build/newproduction.pem.enc -out conf/dev/newproduction.pem -md md5 -pass pass:$TESTME_KEY
