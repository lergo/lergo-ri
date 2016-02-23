'use strict';
var LessonInvitation = require('../models').LessonInvitation;
var logger = require('log4js').getLogger('LessonsInvitationsMiddleware');
var permissions = require('../permissions');
var services = require('../services');

exports.userCanSeeInvitationDetails = function canSeeInvitationDetails( req, res, next ){
    var user = req.sessionUser;
    var invitation = req.invitation;
    if ( !permissions.invitations.userCanSeeInvitationDetails( user, invitation ) ){
        new services.error.Forbidden(null, 'cannot see invitation details').send(res);
        return;
    }
    next();
};

exports.exists = function exists(req, res, next) {
	logger.debug('checking if invitation exists : ', req.params.invitationId);
	try {
		LessonInvitation.findById(req.params.invitationId, function(err, result) {
			if (!!err) {
				res.send(500, err);
				return;
			}
			if (!result) {
				res.send(404);
				return;
			}

			logger.debug('putting invitation on request', result);
			req.invitation = result;

			next();

		});
	} catch (e) {
		res.send(404);
	}
};

exports.userCanDelete = function userCanDelete(req, res, next) {
	var user = req.sessionUser;
	var invitation = req.invitation;
	if (!!user && invitation.inviter.equals(user._id)) {
		return next();
	} else {
		return res.status(400).send('');
	}
};
