'use strict';

/**
 * @module UsersActions
 * @type {exports}
 */
var controllers = require('../controllers');
var middlewares = require('../middlewares');
var permissions = require('../permissions');

exports.signup = {
    'spec'  : {
        'description'   : 'Sign up a new user',
        'name'          : 'signup',
        'path'          : '/users/signup',
// 'notes': 'Returns 200 if everything went well, otherwise returns
// error response',
        'summary'       : 'Sign up a new user',
        'method'        : 'POST',
        'parameters'    : [{
            'paramType'  : 'body',
            'name'       : 'user',
            required     : true,
            'description': 'User signup details',
            'type'       : 'UserSignupForm'
        }],
        'errorResponses': [{
            'code'  : 500,
            'reason': 'unable to signup'
        }],
        'nickname'      : 'signupUser'
    },
    'action': controllers.users.signup
};

exports.login = {
    spec    : {
        'description'   : 'User login',
        'name'          : 'login',
        'path'          : '/users/login',
        'summary'       : 'user logs in and creates a new session. The backend is responsible to maintain the session.',
        'method'        : 'POST',
        'parameters'    : [{
            'paramType'  : 'body',
            'name'       : 'loginCredentials',
            require      : true,
            'description': 'login credentials',
            'type'       : 'LoginCredentials'
        }],
        'errorResponses': [{
            'code'  : 500,
            'reason': 'unable to login'
        }, {
            'code'  : 401,
            'reason': 'wrong username/password'
        }],
        'nickname'      : 'login'

    },
    'action': controllers.users.login
};

exports.validateUser = {
    'spec'  : {
        'description'   : 'Validate User Login',
        'name'          : 'validateUserLogin',
        'path'          : '/users/{userId}/validate',
        'summary'       : 'User validation',
        'method'        : 'POST',
        'parameters'    : [{
            'paramType'  : 'body',
            require      : true,
            'description': 'user validation data',
            'type'       : 'UserValidationData'
        }],
        'errorResponses': [{
            'code'  : 500,
            'reason': 'unable to validate'
        }, {
            'code'  : 401,
            'reason': 'invalid user details'
        }],
        'nickname'      : 'validateUser'

    },
    'action': controllers.users.validateUser
};

exports.resendValidateEmail = {
    'spec'  : {
        'description'   : 'Send validation email again',
        'name'          : 'resendValidationEmail',
        'path'          : '/users/validate/resend',
        'summary'       : 'Resend user validation email',
        'method'        : 'POST',
        'parameters'    : [{
            'paramType'  : 'body',
            require      : true,
            'description': 'login credentials',
            'type'       : 'LoginCredentials'
        }],
        'errorResponses': [{
            'code'  : 500,
            'reason': 'unable to send email'
        }, {
            'code'  : 401,
            'reason': 'invalid user details'
        }],
        'nickname'      : 'resendValidationEmail'

    },
    'action': controllers.users.resendValidationEmail
};

exports.changePassword = {
    'spec'  : {
        'description'   : 'Change Password',
        'name'          : 'changePassword',
        'path'          : '/users/changePassword',
        'summary'       : 'user changes password after clicking "request password reset" email.',
        'method'        : 'POST',
        'parameters'    : [{
            'paramType'  : 'body',
            'name'       : 'reset password details',
            require      : true,
            'description': 'details for resetting password',
            'type'       : 'ChangePasswordDetails'
        }],
        'errorResponses': [{
            'code'  : 500,
            'reason': 'unable to login'
        }, {
            'code'  : 401,
            'reason': 'wrong username/password'
        }],
        'nickname'      : 'login'

    },
    'action': controllers.users.changePassword
};

exports.resetPasswordRequest = {
    'spec'  : {
        'description'   : 'Request Password Reset',
        'name'          : 'resetPasswordRequest',
        'path'          : '/users/requestPasswordReset',
        'summary'       : 'user requests a password reset. A link is delivered to the user that leads to the password reset page.',
        'method'        : 'POST',
        'parameters'    : [{
            'paramType'  : 'body',
            'name'       : 'resetPasswordDetails',
            require      : true,
            'description': 'an object containing optional username and optional email. One of the two is required.',
            'type'       : 'RequestResetPasswordDetails'
        }],
        'errorResponses': [{
            'code'  : 500,
            'reason': 'unable to login'
        }, {
            'code'  : 401,
            'reason': 'wrong username/password'
        }],
        'nickname'      : 'resetPasswordRequest'

    },
    'action': controllers.users.requestPasswordReset
};

exports.logout = {
    'spec'  : {
        'description'   : 'Logout. Ends session.',
        'name'          : 'logout',
        'path'          : '/users/logout',
        'summary'       : 'logs out user. removes session. returns 200',
        'method'        : 'POST',
        'parameters'    : [],
        'errorResponses': [],
        'nickname'      : 'logout'

    },
    'action': controllers.users.logout
};

exports.disqusLogin = {
    'spec'       : {
        'description'   : 'Get disqus details',
        'name'          : 'disqusLogin',
        'path'          : '/user/disqusLogin',
        'summary'       : 'returns login details for disqus',
        'method'        : 'GET',
        'parameters'    : [],
        'errorResponses': [{
            'code'  : 401,
            'reason': 'not logged in'
        }],
        'nickname'      : 'disqusLogin'

    },
    'middlewares': [middlewares.session.isLoggedIn],
    'action'     : controllers.users.disqusLogin
};

exports.isLoggedIn = {
    'spec': {
        'description'   : 'Is User Logged In?',
        'name'          : 'isLoggedIn',
        'path'          : '/user/loggedin',
        'summary'       : 'returns user public details iff user is logged in. Otherwise 401.',
        'method'        : 'GET',
        'parameters'    : [],
        'errorResponses': [{
            'code'  : 401,
            'reason': 'not logged in'
        }],
        'nickname'      : 'isLoggedIn'

    },

    'action': controllers.users.isLoggedIn
};

exports.getUserQuestions = {
    'spec'       : {
        'description'   : 'Get questions',
        'name'          : 'getQuestions',
        'path'          : '/user/me/questions',
        'summary'       : 'Get all questions',
        'method'        : 'GET',
        'parameters'    : [],
        'errorResponses': [{
            'code'  : 500,
            'reason': 'unable to get question'
        }],
        'nickname'      : 'getQuestions'
    },
    'middlewares': [middlewares.session.isLoggedIn, middlewares.lergo.queryObjParsing],
    'action'     : controllers.questions.getQuestions
};

exports.getUsersById = {
    'spec'       : {
        'description'   : 'gets users by id. exposes details according to permissions',
        'name'          : 'getUsersById',
        'path'          : '/users/find',
// 'notes': 'Returns 200 if everything went well, otherwise returns
// error response',
        'summary'       : 'Find users',
        'method'        : 'GET',
        'parameters'    : [{
            'paramType'  : 'query',
            'name'       : 'usersId',
            'required'   : false,
            'description': 'list of ids to find',
            'type'       : 'array',
            'items'      : {
                'type': 'string'
            }
        }],
        'errorResponses': [{
            'code'  : 500,
            'reason': 'server error'
        }],
        'nickname'      : 'findUsers'
    },
    'middlewares': [middlewares.session.optionalUserOnRequest],
    'action'     : controllers.users.findUsersById
};

exports.getUserLessons = {
    'spec'       : {
        'description'   : 'Get user lessons',
        'name'          : 'getLessons',
        'path'          : '/user/me/lessons',
        'summary'       : 'Get user lessons',
        'method'        : 'GET',
        'parameters'    : [],
        'errorResponses': [{
            'code'  : 500,
            'reason': 'unable to get lesson'
        }],
        'nickname'      : 'getLessons'
    },
    'middlewares': [middlewares.session.isLoggedIn, middlewares.lergo.queryObjParsing],
    'action'     : controllers.lessons.getUserLessons
};

exports.getUserReports = {
    'spec'       : {
        'description'   : 'Get user Reports',
        'name'          : 'getReports',
        'path'          : '/user/me/reports',
        'summary'       : 'Get user reports',
        'method'        : 'GET',
        'parameters'    : [],
        'errorResponses': [{
            'code'  : 500,
            'reason': 'unable to get reports'
        }],
        'nickname'      : 'getReports'
    },
    'middlewares': [middlewares.session.isLoggedIn, middlewares.lergo.queryObjParsing],
    'action'     : controllers.reports.getUserReports
};

exports.getStudentsReports = {
    'spec'       : {
        'description'   : 'Get user students Reports',
        'name'          : 'getReportsByStudents',
        'path'          : '/user/me/studentsReports',
        'summary'       : 'Get user students reports',
        'method'        : 'GET',
        'parameters'    : [],
        'errorResponses': [{
            'code'  : 500,
            'reason': 'unable to get reports'
        }],
        'nickname'      : 'getReports'
    },
    'middlewares': [middlewares.session.isLoggedIn, middlewares.lergo.queryObjParsing],
    'action'     : controllers.reports.getUserStudentsReports
};

exports.lessonsInvitationsGetById = {
    'spec'  : {
        'description'   : 'Get a lesson invitation by id',
        'name'          : 'lessonInviteCreate',
        'path'          : '/lessonsinvitations/{id}/build',
        'summary'       : 'create a lesson invitation instance and sends an email',
        'method'        : 'GET',
        'parameters'    : [{
            'paramType'  : 'path',
            'name'       : 'id',
            required     : true,
            'description': 'ID of lesson to invite to',
            'type'       : 'string'
        }, {
            'paramType'  : 'query',
            'name'       : 'construct',
            'required'   : false,
            'description': 'if true, the invitation will construct its lesson in case one was not constructed before',
            'type'       : 'boolean'
        }, {
            'paramType'  : 'query',
            'name'       : 'constructForce',
            'required'   : false,
            'description': 'if true, the invitation will construct its lessons. if one was already constructed, it will be reconstructed',

            'type': 'boolean'
        }],
        'errorResponses': [{
            'code'  : 500,
            'reason': 'unable to get lesson invitation'
        }],
        'nickname'      : 'lessonInviteCreate'
    },
    'action': controllers.lessonsInvitations.build
};

exports.checkQuestionAnswer = {
    'spec'  : {
        'description'   : 'Check Question Answer',
        'name'          : 'checkQuestionAnswer',
        'path'          : '/questions/checkAnswer',
        'summary'       : 'checks if user answered question correctly',
        'method'        : 'POST',
        'parameters'    : [{
            'paramType': 'body',
            'name'     : 'question with answer',
            required   : true,
            'type'     : 'Question'
        }],
        'errorResponses': [{
            'code'  : 500,
            'reason': 'unable to check answer'
        }],
        'nickname'      : 'checkQuestionAnswer'
    },
    'action': controllers.questions.checkQuestionAnswer
};

exports.getUsers = {
    'spec'       : {
        'description'   : 'Get users',
        'name'          : 'getUsers',
        'path'          : '/users/get/all',
// 'notes': 'Returns 200 if everything went well, otherwise returns
// error response',
        'summary'       : 'get users',
        'method'        : 'GET',
        'parameters'    : [],
        'errorResponses': [{
            'code'  : 500,
            'reason': 'server error'
        }],
        'nickname'      : 'getUsers'
    },
    'action'     : controllers.users.getAll,
    'middlewares': [middlewares.session.isLoggedIn, middlewares.session.isAdmin]
};

exports.getPermissions = {
    'spec'       : {
        'description': 'Get user permissions',
        'name'       : 'getUserPermissions',
        'path'       : '/user/permissions',

        'summary'       : 'get user permissions',
        'method'        : 'GET',
        'parameters'    : [],
        'errorResponses': [{
            'code'  : 500,
            'reason': 'server error'
        }],
        'nickname'      : 'getUserPermissions'
    },
    'action'     : function (req, res) {
        res.send(permissions.app.getPermissions(req.sessionUser));
    },
    'middlewares': [middlewares.session.isLoggedIn

    ]
};

/*******************************************************************************
 *
 * User Likes Read Operations
 *
 *
 */
exports.getLike = {
    'spec'       : {
        'description'   : 'Get like',
        'name'          : 'getLike',
        'path'          : '/user/me/likes/{itemType}/{itemId}',
// 'notes': 'Returns 200 if everything went well, otherwise returns
// error response',
        'summary'       : 'gets a like',
        'method'        : 'GET',
        'parameters'    : [{
            'paramType'  : 'path',
            'name'       : 'itemId',
            'required'   : true,
            'description': 'item id',
            'type'       : 'ObjectIDHash'
        }, {
            'paramType'  : 'path',
            'name'       : 'itemType',
            'required'   : true,
            'description': 'item type',
            'type'       : 'LikeItemType'
        }

        ],
        'errorResponses': [{
            'code'  : 500,
            'reason': 'server error'
        }],
        'nickname'      : 'getItemLike'
    },
    'middlewares': [middlewares.session.isLoggedIn, middlewares.likes.itemExists, middlewares.likes.exists],
    'action'     : controllers.likes.getLike
};

exports.getUserPublicDetails = {
    'spec'       : {
        'description'   : 'Get user public details',
        'name'          : 'getUserPublicDetails',
        'path'          : '/users/{userId}/likes/{itemType}/{itemId}',
// 'notes': 'Returns 200 if everything went well, otherwise returns
// error response',
        'summary'       : 'gets a like',
        'method'        : 'GET',
        'parameters'    : [{
            'paramType'  : 'path',
            'name'       : 'itemId',
            'required'   : true,
            'description': 'item id',
            'type'       : 'ObjectIDHash'
        }, {
            'paramType'  : 'path',
            'name'       : 'itemType',
            'required'   : true,
            'description': 'item type',
            'type'       : 'LikeItemType'
        }

        ],
        'errorResponses': [{
            'code'  : 500,
            'reason': 'server error'
        }],
        'nickname'      : 'getItemLike'
    },
    'middlewares': [middlewares.users.exists, middlewares.likes.itemExists, middlewares.likes.exists],
    'action'     : controllers.likes.getLike
};

/**
 * Used, among others, for "created by" filter in public homepage and in admin.
 * so this action should be public.
 */
exports.getUsernames = {
    'spec'       : {
        'description'   : 'Get usernames',
        'name'          : 'getUsernames',
        'path'          : '/users/usernames',
// 'notes': 'Returns 200 if everything went well, otherwise returns
// error response',
        'summary'       : 'gets a like',
        'method'        : 'GET',
        'parameters'    : [],
        'errorResponses': [{
            'code'  : 500,
            'reason': 'server error'
        }],
        'nickname'      : 'getUsernames'
    },
    'middlewares': [/* public function */
    ],
    'action'     : controllers.users.getUsernames
};

exports.getUserInvites = {
    spec       : {
        description   : 'Get user invites',
        name          : 'getInvites',
        path          : '/user/me/invites',
        summary       : 'Get  invites',
        method        : 'GET',
        parameters    : [],
        errorResponses: [{
            code  : 500,
            reason: 'server error'
        }],

        nickname: 'getInvites'
    },
    middlewares: [middlewares.session.isLoggedIn, middlewares.lergo.queryObjParsing],
    action     : controllers.lessonsInvitations.find
};

exports.getUserLikedLessons = {
    'spec'       : {
        'description'   : 'Get user Liked lessons',
        'name'          : 'getLikedLessons',
        'path'          : '/user/me/liked/lessons',
        'summary'       : 'Get user liked lessons',
        'method'        : 'GET',
        'parameters'    : [],
        'errorResponses': [{
            'code'  : 500,
            'reason': 'unable to get lesson'
        }],
        'nickname'      : 'getLessons'
    },
    'middlewares': [middlewares.session.isLoggedIn, middlewares.lergo.queryObjParsing],
    'action'     : controllers.lessons.getUserLikedLessons
};
exports.getUserLikedQuestions = {
    'spec'       : {
        'description'   : 'Get user Liked questions',
        'name'          : 'getLikedQuestions',
        'path'          : '/user/me/liked/questions',
        'summary'       : 'Get user liked questions',
        'method'        : 'GET',
        'parameters'    : [],
        'errorResponses': [{
            'code'  : 500,
            'reason': 'unable to get question'
        }],
        'nickname'      : 'getQuestions'
    },
    'middlewares': [middlewares.session.isLoggedIn, middlewares.lergo.queryObjParsing],
    'action'     : controllers.questions.getUserLikedQuestions
};

exports.getMyProfile = {
    spec       : {
        description   : 'Get profile',
        name          : 'get profiled',
        path          : '/users/me/profile',
        summary       : 'Get logged in user profile',
        method        : 'GET',
        parameters    : [],
        errorResponses: [{
            code  : 500,
            reason: 'unable to get profile'
        }],
        nickname      : 'getMyProfile'
    },
    middlewares: [middlewares.session.isLoggedIn],
    action     : controllers.users.getMyProfile
};

exports.updateProfile = {
    spec       : {
        description   : 'Update profile',
        name          : 'updateProfile',
        path          : '/users/me/profile/update',
        summary       : 'Update user profile',
        method        : 'POST',
        parameters    : [],
        errorResponses: [{
            code  : 500,
            reason: 'unable to update profile'
        }],
        nickname      : 'updateProfile'
    },
    middlewares: [middlewares.session.isLoggedIn],
    action     : controllers.users.update
};
exports.getPublicProfile = {
    spec       : {
        description   : 'Get profile',
        name          : 'get profiled',
        path          : '/users/{username}/profile',
        summary       : 'Get logged in user profile',
        method        : 'GET',
        parameters    : [],
        errorResponses: [{
            code  : 500,
            reason: 'unable to get profile'
        }],
        nickname      : 'getPublicProfile'
    },
    middlewares: [middlewares.session.isLoggedIn],
    action     : controllers.users.getPublicProfile
};
