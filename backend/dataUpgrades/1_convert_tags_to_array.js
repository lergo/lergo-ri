'use strict';

// converts tags to array of objects { 'label' : tag_value }
db.lessons.find().forEach(function(lesson){
    if ( !lesson.tags ){
        lesson.tags = [];
    }else{
        if ( typeof(lesson.tags) === 'string' ){
            var tempTags = lesson.tags.split(',');
            lesson.tags = [];
            tempTags.forEach(function(tag){
                lesson.tags.push( { 'label' : tag.trim() } );
            });
            db.lessons.update({ '_id' : lesson._id}, { '$set' : { 'tags' : lesson.tags }});
        }else{
            print('found unsupported type :: ', typeof(lesson.tags));
        }
    }
});

db.lessons.update({'tags' : ''}, {'$set' : { 'tags' : [] } }, { 'multi':true});


// converts tags to array of objects { 'label' : tag_value }
db.questions.find().forEach(function(question){
    if ( !question.tags ){
        question.tags = [];
    }else{
        if ( typeof(question.tags) === 'string' ){
            var tempTags = question.tags.split(',');
            question.tags = [];
            tempTags.forEach(function(tag){
                question.tags.push( { 'label' : tag.trim() } );
            });
            db.questions.update({ '_id' : question._id}, { '$set' : { 'tags' : question.tags }});
        }else{
            print('found unsupported type :: ', typeof(question.tags));
        }
    }
});

db.questions.update({'tags' : ''}, {'$set' : { 'tags' : [] } }, { 'multi':true});