'use strict';

var ClassReport = require('../models').ClassReport;
var services = require('../services');

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
