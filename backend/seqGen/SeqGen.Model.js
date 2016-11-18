'use strict';

/**
 * Created by rahul on 18/11/16.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;


//TODO:temporary build fix as we have only one model we can afford clean all schema but we need to come up with the proper solution
/*Mocha exploded!
 OverwriteModelError: Cannot overwrite `counter` model once compiled. */
mongoose.models = {};
mongoose.modelSchemas = {};

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
                callback(err, result.next);
            });
        } else {
            collection.update({_id: counter}, {$inc: {next: 1}});
            callback(err, doc.next);
        }
    });
};


module.exports = mongoose.model('counter', counterSchema);
