'use strict';

/**
 * Created by rahul on 18/11/16.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var counterSchema = new Schema(
    {
        _id: String,
        next: Number
    });

counterSchema.statics.getNext = function (counter, callback) {
    var collection = this.collection;
    collection.findOne({_id: counter}, function (err, doc) {
        if (!doc) {
            collection.insert({_id: counter, next: 100000}, function (err, result) {
                collection.update({_id: counter}, {$inc: {next: 1}});
                callback(err,result.next);
            });
        } else {
            collection.update({_id: counter}, {$inc: {next: 1}});
            callback(err,doc.next);
        }
    });
};

var Counter = mongoose.model('counter', counterSchema);

module.exports = Counter;
