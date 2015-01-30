'use strict';
var logger = require('log4js').getLogger('HelperContentsController');
var HelperContent = require('../models/HelperContent');
var managers = require('../managers');
var services = require('../services');

exports.create = function(req, res) {
	var content = req.body;
	content.userId = services.db.id(req.sessionUser._id);
	HelperContent.connect(function(db, collection) {
		collection.insert(content, function(err, result) {
			if (!!err || !result) {
				new managers.error.InternalServerError(err, 'unable to save helper content').send(res);
			}
			res.send(result);
		});
	});
};
exports.update = function(req, res) {
	logger.info('updating helperContent');
	var helperContent = req.body;
	new HelperContent(helperContent).update(function(err) {
		logger.info('helperContent updated');
		if (!!err) {
			new managers.error.InternalServerError(err, 'unable to update helperContent').send(res);
			return;
		} else {
			res.send(helperContent);
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
	HelperContent.findOne(queryObj, {}, function(err, result) {
		if (!!err) {
			new managers.error.InternalServerError(err, 'unable to find helperContent ').send(res);
			return;
		} else if (!!result) {
			res.send(result);
			return;
		}
		res.send();
		return;
	});
};