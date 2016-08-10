'use strict';


/**
 * @name ReportsManager
 * @class
 *
 */
/**
 * @name managers
 * @module
 */
/**
 *
 * @type {exports.Report|*}
 */

var Report = require('../models').Report;
var ClassReport = require('../models').ClassReport;
var services = require('../services');
var _ = require('lodash');
var logger = require('log4js').getLogger('ClassReportsManager');
var CronJob = require('cron').CronJob;


var aggregateReportsOnAnswerLevel = function () {
    Report.connect(function (db, collection) {
        collection.aggregate([
            {
                $match: {'data.invitee.class': {$exists: true}, 'finished': true}
            }, {
                $unwind: '$answers'
            }, {
                $project: {
                    invitationId: 1,
                    answers: 1,
                    correct: {
                        $cond: {if: {$eq: ["$answers.checkAnswer.correct", true]}, then: 1, else: 0}
                    }
                }
            }, {
                $group: {
                    _id: {invitationId: '$invitationId', step: '$answers.stepIndex', quizItemId: '$answers.quizItemId'},
                    correctPer: {$avg: '$correct'},
                    avgDuration: {$avg: '$answers.duration'},
                    totalCorrect: {$sum: '$correct'},
                    total: {$sum: 1},
                    quizItemType: {$first: '$answers.quizItemType'}
                }
            }, {
                $project: {
                    _id: 0,
                    invitationId: '$_id.invitationId',
                    stepIndex: "$_id.step",
                    quizItemId: "$_id.quizItemId",
                    correctPer: {$multiply: ["$correctPer", 100]},
                    avgDuration: 1,
                    quizItemType: 1,
                    correct: 1,
                    total: 1
                }
            }, {
                $out: 'answerLevelReports'
            }
        ], function (err) {
            if (!!err) {
                console.error(err);
            }
        });
    });
};

var aggregateClassLevelReports = function () {
    Report.connect(function (db, collection) {
        collection.aggregate(
            [{
                $match: {'data.invitee.class': {$exists: true}}
            }, {
                $group: {
                    _id: {invitationId: '$invitationId', finished: '$finished'},
                    duration: {$avg: '$duration'},
                    correctPercentage: {$avg: '$correctPercentage'},
                    count: {$sum: 1},
                    data: {$first: '$data'},
                    answers: {$push: '$answers'}
                }
            }, {
                $project: {
                    _id: 0,
                    invitationId: '$_id.invitationId',
                    finished: '$_id.finished',
                    duration: 1,
                    correctPercentage: 1,
                    count: 1,
                    data: 1
                }
            }, {
                $out: 'classReports'
            }
            ], function (err) {
                if (!!err) {
                    console.error(err);
                }
            });
    });
};


new CronJob('0 0 * * * *', function () {
    services.db.connect('reports', function (db, reports) {
        aggregateClassLevelReports();
        aggregateReportsOnAnswerLevel();
    });
    console.log('Computing class reports');
}, null, true, 'America/Los_Angeles');


/**
 * @callback ReportsManager~ReportsManagerComplexSearchCallback
 * @param {error} err
 * @param {Array<LessonInvitation>} result
 */

/**
 *
 * @param {ComplexSearchQuery} queryObj
 * @param {ReportsManager~ReportsManagerComplexSearchCallback} callback
 */
exports.complexSearch = function (queryObj, callback) {

    // change some keys around for report.
    if (!!queryObj.filter) {
        if (!!queryObj.filter.language) {
            queryObj.filter['data.lesson.language'] = queryObj.filter.language;
            delete queryObj.filter.language;
        }

        if (!!queryObj.filter.subject) {
            queryObj.filter['data.lesson.subject'] = queryObj.filter.subject;
            delete queryObj.filter.subject;
        }
    }

    ClassReport.connect(function (db, collection) {
        services.complexSearch.complexSearch(queryObj, {collection: collection}, callback);
    });
};
