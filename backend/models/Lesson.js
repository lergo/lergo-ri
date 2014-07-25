var logger = require('log4js').getLogger('Lesson');
var AbstractModel = require('./AbstractModel');

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


