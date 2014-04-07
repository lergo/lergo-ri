var nodemailer = require('nodemailer');
var appContext = require('../ApplicationContext');
var logger = appContext.logManager.getLogger('LergoEmailService');
var emailConfService = appContext.conf.emailConfService;
var emailConfUser = appContext.conf.emailConfUser;
var emailConfPass = appContext.conf.emailConfPass;

/**
 * create a transport for sending mails
 */
function getTransport() {
	var smtpTransport = nodemailer.createTransport('SMTP', {
		Service : emailConfService,
		auth : {
			user : emailConfUser,
			pass : emailConfPass
		}
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
	transport.sendMail(opts, function(error, response) {
		if (error) {
			logger.error('error in sending mail   to : [%s]', opts.to);
			callback(error);
		} else {
			logger.info('Message sent: ' + response.message);
			transport.close();
			callback(null);
		}
	});
};
