'use strict';

var services = require('../services');
var AbstractModel = require('./AbstractModel');

function AbuseReport(data) {
	this.data = data;
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
