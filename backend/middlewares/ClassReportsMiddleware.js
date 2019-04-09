'use strict';
var Report = require('../models').ClassReport;
var logger = require('log4js').getLogger('ReportsMiddleware');

exports.exists = function exists(req, res, next) {
	logger.debug('checking if report exists : ', req.params.reportId);
	try {
		Report.findById(req.params.reportId, function(err, result) {
			if (!!err) {
				res.status(500).send(err);
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
