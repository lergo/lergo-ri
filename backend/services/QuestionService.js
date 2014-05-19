//var logger = require('log4js').getLogger('QuestionService');


function TrueFalseQuestionHandler( question ){

    this.isCorrect = function(){
        return question.userAnswer === question.answer;
    };
}


exports.getHandler = function(question){
    return new TrueFalseQuestionHandler(question);
};