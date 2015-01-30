var controllers = require('../controllers');
var middlewares = require('../middlewares');

exports.getPublicLessons = {
    'spec'       : {
        'description'   : 'Get public lessons',
        'name'          : 'getPublicLessons',
        'path'          : '/public/lessons',
        'summary'       : 'Get public lessons',
        'method'        : 'GET',
        'parameters'    : [],
        'errorResponses': [{
            'code'  : 500,
            'reason': 'server error'
        }],

        'nickname': 'getPublicLessons'
    },
    'middlewares': [middlewares.lergo.queryObjParsing],
    'action'     : controllers.lessons.getPublicLessons
};

exports.getPublicProfile = {
    spec       : {
        description   : 'Get profile',
        name          : 'get profiled',
        path          : '/public/{username}/profile',
        summary       : 'Get logged in user profile',
        method        : 'GET',
        parameters    : [],
        errorResponses: [{
            code  : 500,
            reason: 'unable to get profile'
        }],
        nickname      : 'getPublicProfile'
    },
    middlewares: [],
    action     : controllers.users.getPublicProfile
};
