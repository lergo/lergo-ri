db.lessons.find().forEach(function (les) {
    if (!!les.steps) {
        les.steps.forEach(function (step) {
            if (!!step.quizItems) {
                if (!step.retBefCrctAns) {
                    step.retBefCrctAns = 1;
                }
            }
        });
        db.lessons.save(les);
    }
});
