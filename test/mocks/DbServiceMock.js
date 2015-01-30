'use strict';

var services = require('../../backend/services');
var logger = require('log4js').getLogger('DbServiceMock');

var dbCollection = {

    insert: function( obj, callback ){
        logger.info('inserting', obj);
        callback();
    }

};

function ObjectId( myValue ){

    this.value = myValue;

    this.equals = function( other ){
        return this.value === other.value;
    };
}

// we have to override the methods like this
// because only this way it will support both "require(services).db" and "require(service/db)"
services.db.id = function(value){
    return new ObjectId(value);
};

services.db.connect =  function(collection, callback){
    logger.info('mock connects',collection);
    callback( {}, dbCollection );
};
