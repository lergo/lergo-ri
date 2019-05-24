'use strict';

/**
 * @module UsersController
 * @type {exports}
 */

var managers = require('../managers');
var permissions = require('../permissions');
var services = require('../services');
var logger = managers.log.getLogger('UsersController');
var User = require('../models/User');
var async = require('async');
var disqusClient = services.disqus.configure(services.conf.disqus).client;

logger.info('initializing');

exports.getUserPublicDetails = function (req, res) {
    res.send(User.getUserPublicDetails(req.sessionUser));
};


/**
 *
 * @description
 * get user profile either by provided username or by user on session.
 *
 * @param req
 * @param res
 */
exports.getProfile = function(req, res){
    logger.debug('getting profile');
    var username = req.params.username || req.sessionUser.username;

    if (req.sessionUser) {
        async.waterfall([
            function getUser( done ){
                logger.debug('finding user ' + username );
                User.findByUsername( username , function (err, result) {
                    if (!!err || !result) {
                        done(new managers.error.InternalServerError(err, 'unable to find user profile'));
                        return;
                    }
                    logger.debug('found user', result);
                    done(null,User.getUserPublicDetails(result));
                });
            },
            function getUserStats( user, done ){
                logger.trace('get user stats');
                User.getStats( user._id , function( err, stats ){
                    if ( !!err || !stats ){
                        done(new managers.error.InternalServerError(err, 'failed getting user statistics'));
                        return;
                    }
                    user.stats = stats;
    
                    done(null,user);
                });
            }
        ], function allDone(err, result){
            if ( err ){
                err.send(res);
            }
            res.send(result);
        });
    } else {
        async.waterfall([
            function getUserNotLoggedIn( done ){
                logger.debug('finding user ' + username );
                User.findByUsername( username , function (err, result) {
                    if (!!err || !result) {
                        done(new managers.error.InternalServerError(err, 'unable to find user profile'));
                        return;
                    }
                    logger.debug('found user', result);
                    done(null,User.getUserPublicDetails(result));
                });
            }
           
        ], function allDone(err, result){
            if ( err ){
                err.send(res);
            }
            res.send(result);
        });
    }
};


exports.getMyPermissions = function( req, res ){
    res.send( { permissions : req.sessionUser.permissions , limitations : req.sessionUser.permissionsLimitations} );
};

exports.signup = function (req, res) {
    var user = req.body;
    managers.users.createUser(req.emailResources, user, function (err, obj) {
        if (!!err) {
            err.send(res);

            return;
        } else {
            res.send({
                'username': obj.username,
                'message' : 'created successfully'
            });
            return;
        }
    });
};

// returns the disqus sso details required
exports.disqusLogin = function (req, res) {
    res.send(disqusClient.ssoObj({
        'id'      : req.sessionUser._id,
        'username': req.sessionUser.username,
        'email'   : req.sessionUser.email
    }));
};

// the validation email is sent after signup or after login. user must provide
// username and password.
exports.resendValidationEmail = function (req, res) {

    var loginCredentials = req.body;
    managers.users.loginUser(loginCredentials, function (err, loggedInUser) {
        if (!!err) {
            err.send(res);
            return;
        }
        if (!loggedInUser) {
            new managers.error.WrongLogin().send(res);
            return;
        }

        if (!!loggedInUser.validated) {
            new managers.error.UserAlreadyValidated().send(res);
            return;
        }

        managers.users.sendValidationEmail(req.emailResources, loggedInUser, function (err, user) {
            if (!!err) {
                err.send(res);
                return;
            }

            if (!user) {
                new managers.error.InternalServerError(null, 'did not get a user after sending validation email').send(res);
                return;
            }

            res.send(User.getUserPublicDetails(user));
        });

    });
};

exports.getAll = function (req, res) {
    managers.users.complexSearch(req.queryObj, function(err, result) {
        if (!!err) {
            new managers.error.InternalServerError(err, 'unable to get all users').send(res);
            return;
        }
        res.send(result);
    });
};

exports.patchUser = function(req, res ){

    var patchData = req.body;
    if ( patchData.op === 'replace'){
        var updateData = { $set: {} };
        updateData.$set[patchData.path] = patchData.value;
        User.connect(function(db,collection){

            collection.updateOne({ '_id' : req.user._id }, updateData, function( err, result){
                if ( !!err ){
                    logger.error('error updating user');
                    res.status(500).send(err);
                    return;
                }
                logger.debug('update result is', result);
                res.sendSend(200);
            });
        });
    }else{
        res.status(400).send( { message : 'unsupported patch operation', info: patchData });
    }
};

exports.login = function (req, res) {
    var loginCredentials = req.body;
    managers.users.loginUser(loginCredentials, function (err, loggedInUser) {
        if (!!err) {
            err.send(res);
            return;
        }

        if (!loggedInUser) {
            new managers.error.WrongLogin().send(res);
            return;
        }

        if (!loggedInUser.validated) {
            new managers.error.UserNotValidated().send(res);
            return;
        }


        req.session.userId = loggedInUser.getId();
        res.send(User.getUserPublicDetails(loggedInUser));

    });
};

/**
 *
 * See model UserValidationData
 *
 * @param req
 * @param res
 */
exports.validateUser = function (req, res) {
    var hmac = req.body.hmac;

    logger.info('validating user [%s]', req.params.userId);
    managers.users.validateUser(req.params.userId, hmac, function (err, validatedUser) {
        if (!!err) {
            new managers.error.UserValidationError(err).send(res);
            return;
        }

        req.session.userId = validatedUser.getId();
        res.send(User.getUserPublicDetails(validatedUser));

    });
};

exports.requestPasswordReset = function (req, res) {
    var userDetails = req.body;
    managers.users.sendResetPasswordMail(req.emailResources, userDetails, function (err) {
        if (!!err) {
            err.send(res);
        } else {
            res.status(200).send({
                'message': 'changed password successfully'
            }) ;
        }
    });
};

/**
 * gets a list of ids and returns the corresponding users.
 *
 * how to pass a list of ids over req query?
 *
 * ?idsList[]=1&idsList[]=2&idsList[]=3
 *
 * @param req
 * @param res
 */
exports.findUsersById = function (req, res) {

    var objectIds = req.getQueryList('usersId');
    logger.info('this is object ids', objectIds);
    objectIds = services.db.id(objectIds);

    User.find({
        '_id': {
            '$in': objectIds
        }
    }, {}, function (err, result) {
        if (!!err) {
            new managers.error.InternalServerError(err, 'unable to find lessons by ids').send(res);
            return;
        } else {

            // hide private info if logged in user does not have permissions
            if (!permissions.users.userCanSeePrivateUserDetails(req.sessionUser, null)) {
                result = User.getUserPublicDetails(result);
            }

            res.send(result);
            return;
        }
    });
};

exports.getUsernames = function (req, res) {
    var like = req.param('like');
    like = new RegExp(like, 'i');

    User.connect(function (db, collection) {
        collection.aggregate([{
            '$project': {
                'username': '$username'
            }
        }, {
            '$match': {
                'username': like || ''
            }
        }], {cursor: {}}, function (err, cursor) {
                cursor.toArray(function(err, result) {
                    if (!!err) {
                        new managers.error.InternalServerError(err, 'unable to get usernames').send(res);
                        return;
                    }
                    res.send(result);
                });
            });
           
    });
};

exports.changePassword = function (req, res) {

    logger.info('changing password for user');
    var changePasswordDetails = req.body;

    managers.users.changePassword(changePasswordDetails, req.sessionUser, function (err, user) {
        if (!!err) {
            res.status(500).send(err);
        } else {
            if (!!user.validated) {
                req.session.userId = user._id;
            }
            res.status(200).send({
                'message': 'password changed successfully'
            });
        }
    });

};

// do not return error if not logged in.. which is a horrible name for the function btw..
// should be called - get public details..
// if user is not logged in, it is a valid scenario..
// if we return error, we give the website a bad appdex score..
// return { user : } if user exists, otherwise return {}
exports.isLoggedIn = function (req, res) {

    if ( !!req.sessionUser ){
        res.send( { user : User.getUserPublicDetails( req.sessionUser ), token: require('sha1')(req.sessionUser.email) } );
    }else{
        res.send({});
    }
};

exports.logout = function (req, res) {
    req.session.userId = null;
    res.status(200).send({
        'message': 'ok'
    });
};

exports.update = function (req, res) {
    logger.info('updating user');
    var user = req.body;

    // guy - YOU MUST NOT USE USER FROM BODY!!!! AS THIS WILL ALLOW ANYONE TO EDIT ANYONE's PROFILE!!!!
    // ONLY USE AUTHENTICATED & LOGGED IN USERS WHICH SHOULD BE ON REQUEST THANKS TO MIDDLEWARE!!!
    var existingUser = req.sessionUser;
    // Only below fiels are allowed to update
    existingUser.shortIntro = user.shortIntro;
    existingUser.externalLink = user.externalLink;
    existingUser.details = user.details;
    new User(existingUser).update(function (err) {
        logger.info('user profile updated');
        if (!!err) {
            new managers.error.InternalServerError(err, 'unable to update user profile').send(res);
            return;
        }
        res.send(user);
    });
};
