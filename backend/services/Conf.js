/**
 *
 * This will eventually become the configuration service.
 *
 * Currently they will exist side by side.
 *

 **/

var fs = require('fs');
var _  = require('lodash');
var meConf = 'conf/dev/me.json';
var prodConf = 'conf/prod.json';

var conf;

var data = fs.readFileSync(prodConf, 'utf8');
if (!!data) {
    _.merge(module.exports, JSON.parse(data));
}
data = fs.readFileSync(meConf, 'utf8');
if (!!data) {
    _.merge(module.exports, JSON.parse(data));
}
