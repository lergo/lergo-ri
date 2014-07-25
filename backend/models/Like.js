var logger = require('log4js').getLogger('Like');
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
        'itemId' : itemId,
        'userId' : userId
    }
};

AbstractModel.enhance(Like);

module.exports = Like;


