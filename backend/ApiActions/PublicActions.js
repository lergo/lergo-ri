var controllers = require('../controllers');
exports.getPublicLessons = {
    'spec': {
        'description': 'Get public lessons',
        'name': 'getPublicLessons',
        'path': '/backend/public/lessons',
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
        'path': '/backend/public/lessons/{lessonId}',
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


exports.createAnonymousInvitation = {
    'spec': {
        'description': 'Create an anonymous lesson invitation',
        'name': 'createAnonymousInvitation',
        'nickname': 'createAnonymousInvitation',
        'path': '/backend/public/lessons/{lessonId}/invitations/create',
        // 'notes': 'Returns 200 if everything went well, otherwise returns
        // error response',
        'summary': 'Get public lessons',
        'method': 'POST',
        'parameters': [

        ],
        'errorResponses': [
            {
                'code': 500,
                'reason': 'server error'
            }
        ]

    },
    'action': controllers.lessonsInvitations.createAnonymous
};

exports.getStatistics = {
    'spec': {
        'description': 'Get system statistics ',
        'name': 'getPublicLessons',
        'path': '/backend/public/system/statistics',
        // 'notes': 'Returns 200 if everything went well, otherwise returns
        // error response',
        'summary': 'Get system statistics ',
        'method': 'GET',
        'parameters': [

        ],
        'errorResponses': [
            {
                'code': 500,
                'reason': 'server error'
            }
        ],
        'nickname': 'getStatistics'
    },
    'action': controllers.stats.getStatistics
};

exports.getTranslations = {
    'spec': {
        'description': 'Get translation for locale',
        'name': 'getPublicLessons',
        'path': '/backend/public/translations/{locale}.json',
        // 'notes': 'Returns 200 if everything went well, otherwise returns
        // error response',
        'summary': 'Get system translation',
        'method': 'GET',
        'parameters': [
            {
                'paramType': 'path',
                'name': 'locale',
                required: true,
                'description': 'locale to fetch',
                'type': 'string'
            }
        ],
        'errorResponses': [
            {
                'code': 500,
                'reason': 'server error'
            }
        ],
        'nickname': 'getTranslation'
    },
    'action': controllers.stats.getTranslation
};
