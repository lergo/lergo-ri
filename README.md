# About cloning out this project

This project has submodules.
To clone it properly you should do one of the following methods

```
git clone --recursive http://my-path

```
git submodule init
git submodule update
```


# Creating admin users

To add an admin user, you should use the following mongodb query

```
db.users.update({ 'username' : 'USERNAME' }, {'$set' : {'isAdmin' : true}})
```



# test configuration

For testing this project requires sensitive configuration.

The passphrase for encryption/decryption is private and you cannot decrypt the file or run the the tests without it.

use the scripts `build/encrypt_test_me_json.sh` and `build/decrypt_test_me_json.sh` to encrypt/decrypt once you know the password

you can either export environment variable TESTME_KEY or feed it to the script as an argument

```
build/encrypt_test_me_json.sh [key]
build/decrypt_test_me_json.sh [key]
```

alternatively you can run the commands directly yourself

The command to encrypt is

```
openssl aes-256-cbc -a -salt -in conf/dev/testMe.json -out conf/testMe.json.enc -pass  pass:__password__
```


The command to decrypt is

```
openssl aes-256-cbc -d -a -in conf/testMe.json.enc -out conf/dev/testMe.json -pass pass:__password__
```




### Running tests

Our configuration service supports picking up configuration from a location disclosed in an environment variable.

So lets say you decrypted `testMe.json` at `/tmp/testMe.json` you need to run

```
export LERGO_ME_CONF=/tmp/testMe.json
```

and then run the test


