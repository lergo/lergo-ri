'use strict';

/**
 * @module LesosnsMiddleware
 * @type {Playlist|exports}
 */

var Playlist = require('../models/Playlist');
var logger = require('log4js').getLogger('PlaylistsMiddleware');
var permissions = require('../permissions');

/**

 includes middlewares regarding playlists

**/


/**
 * checks if playlist exists
 * @param req
 * @param res
 * @param next
 */
exports.exists= function exists( req, res, next ){
    logger.debug('checking if playlist exists : ' , req.params.playlistId );
    try {
        Playlist.findById(req.params.playlistId, function (err, result) {
            if (!!err) {
                res.status(500).send(err);
                return;
            }
            if (!result) {
                res.status(404).send('playlist not found');
                return;
            }

            logger.debug('putting playlist on request', result);
            req.playlist = result;

            next();

        });
    }catch(e){
        res.status(404).send('playlist not found after exception');
    }
};


/**
 * Whether user can edit the playlist or not
 *
 * assumes request contains
 *
 * user - the user on the request
 * playlist - the playlist we are editting
 */
exports.userCanEdit = function userCanEdit( req, res, next  ){
    logger.debug('checking if user can edit playlist');
    return permissions.playlists.userCanEdit( req.sessionUser , req.playlist ) ? next() : res.status(400).send('');
};


exports.userCanPublish = function userCanPublish( req, res, next  ){
    logger.debug('checking if user can publish playlist');
    return permissions.playlists.userCanPublish( req.sessionUser , req.playlist ) ? next() : res.status(400).send('');
};


exports.userCanUnpublish = function userCanUnpublish( req, res, next  ){
    logger.debug('checking if user can unpublish playlist');
    return permissions.playlists.userCanUnpublish( req.sessionUser , req.playlist ) ? next() : res.status(400).send('');
};

exports.userCanDelete = function userCanDelete(req, res, next){
    return permissions.playlists.userCanDelete( req.sessionUser , req.playlist ) ? next() : res.status(400).send('');
};

exports.userCanCopy = function userCanCopy(req, res, next){
    return permissions.playlists.userCanCopy( req.sessionUser, req.playlist ) ? next() : res.status(400).send('');
};

/*
Whether this user can see private playlists
 */
exports.userCanSeePrivatePlaylists = function userCanSeePrivatePlaylists( req, res, next){
    logger.debug('checking if user can see private playlists');
    // if ( !permissions.playlists.userCanSeePrivatePlaylists(req.sessionUser) ){
    //     res.status(400).send('');
    //     return;
    // }
    next();
};
