'use strict';
var LessonInvitation = require('../models').LessonInvitation;
var LessonInvitationManager = require('../managers').lessonsInvitations;
var logger = require('log4js').getLogger('LessonsInvitationsMiddleware');

exports.exists = function exists(req, res, next) {
	exports.optionalExists(req, res, function(){
        if(!req.invitation){
            res.sendStatus(404);
            return;
        }
        next();
    });
};

exports.optionalExists = function optionalExists(req, res, next){
    logger.debug('checking if invitation exists : ', req.params.invitationId);
    try {
        LessonInvitation.findById(req.params.invitationId, function(err, result) {
            if (!!err) {
                res.status(500).send(err);
                return;
            }
            if (result) {
                LessonInvitationManager.dryBuildLesson(result, function (err, invitation) {
                    if (!!err) {
                        res.status(500).send(err);
                        return;
                    }
                    logger.debug('putting invitation on request', invitation);
                    req.invitation = invitation;
                    next();
                });
            }
            else {
                next();
            }
        });
    } catch (e) {
        res.sendStatus(404);
    }
};

exports.constructInvitationFromLesson = function(req, res, next){
    exports.optionalExists(req, res, function(){
        if (!req.invitation){
            // lets construct
            require('../managers/LessonsInvitationsManager').dryBuildLesson({lessonId: req.params.lessonId}, function(err, result){
                if (!!err || !result){
                    res.status(500).send('either result is missing or there was an error');
                }
                req.invitation = result;
                next();
            });
        }
    });
};

exports.existsOrConstruct = function existsOrConstruct(req, res, next){
    exports.optionalExists(req, res, function(){
        if ( !req.invitation ){
            // lets construct
            exports.constructInvitationFromLesson(req, res, function(){
                next(); // either invitation was constructed or not (lesson was deleted?) - it is out of our hands now.
            });
        }else{ // exists, so lets continue
            next();
        }
    });
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
