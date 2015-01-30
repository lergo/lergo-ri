'use strict';
var AbstractModel = require('./AbstractModel');

function FAQ(data) {
	this.data = data;
}

FAQ.collectionName = 'faqs';

AbstractModel.enhance(FAQ);

module.exports = FAQ;
