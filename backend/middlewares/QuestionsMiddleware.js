'use strict';

/**
 * @module QuestionsMiddleware
 * @type {Question|exports}
 */

var Question = require('../models/Question');
var Lesson = require('../models/Lesson');
var logger = require('log4js').getLogger('QuestionsMiddleware');
var permissions = require('../permissions');
const redisClient = require('redis').createClient;
const redis = redisClient(6379, 'localhost');

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
exports.cacheIds = function cacheIds( req, res, next) {
    logger.info('checking questions cache');
    const id = req.params.questionId;
    redis.get(id,(err, reply) => {
        if(err) {
            console.log(err);
        } else if(reply) {
            var modifiedReply = JSON.parse(reply);
            logger.info('using redis cache for this question ');
            res.send(modifiedReply);
        } else {
            res.sendResponse = res.send;
            res.send = (body) => {
                redis.set(id, JSON.stringify(body));
                res.sendResponse(body);
            };
            next();
        }
    });
};

//Jeff delete question key from redis when question is being edited
exports.deleteKeyFromRedis = function deleteKeyFromRedis( req, res, next) {
    const id = req.params.questionId;
    redis.del(id,(err, reply) => {
        if(err) {
            console.log(err);
        } else {
            logger.info('deleting question key from redis after question edit', reply);
        }
    });
    next();
};
