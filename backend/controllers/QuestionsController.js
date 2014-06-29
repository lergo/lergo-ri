'use strict';
var managers = require('../managers');
var services = require('../services');

var logger = require('log4js').getLogger('QuestionsController');

exports.createQuestion = function (req, res) {
    var question = req.body;
    question.userId = managers.db.id(req.user._id);
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


function getUserQuestionById(req, res, next) {
    var questionId = req.params.questionId || req.params.id;
    managers.questions.search({ 'userId': req.user._id, '_id': managers.db.id(questionId)}, {}, function (err, data) {
        try {
            if (!err && !!data && !!data.length && data.length > 0) {
                req.question = data[0];
            }
        } catch (e) {
            logger.error('unable to getUserQuestionById', e);

        }
        next();
    });
}


exports.getQuestions = function (req, res) {
    managers.questions.getQuestions( { 'userId' : req.user._id }, function (err, obj) {
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
    var id = req.params.id;
    managers.questions.getQuestionById(id, function (err, obj) {
        if (!!err) {
            err.send(res);
            return;
        } else {
            res.send(obj);
            return;
        }
    });
};
exports.updateUserQuestion = function (req, res) {
    logger.info('updating question');
    var question = req.body;

    logger.debug('question from body',question);
    question._id = managers.db.id(question._id);
    question.userId = managers.db.id(req.user._id);
    managers.questions.updateUserQuestion( question, function (err, obj) {
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
    managers.questions.getUserQuestions(req.user._id, function (err, obj) {
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
exports.findUserQuestionsByIds = function (req, res) {

    var objectIds = req.getQueryList('ids');
    logger.info('this is object ids', objectIds);
    objectIds = managers.db.id(objectIds);

    logger.info(typeof(objectIds));

    managers.questions.search({ '_id': { '$in': objectIds }}, { 'userId': 0 }, function (err, result) {
        if (!!err) {
            new managers.error.InternalServerError(err, 'unable to find user questions by ids').send(res);
            return;
        } else {
            res.send(result);
            return;
        }
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
    managers.questions.deleteQuestion(id, req.user._id, function (err, obj) {
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
    getUserQuestionById(req, res, function next() {
        managers.questions.copyQuestion(req.question, function (err, result) {
            res.send(result);
        });
    });
};