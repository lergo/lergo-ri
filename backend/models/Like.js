'use strict';

var services = require('../services');
var AbstractModel = require('./AbstractModel');



function Like(data) {
    this.data = data;
}

Like.collectionName = 'likes';

//enum
Like.ItemTypes = {
    LESSON : 'lesson',
    QUESTION : 'question'
};

Like.createNew = function( itemType, itemId, userId ){
    return {
        'itemType' : itemType,
        'itemId' : services.db.id(itemId),
        'userId' : services.db.id(userId)

    };
};

Like.createNewFromRequest = function( req ){
    return Like.createNew(req.likeItemType, req.likeItem._id, req.sessionUser._id);
};

AbstractModel.enhance(Like);

module.exports = Like;


