'use strict';

function calculateCorrectPercentage(report) {
    var correct = 0;
    var wrong = 0;
    report.correctPercentage = 0;
    var numberOfQuestions = 0;
    report.data.lesson.steps.forEach( function (step) {
        if (step.type === 'quiz' && !!step.quizItems) {
            numberOfQuestions = numberOfQuestions + step.quizItems.length;
        }
    });
    if (!!report.data.quizItems && numberOfQuestions > 0) {
        report.answers.forEach( function (answer) {
            if (answer.checkAnswer.correct === true) {
                correct++;
            } else {
                wrong++;
            }
        });

        report.correctPercentage = Math.round((correct * 100) / numberOfQuestions);
    }
}


db.reports.find({'correctPercentage' : { '$exists' : 0}, 'data.lesson.steps' : { '$exists' : 1 } }).forEach( function(report){

    try{
        calculateCorrectPercentage(report);
        db.reports.update(
            { '_id' : report._id },
            { '$set' : { 'correctPercentage' : report.correctPercentage } }
        );
    }catch(e){
        print('error : unable to calculate correct percentage',e);
    }
});