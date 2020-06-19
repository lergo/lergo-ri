'use strict';

/**
 * @module QuestionsMiddleware
 * @type {Question|exports}
 */

var Question = require('../models/Question');
var Lesson = require('../models/Lesson');
var logger = require('log4js').getLogger('QuestionsMiddleware');
var permissions = require('../permissions');

/**

 includes middlewares regarding lessons

 **/


/**
 * checks if lesson exists
 * @param req
 * @param res
 * @param next
 */
exports.exists= function exists( req, res, next ){
    //logger.info('checking if question exists : ' , req.params.questionId );
    Question.findById( req.params.questionId, function(err, result){
        if ( !!err ){
            res.status(500).send(err);
            return;
        }
        if ( !result ){
            res.status(404).send('question node found');
            return;
        }

        //logger.debug('putting question on request', result);
        req.question = result;

        next();

    } );
};


/**
 * Whether user can edit the question or not
 *
 * assumes request contains
 *
 * user - the user on the request
 * lesson - the lesson we are editting
 */
exports.userCanEdit = function userCanEdit( req, res, next  ){
    logger.debug('checking if user can edit');
    exports.questionIsUsedByPublicLesson( req, res, function(){
        return permissions.questions.userCanEdit( req.sessionUser, req.question, req.questionUsedByPublicLesson ) ? next() : res.status(400).send({});
    });
};

exports.questionIsUsedByPublicLesson = function questionIsUsedByPublicLesson( req, res, next ){

    Lesson.existsPublicByQuizItems( req.question, function(err,exists){
        req.questionUsedByPublicLesson = !!exists;
        next();
    });
};

exports.userCanDelete = function userCanDelete(req, res, next){
    return permissions.questions.userCanDelete( req.sessionUser, req.question ) ? next() : res.status(400).send('');
};
