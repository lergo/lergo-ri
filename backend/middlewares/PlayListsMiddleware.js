'use strict';

/**
 * @module playListsMiddleware
 * @type {PlayList|exports}
 */

var PlayList = require('../models/PlayList');
var logger = require('log4js').getLogger('PlayListsMiddleware');
var permissions = require('../permissions');

/**

 includes middlewares regarding playLists

**/


/**
 * checks if playList exists
 * @param req
 * @param res
 * @param next
 */
exports.exists= function exists( req, res, next ){
    logger.debug('checking if playList exists : ' , req.params.playListId );
    try {
        PlayList.findById(req.params.playListId, function (err, result) {
            if (!!err) {
                res.status(500).send(err);
                return;
            }
            if (!result) {
                res.status(404).send('playList not found');
                return;
            }

            logger.debug('putting playList on request', result);
            req.playList = result;

            next();

        });
    }catch(e){
        res.status(404).send('playList not found after exception');
    }
};


/**
 * Whether user can edit the playList or not
 *
 * assumes request contains
 *
 * user - the user on the request
 * playList - the playList we are editting
 */
exports.userCanEdit = function userCanEdit( req, res, next  ){
    logger.debug('checking if user can edit playList');
    return permissions.playLists.userCanEdit( req.sessionUser , req.playList ) ? next() : res.status(400).send('');
};


exports.userCanPublish = function userCanPublish( req, res, next  ){
    logger.debug('checking if user can publish playList');
    return permissions.playLists.userCanPublish( req.sessionUser , req.playList ) ? next() : res.status(400).send('');
};


exports.userCanUnpublish = function userCanUnpublish( req, res, next  ){
    logger.debug('checking if user can unpublish playList');
    return permissions.playLists.userCanUnpublish( req.sessionUser , req.playList ) ? next() : res.status(400).send('');
};

exports.userCanDelete = function userCanDelete(req, res, next){
    return permissions.playLists.userCanDelete( req.sessionUser , req.playList ) ? next() : res.status(400).send('');
};

exports.userCanCopy = function userCanCopy(req, res, next){
    return permissions.playLists.userCanCopy( req.sessionUser, req.playList ) ? next() : res.status(400).send('');
};

/*
Whether this user can see private playLists
 */
exports.userCanSeePrivatePlayLists = function userCanSeePrivatePlayLists( req, res, next){
    logger.debug('checking if user can see private playLists');
    if ( !permissions.playLists.userCanSeePrivatePlayLists(req.sessionUser) ){
        res.status(400).send('');
        return;
    }
    next();
};
