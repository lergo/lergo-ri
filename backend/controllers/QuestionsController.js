'use strict';

/**
 * @module QuestionsController
 * @type {exports}
 */

var managers = require('../managers');
var services = require('../services');
var models = require('../models');
var logger = require('log4js').getLogger('QuestionsController');
var _ = require('lodash');
var Like = require('../models/Like');
const redisClient = require('redis').createClient;
const redis = redisClient(6379, 'localhost');

exports.create = function (req, res) {
    var question = req.body;
    question.userId = services.db.id(req.sessionUser._id);
    managers.questions.createQuestion(question, function (err, obj) {
        if (!!err) {
            err.send(res);
            return;
        } else {
            res.send(obj);
            return;
        }
    });
};

exports.findUsages = function (req, res) {

    var questionId = req.params.id;
    logger.info('finding usages for question : ' + questionId);

    // TODO : implement this

    res.send([]);

};

exports.getQuestions = function (req, res) {
    if (!req.queryObj || !req.queryObj.filter) {
        res.status(500).send('query obj should exist with filter');
        return;
    }
    req.queryObj.filter.userId = req.sessionUser._id;

    managers.questions.complexSearch(req.queryObj, function (err, obj) {
        if (!!err) {
            new managers.error.InternalServerError(err, 'unable to get user questions').send(res);
            return;
        } else {
            res.send(obj);
        }

    });
};
exports.getQuestionById = function (req, res) {
    logger.info('getting question by id'); 
    res.send(req.question);
};

exports.update = function (req, res) {
    logger.info('updating question');
    var question = req.body;
    question._id = services.db.id(question._id);
    question.userId = services.db.id(req.question.userId);
    managers.questions.updateQuestion(question, function (err, obj) {
        if (!!err) {
            err.send(res);
            return;
        } else {
            res.send(obj);
            return;
        }
    });
};

/**
 * gets a list of ids and returns the corresponding questions.
 *
 * how to pass a list of ids over req query?
 *
 * ?idsList[]=1&idsList[]=2&idsList[]=3
 *
 * @param req
 * @param res
 */
var redisSet = function (id, body) {
    id = String(id);
    redis.set(id, JSON.stringify(body), function (err, reply) {
        console.log('adding question to redis' , reply);
      });
};

exports.findQuestionsByIds = function (req, res) {
    var objectIds = req.getQueryList('questionsId');
    logger.info('findQuestionsByIds');
    managers.questions.getQuestionsById(objectIds, function (err, result) {
        if (!!err) {
            err.send(res);
            return;
        }
        logger.info('saving questions to redis');
        for (let i = 0; i < result.length; i++ ) {
           redisSet(result[i]._id, result[i]);
       }
        res.send(result);
    });

};

// returns { 'correct' : true/false , expMessage : 'message explanation message'}
exports.checkQuestionAnswer = function (req, res) {
    var questionWithAnswer = req.body;

    var handler = services.questionHandler.getHandler(questionWithAnswer);
    managers.questions.incrementViews(questionWithAnswer._id);
    var result = handler.isCorrect();
    res.send(result);
};

exports.deleteQuestion = function (req, res) {
    var id = req.params.questionId;
    logger.info('Deleting question:', id);
    managers.questions.deleteQuestion(id, function (err, obj) {
        if (!!err) {
            err.send(res);
            return;
        } else {
            res.send(obj);
            return;
        }
    });
};

/* used for deleting invalid questions before playing the lesson */
exports.removeQuestion = function (req, res) {
    var id = req.params.questionId;
    logger.info('Deleting question:', id);
    managers.questions.deleteQuestion(id, function (err, obj) {
        if (!!err) {
            err.send(res);
            return;
        } else {
            res.send(obj);
            return;
        }
    });
};

exports.copyQuestion = function (req, res) {
    managers.questions.copyQuestion(req.sessionUser, req.question, function (err, result) {
        res.send(result);
    });
};

// db.lessons.aggregate([{'$project':{ 'steps' : '$steps' }}, {'$unwind':
// '$steps'},{'$match' :{'steps.type' : 'quiz'}}, {'$unwind' :
// '$steps.quizItems'}, {'$project' : {'item' : '$steps.quizItems'}}])

exports.getPublicLessonQuestions = function (req, res) {

    // todo - this is not the proper solution
    // guy - basically I would not use mongo for this query, but given the
    // limitation we can still improve this.
    // guy - if we were to use map reduce to create a new collection
    // 'public_questions` we could use
    // guy - `complexSearch` normally on that collection.
    // guy - the map reduce should occur in the background. (I think we can
    // still reuse this process though,
    // guy - if we used `last update` from last 720 hours (1 month).. it would
    // be light enough for this process
    // guy - to handle once a day.. we could even improve the 720 hours filter,
    // but keeping `last update` on
    // guy - `public questions` collection, and compare it. if it equals we can
    // stop as these questions were
    // guy - already processed..

    // guy - I think that generally we should see a big improvement in
    // performance in the UI since we are
    // guy - even though we read all the questions IDs. perhaps just he IDs
    // would be light enough..
    // guy - the major relief is on the response which is paged and limited.
    // guy - we can calculate roughly 500 question IDs as 10K.. which means 1M =
    // 50K question.. and I think
    // guy - we will be relatively ok with 3 times that.. so we have time to
    // grow

    // guy - we can even improve this by doing it in iterations, and stopping
    // once response is big enough..
    // guy - but I think that would be a relative overkill and map reduce would
    // be better.
    models.Lesson.connect(function (db, collection) {
        collection.aggregate([{
            '$match': {
                'public': {
                    '$exists': 1
                }
            }
        }, {
            '$project': {
                'steps': '$steps'
            }
        }, {
            '$unwind': '$steps'
        }, {
            '$match': {
                'steps.type': 'quiz'
            }
        }, {
            '$unwind': '$steps.quizItems'
        }, {
            '$project': {
                'item': '$steps.quizItems'
            }
        }, {
            '$group': {
                '_id': '$item'
            }
        }

        ], 
        function (err, cursor) {
            cursor.toArray(function(err, args){
                if (!!err) {
                    res.status(500).send(err);
                    return;
                }
    
                req.queryObj.filter._id = {
                    '$in': services.db.id(_.map(args, '_id'))
                };
                managers.questions.complexSearch(req.queryObj, function (err, result) {
                    if (!!err) {
                        err.send(res);
                        return;
                    }
                    res.send(result);
                });
            });       
        });
    });
};

exports.getUserLikedQuestions = function (req, res) {
    var queryObj = req.queryObj;
    Like.find({
        userId  : req.sessionUser._id,
        itemType: 'question'
    }, {
        itemId: 1,
        _id   : 1
    }, function (err, result) {
        if (!!err) {
            err.send(res);
            return;
        }

        var mapResults = {};
        _.each(result, function (r) {
            mapResults[r.itemId.toString()] = r._id.getTimestamp();
        });
        queryObj.filter._id = {
            $in: _.map(result, 'itemId')
        };
        managers.questions.complexSearch(req.queryObj, function (err, result) {
            if (!!err) {
                err.send(res);
                return;
            }
            _.each(result.data, function (o) {
                o.lastUpdate = mapResults[o._id.toString()];
            });
            res.send(result);
        });
    });
};