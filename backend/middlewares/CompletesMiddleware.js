'use strict';

var Complete = require('../models/Complete');
var logger = require('log4js').getLogger('CompletesMiddleware');
var async = require('async');
var lessonsMiddleware = require('./LessonsMiddleware');
var questionsMiddleware = require('./QuestionsMiddleware');


// finds the item we want to complete/discomplete/count completes etc..
// if this item does not exist - we cannot move on.
// also puts on request abstract properties for both lesson and question
exports.itemExists = function itemExists(req, res, next) {
    logger.debug('finding itemId for complete on request');
    var itemType = req.params.itemType;
    var itemId = req.params.itemId;
    var itemScore = req.params.itemScore;
    if (!itemType) {
        logger.info('itemType is missing, failing..');
        res.status(400).send('must specify item details to complete');
        return;
    }

    async.parallel(
        [
            function findLesson() {
                if (itemType === Complete.ItemTypes.LESSON) {
                    req.completeItemType = Complete.ItemTypes.LESSON;
                    req.params.lessonId = itemId;
                    lessonsMiddleware.exists(req, res, function () {
                        req.lesson.score = itemScore;   // need to choose one
                        req.completeItem = req.lesson;
                        req.completeItem.score = itemScore; // need to choose one
                        next();
                    });
                }
            },
            function findQuestion() {
                if (itemType === Complete.ItemTypes.QUESTION) {
                    req.completeItemType = Complete.ItemTypes.QUESTION;
                    req.params.questionId = itemId;
                    questionsMiddleware.exists(req, res, function () {
                        req.completeItem = req.question;
                        next();
                    });
                }
            }
        ],
        function verifyItemExists() {
            // guy - we will reach here if itemType does not match anything..
            if (!req.completeItem) {
                res.status(400).send('item does not exist');
                return;
            }
            next();
        }
    );

};

// if complete itself exists
exports.optionalExists = function optionalExists(req, res, next) {
    logger.debug('checking if complete exists');

    if (!req.params.itemId) {
        logger.debug('itemId is missing. moving on.');
        next();
        return;
    }
    console.log('...................in Completes middleware ', Complete.createNewFromRequest(req));
    try {
        Complete.findOne(
            Complete.createNewFromRequest(req),
            function (err, result) {
                if (!!err) {
                    logger.debug('got error moving on.. ',err);
                    next();
                    return;
                }
                logger.debug('found a completes', result);
                req.complete = result;
                next();
            });
    } catch (e) {
        logger.debug('unable to check if complete exists', e);
        next();
    }
};

// if complete itself does exist
exports.exists = function exists(req, res, next) {
    logger.info('making sure complete exist');
    exports.optionalExists(req, res, function () {
        if (!req.complete) {
            logger.debug('complete does not exist, failing');
            res.status(400).send('no such complete');
        } else {
            logger.debug('complete exist, moving on');
            next();
        }
    });
};

// if complete itself does not exist   Le
exports.notExists = function notExists(req, res, next) {
    logger.debug('making sure complete does not exist');
    exports.optionalExists(req, res, function () {
        logger.debug('looking if complete exists on req');
        if (!!req.complete) {
            res.status(400).send('already exists');
        } else {
            next();
        }
    });
};