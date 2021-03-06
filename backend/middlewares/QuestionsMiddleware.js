'use strict';

/**
 * @module QuestionsMiddleware
 * @type {Question|exports}
 */

var Question = require('../models/Question');
var Lesson = require('../models/Lesson');
var logger = require('log4js').getLogger('QuestionsMiddleware');
var permissions = require('../permissions');
/* const redisClient = require('redis').createClient;
const redis = redisClient(6379, 'localhost'); */
var services = require('../services');
const redis = services.redis.getClient();

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

    redis.get(req.params.questionId, function (err, reply) {
        if(err) {
            console.log(err);
        } else if (reply) {
            logger.debug('question found in redis');
            req.question = JSON.parse(reply);
            next();
        } else {
            logger.info('question not found in Redis, accessing mongo');
            Question.findById( req.params.questionId, function(err, result){
                if ( !!err ){
                    res.status(500).send(err);
                    return;
                }
                if ( !result ){
                    res.status(404).send('question not found');
                    return;
                }
                //logger.debug('putting question on request', result);
                req.question = result;
        
                next();
        
            });    

        }   
    });
    
    
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

var cachedList = [];
var redisGet = function (id) {
    return new Promise(function(resolve, reject) {
        redis.get(id, function (err, reply) {
        if(err) {
            console.log(err);
            reject(err);
        } else if (reply) {
            var modifiedReply = JSON.parse(reply);
            logger.debug('using redis cache for this question ');
            if (cachedList.indexOf(modifiedReply) === -1) {
                cachedList.push(modifiedReply); 
            } 
        } else {
            logger.debug('question not found');
        }
        resolve(reply);
      });
    });
};

var redisDelete = function (id) {
    redis.del(id,function (err, reply) {
    logger.debug('deleting question from redis ', reply); 
  });
};


exports.cacheIds = function cacheIds( req, res, next) {
    cachedList = []; 
    var idsList = [];
    logger.info('checking Redis questions cache');
    const ids = req.query.questionsId || [];
    // the req.query.questionsId should be an object (list), but if there is only 1 question, it is a string.
    // the string has 24 elements, which redis would try and save.
    if (typeof ids === 'string') {
        idsList.push(ids);
        logger.info('lesson with only 1 question');
    } else {
        idsList = ids;
    }
    
    var promises = [];
    for (var i in idsList) {
        const id = idsList[i];
        promises.push(redisGet(id));
    }
    Promise.all(promises)
    .then(function() {
        logger.debug('checking if redis question cache has all questions');
        if (cachedList.length === idsList.length) {
            logger.info('all questions are present: using redis cache for lesson questions');
            res.send(cachedList);
        } else {
            logger.info('not all questions found in redis cache - delete and save');
            for (let j = 0; j < cachedList.length; j++ ) {
                const idToDelete = cachedList[j];
                logger.debug('deleting questions from redis cache');
                redisDelete(idToDelete);
            }
            logger.info('Questions list deleted from Redis');
            res.sendResponse = res.send;
                res.send = (body) => {
                    // save the elements in questionsController!
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
