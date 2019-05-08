'use strict';
var AbuseReport = require('../models/AbuseReport');
var managers = require('../managers');
var logger = require('log4js').getLogger('AbuseReportsController');

exports.abuse = function(req, res) {
	var abuseReport = AbuseReport.createNewFromRequest(req);
	if (!!abuseReport._id) {
		res.status(500).send({
			'message' : 'abuse already reported'
		});
		return;
	}
	AbuseReport.connect(function(db, collection) {
		collection.insertOne(abuseReport, function(err, result) {
			if (!!err || !result) {
				logger.error('unable to insert abusreReport to db', err);
				new managers.error.InternalServerError(err, 'unable to report abuse').send(res);
				return;
			}
			managers.abuseReports.sendAbuseReportAlert(req.emailResources, new AbuseReport(abuseReport), function(err) {
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
	AbuseReport.connect(function(db, collection) {
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
	new AbuseReport(abuseReport).update(function(err) {
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