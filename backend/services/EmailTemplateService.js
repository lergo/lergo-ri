'use strict';
var logger = require('log4js').getLogger('EmailTemplateService');

var _templatesDir;

// loading this module asynchronous.
// this might not be best practice - as we might get requests that require email
// before templates are loaded, but I prefer it this way as this does not hand start time
// for 80% of the scenarios.

exports.load = function( templatesDir, callback ){
    _templatesDir = templatesDir;
    if ( !callback ){
        callback = function(){};
    }
    // guy - todo - check if we still need this
    setTimeout( function(){
        var emailTemplates = require('email-templates');
        emailTemplates(templatesDir, function(err, template) {
            if (!!err ) {
                logger.error('error while trying to load email templates', err);
                throw err;
            }
            logger.info('loaded email templates successfully');
            exports.templateFunc = template;
            callback();
        });
    },0);
};

// guy - seems that saving a reference to 'template' function like we did in `load` causes trouble when function is used in parallel
exports.template = function (name, locals, callback) {

    require('email-templates')(_templatesDir, function (err, template) {
        if (!!err) {
            logger.error('error while trying to load email templates', err);
            throw err;
        }
        template(name, locals, callback);
    });
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
