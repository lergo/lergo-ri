var nodemailer = require('nodemailer');
var appContext = require('../ApplicationContext');
var logger = appContext.logManager.getLogger('LergoEmailService');


/**
 * create a transport for sending mails
 */
function getTransport() {
    var emailConf = appContext.conf.email;
	var smtpTransport = nodemailer.createTransport('SMTP', {
		service : emailConf.service,
		auth : emailConf.auth
	});
	return smtpTransport;
}

/**
 * This method sends mail as per the opts give opts structure should look like
 * 
 * opts{ To: CC: bcc: subject: text: html: }
 */

exports.sendMail = function(opts, callback) {
	var transport = getTransport();
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
