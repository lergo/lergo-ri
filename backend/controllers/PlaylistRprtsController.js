'use strict';

/**
 * @module PlaylistRprtsController
 * @type {exports.PlaylistRprt|*}
 */
var PlaylistRprt = require('../models').PlaylistRprt;
var ClassPlaylistRprt = require('../models').ClassPlaylistRprt;
var services = require('../services');
var managers = require('../managers');
var logger = require('log4js').getLogger('PlaylistRprtsController');
var _ = require('lodash');


var timeOutIDMap = {};


function getStepDurationAgg(durations) {
    var steps = {};
    _.forEach(durations, function (stepDurations) {
        for (var i = 0; i < stepDurations.length; i++) {
            var duration = stepDurations[i].endTime - stepDurations[i].startTime;
            if (isNaN(duration)) {
                duration = 0;
            }
            var step = steps[i];
            if (!!step) {
                step.duration = step.duration + duration;
                step.count = step.count + 1;
            } else {
                step = {
                    duration: duration,
                    count: 1
                };
                steps[i] = step;
            }
        }
    });
    return steps;
}
function getAnswersAgg(answers) {
    var answersAgg = {};
    _.forEach(_.flatten(answers), function (answer) {
        var key = answer.quizItemId;
        var ansAgg = answersAgg[key];
        if (!ansAgg) {
            ansAgg = {
                duration: 0,
                count: 0,
                correct: 0,
                hintUsed: 0
            };
        }
        ansAgg.duration = ansAgg.duration + answer.duration;
        ansAgg.count = ansAgg.count + 1;
        if (!!answer.checkAnswer.correct) {
            ansAgg.correct = ansAgg.correct + 1;
        }
        if (!!answer.isHintUsed) {
            ansAgg.hintUsed = ansAgg.hintUsed + 1;
        }
        ansAgg.stepIndex = answer.stepIndex;
        ansAgg.quizItemType = answer.quizItemType;
        answersAgg[key] = ansAgg;
    });
    return answersAgg;
}

function getStepAnswersAgg(answers) {
    var stepAnsAgg = _.reduce(answers, function (res, val) {
        if (val.quizItemType !== 'openQuestion') {
            var key = val.stepIndex;
            var result = res[key];
            if (!result) {
                result = {correctAnswers: 0, totalAnswers: 0};
            }
            result.correctAnswers = result.correctAnswers + val.correct;
            result.totalAnswers = result.totalAnswers + val.count;
            res[key] = result;
        }
        return res;
    }, {});

    return stepAnsAgg;
}

// update class level playlistRprts
/**
 *  This method will aggregate all playlistRprts corresponding to an invitationId if invitation is of class type
 * @param invitationId : invitation id whose class need to be aggregated
 */
function updateClassAggPlaylistRprts(invitationId) {
    var aggregate = function () {
        PlaylistRprt.aggregate([{
            $match: {'data.invitee.class': {$exists: true}, 'invitationId': invitationId, 'finished': true}
        }, {
            $group: {
                _id: '$invitationId',
                duration: {$avg: '$duration'},
                correctPercentage: {$avg: '$correctPercentage'},
                count: {$sum: 1},
                data: {$first: '$data'},
                lastUpdate: {$max: '$lastUpdate'},
                answers: {$push: '$answers'},
                stepDurations: {$push: '$stepDurations'}
            }
        }, {
            $project: {
                _id: 0,
                invitationId: '$_id',
                duration: 1,
                correctPercentage: 1,
                count: 1,
                lastUpdate: 1,
                data: 1,
                answers: 1,
                stepDurations: 1
            }
        }],
        function (err, cursor) {
            if (!!err) {
                console.error(err);
            }
            cursor.toArray(function(err, result) {
                if (!!result && result.length > 0) {
                    var playlistRprt = result[0];
                    playlistRprt.answers = getAnswersAgg(playlistRprt.answers);
                    var stepAnswersAgg = getStepAnswersAgg(playlistRprt.answers);
                    var stepDurationAgg = getStepDurationAgg(playlistRprt.stepDurations);
                    playlistRprt.stepDurations = _.merge(stepDurationAgg, stepAnswersAgg);
                   
                    ClassPlaylistRprt.connect(function (db, collection) {
                        try {
                            collection.updateOne(
                                { invitationId: playlistRprt.invitationId }, 
                                { $set: playlistRprt },
                                { upsert: true }
                            )
                                .then(function(result) {
                                    if (result.result.nModified === 0) {
                                        logger.info('inserting class playlistRprt');
                                        managers.playlistRprts.prepareClassPlaylistRprtEmailData(collection,playlistRprt);
                                    } else {
                                        logger.info('updating class ceport', playlistRprt.data.name);
                                    }
                                });
    
                        } catch (e) {
                            logger.error('unable to save class playlistRprt', e);
                        }
                    });
                }
            }); 
        });
    };
    clearTimeout(timeOutIDMap[invitationId]);
    timeOutIDMap[invitationId] = setTimeout(aggregate, 500);
}


exports.createNewPlaylistRprtForPlaylistInvitation = function (req, res) {

    var playlistRprt = {
        invitationId: services.db.id(req.invitation._id),
        data: {
            name: req.invitation.name, // required for filter by playlist name
            playlist: {
                language: req.invitation.language,
                subject: req.invitation.subject,
                name: req.invitation.name
            }
        }
    };

    if ( req.invitation.inviter ){ // required for 'students playlistRprt'
        playlistRprt.data.inviter = req.invitation.inviter.toString();
    }

    if ( req.invitation.invitee ){ // required for 'student filter'
        playlistRprt.data.invitee = req.invitation.invitee;
    }

    if ( req.invitation.playlistId){ // required for filter by playlist name
        playlistRprt.data.playlist._id = req.invitation.playlistId.toString();
        playlistRprt.data.playlistId = req.invitation.playlistId.toString();
    }

    playlistRprt.data.emailNotification = req.invitation.emailNotification; // required for sending email

    var overrides = req.body;

    // this is a hack until we sort out the "invite -- build" algorithm.
    // we should stop building invitation and instead build playlistRprt..
    // when we do this, this algorithm should be able to simply put the invitee details and that's it..
    // for now, it has to wait for 'update' on playlistRprt for it to actually apply
    if (req.body.invitee) {
        playlistRprt.inviteeOverride = overrides.invitee;
    }

    if (!req.invitation) {
        logger.error('invitation is missing on request');
    } else {
        logger.debug('found invitation on request');
    }
    logger.info('creating new playlistRprt for playlist invitation');
    PlaylistRprt.connect(function (db, collection) {
        try {
            logger.info('connected to collection');

            logger.info('inserting playlistRprt');
            collection.insertOne(playlistRprt, function () {
                res.send(playlistRprt);
            });
        } catch (e) {
            logger.error('unable to save playlistRprt', e);
        }
    });
};

exports.readPlaylistRprtById = function (req, res) {
    res.send(req.playlistRprt);
};


exports.getStudents = function (req, res) {

    var like = req.param('like');
    like = new RegExp(like, 'i');

    PlaylistRprt.connect(function (db, collection) {
        collection.aggregate([
            {'$match': {'data.inviter': req.sessionUser._id.toString()}},
            {'$group': {_id: '$data.invitee.name'}},
            {'$match': {'_id': {'$ne': null}}},
            {'$match': {'_id': like || ''}}
        ],
        function (err, cursor) {
            cursor.toArray(function(err, result) {
                res.send(result);
            });
        });
                /* new managers.error.InternalServerError(err, 'unable to fetch students').send(res);
                return; */  
    });

};


exports.getClasses = function (req, res) {

    var like = req.param('like');
    like = new RegExp(like, 'i');

    PlaylistRprt.connect(function (db, collection) {
        collection.aggregate([
            {'$match': {'data.inviter': req.sessionUser._id.toString()}},
            {'$group': {_id: '$data.invitee.class'}},
            {'$match': {'_id': {'$ne': null}}},
            {'$match': {'_id': like || ''}}
        ],
        function (err, cursor) {
            cursor.toArray(function(err, result) {
                res.send(result);
            });
        });
    });

};


// assume playlistRprt exists in the system, verified by middleware
exports.updatePlaylistRprt = function (req, res) {
    var playlistRprt = req.body;
    var playlistRprtModel = new PlaylistRprt(playlistRprt);
    playlistRprt._id = services.db.id(playlistRprt._id);
    playlistRprt.invitationId = services.db.id(playlistRprt.invitationId); // convert to db

    if (!playlistRprtModel.isBasedOnTemporaryPlaylist()) { // we must have data duplication on in case playlist is temporary.. (practice mistakes for example), because once done, the playlist is deleted.
        playlistRprt.data = req.playlistRprt.data; // data is overridden sometimes for backward compatibility since october 2016 - we decided to remove as much data from playlistRprt as possible
    }

    if (!!req.sessionUser) {
        // if the person who is doing the playlist is logged in, we want to know
        // that.
        playlistRprt.userId = req.sessionUser._id;
    }

    if (!!req.emailResources) {
        // we need this for class playlistRprt emailResources
        playlistRprt.emailResources = req.emailResources;
    }
 
    // this is a temporary fix. to be able for students to register their names.
    // since we are building the invite instead of the playlistRprt, on each update, we need to make sure invitee is correct.
    // the parameters are kept on the side.
    if (playlistRprt.inviteeOverride) {
        try {
            logger.debug('merging student name with class name');
            _.merge(playlistRprt.data.invitee, playlistRprt.inviteeOverride);
        } catch (e) {
            logger.warn(e);
            // I don't care about errors here since it is a temporary work-around.
        }
    }
    // id.
    logger.info('creating playlistRprt to update');

    playlistRprtModel.update(function (err) {
        logger.info('playlistRprt being updated using the model');
        if (!!err) {
            new managers.error.InternalServerError(err, 'unable to update playlistRprt').send(res);
            return;
        } else {
            res.send(playlistRprt);
            if(!!playlistRprt.finished){
                updateClassAggPlaylistRprts(playlistRprt.invitationId);
            }
            return;
        }
    });
};

exports.sendPlaylistRprtReady = function (req, res) {
    managers.playlistRprts.sendPlaylistRprtLink(req.emailResources, new PlaylistRprt(req.playlistRprt), function (err) {
        if (!!err) {
            err.send(res);
            return;
        }

        res.status(200).send({});  // lergo-577 - this response would cause "illegal token O" in frontend.

    });
};

/**
 *
 * Gets playlistRprts done by me.
 *
 * we model it by putting 'userId' on the playlistRprt.
 *
 * this does not include playlistRprts I invited someone else to do.
 *
 * this action removes the "data" field from the playlistRprts.
 *
 * @param req - the request
 * @param res - the response
 */
exports.getUserPlaylistRprts = function (req, res) {
    if (!req.queryObj || !req.queryObj.filter) {
        res.status(500).send('no filter or query object available');
        return;
    }

    req.queryObj.filter.userId = req.sessionUser._id;

    managers.playlistRprts.complexSearch(req.queryObj, function (err, obj) {
        if (!!err) {
            err.send(res);
            return;
        } else {
            res.send(obj);
            return;
        }
    });
};

/**
 *
 * gets playlistRprts I invited.
 *
 *
 * in this scenario there might not be a userId on the playlistRprt.
 * we go by the data.inviter field which holds the inviter's userId - only users can invite..
 *
 *
 * @param req - the request
 * @param res - the response
 */
exports.getUserStudentsPlaylistRprts = function (req, res) {
    if (!req.queryObj || !req.queryObj.filter) {
        res.status(500).send('no filter or query object available');
        return;
    }

    req.queryObj.filter['data.inviter'] = req.sessionUser._id.toString();

    managers.playlistRprts.complexSearch(req.queryObj, function (err, obj) {
        if (!!err) {
            err.send(res);
            return;
        } else {
            res.send(obj);
            return;
        }
    });
};

exports.deletePlaylistRprt = function (req, res) {
    // when an looged in user tries to delete playlistRprt of the playlist done by him
    // in order of someone else invite dont delete the playlistRprt just remove the
    // userId from the playlistRprt so that it will be available to inviter but not to
    // logged in invitee.
    if (!!req.deleteUserInfo) {
        var playlistRprt = req.playlistRprt;
       playlistRprt.userId = null;
        new PlaylistRprt(playlistRprt).update(function (err) {
            logger.info('playlistRprt updated');
            if (!!err) {
                new managers.error.InternalServerError(err, 'unable to update playlistRprt').send(res);
                return;
            } else {
                res.send(playlistRprt);
                return;
            }
        });
    } else {

        managers.playlistRprts.deletePlaylistRprt(req.playlistRprt._id, function (err, deletedPlaylistRprt) {
            if (!!err) {
                logger.error('error deleting playlistRprt', err);
                err.send(res);
                return;
            } else {
                updateClassAggPlaylistRprts(req.playlistRprt.invitationId);
                res.send(deletedPlaylistRprt);
                return;
            }
        });
    }

};


/**
 *
 * @description
 * finds playlists' _id and name according with 'like' operator on a string.
 *
 * This action will send back on the response an array of objects containing _id and name of playlists.
 *
 * <pre>
 *     [
 *      { _id : '..' , name : '...'},
 *      ...
 *     ]
 * </pre>
 *
 * These _id and name values belong to playlists that user did before
 *
 *
 * @param {object} req - contains 'like' string
 * @param {object} res
 */


exports.findPlaylistRprtPlaylistsByName = function (req, res) {
    var like = req.param('like');
    var playlistRprtType = req.param('playlistRprtType');
    like = new RegExp(like, 'i');
    var agg = [{
        $match: {
            'data.name': like,
            'data.inviter': req.sessionUser._id.toString()
        }
    }, {
        $group: {
            _id: '$data.playlistId',
            'name': {'$addToSet': '$data.name'}
        }
    }, {
        $unwind: '$name'
    }, {
        $limit: 5
    }];

    var Model = PlaylistRprt;
    if (playlistRprtType === 'class') {
        Model = ClassPlaylistRprt;
    }
    Model.aggregate(agg, function (err, cursor) {
        cursor.toArray(function(err, result) {
            if (!!err) {
                new managers.error.InternalServerError(err, 'error while searching playlistRprts playlists').send(res);
                return;
            }
            res.send(result);
        });
    });

};

//todo we can remove this function and direct call to findPlaylistRprtPlaylistsByName
exports.findStudentPlaylistRprtPlaylistsByName = function (req, res) {
    exports.findPlaylistRprtPlaylistsByName(req, res);
};



