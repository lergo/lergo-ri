'use strict';

/**
 * @module LessonsInvitationsActions
 * @type {exports}
 */

var middlewares = require('../middlewares');
var controllers = require('../controllers');

/**
 *
 * An action for logged in user to invite others for a lesson. Since we have the
 * userId on the session, we will want to keep track of it.
 *
 */
exports.lessonInviteCreate = {
	'spec' : {
		'path' : '/lessons/{lessonId}/invitations/create',
		'summary' : 'create a lesson invitation instance ',
		'method' : 'POST',
		'parameters' : [ {
			'paramType' : 'path',
			'name' : 'lessonId',
			required : true,
			'description' : 'ID of lesson to invite to',
			'type' : 'string'
		}, {
			'paramType' : 'body',
			required : false,
			'description' : 'invitation details',
			'type' : 'InvitationDetails'
		} ]
	},
	'middlewares' : [ middlewares.lessons.exists, middlewares.session.optionalUserOnRequest ],
	'action' : controllers.lessonsInvitations.create
};

exports.updateInvite = {
	spec : {
		path : '/invitations/{invitationId}/update',
		summary : 'update invite',
		method : 'POST'
	},
	middlewares : [ middlewares.session.optionalUserOnRequest, middlewares.lessonsInvitations.exists ],
	action : controllers.lessonsInvitations.update
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
	middlewares : [ middlewares.session.isLoggedIn, middlewares.lessonsInvitations.exists, middlewares.lessonsInvitations.userCanDelete ],
	action : controllers.lessonsInvitations.deleteInvitation
};

exports.lessonsInvitationsGetById = {
	'spec' : {
		'summary': 'Get a lesson invitation by id',
		'method': 'GET',
		'path': '/invitations/{invitationId}/get'

	},
	'middlewares' : [ middlewares.lessonsInvitations.exists ],
	'action': controllers.lessonsInvitations.getById
};


exports.lessonsInvitationsBuild = {
	'spec'  : {
		'path'          : '/lessonsinvitations/{invitationId}/build',
		'summary'       : 'create a lesson invitation instance and sends an email',
		'method'        : 'GET',
		'parameters'    : [{
			'paramType'  : 'path',
			'name'       : 'invitationId',
			required     : true,
			'description': 'ID of lesson to invite to',
			'type'       : 'string'
		}, {
			'paramType'  : 'query',
			'name'       : 'construct',
			'required'   : false,
			'description': 'if true, the invitation will construct its lesson in case one was not constructed before',
			'type'       : 'boolean'
		}, {
			'paramType'  : 'query',
			'name'       : 'constructForce',
			'required'   : false,
			'description': 'if true, the invitation will construct its lessons. if one was already constructed, it will be reconstructed',

			'type': 'boolean'
		}],
		'errorResponses': [{
			'code'  : 500,
			'reason': 'unable to get lesson invitation'
		}],
		'nickname'      : 'lessonInviteCreate'
	},
	'middlewares' : [ middlewares.lessonsInvitations.exists ],
	'action': controllers.lessonsInvitations.build
};


exports.getStudents = {
    'spec': {
        'path': '/lessonsinvitations/students',
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
    'action': controllers.lessonsInvitations.getStudents
};


exports.getClasses = {
    'spec': {
        'path': '/lessonsinvitations/classes',
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
    'action': controllers.lessonsInvitations.getClasses
};
