var managers = require('../managers');

var _ = require('lodash');
var logger = require('log4js').getLogger('LessonsInvitationsController');

function findLesson(req, res, next) {

    var lessonId = req.params.lessonId;
    logger.info('finding lesson', JSON.stringify(lessonId));
    managers.lessons.getLesson({ '_id': managers.db.id(lessonId)    , 'userId': req.user._id }, function (err, result) {
        if (!!err) {
            logger.error('unable to findLesson', err);
            err.send(res);
            return;
        } else {
            logger.info('putting lesson on request', result);
            req.lesson = result;
            next();
        }
    });
}


exports.create = function (req, res) {
    findLesson(req, res, function () {
        logger.info('creating invitation for lesson', req.lesson);
        var invitation = req.body;

        if ( !invitation.invitee || !invitation.invitee.email ){
            new managers.error.InternalServerError(null, 'missing invitee').send(res);
            return;
        }
        var invitationObj = _.merge({'lessonId': req.lesson._id}, invitation );


        if (!!req.user) {  // add inviter in case we have details
            invitationObj.inviter = req.user._id;
        }
        managers.lessonsInvitations.create(req.emailResources, invitationObj, function (err, result) {
            if (!!err) {
                logger.error('unable to create lesson invitation', err);
                err.send(res);
                return;
            } else {
                res.send(result);
            }
        });
    });
};

exports.report = function( req, res ){
    managers.lessonsInvitations.updateReport( req.params.invitationId, req.body , function(err, result){
        if ( !!err ){
            err.send(res);
            return;
        }else{
            res.send(result);
        }
    });
};


exports.list = function (req, res) {
    findLesson( req, res, function(){
        managers.lessonsInvitations.find({ 'lessonId': req.lesson._id }, function( err, result){
            if ( !!err ){
                logger.error('unable to find invitations',err );
                err.send(res);
                return;
            }else{
                res.send(result);
            }
        });
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
exports.build = function( req, res ){
    var id = req.params.id;
    var construct = req.query.construct;
    var constructForce = req.query.constructForce;

    logger.info('building the invitation', id, construct, constructForce );
    managers.lessonsInvitations.find({'_id' : managers.db.id(id)}, {},  function ( err, result){
        if ( !!err ){
            err.send(res);
            return;
        }
        if ( !!constructForce || !res.lesson && construct ){
            logger.info('constructing invitation');
            managers.lessonsInvitations.buildLesson( result, function( err, constructed ){
                res.send(constructed);
            });
        }else{
            res.send(result);
        }

    });
};
