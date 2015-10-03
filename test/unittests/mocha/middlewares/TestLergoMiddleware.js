'use strict';


describe('LergoMiddleware', function () {

    var LergoMiddleware;
    var sinon = require('sinon');
    var logger = require('log4js').getLogger('TestLergoMiddleware');
    var _ = require('lodash');
    var expect = require('expect.js');
    before(function () {
        LergoMiddleware = require('../../../../backend/LergoMiddleware');
    });

    var sandbox;
    var next;
    var request;
    var response;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        request = { 'protocol': 'testProtocol', 'params': {}, 'query': {}, 'param' : sinon.spy(), 'get': sinon.spy(function (key) {
            return 'my_' + key;
        }) };
        response = { 'status' : sinon.spy( function(){ return response; }), 'send' : sinon.spy(function(){logger.debug(arguments);})  };

        next = sinon.spy();
    });

    describe('#escapeRegexp', function () {

        afterEach(function () {
            sandbox.restore();
        });


        it('should escape regexp special characters according to parameters name on request', function () {

        });
    });


    describe('#emailResources', function () {


        beforeEach(function () {
            LergoMiddleware.emailResources(request, response, next);
        });

        it('should add emailResources on request', function () {
            expect(typeof(request.emailResources)).to.be('object');
            var properties = ['lergoBaseUrl', 'lergoLink', 'lergoLogoAbsoluteUrl'];
            _.each(properties, function (prop) {
                logger.debug('checking if prop', prop, 'is on request');
                expect(request.emailResources.hasOwnProperty(prop)).to.be(true);
            });
        });


        it('should call next', function () {
            expect(next.called).to.be(true);
        });
    });

    describe('#origin', function () {
        beforeEach(function () {
            LergoMiddleware.origin(request, response, next);
        });

        it('should add origin on the request', function () {
            expect(request.origin).to.equal('testProtocol://my_Host');
        });

        it('should add absoluteUrl function on request', function () {
            expect(typeof(request.absoluteUrl)).to.equal('function');

            expect(request.absoluteUrl('/guy')).to.equal('testProtocol://my_Host/guy');
        });

        it('should call next', function () {
            expect(next.called).to.be(true);
        });
    });

    describe('addGetQueryList', function () {

        beforeEach(function () {
            LergoMiddleware.addGetQueryList(request, response, next);
        });

        it('should should add function \'getQueryList\' on request', function () {
            expect(typeof(request.getQueryList)).to.be('function');
        });

        describe('getQueryList', function () {

            it('should return a list', function () {
                expect(request.getQueryList('someKey').length).to.be(0);
            });

            it('should return key from query as list', function () {
                request.query = { 'guy': 'mograbi' };
                expect(_.difference(request.getQueryList('guy'), ['mograbi']).length).to.be(0);

                request.query = { 'guy': ['shaul', 'mograbi'] }; // now the value is a list
                expect(_.difference(request.getQueryList('guy'), [ 'shaul', 'mograbi']).length).to.be(0);
            });

            it('should call next', function () {
                expect(next.called).to.be(true);
            });
        });
    });

    describe('#queryParamDefault', function () {

        beforeEach(function () {
            request.param = sandbox.spy();
            LergoMiddleware.queryParamsDefault(request, response, next);
        });

        it('should put default value for limit on request ', function () {
            expect(request.query._limit).to.be(3000);
            expect(request.query._skip).to.be(0);
        });

        it('should keep values if they are sain', function () {
            request.param = sandbox.spy(function () {
                return 10;
            });
            LergoMiddleware.queryParamsDefault(request, response, next);
            expect(request.query._limit).to.be(10);
            expect(request.query._skip).to.be(10);
        });


        it('should handle non numeric values', function () {
            request.param = sandbox.spy(function () {
                return 'hello world!';
            });
            LergoMiddleware.queryParamsDefault(request, response, next);
            expect(request.query._limit).to.be(3000);
            expect(request.query._skip).to.be(0);
        });

        it('should handle express upgrades nicely', function () {
            // the assertion here is that we didn't get an exception
            LergoMiddleware.queryParamsDefault({}, response, next);
        });

        it('should call next', function () {
            expect(next.called).to.be(true);
        });
    });

    describe('escapeRegExp', function () {
        var escapeFn;
        beforeEach(function () {
            escapeFn = LergoMiddleware.escapeRegExp('like');
        });

        it('should escape regexp special characters', function () {
            request.param = sinon.spy(function () {
                return 'escape this.!?';
            });

            escapeFn(request, response, next);


            expect(request.query.like).to.be('escape this\\.!\\?');
        });

        it('should do nothing when parameter does not exist', function () {
            request.param = sinon.spy(function () {
                return null;
            });
            escapeFn(request, response, next);

            expect(request.query.like).to.be(undefined);
        });


        it('should call next', function () {
            request.param = sinon.spy(function () {
                return 'escape this.!?';
            });
            escapeFn(request, response, next);

            expect(next.called).to.be(true);
        });
    });

    describe('renameKey', function () {

        var result;
        beforeEach(function(){
            result = {};
        });

        it('should', function () {

            LergoMiddleware.renameKey( result , {'dollar_hello': { 'message' : 'world' , 'list' : [1,2,3]} }, function ( key ) {
                return 'foo_' + key;
            });

            expect(JSON.stringify(result)).to.be(JSON.stringify({'foo_dollar_hello' : { 'foo_message' : 'world', 'foo_list' : [1,2,3]} }) );

            result = {};

            LergoMiddleware.renameKey( result , {'dollar_hello':  'world'  }, function () {
                return 'guy';
            });

            expect(JSON.stringify(result)).to.be(JSON.stringify({'guy' : 'world'}));

        });

    });

    describe('replace dollar prefix', function(){
        it('should replace all dollar_ prefix keys with $ sign, and not touch the others', function(){
            var result = LergoMiddleware.replaceDollarPrefix({'dollar_time':'again','and' : 'again', 'while' : { 'dollar_i' : 'think' } });
            expect(JSON.stringify(result)).to.be(JSON.stringify({'$time' : 'again','and':'again', 'while' : {'$i' : 'think'}}));
        });
    });

    describe('queryObjParsing', function(){
        it('should send error code 400 if query does not exist', function(){
            LergoMiddleware.queryObjParsing( request, response, next );
            expect(response.status.calledWith(400)).to.be(true);
            expect(response.send.calledWith('query obj required but missing on request')).to.be(true);
        });

        it('should replace dollar_key to $key and change values for limit and page.size to make sense', function(){
            request.param = sinon.spy(function(){
                return { 'filter' : { 'userId' : '1111', 'dollar_exists' : { 'name': true}, 'limit' : 10000  } , '$page' : { 'size' : 10000 , 'current' : 100 }} ;
            });
            LergoMiddleware.queryObjParsing( request, response, next );
            expect(JSON.stringify(request.queryObj)).to.be('{"filter":{"userId":{"value":"1111"},"$exists":{"name":true},"limit":200},"skip":990000,"limit":10000}');
        });

        it('should do the same for strings', function(){
            request.param = sinon.spy(function(){
                return JSON.stringify({ 'filter' : { 'dollar_exists' : { 'name': true} } } );
            });
            LergoMiddleware.queryObjParsing( request, response, next );

            expect(JSON.stringify(request.queryObj)).to.be('{"filter":{"$exists":{"name":true}}}');
        });

        it.only('should handle invalid input', function(){
            request.param = sinon.spy(function(){
                return JSON.stringify({  'dollar_exists' : { 'name': true} }  );
            });

            LergoMiddleware.queryObjParsing( request, response, next );
            expect(request.queryObj).not.to.be(undefined);
            expect(response.status.calledWith(400)).to.be(false);
            expect(response.send.calledWith(' lergo middleware - illegal filter value : Cannot read property \'limit\' of undefined<br/> {"dollar_exists":{"name":true}}')).to.be(false);
        });

    });

});




