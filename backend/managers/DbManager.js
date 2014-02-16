'use strict';
var appContext = require('../ApplicationContext');
var MongoClient = require('mongodb').MongoClient;
var logger = appContext.logManager.getLogger('DbManager');

logger.info('initializing DbManager');
var _dbUrl = null;

exports.setUrl = function (dbUrl) {
    _dbUrl = dbUrl;
};

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
            logger.info('catching error, closing connection');
            db.close();
        }
    });
};


exports.drop = function () {
    exports.connect(null, function (db, collection, done) {
        db.dropDatabase();
        done();
    });
};
