// db.reports.find({'data.quizItems.copyOf' : { '$exists' : 1 } },{'_id':0, 'data.quizItems.copyOf' : 1}).pretty();

db.reports.find({ 'data.quizItems.copyOf' : { '$exists' : 1 } }).forEach( function(doc) {
  var arr = doc.data.quizItems;
  var length = arr.length;
  for (var i = 0; i < length; i++) {
    delete arr[i]["copyOf"];
   }
   db.reports.save(doc);
});
