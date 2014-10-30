'use strict';

var AbuseReport = require('../models/AbuseReport');
var logger = require('log4js').getLogger('AbuseReportsMiddleware');
var async = require('async');
var lessonsMiddleware = require('./LessonsMiddleware');
var questionsMiddleware = require('./QuestionsMiddleware');

exports.itemExists = function itemExists(req, res, next) {
	logger.debug('finding itemId for abuse on request');
	var itemType = req.body.itemType;
	var itemId = req.params.itemId;
	if (!itemType) {
		logger.info('itemType is missing, failing..');
		res.status(400).send('must specify item details to abuse');
		return;
	}

	async.parallel([ function findLesson() {
		if (itemType === AbuseReport.ItemTypes.LESSON) {
			req.abuseItemType = AbuseReport.ItemTypes.LESSON;
			req.params.lessonId = itemId;
			lessonsMiddleware.exists(req, res, function() {
				req.abuseItem = req.lesson;
				next();
			});
		}
	}, function findQuestion() {
		if (itemType === AbuseReport.ItemTypes.QUESTION) {
			req.abuseItemType = AbuseReport.ItemTypes.QUESTION;
			req.params.questionId = itemId;
			questionsMiddleware.exists(req, res, function() {
				req.abuseItem = req.question;
				next();
			});
		}
	} ], function verifyItemExists() {

		// guy - we will reach here if itemType does not match anything..
		if (!req.abuseItem) {
			res.status(400).send('item does not exist');
			return;
		}
		next();
	});

};

exports.exists = function exists(req, res, next) {
	logger.debug('checking if abuseReport exists : ', req.params.abuseReportId);
	try {
		AbuseReport.findById(req.params.abuseReportId, function(err, result) {
			if (!!err) {
				res.status(500).send(err);
				return;
			}
			if (!result) {
				res.status(404).send('abuseReport not found');
				return;
			}

			logger.debug('putting abuseReport on request', result);
			req.abuseReport = result;
			next();

		});
	} catch (e) {
		res.status(404).send('abuseReport not found after exception');
	}
};
