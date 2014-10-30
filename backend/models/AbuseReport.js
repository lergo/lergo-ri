'use strict';

var services = require('../services');
var AbstractModel = require('./AbstractModel');
var logger = require('log4js').getLogger('AbuseReport');

function AbuseReport(data) {
	this.data = data;
	// returns the user we send report to
	this.getReporterAndCreator = function(callback) {
		var User = require('./User');
		var Question = require('./Question');
		var Lesson = require('./Lesson');
		logger.debug('looking for creator');
		User.findById(data.userId, {}, function(err, reporter) {
			logger.debug('found User', reporter);
			if (!!err) {
				callback(err);
				return;
			}
			if (data.itemType === AbuseReport.ItemTypes.LESSON) {
				Lesson.findById(data.itemId, {}, function(err, lesson) {
					logger.debug('found lesson', lesson);
					if (!!err) {
						callback(err);
						return;
					}
					User.findById(lesson.userId, {}, function(err, creator) {
						logger.debug('found User', creator);
						if (!!err) {
							callback(err);
							return;
						}
						callback(null, creator, reporter, lesson.name);
					});
				});
			} else if (data.itemType === AbuseReport.ItemTypes.QUESTION) {
				Question.findById(data.itemId, {}, function(err, question) {
					logger.debug('found question', question);
					if (!!err) {
						callback(err);
						return;
					}
					User.findById(question.userId, {}, function(err, creator) {
						logger.debug('found User', creator);
						if (!!err) {
							callback(err);
							return;
						}
						callback(null, creator, reporter, question.question);
					});
				});
			}
		});

	};
}

AbuseReport.collectionName = 'abuseReports';

// enum
AbuseReport.ItemTypes = {
	LESSON : 'lesson',
	QUESTION : 'question'
};

AbuseReport.createNew = function(itemId, userId, obj) {
	var abuseReport;
	if (obj === null) {
		abuseReport = {};
	} else {
		abuseReport = obj;
	}
	abuseReport.itemId = services.db.id(itemId);
	abuseReport.userId = services.db.id(userId);
	abuseReport.lastUpdated = new Date().getTime();
	return abuseReport;
};

AbuseReport.createNewFromRequest = function(req) {
	return AbuseReport.createNew(req.abuseItem._id, req.sessionUser._id, req.body);
};

AbstractModel.enhance(AbuseReport);

module.exports = AbuseReport;
