'use strict';
var page = require('webpage').create();
page.open('http://www.lergo.org/#!/public/lessons/53ce54a5a7fe54ef52ade6de/intro').then(function () {
    console.log(page.content);
//    phantom.exit();
});

