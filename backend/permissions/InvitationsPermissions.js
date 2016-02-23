'use strict';


/**
 *
 * @description
 * a bit obscure name for a permission for lack of a better terminology
 * used mainly for allowing users to see all reports made by this invite.
 *
 * @param user
 * @param report
 * @returns {boolean}
 */
exports.userCanSeeInvitationDetails = function(user, invitation){
    return invitation.inviter.toString() === user._id.toString();
};

exports.getPermissions = function( user, invitation ) {

    return {
        'canSeeInvitationDetails': exports.userCanSeeInvitationDetails(user, invitation)
    }
};
