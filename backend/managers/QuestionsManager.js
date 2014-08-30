'use strict';
var logger = require('log4js').getLogger('QuestionsManager');
var dbManager = require('./DbManager');
var errorManager = require('./ErrorManager');
var _ = require('lodash');
var Question = require('../models/Question');
var services = require('../services');

exports.createQuestion = function(question, callback) {
	logger.info('Creating question');

	dbManager.connect('questions', function(db, collection, done) {
		collection.insert(question, function(err) {
			if (!!err) {
				logger.error('error creating question [%s] : [%s]', question.question, err);
				callback(new errorManager.InternalServerError(err,'unable to create question'));
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

exports.copyQuestion = function( user, question, callback ){
    logger.info('Copying question');

    // use omit and not pick, because there are different types of questions
    question = _.omit( question, [ '_id','lastUpdate' ] );

    question.question = 'Copy of : ' + question.question;
    question.userId = user._id;

    dbManager.connect('questions', function( db, collection ){
        collection.insert(question, function(err){
            if ( !!err ){
                logger.error('error copying question [%s] : [%s]', question.question, err );
                callback(new errorManager.InternalServerError(err, 'unable to copy question'));
                return;
            }else{
                logger.info('question copied successfully');
                callback(null, question);
                return;
            }
        });
    });
};

/**
 * finds question by user and updates the question.
 * @param question
 * @param callback
 */
exports.updateQuestion = function(question, callback) {
	logger.info('Updating question');

	dbManager.connect('questions', function(db, collection, done) {

        // prevent malicious users from making a fraud request to update someone else's question
        // find the user by using both the userId and questionId.
		collection.update({
			'_id' : question._id
		}, question, function(err) {
			if (!!err) {
				logger.error('error in updating question [%s] : [%s]', question.question , err);
				callback(new errorManager.InternalServerError());
				done();
				return;
			} else {
				logger.info('Question [%s] updated successfully. invoking callback', question.question );
				callback(null, question);
				done();
				return;
			}
		});
	});
};

exports.deleteQuestion = function(id, userId ,callback) {
	logger.info('Deleting question');
	dbManager.connect('questions', function(db, collection, done) {
		collection.remove({
			'_id' : dbManager.id(id),
			'userId' : userId
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
    Question.findById( id, callback  );
};



exports.getUserQuestions = function(userId, callback) {
	logger.info('getting user questions');
	dbManager.connect('questions', function(db, collection, done) {
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
	logger.info('finding questions with filter ', filter, projection);

	dbManager.connect('questions', function(db, collection, done) {
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
	dbManager.connect('questions', function(db, collection, done) {
		collection.find(filter).toArray(function(err, result) {
			if (!!err) {
				logger.error('unable to query for questions', err);
			}
			done();
			callback(err, result);
		});
	});
};


exports.findUsages = function(id, callback) {
	logger.info('Finding usages of the question');
	dbManager.connect('lessons', function(db, collection, done) {
		collection.find({
			'steps.items' : dbManager.id(id)
		}).toArray(function(err, result) {
			if (!!err) {
				logger.error('unable to find usage of questions [%s]', err.message);
			}
			done();
			callback(err, result);
		});
	});
};


exports.getQuestionsById = function (objectIds, callback) {
    objectIds = services.db.id(objectIds);
    Question.find({ '_id': { '$in': objectIds }}, { 'userId': 0 }, function (err, result) {
        if (!!err) {
            callback(new errorManager.InternalServerError(err, 'unable to find user questions by ids'));
            return;
        } else {
            callback(null, result);
            return;
        }
    });
};
