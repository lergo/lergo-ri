'use strict';
var services = require('../services');
var managers = require('../managers');
var logger = require('log4js').getLogger('TagsController');
var async = require('async');
var _ = require('lodash');
var models = require('../models');

exports.getTopTags = function (req, res) {

    // example for a working query in mongo for this
    // db.lessons.aggregate([ { $unwind : '$tags' } , { $group: { _id : '$tags.label', number : { $sum : 1 } }}, { $sort : { number : -1 } }, { $limit : 5}])
    var limit = Math.min(req.param('limit') || 3000, 3000);

    // aggregate is much better than map reduce performance-wise : http://blog.mongodb.org/post/62900213496/qaing-new-code-with-mms-map-reduce-vs-aggregation

    models.Lesson.connect(function (db, collection) {
        collection.aggregate([
            {$unwind: '$tags'} ,
            {$group: {_id: '$tags.label', number: {$sum: 1}}},
            {$sort: {number: -1}},
            {$limit: limit}
        ],  {cursor: {}}, function(err, result) {
            res.send(result);
        });
    });
};

// find all tags like 'like' filter.

//  db.lessons.aggregate( { $unwind : '$tags' },  { $group : {_id : '$tags.label' } }, { $match : { '_id' : /tom/i } } )
//  db.lessons.aggregate( { $unwind : '$tags' },  { $match : {'tags.label' : /tom/i } }, { $group : { _id : '$tags.label' } })

//  implementing caching of home page - TagsController and ComplexSearchService. Using 'Date' the variables will be reset every day
//  the TagsController does not require different code for the different languages. 
    // variables for caching home page tags
    var cachedResult = [];
    var validForCachingTags = false;
    var previousDate = 0;
    var currentDate = 0;

exports.getTagsByFilter = function (req, res) {

    var like = req.param('like');
    like = new RegExp(like, 'i');

    var lessonsId = req.getQueryList('lessonsId');
    lessonsId = services.db.id(lessonsId);

    var questionsId = req.getQueryList('questionsId');
    questionsId = services.db.id(questionsId);

    logger.info('lessonsId',lessonsId);

    var result = [];

    // test requests matching homepage     
    var strLike = '"' + like + '"';
    var likeRequest = strLike.indexOf('(?:)') === 2;
    var idsRequest = (lessonsId.length + questionsId.length) === 0; 
    var d = new Date();
    currentDate = d.getDate();
    validForCachingTags = likeRequest && idsRequest;

    function findTagsOnCollection( collectionName, like, ids, callback ){
    
        var match = { $match : { 'tags.label' : like || '' }};
        if ( !!ids && ids.length > 0){
            match.$match._id = { '$in' : ids };
        }

        services.db.connect( collectionName, function (db, collection) {
            collection.aggregate([
                    { $unwind: '$tags' },
                    match,
                    { $group: { _id: '$tags.label' } },
                    { $limit : 10 },
                    { $project: { _id : '$_id' , 'label' : '$_id'}}

                ], {cursor: {}},
                function (err, tags) {
                    callback( err, tags );
                });
        });
    }

    function findCallback(err, cursor, next) {   
        cursor.toArray(function( err, tags) {
            if (!!err) {
                next(err);
                return;
            } else {
                result = result.concat(tags);
                next();
            }
        });
    }

    function findTagsOnLessons( next ){
        findTagsOnCollection( 'lessons', like, lessonsId, function(err, tags){ findCallback( err, tags, next ); });
    }

    function findTagsOnQuestions( next ){
        findTagsOnCollection('questions', like, questionsId, function(err, tags){ findCallback( err, tags, next ); });
    }

    function main() {
        // check if request is for home page tags
        if (validForCachingTags && cachedResult.length !== 0) {
            logger.info('using cached tags for homepage');
            var finalResult = cachedResult;
            if (currentDate !== previousDate) { // reset the home page link every day
                previousDate = currentDate;
                logger.info('updating date to ', previousDate);
                cachedResult = [];
            }    
            res.send(finalResult);
        } else {
            async.parallel(
                [
                    findTagsOnLessons,
                    findTagsOnQuestions
                ],
                function () {
                    logger.debug('finished fetching labels');
                    var finalResult = _.uniqBy(result, 'label');
                    if (validForCachingTags && cachedResult.length === 0) {
                        logger.info('caching homepage tags');
                        cachedResult = finalResult;
                    }
                    finalResult = finalResult;
                    res.send(finalResult);
                }
            );
        }
    }

    if ( lessonsId.length > 0 ){
        models.Lesson.getAllQuestionsIdsForLessons( lessonsId, function( err, result ){
            if ( !!err ){
                new managers.error.InternalServerError(err,'unable to get all lessons questions').send(res);
                return;
            }
            logger.info('questionsId result', result);
            questionsId = questionsId.concat(services.db.id(result));
            main();
        });
    }else{
        main();
    }
};
