'use strict';
var AbstractModel = require('./AbstractModel');
var ComplexSearchService = require('../services/ComplexSearchService');

/**
 * @typedef Role
 * @property {object} data
 * @property {string} data.name - name of role
 * @property {string} data.description - description of this role
 * @property {Array} data.permissions - list of permissions this role is allowed

 */

/**
 * @param data
 * @constructor
 */
function Role(data) {
    this.data = data;
}

Role.collectionName = 'roles';

AbstractModel.enhance(Role);

/**
 *
 * @param {string} section e.g. lessons
 * @param {string} field e.g. userCanEdit
 * @returns {string}
 */
Role.getPermissionName = function( section, field ){
    return section + '.' + field;
};

Role.complexSearch = function( queryObj, callback ){
    Role.connect( function( db, collection ){
        ComplexSearchService.complexSearch( queryObj, { collection : collection }, callback );
    });
};


module.exports = Role;




