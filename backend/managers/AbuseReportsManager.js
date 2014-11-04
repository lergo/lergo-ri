'use strict';
// todo user "managers" instead..
// since this is a manager, we cannot simply require('./index');
// we need to use setTimeout( function(){ managers = require('./index'); },0);
// hopefully this will cause the event loop to execute after index.js is
// initialized.

var services = require('../services');
var AbuseReport = require('../models/AbuseReport');
var async = require('async');
var logger = require('log4js').getLogger('AbuseReportsManager');
var _ = require('lodash');

exports.complexSearch = function(queryObj, callback) {

	if (!!queryObj.filter.searchText) {

		var text = new RegExp(queryObj.filter.searchText, 'i');

		if (!queryObj.filter.$or) {
			queryObj.filter.$or = [];
		}
		queryObj.filter.$or.push({
			'title' : text
		});
		delete queryObj.filter.searchText;
	}
	if (!!queryObj.filter.userId) {
		queryObj.filter.itemUserId = queryObj.filter.userId;
		delete queryObj.filter.userId;
	}
	if (!!queryObj.filter.reporterId) {
		queryObj.filter.userId = services.db.id(queryObj.filter.reporterId);
		delete queryObj.filter.reporterId;
	}
	AbuseReport.connect(function(db, collection) {
		services.complexSearch.complexSearch(queryObj, {
			collection : collection
		}, callback);
	});
};

// enum temporary solution for conversion
var localization = {
	notAppropriate : 'it is not appropriate for kids',
	notEducational : 'it is not educational content',
	infringesRights : 'it infringes on my rights'
};

function sendMail(emailVars, callback) {
	async.parallel([ function(done) {
		services.emailTemplates.renderAbuseReportEmail(emailVars, function(err, html, text) {
			services.email.sendMail({
				to : emailVars.creatorEmail,
				subject : 'Flagged ' + emailVars.itemType + ' report re "' + emailVars.title + '"',
				text : text,
				html : html
			}, function(err) {
				if (!!err) {
					logger.error('error while sending report to craetor', err);
					done(err);
				}
				done();
			});
		});
	}, function(done) {
		services.emailTemplates.renderAbuseReportAdminEmail(emailVars, function(err, htmlAdmin, textAdmin) {
			services.email.sendMail({
				to : services.conf.adminEmail,
				subject : 'Flagged ' + emailVars.itemType + ' report re "' + emailVars.title + '"',
				text : textAdmin,
				html : htmlAdmin
			}, function(err) {
				if (!!err) {
					logger.error('error while sending report to admin', err);
					done(err);
				}
				done();
			});
		});
	} ], function(err) {
		callback(err);
	});

}

exports.sendAbuseReportAlert = function(emailResources, report, callback) {
	logger.info('send abuseReport alert  is ready email');
	async.parallel([ function(done) {
		report.getCreator(function(err, result) {
			if (!!err) {
				done(err);
			}
			done(null, result);
		});
	}, function(done) {
		report.getReporter(function(err, result) {
			if (!!err) {
				done(err);
			}
			done(null, result);
		});
	} ], function(err, results) {
		if (!!err) {
			callback(err);
			return;
		}
		var creator = results[0];
		var reporter = results[1];
		var emailVars = {};
		_.merge(emailVars, emailResources);
		_.merge(emailVars, {
			creatorName : creator.username,
			creatorEmail : creator.email,
			reporterName : reporter.username,
			title : report.data.title,
			itemType : report.data.itemType,
			reason : localization[report.data.reason],
			comment : report.data.comment
		});
		sendMail(emailVars, function(err) {
			if (!!err) {
				callback(err);
				return;
			}
			logger.info('saving report sent true');
			report.setSent(true);
			report.update();
			callback();
		});

	});
};
