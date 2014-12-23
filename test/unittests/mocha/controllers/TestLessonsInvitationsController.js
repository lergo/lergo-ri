'use strict';


describe('LessonsInvitationsController', function(){

    var expect = require('expect.js');

    var sinon = require('sinon');
    var _ = require('lodash');

    var logger = require('log4js').getLogger('TestLessonsInvitationsController');

    var LessonsInvitationsController;

    before(function(){
        this.timeout(10000);
        logger.info('initializing all');
        require('../../../mocks/index');

        LessonsInvitationsController = require('../../../../backend/controllers/LessonsInvitationsController');
    });


    describe('#update', function(){

        describe('changes on data', function(){


            before(function () {
                var LessonInvitation = require('../../../../backend/models/LessonInvitation');
                sinon.stub(LessonInvitation.prototype, 'update', function () {
                    logger.info('updating lesson invitation');
                });
            });

            after(function () {
                var LessonInvitation = require('../../../../backend/models/LessonInvitation');
                LessonInvitation.prototype.update.restore();
            });

            it('should not change lesson and quizItems', function () {

                var inviteFromDB = {
                    'lesson': 'this is db lesson',
                    'quizItems' : 'this is db quiz items'
                };

                var updatedInvite = {
                    'lesson': 'this is modified lesson',
                    'quizItems' : 'this is modified quizItems'
                };

                var myRequest = { 'body': updatedInvite, 'invitation': inviteFromDB };

                LessonsInvitationsController.update(myRequest, {});
                expect(myRequest.body.lesson).to.be(myRequest.invitation.lesson);
                expect(myRequest.body.quizItems).to.be(myRequest.invitation.quizItems);

            });

            it('should wrap _id inviter and lessonId with db ID', function(){
                var myRequest = { 'body' : { '_id' : '_id' , 'inviter' : 'inviter' , 'lessonId' : 'lessonId'}, 'invitation' : {} };
                var myOriginalRequest = _.merge({}, myRequest);
                LessonsInvitationsController.update( myRequest, {});


                expect(myRequest.body._id.value).to.be(myOriginalRequest.body._id);
                expect(myRequest.body.inviter.value).to.be(myOriginalRequest.body.inviter);
                expect(myRequest.body.lessonId.value).to.be(myOriginalRequest.body.lessonId);

            });


        });

        describe('handling callback invocations', function(){




            it('should send error on response', function(){
                var LessonInvitation = require('../../../../backend/models/LessonInvitation');
                sinon.stub(LessonInvitation.prototype, 'update', function ( _callback ) {
                    _callback('this is error');
                });
                var response = { 'status' : sinon.spy(function(){ return this; }), 'send' : sinon.spy() };
                var ErrorManager = require('../../../../backend/managers/ErrorManager');
                ErrorManager.InternalServerError = sinon.spy(ErrorManager,'InternalServerError');


                LessonsInvitationsController.update({ 'body' : { '_id' : '_id' , 'inviter' : 'inviter' , 'lessonId' : 'lessonId'}, 'invitation' : {} }, response);

                expect(ErrorManager.InternalServerError.called).to.be(true);

                ErrorManager.InternalServerError.restore();
                LessonInvitation.prototype.update.restore();
            });


            it('should send the invitation on response', function(){
                var LessonInvitation = require('../../../../backend/models/LessonInvitation');
                sinon.stub(LessonInvitation.prototype, 'update', function ( _callback ) {
                    _callback(null);
                });
                var response = { 'send' : sinon.spy(function(){ logger.info('send called with ', arguments);}) };

                LessonsInvitationsController.update({ 'body' : {}, 'invitation' : {} }, response);

                expect(response.send.calledWith({})).to.be(true);
            });
        });
    });

});