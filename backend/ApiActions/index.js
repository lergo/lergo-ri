'use strict';
exports.usersActions = require('./UsersActions');
exports.lessonsActions = require('./LessonsActions');
exports.playListsActions = require('./PlayListsActions');
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
exports.rolesActions = require('./RolesActions');

var logger = require('log4js').getLogger('apiActions');


exports.actions = [];
function addAllActions ( actions ){
    for ( var i in actions ){
        if ( actions.hasOwnProperty(i) ){
            var action = actions[i];
            if ( !action.spec.nickname ){
                //logger.trace('adding nickname',i);
                action.spec.nickname = i;
            }
            action.spec.errorResponses = [].concat(action.spec.errorResponses || [] ).concat([{ 'code': 500, 'reason': 'server error'}]);
            exports.actions.push(action);
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




