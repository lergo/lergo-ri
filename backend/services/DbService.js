'use strict';

/**
 * @module DbService
 * @type {exports}
 */

var conf = require('./Conf');
var mongodb = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var logger = require('log4js').getLogger('DbService');


var _dbUrl = conf.dbUrl;
var col = _dbUrl.split('/');
var collection = col.pop();


var dbConnection = null;
function getDbConnection( callback ){

    if ( !!dbConnection && dbConnection !== null ){
        //logger.debug('using cached connection');
        callback(null, dbConnection);
    }else{
        MongoClient.connect( _dbUrl, { useNewUrlParser: true, useUnifiedTopology: true }, function(err,client){
            var db = client.db(collection);
            dbConnection = db;
            callback(err,db);
        });
    }
}

// needed for extreme cases such as usage of 'eval'. See User.getUserAndPermissions
exports.getDbConnection = getDbConnection;

logger.info('initializing DbService :: ' , _dbUrl );


// add an easy way to turn a result to map
exports.toMap = function( cursor, callback ){
    logger.info('turning result to map');
    var result = {};
    cursor.forEach(function(doc){
        logger.debug('handling doc', doc);
        result[doc._id.toHexString()] = doc;
    }, function(error) {
        callback(error, result);
    });
};


/**
 *
 * @param collection - name of collection. nullable
 * @param callback = function(db, collection, doneFn)
 */
exports.connect = function (collection, callback) {
    getDbConnection( function (err, db) {

        var _collection = null;
        if (err) {
            throw err;
        }
        //logger.debug('connected to db successfully');

        try {
            if (collection) {
                //logger.debug('opening connection on [' + collection + ']');
                _collection = db.collection(collection);
                //logger.debug('connection open');

            }else{
                logger.warn('opening connection without collection');
            }
            // GUY - 'done' was once used for closing the connection.
            // turns out we don't need to close the connection..
            // see documentation - http://mongodb.github.io/node-mongodb-native/driver-articles/mongoclient.html#mongoclient-connection-pooling
            // so you can ignore 'done' from now on and we can get read of it.
            callback(db, _collection, /**done**/function () {
                /*logger.info('closing connection from done');*/
                /* db.close();*/

            });

        } catch (e) { // close if got an error
            /*logger.error('catching error, closing connection',e);*/
            /* db.close();*/
            throw e;

        }
    });
};

/**
 * will convert a string or list of strings to mongo objectID.
 * in case it is already a mongo objectID, it is left untouched
 * @param id
 * @returns mongo objectID or array of mongo objectID.
 */
exports.id = function( id ){
    try {
        if (typeof(id) === 'string') {
            return mongodb.ObjectID(id);
        } else if (Array.isArray(id)) {
            id = id.map(function (idString) {
                if (typeof(idString) === 'string') {
                    return mongodb.ObjectID(idString);
                } else {
                    return idString;
                }
            });
            return id;
        }
        return id;
    }catch(e){
        logger.error('unable to convert to objectId',id);
        throw e;
    }
};

exports.drop = function () {
    exports.connect(null, function (db, collection, done) {
        db.dropDatabase();
        done();
    });
};


