'use strict';
var logger = require('log4js').getLogger('Group');
var AbstractModel = require('../AbstractModel');
var ComplexSearchService = require('../../services/ComplexSearchService');
var _ = require('lodash');

/**
 * @typedef Group
 * @property {object} data
 * @property {string} data.name - name of group
 * @property {string} data.description - description of this group
 * @property {Array} data.roles - list of roles id this group is allowed

 */

/**
 * @param data
 * @constructor
 */
function Group(data) {
    this.data = data;
}

Group.collectionName = 'groups';

AbstractModel.enhance(Group);

/**
 * finds all groups by role
 * @param roleId
 * @param callback
 */
Group.findByRole = function( roleId, callback ){
    if ( typeof(roleId) !== 'string' ){
        roleId = roleId.toHexString();
    }
    Group.find({role : roleId }).toArray(callback);
};

// todo: move to abstract?
Group.complexSearch = function( queryObj, callback ){
    Group.connect( function( db, collection ){
        ComplexSearchService.complexSearch( queryObj, { collection : collection }, callback );
    });
};


module.exports = Group;




