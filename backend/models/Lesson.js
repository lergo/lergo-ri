'use strict';
var logger = require('log4js').getLogger('Lesson');
var AbstractModel = require('./AbstractModel');
var _ = require('lodash');
var dbService = require('../services/DbService');
var async = require('async');

/**
 *  @typedef {object} Lesson
 *  @property {number} age
 *  @property {number} public
 *  @property {string} subject
 *  @property {string} language - the language name
 */

function Lesson(data) {
    this.data = data;
}

Lesson.collectionName = 'lessons';




/**
 *
 * @returns {Array}
 */

Lesson.prototype.getAllQuestionIds = function () {
    logger.info('getting all questions Ids');
    var steps = this.data.steps || [];
    var questionIds = [];
    for (var i = 0; i < steps.length; i++) {
        logger.info('checking ', steps[i].type);
        if (steps[i].type === 'quiz') {
            logger.info('adding the following quiz items', steps[i].quizItems);
            questionIds = questionIds.concat(steps[i].quizItems);
        }
    }
    logger.info('found the following question ids', questionIds);
    return questionIds;
};

/**
 *
 * takes 2 question ids and replaces one with another.
 *
 * @param oldQuestionId
 * @param newQuestionId
 */

Lesson.prototype.replaceQuestionInLesson = function (oldQuestionId, newQuestionId) {
//    logger.info('replacing question');
    // for every step of type quiz
    var quizSteps = _.filter(this.data.steps, {'type': 'quiz'});
    _.each(quizSteps, function (quiz) {
        // replace quizItems property with a mapped result that replaces oldQuestionId with newQuestionId
        quiz.quizItems = _.map(quiz.quizItems, function (qi) {
            if (qi === oldQuestionId) {
                logger.info('found matching quiz item. replacing');
                return newQuestionId;
            }else{
                return qi;
            }
        });
    });
};

/**
 * Flattens all quizItems on all lessons,
 * and groups all quizItems values into a single set.
 * http://stackoverflow.com/a/13281819/1068746
 *
 * @param lessonsIds
 * @param callback
 */
Lesson.getAllQuestionsIdsForLessons = function( lessonsIds, callback ){
    Lesson.connect( function (db, collection) {
        var aggregation = [
            {$match: { 'steps.type' : 'quiz', '_id' : {'$in' : lessonsIds} }},
            { $project: { _id : 0, 'steps.quizItems':1} },
            {$unwind : '$steps'},
            {$unwind : '$steps.quizItems'},
            {'$group' :{_id : 'a', res:{$addToSet:'$steps.quizItems'}}}
        ];
        collection.aggregate( aggregation ,
        function(err, result){
            callback(err, result.length > 0 ? result[0].res : undefined);
        });
    });
};

Lesson.findByQuizItems = function( question, callback){
    Lesson.find({ 'steps.quizItems' : question._id.toString() }, {}, function(err, result) {
        if (!!err) {
            logger.error('unable to find usage of questions [%s]', err.message);
        }
        callback(err, result);
    });
};

Lesson.existsPublicByQuizItems = function(question, callback){
    Lesson.find({'steps.quizItems': question._id.toString(), 'public' : { $exists : true }}, {_id:1}, function(err, result){
        if ( !!err ){
            logger.error('unable to decide if question is used by public lesson [%s]', err.message);
        }
        callback(err, !!result);
    });
};


/**
 *
 * a wrong and very naive implementation. count number of questions in user's public lesson.
 *
 * the actual purpose is to count all public questions by user.
 * so this function will only work if user used only his/her own questions..
 *
 * Flattens all quizItems on all lessons,
 * and groups all quizItems values into a single set.
 * http://stackoverflow.com/a/13281819/1068746
 *
 * @param userId
 * @param callback
 */
Lesson.countPublicQuestionsByUser = function( userId, callback ){
    async.waterfall([
        function getQuestionIdsFromPublicLessons( done ){
            Lesson.connect( function (db, collection) {
                var aggregation = [
                    {$match: { 'steps.type' : 'quiz' , public : { $exists: true }  }},
                    { $project: { _id : 0, 'steps.quizItems':1} },
                    {$unwind : '$steps'},
                    {$unwind : '$steps.quizItems'},
                    {'$group': { _id: '$steps.quizItems' } },
                    { '$group': { _id : 'a', items: { $push :  '$_id' } } }


                ];
                collection.aggregate( aggregation , done );

            });
        },
        function countQuestionsByUser( idsResult , done ){

            if ( !idsResult || idsResult.length === 0){
                done(null,0);
                return;
            }
            try{
                var ids = idsResult[0].items;
                ids =  dbService.id(ids);
                logger.info('ids is', ids );
                require('./Question').count({ _id : { $in : ids }, userId : dbService.id(userId), question : { $exists : true } }, done);
            }catch(e){
                done(e);
            }
        }
    ], callback );

};


Lesson.countPublicLessonsForUser = function(userId, callback ){
    Lesson.count({
        userId  : dbService.id(userId),
        'public': {
            '$exists': true
        }
    }, callback );
};

AbstractModel.enhance(Lesson);

module.exports = Lesson;


