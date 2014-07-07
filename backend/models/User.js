var db = require('../services/DbService');
var AbstractModel = require('./AbstractModel');



 function User( data ){
    this.data = data;
}

User.collectionName = 'users';

AbstractModel.enhance(User);

module.exports = User;