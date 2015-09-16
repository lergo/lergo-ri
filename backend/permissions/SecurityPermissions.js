'use strict';
/**
 * @module AuthorizationPermissions
 * @description
 * specifies what are the activities required and who has allowed
 * in order to perform actions on authorizations.
 **/


exports.userCanManageAuthorization = function(){};

//////////////// GROUPS

exports.userCanCreateGroups = function( user ){
    return !!user.isAdmin;
};

exports.userCanUpdateGroups = function( user ){
    return !!user.isAdmin;
};

exports.userCanDeleteGroups = function( user ){
    return !!user.isAdmin;
};

exports.userCanReadGroups = function( user ){
    return !!user.isAdmin;
};

exports.userCanAssignUsersToGroups = function( user ){
    return !!user.isAdmin;
};

exports.userCanAssignRolesToGroups = function( user ){
    return !!user.isAdmin;
};

///////////////// Roles

exports.userCanCreateRoles = function( user ){
    return !!user.isAdmin;
};

exports.userCanReadRoles = function( user ){
    return !!user.isAdmin;
};

exports.userCanUpdateRoles = function( user ){
    return !!user.isAdmin;
};

exports.userCanDeleteRole  = function( user ){
    return !!user.isAdmin;
};

exports.userCanAssignPermissionsToRoles = function( user ){
    return !!user.isAdmin;
};

