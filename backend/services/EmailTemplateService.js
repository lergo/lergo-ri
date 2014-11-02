'use strict';
var logger = require('log4js').getLogger('EmailTemplateService');

// loading this module asynchronous.
// this might not be best practice - as we might get requests that require email
// before templates are loaded, but I prefer it this way as this does not hand start time
// for 80% of the scenarios.

exports.load = function( templatesDir, callback ){
    if ( !callback ){
        callback = function(){};
    }
    setTimeout( function(){
        var emailTemplates = require('email-templates');
        emailTemplates(templatesDir, function(err, template) {
            if (!!err ) {
                logger.error('error while trying to load email templates', err);
                throw err;
            }
            logger.info('loaded email templates successfully');
            exports.template = template;
            callback();
        });
    },0);
};


/**
 *
 *
 *
 *
 * @param locals = {
 *     "name" : "__user name",
 *     "link" : "__reset password link",
 *     "lergoLogoAbsoluteUrl" : "absolute url to lergo image",
 *     "lergoLink" : "link to lergo site"
 *
 * }
 * @param callback
 */

exports.renderReportReady = function( locals, callback ){
    exports.template('lessonReportReady', locals, callback );
};

exports.renderResetPassword = function( locals  , callback ){
    exports.template('resetPassword', locals, callback );
};

exports.renderLessonInvitation = function( locals, callback ){
    exports.template('lessonInvite', locals, callback );
};

exports.renderUserValidationEmail = function( locals, callback ){
    exports.template('validateUser', locals, callback );
};

exports.renderAbuseReportEmail = function( locals, callback ){
    exports.template('reportAbuse', locals, callback );
};

exports.renderAbuseReportAdminEmail = function( locals, callback ){
    exports.template('reportAbuseAdmin', locals, callback );
};
