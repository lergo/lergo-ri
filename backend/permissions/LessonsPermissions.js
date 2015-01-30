'use strict';

exports.userCanEdit = function( lesson, user ){
    if ( !user || !lesson ){
        return false;
    }
    return  !!user.isAdmin || lesson.userId.equals(user._id) ;


};

exports.userCanCopy = function( lesson ,user ){
    return !!user;
};

exports.userCanDelete = function( lesson ,user ){
    return  !!user && ( !!user.isAdmin  || lesson.userId.equals(user._id) );
};

exports.userCanPublish = function( lesson,user) {
    return !!user && !!user.isAdmin;
};

exports.userCanPreview = function( lesson, user ){
    return !!user && !!lesson.userId.equals(user._id);
};


exports.getPermissions = function( lesson, user ){
    return {
        'canEdit' : exports.userCanEdit(lesson,user),
        'canCopy' : exports.userCanCopy(lesson,user),
        'canDelete' : exports.userCanDelete(lesson,user),
        'canPublish' : exports.userCanPublish(lesson,user),
        'canPreview' : exports.userCanPreview( lesson, user )
    };
};