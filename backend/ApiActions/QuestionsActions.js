'use strict';
var controllers = require('../controllers');
var middlewares = require('../middlewares');
var permissions = require('../permissions');



exports.getPublicLessonQuestions = {
    'spec': {
        'description': 'find all questions for public lessons ',
        'name': 'getPublicLessonQuestions',
        'path': '/questions/publicLessons',
        'summary': 'finds all questions of public lessons',
        'method': 'GET',
        'parameters': [
        ],
        'nickname': 'getPublicLessonQuestions'


    },
    'middlewares' : [

        middlewares.lergo.queryParamsDefault
    ],
    'action': controllers.questions.getPublicLessonQuestions
};

exports.copyQuestion = {
    'spec': {
        'description': 'Copy question',
        'name': 'copy',
        'path': '/questions/{questionId}/copy',
        'summary': 'copy question. prefix title with "Copy for" new question',
        'method': 'POST',
        'parameters': [

        ],
        'errorResponses': [
            {
                'code': 500,
                'reason': 'unable to copy'
            }
        ],
        'nickname': 'copyQuestion'
    },
    'middlewares' : [
        middlewares.session.isLoggedIn,
        middlewares.questions.exists
    ],
    'action': controllers.questions.copyQuestion
};

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
        middlewares.session.isLoggedIn
    ],
    'action': controllers.questions.create
};


exports.findQuestionsByIds = {
    'spec': {
        'description': 'Finds multiple questions by list of ids',
        'name': 'findQuestionsById',
        'path': '/questions/find',
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
    'action': controllers.questions.findQuestionsByIds
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
        middlewares.session.isLoggedIn,
        middlewares.questions.exists
    ],
    'action': function( req, res ){ res.send(permissions.questions.getPermissions(req.question,req.sessionUser)); }
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
        middlewares.session.isLoggedIn,
        middlewares.questions.exists,
        middlewares.questions.userCanEdit
    ],
    'action': controllers.questions.update
};





