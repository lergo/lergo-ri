'use strict';
var models = require('../models');
var async = require('async');
var services = require('../services');
var logger = require('log4js').getLogger('StatisticsController');

// use 'count' instead. currently all questions are in the memory http://stackoverflow.com/a/9337774/1068746
exports.getStatistics = function (req, res) {
    var stats = {};
    async.parallel([
            function countQuestions(callback) {
                models.Question.count({}, function (err, result) {
                    stats.questionsCount = result;
                    callback();
                });
            },
            function countLessons(callback) {
                models.Lesson.count({}, function (err, result) {
                    stats.lessonsCount = result;
                    callback();
                });
            }
        ],
        function (err) {
            if (!!err) {
                res.status(500).send('unable to count', err);
                return;
            }
            res.send(stats);
        });
};


// guy - does not belong here.. need to move this to "PublicController"

exports.getTranslation = function (req, res) {

    if (services.conf.translations.method === 'files') {
        res.redirect(req.absoluteUrl('/translations/' + req.params.locale + '.json'));
    } else { // method == phraseapp (the default)
        var locale = req.params.locale;
        //todo: don't use service phraseapp, use "TranslationManager" instead.
        services.phraseApp.getTranslation(locale, function (data/*, response*/) {
            logger.debug('got translations');
            res.send(data);
        });
    }


};