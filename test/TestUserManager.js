'use strict';
var assert = require('assert');
var appContext = require('../backend/ApplicationContext');
var logger = appContext.logManager.getLogger('TestUserManager');
//var usersManager = require('../backend/managers/UsersManager');
var usersManager = appContext.usersManager;
var dbManager = appContext.dbManager;
var async = require('async');
dbManager.setUrl('mongodb://127.0.0.1:27017/lergo-test');




console.log('hello');
before(function () {
    logger.info('i am running before');
});

beforeEach(function () {
    logger.info('i am running before each');
});

describe('UserManager', function () {
    describe('#signup', function () {
        it('should save user if not exists', function (done) {
            var username = 'guy@domain.com';

            async.waterfall([

                function findUser(callback) {
                    logger.info('finding user with username [%s]', username);
                    dbManager.connect('users', function (db, collection, _done) {
                        collection.find({'username': username}, function (err, obj) {
                            if (!!err) {
                                logger.error(err);
                                throw err;
                            }
                            logger.info('no error');
                            _done();
                            logger.info('connection is closed, calling callback');
                            callback(null, obj);
                        });
                    });
                },
                function deleteUserIfExists(callback, obj) {
                    logger.info('i will delete user');
                    if (!!obj) {
                        dbManager.connect('users', function (db, collection, done) {
                            logger.info('deleting username [%s]', username);
                            collection.remove(obj, function (err) {
                                if (!!err) {
                                    throw err;
                                }
                                done();
                                callback();
                            });
                        });

                    } else {
                        callback();
                    }


                },
                function runTest() {
                    usersManager.saveUser({'username': 'guy@domain.com'}, function (err, user) {
                        logger.info('user was saved.' + JSON.stringify(user) + ' - lets see it');

                        usersManager.getUserByEmail('guy@domain.com', function (err, user) {
                            logger.info(user._id);
                            assert(!!user);
                        });

                        done();
                    });
                }

            ]);

        });
//
//        it('should fail if username already exists', function (done) {
//            logger.info('tba');
//            done();
//        });
    });
});


//describe('LogManager', function(){
//    describe('#getLogger', function(){
//        it('should get logger', function(done){
//            logger.info('it should get a logger');
//            done();
//        });
//
//    })
//});