
exports.models = {
    'UserSignupForm': {
        'id': 'UserSignupForm',
        'description': 'The signup form details',
        'required': [
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
    },
    'LoginCredentials' : {
        'id' : 'LoginCredentials',
        'description' : 'The login credentials',
        'required': [
            'username',
            'password',
            'rememberMe'
        ],
        'properties' : {
            'username' : {
                'type' : 'string',
                'description' : 'email used as username'
            },
            'password' : {
                'type' : 'string',
                'description' : 'The login password'
            },
            'rememberMe' : {
                'type' : 'boolean',
                'description' : 'If session should exist after browser is closed'
            }

        }
    },
    'Question' : {
        'id' : 'Question',
        'description' : 'Question to be submitted',
        'required': [
            'questionText',
            'options',
            'correctAnswer'
        ],
        'properties' : {
            'questionText' : {
                'type' : 'string',
                'description' : 'Question description'
            },
            'options' : {
                'type' : 'string',
                'description' : 'Answer options for the question '
            },
            'correctAnswer' : {
                'type' : 'string',
                'description' : 'Correct answer from the options '
            }

        }
    }
};