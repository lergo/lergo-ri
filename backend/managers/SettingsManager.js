'use strict';
var services = require('../services');
var errorManager = require('./ErrorManager');
var logger = require('log4js').getLogger('SettingsManager');
//var path = require('path');
    /*appDir = path.dirname(require.main.filename); */

var settings = null;


// initialize settings - try to find one in database. if not found, insert empty.
services.db.connect('settings', function( db, collection, done){
    collection.findOne({}, function(err, result){
        if ( !!err ){
            logger.error('unable to load settings : ' + err.message);
            done();
            return;
        }

        if ( !result ){
            logger.error('could not find settings, creating new');
            collection.insert({}, function( err, result ){
                if ( !! err ){
                    logger.error('unable to insert settings : ' + err.message);
                    done();
                    return;
                }

                if ( !result ){
                    logger.error('insert settings did not have errors, but not object was created');
                    done();
                    return;
                }

                settings = result;
            } );
            return;
        }

        settings = result;
        logger.info('settings loaded successfully');
        logger.info(JSON.stringify(settings));
        done();
    });
});

exports.saveSettings = function( settings, callback ){
    services.db.connect('settings', function(db, collection,done){
        collection.updateOne({'_id' : settings._id }, settings, function(err/*, result*/){
            if ( !!err ){
                logger.error('error while saving ');
                callback( new errorManager.InternalServerError(err,'unable to save settings'), null );
                done();
                return;
            }

            logger.info('settings saved successfully');
            done();
            return;
        });
    });
};


exports.getSettings = function(){ return settings; };
