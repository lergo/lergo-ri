'use strict';

var controllers = require('../controllers');
var middlewares = require('../middlewares');

exports.createNewReportForLessonInvitation = {
    'spec': {
        'path': '/reports/lessoninvitation/{invitationId}',
        'summary': 'Create new report for lesson invitation',
        'method': 'POST'
    },
    'middlewares' : [
        middlewares.lessonsInvitations.exists
    ],
    'action': controllers.reports.createNewReportForLessonInvitation
};

exports.readReportById = {
    'spec': {
        'path': '/reports/{reportId}/read',
        'summary': 'Read report by id',
        'method': 'GET'
    },
    'middlewares' : [
        middlewares.reports.exists,
        middlewares.reports.mergeWithInvitationData
    ],
    'action': controllers.reports.readReportById
};

exports.readClassReportById = {
    'spec': {
        'path': '/reports/class/{reportId}/read',
        'summary': 'Read class report by id',
        'method': 'GET'
    },
    'middlewares' : [
        middlewares.classReports.exists,
        middlewares.reports.mergeWithInvitationData
    ],
    'action': controllers.classReports.readReportById
};

exports.updateReport = {
    'spec': {
        'path': '/reports/{reportId}/update',
        'summary': 'update report',
        'method': 'POST'
    },
    'middlewares' : [
        middlewares.session.optionalUserOnRequest,
        middlewares.reports.exists
    ],
    'action': controllers.reports.updateReport
};


exports.sendReportReady = {
    'spec': {
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
        ]
    },
    'middlewares' : [
        middlewares.reports.exists
    ],
    'action': controllers.reports.sendReportReady
};

exports.deleteReport = {
	    'spec': {
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
	        ]
	    },
	    'middlewares' : [
	        middlewares.session.isLoggedIn,
	        middlewares.reports.exists,
	        middlewares.reports.userCanDelete
	    ],
	    'action': controllers.reports.deleteReport
    };


exports.deleteClassReport = {    
    'spec': {
        'path': '/reports/class/{reportId}/delete',
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
        ]
    },
    'middlewares' : [
        middlewares.session.isLoggedIn,
        middlewares.classReports.exists,
        middlewares.reports.userCanDelete
    ],
    'action': controllers.classReports.deleteClassReport
    
};     


exports.getStudents = {
    'spec': {
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
        ]
    },
    'middlewares' : [
        middlewares.session.isLoggedIn
    ],
    'action': controllers.reports.getStudents
};


exports.getClasses = {
    'spec': {
        'path': '/reports/classes',
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
    'action': controllers.reports.getClasses
};


exports.findStudentReportLessonsByName = {
    'spec' : {
        'path' : '/reports/studentslessons/find',
        'summary' : 'get lessons\' name and _id for student\'s report',
        'method' : 'GET',
        'parameters' : [
            {
                'paramType' : 'query',
                'required' : false,
                'description' : 'like - filter for lesson name',
                'type' : 'string'
            }
        ]
    },
    'middlewares' : [
        middlewares.session.isLoggedIn,
        middlewares.lergo.escapeRegExp('like')
    ],
    'action' : controllers.reports.findStudentReportLessonsByName
};

exports.findReportLessonsByName = {
    'spec': {
        'path': '/reports/lessons/find',
        'summary': 'get lessons\' name and _id for user\'s report',
        'method': 'GET',
        'parameters': [
            {
                'paramType' : 'query',
                'required' : false,
                'description' : 'like - filter for lesson name',
                'type' : 'string'
            },{
                'paramType' : 'query',
                'required' : false,
                'description' : 'report type',
                'type' : 'string'
            }
        ]
    },
    'middlewares' : [
        middlewares.session.isLoggedIn,
        middlewares.lergo.escapeRegExp('like')
    ],
    'action': controllers.reports.findReportLessonsByName
};
