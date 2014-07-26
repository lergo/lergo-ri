'use strict';

var Like = require('../models/Like');
var logger = require('log4js').getLogger('LikesMiddleware');
var async = require('async');
var lessonsMiddleware = require('./LessonsMiddleware');
var questionsMiddleware = require('./QuestionsMiddleware');


// finds the item we want to like/dislike/count likes etc..
// if this item does not exist - we cannot move on.
// also puts on request abstract properties for both lesson and question
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
                if (!!err || !result) {
                    logger.debug('got error or no result, moving on.. ',err,result);
                    next();
                    return;
                }
                logger.info('got result', result);
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
    logger.info('making sure like exist');
    exports.optionalExists(req, res, function () {
        if (!req.like) {
            logger.debug('like does not exist, failing');
            res.send(400, 'no such like');
        } else {
            logger.debug('like exist, moving on');
            next();
        }
    });
};

// if like itself does not exist
exports.notExists = function notExists(req, res, next) {
    logger.debug('making sure like does not exist');
    exports.optionalExists(req, res, function () {
        logger.debug('looking if like exists on req');
        if (!!req.like) {
            res.send(400, 'already exists');
        } else {
            next();
        }
    });
};