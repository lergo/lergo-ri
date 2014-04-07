'use strict';
var assert = require('assert');
var appContext = require('../backend/ApplicationContext');
var logger = appContext.logManager.getLogger('TestQuestionsManager');
var questionsManager = appContext.questionsManager;
var dbManager = appContext.dbManager;
var async = require('async');
before(function() {
	logger.info('Test for QuestionsManager started');
	logger.info('Clearing database');

	dbManager.connect('questions', function(db, questions, done) {
		questions.remove();
		done();
	});
});

after(function() {
	logger.info('Test for QuestionsManager completed');
	logger.info('Clearing database');

	dbManager.connect('questions', function(db, questions, done) {
		questions.remove();
		done();
	});
});

describe('QuestionsManager', function() {
	describe('#createQuestion', function() {
		it('should save question in questions collection', function(done) {
			var question = {
				'questionText' : 'Who is president of America',
				'options' : 'Bill Gates , Brack Obama,Louis Philip',
				'correctAnswer' : 'Brack Obama'
			};
			async.waterfall([
				function testCreateQuestion() {
					questionsManager.createQuestion(question, function(done, obj) {
						logger.info('Question [%s] created successfully', obj);
						questionsManager.getQuestionById(obj._id, function(done, question) {
							assert(question);
						});
						done();
					});

				}
			]);
		});
	});
	describe('#updateQuestion', function() {
		it('should update question in questions collection', function(done) {
			var modifiedQuestion = {
				'questionText' : 'Who is president of America',
				'options' : 'Bill Gates ,Brack Obama,Louis Philip',
				'correctAnswer' : 'Bill Gates'
			};
			var id;

			async.waterfall([
				function testUpdateQuestion() {
					questionsManager.getQuestions(function(done, returnObject) {
						assert(returnObject);
						assert.equal(returnObject.length, 1);
						id = returnObject[0]._id;
					});

					questionsManager.updateQuestion(modifiedQuestion, id, function(done, updatedObject) {
						logger.info('Question [%s] updated successfully', updatedObject);
						assert(updatedObject);

					});

					questionsManager.getQuestionById(id, function(done, obj) {
						assert(obj);
						assert.equal(obj.correctAnswer, modifiedQuestion.correctAnswer);
					});
					done();
				}
			]);
		});

	});
	describe('#deleteQuestion', function() {
		it('should delete question in questions collection', function(done) {
			var newQuestion = {
				'questionText' : 'Who is Newton ?',
				'options' : 'Scientist ,Cricketer,Politician',
				'correctAnswer' : 'Scientist'
			};
			var id;

			async.waterfall([
				function testDeleteQuestion() {

					questionsManager.createQuestion(newQuestion, function(done, returnObject) {
						assert(returnObject);
						id = returnObject._id
					});

					questionsManager.deleteQuestion(id, function(done, obj) {
						logger.info('Question [%s] deleted successfully', obj);
						assert(obj);

					});

					questionsManager.getQuestionById(function(id, done, returnObject) {
						assert(!returnObject);
					});
					done();
				}
			]);
		});

	});

});
