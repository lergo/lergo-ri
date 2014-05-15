'use strict';
var managers = require('../managers');
var logger = managers.log.getLogger('UsersController');

logger.info('initializing');

function getUserPublicDetails( user ){
    return { 'email' : user.email, 'username' : user.username };
}

exports.signup = function(req, res){
    var user = req.body;
    managers.users.saveUser( user, function( err, obj  ){
        if ( !!err ){
            err.send(res);
            return;
        } else {
            res.send( { 'username' : obj.username , 'message' : 'created successfully'});
            return;
        }
    });
};


exports.login = function(req, res){
    var loginCredentials = req.body;
    managers.users.loginUser( loginCredentials, function( err, loggedInUser ){
        if ( !!err ){
            err.send(res);
            return;
        }

        if ( !loggedInUser ){
            new managers.error.WrongLogin().send(res);
            return;
        }

        if ( !loggedInUser.validated ){
            new managers.error.UserNotValidated().send(res);
            return;
        }


        req.session.userId = loggedInUser.getId();
        res.send( getUserPublicDetails(loggedInUser) );
    } );
};

/**
 *
 * See model UserValidationData
 *
 * @param req
 * @param res
 */
exports.validateUser = function ( req, res ){
    var validationData = req.body;

    logger.info('validating user [%s]', validationData );
    managers.users.validateUser( { '_id' : validationData.userId }, function( err, validatedUser ){
        if ( !!err ){
            managers.error.UserValidationError().send(res);
            return;
        }

        req.session.userId = validatedUser.getId();
        res.send( getUserPublicDetails(validatedUser));

    });
};

exports.requestPasswordReset = function( req, res ){
    var userDetails = req.body;
    managers.users.createPasswordResetLink( userDetails , function(){
        // TODO : send email
    })
};

exports.resetPassword = function( req, res ){
    var resetPasswordRequest = req.body;

    managers.users.resetPassword( resetPasswordRequest , function ( err, result ){
        if ( !!err ) {

        }
    })
};

exports.isLoggedIn = function( req, res ){
    res.send( getUserPublicDetails(req.user));
};

exports.logout = function(req, res){
    req.session.userId = null;
    res.send(200);
};


/**
 * get a user from cookie on request, and calls next request handler
 */
exports.loggedInMiddleware = function( req, res, next ){
    var userId = req.session.userId;
    if ( !userId ){
        new managers.error.NotLoggedIn().send(res);
        return;
    }
    managers.users.findUserById( userId , function(err, obj){
        if ( !!err ){
            err.send(res);
            return;
        }
        req.user = obj;
        logger.info('placed user on request');
        next();
    });
};


exports.isAdminMiddleware = function(req, res, next ){
    if ( !req.user.isAdmin ){
        managers.error.NotAdmin.send(res);
        return;
    }

    next();
};