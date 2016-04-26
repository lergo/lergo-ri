/**
 * @module models User
 */
'use strict';
var AbstractModel = require('./AbstractModel');
var db = require('../services/DbService');
var Question = require('./Question');
var Lesson = require('./Lesson');
var async = require('async');
var logger = require('log4js').getLogger('User');
var _ = require('lodash');

function User(data) {
    this.data = data;
}

User.collectionName = 'users';


function toPublicDetails ( user ){
    try {
        return {
            'gravatarUrl': 'http://www.gravatar.com/avatar/' + require('crypto').createHash('md5').update(user.email).digest('hex') + '?size=25&default=mm',
            'gravatarUrlLarge': 'http://www.gravatar.com/avatar/' + require('crypto').createHash('md5').update(user.email).digest('hex') + '?size=150&default=mm',
            'username': user.username,
            'shortIntro': user.shortIntro,
            'externalLink': user.externalLink,
            'details': user.details,
            'isAdmin': user.isAdmin, /** todo: replace this with permissions mechansim **/
            '_id': user._id
        };
    }catch(e){
        logger.error('unable to get public details for user [' + user.email + ']',e);
    }
}

/**
 *
 * this function converts user object to only public details about the user.
 * it supports a single user object or a list of users.
 *
 * @param user
 * @returns {*}
 */
User.getUserPublicDetails = function getUserPublicDetails(user) {
    if ( Array.isArray(user) ){
        return user.map(toPublicDetails);
    }else{ // assume object
        return toPublicDetails(user);
    }
};

User.findByUsername = function( username, callback ){
    User.findOne({
        'username': username
    }, {} , callback );
};


User.findByRole = function( roleId, callback ){
    if ( typeof(roleId) !== 'string' ){
        roleId = roleId.toHexString();
    }
    User.find({roles : roleId }, {}, { limit: 2},callback);
};

User.getStats = function( userId, callback ){
    var result = {};
    async.parallel([
            function countQuestions(done) {
                Question.count({
                    userId: db.id(userId)
                }, function (err, count) {
                    result.allQuestionsCount = count;
                    done(err);
                });
            }, function countLessons(done) {
                Lesson.count({
                    userId: db.id(userId)
                }, function (err, count) {
                    result.allLessonsCount = count;
                    done(err);
                });
            }, function countPublicLessons(done) { // todo: improve this algorithm to use

                Lesson.countPublicLessonsForUser(userId, function (err, count) {
                    result.publicLessonsCount = count;
                    done(err);
                });
            },
            function countPublicQuestions(done) {
                Lesson.countPublicQuestionsByUser(userId, function (err, count) {
                    result.publicQuestionsCount = count;
                    done(err);
                });
            }


        ],
        function (error) {
            logger.debug('got stats', result);
            callback(error, result);

        }
    );
};


/**
 * returns a user record, adding 'permissions' property on it
 */
User.getUserAndPermissions = function( userId, callback ){

    function query( _id ){
        var user = db.users.findOne( { _id: _id });
        if ( !user ){
            return null;
        }
        user.roleObjects = [];
        var rolesObjectIds = [];

        if ( !user.roles ) {
            user.roles = [];
        }
        user.roles.forEach(function (roleId) {
            /* globals ObjectId */
            rolesObjectIds.push(new ObjectId(roleId));
            user.roleObjects = db.roles.find({_id: {$in: rolesObjectIds}}).toArray();
        });

        return user;
    }


    db.getDbConnection(function(err, dbConnection ){
        /*jshint -W061 */ // https://github.com/gruntjs/grunt-contrib-jshint/issues/225
        dbConnection.eval( query.toString() , [db.id(userId)], function(err, user){

            if ( !err && user ) {
                // flatten permissions uniquely
                user.permissions = _.union(_.flatten(_.map(user.roleObjects, 'permissions')));

                // merge all limitations. we want a customized merge. not the built in lodash thing..
                // because when we have a limitation on the subject to edit (for example, one role has 'arabic' and another 'hebrew' )
                // then we want a limitation on both
                var customizer = require('../services/RoleLimitationMerger').customizer;
                var limitationsArr = [{}].concat( _.map(user.roleObjects, 'limitations'));
                var mergedLimitations = _.mergeWith.apply(null, [].concat(limitationsArr,[customizer])  );
                user.permissionsLimitations = mergedLimitations;


                if (!user.permissions) {
                    user.permissions = [];
                }
            }
            callback(err,user);

        } );
    });

};





AbstractModel.enhance(User);

module.exports = User;
