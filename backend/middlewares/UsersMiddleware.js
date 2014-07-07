var managers = require('../managers');
var logger = require('log4js').getLogger('UsersMiddleware');

/**
 * get a user from cookie on request, and calls next request handler
 */
exports.loggedInMiddleware = function loggedInMiddleware(req, res, next) {

    exports.optionalUserOnRequest( req, res , function(){
        logger.info('checking loggedin middleware');
        if ( !req.user ){
            new managers.error.NotLoggedIn().send(res);
            return;
        }
        next();
    });
};
exports.exists = function exists ( ){exports.loggedInMiddleware.apply(null,arguments);}; // alias

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
            logger.error('unable to find user by id',JSON.stringify(err));
//            err.send(res);
            return;
        }
        req.user = obj;
        logger.info('placed user on request');
        next();
    });
};






exports.isAdminMiddleware = function (req, res, next) {
    exports.loggedInMiddleware( req, res, function(){
        if (!req.user.isAdmin) {
            logger.info('user not admin. returning error');
            new managers.error.NotAdmin().send(res);
            return;
        }
        next();
    });
};

exports.isAdmin = function isAdmin(){ exports.isAdminMiddleware.apply(null,arguments);};