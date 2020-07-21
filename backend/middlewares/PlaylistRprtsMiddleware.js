'use strict';
var PlaylistRprts = require('../models').PlaylistRprts;
var logger = require('log4js').getLogger('PlaylistRprtssMiddleware');
var permissions = require('../permissions');
var _ = require('lodash');

exports.exists = function exists(req, res, next) {
	logger.debug('checking if playlistRprts exists : ', req.params.playlistRprtsId);
	try {
		PlaylistRprts.findById(req.params.playlistRprtsId, function(err, result) {
			if (!!err) {
				res.stauts(500).send(err);
				return;
			}
			if (!result) {
				res.sendStatus(404);
				return;
			}

			logger.debug('putting playlistRprts on request', result);
            req.playlistRprts = result;
            next();

		});
	} catch (e) {
        console.log('could not find playlistRprts',e);
		res.sendStatus(404);
	}
};

// use this middleware as backward compatibility with change in october 2016.
// when we decided to remove as much data as possible from PlaylistRprts.
exports.mergeWithInvitationData = function mergeWithInvitationData(req, res, next){
    logger.info('merging playlistRprts with invitation data');
    var PlaylistsInvitationsMiddleware = require('./PlaylistsInvitationsMiddleware');
    if (!new PlaylistRprts(req.playlistRprts).isBasedOnTemporaryPlaylist()) { // create data duplication only if not based on temporary playlist. (e.g. practice mistakes)
        req.params.invitationId = req.playlistRprts.invitationId;
        if ( req.playlistRprts && req.playlistRprts.data ) {
            req.params.playlistId = req.playlistRprts.data.playlistId;
        }
        logger.info('requesting invitation');
        PlaylistsInvitationsMiddleware.existsOrConstruct(req, res, function () {
            logger.info('got the invitation', !!req.invitation);
            // guy mograbi: since october 2016 we decided to remove as much data from playlistRprtss as possible
            // so we restore this information in the middleware on each request
            _.merge(req.playlistRprts.data, req.invitation);
            next();
        });
    } else {
        next();
    }
};

// todo split to several middlewares : 'userCanDelete','optionUserCanDelete', 'userCanUserInfoOnPlaylistRprts'
exports.userCanDelete = function userCanDelete(req, res, next) {
	if (permissions.playlistRprtss.userCanDelete(req.sessionUser, req.playlistRprts)) {
		return next();
	} else if (permissions.playlistRprtss.userCanDeleteUserInfo(req.sessionUser, req.playlistRprts)) {
		req.deleteUserInfo = true;
		return next();
	} else {
		return res.send(400);
	}
};
