'use strict';

/**
 * @module UsersManager
 * @type {api|exports}
 */
var sha1 = require('sha1');
var logger = require('log4js').getLogger('UsersManager');
var services = require('../services');
var errorManager = require('./ErrorManager');
var User = require('../models/User');
var _ = require('lodash');

/**
 * This function will return true if userName >= 3 character and should only
 * include alphanumeric and under score else return false;
 * 
 * @param {string} userName
 * @returns {boolean} true iff username is valid
 */
function isValidUserName(userName) {
	if (userName === null || typeof (userName) === 'undefined' || userName.length < 3) {
		return false;
	}
	var usernameRegex = /^[a-zA-Z0-9\_]+$/;
	return userName.match(usernameRegex);
}

/**
 * Return true if email is valid else return false This method only checks
 * pattern of email
 * 
 * @param {string} email
 * @returns {boolean} true iff email is valid
 */
function isValidEmail(email) {
	if (email === null || typeof (email) === 'undefined' || email.length === 0) {
		return false;
	}
	var emailRegex = /^[A-Za-z0-9._%+-]+@([A-Za-z0-9-]+\.)+([A-Za-z0-9]{2,4}|museum)$/;
	return email.match(emailRegex);
}

function getUserHmacDetails(user) {
	return [ user._id, user.email, user.username, user.password ];
}

/**
 * returns an error if user details invalid. otherwise null
 * 
 * @param user -
 *            the user to validate
 */
exports.getUserDetailsError = function(user) {
	if (!isValidEmail(user.email)) {
		logger.info('User email [%s] is invalid .', user.email);
		return new errorManager.InvalidEmail();
	}

	if (!isValidUserName(user.username)) {
		logger.info('User name [%s] is invalid. User name should not be lesser then 3 characters it should only contain alphanumeric characters and underscore ');
		return new errorManager.InvalidUsername();
	}
};

exports.createUser = function(emailResources, user, callback) {
	logger.info('saving user');

	if (!user.fullName) {
		callback(new errorManager.InternalServerError(null, 'missing fullname'));
		return;
	}

	var userError = exports.getUserDetailsError(user);
	if (!!userError) {
		callback(userError);
		return;
	}

	exports.isUserExists(user.username, user.email, function(err, result) {
		logger.info(arguments);
		if (!!err) {
			logger.error('error getting user by email');
			callback(new errorManager.InternalServerError(err, 'searching for user with same username'));
			return;
		}

		if (!!result) {
			logger.info('user with email [%s] or username [%s] already exists', user.email, user.username);
			callback(new errorManager.UsernameAlreadyExists());
			return;
		}

		logger.info('user with email [%s] does not exists. creating', user.username);
		services.db.connect('users', function(db, collection, done) {

			user.password = exports.encryptUserPassword(user.password);
			delete user.passwordConfirm;

			collection.insert(user, function(err) {
				if (!!err) {
					logger.error('error creating user [%s] : [%s]', user.username, err);
					callback(new errorManager.InternalServerError());
					done();
					return;
				}

				else {
					logger.info('user [%s] creating successfully. sending validation email', user.username);
					done();
					exports.sendValidationEmail(emailResources, user, function(err, user) {
						if (!!err) {
							callback(new errorManager.ErrorSendingValidationEmail(err, user.email));
							return;
						}

						callback(null, user);
						return;
					});

				}
			});
		});

	});
};

exports.updateUser = function(user, callback) {
	logger.info('updating user');

	var userError = exports.getUserDetailsError(user);

	if (!!userError) {
		callback(userError);
		return;
	}

	services.db.connect('users', function(db, collection, done) {
		collection.update({
			'_id' : user._id
		}, user, function(err) {

			if (!!err) {
				logger.error('error updating user [%s]', user.username, err);
				done();
				callback(new errorManager.InternalServerError(err));
				return;
			} else {
				logger.info('updated user [%s] successfully', user.username);
				done();
				callback(null, user);
				return;
			}
		});
	});

};

exports.encryptUserPassword = function(password) {
	return sha1(password);
};

/**
 * 
 * find a user according to username/ sha1(password) and calls callback. If user
 * not found, calls callback with "undefined" or "null".
 * 
 * loginCredentials : { username, password }
 * 
 * @param loginCredentials
 * @param callback
 */
exports.loginUser = function(loginCredentials, callback) {
	logger.info('logging user [%s] in', loginCredentials.username);
	services.db.connect('users', function(db, collection, done) {
		collection.findOne({
			'username' : loginCredentials.username,
			'password' : exports.encryptUserPassword(loginCredentials.password)
		}, function(err, obj) {
			if (!obj) {
				callback(new errorManager.InvalidUsername(), null);
				done();
				return;
			} else {
				obj.getId = function() {
					return obj._id;
				};
				callback(err, obj);
				done();
				return;
			}

		});
	});
};

/**
 * 
 * @param linkBase -
 *            e.g. http://www.lergodev.info/views/session/validateUser.html
 * @param user -
 *            the user want to validate
 */
exports.sendValidationEmail = function(emailResources, user, callback) {
	if (!user.email) {
		callback(new errorManager.InternalServerError(new Error('user ' + user._id + ' does not have an email. fix corrupted data in database')));
	}
	logger.info('sending validation email', user);
	var emailVars = {};
	_.merge(emailVars, emailResources);
	var validationLink = emailResources.lergoBaseUrl + '/#!/public/user/validate?_id=' + encodeURIComponent(user._id) + '&hmac='+ encodeURIComponent(services.hmac.createHmac(getUserHmacDetails(user)));

	_.merge(emailVars, {
		'link' : validationLink,
		'name' : user.username
	});

	services.emailTemplates.renderUserValidationEmail(emailVars, function(err, html, text) {
		services.email.sendMail({
			'to' : user.email,
			'subject' : 'LerGO validation',
			'text' : text,
			'html' : html
		}, function(err) {
			if (!!err) {
				callback(new errorManager.InternalServerError('error sending email', err));
			} else {
				callback(null, user);
			}

		});
	});
};

exports.findUserByIdWithHmac = function(userId, hmac, callback) {
	exports.findUserById(userId, function(err, user) {

		if (!!err) {
			logger.error('error while finding user', err);
			callback(err);
			return;
		}

		if (!services.hmac.validateHmac(hmac, getUserHmacDetails(user))) {
			logger.info('hmac invalid for user');
			callback('hmac does not match');
			return;
		}

		callback(null, user);
	});
};

exports.validateUser = function(userId, hmac, callback) {
	logger.info('validation user [%s]', userId);
	exports.findUserByIdWithHmac(userId, hmac, function(err, user) {

		if (!!err) {
			callback(new errorManager.UserValidationFailed(err));
			return;
		}
		logger.info('user validation passed');
		user.validated = true;
		exports.updateUser(user, function(err) {
			if (!!err) {
				logger.error('error while updating user', err);
				callback(new errorManager.UserValidationFailed(err));
				return;
			}
			logger.info('user updated successfully');
			user.getId = function() {
				return user._id;
			};
			callback(null, user);
		});
	});
};

exports.findUserById = function(userId, callback) {
	logger.debug('getting user with id [%s]', userId);
	return User.findById(userId, { /* projection */}, callback);
};

exports.sendResetPasswordMail = function(emailResources, resetDetails, callback) {

	logger.info('sending reset password mail ', resetDetails);

	// at the meantime we have 1-1 relationship between username and email
	// so we can allow users to submit only email on forgot password..

	// later we will have multiple usernames for email, so we will have "forgot
	// username" and "forgot password"
	// forgot password should then accept only username
	// forgot username should accept only email

	if (!resetDetails.username && !resetDetails.email) {
		callback('must have username or email');
		return;
	}

	var filters = {};

	if (!!resetDetails.username) {
		filters.username = resetDetails.username;
	}

	if (!!resetDetails.email) {
		filters.email = resetDetails.email;
	}

	exports.findUser(filters, function(err, user) {
		logger.info(arguments);

		if (!!err) {
			logger.info('failed to find user', resetDetails);
			callback(err);
			return;
		}

		if (!user) {
			callback(new errorManager.NotFound(null, 'could not find user'));
			return;
		}

		if (!user.email) {
			throw new Error('user ' + JSON.stringify(user) + ' does not have an email. fix corrupted data in database');
		}

		var emailVars = {};
		_.merge(emailVars, emailResources);
		var changePasswordLink = emailResources.lergoBaseUrl + '/#!/public/user/changePassword?_id=' + encodeURIComponent(user._id) + '&hmac='+ encodeURIComponent(services.hmac.createHmac(getUserHmacDetails(user)));

		_.merge(emailVars, {
			'link' : changePasswordLink,
			'name' : user.username
		});

		services.emailTemplates.renderResetPassword(emailVars, function(err, html, text) {
			services.email.sendMail({
				'to' : user.email,
				'subject' : 'LerGO Reset Password Request',
				'text' : text,
				'html' : html
			}, function(err) {
				callback(err);
			});
		});

	});

};

exports.changePassword = function(changePasswordDetails, user, callback) {

	if (changePasswordDetails.password !== changePasswordDetails.passwordConfirm) {
		callback(new errorManager.InternalServerError('password does not match confirm password'));
		return;
	}

	function changePassword(user) {
		var newPassword = changePasswordDetails.password;
		user.password = exports.encryptUserPassword(newPassword);
		exports.updateUser(user, callback);
	}

	if (!!changePasswordDetails.hmac) {
		logger.info('using email link');

		exports.findUserByIdWithHmac(changePasswordDetails.userId, changePasswordDetails.hmac, function(err, user) {

			if (!!err) {
				callback(new errorManager.UserValidationFailed(err));
				return;
			}

			changePassword(user);
		});

	} else if (!!user) {
		changePassword(user);
	} else {
		callback(new errorManager.InternalServerError('there is no user on the request and i do not have changePasswordDetails'));
	}

};

exports.findUser = function(filter, callback) {
	logger.info('getting user with filter [%s]', JSON.stringify(filter));
	User.findOne(filter, {}, callback);

};

exports.find = function(filter, projection, callback) {
	services.db.connect('users', function(db, collection) {
		collection.find(filter, projection).toArray(function(err, result) {
			callback(err, result);
		});
	});
};

exports.getPublicUsersDetailsMapByIds = function(ids, callback) {
	logger.debug('finding users ', ids);
	services.db.connect('users', function(db, collection, done) {
		var cursor = collection.find({
			'_id' : {
				'$in' : ids
			}
		}, {
			'username' : 1,
			'_id' : 1
		});
		services.db.toMap(cursor, function(err, map) {
			done();
			callback(err, map);
		});
	});
};

exports.isUserExists = function(username, email, callback) {
	exports.findUser({
		'$or' : [ {
			'username' : username
		}, {
			'email' : email
		} ]
	}, function(err, result) {
		if (!!err) {
			callback(err);
		} else {
			callback(null, !!result);
		}
	});
};

exports.getUserByEmail = function(email, callback) {
	exports.findUser({
		'email' : email
	}, callback);
};

exports.getUserByUsername = function(username, callback) {
	exports.findUser({
		'username' : username
	}, callback);
};

exports.getAllAdminEmails = function(callback) {
	exports.find({
		'isAdmin' : true
	}, {
		email : 1,
		_id : 0
	}, function(err, result) {
		if (!!err) {
			callback(err);
		}
		callback(null, _.map(result, 'email'));
	});
};
