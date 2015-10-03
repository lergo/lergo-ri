var controllers = require('../controllers');
var middlewares = require('../middlewares');

exports.abuse = {
	spec : {
		path : '/reportabuse/{itemId}/abuse',
		summary : 'User abuses this lesson',
		method : 'POST',
		parameters: [
			{
				paramType: 'path',
				name: 'itemId',
				required: true,
				description: 'item id',
				type: 'ObjectIDHash'
			}
		]
	},
	middlewares : [ middlewares.session.isLoggedIn, middlewares.abuseReports.itemExists ],
	action : controllers.abuseReports.abuse
};

exports.getAllReports = {
	spec : {
		path : '/abuseReports/get/all',
		summary : 'Get all abuseReports',
		method : 'GET'
	},
	middlewares: [
		middlewares.session.isLoggedIn,
		middlewares.abuseReports.userCanRead,
		middlewares.lergo.queryObjParsing
	],
	action : controllers.abuseReports.getAll
};

exports.deleteAbuseReports = {
	spec : {
		path : '/abuseReports/{abuseReportId}/delete',
		summary : 'Delete abuseReport corresponding to the id',
		method : 'POST',
		parameters : [ {
			paramType : 'path',
			name : 'abuseReportId',
			required : true,
			description : 'ID of abuseReport that needs to be deleted',
			type : 'string'
		} ]
	},
	middlewares: [
		middlewares.session.isLoggedIn,
		middlewares.abuseReports.userCanDelete,
		middlewares.abuseReports.exists
	],
	action : controllers.abuseReports.deleteReport
};

exports.updateAbuseReport = {
	spec : {
		path : '/abuseReports/{abuseReportId}/update',
		summary : 'user edits a abuseReport',
		method : 'POST',
		parameters : [ {
			paramType : 'body',
			name : 'abuseReport',
			required : true,
			description : 'The updated abuseReport',
			type : 'AbuseReport'
		}, {
			paramType : 'path',
			name : 'abuseReportId',
			required : true,
			description : 'ID of abuseReport that needs to be fetched',
			type : 'string'
		} ]
	},
	middlewares : [ middlewares.session.isLoggedIn, middlewares.abuseReports.exists ],
	action : controllers.abuseReports.update
};
