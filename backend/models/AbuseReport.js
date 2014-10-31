'use strict';

var services = require('../services');
var AbstractModel = require('./AbstractModel');
var logger = require('log4js').getLogger('AbuseReport');

function AbuseReport(data) {
	this.data = data;
	// returns the user we send report to
	this.getReporterAndCreator = function(callback) {
		var User = require('./User');
		logger.debug('looking for creator');
		User.findById(data.userId, {}, function(err, reporter) {
			logger.debug('found User', reporter);
			if (!!err) {
				callback(err);
				return;
			}
			User.findById(data.itemUserId, {}, function(err, creator) {
				logger.debug('found User', creator);
				if (!!err) {
					callback(err);
					return;
				}
				callback(null, creator, reporter);
			});
		});

	};

    this.setSent = function( isSent ){
        this.sent = isSent;
    };
}

AbuseReport.collectionName = 'abuseReports';

// enum
AbuseReport.ItemTypes = {
	LESSON : 'lesson',
	QUESTION : 'question'
};

AbuseReport.createNew = function(item, userId, obj) {
	var abuseReport;
	if (obj === null) {
		abuseReport = {};
	} else {
		abuseReport = obj;
		if (obj.itemType === AbuseReport.ItemTypes.LESSON) {
			obj.title = item.name;
		} else if (obj.itemType === AbuseReport.ItemTypes.QUESTION) {
			obj.title = item.question;
		}
	}
	abuseReport.itemId = services.db.id(item._id);
	abuseReport.userId = services.db.id(userId);
	abuseReport.lastUpdated = new Date().getTime();
	abuseReport.itemUserId = item.userId;
	abuseReport.subject = item.subject;
	abuseReport.language = item.language;

	return abuseReport;
};

AbuseReport.createNewFromRequest = function(req) {
	return AbuseReport.createNew(req.abuseItem, req.sessionUser._id, req.body);
};

AbstractModel.enhance(AbuseReport);

module.exports = AbuseReport;
