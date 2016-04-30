'use strict';

/**
 * @module SessionMiddleware
 * @type {exports}
 */

var managers = require('../managers');
var logger = require('log4js').getLogger('SessionMiddleware');
var User = require('../models/User');
var _ = require('lodash');

/**
 * get a user from cookie on request, and calls next request handler
 */
exports.isLoggedIn = function isLoggedIn(req, res, next) {
    exports.optionalUserOnRequest( req, res , function(){
        logger.debug('checking loggedin middleware');
        if ( !req.sessionUser ){
            new managers.error.NotLoggedIn().send(res);
            return;
        }
        next();
    });
};




// sometimes, even though the path is public, we will want to check if the user is logged in or not.
// so we can use details like username where it is optional.
exports.optionalUserOnRequest = function optionalUserOnRequest (req, res, next){
    var userId = req.session.userId;
    if (!userId) {
        next();
        return;
    }
    User.getUserAndPermissions(userId, function (err, obj) {
        if (!!err) {
            console.log(err);
            logger.error('unable to find user by id',JSON.stringify(err));
//            err.send(res);
            return;
        }
        req.sessionUser = obj;

        var permissions = {};
        // convert permissions to object
        _.each(req.sessionUser.permissions, function(p){
            _.set(permissions,p,true);
        });
        req.sessionUser.sessionPermissions = permissions;
        logger.debug('placed user on request');
        next();
    });
};
