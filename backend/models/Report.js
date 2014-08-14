'use strict';
//var logger = require('log4js').getLogger('Report');
var AbstractModel = require('./AbstractModel');
var logger = require('log4js').getLogger('Report');


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

    // returns the user we send report to
    self.getSendTo = function (callback) {
        var User = require('./User');
        logger.debug('looking for inviter', data.data.inviter) ;
        return User.findById( data.data.inviter, {}, function (err, result) {
            logger.debug('found inviter', result);
            if (!!err) {
                callback(err);
                return;
            }
            callback(null, result);
        });
    };
}


Report.collectionName = 'reports';


AbstractModel.enhance(Report);

module.exports = Report;

