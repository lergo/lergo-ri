'use strict';

var controllers = require('../controllers');
var middlewares = require('../middlewares');
var permissions = require('../permissions');



// using a question to find playLists.
// where playList.userId != question.userId
exports.findLessonsUsingQuestion = {
    'spec': {
        'path': '/playLists/using/question/{questionId}',
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
    'action': controllers.playLists.findUsages
};

exports.getAdminLessons = {
    'spec': {
        'path': '/playLists/get/all',
        'summary': 'Get admin playLists',
        'method': 'GET'
    },
    'middlewares': [
        middlewares.session.isLoggedIn,
        middlewares.playLists.userCanSeePrivateLessons,
        middlewares.lergo.queryObjParsing
    ],
    'action': controllers.playLists.getAdminLessons
};


exports.getLessonIntro = {
    'spec': {
        'path': '/playLists/{playListId}/intro',
        'summary': 'Get playList intro',
        'method': 'GET'
    },
    'middlewares': [
        middlewares.session.optionalUserOnRequest,
        middlewares.playLists.exists
    ],
    'action': controllers.playLists.getLessonIntro
};


exports.getLessonsById = {
    'spec': {
        'path': '/playLists/find',
        'summary': 'Find playLists',
        'method': 'GET',
        'parameters': [
            {
                'paramType': 'query',
                'name': 'playListsId',
                'required': false,
                'description': 'list of ids to find',
                'type': 'array',
                'items': {
                    'type': 'string'
                }
            },
            LessonsActions.js
        ]
    },
    'action': controllers.playLists.findLessonsByIds
};


exports.createPlayList = {
    'spec': {
        'path': '/playLists/create',
        'summary': 'Create new playList',
        'method': 'POST',
        'parameters': [
            {
                'paramType': 'body',
                'name': 'playList',
                required: true,
                'description': 'PlayList details',
                'type': 'PlayList'
            }
        ]
    },
    'middlewares' : [
        middlewares.session.isLoggedIn
    ],
    'action': controllers.playLists.create
};

exports.getUserLessonById = {
    'spec': {
        'path': '/playLists/{playListId}',
        'summary': 'Get playList by id',
        'method': 'GET',
        'parameters': [
            {
                'paramType': 'path',
                'name': 'playListId',
                required: true,
                'description': 'ID of playList that needs to be fetched',
                'type': 'string'
            }
        ]
    },
    'middlewares' : [
        middlewares.session.optionalUserOnRequest,
        middlewares.playLists.exists
    ],
    'action': controllers.playLists.getLessonById
};


exports.getUserPermissions = {
    'spec': {
        'path': '/playLists/{playListId}/permissions',
        'summary': 'get user permissions for playList',
        'method': 'GET',
        'parameters': [
            {
                'paramType': 'path',
                'name': 'playListId',
                required: true,
                'description': 'ID of playList that needs to be fetched',
                'type': 'string'
            }
        ]
    },
    'middlewares': [
        middlewares.session.optionalUserOnRequest,
        middlewares.playLists.exists
    ],
    'action': function( req, res ){ res.send(permissions.playLists.getPermissions(req.sessionUser, req.playList)); }
};


exports.editLesson = {
    'spec': {
        'path': '/playLists/{playListId}/update',
        'summary': 'user edits a playList',
        'method': 'POST',
        'parameters': [
            {
                'paramType': 'body',
                'name': 'playList',
                required: true,
                'description': 'The updated playList',
                'type': 'Lesson'
            } ,
            {
                'paramType': 'path',
                'name': 'playListId',
                required: true,
                'description': 'ID of playList that needs to be fetched',
                'type': 'string'
            }
        ]
    },
    'middlewares' : [
        middlewares.session.isLoggedIn,
        middlewares.playLists.exists,
        middlewares.playLists.userCanEdit
    ],
    'action': controllers.playLists.update
};

exports.publishLesson = {
    'spec': {
        'path': '/playLists/{playListId}/publish',
        'summary': 'user publishes a playList',
        'method': 'POST'
    },
    'middlewares' : [
        middlewares.session.isLoggedIn,
        middlewares.playLists.exists,
        middlewares.playLists.userCanPublish
    ],
    'action': controllers.playLists.publish
};

exports.unpublishLesson = {
    'spec': {
        'path': '/playLists/{playListId}/unpublish',
        'summary': 'user unpublishes a playList',
        'method': 'POST'
    },
    'middlewares' : [
        middlewares.session.isLoggedIn,
        middlewares.playLists.exists,
        middlewares.playLists.userCanUnpublish
    ],
    'action': controllers.playLists.unpublish
};

exports.deleteLesson = {
    'spec': {
        'path': '/playLists/{playListId}/delete',
        'summary': 'Delete playList corresponding to the id',
        'method': 'POST',
        'parameters': [
            {
                'paramType': 'path',
                'name': 'playListId',
                required: true,
                'description': 'ID of playList that needs to be deleted',
                'type': 'string'
            }
        ]
    },
    'middlewares' : [
        middlewares.session.isLoggedIn,
        middlewares.playLists.exists,
        middlewares.playLists.userCanDelete
    ],
    'action': controllers.playLists.deleteLesson
};


exports.likeLesson = {
    'spec': {
        'path': '/playLists/{playListId}/delete',
        'summary': 'Delete playList corresponding to the id',
        'method': 'POST',
        'parameters': [
            {
                'paramType': 'path',
                'name': 'playListId',
                required: true,
                'description': 'ID of playList that needs to be deleted',
                'type': 'string'
            }
        ]
    },
    'middlewares' : [
        middlewares.session.isLoggedIn,
        middlewares.playLists.exists,
        middlewares.playLists.userCanDelete
    ],
    'action': controllers.playLists.deleteLesson
};


exports.overrideQuestion = {
    'spec': {
        'path': '/playLists/{playListId}/question/{questionId}/override',
        'summary': 'copies and replaces question',
        'method': 'POST',
        'parameters': [
            {
                'paramType': 'path',
                'name': 'playListId',
                required: true,
                'description': 'ID of playList',
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
        middlewares.playLists.exists,
        middlewares.playLists.userCanEdit,
        middlewares.questions.exists
    ],
    'action': controllers.playLists.overrideQuestion
};

exports.copyLesson = {
    'spec': {
        'path': '/playLists/{playListId}/copy',
        'summary': 'copy playList. prefix title with "Copy for" new playList',
        'method': 'POST'
    },
    'middlewares' : [
        middlewares.session.isLoggedIn,
        middlewares.playLists.exists,
        middlewares.playLists.userCanCopy
    ],
    'action': controllers.playLists.copyLesson
};


exports.getPublicLessons = {
    'spec'       : {
        'path'          : '/public/playLists',
        'summary'       : 'Get public playLists',
        'method'        : 'GET'
    },
    'middlewares': [middlewares.lergo.queryObjParsing],
    'action'     : controllers.playLists.getPublicLessons
};




