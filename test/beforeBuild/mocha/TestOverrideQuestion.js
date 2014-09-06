'use strict';
var models = require('../../../backend/models');
var logger = require('log4js').getLogger('TestOverrideQuestion');
var actions = require('../../../backend/ApiActions');
var expect = require('expect.js');
logger.info('loaded services');
var _ = require('lodash');



describe('OverrideQuestion', function () {

    it('action overrideQuestion should exist on lesson action', function () {
        expect(typeof(actions.lessonsActions.overrideQuestion)).to.be('object');
    });

    it('function replaceQuestionInLesson should exist on model Lesson prototype ', function () {
        expect(typeof(models.Lesson.prototype.replaceQuestionInLesson)).to.be('function');
    });

    it('function replaceQuestionInLesson should exist on an instance of lesson', function () {
        expect(typeof(new models.Lesson({}).replaceQuestionInLesson)).to.be('function');
    });

    describe('replaceQUestionInLesson', function () {

        function replaceQuestion(lessonMock) {
            var lessonObj = new models.Lesson(lessonMock);
            lessonObj.replaceQuestionInLesson('125', '126');
            return lessonMock;
        }

        function assertStepIndex(lesson, stepIndex, itemIndexList) {
            var quizItems = lesson.steps[stepIndex].quizItems;

            expect(quizItems.indexOf('125')).to.be.lessThan(0);

            _.each(itemIndexList, function (index) {
                expect(quizItems[index]).to.be('126');
            });
        }

        it('should do nothing when there are no steps', function () {
            replaceQuestion({});
        });

        it('should do nothing when steps array is empty', function () {
            replaceQuestion({ 'steps': [] });
        });

        it('should do nothing when there are steps of other type', function () {
            replaceQuestion({ 'steps': [
                { 'type': 'video'}
            ] });
        });

        it('should do nothing when there are steps with type quiz but no quizItems property', function () {
            replaceQuestion({'steps': [
                {'type': 'video'},
                {'type': 'quiz'}
            ]});
        });

        it('should do nothing when quizItems is empty', function () {
            replaceQuestion({'steps': [
                {'type': 'video'},
                {'type': 'quiz', 'quizItems': []}
            ]});
        });

        it('should do nothing if oldQuestionId is not in quizItems', function () {
            var questionIds = ['123', '124'];
            var lesson = {'steps': [
                {'type': 'video'},
                {'type': 'quiz', 'quizItems': questionIds}
            ]};
            replaceQuestion(lesson);
            expect(lesson.steps[1].quizItems[0]).to.be('123');
        });

        // this actually tests if the function does what it should do
        it('should replace old question id with new question id', function () {
            var questionIds = ['123', '124', '125'];
            var lesson = replaceQuestion({'steps': [
                {'type': 'video'},
                {'type': 'quiz', 'quizItems': questionIds}
            ]});

            assertStepIndex(lesson, 1, [2]);

        });

        it('should do the same with multiple steps', function () {
            var questionIds = ['123', '124', '125'];
            var lesson = replaceQuestion({'steps': [
                {'type': 'video'},
                {'type': 'quiz', 'quizItems': questionIds},
                {'type': 'quiz', 'quizItems': questionIds}
            ]});

            assertStepIndex(lesson, 1, [2]);
            assertStepIndex(lesson, 2, [2]);

        });

        it('should do the same with multiple instances of question in step', function () {
            var questionIds = ['125', '123', '125', '124', '125'];
            var lesson = replaceQuestion({'steps': [
                {'type': 'video'},
                {'type': 'quiz', 'quizItems': questionIds},
                {'type': 'quiz', 'quizItems': questionIds}
            ]});

            assertStepIndex(lesson, 1, [0, 2, 4]);
            assertStepIndex(lesson, 2, [0, 2, 4]);
        });

    });
});