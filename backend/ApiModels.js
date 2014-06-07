
exports.models = {
    'LessonInvitationReport' : {
        'id' : 'LessonInvitationReport',
        'description' : 'Report for lesson invitation',
        'properties' : {
            'data' : {
                'type' : 'LessonInvitation',
                'description' : 'A copy of the invitation we are reporting on'
            },
            'answers' : {
                'type' : 'LessonInvitationReportAnswer',
                'description' : 'A model for an answer. Gives details so we will know which question in which step ' +
                    'was answered, what was the answer and if it is correct'

            }
        }
    },
    'LessonInvitation' : {
        'id': 'LessonInvitation',
        'description' : 'an invitation for a lesson. When created this model is almost empty. ' +
            'Once the invitation is used, and a user is trying to start the lesson, we add more fields to it' +
            'We copy the quiz items and the entire lesson so that the user will not be affected if there were any changes ' +
            'unless they choose to.' +
            '' +
            'We also add details about the inviter if the user is logged in. otherwise it is anonymous invitation' +
            ' (someone who invited themselves without a login)',
        'properties' : {
            'lessonId' : {
                'type' : 'ObjectID',
                'description' : 'the lesson we are inviting to'
            },
            'invitee' : {
                'type' : 'object',
                'description' : 'details about the person we are inviting. usually {"email" : "..." }'
            }

        }
    },
    'LessonInvitationReportAnswer' : {
        'id' : 'LessonInvitationReportAnswer',
        'description' : 'Data about the answer the user gave on a question',
        'properties' : {
            'quizItemId' : {
                'type' : 'ObjectId/string',
                'description' : 'The item in the quiz the user was answering'
            },
            'stepIndex' : {
                'type' : 'int',
                'description' : 'the index of the step within the lesson'
            },
            'userAnswer' : {
                'type' : 'object',
                'description' : 'a model for the answer. This model is type specific'
            },
            'checkAnswer' : {
                'type' : 'CheckAnswerResponse',
                'description' : 'The response we got after checking if the answer is correct or not'
            }
        }
    },
    'CheckAnswerResponse' : {
        'id' : 'CheckAnswerResponse',
        'description' : 'The response you get when you check an answer',
        'properties' : {
            'correct' : {
                'type' : 'boolean',
                'description' : 'whether the user was correct or not'
            }
        }
    },
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