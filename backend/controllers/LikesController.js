'use strict';
var models= require('../models');
var managers = require('../managers');


exports.createLike = function( req, res ){
    var like = models.Like.createNewFromRequest(req);
    models.Like.connect(function(db, collection){
        collection.insert( like, function(err, result){
            if ( !!err || !result ){
                new managers.error.InternalServerError(err, 'unable to save like').send(res);
            }
            res.send(like);
        });
    });
};


exports.countLikes = function(req, res ){
    var itemId = req.itemId;
    models.Like.connect(function (collection) {
        collection.count({ 'itemId': itemId }, function (err, result) {
            if (!!err) {
                new managers.error.InternalServerError(err, 'unable to count likes').send(res);
            }
            res.send(result);
        });
    });
    res.send(404, 'not implemented yet');
};

exports.getLike = function( req, res ){
    res.send(res.like);
};