'use strict';
/**
 * @module LessonsManager
 * @type {Logger}
 */
// todo user "managers" instead..
// since this is a manager, we cannot simply require('./index');
// we need to use setTimeout( function(){ managers = require('./index'); },0);
// hopefully this will cause the event loop to execute after index.js is initialized.

var logger = require('log4js').getLogger('LessonsManager');
var services = require('../services');
var errorManager = require('./ErrorManager');
var usersManager = require('./UsersManager');
var _ = require('lodash');
var Lesson = require('../models/Lesson');


exports.createLesson = function(lesson, callback) {
	logger.info('Creating lesson');
	lesson.createdAt = new Date().toISOString();
    if ( !lesson.age) {
        lesson.age = 8;
    }
	services.db.connect('lessons', function(db, collection) {
		collection.insert(lesson, function(err) {
			if (!!err) {
				logger.error('error creating lesson [%s] : [%s]', lesson.name, err);
				callback(new errorManager.InternalServerError());
				return;
			} else {
				logger.info('Lesson [%s] created successfully. invoking callback', lesson.name);
				callback(null, lesson);
				return;
			}
		});
	});
};


/**
 *
 *
 *
 * This function copies a lesson while picking very specific fields from it.
 *
 *
 * @param user - the user making the copy
 * @param lesson
 * @param callback
 */

exports.copyLesson = function (user, lesson, callback) {

    // if I copy from a copy of the original, I am also a copy of the original.. ==> transitive
    // copy of is transitive property of a lesson;
    var copyOf = [];


    // LERGO-412 - we decided we want to remember even if same user.
    // LERGO-569 - we decided we DO NOT want to remember if the same user..
    if ( !services.db.id(user._id).equals( services.db.id( lesson.userId ) ) ){
        copyOf = copyOf.concat(lesson._id);
    }

    // copy of is a transitive property.
    if ( !!lesson.copyOf ){
        copyOf = copyOf.concat(lesson.copyOf);
    }

    lesson = _.pick(lesson, ['age','description','name','steps','language','subject','tags']);

    var copyOfName = 'Copy of: ';

    if (lesson.language === 'hebrew') {
        copyOfName = 'העתק של: ';
    } else if (lesson.language === 'arabic') {
        copyOfName = 'نسخة من: ';
    } else {
        copyOfName = 'Copy of: ';
    }

    lesson.name = copyOfName  + lesson.name;

    if ( copyOf.length > 0 ){
        lesson.copyOf = copyOf;
    }

    lesson.createdAt = new Date().toISOString();
    lesson.lastUpdate = new Date().getTime();
    lesson.userId = services.db.id(user._id);

    services.db.connect('lessons', function (db, collection) {
        collection.insert(lesson, function (err) {
            if (!!err) {
                logger.error('error copying lesson [%s]', lesson.name, err);
                callback(new errorManager.InternalServerError());
                return;
            } else {
                logger.info('Lesson [%s] copied successfully', lesson.name);
                callback(null, lesson);
                return;
            }
        });
    });
};

exports.updateLesson = function(lesson, callback) {
	logger.info('Updating lesson');
	services.db.connect('lessons', function(db, collection, done) {
		collection.updateOne({
			'_id' : lesson._id
		}, {$set: lesson}, function(err) {
			if (!!err) {
				logger.error('error in updating lesson [%s] : [%s]', lesson.name, err);
				callback(new errorManager.InternalServerError());
				done();
				return;
			} else {
				logger.info('Lesson [%s] updated successfully. invoking callback', lesson.name);
				callback(null, lesson);
				done();
				return;
			}
		});
	});
};

exports.deleteLesson = function(id, callback) {
	logger.info('Deleting lesson : ' + id);
	services.db.connect('lessons', function(db, collection) {
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

exports.incrementViews = function(lessonId, callback) {
	services.db.connect('lessons', function(db, collection, done) {
		collection.updateOne({
			'_id' : services.db.id(lessonId)
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

exports.getLesson = function (filter, callback) {
    logger.info('Fetching lesson by ID', JSON.stringify(filter));
    services.db.connect('lessons', function (db, collection/*, done*/) {
        collection.findOne(filter, function (err, item) {
                if (!!err) {
                    logger.error('unable to query for lesson [%s]', err.message);
                    callback(null, item);
                } else {
                    item.timeStamp = item._id.getTimestamp();
                    callback(err, item);
                }
            }
        );
    });
};

exports.getUserLessons = function(userId, callback) {
	logger.info('Getting lessons');
	services.db.connect('lessons', function(db, collection, done) {
		collection.find({
			'userId' : userId
		}).toArray(function(err, result) {
			if (!!err) {
				logger.error('unable to query for lessons [%s]', err.message);
			}
			done();
			callback(err, result);
		});
	});
};

exports.find = function(filter, projection, callback) {
	logger.info('finding lessons');
	services.db.connect('lessons', function(db, collection, done) {
		collection.find(filter, projection).toArray(function(err, result) {
			if (!!err) {
				logger.error('unable to find lessons [%s]', err.message);
			}
			done();
			callback(err, result);
		});
	});
};

exports.getPublicLessons = function(callback) {
	var result = [];
	var usersId = [];
	services.db.connect('lessons', function(db, collection, done) {
		collection.find({
			'public' : {
				'$exists' : true
			}
		}, {}).each(function(err, obj) {
			logger.debug('handling lesson');
			if (obj === null) { // means we found all lessons
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
exports.getLessonIntro = function( lessonId, callback ){
    services.db.connect('lessons', function(db, collection/*, done*/){
        collection.findOne({
            '_id' : services.db.id( lessonId )
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


    Lesson.connect( function( db, collection ){
        services.complexSearch.complexSearch( queryObj, { collection : collection }, callback );
    });
};



