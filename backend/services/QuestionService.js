//var logger = require('log4js').getLogger('QuestionService');

function ExactMatchQuestionHandler(question) {

	this.isCorrect = function() {
		var answers = [];
		question.options.forEach(function(value) {
			answers.push(value.label);
		});
		return answers.indexOf(question.userAnswer) > -1;
	};
}
function MultiChoiceQuestionHandler(question) {

	this.isCorrect = function() {
		var answers = [];
		question.options.forEach(function(value) {
			if (value.checked === true) {
				answers.push(value.label);
			}
		});

		if (question.userAnswer.length === undefined) {
			return false;
		}
		if (question.userAnswer.length !== answers.length) {
			return false;
		}
		var result = true;
		question.userAnswer.forEach(function(value) {
			if (answers.indexOf(value) < 0) {
				result = false;
			}
		});
		return result;
	};
}

function FillInTheBlanksQuestionHandler(question) {

	this.isCorrect = function() {
		var answers = [];
		question.answer.forEach(function(value) {
			if (!!value) {
				answers.push(value);
			}
		});
		if (question.userAnswer.length === undefined) {
			return false;
		}

		var result = true;
		answers.forEach(function(value) {
			if (answers.indexOf(value) !== question.userAnswer.indexOf(value)) {
				result = false;
			}
		});
		return result;
	};
}
function TrueFalseQuestionHandler(question) {

	this.isCorrect = function() {
		return question.userAnswer === question.answer;
	};
}
function OpenQuestionHandler(/* question */) {
	this.isCorrect = function() {
		return true;
	};

}
exports.getHandler = function(question) {
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