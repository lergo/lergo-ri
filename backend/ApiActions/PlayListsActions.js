'use strict';

var controllers = require('../controllers');
var middlewares = require('../middlewares');
var permissions = require('../permissions');



// using a question to find playLists.
// where playList.userId != question.userId
exports.findPlayListsUsingQuestion = {
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

exports.getAdminPlayLists = {
    'spec': {
        'path': '/playLists/get/all',
        'summary': 'Get admin playLists',
        'method': 'GET'
    },
    'middlewares': [
        middlewares.session.isLoggedIn,
        middlewares.playLists.userCanSeePrivatePlayLists,
        middlewares.lergo.queryObjParsing
    ],
    'action': controllers.playLists.getAdminPlayLists
};


exports.getPlayListIntro = {
    'spec': {
        'path': '/playLists/{playListId}/intro',
        'summary': 'Get playList intro',
        'method': 'GET'
    },
    'middlewares': [
        middlewares.session.optionalUserOnRequest,
        middlewares.playLists.exists
    ],
    'action': controllers.playLists.getPlayListIntro
};


exports.getPlayListsById = {
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
        ]
    },
    'action': controllers.playLists.findPlayListsByIds
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

exports.getUserPlayListById = {
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
    'action': controllers.playLists.getPlayListById
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


exports.editPlayList = {
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
                'type': 'PlayList'
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

exports.publishPlayList = {
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

exports.unpublishPlayList = {
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

exports.deletePlayList = {
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
    'action': controllers.playLists.deletePlayList
};


exports.likePlayList = {
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
    'action': controllers.playLists.deletePlayList
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

exports.copyPlayList = {
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
    'action': controllers.playLists.copyPlayList
};


exports.getPublicPlayLists = {
    'spec'       : {
        'path'          : '/public/playLists',
        'summary'       : 'Get public playLists',
        'method'        : 'GET'
    },
    'middlewares': [middlewares.lergo.queryObjParsing],
    'action'     : controllers.playLists.getPublicPlayLists
};




