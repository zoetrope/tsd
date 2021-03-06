var xm;
(function (xm) {
    'use strict';

    var natives = {
        '[object Arguments]': 'arguments',
        '[object Array]': 'array',
        '[object Date]': 'date',
        '[object Function]': 'function',
        '[object Number]': 'number',
        '[object RegExp]': 'regexp',
        '[object String]': 'string'
    };

    function typeOf(obj) {
        var str = Object.prototype.toString.call(obj);
        if (natives[str]) {
            return natives[str];
        }
        if (obj === null) {
            return 'null';
        }
        if (obj === undefined) {
            return 'undefined';
        }
        if (obj === Object(obj)) {
            return 'object';
        }
        return typeof obj;
    }
    xm.typeOf = typeOf;

    var jsonTypes = [
        'array',
        'object',
        'boolean',
        'number',
        'string',
        'null'
    ];

    var primitiveTypes = [
        'boolean',
        'number',
        'string'
    ];

    var valueTypes = [
        'boolean',
        'number',
        'string',
        'null'
    ];

    var objectNameExp = /(^\[object )|(\]$)/gi;

    function toProtoString(obj) {
        return Object.prototype.toString.call(obj).replace(objectNameExp, '');
    }
    xm.toProtoString = toProtoString;

    var typeMap = {
        arguments: isArguments,
        array: isArray,
        date: isDate,
        function: isFunction,
        number: isNumber,
        regexp: isRegExp,
        string: isString,
        null: isNull,
        undefined: isUndefined,
        object: isObject,
        boolean: isBoolean,
        ok: isOk,
        valid: isValid,
        jsonValue: isJSONValue
    };

    function hasOwnProp(obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
    }
    xm.hasOwnProp = hasOwnProp;

    function isType(obj, type) {
        if (hasOwnProp(typeMap, type)) {
            return typeMap[type].call(null, obj);
        }
        return false;
    }
    xm.isType = isType;

    function isArguments(obj) {
        return (typeOf(obj) === 'arguments');
    }
    xm.isArguments = isArguments;

    function isArray(obj) {
        return (typeOf(obj) === 'array');
    }
    xm.isArray = isArray;

    function isDate(obj) {
        return (typeOf(obj) === 'date');
    }
    xm.isDate = isDate;

    function isFunction(obj) {
        return (typeOf(obj) === 'function');
    }
    xm.isFunction = isFunction;

    function isNumber(obj) {
        return (typeOf(obj) === 'number');
    }
    xm.isNumber = isNumber;

    function isRegExp(obj) {
        return (typeOf(obj) === 'regexp');
    }
    xm.isRegExp = isRegExp;

    function isString(obj) {
        return (typeOf(obj) === 'string');
    }
    xm.isString = isString;

    function isNull(obj) {
        return (typeOf(obj) === 'null');
    }
    xm.isNull = isNull;

    function isUndefined(obj) {
        return (typeOf(obj) === 'undefined');
    }
    xm.isUndefined = isUndefined;

    function isObject(obj) {
        return (typeOf(obj) === 'object');
    }
    xm.isObject = isObject;

    function isBoolean(obj) {
        return (typeOf(obj) === 'boolean');
    }
    xm.isBoolean = isBoolean;

    function isArrayLike(obj) {
        return (typeOf(obj) === 'array' || typeOf(obj) === 'arguments');
    }
    xm.isArrayLike = isArrayLike;

    function isOk(obj) {
        return !!obj;
    }
    xm.isOk = isOk;

    function isValid(obj) {
        var type = typeOf(obj);
        return !(type === 'undefined' || type === 'null' || (type === 'number' && isNaN(obj)));
    }
    xm.isValid = isValid;

    function isJSONValue(obj) {
        return jsonTypes.indexOf(typeOf(obj)) > -1;
    }
    xm.isJSONValue = isJSONValue;

    function isPrimitive(obj) {
        return primitiveTypes.indexOf(typeOf(obj)) > -1;
    }
    xm.isPrimitive = isPrimitive;

    function isValueType(obj) {
        return valueTypes.indexOf(typeOf(obj)) > -1;
    }
    xm.isValueType = isValueType;

    function getTypeOfMap(add) {
        var name;
        var obj = {};
        for (name in typeMap) {
            if (hasOwnProp(typeMap, name)) {
                obj[name] = typeMap[name];
            }
        }
        if (add) {
            for (name in add) {
                if (hasOwnProp(add, name) && isFunction(add[name])) {
                    obj[name] = add[name];
                }
            }
        }
        return obj;
    }
    xm.getTypeOfMap = getTypeOfMap;

    function getTypeOfWrap(add) {
        var typeMap = getTypeOfMap(add);

        return function isTypeWrap(obj, type) {
            if (hasOwnProp(typeMap, type)) {
                return typeMap[type].call(null, obj);
            }
            return false;
        };
    }
    xm.getTypeOfWrap = getTypeOfWrap;
})(xm || (xm = {}));
var xm;
(function (xm) {
    var util = require('util');
    var jsesc = require('jsesc');

    var stringExp = /^[a-z](?:[a-z0-9_\-]*?[a-z0-9])?$/i;
    var stringQuote = '"';

    var identExp = /^[a-z](?:[a-z0-9_\-]*?[a-z0-9])?$/i;
    var identAnyExp = /^[a-z0-9](?:[a-z0-9_\-]*?[a-z0-9])?$/i;
    var intExp = /^\d+$/;

    var escapeRep = '\\$&';
    var escapeAdd = '\\$&$&';

    xm.singleQuoteExp = /([^'\\]*(?:\\.[^'\\]*)*)'/g;
    xm.doubleQuoteExp = /([^"\\]*(?:\\.[^"\\]*)*)"/g;

    function getReplacerFunc(matches, values) {
        return function (match) {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 1); _i++) {
                args[_i] = arguments[_i + 1];
            }
            var i = matches.indexOf(match);
            if (i > -1 && i < values.length) {
                return values[i];
            }
            return match;
        };
    }
    xm.getReplacerFunc = getReplacerFunc;

    function getEscaper(vars) {
        var values = (xm.isString(vars.values) ? vars.values.split('') : vars.values);
        var matches = (xm.isString(vars.matches) ? vars.matches.split('') : vars.matches);
        var replacer = function (match) {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 1); _i++) {
                args[_i] = arguments[_i + 1];
            }
            var i = matches.indexOf(match);
            if (i > -1 && i < values.length) {
                return '\\' + values[i];
            }
            return match;
        };

        var exp = new RegExp('[' + values.map(function (char) {
            return '\\' + char;
        }).join('') + ']', 'g');

        return function (input) {
            return input.replace(exp, replacer);
        };
    }
    xm.getEscaper = getEscaper;

    function getMultiReplacer(vars) {
        var values = vars.values;
        var matches = vars.matches;
        var replacer = function (match) {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 1); _i++) {
                args[_i] = arguments[_i + 1];
            }
            var i = matches.indexOf(match);
            if (i > -1 && i < values.length) {
                return values[i];
            }
            return match;
        };

        var exp = new RegExp(vars.exps.map(function (char) {
            return '(?:' + char + ')';
        }).join('|'), 'g');

        return function (input) {
            return input.replace(exp, replacer);
        };
    }
    xm.getMultiReplacer = getMultiReplacer;

    xm.unprintCC = getEscaper({
        matches: '\b\f\n\r\t\v\0',
        values: 'bfnrtv0'
    });
    xm.unprintNL = getEscaper({
        matches: '\r\n',
        values: 'rn'
    });
    xm.unprintNotNL = getEscaper({
        matches: '\b\f\t\v\0',
        values: 'bftv0'
    });
    xm.unprintNLS = getMultiReplacer({
        exps: ['\\r\\n', '\\n', '\\r'],
        matches: ['\r\n', '\n', '\r'],
        values: ['\\r\\n\r\n', '\\n\n', '\\r\r']
    });

    function quoteSingle(input) {
        return input.replace(xm.singleQuoteExp, '$1\\\'');
    }
    xm.quoteSingle = quoteSingle;

    function quoteDouble(input) {
        return input.replace(xm.doubleQuoteExp, '$1\\"');
    }
    xm.quoteDouble = quoteDouble;

    function quoteSingleWrap(input) {
        return '\'' + input.replace(xm.singleQuoteExp, '$1\\\'') + '\'';
    }
    xm.quoteSingleWrap = quoteSingleWrap;

    function quoteDoubleWrap(input) {
        return '"' + input.replace(xm.doubleQuoteExp, '$1\\"') + '"';
    }
    xm.quoteDoubleWrap = quoteDoubleWrap;

    function escapeControl(input, reAddNewlines) {
        if (typeof reAddNewlines === "undefined") { reAddNewlines = false; }
        input = String(input);
        if (reAddNewlines) {
            return xm.unprintNLS(xm.unprintNotNL(input));
        }
        return xm.unprintCC(input);
    }
    xm.escapeControl = escapeControl;

    function wrapQuotes(input, double) {
        input = escapeControl(input);
        if (double) {
            return quoteDoubleWrap(input);
        }
        return quoteSingleWrap(input);
    }
    xm.wrapQuotes = wrapQuotes;

    function wrapIfComplex(input, double) {
        input = String(input);
        if (!identAnyExp.test(input)) {
            return wrapQuotes(xm.unprintCC(input), double);
        }
        return input;
    }
    xm.wrapIfComplex = wrapIfComplex;

    function trim(value, cutoff) {
        if (typeof cutoff === "undefined") { cutoff = 60; }
        if (cutoff && value.length > cutoff) {
            return value.substr(0, cutoff) + '...';
        }
        return value;
    }
    xm.trim = trim;

    function trimWrap(value, cutoff, double) {
        if (typeof cutoff === "undefined") { cutoff = 60; }
        value = String(value);
        if (cutoff && value.length > cutoff) {
            return xm.wrapQuotes(value.substr(0, cutoff), double) + '...';
        }
        return xm.wrapQuotes(value, double);
    }
    xm.trimWrap = trimWrap;

    var escapableExp = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    var meta = {
        '\b': '\\b',
        '\t': '\\t',
        '\n': '\\n',
        '\f': '\\f',
        '\r': '\\r',
        '"': '\\"',
        '\\': '\\\\'
    };
    var jsonNW = {
        json: true,
        wrap: false,
        quotes: 'double'
    };

    function escapeSimple(str) {
        escapableExp.lastIndex = 0;
        if (escapableExp.test(str)) {
            return str.replace(escapableExp, function (a) {
                var c = meta[a];
                if (typeof c === 'string') {
                    return c;
                }

                return jsesc(a, jsonNW);
            });
        }
        return str;
    }
    xm.escapeSimple = escapeSimple;
})(xm || (xm = {}));
var xm;
(function (xm) {
    'use strict';

    function getFuncLabel(func) {
        var match = /^\s?function ([^( ]*) *\( *([^(]*?) *\)/.exec(func);
        if (match && match.length >= 3) {
            return match[1] + '(' + match[2] + ')';
        }
        if (func.name) {
            return func.name;
        }
        return '<anonymous>';
    }
    xm.getFuncLabel = getFuncLabel;

    function toValueStrim(obj, depth, cutoff) {
        if (typeof depth === "undefined") { depth = 4; }
        if (typeof cutoff === "undefined") { cutoff = 80; }
        var type = xm.typeOf(obj);

        depth--;

        switch (type) {
            case 'boolean':
            case 'regexp':
                return obj.toString();
            case 'null':
            case 'undefined':
                return type;
            case 'number':
                return obj.toString(10);
            case 'string':
                return xm.trimWrap(obj, cutoff, true);
            case 'date':
                return obj.toISOString();
            case 'function':
                return xm.getFuncLabel(obj);
            case 'arguments':
            case 'array': {
                if (depth <= 0) {
                    return '<maximum recursion>';
                }

                return '[' + xm.trim(obj.map(function (value) {
                    return xm.trim(value, depth);
                }).join(','), cutoff) + ']';
            }
            case 'object': {
                if (depth <= 0) {
                    return '<maximum recursion>';
                }

                return xm.trim(String(obj) + ' {' + Object.keys(obj).sort().map(function (key) {
                    return xm.trim(key) + ':' + toValueStrim(obj[key], depth);
                }).join(','), cutoff) + '}';
            }
            default:
                throw (new Error('toValueStrim: cannot serialise type: ' + type));
        }
    }
    xm.toValueStrim = toValueStrim;
})(xm || (xm = {}));
var xm;
(function (xm) {
    'use strict';

    var AssertionError = require('assertion-error');

    function isSha(value) {
        if (typeof value !== 'string') {
            return false;
        }
        return /^[0-9a-f]{40}$/.test(value);
    }
    xm.isSha = isSha;

    function isShaShort(value) {
        if (typeof value !== 'string') {
            return false;
        }
        return /^[0-9a-f]{6,40}$/.test(value);
    }
    xm.isShaShort = isShaShort;

    function isMd5(value) {
        if (typeof value !== 'string') {
            return false;
        }
        return /^[0-9a-f]{32}$/.test(value);
    }
    xm.isMd5 = isMd5;

    var typeOfAssert = xm.getTypeOfMap({
        sha1: isSha,
        sha1Short: isShaShort,
        md5: isMd5
    });

    function assert(pass, message, actual, expected, showDiff, ssf) {
        if (typeof showDiff === "undefined") { showDiff = true; }
        if (!!pass) {
            return;
        }
        if (xm.isString(message)) {
            message = message.replace(/\{([\w]+)\}/gi, function (match, id) {
                switch (id) {
                    case 'a':
                    case 'act':
                    case 'actual':
                        if (arguments.length > 2) {
                            return xm.toValueStrim(actual);
                        }
                        break;
                    case 'e':
                    case 'exp':
                    case 'expected':
                        if (arguments.length > 3) {
                            return xm.toValueStrim(expected);
                        }
                        break;
                    default:
                        return match;
                }
            });
        } else {
            message = '';
        }
        throw new AssertionError(message, { actual: actual, expected: expected, showDiff: showDiff }, ssf);
    }
    xm.assert = assert;

    function throwAssert(message, actual, expected, showDiff, ssf) {
        if (typeof showDiff === "undefined") { showDiff = true; }
        xm.assert(false, message, actual, expected, showDiff, ssf);
    }
    xm.throwAssert = throwAssert;

    function assertVar(value, type, label, opt) {
        if (typeof opt === "undefined") { opt = false; }
        if (arguments.length < 3) {
            throw new AssertionError('expected at least 3 arguments but got "' + arguments.length + '"');
        }
        var valueKind = xm.typeOf(value);
        var typeKind = xm.typeOf(type);

        if (!xm.isValid(value)) {
            if (!opt) {
                throw new AssertionError('expected ' + xm.wrapQuotes(label, true) + ' to be defined as a ' + xm.toValueStrim(type) + ' but got ' + (valueKind === 'number' ? 'NaN' : valueKind));
            }
        } else if (typeKind === 'function') {
            if (!(value instanceof type)) {
                throw new AssertionError('expected ' + xm.wrapQuotes(label, true) + ' to be instanceof ' + xm.getFuncLabel(type) + ' but is a ' + xm.getFuncLabel(value.constructor) + ': ' + xm.toValueStrim(value));
            }
        } else if (typeKind === 'string') {
            if (xm.hasOwnProp(typeOfAssert, type)) {
                var check = typeOfAssert[type];
                if (!check(value)) {
                    throw new AssertionError('expected ' + xm.wrapQuotes(label, true) + ' to be a ' + xm.wrapQuotes(type, true) + ' but got a ' + xm.wrapQuotes(valueKind, true) + ': ' + xm.toValueStrim(value));
                }
            } else {
                throw new AssertionError('unknown type-assertion parameter ' + xm.wrapQuotes(type, true) + ' for ' + xm.toValueStrim(value) + '');
            }
        } else {
            throw new AssertionError('bad type-assertion parameter ' + xm.toValueStrim(type) + ' for ' + xm.wrapQuotes(label, true) + '');
        }
    }
    xm.assertVar = assertVar;
})(xm || (xm = {}));
var git;
(function (git) {
    'use strict';

    var crypto = require('crypto');

    (function (GitUtil) {
        function decodeBlobJson(blobJSON) {
            if (!blobJSON || !blobJSON.encoding) {
                return null;
            }
            switch (blobJSON.encoding) {
                case 'base64':
                    return new Buffer(blobJSON.content, 'base64');
                case 'utf-8':
                case 'utf8':
                default:
                    return new Buffer(blobJSON.content, 'utf8');
            }
        }
        GitUtil.decodeBlobJson = decodeBlobJson;

        function blobShaHex(data, encoding) {
            xm.assertVar(data, Buffer, 'data');
            return crypto.createHash('sha1').update('blob ' + data.length + '\0').update(data, encoding).digest('hex');
        }
        GitUtil.blobShaHex = blobShaHex;
    })(git.GitUtil || (git.GitUtil = {}));
    var GitUtil = git.GitUtil;
})(git || (git = {}));
var xm;
(function (xm) {
    'use strict';

    var hasProp = Object.prototype.hasOwnProperty;

    var KeyValueMap = (function () {
        function KeyValueMap(data) {
            this._store = Object.create(null);
            if (data) {
                this.import(data);
            }
            Object.defineProperty(this, '_store', { enumerable: false, writable: false });
        }
        KeyValueMap.prototype.has = function (key) {
            return hasProp.call(this._store, key);
        };

        KeyValueMap.prototype.get = function (key, alt) {
            if (typeof alt === "undefined") { alt = null; }
            if (typeof key !== 'string') {
                throw new Error('key must be a string');
            }
            if (hasProp.call(this._store, key)) {
                return this._store[key];
            }
            return alt;
        };

        KeyValueMap.prototype.set = function (key, value) {
            this._store[key] = value;
        };

        KeyValueMap.prototype.remove = function (key) {
            if (hasProp.call(this._store, key)) {
                delete this._store[key];
            }
        };

        KeyValueMap.prototype.keys = function () {
            return Object.keys(this._store);
        };

        KeyValueMap.prototype.values = function () {
            var ret = [];
            for (var key in this._store) {
                if (hasProp.call(this._store, key)) {
                    ret.push(this._store[key]);
                }
            }
            return ret;
        };

        KeyValueMap.prototype.clear = function () {
            for (var key in this._store) {
                if (hasProp.call(this._store, key)) {
                    delete this._store[key];
                }
            }
        };

        KeyValueMap.prototype.import = function (data) {
            if (!data || typeof data !== 'object' || Object.prototype.toString.call(data) === '[object Array]') {
                return;
            }
            for (var key in data) {
                if (hasProp.call(data, key)) {
                    this._store[key] = data[key];
                }
            }
        };

        KeyValueMap.prototype.export = function () {
            var ret = {};
            for (var key in this._store) {
                if (hasProp.call(this._store, key)) {
                    ret[key] = this._store[key];
                }
            }
            return ret;
        };
        return KeyValueMap;
    })();
    xm.KeyValueMap = KeyValueMap;
})(xm || (xm = {}));
var xm;
(function (xm) {
    'use strict';

    function eachElem(collection, callback, thisArg) {
        if (typeof thisArg === "undefined") { thisArg = null; }
        for (var i = 0, ii = collection.length; i < ii; i++) {
            if (callback.call(thisArg, collection[i], i, collection) === false) {
                return;
            }
        }
    }
    xm.eachElem = eachElem;

    function eachProp(collection, callback, thisArg) {
        if (typeof thisArg === "undefined") { thisArg = null; }
        for (var prop in collection) {
            if (collection.hasOwnProperty(prop)) {
                if (callback.call(thisArg, collection[prop], prop, collection) === false) {
                    return;
                }
            }
        }
    }
    xm.eachProp = eachProp;

    function reduceArray(collection, memo, callback, thisArg) {
        if (typeof thisArg === "undefined") { thisArg = null; }
        for (var i = 0, ii = collection.length; i < ii; i++) {
            memo = callback.call(thisArg, memo, collection[i], i, collection);
        }
        return memo;
    }
    xm.reduceArray = reduceArray;

    function reduceHash(collection, memo, callback, thisArg) {
        if (typeof thisArg === "undefined") { thisArg = null; }
        for (var prop in collection) {
            if (collection.hasOwnProperty(prop)) {
                memo = callback.call(thisArg, memo, collection[prop], prop, collection);
            }
        }
        return memo;
    }
    xm.reduceHash = reduceHash;

    function mapArray(collection, callback, thisArg) {
        if (typeof thisArg === "undefined") { thisArg = null; }
        var map = [];
        for (var i = 0, ii = collection.length; i < ii; i++) {
            map[i] = callback.call(thisArg, collection[i], i, collection);
        }
        return map;
    }
    xm.mapArray = mapArray;

    function mapHash(collection, callback, thisArg) {
        if (typeof thisArg === "undefined") { thisArg = null; }
        var map = {};
        for (var prop in collection) {
            if (collection.hasOwnProperty(prop)) {
                map[prop] = callback.call(thisArg, collection[prop], prop, collection);
            }
        }
        return map;
    }
    xm.mapHash = mapHash;

    function filterArray(collection, callback, thisArg) {
        if (typeof thisArg === "undefined") { thisArg = null; }
        var map = [];
        for (var i = 0, ii = collection.length; i < ii; i++) {
            if (callback.call(thisArg, collection[i], i, collection)) {
                map.push(collection[i]);
            }
        }
        return map;
    }
    xm.filterArray = filterArray;

    function filterHash(collection, callback, thisArg) {
        if (typeof thisArg === "undefined") { thisArg = null; }
        var res = {};
        for (var prop in collection) {
            if (collection.hasOwnProperty(prop) && callback.call(thisArg, collection[prop], prop, collection)) {
                res[prop] = collection[prop];
            }
        }
        return res;
    }
    xm.filterHash = filterHash;
})(xm || (xm = {}));
var xm;
(function (xm) {
    'use strict';

    function callAsync(callback) {
        var args = [];
        for (var _i = 0; _i < (arguments.length - 1); _i++) {
            args[_i] = arguments[_i + 1];
        }
        process.nextTick(function () {
            callback.apply(null, args);
        });
    }
    xm.callAsync = callAsync;
})(xm || (xm = {}));
var xm;
(function (xm) {
    'use strict';

    function deepFreezeRecursive(object, active) {
        var value, prop;
        active.push(object);
        Object.freeze(object);
        for (prop in object) {
            if (object.hasOwnProperty(prop)) {
                value = object[prop];
                if (xm.isObject(value) || xm.isArray(value)) {
                    if (active.indexOf(object) < 0) {
                        deepFreezeRecursive(value, active);
                    }
                }
            }
        }
    }

    var ObjectUtil = (function () {
        function ObjectUtil() {
        }
        ObjectUtil.hasOwnProp = function (obj, prop) {
            return Object.prototype.hasOwnProperty.call(obj, prop);
        };

        ObjectUtil.defineProp = function (object, property, settings) {
            Object.defineProperty(object, property, settings);
        };

        ObjectUtil.defineProps = function (object, propertyNames, settings) {
            propertyNames.forEach(function (property) {
                ObjectUtil.defineProp(object, property, settings);
            });
        };

        ObjectUtil.hidePrefixed = function (object, ownOnly) {
            if (typeof ownOnly === "undefined") { ownOnly = true; }
            for (var property in object) {
                if (property.charAt(0) === '_' && (!ownOnly || ObjectUtil.hasOwnProp(object, property))) {
                    ObjectUtil.defineProp(object, property, { enumerable: false });
                }
            }
        };
        ObjectUtil.hideProps = function (object, props) {
            props.forEach(function (property) {
                Object.defineProperty(object, property, { enumerable: false });
            });
        };

        ObjectUtil.lockProps = function (object, props) {
            props.forEach(function (property) {
                Object.defineProperty(object, property, { writable: false });
            });
        };

        ObjectUtil.freezeProps = function (object, props) {
            props.forEach(function (property) {
                Object.defineProperty(object, property, { writable: false });
                Object.freeze(object[property]);
            });
        };

        ObjectUtil.deepFreeze = function (object) {
            if (xm.isObject(object) || xm.isArray(object)) {
                deepFreezeRecursive(object, []);
            }
        };
        return ObjectUtil;
    })();
    xm.ObjectUtil = ObjectUtil;
})(xm || (xm = {}));
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var xm;
(function (xm) {
    (function (styler) {
        function clean(str) {
            return '' + str;
        }
        styler.clean = clean;

        var NoStyler = (function () {
            function NoStyler() {
            }
            NoStyler.prototype.ok = function (str) {
                return clean(str);
            };

            NoStyler.prototype.fail = function (str) {
                return clean(str);
            };

            NoStyler.prototype.warn = function (str) {
                return clean(str);
            };

            NoStyler.prototype.error = function (str) {
                return clean(str);
            };

            NoStyler.prototype.warning = function (str) {
                return clean(str);
            };

            NoStyler.prototype.success = function (str) {
                return clean(str);
            };

            NoStyler.prototype.accent = function (str) {
                return clean(str);
            };

            NoStyler.prototype.plain = function (str) {
                return clean(str);
            };

            NoStyler.prototype.zero = function () {
                return '';
            };
            return NoStyler;
        })();
        styler.NoStyler = NoStyler;

        var PlainStyler = (function (_super) {
            __extends(PlainStyler, _super);
            function PlainStyler() {
                _super.apply(this, arguments);
            }
            PlainStyler.prototype.ok = function (str) {
                return clean(str).toLocaleUpperCase();
            };

            PlainStyler.prototype.warn = function (str) {
                return clean(str).toLocaleUpperCase();
            };

            PlainStyler.prototype.fail = function (str) {
                return clean(str).toLocaleUpperCase();
            };
            return PlainStyler;
        })(NoStyler);
        styler.PlainStyler = PlainStyler;

        var WrapStyler = (function () {
            function WrapStyler() {
                this.styles = {};
            }
            WrapStyler.prototype.ok = function (str) {
                return this.success(clean(str));
            };

            WrapStyler.prototype.warn = function (str) {
                return this.warning(clean(str));
            };

            WrapStyler.prototype.fail = function (str) {
                return this.error(clean(str));
            };

            WrapStyler.prototype.error = function (str) {
                return this.wrap(clean(str), 'red');
            };

            WrapStyler.prototype.warning = function (str) {
                return this.wrap(clean(str), 'yellow');
            };

            WrapStyler.prototype.success = function (str) {
                return this.wrap(clean(str), 'green');
            };

            WrapStyler.prototype.accent = function (str) {
                return this.wrap(clean(str), 'cyan');
            };

            WrapStyler.prototype.plain = function (str) {
                return clean(str);
            };

            WrapStyler.prototype.zero = function () {
                return '';
            };

            WrapStyler.prototype.wrap = function (str, style) {
                if (!this.styles.hasOwnProperty(style)) {
                    return clean(str);
                }
                var tmp = this.styles[style];
                return tmp[0] + clean(str) + tmp[1];
            };
            return WrapStyler;
        })();
        styler.WrapStyler = WrapStyler;

        styler.ansiWrapTable = {
            'bold': ['\033[1m', '\033[22m'],
            'italic': ['\033[3m', '\033[23m'],
            'underline': ['\033[4m', '\033[24m'],
            'inverse': ['\033[7m', '\033[27m'],
            'white': ['\033[37m', '\033[39m'],
            'grey': ['\033[90m', '\033[39m'],
            'black': ['\033[30m', '\033[39m'],
            'blue': ['\033[34m', '\033[39m'],
            'cyan': ['\033[36m', '\033[39m'],
            'green': ['\033[32m', '\033[39m'],
            'magenta': ['\033[35m', '\033[39m'],
            'red': ['\033[31m', '\033[39m'],
            'yellow': ['\033[33m', '\033[39m']
        };

        var ANSIWrapStyler = (function (_super) {
            __extends(ANSIWrapStyler, _super);
            function ANSIWrapStyler() {
                _super.call(this);
                this.styles = styler.ansiWrapTable;
            }
            return ANSIWrapStyler;
        })(WrapStyler);
        styler.ANSIWrapStyler = ANSIWrapStyler;

        var ANSIStyler = (function () {
            function ANSIStyler() {
            }
            ANSIStyler.prototype.ok = function (str) {
                return '\033[32m' + clean(str) + '\033[39m';
            };

            ANSIStyler.prototype.fail = function (str) {
                return '\033[31m' + clean(str) + '\033[39m';
            };

            ANSIStyler.prototype.warn = function (str) {
                return '\033[33m' + clean(str) + '\033[39m';
            };

            ANSIStyler.prototype.error = function (str) {
                return '\033[31m' + clean(str) + '\033[39m';
            };

            ANSIStyler.prototype.warning = function (str) {
                return '\033[33m' + clean(str) + '\033[39m';
            };

            ANSIStyler.prototype.success = function (str) {
                return '\033[32m' + clean(str) + '\033[39m';
            };

            ANSIStyler.prototype.accent = function (str) {
                return '\033[36m' + clean(str) + '\033[39m';
            };

            ANSIStyler.prototype.plain = function (str) {
                return clean(str);
            };

            ANSIStyler.prototype.zero = function () {
                return '';
            };
            return ANSIStyler;
        })();
        styler.ANSIStyler = ANSIStyler;

        styler.htmlWrapTable = {
            'bold': ['<b>', '</b>'],
            'italic': ['<i>', '</i>'],
            'underline': ['<u>', '</u>'],
            'inverse': ['<span style="background-color:black;color:white;">', '</span>'],
            'white': ['<span style="color:white;">', '</span>'],
            'grey': ['<span style="color:grey;">', '</span>'],
            'black': ['<span style="color:black;">', '</span>'],
            'blue': ['<span style="color:blue;">', '</span>'],
            'cyan': ['<span style="color:cyan;">', '</span>'],
            'green': ['<span style="color:green;">', '</span>'],
            'magenta': ['<span style="color:magenta;">', '</span>'],
            'red': ['<span style="color:red;">', '</span>'],
            'yellow': ['<span style="color:yellow;">', '</span>']
        };

        var HTMLWrapStyler = (function (_super) {
            __extends(HTMLWrapStyler, _super);
            function HTMLWrapStyler() {
                _super.call(this);
                this.styles = styler.htmlWrapTable;
            }
            return HTMLWrapStyler;
        })(WrapStyler);
        styler.HTMLWrapStyler = HTMLWrapStyler;

        var CSSStyler = (function (_super) {
            __extends(CSSStyler, _super);
            function CSSStyler(prefix) {
                _super.call(this);
                if (typeof prefix === 'string') {
                    this.prefix = prefix;
                } else {
                    this.prefix = 'styler-';
                }
            }
            CSSStyler.prototype.ok = function (str) {
                return this.wrap(str, 'ok');
            };

            CSSStyler.prototype.warn = function (str) {
                return this.wrap(str, 'warn');
            };

            CSSStyler.prototype.fail = function (str) {
                return this.wrap(str, 'fail');
            };

            CSSStyler.prototype.error = function (str) {
                return this.wrap(str, 'error');
            };

            CSSStyler.prototype.warning = function (str) {
                return this.wrap(str, 'warning');
            };

            CSSStyler.prototype.success = function (str) {
                return this.wrap(str, 'success');
            };

            CSSStyler.prototype.accent = function (str) {
                return this.wrap(str, 'accent');
            };

            CSSStyler.prototype.plain = function (str) {
                return this.wrap(str, 'plain');
            };

            CSSStyler.prototype.wrap = function (str, style) {
                return '<span class="' + this.prefix + style + '">' + clean(str) + '</span>';
            };
            return CSSStyler;
        })(WrapStyler);
        styler.CSSStyler = CSSStyler;

        var DevStyler = (function () {
            function DevStyler() {
            }
            DevStyler.prototype.ok = function (str) {
                return '[ok|' + clean(str) + ']';
            };

            DevStyler.prototype.fail = function (str) {
                return '[fail|' + clean(str) + ']';
            };

            DevStyler.prototype.warn = function (str) {
                return '[warn|' + clean(str) + ']';
            };

            DevStyler.prototype.error = function (str) {
                return '[error|' + clean(str) + ']';
            };

            DevStyler.prototype.warning = function (str) {
                return '[warning|' + clean(str) + ']';
            };

            DevStyler.prototype.success = function (str) {
                return '[success|' + clean(str) + ']';
            };

            DevStyler.prototype.accent = function (str) {
                return '[accent|' + clean(str) + ']';
            };

            DevStyler.prototype.plain = function (str) {
                return '[plain|' + clean(str) + ']';
            };

            DevStyler.prototype.zero = function () {
                return '[zero]';
            };
            return DevStyler;
        })();
        styler.DevStyler = DevStyler;
    })(xm.styler || (xm.styler = {}));
    var styler = xm.styler;
})(xm || (xm = {}));
var xm;
(function (xm) {
    (function (writer) {
        var lineBreak = /\r?\n/;

        var LineWriter = (function () {
            function LineWriter() {
                this.textBuffer = '';
            }
            LineWriter.prototype.start = function () {
                this.textBuffer = '';
            };

            LineWriter.prototype.finalise = function () {
                this.flushLineBuffer();
            };

            LineWriter.prototype.write = function (str) {
                if (str === '') {
                    return;
                }
                this.textBuffer += str;

                var arr = this.textBuffer.split(lineBreak);
                var len = arr.length;
                if (len > 0) {
                    for (var i = 0; i < len - 1; i++) {
                        this.flushLine(arr[i]);
                    }
                    this.textBuffer = arr[len - 1];
                }
            };

            LineWriter.prototype.writeln = function (str) {
                if (arguments.length === 0 || (this.textBuffer === '' && str === '')) {
                    this.flushLine('');
                    return;
                }
                this.textBuffer += str;

                var arr = this.textBuffer.split(lineBreak);
                var len = arr.length;
                if (len > 0) {
                    for (var i = 0; i < len; i++) {
                        this.flushLine(arr[i]);
                    }
                    this.textBuffer = '';
                }
            };

            LineWriter.prototype.flushLine = function (str) {
            };

            LineWriter.prototype.flushLineBuffer = function () {
                if (this.textBuffer.length > 0) {
                    var arr = this.textBuffer.split(lineBreak);
                    var len = arr.length;
                    if (len > 0) {
                        for (var i = 0; i < len; i++) {
                            this.flushLine(arr[i]);
                        }
                        this.textBuffer = '';
                    }
                }
            };
            return LineWriter;
        })();
        writer.LineWriter = LineWriter;

        var ConsoleLineWriter = (function (_super) {
            __extends(ConsoleLineWriter, _super);
            function ConsoleLineWriter() {
                _super.apply(this, arguments);
            }
            ConsoleLineWriter.prototype.flushLine = function (str) {
                console.log(str);
            };
            return ConsoleLineWriter;
        })(LineWriter);
        writer.ConsoleLineWriter = ConsoleLineWriter;

        var BufferWriter = (function () {
            function BufferWriter(seperator) {
                if (typeof seperator !== 'string') {
                    this.seperator = '\n';
                } else {
                    this.seperator = seperator;
                }
            }
            BufferWriter.prototype.start = function () {
                this.buffer = '';
            };

            BufferWriter.prototype.write = function (str) {
                if (str) {
                    this.buffer += str;
                }
            };

            BufferWriter.prototype.writeln = function (str) {
                if (arguments.length > 0 && str.length > 0) {
                    this.buffer += str + this.seperator;
                } else {
                    this.buffer += this.seperator;
                }
            };

            BufferWriter.prototype.finalise = function () {
            };
            return BufferWriter;
        })();
        writer.BufferWriter = BufferWriter;

        var ConsoleBufferWriter = (function (_super) {
            __extends(ConsoleBufferWriter, _super);
            function ConsoleBufferWriter() {
                _super.apply(this, arguments);
            }
            ConsoleBufferWriter.prototype.finalise = function () {
                if (this.buffer.length > 0) {
                    console.log(this.buffer);
                }
                this.buffer = '';
            };
            return ConsoleBufferWriter;
        })(BufferWriter);
        writer.ConsoleBufferWriter = ConsoleBufferWriter;

        var WritableStreamWriter = (function (_super) {
            __extends(WritableStreamWriter, _super);
            function WritableStreamWriter(stream) {
                _super.call(this);
                this.stream = stream;
            }
            WritableStreamWriter.prototype.start = function () {
            };

            WritableStreamWriter.prototype.finalise = function () {
            };

            WritableStreamWriter.prototype.flushLine = function (str) {
                if (str.length > 0) {
                    this.stream.write(str + '\n', 'utf8');
                }
            };
            return WritableStreamWriter;
        })(LineWriter);
        writer.WritableStreamWriter = WritableStreamWriter;

        var NullWriter = (function () {
            function NullWriter() {
            }
            NullWriter.prototype.start = function () {
            };

            NullWriter.prototype.finalise = function () {
            };

            NullWriter.prototype.write = function (str) {
            };

            NullWriter.prototype.writeln = function (str) {
            };
            return NullWriter;
        })();
        writer.NullWriter = NullWriter;
    })(xm.writer || (xm.writer = {}));
    var writer = xm.writer;
})(xm || (xm = {}));
var xm;
(function (xm) {
    var util = require('util');

    var StyledOut = (function () {
        function StyledOut(writer, styler) {
            if (typeof writer === "undefined") { writer = null; }
            if (typeof styler === "undefined") { styler = null; }
            this.nibs = {
                arrow: '-> ',
                double: '>> ',
                bullet: ' - ',
                edge: ' | ',
                none: '   '
            };
            this._writer = (writer || new xm.writer.ConsoleLineWriter());
            this._styler = (styler || new xm.styler.ANSIStyler());

            this._writer.start();

            xm.ObjectUtil.hidePrefixed(this);
        }
        StyledOut.prototype.write = function (str) {
            this._writer.write(this._styler.plain(str));
            return this;
        };

        StyledOut.prototype.line = function (str) {
            if (typeof str === "undefined") { str = ''; }
            this._writer.writeln(this._styler.plain(str));
            return this;
        };

        StyledOut.prototype.ln = function () {
            this._writer.writeln(this._styler.zero());
            return this;
        };

        StyledOut.prototype.span = function (str) {
            this._writer.write(this._styler.plain(str));
            return this;
        };

        StyledOut.prototype.block = function (str) {
            this._writer.writeln(this._styler.plain(str));
            return this;
        };

        StyledOut.prototype.clear = function () {
            this._writer.writeln(this._styler.zero());
            this._writer.writeln(this._styler.zero());
            return this;
        };

        StyledOut.prototype.ruler = function () {
            this._writer.writeln('--------');
            return this;
        };

        StyledOut.prototype.ruler2 = function () {
            this._writer.writeln('----');
            return this;
        };

        StyledOut.prototype.h1 = function (str) {
            this._writer.writeln(this._styler.accent(str));
            this.ruler();
            this._writer.writeln();
            return this;
        };

        StyledOut.prototype.h2 = function (str) {
            this._writer.writeln(this._styler.accent(str));
            this.ruler();
            return this;
        };

        StyledOut.prototype.plain = function (str) {
            this._writer.writeln(this._styler.plain(str));
            return this;
        };

        StyledOut.prototype.accent = function (str) {
            this._writer.write(this._styler.accent(str));
            return this;
        };

        StyledOut.prototype.space = function () {
            this._writer.write(this._styler.plain(' '));
            return this;
        };

        StyledOut.prototype.success = function (str) {
            this._writer.write(this._styler.success(str));
            return this;
        };

        StyledOut.prototype.warning = function (str) {
            this._writer.write(this._styler.warning(str));
            return this;
        };

        StyledOut.prototype.error = function (str) {
            this._writer.write(this._styler.error(str));
            return this;
        };

        StyledOut.prototype.ok = function (str) {
            this._writer.writeln(this._styler.ok(str));
            return this;
        };

        StyledOut.prototype.warn = function (str) {
            this._writer.writeln(this._styler.warn(str));
            return this;
        };

        StyledOut.prototype.fail = function (str) {
            this._writer.writeln(this._styler.fail(str));
            return this;
        };

        StyledOut.prototype.cond = function (condition, str, alt) {
            if (condition) {
                this._writer.write(this._styler.plain(str));
            } else if (arguments.length > 2) {
                this._writer.write(this._styler.plain(alt));
            }
            return this;
        };

        StyledOut.prototype.inspect = function (value, depth, showHidden) {
            if (typeof depth === "undefined") { depth = 4; }
            if (typeof showHidden === "undefined") { showHidden = false; }
            this._writer.writeln(this._styler.plain(util.inspect(value, { showHidden: showHidden, depth: depth })));
            return this;
        };

        StyledOut.prototype.stringWrap = function (str) {
            this._writer.write(this._styler.plain(xm.wrapIfComplex(str)));
            return this;
        };

        StyledOut.prototype.label = function (label) {
            this._writer.write(this._styler.plain(xm.wrapIfComplex(label) + ': '));
            return this;
        };

        StyledOut.prototype.indent = function () {
            this._writer.write(this.nibs.none);
            return this;
        };

        StyledOut.prototype.bullet = function () {
            this._writer.write(this._styler.accent(this.nibs.bullet));
            return this;
        };

        StyledOut.prototype.index = function (num) {
            this._writer.write(this._styler.plain(String(num) + +': '));
            return this;
        };

        StyledOut.prototype.info = function (accent) {
            if (typeof accent === "undefined") { accent = false; }
            if (accent) {
                this._writer.write(this._styler.accent(this.nibs.arrow));
            } else {
                this._writer.write(this._styler.plain(this.nibs.arrow));
            }
            return this;
        };

        StyledOut.prototype.report = function (accent) {
            if (typeof accent === "undefined") { accent = false; }
            if (accent) {
                this._writer.write(this._styler.accent(this.nibs.double));
            } else {
                this._writer.write(this._styler.plain(this.nibs.double));
            }
            return this;
        };

        StyledOut.prototype.unfunk = function () {
            this.useStyler(new xm.styler.NoStyler());
            return this;
        };

        StyledOut.prototype.finalise = function () {
            this._writer.finalise();
        };

        StyledOut.prototype.useWriter = function (writer) {
            xm.assertVar(writer, 'object', 'writer');
            this._writer.finalise();
            this._writer = writer;
            this._writer.start();
            return this;
        };

        StyledOut.prototype.useStyler = function (styler) {
            xm.assertVar(styler, 'object', 'styler');
            this._styler = styler;
            return this;
        };

        Object.defineProperty(StyledOut.prototype, "writer", {
            get: function () {
                return this._writer;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(StyledOut.prototype, "styler", {
            get: function () {
                return this._styler;
            },
            enumerable: true,
            configurable: true
        });
        return StyledOut;
    })();
    xm.StyledOut = StyledOut;
})(xm || (xm = {}));
var xm;
(function (xm) {
    'use strict';

    function pad(number) {
        var r = String(number);
        if (r.length === 1) {
            r = '0' + r;
        }
        return r;
    }

    (function (DateUtil) {
        function toNiceUTC(date) {
            return date.getUTCFullYear() + '-' + pad(date.getUTCMonth() + 1) + '-' + pad(date.getUTCDate()) + ' ' + pad(date.getUTCHours()) + ':' + pad(date.getUTCMinutes());
        }
        DateUtil.toNiceUTC = toNiceUTC;
    })(xm.DateUtil || (xm.DateUtil = {}));
    var DateUtil = xm.DateUtil;
})(xm || (xm = {}));
var xm;
(function (xm) {
    'use strict';

    var StatCounter = (function () {
        function StatCounter(log) {
            this.stats = Object.create(null);
            this.log = xm.log;
            this.log = log;
        }
        StatCounter.prototype.count = function (id, label) {
            var value = (id in this.stats ? this.stats[id] + 1 : 1);
            this.stats[id] = value;

            if (this.log) {
                this.log.debug(id + ': ' + value + (label ? ': ' + label : ''));
            }
            return value;
        };

        StatCounter.prototype.get = function (id) {
            if (id in this.stats) {
                return this.stats[id];
            }
            return 0;
        };

        StatCounter.prototype.has = function (id) {
            return (id in this.stats);
        };

        StatCounter.prototype.zero = function () {
            var _this = this;
            Object.keys(this.stats).forEach(function (id) {
                _this.stats[id] = 0;
            });
        };

        StatCounter.prototype.total = function () {
            var _this = this;
            return Object.keys(this.stats).reduce(function (memo, id) {
                return memo + _this.stats[id];
            }, 0);
        };

        StatCounter.prototype.counterNames = function () {
            return Object.keys(this.stats);
        };

        StatCounter.prototype.hasAllZero = function () {
            var _this = this;
            return !Object.keys(this.stats).some(function (id) {
                return _this.stats[id] !== 0;
            });
        };

        StatCounter.prototype.clear = function () {
            this.stats = Object.create(null);
        };

        StatCounter.prototype.getReport = function (label) {
            var _this = this;
            return (label ? label + ':\n' : '') + Object.keys(this.stats).sort().reduce(function (memo, id) {
                memo.push(id + ': ' + _this.stats[id]);
                return memo;
            }, []).join('\n');
        };
        return StatCounter;
    })();
    xm.StatCounter = StatCounter;
})(xm || (xm = {}));
var xm;
(function (xm) {
    'use strict';

    function padL(input, len, char) {
        var char = String(char).charAt(0);
        var input = String(input);
        while (input.length < len) {
            input = char + input;
        }
        return input;
    }

    function valueMap(data) {
        var out = Object.keys(data).reduce(function (memo, key) {
            if (xm.isValueType(data[key])) {
                memo[key] = data[key];
            }
            return memo;
        }, Object.create(null));
        return out;
    }
    xm.valueMap = valueMap;

    xm.Level = {
        start: 'start',
        complete: 'complete',
        failure: 'failure',
        skip: 'skip',
        event: 'event',
        error: 'error',
        warning: 'warning',
        success: 'success',
        status: 'status',
        promise: 'promise',
        resolve: 'resolve',
        reject: 'reject',
        notify: 'notify',
        debug: 'debug',
        log: 'log'
    };
    xm.Level = xm.valueMap(xm.Level);

    Object.freeze(xm.Level);

    xm.startTime = Date.now();
    Object.defineProperty(xm, 'startTime', { writable: false });

    var EventLog = (function () {
        function EventLog(prefix, label, logger) {
            if (typeof prefix === "undefined") { prefix = ''; }
            if (typeof label === "undefined") { label = ''; }
            this._items = [];
            this.logEnabled = false;
            this._trackEnabled = false;
            this._trackLimit = 100;
            this._trackPrune = 30;
            this._label = label;
            this._prefix = (prefix ? prefix + '-' : '');
            this.logger = logger || (label ? xm.getLogger(this._label) : xm.log);
            this._startAt = Date.now();
        }
        EventLog.prototype.start = function (type, message, data) {
            return this.track(xm.Level.start, type, message, data);
        };

        EventLog.prototype.promise = function (promise, type, message, data) {
            var _this = this;
            promise.then(function () {
                return _this.track(xm.Level.resolve, type, message, data, promise);
            }, function (err) {
                return _this.track(xm.Level.reject, type, message, err, promise);
            }, function (note) {
                return _this.track(xm.Level.notify, type, message, note, promise);
            });
            return this.track(xm.Level.promise, type, message, data, promise);
        };

        EventLog.prototype.complete = function (type, message, data) {
            return this.track(xm.Level.complete, type, message, data);
        };

        EventLog.prototype.failure = function (type, message, data) {
            return this.track(xm.Level.complete, type, message, data);
        };

        EventLog.prototype.event = function (type, message, data) {
            return this.track(xm.Level.event, type, message, data);
        };

        EventLog.prototype.skip = function (type, message, data) {
            return this.track(xm.Level.skip, type, message, data);
        };

        EventLog.prototype.error = function (type, message, data) {
            return this.track(xm.Level.error, type, message, data);
        };

        EventLog.prototype.warning = function (type, message, data) {
            return this.track(xm.Level.warning, type, message, data);
        };

        EventLog.prototype.success = function (type, message, data) {
            return this.track(xm.Level.success, type, message, data);
        };

        EventLog.prototype.status = function (type, message, data) {
            return this.track(xm.Level.status, type, message, data);
        };

        EventLog.prototype.log = function (type, message, data) {
            return this.track(xm.Level.log, type, message, data);
        };

        EventLog.prototype.debug = function (type, message, data) {
            return this.track(xm.Level.debug, type, message, data);
        };

        EventLog.prototype.track = function (action, type, message, data, group) {
            var item = new EventLogItem();
            item.type = this._prefix + type;
            item.action = action;
            item.message = message;
            item.data = data;
            item.time = (Date.now() - xm.startTime);
            item.group = group;

            Object.freeze(item);

            if (this._trackEnabled) {
                this._items.push(item);
                this.trim();
            }
            if (this.logEnabled) {
                this.logger.status(this.getItemString(item));
            }
            return this;
        };

        EventLog.prototype.trim = function (all) {
            if (typeof all === "undefined") { all = false; }
            if (all) {
                this._items.splice(0, this._items.length);
            } else if (this._trackLimit > 0 && this._items.length > this._trackLimit + this._trackPrune) {
                this._items.splice(this._trackLimit, this._items.length - this._trackPrune);
            }
        };

        EventLog.prototype.reset = function () {
            this._startAt = Date.now();
            this._items.splice(0, this._items.length);
        };

        EventLog.prototype.setTrack = function (enabled, limit, prune) {
            if (typeof limit === "undefined") { limit = NaN; }
            if (typeof prune === "undefined") { prune = NaN; }
            this._trackEnabled = enabled;
            this._trackLimit = (isNaN(limit) ? this._trackLimit : limit);
            this._trackPrune = (isNaN(prune) ? this._trackPrune : prune);
        };

        EventLog.prototype.getItemString = function (item) {
            var msg = padL(item.index, 6, '0') + ' ' + item.action + ': ' + item.type;

            if (xm.isValid(item.message) && item.message.length > 0) {
                msg += ': ' + xm.trimWrap(item.message, 80, true);
            }
            if (xm.isValid(item.data)) {
                msg += ': ' + xm.toValueStrim(item.data);
            }
            return msg;
        };

        EventLog.prototype.getHistory = function () {
            var _this = this;
            var memo = [];
            if (this._label) {
                memo.push(this._label + '(' + this._items.length + ')');
            }
            return this._items.reduce(function (memo, item) {
                memo.push(_this.getItemString(item));
                return memo;
            }, memo).join('\n');
        };

        EventLog.prototype.getStats = function () {
            var ret = new xm.StatCounter();
            this._items.forEach(function (item) {
                ret.count(item.action);
            });
            return ret;
        };

        EventLog.prototype.getItems = function () {
            return (this._trackLimit > 0 ? this._items.slice(0, this._trackLimit) : this._items.slice(0));
        };

        EventLog.prototype.getReport = function (label) {
            return this.getStats().getReport(label);
        };
        return EventLog;
    })();
    xm.EventLog = EventLog;

    var itemCounter = 0;

    var EventLogItem = (function () {
        function EventLogItem() {
            this.index = (++itemCounter);
        }
        EventLogItem.prototype.toString = function () {
            return this.action + ':' + this.type + ' #' + this.index;
        };
        return EventLogItem;
    })();
    xm.EventLogItem = EventLogItem;
})(xm || (xm = {}));
var xm;
(function (xm) {
    'use strict';

    var path = require('path');

    (function (stack) {
        var stackExp = /^ *at (.*?) \((.*?)(?::(\d+))?(?::(\d+))?\)$/gm;

        var Stackline = (function () {
            function Stackline() {
                this.line = NaN;
                this.column = NaN;
            }
            Stackline.prototype.getLink = function () {
                if (!this.file) {
                    return '';
                }
                if (isNaN(this.line)) {
                    return this.file;
                }
                var ret = '[' + this.line;
                if (!isNaN(this.column)) {
                    ret += ',' + this.column;
                }
                return this.file + ret + ']';
            };
            return Stackline;
        })();
        stack.Stackline = Stackline;

        function getRawStack(err) {
            err = err || new Error();
            if (err.stack) {
                if (typeof (chrome) !== 'undefined' || typeof (process) !== 'undefined') {
                    return err.stack.replace(/\n[^\n]*/, '');
                } else if (typeof (Components) !== 'undefined') {
                    return err.stack.substring(err.stack.indexOf('\n') + 1);
                } else {
                    return err.stack;
                }
            }
            return '';
        }
        stack.getRawStack = getRawStack;

        function isAbsolute(str) {
            str = path.normalize(str);
            var resolve = path.resolve(str);
            if (resolve === str) {
                return true;
            }
            return false;
        }

        function trimInternalLines(lines) {
            var cut = lines.length - 1;
            while (cut > 0) {
                var line = lines[cut];
                if (!line.internal) {
                    break;
                }
                cut--;
            }
            return lines.slice(0, cut + 1);
        }
        stack.trimInternalLines = trimInternalLines;

        function lineFromMatch(match) {
            var len = match.length;

            var line = new Stackline();
            line.call = match[1];

            line.file = len > 1 ? match[2] : '';

            line.line = len > 2 ? parseInt(match[3], 10) : NaN;
            line.column = len > 3 ? parseInt(match[4], 10) : NaN;

            line.link = line.getLink();

            line.absolute = isAbsolute(line.file);
            line.internal = !line.absolute;
            return line;
        }

        function getStackLines(keep, offset, trim, err) {
            if (typeof keep === "undefined") { keep = 0; }
            if (typeof offset === "undefined") { offset = 0; }
            if (typeof trim === "undefined") { trim = false; }
            var stack = getRawStack(err);

            var trimTop = 2 + offset;
            var keepBottom = keep + offset;

            var line;
            var lines = [];
            var match;

            stackExp.lastIndex = 0;

            while ((match = stackExp.exec(stack))) {
                stackExp.lastIndex = match.index + match[0].length;

                trimTop--;
                if (trimTop > 0) {
                    continue;
                }
                line = lineFromMatch(match);

                lines.push(line);

                if (keep > 0) {
                    keepBottom--;
                    if (keepBottom <= 0) {
                        break;
                    }
                }
            }
            if (trim) {
                lines = trimInternalLines(lines);
            }
            return lines;
        }
        stack.getStackLines = getStackLines;
    })(xm.stack || (xm.stack = {}));
    var stack = xm.stack;
})(xm || (xm = {}));
var xm;
(function (xm) {
    'use strict';

    var util = require('util');

    xm.consoleOut = new xm.StyledOut();

    xm.log;

    function writeMulti(logger, args) {
        var ret = [];
        for (var i = 0, ii = args.length; i < ii; i++) {
            var value = args[i];
            if (value && typeof value === 'object') {
                ret.push(util.inspect(value, { showHidden: false, depth: 8 }));
            } else {
                value = String(value);
                if (value.length === 0) {
                    continue;
                }
                ret.push(value);
            }
        }
        if (ret.length > 0) {
            logger.out.line(ret.join('; '));
        }
    }

    function getLogger(label) {
        label = arguments.length > 0 ? (String(label) + ' ') : '';

        var precall = function () {
        };

        var plain = function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            if (logger.enabled) {
                precall();
                writeMulti(logger, args);
            }
        };

        var doLog = function (logger, args) {
            if (args.length > 0) {
                writeMulti(logger, args);
            }
        };

        var logger = (function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            if (logger.enabled) {
                plain.apply(null, args);
            }
        });
        logger.out = xm.consoleOut;
        logger.enabled = true;

        logger.log = plain;

        logger.ok = function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            if (logger.enabled) {
                precall();
                logger.out.span('-> ').success(label + 'ok ');
                doLog(logger, args);
            }
        };
        logger.warn = function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            if (logger.enabled) {
                precall();
                logger.out.span('-> ').warning(label + 'warning ');
                doLog(logger, args);
            }
        };
        logger.error = function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            if (logger.enabled) {
                precall();
                logger.out.span('-> ').error(label + 'error ');
                doLog(logger, args);
            }
        };
        logger.debug = function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            if (logger.enabled) {
                precall();
                logger.out.span('-> ').accent(label + 'debug ');
                doLog(logger, args);
            }
        };
        logger.status = function () {
            var args = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                args[_i] = arguments[_i + 0];
            }
            if (logger.enabled) {
                precall();
                logger.out.accent('-> ').span(label + ' ');
                doLog(logger, args);
            }
        };
        logger.inspect = function (value, depth, label) {
            if (typeof depth === "undefined") { depth = 3; }
            if (logger.enabled) {
                precall();
                logger.out.span('-> ').cond(arguments.length > 2, label + ' ').inspect(value, depth);
            }
        };
        logger.json = function (value, label) {
            if (logger.enabled) {
                precall();
                logger.out.span('-> ').cond(arguments.length > 2, label + ' ').block(JSON.stringify(value, null, 3));
            }
        };

        return logger;
    }
    xm.getLogger = getLogger;

    xm.log = getLogger();
    Object.defineProperty(xm, 'log', { writable: false });
})(xm || (xm = {}));
var xm;
(function (xm) {
    'use strict';

    var optimist = require('optimist');
    var jsesc = require('jsesc');
    var Q = require('q');
    var exitProcess = require('exit');

    var Table = require('easy-table');

    xm.converStringMap = Object.create(null);

    var splitSV = /[\t ]*[,][\t ]*/g;

    xm.converStringMap.number = function (input) {
        var num = parseFloat(input);
        if (isNaN(num)) {
            throw new Error('input is NaN and not float');
        }
        return num;
    };
    xm.converStringMap.int = function (input) {
        var num = parseInt(input, 10);
        if (isNaN(num)) {
            throw new Error('input is NaN and not integer');
        }
        return num;
    };
    xm.converStringMap.boolean = function (input) {
        input = ('' + input).toLowerCase();
        if (input === '' || input === '0') {
            return false;
        }
        switch (input) {
            case 'false':
            case 'null':
            case 'nan':
            case 'undefined':

            case 'no':
            case 'off':
            case 'disabled':
                return false;
        }
        return true;
    };
    xm.converStringMap.flag = function (input) {
        if (xm.isUndefined(input) || input === '') {
            return true;
        }
        return xm.converStringMap.boolean(input);
    };
    xm.converStringMap['number[]'] = function (input) {
        return input.split(splitSV).map(function (value) {
            return xm.converStringMap.number(value);
        });
    };
    xm.converStringMap['int[]'] = function (input) {
        return input.split(splitSV).map(function (value) {
            return xm.converStringMap.int(value);
        });
    };
    xm.converStringMap['string[]'] = function (input) {
        return input.split(splitSV);
    };
    xm.converStringMap.json = function (input) {
        return JSON.parse(input);
    };

    function convertStringTo(input, type) {
        if (xm.hasOwnProp(xm.converStringMap, type)) {
            return xm.converStringMap[type](input);
        }
        return input;
    }
    xm.convertStringTo = convertStringTo;

    var ExposeContext = (function () {
        function ExposeContext(expose, argv, command) {
            this.expose = expose;
            this.command = command;
            this.argv = argv;
            this.out = this.expose.output;
        }
        ExposeContext.prototype.hasArg = function (name) {
            return xm.hasOwnProp(this.argv, name);
        };

        ExposeContext.prototype.getArgRaw = function (name, alt) {
            if (xm.hasOwnProp(this.argv, name)) {
                return this.argv[name];
            }
            return alt;
        };

        ExposeContext.prototype.getArg = function (name, alt) {
            if (xm.hasOwnProp(this.argv, name)) {
                if (this.expose.options.has(name)) {
                    var option = this.expose.options.get(name);
                    if (option.type) {
                        return xm.convertStringTo(this.argv[name], option.type);
                    }
                }
                return this.argv[name];
            }
            return alt;
        };

        ExposeContext.prototype.getArgAs = function (name, type, alt) {
            if (xm.hasOwnProp(this.argv, name)) {
                return xm.convertStringTo(this.argv[name], type);
            }
            return alt;
        };

        ExposeContext.prototype.getArgAt = function (index, alt) {
            if (index >= 0 && index < this.argv._.length) {
                return this.argv._[index];
            }
            return alt;
        };

        ExposeContext.prototype.getArgAtAs = function (index, type, alt) {
            if (index >= 0 && index < this.argv._.length) {
                return xm.convertStringTo(this.argv._[index], type);
            }
            return alt;
        };

        ExposeContext.prototype.getArgsAs = function (type) {
            return this.argv._.map(function (value) {
                return xm.convertStringTo(value, type);
            });
        };

        ExposeContext.prototype.getArgNames = function () {
            return Object.keys(this.argv).filter(function (name) {
                return (name !== '_');
            });
        };

        ExposeContext.prototype.getEnum = function (name, alt) {
            if (xm.hasOwnProp(this.argv, name)) {
                if (this.expose.options.has(name)) {
                    var option = this.expose.options.get(name);
                    var value = this.getArg(name);
                    if (option.enum.indexOf(value) > -1) {
                        return value;
                    }
                }
            }
            return alt;
        };

        ExposeContext.prototype.shiftArg = function (alt) {
            if (this.argv._.length > 0) {
                return this.argv._.shift();
            }
            return alt;
        };

        ExposeContext.prototype.shiftArgAs = function (type, alt) {
            if (this.argv._.length > 0) {
                return xm.convertStringTo(this.argv._.shift(), type);
            }
            return alt;
        };

        Object.defineProperty(ExposeContext.prototype, "numArgs", {
            get: function () {
                return this.argv._.length;
            },
            enumerable: true,
            configurable: true
        });
        return ExposeContext;
    })();
    xm.ExposeContext = ExposeContext;

    function exposeSortIndex(one, two) {
        if (one.index < two.index) {
            return -1;
        } else if (one.index > two.index) {
            return 1;
        }
        if (one.name < two.name) {
            return -1;
        } else if (one.name > two.name) {
            return 1;
        }
        return 0;
    }
    xm.exposeSortIndex = exposeSortIndex;

    function exposeSortHasElem(one, two, elem) {
        var oneI = one.indexOf(elem) > -1;
        var twoI = two.indexOf(elem) > -1;
        if (oneI && !twoI) {
            return -1;
        } else if (!oneI && twoI) {
            return 1;
        }
        return 0;
    }
    xm.exposeSortHasElem = exposeSortHasElem;

    function exposeSortId(one, two) {
        if (one.name < two.name) {
            return -1;
        } else if (one.name > two.name) {
            return 1;
        }
        if (one.index < two.index) {
            return -1;
        } else if (one.index > two.index) {
            return 1;
        }
        return 0;
    }
    xm.exposeSortId = exposeSortId;

    function exposeSortGroup(one, two) {
        if (one.index < two.index) {
            return -1;
        } else if (one.index > two.index) {
            return 1;
        }
        if (one.name < two.name) {
            return -1;
        } else if (one.name > two.name) {
            return 1;
        }
        return 0;
    }
    xm.exposeSortGroup = exposeSortGroup;

    function exposeSortOption(one, two) {
        if (one.short && !two.short) {
            return -1;
        }
        if (!one.short && two.short) {
            return 1;
        }
        if (one.short && two.short) {
            if (one.short.toLowerCase() < two.short.toLowerCase()) {
                return -1;
            } else if (one.short.toLowerCase() > two.short.toLowerCase()) {
                return 1;
            }
        }
        if (one.name.toLowerCase() < two.name.toLowerCase()) {
            return -1;
        } else if (one.name.toLowerCase() > two.name.toLowerCase()) {
            return 1;
        }
        return 0;
    }
    xm.exposeSortOption = exposeSortOption;

    var ExposeCommand = (function () {
        function ExposeCommand() {
            this.options = [];
            this.variadic = [];
            this.groups = [];
            this.note = [];
        }
        return ExposeCommand;
    })();
    xm.ExposeCommand = ExposeCommand;

    var ExposeGroup = (function () {
        function ExposeGroup() {
            this.sorter = exposeSortIndex;
            this.options = [];
        }
        return ExposeGroup;
    })();
    xm.ExposeGroup = ExposeGroup;

    var ExposeOption = (function () {
        function ExposeOption() {
            this.global = false;
            this.optional = true;
            this.enum = [];
            this.note = [];
        }
        return ExposeOption;
    })();
    xm.ExposeOption = ExposeOption;

    var Expose = (function () {
        function Expose(title, output) {
            if (typeof title === "undefined") { title = ''; }
            if (typeof output === "undefined") { output = null; }
            var _this = this;
            this.title = title;
            this.commands = new xm.KeyValueMap();
            this.options = new xm.KeyValueMap();
            this.groups = new xm.KeyValueMap();
            this.mainGroup = new ExposeGroup();
            this._isInit = false;
            this._index = 0;
            this.output = (output || new xm.StyledOut());

            this.defineCommand(function (cmd) {
                cmd.name = 'help';
                cmd.label = 'Display usage help';
                cmd.groups = ['help'];
                cmd.execute = function (ctx) {
                    _this.printCommands();
                    return null;
                };
            });

            this.defineOption(function (opt) {
                opt.name = 'help';
                opt.short = 'h';
                opt.description = 'Display usage help';
                opt.type = 'flag';
                opt.command = 'help';
                opt.global = true;
            });

            xm.ObjectUtil.defineProps(this, ['commands', 'options', 'groups', 'mainGroup'], {
                writable: false,
                enumerable: false
            });
        }
        Expose.prototype.defineOption = function (build) {
            var opt = new ExposeOption();
            build(opt);

            xm.assertVar(opt.name, 'string', 'opt.name');

            if (this.options.has(opt.name)) {
                throw new Error('opt.name collision on ' + opt.name);
            }
            this.options.set(opt.name, opt);
        };

        Expose.prototype.defineCommand = function (build) {
            var cmd = new ExposeCommand();
            build(cmd);
            cmd.index = (++this._index);

            xm.assertVar(cmd.name, 'string', 'build.name');

            if (this.commands.has(cmd.name)) {
                throw new Error('cmd.name collision on ' + cmd.name);
            }
            this.commands.set(cmd.name, cmd);
        };

        Expose.prototype.defineGroup = function (build) {
            var group = new ExposeGroup();
            build(group);
            group.index = (++this._index);

            xm.assertVar(group.name, 'string', 'group.name');

            if (this.groups.has(group.name)) {
                throw new Error('group.name collision on ' + group.name);
            }
            this.groups.set(group.name, group);
        };

        Expose.prototype.applyOptions = function (argv) {
            var _this = this;
            argv = optimist.parse(argv);
            var ctx = new ExposeContext(this, argv, null);

            Object.keys(argv).forEach(function (name) {
                if (name !== '_' && _this.options.has(name)) {
                    var opt = _this.options.get(name);
                    if (opt.apply) {
                        opt.apply(ctx.getArg(name), argv);
                    }
                }
            });
            return ctx;
        };

        Expose.prototype.init = function () {
            var _this = this;
            if (this._isInit) {
                return;
            }
            this._isInit = true;

            xm.eachProp(this.options.keys(), function (name) {
                var option = _this.options.get(name);
                if (option.short) {
                    optimist.alias(option.name, option.short);
                }
                if (xm.ObjectUtil.hasOwnProp(option, 'default')) {
                    optimist.default(option.name, option.default);
                }
            });
        };

        Expose.prototype.exit = function (code) {
            if (code !== 0) {
                this.output.line().error('Closing with exit code ' + code).clear();
            } else {
                this.output.line().success('bye!').ln();
            }
            exitProcess(code);
        };

        Expose.prototype.executeArgv = function (argvRaw, alt, exitAfter) {
            if (typeof exitAfter === "undefined") { exitAfter = true; }
            var _this = this;
            Q(this.executeRaw(argvRaw, alt).then(function (result) {
                if (result.error) {
                    throw (result.error);
                }
                if (exitAfter) {
                    _this.exit(result.code);
                }
            }).fail(function (err) {
                if (err.stack) {
                    _this.output.span(err.stack).clear();
                } else {
                    _this.output.error(err.toString()).clear();
                }
                _this.exit(1);
            }));
        };

        Expose.prototype.executeRaw = function (argvRaw, alt) {
            this.init();

            if (!alt || !this.commands.has(alt)) {
                alt = 'help';
            }

            var options = this.options.values();
            var opt;
            var i, ii;

            var ctx = this.applyOptions(argvRaw);
            if (!ctx) {
                return this.executeCommand(alt);
            }

            for (i = 0, ii = options.length; i < ii; i++) {
                opt = options[i];
                if (opt.command && ctx.hasArg(opt.name)) {
                    return this.executeCommand(opt.command, ctx);
                }
            }

            var cmd = ctx.shiftArg();

            cmd = ctx.shiftArg();

            if (ctx.numArgs === 0) {
                return this.executeCommand(alt, ctx);
            }

            cmd = ctx.shiftArg();
            if (this.commands.has(cmd)) {
                return this.executeCommand(cmd, ctx);
            } else {
                this.output.line().warning('command not found: ' + cmd).clear();
                return this.executeCommand('help', ctx);
            }
        };

        Expose.prototype.executeCommand = function (name, ctx) {
            if (typeof ctx === "undefined") { ctx = null; }
            var _this = this;
            this.init();

            if (!this.commands.has(name)) {
                return Q({
                    code: 1,
                    error: new Error('unknown command ' + name)
                });
            }
            var cmd = this.commands.get(name);

            var defer = Q.defer();

            Q.resolve().then(function () {
                if (_this.before) {
                    return Q(_this.before(cmd, ctx));
                }
                return null;
            }).then(function () {
                return Q(cmd.execute(ctx));
            }).then(function () {
                if (_this.after) {
                    return Q(_this.after(cmd, ctx));
                }
                return null;
            }).then(function () {
                return {
                    code: 0,
                    ctx: ctx
                };
            }, function (err) {
                return {
                    code: (err.code && err.code > 0) ? err.code : 1,
                    error: err,
                    ctx: ctx
                };
            }).done(function (ret) {
                defer.resolve(ret);
            });

            return defer.promise;
        };

        Expose.prototype.printCommands = function () {
            var _this = this;
            if (this.title) {
                this.output.accent(this.title).clear();
            }

            var optionString = function (option) {
                var placeholder = option.placeholder ? ' <' + option.placeholder + '>' : '';
                return '--' + option.name + placeholder;
            };

            var commands = new Table();

            var commandOptNames = [];
            var globalOptNames = [];
            var commandPadding = '   ';
            var optPadding = '      ';
            var optPaddingHalf = ' : ';

            var sortOptionName = function (one, two) {
                return exposeSortOption(_this.options.get(one), _this.options.get(two));
            };

            var optKeys = this.options.keys().sort(sortOptionName);

            var addHeader = function (label) {
                commands.cell('one', label);
                commands.newRow();
                addDivider();
            };

            var addDivider = function () {
                commands.cell('one', '--------');
                commands.cell('short', '----');
                commands.cell('two', '--------');
                commands.newRow();
            };

            var addOption = function (name) {
                var option = _this.options.get(name, null);
                if (!option) {
                    commands.cell('one', optPadding + '--' + name);
                    commands.cell('two', optPaddingHalf + '<undefined>');
                } else {
                    commands.cell('one', optPadding + optionString(option));
                    if (option.short) {
                        commands.cell('short', ' -' + option.short);
                    }
                    var desc = optPaddingHalf + option.description;
                    desc += ' (' + option.type;
                    desc += (option.default ? ', default: ' + option.default : '');
                    desc += ')';
                    commands.cell('two', desc);

                    if (option.enum.length > 0) {
                        commands.cell('two', '   ' + option.enum.map(function (value) {
                            if (xm.isNumber(value)) {
                                return value;
                            }
                            var str = ('' + value);
                            if (/^[\w_-]*$/.test(str)) {
                                return str;
                            }
                            return '\'' + jsesc(('' + value), {
                                quotes: 'single'
                            }) + '\'';
                        }).join(','));
                    }
                }
                commands.newRow();

                addNote(option.note);
            };

            var addCommand = function (cmd, group) {
                var usage = cmd.name;
                if (cmd.variadic.length > 0) {
                    usage += ' <' + cmd.variadic.join(', ') + '>';
                }
                commands.cell('one', commandPadding + usage);
                commands.cell('two', cmd.label);
                commands.newRow();

                addNote(cmd.note);

                cmd.options.sort(sortOptionName).forEach(function (name) {
                    var option = _this.options.get(name);
                    if (commandOptNames.indexOf(name) < 0 && group.options.indexOf(name) < 0) {
                        addOption(name);
                    }
                });
            };

            var addNote = function (note) {
                if (note && note.length > 0) {
                    commands.cell('one', '');
                    commands.cell('two', '   <' + (xm.isArray(note) ? note.join('>/n<') : note) + '>');
                    commands.newRow();
                }
            };

            var allCommands = this.commands.keys();
            var allGroups = this.groups.values();

            optKeys.forEach(function (name) {
                var option = _this.options.get(name);
                if (option.command) {
                    commandOptNames.push(option.name);
                }
            });

            optKeys.forEach(function (name) {
                var option = _this.options.get(name);
                if (option.global && !option.command) {
                    globalOptNames.push(option.name);
                }
            });

            if (allGroups.length > 0) {
                this.groups.values().sort(exposeSortGroup).forEach(function (group) {
                    addHeader(group.label);

                    _this.commands.values().filter(function (cmd) {
                        return cmd.groups.indexOf(group.name) > -1;
                    }).sort(group.sorter).forEach(function (cmd) {
                        addCommand(cmd, group);

                        var i = allCommands.indexOf(cmd.name);
                        if (i > -1) {
                            allCommands.glue(i, 1);
                        }
                    });

                    if (group.options.length > 0) {
                        addDivider();
                        group.options.sort(sortOptionName).forEach(function (name) {
                            var option = _this.options.get(name);
                            if (commandOptNames.indexOf(name) < 0) {
                                addOption(name);
                            }
                        });
                    }
                    commands.newRow();
                });
            }

            if (allCommands.length > 0) {
                addHeader('Other commands');

                allCommands.forEach(function (name) {
                    addCommand(_this.commands.get(name), _this.mainGroup);
                });
                commands.newRow();
            }

            if (commandOptNames.length > 0 && globalOptNames.length > 0) {
                addHeader('Global options');

                if (commandOptNames.length > 0) {
                    xm.eachElem(commandOptNames, function (name) {
                        addOption(name);
                    });
                }

                if (globalOptNames.length > 0) {
                    xm.eachElem(globalOptNames, function (name) {
                        addOption(name);
                    });
                }
                commands.newRow();
            }

            this.output.block(commands.print().replace(/\s*$/, ''));
        };
        return Expose;
    })();
    xm.Expose = Expose;
})(xm || (xm = {}));
var git;
(function (git) {
    var Q = require('q');
    var path = require('path');
    var ansidiff = require('ansidiff');
    var FS = require('q-io/fs');

    var expose = new xm.Expose('Blob Sha');
    expose.defineOption(function (option) {
        option.name = 'path';
        option.type = 'string';
    });
    expose.defineCommand(function (cmd) {
        cmd.name = 'newline';
        cmd.options = ['path'];
        cmd.execute = function (ctx) {
            if (ctx.numArgs < 1) {
                throw new Error('specify some paths');
            }

            return Q.all(ctx.getArgsAs('string').map(function (target) {
                var filePath = path.resolve(target);

                ctx.out.info().label('path').line(target);
                if (target !== filePath) {
                    ctx.out.info().label('path').line(filePath);
                }

                return FS.read(filePath, { flags: 'rb' }).then(function (buffer) {
                    if (buffer.length === 0) {
                        ctx.out.indent().error('empty file').line();
                    }
                    var raw = buffer.toString('utf8');
                    var shaRaw = git.GitUtil.blobShaHex(buffer, 'utf8');
                    var normalised = buffer.toString('utf8').replace(/(\r\n|\r)/g, '\n');
                    var shaNormal = git.GitUtil.blobShaHex(new Buffer(normalised, 'utf8'), 'utf8');

                    if (shaRaw !== shaNormal) {
                        ctx.out.indent().success(shaRaw).line();
                        ctx.out.indent().error(shaNormal).line();
                        ctx.out.line(ansidiff.chars(xm.escapeControl(raw, true), xm.escapeControl(normalised, true)));
                    } else {
                        ctx.out.indent().success(shaRaw).line();
                        ctx.out.indent().success(xm.escapeControl(raw, true)).line();
                    }
                });
            })).then(function () {
                ctx.out.info().success('done!').ln();
            }, function (err) {
                ctx.out.info().error('error').inspect(err);
            });
        };
    });
    expose.executeArgv(process.argv);
})(git || (git = {}));
//# sourceMappingURL=blobSha.js.map
