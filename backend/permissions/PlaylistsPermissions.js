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

// return true iff playlist is restricted
/**
 *
 * @param {PermissionsLimitations} limits
 * @param {Playlist} playlist
 * @returns {boolean}
 */
exports.limitUserEdit = function(user, playlist){

    var limits = user.permissionsLimitations;

    if ( limits && playlist ){ // don't limit if playlist not specified

        if (!_.isEmpty(limits.manageSubject) && !_.includes(limits.manageSubject, playlist.subject )){
            return true;
        }

        if (!_.isEmpty(limits.manageLanguages) && !_.includes(limits.manageLanguages, playlist.language)){
            return true;
        }

        if ( !_.isEmpty(limits.manageAge) && limits.manageAge && playlist.age ){
            if ( playlist.age > limits.manageAge.max || playlist.age < limits.manageAge.min ){
                return true;
            }
        }

        if ( limits.editOnlyUnpublishedContent && playlist.public  ){
            return true;
        }
    }
    return false;
};

exports.limitUserPublish = function( user, playlist ){
    return exports.limitUserEdit(user, playlist);
};

exports.limitUserUnpublish = function( user, playlist ){
    return exports.limitUserEdit(user, playlist);
};

exports.userCanEdit = function userCanEdit( user, playlist){
    if ( !user || !playlist ){
        return false;
    }

    return !!playlist.userId.equals(user._id); // if owner

};

exports.userCanCopy = function userCanCopy( user/*, playlist*/  ){
    return !!user;
};

exports.userCanDelete = function userCanDelete( user, playlist ){
    return  !!user && ( !!user.isAdmin  || playlist.userId.equals(user._id) );
};

exports.userCanPublish = function userCanPublish( /*user, playlist*/ ) {
    // can publish if has permission. instrumented
};

exports.userCanUnpublish = function userCanUnpublish(){
    // can unpublish if as permission. instrumented.
};

// can see private playlist if own..
exports.userCanSeePrivatePlaylists = function userCanSeePrivatePlaylists( user, playlist ){
    if ( !playlist || !user ){
        return false;
    }
    // can see if has permissions, instrumented
    return playlist.userId.equals(user._id);
};

exports.userCanPreview = function userCanPreview( user, playlist){
    return !!user && !!playlist.userId.equals(user._id);
};


exports.getPermissions = function getPermissions( user, playlist ){
    return {
        'canEdit' : exports.userCanEdit(user, playlist),
        'canCopy' : exports.userCanCopy(user, playlist),
        'canDelete' : exports.userCanDelete(user, playlist),
        'canPublish' : exports.userCanPublish(user, playlist),
        'canPreview' : exports.userCanPreview( user, playlist ),
        'canUnpublish' : exports.userCanUnpublish( user, playlist),
        'canSeePrivatePlaylists' : exports.userCanSeePrivatePlaylists( user, playlist )
    };
};
