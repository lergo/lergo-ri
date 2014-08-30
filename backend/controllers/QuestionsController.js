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
    managers.questions.getQuestions( { 'userId' : req.sessionUser._id }, function (err, obj) {
        if (!!err) {
            err.send(res);
            return;
        } else {
            res.send(obj);
            return;
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

exports.getUserQuestions = function (req, res) {
    managers.questions.getUserQuestions(req.sessionUser._id, function (err, obj) {
        if (!!err) {
            new managers.error.InternalServerError(err, 'unable to get user questions').send(res);
            return;
        } else {
            res.send(obj);
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

exports.findUsages = function (req, res) {
    var id = req.params.id;
    managers.questions.findUsages(id, function (err, obj) {
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
    models.Lesson.connect(function (db, collection) {
        collection.aggregate([
            {'$match' : {'public' : {'$exists' : 1 }}},
            {'$project':{ 'steps' : '$steps' }},
            {'$unwind': '$steps'},
            {'$match' :{'steps.type' : 'quiz'}},
            {'$unwind' : '$steps.quizItems'},
            {'$project' : {'item' : '$steps.quizItems'}},
            {'$group': {'_id' : '$item'}},
            {'$skip' : req.param('_skip') },
            {'$limit' : req.param('_limit') }

        ], function(err, args){
            if ( !!err ){
                res.status(500).send(err);
                return;
            }
            managers.questions.getQuestionsById(_.map(args,'_id'), function(err, result){
                if ( !!err ){
                    err.send(res);
                    return;
                }
                res.send(result);
            });
        });
    });
};