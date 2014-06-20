'use strict';
var managers = require('../managers');

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