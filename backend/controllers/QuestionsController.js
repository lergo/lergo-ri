'use strict';
var managers = require('../managers');
var services = require('../services');
var models = require('../models');
var logger = require('log4js').getLogger('QuestionsController');
var _ = require('lodash');

exports.create = function (req, res) {
    var question = req.body;
    question.userId = managers.db.id(req.sessionUser._id);
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
    if ( !req.queryObj || !req.queryObj.filter ){
        res.status(500).send('query obj should exist with filter');
        return;
    }
    req.queryObj.filter.userId = req.sessionUser._id;

    managers.questions.complexSearch(req.queryObj , function (err, obj) {
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

    logger.debug('question from body',question);
    question._id = managers.db.id(question._id);
    question.userId = managers.db.id(req.question.userId);
    managers.questions.updateQuestion( question, function (err, obj) {
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
exports.findQuestionsByIds = function (req, res) {

    var objectIds = req.getQueryList('questionsId');
    logger.info('this is object ids', objectIds);


    managers.questions.getQuestionsById(objectIds, function(err, result){
        if ( !!err ){
            err.send(res);
            return;
        }

        res.send(result);
    });

};

/**
 * gets a map of ids ,answers and returns the corresponding results.
 * 
 * 
 * @param req
 * @param res
 */
exports.submitAnswers = function(req, res) {
	var map = req.query.answers;
	Object.keys(map).forEach(function(id) {
		var val = map[id];
		managers.questions.submitAnswer(id, val, function(err, result) {
			if (!!err) {
				new managers.error.InternalServerError(err, 'unable to submit ').send(res);
				return;
			} else {
				map[id] = result;
			}
		});
		res.send(map);
	});
};


// returns { 'correct' : true/false }
exports.checkQuestionAnswer = function( req, res ){
    var questionWithAnswer = req.body;

    var handler = services.questionHandler.getHandler( questionWithAnswer );

    if ( handler.isCorrect () ){
        res.send( { 'correct' : true } );
    }else{
        res.send( { 'correct' : false } );
    }



};

exports.deleteQuestion = function (req, res) {
    var id = req.params.id;
    logger.info('Deleting question:', id);
    managers.questions.deleteQuestion(id, req.sessionUser._id, function (err, obj) {
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
    managers.questions.copyQuestion( req.sessionUser, req.question, function (err, result) {
        res.send(result);
    });
};

       //db.lessons.aggregate([{'$project':{ 'steps' : '$steps' }}, {'$unwind': '$steps'},{'$match' :{'steps.type' : 'quiz'}}, {'$unwind' : '$steps.quizItems'}, {'$project' : {'item' : '$steps.quizItems'}}])

exports.getPublicLessonQuestions = function(req, res){


    // todo - this is not the proper solution
    // guy  - basically I would not use mongo for this query, but given the limitation we can still improve this.
    // guy  - if we were to use map reduce to create a new collection 'public_questions` we could use
    // guy  - `complexSearch` normally on that collection.
    // guy  - the map reduce should occur in the background. (I think we can still reuse this process though,
    // guy  - if we used `last update` from last 720 hours (1 month).. it would be light enough for this process
    // guy  - to handle once a day.. we could even improve the 720 hours filter, but keeping `last update` on
    // guy  - `public questions` collection, and compare it. if it equals we can stop as these questions were
    // guy  - already processed..

    // guy  - I think that generally we should see a big improvement in performance in the UI since we are
    // guy  - even though we read all the questions IDs. perhaps just he IDs would be light enough..
    // guy  - the major relief is on the response which is paged and limited.
    // guy  - we can calculate roughly 500 question IDs as 10K.. which means 1M = 50K question.. and I think
    // guy  - we will be relatively ok with 3 times that.. so we have time to grow

    // guy  - we can even improve this by doing it in iterations, and stopping once response is big enough..
    // guy  - but I think that would be a relative overkill and map reduce would be better.
    models.Lesson.connect(function (db, collection) {
        collection.aggregate([
            {'$match' : {'public' : {'$exists' : 1 }}},
            {'$project':{ 'steps' : '$steps' }},
            {'$unwind': '$steps'},
            {'$match' :{'steps.type' : 'quiz'}},
            {'$unwind' : '$steps.quizItems'},
            {'$project' : {'item' : '$steps.quizItems'}},
            {'$group': {'_id' : '$item'}}

        ], function(err, args){
            if ( !!err ){
                res.status(500).send(err);
                return;
            }

            req.queryObj.filter._id = { '$in' : services.db.id(_.map(args,'_id' ) ) };
            managers.questions.complexSearch( req.queryObj , function(err, result){
                if ( !!err ){
                    err.send(res);
                    return;
                }
                res.send(result);
            });
        });
    });
};