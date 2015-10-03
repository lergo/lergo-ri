'use strict';

var logger = require('log4js').getLogger('rolesMiddleware');
var permissions = require('../permissions');
var models = require('../models');
var services = require('../services');

exports.userCanReadRoles = function userCanReadRoles( req, res, next ){
    if ( permissions.roles.userCanReadRoles(req.sessionUser)){
        return next();
    }else{
        return new services.error.Forbidden(null, 'read roles').send(res);
    }
};


exports.roleExists = function roleExists( req, res, next  ){
    logger.debug('searching for role', req.params.roleId);
    try {
        models.Role.findById(req.params.roleId, function (err, result) {
            if (!!err) {
                services.error.InternalServerError(err, 'unable to get role').send(res);
                return;
            }
            if (!result) {
                services.error.NotFound('role not found').send(res);
                return;
            }

            logger.debug('putting role on request', result);
            req.role = result;
            next();

        });
    }catch(e){
        new services.error.NotFound(e,'role not found due to error').send(res);
    }
};



/**
 * @description
 * a role can be deleted only if it is unused by a group LERGO-612
 *
 * assumes role exists on request
 */

exports.roleCanBeDeleted = function roleCanBeDeleted( req, res, next ){
    logger.debug('checking if role is used before deleting');
    models.User.findByRole(req.role._id, function(err, result){
        if ( !!result && result.length > 0 ){
            logger.debug('role is used. cannot delete');
            new services.error.ResourceInUse(null, { users : result } ).send(res);
            return;
        }
        logger.debug('role not used.');
        next();
    });
};


exports.userCanCreateRoles = function userCanCreateRoles(req, res, next) {
    if (permissions.roles.userCanCreateRoles(req.sessionUser)) {
        return next();
    } else {
        return res.status(400).send('user cannot create roles');
    }
};


exports.userCanUpdateRoles = function userCanUpdateRoles( req, res, next ){
    if ( permissions.roles.userCanUpdateRoles(req.sessionUser)){
        return next();
    }else{
        return res.status(400).send('user cannot update roles');
    }
};


exports.userCanDeleteRoles = function userCanDeleteRoles( req, res, next ){
    if ( permissions.roles.userCanDeleteRole(req.sessionUser)){
        return next();
    }else{
        return res.status(400).send('user cannot delete roles');
    }
};



