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


