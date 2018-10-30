'use strict';

/**
 * @module PlaylistsController
 * @type {exports}
 */

var managers = require('../managers');
var services = require('../services');
var async = require('async');
var logger = require('log4js').getLogger('PlaylistsController');
var Playlist = require('../models/Playlist');
var _ = require('lodash');
var Like = require('../models/Like');

exports.getUserPlaylists = function(req, res) {
	var queryObj = req.queryObj;
	queryObj.filter.userId = req.sessionUser._id;
	managers.playlists.complexSearch(queryObj, function(err, obj) {
		if (!!err) {
			err.send(res);
			return;
		} else {
			res.send(obj);
			return;
		}
	});
};

exports.getUserLikedPlaylists = function(req, res) {
	var queryObj = req.queryObj;
	Like.find({
		userId : req.sessionUser._id,
		itemType : 'playlist'
	}, {
		itemId : 1,
		_id : 1
	}, function(err, result) {
		if (!!err) {
			err.send(res);
			return;
		}
		var mapResults = {};
		_.each(result, function(r) {
			mapResults[r.itemId.toString()] = r._id.getTimestamp();
		});
		queryObj.filter._id = {
			$in : _.map(result, 'itemId')
		};
		managers.playlists.complexSearch(queryObj, function(err, obj) {
			if (!!err) {
				err.send(res);
				return;
			} else {
				_.each(obj.data, function(o) {
					o.lastUpdate = mapResults[o._id.toString()];
				});
				return res.send(obj);
			}
		});
	});

};

// assumes user and playlist exists and user can see playlist
// or playlist is public and then we don't need user
exports.getPlaylistById = function(req, res) {
	if (!req.playlist) {
		new managers.error.NotFound('could not find playlist').send(res);
		return;
	}
	res.send(req.playlist);
};

exports.getAdminPlaylists = function(req, res) {

	managers.playlists.complexSearch(req.queryObj, function(err, result) {
		if (!!err) {
			new managers.error.InternalServerError(err, 'unable to get all admin playlists').send(res);
			return;
		}

        var usersId = _.map(result.data,'userId');
        Playlist.countPublicPlaylistsByUser( usersId , function(err, publicCountByUser ){
            if ( !!err ){
                new managers.error.InternalServerError(err, 'unable to add count for public playlists').send(res);
                return;
            }
            _.each(result.data, function(r){
                r.publicCount = publicCountByUser[r.userId];
            });
            res.send(result);
        });
	});
};

exports.adminUpdatePlaylist = function(req, res) {
	var playlist = req.body;
    playlist.userId = services.db.id(playlist.userId);
	playlist._id = services.db.id(playlist._id);
	managers.playlists.updatePlaylist(playlist, function(err, obj) {
		if (!!err) {
			err.send(res);
			return;
		} else {
			res.send(obj);
			return;
		}
	});
};

exports.getPublicPlaylists = function(req, res) {

	try {
		var queryObj = req.queryObj;

		if (!queryObj.filter || !queryObj.filter.public || queryObj.filter.public.$exists !== 1) {

			throw new Error('public must be $exists 1');
		}
	} catch (e) {
		res.status(400).send('playlists controller - illegal filter value : ' + e.message);
		return;
	}

	var playlists = [];
	async.waterfall([ function loadPlaylists(callback) {
		managers.playlists.complexSearch(req.queryObj, function(err, result) {

			if (!!err) {
				callback(new managers.error.InternalServerError(err, 'unable to get all admin playlists'));
				return;
			}
            playlists = result;
			callback();
		});
	}, function loadUsers(callback) {

		var usersId = _.map(playlists.data, 'userId');
		managers.users.getPublicUsersDetailsMapByIds(usersId, function(err, usersById) {

			if (!!err) {
				callback(new managers.error.InternalServerError(err, 'unable to load users by id'));
				return;
			}
			_.each(playlists.data, function(l) {
				l.user = usersById[l.userId];
			});

			callback();
		});
	} ], function returnResponse(err) {
		if (!!err) {
			err.send(res);
			return;
		} else {
			res.send(playlists);
		}
	});

};

exports.getPlaylistIntro = function(req, res) {
	managers.playlists.getPlaylistIntro(req.params.playlistId, function(err, result) {
		res.send(result);
	});
};

exports.overrideQuestion = function(req, res) {
	logger.info('overriding question :: ' + req.question._id + ' in playlist ::' + req.playlist._id);

	var newQuestion = null;
	async.waterfall([ function copyQuestion(callback) {
		logger.info('copying question');
		managers.questions.copyQuestion(req.sessionUser, req.question, callback);
	}, function replaceQuestion(_newQuestion, callback) {
		logger.info('replacing question');
		try {
			newQuestion = _newQuestion;
			var oldQuestion = req.question;
			var playlistObj = new Playlist(req.playlist);
            playlistObj.replaceQuestionInPlaylist(oldQuestion._id.toString(), newQuestion._id.toString());
			playlistObj.update();
			callback(null);
			return;
		} catch (e) {
			logger.error('unable to override question', e);
			callback(e);
			return;
		}
		// wrap playlist object with our model and invoke save.

	} ], function(err) {
		logger.info('override async finished');
		if (!!err) {
			res.status(500).send('unable to replace' + err.message);
			return;
		} else if (newQuestion === null) {
			res.status(500).send('unknown error');
			return;
		} else { // newQuestion != null
			logger.info('completed successfully');
			res.status(200).send({
				'playlist' : req.playlist,
				'quizItem' : newQuestion
			});
		}
	});
};

exports.copyPlaylist = function(req, res) {
	managers.playlists.copyPlaylist(req.sessionUser, req.playlist, function(err, result) {
		res.send(result);
	});
};

function _updatePlaylist( playlist , res ){
    managers.playlists.updatePlaylist(playlist, function(err, obj) {
        if (!!err) {
            err.send(res);
            return;
        } else {
            res.send(obj);
            return;
        }
    });
}

/**
 *
 *
 * ---- new function format. this format will align to a new API REST format
 * similar to http://api.stackexchange.com/docs/
 *
 * it will assume user was authorized to get here, and will NOT assume user own
 * the resource.
 *
 * For example - update playlist will not assume the editor is the user on the
 * request, but will assume the user on the request is allowed to edit this
 * playlist;
 *
 *
 *
 */

exports.update = function(req, res) {
	logger.info('updating playlist');
	var playlist = req.body;

	playlist.userId = req.playlist.userId;
	playlist._id = services.db.id(playlist._id);

    _updatePlaylist( playlist, res );

};


/**
 *
 * This function only publishes a playlist.
 *
 * We separate this from 'update' to allow the existance of 'publishers' in the system which are not 'editors'.
 *
 * @param req
 * @param res
 */
exports.publish = function(req, res){
    var playlist = req.playlist;
    playlist.public = new Date().getTime();
    _updatePlaylist( playlist, res );
};


/**
 *
 * This function only unpublishes a playlist.
 *
 * We separate this from 'update' to allow the existance of 'publishers' in the system which are not 'editors'.
 *
 * @param req
 * @param res
 */
exports.unpublish = function(req, res){
    var playlist = req.playlist;
    delete playlist.public;
    _updatePlaylist( playlist, res );
};

/**
 *
 * Creates a new playlist and assigns it to the logged in user.
 *
 * @param req
 * @param res
 */

exports.create = function(req, res) {
    logger.info('create playlist');
	var playlist = {};
	playlist.userId = req.sessionUser._id;
	managers.playlists.createPlaylist(playlist, function(err, obj) {
		if (!!err) {
			err.send(res);
			return;
		} else {
			res.send(obj);
			return;
		}
	});
};

/**
 * gets a list of ids and returns the corresponding playlists.
 *
 * how to pass a list of ids over req query?
 *
 * ?idsList[]=1&idsList[]=2&idsList[]=3
 *
 * @param req
 * @param res
 */
exports.findPlaylistsByIds = function(req, res) {

	var objectIds = req.getQueryList('playlistsId');
	logger.info('this is object ids', objectIds);
	objectIds = services.db.id(objectIds);

	Playlist.find({
		'_id' : {
			'$in' : objectIds
		}
	}, {}, function(err, result) {
		if (!!err) {
			new managers.error.InternalServerError(err, 'unable to find playlists by ids').send(res);
			return;
		} else {
			res.send(result);
			return;
		}
	});
};

exports.deletePlaylist = function(req, res) {
	managers.playlists.deletePlaylist(req.playlist._id, function(err, deletedPlaylist) {
		if (!!err) {
			logger.error('error deleting playlist', err);
			err.send(res);
			return;
		} else {
			managers.playlistsInvitations.deleteByPlaylistId(req.playlist._id, function(err/*
																						 * ,
																						 * deletedInvitations
																						 */) {
				if (!!err) {
					logger.error('error deleting playlists invitations', err);
					err.send(res);
					return;
				} else {
					res.send(deletedPlaylist);
					return;
				}
			});
		}
	});

};

exports.findUsages = function(req, res) {
	Playlist.findByQuizItems(req.question, function(err, obj) {
		if (!!err) {
			err.send(res);
			return;
		} else {
			res.send(obj);
			return;
		}
	});
};
