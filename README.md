# About cloning out this project

This project has submodules.
To clone it properly you should do one of the following methods


```
git clone --recursive http://my-path


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




## Permissions

The name of permissions represent `<category>.<activity>`

Some permissions are by default `true` to all users. However they are still specified so the entire system will be aligned to a standard.
Enabling such a permissions to someone guarantees that person's ability even if the default behavior was changed to otherwise block him/her.

 - **lessons.userCanEdit** - Whether user can edit the lesson or not. ( default : owner )
 - **lessons.userCanCopy** - Whether user can copy lesson or not. ( default: everyone )
 - **lessons.userCanDelete** - Whether user can delete lesson or not. ( default: owner )
 - **lessons.userCanPublish** - Whether user can publish lessons. ( default : nobody )
 - **lessons.userCanSeePrivateLessons** - Whether user can search unpublished lessons ( default : nobody )
 - **lessons.userCanPreview** - Whether user can preview lesson ( default : owner )
 - **questions.userCanEdit** - Whether user can edit question ( default : owner )
 - **questions.userCanCopy** -  Whether user can copy question ( default : everyone )
 - **questions.userCanDelete** - Whether user can delete question ( default : owner )
 - **users.userCanSeePrivateUserDetails** - Whether or not to display all of user's details ( default : nobody )
 - **users.userCanSeeAllUsers** - Whether user can see all users ( default : nobody )
 - **users.userCanPatchUsers** - Whether user can change other user details ( default : nobody )
 - **reports.userCanDelete** - Whether user can delete report or not ( default : inviter )
 - **reports.userCanDeleteUserInfo** - Whether user can delete user info from report ( default : invitee )
 - **helperContents.userCanEdit** - Whether user can edit helper contents ( default : nobody )
 - **roles.userCanCreate** - Whether user can create role ( default : nobody )
 - **roles.userCanRead** - Whether user can see all roles ( default : nobody )
 - **roles.userCanUpdate** - Whether user can modify role ( default : nobody )
 - **roles.userCanDelete** - Whether user can delete a role ( default : nobody )
 - **abuseReports.userCanRead** - Whether user can see abuse reports ( default : nobody )
 - **abuseReports.userCanDelete** - Whether user can delete abuseReport ( default : nobody )
 - **faqs.userCanCreate** - Whether user can create FAQ ( default : nobody )
 - **faqs.userCanEdit** - Whether user can edit FAQ, currently this also means delete ( default : nobody )
