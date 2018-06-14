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
var camelize = function (str) {
  var camelizedStr = str.replace(camelizeRE, function (_, c) { return c ? c.toUpperCase() : ''; });
  return camelizedStr.charAt(0).toLowerCase() + camelizedStr.slice(1)
};

/**
 * Capitalize a string.
 */
var capitalize = function (str) { return str.charAt(0).toUpperCase() + str.slice(1); };

/**
 * Hyphenate a camelCase string.
 */
var hyphenateRE = /\B([A-Z])/g;
var hyphenate = function (str) { return str.replace(hyphenateRE, '-$1').toLowerCase(); };

var vueVersion = Number(((Vue.version.split('.')[0]) + "." + (Vue.version.split('.')[1])));

function warnIfNoWindow () {
  if (typeof window === 'undefined') {
    throwError(
      'window is undefined, vue-test-utils needs to be run in a browser environment.\n' +
      'You can run the tests in node using jsdom + jsdom-global.\n' +
      'See https://vue-test-utils.vuejs.org/guides/common-tips.html for more details.'
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
 * This method is like `_.merge` except that it accepts `customizer` which
 * is invoked to produce the merged values of the destination and source
 * properties. If `customizer` returns `undefined`, merging is handled by the
 * method instead. The `customizer` is invoked with six arguments:
 * (objValue, srcValue, key, object, source, stack).
 *
 * **Note:** This method mutates `object`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} sources The source objects.
 * @param {Function} customizer The function to customize assigned values.
 * @returns {Object} Returns `object`.
 * @example
 *
 * function customizer(objValue, srcValue) {
 *   if (_.isArray(objValue)) {
 *     return objValue.concat(srcValue);
 *   }
 * }
 *
 * var object = { 'a': [1], 'b': [2] };
 * var other = { 'a': [3], 'b': [4] };
 *
 * _.mergeWith(object, other, customizer);
 * // => { 'a': [1, 3], 'b': [2, 4] }
 */
var mergeWith = _createAssigner(function(object, source, srcIndex, customizer) {
  _baseMerge(object, source, srcIndex, customizer);
});

var mergeWith_1 = mergeWith;

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
    (component.template ||
      component.extends ||
      component.extendOptions) &&
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

function templateContainsComponent (template, name) {
  return [capitalize, camelize, hyphenate].some(function (format) {
    var re = new RegExp(("<" + (format(name)) + "\\s*(\\s|>|(/>))"), 'g');
    return re.test(template)
  })
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
  var constructor = component.__proto__.constructor;
  return Object.keys(Ctor || {}).some(function (c) {
    return Ctor[c] === constructor ||
      Ctor[c] === constructor.super
  })
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

WrapperArray.prototype.setValue = function setValue (value) {
  this.throwErrorIfWrappersIsEmpty('setValue');

  this.wrappers.forEach(function (wrapper) { return wrapper.setValue(value); });
};

WrapperArray.prototype.setChecked = function setChecked (checked) {
  this.throwErrorIfWrappersIsEmpty('setChecked');

  this.wrappers.forEach(function (wrapper) { return wrapper.setChecked(checked); });
};

WrapperArray.prototype.setSelected = function setSelected () {
  this.throwErrorIfWrappersIsEmpty('setSelected');

  throwError('setSelected must be called on a single wrapper, use at(i) to access a wrapper');
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

ErrorWrapper.prototype.setValue = function setValue () {
  throwError(("find did not return " + (this.selector) + ", cannot call setValue() on empty Wrapper"));
};

ErrorWrapper.prototype.setChecked = function setChecked () {
  throwError(("find did not return " + (this.selector) + ", cannot call setChecked() on empty Wrapper"));
};

ErrorWrapper.prototype.setSelected = function setSelected () {
  throwError(("find did not return " + (this.selector) + ", cannot call setSelected() on empty Wrapper"));
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
  var vNodeElms = vNodes.map(function (vNode) { return vNode.elm; });
  return vNodes.filter(function (vNode, index) { return index === vNodeElms.indexOf(vNode.elm); })
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

  if (!this.isVueInstance()) {
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
  return !!this.isVm
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
    throwError('wrapper.setData() cannot be called on a functional component');
  }

  if (!this.vm) {
    throwError('wrapper.setData() can only be called on a Vue instance');
  }

  Object.keys(data).forEach(function (key) {
    if (typeof data[key] === 'object' && data[key] !== null &&
						!Array.isArray(data[key])) {
      // $FlowIgnore : Problem with possibly null this.vm
      var newObj = mergeWith_1(this$1.vm[key], data[key], function (objValue, srcValue) {
        return Array.isArray(srcValue) ? srcValue : undefined
      });
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

  if (!this.isVueInstance()) {
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

  if (!this.isVueInstance()) {
    throwError('wrapper.setMethods() can only be called on a Vue instance');
  }
  Object.keys(methods).forEach(function (key) {
    // $FlowIgnore : Problem with possibly null this.vm
    this$1.vm[key] = methods[key];
    // $FlowIgnore : Problem with possibly null this.vm
    this$1.vm.$options.methods[key] = methods[key];
  });

  if (this.vnode) {
    var context = this.vnode.context;
    if (context.$options.render) { context._update(context._render()); }
  }
};

/**
 * Sets vm props
 */
Wrapper.prototype.setProps = function setProps (data) {
    var this$1 = this;

  if (this.isFunctionalComponent) {
    throwError('wrapper.setProps() cannot be called on a functional component');
  }
  if (!this.isVueInstance() || !this.vm) {
    throwError('wrapper.setProps() can only be called on a Vue instance');
  }
  if (this.vm && this.vm.$options && !this.vm.$options.propsData) {
    this.vm.$options.propsData = {};
  }
  Object.keys(data).forEach(function (key) {
    // Ignore properties that were not specified in the component options
    // $FlowIgnore : Problem with possibly null this.vm
    if (!this$1.vm.$options._propKeys || !this$1.vm.$options._propKeys.some(function (prop) { return prop === key; })) {
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
 * Sets element value and triggers input event
 */
Wrapper.prototype.setValue = function setValue (value) {
  var el = this.element;

  if (!el) {
    throwError('cannot call wrapper.setValue() on a wrapper without an element');
  }

  var tag = el.tagName;
  var type = this.attributes().type;
  var event = 'input';

  if (tag === 'SELECT') {
    throwError('wrapper.setValue() cannot be called on a <select> element. Use wrapper.setSelected() instead');
  } else if (tag === 'INPUT' && type === 'checkbox') {
    throwError('wrapper.setValue() cannot be called on a <input type="checkbox" /> element. Use wrapper.setChecked() instead');
  } else if (tag === 'INPUT' && type === 'radio') {
    throwError('wrapper.setValue() cannot be called on a <input type="radio" /> element. Use wrapper.setChecked() instead');
  } else if (tag === 'INPUT' || tag === 'textarea') {
    // $FlowIgnore
    el.value = value;
    this.trigger(event);
  } else {
    throwError('wrapper.setValue() cannot be called on this element');
  }
};

/**
 * Checks radio button or checkbox element
 */
Wrapper.prototype.setChecked = function setChecked (checked) {
    if ( checked === void 0 ) checked = true;

  if (typeof checked !== 'boolean') {
    throwError('wrapper.setChecked() must be passed a boolean');
  }

  var el = this.element;

  if (!el) {
    throwError('cannot call wrapper.setChecked() on a wrapper without an element');
  }

  var tag = el.tagName;
  var type = this.attributes().type;
  var event = 'change';

  if (tag === 'SELECT') {
    throwError('wrapper.setChecked() cannot be called on a <select> element. Use wrapper.setSelected() instead');
  } else if (tag === 'INPUT' && type === 'checkbox') {
    // $FlowIgnore
    if (el.checked !== checked) {
      if (!navigator.userAgent.includes('jsdom')) {
        // $FlowIgnore
        el.checked = checked;
      }
      this.trigger('click');
      this.trigger(event);
    }
  } else if (tag === 'INPUT' && type === 'radio') {
    if (!checked) {
      throwError('wrapper.setChecked() cannot be called with parameter false on a <input type="radio" /> element.');
    } else {
      // $FlowIgnore
      if (!el.checked) {
        this.trigger('click');
        this.trigger(event);
      }
    }
  } else if (tag === 'INPUT' || tag === 'textarea') {
    throwError('wrapper.setChecked() cannot be called on "text" inputs. Use wrapper.setValue() instead');
  } else {
    throwError('wrapper.setChecked() cannot be called on this element');
  }
};

/**
 * Selects <option></option> element
 */
Wrapper.prototype.setSelected = function setSelected () {
  var el = this.element;

  if (!el) {
    throwError('cannot call wrapper.setSelected() on a wrapper without an element');
  }

  var tag = el.tagName;
  var type = this.attributes().type;
  var event = 'change';

  if (tag === 'OPTION') {
    // $FlowIgnore
    el.selected = true;
    // $FlowIgnore
    if (el.parentElement.tagName === 'OPTGROUP') {
      // $FlowIgnore
      createWrapper(el.parentElement.parentElement, this.options).trigger(event);
    } else {
      // $FlowIgnore
      createWrapper(el.parentElement, this.options).trigger(event);
    }
  } else if (tag === 'SELECT') {
    throwError('wrapper.setSelected() cannot be called on select. Call it on one of its options');
  } else if (tag === 'INPUT' && type === 'checkbox') {
    throwError('wrapper.setSelected() cannot be called on a <input type="checkbox" /> element. Use wrapper.setChecked() instead');
  } else if (tag === 'INPUT' && type === 'radio') {
    throwError('wrapper.setSelected() cannot be called on a <input type="radio" /> element. Use wrapper.setChecked() instead');
  } else if (tag === 'INPUT' || tag === 'textarea') {
    throwError('wrapper.setSelected() cannot be called on "text" inputs. Use wrapper.setValue() instead');
  } else {
    throwError('wrapper.setSelected() cannot be called on this element');
  }
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
  if (!this.isVueInstance()) {
    throwError('wrapper.destroy() can only be called on a Vue instance');
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
    throwError('you cannot set the target value of an event. See the notes section of the docs for more details—https://vue-test-utils.vuejs.org/api/wrapper/trigger.html');
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
  // preventing double registration
  if (!vm.$_vueTestUtils_updateInSetWatcherSync) {
    vm.$_vueTestUtils_updateInSetWatcherSync = vm._update;
    vm._update = function (vnode, hydrating) {
      var this$1 = this;

      this.$_vueTestUtils_updateInSetWatcherSync(vnode, hydrating);
      if (VUE_VERSION >= 2.1 && this._isMounted && this.$options.updated) {
        this.$options.updated.forEach(function (handler) {
          handler.call(this$1);
        });
      }
    };
  }
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
    this.isVm = true;
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

function startsWithTag (str) {
  return str && str.trim()[0] === '<'
}

function createVNodesForSlot (
  h,
  slotValue,
  name
) {
  if (typeof slotValue === 'string' &&
  !startsWithTag(slotValue)) {
    return slotValue
  }

  var el = typeof slotValue === 'string'
    ? vueTemplateCompiler.compileToFunctions(slotValue)
    : slotValue;

  var vnode = h(el);
  vnode.data.slot = name;
  return vnode
}

function createSlotVNodes (
  h,
  slots
) {
  return Object.keys(slots).reduce(function (acc, key) {
    var content = slots[key];
    if (Array.isArray(content)) {
      var nodes = content.reduce(function (accInner, slotDef) {
        return accInner.concat(createVNodesForSlot(h, slotDef, key))
      }, []);
      return acc.concat(nodes)
    } else {
      return acc.concat(createVNodesForSlot(h, content, key))
    }
  }, [])
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
  if (component.template) {
    Object.assign(component, vueTemplateCompiler.compileToFunctions(component.template));
  }

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

  if (component.extendOptions && !component.options.render) {
    compileTemplate(component.options);
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
function createStubFromString (
  templateString,
  originalComponent,
  name
) {
  if (!vueTemplateCompiler.compileToFunctions) {
    throwError('vueTemplateCompiler is undefined, you must pass precompiled components if vue-template-compiler is undefined');
  }

  if (templateContainsComponent(templateString, name)) {
    throwError('options.stub cannot contain a circular reference');
  }

  return Object.assign({}, getCoreProperties(originalComponent),
    vueTemplateCompiler.compileToFunctions(templateString))
}

function createBlankStub (originalComponent) {
  return Object.assign({}, getCoreProperties(originalComponent),
    {render: function render (h) {
      return h(((originalComponent.name) + "-stub"))
    }})
}

function createComponentStubs (
  originalComponents,
  stubs
) {
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
      components[stub] = createBlankStub({ name: stub });
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
        components[stub] = createBlankStub({ name: stub });
        return
      }

      if (componentNeedsCompiling(stubs[stub])) {
        compileTemplate(stubs[stub]);
      }

      if (originalComponents[stub]) {
        // Remove cached constructor
        delete originalComponents[stub]._Ctor;
        if (typeof stubs[stub] === 'string') {
          components[stub] = createStubFromString(stubs[stub], originalComponents[stub], stub);
        } else {
          components[stub] = Object.assign({}, stubs[stub],
            {name: originalComponents[stub].name});
        }
      } else {
        if (typeof stubs[stub] === 'string') {
          if (!vueTemplateCompiler.compileToFunctions) {
            throwError('vueTemplateCompiler is undefined, you must pass precompiled components if vue-template-compiler is undefined');
          }
          components[stub] = Object.assign({}, vueTemplateCompiler.compileToFunctions(stubs[stub]));
        } else {
          components[stub] = Object.assign({}, stubs[stub]);
        }
      }
      // ignoreElements does not exist in Vue 2.0.x
      if (Vue.config.ignoredElements) {
        Vue.config.ignoredElements.push((stub + "-stub"));
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
      Vue.config.ignoredElements.push(((components[component].name) + "-stub"));
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

function isValidSlot (slot) {
  return Array.isArray(slot) ||
   (slot !== null && typeof slot === 'object') ||
   typeof slot === 'string'
}

function requiresTemplateCompiler (slot) {
  if (typeof slot === 'string' && !vueTemplateCompiler.compileToFunctions) {
    throwError('vueTemplateCompiler is undefined, you must pass precompiled components if vue-template-compiler is undefined');
  }
}

function validateSlots (slots) {
  Object.keys(slots).forEach(function (key) {
    if (!isValidSlot(slots[key])) {
      throwError('slots[key] must be a Component, string or an array of Components');
    }

    requiresTemplateCompiler(slots[key]);

    if (Array.isArray(slots[key])) {
      slots[key].forEach(function (slotValue) {
        if (!isValidSlot(slotValue)) {
          throwError('slots[key] must be a Component, string or an array of Components');
        }
        requiresTemplateCompiler(slotValue);
      });
    }
  });
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

function createInstance (
  component,
  options,
  _Vue,
  elm
) {
  // Remove cached constructor
  delete component._Ctor;

  if (options.mocks) {
    addMocks(options.mocks, _Vue);
  }
  if ((component.options && component.options.functional) || component.functional) {
    component = createFunctionalComponent(component, options);
  } else if (options.context) {
    throwError(
      'mount.context can only be used when mounting a functional component'
    );
  }

  if (componentNeedsCompiling(component)) {
    compileTemplate(component);
  }

  addEventLogger(_Vue);

  var instanceOptions = Object.assign({}, options);

  deleteMountingOptions(instanceOptions);

  // $FlowIgnore
  var stubComponents = createComponentStubs(component.components, options.stubs);
  if (options.stubs) {
    instanceOptions.components = Object.assign({}, instanceOptions.components,
      // $FlowIgnore
      stubComponents);
  }

  Object.keys(component.components || {}).forEach(function (c) {
    if (component.components[c].extendOptions &&
      !instanceOptions.components[c]) {
      if (options.logModifiedComponents) {
        warn(("an extended child component " + c + " has been modified to ensure it has the correct instance properties. This means it is not possible to find the component with a component selector. To find the component, you must stub it manually using the stubs mounting option."));
      }
      instanceOptions.components[c] = _Vue.extend(component.components[c]);
    }
  });

  Object.keys(stubComponents).forEach(function (c) {
    _Vue.component(c, stubComponents[c]);
  });

  var Constructor = vueVersion < 2.3 && typeof component === 'function'
    ? component.extend(instanceOptions)
    : _Vue.extend(component).extend(instanceOptions);

  Object.keys(instanceOptions.components || {}).forEach(function (key) {
    Constructor.component(key, instanceOptions.components[key]);
    _Vue.component(key, instanceOptions.components[key]);
  });

  if (options.slots) {
    validateSlots(options.slots);
  }

  // Objects are not resolved in extended components in Vue < 2.5
  // https://github.com/vuejs/vue/issues/6436
  if (options.provide &&
    typeof options.provide === 'object' &&
    vueVersion < 2.5
  ) {
    var obj = Object.assign({}, options.provide);
    options.provide = function () { return obj; };
  }

  var Parent = _Vue.extend({
    provide: options.provide,
    render: function render (h) {
      var slots = options.slots
        ? createSlotVNodes(h, options.slots)
        : undefined;
      return h(Constructor, {
        ref: 'vm',
        props: options.propsData,
        on: options.listeners,
        attrs: options.attrs
      }, slots)
    }
  });

  return new Parent()
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
    {logModifiedComponents: config.logModifiedComponents,
    stubs: getOptions('stubs', options.stubs, config),
    mocks: getOptions('mocks', options.mocks, config),
    methods: getOptions('methods', options.methods, config),
    provide: getOptions('provide', options.provide, config),
    sync: !!((options.sync || options.sync === undefined))})
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
  provide: {},
  logModifiedComponents: true
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

function addScopedSlots (vm, scopedSlots) {
  if (window.navigator.userAgent.match(/PhantomJS/i)) {
    throwError('the scopedSlots option does not support PhantomJS. Please use Puppeteer, or pass a component.');
  }

  if (vueVersion < 2.5) {
    throwError('the scopedSlots option is only supported in vue@2.5+.');
  }
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

Vue.config.productionTip = false;
Vue.config.devtools = false;

function mount (component, options) {
  if ( options === void 0 ) options = {};

  var existingErrorHandler = Vue.config.errorHandler;
  Vue.config.errorHandler = errorHandler;

  warnIfNoWindow();

  // Remove cached constructor
  delete component._Ctor;

  var vueConstructor = options.localVue || createLocalVue();

  var elm = options.attachToDocument
    ? createElement()
    : undefined;

  var mergedOptions = mergeOptions(options, config);

  var parentVm = createInstance(
    component,
    mergedOptions,
    vueConstructor,
    elm
  );

  var vm = parentVm.$mount(elm).$refs.vm;

  // Workaround for Vue < 2.5
  vm._staticTrees = [];

  if (options.scopedSlots) {
    addScopedSlots(vm, options.scopedSlots);

    if (mergedOptions.sync) {
      vm._watcher.sync = true;
    }

    vm.$forceUpdate();
  }

  var componentsWithError = findAllVueComponentsFromVm(vm).filter(function (c) { return c._error; });

  if (componentsWithError.length > 0) {
    throw (componentsWithError[0]._error)
  }

  Vue.config.errorHandler = existingErrorHandler;

  var wrapperOptions = {
    attachedToDocument: !!mergedOptions.attachToDocument,
    sync: mergedOptions.sync
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
  warn('shallow has been renamed to shallowMount. shallow will be removed in 1.0.0, use shallowMount instead');
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidnVlLXRlc3QtdXRpbHMuanMiLCJzb3VyY2VzIjpbIi4uLy4uL3NoYXJlZC91dGlsLmpzIiwiLi4vc3JjL3dhcm4taWYtbm8td2luZG93LmpzIiwiLi4vc3JjL21hdGNoZXMtcG9seWZpbGwuanMiLCIuLi9zcmMvb2JqZWN0LWFzc2lnbi1wb2x5ZmlsbC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2xpc3RDYWNoZUNsZWFyLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9lcS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Fzc29jSW5kZXhPZi5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2xpc3RDYWNoZURlbGV0ZS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2xpc3RDYWNoZUdldC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2xpc3RDYWNoZUhhcy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2xpc3RDYWNoZVNldC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX0xpc3RDYWNoZS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX3N0YWNrQ2xlYXIuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19zdGFja0RlbGV0ZS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX3N0YWNrR2V0LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fc3RhY2tIYXMuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19mcmVlR2xvYmFsLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fcm9vdC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX1N5bWJvbC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2dldFJhd1RhZy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX29iamVjdFRvU3RyaW5nLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZUdldFRhZy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvaXNPYmplY3QuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL2lzRnVuY3Rpb24uanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19jb3JlSnNEYXRhLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9faXNNYXNrZWQuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL190b1NvdXJjZS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VJc05hdGl2ZS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2dldFZhbHVlLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fZ2V0TmF0aXZlLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fTWFwLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fbmF0aXZlQ3JlYXRlLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9faGFzaENsZWFyLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9faGFzaERlbGV0ZS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2hhc2hHZXQuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19oYXNoSGFzLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9faGFzaFNldC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX0hhc2guanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19tYXBDYWNoZUNsZWFyLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9faXNLZXlhYmxlLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fZ2V0TWFwRGF0YS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX21hcENhY2hlRGVsZXRlLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fbWFwQ2FjaGVHZXQuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19tYXBDYWNoZUhhcy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX21hcENhY2hlU2V0LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fTWFwQ2FjaGUuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19zdGFja1NldC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX1N0YWNrLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fZGVmaW5lUHJvcGVydHkuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19iYXNlQXNzaWduVmFsdWUuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19hc3NpZ25NZXJnZVZhbHVlLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fY3JlYXRlQmFzZUZvci5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VGb3IuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19jbG9uZUJ1ZmZlci5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX1VpbnQ4QXJyYXkuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19jbG9uZUFycmF5QnVmZmVyLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fY2xvbmVUeXBlZEFycmF5LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fY29weUFycmF5LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZUNyZWF0ZS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX292ZXJBcmcuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19nZXRQcm90b3R5cGUuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19pc1Byb3RvdHlwZS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2luaXRDbG9uZU9iamVjdC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvaXNPYmplY3RMaWtlLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZUlzQXJndW1lbnRzLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9pc0FyZ3VtZW50cy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvaXNBcnJheS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvaXNMZW5ndGguanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL2lzQXJyYXlMaWtlLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9pc0FycmF5TGlrZU9iamVjdC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvc3R1YkZhbHNlLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9pc0J1ZmZlci5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvaXNQbGFpbk9iamVjdC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VJc1R5cGVkQXJyYXkuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19iYXNlVW5hcnkuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19ub2RlVXRpbC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvaXNUeXBlZEFycmF5LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYXNzaWduVmFsdWUuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19jb3B5T2JqZWN0LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZVRpbWVzLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9faXNJbmRleC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2FycmF5TGlrZUtleXMuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19uYXRpdmVLZXlzSW4uanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19iYXNlS2V5c0luLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9rZXlzSW4uanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL3RvUGxhaW5PYmplY3QuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19iYXNlTWVyZ2VEZWVwLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZU1lcmdlLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9pZGVudGl0eS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2FwcGx5LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fb3ZlclJlc3QuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL2NvbnN0YW50LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZVNldFRvU3RyaW5nLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fc2hvcnRPdXQuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19zZXRUb1N0cmluZy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VSZXN0LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9faXNJdGVyYXRlZUNhbGwuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19jcmVhdGVBc3NpZ25lci5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvbWVyZ2VXaXRoLmpzIiwiLi4vLi4vc2hhcmVkL3ZhbGlkYXRvcnMuanMiLCIuLi9zcmMvY29uc3RzLmpzIiwiLi4vc3JjL2dldC1zZWxlY3Rvci10eXBlLmpzIiwiLi4vc3JjL2ZpbmQtdnVlLWNvbXBvbmVudHMuanMiLCIuLi9zcmMvd3JhcHBlci1hcnJheS5qcyIsIi4uL3NyYy9lcnJvci13cmFwcGVyLmpzIiwiLi4vc3JjL2ZpbmQtdm5vZGVzLmpzIiwiLi4vc3JjL2ZpbmQtZG9tLW5vZGVzLmpzIiwiLi4vc3JjL2ZpbmQuanMiLCIuLi9zcmMvY3JlYXRlLXdyYXBwZXIuanMiLCIuLi9zcmMvb3JkZXItd2F0Y2hlcnMuanMiLCIuLi9zcmMvd3JhcHBlci5qcyIsIi4uL3NyYy9zZXQtd2F0Y2hlcnMtdG8tc3luYy5qcyIsIi4uL3NyYy92dWUtd3JhcHBlci5qcyIsIi4uLy4uL2NyZWF0ZS1pbnN0YW5jZS9hZGQtc2xvdHMuanMiLCIuLi8uLi9jcmVhdGUtaW5zdGFuY2UvYWRkLW1vY2tzLmpzIiwiLi4vLi4vY3JlYXRlLWluc3RhbmNlL2xvZy1ldmVudHMuanMiLCIuLi8uLi9zaGFyZWQvY29tcGlsZS10ZW1wbGF0ZS5qcyIsIi4uLy4uL3NoYXJlZC9zdHViLWNvbXBvbmVudHMuanMiLCIuLi8uLi9jcmVhdGUtaW5zdGFuY2UvZGVsZXRlLW1vdW50aW5nLW9wdGlvbnMuanMiLCIuLi8uLi9jcmVhdGUtaW5zdGFuY2UvdmFsaWRhdGUtc2xvdHMuanMiLCIuLi8uLi9jcmVhdGUtaW5zdGFuY2UvY3JlYXRlLWZ1bmN0aW9uYWwtY29tcG9uZW50LmpzIiwiLi4vLi4vY3JlYXRlLWluc3RhbmNlL2NyZWF0ZS1pbnN0YW5jZS5qcyIsIi4uL3NyYy9jcmVhdGUtZWxlbWVudC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2FycmF5RWFjaC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX25hdGl2ZUtleXMuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19iYXNlS2V5cy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gva2V5cy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VBc3NpZ24uanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19iYXNlQXNzaWduSW4uanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19hcnJheUZpbHRlci5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvc3R1YkFycmF5LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fZ2V0U3ltYm9scy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2NvcHlTeW1ib2xzLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYXJyYXlQdXNoLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fZ2V0U3ltYm9sc0luLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fY29weVN5bWJvbHNJbi5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VHZXRBbGxLZXlzLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fZ2V0QWxsS2V5cy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2dldEFsbEtleXNJbi5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX0RhdGFWaWV3LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fUHJvbWlzZS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX1NldC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX1dlYWtNYXAuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19nZXRUYWcuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19pbml0Q2xvbmVBcnJheS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Nsb25lRGF0YVZpZXcuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19hZGRNYXBFbnRyeS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2FycmF5UmVkdWNlLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fbWFwVG9BcnJheS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Nsb25lTWFwLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fY2xvbmVSZWdFeHAuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19hZGRTZXRFbnRyeS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX3NldFRvQXJyYXkuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19jbG9uZVNldC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Nsb25lU3ltYm9sLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9faW5pdENsb25lQnlUYWcuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19iYXNlQ2xvbmUuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL2Nsb25lRGVlcC5qcyIsIi4uL3NyYy9lcnJvci1oYW5kbGVyLmpzIiwiLi4vc3JjL2NyZWF0ZS1sb2NhbC12dWUuanMiLCIuLi8uLi9zaGFyZWQvbWVyZ2Utb3B0aW9ucy5qcyIsIi4uL3NyYy9jb21wb25lbnRzL1RyYW5zaXRpb25TdHViLmpzIiwiLi4vc3JjL2NvbXBvbmVudHMvVHJhbnNpdGlvbkdyb3VwU3R1Yi5qcyIsIi4uL3NyYy9jb25maWcuanMiLCIuLi9zcmMvYWRkLXNjb3BlZC1zbG90cy5qcyIsIi4uL3NyYy9tb3VudC5qcyIsIi4uL3NyYy9zaGFsbG93LW1vdW50LmpzIiwiLi4vc3JjL2NvbXBvbmVudHMvUm91dGVyTGlua1N0dWIuanMiLCIuLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQGZsb3dcbmltcG9ydCBWdWUgZnJvbSAndnVlJ1xuXG5leHBvcnQgZnVuY3Rpb24gdGhyb3dFcnJvciAobXNnOiBzdHJpbmcpIHtcbiAgdGhyb3cgbmV3IEVycm9yKGBbdnVlLXRlc3QtdXRpbHNdOiAke21zZ31gKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gd2FybiAobXNnOiBzdHJpbmcpIHtcbiAgY29uc29sZS5lcnJvcihgW3Z1ZS10ZXN0LXV0aWxzXTogJHttc2d9YClcbn1cblxuY29uc3QgY2FtZWxpemVSRSA9IC8tKFxcdykvZ1xuZXhwb3J0IGNvbnN0IGNhbWVsaXplID0gKHN0cjogc3RyaW5nKSA9PiB7XG4gIGNvbnN0IGNhbWVsaXplZFN0ciA9IHN0ci5yZXBsYWNlKGNhbWVsaXplUkUsIChfLCBjKSA9PiBjID8gYy50b1VwcGVyQ2FzZSgpIDogJycpXG4gIHJldHVybiBjYW1lbGl6ZWRTdHIuY2hhckF0KDApLnRvTG93ZXJDYXNlKCkgKyBjYW1lbGl6ZWRTdHIuc2xpY2UoMSlcbn1cblxuLyoqXG4gKiBDYXBpdGFsaXplIGEgc3RyaW5nLlxuICovXG5leHBvcnQgY29uc3QgY2FwaXRhbGl6ZSA9IChzdHI6IHN0cmluZykgPT4gc3RyLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgc3RyLnNsaWNlKDEpXG5cbi8qKlxuICogSHlwaGVuYXRlIGEgY2FtZWxDYXNlIHN0cmluZy5cbiAqL1xuY29uc3QgaHlwaGVuYXRlUkUgPSAvXFxCKFtBLVpdKS9nXG5leHBvcnQgY29uc3QgaHlwaGVuYXRlID0gKHN0cjogc3RyaW5nKSA9PiBzdHIucmVwbGFjZShoeXBoZW5hdGVSRSwgJy0kMScpLnRvTG93ZXJDYXNlKClcblxuZXhwb3J0IGNvbnN0IHZ1ZVZlcnNpb24gPSBOdW1iZXIoYCR7VnVlLnZlcnNpb24uc3BsaXQoJy4nKVswXX0uJHtWdWUudmVyc2lvbi5zcGxpdCgnLicpWzFdfWApXG4iLCJpbXBvcnQgeyB0aHJvd0Vycm9yIH0gZnJvbSAnc2hhcmVkL3V0aWwnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHdhcm5JZk5vV2luZG93ICgpIHtcbiAgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgdGhyb3dFcnJvcihcbiAgICAgICd3aW5kb3cgaXMgdW5kZWZpbmVkLCB2dWUtdGVzdC11dGlscyBuZWVkcyB0byBiZSBydW4gaW4gYSBicm93c2VyIGVudmlyb25tZW50LlxcbicgK1xuICAgICAgJ1lvdSBjYW4gcnVuIHRoZSB0ZXN0cyBpbiBub2RlIHVzaW5nIGpzZG9tICsganNkb20tZ2xvYmFsLlxcbicgK1xuICAgICAgJ1NlZSBodHRwczovL3Z1ZS10ZXN0LXV0aWxzLnZ1ZWpzLm9yZy9ndWlkZXMvY29tbW9uLXRpcHMuaHRtbCBmb3IgbW9yZSBkZXRhaWxzLidcbiAgICApXG4gIH1cbn1cbiIsImlmICh0eXBlb2YgRWxlbWVudCAhPT0gJ3VuZGVmaW5lZCcgJiYgIUVsZW1lbnQucHJvdG90eXBlLm1hdGNoZXMpIHtcbiAgRWxlbWVudC5wcm90b3R5cGUubWF0Y2hlcyA9XG4gICAgICAgIEVsZW1lbnQucHJvdG90eXBlLm1hdGNoZXNTZWxlY3RvciB8fFxuICAgICAgICBFbGVtZW50LnByb3RvdHlwZS5tb3pNYXRjaGVzU2VsZWN0b3IgfHxcbiAgICAgICAgRWxlbWVudC5wcm90b3R5cGUubXNNYXRjaGVzU2VsZWN0b3IgfHxcbiAgICAgICAgRWxlbWVudC5wcm90b3R5cGUub01hdGNoZXNTZWxlY3RvciB8fFxuICAgICAgICBFbGVtZW50LnByb3RvdHlwZS53ZWJraXRNYXRjaGVzU2VsZWN0b3IgfHxcbiAgICAgICAgZnVuY3Rpb24gKHMpIHtcbiAgICAgICAgICBjb25zdCBtYXRjaGVzID0gKHRoaXMuZG9jdW1lbnQgfHwgdGhpcy5vd25lckRvY3VtZW50KS5xdWVyeVNlbGVjdG9yQWxsKHMpXG4gICAgICAgICAgbGV0IGkgPSBtYXRjaGVzLmxlbmd0aFxuICAgICAgICAgIHdoaWxlICgtLWkgPj0gMCAmJiBtYXRjaGVzLml0ZW0oaSkgIT09IHRoaXMpIHt9XG4gICAgICAgICAgcmV0dXJuIGkgPiAtMVxuICAgICAgICB9XG59XG4iLCJpZiAodHlwZW9mIE9iamVjdC5hc3NpZ24gIT09ICdmdW5jdGlvbicpIHtcbiAgKGZ1bmN0aW9uICgpIHtcbiAgICBPYmplY3QuYXNzaWduID0gZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgJ3VzZSBzdHJpY3QnXG4gICAgICBpZiAodGFyZ2V0ID09PSB1bmRlZmluZWQgfHwgdGFyZ2V0ID09PSBudWxsKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjb252ZXJ0IHVuZGVmaW5lZCBvciBudWxsIHRvIG9iamVjdCcpXG4gICAgICB9XG5cbiAgICAgIHZhciBvdXRwdXQgPSBPYmplY3QodGFyZ2V0KVxuICAgICAgZm9yICh2YXIgaW5kZXggPSAxOyBpbmRleCA8IGFyZ3VtZW50cy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpbmRleF1cbiAgICAgICAgaWYgKHNvdXJjZSAhPT0gdW5kZWZpbmVkICYmIHNvdXJjZSAhPT0gbnVsbCkge1xuICAgICAgICAgIGZvciAodmFyIG5leHRLZXkgaW4gc291cmNlKSB7XG4gICAgICAgICAgICBpZiAoc291cmNlLmhhc093blByb3BlcnR5KG5leHRLZXkpKSB7XG4gICAgICAgICAgICAgIG91dHB1dFtuZXh0S2V5XSA9IHNvdXJjZVtuZXh0S2V5XVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIG91dHB1dFxuICAgIH1cbiAgfSkoKVxufVxuIiwiLyoqXG4gKiBSZW1vdmVzIGFsbCBrZXktdmFsdWUgZW50cmllcyBmcm9tIHRoZSBsaXN0IGNhY2hlLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBjbGVhclxuICogQG1lbWJlck9mIExpc3RDYWNoZVxuICovXG5mdW5jdGlvbiBsaXN0Q2FjaGVDbGVhcigpIHtcbiAgdGhpcy5fX2RhdGFfXyA9IFtdO1xuICB0aGlzLnNpemUgPSAwO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGxpc3RDYWNoZUNsZWFyO1xuIiwiLyoqXG4gKiBQZXJmb3JtcyBhXG4gKiBbYFNhbWVWYWx1ZVplcm9gXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1zYW1ldmFsdWV6ZXJvKVxuICogY29tcGFyaXNvbiBiZXR3ZWVuIHR3byB2YWx1ZXMgdG8gZGV0ZXJtaW5lIGlmIHRoZXkgYXJlIGVxdWl2YWxlbnQuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNvbXBhcmUuXG4gKiBAcGFyYW0geyp9IG90aGVyIFRoZSBvdGhlciB2YWx1ZSB0byBjb21wYXJlLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSB2YWx1ZXMgYXJlIGVxdWl2YWxlbnQsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogdmFyIG9iamVjdCA9IHsgJ2EnOiAxIH07XG4gKiB2YXIgb3RoZXIgPSB7ICdhJzogMSB9O1xuICpcbiAqIF8uZXEob2JqZWN0LCBvYmplY3QpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uZXEob2JqZWN0LCBvdGhlcik7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uZXEoJ2EnLCAnYScpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uZXEoJ2EnLCBPYmplY3QoJ2EnKSk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uZXEoTmFOLCBOYU4pO1xuICogLy8gPT4gdHJ1ZVxuICovXG5mdW5jdGlvbiBlcSh2YWx1ZSwgb3RoZXIpIHtcbiAgcmV0dXJuIHZhbHVlID09PSBvdGhlciB8fCAodmFsdWUgIT09IHZhbHVlICYmIG90aGVyICE9PSBvdGhlcik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZXE7XG4iLCJ2YXIgZXEgPSByZXF1aXJlKCcuL2VxJyk7XG5cbi8qKlxuICogR2V0cyB0aGUgaW5kZXggYXQgd2hpY2ggdGhlIGBrZXlgIGlzIGZvdW5kIGluIGBhcnJheWAgb2Yga2V5LXZhbHVlIHBhaXJzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gaW5zcGVjdC5cbiAqIEBwYXJhbSB7Kn0ga2V5IFRoZSBrZXkgdG8gc2VhcmNoIGZvci5cbiAqIEByZXR1cm5zIHtudW1iZXJ9IFJldHVybnMgdGhlIGluZGV4IG9mIHRoZSBtYXRjaGVkIHZhbHVlLCBlbHNlIGAtMWAuXG4gKi9cbmZ1bmN0aW9uIGFzc29jSW5kZXhPZihhcnJheSwga2V5KSB7XG4gIHZhciBsZW5ndGggPSBhcnJheS5sZW5ndGg7XG4gIHdoaWxlIChsZW5ndGgtLSkge1xuICAgIGlmIChlcShhcnJheVtsZW5ndGhdWzBdLCBrZXkpKSB7XG4gICAgICByZXR1cm4gbGVuZ3RoO1xuICAgIH1cbiAgfVxuICByZXR1cm4gLTE7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYXNzb2NJbmRleE9mO1xuIiwidmFyIGFzc29jSW5kZXhPZiA9IHJlcXVpcmUoJy4vX2Fzc29jSW5kZXhPZicpO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgYXJyYXlQcm90byA9IEFycmF5LnByb3RvdHlwZTtcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgc3BsaWNlID0gYXJyYXlQcm90by5zcGxpY2U7XG5cbi8qKlxuICogUmVtb3ZlcyBga2V5YCBhbmQgaXRzIHZhbHVlIGZyb20gdGhlIGxpc3QgY2FjaGUuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGRlbGV0ZVxuICogQG1lbWJlck9mIExpc3RDYWNoZVxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byByZW1vdmUuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGVudHJ5IHdhcyByZW1vdmVkLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGxpc3RDYWNoZURlbGV0ZShrZXkpIHtcbiAgdmFyIGRhdGEgPSB0aGlzLl9fZGF0YV9fLFxuICAgICAgaW5kZXggPSBhc3NvY0luZGV4T2YoZGF0YSwga2V5KTtcblxuICBpZiAoaW5kZXggPCAwKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciBsYXN0SW5kZXggPSBkYXRhLmxlbmd0aCAtIDE7XG4gIGlmIChpbmRleCA9PSBsYXN0SW5kZXgpIHtcbiAgICBkYXRhLnBvcCgpO1xuICB9IGVsc2Uge1xuICAgIHNwbGljZS5jYWxsKGRhdGEsIGluZGV4LCAxKTtcbiAgfVxuICAtLXRoaXMuc2l6ZTtcbiAgcmV0dXJuIHRydWU7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbGlzdENhY2hlRGVsZXRlO1xuIiwidmFyIGFzc29jSW5kZXhPZiA9IHJlcXVpcmUoJy4vX2Fzc29jSW5kZXhPZicpO1xuXG4vKipcbiAqIEdldHMgdGhlIGxpc3QgY2FjaGUgdmFsdWUgZm9yIGBrZXlgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBnZXRcbiAqIEBtZW1iZXJPZiBMaXN0Q2FjaGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gZ2V0LlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIGVudHJ5IHZhbHVlLlxuICovXG5mdW5jdGlvbiBsaXN0Q2FjaGVHZXQoa2V5KSB7XG4gIHZhciBkYXRhID0gdGhpcy5fX2RhdGFfXyxcbiAgICAgIGluZGV4ID0gYXNzb2NJbmRleE9mKGRhdGEsIGtleSk7XG5cbiAgcmV0dXJuIGluZGV4IDwgMCA/IHVuZGVmaW5lZCA6IGRhdGFbaW5kZXhdWzFdO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGxpc3RDYWNoZUdldDtcbiIsInZhciBhc3NvY0luZGV4T2YgPSByZXF1aXJlKCcuL19hc3NvY0luZGV4T2YnKTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYSBsaXN0IGNhY2hlIHZhbHVlIGZvciBga2V5YCBleGlzdHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGhhc1xuICogQG1lbWJlck9mIExpc3RDYWNoZVxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBlbnRyeSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBhbiBlbnRyeSBmb3IgYGtleWAgZXhpc3RzLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGxpc3RDYWNoZUhhcyhrZXkpIHtcbiAgcmV0dXJuIGFzc29jSW5kZXhPZih0aGlzLl9fZGF0YV9fLCBrZXkpID4gLTE7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbGlzdENhY2hlSGFzO1xuIiwidmFyIGFzc29jSW5kZXhPZiA9IHJlcXVpcmUoJy4vX2Fzc29jSW5kZXhPZicpO1xuXG4vKipcbiAqIFNldHMgdGhlIGxpc3QgY2FjaGUgYGtleWAgdG8gYHZhbHVlYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgc2V0XG4gKiBAbWVtYmVyT2YgTGlzdENhY2hlXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIHNldC5cbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHNldC5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIGxpc3QgY2FjaGUgaW5zdGFuY2UuXG4gKi9cbmZ1bmN0aW9uIGxpc3RDYWNoZVNldChrZXksIHZhbHVlKSB7XG4gIHZhciBkYXRhID0gdGhpcy5fX2RhdGFfXyxcbiAgICAgIGluZGV4ID0gYXNzb2NJbmRleE9mKGRhdGEsIGtleSk7XG5cbiAgaWYgKGluZGV4IDwgMCkge1xuICAgICsrdGhpcy5zaXplO1xuICAgIGRhdGEucHVzaChba2V5LCB2YWx1ZV0pO1xuICB9IGVsc2Uge1xuICAgIGRhdGFbaW5kZXhdWzFdID0gdmFsdWU7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbGlzdENhY2hlU2V0O1xuIiwidmFyIGxpc3RDYWNoZUNsZWFyID0gcmVxdWlyZSgnLi9fbGlzdENhY2hlQ2xlYXInKSxcbiAgICBsaXN0Q2FjaGVEZWxldGUgPSByZXF1aXJlKCcuL19saXN0Q2FjaGVEZWxldGUnKSxcbiAgICBsaXN0Q2FjaGVHZXQgPSByZXF1aXJlKCcuL19saXN0Q2FjaGVHZXQnKSxcbiAgICBsaXN0Q2FjaGVIYXMgPSByZXF1aXJlKCcuL19saXN0Q2FjaGVIYXMnKSxcbiAgICBsaXN0Q2FjaGVTZXQgPSByZXF1aXJlKCcuL19saXN0Q2FjaGVTZXQnKTtcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGxpc3QgY2FjaGUgb2JqZWN0LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7QXJyYXl9IFtlbnRyaWVzXSBUaGUga2V5LXZhbHVlIHBhaXJzIHRvIGNhY2hlLlxuICovXG5mdW5jdGlvbiBMaXN0Q2FjaGUoZW50cmllcykge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IGVudHJpZXMgPT0gbnVsbCA/IDAgOiBlbnRyaWVzLmxlbmd0aDtcblxuICB0aGlzLmNsZWFyKCk7XG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgdmFyIGVudHJ5ID0gZW50cmllc1tpbmRleF07XG4gICAgdGhpcy5zZXQoZW50cnlbMF0sIGVudHJ5WzFdKTtcbiAgfVxufVxuXG4vLyBBZGQgbWV0aG9kcyB0byBgTGlzdENhY2hlYC5cbkxpc3RDYWNoZS5wcm90b3R5cGUuY2xlYXIgPSBsaXN0Q2FjaGVDbGVhcjtcbkxpc3RDYWNoZS5wcm90b3R5cGVbJ2RlbGV0ZSddID0gbGlzdENhY2hlRGVsZXRlO1xuTGlzdENhY2hlLnByb3RvdHlwZS5nZXQgPSBsaXN0Q2FjaGVHZXQ7XG5MaXN0Q2FjaGUucHJvdG90eXBlLmhhcyA9IGxpc3RDYWNoZUhhcztcbkxpc3RDYWNoZS5wcm90b3R5cGUuc2V0ID0gbGlzdENhY2hlU2V0O1xuXG5tb2R1bGUuZXhwb3J0cyA9IExpc3RDYWNoZTtcbiIsInZhciBMaXN0Q2FjaGUgPSByZXF1aXJlKCcuL19MaXN0Q2FjaGUnKTtcblxuLyoqXG4gKiBSZW1vdmVzIGFsbCBrZXktdmFsdWUgZW50cmllcyBmcm9tIHRoZSBzdGFjay5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgY2xlYXJcbiAqIEBtZW1iZXJPZiBTdGFja1xuICovXG5mdW5jdGlvbiBzdGFja0NsZWFyKCkge1xuICB0aGlzLl9fZGF0YV9fID0gbmV3IExpc3RDYWNoZTtcbiAgdGhpcy5zaXplID0gMDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzdGFja0NsZWFyO1xuIiwiLyoqXG4gKiBSZW1vdmVzIGBrZXlgIGFuZCBpdHMgdmFsdWUgZnJvbSB0aGUgc3RhY2suXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGRlbGV0ZVxuICogQG1lbWJlck9mIFN0YWNrXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIHJlbW92ZS5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgZW50cnkgd2FzIHJlbW92ZWQsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gc3RhY2tEZWxldGUoa2V5KSB7XG4gIHZhciBkYXRhID0gdGhpcy5fX2RhdGFfXyxcbiAgICAgIHJlc3VsdCA9IGRhdGFbJ2RlbGV0ZSddKGtleSk7XG5cbiAgdGhpcy5zaXplID0gZGF0YS5zaXplO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHN0YWNrRGVsZXRlO1xuIiwiLyoqXG4gKiBHZXRzIHRoZSBzdGFjayB2YWx1ZSBmb3IgYGtleWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGdldFxuICogQG1lbWJlck9mIFN0YWNrXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIGdldC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBlbnRyeSB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gc3RhY2tHZXQoa2V5KSB7XG4gIHJldHVybiB0aGlzLl9fZGF0YV9fLmdldChrZXkpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHN0YWNrR2V0O1xuIiwiLyoqXG4gKiBDaGVja3MgaWYgYSBzdGFjayB2YWx1ZSBmb3IgYGtleWAgZXhpc3RzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBoYXNcbiAqIEBtZW1iZXJPZiBTdGFja1xuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBlbnRyeSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBhbiBlbnRyeSBmb3IgYGtleWAgZXhpc3RzLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIHN0YWNrSGFzKGtleSkge1xuICByZXR1cm4gdGhpcy5fX2RhdGFfXy5oYXMoa2V5KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzdGFja0hhcztcbiIsIi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgZ2xvYmFsYCBmcm9tIE5vZGUuanMuICovXG52YXIgZnJlZUdsb2JhbCA9IHR5cGVvZiBnbG9iYWwgPT0gJ29iamVjdCcgJiYgZ2xvYmFsICYmIGdsb2JhbC5PYmplY3QgPT09IE9iamVjdCAmJiBnbG9iYWw7XG5cbm1vZHVsZS5leHBvcnRzID0gZnJlZUdsb2JhbDtcbiIsInZhciBmcmVlR2xvYmFsID0gcmVxdWlyZSgnLi9fZnJlZUdsb2JhbCcpO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYHNlbGZgLiAqL1xudmFyIGZyZWVTZWxmID0gdHlwZW9mIHNlbGYgPT0gJ29iamVjdCcgJiYgc2VsZiAmJiBzZWxmLk9iamVjdCA9PT0gT2JqZWN0ICYmIHNlbGY7XG5cbi8qKiBVc2VkIGFzIGEgcmVmZXJlbmNlIHRvIHRoZSBnbG9iYWwgb2JqZWN0LiAqL1xudmFyIHJvb3QgPSBmcmVlR2xvYmFsIHx8IGZyZWVTZWxmIHx8IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gcm9vdDtcbiIsInZhciByb290ID0gcmVxdWlyZSgnLi9fcm9vdCcpO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBTeW1ib2wgPSByb290LlN5bWJvbDtcblxubW9kdWxlLmV4cG9ydHMgPSBTeW1ib2w7XG4iLCJ2YXIgU3ltYm9sID0gcmVxdWlyZSgnLi9fU3ltYm9sJyk7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogVXNlZCB0byByZXNvbHZlIHRoZVxuICogW2B0b1N0cmluZ1RhZ2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLW9iamVjdC5wcm90b3R5cGUudG9zdHJpbmcpXG4gKiBvZiB2YWx1ZXMuXG4gKi9cbnZhciBuYXRpdmVPYmplY3RUb1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBzeW1Ub1N0cmluZ1RhZyA9IFN5bWJvbCA/IFN5bWJvbC50b1N0cmluZ1RhZyA6IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBBIHNwZWNpYWxpemVkIHZlcnNpb24gb2YgYGJhc2VHZXRUYWdgIHdoaWNoIGlnbm9yZXMgYFN5bWJvbC50b1N0cmluZ1RhZ2AgdmFsdWVzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIHJhdyBgdG9TdHJpbmdUYWdgLlxuICovXG5mdW5jdGlvbiBnZXRSYXdUYWcodmFsdWUpIHtcbiAgdmFyIGlzT3duID0gaGFzT3duUHJvcGVydHkuY2FsbCh2YWx1ZSwgc3ltVG9TdHJpbmdUYWcpLFxuICAgICAgdGFnID0gdmFsdWVbc3ltVG9TdHJpbmdUYWddO1xuXG4gIHRyeSB7XG4gICAgdmFsdWVbc3ltVG9TdHJpbmdUYWddID0gdW5kZWZpbmVkO1xuICAgIHZhciB1bm1hc2tlZCA9IHRydWU7XG4gIH0gY2F0Y2ggKGUpIHt9XG5cbiAgdmFyIHJlc3VsdCA9IG5hdGl2ZU9iamVjdFRvU3RyaW5nLmNhbGwodmFsdWUpO1xuICBpZiAodW5tYXNrZWQpIHtcbiAgICBpZiAoaXNPd24pIHtcbiAgICAgIHZhbHVlW3N5bVRvU3RyaW5nVGFnXSA9IHRhZztcbiAgICB9IGVsc2Uge1xuICAgICAgZGVsZXRlIHZhbHVlW3N5bVRvU3RyaW5nVGFnXTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZXRSYXdUYWc7XG4iLCIvKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKipcbiAqIFVzZWQgdG8gcmVzb2x2ZSB0aGVcbiAqIFtgdG9TdHJpbmdUYWdgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1vYmplY3QucHJvdG90eXBlLnRvc3RyaW5nKVxuICogb2YgdmFsdWVzLlxuICovXG52YXIgbmF0aXZlT2JqZWN0VG9TdHJpbmcgPSBvYmplY3RQcm90by50b1N0cmluZztcblxuLyoqXG4gKiBDb252ZXJ0cyBgdmFsdWVgIHRvIGEgc3RyaW5nIHVzaW5nIGBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY29udmVydC5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIGNvbnZlcnRlZCBzdHJpbmcuXG4gKi9cbmZ1bmN0aW9uIG9iamVjdFRvU3RyaW5nKHZhbHVlKSB7XG4gIHJldHVybiBuYXRpdmVPYmplY3RUb1N0cmluZy5jYWxsKHZhbHVlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBvYmplY3RUb1N0cmluZztcbiIsInZhciBTeW1ib2wgPSByZXF1aXJlKCcuL19TeW1ib2wnKSxcbiAgICBnZXRSYXdUYWcgPSByZXF1aXJlKCcuL19nZXRSYXdUYWcnKSxcbiAgICBvYmplY3RUb1N0cmluZyA9IHJlcXVpcmUoJy4vX29iamVjdFRvU3RyaW5nJyk7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBudWxsVGFnID0gJ1tvYmplY3QgTnVsbF0nLFxuICAgIHVuZGVmaW5lZFRhZyA9ICdbb2JqZWN0IFVuZGVmaW5lZF0nO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBzeW1Ub1N0cmluZ1RhZyA9IFN5bWJvbCA/IFN5bWJvbC50b1N0cmluZ1RhZyA6IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgZ2V0VGFnYCB3aXRob3V0IGZhbGxiYWNrcyBmb3IgYnVnZ3kgZW52aXJvbm1lbnRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIGB0b1N0cmluZ1RhZ2AuXG4gKi9cbmZ1bmN0aW9uIGJhc2VHZXRUYWcodmFsdWUpIHtcbiAgaWYgKHZhbHVlID09IG51bGwpIHtcbiAgICByZXR1cm4gdmFsdWUgPT09IHVuZGVmaW5lZCA/IHVuZGVmaW5lZFRhZyA6IG51bGxUYWc7XG4gIH1cbiAgcmV0dXJuIChzeW1Ub1N0cmluZ1RhZyAmJiBzeW1Ub1N0cmluZ1RhZyBpbiBPYmplY3QodmFsdWUpKVxuICAgID8gZ2V0UmF3VGFnKHZhbHVlKVxuICAgIDogb2JqZWN0VG9TdHJpbmcodmFsdWUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VHZXRUYWc7XG4iLCIvKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIHRoZVxuICogW2xhbmd1YWdlIHR5cGVdKGh0dHA6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1lY21hc2NyaXB0LWxhbmd1YWdlLXR5cGVzKVxuICogb2YgYE9iamVjdGAuIChlLmcuIGFycmF5cywgZnVuY3Rpb25zLCBvYmplY3RzLCByZWdleGVzLCBgbmV3IE51bWJlcigwKWAsIGFuZCBgbmV3IFN0cmluZygnJylgKVxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFuIG9iamVjdCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzT2JqZWN0KHt9KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChfLm5vb3ApO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QobnVsbCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdCh2YWx1ZSkge1xuICB2YXIgdHlwZSA9IHR5cGVvZiB2YWx1ZTtcbiAgcmV0dXJuIHZhbHVlICE9IG51bGwgJiYgKHR5cGUgPT0gJ29iamVjdCcgfHwgdHlwZSA9PSAnZnVuY3Rpb24nKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc09iamVjdDtcbiIsInZhciBiYXNlR2V0VGFnID0gcmVxdWlyZSgnLi9fYmFzZUdldFRhZycpLFxuICAgIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9pc09iamVjdCcpO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgYXN5bmNUYWcgPSAnW29iamVjdCBBc3luY0Z1bmN0aW9uXScsXG4gICAgZnVuY1RhZyA9ICdbb2JqZWN0IEZ1bmN0aW9uXScsXG4gICAgZ2VuVGFnID0gJ1tvYmplY3QgR2VuZXJhdG9yRnVuY3Rpb25dJyxcbiAgICBwcm94eVRhZyA9ICdbb2JqZWN0IFByb3h5XSc7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgY2xhc3NpZmllZCBhcyBhIGBGdW5jdGlvbmAgb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgZnVuY3Rpb24sIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0Z1bmN0aW9uKF8pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNGdW5jdGlvbigvYWJjLyk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKHZhbHVlKSB7XG4gIGlmICghaXNPYmplY3QodmFsdWUpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIC8vIFRoZSB1c2Ugb2YgYE9iamVjdCN0b1N0cmluZ2AgYXZvaWRzIGlzc3VlcyB3aXRoIHRoZSBgdHlwZW9mYCBvcGVyYXRvclxuICAvLyBpbiBTYWZhcmkgOSB3aGljaCByZXR1cm5zICdvYmplY3QnIGZvciB0eXBlZCBhcnJheXMgYW5kIG90aGVyIGNvbnN0cnVjdG9ycy5cbiAgdmFyIHRhZyA9IGJhc2VHZXRUYWcodmFsdWUpO1xuICByZXR1cm4gdGFnID09IGZ1bmNUYWcgfHwgdGFnID09IGdlblRhZyB8fCB0YWcgPT0gYXN5bmNUYWcgfHwgdGFnID09IHByb3h5VGFnO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzRnVuY3Rpb247XG4iLCJ2YXIgcm9vdCA9IHJlcXVpcmUoJy4vX3Jvb3QnKTtcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IG92ZXJyZWFjaGluZyBjb3JlLWpzIHNoaW1zLiAqL1xudmFyIGNvcmVKc0RhdGEgPSByb290WydfX2NvcmUtanNfc2hhcmVkX18nXTtcblxubW9kdWxlLmV4cG9ydHMgPSBjb3JlSnNEYXRhO1xuIiwidmFyIGNvcmVKc0RhdGEgPSByZXF1aXJlKCcuL19jb3JlSnNEYXRhJyk7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBtZXRob2RzIG1hc3F1ZXJhZGluZyBhcyBuYXRpdmUuICovXG52YXIgbWFza1NyY0tleSA9IChmdW5jdGlvbigpIHtcbiAgdmFyIHVpZCA9IC9bXi5dKyQvLmV4ZWMoY29yZUpzRGF0YSAmJiBjb3JlSnNEYXRhLmtleXMgJiYgY29yZUpzRGF0YS5rZXlzLklFX1BST1RPIHx8ICcnKTtcbiAgcmV0dXJuIHVpZCA/ICgnU3ltYm9sKHNyYylfMS4nICsgdWlkKSA6ICcnO1xufSgpKTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYGZ1bmNgIGhhcyBpdHMgc291cmNlIG1hc2tlZC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYGZ1bmNgIGlzIG1hc2tlZCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc01hc2tlZChmdW5jKSB7XG4gIHJldHVybiAhIW1hc2tTcmNLZXkgJiYgKG1hc2tTcmNLZXkgaW4gZnVuYyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNNYXNrZWQ7XG4iLCIvKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgZnVuY1Byb3RvID0gRnVuY3Rpb24ucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byByZXNvbHZlIHRoZSBkZWNvbXBpbGVkIHNvdXJjZSBvZiBmdW5jdGlvbnMuICovXG52YXIgZnVuY1RvU3RyaW5nID0gZnVuY1Byb3RvLnRvU3RyaW5nO1xuXG4vKipcbiAqIENvbnZlcnRzIGBmdW5jYCB0byBpdHMgc291cmNlIGNvZGUuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGNvbnZlcnQuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBzb3VyY2UgY29kZS5cbiAqL1xuZnVuY3Rpb24gdG9Tb3VyY2UoZnVuYykge1xuICBpZiAoZnVuYyAhPSBudWxsKSB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBmdW5jVG9TdHJpbmcuY2FsbChmdW5jKTtcbiAgICB9IGNhdGNoIChlKSB7fVxuICAgIHRyeSB7XG4gICAgICByZXR1cm4gKGZ1bmMgKyAnJyk7XG4gICAgfSBjYXRjaCAoZSkge31cbiAgfVxuICByZXR1cm4gJyc7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdG9Tb3VyY2U7XG4iLCJ2YXIgaXNGdW5jdGlvbiA9IHJlcXVpcmUoJy4vaXNGdW5jdGlvbicpLFxuICAgIGlzTWFza2VkID0gcmVxdWlyZSgnLi9faXNNYXNrZWQnKSxcbiAgICBpc09iamVjdCA9IHJlcXVpcmUoJy4vaXNPYmplY3QnKSxcbiAgICB0b1NvdXJjZSA9IHJlcXVpcmUoJy4vX3RvU291cmNlJyk7XG5cbi8qKlxuICogVXNlZCB0byBtYXRjaCBgUmVnRXhwYFxuICogW3N5bnRheCBjaGFyYWN0ZXJzXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1wYXR0ZXJucykuXG4gKi9cbnZhciByZVJlZ0V4cENoYXIgPSAvW1xcXFxeJC4qKz8oKVtcXF17fXxdL2c7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBob3N0IGNvbnN0cnVjdG9ycyAoU2FmYXJpKS4gKi9cbnZhciByZUlzSG9zdEN0b3IgPSAvXlxcW29iamVjdCAuKz9Db25zdHJ1Y3RvclxcXSQvO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgZnVuY1Byb3RvID0gRnVuY3Rpb24ucHJvdG90eXBlLFxuICAgIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gcmVzb2x2ZSB0aGUgZGVjb21waWxlZCBzb3VyY2Ugb2YgZnVuY3Rpb25zLiAqL1xudmFyIGZ1bmNUb1N0cmluZyA9IGZ1bmNQcm90by50b1N0cmluZztcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IGlmIGEgbWV0aG9kIGlzIG5hdGl2ZS4gKi9cbnZhciByZUlzTmF0aXZlID0gUmVnRXhwKCdeJyArXG4gIGZ1bmNUb1N0cmluZy5jYWxsKGhhc093blByb3BlcnR5KS5yZXBsYWNlKHJlUmVnRXhwQ2hhciwgJ1xcXFwkJicpXG4gIC5yZXBsYWNlKC9oYXNPd25Qcm9wZXJ0eXwoZnVuY3Rpb24pLio/KD89XFxcXFxcKCl8IGZvciAuKz8oPz1cXFxcXFxdKS9nLCAnJDEuKj8nKSArICckJ1xuKTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5pc05hdGl2ZWAgd2l0aG91dCBiYWQgc2hpbSBjaGVja3MuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBuYXRpdmUgZnVuY3Rpb24sXG4gKiAgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBiYXNlSXNOYXRpdmUodmFsdWUpIHtcbiAgaWYgKCFpc09iamVjdCh2YWx1ZSkgfHwgaXNNYXNrZWQodmFsdWUpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciBwYXR0ZXJuID0gaXNGdW5jdGlvbih2YWx1ZSkgPyByZUlzTmF0aXZlIDogcmVJc0hvc3RDdG9yO1xuICByZXR1cm4gcGF0dGVybi50ZXN0KHRvU291cmNlKHZhbHVlKSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUlzTmF0aXZlO1xuIiwiLyoqXG4gKiBHZXRzIHRoZSB2YWx1ZSBhdCBga2V5YCBvZiBgb2JqZWN0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IFtvYmplY3RdIFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHByb3BlcnR5IHRvIGdldC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBwcm9wZXJ0eSB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gZ2V0VmFsdWUob2JqZWN0LCBrZXkpIHtcbiAgcmV0dXJuIG9iamVjdCA9PSBudWxsID8gdW5kZWZpbmVkIDogb2JqZWN0W2tleV07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0VmFsdWU7XG4iLCJ2YXIgYmFzZUlzTmF0aXZlID0gcmVxdWlyZSgnLi9fYmFzZUlzTmF0aXZlJyksXG4gICAgZ2V0VmFsdWUgPSByZXF1aXJlKCcuL19nZXRWYWx1ZScpO1xuXG4vKipcbiAqIEdldHMgdGhlIG5hdGl2ZSBmdW5jdGlvbiBhdCBga2V5YCBvZiBgb2JqZWN0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBtZXRob2QgdG8gZ2V0LlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIGZ1bmN0aW9uIGlmIGl0J3MgbmF0aXZlLCBlbHNlIGB1bmRlZmluZWRgLlxuICovXG5mdW5jdGlvbiBnZXROYXRpdmUob2JqZWN0LCBrZXkpIHtcbiAgdmFyIHZhbHVlID0gZ2V0VmFsdWUob2JqZWN0LCBrZXkpO1xuICByZXR1cm4gYmFzZUlzTmF0aXZlKHZhbHVlKSA/IHZhbHVlIDogdW5kZWZpbmVkO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldE5hdGl2ZTtcbiIsInZhciBnZXROYXRpdmUgPSByZXF1aXJlKCcuL19nZXROYXRpdmUnKSxcbiAgICByb290ID0gcmVxdWlyZSgnLi9fcm9vdCcpO1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyB0aGF0IGFyZSB2ZXJpZmllZCB0byBiZSBuYXRpdmUuICovXG52YXIgTWFwID0gZ2V0TmF0aXZlKHJvb3QsICdNYXAnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBNYXA7XG4iLCJ2YXIgZ2V0TmF0aXZlID0gcmVxdWlyZSgnLi9fZ2V0TmF0aXZlJyk7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIHRoYXQgYXJlIHZlcmlmaWVkIHRvIGJlIG5hdGl2ZS4gKi9cbnZhciBuYXRpdmVDcmVhdGUgPSBnZXROYXRpdmUoT2JqZWN0LCAnY3JlYXRlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gbmF0aXZlQ3JlYXRlO1xuIiwidmFyIG5hdGl2ZUNyZWF0ZSA9IHJlcXVpcmUoJy4vX25hdGl2ZUNyZWF0ZScpO1xuXG4vKipcbiAqIFJlbW92ZXMgYWxsIGtleS12YWx1ZSBlbnRyaWVzIGZyb20gdGhlIGhhc2guXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGNsZWFyXG4gKiBAbWVtYmVyT2YgSGFzaFxuICovXG5mdW5jdGlvbiBoYXNoQ2xlYXIoKSB7XG4gIHRoaXMuX19kYXRhX18gPSBuYXRpdmVDcmVhdGUgPyBuYXRpdmVDcmVhdGUobnVsbCkgOiB7fTtcbiAgdGhpcy5zaXplID0gMDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBoYXNoQ2xlYXI7XG4iLCIvKipcbiAqIFJlbW92ZXMgYGtleWAgYW5kIGl0cyB2YWx1ZSBmcm9tIHRoZSBoYXNoLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBkZWxldGVcbiAqIEBtZW1iZXJPZiBIYXNoXG4gKiBAcGFyYW0ge09iamVjdH0gaGFzaCBUaGUgaGFzaCB0byBtb2RpZnkuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIHJlbW92ZS5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgZW50cnkgd2FzIHJlbW92ZWQsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaGFzaERlbGV0ZShrZXkpIHtcbiAgdmFyIHJlc3VsdCA9IHRoaXMuaGFzKGtleSkgJiYgZGVsZXRlIHRoaXMuX19kYXRhX19ba2V5XTtcbiAgdGhpcy5zaXplIC09IHJlc3VsdCA/IDEgOiAwO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGhhc2hEZWxldGU7XG4iLCJ2YXIgbmF0aXZlQ3JlYXRlID0gcmVxdWlyZSgnLi9fbmF0aXZlQ3JlYXRlJyk7XG5cbi8qKiBVc2VkIHRvIHN0YW5kLWluIGZvciBgdW5kZWZpbmVkYCBoYXNoIHZhbHVlcy4gKi9cbnZhciBIQVNIX1VOREVGSU5FRCA9ICdfX2xvZGFzaF9oYXNoX3VuZGVmaW5lZF9fJztcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBHZXRzIHRoZSBoYXNoIHZhbHVlIGZvciBga2V5YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgZ2V0XG4gKiBAbWVtYmVyT2YgSGFzaFxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byBnZXQuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgZW50cnkgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIGhhc2hHZXQoa2V5KSB7XG4gIHZhciBkYXRhID0gdGhpcy5fX2RhdGFfXztcbiAgaWYgKG5hdGl2ZUNyZWF0ZSkge1xuICAgIHZhciByZXN1bHQgPSBkYXRhW2tleV07XG4gICAgcmV0dXJuIHJlc3VsdCA9PT0gSEFTSF9VTkRFRklORUQgPyB1bmRlZmluZWQgOiByZXN1bHQ7XG4gIH1cbiAgcmV0dXJuIGhhc093blByb3BlcnR5LmNhbGwoZGF0YSwga2V5KSA/IGRhdGFba2V5XSA6IHVuZGVmaW5lZDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBoYXNoR2V0O1xuIiwidmFyIG5hdGl2ZUNyZWF0ZSA9IHJlcXVpcmUoJy4vX25hdGl2ZUNyZWF0ZScpO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIENoZWNrcyBpZiBhIGhhc2ggdmFsdWUgZm9yIGBrZXlgIGV4aXN0cy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgaGFzXG4gKiBAbWVtYmVyT2YgSGFzaFxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBlbnRyeSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBhbiBlbnRyeSBmb3IgYGtleWAgZXhpc3RzLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGhhc2hIYXMoa2V5KSB7XG4gIHZhciBkYXRhID0gdGhpcy5fX2RhdGFfXztcbiAgcmV0dXJuIG5hdGl2ZUNyZWF0ZSA/IChkYXRhW2tleV0gIT09IHVuZGVmaW5lZCkgOiBoYXNPd25Qcm9wZXJ0eS5jYWxsKGRhdGEsIGtleSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaGFzaEhhcztcbiIsInZhciBuYXRpdmVDcmVhdGUgPSByZXF1aXJlKCcuL19uYXRpdmVDcmVhdGUnKTtcblxuLyoqIFVzZWQgdG8gc3RhbmQtaW4gZm9yIGB1bmRlZmluZWRgIGhhc2ggdmFsdWVzLiAqL1xudmFyIEhBU0hfVU5ERUZJTkVEID0gJ19fbG9kYXNoX2hhc2hfdW5kZWZpbmVkX18nO1xuXG4vKipcbiAqIFNldHMgdGhlIGhhc2ggYGtleWAgdG8gYHZhbHVlYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgc2V0XG4gKiBAbWVtYmVyT2YgSGFzaFxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byBzZXQuXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBzZXQuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBoYXNoIGluc3RhbmNlLlxuICovXG5mdW5jdGlvbiBoYXNoU2V0KGtleSwgdmFsdWUpIHtcbiAgdmFyIGRhdGEgPSB0aGlzLl9fZGF0YV9fO1xuICB0aGlzLnNpemUgKz0gdGhpcy5oYXMoa2V5KSA/IDAgOiAxO1xuICBkYXRhW2tleV0gPSAobmF0aXZlQ3JlYXRlICYmIHZhbHVlID09PSB1bmRlZmluZWQpID8gSEFTSF9VTkRFRklORUQgOiB2YWx1ZTtcbiAgcmV0dXJuIHRoaXM7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaGFzaFNldDtcbiIsInZhciBoYXNoQ2xlYXIgPSByZXF1aXJlKCcuL19oYXNoQ2xlYXInKSxcbiAgICBoYXNoRGVsZXRlID0gcmVxdWlyZSgnLi9faGFzaERlbGV0ZScpLFxuICAgIGhhc2hHZXQgPSByZXF1aXJlKCcuL19oYXNoR2V0JyksXG4gICAgaGFzaEhhcyA9IHJlcXVpcmUoJy4vX2hhc2hIYXMnKSxcbiAgICBoYXNoU2V0ID0gcmVxdWlyZSgnLi9faGFzaFNldCcpO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBoYXNoIG9iamVjdC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge0FycmF5fSBbZW50cmllc10gVGhlIGtleS12YWx1ZSBwYWlycyB0byBjYWNoZS5cbiAqL1xuZnVuY3Rpb24gSGFzaChlbnRyaWVzKSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gZW50cmllcyA9PSBudWxsID8gMCA6IGVudHJpZXMubGVuZ3RoO1xuXG4gIHRoaXMuY2xlYXIoKTtcbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICB2YXIgZW50cnkgPSBlbnRyaWVzW2luZGV4XTtcbiAgICB0aGlzLnNldChlbnRyeVswXSwgZW50cnlbMV0pO1xuICB9XG59XG5cbi8vIEFkZCBtZXRob2RzIHRvIGBIYXNoYC5cbkhhc2gucHJvdG90eXBlLmNsZWFyID0gaGFzaENsZWFyO1xuSGFzaC5wcm90b3R5cGVbJ2RlbGV0ZSddID0gaGFzaERlbGV0ZTtcbkhhc2gucHJvdG90eXBlLmdldCA9IGhhc2hHZXQ7XG5IYXNoLnByb3RvdHlwZS5oYXMgPSBoYXNoSGFzO1xuSGFzaC5wcm90b3R5cGUuc2V0ID0gaGFzaFNldDtcblxubW9kdWxlLmV4cG9ydHMgPSBIYXNoO1xuIiwidmFyIEhhc2ggPSByZXF1aXJlKCcuL19IYXNoJyksXG4gICAgTGlzdENhY2hlID0gcmVxdWlyZSgnLi9fTGlzdENhY2hlJyksXG4gICAgTWFwID0gcmVxdWlyZSgnLi9fTWFwJyk7XG5cbi8qKlxuICogUmVtb3ZlcyBhbGwga2V5LXZhbHVlIGVudHJpZXMgZnJvbSB0aGUgbWFwLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBjbGVhclxuICogQG1lbWJlck9mIE1hcENhY2hlXG4gKi9cbmZ1bmN0aW9uIG1hcENhY2hlQ2xlYXIoKSB7XG4gIHRoaXMuc2l6ZSA9IDA7XG4gIHRoaXMuX19kYXRhX18gPSB7XG4gICAgJ2hhc2gnOiBuZXcgSGFzaCxcbiAgICAnbWFwJzogbmV3IChNYXAgfHwgTGlzdENhY2hlKSxcbiAgICAnc3RyaW5nJzogbmV3IEhhc2hcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBtYXBDYWNoZUNsZWFyO1xuIiwiLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBzdWl0YWJsZSBmb3IgdXNlIGFzIHVuaXF1ZSBvYmplY3Qga2V5LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIHN1aXRhYmxlLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGlzS2V5YWJsZSh2YWx1ZSkge1xuICB2YXIgdHlwZSA9IHR5cGVvZiB2YWx1ZTtcbiAgcmV0dXJuICh0eXBlID09ICdzdHJpbmcnIHx8IHR5cGUgPT0gJ251bWJlcicgfHwgdHlwZSA9PSAnc3ltYm9sJyB8fCB0eXBlID09ICdib29sZWFuJylcbiAgICA/ICh2YWx1ZSAhPT0gJ19fcHJvdG9fXycpXG4gICAgOiAodmFsdWUgPT09IG51bGwpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzS2V5YWJsZTtcbiIsInZhciBpc0tleWFibGUgPSByZXF1aXJlKCcuL19pc0tleWFibGUnKTtcblxuLyoqXG4gKiBHZXRzIHRoZSBkYXRhIGZvciBgbWFwYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG1hcCBUaGUgbWFwIHRvIHF1ZXJ5LlxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUgcmVmZXJlbmNlIGtleS5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBtYXAgZGF0YS5cbiAqL1xuZnVuY3Rpb24gZ2V0TWFwRGF0YShtYXAsIGtleSkge1xuICB2YXIgZGF0YSA9IG1hcC5fX2RhdGFfXztcbiAgcmV0dXJuIGlzS2V5YWJsZShrZXkpXG4gICAgPyBkYXRhW3R5cGVvZiBrZXkgPT0gJ3N0cmluZycgPyAnc3RyaW5nJyA6ICdoYXNoJ11cbiAgICA6IGRhdGEubWFwO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldE1hcERhdGE7XG4iLCJ2YXIgZ2V0TWFwRGF0YSA9IHJlcXVpcmUoJy4vX2dldE1hcERhdGEnKTtcblxuLyoqXG4gKiBSZW1vdmVzIGBrZXlgIGFuZCBpdHMgdmFsdWUgZnJvbSB0aGUgbWFwLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBkZWxldGVcbiAqIEBtZW1iZXJPZiBNYXBDYWNoZVxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byByZW1vdmUuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGVudHJ5IHdhcyByZW1vdmVkLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIG1hcENhY2hlRGVsZXRlKGtleSkge1xuICB2YXIgcmVzdWx0ID0gZ2V0TWFwRGF0YSh0aGlzLCBrZXkpWydkZWxldGUnXShrZXkpO1xuICB0aGlzLnNpemUgLT0gcmVzdWx0ID8gMSA6IDA7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbWFwQ2FjaGVEZWxldGU7XG4iLCJ2YXIgZ2V0TWFwRGF0YSA9IHJlcXVpcmUoJy4vX2dldE1hcERhdGEnKTtcblxuLyoqXG4gKiBHZXRzIHRoZSBtYXAgdmFsdWUgZm9yIGBrZXlgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBnZXRcbiAqIEBtZW1iZXJPZiBNYXBDYWNoZVxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byBnZXQuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgZW50cnkgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIG1hcENhY2hlR2V0KGtleSkge1xuICByZXR1cm4gZ2V0TWFwRGF0YSh0aGlzLCBrZXkpLmdldChrZXkpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG1hcENhY2hlR2V0O1xuIiwidmFyIGdldE1hcERhdGEgPSByZXF1aXJlKCcuL19nZXRNYXBEYXRhJyk7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGEgbWFwIHZhbHVlIGZvciBga2V5YCBleGlzdHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGhhc1xuICogQG1lbWJlck9mIE1hcENhY2hlXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIGVudHJ5IHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGFuIGVudHJ5IGZvciBga2V5YCBleGlzdHMsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gbWFwQ2FjaGVIYXMoa2V5KSB7XG4gIHJldHVybiBnZXRNYXBEYXRhKHRoaXMsIGtleSkuaGFzKGtleSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbWFwQ2FjaGVIYXM7XG4iLCJ2YXIgZ2V0TWFwRGF0YSA9IHJlcXVpcmUoJy4vX2dldE1hcERhdGEnKTtcblxuLyoqXG4gKiBTZXRzIHRoZSBtYXAgYGtleWAgdG8gYHZhbHVlYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgc2V0XG4gKiBAbWVtYmVyT2YgTWFwQ2FjaGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gc2V0LlxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gc2V0LlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgbWFwIGNhY2hlIGluc3RhbmNlLlxuICovXG5mdW5jdGlvbiBtYXBDYWNoZVNldChrZXksIHZhbHVlKSB7XG4gIHZhciBkYXRhID0gZ2V0TWFwRGF0YSh0aGlzLCBrZXkpLFxuICAgICAgc2l6ZSA9IGRhdGEuc2l6ZTtcblxuICBkYXRhLnNldChrZXksIHZhbHVlKTtcbiAgdGhpcy5zaXplICs9IGRhdGEuc2l6ZSA9PSBzaXplID8gMCA6IDE7XG4gIHJldHVybiB0aGlzO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG1hcENhY2hlU2V0O1xuIiwidmFyIG1hcENhY2hlQ2xlYXIgPSByZXF1aXJlKCcuL19tYXBDYWNoZUNsZWFyJyksXG4gICAgbWFwQ2FjaGVEZWxldGUgPSByZXF1aXJlKCcuL19tYXBDYWNoZURlbGV0ZScpLFxuICAgIG1hcENhY2hlR2V0ID0gcmVxdWlyZSgnLi9fbWFwQ2FjaGVHZXQnKSxcbiAgICBtYXBDYWNoZUhhcyA9IHJlcXVpcmUoJy4vX21hcENhY2hlSGFzJyksXG4gICAgbWFwQ2FjaGVTZXQgPSByZXF1aXJlKCcuL19tYXBDYWNoZVNldCcpO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBtYXAgY2FjaGUgb2JqZWN0IHRvIHN0b3JlIGtleS12YWx1ZSBwYWlycy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge0FycmF5fSBbZW50cmllc10gVGhlIGtleS12YWx1ZSBwYWlycyB0byBjYWNoZS5cbiAqL1xuZnVuY3Rpb24gTWFwQ2FjaGUoZW50cmllcykge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IGVudHJpZXMgPT0gbnVsbCA/IDAgOiBlbnRyaWVzLmxlbmd0aDtcblxuICB0aGlzLmNsZWFyKCk7XG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgdmFyIGVudHJ5ID0gZW50cmllc1tpbmRleF07XG4gICAgdGhpcy5zZXQoZW50cnlbMF0sIGVudHJ5WzFdKTtcbiAgfVxufVxuXG4vLyBBZGQgbWV0aG9kcyB0byBgTWFwQ2FjaGVgLlxuTWFwQ2FjaGUucHJvdG90eXBlLmNsZWFyID0gbWFwQ2FjaGVDbGVhcjtcbk1hcENhY2hlLnByb3RvdHlwZVsnZGVsZXRlJ10gPSBtYXBDYWNoZURlbGV0ZTtcbk1hcENhY2hlLnByb3RvdHlwZS5nZXQgPSBtYXBDYWNoZUdldDtcbk1hcENhY2hlLnByb3RvdHlwZS5oYXMgPSBtYXBDYWNoZUhhcztcbk1hcENhY2hlLnByb3RvdHlwZS5zZXQgPSBtYXBDYWNoZVNldDtcblxubW9kdWxlLmV4cG9ydHMgPSBNYXBDYWNoZTtcbiIsInZhciBMaXN0Q2FjaGUgPSByZXF1aXJlKCcuL19MaXN0Q2FjaGUnKSxcbiAgICBNYXAgPSByZXF1aXJlKCcuL19NYXAnKSxcbiAgICBNYXBDYWNoZSA9IHJlcXVpcmUoJy4vX01hcENhY2hlJyk7XG5cbi8qKiBVc2VkIGFzIHRoZSBzaXplIHRvIGVuYWJsZSBsYXJnZSBhcnJheSBvcHRpbWl6YXRpb25zLiAqL1xudmFyIExBUkdFX0FSUkFZX1NJWkUgPSAyMDA7XG5cbi8qKlxuICogU2V0cyB0aGUgc3RhY2sgYGtleWAgdG8gYHZhbHVlYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgc2V0XG4gKiBAbWVtYmVyT2YgU3RhY2tcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gc2V0LlxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gc2V0LlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgc3RhY2sgY2FjaGUgaW5zdGFuY2UuXG4gKi9cbmZ1bmN0aW9uIHN0YWNrU2V0KGtleSwgdmFsdWUpIHtcbiAgdmFyIGRhdGEgPSB0aGlzLl9fZGF0YV9fO1xuICBpZiAoZGF0YSBpbnN0YW5jZW9mIExpc3RDYWNoZSkge1xuICAgIHZhciBwYWlycyA9IGRhdGEuX19kYXRhX187XG4gICAgaWYgKCFNYXAgfHwgKHBhaXJzLmxlbmd0aCA8IExBUkdFX0FSUkFZX1NJWkUgLSAxKSkge1xuICAgICAgcGFpcnMucHVzaChba2V5LCB2YWx1ZV0pO1xuICAgICAgdGhpcy5zaXplID0gKytkYXRhLnNpemU7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgZGF0YSA9IHRoaXMuX19kYXRhX18gPSBuZXcgTWFwQ2FjaGUocGFpcnMpO1xuICB9XG4gIGRhdGEuc2V0KGtleSwgdmFsdWUpO1xuICB0aGlzLnNpemUgPSBkYXRhLnNpemU7XG4gIHJldHVybiB0aGlzO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHN0YWNrU2V0O1xuIiwidmFyIExpc3RDYWNoZSA9IHJlcXVpcmUoJy4vX0xpc3RDYWNoZScpLFxuICAgIHN0YWNrQ2xlYXIgPSByZXF1aXJlKCcuL19zdGFja0NsZWFyJyksXG4gICAgc3RhY2tEZWxldGUgPSByZXF1aXJlKCcuL19zdGFja0RlbGV0ZScpLFxuICAgIHN0YWNrR2V0ID0gcmVxdWlyZSgnLi9fc3RhY2tHZXQnKSxcbiAgICBzdGFja0hhcyA9IHJlcXVpcmUoJy4vX3N0YWNrSGFzJyksXG4gICAgc3RhY2tTZXQgPSByZXF1aXJlKCcuL19zdGFja1NldCcpO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBzdGFjayBjYWNoZSBvYmplY3QgdG8gc3RvcmUga2V5LXZhbHVlIHBhaXJzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7QXJyYXl9IFtlbnRyaWVzXSBUaGUga2V5LXZhbHVlIHBhaXJzIHRvIGNhY2hlLlxuICovXG5mdW5jdGlvbiBTdGFjayhlbnRyaWVzKSB7XG4gIHZhciBkYXRhID0gdGhpcy5fX2RhdGFfXyA9IG5ldyBMaXN0Q2FjaGUoZW50cmllcyk7XG4gIHRoaXMuc2l6ZSA9IGRhdGEuc2l6ZTtcbn1cblxuLy8gQWRkIG1ldGhvZHMgdG8gYFN0YWNrYC5cblN0YWNrLnByb3RvdHlwZS5jbGVhciA9IHN0YWNrQ2xlYXI7XG5TdGFjay5wcm90b3R5cGVbJ2RlbGV0ZSddID0gc3RhY2tEZWxldGU7XG5TdGFjay5wcm90b3R5cGUuZ2V0ID0gc3RhY2tHZXQ7XG5TdGFjay5wcm90b3R5cGUuaGFzID0gc3RhY2tIYXM7XG5TdGFjay5wcm90b3R5cGUuc2V0ID0gc3RhY2tTZXQ7XG5cbm1vZHVsZS5leHBvcnRzID0gU3RhY2s7XG4iLCJ2YXIgZ2V0TmF0aXZlID0gcmVxdWlyZSgnLi9fZ2V0TmF0aXZlJyk7XG5cbnZhciBkZWZpbmVQcm9wZXJ0eSA9IChmdW5jdGlvbigpIHtcbiAgdHJ5IHtcbiAgICB2YXIgZnVuYyA9IGdldE5hdGl2ZShPYmplY3QsICdkZWZpbmVQcm9wZXJ0eScpO1xuICAgIGZ1bmMoe30sICcnLCB7fSk7XG4gICAgcmV0dXJuIGZ1bmM7XG4gIH0gY2F0Y2ggKGUpIHt9XG59KCkpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRlZmluZVByb3BlcnR5O1xuIiwidmFyIGRlZmluZVByb3BlcnR5ID0gcmVxdWlyZSgnLi9fZGVmaW5lUHJvcGVydHknKTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgYXNzaWduVmFsdWVgIGFuZCBgYXNzaWduTWVyZ2VWYWx1ZWAgd2l0aG91dFxuICogdmFsdWUgY2hlY2tzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gbW9kaWZ5LlxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBwcm9wZXJ0eSB0byBhc3NpZ24uXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBhc3NpZ24uXG4gKi9cbmZ1bmN0aW9uIGJhc2VBc3NpZ25WYWx1ZShvYmplY3QsIGtleSwgdmFsdWUpIHtcbiAgaWYgKGtleSA9PSAnX19wcm90b19fJyAmJiBkZWZpbmVQcm9wZXJ0eSkge1xuICAgIGRlZmluZVByb3BlcnR5KG9iamVjdCwga2V5LCB7XG4gICAgICAnY29uZmlndXJhYmxlJzogdHJ1ZSxcbiAgICAgICdlbnVtZXJhYmxlJzogdHJ1ZSxcbiAgICAgICd2YWx1ZSc6IHZhbHVlLFxuICAgICAgJ3dyaXRhYmxlJzogdHJ1ZVxuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIG9iamVjdFtrZXldID0gdmFsdWU7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlQXNzaWduVmFsdWU7XG4iLCJ2YXIgYmFzZUFzc2lnblZhbHVlID0gcmVxdWlyZSgnLi9fYmFzZUFzc2lnblZhbHVlJyksXG4gICAgZXEgPSByZXF1aXJlKCcuL2VxJyk7XG5cbi8qKlxuICogVGhpcyBmdW5jdGlvbiBpcyBsaWtlIGBhc3NpZ25WYWx1ZWAgZXhjZXB0IHRoYXQgaXQgZG9lc24ndCBhc3NpZ25cbiAqIGB1bmRlZmluZWRgIHZhbHVlcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIG1vZGlmeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgcHJvcGVydHkgdG8gYXNzaWduLlxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gYXNzaWduLlxuICovXG5mdW5jdGlvbiBhc3NpZ25NZXJnZVZhbHVlKG9iamVjdCwga2V5LCB2YWx1ZSkge1xuICBpZiAoKHZhbHVlICE9PSB1bmRlZmluZWQgJiYgIWVxKG9iamVjdFtrZXldLCB2YWx1ZSkpIHx8XG4gICAgICAodmFsdWUgPT09IHVuZGVmaW5lZCAmJiAhKGtleSBpbiBvYmplY3QpKSkge1xuICAgIGJhc2VBc3NpZ25WYWx1ZShvYmplY3QsIGtleSwgdmFsdWUpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYXNzaWduTWVyZ2VWYWx1ZTtcbiIsIi8qKlxuICogQ3JlYXRlcyBhIGJhc2UgZnVuY3Rpb24gZm9yIG1ldGhvZHMgbGlrZSBgXy5mb3JJbmAgYW5kIGBfLmZvck93bmAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2Zyb21SaWdodF0gU3BlY2lmeSBpdGVyYXRpbmcgZnJvbSByaWdodCB0byBsZWZ0LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgYmFzZSBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlQmFzZUZvcihmcm9tUmlnaHQpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKG9iamVjdCwgaXRlcmF0ZWUsIGtleXNGdW5jKSB7XG4gICAgdmFyIGluZGV4ID0gLTEsXG4gICAgICAgIGl0ZXJhYmxlID0gT2JqZWN0KG9iamVjdCksXG4gICAgICAgIHByb3BzID0ga2V5c0Z1bmMob2JqZWN0KSxcbiAgICAgICAgbGVuZ3RoID0gcHJvcHMubGVuZ3RoO1xuXG4gICAgd2hpbGUgKGxlbmd0aC0tKSB7XG4gICAgICB2YXIga2V5ID0gcHJvcHNbZnJvbVJpZ2h0ID8gbGVuZ3RoIDogKytpbmRleF07XG4gICAgICBpZiAoaXRlcmF0ZWUoaXRlcmFibGVba2V5XSwga2V5LCBpdGVyYWJsZSkgPT09IGZhbHNlKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb2JqZWN0O1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZUJhc2VGb3I7XG4iLCJ2YXIgY3JlYXRlQmFzZUZvciA9IHJlcXVpcmUoJy4vX2NyZWF0ZUJhc2VGb3InKTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgYmFzZUZvck93bmAgd2hpY2ggaXRlcmF0ZXMgb3ZlciBgb2JqZWN0YFxuICogcHJvcGVydGllcyByZXR1cm5lZCBieSBga2V5c0Z1bmNgIGFuZCBpbnZva2VzIGBpdGVyYXRlZWAgZm9yIGVhY2ggcHJvcGVydHkuXG4gKiBJdGVyYXRlZSBmdW5jdGlvbnMgbWF5IGV4aXQgaXRlcmF0aW9uIGVhcmx5IGJ5IGV4cGxpY2l0bHkgcmV0dXJuaW5nIGBmYWxzZWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBpdGVyYXRlIG92ZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRlZSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHBhcmFtIHtGdW5jdGlvbn0ga2V5c0Z1bmMgVGhlIGZ1bmN0aW9uIHRvIGdldCB0aGUga2V5cyBvZiBgb2JqZWN0YC5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgYG9iamVjdGAuXG4gKi9cbnZhciBiYXNlRm9yID0gY3JlYXRlQmFzZUZvcigpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VGb3I7XG4iLCJ2YXIgcm9vdCA9IHJlcXVpcmUoJy4vX3Jvb3QnKTtcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBleHBvcnRzYC4gKi9cbnZhciBmcmVlRXhwb3J0cyA9IHR5cGVvZiBleHBvcnRzID09ICdvYmplY3QnICYmIGV4cG9ydHMgJiYgIWV4cG9ydHMubm9kZVR5cGUgJiYgZXhwb3J0cztcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBtb2R1bGVgLiAqL1xudmFyIGZyZWVNb2R1bGUgPSBmcmVlRXhwb3J0cyAmJiB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZSAmJiAhbW9kdWxlLm5vZGVUeXBlICYmIG1vZHVsZTtcblxuLyoqIERldGVjdCB0aGUgcG9wdWxhciBDb21tb25KUyBleHRlbnNpb24gYG1vZHVsZS5leHBvcnRzYC4gKi9cbnZhciBtb2R1bGVFeHBvcnRzID0gZnJlZU1vZHVsZSAmJiBmcmVlTW9kdWxlLmV4cG9ydHMgPT09IGZyZWVFeHBvcnRzO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBCdWZmZXIgPSBtb2R1bGVFeHBvcnRzID8gcm9vdC5CdWZmZXIgOiB1bmRlZmluZWQsXG4gICAgYWxsb2NVbnNhZmUgPSBCdWZmZXIgPyBCdWZmZXIuYWxsb2NVbnNhZmUgOiB1bmRlZmluZWQ7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGNsb25lIG9mICBgYnVmZmVyYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtCdWZmZXJ9IGJ1ZmZlciBUaGUgYnVmZmVyIHRvIGNsb25lLlxuICogQHBhcmFtIHtib29sZWFufSBbaXNEZWVwXSBTcGVjaWZ5IGEgZGVlcCBjbG9uZS5cbiAqIEByZXR1cm5zIHtCdWZmZXJ9IFJldHVybnMgdGhlIGNsb25lZCBidWZmZXIuXG4gKi9cbmZ1bmN0aW9uIGNsb25lQnVmZmVyKGJ1ZmZlciwgaXNEZWVwKSB7XG4gIGlmIChpc0RlZXApIHtcbiAgICByZXR1cm4gYnVmZmVyLnNsaWNlKCk7XG4gIH1cbiAgdmFyIGxlbmd0aCA9IGJ1ZmZlci5sZW5ndGgsXG4gICAgICByZXN1bHQgPSBhbGxvY1Vuc2FmZSA/IGFsbG9jVW5zYWZlKGxlbmd0aCkgOiBuZXcgYnVmZmVyLmNvbnN0cnVjdG9yKGxlbmd0aCk7XG5cbiAgYnVmZmVyLmNvcHkocmVzdWx0KTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjbG9uZUJ1ZmZlcjtcbiIsInZhciByb290ID0gcmVxdWlyZSgnLi9fcm9vdCcpO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBVaW50OEFycmF5ID0gcm9vdC5VaW50OEFycmF5O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFVpbnQ4QXJyYXk7XG4iLCJ2YXIgVWludDhBcnJheSA9IHJlcXVpcmUoJy4vX1VpbnQ4QXJyYXknKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgY2xvbmUgb2YgYGFycmF5QnVmZmVyYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheUJ1ZmZlcn0gYXJyYXlCdWZmZXIgVGhlIGFycmF5IGJ1ZmZlciB0byBjbG9uZS5cbiAqIEByZXR1cm5zIHtBcnJheUJ1ZmZlcn0gUmV0dXJucyB0aGUgY2xvbmVkIGFycmF5IGJ1ZmZlci5cbiAqL1xuZnVuY3Rpb24gY2xvbmVBcnJheUJ1ZmZlcihhcnJheUJ1ZmZlcikge1xuICB2YXIgcmVzdWx0ID0gbmV3IGFycmF5QnVmZmVyLmNvbnN0cnVjdG9yKGFycmF5QnVmZmVyLmJ5dGVMZW5ndGgpO1xuICBuZXcgVWludDhBcnJheShyZXN1bHQpLnNldChuZXcgVWludDhBcnJheShhcnJheUJ1ZmZlcikpO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsb25lQXJyYXlCdWZmZXI7XG4iLCJ2YXIgY2xvbmVBcnJheUJ1ZmZlciA9IHJlcXVpcmUoJy4vX2Nsb25lQXJyYXlCdWZmZXInKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgY2xvbmUgb2YgYHR5cGVkQXJyYXlgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gdHlwZWRBcnJheSBUaGUgdHlwZWQgYXJyYXkgdG8gY2xvbmUuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtpc0RlZXBdIFNwZWNpZnkgYSBkZWVwIGNsb25lLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgY2xvbmVkIHR5cGVkIGFycmF5LlxuICovXG5mdW5jdGlvbiBjbG9uZVR5cGVkQXJyYXkodHlwZWRBcnJheSwgaXNEZWVwKSB7XG4gIHZhciBidWZmZXIgPSBpc0RlZXAgPyBjbG9uZUFycmF5QnVmZmVyKHR5cGVkQXJyYXkuYnVmZmVyKSA6IHR5cGVkQXJyYXkuYnVmZmVyO1xuICByZXR1cm4gbmV3IHR5cGVkQXJyYXkuY29uc3RydWN0b3IoYnVmZmVyLCB0eXBlZEFycmF5LmJ5dGVPZmZzZXQsIHR5cGVkQXJyYXkubGVuZ3RoKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjbG9uZVR5cGVkQXJyYXk7XG4iLCIvKipcbiAqIENvcGllcyB0aGUgdmFsdWVzIG9mIGBzb3VyY2VgIHRvIGBhcnJheWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl9IHNvdXJjZSBUaGUgYXJyYXkgdG8gY29weSB2YWx1ZXMgZnJvbS5cbiAqIEBwYXJhbSB7QXJyYXl9IFthcnJheT1bXV0gVGhlIGFycmF5IHRvIGNvcHkgdmFsdWVzIHRvLlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIGBhcnJheWAuXG4gKi9cbmZ1bmN0aW9uIGNvcHlBcnJheShzb3VyY2UsIGFycmF5KSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gc291cmNlLmxlbmd0aDtcblxuICBhcnJheSB8fCAoYXJyYXkgPSBBcnJheShsZW5ndGgpKTtcbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICBhcnJheVtpbmRleF0gPSBzb3VyY2VbaW5kZXhdO1xuICB9XG4gIHJldHVybiBhcnJheTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjb3B5QXJyYXk7XG4iLCJ2YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuL2lzT2JqZWN0Jyk7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdENyZWF0ZSA9IE9iamVjdC5jcmVhdGU7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uY3JlYXRlYCB3aXRob3V0IHN1cHBvcnQgZm9yIGFzc2lnbmluZ1xuICogcHJvcGVydGllcyB0byB0aGUgY3JlYXRlZCBvYmplY3QuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBwcm90byBUaGUgb2JqZWN0IHRvIGluaGVyaXQgZnJvbS5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIG5ldyBvYmplY3QuXG4gKi9cbnZhciBiYXNlQ3JlYXRlID0gKGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBvYmplY3QoKSB7fVxuICByZXR1cm4gZnVuY3Rpb24ocHJvdG8pIHtcbiAgICBpZiAoIWlzT2JqZWN0KHByb3RvKSkge1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cbiAgICBpZiAob2JqZWN0Q3JlYXRlKSB7XG4gICAgICByZXR1cm4gb2JqZWN0Q3JlYXRlKHByb3RvKTtcbiAgICB9XG4gICAgb2JqZWN0LnByb3RvdHlwZSA9IHByb3RvO1xuICAgIHZhciByZXN1bHQgPSBuZXcgb2JqZWN0O1xuICAgIG9iamVjdC5wcm90b3R5cGUgPSB1bmRlZmluZWQ7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcbn0oKSk7XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUNyZWF0ZTtcbiIsIi8qKlxuICogQ3JlYXRlcyBhIHVuYXJ5IGZ1bmN0aW9uIHRoYXQgaW52b2tlcyBgZnVuY2Agd2l0aCBpdHMgYXJndW1lbnQgdHJhbnNmb3JtZWQuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIHdyYXAuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSB0cmFuc2Zvcm0gVGhlIGFyZ3VtZW50IHRyYW5zZm9ybS5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBvdmVyQXJnKGZ1bmMsIHRyYW5zZm9ybSkge1xuICByZXR1cm4gZnVuY3Rpb24oYXJnKSB7XG4gICAgcmV0dXJuIGZ1bmModHJhbnNmb3JtKGFyZykpO1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG92ZXJBcmc7XG4iLCJ2YXIgb3ZlckFyZyA9IHJlcXVpcmUoJy4vX292ZXJBcmcnKTtcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgZ2V0UHJvdG90eXBlID0gb3ZlckFyZyhPYmplY3QuZ2V0UHJvdG90eXBlT2YsIE9iamVjdCk7XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0UHJvdG90eXBlO1xuIiwiLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBsaWtlbHkgYSBwcm90b3R5cGUgb2JqZWN0LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgcHJvdG90eXBlLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGlzUHJvdG90eXBlKHZhbHVlKSB7XG4gIHZhciBDdG9yID0gdmFsdWUgJiYgdmFsdWUuY29uc3RydWN0b3IsXG4gICAgICBwcm90byA9ICh0eXBlb2YgQ3RvciA9PSAnZnVuY3Rpb24nICYmIEN0b3IucHJvdG90eXBlKSB8fCBvYmplY3RQcm90bztcblxuICByZXR1cm4gdmFsdWUgPT09IHByb3RvO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzUHJvdG90eXBlO1xuIiwidmFyIGJhc2VDcmVhdGUgPSByZXF1aXJlKCcuL19iYXNlQ3JlYXRlJyksXG4gICAgZ2V0UHJvdG90eXBlID0gcmVxdWlyZSgnLi9fZ2V0UHJvdG90eXBlJyksXG4gICAgaXNQcm90b3R5cGUgPSByZXF1aXJlKCcuL19pc1Byb3RvdHlwZScpO1xuXG4vKipcbiAqIEluaXRpYWxpemVzIGFuIG9iamVjdCBjbG9uZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIGNsb25lLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgaW5pdGlhbGl6ZWQgY2xvbmUuXG4gKi9cbmZ1bmN0aW9uIGluaXRDbG9uZU9iamVjdChvYmplY3QpIHtcbiAgcmV0dXJuICh0eXBlb2Ygb2JqZWN0LmNvbnN0cnVjdG9yID09ICdmdW5jdGlvbicgJiYgIWlzUHJvdG90eXBlKG9iamVjdCkpXG4gICAgPyBiYXNlQ3JlYXRlKGdldFByb3RvdHlwZShvYmplY3QpKVxuICAgIDoge307XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaW5pdENsb25lT2JqZWN0O1xuIiwiLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZS4gQSB2YWx1ZSBpcyBvYmplY3QtbGlrZSBpZiBpdCdzIG5vdCBgbnVsbGBcbiAqIGFuZCBoYXMgYSBgdHlwZW9mYCByZXN1bHQgb2YgXCJvYmplY3RcIi5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZSwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZSh7fSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdExpa2UoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShfLm5vb3ApO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShudWxsKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0TGlrZSh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgIT0gbnVsbCAmJiB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCc7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNPYmplY3RMaWtlO1xuIiwidmFyIGJhc2VHZXRUYWcgPSByZXF1aXJlKCcuL19iYXNlR2V0VGFnJyksXG4gICAgaXNPYmplY3RMaWtlID0gcmVxdWlyZSgnLi9pc09iamVjdExpa2UnKTtcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIGFyZ3NUYWcgPSAnW29iamVjdCBBcmd1bWVudHNdJztcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5pc0FyZ3VtZW50c2AuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYW4gYGFyZ3VtZW50c2Agb2JqZWN0LFxuICovXG5mdW5jdGlvbiBiYXNlSXNBcmd1bWVudHModmFsdWUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0TGlrZSh2YWx1ZSkgJiYgYmFzZUdldFRhZyh2YWx1ZSkgPT0gYXJnc1RhZztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlSXNBcmd1bWVudHM7XG4iLCJ2YXIgYmFzZUlzQXJndW1lbnRzID0gcmVxdWlyZSgnLi9fYmFzZUlzQXJndW1lbnRzJyksXG4gICAgaXNPYmplY3RMaWtlID0gcmVxdWlyZSgnLi9pc09iamVjdExpa2UnKTtcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgcHJvcGVydHlJc0VudW1lcmFibGUgPSBvYmplY3RQcm90by5wcm9wZXJ0eUlzRW51bWVyYWJsZTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBsaWtlbHkgYW4gYGFyZ3VtZW50c2Agb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFuIGBhcmd1bWVudHNgIG9iamVjdCxcbiAqICBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNBcmd1bWVudHMoZnVuY3Rpb24oKSB7IHJldHVybiBhcmd1bWVudHM7IH0oKSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0FyZ3VtZW50cyhbMSwgMiwgM10pO1xuICogLy8gPT4gZmFsc2VcbiAqL1xudmFyIGlzQXJndW1lbnRzID0gYmFzZUlzQXJndW1lbnRzKGZ1bmN0aW9uKCkgeyByZXR1cm4gYXJndW1lbnRzOyB9KCkpID8gYmFzZUlzQXJndW1lbnRzIDogZnVuY3Rpb24odmFsdWUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0TGlrZSh2YWx1ZSkgJiYgaGFzT3duUHJvcGVydHkuY2FsbCh2YWx1ZSwgJ2NhbGxlZScpICYmXG4gICAgIXByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwodmFsdWUsICdjYWxsZWUnKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gaXNBcmd1bWVudHM7XG4iLCIvKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYW4gYEFycmF5YCBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYW4gYXJyYXksIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0FycmF5KFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0FycmF5KGRvY3VtZW50LmJvZHkuY2hpbGRyZW4pO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzQXJyYXkoJ2FiYycpO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzQXJyYXkoXy5ub29wKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheTtcblxubW9kdWxlLmV4cG9ydHMgPSBpc0FycmF5O1xuIiwiLyoqIFVzZWQgYXMgcmVmZXJlbmNlcyBmb3IgdmFyaW91cyBgTnVtYmVyYCBjb25zdGFudHMuICovXG52YXIgTUFYX1NBRkVfSU5URUdFUiA9IDkwMDcxOTkyNTQ3NDA5OTE7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSB2YWxpZCBhcnJheS1saWtlIGxlbmd0aC5cbiAqXG4gKiAqKk5vdGU6KiogVGhpcyBtZXRob2QgaXMgbG9vc2VseSBiYXNlZCBvblxuICogW2BUb0xlbmd0aGBdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLXRvbGVuZ3RoKS5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHZhbGlkIGxlbmd0aCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzTGVuZ3RoKDMpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNMZW5ndGgoTnVtYmVyLk1JTl9WQUxVRSk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNMZW5ndGgoSW5maW5pdHkpO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzTGVuZ3RoKCczJyk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0xlbmd0aCh2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09ICdudW1iZXInICYmXG4gICAgdmFsdWUgPiAtMSAmJiB2YWx1ZSAlIDEgPT0gMCAmJiB2YWx1ZSA8PSBNQVhfU0FGRV9JTlRFR0VSO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzTGVuZ3RoO1xuIiwidmFyIGlzRnVuY3Rpb24gPSByZXF1aXJlKCcuL2lzRnVuY3Rpb24nKSxcbiAgICBpc0xlbmd0aCA9IHJlcXVpcmUoJy4vaXNMZW5ndGgnKTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhcnJheS1saWtlLiBBIHZhbHVlIGlzIGNvbnNpZGVyZWQgYXJyYXktbGlrZSBpZiBpdCdzXG4gKiBub3QgYSBmdW5jdGlvbiBhbmQgaGFzIGEgYHZhbHVlLmxlbmd0aGAgdGhhdCdzIGFuIGludGVnZXIgZ3JlYXRlciB0aGFuIG9yXG4gKiBlcXVhbCB0byBgMGAgYW5kIGxlc3MgdGhhbiBvciBlcXVhbCB0byBgTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVJgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFycmF5LWxpa2UsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0FycmF5TGlrZShbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcnJheUxpa2UoZG9jdW1lbnQuYm9keS5jaGlsZHJlbik7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0FycmF5TGlrZSgnYWJjJyk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0FycmF5TGlrZShfLm5vb3ApO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheUxpa2UodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlICE9IG51bGwgJiYgaXNMZW5ndGgodmFsdWUubGVuZ3RoKSAmJiAhaXNGdW5jdGlvbih2YWx1ZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNBcnJheUxpa2U7XG4iLCJ2YXIgaXNBcnJheUxpa2UgPSByZXF1aXJlKCcuL2lzQXJyYXlMaWtlJyksXG4gICAgaXNPYmplY3RMaWtlID0gcmVxdWlyZSgnLi9pc09iamVjdExpa2UnKTtcblxuLyoqXG4gKiBUaGlzIG1ldGhvZCBpcyBsaWtlIGBfLmlzQXJyYXlMaWtlYCBleGNlcHQgdGhhdCBpdCBhbHNvIGNoZWNrcyBpZiBgdmFsdWVgXG4gKiBpcyBhbiBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYW4gYXJyYXktbGlrZSBvYmplY3QsXG4gKiAgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzQXJyYXlMaWtlT2JqZWN0KFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0FycmF5TGlrZU9iamVjdChkb2N1bWVudC5ib2R5LmNoaWxkcmVuKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQXJyYXlMaWtlT2JqZWN0KCdhYmMnKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc0FycmF5TGlrZU9iamVjdChfLm5vb3ApO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheUxpa2VPYmplY3QodmFsdWUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0TGlrZSh2YWx1ZSkgJiYgaXNBcnJheUxpa2UodmFsdWUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzQXJyYXlMaWtlT2JqZWN0O1xuIiwiLyoqXG4gKiBUaGlzIG1ldGhvZCByZXR1cm5zIGBmYWxzZWAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjEzLjBcbiAqIEBjYXRlZ29yeSBVdGlsXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLnRpbWVzKDIsIF8uc3R1YkZhbHNlKTtcbiAqIC8vID0+IFtmYWxzZSwgZmFsc2VdXG4gKi9cbmZ1bmN0aW9uIHN0dWJGYWxzZSgpIHtcbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHN0dWJGYWxzZTtcbiIsInZhciByb290ID0gcmVxdWlyZSgnLi9fcm9vdCcpLFxuICAgIHN0dWJGYWxzZSA9IHJlcXVpcmUoJy4vc3R1YkZhbHNlJyk7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgZXhwb3J0c2AuICovXG52YXIgZnJlZUV4cG9ydHMgPSB0eXBlb2YgZXhwb3J0cyA9PSAnb2JqZWN0JyAmJiBleHBvcnRzICYmICFleHBvcnRzLm5vZGVUeXBlICYmIGV4cG9ydHM7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgbW9kdWxlYC4gKi9cbnZhciBmcmVlTW9kdWxlID0gZnJlZUV4cG9ydHMgJiYgdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUgJiYgIW1vZHVsZS5ub2RlVHlwZSAmJiBtb2R1bGU7XG5cbi8qKiBEZXRlY3QgdGhlIHBvcHVsYXIgQ29tbW9uSlMgZXh0ZW5zaW9uIGBtb2R1bGUuZXhwb3J0c2AuICovXG52YXIgbW9kdWxlRXhwb3J0cyA9IGZyZWVNb2R1bGUgJiYgZnJlZU1vZHVsZS5leHBvcnRzID09PSBmcmVlRXhwb3J0cztcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgQnVmZmVyID0gbW9kdWxlRXhwb3J0cyA/IHJvb3QuQnVmZmVyIDogdW5kZWZpbmVkO1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyBmb3IgdGhvc2Ugd2l0aCB0aGUgc2FtZSBuYW1lIGFzIG90aGVyIGBsb2Rhc2hgIG1ldGhvZHMuICovXG52YXIgbmF0aXZlSXNCdWZmZXIgPSBCdWZmZXIgPyBCdWZmZXIuaXNCdWZmZXIgOiB1bmRlZmluZWQ7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSBidWZmZXIuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjMuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBidWZmZXIsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0J1ZmZlcihuZXcgQnVmZmVyKDIpKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQnVmZmVyKG5ldyBVaW50OEFycmF5KDIpKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbnZhciBpc0J1ZmZlciA9IG5hdGl2ZUlzQnVmZmVyIHx8IHN0dWJGYWxzZTtcblxubW9kdWxlLmV4cG9ydHMgPSBpc0J1ZmZlcjtcbiIsInZhciBiYXNlR2V0VGFnID0gcmVxdWlyZSgnLi9fYmFzZUdldFRhZycpLFxuICAgIGdldFByb3RvdHlwZSA9IHJlcXVpcmUoJy4vX2dldFByb3RvdHlwZScpLFxuICAgIGlzT2JqZWN0TGlrZSA9IHJlcXVpcmUoJy4vaXNPYmplY3RMaWtlJyk7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RUYWcgPSAnW29iamVjdCBPYmplY3RdJztcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIGZ1bmNQcm90byA9IEZ1bmN0aW9uLnByb3RvdHlwZSxcbiAgICBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIHJlc29sdmUgdGhlIGRlY29tcGlsZWQgc291cmNlIG9mIGZ1bmN0aW9ucy4gKi9cbnZhciBmdW5jVG9TdHJpbmcgPSBmdW5jUHJvdG8udG9TdHJpbmc7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKiBVc2VkIHRvIGluZmVyIHRoZSBgT2JqZWN0YCBjb25zdHJ1Y3Rvci4gKi9cbnZhciBvYmplY3RDdG9yU3RyaW5nID0gZnVuY1RvU3RyaW5nLmNhbGwoT2JqZWN0KTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIHBsYWluIG9iamVjdCwgdGhhdCBpcywgYW4gb2JqZWN0IGNyZWF0ZWQgYnkgdGhlXG4gKiBgT2JqZWN0YCBjb25zdHJ1Y3RvciBvciBvbmUgd2l0aCBhIGBbW1Byb3RvdHlwZV1dYCBvZiBgbnVsbGAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjguMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBwbGFpbiBvYmplY3QsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogZnVuY3Rpb24gRm9vKCkge1xuICogICB0aGlzLmEgPSAxO1xuICogfVxuICpcbiAqIF8uaXNQbGFpbk9iamVjdChuZXcgRm9vKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc1BsYWluT2JqZWN0KFsxLCAyLCAzXSk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNQbGFpbk9iamVjdCh7ICd4JzogMCwgJ3knOiAwIH0pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNQbGFpbk9iamVjdChPYmplY3QuY3JlYXRlKG51bGwpKTtcbiAqIC8vID0+IHRydWVcbiAqL1xuZnVuY3Rpb24gaXNQbGFpbk9iamVjdCh2YWx1ZSkge1xuICBpZiAoIWlzT2JqZWN0TGlrZSh2YWx1ZSkgfHwgYmFzZUdldFRhZyh2YWx1ZSkgIT0gb2JqZWN0VGFnKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciBwcm90byA9IGdldFByb3RvdHlwZSh2YWx1ZSk7XG4gIGlmIChwcm90byA9PT0gbnVsbCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHZhciBDdG9yID0gaGFzT3duUHJvcGVydHkuY2FsbChwcm90bywgJ2NvbnN0cnVjdG9yJykgJiYgcHJvdG8uY29uc3RydWN0b3I7XG4gIHJldHVybiB0eXBlb2YgQ3RvciA9PSAnZnVuY3Rpb24nICYmIEN0b3IgaW5zdGFuY2VvZiBDdG9yICYmXG4gICAgZnVuY1RvU3RyaW5nLmNhbGwoQ3RvcikgPT0gb2JqZWN0Q3RvclN0cmluZztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc1BsYWluT2JqZWN0O1xuIiwidmFyIGJhc2VHZXRUYWcgPSByZXF1aXJlKCcuL19iYXNlR2V0VGFnJyksXG4gICAgaXNMZW5ndGggPSByZXF1aXJlKCcuL2lzTGVuZ3RoJyksXG4gICAgaXNPYmplY3RMaWtlID0gcmVxdWlyZSgnLi9pc09iamVjdExpa2UnKTtcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIGFyZ3NUYWcgPSAnW29iamVjdCBBcmd1bWVudHNdJyxcbiAgICBhcnJheVRhZyA9ICdbb2JqZWN0IEFycmF5XScsXG4gICAgYm9vbFRhZyA9ICdbb2JqZWN0IEJvb2xlYW5dJyxcbiAgICBkYXRlVGFnID0gJ1tvYmplY3QgRGF0ZV0nLFxuICAgIGVycm9yVGFnID0gJ1tvYmplY3QgRXJyb3JdJyxcbiAgICBmdW5jVGFnID0gJ1tvYmplY3QgRnVuY3Rpb25dJyxcbiAgICBtYXBUYWcgPSAnW29iamVjdCBNYXBdJyxcbiAgICBudW1iZXJUYWcgPSAnW29iamVjdCBOdW1iZXJdJyxcbiAgICBvYmplY3RUYWcgPSAnW29iamVjdCBPYmplY3RdJyxcbiAgICByZWdleHBUYWcgPSAnW29iamVjdCBSZWdFeHBdJyxcbiAgICBzZXRUYWcgPSAnW29iamVjdCBTZXRdJyxcbiAgICBzdHJpbmdUYWcgPSAnW29iamVjdCBTdHJpbmddJyxcbiAgICB3ZWFrTWFwVGFnID0gJ1tvYmplY3QgV2Vha01hcF0nO1xuXG52YXIgYXJyYXlCdWZmZXJUYWcgPSAnW29iamVjdCBBcnJheUJ1ZmZlcl0nLFxuICAgIGRhdGFWaWV3VGFnID0gJ1tvYmplY3QgRGF0YVZpZXddJyxcbiAgICBmbG9hdDMyVGFnID0gJ1tvYmplY3QgRmxvYXQzMkFycmF5XScsXG4gICAgZmxvYXQ2NFRhZyA9ICdbb2JqZWN0IEZsb2F0NjRBcnJheV0nLFxuICAgIGludDhUYWcgPSAnW29iamVjdCBJbnQ4QXJyYXldJyxcbiAgICBpbnQxNlRhZyA9ICdbb2JqZWN0IEludDE2QXJyYXldJyxcbiAgICBpbnQzMlRhZyA9ICdbb2JqZWN0IEludDMyQXJyYXldJyxcbiAgICB1aW50OFRhZyA9ICdbb2JqZWN0IFVpbnQ4QXJyYXldJyxcbiAgICB1aW50OENsYW1wZWRUYWcgPSAnW29iamVjdCBVaW50OENsYW1wZWRBcnJheV0nLFxuICAgIHVpbnQxNlRhZyA9ICdbb2JqZWN0IFVpbnQxNkFycmF5XScsXG4gICAgdWludDMyVGFnID0gJ1tvYmplY3QgVWludDMyQXJyYXldJztcblxuLyoqIFVzZWQgdG8gaWRlbnRpZnkgYHRvU3RyaW5nVGFnYCB2YWx1ZXMgb2YgdHlwZWQgYXJyYXlzLiAqL1xudmFyIHR5cGVkQXJyYXlUYWdzID0ge307XG50eXBlZEFycmF5VGFnc1tmbG9hdDMyVGFnXSA9IHR5cGVkQXJyYXlUYWdzW2Zsb2F0NjRUYWddID1cbnR5cGVkQXJyYXlUYWdzW2ludDhUYWddID0gdHlwZWRBcnJheVRhZ3NbaW50MTZUYWddID1cbnR5cGVkQXJyYXlUYWdzW2ludDMyVGFnXSA9IHR5cGVkQXJyYXlUYWdzW3VpbnQ4VGFnXSA9XG50eXBlZEFycmF5VGFnc1t1aW50OENsYW1wZWRUYWddID0gdHlwZWRBcnJheVRhZ3NbdWludDE2VGFnXSA9XG50eXBlZEFycmF5VGFnc1t1aW50MzJUYWddID0gdHJ1ZTtcbnR5cGVkQXJyYXlUYWdzW2FyZ3NUYWddID0gdHlwZWRBcnJheVRhZ3NbYXJyYXlUYWddID1cbnR5cGVkQXJyYXlUYWdzW2FycmF5QnVmZmVyVGFnXSA9IHR5cGVkQXJyYXlUYWdzW2Jvb2xUYWddID1cbnR5cGVkQXJyYXlUYWdzW2RhdGFWaWV3VGFnXSA9IHR5cGVkQXJyYXlUYWdzW2RhdGVUYWddID1cbnR5cGVkQXJyYXlUYWdzW2Vycm9yVGFnXSA9IHR5cGVkQXJyYXlUYWdzW2Z1bmNUYWddID1cbnR5cGVkQXJyYXlUYWdzW21hcFRhZ10gPSB0eXBlZEFycmF5VGFnc1tudW1iZXJUYWddID1cbnR5cGVkQXJyYXlUYWdzW29iamVjdFRhZ10gPSB0eXBlZEFycmF5VGFnc1tyZWdleHBUYWddID1cbnR5cGVkQXJyYXlUYWdzW3NldFRhZ10gPSB0eXBlZEFycmF5VGFnc1tzdHJpbmdUYWddID1cbnR5cGVkQXJyYXlUYWdzW3dlYWtNYXBUYWddID0gZmFsc2U7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uaXNUeXBlZEFycmF5YCB3aXRob3V0IE5vZGUuanMgb3B0aW1pemF0aW9ucy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHR5cGVkIGFycmF5LCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGJhc2VJc1R5cGVkQXJyYXkodmFsdWUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0TGlrZSh2YWx1ZSkgJiZcbiAgICBpc0xlbmd0aCh2YWx1ZS5sZW5ndGgpICYmICEhdHlwZWRBcnJheVRhZ3NbYmFzZUdldFRhZyh2YWx1ZSldO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VJc1R5cGVkQXJyYXk7XG4iLCIvKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLnVuYXJ5YCB3aXRob3V0IHN1cHBvcnQgZm9yIHN0b3JpbmcgbWV0YWRhdGEuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGNhcCBhcmd1bWVudHMgZm9yLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgY2FwcGVkIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBiYXNlVW5hcnkoZnVuYykge1xuICByZXR1cm4gZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gZnVuYyh2YWx1ZSk7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZVVuYXJ5O1xuIiwidmFyIGZyZWVHbG9iYWwgPSByZXF1aXJlKCcuL19mcmVlR2xvYmFsJyk7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgZXhwb3J0c2AuICovXG52YXIgZnJlZUV4cG9ydHMgPSB0eXBlb2YgZXhwb3J0cyA9PSAnb2JqZWN0JyAmJiBleHBvcnRzICYmICFleHBvcnRzLm5vZGVUeXBlICYmIGV4cG9ydHM7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgbW9kdWxlYC4gKi9cbnZhciBmcmVlTW9kdWxlID0gZnJlZUV4cG9ydHMgJiYgdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUgJiYgIW1vZHVsZS5ub2RlVHlwZSAmJiBtb2R1bGU7XG5cbi8qKiBEZXRlY3QgdGhlIHBvcHVsYXIgQ29tbW9uSlMgZXh0ZW5zaW9uIGBtb2R1bGUuZXhwb3J0c2AuICovXG52YXIgbW9kdWxlRXhwb3J0cyA9IGZyZWVNb2R1bGUgJiYgZnJlZU1vZHVsZS5leHBvcnRzID09PSBmcmVlRXhwb3J0cztcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBwcm9jZXNzYCBmcm9tIE5vZGUuanMuICovXG52YXIgZnJlZVByb2Nlc3MgPSBtb2R1bGVFeHBvcnRzICYmIGZyZWVHbG9iYWwucHJvY2VzcztcblxuLyoqIFVzZWQgdG8gYWNjZXNzIGZhc3RlciBOb2RlLmpzIGhlbHBlcnMuICovXG52YXIgbm9kZVV0aWwgPSAoZnVuY3Rpb24oKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGZyZWVQcm9jZXNzICYmIGZyZWVQcm9jZXNzLmJpbmRpbmcgJiYgZnJlZVByb2Nlc3MuYmluZGluZygndXRpbCcpO1xuICB9IGNhdGNoIChlKSB7fVxufSgpKTtcblxubW9kdWxlLmV4cG9ydHMgPSBub2RlVXRpbDtcbiIsInZhciBiYXNlSXNUeXBlZEFycmF5ID0gcmVxdWlyZSgnLi9fYmFzZUlzVHlwZWRBcnJheScpLFxuICAgIGJhc2VVbmFyeSA9IHJlcXVpcmUoJy4vX2Jhc2VVbmFyeScpLFxuICAgIG5vZGVVdGlsID0gcmVxdWlyZSgnLi9fbm9kZVV0aWwnKTtcblxuLyogTm9kZS5qcyBoZWxwZXIgcmVmZXJlbmNlcy4gKi9cbnZhciBub2RlSXNUeXBlZEFycmF5ID0gbm9kZVV0aWwgJiYgbm9kZVV0aWwuaXNUeXBlZEFycmF5O1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYSB0eXBlZCBhcnJheS5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDMuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHR5cGVkIGFycmF5LCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNUeXBlZEFycmF5KG5ldyBVaW50OEFycmF5KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzVHlwZWRBcnJheShbXSk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG52YXIgaXNUeXBlZEFycmF5ID0gbm9kZUlzVHlwZWRBcnJheSA/IGJhc2VVbmFyeShub2RlSXNUeXBlZEFycmF5KSA6IGJhc2VJc1R5cGVkQXJyYXk7XG5cbm1vZHVsZS5leHBvcnRzID0gaXNUeXBlZEFycmF5O1xuIiwidmFyIGJhc2VBc3NpZ25WYWx1ZSA9IHJlcXVpcmUoJy4vX2Jhc2VBc3NpZ25WYWx1ZScpLFxuICAgIGVxID0gcmVxdWlyZSgnLi9lcScpO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIEFzc2lnbnMgYHZhbHVlYCB0byBga2V5YCBvZiBgb2JqZWN0YCBpZiB0aGUgZXhpc3RpbmcgdmFsdWUgaXMgbm90IGVxdWl2YWxlbnRcbiAqIHVzaW5nIFtgU2FtZVZhbHVlWmVyb2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLXNhbWV2YWx1ZXplcm8pXG4gKiBmb3IgZXF1YWxpdHkgY29tcGFyaXNvbnMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBtb2RpZnkuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHByb3BlcnR5IHRvIGFzc2lnbi5cbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGFzc2lnbi5cbiAqL1xuZnVuY3Rpb24gYXNzaWduVmFsdWUob2JqZWN0LCBrZXksIHZhbHVlKSB7XG4gIHZhciBvYmpWYWx1ZSA9IG9iamVjdFtrZXldO1xuICBpZiAoIShoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwga2V5KSAmJiBlcShvYmpWYWx1ZSwgdmFsdWUpKSB8fFxuICAgICAgKHZhbHVlID09PSB1bmRlZmluZWQgJiYgIShrZXkgaW4gb2JqZWN0KSkpIHtcbiAgICBiYXNlQXNzaWduVmFsdWUob2JqZWN0LCBrZXksIHZhbHVlKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFzc2lnblZhbHVlO1xuIiwidmFyIGFzc2lnblZhbHVlID0gcmVxdWlyZSgnLi9fYXNzaWduVmFsdWUnKSxcbiAgICBiYXNlQXNzaWduVmFsdWUgPSByZXF1aXJlKCcuL19iYXNlQXNzaWduVmFsdWUnKTtcblxuLyoqXG4gKiBDb3BpZXMgcHJvcGVydGllcyBvZiBgc291cmNlYCB0byBgb2JqZWN0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IHNvdXJjZSBUaGUgb2JqZWN0IHRvIGNvcHkgcHJvcGVydGllcyBmcm9tLlxuICogQHBhcmFtIHtBcnJheX0gcHJvcHMgVGhlIHByb3BlcnR5IGlkZW50aWZpZXJzIHRvIGNvcHkuXG4gKiBAcGFyYW0ge09iamVjdH0gW29iamVjdD17fV0gVGhlIG9iamVjdCB0byBjb3B5IHByb3BlcnRpZXMgdG8uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY3VzdG9taXplcl0gVGhlIGZ1bmN0aW9uIHRvIGN1c3RvbWl6ZSBjb3BpZWQgdmFsdWVzLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBgb2JqZWN0YC5cbiAqL1xuZnVuY3Rpb24gY29weU9iamVjdChzb3VyY2UsIHByb3BzLCBvYmplY3QsIGN1c3RvbWl6ZXIpIHtcbiAgdmFyIGlzTmV3ID0gIW9iamVjdDtcbiAgb2JqZWN0IHx8IChvYmplY3QgPSB7fSk7XG5cbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBwcm9wcy5sZW5ndGg7XG5cbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICB2YXIga2V5ID0gcHJvcHNbaW5kZXhdO1xuXG4gICAgdmFyIG5ld1ZhbHVlID0gY3VzdG9taXplclxuICAgICAgPyBjdXN0b21pemVyKG9iamVjdFtrZXldLCBzb3VyY2Vba2V5XSwga2V5LCBvYmplY3QsIHNvdXJjZSlcbiAgICAgIDogdW5kZWZpbmVkO1xuXG4gICAgaWYgKG5ld1ZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIG5ld1ZhbHVlID0gc291cmNlW2tleV07XG4gICAgfVxuICAgIGlmIChpc05ldykge1xuICAgICAgYmFzZUFzc2lnblZhbHVlKG9iamVjdCwga2V5LCBuZXdWYWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFzc2lnblZhbHVlKG9iamVjdCwga2V5LCBuZXdWYWx1ZSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBvYmplY3Q7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY29weU9iamVjdDtcbiIsIi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8udGltZXNgIHdpdGhvdXQgc3VwcG9ydCBmb3IgaXRlcmF0ZWUgc2hvcnRoYW5kc1xuICogb3IgbWF4IGFycmF5IGxlbmd0aCBjaGVja3MuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7bnVtYmVyfSBuIFRoZSBudW1iZXIgb2YgdGltZXMgdG8gaW52b2tlIGBpdGVyYXRlZWAuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRlZSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiByZXN1bHRzLlxuICovXG5mdW5jdGlvbiBiYXNlVGltZXMobiwgaXRlcmF0ZWUpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICByZXN1bHQgPSBBcnJheShuKTtcblxuICB3aGlsZSAoKytpbmRleCA8IG4pIHtcbiAgICByZXN1bHRbaW5kZXhdID0gaXRlcmF0ZWUoaW5kZXgpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZVRpbWVzO1xuIiwiLyoqIFVzZWQgYXMgcmVmZXJlbmNlcyBmb3IgdmFyaW91cyBgTnVtYmVyYCBjb25zdGFudHMuICovXG52YXIgTUFYX1NBRkVfSU5URUdFUiA9IDkwMDcxOTkyNTQ3NDA5OTE7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCB1bnNpZ25lZCBpbnRlZ2VyIHZhbHVlcy4gKi9cbnZhciByZUlzVWludCA9IC9eKD86MHxbMS05XVxcZCopJC87XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSB2YWxpZCBhcnJheS1saWtlIGluZGV4LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbbGVuZ3RoPU1BWF9TQUZFX0lOVEVHRVJdIFRoZSB1cHBlciBib3VuZHMgb2YgYSB2YWxpZCBpbmRleC5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgdmFsaWQgaW5kZXgsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaXNJbmRleCh2YWx1ZSwgbGVuZ3RoKSB7XG4gIGxlbmd0aCA9IGxlbmd0aCA9PSBudWxsID8gTUFYX1NBRkVfSU5URUdFUiA6IGxlbmd0aDtcbiAgcmV0dXJuICEhbGVuZ3RoICYmXG4gICAgKHR5cGVvZiB2YWx1ZSA9PSAnbnVtYmVyJyB8fCByZUlzVWludC50ZXN0KHZhbHVlKSkgJiZcbiAgICAodmFsdWUgPiAtMSAmJiB2YWx1ZSAlIDEgPT0gMCAmJiB2YWx1ZSA8IGxlbmd0aCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNJbmRleDtcbiIsInZhciBiYXNlVGltZXMgPSByZXF1aXJlKCcuL19iYXNlVGltZXMnKSxcbiAgICBpc0FyZ3VtZW50cyA9IHJlcXVpcmUoJy4vaXNBcmd1bWVudHMnKSxcbiAgICBpc0FycmF5ID0gcmVxdWlyZSgnLi9pc0FycmF5JyksXG4gICAgaXNCdWZmZXIgPSByZXF1aXJlKCcuL2lzQnVmZmVyJyksXG4gICAgaXNJbmRleCA9IHJlcXVpcmUoJy4vX2lzSW5kZXgnKSxcbiAgICBpc1R5cGVkQXJyYXkgPSByZXF1aXJlKCcuL2lzVHlwZWRBcnJheScpO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gYXJyYXkgb2YgdGhlIGVudW1lcmFibGUgcHJvcGVydHkgbmFtZXMgb2YgdGhlIGFycmF5LWxpa2UgYHZhbHVlYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcXVlcnkuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGluaGVyaXRlZCBTcGVjaWZ5IHJldHVybmluZyBpbmhlcml0ZWQgcHJvcGVydHkgbmFtZXMuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzLlxuICovXG5mdW5jdGlvbiBhcnJheUxpa2VLZXlzKHZhbHVlLCBpbmhlcml0ZWQpIHtcbiAgdmFyIGlzQXJyID0gaXNBcnJheSh2YWx1ZSksXG4gICAgICBpc0FyZyA9ICFpc0FyciAmJiBpc0FyZ3VtZW50cyh2YWx1ZSksXG4gICAgICBpc0J1ZmYgPSAhaXNBcnIgJiYgIWlzQXJnICYmIGlzQnVmZmVyKHZhbHVlKSxcbiAgICAgIGlzVHlwZSA9ICFpc0FyciAmJiAhaXNBcmcgJiYgIWlzQnVmZiAmJiBpc1R5cGVkQXJyYXkodmFsdWUpLFxuICAgICAgc2tpcEluZGV4ZXMgPSBpc0FyciB8fCBpc0FyZyB8fCBpc0J1ZmYgfHwgaXNUeXBlLFxuICAgICAgcmVzdWx0ID0gc2tpcEluZGV4ZXMgPyBiYXNlVGltZXModmFsdWUubGVuZ3RoLCBTdHJpbmcpIDogW10sXG4gICAgICBsZW5ndGggPSByZXN1bHQubGVuZ3RoO1xuXG4gIGZvciAodmFyIGtleSBpbiB2YWx1ZSkge1xuICAgIGlmICgoaW5oZXJpdGVkIHx8IGhhc093blByb3BlcnR5LmNhbGwodmFsdWUsIGtleSkpICYmXG4gICAgICAgICEoc2tpcEluZGV4ZXMgJiYgKFxuICAgICAgICAgICAvLyBTYWZhcmkgOSBoYXMgZW51bWVyYWJsZSBgYXJndW1lbnRzLmxlbmd0aGAgaW4gc3RyaWN0IG1vZGUuXG4gICAgICAgICAgIGtleSA9PSAnbGVuZ3RoJyB8fFxuICAgICAgICAgICAvLyBOb2RlLmpzIDAuMTAgaGFzIGVudW1lcmFibGUgbm9uLWluZGV4IHByb3BlcnRpZXMgb24gYnVmZmVycy5cbiAgICAgICAgICAgKGlzQnVmZiAmJiAoa2V5ID09ICdvZmZzZXQnIHx8IGtleSA9PSAncGFyZW50JykpIHx8XG4gICAgICAgICAgIC8vIFBoYW50b21KUyAyIGhhcyBlbnVtZXJhYmxlIG5vbi1pbmRleCBwcm9wZXJ0aWVzIG9uIHR5cGVkIGFycmF5cy5cbiAgICAgICAgICAgKGlzVHlwZSAmJiAoa2V5ID09ICdidWZmZXInIHx8IGtleSA9PSAnYnl0ZUxlbmd0aCcgfHwga2V5ID09ICdieXRlT2Zmc2V0JykpIHx8XG4gICAgICAgICAgIC8vIFNraXAgaW5kZXggcHJvcGVydGllcy5cbiAgICAgICAgICAgaXNJbmRleChrZXksIGxlbmd0aClcbiAgICAgICAgKSkpIHtcbiAgICAgIHJlc3VsdC5wdXNoKGtleSk7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYXJyYXlMaWtlS2V5cztcbiIsIi8qKlxuICogVGhpcyBmdW5jdGlvbiBpcyBsaWtlXG4gKiBbYE9iamVjdC5rZXlzYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtb2JqZWN0LmtleXMpXG4gKiBleGNlcHQgdGhhdCBpdCBpbmNsdWRlcyBpbmhlcml0ZWQgZW51bWVyYWJsZSBwcm9wZXJ0aWVzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzLlxuICovXG5mdW5jdGlvbiBuYXRpdmVLZXlzSW4ob2JqZWN0KSB7XG4gIHZhciByZXN1bHQgPSBbXTtcbiAgaWYgKG9iamVjdCAhPSBudWxsKSB7XG4gICAgZm9yICh2YXIga2V5IGluIE9iamVjdChvYmplY3QpKSB7XG4gICAgICByZXN1bHQucHVzaChrZXkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG5hdGl2ZUtleXNJbjtcbiIsInZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vaXNPYmplY3QnKSxcbiAgICBpc1Byb3RvdHlwZSA9IHJlcXVpcmUoJy4vX2lzUHJvdG90eXBlJyksXG4gICAgbmF0aXZlS2V5c0luID0gcmVxdWlyZSgnLi9fbmF0aXZlS2V5c0luJyk7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8ua2V5c0luYCB3aGljaCBkb2Vzbid0IHRyZWF0IHNwYXJzZSBhcnJheXMgYXMgZGVuc2UuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMuXG4gKi9cbmZ1bmN0aW9uIGJhc2VLZXlzSW4ob2JqZWN0KSB7XG4gIGlmICghaXNPYmplY3Qob2JqZWN0KSkge1xuICAgIHJldHVybiBuYXRpdmVLZXlzSW4ob2JqZWN0KTtcbiAgfVxuICB2YXIgaXNQcm90byA9IGlzUHJvdG90eXBlKG9iamVjdCksXG4gICAgICByZXN1bHQgPSBbXTtcblxuICBmb3IgKHZhciBrZXkgaW4gb2JqZWN0KSB7XG4gICAgaWYgKCEoa2V5ID09ICdjb25zdHJ1Y3RvcicgJiYgKGlzUHJvdG8gfHwgIWhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBrZXkpKSkpIHtcbiAgICAgIHJlc3VsdC5wdXNoKGtleSk7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUtleXNJbjtcbiIsInZhciBhcnJheUxpa2VLZXlzID0gcmVxdWlyZSgnLi9fYXJyYXlMaWtlS2V5cycpLFxuICAgIGJhc2VLZXlzSW4gPSByZXF1aXJlKCcuL19iYXNlS2V5c0luJyksXG4gICAgaXNBcnJheUxpa2UgPSByZXF1aXJlKCcuL2lzQXJyYXlMaWtlJyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhcnJheSBvZiB0aGUgb3duIGFuZCBpbmhlcml0ZWQgZW51bWVyYWJsZSBwcm9wZXJ0eSBuYW1lcyBvZiBgb2JqZWN0YC5cbiAqXG4gKiAqKk5vdGU6KiogTm9uLW9iamVjdCB2YWx1ZXMgYXJlIGNvZXJjZWQgdG8gb2JqZWN0cy5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDMuMC4wXG4gKiBAY2F0ZWdvcnkgT2JqZWN0XG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzLlxuICogQGV4YW1wbGVcbiAqXG4gKiBmdW5jdGlvbiBGb28oKSB7XG4gKiAgIHRoaXMuYSA9IDE7XG4gKiAgIHRoaXMuYiA9IDI7XG4gKiB9XG4gKlxuICogRm9vLnByb3RvdHlwZS5jID0gMztcbiAqXG4gKiBfLmtleXNJbihuZXcgRm9vKTtcbiAqIC8vID0+IFsnYScsICdiJywgJ2MnXSAoaXRlcmF0aW9uIG9yZGVyIGlzIG5vdCBndWFyYW50ZWVkKVxuICovXG5mdW5jdGlvbiBrZXlzSW4ob2JqZWN0KSB7XG4gIHJldHVybiBpc0FycmF5TGlrZShvYmplY3QpID8gYXJyYXlMaWtlS2V5cyhvYmplY3QsIHRydWUpIDogYmFzZUtleXNJbihvYmplY3QpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGtleXNJbjtcbiIsInZhciBjb3B5T2JqZWN0ID0gcmVxdWlyZSgnLi9fY29weU9iamVjdCcpLFxuICAgIGtleXNJbiA9IHJlcXVpcmUoJy4va2V5c0luJyk7XG5cbi8qKlxuICogQ29udmVydHMgYHZhbHVlYCB0byBhIHBsYWluIG9iamVjdCBmbGF0dGVuaW5nIGluaGVyaXRlZCBlbnVtZXJhYmxlIHN0cmluZ1xuICoga2V5ZWQgcHJvcGVydGllcyBvZiBgdmFsdWVgIHRvIG93biBwcm9wZXJ0aWVzIG9mIHRoZSBwbGFpbiBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAzLjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNvbnZlcnQuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBjb252ZXJ0ZWQgcGxhaW4gb2JqZWN0LlxuICogQGV4YW1wbGVcbiAqXG4gKiBmdW5jdGlvbiBGb28oKSB7XG4gKiAgIHRoaXMuYiA9IDI7XG4gKiB9XG4gKlxuICogRm9vLnByb3RvdHlwZS5jID0gMztcbiAqXG4gKiBfLmFzc2lnbih7ICdhJzogMSB9LCBuZXcgRm9vKTtcbiAqIC8vID0+IHsgJ2EnOiAxLCAnYic6IDIgfVxuICpcbiAqIF8uYXNzaWduKHsgJ2EnOiAxIH0sIF8udG9QbGFpbk9iamVjdChuZXcgRm9vKSk7XG4gKiAvLyA9PiB7ICdhJzogMSwgJ2InOiAyLCAnYyc6IDMgfVxuICovXG5mdW5jdGlvbiB0b1BsYWluT2JqZWN0KHZhbHVlKSB7XG4gIHJldHVybiBjb3B5T2JqZWN0KHZhbHVlLCBrZXlzSW4odmFsdWUpKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB0b1BsYWluT2JqZWN0O1xuIiwidmFyIGFzc2lnbk1lcmdlVmFsdWUgPSByZXF1aXJlKCcuL19hc3NpZ25NZXJnZVZhbHVlJyksXG4gICAgY2xvbmVCdWZmZXIgPSByZXF1aXJlKCcuL19jbG9uZUJ1ZmZlcicpLFxuICAgIGNsb25lVHlwZWRBcnJheSA9IHJlcXVpcmUoJy4vX2Nsb25lVHlwZWRBcnJheScpLFxuICAgIGNvcHlBcnJheSA9IHJlcXVpcmUoJy4vX2NvcHlBcnJheScpLFxuICAgIGluaXRDbG9uZU9iamVjdCA9IHJlcXVpcmUoJy4vX2luaXRDbG9uZU9iamVjdCcpLFxuICAgIGlzQXJndW1lbnRzID0gcmVxdWlyZSgnLi9pc0FyZ3VtZW50cycpLFxuICAgIGlzQXJyYXkgPSByZXF1aXJlKCcuL2lzQXJyYXknKSxcbiAgICBpc0FycmF5TGlrZU9iamVjdCA9IHJlcXVpcmUoJy4vaXNBcnJheUxpa2VPYmplY3QnKSxcbiAgICBpc0J1ZmZlciA9IHJlcXVpcmUoJy4vaXNCdWZmZXInKSxcbiAgICBpc0Z1bmN0aW9uID0gcmVxdWlyZSgnLi9pc0Z1bmN0aW9uJyksXG4gICAgaXNPYmplY3QgPSByZXF1aXJlKCcuL2lzT2JqZWN0JyksXG4gICAgaXNQbGFpbk9iamVjdCA9IHJlcXVpcmUoJy4vaXNQbGFpbk9iamVjdCcpLFxuICAgIGlzVHlwZWRBcnJheSA9IHJlcXVpcmUoJy4vaXNUeXBlZEFycmF5JyksXG4gICAgdG9QbGFpbk9iamVjdCA9IHJlcXVpcmUoJy4vdG9QbGFpbk9iamVjdCcpO1xuXG4vKipcbiAqIEEgc3BlY2lhbGl6ZWQgdmVyc2lvbiBvZiBgYmFzZU1lcmdlYCBmb3IgYXJyYXlzIGFuZCBvYmplY3RzIHdoaWNoIHBlcmZvcm1zXG4gKiBkZWVwIG1lcmdlcyBhbmQgdHJhY2tzIHRyYXZlcnNlZCBvYmplY3RzIGVuYWJsaW5nIG9iamVjdHMgd2l0aCBjaXJjdWxhclxuICogcmVmZXJlbmNlcyB0byBiZSBtZXJnZWQuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIGRlc3RpbmF0aW9uIG9iamVjdC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBzb3VyY2UgVGhlIHNvdXJjZSBvYmplY3QuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIG1lcmdlLlxuICogQHBhcmFtIHtudW1iZXJ9IHNyY0luZGV4IFRoZSBpbmRleCBvZiBgc291cmNlYC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IG1lcmdlRnVuYyBUaGUgZnVuY3Rpb24gdG8gbWVyZ2UgdmFsdWVzLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2N1c3RvbWl6ZXJdIFRoZSBmdW5jdGlvbiB0byBjdXN0b21pemUgYXNzaWduZWQgdmFsdWVzLlxuICogQHBhcmFtIHtPYmplY3R9IFtzdGFja10gVHJhY2tzIHRyYXZlcnNlZCBzb3VyY2UgdmFsdWVzIGFuZCB0aGVpciBtZXJnZWRcbiAqICBjb3VudGVycGFydHMuXG4gKi9cbmZ1bmN0aW9uIGJhc2VNZXJnZURlZXAob2JqZWN0LCBzb3VyY2UsIGtleSwgc3JjSW5kZXgsIG1lcmdlRnVuYywgY3VzdG9taXplciwgc3RhY2spIHtcbiAgdmFyIG9ialZhbHVlID0gb2JqZWN0W2tleV0sXG4gICAgICBzcmNWYWx1ZSA9IHNvdXJjZVtrZXldLFxuICAgICAgc3RhY2tlZCA9IHN0YWNrLmdldChzcmNWYWx1ZSk7XG5cbiAgaWYgKHN0YWNrZWQpIHtcbiAgICBhc3NpZ25NZXJnZVZhbHVlKG9iamVjdCwga2V5LCBzdGFja2VkKTtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIG5ld1ZhbHVlID0gY3VzdG9taXplclxuICAgID8gY3VzdG9taXplcihvYmpWYWx1ZSwgc3JjVmFsdWUsIChrZXkgKyAnJyksIG9iamVjdCwgc291cmNlLCBzdGFjaylcbiAgICA6IHVuZGVmaW5lZDtcblxuICB2YXIgaXNDb21tb24gPSBuZXdWYWx1ZSA9PT0gdW5kZWZpbmVkO1xuXG4gIGlmIChpc0NvbW1vbikge1xuICAgIHZhciBpc0FyciA9IGlzQXJyYXkoc3JjVmFsdWUpLFxuICAgICAgICBpc0J1ZmYgPSAhaXNBcnIgJiYgaXNCdWZmZXIoc3JjVmFsdWUpLFxuICAgICAgICBpc1R5cGVkID0gIWlzQXJyICYmICFpc0J1ZmYgJiYgaXNUeXBlZEFycmF5KHNyY1ZhbHVlKTtcblxuICAgIG5ld1ZhbHVlID0gc3JjVmFsdWU7XG4gICAgaWYgKGlzQXJyIHx8IGlzQnVmZiB8fCBpc1R5cGVkKSB7XG4gICAgICBpZiAoaXNBcnJheShvYmpWYWx1ZSkpIHtcbiAgICAgICAgbmV3VmFsdWUgPSBvYmpWYWx1ZTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKGlzQXJyYXlMaWtlT2JqZWN0KG9ialZhbHVlKSkge1xuICAgICAgICBuZXdWYWx1ZSA9IGNvcHlBcnJheShvYmpWYWx1ZSk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChpc0J1ZmYpIHtcbiAgICAgICAgaXNDb21tb24gPSBmYWxzZTtcbiAgICAgICAgbmV3VmFsdWUgPSBjbG9uZUJ1ZmZlcihzcmNWYWx1ZSwgdHJ1ZSk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChpc1R5cGVkKSB7XG4gICAgICAgIGlzQ29tbW9uID0gZmFsc2U7XG4gICAgICAgIG5ld1ZhbHVlID0gY2xvbmVUeXBlZEFycmF5KHNyY1ZhbHVlLCB0cnVlKTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBuZXdWYWx1ZSA9IFtdO1xuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmIChpc1BsYWluT2JqZWN0KHNyY1ZhbHVlKSB8fCBpc0FyZ3VtZW50cyhzcmNWYWx1ZSkpIHtcbiAgICAgIG5ld1ZhbHVlID0gb2JqVmFsdWU7XG4gICAgICBpZiAoaXNBcmd1bWVudHMob2JqVmFsdWUpKSB7XG4gICAgICAgIG5ld1ZhbHVlID0gdG9QbGFpbk9iamVjdChvYmpWYWx1ZSk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmICghaXNPYmplY3Qob2JqVmFsdWUpIHx8IChzcmNJbmRleCAmJiBpc0Z1bmN0aW9uKG9ialZhbHVlKSkpIHtcbiAgICAgICAgbmV3VmFsdWUgPSBpbml0Q2xvbmVPYmplY3Qoc3JjVmFsdWUpO1xuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGlzQ29tbW9uID0gZmFsc2U7XG4gICAgfVxuICB9XG4gIGlmIChpc0NvbW1vbikge1xuICAgIC8vIFJlY3Vyc2l2ZWx5IG1lcmdlIG9iamVjdHMgYW5kIGFycmF5cyAoc3VzY2VwdGlibGUgdG8gY2FsbCBzdGFjayBsaW1pdHMpLlxuICAgIHN0YWNrLnNldChzcmNWYWx1ZSwgbmV3VmFsdWUpO1xuICAgIG1lcmdlRnVuYyhuZXdWYWx1ZSwgc3JjVmFsdWUsIHNyY0luZGV4LCBjdXN0b21pemVyLCBzdGFjayk7XG4gICAgc3RhY2tbJ2RlbGV0ZSddKHNyY1ZhbHVlKTtcbiAgfVxuICBhc3NpZ25NZXJnZVZhbHVlKG9iamVjdCwga2V5LCBuZXdWYWx1ZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZU1lcmdlRGVlcDtcbiIsInZhciBTdGFjayA9IHJlcXVpcmUoJy4vX1N0YWNrJyksXG4gICAgYXNzaWduTWVyZ2VWYWx1ZSA9IHJlcXVpcmUoJy4vX2Fzc2lnbk1lcmdlVmFsdWUnKSxcbiAgICBiYXNlRm9yID0gcmVxdWlyZSgnLi9fYmFzZUZvcicpLFxuICAgIGJhc2VNZXJnZURlZXAgPSByZXF1aXJlKCcuL19iYXNlTWVyZ2VEZWVwJyksXG4gICAgaXNPYmplY3QgPSByZXF1aXJlKCcuL2lzT2JqZWN0JyksXG4gICAga2V5c0luID0gcmVxdWlyZSgnLi9rZXlzSW4nKTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5tZXJnZWAgd2l0aG91dCBzdXBwb3J0IGZvciBtdWx0aXBsZSBzb3VyY2VzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBkZXN0aW5hdGlvbiBvYmplY3QuXG4gKiBAcGFyYW0ge09iamVjdH0gc291cmNlIFRoZSBzb3VyY2Ugb2JqZWN0LlxuICogQHBhcmFtIHtudW1iZXJ9IHNyY0luZGV4IFRoZSBpbmRleCBvZiBgc291cmNlYC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtjdXN0b21pemVyXSBUaGUgZnVuY3Rpb24gdG8gY3VzdG9taXplIG1lcmdlZCB2YWx1ZXMuXG4gKiBAcGFyYW0ge09iamVjdH0gW3N0YWNrXSBUcmFja3MgdHJhdmVyc2VkIHNvdXJjZSB2YWx1ZXMgYW5kIHRoZWlyIG1lcmdlZFxuICogIGNvdW50ZXJwYXJ0cy5cbiAqL1xuZnVuY3Rpb24gYmFzZU1lcmdlKG9iamVjdCwgc291cmNlLCBzcmNJbmRleCwgY3VzdG9taXplciwgc3RhY2spIHtcbiAgaWYgKG9iamVjdCA9PT0gc291cmNlKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGJhc2VGb3Ioc291cmNlLCBmdW5jdGlvbihzcmNWYWx1ZSwga2V5KSB7XG4gICAgaWYgKGlzT2JqZWN0KHNyY1ZhbHVlKSkge1xuICAgICAgc3RhY2sgfHwgKHN0YWNrID0gbmV3IFN0YWNrKTtcbiAgICAgIGJhc2VNZXJnZURlZXAob2JqZWN0LCBzb3VyY2UsIGtleSwgc3JjSW5kZXgsIGJhc2VNZXJnZSwgY3VzdG9taXplciwgc3RhY2spO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHZhciBuZXdWYWx1ZSA9IGN1c3RvbWl6ZXJcbiAgICAgICAgPyBjdXN0b21pemVyKG9iamVjdFtrZXldLCBzcmNWYWx1ZSwgKGtleSArICcnKSwgb2JqZWN0LCBzb3VyY2UsIHN0YWNrKVxuICAgICAgICA6IHVuZGVmaW5lZDtcblxuICAgICAgaWYgKG5ld1ZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgbmV3VmFsdWUgPSBzcmNWYWx1ZTtcbiAgICAgIH1cbiAgICAgIGFzc2lnbk1lcmdlVmFsdWUob2JqZWN0LCBrZXksIG5ld1ZhbHVlKTtcbiAgICB9XG4gIH0sIGtleXNJbik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZU1lcmdlO1xuIiwiLyoqXG4gKiBUaGlzIG1ldGhvZCByZXR1cm5zIHRoZSBmaXJzdCBhcmd1bWVudCBpdCByZWNlaXZlcy5cbiAqXG4gKiBAc3RhdGljXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgVXRpbFxuICogQHBhcmFtIHsqfSB2YWx1ZSBBbnkgdmFsdWUuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyBgdmFsdWVgLlxuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgb2JqZWN0ID0geyAnYSc6IDEgfTtcbiAqXG4gKiBjb25zb2xlLmxvZyhfLmlkZW50aXR5KG9iamVjdCkgPT09IG9iamVjdCk7XG4gKiAvLyA9PiB0cnVlXG4gKi9cbmZ1bmN0aW9uIGlkZW50aXR5KHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpZGVudGl0eTtcbiIsIi8qKlxuICogQSBmYXN0ZXIgYWx0ZXJuYXRpdmUgdG8gYEZ1bmN0aW9uI2FwcGx5YCwgdGhpcyBmdW5jdGlvbiBpbnZva2VzIGBmdW5jYFxuICogd2l0aCB0aGUgYHRoaXNgIGJpbmRpbmcgb2YgYHRoaXNBcmdgIGFuZCB0aGUgYXJndW1lbnRzIG9mIGBhcmdzYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gaW52b2tlLlxuICogQHBhcmFtIHsqfSB0aGlzQXJnIFRoZSBgdGhpc2AgYmluZGluZyBvZiBgZnVuY2AuXG4gKiBAcGFyYW0ge0FycmF5fSBhcmdzIFRoZSBhcmd1bWVudHMgdG8gaW52b2tlIGBmdW5jYCB3aXRoLlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIHJlc3VsdCBvZiBgZnVuY2AuXG4gKi9cbmZ1bmN0aW9uIGFwcGx5KGZ1bmMsIHRoaXNBcmcsIGFyZ3MpIHtcbiAgc3dpdGNoIChhcmdzLmxlbmd0aCkge1xuICAgIGNhc2UgMDogcmV0dXJuIGZ1bmMuY2FsbCh0aGlzQXJnKTtcbiAgICBjYXNlIDE6IHJldHVybiBmdW5jLmNhbGwodGhpc0FyZywgYXJnc1swXSk7XG4gICAgY2FzZSAyOiByZXR1cm4gZnVuYy5jYWxsKHRoaXNBcmcsIGFyZ3NbMF0sIGFyZ3NbMV0pO1xuICAgIGNhc2UgMzogcmV0dXJuIGZ1bmMuY2FsbCh0aGlzQXJnLCBhcmdzWzBdLCBhcmdzWzFdLCBhcmdzWzJdKTtcbiAgfVxuICByZXR1cm4gZnVuYy5hcHBseSh0aGlzQXJnLCBhcmdzKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBhcHBseTtcbiIsInZhciBhcHBseSA9IHJlcXVpcmUoJy4vX2FwcGx5Jyk7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIGZvciB0aG9zZSB3aXRoIHRoZSBzYW1lIG5hbWUgYXMgb3RoZXIgYGxvZGFzaGAgbWV0aG9kcy4gKi9cbnZhciBuYXRpdmVNYXggPSBNYXRoLm1heDtcblxuLyoqXG4gKiBBIHNwZWNpYWxpemVkIHZlcnNpb24gb2YgYGJhc2VSZXN0YCB3aGljaCB0cmFuc2Zvcm1zIHRoZSByZXN0IGFycmF5LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBhcHBseSBhIHJlc3QgcGFyYW1ldGVyIHRvLlxuICogQHBhcmFtIHtudW1iZXJ9IFtzdGFydD1mdW5jLmxlbmd0aC0xXSBUaGUgc3RhcnQgcG9zaXRpb24gb2YgdGhlIHJlc3QgcGFyYW1ldGVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gdHJhbnNmb3JtIFRoZSByZXN0IGFycmF5IHRyYW5zZm9ybS5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBvdmVyUmVzdChmdW5jLCBzdGFydCwgdHJhbnNmb3JtKSB7XG4gIHN0YXJ0ID0gbmF0aXZlTWF4KHN0YXJ0ID09PSB1bmRlZmluZWQgPyAoZnVuYy5sZW5ndGggLSAxKSA6IHN0YXJ0LCAwKTtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBhcmdzID0gYXJndW1lbnRzLFxuICAgICAgICBpbmRleCA9IC0xLFxuICAgICAgICBsZW5ndGggPSBuYXRpdmVNYXgoYXJncy5sZW5ndGggLSBzdGFydCwgMCksXG4gICAgICAgIGFycmF5ID0gQXJyYXkobGVuZ3RoKTtcblxuICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICBhcnJheVtpbmRleF0gPSBhcmdzW3N0YXJ0ICsgaW5kZXhdO1xuICAgIH1cbiAgICBpbmRleCA9IC0xO1xuICAgIHZhciBvdGhlckFyZ3MgPSBBcnJheShzdGFydCArIDEpO1xuICAgIHdoaWxlICgrK2luZGV4IDwgc3RhcnQpIHtcbiAgICAgIG90aGVyQXJnc1tpbmRleF0gPSBhcmdzW2luZGV4XTtcbiAgICB9XG4gICAgb3RoZXJBcmdzW3N0YXJ0XSA9IHRyYW5zZm9ybShhcnJheSk7XG4gICAgcmV0dXJuIGFwcGx5KGZ1bmMsIHRoaXMsIG90aGVyQXJncyk7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gb3ZlclJlc3Q7XG4iLCIvKipcbiAqIENyZWF0ZXMgYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgYHZhbHVlYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDIuNC4wXG4gKiBAY2F0ZWdvcnkgVXRpbFxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcmV0dXJuIGZyb20gdGhlIG5ldyBmdW5jdGlvbi5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGNvbnN0YW50IGZ1bmN0aW9uLlxuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgb2JqZWN0cyA9IF8udGltZXMoMiwgXy5jb25zdGFudCh7ICdhJzogMSB9KSk7XG4gKlxuICogY29uc29sZS5sb2cob2JqZWN0cyk7XG4gKiAvLyA9PiBbeyAnYSc6IDEgfSwgeyAnYSc6IDEgfV1cbiAqXG4gKiBjb25zb2xlLmxvZyhvYmplY3RzWzBdID09PSBvYmplY3RzWzFdKTtcbiAqIC8vID0+IHRydWVcbiAqL1xuZnVuY3Rpb24gY29uc3RhbnQodmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjb25zdGFudDtcbiIsInZhciBjb25zdGFudCA9IHJlcXVpcmUoJy4vY29uc3RhbnQnKSxcbiAgICBkZWZpbmVQcm9wZXJ0eSA9IHJlcXVpcmUoJy4vX2RlZmluZVByb3BlcnR5JyksXG4gICAgaWRlbnRpdHkgPSByZXF1aXJlKCcuL2lkZW50aXR5Jyk7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYHNldFRvU3RyaW5nYCB3aXRob3V0IHN1cHBvcnQgZm9yIGhvdCBsb29wIHNob3J0aW5nLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBtb2RpZnkuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBzdHJpbmcgVGhlIGB0b1N0cmluZ2AgcmVzdWx0LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIGBmdW5jYC5cbiAqL1xudmFyIGJhc2VTZXRUb1N0cmluZyA9ICFkZWZpbmVQcm9wZXJ0eSA/IGlkZW50aXR5IDogZnVuY3Rpb24oZnVuYywgc3RyaW5nKSB7XG4gIHJldHVybiBkZWZpbmVQcm9wZXJ0eShmdW5jLCAndG9TdHJpbmcnLCB7XG4gICAgJ2NvbmZpZ3VyYWJsZSc6IHRydWUsXG4gICAgJ2VudW1lcmFibGUnOiBmYWxzZSxcbiAgICAndmFsdWUnOiBjb25zdGFudChzdHJpbmcpLFxuICAgICd3cml0YWJsZSc6IHRydWVcbiAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VTZXRUb1N0cmluZztcbiIsIi8qKiBVc2VkIHRvIGRldGVjdCBob3QgZnVuY3Rpb25zIGJ5IG51bWJlciBvZiBjYWxscyB3aXRoaW4gYSBzcGFuIG9mIG1pbGxpc2Vjb25kcy4gKi9cbnZhciBIT1RfQ09VTlQgPSA4MDAsXG4gICAgSE9UX1NQQU4gPSAxNjtcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgZm9yIHRob3NlIHdpdGggdGhlIHNhbWUgbmFtZSBhcyBvdGhlciBgbG9kYXNoYCBtZXRob2RzLiAqL1xudmFyIG5hdGl2ZU5vdyA9IERhdGUubm93O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBmdW5jdGlvbiB0aGF0J2xsIHNob3J0IG91dCBhbmQgaW52b2tlIGBpZGVudGl0eWAgaW5zdGVhZFxuICogb2YgYGZ1bmNgIHdoZW4gaXQncyBjYWxsZWQgYEhPVF9DT1VOVGAgb3IgbW9yZSB0aW1lcyBpbiBgSE9UX1NQQU5gXG4gKiBtaWxsaXNlY29uZHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIHJlc3RyaWN0LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgc2hvcnRhYmxlIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBzaG9ydE91dChmdW5jKSB7XG4gIHZhciBjb3VudCA9IDAsXG4gICAgICBsYXN0Q2FsbGVkID0gMDtcblxuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHN0YW1wID0gbmF0aXZlTm93KCksXG4gICAgICAgIHJlbWFpbmluZyA9IEhPVF9TUEFOIC0gKHN0YW1wIC0gbGFzdENhbGxlZCk7XG5cbiAgICBsYXN0Q2FsbGVkID0gc3RhbXA7XG4gICAgaWYgKHJlbWFpbmluZyA+IDApIHtcbiAgICAgIGlmICgrK2NvdW50ID49IEhPVF9DT1VOVCkge1xuICAgICAgICByZXR1cm4gYXJndW1lbnRzWzBdO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb3VudCA9IDA7XG4gICAgfVxuICAgIHJldHVybiBmdW5jLmFwcGx5KHVuZGVmaW5lZCwgYXJndW1lbnRzKTtcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzaG9ydE91dDtcbiIsInZhciBiYXNlU2V0VG9TdHJpbmcgPSByZXF1aXJlKCcuL19iYXNlU2V0VG9TdHJpbmcnKSxcbiAgICBzaG9ydE91dCA9IHJlcXVpcmUoJy4vX3Nob3J0T3V0Jyk7XG5cbi8qKlxuICogU2V0cyB0aGUgYHRvU3RyaW5nYCBtZXRob2Qgb2YgYGZ1bmNgIHRvIHJldHVybiBgc3RyaW5nYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gbW9kaWZ5LlxuICogQHBhcmFtIHtGdW5jdGlvbn0gc3RyaW5nIFRoZSBgdG9TdHJpbmdgIHJlc3VsdC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyBgZnVuY2AuXG4gKi9cbnZhciBzZXRUb1N0cmluZyA9IHNob3J0T3V0KGJhc2VTZXRUb1N0cmluZyk7XG5cbm1vZHVsZS5leHBvcnRzID0gc2V0VG9TdHJpbmc7XG4iLCJ2YXIgaWRlbnRpdHkgPSByZXF1aXJlKCcuL2lkZW50aXR5JyksXG4gICAgb3ZlclJlc3QgPSByZXF1aXJlKCcuL19vdmVyUmVzdCcpLFxuICAgIHNldFRvU3RyaW5nID0gcmVxdWlyZSgnLi9fc2V0VG9TdHJpbmcnKTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5yZXN0YCB3aGljaCBkb2Vzbid0IHZhbGlkYXRlIG9yIGNvZXJjZSBhcmd1bWVudHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGFwcGx5IGEgcmVzdCBwYXJhbWV0ZXIgdG8uXG4gKiBAcGFyYW0ge251bWJlcn0gW3N0YXJ0PWZ1bmMubGVuZ3RoLTFdIFRoZSBzdGFydCBwb3NpdGlvbiBvZiB0aGUgcmVzdCBwYXJhbWV0ZXIuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gYmFzZVJlc3QoZnVuYywgc3RhcnQpIHtcbiAgcmV0dXJuIHNldFRvU3RyaW5nKG92ZXJSZXN0KGZ1bmMsIHN0YXJ0LCBpZGVudGl0eSksIGZ1bmMgKyAnJyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZVJlc3Q7XG4iLCJ2YXIgZXEgPSByZXF1aXJlKCcuL2VxJyksXG4gICAgaXNBcnJheUxpa2UgPSByZXF1aXJlKCcuL2lzQXJyYXlMaWtlJyksXG4gICAgaXNJbmRleCA9IHJlcXVpcmUoJy4vX2lzSW5kZXgnKSxcbiAgICBpc09iamVjdCA9IHJlcXVpcmUoJy4vaXNPYmplY3QnKTtcblxuLyoqXG4gKiBDaGVja3MgaWYgdGhlIGdpdmVuIGFyZ3VtZW50cyBhcmUgZnJvbSBhbiBpdGVyYXRlZSBjYWxsLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSBwb3RlbnRpYWwgaXRlcmF0ZWUgdmFsdWUgYXJndW1lbnQuXG4gKiBAcGFyYW0geyp9IGluZGV4IFRoZSBwb3RlbnRpYWwgaXRlcmF0ZWUgaW5kZXggb3Iga2V5IGFyZ3VtZW50LlxuICogQHBhcmFtIHsqfSBvYmplY3QgVGhlIHBvdGVudGlhbCBpdGVyYXRlZSBvYmplY3QgYXJndW1lbnQuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGFyZ3VtZW50cyBhcmUgZnJvbSBhbiBpdGVyYXRlZSBjYWxsLFxuICogIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaXNJdGVyYXRlZUNhbGwodmFsdWUsIGluZGV4LCBvYmplY3QpIHtcbiAgaWYgKCFpc09iamVjdChvYmplY3QpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciB0eXBlID0gdHlwZW9mIGluZGV4O1xuICBpZiAodHlwZSA9PSAnbnVtYmVyJ1xuICAgICAgICA/IChpc0FycmF5TGlrZShvYmplY3QpICYmIGlzSW5kZXgoaW5kZXgsIG9iamVjdC5sZW5ndGgpKVxuICAgICAgICA6ICh0eXBlID09ICdzdHJpbmcnICYmIGluZGV4IGluIG9iamVjdClcbiAgICAgICkge1xuICAgIHJldHVybiBlcShvYmplY3RbaW5kZXhdLCB2YWx1ZSk7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzSXRlcmF0ZWVDYWxsO1xuIiwidmFyIGJhc2VSZXN0ID0gcmVxdWlyZSgnLi9fYmFzZVJlc3QnKSxcbiAgICBpc0l0ZXJhdGVlQ2FsbCA9IHJlcXVpcmUoJy4vX2lzSXRlcmF0ZWVDYWxsJyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGZ1bmN0aW9uIGxpa2UgYF8uYXNzaWduYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gYXNzaWduZXIgVGhlIGZ1bmN0aW9uIHRvIGFzc2lnbiB2YWx1ZXMuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBhc3NpZ25lciBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlQXNzaWduZXIoYXNzaWduZXIpIHtcbiAgcmV0dXJuIGJhc2VSZXN0KGZ1bmN0aW9uKG9iamVjdCwgc291cmNlcykge1xuICAgIHZhciBpbmRleCA9IC0xLFxuICAgICAgICBsZW5ndGggPSBzb3VyY2VzLmxlbmd0aCxcbiAgICAgICAgY3VzdG9taXplciA9IGxlbmd0aCA+IDEgPyBzb3VyY2VzW2xlbmd0aCAtIDFdIDogdW5kZWZpbmVkLFxuICAgICAgICBndWFyZCA9IGxlbmd0aCA+IDIgPyBzb3VyY2VzWzJdIDogdW5kZWZpbmVkO1xuXG4gICAgY3VzdG9taXplciA9IChhc3NpZ25lci5sZW5ndGggPiAzICYmIHR5cGVvZiBjdXN0b21pemVyID09ICdmdW5jdGlvbicpXG4gICAgICA/IChsZW5ndGgtLSwgY3VzdG9taXplcilcbiAgICAgIDogdW5kZWZpbmVkO1xuXG4gICAgaWYgKGd1YXJkICYmIGlzSXRlcmF0ZWVDYWxsKHNvdXJjZXNbMF0sIHNvdXJjZXNbMV0sIGd1YXJkKSkge1xuICAgICAgY3VzdG9taXplciA9IGxlbmd0aCA8IDMgPyB1bmRlZmluZWQgOiBjdXN0b21pemVyO1xuICAgICAgbGVuZ3RoID0gMTtcbiAgICB9XG4gICAgb2JqZWN0ID0gT2JqZWN0KG9iamVjdCk7XG4gICAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICAgIHZhciBzb3VyY2UgPSBzb3VyY2VzW2luZGV4XTtcbiAgICAgIGlmIChzb3VyY2UpIHtcbiAgICAgICAgYXNzaWduZXIob2JqZWN0LCBzb3VyY2UsIGluZGV4LCBjdXN0b21pemVyKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG9iamVjdDtcbiAgfSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlQXNzaWduZXI7XG4iLCJ2YXIgYmFzZU1lcmdlID0gcmVxdWlyZSgnLi9fYmFzZU1lcmdlJyksXG4gICAgY3JlYXRlQXNzaWduZXIgPSByZXF1aXJlKCcuL19jcmVhdGVBc3NpZ25lcicpO1xuXG4vKipcbiAqIFRoaXMgbWV0aG9kIGlzIGxpa2UgYF8ubWVyZ2VgIGV4Y2VwdCB0aGF0IGl0IGFjY2VwdHMgYGN1c3RvbWl6ZXJgIHdoaWNoXG4gKiBpcyBpbnZva2VkIHRvIHByb2R1Y2UgdGhlIG1lcmdlZCB2YWx1ZXMgb2YgdGhlIGRlc3RpbmF0aW9uIGFuZCBzb3VyY2VcbiAqIHByb3BlcnRpZXMuIElmIGBjdXN0b21pemVyYCByZXR1cm5zIGB1bmRlZmluZWRgLCBtZXJnaW5nIGlzIGhhbmRsZWQgYnkgdGhlXG4gKiBtZXRob2QgaW5zdGVhZC4gVGhlIGBjdXN0b21pemVyYCBpcyBpbnZva2VkIHdpdGggc2l4IGFyZ3VtZW50czpcbiAqIChvYmpWYWx1ZSwgc3JjVmFsdWUsIGtleSwgb2JqZWN0LCBzb3VyY2UsIHN0YWNrKS5cbiAqXG4gKiAqKk5vdGU6KiogVGhpcyBtZXRob2QgbXV0YXRlcyBgb2JqZWN0YC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgT2JqZWN0XG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBkZXN0aW5hdGlvbiBvYmplY3QuXG4gKiBAcGFyYW0gey4uLk9iamVjdH0gc291cmNlcyBUaGUgc291cmNlIG9iamVjdHMuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjdXN0b21pemVyIFRoZSBmdW5jdGlvbiB0byBjdXN0b21pemUgYXNzaWduZWQgdmFsdWVzLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBgb2JqZWN0YC5cbiAqIEBleGFtcGxlXG4gKlxuICogZnVuY3Rpb24gY3VzdG9taXplcihvYmpWYWx1ZSwgc3JjVmFsdWUpIHtcbiAqICAgaWYgKF8uaXNBcnJheShvYmpWYWx1ZSkpIHtcbiAqICAgICByZXR1cm4gb2JqVmFsdWUuY29uY2F0KHNyY1ZhbHVlKTtcbiAqICAgfVxuICogfVxuICpcbiAqIHZhciBvYmplY3QgPSB7ICdhJzogWzFdLCAnYic6IFsyXSB9O1xuICogdmFyIG90aGVyID0geyAnYSc6IFszXSwgJ2InOiBbNF0gfTtcbiAqXG4gKiBfLm1lcmdlV2l0aChvYmplY3QsIG90aGVyLCBjdXN0b21pemVyKTtcbiAqIC8vID0+IHsgJ2EnOiBbMSwgM10sICdiJzogWzIsIDRdIH1cbiAqL1xudmFyIG1lcmdlV2l0aCA9IGNyZWF0ZUFzc2lnbmVyKGZ1bmN0aW9uKG9iamVjdCwgc291cmNlLCBzcmNJbmRleCwgY3VzdG9taXplcikge1xuICBiYXNlTWVyZ2Uob2JqZWN0LCBzb3VyY2UsIHNyY0luZGV4LCBjdXN0b21pemVyKTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG1lcmdlV2l0aDtcbiIsIi8vIEBmbG93XG5pbXBvcnQge1xuICB0aHJvd0Vycm9yLFxuICBjYXBpdGFsaXplLFxuICBjYW1lbGl6ZSxcbiAgaHlwaGVuYXRlXG59IGZyb20gJy4vdXRpbCdcblxuZXhwb3J0IGZ1bmN0aW9uIGlzRG9tU2VsZWN0b3IgKHNlbGVjdG9yOiBhbnkpIHtcbiAgaWYgKHR5cGVvZiBzZWxlY3RvciAhPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIHRyeSB7XG4gICAgaWYgKHR5cGVvZiBkb2N1bWVudCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRocm93RXJyb3IoJ21vdW50IG11c3QgYmUgcnVuIGluIGEgYnJvd3NlciBlbnZpcm9ubWVudCBsaWtlIFBoYW50b21KUywganNkb20gb3IgY2hyb21lJylcbiAgICB9XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgdGhyb3dFcnJvcignbW91bnQgbXVzdCBiZSBydW4gaW4gYSBicm93c2VyIGVudmlyb25tZW50IGxpa2UgUGhhbnRvbUpTLCBqc2RvbSBvciBjaHJvbWUnKVxuICB9XG5cbiAgdHJ5IHtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKVxuICAgIHJldHVybiB0cnVlXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzVnVlQ29tcG9uZW50IChjb21wb25lbnQ6IGFueSkge1xuICBpZiAodHlwZW9mIGNvbXBvbmVudCA9PT0gJ2Z1bmN0aW9uJyAmJiBjb21wb25lbnQub3B0aW9ucykge1xuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICBpZiAoY29tcG9uZW50ID09PSBudWxsIHx8IHR5cGVvZiBjb21wb25lbnQgIT09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICBpZiAoY29tcG9uZW50LmV4dGVuZHMgfHwgY29tcG9uZW50Ll9DdG9yKSB7XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIHJldHVybiB0eXBlb2YgY29tcG9uZW50LnJlbmRlciA9PT0gJ2Z1bmN0aW9uJ1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29tcG9uZW50TmVlZHNDb21waWxpbmcgKGNvbXBvbmVudDogQ29tcG9uZW50KSB7XG4gIHJldHVybiBjb21wb25lbnQgJiZcbiAgICAhY29tcG9uZW50LnJlbmRlciAmJlxuICAgIChjb21wb25lbnQudGVtcGxhdGUgfHxcbiAgICAgIGNvbXBvbmVudC5leHRlbmRzIHx8XG4gICAgICBjb21wb25lbnQuZXh0ZW5kT3B0aW9ucykgJiZcbiAgICAhY29tcG9uZW50LmZ1bmN0aW9uYWxcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUmVmU2VsZWN0b3IgKHJlZk9wdGlvbnNPYmplY3Q6IGFueSkge1xuICBpZiAodHlwZW9mIHJlZk9wdGlvbnNPYmplY3QgIT09ICdvYmplY3QnIHx8IE9iamVjdC5rZXlzKHJlZk9wdGlvbnNPYmplY3QgfHwge30pLmxlbmd0aCAhPT0gMSkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgcmV0dXJuIHR5cGVvZiByZWZPcHRpb25zT2JqZWN0LnJlZiA9PT0gJ3N0cmluZydcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzTmFtZVNlbGVjdG9yIChuYW1lT3B0aW9uc09iamVjdDogYW55KSB7XG4gIGlmICh0eXBlb2YgbmFtZU9wdGlvbnNPYmplY3QgIT09ICdvYmplY3QnIHx8IG5hbWVPcHRpb25zT2JqZWN0ID09PSBudWxsKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICByZXR1cm4gISFuYW1lT3B0aW9uc09iamVjdC5uYW1lXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0ZW1wbGF0ZUNvbnRhaW5zQ29tcG9uZW50ICh0ZW1wbGF0ZTogc3RyaW5nLCBuYW1lOiBzdHJpbmcpIHtcbiAgcmV0dXJuIFtjYXBpdGFsaXplLCBjYW1lbGl6ZSwgaHlwaGVuYXRlXS5zb21lKChmb3JtYXQpID0+IHtcbiAgICBjb25zdCByZSA9IG5ldyBSZWdFeHAoYDwke2Zvcm1hdChuYW1lKX1cXFxccyooXFxcXHN8PnwoXFwvPikpYCwgJ2cnKVxuICAgIHJldHVybiByZS50ZXN0KHRlbXBsYXRlKVxuICB9KVxufVxuIiwiaW1wb3J0IFZ1ZSBmcm9tICd2dWUnXG5cbmV4cG9ydCBjb25zdCBOQU1FX1NFTEVDVE9SID0gJ05BTUVfU0VMRUNUT1InXG5leHBvcnQgY29uc3QgQ09NUE9ORU5UX1NFTEVDVE9SID0gJ0NPTVBPTkVOVF9TRUxFQ1RPUidcbmV4cG9ydCBjb25zdCBSRUZfU0VMRUNUT1IgPSAnUkVGX1NFTEVDVE9SJ1xuZXhwb3J0IGNvbnN0IERPTV9TRUxFQ1RPUiA9ICdET01fU0VMRUNUT1InXG5leHBvcnQgY29uc3QgVlVFX1ZFUlNJT04gPSBOdW1iZXIoYCR7VnVlLnZlcnNpb24uc3BsaXQoJy4nKVswXX0uJHtWdWUudmVyc2lvbi5zcGxpdCgnLicpWzFdfWApXG5leHBvcnQgY29uc3QgRlVOQ1RJT05BTF9PUFRJT05TID0gVlVFX1ZFUlNJT04gPj0gMi41ID8gJ2ZuT3B0aW9ucycgOiAnZnVuY3Rpb25hbE9wdGlvbnMnXG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQge1xuICBpc0RvbVNlbGVjdG9yLFxuICBpc05hbWVTZWxlY3RvcixcbiAgaXNSZWZTZWxlY3RvcixcbiAgaXNWdWVDb21wb25lbnRcbn0gZnJvbSAnc2hhcmVkL3ZhbGlkYXRvcnMnXG5pbXBvcnQge1xuICB0aHJvd0Vycm9yXG59IGZyb20gJ3NoYXJlZC91dGlsJ1xuaW1wb3J0IHtcbiAgUkVGX1NFTEVDVE9SLFxuICBDT01QT05FTlRfU0VMRUNUT1IsXG4gIE5BTUVfU0VMRUNUT1IsXG4gIERPTV9TRUxFQ1RPUlxufSBmcm9tICcuL2NvbnN0cydcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZ2V0U2VsZWN0b3JUeXBlT3JUaHJvdyAoc2VsZWN0b3I6IFNlbGVjdG9yLCBtZXRob2ROYW1lOiBzdHJpbmcpOiBzdHJpbmcgfCB2b2lkIHtcbiAgaWYgKGlzRG9tU2VsZWN0b3Ioc2VsZWN0b3IpKSByZXR1cm4gRE9NX1NFTEVDVE9SXG4gIGlmIChpc05hbWVTZWxlY3RvcihzZWxlY3RvcikpIHJldHVybiBOQU1FX1NFTEVDVE9SXG4gIGlmIChpc1Z1ZUNvbXBvbmVudChzZWxlY3RvcikpIHJldHVybiBDT01QT05FTlRfU0VMRUNUT1JcbiAgaWYgKGlzUmVmU2VsZWN0b3Ioc2VsZWN0b3IpKSByZXR1cm4gUkVGX1NFTEVDVE9SXG5cbiAgdGhyb3dFcnJvcihgd3JhcHBlci4ke21ldGhvZE5hbWV9KCkgbXVzdCBiZSBwYXNzZWQgYSB2YWxpZCBDU1Mgc2VsZWN0b3IsIFZ1ZSBjb25zdHJ1Y3Rvciwgb3IgdmFsaWQgZmluZCBvcHRpb24gb2JqZWN0YClcbn1cbiIsIi8vIEBmbG93XG5pbXBvcnQge1xuICBGVU5DVElPTkFMX09QVElPTlMsXG4gIFZVRV9WRVJTSU9OXG59IGZyb20gJy4vY29uc3RzJ1xuaW1wb3J0IHtcbiAgdGhyb3dFcnJvclxufSBmcm9tICdzaGFyZWQvdXRpbCdcblxuZXhwb3J0IGZ1bmN0aW9uIGZpbmRBbGxWdWVDb21wb25lbnRzRnJvbVZtIChcbiAgdm06IENvbXBvbmVudCxcbiAgY29tcG9uZW50czogQXJyYXk8Q29tcG9uZW50PiA9IFtdXG4pOiBBcnJheTxDb21wb25lbnQ+IHtcbiAgY29tcG9uZW50cy5wdXNoKHZtKVxuICB2bS4kY2hpbGRyZW4uZm9yRWFjaCgoY2hpbGQpID0+IHtcbiAgICBmaW5kQWxsVnVlQ29tcG9uZW50c0Zyb21WbShjaGlsZCwgY29tcG9uZW50cylcbiAgfSlcblxuICByZXR1cm4gY29tcG9uZW50c1xufVxuXG5mdW5jdGlvbiBmaW5kQWxsVnVlQ29tcG9uZW50c0Zyb21Wbm9kZSAoXG4gIHZub2RlOiBDb21wb25lbnQsXG4gIGNvbXBvbmVudHM6IEFycmF5PENvbXBvbmVudD4gPSBbXVxuKTogQXJyYXk8Q29tcG9uZW50PiB7XG4gIGlmICh2bm9kZS5jaGlsZCkge1xuICAgIGNvbXBvbmVudHMucHVzaCh2bm9kZS5jaGlsZClcbiAgfVxuICBpZiAodm5vZGUuY2hpbGRyZW4pIHtcbiAgICB2bm9kZS5jaGlsZHJlbi5mb3JFYWNoKChjaGlsZCkgPT4ge1xuICAgICAgZmluZEFsbFZ1ZUNvbXBvbmVudHNGcm9tVm5vZGUoY2hpbGQsIGNvbXBvbmVudHMpXG4gICAgfSlcbiAgfVxuXG4gIHJldHVybiBjb21wb25lbnRzXG59XG5cbmZ1bmN0aW9uIGZpbmRBbGxGdW5jdGlvbmFsQ29tcG9uZW50c0Zyb21Wbm9kZSAoXG4gIHZub2RlOiBDb21wb25lbnQsXG4gIGNvbXBvbmVudHM6IEFycmF5PENvbXBvbmVudD4gPSBbXVxuKTogQXJyYXk8Q29tcG9uZW50PiB7XG4gIGlmICh2bm9kZVtGVU5DVElPTkFMX09QVElPTlNdIHx8IHZub2RlLmZ1bmN0aW9uYWxDb250ZXh0KSB7XG4gICAgY29tcG9uZW50cy5wdXNoKHZub2RlKVxuICB9XG4gIGlmICh2bm9kZS5jaGlsZHJlbikge1xuICAgIHZub2RlLmNoaWxkcmVuLmZvckVhY2goKGNoaWxkKSA9PiB7XG4gICAgICBmaW5kQWxsRnVuY3Rpb25hbENvbXBvbmVudHNGcm9tVm5vZGUoY2hpbGQsIGNvbXBvbmVudHMpXG4gICAgfSlcbiAgfVxuICByZXR1cm4gY29tcG9uZW50c1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdm1DdG9yTWF0Y2hlc05hbWUgKHZtOiBDb21wb25lbnQsIG5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gISEoKHZtLiR2bm9kZSAmJiB2bS4kdm5vZGUuY29tcG9uZW50T3B0aW9ucyAmJlxuICAgIHZtLiR2bm9kZS5jb21wb25lbnRPcHRpb25zLkN0b3Iub3B0aW9ucy5uYW1lID09PSBuYW1lKSB8fFxuICAgICh2bS5fdm5vZGUgJiZcbiAgICB2bS5fdm5vZGUuZnVuY3Rpb25hbE9wdGlvbnMgJiZcbiAgICB2bS5fdm5vZGUuZnVuY3Rpb25hbE9wdGlvbnMubmFtZSA9PT0gbmFtZSkgfHxcbiAgICB2bS4kb3B0aW9ucyAmJiB2bS4kb3B0aW9ucy5uYW1lID09PSBuYW1lIHx8XG4gICAgdm0ub3B0aW9ucyAmJiB2bS5vcHRpb25zLm5hbWUgPT09IG5hbWUpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2bUN0b3JNYXRjaGVzU2VsZWN0b3IgKGNvbXBvbmVudDogQ29tcG9uZW50LCBzZWxlY3RvcjogT2JqZWN0KSB7XG4gIGNvbnN0IEN0b3IgPSBzZWxlY3Rvci5fQ3RvciB8fCAoc2VsZWN0b3Iub3B0aW9ucyAmJiBzZWxlY3Rvci5vcHRpb25zLl9DdG9yKVxuICBpZiAoIUN0b3IpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuICBjb25zdCBjb25zdHJ1Y3RvciA9IGNvbXBvbmVudC5fX3Byb3RvX18uY29uc3RydWN0b3JcbiAgcmV0dXJuIE9iamVjdC5rZXlzKEN0b3IgfHwge30pLnNvbWUoYyA9PiB7XG4gICAgcmV0dXJuIEN0b3JbY10gPT09IGNvbnN0cnVjdG9yIHx8XG4gICAgICBDdG9yW2NdID09PSBjb25zdHJ1Y3Rvci5zdXBlclxuICB9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdm1GdW5jdGlvbmFsQ3Rvck1hdGNoZXNTZWxlY3RvciAoY29tcG9uZW50OiBWTm9kZSwgQ3RvcjogT2JqZWN0KSB7XG4gIGlmIChWVUVfVkVSU0lPTiA8IDIuMykge1xuICAgIHRocm93RXJyb3IoJ2ZpbmQgZm9yIGZ1bmN0aW9uYWwgY29tcG9uZW50cyBpcyBub3Qgc3VwcG9ydCBpbiBWdWUgPCAyLjMnKVxuICB9XG5cbiAgaWYgKCFDdG9yKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICBpZiAoIWNvbXBvbmVudFtGVU5DVElPTkFMX09QVElPTlNdKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbiAgY29uc3QgQ3RvcnMgPSBPYmplY3Qua2V5cyhjb21wb25lbnRbRlVOQ1RJT05BTF9PUFRJT05TXS5fQ3RvcilcbiAgcmV0dXJuIEN0b3JzLnNvbWUoYyA9PiBDdG9yW2NdID09PSBjb21wb25lbnRbRlVOQ1RJT05BTF9PUFRJT05TXS5fQ3RvcltjXSlcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZmluZFZ1ZUNvbXBvbmVudHMgKFxuICByb290OiBDb21wb25lbnQsXG4gIHNlbGVjdG9yVHlwZTogP3N0cmluZyxcbiAgc2VsZWN0b3I6IE9iamVjdFxuKTogQXJyYXk8Q29tcG9uZW50PiB7XG4gIGlmIChzZWxlY3Rvci5mdW5jdGlvbmFsKSB7XG4gICAgY29uc3Qgbm9kZXMgPSByb290Ll92bm9kZVxuICAgICAgPyBmaW5kQWxsRnVuY3Rpb25hbENvbXBvbmVudHNGcm9tVm5vZGUocm9vdC5fdm5vZGUpXG4gICAgICA6IGZpbmRBbGxGdW5jdGlvbmFsQ29tcG9uZW50c0Zyb21Wbm9kZShyb290KVxuICAgIHJldHVybiBub2Rlcy5maWx0ZXIobm9kZSA9PlxuICAgICAgdm1GdW5jdGlvbmFsQ3Rvck1hdGNoZXNTZWxlY3Rvcihub2RlLCBzZWxlY3Rvci5fQ3RvcikgfHxcbiAgICAgIG5vZGVbRlVOQ1RJT05BTF9PUFRJT05TXS5uYW1lID09PSBzZWxlY3Rvci5uYW1lXG4gICAgKVxuICB9XG4gIGNvbnN0IG5hbWVTZWxlY3RvciA9IHR5cGVvZiBzZWxlY3RvciA9PT0gJ2Z1bmN0aW9uJyA/IHNlbGVjdG9yLm9wdGlvbnMubmFtZSA6IHNlbGVjdG9yLm5hbWVcbiAgY29uc3QgY29tcG9uZW50cyA9IHJvb3QuX2lzVnVlXG4gICAgPyBmaW5kQWxsVnVlQ29tcG9uZW50c0Zyb21WbShyb290KVxuICAgIDogZmluZEFsbFZ1ZUNvbXBvbmVudHNGcm9tVm5vZGUocm9vdClcbiAgcmV0dXJuIGNvbXBvbmVudHMuZmlsdGVyKChjb21wb25lbnQpID0+IHtcbiAgICBpZiAoIWNvbXBvbmVudC4kdm5vZGUgJiYgIWNvbXBvbmVudC4kb3B0aW9ucy5leHRlbmRzKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gICAgcmV0dXJuIHZtQ3Rvck1hdGNoZXNTZWxlY3Rvcihjb21wb25lbnQsIHNlbGVjdG9yKSB8fCB2bUN0b3JNYXRjaGVzTmFtZShjb21wb25lbnQsIG5hbWVTZWxlY3RvcilcbiAgfSlcbn1cbiIsIi8vIEBmbG93XG5cbmltcG9ydCB0eXBlIFdyYXBwZXIgZnJvbSAnLi93cmFwcGVyJ1xuaW1wb3J0IHR5cGUgVnVlV3JhcHBlciBmcm9tICcuL3Z1ZS13cmFwcGVyJ1xuaW1wb3J0IHtcbiAgdGhyb3dFcnJvcixcbiAgd2FyblxufSBmcm9tICdzaGFyZWQvdXRpbCdcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgV3JhcHBlckFycmF5IGltcGxlbWVudHMgQmFzZVdyYXBwZXIge1xuICB3cmFwcGVyczogQXJyYXk8V3JhcHBlciB8IFZ1ZVdyYXBwZXI+O1xuICBsZW5ndGg6IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvciAod3JhcHBlcnM6IEFycmF5PFdyYXBwZXIgfCBWdWVXcmFwcGVyPikge1xuICAgIHRoaXMud3JhcHBlcnMgPSB3cmFwcGVycyB8fCBbXVxuICAgIHRoaXMubGVuZ3RoID0gdGhpcy53cmFwcGVycy5sZW5ndGhcbiAgfVxuXG4gIGF0IChpbmRleDogbnVtYmVyKTogV3JhcHBlciB8IFZ1ZVdyYXBwZXIge1xuICAgIGlmIChpbmRleCA+IHRoaXMubGVuZ3RoIC0gMSkge1xuICAgICAgdGhyb3dFcnJvcihgbm8gaXRlbSBleGlzdHMgYXQgJHtpbmRleH1gKVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy53cmFwcGVyc1tpbmRleF1cbiAgfVxuXG4gIGF0dHJpYnV0ZXMgKCk6IHZvaWQge1xuICAgIHRoaXMudGhyb3dFcnJvcklmV3JhcHBlcnNJc0VtcHR5KCdhdHRyaWJ1dGVzJylcblxuICAgIHRocm93RXJyb3IoJ2F0dHJpYnV0ZXMgbXVzdCBiZSBjYWxsZWQgb24gYSBzaW5nbGUgd3JhcHBlciwgdXNlIGF0KGkpIHRvIGFjY2VzcyBhIHdyYXBwZXInKVxuICB9XG5cbiAgY2xhc3NlcyAoKTogdm9pZCB7XG4gICAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ2NsYXNzZXMnKVxuXG4gICAgdGhyb3dFcnJvcignY2xhc3NlcyBtdXN0IGJlIGNhbGxlZCBvbiBhIHNpbmdsZSB3cmFwcGVyLCB1c2UgYXQoaSkgdG8gYWNjZXNzIGEgd3JhcHBlcicpXG4gIH1cblxuICBjb250YWlucyAoc2VsZWN0b3I6IFNlbGVjdG9yKTogYm9vbGVhbiB7XG4gICAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ2NvbnRhaW5zJylcblxuICAgIHJldHVybiB0aGlzLndyYXBwZXJzLmV2ZXJ5KHdyYXBwZXIgPT4gd3JhcHBlci5jb250YWlucyhzZWxlY3RvcikpXG4gIH1cblxuICBleGlzdHMgKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmxlbmd0aCA+IDAgJiYgdGhpcy53cmFwcGVycy5ldmVyeSh3cmFwcGVyID0+IHdyYXBwZXIuZXhpc3RzKCkpXG4gIH1cblxuICBmaWx0ZXIgKHByZWRpY2F0ZTogRnVuY3Rpb24pOiBXcmFwcGVyQXJyYXkge1xuICAgIHJldHVybiBuZXcgV3JhcHBlckFycmF5KHRoaXMud3JhcHBlcnMuZmlsdGVyKHByZWRpY2F0ZSkpXG4gIH1cblxuICB2aXNpYmxlICgpOiBib29sZWFuIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgndmlzaWJsZScpXG5cbiAgICByZXR1cm4gdGhpcy5sZW5ndGggPiAwICYmIHRoaXMud3JhcHBlcnMuZXZlcnkod3JhcHBlciA9PiB3cmFwcGVyLnZpc2libGUoKSlcbiAgfVxuXG4gIGVtaXR0ZWQgKCk6IHZvaWQge1xuICAgIHRoaXMudGhyb3dFcnJvcklmV3JhcHBlcnNJc0VtcHR5KCdlbWl0dGVkJylcblxuICAgIHRocm93RXJyb3IoJ2VtaXR0ZWQgbXVzdCBiZSBjYWxsZWQgb24gYSBzaW5nbGUgd3JhcHBlciwgdXNlIGF0KGkpIHRvIGFjY2VzcyBhIHdyYXBwZXInKVxuICB9XG5cbiAgZW1pdHRlZEJ5T3JkZXIgKCk6IHZvaWQge1xuICAgIHRoaXMudGhyb3dFcnJvcklmV3JhcHBlcnNJc0VtcHR5KCdlbWl0dGVkQnlPcmRlcicpXG5cbiAgICB0aHJvd0Vycm9yKCdlbWl0dGVkQnlPcmRlciBtdXN0IGJlIGNhbGxlZCBvbiBhIHNpbmdsZSB3cmFwcGVyLCB1c2UgYXQoaSkgdG8gYWNjZXNzIGEgd3JhcHBlcicpXG4gIH1cblxuICBoYXNBdHRyaWJ1dGUgKGF0dHJpYnV0ZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ2hhc0F0dHJpYnV0ZScpXG5cbiAgICByZXR1cm4gdGhpcy53cmFwcGVycy5ldmVyeSh3cmFwcGVyID0+IHdyYXBwZXIuaGFzQXR0cmlidXRlKGF0dHJpYnV0ZSwgdmFsdWUpKVxuICB9XG5cbiAgaGFzQ2xhc3MgKGNsYXNzTmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ2hhc0NsYXNzJylcblxuICAgIHJldHVybiB0aGlzLndyYXBwZXJzLmV2ZXJ5KHdyYXBwZXIgPT4gd3JhcHBlci5oYXNDbGFzcyhjbGFzc05hbWUpKVxuICB9XG5cbiAgaGFzUHJvcCAocHJvcDogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ2hhc1Byb3AnKVxuXG4gICAgcmV0dXJuIHRoaXMud3JhcHBlcnMuZXZlcnkod3JhcHBlciA9PiB3cmFwcGVyLmhhc1Byb3AocHJvcCwgdmFsdWUpKVxuICB9XG5cbiAgaGFzU3R5bGUgKHN0eWxlOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgnaGFzU3R5bGUnKVxuXG4gICAgcmV0dXJuIHRoaXMud3JhcHBlcnMuZXZlcnkod3JhcHBlciA9PiB3cmFwcGVyLmhhc1N0eWxlKHN0eWxlLCB2YWx1ZSkpXG4gIH1cblxuICBmaW5kQWxsICgpOiB2b2lkIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgnZmluZEFsbCcpXG5cbiAgICB0aHJvd0Vycm9yKCdmaW5kQWxsIG11c3QgYmUgY2FsbGVkIG9uIGEgc2luZ2xlIHdyYXBwZXIsIHVzZSBhdChpKSB0byBhY2Nlc3MgYSB3cmFwcGVyJylcbiAgfVxuXG4gIGZpbmQgKCk6IHZvaWQge1xuICAgIHRoaXMudGhyb3dFcnJvcklmV3JhcHBlcnNJc0VtcHR5KCdmaW5kJylcblxuICAgIHRocm93RXJyb3IoJ2ZpbmQgbXVzdCBiZSBjYWxsZWQgb24gYSBzaW5nbGUgd3JhcHBlciwgdXNlIGF0KGkpIHRvIGFjY2VzcyBhIHdyYXBwZXInKVxuICB9XG5cbiAgaHRtbCAoKTogdm9pZCB7XG4gICAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ2h0bWwnKVxuXG4gICAgdGhyb3dFcnJvcignaHRtbCBtdXN0IGJlIGNhbGxlZCBvbiBhIHNpbmdsZSB3cmFwcGVyLCB1c2UgYXQoaSkgdG8gYWNjZXNzIGEgd3JhcHBlcicpXG4gIH1cblxuICBpcyAoc2VsZWN0b3I6IFNlbGVjdG9yKTogYm9vbGVhbiB7XG4gICAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ2lzJylcblxuICAgIHJldHVybiB0aGlzLndyYXBwZXJzLmV2ZXJ5KHdyYXBwZXIgPT4gd3JhcHBlci5pcyhzZWxlY3RvcikpXG4gIH1cblxuICBpc0VtcHR5ICgpOiBib29sZWFuIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgnaXNFbXB0eScpXG5cbiAgICByZXR1cm4gdGhpcy53cmFwcGVycy5ldmVyeSh3cmFwcGVyID0+IHdyYXBwZXIuaXNFbXB0eSgpKVxuICB9XG5cbiAgaXNWaXNpYmxlICgpOiBib29sZWFuIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgnaXNWaXNpYmxlJylcblxuICAgIHJldHVybiB0aGlzLndyYXBwZXJzLmV2ZXJ5KHdyYXBwZXIgPT4gd3JhcHBlci5pc1Zpc2libGUoKSlcbiAgfVxuXG4gIGlzVnVlSW5zdGFuY2UgKCk6IGJvb2xlYW4ge1xuICAgIHRoaXMudGhyb3dFcnJvcklmV3JhcHBlcnNJc0VtcHR5KCdpc1Z1ZUluc3RhbmNlJylcblxuICAgIHJldHVybiB0aGlzLndyYXBwZXJzLmV2ZXJ5KHdyYXBwZXIgPT4gd3JhcHBlci5pc1Z1ZUluc3RhbmNlKCkpXG4gIH1cblxuICBuYW1lICgpOiB2b2lkIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgnbmFtZScpXG5cbiAgICB0aHJvd0Vycm9yKCduYW1lIG11c3QgYmUgY2FsbGVkIG9uIGEgc2luZ2xlIHdyYXBwZXIsIHVzZSBhdChpKSB0byBhY2Nlc3MgYSB3cmFwcGVyJylcbiAgfVxuXG4gIHByb3BzICgpOiB2b2lkIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgncHJvcHMnKVxuXG4gICAgdGhyb3dFcnJvcigncHJvcHMgbXVzdCBiZSBjYWxsZWQgb24gYSBzaW5nbGUgd3JhcHBlciwgdXNlIGF0KGkpIHRvIGFjY2VzcyBhIHdyYXBwZXInKVxuICB9XG5cbiAgdGV4dCAoKTogdm9pZCB7XG4gICAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ3RleHQnKVxuXG4gICAgdGhyb3dFcnJvcigndGV4dCBtdXN0IGJlIGNhbGxlZCBvbiBhIHNpbmdsZSB3cmFwcGVyLCB1c2UgYXQoaSkgdG8gYWNjZXNzIGEgd3JhcHBlcicpXG4gIH1cblxuICB0aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkgKG1ldGhvZDogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKHRoaXMud3JhcHBlcnMubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aHJvd0Vycm9yKGAke21ldGhvZH0gY2Fubm90IGJlIGNhbGxlZCBvbiAwIGl0ZW1zYClcbiAgICB9XG4gIH1cblxuICBzZXRDb21wdXRlZCAoY29tcHV0ZWQ6IE9iamVjdCk6IHZvaWQge1xuICAgIHRoaXMudGhyb3dFcnJvcklmV3JhcHBlcnNJc0VtcHR5KCdzZXRDb21wdXRlZCcpXG5cbiAgICB0aGlzLndyYXBwZXJzLmZvckVhY2god3JhcHBlciA9PiB3cmFwcGVyLnNldENvbXB1dGVkKGNvbXB1dGVkKSlcbiAgfVxuXG4gIHNldERhdGEgKGRhdGE6IE9iamVjdCk6IHZvaWQge1xuICAgIHRoaXMudGhyb3dFcnJvcklmV3JhcHBlcnNJc0VtcHR5KCdzZXREYXRhJylcblxuICAgIHRoaXMud3JhcHBlcnMuZm9yRWFjaCh3cmFwcGVyID0+IHdyYXBwZXIuc2V0RGF0YShkYXRhKSlcbiAgfVxuXG4gIHNldE1ldGhvZHMgKHByb3BzOiBPYmplY3QpOiB2b2lkIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgnc2V0TWV0aG9kcycpXG5cbiAgICB0aGlzLndyYXBwZXJzLmZvckVhY2god3JhcHBlciA9PiB3cmFwcGVyLnNldE1ldGhvZHMocHJvcHMpKVxuICB9XG5cbiAgc2V0UHJvcHMgKHByb3BzOiBPYmplY3QpOiB2b2lkIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgnc2V0UHJvcHMnKVxuXG4gICAgdGhpcy53cmFwcGVycy5mb3JFYWNoKHdyYXBwZXIgPT4gd3JhcHBlci5zZXRQcm9wcyhwcm9wcykpXG4gIH1cblxuICBzZXRWYWx1ZSAodmFsdWU6IGFueSk6IHZvaWQge1xuICAgIHRoaXMudGhyb3dFcnJvcklmV3JhcHBlcnNJc0VtcHR5KCdzZXRWYWx1ZScpXG5cbiAgICB0aGlzLndyYXBwZXJzLmZvckVhY2god3JhcHBlciA9PiB3cmFwcGVyLnNldFZhbHVlKHZhbHVlKSlcbiAgfVxuXG4gIHNldENoZWNrZWQgKGNoZWNrZWQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgnc2V0Q2hlY2tlZCcpXG5cbiAgICB0aGlzLndyYXBwZXJzLmZvckVhY2god3JhcHBlciA9PiB3cmFwcGVyLnNldENoZWNrZWQoY2hlY2tlZCkpXG4gIH1cblxuICBzZXRTZWxlY3RlZCAoKTogdm9pZCB7XG4gICAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ3NldFNlbGVjdGVkJylcblxuICAgIHRocm93RXJyb3IoJ3NldFNlbGVjdGVkIG11c3QgYmUgY2FsbGVkIG9uIGEgc2luZ2xlIHdyYXBwZXIsIHVzZSBhdChpKSB0byBhY2Nlc3MgYSB3cmFwcGVyJylcbiAgfVxuXG4gIHRyaWdnZXIgKGV2ZW50OiBzdHJpbmcsIG9wdGlvbnM6IE9iamVjdCk6IHZvaWQge1xuICAgIHRoaXMudGhyb3dFcnJvcklmV3JhcHBlcnNJc0VtcHR5KCd0cmlnZ2VyJylcblxuICAgIHRoaXMud3JhcHBlcnMuZm9yRWFjaCh3cmFwcGVyID0+IHdyYXBwZXIudHJpZ2dlcihldmVudCwgb3B0aW9ucykpXG4gIH1cblxuICB1cGRhdGUgKCk6IHZvaWQge1xuICAgIHRoaXMudGhyb3dFcnJvcklmV3JhcHBlcnNJc0VtcHR5KCd1cGRhdGUnKVxuICAgIHdhcm4oJ3VwZGF0ZSBoYXMgYmVlbiByZW1vdmVkLiBBbGwgY2hhbmdlcyBhcmUgbm93IHN5bmNocm5vdXMgd2l0aG91dCBjYWxsaW5nIHVwZGF0ZScpXG4gIH1cblxuICBkZXN0cm95ICgpOiB2b2lkIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgnZGVzdHJveScpXG5cbiAgICB0aGlzLndyYXBwZXJzLmZvckVhY2god3JhcHBlciA9PiB3cmFwcGVyLmRlc3Ryb3koKSlcbiAgfVxufVxuIiwiLy8gQGZsb3dcblxuaW1wb3J0IHsgdGhyb3dFcnJvciB9IGZyb20gJ3NoYXJlZC91dGlsJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFcnJvcldyYXBwZXIgaW1wbGVtZW50cyBCYXNlV3JhcHBlciB7XG4gIHNlbGVjdG9yOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IgKHNlbGVjdG9yOiBzdHJpbmcpIHtcbiAgICB0aGlzLnNlbGVjdG9yID0gc2VsZWN0b3JcbiAgfVxuXG4gIGF0ICgpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKGBmaW5kIGRpZCBub3QgcmV0dXJuICR7dGhpcy5zZWxlY3Rvcn0sIGNhbm5vdCBjYWxsIGF0KCkgb24gZW1wdHkgV3JhcHBlcmApXG4gIH1cblxuICBhdHRyaWJ1dGVzICgpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKGBmaW5kIGRpZCBub3QgcmV0dXJuICR7dGhpcy5zZWxlY3Rvcn0sIGNhbm5vdCBjYWxsIGF0dHJpYnV0ZXMoKSBvbiBlbXB0eSBXcmFwcGVyYClcbiAgfVxuXG4gIGNsYXNzZXMgKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoYGZpbmQgZGlkIG5vdCByZXR1cm4gJHt0aGlzLnNlbGVjdG9yfSwgY2Fubm90IGNhbGwgY2xhc3NlcygpIG9uIGVtcHR5IFdyYXBwZXJgKVxuICB9XG5cbiAgY29udGFpbnMgKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoYGZpbmQgZGlkIG5vdCByZXR1cm4gJHt0aGlzLnNlbGVjdG9yfSwgY2Fubm90IGNhbGwgY29udGFpbnMoKSBvbiBlbXB0eSBXcmFwcGVyYClcbiAgfVxuXG4gIGVtaXR0ZWQgKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoYGZpbmQgZGlkIG5vdCByZXR1cm4gJHt0aGlzLnNlbGVjdG9yfSwgY2Fubm90IGNhbGwgZW1pdHRlZCgpIG9uIGVtcHR5IFdyYXBwZXJgKVxuICB9XG5cbiAgZW1pdHRlZEJ5T3JkZXIgKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoYGZpbmQgZGlkIG5vdCByZXR1cm4gJHt0aGlzLnNlbGVjdG9yfSwgY2Fubm90IGNhbGwgZW1pdHRlZEJ5T3JkZXIoKSBvbiBlbXB0eSBXcmFwcGVyYClcbiAgfVxuXG4gIGV4aXN0cyAoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICBmaWx0ZXIgKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoYGZpbmQgZGlkIG5vdCByZXR1cm4gJHt0aGlzLnNlbGVjdG9yfSwgY2Fubm90IGNhbGwgZmlsdGVyKCkgb24gZW1wdHkgV3JhcHBlcmApXG4gIH1cblxuICB2aXNpYmxlICgpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKGBmaW5kIGRpZCBub3QgcmV0dXJuICR7dGhpcy5zZWxlY3Rvcn0sIGNhbm5vdCBjYWxsIHZpc2libGUoKSBvbiBlbXB0eSBXcmFwcGVyYClcbiAgfVxuXG4gIGhhc0F0dHJpYnV0ZSAoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihgZmluZCBkaWQgbm90IHJldHVybiAke3RoaXMuc2VsZWN0b3J9LCBjYW5ub3QgY2FsbCBoYXNBdHRyaWJ1dGUoKSBvbiBlbXB0eSBXcmFwcGVyYClcbiAgfVxuXG4gIGhhc0NsYXNzICgpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKGBmaW5kIGRpZCBub3QgcmV0dXJuICR7dGhpcy5zZWxlY3Rvcn0sIGNhbm5vdCBjYWxsIGhhc0NsYXNzKCkgb24gZW1wdHkgV3JhcHBlcmApXG4gIH1cblxuICBoYXNQcm9wICgpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKGBmaW5kIGRpZCBub3QgcmV0dXJuICR7dGhpcy5zZWxlY3Rvcn0sIGNhbm5vdCBjYWxsIGhhc1Byb3AoKSBvbiBlbXB0eSBXcmFwcGVyYClcbiAgfVxuXG4gIGhhc1N0eWxlICgpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKGBmaW5kIGRpZCBub3QgcmV0dXJuICR7dGhpcy5zZWxlY3Rvcn0sIGNhbm5vdCBjYWxsIGhhc1N0eWxlKCkgb24gZW1wdHkgV3JhcHBlcmApXG4gIH1cblxuICBmaW5kQWxsICgpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKGBmaW5kIGRpZCBub3QgcmV0dXJuICR7dGhpcy5zZWxlY3Rvcn0sIGNhbm5vdCBjYWxsIGZpbmRBbGwoKSBvbiBlbXB0eSBXcmFwcGVyYClcbiAgfVxuXG4gIGZpbmQgKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoYGZpbmQgZGlkIG5vdCByZXR1cm4gJHt0aGlzLnNlbGVjdG9yfSwgY2Fubm90IGNhbGwgZmluZCgpIG9uIGVtcHR5IFdyYXBwZXJgKVxuICB9XG5cbiAgaHRtbCAoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihgZmluZCBkaWQgbm90IHJldHVybiAke3RoaXMuc2VsZWN0b3J9LCBjYW5ub3QgY2FsbCBodG1sKCkgb24gZW1wdHkgV3JhcHBlcmApXG4gIH1cblxuICBpcyAoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihgZmluZCBkaWQgbm90IHJldHVybiAke3RoaXMuc2VsZWN0b3J9LCBjYW5ub3QgY2FsbCBpcygpIG9uIGVtcHR5IFdyYXBwZXJgKVxuICB9XG5cbiAgaXNFbXB0eSAoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihgZmluZCBkaWQgbm90IHJldHVybiAke3RoaXMuc2VsZWN0b3J9LCBjYW5ub3QgY2FsbCBpc0VtcHR5KCkgb24gZW1wdHkgV3JhcHBlcmApXG4gIH1cblxuICBpc1Zpc2libGUgKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoYGZpbmQgZGlkIG5vdCByZXR1cm4gJHt0aGlzLnNlbGVjdG9yfSwgY2Fubm90IGNhbGwgaXNWaXNpYmxlKCkgb24gZW1wdHkgV3JhcHBlcmApXG4gIH1cblxuICBpc1Z1ZUluc3RhbmNlICgpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKGBmaW5kIGRpZCBub3QgcmV0dXJuICR7dGhpcy5zZWxlY3Rvcn0sIGNhbm5vdCBjYWxsIGlzVnVlSW5zdGFuY2UoKSBvbiBlbXB0eSBXcmFwcGVyYClcbiAgfVxuXG4gIG5hbWUgKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoYGZpbmQgZGlkIG5vdCByZXR1cm4gJHt0aGlzLnNlbGVjdG9yfSwgY2Fubm90IGNhbGwgbmFtZSgpIG9uIGVtcHR5IFdyYXBwZXJgKVxuICB9XG5cbiAgcHJvcHMgKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoYGZpbmQgZGlkIG5vdCByZXR1cm4gJHt0aGlzLnNlbGVjdG9yfSwgY2Fubm90IGNhbGwgcHJvcHMoKSBvbiBlbXB0eSBXcmFwcGVyYClcbiAgfVxuXG4gIHRleHQgKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoYGZpbmQgZGlkIG5vdCByZXR1cm4gJHt0aGlzLnNlbGVjdG9yfSwgY2Fubm90IGNhbGwgdGV4dCgpIG9uIGVtcHR5IFdyYXBwZXJgKVxuICB9XG5cbiAgc2V0Q29tcHV0ZWQgKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoYGZpbmQgZGlkIG5vdCByZXR1cm4gJHt0aGlzLnNlbGVjdG9yfSwgY2Fubm90IGNhbGwgc2V0Q29tcHV0ZWQoKSBvbiBlbXB0eSBXcmFwcGVyYClcbiAgfVxuXG4gIHNldERhdGEgKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoYGZpbmQgZGlkIG5vdCByZXR1cm4gJHt0aGlzLnNlbGVjdG9yfSwgY2Fubm90IGNhbGwgc2V0RGF0YSgpIG9uIGVtcHR5IFdyYXBwZXJgKVxuICB9XG5cbiAgc2V0TWV0aG9kcyAoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihgZmluZCBkaWQgbm90IHJldHVybiAke3RoaXMuc2VsZWN0b3J9LCBjYW5ub3QgY2FsbCBzZXRNZXRob2RzKCkgb24gZW1wdHkgV3JhcHBlcmApXG4gIH1cblxuICBzZXRQcm9wcyAoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihgZmluZCBkaWQgbm90IHJldHVybiAke3RoaXMuc2VsZWN0b3J9LCBjYW5ub3QgY2FsbCBzZXRQcm9wcygpIG9uIGVtcHR5IFdyYXBwZXJgKVxuICB9XG5cbiAgc2V0VmFsdWUgKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoYGZpbmQgZGlkIG5vdCByZXR1cm4gJHt0aGlzLnNlbGVjdG9yfSwgY2Fubm90IGNhbGwgc2V0VmFsdWUoKSBvbiBlbXB0eSBXcmFwcGVyYClcbiAgfVxuXG4gIHNldENoZWNrZWQgKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoYGZpbmQgZGlkIG5vdCByZXR1cm4gJHt0aGlzLnNlbGVjdG9yfSwgY2Fubm90IGNhbGwgc2V0Q2hlY2tlZCgpIG9uIGVtcHR5IFdyYXBwZXJgKVxuICB9XG5cbiAgc2V0U2VsZWN0ZWQgKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoYGZpbmQgZGlkIG5vdCByZXR1cm4gJHt0aGlzLnNlbGVjdG9yfSwgY2Fubm90IGNhbGwgc2V0U2VsZWN0ZWQoKSBvbiBlbXB0eSBXcmFwcGVyYClcbiAgfVxuXG4gIHRyaWdnZXIgKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoYGZpbmQgZGlkIG5vdCByZXR1cm4gJHt0aGlzLnNlbGVjdG9yfSwgY2Fubm90IGNhbGwgdHJpZ2dlcigpIG9uIGVtcHR5IFdyYXBwZXJgKVxuICB9XG5cbiAgdXBkYXRlICgpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKGB1cGRhdGUgaGFzIGJlZW4gcmVtb3ZlZCBmcm9tIHZ1ZS10ZXN0LXV0aWxzLiBBbGwgdXBkYXRlcyBhcmUgbm93IHN5bmNocm9ub3VzIGJ5IGRlZmF1bHRgKVxuICB9XG5cbiAgZGVzdHJveSAoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihgZmluZCBkaWQgbm90IHJldHVybiAke3RoaXMuc2VsZWN0b3J9LCBjYW5ub3QgY2FsbCBkZXN0cm95KCkgb24gZW1wdHkgV3JhcHBlcmApXG4gIH1cbn1cbiIsIi8vIEBmbG93XG5cbmltcG9ydCB7XG4gIFJFRl9TRUxFQ1RPUlxufSBmcm9tICcuL2NvbnN0cydcbmltcG9ydCB7XG4gIHRocm93RXJyb3Jcbn0gZnJvbSAnc2hhcmVkL3V0aWwnXG5cbmZ1bmN0aW9uIGZpbmRBbGxWTm9kZXMgKHZub2RlOiBWTm9kZSwgbm9kZXM6IEFycmF5PFZOb2RlPiA9IFtdKTogQXJyYXk8Vk5vZGU+IHtcbiAgbm9kZXMucHVzaCh2bm9kZSlcblxuICBpZiAoQXJyYXkuaXNBcnJheSh2bm9kZS5jaGlsZHJlbikpIHtcbiAgICB2bm9kZS5jaGlsZHJlbi5mb3JFYWNoKChjaGlsZFZOb2RlKSA9PiB7XG4gICAgICBmaW5kQWxsVk5vZGVzKGNoaWxkVk5vZGUsIG5vZGVzKVxuICAgIH0pXG4gIH1cblxuICBpZiAodm5vZGUuY2hpbGQpIHtcbiAgICBmaW5kQWxsVk5vZGVzKHZub2RlLmNoaWxkLl92bm9kZSwgbm9kZXMpXG4gIH1cblxuICByZXR1cm4gbm9kZXNcbn1cblxuZnVuY3Rpb24gcmVtb3ZlRHVwbGljYXRlTm9kZXMgKHZOb2RlczogQXJyYXk8Vk5vZGU+KTogQXJyYXk8Vk5vZGU+IHtcbiAgY29uc3Qgdk5vZGVFbG1zID0gdk5vZGVzLm1hcCh2Tm9kZSA9PiB2Tm9kZS5lbG0pXG4gIHJldHVybiB2Tm9kZXMuZmlsdGVyKCh2Tm9kZSwgaW5kZXgpID0+IGluZGV4ID09PSB2Tm9kZUVsbXMuaW5kZXhPZih2Tm9kZS5lbG0pKVxufVxuXG5mdW5jdGlvbiBub2RlTWF0Y2hlc1JlZiAobm9kZTogVk5vZGUsIHJlZk5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gbm9kZS5kYXRhICYmIG5vZGUuZGF0YS5yZWYgPT09IHJlZk5hbWVcbn1cblxuZnVuY3Rpb24gZmluZFZOb2Rlc0J5UmVmICh2Tm9kZTogVk5vZGUsIHJlZk5hbWU6IHN0cmluZyk6IEFycmF5PFZOb2RlPiB7XG4gIGNvbnN0IG5vZGVzID0gZmluZEFsbFZOb2Rlcyh2Tm9kZSlcbiAgY29uc3QgcmVmRmlsdGVyZWROb2RlcyA9IG5vZGVzLmZpbHRlcihub2RlID0+IG5vZGVNYXRjaGVzUmVmKG5vZGUsIHJlZk5hbWUpKVxuICAvLyBPbmx5IHJldHVybiByZWZzIGRlZmluZWQgb24gdG9wLWxldmVsIFZOb2RlIHRvIHByb3ZpZGUgdGhlIHNhbWVcbiAgLy8gYmVoYXZpb3IgYXMgc2VsZWN0aW5nIHZpYSB2bS4kcmVmLntzb21lUmVmTmFtZX1cbiAgY29uc3QgbWFpblZOb2RlRmlsdGVyZWROb2RlcyA9IHJlZkZpbHRlcmVkTm9kZXMuZmlsdGVyKG5vZGUgPT4gKFxuICAgICEhdk5vZGUuY29udGV4dC4kcmVmc1tub2RlLmRhdGEucmVmXVxuICApKVxuICByZXR1cm4gcmVtb3ZlRHVwbGljYXRlTm9kZXMobWFpblZOb2RlRmlsdGVyZWROb2Rlcylcbn1cblxuZnVuY3Rpb24gbm9kZU1hdGNoZXNTZWxlY3RvciAobm9kZTogVk5vZGUsIHNlbGVjdG9yOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIG5vZGUuZWxtICYmIG5vZGUuZWxtLmdldEF0dHJpYnV0ZSAmJiBub2RlLmVsbS5tYXRjaGVzKHNlbGVjdG9yKVxufVxuXG5mdW5jdGlvbiBmaW5kVk5vZGVzQnlTZWxlY3RvciAoXG4gIHZOb2RlOiBWTm9kZSxcbiAgc2VsZWN0b3I6IHN0cmluZ1xuKTogQXJyYXk8Vk5vZGU+IHtcbiAgY29uc3Qgbm9kZXMgPSBmaW5kQWxsVk5vZGVzKHZOb2RlKVxuICBjb25zdCBmaWx0ZXJlZE5vZGVzID0gbm9kZXMuZmlsdGVyKG5vZGUgPT4gKFxuICAgIG5vZGVNYXRjaGVzU2VsZWN0b3Iobm9kZSwgc2VsZWN0b3IpXG4gICkpXG4gIHJldHVybiByZW1vdmVEdXBsaWNhdGVOb2RlcyhmaWx0ZXJlZE5vZGVzKVxufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBmaW5kVm5vZGVzIChcbiAgdm5vZGU6IFZOb2RlLFxuICB2bTogQ29tcG9uZW50IHwgbnVsbCxcbiAgc2VsZWN0b3JUeXBlOiA/c3RyaW5nLFxuICBzZWxlY3RvcjogT2JqZWN0IHwgc3RyaW5nXG4pOiBBcnJheTxWTm9kZT4ge1xuICBpZiAoc2VsZWN0b3JUeXBlID09PSBSRUZfU0VMRUNUT1IpIHtcbiAgICBpZiAoIXZtKSB7XG4gICAgICB0aHJvd0Vycm9yKCckcmVmIHNlbGVjdG9ycyBjYW4gb25seSBiZSB1c2VkIG9uIFZ1ZSBjb21wb25lbnQgd3JhcHBlcnMnKVxuICAgIH1cbiAgICAvLyAkRmxvd0lnbm9yZVxuICAgIHJldHVybiBmaW5kVk5vZGVzQnlSZWYodm5vZGUsIHNlbGVjdG9yLnJlZilcbiAgfVxuICAvLyAkRmxvd0lnbm9yZVxuICByZXR1cm4gZmluZFZOb2Rlc0J5U2VsZWN0b3Iodm5vZGUsIHNlbGVjdG9yKVxufVxuIiwiLy8gQGZsb3dcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZmluZERPTU5vZGVzIChcbiAgZWxlbWVudDogRWxlbWVudCB8IG51bGwsXG4gIHNlbGVjdG9yOiBzdHJpbmdcbik6IEFycmF5PFZOb2RlPiB7XG4gIGNvbnN0IG5vZGVzID0gW11cbiAgaWYgKCFlbGVtZW50IHx8ICFlbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwgfHwgIWVsZW1lbnQubWF0Y2hlcykge1xuICAgIHJldHVybiBub2Rlc1xuICB9XG5cbiAgaWYgKGVsZW1lbnQubWF0Y2hlcyhzZWxlY3RvcikpIHtcbiAgICBub2Rlcy5wdXNoKGVsZW1lbnQpXG4gIH1cbiAgLy8gJEZsb3dJZ25vcmVcbiAgcmV0dXJuIG5vZGVzLmNvbmNhdChbXS5zbGljZS5jYWxsKGVsZW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcikpKVxufVxuIiwiLy8gQGZsb3dcblxuaW1wb3J0IGZpbmRWbm9kZXMgZnJvbSAnLi9maW5kLXZub2RlcydcbmltcG9ydCBmaW5kVnVlQ29tcG9uZW50cyBmcm9tICcuL2ZpbmQtdnVlLWNvbXBvbmVudHMnXG5pbXBvcnQgZmluZERPTU5vZGVzIGZyb20gJy4vZmluZC1kb20tbm9kZXMnXG5pbXBvcnQge1xuICBDT01QT05FTlRfU0VMRUNUT1IsXG4gIE5BTUVfU0VMRUNUT1IsXG4gIERPTV9TRUxFQ1RPUlxufSBmcm9tICcuL2NvbnN0cydcbmltcG9ydCBWdWUgZnJvbSAndnVlJ1xuaW1wb3J0IGdldFNlbGVjdG9yVHlwZU9yVGhyb3cgZnJvbSAnLi9nZXQtc2VsZWN0b3ItdHlwZSdcbmltcG9ydCB7IHRocm93RXJyb3IgfSBmcm9tICdzaGFyZWQvdXRpbCdcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZmluZCAoXG4gIHZtOiBDb21wb25lbnQgfCBudWxsLFxuICB2bm9kZTogVk5vZGUgfCBudWxsLFxuICBlbGVtZW50OiBFbGVtZW50LFxuICBzZWxlY3RvcjogU2VsZWN0b3Jcbik6IEFycmF5PFZOb2RlIHwgQ29tcG9uZW50PiB7XG4gIGNvbnN0IHNlbGVjdG9yVHlwZSA9IGdldFNlbGVjdG9yVHlwZU9yVGhyb3coc2VsZWN0b3IsICdmaW5kJylcblxuICBpZiAoIXZub2RlICYmICF2bSAmJiBzZWxlY3RvclR5cGUgIT09IERPTV9TRUxFQ1RPUikge1xuICAgIHRocm93RXJyb3IoJ2Nhbm5vdCBmaW5kIGEgVnVlIGluc3RhbmNlIG9uIGEgRE9NIG5vZGUuIFRoZSBub2RlIHlvdSBhcmUgY2FsbGluZyBmaW5kIG9uIGRvZXMgbm90IGV4aXN0IGluIHRoZSBWRG9tLiBBcmUgeW91IGFkZGluZyB0aGUgbm9kZSBhcyBpbm5lckhUTUw/JylcbiAgfVxuXG4gIGlmIChzZWxlY3RvclR5cGUgPT09IENPTVBPTkVOVF9TRUxFQ1RPUiB8fCBzZWxlY3RvclR5cGUgPT09IE5BTUVfU0VMRUNUT1IpIHtcbiAgICBjb25zdCByb290ID0gdm0gfHwgdm5vZGVcbiAgICBpZiAoIXJvb3QpIHtcbiAgICAgIHJldHVybiBbXVxuICAgIH1cbiAgICByZXR1cm4gZmluZFZ1ZUNvbXBvbmVudHMocm9vdCwgc2VsZWN0b3JUeXBlLCBzZWxlY3RvcilcbiAgfVxuXG4gIGlmICh2bSAmJiB2bS4kcmVmcyAmJiBzZWxlY3Rvci5yZWYgaW4gdm0uJHJlZnMgJiYgdm0uJHJlZnNbc2VsZWN0b3IucmVmXSBpbnN0YW5jZW9mIFZ1ZSkge1xuICAgIHJldHVybiBbdm0uJHJlZnNbc2VsZWN0b3IucmVmXV1cbiAgfVxuXG4gIGlmICh2bm9kZSkge1xuICAgIGNvbnN0IG5vZGVzID0gZmluZFZub2Rlcyh2bm9kZSwgdm0sIHNlbGVjdG9yVHlwZSwgc2VsZWN0b3IpXG4gICAgaWYgKHNlbGVjdG9yVHlwZSAhPT0gRE9NX1NFTEVDVE9SKSB7XG4gICAgICByZXR1cm4gbm9kZXNcbiAgICB9XG4gICAgcmV0dXJuIG5vZGVzLmxlbmd0aCA+IDAgPyBub2RlcyA6IGZpbmRET01Ob2RlcyhlbGVtZW50LCBzZWxlY3RvcilcbiAgfVxuXG4gIHJldHVybiBmaW5kRE9NTm9kZXMoZWxlbWVudCwgc2VsZWN0b3IpXG59XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgVnVlIGZyb20gJ3Z1ZSdcbmltcG9ydCBXcmFwcGVyIGZyb20gJy4vd3JhcHBlcidcbmltcG9ydCBWdWVXcmFwcGVyIGZyb20gJy4vdnVlLXdyYXBwZXInXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNyZWF0ZVdyYXBwZXIgKFxuICBub2RlOiBWTm9kZSB8IENvbXBvbmVudCxcbiAgb3B0aW9uczogV3JhcHBlck9wdGlvbnNcbikge1xuICByZXR1cm4gbm9kZSBpbnN0YW5jZW9mIFZ1ZVxuICAgID8gbmV3IFZ1ZVdyYXBwZXIobm9kZSwgb3B0aW9ucylcbiAgICA6IG5ldyBXcmFwcGVyKG5vZGUsIG9wdGlvbnMpXG59XG4iLCJsZXQgaSA9IDBcblxuZnVuY3Rpb24gb3JkZXJEZXBzICh3YXRjaGVyKSB7XG4gIHdhdGNoZXIuZGVwcy5mb3JFYWNoKGRlcCA9PiB7XG4gICAgaWYgKGRlcC5fc29ydGVkSWQgPT09IGkpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBkZXAuX3NvcnRlZElkID0gaVxuICAgIGRlcC5zdWJzLmZvckVhY2gob3JkZXJEZXBzKVxuICAgIGRlcC5zdWJzID0gZGVwLnN1YnMuc29ydCgoYSwgYikgPT4gYS5pZCAtIGIuaWQpXG4gIH0pXG59XG5cbmZ1bmN0aW9uIG9yZGVyVm1XYXRjaGVycyAodm0pIHtcbiAgaWYgKHZtLl93YXRjaGVycykge1xuICAgIHZtLl93YXRjaGVycy5mb3JFYWNoKG9yZGVyRGVwcylcbiAgfVxuXG4gIGlmICh2bS5fY29tcHV0ZWRXYXRjaGVycykge1xuICAgIE9iamVjdC5rZXlzKHZtLl9jb21wdXRlZFdhdGNoZXJzKS5mb3JFYWNoKChjb21wdXRlZFdhdGNoZXIpID0+IHtcbiAgICAgIG9yZGVyRGVwcyh2bS5fY29tcHV0ZWRXYXRjaGVyc1tjb21wdXRlZFdhdGNoZXJdKVxuICAgIH0pXG4gIH1cblxuICB2bS5fd2F0Y2hlciAmJiBvcmRlckRlcHModm0uX3dhdGNoZXIpXG5cbiAgdm0uJGNoaWxkcmVuLmZvckVhY2gob3JkZXJWbVdhdGNoZXJzKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gb3JkZXJXYXRjaGVycyAodm0pIHtcbiAgb3JkZXJWbVdhdGNoZXJzKHZtKVxuICBpKytcbn1cbiIsIi8vIEBmbG93XG5cbmltcG9ydCBWdWUgZnJvbSAndnVlJ1xuaW1wb3J0IG1lcmdlV2l0aCBmcm9tICdsb2Rhc2gvbWVyZ2VXaXRoJ1xuaW1wb3J0IGdldFNlbGVjdG9yVHlwZU9yVGhyb3cgZnJvbSAnLi9nZXQtc2VsZWN0b3ItdHlwZSdcbmltcG9ydCB7XG4gIFJFRl9TRUxFQ1RPUixcbiAgQ09NUE9ORU5UX1NFTEVDVE9SLFxuICBOQU1FX1NFTEVDVE9SLFxuICBGVU5DVElPTkFMX09QVElPTlNcbn0gZnJvbSAnLi9jb25zdHMnXG5pbXBvcnQge1xuICB2bUN0b3JNYXRjaGVzTmFtZSxcbiAgdm1DdG9yTWF0Y2hlc1NlbGVjdG9yLFxuICB2bUZ1bmN0aW9uYWxDdG9yTWF0Y2hlc1NlbGVjdG9yXG59IGZyb20gJy4vZmluZC12dWUtY29tcG9uZW50cydcbmltcG9ydCBXcmFwcGVyQXJyYXkgZnJvbSAnLi93cmFwcGVyLWFycmF5J1xuaW1wb3J0IEVycm9yV3JhcHBlciBmcm9tICcuL2Vycm9yLXdyYXBwZXInXG5pbXBvcnQge1xuICB0aHJvd0Vycm9yLFxuICB3YXJuXG59IGZyb20gJ3NoYXJlZC91dGlsJ1xuaW1wb3J0IGZpbmRBbGwgZnJvbSAnLi9maW5kJ1xuaW1wb3J0IGNyZWF0ZVdyYXBwZXIgZnJvbSAnLi9jcmVhdGUtd3JhcHBlcidcbmltcG9ydCB7XG4gIG9yZGVyV2F0Y2hlcnNcbn0gZnJvbSAnLi9vcmRlci13YXRjaGVycydcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgV3JhcHBlciBpbXBsZW1lbnRzIEJhc2VXcmFwcGVyIHtcbiAgdm5vZGU6IFZOb2RlIHwgbnVsbDtcbiAgdm06IENvbXBvbmVudCB8IG51bGw7XG4gIF9lbWl0dGVkOiB7IFtuYW1lOiBzdHJpbmddOiBBcnJheTxBcnJheTxhbnk+PiB9O1xuICBfZW1pdHRlZEJ5T3JkZXI6IEFycmF5PHsgbmFtZTogc3RyaW5nOyBhcmdzOiBBcnJheTxhbnk+IH0+O1xuICBpc1ZtOiBib29sZWFuO1xuICBlbGVtZW50OiBFbGVtZW50O1xuICB1cGRhdGU6IEZ1bmN0aW9uO1xuICBvcHRpb25zOiBXcmFwcGVyT3B0aW9ucztcbiAgdmVyc2lvbjogbnVtYmVyO1xuICBpc0Z1bmN0aW9uYWxDb21wb25lbnQ6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IgKG5vZGU6IFZOb2RlIHwgRWxlbWVudCwgb3B0aW9uczogV3JhcHBlck9wdGlvbnMpIHtcbiAgICBpZiAobm9kZSBpbnN0YW5jZW9mIEVsZW1lbnQpIHtcbiAgICAgIHRoaXMuZWxlbWVudCA9IG5vZGVcbiAgICAgIHRoaXMudm5vZGUgPSBudWxsXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudm5vZGUgPSBub2RlXG4gICAgICB0aGlzLmVsZW1lbnQgPSBub2RlLmVsbVxuICAgIH1cbiAgICBpZiAodGhpcy52bm9kZSAmJiAodGhpcy52bm9kZVtGVU5DVElPTkFMX09QVElPTlNdIHx8IHRoaXMudm5vZGUuZnVuY3Rpb25hbENvbnRleHQpKSB7XG4gICAgICB0aGlzLmlzRnVuY3Rpb25hbENvbXBvbmVudCA9IHRydWVcbiAgICB9XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9uc1xuICAgIHRoaXMudmVyc2lvbiA9IE51bWJlcihgJHtWdWUudmVyc2lvbi5zcGxpdCgnLicpWzBdfS4ke1Z1ZS52ZXJzaW9uLnNwbGl0KCcuJylbMV19YClcbiAgfVxuXG4gIGF0ICgpIHtcbiAgICB0aHJvd0Vycm9yKCdhdCgpIG11c3QgYmUgY2FsbGVkIG9uIGEgV3JhcHBlckFycmF5JylcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIE9iamVjdCBjb250YWluaW5nIGFsbCB0aGUgYXR0cmlidXRlL3ZhbHVlIHBhaXJzIG9uIHRoZSBlbGVtZW50LlxuICAgKi9cbiAgYXR0cmlidXRlcyAoKTogeyBbbmFtZTogc3RyaW5nXTogc3RyaW5nIH0ge1xuICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSB0aGlzLmVsZW1lbnQuYXR0cmlidXRlc1xuICAgIGNvbnN0IGF0dHJpYnV0ZU1hcCA9IHt9XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhdHRyaWJ1dGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBhdHQgPSBhdHRyaWJ1dGVzLml0ZW0oaSlcbiAgICAgIGF0dHJpYnV0ZU1hcFthdHQubG9jYWxOYW1lXSA9IGF0dC52YWx1ZVxuICAgIH1cbiAgICByZXR1cm4gYXR0cmlidXRlTWFwXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiBBcnJheSBjb250YWluaW5nIGFsbCB0aGUgY2xhc3NlcyBvbiB0aGUgZWxlbWVudFxuICAgKi9cbiAgY2xhc3NlcyAoKTogQXJyYXk8c3RyaW5nPiB7XG4gICAgLy8gd29ya3MgZm9yIEhUTUwgRWxlbWVudCBhbmQgU1ZHIEVsZW1lbnRcbiAgICBjb25zdCBjbGFzc05hbWUgPSB0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKCdjbGFzcycpXG4gICAgbGV0IGNsYXNzZXMgPSBjbGFzc05hbWUgPyBjbGFzc05hbWUuc3BsaXQoJyAnKSA6IFtdXG4gICAgLy8gSGFuZGxlIGNvbnZlcnRpbmcgY3NzbW9kdWxlcyBpZGVudGlmaWVycyBiYWNrIHRvIHRoZSBvcmlnaW5hbCBjbGFzcyBuYW1lXG4gICAgaWYgKHRoaXMudm0gJiYgdGhpcy52bS4kc3R5bGUpIHtcbiAgICAgIGNvbnN0IGNzc01vZHVsZUlkZW50aWZpZXJzID0ge31cbiAgICAgIGxldCBtb2R1bGVJZGVudFxuICAgICAgT2JqZWN0LmtleXModGhpcy52bS4kc3R5bGUpLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgICAvLyAkRmxvd0lnbm9yZSA6IEZsb3cgdGhpbmtzIHZtIGlzIGEgcHJvcGVydHlcbiAgICAgICAgbW9kdWxlSWRlbnQgPSB0aGlzLnZtLiRzdHlsZVtrZXldXG4gICAgICAgIC8vIENTUyBNb2R1bGVzIG1heSBiZSBtdWx0aS1jbGFzcyBpZiB0aGV5IGV4dGVuZCBvdGhlcnMuXG4gICAgICAgIC8vIEV4dGVuZGVkIGNsYXNzZXMgc2hvdWxkIGJlIGFscmVhZHkgcHJlc2VudCBpbiAkc3R5bGUuXG4gICAgICAgIG1vZHVsZUlkZW50ID0gbW9kdWxlSWRlbnQuc3BsaXQoJyAnKVswXVxuICAgICAgICBjc3NNb2R1bGVJZGVudGlmaWVyc1ttb2R1bGVJZGVudF0gPSBrZXlcbiAgICAgIH0pXG4gICAgICBjbGFzc2VzID0gY2xhc3Nlcy5tYXAoY2xhc3NOYW1lID0+IGNzc01vZHVsZUlkZW50aWZpZXJzW2NsYXNzTmFtZV0gfHwgY2xhc3NOYW1lKVxuICAgIH1cbiAgICByZXR1cm4gY2xhc3Nlc1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiB3cmFwcGVyIGNvbnRhaW5zIHByb3ZpZGVkIHNlbGVjdG9yLlxuICAgKi9cbiAgY29udGFpbnMgKHNlbGVjdG9yOiBTZWxlY3Rvcikge1xuICAgIGNvbnN0IHNlbGVjdG9yVHlwZSA9IGdldFNlbGVjdG9yVHlwZU9yVGhyb3coc2VsZWN0b3IsICdjb250YWlucycpXG4gICAgY29uc3Qgbm9kZXMgPSBmaW5kQWxsKHRoaXMudm0sIHRoaXMudm5vZGUsIHRoaXMuZWxlbWVudCwgc2VsZWN0b3IpXG4gICAgY29uc3QgaXMgPSBzZWxlY3RvclR5cGUgPT09IFJFRl9TRUxFQ1RPUiA/IGZhbHNlIDogdGhpcy5pcyhzZWxlY3RvcilcbiAgICByZXR1cm4gbm9kZXMubGVuZ3RoID4gMCB8fCBpc1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW4gb2JqZWN0IGNvbnRhaW5pbmcgY3VzdG9tIGV2ZW50cyBlbWl0dGVkIGJ5IHRoZSBXcmFwcGVyIHZtXG4gICAqL1xuICBlbWl0dGVkIChldmVudD86IHN0cmluZykge1xuICAgIGlmICghdGhpcy5fZW1pdHRlZCAmJiAhdGhpcy52bSkge1xuICAgICAgdGhyb3dFcnJvcignd3JhcHBlci5lbWl0dGVkKCkgY2FuIG9ubHkgYmUgY2FsbGVkIG9uIGEgVnVlIGluc3RhbmNlJylcbiAgICB9XG4gICAgaWYgKGV2ZW50KSB7XG4gICAgICByZXR1cm4gdGhpcy5fZW1pdHRlZFtldmVudF1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZWRcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIEFycmF5IGNvbnRhaW5pbmcgY3VzdG9tIGV2ZW50cyBlbWl0dGVkIGJ5IHRoZSBXcmFwcGVyIHZtXG4gICAqL1xuICBlbWl0dGVkQnlPcmRlciAoKSB7XG4gICAgaWYgKCF0aGlzLl9lbWl0dGVkQnlPcmRlciAmJiAhdGhpcy52bSkge1xuICAgICAgdGhyb3dFcnJvcignd3JhcHBlci5lbWl0dGVkQnlPcmRlcigpIGNhbiBvbmx5IGJlIGNhbGxlZCBvbiBhIFZ1ZSBpbnN0YW5jZScpXG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9lbWl0dGVkQnlPcmRlclxuICB9XG5cbiAgLyoqXG4gICAqIFV0aWxpdHkgdG8gY2hlY2sgd3JhcHBlciBleGlzdHMuIFJldHVybnMgdHJ1ZSBhcyBXcmFwcGVyIGFsd2F5cyBleGlzdHNcbiAgICovXG4gIGV4aXN0cyAoKTogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMudm0pIHtcbiAgICAgIHJldHVybiAhIXRoaXMudm0gJiYgIXRoaXMudm0uX2lzRGVzdHJveWVkXG4gICAgfVxuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICBmaWx0ZXIgKCkge1xuICAgIHRocm93RXJyb3IoJ2ZpbHRlcigpIG11c3QgYmUgY2FsbGVkIG9uIGEgV3JhcHBlckFycmF5JylcbiAgfVxuXG4gIC8qKlxuICAgKiBVdGlsaXR5IHRvIGNoZWNrIHdyYXBwZXIgaXMgdmlzaWJsZS4gUmV0dXJucyBmYWxzZSBpZiBhIHBhcmVudCBlbGVtZW50IGhhcyBkaXNwbGF5OiBub25lIG9yIHZpc2liaWxpdHk6IGhpZGRlbiBzdHlsZS5cbiAgICovXG4gIHZpc2libGUgKCk6IGJvb2xlYW4ge1xuICAgIHdhcm4oJ3Zpc2libGUgaGFzIGJlZW4gZGVwcmVjYXRlZCBhbmQgd2lsbCBiZSByZW1vdmVkIGluIHZlcnNpb24gMSwgdXNlIGlzVmlzaWJsZSBpbnN0ZWFkJylcblxuICAgIGxldCBlbGVtZW50ID0gdGhpcy5lbGVtZW50XG5cbiAgICBpZiAoIWVsZW1lbnQpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIHdoaWxlIChlbGVtZW50KSB7XG4gICAgICBpZiAoZWxlbWVudC5zdHlsZSAmJiAoZWxlbWVudC5zdHlsZS52aXNpYmlsaXR5ID09PSAnaGlkZGVuJyB8fCBlbGVtZW50LnN0eWxlLmRpc3BsYXkgPT09ICdub25lJykpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgICBlbGVtZW50ID0gZWxlbWVudC5wYXJlbnRFbGVtZW50XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgd3JhcHBlciBoYXMgYW4gYXR0cmlidXRlIHdpdGggbWF0Y2hpbmcgdmFsdWVcbiAgICovXG4gIGhhc0F0dHJpYnV0ZSAoYXR0cmlidXRlOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpIHtcbiAgICB3YXJuKCdoYXNBdHRyaWJ1dGUoKSBoYXMgYmVlbiBkZXByZWNhdGVkIGFuZCB3aWxsIGJlIHJlbW92ZWQgaW4gdmVyc2lvbiAxLjAuMC4gVXNlIGF0dHJpYnV0ZXMoKSBpbnN0ZWFk4oCUaHR0cHM6Ly92dWUtdGVzdC11dGlscy52dWVqcy5vcmcvZW4vYXBpL3dyYXBwZXIvYXR0cmlidXRlcycpXG5cbiAgICBpZiAodHlwZW9mIGF0dHJpYnV0ZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93RXJyb3IoJ3dyYXBwZXIuaGFzQXR0cmlidXRlKCkgbXVzdCBiZSBwYXNzZWQgYXR0cmlidXRlIGFzIGEgc3RyaW5nJylcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3dFcnJvcignd3JhcHBlci5oYXNBdHRyaWJ1dGUoKSBtdXN0IGJlIHBhc3NlZCB2YWx1ZSBhcyBhIHN0cmluZycpXG4gICAgfVxuXG4gICAgcmV0dXJuICEhKHRoaXMuZWxlbWVudCAmJiB0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKGF0dHJpYnV0ZSkgPT09IHZhbHVlKVxuICB9XG5cbiAgLyoqXG4gICAqIEFzc2VydHMgd3JhcHBlciBoYXMgYSBjbGFzcyBuYW1lXG4gICAqL1xuICBoYXNDbGFzcyAoY2xhc3NOYW1lOiBzdHJpbmcpIHtcbiAgICB3YXJuKCdoYXNDbGFzcygpIGhhcyBiZWVuIGRlcHJlY2F0ZWQgYW5kIHdpbGwgYmUgcmVtb3ZlZCBpbiB2ZXJzaW9uIDEuMC4wLiBVc2UgY2xhc3NlcygpIGluc3RlYWTigJRodHRwczovL3Z1ZS10ZXN0LXV0aWxzLnZ1ZWpzLm9yZy9lbi9hcGkvd3JhcHBlci9jbGFzc2VzJylcbiAgICBsZXQgdGFyZ2V0Q2xhc3MgPSBjbGFzc05hbWVcblxuICAgIGlmICh0eXBlb2YgdGFyZ2V0Q2xhc3MgIT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvd0Vycm9yKCd3cmFwcGVyLmhhc0NsYXNzKCkgbXVzdCBiZSBwYXNzZWQgYSBzdHJpbmcnKVxuICAgIH1cblxuICAgIC8vIGlmICRzdHlsZSBpcyBhdmFpbGFibGUgYW5kIGhhcyBhIG1hdGNoaW5nIHRhcmdldCwgdXNlIHRoYXQgaW5zdGVhZC5cbiAgICBpZiAodGhpcy52bSAmJiB0aGlzLnZtLiRzdHlsZSAmJiB0aGlzLnZtLiRzdHlsZVt0YXJnZXRDbGFzc10pIHtcbiAgICAgIHRhcmdldENsYXNzID0gdGhpcy52bS4kc3R5bGVbdGFyZ2V0Q2xhc3NdXG4gICAgfVxuXG4gICAgY29uc3QgY29udGFpbnNBbGxDbGFzc2VzID0gdGFyZ2V0Q2xhc3NcbiAgICAgIC5zcGxpdCgnICcpXG4gICAgICAuZXZlcnkodGFyZ2V0ID0+IHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnModGFyZ2V0KSlcblxuICAgIHJldHVybiAhISh0aGlzLmVsZW1lbnQgJiYgY29udGFpbnNBbGxDbGFzc2VzKVxuICB9XG5cbiAgLyoqXG4gICAqIEFzc2VydHMgd3JhcHBlciBoYXMgYSBwcm9wIG5hbWVcbiAgICovXG4gIGhhc1Byb3AgKHByb3A6IHN0cmluZywgdmFsdWU6IHN0cmluZykge1xuICAgIHdhcm4oJ2hhc1Byb3AoKSBoYXMgYmVlbiBkZXByZWNhdGVkIGFuZCB3aWxsIGJlIHJlbW92ZWQgaW4gdmVyc2lvbiAxLjAuMC4gVXNlIHByb3BzKCkgaW5zdGVhZOKAlGh0dHBzOi8vdnVlLXRlc3QtdXRpbHMudnVlanMub3JnL2VuL2FwaS93cmFwcGVyL3Byb3BzJylcblxuICAgIGlmICghdGhpcy5pc1Z1ZUluc3RhbmNlKCkpIHtcbiAgICAgIHRocm93RXJyb3IoJ3dyYXBwZXIuaGFzUHJvcCgpIG11c3QgYmUgY2FsbGVkIG9uIGEgVnVlIGluc3RhbmNlJylcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBwcm9wICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3dFcnJvcignd3JhcHBlci5oYXNQcm9wKCkgbXVzdCBiZSBwYXNzZWQgcHJvcCBhcyBhIHN0cmluZycpXG4gICAgfVxuXG4gICAgLy8gJHByb3BzIG9iamVjdCBkb2VzIG5vdCBleGlzdCBpbiBWdWUgMi4xLngsIHNvIHVzZSAkb3B0aW9ucy5wcm9wc0RhdGEgaW5zdGVhZFxuICAgIGlmICh0aGlzLnZtICYmIHRoaXMudm0uJG9wdGlvbnMgJiYgdGhpcy52bS4kb3B0aW9ucy5wcm9wc0RhdGEgJiYgdGhpcy52bS4kb3B0aW9ucy5wcm9wc0RhdGFbcHJvcF0gPT09IHZhbHVlKSB7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cblxuICAgIHJldHVybiAhIXRoaXMudm0gJiYgISF0aGlzLnZtLiRwcm9wcyAmJiB0aGlzLnZtLiRwcm9wc1twcm9wXSA9PT0gdmFsdWVcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgd3JhcHBlciBoYXMgYSBzdHlsZSB3aXRoIHZhbHVlXG4gICAqL1xuICBoYXNTdHlsZSAoc3R5bGU6IHN0cmluZywgdmFsdWU6IHN0cmluZykge1xuICAgIHdhcm4oJ2hhc1N0eWxlKCkgaGFzIGJlZW4gZGVwcmVjYXRlZCBhbmQgd2lsbCBiZSByZW1vdmVkIGluIHZlcnNpb24gMS4wLjAuIFVzZSB3cmFwcGVyLmVsZW1lbnQuc3R5bGUgaW5zdGVhZCcpXG5cbiAgICBpZiAodHlwZW9mIHN0eWxlICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3dFcnJvcignd3JhcHBlci5oYXNTdHlsZSgpIG11c3QgYmUgcGFzc2VkIHN0eWxlIGFzIGEgc3RyaW5nJylcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3dFcnJvcignd3JhcHBlci5oYXNDbGFzcygpIG11c3QgYmUgcGFzc2VkIHZhbHVlIGFzIHN0cmluZycpXG4gICAgfVxuXG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICBpZiAobmF2aWdhdG9yLnVzZXJBZ2VudC5pbmNsdWRlcyAmJiAobmF2aWdhdG9yLnVzZXJBZ2VudC5pbmNsdWRlcygnbm9kZS5qcycpIHx8IG5hdmlnYXRvci51c2VyQWdlbnQuaW5jbHVkZXMoJ2pzZG9tJykpKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ3dyYXBwZXIuaGFzU3R5bGUgaXMgbm90IGZ1bGx5IHN1cHBvcnRlZCB3aGVuIHJ1bm5pbmcganNkb20gLSBvbmx5IGlubGluZSBzdHlsZXMgYXJlIHN1cHBvcnRlZCcpIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29uc29sZVxuICAgIH1cbiAgICBjb25zdCBib2R5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpXG4gICAgY29uc3QgbW9ja0VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuXG4gICAgaWYgKCEoYm9keSBpbnN0YW5jZW9mIEVsZW1lbnQpKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gICAgY29uc3QgbW9ja05vZGUgPSBib2R5Lmluc2VydEJlZm9yZShtb2NrRWxlbWVudCwgbnVsbClcbiAgICAvLyAkRmxvd0lnbm9yZSA6IEZsb3cgdGhpbmtzIHN0eWxlW3N0eWxlXSByZXR1cm5zIGEgbnVtYmVyXG4gICAgbW9ja0VsZW1lbnQuc3R5bGVbc3R5bGVdID0gdmFsdWVcblxuICAgIGlmICghdGhpcy5vcHRpb25zLmF0dGFjaGVkVG9Eb2N1bWVudCAmJiAodGhpcy52bSB8fCB0aGlzLnZub2RlKSkge1xuICAgICAgLy8gJEZsb3dJZ25vcmUgOiBQb3NzaWJsZSBudWxsIHZhbHVlLCB3aWxsIGJlIHJlbW92ZWQgaW4gMS4wLjBcbiAgICAgIGNvbnN0IHZtID0gdGhpcy52bSB8fCB0aGlzLnZub2RlLmNvbnRleHQuJHJvb3RcbiAgICAgIGJvZHkuaW5zZXJ0QmVmb3JlKHZtLiRyb290Ll92bm9kZS5lbG0sIG51bGwpXG4gICAgfVxuXG4gICAgY29uc3QgZWxTdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHRoaXMuZWxlbWVudClbc3R5bGVdXG4gICAgY29uc3QgbW9ja05vZGVTdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKG1vY2tOb2RlKVtzdHlsZV1cbiAgICByZXR1cm4gISEoZWxTdHlsZSAmJiBtb2NrTm9kZVN0eWxlICYmIGVsU3R5bGUgPT09IG1vY2tOb2RlU3R5bGUpXG4gIH1cblxuICAvKipcbiAgICogRmluZHMgZmlyc3Qgbm9kZSBpbiB0cmVlIG9mIHRoZSBjdXJyZW50IHdyYXBwZXIgdGhhdCBtYXRjaGVzIHRoZSBwcm92aWRlZCBzZWxlY3Rvci5cbiAgICovXG4gIGZpbmQgKHNlbGVjdG9yOiBTZWxlY3Rvcik6IFdyYXBwZXIgfCBFcnJvcldyYXBwZXIge1xuICAgIGNvbnN0IG5vZGVzID0gZmluZEFsbCh0aGlzLnZtLCB0aGlzLnZub2RlLCB0aGlzLmVsZW1lbnQsIHNlbGVjdG9yKVxuICAgIGlmIChub2Rlcy5sZW5ndGggPT09IDApIHtcbiAgICAgIGlmIChzZWxlY3Rvci5yZWYpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBFcnJvcldyYXBwZXIoYHJlZj1cIiR7c2VsZWN0b3IucmVmfVwiYClcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgRXJyb3JXcmFwcGVyKHR5cGVvZiBzZWxlY3RvciA9PT0gJ3N0cmluZycgPyBzZWxlY3RvciA6ICdDb21wb25lbnQnKVxuICAgIH1cbiAgICByZXR1cm4gY3JlYXRlV3JhcHBlcihub2Rlc1swXSwgdGhpcy5vcHRpb25zKVxuICB9XG5cbiAgLyoqXG4gICAqIEZpbmRzIG5vZGUgaW4gdHJlZSBvZiB0aGUgY3VycmVudCB3cmFwcGVyIHRoYXQgbWF0Y2hlcyB0aGUgcHJvdmlkZWQgc2VsZWN0b3IuXG4gICAqL1xuICBmaW5kQWxsIChzZWxlY3RvcjogU2VsZWN0b3IpOiBXcmFwcGVyQXJyYXkge1xuICAgIGdldFNlbGVjdG9yVHlwZU9yVGhyb3coc2VsZWN0b3IsICdmaW5kQWxsJylcbiAgICBjb25zdCBub2RlcyA9IGZpbmRBbGwodGhpcy52bSwgdGhpcy52bm9kZSwgdGhpcy5lbGVtZW50LCBzZWxlY3RvcilcbiAgICBjb25zdCB3cmFwcGVycyA9IG5vZGVzLm1hcChub2RlID0+XG4gICAgICBjcmVhdGVXcmFwcGVyKG5vZGUsIHRoaXMub3B0aW9ucylcbiAgICApXG4gICAgcmV0dXJuIG5ldyBXcmFwcGVyQXJyYXkod3JhcHBlcnMpXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBIVE1MIG9mIGVsZW1lbnQgYXMgYSBzdHJpbmdcbiAgICovXG4gIGh0bWwgKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudC5vdXRlckhUTUxcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgbm9kZSBtYXRjaGVzIHNlbGVjdG9yXG4gICAqL1xuICBpcyAoc2VsZWN0b3I6IFNlbGVjdG9yKTogYm9vbGVhbiB7XG4gICAgY29uc3Qgc2VsZWN0b3JUeXBlID0gZ2V0U2VsZWN0b3JUeXBlT3JUaHJvdyhzZWxlY3RvciwgJ2lzJylcblxuICAgIGlmIChzZWxlY3RvclR5cGUgPT09IE5BTUVfU0VMRUNUT1IpIHtcbiAgICAgIGlmICghdGhpcy52bSkge1xuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH1cbiAgICAgIHJldHVybiB2bUN0b3JNYXRjaGVzTmFtZSh0aGlzLnZtLCBzZWxlY3Rvci5uYW1lKVxuICAgIH1cblxuICAgIGlmIChzZWxlY3RvclR5cGUgPT09IENPTVBPTkVOVF9TRUxFQ1RPUikge1xuICAgICAgaWYgKCF0aGlzLnZtKSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgICAgaWYgKHNlbGVjdG9yLmZ1bmN0aW9uYWwpIHtcbiAgICAgICAgcmV0dXJuIHZtRnVuY3Rpb25hbEN0b3JNYXRjaGVzU2VsZWN0b3IodGhpcy52bS5fdm5vZGUsIHNlbGVjdG9yLl9DdG9yKVxuICAgICAgfVxuICAgICAgcmV0dXJuIHZtQ3Rvck1hdGNoZXNTZWxlY3Rvcih0aGlzLnZtLCBzZWxlY3RvcilcbiAgICB9XG5cbiAgICBpZiAoc2VsZWN0b3JUeXBlID09PSBSRUZfU0VMRUNUT1IpIHtcbiAgICAgIHRocm93RXJyb3IoJyRyZWYgc2VsZWN0b3JzIGNhbiBub3QgYmUgdXNlZCB3aXRoIHdyYXBwZXIuaXMoKScpXG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBzZWxlY3RvciA9PT0gJ29iamVjdCcpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIHJldHVybiAhISh0aGlzLmVsZW1lbnQgJiZcbiAgICB0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlICYmXG4gICAgdGhpcy5lbGVtZW50Lm1hdGNoZXMoc2VsZWN0b3IpKVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiBub2RlIGlzIGVtcHR5XG4gICAqL1xuICBpc0VtcHR5ICgpOiBib29sZWFuIHtcbiAgICBpZiAoIXRoaXMudm5vZGUpIHtcbiAgICAgIHJldHVybiB0aGlzLmVsZW1lbnQuaW5uZXJIVE1MID09PSAnJ1xuICAgIH1cbiAgICBpZiAodGhpcy52bm9kZS5jaGlsZHJlbikge1xuICAgICAgcmV0dXJuIHRoaXMudm5vZGUuY2hpbGRyZW4uZXZlcnkodm5vZGUgPT4gdm5vZGUuaXNDb21tZW50KVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy52bm9kZS5jaGlsZHJlbiA9PT0gdW5kZWZpbmVkIHx8IHRoaXMudm5vZGUuY2hpbGRyZW4ubGVuZ3RoID09PSAwXG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIGlmIG5vZGUgaXMgdmlzaWJsZVxuICAgKi9cbiAgaXNWaXNpYmxlICgpOiBib29sZWFuIHtcbiAgICBsZXQgZWxlbWVudCA9IHRoaXMuZWxlbWVudFxuXG4gICAgaWYgKCFlbGVtZW50KSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICB3aGlsZSAoZWxlbWVudCkge1xuICAgICAgaWYgKGVsZW1lbnQuc3R5bGUgJiYgKGVsZW1lbnQuc3R5bGUudmlzaWJpbGl0eSA9PT0gJ2hpZGRlbicgfHwgZWxlbWVudC5zdHlsZS5kaXNwbGF5ID09PSAnbm9uZScpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgICAgZWxlbWVudCA9IGVsZW1lbnQucGFyZW50RWxlbWVudFxuICAgIH1cblxuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIGlmIHdyYXBwZXIgaXMgYSB2dWUgaW5zdGFuY2VcbiAgICovXG4gIGlzVnVlSW5zdGFuY2UgKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhIXRoaXMuaXNWbVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgbmFtZSBvZiBjb21wb25lbnQsIG9yIHRhZyBuYW1lIGlmIG5vZGUgaXMgbm90IGEgVnVlIGNvbXBvbmVudFxuICAgKi9cbiAgbmFtZSAoKTogc3RyaW5nIHtcbiAgICBpZiAodGhpcy52bSkge1xuICAgICAgcmV0dXJuIHRoaXMudm0uJG9wdGlvbnMubmFtZVxuICAgIH1cblxuICAgIGlmICghdGhpcy52bm9kZSkge1xuICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudC50YWdOYW1lXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMudm5vZGUudGFnXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiBPYmplY3QgY29udGFpbmluZyB0aGUgcHJvcCBuYW1lL3ZhbHVlIHBhaXJzIG9uIHRoZSBlbGVtZW50XG4gICAqL1xuICBwcm9wcyAoKTogeyBbbmFtZTogc3RyaW5nXTogYW55IH0ge1xuICAgIGlmICh0aGlzLmlzRnVuY3Rpb25hbENvbXBvbmVudCkge1xuICAgICAgdGhyb3dFcnJvcignd3JhcHBlci5wcm9wcygpIGNhbm5vdCBiZSBjYWxsZWQgb24gYSBtb3VudGVkIGZ1bmN0aW9uYWwgY29tcG9uZW50LicpXG4gICAgfVxuICAgIGlmICghdGhpcy52bSkge1xuICAgICAgdGhyb3dFcnJvcignd3JhcHBlci5wcm9wcygpIG11c3QgYmUgY2FsbGVkIG9uIGEgVnVlIGluc3RhbmNlJylcbiAgICB9XG4gICAgLy8gJHByb3BzIG9iamVjdCBkb2VzIG5vdCBleGlzdCBpbiBWdWUgMi4xLngsIHNvIHVzZSAkb3B0aW9ucy5wcm9wc0RhdGEgaW5zdGVhZFxuICAgIGxldCBfcHJvcHNcbiAgICBpZiAodGhpcy52bSAmJiB0aGlzLnZtLiRvcHRpb25zICYmIHRoaXMudm0uJG9wdGlvbnMucHJvcHNEYXRhKSB7XG4gICAgICBfcHJvcHMgPSB0aGlzLnZtLiRvcHRpb25zLnByb3BzRGF0YVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyAkRmxvd0lnbm9yZVxuICAgICAgX3Byb3BzID0gdGhpcy52bS4kcHJvcHNcbiAgICB9XG4gICAgcmV0dXJuIF9wcm9wcyB8fCB7fSAvLyBSZXR1cm4gYW4gZW1wdHkgb2JqZWN0IGlmIG5vIHByb3BzIGV4aXN0XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB2bSBkYXRhXG4gICAqL1xuICBzZXREYXRhIChkYXRhOiBPYmplY3QpIHtcbiAgICBpZiAodGhpcy5pc0Z1bmN0aW9uYWxDb21wb25lbnQpIHtcbiAgICAgIHRocm93RXJyb3IoJ3dyYXBwZXIuc2V0RGF0YSgpIGNhbm5vdCBiZSBjYWxsZWQgb24gYSBmdW5jdGlvbmFsIGNvbXBvbmVudCcpXG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLnZtKSB7XG4gICAgICB0aHJvd0Vycm9yKCd3cmFwcGVyLnNldERhdGEoKSBjYW4gb25seSBiZSBjYWxsZWQgb24gYSBWdWUgaW5zdGFuY2UnKVxuICAgIH1cblxuICAgIE9iamVjdC5rZXlzKGRhdGEpLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgaWYgKHR5cGVvZiBkYXRhW2tleV0gPT09ICdvYmplY3QnICYmIGRhdGFba2V5XSAhPT0gbnVsbCAmJlxuXHRcdFx0XHRcdFx0IUFycmF5LmlzQXJyYXkoZGF0YVtrZXldKSkge1xuICAgICAgICAvLyAkRmxvd0lnbm9yZSA6IFByb2JsZW0gd2l0aCBwb3NzaWJseSBudWxsIHRoaXMudm1cbiAgICAgICAgY29uc3QgbmV3T2JqID0gbWVyZ2VXaXRoKHRoaXMudm1ba2V5XSwgZGF0YVtrZXldLCAob2JqVmFsdWUsIHNyY1ZhbHVlKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIEFycmF5LmlzQXJyYXkoc3JjVmFsdWUpID8gc3JjVmFsdWUgOiB1bmRlZmluZWRcbiAgICAgICAgfSlcbiAgICAgICAgLy8gJEZsb3dJZ25vcmUgOiBQcm9ibGVtIHdpdGggcG9zc2libHkgbnVsbCB0aGlzLnZtXG4gICAgICAgIHRoaXMudm0uJHNldCh0aGlzLnZtLCBba2V5XSwgbmV3T2JqKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gJEZsb3dJZ25vcmUgOiBQcm9ibGVtIHdpdGggcG9zc2libHkgbnVsbCB0aGlzLnZtXG4gICAgICAgIHRoaXMudm0uJHNldCh0aGlzLnZtLCBba2V5XSwgZGF0YVtrZXldKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogU2V0cyB2bSBjb21wdXRlZFxuICAgKi9cbiAgc2V0Q29tcHV0ZWQgKGNvbXB1dGVkOiBPYmplY3QpIHtcbiAgICBpZiAoIXRoaXMuaXNWdWVJbnN0YW5jZSgpKSB7XG4gICAgICB0aHJvd0Vycm9yKCd3cmFwcGVyLnNldENvbXB1dGVkKCkgY2FuIG9ubHkgYmUgY2FsbGVkIG9uIGEgVnVlIGluc3RhbmNlJylcbiAgICB9XG5cbiAgICB3YXJuKCdzZXRDb21wdXRlZCgpIGhhcyBiZWVuIGRlcHJlY2F0ZWQgYW5kIHdpbGwgYmUgcmVtb3ZlZCBpbiB2ZXJzaW9uIDEuMC4wLiBZb3UgY2FuIG92ZXJ3cml0ZSBjb21wdXRlZCBwcm9wZXJ0aWVzIGJ5IHBhc3NpbmcgYSBjb21wdXRlZCBvYmplY3QgaW4gdGhlIG1vdW50aW5nIG9wdGlvbnMnKVxuXG4gICAgT2JqZWN0LmtleXMoY29tcHV0ZWQpLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgaWYgKHRoaXMudmVyc2lvbiA+IDIuMSkge1xuICAgICAgICAvLyAkRmxvd0lnbm9yZSA6IFByb2JsZW0gd2l0aCBwb3NzaWJseSBudWxsIHRoaXMudm1cbiAgICAgICAgaWYgKCF0aGlzLnZtLl9jb21wdXRlZFdhdGNoZXJzW2tleV0pIHtcbiAgICAgICAgICB0aHJvd0Vycm9yKGB3cmFwcGVyLnNldENvbXB1dGVkKCkgd2FzIHBhc3NlZCBhIHZhbHVlIHRoYXQgZG9lcyBub3QgZXhpc3QgYXMgYSBjb21wdXRlZCBwcm9wZXJ0eSBvbiB0aGUgVnVlIGluc3RhbmNlLiBQcm9wZXJ0eSAke2tleX0gZG9lcyBub3QgZXhpc3Qgb24gdGhlIFZ1ZSBpbnN0YW5jZWApXG4gICAgICAgIH1cbiAgICAgICAgLy8gJEZsb3dJZ25vcmUgOiBQcm9ibGVtIHdpdGggcG9zc2libHkgbnVsbCB0aGlzLnZtXG4gICAgICAgIHRoaXMudm0uX2NvbXB1dGVkV2F0Y2hlcnNba2V5XS52YWx1ZSA9IGNvbXB1dGVkW2tleV1cbiAgICAgICAgLy8gJEZsb3dJZ25vcmUgOiBQcm9ibGVtIHdpdGggcG9zc2libHkgbnVsbCB0aGlzLnZtXG4gICAgICAgIHRoaXMudm0uX2NvbXB1dGVkV2F0Y2hlcnNba2V5XS5nZXR0ZXIgPSAoKSA9PiBjb21wdXRlZFtrZXldXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsZXQgaXNTdG9yZSA9IGZhbHNlXG4gICAgICAgIC8vICRGbG93SWdub3JlIDogUHJvYmxlbSB3aXRoIHBvc3NpYmx5IG51bGwgdGhpcy52bVxuICAgICAgICB0aGlzLnZtLl93YXRjaGVycy5mb3JFYWNoKHdhdGNoZXIgPT4ge1xuICAgICAgICAgIGlmICh3YXRjaGVyLmdldHRlci52dWV4ICYmIGtleSBpbiB3YXRjaGVyLnZtLiRvcHRpb25zLnN0b3JlLmdldHRlcnMpIHtcbiAgICAgICAgICAgIHdhdGNoZXIudm0uJG9wdGlvbnMuc3RvcmUuZ2V0dGVycyA9IHtcbiAgICAgICAgICAgICAgLi4ud2F0Y2hlci52bS4kb3B0aW9ucy5zdG9yZS5nZXR0ZXJzXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkod2F0Y2hlci52bS4kb3B0aW9ucy5zdG9yZS5nZXR0ZXJzLCBrZXksIHsgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiBjb21wdXRlZFtrZXldIH0gfSlcbiAgICAgICAgICAgIGlzU3RvcmUgPSB0cnVlXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuXG4gICAgICAgIC8vICRGbG93SWdub3JlIDogUHJvYmxlbSB3aXRoIHBvc3NpYmx5IG51bGwgdGhpcy52bVxuICAgICAgICBpZiAoIWlzU3RvcmUgJiYgIXRoaXMudm0uX3dhdGNoZXJzLnNvbWUodyA9PiB3LmdldHRlci5uYW1lID09PSBrZXkpKSB7XG4gICAgICAgICAgdGhyb3dFcnJvcihgd3JhcHBlci5zZXRDb21wdXRlZCgpIHdhcyBwYXNzZWQgYSB2YWx1ZSB0aGF0IGRvZXMgbm90IGV4aXN0IGFzIGEgY29tcHV0ZWQgcHJvcGVydHkgb24gdGhlIFZ1ZSBpbnN0YW5jZS4gUHJvcGVydHkgJHtrZXl9IGRvZXMgbm90IGV4aXN0IG9uIHRoZSBWdWUgaW5zdGFuY2VgKVxuICAgICAgICB9XG4gICAgICAgIC8vICRGbG93SWdub3JlIDogUHJvYmxlbSB3aXRoIHBvc3NpYmx5IG51bGwgdGhpcy52bVxuICAgICAgICB0aGlzLnZtLl93YXRjaGVycy5mb3JFYWNoKCh3YXRjaGVyKSA9PiB7XG4gICAgICAgICAgaWYgKHdhdGNoZXIuZ2V0dGVyLm5hbWUgPT09IGtleSkge1xuICAgICAgICAgICAgd2F0Y2hlci52YWx1ZSA9IGNvbXB1dGVkW2tleV1cbiAgICAgICAgICAgIHdhdGNoZXIuZ2V0dGVyID0gKCkgPT4gY29tcHV0ZWRba2V5XVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9KVxuICAgIC8vICRGbG93SWdub3JlIDogUHJvYmxlbSB3aXRoIHBvc3NpYmx5IG51bGwgdGhpcy52bVxuICAgIHRoaXMudm0uX3dhdGNoZXJzLmZvckVhY2goKHdhdGNoZXIpID0+IHtcbiAgICAgIHdhdGNoZXIucnVuKClcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdm0gbWV0aG9kc1xuICAgKi9cbiAgc2V0TWV0aG9kcyAobWV0aG9kczogT2JqZWN0KSB7XG4gICAgaWYgKCF0aGlzLmlzVnVlSW5zdGFuY2UoKSkge1xuICAgICAgdGhyb3dFcnJvcignd3JhcHBlci5zZXRNZXRob2RzKCkgY2FuIG9ubHkgYmUgY2FsbGVkIG9uIGEgVnVlIGluc3RhbmNlJylcbiAgICB9XG4gICAgT2JqZWN0LmtleXMobWV0aG9kcykuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAvLyAkRmxvd0lnbm9yZSA6IFByb2JsZW0gd2l0aCBwb3NzaWJseSBudWxsIHRoaXMudm1cbiAgICAgIHRoaXMudm1ba2V5XSA9IG1ldGhvZHNba2V5XVxuICAgICAgLy8gJEZsb3dJZ25vcmUgOiBQcm9ibGVtIHdpdGggcG9zc2libHkgbnVsbCB0aGlzLnZtXG4gICAgICB0aGlzLnZtLiRvcHRpb25zLm1ldGhvZHNba2V5XSA9IG1ldGhvZHNba2V5XVxuICAgIH0pXG5cbiAgICBpZiAodGhpcy52bm9kZSkge1xuICAgICAgY29uc3QgY29udGV4dCA9IHRoaXMudm5vZGUuY29udGV4dFxuICAgICAgaWYgKGNvbnRleHQuJG9wdGlvbnMucmVuZGVyKSBjb250ZXh0Ll91cGRhdGUoY29udGV4dC5fcmVuZGVyKCkpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdm0gcHJvcHNcbiAgICovXG4gIHNldFByb3BzIChkYXRhOiBPYmplY3QpIHtcbiAgICBpZiAodGhpcy5pc0Z1bmN0aW9uYWxDb21wb25lbnQpIHtcbiAgICAgIHRocm93RXJyb3IoJ3dyYXBwZXIuc2V0UHJvcHMoKSBjYW5ub3QgYmUgY2FsbGVkIG9uIGEgZnVuY3Rpb25hbCBjb21wb25lbnQnKVxuICAgIH1cbiAgICBpZiAoIXRoaXMuaXNWdWVJbnN0YW5jZSgpIHx8ICF0aGlzLnZtKSB7XG4gICAgICB0aHJvd0Vycm9yKCd3cmFwcGVyLnNldFByb3BzKCkgY2FuIG9ubHkgYmUgY2FsbGVkIG9uIGEgVnVlIGluc3RhbmNlJylcbiAgICB9XG4gICAgaWYgKHRoaXMudm0gJiYgdGhpcy52bS4kb3B0aW9ucyAmJiAhdGhpcy52bS4kb3B0aW9ucy5wcm9wc0RhdGEpIHtcbiAgICAgIHRoaXMudm0uJG9wdGlvbnMucHJvcHNEYXRhID0ge31cbiAgICB9XG4gICAgT2JqZWN0LmtleXMoZGF0YSkuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAvLyBJZ25vcmUgcHJvcGVydGllcyB0aGF0IHdlcmUgbm90IHNwZWNpZmllZCBpbiB0aGUgY29tcG9uZW50IG9wdGlvbnNcbiAgICAgIC8vICRGbG93SWdub3JlIDogUHJvYmxlbSB3aXRoIHBvc3NpYmx5IG51bGwgdGhpcy52bVxuICAgICAgaWYgKCF0aGlzLnZtLiRvcHRpb25zLl9wcm9wS2V5cyB8fCAhdGhpcy52bS4kb3B0aW9ucy5fcHJvcEtleXMuc29tZShwcm9wID0+IHByb3AgPT09IGtleSkpIHtcbiAgICAgICAgdGhyb3dFcnJvcihgd3JhcHBlci5zZXRQcm9wcygpIGNhbGxlZCB3aXRoICR7a2V5fSBwcm9wZXJ0eSB3aGljaCBpcyBub3QgZGVmaW5lZCBvbiBjb21wb25lbnRgKVxuICAgICAgfVxuXG4gICAgICAvLyAkRmxvd0lnbm9yZSA6IFByb2JsZW0gd2l0aCBwb3NzaWJseSBudWxsIHRoaXMudm1cbiAgICAgIGlmICh0aGlzLnZtLl9wcm9wcykge1xuICAgICAgICB0aGlzLnZtLl9wcm9wc1trZXldID0gZGF0YVtrZXldXG4gICAgICAgIC8vICRGbG93SWdub3JlIDogUHJvYmxlbSB3aXRoIHBvc3NpYmx5IG51bGwgdGhpcy52bS4kcHJvcHNcbiAgICAgICAgdGhpcy52bS4kcHJvcHNba2V5XSA9IGRhdGFba2V5XVxuICAgICAgICAvLyAkRmxvd0lnbm9yZSA6IFByb2JsZW0gd2l0aCBwb3NzaWJseSBudWxsIHRoaXMudm0uJG9wdGlvbnNcbiAgICAgICAgdGhpcy52bS4kb3B0aW9ucy5wcm9wc0RhdGFba2V5XSA9IGRhdGFba2V5XVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gJEZsb3dJZ25vcmUgOiBQcm9ibGVtIHdpdGggcG9zc2libHkgbnVsbCB0aGlzLnZtXG4gICAgICAgIHRoaXMudm1ba2V5XSA9IGRhdGFba2V5XVxuICAgICAgICAvLyAkRmxvd0lnbm9yZSA6IFByb2JsZW0gd2l0aCBwb3NzaWJseSBudWxsIHRoaXMudm0uJG9wdGlvbnNcbiAgICAgICAgdGhpcy52bS4kb3B0aW9ucy5wcm9wc0RhdGFba2V5XSA9IGRhdGFba2V5XVxuICAgICAgfVxuICAgIH0pXG5cbiAgICAvLyAkRmxvd0lnbm9yZSA6IFByb2JsZW0gd2l0aCBwb3NzaWJseSBudWxsIHRoaXMudm1cbiAgICB0aGlzLnZub2RlID0gdGhpcy52bS5fdm5vZGVcbiAgICBvcmRlcldhdGNoZXJzKHRoaXMudm0gfHwgdGhpcy52bm9kZS5jb250ZXh0LiRyb290KVxuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgZWxlbWVudCB2YWx1ZSBhbmQgdHJpZ2dlcnMgaW5wdXQgZXZlbnRcbiAgICovXG4gIHNldFZhbHVlICh2YWx1ZTogYW55KSB7XG4gICAgY29uc3QgZWwgPSB0aGlzLmVsZW1lbnRcblxuICAgIGlmICghZWwpIHtcbiAgICAgIHRocm93RXJyb3IoJ2Nhbm5vdCBjYWxsIHdyYXBwZXIuc2V0VmFsdWUoKSBvbiBhIHdyYXBwZXIgd2l0aG91dCBhbiBlbGVtZW50JylcbiAgICB9XG5cbiAgICBjb25zdCB0YWcgPSBlbC50YWdOYW1lXG4gICAgY29uc3QgdHlwZSA9IHRoaXMuYXR0cmlidXRlcygpLnR5cGVcbiAgICBjb25zdCBldmVudCA9ICdpbnB1dCdcblxuICAgIGlmICh0YWcgPT09ICdTRUxFQ1QnKSB7XG4gICAgICB0aHJvd0Vycm9yKCd3cmFwcGVyLnNldFZhbHVlKCkgY2Fubm90IGJlIGNhbGxlZCBvbiBhIDxzZWxlY3Q+IGVsZW1lbnQuIFVzZSB3cmFwcGVyLnNldFNlbGVjdGVkKCkgaW5zdGVhZCcpXG4gICAgfSBlbHNlIGlmICh0YWcgPT09ICdJTlBVVCcgJiYgdHlwZSA9PT0gJ2NoZWNrYm94Jykge1xuICAgICAgdGhyb3dFcnJvcignd3JhcHBlci5zZXRWYWx1ZSgpIGNhbm5vdCBiZSBjYWxsZWQgb24gYSA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgLz4gZWxlbWVudC4gVXNlIHdyYXBwZXIuc2V0Q2hlY2tlZCgpIGluc3RlYWQnKVxuICAgIH0gZWxzZSBpZiAodGFnID09PSAnSU5QVVQnICYmIHR5cGUgPT09ICdyYWRpbycpIHtcbiAgICAgIHRocm93RXJyb3IoJ3dyYXBwZXIuc2V0VmFsdWUoKSBjYW5ub3QgYmUgY2FsbGVkIG9uIGEgPGlucHV0IHR5cGU9XCJyYWRpb1wiIC8+IGVsZW1lbnQuIFVzZSB3cmFwcGVyLnNldENoZWNrZWQoKSBpbnN0ZWFkJylcbiAgICB9IGVsc2UgaWYgKHRhZyA9PT0gJ0lOUFVUJyB8fCB0YWcgPT09ICd0ZXh0YXJlYScpIHtcbiAgICAgIC8vICRGbG93SWdub3JlXG4gICAgICBlbC52YWx1ZSA9IHZhbHVlXG4gICAgICB0aGlzLnRyaWdnZXIoZXZlbnQpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93RXJyb3IoJ3dyYXBwZXIuc2V0VmFsdWUoKSBjYW5ub3QgYmUgY2FsbGVkIG9uIHRoaXMgZWxlbWVudCcpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyByYWRpbyBidXR0b24gb3IgY2hlY2tib3ggZWxlbWVudFxuICAgKi9cbiAgc2V0Q2hlY2tlZCAoY2hlY2tlZDogYm9vbGVhbiA9IHRydWUpIHtcbiAgICBpZiAodHlwZW9mIGNoZWNrZWQgIT09ICdib29sZWFuJykge1xuICAgICAgdGhyb3dFcnJvcignd3JhcHBlci5zZXRDaGVja2VkKCkgbXVzdCBiZSBwYXNzZWQgYSBib29sZWFuJylcbiAgICB9XG5cbiAgICBjb25zdCBlbCA9IHRoaXMuZWxlbWVudFxuXG4gICAgaWYgKCFlbCkge1xuICAgICAgdGhyb3dFcnJvcignY2Fubm90IGNhbGwgd3JhcHBlci5zZXRDaGVja2VkKCkgb24gYSB3cmFwcGVyIHdpdGhvdXQgYW4gZWxlbWVudCcpXG4gICAgfVxuXG4gICAgY29uc3QgdGFnID0gZWwudGFnTmFtZVxuICAgIGNvbnN0IHR5cGUgPSB0aGlzLmF0dHJpYnV0ZXMoKS50eXBlXG4gICAgY29uc3QgZXZlbnQgPSAnY2hhbmdlJ1xuXG4gICAgaWYgKHRhZyA9PT0gJ1NFTEVDVCcpIHtcbiAgICAgIHRocm93RXJyb3IoJ3dyYXBwZXIuc2V0Q2hlY2tlZCgpIGNhbm5vdCBiZSBjYWxsZWQgb24gYSA8c2VsZWN0PiBlbGVtZW50LiBVc2Ugd3JhcHBlci5zZXRTZWxlY3RlZCgpIGluc3RlYWQnKVxuICAgIH0gZWxzZSBpZiAodGFnID09PSAnSU5QVVQnICYmIHR5cGUgPT09ICdjaGVja2JveCcpIHtcbiAgICAgIC8vICRGbG93SWdub3JlXG4gICAgICBpZiAoZWwuY2hlY2tlZCAhPT0gY2hlY2tlZCkge1xuICAgICAgICBpZiAoIW5hdmlnYXRvci51c2VyQWdlbnQuaW5jbHVkZXMoJ2pzZG9tJykpIHtcbiAgICAgICAgICAvLyAkRmxvd0lnbm9yZVxuICAgICAgICAgIGVsLmNoZWNrZWQgPSBjaGVja2VkXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy50cmlnZ2VyKCdjbGljaycpXG4gICAgICAgIHRoaXMudHJpZ2dlcihldmVudClcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHRhZyA9PT0gJ0lOUFVUJyAmJiB0eXBlID09PSAncmFkaW8nKSB7XG4gICAgICBpZiAoIWNoZWNrZWQpIHtcbiAgICAgICAgdGhyb3dFcnJvcignd3JhcHBlci5zZXRDaGVja2VkKCkgY2Fubm90IGJlIGNhbGxlZCB3aXRoIHBhcmFtZXRlciBmYWxzZSBvbiBhIDxpbnB1dCB0eXBlPVwicmFkaW9cIiAvPiBlbGVtZW50LicpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyAkRmxvd0lnbm9yZVxuICAgICAgICBpZiAoIWVsLmNoZWNrZWQpIHtcbiAgICAgICAgICB0aGlzLnRyaWdnZXIoJ2NsaWNrJylcbiAgICAgICAgICB0aGlzLnRyaWdnZXIoZXZlbnQpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHRhZyA9PT0gJ0lOUFVUJyB8fCB0YWcgPT09ICd0ZXh0YXJlYScpIHtcbiAgICAgIHRocm93RXJyb3IoJ3dyYXBwZXIuc2V0Q2hlY2tlZCgpIGNhbm5vdCBiZSBjYWxsZWQgb24gXCJ0ZXh0XCIgaW5wdXRzLiBVc2Ugd3JhcHBlci5zZXRWYWx1ZSgpIGluc3RlYWQnKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvd0Vycm9yKCd3cmFwcGVyLnNldENoZWNrZWQoKSBjYW5ub3QgYmUgY2FsbGVkIG9uIHRoaXMgZWxlbWVudCcpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNlbGVjdHMgPG9wdGlvbj48L29wdGlvbj4gZWxlbWVudFxuICAgKi9cbiAgc2V0U2VsZWN0ZWQgKCkge1xuICAgIGNvbnN0IGVsID0gdGhpcy5lbGVtZW50XG5cbiAgICBpZiAoIWVsKSB7XG4gICAgICB0aHJvd0Vycm9yKCdjYW5ub3QgY2FsbCB3cmFwcGVyLnNldFNlbGVjdGVkKCkgb24gYSB3cmFwcGVyIHdpdGhvdXQgYW4gZWxlbWVudCcpXG4gICAgfVxuXG4gICAgY29uc3QgdGFnID0gZWwudGFnTmFtZVxuICAgIGNvbnN0IHR5cGUgPSB0aGlzLmF0dHJpYnV0ZXMoKS50eXBlXG4gICAgY29uc3QgZXZlbnQgPSAnY2hhbmdlJ1xuXG4gICAgaWYgKHRhZyA9PT0gJ09QVElPTicpIHtcbiAgICAgIC8vICRGbG93SWdub3JlXG4gICAgICBlbC5zZWxlY3RlZCA9IHRydWVcbiAgICAgIC8vICRGbG93SWdub3JlXG4gICAgICBpZiAoZWwucGFyZW50RWxlbWVudC50YWdOYW1lID09PSAnT1BUR1JPVVAnKSB7XG4gICAgICAgIC8vICRGbG93SWdub3JlXG4gICAgICAgIGNyZWF0ZVdyYXBwZXIoZWwucGFyZW50RWxlbWVudC5wYXJlbnRFbGVtZW50LCB0aGlzLm9wdGlvbnMpLnRyaWdnZXIoZXZlbnQpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyAkRmxvd0lnbm9yZVxuICAgICAgICBjcmVhdGVXcmFwcGVyKGVsLnBhcmVudEVsZW1lbnQsIHRoaXMub3B0aW9ucykudHJpZ2dlcihldmVudClcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHRhZyA9PT0gJ1NFTEVDVCcpIHtcbiAgICAgIHRocm93RXJyb3IoJ3dyYXBwZXIuc2V0U2VsZWN0ZWQoKSBjYW5ub3QgYmUgY2FsbGVkIG9uIHNlbGVjdC4gQ2FsbCBpdCBvbiBvbmUgb2YgaXRzIG9wdGlvbnMnKVxuICAgIH0gZWxzZSBpZiAodGFnID09PSAnSU5QVVQnICYmIHR5cGUgPT09ICdjaGVja2JveCcpIHtcbiAgICAgIHRocm93RXJyb3IoJ3dyYXBwZXIuc2V0U2VsZWN0ZWQoKSBjYW5ub3QgYmUgY2FsbGVkIG9uIGEgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIC8+IGVsZW1lbnQuIFVzZSB3cmFwcGVyLnNldENoZWNrZWQoKSBpbnN0ZWFkJylcbiAgICB9IGVsc2UgaWYgKHRhZyA9PT0gJ0lOUFVUJyAmJiB0eXBlID09PSAncmFkaW8nKSB7XG4gICAgICB0aHJvd0Vycm9yKCd3cmFwcGVyLnNldFNlbGVjdGVkKCkgY2Fubm90IGJlIGNhbGxlZCBvbiBhIDxpbnB1dCB0eXBlPVwicmFkaW9cIiAvPiBlbGVtZW50LiBVc2Ugd3JhcHBlci5zZXRDaGVja2VkKCkgaW5zdGVhZCcpXG4gICAgfSBlbHNlIGlmICh0YWcgPT09ICdJTlBVVCcgfHwgdGFnID09PSAndGV4dGFyZWEnKSB7XG4gICAgICB0aHJvd0Vycm9yKCd3cmFwcGVyLnNldFNlbGVjdGVkKCkgY2Fubm90IGJlIGNhbGxlZCBvbiBcInRleHRcIiBpbnB1dHMuIFVzZSB3cmFwcGVyLnNldFZhbHVlKCkgaW5zdGVhZCcpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93RXJyb3IoJ3dyYXBwZXIuc2V0U2VsZWN0ZWQoKSBjYW5ub3QgYmUgY2FsbGVkIG9uIHRoaXMgZWxlbWVudCcpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiB0ZXh0IG9mIHdyYXBwZXIgZWxlbWVudFxuICAgKi9cbiAgdGV4dCAoKTogc3RyaW5nIHtcbiAgICBpZiAoIXRoaXMuZWxlbWVudCkge1xuICAgICAgdGhyb3dFcnJvcignY2Fubm90IGNhbGwgd3JhcHBlci50ZXh0KCkgb24gYSB3cmFwcGVyIHdpdGhvdXQgYW4gZWxlbWVudCcpXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudC50ZXh0Q29udGVudC50cmltKClcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxscyBkZXN0cm95IG9uIHZtXG4gICAqL1xuICBkZXN0cm95ICgpIHtcbiAgICBpZiAoIXRoaXMuaXNWdWVJbnN0YW5jZSgpKSB7XG4gICAgICB0aHJvd0Vycm9yKCd3cmFwcGVyLmRlc3Ryb3koKSBjYW4gb25seSBiZSBjYWxsZWQgb24gYSBWdWUgaW5zdGFuY2UnKVxuICAgIH1cblxuICAgIGlmICh0aGlzLmVsZW1lbnQucGFyZW50Tm9kZSkge1xuICAgICAgdGhpcy5lbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5lbGVtZW50KVxuICAgIH1cbiAgICAvLyAkRmxvd0lnbm9yZVxuICAgIHRoaXMudm0uJGRlc3Ryb3koKVxuICB9XG5cbiAgLyoqXG4gICAqIERpc3BhdGNoZXMgYSBET00gZXZlbnQgb24gd3JhcHBlclxuICAgKi9cbiAgdHJpZ2dlciAodHlwZTogc3RyaW5nLCBvcHRpb25zOiBPYmplY3QgPSB7fSkge1xuICAgIGlmICh0eXBlb2YgdHlwZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93RXJyb3IoJ3dyYXBwZXIudHJpZ2dlcigpIG11c3QgYmUgcGFzc2VkIGEgc3RyaW5nJylcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuZWxlbWVudCkge1xuICAgICAgdGhyb3dFcnJvcignY2Fubm90IGNhbGwgd3JhcHBlci50cmlnZ2VyKCkgb24gYSB3cmFwcGVyIHdpdGhvdXQgYW4gZWxlbWVudCcpXG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnMudGFyZ2V0KSB7XG4gICAgICB0aHJvd0Vycm9yKCd5b3UgY2Fubm90IHNldCB0aGUgdGFyZ2V0IHZhbHVlIG9mIGFuIGV2ZW50LiBTZWUgdGhlIG5vdGVzIHNlY3Rpb24gb2YgdGhlIGRvY3MgZm9yIG1vcmUgZGV0YWlsc+KAlGh0dHBzOi8vdnVlLXRlc3QtdXRpbHMudnVlanMub3JnL2FwaS93cmFwcGVyL3RyaWdnZXIuaHRtbCcpXG4gICAgfVxuXG4gICAgLy8gRG9uJ3QgZmlyZSBldmVudCBvbiBhIGRpc2FibGVkIGVsZW1lbnRcbiAgICBpZiAodGhpcy5hdHRyaWJ1dGVzKCkuZGlzYWJsZWQpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnN0IG1vZGlmaWVycyA9IHtcbiAgICAgIGVudGVyOiAxMyxcbiAgICAgIHRhYjogOSxcbiAgICAgIGRlbGV0ZTogNDYsXG4gICAgICBlc2M6IDI3LFxuICAgICAgc3BhY2U6IDMyLFxuICAgICAgdXA6IDM4LFxuICAgICAgZG93bjogNDAsXG4gICAgICBsZWZ0OiAzNyxcbiAgICAgIHJpZ2h0OiAzOSxcbiAgICAgIGVuZDogMzUsXG4gICAgICBob21lOiAzNixcbiAgICAgIGJhY2tzcGFjZTogOCxcbiAgICAgIGluc2VydDogNDUsXG4gICAgICBwYWdldXA6IDMzLFxuICAgICAgcGFnZWRvd246IDM0XG4gICAgfVxuXG4gICAgY29uc3QgZXZlbnQgPSB0eXBlLnNwbGl0KCcuJylcblxuICAgIGxldCBldmVudE9iamVjdFxuXG4gICAgLy8gRmFsbGJhY2sgZm9yIElFMTAsMTEgLSBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8yNjU5NjEyM1xuICAgIGlmICh0eXBlb2YgKHdpbmRvdy5FdmVudCkgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGV2ZW50T2JqZWN0ID0gbmV3IHdpbmRvdy5FdmVudChldmVudFswXSwge1xuICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICBjYW5jZWxhYmxlOiB0cnVlXG4gICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICBldmVudE9iamVjdCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdFdmVudCcpXG4gICAgICBldmVudE9iamVjdC5pbml0RXZlbnQoZXZlbnRbMF0sIHRydWUsIHRydWUpXG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnMpIHtcbiAgICAgIE9iamVjdC5rZXlzKG9wdGlvbnMpLmZvckVhY2goa2V5ID0+IHtcbiAgICAgICAgLy8gJEZsb3dJZ25vcmVcbiAgICAgICAgZXZlbnRPYmplY3Rba2V5XSA9IG9wdGlvbnNba2V5XVxuICAgICAgfSlcbiAgICB9XG5cbiAgICBpZiAoZXZlbnQubGVuZ3RoID09PSAyKSB7XG4gICAgICAvLyAkRmxvd0lnbm9yZVxuICAgICAgZXZlbnRPYmplY3Qua2V5Q29kZSA9IG1vZGlmaWVyc1tldmVudFsxXV1cbiAgICB9XG5cbiAgICB0aGlzLmVsZW1lbnQuZGlzcGF0Y2hFdmVudChldmVudE9iamVjdClcbiAgICBpZiAodGhpcy52bm9kZSkge1xuICAgICAgb3JkZXJXYXRjaGVycyh0aGlzLnZtIHx8IHRoaXMudm5vZGUuY29udGV4dC4kcm9vdClcbiAgICB9XG4gIH1cblxuICB1cGRhdGUgKCkge1xuICAgIHdhcm4oJ3VwZGF0ZSBoYXMgYmVlbiByZW1vdmVkIGZyb20gdnVlLXRlc3QtdXRpbHMuIEFsbCB1cGRhdGVzIGFyZSBub3cgc3luY2hyb25vdXMgYnkgZGVmYXVsdCcpXG4gIH1cbn1cbiIsImltcG9ydCB7IFZVRV9WRVJTSU9OIH0gZnJvbSAnLi9jb25zdHMnXG5cbmZ1bmN0aW9uIHNldERlcHNTeW5jIChkZXApIHtcbiAgZGVwLnN1YnMuZm9yRWFjaChzZXRXYXRjaGVyU3luYylcbn1cblxuZnVuY3Rpb24gc2V0V2F0Y2hlclN5bmMgKHdhdGNoZXIpIHtcbiAgaWYgKHdhdGNoZXIuc3luYyA9PT0gdHJ1ZSkge1xuICAgIHJldHVyblxuICB9XG4gIHdhdGNoZXIuc3luYyA9IHRydWVcbiAgd2F0Y2hlci5kZXBzLmZvckVhY2goc2V0RGVwc1N5bmMpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRXYXRjaGVyc1RvU3luYyAodm0pIHtcbiAgaWYgKHZtLl93YXRjaGVycykge1xuICAgIHZtLl93YXRjaGVycy5mb3JFYWNoKHNldFdhdGNoZXJTeW5jKVxuICB9XG5cbiAgaWYgKHZtLl9jb21wdXRlZFdhdGNoZXJzKSB7XG4gICAgT2JqZWN0LmtleXModm0uX2NvbXB1dGVkV2F0Y2hlcnMpLmZvckVhY2goKGNvbXB1dGVkV2F0Y2hlcikgPT4ge1xuICAgICAgc2V0V2F0Y2hlclN5bmModm0uX2NvbXB1dGVkV2F0Y2hlcnNbY29tcHV0ZWRXYXRjaGVyXSlcbiAgICB9KVxuICB9XG5cbiAgc2V0V2F0Y2hlclN5bmModm0uX3dhdGNoZXIpXG5cbiAgdm0uJGNoaWxkcmVuLmZvckVhY2goc2V0V2F0Y2hlcnNUb1N5bmMpXG4gIC8vIHByZXZlbnRpbmcgZG91YmxlIHJlZ2lzdHJhdGlvblxuICBpZiAoIXZtLiRfdnVlVGVzdFV0aWxzX3VwZGF0ZUluU2V0V2F0Y2hlclN5bmMpIHtcbiAgICB2bS4kX3Z1ZVRlc3RVdGlsc191cGRhdGVJblNldFdhdGNoZXJTeW5jID0gdm0uX3VwZGF0ZVxuICAgIHZtLl91cGRhdGUgPSBmdW5jdGlvbiAodm5vZGUsIGh5ZHJhdGluZykge1xuICAgICAgdGhpcy4kX3Z1ZVRlc3RVdGlsc191cGRhdGVJblNldFdhdGNoZXJTeW5jKHZub2RlLCBoeWRyYXRpbmcpXG4gICAgICBpZiAoVlVFX1ZFUlNJT04gPj0gMi4xICYmIHRoaXMuX2lzTW91bnRlZCAmJiB0aGlzLiRvcHRpb25zLnVwZGF0ZWQpIHtcbiAgICAgICAgdGhpcy4kb3B0aW9ucy51cGRhdGVkLmZvckVhY2goKGhhbmRsZXIpID0+IHtcbiAgICAgICAgICBoYW5kbGVyLmNhbGwodGhpcylcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiIsIi8vIEBmbG93XG5cbmltcG9ydCBXcmFwcGVyIGZyb20gJy4vd3JhcHBlcidcbmltcG9ydCB7IHNldFdhdGNoZXJzVG9TeW5jIH0gZnJvbSAnLi9zZXQtd2F0Y2hlcnMtdG8tc3luYydcbmltcG9ydCB7IG9yZGVyV2F0Y2hlcnMgfSBmcm9tICcuL29yZGVyLXdhdGNoZXJzJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBWdWVXcmFwcGVyIGV4dGVuZHMgV3JhcHBlciBpbXBsZW1lbnRzIEJhc2VXcmFwcGVyIHtcbiAgY29uc3RydWN0b3IgKHZtOiBDb21wb25lbnQsIG9wdGlvbnM6IFdyYXBwZXJPcHRpb25zKSB7XG4gICAgc3VwZXIodm0uX3Zub2RlLCBvcHRpb25zKVxuXG4gICAgLy8gJEZsb3dJZ25vcmUgOiBpc3N1ZSB3aXRoIGRlZmluZVByb3BlcnR5IC0gaHR0cHM6Ly9naXRodWIuY29tL2ZhY2Vib29rL2Zsb3cvaXNzdWVzLzI4NVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAndm5vZGUnLCAoe1xuICAgICAgZ2V0OiAoKSA9PiB2bS5fdm5vZGUsXG4gICAgICBzZXQ6ICgpID0+IHt9XG4gICAgfSkpXG4gICAgLy8gJEZsb3dJZ25vcmVcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2VsZW1lbnQnLCAoe1xuICAgICAgZ2V0OiAoKSA9PiB2bS4kZWwsXG4gICAgICBzZXQ6ICgpID0+IHt9XG4gICAgfSkpXG4gICAgdGhpcy52bSA9IHZtXG4gICAgaWYgKG9wdGlvbnMuc3luYykge1xuICAgICAgc2V0V2F0Y2hlcnNUb1N5bmModm0pXG4gICAgICBvcmRlcldhdGNoZXJzKHZtKVxuICAgIH1cbiAgICB0aGlzLmlzVm0gPSB0cnVlXG4gICAgdGhpcy5pc0Z1bmN0aW9uYWxDb21wb25lbnQgPSB2bS4kb3B0aW9ucy5faXNGdW5jdGlvbmFsQ29udGFpbmVyXG4gICAgdGhpcy5fZW1pdHRlZCA9IHZtLl9fZW1pdHRlZFxuICAgIHRoaXMuX2VtaXR0ZWRCeU9yZGVyID0gdm0uX19lbWl0dGVkQnlPcmRlclxuICB9XG59XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgeyBjb21waWxlVG9GdW5jdGlvbnMgfSBmcm9tICd2dWUtdGVtcGxhdGUtY29tcGlsZXInXG5cbmZ1bmN0aW9uIHN0YXJ0c1dpdGhUYWcgKHN0cikge1xuICByZXR1cm4gc3RyICYmIHN0ci50cmltKClbMF0gPT09ICc8J1xufVxuXG5mdW5jdGlvbiBjcmVhdGVWTm9kZXNGb3JTbG90IChcbiAgaDogRnVuY3Rpb24sXG4gIHNsb3RWYWx1ZTogU2xvdFZhbHVlLFxuICBuYW1lOiBzdHJpbmdcbik6IFZOb2RlIHwgc3RyaW5nIHtcbiAgaWYgKHR5cGVvZiBzbG90VmFsdWUgPT09ICdzdHJpbmcnICYmXG4gICFzdGFydHNXaXRoVGFnKHNsb3RWYWx1ZSkpIHtcbiAgICByZXR1cm4gc2xvdFZhbHVlXG4gIH1cblxuICBjb25zdCBlbCA9IHR5cGVvZiBzbG90VmFsdWUgPT09ICdzdHJpbmcnXG4gICAgPyBjb21waWxlVG9GdW5jdGlvbnMoc2xvdFZhbHVlKVxuICAgIDogc2xvdFZhbHVlXG5cbiAgY29uc3Qgdm5vZGUgPSBoKGVsKVxuICB2bm9kZS5kYXRhLnNsb3QgPSBuYW1lXG4gIHJldHVybiB2bm9kZVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU2xvdFZOb2RlcyAoXG4gIGg6IEZ1bmN0aW9uLFxuICBzbG90czogU2xvdHNPYmplY3Rcbik6IEFycmF5PFZOb2RlIHwgc3RyaW5nPiB7XG4gIHJldHVybiBPYmplY3Qua2V5cyhzbG90cykucmVkdWNlKChhY2MsIGtleSkgPT4ge1xuICAgIGNvbnN0IGNvbnRlbnQgPSBzbG90c1trZXldXG4gICAgaWYgKEFycmF5LmlzQXJyYXkoY29udGVudCkpIHtcbiAgICAgIGNvbnN0IG5vZGVzID0gY29udGVudC5yZWR1Y2UoKGFjY0lubmVyLCBzbG90RGVmKSA9PiB7XG4gICAgICAgIHJldHVybiBhY2NJbm5lci5jb25jYXQoY3JlYXRlVk5vZGVzRm9yU2xvdChoLCBzbG90RGVmLCBrZXkpKVxuICAgICAgfSwgW10pXG4gICAgICByZXR1cm4gYWNjLmNvbmNhdChub2RlcylcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGFjYy5jb25jYXQoY3JlYXRlVk5vZGVzRm9yU2xvdChoLCBjb250ZW50LCBrZXkpKVxuICAgIH1cbiAgfSwgW10pXG59XG4iLCIvLyBAZmxvd1xuaW1wb3J0ICQkVnVlIGZyb20gJ3Z1ZSdcbmltcG9ydCB7IHdhcm4gfSBmcm9tICdzaGFyZWQvdXRpbCdcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gYWRkTW9ja3MgKG1vY2tlZFByb3BlcnRpZXM6IE9iamVjdCwgVnVlOiBDb21wb25lbnQpIHtcbiAgT2JqZWN0LmtleXMobW9ja2VkUHJvcGVydGllcykuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIFZ1ZS5wcm90b3R5cGVba2V5XSA9IG1vY2tlZFByb3BlcnRpZXNba2V5XVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHdhcm4oYGNvdWxkIG5vdCBvdmVyd3JpdGUgcHJvcGVydHkgJHtrZXl9LCB0aGlzIHVzdWFsbHkgY2F1c2VkIGJ5IGEgcGx1Z2luIHRoYXQgaGFzIGFkZGVkIHRoZSBwcm9wZXJ0eSBhcyBhIHJlYWQtb25seSB2YWx1ZWApXG4gICAgfVxuICAgICQkVnVlLnV0aWwuZGVmaW5lUmVhY3RpdmUoVnVlLCBrZXksIG1vY2tlZFByb3BlcnRpZXNba2V5XSlcbiAgfSlcbn1cbiIsIi8vIEBmbG93XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2dFdmVudHMgKHZtOiBDb21wb25lbnQsIGVtaXR0ZWQ6IE9iamVjdCwgZW1pdHRlZEJ5T3JkZXI6IEFycmF5PGFueT4pIHtcbiAgY29uc3QgZW1pdCA9IHZtLiRlbWl0XG4gIHZtLiRlbWl0ID0gKG5hbWUsIC4uLmFyZ3MpID0+IHtcbiAgICAoZW1pdHRlZFtuYW1lXSB8fCAoZW1pdHRlZFtuYW1lXSA9IFtdKSkucHVzaChhcmdzKVxuICAgIGVtaXR0ZWRCeU9yZGVyLnB1c2goeyBuYW1lLCBhcmdzIH0pXG4gICAgcmV0dXJuIGVtaXQuY2FsbCh2bSwgbmFtZSwgLi4uYXJncylcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYWRkRXZlbnRMb2dnZXIgKHZ1ZTogQ29tcG9uZW50KSB7XG4gIHZ1ZS5taXhpbih7XG4gICAgYmVmb3JlQ3JlYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLl9fZW1pdHRlZCA9IE9iamVjdC5jcmVhdGUobnVsbClcbiAgICAgIHRoaXMuX19lbWl0dGVkQnlPcmRlciA9IFtdXG4gICAgICBsb2dFdmVudHModGhpcywgdGhpcy5fX2VtaXR0ZWQsIHRoaXMuX19lbWl0dGVkQnlPcmRlcilcbiAgICB9XG4gIH0pXG59XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgeyBjb21waWxlVG9GdW5jdGlvbnMgfSBmcm9tICd2dWUtdGVtcGxhdGUtY29tcGlsZXInXG5cbmV4cG9ydCBmdW5jdGlvbiBjb21waWxlVGVtcGxhdGUgKGNvbXBvbmVudDogQ29tcG9uZW50KSB7XG4gIGlmIChjb21wb25lbnQudGVtcGxhdGUpIHtcbiAgICBPYmplY3QuYXNzaWduKGNvbXBvbmVudCwgY29tcGlsZVRvRnVuY3Rpb25zKGNvbXBvbmVudC50ZW1wbGF0ZSkpXG4gIH1cblxuICBpZiAoY29tcG9uZW50LmNvbXBvbmVudHMpIHtcbiAgICBPYmplY3Qua2V5cyhjb21wb25lbnQuY29tcG9uZW50cykuZm9yRWFjaCgoYykgPT4ge1xuICAgICAgY29uc3QgY21wID0gY29tcG9uZW50LmNvbXBvbmVudHNbY11cbiAgICAgIGlmICghY21wLnJlbmRlcikge1xuICAgICAgICBjb21waWxlVGVtcGxhdGUoY21wKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBpZiAoY29tcG9uZW50LmV4dGVuZHMpIHtcbiAgICBjb21waWxlVGVtcGxhdGUoY29tcG9uZW50LmV4dGVuZHMpXG4gIH1cblxuICBpZiAoY29tcG9uZW50LmV4dGVuZE9wdGlvbnMgJiYgIWNvbXBvbmVudC5vcHRpb25zLnJlbmRlcikge1xuICAgIGNvbXBpbGVUZW1wbGF0ZShjb21wb25lbnQub3B0aW9ucylcbiAgfVxufVxuIiwiLy8gQGZsb3dcblxuaW1wb3J0IFZ1ZSBmcm9tICd2dWUnXG5pbXBvcnQgeyBjb21waWxlVG9GdW5jdGlvbnMgfSBmcm9tICd2dWUtdGVtcGxhdGUtY29tcGlsZXInXG5pbXBvcnQgeyB0aHJvd0Vycm9yIH0gZnJvbSAnLi91dGlsJ1xuaW1wb3J0IHtcbiAgY29tcG9uZW50TmVlZHNDb21waWxpbmcsXG4gIHRlbXBsYXRlQ29udGFpbnNDb21wb25lbnRcbn0gZnJvbSAnLi92YWxpZGF0b3JzJ1xuaW1wb3J0IHsgY29tcGlsZVRlbXBsYXRlIH0gZnJvbSAnLi9jb21waWxlLXRlbXBsYXRlJ1xuXG5mdW5jdGlvbiBpc1Z1ZUNvbXBvbmVudCAoY29tcCkge1xuICByZXR1cm4gY29tcCAmJiAoY29tcC5yZW5kZXIgfHwgY29tcC50ZW1wbGF0ZSB8fCBjb21wLm9wdGlvbnMpXG59XG5cbmZ1bmN0aW9uIGlzVmFsaWRTdHViIChzdHViOiBhbnkpIHtcbiAgcmV0dXJuICEhc3R1YiAmJlxuICAgICAgdHlwZW9mIHN0dWIgPT09ICdzdHJpbmcnIHx8XG4gICAgICAoc3R1YiA9PT0gdHJ1ZSkgfHxcbiAgICAgIChpc1Z1ZUNvbXBvbmVudChzdHViKSlcbn1cblxuZnVuY3Rpb24gaXNSZXF1aXJlZENvbXBvbmVudCAobmFtZSkge1xuICByZXR1cm4gbmFtZSA9PT0gJ0tlZXBBbGl2ZScgfHwgbmFtZSA9PT0gJ1RyYW5zaXRpb24nIHx8IG5hbWUgPT09ICdUcmFuc2l0aW9uR3JvdXAnXG59XG5cbmZ1bmN0aW9uIGdldENvcmVQcm9wZXJ0aWVzIChjb21wb25lbnQ6IENvbXBvbmVudCk6IE9iamVjdCB7XG4gIHJldHVybiB7XG4gICAgYXR0cnM6IGNvbXBvbmVudC5hdHRycyxcbiAgICBuYW1lOiBjb21wb25lbnQubmFtZSxcbiAgICBvbjogY29tcG9uZW50Lm9uLFxuICAgIGtleTogY29tcG9uZW50LmtleSxcbiAgICByZWY6IGNvbXBvbmVudC5yZWYsXG4gICAgcHJvcHM6IGNvbXBvbmVudC5wcm9wcyxcbiAgICBkb21Qcm9wczogY29tcG9uZW50LmRvbVByb3BzLFxuICAgIGNsYXNzOiBjb21wb25lbnQuY2xhc3MsXG4gICAgc3RhdGljQ2xhc3M6IGNvbXBvbmVudC5zdGF0aWNDbGFzcyxcbiAgICBzdGF0aWNTdHlsZTogY29tcG9uZW50LnN0YXRpY1N0eWxlLFxuICAgIHN0eWxlOiBjb21wb25lbnQuc3R5bGUsXG4gICAgbm9ybWFsaXplZFN0eWxlOiBjb21wb25lbnQubm9ybWFsaXplZFN0eWxlLFxuICAgIG5hdGl2ZU9uOiBjb21wb25lbnQubmF0aXZlT24sXG4gICAgZnVuY3Rpb25hbDogY29tcG9uZW50LmZ1bmN0aW9uYWxcbiAgfVxufVxuZnVuY3Rpb24gY3JlYXRlU3R1YkZyb21TdHJpbmcgKFxuICB0ZW1wbGF0ZVN0cmluZzogc3RyaW5nLFxuICBvcmlnaW5hbENvbXBvbmVudDogQ29tcG9uZW50LFxuICBuYW1lOiBzdHJpbmdcbik6IE9iamVjdCB7XG4gIGlmICghY29tcGlsZVRvRnVuY3Rpb25zKSB7XG4gICAgdGhyb3dFcnJvcigndnVlVGVtcGxhdGVDb21waWxlciBpcyB1bmRlZmluZWQsIHlvdSBtdXN0IHBhc3MgcHJlY29tcGlsZWQgY29tcG9uZW50cyBpZiB2dWUtdGVtcGxhdGUtY29tcGlsZXIgaXMgdW5kZWZpbmVkJylcbiAgfVxuXG4gIGlmICh0ZW1wbGF0ZUNvbnRhaW5zQ29tcG9uZW50KHRlbXBsYXRlU3RyaW5nLCBuYW1lKSkge1xuICAgIHRocm93RXJyb3IoJ29wdGlvbnMuc3R1YiBjYW5ub3QgY29udGFpbiBhIGNpcmN1bGFyIHJlZmVyZW5jZScpXG4gIH1cblxuICByZXR1cm4ge1xuICAgIC4uLmdldENvcmVQcm9wZXJ0aWVzKG9yaWdpbmFsQ29tcG9uZW50KSxcbiAgICAuLi5jb21waWxlVG9GdW5jdGlvbnModGVtcGxhdGVTdHJpbmcpXG4gIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlQmxhbmtTdHViIChvcmlnaW5hbENvbXBvbmVudDogQ29tcG9uZW50KSB7XG4gIHJldHVybiB7XG4gICAgLi4uZ2V0Q29yZVByb3BlcnRpZXMob3JpZ2luYWxDb21wb25lbnQpLFxuICAgIHJlbmRlciAoaCkge1xuICAgICAgcmV0dXJuIGgoYCR7b3JpZ2luYWxDb21wb25lbnQubmFtZX0tc3R1YmApXG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVDb21wb25lbnRTdHVicyAoXG4gIG9yaWdpbmFsQ29tcG9uZW50czogT2JqZWN0ID0ge30sXG4gIHN0dWJzOiBPYmplY3Rcbik6IE9iamVjdCB7XG4gIGNvbnN0IGNvbXBvbmVudHMgPSB7fVxuICBpZiAoIXN0dWJzKSB7XG4gICAgcmV0dXJuIGNvbXBvbmVudHNcbiAgfVxuICBpZiAoQXJyYXkuaXNBcnJheShzdHVicykpIHtcbiAgICBzdHVicy5mb3JFYWNoKHN0dWIgPT4ge1xuICAgICAgaWYgKHN0dWIgPT09IGZhbHNlKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIHN0dWIgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRocm93RXJyb3IoJ2VhY2ggaXRlbSBpbiBhbiBvcHRpb25zLnN0dWJzIGFycmF5IG11c3QgYmUgYSBzdHJpbmcnKVxuICAgICAgfVxuICAgICAgY29tcG9uZW50c1tzdHViXSA9IGNyZWF0ZUJsYW5rU3R1Yih7IG5hbWU6IHN0dWIgfSlcbiAgICB9KVxuICB9IGVsc2Uge1xuICAgIE9iamVjdC5rZXlzKHN0dWJzKS5mb3JFYWNoKHN0dWIgPT4ge1xuICAgICAgaWYgKHN0dWJzW3N0dWJdID09PSBmYWxzZSkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGlmICghaXNWYWxpZFN0dWIoc3R1YnNbc3R1Yl0pKSB7XG4gICAgICAgIHRocm93RXJyb3IoJ29wdGlvbnMuc3R1YiB2YWx1ZXMgbXVzdCBiZSBwYXNzZWQgYSBzdHJpbmcgb3IgY29tcG9uZW50JylcbiAgICAgIH1cbiAgICAgIGlmIChzdHVic1tzdHViXSA9PT0gdHJ1ZSkge1xuICAgICAgICBjb21wb25lbnRzW3N0dWJdID0gY3JlYXRlQmxhbmtTdHViKHsgbmFtZTogc3R1YiB9KVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgaWYgKGNvbXBvbmVudE5lZWRzQ29tcGlsaW5nKHN0dWJzW3N0dWJdKSkge1xuICAgICAgICBjb21waWxlVGVtcGxhdGUoc3R1YnNbc3R1Yl0pXG4gICAgICB9XG5cbiAgICAgIGlmIChvcmlnaW5hbENvbXBvbmVudHNbc3R1Yl0pIHtcbiAgICAgICAgLy8gUmVtb3ZlIGNhY2hlZCBjb25zdHJ1Y3RvclxuICAgICAgICBkZWxldGUgb3JpZ2luYWxDb21wb25lbnRzW3N0dWJdLl9DdG9yXG4gICAgICAgIGlmICh0eXBlb2Ygc3R1YnNbc3R1Yl0gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgY29tcG9uZW50c1tzdHViXSA9IGNyZWF0ZVN0dWJGcm9tU3RyaW5nKHN0dWJzW3N0dWJdLCBvcmlnaW5hbENvbXBvbmVudHNbc3R1Yl0sIHN0dWIpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29tcG9uZW50c1tzdHViXSA9IHtcbiAgICAgICAgICAgIC4uLnN0dWJzW3N0dWJdLFxuICAgICAgICAgICAgbmFtZTogb3JpZ2luYWxDb21wb25lbnRzW3N0dWJdLm5hbWVcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc3R1YnNbc3R1Yl0gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgaWYgKCFjb21waWxlVG9GdW5jdGlvbnMpIHtcbiAgICAgICAgICAgIHRocm93RXJyb3IoJ3Z1ZVRlbXBsYXRlQ29tcGlsZXIgaXMgdW5kZWZpbmVkLCB5b3UgbXVzdCBwYXNzIHByZWNvbXBpbGVkIGNvbXBvbmVudHMgaWYgdnVlLXRlbXBsYXRlLWNvbXBpbGVyIGlzIHVuZGVmaW5lZCcpXG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbXBvbmVudHNbc3R1Yl0gPSB7XG4gICAgICAgICAgICAuLi5jb21waWxlVG9GdW5jdGlvbnMoc3R1YnNbc3R1Yl0pXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbXBvbmVudHNbc3R1Yl0gPSB7XG4gICAgICAgICAgICAuLi5zdHVic1tzdHViXVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gaWdub3JlRWxlbWVudHMgZG9lcyBub3QgZXhpc3QgaW4gVnVlIDIuMC54XG4gICAgICBpZiAoVnVlLmNvbmZpZy5pZ25vcmVkRWxlbWVudHMpIHtcbiAgICAgICAgVnVlLmNvbmZpZy5pZ25vcmVkRWxlbWVudHMucHVzaChgJHtzdHVifS1zdHViYClcbiAgICAgIH1cbiAgICB9KVxuICB9XG4gIHJldHVybiBjb21wb25lbnRzXG59XG5cbmZ1bmN0aW9uIHN0dWJDb21wb25lbnRzIChjb21wb25lbnRzOiBPYmplY3QsIHN0dWJiZWRDb21wb25lbnRzOiBPYmplY3QpIHtcbiAgT2JqZWN0LmtleXMoY29tcG9uZW50cykuZm9yRWFjaChjb21wb25lbnQgPT4ge1xuICAgIC8vIFJlbW92ZSBjYWNoZWQgY29uc3RydWN0b3JcbiAgICBkZWxldGUgY29tcG9uZW50c1tjb21wb25lbnRdLl9DdG9yXG4gICAgaWYgKCFjb21wb25lbnRzW2NvbXBvbmVudF0ubmFtZSkge1xuICAgICAgY29tcG9uZW50c1tjb21wb25lbnRdLm5hbWUgPSBjb21wb25lbnRcbiAgICB9XG4gICAgc3R1YmJlZENvbXBvbmVudHNbY29tcG9uZW50XSA9IGNyZWF0ZUJsYW5rU3R1Yihjb21wb25lbnRzW2NvbXBvbmVudF0pXG5cbiAgICAvLyBpZ25vcmVFbGVtZW50cyBkb2VzIG5vdCBleGlzdCBpbiBWdWUgMi4wLnhcbiAgICBpZiAoVnVlLmNvbmZpZy5pZ25vcmVkRWxlbWVudHMpIHtcbiAgICAgIFZ1ZS5jb25maWcuaWdub3JlZEVsZW1lbnRzLnB1c2goYCR7Y29tcG9uZW50c1tjb21wb25lbnRdLm5hbWV9LXN0dWJgKVxuICAgIH1cbiAgfSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUNvbXBvbmVudFN0dWJzRm9yQWxsIChjb21wb25lbnQ6IENvbXBvbmVudCk6IE9iamVjdCB7XG4gIGNvbnN0IHN0dWJiZWRDb21wb25lbnRzID0ge31cblxuICBpZiAoY29tcG9uZW50LmNvbXBvbmVudHMpIHtcbiAgICBzdHViQ29tcG9uZW50cyhjb21wb25lbnQuY29tcG9uZW50cywgc3R1YmJlZENvbXBvbmVudHMpXG4gIH1cblxuICBsZXQgZXh0ZW5kZWQgPSBjb21wb25lbnQuZXh0ZW5kc1xuXG4gIC8vIExvb3AgdGhyb3VnaCBleHRlbmRlZCBjb21wb25lbnQgY2hhaW5zIHRvIHN0dWIgYWxsIGNoaWxkIGNvbXBvbmVudHNcbiAgd2hpbGUgKGV4dGVuZGVkKSB7XG4gICAgaWYgKGV4dGVuZGVkLmNvbXBvbmVudHMpIHtcbiAgICAgIHN0dWJDb21wb25lbnRzKGV4dGVuZGVkLmNvbXBvbmVudHMsIHN0dWJiZWRDb21wb25lbnRzKVxuICAgIH1cbiAgICBleHRlbmRlZCA9IGV4dGVuZGVkLmV4dGVuZHNcbiAgfVxuXG4gIGlmIChjb21wb25lbnQuZXh0ZW5kT3B0aW9ucyAmJiBjb21wb25lbnQuZXh0ZW5kT3B0aW9ucy5jb21wb25lbnRzKSB7XG4gICAgc3R1YkNvbXBvbmVudHMoY29tcG9uZW50LmV4dGVuZE9wdGlvbnMuY29tcG9uZW50cywgc3R1YmJlZENvbXBvbmVudHMpXG4gIH1cblxuICByZXR1cm4gc3R1YmJlZENvbXBvbmVudHNcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUNvbXBvbmVudFN0dWJzRm9yR2xvYmFscyAoaW5zdGFuY2U6IENvbXBvbmVudCk6IE9iamVjdCB7XG4gIGNvbnN0IGNvbXBvbmVudHMgPSB7fVxuICBPYmplY3Qua2V5cyhpbnN0YW5jZS5vcHRpb25zLmNvbXBvbmVudHMpLmZvckVhY2goKGMpID0+IHtcbiAgICBpZiAoaXNSZXF1aXJlZENvbXBvbmVudChjKSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29tcG9uZW50c1tjXSA9IGNyZWF0ZUJsYW5rU3R1YihpbnN0YW5jZS5vcHRpb25zLmNvbXBvbmVudHNbY10pXG4gICAgZGVsZXRlIGluc3RhbmNlLm9wdGlvbnMuY29tcG9uZW50c1tjXS5fQ3RvciAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXBhcmFtLXJlYXNzaWduXG4gICAgZGVsZXRlIGNvbXBvbmVudHNbY10uX0N0b3IgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1wYXJhbS1yZWFzc2lnblxuICB9KVxuICByZXR1cm4gY29tcG9uZW50c1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZGVsZXRlTW91bnRpbmdPcHRpb25zIChvcHRpb25zKSB7XG4gIGRlbGV0ZSBvcHRpb25zLmF0dGFjaFRvRG9jdW1lbnRcbiAgZGVsZXRlIG9wdGlvbnMubW9ja3NcbiAgZGVsZXRlIG9wdGlvbnMuc2xvdHNcbiAgZGVsZXRlIG9wdGlvbnMubG9jYWxWdWVcbiAgZGVsZXRlIG9wdGlvbnMuc3R1YnNcbiAgZGVsZXRlIG9wdGlvbnMuY29udGV4dFxuICBkZWxldGUgb3B0aW9ucy5jbG9uZVxuICBkZWxldGUgb3B0aW9ucy5hdHRyc1xuICBkZWxldGUgb3B0aW9ucy5saXN0ZW5lcnNcbiAgZGVsZXRlIG9wdGlvbnMucHJvcHNEYXRhXG59XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgeyB0aHJvd0Vycm9yIH0gZnJvbSAnc2hhcmVkL3V0aWwnXG5pbXBvcnQgeyBjb21waWxlVG9GdW5jdGlvbnMgfSBmcm9tICd2dWUtdGVtcGxhdGUtY29tcGlsZXInXG5cbmZ1bmN0aW9uIGlzVmFsaWRTbG90IChzbG90OiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkoc2xvdCkgfHxcbiAgIChzbG90ICE9PSBudWxsICYmIHR5cGVvZiBzbG90ID09PSAnb2JqZWN0JykgfHxcbiAgIHR5cGVvZiBzbG90ID09PSAnc3RyaW5nJ1xufVxuXG5mdW5jdGlvbiByZXF1aXJlc1RlbXBsYXRlQ29tcGlsZXIgKHNsb3QpIHtcbiAgaWYgKHR5cGVvZiBzbG90ID09PSAnc3RyaW5nJyAmJiAhY29tcGlsZVRvRnVuY3Rpb25zKSB7XG4gICAgdGhyb3dFcnJvcigndnVlVGVtcGxhdGVDb21waWxlciBpcyB1bmRlZmluZWQsIHlvdSBtdXN0IHBhc3MgcHJlY29tcGlsZWQgY29tcG9uZW50cyBpZiB2dWUtdGVtcGxhdGUtY29tcGlsZXIgaXMgdW5kZWZpbmVkJylcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVTbG90cyAoc2xvdHM6IFNsb3RzT2JqZWN0KTogdm9pZCB7XG4gIE9iamVjdC5rZXlzKHNsb3RzKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICBpZiAoIWlzVmFsaWRTbG90KHNsb3RzW2tleV0pKSB7XG4gICAgICB0aHJvd0Vycm9yKCdzbG90c1trZXldIG11c3QgYmUgYSBDb21wb25lbnQsIHN0cmluZyBvciBhbiBhcnJheSBvZiBDb21wb25lbnRzJylcbiAgICB9XG5cbiAgICByZXF1aXJlc1RlbXBsYXRlQ29tcGlsZXIoc2xvdHNba2V5XSlcblxuICAgIGlmIChBcnJheS5pc0FycmF5KHNsb3RzW2tleV0pKSB7XG4gICAgICBzbG90c1trZXldLmZvckVhY2goKHNsb3RWYWx1ZSkgPT4ge1xuICAgICAgICBpZiAoIWlzVmFsaWRTbG90KHNsb3RWYWx1ZSkpIHtcbiAgICAgICAgICB0aHJvd0Vycm9yKCdzbG90c1trZXldIG11c3QgYmUgYSBDb21wb25lbnQsIHN0cmluZyBvciBhbiBhcnJheSBvZiBDb21wb25lbnRzJylcbiAgICAgICAgfVxuICAgICAgICByZXF1aXJlc1RlbXBsYXRlQ29tcGlsZXIoc2xvdFZhbHVlKVxuICAgICAgfSlcbiAgICB9XG4gIH0pXG59XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgeyBjb21waWxlVG9GdW5jdGlvbnMgfSBmcm9tICd2dWUtdGVtcGxhdGUtY29tcGlsZXInXG5pbXBvcnQgeyB0aHJvd0Vycm9yIH0gZnJvbSAnc2hhcmVkL3V0aWwnXG5pbXBvcnQgeyB2YWxpZGF0ZVNsb3RzIH0gZnJvbSAnLi92YWxpZGF0ZS1zbG90cydcblxuZnVuY3Rpb24gY3JlYXRlRnVuY3Rpb25hbFNsb3RzIChzbG90cyA9IHt9LCBoKSB7XG4gIGlmIChBcnJheS5pc0FycmF5KHNsb3RzLmRlZmF1bHQpKSB7XG4gICAgcmV0dXJuIHNsb3RzLmRlZmF1bHQubWFwKGgpXG4gIH1cblxuICBpZiAodHlwZW9mIHNsb3RzLmRlZmF1bHQgPT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIFtoKGNvbXBpbGVUb0Z1bmN0aW9ucyhzbG90cy5kZWZhdWx0KSldXG4gIH1cbiAgY29uc3QgY2hpbGRyZW4gPSBbXVxuICBPYmplY3Qua2V5cyhzbG90cykuZm9yRWFjaChzbG90VHlwZSA9PiB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoc2xvdHNbc2xvdFR5cGVdKSkge1xuICAgICAgc2xvdHNbc2xvdFR5cGVdLmZvckVhY2goc2xvdCA9PiB7XG4gICAgICAgIGNvbnN0IGNvbXBvbmVudCA9IHR5cGVvZiBzbG90ID09PSAnc3RyaW5nJyA/IGNvbXBpbGVUb0Z1bmN0aW9ucyhzbG90KSA6IHNsb3RcbiAgICAgICAgY29uc3QgbmV3U2xvdCA9IGgoY29tcG9uZW50KVxuICAgICAgICBuZXdTbG90LmRhdGEuc2xvdCA9IHNsb3RUeXBlXG4gICAgICAgIGNoaWxkcmVuLnB1c2gobmV3U2xvdClcbiAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGNvbXBvbmVudCA9IHR5cGVvZiBzbG90c1tzbG90VHlwZV0gPT09ICdzdHJpbmcnID8gY29tcGlsZVRvRnVuY3Rpb25zKHNsb3RzW3Nsb3RUeXBlXSkgOiBzbG90c1tzbG90VHlwZV1cbiAgICAgIGNvbnN0IHNsb3QgPSBoKGNvbXBvbmVudClcbiAgICAgIHNsb3QuZGF0YS5zbG90ID0gc2xvdFR5cGVcbiAgICAgIGNoaWxkcmVuLnB1c2goc2xvdClcbiAgICB9XG4gIH0pXG4gIHJldHVybiBjaGlsZHJlblxufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjcmVhdGVGdW5jdGlvbmFsQ29tcG9uZW50IChjb21wb25lbnQ6IENvbXBvbmVudCwgbW91bnRpbmdPcHRpb25zOiBPcHRpb25zKSB7XG4gIGlmIChtb3VudGluZ09wdGlvbnMuY29udGV4dCAmJiB0eXBlb2YgbW91bnRpbmdPcHRpb25zLmNvbnRleHQgIT09ICdvYmplY3QnKSB7XG4gICAgdGhyb3dFcnJvcignbW91bnQuY29udGV4dCBtdXN0IGJlIGFuIG9iamVjdCcpXG4gIH1cbiAgaWYgKG1vdW50aW5nT3B0aW9ucy5zbG90cykge1xuICAgIHZhbGlkYXRlU2xvdHMobW91bnRpbmdPcHRpb25zLnNsb3RzKVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICByZW5kZXIgKGg6IEZ1bmN0aW9uKSB7XG4gICAgICByZXR1cm4gaChcbiAgICAgICAgY29tcG9uZW50LFxuICAgICAgICBtb3VudGluZ09wdGlvbnMuY29udGV4dCB8fCBjb21wb25lbnQuRnVuY3Rpb25hbFJlbmRlckNvbnRleHQsXG4gICAgICAgIChtb3VudGluZ09wdGlvbnMuY29udGV4dCAmJiBtb3VudGluZ09wdGlvbnMuY29udGV4dC5jaGlsZHJlbiAmJiBtb3VudGluZ09wdGlvbnMuY29udGV4dC5jaGlsZHJlbi5tYXAoeCA9PiB0eXBlb2YgeCA9PT0gJ2Z1bmN0aW9uJyA/IHgoaCkgOiB4KSkgfHwgY3JlYXRlRnVuY3Rpb25hbFNsb3RzKG1vdW50aW5nT3B0aW9ucy5zbG90cywgaClcbiAgICAgIClcbiAgICB9LFxuICAgIG5hbWU6IGNvbXBvbmVudC5uYW1lLFxuICAgIF9pc0Z1bmN0aW9uYWxDb250YWluZXI6IHRydWVcbiAgfVxufVxuIiwiLy8gQGZsb3dcblxuaW1wb3J0IHsgY3JlYXRlU2xvdFZOb2RlcyB9IGZyb20gJy4vYWRkLXNsb3RzJ1xuaW1wb3J0IGFkZE1vY2tzIGZyb20gJy4vYWRkLW1vY2tzJ1xuaW1wb3J0IHsgYWRkRXZlbnRMb2dnZXIgfSBmcm9tICcuL2xvZy1ldmVudHMnXG5pbXBvcnQgeyBjcmVhdGVDb21wb25lbnRTdHVicyB9IGZyb20gJ3NoYXJlZC9zdHViLWNvbXBvbmVudHMnXG5pbXBvcnQgeyB0aHJvd0Vycm9yLCB3YXJuLCB2dWVWZXJzaW9uIH0gZnJvbSAnc2hhcmVkL3V0aWwnXG5pbXBvcnQgeyBjb21waWxlVGVtcGxhdGUgfSBmcm9tICdzaGFyZWQvY29tcGlsZS10ZW1wbGF0ZSdcbmltcG9ydCBkZWxldGVNb3VudGluZ09wdGlvbnMgZnJvbSAnLi9kZWxldGUtbW91bnRpbmctb3B0aW9ucydcbmltcG9ydCBjcmVhdGVGdW5jdGlvbmFsQ29tcG9uZW50IGZyb20gJy4vY3JlYXRlLWZ1bmN0aW9uYWwtY29tcG9uZW50J1xuaW1wb3J0IHsgY29tcG9uZW50TmVlZHNDb21waWxpbmcgfSBmcm9tICdzaGFyZWQvdmFsaWRhdG9ycydcbmltcG9ydCB7IHZhbGlkYXRlU2xvdHMgfSBmcm9tICcuL3ZhbGlkYXRlLXNsb3RzJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjcmVhdGVJbnN0YW5jZSAoXG4gIGNvbXBvbmVudDogQ29tcG9uZW50LFxuICBvcHRpb25zOiBPcHRpb25zLFxuICBfVnVlOiBDb21wb25lbnQsXG4gIGVsbT86IEVsZW1lbnRcbik6IENvbXBvbmVudCB7XG4gIC8vIFJlbW92ZSBjYWNoZWQgY29uc3RydWN0b3JcbiAgZGVsZXRlIGNvbXBvbmVudC5fQ3RvclxuXG4gIGlmIChvcHRpb25zLm1vY2tzKSB7XG4gICAgYWRkTW9ja3Mob3B0aW9ucy5tb2NrcywgX1Z1ZSlcbiAgfVxuICBpZiAoKGNvbXBvbmVudC5vcHRpb25zICYmIGNvbXBvbmVudC5vcHRpb25zLmZ1bmN0aW9uYWwpIHx8IGNvbXBvbmVudC5mdW5jdGlvbmFsKSB7XG4gICAgY29tcG9uZW50ID0gY3JlYXRlRnVuY3Rpb25hbENvbXBvbmVudChjb21wb25lbnQsIG9wdGlvbnMpXG4gIH0gZWxzZSBpZiAob3B0aW9ucy5jb250ZXh0KSB7XG4gICAgdGhyb3dFcnJvcihcbiAgICAgICdtb3VudC5jb250ZXh0IGNhbiBvbmx5IGJlIHVzZWQgd2hlbiBtb3VudGluZyBhIGZ1bmN0aW9uYWwgY29tcG9uZW50J1xuICAgIClcbiAgfVxuXG4gIGlmIChjb21wb25lbnROZWVkc0NvbXBpbGluZyhjb21wb25lbnQpKSB7XG4gICAgY29tcGlsZVRlbXBsYXRlKGNvbXBvbmVudClcbiAgfVxuXG4gIGFkZEV2ZW50TG9nZ2VyKF9WdWUpXG5cbiAgY29uc3QgaW5zdGFuY2VPcHRpb25zID0ge1xuICAgIC4uLm9wdGlvbnNcbiAgfVxuXG4gIGRlbGV0ZU1vdW50aW5nT3B0aW9ucyhpbnN0YW5jZU9wdGlvbnMpXG5cbiAgLy8gJEZsb3dJZ25vcmVcbiAgY29uc3Qgc3R1YkNvbXBvbmVudHMgPSBjcmVhdGVDb21wb25lbnRTdHVicyhjb21wb25lbnQuY29tcG9uZW50cywgb3B0aW9ucy5zdHVicylcbiAgaWYgKG9wdGlvbnMuc3R1YnMpIHtcbiAgICBpbnN0YW5jZU9wdGlvbnMuY29tcG9uZW50cyA9IHtcbiAgICAgIC4uLmluc3RhbmNlT3B0aW9ucy5jb21wb25lbnRzLFxuICAgICAgLy8gJEZsb3dJZ25vcmVcbiAgICAgIC4uLnN0dWJDb21wb25lbnRzXG4gICAgfVxuICB9XG5cbiAgT2JqZWN0LmtleXMoY29tcG9uZW50LmNvbXBvbmVudHMgfHwge30pLmZvckVhY2goKGMpID0+IHtcbiAgICBpZiAoY29tcG9uZW50LmNvbXBvbmVudHNbY10uZXh0ZW5kT3B0aW9ucyAmJlxuICAgICAgIWluc3RhbmNlT3B0aW9ucy5jb21wb25lbnRzW2NdKSB7XG4gICAgICBpZiAob3B0aW9ucy5sb2dNb2RpZmllZENvbXBvbmVudHMpIHtcbiAgICAgICAgd2FybihgYW4gZXh0ZW5kZWQgY2hpbGQgY29tcG9uZW50ICR7Y30gaGFzIGJlZW4gbW9kaWZpZWQgdG8gZW5zdXJlIGl0IGhhcyB0aGUgY29ycmVjdCBpbnN0YW5jZSBwcm9wZXJ0aWVzLiBUaGlzIG1lYW5zIGl0IGlzIG5vdCBwb3NzaWJsZSB0byBmaW5kIHRoZSBjb21wb25lbnQgd2l0aCBhIGNvbXBvbmVudCBzZWxlY3Rvci4gVG8gZmluZCB0aGUgY29tcG9uZW50LCB5b3UgbXVzdCBzdHViIGl0IG1hbnVhbGx5IHVzaW5nIHRoZSBzdHVicyBtb3VudGluZyBvcHRpb24uYClcbiAgICAgIH1cbiAgICAgIGluc3RhbmNlT3B0aW9ucy5jb21wb25lbnRzW2NdID0gX1Z1ZS5leHRlbmQoY29tcG9uZW50LmNvbXBvbmVudHNbY10pXG4gICAgfVxuICB9KVxuXG4gIE9iamVjdC5rZXlzKHN0dWJDb21wb25lbnRzKS5mb3JFYWNoKGMgPT4ge1xuICAgIF9WdWUuY29tcG9uZW50KGMsIHN0dWJDb21wb25lbnRzW2NdKVxuICB9KVxuXG4gIGNvbnN0IENvbnN0cnVjdG9yID0gdnVlVmVyc2lvbiA8IDIuMyAmJiB0eXBlb2YgY29tcG9uZW50ID09PSAnZnVuY3Rpb24nXG4gICAgPyBjb21wb25lbnQuZXh0ZW5kKGluc3RhbmNlT3B0aW9ucylcbiAgICA6IF9WdWUuZXh0ZW5kKGNvbXBvbmVudCkuZXh0ZW5kKGluc3RhbmNlT3B0aW9ucylcblxuICBPYmplY3Qua2V5cyhpbnN0YW5jZU9wdGlvbnMuY29tcG9uZW50cyB8fCB7fSkuZm9yRWFjaChrZXkgPT4ge1xuICAgIENvbnN0cnVjdG9yLmNvbXBvbmVudChrZXksIGluc3RhbmNlT3B0aW9ucy5jb21wb25lbnRzW2tleV0pXG4gICAgX1Z1ZS5jb21wb25lbnQoa2V5LCBpbnN0YW5jZU9wdGlvbnMuY29tcG9uZW50c1trZXldKVxuICB9KVxuXG4gIGlmIChvcHRpb25zLnNsb3RzKSB7XG4gICAgdmFsaWRhdGVTbG90cyhvcHRpb25zLnNsb3RzKVxuICB9XG5cbiAgLy8gT2JqZWN0cyBhcmUgbm90IHJlc29sdmVkIGluIGV4dGVuZGVkIGNvbXBvbmVudHMgaW4gVnVlIDwgMi41XG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS92dWVqcy92dWUvaXNzdWVzLzY0MzZcbiAgaWYgKG9wdGlvbnMucHJvdmlkZSAmJlxuICAgIHR5cGVvZiBvcHRpb25zLnByb3ZpZGUgPT09ICdvYmplY3QnICYmXG4gICAgdnVlVmVyc2lvbiA8IDIuNVxuICApIHtcbiAgICBjb25zdCBvYmogPSB7IC4uLm9wdGlvbnMucHJvdmlkZSB9XG4gICAgb3B0aW9ucy5wcm92aWRlID0gKCkgPT4gb2JqXG4gIH1cblxuICBjb25zdCBQYXJlbnQgPSBfVnVlLmV4dGVuZCh7XG4gICAgcHJvdmlkZTogb3B0aW9ucy5wcm92aWRlLFxuICAgIHJlbmRlciAoaCkge1xuICAgICAgY29uc3Qgc2xvdHMgPSBvcHRpb25zLnNsb3RzXG4gICAgICAgID8gY3JlYXRlU2xvdFZOb2RlcyhoLCBvcHRpb25zLnNsb3RzKVxuICAgICAgICA6IHVuZGVmaW5lZFxuICAgICAgcmV0dXJuIGgoQ29uc3RydWN0b3IsIHtcbiAgICAgICAgcmVmOiAndm0nLFxuICAgICAgICBwcm9wczogb3B0aW9ucy5wcm9wc0RhdGEsXG4gICAgICAgIG9uOiBvcHRpb25zLmxpc3RlbmVycyxcbiAgICAgICAgYXR0cnM6IG9wdGlvbnMuYXR0cnNcbiAgICAgIH0sIHNsb3RzKVxuICAgIH1cbiAgfSlcblxuICByZXR1cm4gbmV3IFBhcmVudCgpXG59XG4iLCIvLyBAZmxvd1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjcmVhdGVFbGVtZW50ICgpOiBIVE1MRWxlbWVudCB8IHZvaWQge1xuICBpZiAoZG9jdW1lbnQpIHtcbiAgICBjb25zdCBlbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcblxuICAgIGlmIChkb2N1bWVudC5ib2R5KSB7XG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGVsZW0pXG4gICAgfVxuICAgIHJldHVybiBlbGVtXG4gIH1cbn1cbiIsIi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBfLmZvckVhY2hgIGZvciBhcnJheXMgd2l0aG91dCBzdXBwb3J0IGZvclxuICogaXRlcmF0ZWUgc2hvcnRoYW5kcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheX0gW2FycmF5XSBUaGUgYXJyYXkgdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0ZWUgVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyBgYXJyYXlgLlxuICovXG5mdW5jdGlvbiBhcnJheUVhY2goYXJyYXksIGl0ZXJhdGVlKSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gYXJyYXkgPT0gbnVsbCA/IDAgOiBhcnJheS5sZW5ndGg7XG5cbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICBpZiAoaXRlcmF0ZWUoYXJyYXlbaW5kZXhdLCBpbmRleCwgYXJyYXkpID09PSBmYWxzZSkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIHJldHVybiBhcnJheTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBhcnJheUVhY2g7XG4iLCJ2YXIgb3ZlckFyZyA9IHJlcXVpcmUoJy4vX292ZXJBcmcnKTtcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgZm9yIHRob3NlIHdpdGggdGhlIHNhbWUgbmFtZSBhcyBvdGhlciBgbG9kYXNoYCBtZXRob2RzLiAqL1xudmFyIG5hdGl2ZUtleXMgPSBvdmVyQXJnKE9iamVjdC5rZXlzLCBPYmplY3QpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5hdGl2ZUtleXM7XG4iLCJ2YXIgaXNQcm90b3R5cGUgPSByZXF1aXJlKCcuL19pc1Byb3RvdHlwZScpLFxuICAgIG5hdGl2ZUtleXMgPSByZXF1aXJlKCcuL19uYXRpdmVLZXlzJyk7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8ua2V5c2Agd2hpY2ggZG9lc24ndCB0cmVhdCBzcGFyc2UgYXJyYXlzIGFzIGRlbnNlLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzLlxuICovXG5mdW5jdGlvbiBiYXNlS2V5cyhvYmplY3QpIHtcbiAgaWYgKCFpc1Byb3RvdHlwZShvYmplY3QpKSB7XG4gICAgcmV0dXJuIG5hdGl2ZUtleXMob2JqZWN0KTtcbiAgfVxuICB2YXIgcmVzdWx0ID0gW107XG4gIGZvciAodmFyIGtleSBpbiBPYmplY3Qob2JqZWN0KSkge1xuICAgIGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwga2V5KSAmJiBrZXkgIT0gJ2NvbnN0cnVjdG9yJykge1xuICAgICAgcmVzdWx0LnB1c2goa2V5KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlS2V5cztcbiIsInZhciBhcnJheUxpa2VLZXlzID0gcmVxdWlyZSgnLi9fYXJyYXlMaWtlS2V5cycpLFxuICAgIGJhc2VLZXlzID0gcmVxdWlyZSgnLi9fYmFzZUtleXMnKSxcbiAgICBpc0FycmF5TGlrZSA9IHJlcXVpcmUoJy4vaXNBcnJheUxpa2UnKTtcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGFycmF5IG9mIHRoZSBvd24gZW51bWVyYWJsZSBwcm9wZXJ0eSBuYW1lcyBvZiBgb2JqZWN0YC5cbiAqXG4gKiAqKk5vdGU6KiogTm9uLW9iamVjdCB2YWx1ZXMgYXJlIGNvZXJjZWQgdG8gb2JqZWN0cy4gU2VlIHRoZVxuICogW0VTIHNwZWNdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLW9iamVjdC5rZXlzKVxuICogZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBAc3RhdGljXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgT2JqZWN0XG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzLlxuICogQGV4YW1wbGVcbiAqXG4gKiBmdW5jdGlvbiBGb28oKSB7XG4gKiAgIHRoaXMuYSA9IDE7XG4gKiAgIHRoaXMuYiA9IDI7XG4gKiB9XG4gKlxuICogRm9vLnByb3RvdHlwZS5jID0gMztcbiAqXG4gKiBfLmtleXMobmV3IEZvbyk7XG4gKiAvLyA9PiBbJ2EnLCAnYiddIChpdGVyYXRpb24gb3JkZXIgaXMgbm90IGd1YXJhbnRlZWQpXG4gKlxuICogXy5rZXlzKCdoaScpO1xuICogLy8gPT4gWycwJywgJzEnXVxuICovXG5mdW5jdGlvbiBrZXlzKG9iamVjdCkge1xuICByZXR1cm4gaXNBcnJheUxpa2Uob2JqZWN0KSA/IGFycmF5TGlrZUtleXMob2JqZWN0KSA6IGJhc2VLZXlzKG9iamVjdCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ga2V5cztcbiIsInZhciBjb3B5T2JqZWN0ID0gcmVxdWlyZSgnLi9fY29weU9iamVjdCcpLFxuICAgIGtleXMgPSByZXF1aXJlKCcuL2tleXMnKTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5hc3NpZ25gIHdpdGhvdXQgc3VwcG9ydCBmb3IgbXVsdGlwbGUgc291cmNlc1xuICogb3IgYGN1c3RvbWl6ZXJgIGZ1bmN0aW9ucy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgZGVzdGluYXRpb24gb2JqZWN0LlxuICogQHBhcmFtIHtPYmplY3R9IHNvdXJjZSBUaGUgc291cmNlIG9iamVjdC5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgYG9iamVjdGAuXG4gKi9cbmZ1bmN0aW9uIGJhc2VBc3NpZ24ob2JqZWN0LCBzb3VyY2UpIHtcbiAgcmV0dXJuIG9iamVjdCAmJiBjb3B5T2JqZWN0KHNvdXJjZSwga2V5cyhzb3VyY2UpLCBvYmplY3QpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VBc3NpZ247XG4iLCJ2YXIgY29weU9iamVjdCA9IHJlcXVpcmUoJy4vX2NvcHlPYmplY3QnKSxcbiAgICBrZXlzSW4gPSByZXF1aXJlKCcuL2tleXNJbicpO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmFzc2lnbkluYCB3aXRob3V0IHN1cHBvcnQgZm9yIG11bHRpcGxlIHNvdXJjZXNcbiAqIG9yIGBjdXN0b21pemVyYCBmdW5jdGlvbnMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIGRlc3RpbmF0aW9uIG9iamVjdC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBzb3VyY2UgVGhlIHNvdXJjZSBvYmplY3QuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGBvYmplY3RgLlxuICovXG5mdW5jdGlvbiBiYXNlQXNzaWduSW4ob2JqZWN0LCBzb3VyY2UpIHtcbiAgcmV0dXJuIG9iamVjdCAmJiBjb3B5T2JqZWN0KHNvdXJjZSwga2V5c0luKHNvdXJjZSksIG9iamVjdCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUFzc2lnbkluO1xuIiwiLyoqXG4gKiBBIHNwZWNpYWxpemVkIHZlcnNpb24gb2YgYF8uZmlsdGVyYCBmb3IgYXJyYXlzIHdpdGhvdXQgc3VwcG9ydCBmb3JcbiAqIGl0ZXJhdGVlIHNob3J0aGFuZHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl9IFthcnJheV0gVGhlIGFycmF5IHRvIGl0ZXJhdGUgb3Zlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHByZWRpY2F0ZSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBuZXcgZmlsdGVyZWQgYXJyYXkuXG4gKi9cbmZ1bmN0aW9uIGFycmF5RmlsdGVyKGFycmF5LCBwcmVkaWNhdGUpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBhcnJheSA9PSBudWxsID8gMCA6IGFycmF5Lmxlbmd0aCxcbiAgICAgIHJlc0luZGV4ID0gMCxcbiAgICAgIHJlc3VsdCA9IFtdO1xuXG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgdmFyIHZhbHVlID0gYXJyYXlbaW5kZXhdO1xuICAgIGlmIChwcmVkaWNhdGUodmFsdWUsIGluZGV4LCBhcnJheSkpIHtcbiAgICAgIHJlc3VsdFtyZXNJbmRleCsrXSA9IHZhbHVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFycmF5RmlsdGVyO1xuIiwiLyoqXG4gKiBUaGlzIG1ldGhvZCByZXR1cm5zIGEgbmV3IGVtcHR5IGFycmF5LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4xMy4wXG4gKiBAY2F0ZWdvcnkgVXRpbFxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBuZXcgZW1wdHkgYXJyYXkuXG4gKiBAZXhhbXBsZVxuICpcbiAqIHZhciBhcnJheXMgPSBfLnRpbWVzKDIsIF8uc3R1YkFycmF5KTtcbiAqXG4gKiBjb25zb2xlLmxvZyhhcnJheXMpO1xuICogLy8gPT4gW1tdLCBbXV1cbiAqXG4gKiBjb25zb2xlLmxvZyhhcnJheXNbMF0gPT09IGFycmF5c1sxXSk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBzdHViQXJyYXkoKSB7XG4gIHJldHVybiBbXTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzdHViQXJyYXk7XG4iLCJ2YXIgYXJyYXlGaWx0ZXIgPSByZXF1aXJlKCcuL19hcnJheUZpbHRlcicpLFxuICAgIHN0dWJBcnJheSA9IHJlcXVpcmUoJy4vc3R1YkFycmF5Jyk7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIHByb3BlcnR5SXNFbnVtZXJhYmxlID0gb2JqZWN0UHJvdG8ucHJvcGVydHlJc0VudW1lcmFibGU7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIGZvciB0aG9zZSB3aXRoIHRoZSBzYW1lIG5hbWUgYXMgb3RoZXIgYGxvZGFzaGAgbWV0aG9kcy4gKi9cbnZhciBuYXRpdmVHZXRTeW1ib2xzID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scztcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGFycmF5IG9mIHRoZSBvd24gZW51bWVyYWJsZSBzeW1ib2xzIG9mIGBvYmplY3RgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHN5bWJvbHMuXG4gKi9cbnZhciBnZXRTeW1ib2xzID0gIW5hdGl2ZUdldFN5bWJvbHMgPyBzdHViQXJyYXkgOiBmdW5jdGlvbihvYmplY3QpIHtcbiAgaWYgKG9iamVjdCA9PSBudWxsKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG4gIG9iamVjdCA9IE9iamVjdChvYmplY3QpO1xuICByZXR1cm4gYXJyYXlGaWx0ZXIobmF0aXZlR2V0U3ltYm9scyhvYmplY3QpLCBmdW5jdGlvbihzeW1ib2wpIHtcbiAgICByZXR1cm4gcHJvcGVydHlJc0VudW1lcmFibGUuY2FsbChvYmplY3QsIHN5bWJvbCk7XG4gIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBnZXRTeW1ib2xzO1xuIiwidmFyIGNvcHlPYmplY3QgPSByZXF1aXJlKCcuL19jb3B5T2JqZWN0JyksXG4gICAgZ2V0U3ltYm9scyA9IHJlcXVpcmUoJy4vX2dldFN5bWJvbHMnKTtcblxuLyoqXG4gKiBDb3BpZXMgb3duIHN5bWJvbHMgb2YgYHNvdXJjZWAgdG8gYG9iamVjdGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBzb3VyY2UgVGhlIG9iamVjdCB0byBjb3B5IHN5bWJvbHMgZnJvbS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb2JqZWN0PXt9XSBUaGUgb2JqZWN0IHRvIGNvcHkgc3ltYm9scyB0by5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgYG9iamVjdGAuXG4gKi9cbmZ1bmN0aW9uIGNvcHlTeW1ib2xzKHNvdXJjZSwgb2JqZWN0KSB7XG4gIHJldHVybiBjb3B5T2JqZWN0KHNvdXJjZSwgZ2V0U3ltYm9scyhzb3VyY2UpLCBvYmplY3QpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNvcHlTeW1ib2xzO1xuIiwiLyoqXG4gKiBBcHBlbmRzIHRoZSBlbGVtZW50cyBvZiBgdmFsdWVzYCB0byBgYXJyYXlgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gbW9kaWZ5LlxuICogQHBhcmFtIHtBcnJheX0gdmFsdWVzIFRoZSB2YWx1ZXMgdG8gYXBwZW5kLlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIGBhcnJheWAuXG4gKi9cbmZ1bmN0aW9uIGFycmF5UHVzaChhcnJheSwgdmFsdWVzKSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gdmFsdWVzLmxlbmd0aCxcbiAgICAgIG9mZnNldCA9IGFycmF5Lmxlbmd0aDtcblxuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIGFycmF5W29mZnNldCArIGluZGV4XSA9IHZhbHVlc1tpbmRleF07XG4gIH1cbiAgcmV0dXJuIGFycmF5O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFycmF5UHVzaDtcbiIsInZhciBhcnJheVB1c2ggPSByZXF1aXJlKCcuL19hcnJheVB1c2gnKSxcbiAgICBnZXRQcm90b3R5cGUgPSByZXF1aXJlKCcuL19nZXRQcm90b3R5cGUnKSxcbiAgICBnZXRTeW1ib2xzID0gcmVxdWlyZSgnLi9fZ2V0U3ltYm9scycpLFxuICAgIHN0dWJBcnJheSA9IHJlcXVpcmUoJy4vc3R1YkFycmF5Jyk7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIGZvciB0aG9zZSB3aXRoIHRoZSBzYW1lIG5hbWUgYXMgb3RoZXIgYGxvZGFzaGAgbWV0aG9kcy4gKi9cbnZhciBuYXRpdmVHZXRTeW1ib2xzID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scztcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGFycmF5IG9mIHRoZSBvd24gYW5kIGluaGVyaXRlZCBlbnVtZXJhYmxlIHN5bWJvbHMgb2YgYG9iamVjdGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2Ygc3ltYm9scy5cbiAqL1xudmFyIGdldFN5bWJvbHNJbiA9ICFuYXRpdmVHZXRTeW1ib2xzID8gc3R1YkFycmF5IDogZnVuY3Rpb24ob2JqZWN0KSB7XG4gIHZhciByZXN1bHQgPSBbXTtcbiAgd2hpbGUgKG9iamVjdCkge1xuICAgIGFycmF5UHVzaChyZXN1bHQsIGdldFN5bWJvbHMob2JqZWN0KSk7XG4gICAgb2JqZWN0ID0gZ2V0UHJvdG90eXBlKG9iamVjdCk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0U3ltYm9sc0luO1xuIiwidmFyIGNvcHlPYmplY3QgPSByZXF1aXJlKCcuL19jb3B5T2JqZWN0JyksXG4gICAgZ2V0U3ltYm9sc0luID0gcmVxdWlyZSgnLi9fZ2V0U3ltYm9sc0luJyk7XG5cbi8qKlxuICogQ29waWVzIG93biBhbmQgaW5oZXJpdGVkIHN5bWJvbHMgb2YgYHNvdXJjZWAgdG8gYG9iamVjdGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBzb3VyY2UgVGhlIG9iamVjdCB0byBjb3B5IHN5bWJvbHMgZnJvbS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb2JqZWN0PXt9XSBUaGUgb2JqZWN0IHRvIGNvcHkgc3ltYm9scyB0by5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgYG9iamVjdGAuXG4gKi9cbmZ1bmN0aW9uIGNvcHlTeW1ib2xzSW4oc291cmNlLCBvYmplY3QpIHtcbiAgcmV0dXJuIGNvcHlPYmplY3Qoc291cmNlLCBnZXRTeW1ib2xzSW4oc291cmNlKSwgb2JqZWN0KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjb3B5U3ltYm9sc0luO1xuIiwidmFyIGFycmF5UHVzaCA9IHJlcXVpcmUoJy4vX2FycmF5UHVzaCcpLFxuICAgIGlzQXJyYXkgPSByZXF1aXJlKCcuL2lzQXJyYXknKTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgZ2V0QWxsS2V5c2AgYW5kIGBnZXRBbGxLZXlzSW5gIHdoaWNoIHVzZXNcbiAqIGBrZXlzRnVuY2AgYW5kIGBzeW1ib2xzRnVuY2AgdG8gZ2V0IHRoZSBlbnVtZXJhYmxlIHByb3BlcnR5IG5hbWVzIGFuZFxuICogc3ltYm9scyBvZiBgb2JqZWN0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHBhcmFtIHtGdW5jdGlvbn0ga2V5c0Z1bmMgVGhlIGZ1bmN0aW9uIHRvIGdldCB0aGUga2V5cyBvZiBgb2JqZWN0YC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHN5bWJvbHNGdW5jIFRoZSBmdW5jdGlvbiB0byBnZXQgdGhlIHN5bWJvbHMgb2YgYG9iamVjdGAuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzIGFuZCBzeW1ib2xzLlxuICovXG5mdW5jdGlvbiBiYXNlR2V0QWxsS2V5cyhvYmplY3QsIGtleXNGdW5jLCBzeW1ib2xzRnVuYykge1xuICB2YXIgcmVzdWx0ID0ga2V5c0Z1bmMob2JqZWN0KTtcbiAgcmV0dXJuIGlzQXJyYXkob2JqZWN0KSA/IHJlc3VsdCA6IGFycmF5UHVzaChyZXN1bHQsIHN5bWJvbHNGdW5jKG9iamVjdCkpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VHZXRBbGxLZXlzO1xuIiwidmFyIGJhc2VHZXRBbGxLZXlzID0gcmVxdWlyZSgnLi9fYmFzZUdldEFsbEtleXMnKSxcbiAgICBnZXRTeW1ib2xzID0gcmVxdWlyZSgnLi9fZ2V0U3ltYm9scycpLFxuICAgIGtleXMgPSByZXF1aXJlKCcuL2tleXMnKTtcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGFycmF5IG9mIG93biBlbnVtZXJhYmxlIHByb3BlcnR5IG5hbWVzIGFuZCBzeW1ib2xzIG9mIGBvYmplY3RgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzIGFuZCBzeW1ib2xzLlxuICovXG5mdW5jdGlvbiBnZXRBbGxLZXlzKG9iamVjdCkge1xuICByZXR1cm4gYmFzZUdldEFsbEtleXMob2JqZWN0LCBrZXlzLCBnZXRTeW1ib2xzKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZXRBbGxLZXlzO1xuIiwidmFyIGJhc2VHZXRBbGxLZXlzID0gcmVxdWlyZSgnLi9fYmFzZUdldEFsbEtleXMnKSxcbiAgICBnZXRTeW1ib2xzSW4gPSByZXF1aXJlKCcuL19nZXRTeW1ib2xzSW4nKSxcbiAgICBrZXlzSW4gPSByZXF1aXJlKCcuL2tleXNJbicpO1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gYXJyYXkgb2Ygb3duIGFuZCBpbmhlcml0ZWQgZW51bWVyYWJsZSBwcm9wZXJ0eSBuYW1lcyBhbmRcbiAqIHN5bWJvbHMgb2YgYG9iamVjdGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMgYW5kIHN5bWJvbHMuXG4gKi9cbmZ1bmN0aW9uIGdldEFsbEtleXNJbihvYmplY3QpIHtcbiAgcmV0dXJuIGJhc2VHZXRBbGxLZXlzKG9iamVjdCwga2V5c0luLCBnZXRTeW1ib2xzSW4pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldEFsbEtleXNJbjtcbiIsInZhciBnZXROYXRpdmUgPSByZXF1aXJlKCcuL19nZXROYXRpdmUnKSxcbiAgICByb290ID0gcmVxdWlyZSgnLi9fcm9vdCcpO1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyB0aGF0IGFyZSB2ZXJpZmllZCB0byBiZSBuYXRpdmUuICovXG52YXIgRGF0YVZpZXcgPSBnZXROYXRpdmUocm9vdCwgJ0RhdGFWaWV3Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gRGF0YVZpZXc7XG4iLCJ2YXIgZ2V0TmF0aXZlID0gcmVxdWlyZSgnLi9fZ2V0TmF0aXZlJyksXG4gICAgcm9vdCA9IHJlcXVpcmUoJy4vX3Jvb3QnKTtcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgdGhhdCBhcmUgdmVyaWZpZWQgdG8gYmUgbmF0aXZlLiAqL1xudmFyIFByb21pc2UgPSBnZXROYXRpdmUocm9vdCwgJ1Byb21pc2UnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBQcm9taXNlO1xuIiwidmFyIGdldE5hdGl2ZSA9IHJlcXVpcmUoJy4vX2dldE5hdGl2ZScpLFxuICAgIHJvb3QgPSByZXF1aXJlKCcuL19yb290Jyk7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIHRoYXQgYXJlIHZlcmlmaWVkIHRvIGJlIG5hdGl2ZS4gKi9cbnZhciBTZXQgPSBnZXROYXRpdmUocm9vdCwgJ1NldCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNldDtcbiIsInZhciBnZXROYXRpdmUgPSByZXF1aXJlKCcuL19nZXROYXRpdmUnKSxcbiAgICByb290ID0gcmVxdWlyZSgnLi9fcm9vdCcpO1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyB0aGF0IGFyZSB2ZXJpZmllZCB0byBiZSBuYXRpdmUuICovXG52YXIgV2Vha01hcCA9IGdldE5hdGl2ZShyb290LCAnV2Vha01hcCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFdlYWtNYXA7XG4iLCJ2YXIgRGF0YVZpZXcgPSByZXF1aXJlKCcuL19EYXRhVmlldycpLFxuICAgIE1hcCA9IHJlcXVpcmUoJy4vX01hcCcpLFxuICAgIFByb21pc2UgPSByZXF1aXJlKCcuL19Qcm9taXNlJyksXG4gICAgU2V0ID0gcmVxdWlyZSgnLi9fU2V0JyksXG4gICAgV2Vha01hcCA9IHJlcXVpcmUoJy4vX1dlYWtNYXAnKSxcbiAgICBiYXNlR2V0VGFnID0gcmVxdWlyZSgnLi9fYmFzZUdldFRhZycpLFxuICAgIHRvU291cmNlID0gcmVxdWlyZSgnLi9fdG9Tb3VyY2UnKTtcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIG1hcFRhZyA9ICdbb2JqZWN0IE1hcF0nLFxuICAgIG9iamVjdFRhZyA9ICdbb2JqZWN0IE9iamVjdF0nLFxuICAgIHByb21pc2VUYWcgPSAnW29iamVjdCBQcm9taXNlXScsXG4gICAgc2V0VGFnID0gJ1tvYmplY3QgU2V0XScsXG4gICAgd2Vha01hcFRhZyA9ICdbb2JqZWN0IFdlYWtNYXBdJztcblxudmFyIGRhdGFWaWV3VGFnID0gJ1tvYmplY3QgRGF0YVZpZXddJztcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IG1hcHMsIHNldHMsIGFuZCB3ZWFrbWFwcy4gKi9cbnZhciBkYXRhVmlld0N0b3JTdHJpbmcgPSB0b1NvdXJjZShEYXRhVmlldyksXG4gICAgbWFwQ3RvclN0cmluZyA9IHRvU291cmNlKE1hcCksXG4gICAgcHJvbWlzZUN0b3JTdHJpbmcgPSB0b1NvdXJjZShQcm9taXNlKSxcbiAgICBzZXRDdG9yU3RyaW5nID0gdG9Tb3VyY2UoU2V0KSxcbiAgICB3ZWFrTWFwQ3RvclN0cmluZyA9IHRvU291cmNlKFdlYWtNYXApO1xuXG4vKipcbiAqIEdldHMgdGhlIGB0b1N0cmluZ1RhZ2Agb2YgYHZhbHVlYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBgdG9TdHJpbmdUYWdgLlxuICovXG52YXIgZ2V0VGFnID0gYmFzZUdldFRhZztcblxuLy8gRmFsbGJhY2sgZm9yIGRhdGEgdmlld3MsIG1hcHMsIHNldHMsIGFuZCB3ZWFrIG1hcHMgaW4gSUUgMTEgYW5kIHByb21pc2VzIGluIE5vZGUuanMgPCA2LlxuaWYgKChEYXRhVmlldyAmJiBnZXRUYWcobmV3IERhdGFWaWV3KG5ldyBBcnJheUJ1ZmZlcigxKSkpICE9IGRhdGFWaWV3VGFnKSB8fFxuICAgIChNYXAgJiYgZ2V0VGFnKG5ldyBNYXApICE9IG1hcFRhZykgfHxcbiAgICAoUHJvbWlzZSAmJiBnZXRUYWcoUHJvbWlzZS5yZXNvbHZlKCkpICE9IHByb21pc2VUYWcpIHx8XG4gICAgKFNldCAmJiBnZXRUYWcobmV3IFNldCkgIT0gc2V0VGFnKSB8fFxuICAgIChXZWFrTWFwICYmIGdldFRhZyhuZXcgV2Vha01hcCkgIT0gd2Vha01hcFRhZykpIHtcbiAgZ2V0VGFnID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICB2YXIgcmVzdWx0ID0gYmFzZUdldFRhZyh2YWx1ZSksXG4gICAgICAgIEN0b3IgPSByZXN1bHQgPT0gb2JqZWN0VGFnID8gdmFsdWUuY29uc3RydWN0b3IgOiB1bmRlZmluZWQsXG4gICAgICAgIGN0b3JTdHJpbmcgPSBDdG9yID8gdG9Tb3VyY2UoQ3RvcikgOiAnJztcblxuICAgIGlmIChjdG9yU3RyaW5nKSB7XG4gICAgICBzd2l0Y2ggKGN0b3JTdHJpbmcpIHtcbiAgICAgICAgY2FzZSBkYXRhVmlld0N0b3JTdHJpbmc6IHJldHVybiBkYXRhVmlld1RhZztcbiAgICAgICAgY2FzZSBtYXBDdG9yU3RyaW5nOiByZXR1cm4gbWFwVGFnO1xuICAgICAgICBjYXNlIHByb21pc2VDdG9yU3RyaW5nOiByZXR1cm4gcHJvbWlzZVRhZztcbiAgICAgICAgY2FzZSBzZXRDdG9yU3RyaW5nOiByZXR1cm4gc2V0VGFnO1xuICAgICAgICBjYXNlIHdlYWtNYXBDdG9yU3RyaW5nOiByZXR1cm4gd2Vha01hcFRhZztcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZXRUYWc7XG4iLCIvKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIEluaXRpYWxpemVzIGFuIGFycmF5IGNsb25lLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gY2xvbmUuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGluaXRpYWxpemVkIGNsb25lLlxuICovXG5mdW5jdGlvbiBpbml0Q2xvbmVBcnJheShhcnJheSkge1xuICB2YXIgbGVuZ3RoID0gYXJyYXkubGVuZ3RoLFxuICAgICAgcmVzdWx0ID0gYXJyYXkuY29uc3RydWN0b3IobGVuZ3RoKTtcblxuICAvLyBBZGQgcHJvcGVydGllcyBhc3NpZ25lZCBieSBgUmVnRXhwI2V4ZWNgLlxuICBpZiAobGVuZ3RoICYmIHR5cGVvZiBhcnJheVswXSA9PSAnc3RyaW5nJyAmJiBoYXNPd25Qcm9wZXJ0eS5jYWxsKGFycmF5LCAnaW5kZXgnKSkge1xuICAgIHJlc3VsdC5pbmRleCA9IGFycmF5LmluZGV4O1xuICAgIHJlc3VsdC5pbnB1dCA9IGFycmF5LmlucHV0O1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaW5pdENsb25lQXJyYXk7XG4iLCJ2YXIgY2xvbmVBcnJheUJ1ZmZlciA9IHJlcXVpcmUoJy4vX2Nsb25lQXJyYXlCdWZmZXInKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgY2xvbmUgb2YgYGRhdGFWaWV3YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IGRhdGFWaWV3IFRoZSBkYXRhIHZpZXcgdG8gY2xvbmUuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtpc0RlZXBdIFNwZWNpZnkgYSBkZWVwIGNsb25lLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgY2xvbmVkIGRhdGEgdmlldy5cbiAqL1xuZnVuY3Rpb24gY2xvbmVEYXRhVmlldyhkYXRhVmlldywgaXNEZWVwKSB7XG4gIHZhciBidWZmZXIgPSBpc0RlZXAgPyBjbG9uZUFycmF5QnVmZmVyKGRhdGFWaWV3LmJ1ZmZlcikgOiBkYXRhVmlldy5idWZmZXI7XG4gIHJldHVybiBuZXcgZGF0YVZpZXcuY29uc3RydWN0b3IoYnVmZmVyLCBkYXRhVmlldy5ieXRlT2Zmc2V0LCBkYXRhVmlldy5ieXRlTGVuZ3RoKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjbG9uZURhdGFWaWV3O1xuIiwiLyoqXG4gKiBBZGRzIHRoZSBrZXktdmFsdWUgYHBhaXJgIHRvIGBtYXBgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gbWFwIFRoZSBtYXAgdG8gbW9kaWZ5LlxuICogQHBhcmFtIHtBcnJheX0gcGFpciBUaGUga2V5LXZhbHVlIHBhaXIgdG8gYWRkLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBgbWFwYC5cbiAqL1xuZnVuY3Rpb24gYWRkTWFwRW50cnkobWFwLCBwYWlyKSB7XG4gIC8vIERvbid0IHJldHVybiBgbWFwLnNldGAgYmVjYXVzZSBpdCdzIG5vdCBjaGFpbmFibGUgaW4gSUUgMTEuXG4gIG1hcC5zZXQocGFpclswXSwgcGFpclsxXSk7XG4gIHJldHVybiBtYXA7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYWRkTWFwRW50cnk7XG4iLCIvKipcbiAqIEEgc3BlY2lhbGl6ZWQgdmVyc2lvbiBvZiBgXy5yZWR1Y2VgIGZvciBhcnJheXMgd2l0aG91dCBzdXBwb3J0IGZvclxuICogaXRlcmF0ZWUgc2hvcnRoYW5kcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheX0gW2FycmF5XSBUaGUgYXJyYXkgdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0ZWUgVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEBwYXJhbSB7Kn0gW2FjY3VtdWxhdG9yXSBUaGUgaW5pdGlhbCB2YWx1ZS5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2luaXRBY2N1bV0gU3BlY2lmeSB1c2luZyB0aGUgZmlyc3QgZWxlbWVudCBvZiBgYXJyYXlgIGFzXG4gKiAgdGhlIGluaXRpYWwgdmFsdWUuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgYWNjdW11bGF0ZWQgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIGFycmF5UmVkdWNlKGFycmF5LCBpdGVyYXRlZSwgYWNjdW11bGF0b3IsIGluaXRBY2N1bSkge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IGFycmF5ID09IG51bGwgPyAwIDogYXJyYXkubGVuZ3RoO1xuXG4gIGlmIChpbml0QWNjdW0gJiYgbGVuZ3RoKSB7XG4gICAgYWNjdW11bGF0b3IgPSBhcnJheVsrK2luZGV4XTtcbiAgfVxuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIGFjY3VtdWxhdG9yID0gaXRlcmF0ZWUoYWNjdW11bGF0b3IsIGFycmF5W2luZGV4XSwgaW5kZXgsIGFycmF5KTtcbiAgfVxuICByZXR1cm4gYWNjdW11bGF0b3I7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYXJyYXlSZWR1Y2U7XG4iLCIvKipcbiAqIENvbnZlcnRzIGBtYXBgIHRvIGl0cyBrZXktdmFsdWUgcGFpcnMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBtYXAgVGhlIG1hcCB0byBjb252ZXJ0LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBrZXktdmFsdWUgcGFpcnMuXG4gKi9cbmZ1bmN0aW9uIG1hcFRvQXJyYXkobWFwKSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgcmVzdWx0ID0gQXJyYXkobWFwLnNpemUpO1xuXG4gIG1hcC5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICByZXN1bHRbKytpbmRleF0gPSBba2V5LCB2YWx1ZV07XG4gIH0pO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG1hcFRvQXJyYXk7XG4iLCJ2YXIgYWRkTWFwRW50cnkgPSByZXF1aXJlKCcuL19hZGRNYXBFbnRyeScpLFxuICAgIGFycmF5UmVkdWNlID0gcmVxdWlyZSgnLi9fYXJyYXlSZWR1Y2UnKSxcbiAgICBtYXBUb0FycmF5ID0gcmVxdWlyZSgnLi9fbWFwVG9BcnJheScpO1xuXG4vKiogVXNlZCB0byBjb21wb3NlIGJpdG1hc2tzIGZvciBjbG9uaW5nLiAqL1xudmFyIENMT05FX0RFRVBfRkxBRyA9IDE7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGNsb25lIG9mIGBtYXBgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gbWFwIFRoZSBtYXAgdG8gY2xvbmUuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjbG9uZUZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGNsb25lIHZhbHVlcy5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzRGVlcF0gU3BlY2lmeSBhIGRlZXAgY2xvbmUuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBjbG9uZWQgbWFwLlxuICovXG5mdW5jdGlvbiBjbG9uZU1hcChtYXAsIGlzRGVlcCwgY2xvbmVGdW5jKSB7XG4gIHZhciBhcnJheSA9IGlzRGVlcCA/IGNsb25lRnVuYyhtYXBUb0FycmF5KG1hcCksIENMT05FX0RFRVBfRkxBRykgOiBtYXBUb0FycmF5KG1hcCk7XG4gIHJldHVybiBhcnJheVJlZHVjZShhcnJheSwgYWRkTWFwRW50cnksIG5ldyBtYXAuY29uc3RydWN0b3IpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsb25lTWFwO1xuIiwiLyoqIFVzZWQgdG8gbWF0Y2ggYFJlZ0V4cGAgZmxhZ3MgZnJvbSB0aGVpciBjb2VyY2VkIHN0cmluZyB2YWx1ZXMuICovXG52YXIgcmVGbGFncyA9IC9cXHcqJC87XG5cbi8qKlxuICogQ3JlYXRlcyBhIGNsb25lIG9mIGByZWdleHBgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gcmVnZXhwIFRoZSByZWdleHAgdG8gY2xvbmUuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBjbG9uZWQgcmVnZXhwLlxuICovXG5mdW5jdGlvbiBjbG9uZVJlZ0V4cChyZWdleHApIHtcbiAgdmFyIHJlc3VsdCA9IG5ldyByZWdleHAuY29uc3RydWN0b3IocmVnZXhwLnNvdXJjZSwgcmVGbGFncy5leGVjKHJlZ2V4cCkpO1xuICByZXN1bHQubGFzdEluZGV4ID0gcmVnZXhwLmxhc3RJbmRleDtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjbG9uZVJlZ0V4cDtcbiIsIi8qKlxuICogQWRkcyBgdmFsdWVgIHRvIGBzZXRgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gc2V0IFRoZSBzZXQgdG8gbW9kaWZ5LlxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gYWRkLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBgc2V0YC5cbiAqL1xuZnVuY3Rpb24gYWRkU2V0RW50cnkoc2V0LCB2YWx1ZSkge1xuICAvLyBEb24ndCByZXR1cm4gYHNldC5hZGRgIGJlY2F1c2UgaXQncyBub3QgY2hhaW5hYmxlIGluIElFIDExLlxuICBzZXQuYWRkKHZhbHVlKTtcbiAgcmV0dXJuIHNldDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBhZGRTZXRFbnRyeTtcbiIsIi8qKlxuICogQ29udmVydHMgYHNldGAgdG8gYW4gYXJyYXkgb2YgaXRzIHZhbHVlcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IHNldCBUaGUgc2V0IHRvIGNvbnZlcnQuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIHZhbHVlcy5cbiAqL1xuZnVuY3Rpb24gc2V0VG9BcnJheShzZXQpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICByZXN1bHQgPSBBcnJheShzZXQuc2l6ZSk7XG5cbiAgc2V0LmZvckVhY2goZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXN1bHRbKytpbmRleF0gPSB2YWx1ZTtcbiAgfSk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc2V0VG9BcnJheTtcbiIsInZhciBhZGRTZXRFbnRyeSA9IHJlcXVpcmUoJy4vX2FkZFNldEVudHJ5JyksXG4gICAgYXJyYXlSZWR1Y2UgPSByZXF1aXJlKCcuL19hcnJheVJlZHVjZScpLFxuICAgIHNldFRvQXJyYXkgPSByZXF1aXJlKCcuL19zZXRUb0FycmF5Jyk7XG5cbi8qKiBVc2VkIHRvIGNvbXBvc2UgYml0bWFza3MgZm9yIGNsb25pbmcuICovXG52YXIgQ0xPTkVfREVFUF9GTEFHID0gMTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgY2xvbmUgb2YgYHNldGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBzZXQgVGhlIHNldCB0byBjbG9uZS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNsb25lRnVuYyBUaGUgZnVuY3Rpb24gdG8gY2xvbmUgdmFsdWVzLlxuICogQHBhcmFtIHtib29sZWFufSBbaXNEZWVwXSBTcGVjaWZ5IGEgZGVlcCBjbG9uZS5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIGNsb25lZCBzZXQuXG4gKi9cbmZ1bmN0aW9uIGNsb25lU2V0KHNldCwgaXNEZWVwLCBjbG9uZUZ1bmMpIHtcbiAgdmFyIGFycmF5ID0gaXNEZWVwID8gY2xvbmVGdW5jKHNldFRvQXJyYXkoc2V0KSwgQ0xPTkVfREVFUF9GTEFHKSA6IHNldFRvQXJyYXkoc2V0KTtcbiAgcmV0dXJuIGFycmF5UmVkdWNlKGFycmF5LCBhZGRTZXRFbnRyeSwgbmV3IHNldC5jb25zdHJ1Y3Rvcik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY2xvbmVTZXQ7XG4iLCJ2YXIgU3ltYm9sID0gcmVxdWlyZSgnLi9fU3ltYm9sJyk7XG5cbi8qKiBVc2VkIHRvIGNvbnZlcnQgc3ltYm9scyB0byBwcmltaXRpdmVzIGFuZCBzdHJpbmdzLiAqL1xudmFyIHN5bWJvbFByb3RvID0gU3ltYm9sID8gU3ltYm9sLnByb3RvdHlwZSA6IHVuZGVmaW5lZCxcbiAgICBzeW1ib2xWYWx1ZU9mID0gc3ltYm9sUHJvdG8gPyBzeW1ib2xQcm90by52YWx1ZU9mIDogdW5kZWZpbmVkO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBjbG9uZSBvZiB0aGUgYHN5bWJvbGAgb2JqZWN0LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gc3ltYm9sIFRoZSBzeW1ib2wgb2JqZWN0IHRvIGNsb25lLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgY2xvbmVkIHN5bWJvbCBvYmplY3QuXG4gKi9cbmZ1bmN0aW9uIGNsb25lU3ltYm9sKHN5bWJvbCkge1xuICByZXR1cm4gc3ltYm9sVmFsdWVPZiA/IE9iamVjdChzeW1ib2xWYWx1ZU9mLmNhbGwoc3ltYm9sKSkgOiB7fTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjbG9uZVN5bWJvbDtcbiIsInZhciBjbG9uZUFycmF5QnVmZmVyID0gcmVxdWlyZSgnLi9fY2xvbmVBcnJheUJ1ZmZlcicpLFxuICAgIGNsb25lRGF0YVZpZXcgPSByZXF1aXJlKCcuL19jbG9uZURhdGFWaWV3JyksXG4gICAgY2xvbmVNYXAgPSByZXF1aXJlKCcuL19jbG9uZU1hcCcpLFxuICAgIGNsb25lUmVnRXhwID0gcmVxdWlyZSgnLi9fY2xvbmVSZWdFeHAnKSxcbiAgICBjbG9uZVNldCA9IHJlcXVpcmUoJy4vX2Nsb25lU2V0JyksXG4gICAgY2xvbmVTeW1ib2wgPSByZXF1aXJlKCcuL19jbG9uZVN5bWJvbCcpLFxuICAgIGNsb25lVHlwZWRBcnJheSA9IHJlcXVpcmUoJy4vX2Nsb25lVHlwZWRBcnJheScpO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgYm9vbFRhZyA9ICdbb2JqZWN0IEJvb2xlYW5dJyxcbiAgICBkYXRlVGFnID0gJ1tvYmplY3QgRGF0ZV0nLFxuICAgIG1hcFRhZyA9ICdbb2JqZWN0IE1hcF0nLFxuICAgIG51bWJlclRhZyA9ICdbb2JqZWN0IE51bWJlcl0nLFxuICAgIHJlZ2V4cFRhZyA9ICdbb2JqZWN0IFJlZ0V4cF0nLFxuICAgIHNldFRhZyA9ICdbb2JqZWN0IFNldF0nLFxuICAgIHN0cmluZ1RhZyA9ICdbb2JqZWN0IFN0cmluZ10nLFxuICAgIHN5bWJvbFRhZyA9ICdbb2JqZWN0IFN5bWJvbF0nO1xuXG52YXIgYXJyYXlCdWZmZXJUYWcgPSAnW29iamVjdCBBcnJheUJ1ZmZlcl0nLFxuICAgIGRhdGFWaWV3VGFnID0gJ1tvYmplY3QgRGF0YVZpZXddJyxcbiAgICBmbG9hdDMyVGFnID0gJ1tvYmplY3QgRmxvYXQzMkFycmF5XScsXG4gICAgZmxvYXQ2NFRhZyA9ICdbb2JqZWN0IEZsb2F0NjRBcnJheV0nLFxuICAgIGludDhUYWcgPSAnW29iamVjdCBJbnQ4QXJyYXldJyxcbiAgICBpbnQxNlRhZyA9ICdbb2JqZWN0IEludDE2QXJyYXldJyxcbiAgICBpbnQzMlRhZyA9ICdbb2JqZWN0IEludDMyQXJyYXldJyxcbiAgICB1aW50OFRhZyA9ICdbb2JqZWN0IFVpbnQ4QXJyYXldJyxcbiAgICB1aW50OENsYW1wZWRUYWcgPSAnW29iamVjdCBVaW50OENsYW1wZWRBcnJheV0nLFxuICAgIHVpbnQxNlRhZyA9ICdbb2JqZWN0IFVpbnQxNkFycmF5XScsXG4gICAgdWludDMyVGFnID0gJ1tvYmplY3QgVWludDMyQXJyYXldJztcblxuLyoqXG4gKiBJbml0aWFsaXplcyBhbiBvYmplY3QgY2xvbmUgYmFzZWQgb24gaXRzIGB0b1N0cmluZ1RhZ2AuXG4gKlxuICogKipOb3RlOioqIFRoaXMgZnVuY3Rpb24gb25seSBzdXBwb3J0cyBjbG9uaW5nIHZhbHVlcyB3aXRoIHRhZ3Mgb2ZcbiAqIGBCb29sZWFuYCwgYERhdGVgLCBgRXJyb3JgLCBgTnVtYmVyYCwgYFJlZ0V4cGAsIG9yIGBTdHJpbmdgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gY2xvbmUuXG4gKiBAcGFyYW0ge3N0cmluZ30gdGFnIFRoZSBgdG9TdHJpbmdUYWdgIG9mIHRoZSBvYmplY3QgdG8gY2xvbmUuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjbG9uZUZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGNsb25lIHZhbHVlcy5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzRGVlcF0gU3BlY2lmeSBhIGRlZXAgY2xvbmUuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBpbml0aWFsaXplZCBjbG9uZS5cbiAqL1xuZnVuY3Rpb24gaW5pdENsb25lQnlUYWcob2JqZWN0LCB0YWcsIGNsb25lRnVuYywgaXNEZWVwKSB7XG4gIHZhciBDdG9yID0gb2JqZWN0LmNvbnN0cnVjdG9yO1xuICBzd2l0Y2ggKHRhZykge1xuICAgIGNhc2UgYXJyYXlCdWZmZXJUYWc6XG4gICAgICByZXR1cm4gY2xvbmVBcnJheUJ1ZmZlcihvYmplY3QpO1xuXG4gICAgY2FzZSBib29sVGFnOlxuICAgIGNhc2UgZGF0ZVRhZzpcbiAgICAgIHJldHVybiBuZXcgQ3Rvcigrb2JqZWN0KTtcblxuICAgIGNhc2UgZGF0YVZpZXdUYWc6XG4gICAgICByZXR1cm4gY2xvbmVEYXRhVmlldyhvYmplY3QsIGlzRGVlcCk7XG5cbiAgICBjYXNlIGZsb2F0MzJUYWc6IGNhc2UgZmxvYXQ2NFRhZzpcbiAgICBjYXNlIGludDhUYWc6IGNhc2UgaW50MTZUYWc6IGNhc2UgaW50MzJUYWc6XG4gICAgY2FzZSB1aW50OFRhZzogY2FzZSB1aW50OENsYW1wZWRUYWc6IGNhc2UgdWludDE2VGFnOiBjYXNlIHVpbnQzMlRhZzpcbiAgICAgIHJldHVybiBjbG9uZVR5cGVkQXJyYXkob2JqZWN0LCBpc0RlZXApO1xuXG4gICAgY2FzZSBtYXBUYWc6XG4gICAgICByZXR1cm4gY2xvbmVNYXAob2JqZWN0LCBpc0RlZXAsIGNsb25lRnVuYyk7XG5cbiAgICBjYXNlIG51bWJlclRhZzpcbiAgICBjYXNlIHN0cmluZ1RhZzpcbiAgICAgIHJldHVybiBuZXcgQ3RvcihvYmplY3QpO1xuXG4gICAgY2FzZSByZWdleHBUYWc6XG4gICAgICByZXR1cm4gY2xvbmVSZWdFeHAob2JqZWN0KTtcblxuICAgIGNhc2Ugc2V0VGFnOlxuICAgICAgcmV0dXJuIGNsb25lU2V0KG9iamVjdCwgaXNEZWVwLCBjbG9uZUZ1bmMpO1xuXG4gICAgY2FzZSBzeW1ib2xUYWc6XG4gICAgICByZXR1cm4gY2xvbmVTeW1ib2wob2JqZWN0KTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGluaXRDbG9uZUJ5VGFnO1xuIiwidmFyIFN0YWNrID0gcmVxdWlyZSgnLi9fU3RhY2snKSxcbiAgICBhcnJheUVhY2ggPSByZXF1aXJlKCcuL19hcnJheUVhY2gnKSxcbiAgICBhc3NpZ25WYWx1ZSA9IHJlcXVpcmUoJy4vX2Fzc2lnblZhbHVlJyksXG4gICAgYmFzZUFzc2lnbiA9IHJlcXVpcmUoJy4vX2Jhc2VBc3NpZ24nKSxcbiAgICBiYXNlQXNzaWduSW4gPSByZXF1aXJlKCcuL19iYXNlQXNzaWduSW4nKSxcbiAgICBjbG9uZUJ1ZmZlciA9IHJlcXVpcmUoJy4vX2Nsb25lQnVmZmVyJyksXG4gICAgY29weUFycmF5ID0gcmVxdWlyZSgnLi9fY29weUFycmF5JyksXG4gICAgY29weVN5bWJvbHMgPSByZXF1aXJlKCcuL19jb3B5U3ltYm9scycpLFxuICAgIGNvcHlTeW1ib2xzSW4gPSByZXF1aXJlKCcuL19jb3B5U3ltYm9sc0luJyksXG4gICAgZ2V0QWxsS2V5cyA9IHJlcXVpcmUoJy4vX2dldEFsbEtleXMnKSxcbiAgICBnZXRBbGxLZXlzSW4gPSByZXF1aXJlKCcuL19nZXRBbGxLZXlzSW4nKSxcbiAgICBnZXRUYWcgPSByZXF1aXJlKCcuL19nZXRUYWcnKSxcbiAgICBpbml0Q2xvbmVBcnJheSA9IHJlcXVpcmUoJy4vX2luaXRDbG9uZUFycmF5JyksXG4gICAgaW5pdENsb25lQnlUYWcgPSByZXF1aXJlKCcuL19pbml0Q2xvbmVCeVRhZycpLFxuICAgIGluaXRDbG9uZU9iamVjdCA9IHJlcXVpcmUoJy4vX2luaXRDbG9uZU9iamVjdCcpLFxuICAgIGlzQXJyYXkgPSByZXF1aXJlKCcuL2lzQXJyYXknKSxcbiAgICBpc0J1ZmZlciA9IHJlcXVpcmUoJy4vaXNCdWZmZXInKSxcbiAgICBpc09iamVjdCA9IHJlcXVpcmUoJy4vaXNPYmplY3QnKSxcbiAgICBrZXlzID0gcmVxdWlyZSgnLi9rZXlzJyk7XG5cbi8qKiBVc2VkIHRvIGNvbXBvc2UgYml0bWFza3MgZm9yIGNsb25pbmcuICovXG52YXIgQ0xPTkVfREVFUF9GTEFHID0gMSxcbiAgICBDTE9ORV9GTEFUX0ZMQUcgPSAyLFxuICAgIENMT05FX1NZTUJPTFNfRkxBRyA9IDQ7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBhcmdzVGFnID0gJ1tvYmplY3QgQXJndW1lbnRzXScsXG4gICAgYXJyYXlUYWcgPSAnW29iamVjdCBBcnJheV0nLFxuICAgIGJvb2xUYWcgPSAnW29iamVjdCBCb29sZWFuXScsXG4gICAgZGF0ZVRhZyA9ICdbb2JqZWN0IERhdGVdJyxcbiAgICBlcnJvclRhZyA9ICdbb2JqZWN0IEVycm9yXScsXG4gICAgZnVuY1RhZyA9ICdbb2JqZWN0IEZ1bmN0aW9uXScsXG4gICAgZ2VuVGFnID0gJ1tvYmplY3QgR2VuZXJhdG9yRnVuY3Rpb25dJyxcbiAgICBtYXBUYWcgPSAnW29iamVjdCBNYXBdJyxcbiAgICBudW1iZXJUYWcgPSAnW29iamVjdCBOdW1iZXJdJyxcbiAgICBvYmplY3RUYWcgPSAnW29iamVjdCBPYmplY3RdJyxcbiAgICByZWdleHBUYWcgPSAnW29iamVjdCBSZWdFeHBdJyxcbiAgICBzZXRUYWcgPSAnW29iamVjdCBTZXRdJyxcbiAgICBzdHJpbmdUYWcgPSAnW29iamVjdCBTdHJpbmddJyxcbiAgICBzeW1ib2xUYWcgPSAnW29iamVjdCBTeW1ib2xdJyxcbiAgICB3ZWFrTWFwVGFnID0gJ1tvYmplY3QgV2Vha01hcF0nO1xuXG52YXIgYXJyYXlCdWZmZXJUYWcgPSAnW29iamVjdCBBcnJheUJ1ZmZlcl0nLFxuICAgIGRhdGFWaWV3VGFnID0gJ1tvYmplY3QgRGF0YVZpZXddJyxcbiAgICBmbG9hdDMyVGFnID0gJ1tvYmplY3QgRmxvYXQzMkFycmF5XScsXG4gICAgZmxvYXQ2NFRhZyA9ICdbb2JqZWN0IEZsb2F0NjRBcnJheV0nLFxuICAgIGludDhUYWcgPSAnW29iamVjdCBJbnQ4QXJyYXldJyxcbiAgICBpbnQxNlRhZyA9ICdbb2JqZWN0IEludDE2QXJyYXldJyxcbiAgICBpbnQzMlRhZyA9ICdbb2JqZWN0IEludDMyQXJyYXldJyxcbiAgICB1aW50OFRhZyA9ICdbb2JqZWN0IFVpbnQ4QXJyYXldJyxcbiAgICB1aW50OENsYW1wZWRUYWcgPSAnW29iamVjdCBVaW50OENsYW1wZWRBcnJheV0nLFxuICAgIHVpbnQxNlRhZyA9ICdbb2JqZWN0IFVpbnQxNkFycmF5XScsXG4gICAgdWludDMyVGFnID0gJ1tvYmplY3QgVWludDMyQXJyYXldJztcblxuLyoqIFVzZWQgdG8gaWRlbnRpZnkgYHRvU3RyaW5nVGFnYCB2YWx1ZXMgc3VwcG9ydGVkIGJ5IGBfLmNsb25lYC4gKi9cbnZhciBjbG9uZWFibGVUYWdzID0ge307XG5jbG9uZWFibGVUYWdzW2FyZ3NUYWddID0gY2xvbmVhYmxlVGFnc1thcnJheVRhZ10gPVxuY2xvbmVhYmxlVGFnc1thcnJheUJ1ZmZlclRhZ10gPSBjbG9uZWFibGVUYWdzW2RhdGFWaWV3VGFnXSA9XG5jbG9uZWFibGVUYWdzW2Jvb2xUYWddID0gY2xvbmVhYmxlVGFnc1tkYXRlVGFnXSA9XG5jbG9uZWFibGVUYWdzW2Zsb2F0MzJUYWddID0gY2xvbmVhYmxlVGFnc1tmbG9hdDY0VGFnXSA9XG5jbG9uZWFibGVUYWdzW2ludDhUYWddID0gY2xvbmVhYmxlVGFnc1tpbnQxNlRhZ10gPVxuY2xvbmVhYmxlVGFnc1tpbnQzMlRhZ10gPSBjbG9uZWFibGVUYWdzW21hcFRhZ10gPVxuY2xvbmVhYmxlVGFnc1tudW1iZXJUYWddID0gY2xvbmVhYmxlVGFnc1tvYmplY3RUYWddID1cbmNsb25lYWJsZVRhZ3NbcmVnZXhwVGFnXSA9IGNsb25lYWJsZVRhZ3Nbc2V0VGFnXSA9XG5jbG9uZWFibGVUYWdzW3N0cmluZ1RhZ10gPSBjbG9uZWFibGVUYWdzW3N5bWJvbFRhZ10gPVxuY2xvbmVhYmxlVGFnc1t1aW50OFRhZ10gPSBjbG9uZWFibGVUYWdzW3VpbnQ4Q2xhbXBlZFRhZ10gPVxuY2xvbmVhYmxlVGFnc1t1aW50MTZUYWddID0gY2xvbmVhYmxlVGFnc1t1aW50MzJUYWddID0gdHJ1ZTtcbmNsb25lYWJsZVRhZ3NbZXJyb3JUYWddID0gY2xvbmVhYmxlVGFnc1tmdW5jVGFnXSA9XG5jbG9uZWFibGVUYWdzW3dlYWtNYXBUYWddID0gZmFsc2U7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uY2xvbmVgIGFuZCBgXy5jbG9uZURlZXBgIHdoaWNoIHRyYWNrc1xuICogdHJhdmVyc2VkIG9iamVjdHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNsb25lLlxuICogQHBhcmFtIHtib29sZWFufSBiaXRtYXNrIFRoZSBiaXRtYXNrIGZsYWdzLlxuICogIDEgLSBEZWVwIGNsb25lXG4gKiAgMiAtIEZsYXR0ZW4gaW5oZXJpdGVkIHByb3BlcnRpZXNcbiAqICA0IC0gQ2xvbmUgc3ltYm9sc1xuICogQHBhcmFtIHtGdW5jdGlvbn0gW2N1c3RvbWl6ZXJdIFRoZSBmdW5jdGlvbiB0byBjdXN0b21pemUgY2xvbmluZy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBba2V5XSBUaGUga2V5IG9mIGB2YWx1ZWAuXG4gKiBAcGFyYW0ge09iamVjdH0gW29iamVjdF0gVGhlIHBhcmVudCBvYmplY3Qgb2YgYHZhbHVlYC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbc3RhY2tdIFRyYWNrcyB0cmF2ZXJzZWQgb2JqZWN0cyBhbmQgdGhlaXIgY2xvbmUgY291bnRlcnBhcnRzLlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIGNsb25lZCB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gYmFzZUNsb25lKHZhbHVlLCBiaXRtYXNrLCBjdXN0b21pemVyLCBrZXksIG9iamVjdCwgc3RhY2spIHtcbiAgdmFyIHJlc3VsdCxcbiAgICAgIGlzRGVlcCA9IGJpdG1hc2sgJiBDTE9ORV9ERUVQX0ZMQUcsXG4gICAgICBpc0ZsYXQgPSBiaXRtYXNrICYgQ0xPTkVfRkxBVF9GTEFHLFxuICAgICAgaXNGdWxsID0gYml0bWFzayAmIENMT05FX1NZTUJPTFNfRkxBRztcblxuICBpZiAoY3VzdG9taXplcikge1xuICAgIHJlc3VsdCA9IG9iamVjdCA/IGN1c3RvbWl6ZXIodmFsdWUsIGtleSwgb2JqZWN0LCBzdGFjaykgOiBjdXN0b21pemVyKHZhbHVlKTtcbiAgfVxuICBpZiAocmVzdWx0ICE9PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG4gIGlmICghaXNPYmplY3QodmFsdWUpKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG4gIHZhciBpc0FyciA9IGlzQXJyYXkodmFsdWUpO1xuICBpZiAoaXNBcnIpIHtcbiAgICByZXN1bHQgPSBpbml0Q2xvbmVBcnJheSh2YWx1ZSk7XG4gICAgaWYgKCFpc0RlZXApIHtcbiAgICAgIHJldHVybiBjb3B5QXJyYXkodmFsdWUsIHJlc3VsdCk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHZhciB0YWcgPSBnZXRUYWcodmFsdWUpLFxuICAgICAgICBpc0Z1bmMgPSB0YWcgPT0gZnVuY1RhZyB8fCB0YWcgPT0gZ2VuVGFnO1xuXG4gICAgaWYgKGlzQnVmZmVyKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGNsb25lQnVmZmVyKHZhbHVlLCBpc0RlZXApO1xuICAgIH1cbiAgICBpZiAodGFnID09IG9iamVjdFRhZyB8fCB0YWcgPT0gYXJnc1RhZyB8fCAoaXNGdW5jICYmICFvYmplY3QpKSB7XG4gICAgICByZXN1bHQgPSAoaXNGbGF0IHx8IGlzRnVuYykgPyB7fSA6IGluaXRDbG9uZU9iamVjdCh2YWx1ZSk7XG4gICAgICBpZiAoIWlzRGVlcCkge1xuICAgICAgICByZXR1cm4gaXNGbGF0XG4gICAgICAgICAgPyBjb3B5U3ltYm9sc0luKHZhbHVlLCBiYXNlQXNzaWduSW4ocmVzdWx0LCB2YWx1ZSkpXG4gICAgICAgICAgOiBjb3B5U3ltYm9scyh2YWx1ZSwgYmFzZUFzc2lnbihyZXN1bHQsIHZhbHVlKSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICghY2xvbmVhYmxlVGFnc1t0YWddKSB7XG4gICAgICAgIHJldHVybiBvYmplY3QgPyB2YWx1ZSA6IHt9O1xuICAgICAgfVxuICAgICAgcmVzdWx0ID0gaW5pdENsb25lQnlUYWcodmFsdWUsIHRhZywgYmFzZUNsb25lLCBpc0RlZXApO1xuICAgIH1cbiAgfVxuICAvLyBDaGVjayBmb3IgY2lyY3VsYXIgcmVmZXJlbmNlcyBhbmQgcmV0dXJuIGl0cyBjb3JyZXNwb25kaW5nIGNsb25lLlxuICBzdGFjayB8fCAoc3RhY2sgPSBuZXcgU3RhY2spO1xuICB2YXIgc3RhY2tlZCA9IHN0YWNrLmdldCh2YWx1ZSk7XG4gIGlmIChzdGFja2VkKSB7XG4gICAgcmV0dXJuIHN0YWNrZWQ7XG4gIH1cbiAgc3RhY2suc2V0KHZhbHVlLCByZXN1bHQpO1xuXG4gIHZhciBrZXlzRnVuYyA9IGlzRnVsbFxuICAgID8gKGlzRmxhdCA/IGdldEFsbEtleXNJbiA6IGdldEFsbEtleXMpXG4gICAgOiAoaXNGbGF0ID8ga2V5c0luIDoga2V5cyk7XG5cbiAgdmFyIHByb3BzID0gaXNBcnIgPyB1bmRlZmluZWQgOiBrZXlzRnVuYyh2YWx1ZSk7XG4gIGFycmF5RWFjaChwcm9wcyB8fCB2YWx1ZSwgZnVuY3Rpb24oc3ViVmFsdWUsIGtleSkge1xuICAgIGlmIChwcm9wcykge1xuICAgICAga2V5ID0gc3ViVmFsdWU7XG4gICAgICBzdWJWYWx1ZSA9IHZhbHVlW2tleV07XG4gICAgfVxuICAgIC8vIFJlY3Vyc2l2ZWx5IHBvcHVsYXRlIGNsb25lIChzdXNjZXB0aWJsZSB0byBjYWxsIHN0YWNrIGxpbWl0cykuXG4gICAgYXNzaWduVmFsdWUocmVzdWx0LCBrZXksIGJhc2VDbG9uZShzdWJWYWx1ZSwgYml0bWFzaywgY3VzdG9taXplciwga2V5LCB2YWx1ZSwgc3RhY2spKTtcbiAgfSk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUNsb25lO1xuIiwidmFyIGJhc2VDbG9uZSA9IHJlcXVpcmUoJy4vX2Jhc2VDbG9uZScpO1xuXG4vKiogVXNlZCB0byBjb21wb3NlIGJpdG1hc2tzIGZvciBjbG9uaW5nLiAqL1xudmFyIENMT05FX0RFRVBfRkxBRyA9IDEsXG4gICAgQ0xPTkVfU1lNQk9MU19GTEFHID0gNDtcblxuLyoqXG4gKiBUaGlzIG1ldGhvZCBpcyBsaWtlIGBfLmNsb25lYCBleGNlcHQgdGhhdCBpdCByZWN1cnNpdmVseSBjbG9uZXMgYHZhbHVlYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDEuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcmVjdXJzaXZlbHkgY2xvbmUuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgZGVlcCBjbG9uZWQgdmFsdWUuXG4gKiBAc2VlIF8uY2xvbmVcbiAqIEBleGFtcGxlXG4gKlxuICogdmFyIG9iamVjdHMgPSBbeyAnYSc6IDEgfSwgeyAnYic6IDIgfV07XG4gKlxuICogdmFyIGRlZXAgPSBfLmNsb25lRGVlcChvYmplY3RzKTtcbiAqIGNvbnNvbGUubG9nKGRlZXBbMF0gPT09IG9iamVjdHNbMF0pO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gY2xvbmVEZWVwKHZhbHVlKSB7XG4gIHJldHVybiBiYXNlQ2xvbmUodmFsdWUsIENMT05FX0RFRVBfRkxBRyB8IENMT05FX1NZTUJPTFNfRkxBRyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY2xvbmVEZWVwO1xuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZXJyb3JIYW5kbGVyIChlcnJvck9yU3RyaW5nLCB2bSkge1xuICBjb25zdCBlcnJvciA9ICh0eXBlb2YgZXJyb3JPclN0cmluZyA9PT0gJ29iamVjdCcpXG4gICAgPyBlcnJvck9yU3RyaW5nXG4gICAgOiBuZXcgRXJyb3IoZXJyb3JPclN0cmluZylcblxuICB2bS5fZXJyb3IgPSBlcnJvclxuXG4gIHRocm93IGVycm9yXG59XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgVnVlIGZyb20gJ3Z1ZSdcbmltcG9ydCBjbG9uZURlZXAgZnJvbSAnbG9kYXNoL2Nsb25lRGVlcCdcbmltcG9ydCBlcnJvckhhbmRsZXIgZnJvbSAnLi9lcnJvci1oYW5kbGVyJ1xuXG5mdW5jdGlvbiBjcmVhdGVMb2NhbFZ1ZSAoKTogQ29tcG9uZW50IHtcbiAgY29uc3QgaW5zdGFuY2UgPSBWdWUuZXh0ZW5kKClcblxuICAvLyBjbG9uZSBnbG9iYWwgQVBJc1xuICBPYmplY3Qua2V5cyhWdWUpLmZvckVhY2goa2V5ID0+IHtcbiAgICBpZiAoIWluc3RhbmNlLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgIGNvbnN0IG9yaWdpbmFsID0gVnVlW2tleV1cbiAgICAgIGluc3RhbmNlW2tleV0gPSB0eXBlb2Ygb3JpZ2luYWwgPT09ICdvYmplY3QnXG4gICAgICAgID8gY2xvbmVEZWVwKG9yaWdpbmFsKVxuICAgICAgICA6IG9yaWdpbmFsXG4gICAgfVxuICB9KVxuXG4gIC8vIGNvbmZpZyBpcyBub3QgZW51bWVyYWJsZVxuICBpbnN0YW5jZS5jb25maWcgPSBjbG9uZURlZXAoVnVlLmNvbmZpZylcblxuICBpbnN0YW5jZS5jb25maWcuZXJyb3JIYW5kbGVyID0gZXJyb3JIYW5kbGVyXG5cbiAgLy8gb3B0aW9uIG1lcmdlIHN0cmF0ZWdpZXMgbmVlZCB0byBiZSBleHBvc2VkIGJ5IHJlZmVyZW5jZVxuICAvLyBzbyB0aGF0IG1lcmdlIHN0cmF0cyByZWdpc3RlcmVkIGJ5IHBsdWdpbnMgY2FuIHdvcmsgcHJvcGVybHlcbiAgaW5zdGFuY2UuY29uZmlnLm9wdGlvbk1lcmdlU3RyYXRlZ2llcyA9IFZ1ZS5jb25maWcub3B0aW9uTWVyZ2VTdHJhdGVnaWVzXG5cbiAgLy8gbWFrZSBzdXJlIGFsbCBleHRlbmRzIGFyZSBiYXNlZCBvbiB0aGlzIGluc3RhbmNlLlxuICAvLyB0aGlzIGlzIGltcG9ydGFudCBzbyB0aGF0IGdsb2JhbCBjb21wb25lbnRzIHJlZ2lzdGVyZWQgYnkgcGx1Z2lucyxcbiAgLy8gZS5nLiByb3V0ZXItbGluayBhcmUgY3JlYXRlZCB1c2luZyB0aGUgY29ycmVjdCBiYXNlIGNvbnN0cnVjdG9yXG4gIGluc3RhbmNlLm9wdGlvbnMuX2Jhc2UgPSBpbnN0YW5jZVxuXG4gIC8vIGNvbXBhdCBmb3IgdnVlLXJvdXRlciA8IDIuNy4xIHdoZXJlIGl0IGRvZXMgbm90IGFsbG93IG11bHRpcGxlIGluc3RhbGxzXG4gIGlmIChpbnN0YW5jZS5faW5zdGFsbGVkUGx1Z2lucyAmJiBpbnN0YW5jZS5faW5zdGFsbGVkUGx1Z2lucy5sZW5ndGgpIHtcbiAgICBpbnN0YW5jZS5faW5zdGFsbGVkUGx1Z2lucy5sZW5ndGggPSAwXG4gIH1cbiAgY29uc3QgdXNlID0gaW5zdGFuY2UudXNlXG4gIGluc3RhbmNlLnVzZSA9IChwbHVnaW4sIC4uLnJlc3QpID0+IHtcbiAgICBpZiAocGx1Z2luLmluc3RhbGxlZCA9PT0gdHJ1ZSkge1xuICAgICAgcGx1Z2luLmluc3RhbGxlZCA9IGZhbHNlXG4gICAgfVxuICAgIGlmIChwbHVnaW4uaW5zdGFsbCAmJiBwbHVnaW4uaW5zdGFsbC5pbnN0YWxsZWQgPT09IHRydWUpIHtcbiAgICAgIHBsdWdpbi5pbnN0YWxsLmluc3RhbGxlZCA9IGZhbHNlXG4gICAgfVxuICAgIHVzZS5jYWxsKGluc3RhbmNlLCBwbHVnaW4sIC4uLnJlc3QpXG4gIH1cbiAgcmV0dXJuIGluc3RhbmNlXG59XG5cbmV4cG9ydCBkZWZhdWx0IGNyZWF0ZUxvY2FsVnVlXG4iLCIvLyBAZmxvd1xuXG5mdW5jdGlvbiBnZXRPcHRpb25zIChrZXksIG9wdGlvbnMsIGNvbmZpZykge1xuICBpZiAob3B0aW9ucyB8fFxuICAgIChjb25maWdba2V5XSAmJiBPYmplY3Qua2V5cyhjb25maWdba2V5XSkubGVuZ3RoID4gMCkpIHtcbiAgICBpZiAob3B0aW9ucyBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB7XG4gICAgICByZXR1cm4gb3B0aW9uc1xuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShvcHRpb25zKSkge1xuICAgICAgcmV0dXJuIFtcbiAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgLi4uT2JqZWN0LmtleXMoY29uZmlnW2tleV0gfHwge30pXVxuICAgIH0gZWxzZSBpZiAoIShjb25maWdba2V5XSBpbnN0YW5jZW9mIEZ1bmN0aW9uKSkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4uY29uZmlnW2tleV0sXG4gICAgICAgIC4uLm9wdGlvbnNcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDb25maWcgY2FuJ3QgYmUgYSBGdW5jdGlvbi5gKVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbWVyZ2VPcHRpb25zIChcbiAgb3B0aW9uczogT3B0aW9ucyxcbiAgY29uZmlnOiBPcHRpb25zXG4pOiBPcHRpb25zIHtcbiAgcmV0dXJuIHtcbiAgICAuLi5vcHRpb25zLFxuICAgIGxvZ01vZGlmaWVkQ29tcG9uZW50czogY29uZmlnLmxvZ01vZGlmaWVkQ29tcG9uZW50cyxcbiAgICBzdHViczogZ2V0T3B0aW9ucygnc3R1YnMnLCBvcHRpb25zLnN0dWJzLCBjb25maWcpLFxuICAgIG1vY2tzOiBnZXRPcHRpb25zKCdtb2NrcycsIG9wdGlvbnMubW9ja3MsIGNvbmZpZyksXG4gICAgbWV0aG9kczogZ2V0T3B0aW9ucygnbWV0aG9kcycsIG9wdGlvbnMubWV0aG9kcywgY29uZmlnKSxcbiAgICBwcm92aWRlOiBnZXRPcHRpb25zKCdwcm92aWRlJywgb3B0aW9ucy5wcm92aWRlLCBjb25maWcpLFxuICAgIHN5bmM6ICEhKChvcHRpb25zLnN5bmMgfHwgb3B0aW9ucy5zeW5jID09PSB1bmRlZmluZWQpKVxuICB9XG59XG5cbiIsIi8vIEBmbG93XG5cbmltcG9ydCB7IHdhcm4gfSBmcm9tICdzaGFyZWQvdXRpbCdcblxuZnVuY3Rpb24gZ2V0UmVhbENoaWxkICh2bm9kZTogP1ZOb2RlKTogP1ZOb2RlIHtcbiAgY29uc3QgY29tcE9wdGlvbnMgPSB2bm9kZSAmJiB2bm9kZS5jb21wb25lbnRPcHRpb25zXG4gIGlmIChjb21wT3B0aW9ucyAmJiBjb21wT3B0aW9ucy5DdG9yLm9wdGlvbnMuYWJzdHJhY3QpIHtcbiAgICByZXR1cm4gZ2V0UmVhbENoaWxkKGdldEZpcnN0Q29tcG9uZW50Q2hpbGQoY29tcE9wdGlvbnMuY2hpbGRyZW4pKVxuICB9IGVsc2Uge1xuICAgIHJldHVybiB2bm9kZVxuICB9XG59XG5cbmZ1bmN0aW9uIGlzU2FtZUNoaWxkIChjaGlsZDogVk5vZGUsIG9sZENoaWxkOiBWTm9kZSk6IGJvb2xlYW4ge1xuICByZXR1cm4gb2xkQ2hpbGQua2V5ID09PSBjaGlsZC5rZXkgJiYgb2xkQ2hpbGQudGFnID09PSBjaGlsZC50YWdcbn1cblxuZnVuY3Rpb24gZ2V0Rmlyc3RDb21wb25lbnRDaGlsZCAoY2hpbGRyZW46ID9BcnJheTxWTm9kZT4pOiA/Vk5vZGUge1xuICBpZiAoQXJyYXkuaXNBcnJheShjaGlsZHJlbikpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBjID0gY2hpbGRyZW5baV1cbiAgICAgIGlmIChjICYmIChjLmNvbXBvbmVudE9wdGlvbnMgfHwgaXNBc3luY1BsYWNlaG9sZGVyKGMpKSkge1xuICAgICAgICByZXR1cm4gY1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBpc1ByaW1pdGl2ZSAodmFsdWU6IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gKFxuICAgIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgfHxcbiAgICB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInIHx8XG4gICAgLy8gJEZsb3dJZ25vcmVcbiAgICB0eXBlb2YgdmFsdWUgPT09ICdzeW1ib2wnIHx8XG4gICAgdHlwZW9mIHZhbHVlID09PSAnYm9vbGVhbidcbiAgKVxufVxuXG5mdW5jdGlvbiBpc0FzeW5jUGxhY2Vob2xkZXIgKG5vZGU6IFZOb2RlKTogYm9vbGVhbiB7XG4gIHJldHVybiBub2RlLmlzQ29tbWVudCAmJiBub2RlLmFzeW5jRmFjdG9yeVxufVxuY29uc3QgY2FtZWxpemVSRSA9IC8tKFxcdykvZ1xuZXhwb3J0IGNvbnN0IGNhbWVsaXplID0gKHN0cjogc3RyaW5nKTogc3RyaW5nID0+IHtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKGNhbWVsaXplUkUsIChfLCBjKSA9PiBjID8gYy50b1VwcGVyQ2FzZSgpIDogJycpXG59XG5cbmZ1bmN0aW9uIGhhc1BhcmVudFRyYW5zaXRpb24gKHZub2RlOiBWTm9kZSk6ID9ib29sZWFuIHtcbiAgd2hpbGUgKCh2bm9kZSA9IHZub2RlLnBhcmVudCkpIHtcbiAgICBpZiAodm5vZGUuZGF0YS50cmFuc2l0aW9uKSB7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCB7XG4gIHJlbmRlciAoaDogRnVuY3Rpb24pIHtcbiAgICBsZXQgY2hpbGRyZW46ID9BcnJheTxWTm9kZT4gPSB0aGlzLiRvcHRpb25zLl9yZW5kZXJDaGlsZHJlblxuICAgIGlmICghY2hpbGRyZW4pIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIC8vIGZpbHRlciBvdXQgdGV4dCBub2RlcyAocG9zc2libGUgd2hpdGVzcGFjZXMpXG4gICAgY2hpbGRyZW4gPSBjaGlsZHJlbi5maWx0ZXIoKGM6IFZOb2RlKSA9PiBjLnRhZyB8fCBpc0FzeW5jUGxhY2Vob2xkZXIoYykpXG4gICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgaWYgKCFjaGlsZHJlbi5sZW5ndGgpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIC8vIHdhcm4gbXVsdGlwbGUgZWxlbWVudHNcbiAgICBpZiAoY2hpbGRyZW4ubGVuZ3RoID4gMSkge1xuICAgICAgd2FybihcbiAgICAgICAgJzx0cmFuc2l0aW9uPiBjYW4gb25seSBiZSB1c2VkIG9uIGEgc2luZ2xlIGVsZW1lbnQuIFVzZSAnICtcbiAgICAgICAgICc8dHJhbnNpdGlvbi1ncm91cD4gZm9yIGxpc3RzLidcbiAgICAgIClcbiAgICB9XG5cbiAgICBjb25zdCBtb2RlOiBzdHJpbmcgPSB0aGlzLm1vZGVcblxuICAgIC8vIHdhcm4gaW52YWxpZCBtb2RlXG4gICAgaWYgKG1vZGUgJiYgbW9kZSAhPT0gJ2luLW91dCcgJiYgbW9kZSAhPT0gJ291dC1pbidcbiAgICApIHtcbiAgICAgIHdhcm4oXG4gICAgICAgICdpbnZhbGlkIDx0cmFuc2l0aW9uPiBtb2RlOiAnICsgbW9kZVxuICAgICAgKVxuICAgIH1cblxuICAgIGNvbnN0IHJhd0NoaWxkOiBWTm9kZSA9IGNoaWxkcmVuWzBdXG5cbiAgICAvLyBpZiB0aGlzIGlzIGEgY29tcG9uZW50IHJvb3Qgbm9kZSBhbmQgdGhlIGNvbXBvbmVudCdzXG4gICAgLy8gcGFyZW50IGNvbnRhaW5lciBub2RlIGFsc28gaGFzIHRyYW5zaXRpb24sIHNraXAuXG4gICAgaWYgKGhhc1BhcmVudFRyYW5zaXRpb24odGhpcy4kdm5vZGUpKSB7XG4gICAgICByZXR1cm4gcmF3Q2hpbGRcbiAgICB9XG5cbiAgICAvLyBhcHBseSB0cmFuc2l0aW9uIGRhdGEgdG8gY2hpbGRcbiAgICAvLyB1c2UgZ2V0UmVhbENoaWxkKCkgdG8gaWdub3JlIGFic3RyYWN0IGNvbXBvbmVudHMgZS5nLiBrZWVwLWFsaXZlXG4gICAgY29uc3QgY2hpbGQ6ID9WTm9kZSA9IGdldFJlYWxDaGlsZChyYXdDaGlsZClcblxuICAgIGlmICghY2hpbGQpIHtcbiAgICAgIHJldHVybiByYXdDaGlsZFxuICAgIH1cblxuICAgIGNvbnN0IGlkOiBzdHJpbmcgPSBgX190cmFuc2l0aW9uLSR7dGhpcy5fdWlkfS1gXG4gICAgY2hpbGQua2V5ID0gY2hpbGQua2V5ID09IG51bGxcbiAgICAgID8gY2hpbGQuaXNDb21tZW50XG4gICAgICAgID8gaWQgKyAnY29tbWVudCdcbiAgICAgICAgOiBpZCArIGNoaWxkLnRhZ1xuICAgICAgOiBpc1ByaW1pdGl2ZShjaGlsZC5rZXkpXG4gICAgICAgID8gKFN0cmluZyhjaGlsZC5rZXkpLmluZGV4T2YoaWQpID09PSAwID8gY2hpbGQua2V5IDogaWQgKyBjaGlsZC5rZXkpXG4gICAgICAgIDogY2hpbGQua2V5XG5cbiAgICBjb25zdCBkYXRhOiBPYmplY3QgPSAoY2hpbGQuZGF0YSB8fCAoY2hpbGQuZGF0YSA9IHt9KSlcbiAgICBjb25zdCBvbGRSYXdDaGlsZDogP1ZOb2RlID0gdGhpcy5fdm5vZGVcbiAgICBjb25zdCBvbGRDaGlsZDogP1ZOb2RlID0gZ2V0UmVhbENoaWxkKG9sZFJhd0NoaWxkKVxuICAgIGlmIChjaGlsZC5kYXRhLmRpcmVjdGl2ZXMgJiYgY2hpbGQuZGF0YS5kaXJlY3RpdmVzLnNvbWUoZCA9PiBkLm5hbWUgPT09ICdzaG93JykpIHtcbiAgICAgIGNoaWxkLmRhdGEuc2hvdyA9IHRydWVcbiAgICB9XG5cbiAgICAvLyBtYXJrIHYtc2hvd1xuICAgIC8vIHNvIHRoYXQgdGhlIHRyYW5zaXRpb24gbW9kdWxlIGNhbiBoYW5kIG92ZXIgdGhlIGNvbnRyb2wgdG8gdGhlIGRpcmVjdGl2ZVxuICAgIGlmIChjaGlsZC5kYXRhLmRpcmVjdGl2ZXMgJiYgY2hpbGQuZGF0YS5kaXJlY3RpdmVzLnNvbWUoZCA9PiBkLm5hbWUgPT09ICdzaG93JykpIHtcbiAgICAgIGNoaWxkLmRhdGEuc2hvdyA9IHRydWVcbiAgICB9XG4gICAgaWYgKFxuICAgICAgb2xkQ2hpbGQgJiZcbiAgICAgICAgIG9sZENoaWxkLmRhdGEgJiZcbiAgICAgICAgICFpc1NhbWVDaGlsZChjaGlsZCwgb2xkQ2hpbGQpICYmXG4gICAgICAgICAhaXNBc3luY1BsYWNlaG9sZGVyKG9sZENoaWxkKSAmJlxuICAgICAgICAgLy8gIzY2ODcgY29tcG9uZW50IHJvb3QgaXMgYSBjb21tZW50IG5vZGVcbiAgICAgICAgICEob2xkQ2hpbGQuY29tcG9uZW50SW5zdGFuY2UgJiYgb2xkQ2hpbGQuY29tcG9uZW50SW5zdGFuY2UuX3Zub2RlLmlzQ29tbWVudClcbiAgICApIHtcbiAgICAgIG9sZENoaWxkLmRhdGEgPSB7IC4uLmRhdGEgfVxuICAgIH1cbiAgICByZXR1cm4gcmF3Q2hpbGRcbiAgfVxufVxuIiwiLy8gQGZsb3dcblxuZXhwb3J0IGRlZmF1bHQge1xuICByZW5kZXIgKGg6IEZ1bmN0aW9uKSB7XG4gICAgY29uc3QgdGFnOiBzdHJpbmcgPSB0aGlzLnRhZyB8fCB0aGlzLiR2bm9kZS5kYXRhLnRhZyB8fCAnc3BhbidcbiAgICBjb25zdCBjaGlsZHJlbjogQXJyYXk8Vk5vZGU+ID0gdGhpcy4kc2xvdHMuZGVmYXVsdCB8fCBbXVxuXG4gICAgcmV0dXJuIGgodGFnLCBudWxsLCBjaGlsZHJlbilcbiAgfVxufVxuIiwiaW1wb3J0IFRyYW5zaXRpb25TdHViIGZyb20gJy4vY29tcG9uZW50cy9UcmFuc2l0aW9uU3R1YidcbmltcG9ydCBUcmFuc2l0aW9uR3JvdXBTdHViIGZyb20gJy4vY29tcG9uZW50cy9UcmFuc2l0aW9uR3JvdXBTdHViJ1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIHN0dWJzOiB7XG4gICAgdHJhbnNpdGlvbjogVHJhbnNpdGlvblN0dWIsXG4gICAgJ3RyYW5zaXRpb24tZ3JvdXAnOiBUcmFuc2l0aW9uR3JvdXBTdHViXG4gIH0sXG4gIG1vY2tzOiB7fSxcbiAgbWV0aG9kczoge30sXG4gIHByb3ZpZGU6IHt9LFxuICBsb2dNb2RpZmllZENvbXBvbmVudHM6IHRydWVcbn1cbiIsIi8vIEBmbG93XG5pbXBvcnQgeyBjb21waWxlVG9GdW5jdGlvbnMgfSBmcm9tICd2dWUtdGVtcGxhdGUtY29tcGlsZXInXG5pbXBvcnQgeyB0aHJvd0Vycm9yLCB2dWVWZXJzaW9uIH0gZnJvbSAnc2hhcmVkL3V0aWwnXG5cbmZ1bmN0aW9uIGlzRGVzdHJ1Y3R1cmluZ1Nsb3RTY29wZSAoc2xvdFNjb3BlOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIHNsb3RTY29wZVswXSA9PT0gJ3snICYmIHNsb3RTY29wZVtzbG90U2NvcGUubGVuZ3RoIC0gMV0gPT09ICd9J1xufVxuXG5mdW5jdGlvbiBnZXRWdWVUZW1wbGF0ZUNvbXBpbGVySGVscGVycyAocHJveHk6IE9iamVjdCk6IE9iamVjdCB7XG4gIGNvbnN0IGhlbHBlcnMgPSB7fVxuICBjb25zdCBuYW1lcyA9IFsnX2MnLCAnX28nLCAnX24nLCAnX3MnLCAnX2wnLCAnX3QnLCAnX3EnLCAnX2knLCAnX20nLCAnX2YnLCAnX2snLCAnX2InLCAnX3YnLCAnX2UnLCAnX3UnLCAnX2cnXVxuICBuYW1lcy5mb3JFYWNoKChuYW1lKSA9PiB7XG4gICAgaGVscGVyc1tuYW1lXSA9IHByb3h5W25hbWVdXG4gIH0pXG4gIHJldHVybiBoZWxwZXJzXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhZGRTY29wZWRTbG90cyAodm06IENvbXBvbmVudCwgc2NvcGVkU2xvdHM6IGFueSkge1xuICBpZiAod2luZG93Lm5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL1BoYW50b21KUy9pKSkge1xuICAgIHRocm93RXJyb3IoJ3RoZSBzY29wZWRTbG90cyBvcHRpb24gZG9lcyBub3Qgc3VwcG9ydCBQaGFudG9tSlMuIFBsZWFzZSB1c2UgUHVwcGV0ZWVyLCBvciBwYXNzIGEgY29tcG9uZW50LicpXG4gIH1cblxuICBpZiAodnVlVmVyc2lvbiA8IDIuNSkge1xuICAgIHRocm93RXJyb3IoJ3RoZSBzY29wZWRTbG90cyBvcHRpb24gaXMgb25seSBzdXBwb3J0ZWQgaW4gdnVlQDIuNSsuJylcbiAgfVxuICB2bS4kX3Z1ZVRlc3RVdGlsc19zY29wZWRTbG90cyA9IHt9XG4gIHZtLiRfdnVlVGVzdFV0aWxzX3Nsb3RTY29wZXMgPSB7fVxuICBjb25zdCByZW5kZXJTbG90ID0gdm0uX3JlbmRlclByb3h5Ll90XG5cbiAgdm0uX3JlbmRlclByb3h5Ll90ID0gZnVuY3Rpb24gKG5hbWUsIGZlZWRiYWNrLCBwcm9wcywgYmluZE9iamVjdCkge1xuICAgIGNvbnN0IHNjb3BlZFNsb3RGbiA9IHZtLiRfdnVlVGVzdFV0aWxzX3Njb3BlZFNsb3RzW25hbWVdXG4gICAgY29uc3Qgc2xvdFNjb3BlID0gdm0uJF92dWVUZXN0VXRpbHNfc2xvdFNjb3Blc1tuYW1lXVxuICAgIGlmIChzY29wZWRTbG90Rm4pIHtcbiAgICAgIHByb3BzID0geyAuLi5iaW5kT2JqZWN0LCAuLi5wcm9wcyB9XG4gICAgICBjb25zdCBoZWxwZXJzID0gZ2V0VnVlVGVtcGxhdGVDb21waWxlckhlbHBlcnModm0uX3JlbmRlclByb3h5KVxuICAgICAgbGV0IHByb3h5ID0geyAuLi5oZWxwZXJzIH1cbiAgICAgIGlmIChpc0Rlc3RydWN0dXJpbmdTbG90U2NvcGUoc2xvdFNjb3BlKSkge1xuICAgICAgICBwcm94eSA9IHsgLi4uaGVscGVycywgLi4ucHJvcHMgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcHJveHlbc2xvdFNjb3BlXSA9IHByb3BzXG4gICAgICB9XG4gICAgICByZXR1cm4gc2NvcGVkU2xvdEZuLmNhbGwocHJveHkpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiByZW5kZXJTbG90LmNhbGwodm0uX3JlbmRlclByb3h5LCBuYW1lLCBmZWVkYmFjaywgcHJvcHMsIGJpbmRPYmplY3QpXG4gICAgfVxuICB9XG5cbiAgT2JqZWN0LmtleXMoc2NvcGVkU2xvdHMpLmZvckVhY2goKGtleSkgPT4ge1xuICAgIGNvbnN0IHRlbXBsYXRlID0gc2NvcGVkU2xvdHNba2V5XS50cmltKClcbiAgICBpZiAodGVtcGxhdGUuc3Vic3RyKDAsIDkpID09PSAnPHRlbXBsYXRlJykge1xuICAgICAgdGhyb3dFcnJvcigndGhlIHNjb3BlZFNsb3RzIG9wdGlvbiBkb2VzIG5vdCBzdXBwb3J0IGEgdGVtcGxhdGUgdGFnIGFzIHRoZSByb290IGVsZW1lbnQuJylcbiAgICB9XG4gICAgY29uc3QgZG9tUGFyc2VyID0gbmV3IHdpbmRvdy5ET01QYXJzZXIoKVxuICAgIGNvbnN0IF9kb2N1bWVudCA9IGRvbVBhcnNlci5wYXJzZUZyb21TdHJpbmcodGVtcGxhdGUsICd0ZXh0L2h0bWwnKVxuICAgIHZtLiRfdnVlVGVzdFV0aWxzX3Njb3BlZFNsb3RzW2tleV0gPSBjb21waWxlVG9GdW5jdGlvbnModGVtcGxhdGUpLnJlbmRlclxuICAgIHZtLiRfdnVlVGVzdFV0aWxzX3Nsb3RTY29wZXNba2V5XSA9IF9kb2N1bWVudC5ib2R5LmZpcnN0Q2hpbGQuZ2V0QXR0cmlidXRlKCdzbG90LXNjb3BlJylcbiAgfSlcbn1cbiIsIi8vIEBmbG93XG5cbmltcG9ydCAnLi9tYXRjaGVzLXBvbHlmaWxsJ1xuaW1wb3J0ICcuL29iamVjdC1hc3NpZ24tcG9seWZpbGwnXG5pbXBvcnQgVnVlIGZyb20gJ3Z1ZSdcbmltcG9ydCBWdWVXcmFwcGVyIGZyb20gJy4vdnVlLXdyYXBwZXInXG5pbXBvcnQgY3JlYXRlSW5zdGFuY2UgZnJvbSAnY3JlYXRlLWluc3RhbmNlJ1xuaW1wb3J0IGNyZWF0ZUVsZW1lbnQgZnJvbSAnLi9jcmVhdGUtZWxlbWVudCdcbmltcG9ydCBjcmVhdGVMb2NhbFZ1ZSBmcm9tICcuL2NyZWF0ZS1sb2NhbC12dWUnXG5pbXBvcnQgZXJyb3JIYW5kbGVyIGZyb20gJy4vZXJyb3ItaGFuZGxlcidcbmltcG9ydCB7IGZpbmRBbGxWdWVDb21wb25lbnRzRnJvbVZtIH0gZnJvbSAnLi9maW5kLXZ1ZS1jb21wb25lbnRzJ1xuaW1wb3J0IHsgbWVyZ2VPcHRpb25zIH0gZnJvbSAnc2hhcmVkL21lcmdlLW9wdGlvbnMnXG5pbXBvcnQgY29uZmlnIGZyb20gJy4vY29uZmlnJ1xuaW1wb3J0IHdhcm5JZk5vV2luZG93IGZyb20gJy4vd2Fybi1pZi1uby13aW5kb3cnXG5pbXBvcnQgeyBhZGRTY29wZWRTbG90cyB9IGZyb20gJy4vYWRkLXNjb3BlZC1zbG90cydcblxuVnVlLmNvbmZpZy5wcm9kdWN0aW9uVGlwID0gZmFsc2VcblZ1ZS5jb25maWcuZGV2dG9vbHMgPSBmYWxzZVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBtb3VudCAoY29tcG9uZW50OiBDb21wb25lbnQsIG9wdGlvbnM6IE9wdGlvbnMgPSB7fSk6IFZ1ZVdyYXBwZXIge1xuICBjb25zdCBleGlzdGluZ0Vycm9ySGFuZGxlciA9IFZ1ZS5jb25maWcuZXJyb3JIYW5kbGVyXG4gIFZ1ZS5jb25maWcuZXJyb3JIYW5kbGVyID0gZXJyb3JIYW5kbGVyXG5cbiAgd2FybklmTm9XaW5kb3coKVxuXG4gIC8vIFJlbW92ZSBjYWNoZWQgY29uc3RydWN0b3JcbiAgZGVsZXRlIGNvbXBvbmVudC5fQ3RvclxuXG4gIGNvbnN0IHZ1ZUNvbnN0cnVjdG9yID0gb3B0aW9ucy5sb2NhbFZ1ZSB8fCBjcmVhdGVMb2NhbFZ1ZSgpXG5cbiAgY29uc3QgZWxtID0gb3B0aW9ucy5hdHRhY2hUb0RvY3VtZW50XG4gICAgPyBjcmVhdGVFbGVtZW50KClcbiAgICA6IHVuZGVmaW5lZFxuXG4gIGNvbnN0IG1lcmdlZE9wdGlvbnMgPSBtZXJnZU9wdGlvbnMob3B0aW9ucywgY29uZmlnKVxuXG4gIGNvbnN0IHBhcmVudFZtID0gY3JlYXRlSW5zdGFuY2UoXG4gICAgY29tcG9uZW50LFxuICAgIG1lcmdlZE9wdGlvbnMsXG4gICAgdnVlQ29uc3RydWN0b3IsXG4gICAgZWxtXG4gIClcblxuICBjb25zdCB2bSA9IHBhcmVudFZtLiRtb3VudChlbG0pLiRyZWZzLnZtXG5cbiAgLy8gV29ya2Fyb3VuZCBmb3IgVnVlIDwgMi41XG4gIHZtLl9zdGF0aWNUcmVlcyA9IFtdXG5cbiAgaWYgKG9wdGlvbnMuc2NvcGVkU2xvdHMpIHtcbiAgICBhZGRTY29wZWRTbG90cyh2bSwgb3B0aW9ucy5zY29wZWRTbG90cylcblxuICAgIGlmIChtZXJnZWRPcHRpb25zLnN5bmMpIHtcbiAgICAgIHZtLl93YXRjaGVyLnN5bmMgPSB0cnVlXG4gICAgfVxuXG4gICAgdm0uJGZvcmNlVXBkYXRlKClcbiAgfVxuXG4gIGNvbnN0IGNvbXBvbmVudHNXaXRoRXJyb3IgPSBmaW5kQWxsVnVlQ29tcG9uZW50c0Zyb21WbSh2bSkuZmlsdGVyKGMgPT4gYy5fZXJyb3IpXG5cbiAgaWYgKGNvbXBvbmVudHNXaXRoRXJyb3IubGVuZ3RoID4gMCkge1xuICAgIHRocm93IChjb21wb25lbnRzV2l0aEVycm9yWzBdLl9lcnJvcilcbiAgfVxuXG4gIFZ1ZS5jb25maWcuZXJyb3JIYW5kbGVyID0gZXhpc3RpbmdFcnJvckhhbmRsZXJcblxuICBjb25zdCB3cmFwcGVyT3B0aW9ucyA9IHtcbiAgICBhdHRhY2hlZFRvRG9jdW1lbnQ6ICEhbWVyZ2VkT3B0aW9ucy5hdHRhY2hUb0RvY3VtZW50LFxuICAgIHN5bmM6IG1lcmdlZE9wdGlvbnMuc3luY1xuICB9XG5cbiAgcmV0dXJuIG5ldyBWdWVXcmFwcGVyKHZtLCB3cmFwcGVyT3B0aW9ucylcbn1cbiIsIi8vIEBmbG93XG5cbmltcG9ydCAnLi93YXJuLWlmLW5vLXdpbmRvdydcbmltcG9ydCBWdWUgZnJvbSAndnVlJ1xuaW1wb3J0IG1vdW50IGZyb20gJy4vbW91bnQnXG5pbXBvcnQgdHlwZSBWdWVXcmFwcGVyIGZyb20gJy4vdnVlLXdyYXBwZXInXG5pbXBvcnQge1xuICBjcmVhdGVDb21wb25lbnRTdHVic0ZvckFsbCxcbiAgY3JlYXRlQ29tcG9uZW50U3R1YnNGb3JHbG9iYWxzXG59IGZyb20gJ3NoYXJlZC9zdHViLWNvbXBvbmVudHMnXG5pbXBvcnQgeyBjYW1lbGl6ZSxcbiAgY2FwaXRhbGl6ZSxcbiAgaHlwaGVuYXRlXG59IGZyb20gJ3NoYXJlZC91dGlsJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBzaGFsbG93TW91bnQgKFxuICBjb21wb25lbnQ6IENvbXBvbmVudCxcbiAgb3B0aW9uczogT3B0aW9ucyA9IHt9XG4pOiBWdWVXcmFwcGVyIHtcbiAgY29uc3QgdnVlID0gb3B0aW9ucy5sb2NhbFZ1ZSB8fCBWdWVcblxuICAvLyByZW1vdmUgYW55IHJlY3Vyc2l2ZSBjb21wb25lbnRzIGFkZGVkIHRvIHRoZSBjb25zdHJ1Y3RvclxuICAvLyBpbiB2bS5faW5pdCBmcm9tIHByZXZpb3VzIHRlc3RzXG4gIGlmIChjb21wb25lbnQubmFtZSAmJiBjb21wb25lbnQuY29tcG9uZW50cykge1xuICAgIGRlbGV0ZSBjb21wb25lbnQuY29tcG9uZW50c1tjYXBpdGFsaXplKGNhbWVsaXplKGNvbXBvbmVudC5uYW1lKSldXG4gICAgZGVsZXRlIGNvbXBvbmVudC5jb21wb25lbnRzW2h5cGhlbmF0ZShjb21wb25lbnQubmFtZSldXG4gIH1cblxuICByZXR1cm4gbW91bnQoY29tcG9uZW50LCB7XG4gICAgLi4ub3B0aW9ucyxcbiAgICBjb21wb25lbnRzOiB7XG4gICAgICAuLi5jcmVhdGVDb21wb25lbnRTdHVic0Zvckdsb2JhbHModnVlKSxcbiAgICAgIC4uLmNyZWF0ZUNvbXBvbmVudFN0dWJzRm9yQWxsKGNvbXBvbmVudClcbiAgICB9XG4gIH0pXG59XG4iLCIvLyBAZmxvd1xuY29uc3QgdG9UeXBlczogQXJyYXk8RnVuY3Rpb24+ID0gW1N0cmluZywgT2JqZWN0XVxuY29uc3QgZXZlbnRUeXBlczogQXJyYXk8RnVuY3Rpb24+ID0gW1N0cmluZywgQXJyYXldXG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgbmFtZTogJ1JvdXRlckxpbmtTdHViJyxcbiAgcHJvcHM6IHtcbiAgICB0bzoge1xuICAgICAgdHlwZTogdG9UeXBlcyxcbiAgICAgIHJlcXVpcmVkOiB0cnVlXG4gICAgfSxcbiAgICB0YWc6IHtcbiAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgIGRlZmF1bHQ6ICdhJ1xuICAgIH0sXG4gICAgZXhhY3Q6IEJvb2xlYW4sXG4gICAgYXBwZW5kOiBCb29sZWFuLFxuICAgIHJlcGxhY2U6IEJvb2xlYW4sXG4gICAgYWN0aXZlQ2xhc3M6IFN0cmluZyxcbiAgICBleGFjdEFjdGl2ZUNsYXNzOiBTdHJpbmcsXG4gICAgZXZlbnQ6IHtcbiAgICAgIHR5cGU6IGV2ZW50VHlwZXMsXG4gICAgICBkZWZhdWx0OiAnY2xpY2snXG4gICAgfVxuICB9LFxuICByZW5kZXIgKGg6IEZ1bmN0aW9uKSB7XG4gICAgcmV0dXJuIGgodGhpcy50YWcsIHVuZGVmaW5lZCwgdGhpcy4kc2xvdHMuZGVmYXVsdClcbiAgfVxufVxuIiwiaW1wb3J0IHNoYWxsb3dNb3VudCBmcm9tICcuL3NoYWxsb3ctbW91bnQnXG5pbXBvcnQgbW91bnQgZnJvbSAnLi9tb3VudCdcbmltcG9ydCBjcmVhdGVMb2NhbFZ1ZSBmcm9tICcuL2NyZWF0ZS1sb2NhbC12dWUnXG5pbXBvcnQgVHJhbnNpdGlvblN0dWIgZnJvbSAnLi9jb21wb25lbnRzL1RyYW5zaXRpb25TdHViJ1xuaW1wb3J0IFRyYW5zaXRpb25Hcm91cFN0dWIgZnJvbSAnLi9jb21wb25lbnRzL1RyYW5zaXRpb25Hcm91cFN0dWInXG5pbXBvcnQgUm91dGVyTGlua1N0dWIgZnJvbSAnLi9jb21wb25lbnRzL1JvdXRlckxpbmtTdHViJ1xuaW1wb3J0IGNvbmZpZyBmcm9tICcuL2NvbmZpZydcbmltcG9ydCB7IHdhcm4gfSBmcm9tICdzaGFyZWQvdXRpbCdcblxuZnVuY3Rpb24gc2hhbGxvdyAoY29tcG9uZW50LCBvcHRpb25zKSB7XG4gIHdhcm4oJ3NoYWxsb3cgaGFzIGJlZW4gcmVuYW1lZCB0byBzaGFsbG93TW91bnQuIHNoYWxsb3cgd2lsbCBiZSByZW1vdmVkIGluIDEuMC4wLCB1c2Ugc2hhbGxvd01vdW50IGluc3RlYWQnKVxuICByZXR1cm4gc2hhbGxvd01vdW50KGNvbXBvbmVudCwgb3B0aW9ucylcbn1cblxuZXhwb3J0IGRlZmF1bHQge1xuICBjcmVhdGVMb2NhbFZ1ZSxcbiAgY29uZmlnLFxuICBtb3VudCxcbiAgc2hhbGxvdyxcbiAgc2hhbGxvd01vdW50LFxuICBUcmFuc2l0aW9uU3R1YixcbiAgVHJhbnNpdGlvbkdyb3VwU3R1YixcbiAgUm91dGVyTGlua1N0dWJcbn1cbiJdLCJuYW1lcyI6WyJjb25zdCIsImxldCIsImFyZ3VtZW50cyIsImVxIiwiYXNzb2NJbmRleE9mIiwidGhpcyIsImxpc3RDYWNoZUNsZWFyIiwibGlzdENhY2hlRGVsZXRlIiwibGlzdENhY2hlR2V0IiwibGlzdENhY2hlSGFzIiwibGlzdENhY2hlU2V0IiwiTGlzdENhY2hlIiwiZ2xvYmFsIiwiZnJlZUdsb2JhbCIsInJvb3QiLCJTeW1ib2wiLCJvYmplY3RQcm90byIsIm5hdGl2ZU9iamVjdFRvU3RyaW5nIiwic3ltVG9TdHJpbmdUYWciLCJnZXRSYXdUYWciLCJvYmplY3RUb1N0cmluZyIsImlzT2JqZWN0IiwiYmFzZUdldFRhZyIsImNvcmVKc0RhdGEiLCJmdW5jUHJvdG8iLCJmdW5jVG9TdHJpbmciLCJoYXNPd25Qcm9wZXJ0eSIsImlzTWFza2VkIiwiaXNGdW5jdGlvbiIsInRvU291cmNlIiwiZ2V0VmFsdWUiLCJiYXNlSXNOYXRpdmUiLCJnZXROYXRpdmUiLCJuYXRpdmVDcmVhdGUiLCJIQVNIX1VOREVGSU5FRCIsImhhc2hDbGVhciIsImhhc2hEZWxldGUiLCJoYXNoR2V0IiwiaGFzaEhhcyIsImhhc2hTZXQiLCJIYXNoIiwiTWFwIiwiaXNLZXlhYmxlIiwiZ2V0TWFwRGF0YSIsIm1hcENhY2hlQ2xlYXIiLCJtYXBDYWNoZURlbGV0ZSIsIm1hcENhY2hlR2V0IiwibWFwQ2FjaGVIYXMiLCJtYXBDYWNoZVNldCIsIk1hcENhY2hlIiwic3RhY2tDbGVhciIsInN0YWNrRGVsZXRlIiwic3RhY2tHZXQiLCJzdGFja0hhcyIsInN0YWNrU2V0IiwiZGVmaW5lUHJvcGVydHkiLCJiYXNlQXNzaWduVmFsdWUiLCJjcmVhdGVCYXNlRm9yIiwiVWludDhBcnJheSIsImNsb25lQXJyYXlCdWZmZXIiLCJvdmVyQXJnIiwiaXNQcm90b3R5cGUiLCJiYXNlQ3JlYXRlIiwiZ2V0UHJvdG90eXBlIiwiaXNPYmplY3RMaWtlIiwiYmFzZUlzQXJndW1lbnRzIiwiaXNMZW5ndGgiLCJpc0FycmF5TGlrZSIsInN0dWJGYWxzZSIsImFyZ3NUYWciLCJmdW5jVGFnIiwib2JqZWN0VGFnIiwibm9kZVV0aWwiLCJiYXNlVW5hcnkiLCJiYXNlSXNUeXBlZEFycmF5IiwiYXNzaWduVmFsdWUiLCJNQVhfU0FGRV9JTlRFR0VSIiwiaXNBcnJheSIsImlzQXJndW1lbnRzIiwiaXNCdWZmZXIiLCJpc1R5cGVkQXJyYXkiLCJiYXNlVGltZXMiLCJpc0luZGV4IiwibmF0aXZlS2V5c0luIiwia2V5c0luIiwiYXJyYXlMaWtlS2V5cyIsImJhc2VLZXlzSW4iLCJjb3B5T2JqZWN0IiwiYXNzaWduTWVyZ2VWYWx1ZSIsImlzQXJyYXlMaWtlT2JqZWN0IiwiY29weUFycmF5IiwiY2xvbmVCdWZmZXIiLCJjbG9uZVR5cGVkQXJyYXkiLCJpc1BsYWluT2JqZWN0IiwidG9QbGFpbk9iamVjdCIsImluaXRDbG9uZU9iamVjdCIsImJhc2VGb3IiLCJTdGFjayIsImJhc2VNZXJnZURlZXAiLCJhcHBseSIsImlkZW50aXR5IiwiY29uc3RhbnQiLCJzaG9ydE91dCIsImJhc2VTZXRUb1N0cmluZyIsInNldFRvU3RyaW5nIiwib3ZlclJlc3QiLCJiYXNlUmVzdCIsImlzSXRlcmF0ZWVDYWxsIiwiY3JlYXRlQXNzaWduZXIiLCJiYXNlTWVyZ2UiLCJmaW5kQWxsIiwibWVyZ2VXaXRoIiwic3VwZXIiLCJjb21waWxlVG9GdW5jdGlvbnMiLCJWdWUiLCIkJFZ1ZSIsImlzVnVlQ29tcG9uZW50IiwibmF0aXZlS2V5cyIsImJhc2VLZXlzIiwia2V5cyIsInByb3BlcnR5SXNFbnVtZXJhYmxlIiwic3R1YkFycmF5IiwiYXJyYXlGaWx0ZXIiLCJnZXRTeW1ib2xzIiwibmF0aXZlR2V0U3ltYm9scyIsImFycmF5UHVzaCIsImdldFN5bWJvbHNJbiIsImJhc2VHZXRBbGxLZXlzIiwibWFwVGFnIiwic2V0VGFnIiwid2Vha01hcFRhZyIsImRhdGFWaWV3VGFnIiwiRGF0YVZpZXciLCJQcm9taXNlIiwiU2V0IiwiV2Vha01hcCIsIm1hcFRvQXJyYXkiLCJhcnJheVJlZHVjZSIsImFkZE1hcEVudHJ5IiwiQ0xPTkVfREVFUF9GTEFHIiwic2V0VG9BcnJheSIsImFkZFNldEVudHJ5IiwiYm9vbFRhZyIsImRhdGVUYWciLCJudW1iZXJUYWciLCJyZWdleHBUYWciLCJzdHJpbmdUYWciLCJhcnJheUJ1ZmZlclRhZyIsImZsb2F0MzJUYWciLCJmbG9hdDY0VGFnIiwiaW50OFRhZyIsImludDE2VGFnIiwiaW50MzJUYWciLCJ1aW50OFRhZyIsInVpbnQ4Q2xhbXBlZFRhZyIsInVpbnQxNlRhZyIsInVpbnQzMlRhZyIsImNsb25lRGF0YVZpZXciLCJjbG9uZU1hcCIsImNsb25lUmVnRXhwIiwiY2xvbmVTZXQiLCJjbG9uZVN5bWJvbCIsImFycmF5VGFnIiwiZXJyb3JUYWciLCJnZW5UYWciLCJzeW1ib2xUYWciLCJpbml0Q2xvbmVBcnJheSIsImdldFRhZyIsImNvcHlTeW1ib2xzSW4iLCJiYXNlQXNzaWduSW4iLCJjb3B5U3ltYm9scyIsImJhc2VBc3NpZ24iLCJpbml0Q2xvbmVCeVRhZyIsImdldEFsbEtleXNJbiIsImdldEFsbEtleXMiLCJhcnJheUVhY2giLCJDTE9ORV9TWU1CT0xTX0ZMQUciLCJiYXNlQ2xvbmUiLCJjbG9uZURlZXAiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTtBQUNB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
