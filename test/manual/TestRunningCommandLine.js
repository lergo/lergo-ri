'use strict';
//var logger = require('log4js').getLogger('TestRunningCommandLine');

var exec = require('child_process').exec,
    child;

child = exec('phantomjs TestPhantomJS.js',
    function (error, stdout, stderr) {
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        if (error !== null) {
            console.log('exec error: ' + error);
        }
    });