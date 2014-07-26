'use strict';
var path = require('path');


exports.initializeEmailTemplateService = function( callback ){
    var service = require('../backend/services/EmailTemplateService');
    service.load(path.join(__dirname, '../emails') , callback );
};