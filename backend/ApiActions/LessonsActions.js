var controllers = require('../controllers');
var middlewares = require('../middlewares');



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
        middlewares.users.exists
    ],
    'action': controllers.lessons.create
};



exports.editLesson = {
    'spec': {
        'description': 'Edit Lesson',
        'name': 'editLesson',
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
    'action': controllers.lessons.update
};

exports.getAdminLessons = {
    'spec': {
        'description': 'Gets all lessons',
        'name': 'getAdminLessons',
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
    'action': controllers.lessons.getAdminLessons
};



