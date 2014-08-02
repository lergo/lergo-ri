'use strict';
var AbstractModel = require('./AbstractModel');



function Question(data) {
    this.data = data;
}

Question.collectionName = 'questions';


AbstractModel.enhance(Question);

module.exports = Question;


