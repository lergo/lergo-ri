'use strict';
var services = require('../services');

exports.getTopTags = function (req, res) {

    // example for a working query in mongo for this
    // db.lessons.aggregate([ { $unwind : '$tags' } , { $group: { _id : '$tags.label', number : { $sum : 1 } }}, { $sort : { number : -1 } }, { $limit : 5}])
    var limit = Math.min(req.param('limit') || 3000, 3000);

    // aggregate is much better than map reduce performance-wise : http://blog.mongodb.org/post/62900213496/qaing-new-code-with-mms-map-reduce-vs-aggregation

    services.db.connect('lessons', function (db, collection) {
        collection.aggregate([
            {$unwind: '$tags'} ,
            {$group: {_id: '$tags.label', number: {$sum: 1}}},
            {$sort: {number: -1}},
            {$limit: limit}
        ], function (err, result) {
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
    services.db.connect('lessons', function (db, collection) {
        collection.aggregate([
                { $unwind: '$tags' },
                { $match: {'tags.label': like } },
                { $group: { _id: '$tags.label' } }
            ],
            function (err, result) {
                res.send(result);
            });
    });


};