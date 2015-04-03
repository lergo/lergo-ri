db.questions.find({type: "exactMatch"}).forEach(function (doc) {
    if (!!doc.options) {
        doc.options.forEach(function (option) {
            print(option);
            if (option.checked === undefined) {
                option.checked = true;
            }
        });
    }
    db.questions.save(doc);
});