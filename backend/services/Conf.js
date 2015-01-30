/**
 *
 * @module Conf Service
 * @description
 * This will eventually become the configuration service.
 *
 * Currently they will exist side by side.
 *

 **/

var fs = require('fs');
var path = require('path');
var _  = require('lodash');
console.log('loading configuration from cwd', process.cwd());
var meConf = ( !!process.env.LERGO_ME_CONF && path.resolve(process.env.LERGO_ME_CONF) )||path.resolve(path.join(__dirname, '../../','conf/dev/me.json'));
var prodConf = path.resolve(path.join(__dirname,'../../','conf/prod.json'));


var data = fs.readFileSync(prodConf, 'utf8');
if (!!data) {
    _.merge(module.exports, JSON.parse(data));
}
data = fs.readFileSync(meConf, 'utf8');
if (!!data) {
    _.merge(module.exports, JSON.parse(data));
}
