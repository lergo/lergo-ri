// db.lessonsInvitations.find({'quizItems.copyOf' : { '$exists' : 1 } },{'_id':0, 'quizItems.copyOf' : 1}).pretty();

db.lessonsInvitations.find({ 'quizItems.copyOf' : { '$exists' : 1 } }).forEach( function(doc) {
    var arr = doc.quizItems;
    var length = arr.length;
    for (var i = 0; i < length; i++) {
        delete arr[i]["copyOf"];
    }
    db.lessonsInvitations.save(doc);
});