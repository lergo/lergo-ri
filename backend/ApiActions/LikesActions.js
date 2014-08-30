var controllers = require('../controllers');
var middlewares = require('../middlewares');

exports.createLike = {
    'spec': {
        'description': 'User likes this lesson',
        'name': 'createLike',
        'path': '/likes/{itemType}/{itemId}/create',
        // 'notes': 'Returns 200 if everything went well, otherwise returns
        // error response',
        'summary': 'User likes this lesson',
        'method': 'POST',
        'parameters': [
            {
                'paramType': 'path',
                'name': 'itemId',
                'required': true,
                'description': 'item id',
                'type': 'ObjectIDHash'
            },
            {
                'paramType': 'path',
                'name': 'itemType',
                'required': true,
                'description': 'item type',
                'type': 'LikeItemType'
            }


        ],
        'errorResponses': [
            {
                'code': 500,
                'reason': 'server error'
            }
        ],
        'nickname': 'createLike'
    },
    'middlewares': [
        middlewares.session.isLoggedIn,
        middlewares.likes.itemExists,
        middlewares.likes.notExists
    ],
    'action': controllers.likes.createLike
};



exports.deleteLike = {
    'spec': {
        'description': 'User dislikes this lesson',
        'name': 'deleteLike',
        'path': '/likes/{itemType}/{itemId}/delete',
        // 'notes': 'Returns 200 if everything went well, otherwise returns
        // error response',
        'summary': 'User dislikes this lesson',
        'method': 'POST',
        'parameters': [
            {
                'paramType': 'path',
                'name': 'itemId',
                'required': true,
                'description': 'item id',
                'type': 'ObjectIDHash'
            },
            {
                'paramType': 'path',
                'name': 'itemType',
                'required': true,
                'description': 'item type',
                'type': 'LikeItemType'
            }


        ],
        'errorResponses': [
            {
                'code': 500,
                'reason': 'server error'
            }
        ],
        'nickname': 'deleteLike'
    },
    'middlewares': [
        middlewares.session.isLoggedIn,
        middlewares.likes.itemExists,
        middlewares.likes.exists
    ],
    'action': controllers.likes.deleteLike
};


exports.countLikes = {
    'spec': {
        'description': 'Count likes',
        'name': 'countLikes',
        'path': '/likes/{itemType}/{itemId}/count',
        // 'notes': 'Returns 200 if everything went well, otherwise returns
        // error response',
        'summary': 'Count likes',
        'method': 'GET',
        'parameters': [
            {
                'paramType': 'path',
                'name': 'itemId',
                'required': true,
                'description': 'item id',
                'type': 'ObjectIDHash'
            },
            {
                'paramType': 'path',
                'name': 'itemType',
                'required': true,
                'description': 'item type',
                'type': 'LikeItemType'
            }
        ],
        'errorResponses': [
            {
                'code': 500,
                'reason': 'server error'
            }
        ],
        'nickname': 'countLikes'
    },
    'middlewares': [
        middlewares.likes.itemExists
    ],
    'action': controllers.likes.countLikes
};



