'use strict';
var LessonInvitation = require('../models').LessonInvitation;
var User = require('../models').User;
var sha1 = require('sha1');
var logger = require('log4js').getLogger('LessonsInvitationsMiddleware');

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

/**
 * looks for 'by' details in invitation.
 * if exists, puts user on request.
 * @param req
 * @param res
 * @param next
 */
exports.putByOnRequest = function putByOnRequest( req, res, next ){
	try{
		var by = req.body.by;
		var t = req.body.t;
		User.findById(by, function(err, result){

			if ( result && sha1(result.email) === t){
				req.inviteBy = result;
			}
			next();
		});
	}catch(e){
		next();
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