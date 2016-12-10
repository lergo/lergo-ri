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

var pinSchema = new Schema(
    {
        pin: Number

    });

pinSchema.statics.getNext = function (callback) {
    var collection = this.collection;
    collection.findOneAndUpdate({created: {$exists: false}},{$set: {created: Date.now()}}, function (err, doc) {
        if (!doc) {
            console.log('No more valid pin');
            //TODO : Handle this situation
        } else {
            callback(err, doc.value.pin);
        }
    });
};


module.exports = mongoose.model('pin', pinSchema);
