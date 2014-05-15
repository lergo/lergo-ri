var conf = require('./Conf');

var crypto = require('crypto')
    , key = conf.hmacKey
    , hash;

// items - array of items to include in hmac
exports.createHmac = function ( items ){
    return crypto.createHmac('sha1', key).update(JSON.stringify(arguments)).digest('hex')
};

//
exports.validateHmac = function( hmac, items ){
    return exports.createHmac(items) === hmac;
};