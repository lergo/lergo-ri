'use strict';
var FAQ = require('../models/FAQ');
var logger = require('log4js').getLogger('FAQsMiddleware');

exports.exists = function exists(req, res, next) {
	logger.info('checking if faq exists : ', req.params.faqId);
	FAQ.findById(req.params.faqId, function(err, result) {
		if (!!err) {
			res.status(500).send(err);
			return;
		}
		if (!result) {
			res.status(404).send('faq node found');
			return;
		}

		logger.debug('putting faq on request', result);
		req.faq = result;
		next();
	});
};