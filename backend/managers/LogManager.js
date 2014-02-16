'use strict';
var log4js = require('log4js');
var logger = log4js.getLogger('LogManager');
logger.info('initializing LogManager');

log4js.configure({
    appenders: [
        { type: 'console' }
    ],
    replaceConsole: true
});

exports.configure = function (newConfig) {
    log4js.configure(newConfig);
};

exports.getLogger = function (name) {
    if (!name) {
        throw new Error('logger must have a name');
    }
    return log4js.getLogger(name);
};