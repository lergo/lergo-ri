'use strict';

var controllers = require('../controllers');
var middlewares = require('../middlewares');

exports.createHelperContent = {
	'spec' : {
		'path' : '/helpercontents/create',
		'summary' : 'Create new helper content',
		'method' : 'POST',
		'parameters' : [ {
			'paramType' : 'body',
			'name' : 'content',
			required : true,
			'description' : 'Helper content details',
			'type' : 'Content'
		} ]
	},
	'middlewares' : [ middlewares.session.isLoggedIn ],
	'action' : controllers.helperContents.create
};

exports.editHelperContent = {
	'spec' : {
		'path' : '/helpercontents/{helperContentId}/update',
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
		} ]
	},
	'middlewares' : [ middlewares.session.isLoggedIn, middlewares.helperContents.exists, middlewares.helperContents.userCanEdit ],
	'action' : controllers.helperContents.update
};
exports.getHelperContent = {
	'spec' : {
		'path' : '/helpercontents',
		'summary' : 'Get  helper contents',
		'method' : 'GET'
	},
	'action' : controllers.helperContents.find
};