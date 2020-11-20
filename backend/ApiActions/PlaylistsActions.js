'use strict';

var controllers = require('../controllers');
var middlewares = require('../middlewares');
var permissions = require('../permissions');



// using a lesson to find playlists.
// where playlist.userId != lesson.userId
exports.findPlaylistsUsingLesson = {
    'spec': {
        'path': '/playlists/using/lesson/{lessonId}',
        'summary': 'find lesson usages',
        'method': 'GET',
        'parameters': [
            {
                'paramType': 'path',
                'name': 'lessonId',
                required: true,
                'description': 'ID of lesson that usages to be find',
                'type': 'string'
            }
        ]
    },
    'middlewares' : [
        middlewares.lessons.exists
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
        'path': '/playlists/{playlistId}/intro',
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
                'name': 'playlistId',
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
        'path': '/playlists/{playlistId}/permissions',
        'summary': 'get user permissions for playlist',
        'method': 'GET',
        'parameters': [
            {
                'paramType': 'path',
                'name': 'playlistId',
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

/* used for deleting invalid lesson / steps in playlist before running a playlist */
exports.fixPlaylist = {
    'spec': {
        'path': '/playlists/{playlistId}/fix',
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
                'name': 'playlistId',
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
        'path': '/playlists/{playlistId}/update',
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
                'name': 'playlistId',
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
        'path': '/playlists/{playlistId}/publish',
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
        'path': '/playlists/{playlistId}/unpublish',
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
        'path': '/playlists/{playlistId}/delete',
        'summary': 'Delete playlist corresponding to the id',
        'method': 'POST',
        'parameters': [
            {
                'paramType': 'path',
                'name': 'playlistId',
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
        'path': '/playlists/{playlistId}/delete',
        'summary': 'Delete playlist corresponding to the id',
        'method': 'POST',
        'parameters': [
            {
                'paramType': 'path',
                'name': 'playlistId',
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


exports.overrideLesson = {
    'spec': {
        'path': '/playlists/{playlistId}/lesson/{lessonId}/override',
        'summary': 'copies and replaces lesson',
        'method': 'POST',
        'parameters': [
            {
                'paramType': 'path',
                'name': 'playlistId',
                required: true,
                'description': 'ID of playlist',
                'type': 'string'
            },
            {
                'paramType': 'path',
                'name': 'lessonId',
                required: true,
                'description': 'ID of lesson',
                'type': 'string'
            }
        ]
    },
    'middlewares' : [
        middlewares.session.isLoggedIn,
        middlewares.playlists.exists,
        middlewares.playlists.userCanEdit,
        middlewares.lessons.exists
    ],
    'action': controllers.playlists.overrideLesson
};

exports.copyPlaylist = {
    'spec': {
        'path': '/playlists/{playlistId}/copy',
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




