'use strict';
//var logger = require('log4js').getLogger('LergoMiddleware');

exports.origin = function( req, res, next){
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
exports.emailResources = function( req, res, next ){
    req.emailResources = {
        'lergoBaseUrl' : req.absoluteUrl(''),
        'lergoLink' : req.absoluteUrl('/'),
        'lergoLogoAbsoluteUrl' : req.absoluteUrl('/emailResources/logo.png')
    };
    next();
};

exports.addGetQueryList = function( req, res, next ){

    req.getQueryList = function(key){
        // return a query param as list. using [].concat hack to handle case where the value is not a list
        return req.query.hasOwnProperty(key) ? [].concat(req.query[key]) : [];
    };
    next();

};

