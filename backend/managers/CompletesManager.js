'use strict';
/**
 * @module CompletesManager
 * @type {Logger}
 */
// todo user "managers" instead..
// since this is a manager, we cannot simply require('./index');
// we need to use setTimeout( function(){ managers = require('./index'); },0);
// hopefully this will cause the event loop to execute after index.js is initialized.

var logger = require('log4js').getLogger('CompletesManager');
var services = require('../services');
var errorManager = require('./ErrorManager');
var usersManager = require('./UsersManager');
var _ = require('lodash');
var Complete = require('../models/Complete');


exports.createComplete = function(complete, callback) {
	logger.info('Creating complete');
	complete.createdAt = new Date().toISOString();
    if ( !complete.age) {
        complete.age = 8;
    }
	services.db.connect('completes', function(db, collection) {
		collection.insertOne(complete, function(err) {
			if (!!err) {
				logger.error('error creating complete [%s] : [%s]', complete.name, err);
				callback(new errorManager.InternalServerError());
				return;
			} else {
				logger.info('Complete [%s] created successfully. invoking callback', complete.name);
				callback(null, complete);
				return;
			}
		});
	});
};


/**
 *
 *
 *
 * This function copies a complete while picking very specific fields from it.
 *
 *
 * @param user - the user making the copy
 * @param complete
 * @param callback
 */

exports.copyComplete = function (user, complete, callback) {

    // if I copy from a copy of the original, I am also a copy of the original.. ==> transitive
    // copy of is transitive property of a complete;
    var copyOf = [];


    // LERGO-412 - we decided we want to remember even if same user.
    // LERGO-569 - we decided we DO NOT want to remember if the same user..
    if ( !services.db.id(user._id).equals( services.db.id( complete.userId ) ) ){
        copyOf = copyOf.concat(complete._id);
    }

    // copy of is a transitive property.
    if ( !!complete.copyOf ){
        copyOf = copyOf.concat(complete.copyOf);
    }

    complete = _.pick(complete, ['age','description','name','steps','language','subject','tags']);

    var copyOfName = 'Copy of: ';

    if (complete.language === 'hebrew') {
        copyOfName = 'העתק של: ';
    } else if (complete.language === 'arabic') {
        copyOfName = 'نسخة من: ';
    } else {
        copyOfName = 'Copy of: ';
    }

    complete.name = copyOfName  + complete.name;

    if ( copyOf.length > 0 ){
        complete.copyOf = copyOf;
    }

    complete.createdAt = new Date().toISOString();
    complete.lastUpdate = new Date().getTime();
    complete.userId = services.db.id(user._id);

    services.db.connect('completes', function (db, collection) {
        collection.insertOne(complete, function (err) {
            if (!!err) {
                logger.error('error copying complete [%s]', complete.name, err);
                callback(new errorManager.InternalServerError());
                return;
            } else {
                logger.info('Complete [%s] copied successfully', complete.name);
                callback(null, complete);
                return;
            }
        });
    });
};

exports.updateComplete = function(complete, callback) {
	logger.info('Updating complete');
	services.db.connect('completes', function(db, collection, done) {
		collection.updateOne({
			'_id' : complete._id
		}, {$set: complete}, function(err) {
			if (!!err) {
				logger.error('error in updating complete [%s] : [%s]', complete.name, err);
				callback(new errorManager.InternalServerError());
				done();
				return;
			} else {
				// logger.info('Complete [%s] updated successfully. invoking callback', complete.name);
				callback(null, complete);
				done();
				return;
			}
		});
	});
};

exports.unsetPublic = function(complete, callback) {
	logger.info('unsetting public');
	services.db.connect('completes', function(db, collection, done) {
		collection.updateOne({
			'_id' : complete._id
		}, { $unset : { public : 1} }, function(err) {
			if (!!err) {
				logger.error('error in updating complete [%s] : [%s]', complete.name, err);
				callback(new errorManager.InternalServerError());
				done();
				return;
			} else {
				logger.info('Complete [%s] updated successfully. invoking callback', complete.name);
				callback(null, complete);
				done();
				return;
			}
		});
	});
};

exports.deleteComplete = function(id, callback) {
	logger.info('Deleting complete : ' + id);
	services.db.connect('completes', function(db, collection) {
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

exports.incrementViews = function(completeId, callback) {
	services.db.connect('completes', function(db, collection, done) {
		collection.updateOne({
			'_id' : services.db.id(completeId)
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

exports.getComplete = function (filter, callback) {
    logger.info('Fetching complete by ID', JSON.stringify(filter));
    services.db.connect('completes', function (db, collection/*, done*/) {
        collection.findOne(filter, function (err, item) {
                if (!!err) {
                    logger.error('unable to query for complete [%s]', err.message);
                    callback(null, item);
                } else {
                    item.timeStamp = item._id.getTimestamp();
                    callback(err, item);
                }
            }
        );
    });
};

exports.getUserCompletes = function(userId, callback) {
	logger.info('Getting completes');
	services.db.connect('completes', function(db, collection, done) {
		collection.find({
			'userId' : userId
		}).toArray(function(err, result) {
			if (!!err) {
				logger.error('unable to query for completes [%s]', err.message);
			}
			done();
			callback(err, result);
		});
	});
};

exports.find = function(filter, projection, callback) {
	logger.info('finding completes');
	services.db.connect('completes', function(db, collection, done) {
		collection.find(filter, projection).toArray(function(err, result) {
			if (!!err) {
				logger.error('unable to find completes [%s]', err.message);
			}
			done();
			callback(err, result);
		});
	});
};

exports.getPublicCompletes = function(callback) {
	var result = [];
	var usersId = [];
	services.db.connect('completes', function(db, collection, done) {
		collection.find({
			'public' : {
				'$exists' : true
			}
		}, {}).each(function(err, obj) {
			logger.debug('handling complete');
			if (obj === null) { // means we found all completes
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
exports.getCompleteIntro = function( completeId, callback ){
    services.db.connect('completes', function(db, collection/*, done*/){
        collection.findOne({
            '_id' : services.db.id( completeId )
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

	
	// for admin remove completes by subject
	if (!queryObj.filter.removeSubject) {
		ninSubjects = [];
	}
	if ( !!queryObj.filter && !!queryObj.filter.removeSubject  && !!queryObj.filter.subject ){
		ninSubjects = _.union([queryObj.filter.subject], ninSubjects);
		queryObj.filter.subject = { $nin :ninSubjects };
		delete queryObj.filter.removeSubject;
		logger.info('the subjects to be removed are:  ', ninSubjects);
	}
	
	// for admin remove completes by createdBy
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

    Complete.connect( function( db, collection ){
        services.complexSearch.complexSearch( queryObj, { collection : collection }, callback );
    });
};

