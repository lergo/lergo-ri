'use strict';

var controllers = require('../controllers');
var middlewares = require('../middlewares');
var permissions = require('../permissions');



// using a question to find lessons.
// where lesson.userId != question.userId
exports.findLessonsUsingQuestion = {
    'spec': {
        'path': '/lessons/using/question/{questionId}',
        'summary': 'find question usages',
        'method': 'GET',
        'parameters': [
            {
                'paramType': 'path',
                'name': 'questionId',
                required: true,
                'description': 'ID of question that usages to be find',
                'type': 'string'
            }
        ]
    },
    'middlewares' : [
        middlewares.questions.exists
    ],
    'action': controllers.lessons.findUsages
};

exports.getAdminLessons = {
    'spec': {
        'path': '/lessons/get/all',
        'summary': 'Get admin lessons',
        'method': 'GET'
    },
    'middlewares': [
        middlewares.session.isLoggedIn,
        middlewares.lessons.userCanSeePrivateLessons,
        middlewares.lergo.queryObjParsing
    ],
    'action': controllers.lessons.getAdminLessons
};


exports.getLessonIntro = {
    'spec': {
        'path': '/lessons/{lessonId}/intro',
        'summary': 'Get lesson intro',
        'method': 'GET'
    },
    'middlewares': [
        middlewares.session.optionalUserOnRequest,
        middlewares.lessons.exists,
        middlewares.lessons.cacheLessonsIntro
    ],
    'action': controllers.lessons.getLessonIntro
};


exports.getLessonsById = {
    'spec': {
        'path': '/lessons/find',
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
        ]
    },
    'action': controllers.lessons.findLessonsByIds
};


exports.createLesson = {
    'spec': {
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
        ]
    },
    'middlewares' : [
        middlewares.session.isLoggedIn
    ],
    'action': controllers.lessons.create
};

exports.getUserLessonById = {
    'spec': {
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
        ]
    },
    'middlewares' : [
        middlewares.session.optionalUserOnRequest,
        middlewares.lessons.exists
    ],
    'action': controllers.lessons.getLessonById
};


exports.getUserPermissions = {
    'spec': {
        'path': '/lessons/{lessonId}/permissions',
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
        ]
    },
    'middlewares': [
        middlewares.session.optionalUserOnRequest,
        middlewares.lessons.exists
    ],
    'action': function( req, res ){ res.send(permissions.lessons.getPermissions(req.sessionUser, req.lesson)); }
};

/* used for deleting invalid question / steps in lesson before running a lesson */
exports.fixLesson = {
    'spec': {
        'path': '/lessons/{lessonId}/fix',
        'summary': 'lesson is fixed on the fly',
        'method': 'POST',
        'parameters': [
            {
                'paramType': 'body',
                'name': 'lesson',
                required: true,
                'description': 'The fixed lesson',
                'type': 'Lesson'
            } ,
            {
                'paramType': 'path',
                'name': 'lessonId',
                required: true,
                'description': 'ID of lesson that needs to be fetched',
                'type': 'string'
            }
        ]
    },
    'middlewares' : [
        middlewares.lessons.exists,
    ],
    'action': controllers.lessons.fix
};
 

exports.editLesson = {
    'spec': {
        'path': '/lessons/{lessonId}/update',
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
        ]
    },
    'middlewares' : [
        middlewares.session.isLoggedIn,
        middlewares.lessons.exists,
        middlewares.lessons.userCanEdit
    ],
    'action': controllers.lessons.update
};

exports.publishLesson = {
    'spec': {
        'path': '/lessons/{lessonId}/publish',
        'summary': 'user publishes a lesson',
        'method': 'POST'
    },
    'middlewares' : [
        middlewares.session.isLoggedIn,
        middlewares.lessons.exists,
        middlewares.lessons.userCanPublish
    ],
    'action': controllers.lessons.publish
};

exports.unpublishLesson = {
    'spec': {
        'path': '/lessons/{lessonId}/unpublish',
        'summary': 'user unpublishes a lesson',
        'method': 'POST'
    },
    'middlewares' : [
        middlewares.session.isLoggedIn,
        middlewares.lessons.exists,
        middlewares.lessons.userCanUnpublish
    ],
    'action': controllers.lessons.unpublish
};

//Jeff: commentEmailSent
exports.commentEmailSent = {
    'spec': {
        'path': '/lessons/{lessonId}/commentEmailSent',
        'summary': 'user sent email about comment',
        'method': 'POST'
    },
    'middlewares' : [
        middlewares.session.isLoggedIn,
        middlewares.lessons.exists,
        middlewares.lessons.userCanPublish
    ],
    'action': controllers.lessons.commentEmailSent
};

exports.commentEmailNotSent = {
    'spec': {
        'path': '/lessons/{lessonId}/commentEmailNotSent',
        'summary': 'user did not send email about comment',
        'method': 'POST'
    },
    'middlewares' : [
        middlewares.session.isLoggedIn,
        middlewares.lessons.exists,
        middlewares.lessons.userCanPublish
    ],
    'action': controllers.lessons.commentEmailNotSent
};

exports.deleteLesson = {
    'spec': {
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
        ]
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
        ]
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
        ]
    },
    'middlewares' : [
        middlewares.session.isLoggedIn,
        middlewares.lessons.exists,
        middlewares.lessons.userCanEdit,
        middlewares.questions.exists
    ],
    'action': controllers.lessons.overrideQuestion
};

exports.copyLesson = {
    'spec': {
        'path': '/lessons/{lessonId}/copy',
        'summary': 'copy lesson. prefix title with "Copy for" new lesson',
        'method': 'POST'
    },
    'middlewares' : [
        middlewares.session.isLoggedIn,
        middlewares.lessons.exists,
        middlewares.lessons.userCanCopy
    ],
    'action': controllers.lessons.copyLesson
};


exports.getPublicLessons = {
    'spec'       : {
        'path'          : '/public/lessons',
        'summary'       : 'Get public lessons',
        'method'        : 'GET'
    },
    'middlewares': [middlewares.lergo.queryObjParsing],
    'action'     : controllers.lessons.getPublicLessons
};




