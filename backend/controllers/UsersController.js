'use strict';
var managers = require('../managers');
var logger = managers.log.getLogger('UsersController');

exports.signup = function(req, res){
    debugger;
    var user = req.body;
    managers.users.saveUser( user, function( err ){

    });

};