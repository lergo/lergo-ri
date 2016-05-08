'use strict';

var _ = require('lodash');

/**
 * @typedef {object} PermissionsLimitations
 * @property {Array<string>} manageSubject
 * @property {Array<string>} manageLanguages
 * @property {object} manageAge
 * @property {number} manageAge.max
 * @property {number} manageAge.min
 * @property {boolean} editOnlyUnpublishedContent
 */

// return true iff lesson is restricted
/**
 *
 * @param {PermissionsLimitations} limits
 * @param {Lesson} lesson
 * @returns {boolean}
 */
function isLessonInLimited( limits , lesson ){
    if ( limits ){

        if (!_.includes(limits.manageSubject, lesson.subject )){
            return true;
        }

        if (!_.includes(limits.manageLanguages, lesson.language)){
            return true;
        }

        if ( limits.manageAge && lesson.age ){
            if ( lesson.age > limits.manageAge.max || lesson.age < limits.manageAge.min ){
                return true;
            }
        }

        if ( limits.editOnlyUnpublishedContent && lesson.public  ){
            return true;
        }
    }
    return false;
}

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

    if ( isLessonInLimited( user.permissionsLimitations, lesson ) ){
        return false;
    }

    // if editor AND ( is not restriced to edit unpublished content OR if lesson is not public )
    return  user.sessionPermissions && user.sessionPermissions.lessons.userCanEdit;
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
