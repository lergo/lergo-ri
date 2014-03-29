'use strict';
var managers = require('../managers');
exports.createQuestion = function(req, res){
    var question = req.body;
    managers.questions.createQuestion( question, function( err, obj  ){
        if ( !!err ){
            err.send(res);
            return;
        } else {
            res.send( { 'Question' : obj , 'message' : 'Added successfully'});
            return;
        }
    });
};
exports.getQuestions = function(req, res){
    managers.questions.getQuestions( function( err, obj  ){
        if ( !!err ){
            err.send(res);
            return;
        } else {
            res.send( { 'Questions' : obj , 'message' : 'Questions fetched successfully'});
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
            res.send( { 'Question' : obj , 'message' : 'Question fetched successfully'});
            return;
        }
    });
};
exports.updateQuestion = function(req, res){
    var question = req.body;
    var id = req.params.id;
    managers.questions.updateQuestion( question,id, function( err, obj  ){
        if ( !!err ){
            err.send(res);
            return;
        } else {
            res.send( { 'Question' : obj , 'message' : 'Updated successfully'});
            return;
        }
    });
};
