'use strict';

/**
 * @typedef {object} PlaylistInvitee
 * @property {string} name
 */

/**
 * @typedef {ObjectId} PlaylistInviter - the User._id who invited the playlist
 */

/**
 * @typedef {object} PlaylistInvitation
 * @property {PlaylistInvitee} invitee
 * @property {PlaylistInviter} inviter
 */

//var logger = require('log4js').getLogger('PlaylistInvitation');
var AbstractModel = require('./AbstractModel');
var services = require('../services');

function PlaylistInvitation(data) {
    this.data = data;

    var self = this;

    self.getName = function () {
        return data.invitee.name;
    };

    self.getPlaylistIdStr = function(){
        return data.playlistId.toString();
    };

    self.getPlaylist = function(callback) {
        var Playlist = require('./Playlist');
        return Playlist.findById({
            '_id' : services.db.id(data.playlistId)
        }, function(err, result) {
            if (!!err) {
                callback(err);
                return;
            }
            callback(null, result);
        });
    };


}

PlaylistInvitation.collectionName = 'playlistsInvitations';

AbstractModel.enhance(PlaylistInvitation);

module.exports = PlaylistInvitation;

