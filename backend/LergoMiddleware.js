'use strict';

/**
 *
 * @description
 * a collection of middlewares for Lergo convenience
 *
 * @module LergoMiddleware
 * @type {Logger}
 */
var logger = require('log4js').getLogger('LergoMiddleware');
var _ = require('lodash');
var util = require('util');
var services = require('./services');

/**
 *
 * @description
 * adds an <code>absoluteUrl</code> function on request
 *
 * <pre>
 *    var absoluteUrl = req.absoluteUrl('/myRelativeUrl'); //==> http://my.domain/myRelativeUrl
 * </pre>
 *
 * and variable <code>origin</code> on request which will be equals to <code>http://my.domain</code>
 *
 * @param {object}   req the request
 * @param {object}   res the response
 * @param {function} next next middleware to operate
 */
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
 * @description
 *
 *     puts <code>emailResources</code> on the request filled with common emailResources
 *
 * @see EmailResources
 * @param {object}   req - the request
 * @param {object}   res - the response
 * @param {function} next - next in middleware chain
 */
exports.emailResources = function emailResources( req, res, next ){
    exports.origin(req, res, function () {
        req.emailResources = {
            'lergoBaseUrl': req.absoluteUrl(''),
            'lergoLink': req.absoluteUrl('/'),
            'lergoLogoAbsoluteUrl': req.absoluteUrl('/emailResources/logo.png')
        };
        logger.debug('emailResources calling next');
        next();
    });

};


/**
 *
 * @description
 * adds a function on request to get values as list while defaulting to an empty list instead of undefined/null.
 *
 *
 * @param {object}   req the request
 * @param {object}   res the response
 * @param {function} next next middleware to operate
 */
exports.addGetQueryList = function addGetQueryList ( req, res, next ){

    /**
     *
     * @param key key to get from query on request
     * @returns {Array} of values found on request matching the key
     */
    req.getQueryList = function(key){
        // return a query param as list. using [].concat hack to handle case where the value is not a list
        return req.query.hasOwnProperty(key) ? [].concat(req.query[key]) : [];
    };
    next();

};


/**
 * @description
 * this middleware will make sure the query holds values 'limit','skip' etc.. for queries.
 * if checks if they already exist on the request. if not it will initialize them with defaults.
 * it will also make sure values are not exaggerated.<br/>
 *
 *
 * @param {object}   req the request
 * @param {object}   res the response
 * @param {function} next next middleware to operate
 */
exports.queryParamsDefault = function queryParamsDefault(req, res, next ){
    logger.debug('query params default');
    // will limit the maximum value allowed. not relevant to all parameters
    function limitMax( paramName, defaultValue ){
        var paramValue = req.param(paramName);
        if ( !isNaN(paramValue) ) {
            req.query[paramName] = Math.min(defaultValue, parseInt(paramValue, 10));
        }else{
            req.query[paramName] = defaultValue;
        }
    }

    // will limit the minimum value allowed.
    function limitMin( paramName, defaultValue ){
        var paramValue = req.param(paramName);
        if ( !isNaN(paramValue) ){
            req.query[paramName] =  Math.max(defaultValue, parseInt(paramValue,10));
        }else{
            req.query[paramName] =  defaultValue;
        }

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

/**
 *
 * @description this function returns a middleware to escape regexp special characters and puts the output on request query and requests params arrays.
 *
 * @param paramName parameter name to search on request and replace with escaped value
 * @returns {function} puts escaped strings on req.query and req.params
 */
exports.escapeRegExp = function (paramName) {
    return function escapeRegExp(req, res, next) {
        var paramValue = req.param(paramName);
        if (!!paramValue) {
            req.params[paramName] = require('escape-string-regexp')(paramValue);
            req.query[paramName] = require('escape-string-regexp')(paramValue);
            logger.info(paramName, req.param(paramName));

        }
        next();
    };
};

/**
 *
 * @description
 * a function to deeply iterate over objects, and invoke an operator on the key,
 * replacing the key with the one from the operator.
 *
 * @param newObj object with new keys
 * @param oldObj object with old keys
 * @param {function} func an operator
 */
exports.renameKey = function (newObj, oldObj, func) {
    _.each(oldObj, function (value, key) {
        var newKey = func(key);
        if (typeof(value) === 'object' && !util.isArray(value)) {
            newObj[newKey] = {};
            exports.renameKey(newObj[newKey], oldObj[key], func);
        } else {
            newObj[newKey] = value;
        }
    });

};

/**
 *
 * @description
 * a function to replace all object's keys from 'dollar_key' to '$key'
 *
 * @param obj object containing keys to replace
 * @returns {object} newObject an object with keys after they were replaced with '$'.
 */
exports.replaceDollarPrefix = function( obj ){
    var newObj = {};

    function renameFunc( oldKey ) {
        if (oldKey.indexOf('dollar_') === 0) {
            return '$' + oldKey.substring('dollar_'.length);
        }
        return oldKey;
    }

    exports.renameKey( newObj, obj, renameFunc );


    return newObj;
};

/**
 *
 * @description
 * this middleware handles a stringified query obj for mongo.
 * handles some obvious values (like limit) and makes sure no one is trying to collapse the system
 *
 * @param {object}   req
 * @param {object}   res
 * @param {function} next
 */

exports.queryObjParsing = function queryObjParsing ( req, res, next ){
    try {

        logger.debug('manipulating query object on request');
        if ( !req.param('query')){
            res.status(400).send('query obj required but missing on request');
            return;
        }

        var queryObj = req.param('query');
        if ( typeof(queryObj) === 'string' ){
            queryObj = JSON.parse(queryObj);
        }

        try {
            if (queryObj.filter.hasOwnProperty('userId')){
                queryObj.filter.userId = services.db.id(queryObj.filter.userId);
            }
        }catch(e){
            logger.info('unable to convert userId to object',e);
        }

        queryObj = exports.replaceDollarPrefix(queryObj);

        if ( !!queryObj.$page ){
            queryObj.skip = queryObj.$page.size * ( queryObj.$page.current - 1) ;
            queryObj.limit = queryObj.$page.size; // todo: seems like a duplication
            delete queryObj.$page;
        }

        // validate limit exists
        if ( queryObj.filter.limit > 200  ){   // todo: seems like a duplication
            queryObj.filter.limit = 200;
        }

        req.queryObj = queryObj;
        next();
    }catch(e){
        res.status(400).send(' lergo middleware - illegal filter value : ' + e.message + '<br/> ' + req.param('query'));
        return;
    }
};

