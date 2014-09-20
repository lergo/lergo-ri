var controllers = require('../controllers');
var middlewares = require('../middlewares');

exports.getPublicLessons = {
    'spec': {
        'description': 'Get public lessons',
        'name': 'getPublicLessons',
        'path': '/public/lessons',
        // 'notes': 'Returns 200 if everything went well, otherwise returns
        // error response',
        'summary': 'Get public lessons',
        'method': 'GET',
        'parameters': [

        ],
        'errorResponses': [
            {
                'code': 500,
                'reason': 'server error'
            }
        ],

        'nickname': 'getPublicLessons'
    },
    'middlewares' : [
        middlewares.lergo.queryObjParsing
    ],
    'action': controllers.lessons.getPublicLessons
};


