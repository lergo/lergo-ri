'use strict';
var Report = require('../models').Report;
var logger = require('log4js').getLogger('ReportsMiddleware');
var permissions = require('../permissions');
var _ = require('lodash');

exports.exists = function exists(req, res, next) {
	logger.debug('checking if report exists : ', req.params.reportId);
	try {
		Report.findById(req.params.reportId, function(err, result) {
			if (!!err) {
				res.stauts(500).send(err);
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
        console.log('could not find report',e);
		res.send(404);
	}
};

// use this middleware as backward compatibility with change in october 2016.
// when we decided to remove as much data as possible from Report.
exports.mergeWithInvitationData = function mergeWithInvitationData(req, res, next){
    logger.info('merging report with invitation data');
    var LessonsInvitationsMiddleware = require('./LessonsInvitationsMiddleware');
    if (!new Report(req.report).isBasedOnTemporaryLesson()) { // create data duplication only if not based on temporary lesson. (e.g. practice mistakes)
        req.params.invitationId = req.report.invitationId;
        if ( req.report && req.report.data ) {
            req.params.lessonId = req.report.data.lessonId;
        }
        logger.info('requesting invitation');
        LessonsInvitationsMiddleware.existsOrConstruct(req, res, function () {
            logger.info('got the invitation', !!req.invitation);
            // guy mograbi: since october 2016 we decided to remove as much data from reports as possible
            // so we restore this information in the middleware on each request
            _.merge(req.report.data, req.invitation);
            next();
        });
    } else {
        next();
    }
};

// todo split to several middlewares : 'userCanDelete','optionUserCanDelete', 'userCanUserInfoOnReport'
exports.userCanDelete = function userCanDelete(req, res, next) {
	if (permissions.reports.userCanDelete(req.sessionUser, req.report)) {
		return next();
	} else if (permissions.reports.userCanDeleteUserInfo(req.sessionUser, req.report)) {
		req.deleteUserInfo = true;
		return next();
	} else {
		return res.send(400);
	}
};
