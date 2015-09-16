'use strict';

var logger = require('log4js').getLogger('SecurityMiddleware');
var permissions = require('../permissions');
var models = require('../models');
var services = require('../services');

exports.userCanReadRoles = function userCanReadRoles( req, res, next ){
    if ( permissions.security.userCanReadRoles(req.sessionUser)){
        return next();
    }else{
        return res.send(400);
    }
};

exports.userCanReadGroups = function userCanReadGroups( req, res, next ){
    if ( permissions.security.userCanReadGroups( req.sessionUser)){
        return next();
    }else{
        return res.send(400);
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


exports.groupExists = function groupExists( req, res, next ){
    logger.debug('searching for group', req.params.groupId);
    try {
        models.Group.findById(req.params.groupId, function (err, result) {
            if (!!err) {
                services.error.InternalServerError(err, 'unable to get group').send(res);
                return;
            }
            if (!result) {
                services.error.NotFound('group not found').send(res);
                return;
            }

            logger.debug('putting group on request', result);
            req.group = result;
            next();
        });

    }catch(e){
        new services.error.NotFound(e, 'group not found due to error').send(res);
    }
};

/**
 * @description
 * a role can be deleted only if it is unused by a group LERGO-612
 *
 * assumes role exists on request
 */

exports.roleCanBeDeleted = function( req, res, next ){
    logger.debug('checking if role is used before deleting');
    models.Group.findByRole(res.role._id, function(err, result){
        if ( !!result && result.length > 0 ){
            logger.debug('role is used. cannot delete');
            new services.error.RoleInUse(null, { groups : result } ).send(res);
            return;
        }
        logger.debug('role not used.');
        next();
    });
};


exports.userCanCreateRoles = function userCanCreateRoles(req, res, next) {
    if (permissions.security.userCanCreateRoles(req.sessionUser)) {
        return next();
    } else {
        return res.send(400);
    }
};

exports.userCanCreateGroups = function userCanCreateGroups( req, res, next ){
    if ( permissions.security.userCanCreateGroups( req.sessionUser )){
        return next();
    }else{
        return res.send(400);
    }
};

exports.userCanUpdateRoles = function userCanUpdateRoles( req, res, next ){
    if ( permissions.security.userCanUpdateRoles(req.sessionUser)){
        return next();
    }else{
        return res.send(400);
    }
};

exports.userCanDeleteRoles = function userCanDeleteRoles( req, res, next ){
    if ( permissions.security.userCanDeleteRole(req.sessionUser)){
        return next();
    }else{
        return res.send(400);
    }
};
