'use strict';

var logger = require('log4js').getLogger('permissions');
var _ = require('lodash');
var Role = require('../models/Role');

exports.lessons = require('./LessonsPermissions');
exports.playLists = require('./PlayListsPermissions');
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

            var limitsFunction = null;
            logger.trace('getting limits functions name');
            var limitsFunctionName = name.replace('userCan','limitUser');
            if ( permissions.hasOwnProperty(limitsFunctionName) && typeof(permissions[limitsFunctionName]) === 'function'){
                logger.trace('found limit function ' + section + '::' + limitsFunctionName);
                limitsFunction = permissions[limitsFunctionName];
            }else{
                logger.trace('did not find a limits function ' + section + '::' + limitsFunctionName );
                limitsFunction = function(){ return false; }; // by default, not limited..
            }

            logger.trace('instrumenting', section, name);

            permissions[name] = _.wrap(permission, function(fn, user ){
                [].shift.apply(arguments);

                logger.debug('this is used permissions', (user && user.permissions ) || 'no user found on request');

                // a user is allowed to do something in lergo given one of the following
                // 1 - they are admin
                // 2 - they have permissions and are not limited
                // 3 - per subject logic (e.g. owners of the lesson etc..)

                return ( user && ( user.isAdmin ||
                    ( user.permissions.indexOf(Role.getPermissionName(section, name)) >= 0 && !limitsFunction.apply(undefined, arguments) ) ) ) ||
                    fn.apply(undefined, arguments);
            });
        });
    });
};

exports._instrumentPermissions();
