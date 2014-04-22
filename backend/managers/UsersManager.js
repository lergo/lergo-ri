'use strict';
var appContext = require('../ApplicationContext');
var sha1 = require('sha1');
var logger = appContext.logManager.getLogger('UsersManager');
var dbManager = appContext.dbManager;
var errorManager = appContext.errorManager;

/**
 * This function will return true if userName >= 3 character and should only include
 * alphanumeric and under score else return false;
 *
 * @param userName
 * @returns
 */
function isValidUserName(userName) {
    if (userName === null || typeof (userName) === 'undefined'|| userName.length < 3) {
        return false;
    }
    var usernameRegex = /^[a-zA-Z0-9\_]+$/;
    return userName.match(usernameRegex);
}

/**
 *  Return true if email is valid else return false
 *  This method only checks pattern of email
 * @param email
 * @returns
 */
function isValidEmail(email) {
    if (email === null || typeof (email) === 'undefined' || email.length === 0) {
        return false;
    }
    var emailRegex = /^[A-Za-z0-9._%+-]+@([A-Za-z0-9-]+\.)+([A-Za-z0-9]{2,4}|museum)$/;
    return email.match(emailRegex);
}


exports.saveUser = function (user, callback) {
    logger.info('saving user');
	if (!isValidEmail(user.email)) {
		logger.info('User email [%s] is invalid .',
						user.email);
		callback(new errorManager.InvalidEmail());
	}

    if ( !isValidUserName(user.username) ){
        logger.info('User name [%s] is invalid. User name should not be lesser then 3 characters it should only contain alphanumeric characters and underscore ');
        callback(new errorManager.InvalidUsername());
    }

    exports.getUserByEmail(user.username, function (err, obj) {
        logger.info(arguments);
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

            user.password = sha1(user.password);
            delete user.passwordConfirm;

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
