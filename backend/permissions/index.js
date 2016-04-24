'use strict';

var logger = require('log4js').getLogger('index');
var _ = require('lodash');
var Role = require('../models/Role');

exports.lessons = require('./LessonsPermissions');
exports.questions = require('./QuestionsPermissions');
exports.users = require('./UsersPermissions');
exports.reports = require('./ReportsPermissions');
exports.helperContents = require('./HelperContentsPermissions');

exports.roles = require('./RolesPermissions');

exports.abuseReports = require('./AbuseReportsPermissions');
exports.faqs = require('./FaqsPermissions');
exports.misc = require('./MiscPermissions');


// generically add authorization
//
exports._instrumentPermissions = function(){
    logger.trace('instrumenting permissions');
    _.each(exports, function( permissions, section  ){ // for each section

        if ( section.indexOf('_') === 0 ){ // skip private functions
            return;
        }
        _.each(permissions, function(permission, name ){

            if ( name.indexOf('userCan') !== 0 ){
                logger.trace('skipping ', section, name);
                return;
            }

            logger.trace('instrumenting', section, name);

            permissions[name] = _.wrap(permission, function(fn, user ){
                [].shift.apply(arguments);

                logger.debug('this is used permissions', (user && user.permissions ) || 'no user found on request');

                return   ( user && ( user.isAdmin ||
                    user.permissions.indexOf( Role.getPermissionName( section,  name ) ) >= 0 ) ) ||
                    fn.apply(undefined, arguments);
            });
        });
    });
};

exports._instrumentPermissions();
