'use strict';


// todo : add permissions middleware on these actions

/**
 *
 * @module RolesActions
 * @description
 * bundles all roles actions
 *
 */


var controllers = require('../controllers');
var middlewares = require('../middlewares');

exports.getPermissions = {
    'spec': {
        'path': '/roles/permissions',
        'summary': 'List all permissions in the system',
        'method': 'GET'
    },
    'middlewares': [ ],
    'action': controllers.roles.getPermissions
};

exports.getRole = {
    'spec': {
        'path' : '/roles/{roleId}',
        'summary' : 'Get role by id',
        'method' : 'GET'
    },
    'middlewares' : [
        middlewares.session.isLoggedIn,
        middlewares.roles.roleExists,
        middlewares.roles.userCanReadRoles
    ],
    'action' : controllers.roles.getRole
};

exports.getRoles = {
    'spec': {
        'path': '/roles',
        'summary': 'List all roles',
        'method': 'GET'
    },
    'middlewares': [
        middlewares.session.isLoggedIn,
        middlewares.roles.userCanReadRoles,
        middlewares.lergo.queryObjParsing
    ],
    'action': controllers.roles.getRoles
};

exports.createRole = {
    'spec' : {
        'path' : '/roles',
        'summary' : 'Create new role',
        'method' : 'POST'

    },
    'middlewares' : [
        middlewares.session.isLoggedIn,
        middlewares.roles.userCanCreateRoles
    ],
    'action' : controllers.roles.createRole
};

exports.updateRole = {
    'spec' : {
        'path' : '/roles/{roleId}',
        'summary' : 'Update role',
        'method' : 'POST'
    },
    'middlewares' : [
        middlewares.session.isLoggedIn,
        middlewares.roles.roleExists,
        middlewares.roles.userCanUpdateRoles
    ],
    'action' : controllers.roles.updateRole
};



exports.deleteRole = {
    'spec' : {
        'path' : '/roles/{roleId}',
        'summary' : 'Delete role',
        'method' : 'DELETE'
    },
    'middlewares' : [
        middlewares.session.isLoggedIn,
        middlewares.roles.roleExists,
        middlewares.roles.userCanDeleteRoles,
        middlewares.roles.roleCanBeDeleted
    ],
    'action' : controllers.roles.deleteRole
};





