'use strict';

var logger = require('log4js').getLogger('index');
var _ = require('lodash');

exports.lessons = require('./LessonsPermissions');
exports.questions = require('./QuestionsPermissions');
exports.users = require('./UsersPermissions');
exports.app = require('./AppPermissions');
exports.reports = require('./ReportsPermissions');
exports.helperContents = require('./HelperContentsPermissions');



// generically add authorization

function instrumentPermissions(){
    logger.trace('instrumenting permissions');
    _.each(exports, function( permissions, section  ){ // for each section
        _.each(permissions, function(permission, name ){

            if ( name.indexOf('userCan') !== 0 ){
                logger.trace('skipping ', section, name);
                return;
            }

            logger.trace('instrumenting', section, name);

            permissions[name] = _.wrap(permission, function(fn, user ){
                if ( typeof(user.isAllowed) !== 'function' ){
                    throw new Error('permissions wrapper: first arguments is not a user');
                }
                [].shift.apply(arguments);
                return permission.apply(arguments);
            })
        })
    });
}

instrumentPermissions();
