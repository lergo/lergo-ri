'use strict';
var managers = require('../managers');
var services = require('../services');
var logger = require('log4js').getLogger('StatisticsController');

// use 'count' instead. currently all questions are in the memory http://stackoverflow.com/a/9337774/1068746
exports.getStatistics = function(req, res) {
	var stats = {};
	managers.questions.getQuestions({}, function(err, result) {
		stats.questionsCount = result.length;
		managers.lessons.getLessons({}, function(err, result) {
			stats.lessonsCount = result.length;
			res.send(stats);
		});
	});
};



// guy - does not belong here.. need to move this to "PublicController"

exports.getTranslation = function(req, res){

    if ( services.conf.translations.method === 'files' ){
         res.redirect(  req.absoluteUrl( '/translations/' + req.params.locale + '.json') );
    }else{ // method == phraseapp (the default)
        var locale = req.params.locale;
        //todo: don't use service phraseapp, use "TranslationManager" instead.
        services.phraseApp.getTranslation( locale, function( data, response ){
            logger.info('got translations');
            res.send(data);
        });
    }


};