echo 'now inside decrypt_jeffkey4lergo_pem.sh'
echo 'TESTME_KEY with -md md5: '

openssl aes-256-cbc -d -a -in build/jeffkey4lergo.pem.enc -out conf/dev/jeffkey4lergo.pem -md md5 -pass pass:$TESTME_KEY
