'use strict';
var Report = require('../models').Report;
var services = require('../services');
var managers = require('../managers');
var logger = require('log4js').getLogger('ReportsController');

exports.createNewReportForLessonInvitation = function (req, res) {
    if (!req.invitation) {
        logger.error('invitation is missing on request');
    } else {
        logger.debug('found invitation on request');
    }
    logger.info('creating new report for lesson invitation');
    Report.connect(function (db, collection) {
        try {
            logger.info('connected to collection');
            var report = { invitationId: services.db.id(req.invitation._id) };
            logger.info('inserting report');
            collection.insert(report, function () {
                logger.info('in insert callback', report);
                res.send(report);
            });
        } catch (e) {
            logger.error('unable to save report', e);
        }
    });
};

exports.readReportById = function (req, res) {
    res.send(req.report);
};


// assume report exists in the system, verified by middleware
exports.updateReport = function (req, res) {
    logger.info('updating report');
    var report = req.body;
    report._id = services.db.id(report._id);
    report.invitationId = services.db.id(report.invitationId); // convert to db id.
    logger.info('creating report to update');
    new Report(report).update(function (err) {
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


exports.sendReportReady = function (req, res) {
    managers.reports.sendReportLink(req.emailResources, new Report(req.report), function (err) {
        if (!!err) {
            err.send(res);
            return;
        }

        res.send(200);

    });
};
