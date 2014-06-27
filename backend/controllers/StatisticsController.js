'use strict';
var managers = require('../managers');

// use 'count' instead. currently all questions are in the memory http://stackoverflow.com/a/9337774/1068746
exports.getStatistics = function(req, res) {
	var stats = {};
	managers.questions.getQuestions({}, function(err, result) {
		stats.questionsCount = result.length;
		managers.lessons.getLessons({}, function(err, result) {
			stats.lessonsCount = result.length;
			res.send(stats);
		});
	});
};