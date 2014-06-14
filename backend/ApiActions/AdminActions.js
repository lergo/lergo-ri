var controllers = require('../controllers');
exports.getAdminLessons = {
    'spec': {
        'description': 'Gets all lessons',
        'name': 'getAdminLessons',
        'path': '/backend/admin/lessons',
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


exports.updateLesson = {
    'spec': {
        'description': 'Updates a lesson',
        'name': 'updateLesson',
        'path': '/backend/admin/lessons/{lessonId}',
        // 'notes': 'Returns 200 if everything went well, otherwise returns
        // error response',
        'summary': 'Update lesson',
        'method': 'POST',
        'parameters': [
            {
                'paramType' : 'body',
                'require': true,
                'description': 'the lesson we want to save',
                'type': 'Lesson'
            }
        ],
        'errorResponses': [
            {
                'code': 500,
                'reason': 'server error'
            }
        ],
        'nickname': 'updateLessons'
    },
    'action': controllers.lessons.adminUpdateLesson
};
