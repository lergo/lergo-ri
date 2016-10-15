// run with : mongo <DB_NAME> < 10_remove_report_data_duplicate.js


db.reports.update({'data.lesson.temporary' : { $exists : false }},{'$unset':  {'data.quizItems' : '','data.lesson.steps' : ''} }, {multi:true});
db.repairDatabase();
