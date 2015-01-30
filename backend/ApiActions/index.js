'use strict';
exports.usersActions = require('./UsersActions');
exports.publicActions = require('./PublicActions');
exports.lessonsActions = require('./LessonsActions');
exports.questionsActions = require('./QuestionsActions');
exports.systemActions = require('./SystemActions');
exports.lessonsInvitationsActions = require('./LessonsInvitationsActions');
//exports.likes=require('./LikesActions');
exports.tagsActions = require('./TagsActions');
exports.likesActions = require('./LikesActions');
exports.reportsActions = require('./ReportsActions');
exports.helperContentsActions= require('./HelperContentsActions');
exports.abuseReportsActions= require('./AbuseReportActions');
exports.faqActions= require('./FAQActions');
var logger = require('log4js').getLogger('apiActions');


exports.actions = [];
function addAllActions ( actions ){
    for ( var i in actions ){
        if ( actions.hasOwnProperty(i) ){
            exports.actions.push(actions[i]);
        }
    }

}


for (var v in exports) {
    if (exports.hasOwnProperty(v)) {
        if (v.match(/Actions$/)) {
            logger.info('adding ' + v);
            addAllActions(exports[v]);
        }
    }
}




