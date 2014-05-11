var managers = require('../managers');

var logger = require('log4js').getLogger('LessonsInvitationsController');

function findLesson(req, res, next) {
    var lessonId = req.params.lessonId;
    managers.lessons.getLesson({ '_id': lessonId, 'userId': req.user._id }, function (err, result) {
        if (!!err) {
            logger.error('unable to findLesson', err);
            err.send(res);
            return;
        } else {
            req.lesson = result;
            next();
        }
    });
}

exports.create = function (req, res) {
    findLesson( req, res, function(){
        var invitation = req.body;
        managers.lessonsInvitations.create({'lessonId' : req.lesson._id, 'details' : invitation }, function( err, result){
            if ( !!err ){
                logger.error('unable to create lesson invitation',err);
                err.send(res);
                return;
            }else{
                res.send(result);
            }
        });
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