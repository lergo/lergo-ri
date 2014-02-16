

/*** we should initialize everything according to dependency order
 *
 *   we do not allow circular dependency at the meantime
 *
 * **/

exports.logManager = require('./managers/LogManager');
exports.errorManager = require('./managers/ErrorManager');
exports.dbManager = require('./managers/DbManager');
exports.usersManager = require('./managers/UsersManager');
