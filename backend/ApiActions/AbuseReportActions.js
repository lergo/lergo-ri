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
