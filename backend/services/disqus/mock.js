'use strict';
var logger = require('log4js').getLogger('disqusMock');

exports.configure = function(/*conf*/){
    logger.info('configuring');
};

exports.signMessage = function () {
    return '123';
};

exports.ssoObj = function(){
    logger.info('mock returns sso obj');
    return {
        pubKey: '',
        auth: ''
    };
};
