'use strict';
var PlaylistRprt = require('../models').PlaylistRprt;
var logger = require('log4js').getLogger('PlaylistRprtssMiddleware');
var permissions = require('../permissions');
var _ = require('lodash');

exports.exists = function exists(req, res, next) {
	logger.debug('checking if playlistRprt exists');
	try {
		PlaylistRprt.findById(req.params.playlistRprtId, function(err, result) {
			if (!!err) {
				res.stauts(500).send(err);
				return;
			}
			if (!result) {
				res.sendStatus(404);
				return;
			}

			logger.debug('putting playlistRprt on request', result);
            req.playlistRprt = result;
            next();

		});
	} catch (e) {
        console.log('could not find playlistRprt',e);
		res.sendStatus(404);
	}
};

// use this middleware as backward compatibility with change in october 2016.
// when we decided to remove as much data as possible from PlaylistRprt.
exports.mergeWithInvitationData = function mergeWithInvitationData(req, res, next){
    logger.info('merging playlistRprt with invitation data');
    var PlaylistsInvitationsMiddleware = require('./PlaylistsInvitationsMiddleware');
    if (!new PlaylistRprt(req.playlistRprt).isBasedOnTemporaryPlaylist()) { // create data duplication only if not based on temporary playlist. (e.g. practice mistakes)
        req.params.invitationId = req.playlistRprt.invitationId;
        if ( req.playlistRprt && req.playlistRprt.data ) {
            req.params.playlistId = req.playlistRprt.data.playlistId;
        }
        logger.info('requesting invitation');
        PlaylistsInvitationsMiddleware.existsOrConstruct(req, res, function () {
            logger.info('got the invitation', !!req.invitation);
            // guy mograbi: since october 2016 we decided to remove as much data from playlistRprt as possible
            // so we restore this information in the middleware on each request
            _.merge(req.playlistRprt.data, req.invitation);
            next();
        });
    } else {
        next();
    }
};

// todo split to several middlewares : 'userCanDelete','optionUserCanDelete', 'userCanUserInfoOnPlaylistRprts'
exports.userCanDelete = function userCanDelete(req, res, next) {
	if (permissions.playlistRprt.userCanDelete(req.sessionUser, req.playlistRprt)) {
		return next();
	} else if (permissions.playlistRprt.userCanDeleteUserInfo(req.sessionUser, req.playlistRprt)) {
		req.deleteUserInfo = true;
		return next();
	} else {
		return res.send(400);
	}
};
