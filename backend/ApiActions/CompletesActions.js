var controllers = require('../controllers');
var middlewares = require('../middlewares');

exports.createComplete = {
    'spec': {
        'path': '/completes/{itemType}/{itemId}/{itemScore}/create',
        'summary': 'User completes this lesson',
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
                'type': 'CompleteItemType'
            },
            {
                'paramType': 'path',
                'name': 'itemType',
                'required': true,
                'description': 'item score',
                'type': 'CompleteItemScore'
            }


        ]
    },
    'middlewares': [
        middlewares.session.isLoggedIn,
        middlewares.completes.itemExists,
        middlewares.completes.notExists
    ],
    'action': controllers.completes.createComplete
};



exports.deleteComplete = {
    'spec': {
        'path': '/completes/{itemType}/{itemId}/delete',
        'summary': 'User discompletes this lesson',
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
                'type': 'CompleteItemType'
            }


        ]
    },
    'middlewares': [
        middlewares.session.isLoggedIn,
        middlewares.completes.itemExists,
        middlewares.completes.exists
    ],
    'action': controllers.completes.deleteComplete
};


exports.countCompletes = {
    'spec': {
        'path': '/completes/{itemType}/{itemId}/count',
        'summary': 'Count completes',
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
                'type': 'CompleteItemType'
            }
        ]
    },
    'middlewares': [
        middlewares.completes.itemExists
    ],
    'action': controllers.completes.countCompletes
};



