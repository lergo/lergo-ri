var controllers = require('../controllers');
exports.signup = {
	'spec' : {
		'description' : 'Sign up a new user',
		'name' : 'signup',
		'path' : '/backend/users/signup',
		// 'notes': 'Returns 200 if everything went well, otherwise returns
		// error response',
		'summary' : 'Sign up a new user',
		'method' : 'POST',
		'parameters' : [ {
			'paramType' : 'body',
			'name' : 'user',
			required : true,
			'description' : 'User signup details',
			'type' : 'UserSignupForm'
		} ],
		'errorResponses' : [ {
			'code' : 500,
			'reason' : 'unable to signup'
		} ],
		'nickname' : 'signupUser'
	},
	'action' : controllers.users.signup
};

exports.login = {
	'spec' : {
		'description' : 'User login',
		'name' : 'login',
		'path' : '/backend/users/login',
		'summary' : 'user logs in and creates a new session. The backend is responsible to maintain the session.',
		'method' : 'POST',
		'parameters' : [ {
			'paramType' : 'body',
			'name' : 'loginCredentials',
			require : true,
			'description' : 'login credentials',
			'type' : 'LoginCredentials'
		} ],
		'errorResponses' : [ {
			'code' : 500,
			'reason' : 'unable to login'
		}, {
			'code' : 401,
			'reason' : 'wrong username/password'
		} ],
		'nickname' : 'login'

	},
	'action' : controllers.users.login
};

exports.logout = {
	'spec' : {
		'description' : 'Logout. Ends session.',
		'name' : 'logout',
		'path' : '/backend/users/logout',
		'summary' : 'logs out user. removes session. returns 200',
		'method' : 'POST',
		'parameters' : [],
		'errorResponses' : [],
		'nickname' : 'logout'

	},
	'action' : controllers.users.logout
};

exports.isLoggedIn = {
	'spec' : {
		'description' : 'Is User Logged In?',
		'name' : 'isLoggedIn',
		'path' : '/backend/user/loggedin',
		'summary' : 'returns user public details iff user is logged in. Otherwise 401.',
		'method' : 'GET',
		'parameters' : [],
		'errorResponses' : [ {
			'code' : 401,
			'reason' : 'not logged in'
		} ],
		'nickname' : 'isLoggedIn'

	},
	'action' : controllers.users.isLoggedIn
};



exports.createQuestion = {
	'spec' : {
		'description' : 'Create question',
		'name' : 'create',
		'path' : '/backend/user/questions',
		'summary' : 'Create new question',
		'method' : 'POST',
		'parameters' : [ {
			'paramType' : 'body',
			'name' : 'question',
			required : true,
			'description' : 'Question details',
			'type' : 'Question'
		} ],
		'errorResponses' : [ {
			'code' : 500,
			'reason' : 'unable to create'
		} ],
		'nickname' : 'createQuestion'
	},
	'action' : controllers.questions.createQuestion
};
exports.getQuestions = {
	'spec' : {
		'description' : 'Get questions',
		'name' : 'getQuestions',
		'path' : '/backend/user/questions',
		'summary' : 'Get all questions',
		'method' : 'GET',
		'parameters' : [],
		'errorResponses' : [ {
			'code' : 500,
			'reason' : 'unable to get question'
		} ],
		'nickname' : 'getQuestions'
	},
	'action' : controllers.questions.getQuestions
};

exports.findQuestionsByIds = {
    'spec' : {
        'description': 'Finds multiple questions by list of ids',
        'name': 'findQuestionsById',
        'path': '/backend/questions/find',
        'summary': 'Finds multiple questions by list of ids',
        'method': 'GET',
        'parameters': [
            {
                'paramType': 'query',
                'name': 'ids',
                'required': false,
                'description': 'list of ids to find',
                'type': 'array',
                'items': {
                    'type': 'string'
                }

            }
        ],
        'nickname': 'findQuestionsById'


    },
    'action' : controllers.questions.findUserQuestionsByIds
};


exports.getQuestionById = {
	'spec' : {
		'description' : 'Get question by id',
		'name' : 'getQuestions',
		'path' : '/backend/user/questions/{id}',
		'summary' : 'Get question by id',
		'method' : 'GET',
		'parameters' : [ {
			'paramType' : 'path',
			'name' : 'id',
			required : true,
			'description' : 'ID of question that needs to be fetched',
			'type' : 'string'
		} ],
		'errorResponses' : [ {
			'code' : 500,
			'reason' : 'unable to get question'
		} ],
		'nickname' : 'getQuestionById'
	},
	'action' : controllers.questions.getQuestionById
};
exports.updateQuestion = {
	'spec' : {
		'description' : 'Updates question',
		'name' : 'update question',
		'path' : '/backend/user/questions/{id}',
		'summary' : 'Update question',
		'method' : 'POST',
		'parameters' : [ {
			'paramType' : 'body',
			'name' : 'question',
			required : true,
			'description' : 'Question details',
			'type' : 'Question'
		}, {
			'paramType' : 'path',
			'name' : 'id',
			required : true,
			'description' : 'ID of question that needs to be updated',
			'type' : 'string'
		} ],
		'errorResponses' : [ {
			'code' : 500,
			'reason' : 'unable to update'
		} ],
		'nickname' : 'updateQuestion'
	},
	'action' : controllers.questions.updateQuestion
};
exports.findQuestionUsages = {
	'spec' : {
		'description' : 'find question usages',
		'name' : 'findQuestionUsages',
		'path' : '/backend/user/questions/{id}/usages',
		'summary' : 'find question usages',
		'method' : 'GET',
		'parameters' : [ {
			'paramType' : 'path',
			'name' : 'id',
			required : true,
			'description' : 'ID of question that usages to be find',
			'type' : 'string'
		} ],
		'errorResponses' : [ {
			'code' : 500,
			'reason' : 'unable to find Usages'
		} ],
		'nickname' : 'findQuestionUsages'
	},
	'action' : controllers.questions.findUsages
};

exports.createLesson = {
	'spec' : {
		'description' : 'Create lesson',
		'name' : 'create',
		'path' : '/backend/user/lessons',
		'summary' : 'Create new lesson',
		'method' : 'POST',
		'parameters' : [ {
			'paramType' : 'body',
			'name' : 'lesson',
			required : true,
			'description' : 'Lesson details',
			'type' : 'Lesson'
		} ],
		'errorResponses' : [ {
			'code' : 500,
			'reason' : 'unable to create'
		} ],
		'nickname' : 'createLesson'
	},
	'action' : controllers.lessons.createLesson
};
exports.getUserLessons = {
	'spec' : {
		'description' : 'Get lessons',
		'name' : 'getLessons',
		'path' : '/backend/user/lessons',
		'summary' : 'Get all lessons',
		'method' : 'GET',
		'parameters' : [],
		'errorResponses' : [ {
			'code' : 500,
			'reason' : 'unable to get lesson'
		} ],
		'nickname' : 'getLessons'
	},
	'action' : controllers.lessons.getUserLessons
};
exports.getLessonById = {
	'spec' : {
		'description' : 'Get lesson by id',
		'name' : 'getLessons',
		'path' : '/backend/user/lessons/{id}',
		'summary' : 'Get lesson by id',
		'method' : 'GET',
		'parameters' : [ {
			'paramType' : 'path',
			'name' : 'id',
			required : true,
			'description' : 'ID of lesson that needs to be fetched',
			'type' : 'string'
		} ],
		'errorResponses' : [ {
			'code' : 500,
			'reason' : 'unable to get lesson'
		} ],
		'nickname' : 'getLessonById'
	},
	'action' : controllers.lessons.getLessonById
};
exports.updateLesson = {
	'spec' : {
		'description' : 'Create lesson',
		'name' : 'create',
		'path' : '/backend/user/lessons/{id}',
		'summary' : 'Update lesson',
		'method' : 'POST',
		'parameters' : [ {
			'paramType' : 'body',
			'name' : 'lesson',
			required : true,
			'description' : 'Lesson details',
			'type' : 'Lesson'
		}, {
			'paramType' : 'path',
			'name' : 'id',
			required : true,
			'description' : 'ID of lesson that needs to be updated',
			'type' : 'string'
		} ],
		'errorResponses' : [ {
			'code' : 500,
			'reason' : 'unable to update'
		} ],
		'nickname' : 'updateLesson'
	},
	'action' : controllers.lessons.updateLesson
};



exports.deleteLesson = {
		'spec' : {
			'description' : 'Delete lesson corresponding to the id',
			'name' : 'deleteLesson',
			'path' : '/backend/user/lessons/{id}/delete',
			'summary' : 'Delete lesson corresponding to the id',
			'method' : 'POST',
			'parameters' : [ {
				'paramType' : 'path',
				'name' : 'id',
				required : true,
				'description' : 'ID of lesson that needs to be deleted',
				'type' : 'string'
			} ],
			'errorResponses' : [ {
				'code' : 500,
				'reason' : 'unable to delete lesson'
			} ],
			'nickname' : 'deleteLesson'
		},
		'action' : controllers.lessons.deleteLesson
	};