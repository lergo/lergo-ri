'use strict';

var Like = require('../models/Like');
var logger = require('log4js').getLogger('LikesMiddleware');
var async = require('async');
var lessonsMiddleware = require('./LessonsMiddleware');
var questionsMiddleware = require('./QuestionsMiddleware');


// if item we want to like exists.. must exist..
exports.itemExists = function itemExists(req, res, next) {
    logger.debug('finding itemId for like on request');
    var itemType = req.params.itemType;
    var itemId = req.params.itemId;
    if (!itemType) {
        logger.info('itemType is missing, failing..');
        res.send(400, 'must specify item details to like');
        return;
    }

    async.parallel(
        [
            function findLesson() {
                if (itemType === Like.ItemTypes.LESSON) {
                    req.likeItemType = Like.ItemTypes.LESSON;
                    req.params.lessonId = itemId;
                    lessonsMiddleware.exists(req, res, function () {
                        req.likeItem = req.lesson;
                        next();
                    });
                }
            },
            function findQuestion() {
                if (itemType === Like.ItemTypes.QUESTION) {
                    req.likeItemType = Like.ItemTypes.QUESTION;
                    req.params.questionId = itemId;
                    questionsMiddleware.exists(req, res, function () {
                        req.likeItem = req.question;
                        next();
                    });
                }
            }
        ],
        function verifyItemExists() {

            // guy - we will reach here if itemType does not match anything..
            if (!req.likeItem) {
                res.send(400, 'item does not exist');
                return;
            }
            next();
        }
    );

};

// if like itself exists
exports.optionalExists = function optionalExists(req, res, next) {
    logger.debug('checking if like exists');

    if (!req.params.itemId) {
        logger.debug('itemId is missing. moving on.');
        next();
        return;
    }

    try {
        Like.findOne(
            Like.createNewFromRequest(req),
            function (err, result) {
                logger.info('got result', result);
                if (!!err || !result) {
                    logger.debug('got error or no result, moving on.. ');
                    next();
                    return;
                }
                req.like = result;
                next();
            });
    } catch (e) {
        logger.debug('unable to check if like exists', e);
        next();
    }
};

// if like itself does exist
exports.exists = function exists(req, res, next) {
    logger.info('making sure like does not exist');
    exports.optionalExists(req, res, function () {
        if (!req.like) {
            logger.debug('like exists, failing');
            res.send(400, 'already exists');
        } else {
            logger.debug('like does not exist, moving on');
            next();
        }
    });
};

// if like itself does not exist
exports.notExists = function notExists(req, res, next) {
    logger.info('making sure like does not exist');
    exports.optionalExists(req, res, function () {
        if (!!req.like) {
            res.send(400, 'already exists');
        } else {
            next();
        }
    });
};