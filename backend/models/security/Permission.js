
'use strict';
var _ = require ('lodash');

/**
 * @typedef {object} LergoActivity
 **/

function Permission( data ){
    _.merge(this, data);
}

Permission.isPermissionNameValid = function( name ){
    return name.indexOf('userCan') === 0;
};

exports.Permission = Permission;

var sections = require('../../permissions');
exports.all = [];
_.each(sections, function( permissions, section){
    _.each( permissions,  function( p, name ) {
        if ( Permission.isPermissionNameValid(name) ) {
            var item = new Permission({name: name, section: section});
            exports[section + '_' + name] = item;
            exports.all.push(item);
        }
    });
});