'use strict';
var logger = require('log4js').getLogger('Lesson');
var AbstractModel = require('./AbstractModel');
var _ = require('lodash');

function Lesson(data) {
    this.data = data;
}

Lesson.collectionName = 'lessons';

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


AbstractModel.enhance(Lesson);

module.exports = Lesson;


