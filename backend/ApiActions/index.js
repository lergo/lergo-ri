exports.usersActions = require('./UsersActions');
exports.publicActions = require('./PublicActions');
exports.adminActions = require('./AdminActions');


function addAllActions ( actions ){


    for ( var i in actions ){
        if ( actions.hasOwnProperty(i) ){
            exports.actions.push(actions[i]);
        }
    }

}


exports.actions = [];
addAllActions( exports.publicActions );
addAllActions( exports.usersActions );
addAllActions( exports.adminActions );




