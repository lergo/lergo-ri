'use strict';
var managers = require('../managers');
var logger = managers.log.getLogger('UsersController');


logger.info('initializing');

function getUserPublicDetails(user) {
    return { 'username': user.username, 'isAdmin' : user.isAdmin, '_id' : user._id };
}

exports.signup = function (req, res) {
    var user = req.body;
    managers.users.createUser(req.emailResources, user, function (err, obj) {
        if (!!err) {
            err.send(res);

            return;
        } else {
            res.send({ 'username': obj.username, 'message': 'created successfully'});
            return;
        }
    });
};

// the validation email is sent after signup or after login. user must provide username and password.
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

            res.send(getUserPublicDetails(user));
        });

    });
};

exports.getAll = function( req, res ){
    managers.users.find( {}, {},function(err, users){
        res.send(users);
    });
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
        res.send(getUserPublicDetails(loggedInUser));
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
        res.send(getUserPublicDetails(validatedUser));

    });
};

exports.requestPasswordReset = function (req, res) {
    var userDetails = req.body;
    managers.users.sendResetPasswordMail(req.emailResources, userDetails, function (err) {
        if (!!err) {
            err.send(res);
        } else {
            res.send(200, {'message': 'changed password successfully'});
        }
    });
};

exports.changePassword = function (req, res) {

    logger.info('changing password for user');
    var changePasswordDetails = req.body;

    managers.users.changePassword(changePasswordDetails, req.user, function (err/*, result*/) {
        if (!!err) {
            res.send(500, err);
        } else {
            res.send(200, { 'message': 'password changed successfully'});
        }
    });


};

exports.isLoggedIn = function (req, res) {
    res.send(getUserPublicDetails(req.user));
};

exports.logout = function (req, res) {
    req.session.userId = null;
    res.send(200);
};




