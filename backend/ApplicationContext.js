



/*** we should initialize everything according to dependency order
 *
 *   we do not allow circular dependency at the meantime
 *
 * **/
exports.conf = require('./managers/ConfManager');
exports.logManager = require('./managers/LogManager');
exports.errorManager = require('./managers/ErrorManager');
exports.dbManager = require('./managers/DbManager');
exports.settings = require ('./managers/SettingsManager');
exports.usersManager = require('./managers/UsersManager');
exports.questionsManager = require('./managers/QuestionsManager');
exports.lessonsManager = require('./managers/LessonsManager');
