'use strict';
var managers = require('../managers');

var logger = require('log4js').getLogger('QuestionsController');

exports.createQuestion = function(req, res){
    var question = req.body;
    managers.questions.createQuestion( question, function( err, obj  ){
        if ( !!err ){
            err.send(res);
            return;
        } else {
            res.send(  obj );
            return;
        }
    });
};

exports.findUsages = function( req, res ) {

    var questionId = req.params.id;
    logger.info( 'finding usages for question : ' + questionId );

    // TODO : implement this

    res.send([]);

};


exports.getQuestions = function(req, res){
    managers.questions.getQuestions( function( err, obj  ){
        if ( !!err ){
            err.send(res);
            return;
        } else {
            res.send( obj);
            return;
        }
    });
};
exports.getQuestionById = function(req, res){
	var id = req.params.id;
    managers.questions.getQuestionById( id,function( err, obj  ){
        if ( !!err ){
            err.send(res);
            return;
        } else {
            res.send( obj );
            return;
        }
    });
};
exports.updateQuestion = function(req, res){
    var question = req.body;

    logger.info(question);

    var id = req.params.id;
    managers.questions.updateQuestion( question,id, function( err, obj  ){
        if ( !!err ){
            err.send(res);
            return;
        } else {
            res.send(  obj );
            return;
        }
    });
};
