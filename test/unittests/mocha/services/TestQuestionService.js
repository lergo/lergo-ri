'use strict';


describe('QuestionService', function(){
    var QuestionService;
    var expect = require('expect.js');
    before(function(){
        QuestionService = require('../../../../backend/services/QuestionService');
    });


    describe('isCorrect - MultipleChoice', function(){

        it('LERGO-600 - should not return explanation text if one does not exist', function(){
            var question = {
                'options': [{
                    'label': 'choice2 - with expl',
                    'textExplanation': 'this will show an explanation'
                }, {'label': 'choice 3- without expl', 'userAnswer': true}, {
                    'label': 'choice1 - correct',
                    'checked': true
                }],
                'question': 'can you reproduce?',
                'tags': [],
                'type': 'multipleChoices',
                'userAnswer': ['choice 3- without expl']
            };

            var handler = QuestionService.getHandler(question);
            var result = handler.isCorrect(question);
            expect(result.expMessage.length).to.be(0);
        });
    });

});