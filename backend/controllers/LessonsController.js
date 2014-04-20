'use strict';
var managers = require('../managers');
exports.createLesson = function(req, res){
    var lesson = req.body;
    lesson.userId = req.user._id;
    managers.lessons.createLesson( lesson, function( err, obj  ){
        if ( !!err ){
            err.send(res);
            return;
        } else {
            res.send( { 'Lesson' : obj , 'message' : 'Added successfully'});
            return;
        }
    });
};
exports.getUserLessons = function(req, res){
    managers.lessons.getUserLessons( req.user._id, function( err, obj  ){
        if ( !!err ){
            err.send(res);
            return;
        } else {
            res.send( { 'Lessons' : obj , 'message' : 'lessons fetched successfully'});
            return;
        }
    });
};
exports.getLessonById = function(req, res){
	var id = req.params.id;
    managers.lessons.getLessonById( id,function( err, obj  ){
        if ( !!err ){
            err.send(res);
            return;
        } else {
            res.send( { 'Lesson' : obj , 'message' : 'Lesson fetched successfully'});
            return;
        }
    });
};
exports.updateLesson = function(req, res){
    var lesson = req.body;
    var id = req.params.id;
    managers.lessons.updateLesson( lesson,id, function( err, obj  ){
        if ( !!err ){
            err.send(res);
            return;
        } else {
            res.send( { 'Lesson' : obj , 'message' : 'Updated successfully'});
            return;
        }
    });
};
exports.deleteLesson = function(req, res){
	var id = req.params.id;
    managers.lessons.deleteLesson( id,function( err, obj  ){
        if ( !!err ){
            err.send(res);
            return;
        } else {
            res.send( { 'Lesson' : obj , 'message' : 'Lesson deleted successfully'});
            return;
        }
    });
};
