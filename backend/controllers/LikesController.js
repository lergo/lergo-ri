'use strict';
var models= require('../models');
var managers = require('../managers');


exports.createLessonLikes = function( req, res ){
    var like = models.Like.createNew(req.user._id);
    models.Like.connect(function(db, collection){
        collection.insert( like, function(err, result){
            if ( !!err || !result ){
                new managers.error.InternalServerError(err, 'unable to save like').send(res);
            }
            res.send(like);
        });
    });
};

exports.getLike = function( req, res ){
    res.send(res.like);
};