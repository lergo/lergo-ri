'use strict';

var controllers = require('../controllers');
var middlewares = require('../middlewares');
var permissions = require('../permissions');

exports.getAdminLessons = {
    'spec': {
        'description': 'Gets all lessons',
        'name': 'getAllLessons',
        'path': '/lessons/get/all',
        // 'notes': 'Returns 200 if everything went well, otherwise returns
        // error response',
        'summary': 'Get admin lessons',
        'method': 'GET',
        'parameters': [

        ],
        'errorResponses': [
            {
                'code': 500,
                'reason': 'server error'
            }
        ],
        'nickname': 'getAdminLessons'
    },
    'middlewares': [
        middlewares.session.isLoggedIn,
        middlewares.lessons.userCanSeePrivateLessons
    ],
    'action': controllers.lessons.getAdminLessons
};


exports.getLessonIntro = {
    'spec': {
        'description': 'Gets all lessons',
        'name': 'getLessonIntro',
        'path': '/lessons/{lessonId}/intro',
        // 'notes': 'Returns 200 if everything went well, otherwise returns
        // error response',
        'summary': 'Get lesson intro',
        'method': 'GET',
        'parameters': [

        ],
        'errorResponses': [
            {
                'code': 500,
                'reason': 'server error'
            }
        ],
        'nickname': 'getLessonIntro'
    },
    'middlewares': [
        middlewares.session.optionalUserOnRequest,
        middlewares.lessons.exists
    ],
    'action': controllers.lessons.getLessonIntro
};


exports.getLessonsById = {
    'spec': {
        'description': 'Gets all lessons by id',
        'name': 'getLessonsById',
        'path': '/lessons/find',
        // 'notes': 'Returns 200 if everything went well, otherwise returns
        // error response',
        'summary': 'Find lessons',
        'method': 'GET',
        'parameters': [
            {
                'paramType': 'query',
                'name': 'lessonsId',
                'required': false,
                'description': 'list of ids to find',
                'type': 'array',
                'items': {
                    'type': 'string'
                }
            }
        ],
        'errorResponses': [
            {
                'code': 500,
                'reason': 'server error'
            }
        ],
        'nickname': 'findLessons'
    },
    'action': controllers.lessons.findLessonsByIds
};


exports.createLesson = {
    'spec': {
        'description': 'Create lesson',
        'name': 'create',
        'path': '/lessons/create',
        'summary': 'Create new lesson',
        'method': 'POST',
        'parameters': [
            {
                'paramType': 'body',
                'name': 'lesson',
                required: true,
                'description': 'Lesson details',
                'type': 'Lesson'
            }
        ],
        'errorResponses': [
            {
                'code': 500,
                'reason': 'unable to create'
            }
        ],
        'nickname': 'createLesson'
    },
    'middlewares' : [
        middlewares.session.isLoggedIn
    ],
    'action': controllers.lessons.create
};

exports.getUserLessonById = {
    'spec': {
        'description': 'Get lesson by id',
        'name': 'getUserLessonsById',
        'path': '/lessons/{lessonId}',
        'summary': 'Get lesson by id',
        'method': 'GET',
        'parameters': [
            {
                'paramType': 'path',
                'name': 'lessonId',
                required: true,
                'description': 'ID of lesson that needs to be fetched',
                'type': 'string'
            }
        ],
        'errorResponses': [
            {
                'code': 500,
                'reason': 'unable to get lesson'
            }
        ],

        'nickname': 'getLessonById'
    },
    'middlewares' : [
        middlewares.session.optionalUserOnRequest,
        middlewares.lessons.exists,
        middlewares.lessons.userCanViewLesson
    ],
    'action': controllers.lessons.getLessonById
};


exports.getUserPermissions = {
    'spec': {
        'description': 'Get user lesson permission',
        'name': 'getUserLessonPermissions',
        'path': '/lessons/{lessonId}/permissions',
        // 'notes': 'Returns 200 if everything went well, otherwise returns
        // error response',
        'summary': 'get user permissions for lesson',
        'method': 'GET',
        'parameters': [
            {
                'paramType': 'path',
                'name': 'lessonId',
                required: true,
                'description': 'ID of lesson that needs to be fetched',
                'type': 'string'
            }
        ],
        'errorResponses': [
            {
                'code': 500,
                'reason': 'unable to get permissions'
            }
        ],
        'nickname': 'getUserLessonPermissions'
    },
    'middlewares': [
        middlewares.session.optionalUserOnRequest,
        middlewares.lessons.exists
    ],
    'action': function( req, res ){ res.send(permissions.lessons.getPermissions(req.lesson,req.sessionUser)); }
};


exports.editLesson = {
    'spec': {
        'description': 'Edit Lesson',
        'name': 'updateLesson',
        'path': '/lessons/{lessonId}/update',
        // 'notes': 'Returns 200 if everything went well, otherwise returns
        // error response',
        'summary': 'user edits a lesson',
        'method': 'POST',
        'parameters': [
            {
                'paramType': 'body',
                'name': 'lesson',
                required: true,
                'description': 'The updated lesson',
                'type': 'Lesson'
            } ,
            {
                'paramType': 'path',
                'name': 'lessonId',
                required: true,
                'description': 'ID of lesson that needs to be fetched',
                'type': 'string'
            }
        ],
        'errorResponses': [
            {
                'code': 500,
                'reason': 'unable to signup'
            }
        ],
        'nickname': 'editLesson'
    },
    'middlewares' : [
        middlewares.session.isLoggedIn,
        middlewares.lessons.exists,
        middlewares.lessons.userCanEdit
    ],
    'action': controllers.lessons.update
};

exports.deleteLesson = {
    'spec': {
        'description': 'Delete lesson corresponding to the id',
        'name': 'deleteLesson',
        'path': '/lessons/{lessonId}/delete',
        'summary': 'Delete lesson corresponding to the id',
        'method': 'POST',
        'parameters': [
            {
                'paramType': 'path',
                'name': 'lessonId',
                required: true,
                'description': 'ID of lesson that needs to be deleted',
                'type': 'string'
            }
        ],
        'errorResponses': [
            {
                'code': 500,
                'reason': 'unable to delete lesson'
            }
        ],
        'nickname': 'deleteLesson'
    },
    'middlewares' : [
        middlewares.session.isLoggedIn,
        middlewares.lessons.exists,
        middlewares.lessons.userCanDelete
    ],
    'action': controllers.lessons.deleteLesson
};


exports.likeLesson = {
    'spec': {
        'description': 'Delete lesson corresponding to the id',
        'name': 'deleteLesson',
        'path': '/lessons/{lessonId}/delete',
        'summary': 'Delete lesson corresponding to the id',
        'method': 'POST',
        'parameters': [
            {
                'paramType': 'path',
                'name': 'lessonId',
                required: true,
                'description': 'ID of lesson that needs to be deleted',
                'type': 'string'
            }
        ],
        'errorResponses': [
            {
                'code': 500,
                'reason': 'unable to delete lesson'
            }
        ],
        'nickname': 'deleteLesson'
    },
    'middlewares' : [
        middlewares.session.isLoggedIn,
        middlewares.lessons.exists,
        middlewares.lessons.userCanDelete
    ],
    'action': controllers.lessons.deleteLesson
};


exports.overrideQuestion = {
    'spec': {
        'description': 'Copies and replaces question',
        'name': 'copyAndReplaceQuestion',
        'path': '/lessons/{lessonId}/question/{questionId}/override',
        'summary': 'copies and replaces question',
        'method': 'POST',
        'parameters': [
            {
                'paramType': 'path',
                'name': 'lessonId',
                required: true,
                'description': 'ID of lesson',
                'type': 'string'
            },
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
                'reason': 'unable to override'
            }
        ],
        'nickname': 'overrideQuestion'
    },
    'middlewares' : [
        middlewares.session.isLoggedIn,
        middlewares.lessons.exists,
        middlewares.lessons.userCanEdit,
        middlewares.questions.exists,
        middlewares.questions.userCanCopy
    ],
    'action': controllers.lessons.overrideQuestion
};

exports.copyLesson = {
    'spec': {
        'description': 'Copy lesson',
        'name': 'copy',
        'path': '/lessons/{lessonId}/copy',
        'summary': 'copy lesson. prefix title with "Copy for" new lesson',
        'method': 'POST',
        'parameters': [

        ],
        'errorResponses': [
            {
                'code': 500,
                'reason': 'unable to copy'
            }
        ],
        'nickname': 'copyLesson'
    },
    'middlewares' : [
        middlewares.session.isLoggedIn,
        middlewares.lessons.exists,
        middlewares.lessons.userCanCopy
    ],
    'action': controllers.lessons.copyLesson
};


