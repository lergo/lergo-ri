'use strict';

/**
 * @module LessonsController
 * @type {exports}
 */

var managers = require('../managers');
var services = require('../services');
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
		_id : 1
	}, function(err, result) {
		if (!!err) {
			err.send(res);
			return;
		}
		var mapResults = {};
		_.each(result, function(r) {
			mapResults[r.itemId.toString()] = r._id.getTimestamp();
		});
		queryObj.filter._id = {
			$in : _.map(result, 'itemId')
		};
		managers.lessons.complexSearch(queryObj, function(err, obj) {
			if (!!err) {
				err.send(res);
				return;
			} else {
				_.each(obj.data, function(o) {
					o.lastUpdate = mapResults[o._id.toString()];
				});
				return res.send(obj);
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

        var usersId = _.map(result.data,'userId');
        Lesson.countPublicLessonsByUser( usersId , function(err, publicCountByUser ){
            if ( !!err ){
                new managers.error.InternalServerError(err, 'unable to add count for public lessons').send(res);
                return;
            }
            _.each(result.data, function(r){
                r.publicCount = publicCountByUser[r.userId];
            });
            res.send(result);
        });
	});
};

exports.adminUpdateLesson = function(req, res) {
	var lesson = req.body;
	lesson.userId = services.db.id(lesson.userId);
	lesson._id = services.db.id(lesson._id);
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

var previousHour = 0;
var userCache = {};  // these are all the users with public lessons and will be used in the createdBy filter
var enHomePageLessons = {};
var heHomePageLessons = {};
var arHomePageLessons = {};

exports.getPublicLessons = function(req, res) {
	var d = new Date();
	var currentHour = d.getHours(); // updating every hour
	var qObjFilter = req.queryObj.filter;
	var qObjProjec = req.queryObj.projection;
	// 'mustHaveUndefined' prevents any filter query from being cached as default homepage query
	var mustHaveUndefined = !qObjFilter.hasOwnProperty('tags.label') && qObjFilter.subject === undefined && qObjFilter.age === undefined && qObjFilter.userId === undefined && qObjFilter.searchText === undefined && qObjFilter.views === undefined;

	var userFlag = false;
	var heLessonsFlag = false;
	var enLessonsFlag = false;
	var arLessonsFlag = false;
	// checking if this is a user/usernames query
	if ( qObjFilter && qObjFilter.public && Object.values(qObjFilter.public).includes(1) && qObjProjec && qObjProjec.userId === 1 && req.queryObj.limit === 0 ) {
		userFlag = true;  // if we don't have cached usernames, this flag will enable saving it at the end of code
		logger.info('is a usernames query: ');
		if (!_.isEmpty(userCache)) {
			logger.info('using the usernames cache with', userCache.data.length, 'users');
			res.send(userCache);
			if (currentHour !== previousHour) { // reset the home page link every hour
				previousHour = currentHour;
				logger.info('usernames cache: updating hour to ', previousHour);
				userCache = {}; // setting userCache to empty
				enHomePageLessons = {}; // setting enHomePageLessons to empty
				arHomePageLessons = {}; // setting arHomePageLessons to empty
				heHomePageLessons = {}; // setting heHomePageLessons to empty
			}
			return;
			
		} else {
			logger.info('need to cache the  usernames');
		}
	} else {
		//logger.info('not usernames query: ');
	}

	//  english, arabic, hebrew, lesson cache - using 'mustHaveUndefined'
	if ( qObjFilter && qObjFilter.public && Object.values(qObjFilter.public).includes(1) && req.queryObj.limit === 18 && req.queryObj.skip === 0 && mustHaveUndefined) {
		if (qObjFilter.language === 'english') {
			enLessonsFlag = true;  
			if (!_.isEmpty(enHomePageLessons)) {
				logger.info('using the enHomePageLessons cache', enHomePageLessons.data.length, ' lessons');
				res.send(enHomePageLessons);
				if (currentHour !== previousHour) { // reset the home page link every day
					previousHour = currentHour;
					logger.info('usernames cache: updating hour to ', previousHour);
					userCache = {}; // setting userCache to empty
					enHomePageLessons = {}; // setting enHomePageLessons to empty
					arHomePageLessons = {}; // setting arHomePageLessons to empty
					heHomePageLessons = {}; // setting heHomePageLessons to empty
				}
				return;
				
			} else {
				logger.info('need to cache homepage english lessons');
			}
		} else if (qObjFilter.language === 'arabic') {
			arLessonsFlag = true;  
			if (!_.isEmpty(arHomePageLessons)) {
				logger.info('using the arHomePageLessons cache', arHomePageLessons.data.length, ' lessons');
				res.send(arHomePageLessons);
				if (currentHour !== previousHour) { // reset the home page link every day
					previousHour = currentHour;
					logger.info('arabic homepage lessons cache: updating hour to ', previousHour);
					userCache = {}; // setting userCache to empty
					enHomePageLessons = {}; // setting enHomePageLessons to empty
					arHomePageLessons = {}; // setting arHomePageLessons to empty
					heHomePageLessons = {}; // setting heHomePageLessons to empty
				}
				return;
				
			} else {
				logger.info('need to cache homepage arabic lessons');
			}
		} else if (qObjFilter.language === 'hebrew') {
			heLessonsFlag = true;  
			if (!_.isEmpty(heHomePageLessons)) {
				logger.info('using the heHomePageLessons cache', heHomePageLessons.data.length, ' lessons');
				res.send(heHomePageLessons);
				if (currentHour !== previousHour) { // reset the home page link every day
					previousHour = currentHour;
					logger.info('hebrew homepage lessons cache: updating hour to ', previousHour);
					userCache = {}; // setting userCache to empty
					enHomePageLessons = {}; // setting enHomePageLessons to empty
					arHomePageLessons = {}; // setting arHomePageLessons to empty
					heHomePageLessons = {}; // setting heHomePageLessons to empty
				}
				return;
				
			} else {
				logger.info('need to cache homepage hebrew lessons');
			}
		
		} else {
			logger.info('not caching this language: ',qObjFilter.language );
		}
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
			
			if (userFlag === true) {
				logger.info('caching the public usernames');
				userCache = lessons;
			} 
			if (enLessonsFlag === true) {
				logger.info('caching the english home page lessons');
				enHomePageLessons = lessons;
			} 
			if (heLessonsFlag === true) {
				logger.info('caching the hebrew home page lessons');
				heHomePageLessons = lessons;
			} 
			if (arLessonsFlag === true) {
				logger.info('caching the arabic home page lessons');
				arHomePageLessons = lessons;
			} 
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

function _updateLesson( lesson , res ){
    managers.lessons.updateLesson(lesson, function(err, obj) {
        if (!!err) {
            err.send(res);
            return;
        } else {
            res.send(obj);
            return;
        }
    });
}

function _unsetPublic( lesson , res ){
    managers.lessons.unsetPublic(lesson, function(err, obj) {
        if (!!err) {
            err.send(res);
            return;
        } else {
            res.send(obj);
            return;
        }
    });
}

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
	lesson._id = services.db.id(lesson._id);

    _updateLesson( lesson, res );

};


/**
 *
 * This function only publishes a lesson.
 *
 * We separate this from 'update' to allow the existance of 'publishers' in the system which are not 'editors'.
 *
 * @param req
 * @param res
 */
exports.publish = function(req, res){
    var lesson = req.lesson;
    lesson.public = new Date().getTime();
    _updateLesson( lesson, res );
};


/**
 *
 * This function only unpublishes a lesson.
 *
 * We separate this from 'update' to allow the existance of 'publishers' in the system which are not 'editors'.
 *
 * @param req
 * @param res
 */
exports.unpublish = function(req, res){
    var lesson = req.lesson;
    _unsetPublic( lesson, res );
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
	objectIds = services.db.id(objectIds);

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
	Lesson.findByQuizItems(req.question, function(err, obj) {
		if (!!err) {
			err.send(res);
			return;
		} else {
			res.send(obj);
			return;
		}
	});
};
