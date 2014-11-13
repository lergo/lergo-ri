'use strict';

require('../../mocks');

var expect = require('expect.js');

var logger = require('log4js').getLogger('testLessonManager');

var LessonsManager = require('../../../backend/managers/LessonsManager');

describe('LessonsManager', function(){

    describe('#copyLesson()', function(){

        var differentUserCopy = null;
        var sameUserCopy = null;

        LessonsManager.copyLesson( { '_id' : 'user' }, { '_id' : 'originalLesson', 'name' : 'lesson title','userId' : 'someoneElse' }, function( error, copy){
            differentUserCopy = copy;
        });

        LessonsManager.copyLesson( { '_id' : 'user' }, { '_id' : 'originalLesson', 'name' : 'lesson title','userId' : 'user' }, function( error, copy){
            sameUserCopy = copy;
        });

        it('should create a copy', function(done){
            logger.info('this is different user copy', differentUserCopy) ;
            expect(differentUserCopy !== null).to.be(true);
            done();
        });

        it('should append "copy of" to lesson name', function(){
            expect(differentUserCopy.name.indexOf('Copy of') === 0).to.be(true);
        });


        // same user - meaning the user who created the lesson, and the user who copied the lesson.
        it('should  not put "copy of" property when same user', function(){
            expect(sameUserCopy.copyOf).to.be(undefined);
        });


        it('should put "copy of" property when not same user', function(){
            expect(differentUserCopy.copyOf.length).to.be(1);
            expect(differentUserCopy.copyOf[0]).to.be('originalLesson');
        });


    });

});




