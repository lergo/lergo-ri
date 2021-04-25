'use strict';

/**
 * @module LergoEmailService
 * @type {exports}
 */

var nodemailer = require('nodemailer');
var emailSettings = require('./Conf').emailSettings;
var logger = require('log4js').getLogger('LergoEmailService');
var ses = require('nodemailer-ses-transport'); // for nodemailer 3.x

/**
 *
 *
 * // setup e-mail data with unicode symbols
 * var mailOptions = {
 *    from: "__from__",
 *    to: "__to__",
 *    subject: "__subject__",
 *    text: "__text__",
 *    html: "__html__"
 * }
 *
 *
 * @returns {*}
 */

/**
 * create a transport for sending mails
 * transport for nodemailer 3.x
 */

function getTransport() {
 var smtpTransport = nodemailer.createTransport(ses(emailSettings.opts));
 return smtpTransport;
 }

/**
 * This method sends mail as per the opts give opts structure should look like
 *
 * opts{ To: CC: bcc: subject: text: html: }
 */

exports.sendMail = function (opts, callback) {
    var transport = getTransport();
    logger.info(`sending email to: ${opts.to}`);
    if (!opts.hasOwnProperty('from')) {
        opts.from = emailSettings.defaultFrom;
    }
    transport.sendMail(opts, function (error) {
        if (!!error) {
            logger.error('error in sending mail   to : [%s]', opts.to, JSON.stringify(error));
            callback(error);
        } else {
            logger.info('Message sent');
            transport.close();
            callback(null);
        }
    });
};
