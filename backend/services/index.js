var logger = require('log4js').getLogger('index');
logger.info('loading email service');
exports.conf = require('./Conf');
logger.info('all services loaded');
exports.email=require('./LergoEmailService');
logger.info('loading questions service');
exports.questionHandler = require('./QuestionService');
logger.info('loading email template service');
exports.emailTemplates = require('./EmailTemplateService');
logger.info('loading hmac service');
exports.hmac = require('./HmacService');
logger.info('loading conf');
exports.db = require('./DbService');
exports.redis = require('./RedisService');
exports.phraseApp = require('./PhraseApp');
exports.complexSearch = require('./ComplexSearchService');
exports.error = require('../managers/ErrorManager'); // todo move to services
exports.emailTemplateStrings = require('./EmailTemplateStrings');
logger.info('loading emailTemplateStrings');
