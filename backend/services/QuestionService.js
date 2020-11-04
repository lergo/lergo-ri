'use strict';
var logger = require('log4js').getLogger('QuestionService');
var _ = require('lodash');

function ExactMatchQuestionHandler(question) {

    this.isCorrect = function () {
        var result = {
            correct   : false,
            expMessage: []
        };
        // jeff - two loops are needed, one to see if we have the correct answer and if not, 
        // jeff - the second to check if there is an explanation for the incorrect answer
        for (var i = 0; i < question.options.length; i++) {
            var answerOption = question.options[i];
            if ( answerOption.checked &&  answerOption.label  === question.userAnswer) { 
                if ( answerOption.checked) {
                    result.correct = true;
                    if (!!question.explanation) {
                        result.expMessage.push(question.explanation);
                    }
                    return result;
                } 
            }
        }
        result.correct = false;
        for (var j = 0; j < question.options.length; j++) {
            var option = question.options[j];
            if (option.label  === question.userAnswer) { 
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
                if ( !!answerMap[ans].textExplanation ) { // lergo-600
                    result.expMessage.push(answerMap[ans].textExplanation);
                }
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

/**
 * @typedef {object} FitbQuestionOption
 * @description Fill In The Blank Question Option
 * @property {boolean} checked
 * @property {label} the answer
 * @property {string} textExplanation a possible explanation to this option
 */

/**
 * @typedef {object} Question
 * @description a question
 */

/**
 * @typedef {string} FitbAnswer
 * @description a string with possible ';' separator to indicate multiple options
 */

/**
 * @typedef {Question} FitbQuestion
 * @description Fill In The Blank Question. Inherits Question.
 * @property {Array<FitbAnswer>} answer answers for the fill in the blank
 * @property {string} explanation a text explanation for why the answer is correct
 * @property {Array<string>} [userAnswer=null] the user's answers
 */

/**
 *
 * @description
 * defines the Fitb Question Handler
 *
 * @param {Question} question - the question in hand
 * @constructor
 */

function FillInTheBlanksQuestionHandler(question) {
    /**
     * @description
     * decides if user answe
     * @returns {{correct: boolean, expMessage: Array<string>}}
     */
    this.isCorrect = function () {
        var answers = _.compact(question.answer);

        var result = {
            correct   : true,
            expMessage: []
        };

        /**
         *
         * iterates through the collection of possible wrong answers and returns the one matching the given answer
         *
         * @param answer the answer we have
         * @returns {FitbQuestionOption|null} the matching incorrect option otherwise null
         */
        function getOptionByAnswer( answer ) {
            try {
                // find an option that has the given answer
                return _.find(question.options, function(op){ return op.label === answer; });
            }catch(e){
                logger.error('error retrieving option by answer',e);
                return null;
            }
        }

        if (question.userAnswer.length === undefined) { // handle corrupted user answer
            result.correct = false;
            if (!!question.explanation) {
                result.expMessage.push(question.explanation);
            }
            return result;
        }

        for (var i = 0; i < answers.length; i++) {
            var values = answers[i].split(';'); // support multiple correct answers by adding ';' character between them.
            var userAnswer = question.userAnswer[i];
            if (values.indexOf(userAnswer) === -1) {
                result.correct = false;
                //push specific explanation only for first blank, if the wrong option has a defined text explanation
                var wrongOption = getOptionByAnswer( userAnswer );
                if (i === 0 && !!wrongOption && !!wrongOption.textExplanation ) {
                    result.expMessage.push(wrongOption.textExplanation);
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