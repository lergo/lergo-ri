'use strict';
var managers = require('../managers');


exports.createLesson = function (req, res) {
    var lesson = {};
    lesson.userId = req.user._id;
    managers.lessons.createLesson(lesson, function (err, obj) {
        if (!!err) {
            err.send(res);
            return;
        } else {
            res.send(obj);
            return;
        }
    });
};
exports.getUserLessons = function (req, res) {
    managers.lessons.getUserLessons(req.user._id, function (err, obj) {
        if (!!err) {
            err.send(res);
            return;
        } else {
            res.send(obj);
            return;
        }
    });
};
exports.getUserLessonById = function (req, res) {
    var id = req.params.id;

    managers.lessons.getLesson({ '_id': managers.db.id(id), 'userId': req.user._id }, function (err, obj) {
        if (!!err) {
            err.send(res);
            return;
        } else {
            res.send(obj);
            return;
        }
    });
};
exports.updateLesson = function (req, res) {
    var lesson = req.body;
    lesson.userId = req.user._id;
    lesson._id = managers.db.id(lesson._id);
    managers.lessons.updateLesson(lesson, function (err, obj) {
        if (!!err) {
            err.send(res);
            return;
        } else {
            res.send(obj);
            return;
        }
    });
};
exports.deleteLesson = function (req, res) {
    var id = req.params.id;
    managers.lessons.deleteLesson(id, req.user._id, function (err, obj) {
        if (!!err) {
            err.send(res);
            return;
        } else {
            res.send(obj);
            return;
        }
    });
};


exports.getAdminLessons = function (req, res) {
    managers.lessons.find({}, {}, function (err, result) {
        if (!!err) {
            new managers.error.InternalServerError(err, 'unable to get all admin lessons').send(res);
            return;
        }

        res.send(result);
    });
};


exports.adminUpdateLesson = function (req, res) {
    var lesson = req.body;
    lesson.userId = managers.db.id(lesson.userId);
    lesson._id = managers.db.id(lesson._id);
    managers.lessons.updateLesson(lesson, function (err, obj) {
        if (!!err) {
            err.send(res);
            return;
        } else {
            res.send(obj);
            return;
        }
    });
};

exports.getPublicLessons = function( req, res ){
    managers.lessons.find( { 'public' : {'$exists'  : true } }, {}, function( err, result){
        if ( !!err ){
            err.send(res);
            return;
        }else{
            res.send(result);
        }
    });
};