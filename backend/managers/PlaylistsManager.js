'use strict';
/**
 * @module PlaylistsManager
 * @type {Logger}
 */
// todo user "managers" instead..
// since this is a manager, we cannot simply require('./index');
// we need to use setTimeout( function(){ managers = require('./index'); },0);
// hopefully this will cause the event loop to execute after index.js is initialized.

var logger = require('log4js').getLogger('PlaylistsManager');
var services = require('../services');
var errorManager = require('./ErrorManager');
var usersManager = require('./UsersManager');
var _ = require('lodash');
var Playlist = require('../models/Playlist');


exports.createPlaylist = function(playlist, callback) {
	logger.info('Creating playlist');
	playlist.createdAt = new Date().toISOString();
    if ( !playlist.age) {
        playlist.age = 8;
    }
	services.db.connect('playlists', function(db, collection) {
		collection.insertOne(playlist, function(err) {
			if (!!err) {
				logger.error('error creating playlist [%s] : [%s]', playlist.name, err);
				callback(new errorManager.InternalServerError());
				return;
			} else {
				logger.info('Playlist [%s] created successfully. invoking callback', playlist.name);
				callback(null, playlist);
				return;
			}
		});
	});
};


/**
 *
 *
 *
 * This function copies a playlist while picking very specific fields from it.
 *
 *
 * @param user - the user making the copy
 * @param playlist
 * @param callback
 */

exports.copyPlaylist = function (user, playlist, callback) {

    // if I copy from a copy of the original, I am also a copy of the original.. ==> transitive
    // copy of is transitive property of a playlist;
    var copyOf = [];


    // LERGO-412 - we decided we want to remember even if same user.
    // LERGO-569 - we decided we DO NOT want to remember if the same user..
    if ( !services.db.id(user._id).equals( services.db.id( playlist.userId ) ) ){
        copyOf = copyOf.concat(playlist._id);
    }

    // copy of is a transitive property.
    if ( !!playlist.copyOf ){
        copyOf = copyOf.concat(playlist.copyOf);
    }

    playlist = _.pick(playlist, ['age','description','name','steps','language','subject','tags']);

    var copyOfName = 'Copy of: ';

    if (playlist.language === 'hebrew') {
        copyOfName = 'העתק של: ';
    } else if (playlist.language === 'arabic') {
        copyOfName = 'نسخة من: ';
    } else {
        copyOfName = 'Copy of: ';
    }

    playlist.name = copyOfName  + playlist.name;

    if ( copyOf.length > 0 ){
        playlist.copyOf = copyOf;
    }

    playlist.createdAt = new Date().toISOString();
    playlist.lastUpdate = new Date().getTime();
    playlist.userId = services.db.id(user._id);

    services.db.connect('playlists', function (db, collection) {
        collection.insertOne(playlist, function (err) {
            if (!!err) {
                logger.error('error copying playlist [%s]', playlist.name, err);
                callback(new errorManager.InternalServerError());
                return;
            } else {
                logger.info('Playlist [%s] copied successfully', playlist.name);
                callback(null, playlist);
                return;
            }
        });
    });
};

exports.updatePlaylist = function(playlist, callback) {
	logger.info('Updating playlist');
	services.db.connect('playlists', function(db, collection, done) {
		collection.updateOne({
			'_id' : playlist._id
		}, {$set: playlist}, function(err) {
			if (!!err) {
				logger.error('error in updating playlist [%s] : [%s]', playlist.name, err);
				callback(new errorManager.InternalServerError());
				done();
				return;
			} else {
				// logger.info('Playlist [%s] updated successfully. invoking callback', playlist.name);
				callback(null, playlist);
				done();
				return;
			}
		});
	});
};

exports.unsetPublic = function(playlist, callback) {
	logger.info('unsetting public');
	services.db.connect('playlists', function(db, collection, done) {
		collection.updateOne({
			'_id' : playlist._id
		}, { $unset : { public : 1} }, function(err) {
			if (!!err) {
				logger.error('error in updating playlist [%s] : [%s]', playlist.name, err);
				callback(new errorManager.InternalServerError());
				done();
				return;
			} else {
				logger.info('Playlist [%s] updated successfully. invoking callback', playlist.name);
				callback(null, playlist);
				done();
				return;
			}
		});
	});
};

exports.deletePlaylist = function(id, callback) {
	logger.info('Deleting playlist : ' + id);
	services.db.connect('playlists', function(db, collection) {
		collection.deleteOne({
			'_id' : services.db.id(id)
		}, function(err) {
			if (!!err) {
				logger.error('unable to query for user [%s]', err.message);
			}
			callback(err);
		});
	});
};

exports.incrementViews = function(playlistId, callback) {
	services.db.connect('playlists', function(db, collection, done) {
		collection.updateOne({
			'_id' : services.db.id(playlistId)
		}, {
			'$inc' : {
				'views' : 1
			}
		}, function(err, result) {
			done();
			if (!!callback) {
				callback(err, result);
			}
		});
	});
};

exports.getPlaylist = function (filter, callback) {
    logger.info('Fetching playlist by ID', JSON.stringify(filter));
    services.db.connect('playlists', function (db, collection/*, done*/) {
        collection.findOne(filter, function (err, item) {
                if (!!err) {
                    logger.error('unable to query for playlist [%s]', err.message);
                    callback(null, item);
                } else {
                    item.timeStamp = item._id.getTimestamp();
                    callback(err, item);
                }
            }
        );
    });
};

exports.getUserPlaylists = function(userId, callback) {
	logger.info('Getting playlists');
	services.db.connect('playlists', function(db, collection, done) {
		collection.find({
			'userId' : userId
		}).toArray(function(err, result) {
			if (!!err) {
				logger.error('unable to query for playlists [%s]', err.message);
			}
			done();
			callback(err, result);
		});
	});
};

exports.find = function(filter, projection, callback) {
	logger.info('finding playlists');
	services.db.connect('playlists', function(db, collection, done) {
		collection.find(filter, projection).toArray(function(err, result) {
			if (!!err) {
				logger.error('unable to find playlists [%s]', err.message);
			}
			done();
			callback(err, result);
		});
	});
};

exports.getPublicPlaylists = function(callback) {
	var result = [];
	var usersId = [];
	services.db.connect('playlists', function(db, collection, done) {
		collection.find({
			'public' : {
				'$exists' : true
			}
		}, {}).each(function(err, obj) {
			logger.debug('handling playlist');
			if (obj === null) { // means we found all playlists
				done();
				usersManager.getPublicUsersDetailsMapByIds(usersId, function(err, usersById) {
					logger.info('got users map', usersById);
					result.forEach(function(item) {
						item.user = _.omit(usersById[item.userId.toHexString()], '_id');
						item.timeStamp = item._id.getTimestamp();

					});

					callback(null, result);
					return;
				});
			} else {
				usersId.push(obj.userId);
				result.push(obj);
			}
		});
	});
};

// todo : organize this code into "role" based pattern
exports.getPlaylistIntro = function( playlistId, callback ){
    services.db.connect('playlists', function(db, collection/*, done*/){
        collection.findOne({
            '_id' : services.db.id( playlistId )
        }, function( err, result ){
		if (result) {
			usersManager.getPublicUsersDetailsMapByIds( [result.userId], function(err, usersById ){
                result.user = usersById[result.userId];
                result.timeStamp = result._id.getTimestamp();
//                result.questionsCount = getQuestionCount(result);
                callback(err, result);
            });
		} else {
			console.log('no result');
		}

           


        });
    });
};



exports.search = exports.find;

var ninSubjects = [];
var ninCreatedBy = [];
var arrayBefore = [];
var arrayAfter = [];
exports.complexSearch = function( queryObj, callback ){
    if ( !!queryObj.filter && !!queryObj.filter.searchText ){

        var text =  new RegExp(queryObj.filter.searchText, 'i');

        if ( !queryObj.filter.$or ){
            queryObj.filter.$or = [];
        }

        queryObj.filter.$or.push({ 'name' : text });
		queryObj.filter.$or.push({ 'description' : text });
    }
	delete queryObj.filter.searchText;

	
	// for admin remove playlists by subject
	if (!queryObj.filter.removeSubject) {
		ninSubjects = [];
	}
	if ( !!queryObj.filter && !!queryObj.filter.removeSubject  && !!queryObj.filter.subject ){
		ninSubjects = _.union([queryObj.filter.subject], ninSubjects);
		queryObj.filter.subject = { $nin :ninSubjects };
		delete queryObj.filter.removeSubject;
		logger.info('the subjects to be removed are:  ', ninSubjects);
	}
	
	// for admin remove playlists by createdBy
	if (!queryObj.filter.removeCreatedBy) {
		ninCreatedBy = [];
		arrayBefore = [];
		arrayAfter = [];
	}
	if ( !!queryObj.filter && !!queryObj.filter.removeCreatedBy  && !!queryObj.filter.userId ){
		arrayAfter = _.union([queryObj.filter.userId.toString()], arrayBefore);
		if (arrayBefore.length < arrayAfter.length) {
			ninCreatedBy.push(queryObj.filter.userId);
			arrayBefore = arrayAfter;
		}
		queryObj.filter.userId = { $nin :ninCreatedBy }; 
		delete queryObj.filter.removeCreatedBy;
		logger.info('the createdBy Id to be removed are: ', ninCreatedBy);
    }

    Playlist.connect( function( db, collection ){
        services.complexSearch.complexSearch( queryObj, { collection : collection }, callback );
    });
};

