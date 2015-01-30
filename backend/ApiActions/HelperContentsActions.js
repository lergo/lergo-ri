'use strict';

var controllers = require('../controllers');
var middlewares = require('../middlewares');

exports.createHelperContent = {
	'spec' : {
		'description' : 'Create helper content',
		'name' : 'create',
		'path' : '/helpercontents/create',
		'summary' : 'Create new helper content',
		'method' : 'POST',
		'parameters' : [ {
			'paramType' : 'body',
			'name' : 'content',
			required : true,
			'description' : 'Helper content details',
			'type' : 'Content'
		} ],
		'errorResponses' : [ {
			'code' : 500,
			'reason' : 'unable to create'
		} ],
		'nickname' : 'createQuestion'
	},
	'middlewares' : [ middlewares.session.isLoggedIn ],
	'action' : controllers.helperContents.create
};

exports.editHelperContent = {
	'spec' : {
		'description' : 'Edit Helper Content',
		'name' : 'updateHelperContent',
		'path' : '/helpercontents/{helperContentId}/update',
		// 'notes': 'Returns 200 if everything went well, otherwise returns
		// error response',
		'summary' : 'user edits a helper Content',
		'method' : 'POST',
		'parameters' : [ {
			'paramType' : 'body',
			'name' : 'content',
			required : true,
			'description' : 'The updated HelperContent',
			'type' : 'HelperContent'
		}, {
			'paramType' : 'path',
			'name' : 'helperContentId',
			required : true,
			'description' : 'ID of HelperContent that needs to be fetched',
			'type' : 'string'
		} ],
		'errorResponses' : [ {
			'code' : 500,
			'reason' : 'unable to update'
		} ],
		'nickname' : 'editHelperContent'
	},
	'middlewares' : [ middlewares.session.isLoggedIn, middlewares.helperContents.exists, middlewares.helperContents.userCanEdit ],
	'action' : controllers.helperContents.update
};
exports.getHelperContent = {
	'spec' : {
		'description' : 'Get  helper contents',
		'name' : 'getHelperContents',
		'path' : '/helpercontents',
		// 'notes': 'Returns 200 if everything went well, otherwise returns
		// error response',
		'summary' : 'Get  helper contents',
		'method' : 'GET',
		'parameters' : [

		],
		'errorResponses' : [ {
			'code' : 500,
			'reason' : 'server error'
		} ],

		'nickname' : 'getHelperContents'
	},
	'action' : controllers.helperContents.find
};