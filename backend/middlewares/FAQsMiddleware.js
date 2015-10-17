'use strict';
var FAQ = require('../models/FAQ');
var logger = require('log4js').getLogger('FAQsMiddleware');
var permissions = require('../permissions');

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

exports.userCanCreate = function userCanCreate( req, res, next ) {
	logger.debug('checking if user can create faq');
	return permissions.faqs.userCanCreate( req.sessionUser ) ? next() : res.status(400).send('user cannot create faq');
};

exports.userCanEdit = function userCanEdit( req, res, next ){
	logger.debug('checking if user can edit faq');
	return permissions.faqs.userCanEdit( req.sessionUser ) ? next() : res.status(400).send('user cannot edit faq');
};