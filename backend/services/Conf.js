/**
 *
 * This will eventually become the configuration service.
 *
 * Currently they will exist side by side.
 *

 **/

var fs = require('fs');
var path = require('path');
var _  = require('lodash');
var meConf = process.env.LERGO_ME_CONF||path.resolve('conf/dev/me.json');
var prodConf = path.resolve(path.join(__dirname,'../../','conf/prod.json'));


var data = fs.readFileSync(prodConf, 'utf8');
if (!!data) {
    _.merge(module.exports, JSON.parse(data));
}
data = fs.readFileSync(meConf, 'utf8');
if (!!data) {
    _.merge(module.exports, JSON.parse(data));
}
