'use strict';
var appContext = require('../ApplicationContext');
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
            collection.insert(user, function (err) {
                if (!!err) {
                    logger.error('error creating user [%s] : [%s]', user.username, err);
                    callback(new errorManager.InternalServerError());
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

exports.getUserByEmail = function (email, callback) {
    logger.info('getting user with email [%s]', email);
    dbManager.connect('users', function (db, collection, done) {
        collection.findOne({'username': email}, function (err, obj) {
            callback(err, obj);
            done();
        });
    });
};