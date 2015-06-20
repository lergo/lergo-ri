'use strict';

var controllers = require('../controllers');

exports.getPermissions = {
    'spec': {
        'description': 'List all permissions in the system',
        'name': 'getPermissions',
        'path': '/security/permissions',
        // 'notes': 'Returns 200 if everything went well, otherwise returns
        // error response',
        'summary': 'List all permissions in the system',
        'method': 'GET',
        'parameters': [],
        'errorResponses': [
            {
                'code': 500,
                'reason': 'server error'
            }
        ],
        'nickname': 'getPermissions'
    },
    'middlewares': [ ],
    'action': controllers.security.getPermissions

};