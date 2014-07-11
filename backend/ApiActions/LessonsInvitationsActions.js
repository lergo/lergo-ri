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


/**
 *
 * An action for logged in user to invite others for a lesson.
 * Since we have the userId on the session, we will want to keep track of it.
 *
 */
exports.lessonInviteCreate = {
    'spec': {
        'description': 'Create a lesson invitation',
        'name': 'lessonInviteCreate',
        'path': '/lessons/{lessonId}/invitations/create',
        'summary': 'create a lesson invitation instance and sends an email',
        'method': 'POST',
        'parameters': [
            {
                'paramType': 'path',
                'name': 'lessonId',
                required: true,
                'description': 'ID of lesson to invite to',
                'type': 'string'
            }
        ],
        'errorResponses': [
            {
                'code': 500,
                'reason': 'unable to create lesson invitation'
            }
        ],
        'nickname': 'lessonInviteCreate'
    },
    'middlewares' : [
        middlewares.lessons.exists,
        middlewares.users.optionalUserOnRequest
    ],
    'action': controllers.lessonsInvitations.create
};