var middlewares = require('../middlewares');
var controllers = require('../controllers');

exports.createAnonymousInvitation = {
    'spec': {
        'description': 'Create an anonymous lesson invitation',
        'name': 'createAnonymousInvitation',
        'nickname': 'createAnonymousInvitation',
        'path': '/lessons/:lessonId/invitations/create',
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
    'middlewares':[
        middlewares.users.optionalUserOnRequest,
        middlewares.lessons.exists
    ],
    'action': controllers.lessonsInvitations.createAnonymous
};