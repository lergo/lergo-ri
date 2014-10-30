'use strict';
var models = require('../models');
var managers = require('../managers');
var logger = require('log4js').getLogger('AbuseReportsController');
var services = require('../services');
var _ = require('lodash');

function sendAbuseReportAlert(emailResources, report, callback) {
	logger.info('send abuseReport alert  is ready email');
	report.getReporterAndCreator(function(err, creator, reporter, title) {
		if (!!err) {
			callback(err);
			return;
		}

		var emailVars = {};
		_.merge(emailVars, emailResources);

		_.merge(emailVars, {
			creatorName : creator.username,
			reporterName : reporter.username,
			title : title,
			itemType : report.itemType,
			reason : report.reason,
			comment : report.comment
		});

		services.emailTemplates.renderAbuseReportEmail(emailVars, function(err, html, text) {
			services.email.sendMail({
				to : creator.email,
				subject : 'Flagged ' + report.itemType + ' report re "' + title + '"',
				text : text,
				html : html
			}, function(err) {
				if (!!err) {
					logger.error('error while sending report', err);
					callback(err);
				} else {
					logger.info('saving report sent true');
					report.setSent(true);
					report.update();
				}
			});
		});

	});

}
exports.abuse = function(req, res) {
	var abuseReport = models.AbuseReport.createNewFromRequest(req);
	models.AbuseReport.connect(function(db, collection) {
		collection.insert(abuseReport, function(err, result) {
			if (!!err || !result) {
				new managers.error.InternalServerError(err, 'unable to report abuse').send(res);
			}
			sendAbuseReportAlert(req.emailResources, new models.AbuseReport(abuseReport), function(err, result) {
				if (!!err || !result) {
					new managers.error.InternalServerError(err, 'unable to report abuse').send(res);
				}
				res.send(abuseReport);
			});
		});
	});
};