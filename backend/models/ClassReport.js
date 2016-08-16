'use strict';
var AbstractModel = require('./AbstractModel');

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

