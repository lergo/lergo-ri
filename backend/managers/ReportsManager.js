'use strict';
var Report = require('../models').Report;
var services = require('../services');
var _ = require('lodash');
var logger = require('log4js').getLogger('ReportsManager');


exports.sendReportLink = function (emailResources, report, callback) {
    logger.info('send report is ready email');


    if (report.isAnonymous()) {
        callback();
        return;
    }

    if (report.isSent()) {
        callback(null);
        return;
    }

    report.getSendTo(function (err, inviter) {
        if (!!err) {
            callback(err);
            return;
        }

        var emailVars = {};
        _.merge(emailVars, emailResources);
        var lessonInviteLink = emailResources.lergoBaseUrl + '/#!/public/lessons/reports/' + report.data._id + '/display';

        _.merge(emailVars, { 'link': lessonInviteLink, 'name': inviter.fullName, 'inviteeName': report.getName(), 'lessonTitle': report.data.data.lesson.name });

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
                    report.setSent(true);
                    report.update();
                }
            });
        });

    });

};

exports.getUserReports = function(userId, callback) {
    userId = services.db.id(userId);
	Report.find({ $or :  [ { 'userId' : userId }, { 'userId' : userId.toString()}, { 'data.inviter' : userId} , { 'data.inviter' : userId.toString()} ]},{},callback);
};

exports.deleteReport = function(id, callback) {
	Report.connect(function(db, collection) {
		collection.remove({
			'_id' : services.db.id(id)
		}, function(err) {
			if (!!err) {
				logger.error('unable to delete report [%s]', err.message);
			}
			callback(err);
		});
	});
};