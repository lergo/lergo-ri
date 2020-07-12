'use strict';

var controllers = require('../controllers');
var middlewares = require('../middlewares');
var permissions = require('../permissions');



// using a question to find playlists.
// where playlist.userId != question.userId
exports.findPlaylistsUsingQuestion = {
    'spec': {
        'path': '/playlists/using/question/{questionId}',
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
    'action': controllers.playlists.findUsages
};

exports.getAdminPlaylists = {
    'spec': {
        'path': '/playlists/get/all',
        'summary': 'Get admin playlists',
        'method': 'GET'
    },
    'middlewares': [
        middlewares.session.isLoggedIn,
        middlewares.playlists.userCanSeePrivatePlaylists,
        middlewares.lergo.queryObjParsing
    ],
    'action': controllers.playlists.getAdminPlaylists
};


exports.getPlaylistIntro = {
    'spec': {
        'path': '/playlists/{lessonId}/intro',
        'summary': 'Get playlist intro',
        'method': 'GET'
    },
    'middlewares': [
        middlewares.session.optionalUserOnRequest,
        middlewares.playlists.exists
    ],
    'action': controllers.playlists.getPlaylistIntro
};


exports.getPlaylistsById = {
    'spec': {
        'path': '/playlists/find',
        'summary': 'Find playlists',
        'method': 'GET',
        'parameters': [
            {
                'paramType': 'query',
                'name': 'playlistsId',
                'required': false,
                'description': 'list of ids to find',
                'type': 'array',
                'items': {
                    'type': 'string'
                }
            }
        ]
    },
    'action': controllers.playlists.findPlaylistsByIds
};


exports.createPlaylist = {
    'spec': {
        'path': '/playlists/create',
        'summary': 'Create new playlist',
        'method': 'POST',
        'parameters': [
            {
                'paramType': 'body',
                'name': 'playlist',
                required: true,
                'description': 'Playlist details',
                'type': 'Playlist'
            }
        ]
    },
    'middlewares' : [
        middlewares.session.isLoggedIn
    ],
    'action': controllers.playlists.create
};

exports.getUserPlaylistById = {
    'spec': {
        'path': '/playlists/{playlistId}',
        'summary': 'Get playlist by id',
        'method': 'GET',
        'parameters': [
            {
                'paramType': 'path',
                'name': 'lessonId',
                required: true,
                'description': 'ID of playlist that needs to be fetched',
                'type': 'string'
            }
        ]
    },
    'middlewares' : [
        middlewares.session.optionalUserOnRequest,
        middlewares.playlists.exists
    ],
    'action': controllers.playlists.getPlaylistById
};


exports.getUserPermissions = {
    'spec': {
        'path': '/playlists/{lessonId}/permissions',
        'summary': 'get user permissions for playlist',
        'method': 'GET',
        'parameters': [
            {
                'paramType': 'path',
                'name': 'lessonId',
                required: true,
                'description': 'ID of playlist that needs to be fetched',
                'type': 'string'
            }
        ]
    },
    'middlewares': [
        middlewares.session.optionalUserOnRequest,
        middlewares.playlists.exists
    ],
    'action': function( req, res ){ res.send(permissions.playlists.getPermissions(req.sessionUser, req.playlist)); }
};

/* used for deleting invalid question / steps in playlist before running a playlist */
exports.fixPlaylist = {
    'spec': {
        'path': '/playlists/{lessonId}/fix',
        'summary': 'playlist is fixed on the fly',
        'method': 'POST',
        'parameters': [
            {
                'paramType': 'body',
                'name': 'playlist',
                required: true,
                'description': 'The fixed playlist',
                'type': 'Playlist'
            } ,
            {
                'paramType': 'path',
                'name': 'lessonId',
                required: true,
                'description': 'ID of playlist that needs to be fetched',
                'type': 'string'
            }
        ]
    },
    'middlewares' : [
        middlewares.playlists.exists,
    ],
    'action': controllers.playlists.fix
};
 

exports.editPlaylist = {
    'spec': {
        'path': '/playlists/{lessonId}/update',
        'summary': 'user edits a playlist',
        'method': 'POST',
        'parameters': [
            {
                'paramType': 'body',
                'name': 'playlist',
                required: true,
                'description': 'The updated playlist',
                'type': 'Playlist'
            } ,
            {
                'paramType': 'path',
                'name': 'lessonId',
                required: true,
                'description': 'ID of playlist that needs to be fetched',
                'type': 'string'
            }
        ]
    },
    'middlewares' : [
        middlewares.session.isLoggedIn,
        middlewares.playlists.exists,
        middlewares.playlists.userCanEdit
    ],
    'action': controllers.playlists.update
};

exports.publishPlaylist = {
    'spec': {
        'path': '/playlists/{lessonId}/publish',
        'summary': 'user publishes a playlist',
        'method': 'POST'
    },
    'middlewares' : [
        middlewares.session.isLoggedIn,
        middlewares.playlists.exists,
        middlewares.playlists.userCanPublish
    ],
    'action': controllers.playlists.publish
};

exports.unpublishPlaylist = {
    'spec': {
        'path': '/playlists/{lessonId}/unpublish',
        'summary': 'user unpublishes a playlist',
        'method': 'POST'
    },
    'middlewares' : [
        middlewares.session.isLoggedIn,
        middlewares.playlists.exists,
        middlewares.playlists.userCanUnpublish
    ],
    'action': controllers.playlists.unpublish
};

exports.deletePlaylist = {
    'spec': {
        'path': '/playlists/{lessonId}/delete',
        'summary': 'Delete playlist corresponding to the id',
        'method': 'POST',
        'parameters': [
            {
                'paramType': 'path',
                'name': 'lessonId',
                required: true,
                'description': 'ID of playlist that needs to be deleted',
                'type': 'string'
            }
        ]
    },
    'middlewares' : [
        middlewares.session.isLoggedIn,
        middlewares.playlists.exists,
        middlewares.playlists.userCanDelete
    ],
    'action': controllers.playlists.deletePlaylist
};


exports.likePlaylist = {
    'spec': {
        'path': '/playlists/{lessonId}/delete',
        'summary': 'Delete playlist corresponding to the id',
        'method': 'POST',
        'parameters': [
            {
                'paramType': 'path',
                'name': 'lessonId',
                required: true,
                'description': 'ID of playlist that needs to be deleted',
                'type': 'string'
            }
        ]
    },
    'middlewares' : [
        middlewares.session.isLoggedIn,
        middlewares.playlists.exists,
        middlewares.playlists.userCanDelete
    ],
    'action': controllers.playlists.deletePlaylist
};


exports.overrideQuestion = {
    'spec': {
        'path': '/playlists/{lessonId}/question/{questionId}/override',
        'summary': 'copies and replaces question',
        'method': 'POST',
        'parameters': [
            {
                'paramType': 'path',
                'name': 'lessonId',
                required: true,
                'description': 'ID of playlist',
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
        middlewares.playlists.exists,
        middlewares.playlists.userCanEdit,
        middlewares.questions.exists
    ],
    'action': controllers.playlists.overrideQuestion
};

exports.copyPlaylist = {
    'spec': {
        'path': '/playlists/{lessonId}/copy',
        'summary': 'copy playlist. prefix title with "Copy for" new playlist',
        'method': 'POST'
    },
    'middlewares' : [
        middlewares.session.isLoggedIn,
        middlewares.playlists.exists,
        middlewares.playlists.userCanCopy
    ],
    'action': controllers.playlists.copyPlaylist
};


exports.getPublicPlaylists = {
    'spec'       : {
        'path'          : '/public/playlists',
        'summary'       : 'Get public playlists',
        'method'        : 'GET'
    },
    'middlewares': [middlewares.lergo.queryObjParsing],
    'action'     : controllers.playlists.getPublicPlaylists
};




