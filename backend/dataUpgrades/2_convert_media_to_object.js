'use strict';

// converts tags to array of objects { 'label' : tag_value }
db.questions.find().forEach(function(question){
    if ( question.media === 'audio' || question.media === 'image' ){
        var media = {
            'type' : question.media,
            'imageUrl' : question.imageUrl,
            'audioUrl' : question.audioUrl
        };

        db.questions.update(
            { '_id' : question._id },
            { '$set' : { 'media' : media }, '$unset' : { 'audioUrl' : '', 'imageUrl' : '' }}
        );
    }
});
