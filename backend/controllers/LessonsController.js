'use strict';
var managers = require('../managers');
var services = require('../services');


function getLessonForUser(req, res, next) {
    managers.lessons.getLesson({'_id': services.db.id(req.params.id || req.params.lessonId), 'userId': req.user._id }, function (err, obj) {
        if (!!err) {
            err.send(res);
            return;
        } else if (!obj) {
            new managers.error.NotFound(null, 'could not find lesson').send(res);
            return;
        } else {
            req.lesson = obj;
            next();
        }

    });
}


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
    getLessonForUser(req, res, function next() {
        res.send(req.lesson);
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

exports.getPublicLessons = function (req, res) {
    managers.lessons.getPublicLessons(function (err, result) {
        res.send(result);
    });
};

exports.getLessonIntro = function (req, res) {
    managers.lessons.getLessonIntro(req.params.lessonId, function (err, result) {
        res.send(result);
    });
};

exports.copyLesson = function (req, res) {
    getLessonForUser(req, res, function next() {
        managers.lessons.copyLesson(req.lesson, function (err, result) {
            res.send(result);
        });
    });
};


/**
 *
 *
 *              ---- new function format.
 *              this format will align to a new API REST format similar to http://api.stackexchange.com/docs/
 *
 *              it will assume user was authorized to get here, and will NOT assume user own the resource.
 *
 *              For example - update lesson will not assume the editor is the user on the request, but will
 *              assume the user on the request is allowed to edit this lesson;
 *
 *
 *
 */

exports.update = function( req, res ){

};

/**
 *
 * Creates a new lesson and assigns it to the logged in user.
 *
 * @param req
 * @param res
 */

exports.create = function (req, res) {
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