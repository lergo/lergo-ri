


exports.configure = function( conf ){
    if ( !!conf.enabled ){
        exports.client = require('./Disqus');
        exports.client.configure(conf);
    }else{
        exports.client = require('./mock');
        exports.client.configure(conf);
    }
    return exports;
};

