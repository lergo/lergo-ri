'use strict';

exports.userCanEdit = function( question, user ){
    if ( !user || !question ){
        return false;
    }
    return  !!user.isAdmin || question.userId.equals(user._id) ;
};


exports.userCanCopy = function( question ,user ){
    return  !!user;// all users can copy
};

exports.userCanDelete = function( question ,user ){
    return question.userId.equals(user._id);
};


exports.getPermissions = function( question, user ){
    return {
        'canEdit' : exports.userCanEdit(question,user),
        'canCopy' : exports.userCanCopy(question,user),
        'canDelete' : exports.userCanDelete(question,user)
    };
};