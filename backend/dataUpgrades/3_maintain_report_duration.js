'use strict';
function calculateDuration(report) {
    report.duration = 0;
    if ( !report.stepDurations ){
        return;
    }
    report.stepDurations.forEach(function (duration) {
        if (!!duration.startTime && !!duration.endTime) {
            report.duration = report.duration + (duration.endTime - duration.startTime);
        }
    });
    report.duration = report.duration - (report.duration % 1000);
}


db.reports.find({'duration' : {'$exists' : 0}, 'stepDurations' : { '$exists' :1 } }).forEach(function(report){
    try{
        calculateDuration(report);
        db.reports.update(
            { '_id' : report._id },
            { '$set' : { 'duration' : report.duration } }
        );
    }catch(e){
        print('error : unable to update report',e);
    }
});
