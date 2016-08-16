/**
 * Created by rahul on 17/8/16.
 */


var reports = db.reports.aggregate([{
    $match: {'data.invitee.class': {$exists: true}, 'finished': true}
}, {
    $group: {
        _id: '$invitationId',
        duration: {$avg: '$duration'},
        correctPercentage: {$avg: '$correctPercentage'},
        count: {$sum: 1},
        data: {$first: '$data'},
        lastUpdate: {$max: "$lastUpdate"},
        answers: {$push: '$answers'},
        stepDurations: {$push: '$stepDurations'}
    }
}, {
    $project: {
        _id: 0,
        invitationId: '$_id',
        duration: 1,
        correctPercentage: 1,
        count: 1,
        lastUpdate: 1,
        data: 1,
        answers: 1,
        stepDurations: 1
    }
}]);


reports.forEach(function (report) {
    var flatAnswers = [];
    report.answers.forEach(function (answer) {
        flatAnswers = flatAnswers.concat(answer);
    });

    var answers = {};
    flatAnswers.forEach(function (answer) {
        var index = answer.stepIndex;
        var qId = answer.quizItemId;
        var key = index + "-" + qId;
        var ansAgg = answers[key];
        if (!!ansAgg) {
            ansAgg.duration = ansAgg.duration + answer.duration;
            ansAgg.count = ansAgg.count + 1;
            if (!!answer.checkAnswer.correct) {
                ansAgg.correct = ansAgg.correct + 1
            }
        } else {
            ansAgg = {
                duration: answer.duration,
                count: 1
            };
            if (!!answer.checkAnswer.correct) {
                ansAgg.correct = 1;
            }
            answers[key] = ansAgg;
        }
    });
    report.answers = answers;
    var steps = {};
    report.stepDurations.forEach(function (stepDurations) {
        for (var i = 0; i < stepDurations.length; i++) {
            var duration = stepDurations[i].endTime - stepDurations[i].startTime;
            if (isNaN(duration)) {
                duration = 0;
            }
            var step = steps[i];
            if (!!step) {
                step.duration = step.duration + duration;
                step.count = step.count + 1;
            } else {
                step = {
                    duration: duration,
                    count: 1
                };
                steps[i] = step;
            }
        }
    });
    report.stepDurations = steps;
    db.classReports.update({invitationId: report.invitationId}, report, {upsert: true});
    print('Updating class report for invitation ID :' + report.invitationId);
});
