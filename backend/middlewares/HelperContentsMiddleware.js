'use strict';

/**
 * @module HelperContentsMiddleware
 * @type {HelperContent|exports}
 */

var HelperContent = require('../models/HelperContent');
var logger = require('log4js').getLogger('HelperContentsMiddleware');
var permissions = require('../permissions');

exports.exists = function exists(req, res, next) {
	logger.info('checking if helperContent exists : ', req.params.helperContentId);
	HelperContent.findById(req.params.helperContentId, function(err, result) {
		if (!!err) {
			res.status(500).send(err);
			return;
		}
		if (!result) {
			res.status(404).send('helperContent node found');
			return;
		}

		logger.debug('putting helperContent on request', result);
		req.helperContent = result;

		next();

	});
};

/**
 * Whether user can edit the helperContent or not
 * 
 * assumes request contains
 * 
 * user - the user on the request helperContent - the helperContent we are
 * editting
 */
exports.userCanEdit = function userCanEdit(req, res, next) {
	return permissions.helperContents.userCanEdit( req.sessionUser, req.helperContent ) ? next() : res.status(400).send({});
};