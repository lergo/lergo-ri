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

        // to delete the 'complete' the filter key / value pairs must be exact
        // until we know the score, we will just erase the key 
        var keyScore = 'itemScore';
        //var keyReportId = 'itemReportId';
        delete filter[keyScore];
        //delete filter[keyReportId];

        Class.connect( function( db, collection ){
            collection.findOne(filter, projection,callback);
        });
    };

    Class.find = function (filter, projection, options, callback) { // Third parameter to `find()` must be a callback or undefined
      
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
        options.projection = projection;    
        Class.connect( function (db, collection) {
            collection.find(filter, options).toArray(callback);
        });
    };

    Class.count = function (filter, callback) {

        if ( typeof(filter) === 'function'){
            callback = filter;
            filter = {};
        }

        Class.connect( function (db, collection) {
            collection.countDocuments(filter, callback );
        });
    };

    Class.aggregate = function (aggregation, callback) {
        Class.connect(function (db, collection) {
            collection.aggregate(aggregation, callback);
        });
    };


    Class.prototype.update = function( callback ){ 
        logger.info('updating');
        var self = this;
        var selfData = self.data;
        this.data._id = db.id(this.data._id);
        // updateOne does not update a field that has been removed, it only updates fields that have been changed
        // so we need to have a new value for invites - finished, because it is not simple to remove the field directl
        // and there is the issue of reports finished and invites "finished"
        if (selfData.finished === null) {
            Class.connect(function (db, collection) {
                logger.info('connected. removing finished field', self.data._id);
                collection.updateOne({ '_id': self.data._id}, { $unset: {finished: ''}}, callback || function(){ logger.info('updated successfully'); });
            });
        } else {
            Class.connect(function (db, collection) {
                logger.info('connected. running update', self.data._id);
                collection.updateOne({ '_id': self.data._id}, {$set: selfData}, callback || function(){ logger.info('updated successfully'); });
            });
        }
    };

    Class.prototype.remove = function( callback ){
        logger.info('removing ' + this.collectionName );
        var self = this;
        this.data._id = db.id(this.data._id);
        Class.connect(function( db, collection){
            logger.info('connected. removing', self.data._id);
            collection.deleteOne({ '_id' : self.data._id }, callback || function(){ logger.info('removed successfully');});
        });
    };
}

module.exports.enhance = enhance;
