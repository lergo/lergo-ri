/**
 * @module models User
 */
'use strict';
var AbstractModel = require('./AbstractModel');


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

/**
 *
 * @param {LergoActivity} activity
 */
User.prototype.isAllowed = function( activity ){
    // todo : implement this?
    throw new Error('unsupported for activity ' + activity);
};

AbstractModel.enhance(User);

module.exports = User;