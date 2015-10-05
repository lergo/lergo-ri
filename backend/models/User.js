/**
 * @module models User
 */
'use strict';
var AbstractModel = require('./AbstractModel');
var db = require('../services/DbService');


function User(data) {
    this.data = data;
}

User.collectionName = 'users';


function toPublicDetails ( user ){
    return {
        'username' : user.username,
        'isAdmin' : user.isAdmin, /** todo: replace this with permissions mechansim **/
        '_id' : user._id,
        'email':user.email /** email is required for gravatar pic */
    };
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


User.findByRole = function( roleId, callback ){
    if ( typeof(roleId) !== 'string' ){
        roleId = roleId.toHexString();
    }
    User.find({roles : roleId }, {}, { limit: 2},callback);
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
        // flatten permissions uniquely
        user.permissions = {};
        user.roleObjects.forEach(function (roleObject) {
            if ( !roleObject.permissions ){
                roleObject.permissions = [];
            }
            roleObject.permissions.forEach(function (p) {
                user.permissions[p] = p;
            });
        });
        user.permissions = Object.keys(user.permissions);

        if ( !user.permissions ){
            user.permissions = [];
        }

        return user;
    }


    db.getDbConnection(function(err, dbConnection ){
        /*jshint -W061 */ // https://github.com/gruntjs/grunt-contrib-jshint/issues/225
        dbConnection.eval( query.toString() , [db.id(userId)], callback );
    });

};





AbstractModel.enhance(User);

module.exports = User;