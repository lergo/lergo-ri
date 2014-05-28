var conf = require('./Conf');

var crypto = require('crypto');
var key = conf.hmacKey;


if ( !key ){
    throw new Error('please define an hmacKey');
}

// items - array of items to include in hmac
exports.createHmac = function ( /*items*/ ){
    return crypto.createHmac('sha1', key).update(JSON.stringify(arguments)).digest('hex');
};

//
exports.validateHmac = function( hmac, items ){
    return exports.createHmac(items) === hmac;
};