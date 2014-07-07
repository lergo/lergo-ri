var logger = require('log4js').getLogger('Lesson');
var AbstractModel = require('./AbstractModel');
var db = require('../services/DbService');

Lesson.collectionName = 'lessons';

function Lesson( data ){
    this.data = data;
}


Lesson.prototype.getAllQuestionIds = function(){
    logger.info('getting all questions Ids');
    var steps = this.data.steps;
    var questionIds = [];
    for ( var i = 0; i < steps.length; i++){
        logger.info('checking ', steps[i].type);
        if ( steps[i].type === 'quiz'){
            logger.info('adding the following quiz items', steps[i].quizItems);
            questionIds = questionIds.concat(steps[i].quizItems);
        }
    }
    logger.info('found the following question ids', questionIds);
    return questionIds;
};


AbstractModel.enhance(Lesson);

module.exports = Lesson;


