var dbManager = require('./DbManager');
var services = require('../services');
var lessonsManager = require('./LessonsManager');
var usersManager = require('./UsersManager');
var errorManager = require('./ErrorManager');
var questionsManager = require('./QuestionsManager');
var _ = require('lodash');
var logger = require('log4js').getLogger('LessonsInvitationsManager');
var models = require('../models');
var async = require('async');
var COLLECTION_NAME = 'lessonsInvitations';


function Invitation(invitation) {

    var self = this;

    self.getEmail = function () {
        return invitation.invitee.email;
    };

    self.setReportSent = function (value) {
        invitation.report.sent = value;
    };

    self.isReportSent = function () {
        return !!invitation.report.sent;
    };

    self.getName = function () {
        return invitation.invitee.email;
    };

    self.getInviter = function (callback) {

        return usersManager.findUser({ '_id': dbManager.id(invitation.inviter) }, function (err, result) {
            if (!!err) {
                callback(err);
                return;
            }
            callback(null, result);
        });
    };
    self.getLesson = function(callback) {

		return lessonsManager.getLesson({
			'_id' : dbManager.id(invitation.lessonId)
		}, function(err, result) {
			if (!!err) {
				callback(err);
				return;
			}
			callback(null, result);
		});
	};

}


/**
 *
 *
 * Once someone opens an invitation, our first step is to build the lesson
 *
 * @param invitation
 * @param callback
 */
exports.buildLesson = function (invitation, callback) {
    var lessonId = invitation.lessonId;
    var updatedInvitation = null;
    async.waterfall([
        function getLessonById(_callback) {
            lessonsManager.getLesson({ _id: dbManager.id(lessonId) }, _callback);
        }, function getAllQuizItems(result, _callback) {
            invitation.lesson = result;
            var lessonModel = new models.Lesson(result);
            var questionsId = lessonModel.getAllQuestionIds();
            questionsId = dbManager.id(questionsId);
            questionsManager.search({ '_id': { '$in': questionsId }}, {}, _callback);
        }, function updateLessonInvitation(result, _callback) {
            invitation.quizItems = result;
            updatedInvitation = invitation;
            exports.updateLessonInvitation(invitation, _callback);


        }, function addCounterOnLesson(_callback) {
            lessonsManager.incrementViews(lessonId, _callback);
        }, function invokeCallback() {
            callback(null, updatedInvitation);
        }


    ]);
};

exports.updateReport = function (invitationId, report, callback) {
    logger.info('updating report on invitation ', invitationId);

    // when we are updating the report - we want to make sure no one is abusing us..
    // we do this by making sure the report and invitation both point to same lesson.
    // it is hardly realistic that someone will be able to guess the combination of the invitation ID and the report ID
    // who both look at the same lesson

    dbManager.connect(COLLECTION_NAME, function (db, collection, done) {

        collection.update({ '_id': dbManager.id(invitationId), 'lessonId': report.data.lessonId }, { '$set': { 'report': report }}, function (err/*, count, response*/) {
            if (!!err) {
                done();
                callback(new errorManager.InternalServerError(err, 'unable to update report'));
                return;
            }
            callback(null, report);
        });
    });
};


exports.getReport = function (invitationId, callback) {
    exports.search({ '_id': dbManager.id(invitationId) }, { 'report': 1 }, function (err, result) {
        if (!!err) {
            callback(err);
            return;
        }

        callback(null, result.report);
    });
};

exports.sendReportLink = function (emailResources, invitationId, callback) {
    logger.info('send report is ready email');
    exports.search({ '_id': dbManager.id(invitationId)}, {}, function (err, invitationData) {
        if (!!err) {
            callback(err);
            return;
        }
        var invitationModel = new Invitation(invitationData);

        if (invitationModel.isReportSent()) {
            callback(null);
        }

        invitationModel.getInviter(function (err, inviter) {
            if (!!err) {
                callback(err);
                return;
            }

            var emailVars = {};
            _.merge(emailVars, emailResources);
            var lessonInviteLink = emailResources.lergoBaseUrl + '/#/public/lessons/invitations/' + invitationData._id + '/report';

            _.merge(emailVars, { 'link': lessonInviteLink, 'name': inviter.fullName });

            services.emailTemplates.renderReportReady(emailVars, function (err, html, text) {
                services.email.sendMail({
                    'to': inviter.email,
                    'subject': 'Someone finished their lesson',
                    'text': text,
                    'html': html
                }, function (err) {
                    if (!!err) {
                        logger.error('error while sending report', err);
                        callback(err);
                    } else {
                        logger.info('saving report sent true');
                        invitationModel.setReportSent(true);
                        exports.updateLessonInvitation(invitationData, function () {
                        });
                    }
                });
            });

        });
    });


};

exports.search = function (filter, projection, callback) {
    logger.info('finding the invitation', filter);
    dbManager.connect(COLLECTION_NAME, function (db, collection, done) {
        collection.findOne(filter, projection, function (err, result) {

            if (!!err) {
                done();
                callback(new errorManager.InternalServerError(err, 'error while getting lesson invitation'));
                return;
            }
            done();
            callback(null, result);
            return;

        });
    });
};

exports.find = exports.search;


exports.updateLessonInvitation = function (invitation, callback) {
    dbManager.connect(COLLECTION_NAME, function (db, collection, done) {
        collection.update({ _id: invitation._id }, invitation, function (err, result) {
            logger.info('after update', arguments);
            done();
            callback(err, result);
            return;
        });
    });
};


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

    var invitationModel = new Invitation(invitationData);
    var inviter = null;
	var lesson = null;
	async.waterfall([ function getLesson(_callback) {
		invitationModel.getLesson(function(err, _lesson) {
			lesson = _lesson;
			_callback(err);
		});
	}, function getInviter(_callback) {
		invitationModel.getInviter(function(err, _inviter) {
			inviter = _inviter;
			_callback(err);
		});
	}, function sendInvitation() {
		var emailVars = {};
		_.merge(emailVars, emailResources);
		var lessonInviteLink = emailResources.lergoBaseUrl + '/#/public/lessons/invitations/' + invitationData._id + '/display';

		_.merge(emailVars, {
			'link' : lessonInviteLink,
			'name' : invitationModel.getName(),
			'inviterName' : inviter.fullName,
			'inviterEmail' : inviter.email,
			'lessonTitle' : lesson.name
		});

		services.emailTemplates.renderLessonInvitation(emailVars, function(err, html, text) {
			services.email.sendMail({
				'to' : invitationModel.getEmail(),
				'subject' : invitationModel.getLessonTitle(),
				'text' : text,
				'html' : html
			}, function(err) {
				callback(err);
			});
		});
	} ]);
};