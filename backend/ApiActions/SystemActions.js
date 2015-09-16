var controllers = require('../controllers');
var middlewares = require('../middlewares');

exports.getTranslations = {
    'spec': {
        'path': '/system/translations/{locale}.json',
        'summary': 'Get system translation',
        'method': 'GET',
        'parameters': [
            {
                'paramType': 'path',
                'name': 'locale',
                required: true,
                'description': 'locale to fetch',
                'type': 'string'
            }
        ]
    },
    'action': controllers.system.getTranslation
};

exports.getStatistics = {
    'spec': {
        'path': '/system/statistics',
        'summary': 'Get system statistics ',
        'method': 'GET'
    },
    'middlewares': [
        middlewares.session.optionalUserOnRequest
    ],
    'action': controllers.system.getStatistics
};