//var logger = require('log4js').getLogger('QuestionService');

function ExactMatchQuestionHandler(question) {

	this.isCorrect = function() {
		return question.answer.indexOf(question.userAnswer) > -1;
	};
}
function MultiChoiceQuestionHandler(question) {

	this.isCorrect = function() {
		if (question.userAnswer.length === undefined) {
			return false;
		}
		if (question.userAnswer.length !== question.answer.length) {
			return false;
		}
		var result = true;
		question.userAnswer.forEach(function(value) {
			if (question.answer.indexOf(value) < 0) {
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
function OpenQuestionHandler(question) {
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
	return new TrueFalseQuestionHandler(question);

};