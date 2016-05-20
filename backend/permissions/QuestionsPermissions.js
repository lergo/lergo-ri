'use strict';

exports.limitUserEdit = function(user, question, isUsedByPublicLesson ){

    console.log('is user limited from editing question ? ' , isUsedByPublicLesson);

    if ( !user || !question ){
        return false;
    }

    var limits = user.permissionsLimitations;

    if ( limits && question ){ // don't limit if lesson not specified

        if ( limits.editOnlyUnpublishedContent && isUsedByPublicLesson  ){
            return true;
        }
    }
    return false;

};

exports.userCanEdit = function( user, question/*, isUsedByPublicLesson */){
    if ( !user || !question ){
        return false;
    }
    return question.userId.equals(user._id) ;
};

exports.userCanCopy = function userCanCopy( user ){
    return !!user; // all users can copy. used for display

};

exports.userCanDelete = function( user, question ){
    return !!user && question.userId.equals(user._id);
};


exports.getPermissions = function( user, question, isUsedByPublicLesson ){
    console.log('getting permissions ', isUsedByPublicLesson );
    return {
        'canEdit' : exports.userCanEdit(user, question, isUsedByPublicLesson), // editors might be limited from editing questions used in public lessons..
        'canCopy' : exports.userCanCopy(user, question),
        'canDelete' : exports.userCanDelete(user, question)
    };
};
