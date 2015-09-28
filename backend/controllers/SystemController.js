'use strict';
var models = require('../models');
var async = require('async');
var services = require('../services');
var logger = require('log4js').getLogger('StatisticsController');
var _ = require('lodash');

// use 'count' instead. currently all questions are in the memory
// http://stackoverflow.com/a/9337774/1068746
exports.getStatistics = function(req, res) {
	var stats = {};

	function countMyItems(model, property) {
		return function(callback) {
			if (!!req.sessionUser) {
				model.count({
					'userId' : req.sessionUser._id
				}, function(err, result) {
					stats[property] = result;
					callback();
				});
			} else {
				callback();
			}
		};
	}

	async.parallel([ function countQuestions(callback) {
		models.Question.count({}, function(err, result) {
			stats.questionsCount = result;
			callback();
		});
	}, function countLessons(callback) {
		models.Lesson.count({}, function(err, result) {
			stats.lessonsCount = result;
			callback();
		});
	}, function countPublicLessons(callback) {
		models.Lesson.count({
			'public' : {
				'$exists' : true
			}
		}, function(err, result) {
			stats.publicLessonsCount = result;
			callback();
		});

	}, function countAbuseReports(callback) {
		models.AbuseReport.count({}, function(err, result) {
			stats.abuseReportsCount = result;
			callback();
		});

	},
	// counts the reports I am the inviter of
	function countInvitedReports(callback) {
		if (!!req.sessionUser) {
			models.Report.count({
				'data.inviter' : req.sessionUser._id.toString()
			}, function(err, result) {
				stats.myInvitedReports = result;
				callback();
			});
		} else {
			callback();
		}
	}, function countPrivateLessons(callback) {
		models.Lesson.count({
			'public' : {
				'$exists' : false
			}
		}, function(err, result) {
			stats.privateLessonsCount = result;
			callback();
		});
	}, function countMyInvites(callback) {
		if (!!req.sessionUser) {
			models.LessonInvitation.count({
				'inviter' : req.sessionUser._id
			}, function(err, result) {
				stats.myInvites = result;
				callback();
			});
		} else {
			callback();
		}
	}, countMyItems(models.Lesson, 'myLessons'), countMyItems(models.Report, 'myReports'), countMyItems(models.Question, 'myQuestions') ], function(err) {
		if (!!err) {
			res.status(500).send('unable to count', err);
			return;
		}
		res.send(stats);
	});
};

// guy - does not belong here.. need to move this to "PublicController"

exports.getTranslation = function(req, res) {

	var locale = req.query.lang || req.params.locale;

	if (services.conf.translations.method === 'files') {
		res.redirect(req.absoluteUrl('/translations/' + locale + '.json'));
	} else { // method == phraseapp (the default)
		// todo: don't use service phraseapp, use "TranslationManager" instead.
		services.phraseApp.getTranslation(locale, function(data , response ) {
			logger.debug('got translations', JSON.stringify(response.headers));
            try{
                res.set('Cache-Control', 'public, max-age=300');
                res.set('Expires', new Date(Date.now() + 300000).toUTCString());
                res.send(data);
            }catch(e){
                logger.error('unable to fetch translations',e);
                res.send(data);
            }

		});
	}
};

exports.getErrorDefinitions = function( req, res ){
	res.send(_.map(services.error, function(value,key){
		return _.merge({
			key: key
		}, JSON.parse( JSON.stringify( new value() )));
	}));
};