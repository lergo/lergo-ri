'use strict';
var controllers = require('../controllers');
var middlewares = require('../middlewares');
var permissions = require('../permissions');

exports.getPublicLessonQuestions = {
	'spec' : {
		'path' : '/questions/publicLessons',
		'summary' : 'finds all questions of public lessons',
		'method' : 'GET'

	},
	'middlewares' : [ middlewares.lergo.queryObjParsing ],
	'action' : controllers.questions.getPublicLessonQuestions
};

exports.copyQuestion = {
	'spec' : {
		'path' : '/questions/{questionId}/copy',
		'summary' : 'copy question. prefix title with "Copy for" new question',
		'method' : 'POST'
	},
	'middlewares' : [ middlewares.session.isLoggedIn, middlewares.questions.exists ],
	'action' : controllers.questions.copyQuestion
};

exports.create = {
	'spec' : {
		'path' : '/questions/create',
		'summary' : 'Create new question',
		'method' : 'POST',
		'parameters' : [ {
			'paramType' : 'body',
			'name' : 'question',
			required : true,
			'description' : 'Question details',
			'type' : 'Question'
		} ]
	},
	'middlewares' : [ middlewares.session.isLoggedIn ],
	'action' : controllers.questions.create
};

exports.findQuestionsByIds = {
	'spec' : {
		'path' : '/questions/find',
		'summary' : 'Finds multiple questions by list of ids',
		'method' : 'GET',
		'parameters' : [ {
			'paramType' : 'query',
			'name' : 'ids',
			'required' : false,
			'description' : 'list of ids to find',
			'type' : 'array',
			'items' : {
				'type' : 'string'
			}

		} ]
	},
	'middlewares' : [ middlewares.questions.cacheFindQuestionsByIds],
	'action' : controllers.questions.findQuestionsByIds
};

exports.getById = {
	'spec' : {
		'path' : '/questions/{questionId}',
		'summary' : 'Get question by id',
		'method' : 'GET',
		'parameters' : [ {
			'paramType' : 'path',
			'name' : 'questionId',
			required : true,
			'description' : 'ID of question that needs to be fetched',
			'type' : 'string'
		} ]
	},
	'middlewares' : [ middlewares.questions.exists ],
	'action' : controllers.questions.getQuestionById
};

exports.getUserPermissions = {
	'spec' : {
		'path' : '/questions/{questionId}/permissions',
		'summary' : 'get user permissions for question',
		'method' : 'GET',
		'parameters': [
			{
				'paramType': 'path',
				'name': 'questionId',
				required: true,
				'description': 'ID of question',
				'type': 'string'
			}
		]
	},
	'middlewares' : [
		middlewares.session.optionalUserOnRequest,
		middlewares.questions.exists,
        middlewares.questions.questionIsUsedByPublicLesson
	],
	'action' : function(req, res) {
		res.send(permissions.questions.getPermissions(req.sessionUser, req.question, req.questionUsedByPublicLesson ));
	}
};

exports.editQuestion = {
	'spec' : {
		'path' : '/questions/{questionId}/update',
		'summary' : 'user edits a question',
		'method' : 'POST',
		'parameters' : [ {
			'paramType' : 'body',
			'name' : 'question',
			required : true,
			'description' : 'The updated lesson',
			'type' : 'Question'
		}, {
			'paramType' : 'path',
			'name' : 'questionId',
			required : true,
			'description' : 'ID of question',
			'type' : 'string'
		} ]
	},
	'middlewares' : [ 
		middlewares.session.isLoggedIn, 
		middlewares.questions.exists, 
		middlewares.questions.userCanEdit,
		middlewares.questions.deleteKeyFromRedis
	 ],
	'action' : controllers.questions.update
};
/* used for deleting invalid questions before playing a lesson */
exports.removeQuestion = {
	'spec' : {
		'path' : '/questions/{questionId}/remove',
		'summary' : 'Remoive invalid question corresponding to the id',
		'method' : 'POST',
		'parameters' : [ {
			'paramType' : 'path',
			'name' : 'questionId',
			required : true,
			'description' : 'ID of question that needs to be removed',
			'type' : 'string'
		} ]
	},
	'middlewares' : [ middlewares.questions.exists],
	'action' : controllers.questions.removeQuestion
};

exports.deleteQuestion = {
	'spec' : {
		'path' : '/questions/{questionId}/delete',
		'summary' : 'Delete question corresponding to the id',
		'method' : 'POST',
		'parameters' : [ {
			'paramType' : 'path',
			'name' : 'questionId',
			required : true,
			'description' : 'ID of question that needs to be deleted',
			'type' : 'string'
		} ]
	},
	'middlewares' : [ middlewares.session.isLoggedIn, middlewares.questions.exists, middlewares.questions.userCanDelete ],
	'action' : controllers.questions.deleteQuestion
};
