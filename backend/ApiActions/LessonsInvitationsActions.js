var middlewares = require('../middlewares');
var controllers = require('../controllers');

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
        'summary': 'create a lesson invitation instance ',
        'method': 'POST',
        'parameters': [
            {
                'paramType': 'path',
                'name': 'lessonId',
                required: true,
                'description': 'ID of lesson to invite to',
                'type': 'string'
            },
            {
                'paramType': 'body',
                required: false,
                'description': 'invitation details',
                'type': 'InvitationDetails'
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