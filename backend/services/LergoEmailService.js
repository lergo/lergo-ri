var nodemailer = require('nodemailer');
var emailSettings = require('./Conf').emailSettings;
var logger = require('log4js').getLogger('LergoEmailService');

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
 */
function getTransport() {
    logger.info(emailSettings.type, emailSettings.opts);
	var smtpTransport = nodemailer.createTransport(emailSettings.type, emailSettings.opts);
	return smtpTransport;
}



/**
 * This method sends mail as per the opts give opts structure should look like
 * 
 * opts{ To: CC: bcc: subject: text: html: }
 */

exports.sendMail = function(opts, callback) {
	var transport = getTransport();

    if ( !opts.hasOwnProperty('from') ){
          opts.from = emailSettings.defaultFrom;
    }

    logger.info(opts);


    transport.sendMail( opts, function( error, response ) {
		if ( !!error ) {
			logger.error('error in sending mail   to : [%s]', opts.to);
			callback(error);
		} else {
			logger.info('Message sent: ' + response.message);
			transport.close();
			callback(null);
		}
	});
};
