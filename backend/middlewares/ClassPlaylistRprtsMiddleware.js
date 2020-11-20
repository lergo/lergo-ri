'use strict';
var PlaylistRprt = require('../models').ClassPlaylistRprt;
var logger = require('log4js').getLogger('PlaylistRprtsMiddleware');

exports.exists = function exists(req, res, next) {
	logger.info('checking if playlistRprt exists : ', req.params.playlistRprtId);
	try {
		PlaylistRprt.findById(req.params.playlistRprtId, function(err, result) {
			if (!!err) {
				res.status(500).send(err);
				return;
			}
			if (!result) {
				res.send(404);
				return;
			}

			logger.debug('putting playlistRprt on request', result);
			req.playlistRprt = result;

			next();

		});
	} catch (e) {
		res.send(404);
	}
};
