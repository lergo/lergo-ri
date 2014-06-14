'use strict';

var conf = require('../services/Conf');
var mongodb = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var logger = require('log4js').getLogger('DbManager');


var _dbUrl = conf.dbUrl;


logger.info('initializing DbManager :: ' , _dbUrl );


// add an easy way to turn a result to map
exports.toMap = function( cursor, callback ){
    logger.info('turning result to map');
    var result = {};
    cursor.each(function(err, doc){
        logger.info('handling doc', doc);
        if ( !!err ){
            callback(err);
        }

        if ( doc === null ){
            callback(null, result);
            return;
        }else{
            result[doc._id.toHexString()] = doc;
        }
    });
} ;


/**
 *
 * @param collection - name of collection. nullable
 * @param callback = function(db, collection, doneFn)
 */
exports.connect = function (collection, callback) {
    MongoClient.connect(_dbUrl, {}, function (err, db) {
        logger.info('connected to db successfully');
        var _collection = null;
        if (err) {
            throw err;
        }

        try {
            if (collection) {
                logger.info('opening connection on [' + collection + ']');
                _collection = db.collection(collection);

            }
            callback(db, _collection, /**done**/function () {
                logger.info('closing connection from done');

                db.close();

            });
        } catch (e) { // close if got an error
            logger.error('catching error, closing connection',e);
            db.close();
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
    if ( typeof(id) === 'string') {
        return mongodb.ObjectID(id);
    } else if ( Array.isArray(id) ){
        id = id.map(function (idString) {
            if ( typeof(idString) === 'string') {
                return mongodb.ObjectID(idString);
            }else{
                return idString;
            }
        });
        return id;
    }
    return id;
};


exports.drop = function () {
    exports.connect(null, function (db, collection, done) {
        db.dropDatabase();
        done();
    });
};


