'use strict';

/**
 * @module PlaylistsInvitationsManager
 * @type {exports}
 */

var services = require('../services');
var playlistsManager = require('./PlaylistsManager');
var errorManager = require('./ErrorManager');
var lessonsManager = require('./QuestionsManager');
var logger = require('log4js').getLogger('PlaylistsInvitationsManager');
var models = require('../models');
var async = require('async');


/**
 *
 * @param {object} invitation
 * @param {ObjectId|string} invitation.playlistId
 * @param callback
 */
exports.dryBuildPlaylist = function(invitation, callback){

    async.waterfall([ function getPlaylistById(_callback) {
        playlistsManager.getPlaylistIntro(invitation.playlistId, _callback);
    }, function getAllQuizItems(result, _callback) {
        invitation.playlist = result;
        var playlistModel = new models.Playlist(result);
        var lessonsId = playlistModel.getAllQuestionIds();
        lessonsId = services.db.id(lessonsId);
        lessonsManager.search({
            '_id' : {
                '$in' : lessonsId
            }
        }, {}, _callback);
    }, function updatePlaylistInvitation(result, _callback) {
            invitation.quizItems = result;
            _callback();


        }
    ], function invokeCallback(err) {
            logger.info('done building playlist. sending back to callback');
            callback(err, invitation);
        }
    );
};

/**
 * Once someone opens an invitation, our first step is to build the playlist
 *
 * @param invitation
 * @param callback
 */
exports.buildPlaylist = function(invitation, callback) {
	exports.dryBuildPlaylist(invitation, function(err, invitation){
        var playlistId = null;
        var updatedInvitation=invitation;
        async.waterfall([
            // function updateInvitation(_callback){
            //     playlistId = invitation.playlistId;
            //     exports.updatePlaylistInvitation(invitation, function(err, result){
            //         if ( result ){
            //             logger.debug('result from updating playlist invitation', result);
            //         }
            //         updatedInvitation = invitation;
            //         _callback(err); //
            //     });
            // },
            function addCounterOnPlaylist(_callback){
                playlistsManager.incrementViews(playlistId, function(err) {
                    /*
                     * guy - I don't know why simply passing _callback does not work.
                     * have to write a function to do that
                     */
                    if (!!err) {
                        logger.error('error incrementing views on playlist', err);
                    }
                    logger.info('after increment');
                    _callback();
                });
            }
        ], function invokeCallback(err) {
            logger.info('done updating db',err, updatedInvitation);
            callback(err, updatedInvitation);
        });

    });
};

exports.search = function(filter, projection, callback) {
	logger.info('finding the invitation', filter);
	models.PlaylistInvitation.connect(function(db, collection, done) {
		collection.findOne(filter, projection, function(err, result) {

			if (!!err) {
				done();
				callback(new errorManager.InternalServerError(err, 'error while getting playlist invitation'));
				return;
			}
			done();
			callback(null, result);
			return;

		});
	});
};

exports.find = exports.search;

exports.updatePlaylistInvitation = function(invitation, callback) {
	models.PlaylistInvitation.connect(function(db, collection) {
		collection.updateOne({
			_id : invitation._id
		}, invitation, function(err, result) {
			logger.info('after update', arguments);
			callback(err, result);
			return;
		});
	});
};

exports.create = function(invitation, callback) {
	invitation.playlistId = services.db.id(invitation.playlistId);
	models.PlaylistInvitation.connect(function(db, collection) {
		collection.insertOne(invitation, {}, function(err, result) {
			callback(err, result.ops[0]);
			return;
		});

	});
};

exports.deleteByPlaylistId = function(playlistId, callback) {
	models.PlaylistInvitation.connect(function(db, collection) {
		collection.deleteOne({
			'playlistId' : services.db.id(playlistId)
		}, callback);
	});
};

exports.deleteById = function(id, callback) {
	models.PlaylistInvitation.connect(function(db, collection) {
		collection.deleteOne({
			'_id' : services.db.id(id)
		}, function(err) {
			if (!!err) {
				logger.error('unable to delete report [%s]', err.message);
			}
			callback(err);
		});
	});
};

/**
 *
 * @description
 * returns playlist invitation according to query object. without quizItems.

 *
 * @param {ComplexSearchQuery} queryObj
 * @param callback
 */
exports.complexSearch = function(queryObj, callback) {
	if (!!queryObj.filter) {
		if (!!queryObj.filter['data.finished']) {
			queryObj.filter.finished = queryObj.filter['data.finished'];
			delete queryObj.filter['data.finished'];
		}
		if (!!queryObj.filter['data.invitee.name']) {
			queryObj.filter['invitee.name'] = queryObj.filter['data.invitee.name'];
			delete queryObj.filter['data.invitee.name'];
		}
        if ( !!queryObj.filter['data.invitee.class']){
            queryObj.filter['invitee.class'] = queryObj.filter['data.invitee.class'];
            delete queryObj.filter['data.invitee.class'];
        }
	}
	models.PlaylistInvitation.connect(function(db, collection) {
		services.complexSearch.complexSearch(queryObj, {
			collection : collection
		}, callback);
	});
};
