'use strict';

var managers = require('../managers');
var logger = require('log4js').getLogger('ClassPlaylistRprtsController');

/**
 *
 * gets class playlistRprts I invited.
 *
 *
 * in this scenario there might not be a userId on the playlistRprt.
 * we go by the data.inviter field which holds the inviter's userId - only users can invite..
 *
 *
 * @param req - the request
 * @param res - the response
 */
exports.getUserClassPlaylistRprts = function (req, res) {
    if (!req.queryObj || !req.queryObj.filter) {
        res.status(500).send('no filter or query object available');
        return;
    }

    req.queryObj.filter['data.inviter'] = req.sessionUser._id.toString();

    managers.classPlaylistRprts.complexSearch(req.queryObj, function (err, obj) {
        if (!!err) {
            err.send(res);
        } else {
            res.send(obj);
        }
    });
};

exports.deleteClassPlaylistRprt = function (req, res) {
        managers.playlistRprts.deleteClassPlaylistRprt(req.playlistRprt._id, function (err, deletedPlaylistRprt) {
            if (!!err) {
                logger.error('error deleting playlistRprt', err);
                err.send(res);
                return;
            } else {
                logger.info('class playlistRprt deleted');
                res.send(deletedPlaylistRprt);
                return;
            }
        });  
};

exports.readPlaylistRprtById = function (req, res) {
    res.send(req.playlistRprt);
};

