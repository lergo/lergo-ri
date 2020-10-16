'use strict';

/**
 * @module UsersMiddleware
 * @type {exports}
 */

var managers = require('../managers');
var logger = require('log4js').getLogger('UsersMiddleware');
var User = require('../models/User');
var permissions = require('../permissions');
/* const redisClient = require('redis').createClient;
const redis = redisClient(6379, 'localhost'); */
var services = require('../services');
const redis = services.redis.getClient();

/**
 * get a user from cookie on request, and calls next request handler
 */
exports.loggedInMiddleware = function loggedInMiddleware(req, res, next) {

    exports.optionalUserOnRequest( req, res , function(){
        logger.debug('checking loggedin middleware');
        if ( !req.sessionUser ){
            new managers.error.NotLoggedIn().send(res);
            return;
        }
        next();
    });
};
exports.loggedIn = function loggedIn ( ){
    exports.loggedInMiddleware.apply(null,arguments);
}; // alias

exports.IsAdminMiddleware = function IsAdminMiddleware(req, res, next) {
    exports.optionalUserOnRequest( req, res , function(){
        logger.debug('checking isAdmin middleware');
        if ( !req.sessionUser || !req.sessionUser.isAdmin ){
            new managers.error.NotLoggedIn().send(res);
            return;
        }
        next();
    });
};
exports.isAdmin = function isAdmin ( ){
    exports.isAdminMiddleware.apply(null,arguments);
}; // alias



exports.exists = function exists ( req, res, next ){
    logger.debug('checking if user exists : ' , req.params.userId );
    try {
        User.findById(req.params.userId, function (err, result) {
            if (!!err) {
                res.status(500).send(err);
                return;
            }
            if (!result) {
                res.status(404).send('');
                return;
            }

            logger.debug('putting user on request', result);
            req.user = result;

            next();

        });
    }catch(e){
        res.status(404).send('');
    }
};

// sometimes, even though the path is public, we will want to check if the user is logged in or not.
// so we can use details like username where it is optional.
exports.optionalUserOnRequest = function optionalUserOnRequest (req, res, next){
    var userId = req.session.userId;
    if (!userId) {
        next();
        return;
    }

    managers.users.findUserById(userId, function (err, obj) {
        if (!!err) {
            console.log(err);
            logger.error('unable to find user by id',JSON.stringify(err));
//            err.send(res);
            return;
        }
        req.user = obj;
        logger.debug('placed user on request');
        next();
    });
};


// todo: change this to 'userCanReadUsers'
exports.canSeeAllUsers = function canSeeAllUsers ( req, res, next ){
    return permissions.users.userCanSeeAllUsers( req.sessionUser ) ? next() : res.status(400).send('not allowed to do this request');
};


exports.canPatchUsers = function canPatchUsers( req, res, next ){
    if ( permissions.users.userCanPatchUsers( req.sessionUser ) ){
        next();
    }else{
        res.status(400).send('not allowed to patch users');
    }
};

//admin: caching the Allusers 

exports.cacheAllUsers = function cacheAllUsers( req, res, next) {
    logger.info('Redis checking admin AllUsers');
    const key = 'allUsers';
    redis.get(key,(err, reply) => {
        if(err) {
            console.log(err);
        } else if(reply) {
            var modifiedReply = JSON.parse(reply);
            logger.info('using redis cache for ', key);
            res.send(modifiedReply);
        } else {
            logger.info(key, ' will be loaded in redis cache ');
            res.sendResponse = res.send;
            res.send = (body) => {
                redis.set(key, JSON.stringify(body)); 
                redis.expire(key, 6*60*60);
                res.sendResponse(body);
            };
            next();
        }
    });
}; 
