'use strict';
/*jshint camelcase: false */

var logger = require('log4js').getLogger('TestRenameKeyMiddleware');
var lergoMiddleware = require('../../../backend/LergoMiddleware');
var expect = require('expect.js');



logger.info('rename key test');
describe('rename key', function () {
    var oldObj = {'age': { 'dollar_max' : 6 , 'dollar_min' : 4}};
    it ('should support custom functions', function(){
        var oldObj = {'age': { 'dollar_max' : 6 , 'dollar_min' : 4}};
        var newObj = {};
        function myFunc( oldKey ){
            if ( oldKey.indexOf('dollar_') === 0){
                return '$' + oldKey.substring('dollar_'.length);
            }
            return oldKey;
        }
        lergoMiddleware.renameKey( newObj ,oldObj, myFunc  );

        expect(newObj.age.dollar_max).to.be(undefined);
        expect(newObj.age.$max).to.be(6);

        console.log(newObj);
    });

    it ('should replace dollar_ prefix with $ sign', function(){
        var newObj = lergoMiddleware.replaceDollarPrefix(oldObj);
        expect(newObj.age.dollar_max).to.be(undefined);
        expect(newObj.age.$max).to.be(6);
    });


});