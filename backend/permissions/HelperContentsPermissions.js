'use strict';

exports.userCanEdit = function(helperContent, user) {
	if (!user || !helperContent) {
		return false;
	}
	return !!user.isAdmin;
};