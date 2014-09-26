'use strict';
var managers = require('../managers');

var _ = require('lodash');
var logger = require('log4js').getLogger('LessonsInvitationsController');



exports.create = function (req, res) {
    logger.debug('creating invitation for lesson', req.lesson);

    var invitation = req.body || {};
    var anonymous = !req.body || JSON.stringify(req.body) === '{}';

    invitation = _.merge({ 'anonymous': anonymous, 'lessonId': req.lesson._id }, invitation);

    // add inviter in case we have details and this is not an anonymous invitation
    if (!!req.sessionUser && !anonymous ) {
        invitation.inviter = req.sessionUser._id;
    }

    // in case user is logged in and there's no invitee details, set logged in user as invitee
    if ( anonymous && !!req.sessionUser) {
        logger.debug('setting invitee on invitation');
        invitation.invitee = { 'name': req.sessionUser.username };
    }

    managers.lessonsInvitations.create(invitation, function (err, result) {
        if (!!err) {
            logger.error('unable to create lesson invitation', err);
            err.send(res);
            return;
        } else {
            res.send(result);
        }
    });
};




/**
 * <p>
 * When we generate an invite, we simply save invitation details.<br/>
 * To start the lesson from the invitation, we first construct a copy of the lesson <br/>
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
    var id = req.params.id;
    var construct = req.query.construct;
    var constructForce = req.query.constructForce;

    logger.info('building the invitation', id, construct, constructForce);
    managers.lessonsInvitations.find({'_id': managers.db.id(id)}, {}, function (err, result) {
        if (!!err) {
            err.send(res);
            return;
        }
        if ( !result ){
            res.send(404);
            return;
        }
        if (( !!constructForce || !result.lesson ) && construct) {
            logger.info('constructing invitation');
            managers.lessonsInvitations.buildLesson(result, function (err, constructed) {
                if (!!err) {
                    logger.error('error while constructing lesson', err);
                    res.send(500);
                    return;
                }
                res.send(constructed);
            });
        } else {
            res.send(result);
        }

    });
};
