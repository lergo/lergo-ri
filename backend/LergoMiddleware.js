'use strict';

var logger = require('log4js').getLogger('LergoMiddleware');

exports.origin = function origin( req, res, next){
    var _origin = req.protocol + '://' +req.get('Host')  ;
    req.origin = _origin;

    // expects a URL from root "/some/page" which will result in "protocol://host:port/some/page"
    req.absoluteUrl = function( relativeUrl ){
        return _origin + relativeUrl;
    };
    next();
};

/**
 * puts "emailResources" on the request filled with common emailResources
 * @param req - the request
 * @param res - the response
 * @param next - next in middleware chain
 */
exports.emailResources = function emailResources( req, res, next ){
    req.emailResources = {
        'lergoBaseUrl' : req.absoluteUrl(''),
        'lergoLink' : req.absoluteUrl('/'),
        'lergoLogoAbsoluteUrl' : req.absoluteUrl('/emailResources/logo.png')
    };
    next();
};


exports.addGetQueryList = function addGetQueryList ( req, res, next ){

    req.getQueryList = function(key){
        // return a query param as list. using [].concat hack to handle case where the value is not a list
        return req.query.hasOwnProperty(key) ? [].concat(req.query[key]) : [];
    };
    next();

};


/**
 * this middleware will make sure the query holds values 'limit','skip' etc.. for queries.
 * if checks if they already exist on the request. if not it will initialize them with defaults.
 * it will also make sure values are not exaggerated.
 *
 * @param req
 * @param res
 * @param next
 */
exports.queryParamsDefault = function queryParamsDefault(req, res, next ){
    logger.debug('query params default');
    // will limit the maximum value allowed. not relevant to all parameters
    function limitMax( paramName, defaultValue ){
        var paramValue = req.param(paramName);
        req.query[paramName] =  Math.min(defaultValue, parseInt(paramValue,10));
    }

    // will limit the minimum value allowed.
    function limitMin( paramName, defaultValue ){
        var paramValue = req.param(paramName);
        req.query[paramName] =  Math.max(defaultValue, parseInt(paramValue,10));
    }

    // will make sure to initialize with default value
    function putDefaultValue( paramName, defaultValue ){
        try {
            var paramValue = req.param(paramName);
            if (paramValue === null || paramValue === undefined || isNaN(parseInt(paramValue,10))) {
                req.query[paramName] = defaultValue;
            }
        }catch(e){
            logger.error('unable to handle query param ', paramName,e );
        }
    }

    try {

        putDefaultValue('_limit', 3000);
        limitMax('_limit',3000); // don't allow more than 3000;

        putDefaultValue('_skip', 0);
        limitMin('_skip',0);
    }catch(e){
        logger.error('error while handling params default');

    }

    next();


};

