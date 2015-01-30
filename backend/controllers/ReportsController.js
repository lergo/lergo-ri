'use strict';

/**
 * @module ReportsController
 * @type {exports.Report|*}
 */

var Report = require('../models').Report;
var services = require('../services');
var managers = require('../managers');
var logger = require('log4js').getLogger('ReportsController');

exports.createNewReportForLessonInvitation = function(req, res) {
	if (!req.invitation) {
		logger.error('invitation is missing on request');
	} else {
		logger.debug('found invitation on request');
	}
	logger.info('creating new report for lesson invitation');
	Report.connect(function(db, collection) {
		try {
			logger.info('connected to collection');
			var report = {
				invitationId : services.db.id(req.invitation._id)
			};
			logger.info('inserting report');
			collection.insert(report, function() {
				logger.info('in insert callback', report);
				res.send(report);
			});
		} catch (e) {
			logger.error('unable to save report', e);
		}
	});
};

exports.readReportById = function(req, res) {
	res.send(req.report);
};


exports.getStudents = function(req, res ){

    var like = req.param('like');
    like = new RegExp(like, 'i');

    Report.connect(function(db, collection){
        collection.aggregate([
            { '$match' : { 'data.inviter' : req.sessionUser._id.toString() } },
            {'$group' : { _id : '$data.invitee.name' } },
            { '$match' : { '_id' : { '$ne' : null} } },
            { '$match' : { '_id' :  like || '' }}
        ], function(err, result){
            if ( !! err ){
                new managers.error.InternalServerError(err, 'unable to fetch students').send(res);
                return;
            }
            res.send(result);
        });
    });

};


// assume report exists in the system, verified by middleware
exports.updateReport = function(req, res) {
	logger.info('updating report');
	var report = req.body;
	report._id = services.db.id(report._id);
	report.invitationId = services.db.id(report.invitationId); // convert to db
	if (!!req.sessionUser) {
		// if the person who is doing the lesson is logged in, we want to know
		// that.
		report.userId = req.sessionUser._id;
	}
	// id.
	logger.info('creating report to update');
	new Report(report).update(function(err) {
		logger.info('report updated');
		if (!!err) {
			new managers.error.InternalServerError(err, 'unable to update report').send(res);
			return;
		} else {
			res.send(report);
			return;
		}
	});
};

exports.sendReportReady = function(req, res) {
	managers.reports.sendReportLink(req.emailResources, new Report(req.report), function(err) {
		if (!!err) {
			err.send(res);
			return;
		}

		res.status(200).send({});  // lergo-577 - this response would cause "illegal token O" in frontend.

	});
};

/**
 *
 * Gets reports done by me.
 *
 * we model it by putting 'userId' on the report.
 *
 * this does not include reports I invited someone else to do.
 *
 * this action removes the "data" field from the reports.
 *
 * @param req - the request
 * @param res - the response
 */
exports.getUserReports = function(req, res) {

    if ( !req.queryObj || !req.queryObj.filter ){
        res.status(500).send('no filter or query object available');
        return;
    }

    req.queryObj.filter.userId = req.sessionUser._id;

	managers.reports.complexSearch(req.queryObj, function(err, obj) {
		if (!!err) {
			err.send(res);
			return;
		} else {
			res.send(obj);
			return;
		}
	});
};

/**
 *
 * gets reports I invited.
 *
 *
 * in this scenario there might not be a userId on the report.
 * we go by the data.inviter field which holds the inviter's userId - only users can invite..
 *
 *
 * @param req - the request
 * @param res - the response
 */
exports.getUserStudentsReports = function(req, res ){
    if ( !req.queryObj || !req.queryObj.filter ){
        res.status(500).send('no filter or query object available');
        return;
    }

    req.queryObj.filter['data.inviter'] = req.sessionUser._id.toString();

    managers.reports.complexSearch(req.queryObj, function(err, obj) {
        if (!!err) {
            err.send(res);
            return;
        } else {
            res.send(obj);
            return;
        }
    });
};

exports.deleteReport = function(req, res) {
	// when an looged in user tries to delete report of the lesson done by him
	// in order of someone else invite dont delete the report just remove the
	// userId from the report so that it will be available to inviter but not to
	// logged in invitee.
	if (!!req.deleteUserInfo) {
		var report = req.report;
		delete report.userId;
		new Report(report).update(function(err) {
			logger.info('report updated');
			if (!!err) {
				new managers.error.InternalServerError(err, 'unable to update report').send(res);
				return;
			} else {
				res.send(report);
				return;
			}
		});
	} else {
		managers.reports.deleteReport(req.report._id, function(err, deletedReport) {
			if (!!err) {
				logger.error('error deleting report', err);
				err.send(res);
				return;
			} else {
				res.send(deletedReport);
				return;
			}
		});
	}

};