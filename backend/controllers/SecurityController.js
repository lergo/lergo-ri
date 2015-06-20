/**
 *
 * @module SecurityController
 *
 * @description
 * handles roles, groups, permissions and such
 *
 **/


/**
 * returns all permissions in the system
 */

var permissions = require('../permissions');
var _ = require('lodash');
var logger = require('log4js').getLogger('SecurityController');
var lergoUtils = require('../LergoUtils');


exports.getPermissions = function( req, res ){
    logger.debug('getting permissions');
    var result = [];
    _.each(permissions, function(p, pName ){
        logger.debug('iterating',p);
        _.each(p, function(pFunc, funcKey){
            logger.debug('considering', funcKey, pName );
                if ( funcKey.indexOf('userCan') >= 0) {
                    result.push(pName + '.' + funcKey);
                }
        });

    });

    res.send(result);
};