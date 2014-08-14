'use strict';
var crypto = require('crypto');


var conf = {};


exports.validateConfiguration = function() {
    if (!conf.apiKey) {
        throw new Error('key is missing');
    }

    if ( !conf.apiSecret){
        throw new Error('secret key is missing');
    }
};

exports.configure = function( _conf  ){
    conf = _conf;
};



// see link for diqus documentation.
// https://help.disqus.com/customer/portal/articles/236206
exports.signMessage = function( message, timestamp ){
    exports.validateConfiguration();
    return crypto.createHmac('sha1', conf.apiSecret).update(message + ' ' + timestamp ).digest('hex');
};

exports.getTimestamp = function(){
    return Math.round(+new Date() / 1000);
};

/**
 *
 * @param data
 *
 * = {
 *          id : id,
 *          username : username,
 *          email : email
 * }
 * @returns {{pubKey: (apiKey|*|Document.apiKey), auth: string}}
 */
exports.ssoObj = function( data ){
    var dataStr = new Buffer(JSON.stringify(data)).toString('base64');
    var timestamp = exports.getTimestamp();
    var signedStr = exports.signMessage(dataStr, timestamp );

    return {
        pubKey : conf.apiKey,
        auth: dataStr + ' ' + signedStr + ' ' + timestamp
    };
};