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

    Class.find = function (filter, projection, callback) {

        if ( typeof(projection) === 'function'){
            callback = projection;
            projection = {};
        }

        Class.connect( function (db, collection) {
            collection.find(filter, projection).toArray(callback);
        });
    };
}

module.exports.enhance = enhance;