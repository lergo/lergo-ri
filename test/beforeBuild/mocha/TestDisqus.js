'use strict';
//var path = require('path');
//var assert = require('assert');
var disqus = require('../../../backend/services/disqus');
var logger = require('log4js').getLogger('TestDisqus');
var conf = require('../../../backend/services/Conf');
var expect = require('expect.js');
disqus.configure(conf.disqus);

logger.info('loaded services');

describe('Disqus', function(){
    describe('#signMessage', function(){
        it('should create hmac->sha1 from a message', function(done){
            logger.info('running hmac-sha1 function');
            console.log(disqus.client);
//            logger.info('this is the message',disqus.client.signMessage('this is my message'));
            expect(disqus.client.signMessage('this is my message').length > 0).to.be(true);
            done();
        });
    });

    describe('#ssoObj', function(){
        it ( 'should create an sso object with pubKey and auth properties', function(done){
            var ssoObj = disqus.client.ssoObj({ 'id' : 'lergoid', 'username' : 'lergouser', 'email' : 'disqus@lergodev.info'});
//            logger.info('sshObj is', ssoObj );
            expect(ssoObj.hasOwnProperty('pubKey')).to.be(true);
            expect(ssoObj.hasOwnProperty('auth')).to.be(true);
            done();
        });
    });
});
