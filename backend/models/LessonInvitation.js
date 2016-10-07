'use strict';

/**
 * @typedef {object} LessonInvitee
 * @property {string} name
 */

/**
 * @typedef {ObjectId} LessonInviter - the User._id who invited the lesson
 */

/**
 * @typedef {object} LessonInvitation
 * @property {LessonInvitee} invitee
 * @property {LessonInviter} inviter
 */

//var logger = require('log4js').getLogger('LessonInvitation');
var AbstractModel = require('./AbstractModel');
var services = require('../services');

function LessonInvitation(data) {
    this.data = data;

    var self = this;

    self.getName = function () {
        return data.invitee.name;
    };

    self.getLessonIdStr = function(){
        return data.lessonId.toString();
    };

    self.getLesson = function(callback) {
        var Lesson = require('./Lesson');
        return Lesson.findById({
            '_id' : services.db.id(data.lessonId)
        }, function(err, result) {
            if (!!err) {
                callback(err);
                return;
            }
            callback(null, result);
        });
    };


}

LessonInvitation.collectionName = 'lessonsInvitations';

AbstractModel.enhance(LessonInvitation);

module.exports = LessonInvitation;

