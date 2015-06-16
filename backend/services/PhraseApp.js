'use strict';
// view-source:https://phraseapp.com/api/v1/translations/download?auth_token=763e0c5319edc79ae9392fc0d498fea9&locale_name=en&format=nested_json

var conf = require('./Conf');

var logger = require('log4js').getLogger('PhraseApp');
var Client = require('node-rest-client').Client;
var client = new Client();

if ( conf.translations.method === 'phraseapp' && !conf.translations.phraseAppToken){
    throw new Error('need to configure phraseapp token');
}


exports.getTranslation = function( locale, callback  ){
    var args = {
        path : {
            locale: locale,
            token: conf.translations.phraseAppToken
        }
    };
    logger.info('getting translations', JSON.stringify(args));
    logger.info('using url', conf.translations.url);
    client.get(conf.translations.url, args,  callback);
};