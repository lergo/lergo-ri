'use strict';
var AbstractModel = require('./AbstractModel');



/**
 * @typedef {object} Report
 * @property {object} data
 * @property {LessonInvitee} data.invitee
 * @property {LessonInviter} data.inviter
 * @property {object} data.lesson
 * @property {string} data.lesson.language
 * @property {string} data.lesson.subject
 * @property {string} data.lesson.name
 * @property {boolean} finished - marks if report is finished
 */

/**
 *
 * @param data
 * @constructor
 */

function Report(data) {
    this.data = data;

    var self = this;

    self.isAnonymous = function(){
        return data.data.anonymous;
    };

    self.setSent = function (value) {
        data.sent = value;
    };

    self.isSent = function () {
        return !!data.sent;
    };

    self.getName = function () {
        return data.data.invitee.name;
    };
    
    self.isBasedOnTemporaryLesson = function(){
        return data && data.data && data.data.lesson && data.data.lesson.temporary;
    };

    // returns the user we send report to
    self.getSendTo = function (callback) {
        var User = require('./User');
        var LessonInvitation = require('./LessonInvitation');
        LessonInvitation.findById( data.invitationId , function(err, result){
            if (!!err){
                callback(err);
                return;
            }
            return User.findById( result.inviter, {}, function (err, result) {
                if (!!err) {
                    callback(err);
                    return;
                }
                callback(null, result);
            });
        });
    };
}


Report.collectionName = 'reports';


AbstractModel.enhance(Report);

module.exports = Report;

