'use strict';

exports.userCanEdit = function userCanEdit( user, lesson){
    if ( !user || !lesson ){
        return false;
    }
    return  !!user.isAdmin || lesson.userId.equals(user._id) ;
};

exports.userCanCopy = function userCanCopy( user, lesson  ){
    return !!user;
};

exports.userCanDelete = function userCanDelete( user, lesson ){
    return  !!user && ( !!user.isAdmin  || lesson.userId.equals(user._id) );
};

exports.userCanPublish = function userCanPublish( user, lesson ) {
    // can publish if has permission. instrumented
};

exports.userCanSeePrivateLessons = function userCanSeePrivateLessons( user ){
    // can see if has permissions, instrumented
};

exports.userCanPreview = function userCanPreview( user, lesson){
    return !!user && !!lesson.userId.equals(user._id);
};


exports.getPermissions = function getPermissions( user, lesson ){
    return {
        'canEdit' : exports.userCanEdit(user, lesson),
        'canCopy' : exports.userCanCopy(user, lesson),
        'canDelete' : exports.userCanDelete(user, lesson),
        'canPublish' : exports.userCanPublish(user, lesson),
        'canPreview' : exports.userCanPreview( user, lesson )
    };
};