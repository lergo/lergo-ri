'use strict';

var controllers = require('../controllers');
var middlewares = require('../middlewares');

exports.createNewReportForLessonInvitation = {
    'spec': {
        'description': 'Create a new report for lesson invitation',
        'name': 'createNewReport',
        'path': '/reports/lessoninvitation/{invitationId}',
        // 'notes': 'Returns 200 if everything went well, otherwise returns
        // error response',
        'summary': 'Create new report for lesson invitation',
        'method': 'POST',
        'parameters': [

        ],
        'errorResponses': [
            {
                'code': 500,
                'reason': 'server error'
            }
        ],
        'nickname': 'createNewReportForLessonInvitation'
    },
    'middlewares' : [
        middlewares.lessonsInvitations.exists
    ],
    'action': controllers.reports.createNewReportForLessonInvitation
};

exports.readReportById = {
    'spec': {
        'description': 'Read report by id',
        'name': 'readReportById',
        'path': '/reports/{reportId}/read',
        // 'notes': 'Returns 200 if everything went well, otherwise returns
        // error response',
        'summary': 'Read report by id',
        'method': 'GET',
        'parameters': [

        ],
        'errorResponses': [
            {
                'code': 500,
                'reason': 'server error'
            }
        ],
        'nickname': 'readReportById'
    },
    'middlewares' : [
        middlewares.reports.exists
    ],
    'action': controllers.reports.readReportById
};


exports.updateReport = {
    'spec': {
        'description': 'update report',
        'name': 'updateReport',
        'path': '/reports/{reportId}/update',
        // 'notes': 'Returns 200 if everything went well, otherwise returns
        // error response',
        'summary': 'update report',
        'method': 'POST',
        'parameters': [

        ],
        'errorResponses': [
            {
                'code': 500,
                'reason': 'server error'
            }
        ],
        'nickname': 'updateReport'
    },
    'middlewares' : [
        middlewares.session.optionalUserOnRequest,
        middlewares.reports.exists
    ],
    'action': controllers.reports.updateReport
};


exports.sendReportReady = {
    'spec': {
        'description': 'send email that report is ready',
        'name': 'sendReportReady',
        'path': '/reports/{reportId}/ready',
        'summary': 'send email that report is ready',
        'method': 'POST',
        'parameters': [
            {
                'paramType': 'path',
                'name': 'reportId',
                required: true,
                'description': 'ID of report',
                'type': 'string'
            }
        ],
        'errorResponses': [
            {
                'code': 500,
                'reason': 'unable to send report ready email'
            }
        ],
        'nickname': 'sendReportReady'
    },
    'middlewares' : [
        middlewares.reports.exists
    ],
    'action': controllers.reports.sendReportReady
};

exports.deleteReport = {
	    'spec': {
	        'description': 'Delete report corresponding to the id',
	        'name': 'deleteReport',
	        'path': '/reports/{reportId}/delete',
	        'summary': 'Delete report corresponding to the id',
	        'method': 'POST',
	        'parameters': [
	            {
	                'paramType': 'path',
	                'name': 'reportId',
	                required: true,
	                'description': 'ID of report that needs to be deleted',
	                'type': 'string'
	            }
	        ],
	        'errorResponses': [
	            {
	                'code': 500,
	                'reason': 'unable to delete report'
	            }
	        ],
	        'nickname': 'deleteReport'
	    },
	    'middlewares' : [
	        middlewares.session.isLoggedIn,
	        middlewares.reports.exists,
	        middlewares.reports.userCanDelete
	    ],
	    'action': controllers.reports.deleteReport
	};


exports.getStudents = {
    'spec': {
        'description': 'get all students names',
        'name': 'getAllStudentsName',
        'path': '/reports/students',
        'summary': 'get all students names',
        'method': 'GET',
        'parameters': [

            {
                'paramType': 'query',
                required: false,
                'description': 'like - filter for student name',
                'type': 'string'
            }
        ],
        'errorResponses': [
            {
                'code': 500,
                'reason': 'unable to find students'
            }
        ],
        'nickname': 'getAllStudentsName'
    },
    'middlewares' : [
        middlewares.session.isLoggedIn
    ],
    'action': controllers.reports.getStudents
};


exports.findReportLessonsByName = {
    'spec': {
        'description': 'Find user\'s reports lesson name and ID',
        'name': 'findReportLessonsByName',
        'path': '/reports/lessons/find',
        'summary': 'get lessons\' name and _id for user\'s report',
        'method': 'GET',
        'parameters': [

        ],
        'errorResponses': [
            {
                'code': 500,
                'reason': 'unknown error'
            }
        ],
        'nickname': 'findReportLessonsInfo'
    },
    'middlewares' : [
        middlewares.session.isLoggedIn
    ],
    'action': controllers.reports.findReportLessonsByName
};
