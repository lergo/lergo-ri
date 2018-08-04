'use strict';


/**
 * @name ReportsManager
 * @class
 *
 */
/**
 * @name managers
 * @module
 */
/**
 *
 * @type {exports.Report|*}
 */

var Report = require('../models').Report;
var services = require('../services');
var _ = require('lodash');
var logger = require('log4js').getLogger('ReportsManager');
var ObjectId = require('mongodb').ObjectId;

exports.sendReportLinkForClass = function (emailResources, report, callback) {
    logger.info('send classReport is ready email');


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
        var lergoLanguage = 'he';
        if (report.data.data.lesson.language !== 'hebrew') {
            lergoLanguage = 'en';
        }
        var _lessonId = new ObjectId(report.data.lessonId);
        var _className = report.data.className.split(' ').join('%20');
        var classReportLink = emailResources.lergoBaseUrl + '/#!/public/lessons/reports/agg/' + report.data.classreportId + '/display';
        var studentReportLink = emailResources.lergoBaseUrl + '/#!/public/lessons/reports/' + report.data._id + '/display';
        var allStudentReportsLink = emailResources.lergoBaseUrl + '/#!/user/create/reports?reportType=students&lergoFilter.reportClass=' + '"' + _className + '"' + '&lergoFilter.reportLesson={"_id":"' + _lessonId + '"' +',' +  '"name":"' + report.data.data.lesson.name  + '"}&lergoLanguage=' + lergoLanguage + '&lergoFilter.filterLanguage="' + report.data.data.lesson.language + '"';
        _.merge(emailVars, { 'classReportLink': classReportLink, 'studentReportLink': studentReportLink, 'allStudentReports': allStudentReportsLink,  'name': inviter.username, 'className': report.data.className, 'lessonId': report.data.lessonId, 'inviteeName': report.getName(),'lessonTitle': report.data.data.lesson.name, 'lessonLanguage':report.data.data.lesson.language });
            var html = services.emailTemplateStrings.classReportMarkup(emailVars);
            var text = services.emailTemplateStrings.classReportText(emailVars);
            var subject = 'Here is a link to your class report';
            if (emailVars.lessonLanguage) {
                if (emailVars.lessonLanguage === 'hebrew') {
                    subject = 'מישהו סיים את השיעור + קישור לדוח כיתה ולדוחות תלמיד';
                } else {
                    subject = 'Someone finished a lesson + link to lesson reports';
                }
            }
            services.email.sendMail({
                'to': inviter.email,
                'subject': subject,
                'text': text,
                'html': html
            }, function (err) {
                if (!!err) {
                    logger.error('error while sending classreport', err);
                    callback(err);
                } else {
                    logger.info('saving  report sent true');
                    report.setSent(true);
                    report.update();
                    callback();
                }
            });


    });

};

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

        _.merge(emailVars, { 'link': lessonInviteLink, 'name': inviter.username, 'inviteeName': report.getName(), 'lessonTitle': report.data.data.lesson.name, 'lessonLanguage':report.data.data.lesson.language });

        services.emailTemplates.renderReportReady(emailVars, function (err, html, text) {
            var subject = 'Someone finished their lesson';
            if (emailVars.lessonLanguage) {
                if (emailVars.lessonLanguage === 'hebrew') {
                    subject = 'מישהו סיים את השיעור';
                } else {
                    subject = 'Someone finished their lesson';
                }
            }
            services.email.sendMail({
                'to': inviter.email,
                'subject': subject,
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
                    callback();
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


/**
 * @callback ReportsManager~ReportsManagerComplexSearchCallback
 * @param {error} err
 * @param {Array<LessonInvitation>} result
 */

/**
 *
 * @param {ComplexSearchQuery} queryObj
 * @param {ReportsManager~ReportsManagerComplexSearchCallback} callback
 */
exports.complexSearch = function( queryObj, callback ){

    // change some keys around for report.
    if ( !!queryObj.filter ){
        if ( !!queryObj.filter.language ){
            queryObj.filter['data.lesson.language'] = queryObj.filter.language;
            delete queryObj.filter.language;
        }

        if ( !!queryObj.filter.subject){
            queryObj.filter['data.lesson.subject'] = queryObj.filter.subject;
            delete queryObj.filter.subject;
        }

        if (!!queryObj.filter.invitationId) {
            if(queryObj.filter.invitationId.hasOwnProperty('$in')){
                queryObj.filter.invitationId.$in=_.map(queryObj.filter.invitationId.$in,services.db.id);
            }else{
                queryObj.filter.invitationId = services.db.id(queryObj.filter.invitationId);
            }
        }
    }

    Report.connect( function( db, collection ){
        services.complexSearch.complexSearch( queryObj, { collection : collection }, function(err, reports){
            if (!!err){
                callback(err);
            }else{ // merge results with invitation ID
                var lessonInvitationIds = _.map(reports.data, 'invitationId');
                var LessonInvitation = require('../models').LessonInvitation;
                LessonInvitation.find({_id:{$in:lessonInvitationIds}},{},function(err,arrResult){
                    if(!!err){
                        callback(err);
                    }else{
                        var invitationById = _.keyBy(arrResult,'_id');
                        _.map(reports.data, function(r){ // first data is from complex search
                            _.merge(r.data, invitationById[r.invitationId]); // second data is on report.
                        });
                        callback(null, reports);
                    }
                });
            }
        });
    });
};

