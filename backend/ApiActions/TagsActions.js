var controllers = require('../controllers');


exports.getTopTags = {
    'spec': {
        'description': 'Gets top tags',
        'name': 'getTopTags',
        'path': '/tags/get/top',
        // 'notes': 'Returns 200 if everything went well, otherwise returns
        // error response',
        'summary': 'Get top tags',
        'method': 'GET',
        'parameters': [

        ],
        'errorResponses': [
            {
                'code': 500,
                'reason': 'server error'
            }
        ],
        'nickname': 'getTopTags'
    },
    'action': controllers.tags.getTopTags
};

exports.getTagByFilter = {
    'spec': {
        'description': 'Gets tags by filter',
        'name': 'getTagsByFilter',
        'path': '/tags/filter',
        // 'notes': 'Returns 200 if everything went well, otherwise returns
        // error response',
        'summary': 'Get tags by filter',
        'method': 'GET',
        'parameters': [

        ],
        'errorResponses': [
            {
                'code': 500,
                'reason': 'server error'
            }
        ],
        'nickname': 'getTagsByFilter'
    },
    'action': controllers.tags.getTagsByFilter
};






