'use strict';

exports.userCanDelete = function(report, user) {
	return !!user.isAdmin || report.data.inviter===user._id.toString();
};

exports.userCanDeleteItSelf = function(report, user) {
	return report.userId.equals(user._id);
};

exports.getPermissions = function(report, user) {
	return {
		'canDelete' : exports.userCanDelete(report, user),
		'canDeleteItSelf' : exports.userCanDeleteItSelf(lesson, user)
	};
};