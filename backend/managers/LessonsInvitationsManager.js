'use strict';
var services = require('../services');
var lessonsManager = require('./LessonsManager');
var errorManager = require('./ErrorManager');
var questionsManager = require('./QuestionsManager');
var logger = require('log4js').getLogger('LessonsInvitationsManager');
var models = require('../models');
var async = require('async');

/**
 * Once someone opens an invitation, our first step is to build the lesson
 *
 * @param invitation
 * @param callback
 */
exports.buildLesson = function (invitation, callback) {
    var lessonId = invitation.lessonId;
    var updatedInvitation = null;
    async.waterfall([
        function getLessonById(_callback) {
            lessonsManager.getLessonIntro(lessonId, _callback);
        }, function getAllQuizItems(result, _callback) {
            invitation.lesson = result;
            var lessonModel = new models.Lesson(result);
            var questionsId = lessonModel.getAllQuestionIds();
            questionsId = services.db.id(questionsId);
            questionsManager.search({ '_id': { '$in': questionsId }}, {}, _callback);
        }, function updateLessonInvitation(result, _callback) {
            invitation.quizItems = result;
            updatedInvitation = invitation;
            exports.updateLessonInvitation(invitation, _callback);


        }, function addCounterOnLesson( result, _callback) {
            lessonsManager.incrementViews(lessonId, function( err ){
                /* guy - I don't know why simply passing _callback does not work. have to write a function to do that */
                if ( !!err ){
                    logger.error('error incrementing views on lesson', err);
                }
                logger.info('after increment');
                _callback();
            });
        }, function invokeCallback() {
            logger.info('done building lesson. sending back to callback');
            callback(null, updatedInvitation);
        }


    ]);
};



exports.search = function (filter, projection, callback) {
    logger.info('finding the invitation', filter);
    models.LessonInvitation.connect(function (db, collection, done) {
        collection.findOne(filter, projection, function (err, result) {

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


exports.updateLessonInvitation = function (invitation, callback) {
    models.LessonInvitation.connect( function (db, collection, done) {
        collection.update({ _id: invitation._id }, invitation, function (err, result) {
            logger.info('after update', arguments);
            done();
            callback(err, result);
            return;
        });
    });
};


exports.create = function ( invitation, callback) {
    invitation.lessonId = services.db.id(invitation.lessonId);
    models.LessonInvitation.connect( function (db, collection, done) {
        collection.insert(invitation, {}, function (err, result) {
            done();
            callback( err, result[0] );
            return;
        });

    });
};


exports.deleteByLessonId = function( lessonId, callback ){
    models.LessonInvitation.connect(function(db, collection){
        collection.remove({'lessonId' : services.db.id(lessonId)}, callback );
    });
};

