exports.usersActions = require('./UsersActions');
exports.publicActions = require('./PublicActions');
exports.adminActions = require('./AdminActions');
var logger = require('log4js').getLogger('index');


function addAllActions ( actions ){
    for ( var i in actions ){
        if ( actions.hasOwnProperty(i) ){
            exports.actions.push(actions[i]);
        }
    }

}


exports.actions = [];
logger.info('adding public actions');
addAllActions( exports.publicActions );
logger.info('adding user actions');
addAllActions( exports.usersActions );
logger.info('adding admin actions');
addAllActions( exports.adminActions );




