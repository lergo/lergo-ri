'use strict';
/**
 * @module RolesManager
 * @type {Logger}
 */

// since this is a manager, we cannot simply require('./index');
// we need to use setTimeout( function(){ managers = require('./index'); },0);
// hopefully this will cause the event loop to execute after index.js is initialized.

var logger = require('log4js').getLogger('RolesManager');
var services = require('../services');
var errorManager = require('./ErrorManager');
var usersManager = require('./UsersManager');
var _ = require('lodash');
var Role = require('../models/Role');


exports.getRole = function (filter, callback) {
    logger.info('Fetching role by ID', JSON.stringify(filter));
    services.db.connect('roles', function (db, collection) {
        collection.findOne(filter, function (err, item) {
                if (!!err) {
                    logger.error('unable to query for role [%s]', err.message);
                    callback(null, item);
                } else {
                    callback(err, item);
                }
            }
        );
    });
};