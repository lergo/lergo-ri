var Lesson = require('../models/Lesson');
var logger = require('log4js').getLogger('LessonsMiddleware');
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
    debugger;
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
    var user = req.user;
    var lesson = req.lesson;
    if ( !user || !lesson ){

        res.send(400);
        return;
    }
    if ( !!user.isAdmin || lesson.userId == user._id ){
        next();
    }
};