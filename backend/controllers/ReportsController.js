'use strict';

/**
 * @module ReportsController
 * @type {exports.Report|*}
 */

var Report = require('../models').Report;
var ClassReport = require('../models').ClassReport;
var services = require('../services');
var managers = require('../managers');
var logger = require('log4js').getLogger('ReportsController');
var _ = require('lodash');


var timeOutIDMap = {};


function getStepDurationAgg(durations) {
    var steps = {};
    _.forEach(durations, function (stepDurations) {
        for (var i = 0; i < stepDurations.length; i++) {
            var duration = stepDurations[i].endTime - stepDurations[i].startTime;
            if (isNaN(duration)) {
                duration = 0;
            }
            var step = steps[i];
            if (!!step) {
                step.duration = step.duration + duration;
                step.count = step.count + 1;
            } else {
                step = {
                    duration: duration,
                    count: 1
                };
                steps[i] = step;
            }
        }
    });
    return steps;
}
function getAnswersAgg(answers) {
    var answersAgg = {};
    _.forEach(_.flatten(answers), function (answer) {
        var key = answer.quizItemId;
        var ansAgg = answersAgg[key];
        if (!ansAgg) {
            ansAgg = {
                duration: 0,
                count: 0,
                correct: 0,
                hintUsed: 0
            };
        }
        ansAgg.duration = ansAgg.duration + answer.duration;
        ansAgg.count = ansAgg.count + 1;
        if (!!answer.checkAnswer.correct) {
            ansAgg.correct = ansAgg.correct + 1;
        }
        if (!!answer.isHintUsed) {
            ansAgg.hintUsed = ansAgg.hintUsed + 1;
        }
        ansAgg.stepIndex = answer.stepIndex;
        ansAgg.quizItemType = answer.quizItemType;
        answersAgg[key] = ansAgg;
    });
    return answersAgg;
}

function getStepAnswersAgg(answers) {
    var stepAnsAgg = _.reduce(answers, function (res, val) {
        if (val.quizItemType !== 'openQuestion') {
            var key = val.stepIndex;
            var result = res[key];
            if (!result) {
                result = {correctAnswers: 0, totalAnswers: 0};
            }
            result.correctAnswers = result.correctAnswers + val.correct;
            result.totalAnswers = result.totalAnswers + val.count;
            res[key] = result;
        }
        return res;
    }, {});

    return stepAnsAgg;
}

// update class level reports
/**
 *  This method will aggregate all reports corresponding to an invitationId if invitation is of class type
 * @param invitationId : invitation id whose class need to be aggregated
 */
function updateClassAggReports(invitationId) {
    var aggregate = function () {
        Report.aggregate([{
            $match: {'data.invitee.class': {$exists: true}, 'invitationId': invitationId, 'finished': true}
        }, {
            $group: {
                _id: '$invitationId',
                duration: {$avg: '$duration'},
                correctPercentage: {$avg: '$correctPercentage'},
                count: {$sum: 1},
                data: {$first: '$data'},
                lastUpdate: {$max: '$lastUpdate'},
                answers: {$push: '$answers'},
                stepDurations: {$push: '$stepDurations'}
            }
        }, {
            $project: {
                _id: 0,
                invitationId: '$_id',
                duration: 1,
                correctPercentage: 1,
                count: 1,
                lastUpdate: 1,
                data: 1,
                answers: 1,
                stepDurations: 1
            }
        }], function (err, result) {
            if (!!err) {
                console.error(err);
            }
            if (!!result && result.length > 0) {
                var report = result[0];
                report.answers = getAnswersAgg(report.answers);
                var stepAnswersAgg = getStepAnswersAgg(report.answers);
                var stepDurationAgg = getStepDurationAgg(report.stepDurations);
                report.stepDurations = _.merge(stepDurationAgg, stepAnswersAgg);
                ClassReport.connect(function (db, collection) {
                    try {
                        logger.info('inserting class report');
                        collection.update({invitationId: report.invitationId}, report, {upsert: true})
                            .then(function() {
                            collection.find({invitationId: report.invitationId}).toArray()
                                .then(function(result) {
                                    var className = result[0].data.invitee.class;
                                    var classreportId = result[0]._id;
                                    logger.info(`number of finished reports for ${className} is ${result[0].count}`);
                                    exports.findReportByInvitationId(invitationId, classreportId, className);
                                    });
                            });

                    } catch (e) {
                        logger.error('unable to save class report', e);
                    }
                });
            }
        });
    };
    clearTimeout(timeOutIDMap[invitationId]);
    timeOutIDMap[invitationId] = setTimeout(aggregate, 500);
}

exports.findReportByInvitationId = function(invitationId, classreportId, className,  res) {
    Report.connect(function (db, collection) {
        try {
            logger.info('finding Report from invitationId');
            collection.findOne({invitationId: invitationId})
                .then(function (report) {
                    return report;
                }).then(function(report) {
                    report.classreportId = classreportId;
                    report.className = className;

                    var req = {};
                    req.emailResources = report.emailResources;
                    req.report = report;

                    exports.sendReportReadyForClass(req, res);
            });
        } catch (e) {
            logger.error('unable to find report', e);
        }

    });
};


exports.createNewReportForLessonInvitation = function (req, res) {

    var report = {
        invitationId: services.db.id(req.invitation._id),
        data: {
            name: req.invitation.name, // required for filter by lesson name
            lesson: {
                language: req.invitation.language,
                subject: req.invitation.subject,
                name: req.invitation.name
            }
        }
    };

    if ( req.invitation.inviter ){ // required for 'students report'
        report.data.inviter = req.invitation.inviter.toString();
    }

    if ( req.invitation.invitee ){ // required for 'student filter'
        report.data.invitee = req.invitation.invitee;
    }

    if ( req.invitation.lessonId){ // required for filter by lesson name
        report.data.lesson._id = req.invitation.lessonId.toString();
        report.data.lessonId = req.invitation.lessonId.toString();
    }

    report.data.emailNotification = req.invitation.emailNotification; // required for sending email

    var overrides = req.body;

    // this is a hack until we sort out the "invite -- build" algorithm.
    // we should stop building invitation and instead build report..
    // when we do this, this algorithm should be able to simply put the invitee details and that's it..
    // for now, it has to wait for 'update' on report for it to actually apply
    if (req.body.invitee) {
        report.inviteeOverride = overrides.invitee;
    }

    if (!req.invitation) {
        logger.error('invitation is missing on request');
    } else {
        logger.debug('found invitation on request');
    }
    logger.info('creating new report for lesson invitation');
    Report.connect(function (db, collection) {
        try {
            logger.info('connected to collection');

            logger.info('inserting report');
            collection.insert(report, function () {
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


exports.getStudents = function (req, res) {

    var like = req.param('like');
    like = new RegExp(like, 'i');

    Report.connect(function (db, collection) {
        collection.aggregate([
            {'$match': {'data.inviter': req.sessionUser._id.toString()}},
            {'$group': {_id: '$data.invitee.name'}},
            {'$match': {'_id': {'$ne': null}}},
            {'$match': {'_id': like || ''}}
        ], function (err, result) {
            if (!!err) {
                new managers.error.InternalServerError(err, 'unable to fetch students').send(res);
                return;
            }
            res.send(result);
        });
    });

};


exports.getClasses = function (req, res) {

    var like = req.param('like');
    like = new RegExp(like, 'i');

    Report.connect(function (db, collection) {
        collection.aggregate([
            {'$match': {'data.inviter': req.sessionUser._id.toString()}},
            {'$group': {_id: '$data.invitee.class'}},
            {'$match': {'_id': {'$ne': null}}},
            {'$match': {'_id': like || ''}}
        ], function (err, result) {
            if (!!err) {
                new managers.error.InternalServerError(err, 'unable to fetch students').send(res);
                return;
            }
            res.send(result);
        });
    });

};


// assume report exists in the system, verified by middleware
exports.updateReport = function (req, res) {
    logger.info('updating report');
    var report = req.body;
    var reportModel = new Report(report);
    report._id = services.db.id(report._id);
    report.invitationId = services.db.id(report.invitationId); // convert to db

    if (!reportModel.isBasedOnTemporaryLesson()) { // we must have data duplication on in case lesson is temporary.. (practice mistakes for example), because once done, the lesson is deleted.
        report.data = req.report.data; // data is overridden sometimes for backward compatibility since october 2016 - we decided to remove as much data from report as possible
    }

    if (!!req.sessionUser) {
        // if the person who is doing the lesson is logged in, we want to know
        // that.
        report.userId = req.sessionUser._id;
    }

    if (!!req.emailResources) {
        // we need this for class report emailResources
        report.emailResources = req.emailResources;
    }

    // this is a temporary fix. to be able for students to register their names.
    // since we are building the invite instead of the report, on each update, we need to make sure invitee is correct.
    // the parameters are kept on the side.
    if (report.inviteeOverride) {
        try {
            logger.debug('merging student name with class name');
            _.merge(report.data.invitee, report.inviteeOverride);
        } catch (e) {
            logger.warn(e);
            // I don't care about errors here since it is a temporary work-around.
        }
    }
    // id.
    logger.info('creating report to update');

    reportModel.update(function (err) {
        logger.info('report updated');
        if (!!err) {
            new managers.error.InternalServerError(err, 'unable to update report').send(res);
            return;
        } else {
            res.send(report);
            // aggregate report only when finished
            if(!!report.finished){
                updateClassAggReports(report.invitationId);
            }
            return;
        }
    });
};

exports.sendReportReadyForClass = function (req, res) {
    managers.reports.sendReportLinkForClass(req.emailResources, new Report(req.report), function (err) {
        if (!!err) {
            err.send(res);
            return;
        }

        /*res.status(200).send({}); */ // lergo-577 - this response would cause "illegal token O" in frontend.

    });
};

exports.sendReportReady = function (req, res) {
    managers.reports.sendReportLink(req.emailResources, new Report(req.report), function (err) {
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
exports.getUserReports = function (req, res) {

    if (!req.queryObj || !req.queryObj.filter) {
        res.status(500).send('no filter or query object available');
        return;
    }

    req.queryObj.filter.userId = req.sessionUser._id;

    managers.reports.complexSearch(req.queryObj, function (err, obj) {
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
exports.getUserStudentsReports = function (req, res) {
    if (!req.queryObj || !req.queryObj.filter) {
        res.status(500).send('no filter or query object available');
        return;
    }

    req.queryObj.filter['data.inviter'] = req.sessionUser._id.toString();

    managers.reports.complexSearch(req.queryObj, function (err, obj) {
        if (!!err) {
            err.send(res);
            return;
        } else {
            res.send(obj);
            return;
        }
    });
};

exports.deleteReport = function (req, res) {
    // when an looged in user tries to delete report of the lesson done by him
    // in order of someone else invite dont delete the report just remove the
    // userId from the report so that it will be available to inviter but not to
    // logged in invitee.
    if (!!req.deleteUserInfo) {
        var report = req.report;
        delete report.userId;
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
    } else {

        managers.reports.deleteReport(req.report._id, function (err, deletedReport) {
            if (!!err) {
                logger.error('error deleting report', err);
                err.send(res);
                return;
            } else {
                updateClassAggReports(req.report.invitationId);
                res.send(deletedReport);
                return;
            }
        });
    }

};


/**
 *
 * @description
 * finds lessons' _id and name according with 'like' operator on a string.
 *
 * This action will send back on the response an array of objects containing _id and name of lessons.
 *
 * <pre>
 *     [
 *      { _id : '..' , name : '...'},
 *      ...
 *     ]
 * </pre>
 *
 * These _id and name values belong to lessons that user did before
 *
 *
 * @param {object} req - contains 'like' string
 * @param {object} res
 */


exports.findReportLessonsByName = function (req, res) {
    var like = req.param('like');
    var reportType = req.param('reportType');
    like = new RegExp(like, 'i');
    var agg = [{
        $match: {
            'data.name': like,
            'data.inviter': req.sessionUser._id.toString()
        }
    }, {
        $group: {
            _id: '$data.lessonId',
            'name': {'$addToSet': '$data.name'}
        }
    }, {
        $unwind: '$name'
    }, {
        $limit: 5
    }];

    var Model = Report;
    if (reportType === 'class') {
        Model = ClassReport;
    }
    console.log('aggregation is', JSON.stringify(agg));
    Model.aggregate(agg, function (err, result) {
        if (!!err) {
            new managers.error.InternalServerError(err, 'error while searching reports lessons').send(res);
            return;
        }
        res.send(result);
    });

};

//todo we can remove this function and direct call to findReportLessonsByName
exports.findStudentReportLessonsByName = function (req, res) {
    exports.findReportLessonsByName(req, res);
};



