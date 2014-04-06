var crypto = require('crypto');
var sha1 = require('sha1');
var algorithm = 'aes256'; // or any other algorithm supported by OpenSSL

/** todo: make this configurable **/
var key = 'password';


exports.encrypt = function (text) {
    var cipher = crypto.createCipher(algorithm, key);
    var encrypted = cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
    return encrypted;
};

exports.decrypt = function( text ){
    var decipher = crypto.createDecipher(algorithm, key);
    var decrypted = decipher.update(text, 'hex', 'utf8') + decipher.final('utf8');
    return decrypted;
};

exports.digest = function( text ){
    return sha1(text);
};
