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
var disqusClient = services.disqus.configure(services.conf.disqus).client;

logger.info('initializing');

exports.getUserPublicDetails = function (req, res ){
    res.send(User.getUserPublicDetails(req.sessionUser));
};

exports.signup = function(req, res) {
	var user = req.body;
	managers.users.createUser(req.emailResources, user, function(err, obj) {
		if (!!err) {
			err.send(res);

			return;
		} else {
			res.send({
				'username' : obj.username,
				'message' : 'created successfully'
			});
			return;
		}
	});
};

// returns the disqus sso details required
exports.disqusLogin = function(req, res) {
	res.send(disqusClient.ssoObj({
		'id' : req.sessionUser._id,
		'username' : req.sessionUser.username,
		'email' : req.sessionUser.email
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

exports.getAll = function(req, res) {
	managers.users.find({}, {}, function(err, users) {
		res.send(users);
	});
};

exports.login = function(req, res) {
	var loginCredentials = req.body;
	managers.users.loginUser(loginCredentials, function(err, loggedInUser) {
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
exports.validateUser = function(req, res) {
	var hmac = req.body.hmac;

	logger.info('validating user [%s]', req.params.userId);
	managers.users.validateUser(req.params.userId, hmac, function(err, validatedUser) {
		if (!!err) {
			new managers.error.UserValidationError(err).send(res);
			return;
		}

		req.session.userId = validatedUser.getId();
		res.send(User.getUserPublicDetails(validatedUser));

	});
};

exports.requestPasswordReset = function(req, res) {
	var userDetails = req.body;
	managers.users.sendResetPasswordMail(req.emailResources, userDetails, function(err) {
		if (!!err) {
			err.send(res);
		} else {
			res.send(200, {
				'message' : 'changed password successfully'
			});
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

    User.find({ '_id': { '$in': objectIds }}, {}, function (err, result) {
        if (!!err) {
            new managers.error.InternalServerError(err, 'unable to find lessons by ids').send(res);
            return;
        } else {

            // hide private info if logged in user does not have permissions
            if ( !permissions.users.canSeePrivateUserDetails(req.sessionUser, null ) ){
                result = User.getUserPublicDetails( result );
            }

            res.send(result);
            return;
        }
    });
};


exports.getUsernames = function( req, res ){
    var like = req.param('like');
    like = new RegExp(like, 'i');

    User.connect(function(db, collection){
        collection.aggregate([
            { '$project' : { 'username' : '$username'}},
            {'$match' : { 'username' : like || '' } }
        ], function(err, result){
            if ( !!err ){
                new managers.error.InternalServerError(err, 'unable to get usernames').send(res);
                return;
            }
            res.send(result);
        });
    });
};


exports.changePassword = function(req, res) {

	logger.info('changing password for user');
	var changePasswordDetails = req.body;

	managers.users.changePassword(changePasswordDetails, req.sessionUser, function(err, user) {
		if (!!err) {
			res.send(500, err);
		} else {
			if (!!user.validated) {
				req.session.userId = user._id;
			}
			res.send(200, {
				'message' : 'password changed successfully'
			});
		}
	});

};

exports.isLoggedIn = function(req, res) {
	res.send(User.getUserPublicDetails(req.sessionUser));
};

exports.logout = function(req, res) {
	req.session.userId = null;
	res.send(200, {'message': 'ok'});
};
