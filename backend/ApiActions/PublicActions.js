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