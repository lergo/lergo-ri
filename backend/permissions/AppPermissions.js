'use strict';

exports.userCanManage = function( user ){
    return !!user.isAdmin;
};

exports.getPermissions = function( user ){
    return {
        'canManage' : exports.userCanManage(user)
    };
};