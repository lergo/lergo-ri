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
exports.limitUserEdit = function(user, lesson){

    var limits = user.permissionsLimitations;

    if ( limits && lesson ){ // don't limit if lesson not specified

        if (!_.isEmpty(limits.manageSubject) && !_.includes(limits.manageSubject, lesson.subject )){
            return true;
        }

        if (!_.isEmpty(limits.manageLanguages) && !_.includes(limits.manageLanguages, lesson.language)){
            return true;
        }

        if ( !_.isEmpty(limits.manageAge) && limits.manageAge && lesson.age ){
            if ( lesson.age > limits.manageAge.max || lesson.age < limits.manageAge.min ){
                return true;
            }
        }

        if ( limits.editOnlyUnpublishedContent && lesson.public  ){
            return true;
        }
    }
    return false;
};

exports.limitUserPublish = function( user, lesson ){
    return exports.limitUserEdit(user, lesson);
};

exports.limitUserUnpublish = function( user, lesson ){
    return exports.limitUserEdit(user, lesson);
};

exports.userCanEdit = function userCanEdit( user, lesson){
    if ( !user || !lesson ){
        return false;
    }

    return !!lesson.userId.equals(user._id); // if owner

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
        'canEdit' : exports.userCanEdit(user, lesson),
        'canCopy' : exports.userCanCopy(user, lesson),
        'canDelete' : exports.userCanDelete(user, lesson),
        'canPublish' : exports.userCanPublish(user, lesson),
        'canPreview' : exports.userCanPreview( user, lesson ),
        'canUnpublish' : exports.userCanUnpublish( user, lesson),
        'canSeePrivateLessons' : exports.userCanSeePrivateLessons( user, lesson )
    };
};
