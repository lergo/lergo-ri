var path = require('path');
var service = require('../backend/services/EmailTemplateService');
var logger = require('log4js').getLogger('TestMailTemplate');

logger.info('loaded services');

function doTest() {

    var mailVars = {
        "link" : "http://localhost:9000",
        "name" : "nudrhc",
        "lergoLink" : "http://localhost:9000/resetPassword",
        "lergoLogoAbsoluteUrl" : "http://localhost:9000"
    };
    service.renderResetPassword(mailVars, function ( err, html, txt ) {
        logger.info(arguments);
    });
}


service.load(path.join(__dirname, '../emails'), doTest );


