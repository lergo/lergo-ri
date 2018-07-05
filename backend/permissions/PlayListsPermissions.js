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

// return true iff playList is restricted
/**
 *
 * @param {PermissionsLimitations} limits
 * @param {PlayList} playList
 * @returns {boolean}
 */
exports.limitUserEdit = function(user, playList){

    var limits = user.permissionsLimitations;

    if ( limits && playList ){ // don't limit if playList not specified

        if (!_.isEmpty(limits.manageSubject) && !_.includes(limits.manageSubject, playList.subject )){
            return true;
        }

        if (!_.isEmpty(limits.manageLanguages) && !_.includes(limits.manageLanguages, playList.language)){
            return true;
        }

        if ( !_.isEmpty(limits.manageAge) && limits.manageAge && playList.age ){
            if ( playList.age > limits.manageAge.max || playList.age < limits.manageAge.min ){
                return true;
            }
        }

        if ( limits.editOnlyUnpublishedContent && playList.public  ){
            return true;
        }
    }
    return false;
};

exports.limitUserPublish = function( user, playList ){
    return exports.limitUserEdit(user, playList);
};

exports.limitUserUnpublish = function( user, playList ){
    return exports.limitUserEdit(user, playList);
};

exports.userCanEdit = function userCanEdit( user, playList){
    if ( !user || !playList ){
        return false;
    }

    return !!playList.userId.equals(user._id); // if owner

};

exports.userCanCopy = function userCanCopy( user/*, playList*/  ){
    return !!user;
};

exports.userCanDelete = function userCanDelete( user, playList ){
    return  !!user && ( !!user.isAdmin  || playList.userId.equals(user._id) );
};

exports.userCanPublish = function userCanPublish( /*user, playList*/ ) {
    // can publish if has permission. instrumented
};

exports.userCanUnpublish = function userCanUnpublish(){
    // can unpublish if as permission. instrumented.
};

// can see private playList if own..
exports.userCanSeePrivatePlayLists = function userCanSeePrivatePlayLists( user, playList ){
    if ( !playList || !user ){
        return false;
    }
    // can see if has permissions, instrumented
    return playList.userId.equals(user._id);
};

exports.userCanPreview = function userCanPreview( user, playList){
    return !!user && !!playList.userId.equals(user._id);
};


exports.getPermissions = function getPermissions( user, playList ){
    return {
        'canEdit' : exports.userCanEdit(user, playList),
        'canCopy' : exports.userCanCopy(user, playList),
        'canDelete' : exports.userCanDelete(user, playList),
        'canPublish' : exports.userCanPublish(user, playList),
        'canPreview' : exports.userCanPreview( user, playList ),
        'canUnpublish' : exports.userCanUnpublish( user, playList),
        'canSeePrivatePlayLists' : exports.userCanSeePrivatePlayLists( user, playList )
    };
};
