var controllers = require('../controllers');
var middlewares = require('../middlewares');

exports.createLike = {
    'spec': {
        'path': '/likes/{itemType}/{itemId}/create',
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


        ]
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
        'path': '/likes/{itemType}/{itemId}/delete',
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


        ]
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
        'path': '/likes/{itemType}/{itemId}/count',
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
        ]
    },
    'middlewares': [
        middlewares.likes.itemExists
    ],
    'action': controllers.likes.countLikes
};



