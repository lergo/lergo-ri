'use strict';

var services = require('../services');
var AbstractModel = require('./AbstractModel');



function Complete(data) {
    this.data = data;
}

Complete.collectionName = 'completes';

//enum
Complete.ItemTypes = {
    LESSON : 'lesson',
    QUESTION : 'question'
};

Complete.createNew = function( itemType, itemId, userId ){
    return {
        'itemType' : itemType,
        'itemId' : services.db.id(itemId),
        'userId' : services.db.id(userId)

    };
};

Complete.createNewFromRequest = function( req ){
    return Complete.createNew(req.completeItemType, req.completeItem._id, req.sessionUser._id);
};

AbstractModel.enhance(Complete);

module.exports = Complete;


