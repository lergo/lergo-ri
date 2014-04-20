'use strict';
var appContext = require('../ApplicationContext');
var logger = appContext.logManager.getLogger('QuestionsManager');
var dbManager = appContext.dbManager;
var errorManager = appContext.errorManager;

exports.createQuestion = function(question, callback) {
	logger.info('Creating question');

	dbManager.connect('questions', function(db, collection, done) {
		collection.insert(question, function(err) {
			if (!!err) {
				logger.error('error creating question [%s] : [%s]', question.questionText, err);
				callback(new errorManager.InternalServerError());
				done();
				return;
			} else {
				logger.info('Question [%s] created successfully. invoking callback', question.questionText);
				callback(null, question);
				done();
				return;
			}
		});
	});
};

exports.updateQuestion = function(question, id, callback) {
	logger.info('Updating question');

    question._id = dbManager.id(id);

	dbManager.connect('questions', function(db, collection, done) {
		collection.save( question, function(err) {
			if (!!err) {
				logger.error('error in updating question [%s] : [%s]', question.questionText, err);
				callback(new errorManager.InternalServerError());
				done();
				return;
			} else {
				logger.info('Question [%s] updated successfully. invoking callback', question.questionText);
				callback(null, question);
				done();
				return;
			}
		});
	});
};

exports.deleteQuestion = function(id, callback) {
	logger.info('Creating question');
	dbManager.connect('questions', function(db, collection, done) {
		collection.remove({
			'_id' : dbManager.id(id)
		}, function(err) {
			if (!!err) {
				logger.error('unable to query for user [%s]', err.message);
			}
			done();
			callback(err);
		});
	});
};

exports.getQuestionById = function(id, callback) {
	logger.info('Creating question');
	dbManager.connect('questions', function(db, collection, done) {
		collection.findOne({
			'_id' : dbManager.id(id)
		}, function(err, result) {
			if (!!err) {
				logger.error('unable to query for question [%s]', err.message);
			}
			done();
			callback(err, result);
		});
	});
};

exports.getQuestions = function(callback) {
	logger.info('Getting question');
	dbManager.connect('questions', function(db, collection, done) {
		collection.find().toArray(function(err, result) {
			if (!!err) {
				logger.error('unable to query for questions [%s]', err.message);
			}
			done();
			callback(err, result);
		});
	});
};