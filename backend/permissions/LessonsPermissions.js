'use strict';


// use external function to override instrumentation and support limitations.
function _userCanEdit( user, lesson ){
    if ( !user || !lesson ){
        return false;
    }

    if ( !!user.isAdmin ){ //  if admin
        return true;
    }

    if ( !!lesson.userId.equals(user._id)){ // if owner
        return true;
    }

    // if editor AND ( is not restriced to edit unpublished content OR if lesson is not public )
    return  user.canEdit && ( !user.permissionsLimitations.editOnlyUnpublishedContent || !lesson.public);
}

exports.userCanEdit = function userCanEdit( user, lesson){
    return _userCanEdit(user, lesson);
};

exports.userCanCopy = function userCanCopy( user/*, lesson*/  ){
    return !!user;
};

exports.userCanDelete = function userCanDelete( user, lesson ){
    return  !!user && ( !!user.isAdmin  || lesson.userId.equals(user._id) );
};

exports.userCanPublish = function userCanPublish( /*user, lesson*/ ) {
    // can publish if has permission. instrumented
};

exports.userCanUnpublish = function userCanUnpublish(){
    // can unpublish if as permission. instrumented.
};

// can see private lesson if own..
exports.userCanSeePrivateLessons = function userCanSeePrivateLessons( user, lesson ){
    if ( !lesson || !user ){
        return false;
    }
    // can see if has permissions, instrumented
    return lesson.userId.equals(user._id);
};

exports.userCanPreview = function userCanPreview( user, lesson){
    return !!user && !!lesson.userId.equals(user._id);
};


exports.getPermissions = function getPermissions( user, lesson ){
    return {
        'canEdit' : _userCanEdit(user, lesson),
        'canCopy' : exports.userCanCopy(user, lesson),
        'canDelete' : exports.userCanDelete(user, lesson),
        'canPublish' : exports.userCanPublish(user, lesson),
        'canPreview' : exports.userCanPreview( user, lesson ),
        'canUnpublish' : exports.userCanUnpublish( user, lesson),
        'canSeePrivateLessons' : exports.userCanSeePrivateLessons( user, lesson )
    };
};
