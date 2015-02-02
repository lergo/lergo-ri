'use strict';
//var logger = require('log4js').getLogger('QuestionService');

function ExactMatchQuestionHandler(question) {

    this.isCorrect = function () {
        var result = {
            correct   : false,
            expMessage: []
        };
        for (var i = 0; i < question.options.length; i++) {
            var option = question.options[i];
            if (option.label === question.userAnswer) {
                if (option.checked) {
                    result.correct = true;
                    if (!!question.explanation) {
                        result.expMessage.push(question.explanation);
                    }
                    return result;
                } else {
                    result.correct = false;
                    if (!!option.textExplanation) {
                        result.expMessage.push(option.textExplanation);
                    }
                    else if (!!question.explanation) {
                        result.expMessage.push(question.explanation);
                    }
                    return result;
                }
            }
        }
        if (!!question.explanation) {
            result.expMessage.push(question.explanation);
        }
        return result;
    };
}
function MultiChoiceQuestionHandler(question) {

    this.isCorrect = function () {
        var answers = [];
        var answerMap = {};
        question.options.forEach(function (value) {
            if (value.checked === true) {
                answers.push(value.label);
            }
            answerMap[value.label] = value;
        });
        var result = {
            correct   : true,
            expMessage: []
        };
        for (var i = 0; i < question.userAnswer.length; i++) {
            var ans = question.userAnswer[i];
            if (answers.indexOf(ans) < 0) {
                result.correct = false;
                result.expMessage.push(answerMap[ans].textExplanation);
            }
        }
        if (question.userAnswer.length === undefined) {
            result.correct = false;
        }
        if (question.userAnswer.length !== answers.length) {
            result.correct = false;
        }
        if (result.expMessage.length === 0 && !!question.explanation) {
            result.expMessage.push(question.explanation);
        }

        return result;
    };
}

function FillInTheBlanksQuestionHandler(question) {
    this.isCorrect = function () {
        var answers = [];
        var result = {
            correct   : true,
            expMessage: []
        };
        question.answer.forEach(function (value) {
            if (!!value) {
                answers.push(value);
            }
        });

        var possibleWrongAnswer = {};
        question.options.forEach(function (value) {
            if (!value.checked) {
                possibleWrongAnswer[value.label] = value.textExplanation;
            }
        });

        if (question.userAnswer.length === undefined) {
            result.correct = false;
            if (!!question.explanation) {
                result.expMessage.push(question.explanation);
            }
            return result;
        }

        for (var i = 0; i < answers.length; i++) {
            var values = answers[i].split(';');
            if (values.indexOf(question.userAnswer[i]) === -1) {
                result.correct = false;
                //push specific explanation only for first blank
                if (i === 0 && !!possibleWrongAnswer[question.userAnswer[i]]) {
                    result.expMessage.push(possibleWrongAnswer[question.userAnswer[i]]);
                }
            }
        }

        if (result.expMessage.length === 0 && !!question.explanation) {
            result.expMessage.push(question.explanation);
        }
        return result;
    };
}
function TrueFalseQuestionHandler(question) {

    this.isCorrect = function () {
        var result = {
            correct   : false,
            expMessage: []
        };
        result.correct = question.userAnswer === question.answer;

        if (!!question.explanation) {
            result.expMessage.push(question.explanation);
        }
        return result;
    };
}
function OpenQuestionHandler(/* question */) {
    this.isCorrect = function () {
        var result = {
            correct   : true,
            expMessage: []
        };
        return result;
    };

}
exports.getHandler = function (question) {
    if (question.type === 'exactMatch') {
        return new ExactMatchQuestionHandler(question);
    }
    if (question.type === 'multipleChoices') {
        return new MultiChoiceQuestionHandler(question);
    }
    if (question.type === 'openQuestion') {
        return new OpenQuestionHandler(question);
    }
    if (question.type === 'fillInTheBlanks') {
        return new FillInTheBlanksQuestionHandler(question);
    }
    return new TrueFalseQuestionHandler(question);

};