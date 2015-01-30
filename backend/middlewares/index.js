exports.lessons = require('./LessonsMiddleware');
exports.questions = require('./QuestionsMiddleware');
exports.users = require('./UsersMiddleware');
exports.likes = require('./LikesMiddleware');
exports.session = require('./SessionMiddleware');
exports.lessonsInvitations = require('./LessonsInvitationsMiddleware');
// todo : move LergoMiddleware to this folder
exports.lergo = require('../LergoMiddleware'); // general middlewares
exports.reports = require('./ReportsMiddleware');
exports.helperContents = require('./HelperContentsMiddleware');
exports.abuseReports = require('./AbuseReportsMiddleware');
exports.faqs = require('./FAQsMiddleware');