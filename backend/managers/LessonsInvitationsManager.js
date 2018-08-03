'use strict';

/**
 * @module LessonsInvitationsManager
 * @type {exports}
 */

var services = require('../services');
var lessonsManager = require('./LessonsManager');
var errorManager = require('./ErrorManager');
var questionsManager = require('./QuestionsManager');
var logger = require('log4js').getLogger('LessonsInvitationsManager');
var models = require('../models');
var async = require('async');


/**
 *
 * @param {object} invitation
 * @param {ObjectId|string} invitation.lessonId
 * @param callback
 */
exports.dryBuildLesson = function(invitation, callback){

    async.waterfall([ function getLessonById(_callback) {
        lessonsManager.getLessonIntro(invitation.lessonId, _callback);
    }, function getAllQuizItems(result, _callback) {
        invitation.lesson = result;
        var lessonModel = new models.Lesson(result);
        var questionsId = lessonModel.getAllQuestionIds();
        questionsId = services.db.id(questionsId);
        questionsManager.search({
            '_id' : {
                '$in' : questionsId
            }
        }, {}, _callback);
    }, function updateLessonInvitation(result, _callback) {
            invitation.quizItems = result;
            _callback();


        }
    ], function invokeCallback(err) {
            logger.info('done building lesson. sending back to callback');
            callback(err, invitation);
        }
    );
};

/**
 * Once someone opens an invitation, our first step is to build the lesson
 *
 * @param invitation
 * @param callback
 */
exports.buildLesson = function(invitation, callback) {
	exports.dryBuildLesson(invitation, function(err, invitation){
        var lessonId = null;
        var updatedInvitation=invitation;
        async.waterfall([
            // function updateInvitation(_callback){
            //     lessonId = invitation.lessonId;
            //     exports.updateLessonInvitation(invitation, function(err, result){
            //         if ( result ){
            //             logger.debug('result from updating lesson invitation', result);
            //         }
            //         updatedInvitation = invitation;
            //         _callback(err); //
            //     });
            // },
            function addCounterOnLesson(_callback){
                lessonsManager.incrementViews(lessonId, function(err) {
                    /*
                     * guy - I don't know why simply passing _callback does not work.
                     * have to write a function to do that
                     */
                    if (!!err) {
                        logger.error('error incrementing views on lesson', err);
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
	models.LessonInvitation.connect(function(db, collection, done) {
		collection.findOne(filter, projection, function(err, result) {

			if (!!err) {
				done();
				callback(new errorManager.InternalServerError(err, 'error while getting lesson invitation'));
				return;
			}
			done();
			callback(null, result);
			return;

		});
	});
};

exports.find = exports.search;

exports.updateLessonInvitation = function(invitation, callback) {
	models.LessonInvitation.connect(function(db, collection) {
		collection.update({
			_id : invitation._id
		}, invitation, function(err, result) {
			logger.info('after update', arguments);
			callback(err, result);
			return;
		});
	});
};

exports.create = function(invitation, callback) {
	invitation.lessonId = services.db.id(invitation.lessonId);
	models.LessonInvitation.connect(function(db, collection) {
		collection.insertOne(invitation, {}, function(err, result) {
			callback(err, result.ops[0]);
			return;
		});

	});
};

exports.deleteByLessonId = function(lessonId, callback) {
	models.LessonInvitation.connect(function(db, collection) {
		collection.remove({
			'lessonId' : services.db.id(lessonId)
		}, callback);
	});
};

exports.deleteById = function(id, callback) {
	models.LessonInvitation.connect(function(db, collection) {
		collection.remove({
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
 * returns lesson invitation according to query object. without quizItems.

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
	models.LessonInvitation.connect(function(db, collection) {
		services.complexSearch.complexSearch(queryObj, {
			collection : collection
		}, callback);
	});
};
