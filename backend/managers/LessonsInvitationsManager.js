var dbManager = require('./DbManager');
var services = require('../services');
var lessonsManager = require('./LessonsManager');
var errorManager = require('./ErrorManager');
var questionsManager = require('./QuestionsManager');
var _ = require('lodash');
var logger = require('log4js').getLogger('LessonsInvitationsManager');
var models = require('../models');
var async = require('async');
var COLLECTION_NAME = 'lessonsInvitations';
/**
 *
 *
 * Once someone opens an invitation, our first step is to build the lesson
 *
 * @param invitation
 */
exports.buildLesson = function (invitation, callback) {
    var lessonId = invitation.lessonId;
    var updatedInvitation = null;
    async.waterfall([
        function getLessonById( _callback ){
            lessonsManager.getLesson({ _id: dbManager.id(lessonId) },_callback);
        }, function getAllQuizItems( result, _callback ){
            invitation.lesson = result;
            var lessonModel = new models.Lesson( result );
            var questionsId = lessonModel.getAllQuestionIds( );
            questionsId = dbManager.id(questionsId);
            questionsManager.search({ '_id': { '$in': questionsId }}, {}, _callback);
        },function updateLessonInvitation( result, _callback) {
            invitation.quiztItems = result;
            updatedInvitation = invitation;
            exports.updateLessonInvitation(invitation, _callback);
            return;

        }, function invokeCallback( ){
            callback(null, updatedInvitation);
        }


    ]);
};

exports.search = function (filter, projection, callback) {
    logger.info('finding the invitation', filter);
    dbManager.connect(COLLECTION_NAME, function (db, collection, done) {
        collection.findOne(filter, function (err, result) {

            if (!!err) {
                done();
                callback(new errorManager.InternalServerError(err, 'error while getting lesson invitation'));
                return;
            }
            done();
            callback(null, result);
            return;

        })
    })
};

exports.find = exports.search;


exports.updateLessonInvitation = function (invitation, callback) {
    dbManager.connect(COLLECTION_NAME, function (db, collection, done) {
        collection.update({ _id: invitation._id }, invitation, function ( err, result ) {
            logger.info('after update', arguments);
            done();
            callback(err, result);
            return;
        })
    });
};

function Invitation(invitation) {

    var self = this;

    self.getEmail = function () {
        return invitation.invitee.email;
    };

    self.getName = function () {
        return invitation.invitee.email;
    };


}

exports.create = function (emailResources, invitation, callback) {
    dbManager.connect(COLLECTION_NAME, function (db, collection, done) {
        collection.insert(invitation, {}, function (err, result) {
            done();
            exports.sendInvitationMail(emailResources, result[0], callback);
            return;
        });

    });
};


exports.sendInvitationMail = function (emailResources, invitationData, callback) {

    debugger;
    var invitationModel = new Invitation(invitationData);

    var emailVars = {};
    _.merge(emailVars, emailResources);
    var lessonInviteLink = emailResources.lergoBaseUrl + '/#/public/lessons/invitations/' + invitationData._id + '/display';

    _.merge(emailVars, { 'link': lessonInviteLink, 'name': invitationModel.getName() });

    services.emailTemplates.renderLessonInvitation(emailVars, function (err, html, text) {
        services.email.sendMail({
            'to': invitationModel.getEmail(),
            'subject': 'You are invited to a LerGO lesson',
            'text': text,
            'html': html
        }, function (err) {
            callback(err);
        });
    });

};