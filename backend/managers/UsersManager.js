'use strict';
var appContext = require('../ApplicationContext');
var sha1 = require('sha1');
var logger = appContext.logManager.getLogger('UsersManager');
var dbManager = appContext.dbManager;
var errorManager = appContext.errorManager;

exports.saveUser = function (user, callback) {
    logger.info('saving user');
    exports.getUserByEmail(user.username, function (err, obj) {
        console.log(arguments);
        if (!!err) {
            logger.error('error getting user by email');
            callback(new errorManager.InternalServerError(err, 'searching for user with same username'));
            return;
        }

        if (!!obj) {
            logger.info('user with email [%s] already exists', user.username);
            callback(new errorManager.InvalidUsername());
            return;
        }

        logger.info('user with email [%s] does not exists. creating', user.username);
        dbManager.connect('users', function (db, collection, done) {

            var userToInsert = { username: user.username, password: sha1(user.password) };

            collection.insert(user, function (err) {
                if (!!err) {
                    logger.error('error creating user [%s] : [%s]', user.username, err);
                    callback(new errorManager.InternalServerError());
                    done();
                    return;
                }

                else {
                    logger.info('user [%s] creating successfully. invoking callback', user.username);
                    callback(null, user);
                    done();
                    return;
                }
            });
        });

    });
};


/**
 *
 * find a user according to username/ sha1(password) and calls callback.
 * If user not found, calls callback with "undefined" or "null".
 *
 * loginCredentials : { username, password }
 * @param loginCredentials
 * @param callback
 */
exports.loginUser = function (loginCredentials, callback) {
    logger.info('logging user [%s] in', loginCredentials.username);
    dbManager.connect('users', function (db, collection, done) {
        collection.findOne({'username': loginCredentials.username, 'password': sha1(loginCredentials.password)}, function (err, obj) {
            if ( !obj ){
                callback( new errorManager.InvalidUsername(), null );
                done();
                return;
            } else {
                obj.getId = function(){
                    return obj._id;
                };
                callback(err, obj);
                done();
                return;
            }

        });
    });

};

exports.findUserById = function( userId, callback ){
    logger.info('getting user with id [%s]', userId);
    dbManager.connect('users', function(db, collection, done){

        collection.findOne({'_id': dbManager.id(userId)}, function(err, result){
            if ( !!err ){
                logger.error('unable to query for user [%s]', err.message);
            }
            done();
            callback(err, result);
        })

    });
};

exports.getUserByEmail = function (email, callback) {
    logger.info('getting user with email [%s]', email);
    dbManager.connect('users', function (db, collection, done) {
        collection.findOne({'username': email}, function (err, obj) {
            callback(err, obj);
            done();
        });
    });
};