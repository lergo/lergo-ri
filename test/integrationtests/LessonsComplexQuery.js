'use strict';


/**
 *
 *
 *
 * This tests relies on mongo, and therefore it is an integration test.
 *
 *
 * @type {exports}
 */

var logger = require('log4js').getLogger('LessonsComplexQueryTest');
var async = require('async');
console.log('this is cwd', process.cwd());
var LessonsManager = require('../../backend/managers/LessonsManager');
var Lesson = require('../../backend/models/Lesson');
var expect = require('expect.js');


var data;
// assert lessons collection is empty.. if not it should be. perhaps we are pointing to a REAL db?

before(function(done) {
    logger.info('BEFORE: populating DB with data');

    async.waterfall([
        function assertEmpty(next) {
            Lesson.count(function (err, result) {
                logger.info('got count', result);
                expect(result).to.be(0);
                next();
            });
        },
        function populate(next) {
            data = require('./LessonsComplexQueryData.json');

            Lesson.connect(function (db, collection) {
                collection.insert(data, function (err, docs) {
                    console.log(docs);
                });
            });

            next();
        }
    ], function () {
        done();
    });



});

after(function(done){
    logger.info('AFTER: clearing db of data');
    Lesson.connect(function(db,collection){
        collection.remove( function(){
            logger.info('removed');
            done();
        });
    });
    done();
});


describe('LessonComplexSearch', function(){
    it('should return a response with data, count, skip and limit', function(done){
        LessonsManager.complexSearch({},function( err, response ){
            logger.info(response);
            expect(response).to.only.have.keys(['data','count','total','skip','limit']);
            done();
        });
    });

    it('should count all lessons', function (done){
        LessonsManager.complexSearch({}, function(err, response){
            expect(response.total).to.eql(data.length);
            done();
        });
    });

    it('should obey the limit', function (done) {
        LessonsManager.complexSearch({ 'filter': {}, 'limit': 1}, function (err, response) {
            logger.info('this is the response', response);
            expect(response.total).to.eql(data.length);
            expect(response.limit).to.eql(1);
            done();
        });
    });

    it('should obey the filter', function (done) {
        LessonsManager.complexSearch({'filter': { 'name': /1/g } }, function (err, response) {
            expect(response.data.length).to.eql(1);
            done();
        });
    });

    it('should support pagination with skip and limit', function(done){
        async.waterfall([
            function( next ){
                LessonsManager.complexSearch({'skip':1, 'limit':1}, function(err, response){
                    expect(response.data.length).to.eql(1);
                    expect(response.data[0].name).to.contain('1');
                    next();
                });
            },

            function( next ){
                LessonsManager.complexSearch({'skip': 2, 'limit':2}, function(err, response){
                    expect(response.data.length).to.eql(2);
                    expect(response.data[0].name).to.contain('2');
                    expect(response.data[1].name).to.contain('3');
                    next();
                });
            }

        ], function(){
            done();
        });
    });

    it('should support sorting', function (done) {
        LessonsManager.complexSearch({ 'sort': {'name': -1}, 'limit': 1}, function (err, response) {
            expect(response.data.length).to.be(1);
            expect(response.data[0].name).to.contain('9');
            done();
        });
    });
});








