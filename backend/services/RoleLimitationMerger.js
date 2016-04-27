'use strict';

var _ = require('lodash');


/**
 * This function implements a mergeWith customizer for lodash
 *
 * Read more at: https://lodash.com/docs#mergeWith
 *
 */
exports.customizer = function( objValue, srcValue ){
    if (_.isArray(objValue) || _.isArray(srcValue) ){
        return _.union(objValue, srcValue);
    }

    if (_.isBoolean(objValue) || _.isBoolean(srcValue)){
        return objValue || srcValue;
    }
};
