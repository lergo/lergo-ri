'use strict';
var managers = require('../managers');
var logger = managers.log.getLogger('UsersController');

function getUserPublicDetails( user ){
    return { 'email' : user.email };
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
        }

        if ( !loggedInUser ){
            new managers.error.WrongLogin().send(res);
        }


        req.session.userId = loggedInUser.getId();
        res.send( getUserPublicDetails(loggedInUser) );
    } );
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
        console.log('placed user on request');
        next();
    })
};


exports.isAdminMiddleware = function(req, res, next ){
    if ( !req.user.isAdmin ){
        managers.error.NotAdmin.send(res);
        return;
    }

    next();
};