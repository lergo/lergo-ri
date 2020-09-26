'use strict';
// view-source:https://phraseapp.com/api/v1/translations/download?auth_token=763e0c5319edc79ae9392fc0d498fea9&locale_name=en&format=nested_json

var conf = require('./Conf');

var logger = require('log4js').getLogger('PhraseApp');
var request = require('request');

if ( conf.translations.method === 'phraseapp' && !conf.translations.phraseAppToken){
    throw new Error('need to configure phraseapp token');
}


exports.getTranslation = function( locale, callback  ){
    var path  =  {
        locale: locale,
        token: conf.translations.phraseAppToken
    };
    var url = conf.translations.url.replace('{locale}', path.locale).replace('{token}', path.token);
    logger.info('using url', url);
    request(url,function(err, result, body){ callback(body, result); });
};



if ( require.main === module ){

    var prodConf = require(require('path').join(__dirname,'../../conf/prod.json'));
    conf.translations = {
        phraseAppToken : process.env.PHRASEAPP_TOKEN,
        url : prodConf.translations.url
    };
    exports.getTranslation( 'ar' , function(data, result){
        logger.info('got result', data,'and this is headers', result.headers);
    });
}
