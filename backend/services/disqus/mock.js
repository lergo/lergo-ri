'use strict';
var logger = require('log4js').getLogger('disqusMock');

exports.configure = function(/*conf*/){
    logger.info('configuring');
};