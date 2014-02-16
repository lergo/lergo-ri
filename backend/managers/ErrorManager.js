'use strict';

var appContext = require('../ApplicationContext');
var logger = appContext.logManager.getLogger('ErrorManager');
logger.info('initializing ErrorManager');

function createNewError( code, message, responseCode ){
    return function( e, description ){
        this.code = code;
        this.message = message;
        this.responseCode = responseCode;
        this.cause = e;
        this.description = description;
    };
}

var errorsDefinition = {
    'InvalidUsername' : createNewError(1,'invalid username',500),
    'InternalServerError' : createNewError(2, 'unknown error', 500)
};

function createSendFn( err ){
    return function(res){
        res.send(JSON.stringify({ 'code': err.code, 'message': err.message}), err.responseCode);
    };
}

for ( var errDefinition in errorsDefinition ){
    if ( errorsDefinition.hasOwnProperty(errDefinition)){
        module.exports[errDefinition] = errorsDefinition[errDefinition];
        module.exports[errDefinition].send = createSendFn(module.exports[errDefinition]);
    }
}



