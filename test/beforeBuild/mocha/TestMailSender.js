'use strict';
//var path = require('path');
//var assert = require('assert');
var conf = require('../../../backend/services/Conf');
var service = require('../../../backend/services/LergoEmailService');
var logger = require('log4js').getLogger('TestMailSender');

logger.info('loaded services');

describe('LergoMailSender', function(){
    describe('#sendMail', function(){
        xit('should send an email', function(done){ // todo: need to fix this.. gmail revoked our unit test account.
            this.timeout(30000);
            service.sendMail({'to' : conf.tests.TestMailSender.to,'subject':'test once more!  ' + new Date().toString() }, function(err){
                if ( !!err ){
                    throw err;
                }
                done();

            });
        });
    });
});




