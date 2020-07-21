'use strict';
var AbstractModel = require('./AbstractModel');



/**
 * @typedef {object} PlaylistRprt
 * @property {object} data
 * @property {PlaylistInvitee} data.invitee
 * @property {PlaylistInviter} data.inviter
 * @property {object} data.playlist
 * @property {string} data.playlist.language
 * @property {string} data.playlist.subject
 * @property {string} data.playlist.name
 * @property {boolean} finished - marks if playlistRprt is finished
 */

/**
 *
 * @param data
 * @constructor
 */

function PlaylistRprt(data) {
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

    self.isBasedOnTemporaryPlaylist = function(){
        return data && data.data && data.data.playlist && data.data.playlist.temporary;
    };

    // returns the user we send playlistRprt to
    self.getSendTo = function (callback) {
        var User = require('./User');
        var PlaylistInvitation = require('./PlaylistInvitation');
        PlaylistInvitation.findById( data.invitationId , function(err, result){
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


PlaylistRprt.collectionName = 'playlistRprts';


AbstractModel.enhance(PlaylistRprt);

module.exports = PlaylistRprt;

