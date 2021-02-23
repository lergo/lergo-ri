'use strict';
var models= require('../models');
var managers = require('../managers');
var logger = require('log4js').getLogger('CompletesController');
 

exports.createComplete = function( req, res ){
    var now = new Date();
    var twoYearsDays = 2 * 365;
    var willExpireOn = now.setDate(now.getDate() + twoYearsDays);
    var complete = models.Complete.createNewFromRequest(req);
    complete.willExpireOn = new Date(willExpireOn);
    models.Complete.connect(function(db, collection){
        collection.insertOne( complete, function(err, result){
            if ( !!err || !result ){
                new managers.error.InternalServerError(err, 'unable to save complete').send(res);
            }
            res.send(complete);
        });
    });
};


exports.countCompletes = function(req, res ){
    var itemId = req.completeItem._id;
    logger.debug('counting completes on ', itemId, typeof(itemId));
    models.Complete.connect(function (db, collection) {
        collection.countDocuments({ 'itemId': itemId }, function (err, result) {
            logger.debug('got count result',err,result);
            if (!!err) {
                new managers.error.InternalServerError(err, 'unable to count completes').send(res);
            }
            res.send( { 'count' : result });
        });
    });
};

exports.deleteComplete = function (req, res) {
    logger.debug('deleting complete');
    models.Complete.connect(function (db, collection) {
        logger.debug('removing complete');
        collection.deleteOne(req.complete, function (err, result) {
            logger.debug('after remove complete, err and result are', err, result);
            if (!!err) {
                new managers.error.InternalServerError(err, 'unable to delete complete').send(res);
                return;
            }
            res.sendStatus(200);
        });
    });
};

exports.getComplete = function( req, res ){
    res.send(req.complete);
};

exports.getUserCompletes = function(req, res) {
	var queryObj = req.queryObj;
	queryObj.filter.userId = req.sessionUser._id;
	managers.completes.complexSearch(queryObj, function(err, obj) {
		if (!!err) {
			err.send(res);
			return;
		} else {
			res.send(obj);
			return;
		}
	});
};