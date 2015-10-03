'use strict';
/*jshint -W079 */
var db = require('../services/DbService');
var logger = require('log4js').getLogger('AbstractModel');

// adds static functions and prototype functions on a class
function enhance( Class ) {

    if ( !Class.collectionName){
        logger.error(Class.name + ' has no collectionName defined');
        throw Class.name + ' has no collectionName defined';
    }

    Class.connect = function( callback ){
        db.connect(Class.collectionName, callback);
    };

    Class.findById = function (id, projection, callback ) {
        if ( typeof(projection) === 'function'){
            callback = projection;
            projection = {};
        }
        Class.findOne( {'_id' : db.id(id)} , projection, callback );
    };

    Class.findOne = function(filter, projection, callback ){

        if ( typeof(projection) === 'function'){ // projection must be the callback, replace with empty object
            callback = projection;
            projection = {};
        }

        Class.connect( function( db, collection ){
            collection.findOne(filter, projection,callback);
        });
    };

    Class.find = function (filter, projection, options, callback) {

        if ( typeof(projection) === 'function'){
            callback = projection;
            projection = {};
        }

        if ( !options ){
            options = {};
        }

        if ( typeof(options) === 'function' ){
            callback = options;
            options = {};
        }

        if ( !callback ){
            throw new Error('expected signature find(filter,projection,callback)');
        }

        Class.connect( function (db, collection) {
            collection.find(filter, projection, options).toArray(callback);
        });
    };

    Class.count = function (filter, callback) {

        if ( typeof(filter) === 'function'){
            callback = filter;
            filter = {};
        }

        Class.connect( function (db, collection) {
            collection.count(filter, callback );
        });
    };


    Class.prototype.update = function( callback ){
        logger.info('updating ' + this.collectionName );
        var self = this;
        this.data._id = db.id(this.data._id);
        Class.connect(function (db, collection) {
            logger.info('connected. running update', self.data._id);
            collection.update({ '_id': self.data._id}, self.data, callback || function(){ logger.info('updated successfully'); });
        });
    };

    Class.prototype.remove = function( callback ){
        logger.info('removing ' + this.collectionName );
        var self = this;
        this.data._id = db.id(this.data._id);
        Class.connect(function( db, collection){
            logger.info('connected. removing', self.data._id);
            collection.remove({ '_id' : self.data._id }, callback || function(){ logger.info('removed successfully');});
        });
    };
}

module.exports.enhance = enhance;