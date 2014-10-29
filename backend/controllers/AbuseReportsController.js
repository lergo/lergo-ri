'use strict';
var models = require('../models');
var managers = require('../managers');

exports.abuse = function(req, res) {
	var abuseReport = models.AbuseReport.createNewFromRequest(req);
	models.AbuseReport.connect(function(db, collection) {
		collection.insert(abuseReport, function(err, result) {
			if (!!err || !result) {
				new managers.error.InternalServerError(err, 'unable to report abuse').send(res);
			}
			res.send(abuseReport);
		});
	});
};
