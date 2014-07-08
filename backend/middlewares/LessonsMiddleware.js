var Lesson = require('../models/Lesson');
var logger = require('log4js').getLogger('LessonsMiddleware');
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
    logger.info('checking if lesson exists : ' , req.params.lessonId );
    Lesson.findById( req.params.lessonId, function(err, result){
        if ( !!err ){
            res.send(500,err);
            return;
        }
        if ( !result ){
            res.send(404);
            return;
        }

        logger.info('putting lesson on request', result);
        req.lesson = result;

        next();

    } );
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
    logger.info('checking if user can edit lesson');
    return permissions.lessons.userCanEdit( req.lesson, req.user ) ? next() : res.send(400);
};

/*
    Whether this user can see private lessons

 */
exports.userCanSeePrivateLessons = function userCanSeePrivateLessons( req, res, next){
    logger.info('checking if user can see private lessons');
    if ( !req.user.isAdmin ){
        res.send(400);
        return;
    }
    next();
};

exports.userCanViewLesson = function userCanViewLesson( req, res, next ){

    if ( !req.user && !req.lesson.public ){
        logger.debug('no user on session and lesson not public');
        res.send(400);
        return;
    }

    next();

};