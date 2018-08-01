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
        var markup = ``;
        var emailVars = {};
        _.merge(emailVars, emailResources);
        var lessonInviteLink = emailResources.lergoBaseUrl + '/#!/public/lessons/reports/agg/' + report.data.classreportId + '/display';

        _.merge(emailVars, { 'link': lessonInviteLink, 'name': inviter.username, 'className': report.data.className, 'inviteeName': report.getName(),'lessonTitle': report.data.data.lesson.name, 'lessonLanguage':report.data.data.lesson.language });

        services.emailTemplates.renderReportReady(emailVars, function (err, html, text) {
            var subject = 'Here is a link to your class report';
            if (emailVars.lessonLanguage) {
                if (emailVars.lessonLanguage === 'hebrew') {
                    subject = 'הנה קישור לדוח הכיתה שלך';
                } else {
                    subject = 'Here is a link to your class report';
                }
            }
            services.email.sendMail({
                'to': inviter.email,
                'subject': subject,
                'text': text,
                'html': markup
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

        const person = {
            imageLink: 'https://images.freeimages.com/images/large-previews/322/indian-heads-1391201.jpg'
        };


        markup = `
        <img src=${person.imageLink} style="height: 100px; width: 200px; padding: 20px; border: 2px solid black">

         <p>
            Dear ${emailVars.name},
        </p>
        <p>

           the class report <b>${emailVars.className}</b> is now available!
           <br/> Click on the link below to see the  report.The report will be updated as more students finish the lesson
           <br/> This is the only email you will get regarding the lesson or class report.
        <p>
            <a href=${emailVars.link}>${emailVars.lessonTitle}</a>
        </p>
        <p>
            Powered by <a href="http://www.lergo.org/">LerGO - Educate Yourself.</a><br/>
            <a href="https://docs.google.com/forms/d/1wyO39CkCTiNAP1BrJLti0GjA8eMq6rv-QcZu0Lw1-tE/viewform?usp=send_form">Terms of Service</a> -
            <a href="https://docs.google.com/forms/d/1YQnB8KoouFW2cJHsO_bkdxAD2ekuLYJyvaH6AuIU-Ig/viewform?usp=send_form"> Send Feedback</a> -
            <a href="https://docs.google.com/forms/d/1t_CtQxTMJlTlLRx-3lSPv8bNfw3nVXpE2B2hGkdeSMg/viewform">Report Abuse</a> -
            <a href="https://docs.google.com/forms/d/1rU6sTKskoTqrd9u1wgiX_zG0QpfWsxizxe8CdDRj4fk/viewform?usp=send_form">Suggest a Lesson</a> -
            <a href="https://docs.google.com/forms/d/e/1FAIpQLSeFtpXck4viIM7aTo7GoZST3z2Cojjn0BNsb-o2IAz627fYsw/viewform?usp=sf_link">Why am I getting this email?</a><br>
        </p>
`;


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

