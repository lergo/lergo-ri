'use strict';
var models = require('../models');
var managers = require('../managers');
var logger = require('log4js').getLogger('AbuseReportsController');
var services = require('../services');
var async = require('async');
var _ = require('lodash');

// enum temporary solution for conversion
var localization = {
	notAppropriate : 'it is not appropriate for kids',
	notEducational : 'it is not educational content',
	infringesRights : 'it infringes on my rights'
};

function sendAbuseReportAlert(emailResources, report, callback) {
	logger.info('send abuseReport alert  is ready email');
	var creator = null;
	var reporter = null;

	async.parallel([ function(done) {
		report.getCreator(function(err, result) {
			if (!!err) {
				callback(err);
				return;
			}
			creator = result;
			done();

		});
	}, function(done) {
		report.getReporter(function(err, result) {
			if (!!err) {
				callback(err);
				return;
			}
			reporter = result;
			done();
		});
	} ], function() {
		var emailVars = {};
		_.merge(emailVars, emailResources);
		_.merge(emailVars, {
			creatorName : creator.username,
			reporterName : reporter.username,
			title : report.data.title,
			itemType : report.data.itemType,
			reason : localization[report.data.reason],
			comment : report.data.comment
		});
		async.parallel([ function(done) {
			services.emailTemplates.renderAbuseReportEmail(emailVars, function(err, html, text) {
				services.email.sendMail({
					to : creator.email,
					subject : 'Flagged ' + report.itemType + ' report re "' + report.data.title + '"',
					text : text,
					html : html
				}, function(err) {
					if (!!err) {
						logger.error('error while sending report to craetor', err);
						callback(err);
						return;
					}
					done();
				});
			});
		}, function(done) {
			services.emailTemplates.renderAbuseReportAdminEmail(emailVars, function(err, html, text) {
				services.email.sendMail({
					to : 'rahul.shukla@synerzip.com',
					subject : 'Flagged ' + report.itemType + ' report re "' + report.data.title + '"',
					text : text,
					html : html
				}, function(err) {
					if (!!err) {
						logger.error('error while sending report to admin', err);
						callback(err);
						return;
					}
					done();
				});
			});
		} ], function() {
			logger.info('saving report sent true');
			report.setSent(true);
			report.update();
			callback();
		});

	});
}

exports.abuse = function(req, res) {

	var abuseReport = models.AbuseReport.createNewFromRequest(req);
	if (!!abuseReport._id) {
		res.status(500).send({
			'message' : 'abuse already reported'
		});
		return;
	}

	models.AbuseReport.connect(function(db, collection) {
		collection.insert(abuseReport, function(err, result) {
			if (!!err || !result) {
				logger.error('unable to insert abusreReport to db', err);
				new managers.error.InternalServerError(err, 'unable to report abuse').send(res);
				return;
			}
			sendAbuseReportAlert(req.emailResources, new models.AbuseReport(abuseReport), function(err) {
				if (!!err) {

					new managers.error.InternalServerError(err, 'unable to report abuse').send(res);
					return;
				}
				res.send(abuseReport);
			});
		});
	});
};

exports.getAll = function(req, res) {

	managers.abuseReports.complexSearch(req.queryObj, function(err, result) {
		if (!!err) {
			new managers.error.InternalServerError(err, 'unable to get all admin lessons').send(res);
			return;
		}
		res.send(result);
	});
};

exports.deleteReport = function(req, res) {
	logger.debug('deleting abuseReport');
	models.AbuseReport.connect(function(db, collection) {
		logger.debug('removing abuseReport');
		collection.remove(req.abuseReport, function(err, result) {
			logger.debug('after remove abuseReport, err and result are', err, result);
			if (!!err) {
				new managers.error.InternalServerError(err, 'unable to delete abuseReport').send(res);
				return;
			}
			res.send(200);
		});
	});
};

exports.update = function(req, res) {
	logger.info('updating abuseReport');
	var abuseReport = req.body;
	new models.AbuseReport(abuseReport).update(function(err) {
		logger.info('abuseReport updated');
		if (!!err) {
			new managers.error.InternalServerError(err, 'unable to update abuseReport').send(res);
			return;
		} else {
			res.send(abuseReport);
			return;
		}
	});
};