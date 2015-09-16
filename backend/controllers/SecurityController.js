'use strict';
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
var models = require('../models');
var services = require('../services');
var _ = require('lodash');
var logger = require('log4js').getLogger('SecurityController');
//var lergoUtils = require('../LergoUtils');


exports.getPermissions = function (req, res) {
    logger.debug('getting permissions');
    var result = [];
    _.each(permissions, function (p, pName) {
        logger.debug('iterating', p);
        _.each(p, function (pFunc, funcKey) {
            logger.debug('considering', funcKey, pName);
            if (funcKey.indexOf('userCan') >= 0) {
                result.push(pName + '.' + funcKey);
            }
        });
    });
    res.send(result);
};


exports.getRoles = function (req, res) {
    models.Role.complexSearch( req.queryObj, function( err, result ){
         res.send(result);
    });
};

exports.getGroups = function( req, res ){
    models.Group.complexSearch( req.queryObj, function( err, result ){
        res.send(result);
    });
};

exports.getRole = function( req, res ){
    res.send(req.role);
};

exports.getGroup = function( req, res ){
    res.send(req.group);
};

exports.createRole = function (req, res) {
    var role = { name: 'Role ' + new Date().getTime() , createdAt: new Date().toISOString() };
    models.Role.connect(function(db, collection){
        collection.insert(role, function( err ){
            if (!!err) {
                logger.error('error creating role', err);
                new services.error.InternalServerError(err,'unable to create role').send(res);
                return;
            } else {
                logger.info('Role created successfully. invoking callback');
                res.send( role);
                return;
            }
        });
    });
};

exports.deleteRole = function( req, res ){
    new models.Role(req.role).remove();
};

exports.createGroup = function (req, res) {
    var group = { name: 'Group ' + new Date().getTime() , createdAt: new Date().toISOString() };
    models.Group.connect(function(db, collection){
        collection.insert(group, function( err ){
            if (!!err) {
                logger.error('error creating group', err);
                new services.error.InternalServerError(err,'unable to create group').send(res);
                return;
            } else {
                logger.info('Group created successfully. invoking callback');
                res.send( group );
                return;
            }
        });
    });
};

exports.updateRole = function(req, res){

    var role = _.merge(req.role, _.pick(req.body, ['name','permissions','description']));
    role.lastUpdate = new Date().getTime();
    new models.Role().update( function(err, result){
        if ( !!err || result !== 1){
            new services.error.InternalServerError('unable to save ',err).send(res);
            return;
        }

        res.send(req.role)
    });
};

exports.updateGroup = function(req, res){

    var group = _.merge(req.group, _.pick(req.body, ['name','permissions','roles']));
    group.lastUpdate = new Date().getTime();
    new models.Group().update( function(err, result){
        if ( !!err || result !== 1){
            new services.error.InternalServerError('unable to save ',err).send(res);
            return;
        }

        res.send(req.group)
    });
};