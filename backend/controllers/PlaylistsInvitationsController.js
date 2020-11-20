'use strict';

/**
 * @module PlaylistsInvitationsController
 * @type {exports}
 */

var managers = require('../managers');
var services = require('../services');
var _ = require('lodash');
var logger = require('log4js').getLogger('PlaylistsInvitationsController');
var PlaylistInvitation = require('../models/PlaylistInvitation');
var Pin = require('../seqGen/SeqGen.Model');


exports.create = function (req, res) {
    logger.debug('creating invitation for playlist', req.playlist);

    var invitation = req.body || {};
    var anonymous = !req.body || JSON.stringify(req.body) === '{}';
    var thirtyYearsMillis = 30 * 365 * 24 * 60 * 60 * 1000;
    var sixtyHoursMillis = 60 * 60 * 60 * 1000;
    var expiresAt = anonymous && new Date(Date.now() + sixtyHoursMillis) || new Date(Date.now() + thirtyYearsMillis);
    invitation = _.merge({
        'anonymous': anonymous,
        'playlistId': req.playlist._id,
        'subject': req.playlist.subject,
        'language': req.playlist.language,
        'age': req.playlist.age,
        'name': req.playlist.name,
        'lastUpdate': new Date().getTime(),
        'expiresAt': new Date(expiresAt)
    }, invitation);

    if (invitation.invitee && invitation.invitee.class) {
        invitation.emailNotification = false;
    } else {
        invitation.emailNotification = true;
    }

    // add inviter in case we have details and this is not an anonymous
    // invitation
    if (!!req.sessionUser && !anonymous) {
        invitation.inviter = req.sessionUser._id;
    }


    // in case user is logged in and there's no invitee details, set logged in
    // user as invitee
    if (anonymous && !!req.sessionUser) {
        logger.debug('setting invitee on invitation');
        invitation.invitee = {
            'name': req.sessionUser.username
        };
    }
    if (!!anonymous) {
        managers.playlistsInvitations.create(invitation, function (err, result) {
            if (!!err) {
                logger.error('unable to create playlist invitation', err);
                err.send(res);
            } else {
                res.send(result);
            }
        });
    } else {
        Pin.getNext(function (err, pin) {
            invitation.pin = pin;
            managers.playlistsInvitations.create(invitation, function (err, result) {
                if (!!err) {
                    logger.error('unable to create playlist invitation', err);
                    err.send(res);
                } else {
                    res.send(result);
                }
            });
        });
    }

};

/**
 * <p>
 * When we generate an invite, we simply save invitation details.<br/> To start
 * the playlist from the invitation, we first construct a copy of the playlist <br/>
 * </p>
 *
 * <p>
 * We use a copy because otherwise the report might be out of sync.<br/>
 * </p>
 *
 *
 *
 *
 * @param req
 * @param res
 */
exports.build = function (req, res) {
    var invitation = req.invitation;
    var construct = req.query.construct;
    var constructForce = req.query.constructForce;

    logger.info('building the invitation', invitation._id, construct, constructForce);
    if ((!!constructForce || !invitation.playlist) && construct) {
        logger.info('constructing invitation');
        managers.playlistsInvitations.buildPlaylist(invitation, function (err, constructed) {
            if (!!err) {
                logger.error('error while constructing playlist', err);
                new managers.error.InternalServerError(err, 'unable to build invitation').send(res);
                return;
            }
            res.send(constructed);
        });
    } else {
        managers.playlists.incrementViews(invitation.playlistId, function () { /** noop **/
        });
        res.send(invitation);
    }
};

/**
 *
 * @description
 * updates a playlist invite
 *
 *
 * @param {object} req
 * @param {Invite} req.body - the updated invite
 * @param {Invite} req.invite - invite from DB
 * @param {object} res
 */
// assume Invite exists in the system, verified by middleware
exports.update = function (req, res) {
    logger.info('updating Invite');

    var invitation = req.body;

    //We don't want to save playlist and quizItems as it always added on runtime
    delete invitation.playlist;
    delete invitation.quizItems;

    if (!!invitation._id) {
        invitation._id = services.db.id(invitation._id);
    }

    if (!!invitation.inviter) {
        invitation.inviter = services.db.id(invitation.inviter);
    }

    if (!!invitation.playlistId) {
        invitation.playlistId = services.db.id(invitation.playlistId);
    }

    // guy - LERGO-589 - playlist breaks after marked undone.
    // the reason why it happens is that "update" should not allow to modify these fields.
    // these fields can only be "rebuilt". look at function "exports.build" in this file.
    // if (!!req.invitation.playlist) {
    //     invitation.playlist = req.invitation.playlist;
    // }
    //
    // if (!!req.invitation.quizItems) {
    //     invitation.quizItems = req.invitation.quizItems;
    // }


    new PlaylistInvitation(invitation).update(function (err) {
        logger.info('invitation updated');
        if (!!err) {
            new managers.error.InternalServerError(err, 'unable to update invitation').send(res);
            return;
        } else {
            res.send(invitation);
            return;
        }
    });
};


exports.getById = function (req, res) {
    res.send(req.invitation);
};

exports.getByPin = function (req, res) {
    try {
        PlaylistInvitation.findOne({pin: Number(req.params.pin)}, function (err, result) {
            if (!!err) {
                res.send(500, err);
                return;
            }
            logger.debug('putting invitation on request', result);
            res.send(result);
        });
    } catch (e) {
        res.send(404);
    }
};

exports.find = function (req, res) {
    if (!req.queryObj || !req.queryObj.filter) {
        res.status(500).send('no filter or query object available');
        return;
    }
    req.queryObj.filter.inviter = req.sessionUser._id;
    managers.playlistsInvitations.complexSearch(req.queryObj, function (err, obj) {
        if (!!err) {
            err.send(res);
            return;
        } else {
            res.send(obj);
            return;
        }
    });
};

exports.deleteInvitation = function (req, res) {
    Pin.free(req.invitation.pin);
    managers.playlistsInvitations.deleteById(req.invitation._id, function (err, deletedInvitation) {
        if (!!err) {
            logger.error('error deleting report', err);
            err.send(res);
            return;
        } else {
            res.send(deletedInvitation);
            return;
        }
    });
};


exports.getStudents = function (req, res) {

    var like = req.param('like');
    like = new RegExp(like, 'i');

    PlaylistInvitation.connect(function (db, collection) {
        collection.aggregate([
            {'$match': {'inviter': req.sessionUser._id}},
            {'$group': {_id: '$invitee.name'}},
            {'$match': {'_id': {'$ne': null}}},
            {'$match': {'_id': like || ''}}
        ], function (err, cursor) {
            cursor.toArray(function(err, result) {
                res.send(result);
            }); 
        });
    });

};


exports.getClasses = function (req, res) {

    var like = req.param('like');
    like = new RegExp(like, 'i');

    PlaylistInvitation.connect(function (db, collection) {
        collection.aggregate([
            {'$match': {'inviter': req.sessionUser._id.toString()}},
            {'$group': {_id: '$invitee.class'}},
            {'$match': {'_id': {'$ne': null}}},
            {'$match': {'_id': like || ''}}
        ], function(err, cursor) {
            cursor.toArray(function(err, result) {
                res.send(result);
              });
        });
    });

};
