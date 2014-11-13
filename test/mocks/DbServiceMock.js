'use strict';

var services = require('../../backend/services');
var logger = require('log4js').getLogger('DbServiceMock');

var dbCollection = {

    insert: function( obj, callback ){
        logger.info('inserting', obj);
        callback();
    }

};

services.db = {
    id: function(value){ return value; },
    connect: function(collection, callback){
        logger.info('mock connects',collection);
        callback( {}, dbCollection );
    }
};
