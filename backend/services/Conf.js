'use strict';
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
var prodConf = path.resolve(path.join(__dirname,'..','..','conf','prod.json'));

if (fs.existsSync(prodConf)) {
    _.merge(module.exports, require(prodConf));
}

if (fs.existsSync(meConf)) {
    _.merge(module.exports, require(meConf));
}

const ENV_PREFIX='LERGO_';
_.each(process.env, (v, k) => {
    if (k.startsWith(ENV_PREFIX)) {
        module.exports[_.camelCase(k.slice(ENV_PREFIX.length))] = v;
    }
});
