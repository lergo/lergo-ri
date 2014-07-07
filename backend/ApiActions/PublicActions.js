var controllers = require('../controllers');
exports.getPublicLessons = {
    'spec': {
        'description': 'Get public lessons',
        'name': 'getPublicLessons',
        'path': '/public/lessons',
        // 'notes': 'Returns 200 if everything went well, otherwise returns
        // error response',
        'summary': 'Get public lessons',
        'method': 'GET',
        'parameters': [

        ],
        'errorResponses': [
            {
                'code': 500,
                'reason': 'server error'
            }
        ],
        'nickname': 'getPublicLesons'
    },
    'action': controllers.lessons.getPublicLessons
};


exports.getLesson = {
    'spec': {
        'description': 'Get public lesson',
        'name': 'getPublicLesson',
        'path': '/public/lessons/{lessonId}',
        // 'notes': 'Returns 200 if everything went well, otherwise returns
        // error response',
        'summary': 'Get public lesson by id',
        'method': 'GET',
        'parameters': [

        ],
        'errorResponses': [
            {
                'code': 500,
                'reason': 'server error'
            }
        ],
        'nickname': 'getPublicLesson'
    },
    'action': controllers.lessons.getLessonIntro
};




