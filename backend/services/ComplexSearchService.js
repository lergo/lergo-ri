'use strict';
var logger = require('log4js').getLogger('ComplexSearchService');
var async = require('async');
/**
 *
 * @module ComplexSearchService
 *
 * @description
 * This function gets a proprietary filter object and translates it to a mongo query
 *
 * We can handle really difficult queries here.
 *
 *
 * The current ( September 20th ) structure of the function is 2 stages : build and query
 *
 *  - build filter,sort etc.. by using async.parallel
 *  - once the first async.parallel is over, invoke queries in another parallel
 *
 *  so it pseudo code is looks like this
 *
 * <pre>
 *   async.parallel (
 *     [ build functions ],
 *      async.parallel (
 *         [ query functions ],
 *         return response
 *      )
 *    );
 *
 * </pre>
 *
 * this function uses a builder that contains overrides.
 * the builder has the following structure:
 *
 * <pre>
 *  {
 *      collection : the collection to use for count and find functions
 *  }
 *  </pre>
 *
 *
 * @param {ComplexSearchQuery} queryObj - describe filter & project & sort & paging
 * *
 * The projection, sort and paging are straight forward.
 *
 * However the filter section can get very complex - we can ask to cross reference data from other collections
 * and the logic to decipher the logic is proprietary to specific collection.
 *
 *
 *
 * @param {object} builder - an interface we can pass to this function to add specific logic in case it is needed.
 * for example - in tag search for lessons, we should first search for questions with matching tags, extract
 * their IDs and add them to the filter.
 *
 * when you add a method to the builder, you need to document it here.
 *
 *
 * @param callback
 *
 * @response
 *
 * The response for each complexSearch should contain the pagination information as well.
 *
 * <pre>
 * {
 *    'data' : [ the data ],
 *    'count' : total filtered object,
 *    'total' : total collection size
 *    'skip' : starting where
 *    'limit' : how many did we bring?
 *
 * }
 * </pre>
 *
 *
 */


exports.complexSearch = function (queryObj, builder, callback) {

    /* logger.info('performing complex search on ', JSON.stringify(queryObj) ); */
    logger.info('performing complex search on the queryObj' );  // printing he queryObj is very long

    var collection = builder.collection;


    // default values;
    var filter = {};
    var sort = {};
    var projection = !!queryObj.projection && queryObj.projection || {};
    var skip = 0;
    var limit = 100;
    var total = 0;
    var count = 0;
    var data = [];

    console.log('queryobject is : ', queryObj);

    async.parallel(
        [
            function buildFilter(callback) {
                filter = queryObj.filter; //at first lets just take the filter as it is..
                callback();
            },
            function buildSort(callback) {
                if (queryObj.hasOwnProperty('sort')) {
                    sort = queryObj.sort;
                }
                callback();
            },
            function buildProjection(callback) {

                callback();
            },
            function buildLimit(callback) {
                if (queryObj.hasOwnProperty('limit')) {
                    limit = queryObj.limit;
                }

                callback();
            },
            function buildSkip(callback) {
                if (queryObj.hasOwnProperty('skip')) {
                    skip = queryObj.skip;
                }
                callback();
            }
        ],
        function finishedBuilding(err) {

            if (!!err) {
                callback(err);
                return;
            }

            // if no error, lets query

            async.parallel([
                    function getCount(callback) {
                        logger.info('counting');
                        collection.countDocuments(filter, function (err, countResult) {
                            logger.info('this is count result', countResult);
                            if (!!err) {
                                callback(err);
                                return;
                            }
                            count = countResult;
                            callback();
                        });
                    },
                    function getQuery(callback) {
                       /*  logger.info('the compiled query obj generated ', filter, projection, sort, skip, limit); */
                        logger.info('the compiled query obj generated can be very long ');
                        collection.find(filter).project(projection).sort(sort).skip(skip).limit(limit).toArray(function (err, dataResult) {
                            if (!!err) {
                                callback(err);
                                return;
                            }

                            data = dataResult;
                            callback();
                        });
                    }

                ],
                function finishedQuery() {
                    logger.info('calling callback ');
                    callback(err, {
                        'data': data,
                        'count': count,
                        'total': total,
                        'skip': skip,
                        'limit': limit
                    });
                });


        }
    );
};