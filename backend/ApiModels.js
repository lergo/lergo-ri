
exports.models = {
    'ChangePasswordDetails' : {
        'id': 'ChangePasswordDetails',
        'description' : 'Details for changing password',
        'properties' : {
            'userId' : {
                'type' : 'string',
                'description' : 'id of user changing the password. if user is logged in, this is optional'
            },
            'hmac' : {
                'type' : 'string',
                'description': 'hmac given on email link. if user is logged in, this is optional'
            },

            'newPassword' : {
                'type' : 'string',
                'description' : 'the new password'
            },
            'newPasswordConfirm' : {
                'type' : 'string',
                'description' : 'new password retype'
            }
        }
    },
    'ResetPasswordDetails' : {
        'id' : 'RequestResetPasswordDetails',
        'description' : 'Details needed to create reset password request. ' +
            'All are optional but at least one is required for operation to succeed',
        'properties' : {
            'username' : {
                'type' : 'string',
                'description' : 'a username'
            },
            'email' : {
                'type' : 'string',
                'description' : 'an email address'
            }

        }
    },
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
            'email' : {
                'type' : 'string',
                'description' : 'An email address for validation process'
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
        'description' : 'Question to be submitted'
    },
    'Lesson' : {
        'id' : 'Lesson',
        'description' : 'Lesson to be submitted',
        'required': [
            'name'
        ],
        'properties' : {
            'name' : {
                'type' : 'string',
                'description' : 'Lesson name'
            }
        }
    },
    'UserValidationData' : {
        'id' : 'EmailValidationData',
        'description' : 'used to validate user'
    }
};