var controllers = require('../controllers');

exports.getTranslations = {
    'spec': {
        'description': 'Get translation for locale',
        'name': 'getSystemTranslationByLocale',
        'path': '/system/translations/{locale}.json',
        // 'notes': 'Returns 200 if everything went well, otherwise returns
        // error response',
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
        ],
        'errorResponses': [
            {
                'code': 500,
                'reason': 'server error'
            }
        ],
        'nickname': 'getTranslation'
    },
    'action': controllers.system.getTranslation
};

exports.getStatistics = {
    'spec': {
        'description': 'Get system statistics ',
        'name': 'getPublicLessons',
        'path': '/system/statistics',
        // 'notes': 'Returns 200 if everything went well, otherwise returns
        // error response',
        'summary': 'Get system statistics ',
        'method': 'GET',
        'parameters': [

        ],
        'errorResponses': [
            {
                'code': 500,
                'reason': 'server error'
            }
        ],
        'nickname': 'getStatistics'
    },
    'action': controllers.system.getStatistics
};