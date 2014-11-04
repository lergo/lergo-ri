'use strict';
var managers = require('../managers');
var async = require('async');
var logger = require('log4js').getLogger('LessonsController');
var Lesson = require('../models/Lesson');
var _ = require('lodash');
var Like = require('../models/Like');

exports.getUserLessons = function(req, res) {
	var queryObj = req.queryObj;
	queryObj.filter.userId = req.sessionUser._id;
	managers.lessons.complexSearch(queryObj, function(err, obj) {
		if (!!err) {
			err.send(res);
			return;
		} else {
			res.send(obj);
			return;
		}
	});
};

exports.getUserLikedLessons = function(req, res) {
	var queryObj = req.queryObj;
	Like.find({
		userId : req.sessionUser._id,
		itemType : 'lesson'
	}, {
		itemId : 1,
		_id : 0
	}, function(err, result) {
		if (!!err) {
			err.send(res);
			return;
		}
		queryObj.filter._id = {
			$in : _.map(result, 'itemId')
		};
		managers.lessons.complexSearch(queryObj, function(err, obj) {
			if (!!err) {
				err.send(res);
				return;
			} else {
				res.send(obj);
				return;
			}
		});
	});

};

// assumes user and lesson exists and user can see lesson
// or lesson is public and then we don't need user
exports.getLessonById = function(req, res) {
	if (!req.lesson) {
		new managers.error.NotFound('could not find lesson').send(res);
		return;
	}
	res.send(req.lesson);
};

exports.getAdminLessons = function(req, res) {

	managers.lessons.complexSearch(req.queryObj, function(err, result) {
		if (!!err) {
			new managers.error.InternalServerError(err, 'unable to get all admin lessons').send(res);
			return;
		}
		res.send(result);
	});
};

exports.adminUpdateLesson = function(req, res) {
	var lesson = req.body;
	lesson.userId = managers.db.id(lesson.userId);
	lesson._id = managers.db.id(lesson._id);
	managers.lessons.updateLesson(lesson, function(err, obj) {
		if (!!err) {
			err.send(res);
			return;
		} else {
			res.send(obj);
			return;
		}
	});
};

exports.getPublicLessons = function(req, res) {

	try {
		var queryObj = req.queryObj;

		if (!queryObj.filter || !queryObj.filter.public || queryObj.filter.public.$exists !== 1) {

			throw new Error('public must be $exists 1');
		}
	} catch (e) {
		res.status(400).send('lessons controller - illegal filter value : ' + e.message);
		return;
	}

	var lessons = [];
	async.waterfall([ function loadLessons(callback) {
		managers.lessons.complexSearch(req.queryObj, function(err, result) {
			if (!!err) {
				callback(new managers.error.InternalServerError(err, 'unable to get all admin lessons'));
				return;
			}
			lessons = result;
			callback();
		});
	}, function loadUsers(callback) {

		var usersId = _.map(lessons.data, 'userId');
		managers.users.getPublicUsersDetailsMapByIds(usersId, function(err, usersById) {

			if (!!err) {
				callback(new managers.error.InternalServerError(err, 'unable to load users by id'));
				return;
			}
			_.each(lessons.data, function(l) {
				l.user = usersById[l.userId];
			});

			callback();
		});
	} ], function returnResponse(err) {
		if (!!err) {
			err.send(res);
			return;
		} else {
			res.send(lessons);
		}
	});

};

exports.getLessonIntro = function(req, res) {
	managers.lessons.getLessonIntro(req.params.lessonId, function(err, result) {
		res.send(result);
	});
};

exports.overrideQuestion = function(req, res) {
	logger.info('overriding question :: ' + req.question._id + ' in lesson ::' + req.lesson._id);

	var newQuestion = null;
	async.waterfall([ function copyQuestion(callback) {
		logger.info('copying question');
		managers.questions.copyQuestion(req.sessionUser, req.question, callback);
	}, function replaceQuestion(_newQuestion, callback) {
		logger.info('replacing question');
		try {
			newQuestion = _newQuestion;
			var oldQuestion = req.question;
			var lessonObj = new Lesson(req.lesson);
			lessonObj.replaceQuestionInLesson(oldQuestion._id.toString(), newQuestion._id.toString());
			lessonObj.update();
			callback(null);
			return;
		} catch (e) {
			logger.error('unable to override question', e);
			callback(e);
			return;
		}
		// wrap lesson object with our model and invoke save.

	} ], function(err) {
		logger.info('override async finished');
		if (!!err) {
			res.status(500).send('unable to replace' + err.message);
			return;
		} else if (newQuestion === null) {
			res.status(500).send('unknown error');
			return;
		} else { // newQuestion != null
			logger.info('completed successfully');
			res.status(200).send({
				'lesson' : req.lesson,
				'quizItem' : newQuestion
			});
		}
	});
};

exports.copyLesson = function(req, res) {
	managers.lessons.copyLesson(req.sessionUser, req.lesson, function(err, result) {
		res.send(result);
	});
};

/**
 * 
 * 
 * ---- new function format. this format will align to a new API REST format
 * similar to http://api.stackexchange.com/docs/
 * 
 * it will assume user was authorized to get here, and will NOT assume user own
 * the resource.
 * 
 * For example - update lesson will not assume the editor is the user on the
 * request, but will assume the user on the request is allowed to edit this
 * lesson;
 * 
 * 
 * 
 */

exports.update = function(req, res) {
	logger.info('updating lesson');
	var lesson = req.body;

	lesson.userId = req.lesson.userId;
	lesson._id = managers.db.id(lesson._id);
	managers.lessons.updateLesson(lesson, function(err, obj) {
		if (!!err) {
			err.send(res);
			return;
		} else {
			res.send(obj);
			return;
		}
	});
};

/**
 * 
 * Creates a new lesson and assigns it to the logged in user.
 * 
 * @param req
 * @param res
 */

exports.create = function(req, res) {
	var lesson = {};
	lesson.userId = req.sessionUser._id;
	managers.lessons.createLesson(lesson, function(err, obj) {
		if (!!err) {
			err.send(res);
			return;
		} else {
			res.send(obj);
			return;
		}
	});
};

/**
 * gets a list of ids and returns the corresponding lessons.
 * 
 * how to pass a list of ids over req query?
 * 
 * ?idsList[]=1&idsList[]=2&idsList[]=3
 * 
 * @param req
 * @param res
 */
exports.findLessonsByIds = function(req, res) {

	var objectIds = req.getQueryList('lessonsId');
	logger.info('this is object ids', objectIds);
	objectIds = managers.db.id(objectIds);

	Lesson.find({
		'_id' : {
			'$in' : objectIds
		}
	}, {}, function(err, result) {
		if (!!err) {
			new managers.error.InternalServerError(err, 'unable to find lessons by ids').send(res);
			return;
		} else {
			res.send(result);
			return;
		}
	});
};

exports.deleteLesson = function(req, res) {
	managers.lessons.deleteLesson(req.lesson._id, function(err, deletedLesson) {
		if (!!err) {
			logger.error('error deleting lesson', err);
			err.send(res);
			return;
		} else {
			managers.lessonsInvitations.deleteByLessonId(req.lesson._id, function(err/*
																						 * ,
																						 * deletedInvitations
																						 */) {
				if (!!err) {
					logger.error('error deleting lessons invitations', err);
					err.send(res);
					return;
				} else {
					res.send(deletedLesson);
					return;
				}
			});
		}
	});

};

exports.findUsages = function(req, res) {
	managers.lessons.findUsages(req.question, function(err, obj) {
		if (!!err) {
			err.send(res);
			return;
		} else {
			res.send(obj);
			return;
		}
	});
};
