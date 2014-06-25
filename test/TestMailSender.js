'use strict';
//var path = require('path');
var conf = require('../backend/services/Conf');
var service = require('../backend/services/LergoEmailService');
var logger = require('log4js').getLogger('TestMailSender');

logger.info('loaded services');

function doTest() {

    service.sendMail({'to' : conf.tests.TestMailSender.to,'subject':'test once more!'}, function(err){
        if ( !!err ){
            logger.error(err);
        }
        logger.info('test finished successfully');
    });
}


doTest();


