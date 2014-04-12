var logger = require('log4js').getLogger('ConfManager');
var path = require('path'),
    appDir = path.dirname(require.main.filename);

var publicConfiguration = {
	'title' : 'Hello World'
};

var privateConfiguration = {
	'cookieSessionSecret' : undefined,
	'dbUrl' : undefined,
	'emailConfService' : undefined,
	'emailConfUser' : undefined,
	'emailConfPass' : undefined
};

var meConf = null;
try {
	var meConfPath = path.join(appDir, 'conf/dev/meConf');
	logger.info('trying to find me conf at [%s]', path.resolve(meConfPath));
	meConf = require(meConfPath);
} catch (e) {
    logger.info('meConf does not exist. ignoring.. ');
}

var publicConfigurationInitialized = false;
var privateConfigurationInitialized = false;

function getPublicConfiguration() {
	if (!publicConfigurationInitialized) {
		publicConfigurationInitialized = true;
		if (meConf !== null) {
			for ( var i in publicConfiguration) {
				if (meConf.hasOwnProperty(i)) {
					publicConfiguration[i] = meConf[i];
				}
			}
		}
	}
	return publicConfiguration;
}

function getPrivateConfiguration() {
	if (!privateConfigurationInitialized) {
		privateConfigurationInitialized = true;

		var pubConf = getPublicConfiguration();

		if (pubConf !== null) {
			for ( var j in pubConf) {
				privateConfiguration[j] = pubConf[j];
			}
		}
		if (meConf !== null) {
			for ( var i in meConf) {
				privateConfiguration[i] = meConf[i];
			}
		}
	}
	return privateConfiguration;

}

exports.sendPublicConfiguration = function(req, res) {
	var name = req.param('name') || 'conf';

	res.send('window.' + name + ' = ' + JSON.stringify(getPublicConfiguration()) + ';');
};

var prConf = getPrivateConfiguration();
if (prConf !== null) {
	for ( var i in prConf) {
		if (prConf[i] === undefined) {

			throw new Error('undefined configuration [' + i + ']');
		}
		exports[i] = prConf[i];
	}
}
