'use strict';

var controllers = require('../controllers');
var middlewares = require('../middlewares');

exports.createNewPlaylistRprtForPlaylistInvitation = {
    'spec': {
        'path': '/playlistRprts/playlistinvitation/{invitationId}',
        'summary': 'Create new playlistRprt for playlist invitation',
        'method': 'POST'
    },
    'middlewares' : [
        middlewares.playlistsInvitations.exists
    ],
    'action': controllers.playlistRprts.createNewPlaylistRprtForPlaylistInvitation
};

exports.readPlaylistRprtById = {
    'spec': {
        'path': '/playlistRprts/{playlistRprtId}/read',
        'summary': 'Read playlistRprt by id',
        'method': 'GET'
    },
    'middlewares' : [
        middlewares.playlistRprts.exists,
        middlewares.playlistRprts.mergeWithInvitationData
    ],
    'action': controllers.playlistRprts.readPlaylistRprtById
};

exports.readClassPlaylistRprtById = {
    'spec': {
        'path': '/playlistRprts/class/{playlistRprtId}/read',
        'summary': 'Read class playlistRprt by id',
        'method': 'GET'
    },
    'middlewares' : [
        middlewares.classPlaylistRprts.exists,
        middlewares.playlistRprts.mergeWithInvitationData
    ],
    'action': controllers.classPlaylistRprts.readPlaylistRprtById
};

exports.updatePlaylistRprt = {
    'spec': {
        'path': '/playlistRprts/{playlistRprtId}/update',
        'summary': 'update playlistRprt',
        'method': 'POST'
    },
    'middlewares' : [
        middlewares.session.optionalUserOnRequest,
        middlewares.playlistRprts.exists
    ],
    'action': controllers.playlistRprts.updatePlaylistRprt
};


exports.sendPlaylistRprtReady = {
    'spec': {
        'path': '/playlistRprts/{playlistRprtId}/ready',
        'summary': 'send email that playlistRprt is ready',
        'method': 'POST',
        'parameters': [
            {
                'paramType': 'path',
                'name': 'playlistRprtId',
                required: true,
                'description': 'ID of playlistRprt',
                'type': 'string'
            }
        ]
    },
    'middlewares' : [
        middlewares.playlistRprts.exists
    ],
    'action': controllers.playlistRprts.sendPlaylistRprtReady
};

exports.deletePlaylistRprt = {
	    'spec': {
	        'path': '/playlistRprts/{playlistRprtId}/delete',
	        'summary': 'Delete playlistRprt corresponding to the id',
	        'method': 'POST',
	        'parameters': [
	            {
	                'paramType': 'path',
	                'name': 'playlistRprtId',
	                required: true,
	                'description': 'ID of playlistRprt that needs to be deleted',
	                'type': 'string'
	            }
	        ]
	    },
	    'middlewares' : [
	        middlewares.session.isLoggedIn,
	        middlewares.playlistRprts.exists,
	        middlewares.playlistRprts.userCanDelete
	    ],
	    'action': controllers.playlistRprts.deletePlaylistRprt
    };


exports.deleteClassPlaylistRprt = {    
    'spec': {
        'path': '/playlistRprts/class/{playlistRprtId}/delete',
        'summary': 'Delete playlistRprt corresponding to the id',
        'method': 'POST',
        'parameters': [
            {
                'paramType': 'path',
                'name': 'playlistRprtId',
                required: true,
                'description': 'ID of playlistRprt that needs to be deleted',
                'type': 'string'
            }
        ]
    },
    'middlewares' : [
        middlewares.session.isLoggedIn,
        middlewares.classPlaylistRprts.exists,
        middlewares.playlistRprts.userCanDelete
    ],
    'action': controllers.classPlaylistRprts.deleteClassPlaylistRprt
    
};     


exports.getStudents = {
    'spec': {
        'path': '/playlistRprts/students',
        'summary': 'get all students names',
        'method': 'GET',
        'parameters': [

            {
                'paramType': 'query',
                required: false,
                'description': 'like - filter for student name',
                'type': 'string'
            }
        ]
    },
    'middlewares' : [
        middlewares.session.isLoggedIn
    ],
    'action': controllers.playlistRprts.getStudents
};


exports.getClasses = {
    'spec': {
        'path': '/playlistRprts/classes',
        'summary': 'get all classes names',
        'method': 'GET',
        'parameters': [

            {
                'paramType': 'query',
                required: false,
                'description': 'like - filter for student name',
                'type': 'string'
            }
        ]
    },
    'middlewares' : [
        middlewares.session.isLoggedIn
    ],
    'action': controllers.playlistRprts.getClasses
};


exports.findStudentPlaylistRprtPlaylistsByName = {
    'spec' : {
        'path' : '/playlistRprts/studentsplaylists/find',
        'summary' : 'get playlists\' name and _id for student\'s playlistRprt',
        'method' : 'GET',
        'parameters' : [
            {
                'paramType' : 'query',
                'required' : false,
                'description' : 'like - filter for playlist name',
                'type' : 'string'
            }
        ]
    },
    'middlewares' : [
        middlewares.session.isLoggedIn,
        middlewares.lergo.escapeRegExp('like')
    ],
    'action' : controllers.playlistRprts.findStudentPlaylistRprtPlaylistsByName
};

exports.findPlaylistRprtPlaylistsByName = {
    'spec': {
        'path': '/playlistRprts/playlists/find',
        'summary': 'get playlists\' name and _id for user\'s playlistRprt',
        'method': 'GET',
        'parameters': [
            {
                'paramType' : 'query',
                'required' : false,
                'description' : 'like - filter for playlist name',
                'type' : 'string'
            },{
                'paramType' : 'query',
                'required' : false,
                'description' : 'playlistRprt type',
                'type' : 'string'
            }
        ]
    },
    'middlewares' : [
        middlewares.session.isLoggedIn,
        middlewares.lergo.escapeRegExp('like')
    ],
    'action': controllers.playlistRprts.findPlaylistRprtPlaylistsByName
};
