'use strict';
var Question = require('../models/Question');
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
    logger.info('checking if question exists : ' , req.params.questionId );
    Question.findById( req.params.questionId, function(err, result){
        if ( !!err ){
            res.status(500).send(err);
            return;
        }
        if ( !result ){
            res.status(404).send('question node found');
            return;
        }

        logger.debug('putting question on request', result);
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
    return permissions.questions.userCanEdit( req.question, req.sessionUser ) ? next() : res.status(400).send({});
};

exports.userCanCopy = function userCanCopy( req, res, next ){
    return permissions.questions.userCanCopy( req.question, req.sessionUser ) ? next() :res.status(400).send({});
};

/*
 Whether this user can see private questions

 */
exports.userCanSeeOthersQuestions = function userCanSeeOthersQuestions( req, res, next){
    logger.debug('checking if user can see');
    if ( !permissions.app.userCanManage(req.sessionUser) ){
        res.status(400).send({});
        return;
    }
    next();
};

exports.userCanDelete = function userCanDelete(req, res, next){
    return permissions.questions.userCanDelete( req.question, req.sessionUser ) ? next() : res.status(400).send('');
};