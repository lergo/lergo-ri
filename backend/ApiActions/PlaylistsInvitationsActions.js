'use strict';

/**
 * @module PlaylistsInvitationsActions
 * @type {exports}
 */

var middlewares = require('../middlewares');
var controllers = require('../controllers');

/**
 *
 * An action for logged in user to invite others for a playlist. Since we have the
 * userId on the session, we will want to keep track of it.
 *
 */
exports.playlistInviteCreate = {
	'spec' : {
		'path' : '/playlists/{playlistId}/invitations/create',
		'summary' : 'create a playlist invitation instance ',
		'method' : 'POST',
		'parameters' : [ {
			'paramType' : 'path',
			'name' : 'playlistId',
			required : true,
			'description' : 'ID of playlist to invite to',
			'type' : 'string'
		}, {
			'paramType' : 'body',
			required : false,
			'description' : 'invitation details',
			'type' : 'InvitationDetails'
		} ]
	},
	'middlewares' : [ middlewares.playlists.exists, middlewares.session.optionalUserOnRequest ],
	'action' : controllers.playlistsInvitations.create
};

exports.updateInvite = {
	spec : {
		path : '/invitations/{invitationId}/update',
		summary : 'update invite',
		method : 'POST'
	},
	middlewares : [ middlewares.session.optionalUserOnRequest, middlewares.playlistsInvitations.exists ],
	action : controllers.playlistsInvitations.update
};
exports.deleteInvitation = {
	spec : {
		path : '/invitations/{invitationId}/delete',
		summary : 'Delete invitation corresponding to the id',
		method : 'POST',
		parameters : [ {
			paramType : 'path',
			name : 'invitationId',
			required : true,
			description : 'ID of invitation that needs to be deleted',
			type : 'string'
		} ]
	},
	middlewares : [ middlewares.session.isLoggedIn, middlewares.playlistsInvitations.exists, middlewares.playlistsInvitations.userCanDelete ],
	action : controllers.playlistsInvitations.deleteInvitation
};

exports.playlistsInvitationsGetById = {
	'spec' : {
		'summary': 'Get a playlist invitation by id',
		'method': 'GET',
		'path': '/invitations/{invitationId}/get'

	},
	'middlewares' : [ middlewares.playlistsInvitations.exists ],
	'action': controllers.playlistsInvitations.getById
};

exports.playlistsInvitationsGetByPin = {
    'spec' : {
        'summary': 'Get a playlist invitation by pin',
        'method': 'GET',
        'path': '/invitations/pin/{pin}'

    },
    'action': controllers.playlistsInvitations.getByPin
};

exports.playlistsInvitationsBuild = {
	'spec'  : {
		'path'          : '/playlistsinvitations/{invitationId}/build',
		'summary'       : 'create a playlist invitation instance and sends an email',
		'method'        : 'GET',
		'parameters'    : [{
			'paramType'  : 'path',
			'name'       : 'invitationId',
			required     : true,
			'description': 'ID of playlist to invite to',
			'type'       : 'string'
		}, {
			'paramType'  : 'query',
			'name'       : 'construct',
			'required'   : false,
			'description': 'if true, the invitation will construct its playlist in case one was not constructed before',
			'type'       : 'boolean'
		}, {
			'paramType'  : 'query',
			'name'       : 'constructForce',
			'required'   : false,
			'description': 'if true, the invitation will construct its playlists. if one was already constructed, it will be reconstructed',

			'type': 'boolean'
		}],
		'errorResponses': [{
			'code'  : 500,
			'reason': 'unable to get playlist invitation'
		}],
		'nickname'      : 'playlistInviteCreate'
	},
	'middlewares' : [ middlewares.playlistsInvitations.exists ],
	'action': controllers.playlistsInvitations.build
};


exports.getStudents = {
    'spec': {
        'path': '/playlistsinvitations/students',
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
    'action': controllers.playlistsInvitations.getStudents
};


exports.getClasses = {
    'spec': {
        'path': '/playlistsinvitations/classes',
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
    'action': controllers.playlistsInvitations.getClasses
};
