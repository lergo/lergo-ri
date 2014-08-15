'use strict';
var Report = require('../models').Report;
var logger = require('log4js').getLogger('ReportsMiddleware');
var permissions = require('../permissions');

exports.exists = function exists(req, res, next) {
	logger.debug('checking if report exists : ', req.params.reportId);
	try {
		Report.findById(req.params.reportId, function(err, result) {
			if (!!err) {
				res.send(500, err);
				return;
			}
			if (!result) {
				res.send(404);
				return;
			}

			logger.debug('putting report on request', result);
			req.report = result;

			next();

		});
	} catch (e) {
		res.send(404);
	}
};

exports.userCanDelete = function userCanDelete(req, res, next) {
	if (permissions.reports.userCanDelete(req.report, req.user)) {
		return next();
	} else if (permissions.reports.userCanDeleteItSelf(req.report, req.user)) {
		req.deleteUserInfo = true;
		return next();
	} else {
		return res.send(400);
	}
};