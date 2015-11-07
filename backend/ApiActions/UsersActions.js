'use strict';

/**
 * @module UsersActions
 * @type {exports}
 */
var controllers = require('../controllers');
var middlewares = require('../middlewares');


/**
 *
 * IMPORTANT: Has to be before getUser
 *
 * Used, among others, for "created by" filter in public homepage and in admin.
 * so this action should be public.
 */
exports.getUsernames = {
    'spec': {
        'path': '/users/usernames',
        'summary': 'gets a like',
        'method': 'GET'
    },
    'middlewares': [/* public function */],
    'action': controllers.users.getUsernames
};



exports.signup = {
    'spec': {
        'path': '/users/signup',
        'summary': 'Sign up a new user',
        'method': 'POST',
        'parameters': [{
            'paramType': 'body',
            'name': 'user',
            required: true,
            'description': 'User signup details',
            'type': 'UserSignupForm'
        }]
    },
    'action': controllers.users.signup
};

exports.login = {
    spec: {
        'path': '/users/login',
        'summary': 'user logs in and creates a new session. The backend is responsible to maintain the session.',
        'method': 'POST',
        'parameters': [{
            'paramType': 'body',
            'name': 'loginCredentials',
            require: true,
            'description': 'login credentials',
            'type': 'LoginCredentials'
        }]
    },
    'action': controllers.users.login
};

exports.validateUser = {
    'spec': {
        'path': '/users/{userId}/validate',
        'summary': 'User validation',
        'method': 'POST',
        'parameters': [{
            'paramType': 'body',
            require: true,
            'description': 'user validation data',
            'type': 'UserValidationData'
        }]
    },
    'action': controllers.users.validateUser
};

exports.resendValidateEmail = {
    'spec': {
        'path': '/users/validate/resend',
        'summary': 'Resend user validation email',
        'method': 'POST',
        'parameters': [{
            'paramType': 'body',
            require: true,
            'description': 'login credentials',
            'type': 'LoginCredentials'
        }]
    },
    'action': controllers.users.resendValidationEmail
};

exports.changePassword = {
    'spec': {
        'path': '/users/changePassword',
        'summary': 'user changes password after clicking "request password reset" email.',
        'method': 'POST',
        'parameters': [{
            'paramType': 'body',
            'name': 'reset password details',
            require: true,
            'description': 'details for resetting password',
            'type': 'ChangePasswordDetails'
        }]
    },
    'action': controllers.users.changePassword
};

exports.resetPasswordRequest = {
    'spec': {
        'path': '/users/requestPasswordReset',
        'summary': 'user requests a password reset. A link is delivered to the user that leads to the password reset page.',
        'method': 'POST',
        'parameters': [{
            'paramType': 'body',
            'name': 'resetPasswordDetails',
            require: true,
            'description': 'an object containing optional username and optional email. One of the two is required.',
            'type': 'RequestResetPasswordDetails'
        }]
    },
    'action': controllers.users.requestPasswordReset
};

exports.logout = {
    'spec': {
        'path': '/users/logout',
        'summary': 'logs out user. removes session. returns 200',
        'method': 'POST'

    },
    'action': controllers.users.logout
};

exports.disqusLogin = {
    'spec': {
        'path': '/user/disqusLogin',
        'summary': 'returns login details for disqus',
        'method': 'GET'
    },
    'middlewares': [middlewares.session.isLoggedIn],
    'action': controllers.users.disqusLogin
};

exports.isLoggedIn = {
    'spec': {
        'path': '/user/loggedin',
        'summary': 'returns user public details iff user is logged in. Otherwise 401.',
        'method': 'GET'
    },
    'middlewares' : [
        middlewares.session.optionalUserOnRequest
    ],
    'action': controllers.users.isLoggedIn
};

exports.getUserPermissions = {
    'spec' : {
        'path' : '/user/me/permissions',
        'summary' : 'gets user permissions',
        'method' : 'GET'
    },
    middlewares: [middlewares.session.isLoggedIn ],
    'action' : controllers.users.getMyPermissions
};

exports.getUserQuestions = {
    'spec': {
        'path': '/user/me/questions',
        'summary': 'Get all questions',
        'method': 'GET'
    },
    'middlewares': [middlewares.session.isLoggedIn, middlewares.lergo.queryObjParsing],
    'action': controllers.questions.getQuestions
};

exports.getUsersById = {
    'spec': {
        'path': '/users/find',
        'summary': 'Find users',
        'method': 'GET',
        'parameters': [{
            'paramType': 'query',
            'name': 'usersId',
            'required': false,
            'description': 'list of ids to find',
            'type': 'array',
            'items': {
                'type': 'string'
            }
        }]
    },
    'middlewares': [middlewares.session.optionalUserOnRequest],
    'action': controllers.users.findUsersById
};

exports.getUserLessons = {
    'spec': {
        'path': '/user/me/lessons',
        'summary': 'Get user lessons',
        'method': 'GET'
    },
    'middlewares': [middlewares.session.isLoggedIn, middlewares.lergo.queryObjParsing],
    'action': controllers.lessons.getUserLessons
};

exports.getUserReports = {
    'spec': {
        'path': '/user/me/reports',
        'summary': 'Get user reports',
        'method': 'GET'
    },
    'middlewares': [middlewares.session.isLoggedIn, middlewares.lergo.queryObjParsing],
    'action': controllers.reports.getUserReports
};

exports.getStudentsReports = {
    'spec': {
        'path': '/user/me/studentsReports',
        'summary': 'Get user students reports',
        'method': 'GET'
    },
    'middlewares': [middlewares.session.isLoggedIn, middlewares.lergo.queryObjParsing],
    'action': controllers.reports.getUserStudentsReports
};

exports.getUser = {
    'spec' : {
        'path' : '/users/{userId}',
        'summary' : 'Gets a user by id',
        'method' : 'GET'
    },
    'middlewares' : [
        middlewares.session.isLoggedIn,
        middlewares.users.exists,
        middlewares.users.canSeeAllUsers
    ],
    'action': function getUser(req, res){ res.send(req.user);}
};

exports.checkQuestionAnswer = {
    'spec': {
        'path': '/questions/checkAnswer',
        'summary': 'checks if user answered question correctly',
        'method': 'POST',
        'parameters': [{
            'paramType': 'body',
            'name': 'question with answer',
            required: true,
            'type': 'Question'
        }]
    },
    'action': controllers.questions.checkQuestionAnswer
};

exports.getUsers = {
    'spec': {
        'path': '/users/get/all',
        'summary': 'get users',
        'method': 'GET'
    },
    'action': controllers.users.getAll,
    'middlewares': [
        middlewares.session.isLoggedIn,
        middlewares.users.canSeeAllUsers,
        middlewares.lergo.queryObjParsing
    ]
};

exports.getPermissions = {
    'spec': {
        'path': '/user/permissions',
        'summary': 'get user permissions',
        'method': 'GET'
    },
    'action': function (req, res) {
        var result = req.sessionUser ? req.sessionUser.permissions : [];
        res.send(result);
    },
    'middlewares': [
        middlewares.session.optionalUserOnRequest
    ]
};

/*******************************************************************************
 *
 * User Likes Read Operations
 *
 *
 */
exports.getLike = {
    'spec': {
        'path': '/user/me/likes/{itemType}/{itemId}',
        'summary': 'gets a like',
        'method': 'GET',
        'parameters': [
            {
                'paramType': 'path',
                'name': 'itemId',
                'required': true,
                'description': 'item id',
                'type': 'ObjectIDHash'
            },
            {
                'paramType': 'path',
                'name': 'itemType',
                'required': true,
                'description': 'item type',
                'type': 'LikeItemType'
            }
        ]
    },
    'middlewares': [middlewares.session.isLoggedIn, middlewares.likes.itemExists, middlewares.likes.exists],
    'action': controllers.likes.getLike
};

exports.getUserPublicDetails = {
    'spec': {
        'path': '/users/{userId}/likes/{itemType}/{itemId}',
        'summary': 'gets a like',
        'method': 'GET',
        'parameters': [
            {
                'paramType': 'path',
                'name': 'itemId',
                'required': true,
                'description': 'item id',
                'type': 'ObjectIDHash'
            },
            {
                'paramType': 'path',
                'name': 'itemType',
                'required': true,
                'description': 'item type',
                'type': 'LikeItemType'
            }
        ]
    },
    'middlewares': [middlewares.users.exists, middlewares.likes.itemExists, middlewares.likes.exists],
    'action': controllers.likes.getLike
};


exports.getUserInvites = {
    spec: {
        path: '/user/me/invites',
        summary: 'Get  invites',
        method: 'GET'
    },
    middlewares: [middlewares.session.isLoggedIn, middlewares.lergo.queryObjParsing],
    action: controllers.lessonsInvitations.find
};

exports.getUserLikedLessons = {
    'spec': {
        'path': '/user/me/liked/lessons',
        'summary': 'Get user liked lessons',
        'method': 'GET'
    },
    'middlewares': [middlewares.session.isLoggedIn, middlewares.lergo.queryObjParsing],
    'action': controllers.lessons.getUserLikedLessons
};
exports.getUserLikedQuestions = {
    'spec': {
        'path': '/user/me/liked/questions',
        'summary': 'Get user liked questions',
        'method': 'GET'
    },
    'middlewares': [middlewares.session.isLoggedIn, middlewares.lergo.queryObjParsing],
    'action': controllers.questions.getUserLikedQuestions
};

exports.getMyProfile = {
    spec: {
        path: '/users/me/profile',
        summary: 'Get logged in user profile',
        method: 'GET'
    },
    middlewares: [middlewares.session.isLoggedIn],
    action: controllers.users.getMyProfile
};

exports.updateProfile = {
    spec: {
        path: '/users/me/profile/update',
        summary: 'Update user profile',
        method: 'POST'
    },
    middlewares: [middlewares.session.isLoggedIn],
    action: controllers.users.update
};


exports.getUserPublicProfile = {
    spec: {
        path: '/public/{username}/profile',
        summary: 'Get public user profile',
        method: 'GET'
    },
    middlewares: [],
    action: controllers.users.getPublicProfile
};




exports.patchUser = {
    spec: {
        path: '/users/{userId}',
        summary: 'changes the user record',
        method:'PATCH'
    },
    middlewares: [
        middlewares.session.isLoggedIn,
        middlewares.users.exists,
        middlewares.users.canPatchUsers
    ],
    action: controllers.users.patchUser
};
