exports.usersActions = require('./UsersActions');


function addAllActions ( actions ){


    for ( var i in actions ){
        if ( actions.hasOwnProperty(i) ){
            exports.actions.push(actions[i]);
        }
    }

}


exports.actions = [];
addAllActions( exports.usersActions );




