var controllers = require('../controllers');
exports.signup = {
    'spec': {
    'description': 'Sign up a new user',
        'name':'signup',
        'path': '/backend/user/signup',
//        'notes': 'Returns 200 if everything went well, otherwise returns error response',
        'summary': 'Sign up a new user',
        'method': 'POST',
        'parameters': [ {'paramType' : 'body', 'name' : 'user' , required:true, 'description': 'User signup details', 'type': 'UserSignupForm'}],
        'errorResponses': [ { 'code' : 500 , 'reason' : 'unable to signup'}],
        'nickname': 'signupUser'
},
    'action': controllers.users.signup
}