'use strict';

exports.userCanDelete = function(user, report) {
	return !!user.isAdmin || report.data.inviter === user._id.toString();
};

exports.userCanDeleteUserInfo = function(user, report) {
	return report.userId.equals(user._id);
};

exports.getPermissions = function( user, report ) {
	return {
		'canDelete' : exports.userCanDelete(user, report),
		'userCanDeleteUserInfo' : exports.userCanDeleteUserInfo( user, report )
	};
};