'use strict';

var controllers = require('../controllers');
var middlewares = require('../middlewares');

exports.createFAQ = {
	'spec' : {
		'description' : 'Create faq',
		'name' : 'create',
		'path' : '/faqs/create',
		'summary' : 'Create new faq',
		'method' : 'POST',
		'parameters' : [ {
			'paramType' : 'body',
			'name' : 'content',
			required : true,
			'description' : 'faq details',
			'type' : 'Content'
		} ],
		'errorResponses' : [ {
			'code' : 500,
			'reason' : 'unable to create'
		} ],
		'nickname' : 'createFAQ'
	},
	'middlewares' : [ middlewares.session.isLoggedIn, middlewares.session.isAdmin ],
	'action' : controllers.faqs.create
};

exports.editFAQ = {
	'spec' : {
		'description' : 'Edit faq',
		'name' : 'updateFAQ',
		'path' : '/faqs/{faqId}/update',
		// 'notes': 'Returns 200 if everything went well, otherwise returns
		// error response',
		'summary' : 'user edits a faq',
		'method' : 'POST',
		'parameters' : [ {
			'paramType' : 'body',
			'name' : 'content',
			required : true,
			'description' : 'The updated FAQ',
			'type' : 'FAQ'
		}, {
			'paramType' : 'path',
			'name' : 'faqId',
			required : true,
			'description' : 'ID of FAQ that needs to be fetched',
			'type' : 'string'
		} ],
		'errorResponses' : [ {
			'code' : 500,
			'reason' : 'unable to update'
		} ],
		'nickname' : 'editFAQ'
	},
	'middlewares' : [ middlewares.session.isLoggedIn, middlewares.session.isAdmin , middlewares.faqs.exists ],
	'action' : controllers.faqs.update
};
exports.getFAQs = {
	'spec' : {
		'description' : 'Get  faqs',
		'name' : 'getFAQs',
		'path' : '/faqs',
		// 'notes': 'Returns 200 if everything went well, otherwise returns
		// error response',
		'summary' : 'Get  faqs',
		'method' : 'GET',
		'parameters' : [

		],
		'errorResponses' : [ {
			'code' : 500,
			'reason' : 'server error'
		} ],

		'nickname' : 'getFAQs'
	},
	'action' : controllers.faqs.find
};