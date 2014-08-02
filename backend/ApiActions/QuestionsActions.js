'use strict';
var controllers = require('../controllers');
var middlewares = require('../middlewares');
var permissions = require('../permissions');

exports.create = {
    'spec': {
        'description': 'Create question',
        'name': 'create',
        'path': '/questions/create',
        'summary': 'Create new question',
        'method': 'POST',
        'parameters': [
            {
                'paramType': 'body',
                'name': 'question',
                required: true,
                'description': 'Question details',
                'type': 'Question'
            }
        ],
        'errorResponses': [
            {
                'code': 500,
                'reason': 'unable to create'
            }
        ],
        'nickname': 'createQuestion'
    },
    'middlewares' : [
        middlewares.users.exists
    ],
    'action': controllers.questions.create
};

exports.getById  = {
    'spec': {
        'description': 'Get question by id',
        'name': 'getQuestionById',
        'path': '/questions/{questionId}',
        'summary': 'Get question by id',
        'method': 'GET',
        'parameters': [
            {
                'paramType': 'path',
                'name': 'questionId',
                required: true,
                'description': 'ID of question that needs to be fetched',
                'type': 'string'
            }
        ],
        'errorResponses': [
            {
                'code': 500,
                'reason': 'unable to get lesson'
            }
        ],

        'nickname': 'getQuestionById'
    },
    'middlewares' : [
        middlewares.questions.exists
    ],
    'action': controllers.questions.getQuestionById
};


exports.getUserPermissions = {
    'spec': {
        'description': 'Get user lesson permission',
        'name': 'getUserLessonPermissions',
        'path': '/questions/{questionId}/permissions',
        // 'notes': 'Returns 200 if everything went well, otherwise returns
        // error response',
        'summary': 'get user permissions for question',
        'method': 'GET',
        'parameters': [
            {
                'paramType': 'path',
                'name': 'questionId',
                required: true,
                'description': 'ID of question',
                'type': 'string'
            }
        ],
        'errorResponses': [
            {
                'code': 500,
                'reason': 'unable to get permissions'
            }
        ],
        'nickname': 'getUserQuestionPermissions'
    },
    'middlewares': [
        middlewares.users.exists,
        middlewares.questions.exists
    ],
    'action': function( req, res ){ res.send(permissions.questions.getPermissions(req.question,req.user)); }
};


exports.editQuestion = {
    'spec': {
        'description': 'Edit Question',
        'name': 'updateQuestion',
        'path': '/questions/{questionId}/update',
        // 'notes': 'Returns 200 if everything went well, otherwise returns
        // error response',
        'summary': 'user edits a question',
        'method': 'POST',
        'parameters': [
            {
                'paramType': 'body',
                'name': 'question',
                required: true,
                'description': 'The updated lesson',
                'type': 'Question'
            } ,
            {
                'paramType': 'path',
                'name': 'questionId',
                required: true,
                'description': 'ID of question',
                'type': 'string'
            }
        ],
        'errorResponses': [
            {
                'code': 500,
                'reason': 'unable to signup'
            }
        ],
        'nickname': 'editQuestion'
    },
    'middlewares' : [
        middlewares.users.exists,
        middlewares.questions.exists,
        middlewares.questions.userCanEdit
    ],
    'action': controllers.questions.update
};





