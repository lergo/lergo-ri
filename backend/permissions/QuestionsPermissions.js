'use strict';

exports.userCanEdit = function( user, question ){
    return question.userId.equals(user._id) ;
};

exports.userCanCopy = function userCanCopy( user ){
    return !!user; // all users can copy. used for display

};

exports.userCanDelete = function( user, question ){
    return !!user && question.userId.equals(user._id);
};


exports.getPermissions = function( user, question ){
    return {
        'canEdit' : exports.userCanEdit(user, question),
        'canCopy' : exports.userCanCopy(user, question),
        'canDelete' : exports.userCanDelete(user, question)
    };
};