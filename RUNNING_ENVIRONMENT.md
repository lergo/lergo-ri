# Using docker-compose

For ease of use, we added a docker-compose.yml file.
Simply run `docker-compose up` to run mongo & redis.

Alternatively - run individual containers (see instructions below)

# Running mongo using docker

1. Choose a location to keep the DB files.
2. Run command

```
docker run mongo -p 27017:27017 -v /my/own/datadir:/data/db -d mongo
```

**Running mongo query on docker**

Get the running docker ID using `docker ps`

```
docker exec -it <container_id> mongo
```

This will open the mongo client CLI.

# Running redis using docker

```
docker run -p 6379:6379 -d redis
```


# Setup configuration file

To setup configuration for local use do the following:
1. copy `conf/prod.json` under `conf/dev/me.json`
2. change `hmacKey` to be any key.
3. change `translations.method` to be `files`


And you're good to go.

# Seeding the Database

After you "signup" to your local lergo you will need to
1. modify your permissions.
2. validate your email address.


You can easily do both with the following mongo query (replace username)

```
db.users.update({username: 'YOUR_USERNAME'}, {$set: {isAdmin: true, validated: true}})
```
