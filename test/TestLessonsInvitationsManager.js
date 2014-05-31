var testUtils = require('./testUtils');
var async = require('async');
var _ = require('lodash');

var logger = require('log4js').getLogger('TestLessonsInvitationsManager');
var conf = require('../backend/services/Conf');
var testConf = conf.tests.TestLessonsInvitationsManager;
var lessonsInvitationsManager = require('../backend/managers/LessonsInvitationsManager');
var dbManager = require('../backend/managers/DbManager');

async.waterfall([
    function(callback){
        testUtils.initializeEmailTemplateService(callback);
    },
    function getLesson(_callback){
        dbManager.connect('lessons', function(db, collection, done){
            collection.find({},{}).toArray( function( err, result ){
                done();
                logger.info( result);
                _callback(  err, result );
            })
        });
    },
    function createLessonInvitation( lessons, callback ){
        logger.info('creating invitation');
        var invitation = _.merge( { lessonId : lessons[0]._id }, testConf.invitation ) ;
        lessonsInvitationsManager.create( conf.emailResources,  invitation, callback );
    }, function( _callback ){
        logger.info(arguments);
        dbManager.connect('lessonsInvitations', function(db, collection, done){
            collection.find({},{}).toArray( function( err, result ){
                done();
                _callback(err, result);
            })
        });
    }, function( invitations, _callback ){
           var invite = invitations[0];
        logger.info('building', invite);
        lessonsInvitationsManager.buildLesson( invite , _callback);
    }, function( builtLesson, _callback ){
        logger.info('built lesson', builtLesson );
    }
]);




