'use strict';


/**
 * @name PlaylistRprtssManager
 * @class
 *
 */
/**
 * @name managers
 * @module
 */
/**
 *
 * @type {exports.PlaylistRprts|*}
 */

var PlaylistRprts = require('../models').PlaylistRprt;
var ClassPlaylistRprts = require('../models').ClassPlaylistRprts;
var services = require('../services');
var _ = require('lodash');
var logger = require('log4js').getLogger('PlaylistRprtssManager');
var ObjectId = require('mongodb').ObjectId;


function makeAllStudentPlaylistRprtsLink(emailResources, playlistRprts) {
    var lergoLanguage = 'he';
    if (playlistRprts.data.data.playlist.language !== 'hebrew') {
        lergoLanguage = 'en';
    }

    /*var _playlistId = services.db.id(playlistRprts.data.playlistId);*/
    var _playlistId = new ObjectId(playlistRprts.data.data.playlistId);

    var _className = playlistRprts.data.className.split(' ').join('%20');
    var _name = playlistRprts.data.data.playlist.name.split(' ').join('%20');
    return emailResources.lergoBaseUrl + '/#!/user/create/playlistRprtss?playlistRprtsType=students&lergoFilter.playlistRprtsClass=' + '"' + _className + '"' + '&lergoFilter.playlistRprtsPlaylist={"_id":"' + _playlistId + '"' +',' +  '"name":"' + _name  + '"}&lergoLanguage=' + lergoLanguage + '&lergoFilter.filterLanguage="' + playlistRprts.data.data.playlist.language + '"';
}

function makeStudentPlaylistRprtsLink(emailResources, playlistRprts) {
    return emailResources.lergoBaseUrl + '/#!/public/playlists/playlistRprtss/' + playlistRprts.data._id + '/display';
}

function makeClassPlaylistRprtsLink(emailResources, playlistRprts) {
    return emailResources.lergoBaseUrl + '/#!/public/playlists/playlistRprtss/agg/' + playlistRprts.data.classplaylistRprtsId + '/display';
}

exports.prepareClassPlaylistRprtsEmailData = function (collection, playlistRprts) {
    logger.info('new Class PlaylistRprts created');
    collection.find({invitationId: playlistRprts.invitationId}).toArray()
        .then(function(result) {
            var className = result[0].data.invitee.class;
            var classplaylistRprtsId = result[0]._id;
            var invitationId = playlistRprts.invitationId;
            logger.info(`number of finished playlistRprtss for ${className} is ${result[0].count}`);
            exports.findPlaylistRprtsByInvitationId(invitationId, classplaylistRprtsId, className);
    });
};

exports.findPlaylistRprtsByInvitationId = function(invitationId, classplaylistRprtsId, className,  res) {
    PlaylistRprts.connect(function (db, collection) {
        try {
            logger.info('finding PlaylistRprts from invitationId');
            collection.findOne({invitationId: invitationId})
                .then(function (playlistRprts) {
                    return playlistRprts;
                }).then(function(playlistRprts) {
                playlistRprts.classplaylistRprtsId = classplaylistRprtsId;
                playlistRprts.className = className;

                var req = {};
                req.emailResources = playlistRprts.emailResources;
                req.playlistRprts = playlistRprts;

                exports.sendPlaylistRprtsReadyForClass(req, res);
            });
        } catch (e) {
            logger.error('unable to find playlistRprts', e);
        }

    });
};

exports.sendPlaylistRprtsReadyForClass = function (req, res) {
    exports.sendPlaylistRprtsLinkForClass(req.emailResources, new PlaylistRprts(req.playlistRprts), function (err) {
        if (!!err) {
            err.send(res);
            return;
        }
    });
};

exports.sendPlaylistRprtsLinkForClass = function (emailResources, playlistRprts, callback) {
    logger.info('send classPlaylistRprts is ready email');


    if (playlistRprts.isAnonymous()) {
        callback();
        return;
    }

    if (playlistRprts.isSent()) {
        callback(null);
        return;
    }

    playlistRprts.getSendTo(function (err, inviter) {
        if (!!err) {
            callback(err);
            return;
        }
        var emailVars = {};
        _.merge(emailVars, emailResources);
        var classPlaylistRprtsLink = makeClassPlaylistRprtsLink(emailResources, playlistRprts);
        var studentPlaylistRprtsLink = makeStudentPlaylistRprtsLink(emailResources, playlistRprts);
        var allStudentPlaylistRprtssLink = makeAllStudentPlaylistRprtsLink (emailResources, playlistRprts);
        _.merge(emailVars, {
                'classPlaylistRprtsLink': classPlaylistRprtsLink,
                'studentPlaylistRprtsLink': studentPlaylistRprtsLink,
                'allStudentPlaylistRprtss': allStudentPlaylistRprtssLink,
                'name': inviter.username,
                'className': playlistRprts.data.className,
                'playlistId': playlistRprts.data.data.playlistId,
                'inviteeName': playlistRprts.getName(),
                'playlistTitle': playlistRprts.data.data.playlist.name,
                'playlistLanguage':playlistRprts.data.data.playlist.language
        });
        var html = services.emailTemplateStrings.classPlaylistRprtsMarkup(emailVars);
        var text = services.emailTemplateStrings.classPlaylistRprtsText(emailVars);
        var subject = services.emailTemplateStrings.languageMarkup(emailVars);

        services.email.sendMail({
            'to': inviter.email,
            'subject': subject,
            'text': text,
            'html': html
        }, function (err) {
            if (!!err) {
                logger.error('error while sending classplaylistRprts', err);
                callback(err);
            } else {
                logger.info('saving  playlistRprts sent true');
                playlistRprts.setSent(true);
                playlistRprts.update();
                callback();
            }
        });
    });
};


exports.sendPlaylistRprtsLink = function (emailResources, playlistRprts, callback) {
    logger.info('send playlistRprts is ready email');


    if (playlistRprts.isAnonymous()) {
        callback();
        return;
    }

    if (playlistRprts.isSent()) {
        callback(null);
        return;
    }

    playlistRprts.getSendTo(function (err, inviter) {
        if (!!err) {
            callback(err);
            return;
        }

        var emailVars = {};
        _.merge(emailVars, emailResources);
        var playlistInviteLink = emailResources.lergoBaseUrl + '/#!/public/playlists/playlistRprtss/' + playlistRprts.data._id + '/display';

        _.merge(emailVars, { 'link': playlistInviteLink, 'name': inviter.username, 'inviteeName': playlistRprts.getName(), 'playlistTitle': playlistRprts.data.data.playlist.name, 'playlistLanguage':playlistRprts.data.data.playlist.language });

        services.emailTemplates.renderPlaylistRprtsReady(emailVars, function (err, html, text) {
            var subject = 'Someone finished their playlist';
            if (emailVars.playlistLanguage) {
                if (emailVars.playlistLanguage === 'hebrew') {
                    subject = 'מישהו סיים את השיעור';
                } else {
                    subject = 'Someone finished their playlist';
                }
            }
            services.email.sendMail({
                'to': inviter.email,
                'subject': subject,
                'text': text,
                'html': html
            }, function (err) {
                if (!!err) {
                    logger.error('error while sending playlistRprts', err);
                    callback(err);
                } else {
                    logger.info('saving playlistRprts sent true');
                    playlistRprts.setSent(true);
                    playlistRprts.update();
                    callback();
                }
            });
        });

    });

};

exports.getUserPlaylistRprtss = function(userId, callback) {
    userId = services.db.id(userId);
	PlaylistRprts.find({ $or :  [ { 'userId' : userId }, { 'userId' : userId.toString()}, { 'data.inviter' : userId} , { 'data.inviter' : userId.toString()} ]},{},callback);
};

exports.deletePlaylistRprts = function(id, callback) {
	PlaylistRprts.connect(function(db, collection) {
		collection.deleteOne({
			'_id' : services.db.id(id)
		}, function(err) {
			if (!!err) {
				logger.error('unable to delete playlistRprts [%s]', err.message);
			}
			callback(err);
		});
	});
};

exports.deleteClassPlaylistRprts = function(id, callback) {
    logger.debug('preparing to delete class playlistRprts');
	ClassPlaylistRprts.connect(function(db, collection) {
		collection.deleteOne({
			'_id' : services.db.id(id)
		}, function(err) {
			if (!!err) {
				logger.error('unable to delete playlistRprts [%s]', err.message);
			}
			callback(err);
		});
	});
};


/**
 * @callback PlaylistRprtssManager~PlaylistRprtssManagerComplexSearchCallback
 * @param {error} err
 * @param {Array<PlaylistInvitation>} result
 */

/**
 *
 * @param {ComplexSearchQuery} queryObj
 * @param {PlaylistRprtssManager~PlaylistRprtssManagerComplexSearchCallback} callback
 */
exports.complexSearch = function( queryObj, callback ){

    // change some keys around for playlistRprts.
    if ( !!queryObj.filter ){
        if ( !!queryObj.filter.language ){
            queryObj.filter['data.playlist.language'] = queryObj.filter.language;
            delete queryObj.filter.language;
        }

        if ( !!queryObj.filter.subject){
            queryObj.filter['data.playlist.subject'] = queryObj.filter.subject;
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

    PlaylistRprts.connect( function( db, collection ){
        services.complexSearch.complexSearch( queryObj, { collection : collection }, function(err, playlistRprtss){
            if (!!err){
                callback(err);
            }else{ // merge results with invitation ID
                var playlistInvitationIds = _.map(playlistRprtss.data, 'invitationId');
                var PlaylistInvitation = require('../models').PlaylistInvitation;
                PlaylistInvitation.find({_id:{$in:playlistInvitationIds}},{},function(err,arrResult){
                    if(!!err){
                        callback(err);
                    }else{
                        var invitationById = _.keyBy(arrResult,'_id');
                        _.map(playlistRprtss.data, function(r){ // first data is from complex search
                            _.merge(r.data, invitationById[r.invitationId]); // second data is on playlistRprts.
                        });
                        callback(null, playlistRprtss);
                    }
                });
            }
        });
    });
};

