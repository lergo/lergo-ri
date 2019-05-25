'use strict';


describe('ReportsController', function(){

    var expect = require('expect.js');
    var sinon = require('sinon');

    var logger = require('log4js').getLogger('TestReportsController');

    var ReportsController;
    var ReportModel;

    before(function(){
        ReportsController = require('../../../../backend/controllers/ReportsController');
        ReportModel = require('../../../../backend/models/Report');
    });


    describe('#findReportLessonsByName', function(){

        it('should be a function', function(){
            expect(typeof(ReportsController.findReportLessonsByName)).to.be('function');
        });


        var request;
        var response;
        var collection;
        var sandbox;
        var sendError = false;
        var ErrorManager;

        beforeEach(function(){
            sandbox = sinon.sandbox.create();

            collection =  { aggregate: sinon.spy( function( data, callback ){
                if ( !!sendError){
                    callback('someError');
                }else{
                    callback(null, 'someResult');
                }
            }) };
            sandbox.stub(ReportModel, 'connect' , function( callback ){
                logger.info('inside mock!!', arguments);
                callback( {} , collection );
            } );

            request = { param : sinon.spy(function(){ return 'aName'; }), sessionUser : { _id : 'anId' } };
            response = { send : sinon.spy() };

            ErrorManager = require('../../../../backend/managers/ErrorManager');
            sandbox.stub(ErrorManager, 'InternalServerError', function(){
                return { send : sinon.spy() };
            });

        });

        afterEach(function(){
            sandbox.restore();
        });

        it('should take param like from req', sinon.test(function(){
            ReportsController.findReportLessonsByName(request, response);
            expect(request.param.calledWith('like')).to.be(true);
        }));

        /* it('should call aggregate with like value and user id on match', function(){
            ReportsController.findReportLessonsByName( request, response );
            logger.info('this is aggregate',collection.aggregate.args[0]);

            var argumentsInFirstCall = collection.aggregate.args[0]; // array of arguments
            var firstArgumentInFirstCall = argumentsInFirstCall[0]; // should be aggregate input
            var matchObject = firstArgumentInFirstCall[0];

            logger.info('matchObject', matchObject);
            expect(matchObject.$match['data.name'].toString()).to.be('/aName/i');
            expect(matchObject.$match.userId).to.be('anId');
        }); */

        it('should send response with aggregate results', function(){
            ReportsController.findReportLessonsByName( request, response );
            expect(response.send.calledWith('someResult')).to.be(true);
        });

        it('should send error if aggregate failed', function(){
            sendError = true; //will cause aggregate to generate an error
            ReportsController.findReportLessonsByName( request, response );
            expect(response.send.calledWith('someResult')).to.be(false);
            expect(ErrorManager.InternalServerError.called).to.be(true);
            expect(ErrorManager.InternalServerError.args[0][0]).to.be('someError');
            expect(ErrorManager.InternalServerError.args[0][1]).to.be('error while searching reports lessons');
        });
    });

});
