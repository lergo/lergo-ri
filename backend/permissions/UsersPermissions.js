'use strict';

exports.canSeePrivateUserDetails = function (sessionUser/*, user*/) {
    return !!sessionUser && !!sessionUser.isAdmin;
};


exports.getPermissions = function (sessionUser, user) {
    return {
        'canSeePrivateUserDetails': exports.userCanEdit(sessionUser, user)
    };
};