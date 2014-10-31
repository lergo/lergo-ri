var controllers = require('../controllers');
var middlewares = require('../middlewares');

exports.abuse = {
	spec : {
		description : 'User abuses this item',
		name : 'reportAbuse',
		path : '/reportabuse/{itemId}/abuse',
		summary : 'User abuses this lesson',
		method : 'POST',
		parameters : [ {
			paramType : 'path',
			name : 'itemId',
			required : true,
			description : 'item id',
			type : 'ObjectIDHash'
		}

		],
		errorResponses : [ {
			code : 500,
			reason : 'server error'
		} ],
		nickname : 'reportAbuse'
	},
	middlewares : [ middlewares.session.isLoggedIn, middlewares.abuseReports.itemExists ],
	action : controllers.abuseReports.abuse
};

exports.getAllReports = {
	spec : {
		description : 'Gets all abuseReports',
		name : 'getAllAbuseReports',
		path : '/abuseReports/get/all',
		summary : 'Get all abuseReports',
		method : 'GET',
		parameters : [],
		errorResponses : [ {
			code : 500,
			reason : 'server error'
		} ],
		nickname : 'getAllAbuseReports'
	},
	middlewares : [ middlewares.session.isLoggedIn, middlewares.session.isAdmin, middlewares.lergo.queryObjParsing ],
	action : controllers.abuseReports.getAll
};

exports.deleteAbuseReports = {
	spec : {
		description : 'Delete abuseReport corresponding to the id',
		name : 'deleteAbuseReport',
		path : '/abuseReports/{abuseReportId}/delete',
		summary : 'Delete abuseReport corresponding to the id',
		method : 'POST',
		parameters : [ {
			paramType : 'path',
			name : 'abuseReportId',
			required : true,
			description : 'ID of abuseReport that needs to be deleted',
			type : 'string'
		} ],
		errorResponses : [ {
			code : 500,
			reason : 'unable to delete abuseReport'
		} ],
		nickname : 'deleteAbuseReport'
	},
	middlewares : [ middlewares.session.isLoggedIn, middlewares.session.isAdmin, middlewares.abuseReports.exists ],
	action : controllers.abuseReports.deleteReport
};

exports.updateAbuseReport = {
	spec : {
		description : 'update AbuseReport',
		name : 'updateAbuseReport',
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
		} ],
		errorResponses : [ {
			code : 500,
			reason : 'unable to signup'
		} ],
		nickname : 'editAbuseReport'
	},
	middlewares : [ middlewares.session.isLoggedIn, middlewares.abuseReports.exists ],
	action : controllers.abuseReports.update
};
