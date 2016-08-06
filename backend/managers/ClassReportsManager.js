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


// map function
var map = function () {
    emit(this.invitationId, {
        count: 1,
        class: this.data.invitee.class,
        duration: this.duration,
        correctPercentage: this.correctPercentage,
        finished: this.finished,
        subject:this.data.subject,
        name:this.data.name,
        inviter:this.data.inviter
        // list other fields like above to select them
    })
};

// reduce function
var reduce = function (key, values) {

    var reducedVal = {
        count: values.length,
        finished: true,
        class: values[0].class,
        subject:values[0].subject,
        name:values[0].name,
        inviter:values[0].inviter,
        duration: 0,
        correctPercentage: 0
    };

    for (var i = 0; i < values.length; i++) {
        reducedVal.finished = reducedVal.finished && values[i].finished;
        reducedVal.duration += values[i].duration;
        reducedVal.correctPercentage += values[i].correctPercentage;
    }
    return reducedVal;
};

var finalizer = function (key, reducedVal) {
    reducedVal.correctPercentage = reducedVal.correctPercentage/reducedVal.count;
    reducedVal.duration = reducedVal.duration/reducedVal.count;
    return reducedVal;
};

// condition
var query = {
    'data.invitee.class': {'$exists': true}
};

// map-reduce command
var command = {
    //map: map , // a function for mapping
    //reduce: reduce, // a function  for reducing
    finalize:finalizer,
    query: query, // filter conditions
    out:'classReports'
};

new CronJob('0 0 * * * *', function() {
    services.db.connect('reports',function(db,reports){
       reports.mapReduce(map,reduce,command,function(){});
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
exports.complexSearch = function( queryObj, callback ){

    // change some keys around for report.
    if ( !!queryObj.filter ){
        if ( !!queryObj.filter.language ){
            queryObj.filter['data.lesson.language'] = queryObj.filter.language;
            delete queryObj.filter.language;
        }

        if ( !!queryObj.filter.subject){
            queryObj.filter['data.lesson.subject'] = queryObj.filter.subject;
            delete queryObj.filter.subject;
        }
    }

    ClassReport.connect( function( db, collection ){
        services.complexSearch.complexSearch( queryObj, { collection : collection }, callback);
    });
};
