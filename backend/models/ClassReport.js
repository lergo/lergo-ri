'use strict';
//var logger = require('log4js').getLogger('Report');
var AbstractModel = require('./AbstractModel');
var logger = require('log4js').getLogger('ClassReport');


function ClassReport(data) {
    this.data = data;
    var self = this;
    self.getName = function () {
        return data.name;
    };

}

ClassReport.collectionName = 'classReports';

AbstractModel.enhance(ClassReport);

module.exports = ClassReport;

