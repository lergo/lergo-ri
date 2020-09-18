'use strict';

/**
 * @module QuestionsManager
 * @type {Logger}
 */

var logger = require('log4js').getLogger('QuestionsManager');

var errorManager = require('./ErrorManager');
var _ = require('lodash');
var Question = require('../models/Question');
var services = require('../services');

exports.createQuestion = function(question, callback) {
	logger.info('Creating question');

	services.db.connect('questions', function(db, collection, done) {
		collection.insertOne(question, function(err) {
			if (!!err) {
				logger.error('error creating question [%s] : [%s]', question.question, err);
				callback(new errorManager.InternalServerError(err, 'unable to create question'));
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

exports.copyQuestion = function(user, question, callback) {
	logger.info('Copying question');

	var copyOf = [];

    // LERGO-569 - we decided we DO NOT want to remember if the same user..
	if ( ! services.db.id(user._id).equals( services.db.id(question.userId) ) ) {
		copyOf = copyOf.concat(question._id);
	}

	// copy of is a transitive property.
	if (!!question.copyOf) {
		copyOf = copyOf.concat(question.copyOf);
	}

	// use omit and not pick, because there are different types of questions
	question = _.omit(question, [ '_id', 'lastUpdate', 'views' ]);

     var copyOfName = 'Copy of: ';

     if (question.language === 'hebrew') {
     copyOfName = 'העתק של: ';
     } else if (question.language === 'arabic') {
     copyOfName = 'نسخة من: ';
     } else {
     copyOfName = 'Copy of: ';
     }

	question.question = copyOfName + question.question;
	question.userId = user._id;
	question.lastUpdate = new Date().getTime();
	if (copyOf.length > 0) {
		question.copyOf = copyOf;
	}

	services.db.connect('questions', function(db, collection) {
		collection.insertOne(question, function(err) {
			if (!!err) {
				logger.error('error copying question [%s] : [%s]', question.question, err);
				callback(new errorManager.InternalServerError(err, 'unable to copy question'));
				return;
			} else {
				logger.info('question copied successfully');
				callback(null, question);
				return;
			}
		});
	});
};

/**
 * finds question by user and updates the question.
 *
 * @param question
 * @param callback
 */
exports.updateQuestion = function(question, callback) {
	//logger.info('Updating question');

	services.db.connect('questions', function(db, collection, done) {

		// prevent malicious users from making a fraud request to update someone
		// else's question
		// find the user by using both the userId and questionId.
		collection.updateOne({
			'_id' : question._id
		}, {$set: question}, function(err) {
			if (!!err) {
				logger.error('error in updating question [%s] : [%s]', question.question, err);
				callback(new errorManager.InternalServerError());
				done();
				return;
			} else {
				//logger.info('Question [%s] updated successfully. invoking callback', question.question);
				callback(null, question);
				done();
				return;
			}
		});
	});
};

exports.deleteQuestion = function(id, callback) {
	logger.info('Deleting question');
	Question.connect(function(db, collection) {
		collection.deleteOne({
			'_id' : services.db.id(id)
		}, function(err) {
			if (!!err) {
				logger.error('unable to delete question [%s]', err.message);
			}
			callback(err);
		});
	});
};

exports.getQuestionById = function(id, callback) {
	console.log('The questionManager is getting a question');
	Question.findById(id, callback);
};

exports.getUserQuestions = function(userId, callback) {
	logger.info('getting user questions');
	services.db.connect('questions', function(db, collection, done) {
		collection.find({
			'userId' : userId
		}).toArray(function(err, result) {
			if (!!err) {
				logger.error('unable to query for questions', err);
			}
			done();
			callback(err, result);
		});
	});
};

exports.search = function(filter, projection, callback) {
	//logger.info('finding questions with filter ', filter, projection);

	services.db.connect('questions', function(db, collection, done) {
		collection.find(filter, projection).toArray(function(err, result) {
			if (!!err) {
				logger.error('unable to search for questions', err);
			}
			done();
			callback(err, result);
		});
	});
};

exports.getQuestions = function(filter, callback) {
	logger.info('Getting question');
	services.db.connect('questions', function(db, collection, done) {
		collection.find(filter).toArray(function(err, result) {
			if (!!err) {
				logger.error('unable to query for questions', err);
			}
			done();
			callback(err, result);
		});
	});
};

exports.getQuestionsById = function(objectIds, callback) {
	objectIds = services.db.id(objectIds);
	Question.find({
		'_id' : {
			'$in' : objectIds
		}
	}, {}, function(err, result) {
		if (!!err) {
			callback(new errorManager.InternalServerError(err, 'unable to find user questions by ids'));
			return;
		} else {
			callback(null, result);
			return;
		}
	});
};
exports.incrementViews = function(id, callback) {

	services.db.connect('questions', function(db, collection, done) {
		collection.updateOne({
			'_id' : services.db.id(id)
		}, {
			'$inc' : {
				'views' : 1
			}
		}, function(err, result) {
			done();
			if (!!callback) {
				callback(err, result);
			}
		});
	});
};
exports.complexSearch = function(queryObj, callback) {

	if (!!queryObj.filter.searchText) {
		var text = new RegExp(queryObj.filter.searchText, 'i');

		if (!queryObj.filter.$or) {
			queryObj.filter.$or = [];
		}

		queryObj.filter.$or.push({
			'question' : text
		});
		queryObj.filter.$or.push({
			'answer' : text
		});
		queryObj.filter.$or.push({
			'options.label' : text
		}); // LERGO-465 - search should apply to exact match

		delete queryObj.filter.searchText;
	}
	// dont want to show invalid question later we will think on strategy
	queryObj.filter.question = {
		$exists : true
	};
	Question.connect(function(db, collection) {
		services.complexSearch.complexSearch(queryObj, {
			collection : collection
		}, callback);
	});

};
