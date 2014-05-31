var emailTemplates = require('email-templates');



var logger = require('log4js').getLogger('EmailTemplateService');


exports.load = function( templatesDir, callback ){
    if ( !callback ){
        callback = function(){};
    }

    emailTemplates(templatesDir, function(err, template) {
        if (!!err ) {
            logger.error('error while trying to load email templates', err);
            throw err;
        }
        logger.info('loaded email templates successfully');
        exports.template = template;
        callback();
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

exports.renderResetPassword = function( locals  , callback ){
    exports.template('resetPassword', locals, callback );
};

exports.renderLessonInvitation = function( locals, callback ){
    exports.template('lessonInvite', locals, callback );
};

exports.renderUserValidationEmail = function( locals, callback ){
    exports.template('validateUser', locals, callback );
};
