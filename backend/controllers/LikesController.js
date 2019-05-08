'use strict';
var models= require('../models');
var managers = require('../managers');
var logger = require('log4js').getLogger('LikesController');


exports.createLike = function( req, res ){
    var like = models.Like.createNewFromRequest(req);
    models.Like.connect(function(db, collection){
        collection.insertOne( like, function(err, result){
            if ( !!err || !result ){
                new managers.error.InternalServerError(err, 'unable to save like').send(res);
            }
            res.send(like);
        });
    });
};


exports.countLikes = function(req, res ){
    var itemId = req.likeItem._id;
    logger.debug('counting likes on ', itemId, typeof(itemId));
    models.Like.connect(function (db, collection) {
        collection.countDocuments({ 'itemId': itemId }, function (err, result) {
            logger.debug('got count result',err,result);
            if (!!err) {
                new managers.error.InternalServerError(err, 'unable to count likes').send(res);
            }
            res.send( { 'count' : result });
        });
    });
};

exports.deleteLike = function (req, res) {
    logger.debug('deleting like');
    models.Like.connect(function (db, collection) {
        logger.debug('removing like');
        collection.remove(req.like, function (err, result) {
            logger.debug('after remove like, err and result are', err, result);
            if (!!err) {
                new managers.error.InternalServerError(err, 'unable to delete like').send(res);
                return;
            }
            res.send(200);
        });
    });
};

exports.getLike = function( req, res ){
    res.send(req.like);
};