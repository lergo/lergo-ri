'use strict';


// todo : add permissions middleware on these actions

/**
 *
 * @module SecurityActions
 * @description
 * bundles all security actions. including roles and groups.
 *
 */


var controllers = require('../controllers');
var middlewares = require('../middlewares');

exports.getPermissions = {
    'spec': {
        'path': '/security/permissions',
        'summary': 'List all permissions in the system',
        'method': 'GET'
    },
    'middlewares': [ ],
    'action': controllers.security.getPermissions
};

exports.getRole = {
    'spec': {
        'path' : '/security/roles/{roleId}',
        'summary' : 'Get role by id',
        'method' : 'GET'
    },
    'middlewares' : [
        middlewares.session.isLoggedIn,
        middlewares.security.roleExists,
        middlewares.security.userCanReadRoles
    ],
    'action' : controllers.security.getRole
};

exports.getRoles = {
    'spec': {
        'path': '/security/roles',
        'summary': 'List all roles',
        'method': 'GET'
    },
    'middlewares': [
        middlewares.session.isLoggedIn,
        middlewares.security.userCanReadRoles,
        middlewares.lergo.queryObjParsing
    ],
    'action': controllers.security.getRoles
};

exports.createRole = {
    'spec' : {
        'path' : '/security/roles',
        'summary' : 'Create new role',
        'method' : 'POST'

    },
    'middlewares' : [
        middlewares.session.isLoggedIn,
        middlewares.security.userCanCreateRoles
    ],
    'action' : controllers.security.createRole
};

exports.updateRole = {
    'spec' : {
        'path' : '/security/roles/{roleId}',
        'summary' : 'Update role',
        'method' : 'POST'
    },
    'middlewares' : [
        middlewares.session.isLoggedIn,
        middlewares.security.roleExists,
        middlewares.security.userCanUpdateRoles
    ],
    'action' : controllers.security.updateRole
};

exports.updateGroup = {
    'spec' : {
        'path' : '/security/groups/{groupId}',
        'summary' : 'Update group',
        'method' : 'POST'
    },
    'middlewares' : [
        middlewares.session.isLoggedIn,
        middlewares.security.groupExists,
        middlewares.security.userCanUpdateGroups
    ],
    'action' : controllers.security.updateGroup
};

exports.deleteRole = {
    'spec' : {
        'path' : '/security/roles/{roleId}',
        'summary' : 'Delete role',
        'method' : 'DELETE'
    },
    'middlewares' : [
        middlewares.session.isLoggedIn,
        middlewares.security.roleExists,
        middlewares.security.userCanDeleteRoles,
        middlewares.security.roleCanBeDeleted
    ],
    'action' : controllers.security.deleteRole
};


exports.createGroup = {
    'spec' : {
        'path' : '/security/groups',
        'summary' : 'Create group',
        'method' : 'POST'
    },
    'middlewares' : [
        middlewares.session.isLoggedIn,
        middlewares.security.userCanCreateGroups
    ],
    'action' : controllers.security.createGroup
};

exports.getGroup = {
    'spec' : {
        'path' : '/security/groups/{groupId}',
        'summary' : 'get group by id',
        'method' : 'GET'
    },
    'middlewares' : [
        middlewares.session.isLoggedIn,
        middlewares.security.userCanReadGroups,
        middlewares.security.groupExists
    ],
    'action' : controllers.security.getGroup
};

exports.getGroups = {
    'spec' : {
        'path' : '/security/groups',
        'summary' : 'List groups',
        'method' : 'GET'
    },
    'middlewares' : [
        middlewares.session.isLoggedIn,
        middlewares.security.userCanReadGroups,
        middlewares.lergo.queryObjParsing
    ],
    'action' : controllers.security.getGroups
};
