'use strict';
var AbstractModel = require('./AbstractModel');

function HelperContent(data) {
	this.data = data;
}

HelperContent.collectionName = 'helperContents';

AbstractModel.enhance(HelperContent);

module.exports = HelperContent;
