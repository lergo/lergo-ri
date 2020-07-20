'use strict';
var PlaylistInvitation = require('../models').PlaylistInvitation;
var PlaylistInvitationManager = require('../managers').playlistsInvitations;
var logger = require('log4js').getLogger('PlaylistsInvitationsMiddleware');

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
        PlaylistInvitation.findById(req.params.invitationId, function(err, result) {
            if (!!err) {
                res.status(500).send(err);
                return;
            }
            if (result) {
                PlaylistInvitationManager.dryBuildPlaylist(result, function (err, invitation) {
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

exports.constructInvitationFromPlaylist = function(req, res, next){
    exports.optionalExists(req, res, function(){
        if (!req.invitation){
            // lets construct
            require('../managers/PlaylistsInvitationsManager').dryBuildPlaylist({playlistId: req.params.playlistId}, function(err, result){
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
            exports.constructInvitationFromPlaylist(req, res, function(){
                next(); // either invitation was constructed or not (playlist was deleted?) - it is out of our hands now.
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
