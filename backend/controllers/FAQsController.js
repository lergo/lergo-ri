'use strict';
var logger = require('log4js').getLogger('FAQsController');
var FAQ = require('../models/FAQ');
var managers = require('../managers');
var services = require('../services');

exports.create = function(req, res) {
	var content = req.body;
	content.userId = services.db.id(req.sessionUser._id);
	FAQ.connect(function(db, collection) {
		collection.insert(content, function(err, result) {
			if (!!err || !result) {
				new managers.error.InternalServerError(err, 'unable to save faq').send(res);
			}
			res.send(result);
		});
	});
};
exports.update = function(req, res) {
	logger.info('updating faq');
	var faq = req.body;
	new FAQ(faq).update(function(err) {
		logger.info('faq updated');
		if (!!err) {
			new managers.error.InternalServerError(err, 'unable to update faq').send(res);
			return;
		} else {
			res.send(faq);
			return;
		}
	});
};

exports.find = function(req, res) {
	if (!req.param('query')) {
		res.status(400).send('query obj required but missing on request');
		return;
	}
	var queryObj = req.param('query');
	if (typeof (queryObj) === 'string') {
		queryObj = JSON.parse(queryObj);
	}
	FAQ.findOne(queryObj, {}, function(err, result) {
		if (!!err) {
			new managers.error.InternalServerError(err, 'unable to find faq ').send(res);
			return;
		} else if (!!result) {
			res.send(result);
			return;
		}
		res.send();
		return;
	});
};