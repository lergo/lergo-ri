exports.usersActions = require('./UsersActions');
exports.publicActions = require('./PublicActions');
exports.adminActions = require('./AdminActions');
exports.lessonsActions = require('./LessonsActions');
exports.questionsActions = require('./QuestionsActions');
exports.systemActions = require('./SystemActions');
exports.lessonsInvitations = require('./LessonsInvitationsActions');
//exports.likes=require('./LikesActions');
exports.tags = require('./TagsActions');
exports.likes = require('./LikesActions');
var logger = require('log4js').getLogger('index');


function addAllActions ( actions ){
    for ( var i in actions ){
        if ( actions.hasOwnProperty(i) ){
            exports.actions.push(actions[i]);
        }
    }

}


exports.actions = [];
logger.info('adding public actions');
addAllActions( exports.publicActions );
logger.info('adding user actions');
addAllActions( exports.usersActions );
logger.info('adding admin actions');
addAllActions( exports.adminActions );
logger.info('adding lessons actions');
addAllActions( exports.lessonsActions );
logger.info('adding questions actions');
addAllActions( exports.questionsActions );
logger.info('adding system');
addAllActions( exports.systemActions );
logger.info('adding lessons invitations');
addAllActions( exports.lessonsInvitations );
logger.info('adding tags');
addAllActions( exports.tags );
logger.info('adding likes');
addAllActions( exports.likes );




