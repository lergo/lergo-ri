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
	console.log('this is get PlaylistById..............');
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

var previousDate = 0;
var userCache = {};  // these are all the users with public playlists and will be used in the createdBy filter
var enHomePagePlaylists = {};
var heHomePagePlaylists = {};
var arHomePagePlaylists = {};

exports.getPublicPlaylists = function(req, res) {
	var d = new Date();
	// var currentDate = d.getDate();
	var currentDate = d.getHours();  // temporarily use hours to enable checking for bugs
	var qObjFilter = req.queryObj.filter;
	var qObjProjec = req.queryObj.projection;
	// 'mustHaveUndefined' prevents any filter query from being cached as default homepage query
	var mustHaveUndefined = !qObjFilter.hasOwnProperty('tags.label') && qObjFilter.subject === undefined && qObjFilter.age === undefined && qObjFilter.userId === undefined && qObjFilter.searchText === undefined && qObjFilter.views === undefined;

	var userFlag = false;
	var hePlaylistsFlag = false;
	var enPlaylistsFlag = false;
	var arPlaylistsFlag = false;
	// checking if this is a user/usernames query
	if ( qObjFilter && qObjFilter.public && Object.values(qObjFilter.public).includes(1) && qObjProjec && qObjProjec.userId === 1 && req.queryObj.limit === 0 ) {
		userFlag = true;  // if we don't have cached usernames, this flag will enable saving it at the end of code
		logger.info('is a usernames query: ');
		if (!_.isEmpty(userCache)) {
			logger.info('using the usernames cache with', userCache.data.length, 'users');
			res.send(userCache);
			if (currentDate !== previousDate) { // reset the home page link every day
				previousDate = currentDate;
				logger.info('usernames cache: updating date to ', previousDate);
				userCache = {}; // setting userCache to empty
				enHomePagePlaylists = {}; // setting enHomePagePlaylists to empty
				arHomePagePlaylists = {}; // setting arHomePagePlaylists to empty
				heHomePagePlaylists = {}; // setting heHomePagePlaylists to empty
			}
			return;
			
		} else {
			logger.info('need to cache the  usernames');
		}
	} else {
		//logger.info('not usernames query: ');
	}

	//  english, arabic, hebrew, playlist cache - using 'mustHaveUndefined'
	if ( qObjFilter && qObjFilter.public && Object.values(qObjFilter.public).includes(1) && req.queryObj.limit === 18 && req.queryObj.skip === 0 && mustHaveUndefined) {
		if (qObjFilter.language === 'english') {
			enPlaylistsFlag = true;  
			if (!_.isEmpty(enHomePagePlaylists)) {
				logger.info('using the enHomePagePlaylists cache', enHomePagePlaylists.data.length, ' playlists');
				res.send(enHomePagePlaylists);
				if (currentDate !== previousDate) { // reset the home page link every day
					previousDate = currentDate;
					logger.info('usernames cache: updating date to ', previousDate);
					userCache = {}; // setting userCache to empty
					enHomePagePlaylists = {}; // setting enHomePagePlaylists to empty
					arHomePagePlaylists = {}; // setting arHomePagePlaylists to empty
					heHomePagePlaylists = {}; // setting heHomePagePlaylists to empty
				}
				return;
				
			} else {
				logger.info('need to cache homepage english playlists');
			}
		} else if (qObjFilter.language === 'arabic') {
			arPlaylistsFlag = true;  
			if (!_.isEmpty(arHomePagePlaylists)) {
				logger.info('using the arHomePagePlaylists cache', arHomePagePlaylists.data.length, ' playlists');
				res.send(arHomePagePlaylists);
				if (currentDate !== previousDate) { // reset the home page link every day
					previousDate = currentDate;
					logger.info('arabic homepage playlists cache: updating date to ', previousDate);
					userCache = {}; // setting userCache to empty
					enHomePagePlaylists = {}; // setting enHomePagePlaylists to empty
					arHomePagePlaylists = {}; // setting arHomePagePlaylists to empty
					heHomePagePlaylists = {}; // setting heHomePagePlaylists to empty
				}
				return;
				
			} else {
				logger.info('need to cache homepage arabic playlists');
			}
		} else if (qObjFilter.language === 'hebrew') {
			hePlaylistsFlag = true;  
			if (!_.isEmpty(heHomePagePlaylists)) {
				logger.info('using the heHomePagePlaylists cache', heHomePagePlaylists.data.length, ' playlists');
				res.send(heHomePagePlaylists);
				if (currentDate !== previousDate) { // reset the home page link every day
					previousDate = currentDate;
					logger.info('hebrew homepage playlists cache: updating date to ', previousDate);
					userCache = {}; // setting userCache to empty
					enHomePagePlaylists = {}; // setting enHomePagePlaylists to empty
					arHomePagePlaylists = {}; // setting arHomePagePlaylists to empty
					heHomePagePlaylists = {}; // setting heHomePagePlaylists to empty
				}
				return;
				
			} else {
				logger.info('need to cache homepage hebrew playlists');
			}
		
		} else {
			logger.info('not caching this language: ',qObjFilter.language );
		}
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
			
			if (userFlag === true) {
				logger.info('caching the public usernames');
				userCache = playlists;
			} 
			if (enPlaylistsFlag === true) {
				logger.info('caching the english home page playlists');
				enHomePagePlaylists = playlists;
			} 
			if (hePlaylistsFlag === true) {
				logger.info('caching the hebrew home page playlists');
				heHomePagePlaylists = playlists;
			} 
			if (arPlaylistsFlag === true) {
				logger.info('caching the arabic home page playlists');
				arHomePagePlaylists = playlists;
			} 
			res.send(playlists);
		}
	});

};

exports.getPlaylistIntro = function(req, res) {
	managers.playlists.getPlaylistIntro(req.params.PlaylistId, function(err, result) {
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
			var PlaylistObj = new Playlist(req.playlist);
			PlaylistObj.replaceQuestionInPlaylist(oldQuestion._id.toString(), newQuestion._id.toString());
			PlaylistObj.update();
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

function _unsetPublic( playlist , res ){
    managers.playlists.unsetPublic(playlist, function(err, obj) {
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
	console.log('trying to update playlists');
	var playlist = req.body;

	playlist.userId = req.playlist.userId;
	playlist._id = services.db.id(playlist._id);

    _updatePlaylist( playlist, res );

};

/* used for deleting invalid question / steps in playlist before running a playlist */
exports.fix = function(req, res) {
	logger.info('fixing playlist');
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
    _unsetPublic( playlist, res );
};

/**
 *
 * Creates a new playlist and assigns it to the logged in user.
 *
 * @param req
 * @param res
 */

exports.create = function(req, res) {
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
	console.log('..........playlists.............req', req.getQueryList('playlistsId'));
	var objectIds = req.getQueryList('playlistsId');
	logger.info('getting object ids');
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
