'use strict';
// todo user "managers" instead..
// since this is a manager, we cannot simply require('./index');
// we need to use setTimeout( function(){ managers = require('./index'); },0);
// hopefully this will cause the event loop to execute after index.js is
// initialized.

var services = require('../services');
var AbuseReport = require('../models/AbuseReport');

exports.complexSearch = function(queryObj, callback) {

	if (!!queryObj.filter.searchText) {

		var text = new RegExp(queryObj.filter.searchText, 'i');

		if (!queryObj.filter.$or) {
			queryObj.filter.$or = [];
		}
		queryObj.filter.$or.push({
			'title' : text
		});
		delete queryObj.filter.searchText;
	}
	AbuseReport.connect(function(db, collection) {
		services.complexSearch.complexSearch(queryObj, {
			collection : collection
		}, callback);
	});
};
