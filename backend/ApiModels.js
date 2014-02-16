var UserSignupForm = {
    'id': 'UserSignupForm',
    'description': 'The signup form details',
    'requires': [
        'username',
        'password',
        'confirmPassword',
        'fullName'
    ],
    'properties': {
        'username': {
            'type': 'string',
            'description': 'The login username'
        },
        'password': {
            'type': 'string',
            'description': 'The login password'
        },
        'confirmPassword': {
            'type': 'string',
            'description': 'The login password. must match.'
        },
        'fullName': {
            'type': 'string',
            'description': 'User\'s full name'
        }
    }
};


exports.models = {
    'UserSignupForm': UserSignupForm
};