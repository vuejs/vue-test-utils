'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Vue = _interopDefault(require('vue'));
var vueTemplateCompiler = require('vue-template-compiler');

// 

function throwError (msg) {
  throw new Error(("[vue-test-utils]: " + msg))
}

function warn (msg) {
  console.error(("[vue-test-utils]: " + msg));
}

var camelizeRE = /-(\w)/g;
var camelize = function (str) { return str.replace(camelizeRE, function (_, c) { return c ? c.toUpperCase() : ''; }); };

/**
 * Capitalize a string.
 */
var capitalize = function (str) { return str.charAt(0).toUpperCase() + str.slice(1); };

/**
 * Hyphenate a camelCase string.
 */
var hyphenateRE = /\B([A-Z])/g;
var hyphenate = function (str) { return str.replace(hyphenateRE, '-$1').toLowerCase(); };

function warnIfNoWindow () {
  if (typeof window === 'undefined') {
    throwError(
      'window is undefined, vue-test-utils needs to be run in a browser environment.\n' +
      'You can run the tests in node using jsdom + jsdom-global.\n' +
      'See https://vue-test-utils.vuejs.org/en/guides/common-tips.html for more details.'
    );
  }
}

if (typeof Element !== 'undefined' && !Element.prototype.matches) {
  Element.prototype.matches =
        Element.prototype.matchesSelector ||
        Element.prototype.mozMatchesSelector ||
        Element.prototype.msMatchesSelector ||
        Element.prototype.oMatchesSelector ||
        Element.prototype.webkitMatchesSelector ||
        function (s) {
          var matches = (this.document || this.ownerDocument).querySelectorAll(s);
          var i = matches.length;
          while (--i >= 0 && matches.item(i) !== this) {}
          return i > -1
        };
}

if (typeof Object.assign !== 'function') {
  (function () {
    Object.assign = function (target) {
      var arguments$1 = arguments;

      if (target === undefined || target === null) {
        throw new TypeError('Cannot convert undefined or null to object')
      }

      var output = Object(target);
      for (var index = 1; index < arguments.length; index++) {
        var source = arguments$1[index];
        if (source !== undefined && source !== null) {
          for (var nextKey in source) {
            if (source.hasOwnProperty(nextKey)) {
              output[nextKey] = source[nextKey];
            }
          }
        }
      }
      return output
    };
  })();
}

/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
  this.size = 0;
}

var _listCacheClear = listCacheClear;

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

var eq_1 = eq;

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq_1(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

var _assocIndexOf = assocIndexOf;

/** Used for built-in method references. */
var arrayProto = Array.prototype;

/** Built-in value references. */
var splice = arrayProto.splice;

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete(key) {
  var data = this.__data__,
      index = _assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  --this.size;
  return true;
}

var _listCacheDelete = listCacheDelete;

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet(key) {
  var data = this.__data__,
      index = _assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

var _listCacheGet = listCacheGet;

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas(key) {
  return _assocIndexOf(this.__data__, key) > -1;
}

var _listCacheHas = listCacheHas;

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet(key, value) {
  var data = this.__data__,
      index = _assocIndexOf(data, key);

  if (index < 0) {
    ++this.size;
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

var _listCacheSet = listCacheSet;

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var this$1 = this;

  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this$1.set(entry[0], entry[1]);
  }
}

// Add methods to `ListCache`.
ListCache.prototype.clear = _listCacheClear;
ListCache.prototype['delete'] = _listCacheDelete;
ListCache.prototype.get = _listCacheGet;
ListCache.prototype.has = _listCacheHas;
ListCache.prototype.set = _listCacheSet;

var _ListCache = ListCache;

/**
 * Removes all key-value entries from the stack.
 *
 * @private
 * @name clear
 * @memberOf Stack
 */
function stackClear() {
  this.__data__ = new _ListCache;
  this.size = 0;
}

var _stackClear = stackClear;

/**
 * Removes `key` and its value from the stack.
 *
 * @private
 * @name delete
 * @memberOf Stack
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function stackDelete(key) {
  var data = this.__data__,
      result = data['delete'](key);

  this.size = data.size;
  return result;
}

var _stackDelete = stackDelete;

/**
 * Gets the stack value for `key`.
 *
 * @private
 * @name get
 * @memberOf Stack
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function stackGet(key) {
  return this.__data__.get(key);
}

var _stackGet = stackGet;

/**
 * Checks if a stack value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Stack
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function stackHas(key) {
  return this.__data__.has(key);
}

var _stackHas = stackHas;

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

var _freeGlobal = freeGlobal;

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = _freeGlobal || freeSelf || Function('return this')();

var _root = root;

/** Built-in value references. */
var Symbol = _root.Symbol;

var _Symbol = Symbol;

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/** Built-in value references. */
var symToStringTag = _Symbol ? _Symbol.toStringTag : undefined;

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag),
      tag = value[symToStringTag];

  try {
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}

var _getRawTag = getRawTag;

/** Used for built-in method references. */
var objectProto$1 = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString$1 = objectProto$1.toString;

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString$1.call(value);
}

var _objectToString = objectToString;

/** `Object#toString` result references. */
var nullTag = '[object Null]',
    undefinedTag = '[object Undefined]';

/** Built-in value references. */
var symToStringTag$1 = _Symbol ? _Symbol.toStringTag : undefined;

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag$1 && symToStringTag$1 in Object(value))
    ? _getRawTag(value)
    : _objectToString(value);
}

var _baseGetTag = baseGetTag;

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

var isObject_1 = isObject;

/** `Object#toString` result references. */
var asyncTag = '[object AsyncFunction]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    proxyTag = '[object Proxy]';

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  if (!isObject_1(value)) {
    return false;
  }
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.
  var tag = _baseGetTag(value);
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}

var isFunction_1 = isFunction;

/** Used to detect overreaching core-js shims. */
var coreJsData = _root['__core-js_shared__'];

var _coreJsData = coreJsData;

/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(_coreJsData && _coreJsData.keys && _coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && (maskSrcKey in func);
}

var _isMasked = isMasked;

/** Used for built-in method references. */
var funcProto = Function.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to convert.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

var _toSource = toSource;

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used for built-in method references. */
var funcProto$1 = Function.prototype,
    objectProto$2 = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString$1 = funcProto$1.toString;

/** Used to check objects for own properties. */
var hasOwnProperty$1 = objectProto$2.hasOwnProperty;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString$1.call(hasOwnProperty$1).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!isObject_1(value) || _isMasked(value)) {
    return false;
  }
  var pattern = isFunction_1(value) ? reIsNative : reIsHostCtor;
  return pattern.test(_toSource(value));
}

var _baseIsNative = baseIsNative;

/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

var _getValue = getValue;

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = _getValue(object, key);
  return _baseIsNative(value) ? value : undefined;
}

var _getNative = getNative;

/* Built-in method references that are verified to be native. */
var Map = _getNative(_root, 'Map');

var _Map = Map;

/* Built-in method references that are verified to be native. */
var nativeCreate = _getNative(Object, 'create');

var _nativeCreate = nativeCreate;

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear() {
  this.__data__ = _nativeCreate ? _nativeCreate(null) : {};
  this.size = 0;
}

var _hashClear = hashClear;

/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  var result = this.has(key) && delete this.__data__[key];
  this.size -= result ? 1 : 0;
  return result;
}

var _hashDelete = hashDelete;

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** Used for built-in method references. */
var objectProto$3 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$2 = objectProto$3.hasOwnProperty;

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (_nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty$2.call(data, key) ? data[key] : undefined;
}

var _hashGet = hashGet;

/** Used for built-in method references. */
var objectProto$4 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$3 = objectProto$4.hasOwnProperty;

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(key) {
  var data = this.__data__;
  return _nativeCreate ? (data[key] !== undefined) : hasOwnProperty$3.call(data, key);
}

var _hashHas = hashHas;

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED$1 = '__lodash_hash_undefined__';

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data[key] = (_nativeCreate && value === undefined) ? HASH_UNDEFINED$1 : value;
  return this;
}

var _hashSet = hashSet;

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var this$1 = this;

  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this$1.set(entry[0], entry[1]);
  }
}

// Add methods to `Hash`.
Hash.prototype.clear = _hashClear;
Hash.prototype['delete'] = _hashDelete;
Hash.prototype.get = _hashGet;
Hash.prototype.has = _hashHas;
Hash.prototype.set = _hashSet;

var _Hash = Hash;

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.size = 0;
  this.__data__ = {
    'hash': new _Hash,
    'map': new (_Map || _ListCache),
    'string': new _Hash
  };
}

var _mapCacheClear = mapCacheClear;

/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

var _isKeyable = isKeyable;

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData(map, key) {
  var data = map.__data__;
  return _isKeyable(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

var _getMapData = getMapData;

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete(key) {
  var result = _getMapData(this, key)['delete'](key);
  this.size -= result ? 1 : 0;
  return result;
}

var _mapCacheDelete = mapCacheDelete;

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return _getMapData(this, key).get(key);
}

var _mapCacheGet = mapCacheGet;

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas(key) {
  return _getMapData(this, key).has(key);
}

var _mapCacheHas = mapCacheHas;

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet(key, value) {
  var data = _getMapData(this, key),
      size = data.size;

  data.set(key, value);
  this.size += data.size == size ? 0 : 1;
  return this;
}

var _mapCacheSet = mapCacheSet;

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var this$1 = this;

  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this$1.set(entry[0], entry[1]);
  }
}

// Add methods to `MapCache`.
MapCache.prototype.clear = _mapCacheClear;
MapCache.prototype['delete'] = _mapCacheDelete;
MapCache.prototype.get = _mapCacheGet;
MapCache.prototype.has = _mapCacheHas;
MapCache.prototype.set = _mapCacheSet;

var _MapCache = MapCache;

/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/**
 * Sets the stack `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Stack
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the stack cache instance.
 */
function stackSet(key, value) {
  var data = this.__data__;
  if (data instanceof _ListCache) {
    var pairs = data.__data__;
    if (!_Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
      pairs.push([key, value]);
      this.size = ++data.size;
      return this;
    }
    data = this.__data__ = new _MapCache(pairs);
  }
  data.set(key, value);
  this.size = data.size;
  return this;
}

var _stackSet = stackSet;

/**
 * Creates a stack cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Stack(entries) {
  var data = this.__data__ = new _ListCache(entries);
  this.size = data.size;
}

// Add methods to `Stack`.
Stack.prototype.clear = _stackClear;
Stack.prototype['delete'] = _stackDelete;
Stack.prototype.get = _stackGet;
Stack.prototype.has = _stackHas;
Stack.prototype.set = _stackSet;

var _Stack = Stack;

var defineProperty = (function() {
  try {
    var func = _getNative(Object, 'defineProperty');
    func({}, '', {});
    return func;
  } catch (e) {}
}());

var _defineProperty = defineProperty;

/**
 * The base implementation of `assignValue` and `assignMergeValue` without
 * value checks.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function baseAssignValue(object, key, value) {
  if (key == '__proto__' && _defineProperty) {
    _defineProperty(object, key, {
      'configurable': true,
      'enumerable': true,
      'value': value,
      'writable': true
    });
  } else {
    object[key] = value;
  }
}

var _baseAssignValue = baseAssignValue;

/**
 * This function is like `assignValue` except that it doesn't assign
 * `undefined` values.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function assignMergeValue(object, key, value) {
  if ((value !== undefined && !eq_1(object[key], value)) ||
      (value === undefined && !(key in object))) {
    _baseAssignValue(object, key, value);
  }
}

var _assignMergeValue = assignMergeValue;

/**
 * Creates a base function for methods like `_.forIn` and `_.forOwn`.
 *
 * @private
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */
function createBaseFor(fromRight) {
  return function(object, iteratee, keysFunc) {
    var index = -1,
        iterable = Object(object),
        props = keysFunc(object),
        length = props.length;

    while (length--) {
      var key = props[fromRight ? length : ++index];
      if (iteratee(iterable[key], key, iterable) === false) {
        break;
      }
    }
    return object;
  };
}

var _createBaseFor = createBaseFor;

/**
 * The base implementation of `baseForOwn` which iterates over `object`
 * properties returned by `keysFunc` and invokes `iteratee` for each property.
 * Iteratee functions may exit iteration early by explicitly returning `false`.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @returns {Object} Returns `object`.
 */
var baseFor = _createBaseFor();

var _baseFor = baseFor;

var _cloneBuffer = createCommonjsModule(function (module, exports) {
/** Detect free variable `exports`. */
var freeExports = 'object' == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Built-in value references. */
var Buffer = moduleExports ? _root.Buffer : undefined,
    allocUnsafe = Buffer ? Buffer.allocUnsafe : undefined;

/**
 * Creates a clone of  `buffer`.
 *
 * @private
 * @param {Buffer} buffer The buffer to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Buffer} Returns the cloned buffer.
 */
function cloneBuffer(buffer, isDeep) {
  if (isDeep) {
    return buffer.slice();
  }
  var length = buffer.length,
      result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);

  buffer.copy(result);
  return result;
}

module.exports = cloneBuffer;
});

/** Built-in value references. */
var Uint8Array = _root.Uint8Array;

var _Uint8Array = Uint8Array;

/**
 * Creates a clone of `arrayBuffer`.
 *
 * @private
 * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
 * @returns {ArrayBuffer} Returns the cloned array buffer.
 */
function cloneArrayBuffer(arrayBuffer) {
  var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
  new _Uint8Array(result).set(new _Uint8Array(arrayBuffer));
  return result;
}

var _cloneArrayBuffer = cloneArrayBuffer;

/**
 * Creates a clone of `typedArray`.
 *
 * @private
 * @param {Object} typedArray The typed array to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned typed array.
 */
function cloneTypedArray(typedArray, isDeep) {
  var buffer = isDeep ? _cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
  return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
}

var _cloneTypedArray = cloneTypedArray;

/**
 * Copies the values of `source` to `array`.
 *
 * @private
 * @param {Array} source The array to copy values from.
 * @param {Array} [array=[]] The array to copy values to.
 * @returns {Array} Returns `array`.
 */
function copyArray(source, array) {
  var index = -1,
      length = source.length;

  array || (array = Array(length));
  while (++index < length) {
    array[index] = source[index];
  }
  return array;
}

var _copyArray = copyArray;

/** Built-in value references. */
var objectCreate = Object.create;

/**
 * The base implementation of `_.create` without support for assigning
 * properties to the created object.
 *
 * @private
 * @param {Object} proto The object to inherit from.
 * @returns {Object} Returns the new object.
 */
var baseCreate = (function() {
  function object() {}
  return function(proto) {
    if (!isObject_1(proto)) {
      return {};
    }
    if (objectCreate) {
      return objectCreate(proto);
    }
    object.prototype = proto;
    var result = new object;
    object.prototype = undefined;
    return result;
  };
}());

var _baseCreate = baseCreate;

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

var _overArg = overArg;

/** Built-in value references. */
var getPrototype = _overArg(Object.getPrototypeOf, Object);

var _getPrototype = getPrototype;

/** Used for built-in method references. */
var objectProto$5 = Object.prototype;

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto$5;

  return value === proto;
}

var _isPrototype = isPrototype;

/**
 * Initializes an object clone.
 *
 * @private
 * @param {Object} object The object to clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneObject(object) {
  return (typeof object.constructor == 'function' && !_isPrototype(object))
    ? _baseCreate(_getPrototype(object))
    : {};
}

var _initCloneObject = initCloneObject;

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

var isObjectLike_1 = isObjectLike;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]';

/**
 * The base implementation of `_.isArguments`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 */
function baseIsArguments(value) {
  return isObjectLike_1(value) && _baseGetTag(value) == argsTag;
}

var _baseIsArguments = baseIsArguments;

/** Used for built-in method references. */
var objectProto$6 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$4 = objectProto$6.hasOwnProperty;

/** Built-in value references. */
var propertyIsEnumerable = objectProto$6.propertyIsEnumerable;

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
var isArguments = _baseIsArguments(function() { return arguments; }()) ? _baseIsArguments : function(value) {
  return isObjectLike_1(value) && hasOwnProperty$4.call(value, 'callee') &&
    !propertyIsEnumerable.call(value, 'callee');
};

var isArguments_1 = isArguments;

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

var isArray_1 = isArray;

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

var isLength_1 = isLength;

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength_1(value.length) && !isFunction_1(value);
}

var isArrayLike_1 = isArrayLike;

/**
 * This method is like `_.isArrayLike` except that it also checks if `value`
 * is an object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array-like object,
 *  else `false`.
 * @example
 *
 * _.isArrayLikeObject([1, 2, 3]);
 * // => true
 *
 * _.isArrayLikeObject(document.body.children);
 * // => true
 *
 * _.isArrayLikeObject('abc');
 * // => false
 *
 * _.isArrayLikeObject(_.noop);
 * // => false
 */
function isArrayLikeObject(value) {
  return isObjectLike_1(value) && isArrayLike_1(value);
}

var isArrayLikeObject_1 = isArrayLikeObject;

/**
 * This method returns `false`.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {boolean} Returns `false`.
 * @example
 *
 * _.times(2, _.stubFalse);
 * // => [false, false]
 */
function stubFalse() {
  return false;
}

var stubFalse_1 = stubFalse;

var isBuffer_1 = createCommonjsModule(function (module, exports) {
/** Detect free variable `exports`. */
var freeExports = 'object' == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Built-in value references. */
var Buffer = moduleExports ? _root.Buffer : undefined;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;

/**
 * Checks if `value` is a buffer.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
 * @example
 *
 * _.isBuffer(new Buffer(2));
 * // => true
 *
 * _.isBuffer(new Uint8Array(2));
 * // => false
 */
var isBuffer = nativeIsBuffer || stubFalse_1;

module.exports = isBuffer;
});

/** `Object#toString` result references. */
var objectTag = '[object Object]';

/** Used for built-in method references. */
var funcProto$2 = Function.prototype,
    objectProto$7 = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString$2 = funcProto$2.toString;

/** Used to check objects for own properties. */
var hasOwnProperty$5 = objectProto$7.hasOwnProperty;

/** Used to infer the `Object` constructor. */
var objectCtorString = funcToString$2.call(Object);

/**
 * Checks if `value` is a plain object, that is, an object created by the
 * `Object` constructor or one with a `[[Prototype]]` of `null`.
 *
 * @static
 * @memberOf _
 * @since 0.8.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * _.isPlainObject(new Foo);
 * // => false
 *
 * _.isPlainObject([1, 2, 3]);
 * // => false
 *
 * _.isPlainObject({ 'x': 0, 'y': 0 });
 * // => true
 *
 * _.isPlainObject(Object.create(null));
 * // => true
 */
function isPlainObject(value) {
  if (!isObjectLike_1(value) || _baseGetTag(value) != objectTag) {
    return false;
  }
  var proto = _getPrototype(value);
  if (proto === null) {
    return true;
  }
  var Ctor = hasOwnProperty$5.call(proto, 'constructor') && proto.constructor;
  return typeof Ctor == 'function' && Ctor instanceof Ctor &&
    funcToString$2.call(Ctor) == objectCtorString;
}

var isPlainObject_1 = isPlainObject;

/** `Object#toString` result references. */
var argsTag$1 = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag$1 = '[object Function]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    objectTag$1 = '[object Object]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/** Used to identify `toStringTag` values of typed arrays. */
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag$1] = typedArrayTags[arrayTag] =
typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
typedArrayTags[errorTag] = typedArrayTags[funcTag$1] =
typedArrayTags[mapTag] = typedArrayTags[numberTag] =
typedArrayTags[objectTag$1] = typedArrayTags[regexpTag] =
typedArrayTags[setTag] = typedArrayTags[stringTag] =
typedArrayTags[weakMapTag] = false;

/**
 * The base implementation of `_.isTypedArray` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 */
function baseIsTypedArray(value) {
  return isObjectLike_1(value) &&
    isLength_1(value.length) && !!typedArrayTags[_baseGetTag(value)];
}

var _baseIsTypedArray = baseIsTypedArray;

/**
 * The base implementation of `_.unary` without support for storing metadata.
 *
 * @private
 * @param {Function} func The function to cap arguments for.
 * @returns {Function} Returns the new capped function.
 */
function baseUnary(func) {
  return function(value) {
    return func(value);
  };
}

var _baseUnary = baseUnary;

var _nodeUtil = createCommonjsModule(function (module, exports) {
/** Detect free variable `exports`. */
var freeExports = 'object' == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Detect free variable `process` from Node.js. */
var freeProcess = moduleExports && _freeGlobal.process;

/** Used to access faster Node.js helpers. */
var nodeUtil = (function() {
  try {
    return freeProcess && freeProcess.binding && freeProcess.binding('util');
  } catch (e) {}
}());

module.exports = nodeUtil;
});

/* Node.js helper references. */
var nodeIsTypedArray = _nodeUtil && _nodeUtil.isTypedArray;

/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */
var isTypedArray = nodeIsTypedArray ? _baseUnary(nodeIsTypedArray) : _baseIsTypedArray;

var isTypedArray_1 = isTypedArray;

/** Used for built-in method references. */
var objectProto$8 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$6 = objectProto$8.hasOwnProperty;

/**
 * Assigns `value` to `key` of `object` if the existing value is not equivalent
 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function assignValue(object, key, value) {
  var objValue = object[key];
  if (!(hasOwnProperty$6.call(object, key) && eq_1(objValue, value)) ||
      (value === undefined && !(key in object))) {
    _baseAssignValue(object, key, value);
  }
}

var _assignValue = assignValue;

/**
 * Copies properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy properties from.
 * @param {Array} props The property identifiers to copy.
 * @param {Object} [object={}] The object to copy properties to.
 * @param {Function} [customizer] The function to customize copied values.
 * @returns {Object} Returns `object`.
 */
function copyObject(source, props, object, customizer) {
  var isNew = !object;
  object || (object = {});

  var index = -1,
      length = props.length;

  while (++index < length) {
    var key = props[index];

    var newValue = customizer
      ? customizer(object[key], source[key], key, object, source)
      : undefined;

    if (newValue === undefined) {
      newValue = source[key];
    }
    if (isNew) {
      _baseAssignValue(object, key, newValue);
    } else {
      _assignValue(object, key, newValue);
    }
  }
  return object;
}

var _copyObject = copyObject;

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

var _baseTimes = baseTimes;

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER$1 = 9007199254740991;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  length = length == null ? MAX_SAFE_INTEGER$1 : length;
  return !!length &&
    (typeof value == 'number' || reIsUint.test(value)) &&
    (value > -1 && value % 1 == 0 && value < length);
}

var _isIndex = isIndex;

/** Used for built-in method references. */
var objectProto$9 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$7 = objectProto$9.hasOwnProperty;

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  var isArr = isArray_1(value),
      isArg = !isArr && isArguments_1(value),
      isBuff = !isArr && !isArg && isBuffer_1(value),
      isType = !isArr && !isArg && !isBuff && isTypedArray_1(value),
      skipIndexes = isArr || isArg || isBuff || isType,
      result = skipIndexes ? _baseTimes(value.length, String) : [],
      length = result.length;

  for (var key in value) {
    if ((inherited || hasOwnProperty$7.call(value, key)) &&
        !(skipIndexes && (
           // Safari 9 has enumerable `arguments.length` in strict mode.
           key == 'length' ||
           // Node.js 0.10 has enumerable non-index properties on buffers.
           (isBuff && (key == 'offset' || key == 'parent')) ||
           // PhantomJS 2 has enumerable non-index properties on typed arrays.
           (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
           // Skip index properties.
           _isIndex(key, length)
        ))) {
      result.push(key);
    }
  }
  return result;
}

var _arrayLikeKeys = arrayLikeKeys;

/**
 * This function is like
 * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * except that it includes inherited enumerable properties.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function nativeKeysIn(object) {
  var result = [];
  if (object != null) {
    for (var key in Object(object)) {
      result.push(key);
    }
  }
  return result;
}

var _nativeKeysIn = nativeKeysIn;

/** Used for built-in method references. */
var objectProto$10 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$8 = objectProto$10.hasOwnProperty;

/**
 * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeysIn(object) {
  if (!isObject_1(object)) {
    return _nativeKeysIn(object);
  }
  var isProto = _isPrototype(object),
      result = [];

  for (var key in object) {
    if (!(key == 'constructor' && (isProto || !hasOwnProperty$8.call(object, key)))) {
      result.push(key);
    }
  }
  return result;
}

var _baseKeysIn = baseKeysIn;

/**
 * Creates an array of the own and inherited enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keysIn(new Foo);
 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
 */
function keysIn$1(object) {
  return isArrayLike_1(object) ? _arrayLikeKeys(object, true) : _baseKeysIn(object);
}

var keysIn_1 = keysIn$1;

/**
 * Converts `value` to a plain object flattening inherited enumerable string
 * keyed properties of `value` to own properties of the plain object.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {Object} Returns the converted plain object.
 * @example
 *
 * function Foo() {
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.assign({ 'a': 1 }, new Foo);
 * // => { 'a': 1, 'b': 2 }
 *
 * _.assign({ 'a': 1 }, _.toPlainObject(new Foo));
 * // => { 'a': 1, 'b': 2, 'c': 3 }
 */
function toPlainObject(value) {
  return _copyObject(value, keysIn_1(value));
}

var toPlainObject_1 = toPlainObject;

/**
 * A specialized version of `baseMerge` for arrays and objects which performs
 * deep merges and tracks traversed objects enabling objects with circular
 * references to be merged.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @param {string} key The key of the value to merge.
 * @param {number} srcIndex The index of `source`.
 * @param {Function} mergeFunc The function to merge values.
 * @param {Function} [customizer] The function to customize assigned values.
 * @param {Object} [stack] Tracks traversed source values and their merged
 *  counterparts.
 */
function baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
  var objValue = object[key],
      srcValue = source[key],
      stacked = stack.get(srcValue);

  if (stacked) {
    _assignMergeValue(object, key, stacked);
    return;
  }
  var newValue = customizer
    ? customizer(objValue, srcValue, (key + ''), object, source, stack)
    : undefined;

  var isCommon = newValue === undefined;

  if (isCommon) {
    var isArr = isArray_1(srcValue),
        isBuff = !isArr && isBuffer_1(srcValue),
        isTyped = !isArr && !isBuff && isTypedArray_1(srcValue);

    newValue = srcValue;
    if (isArr || isBuff || isTyped) {
      if (isArray_1(objValue)) {
        newValue = objValue;
      }
      else if (isArrayLikeObject_1(objValue)) {
        newValue = _copyArray(objValue);
      }
      else if (isBuff) {
        isCommon = false;
        newValue = _cloneBuffer(srcValue, true);
      }
      else if (isTyped) {
        isCommon = false;
        newValue = _cloneTypedArray(srcValue, true);
      }
      else {
        newValue = [];
      }
    }
    else if (isPlainObject_1(srcValue) || isArguments_1(srcValue)) {
      newValue = objValue;
      if (isArguments_1(objValue)) {
        newValue = toPlainObject_1(objValue);
      }
      else if (!isObject_1(objValue) || (srcIndex && isFunction_1(objValue))) {
        newValue = _initCloneObject(srcValue);
      }
    }
    else {
      isCommon = false;
    }
  }
  if (isCommon) {
    // Recursively merge objects and arrays (susceptible to call stack limits).
    stack.set(srcValue, newValue);
    mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
    stack['delete'](srcValue);
  }
  _assignMergeValue(object, key, newValue);
}

var _baseMergeDeep = baseMergeDeep;

/**
 * The base implementation of `_.merge` without support for multiple sources.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @param {number} srcIndex The index of `source`.
 * @param {Function} [customizer] The function to customize merged values.
 * @param {Object} [stack] Tracks traversed source values and their merged
 *  counterparts.
 */
function baseMerge(object, source, srcIndex, customizer, stack) {
  if (object === source) {
    return;
  }
  _baseFor(source, function(srcValue, key) {
    if (isObject_1(srcValue)) {
      stack || (stack = new _Stack);
      _baseMergeDeep(object, source, key, srcIndex, baseMerge, customizer, stack);
    }
    else {
      var newValue = customizer
        ? customizer(object[key], srcValue, (key + ''), object, source, stack)
        : undefined;

      if (newValue === undefined) {
        newValue = srcValue;
      }
      _assignMergeValue(object, key, newValue);
    }
  }, keysIn_1);
}

var _baseMerge = baseMerge;

/**
 * This method returns the first argument it receives.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Util
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'a': 1 };
 *
 * console.log(_.identity(object) === object);
 * // => true
 */
function identity(value) {
  return value;
}

var identity_1 = identity;

/**
 * A faster alternative to `Function#apply`, this function invokes `func`
 * with the `this` binding of `thisArg` and the arguments of `args`.
 *
 * @private
 * @param {Function} func The function to invoke.
 * @param {*} thisArg The `this` binding of `func`.
 * @param {Array} args The arguments to invoke `func` with.
 * @returns {*} Returns the result of `func`.
 */
function apply(func, thisArg, args) {
  switch (args.length) {
    case 0: return func.call(thisArg);
    case 1: return func.call(thisArg, args[0]);
    case 2: return func.call(thisArg, args[0], args[1]);
    case 3: return func.call(thisArg, args[0], args[1], args[2]);
  }
  return func.apply(thisArg, args);
}

var _apply = apply;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max;

/**
 * A specialized version of `baseRest` which transforms the rest array.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @param {Function} transform The rest array transform.
 * @returns {Function} Returns the new function.
 */
function overRest(func, start, transform) {
  start = nativeMax(start === undefined ? (func.length - 1) : start, 0);
  return function() {
    var args = arguments,
        index = -1,
        length = nativeMax(args.length - start, 0),
        array = Array(length);

    while (++index < length) {
      array[index] = args[start + index];
    }
    index = -1;
    var otherArgs = Array(start + 1);
    while (++index < start) {
      otherArgs[index] = args[index];
    }
    otherArgs[start] = transform(array);
    return _apply(func, this, otherArgs);
  };
}

var _overRest = overRest;

/**
 * Creates a function that returns `value`.
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Util
 * @param {*} value The value to return from the new function.
 * @returns {Function} Returns the new constant function.
 * @example
 *
 * var objects = _.times(2, _.constant({ 'a': 1 }));
 *
 * console.log(objects);
 * // => [{ 'a': 1 }, { 'a': 1 }]
 *
 * console.log(objects[0] === objects[1]);
 * // => true
 */
function constant(value) {
  return function() {
    return value;
  };
}

var constant_1 = constant;

/**
 * The base implementation of `setToString` without support for hot loop shorting.
 *
 * @private
 * @param {Function} func The function to modify.
 * @param {Function} string The `toString` result.
 * @returns {Function} Returns `func`.
 */
var baseSetToString = !_defineProperty ? identity_1 : function(func, string) {
  return _defineProperty(func, 'toString', {
    'configurable': true,
    'enumerable': false,
    'value': constant_1(string),
    'writable': true
  });
};

var _baseSetToString = baseSetToString;

/** Used to detect hot functions by number of calls within a span of milliseconds. */
var HOT_COUNT = 800,
    HOT_SPAN = 16;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeNow = Date.now;

/**
 * Creates a function that'll short out and invoke `identity` instead
 * of `func` when it's called `HOT_COUNT` or more times in `HOT_SPAN`
 * milliseconds.
 *
 * @private
 * @param {Function} func The function to restrict.
 * @returns {Function} Returns the new shortable function.
 */
function shortOut(func) {
  var count = 0,
      lastCalled = 0;

  return function() {
    var stamp = nativeNow(),
        remaining = HOT_SPAN - (stamp - lastCalled);

    lastCalled = stamp;
    if (remaining > 0) {
      if (++count >= HOT_COUNT) {
        return arguments[0];
      }
    } else {
      count = 0;
    }
    return func.apply(undefined, arguments);
  };
}

var _shortOut = shortOut;

/**
 * Sets the `toString` method of `func` to return `string`.
 *
 * @private
 * @param {Function} func The function to modify.
 * @param {Function} string The `toString` result.
 * @returns {Function} Returns `func`.
 */
var setToString = _shortOut(_baseSetToString);

var _setToString = setToString;

/**
 * The base implementation of `_.rest` which doesn't validate or coerce arguments.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @returns {Function} Returns the new function.
 */
function baseRest(func, start) {
  return _setToString(_overRest(func, start, identity_1), func + '');
}

var _baseRest = baseRest;

/**
 * Checks if the given arguments are from an iteratee call.
 *
 * @private
 * @param {*} value The potential iteratee value argument.
 * @param {*} index The potential iteratee index or key argument.
 * @param {*} object The potential iteratee object argument.
 * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
 *  else `false`.
 */
function isIterateeCall(value, index, object) {
  if (!isObject_1(object)) {
    return false;
  }
  var type = typeof index;
  if (type == 'number'
        ? (isArrayLike_1(object) && _isIndex(index, object.length))
        : (type == 'string' && index in object)
      ) {
    return eq_1(object[index], value);
  }
  return false;
}

var _isIterateeCall = isIterateeCall;

/**
 * Creates a function like `_.assign`.
 *
 * @private
 * @param {Function} assigner The function to assign values.
 * @returns {Function} Returns the new assigner function.
 */
function createAssigner(assigner) {
  return _baseRest(function(object, sources) {
    var index = -1,
        length = sources.length,
        customizer = length > 1 ? sources[length - 1] : undefined,
        guard = length > 2 ? sources[2] : undefined;

    customizer = (assigner.length > 3 && typeof customizer == 'function')
      ? (length--, customizer)
      : undefined;

    if (guard && _isIterateeCall(sources[0], sources[1], guard)) {
      customizer = length < 3 ? undefined : customizer;
      length = 1;
    }
    object = Object(object);
    while (++index < length) {
      var source = sources[index];
      if (source) {
        assigner(object, source, index, customizer);
      }
    }
    return object;
  });
}

var _createAssigner = createAssigner;

/**
 * This method is like `_.assign` except that it recursively merges own and
 * inherited enumerable string keyed properties of source objects into the
 * destination object. Source properties that resolve to `undefined` are
 * skipped if a destination value exists. Array and plain object properties
 * are merged recursively. Other objects and value types are overridden by
 * assignment. Source objects are applied from left to right. Subsequent
 * sources overwrite property assignments of previous sources.
 *
 * **Note:** This method mutates `object`.
 *
 * @static
 * @memberOf _
 * @since 0.5.0
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} [sources] The source objects.
 * @returns {Object} Returns `object`.
 * @example
 *
 * var object = {
 *   'a': [{ 'b': 2 }, { 'd': 4 }]
 * };
 *
 * var other = {
 *   'a': [{ 'c': 3 }, { 'e': 5 }]
 * };
 *
 * _.merge(object, other);
 * // => { 'a': [{ 'b': 2, 'c': 3 }, { 'd': 4, 'e': 5 }] }
 */
var merge = _createAssigner(function(object, source, srcIndex) {
  _baseMerge(object, source, srcIndex);
});

var merge_1 = merge;

// 

function isDomSelector (selector) {
  if (typeof selector !== 'string') {
    return false
  }

  try {
    if (typeof document === 'undefined') {
      throwError('mount must be run in a browser environment like PhantomJS, jsdom or chrome');
    }
  } catch (error) {
    throwError('mount must be run in a browser environment like PhantomJS, jsdom or chrome');
  }

  try {
    document.querySelector(selector);
    return true
  } catch (error) {
    return false
  }
}

function isVueComponent (component) {
  if (typeof component === 'function' && component.options) {
    return true
  }

  if (component === null || typeof component !== 'object') {
    return false
  }

  if (component.extends || component._Ctor) {
    return true
  }

  return typeof component.render === 'function'
}

function componentNeedsCompiling (component) {
  return component &&
    !component.render &&
    (component.template || component.extends) &&
    !component.functional
}

function isRefSelector (refOptionsObject) {
  if (typeof refOptionsObject !== 'object' || Object.keys(refOptionsObject || {}).length !== 1) {
    return false
  }

  return typeof refOptionsObject.ref === 'string'
}

function isNameSelector (nameOptionsObject) {
  if (typeof nameOptionsObject !== 'object' || nameOptionsObject === null) {
    return false
  }

  return !!nameOptionsObject.name
}

var NAME_SELECTOR = 'NAME_SELECTOR';
var COMPONENT_SELECTOR = 'COMPONENT_SELECTOR';
var REF_SELECTOR = 'REF_SELECTOR';
var DOM_SELECTOR = 'DOM_SELECTOR';
var VUE_VERSION = Number(((Vue.version.split('.')[0]) + "." + (Vue.version.split('.')[1])));
var FUNCTIONAL_OPTIONS = VUE_VERSION >= 2.5 ? 'fnOptions' : 'functionalOptions';

// 

function getSelectorTypeOrThrow (selector, methodName) {
  if (isDomSelector(selector)) { return DOM_SELECTOR }
  if (isNameSelector(selector)) { return NAME_SELECTOR }
  if (isVueComponent(selector)) { return COMPONENT_SELECTOR }
  if (isRefSelector(selector)) { return REF_SELECTOR }

  throwError(("wrapper." + methodName + "() must be passed a valid CSS selector, Vue constructor, or valid find option object"));
}

// 

function findAllVueComponentsFromVm (
  vm,
  components
) {
  if ( components === void 0 ) components = [];

  components.push(vm);
  vm.$children.forEach(function (child) {
    findAllVueComponentsFromVm(child, components);
  });

  return components
}

function findAllVueComponentsFromVnode (
  vnode,
  components
) {
  if ( components === void 0 ) components = [];

  if (vnode.child) {
    components.push(vnode.child);
  }
  if (vnode.children) {
    vnode.children.forEach(function (child) {
      findAllVueComponentsFromVnode(child, components);
    });
  }

  return components
}

function findAllFunctionalComponentsFromVnode (
  vnode,
  components
) {
  if ( components === void 0 ) components = [];

  if (vnode[FUNCTIONAL_OPTIONS] || vnode.functionalContext) {
    components.push(vnode);
  }
  if (vnode.children) {
    vnode.children.forEach(function (child) {
      findAllFunctionalComponentsFromVnode(child, components);
    });
  }
  return components
}

function vmCtorMatchesName (vm, name) {
  return !!((vm.$vnode && vm.$vnode.componentOptions &&
    vm.$vnode.componentOptions.Ctor.options.name === name) ||
    (vm._vnode &&
    vm._vnode.functionalOptions &&
    vm._vnode.functionalOptions.name === name) ||
    vm.$options && vm.$options.name === name ||
    vm.options && vm.options.name === name)
}

function vmCtorMatchesSelector (component, selector) {
  var Ctor = selector._Ctor || (selector.options && selector.options._Ctor);
  if (!Ctor) {
    return false
  }
  var Ctors = Object.keys(Ctor);
  return Ctors.some(function (c) { return Ctor[c] === component.__proto__.constructor; })
}

function vmFunctionalCtorMatchesSelector (component, Ctor) {
  if (VUE_VERSION < 2.3) {
    throwError('find for functional components is not support in Vue < 2.3');
  }

  if (!Ctor) {
    return false
  }

  if (!component[FUNCTIONAL_OPTIONS]) {
    return false
  }
  var Ctors = Object.keys(component[FUNCTIONAL_OPTIONS]._Ctor);
  return Ctors.some(function (c) { return Ctor[c] === component[FUNCTIONAL_OPTIONS]._Ctor[c]; })
}

function findVueComponents (
  root,
  selectorType,
  selector
) {
  if (selector.functional) {
    var nodes = root._vnode
      ? findAllFunctionalComponentsFromVnode(root._vnode)
      : findAllFunctionalComponentsFromVnode(root);
    return nodes.filter(function (node) { return vmFunctionalCtorMatchesSelector(node, selector._Ctor) ||
      node[FUNCTIONAL_OPTIONS].name === selector.name; }
    )
  }
  var nameSelector = typeof selector === 'function' ? selector.options.name : selector.name;
  var components = root._isVue
    ? findAllVueComponentsFromVm(root)
    : findAllVueComponentsFromVnode(root);
  return components.filter(function (component) {
    if (!component.$vnode && !component.$options.extends) {
      return false
    }
    return vmCtorMatchesSelector(component, selector) || vmCtorMatchesName(component, nameSelector)
  })
}

// 

var WrapperArray = function WrapperArray (wrappers) {
  this.wrappers = wrappers || [];
  this.length = this.wrappers.length;
};

WrapperArray.prototype.at = function at (index) {
  if (index > this.length - 1) {
    throwError(("no item exists at " + index));
  }
  return this.wrappers[index]
};

WrapperArray.prototype.attributes = function attributes () {
  this.throwErrorIfWrappersIsEmpty('attributes');

  throwError('attributes must be called on a single wrapper, use at(i) to access a wrapper');
};

WrapperArray.prototype.classes = function classes () {
  this.throwErrorIfWrappersIsEmpty('classes');

  throwError('classes must be called on a single wrapper, use at(i) to access a wrapper');
};

WrapperArray.prototype.contains = function contains (selector) {
  this.throwErrorIfWrappersIsEmpty('contains');

  return this.wrappers.every(function (wrapper) { return wrapper.contains(selector); })
};

WrapperArray.prototype.exists = function exists () {
  return this.length > 0 && this.wrappers.every(function (wrapper) { return wrapper.exists(); })
};

WrapperArray.prototype.filter = function filter (predicate) {
  return new WrapperArray(this.wrappers.filter(predicate))
};

WrapperArray.prototype.visible = function visible () {
  this.throwErrorIfWrappersIsEmpty('visible');

  return this.length > 0 && this.wrappers.every(function (wrapper) { return wrapper.visible(); })
};

WrapperArray.prototype.emitted = function emitted () {
  this.throwErrorIfWrappersIsEmpty('emitted');

  throwError('emitted must be called on a single wrapper, use at(i) to access a wrapper');
};

WrapperArray.prototype.emittedByOrder = function emittedByOrder () {
  this.throwErrorIfWrappersIsEmpty('emittedByOrder');

  throwError('emittedByOrder must be called on a single wrapper, use at(i) to access a wrapper');
};

WrapperArray.prototype.hasAttribute = function hasAttribute (attribute, value) {
  this.throwErrorIfWrappersIsEmpty('hasAttribute');

  return this.wrappers.every(function (wrapper) { return wrapper.hasAttribute(attribute, value); })
};

WrapperArray.prototype.hasClass = function hasClass (className) {
  this.throwErrorIfWrappersIsEmpty('hasClass');

  return this.wrappers.every(function (wrapper) { return wrapper.hasClass(className); })
};

WrapperArray.prototype.hasProp = function hasProp (prop, value) {
  this.throwErrorIfWrappersIsEmpty('hasProp');

  return this.wrappers.every(function (wrapper) { return wrapper.hasProp(prop, value); })
};

WrapperArray.prototype.hasStyle = function hasStyle (style, value) {
  this.throwErrorIfWrappersIsEmpty('hasStyle');

  return this.wrappers.every(function (wrapper) { return wrapper.hasStyle(style, value); })
};

WrapperArray.prototype.findAll = function findAll () {
  this.throwErrorIfWrappersIsEmpty('findAll');

  throwError('findAll must be called on a single wrapper, use at(i) to access a wrapper');
};

WrapperArray.prototype.find = function find () {
  this.throwErrorIfWrappersIsEmpty('find');

  throwError('find must be called on a single wrapper, use at(i) to access a wrapper');
};

WrapperArray.prototype.html = function html () {
  this.throwErrorIfWrappersIsEmpty('html');

  throwError('html must be called on a single wrapper, use at(i) to access a wrapper');
};

WrapperArray.prototype.is = function is (selector) {
  this.throwErrorIfWrappersIsEmpty('is');

  return this.wrappers.every(function (wrapper) { return wrapper.is(selector); })
};

WrapperArray.prototype.isEmpty = function isEmpty () {
  this.throwErrorIfWrappersIsEmpty('isEmpty');

  return this.wrappers.every(function (wrapper) { return wrapper.isEmpty(); })
};

WrapperArray.prototype.isVisible = function isVisible () {
  this.throwErrorIfWrappersIsEmpty('isVisible');

  return this.wrappers.every(function (wrapper) { return wrapper.isVisible(); })
};

WrapperArray.prototype.isVueInstance = function isVueInstance () {
  this.throwErrorIfWrappersIsEmpty('isVueInstance');

  return this.wrappers.every(function (wrapper) { return wrapper.isVueInstance(); })
};

WrapperArray.prototype.name = function name () {
  this.throwErrorIfWrappersIsEmpty('name');

  throwError('name must be called on a single wrapper, use at(i) to access a wrapper');
};

WrapperArray.prototype.props = function props () {
  this.throwErrorIfWrappersIsEmpty('props');

  throwError('props must be called on a single wrapper, use at(i) to access a wrapper');
};

WrapperArray.prototype.text = function text () {
  this.throwErrorIfWrappersIsEmpty('text');

  throwError('text must be called on a single wrapper, use at(i) to access a wrapper');
};

WrapperArray.prototype.throwErrorIfWrappersIsEmpty = function throwErrorIfWrappersIsEmpty (method) {
  if (this.wrappers.length === 0) {
    throwError((method + " cannot be called on 0 items"));
  }
};

WrapperArray.prototype.setComputed = function setComputed (computed) {
  this.throwErrorIfWrappersIsEmpty('setComputed');

  this.wrappers.forEach(function (wrapper) { return wrapper.setComputed(computed); });
};

WrapperArray.prototype.setData = function setData (data) {
  this.throwErrorIfWrappersIsEmpty('setData');

  this.wrappers.forEach(function (wrapper) { return wrapper.setData(data); });
};

WrapperArray.prototype.setMethods = function setMethods (props) {
  this.throwErrorIfWrappersIsEmpty('setMethods');

  this.wrappers.forEach(function (wrapper) { return wrapper.setMethods(props); });
};

WrapperArray.prototype.setProps = function setProps (props) {
  this.throwErrorIfWrappersIsEmpty('setProps');

  this.wrappers.forEach(function (wrapper) { return wrapper.setProps(props); });
};

WrapperArray.prototype.trigger = function trigger (event, options) {
  this.throwErrorIfWrappersIsEmpty('trigger');

  this.wrappers.forEach(function (wrapper) { return wrapper.trigger(event, options); });
};

WrapperArray.prototype.update = function update () {
  this.throwErrorIfWrappersIsEmpty('update');
  warn('update has been removed. All changes are now synchrnous without calling update');
};

WrapperArray.prototype.destroy = function destroy () {
  this.throwErrorIfWrappersIsEmpty('destroy');

  this.wrappers.forEach(function (wrapper) { return wrapper.destroy(); });
};

// 

var ErrorWrapper = function ErrorWrapper (selector) {
  this.selector = selector;
};

ErrorWrapper.prototype.at = function at () {
  throwError(("find did not return " + (this.selector) + ", cannot call at() on empty Wrapper"));
};

ErrorWrapper.prototype.attributes = function attributes () {
  throwError(("find did not return " + (this.selector) + ", cannot call attributes() on empty Wrapper"));
};

ErrorWrapper.prototype.classes = function classes () {
  throwError(("find did not return " + (this.selector) + ", cannot call classes() on empty Wrapper"));
};

ErrorWrapper.prototype.contains = function contains () {
  throwError(("find did not return " + (this.selector) + ", cannot call contains() on empty Wrapper"));
};

ErrorWrapper.prototype.emitted = function emitted () {
  throwError(("find did not return " + (this.selector) + ", cannot call emitted() on empty Wrapper"));
};

ErrorWrapper.prototype.emittedByOrder = function emittedByOrder () {
  throwError(("find did not return " + (this.selector) + ", cannot call emittedByOrder() on empty Wrapper"));
};

ErrorWrapper.prototype.exists = function exists () {
  return false
};

ErrorWrapper.prototype.filter = function filter () {
  throwError(("find did not return " + (this.selector) + ", cannot call filter() on empty Wrapper"));
};

ErrorWrapper.prototype.visible = function visible () {
  throwError(("find did not return " + (this.selector) + ", cannot call visible() on empty Wrapper"));
};

ErrorWrapper.prototype.hasAttribute = function hasAttribute () {
  throwError(("find did not return " + (this.selector) + ", cannot call hasAttribute() on empty Wrapper"));
};

ErrorWrapper.prototype.hasClass = function hasClass () {
  throwError(("find did not return " + (this.selector) + ", cannot call hasClass() on empty Wrapper"));
};

ErrorWrapper.prototype.hasProp = function hasProp () {
  throwError(("find did not return " + (this.selector) + ", cannot call hasProp() on empty Wrapper"));
};

ErrorWrapper.prototype.hasStyle = function hasStyle () {
  throwError(("find did not return " + (this.selector) + ", cannot call hasStyle() on empty Wrapper"));
};

ErrorWrapper.prototype.findAll = function findAll () {
  throwError(("find did not return " + (this.selector) + ", cannot call findAll() on empty Wrapper"));
};

ErrorWrapper.prototype.find = function find () {
  throwError(("find did not return " + (this.selector) + ", cannot call find() on empty Wrapper"));
};

ErrorWrapper.prototype.html = function html () {
  throwError(("find did not return " + (this.selector) + ", cannot call html() on empty Wrapper"));
};

ErrorWrapper.prototype.is = function is () {
  throwError(("find did not return " + (this.selector) + ", cannot call is() on empty Wrapper"));
};

ErrorWrapper.prototype.isEmpty = function isEmpty () {
  throwError(("find did not return " + (this.selector) + ", cannot call isEmpty() on empty Wrapper"));
};

ErrorWrapper.prototype.isVisible = function isVisible () {
  throwError(("find did not return " + (this.selector) + ", cannot call isVisible() on empty Wrapper"));
};

ErrorWrapper.prototype.isVueInstance = function isVueInstance () {
  throwError(("find did not return " + (this.selector) + ", cannot call isVueInstance() on empty Wrapper"));
};

ErrorWrapper.prototype.name = function name () {
  throwError(("find did not return " + (this.selector) + ", cannot call name() on empty Wrapper"));
};

ErrorWrapper.prototype.props = function props () {
  throwError(("find did not return " + (this.selector) + ", cannot call props() on empty Wrapper"));
};

ErrorWrapper.prototype.text = function text () {
  throwError(("find did not return " + (this.selector) + ", cannot call text() on empty Wrapper"));
};

ErrorWrapper.prototype.setComputed = function setComputed () {
  throwError(("find did not return " + (this.selector) + ", cannot call setComputed() on empty Wrapper"));
};

ErrorWrapper.prototype.setData = function setData () {
  throwError(("find did not return " + (this.selector) + ", cannot call setData() on empty Wrapper"));
};

ErrorWrapper.prototype.setMethods = function setMethods () {
  throwError(("find did not return " + (this.selector) + ", cannot call setMethods() on empty Wrapper"));
};

ErrorWrapper.prototype.setProps = function setProps () {
  throwError(("find did not return " + (this.selector) + ", cannot call setProps() on empty Wrapper"));
};

ErrorWrapper.prototype.trigger = function trigger () {
  throwError(("find did not return " + (this.selector) + ", cannot call trigger() on empty Wrapper"));
};

ErrorWrapper.prototype.update = function update () {
  throwError("update has been removed from vue-test-utils. All updates are now synchronous by default");
};

ErrorWrapper.prototype.destroy = function destroy () {
  throwError(("find did not return " + (this.selector) + ", cannot call destroy() on empty Wrapper"));
};

// 

function findAllVNodes (vnode, nodes) {
  if ( nodes === void 0 ) nodes = [];

  nodes.push(vnode);

  if (Array.isArray(vnode.children)) {
    vnode.children.forEach(function (childVNode) {
      findAllVNodes(childVNode, nodes);
    });
  }

  if (vnode.child) {
    findAllVNodes(vnode.child._vnode, nodes);
  }

  return nodes
}

function removeDuplicateNodes (vNodes) {
  return vNodes.filter(function (vNode, index) { return index === vNodes.findIndex(function (node) { return vNode.elm === node.elm; }); })
}

function nodeMatchesRef (node, refName) {
  return node.data && node.data.ref === refName
}

function findVNodesByRef (vNode, refName) {
  var nodes = findAllVNodes(vNode);
  var refFilteredNodes = nodes.filter(function (node) { return nodeMatchesRef(node, refName); });
  // Only return refs defined on top-level VNode to provide the same
  // behavior as selecting via vm.$ref.{someRefName}
  var mainVNodeFilteredNodes = refFilteredNodes.filter(function (node) { return (
    !!vNode.context.$refs[node.data.ref]
  ); });
  return removeDuplicateNodes(mainVNodeFilteredNodes)
}

function nodeMatchesSelector (node, selector) {
  return node.elm && node.elm.getAttribute && node.elm.matches(selector)
}

function findVNodesBySelector (
  vNode,
  selector
) {
  var nodes = findAllVNodes(vNode);
  var filteredNodes = nodes.filter(function (node) { return (
    nodeMatchesSelector(node, selector)
  ); });
  return removeDuplicateNodes(filteredNodes)
}

function findVnodes (
  vnode,
  vm,
  selectorType,
  selector
) {
  if (selectorType === REF_SELECTOR) {
    if (!vm) {
      throwError('$ref selectors can only be used on Vue component wrappers');
    }
    // $FlowIgnore
    return findVNodesByRef(vnode, selector.ref)
  }
  // $FlowIgnore
  return findVNodesBySelector(vnode, selector)
}

// 

function findDOMNodes (
  element,
  selector
) {
  var nodes = [];
  if (!element || !element.querySelectorAll || !element.matches) {
    return nodes
  }

  if (element.matches(selector)) {
    nodes.push(element);
  }
  // $FlowIgnore
  return nodes.concat([].slice.call(element.querySelectorAll(selector)))
}

// 

function find (
  vm,
  vnode,
  element,
  selector
) {
  var selectorType = getSelectorTypeOrThrow(selector, 'find');

  if (!vnode && !vm && selectorType !== DOM_SELECTOR) {
    throwError('cannot find a Vue instance on a DOM node. The node you are calling find on does not exist in the VDom. Are you adding the node as innerHTML?');
  }

  if (selectorType === COMPONENT_SELECTOR || selectorType === NAME_SELECTOR) {
    var root = vm || vnode;
    if (!root) {
      return []
    }
    return findVueComponents(root, selectorType, selector)
  }

  if (vm && vm.$refs && selector.ref in vm.$refs && vm.$refs[selector.ref] instanceof Vue) {
    return [vm.$refs[selector.ref]]
  }

  if (vnode) {
    var nodes = findVnodes(vnode, vm, selectorType, selector);
    if (selectorType !== DOM_SELECTOR) {
      return nodes
    }
    return nodes.length > 0 ? nodes : findDOMNodes(element, selector)
  }

  return findDOMNodes(element, selector)
}

// 

function createWrapper (
  node,
  options
) {
  return node instanceof Vue
    ? new VueWrapper(node, options)
    : new Wrapper(node, options)
}

var i = 0;

function orderDeps (watcher) {
  watcher.deps.forEach(function (dep) {
    if (dep._sortedId === i) {
      return
    }
    dep._sortedId = i;
    dep.subs.forEach(orderDeps);
    dep.subs = dep.subs.sort(function (a, b) { return a.id - b.id; });
  });
}

function orderVmWatchers (vm) {
  if (vm._watchers) {
    vm._watchers.forEach(orderDeps);
  }

  if (vm._computedWatchers) {
    Object.keys(vm._computedWatchers).forEach(function (computedWatcher) {
      orderDeps(vm._computedWatchers[computedWatcher]);
    });
  }

  vm._watcher && orderDeps(vm._watcher);

  vm.$children.forEach(orderVmWatchers);
}

function orderWatchers (vm) {
  orderVmWatchers(vm);
  i++;
}

// 

var Wrapper = function Wrapper (node, options) {
  if (node instanceof Element) {
    this.element = node;
    this.vnode = null;
  } else {
    this.vnode = node;
    this.element = node.elm;
  }
  if (this.vnode && (this.vnode[FUNCTIONAL_OPTIONS] || this.vnode.functionalContext)) {
    this.isFunctionalComponent = true;
  }
  this.options = options;
  this.version = Number(((Vue.version.split('.')[0]) + "." + (Vue.version.split('.')[1])));
};

Wrapper.prototype.at = function at () {
  throwError('at() must be called on a WrapperArray');
};

/**
 * Returns an Object containing all the attribute/value pairs on the element.
 */
Wrapper.prototype.attributes = function attributes () {
  var attributes = this.element.attributes;
  var attributeMap = {};
  for (var i = 0; i < attributes.length; i++) {
    var att = attributes.item(i);
    attributeMap[att.localName] = att.value;
  }
  return attributeMap
};

/**
 * Returns an Array containing all the classes on the element
 */
Wrapper.prototype.classes = function classes () {
    var this$1 = this;

  // works for HTML Element and SVG Element
  var className = this.element.getAttribute('class');
  var classes = className ? className.split(' ') : [];
  // Handle converting cssmodules identifiers back to the original class name
  if (this.vm && this.vm.$style) {
    var cssModuleIdentifiers = {};
    var moduleIdent;
    Object.keys(this.vm.$style).forEach(function (key) {
      // $FlowIgnore : Flow thinks vm is a property
      moduleIdent = this$1.vm.$style[key];
      // CSS Modules may be multi-class if they extend others.
      // Extended classes should be already present in $style.
      moduleIdent = moduleIdent.split(' ')[0];
      cssModuleIdentifiers[moduleIdent] = key;
    });
    classes = classes.map(function (className) { return cssModuleIdentifiers[className] || className; });
  }
  return classes
};

/**
 * Checks if wrapper contains provided selector.
 */
Wrapper.prototype.contains = function contains (selector) {
  var selectorType = getSelectorTypeOrThrow(selector, 'contains');
  var nodes = find(this.vm, this.vnode, this.element, selector);
  var is = selectorType === REF_SELECTOR ? false : this.is(selector);
  return nodes.length > 0 || is
};

/**
 * Returns an object containing custom events emitted by the Wrapper vm
 */
Wrapper.prototype.emitted = function emitted (event) {
  if (!this._emitted && !this.vm) {
    throwError('wrapper.emitted() can only be called on a Vue instance');
  }
  if (event) {
    return this._emitted[event]
  }
  return this._emitted
};

/**
 * Returns an Array containing custom events emitted by the Wrapper vm
 */
Wrapper.prototype.emittedByOrder = function emittedByOrder () {
  if (!this._emittedByOrder && !this.vm) {
    throwError('wrapper.emittedByOrder() can only be called on a Vue instance');
  }
  return this._emittedByOrder
};

/**
 * Utility to check wrapper exists. Returns true as Wrapper always exists
 */
Wrapper.prototype.exists = function exists () {
  if (this.vm) {
    return !!this.vm && !this.vm._isDestroyed
  }
  return true
};

Wrapper.prototype.filter = function filter () {
  throwError('filter() must be called on a WrapperArray');
};

/**
 * Utility to check wrapper is visible. Returns false if a parent element has display: none or visibility: hidden style.
 */
Wrapper.prototype.visible = function visible () {
  warn('visible has been deprecated and will be removed in version 1, use isVisible instead');

  var element = this.element;

  if (!element) {
    return false
  }

  while (element) {
    if (element.style && (element.style.visibility === 'hidden' || element.style.display === 'none')) {
      return false
    }
    element = element.parentElement;
  }

  return true
};

/**
 * Checks if wrapper has an attribute with matching value
 */
Wrapper.prototype.hasAttribute = function hasAttribute (attribute, value) {
  warn('hasAttribute() has been deprecated and will be removed in version 1.0.0. Use attributes() instead—https://vue-test-utils.vuejs.org/en/api/wrapper/attributes');

  if (typeof attribute !== 'string') {
    throwError('wrapper.hasAttribute() must be passed attribute as a string');
  }

  if (typeof value !== 'string') {
    throwError('wrapper.hasAttribute() must be passed value as a string');
  }

  return !!(this.element && this.element.getAttribute(attribute) === value)
};

/**
 * Asserts wrapper has a class name
 */
Wrapper.prototype.hasClass = function hasClass (className) {
    var this$1 = this;

  warn('hasClass() has been deprecated and will be removed in version 1.0.0. Use classes() instead—https://vue-test-utils.vuejs.org/en/api/wrapper/classes');
  var targetClass = className;

  if (typeof targetClass !== 'string') {
    throwError('wrapper.hasClass() must be passed a string');
  }

  // if $style is available and has a matching target, use that instead.
  if (this.vm && this.vm.$style && this.vm.$style[targetClass]) {
    targetClass = this.vm.$style[targetClass];
  }

  var containsAllClasses = targetClass
    .split(' ')
    .every(function (target) { return this$1.element.classList.contains(target); });

  return !!(this.element && containsAllClasses)
};

/**
 * Asserts wrapper has a prop name
 */
Wrapper.prototype.hasProp = function hasProp (prop, value) {
  warn('hasProp() has been deprecated and will be removed in version 1.0.0. Use props() instead—https://vue-test-utils.vuejs.org/en/api/wrapper/props');

  if (!this.isVueComponent) {
    throwError('wrapper.hasProp() must be called on a Vue instance');
  }
  if (typeof prop !== 'string') {
    throwError('wrapper.hasProp() must be passed prop as a string');
  }

  // $props object does not exist in Vue 2.1.x, so use $options.propsData instead
  if (this.vm && this.vm.$options && this.vm.$options.propsData && this.vm.$options.propsData[prop] === value) {
    return true
  }

  return !!this.vm && !!this.vm.$props && this.vm.$props[prop] === value
};

/**
 * Checks if wrapper has a style with value
 */
Wrapper.prototype.hasStyle = function hasStyle (style, value) {
  warn('hasStyle() has been deprecated and will be removed in version 1.0.0. Use wrapper.element.style instead');

  if (typeof style !== 'string') {
    throwError('wrapper.hasStyle() must be passed style as a string');
  }

  if (typeof value !== 'string') {
    throwError('wrapper.hasClass() must be passed value as string');
  }

  /* istanbul ignore next */
  if (navigator.userAgent.includes && (navigator.userAgent.includes('node.js') || navigator.userAgent.includes('jsdom'))) {
    console.warn('wrapper.hasStyle is not fully supported when running jsdom - only inline styles are supported'); // eslint-disable-line no-console
  }
  var body = document.querySelector('body');
  var mockElement = document.createElement('div');

  if (!(body instanceof Element)) {
    return false
  }
  var mockNode = body.insertBefore(mockElement, null);
  // $FlowIgnore : Flow thinks style[style] returns a number
  mockElement.style[style] = value;

  if (!this.options.attachedToDocument && (this.vm || this.vnode)) {
    // $FlowIgnore : Possible null value, will be removed in 1.0.0
    var vm = this.vm || this.vnode.context.$root;
    body.insertBefore(vm.$root._vnode.elm, null);
  }

  var elStyle = window.getComputedStyle(this.element)[style];
  var mockNodeStyle = window.getComputedStyle(mockNode)[style];
  return !!(elStyle && mockNodeStyle && elStyle === mockNodeStyle)
};

/**
 * Finds first node in tree of the current wrapper that matches the provided selector.
 */
Wrapper.prototype.find = function find$$1 (selector) {
  var nodes = find(this.vm, this.vnode, this.element, selector);
  if (nodes.length === 0) {
    if (selector.ref) {
      return new ErrorWrapper(("ref=\"" + (selector.ref) + "\""))
    }
    return new ErrorWrapper(typeof selector === 'string' ? selector : 'Component')
  }
  return createWrapper(nodes[0], this.options)
};

/**
 * Finds node in tree of the current wrapper that matches the provided selector.
 */
Wrapper.prototype.findAll = function findAll$1 (selector) {
    var this$1 = this;

  getSelectorTypeOrThrow(selector, 'findAll');
  var nodes = find(this.vm, this.vnode, this.element, selector);
  var wrappers = nodes.map(function (node) { return createWrapper(node, this$1.options); }
  );
  return new WrapperArray(wrappers)
};

/**
 * Returns HTML of element as a string
 */
Wrapper.prototype.html = function html () {
  return this.element.outerHTML
};

/**
 * Checks if node matches selector
 */
Wrapper.prototype.is = function is (selector) {
  var selectorType = getSelectorTypeOrThrow(selector, 'is');

  if (selectorType === NAME_SELECTOR) {
    if (!this.vm) {
      return false
    }
    return vmCtorMatchesName(this.vm, selector.name)
  }

  if (selectorType === COMPONENT_SELECTOR) {
    if (!this.vm) {
      return false
    }
    if (selector.functional) {
      return vmFunctionalCtorMatchesSelector(this.vm._vnode, selector._Ctor)
    }
    return vmCtorMatchesSelector(this.vm, selector)
  }

  if (selectorType === REF_SELECTOR) {
    throwError('$ref selectors can not be used with wrapper.is()');
  }

  if (typeof selector === 'object') {
    return false
  }

  return !!(this.element &&
  this.element.getAttribute &&
  this.element.matches(selector))
};

/**
 * Checks if node is empty
 */
Wrapper.prototype.isEmpty = function isEmpty () {
  if (!this.vnode) {
    return this.element.innerHTML === ''
  }
  if (this.vnode.children) {
    return this.vnode.children.every(function (vnode) { return vnode.isComment; })
  }
  return this.vnode.children === undefined || this.vnode.children.length === 0
};

/**
 * Checks if node is visible
 */
Wrapper.prototype.isVisible = function isVisible () {
  var element = this.element;

  if (!element) {
    return false
  }

  while (element) {
    if (element.style && (element.style.visibility === 'hidden' || element.style.display === 'none')) {
      return false
    }
    element = element.parentElement;
  }

  return true
};

/**
 * Checks if wrapper is a vue instance
 */
Wrapper.prototype.isVueInstance = function isVueInstance () {
  return !!this.isVueComponent
};

/**
 * Returns name of component, or tag name if node is not a Vue component
 */
Wrapper.prototype.name = function name () {
  if (this.vm) {
    return this.vm.$options.name
  }

  if (!this.vnode) {
    return this.element.tagName
  }

  return this.vnode.tag
};

/**
 * Returns an Object containing the prop name/value pairs on the element
 */
Wrapper.prototype.props = function props () {
  if (this.isFunctionalComponent) {
    throwError('wrapper.props() cannot be called on a mounted functional component.');
  }
  if (!this.vm) {
    throwError('wrapper.props() must be called on a Vue instance');
  }
  // $props object does not exist in Vue 2.1.x, so use $options.propsData instead
  var _props;
  if (this.vm && this.vm.$options && this.vm.$options.propsData) {
    _props = this.vm.$options.propsData;
  } else {
    // $FlowIgnore
    _props = this.vm.$props;
  }
  return _props || {} // Return an empty object if no props exist
};

/**
 * Sets vm data
 */
Wrapper.prototype.setData = function setData (data) {
    var this$1 = this;

  if (this.isFunctionalComponent) {
    throwError('wrapper.setData() canot be called on a functional component');
  }

  if (!this.vm) {
    throwError('wrapper.setData() can only be called on a Vue instance');
  }

  Object.keys(data).forEach(function (key) {
    if (typeof data[key] === 'object' && data[key] !== null) {
      // $FlowIgnore : Problem with possibly null this.vm
      var newObj = merge_1(this$1.vm[key], data[key]);
      // $FlowIgnore : Problem with possibly null this.vm
      this$1.vm.$set(this$1.vm, [key], newObj);
    } else {
      // $FlowIgnore : Problem with possibly null this.vm
      this$1.vm.$set(this$1.vm, [key], data[key]);
    }
  });
};

/**
 * Sets vm computed
 */
Wrapper.prototype.setComputed = function setComputed (computed) {
    var this$1 = this;

  if (!this.isVueComponent) {
    throwError('wrapper.setComputed() can only be called on a Vue instance');
  }

  warn('setComputed() has been deprecated and will be removed in version 1.0.0. You can overwrite computed properties by passing a computed object in the mounting options');

  Object.keys(computed).forEach(function (key) {
    if (this$1.version > 2.1) {
      // $FlowIgnore : Problem with possibly null this.vm
      if (!this$1.vm._computedWatchers[key]) {
        throwError(("wrapper.setComputed() was passed a value that does not exist as a computed property on the Vue instance. Property " + key + " does not exist on the Vue instance"));
      }
      // $FlowIgnore : Problem with possibly null this.vm
      this$1.vm._computedWatchers[key].value = computed[key];
      // $FlowIgnore : Problem with possibly null this.vm
      this$1.vm._computedWatchers[key].getter = function () { return computed[key]; };
    } else {
      var isStore = false;
      // $FlowIgnore : Problem with possibly null this.vm
      this$1.vm._watchers.forEach(function (watcher) {
        if (watcher.getter.vuex && key in watcher.vm.$options.store.getters) {
          watcher.vm.$options.store.getters = Object.assign({}, watcher.vm.$options.store.getters);
          Object.defineProperty(watcher.vm.$options.store.getters, key, { get: function () { return computed[key] } });
          isStore = true;
        }
      });

      // $FlowIgnore : Problem with possibly null this.vm
      if (!isStore && !this$1.vm._watchers.some(function (w) { return w.getter.name === key; })) {
        throwError(("wrapper.setComputed() was passed a value that does not exist as a computed property on the Vue instance. Property " + key + " does not exist on the Vue instance"));
      }
      // $FlowIgnore : Problem with possibly null this.vm
      this$1.vm._watchers.forEach(function (watcher) {
        if (watcher.getter.name === key) {
          watcher.value = computed[key];
          watcher.getter = function () { return computed[key]; };
        }
      });
    }
  });
  // $FlowIgnore : Problem with possibly null this.vm
  this.vm._watchers.forEach(function (watcher) {
    watcher.run();
  });
};

/**
 * Sets vm methods
 */
Wrapper.prototype.setMethods = function setMethods (methods) {
    var this$1 = this;

  if (!this.isVueComponent) {
    throwError('wrapper.setMethods() can only be called on a Vue instance');
  }
  Object.keys(methods).forEach(function (key) {
    // $FlowIgnore : Problem with possibly null this.vm
    this$1.vm[key] = methods[key];
    // $FlowIgnore : Problem with possibly null this.vm
    this$1.vm.$options.methods[key] = methods[key];
  });
};

/**
 * Sets vm props
 */
Wrapper.prototype.setProps = function setProps (data) {
    var this$1 = this;

  if (this.isFunctionalComponent) {
    throwError('wrapper.setProps() canot be called on a functional component');
  }
  if (!this.isVueComponent || !this.vm) {
    throwError('wrapper.setProps() can only be called on a Vue instance');
  }
  if (this.vm && this.vm.$options && !this.vm.$options.propsData) {
    this.vm.$options.propsData = {};
  }
  Object.keys(data).forEach(function (key) {
    // Ignore properties that were not specified in the component options
    // $FlowIgnore : Problem with possibly null this.vm
    if (!this$1.vm.$options._propKeys || !this$1.vm.$options._propKeys.includes(key)) {
      throwError(("wrapper.setProps() called with " + key + " property which is not defined on component"));
    }

    // $FlowIgnore : Problem with possibly null this.vm
    if (this$1.vm._props) {
      this$1.vm._props[key] = data[key];
      // $FlowIgnore : Problem with possibly null this.vm.$props
      this$1.vm.$props[key] = data[key];
      // $FlowIgnore : Problem with possibly null this.vm.$options
      this$1.vm.$options.propsData[key] = data[key];
    } else {
      // $FlowIgnore : Problem with possibly null this.vm
      this$1.vm[key] = data[key];
      // $FlowIgnore : Problem with possibly null this.vm.$options
      this$1.vm.$options.propsData[key] = data[key];
    }
  });

  // $FlowIgnore : Problem with possibly null this.vm
  this.vnode = this.vm._vnode;
  orderWatchers(this.vm || this.vnode.context.$root);
};

/**
 * Return text of wrapper element
 */
Wrapper.prototype.text = function text () {
  if (!this.element) {
    throwError('cannot call wrapper.text() on a wrapper without an element');
  }

  return this.element.textContent.trim()
};

/**
 * Calls destroy on vm
 */
Wrapper.prototype.destroy = function destroy () {
  if (!this.isVueComponent) {
    throwError('wrapper.destroy() can only be called on a Vue instance');
  }
  if(this.element.parentNode && this.options.root) {
    this.element.parentNode.parentNode.removeChild(this.element.parentNode);
  }
  if (this.element.parentNode) {
    this.element.parentNode.removeChild(this.element);
  }
  // $FlowIgnore
  this.vm.$destroy();
};

/**
 * Dispatches a DOM event on wrapper
 */
Wrapper.prototype.trigger = function trigger (type, options) {
    if ( options === void 0 ) options = {};

  if (typeof type !== 'string') {
    throwError('wrapper.trigger() must be passed a string');
  }

  if (!this.element) {
    throwError('cannot call wrapper.trigger() on a wrapper without an element');
  }

  if (options.target) {
    throwError('you cannot set the target value of an event. See the notes section of the docs for more details—https://vue-test-utils.vuejs.org/en/api/wrapper/trigger.html');
  }

  // Don't fire event on a disabled element
  if (this.attributes().disabled) {
    return
  }

  var modifiers = {
    enter: 13,
    tab: 9,
    delete: 46,
    esc: 27,
    space: 32,
    up: 38,
    down: 40,
    left: 37,
    right: 39,
    end: 35,
    home: 36,
    backspace: 8,
    insert: 45,
    pageup: 33,
    pagedown: 34
  };

  var event = type.split('.');

  var eventObject;

  // Fallback for IE10,11 - https://stackoverflow.com/questions/26596123
  if (typeof (window.Event) === 'function') {
    eventObject = new window.Event(event[0], {
      bubbles: true,
      cancelable: true
    });
  } else {
    eventObject = document.createEvent('Event');
    eventObject.initEvent(event[0], true, true);
  }

  if (options) {
    Object.keys(options).forEach(function (key) {
      // $FlowIgnore
      eventObject[key] = options[key];
    });
  }

  if (event.length === 2) {
    // $FlowIgnore
    eventObject.keyCode = modifiers[event[1]];
  }

  this.element.dispatchEvent(eventObject);
  if (this.vnode) {
    orderWatchers(this.vm || this.vnode.context.$root);
  }
};

Wrapper.prototype.update = function update () {
  warn('update has been removed from vue-test-utils. All updates are now synchronous by default');
};

function setDepsSync (dep) {
  dep.subs.forEach(setWatcherSync);
}

function setWatcherSync (watcher) {
  if (watcher.sync === true) {
    return
  }
  watcher.sync = true;
  watcher.deps.forEach(setDepsSync);
}

function setWatchersToSync (vm) {
  if (vm._watchers) {
    vm._watchers.forEach(setWatcherSync);
  }

  if (vm._computedWatchers) {
    Object.keys(vm._computedWatchers).forEach(function (computedWatcher) {
      setWatcherSync(vm._computedWatchers[computedWatcher]);
    });
  }

  setWatcherSync(vm._watcher);

  vm.$children.forEach(setWatchersToSync);
}

// 

var VueWrapper = (function (Wrapper$$1) {
  function VueWrapper (vm, options) {
    Wrapper$$1.call(this, vm._vnode, options);

    // $FlowIgnore : issue with defineProperty - https://github.com/facebook/flow/issues/285
    Object.defineProperty(this, 'vnode', ({
      get: function () { return vm._vnode; },
      set: function () {}
    }));
    // $FlowIgnore
    Object.defineProperty(this, 'element', ({
      get: function () { return vm.$el; },
      set: function () {}
    }));
    this.vm = vm;
    if (options.sync) {
      setWatchersToSync(vm);
      orderWatchers(vm);
    }
    this.isVueComponent = true;
    this.isFunctionalComponent = vm.$options._isFunctionalContainer;
    this._emitted = vm.__emitted;
    this._emittedByOrder = vm.__emittedByOrder;
  }

  if ( Wrapper$$1 ) VueWrapper.__proto__ = Wrapper$$1;
  VueWrapper.prototype = Object.create( Wrapper$$1 && Wrapper$$1.prototype );
  VueWrapper.prototype.constructor = VueWrapper;

  return VueWrapper;
}(Wrapper));

// 

function isValidSlot (slot) {
  return Array.isArray(slot) || (slot !== null && typeof slot === 'object') || typeof slot === 'string'
}

function validateSlots (slots) {
  slots && Object.keys(slots).forEach(function (key) {
    if (!isValidSlot(slots[key])) {
      throwError('slots[key] must be a Component, string or an array of Components');
    }

    if (Array.isArray(slots[key])) {
      slots[key].forEach(function (slotValue) {
        if (!isValidSlot(slotValue)) {
          throwError('slots[key] must be a Component, string or an array of Components');
        }
      });
    }
  });
}

// 

function isSingleElement (slotValue) {
  var _slotValue = slotValue.trim();
  if (_slotValue[0] !== '<' || _slotValue[_slotValue.length - 1] !== '>') {
    return false
  }
  var domParser = new window.DOMParser();
  var _document = domParser.parseFromString(slotValue, 'text/html');
  return _document.body.childElementCount === 1
}

// see https://github.com/vuejs/vue-test-utils/pull/274
function createVNodes (vm, slotValue) {
  var compiledResult = vueTemplateCompiler.compileToFunctions(("<div>" + slotValue + "{{ }}</div>"));
  var _staticRenderFns = vm._renderProxy.$options.staticRenderFns;
  vm._renderProxy.$options.staticRenderFns = compiledResult.staticRenderFns;
  var elem = compiledResult.render.call(vm._renderProxy, vm.$createElement).children;
  vm._renderProxy.$options.staticRenderFns = _staticRenderFns;
  return elem
}

function validateEnvironment () {
  if (!vueTemplateCompiler.compileToFunctions) {
    throwError('vueTemplateCompiler is undefined, you must pass components explicitly if vue-template-compiler is undefined');
  }
  if (typeof window === 'undefined') {
    throwError('the slots string option does not support strings in server-test-uitls.');
  }
  if (window.navigator.userAgent.match(/PhantomJS/i)) {
    throwError('the slots option does not support strings in PhantomJS. Please use Puppeteer, or pass a component.');
  }
}

function addSlotToVm (vm, slotName, slotValue) {
  var elem;
  if (typeof slotValue === 'string') {
    validateEnvironment();
    if (isSingleElement(slotValue)) {
      elem = vm.$createElement(vueTemplateCompiler.compileToFunctions(slotValue));
    } else {
      elem = createVNodes(vm, slotValue);
    }
  } else {
    elem = vm.$createElement(slotValue);
  }
  if (Array.isArray(elem)) {
    if (Array.isArray(vm.$slots[slotName])) {
      vm.$slots[slotName] = vm.$slots[slotName].concat( elem);
    } else {
      vm.$slots[slotName] = [].concat( elem );
    }
  } else {
    if (Array.isArray(vm.$slots[slotName])) {
      vm.$slots[slotName].push(elem);
    } else {
      vm.$slots[slotName] = [elem];
    }
  }
}

function addSlots (vm, slots) {
  validateSlots(slots);
  Object.keys(slots).forEach(function (key) {
    if (Array.isArray(slots[key])) {
      slots[key].forEach(function (slotValue) {
        addSlotToVm(vm, key, slotValue);
      });
    } else {
      addSlotToVm(vm, key, slots[key]);
    }
  });
}

// 

function addScopedSlots (vm, scopedSlots) {
  Object.keys(scopedSlots).forEach(function (key) {
    var template = scopedSlots[key].trim();
    if (template.substr(0, 9) === '<template') {
      throwError('the scopedSlots option does not support a template tag as the root element.');
    }
    var domParser = new window.DOMParser();
    var _document = domParser.parseFromString(template, 'text/html');
    vm.$_vueTestUtils_scopedSlots[key] = vueTemplateCompiler.compileToFunctions(template).render;
    vm.$_vueTestUtils_slotScopes[key] = _document.body.firstChild.getAttribute('slot-scope');
  });
}

// 

function addMocks (mockedProperties, Vue$$1) {
  Object.keys(mockedProperties).forEach(function (key) {
    try {
      Vue$$1.prototype[key] = mockedProperties[key];
    } catch (e) {
      warn(("could not overwrite property " + key + ", this usually caused by a plugin that has added the property as a read-only value"));
    }
    Vue.util.defineReactive(Vue$$1, key, mockedProperties[key]);
  });
}

function addProvide (component, optionProvide, options) {
  var provide = typeof optionProvide === 'function'
    ? optionProvide
    : Object.assign({}, optionProvide);

  options.beforeCreate = function vueTestUtilBeforeCreate () {
    this._provided = typeof provide === 'function'
      ? provide.call(this)
      : provide;
  };
}

// 

function logEvents (vm, emitted, emittedByOrder) {
  var emit = vm.$emit;
  vm.$emit = function (name) {
    var args = [], len = arguments.length - 1;
    while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

    (emitted[name] || (emitted[name] = [])).push(args);
    emittedByOrder.push({ name: name, args: args });
    return emit.call.apply(emit, [ vm, name ].concat( args ))
  };
}

function addEventLogger (vue) {
  vue.mixin({
    beforeCreate: function () {
      this.__emitted = Object.create(null);
      this.__emittedByOrder = [];
      logEvents(this, this.__emitted, this.__emittedByOrder);
    }
  });
}

// 

function compileTemplate (component) {
  if (component.components) {
    Object.keys(component.components).forEach(function (c) {
      var cmp = component.components[c];
      if (!cmp.render) {
        compileTemplate(cmp);
      }
    });
  }
  if (component.extends) {
    compileTemplate(component.extends);
  }
  if (component.template) {
    Object.assign(component, vueTemplateCompiler.compileToFunctions(component.template));
  }
}

// 

function isVueComponent$1 (comp) {
  return comp && (comp.render || comp.template || comp.options)
}

function isValidStub (stub) {
  return !!stub &&
      typeof stub === 'string' ||
      (stub === true) ||
      (isVueComponent$1(stub))
}

function isRequiredComponent (name) {
  return name === 'KeepAlive' || name === 'Transition' || name === 'TransitionGroup'
}

function getCoreProperties (component) {
  return {
    attrs: component.attrs,
    name: component.name,
    on: component.on,
    key: component.key,
    ref: component.ref,
    props: component.props,
    domProps: component.domProps,
    class: component.class,
    staticClass: component.staticClass,
    staticStyle: component.staticStyle,
    style: component.style,
    normalizedStyle: component.normalizedStyle,
    nativeOn: component.nativeOn,
    functional: component.functional
  }
}
function createStubFromString (templateString, originalComponent) {
  if (!vueTemplateCompiler.compileToFunctions) {
    throwError('vueTemplateCompiler is undefined, you must pass components explicitly if vue-template-compiler is undefined');
  }

  if (templateString.indexOf(hyphenate(originalComponent.name)) !== -1 ||
  templateString.indexOf(capitalize(originalComponent.name)) !== -1 ||
  templateString.indexOf(camelize(originalComponent.name)) !== -1) {
    throwError('options.stub cannot contain a circular reference');
  }

  return Object.assign({}, getCoreProperties(originalComponent),
    vueTemplateCompiler.compileToFunctions(templateString))
}

function createBlankStub (originalComponent) {
  return Object.assign({}, getCoreProperties(originalComponent),
    {render: function (h) { return h(''); }})
}

function createComponentStubs (originalComponents, stubs) {
  if ( originalComponents === void 0 ) originalComponents = {};

  var components = {};
  if (!stubs) {
    return components
  }
  if (Array.isArray(stubs)) {
    stubs.forEach(function (stub) {
      if (stub === false) {
        return
      }

      if (typeof stub !== 'string') {
        throwError('each item in an options.stubs array must be a string');
      }
      components[stub] = createBlankStub({});
    });
  } else {
    Object.keys(stubs).forEach(function (stub) {
      if (stubs[stub] === false) {
        return
      }
      if (!isValidStub(stubs[stub])) {
        throwError('options.stub values must be passed a string or component');
      }
      if (stubs[stub] === true) {
        components[stub] = createBlankStub({});
        return
      }

      if (componentNeedsCompiling(stubs[stub])) {
        compileTemplate(stubs[stub]);
      }

      if (originalComponents[stub]) {
        // Remove cached constructor
        delete originalComponents[stub]._Ctor;
        if (typeof stubs[stub] === 'string') {
          components[stub] = createStubFromString(stubs[stub], originalComponents[stub]);
        } else {
          components[stub] = Object.assign({}, stubs[stub],
            {name: originalComponents[stub].name});
        }
      } else {
        if (typeof stubs[stub] === 'string') {
          if (!vueTemplateCompiler.compileToFunctions) {
            throwError('vueTemplateCompiler is undefined, you must pass components explicitly if vue-template-compiler is undefined');
          }
          components[stub] = Object.assign({}, vueTemplateCompiler.compileToFunctions(stubs[stub]));
        } else {
          components[stub] = Object.assign({}, stubs[stub]);
        }
      }
      // ignoreElements does not exist in Vue 2.0.x
      if (Vue.config.ignoredElements) {
        Vue.config.ignoredElements.push(stub);
      }
    });
  }
  return components
}

function stubComponents (components, stubbedComponents) {
  Object.keys(components).forEach(function (component) {
    // Remove cached constructor
    delete components[component]._Ctor;
    if (!components[component].name) {
      components[component].name = component;
    }
    stubbedComponents[component] = createBlankStub(components[component]);

    // ignoreElements does not exist in Vue 2.0.x
    if (Vue.config.ignoredElements) {
      Vue.config.ignoredElements.push(component);
    }
  });
}

function createComponentStubsForAll (component) {
  var stubbedComponents = {};

  if (component.components) {
    stubComponents(component.components, stubbedComponents);
  }

  var extended = component.extends;

  // Loop through extended component chains to stub all child components
  while (extended) {
    if (extended.components) {
      stubComponents(extended.components, stubbedComponents);
    }
    extended = extended.extends;
  }

  if (component.extendOptions && component.extendOptions.components) {
    stubComponents(component.extendOptions.components, stubbedComponents);
  }

  return stubbedComponents
}

function createComponentStubsForGlobals (instance) {
  var components = {};
  Object.keys(instance.options.components).forEach(function (c) {
    if (isRequiredComponent(c)) {
      return
    }

    components[c] = createBlankStub(instance.options.components[c]);
    delete instance.options.components[c]._Ctor; // eslint-disable-line no-param-reassign
    delete components[c]._Ctor; // eslint-disable-line no-param-reassign
  });
  return components
}

// 

function compileTemplate$1 (component) {
  if (component.components) {
    Object.keys(component.components).forEach(function (c) {
      var cmp = component.components[c];
      if (!cmp.render) {
        compileTemplate$1(cmp);
      }
    });
  }
  if (component.extends) {
    compileTemplate$1(component.extends);
  }
  if (component.template) {
    Object.assign(component, vueTemplateCompiler.compileToFunctions(component.template));
  }
}

function deleteMountingOptions (options) {
  delete options.attachToDocument;
  delete options.mocks;
  delete options.slots;
  delete options.localVue;
  delete options.stubs;
  delete options.context;
  delete options.clone;
  delete options.attrs;
  delete options.listeners;
  delete options.propsData;
}

// 

function createFunctionalSlots (slots, h) {
  if ( slots === void 0 ) slots = {};

  if (Array.isArray(slots.default)) {
    return slots.default.map(h)
  }

  if (typeof slots.default === 'string') {
    return [h(vueTemplateCompiler.compileToFunctions(slots.default))]
  }
  var children = [];
  Object.keys(slots).forEach(function (slotType) {
    if (Array.isArray(slots[slotType])) {
      slots[slotType].forEach(function (slot) {
        var component = typeof slot === 'string' ? vueTemplateCompiler.compileToFunctions(slot) : slot;
        var newSlot = h(component);
        newSlot.data.slot = slotType;
        children.push(newSlot);
      });
    } else {
      var component = typeof slots[slotType] === 'string' ? vueTemplateCompiler.compileToFunctions(slots[slotType]) : slots[slotType];
      var slot = h(component);
      slot.data.slot = slotType;
      children.push(slot);
    }
  });
  return children
}

function createFunctionalComponent (component, mountingOptions) {
  if (mountingOptions.context && typeof mountingOptions.context !== 'object') {
    throwError('mount.context must be an object');
  }
  if (mountingOptions.slots) {
    validateSlots(mountingOptions.slots);
  }

  return {
    render: function render (h) {
      return h(
        component,
        mountingOptions.context || component.FunctionalRenderContext,
        (mountingOptions.context && mountingOptions.context.children && mountingOptions.context.children.map(function (x) { return typeof x === 'function' ? x(h) : x; })) || createFunctionalSlots(mountingOptions.slots, h)
      )
    },
    name: component.name,
    _isFunctionalContainer: true
  }
}

// 

function isDestructuringSlotScope (slotScope) {
  return slotScope[0] === '{' && slotScope[slotScope.length - 1] === '}'
}

function getVueTemplateCompilerHelpers (proxy) {
  var helpers = {};
  var names = ['_c', '_o', '_n', '_s', '_l', '_t', '_q', '_i', '_m', '_f', '_k', '_b', '_v', '_e', '_u', '_g'];
  names.forEach(function (name) {
    helpers[name] = proxy[name];
  });
  return helpers
}

function createInstance (
  component,
  options,
  vue,
  elm
) {
  if (options.mocks) {
    addMocks(options.mocks, vue);
  }

  if ((component.options && component.options.functional) || component.functional) {
    component = createFunctionalComponent(component, options);
  } else if (options.context) {
    throwError(
      'mount.context can only be used when mounting a functional component'
    );
  }

  if (options.provide) {
    addProvide(component, options.provide, options);
  }

  if (componentNeedsCompiling(component)) {
    compileTemplate$1(component);
  }

  addEventLogger(vue);

  
  var instanceOptions = Object.assign({}, options);
  deleteMountingOptions(instanceOptions);
  // $FlowIgnore
  
  if (options.stubs) {
    instanceOptions.components = Object.assign({}, instanceOptions.components,
      // $FlowIgnore
      createComponentStubs(component.components, options.stubs));
  }

  var Constructor = vue.extend(component).extend(instanceOptions);
  Object.keys(instanceOptions.components || {}).forEach(function (key) {
    Constructor.component(key, instanceOptions.components[key]);
    vue.component(key, instanceOptions.components[key]);
  });
  var Parent = vue.extend({
    provide: options.provide,
    data: function data () {
      return {
        propsData: options.propsData || {},
        attrs: options.attrs || {},
        listeners: options.listeners || {}
      }
    },
    render: function render (h) {
      var vnode = h(Constructor, {
        ref: 'vm',
        props: this.propsData,
        on: this.listeners,
        attrs: this.attrs
      });

      return vnode
    }
  });

  var parent = new Parent().$mount(elm);

  var vm = parent.$refs.vm;

  if (options.scopedSlots) {
    if (window.navigator.userAgent.match(/PhantomJS/i)) {
      throwError('the scopedSlots option does not support PhantomJS. Please use Puppeteer, or pass a component.');
    }
    var vueVersion = Number(((Vue.version.split('.')[0]) + "." + (Vue.version.split('.')[1])));
    if (vueVersion >= 2.5) {
      vm.$_vueTestUtils_scopedSlots = {};
      vm.$_vueTestUtils_slotScopes = {};
      var renderSlot = vm._renderProxy._t;

      vm._renderProxy._t = function (name, feedback, props, bindObject) {
        var scopedSlotFn = vm.$_vueTestUtils_scopedSlots[name];
        var slotScope = vm.$_vueTestUtils_slotScopes[name];
        if (scopedSlotFn) {
          props = Object.assign({}, bindObject, props);
          var helpers = getVueTemplateCompilerHelpers(vm._renderProxy);
          var proxy = Object.assign({}, helpers);
          if (isDestructuringSlotScope(slotScope)) {
            proxy = Object.assign({}, helpers, props);
          } else {
            proxy[slotScope] = props;
          }
          return scopedSlotFn.call(proxy)
        } else {
          return renderSlot.call(vm._renderProxy, name, feedback, props, bindObject)
        }
      };

      // $FlowIgnore
      addScopedSlots(vm, options.scopedSlots);
    } else {
      throwError('the scopedSlots option is only supported in vue@2.5+.');
    }
  }

  if (options.slots) {
    addSlots(vm, options.slots);
  }

  return vm
}

// 

function createElement () {
  if (document) {
    var elem = document.createElement('div');

    if (document.body) {
      document.body.appendChild(elem);
    }
    return elem
  }
}

/**
 * A specialized version of `_.forEach` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns `array`.
 */
function arrayEach(array, iteratee) {
  var index = -1,
      length = array == null ? 0 : array.length;

  while (++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break;
    }
  }
  return array;
}

var _arrayEach = arrayEach;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeKeys = _overArg(Object.keys, Object);

var _nativeKeys = nativeKeys;

/** Used for built-in method references. */
var objectProto$11 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$9 = objectProto$11.hasOwnProperty;

/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys(object) {
  if (!_isPrototype(object)) {
    return _nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty$9.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

var _baseKeys = baseKeys;

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function keys(object) {
  return isArrayLike_1(object) ? _arrayLikeKeys(object) : _baseKeys(object);
}

var keys_1 = keys;

/**
 * The base implementation of `_.assign` without support for multiple sources
 * or `customizer` functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @returns {Object} Returns `object`.
 */
function baseAssign(object, source) {
  return object && _copyObject(source, keys_1(source), object);
}

var _baseAssign = baseAssign;

/**
 * The base implementation of `_.assignIn` without support for multiple sources
 * or `customizer` functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @returns {Object} Returns `object`.
 */
function baseAssignIn(object, source) {
  return object && _copyObject(source, keysIn_1(source), object);
}

var _baseAssignIn = baseAssignIn;

/**
 * A specialized version of `_.filter` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {Array} Returns the new filtered array.
 */
function arrayFilter(array, predicate) {
  var index = -1,
      length = array == null ? 0 : array.length,
      resIndex = 0,
      result = [];

  while (++index < length) {
    var value = array[index];
    if (predicate(value, index, array)) {
      result[resIndex++] = value;
    }
  }
  return result;
}

var _arrayFilter = arrayFilter;

/**
 * This method returns a new empty array.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {Array} Returns the new empty array.
 * @example
 *
 * var arrays = _.times(2, _.stubArray);
 *
 * console.log(arrays);
 * // => [[], []]
 *
 * console.log(arrays[0] === arrays[1]);
 * // => false
 */
function stubArray() {
  return [];
}

var stubArray_1 = stubArray;

/** Used for built-in method references. */
var objectProto$12 = Object.prototype;

/** Built-in value references. */
var propertyIsEnumerable$1 = objectProto$12.propertyIsEnumerable;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeGetSymbols = Object.getOwnPropertySymbols;

/**
 * Creates an array of the own enumerable symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */
var getSymbols = !nativeGetSymbols ? stubArray_1 : function(object) {
  if (object == null) {
    return [];
  }
  object = Object(object);
  return _arrayFilter(nativeGetSymbols(object), function(symbol) {
    return propertyIsEnumerable$1.call(object, symbol);
  });
};

var _getSymbols = getSymbols;

/**
 * Copies own symbols of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy symbols from.
 * @param {Object} [object={}] The object to copy symbols to.
 * @returns {Object} Returns `object`.
 */
function copySymbols(source, object) {
  return _copyObject(source, _getSymbols(source), object);
}

var _copySymbols = copySymbols;

/**
 * Appends the elements of `values` to `array`.
 *
 * @private
 * @param {Array} array The array to modify.
 * @param {Array} values The values to append.
 * @returns {Array} Returns `array`.
 */
function arrayPush(array, values) {
  var index = -1,
      length = values.length,
      offset = array.length;

  while (++index < length) {
    array[offset + index] = values[index];
  }
  return array;
}

var _arrayPush = arrayPush;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeGetSymbols$1 = Object.getOwnPropertySymbols;

/**
 * Creates an array of the own and inherited enumerable symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */
var getSymbolsIn = !nativeGetSymbols$1 ? stubArray_1 : function(object) {
  var result = [];
  while (object) {
    _arrayPush(result, _getSymbols(object));
    object = _getPrototype(object);
  }
  return result;
};

var _getSymbolsIn = getSymbolsIn;

/**
 * Copies own and inherited symbols of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy symbols from.
 * @param {Object} [object={}] The object to copy symbols to.
 * @returns {Object} Returns `object`.
 */
function copySymbolsIn(source, object) {
  return _copyObject(source, _getSymbolsIn(source), object);
}

var _copySymbolsIn = copySymbolsIn;

/**
 * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
 * `keysFunc` and `symbolsFunc` to get the enumerable property names and
 * symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @param {Function} symbolsFunc The function to get the symbols of `object`.
 * @returns {Array} Returns the array of property names and symbols.
 */
function baseGetAllKeys(object, keysFunc, symbolsFunc) {
  var result = keysFunc(object);
  return isArray_1(object) ? result : _arrayPush(result, symbolsFunc(object));
}

var _baseGetAllKeys = baseGetAllKeys;

/**
 * Creates an array of own enumerable property names and symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names and symbols.
 */
function getAllKeys(object) {
  return _baseGetAllKeys(object, keys_1, _getSymbols);
}

var _getAllKeys = getAllKeys;

/**
 * Creates an array of own and inherited enumerable property names and
 * symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names and symbols.
 */
function getAllKeysIn(object) {
  return _baseGetAllKeys(object, keysIn_1, _getSymbolsIn);
}

var _getAllKeysIn = getAllKeysIn;

/* Built-in method references that are verified to be native. */
var DataView = _getNative(_root, 'DataView');

var _DataView = DataView;

/* Built-in method references that are verified to be native. */
var Promise = _getNative(_root, 'Promise');

var _Promise = Promise;

/* Built-in method references that are verified to be native. */
var Set = _getNative(_root, 'Set');

var _Set = Set;

/* Built-in method references that are verified to be native. */
var WeakMap = _getNative(_root, 'WeakMap');

var _WeakMap = WeakMap;

/** `Object#toString` result references. */
var mapTag$1 = '[object Map]',
    objectTag$2 = '[object Object]',
    promiseTag = '[object Promise]',
    setTag$1 = '[object Set]',
    weakMapTag$1 = '[object WeakMap]';

var dataViewTag$1 = '[object DataView]';

/** Used to detect maps, sets, and weakmaps. */
var dataViewCtorString = _toSource(_DataView),
    mapCtorString = _toSource(_Map),
    promiseCtorString = _toSource(_Promise),
    setCtorString = _toSource(_Set),
    weakMapCtorString = _toSource(_WeakMap);

/**
 * Gets the `toStringTag` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
var getTag = _baseGetTag;

// Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
if ((_DataView && getTag(new _DataView(new ArrayBuffer(1))) != dataViewTag$1) ||
    (_Map && getTag(new _Map) != mapTag$1) ||
    (_Promise && getTag(_Promise.resolve()) != promiseTag) ||
    (_Set && getTag(new _Set) != setTag$1) ||
    (_WeakMap && getTag(new _WeakMap) != weakMapTag$1)) {
  getTag = function(value) {
    var result = _baseGetTag(value),
        Ctor = result == objectTag$2 ? value.constructor : undefined,
        ctorString = Ctor ? _toSource(Ctor) : '';

    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString: return dataViewTag$1;
        case mapCtorString: return mapTag$1;
        case promiseCtorString: return promiseTag;
        case setCtorString: return setTag$1;
        case weakMapCtorString: return weakMapTag$1;
      }
    }
    return result;
  };
}

var _getTag = getTag;

/** Used for built-in method references. */
var objectProto$13 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$10 = objectProto$13.hasOwnProperty;

/**
 * Initializes an array clone.
 *
 * @private
 * @param {Array} array The array to clone.
 * @returns {Array} Returns the initialized clone.
 */
function initCloneArray(array) {
  var length = array.length,
      result = array.constructor(length);

  // Add properties assigned by `RegExp#exec`.
  if (length && typeof array[0] == 'string' && hasOwnProperty$10.call(array, 'index')) {
    result.index = array.index;
    result.input = array.input;
  }
  return result;
}

var _initCloneArray = initCloneArray;

/**
 * Creates a clone of `dataView`.
 *
 * @private
 * @param {Object} dataView The data view to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned data view.
 */
function cloneDataView(dataView, isDeep) {
  var buffer = isDeep ? _cloneArrayBuffer(dataView.buffer) : dataView.buffer;
  return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
}

var _cloneDataView = cloneDataView;

/**
 * Adds the key-value `pair` to `map`.
 *
 * @private
 * @param {Object} map The map to modify.
 * @param {Array} pair The key-value pair to add.
 * @returns {Object} Returns `map`.
 */
function addMapEntry(map, pair) {
  // Don't return `map.set` because it's not chainable in IE 11.
  map.set(pair[0], pair[1]);
  return map;
}

var _addMapEntry = addMapEntry;

/**
 * A specialized version of `_.reduce` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {*} [accumulator] The initial value.
 * @param {boolean} [initAccum] Specify using the first element of `array` as
 *  the initial value.
 * @returns {*} Returns the accumulated value.
 */
function arrayReduce(array, iteratee, accumulator, initAccum) {
  var index = -1,
      length = array == null ? 0 : array.length;

  if (initAccum && length) {
    accumulator = array[++index];
  }
  while (++index < length) {
    accumulator = iteratee(accumulator, array[index], index, array);
  }
  return accumulator;
}

var _arrayReduce = arrayReduce;

/**
 * Converts `map` to its key-value pairs.
 *
 * @private
 * @param {Object} map The map to convert.
 * @returns {Array} Returns the key-value pairs.
 */
function mapToArray(map) {
  var index = -1,
      result = Array(map.size);

  map.forEach(function(value, key) {
    result[++index] = [key, value];
  });
  return result;
}

var _mapToArray = mapToArray;

/** Used to compose bitmasks for cloning. */
var CLONE_DEEP_FLAG = 1;

/**
 * Creates a clone of `map`.
 *
 * @private
 * @param {Object} map The map to clone.
 * @param {Function} cloneFunc The function to clone values.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned map.
 */
function cloneMap(map, isDeep, cloneFunc) {
  var array = isDeep ? cloneFunc(_mapToArray(map), CLONE_DEEP_FLAG) : _mapToArray(map);
  return _arrayReduce(array, _addMapEntry, new map.constructor);
}

var _cloneMap = cloneMap;

/** Used to match `RegExp` flags from their coerced string values. */
var reFlags = /\w*$/;

/**
 * Creates a clone of `regexp`.
 *
 * @private
 * @param {Object} regexp The regexp to clone.
 * @returns {Object} Returns the cloned regexp.
 */
function cloneRegExp(regexp) {
  var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
  result.lastIndex = regexp.lastIndex;
  return result;
}

var _cloneRegExp = cloneRegExp;

/**
 * Adds `value` to `set`.
 *
 * @private
 * @param {Object} set The set to modify.
 * @param {*} value The value to add.
 * @returns {Object} Returns `set`.
 */
function addSetEntry(set, value) {
  // Don't return `set.add` because it's not chainable in IE 11.
  set.add(value);
  return set;
}

var _addSetEntry = addSetEntry;

/**
 * Converts `set` to an array of its values.
 *
 * @private
 * @param {Object} set The set to convert.
 * @returns {Array} Returns the values.
 */
function setToArray(set) {
  var index = -1,
      result = Array(set.size);

  set.forEach(function(value) {
    result[++index] = value;
  });
  return result;
}

var _setToArray = setToArray;

/** Used to compose bitmasks for cloning. */
var CLONE_DEEP_FLAG$1 = 1;

/**
 * Creates a clone of `set`.
 *
 * @private
 * @param {Object} set The set to clone.
 * @param {Function} cloneFunc The function to clone values.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned set.
 */
function cloneSet(set, isDeep, cloneFunc) {
  var array = isDeep ? cloneFunc(_setToArray(set), CLONE_DEEP_FLAG$1) : _setToArray(set);
  return _arrayReduce(array, _addSetEntry, new set.constructor);
}

var _cloneSet = cloneSet;

/** Used to convert symbols to primitives and strings. */
var symbolProto = _Symbol ? _Symbol.prototype : undefined,
    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

/**
 * Creates a clone of the `symbol` object.
 *
 * @private
 * @param {Object} symbol The symbol object to clone.
 * @returns {Object} Returns the cloned symbol object.
 */
function cloneSymbol(symbol) {
  return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
}

var _cloneSymbol = cloneSymbol;

/** `Object#toString` result references. */
var boolTag$1 = '[object Boolean]',
    dateTag$1 = '[object Date]',
    mapTag$2 = '[object Map]',
    numberTag$1 = '[object Number]',
    regexpTag$1 = '[object RegExp]',
    setTag$2 = '[object Set]',
    stringTag$1 = '[object String]',
    symbolTag = '[object Symbol]';

var arrayBufferTag$1 = '[object ArrayBuffer]',
    dataViewTag$2 = '[object DataView]',
    float32Tag$1 = '[object Float32Array]',
    float64Tag$1 = '[object Float64Array]',
    int8Tag$1 = '[object Int8Array]',
    int16Tag$1 = '[object Int16Array]',
    int32Tag$1 = '[object Int32Array]',
    uint8Tag$1 = '[object Uint8Array]',
    uint8ClampedTag$1 = '[object Uint8ClampedArray]',
    uint16Tag$1 = '[object Uint16Array]',
    uint32Tag$1 = '[object Uint32Array]';

/**
 * Initializes an object clone based on its `toStringTag`.
 *
 * **Note:** This function only supports cloning values with tags of
 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
 *
 * @private
 * @param {Object} object The object to clone.
 * @param {string} tag The `toStringTag` of the object to clone.
 * @param {Function} cloneFunc The function to clone values.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneByTag(object, tag, cloneFunc, isDeep) {
  var Ctor = object.constructor;
  switch (tag) {
    case arrayBufferTag$1:
      return _cloneArrayBuffer(object);

    case boolTag$1:
    case dateTag$1:
      return new Ctor(+object);

    case dataViewTag$2:
      return _cloneDataView(object, isDeep);

    case float32Tag$1: case float64Tag$1:
    case int8Tag$1: case int16Tag$1: case int32Tag$1:
    case uint8Tag$1: case uint8ClampedTag$1: case uint16Tag$1: case uint32Tag$1:
      return _cloneTypedArray(object, isDeep);

    case mapTag$2:
      return _cloneMap(object, isDeep, cloneFunc);

    case numberTag$1:
    case stringTag$1:
      return new Ctor(object);

    case regexpTag$1:
      return _cloneRegExp(object);

    case setTag$2:
      return _cloneSet(object, isDeep, cloneFunc);

    case symbolTag:
      return _cloneSymbol(object);
  }
}

var _initCloneByTag = initCloneByTag;

/** Used to compose bitmasks for cloning. */
var CLONE_DEEP_FLAG$2 = 1,
    CLONE_FLAT_FLAG = 2,
    CLONE_SYMBOLS_FLAG = 4;

/** `Object#toString` result references. */
var argsTag$2 = '[object Arguments]',
    arrayTag$1 = '[object Array]',
    boolTag$2 = '[object Boolean]',
    dateTag$2 = '[object Date]',
    errorTag$1 = '[object Error]',
    funcTag$2 = '[object Function]',
    genTag$1 = '[object GeneratorFunction]',
    mapTag$3 = '[object Map]',
    numberTag$2 = '[object Number]',
    objectTag$3 = '[object Object]',
    regexpTag$2 = '[object RegExp]',
    setTag$3 = '[object Set]',
    stringTag$2 = '[object String]',
    symbolTag$1 = '[object Symbol]',
    weakMapTag$2 = '[object WeakMap]';

var arrayBufferTag$2 = '[object ArrayBuffer]',
    dataViewTag$3 = '[object DataView]',
    float32Tag$2 = '[object Float32Array]',
    float64Tag$2 = '[object Float64Array]',
    int8Tag$2 = '[object Int8Array]',
    int16Tag$2 = '[object Int16Array]',
    int32Tag$2 = '[object Int32Array]',
    uint8Tag$2 = '[object Uint8Array]',
    uint8ClampedTag$2 = '[object Uint8ClampedArray]',
    uint16Tag$2 = '[object Uint16Array]',
    uint32Tag$2 = '[object Uint32Array]';

/** Used to identify `toStringTag` values supported by `_.clone`. */
var cloneableTags = {};
cloneableTags[argsTag$2] = cloneableTags[arrayTag$1] =
cloneableTags[arrayBufferTag$2] = cloneableTags[dataViewTag$3] =
cloneableTags[boolTag$2] = cloneableTags[dateTag$2] =
cloneableTags[float32Tag$2] = cloneableTags[float64Tag$2] =
cloneableTags[int8Tag$2] = cloneableTags[int16Tag$2] =
cloneableTags[int32Tag$2] = cloneableTags[mapTag$3] =
cloneableTags[numberTag$2] = cloneableTags[objectTag$3] =
cloneableTags[regexpTag$2] = cloneableTags[setTag$3] =
cloneableTags[stringTag$2] = cloneableTags[symbolTag$1] =
cloneableTags[uint8Tag$2] = cloneableTags[uint8ClampedTag$2] =
cloneableTags[uint16Tag$2] = cloneableTags[uint32Tag$2] = true;
cloneableTags[errorTag$1] = cloneableTags[funcTag$2] =
cloneableTags[weakMapTag$2] = false;

/**
 * The base implementation of `_.clone` and `_.cloneDeep` which tracks
 * traversed objects.
 *
 * @private
 * @param {*} value The value to clone.
 * @param {boolean} bitmask The bitmask flags.
 *  1 - Deep clone
 *  2 - Flatten inherited properties
 *  4 - Clone symbols
 * @param {Function} [customizer] The function to customize cloning.
 * @param {string} [key] The key of `value`.
 * @param {Object} [object] The parent object of `value`.
 * @param {Object} [stack] Tracks traversed objects and their clone counterparts.
 * @returns {*} Returns the cloned value.
 */
function baseClone(value, bitmask, customizer, key, object, stack) {
  var result,
      isDeep = bitmask & CLONE_DEEP_FLAG$2,
      isFlat = bitmask & CLONE_FLAT_FLAG,
      isFull = bitmask & CLONE_SYMBOLS_FLAG;

  if (customizer) {
    result = object ? customizer(value, key, object, stack) : customizer(value);
  }
  if (result !== undefined) {
    return result;
  }
  if (!isObject_1(value)) {
    return value;
  }
  var isArr = isArray_1(value);
  if (isArr) {
    result = _initCloneArray(value);
    if (!isDeep) {
      return _copyArray(value, result);
    }
  } else {
    var tag = _getTag(value),
        isFunc = tag == funcTag$2 || tag == genTag$1;

    if (isBuffer_1(value)) {
      return _cloneBuffer(value, isDeep);
    }
    if (tag == objectTag$3 || tag == argsTag$2 || (isFunc && !object)) {
      result = (isFlat || isFunc) ? {} : _initCloneObject(value);
      if (!isDeep) {
        return isFlat
          ? _copySymbolsIn(value, _baseAssignIn(result, value))
          : _copySymbols(value, _baseAssign(result, value));
      }
    } else {
      if (!cloneableTags[tag]) {
        return object ? value : {};
      }
      result = _initCloneByTag(value, tag, baseClone, isDeep);
    }
  }
  // Check for circular references and return its corresponding clone.
  stack || (stack = new _Stack);
  var stacked = stack.get(value);
  if (stacked) {
    return stacked;
  }
  stack.set(value, result);

  var keysFunc = isFull
    ? (isFlat ? _getAllKeysIn : _getAllKeys)
    : (isFlat ? keysIn : keys_1);

  var props = isArr ? undefined : keysFunc(value);
  _arrayEach(props || value, function(subValue, key) {
    if (props) {
      key = subValue;
      subValue = value[key];
    }
    // Recursively populate clone (susceptible to call stack limits).
    _assignValue(result, key, baseClone(subValue, bitmask, customizer, key, value, stack));
  });
  return result;
}

var _baseClone = baseClone;

/** Used to compose bitmasks for cloning. */
var CLONE_DEEP_FLAG$3 = 1,
    CLONE_SYMBOLS_FLAG$1 = 4;

/**
 * This method is like `_.clone` except that it recursively clones `value`.
 *
 * @static
 * @memberOf _
 * @since 1.0.0
 * @category Lang
 * @param {*} value The value to recursively clone.
 * @returns {*} Returns the deep cloned value.
 * @see _.clone
 * @example
 *
 * var objects = [{ 'a': 1 }, { 'b': 2 }];
 *
 * var deep = _.cloneDeep(objects);
 * console.log(deep[0] === objects[0]);
 * // => false
 */
function cloneDeep(value) {
  return _baseClone(value, CLONE_DEEP_FLAG$3 | CLONE_SYMBOLS_FLAG$1);
}

var cloneDeep_1 = cloneDeep;

function errorHandler (errorOrString, vm) {
  var error = (typeof errorOrString === 'object')
    ? errorOrString
    : new Error(errorOrString);

  vm._error = error;

  throw error
}

// 

function createLocalVue () {
  var instance = Vue.extend();

  // clone global APIs
  Object.keys(Vue).forEach(function (key) {
    if (!instance.hasOwnProperty(key)) {
      var original = Vue[key];
      instance[key] = typeof original === 'object'
        ? cloneDeep_1(original)
        : original;
    }
  });

  // config is not enumerable
  instance.config = cloneDeep_1(Vue.config);

  instance.config.errorHandler = errorHandler;

  // option merge strategies need to be exposed by reference
  // so that merge strats registered by plugins can work properly
  instance.config.optionMergeStrategies = Vue.config.optionMergeStrategies;

  // make sure all extends are based on this instance.
  // this is important so that global components registered by plugins,
  // e.g. router-link are created using the correct base constructor
  instance.options._base = instance;

  // compat for vue-router < 2.7.1 where it does not allow multiple installs
  if (instance._installedPlugins && instance._installedPlugins.length) {
    instance._installedPlugins.length = 0;
  }
  var use = instance.use;
  instance.use = function (plugin) {
    var rest = [], len = arguments.length - 1;
    while ( len-- > 0 ) rest[ len ] = arguments[ len + 1 ];

    if (plugin.installed === true) {
      plugin.installed = false;
    }
    if (plugin.install && plugin.install.installed === true) {
      plugin.install.installed = false;
    }
    use.call.apply(use, [ instance, plugin ].concat( rest ));
  };
  return instance
}

// 

function getOptions (key, options, config) {
  if (options ||
    (config[key] && Object.keys(config[key]).length > 0)) {
    if (options instanceof Function) {
      return options
    } else if (Array.isArray(options)) {
      return options.concat( Object.keys(config[key] || {}))
    } else if (!(config[key] instanceof Function)) {
      return Object.assign({}, config[key],
        options)
    } else {
      throw new Error("Config can't be a Function.")
    }
  }
}

function mergeOptions (
  options,
  config
) {
  return Object.assign({}, options,
    {stubs: getOptions('stubs', options.stubs, config),
    mocks: getOptions('mocks', options.mocks, config),
    methods: getOptions('methods', options.methods, config),
    provide: getOptions('provide', options.provide, config)})
}

// 

function getRealChild (vnode) {
  var compOptions = vnode && vnode.componentOptions;
  if (compOptions && compOptions.Ctor.options.abstract) {
    return getRealChild(getFirstComponentChild(compOptions.children))
  } else {
    return vnode
  }
}

function isSameChild (child, oldChild) {
  return oldChild.key === child.key && oldChild.tag === child.tag
}

function getFirstComponentChild (children) {
  if (Array.isArray(children)) {
    for (var i = 0; i < children.length; i++) {
      var c = children[i];
      if (c && (c.componentOptions || isAsyncPlaceholder(c))) {
        return c
      }
    }
  }
}

function isPrimitive (value) {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    // $FlowIgnore
    typeof value === 'symbol' ||
    typeof value === 'boolean'
  )
}

function isAsyncPlaceholder (node) {
  return node.isComment && node.asyncFactory
}

function hasParentTransition (vnode) {
  while ((vnode = vnode.parent)) {
    if (vnode.data.transition) {
      return true
    }
  }
}

var TransitionStub = {
  render: function render (h) {
    var children = this.$options._renderChildren;
    if (!children) {
      return
    }

    // filter out text nodes (possible whitespaces)
    children = children.filter(function (c) { return c.tag || isAsyncPlaceholder(c); });
    /* istanbul ignore if */
    if (!children.length) {
      return
    }

    // warn multiple elements
    if (children.length > 1) {
      warn(
        '<transition> can only be used on a single element. Use ' +
         '<transition-group> for lists.'
      );
    }

    var mode = this.mode;

    // warn invalid mode
    if (mode && mode !== 'in-out' && mode !== 'out-in'
    ) {
      warn(
        'invalid <transition> mode: ' + mode
      );
    }

    var rawChild = children[0];

    // if this is a component root node and the component's
    // parent container node also has transition, skip.
    if (hasParentTransition(this.$vnode)) {
      return rawChild
    }

    // apply transition data to child
    // use getRealChild() to ignore abstract components e.g. keep-alive
    var child = getRealChild(rawChild);

    if (!child) {
      return rawChild
    }

    var id = "__transition-" + (this._uid) + "-";
    child.key = child.key == null
      ? child.isComment
        ? id + 'comment'
        : id + child.tag
      : isPrimitive(child.key)
        ? (String(child.key).indexOf(id) === 0 ? child.key : id + child.key)
        : child.key;

    var data = (child.data || (child.data = {}));
    var oldRawChild = this._vnode;
    var oldChild = getRealChild(oldRawChild);
    if (child.data.directives && child.data.directives.some(function (d) { return d.name === 'show'; })) {
      child.data.show = true;
    }

    // mark v-show
    // so that the transition module can hand over the control to the directive
    if (child.data.directives && child.data.directives.some(function (d) { return d.name === 'show'; })) {
      child.data.show = true;
    }
    if (
      oldChild &&
         oldChild.data &&
         !isSameChild(child, oldChild) &&
         !isAsyncPlaceholder(oldChild) &&
         // #6687 component root is a comment node
         !(oldChild.componentInstance && oldChild.componentInstance._vnode.isComment)
    ) {
      oldChild.data = Object.assign({}, data);
    }
    return rawChild
  }
}

// 

var TransitionGroupStub = {
  render: function render (h) {
    var tag = this.tag || this.$vnode.data.tag || 'span';
    var children = this.$slots.default || [];

    return h(tag, null, children)
  }
}

var config = {
  stubs: {
    transition: TransitionStub,
    'transition-group': TransitionGroupStub
  },
  mocks: {},
  methods: {},
  provide: {}
}

// 

Vue.config.productionTip = false;
Vue.config.devtools = false;
Vue.config.errorHandler = errorHandler;

function mount (component, options) {
  if ( options === void 0 ) options = {};

  warnIfNoWindow();
  // Remove cached constructor
  delete component._Ctor;
  var vueClass = options.localVue || createLocalVue();
  var vm = createInstance(component, mergeOptions(options, config), vueClass);

  if (options.attachToDocument) {
    vm.$mount(createElement());
  } else {
    vm.$mount();
  }
  var componentsWithError = findAllVueComponentsFromVm(vm).filter(function (c) { return c._error; });

  if (componentsWithError.length > 0) {
    throw (componentsWithError[0]._error)
  }

  var wrapperOptions = {
    attachedToDocument: !!options.attachToDocument,
    sync: !!((options.sync || options.sync === undefined)),
    root: true
  };

  return new VueWrapper(vm, wrapperOptions)
}

// 

function shallowMount (
  component,
  options
) {
  if ( options === void 0 ) options = {};

  var vue = options.localVue || Vue;

  // remove any recursive components added to the constructor
  // in vm._init from previous tests
  if (component.name && component.components) {
    delete component.components[capitalize(camelize(component.name))];
    delete component.components[hyphenate(component.name)];
  }
  

  return mount(component, Object.assign({}, options,
    {components: Object.assign({}, createComponentStubsForGlobals(vue),
      createComponentStubsForAll(component))}))
}

// 
var toTypes = [String, Object];
var eventTypes = [String, Array];

var RouterLinkStub = {
  name: 'RouterLinkStub',
  props: {
    to: {
      type: toTypes,
      required: true
    },
    tag: {
      type: String,
      default: 'a'
    },
    exact: Boolean,
    append: Boolean,
    replace: Boolean,
    activeClass: String,
    exactActiveClass: String,
    event: {
      type: eventTypes,
      default: 'click'
    }
  },
  render: function render (h) {
    return h(this.tag, undefined, this.$slots.default)
  }
}

function shallow (component, options) {
  warn('shallow has been renamed to shallowMount and will be deprecated in 1.0.0');
  return shallowMount(component, options)
}

var index = {
  createLocalVue: createLocalVue,
  config: config,
  mount: mount,
  shallow: shallow,
  shallowMount: shallowMount,
  TransitionStub: TransitionStub,
  TransitionGroupStub: TransitionGroupStub,
  RouterLinkStub: RouterLinkStub
}

module.exports = index;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidnVlLXRlc3QtdXRpbHMuanMiLCJzb3VyY2VzIjpbIi4uLy4uL3NoYXJlZC91dGlsLmpzIiwiLi4vc3JjL3dhcm4taWYtbm8td2luZG93LmpzIiwiLi4vc3JjL21hdGNoZXMtcG9seWZpbGwuanMiLCIuLi9zcmMvb2JqZWN0LWFzc2lnbi1wb2x5ZmlsbC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2xpc3RDYWNoZUNsZWFyLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9lcS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Fzc29jSW5kZXhPZi5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2xpc3RDYWNoZURlbGV0ZS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2xpc3RDYWNoZUdldC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2xpc3RDYWNoZUhhcy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2xpc3RDYWNoZVNldC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX0xpc3RDYWNoZS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX3N0YWNrQ2xlYXIuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19zdGFja0RlbGV0ZS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX3N0YWNrR2V0LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fc3RhY2tIYXMuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19mcmVlR2xvYmFsLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fcm9vdC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX1N5bWJvbC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2dldFJhd1RhZy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX29iamVjdFRvU3RyaW5nLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZUdldFRhZy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvaXNPYmplY3QuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL2lzRnVuY3Rpb24uanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19jb3JlSnNEYXRhLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9faXNNYXNrZWQuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL190b1NvdXJjZS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VJc05hdGl2ZS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2dldFZhbHVlLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fZ2V0TmF0aXZlLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fTWFwLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fbmF0aXZlQ3JlYXRlLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9faGFzaENsZWFyLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9faGFzaERlbGV0ZS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2hhc2hHZXQuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19oYXNoSGFzLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9faGFzaFNldC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX0hhc2guanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19tYXBDYWNoZUNsZWFyLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9faXNLZXlhYmxlLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fZ2V0TWFwRGF0YS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX21hcENhY2hlRGVsZXRlLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fbWFwQ2FjaGVHZXQuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19tYXBDYWNoZUhhcy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX21hcENhY2hlU2V0LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fTWFwQ2FjaGUuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19zdGFja1NldC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX1N0YWNrLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fZGVmaW5lUHJvcGVydHkuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19iYXNlQXNzaWduVmFsdWUuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19hc3NpZ25NZXJnZVZhbHVlLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fY3JlYXRlQmFzZUZvci5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VGb3IuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19jbG9uZUJ1ZmZlci5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX1VpbnQ4QXJyYXkuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19jbG9uZUFycmF5QnVmZmVyLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fY2xvbmVUeXBlZEFycmF5LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fY29weUFycmF5LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZUNyZWF0ZS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX292ZXJBcmcuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19nZXRQcm90b3R5cGUuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19pc1Byb3RvdHlwZS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2luaXRDbG9uZU9iamVjdC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvaXNPYmplY3RMaWtlLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZUlzQXJndW1lbnRzLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9pc0FyZ3VtZW50cy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvaXNBcnJheS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvaXNMZW5ndGguanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL2lzQXJyYXlMaWtlLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9pc0FycmF5TGlrZU9iamVjdC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvc3R1YkZhbHNlLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9pc0J1ZmZlci5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvaXNQbGFpbk9iamVjdC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VJc1R5cGVkQXJyYXkuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19iYXNlVW5hcnkuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19ub2RlVXRpbC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvaXNUeXBlZEFycmF5LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYXNzaWduVmFsdWUuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19jb3B5T2JqZWN0LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZVRpbWVzLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9faXNJbmRleC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2FycmF5TGlrZUtleXMuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19uYXRpdmVLZXlzSW4uanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19iYXNlS2V5c0luLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9rZXlzSW4uanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL3RvUGxhaW5PYmplY3QuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19iYXNlTWVyZ2VEZWVwLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZU1lcmdlLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9pZGVudGl0eS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2FwcGx5LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fb3ZlclJlc3QuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL2NvbnN0YW50LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZVNldFRvU3RyaW5nLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fc2hvcnRPdXQuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19zZXRUb1N0cmluZy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VSZXN0LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9faXNJdGVyYXRlZUNhbGwuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19jcmVhdGVBc3NpZ25lci5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvbWVyZ2UuanMiLCIuLi8uLi9zaGFyZWQvdmFsaWRhdG9ycy5qcyIsIi4uL3NyYy9jb25zdHMuanMiLCIuLi9zcmMvZ2V0LXNlbGVjdG9yLXR5cGUuanMiLCIuLi9zcmMvZmluZC12dWUtY29tcG9uZW50cy5qcyIsIi4uL3NyYy93cmFwcGVyLWFycmF5LmpzIiwiLi4vc3JjL2Vycm9yLXdyYXBwZXIuanMiLCIuLi9zcmMvZmluZC12bm9kZXMuanMiLCIuLi9zcmMvZmluZC1kb20tbm9kZXMuanMiLCIuLi9zcmMvZmluZC5qcyIsIi4uL3NyYy9jcmVhdGUtd3JhcHBlci5qcyIsIi4uL3NyYy9vcmRlci13YXRjaGVycy5qcyIsIi4uL3NyYy93cmFwcGVyLmpzIiwiLi4vc3JjL3NldC13YXRjaGVycy10by1zeW5jLmpzIiwiLi4vc3JjL3Z1ZS13cmFwcGVyLmpzIiwiLi4vLi4vY3JlYXRlLWluc3RhbmNlL3ZhbGlkYXRlLXNsb3RzLmpzIiwiLi4vLi4vY3JlYXRlLWluc3RhbmNlL2FkZC1zbG90cy5qcyIsIi4uLy4uL2NyZWF0ZS1pbnN0YW5jZS9hZGQtc2NvcGVkLXNsb3RzLmpzIiwiLi4vLi4vY3JlYXRlLWluc3RhbmNlL2FkZC1tb2Nrcy5qcyIsIi4uLy4uL2NyZWF0ZS1pbnN0YW5jZS9hZGQtcHJvdmlkZS5qcyIsIi4uLy4uL2NyZWF0ZS1pbnN0YW5jZS9sb2ctZXZlbnRzLmpzIiwiLi4vLi4vc2hhcmVkL2NvbXBpbGUtdGVtcGxhdGUuanMiLCIuLi8uLi9zaGFyZWQvc3R1Yi1jb21wb25lbnRzLmpzIiwiLi4vLi4vY3JlYXRlLWluc3RhbmNlL2NvbXBpbGUtdGVtcGxhdGUuanMiLCIuLi8uLi9jcmVhdGUtaW5zdGFuY2UvZGVsZXRlLW1vdW50aW5nLW9wdGlvbnMuanMiLCIuLi8uLi9jcmVhdGUtaW5zdGFuY2UvY3JlYXRlLWZ1bmN0aW9uYWwtY29tcG9uZW50LmpzIiwiLi4vLi4vY3JlYXRlLWluc3RhbmNlL2NyZWF0ZS1pbnN0YW5jZS5qcyIsIi4uL3NyYy9jcmVhdGUtZWxlbWVudC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2FycmF5RWFjaC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX25hdGl2ZUtleXMuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19iYXNlS2V5cy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gva2V5cy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VBc3NpZ24uanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19iYXNlQXNzaWduSW4uanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19hcnJheUZpbHRlci5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvc3R1YkFycmF5LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fZ2V0U3ltYm9scy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2NvcHlTeW1ib2xzLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYXJyYXlQdXNoLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fZ2V0U3ltYm9sc0luLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fY29weVN5bWJvbHNJbi5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VHZXRBbGxLZXlzLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fZ2V0QWxsS2V5cy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2dldEFsbEtleXNJbi5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX0RhdGFWaWV3LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fUHJvbWlzZS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX1NldC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX1dlYWtNYXAuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19nZXRUYWcuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19pbml0Q2xvbmVBcnJheS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Nsb25lRGF0YVZpZXcuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19hZGRNYXBFbnRyeS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2FycmF5UmVkdWNlLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fbWFwVG9BcnJheS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Nsb25lTWFwLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fY2xvbmVSZWdFeHAuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19hZGRTZXRFbnRyeS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX3NldFRvQXJyYXkuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19jbG9uZVNldC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Nsb25lU3ltYm9sLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9faW5pdENsb25lQnlUYWcuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19iYXNlQ2xvbmUuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL2Nsb25lRGVlcC5qcyIsIi4uL3NyYy9lcnJvci1oYW5kbGVyLmpzIiwiLi4vc3JjL2NyZWF0ZS1sb2NhbC12dWUuanMiLCIuLi8uLi9zaGFyZWQvbWVyZ2Utb3B0aW9ucy5qcyIsIi4uL3NyYy9jb21wb25lbnRzL1RyYW5zaXRpb25TdHViLmpzIiwiLi4vc3JjL2NvbXBvbmVudHMvVHJhbnNpdGlvbkdyb3VwU3R1Yi5qcyIsIi4uL3NyYy9jb25maWcuanMiLCIuLi9zcmMvbW91bnQuanMiLCIuLi9zcmMvc2hhbGxvdy1tb3VudC5qcyIsIi4uL3NyYy9jb21wb25lbnRzL1JvdXRlckxpbmtTdHViLmpzIiwiLi4vc3JjL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIEBmbG93XG5cbmV4cG9ydCBmdW5jdGlvbiB0aHJvd0Vycm9yIChtc2c6IHN0cmluZykge1xuICB0aHJvdyBuZXcgRXJyb3IoYFt2dWUtdGVzdC11dGlsc106ICR7bXNnfWApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3YXJuIChtc2c6IHN0cmluZykge1xuICBjb25zb2xlLmVycm9yKGBbdnVlLXRlc3QtdXRpbHNdOiAke21zZ31gKVxufVxuXG5jb25zdCBjYW1lbGl6ZVJFID0gLy0oXFx3KS9nXG5leHBvcnQgY29uc3QgY2FtZWxpemUgPSAoc3RyOiBzdHJpbmcpID0+IHN0ci5yZXBsYWNlKGNhbWVsaXplUkUsIChfLCBjKSA9PiBjID8gYy50b1VwcGVyQ2FzZSgpIDogJycpXG5cbi8qKlxuICogQ2FwaXRhbGl6ZSBhIHN0cmluZy5cbiAqL1xuZXhwb3J0IGNvbnN0IGNhcGl0YWxpemUgPSAoc3RyOiBzdHJpbmcpID0+IHN0ci5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHN0ci5zbGljZSgxKVxuXG4vKipcbiAqIEh5cGhlbmF0ZSBhIGNhbWVsQ2FzZSBzdHJpbmcuXG4gKi9cbmNvbnN0IGh5cGhlbmF0ZVJFID0gL1xcQihbQS1aXSkvZ1xuZXhwb3J0IGNvbnN0IGh5cGhlbmF0ZSA9IChzdHI6IHN0cmluZykgPT4gc3RyLnJlcGxhY2UoaHlwaGVuYXRlUkUsICctJDEnKS50b0xvd2VyQ2FzZSgpXG4iLCJpbXBvcnQgeyB0aHJvd0Vycm9yIH0gZnJvbSAnc2hhcmVkL3V0aWwnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHdhcm5JZk5vV2luZG93ICgpIHtcbiAgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgdGhyb3dFcnJvcihcbiAgICAgICd3aW5kb3cgaXMgdW5kZWZpbmVkLCB2dWUtdGVzdC11dGlscyBuZWVkcyB0byBiZSBydW4gaW4gYSBicm93c2VyIGVudmlyb25tZW50LlxcbicgK1xuICAgICAgJ1lvdSBjYW4gcnVuIHRoZSB0ZXN0cyBpbiBub2RlIHVzaW5nIGpzZG9tICsganNkb20tZ2xvYmFsLlxcbicgK1xuICAgICAgJ1NlZSBodHRwczovL3Z1ZS10ZXN0LXV0aWxzLnZ1ZWpzLm9yZy9lbi9ndWlkZXMvY29tbW9uLXRpcHMuaHRtbCBmb3IgbW9yZSBkZXRhaWxzLidcbiAgICApXG4gIH1cbn1cbiIsImlmICh0eXBlb2YgRWxlbWVudCAhPT0gJ3VuZGVmaW5lZCcgJiYgIUVsZW1lbnQucHJvdG90eXBlLm1hdGNoZXMpIHtcbiAgRWxlbWVudC5wcm90b3R5cGUubWF0Y2hlcyA9XG4gICAgICAgIEVsZW1lbnQucHJvdG90eXBlLm1hdGNoZXNTZWxlY3RvciB8fFxuICAgICAgICBFbGVtZW50LnByb3RvdHlwZS5tb3pNYXRjaGVzU2VsZWN0b3IgfHxcbiAgICAgICAgRWxlbWVudC5wcm90b3R5cGUubXNNYXRjaGVzU2VsZWN0b3IgfHxcbiAgICAgICAgRWxlbWVudC5wcm90b3R5cGUub01hdGNoZXNTZWxlY3RvciB8fFxuICAgICAgICBFbGVtZW50LnByb3RvdHlwZS53ZWJraXRNYXRjaGVzU2VsZWN0b3IgfHxcbiAgICAgICAgZnVuY3Rpb24gKHMpIHtcbiAgICAgICAgICBjb25zdCBtYXRjaGVzID0gKHRoaXMuZG9jdW1lbnQgfHwgdGhpcy5vd25lckRvY3VtZW50KS5xdWVyeVNlbGVjdG9yQWxsKHMpXG4gICAgICAgICAgbGV0IGkgPSBtYXRjaGVzLmxlbmd0aFxuICAgICAgICAgIHdoaWxlICgtLWkgPj0gMCAmJiBtYXRjaGVzLml0ZW0oaSkgIT09IHRoaXMpIHt9XG4gICAgICAgICAgcmV0dXJuIGkgPiAtMVxuICAgICAgICB9XG59XG4iLCJpZiAodHlwZW9mIE9iamVjdC5hc3NpZ24gIT09ICdmdW5jdGlvbicpIHtcbiAgKGZ1bmN0aW9uICgpIHtcbiAgICBPYmplY3QuYXNzaWduID0gZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgJ3VzZSBzdHJpY3QnXG4gICAgICBpZiAodGFyZ2V0ID09PSB1bmRlZmluZWQgfHwgdGFyZ2V0ID09PSBudWxsKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjb252ZXJ0IHVuZGVmaW5lZCBvciBudWxsIHRvIG9iamVjdCcpXG4gICAgICB9XG5cbiAgICAgIHZhciBvdXRwdXQgPSBPYmplY3QodGFyZ2V0KVxuICAgICAgZm9yICh2YXIgaW5kZXggPSAxOyBpbmRleCA8IGFyZ3VtZW50cy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpbmRleF1cbiAgICAgICAgaWYgKHNvdXJjZSAhPT0gdW5kZWZpbmVkICYmIHNvdXJjZSAhPT0gbnVsbCkge1xuICAgICAgICAgIGZvciAodmFyIG5leHRLZXkgaW4gc291cmNlKSB7XG4gICAgICAgICAgICBpZiAoc291cmNlLmhhc093blByb3BlcnR5KG5leHRLZXkpKSB7XG4gICAgICAgICAgICAgIG91dHB1dFtuZXh0S2V5XSA9IHNvdXJjZVtuZXh0S2V5XVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIG91dHB1dFxuICAgIH1cbiAgfSkoKVxufVxuIiwiLyoqXG4gKiBSZW1vdmVzIGFsbCBrZXktdmFsdWUgZW50cmllcyBmcm9tIHRoZSBsaXN0IGNhY2hlLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBjbGVhclxuICogQG1lbWJlck9mIExpc3RDYWNoZVxuICovXG5mdW5jdGlvbiBsaXN0Q2FjaGVDbGVhcigpIHtcbiAgdGhpcy5fX2RhdGFfXyA9IFtdO1xuICB0aGlzLnNpemUgPSAwO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGxpc3RDYWNoZUNsZWFyO1xuIiwiLyoqXG4gKiBQZXJmb3JtcyBhXG4gKiBbYFNhbWVWYWx1ZVplcm9gXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1zYW1ldmFsdWV6ZXJvKVxuICogY29tcGFyaXNvbiBiZXR3ZWVuIHR3byB2YWx1ZXMgdG8gZGV0ZXJtaW5lIGlmIHRoZXkgYXJlIGVxdWl2YWxlbnQuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNvbXBhcmUuXG4gKiBAcGFyYW0geyp9IG90aGVyIFRoZSBvdGhlciB2YWx1ZSB0byBjb21wYXJlLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSB2YWx1ZXMgYXJlIGVxdWl2YWxlbnQsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogdmFyIG9iamVjdCA9IHsgJ2EnOiAxIH07XG4gKiB2YXIgb3RoZXIgPSB7ICdhJzogMSB9O1xuICpcbiAqIF8uZXEob2JqZWN0LCBvYmplY3QpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uZXEob2JqZWN0LCBvdGhlcik7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uZXEoJ2EnLCAnYScpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uZXEoJ2EnLCBPYmplY3QoJ2EnKSk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uZXEoTmFOLCBOYU4pO1xuICogLy8gPT4gdHJ1ZVxuICovXG5mdW5jdGlvbiBlcSh2YWx1ZSwgb3RoZXIpIHtcbiAgcmV0dXJuIHZhbHVlID09PSBvdGhlciB8fCAodmFsdWUgIT09IHZhbHVlICYmIG90aGVyICE9PSBvdGhlcik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZXE7XG4iLCJ2YXIgZXEgPSByZXF1aXJlKCcuL2VxJyk7XG5cbi8qKlxuICogR2V0cyB0aGUgaW5kZXggYXQgd2hpY2ggdGhlIGBrZXlgIGlzIGZvdW5kIGluIGBhcnJheWAgb2Yga2V5LXZhbHVlIHBhaXJzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gaW5zcGVjdC5cbiAqIEBwYXJhbSB7Kn0ga2V5IFRoZSBrZXkgdG8gc2VhcmNoIGZvci5cbiAqIEByZXR1cm5zIHtudW1iZXJ9IFJldHVybnMgdGhlIGluZGV4IG9mIHRoZSBtYXRjaGVkIHZhbHVlLCBlbHNlIGAtMWAuXG4gKi9cbmZ1bmN0aW9uIGFzc29jSW5kZXhPZihhcnJheSwga2V5KSB7XG4gIHZhciBsZW5ndGggPSBhcnJheS5sZW5ndGg7XG4gIHdoaWxlIChsZW5ndGgtLSkge1xuICAgIGlmIChlcShhcnJheVtsZW5ndGhdWzBdLCBrZXkpKSB7XG4gICAgICByZXR1cm4gbGVuZ3RoO1xuICAgIH1cbiAgfVxuICByZXR1cm4gLTE7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYXNzb2NJbmRleE9mO1xuIiwidmFyIGFzc29jSW5kZXhPZiA9IHJlcXVpcmUoJy4vX2Fzc29jSW5kZXhPZicpO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgYXJyYXlQcm90byA9IEFycmF5LnByb3RvdHlwZTtcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgc3BsaWNlID0gYXJyYXlQcm90by5zcGxpY2U7XG5cbi8qKlxuICogUmVtb3ZlcyBga2V5YCBhbmQgaXRzIHZhbHVlIGZyb20gdGhlIGxpc3QgY2FjaGUuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGRlbGV0ZVxuICogQG1lbWJlck9mIExpc3RDYWNoZVxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byByZW1vdmUuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGVudHJ5IHdhcyByZW1vdmVkLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGxpc3RDYWNoZURlbGV0ZShrZXkpIHtcbiAgdmFyIGRhdGEgPSB0aGlzLl9fZGF0YV9fLFxuICAgICAgaW5kZXggPSBhc3NvY0luZGV4T2YoZGF0YSwga2V5KTtcblxuICBpZiAoaW5kZXggPCAwKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciBsYXN0SW5kZXggPSBkYXRhLmxlbmd0aCAtIDE7XG4gIGlmIChpbmRleCA9PSBsYXN0SW5kZXgpIHtcbiAgICBkYXRhLnBvcCgpO1xuICB9IGVsc2Uge1xuICAgIHNwbGljZS5jYWxsKGRhdGEsIGluZGV4LCAxKTtcbiAgfVxuICAtLXRoaXMuc2l6ZTtcbiAgcmV0dXJuIHRydWU7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbGlzdENhY2hlRGVsZXRlO1xuIiwidmFyIGFzc29jSW5kZXhPZiA9IHJlcXVpcmUoJy4vX2Fzc29jSW5kZXhPZicpO1xuXG4vKipcbiAqIEdldHMgdGhlIGxpc3QgY2FjaGUgdmFsdWUgZm9yIGBrZXlgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBnZXRcbiAqIEBtZW1iZXJPZiBMaXN0Q2FjaGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gZ2V0LlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIGVudHJ5IHZhbHVlLlxuICovXG5mdW5jdGlvbiBsaXN0Q2FjaGVHZXQoa2V5KSB7XG4gIHZhciBkYXRhID0gdGhpcy5fX2RhdGFfXyxcbiAgICAgIGluZGV4ID0gYXNzb2NJbmRleE9mKGRhdGEsIGtleSk7XG5cbiAgcmV0dXJuIGluZGV4IDwgMCA/IHVuZGVmaW5lZCA6IGRhdGFbaW5kZXhdWzFdO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGxpc3RDYWNoZUdldDtcbiIsInZhciBhc3NvY0luZGV4T2YgPSByZXF1aXJlKCcuL19hc3NvY0luZGV4T2YnKTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYSBsaXN0IGNhY2hlIHZhbHVlIGZvciBga2V5YCBleGlzdHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGhhc1xuICogQG1lbWJlck9mIExpc3RDYWNoZVxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBlbnRyeSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBhbiBlbnRyeSBmb3IgYGtleWAgZXhpc3RzLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGxpc3RDYWNoZUhhcyhrZXkpIHtcbiAgcmV0dXJuIGFzc29jSW5kZXhPZih0aGlzLl9fZGF0YV9fLCBrZXkpID4gLTE7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbGlzdENhY2hlSGFzO1xuIiwidmFyIGFzc29jSW5kZXhPZiA9IHJlcXVpcmUoJy4vX2Fzc29jSW5kZXhPZicpO1xuXG4vKipcbiAqIFNldHMgdGhlIGxpc3QgY2FjaGUgYGtleWAgdG8gYHZhbHVlYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgc2V0XG4gKiBAbWVtYmVyT2YgTGlzdENhY2hlXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIHNldC5cbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHNldC5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIGxpc3QgY2FjaGUgaW5zdGFuY2UuXG4gKi9cbmZ1bmN0aW9uIGxpc3RDYWNoZVNldChrZXksIHZhbHVlKSB7XG4gIHZhciBkYXRhID0gdGhpcy5fX2RhdGFfXyxcbiAgICAgIGluZGV4ID0gYXNzb2NJbmRleE9mKGRhdGEsIGtleSk7XG5cbiAgaWYgKGluZGV4IDwgMCkge1xuICAgICsrdGhpcy5zaXplO1xuICAgIGRhdGEucHVzaChba2V5LCB2YWx1ZV0pO1xuICB9IGVsc2Uge1xuICAgIGRhdGFbaW5kZXhdWzFdID0gdmFsdWU7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbGlzdENhY2hlU2V0O1xuIiwidmFyIGxpc3RDYWNoZUNsZWFyID0gcmVxdWlyZSgnLi9fbGlzdENhY2hlQ2xlYXInKSxcbiAgICBsaXN0Q2FjaGVEZWxldGUgPSByZXF1aXJlKCcuL19saXN0Q2FjaGVEZWxldGUnKSxcbiAgICBsaXN0Q2FjaGVHZXQgPSByZXF1aXJlKCcuL19saXN0Q2FjaGVHZXQnKSxcbiAgICBsaXN0Q2FjaGVIYXMgPSByZXF1aXJlKCcuL19saXN0Q2FjaGVIYXMnKSxcbiAgICBsaXN0Q2FjaGVTZXQgPSByZXF1aXJlKCcuL19saXN0Q2FjaGVTZXQnKTtcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGxpc3QgY2FjaGUgb2JqZWN0LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7QXJyYXl9IFtlbnRyaWVzXSBUaGUga2V5LXZhbHVlIHBhaXJzIHRvIGNhY2hlLlxuICovXG5mdW5jdGlvbiBMaXN0Q2FjaGUoZW50cmllcykge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IGVudHJpZXMgPT0gbnVsbCA/IDAgOiBlbnRyaWVzLmxlbmd0aDtcblxuICB0aGlzLmNsZWFyKCk7XG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgdmFyIGVudHJ5ID0gZW50cmllc1tpbmRleF07XG4gICAgdGhpcy5zZXQoZW50cnlbMF0sIGVudHJ5WzFdKTtcbiAgfVxufVxuXG4vLyBBZGQgbWV0aG9kcyB0byBgTGlzdENhY2hlYC5cbkxpc3RDYWNoZS5wcm90b3R5cGUuY2xlYXIgPSBsaXN0Q2FjaGVDbGVhcjtcbkxpc3RDYWNoZS5wcm90b3R5cGVbJ2RlbGV0ZSddID0gbGlzdENhY2hlRGVsZXRlO1xuTGlzdENhY2hlLnByb3RvdHlwZS5nZXQgPSBsaXN0Q2FjaGVHZXQ7XG5MaXN0Q2FjaGUucHJvdG90eXBlLmhhcyA9IGxpc3RDYWNoZUhhcztcbkxpc3RDYWNoZS5wcm90b3R5cGUuc2V0ID0gbGlzdENhY2hlU2V0O1xuXG5tb2R1bGUuZXhwb3J0cyA9IExpc3RDYWNoZTtcbiIsInZhciBMaXN0Q2FjaGUgPSByZXF1aXJlKCcuL19MaXN0Q2FjaGUnKTtcblxuLyoqXG4gKiBSZW1vdmVzIGFsbCBrZXktdmFsdWUgZW50cmllcyBmcm9tIHRoZSBzdGFjay5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgY2xlYXJcbiAqIEBtZW1iZXJPZiBTdGFja1xuICovXG5mdW5jdGlvbiBzdGFja0NsZWFyKCkge1xuICB0aGlzLl9fZGF0YV9fID0gbmV3IExpc3RDYWNoZTtcbiAgdGhpcy5zaXplID0gMDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzdGFja0NsZWFyO1xuIiwiLyoqXG4gKiBSZW1vdmVzIGBrZXlgIGFuZCBpdHMgdmFsdWUgZnJvbSB0aGUgc3RhY2suXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGRlbGV0ZVxuICogQG1lbWJlck9mIFN0YWNrXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIHJlbW92ZS5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgZW50cnkgd2FzIHJlbW92ZWQsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gc3RhY2tEZWxldGUoa2V5KSB7XG4gIHZhciBkYXRhID0gdGhpcy5fX2RhdGFfXyxcbiAgICAgIHJlc3VsdCA9IGRhdGFbJ2RlbGV0ZSddKGtleSk7XG5cbiAgdGhpcy5zaXplID0gZGF0YS5zaXplO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHN0YWNrRGVsZXRlO1xuIiwiLyoqXG4gKiBHZXRzIHRoZSBzdGFjayB2YWx1ZSBmb3IgYGtleWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGdldFxuICogQG1lbWJlck9mIFN0YWNrXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIGdldC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBlbnRyeSB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gc3RhY2tHZXQoa2V5KSB7XG4gIHJldHVybiB0aGlzLl9fZGF0YV9fLmdldChrZXkpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHN0YWNrR2V0O1xuIiwiLyoqXG4gKiBDaGVja3MgaWYgYSBzdGFjayB2YWx1ZSBmb3IgYGtleWAgZXhpc3RzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBoYXNcbiAqIEBtZW1iZXJPZiBTdGFja1xuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBlbnRyeSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBhbiBlbnRyeSBmb3IgYGtleWAgZXhpc3RzLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIHN0YWNrSGFzKGtleSkge1xuICByZXR1cm4gdGhpcy5fX2RhdGFfXy5oYXMoa2V5KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzdGFja0hhcztcbiIsIi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgZ2xvYmFsYCBmcm9tIE5vZGUuanMuICovXG52YXIgZnJlZUdsb2JhbCA9IHR5cGVvZiBnbG9iYWwgPT0gJ29iamVjdCcgJiYgZ2xvYmFsICYmIGdsb2JhbC5PYmplY3QgPT09IE9iamVjdCAmJiBnbG9iYWw7XG5cbm1vZHVsZS5leHBvcnRzID0gZnJlZUdsb2JhbDtcbiIsInZhciBmcmVlR2xvYmFsID0gcmVxdWlyZSgnLi9fZnJlZUdsb2JhbCcpO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYHNlbGZgLiAqL1xudmFyIGZyZWVTZWxmID0gdHlwZW9mIHNlbGYgPT0gJ29iamVjdCcgJiYgc2VsZiAmJiBzZWxmLk9iamVjdCA9PT0gT2JqZWN0ICYmIHNlbGY7XG5cbi8qKiBVc2VkIGFzIGEgcmVmZXJlbmNlIHRvIHRoZSBnbG9iYWwgb2JqZWN0LiAqL1xudmFyIHJvb3QgPSBmcmVlR2xvYmFsIHx8IGZyZWVTZWxmIHx8IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gcm9vdDtcbiIsInZhciByb290ID0gcmVxdWlyZSgnLi9fcm9vdCcpO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBTeW1ib2wgPSByb290LlN5bWJvbDtcblxubW9kdWxlLmV4cG9ydHMgPSBTeW1ib2w7XG4iLCJ2YXIgU3ltYm9sID0gcmVxdWlyZSgnLi9fU3ltYm9sJyk7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogVXNlZCB0byByZXNvbHZlIHRoZVxuICogW2B0b1N0cmluZ1RhZ2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLW9iamVjdC5wcm90b3R5cGUudG9zdHJpbmcpXG4gKiBvZiB2YWx1ZXMuXG4gKi9cbnZhciBuYXRpdmVPYmplY3RUb1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBzeW1Ub1N0cmluZ1RhZyA9IFN5bWJvbCA/IFN5bWJvbC50b1N0cmluZ1RhZyA6IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBBIHNwZWNpYWxpemVkIHZlcnNpb24gb2YgYGJhc2VHZXRUYWdgIHdoaWNoIGlnbm9yZXMgYFN5bWJvbC50b1N0cmluZ1RhZ2AgdmFsdWVzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIHJhdyBgdG9TdHJpbmdUYWdgLlxuICovXG5mdW5jdGlvbiBnZXRSYXdUYWcodmFsdWUpIHtcbiAgdmFyIGlzT3duID0gaGFzT3duUHJvcGVydHkuY2FsbCh2YWx1ZSwgc3ltVG9TdHJpbmdUYWcpLFxuICAgICAgdGFnID0gdmFsdWVbc3ltVG9TdHJpbmdUYWddO1xuXG4gIHRyeSB7XG4gICAgdmFsdWVbc3ltVG9TdHJpbmdUYWddID0gdW5kZWZpbmVkO1xuICAgIHZhciB1bm1hc2tlZCA9IHRydWU7XG4gIH0gY2F0Y2ggKGUpIHt9XG5cbiAgdmFyIHJlc3VsdCA9IG5hdGl2ZU9iamVjdFRvU3RyaW5nLmNhbGwodmFsdWUpO1xuICBpZiAodW5tYXNrZWQpIHtcbiAgICBpZiAoaXNPd24pIHtcbiAgICAgIHZhbHVlW3N5bVRvU3RyaW5nVGFnXSA9IHRhZztcbiAgICB9IGVsc2Uge1xuICAgICAgZGVsZXRlIHZhbHVlW3N5bVRvU3RyaW5nVGFnXTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZXRSYXdUYWc7XG4iLCIvKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKipcbiAqIFVzZWQgdG8gcmVzb2x2ZSB0aGVcbiAqIFtgdG9TdHJpbmdUYWdgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1vYmplY3QucHJvdG90eXBlLnRvc3RyaW5nKVxuICogb2YgdmFsdWVzLlxuICovXG52YXIgbmF0aXZlT2JqZWN0VG9TdHJpbmcgPSBvYmplY3RQcm90by50b1N0cmluZztcblxuLyoqXG4gKiBDb252ZXJ0cyBgdmFsdWVgIHRvIGEgc3RyaW5nIHVzaW5nIGBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY29udmVydC5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIGNvbnZlcnRlZCBzdHJpbmcuXG4gKi9cbmZ1bmN0aW9uIG9iamVjdFRvU3RyaW5nKHZhbHVlKSB7XG4gIHJldHVybiBuYXRpdmVPYmplY3RUb1N0cmluZy5jYWxsKHZhbHVlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBvYmplY3RUb1N0cmluZztcbiIsInZhciBTeW1ib2wgPSByZXF1aXJlKCcuL19TeW1ib2wnKSxcbiAgICBnZXRSYXdUYWcgPSByZXF1aXJlKCcuL19nZXRSYXdUYWcnKSxcbiAgICBvYmplY3RUb1N0cmluZyA9IHJlcXVpcmUoJy4vX29iamVjdFRvU3RyaW5nJyk7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBudWxsVGFnID0gJ1tvYmplY3QgTnVsbF0nLFxuICAgIHVuZGVmaW5lZFRhZyA9ICdbb2JqZWN0IFVuZGVmaW5lZF0nO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBzeW1Ub1N0cmluZ1RhZyA9IFN5bWJvbCA/IFN5bWJvbC50b1N0cmluZ1RhZyA6IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgZ2V0VGFnYCB3aXRob3V0IGZhbGxiYWNrcyBmb3IgYnVnZ3kgZW52aXJvbm1lbnRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIGB0b1N0cmluZ1RhZ2AuXG4gKi9cbmZ1bmN0aW9uIGJhc2VHZXRUYWcodmFsdWUpIHtcbiAgaWYgKHZhbHVlID09IG51bGwpIHtcbiAgICByZXR1cm4gdmFsdWUgPT09IHVuZGVmaW5lZCA/IHVuZGVmaW5lZFRhZyA6IG51bGxUYWc7XG4gIH1cbiAgcmV0dXJuIChzeW1Ub1N0cmluZ1RhZyAmJiBzeW1Ub1N0cmluZ1RhZyBpbiBPYmplY3QodmFsdWUpKVxuICAgID8gZ2V0UmF3VGFnKHZhbHVlKVxuICAgIDogb2JqZWN0VG9TdHJpbmcodmFsdWUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VHZXRUYWc7XG4iLCIvKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIHRoZVxuICogW2xhbmd1YWdlIHR5cGVdKGh0dHA6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1lY21hc2NyaXB0LWxhbmd1YWdlLXR5cGVzKVxuICogb2YgYE9iamVjdGAuIChlLmcuIGFycmF5cywgZnVuY3Rpb25zLCBvYmplY3RzLCByZWdleGVzLCBgbmV3IE51bWJlcigwKWAsIGFuZCBgbmV3IFN0cmluZygnJylgKVxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFuIG9iamVjdCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzT2JqZWN0KHt9KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChfLm5vb3ApO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QobnVsbCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdCh2YWx1ZSkge1xuICB2YXIgdHlwZSA9IHR5cGVvZiB2YWx1ZTtcbiAgcmV0dXJuIHZhbHVlICE9IG51bGwgJiYgKHR5cGUgPT0gJ29iamVjdCcgfHwgdHlwZSA9PSAnZnVuY3Rpb24nKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc09iamVjdDtcbiIsInZhciBiYXNlR2V0VGFnID0gcmVxdWlyZSgnLi9fYmFzZUdldFRhZycpLFxuICAgIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9pc09iamVjdCcpO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgYXN5bmNUYWcgPSAnW29iamVjdCBBc3luY0Z1bmN0aW9uXScsXG4gICAgZnVuY1RhZyA9ICdbb2JqZWN0IEZ1bmN0aW9uXScsXG4gICAgZ2VuVGFnID0gJ1tvYmplY3QgR2VuZXJhdG9yRnVuY3Rpb25dJyxcbiAgICBwcm94eVRhZyA9ICdbb2JqZWN0IFByb3h5XSc7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgY2xhc3NpZmllZCBhcyBhIGBGdW5jdGlvbmAgb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgZnVuY3Rpb24sIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0Z1bmN0aW9uKF8pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNGdW5jdGlvbigvYWJjLyk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKHZhbHVlKSB7XG4gIGlmICghaXNPYmplY3QodmFsdWUpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIC8vIFRoZSB1c2Ugb2YgYE9iamVjdCN0b1N0cmluZ2AgYXZvaWRzIGlzc3VlcyB3aXRoIHRoZSBgdHlwZW9mYCBvcGVyYXRvclxuICAvLyBpbiBTYWZhcmkgOSB3aGljaCByZXR1cm5zICdvYmplY3QnIGZvciB0eXBlZCBhcnJheXMgYW5kIG90aGVyIGNvbnN0cnVjdG9ycy5cbiAgdmFyIHRhZyA9IGJhc2VHZXRUYWcodmFsdWUpO1xuICByZXR1cm4gdGFnID09IGZ1bmNUYWcgfHwgdGFnID09IGdlblRhZyB8fCB0YWcgPT0gYXN5bmNUYWcgfHwgdGFnID09IHByb3h5VGFnO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzRnVuY3Rpb247XG4iLCJ2YXIgcm9vdCA9IHJlcXVpcmUoJy4vX3Jvb3QnKTtcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IG92ZXJyZWFjaGluZyBjb3JlLWpzIHNoaW1zLiAqL1xudmFyIGNvcmVKc0RhdGEgPSByb290WydfX2NvcmUtanNfc2hhcmVkX18nXTtcblxubW9kdWxlLmV4cG9ydHMgPSBjb3JlSnNEYXRhO1xuIiwidmFyIGNvcmVKc0RhdGEgPSByZXF1aXJlKCcuL19jb3JlSnNEYXRhJyk7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBtZXRob2RzIG1hc3F1ZXJhZGluZyBhcyBuYXRpdmUuICovXG52YXIgbWFza1NyY0tleSA9IChmdW5jdGlvbigpIHtcbiAgdmFyIHVpZCA9IC9bXi5dKyQvLmV4ZWMoY29yZUpzRGF0YSAmJiBjb3JlSnNEYXRhLmtleXMgJiYgY29yZUpzRGF0YS5rZXlzLklFX1BST1RPIHx8ICcnKTtcbiAgcmV0dXJuIHVpZCA/ICgnU3ltYm9sKHNyYylfMS4nICsgdWlkKSA6ICcnO1xufSgpKTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYGZ1bmNgIGhhcyBpdHMgc291cmNlIG1hc2tlZC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYGZ1bmNgIGlzIG1hc2tlZCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc01hc2tlZChmdW5jKSB7XG4gIHJldHVybiAhIW1hc2tTcmNLZXkgJiYgKG1hc2tTcmNLZXkgaW4gZnVuYyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNNYXNrZWQ7XG4iLCIvKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgZnVuY1Byb3RvID0gRnVuY3Rpb24ucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byByZXNvbHZlIHRoZSBkZWNvbXBpbGVkIHNvdXJjZSBvZiBmdW5jdGlvbnMuICovXG52YXIgZnVuY1RvU3RyaW5nID0gZnVuY1Byb3RvLnRvU3RyaW5nO1xuXG4vKipcbiAqIENvbnZlcnRzIGBmdW5jYCB0byBpdHMgc291cmNlIGNvZGUuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGNvbnZlcnQuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBzb3VyY2UgY29kZS5cbiAqL1xuZnVuY3Rpb24gdG9Tb3VyY2UoZnVuYykge1xuICBpZiAoZnVuYyAhPSBudWxsKSB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBmdW5jVG9TdHJpbmcuY2FsbChmdW5jKTtcbiAgICB9IGNhdGNoIChlKSB7fVxuICAgIHRyeSB7XG4gICAgICByZXR1cm4gKGZ1bmMgKyAnJyk7XG4gICAgfSBjYXRjaCAoZSkge31cbiAgfVxuICByZXR1cm4gJyc7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdG9Tb3VyY2U7XG4iLCJ2YXIgaXNGdW5jdGlvbiA9IHJlcXVpcmUoJy4vaXNGdW5jdGlvbicpLFxuICAgIGlzTWFza2VkID0gcmVxdWlyZSgnLi9faXNNYXNrZWQnKSxcbiAgICBpc09iamVjdCA9IHJlcXVpcmUoJy4vaXNPYmplY3QnKSxcbiAgICB0b1NvdXJjZSA9IHJlcXVpcmUoJy4vX3RvU291cmNlJyk7XG5cbi8qKlxuICogVXNlZCB0byBtYXRjaCBgUmVnRXhwYFxuICogW3N5bnRheCBjaGFyYWN0ZXJzXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1wYXR0ZXJucykuXG4gKi9cbnZhciByZVJlZ0V4cENoYXIgPSAvW1xcXFxeJC4qKz8oKVtcXF17fXxdL2c7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBob3N0IGNvbnN0cnVjdG9ycyAoU2FmYXJpKS4gKi9cbnZhciByZUlzSG9zdEN0b3IgPSAvXlxcW29iamVjdCAuKz9Db25zdHJ1Y3RvclxcXSQvO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgZnVuY1Byb3RvID0gRnVuY3Rpb24ucHJvdG90eXBlLFxuICAgIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gcmVzb2x2ZSB0aGUgZGVjb21waWxlZCBzb3VyY2Ugb2YgZnVuY3Rpb25zLiAqL1xudmFyIGZ1bmNUb1N0cmluZyA9IGZ1bmNQcm90by50b1N0cmluZztcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IGlmIGEgbWV0aG9kIGlzIG5hdGl2ZS4gKi9cbnZhciByZUlzTmF0aXZlID0gUmVnRXhwKCdeJyArXG4gIGZ1bmNUb1N0cmluZy5jYWxsKGhhc093blByb3BlcnR5KS5yZXBsYWNlKHJlUmVnRXhwQ2hhciwgJ1xcXFwkJicpXG4gIC5yZXBsYWNlKC9oYXNPd25Qcm9wZXJ0eXwoZnVuY3Rpb24pLio/KD89XFxcXFxcKCl8IGZvciAuKz8oPz1cXFxcXFxdKS9nLCAnJDEuKj8nKSArICckJ1xuKTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5pc05hdGl2ZWAgd2l0aG91dCBiYWQgc2hpbSBjaGVja3MuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBuYXRpdmUgZnVuY3Rpb24sXG4gKiAgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBiYXNlSXNOYXRpdmUodmFsdWUpIHtcbiAgaWYgKCFpc09iamVjdCh2YWx1ZSkgfHwgaXNNYXNrZWQodmFsdWUpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciBwYXR0ZXJuID0gaXNGdW5jdGlvbih2YWx1ZSkgPyByZUlzTmF0aXZlIDogcmVJc0hvc3RDdG9yO1xuICByZXR1cm4gcGF0dGVybi50ZXN0KHRvU291cmNlKHZhbHVlKSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUlzTmF0aXZlO1xuIiwiLyoqXG4gKiBHZXRzIHRoZSB2YWx1ZSBhdCBga2V5YCBvZiBgb2JqZWN0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IFtvYmplY3RdIFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHByb3BlcnR5IHRvIGdldC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBwcm9wZXJ0eSB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gZ2V0VmFsdWUob2JqZWN0LCBrZXkpIHtcbiAgcmV0dXJuIG9iamVjdCA9PSBudWxsID8gdW5kZWZpbmVkIDogb2JqZWN0W2tleV07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0VmFsdWU7XG4iLCJ2YXIgYmFzZUlzTmF0aXZlID0gcmVxdWlyZSgnLi9fYmFzZUlzTmF0aXZlJyksXG4gICAgZ2V0VmFsdWUgPSByZXF1aXJlKCcuL19nZXRWYWx1ZScpO1xuXG4vKipcbiAqIEdldHMgdGhlIG5hdGl2ZSBmdW5jdGlvbiBhdCBga2V5YCBvZiBgb2JqZWN0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBtZXRob2QgdG8gZ2V0LlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIGZ1bmN0aW9uIGlmIGl0J3MgbmF0aXZlLCBlbHNlIGB1bmRlZmluZWRgLlxuICovXG5mdW5jdGlvbiBnZXROYXRpdmUob2JqZWN0LCBrZXkpIHtcbiAgdmFyIHZhbHVlID0gZ2V0VmFsdWUob2JqZWN0LCBrZXkpO1xuICByZXR1cm4gYmFzZUlzTmF0aXZlKHZhbHVlKSA/IHZhbHVlIDogdW5kZWZpbmVkO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldE5hdGl2ZTtcbiIsInZhciBnZXROYXRpdmUgPSByZXF1aXJlKCcuL19nZXROYXRpdmUnKSxcbiAgICByb290ID0gcmVxdWlyZSgnLi9fcm9vdCcpO1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyB0aGF0IGFyZSB2ZXJpZmllZCB0byBiZSBuYXRpdmUuICovXG52YXIgTWFwID0gZ2V0TmF0aXZlKHJvb3QsICdNYXAnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBNYXA7XG4iLCJ2YXIgZ2V0TmF0aXZlID0gcmVxdWlyZSgnLi9fZ2V0TmF0aXZlJyk7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIHRoYXQgYXJlIHZlcmlmaWVkIHRvIGJlIG5hdGl2ZS4gKi9cbnZhciBuYXRpdmVDcmVhdGUgPSBnZXROYXRpdmUoT2JqZWN0LCAnY3JlYXRlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gbmF0aXZlQ3JlYXRlO1xuIiwidmFyIG5hdGl2ZUNyZWF0ZSA9IHJlcXVpcmUoJy4vX25hdGl2ZUNyZWF0ZScpO1xuXG4vKipcbiAqIFJlbW92ZXMgYWxsIGtleS12YWx1ZSBlbnRyaWVzIGZyb20gdGhlIGhhc2guXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGNsZWFyXG4gKiBAbWVtYmVyT2YgSGFzaFxuICovXG5mdW5jdGlvbiBoYXNoQ2xlYXIoKSB7XG4gIHRoaXMuX19kYXRhX18gPSBuYXRpdmVDcmVhdGUgPyBuYXRpdmVDcmVhdGUobnVsbCkgOiB7fTtcbiAgdGhpcy5zaXplID0gMDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBoYXNoQ2xlYXI7XG4iLCIvKipcbiAqIFJlbW92ZXMgYGtleWAgYW5kIGl0cyB2YWx1ZSBmcm9tIHRoZSBoYXNoLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBkZWxldGVcbiAqIEBtZW1iZXJPZiBIYXNoXG4gKiBAcGFyYW0ge09iamVjdH0gaGFzaCBUaGUgaGFzaCB0byBtb2RpZnkuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIHJlbW92ZS5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgZW50cnkgd2FzIHJlbW92ZWQsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaGFzaERlbGV0ZShrZXkpIHtcbiAgdmFyIHJlc3VsdCA9IHRoaXMuaGFzKGtleSkgJiYgZGVsZXRlIHRoaXMuX19kYXRhX19ba2V5XTtcbiAgdGhpcy5zaXplIC09IHJlc3VsdCA/IDEgOiAwO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGhhc2hEZWxldGU7XG4iLCJ2YXIgbmF0aXZlQ3JlYXRlID0gcmVxdWlyZSgnLi9fbmF0aXZlQ3JlYXRlJyk7XG5cbi8qKiBVc2VkIHRvIHN0YW5kLWluIGZvciBgdW5kZWZpbmVkYCBoYXNoIHZhbHVlcy4gKi9cbnZhciBIQVNIX1VOREVGSU5FRCA9ICdfX2xvZGFzaF9oYXNoX3VuZGVmaW5lZF9fJztcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBHZXRzIHRoZSBoYXNoIHZhbHVlIGZvciBga2V5YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgZ2V0XG4gKiBAbWVtYmVyT2YgSGFzaFxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byBnZXQuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgZW50cnkgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIGhhc2hHZXQoa2V5KSB7XG4gIHZhciBkYXRhID0gdGhpcy5fX2RhdGFfXztcbiAgaWYgKG5hdGl2ZUNyZWF0ZSkge1xuICAgIHZhciByZXN1bHQgPSBkYXRhW2tleV07XG4gICAgcmV0dXJuIHJlc3VsdCA9PT0gSEFTSF9VTkRFRklORUQgPyB1bmRlZmluZWQgOiByZXN1bHQ7XG4gIH1cbiAgcmV0dXJuIGhhc093blByb3BlcnR5LmNhbGwoZGF0YSwga2V5KSA/IGRhdGFba2V5XSA6IHVuZGVmaW5lZDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBoYXNoR2V0O1xuIiwidmFyIG5hdGl2ZUNyZWF0ZSA9IHJlcXVpcmUoJy4vX25hdGl2ZUNyZWF0ZScpO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIENoZWNrcyBpZiBhIGhhc2ggdmFsdWUgZm9yIGBrZXlgIGV4aXN0cy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgaGFzXG4gKiBAbWVtYmVyT2YgSGFzaFxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBlbnRyeSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBhbiBlbnRyeSBmb3IgYGtleWAgZXhpc3RzLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGhhc2hIYXMoa2V5KSB7XG4gIHZhciBkYXRhID0gdGhpcy5fX2RhdGFfXztcbiAgcmV0dXJuIG5hdGl2ZUNyZWF0ZSA/IChkYXRhW2tleV0gIT09IHVuZGVmaW5lZCkgOiBoYXNPd25Qcm9wZXJ0eS5jYWxsKGRhdGEsIGtleSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaGFzaEhhcztcbiIsInZhciBuYXRpdmVDcmVhdGUgPSByZXF1aXJlKCcuL19uYXRpdmVDcmVhdGUnKTtcblxuLyoqIFVzZWQgdG8gc3RhbmQtaW4gZm9yIGB1bmRlZmluZWRgIGhhc2ggdmFsdWVzLiAqL1xudmFyIEhBU0hfVU5ERUZJTkVEID0gJ19fbG9kYXNoX2hhc2hfdW5kZWZpbmVkX18nO1xuXG4vKipcbiAqIFNldHMgdGhlIGhhc2ggYGtleWAgdG8gYHZhbHVlYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgc2V0XG4gKiBAbWVtYmVyT2YgSGFzaFxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byBzZXQuXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBzZXQuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBoYXNoIGluc3RhbmNlLlxuICovXG5mdW5jdGlvbiBoYXNoU2V0KGtleSwgdmFsdWUpIHtcbiAgdmFyIGRhdGEgPSB0aGlzLl9fZGF0YV9fO1xuICB0aGlzLnNpemUgKz0gdGhpcy5oYXMoa2V5KSA/IDAgOiAxO1xuICBkYXRhW2tleV0gPSAobmF0aXZlQ3JlYXRlICYmIHZhbHVlID09PSB1bmRlZmluZWQpID8gSEFTSF9VTkRFRklORUQgOiB2YWx1ZTtcbiAgcmV0dXJuIHRoaXM7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaGFzaFNldDtcbiIsInZhciBoYXNoQ2xlYXIgPSByZXF1aXJlKCcuL19oYXNoQ2xlYXInKSxcbiAgICBoYXNoRGVsZXRlID0gcmVxdWlyZSgnLi9faGFzaERlbGV0ZScpLFxuICAgIGhhc2hHZXQgPSByZXF1aXJlKCcuL19oYXNoR2V0JyksXG4gICAgaGFzaEhhcyA9IHJlcXVpcmUoJy4vX2hhc2hIYXMnKSxcbiAgICBoYXNoU2V0ID0gcmVxdWlyZSgnLi9faGFzaFNldCcpO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBoYXNoIG9iamVjdC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge0FycmF5fSBbZW50cmllc10gVGhlIGtleS12YWx1ZSBwYWlycyB0byBjYWNoZS5cbiAqL1xuZnVuY3Rpb24gSGFzaChlbnRyaWVzKSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gZW50cmllcyA9PSBudWxsID8gMCA6IGVudHJpZXMubGVuZ3RoO1xuXG4gIHRoaXMuY2xlYXIoKTtcbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICB2YXIgZW50cnkgPSBlbnRyaWVzW2luZGV4XTtcbiAgICB0aGlzLnNldChlbnRyeVswXSwgZW50cnlbMV0pO1xuICB9XG59XG5cbi8vIEFkZCBtZXRob2RzIHRvIGBIYXNoYC5cbkhhc2gucHJvdG90eXBlLmNsZWFyID0gaGFzaENsZWFyO1xuSGFzaC5wcm90b3R5cGVbJ2RlbGV0ZSddID0gaGFzaERlbGV0ZTtcbkhhc2gucHJvdG90eXBlLmdldCA9IGhhc2hHZXQ7XG5IYXNoLnByb3RvdHlwZS5oYXMgPSBoYXNoSGFzO1xuSGFzaC5wcm90b3R5cGUuc2V0ID0gaGFzaFNldDtcblxubW9kdWxlLmV4cG9ydHMgPSBIYXNoO1xuIiwidmFyIEhhc2ggPSByZXF1aXJlKCcuL19IYXNoJyksXG4gICAgTGlzdENhY2hlID0gcmVxdWlyZSgnLi9fTGlzdENhY2hlJyksXG4gICAgTWFwID0gcmVxdWlyZSgnLi9fTWFwJyk7XG5cbi8qKlxuICogUmVtb3ZlcyBhbGwga2V5LXZhbHVlIGVudHJpZXMgZnJvbSB0aGUgbWFwLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBjbGVhclxuICogQG1lbWJlck9mIE1hcENhY2hlXG4gKi9cbmZ1bmN0aW9uIG1hcENhY2hlQ2xlYXIoKSB7XG4gIHRoaXMuc2l6ZSA9IDA7XG4gIHRoaXMuX19kYXRhX18gPSB7XG4gICAgJ2hhc2gnOiBuZXcgSGFzaCxcbiAgICAnbWFwJzogbmV3IChNYXAgfHwgTGlzdENhY2hlKSxcbiAgICAnc3RyaW5nJzogbmV3IEhhc2hcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBtYXBDYWNoZUNsZWFyO1xuIiwiLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBzdWl0YWJsZSBmb3IgdXNlIGFzIHVuaXF1ZSBvYmplY3Qga2V5LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIHN1aXRhYmxlLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGlzS2V5YWJsZSh2YWx1ZSkge1xuICB2YXIgdHlwZSA9IHR5cGVvZiB2YWx1ZTtcbiAgcmV0dXJuICh0eXBlID09ICdzdHJpbmcnIHx8IHR5cGUgPT0gJ251bWJlcicgfHwgdHlwZSA9PSAnc3ltYm9sJyB8fCB0eXBlID09ICdib29sZWFuJylcbiAgICA/ICh2YWx1ZSAhPT0gJ19fcHJvdG9fXycpXG4gICAgOiAodmFsdWUgPT09IG51bGwpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzS2V5YWJsZTtcbiIsInZhciBpc0tleWFibGUgPSByZXF1aXJlKCcuL19pc0tleWFibGUnKTtcblxuLyoqXG4gKiBHZXRzIHRoZSBkYXRhIGZvciBgbWFwYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG1hcCBUaGUgbWFwIHRvIHF1ZXJ5LlxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUgcmVmZXJlbmNlIGtleS5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBtYXAgZGF0YS5cbiAqL1xuZnVuY3Rpb24gZ2V0TWFwRGF0YShtYXAsIGtleSkge1xuICB2YXIgZGF0YSA9IG1hcC5fX2RhdGFfXztcbiAgcmV0dXJuIGlzS2V5YWJsZShrZXkpXG4gICAgPyBkYXRhW3R5cGVvZiBrZXkgPT0gJ3N0cmluZycgPyAnc3RyaW5nJyA6ICdoYXNoJ11cbiAgICA6IGRhdGEubWFwO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldE1hcERhdGE7XG4iLCJ2YXIgZ2V0TWFwRGF0YSA9IHJlcXVpcmUoJy4vX2dldE1hcERhdGEnKTtcblxuLyoqXG4gKiBSZW1vdmVzIGBrZXlgIGFuZCBpdHMgdmFsdWUgZnJvbSB0aGUgbWFwLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBkZWxldGVcbiAqIEBtZW1iZXJPZiBNYXBDYWNoZVxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byByZW1vdmUuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGVudHJ5IHdhcyByZW1vdmVkLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIG1hcENhY2hlRGVsZXRlKGtleSkge1xuICB2YXIgcmVzdWx0ID0gZ2V0TWFwRGF0YSh0aGlzLCBrZXkpWydkZWxldGUnXShrZXkpO1xuICB0aGlzLnNpemUgLT0gcmVzdWx0ID8gMSA6IDA7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbWFwQ2FjaGVEZWxldGU7XG4iLCJ2YXIgZ2V0TWFwRGF0YSA9IHJlcXVpcmUoJy4vX2dldE1hcERhdGEnKTtcblxuLyoqXG4gKiBHZXRzIHRoZSBtYXAgdmFsdWUgZm9yIGBrZXlgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBnZXRcbiAqIEBtZW1iZXJPZiBNYXBDYWNoZVxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byBnZXQuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgZW50cnkgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIG1hcENhY2hlR2V0KGtleSkge1xuICByZXR1cm4gZ2V0TWFwRGF0YSh0aGlzLCBrZXkpLmdldChrZXkpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG1hcENhY2hlR2V0O1xuIiwidmFyIGdldE1hcERhdGEgPSByZXF1aXJlKCcuL19nZXRNYXBEYXRhJyk7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGEgbWFwIHZhbHVlIGZvciBga2V5YCBleGlzdHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGhhc1xuICogQG1lbWJlck9mIE1hcENhY2hlXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIGVudHJ5IHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGFuIGVudHJ5IGZvciBga2V5YCBleGlzdHMsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gbWFwQ2FjaGVIYXMoa2V5KSB7XG4gIHJldHVybiBnZXRNYXBEYXRhKHRoaXMsIGtleSkuaGFzKGtleSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbWFwQ2FjaGVIYXM7XG4iLCJ2YXIgZ2V0TWFwRGF0YSA9IHJlcXVpcmUoJy4vX2dldE1hcERhdGEnKTtcblxuLyoqXG4gKiBTZXRzIHRoZSBtYXAgYGtleWAgdG8gYHZhbHVlYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgc2V0XG4gKiBAbWVtYmVyT2YgTWFwQ2FjaGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gc2V0LlxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gc2V0LlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgbWFwIGNhY2hlIGluc3RhbmNlLlxuICovXG5mdW5jdGlvbiBtYXBDYWNoZVNldChrZXksIHZhbHVlKSB7XG4gIHZhciBkYXRhID0gZ2V0TWFwRGF0YSh0aGlzLCBrZXkpLFxuICAgICAgc2l6ZSA9IGRhdGEuc2l6ZTtcblxuICBkYXRhLnNldChrZXksIHZhbHVlKTtcbiAgdGhpcy5zaXplICs9IGRhdGEuc2l6ZSA9PSBzaXplID8gMCA6IDE7XG4gIHJldHVybiB0aGlzO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG1hcENhY2hlU2V0O1xuIiwidmFyIG1hcENhY2hlQ2xlYXIgPSByZXF1aXJlKCcuL19tYXBDYWNoZUNsZWFyJyksXG4gICAgbWFwQ2FjaGVEZWxldGUgPSByZXF1aXJlKCcuL19tYXBDYWNoZURlbGV0ZScpLFxuICAgIG1hcENhY2hlR2V0ID0gcmVxdWlyZSgnLi9fbWFwQ2FjaGVHZXQnKSxcbiAgICBtYXBDYWNoZUhhcyA9IHJlcXVpcmUoJy4vX21hcENhY2hlSGFzJyksXG4gICAgbWFwQ2FjaGVTZXQgPSByZXF1aXJlKCcuL19tYXBDYWNoZVNldCcpO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBtYXAgY2FjaGUgb2JqZWN0IHRvIHN0b3JlIGtleS12YWx1ZSBwYWlycy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge0FycmF5fSBbZW50cmllc10gVGhlIGtleS12YWx1ZSBwYWlycyB0byBjYWNoZS5cbiAqL1xuZnVuY3Rpb24gTWFwQ2FjaGUoZW50cmllcykge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IGVudHJpZXMgPT0gbnVsbCA/IDAgOiBlbnRyaWVzLmxlbmd0aDtcblxuICB0aGlzLmNsZWFyKCk7XG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgdmFyIGVudHJ5ID0gZW50cmllc1tpbmRleF07XG4gICAgdGhpcy5zZXQoZW50cnlbMF0sIGVudHJ5WzFdKTtcbiAgfVxufVxuXG4vLyBBZGQgbWV0aG9kcyB0byBgTWFwQ2FjaGVgLlxuTWFwQ2FjaGUucHJvdG90eXBlLmNsZWFyID0gbWFwQ2FjaGVDbGVhcjtcbk1hcENhY2hlLnByb3RvdHlwZVsnZGVsZXRlJ10gPSBtYXBDYWNoZURlbGV0ZTtcbk1hcENhY2hlLnByb3RvdHlwZS5nZXQgPSBtYXBDYWNoZUdldDtcbk1hcENhY2hlLnByb3RvdHlwZS5oYXMgPSBtYXBDYWNoZUhhcztcbk1hcENhY2hlLnByb3RvdHlwZS5zZXQgPSBtYXBDYWNoZVNldDtcblxubW9kdWxlLmV4cG9ydHMgPSBNYXBDYWNoZTtcbiIsInZhciBMaXN0Q2FjaGUgPSByZXF1aXJlKCcuL19MaXN0Q2FjaGUnKSxcbiAgICBNYXAgPSByZXF1aXJlKCcuL19NYXAnKSxcbiAgICBNYXBDYWNoZSA9IHJlcXVpcmUoJy4vX01hcENhY2hlJyk7XG5cbi8qKiBVc2VkIGFzIHRoZSBzaXplIHRvIGVuYWJsZSBsYXJnZSBhcnJheSBvcHRpbWl6YXRpb25zLiAqL1xudmFyIExBUkdFX0FSUkFZX1NJWkUgPSAyMDA7XG5cbi8qKlxuICogU2V0cyB0aGUgc3RhY2sgYGtleWAgdG8gYHZhbHVlYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgc2V0XG4gKiBAbWVtYmVyT2YgU3RhY2tcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gc2V0LlxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gc2V0LlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgc3RhY2sgY2FjaGUgaW5zdGFuY2UuXG4gKi9cbmZ1bmN0aW9uIHN0YWNrU2V0KGtleSwgdmFsdWUpIHtcbiAgdmFyIGRhdGEgPSB0aGlzLl9fZGF0YV9fO1xuICBpZiAoZGF0YSBpbnN0YW5jZW9mIExpc3RDYWNoZSkge1xuICAgIHZhciBwYWlycyA9IGRhdGEuX19kYXRhX187XG4gICAgaWYgKCFNYXAgfHwgKHBhaXJzLmxlbmd0aCA8IExBUkdFX0FSUkFZX1NJWkUgLSAxKSkge1xuICAgICAgcGFpcnMucHVzaChba2V5LCB2YWx1ZV0pO1xuICAgICAgdGhpcy5zaXplID0gKytkYXRhLnNpemU7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgZGF0YSA9IHRoaXMuX19kYXRhX18gPSBuZXcgTWFwQ2FjaGUocGFpcnMpO1xuICB9XG4gIGRhdGEuc2V0KGtleSwgdmFsdWUpO1xuICB0aGlzLnNpemUgPSBkYXRhLnNpemU7XG4gIHJldHVybiB0aGlzO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHN0YWNrU2V0O1xuIiwidmFyIExpc3RDYWNoZSA9IHJlcXVpcmUoJy4vX0xpc3RDYWNoZScpLFxuICAgIHN0YWNrQ2xlYXIgPSByZXF1aXJlKCcuL19zdGFja0NsZWFyJyksXG4gICAgc3RhY2tEZWxldGUgPSByZXF1aXJlKCcuL19zdGFja0RlbGV0ZScpLFxuICAgIHN0YWNrR2V0ID0gcmVxdWlyZSgnLi9fc3RhY2tHZXQnKSxcbiAgICBzdGFja0hhcyA9IHJlcXVpcmUoJy4vX3N0YWNrSGFzJyksXG4gICAgc3RhY2tTZXQgPSByZXF1aXJlKCcuL19zdGFja1NldCcpO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBzdGFjayBjYWNoZSBvYmplY3QgdG8gc3RvcmUga2V5LXZhbHVlIHBhaXJzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7QXJyYXl9IFtlbnRyaWVzXSBUaGUga2V5LXZhbHVlIHBhaXJzIHRvIGNhY2hlLlxuICovXG5mdW5jdGlvbiBTdGFjayhlbnRyaWVzKSB7XG4gIHZhciBkYXRhID0gdGhpcy5fX2RhdGFfXyA9IG5ldyBMaXN0Q2FjaGUoZW50cmllcyk7XG4gIHRoaXMuc2l6ZSA9IGRhdGEuc2l6ZTtcbn1cblxuLy8gQWRkIG1ldGhvZHMgdG8gYFN0YWNrYC5cblN0YWNrLnByb3RvdHlwZS5jbGVhciA9IHN0YWNrQ2xlYXI7XG5TdGFjay5wcm90b3R5cGVbJ2RlbGV0ZSddID0gc3RhY2tEZWxldGU7XG5TdGFjay5wcm90b3R5cGUuZ2V0ID0gc3RhY2tHZXQ7XG5TdGFjay5wcm90b3R5cGUuaGFzID0gc3RhY2tIYXM7XG5TdGFjay5wcm90b3R5cGUuc2V0ID0gc3RhY2tTZXQ7XG5cbm1vZHVsZS5leHBvcnRzID0gU3RhY2s7XG4iLCJ2YXIgZ2V0TmF0aXZlID0gcmVxdWlyZSgnLi9fZ2V0TmF0aXZlJyk7XG5cbnZhciBkZWZpbmVQcm9wZXJ0eSA9IChmdW5jdGlvbigpIHtcbiAgdHJ5IHtcbiAgICB2YXIgZnVuYyA9IGdldE5hdGl2ZShPYmplY3QsICdkZWZpbmVQcm9wZXJ0eScpO1xuICAgIGZ1bmMoe30sICcnLCB7fSk7XG4gICAgcmV0dXJuIGZ1bmM7XG4gIH0gY2F0Y2ggKGUpIHt9XG59KCkpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRlZmluZVByb3BlcnR5O1xuIiwidmFyIGRlZmluZVByb3BlcnR5ID0gcmVxdWlyZSgnLi9fZGVmaW5lUHJvcGVydHknKTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgYXNzaWduVmFsdWVgIGFuZCBgYXNzaWduTWVyZ2VWYWx1ZWAgd2l0aG91dFxuICogdmFsdWUgY2hlY2tzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gbW9kaWZ5LlxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBwcm9wZXJ0eSB0byBhc3NpZ24uXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBhc3NpZ24uXG4gKi9cbmZ1bmN0aW9uIGJhc2VBc3NpZ25WYWx1ZShvYmplY3QsIGtleSwgdmFsdWUpIHtcbiAgaWYgKGtleSA9PSAnX19wcm90b19fJyAmJiBkZWZpbmVQcm9wZXJ0eSkge1xuICAgIGRlZmluZVByb3BlcnR5KG9iamVjdCwga2V5LCB7XG4gICAgICAnY29uZmlndXJhYmxlJzogdHJ1ZSxcbiAgICAgICdlbnVtZXJhYmxlJzogdHJ1ZSxcbiAgICAgICd2YWx1ZSc6IHZhbHVlLFxuICAgICAgJ3dyaXRhYmxlJzogdHJ1ZVxuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIG9iamVjdFtrZXldID0gdmFsdWU7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlQXNzaWduVmFsdWU7XG4iLCJ2YXIgYmFzZUFzc2lnblZhbHVlID0gcmVxdWlyZSgnLi9fYmFzZUFzc2lnblZhbHVlJyksXG4gICAgZXEgPSByZXF1aXJlKCcuL2VxJyk7XG5cbi8qKlxuICogVGhpcyBmdW5jdGlvbiBpcyBsaWtlIGBhc3NpZ25WYWx1ZWAgZXhjZXB0IHRoYXQgaXQgZG9lc24ndCBhc3NpZ25cbiAqIGB1bmRlZmluZWRgIHZhbHVlcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIG1vZGlmeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgcHJvcGVydHkgdG8gYXNzaWduLlxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gYXNzaWduLlxuICovXG5mdW5jdGlvbiBhc3NpZ25NZXJnZVZhbHVlKG9iamVjdCwga2V5LCB2YWx1ZSkge1xuICBpZiAoKHZhbHVlICE9PSB1bmRlZmluZWQgJiYgIWVxKG9iamVjdFtrZXldLCB2YWx1ZSkpIHx8XG4gICAgICAodmFsdWUgPT09IHVuZGVmaW5lZCAmJiAhKGtleSBpbiBvYmplY3QpKSkge1xuICAgIGJhc2VBc3NpZ25WYWx1ZShvYmplY3QsIGtleSwgdmFsdWUpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYXNzaWduTWVyZ2VWYWx1ZTtcbiIsIi8qKlxuICogQ3JlYXRlcyBhIGJhc2UgZnVuY3Rpb24gZm9yIG1ldGhvZHMgbGlrZSBgXy5mb3JJbmAgYW5kIGBfLmZvck93bmAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2Zyb21SaWdodF0gU3BlY2lmeSBpdGVyYXRpbmcgZnJvbSByaWdodCB0byBsZWZ0LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgYmFzZSBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlQmFzZUZvcihmcm9tUmlnaHQpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKG9iamVjdCwgaXRlcmF0ZWUsIGtleXNGdW5jKSB7XG4gICAgdmFyIGluZGV4ID0gLTEsXG4gICAgICAgIGl0ZXJhYmxlID0gT2JqZWN0KG9iamVjdCksXG4gICAgICAgIHByb3BzID0ga2V5c0Z1bmMob2JqZWN0KSxcbiAgICAgICAgbGVuZ3RoID0gcHJvcHMubGVuZ3RoO1xuXG4gICAgd2hpbGUgKGxlbmd0aC0tKSB7XG4gICAgICB2YXIga2V5ID0gcHJvcHNbZnJvbVJpZ2h0ID8gbGVuZ3RoIDogKytpbmRleF07XG4gICAgICBpZiAoaXRlcmF0ZWUoaXRlcmFibGVba2V5XSwga2V5LCBpdGVyYWJsZSkgPT09IGZhbHNlKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb2JqZWN0O1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZUJhc2VGb3I7XG4iLCJ2YXIgY3JlYXRlQmFzZUZvciA9IHJlcXVpcmUoJy4vX2NyZWF0ZUJhc2VGb3InKTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgYmFzZUZvck93bmAgd2hpY2ggaXRlcmF0ZXMgb3ZlciBgb2JqZWN0YFxuICogcHJvcGVydGllcyByZXR1cm5lZCBieSBga2V5c0Z1bmNgIGFuZCBpbnZva2VzIGBpdGVyYXRlZWAgZm9yIGVhY2ggcHJvcGVydHkuXG4gKiBJdGVyYXRlZSBmdW5jdGlvbnMgbWF5IGV4aXQgaXRlcmF0aW9uIGVhcmx5IGJ5IGV4cGxpY2l0bHkgcmV0dXJuaW5nIGBmYWxzZWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBpdGVyYXRlIG92ZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRlZSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHBhcmFtIHtGdW5jdGlvbn0ga2V5c0Z1bmMgVGhlIGZ1bmN0aW9uIHRvIGdldCB0aGUga2V5cyBvZiBgb2JqZWN0YC5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgYG9iamVjdGAuXG4gKi9cbnZhciBiYXNlRm9yID0gY3JlYXRlQmFzZUZvcigpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VGb3I7XG4iLCJ2YXIgcm9vdCA9IHJlcXVpcmUoJy4vX3Jvb3QnKTtcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBleHBvcnRzYC4gKi9cbnZhciBmcmVlRXhwb3J0cyA9IHR5cGVvZiBleHBvcnRzID09ICdvYmplY3QnICYmIGV4cG9ydHMgJiYgIWV4cG9ydHMubm9kZVR5cGUgJiYgZXhwb3J0cztcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBtb2R1bGVgLiAqL1xudmFyIGZyZWVNb2R1bGUgPSBmcmVlRXhwb3J0cyAmJiB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZSAmJiAhbW9kdWxlLm5vZGVUeXBlICYmIG1vZHVsZTtcblxuLyoqIERldGVjdCB0aGUgcG9wdWxhciBDb21tb25KUyBleHRlbnNpb24gYG1vZHVsZS5leHBvcnRzYC4gKi9cbnZhciBtb2R1bGVFeHBvcnRzID0gZnJlZU1vZHVsZSAmJiBmcmVlTW9kdWxlLmV4cG9ydHMgPT09IGZyZWVFeHBvcnRzO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBCdWZmZXIgPSBtb2R1bGVFeHBvcnRzID8gcm9vdC5CdWZmZXIgOiB1bmRlZmluZWQsXG4gICAgYWxsb2NVbnNhZmUgPSBCdWZmZXIgPyBCdWZmZXIuYWxsb2NVbnNhZmUgOiB1bmRlZmluZWQ7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGNsb25lIG9mICBgYnVmZmVyYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtCdWZmZXJ9IGJ1ZmZlciBUaGUgYnVmZmVyIHRvIGNsb25lLlxuICogQHBhcmFtIHtib29sZWFufSBbaXNEZWVwXSBTcGVjaWZ5IGEgZGVlcCBjbG9uZS5cbiAqIEByZXR1cm5zIHtCdWZmZXJ9IFJldHVybnMgdGhlIGNsb25lZCBidWZmZXIuXG4gKi9cbmZ1bmN0aW9uIGNsb25lQnVmZmVyKGJ1ZmZlciwgaXNEZWVwKSB7XG4gIGlmIChpc0RlZXApIHtcbiAgICByZXR1cm4gYnVmZmVyLnNsaWNlKCk7XG4gIH1cbiAgdmFyIGxlbmd0aCA9IGJ1ZmZlci5sZW5ndGgsXG4gICAgICByZXN1bHQgPSBhbGxvY1Vuc2FmZSA/IGFsbG9jVW5zYWZlKGxlbmd0aCkgOiBuZXcgYnVmZmVyLmNvbnN0cnVjdG9yKGxlbmd0aCk7XG5cbiAgYnVmZmVyLmNvcHkocmVzdWx0KTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjbG9uZUJ1ZmZlcjtcbiIsInZhciByb290ID0gcmVxdWlyZSgnLi9fcm9vdCcpO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBVaW50OEFycmF5ID0gcm9vdC5VaW50OEFycmF5O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFVpbnQ4QXJyYXk7XG4iLCJ2YXIgVWludDhBcnJheSA9IHJlcXVpcmUoJy4vX1VpbnQ4QXJyYXknKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgY2xvbmUgb2YgYGFycmF5QnVmZmVyYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheUJ1ZmZlcn0gYXJyYXlCdWZmZXIgVGhlIGFycmF5IGJ1ZmZlciB0byBjbG9uZS5cbiAqIEByZXR1cm5zIHtBcnJheUJ1ZmZlcn0gUmV0dXJucyB0aGUgY2xvbmVkIGFycmF5IGJ1ZmZlci5cbiAqL1xuZnVuY3Rpb24gY2xvbmVBcnJheUJ1ZmZlcihhcnJheUJ1ZmZlcikge1xuICB2YXIgcmVzdWx0ID0gbmV3IGFycmF5QnVmZmVyLmNvbnN0cnVjdG9yKGFycmF5QnVmZmVyLmJ5dGVMZW5ndGgpO1xuICBuZXcgVWludDhBcnJheShyZXN1bHQpLnNldChuZXcgVWludDhBcnJheShhcnJheUJ1ZmZlcikpO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsb25lQXJyYXlCdWZmZXI7XG4iLCJ2YXIgY2xvbmVBcnJheUJ1ZmZlciA9IHJlcXVpcmUoJy4vX2Nsb25lQXJyYXlCdWZmZXInKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgY2xvbmUgb2YgYHR5cGVkQXJyYXlgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gdHlwZWRBcnJheSBUaGUgdHlwZWQgYXJyYXkgdG8gY2xvbmUuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtpc0RlZXBdIFNwZWNpZnkgYSBkZWVwIGNsb25lLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgY2xvbmVkIHR5cGVkIGFycmF5LlxuICovXG5mdW5jdGlvbiBjbG9uZVR5cGVkQXJyYXkodHlwZWRBcnJheSwgaXNEZWVwKSB7XG4gIHZhciBidWZmZXIgPSBpc0RlZXAgPyBjbG9uZUFycmF5QnVmZmVyKHR5cGVkQXJyYXkuYnVmZmVyKSA6IHR5cGVkQXJyYXkuYnVmZmVyO1xuICByZXR1cm4gbmV3IHR5cGVkQXJyYXkuY29uc3RydWN0b3IoYnVmZmVyLCB0eXBlZEFycmF5LmJ5dGVPZmZzZXQsIHR5cGVkQXJyYXkubGVuZ3RoKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjbG9uZVR5cGVkQXJyYXk7XG4iLCIvKipcbiAqIENvcGllcyB0aGUgdmFsdWVzIG9mIGBzb3VyY2VgIHRvIGBhcnJheWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl9IHNvdXJjZSBUaGUgYXJyYXkgdG8gY29weSB2YWx1ZXMgZnJvbS5cbiAqIEBwYXJhbSB7QXJyYXl9IFthcnJheT1bXV0gVGhlIGFycmF5IHRvIGNvcHkgdmFsdWVzIHRvLlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIGBhcnJheWAuXG4gKi9cbmZ1bmN0aW9uIGNvcHlBcnJheShzb3VyY2UsIGFycmF5KSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gc291cmNlLmxlbmd0aDtcblxuICBhcnJheSB8fCAoYXJyYXkgPSBBcnJheShsZW5ndGgpKTtcbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICBhcnJheVtpbmRleF0gPSBzb3VyY2VbaW5kZXhdO1xuICB9XG4gIHJldHVybiBhcnJheTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjb3B5QXJyYXk7XG4iLCJ2YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuL2lzT2JqZWN0Jyk7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdENyZWF0ZSA9IE9iamVjdC5jcmVhdGU7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uY3JlYXRlYCB3aXRob3V0IHN1cHBvcnQgZm9yIGFzc2lnbmluZ1xuICogcHJvcGVydGllcyB0byB0aGUgY3JlYXRlZCBvYmplY3QuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBwcm90byBUaGUgb2JqZWN0IHRvIGluaGVyaXQgZnJvbS5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIG5ldyBvYmplY3QuXG4gKi9cbnZhciBiYXNlQ3JlYXRlID0gKGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBvYmplY3QoKSB7fVxuICByZXR1cm4gZnVuY3Rpb24ocHJvdG8pIHtcbiAgICBpZiAoIWlzT2JqZWN0KHByb3RvKSkge1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cbiAgICBpZiAob2JqZWN0Q3JlYXRlKSB7XG4gICAgICByZXR1cm4gb2JqZWN0Q3JlYXRlKHByb3RvKTtcbiAgICB9XG4gICAgb2JqZWN0LnByb3RvdHlwZSA9IHByb3RvO1xuICAgIHZhciByZXN1bHQgPSBuZXcgb2JqZWN0O1xuICAgIG9iamVjdC5wcm90b3R5cGUgPSB1bmRlZmluZWQ7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcbn0oKSk7XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUNyZWF0ZTtcbiIsIi8qKlxuICogQ3JlYXRlcyBhIHVuYXJ5IGZ1bmN0aW9uIHRoYXQgaW52b2tlcyBgZnVuY2Agd2l0aCBpdHMgYXJndW1lbnQgdHJhbnNmb3JtZWQuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIHdyYXAuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSB0cmFuc2Zvcm0gVGhlIGFyZ3VtZW50IHRyYW5zZm9ybS5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBvdmVyQXJnKGZ1bmMsIHRyYW5zZm9ybSkge1xuICByZXR1cm4gZnVuY3Rpb24oYXJnKSB7XG4gICAgcmV0dXJuIGZ1bmModHJhbnNmb3JtKGFyZykpO1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG92ZXJBcmc7XG4iLCJ2YXIgb3ZlckFyZyA9IHJlcXVpcmUoJy4vX292ZXJBcmcnKTtcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgZ2V0UHJvdG90eXBlID0gb3ZlckFyZyhPYmplY3QuZ2V0UHJvdG90eXBlT2YsIE9iamVjdCk7XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0UHJvdG90eXBlO1xuIiwiLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBsaWtlbHkgYSBwcm90b3R5cGUgb2JqZWN0LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgcHJvdG90eXBlLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGlzUHJvdG90eXBlKHZhbHVlKSB7XG4gIHZhciBDdG9yID0gdmFsdWUgJiYgdmFsdWUuY29uc3RydWN0b3IsXG4gICAgICBwcm90byA9ICh0eXBlb2YgQ3RvciA9PSAnZnVuY3Rpb24nICYmIEN0b3IucHJvdG90eXBlKSB8fCBvYmplY3RQcm90bztcblxuICByZXR1cm4gdmFsdWUgPT09IHByb3RvO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzUHJvdG90eXBlO1xuIiwidmFyIGJhc2VDcmVhdGUgPSByZXF1aXJlKCcuL19iYXNlQ3JlYXRlJyksXG4gICAgZ2V0UHJvdG90eXBlID0gcmVxdWlyZSgnLi9fZ2V0UHJvdG90eXBlJyksXG4gICAgaXNQcm90b3R5cGUgPSByZXF1aXJlKCcuL19pc1Byb3RvdHlwZScpO1xuXG4vKipcbiAqIEluaXRpYWxpemVzIGFuIG9iamVjdCBjbG9uZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIGNsb25lLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgaW5pdGlhbGl6ZWQgY2xvbmUuXG4gKi9cbmZ1bmN0aW9uIGluaXRDbG9uZU9iamVjdChvYmplY3QpIHtcbiAgcmV0dXJuICh0eXBlb2Ygb2JqZWN0LmNvbnN0cnVjdG9yID09ICdmdW5jdGlvbicgJiYgIWlzUHJvdG90eXBlKG9iamVjdCkpXG4gICAgPyBiYXNlQ3JlYXRlKGdldFByb3RvdHlwZShvYmplY3QpKVxuICAgIDoge307XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaW5pdENsb25lT2JqZWN0O1xuIiwiLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZS4gQSB2YWx1ZSBpcyBvYmplY3QtbGlrZSBpZiBpdCdzIG5vdCBgbnVsbGBcbiAqIGFuZCBoYXMgYSBgdHlwZW9mYCByZXN1bHQgb2YgXCJvYmplY3RcIi5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZSwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZSh7fSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdExpa2UoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShfLm5vb3ApO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShudWxsKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0TGlrZSh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgIT0gbnVsbCAmJiB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCc7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNPYmplY3RMaWtlO1xuIiwidmFyIGJhc2VHZXRUYWcgPSByZXF1aXJlKCcuL19iYXNlR2V0VGFnJyksXG4gICAgaXNPYmplY3RMaWtlID0gcmVxdWlyZSgnLi9pc09iamVjdExpa2UnKTtcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIGFyZ3NUYWcgPSAnW29iamVjdCBBcmd1bWVudHNdJztcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5pc0FyZ3VtZW50c2AuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYW4gYGFyZ3VtZW50c2Agb2JqZWN0LFxuICovXG5mdW5jdGlvbiBiYXNlSXNBcmd1bWVudHModmFsdWUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0TGlrZSh2YWx1ZSkgJiYgYmFzZUdldFRhZyh2YWx1ZSkgPT0gYXJnc1RhZztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlSXNBcmd1bWVudHM7XG4iLCJ2YXIgYmFzZUlzQXJndW1lbnRzID0gcmVxdWlyZSgnLi9fYmFzZUlzQXJndW1lbnRzJyksXG4gICAgaXNPYmplY3RMaWtlID0gcmVxdWlyZSgnLi9pc09iamVjdExpa2UnKTtcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgcHJvcGVydHlJc0VudW1lcmFibGUgPSBvYmplY3RQcm90by5wcm9wZXJ0eUlzRW51bWVyYWJsZTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBsaWtlbHkgYW4gYGFyZ3VtZW50c2Agb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFuIGBhcmd1bWVudHNgIG9iamVjdCxcbiAqICBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNBcmd1bWVudHMoZnVuY3Rpb24oKSB7IHJldHVybiBhcmd1bWVudHM7IH0oKSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0FyZ3VtZW50cyhbMSwgMiwgM10pO1xuICogLy8gPT4gZmFsc2VcbiAqL1xudmFyIGlzQXJndW1lbnRzID0gYmFzZUlzQXJndW1lbnRzKGZ1bmN0aW9uKCkgeyByZXR1cm4gYXJndW1lbnRzOyB9KCkpID8gYmFzZUlzQXJndW1lbnRzIDogZnVuY3Rpb24odmFsdWUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0TGlrZSh2YWx1ZSkgJiYgaGFzT3duUHJvcGVydHkuY2FsbCh2YWx1ZSwgJ2NhbGxlZScpICYmXG4gICAgIXByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwodmFsdWUsICdjYWxsZWUnKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gaXNBcmd1bWVudHM7XG4iLCIvKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYW4gYEFycmF5YCBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYW4gYXJyYXksIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0FycmF5KFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0FycmF5KGRvY3VtZW50LmJvZHkuY2hpbGRyZW4pO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzQXJyYXkoJ2FiYycpO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzQXJyYXkoXy5ub29wKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheTtcblxubW9kdWxlLmV4cG9ydHMgPSBpc0FycmF5O1xuIiwiLyoqIFVzZWQgYXMgcmVmZXJlbmNlcyBmb3IgdmFyaW91cyBgTnVtYmVyYCBjb25zdGFudHMuICovXG52YXIgTUFYX1NBRkVfSU5URUdFUiA9IDkwMDcxOTkyNTQ3NDA5OTE7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSB2YWxpZCBhcnJheS1saWtlIGxlbmd0aC5cbiAqXG4gKiAqKk5vdGU6KiogVGhpcyBtZXRob2QgaXMgbG9vc2VseSBiYXNlZCBvblxuICogW2BUb0xlbmd0aGBdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLXRvbGVuZ3RoKS5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHZhbGlkIGxlbmd0aCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzTGVuZ3RoKDMpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNMZW5ndGgoTnVtYmVyLk1JTl9WQUxVRSk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNMZW5ndGgoSW5maW5pdHkpO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzTGVuZ3RoKCczJyk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0xlbmd0aCh2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09ICdudW1iZXInICYmXG4gICAgdmFsdWUgPiAtMSAmJiB2YWx1ZSAlIDEgPT0gMCAmJiB2YWx1ZSA8PSBNQVhfU0FGRV9JTlRFR0VSO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzTGVuZ3RoO1xuIiwidmFyIGlzRnVuY3Rpb24gPSByZXF1aXJlKCcuL2lzRnVuY3Rpb24nKSxcbiAgICBpc0xlbmd0aCA9IHJlcXVpcmUoJy4vaXNMZW5ndGgnKTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhcnJheS1saWtlLiBBIHZhbHVlIGlzIGNvbnNpZGVyZWQgYXJyYXktbGlrZSBpZiBpdCdzXG4gKiBub3QgYSBmdW5jdGlvbiBhbmQgaGFzIGEgYHZhbHVlLmxlbmd0aGAgdGhhdCdzIGFuIGludGVnZXIgZ3JlYXRlciB0aGFuIG9yXG4gKiBlcXVhbCB0byBgMGAgYW5kIGxlc3MgdGhhbiBvciBlcXVhbCB0byBgTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVJgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFycmF5LWxpa2UsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0FycmF5TGlrZShbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcnJheUxpa2UoZG9jdW1lbnQuYm9keS5jaGlsZHJlbik7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0FycmF5TGlrZSgnYWJjJyk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0FycmF5TGlrZShfLm5vb3ApO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheUxpa2UodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlICE9IG51bGwgJiYgaXNMZW5ndGgodmFsdWUubGVuZ3RoKSAmJiAhaXNGdW5jdGlvbih2YWx1ZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNBcnJheUxpa2U7XG4iLCJ2YXIgaXNBcnJheUxpa2UgPSByZXF1aXJlKCcuL2lzQXJyYXlMaWtlJyksXG4gICAgaXNPYmplY3RMaWtlID0gcmVxdWlyZSgnLi9pc09iamVjdExpa2UnKTtcblxuLyoqXG4gKiBUaGlzIG1ldGhvZCBpcyBsaWtlIGBfLmlzQXJyYXlMaWtlYCBleGNlcHQgdGhhdCBpdCBhbHNvIGNoZWNrcyBpZiBgdmFsdWVgXG4gKiBpcyBhbiBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYW4gYXJyYXktbGlrZSBvYmplY3QsXG4gKiAgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzQXJyYXlMaWtlT2JqZWN0KFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0FycmF5TGlrZU9iamVjdChkb2N1bWVudC5ib2R5LmNoaWxkcmVuKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQXJyYXlMaWtlT2JqZWN0KCdhYmMnKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc0FycmF5TGlrZU9iamVjdChfLm5vb3ApO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheUxpa2VPYmplY3QodmFsdWUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0TGlrZSh2YWx1ZSkgJiYgaXNBcnJheUxpa2UodmFsdWUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzQXJyYXlMaWtlT2JqZWN0O1xuIiwiLyoqXG4gKiBUaGlzIG1ldGhvZCByZXR1cm5zIGBmYWxzZWAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjEzLjBcbiAqIEBjYXRlZ29yeSBVdGlsXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLnRpbWVzKDIsIF8uc3R1YkZhbHNlKTtcbiAqIC8vID0+IFtmYWxzZSwgZmFsc2VdXG4gKi9cbmZ1bmN0aW9uIHN0dWJGYWxzZSgpIHtcbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHN0dWJGYWxzZTtcbiIsInZhciByb290ID0gcmVxdWlyZSgnLi9fcm9vdCcpLFxuICAgIHN0dWJGYWxzZSA9IHJlcXVpcmUoJy4vc3R1YkZhbHNlJyk7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgZXhwb3J0c2AuICovXG52YXIgZnJlZUV4cG9ydHMgPSB0eXBlb2YgZXhwb3J0cyA9PSAnb2JqZWN0JyAmJiBleHBvcnRzICYmICFleHBvcnRzLm5vZGVUeXBlICYmIGV4cG9ydHM7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgbW9kdWxlYC4gKi9cbnZhciBmcmVlTW9kdWxlID0gZnJlZUV4cG9ydHMgJiYgdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUgJiYgIW1vZHVsZS5ub2RlVHlwZSAmJiBtb2R1bGU7XG5cbi8qKiBEZXRlY3QgdGhlIHBvcHVsYXIgQ29tbW9uSlMgZXh0ZW5zaW9uIGBtb2R1bGUuZXhwb3J0c2AuICovXG52YXIgbW9kdWxlRXhwb3J0cyA9IGZyZWVNb2R1bGUgJiYgZnJlZU1vZHVsZS5leHBvcnRzID09PSBmcmVlRXhwb3J0cztcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgQnVmZmVyID0gbW9kdWxlRXhwb3J0cyA/IHJvb3QuQnVmZmVyIDogdW5kZWZpbmVkO1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyBmb3IgdGhvc2Ugd2l0aCB0aGUgc2FtZSBuYW1lIGFzIG90aGVyIGBsb2Rhc2hgIG1ldGhvZHMuICovXG52YXIgbmF0aXZlSXNCdWZmZXIgPSBCdWZmZXIgPyBCdWZmZXIuaXNCdWZmZXIgOiB1bmRlZmluZWQ7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSBidWZmZXIuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjMuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBidWZmZXIsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0J1ZmZlcihuZXcgQnVmZmVyKDIpKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQnVmZmVyKG5ldyBVaW50OEFycmF5KDIpKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbnZhciBpc0J1ZmZlciA9IG5hdGl2ZUlzQnVmZmVyIHx8IHN0dWJGYWxzZTtcblxubW9kdWxlLmV4cG9ydHMgPSBpc0J1ZmZlcjtcbiIsInZhciBiYXNlR2V0VGFnID0gcmVxdWlyZSgnLi9fYmFzZUdldFRhZycpLFxuICAgIGdldFByb3RvdHlwZSA9IHJlcXVpcmUoJy4vX2dldFByb3RvdHlwZScpLFxuICAgIGlzT2JqZWN0TGlrZSA9IHJlcXVpcmUoJy4vaXNPYmplY3RMaWtlJyk7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RUYWcgPSAnW29iamVjdCBPYmplY3RdJztcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIGZ1bmNQcm90byA9IEZ1bmN0aW9uLnByb3RvdHlwZSxcbiAgICBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIHJlc29sdmUgdGhlIGRlY29tcGlsZWQgc291cmNlIG9mIGZ1bmN0aW9ucy4gKi9cbnZhciBmdW5jVG9TdHJpbmcgPSBmdW5jUHJvdG8udG9TdHJpbmc7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKiBVc2VkIHRvIGluZmVyIHRoZSBgT2JqZWN0YCBjb25zdHJ1Y3Rvci4gKi9cbnZhciBvYmplY3RDdG9yU3RyaW5nID0gZnVuY1RvU3RyaW5nLmNhbGwoT2JqZWN0KTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIHBsYWluIG9iamVjdCwgdGhhdCBpcywgYW4gb2JqZWN0IGNyZWF0ZWQgYnkgdGhlXG4gKiBgT2JqZWN0YCBjb25zdHJ1Y3RvciBvciBvbmUgd2l0aCBhIGBbW1Byb3RvdHlwZV1dYCBvZiBgbnVsbGAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjguMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBwbGFpbiBvYmplY3QsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogZnVuY3Rpb24gRm9vKCkge1xuICogICB0aGlzLmEgPSAxO1xuICogfVxuICpcbiAqIF8uaXNQbGFpbk9iamVjdChuZXcgRm9vKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc1BsYWluT2JqZWN0KFsxLCAyLCAzXSk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNQbGFpbk9iamVjdCh7ICd4JzogMCwgJ3knOiAwIH0pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNQbGFpbk9iamVjdChPYmplY3QuY3JlYXRlKG51bGwpKTtcbiAqIC8vID0+IHRydWVcbiAqL1xuZnVuY3Rpb24gaXNQbGFpbk9iamVjdCh2YWx1ZSkge1xuICBpZiAoIWlzT2JqZWN0TGlrZSh2YWx1ZSkgfHwgYmFzZUdldFRhZyh2YWx1ZSkgIT0gb2JqZWN0VGFnKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciBwcm90byA9IGdldFByb3RvdHlwZSh2YWx1ZSk7XG4gIGlmIChwcm90byA9PT0gbnVsbCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHZhciBDdG9yID0gaGFzT3duUHJvcGVydHkuY2FsbChwcm90bywgJ2NvbnN0cnVjdG9yJykgJiYgcHJvdG8uY29uc3RydWN0b3I7XG4gIHJldHVybiB0eXBlb2YgQ3RvciA9PSAnZnVuY3Rpb24nICYmIEN0b3IgaW5zdGFuY2VvZiBDdG9yICYmXG4gICAgZnVuY1RvU3RyaW5nLmNhbGwoQ3RvcikgPT0gb2JqZWN0Q3RvclN0cmluZztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc1BsYWluT2JqZWN0O1xuIiwidmFyIGJhc2VHZXRUYWcgPSByZXF1aXJlKCcuL19iYXNlR2V0VGFnJyksXG4gICAgaXNMZW5ndGggPSByZXF1aXJlKCcuL2lzTGVuZ3RoJyksXG4gICAgaXNPYmplY3RMaWtlID0gcmVxdWlyZSgnLi9pc09iamVjdExpa2UnKTtcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIGFyZ3NUYWcgPSAnW29iamVjdCBBcmd1bWVudHNdJyxcbiAgICBhcnJheVRhZyA9ICdbb2JqZWN0IEFycmF5XScsXG4gICAgYm9vbFRhZyA9ICdbb2JqZWN0IEJvb2xlYW5dJyxcbiAgICBkYXRlVGFnID0gJ1tvYmplY3QgRGF0ZV0nLFxuICAgIGVycm9yVGFnID0gJ1tvYmplY3QgRXJyb3JdJyxcbiAgICBmdW5jVGFnID0gJ1tvYmplY3QgRnVuY3Rpb25dJyxcbiAgICBtYXBUYWcgPSAnW29iamVjdCBNYXBdJyxcbiAgICBudW1iZXJUYWcgPSAnW29iamVjdCBOdW1iZXJdJyxcbiAgICBvYmplY3RUYWcgPSAnW29iamVjdCBPYmplY3RdJyxcbiAgICByZWdleHBUYWcgPSAnW29iamVjdCBSZWdFeHBdJyxcbiAgICBzZXRUYWcgPSAnW29iamVjdCBTZXRdJyxcbiAgICBzdHJpbmdUYWcgPSAnW29iamVjdCBTdHJpbmddJyxcbiAgICB3ZWFrTWFwVGFnID0gJ1tvYmplY3QgV2Vha01hcF0nO1xuXG52YXIgYXJyYXlCdWZmZXJUYWcgPSAnW29iamVjdCBBcnJheUJ1ZmZlcl0nLFxuICAgIGRhdGFWaWV3VGFnID0gJ1tvYmplY3QgRGF0YVZpZXddJyxcbiAgICBmbG9hdDMyVGFnID0gJ1tvYmplY3QgRmxvYXQzMkFycmF5XScsXG4gICAgZmxvYXQ2NFRhZyA9ICdbb2JqZWN0IEZsb2F0NjRBcnJheV0nLFxuICAgIGludDhUYWcgPSAnW29iamVjdCBJbnQ4QXJyYXldJyxcbiAgICBpbnQxNlRhZyA9ICdbb2JqZWN0IEludDE2QXJyYXldJyxcbiAgICBpbnQzMlRhZyA9ICdbb2JqZWN0IEludDMyQXJyYXldJyxcbiAgICB1aW50OFRhZyA9ICdbb2JqZWN0IFVpbnQ4QXJyYXldJyxcbiAgICB1aW50OENsYW1wZWRUYWcgPSAnW29iamVjdCBVaW50OENsYW1wZWRBcnJheV0nLFxuICAgIHVpbnQxNlRhZyA9ICdbb2JqZWN0IFVpbnQxNkFycmF5XScsXG4gICAgdWludDMyVGFnID0gJ1tvYmplY3QgVWludDMyQXJyYXldJztcblxuLyoqIFVzZWQgdG8gaWRlbnRpZnkgYHRvU3RyaW5nVGFnYCB2YWx1ZXMgb2YgdHlwZWQgYXJyYXlzLiAqL1xudmFyIHR5cGVkQXJyYXlUYWdzID0ge307XG50eXBlZEFycmF5VGFnc1tmbG9hdDMyVGFnXSA9IHR5cGVkQXJyYXlUYWdzW2Zsb2F0NjRUYWddID1cbnR5cGVkQXJyYXlUYWdzW2ludDhUYWddID0gdHlwZWRBcnJheVRhZ3NbaW50MTZUYWddID1cbnR5cGVkQXJyYXlUYWdzW2ludDMyVGFnXSA9IHR5cGVkQXJyYXlUYWdzW3VpbnQ4VGFnXSA9XG50eXBlZEFycmF5VGFnc1t1aW50OENsYW1wZWRUYWddID0gdHlwZWRBcnJheVRhZ3NbdWludDE2VGFnXSA9XG50eXBlZEFycmF5VGFnc1t1aW50MzJUYWddID0gdHJ1ZTtcbnR5cGVkQXJyYXlUYWdzW2FyZ3NUYWddID0gdHlwZWRBcnJheVRhZ3NbYXJyYXlUYWddID1cbnR5cGVkQXJyYXlUYWdzW2FycmF5QnVmZmVyVGFnXSA9IHR5cGVkQXJyYXlUYWdzW2Jvb2xUYWddID1cbnR5cGVkQXJyYXlUYWdzW2RhdGFWaWV3VGFnXSA9IHR5cGVkQXJyYXlUYWdzW2RhdGVUYWddID1cbnR5cGVkQXJyYXlUYWdzW2Vycm9yVGFnXSA9IHR5cGVkQXJyYXlUYWdzW2Z1bmNUYWddID1cbnR5cGVkQXJyYXlUYWdzW21hcFRhZ10gPSB0eXBlZEFycmF5VGFnc1tudW1iZXJUYWddID1cbnR5cGVkQXJyYXlUYWdzW29iamVjdFRhZ10gPSB0eXBlZEFycmF5VGFnc1tyZWdleHBUYWddID1cbnR5cGVkQXJyYXlUYWdzW3NldFRhZ10gPSB0eXBlZEFycmF5VGFnc1tzdHJpbmdUYWddID1cbnR5cGVkQXJyYXlUYWdzW3dlYWtNYXBUYWddID0gZmFsc2U7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uaXNUeXBlZEFycmF5YCB3aXRob3V0IE5vZGUuanMgb3B0aW1pemF0aW9ucy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHR5cGVkIGFycmF5LCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGJhc2VJc1R5cGVkQXJyYXkodmFsdWUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0TGlrZSh2YWx1ZSkgJiZcbiAgICBpc0xlbmd0aCh2YWx1ZS5sZW5ndGgpICYmICEhdHlwZWRBcnJheVRhZ3NbYmFzZUdldFRhZyh2YWx1ZSldO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VJc1R5cGVkQXJyYXk7XG4iLCIvKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLnVuYXJ5YCB3aXRob3V0IHN1cHBvcnQgZm9yIHN0b3JpbmcgbWV0YWRhdGEuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGNhcCBhcmd1bWVudHMgZm9yLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgY2FwcGVkIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBiYXNlVW5hcnkoZnVuYykge1xuICByZXR1cm4gZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gZnVuYyh2YWx1ZSk7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZVVuYXJ5O1xuIiwidmFyIGZyZWVHbG9iYWwgPSByZXF1aXJlKCcuL19mcmVlR2xvYmFsJyk7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgZXhwb3J0c2AuICovXG52YXIgZnJlZUV4cG9ydHMgPSB0eXBlb2YgZXhwb3J0cyA9PSAnb2JqZWN0JyAmJiBleHBvcnRzICYmICFleHBvcnRzLm5vZGVUeXBlICYmIGV4cG9ydHM7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgbW9kdWxlYC4gKi9cbnZhciBmcmVlTW9kdWxlID0gZnJlZUV4cG9ydHMgJiYgdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUgJiYgIW1vZHVsZS5ub2RlVHlwZSAmJiBtb2R1bGU7XG5cbi8qKiBEZXRlY3QgdGhlIHBvcHVsYXIgQ29tbW9uSlMgZXh0ZW5zaW9uIGBtb2R1bGUuZXhwb3J0c2AuICovXG52YXIgbW9kdWxlRXhwb3J0cyA9IGZyZWVNb2R1bGUgJiYgZnJlZU1vZHVsZS5leHBvcnRzID09PSBmcmVlRXhwb3J0cztcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBwcm9jZXNzYCBmcm9tIE5vZGUuanMuICovXG52YXIgZnJlZVByb2Nlc3MgPSBtb2R1bGVFeHBvcnRzICYmIGZyZWVHbG9iYWwucHJvY2VzcztcblxuLyoqIFVzZWQgdG8gYWNjZXNzIGZhc3RlciBOb2RlLmpzIGhlbHBlcnMuICovXG52YXIgbm9kZVV0aWwgPSAoZnVuY3Rpb24oKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGZyZWVQcm9jZXNzICYmIGZyZWVQcm9jZXNzLmJpbmRpbmcgJiYgZnJlZVByb2Nlc3MuYmluZGluZygndXRpbCcpO1xuICB9IGNhdGNoIChlKSB7fVxufSgpKTtcblxubW9kdWxlLmV4cG9ydHMgPSBub2RlVXRpbDtcbiIsInZhciBiYXNlSXNUeXBlZEFycmF5ID0gcmVxdWlyZSgnLi9fYmFzZUlzVHlwZWRBcnJheScpLFxuICAgIGJhc2VVbmFyeSA9IHJlcXVpcmUoJy4vX2Jhc2VVbmFyeScpLFxuICAgIG5vZGVVdGlsID0gcmVxdWlyZSgnLi9fbm9kZVV0aWwnKTtcblxuLyogTm9kZS5qcyBoZWxwZXIgcmVmZXJlbmNlcy4gKi9cbnZhciBub2RlSXNUeXBlZEFycmF5ID0gbm9kZVV0aWwgJiYgbm9kZVV0aWwuaXNUeXBlZEFycmF5O1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYSB0eXBlZCBhcnJheS5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDMuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHR5cGVkIGFycmF5LCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNUeXBlZEFycmF5KG5ldyBVaW50OEFycmF5KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzVHlwZWRBcnJheShbXSk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG52YXIgaXNUeXBlZEFycmF5ID0gbm9kZUlzVHlwZWRBcnJheSA/IGJhc2VVbmFyeShub2RlSXNUeXBlZEFycmF5KSA6IGJhc2VJc1R5cGVkQXJyYXk7XG5cbm1vZHVsZS5leHBvcnRzID0gaXNUeXBlZEFycmF5O1xuIiwidmFyIGJhc2VBc3NpZ25WYWx1ZSA9IHJlcXVpcmUoJy4vX2Jhc2VBc3NpZ25WYWx1ZScpLFxuICAgIGVxID0gcmVxdWlyZSgnLi9lcScpO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIEFzc2lnbnMgYHZhbHVlYCB0byBga2V5YCBvZiBgb2JqZWN0YCBpZiB0aGUgZXhpc3RpbmcgdmFsdWUgaXMgbm90IGVxdWl2YWxlbnRcbiAqIHVzaW5nIFtgU2FtZVZhbHVlWmVyb2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLXNhbWV2YWx1ZXplcm8pXG4gKiBmb3IgZXF1YWxpdHkgY29tcGFyaXNvbnMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBtb2RpZnkuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHByb3BlcnR5IHRvIGFzc2lnbi5cbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGFzc2lnbi5cbiAqL1xuZnVuY3Rpb24gYXNzaWduVmFsdWUob2JqZWN0LCBrZXksIHZhbHVlKSB7XG4gIHZhciBvYmpWYWx1ZSA9IG9iamVjdFtrZXldO1xuICBpZiAoIShoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwga2V5KSAmJiBlcShvYmpWYWx1ZSwgdmFsdWUpKSB8fFxuICAgICAgKHZhbHVlID09PSB1bmRlZmluZWQgJiYgIShrZXkgaW4gb2JqZWN0KSkpIHtcbiAgICBiYXNlQXNzaWduVmFsdWUob2JqZWN0LCBrZXksIHZhbHVlKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFzc2lnblZhbHVlO1xuIiwidmFyIGFzc2lnblZhbHVlID0gcmVxdWlyZSgnLi9fYXNzaWduVmFsdWUnKSxcbiAgICBiYXNlQXNzaWduVmFsdWUgPSByZXF1aXJlKCcuL19iYXNlQXNzaWduVmFsdWUnKTtcblxuLyoqXG4gKiBDb3BpZXMgcHJvcGVydGllcyBvZiBgc291cmNlYCB0byBgb2JqZWN0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IHNvdXJjZSBUaGUgb2JqZWN0IHRvIGNvcHkgcHJvcGVydGllcyBmcm9tLlxuICogQHBhcmFtIHtBcnJheX0gcHJvcHMgVGhlIHByb3BlcnR5IGlkZW50aWZpZXJzIHRvIGNvcHkuXG4gKiBAcGFyYW0ge09iamVjdH0gW29iamVjdD17fV0gVGhlIG9iamVjdCB0byBjb3B5IHByb3BlcnRpZXMgdG8uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY3VzdG9taXplcl0gVGhlIGZ1bmN0aW9uIHRvIGN1c3RvbWl6ZSBjb3BpZWQgdmFsdWVzLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBgb2JqZWN0YC5cbiAqL1xuZnVuY3Rpb24gY29weU9iamVjdChzb3VyY2UsIHByb3BzLCBvYmplY3QsIGN1c3RvbWl6ZXIpIHtcbiAgdmFyIGlzTmV3ID0gIW9iamVjdDtcbiAgb2JqZWN0IHx8IChvYmplY3QgPSB7fSk7XG5cbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBwcm9wcy5sZW5ndGg7XG5cbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICB2YXIga2V5ID0gcHJvcHNbaW5kZXhdO1xuXG4gICAgdmFyIG5ld1ZhbHVlID0gY3VzdG9taXplclxuICAgICAgPyBjdXN0b21pemVyKG9iamVjdFtrZXldLCBzb3VyY2Vba2V5XSwga2V5LCBvYmplY3QsIHNvdXJjZSlcbiAgICAgIDogdW5kZWZpbmVkO1xuXG4gICAgaWYgKG5ld1ZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIG5ld1ZhbHVlID0gc291cmNlW2tleV07XG4gICAgfVxuICAgIGlmIChpc05ldykge1xuICAgICAgYmFzZUFzc2lnblZhbHVlKG9iamVjdCwga2V5LCBuZXdWYWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFzc2lnblZhbHVlKG9iamVjdCwga2V5LCBuZXdWYWx1ZSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBvYmplY3Q7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY29weU9iamVjdDtcbiIsIi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8udGltZXNgIHdpdGhvdXQgc3VwcG9ydCBmb3IgaXRlcmF0ZWUgc2hvcnRoYW5kc1xuICogb3IgbWF4IGFycmF5IGxlbmd0aCBjaGVja3MuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7bnVtYmVyfSBuIFRoZSBudW1iZXIgb2YgdGltZXMgdG8gaW52b2tlIGBpdGVyYXRlZWAuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRlZSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiByZXN1bHRzLlxuICovXG5mdW5jdGlvbiBiYXNlVGltZXMobiwgaXRlcmF0ZWUpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICByZXN1bHQgPSBBcnJheShuKTtcblxuICB3aGlsZSAoKytpbmRleCA8IG4pIHtcbiAgICByZXN1bHRbaW5kZXhdID0gaXRlcmF0ZWUoaW5kZXgpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZVRpbWVzO1xuIiwiLyoqIFVzZWQgYXMgcmVmZXJlbmNlcyBmb3IgdmFyaW91cyBgTnVtYmVyYCBjb25zdGFudHMuICovXG52YXIgTUFYX1NBRkVfSU5URUdFUiA9IDkwMDcxOTkyNTQ3NDA5OTE7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCB1bnNpZ25lZCBpbnRlZ2VyIHZhbHVlcy4gKi9cbnZhciByZUlzVWludCA9IC9eKD86MHxbMS05XVxcZCopJC87XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSB2YWxpZCBhcnJheS1saWtlIGluZGV4LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbbGVuZ3RoPU1BWF9TQUZFX0lOVEVHRVJdIFRoZSB1cHBlciBib3VuZHMgb2YgYSB2YWxpZCBpbmRleC5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgdmFsaWQgaW5kZXgsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaXNJbmRleCh2YWx1ZSwgbGVuZ3RoKSB7XG4gIGxlbmd0aCA9IGxlbmd0aCA9PSBudWxsID8gTUFYX1NBRkVfSU5URUdFUiA6IGxlbmd0aDtcbiAgcmV0dXJuICEhbGVuZ3RoICYmXG4gICAgKHR5cGVvZiB2YWx1ZSA9PSAnbnVtYmVyJyB8fCByZUlzVWludC50ZXN0KHZhbHVlKSkgJiZcbiAgICAodmFsdWUgPiAtMSAmJiB2YWx1ZSAlIDEgPT0gMCAmJiB2YWx1ZSA8IGxlbmd0aCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNJbmRleDtcbiIsInZhciBiYXNlVGltZXMgPSByZXF1aXJlKCcuL19iYXNlVGltZXMnKSxcbiAgICBpc0FyZ3VtZW50cyA9IHJlcXVpcmUoJy4vaXNBcmd1bWVudHMnKSxcbiAgICBpc0FycmF5ID0gcmVxdWlyZSgnLi9pc0FycmF5JyksXG4gICAgaXNCdWZmZXIgPSByZXF1aXJlKCcuL2lzQnVmZmVyJyksXG4gICAgaXNJbmRleCA9IHJlcXVpcmUoJy4vX2lzSW5kZXgnKSxcbiAgICBpc1R5cGVkQXJyYXkgPSByZXF1aXJlKCcuL2lzVHlwZWRBcnJheScpO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gYXJyYXkgb2YgdGhlIGVudW1lcmFibGUgcHJvcGVydHkgbmFtZXMgb2YgdGhlIGFycmF5LWxpa2UgYHZhbHVlYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcXVlcnkuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGluaGVyaXRlZCBTcGVjaWZ5IHJldHVybmluZyBpbmhlcml0ZWQgcHJvcGVydHkgbmFtZXMuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzLlxuICovXG5mdW5jdGlvbiBhcnJheUxpa2VLZXlzKHZhbHVlLCBpbmhlcml0ZWQpIHtcbiAgdmFyIGlzQXJyID0gaXNBcnJheSh2YWx1ZSksXG4gICAgICBpc0FyZyA9ICFpc0FyciAmJiBpc0FyZ3VtZW50cyh2YWx1ZSksXG4gICAgICBpc0J1ZmYgPSAhaXNBcnIgJiYgIWlzQXJnICYmIGlzQnVmZmVyKHZhbHVlKSxcbiAgICAgIGlzVHlwZSA9ICFpc0FyciAmJiAhaXNBcmcgJiYgIWlzQnVmZiAmJiBpc1R5cGVkQXJyYXkodmFsdWUpLFxuICAgICAgc2tpcEluZGV4ZXMgPSBpc0FyciB8fCBpc0FyZyB8fCBpc0J1ZmYgfHwgaXNUeXBlLFxuICAgICAgcmVzdWx0ID0gc2tpcEluZGV4ZXMgPyBiYXNlVGltZXModmFsdWUubGVuZ3RoLCBTdHJpbmcpIDogW10sXG4gICAgICBsZW5ndGggPSByZXN1bHQubGVuZ3RoO1xuXG4gIGZvciAodmFyIGtleSBpbiB2YWx1ZSkge1xuICAgIGlmICgoaW5oZXJpdGVkIHx8IGhhc093blByb3BlcnR5LmNhbGwodmFsdWUsIGtleSkpICYmXG4gICAgICAgICEoc2tpcEluZGV4ZXMgJiYgKFxuICAgICAgICAgICAvLyBTYWZhcmkgOSBoYXMgZW51bWVyYWJsZSBgYXJndW1lbnRzLmxlbmd0aGAgaW4gc3RyaWN0IG1vZGUuXG4gICAgICAgICAgIGtleSA9PSAnbGVuZ3RoJyB8fFxuICAgICAgICAgICAvLyBOb2RlLmpzIDAuMTAgaGFzIGVudW1lcmFibGUgbm9uLWluZGV4IHByb3BlcnRpZXMgb24gYnVmZmVycy5cbiAgICAgICAgICAgKGlzQnVmZiAmJiAoa2V5ID09ICdvZmZzZXQnIHx8IGtleSA9PSAncGFyZW50JykpIHx8XG4gICAgICAgICAgIC8vIFBoYW50b21KUyAyIGhhcyBlbnVtZXJhYmxlIG5vbi1pbmRleCBwcm9wZXJ0aWVzIG9uIHR5cGVkIGFycmF5cy5cbiAgICAgICAgICAgKGlzVHlwZSAmJiAoa2V5ID09ICdidWZmZXInIHx8IGtleSA9PSAnYnl0ZUxlbmd0aCcgfHwga2V5ID09ICdieXRlT2Zmc2V0JykpIHx8XG4gICAgICAgICAgIC8vIFNraXAgaW5kZXggcHJvcGVydGllcy5cbiAgICAgICAgICAgaXNJbmRleChrZXksIGxlbmd0aClcbiAgICAgICAgKSkpIHtcbiAgICAgIHJlc3VsdC5wdXNoKGtleSk7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYXJyYXlMaWtlS2V5cztcbiIsIi8qKlxuICogVGhpcyBmdW5jdGlvbiBpcyBsaWtlXG4gKiBbYE9iamVjdC5rZXlzYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtb2JqZWN0LmtleXMpXG4gKiBleGNlcHQgdGhhdCBpdCBpbmNsdWRlcyBpbmhlcml0ZWQgZW51bWVyYWJsZSBwcm9wZXJ0aWVzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzLlxuICovXG5mdW5jdGlvbiBuYXRpdmVLZXlzSW4ob2JqZWN0KSB7XG4gIHZhciByZXN1bHQgPSBbXTtcbiAgaWYgKG9iamVjdCAhPSBudWxsKSB7XG4gICAgZm9yICh2YXIga2V5IGluIE9iamVjdChvYmplY3QpKSB7XG4gICAgICByZXN1bHQucHVzaChrZXkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG5hdGl2ZUtleXNJbjtcbiIsInZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vaXNPYmplY3QnKSxcbiAgICBpc1Byb3RvdHlwZSA9IHJlcXVpcmUoJy4vX2lzUHJvdG90eXBlJyksXG4gICAgbmF0aXZlS2V5c0luID0gcmVxdWlyZSgnLi9fbmF0aXZlS2V5c0luJyk7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8ua2V5c0luYCB3aGljaCBkb2Vzbid0IHRyZWF0IHNwYXJzZSBhcnJheXMgYXMgZGVuc2UuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMuXG4gKi9cbmZ1bmN0aW9uIGJhc2VLZXlzSW4ob2JqZWN0KSB7XG4gIGlmICghaXNPYmplY3Qob2JqZWN0KSkge1xuICAgIHJldHVybiBuYXRpdmVLZXlzSW4ob2JqZWN0KTtcbiAgfVxuICB2YXIgaXNQcm90byA9IGlzUHJvdG90eXBlKG9iamVjdCksXG4gICAgICByZXN1bHQgPSBbXTtcblxuICBmb3IgKHZhciBrZXkgaW4gb2JqZWN0KSB7XG4gICAgaWYgKCEoa2V5ID09ICdjb25zdHJ1Y3RvcicgJiYgKGlzUHJvdG8gfHwgIWhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBrZXkpKSkpIHtcbiAgICAgIHJlc3VsdC5wdXNoKGtleSk7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUtleXNJbjtcbiIsInZhciBhcnJheUxpa2VLZXlzID0gcmVxdWlyZSgnLi9fYXJyYXlMaWtlS2V5cycpLFxuICAgIGJhc2VLZXlzSW4gPSByZXF1aXJlKCcuL19iYXNlS2V5c0luJyksXG4gICAgaXNBcnJheUxpa2UgPSByZXF1aXJlKCcuL2lzQXJyYXlMaWtlJyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhcnJheSBvZiB0aGUgb3duIGFuZCBpbmhlcml0ZWQgZW51bWVyYWJsZSBwcm9wZXJ0eSBuYW1lcyBvZiBgb2JqZWN0YC5cbiAqXG4gKiAqKk5vdGU6KiogTm9uLW9iamVjdCB2YWx1ZXMgYXJlIGNvZXJjZWQgdG8gb2JqZWN0cy5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDMuMC4wXG4gKiBAY2F0ZWdvcnkgT2JqZWN0XG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzLlxuICogQGV4YW1wbGVcbiAqXG4gKiBmdW5jdGlvbiBGb28oKSB7XG4gKiAgIHRoaXMuYSA9IDE7XG4gKiAgIHRoaXMuYiA9IDI7XG4gKiB9XG4gKlxuICogRm9vLnByb3RvdHlwZS5jID0gMztcbiAqXG4gKiBfLmtleXNJbihuZXcgRm9vKTtcbiAqIC8vID0+IFsnYScsICdiJywgJ2MnXSAoaXRlcmF0aW9uIG9yZGVyIGlzIG5vdCBndWFyYW50ZWVkKVxuICovXG5mdW5jdGlvbiBrZXlzSW4ob2JqZWN0KSB7XG4gIHJldHVybiBpc0FycmF5TGlrZShvYmplY3QpID8gYXJyYXlMaWtlS2V5cyhvYmplY3QsIHRydWUpIDogYmFzZUtleXNJbihvYmplY3QpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGtleXNJbjtcbiIsInZhciBjb3B5T2JqZWN0ID0gcmVxdWlyZSgnLi9fY29weU9iamVjdCcpLFxuICAgIGtleXNJbiA9IHJlcXVpcmUoJy4va2V5c0luJyk7XG5cbi8qKlxuICogQ29udmVydHMgYHZhbHVlYCB0byBhIHBsYWluIG9iamVjdCBmbGF0dGVuaW5nIGluaGVyaXRlZCBlbnVtZXJhYmxlIHN0cmluZ1xuICoga2V5ZWQgcHJvcGVydGllcyBvZiBgdmFsdWVgIHRvIG93biBwcm9wZXJ0aWVzIG9mIHRoZSBwbGFpbiBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAzLjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNvbnZlcnQuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBjb252ZXJ0ZWQgcGxhaW4gb2JqZWN0LlxuICogQGV4YW1wbGVcbiAqXG4gKiBmdW5jdGlvbiBGb28oKSB7XG4gKiAgIHRoaXMuYiA9IDI7XG4gKiB9XG4gKlxuICogRm9vLnByb3RvdHlwZS5jID0gMztcbiAqXG4gKiBfLmFzc2lnbih7ICdhJzogMSB9LCBuZXcgRm9vKTtcbiAqIC8vID0+IHsgJ2EnOiAxLCAnYic6IDIgfVxuICpcbiAqIF8uYXNzaWduKHsgJ2EnOiAxIH0sIF8udG9QbGFpbk9iamVjdChuZXcgRm9vKSk7XG4gKiAvLyA9PiB7ICdhJzogMSwgJ2InOiAyLCAnYyc6IDMgfVxuICovXG5mdW5jdGlvbiB0b1BsYWluT2JqZWN0KHZhbHVlKSB7XG4gIHJldHVybiBjb3B5T2JqZWN0KHZhbHVlLCBrZXlzSW4odmFsdWUpKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB0b1BsYWluT2JqZWN0O1xuIiwidmFyIGFzc2lnbk1lcmdlVmFsdWUgPSByZXF1aXJlKCcuL19hc3NpZ25NZXJnZVZhbHVlJyksXG4gICAgY2xvbmVCdWZmZXIgPSByZXF1aXJlKCcuL19jbG9uZUJ1ZmZlcicpLFxuICAgIGNsb25lVHlwZWRBcnJheSA9IHJlcXVpcmUoJy4vX2Nsb25lVHlwZWRBcnJheScpLFxuICAgIGNvcHlBcnJheSA9IHJlcXVpcmUoJy4vX2NvcHlBcnJheScpLFxuICAgIGluaXRDbG9uZU9iamVjdCA9IHJlcXVpcmUoJy4vX2luaXRDbG9uZU9iamVjdCcpLFxuICAgIGlzQXJndW1lbnRzID0gcmVxdWlyZSgnLi9pc0FyZ3VtZW50cycpLFxuICAgIGlzQXJyYXkgPSByZXF1aXJlKCcuL2lzQXJyYXknKSxcbiAgICBpc0FycmF5TGlrZU9iamVjdCA9IHJlcXVpcmUoJy4vaXNBcnJheUxpa2VPYmplY3QnKSxcbiAgICBpc0J1ZmZlciA9IHJlcXVpcmUoJy4vaXNCdWZmZXInKSxcbiAgICBpc0Z1bmN0aW9uID0gcmVxdWlyZSgnLi9pc0Z1bmN0aW9uJyksXG4gICAgaXNPYmplY3QgPSByZXF1aXJlKCcuL2lzT2JqZWN0JyksXG4gICAgaXNQbGFpbk9iamVjdCA9IHJlcXVpcmUoJy4vaXNQbGFpbk9iamVjdCcpLFxuICAgIGlzVHlwZWRBcnJheSA9IHJlcXVpcmUoJy4vaXNUeXBlZEFycmF5JyksXG4gICAgdG9QbGFpbk9iamVjdCA9IHJlcXVpcmUoJy4vdG9QbGFpbk9iamVjdCcpO1xuXG4vKipcbiAqIEEgc3BlY2lhbGl6ZWQgdmVyc2lvbiBvZiBgYmFzZU1lcmdlYCBmb3IgYXJyYXlzIGFuZCBvYmplY3RzIHdoaWNoIHBlcmZvcm1zXG4gKiBkZWVwIG1lcmdlcyBhbmQgdHJhY2tzIHRyYXZlcnNlZCBvYmplY3RzIGVuYWJsaW5nIG9iamVjdHMgd2l0aCBjaXJjdWxhclxuICogcmVmZXJlbmNlcyB0byBiZSBtZXJnZWQuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIGRlc3RpbmF0aW9uIG9iamVjdC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBzb3VyY2UgVGhlIHNvdXJjZSBvYmplY3QuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIG1lcmdlLlxuICogQHBhcmFtIHtudW1iZXJ9IHNyY0luZGV4IFRoZSBpbmRleCBvZiBgc291cmNlYC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IG1lcmdlRnVuYyBUaGUgZnVuY3Rpb24gdG8gbWVyZ2UgdmFsdWVzLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2N1c3RvbWl6ZXJdIFRoZSBmdW5jdGlvbiB0byBjdXN0b21pemUgYXNzaWduZWQgdmFsdWVzLlxuICogQHBhcmFtIHtPYmplY3R9IFtzdGFja10gVHJhY2tzIHRyYXZlcnNlZCBzb3VyY2UgdmFsdWVzIGFuZCB0aGVpciBtZXJnZWRcbiAqICBjb3VudGVycGFydHMuXG4gKi9cbmZ1bmN0aW9uIGJhc2VNZXJnZURlZXAob2JqZWN0LCBzb3VyY2UsIGtleSwgc3JjSW5kZXgsIG1lcmdlRnVuYywgY3VzdG9taXplciwgc3RhY2spIHtcbiAgdmFyIG9ialZhbHVlID0gb2JqZWN0W2tleV0sXG4gICAgICBzcmNWYWx1ZSA9IHNvdXJjZVtrZXldLFxuICAgICAgc3RhY2tlZCA9IHN0YWNrLmdldChzcmNWYWx1ZSk7XG5cbiAgaWYgKHN0YWNrZWQpIHtcbiAgICBhc3NpZ25NZXJnZVZhbHVlKG9iamVjdCwga2V5LCBzdGFja2VkKTtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIG5ld1ZhbHVlID0gY3VzdG9taXplclxuICAgID8gY3VzdG9taXplcihvYmpWYWx1ZSwgc3JjVmFsdWUsIChrZXkgKyAnJyksIG9iamVjdCwgc291cmNlLCBzdGFjaylcbiAgICA6IHVuZGVmaW5lZDtcblxuICB2YXIgaXNDb21tb24gPSBuZXdWYWx1ZSA9PT0gdW5kZWZpbmVkO1xuXG4gIGlmIChpc0NvbW1vbikge1xuICAgIHZhciBpc0FyciA9IGlzQXJyYXkoc3JjVmFsdWUpLFxuICAgICAgICBpc0J1ZmYgPSAhaXNBcnIgJiYgaXNCdWZmZXIoc3JjVmFsdWUpLFxuICAgICAgICBpc1R5cGVkID0gIWlzQXJyICYmICFpc0J1ZmYgJiYgaXNUeXBlZEFycmF5KHNyY1ZhbHVlKTtcblxuICAgIG5ld1ZhbHVlID0gc3JjVmFsdWU7XG4gICAgaWYgKGlzQXJyIHx8IGlzQnVmZiB8fCBpc1R5cGVkKSB7XG4gICAgICBpZiAoaXNBcnJheShvYmpWYWx1ZSkpIHtcbiAgICAgICAgbmV3VmFsdWUgPSBvYmpWYWx1ZTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKGlzQXJyYXlMaWtlT2JqZWN0KG9ialZhbHVlKSkge1xuICAgICAgICBuZXdWYWx1ZSA9IGNvcHlBcnJheShvYmpWYWx1ZSk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChpc0J1ZmYpIHtcbiAgICAgICAgaXNDb21tb24gPSBmYWxzZTtcbiAgICAgICAgbmV3VmFsdWUgPSBjbG9uZUJ1ZmZlcihzcmNWYWx1ZSwgdHJ1ZSk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChpc1R5cGVkKSB7XG4gICAgICAgIGlzQ29tbW9uID0gZmFsc2U7XG4gICAgICAgIG5ld1ZhbHVlID0gY2xvbmVUeXBlZEFycmF5KHNyY1ZhbHVlLCB0cnVlKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBuZXdWYWx1ZSA9IFtdO1xuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmIChpc1BsYWluT2JqZWN0KHNyY1ZhbHVlKSB8fCBpc0FyZ3VtZW50cyhzcmNWYWx1ZSkpIHtcbiAgICAgIG5ld1ZhbHVlID0gb2JqVmFsdWU7XG4gICAgICBpZiAoaXNBcmd1bWVudHMob2JqVmFsdWUpKSB7XG4gICAgICAgIG5ld1ZhbHVlID0gdG9QbGFpbk9iamVjdChvYmpWYWx1ZSk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmICghaXNPYmplY3Qob2JqVmFsdWUpIHx8IChzcmNJbmRleCAmJiBpc0Z1bmN0aW9uKG9ialZhbHVlKSkpIHtcbiAgICAgICAgbmV3VmFsdWUgPSBpbml0Q2xvbmVPYmplY3Qoc3JjVmFsdWUpO1xuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGlzQ29tbW9uID0gZmFsc2U7XG4gICAgfVxuICB9XG4gIGlmIChpc0NvbW1vbikge1xuICAgIC8vIFJlY3Vyc2l2ZWx5IG1lcmdlIG9iamVjdHMgYW5kIGFycmF5cyAoc3VzY2VwdGlibGUgdG8gY2FsbCBzdGFjayBsaW1pdHMpLlxuICAgIHN0YWNrLnNldChzcmNWYWx1ZSwgbmV3VmFsdWUpO1xuICAgIG1lcmdlRnVuYyhuZXdWYWx1ZSwgc3JjVmFsdWUsIHNyY0luZGV4LCBjdXN0b21pemVyLCBzdGFjayk7XG4gICAgc3RhY2tbJ2RlbGV0ZSddKHNyY1ZhbHVlKTtcbiAgfVxuICBhc3NpZ25NZXJnZVZhbHVlKG9iamVjdCwga2V5LCBuZXdWYWx1ZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZU1lcmdlRGVlcDtcbiIsInZhciBTdGFjayA9IHJlcXVpcmUoJy4vX1N0YWNrJyksXG4gICAgYXNzaWduTWVyZ2VWYWx1ZSA9IHJlcXVpcmUoJy4vX2Fzc2lnbk1lcmdlVmFsdWUnKSxcbiAgICBiYXNlRm9yID0gcmVxdWlyZSgnLi9fYmFzZUZvcicpLFxuICAgIGJhc2VNZXJnZURlZXAgPSByZXF1aXJlKCcuL19iYXNlTWVyZ2VEZWVwJyksXG4gICAgaXNPYmplY3QgPSByZXF1aXJlKCcuL2lzT2JqZWN0JyksXG4gICAga2V5c0luID0gcmVxdWlyZSgnLi9rZXlzSW4nKTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5tZXJnZWAgd2l0aG91dCBzdXBwb3J0IGZvciBtdWx0aXBsZSBzb3VyY2VzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBkZXN0aW5hdGlvbiBvYmplY3QuXG4gKiBAcGFyYW0ge09iamVjdH0gc291cmNlIFRoZSBzb3VyY2Ugb2JqZWN0LlxuICogQHBhcmFtIHtudW1iZXJ9IHNyY0luZGV4IFRoZSBpbmRleCBvZiBgc291cmNlYC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtjdXN0b21pemVyXSBUaGUgZnVuY3Rpb24gdG8gY3VzdG9taXplIG1lcmdlZCB2YWx1ZXMuXG4gKiBAcGFyYW0ge09iamVjdH0gW3N0YWNrXSBUcmFja3MgdHJhdmVyc2VkIHNvdXJjZSB2YWx1ZXMgYW5kIHRoZWlyIG1lcmdlZFxuICogIGNvdW50ZXJwYXJ0cy5cbiAqL1xuZnVuY3Rpb24gYmFzZU1lcmdlKG9iamVjdCwgc291cmNlLCBzcmNJbmRleCwgY3VzdG9taXplciwgc3RhY2spIHtcbiAgaWYgKG9iamVjdCA9PT0gc291cmNlKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGJhc2VGb3Ioc291cmNlLCBmdW5jdGlvbihzcmNWYWx1ZSwga2V5KSB7XG4gICAgaWYgKGlzT2JqZWN0KHNyY1ZhbHVlKSkge1xuICAgICAgc3RhY2sgfHwgKHN0YWNrID0gbmV3IFN0YWNrKTtcbiAgICAgIGJhc2VNZXJnZURlZXAob2JqZWN0LCBzb3VyY2UsIGtleSwgc3JjSW5kZXgsIGJhc2VNZXJnZSwgY3VzdG9taXplciwgc3RhY2spO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHZhciBuZXdWYWx1ZSA9IGN1c3RvbWl6ZXJcbiAgICAgICAgPyBjdXN0b21pemVyKG9iamVjdFtrZXldLCBzcmNWYWx1ZSwgKGtleSArICcnKSwgb2JqZWN0LCBzb3VyY2UsIHN0YWNrKVxuICAgICAgICA6IHVuZGVmaW5lZDtcblxuICAgICAgaWYgKG5ld1ZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgbmV3VmFsdWUgPSBzcmNWYWx1ZTtcbiAgICAgIH1cbiAgICAgIGFzc2lnbk1lcmdlVmFsdWUob2JqZWN0LCBrZXksIG5ld1ZhbHVlKTtcbiAgICB9XG4gIH0sIGtleXNJbik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZU1lcmdlO1xuIiwiLyoqXG4gKiBUaGlzIG1ldGhvZCByZXR1cm5zIHRoZSBmaXJzdCBhcmd1bWVudCBpdCByZWNlaXZlcy5cbiAqXG4gKiBAc3RhdGljXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgVXRpbFxuICogQHBhcmFtIHsqfSB2YWx1ZSBBbnkgdmFsdWUuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyBgdmFsdWVgLlxuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgb2JqZWN0ID0geyAnYSc6IDEgfTtcbiAqXG4gKiBjb25zb2xlLmxvZyhfLmlkZW50aXR5KG9iamVjdCkgPT09IG9iamVjdCk7XG4gKiAvLyA9PiB0cnVlXG4gKi9cbmZ1bmN0aW9uIGlkZW50aXR5KHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpZGVudGl0eTtcbiIsIi8qKlxuICogQSBmYXN0ZXIgYWx0ZXJuYXRpdmUgdG8gYEZ1bmN0aW9uI2FwcGx5YCwgdGhpcyBmdW5jdGlvbiBpbnZva2VzIGBmdW5jYFxuICogd2l0aCB0aGUgYHRoaXNgIGJpbmRpbmcgb2YgYHRoaXNBcmdgIGFuZCB0aGUgYXJndW1lbnRzIG9mIGBhcmdzYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gaW52b2tlLlxuICogQHBhcmFtIHsqfSB0aGlzQXJnIFRoZSBgdGhpc2AgYmluZGluZyBvZiBgZnVuY2AuXG4gKiBAcGFyYW0ge0FycmF5fSBhcmdzIFRoZSBhcmd1bWVudHMgdG8gaW52b2tlIGBmdW5jYCB3aXRoLlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIHJlc3VsdCBvZiBgZnVuY2AuXG4gKi9cbmZ1bmN0aW9uIGFwcGx5KGZ1bmMsIHRoaXNBcmcsIGFyZ3MpIHtcbiAgc3dpdGNoIChhcmdzLmxlbmd0aCkge1xuICAgIGNhc2UgMDogcmV0dXJuIGZ1bmMuY2FsbCh0aGlzQXJnKTtcbiAgICBjYXNlIDE6IHJldHVybiBmdW5jLmNhbGwodGhpc0FyZywgYXJnc1swXSk7XG4gICAgY2FzZSAyOiByZXR1cm4gZnVuYy5jYWxsKHRoaXNBcmcsIGFyZ3NbMF0sIGFyZ3NbMV0pO1xuICAgIGNhc2UgMzogcmV0dXJuIGZ1bmMuY2FsbCh0aGlzQXJnLCBhcmdzWzBdLCBhcmdzWzFdLCBhcmdzWzJdKTtcbiAgfVxuICByZXR1cm4gZnVuYy5hcHBseSh0aGlzQXJnLCBhcmdzKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBhcHBseTtcbiIsInZhciBhcHBseSA9IHJlcXVpcmUoJy4vX2FwcGx5Jyk7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIGZvciB0aG9zZSB3aXRoIHRoZSBzYW1lIG5hbWUgYXMgb3RoZXIgYGxvZGFzaGAgbWV0aG9kcy4gKi9cbnZhciBuYXRpdmVNYXggPSBNYXRoLm1heDtcblxuLyoqXG4gKiBBIHNwZWNpYWxpemVkIHZlcnNpb24gb2YgYGJhc2VSZXN0YCB3aGljaCB0cmFuc2Zvcm1zIHRoZSByZXN0IGFycmF5LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBhcHBseSBhIHJlc3QgcGFyYW1ldGVyIHRvLlxuICogQHBhcmFtIHtudW1iZXJ9IFtzdGFydD1mdW5jLmxlbmd0aC0xXSBUaGUgc3RhcnQgcG9zaXRpb24gb2YgdGhlIHJlc3QgcGFyYW1ldGVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gdHJhbnNmb3JtIFRoZSByZXN0IGFycmF5IHRyYW5zZm9ybS5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBvdmVyUmVzdChmdW5jLCBzdGFydCwgdHJhbnNmb3JtKSB7XG4gIHN0YXJ0ID0gbmF0aXZlTWF4KHN0YXJ0ID09PSB1bmRlZmluZWQgPyAoZnVuYy5sZW5ndGggLSAxKSA6IHN0YXJ0LCAwKTtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBhcmdzID0gYXJndW1lbnRzLFxuICAgICAgICBpbmRleCA9IC0xLFxuICAgICAgICBsZW5ndGggPSBuYXRpdmVNYXgoYXJncy5sZW5ndGggLSBzdGFydCwgMCksXG4gICAgICAgIGFycmF5ID0gQXJyYXkobGVuZ3RoKTtcblxuICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICBhcnJheVtpbmRleF0gPSBhcmdzW3N0YXJ0ICsgaW5kZXhdO1xuICAgIH1cbiAgICBpbmRleCA9IC0xO1xuICAgIHZhciBvdGhlckFyZ3MgPSBBcnJheShzdGFydCArIDEpO1xuICAgIHdoaWxlICgrK2luZGV4IDwgc3RhcnQpIHtcbiAgICAgIG90aGVyQXJnc1tpbmRleF0gPSBhcmdzW2luZGV4XTtcbiAgICB9XG4gICAgb3RoZXJBcmdzW3N0YXJ0XSA9IHRyYW5zZm9ybShhcnJheSk7XG4gICAgcmV0dXJuIGFwcGx5KGZ1bmMsIHRoaXMsIG90aGVyQXJncyk7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gb3ZlclJlc3Q7XG4iLCIvKipcbiAqIENyZWF0ZXMgYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgYHZhbHVlYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDIuNC4wXG4gKiBAY2F0ZWdvcnkgVXRpbFxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcmV0dXJuIGZyb20gdGhlIG5ldyBmdW5jdGlvbi5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGNvbnN0YW50IGZ1bmN0aW9uLlxuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgb2JqZWN0cyA9IF8udGltZXMoMiwgXy5jb25zdGFudCh7ICdhJzogMSB9KSk7XG4gKlxuICogY29uc29sZS5sb2cob2JqZWN0cyk7XG4gKiAvLyA9PiBbeyAnYSc6IDEgfSwgeyAnYSc6IDEgfV1cbiAqXG4gKiBjb25zb2xlLmxvZyhvYmplY3RzWzBdID09PSBvYmplY3RzWzFdKTtcbiAqIC8vID0+IHRydWVcbiAqL1xuZnVuY3Rpb24gY29uc3RhbnQodmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjb25zdGFudDtcbiIsInZhciBjb25zdGFudCA9IHJlcXVpcmUoJy4vY29uc3RhbnQnKSxcbiAgICBkZWZpbmVQcm9wZXJ0eSA9IHJlcXVpcmUoJy4vX2RlZmluZVByb3BlcnR5JyksXG4gICAgaWRlbnRpdHkgPSByZXF1aXJlKCcuL2lkZW50aXR5Jyk7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYHNldFRvU3RyaW5nYCB3aXRob3V0IHN1cHBvcnQgZm9yIGhvdCBsb29wIHNob3J0aW5nLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBtb2RpZnkuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBzdHJpbmcgVGhlIGB0b1N0cmluZ2AgcmVzdWx0LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIGBmdW5jYC5cbiAqL1xudmFyIGJhc2VTZXRUb1N0cmluZyA9ICFkZWZpbmVQcm9wZXJ0eSA/IGlkZW50aXR5IDogZnVuY3Rpb24oZnVuYywgc3RyaW5nKSB7XG4gIHJldHVybiBkZWZpbmVQcm9wZXJ0eShmdW5jLCAndG9TdHJpbmcnLCB7XG4gICAgJ2NvbmZpZ3VyYWJsZSc6IHRydWUsXG4gICAgJ2VudW1lcmFibGUnOiBmYWxzZSxcbiAgICAndmFsdWUnOiBjb25zdGFudChzdHJpbmcpLFxuICAgICd3cml0YWJsZSc6IHRydWVcbiAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VTZXRUb1N0cmluZztcbiIsIi8qKiBVc2VkIHRvIGRldGVjdCBob3QgZnVuY3Rpb25zIGJ5IG51bWJlciBvZiBjYWxscyB3aXRoaW4gYSBzcGFuIG9mIG1pbGxpc2Vjb25kcy4gKi9cbnZhciBIT1RfQ09VTlQgPSA4MDAsXG4gICAgSE9UX1NQQU4gPSAxNjtcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgZm9yIHRob3NlIHdpdGggdGhlIHNhbWUgbmFtZSBhcyBvdGhlciBgbG9kYXNoYCBtZXRob2RzLiAqL1xudmFyIG5hdGl2ZU5vdyA9IERhdGUubm93O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBmdW5jdGlvbiB0aGF0J2xsIHNob3J0IG91dCBhbmQgaW52b2tlIGBpZGVudGl0eWAgaW5zdGVhZFxuICogb2YgYGZ1bmNgIHdoZW4gaXQncyBjYWxsZWQgYEhPVF9DT1VOVGAgb3IgbW9yZSB0aW1lcyBpbiBgSE9UX1NQQU5gXG4gKiBtaWxsaXNlY29uZHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIHJlc3RyaWN0LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgc2hvcnRhYmxlIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBzaG9ydE91dChmdW5jKSB7XG4gIHZhciBjb3VudCA9IDAsXG4gICAgICBsYXN0Q2FsbGVkID0gMDtcblxuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHN0YW1wID0gbmF0aXZlTm93KCksXG4gICAgICAgIHJlbWFpbmluZyA9IEhPVF9TUEFOIC0gKHN0YW1wIC0gbGFzdENhbGxlZCk7XG5cbiAgICBsYXN0Q2FsbGVkID0gc3RhbXA7XG4gICAgaWYgKHJlbWFpbmluZyA+IDApIHtcbiAgICAgIGlmICgrK2NvdW50ID49IEhPVF9DT1VOVCkge1xuICAgICAgICByZXR1cm4gYXJndW1lbnRzWzBdO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb3VudCA9IDA7XG4gICAgfVxuICAgIHJldHVybiBmdW5jLmFwcGx5KHVuZGVmaW5lZCwgYXJndW1lbnRzKTtcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzaG9ydE91dDtcbiIsInZhciBiYXNlU2V0VG9TdHJpbmcgPSByZXF1aXJlKCcuL19iYXNlU2V0VG9TdHJpbmcnKSxcbiAgICBzaG9ydE91dCA9IHJlcXVpcmUoJy4vX3Nob3J0T3V0Jyk7XG5cbi8qKlxuICogU2V0cyB0aGUgYHRvU3RyaW5nYCBtZXRob2Qgb2YgYGZ1bmNgIHRvIHJldHVybiBgc3RyaW5nYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gbW9kaWZ5LlxuICogQHBhcmFtIHtGdW5jdGlvbn0gc3RyaW5nIFRoZSBgdG9TdHJpbmdgIHJlc3VsdC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyBgZnVuY2AuXG4gKi9cbnZhciBzZXRUb1N0cmluZyA9IHNob3J0T3V0KGJhc2VTZXRUb1N0cmluZyk7XG5cbm1vZHVsZS5leHBvcnRzID0gc2V0VG9TdHJpbmc7XG4iLCJ2YXIgaWRlbnRpdHkgPSByZXF1aXJlKCcuL2lkZW50aXR5JyksXG4gICAgb3ZlclJlc3QgPSByZXF1aXJlKCcuL19vdmVyUmVzdCcpLFxuICAgIHNldFRvU3RyaW5nID0gcmVxdWlyZSgnLi9fc2V0VG9TdHJpbmcnKTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5yZXN0YCB3aGljaCBkb2Vzbid0IHZhbGlkYXRlIG9yIGNvZXJjZSBhcmd1bWVudHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGFwcGx5IGEgcmVzdCBwYXJhbWV0ZXIgdG8uXG4gKiBAcGFyYW0ge251bWJlcn0gW3N0YXJ0PWZ1bmMubGVuZ3RoLTFdIFRoZSBzdGFydCBwb3NpdGlvbiBvZiB0aGUgcmVzdCBwYXJhbWV0ZXIuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gYmFzZVJlc3QoZnVuYywgc3RhcnQpIHtcbiAgcmV0dXJuIHNldFRvU3RyaW5nKG92ZXJSZXN0KGZ1bmMsIHN0YXJ0LCBpZGVudGl0eSksIGZ1bmMgKyAnJyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZVJlc3Q7XG4iLCJ2YXIgZXEgPSByZXF1aXJlKCcuL2VxJyksXG4gICAgaXNBcnJheUxpa2UgPSByZXF1aXJlKCcuL2lzQXJyYXlMaWtlJyksXG4gICAgaXNJbmRleCA9IHJlcXVpcmUoJy4vX2lzSW5kZXgnKSxcbiAgICBpc09iamVjdCA9IHJlcXVpcmUoJy4vaXNPYmplY3QnKTtcblxuLyoqXG4gKiBDaGVja3MgaWYgdGhlIGdpdmVuIGFyZ3VtZW50cyBhcmUgZnJvbSBhbiBpdGVyYXRlZSBjYWxsLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSBwb3RlbnRpYWwgaXRlcmF0ZWUgdmFsdWUgYXJndW1lbnQuXG4gKiBAcGFyYW0geyp9IGluZGV4IFRoZSBwb3RlbnRpYWwgaXRlcmF0ZWUgaW5kZXggb3Iga2V5IGFyZ3VtZW50LlxuICogQHBhcmFtIHsqfSBvYmplY3QgVGhlIHBvdGVudGlhbCBpdGVyYXRlZSBvYmplY3QgYXJndW1lbnQuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGFyZ3VtZW50cyBhcmUgZnJvbSBhbiBpdGVyYXRlZSBjYWxsLFxuICogIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaXNJdGVyYXRlZUNhbGwodmFsdWUsIGluZGV4LCBvYmplY3QpIHtcbiAgaWYgKCFpc09iamVjdChvYmplY3QpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciB0eXBlID0gdHlwZW9mIGluZGV4O1xuICBpZiAodHlwZSA9PSAnbnVtYmVyJ1xuICAgICAgICA/IChpc0FycmF5TGlrZShvYmplY3QpICYmIGlzSW5kZXgoaW5kZXgsIG9iamVjdC5sZW5ndGgpKVxuICAgICAgICA6ICh0eXBlID09ICdzdHJpbmcnICYmIGluZGV4IGluIG9iamVjdClcbiAgICAgICkge1xuICAgIHJldHVybiBlcShvYmplY3RbaW5kZXhdLCB2YWx1ZSk7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzSXRlcmF0ZWVDYWxsO1xuIiwidmFyIGJhc2VSZXN0ID0gcmVxdWlyZSgnLi9fYmFzZVJlc3QnKSxcbiAgICBpc0l0ZXJhdGVlQ2FsbCA9IHJlcXVpcmUoJy4vX2lzSXRlcmF0ZWVDYWxsJyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGZ1bmN0aW9uIGxpa2UgYF8uYXNzaWduYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gYXNzaWduZXIgVGhlIGZ1bmN0aW9uIHRvIGFzc2lnbiB2YWx1ZXMuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBhc3NpZ25lciBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlQXNzaWduZXIoYXNzaWduZXIpIHtcbiAgcmV0dXJuIGJhc2VSZXN0KGZ1bmN0aW9uKG9iamVjdCwgc291cmNlcykge1xuICAgIHZhciBpbmRleCA9IC0xLFxuICAgICAgICBsZW5ndGggPSBzb3VyY2VzLmxlbmd0aCxcbiAgICAgICAgY3VzdG9taXplciA9IGxlbmd0aCA+IDEgPyBzb3VyY2VzW2xlbmd0aCAtIDFdIDogdW5kZWZpbmVkLFxuICAgICAgICBndWFyZCA9IGxlbmd0aCA+IDIgPyBzb3VyY2VzWzJdIDogdW5kZWZpbmVkO1xuXG4gICAgY3VzdG9taXplciA9IChhc3NpZ25lci5sZW5ndGggPiAzICYmIHR5cGVvZiBjdXN0b21pemVyID09ICdmdW5jdGlvbicpXG4gICAgICA/IChsZW5ndGgtLSwgY3VzdG9taXplcilcbiAgICAgIDogdW5kZWZpbmVkO1xuXG4gICAgaWYgKGd1YXJkICYmIGlzSXRlcmF0ZWVDYWxsKHNvdXJjZXNbMF0sIHNvdXJjZXNbMV0sIGd1YXJkKSkge1xuICAgICAgY3VzdG9taXplciA9IGxlbmd0aCA8IDMgPyB1bmRlZmluZWQgOiBjdXN0b21pemVyO1xuICAgICAgbGVuZ3RoID0gMTtcbiAgICB9XG4gICAgb2JqZWN0ID0gT2JqZWN0KG9iamVjdCk7XG4gICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgIHZhciBzb3VyY2UgPSBzb3VyY2VzW2luZGV4XTtcbiAgICAgIGlmIChzb3VyY2UpIHtcbiAgICAgICAgYXNzaWduZXIob2JqZWN0LCBzb3VyY2UsIGluZGV4LCBjdXN0b21pemVyKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG9iamVjdDtcbiAgfSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlQXNzaWduZXI7XG4iLCJ2YXIgYmFzZU1lcmdlID0gcmVxdWlyZSgnLi9fYmFzZU1lcmdlJyksXG4gICAgY3JlYXRlQXNzaWduZXIgPSByZXF1aXJlKCcuL19jcmVhdGVBc3NpZ25lcicpO1xuXG4vKipcbiAqIFRoaXMgbWV0aG9kIGlzIGxpa2UgYF8uYXNzaWduYCBleGNlcHQgdGhhdCBpdCByZWN1cnNpdmVseSBtZXJnZXMgb3duIGFuZFxuICogaW5oZXJpdGVkIGVudW1lcmFibGUgc3RyaW5nIGtleWVkIHByb3BlcnRpZXMgb2Ygc291cmNlIG9iamVjdHMgaW50byB0aGVcbiAqIGRlc3RpbmF0aW9uIG9iamVjdC4gU291cmNlIHByb3BlcnRpZXMgdGhhdCByZXNvbHZlIHRvIGB1bmRlZmluZWRgIGFyZVxuICogc2tpcHBlZCBpZiBhIGRlc3RpbmF0aW9uIHZhbHVlIGV4aXN0cy4gQXJyYXkgYW5kIHBsYWluIG9iamVjdCBwcm9wZXJ0aWVzXG4gKiBhcmUgbWVyZ2VkIHJlY3Vyc2l2ZWx5LiBPdGhlciBvYmplY3RzIGFuZCB2YWx1ZSB0eXBlcyBhcmUgb3ZlcnJpZGRlbiBieVxuICogYXNzaWdubWVudC4gU291cmNlIG9iamVjdHMgYXJlIGFwcGxpZWQgZnJvbSBsZWZ0IHRvIHJpZ2h0LiBTdWJzZXF1ZW50XG4gKiBzb3VyY2VzIG92ZXJ3cml0ZSBwcm9wZXJ0eSBhc3NpZ25tZW50cyBvZiBwcmV2aW91cyBzb3VyY2VzLlxuICpcbiAqICoqTm90ZToqKiBUaGlzIG1ldGhvZCBtdXRhdGVzIGBvYmplY3RgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC41LjBcbiAqIEBjYXRlZ29yeSBPYmplY3RcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIGRlc3RpbmF0aW9uIG9iamVjdC5cbiAqIEBwYXJhbSB7Li4uT2JqZWN0fSBbc291cmNlc10gVGhlIHNvdXJjZSBvYmplY3RzLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBgb2JqZWN0YC5cbiAqIEBleGFtcGxlXG4gKlxuICogdmFyIG9iamVjdCA9IHtcbiAqICAgJ2EnOiBbeyAnYic6IDIgfSwgeyAnZCc6IDQgfV1cbiAqIH07XG4gKlxuICogdmFyIG90aGVyID0ge1xuICogICAnYSc6IFt7ICdjJzogMyB9LCB7ICdlJzogNSB9XVxuICogfTtcbiAqXG4gKiBfLm1lcmdlKG9iamVjdCwgb3RoZXIpO1xuICogLy8gPT4geyAnYSc6IFt7ICdiJzogMiwgJ2MnOiAzIH0sIHsgJ2QnOiA0LCAnZSc6IDUgfV0gfVxuICovXG52YXIgbWVyZ2UgPSBjcmVhdGVBc3NpZ25lcihmdW5jdGlvbihvYmplY3QsIHNvdXJjZSwgc3JjSW5kZXgpIHtcbiAgYmFzZU1lcmdlKG9iamVjdCwgc291cmNlLCBzcmNJbmRleCk7XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBtZXJnZTtcbiIsIi8vIEBmbG93XG5pbXBvcnQgeyB0aHJvd0Vycm9yIH0gZnJvbSAnLi91dGlsJ1xuXG5leHBvcnQgZnVuY3Rpb24gaXNEb21TZWxlY3RvciAoc2VsZWN0b3I6IGFueSkge1xuICBpZiAodHlwZW9mIHNlbGVjdG9yICE9PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgdHJ5IHtcbiAgICBpZiAodHlwZW9mIGRvY3VtZW50ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhyb3dFcnJvcignbW91bnQgbXVzdCBiZSBydW4gaW4gYSBicm93c2VyIGVudmlyb25tZW50IGxpa2UgUGhhbnRvbUpTLCBqc2RvbSBvciBjaHJvbWUnKVxuICAgIH1cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICB0aHJvd0Vycm9yKCdtb3VudCBtdXN0IGJlIHJ1biBpbiBhIGJyb3dzZXIgZW52aXJvbm1lbnQgbGlrZSBQaGFudG9tSlMsIGpzZG9tIG9yIGNocm9tZScpXG4gIH1cblxuICB0cnkge1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpXG4gICAgcmV0dXJuIHRydWVcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNWdWVDb21wb25lbnQgKGNvbXBvbmVudDogYW55KSB7XG4gIGlmICh0eXBlb2YgY29tcG9uZW50ID09PSAnZnVuY3Rpb24nICYmIGNvbXBvbmVudC5vcHRpb25zKSB7XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIGlmIChjb21wb25lbnQgPT09IG51bGwgfHwgdHlwZW9mIGNvbXBvbmVudCAhPT0gJ29iamVjdCcpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIGlmIChjb21wb25lbnQuZXh0ZW5kcyB8fCBjb21wb25lbnQuX0N0b3IpIHtcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgcmV0dXJuIHR5cGVvZiBjb21wb25lbnQucmVuZGVyID09PSAnZnVuY3Rpb24nXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb21wb25lbnROZWVkc0NvbXBpbGluZyAoY29tcG9uZW50OiBDb21wb25lbnQpIHtcbiAgcmV0dXJuIGNvbXBvbmVudCAmJlxuICAgICFjb21wb25lbnQucmVuZGVyICYmXG4gICAgKGNvbXBvbmVudC50ZW1wbGF0ZSB8fCBjb21wb25lbnQuZXh0ZW5kcykgJiZcbiAgICAhY29tcG9uZW50LmZ1bmN0aW9uYWxcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUmVmU2VsZWN0b3IgKHJlZk9wdGlvbnNPYmplY3Q6IGFueSkge1xuICBpZiAodHlwZW9mIHJlZk9wdGlvbnNPYmplY3QgIT09ICdvYmplY3QnIHx8IE9iamVjdC5rZXlzKHJlZk9wdGlvbnNPYmplY3QgfHwge30pLmxlbmd0aCAhPT0gMSkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgcmV0dXJuIHR5cGVvZiByZWZPcHRpb25zT2JqZWN0LnJlZiA9PT0gJ3N0cmluZydcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzTmFtZVNlbGVjdG9yIChuYW1lT3B0aW9uc09iamVjdDogYW55KSB7XG4gIGlmICh0eXBlb2YgbmFtZU9wdGlvbnNPYmplY3QgIT09ICdvYmplY3QnIHx8IG5hbWVPcHRpb25zT2JqZWN0ID09PSBudWxsKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICByZXR1cm4gISFuYW1lT3B0aW9uc09iamVjdC5uYW1lXG59XG4iLCJpbXBvcnQgVnVlIGZyb20gJ3Z1ZSdcblxuZXhwb3J0IGNvbnN0IE5BTUVfU0VMRUNUT1IgPSAnTkFNRV9TRUxFQ1RPUidcbmV4cG9ydCBjb25zdCBDT01QT05FTlRfU0VMRUNUT1IgPSAnQ09NUE9ORU5UX1NFTEVDVE9SJ1xuZXhwb3J0IGNvbnN0IFJFRl9TRUxFQ1RPUiA9ICdSRUZfU0VMRUNUT1InXG5leHBvcnQgY29uc3QgRE9NX1NFTEVDVE9SID0gJ0RPTV9TRUxFQ1RPUidcbmV4cG9ydCBjb25zdCBWVUVfVkVSU0lPTiA9IE51bWJlcihgJHtWdWUudmVyc2lvbi5zcGxpdCgnLicpWzBdfS4ke1Z1ZS52ZXJzaW9uLnNwbGl0KCcuJylbMV19YClcbmV4cG9ydCBjb25zdCBGVU5DVElPTkFMX09QVElPTlMgPSBWVUVfVkVSU0lPTiA+PSAyLjUgPyAnZm5PcHRpb25zJyA6ICdmdW5jdGlvbmFsT3B0aW9ucydcbiIsIi8vIEBmbG93XG5cbmltcG9ydCB7XG4gIGlzRG9tU2VsZWN0b3IsXG4gIGlzTmFtZVNlbGVjdG9yLFxuICBpc1JlZlNlbGVjdG9yLFxuICBpc1Z1ZUNvbXBvbmVudFxufSBmcm9tICdzaGFyZWQvdmFsaWRhdG9ycydcbmltcG9ydCB7XG4gIHRocm93RXJyb3Jcbn0gZnJvbSAnc2hhcmVkL3V0aWwnXG5pbXBvcnQge1xuICBSRUZfU0VMRUNUT1IsXG4gIENPTVBPTkVOVF9TRUxFQ1RPUixcbiAgTkFNRV9TRUxFQ1RPUixcbiAgRE9NX1NFTEVDVE9SXG59IGZyb20gJy4vY29uc3RzJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBnZXRTZWxlY3RvclR5cGVPclRocm93IChzZWxlY3RvcjogU2VsZWN0b3IsIG1ldGhvZE5hbWU6IHN0cmluZyk6IHN0cmluZyB8IHZvaWQge1xuICBpZiAoaXNEb21TZWxlY3RvcihzZWxlY3RvcikpIHJldHVybiBET01fU0VMRUNUT1JcbiAgaWYgKGlzTmFtZVNlbGVjdG9yKHNlbGVjdG9yKSkgcmV0dXJuIE5BTUVfU0VMRUNUT1JcbiAgaWYgKGlzVnVlQ29tcG9uZW50KHNlbGVjdG9yKSkgcmV0dXJuIENPTVBPTkVOVF9TRUxFQ1RPUlxuICBpZiAoaXNSZWZTZWxlY3RvcihzZWxlY3RvcikpIHJldHVybiBSRUZfU0VMRUNUT1JcblxuICB0aHJvd0Vycm9yKGB3cmFwcGVyLiR7bWV0aG9kTmFtZX0oKSBtdXN0IGJlIHBhc3NlZCBhIHZhbGlkIENTUyBzZWxlY3RvciwgVnVlIGNvbnN0cnVjdG9yLCBvciB2YWxpZCBmaW5kIG9wdGlvbiBvYmplY3RgKVxufVxuIiwiLy8gQGZsb3dcbmltcG9ydCB7XG4gIEZVTkNUSU9OQUxfT1BUSU9OUyxcbiAgVlVFX1ZFUlNJT05cbn0gZnJvbSAnLi9jb25zdHMnXG5pbXBvcnQge1xuICB0aHJvd0Vycm9yXG59IGZyb20gJ3NoYXJlZC91dGlsJ1xuXG5leHBvcnQgZnVuY3Rpb24gZmluZEFsbFZ1ZUNvbXBvbmVudHNGcm9tVm0gKFxuICB2bTogQ29tcG9uZW50LFxuICBjb21wb25lbnRzOiBBcnJheTxDb21wb25lbnQ+ID0gW11cbik6IEFycmF5PENvbXBvbmVudD4ge1xuICBjb21wb25lbnRzLnB1c2godm0pXG4gIHZtLiRjaGlsZHJlbi5mb3JFYWNoKChjaGlsZCkgPT4ge1xuICAgIGZpbmRBbGxWdWVDb21wb25lbnRzRnJvbVZtKGNoaWxkLCBjb21wb25lbnRzKVxuICB9KVxuXG4gIHJldHVybiBjb21wb25lbnRzXG59XG5cbmZ1bmN0aW9uIGZpbmRBbGxWdWVDb21wb25lbnRzRnJvbVZub2RlIChcbiAgdm5vZGU6IENvbXBvbmVudCxcbiAgY29tcG9uZW50czogQXJyYXk8Q29tcG9uZW50PiA9IFtdXG4pOiBBcnJheTxDb21wb25lbnQ+IHtcbiAgaWYgKHZub2RlLmNoaWxkKSB7XG4gICAgY29tcG9uZW50cy5wdXNoKHZub2RlLmNoaWxkKVxuICB9XG4gIGlmICh2bm9kZS5jaGlsZHJlbikge1xuICAgIHZub2RlLmNoaWxkcmVuLmZvckVhY2goKGNoaWxkKSA9PiB7XG4gICAgICBmaW5kQWxsVnVlQ29tcG9uZW50c0Zyb21Wbm9kZShjaGlsZCwgY29tcG9uZW50cylcbiAgICB9KVxuICB9XG5cbiAgcmV0dXJuIGNvbXBvbmVudHNcbn1cblxuZnVuY3Rpb24gZmluZEFsbEZ1bmN0aW9uYWxDb21wb25lbnRzRnJvbVZub2RlIChcbiAgdm5vZGU6IENvbXBvbmVudCxcbiAgY29tcG9uZW50czogQXJyYXk8Q29tcG9uZW50PiA9IFtdXG4pOiBBcnJheTxDb21wb25lbnQ+IHtcbiAgaWYgKHZub2RlW0ZVTkNUSU9OQUxfT1BUSU9OU10gfHwgdm5vZGUuZnVuY3Rpb25hbENvbnRleHQpIHtcbiAgICBjb21wb25lbnRzLnB1c2godm5vZGUpXG4gIH1cbiAgaWYgKHZub2RlLmNoaWxkcmVuKSB7XG4gICAgdm5vZGUuY2hpbGRyZW4uZm9yRWFjaCgoY2hpbGQpID0+IHtcbiAgICAgIGZpbmRBbGxGdW5jdGlvbmFsQ29tcG9uZW50c0Zyb21Wbm9kZShjaGlsZCwgY29tcG9uZW50cylcbiAgICB9KVxuICB9XG4gIHJldHVybiBjb21wb25lbnRzXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2bUN0b3JNYXRjaGVzTmFtZSAodm06IENvbXBvbmVudCwgbmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiAhISgodm0uJHZub2RlICYmIHZtLiR2bm9kZS5jb21wb25lbnRPcHRpb25zICYmXG4gICAgdm0uJHZub2RlLmNvbXBvbmVudE9wdGlvbnMuQ3Rvci5vcHRpb25zLm5hbWUgPT09IG5hbWUpIHx8XG4gICAgKHZtLl92bm9kZSAmJlxuICAgIHZtLl92bm9kZS5mdW5jdGlvbmFsT3B0aW9ucyAmJlxuICAgIHZtLl92bm9kZS5mdW5jdGlvbmFsT3B0aW9ucy5uYW1lID09PSBuYW1lKSB8fFxuICAgIHZtLiRvcHRpb25zICYmIHZtLiRvcHRpb25zLm5hbWUgPT09IG5hbWUgfHxcbiAgICB2bS5vcHRpb25zICYmIHZtLm9wdGlvbnMubmFtZSA9PT0gbmFtZSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHZtQ3Rvck1hdGNoZXNTZWxlY3RvciAoY29tcG9uZW50OiBDb21wb25lbnQsIHNlbGVjdG9yOiBPYmplY3QpIHtcbiAgY29uc3QgQ3RvciA9IHNlbGVjdG9yLl9DdG9yIHx8IChzZWxlY3Rvci5vcHRpb25zICYmIHNlbGVjdG9yLm9wdGlvbnMuX0N0b3IpXG4gIGlmICghQ3Rvcikge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG4gIGNvbnN0IEN0b3JzID0gT2JqZWN0LmtleXMoQ3RvcilcbiAgcmV0dXJuIEN0b3JzLnNvbWUoYyA9PiBDdG9yW2NdID09PSBjb21wb25lbnQuX19wcm90b19fLmNvbnN0cnVjdG9yKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdm1GdW5jdGlvbmFsQ3Rvck1hdGNoZXNTZWxlY3RvciAoY29tcG9uZW50OiBWTm9kZSwgQ3RvcjogT2JqZWN0KSB7XG4gIGlmIChWVUVfVkVSU0lPTiA8IDIuMykge1xuICAgIHRocm93RXJyb3IoJ2ZpbmQgZm9yIGZ1bmN0aW9uYWwgY29tcG9uZW50cyBpcyBub3Qgc3VwcG9ydCBpbiBWdWUgPCAyLjMnKVxuICB9XG5cbiAgaWYgKCFDdG9yKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICBpZiAoIWNvbXBvbmVudFtGVU5DVElPTkFMX09QVElPTlNdKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbiAgY29uc3QgQ3RvcnMgPSBPYmplY3Qua2V5cyhjb21wb25lbnRbRlVOQ1RJT05BTF9PUFRJT05TXS5fQ3RvcilcbiAgcmV0dXJuIEN0b3JzLnNvbWUoYyA9PiBDdG9yW2NdID09PSBjb21wb25lbnRbRlVOQ1RJT05BTF9PUFRJT05TXS5fQ3RvcltjXSlcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZmluZFZ1ZUNvbXBvbmVudHMgKFxuICByb290OiBDb21wb25lbnQsXG4gIHNlbGVjdG9yVHlwZTogP3N0cmluZyxcbiAgc2VsZWN0b3I6IE9iamVjdFxuKTogQXJyYXk8Q29tcG9uZW50PiB7XG4gIGlmIChzZWxlY3Rvci5mdW5jdGlvbmFsKSB7XG4gICAgY29uc3Qgbm9kZXMgPSByb290Ll92bm9kZVxuICAgICAgPyBmaW5kQWxsRnVuY3Rpb25hbENvbXBvbmVudHNGcm9tVm5vZGUocm9vdC5fdm5vZGUpXG4gICAgICA6IGZpbmRBbGxGdW5jdGlvbmFsQ29tcG9uZW50c0Zyb21Wbm9kZShyb290KVxuICAgIHJldHVybiBub2Rlcy5maWx0ZXIobm9kZSA9PlxuICAgICAgdm1GdW5jdGlvbmFsQ3Rvck1hdGNoZXNTZWxlY3Rvcihub2RlLCBzZWxlY3Rvci5fQ3RvcikgfHxcbiAgICAgIG5vZGVbRlVOQ1RJT05BTF9PUFRJT05TXS5uYW1lID09PSBzZWxlY3Rvci5uYW1lXG4gICAgKVxuICB9XG4gIGNvbnN0IG5hbWVTZWxlY3RvciA9IHR5cGVvZiBzZWxlY3RvciA9PT0gJ2Z1bmN0aW9uJyA/IHNlbGVjdG9yLm9wdGlvbnMubmFtZSA6IHNlbGVjdG9yLm5hbWVcbiAgY29uc3QgY29tcG9uZW50cyA9IHJvb3QuX2lzVnVlXG4gICAgPyBmaW5kQWxsVnVlQ29tcG9uZW50c0Zyb21WbShyb290KVxuICAgIDogZmluZEFsbFZ1ZUNvbXBvbmVudHNGcm9tVm5vZGUocm9vdClcbiAgcmV0dXJuIGNvbXBvbmVudHMuZmlsdGVyKChjb21wb25lbnQpID0+IHtcbiAgICBpZiAoIWNvbXBvbmVudC4kdm5vZGUgJiYgIWNvbXBvbmVudC4kb3B0aW9ucy5leHRlbmRzKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gICAgcmV0dXJuIHZtQ3Rvck1hdGNoZXNTZWxlY3Rvcihjb21wb25lbnQsIHNlbGVjdG9yKSB8fCB2bUN0b3JNYXRjaGVzTmFtZShjb21wb25lbnQsIG5hbWVTZWxlY3RvcilcbiAgfSlcbn1cbiIsIi8vIEBmbG93XG5cbmltcG9ydCB0eXBlIFdyYXBwZXIgZnJvbSAnLi93cmFwcGVyJ1xuaW1wb3J0IHR5cGUgVnVlV3JhcHBlciBmcm9tICcuL3Z1ZS13cmFwcGVyJ1xuaW1wb3J0IHtcbiAgdGhyb3dFcnJvcixcbiAgd2FyblxufSBmcm9tICdzaGFyZWQvdXRpbCdcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgV3JhcHBlckFycmF5IGltcGxlbWVudHMgQmFzZVdyYXBwZXIge1xuICB3cmFwcGVyczogQXJyYXk8V3JhcHBlciB8IFZ1ZVdyYXBwZXI+O1xuICBsZW5ndGg6IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvciAod3JhcHBlcnM6IEFycmF5PFdyYXBwZXIgfCBWdWVXcmFwcGVyPikge1xuICAgIHRoaXMud3JhcHBlcnMgPSB3cmFwcGVycyB8fCBbXVxuICAgIHRoaXMubGVuZ3RoID0gdGhpcy53cmFwcGVycy5sZW5ndGhcbiAgfVxuXG4gIGF0IChpbmRleDogbnVtYmVyKTogV3JhcHBlciB8IFZ1ZVdyYXBwZXIge1xuICAgIGlmIChpbmRleCA+IHRoaXMubGVuZ3RoIC0gMSkge1xuICAgICAgdGhyb3dFcnJvcihgbm8gaXRlbSBleGlzdHMgYXQgJHtpbmRleH1gKVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy53cmFwcGVyc1tpbmRleF1cbiAgfVxuXG4gIGF0dHJpYnV0ZXMgKCk6IHZvaWQge1xuICAgIHRoaXMudGhyb3dFcnJvcklmV3JhcHBlcnNJc0VtcHR5KCdhdHRyaWJ1dGVzJylcblxuICAgIHRocm93RXJyb3IoJ2F0dHJpYnV0ZXMgbXVzdCBiZSBjYWxsZWQgb24gYSBzaW5nbGUgd3JhcHBlciwgdXNlIGF0KGkpIHRvIGFjY2VzcyBhIHdyYXBwZXInKVxuICB9XG5cbiAgY2xhc3NlcyAoKTogdm9pZCB7XG4gICAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ2NsYXNzZXMnKVxuXG4gICAgdGhyb3dFcnJvcignY2xhc3NlcyBtdXN0IGJlIGNhbGxlZCBvbiBhIHNpbmdsZSB3cmFwcGVyLCB1c2UgYXQoaSkgdG8gYWNjZXNzIGEgd3JhcHBlcicpXG4gIH1cblxuICBjb250YWlucyAoc2VsZWN0b3I6IFNlbGVjdG9yKTogYm9vbGVhbiB7XG4gICAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ2NvbnRhaW5zJylcblxuICAgIHJldHVybiB0aGlzLndyYXBwZXJzLmV2ZXJ5KHdyYXBwZXIgPT4gd3JhcHBlci5jb250YWlucyhzZWxlY3RvcikpXG4gIH1cblxuICBleGlzdHMgKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmxlbmd0aCA+IDAgJiYgdGhpcy53cmFwcGVycy5ldmVyeSh3cmFwcGVyID0+IHdyYXBwZXIuZXhpc3RzKCkpXG4gIH1cblxuICBmaWx0ZXIgKHByZWRpY2F0ZTogRnVuY3Rpb24pOiBXcmFwcGVyQXJyYXkge1xuICAgIHJldHVybiBuZXcgV3JhcHBlckFycmF5KHRoaXMud3JhcHBlcnMuZmlsdGVyKHByZWRpY2F0ZSkpXG4gIH1cblxuICB2aXNpYmxlICgpOiBib29sZWFuIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgndmlzaWJsZScpXG5cbiAgICByZXR1cm4gdGhpcy5sZW5ndGggPiAwICYmIHRoaXMud3JhcHBlcnMuZXZlcnkod3JhcHBlciA9PiB3cmFwcGVyLnZpc2libGUoKSlcbiAgfVxuXG4gIGVtaXR0ZWQgKCk6IHZvaWQge1xuICAgIHRoaXMudGhyb3dFcnJvcklmV3JhcHBlcnNJc0VtcHR5KCdlbWl0dGVkJylcblxuICAgIHRocm93RXJyb3IoJ2VtaXR0ZWQgbXVzdCBiZSBjYWxsZWQgb24gYSBzaW5nbGUgd3JhcHBlciwgdXNlIGF0KGkpIHRvIGFjY2VzcyBhIHdyYXBwZXInKVxuICB9XG5cbiAgZW1pdHRlZEJ5T3JkZXIgKCk6IHZvaWQge1xuICAgIHRoaXMudGhyb3dFcnJvcklmV3JhcHBlcnNJc0VtcHR5KCdlbWl0dGVkQnlPcmRlcicpXG5cbiAgICB0aHJvd0Vycm9yKCdlbWl0dGVkQnlPcmRlciBtdXN0IGJlIGNhbGxlZCBvbiBhIHNpbmdsZSB3cmFwcGVyLCB1c2UgYXQoaSkgdG8gYWNjZXNzIGEgd3JhcHBlcicpXG4gIH1cblxuICBoYXNBdHRyaWJ1dGUgKGF0dHJpYnV0ZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ2hhc0F0dHJpYnV0ZScpXG5cbiAgICByZXR1cm4gdGhpcy53cmFwcGVycy5ldmVyeSh3cmFwcGVyID0+IHdyYXBwZXIuaGFzQXR0cmlidXRlKGF0dHJpYnV0ZSwgdmFsdWUpKVxuICB9XG5cbiAgaGFzQ2xhc3MgKGNsYXNzTmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ2hhc0NsYXNzJylcblxuICAgIHJldHVybiB0aGlzLndyYXBwZXJzLmV2ZXJ5KHdyYXBwZXIgPT4gd3JhcHBlci5oYXNDbGFzcyhjbGFzc05hbWUpKVxuICB9XG5cbiAgaGFzUHJvcCAocHJvcDogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ2hhc1Byb3AnKVxuXG4gICAgcmV0dXJuIHRoaXMud3JhcHBlcnMuZXZlcnkod3JhcHBlciA9PiB3cmFwcGVyLmhhc1Byb3AocHJvcCwgdmFsdWUpKVxuICB9XG5cbiAgaGFzU3R5bGUgKHN0eWxlOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgnaGFzU3R5bGUnKVxuXG4gICAgcmV0dXJuIHRoaXMud3JhcHBlcnMuZXZlcnkod3JhcHBlciA9PiB3cmFwcGVyLmhhc1N0eWxlKHN0eWxlLCB2YWx1ZSkpXG4gIH1cblxuICBmaW5kQWxsICgpOiB2b2lkIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgnZmluZEFsbCcpXG5cbiAgICB0aHJvd0Vycm9yKCdmaW5kQWxsIG11c3QgYmUgY2FsbGVkIG9uIGEgc2luZ2xlIHdyYXBwZXIsIHVzZSBhdChpKSB0byBhY2Nlc3MgYSB3cmFwcGVyJylcbiAgfVxuXG4gIGZpbmQgKCk6IHZvaWQge1xuICAgIHRoaXMudGhyb3dFcnJvcklmV3JhcHBlcnNJc0VtcHR5KCdmaW5kJylcblxuICAgIHRocm93RXJyb3IoJ2ZpbmQgbXVzdCBiZSBjYWxsZWQgb24gYSBzaW5nbGUgd3JhcHBlciwgdXNlIGF0KGkpIHRvIGFjY2VzcyBhIHdyYXBwZXInKVxuICB9XG5cbiAgaHRtbCAoKTogdm9pZCB7XG4gICAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ2h0bWwnKVxuXG4gICAgdGhyb3dFcnJvcignaHRtbCBtdXN0IGJlIGNhbGxlZCBvbiBhIHNpbmdsZSB3cmFwcGVyLCB1c2UgYXQoaSkgdG8gYWNjZXNzIGEgd3JhcHBlcicpXG4gIH1cblxuICBpcyAoc2VsZWN0b3I6IFNlbGVjdG9yKTogYm9vbGVhbiB7XG4gICAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ2lzJylcblxuICAgIHJldHVybiB0aGlzLndyYXBwZXJzLmV2ZXJ5KHdyYXBwZXIgPT4gd3JhcHBlci5pcyhzZWxlY3RvcikpXG4gIH1cblxuICBpc0VtcHR5ICgpOiBib29sZWFuIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgnaXNFbXB0eScpXG5cbiAgICByZXR1cm4gdGhpcy53cmFwcGVycy5ldmVyeSh3cmFwcGVyID0+IHdyYXBwZXIuaXNFbXB0eSgpKVxuICB9XG5cbiAgaXNWaXNpYmxlICgpOiBib29sZWFuIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgnaXNWaXNpYmxlJylcblxuICAgIHJldHVybiB0aGlzLndyYXBwZXJzLmV2ZXJ5KHdyYXBwZXIgPT4gd3JhcHBlci5pc1Zpc2libGUoKSlcbiAgfVxuXG4gIGlzVnVlSW5zdGFuY2UgKCk6IGJvb2xlYW4ge1xuICAgIHRoaXMudGhyb3dFcnJvcklmV3JhcHBlcnNJc0VtcHR5KCdpc1Z1ZUluc3RhbmNlJylcblxuICAgIHJldHVybiB0aGlzLndyYXBwZXJzLmV2ZXJ5KHdyYXBwZXIgPT4gd3JhcHBlci5pc1Z1ZUluc3RhbmNlKCkpXG4gIH1cblxuICBuYW1lICgpOiB2b2lkIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgnbmFtZScpXG5cbiAgICB0aHJvd0Vycm9yKCduYW1lIG11c3QgYmUgY2FsbGVkIG9uIGEgc2luZ2xlIHdyYXBwZXIsIHVzZSBhdChpKSB0byBhY2Nlc3MgYSB3cmFwcGVyJylcbiAgfVxuXG4gIHByb3BzICgpOiB2b2lkIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgncHJvcHMnKVxuXG4gICAgdGhyb3dFcnJvcigncHJvcHMgbXVzdCBiZSBjYWxsZWQgb24gYSBzaW5nbGUgd3JhcHBlciwgdXNlIGF0KGkpIHRvIGFjY2VzcyBhIHdyYXBwZXInKVxuICB9XG5cbiAgdGV4dCAoKTogdm9pZCB7XG4gICAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ3RleHQnKVxuXG4gICAgdGhyb3dFcnJvcigndGV4dCBtdXN0IGJlIGNhbGxlZCBvbiBhIHNpbmdsZSB3cmFwcGVyLCB1c2UgYXQoaSkgdG8gYWNjZXNzIGEgd3JhcHBlcicpXG4gIH1cblxuICB0aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkgKG1ldGhvZDogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKHRoaXMud3JhcHBlcnMubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aHJvd0Vycm9yKGAke21ldGhvZH0gY2Fubm90IGJlIGNhbGxlZCBvbiAwIGl0ZW1zYClcbiAgICB9XG4gIH1cblxuICBzZXRDb21wdXRlZCAoY29tcHV0ZWQ6IE9iamVjdCk6IHZvaWQge1xuICAgIHRoaXMudGhyb3dFcnJvcklmV3JhcHBlcnNJc0VtcHR5KCdzZXRDb21wdXRlZCcpXG5cbiAgICB0aGlzLndyYXBwZXJzLmZvckVhY2god3JhcHBlciA9PiB3cmFwcGVyLnNldENvbXB1dGVkKGNvbXB1dGVkKSlcbiAgfVxuXG4gIHNldERhdGEgKGRhdGE6IE9iamVjdCk6IHZvaWQge1xuICAgIHRoaXMudGhyb3dFcnJvcklmV3JhcHBlcnNJc0VtcHR5KCdzZXREYXRhJylcblxuICAgIHRoaXMud3JhcHBlcnMuZm9yRWFjaCh3cmFwcGVyID0+IHdyYXBwZXIuc2V0RGF0YShkYXRhKSlcbiAgfVxuXG4gIHNldE1ldGhvZHMgKHByb3BzOiBPYmplY3QpOiB2b2lkIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgnc2V0TWV0aG9kcycpXG5cbiAgICB0aGlzLndyYXBwZXJzLmZvckVhY2god3JhcHBlciA9PiB3cmFwcGVyLnNldE1ldGhvZHMocHJvcHMpKVxuICB9XG5cbiAgc2V0UHJvcHMgKHByb3BzOiBPYmplY3QpOiB2b2lkIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgnc2V0UHJvcHMnKVxuXG4gICAgdGhpcy53cmFwcGVycy5mb3JFYWNoKHdyYXBwZXIgPT4gd3JhcHBlci5zZXRQcm9wcyhwcm9wcykpXG4gIH1cblxuICB0cmlnZ2VyIChldmVudDogc3RyaW5nLCBvcHRpb25zOiBPYmplY3QpOiB2b2lkIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgndHJpZ2dlcicpXG5cbiAgICB0aGlzLndyYXBwZXJzLmZvckVhY2god3JhcHBlciA9PiB3cmFwcGVyLnRyaWdnZXIoZXZlbnQsIG9wdGlvbnMpKVxuICB9XG5cbiAgdXBkYXRlICgpOiB2b2lkIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgndXBkYXRlJylcbiAgICB3YXJuKCd1cGRhdGUgaGFzIGJlZW4gcmVtb3ZlZC4gQWxsIGNoYW5nZXMgYXJlIG5vdyBzeW5jaHJub3VzIHdpdGhvdXQgY2FsbGluZyB1cGRhdGUnKVxuICB9XG5cbiAgZGVzdHJveSAoKTogdm9pZCB7XG4gICAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ2Rlc3Ryb3knKVxuXG4gICAgdGhpcy53cmFwcGVycy5mb3JFYWNoKHdyYXBwZXIgPT4gd3JhcHBlci5kZXN0cm95KCkpXG4gIH1cbn1cbiIsIi8vIEBmbG93XG5cbmltcG9ydCB7IHRocm93RXJyb3IgfSBmcm9tICdzaGFyZWQvdXRpbCdcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRXJyb3JXcmFwcGVyIGltcGxlbWVudHMgQmFzZVdyYXBwZXIge1xuICBzZWxlY3Rvcjogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yIChzZWxlY3Rvcjogc3RyaW5nKSB7XG4gICAgdGhpcy5zZWxlY3RvciA9IHNlbGVjdG9yXG4gIH1cblxuICBhdCAoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihgZmluZCBkaWQgbm90IHJldHVybiAke3RoaXMuc2VsZWN0b3J9LCBjYW5ub3QgY2FsbCBhdCgpIG9uIGVtcHR5IFdyYXBwZXJgKVxuICB9XG5cbiAgYXR0cmlidXRlcyAoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihgZmluZCBkaWQgbm90IHJldHVybiAke3RoaXMuc2VsZWN0b3J9LCBjYW5ub3QgY2FsbCBhdHRyaWJ1dGVzKCkgb24gZW1wdHkgV3JhcHBlcmApXG4gIH1cblxuICBjbGFzc2VzICgpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKGBmaW5kIGRpZCBub3QgcmV0dXJuICR7dGhpcy5zZWxlY3Rvcn0sIGNhbm5vdCBjYWxsIGNsYXNzZXMoKSBvbiBlbXB0eSBXcmFwcGVyYClcbiAgfVxuXG4gIGNvbnRhaW5zICgpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKGBmaW5kIGRpZCBub3QgcmV0dXJuICR7dGhpcy5zZWxlY3Rvcn0sIGNhbm5vdCBjYWxsIGNvbnRhaW5zKCkgb24gZW1wdHkgV3JhcHBlcmApXG4gIH1cblxuICBlbWl0dGVkICgpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKGBmaW5kIGRpZCBub3QgcmV0dXJuICR7dGhpcy5zZWxlY3Rvcn0sIGNhbm5vdCBjYWxsIGVtaXR0ZWQoKSBvbiBlbXB0eSBXcmFwcGVyYClcbiAgfVxuXG4gIGVtaXR0ZWRCeU9yZGVyICgpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKGBmaW5kIGRpZCBub3QgcmV0dXJuICR7dGhpcy5zZWxlY3Rvcn0sIGNhbm5vdCBjYWxsIGVtaXR0ZWRCeU9yZGVyKCkgb24gZW1wdHkgV3JhcHBlcmApXG4gIH1cblxuICBleGlzdHMgKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgZmlsdGVyICgpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKGBmaW5kIGRpZCBub3QgcmV0dXJuICR7dGhpcy5zZWxlY3Rvcn0sIGNhbm5vdCBjYWxsIGZpbHRlcigpIG9uIGVtcHR5IFdyYXBwZXJgKVxuICB9XG5cbiAgdmlzaWJsZSAoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihgZmluZCBkaWQgbm90IHJldHVybiAke3RoaXMuc2VsZWN0b3J9LCBjYW5ub3QgY2FsbCB2aXNpYmxlKCkgb24gZW1wdHkgV3JhcHBlcmApXG4gIH1cblxuICBoYXNBdHRyaWJ1dGUgKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoYGZpbmQgZGlkIG5vdCByZXR1cm4gJHt0aGlzLnNlbGVjdG9yfSwgY2Fubm90IGNhbGwgaGFzQXR0cmlidXRlKCkgb24gZW1wdHkgV3JhcHBlcmApXG4gIH1cblxuICBoYXNDbGFzcyAoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihgZmluZCBkaWQgbm90IHJldHVybiAke3RoaXMuc2VsZWN0b3J9LCBjYW5ub3QgY2FsbCBoYXNDbGFzcygpIG9uIGVtcHR5IFdyYXBwZXJgKVxuICB9XG5cbiAgaGFzUHJvcCAoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihgZmluZCBkaWQgbm90IHJldHVybiAke3RoaXMuc2VsZWN0b3J9LCBjYW5ub3QgY2FsbCBoYXNQcm9wKCkgb24gZW1wdHkgV3JhcHBlcmApXG4gIH1cblxuICBoYXNTdHlsZSAoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihgZmluZCBkaWQgbm90IHJldHVybiAke3RoaXMuc2VsZWN0b3J9LCBjYW5ub3QgY2FsbCBoYXNTdHlsZSgpIG9uIGVtcHR5IFdyYXBwZXJgKVxuICB9XG5cbiAgZmluZEFsbCAoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihgZmluZCBkaWQgbm90IHJldHVybiAke3RoaXMuc2VsZWN0b3J9LCBjYW5ub3QgY2FsbCBmaW5kQWxsKCkgb24gZW1wdHkgV3JhcHBlcmApXG4gIH1cblxuICBmaW5kICgpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKGBmaW5kIGRpZCBub3QgcmV0dXJuICR7dGhpcy5zZWxlY3Rvcn0sIGNhbm5vdCBjYWxsIGZpbmQoKSBvbiBlbXB0eSBXcmFwcGVyYClcbiAgfVxuXG4gIGh0bWwgKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoYGZpbmQgZGlkIG5vdCByZXR1cm4gJHt0aGlzLnNlbGVjdG9yfSwgY2Fubm90IGNhbGwgaHRtbCgpIG9uIGVtcHR5IFdyYXBwZXJgKVxuICB9XG5cbiAgaXMgKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoYGZpbmQgZGlkIG5vdCByZXR1cm4gJHt0aGlzLnNlbGVjdG9yfSwgY2Fubm90IGNhbGwgaXMoKSBvbiBlbXB0eSBXcmFwcGVyYClcbiAgfVxuXG4gIGlzRW1wdHkgKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoYGZpbmQgZGlkIG5vdCByZXR1cm4gJHt0aGlzLnNlbGVjdG9yfSwgY2Fubm90IGNhbGwgaXNFbXB0eSgpIG9uIGVtcHR5IFdyYXBwZXJgKVxuICB9XG5cbiAgaXNWaXNpYmxlICgpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKGBmaW5kIGRpZCBub3QgcmV0dXJuICR7dGhpcy5zZWxlY3Rvcn0sIGNhbm5vdCBjYWxsIGlzVmlzaWJsZSgpIG9uIGVtcHR5IFdyYXBwZXJgKVxuICB9XG5cbiAgaXNWdWVJbnN0YW5jZSAoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihgZmluZCBkaWQgbm90IHJldHVybiAke3RoaXMuc2VsZWN0b3J9LCBjYW5ub3QgY2FsbCBpc1Z1ZUluc3RhbmNlKCkgb24gZW1wdHkgV3JhcHBlcmApXG4gIH1cblxuICBuYW1lICgpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKGBmaW5kIGRpZCBub3QgcmV0dXJuICR7dGhpcy5zZWxlY3Rvcn0sIGNhbm5vdCBjYWxsIG5hbWUoKSBvbiBlbXB0eSBXcmFwcGVyYClcbiAgfVxuXG4gIHByb3BzICgpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKGBmaW5kIGRpZCBub3QgcmV0dXJuICR7dGhpcy5zZWxlY3Rvcn0sIGNhbm5vdCBjYWxsIHByb3BzKCkgb24gZW1wdHkgV3JhcHBlcmApXG4gIH1cblxuICB0ZXh0ICgpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKGBmaW5kIGRpZCBub3QgcmV0dXJuICR7dGhpcy5zZWxlY3Rvcn0sIGNhbm5vdCBjYWxsIHRleHQoKSBvbiBlbXB0eSBXcmFwcGVyYClcbiAgfVxuXG4gIHNldENvbXB1dGVkICgpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKGBmaW5kIGRpZCBub3QgcmV0dXJuICR7dGhpcy5zZWxlY3Rvcn0sIGNhbm5vdCBjYWxsIHNldENvbXB1dGVkKCkgb24gZW1wdHkgV3JhcHBlcmApXG4gIH1cblxuICBzZXREYXRhICgpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKGBmaW5kIGRpZCBub3QgcmV0dXJuICR7dGhpcy5zZWxlY3Rvcn0sIGNhbm5vdCBjYWxsIHNldERhdGEoKSBvbiBlbXB0eSBXcmFwcGVyYClcbiAgfVxuXG4gIHNldE1ldGhvZHMgKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoYGZpbmQgZGlkIG5vdCByZXR1cm4gJHt0aGlzLnNlbGVjdG9yfSwgY2Fubm90IGNhbGwgc2V0TWV0aG9kcygpIG9uIGVtcHR5IFdyYXBwZXJgKVxuICB9XG5cbiAgc2V0UHJvcHMgKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoYGZpbmQgZGlkIG5vdCByZXR1cm4gJHt0aGlzLnNlbGVjdG9yfSwgY2Fubm90IGNhbGwgc2V0UHJvcHMoKSBvbiBlbXB0eSBXcmFwcGVyYClcbiAgfVxuXG4gIHRyaWdnZXIgKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoYGZpbmQgZGlkIG5vdCByZXR1cm4gJHt0aGlzLnNlbGVjdG9yfSwgY2Fubm90IGNhbGwgdHJpZ2dlcigpIG9uIGVtcHR5IFdyYXBwZXJgKVxuICB9XG5cbiAgdXBkYXRlICgpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKGB1cGRhdGUgaGFzIGJlZW4gcmVtb3ZlZCBmcm9tIHZ1ZS10ZXN0LXV0aWxzLiBBbGwgdXBkYXRlcyBhcmUgbm93IHN5bmNocm9ub3VzIGJ5IGRlZmF1bHRgKVxuICB9XG5cbiAgZGVzdHJveSAoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihgZmluZCBkaWQgbm90IHJldHVybiAke3RoaXMuc2VsZWN0b3J9LCBjYW5ub3QgY2FsbCBkZXN0cm95KCkgb24gZW1wdHkgV3JhcHBlcmApXG4gIH1cbn1cbiIsIi8vIEBmbG93XG5cbmltcG9ydCB7XG4gIFJFRl9TRUxFQ1RPUlxufSBmcm9tICcuL2NvbnN0cydcbmltcG9ydCB7XG4gIHRocm93RXJyb3Jcbn0gZnJvbSAnc2hhcmVkL3V0aWwnXG5cbmZ1bmN0aW9uIGZpbmRBbGxWTm9kZXMgKHZub2RlOiBWTm9kZSwgbm9kZXM6IEFycmF5PFZOb2RlPiA9IFtdKTogQXJyYXk8Vk5vZGU+IHtcbiAgbm9kZXMucHVzaCh2bm9kZSlcblxuICBpZiAoQXJyYXkuaXNBcnJheSh2bm9kZS5jaGlsZHJlbikpIHtcbiAgICB2bm9kZS5jaGlsZHJlbi5mb3JFYWNoKChjaGlsZFZOb2RlKSA9PiB7XG4gICAgICBmaW5kQWxsVk5vZGVzKGNoaWxkVk5vZGUsIG5vZGVzKVxuICAgIH0pXG4gIH1cblxuICBpZiAodm5vZGUuY2hpbGQpIHtcbiAgICBmaW5kQWxsVk5vZGVzKHZub2RlLmNoaWxkLl92bm9kZSwgbm9kZXMpXG4gIH1cblxuICByZXR1cm4gbm9kZXNcbn1cblxuZnVuY3Rpb24gcmVtb3ZlRHVwbGljYXRlTm9kZXMgKHZOb2RlczogQXJyYXk8Vk5vZGU+KTogQXJyYXk8Vk5vZGU+IHtcbiAgcmV0dXJuIHZOb2Rlcy5maWx0ZXIoKHZOb2RlLCBpbmRleCkgPT4gaW5kZXggPT09IHZOb2Rlcy5maW5kSW5kZXgobm9kZSA9PiB2Tm9kZS5lbG0gPT09IG5vZGUuZWxtKSlcbn1cblxuZnVuY3Rpb24gbm9kZU1hdGNoZXNSZWYgKG5vZGU6IFZOb2RlLCByZWZOYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIG5vZGUuZGF0YSAmJiBub2RlLmRhdGEucmVmID09PSByZWZOYW1lXG59XG5cbmZ1bmN0aW9uIGZpbmRWTm9kZXNCeVJlZiAodk5vZGU6IFZOb2RlLCByZWZOYW1lOiBzdHJpbmcpOiBBcnJheTxWTm9kZT4ge1xuICBjb25zdCBub2RlcyA9IGZpbmRBbGxWTm9kZXModk5vZGUpXG4gIGNvbnN0IHJlZkZpbHRlcmVkTm9kZXMgPSBub2Rlcy5maWx0ZXIobm9kZSA9PiBub2RlTWF0Y2hlc1JlZihub2RlLCByZWZOYW1lKSlcbiAgLy8gT25seSByZXR1cm4gcmVmcyBkZWZpbmVkIG9uIHRvcC1sZXZlbCBWTm9kZSB0byBwcm92aWRlIHRoZSBzYW1lXG4gIC8vIGJlaGF2aW9yIGFzIHNlbGVjdGluZyB2aWEgdm0uJHJlZi57c29tZVJlZk5hbWV9XG4gIGNvbnN0IG1haW5WTm9kZUZpbHRlcmVkTm9kZXMgPSByZWZGaWx0ZXJlZE5vZGVzLmZpbHRlcihub2RlID0+IChcbiAgICAhIXZOb2RlLmNvbnRleHQuJHJlZnNbbm9kZS5kYXRhLnJlZl1cbiAgKSlcbiAgcmV0dXJuIHJlbW92ZUR1cGxpY2F0ZU5vZGVzKG1haW5WTm9kZUZpbHRlcmVkTm9kZXMpXG59XG5cbmZ1bmN0aW9uIG5vZGVNYXRjaGVzU2VsZWN0b3IgKG5vZGU6IFZOb2RlLCBzZWxlY3Rvcjogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiBub2RlLmVsbSAmJiBub2RlLmVsbS5nZXRBdHRyaWJ1dGUgJiYgbm9kZS5lbG0ubWF0Y2hlcyhzZWxlY3Rvcilcbn1cblxuZnVuY3Rpb24gZmluZFZOb2Rlc0J5U2VsZWN0b3IgKFxuICB2Tm9kZTogVk5vZGUsXG4gIHNlbGVjdG9yOiBzdHJpbmdcbik6IEFycmF5PFZOb2RlPiB7XG4gIGNvbnN0IG5vZGVzID0gZmluZEFsbFZOb2Rlcyh2Tm9kZSlcbiAgY29uc3QgZmlsdGVyZWROb2RlcyA9IG5vZGVzLmZpbHRlcihub2RlID0+IChcbiAgICBub2RlTWF0Y2hlc1NlbGVjdG9yKG5vZGUsIHNlbGVjdG9yKVxuICApKVxuICByZXR1cm4gcmVtb3ZlRHVwbGljYXRlTm9kZXMoZmlsdGVyZWROb2Rlcylcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZmluZFZub2RlcyAoXG4gIHZub2RlOiBWTm9kZSxcbiAgdm06IENvbXBvbmVudCB8IG51bGwsXG4gIHNlbGVjdG9yVHlwZTogP3N0cmluZyxcbiAgc2VsZWN0b3I6IE9iamVjdCB8IHN0cmluZ1xuKTogQXJyYXk8Vk5vZGU+IHtcbiAgaWYgKHNlbGVjdG9yVHlwZSA9PT0gUkVGX1NFTEVDVE9SKSB7XG4gICAgaWYgKCF2bSkge1xuICAgICAgdGhyb3dFcnJvcignJHJlZiBzZWxlY3RvcnMgY2FuIG9ubHkgYmUgdXNlZCBvbiBWdWUgY29tcG9uZW50IHdyYXBwZXJzJylcbiAgICB9XG4gICAgLy8gJEZsb3dJZ25vcmVcbiAgICByZXR1cm4gZmluZFZOb2Rlc0J5UmVmKHZub2RlLCBzZWxlY3Rvci5yZWYpXG4gIH1cbiAgLy8gJEZsb3dJZ25vcmVcbiAgcmV0dXJuIGZpbmRWTm9kZXNCeVNlbGVjdG9yKHZub2RlLCBzZWxlY3Rvcilcbn1cbiIsIi8vIEBmbG93XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGZpbmRET01Ob2RlcyAoXG4gIGVsZW1lbnQ6IEVsZW1lbnQgfCBudWxsLFxuICBzZWxlY3Rvcjogc3RyaW5nXG4pOiBBcnJheTxWTm9kZT4ge1xuICBjb25zdCBub2RlcyA9IFtdXG4gIGlmICghZWxlbWVudCB8fCAhZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsIHx8ICFlbGVtZW50Lm1hdGNoZXMpIHtcbiAgICByZXR1cm4gbm9kZXNcbiAgfVxuXG4gIGlmIChlbGVtZW50Lm1hdGNoZXMoc2VsZWN0b3IpKSB7XG4gICAgbm9kZXMucHVzaChlbGVtZW50KVxuICB9XG4gIC8vICRGbG93SWdub3JlXG4gIHJldHVybiBub2Rlcy5jb25jYXQoW10uc2xpY2UuY2FsbChlbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpKSlcbn1cbiIsIi8vIEBmbG93XG5cbmltcG9ydCBmaW5kVm5vZGVzIGZyb20gJy4vZmluZC12bm9kZXMnXG5pbXBvcnQgZmluZFZ1ZUNvbXBvbmVudHMgZnJvbSAnLi9maW5kLXZ1ZS1jb21wb25lbnRzJ1xuaW1wb3J0IGZpbmRET01Ob2RlcyBmcm9tICcuL2ZpbmQtZG9tLW5vZGVzJ1xuaW1wb3J0IHtcbiAgQ09NUE9ORU5UX1NFTEVDVE9SLFxuICBOQU1FX1NFTEVDVE9SLFxuICBET01fU0VMRUNUT1Jcbn0gZnJvbSAnLi9jb25zdHMnXG5pbXBvcnQgVnVlIGZyb20gJ3Z1ZSdcbmltcG9ydCBnZXRTZWxlY3RvclR5cGVPclRocm93IGZyb20gJy4vZ2V0LXNlbGVjdG9yLXR5cGUnXG5pbXBvcnQgeyB0aHJvd0Vycm9yIH0gZnJvbSAnc2hhcmVkL3V0aWwnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGZpbmQgKFxuICB2bTogQ29tcG9uZW50IHwgbnVsbCxcbiAgdm5vZGU6IFZOb2RlIHwgbnVsbCxcbiAgZWxlbWVudDogRWxlbWVudCxcbiAgc2VsZWN0b3I6IFNlbGVjdG9yXG4pOiBBcnJheTxWTm9kZSB8IENvbXBvbmVudD4ge1xuICBjb25zdCBzZWxlY3RvclR5cGUgPSBnZXRTZWxlY3RvclR5cGVPclRocm93KHNlbGVjdG9yLCAnZmluZCcpXG5cbiAgaWYgKCF2bm9kZSAmJiAhdm0gJiYgc2VsZWN0b3JUeXBlICE9PSBET01fU0VMRUNUT1IpIHtcbiAgICB0aHJvd0Vycm9yKCdjYW5ub3QgZmluZCBhIFZ1ZSBpbnN0YW5jZSBvbiBhIERPTSBub2RlLiBUaGUgbm9kZSB5b3UgYXJlIGNhbGxpbmcgZmluZCBvbiBkb2VzIG5vdCBleGlzdCBpbiB0aGUgVkRvbS4gQXJlIHlvdSBhZGRpbmcgdGhlIG5vZGUgYXMgaW5uZXJIVE1MPycpXG4gIH1cblxuICBpZiAoc2VsZWN0b3JUeXBlID09PSBDT01QT05FTlRfU0VMRUNUT1IgfHwgc2VsZWN0b3JUeXBlID09PSBOQU1FX1NFTEVDVE9SKSB7XG4gICAgY29uc3Qgcm9vdCA9IHZtIHx8IHZub2RlXG4gICAgaWYgKCFyb290KSB7XG4gICAgICByZXR1cm4gW11cbiAgICB9XG4gICAgcmV0dXJuIGZpbmRWdWVDb21wb25lbnRzKHJvb3QsIHNlbGVjdG9yVHlwZSwgc2VsZWN0b3IpXG4gIH1cblxuICBpZiAodm0gJiYgdm0uJHJlZnMgJiYgc2VsZWN0b3IucmVmIGluIHZtLiRyZWZzICYmIHZtLiRyZWZzW3NlbGVjdG9yLnJlZl0gaW5zdGFuY2VvZiBWdWUpIHtcbiAgICByZXR1cm4gW3ZtLiRyZWZzW3NlbGVjdG9yLnJlZl1dXG4gIH1cblxuICBpZiAodm5vZGUpIHtcbiAgICBjb25zdCBub2RlcyA9IGZpbmRWbm9kZXModm5vZGUsIHZtLCBzZWxlY3RvclR5cGUsIHNlbGVjdG9yKVxuICAgIGlmIChzZWxlY3RvclR5cGUgIT09IERPTV9TRUxFQ1RPUikge1xuICAgICAgcmV0dXJuIG5vZGVzXG4gICAgfVxuICAgIHJldHVybiBub2Rlcy5sZW5ndGggPiAwID8gbm9kZXMgOiBmaW5kRE9NTm9kZXMoZWxlbWVudCwgc2VsZWN0b3IpXG4gIH1cblxuICByZXR1cm4gZmluZERPTU5vZGVzKGVsZW1lbnQsIHNlbGVjdG9yKVxufVxuIiwiLy8gQGZsb3dcblxuaW1wb3J0IFZ1ZSBmcm9tICd2dWUnXG5pbXBvcnQgV3JhcHBlciBmcm9tICcuL3dyYXBwZXInXG5pbXBvcnQgVnVlV3JhcHBlciBmcm9tICcuL3Z1ZS13cmFwcGVyJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjcmVhdGVXcmFwcGVyIChcbiAgbm9kZTogVk5vZGUgfCBDb21wb25lbnQsXG4gIG9wdGlvbnM6IFdyYXBwZXJPcHRpb25zXG4pIHtcbiAgcmV0dXJuIG5vZGUgaW5zdGFuY2VvZiBWdWVcbiAgICA/IG5ldyBWdWVXcmFwcGVyKG5vZGUsIG9wdGlvbnMpXG4gICAgOiBuZXcgV3JhcHBlcihub2RlLCBvcHRpb25zKVxufVxuIiwibGV0IGkgPSAwXG5cbmZ1bmN0aW9uIG9yZGVyRGVwcyAod2F0Y2hlcikge1xuICB3YXRjaGVyLmRlcHMuZm9yRWFjaChkZXAgPT4ge1xuICAgIGlmIChkZXAuX3NvcnRlZElkID09PSBpKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgZGVwLl9zb3J0ZWRJZCA9IGlcbiAgICBkZXAuc3Vicy5mb3JFYWNoKG9yZGVyRGVwcylcbiAgICBkZXAuc3VicyA9IGRlcC5zdWJzLnNvcnQoKGEsIGIpID0+IGEuaWQgLSBiLmlkKVxuICB9KVxufVxuXG5mdW5jdGlvbiBvcmRlclZtV2F0Y2hlcnMgKHZtKSB7XG4gIGlmICh2bS5fd2F0Y2hlcnMpIHtcbiAgICB2bS5fd2F0Y2hlcnMuZm9yRWFjaChvcmRlckRlcHMpXG4gIH1cblxuICBpZiAodm0uX2NvbXB1dGVkV2F0Y2hlcnMpIHtcbiAgICBPYmplY3Qua2V5cyh2bS5fY29tcHV0ZWRXYXRjaGVycykuZm9yRWFjaCgoY29tcHV0ZWRXYXRjaGVyKSA9PiB7XG4gICAgICBvcmRlckRlcHModm0uX2NvbXB1dGVkV2F0Y2hlcnNbY29tcHV0ZWRXYXRjaGVyXSlcbiAgICB9KVxuICB9XG5cbiAgdm0uX3dhdGNoZXIgJiYgb3JkZXJEZXBzKHZtLl93YXRjaGVyKVxuXG4gIHZtLiRjaGlsZHJlbi5mb3JFYWNoKG9yZGVyVm1XYXRjaGVycylcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9yZGVyV2F0Y2hlcnMgKHZtKSB7XG4gIG9yZGVyVm1XYXRjaGVycyh2bSlcbiAgaSsrXG59XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgVnVlIGZyb20gJ3Z1ZSdcbmltcG9ydCBtZXJnZSBmcm9tICdsb2Rhc2gvbWVyZ2UnXG5pbXBvcnQgZ2V0U2VsZWN0b3JUeXBlT3JUaHJvdyBmcm9tICcuL2dldC1zZWxlY3Rvci10eXBlJ1xuaW1wb3J0IHtcbiAgUkVGX1NFTEVDVE9SLFxuICBDT01QT05FTlRfU0VMRUNUT1IsXG4gIE5BTUVfU0VMRUNUT1IsXG4gIEZVTkNUSU9OQUxfT1BUSU9OU1xufSBmcm9tICcuL2NvbnN0cydcbmltcG9ydCB7XG4gIHZtQ3Rvck1hdGNoZXNOYW1lLFxuICB2bUN0b3JNYXRjaGVzU2VsZWN0b3IsXG4gIHZtRnVuY3Rpb25hbEN0b3JNYXRjaGVzU2VsZWN0b3Jcbn0gZnJvbSAnLi9maW5kLXZ1ZS1jb21wb25lbnRzJ1xuaW1wb3J0IFdyYXBwZXJBcnJheSBmcm9tICcuL3dyYXBwZXItYXJyYXknXG5pbXBvcnQgRXJyb3JXcmFwcGVyIGZyb20gJy4vZXJyb3Itd3JhcHBlcidcbmltcG9ydCB7XG4gIHRocm93RXJyb3IsXG4gIHdhcm5cbn0gZnJvbSAnc2hhcmVkL3V0aWwnXG5pbXBvcnQgZmluZEFsbCBmcm9tICcuL2ZpbmQnXG5pbXBvcnQgY3JlYXRlV3JhcHBlciBmcm9tICcuL2NyZWF0ZS13cmFwcGVyJ1xuaW1wb3J0IHtcbiAgb3JkZXJXYXRjaGVyc1xufSBmcm9tICcuL29yZGVyLXdhdGNoZXJzJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBXcmFwcGVyIGltcGxlbWVudHMgQmFzZVdyYXBwZXIge1xuICB2bm9kZTogVk5vZGUgfCBudWxsO1xuICB2bTogQ29tcG9uZW50IHwgbnVsbDtcbiAgX2VtaXR0ZWQ6IHsgW25hbWU6IHN0cmluZ106IEFycmF5PEFycmF5PGFueT4+IH07XG4gIF9lbWl0dGVkQnlPcmRlcjogQXJyYXk8eyBuYW1lOiBzdHJpbmc7IGFyZ3M6IEFycmF5PGFueT4gfT47XG4gIGlzVnVlQ29tcG9uZW50OiBib29sZWFuO1xuICBlbGVtZW50OiBFbGVtZW50O1xuICB1cGRhdGU6IEZ1bmN0aW9uO1xuICBvcHRpb25zOiBXcmFwcGVyT3B0aW9ucztcbiAgdmVyc2lvbjogbnVtYmVyO1xuICBpc0Z1bmN0aW9uYWxDb21wb25lbnQ6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IgKG5vZGU6IFZOb2RlIHwgRWxlbWVudCwgb3B0aW9uczogV3JhcHBlck9wdGlvbnMpIHtcbiAgICBpZiAobm9kZSBpbnN0YW5jZW9mIEVsZW1lbnQpIHtcbiAgICAgIHRoaXMuZWxlbWVudCA9IG5vZGVcbiAgICAgIHRoaXMudm5vZGUgPSBudWxsXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudm5vZGUgPSBub2RlXG4gICAgICB0aGlzLmVsZW1lbnQgPSBub2RlLmVsbVxuICAgIH1cbiAgICBpZiAodGhpcy52bm9kZSAmJiAodGhpcy52bm9kZVtGVU5DVElPTkFMX09QVElPTlNdIHx8IHRoaXMudm5vZGUuZnVuY3Rpb25hbENvbnRleHQpKSB7XG4gICAgICB0aGlzLmlzRnVuY3Rpb25hbENvbXBvbmVudCA9IHRydWVcbiAgICB9XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9uc1xuICAgIHRoaXMudmVyc2lvbiA9IE51bWJlcihgJHtWdWUudmVyc2lvbi5zcGxpdCgnLicpWzBdfS4ke1Z1ZS52ZXJzaW9uLnNwbGl0KCcuJylbMV19YClcbiAgfVxuXG4gIGF0ICgpIHtcbiAgICB0aHJvd0Vycm9yKCdhdCgpIG11c3QgYmUgY2FsbGVkIG9uIGEgV3JhcHBlckFycmF5JylcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIE9iamVjdCBjb250YWluaW5nIGFsbCB0aGUgYXR0cmlidXRlL3ZhbHVlIHBhaXJzIG9uIHRoZSBlbGVtZW50LlxuICAgKi9cbiAgYXR0cmlidXRlcyAoKTogeyBbbmFtZTogc3RyaW5nXTogc3RyaW5nIH0ge1xuICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSB0aGlzLmVsZW1lbnQuYXR0cmlidXRlc1xuICAgIGNvbnN0IGF0dHJpYnV0ZU1hcCA9IHt9XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhdHRyaWJ1dGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBhdHQgPSBhdHRyaWJ1dGVzLml0ZW0oaSlcbiAgICAgIGF0dHJpYnV0ZU1hcFthdHQubG9jYWxOYW1lXSA9IGF0dC52YWx1ZVxuICAgIH1cbiAgICByZXR1cm4gYXR0cmlidXRlTWFwXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiBBcnJheSBjb250YWluaW5nIGFsbCB0aGUgY2xhc3NlcyBvbiB0aGUgZWxlbWVudFxuICAgKi9cbiAgY2xhc3NlcyAoKTogQXJyYXk8c3RyaW5nPiB7XG4gICAgLy8gd29ya3MgZm9yIEhUTUwgRWxlbWVudCBhbmQgU1ZHIEVsZW1lbnRcbiAgICBjb25zdCBjbGFzc05hbWUgPSB0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKCdjbGFzcycpXG4gICAgbGV0IGNsYXNzZXMgPSBjbGFzc05hbWUgPyBjbGFzc05hbWUuc3BsaXQoJyAnKSA6IFtdXG4gICAgLy8gSGFuZGxlIGNvbnZlcnRpbmcgY3NzbW9kdWxlcyBpZGVudGlmaWVycyBiYWNrIHRvIHRoZSBvcmlnaW5hbCBjbGFzcyBuYW1lXG4gICAgaWYgKHRoaXMudm0gJiYgdGhpcy52bS4kc3R5bGUpIHtcbiAgICAgIGNvbnN0IGNzc01vZHVsZUlkZW50aWZpZXJzID0ge31cbiAgICAgIGxldCBtb2R1bGVJZGVudFxuICAgICAgT2JqZWN0LmtleXModGhpcy52bS4kc3R5bGUpLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgICAvLyAkRmxvd0lnbm9yZSA6IEZsb3cgdGhpbmtzIHZtIGlzIGEgcHJvcGVydHlcbiAgICAgICAgbW9kdWxlSWRlbnQgPSB0aGlzLnZtLiRzdHlsZVtrZXldXG4gICAgICAgIC8vIENTUyBNb2R1bGVzIG1heSBiZSBtdWx0aS1jbGFzcyBpZiB0aGV5IGV4dGVuZCBvdGhlcnMuXG4gICAgICAgIC8vIEV4dGVuZGVkIGNsYXNzZXMgc2hvdWxkIGJlIGFscmVhZHkgcHJlc2VudCBpbiAkc3R5bGUuXG4gICAgICAgIG1vZHVsZUlkZW50ID0gbW9kdWxlSWRlbnQuc3BsaXQoJyAnKVswXVxuICAgICAgICBjc3NNb2R1bGVJZGVudGlmaWVyc1ttb2R1bGVJZGVudF0gPSBrZXlcbiAgICAgIH0pXG4gICAgICBjbGFzc2VzID0gY2xhc3Nlcy5tYXAoY2xhc3NOYW1lID0+IGNzc01vZHVsZUlkZW50aWZpZXJzW2NsYXNzTmFtZV0gfHwgY2xhc3NOYW1lKVxuICAgIH1cbiAgICByZXR1cm4gY2xhc3Nlc1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiB3cmFwcGVyIGNvbnRhaW5zIHByb3ZpZGVkIHNlbGVjdG9yLlxuICAgKi9cbiAgY29udGFpbnMgKHNlbGVjdG9yOiBTZWxlY3Rvcikge1xuICAgIGNvbnN0IHNlbGVjdG9yVHlwZSA9IGdldFNlbGVjdG9yVHlwZU9yVGhyb3coc2VsZWN0b3IsICdjb250YWlucycpXG4gICAgY29uc3Qgbm9kZXMgPSBmaW5kQWxsKHRoaXMudm0sIHRoaXMudm5vZGUsIHRoaXMuZWxlbWVudCwgc2VsZWN0b3IpXG4gICAgY29uc3QgaXMgPSBzZWxlY3RvclR5cGUgPT09IFJFRl9TRUxFQ1RPUiA/IGZhbHNlIDogdGhpcy5pcyhzZWxlY3RvcilcbiAgICByZXR1cm4gbm9kZXMubGVuZ3RoID4gMCB8fCBpc1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW4gb2JqZWN0IGNvbnRhaW5pbmcgY3VzdG9tIGV2ZW50cyBlbWl0dGVkIGJ5IHRoZSBXcmFwcGVyIHZtXG4gICAqL1xuICBlbWl0dGVkIChldmVudD86IHN0cmluZykge1xuICAgIGlmICghdGhpcy5fZW1pdHRlZCAmJiAhdGhpcy52bSkge1xuICAgICAgdGhyb3dFcnJvcignd3JhcHBlci5lbWl0dGVkKCkgY2FuIG9ubHkgYmUgY2FsbGVkIG9uIGEgVnVlIGluc3RhbmNlJylcbiAgICB9XG4gICAgaWYgKGV2ZW50KSB7XG4gICAgICByZXR1cm4gdGhpcy5fZW1pdHRlZFtldmVudF1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZWRcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIEFycmF5IGNvbnRhaW5pbmcgY3VzdG9tIGV2ZW50cyBlbWl0dGVkIGJ5IHRoZSBXcmFwcGVyIHZtXG4gICAqL1xuICBlbWl0dGVkQnlPcmRlciAoKSB7XG4gICAgaWYgKCF0aGlzLl9lbWl0dGVkQnlPcmRlciAmJiAhdGhpcy52bSkge1xuICAgICAgdGhyb3dFcnJvcignd3JhcHBlci5lbWl0dGVkQnlPcmRlcigpIGNhbiBvbmx5IGJlIGNhbGxlZCBvbiBhIFZ1ZSBpbnN0YW5jZScpXG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9lbWl0dGVkQnlPcmRlclxuICB9XG5cbiAgLyoqXG4gICAqIFV0aWxpdHkgdG8gY2hlY2sgd3JhcHBlciBleGlzdHMuIFJldHVybnMgdHJ1ZSBhcyBXcmFwcGVyIGFsd2F5cyBleGlzdHNcbiAgICovXG4gIGV4aXN0cyAoKTogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMudm0pIHtcbiAgICAgIHJldHVybiAhIXRoaXMudm0gJiYgIXRoaXMudm0uX2lzRGVzdHJveWVkXG4gICAgfVxuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICBmaWx0ZXIgKCkge1xuICAgIHRocm93RXJyb3IoJ2ZpbHRlcigpIG11c3QgYmUgY2FsbGVkIG9uIGEgV3JhcHBlckFycmF5JylcbiAgfVxuXG4gIC8qKlxuICAgKiBVdGlsaXR5IHRvIGNoZWNrIHdyYXBwZXIgaXMgdmlzaWJsZS4gUmV0dXJucyBmYWxzZSBpZiBhIHBhcmVudCBlbGVtZW50IGhhcyBkaXNwbGF5OiBub25lIG9yIHZpc2liaWxpdHk6IGhpZGRlbiBzdHlsZS5cbiAgICovXG4gIHZpc2libGUgKCk6IGJvb2xlYW4ge1xuICAgIHdhcm4oJ3Zpc2libGUgaGFzIGJlZW4gZGVwcmVjYXRlZCBhbmQgd2lsbCBiZSByZW1vdmVkIGluIHZlcnNpb24gMSwgdXNlIGlzVmlzaWJsZSBpbnN0ZWFkJylcblxuICAgIGxldCBlbGVtZW50ID0gdGhpcy5lbGVtZW50XG5cbiAgICBpZiAoIWVsZW1lbnQpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIHdoaWxlIChlbGVtZW50KSB7XG4gICAgICBpZiAoZWxlbWVudC5zdHlsZSAmJiAoZWxlbWVudC5zdHlsZS52aXNpYmlsaXR5ID09PSAnaGlkZGVuJyB8fCBlbGVtZW50LnN0eWxlLmRpc3BsYXkgPT09ICdub25lJykpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgICBlbGVtZW50ID0gZWxlbWVudC5wYXJlbnRFbGVtZW50XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgd3JhcHBlciBoYXMgYW4gYXR0cmlidXRlIHdpdGggbWF0Y2hpbmcgdmFsdWVcbiAgICovXG4gIGhhc0F0dHJpYnV0ZSAoYXR0cmlidXRlOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpIHtcbiAgICB3YXJuKCdoYXNBdHRyaWJ1dGUoKSBoYXMgYmVlbiBkZXByZWNhdGVkIGFuZCB3aWxsIGJlIHJlbW92ZWQgaW4gdmVyc2lvbiAxLjAuMC4gVXNlIGF0dHJpYnV0ZXMoKSBpbnN0ZWFk4oCUaHR0cHM6Ly92dWUtdGVzdC11dGlscy52dWVqcy5vcmcvZW4vYXBpL3dyYXBwZXIvYXR0cmlidXRlcycpXG5cbiAgICBpZiAodHlwZW9mIGF0dHJpYnV0ZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93RXJyb3IoJ3dyYXBwZXIuaGFzQXR0cmlidXRlKCkgbXVzdCBiZSBwYXNzZWQgYXR0cmlidXRlIGFzIGEgc3RyaW5nJylcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3dFcnJvcignd3JhcHBlci5oYXNBdHRyaWJ1dGUoKSBtdXN0IGJlIHBhc3NlZCB2YWx1ZSBhcyBhIHN0cmluZycpXG4gICAgfVxuXG4gICAgcmV0dXJuICEhKHRoaXMuZWxlbWVudCAmJiB0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKGF0dHJpYnV0ZSkgPT09IHZhbHVlKVxuICB9XG5cbiAgLyoqXG4gICAqIEFzc2VydHMgd3JhcHBlciBoYXMgYSBjbGFzcyBuYW1lXG4gICAqL1xuICBoYXNDbGFzcyAoY2xhc3NOYW1lOiBzdHJpbmcpIHtcbiAgICB3YXJuKCdoYXNDbGFzcygpIGhhcyBiZWVuIGRlcHJlY2F0ZWQgYW5kIHdpbGwgYmUgcmVtb3ZlZCBpbiB2ZXJzaW9uIDEuMC4wLiBVc2UgY2xhc3NlcygpIGluc3RlYWTigJRodHRwczovL3Z1ZS10ZXN0LXV0aWxzLnZ1ZWpzLm9yZy9lbi9hcGkvd3JhcHBlci9jbGFzc2VzJylcbiAgICBsZXQgdGFyZ2V0Q2xhc3MgPSBjbGFzc05hbWVcblxuICAgIGlmICh0eXBlb2YgdGFyZ2V0Q2xhc3MgIT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvd0Vycm9yKCd3cmFwcGVyLmhhc0NsYXNzKCkgbXVzdCBiZSBwYXNzZWQgYSBzdHJpbmcnKVxuICAgIH1cblxuICAgIC8vIGlmICRzdHlsZSBpcyBhdmFpbGFibGUgYW5kIGhhcyBhIG1hdGNoaW5nIHRhcmdldCwgdXNlIHRoYXQgaW5zdGVhZC5cbiAgICBpZiAodGhpcy52bSAmJiB0aGlzLnZtLiRzdHlsZSAmJiB0aGlzLnZtLiRzdHlsZVt0YXJnZXRDbGFzc10pIHtcbiAgICAgIHRhcmdldENsYXNzID0gdGhpcy52bS4kc3R5bGVbdGFyZ2V0Q2xhc3NdXG4gICAgfVxuXG4gICAgY29uc3QgY29udGFpbnNBbGxDbGFzc2VzID0gdGFyZ2V0Q2xhc3NcbiAgICAgIC5zcGxpdCgnICcpXG4gICAgICAuZXZlcnkodGFyZ2V0ID0+IHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnModGFyZ2V0KSlcblxuICAgIHJldHVybiAhISh0aGlzLmVsZW1lbnQgJiYgY29udGFpbnNBbGxDbGFzc2VzKVxuICB9XG5cbiAgLyoqXG4gICAqIEFzc2VydHMgd3JhcHBlciBoYXMgYSBwcm9wIG5hbWVcbiAgICovXG4gIGhhc1Byb3AgKHByb3A6IHN0cmluZywgdmFsdWU6IHN0cmluZykge1xuICAgIHdhcm4oJ2hhc1Byb3AoKSBoYXMgYmVlbiBkZXByZWNhdGVkIGFuZCB3aWxsIGJlIHJlbW92ZWQgaW4gdmVyc2lvbiAxLjAuMC4gVXNlIHByb3BzKCkgaW5zdGVhZOKAlGh0dHBzOi8vdnVlLXRlc3QtdXRpbHMudnVlanMub3JnL2VuL2FwaS93cmFwcGVyL3Byb3BzJylcblxuICAgIGlmICghdGhpcy5pc1Z1ZUNvbXBvbmVudCkge1xuICAgICAgdGhyb3dFcnJvcignd3JhcHBlci5oYXNQcm9wKCkgbXVzdCBiZSBjYWxsZWQgb24gYSBWdWUgaW5zdGFuY2UnKVxuICAgIH1cbiAgICBpZiAodHlwZW9mIHByb3AgIT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvd0Vycm9yKCd3cmFwcGVyLmhhc1Byb3AoKSBtdXN0IGJlIHBhc3NlZCBwcm9wIGFzIGEgc3RyaW5nJylcbiAgICB9XG5cbiAgICAvLyAkcHJvcHMgb2JqZWN0IGRvZXMgbm90IGV4aXN0IGluIFZ1ZSAyLjEueCwgc28gdXNlICRvcHRpb25zLnByb3BzRGF0YSBpbnN0ZWFkXG4gICAgaWYgKHRoaXMudm0gJiYgdGhpcy52bS4kb3B0aW9ucyAmJiB0aGlzLnZtLiRvcHRpb25zLnByb3BzRGF0YSAmJiB0aGlzLnZtLiRvcHRpb25zLnByb3BzRGF0YVtwcm9wXSA9PT0gdmFsdWUpIHtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuXG4gICAgcmV0dXJuICEhdGhpcy52bSAmJiAhIXRoaXMudm0uJHByb3BzICYmIHRoaXMudm0uJHByb3BzW3Byb3BdID09PSB2YWx1ZVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiB3cmFwcGVyIGhhcyBhIHN0eWxlIHdpdGggdmFsdWVcbiAgICovXG4gIGhhc1N0eWxlIChzdHlsZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKSB7XG4gICAgd2FybignaGFzU3R5bGUoKSBoYXMgYmVlbiBkZXByZWNhdGVkIGFuZCB3aWxsIGJlIHJlbW92ZWQgaW4gdmVyc2lvbiAxLjAuMC4gVXNlIHdyYXBwZXIuZWxlbWVudC5zdHlsZSBpbnN0ZWFkJylcblxuICAgIGlmICh0eXBlb2Ygc3R5bGUgIT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvd0Vycm9yKCd3cmFwcGVyLmhhc1N0eWxlKCkgbXVzdCBiZSBwYXNzZWQgc3R5bGUgYXMgYSBzdHJpbmcnKVxuICAgIH1cblxuICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvd0Vycm9yKCd3cmFwcGVyLmhhc0NsYXNzKCkgbXVzdCBiZSBwYXNzZWQgdmFsdWUgYXMgc3RyaW5nJylcbiAgICB9XG5cbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIGlmIChuYXZpZ2F0b3IudXNlckFnZW50LmluY2x1ZGVzICYmIChuYXZpZ2F0b3IudXNlckFnZW50LmluY2x1ZGVzKCdub2RlLmpzJykgfHwgbmF2aWdhdG9yLnVzZXJBZ2VudC5pbmNsdWRlcygnanNkb20nKSkpIHtcbiAgICAgIGNvbnNvbGUud2Fybignd3JhcHBlci5oYXNTdHlsZSBpcyBub3QgZnVsbHkgc3VwcG9ydGVkIHdoZW4gcnVubmluZyBqc2RvbSAtIG9ubHkgaW5saW5lIHN0eWxlcyBhcmUgc3VwcG9ydGVkJykgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zb2xlXG4gICAgfVxuICAgIGNvbnN0IGJvZHkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5JylcbiAgICBjb25zdCBtb2NrRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG5cbiAgICBpZiAoIShib2R5IGluc3RhbmNlb2YgRWxlbWVudCkpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgICBjb25zdCBtb2NrTm9kZSA9IGJvZHkuaW5zZXJ0QmVmb3JlKG1vY2tFbGVtZW50LCBudWxsKVxuICAgIC8vICRGbG93SWdub3JlIDogRmxvdyB0aGlua3Mgc3R5bGVbc3R5bGVdIHJldHVybnMgYSBudW1iZXJcbiAgICBtb2NrRWxlbWVudC5zdHlsZVtzdHlsZV0gPSB2YWx1ZVxuXG4gICAgaWYgKCF0aGlzLm9wdGlvbnMuYXR0YWNoZWRUb0RvY3VtZW50ICYmICh0aGlzLnZtIHx8IHRoaXMudm5vZGUpKSB7XG4gICAgICAvLyAkRmxvd0lnbm9yZSA6IFBvc3NpYmxlIG51bGwgdmFsdWUsIHdpbGwgYmUgcmVtb3ZlZCBpbiAxLjAuMFxuICAgICAgY29uc3Qgdm0gPSB0aGlzLnZtIHx8IHRoaXMudm5vZGUuY29udGV4dC4kcm9vdFxuICAgICAgYm9keS5pbnNlcnRCZWZvcmUodm0uJHJvb3QuX3Zub2RlLmVsbSwgbnVsbClcbiAgICB9XG5cbiAgICBjb25zdCBlbFN0eWxlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUodGhpcy5lbGVtZW50KVtzdHlsZV1cbiAgICBjb25zdCBtb2NrTm9kZVN0eWxlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUobW9ja05vZGUpW3N0eWxlXVxuICAgIHJldHVybiAhIShlbFN0eWxlICYmIG1vY2tOb2RlU3R5bGUgJiYgZWxTdHlsZSA9PT0gbW9ja05vZGVTdHlsZSlcbiAgfVxuXG4gIC8qKlxuICAgKiBGaW5kcyBmaXJzdCBub2RlIGluIHRyZWUgb2YgdGhlIGN1cnJlbnQgd3JhcHBlciB0aGF0IG1hdGNoZXMgdGhlIHByb3ZpZGVkIHNlbGVjdG9yLlxuICAgKi9cbiAgZmluZCAoc2VsZWN0b3I6IFNlbGVjdG9yKTogV3JhcHBlciB8IEVycm9yV3JhcHBlciB7XG4gICAgY29uc3Qgbm9kZXMgPSBmaW5kQWxsKHRoaXMudm0sIHRoaXMudm5vZGUsIHRoaXMuZWxlbWVudCwgc2VsZWN0b3IpXG4gICAgaWYgKG5vZGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgaWYgKHNlbGVjdG9yLnJlZikge1xuICAgICAgICByZXR1cm4gbmV3IEVycm9yV3JhcHBlcihgcmVmPVwiJHtzZWxlY3Rvci5yZWZ9XCJgKVxuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBFcnJvcldyYXBwZXIodHlwZW9mIHNlbGVjdG9yID09PSAnc3RyaW5nJyA/IHNlbGVjdG9yIDogJ0NvbXBvbmVudCcpXG4gICAgfVxuICAgIHJldHVybiBjcmVhdGVXcmFwcGVyKG5vZGVzWzBdLCB0aGlzLm9wdGlvbnMpXG4gIH1cblxuICAvKipcbiAgICogRmluZHMgbm9kZSBpbiB0cmVlIG9mIHRoZSBjdXJyZW50IHdyYXBwZXIgdGhhdCBtYXRjaGVzIHRoZSBwcm92aWRlZCBzZWxlY3Rvci5cbiAgICovXG4gIGZpbmRBbGwgKHNlbGVjdG9yOiBTZWxlY3Rvcik6IFdyYXBwZXJBcnJheSB7XG4gICAgZ2V0U2VsZWN0b3JUeXBlT3JUaHJvdyhzZWxlY3RvciwgJ2ZpbmRBbGwnKVxuICAgIGNvbnN0IG5vZGVzID0gZmluZEFsbCh0aGlzLnZtLCB0aGlzLnZub2RlLCB0aGlzLmVsZW1lbnQsIHNlbGVjdG9yKVxuICAgIGNvbnN0IHdyYXBwZXJzID0gbm9kZXMubWFwKG5vZGUgPT5cbiAgICAgIGNyZWF0ZVdyYXBwZXIobm9kZSwgdGhpcy5vcHRpb25zKVxuICAgIClcbiAgICByZXR1cm4gbmV3IFdyYXBwZXJBcnJheSh3cmFwcGVycylcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIEhUTUwgb2YgZWxlbWVudCBhcyBhIHN0cmluZ1xuICAgKi9cbiAgaHRtbCAoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50Lm91dGVySFRNTFxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiBub2RlIG1hdGNoZXMgc2VsZWN0b3JcbiAgICovXG4gIGlzIChzZWxlY3RvcjogU2VsZWN0b3IpOiBib29sZWFuIHtcbiAgICBjb25zdCBzZWxlY3RvclR5cGUgPSBnZXRTZWxlY3RvclR5cGVPclRocm93KHNlbGVjdG9yLCAnaXMnKVxuXG4gICAgaWYgKHNlbGVjdG9yVHlwZSA9PT0gTkFNRV9TRUxFQ1RPUikge1xuICAgICAgaWYgKCF0aGlzLnZtKSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgICAgcmV0dXJuIHZtQ3Rvck1hdGNoZXNOYW1lKHRoaXMudm0sIHNlbGVjdG9yLm5hbWUpXG4gICAgfVxuXG4gICAgaWYgKHNlbGVjdG9yVHlwZSA9PT0gQ09NUE9ORU5UX1NFTEVDVE9SKSB7XG4gICAgICBpZiAoIXRoaXMudm0pIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgICBpZiAoc2VsZWN0b3IuZnVuY3Rpb25hbCkge1xuICAgICAgICByZXR1cm4gdm1GdW5jdGlvbmFsQ3Rvck1hdGNoZXNTZWxlY3Rvcih0aGlzLnZtLl92bm9kZSwgc2VsZWN0b3IuX0N0b3IpXG4gICAgICB9XG4gICAgICByZXR1cm4gdm1DdG9yTWF0Y2hlc1NlbGVjdG9yKHRoaXMudm0sIHNlbGVjdG9yKVxuICAgIH1cblxuICAgIGlmIChzZWxlY3RvclR5cGUgPT09IFJFRl9TRUxFQ1RPUikge1xuICAgICAgdGhyb3dFcnJvcignJHJlZiBzZWxlY3RvcnMgY2FuIG5vdCBiZSB1c2VkIHdpdGggd3JhcHBlci5pcygpJylcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHNlbGVjdG9yID09PSAnb2JqZWN0Jykge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgcmV0dXJuICEhKHRoaXMuZWxlbWVudCAmJlxuICAgIHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUgJiZcbiAgICB0aGlzLmVsZW1lbnQubWF0Y2hlcyhzZWxlY3RvcikpXG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIGlmIG5vZGUgaXMgZW1wdHlcbiAgICovXG4gIGlzRW1wdHkgKCk6IGJvb2xlYW4ge1xuICAgIGlmICghdGhpcy52bm9kZSkge1xuICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudC5pbm5lckhUTUwgPT09ICcnXG4gICAgfVxuICAgIGlmICh0aGlzLnZub2RlLmNoaWxkcmVuKSB7XG4gICAgICByZXR1cm4gdGhpcy52bm9kZS5jaGlsZHJlbi5ldmVyeSh2bm9kZSA9PiB2bm9kZS5pc0NvbW1lbnQpXG4gICAgfVxuICAgIHJldHVybiB0aGlzLnZub2RlLmNoaWxkcmVuID09PSB1bmRlZmluZWQgfHwgdGhpcy52bm9kZS5jaGlsZHJlbi5sZW5ndGggPT09IDBcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgbm9kZSBpcyB2aXNpYmxlXG4gICAqL1xuICBpc1Zpc2libGUgKCk6IGJvb2xlYW4ge1xuICAgIGxldCBlbGVtZW50ID0gdGhpcy5lbGVtZW50XG5cbiAgICBpZiAoIWVsZW1lbnQpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIHdoaWxlIChlbGVtZW50KSB7XG4gICAgICBpZiAoZWxlbWVudC5zdHlsZSAmJiAoZWxlbWVudC5zdHlsZS52aXNpYmlsaXR5ID09PSAnaGlkZGVuJyB8fCBlbGVtZW50LnN0eWxlLmRpc3BsYXkgPT09ICdub25lJykpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgICBlbGVtZW50ID0gZWxlbWVudC5wYXJlbnRFbGVtZW50XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgd3JhcHBlciBpcyBhIHZ1ZSBpbnN0YW5jZVxuICAgKi9cbiAgaXNWdWVJbnN0YW5jZSAoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICEhdGhpcy5pc1Z1ZUNvbXBvbmVudFxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgbmFtZSBvZiBjb21wb25lbnQsIG9yIHRhZyBuYW1lIGlmIG5vZGUgaXMgbm90IGEgVnVlIGNvbXBvbmVudFxuICAgKi9cbiAgbmFtZSAoKTogc3RyaW5nIHtcbiAgICBpZiAodGhpcy52bSkge1xuICAgICAgcmV0dXJuIHRoaXMudm0uJG9wdGlvbnMubmFtZVxuICAgIH1cblxuICAgIGlmICghdGhpcy52bm9kZSkge1xuICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudC50YWdOYW1lXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMudm5vZGUudGFnXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiBPYmplY3QgY29udGFpbmluZyB0aGUgcHJvcCBuYW1lL3ZhbHVlIHBhaXJzIG9uIHRoZSBlbGVtZW50XG4gICAqL1xuICBwcm9wcyAoKTogeyBbbmFtZTogc3RyaW5nXTogYW55IH0ge1xuICAgIGlmICh0aGlzLmlzRnVuY3Rpb25hbENvbXBvbmVudCkge1xuICAgICAgdGhyb3dFcnJvcignd3JhcHBlci5wcm9wcygpIGNhbm5vdCBiZSBjYWxsZWQgb24gYSBtb3VudGVkIGZ1bmN0aW9uYWwgY29tcG9uZW50LicpXG4gICAgfVxuICAgIGlmICghdGhpcy52bSkge1xuICAgICAgdGhyb3dFcnJvcignd3JhcHBlci5wcm9wcygpIG11c3QgYmUgY2FsbGVkIG9uIGEgVnVlIGluc3RhbmNlJylcbiAgICB9XG4gICAgLy8gJHByb3BzIG9iamVjdCBkb2VzIG5vdCBleGlzdCBpbiBWdWUgMi4xLngsIHNvIHVzZSAkb3B0aW9ucy5wcm9wc0RhdGEgaW5zdGVhZFxuICAgIGxldCBfcHJvcHNcbiAgICBpZiAodGhpcy52bSAmJiB0aGlzLnZtLiRvcHRpb25zICYmIHRoaXMudm0uJG9wdGlvbnMucHJvcHNEYXRhKSB7XG4gICAgICBfcHJvcHMgPSB0aGlzLnZtLiRvcHRpb25zLnByb3BzRGF0YVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyAkRmxvd0lnbm9yZVxuICAgICAgX3Byb3BzID0gdGhpcy52bS4kcHJvcHNcbiAgICB9XG4gICAgcmV0dXJuIF9wcm9wcyB8fCB7fSAvLyBSZXR1cm4gYW4gZW1wdHkgb2JqZWN0IGlmIG5vIHByb3BzIGV4aXN0XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB2bSBkYXRhXG4gICAqL1xuICBzZXREYXRhIChkYXRhOiBPYmplY3QpIHtcbiAgICBpZiAodGhpcy5pc0Z1bmN0aW9uYWxDb21wb25lbnQpIHtcbiAgICAgIHRocm93RXJyb3IoJ3dyYXBwZXIuc2V0RGF0YSgpIGNhbm90IGJlIGNhbGxlZCBvbiBhIGZ1bmN0aW9uYWwgY29tcG9uZW50JylcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMudm0pIHtcbiAgICAgIHRocm93RXJyb3IoJ3dyYXBwZXIuc2V0RGF0YSgpIGNhbiBvbmx5IGJlIGNhbGxlZCBvbiBhIFZ1ZSBpbnN0YW5jZScpXG4gICAgfVxuXG4gICAgT2JqZWN0LmtleXMoZGF0YSkuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICBpZiAodHlwZW9mIGRhdGFba2V5XSA9PT0gJ29iamVjdCcgJiYgZGF0YVtrZXldICE9PSBudWxsKSB7XG4gICAgICAgIC8vICRGbG93SWdub3JlIDogUHJvYmxlbSB3aXRoIHBvc3NpYmx5IG51bGwgdGhpcy52bVxuICAgICAgICBjb25zdCBuZXdPYmogPSBtZXJnZSh0aGlzLnZtW2tleV0sIGRhdGFba2V5XSlcbiAgICAgICAgLy8gJEZsb3dJZ25vcmUgOiBQcm9ibGVtIHdpdGggcG9zc2libHkgbnVsbCB0aGlzLnZtXG4gICAgICAgIHRoaXMudm0uJHNldCh0aGlzLnZtLCBba2V5XSwgbmV3T2JqKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gJEZsb3dJZ25vcmUgOiBQcm9ibGVtIHdpdGggcG9zc2libHkgbnVsbCB0aGlzLnZtXG4gICAgICAgIHRoaXMudm0uJHNldCh0aGlzLnZtLCBba2V5XSwgZGF0YVtrZXldKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogU2V0cyB2bSBjb21wdXRlZFxuICAgKi9cbiAgc2V0Q29tcHV0ZWQgKGNvbXB1dGVkOiBPYmplY3QpIHtcbiAgICBpZiAoIXRoaXMuaXNWdWVDb21wb25lbnQpIHtcbiAgICAgIHRocm93RXJyb3IoJ3dyYXBwZXIuc2V0Q29tcHV0ZWQoKSBjYW4gb25seSBiZSBjYWxsZWQgb24gYSBWdWUgaW5zdGFuY2UnKVxuICAgIH1cblxuICAgIHdhcm4oJ3NldENvbXB1dGVkKCkgaGFzIGJlZW4gZGVwcmVjYXRlZCBhbmQgd2lsbCBiZSByZW1vdmVkIGluIHZlcnNpb24gMS4wLjAuIFlvdSBjYW4gb3ZlcndyaXRlIGNvbXB1dGVkIHByb3BlcnRpZXMgYnkgcGFzc2luZyBhIGNvbXB1dGVkIG9iamVjdCBpbiB0aGUgbW91bnRpbmcgb3B0aW9ucycpXG5cbiAgICBPYmplY3Qua2V5cyhjb21wdXRlZCkuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICBpZiAodGhpcy52ZXJzaW9uID4gMi4xKSB7XG4gICAgICAgIC8vICRGbG93SWdub3JlIDogUHJvYmxlbSB3aXRoIHBvc3NpYmx5IG51bGwgdGhpcy52bVxuICAgICAgICBpZiAoIXRoaXMudm0uX2NvbXB1dGVkV2F0Y2hlcnNba2V5XSkge1xuICAgICAgICAgIHRocm93RXJyb3IoYHdyYXBwZXIuc2V0Q29tcHV0ZWQoKSB3YXMgcGFzc2VkIGEgdmFsdWUgdGhhdCBkb2VzIG5vdCBleGlzdCBhcyBhIGNvbXB1dGVkIHByb3BlcnR5IG9uIHRoZSBWdWUgaW5zdGFuY2UuIFByb3BlcnR5ICR7a2V5fSBkb2VzIG5vdCBleGlzdCBvbiB0aGUgVnVlIGluc3RhbmNlYClcbiAgICAgICAgfVxuICAgICAgICAvLyAkRmxvd0lnbm9yZSA6IFByb2JsZW0gd2l0aCBwb3NzaWJseSBudWxsIHRoaXMudm1cbiAgICAgICAgdGhpcy52bS5fY29tcHV0ZWRXYXRjaGVyc1trZXldLnZhbHVlID0gY29tcHV0ZWRba2V5XVxuICAgICAgICAvLyAkRmxvd0lnbm9yZSA6IFByb2JsZW0gd2l0aCBwb3NzaWJseSBudWxsIHRoaXMudm1cbiAgICAgICAgdGhpcy52bS5fY29tcHV0ZWRXYXRjaGVyc1trZXldLmdldHRlciA9ICgpID0+IGNvbXB1dGVkW2tleV1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCBpc1N0b3JlID0gZmFsc2VcbiAgICAgICAgLy8gJEZsb3dJZ25vcmUgOiBQcm9ibGVtIHdpdGggcG9zc2libHkgbnVsbCB0aGlzLnZtXG4gICAgICAgIHRoaXMudm0uX3dhdGNoZXJzLmZvckVhY2god2F0Y2hlciA9PiB7XG4gICAgICAgICAgaWYgKHdhdGNoZXIuZ2V0dGVyLnZ1ZXggJiYga2V5IGluIHdhdGNoZXIudm0uJG9wdGlvbnMuc3RvcmUuZ2V0dGVycykge1xuICAgICAgICAgICAgd2F0Y2hlci52bS4kb3B0aW9ucy5zdG9yZS5nZXR0ZXJzID0ge1xuICAgICAgICAgICAgICAuLi53YXRjaGVyLnZtLiRvcHRpb25zLnN0b3JlLmdldHRlcnNcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh3YXRjaGVyLnZtLiRvcHRpb25zLnN0b3JlLmdldHRlcnMsIGtleSwgeyBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIGNvbXB1dGVkW2tleV0gfSB9KVxuICAgICAgICAgICAgaXNTdG9yZSA9IHRydWVcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG5cbiAgICAgICAgLy8gJEZsb3dJZ25vcmUgOiBQcm9ibGVtIHdpdGggcG9zc2libHkgbnVsbCB0aGlzLnZtXG4gICAgICAgIGlmICghaXNTdG9yZSAmJiAhdGhpcy52bS5fd2F0Y2hlcnMuc29tZSh3ID0+IHcuZ2V0dGVyLm5hbWUgPT09IGtleSkpIHtcbiAgICAgICAgICB0aHJvd0Vycm9yKGB3cmFwcGVyLnNldENvbXB1dGVkKCkgd2FzIHBhc3NlZCBhIHZhbHVlIHRoYXQgZG9lcyBub3QgZXhpc3QgYXMgYSBjb21wdXRlZCBwcm9wZXJ0eSBvbiB0aGUgVnVlIGluc3RhbmNlLiBQcm9wZXJ0eSAke2tleX0gZG9lcyBub3QgZXhpc3Qgb24gdGhlIFZ1ZSBpbnN0YW5jZWApXG4gICAgICAgIH1cbiAgICAgICAgLy8gJEZsb3dJZ25vcmUgOiBQcm9ibGVtIHdpdGggcG9zc2libHkgbnVsbCB0aGlzLnZtXG4gICAgICAgIHRoaXMudm0uX3dhdGNoZXJzLmZvckVhY2goKHdhdGNoZXIpID0+IHtcbiAgICAgICAgICBpZiAod2F0Y2hlci5nZXR0ZXIubmFtZSA9PT0ga2V5KSB7XG4gICAgICAgICAgICB3YXRjaGVyLnZhbHVlID0gY29tcHV0ZWRba2V5XVxuICAgICAgICAgICAgd2F0Y2hlci5nZXR0ZXIgPSAoKSA9PiBjb21wdXRlZFtrZXldXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH0pXG4gICAgLy8gJEZsb3dJZ25vcmUgOiBQcm9ibGVtIHdpdGggcG9zc2libHkgbnVsbCB0aGlzLnZtXG4gICAgdGhpcy52bS5fd2F0Y2hlcnMuZm9yRWFjaCgod2F0Y2hlcikgPT4ge1xuICAgICAgd2F0Y2hlci5ydW4oKVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogU2V0cyB2bSBtZXRob2RzXG4gICAqL1xuICBzZXRNZXRob2RzIChtZXRob2RzOiBPYmplY3QpIHtcbiAgICBpZiAoIXRoaXMuaXNWdWVDb21wb25lbnQpIHtcbiAgICAgIHRocm93RXJyb3IoJ3dyYXBwZXIuc2V0TWV0aG9kcygpIGNhbiBvbmx5IGJlIGNhbGxlZCBvbiBhIFZ1ZSBpbnN0YW5jZScpXG4gICAgfVxuICAgIE9iamVjdC5rZXlzKG1ldGhvZHMpLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgLy8gJEZsb3dJZ25vcmUgOiBQcm9ibGVtIHdpdGggcG9zc2libHkgbnVsbCB0aGlzLnZtXG4gICAgICB0aGlzLnZtW2tleV0gPSBtZXRob2RzW2tleV1cbiAgICAgIC8vICRGbG93SWdub3JlIDogUHJvYmxlbSB3aXRoIHBvc3NpYmx5IG51bGwgdGhpcy52bVxuICAgICAgdGhpcy52bS4kb3B0aW9ucy5tZXRob2RzW2tleV0gPSBtZXRob2RzW2tleV1cbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdm0gcHJvcHNcbiAgICovXG4gIHNldFByb3BzIChkYXRhOiBPYmplY3QpIHtcbiAgICBpZiAodGhpcy5pc0Z1bmN0aW9uYWxDb21wb25lbnQpIHtcbiAgICAgIHRocm93RXJyb3IoJ3dyYXBwZXIuc2V0UHJvcHMoKSBjYW5vdCBiZSBjYWxsZWQgb24gYSBmdW5jdGlvbmFsIGNvbXBvbmVudCcpXG4gICAgfVxuICAgIGlmICghdGhpcy5pc1Z1ZUNvbXBvbmVudCB8fCAhdGhpcy52bSkge1xuICAgICAgdGhyb3dFcnJvcignd3JhcHBlci5zZXRQcm9wcygpIGNhbiBvbmx5IGJlIGNhbGxlZCBvbiBhIFZ1ZSBpbnN0YW5jZScpXG4gICAgfVxuICAgIGlmICh0aGlzLnZtICYmIHRoaXMudm0uJG9wdGlvbnMgJiYgIXRoaXMudm0uJG9wdGlvbnMucHJvcHNEYXRhKSB7XG4gICAgICB0aGlzLnZtLiRvcHRpb25zLnByb3BzRGF0YSA9IHt9XG4gICAgfVxuICAgIE9iamVjdC5rZXlzKGRhdGEpLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgLy8gSWdub3JlIHByb3BlcnRpZXMgdGhhdCB3ZXJlIG5vdCBzcGVjaWZpZWQgaW4gdGhlIGNvbXBvbmVudCBvcHRpb25zXG4gICAgICAvLyAkRmxvd0lnbm9yZSA6IFByb2JsZW0gd2l0aCBwb3NzaWJseSBudWxsIHRoaXMudm1cbiAgICAgIGlmICghdGhpcy52bS4kb3B0aW9ucy5fcHJvcEtleXMgfHwgIXRoaXMudm0uJG9wdGlvbnMuX3Byb3BLZXlzLmluY2x1ZGVzKGtleSkpIHtcbiAgICAgICAgdGhyb3dFcnJvcihgd3JhcHBlci5zZXRQcm9wcygpIGNhbGxlZCB3aXRoICR7a2V5fSBwcm9wZXJ0eSB3aGljaCBpcyBub3QgZGVmaW5lZCBvbiBjb21wb25lbnRgKVxuICAgICAgfVxuXG4gICAgICAvLyAkRmxvd0lnbm9yZSA6IFByb2JsZW0gd2l0aCBwb3NzaWJseSBudWxsIHRoaXMudm1cbiAgICAgIGlmICh0aGlzLnZtLl9wcm9wcykge1xuICAgICAgICB0aGlzLnZtLl9wcm9wc1trZXldID0gZGF0YVtrZXldXG4gICAgICAgIC8vICRGbG93SWdub3JlIDogUHJvYmxlbSB3aXRoIHBvc3NpYmx5IG51bGwgdGhpcy52bS4kcHJvcHNcbiAgICAgICAgdGhpcy52bS4kcHJvcHNba2V5XSA9IGRhdGFba2V5XVxuICAgICAgICAvLyAkRmxvd0lnbm9yZSA6IFByb2JsZW0gd2l0aCBwb3NzaWJseSBudWxsIHRoaXMudm0uJG9wdGlvbnNcbiAgICAgICAgdGhpcy52bS4kb3B0aW9ucy5wcm9wc0RhdGFba2V5XSA9IGRhdGFba2V5XVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gJEZsb3dJZ25vcmUgOiBQcm9ibGVtIHdpdGggcG9zc2libHkgbnVsbCB0aGlzLnZtXG4gICAgICAgIHRoaXMudm1ba2V5XSA9IGRhdGFba2V5XVxuICAgICAgICAvLyAkRmxvd0lnbm9yZSA6IFByb2JsZW0gd2l0aCBwb3NzaWJseSBudWxsIHRoaXMudm0uJG9wdGlvbnNcbiAgICAgICAgdGhpcy52bS4kb3B0aW9ucy5wcm9wc0RhdGFba2V5XSA9IGRhdGFba2V5XVxuICAgICAgfVxuICAgIH0pXG5cbiAgICAvLyAkRmxvd0lnbm9yZSA6IFByb2JsZW0gd2l0aCBwb3NzaWJseSBudWxsIHRoaXMudm1cbiAgICB0aGlzLnZub2RlID0gdGhpcy52bS5fdm5vZGVcbiAgICBvcmRlcldhdGNoZXJzKHRoaXMudm0gfHwgdGhpcy52bm9kZS5jb250ZXh0LiRyb290KVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiB0ZXh0IG9mIHdyYXBwZXIgZWxlbWVudFxuICAgKi9cbiAgdGV4dCAoKTogc3RyaW5nIHtcbiAgICBpZiAoIXRoaXMuZWxlbWVudCkge1xuICAgICAgdGhyb3dFcnJvcignY2Fubm90IGNhbGwgd3JhcHBlci50ZXh0KCkgb24gYSB3cmFwcGVyIHdpdGhvdXQgYW4gZWxlbWVudCcpXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudC50ZXh0Q29udGVudC50cmltKClcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxscyBkZXN0cm95IG9uIHZtXG4gICAqL1xuICBkZXN0cm95ICgpIHtcbiAgICBpZiAoIXRoaXMuaXNWdWVDb21wb25lbnQpIHtcbiAgICAgIHRocm93RXJyb3IoJ3dyYXBwZXIuZGVzdHJveSgpIGNhbiBvbmx5IGJlIGNhbGxlZCBvbiBhIFZ1ZSBpbnN0YW5jZScpXG4gICAgfVxuICAgIGlmKHRoaXMuZWxlbWVudC5wYXJlbnROb2RlICYmIHRoaXMub3B0aW9ucy5yb290KSB7XG4gICAgICB0aGlzLmVsZW1lbnQucGFyZW50Tm9kZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuZWxlbWVudC5wYXJlbnROb2RlKVxuICAgIH1cbiAgICBpZiAodGhpcy5lbGVtZW50LnBhcmVudE5vZGUpIHtcbiAgICAgIHRoaXMuZWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuZWxlbWVudClcbiAgICB9XG4gICAgLy8gJEZsb3dJZ25vcmVcbiAgICB0aGlzLnZtLiRkZXN0cm95KClcbiAgfVxuXG4gIC8qKlxuICAgKiBEaXNwYXRjaGVzIGEgRE9NIGV2ZW50IG9uIHdyYXBwZXJcbiAgICovXG4gIHRyaWdnZXIgKHR5cGU6IHN0cmluZywgb3B0aW9uczogT2JqZWN0ID0ge30pIHtcbiAgICBpZiAodHlwZW9mIHR5cGUgIT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvd0Vycm9yKCd3cmFwcGVyLnRyaWdnZXIoKSBtdXN0IGJlIHBhc3NlZCBhIHN0cmluZycpXG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLmVsZW1lbnQpIHtcbiAgICAgIHRocm93RXJyb3IoJ2Nhbm5vdCBjYWxsIHdyYXBwZXIudHJpZ2dlcigpIG9uIGEgd3JhcHBlciB3aXRob3V0IGFuIGVsZW1lbnQnKVxuICAgIH1cblxuICAgIGlmIChvcHRpb25zLnRhcmdldCkge1xuICAgICAgdGhyb3dFcnJvcigneW91IGNhbm5vdCBzZXQgdGhlIHRhcmdldCB2YWx1ZSBvZiBhbiBldmVudC4gU2VlIHRoZSBub3RlcyBzZWN0aW9uIG9mIHRoZSBkb2NzIGZvciBtb3JlIGRldGFpbHPigJRodHRwczovL3Z1ZS10ZXN0LXV0aWxzLnZ1ZWpzLm9yZy9lbi9hcGkvd3JhcHBlci90cmlnZ2VyLmh0bWwnKVxuICAgIH1cblxuICAgIC8vIERvbid0IGZpcmUgZXZlbnQgb24gYSBkaXNhYmxlZCBlbGVtZW50XG4gICAgaWYgKHRoaXMuYXR0cmlidXRlcygpLmRpc2FibGVkKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCBtb2RpZmllcnMgPSB7XG4gICAgICBlbnRlcjogMTMsXG4gICAgICB0YWI6IDksXG4gICAgICBkZWxldGU6IDQ2LFxuICAgICAgZXNjOiAyNyxcbiAgICAgIHNwYWNlOiAzMixcbiAgICAgIHVwOiAzOCxcbiAgICAgIGRvd246IDQwLFxuICAgICAgbGVmdDogMzcsXG4gICAgICByaWdodDogMzksXG4gICAgICBlbmQ6IDM1LFxuICAgICAgaG9tZTogMzYsXG4gICAgICBiYWNrc3BhY2U6IDgsXG4gICAgICBpbnNlcnQ6IDQ1LFxuICAgICAgcGFnZXVwOiAzMyxcbiAgICAgIHBhZ2Vkb3duOiAzNFxuICAgIH1cblxuICAgIGNvbnN0IGV2ZW50ID0gdHlwZS5zcGxpdCgnLicpXG5cbiAgICBsZXQgZXZlbnRPYmplY3RcblxuICAgIC8vIEZhbGxiYWNrIGZvciBJRTEwLDExIC0gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMjY1OTYxMjNcbiAgICBpZiAodHlwZW9mICh3aW5kb3cuRXZlbnQpID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBldmVudE9iamVjdCA9IG5ldyB3aW5kb3cuRXZlbnQoZXZlbnRbMF0sIHtcbiAgICAgICAgYnViYmxlczogdHJ1ZSxcbiAgICAgICAgY2FuY2VsYWJsZTogdHJ1ZVxuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgZXZlbnRPYmplY3QgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnRXZlbnQnKVxuICAgICAgZXZlbnRPYmplY3QuaW5pdEV2ZW50KGV2ZW50WzBdLCB0cnVlLCB0cnVlKVxuICAgIH1cblxuICAgIGlmIChvcHRpb25zKSB7XG4gICAgICBPYmplY3Qua2V5cyhvcHRpb25zKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICAgIC8vICRGbG93SWdub3JlXG4gICAgICAgIGV2ZW50T2JqZWN0W2tleV0gPSBvcHRpb25zW2tleV1cbiAgICAgIH0pXG4gICAgfVxuXG4gICAgaWYgKGV2ZW50Lmxlbmd0aCA9PT0gMikge1xuICAgICAgLy8gJEZsb3dJZ25vcmVcbiAgICAgIGV2ZW50T2JqZWN0LmtleUNvZGUgPSBtb2RpZmllcnNbZXZlbnRbMV1dXG4gICAgfVxuXG4gICAgdGhpcy5lbGVtZW50LmRpc3BhdGNoRXZlbnQoZXZlbnRPYmplY3QpXG4gICAgaWYgKHRoaXMudm5vZGUpIHtcbiAgICAgIG9yZGVyV2F0Y2hlcnModGhpcy52bSB8fCB0aGlzLnZub2RlLmNvbnRleHQuJHJvb3QpXG4gICAgfVxuICB9XG5cbiAgdXBkYXRlICgpIHtcbiAgICB3YXJuKCd1cGRhdGUgaGFzIGJlZW4gcmVtb3ZlZCBmcm9tIHZ1ZS10ZXN0LXV0aWxzLiBBbGwgdXBkYXRlcyBhcmUgbm93IHN5bmNocm9ub3VzIGJ5IGRlZmF1bHQnKVxuICB9XG59XG4iLCJmdW5jdGlvbiBzZXREZXBzU3luYyAoZGVwKSB7XG4gIGRlcC5zdWJzLmZvckVhY2goc2V0V2F0Y2hlclN5bmMpXG59XG5cbmZ1bmN0aW9uIHNldFdhdGNoZXJTeW5jICh3YXRjaGVyKSB7XG4gIGlmICh3YXRjaGVyLnN5bmMgPT09IHRydWUpIHtcbiAgICByZXR1cm5cbiAgfVxuICB3YXRjaGVyLnN5bmMgPSB0cnVlXG4gIHdhdGNoZXIuZGVwcy5mb3JFYWNoKHNldERlcHNTeW5jKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0V2F0Y2hlcnNUb1N5bmMgKHZtKSB7XG4gIGlmICh2bS5fd2F0Y2hlcnMpIHtcbiAgICB2bS5fd2F0Y2hlcnMuZm9yRWFjaChzZXRXYXRjaGVyU3luYylcbiAgfVxuXG4gIGlmICh2bS5fY29tcHV0ZWRXYXRjaGVycykge1xuICAgIE9iamVjdC5rZXlzKHZtLl9jb21wdXRlZFdhdGNoZXJzKS5mb3JFYWNoKChjb21wdXRlZFdhdGNoZXIpID0+IHtcbiAgICAgIHNldFdhdGNoZXJTeW5jKHZtLl9jb21wdXRlZFdhdGNoZXJzW2NvbXB1dGVkV2F0Y2hlcl0pXG4gICAgfSlcbiAgfVxuXG4gIHNldFdhdGNoZXJTeW5jKHZtLl93YXRjaGVyKVxuXG4gIHZtLiRjaGlsZHJlbi5mb3JFYWNoKHNldFdhdGNoZXJzVG9TeW5jKVxufVxuIiwiLy8gQGZsb3dcblxuaW1wb3J0IFdyYXBwZXIgZnJvbSAnLi93cmFwcGVyJ1xuaW1wb3J0IHsgc2V0V2F0Y2hlcnNUb1N5bmMgfSBmcm9tICcuL3NldC13YXRjaGVycy10by1zeW5jJ1xuaW1wb3J0IHsgb3JkZXJXYXRjaGVycyB9IGZyb20gJy4vb3JkZXItd2F0Y2hlcnMnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFZ1ZVdyYXBwZXIgZXh0ZW5kcyBXcmFwcGVyIGltcGxlbWVudHMgQmFzZVdyYXBwZXIge1xuICBjb25zdHJ1Y3RvciAodm06IENvbXBvbmVudCwgb3B0aW9uczogV3JhcHBlck9wdGlvbnMpIHtcbiAgICBzdXBlcih2bS5fdm5vZGUsIG9wdGlvbnMpXG5cbiAgICAvLyAkRmxvd0lnbm9yZSA6IGlzc3VlIHdpdGggZGVmaW5lUHJvcGVydHkgLSBodHRwczovL2dpdGh1Yi5jb20vZmFjZWJvb2svZmxvdy9pc3N1ZXMvMjg1XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICd2bm9kZScsICh7XG4gICAgICBnZXQ6ICgpID0+IHZtLl92bm9kZSxcbiAgICAgIHNldDogKCkgPT4ge31cbiAgICB9KSlcbiAgICAvLyAkRmxvd0lnbm9yZVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnZWxlbWVudCcsICh7XG4gICAgICBnZXQ6ICgpID0+IHZtLiRlbCxcbiAgICAgIHNldDogKCkgPT4ge31cbiAgICB9KSlcbiAgICB0aGlzLnZtID0gdm1cbiAgICBpZiAob3B0aW9ucy5zeW5jKSB7XG4gICAgICBzZXRXYXRjaGVyc1RvU3luYyh2bSlcbiAgICAgIG9yZGVyV2F0Y2hlcnModm0pXG4gICAgfVxuICAgIHRoaXMuaXNWdWVDb21wb25lbnQgPSB0cnVlXG4gICAgdGhpcy5pc0Z1bmN0aW9uYWxDb21wb25lbnQgPSB2bS4kb3B0aW9ucy5faXNGdW5jdGlvbmFsQ29udGFpbmVyXG4gICAgdGhpcy5fZW1pdHRlZCA9IHZtLl9fZW1pdHRlZFxuICAgIHRoaXMuX2VtaXR0ZWRCeU9yZGVyID0gdm0uX19lbWl0dGVkQnlPcmRlclxuICB9XG59XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgeyB0aHJvd0Vycm9yIH0gZnJvbSAnc2hhcmVkL3V0aWwnXG5cbmZ1bmN0aW9uIGlzVmFsaWRTbG90IChzbG90OiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkoc2xvdCkgfHwgKHNsb3QgIT09IG51bGwgJiYgdHlwZW9mIHNsb3QgPT09ICdvYmplY3QnKSB8fCB0eXBlb2Ygc2xvdCA9PT0gJ3N0cmluZydcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlU2xvdHMgKHNsb3RzOiBPYmplY3QpOiB2b2lkIHtcbiAgc2xvdHMgJiYgT2JqZWN0LmtleXMoc2xvdHMpLmZvckVhY2goKGtleSkgPT4ge1xuICAgIGlmICghaXNWYWxpZFNsb3Qoc2xvdHNba2V5XSkpIHtcbiAgICAgIHRocm93RXJyb3IoJ3Nsb3RzW2tleV0gbXVzdCBiZSBhIENvbXBvbmVudCwgc3RyaW5nIG9yIGFuIGFycmF5IG9mIENvbXBvbmVudHMnKVxuICAgIH1cblxuICAgIGlmIChBcnJheS5pc0FycmF5KHNsb3RzW2tleV0pKSB7XG4gICAgICBzbG90c1trZXldLmZvckVhY2goKHNsb3RWYWx1ZSkgPT4ge1xuICAgICAgICBpZiAoIWlzVmFsaWRTbG90KHNsb3RWYWx1ZSkpIHtcbiAgICAgICAgICB0aHJvd0Vycm9yKCdzbG90c1trZXldIG11c3QgYmUgYSBDb21wb25lbnQsIHN0cmluZyBvciBhbiBhcnJheSBvZiBDb21wb25lbnRzJylcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG4gIH0pXG59XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgeyBjb21waWxlVG9GdW5jdGlvbnMgfSBmcm9tICd2dWUtdGVtcGxhdGUtY29tcGlsZXInXG5pbXBvcnQgeyB0aHJvd0Vycm9yIH0gZnJvbSAnc2hhcmVkL3V0aWwnXG5pbXBvcnQgeyB2YWxpZGF0ZVNsb3RzIH0gZnJvbSAnLi92YWxpZGF0ZS1zbG90cydcblxuZnVuY3Rpb24gaXNTaW5nbGVFbGVtZW50IChzbG90VmFsdWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICBjb25zdCBfc2xvdFZhbHVlID0gc2xvdFZhbHVlLnRyaW0oKVxuICBpZiAoX3Nsb3RWYWx1ZVswXSAhPT0gJzwnIHx8IF9zbG90VmFsdWVbX3Nsb3RWYWx1ZS5sZW5ndGggLSAxXSAhPT0gJz4nKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbiAgY29uc3QgZG9tUGFyc2VyID0gbmV3IHdpbmRvdy5ET01QYXJzZXIoKVxuICBjb25zdCBfZG9jdW1lbnQgPSBkb21QYXJzZXIucGFyc2VGcm9tU3RyaW5nKHNsb3RWYWx1ZSwgJ3RleHQvaHRtbCcpXG4gIHJldHVybiBfZG9jdW1lbnQuYm9keS5jaGlsZEVsZW1lbnRDb3VudCA9PT0gMVxufVxuXG4vLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3Z1ZWpzL3Z1ZS10ZXN0LXV0aWxzL3B1bGwvMjc0XG5mdW5jdGlvbiBjcmVhdGVWTm9kZXMgKHZtOiBDb21wb25lbnQsIHNsb3RWYWx1ZTogc3RyaW5nKSB7XG4gIGNvbnN0IGNvbXBpbGVkUmVzdWx0ID0gY29tcGlsZVRvRnVuY3Rpb25zKGA8ZGl2PiR7c2xvdFZhbHVlfXt7IH19PC9kaXY+YClcbiAgY29uc3QgX3N0YXRpY1JlbmRlckZucyA9IHZtLl9yZW5kZXJQcm94eS4kb3B0aW9ucy5zdGF0aWNSZW5kZXJGbnNcbiAgdm0uX3JlbmRlclByb3h5LiRvcHRpb25zLnN0YXRpY1JlbmRlckZucyA9IGNvbXBpbGVkUmVzdWx0LnN0YXRpY1JlbmRlckZuc1xuICBjb25zdCBlbGVtID0gY29tcGlsZWRSZXN1bHQucmVuZGVyLmNhbGwodm0uX3JlbmRlclByb3h5LCB2bS4kY3JlYXRlRWxlbWVudCkuY2hpbGRyZW5cbiAgdm0uX3JlbmRlclByb3h5LiRvcHRpb25zLnN0YXRpY1JlbmRlckZucyA9IF9zdGF0aWNSZW5kZXJGbnNcbiAgcmV0dXJuIGVsZW1cbn1cblxuZnVuY3Rpb24gdmFsaWRhdGVFbnZpcm9ubWVudCAoKTogdm9pZCB7XG4gIGlmICghY29tcGlsZVRvRnVuY3Rpb25zKSB7XG4gICAgdGhyb3dFcnJvcigndnVlVGVtcGxhdGVDb21waWxlciBpcyB1bmRlZmluZWQsIHlvdSBtdXN0IHBhc3MgY29tcG9uZW50cyBleHBsaWNpdGx5IGlmIHZ1ZS10ZW1wbGF0ZS1jb21waWxlciBpcyB1bmRlZmluZWQnKVxuICB9XG4gIGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJykge1xuICAgIHRocm93RXJyb3IoJ3RoZSBzbG90cyBzdHJpbmcgb3B0aW9uIGRvZXMgbm90IHN1cHBvcnQgc3RyaW5ncyBpbiBzZXJ2ZXItdGVzdC11aXRscy4nKVxuICB9XG4gIGlmICh3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvUGhhbnRvbUpTL2kpKSB7XG4gICAgdGhyb3dFcnJvcigndGhlIHNsb3RzIG9wdGlvbiBkb2VzIG5vdCBzdXBwb3J0IHN0cmluZ3MgaW4gUGhhbnRvbUpTLiBQbGVhc2UgdXNlIFB1cHBldGVlciwgb3IgcGFzcyBhIGNvbXBvbmVudC4nKVxuICB9XG59XG5cbmZ1bmN0aW9uIGFkZFNsb3RUb1ZtICh2bTogQ29tcG9uZW50LCBzbG90TmFtZTogc3RyaW5nLCBzbG90VmFsdWU6IFNsb3RWYWx1ZSk6IHZvaWQge1xuICBsZXQgZWxlbVxuICBpZiAodHlwZW9mIHNsb3RWYWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICB2YWxpZGF0ZUVudmlyb25tZW50KClcbiAgICBpZiAoaXNTaW5nbGVFbGVtZW50KHNsb3RWYWx1ZSkpIHtcbiAgICAgIGVsZW0gPSB2bS4kY3JlYXRlRWxlbWVudChjb21waWxlVG9GdW5jdGlvbnMoc2xvdFZhbHVlKSlcbiAgICB9IGVsc2Uge1xuICAgICAgZWxlbSA9IGNyZWF0ZVZOb2Rlcyh2bSwgc2xvdFZhbHVlKVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBlbGVtID0gdm0uJGNyZWF0ZUVsZW1lbnQoc2xvdFZhbHVlKVxuICB9XG4gIGlmIChBcnJheS5pc0FycmF5KGVsZW0pKSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkodm0uJHNsb3RzW3Nsb3ROYW1lXSkpIHtcbiAgICAgIHZtLiRzbG90c1tzbG90TmFtZV0gPSBbLi4udm0uJHNsb3RzW3Nsb3ROYW1lXSwgLi4uZWxlbV1cbiAgICB9IGVsc2Uge1xuICAgICAgdm0uJHNsb3RzW3Nsb3ROYW1lXSA9IFsuLi5lbGVtXVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh2bS4kc2xvdHNbc2xvdE5hbWVdKSkge1xuICAgICAgdm0uJHNsb3RzW3Nsb3ROYW1lXS5wdXNoKGVsZW0pXG4gICAgfSBlbHNlIHtcbiAgICAgIHZtLiRzbG90c1tzbG90TmFtZV0gPSBbZWxlbV1cbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFkZFNsb3RzICh2bTogQ29tcG9uZW50LCBzbG90czogT2JqZWN0KTogdm9pZCB7XG4gIHZhbGlkYXRlU2xvdHMoc2xvdHMpXG4gIE9iamVjdC5rZXlzKHNsb3RzKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShzbG90c1trZXldKSkge1xuICAgICAgc2xvdHNba2V5XS5mb3JFYWNoKChzbG90VmFsdWUpID0+IHtcbiAgICAgICAgYWRkU2xvdFRvVm0odm0sIGtleSwgc2xvdFZhbHVlKVxuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgYWRkU2xvdFRvVm0odm0sIGtleSwgc2xvdHNba2V5XSlcbiAgICB9XG4gIH0pXG59XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgeyBjb21waWxlVG9GdW5jdGlvbnMgfSBmcm9tICd2dWUtdGVtcGxhdGUtY29tcGlsZXInXG5pbXBvcnQgeyB0aHJvd0Vycm9yIH0gZnJvbSAnc2hhcmVkL3V0aWwnXG5cbmV4cG9ydCBmdW5jdGlvbiBhZGRTY29wZWRTbG90cyAodm06IENvbXBvbmVudCwgc2NvcGVkU2xvdHM6IE9iamVjdCk6IHZvaWQge1xuICBPYmplY3Qua2V5cyhzY29wZWRTbG90cykuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgY29uc3QgdGVtcGxhdGUgPSBzY29wZWRTbG90c1trZXldLnRyaW0oKVxuICAgIGlmICh0ZW1wbGF0ZS5zdWJzdHIoMCwgOSkgPT09ICc8dGVtcGxhdGUnKSB7XG4gICAgICB0aHJvd0Vycm9yKCd0aGUgc2NvcGVkU2xvdHMgb3B0aW9uIGRvZXMgbm90IHN1cHBvcnQgYSB0ZW1wbGF0ZSB0YWcgYXMgdGhlIHJvb3QgZWxlbWVudC4nKVxuICAgIH1cbiAgICBjb25zdCBkb21QYXJzZXIgPSBuZXcgd2luZG93LkRPTVBhcnNlcigpXG4gICAgY29uc3QgX2RvY3VtZW50ID0gZG9tUGFyc2VyLnBhcnNlRnJvbVN0cmluZyh0ZW1wbGF0ZSwgJ3RleHQvaHRtbCcpXG4gICAgdm0uJF92dWVUZXN0VXRpbHNfc2NvcGVkU2xvdHNba2V5XSA9IGNvbXBpbGVUb0Z1bmN0aW9ucyh0ZW1wbGF0ZSkucmVuZGVyXG4gICAgdm0uJF92dWVUZXN0VXRpbHNfc2xvdFNjb3Blc1trZXldID0gX2RvY3VtZW50LmJvZHkuZmlyc3RDaGlsZC5nZXRBdHRyaWJ1dGUoJ3Nsb3Qtc2NvcGUnKVxuICB9KVxufVxuIiwiLy8gQGZsb3dcbmltcG9ydCAkJFZ1ZSBmcm9tICd2dWUnXG5pbXBvcnQgeyB3YXJuIH0gZnJvbSAnc2hhcmVkL3V0aWwnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGFkZE1vY2tzIChtb2NrZWRQcm9wZXJ0aWVzOiBPYmplY3QsIFZ1ZTogQ29tcG9uZW50KSB7XG4gIE9iamVjdC5rZXlzKG1vY2tlZFByb3BlcnRpZXMpLmZvckVhY2goKGtleSkgPT4ge1xuICAgIHRyeSB7XG4gICAgICBWdWUucHJvdG90eXBlW2tleV0gPSBtb2NrZWRQcm9wZXJ0aWVzW2tleV1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB3YXJuKGBjb3VsZCBub3Qgb3ZlcndyaXRlIHByb3BlcnR5ICR7a2V5fSwgdGhpcyB1c3VhbGx5IGNhdXNlZCBieSBhIHBsdWdpbiB0aGF0IGhhcyBhZGRlZCB0aGUgcHJvcGVydHkgYXMgYSByZWFkLW9ubHkgdmFsdWVgKVxuICAgIH1cbiAgICAkJFZ1ZS51dGlsLmRlZmluZVJlYWN0aXZlKFZ1ZSwga2V5LCBtb2NrZWRQcm9wZXJ0aWVzW2tleV0pXG4gIH0pXG59XG4iLCJmdW5jdGlvbiBhZGRQcm92aWRlIChjb21wb25lbnQsIG9wdGlvblByb3ZpZGUsIG9wdGlvbnMpIHtcbiAgY29uc3QgcHJvdmlkZSA9IHR5cGVvZiBvcHRpb25Qcm92aWRlID09PSAnZnVuY3Rpb24nXG4gICAgPyBvcHRpb25Qcm92aWRlXG4gICAgOiBPYmplY3QuYXNzaWduKHt9LCBvcHRpb25Qcm92aWRlKVxuXG4gIG9wdGlvbnMuYmVmb3JlQ3JlYXRlID0gZnVuY3Rpb24gdnVlVGVzdFV0aWxCZWZvcmVDcmVhdGUgKCkge1xuICAgIHRoaXMuX3Byb3ZpZGVkID0gdHlwZW9mIHByb3ZpZGUgPT09ICdmdW5jdGlvbidcbiAgICAgID8gcHJvdmlkZS5jYWxsKHRoaXMpXG4gICAgICA6IHByb3ZpZGVcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBhZGRQcm92aWRlXG4iLCIvLyBAZmxvd1xuXG5leHBvcnQgZnVuY3Rpb24gbG9nRXZlbnRzICh2bTogQ29tcG9uZW50LCBlbWl0dGVkOiBPYmplY3QsIGVtaXR0ZWRCeU9yZGVyOiBBcnJheTxhbnk+KSB7XG4gIGNvbnN0IGVtaXQgPSB2bS4kZW1pdFxuICB2bS4kZW1pdCA9IChuYW1lLCAuLi5hcmdzKSA9PiB7XG4gICAgKGVtaXR0ZWRbbmFtZV0gfHwgKGVtaXR0ZWRbbmFtZV0gPSBbXSkpLnB1c2goYXJncylcbiAgICBlbWl0dGVkQnlPcmRlci5wdXNoKHsgbmFtZSwgYXJncyB9KVxuICAgIHJldHVybiBlbWl0LmNhbGwodm0sIG5hbWUsIC4uLmFyZ3MpXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFkZEV2ZW50TG9nZ2VyICh2dWU6IENvbXBvbmVudCkge1xuICB2dWUubWl4aW4oe1xuICAgIGJlZm9yZUNyZWF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5fX2VtaXR0ZWQgPSBPYmplY3QuY3JlYXRlKG51bGwpXG4gICAgICB0aGlzLl9fZW1pdHRlZEJ5T3JkZXIgPSBbXVxuICAgICAgbG9nRXZlbnRzKHRoaXMsIHRoaXMuX19lbWl0dGVkLCB0aGlzLl9fZW1pdHRlZEJ5T3JkZXIpXG4gICAgfVxuICB9KVxufVxuIiwiLy8gQGZsb3dcblxuaW1wb3J0IHsgY29tcGlsZVRvRnVuY3Rpb25zIH0gZnJvbSAndnVlLXRlbXBsYXRlLWNvbXBpbGVyJ1xuXG5leHBvcnQgZnVuY3Rpb24gY29tcGlsZVRlbXBsYXRlIChjb21wb25lbnQ6IENvbXBvbmVudCkge1xuICBpZiAoY29tcG9uZW50LmNvbXBvbmVudHMpIHtcbiAgICBPYmplY3Qua2V5cyhjb21wb25lbnQuY29tcG9uZW50cykuZm9yRWFjaCgoYykgPT4ge1xuICAgICAgY29uc3QgY21wID0gY29tcG9uZW50LmNvbXBvbmVudHNbY11cbiAgICAgIGlmICghY21wLnJlbmRlcikge1xuICAgICAgICBjb21waWxlVGVtcGxhdGUoY21wKVxuICAgICAgfVxuICAgIH0pXG4gIH1cbiAgaWYgKGNvbXBvbmVudC5leHRlbmRzKSB7XG4gICAgY29tcGlsZVRlbXBsYXRlKGNvbXBvbmVudC5leHRlbmRzKVxuICB9XG4gIGlmIChjb21wb25lbnQudGVtcGxhdGUpIHtcbiAgICBPYmplY3QuYXNzaWduKGNvbXBvbmVudCwgY29tcGlsZVRvRnVuY3Rpb25zKGNvbXBvbmVudC50ZW1wbGF0ZSkpXG4gIH1cbn1cbiIsIi8vIEBmbG93XG5cbmltcG9ydCBWdWUgZnJvbSAndnVlJ1xuaW1wb3J0IHsgY29tcGlsZVRvRnVuY3Rpb25zIH0gZnJvbSAndnVlLXRlbXBsYXRlLWNvbXBpbGVyJ1xuaW1wb3J0IHsgdGhyb3dFcnJvciB9IGZyb20gJy4vdXRpbCdcbmltcG9ydCB7IGNvbXBvbmVudE5lZWRzQ29tcGlsaW5nIH0gZnJvbSAnLi92YWxpZGF0b3JzJ1xuaW1wb3J0IHsgY29tcGlsZVRlbXBsYXRlIH0gZnJvbSAnLi9jb21waWxlLXRlbXBsYXRlJ1xuaW1wb3J0IHsgY2FwaXRhbGl6ZSwgY2FtZWxpemUsIGh5cGhlbmF0ZSB9IGZyb20gJy4vdXRpbCdcblxuZnVuY3Rpb24gaXNWdWVDb21wb25lbnQgKGNvbXApIHtcbiAgcmV0dXJuIGNvbXAgJiYgKGNvbXAucmVuZGVyIHx8IGNvbXAudGVtcGxhdGUgfHwgY29tcC5vcHRpb25zKVxufVxuXG5mdW5jdGlvbiBpc1ZhbGlkU3R1YiAoc3R1YjogYW55KSB7XG4gIHJldHVybiAhIXN0dWIgJiZcbiAgICAgIHR5cGVvZiBzdHViID09PSAnc3RyaW5nJyB8fFxuICAgICAgKHN0dWIgPT09IHRydWUpIHx8XG4gICAgICAoaXNWdWVDb21wb25lbnQoc3R1YikpXG59XG5cbmZ1bmN0aW9uIGlzUmVxdWlyZWRDb21wb25lbnQgKG5hbWUpIHtcbiAgcmV0dXJuIG5hbWUgPT09ICdLZWVwQWxpdmUnIHx8IG5hbWUgPT09ICdUcmFuc2l0aW9uJyB8fCBuYW1lID09PSAnVHJhbnNpdGlvbkdyb3VwJ1xufVxuXG5mdW5jdGlvbiBnZXRDb3JlUHJvcGVydGllcyAoY29tcG9uZW50OiBDb21wb25lbnQpOiBPYmplY3Qge1xuICByZXR1cm4ge1xuICAgIGF0dHJzOiBjb21wb25lbnQuYXR0cnMsXG4gICAgbmFtZTogY29tcG9uZW50Lm5hbWUsXG4gICAgb246IGNvbXBvbmVudC5vbixcbiAgICBrZXk6IGNvbXBvbmVudC5rZXksXG4gICAgcmVmOiBjb21wb25lbnQucmVmLFxuICAgIHByb3BzOiBjb21wb25lbnQucHJvcHMsXG4gICAgZG9tUHJvcHM6IGNvbXBvbmVudC5kb21Qcm9wcyxcbiAgICBjbGFzczogY29tcG9uZW50LmNsYXNzLFxuICAgIHN0YXRpY0NsYXNzOiBjb21wb25lbnQuc3RhdGljQ2xhc3MsXG4gICAgc3RhdGljU3R5bGU6IGNvbXBvbmVudC5zdGF0aWNTdHlsZSxcbiAgICBzdHlsZTogY29tcG9uZW50LnN0eWxlLFxuICAgIG5vcm1hbGl6ZWRTdHlsZTogY29tcG9uZW50Lm5vcm1hbGl6ZWRTdHlsZSxcbiAgICBuYXRpdmVPbjogY29tcG9uZW50Lm5hdGl2ZU9uLFxuICAgIGZ1bmN0aW9uYWw6IGNvbXBvbmVudC5mdW5jdGlvbmFsXG4gIH1cbn1cbmZ1bmN0aW9uIGNyZWF0ZVN0dWJGcm9tU3RyaW5nICh0ZW1wbGF0ZVN0cmluZzogc3RyaW5nLCBvcmlnaW5hbENvbXBvbmVudDogQ29tcG9uZW50KTogT2JqZWN0IHtcbiAgaWYgKCFjb21waWxlVG9GdW5jdGlvbnMpIHtcbiAgICB0aHJvd0Vycm9yKCd2dWVUZW1wbGF0ZUNvbXBpbGVyIGlzIHVuZGVmaW5lZCwgeW91IG11c3QgcGFzcyBjb21wb25lbnRzIGV4cGxpY2l0bHkgaWYgdnVlLXRlbXBsYXRlLWNvbXBpbGVyIGlzIHVuZGVmaW5lZCcpXG4gIH1cblxuICBpZiAodGVtcGxhdGVTdHJpbmcuaW5kZXhPZihoeXBoZW5hdGUob3JpZ2luYWxDb21wb25lbnQubmFtZSkpICE9PSAtMSB8fFxuICB0ZW1wbGF0ZVN0cmluZy5pbmRleE9mKGNhcGl0YWxpemUob3JpZ2luYWxDb21wb25lbnQubmFtZSkpICE9PSAtMSB8fFxuICB0ZW1wbGF0ZVN0cmluZy5pbmRleE9mKGNhbWVsaXplKG9yaWdpbmFsQ29tcG9uZW50Lm5hbWUpKSAhPT0gLTEpIHtcbiAgICB0aHJvd0Vycm9yKCdvcHRpb25zLnN0dWIgY2Fubm90IGNvbnRhaW4gYSBjaXJjdWxhciByZWZlcmVuY2UnKVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICAuLi5nZXRDb3JlUHJvcGVydGllcyhvcmlnaW5hbENvbXBvbmVudCksXG4gICAgLi4uY29tcGlsZVRvRnVuY3Rpb25zKHRlbXBsYXRlU3RyaW5nKVxuICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUJsYW5rU3R1YiAob3JpZ2luYWxDb21wb25lbnQ6IENvbXBvbmVudCkge1xuICByZXR1cm4ge1xuICAgIC4uLmdldENvcmVQcm9wZXJ0aWVzKG9yaWdpbmFsQ29tcG9uZW50KSxcbiAgICByZW5kZXI6IGggPT4gaCgnJylcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQ29tcG9uZW50U3R1YnMgKG9yaWdpbmFsQ29tcG9uZW50czogT2JqZWN0ID0ge30sIHN0dWJzOiBPYmplY3QpOiBPYmplY3Qge1xuICBjb25zdCBjb21wb25lbnRzID0ge31cbiAgaWYgKCFzdHVicykge1xuICAgIHJldHVybiBjb21wb25lbnRzXG4gIH1cbiAgaWYgKEFycmF5LmlzQXJyYXkoc3R1YnMpKSB7XG4gICAgc3R1YnMuZm9yRWFjaChzdHViID0+IHtcbiAgICAgIGlmIChzdHViID09PSBmYWxzZSkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBzdHViICE9PSAnc3RyaW5nJykge1xuICAgICAgICB0aHJvd0Vycm9yKCdlYWNoIGl0ZW0gaW4gYW4gb3B0aW9ucy5zdHVicyBhcnJheSBtdXN0IGJlIGEgc3RyaW5nJylcbiAgICAgIH1cbiAgICAgIGNvbXBvbmVudHNbc3R1Yl0gPSBjcmVhdGVCbGFua1N0dWIoe30pXG4gICAgfSlcbiAgfSBlbHNlIHtcbiAgICBPYmplY3Qua2V5cyhzdHVicykuZm9yRWFjaChzdHViID0+IHtcbiAgICAgIGlmIChzdHVic1tzdHViXSA9PT0gZmFsc2UpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBpZiAoIWlzVmFsaWRTdHViKHN0dWJzW3N0dWJdKSkge1xuICAgICAgICB0aHJvd0Vycm9yKCdvcHRpb25zLnN0dWIgdmFsdWVzIG11c3QgYmUgcGFzc2VkIGEgc3RyaW5nIG9yIGNvbXBvbmVudCcpXG4gICAgICB9XG4gICAgICBpZiAoc3R1YnNbc3R1Yl0gPT09IHRydWUpIHtcbiAgICAgICAgY29tcG9uZW50c1tzdHViXSA9IGNyZWF0ZUJsYW5rU3R1Yih7fSlcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGlmIChjb21wb25lbnROZWVkc0NvbXBpbGluZyhzdHVic1tzdHViXSkpIHtcbiAgICAgICAgY29tcGlsZVRlbXBsYXRlKHN0dWJzW3N0dWJdKVxuICAgICAgfVxuXG4gICAgICBpZiAob3JpZ2luYWxDb21wb25lbnRzW3N0dWJdKSB7XG4gICAgICAgIC8vIFJlbW92ZSBjYWNoZWQgY29uc3RydWN0b3JcbiAgICAgICAgZGVsZXRlIG9yaWdpbmFsQ29tcG9uZW50c1tzdHViXS5fQ3RvclxuICAgICAgICBpZiAodHlwZW9mIHN0dWJzW3N0dWJdID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIGNvbXBvbmVudHNbc3R1Yl0gPSBjcmVhdGVTdHViRnJvbVN0cmluZyhzdHVic1tzdHViXSwgb3JpZ2luYWxDb21wb25lbnRzW3N0dWJdKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbXBvbmVudHNbc3R1Yl0gPSB7XG4gICAgICAgICAgICAuLi5zdHVic1tzdHViXSxcbiAgICAgICAgICAgIG5hbWU6IG9yaWdpbmFsQ29tcG9uZW50c1tzdHViXS5uYW1lXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAodHlwZW9mIHN0dWJzW3N0dWJdID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIGlmICghY29tcGlsZVRvRnVuY3Rpb25zKSB7XG4gICAgICAgICAgICB0aHJvd0Vycm9yKCd2dWVUZW1wbGF0ZUNvbXBpbGVyIGlzIHVuZGVmaW5lZCwgeW91IG11c3QgcGFzcyBjb21wb25lbnRzIGV4cGxpY2l0bHkgaWYgdnVlLXRlbXBsYXRlLWNvbXBpbGVyIGlzIHVuZGVmaW5lZCcpXG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbXBvbmVudHNbc3R1Yl0gPSB7XG4gICAgICAgICAgICAuLi5jb21waWxlVG9GdW5jdGlvbnMoc3R1YnNbc3R1Yl0pXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbXBvbmVudHNbc3R1Yl0gPSB7XG4gICAgICAgICAgICAuLi5zdHVic1tzdHViXVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gaWdub3JlRWxlbWVudHMgZG9lcyBub3QgZXhpc3QgaW4gVnVlIDIuMC54XG4gICAgICBpZiAoVnVlLmNvbmZpZy5pZ25vcmVkRWxlbWVudHMpIHtcbiAgICAgICAgVnVlLmNvbmZpZy5pZ25vcmVkRWxlbWVudHMucHVzaChzdHViKVxuICAgICAgfVxuICAgIH0pXG4gIH1cbiAgcmV0dXJuIGNvbXBvbmVudHNcbn1cblxuZnVuY3Rpb24gc3R1YkNvbXBvbmVudHMgKGNvbXBvbmVudHM6IE9iamVjdCwgc3R1YmJlZENvbXBvbmVudHM6IE9iamVjdCkge1xuICBPYmplY3Qua2V5cyhjb21wb25lbnRzKS5mb3JFYWNoKGNvbXBvbmVudCA9PiB7XG4gICAgLy8gUmVtb3ZlIGNhY2hlZCBjb25zdHJ1Y3RvclxuICAgIGRlbGV0ZSBjb21wb25lbnRzW2NvbXBvbmVudF0uX0N0b3JcbiAgICBpZiAoIWNvbXBvbmVudHNbY29tcG9uZW50XS5uYW1lKSB7XG4gICAgICBjb21wb25lbnRzW2NvbXBvbmVudF0ubmFtZSA9IGNvbXBvbmVudFxuICAgIH1cbiAgICBzdHViYmVkQ29tcG9uZW50c1tjb21wb25lbnRdID0gY3JlYXRlQmxhbmtTdHViKGNvbXBvbmVudHNbY29tcG9uZW50XSlcblxuICAgIC8vIGlnbm9yZUVsZW1lbnRzIGRvZXMgbm90IGV4aXN0IGluIFZ1ZSAyLjAueFxuICAgIGlmIChWdWUuY29uZmlnLmlnbm9yZWRFbGVtZW50cykge1xuICAgICAgVnVlLmNvbmZpZy5pZ25vcmVkRWxlbWVudHMucHVzaChjb21wb25lbnQpXG4gICAgfVxuICB9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQ29tcG9uZW50U3R1YnNGb3JBbGwgKGNvbXBvbmVudDogQ29tcG9uZW50KTogT2JqZWN0IHtcbiAgY29uc3Qgc3R1YmJlZENvbXBvbmVudHMgPSB7fVxuXG4gIGlmIChjb21wb25lbnQuY29tcG9uZW50cykge1xuICAgIHN0dWJDb21wb25lbnRzKGNvbXBvbmVudC5jb21wb25lbnRzLCBzdHViYmVkQ29tcG9uZW50cylcbiAgfVxuXG4gIGxldCBleHRlbmRlZCA9IGNvbXBvbmVudC5leHRlbmRzXG5cbiAgLy8gTG9vcCB0aHJvdWdoIGV4dGVuZGVkIGNvbXBvbmVudCBjaGFpbnMgdG8gc3R1YiBhbGwgY2hpbGQgY29tcG9uZW50c1xuICB3aGlsZSAoZXh0ZW5kZWQpIHtcbiAgICBpZiAoZXh0ZW5kZWQuY29tcG9uZW50cykge1xuICAgICAgc3R1YkNvbXBvbmVudHMoZXh0ZW5kZWQuY29tcG9uZW50cywgc3R1YmJlZENvbXBvbmVudHMpXG4gICAgfVxuICAgIGV4dGVuZGVkID0gZXh0ZW5kZWQuZXh0ZW5kc1xuICB9XG5cbiAgaWYgKGNvbXBvbmVudC5leHRlbmRPcHRpb25zICYmIGNvbXBvbmVudC5leHRlbmRPcHRpb25zLmNvbXBvbmVudHMpIHtcbiAgICBzdHViQ29tcG9uZW50cyhjb21wb25lbnQuZXh0ZW5kT3B0aW9ucy5jb21wb25lbnRzLCBzdHViYmVkQ29tcG9uZW50cylcbiAgfVxuXG4gIHJldHVybiBzdHViYmVkQ29tcG9uZW50c1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQ29tcG9uZW50U3R1YnNGb3JHbG9iYWxzIChpbnN0YW5jZTogQ29tcG9uZW50KTogT2JqZWN0IHtcbiAgY29uc3QgY29tcG9uZW50cyA9IHt9XG4gIE9iamVjdC5rZXlzKGluc3RhbmNlLm9wdGlvbnMuY29tcG9uZW50cykuZm9yRWFjaCgoYykgPT4ge1xuICAgIGlmIChpc1JlcXVpcmVkQ29tcG9uZW50KGMpKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb21wb25lbnRzW2NdID0gY3JlYXRlQmxhbmtTdHViKGluc3RhbmNlLm9wdGlvbnMuY29tcG9uZW50c1tjXSlcbiAgICBkZWxldGUgaW5zdGFuY2Uub3B0aW9ucy5jb21wb25lbnRzW2NdLl9DdG9yIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tcGFyYW0tcmVhc3NpZ25cbiAgICBkZWxldGUgY29tcG9uZW50c1tjXS5fQ3RvciAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXBhcmFtLXJlYXNzaWduXG4gIH0pXG4gIHJldHVybiBjb21wb25lbnRzXG59XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgeyBjb21waWxlVG9GdW5jdGlvbnMgfSBmcm9tICd2dWUtdGVtcGxhdGUtY29tcGlsZXInXG5cbmV4cG9ydCBmdW5jdGlvbiBjb21waWxlVGVtcGxhdGUgKGNvbXBvbmVudDogQ29tcG9uZW50KSB7XG4gIGlmIChjb21wb25lbnQuY29tcG9uZW50cykge1xuICAgIE9iamVjdC5rZXlzKGNvbXBvbmVudC5jb21wb25lbnRzKS5mb3JFYWNoKChjKSA9PiB7XG4gICAgICBjb25zdCBjbXAgPSBjb21wb25lbnQuY29tcG9uZW50c1tjXVxuICAgICAgaWYgKCFjbXAucmVuZGVyKSB7XG4gICAgICAgIGNvbXBpbGVUZW1wbGF0ZShjbXApXG4gICAgICB9XG4gICAgfSlcbiAgfVxuICBpZiAoY29tcG9uZW50LmV4dGVuZHMpIHtcbiAgICBjb21waWxlVGVtcGxhdGUoY29tcG9uZW50LmV4dGVuZHMpXG4gIH1cbiAgaWYgKGNvbXBvbmVudC50ZW1wbGF0ZSkge1xuICAgIE9iamVjdC5hc3NpZ24oY29tcG9uZW50LCBjb21waWxlVG9GdW5jdGlvbnMoY29tcG9uZW50LnRlbXBsYXRlKSlcbiAgfVxufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZGVsZXRlTW91bnRpbmdPcHRpb25zIChvcHRpb25zKSB7XG4gIGRlbGV0ZSBvcHRpb25zLmF0dGFjaFRvRG9jdW1lbnRcbiAgZGVsZXRlIG9wdGlvbnMubW9ja3NcbiAgZGVsZXRlIG9wdGlvbnMuc2xvdHNcbiAgZGVsZXRlIG9wdGlvbnMubG9jYWxWdWVcbiAgZGVsZXRlIG9wdGlvbnMuc3R1YnNcbiAgZGVsZXRlIG9wdGlvbnMuY29udGV4dFxuICBkZWxldGUgb3B0aW9ucy5jbG9uZVxuICBkZWxldGUgb3B0aW9ucy5hdHRyc1xuICBkZWxldGUgb3B0aW9ucy5saXN0ZW5lcnNcbiAgZGVsZXRlIG9wdGlvbnMucHJvcHNEYXRhXG59XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgeyBjb21waWxlVG9GdW5jdGlvbnMgfSBmcm9tICd2dWUtdGVtcGxhdGUtY29tcGlsZXInXG5pbXBvcnQgeyB0aHJvd0Vycm9yIH0gZnJvbSAnc2hhcmVkL3V0aWwnXG5pbXBvcnQgeyB2YWxpZGF0ZVNsb3RzIH0gZnJvbSAnLi92YWxpZGF0ZS1zbG90cydcblxuZnVuY3Rpb24gY3JlYXRlRnVuY3Rpb25hbFNsb3RzIChzbG90cyA9IHt9LCBoKSB7XG4gIGlmIChBcnJheS5pc0FycmF5KHNsb3RzLmRlZmF1bHQpKSB7XG4gICAgcmV0dXJuIHNsb3RzLmRlZmF1bHQubWFwKGgpXG4gIH1cblxuICBpZiAodHlwZW9mIHNsb3RzLmRlZmF1bHQgPT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIFtoKGNvbXBpbGVUb0Z1bmN0aW9ucyhzbG90cy5kZWZhdWx0KSldXG4gIH1cbiAgY29uc3QgY2hpbGRyZW4gPSBbXVxuICBPYmplY3Qua2V5cyhzbG90cykuZm9yRWFjaChzbG90VHlwZSA9PiB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoc2xvdHNbc2xvdFR5cGVdKSkge1xuICAgICAgc2xvdHNbc2xvdFR5cGVdLmZvckVhY2goc2xvdCA9PiB7XG4gICAgICAgIGNvbnN0IGNvbXBvbmVudCA9IHR5cGVvZiBzbG90ID09PSAnc3RyaW5nJyA/IGNvbXBpbGVUb0Z1bmN0aW9ucyhzbG90KSA6IHNsb3RcbiAgICAgICAgY29uc3QgbmV3U2xvdCA9IGgoY29tcG9uZW50KVxuICAgICAgICBuZXdTbG90LmRhdGEuc2xvdCA9IHNsb3RUeXBlXG4gICAgICAgIGNoaWxkcmVuLnB1c2gobmV3U2xvdClcbiAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGNvbXBvbmVudCA9IHR5cGVvZiBzbG90c1tzbG90VHlwZV0gPT09ICdzdHJpbmcnID8gY29tcGlsZVRvRnVuY3Rpb25zKHNsb3RzW3Nsb3RUeXBlXSkgOiBzbG90c1tzbG90VHlwZV1cbiAgICAgIGNvbnN0IHNsb3QgPSBoKGNvbXBvbmVudClcbiAgICAgIHNsb3QuZGF0YS5zbG90ID0gc2xvdFR5cGVcbiAgICAgIGNoaWxkcmVuLnB1c2goc2xvdClcbiAgICB9XG4gIH0pXG4gIHJldHVybiBjaGlsZHJlblxufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjcmVhdGVGdW5jdGlvbmFsQ29tcG9uZW50IChjb21wb25lbnQ6IENvbXBvbmVudCwgbW91bnRpbmdPcHRpb25zOiBPcHRpb25zKSB7XG4gIGlmIChtb3VudGluZ09wdGlvbnMuY29udGV4dCAmJiB0eXBlb2YgbW91bnRpbmdPcHRpb25zLmNvbnRleHQgIT09ICdvYmplY3QnKSB7XG4gICAgdGhyb3dFcnJvcignbW91bnQuY29udGV4dCBtdXN0IGJlIGFuIG9iamVjdCcpXG4gIH1cbiAgaWYgKG1vdW50aW5nT3B0aW9ucy5zbG90cykge1xuICAgIHZhbGlkYXRlU2xvdHMobW91bnRpbmdPcHRpb25zLnNsb3RzKVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICByZW5kZXIgKGg6IEZ1bmN0aW9uKSB7XG4gICAgICByZXR1cm4gaChcbiAgICAgICAgY29tcG9uZW50LFxuICAgICAgICBtb3VudGluZ09wdGlvbnMuY29udGV4dCB8fCBjb21wb25lbnQuRnVuY3Rpb25hbFJlbmRlckNvbnRleHQsXG4gICAgICAgIChtb3VudGluZ09wdGlvbnMuY29udGV4dCAmJiBtb3VudGluZ09wdGlvbnMuY29udGV4dC5jaGlsZHJlbiAmJiBtb3VudGluZ09wdGlvbnMuY29udGV4dC5jaGlsZHJlbi5tYXAoeCA9PiB0eXBlb2YgeCA9PT0gJ2Z1bmN0aW9uJyA/IHgoaCkgOiB4KSkgfHwgY3JlYXRlRnVuY3Rpb25hbFNsb3RzKG1vdW50aW5nT3B0aW9ucy5zbG90cywgaClcbiAgICAgIClcbiAgICB9LFxuICAgIG5hbWU6IGNvbXBvbmVudC5uYW1lLFxuICAgIF9pc0Z1bmN0aW9uYWxDb250YWluZXI6IHRydWVcbiAgfVxufVxuIiwiLy8gQGZsb3dcblxuaW1wb3J0IFZ1ZSBmcm9tICd2dWUnXG5pbXBvcnQgeyBhZGRTbG90cyB9IGZyb20gJy4vYWRkLXNsb3RzJ1xuaW1wb3J0IHsgYWRkU2NvcGVkU2xvdHMgfSBmcm9tICcuL2FkZC1zY29wZWQtc2xvdHMnXG5pbXBvcnQgYWRkTW9ja3MgZnJvbSAnLi9hZGQtbW9ja3MnXG5pbXBvcnQgYWRkQXR0cnMgZnJvbSAnLi9hZGQtYXR0cnMnXG5pbXBvcnQgYWRkTGlzdGVuZXJzIGZyb20gJy4vYWRkLWxpc3RlbmVycydcbmltcG9ydCBhZGRQcm92aWRlIGZyb20gJy4vYWRkLXByb3ZpZGUnXG5pbXBvcnQgeyBhZGRFdmVudExvZ2dlciB9IGZyb20gJy4vbG9nLWV2ZW50cydcbmltcG9ydCB7IGNyZWF0ZUNvbXBvbmVudFN0dWJzIH0gZnJvbSAnc2hhcmVkL3N0dWItY29tcG9uZW50cydcbmltcG9ydCB7IHRocm93RXJyb3IgfSBmcm9tICdzaGFyZWQvdXRpbCdcbmltcG9ydCB7IGNvbXBpbGVUZW1wbGF0ZSB9IGZyb20gJy4vY29tcGlsZS10ZW1wbGF0ZSdcbmltcG9ydCBkZWxldGVvcHRpb25zIGZyb20gJy4vZGVsZXRlLW1vdW50aW5nLW9wdGlvbnMnXG5pbXBvcnQgY3JlYXRlRnVuY3Rpb25hbENvbXBvbmVudCBmcm9tICcuL2NyZWF0ZS1mdW5jdGlvbmFsLWNvbXBvbmVudCdcbmltcG9ydCB7IGNvbXBvbmVudE5lZWRzQ29tcGlsaW5nIH0gZnJvbSAnc2hhcmVkL3ZhbGlkYXRvcnMnXG5cbmZ1bmN0aW9uIGlzRGVzdHJ1Y3R1cmluZ1Nsb3RTY29wZSAoc2xvdFNjb3BlOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIHNsb3RTY29wZVswXSA9PT0gJ3snICYmIHNsb3RTY29wZVtzbG90U2NvcGUubGVuZ3RoIC0gMV0gPT09ICd9J1xufVxuXG5mdW5jdGlvbiBnZXRWdWVUZW1wbGF0ZUNvbXBpbGVySGVscGVycyAocHJveHk6IE9iamVjdCk6IE9iamVjdCB7XG4gIGNvbnN0IGhlbHBlcnMgPSB7fVxuICBjb25zdCBuYW1lcyA9IFsnX2MnLCAnX28nLCAnX24nLCAnX3MnLCAnX2wnLCAnX3QnLCAnX3EnLCAnX2knLCAnX20nLCAnX2YnLCAnX2snLCAnX2InLCAnX3YnLCAnX2UnLCAnX3UnLCAnX2cnXVxuICBuYW1lcy5mb3JFYWNoKChuYW1lKSA9PiB7XG4gICAgaGVscGVyc1tuYW1lXSA9IHByb3h5W25hbWVdXG4gIH0pXG4gIHJldHVybiBoZWxwZXJzXG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNyZWF0ZUluc3RhbmNlIChcbiAgY29tcG9uZW50OiBDb21wb25lbnQsXG4gIG9wdGlvbnM6IE9wdGlvbnMsXG4gIHZ1ZTogQ29tcG9uZW50LFxuICBlbG06IEVsZW1lbnRcbik6IENvbXBvbmVudCB7XG4gIGlmIChvcHRpb25zLm1vY2tzKSB7XG4gICAgYWRkTW9ja3Mob3B0aW9ucy5tb2NrcywgdnVlKVxuICB9XG5cbiAgaWYgKChjb21wb25lbnQub3B0aW9ucyAmJiBjb21wb25lbnQub3B0aW9ucy5mdW5jdGlvbmFsKSB8fCBjb21wb25lbnQuZnVuY3Rpb25hbCkge1xuICAgIGNvbXBvbmVudCA9IGNyZWF0ZUZ1bmN0aW9uYWxDb21wb25lbnQoY29tcG9uZW50LCBvcHRpb25zKVxuICB9IGVsc2UgaWYgKG9wdGlvbnMuY29udGV4dCkge1xuICAgIHRocm93RXJyb3IoXG4gICAgICAnbW91bnQuY29udGV4dCBjYW4gb25seSBiZSB1c2VkIHdoZW4gbW91bnRpbmcgYSBmdW5jdGlvbmFsIGNvbXBvbmVudCdcbiAgICApXG4gIH1cblxuICBpZiAob3B0aW9ucy5wcm92aWRlKSB7XG4gICAgYWRkUHJvdmlkZShjb21wb25lbnQsIG9wdGlvbnMucHJvdmlkZSwgb3B0aW9ucylcbiAgfVxuXG4gIGlmIChjb21wb25lbnROZWVkc0NvbXBpbGluZyhjb21wb25lbnQpKSB7XG4gICAgY29tcGlsZVRlbXBsYXRlKGNvbXBvbmVudClcbiAgfVxuXG4gIGFkZEV2ZW50TG9nZ2VyKHZ1ZSlcblxuICBcbiAgY29uc3QgaW5zdGFuY2VPcHRpb25zID0geyAuLi5vcHRpb25zIH1cbiAgZGVsZXRlb3B0aW9ucyhpbnN0YW5jZU9wdGlvbnMpXG4gIC8vICRGbG93SWdub3JlXG4gIFxuICBpZiAob3B0aW9ucy5zdHVicykge1xuICAgIGluc3RhbmNlT3B0aW9ucy5jb21wb25lbnRzID0ge1xuICAgICAgLi4uaW5zdGFuY2VPcHRpb25zLmNvbXBvbmVudHMsXG4gICAgICAvLyAkRmxvd0lnbm9yZVxuICAgICAgLi4uY3JlYXRlQ29tcG9uZW50U3R1YnMoY29tcG9uZW50LmNvbXBvbmVudHMsIG9wdGlvbnMuc3R1YnMpXG4gICAgfVxuICB9XG5cbiAgY29uc3QgQ29uc3RydWN0b3IgPSB2dWUuZXh0ZW5kKGNvbXBvbmVudCkuZXh0ZW5kKGluc3RhbmNlT3B0aW9ucylcbiAgT2JqZWN0LmtleXMoaW5zdGFuY2VPcHRpb25zLmNvbXBvbmVudHMgfHwge30pLmZvckVhY2goa2V5ID0+IHtcbiAgICBDb25zdHJ1Y3Rvci5jb21wb25lbnQoa2V5LCBpbnN0YW5jZU9wdGlvbnMuY29tcG9uZW50c1trZXldKVxuICAgIHZ1ZS5jb21wb25lbnQoa2V5LCBpbnN0YW5jZU9wdGlvbnMuY29tcG9uZW50c1trZXldKVxuICB9KVxuICBjb25zdCBQYXJlbnQgPSB2dWUuZXh0ZW5kKHtcbiAgICBwcm92aWRlOiBvcHRpb25zLnByb3ZpZGUsXG4gICAgZGF0YSAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBwcm9wc0RhdGE6IG9wdGlvbnMucHJvcHNEYXRhIHx8IHt9LFxuICAgICAgICBhdHRyczogb3B0aW9ucy5hdHRycyB8fCB7fSxcbiAgICAgICAgbGlzdGVuZXJzOiBvcHRpb25zLmxpc3RlbmVycyB8fCB7fVxuICAgICAgfVxuICAgIH0sXG4gICAgcmVuZGVyIChoKSB7XG4gICAgICBjb25zdCB2bm9kZSA9IGgoQ29uc3RydWN0b3IsIHtcbiAgICAgICAgcmVmOiAndm0nLFxuICAgICAgICBwcm9wczogdGhpcy5wcm9wc0RhdGEsXG4gICAgICAgIG9uOiB0aGlzLmxpc3RlbmVycyxcbiAgICAgICAgYXR0cnM6IHRoaXMuYXR0cnNcbiAgICAgIH0pXG5cbiAgICAgIHJldHVybiB2bm9kZVxuICAgIH1cbiAgfSlcblxuICBjb25zdCBwYXJlbnQgPSBuZXcgUGFyZW50KCkuJG1vdW50KGVsbSlcblxuICBjb25zdCB2bSA9IHBhcmVudC4kcmVmcy52bVxuXG4gIGlmIChvcHRpb25zLnNjb3BlZFNsb3RzKSB7XG4gICAgaWYgKHdpbmRvdy5uYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9QaGFudG9tSlMvaSkpIHtcbiAgICAgIHRocm93RXJyb3IoJ3RoZSBzY29wZWRTbG90cyBvcHRpb24gZG9lcyBub3Qgc3VwcG9ydCBQaGFudG9tSlMuIFBsZWFzZSB1c2UgUHVwcGV0ZWVyLCBvciBwYXNzIGEgY29tcG9uZW50LicpXG4gICAgfVxuICAgIGNvbnN0IHZ1ZVZlcnNpb24gPSBOdW1iZXIoYCR7VnVlLnZlcnNpb24uc3BsaXQoJy4nKVswXX0uJHtWdWUudmVyc2lvbi5zcGxpdCgnLicpWzFdfWApXG4gICAgaWYgKHZ1ZVZlcnNpb24gPj0gMi41KSB7XG4gICAgICB2bS4kX3Z1ZVRlc3RVdGlsc19zY29wZWRTbG90cyA9IHt9XG4gICAgICB2bS4kX3Z1ZVRlc3RVdGlsc19zbG90U2NvcGVzID0ge31cbiAgICAgIGNvbnN0IHJlbmRlclNsb3QgPSB2bS5fcmVuZGVyUHJveHkuX3RcblxuICAgICAgdm0uX3JlbmRlclByb3h5Ll90ID0gZnVuY3Rpb24gKG5hbWUsIGZlZWRiYWNrLCBwcm9wcywgYmluZE9iamVjdCkge1xuICAgICAgICBjb25zdCBzY29wZWRTbG90Rm4gPSB2bS4kX3Z1ZVRlc3RVdGlsc19zY29wZWRTbG90c1tuYW1lXVxuICAgICAgICBjb25zdCBzbG90U2NvcGUgPSB2bS4kX3Z1ZVRlc3RVdGlsc19zbG90U2NvcGVzW25hbWVdXG4gICAgICAgIGlmIChzY29wZWRTbG90Rm4pIHtcbiAgICAgICAgICBwcm9wcyA9IHsgLi4uYmluZE9iamVjdCwgLi4ucHJvcHMgfVxuICAgICAgICAgIGNvbnN0IGhlbHBlcnMgPSBnZXRWdWVUZW1wbGF0ZUNvbXBpbGVySGVscGVycyh2bS5fcmVuZGVyUHJveHkpXG4gICAgICAgICAgbGV0IHByb3h5ID0geyAuLi5oZWxwZXJzIH1cbiAgICAgICAgICBpZiAoaXNEZXN0cnVjdHVyaW5nU2xvdFNjb3BlKHNsb3RTY29wZSkpIHtcbiAgICAgICAgICAgIHByb3h5ID0geyAuLi5oZWxwZXJzLCAuLi5wcm9wcyB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHByb3h5W3Nsb3RTY29wZV0gPSBwcm9wc1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gc2NvcGVkU2xvdEZuLmNhbGwocHJveHkpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHJlbmRlclNsb3QuY2FsbCh2bS5fcmVuZGVyUHJveHksIG5hbWUsIGZlZWRiYWNrLCBwcm9wcywgYmluZE9iamVjdClcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyAkRmxvd0lnbm9yZVxuICAgICAgYWRkU2NvcGVkU2xvdHModm0sIG9wdGlvbnMuc2NvcGVkU2xvdHMpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93RXJyb3IoJ3RoZSBzY29wZWRTbG90cyBvcHRpb24gaXMgb25seSBzdXBwb3J0ZWQgaW4gdnVlQDIuNSsuJylcbiAgICB9XG4gIH1cblxuICBpZiAob3B0aW9ucy5zbG90cykge1xuICAgIGFkZFNsb3RzKHZtLCBvcHRpb25zLnNsb3RzKVxuICB9XG5cbiAgcmV0dXJuIHZtXG59XG4iLCIvLyBAZmxvd1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjcmVhdGVFbGVtZW50ICgpOiBIVE1MRWxlbWVudCB8IHZvaWQge1xuICBpZiAoZG9jdW1lbnQpIHtcbiAgICBjb25zdCBlbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcblxuICAgIGlmIChkb2N1bWVudC5ib2R5KSB7XG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGVsZW0pXG4gICAgfVxuICAgIHJldHVybiBlbGVtXG4gIH1cbn1cbiIsIi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBfLmZvckVhY2hgIGZvciBhcnJheXMgd2l0aG91dCBzdXBwb3J0IGZvclxuICogaXRlcmF0ZWUgc2hvcnRoYW5kcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheX0gW2FycmF5XSBUaGUgYXJyYXkgdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0ZWUgVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyBgYXJyYXlgLlxuICovXG5mdW5jdGlvbiBhcnJheUVhY2goYXJyYXksIGl0ZXJhdGVlKSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gYXJyYXkgPT0gbnVsbCA/IDAgOiBhcnJheS5sZW5ndGg7XG5cbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICBpZiAoaXRlcmF0ZWUoYXJyYXlbaW5kZXhdLCBpbmRleCwgYXJyYXkpID09PSBmYWxzZSkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIHJldHVybiBhcnJheTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBhcnJheUVhY2g7XG4iLCJ2YXIgb3ZlckFyZyA9IHJlcXVpcmUoJy4vX292ZXJBcmcnKTtcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgZm9yIHRob3NlIHdpdGggdGhlIHNhbWUgbmFtZSBhcyBvdGhlciBgbG9kYXNoYCBtZXRob2RzLiAqL1xudmFyIG5hdGl2ZUtleXMgPSBvdmVyQXJnKE9iamVjdC5rZXlzLCBPYmplY3QpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5hdGl2ZUtleXM7XG4iLCJ2YXIgaXNQcm90b3R5cGUgPSByZXF1aXJlKCcuL19pc1Byb3RvdHlwZScpLFxuICAgIG5hdGl2ZUtleXMgPSByZXF1aXJlKCcuL19uYXRpdmVLZXlzJyk7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8ua2V5c2Agd2hpY2ggZG9lc24ndCB0cmVhdCBzcGFyc2UgYXJyYXlzIGFzIGRlbnNlLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzLlxuICovXG5mdW5jdGlvbiBiYXNlS2V5cyhvYmplY3QpIHtcbiAgaWYgKCFpc1Byb3RvdHlwZShvYmplY3QpKSB7XG4gICAgcmV0dXJuIG5hdGl2ZUtleXMob2JqZWN0KTtcbiAgfVxuICB2YXIgcmVzdWx0ID0gW107XG4gIGZvciAodmFyIGtleSBpbiBPYmplY3Qob2JqZWN0KSkge1xuICAgIGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwga2V5KSAmJiBrZXkgIT0gJ2NvbnN0cnVjdG9yJykge1xuICAgICAgcmVzdWx0LnB1c2goa2V5KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlS2V5cztcbiIsInZhciBhcnJheUxpa2VLZXlzID0gcmVxdWlyZSgnLi9fYXJyYXlMaWtlS2V5cycpLFxuICAgIGJhc2VLZXlzID0gcmVxdWlyZSgnLi9fYmFzZUtleXMnKSxcbiAgICBpc0FycmF5TGlrZSA9IHJlcXVpcmUoJy4vaXNBcnJheUxpa2UnKTtcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGFycmF5IG9mIHRoZSBvd24gZW51bWVyYWJsZSBwcm9wZXJ0eSBuYW1lcyBvZiBgb2JqZWN0YC5cbiAqXG4gKiAqKk5vdGU6KiogTm9uLW9iamVjdCB2YWx1ZXMgYXJlIGNvZXJjZWQgdG8gb2JqZWN0cy4gU2VlIHRoZVxuICogW0VTIHNwZWNdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLW9iamVjdC5rZXlzKVxuICogZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBAc3RhdGljXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgT2JqZWN0XG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzLlxuICogQGV4YW1wbGVcbiAqXG4gKiBmdW5jdGlvbiBGb28oKSB7XG4gKiAgIHRoaXMuYSA9IDE7XG4gKiAgIHRoaXMuYiA9IDI7XG4gKiB9XG4gKlxuICogRm9vLnByb3RvdHlwZS5jID0gMztcbiAqXG4gKiBfLmtleXMobmV3IEZvbyk7XG4gKiAvLyA9PiBbJ2EnLCAnYiddIChpdGVyYXRpb24gb3JkZXIgaXMgbm90IGd1YXJhbnRlZWQpXG4gKlxuICogXy5rZXlzKCdoaScpO1xuICogLy8gPT4gWycwJywgJzEnXVxuICovXG5mdW5jdGlvbiBrZXlzKG9iamVjdCkge1xuICByZXR1cm4gaXNBcnJheUxpa2Uob2JqZWN0KSA/IGFycmF5TGlrZUtleXMob2JqZWN0KSA6IGJhc2VLZXlzKG9iamVjdCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ga2V5cztcbiIsInZhciBjb3B5T2JqZWN0ID0gcmVxdWlyZSgnLi9fY29weU9iamVjdCcpLFxuICAgIGtleXMgPSByZXF1aXJlKCcuL2tleXMnKTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5hc3NpZ25gIHdpdGhvdXQgc3VwcG9ydCBmb3IgbXVsdGlwbGUgc291cmNlc1xuICogb3IgYGN1c3RvbWl6ZXJgIGZ1bmN0aW9ucy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgZGVzdGluYXRpb24gb2JqZWN0LlxuICogQHBhcmFtIHtPYmplY3R9IHNvdXJjZSBUaGUgc291cmNlIG9iamVjdC5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgYG9iamVjdGAuXG4gKi9cbmZ1bmN0aW9uIGJhc2VBc3NpZ24ob2JqZWN0LCBzb3VyY2UpIHtcbiAgcmV0dXJuIG9iamVjdCAmJiBjb3B5T2JqZWN0KHNvdXJjZSwga2V5cyhzb3VyY2UpLCBvYmplY3QpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VBc3NpZ247XG4iLCJ2YXIgY29weU9iamVjdCA9IHJlcXVpcmUoJy4vX2NvcHlPYmplY3QnKSxcbiAgICBrZXlzSW4gPSByZXF1aXJlKCcuL2tleXNJbicpO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmFzc2lnbkluYCB3aXRob3V0IHN1cHBvcnQgZm9yIG11bHRpcGxlIHNvdXJjZXNcbiAqIG9yIGBjdXN0b21pemVyYCBmdW5jdGlvbnMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIGRlc3RpbmF0aW9uIG9iamVjdC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBzb3VyY2UgVGhlIHNvdXJjZSBvYmplY3QuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGBvYmplY3RgLlxuICovXG5mdW5jdGlvbiBiYXNlQXNzaWduSW4ob2JqZWN0LCBzb3VyY2UpIHtcbiAgcmV0dXJuIG9iamVjdCAmJiBjb3B5T2JqZWN0KHNvdXJjZSwga2V5c0luKHNvdXJjZSksIG9iamVjdCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUFzc2lnbkluO1xuIiwiLyoqXG4gKiBBIHNwZWNpYWxpemVkIHZlcnNpb24gb2YgYF8uZmlsdGVyYCBmb3IgYXJyYXlzIHdpdGhvdXQgc3VwcG9ydCBmb3JcbiAqIGl0ZXJhdGVlIHNob3J0aGFuZHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl9IFthcnJheV0gVGhlIGFycmF5IHRvIGl0ZXJhdGUgb3Zlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHByZWRpY2F0ZSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBuZXcgZmlsdGVyZWQgYXJyYXkuXG4gKi9cbmZ1bmN0aW9uIGFycmF5RmlsdGVyKGFycmF5LCBwcmVkaWNhdGUpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBhcnJheSA9PSBudWxsID8gMCA6IGFycmF5Lmxlbmd0aCxcbiAgICAgIHJlc0luZGV4ID0gMCxcbiAgICAgIHJlc3VsdCA9IFtdO1xuXG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgdmFyIHZhbHVlID0gYXJyYXlbaW5kZXhdO1xuICAgIGlmIChwcmVkaWNhdGUodmFsdWUsIGluZGV4LCBhcnJheSkpIHtcbiAgICAgIHJlc3VsdFtyZXNJbmRleCsrXSA9IHZhbHVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFycmF5RmlsdGVyO1xuIiwiLyoqXG4gKiBUaGlzIG1ldGhvZCByZXR1cm5zIGEgbmV3IGVtcHR5IGFycmF5LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4xMy4wXG4gKiBAY2F0ZWdvcnkgVXRpbFxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBuZXcgZW1wdHkgYXJyYXkuXG4gKiBAZXhhbXBsZVxuICpcbiAqIHZhciBhcnJheXMgPSBfLnRpbWVzKDIsIF8uc3R1YkFycmF5KTtcbiAqXG4gKiBjb25zb2xlLmxvZyhhcnJheXMpO1xuICogLy8gPT4gW1tdLCBbXV1cbiAqXG4gKiBjb25zb2xlLmxvZyhhcnJheXNbMF0gPT09IGFycmF5c1sxXSk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBzdHViQXJyYXkoKSB7XG4gIHJldHVybiBbXTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzdHViQXJyYXk7XG4iLCJ2YXIgYXJyYXlGaWx0ZXIgPSByZXF1aXJlKCcuL19hcnJheUZpbHRlcicpLFxuICAgIHN0dWJBcnJheSA9IHJlcXVpcmUoJy4vc3R1YkFycmF5Jyk7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIHByb3BlcnR5SXNFbnVtZXJhYmxlID0gb2JqZWN0UHJvdG8ucHJvcGVydHlJc0VudW1lcmFibGU7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIGZvciB0aG9zZSB3aXRoIHRoZSBzYW1lIG5hbWUgYXMgb3RoZXIgYGxvZGFzaGAgbWV0aG9kcy4gKi9cbnZhciBuYXRpdmVHZXRTeW1ib2xzID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scztcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGFycmF5IG9mIHRoZSBvd24gZW51bWVyYWJsZSBzeW1ib2xzIG9mIGBvYmplY3RgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHN5bWJvbHMuXG4gKi9cbnZhciBnZXRTeW1ib2xzID0gIW5hdGl2ZUdldFN5bWJvbHMgPyBzdHViQXJyYXkgOiBmdW5jdGlvbihvYmplY3QpIHtcbiAgaWYgKG9iamVjdCA9PSBudWxsKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG4gIG9iamVjdCA9IE9iamVjdChvYmplY3QpO1xuICByZXR1cm4gYXJyYXlGaWx0ZXIobmF0aXZlR2V0U3ltYm9scyhvYmplY3QpLCBmdW5jdGlvbihzeW1ib2wpIHtcbiAgICByZXR1cm4gcHJvcGVydHlJc0VudW1lcmFibGUuY2FsbChvYmplY3QsIHN5bWJvbCk7XG4gIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBnZXRTeW1ib2xzO1xuIiwidmFyIGNvcHlPYmplY3QgPSByZXF1aXJlKCcuL19jb3B5T2JqZWN0JyksXG4gICAgZ2V0U3ltYm9scyA9IHJlcXVpcmUoJy4vX2dldFN5bWJvbHMnKTtcblxuLyoqXG4gKiBDb3BpZXMgb3duIHN5bWJvbHMgb2YgYHNvdXJjZWAgdG8gYG9iamVjdGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBzb3VyY2UgVGhlIG9iamVjdCB0byBjb3B5IHN5bWJvbHMgZnJvbS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb2JqZWN0PXt9XSBUaGUgb2JqZWN0IHRvIGNvcHkgc3ltYm9scyB0by5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgYG9iamVjdGAuXG4gKi9cbmZ1bmN0aW9uIGNvcHlTeW1ib2xzKHNvdXJjZSwgb2JqZWN0KSB7XG4gIHJldHVybiBjb3B5T2JqZWN0KHNvdXJjZSwgZ2V0U3ltYm9scyhzb3VyY2UpLCBvYmplY3QpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNvcHlTeW1ib2xzO1xuIiwiLyoqXG4gKiBBcHBlbmRzIHRoZSBlbGVtZW50cyBvZiBgdmFsdWVzYCB0byBgYXJyYXlgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gbW9kaWZ5LlxuICogQHBhcmFtIHtBcnJheX0gdmFsdWVzIFRoZSB2YWx1ZXMgdG8gYXBwZW5kLlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIGBhcnJheWAuXG4gKi9cbmZ1bmN0aW9uIGFycmF5UHVzaChhcnJheSwgdmFsdWVzKSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gdmFsdWVzLmxlbmd0aCxcbiAgICAgIG9mZnNldCA9IGFycmF5Lmxlbmd0aDtcblxuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIGFycmF5W29mZnNldCArIGluZGV4XSA9IHZhbHVlc1tpbmRleF07XG4gIH1cbiAgcmV0dXJuIGFycmF5O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFycmF5UHVzaDtcbiIsInZhciBhcnJheVB1c2ggPSByZXF1aXJlKCcuL19hcnJheVB1c2gnKSxcbiAgICBnZXRQcm90b3R5cGUgPSByZXF1aXJlKCcuL19nZXRQcm90b3R5cGUnKSxcbiAgICBnZXRTeW1ib2xzID0gcmVxdWlyZSgnLi9fZ2V0U3ltYm9scycpLFxuICAgIHN0dWJBcnJheSA9IHJlcXVpcmUoJy4vc3R1YkFycmF5Jyk7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIGZvciB0aG9zZSB3aXRoIHRoZSBzYW1lIG5hbWUgYXMgb3RoZXIgYGxvZGFzaGAgbWV0aG9kcy4gKi9cbnZhciBuYXRpdmVHZXRTeW1ib2xzID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scztcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGFycmF5IG9mIHRoZSBvd24gYW5kIGluaGVyaXRlZCBlbnVtZXJhYmxlIHN5bWJvbHMgb2YgYG9iamVjdGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2Ygc3ltYm9scy5cbiAqL1xudmFyIGdldFN5bWJvbHNJbiA9ICFuYXRpdmVHZXRTeW1ib2xzID8gc3R1YkFycmF5IDogZnVuY3Rpb24ob2JqZWN0KSB7XG4gIHZhciByZXN1bHQgPSBbXTtcbiAgd2hpbGUgKG9iamVjdCkge1xuICAgIGFycmF5UHVzaChyZXN1bHQsIGdldFN5bWJvbHMob2JqZWN0KSk7XG4gICAgb2JqZWN0ID0gZ2V0UHJvdG90eXBlKG9iamVjdCk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0U3ltYm9sc0luO1xuIiwidmFyIGNvcHlPYmplY3QgPSByZXF1aXJlKCcuL19jb3B5T2JqZWN0JyksXG4gICAgZ2V0U3ltYm9sc0luID0gcmVxdWlyZSgnLi9fZ2V0U3ltYm9sc0luJyk7XG5cbi8qKlxuICogQ29waWVzIG93biBhbmQgaW5oZXJpdGVkIHN5bWJvbHMgb2YgYHNvdXJjZWAgdG8gYG9iamVjdGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBzb3VyY2UgVGhlIG9iamVjdCB0byBjb3B5IHN5bWJvbHMgZnJvbS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb2JqZWN0PXt9XSBUaGUgb2JqZWN0IHRvIGNvcHkgc3ltYm9scyB0by5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgYG9iamVjdGAuXG4gKi9cbmZ1bmN0aW9uIGNvcHlTeW1ib2xzSW4oc291cmNlLCBvYmplY3QpIHtcbiAgcmV0dXJuIGNvcHlPYmplY3Qoc291cmNlLCBnZXRTeW1ib2xzSW4oc291cmNlKSwgb2JqZWN0KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjb3B5U3ltYm9sc0luO1xuIiwidmFyIGFycmF5UHVzaCA9IHJlcXVpcmUoJy4vX2FycmF5UHVzaCcpLFxuICAgIGlzQXJyYXkgPSByZXF1aXJlKCcuL2lzQXJyYXknKTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgZ2V0QWxsS2V5c2AgYW5kIGBnZXRBbGxLZXlzSW5gIHdoaWNoIHVzZXNcbiAqIGBrZXlzRnVuY2AgYW5kIGBzeW1ib2xzRnVuY2AgdG8gZ2V0IHRoZSBlbnVtZXJhYmxlIHByb3BlcnR5IG5hbWVzIGFuZFxuICogc3ltYm9scyBvZiBgb2JqZWN0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHBhcmFtIHtGdW5jdGlvbn0ga2V5c0Z1bmMgVGhlIGZ1bmN0aW9uIHRvIGdldCB0aGUga2V5cyBvZiBgb2JqZWN0YC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHN5bWJvbHNGdW5jIFRoZSBmdW5jdGlvbiB0byBnZXQgdGhlIHN5bWJvbHMgb2YgYG9iamVjdGAuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzIGFuZCBzeW1ib2xzLlxuICovXG5mdW5jdGlvbiBiYXNlR2V0QWxsS2V5cyhvYmplY3QsIGtleXNGdW5jLCBzeW1ib2xzRnVuYykge1xuICB2YXIgcmVzdWx0ID0ga2V5c0Z1bmMob2JqZWN0KTtcbiAgcmV0dXJuIGlzQXJyYXkob2JqZWN0KSA/IHJlc3VsdCA6IGFycmF5UHVzaChyZXN1bHQsIHN5bWJvbHNGdW5jKG9iamVjdCkpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VHZXRBbGxLZXlzO1xuIiwidmFyIGJhc2VHZXRBbGxLZXlzID0gcmVxdWlyZSgnLi9fYmFzZUdldEFsbEtleXMnKSxcbiAgICBnZXRTeW1ib2xzID0gcmVxdWlyZSgnLi9fZ2V0U3ltYm9scycpLFxuICAgIGtleXMgPSByZXF1aXJlKCcuL2tleXMnKTtcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGFycmF5IG9mIG93biBlbnVtZXJhYmxlIHByb3BlcnR5IG5hbWVzIGFuZCBzeW1ib2xzIG9mIGBvYmplY3RgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzIGFuZCBzeW1ib2xzLlxuICovXG5mdW5jdGlvbiBnZXRBbGxLZXlzKG9iamVjdCkge1xuICByZXR1cm4gYmFzZUdldEFsbEtleXMob2JqZWN0LCBrZXlzLCBnZXRTeW1ib2xzKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZXRBbGxLZXlzO1xuIiwidmFyIGJhc2VHZXRBbGxLZXlzID0gcmVxdWlyZSgnLi9fYmFzZUdldEFsbEtleXMnKSxcbiAgICBnZXRTeW1ib2xzSW4gPSByZXF1aXJlKCcuL19nZXRTeW1ib2xzSW4nKSxcbiAgICBrZXlzSW4gPSByZXF1aXJlKCcuL2tleXNJbicpO1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gYXJyYXkgb2Ygb3duIGFuZCBpbmhlcml0ZWQgZW51bWVyYWJsZSBwcm9wZXJ0eSBuYW1lcyBhbmRcbiAqIHN5bWJvbHMgb2YgYG9iamVjdGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMgYW5kIHN5bWJvbHMuXG4gKi9cbmZ1bmN0aW9uIGdldEFsbEtleXNJbihvYmplY3QpIHtcbiAgcmV0dXJuIGJhc2VHZXRBbGxLZXlzKG9iamVjdCwga2V5c0luLCBnZXRTeW1ib2xzSW4pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldEFsbEtleXNJbjtcbiIsInZhciBnZXROYXRpdmUgPSByZXF1aXJlKCcuL19nZXROYXRpdmUnKSxcbiAgICByb290ID0gcmVxdWlyZSgnLi9fcm9vdCcpO1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyB0aGF0IGFyZSB2ZXJpZmllZCB0byBiZSBuYXRpdmUuICovXG52YXIgRGF0YVZpZXcgPSBnZXROYXRpdmUocm9vdCwgJ0RhdGFWaWV3Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gRGF0YVZpZXc7XG4iLCJ2YXIgZ2V0TmF0aXZlID0gcmVxdWlyZSgnLi9fZ2V0TmF0aXZlJyksXG4gICAgcm9vdCA9IHJlcXVpcmUoJy4vX3Jvb3QnKTtcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgdGhhdCBhcmUgdmVyaWZpZWQgdG8gYmUgbmF0aXZlLiAqL1xudmFyIFByb21pc2UgPSBnZXROYXRpdmUocm9vdCwgJ1Byb21pc2UnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBQcm9taXNlO1xuIiwidmFyIGdldE5hdGl2ZSA9IHJlcXVpcmUoJy4vX2dldE5hdGl2ZScpLFxuICAgIHJvb3QgPSByZXF1aXJlKCcuL19yb290Jyk7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIHRoYXQgYXJlIHZlcmlmaWVkIHRvIGJlIG5hdGl2ZS4gKi9cbnZhciBTZXQgPSBnZXROYXRpdmUocm9vdCwgJ1NldCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNldDtcbiIsInZhciBnZXROYXRpdmUgPSByZXF1aXJlKCcuL19nZXROYXRpdmUnKSxcbiAgICByb290ID0gcmVxdWlyZSgnLi9fcm9vdCcpO1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyB0aGF0IGFyZSB2ZXJpZmllZCB0byBiZSBuYXRpdmUuICovXG52YXIgV2Vha01hcCA9IGdldE5hdGl2ZShyb290LCAnV2Vha01hcCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFdlYWtNYXA7XG4iLCJ2YXIgRGF0YVZpZXcgPSByZXF1aXJlKCcuL19EYXRhVmlldycpLFxuICAgIE1hcCA9IHJlcXVpcmUoJy4vX01hcCcpLFxuICAgIFByb21pc2UgPSByZXF1aXJlKCcuL19Qcm9taXNlJyksXG4gICAgU2V0ID0gcmVxdWlyZSgnLi9fU2V0JyksXG4gICAgV2Vha01hcCA9IHJlcXVpcmUoJy4vX1dlYWtNYXAnKSxcbiAgICBiYXNlR2V0VGFnID0gcmVxdWlyZSgnLi9fYmFzZUdldFRhZycpLFxuICAgIHRvU291cmNlID0gcmVxdWlyZSgnLi9fdG9Tb3VyY2UnKTtcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIG1hcFRhZyA9ICdbb2JqZWN0IE1hcF0nLFxuICAgIG9iamVjdFRhZyA9ICdbb2JqZWN0IE9iamVjdF0nLFxuICAgIHByb21pc2VUYWcgPSAnW29iamVjdCBQcm9taXNlXScsXG4gICAgc2V0VGFnID0gJ1tvYmplY3QgU2V0XScsXG4gICAgd2Vha01hcFRhZyA9ICdbb2JqZWN0IFdlYWtNYXBdJztcblxudmFyIGRhdGFWaWV3VGFnID0gJ1tvYmplY3QgRGF0YVZpZXddJztcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IG1hcHMsIHNldHMsIGFuZCB3ZWFrbWFwcy4gKi9cbnZhciBkYXRhVmlld0N0b3JTdHJpbmcgPSB0b1NvdXJjZShEYXRhVmlldyksXG4gICAgbWFwQ3RvclN0cmluZyA9IHRvU291cmNlKE1hcCksXG4gICAgcHJvbWlzZUN0b3JTdHJpbmcgPSB0b1NvdXJjZShQcm9taXNlKSxcbiAgICBzZXRDdG9yU3RyaW5nID0gdG9Tb3VyY2UoU2V0KSxcbiAgICB3ZWFrTWFwQ3RvclN0cmluZyA9IHRvU291cmNlKFdlYWtNYXApO1xuXG4vKipcbiAqIEdldHMgdGhlIGB0b1N0cmluZ1RhZ2Agb2YgYHZhbHVlYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBgdG9TdHJpbmdUYWdgLlxuICovXG52YXIgZ2V0VGFnID0gYmFzZUdldFRhZztcblxuLy8gRmFsbGJhY2sgZm9yIGRhdGEgdmlld3MsIG1hcHMsIHNldHMsIGFuZCB3ZWFrIG1hcHMgaW4gSUUgMTEgYW5kIHByb21pc2VzIGluIE5vZGUuanMgPCA2LlxuaWYgKChEYXRhVmlldyAmJiBnZXRUYWcobmV3IERhdGFWaWV3KG5ldyBBcnJheUJ1ZmZlcigxKSkpICE9IGRhdGFWaWV3VGFnKSB8fFxuICAgIChNYXAgJiYgZ2V0VGFnKG5ldyBNYXApICE9IG1hcFRhZykgfHxcbiAgICAoUHJvbWlzZSAmJiBnZXRUYWcoUHJvbWlzZS5yZXNvbHZlKCkpICE9IHByb21pc2VUYWcpIHx8XG4gICAgKFNldCAmJiBnZXRUYWcobmV3IFNldCkgIT0gc2V0VGFnKSB8fFxuICAgIChXZWFrTWFwICYmIGdldFRhZyhuZXcgV2Vha01hcCkgIT0gd2Vha01hcFRhZykpIHtcbiAgZ2V0VGFnID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICB2YXIgcmVzdWx0ID0gYmFzZUdldFRhZyh2YWx1ZSksXG4gICAgICAgIEN0b3IgPSByZXN1bHQgPT0gb2JqZWN0VGFnID8gdmFsdWUuY29uc3RydWN0b3IgOiB1bmRlZmluZWQsXG4gICAgICAgIGN0b3JTdHJpbmcgPSBDdG9yID8gdG9Tb3VyY2UoQ3RvcikgOiAnJztcblxuICAgIGlmIChjdG9yU3RyaW5nKSB7XG4gICAgICBzd2l0Y2ggKGN0b3JTdHJpbmcpIHtcbiAgICAgICAgY2FzZSBkYXRhVmlld0N0b3JTdHJpbmc6IHJldHVybiBkYXRhVmlld1RhZztcbiAgICAgICAgY2FzZSBtYXBDdG9yU3RyaW5nOiByZXR1cm4gbWFwVGFnO1xuICAgICAgICBjYXNlIHByb21pc2VDdG9yU3RyaW5nOiByZXR1cm4gcHJvbWlzZVRhZztcbiAgICAgICAgY2FzZSBzZXRDdG9yU3RyaW5nOiByZXR1cm4gc2V0VGFnO1xuICAgICAgICBjYXNlIHdlYWtNYXBDdG9yU3RyaW5nOiByZXR1cm4gd2Vha01hcFRhZztcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZXRUYWc7XG4iLCIvKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIEluaXRpYWxpemVzIGFuIGFycmF5IGNsb25lLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gY2xvbmUuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGluaXRpYWxpemVkIGNsb25lLlxuICovXG5mdW5jdGlvbiBpbml0Q2xvbmVBcnJheShhcnJheSkge1xuICB2YXIgbGVuZ3RoID0gYXJyYXkubGVuZ3RoLFxuICAgICAgcmVzdWx0ID0gYXJyYXkuY29uc3RydWN0b3IobGVuZ3RoKTtcblxuICAvLyBBZGQgcHJvcGVydGllcyBhc3NpZ25lZCBieSBgUmVnRXhwI2V4ZWNgLlxuICBpZiAobGVuZ3RoICYmIHR5cGVvZiBhcnJheVswXSA9PSAnc3RyaW5nJyAmJiBoYXNPd25Qcm9wZXJ0eS5jYWxsKGFycmF5LCAnaW5kZXgnKSkge1xuICAgIHJlc3VsdC5pbmRleCA9IGFycmF5LmluZGV4O1xuICAgIHJlc3VsdC5pbnB1dCA9IGFycmF5LmlucHV0O1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaW5pdENsb25lQXJyYXk7XG4iLCJ2YXIgY2xvbmVBcnJheUJ1ZmZlciA9IHJlcXVpcmUoJy4vX2Nsb25lQXJyYXlCdWZmZXInKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgY2xvbmUgb2YgYGRhdGFWaWV3YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IGRhdGFWaWV3IFRoZSBkYXRhIHZpZXcgdG8gY2xvbmUuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtpc0RlZXBdIFNwZWNpZnkgYSBkZWVwIGNsb25lLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgY2xvbmVkIGRhdGEgdmlldy5cbiAqL1xuZnVuY3Rpb24gY2xvbmVEYXRhVmlldyhkYXRhVmlldywgaXNEZWVwKSB7XG4gIHZhciBidWZmZXIgPSBpc0RlZXAgPyBjbG9uZUFycmF5QnVmZmVyKGRhdGFWaWV3LmJ1ZmZlcikgOiBkYXRhVmlldy5idWZmZXI7XG4gIHJldHVybiBuZXcgZGF0YVZpZXcuY29uc3RydWN0b3IoYnVmZmVyLCBkYXRhVmlldy5ieXRlT2Zmc2V0LCBkYXRhVmlldy5ieXRlTGVuZ3RoKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjbG9uZURhdGFWaWV3O1xuIiwiLyoqXG4gKiBBZGRzIHRoZSBrZXktdmFsdWUgYHBhaXJgIHRvIGBtYXBgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gbWFwIFRoZSBtYXAgdG8gbW9kaWZ5LlxuICogQHBhcmFtIHtBcnJheX0gcGFpciBUaGUga2V5LXZhbHVlIHBhaXIgdG8gYWRkLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBgbWFwYC5cbiAqL1xuZnVuY3Rpb24gYWRkTWFwRW50cnkobWFwLCBwYWlyKSB7XG4gIC8vIERvbid0IHJldHVybiBgbWFwLnNldGAgYmVjYXVzZSBpdCdzIG5vdCBjaGFpbmFibGUgaW4gSUUgMTEuXG4gIG1hcC5zZXQocGFpclswXSwgcGFpclsxXSk7XG4gIHJldHVybiBtYXA7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYWRkTWFwRW50cnk7XG4iLCIvKipcbiAqIEEgc3BlY2lhbGl6ZWQgdmVyc2lvbiBvZiBgXy5yZWR1Y2VgIGZvciBhcnJheXMgd2l0aG91dCBzdXBwb3J0IGZvclxuICogaXRlcmF0ZWUgc2hvcnRoYW5kcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheX0gW2FycmF5XSBUaGUgYXJyYXkgdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0ZWUgVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEBwYXJhbSB7Kn0gW2FjY3VtdWxhdG9yXSBUaGUgaW5pdGlhbCB2YWx1ZS5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2luaXRBY2N1bV0gU3BlY2lmeSB1c2luZyB0aGUgZmlyc3QgZWxlbWVudCBvZiBgYXJyYXlgIGFzXG4gKiAgdGhlIGluaXRpYWwgdmFsdWUuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgYWNjdW11bGF0ZWQgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIGFycmF5UmVkdWNlKGFycmF5LCBpdGVyYXRlZSwgYWNjdW11bGF0b3IsIGluaXRBY2N1bSkge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IGFycmF5ID09IG51bGwgPyAwIDogYXJyYXkubGVuZ3RoO1xuXG4gIGlmIChpbml0QWNjdW0gJiYgbGVuZ3RoKSB7XG4gICAgYWNjdW11bGF0b3IgPSBhcnJheVsrK2luZGV4XTtcbiAgfVxuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIGFjY3VtdWxhdG9yID0gaXRlcmF0ZWUoYWNjdW11bGF0b3IsIGFycmF5W2luZGV4XSwgaW5kZXgsIGFycmF5KTtcbiAgfVxuICByZXR1cm4gYWNjdW11bGF0b3I7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYXJyYXlSZWR1Y2U7XG4iLCIvKipcbiAqIENvbnZlcnRzIGBtYXBgIHRvIGl0cyBrZXktdmFsdWUgcGFpcnMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBtYXAgVGhlIG1hcCB0byBjb252ZXJ0LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBrZXktdmFsdWUgcGFpcnMuXG4gKi9cbmZ1bmN0aW9uIG1hcFRvQXJyYXkobWFwKSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgcmVzdWx0ID0gQXJyYXkobWFwLnNpemUpO1xuXG4gIG1hcC5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICByZXN1bHRbKytpbmRleF0gPSBba2V5LCB2YWx1ZV07XG4gIH0pO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG1hcFRvQXJyYXk7XG4iLCJ2YXIgYWRkTWFwRW50cnkgPSByZXF1aXJlKCcuL19hZGRNYXBFbnRyeScpLFxuICAgIGFycmF5UmVkdWNlID0gcmVxdWlyZSgnLi9fYXJyYXlSZWR1Y2UnKSxcbiAgICBtYXBUb0FycmF5ID0gcmVxdWlyZSgnLi9fbWFwVG9BcnJheScpO1xuXG4vKiogVXNlZCB0byBjb21wb3NlIGJpdG1hc2tzIGZvciBjbG9uaW5nLiAqL1xudmFyIENMT05FX0RFRVBfRkxBRyA9IDE7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGNsb25lIG9mIGBtYXBgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gbWFwIFRoZSBtYXAgdG8gY2xvbmUuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjbG9uZUZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGNsb25lIHZhbHVlcy5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzRGVlcF0gU3BlY2lmeSBhIGRlZXAgY2xvbmUuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBjbG9uZWQgbWFwLlxuICovXG5mdW5jdGlvbiBjbG9uZU1hcChtYXAsIGlzRGVlcCwgY2xvbmVGdW5jKSB7XG4gIHZhciBhcnJheSA9IGlzRGVlcCA/IGNsb25lRnVuYyhtYXBUb0FycmF5KG1hcCksIENMT05FX0RFRVBfRkxBRykgOiBtYXBUb0FycmF5KG1hcCk7XG4gIHJldHVybiBhcnJheVJlZHVjZShhcnJheSwgYWRkTWFwRW50cnksIG5ldyBtYXAuY29uc3RydWN0b3IpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsb25lTWFwO1xuIiwiLyoqIFVzZWQgdG8gbWF0Y2ggYFJlZ0V4cGAgZmxhZ3MgZnJvbSB0aGVpciBjb2VyY2VkIHN0cmluZyB2YWx1ZXMuICovXG52YXIgcmVGbGFncyA9IC9cXHcqJC87XG5cbi8qKlxuICogQ3JlYXRlcyBhIGNsb25lIG9mIGByZWdleHBgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gcmVnZXhwIFRoZSByZWdleHAgdG8gY2xvbmUuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBjbG9uZWQgcmVnZXhwLlxuICovXG5mdW5jdGlvbiBjbG9uZVJlZ0V4cChyZWdleHApIHtcbiAgdmFyIHJlc3VsdCA9IG5ldyByZWdleHAuY29uc3RydWN0b3IocmVnZXhwLnNvdXJjZSwgcmVGbGFncy5leGVjKHJlZ2V4cCkpO1xuICByZXN1bHQubGFzdEluZGV4ID0gcmVnZXhwLmxhc3RJbmRleDtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjbG9uZVJlZ0V4cDtcbiIsIi8qKlxuICogQWRkcyBgdmFsdWVgIHRvIGBzZXRgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gc2V0IFRoZSBzZXQgdG8gbW9kaWZ5LlxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gYWRkLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBgc2V0YC5cbiAqL1xuZnVuY3Rpb24gYWRkU2V0RW50cnkoc2V0LCB2YWx1ZSkge1xuICAvLyBEb24ndCByZXR1cm4gYHNldC5hZGRgIGJlY2F1c2UgaXQncyBub3QgY2hhaW5hYmxlIGluIElFIDExLlxuICBzZXQuYWRkKHZhbHVlKTtcbiAgcmV0dXJuIHNldDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBhZGRTZXRFbnRyeTtcbiIsIi8qKlxuICogQ29udmVydHMgYHNldGAgdG8gYW4gYXJyYXkgb2YgaXRzIHZhbHVlcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IHNldCBUaGUgc2V0IHRvIGNvbnZlcnQuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIHZhbHVlcy5cbiAqL1xuZnVuY3Rpb24gc2V0VG9BcnJheShzZXQpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICByZXN1bHQgPSBBcnJheShzZXQuc2l6ZSk7XG5cbiAgc2V0LmZvckVhY2goZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXN1bHRbKytpbmRleF0gPSB2YWx1ZTtcbiAgfSk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc2V0VG9BcnJheTtcbiIsInZhciBhZGRTZXRFbnRyeSA9IHJlcXVpcmUoJy4vX2FkZFNldEVudHJ5JyksXG4gICAgYXJyYXlSZWR1Y2UgPSByZXF1aXJlKCcuL19hcnJheVJlZHVjZScpLFxuICAgIHNldFRvQXJyYXkgPSByZXF1aXJlKCcuL19zZXRUb0FycmF5Jyk7XG5cbi8qKiBVc2VkIHRvIGNvbXBvc2UgYml0bWFza3MgZm9yIGNsb25pbmcuICovXG52YXIgQ0xPTkVfREVFUF9GTEFHID0gMTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgY2xvbmUgb2YgYHNldGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBzZXQgVGhlIHNldCB0byBjbG9uZS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNsb25lRnVuYyBUaGUgZnVuY3Rpb24gdG8gY2xvbmUgdmFsdWVzLlxuICogQHBhcmFtIHtib29sZWFufSBbaXNEZWVwXSBTcGVjaWZ5IGEgZGVlcCBjbG9uZS5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIGNsb25lZCBzZXQuXG4gKi9cbmZ1bmN0aW9uIGNsb25lU2V0KHNldCwgaXNEZWVwLCBjbG9uZUZ1bmMpIHtcbiAgdmFyIGFycmF5ID0gaXNEZWVwID8gY2xvbmVGdW5jKHNldFRvQXJyYXkoc2V0KSwgQ0xPTkVfREVFUF9GTEFHKSA6IHNldFRvQXJyYXkoc2V0KTtcbiAgcmV0dXJuIGFycmF5UmVkdWNlKGFycmF5LCBhZGRTZXRFbnRyeSwgbmV3IHNldC5jb25zdHJ1Y3Rvcik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY2xvbmVTZXQ7XG4iLCJ2YXIgU3ltYm9sID0gcmVxdWlyZSgnLi9fU3ltYm9sJyk7XG5cbi8qKiBVc2VkIHRvIGNvbnZlcnQgc3ltYm9scyB0byBwcmltaXRpdmVzIGFuZCBzdHJpbmdzLiAqL1xudmFyIHN5bWJvbFByb3RvID0gU3ltYm9sID8gU3ltYm9sLnByb3RvdHlwZSA6IHVuZGVmaW5lZCxcbiAgICBzeW1ib2xWYWx1ZU9mID0gc3ltYm9sUHJvdG8gPyBzeW1ib2xQcm90by52YWx1ZU9mIDogdW5kZWZpbmVkO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBjbG9uZSBvZiB0aGUgYHN5bWJvbGAgb2JqZWN0LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gc3ltYm9sIFRoZSBzeW1ib2wgb2JqZWN0IHRvIGNsb25lLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgY2xvbmVkIHN5bWJvbCBvYmplY3QuXG4gKi9cbmZ1bmN0aW9uIGNsb25lU3ltYm9sKHN5bWJvbCkge1xuICByZXR1cm4gc3ltYm9sVmFsdWVPZiA/IE9iamVjdChzeW1ib2xWYWx1ZU9mLmNhbGwoc3ltYm9sKSkgOiB7fTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjbG9uZVN5bWJvbDtcbiIsInZhciBjbG9uZUFycmF5QnVmZmVyID0gcmVxdWlyZSgnLi9fY2xvbmVBcnJheUJ1ZmZlcicpLFxuICAgIGNsb25lRGF0YVZpZXcgPSByZXF1aXJlKCcuL19jbG9uZURhdGFWaWV3JyksXG4gICAgY2xvbmVNYXAgPSByZXF1aXJlKCcuL19jbG9uZU1hcCcpLFxuICAgIGNsb25lUmVnRXhwID0gcmVxdWlyZSgnLi9fY2xvbmVSZWdFeHAnKSxcbiAgICBjbG9uZVNldCA9IHJlcXVpcmUoJy4vX2Nsb25lU2V0JyksXG4gICAgY2xvbmVTeW1ib2wgPSByZXF1aXJlKCcuL19jbG9uZVN5bWJvbCcpLFxuICAgIGNsb25lVHlwZWRBcnJheSA9IHJlcXVpcmUoJy4vX2Nsb25lVHlwZWRBcnJheScpO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgYm9vbFRhZyA9ICdbb2JqZWN0IEJvb2xlYW5dJyxcbiAgICBkYXRlVGFnID0gJ1tvYmplY3QgRGF0ZV0nLFxuICAgIG1hcFRhZyA9ICdbb2JqZWN0IE1hcF0nLFxuICAgIG51bWJlclRhZyA9ICdbb2JqZWN0IE51bWJlcl0nLFxuICAgIHJlZ2V4cFRhZyA9ICdbb2JqZWN0IFJlZ0V4cF0nLFxuICAgIHNldFRhZyA9ICdbb2JqZWN0IFNldF0nLFxuICAgIHN0cmluZ1RhZyA9ICdbb2JqZWN0IFN0cmluZ10nLFxuICAgIHN5bWJvbFRhZyA9ICdbb2JqZWN0IFN5bWJvbF0nO1xuXG52YXIgYXJyYXlCdWZmZXJUYWcgPSAnW29iamVjdCBBcnJheUJ1ZmZlcl0nLFxuICAgIGRhdGFWaWV3VGFnID0gJ1tvYmplY3QgRGF0YVZpZXddJyxcbiAgICBmbG9hdDMyVGFnID0gJ1tvYmplY3QgRmxvYXQzMkFycmF5XScsXG4gICAgZmxvYXQ2NFRhZyA9ICdbb2JqZWN0IEZsb2F0NjRBcnJheV0nLFxuICAgIGludDhUYWcgPSAnW29iamVjdCBJbnQ4QXJyYXldJyxcbiAgICBpbnQxNlRhZyA9ICdbb2JqZWN0IEludDE2QXJyYXldJyxcbiAgICBpbnQzMlRhZyA9ICdbb2JqZWN0IEludDMyQXJyYXldJyxcbiAgICB1aW50OFRhZyA9ICdbb2JqZWN0IFVpbnQ4QXJyYXldJyxcbiAgICB1aW50OENsYW1wZWRUYWcgPSAnW29iamVjdCBVaW50OENsYW1wZWRBcnJheV0nLFxuICAgIHVpbnQxNlRhZyA9ICdbb2JqZWN0IFVpbnQxNkFycmF5XScsXG4gICAgdWludDMyVGFnID0gJ1tvYmplY3QgVWludDMyQXJyYXldJztcblxuLyoqXG4gKiBJbml0aWFsaXplcyBhbiBvYmplY3QgY2xvbmUgYmFzZWQgb24gaXRzIGB0b1N0cmluZ1RhZ2AuXG4gKlxuICogKipOb3RlOioqIFRoaXMgZnVuY3Rpb24gb25seSBzdXBwb3J0cyBjbG9uaW5nIHZhbHVlcyB3aXRoIHRhZ3Mgb2ZcbiAqIGBCb29sZWFuYCwgYERhdGVgLCBgRXJyb3JgLCBgTnVtYmVyYCwgYFJlZ0V4cGAsIG9yIGBTdHJpbmdgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gY2xvbmUuXG4gKiBAcGFyYW0ge3N0cmluZ30gdGFnIFRoZSBgdG9TdHJpbmdUYWdgIG9mIHRoZSBvYmplY3QgdG8gY2xvbmUuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjbG9uZUZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGNsb25lIHZhbHVlcy5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzRGVlcF0gU3BlY2lmeSBhIGRlZXAgY2xvbmUuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBpbml0aWFsaXplZCBjbG9uZS5cbiAqL1xuZnVuY3Rpb24gaW5pdENsb25lQnlUYWcob2JqZWN0LCB0YWcsIGNsb25lRnVuYywgaXNEZWVwKSB7XG4gIHZhciBDdG9yID0gb2JqZWN0LmNvbnN0cnVjdG9yO1xuICBzd2l0Y2ggKHRhZykge1xuICAgIGNhc2UgYXJyYXlCdWZmZXJUYWc6XG4gICAgICByZXR1cm4gY2xvbmVBcnJheUJ1ZmZlcihvYmplY3QpO1xuXG4gICAgY2FzZSBib29sVGFnOlxuICAgIGNhc2UgZGF0ZVRhZzpcbiAgICAgIHJldHVybiBuZXcgQ3Rvcigrb2JqZWN0KTtcblxuICAgIGNhc2UgZGF0YVZpZXdUYWc6XG4gICAgICByZXR1cm4gY2xvbmVEYXRhVmlldyhvYmplY3QsIGlzRGVlcCk7XG5cbiAgICBjYXNlIGZsb2F0MzJUYWc6IGNhc2UgZmxvYXQ2NFRhZzpcbiAgICBjYXNlIGludDhUYWc6IGNhc2UgaW50MTZUYWc6IGNhc2UgaW50MzJUYWc6XG4gICAgY2FzZSB1aW50OFRhZzogY2FzZSB1aW50OENsYW1wZWRUYWc6IGNhc2UgdWludDE2VGFnOiBjYXNlIHVpbnQzMlRhZzpcbiAgICAgIHJldHVybiBjbG9uZVR5cGVkQXJyYXkob2JqZWN0LCBpc0RlZXApO1xuXG4gICAgY2FzZSBtYXBUYWc6XG4gICAgICByZXR1cm4gY2xvbmVNYXAob2JqZWN0LCBpc0RlZXAsIGNsb25lRnVuYyk7XG5cbiAgICBjYXNlIG51bWJlclRhZzpcbiAgICBjYXNlIHN0cmluZ1RhZzpcbiAgICAgIHJldHVybiBuZXcgQ3RvcihvYmplY3QpO1xuXG4gICAgY2FzZSByZWdleHBUYWc6XG4gICAgICByZXR1cm4gY2xvbmVSZWdFeHAob2JqZWN0KTtcblxuICAgIGNhc2Ugc2V0VGFnOlxuICAgICAgcmV0dXJuIGNsb25lU2V0KG9iamVjdCwgaXNEZWVwLCBjbG9uZUZ1bmMpO1xuXG4gICAgY2FzZSBzeW1ib2xUYWc6XG4gICAgICByZXR1cm4gY2xvbmVTeW1ib2wob2JqZWN0KTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGluaXRDbG9uZUJ5VGFnO1xuIiwidmFyIFN0YWNrID0gcmVxdWlyZSgnLi9fU3RhY2snKSxcbiAgICBhcnJheUVhY2ggPSByZXF1aXJlKCcuL19hcnJheUVhY2gnKSxcbiAgICBhc3NpZ25WYWx1ZSA9IHJlcXVpcmUoJy4vX2Fzc2lnblZhbHVlJyksXG4gICAgYmFzZUFzc2lnbiA9IHJlcXVpcmUoJy4vX2Jhc2VBc3NpZ24nKSxcbiAgICBiYXNlQXNzaWduSW4gPSByZXF1aXJlKCcuL19iYXNlQXNzaWduSW4nKSxcbiAgICBjbG9uZUJ1ZmZlciA9IHJlcXVpcmUoJy4vX2Nsb25lQnVmZmVyJyksXG4gICAgY29weUFycmF5ID0gcmVxdWlyZSgnLi9fY29weUFycmF5JyksXG4gICAgY29weVN5bWJvbHMgPSByZXF1aXJlKCcuL19jb3B5U3ltYm9scycpLFxuICAgIGNvcHlTeW1ib2xzSW4gPSByZXF1aXJlKCcuL19jb3B5U3ltYm9sc0luJyksXG4gICAgZ2V0QWxsS2V5cyA9IHJlcXVpcmUoJy4vX2dldEFsbEtleXMnKSxcbiAgICBnZXRBbGxLZXlzSW4gPSByZXF1aXJlKCcuL19nZXRBbGxLZXlzSW4nKSxcbiAgICBnZXRUYWcgPSByZXF1aXJlKCcuL19nZXRUYWcnKSxcbiAgICBpbml0Q2xvbmVBcnJheSA9IHJlcXVpcmUoJy4vX2luaXRDbG9uZUFycmF5JyksXG4gICAgaW5pdENsb25lQnlUYWcgPSByZXF1aXJlKCcuL19pbml0Q2xvbmVCeVRhZycpLFxuICAgIGluaXRDbG9uZU9iamVjdCA9IHJlcXVpcmUoJy4vX2luaXRDbG9uZU9iamVjdCcpLFxuICAgIGlzQXJyYXkgPSByZXF1aXJlKCcuL2lzQXJyYXknKSxcbiAgICBpc0J1ZmZlciA9IHJlcXVpcmUoJy4vaXNCdWZmZXInKSxcbiAgICBpc09iamVjdCA9IHJlcXVpcmUoJy4vaXNPYmplY3QnKSxcbiAgICBrZXlzID0gcmVxdWlyZSgnLi9rZXlzJyk7XG5cbi8qKiBVc2VkIHRvIGNvbXBvc2UgYml0bWFza3MgZm9yIGNsb25pbmcuICovXG52YXIgQ0xPTkVfREVFUF9GTEFHID0gMSxcbiAgICBDTE9ORV9GTEFUX0ZMQUcgPSAyLFxuICAgIENMT05FX1NZTUJPTFNfRkxBRyA9IDQ7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBhcmdzVGFnID0gJ1tvYmplY3QgQXJndW1lbnRzXScsXG4gICAgYXJyYXlUYWcgPSAnW29iamVjdCBBcnJheV0nLFxuICAgIGJvb2xUYWcgPSAnW29iamVjdCBCb29sZWFuXScsXG4gICAgZGF0ZVRhZyA9ICdbb2JqZWN0IERhdGVdJyxcbiAgICBlcnJvclRhZyA9ICdbb2JqZWN0IEVycm9yXScsXG4gICAgZnVuY1RhZyA9ICdbb2JqZWN0IEZ1bmN0aW9uXScsXG4gICAgZ2VuVGFnID0gJ1tvYmplY3QgR2VuZXJhdG9yRnVuY3Rpb25dJyxcbiAgICBtYXBUYWcgPSAnW29iamVjdCBNYXBdJyxcbiAgICBudW1iZXJUYWcgPSAnW29iamVjdCBOdW1iZXJdJyxcbiAgICBvYmplY3RUYWcgPSAnW29iamVjdCBPYmplY3RdJyxcbiAgICByZWdleHBUYWcgPSAnW29iamVjdCBSZWdFeHBdJyxcbiAgICBzZXRUYWcgPSAnW29iamVjdCBTZXRdJyxcbiAgICBzdHJpbmdUYWcgPSAnW29iamVjdCBTdHJpbmddJyxcbiAgICBzeW1ib2xUYWcgPSAnW29iamVjdCBTeW1ib2xdJyxcbiAgICB3ZWFrTWFwVGFnID0gJ1tvYmplY3QgV2Vha01hcF0nO1xuXG52YXIgYXJyYXlCdWZmZXJUYWcgPSAnW29iamVjdCBBcnJheUJ1ZmZlcl0nLFxuICAgIGRhdGFWaWV3VGFnID0gJ1tvYmplY3QgRGF0YVZpZXddJyxcbiAgICBmbG9hdDMyVGFnID0gJ1tvYmplY3QgRmxvYXQzMkFycmF5XScsXG4gICAgZmxvYXQ2NFRhZyA9ICdbb2JqZWN0IEZsb2F0NjRBcnJheV0nLFxuICAgIGludDhUYWcgPSAnW29iamVjdCBJbnQ4QXJyYXldJyxcbiAgICBpbnQxNlRhZyA9ICdbb2JqZWN0IEludDE2QXJyYXldJyxcbiAgICBpbnQzMlRhZyA9ICdbb2JqZWN0IEludDMyQXJyYXldJyxcbiAgICB1aW50OFRhZyA9ICdbb2JqZWN0IFVpbnQ4QXJyYXldJyxcbiAgICB1aW50OENsYW1wZWRUYWcgPSAnW29iamVjdCBVaW50OENsYW1wZWRBcnJheV0nLFxuICAgIHVpbnQxNlRhZyA9ICdbb2JqZWN0IFVpbnQxNkFycmF5XScsXG4gICAgdWludDMyVGFnID0gJ1tvYmplY3QgVWludDMyQXJyYXldJztcblxuLyoqIFVzZWQgdG8gaWRlbnRpZnkgYHRvU3RyaW5nVGFnYCB2YWx1ZXMgc3VwcG9ydGVkIGJ5IGBfLmNsb25lYC4gKi9cbnZhciBjbG9uZWFibGVUYWdzID0ge307XG5jbG9uZWFibGVUYWdzW2FyZ3NUYWddID0gY2xvbmVhYmxlVGFnc1thcnJheVRhZ10gPVxuY2xvbmVhYmxlVGFnc1thcnJheUJ1ZmZlclRhZ10gPSBjbG9uZWFibGVUYWdzW2RhdGFWaWV3VGFnXSA9XG5jbG9uZWFibGVUYWdzW2Jvb2xUYWddID0gY2xvbmVhYmxlVGFnc1tkYXRlVGFnXSA9XG5jbG9uZWFibGVUYWdzW2Zsb2F0MzJUYWddID0gY2xvbmVhYmxlVGFnc1tmbG9hdDY0VGFnXSA9XG5jbG9uZWFibGVUYWdzW2ludDhUYWddID0gY2xvbmVhYmxlVGFnc1tpbnQxNlRhZ10gPVxuY2xvbmVhYmxlVGFnc1tpbnQzMlRhZ10gPSBjbG9uZWFibGVUYWdzW21hcFRhZ10gPVxuY2xvbmVhYmxlVGFnc1tudW1iZXJUYWddID0gY2xvbmVhYmxlVGFnc1tvYmplY3RUYWddID1cbmNsb25lYWJsZVRhZ3NbcmVnZXhwVGFnXSA9IGNsb25lYWJsZVRhZ3Nbc2V0VGFnXSA9XG5jbG9uZWFibGVUYWdzW3N0cmluZ1RhZ10gPSBjbG9uZWFibGVUYWdzW3N5bWJvbFRhZ10gPVxuY2xvbmVhYmxlVGFnc1t1aW50OFRhZ10gPSBjbG9uZWFibGVUYWdzW3VpbnQ4Q2xhbXBlZFRhZ10gPVxuY2xvbmVhYmxlVGFnc1t1aW50MTZUYWddID0gY2xvbmVhYmxlVGFnc1t1aW50MzJUYWddID0gdHJ1ZTtcbmNsb25lYWJsZVRhZ3NbZXJyb3JUYWddID0gY2xvbmVhYmxlVGFnc1tmdW5jVGFnXSA9XG5jbG9uZWFibGVUYWdzW3dlYWtNYXBUYWddID0gZmFsc2U7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uY2xvbmVgIGFuZCBgXy5jbG9uZURlZXBgIHdoaWNoIHRyYWNrc1xuICogdHJhdmVyc2VkIG9iamVjdHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNsb25lLlxuICogQHBhcmFtIHtib29sZWFufSBiaXRtYXNrIFRoZSBiaXRtYXNrIGZsYWdzLlxuICogIDEgLSBEZWVwIGNsb25lXG4gKiAgMiAtIEZsYXR0ZW4gaW5oZXJpdGVkIHByb3BlcnRpZXNcbiAqICA0IC0gQ2xvbmUgc3ltYm9sc1xuICogQHBhcmFtIHtGdW5jdGlvbn0gW2N1c3RvbWl6ZXJdIFRoZSBmdW5jdGlvbiB0byBjdXN0b21pemUgY2xvbmluZy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBba2V5XSBUaGUga2V5IG9mIGB2YWx1ZWAuXG4gKiBAcGFyYW0ge09iamVjdH0gW29iamVjdF0gVGhlIHBhcmVudCBvYmplY3Qgb2YgYHZhbHVlYC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbc3RhY2tdIFRyYWNrcyB0cmF2ZXJzZWQgb2JqZWN0cyBhbmQgdGhlaXIgY2xvbmUgY291bnRlcnBhcnRzLlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIGNsb25lZCB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gYmFzZUNsb25lKHZhbHVlLCBiaXRtYXNrLCBjdXN0b21pemVyLCBrZXksIG9iamVjdCwgc3RhY2spIHtcbiAgdmFyIHJlc3VsdCxcbiAgICAgIGlzRGVlcCA9IGJpdG1hc2sgJiBDTE9ORV9ERUVQX0ZMQUcsXG4gICAgICBpc0ZsYXQgPSBiaXRtYXNrICYgQ0xPTkVfRkxBVF9GTEFHLFxuICAgICAgaXNGdWxsID0gYml0bWFzayAmIENMT05FX1NZTUJPTFNfRkxBRztcblxuICBpZiAoY3VzdG9taXplcikge1xuICAgIHJlc3VsdCA9IG9iamVjdCA/IGN1c3RvbWl6ZXIodmFsdWUsIGtleSwgb2JqZWN0LCBzdGFjaykgOiBjdXN0b21pemVyKHZhbHVlKTtcbiAgfVxuICBpZiAocmVzdWx0ICE9PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG4gIGlmICghaXNPYmplY3QodmFsdWUpKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG4gIHZhciBpc0FyciA9IGlzQXJyYXkodmFsdWUpO1xuICBpZiAoaXNBcnIpIHtcbiAgICByZXN1bHQgPSBpbml0Q2xvbmVBcnJheSh2YWx1ZSk7XG4gICAgaWYgKCFpc0RlZXApIHtcbiAgICAgIHJldHVybiBjb3B5QXJyYXkodmFsdWUsIHJlc3VsdCk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHZhciB0YWcgPSBnZXRUYWcodmFsdWUpLFxuICAgICAgICBpc0Z1bmMgPSB0YWcgPT0gZnVuY1RhZyB8fCB0YWcgPT0gZ2VuVGFnO1xuXG4gICAgaWYgKGlzQnVmZmVyKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGNsb25lQnVmZmVyKHZhbHVlLCBpc0RlZXApO1xuICAgIH1cbiAgICBpZiAodGFnID09IG9iamVjdFRhZyB8fCB0YWcgPT0gYXJnc1RhZyB8fCAoaXNGdW5jICYmICFvYmplY3QpKSB7XG4gICAgICByZXN1bHQgPSAoaXNGbGF0IHx8IGlzRnVuYykgPyB7fSA6IGluaXRDbG9uZU9iamVjdCh2YWx1ZSk7XG4gICAgICBpZiAoIWlzRGVlcCkge1xuICAgICAgICByZXR1cm4gaXNGbGF0XG4gICAgICAgICAgPyBjb3B5U3ltYm9sc0luKHZhbHVlLCBiYXNlQXNzaWduSW4ocmVzdWx0LCB2YWx1ZSkpXG4gICAgICAgICAgOiBjb3B5U3ltYm9scyh2YWx1ZSwgYmFzZUFzc2lnbihyZXN1bHQsIHZhbHVlKSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICghY2xvbmVhYmxlVGFnc1t0YWddKSB7XG4gICAgICAgIHJldHVybiBvYmplY3QgPyB2YWx1ZSA6IHt9O1xuICAgICAgfVxuICAgICAgcmVzdWx0ID0gaW5pdENsb25lQnlUYWcodmFsdWUsIHRhZywgYmFzZUNsb25lLCBpc0RlZXApO1xuICAgIH1cbiAgfVxuICAvLyBDaGVjayBmb3IgY2lyY3VsYXIgcmVmZXJlbmNlcyBhbmQgcmV0dXJuIGl0cyBjb3JyZXNwb25kaW5nIGNsb25lLlxuICBzdGFjayB8fCAoc3RhY2sgPSBuZXcgU3RhY2spO1xuICB2YXIgc3RhY2tlZCA9IHN0YWNrLmdldCh2YWx1ZSk7XG4gIGlmIChzdGFja2VkKSB7XG4gICAgcmV0dXJuIHN0YWNrZWQ7XG4gIH1cbiAgc3RhY2suc2V0KHZhbHVlLCByZXN1bHQpO1xuXG4gIHZhciBrZXlzRnVuYyA9IGlzRnVsbFxuICAgID8gKGlzRmxhdCA/IGdldEFsbEtleXNJbiA6IGdldEFsbEtleXMpXG4gICAgOiAoaXNGbGF0ID8ga2V5c0luIDoga2V5cyk7XG5cbiAgdmFyIHByb3BzID0gaXNBcnIgPyB1bmRlZmluZWQgOiBrZXlzRnVuYyh2YWx1ZSk7XG4gIGFycmF5RWFjaChwcm9wcyB8fCB2YWx1ZSwgZnVuY3Rpb24oc3ViVmFsdWUsIGtleSkge1xuICAgIGlmIChwcm9wcykge1xuICAgICAga2V5ID0gc3ViVmFsdWU7XG4gICAgICBzdWJWYWx1ZSA9IHZhbHVlW2tleV07XG4gICAgfVxuICAgIC8vIFJlY3Vyc2l2ZWx5IHBvcHVsYXRlIGNsb25lIChzdXNjZXB0aWJsZSB0byBjYWxsIHN0YWNrIGxpbWl0cykuXG4gICAgYXNzaWduVmFsdWUocmVzdWx0LCBrZXksIGJhc2VDbG9uZShzdWJWYWx1ZSwgYml0bWFzaywgY3VzdG9taXplciwga2V5LCB2YWx1ZSwgc3RhY2spKTtcbiAgfSk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUNsb25lO1xuIiwidmFyIGJhc2VDbG9uZSA9IHJlcXVpcmUoJy4vX2Jhc2VDbG9uZScpO1xuXG4vKiogVXNlZCB0byBjb21wb3NlIGJpdG1hc2tzIGZvciBjbG9uaW5nLiAqL1xudmFyIENMT05FX0RFRVBfRkxBRyA9IDEsXG4gICAgQ0xPTkVfU1lNQk9MU19GTEFHID0gNDtcblxuLyoqXG4gKiBUaGlzIG1ldGhvZCBpcyBsaWtlIGBfLmNsb25lYCBleGNlcHQgdGhhdCBpdCByZWN1cnNpdmVseSBjbG9uZXMgYHZhbHVlYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDEuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcmVjdXJzaXZlbHkgY2xvbmUuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgZGVlcCBjbG9uZWQgdmFsdWUuXG4gKiBAc2VlIF8uY2xvbmVcbiAqIEBleGFtcGxlXG4gKlxuICogdmFyIG9iamVjdHMgPSBbeyAnYSc6IDEgfSwgeyAnYic6IDIgfV07XG4gKlxuICogdmFyIGRlZXAgPSBfLmNsb25lRGVlcChvYmplY3RzKTtcbiAqIGNvbnNvbGUubG9nKGRlZXBbMF0gPT09IG9iamVjdHNbMF0pO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gY2xvbmVEZWVwKHZhbHVlKSB7XG4gIHJldHVybiBiYXNlQ2xvbmUodmFsdWUsIENMT05FX0RFRVBfRkxBRyB8IENMT05FX1NZTUJPTFNfRkxBRyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY2xvbmVEZWVwO1xuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZXJyb3JIYW5kbGVyIChlcnJvck9yU3RyaW5nLCB2bSkge1xuICBjb25zdCBlcnJvciA9ICh0eXBlb2YgZXJyb3JPclN0cmluZyA9PT0gJ29iamVjdCcpXG4gICAgPyBlcnJvck9yU3RyaW5nXG4gICAgOiBuZXcgRXJyb3IoZXJyb3JPclN0cmluZylcblxuICB2bS5fZXJyb3IgPSBlcnJvclxuXG4gIHRocm93IGVycm9yXG59XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgVnVlIGZyb20gJ3Z1ZSdcbmltcG9ydCBjbG9uZURlZXAgZnJvbSAnbG9kYXNoL2Nsb25lRGVlcCdcbmltcG9ydCBlcnJvckhhbmRsZXIgZnJvbSAnLi9lcnJvci1oYW5kbGVyJ1xuXG5mdW5jdGlvbiBjcmVhdGVMb2NhbFZ1ZSAoKTogQ29tcG9uZW50IHtcbiAgY29uc3QgaW5zdGFuY2UgPSBWdWUuZXh0ZW5kKClcblxuICAvLyBjbG9uZSBnbG9iYWwgQVBJc1xuICBPYmplY3Qua2V5cyhWdWUpLmZvckVhY2goa2V5ID0+IHtcbiAgICBpZiAoIWluc3RhbmNlLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgIGNvbnN0IG9yaWdpbmFsID0gVnVlW2tleV1cbiAgICAgIGluc3RhbmNlW2tleV0gPSB0eXBlb2Ygb3JpZ2luYWwgPT09ICdvYmplY3QnXG4gICAgICAgID8gY2xvbmVEZWVwKG9yaWdpbmFsKVxuICAgICAgICA6IG9yaWdpbmFsXG4gICAgfVxuICB9KVxuXG4gIC8vIGNvbmZpZyBpcyBub3QgZW51bWVyYWJsZVxuICBpbnN0YW5jZS5jb25maWcgPSBjbG9uZURlZXAoVnVlLmNvbmZpZylcblxuICBpbnN0YW5jZS5jb25maWcuZXJyb3JIYW5kbGVyID0gZXJyb3JIYW5kbGVyXG5cbiAgLy8gb3B0aW9uIG1lcmdlIHN0cmF0ZWdpZXMgbmVlZCB0byBiZSBleHBvc2VkIGJ5IHJlZmVyZW5jZVxuICAvLyBzbyB0aGF0IG1lcmdlIHN0cmF0cyByZWdpc3RlcmVkIGJ5IHBsdWdpbnMgY2FuIHdvcmsgcHJvcGVybHlcbiAgaW5zdGFuY2UuY29uZmlnLm9wdGlvbk1lcmdlU3RyYXRlZ2llcyA9IFZ1ZS5jb25maWcub3B0aW9uTWVyZ2VTdHJhdGVnaWVzXG5cbiAgLy8gbWFrZSBzdXJlIGFsbCBleHRlbmRzIGFyZSBiYXNlZCBvbiB0aGlzIGluc3RhbmNlLlxuICAvLyB0aGlzIGlzIGltcG9ydGFudCBzbyB0aGF0IGdsb2JhbCBjb21wb25lbnRzIHJlZ2lzdGVyZWQgYnkgcGx1Z2lucyxcbiAgLy8gZS5nLiByb3V0ZXItbGluayBhcmUgY3JlYXRlZCB1c2luZyB0aGUgY29ycmVjdCBiYXNlIGNvbnN0cnVjdG9yXG4gIGluc3RhbmNlLm9wdGlvbnMuX2Jhc2UgPSBpbnN0YW5jZVxuXG4gIC8vIGNvbXBhdCBmb3IgdnVlLXJvdXRlciA8IDIuNy4xIHdoZXJlIGl0IGRvZXMgbm90IGFsbG93IG11bHRpcGxlIGluc3RhbGxzXG4gIGlmIChpbnN0YW5jZS5faW5zdGFsbGVkUGx1Z2lucyAmJiBpbnN0YW5jZS5faW5zdGFsbGVkUGx1Z2lucy5sZW5ndGgpIHtcbiAgICBpbnN0YW5jZS5faW5zdGFsbGVkUGx1Z2lucy5sZW5ndGggPSAwXG4gIH1cbiAgY29uc3QgdXNlID0gaW5zdGFuY2UudXNlXG4gIGluc3RhbmNlLnVzZSA9IChwbHVnaW4sIC4uLnJlc3QpID0+IHtcbiAgICBpZiAocGx1Z2luLmluc3RhbGxlZCA9PT0gdHJ1ZSkge1xuICAgICAgcGx1Z2luLmluc3RhbGxlZCA9IGZhbHNlXG4gICAgfVxuICAgIGlmIChwbHVnaW4uaW5zdGFsbCAmJiBwbHVnaW4uaW5zdGFsbC5pbnN0YWxsZWQgPT09IHRydWUpIHtcbiAgICAgIHBsdWdpbi5pbnN0YWxsLmluc3RhbGxlZCA9IGZhbHNlXG4gICAgfVxuICAgIHVzZS5jYWxsKGluc3RhbmNlLCBwbHVnaW4sIC4uLnJlc3QpXG4gIH1cbiAgcmV0dXJuIGluc3RhbmNlXG59XG5cbmV4cG9ydCBkZWZhdWx0IGNyZWF0ZUxvY2FsVnVlXG4iLCIvLyBAZmxvd1xuXG5mdW5jdGlvbiBnZXRPcHRpb25zIChrZXksIG9wdGlvbnMsIGNvbmZpZykge1xuICBpZiAob3B0aW9ucyB8fFxuICAgIChjb25maWdba2V5XSAmJiBPYmplY3Qua2V5cyhjb25maWdba2V5XSkubGVuZ3RoID4gMCkpIHtcbiAgICBpZiAob3B0aW9ucyBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB7XG4gICAgICByZXR1cm4gb3B0aW9uc1xuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShvcHRpb25zKSkge1xuICAgICAgcmV0dXJuIFtcbiAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgLi4uT2JqZWN0LmtleXMoY29uZmlnW2tleV0gfHwge30pXVxuICAgIH0gZWxzZSBpZiAoIShjb25maWdba2V5XSBpbnN0YW5jZW9mIEZ1bmN0aW9uKSkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4uY29uZmlnW2tleV0sXG4gICAgICAgIC4uLm9wdGlvbnNcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDb25maWcgY2FuJ3QgYmUgYSBGdW5jdGlvbi5gKVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbWVyZ2VPcHRpb25zIChcbiAgb3B0aW9uczogT3B0aW9ucyxcbiAgY29uZmlnOiBPcHRpb25zXG4pOiBPcHRpb25zIHtcbiAgcmV0dXJuIHtcbiAgICAuLi5vcHRpb25zLFxuICAgIHN0dWJzOiBnZXRPcHRpb25zKCdzdHVicycsIG9wdGlvbnMuc3R1YnMsIGNvbmZpZyksXG4gICAgbW9ja3M6IGdldE9wdGlvbnMoJ21vY2tzJywgb3B0aW9ucy5tb2NrcywgY29uZmlnKSxcbiAgICBtZXRob2RzOiBnZXRPcHRpb25zKCdtZXRob2RzJywgb3B0aW9ucy5tZXRob2RzLCBjb25maWcpLFxuICAgIHByb3ZpZGU6IGdldE9wdGlvbnMoJ3Byb3ZpZGUnLCBvcHRpb25zLnByb3ZpZGUsIGNvbmZpZylcbiAgfVxufVxuXG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgeyB3YXJuIH0gZnJvbSAnc2hhcmVkL3V0aWwnXG5cbmZ1bmN0aW9uIGdldFJlYWxDaGlsZCAodm5vZGU6ID9WTm9kZSk6ID9WTm9kZSB7XG4gIGNvbnN0IGNvbXBPcHRpb25zID0gdm5vZGUgJiYgdm5vZGUuY29tcG9uZW50T3B0aW9uc1xuICBpZiAoY29tcE9wdGlvbnMgJiYgY29tcE9wdGlvbnMuQ3Rvci5vcHRpb25zLmFic3RyYWN0KSB7XG4gICAgcmV0dXJuIGdldFJlYWxDaGlsZChnZXRGaXJzdENvbXBvbmVudENoaWxkKGNvbXBPcHRpb25zLmNoaWxkcmVuKSlcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gdm5vZGVcbiAgfVxufVxuXG5mdW5jdGlvbiBpc1NhbWVDaGlsZCAoY2hpbGQ6IFZOb2RlLCBvbGRDaGlsZDogVk5vZGUpOiBib29sZWFuIHtcbiAgcmV0dXJuIG9sZENoaWxkLmtleSA9PT0gY2hpbGQua2V5ICYmIG9sZENoaWxkLnRhZyA9PT0gY2hpbGQudGFnXG59XG5cbmZ1bmN0aW9uIGdldEZpcnN0Q29tcG9uZW50Q2hpbGQgKGNoaWxkcmVuOiA/QXJyYXk8Vk5vZGU+KTogP1ZOb2RlIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkoY2hpbGRyZW4pKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgYyA9IGNoaWxkcmVuW2ldXG4gICAgICBpZiAoYyAmJiAoYy5jb21wb25lbnRPcHRpb25zIHx8IGlzQXN5bmNQbGFjZWhvbGRlcihjKSkpIHtcbiAgICAgICAgcmV0dXJuIGNcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNQcmltaXRpdmUgKHZhbHVlOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuIChcbiAgICB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnIHx8XG4gICAgdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyB8fFxuICAgIC8vICRGbG93SWdub3JlXG4gICAgdHlwZW9mIHZhbHVlID09PSAnc3ltYm9sJyB8fFxuICAgIHR5cGVvZiB2YWx1ZSA9PT0gJ2Jvb2xlYW4nXG4gIClcbn1cblxuZnVuY3Rpb24gaXNBc3luY1BsYWNlaG9sZGVyIChub2RlOiBWTm9kZSk6IGJvb2xlYW4ge1xuICByZXR1cm4gbm9kZS5pc0NvbW1lbnQgJiYgbm9kZS5hc3luY0ZhY3Rvcnlcbn1cbmNvbnN0IGNhbWVsaXplUkUgPSAvLShcXHcpL2dcbmV4cG9ydCBjb25zdCBjYW1lbGl6ZSA9IChzdHI6IHN0cmluZyk6IHN0cmluZyA9PiB7XG4gIHJldHVybiBzdHIucmVwbGFjZShjYW1lbGl6ZVJFLCAoXywgYykgPT4gYyA/IGMudG9VcHBlckNhc2UoKSA6ICcnKVxufVxuXG5mdW5jdGlvbiBoYXNQYXJlbnRUcmFuc2l0aW9uICh2bm9kZTogVk5vZGUpOiA/Ym9vbGVhbiB7XG4gIHdoaWxlICgodm5vZGUgPSB2bm9kZS5wYXJlbnQpKSB7XG4gICAgaWYgKHZub2RlLmRhdGEudHJhbnNpdGlvbikge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQge1xuICByZW5kZXIgKGg6IEZ1bmN0aW9uKSB7XG4gICAgbGV0IGNoaWxkcmVuOiA/QXJyYXk8Vk5vZGU+ID0gdGhpcy4kb3B0aW9ucy5fcmVuZGVyQ2hpbGRyZW5cbiAgICBpZiAoIWNoaWxkcmVuKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICAvLyBmaWx0ZXIgb3V0IHRleHQgbm9kZXMgKHBvc3NpYmxlIHdoaXRlc3BhY2VzKVxuICAgIGNoaWxkcmVuID0gY2hpbGRyZW4uZmlsdGVyKChjOiBWTm9kZSkgPT4gYy50YWcgfHwgaXNBc3luY1BsYWNlaG9sZGVyKGMpKVxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgIGlmICghY2hpbGRyZW4ubGVuZ3RoKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICAvLyB3YXJuIG11bHRpcGxlIGVsZW1lbnRzXG4gICAgaWYgKGNoaWxkcmVuLmxlbmd0aCA+IDEpIHtcbiAgICAgIHdhcm4oXG4gICAgICAgICc8dHJhbnNpdGlvbj4gY2FuIG9ubHkgYmUgdXNlZCBvbiBhIHNpbmdsZSBlbGVtZW50LiBVc2UgJyArXG4gICAgICAgICAnPHRyYW5zaXRpb24tZ3JvdXA+IGZvciBsaXN0cy4nXG4gICAgICApXG4gICAgfVxuXG4gICAgY29uc3QgbW9kZTogc3RyaW5nID0gdGhpcy5tb2RlXG5cbiAgICAvLyB3YXJuIGludmFsaWQgbW9kZVxuICAgIGlmIChtb2RlICYmIG1vZGUgIT09ICdpbi1vdXQnICYmIG1vZGUgIT09ICdvdXQtaW4nXG4gICAgKSB7XG4gICAgICB3YXJuKFxuICAgICAgICAnaW52YWxpZCA8dHJhbnNpdGlvbj4gbW9kZTogJyArIG1vZGVcbiAgICAgIClcbiAgICB9XG5cbiAgICBjb25zdCByYXdDaGlsZDogVk5vZGUgPSBjaGlsZHJlblswXVxuXG4gICAgLy8gaWYgdGhpcyBpcyBhIGNvbXBvbmVudCByb290IG5vZGUgYW5kIHRoZSBjb21wb25lbnQnc1xuICAgIC8vIHBhcmVudCBjb250YWluZXIgbm9kZSBhbHNvIGhhcyB0cmFuc2l0aW9uLCBza2lwLlxuICAgIGlmIChoYXNQYXJlbnRUcmFuc2l0aW9uKHRoaXMuJHZub2RlKSkge1xuICAgICAgcmV0dXJuIHJhd0NoaWxkXG4gICAgfVxuXG4gICAgLy8gYXBwbHkgdHJhbnNpdGlvbiBkYXRhIHRvIGNoaWxkXG4gICAgLy8gdXNlIGdldFJlYWxDaGlsZCgpIHRvIGlnbm9yZSBhYnN0cmFjdCBjb21wb25lbnRzIGUuZy4ga2VlcC1hbGl2ZVxuICAgIGNvbnN0IGNoaWxkOiA/Vk5vZGUgPSBnZXRSZWFsQ2hpbGQocmF3Q2hpbGQpXG5cbiAgICBpZiAoIWNoaWxkKSB7XG4gICAgICByZXR1cm4gcmF3Q2hpbGRcbiAgICB9XG5cbiAgICBjb25zdCBpZDogc3RyaW5nID0gYF9fdHJhbnNpdGlvbi0ke3RoaXMuX3VpZH0tYFxuICAgIGNoaWxkLmtleSA9IGNoaWxkLmtleSA9PSBudWxsXG4gICAgICA/IGNoaWxkLmlzQ29tbWVudFxuICAgICAgICA/IGlkICsgJ2NvbW1lbnQnXG4gICAgICAgIDogaWQgKyBjaGlsZC50YWdcbiAgICAgIDogaXNQcmltaXRpdmUoY2hpbGQua2V5KVxuICAgICAgICA/IChTdHJpbmcoY2hpbGQua2V5KS5pbmRleE9mKGlkKSA9PT0gMCA/IGNoaWxkLmtleSA6IGlkICsgY2hpbGQua2V5KVxuICAgICAgICA6IGNoaWxkLmtleVxuXG4gICAgY29uc3QgZGF0YTogT2JqZWN0ID0gKGNoaWxkLmRhdGEgfHwgKGNoaWxkLmRhdGEgPSB7fSkpXG4gICAgY29uc3Qgb2xkUmF3Q2hpbGQ6ID9WTm9kZSA9IHRoaXMuX3Zub2RlXG4gICAgY29uc3Qgb2xkQ2hpbGQ6ID9WTm9kZSA9IGdldFJlYWxDaGlsZChvbGRSYXdDaGlsZClcbiAgICBpZiAoY2hpbGQuZGF0YS5kaXJlY3RpdmVzICYmIGNoaWxkLmRhdGEuZGlyZWN0aXZlcy5zb21lKGQgPT4gZC5uYW1lID09PSAnc2hvdycpKSB7XG4gICAgICBjaGlsZC5kYXRhLnNob3cgPSB0cnVlXG4gICAgfVxuXG4gICAgLy8gbWFyayB2LXNob3dcbiAgICAvLyBzbyB0aGF0IHRoZSB0cmFuc2l0aW9uIG1vZHVsZSBjYW4gaGFuZCBvdmVyIHRoZSBjb250cm9sIHRvIHRoZSBkaXJlY3RpdmVcbiAgICBpZiAoY2hpbGQuZGF0YS5kaXJlY3RpdmVzICYmIGNoaWxkLmRhdGEuZGlyZWN0aXZlcy5zb21lKGQgPT4gZC5uYW1lID09PSAnc2hvdycpKSB7XG4gICAgICBjaGlsZC5kYXRhLnNob3cgPSB0cnVlXG4gICAgfVxuICAgIGlmIChcbiAgICAgIG9sZENoaWxkICYmXG4gICAgICAgICBvbGRDaGlsZC5kYXRhICYmXG4gICAgICAgICAhaXNTYW1lQ2hpbGQoY2hpbGQsIG9sZENoaWxkKSAmJlxuICAgICAgICAgIWlzQXN5bmNQbGFjZWhvbGRlcihvbGRDaGlsZCkgJiZcbiAgICAgICAgIC8vICM2Njg3IGNvbXBvbmVudCByb290IGlzIGEgY29tbWVudCBub2RlXG4gICAgICAgICAhKG9sZENoaWxkLmNvbXBvbmVudEluc3RhbmNlICYmIG9sZENoaWxkLmNvbXBvbmVudEluc3RhbmNlLl92bm9kZS5pc0NvbW1lbnQpXG4gICAgKSB7XG4gICAgICBvbGRDaGlsZC5kYXRhID0geyAuLi5kYXRhIH1cbiAgICB9XG4gICAgcmV0dXJuIHJhd0NoaWxkXG4gIH1cbn1cbiIsIi8vIEBmbG93XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgcmVuZGVyIChoOiBGdW5jdGlvbikge1xuICAgIGNvbnN0IHRhZzogc3RyaW5nID0gdGhpcy50YWcgfHwgdGhpcy4kdm5vZGUuZGF0YS50YWcgfHwgJ3NwYW4nXG4gICAgY29uc3QgY2hpbGRyZW46IEFycmF5PFZOb2RlPiA9IHRoaXMuJHNsb3RzLmRlZmF1bHQgfHwgW11cblxuICAgIHJldHVybiBoKHRhZywgbnVsbCwgY2hpbGRyZW4pXG4gIH1cbn1cbiIsImltcG9ydCBUcmFuc2l0aW9uU3R1YiBmcm9tICcuL2NvbXBvbmVudHMvVHJhbnNpdGlvblN0dWInXG5pbXBvcnQgVHJhbnNpdGlvbkdyb3VwU3R1YiBmcm9tICcuL2NvbXBvbmVudHMvVHJhbnNpdGlvbkdyb3VwU3R1YidcblxuZXhwb3J0IGRlZmF1bHQge1xuICBzdHViczoge1xuICAgIHRyYW5zaXRpb246IFRyYW5zaXRpb25TdHViLFxuICAgICd0cmFuc2l0aW9uLWdyb3VwJzogVHJhbnNpdGlvbkdyb3VwU3R1YlxuICB9LFxuICBtb2Nrczoge30sXG4gIG1ldGhvZHM6IHt9LFxuICBwcm92aWRlOiB7fVxufVxuIiwiLy8gQGZsb3dcblxuaW1wb3J0ICcuL21hdGNoZXMtcG9seWZpbGwnXG5pbXBvcnQgJy4vb2JqZWN0LWFzc2lnbi1wb2x5ZmlsbCdcbmltcG9ydCBWdWUgZnJvbSAndnVlJ1xuaW1wb3J0IFZ1ZVdyYXBwZXIgZnJvbSAnLi92dWUtd3JhcHBlcidcbmltcG9ydCBjcmVhdGVJbnN0YW5jZSBmcm9tICdjcmVhdGUtaW5zdGFuY2UnXG5pbXBvcnQgY3JlYXRlRWxlbWVudCBmcm9tICcuL2NyZWF0ZS1lbGVtZW50J1xuaW1wb3J0IGNyZWF0ZUxvY2FsVnVlIGZyb20gJy4vY3JlYXRlLWxvY2FsLXZ1ZSdcbmltcG9ydCBlcnJvckhhbmRsZXIgZnJvbSAnLi9lcnJvci1oYW5kbGVyJ1xuaW1wb3J0IHsgZmluZEFsbFZ1ZUNvbXBvbmVudHNGcm9tVm0gfSBmcm9tICcuL2ZpbmQtdnVlLWNvbXBvbmVudHMnXG5pbXBvcnQgeyBtZXJnZU9wdGlvbnMgfSBmcm9tICdzaGFyZWQvbWVyZ2Utb3B0aW9ucydcbmltcG9ydCBjb25maWcgZnJvbSAnLi9jb25maWcnXG5pbXBvcnQgd2FybklmTm9XaW5kb3cgZnJvbSAnLi93YXJuLWlmLW5vLXdpbmRvdydcblxuVnVlLmNvbmZpZy5wcm9kdWN0aW9uVGlwID0gZmFsc2VcblZ1ZS5jb25maWcuZGV2dG9vbHMgPSBmYWxzZVxuVnVlLmNvbmZpZy5lcnJvckhhbmRsZXIgPSBlcnJvckhhbmRsZXJcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gbW91bnQgKGNvbXBvbmVudDogQ29tcG9uZW50LCBvcHRpb25zOiBPcHRpb25zID0ge30pOiBWdWVXcmFwcGVyIHtcbiAgd2FybklmTm9XaW5kb3coKVxuICAvLyBSZW1vdmUgY2FjaGVkIGNvbnN0cnVjdG9yXG4gIGRlbGV0ZSBjb21wb25lbnQuX0N0b3JcbiAgY29uc3QgdnVlQ2xhc3MgPSBvcHRpb25zLmxvY2FsVnVlIHx8IGNyZWF0ZUxvY2FsVnVlKClcbiAgY29uc3Qgdm0gPSBjcmVhdGVJbnN0YW5jZShjb21wb25lbnQsIG1lcmdlT3B0aW9ucyhvcHRpb25zLCBjb25maWcpLCB2dWVDbGFzcylcblxuICBpZiAob3B0aW9ucy5hdHRhY2hUb0RvY3VtZW50KSB7XG4gICAgdm0uJG1vdW50KGNyZWF0ZUVsZW1lbnQoKSlcbiAgfSBlbHNlIHtcbiAgICB2bS4kbW91bnQoKVxuICB9XG4gIGNvbnN0IGNvbXBvbmVudHNXaXRoRXJyb3IgPSBmaW5kQWxsVnVlQ29tcG9uZW50c0Zyb21WbSh2bSkuZmlsdGVyKGMgPT4gYy5fZXJyb3IpXG5cbiAgaWYgKGNvbXBvbmVudHNXaXRoRXJyb3IubGVuZ3RoID4gMCkge1xuICAgIHRocm93IChjb21wb25lbnRzV2l0aEVycm9yWzBdLl9lcnJvcilcbiAgfVxuXG4gIGNvbnN0IHdyYXBwZXJPcHRpb25zID0ge1xuICAgIGF0dGFjaGVkVG9Eb2N1bWVudDogISFvcHRpb25zLmF0dGFjaFRvRG9jdW1lbnQsXG4gICAgc3luYzogISEoKG9wdGlvbnMuc3luYyB8fCBvcHRpb25zLnN5bmMgPT09IHVuZGVmaW5lZCkpLFxuICAgIHJvb3Q6IHRydWVcbiAgfVxuXG4gIHJldHVybiBuZXcgVnVlV3JhcHBlcih2bSwgd3JhcHBlck9wdGlvbnMpXG59XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgJy4vd2Fybi1pZi1uby13aW5kb3cnXG5pbXBvcnQgVnVlIGZyb20gJ3Z1ZSdcbmltcG9ydCBtb3VudCBmcm9tICcuL21vdW50J1xuaW1wb3J0IHR5cGUgVnVlV3JhcHBlciBmcm9tICcuL3Z1ZS13cmFwcGVyJ1xuaW1wb3J0IHtcbiAgY3JlYXRlQ29tcG9uZW50U3R1YnNGb3JBbGwsXG4gIGNyZWF0ZUNvbXBvbmVudFN0dWJzRm9yR2xvYmFsc1xufSBmcm9tICdzaGFyZWQvc3R1Yi1jb21wb25lbnRzJ1xuaW1wb3J0IHsgY2FtZWxpemUsXG4gIGNhcGl0YWxpemUsXG4gIGh5cGhlbmF0ZVxufSBmcm9tICdzaGFyZWQvdXRpbCdcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gc2hhbGxvd01vdW50IChcbiAgY29tcG9uZW50OiBDb21wb25lbnQsXG4gIG9wdGlvbnM6IE9wdGlvbnMgPSB7fVxuKTogVnVlV3JhcHBlciB7XG4gIGNvbnN0IHZ1ZSA9IG9wdGlvbnMubG9jYWxWdWUgfHwgVnVlXG5cbiAgLy8gcmVtb3ZlIGFueSByZWN1cnNpdmUgY29tcG9uZW50cyBhZGRlZCB0byB0aGUgY29uc3RydWN0b3JcbiAgLy8gaW4gdm0uX2luaXQgZnJvbSBwcmV2aW91cyB0ZXN0c1xuICBpZiAoY29tcG9uZW50Lm5hbWUgJiYgY29tcG9uZW50LmNvbXBvbmVudHMpIHtcbiAgICBkZWxldGUgY29tcG9uZW50LmNvbXBvbmVudHNbY2FwaXRhbGl6ZShjYW1lbGl6ZShjb21wb25lbnQubmFtZSkpXVxuICAgIGRlbGV0ZSBjb21wb25lbnQuY29tcG9uZW50c1toeXBoZW5hdGUoY29tcG9uZW50Lm5hbWUpXVxuICB9XG4gIFxuXG4gIHJldHVybiBtb3VudChjb21wb25lbnQsIHtcbiAgICAuLi5vcHRpb25zLFxuICAgIGNvbXBvbmVudHM6IHtcbiAgICAgIC4uLmNyZWF0ZUNvbXBvbmVudFN0dWJzRm9yR2xvYmFscyh2dWUpLFxuICAgICAgLi4uY3JlYXRlQ29tcG9uZW50U3R1YnNGb3JBbGwoY29tcG9uZW50KVxuICAgIH1cbiAgfSlcbn1cbiIsIi8vIEBmbG93XG5jb25zdCB0b1R5cGVzOiBBcnJheTxGdW5jdGlvbj4gPSBbU3RyaW5nLCBPYmplY3RdXG5jb25zdCBldmVudFR5cGVzOiBBcnJheTxGdW5jdGlvbj4gPSBbU3RyaW5nLCBBcnJheV1cblxuZXhwb3J0IGRlZmF1bHQge1xuICBuYW1lOiAnUm91dGVyTGlua1N0dWInLFxuICBwcm9wczoge1xuICAgIHRvOiB7XG4gICAgICB0eXBlOiB0b1R5cGVzLFxuICAgICAgcmVxdWlyZWQ6IHRydWVcbiAgICB9LFxuICAgIHRhZzoge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgZGVmYXVsdDogJ2EnXG4gICAgfSxcbiAgICBleGFjdDogQm9vbGVhbixcbiAgICBhcHBlbmQ6IEJvb2xlYW4sXG4gICAgcmVwbGFjZTogQm9vbGVhbixcbiAgICBhY3RpdmVDbGFzczogU3RyaW5nLFxuICAgIGV4YWN0QWN0aXZlQ2xhc3M6IFN0cmluZyxcbiAgICBldmVudDoge1xuICAgICAgdHlwZTogZXZlbnRUeXBlcyxcbiAgICAgIGRlZmF1bHQ6ICdjbGljaydcbiAgICB9XG4gIH0sXG4gIHJlbmRlciAoaDogRnVuY3Rpb24pIHtcbiAgICByZXR1cm4gaCh0aGlzLnRhZywgdW5kZWZpbmVkLCB0aGlzLiRzbG90cy5kZWZhdWx0KVxuICB9XG59XG4iLCJpbXBvcnQgc2hhbGxvd01vdW50IGZyb20gJy4vc2hhbGxvdy1tb3VudCdcbmltcG9ydCBtb3VudCBmcm9tICcuL21vdW50J1xuaW1wb3J0IGNyZWF0ZUxvY2FsVnVlIGZyb20gJy4vY3JlYXRlLWxvY2FsLXZ1ZSdcbmltcG9ydCBUcmFuc2l0aW9uU3R1YiBmcm9tICcuL2NvbXBvbmVudHMvVHJhbnNpdGlvblN0dWInXG5pbXBvcnQgVHJhbnNpdGlvbkdyb3VwU3R1YiBmcm9tICcuL2NvbXBvbmVudHMvVHJhbnNpdGlvbkdyb3VwU3R1YidcbmltcG9ydCBSb3V0ZXJMaW5rU3R1YiBmcm9tICcuL2NvbXBvbmVudHMvUm91dGVyTGlua1N0dWInXG5pbXBvcnQgY29uZmlnIGZyb20gJy4vY29uZmlnJ1xuaW1wb3J0IHsgd2FybiB9IGZyb20gJ3NoYXJlZC91dGlsJ1xuXG5mdW5jdGlvbiBzaGFsbG93IChjb21wb25lbnQsIG9wdGlvbnMpIHtcbiAgd2Fybignc2hhbGxvdyBoYXMgYmVlbiByZW5hbWVkIHRvIHNoYWxsb3dNb3VudCBhbmQgd2lsbCBiZSBkZXByZWNhdGVkIGluIDEuMC4wJylcbiAgcmV0dXJuIHNoYWxsb3dNb3VudChjb21wb25lbnQsIG9wdGlvbnMpXG59XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgY3JlYXRlTG9jYWxWdWUsXG4gIGNvbmZpZyxcbiAgbW91bnQsXG4gIHNoYWxsb3csXG4gIHNoYWxsb3dNb3VudCxcbiAgVHJhbnNpdGlvblN0dWIsXG4gIFRyYW5zaXRpb25Hcm91cFN0dWIsXG4gIFJvdXRlckxpbmtTdHViXG59XG4iXSwibmFtZXMiOlsiY29uc3QiLCJsZXQiLCJhcmd1bWVudHMiLCJlcSIsImFzc29jSW5kZXhPZiIsInRoaXMiLCJsaXN0Q2FjaGVDbGVhciIsImxpc3RDYWNoZURlbGV0ZSIsImxpc3RDYWNoZUdldCIsImxpc3RDYWNoZUhhcyIsImxpc3RDYWNoZVNldCIsIkxpc3RDYWNoZSIsImdsb2JhbCIsImZyZWVHbG9iYWwiLCJyb290IiwiU3ltYm9sIiwib2JqZWN0UHJvdG8iLCJuYXRpdmVPYmplY3RUb1N0cmluZyIsInN5bVRvU3RyaW5nVGFnIiwiZ2V0UmF3VGFnIiwib2JqZWN0VG9TdHJpbmciLCJpc09iamVjdCIsImJhc2VHZXRUYWciLCJjb3JlSnNEYXRhIiwiZnVuY1Byb3RvIiwiZnVuY1RvU3RyaW5nIiwiaGFzT3duUHJvcGVydHkiLCJpc01hc2tlZCIsImlzRnVuY3Rpb24iLCJ0b1NvdXJjZSIsImdldFZhbHVlIiwiYmFzZUlzTmF0aXZlIiwiZ2V0TmF0aXZlIiwibmF0aXZlQ3JlYXRlIiwiSEFTSF9VTkRFRklORUQiLCJoYXNoQ2xlYXIiLCJoYXNoRGVsZXRlIiwiaGFzaEdldCIsImhhc2hIYXMiLCJoYXNoU2V0IiwiSGFzaCIsIk1hcCIsImlzS2V5YWJsZSIsImdldE1hcERhdGEiLCJtYXBDYWNoZUNsZWFyIiwibWFwQ2FjaGVEZWxldGUiLCJtYXBDYWNoZUdldCIsIm1hcENhY2hlSGFzIiwibWFwQ2FjaGVTZXQiLCJNYXBDYWNoZSIsInN0YWNrQ2xlYXIiLCJzdGFja0RlbGV0ZSIsInN0YWNrR2V0Iiwic3RhY2tIYXMiLCJzdGFja1NldCIsImRlZmluZVByb3BlcnR5IiwiYmFzZUFzc2lnblZhbHVlIiwiY3JlYXRlQmFzZUZvciIsIlVpbnQ4QXJyYXkiLCJjbG9uZUFycmF5QnVmZmVyIiwib3ZlckFyZyIsImlzUHJvdG90eXBlIiwiYmFzZUNyZWF0ZSIsImdldFByb3RvdHlwZSIsImlzT2JqZWN0TGlrZSIsImJhc2VJc0FyZ3VtZW50cyIsImlzTGVuZ3RoIiwiaXNBcnJheUxpa2UiLCJzdHViRmFsc2UiLCJhcmdzVGFnIiwiZnVuY1RhZyIsIm9iamVjdFRhZyIsIm5vZGVVdGlsIiwiYmFzZVVuYXJ5IiwiYmFzZUlzVHlwZWRBcnJheSIsImFzc2lnblZhbHVlIiwiTUFYX1NBRkVfSU5URUdFUiIsImlzQXJyYXkiLCJpc0FyZ3VtZW50cyIsImlzQnVmZmVyIiwiaXNUeXBlZEFycmF5IiwiYmFzZVRpbWVzIiwiaXNJbmRleCIsIm5hdGl2ZUtleXNJbiIsImtleXNJbiIsImFycmF5TGlrZUtleXMiLCJiYXNlS2V5c0luIiwiY29weU9iamVjdCIsImFzc2lnbk1lcmdlVmFsdWUiLCJpc0FycmF5TGlrZU9iamVjdCIsImNvcHlBcnJheSIsImNsb25lQnVmZmVyIiwiY2xvbmVUeXBlZEFycmF5IiwiaXNQbGFpbk9iamVjdCIsInRvUGxhaW5PYmplY3QiLCJpbml0Q2xvbmVPYmplY3QiLCJiYXNlRm9yIiwiU3RhY2siLCJiYXNlTWVyZ2VEZWVwIiwiYXBwbHkiLCJpZGVudGl0eSIsImNvbnN0YW50Iiwic2hvcnRPdXQiLCJiYXNlU2V0VG9TdHJpbmciLCJzZXRUb1N0cmluZyIsIm92ZXJSZXN0IiwiYmFzZVJlc3QiLCJpc0l0ZXJhdGVlQ2FsbCIsImNyZWF0ZUFzc2lnbmVyIiwiYmFzZU1lcmdlIiwiZmluZEFsbCIsIm1lcmdlIiwic3VwZXIiLCJjb21waWxlVG9GdW5jdGlvbnMiLCJWdWUiLCIkJFZ1ZSIsImlzVnVlQ29tcG9uZW50IiwiY29tcGlsZVRlbXBsYXRlIiwiZGVsZXRlb3B0aW9ucyIsIm5hdGl2ZUtleXMiLCJiYXNlS2V5cyIsImtleXMiLCJwcm9wZXJ0eUlzRW51bWVyYWJsZSIsInN0dWJBcnJheSIsImFycmF5RmlsdGVyIiwiZ2V0U3ltYm9scyIsIm5hdGl2ZUdldFN5bWJvbHMiLCJhcnJheVB1c2giLCJnZXRTeW1ib2xzSW4iLCJiYXNlR2V0QWxsS2V5cyIsIm1hcFRhZyIsInNldFRhZyIsIndlYWtNYXBUYWciLCJkYXRhVmlld1RhZyIsIkRhdGFWaWV3IiwiUHJvbWlzZSIsIlNldCIsIldlYWtNYXAiLCJtYXBUb0FycmF5IiwiYXJyYXlSZWR1Y2UiLCJhZGRNYXBFbnRyeSIsIkNMT05FX0RFRVBfRkxBRyIsInNldFRvQXJyYXkiLCJhZGRTZXRFbnRyeSIsImJvb2xUYWciLCJkYXRlVGFnIiwibnVtYmVyVGFnIiwicmVnZXhwVGFnIiwic3RyaW5nVGFnIiwiYXJyYXlCdWZmZXJUYWciLCJmbG9hdDMyVGFnIiwiZmxvYXQ2NFRhZyIsImludDhUYWciLCJpbnQxNlRhZyIsImludDMyVGFnIiwidWludDhUYWciLCJ1aW50OENsYW1wZWRUYWciLCJ1aW50MTZUYWciLCJ1aW50MzJUYWciLCJjbG9uZURhdGFWaWV3IiwiY2xvbmVNYXAiLCJjbG9uZVJlZ0V4cCIsImNsb25lU2V0IiwiY2xvbmVTeW1ib2wiLCJhcnJheVRhZyIsImVycm9yVGFnIiwiZ2VuVGFnIiwic3ltYm9sVGFnIiwiaW5pdENsb25lQXJyYXkiLCJnZXRUYWciLCJjb3B5U3ltYm9sc0luIiwiYmFzZUFzc2lnbkluIiwiY29weVN5bWJvbHMiLCJiYXNlQXNzaWduIiwiaW5pdENsb25lQnlUYWciLCJnZXRBbGxLZXlzSW4iLCJnZXRBbGxLZXlzIiwiYXJyYXlFYWNoIiwiQ0xPTkVfU1lNQk9MU19GTEFHIiwiYmFzZUNsb25lIiwiY2xvbmVEZWVw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
