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
		'description' : 'Create question',
		'name' : 'create',
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
