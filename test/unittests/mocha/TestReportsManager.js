'use strict';
var logger = require('log4js').getLogger('TestReportsManager');

//var expect = require('expect.js');
describe('ReportsManager', function( ){
    var ReportsManager;

    before(function(){
        logger.info('initializing test');
        require('../../mocks');
        //services.complexSearch.complexSearch
//        lets mock ComplexSearch
        var ComplexSearch = require('../../../backend/services/ComplexSearchService');
        ComplexSearch.complexSearch = function( queryObj, collection, callback ){
            callback( null , [{'data' : 'this is data', 'name' : 'this is name'}]);

        };
        //

        //
        ReportsManager = require('../../../backend/managers/ReportsManager');
//

    });
    describe('complexSearch', function(){
    });


});