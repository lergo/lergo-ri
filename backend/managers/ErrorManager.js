'use strict';

var logger = require('log4js').getLogger('ErrorManager');
var _ = require('lodash');

logger.info('initializing ErrorManager');

function createSendFn( err ){
    return function(res){
        res.status( err.responseCode).send(JSON.stringify(err) );
    };
}


function createNewError( code, message, responseCode ){
    return function( e, description ){
        if ( e instanceof  Error ){
            e = { message : e.message, stackTrace: e.stackTrace };
        }
//        debugger;
        this.code = code;
        this.message = message;
        this.responseCode = responseCode;
        this.cause = e;
        this.description = description;
        this.send = createSendFn( this );
    };
}

var errorsDefinition = {
    'InvalidUsername' : createNewError(1,'login.invalidUsername',500),
    'InternalServerError' : createNewError(2, 'unknown error', 500),
    'NotLoggedIn' : createNewError(3, 'not logged in', 401),
    'NotAdmin' : createNewError(4, 'requires admin permissions', 401),
    'WrongLogin' : createNewError(5, 'wrong login', 401),
    'InvalidEmail': createNewError(6, 'invalid email', 500),
    'UserNotValidated' : createNewError(7, 'login.userNotValidated', 500),
    'UserValidationError' : createNewError( 8, 'unable to validate user', 500),
    'UserValidationFailed' : createNewError(9, 'user validation failed', 401),
    'UserAlreadyValidated' : createNewError(10, 'user already validated', 500),
    'ErrorSendingValidationEmail' : createNewError(11, 'unable to send validation email', 500),
    'NotFound' : createNewError(12, 'resource not found', 404),
    'UsernameAlreadyExists' : createNewError( 13, 'login.usernameAlreadyExists', 500 ),
    'ResourceInUse' : createNewError( 14, 'resource is in use' , 400 ),
    'Forbidden' : createNewError( 15, 'user has no permissions to do this', 403),
    'EmailAlreadyExists': createNewError( 16, 'login.emailAlreadyExists', 500 )
};


// this is nicer for translation
_.each(errorsDefinition, function (ed, key) {
    ed.errorKey = key;
});

for ( var errDefinition in errorsDefinition ){
    if ( errorsDefinition.hasOwnProperty(errDefinition)){
        module.exports[errDefinition] = errorsDefinition[errDefinition];
    }
}



