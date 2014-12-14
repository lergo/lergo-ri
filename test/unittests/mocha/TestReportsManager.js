'use strict';
var logger = require('log4js').getLogger('TestReportsManager');

var expect = require('expect.js');
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
        it ( 'should remove field data on each item in result', function( done ){
            ReportsManager.complexSearch({}, function( err, result){
                expect(result[0].data).to.be(undefined);
                expect(result[0].name).to.be('this is name');
                done();
            });
        });
    })


});