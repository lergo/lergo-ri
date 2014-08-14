'use strict';
exports.functionName = function(fun) {
    if ( !!fun) {

        if ( !!fun.name ){
            return fun.name;
        }

        var ret = fun.toString();
        ret = ret.substr('function '.length);
        ret = ret.substr(0, ret.indexOf('('));
        if (ret.trim().length === 0) {
            throw 'function has no name :: ' + fun.toString();
        }
        return ret;
    }

    if ( !fun ){
        throw 'function is missing ' + fun.toString();
    }
};