'use strict';

exports.userCanEdit = function userCanEdit( lesson, user ){
    if ( !user || !lesson ){
        return false;
    }
    return  !!user.isAdmin || lesson.userId.equals(user._id) ;


};

exports.userCanCopy = function userCanCopy( lesson ,user ){
    return !!user;
};

exports.userCanDelete = function userCanDelete( lesson ,user ){
    return  !!user && ( !!user.isAdmin  || lesson.userId.equals(user._id) );
};

exports.userCanPublish = function userCanPublish( lesson,user) {
    return !!user && !!user.isAdmin;
};

exports.userCanPreview = function userCanPreview( lesson, user ){
    return !!user && !!lesson.userId.equals(user._id);
};


exports.getPermissions = function getPermissions( lesson, user ){
    return {
        'canEdit' : exports.userCanEdit(lesson,user),
        'canCopy' : exports.userCanCopy(lesson,user),
        'canDelete' : exports.userCanDelete(lesson,user),
        'canPublish' : exports.userCanPublish(lesson,user),
        'canPreview' : exports.userCanPreview( lesson, user )
    };
};