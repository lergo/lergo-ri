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
exports.getTagsByFilter = function (req, res) {

    var like = req.param('like');
    like = new RegExp(like, 'i');

    var lessonsId = req.getQueryList('lessonsId');
    lessonsId = services.db.id(lessonsId);

    var questionsId = req.getQueryList('questionsId');
    questionsId = services.db.id(questionsId);

    logger.info('lessonsId',lessonsId);

    var result = [];


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

                ],
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
        async.parallel(
            [
                findTagsOnLessons,
                findTagsOnQuestions
            ],
            function () {
                logger.debug('finished fetching labels');
                res.send(_.uniqBy(result, 'label'));
            }
        );
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
