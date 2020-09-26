'use strict';

exports.userCanSeePrivateUserDetails = function (sessionUser/*, user*/) {
    return !!sessionUser && !!sessionUser.isAdmin;
};

exports.userCanSeeAllUsers = function( sessionUser ){
    console.log('the sessionUser', sessionUser);
    return !!sessionUser && !!sessionUser.isAdmin;
};

exports.userCanPatchUsers = function( sessionUser ){
    return !!sessionUser && !!sessionUser.isAdmin;
};

exports.getPermissions = function (sessionUser, user) {
    return {
        'canSeePrivateUserDetails': exports.userCanSeePrivateUserDetails(sessionUser, user),
        'canSeeAllUsers': exports.userCanSeeAllUsers(sessionUser, user)
    };
};