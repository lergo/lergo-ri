'use strict';

/**
 * @module LesosnsMiddleware
 * @type {Lesson|exports}
 */

var Lesson = require('../models/Lesson');
var logger = require('log4js').getLogger('LessonsMiddleware');
var permissions = require('../permissions');
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
    logger.debug('checking if lesson exists : ' , req.params.lessonId );
    try {
        Lesson.findById(req.params.lessonId, function (err, result) {
            if (!!err) {
                res.status(500).send(err);
                return;
            }
            if (!result) {
                res.status(404).send('lesson not found');
                return;
            }

            logger.debug('putting lesson on request', result);
            req.lesson = result;

            next();

        });
    }catch(e){
        res.status(404).send('lesson not found after exception');
    }
};


/**
 * Whether user can edit the lesson or not
 *
 * assumes request contains
 *
 * user - the user on the request
 * lesson - the lesson we are editting
 */
exports.userCanEdit = function userCanEdit( req, res, next  ){
    logger.debug('checking if user can edit lesson');
    return permissions.lessons.userCanEdit( req.sessionUser , req.lesson ) ? next() : res.status(400).send('');
};


exports.userCanPublish = function userCanPublish( req, res, next  ){
    logger.debug('checking if user can publish lesson');
    return permissions.lessons.userCanPublish( req.sessionUser , req.lesson ) ? next() : res.status(400).send('');
};


exports.userCanUnpublish = function userCanUnpublish( req, res, next  ){
    logger.debug('checking if user can unpublish lesson');
    return permissions.lessons.userCanUnpublish( req.sessionUser , req.lesson ) ? next() : res.status(400).send('');
};

exports.userCanDelete = function userCanDelete(req, res, next){
    return permissions.lessons.userCanDelete( req.sessionUser , req.lesson ) ? next() : res.status(400).send('');
};

exports.userCanCopy = function userCanCopy(req, res, next){
    return permissions.lessons.userCanCopy( req.sessionUser, req.lesson ) ? next() : res.status(400).send('');
};

/*
Whether this user can see private lessons
 */
exports.userCanSeePrivateLessons = function userCanSeePrivateLessons( req, res, next){
    logger.debug('checking if user can see private lessons');
    if ( !permissions.lessons.userCanSeePrivateLessons(req.sessionUser) ){
        res.status(400).send('');
        return;
    }
    next();
};

exports.cacheLessonsIntro = function cacheLessonsIntro( req, res, next) {
    logger.info('Redis checking lessons cache');
    const id = req.params.lessonId;
    redis.get(id,(err, reply) => {
        if(err) {
            console.log(err);
        } else if(reply) {
            var modifiedReply = JSON.parse(reply);
            logger.info('using redis cache for this lesson content');
            res.send(modifiedReply);
        } else {
            res.sendResponse = res.send;
            res.send = (body) => {
                redis.set(id, JSON.stringify(body));
                redis.expire(id, 60*60*24*7); // lessonIntro expires every week to update  # of views
                res.sendResponse(body);
            };
            next();
        }
    });
};

exports.cachePublicLessonsUsernames = function cachePublicLessonsUsernames( req, res, next) {
    logger.info('Redis checking public lessons usernames');
    const key = 'publicLessonsUsernames';
    redis.get(key,(err, reply) => {
        if(err) {
            console.log(err);
        } else if(reply) {
            var modifiedReply = JSON.parse(reply);
            logger.info('using redis cache for ', key);
            res.send(modifiedReply);
        } else {
            logger.info(key, ' will be loaded in redis cache ');
            res.sendResponse = res.send;
            res.send = (body) => {
                redis.set(key, JSON.stringify(body)); 
                redis.expire(key, 60*60);
                res.sendResponse(body);
            };
            next();
        }
    });
};

exports.cacheHomepageLessons = function cacheHomepageLessons( req, res, next) {
    logger.info('Redis checking homepage Lessons cache');
    const key = req.queryObj.filter.language + 'HomepageLessons';
    redis.get(key,(err, reply) => {
        if(err) {
            console.log(err);
        } else if(reply) {
            var modifiedReply = JSON.parse(reply);
            logger.info('using redis cache for ', key);
            res.send(modifiedReply);
        } else {
            logger.info(key, ' will be loaded in redis cache ');
            res.sendResponse = res.send;
            res.send = (body) => {
                redis.set(key, JSON.stringify(body));
                redis.expire(key, 60*60);
                res.sendResponse(body);
            };
            next();
        }
    });
};
//Jeff delete lesson key from redis when lesson is being updated
exports.deleteKeyFromRedis = function deleteKeyFromRedis( req, res, next) {
    const id = req.params.lessonId;
    redis.del(id,(err, reply) => {
        if(err) {
            console.log(err);
        } else {
            logger.info('deleting lesson key from redis after lesson update', reply);
        }
    });
    next();
};

