'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Vue = _interopDefault(require('vue'));
var vueTemplateCompiler = require('vue-template-compiler');
var vueServerRenderer = require('vue-server-renderer');
var testUtils = require('@vue/test-utils');
var testUtils__default = _interopDefault(testUtils);
var cheerio = _interopDefault(require('cheerio'));

// 

function createVNodes(vm, slotValue, name) {
  var el = vueTemplateCompiler.compileToFunctions(
    ("<div><template slot=" + name + ">" + slotValue + "</template></div>")
  );
  var _staticRenderFns = vm._renderProxy.$options.staticRenderFns;
  var _staticTrees = vm._renderProxy._staticTrees;
  vm._renderProxy._staticTrees = [];
  vm._renderProxy.$options.staticRenderFns = el.staticRenderFns;
  var vnode = el.render.call(vm._renderProxy, vm.$createElement);
  vm._renderProxy.$options.staticRenderFns = _staticRenderFns;
  vm._renderProxy._staticTrees = _staticTrees;
  return vnode.children[0]
}

function createVNodesForSlot(
  vm,
  slotValue,
  name
) {
  if (typeof slotValue === 'string') {
    return createVNodes(vm, slotValue, name)
  }
  var vnode = vm.$createElement(slotValue)
  ;(vnode.data || (vnode.data = {})).slot = name;
  return vnode
}

function createSlotVNodes(
  vm,
  slots
) {
  return Object.keys(slots).reduce(function (acc, key) {
    var content = slots[key];
    if (Array.isArray(content)) {
      var nodes = content.map(function (slotDef) { return createVNodesForSlot(vm, slotDef, key); }
      );
      return acc.concat(nodes)
    }

    return acc.concat(createVNodesForSlot(vm, content, key))
  }, [])
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var semver = createCommonjsModule(function (module, exports) {
exports = module.exports = SemVer;

var debug;
/* istanbul ignore next */
if (typeof process === 'object' &&
    process.env &&
    process.env.NODE_DEBUG &&
    /\bsemver\b/i.test(process.env.NODE_DEBUG)) {
  debug = function () {
    var args = Array.prototype.slice.call(arguments, 0);
    args.unshift('SEMVER');
    console.log.apply(console, args);
  };
} else {
  debug = function () {};
}

// Note: this is the semver.org version of the spec that it implements
// Not necessarily the package version of this code.
exports.SEMVER_SPEC_VERSION = '2.0.0';

var MAX_LENGTH = 256;
var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER ||
  /* istanbul ignore next */ 9007199254740991;

// Max safe segment length for coercion.
var MAX_SAFE_COMPONENT_LENGTH = 16;

// The actual regexps go on exports.re
var re = exports.re = [];
var src = exports.src = [];
var t = exports.tokens = {};
var R = 0;

function tok (n) {
  t[n] = R++;
}

// The following Regular Expressions can be used for tokenizing,
// validating, and parsing SemVer version strings.

// ## Numeric Identifier
// A single `0`, or a non-zero digit followed by zero or more digits.

tok('NUMERICIDENTIFIER');
src[t.NUMERICIDENTIFIER] = '0|[1-9]\\d*';
tok('NUMERICIDENTIFIERLOOSE');
src[t.NUMERICIDENTIFIERLOOSE] = '[0-9]+';

// ## Non-numeric Identifier
// Zero or more digits, followed by a letter or hyphen, and then zero or
// more letters, digits, or hyphens.

tok('NONNUMERICIDENTIFIER');
src[t.NONNUMERICIDENTIFIER] = '\\d*[a-zA-Z-][a-zA-Z0-9-]*';

// ## Main Version
// Three dot-separated numeric identifiers.

tok('MAINVERSION');
src[t.MAINVERSION] = '(' + src[t.NUMERICIDENTIFIER] + ')\\.' +
                   '(' + src[t.NUMERICIDENTIFIER] + ')\\.' +
                   '(' + src[t.NUMERICIDENTIFIER] + ')';

tok('MAINVERSIONLOOSE');
src[t.MAINVERSIONLOOSE] = '(' + src[t.NUMERICIDENTIFIERLOOSE] + ')\\.' +
                        '(' + src[t.NUMERICIDENTIFIERLOOSE] + ')\\.' +
                        '(' + src[t.NUMERICIDENTIFIERLOOSE] + ')';

// ## Pre-release Version Identifier
// A numeric identifier, or a non-numeric identifier.

tok('PRERELEASEIDENTIFIER');
src[t.PRERELEASEIDENTIFIER] = '(?:' + src[t.NUMERICIDENTIFIER] +
                            '|' + src[t.NONNUMERICIDENTIFIER] + ')';

tok('PRERELEASEIDENTIFIERLOOSE');
src[t.PRERELEASEIDENTIFIERLOOSE] = '(?:' + src[t.NUMERICIDENTIFIERLOOSE] +
                                 '|' + src[t.NONNUMERICIDENTIFIER] + ')';

// ## Pre-release Version
// Hyphen, followed by one or more dot-separated pre-release version
// identifiers.

tok('PRERELEASE');
src[t.PRERELEASE] = '(?:-(' + src[t.PRERELEASEIDENTIFIER] +
                  '(?:\\.' + src[t.PRERELEASEIDENTIFIER] + ')*))';

tok('PRERELEASELOOSE');
src[t.PRERELEASELOOSE] = '(?:-?(' + src[t.PRERELEASEIDENTIFIERLOOSE] +
                       '(?:\\.' + src[t.PRERELEASEIDENTIFIERLOOSE] + ')*))';

// ## Build Metadata Identifier
// Any combination of digits, letters, or hyphens.

tok('BUILDIDENTIFIER');
src[t.BUILDIDENTIFIER] = '[0-9A-Za-z-]+';

// ## Build Metadata
// Plus sign, followed by one or more period-separated build metadata
// identifiers.

tok('BUILD');
src[t.BUILD] = '(?:\\+(' + src[t.BUILDIDENTIFIER] +
             '(?:\\.' + src[t.BUILDIDENTIFIER] + ')*))';

// ## Full Version String
// A main version, followed optionally by a pre-release version and
// build metadata.

// Note that the only major, minor, patch, and pre-release sections of
// the version string are capturing groups.  The build metadata is not a
// capturing group, because it should not ever be used in version
// comparison.

tok('FULL');
tok('FULLPLAIN');
src[t.FULLPLAIN] = 'v?' + src[t.MAINVERSION] +
                  src[t.PRERELEASE] + '?' +
                  src[t.BUILD] + '?';

src[t.FULL] = '^' + src[t.FULLPLAIN] + '$';

// like full, but allows v1.2.3 and =1.2.3, which people do sometimes.
// also, 1.0.0alpha1 (prerelease without the hyphen) which is pretty
// common in the npm registry.
tok('LOOSEPLAIN');
src[t.LOOSEPLAIN] = '[v=\\s]*' + src[t.MAINVERSIONLOOSE] +
                  src[t.PRERELEASELOOSE] + '?' +
                  src[t.BUILD] + '?';

tok('LOOSE');
src[t.LOOSE] = '^' + src[t.LOOSEPLAIN] + '$';

tok('GTLT');
src[t.GTLT] = '((?:<|>)?=?)';

// Something like "2.*" or "1.2.x".
// Note that "x.x" is a valid xRange identifer, meaning "any version"
// Only the first item is strictly required.
tok('XRANGEIDENTIFIERLOOSE');
src[t.XRANGEIDENTIFIERLOOSE] = src[t.NUMERICIDENTIFIERLOOSE] + '|x|X|\\*';
tok('XRANGEIDENTIFIER');
src[t.XRANGEIDENTIFIER] = src[t.NUMERICIDENTIFIER] + '|x|X|\\*';

tok('XRANGEPLAIN');
src[t.XRANGEPLAIN] = '[v=\\s]*(' + src[t.XRANGEIDENTIFIER] + ')' +
                   '(?:\\.(' + src[t.XRANGEIDENTIFIER] + ')' +
                   '(?:\\.(' + src[t.XRANGEIDENTIFIER] + ')' +
                   '(?:' + src[t.PRERELEASE] + ')?' +
                   src[t.BUILD] + '?' +
                   ')?)?';

tok('XRANGEPLAINLOOSE');
src[t.XRANGEPLAINLOOSE] = '[v=\\s]*(' + src[t.XRANGEIDENTIFIERLOOSE] + ')' +
                        '(?:\\.(' + src[t.XRANGEIDENTIFIERLOOSE] + ')' +
                        '(?:\\.(' + src[t.XRANGEIDENTIFIERLOOSE] + ')' +
                        '(?:' + src[t.PRERELEASELOOSE] + ')?' +
                        src[t.BUILD] + '?' +
                        ')?)?';

tok('XRANGE');
src[t.XRANGE] = '^' + src[t.GTLT] + '\\s*' + src[t.XRANGEPLAIN] + '$';
tok('XRANGELOOSE');
src[t.XRANGELOOSE] = '^' + src[t.GTLT] + '\\s*' + src[t.XRANGEPLAINLOOSE] + '$';

// Coercion.
// Extract anything that could conceivably be a part of a valid semver
tok('COERCE');
src[t.COERCE] = '(^|[^\\d])' +
              '(\\d{1,' + MAX_SAFE_COMPONENT_LENGTH + '})' +
              '(?:\\.(\\d{1,' + MAX_SAFE_COMPONENT_LENGTH + '}))?' +
              '(?:\\.(\\d{1,' + MAX_SAFE_COMPONENT_LENGTH + '}))?' +
              '(?:$|[^\\d])';
tok('COERCERTL');
re[t.COERCERTL] = new RegExp(src[t.COERCE], 'g');

// Tilde ranges.
// Meaning is "reasonably at or greater than"
tok('LONETILDE');
src[t.LONETILDE] = '(?:~>?)';

tok('TILDETRIM');
src[t.TILDETRIM] = '(\\s*)' + src[t.LONETILDE] + '\\s+';
re[t.TILDETRIM] = new RegExp(src[t.TILDETRIM], 'g');
var tildeTrimReplace = '$1~';

tok('TILDE');
src[t.TILDE] = '^' + src[t.LONETILDE] + src[t.XRANGEPLAIN] + '$';
tok('TILDELOOSE');
src[t.TILDELOOSE] = '^' + src[t.LONETILDE] + src[t.XRANGEPLAINLOOSE] + '$';

// Caret ranges.
// Meaning is "at least and backwards compatible with"
tok('LONECARET');
src[t.LONECARET] = '(?:\\^)';

tok('CARETTRIM');
src[t.CARETTRIM] = '(\\s*)' + src[t.LONECARET] + '\\s+';
re[t.CARETTRIM] = new RegExp(src[t.CARETTRIM], 'g');
var caretTrimReplace = '$1^';

tok('CARET');
src[t.CARET] = '^' + src[t.LONECARET] + src[t.XRANGEPLAIN] + '$';
tok('CARETLOOSE');
src[t.CARETLOOSE] = '^' + src[t.LONECARET] + src[t.XRANGEPLAINLOOSE] + '$';

// A simple gt/lt/eq thing, or just "" to indicate "any version"
tok('COMPARATORLOOSE');
src[t.COMPARATORLOOSE] = '^' + src[t.GTLT] + '\\s*(' + src[t.LOOSEPLAIN] + ')$|^$';
tok('COMPARATOR');
src[t.COMPARATOR] = '^' + src[t.GTLT] + '\\s*(' + src[t.FULLPLAIN] + ')$|^$';

// An expression to strip any whitespace between the gtlt and the thing
// it modifies, so that `> 1.2.3` ==> `>1.2.3`
tok('COMPARATORTRIM');
src[t.COMPARATORTRIM] = '(\\s*)' + src[t.GTLT] +
                      '\\s*(' + src[t.LOOSEPLAIN] + '|' + src[t.XRANGEPLAIN] + ')';

// this one has to use the /g flag
re[t.COMPARATORTRIM] = new RegExp(src[t.COMPARATORTRIM], 'g');
var comparatorTrimReplace = '$1$2$3';

// Something like `1.2.3 - 1.2.4`
// Note that these all use the loose form, because they'll be
// checked against either the strict or loose comparator form
// later.
tok('HYPHENRANGE');
src[t.HYPHENRANGE] = '^\\s*(' + src[t.XRANGEPLAIN] + ')' +
                   '\\s+-\\s+' +
                   '(' + src[t.XRANGEPLAIN] + ')' +
                   '\\s*$';

tok('HYPHENRANGELOOSE');
src[t.HYPHENRANGELOOSE] = '^\\s*(' + src[t.XRANGEPLAINLOOSE] + ')' +
                        '\\s+-\\s+' +
                        '(' + src[t.XRANGEPLAINLOOSE] + ')' +
                        '\\s*$';

// Star ranges basically just allow anything at all.
tok('STAR');
src[t.STAR] = '(<|>)?=?\\s*\\*';

// Compile to actual regexp objects.
// All are flag-free, unless they were created above with a flag.
for (var i = 0; i < R; i++) {
  debug(i, src[i]);
  if (!re[i]) {
    re[i] = new RegExp(src[i]);
  }
}

exports.parse = parse;
function parse (version, options) {
  if (!options || typeof options !== 'object') {
    options = {
      loose: !!options,
      includePrerelease: false
    };
  }

  if (version instanceof SemVer) {
    return version
  }

  if (typeof version !== 'string') {
    return null
  }

  if (version.length > MAX_LENGTH) {
    return null
  }

  var r = options.loose ? re[t.LOOSE] : re[t.FULL];
  if (!r.test(version)) {
    return null
  }

  try {
    return new SemVer(version, options)
  } catch (er) {
    return null
  }
}

exports.valid = valid;
function valid (version, options) {
  var v = parse(version, options);
  return v ? v.version : null
}

exports.clean = clean;
function clean (version, options) {
  var s = parse(version.trim().replace(/^[=v]+/, ''), options);
  return s ? s.version : null
}

exports.SemVer = SemVer;

function SemVer (version, options) {
  if (!options || typeof options !== 'object') {
    options = {
      loose: !!options,
      includePrerelease: false
    };
  }
  if (version instanceof SemVer) {
    if (version.loose === options.loose) {
      return version
    } else {
      version = version.version;
    }
  } else if (typeof version !== 'string') {
    throw new TypeError('Invalid Version: ' + version)
  }

  if (version.length > MAX_LENGTH) {
    throw new TypeError('version is longer than ' + MAX_LENGTH + ' characters')
  }

  if (!(this instanceof SemVer)) {
    return new SemVer(version, options)
  }

  debug('SemVer', version, options);
  this.options = options;
  this.loose = !!options.loose;

  var m = version.trim().match(options.loose ? re[t.LOOSE] : re[t.FULL]);

  if (!m) {
    throw new TypeError('Invalid Version: ' + version)
  }

  this.raw = version;

  // these are actually numbers
  this.major = +m[1];
  this.minor = +m[2];
  this.patch = +m[3];

  if (this.major > MAX_SAFE_INTEGER || this.major < 0) {
    throw new TypeError('Invalid major version')
  }

  if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) {
    throw new TypeError('Invalid minor version')
  }

  if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) {
    throw new TypeError('Invalid patch version')
  }

  // numberify any prerelease numeric ids
  if (!m[4]) {
    this.prerelease = [];
  } else {
    this.prerelease = m[4].split('.').map(function (id) {
      if (/^[0-9]+$/.test(id)) {
        var num = +id;
        if (num >= 0 && num < MAX_SAFE_INTEGER) {
          return num
        }
      }
      return id
    });
  }

  this.build = m[5] ? m[5].split('.') : [];
  this.format();
}

SemVer.prototype.format = function () {
  this.version = this.major + '.' + this.minor + '.' + this.patch;
  if (this.prerelease.length) {
    this.version += '-' + this.prerelease.join('.');
  }
  return this.version
};

SemVer.prototype.toString = function () {
  return this.version
};

SemVer.prototype.compare = function (other) {
  debug('SemVer.compare', this.version, this.options, other);
  if (!(other instanceof SemVer)) {
    other = new SemVer(other, this.options);
  }

  return this.compareMain(other) || this.comparePre(other)
};

SemVer.prototype.compareMain = function (other) {
  if (!(other instanceof SemVer)) {
    other = new SemVer(other, this.options);
  }

  return compareIdentifiers(this.major, other.major) ||
         compareIdentifiers(this.minor, other.minor) ||
         compareIdentifiers(this.patch, other.patch)
};

SemVer.prototype.comparePre = function (other) {
  if (!(other instanceof SemVer)) {
    other = new SemVer(other, this.options);
  }

  // NOT having a prerelease is > having one
  if (this.prerelease.length && !other.prerelease.length) {
    return -1
  } else if (!this.prerelease.length && other.prerelease.length) {
    return 1
  } else if (!this.prerelease.length && !other.prerelease.length) {
    return 0
  }

  var i = 0;
  do {
    var a = this.prerelease[i];
    var b = other.prerelease[i];
    debug('prerelease compare', i, a, b);
    if (a === undefined && b === undefined) {
      return 0
    } else if (b === undefined) {
      return 1
    } else if (a === undefined) {
      return -1
    } else if (a === b) {
      continue
    } else {
      return compareIdentifiers(a, b)
    }
  } while (++i)
};

SemVer.prototype.compareBuild = function (other) {
  if (!(other instanceof SemVer)) {
    other = new SemVer(other, this.options);
  }

  var i = 0;
  do {
    var a = this.build[i];
    var b = other.build[i];
    debug('prerelease compare', i, a, b);
    if (a === undefined && b === undefined) {
      return 0
    } else if (b === undefined) {
      return 1
    } else if (a === undefined) {
      return -1
    } else if (a === b) {
      continue
    } else {
      return compareIdentifiers(a, b)
    }
  } while (++i)
};

// preminor will bump the version up to the next minor release, and immediately
// down to pre-release. premajor and prepatch work the same way.
SemVer.prototype.inc = function (release, identifier) {
  switch (release) {
    case 'premajor':
      this.prerelease.length = 0;
      this.patch = 0;
      this.minor = 0;
      this.major++;
      this.inc('pre', identifier);
      break
    case 'preminor':
      this.prerelease.length = 0;
      this.patch = 0;
      this.minor++;
      this.inc('pre', identifier);
      break
    case 'prepatch':
      // If this is already a prerelease, it will bump to the next version
      // drop any prereleases that might already exist, since they are not
      // relevant at this point.
      this.prerelease.length = 0;
      this.inc('patch', identifier);
      this.inc('pre', identifier);
      break
    // If the input is a non-prerelease version, this acts the same as
    // prepatch.
    case 'prerelease':
      if (this.prerelease.length === 0) {
        this.inc('patch', identifier);
      }
      this.inc('pre', identifier);
      break

    case 'major':
      // If this is a pre-major version, bump up to the same major version.
      // Otherwise increment major.
      // 1.0.0-5 bumps to 1.0.0
      // 1.1.0 bumps to 2.0.0
      if (this.minor !== 0 ||
          this.patch !== 0 ||
          this.prerelease.length === 0) {
        this.major++;
      }
      this.minor = 0;
      this.patch = 0;
      this.prerelease = [];
      break
    case 'minor':
      // If this is a pre-minor version, bump up to the same minor version.
      // Otherwise increment minor.
      // 1.2.0-5 bumps to 1.2.0
      // 1.2.1 bumps to 1.3.0
      if (this.patch !== 0 || this.prerelease.length === 0) {
        this.minor++;
      }
      this.patch = 0;
      this.prerelease = [];
      break
    case 'patch':
      // If this is not a pre-release version, it will increment the patch.
      // If it is a pre-release it will bump up to the same patch version.
      // 1.2.0-5 patches to 1.2.0
      // 1.2.0 patches to 1.2.1
      if (this.prerelease.length === 0) {
        this.patch++;
      }
      this.prerelease = [];
      break
    // This probably shouldn't be used publicly.
    // 1.0.0 "pre" would become 1.0.0-0 which is the wrong direction.
    case 'pre':
      if (this.prerelease.length === 0) {
        this.prerelease = [0];
      } else {
        var i = this.prerelease.length;
        while (--i >= 0) {
          if (typeof this.prerelease[i] === 'number') {
            this.prerelease[i]++;
            i = -2;
          }
        }
        if (i === -1) {
          // didn't increment anything
          this.prerelease.push(0);
        }
      }
      if (identifier) {
        // 1.2.0-beta.1 bumps to 1.2.0-beta.2,
        // 1.2.0-beta.fooblz or 1.2.0-beta bumps to 1.2.0-beta.0
        if (this.prerelease[0] === identifier) {
          if (isNaN(this.prerelease[1])) {
            this.prerelease = [identifier, 0];
          }
        } else {
          this.prerelease = [identifier, 0];
        }
      }
      break

    default:
      throw new Error('invalid increment argument: ' + release)
  }
  this.format();
  this.raw = this.version;
  return this
};

exports.inc = inc;
function inc (version, release, loose, identifier) {
  if (typeof (loose) === 'string') {
    identifier = loose;
    loose = undefined;
  }

  try {
    return new SemVer(version, loose).inc(release, identifier).version
  } catch (er) {
    return null
  }
}

exports.diff = diff;
function diff (version1, version2) {
  if (eq(version1, version2)) {
    return null
  } else {
    var v1 = parse(version1);
    var v2 = parse(version2);
    var prefix = '';
    if (v1.prerelease.length || v2.prerelease.length) {
      prefix = 'pre';
      var defaultResult = 'prerelease';
    }
    for (var key in v1) {
      if (key === 'major' || key === 'minor' || key === 'patch') {
        if (v1[key] !== v2[key]) {
          return prefix + key
        }
      }
    }
    return defaultResult // may be undefined
  }
}

exports.compareIdentifiers = compareIdentifiers;

var numeric = /^[0-9]+$/;
function compareIdentifiers (a, b) {
  var anum = numeric.test(a);
  var bnum = numeric.test(b);

  if (anum && bnum) {
    a = +a;
    b = +b;
  }

  return a === b ? 0
    : (anum && !bnum) ? -1
    : (bnum && !anum) ? 1
    : a < b ? -1
    : 1
}

exports.rcompareIdentifiers = rcompareIdentifiers;
function rcompareIdentifiers (a, b) {
  return compareIdentifiers(b, a)
}

exports.major = major;
function major (a, loose) {
  return new SemVer(a, loose).major
}

exports.minor = minor;
function minor (a, loose) {
  return new SemVer(a, loose).minor
}

exports.patch = patch;
function patch (a, loose) {
  return new SemVer(a, loose).patch
}

exports.compare = compare;
function compare (a, b, loose) {
  return new SemVer(a, loose).compare(new SemVer(b, loose))
}

exports.compareLoose = compareLoose;
function compareLoose (a, b) {
  return compare(a, b, true)
}

exports.compareBuild = compareBuild;
function compareBuild (a, b, loose) {
  var versionA = new SemVer(a, loose);
  var versionB = new SemVer(b, loose);
  return versionA.compare(versionB) || versionA.compareBuild(versionB)
}

exports.rcompare = rcompare;
function rcompare (a, b, loose) {
  return compare(b, a, loose)
}

exports.sort = sort;
function sort (list, loose) {
  return list.sort(function (a, b) {
    return exports.compareBuild(a, b, loose)
  })
}

exports.rsort = rsort;
function rsort (list, loose) {
  return list.sort(function (a, b) {
    return exports.compareBuild(b, a, loose)
  })
}

exports.gt = gt;
function gt (a, b, loose) {
  return compare(a, b, loose) > 0
}

exports.lt = lt;
function lt (a, b, loose) {
  return compare(a, b, loose) < 0
}

exports.eq = eq;
function eq (a, b, loose) {
  return compare(a, b, loose) === 0
}

exports.neq = neq;
function neq (a, b, loose) {
  return compare(a, b, loose) !== 0
}

exports.gte = gte;
function gte (a, b, loose) {
  return compare(a, b, loose) >= 0
}

exports.lte = lte;
function lte (a, b, loose) {
  return compare(a, b, loose) <= 0
}

exports.cmp = cmp;
function cmp (a, op, b, loose) {
  switch (op) {
    case '===':
      if (typeof a === 'object')
        { a = a.version; }
      if (typeof b === 'object')
        { b = b.version; }
      return a === b

    case '!==':
      if (typeof a === 'object')
        { a = a.version; }
      if (typeof b === 'object')
        { b = b.version; }
      return a !== b

    case '':
    case '=':
    case '==':
      return eq(a, b, loose)

    case '!=':
      return neq(a, b, loose)

    case '>':
      return gt(a, b, loose)

    case '>=':
      return gte(a, b, loose)

    case '<':
      return lt(a, b, loose)

    case '<=':
      return lte(a, b, loose)

    default:
      throw new TypeError('Invalid operator: ' + op)
  }
}

exports.Comparator = Comparator;
function Comparator (comp, options) {
  if (!options || typeof options !== 'object') {
    options = {
      loose: !!options,
      includePrerelease: false
    };
  }

  if (comp instanceof Comparator) {
    if (comp.loose === !!options.loose) {
      return comp
    } else {
      comp = comp.value;
    }
  }

  if (!(this instanceof Comparator)) {
    return new Comparator(comp, options)
  }

  debug('comparator', comp, options);
  this.options = options;
  this.loose = !!options.loose;
  this.parse(comp);

  if (this.semver === ANY) {
    this.value = '';
  } else {
    this.value = this.operator + this.semver.version;
  }

  debug('comp', this);
}

var ANY = {};
Comparator.prototype.parse = function (comp) {
  var r = this.options.loose ? re[t.COMPARATORLOOSE] : re[t.COMPARATOR];
  var m = comp.match(r);

  if (!m) {
    throw new TypeError('Invalid comparator: ' + comp)
  }

  this.operator = m[1] !== undefined ? m[1] : '';
  if (this.operator === '=') {
    this.operator = '';
  }

  // if it literally is just '>' or '' then allow anything.
  if (!m[2]) {
    this.semver = ANY;
  } else {
    this.semver = new SemVer(m[2], this.options.loose);
  }
};

Comparator.prototype.toString = function () {
  return this.value
};

Comparator.prototype.test = function (version) {
  debug('Comparator.test', version, this.options.loose);

  if (this.semver === ANY || version === ANY) {
    return true
  }

  if (typeof version === 'string') {
    try {
      version = new SemVer(version, this.options);
    } catch (er) {
      return false
    }
  }

  return cmp(version, this.operator, this.semver, this.options)
};

Comparator.prototype.intersects = function (comp, options) {
  if (!(comp instanceof Comparator)) {
    throw new TypeError('a Comparator is required')
  }

  if (!options || typeof options !== 'object') {
    options = {
      loose: !!options,
      includePrerelease: false
    };
  }

  var rangeTmp;

  if (this.operator === '') {
    if (this.value === '') {
      return true
    }
    rangeTmp = new Range(comp.value, options);
    return satisfies(this.value, rangeTmp, options)
  } else if (comp.operator === '') {
    if (comp.value === '') {
      return true
    }
    rangeTmp = new Range(this.value, options);
    return satisfies(comp.semver, rangeTmp, options)
  }

  var sameDirectionIncreasing =
    (this.operator === '>=' || this.operator === '>') &&
    (comp.operator === '>=' || comp.operator === '>');
  var sameDirectionDecreasing =
    (this.operator === '<=' || this.operator === '<') &&
    (comp.operator === '<=' || comp.operator === '<');
  var sameSemVer = this.semver.version === comp.semver.version;
  var differentDirectionsInclusive =
    (this.operator === '>=' || this.operator === '<=') &&
    (comp.operator === '>=' || comp.operator === '<=');
  var oppositeDirectionsLessThan =
    cmp(this.semver, '<', comp.semver, options) &&
    ((this.operator === '>=' || this.operator === '>') &&
    (comp.operator === '<=' || comp.operator === '<'));
  var oppositeDirectionsGreaterThan =
    cmp(this.semver, '>', comp.semver, options) &&
    ((this.operator === '<=' || this.operator === '<') &&
    (comp.operator === '>=' || comp.operator === '>'));

  return sameDirectionIncreasing || sameDirectionDecreasing ||
    (sameSemVer && differentDirectionsInclusive) ||
    oppositeDirectionsLessThan || oppositeDirectionsGreaterThan
};

exports.Range = Range;
function Range (range, options) {
  if (!options || typeof options !== 'object') {
    options = {
      loose: !!options,
      includePrerelease: false
    };
  }

  if (range instanceof Range) {
    if (range.loose === !!options.loose &&
        range.includePrerelease === !!options.includePrerelease) {
      return range
    } else {
      return new Range(range.raw, options)
    }
  }

  if (range instanceof Comparator) {
    return new Range(range.value, options)
  }

  if (!(this instanceof Range)) {
    return new Range(range, options)
  }

  this.options = options;
  this.loose = !!options.loose;
  this.includePrerelease = !!options.includePrerelease;

  // First, split based on boolean or ||
  this.raw = range;
  this.set = range.split(/\s*\|\|\s*/).map(function (range) {
    return this.parseRange(range.trim())
  }, this).filter(function (c) {
    // throw out any that are not relevant for whatever reason
    return c.length
  });

  if (!this.set.length) {
    throw new TypeError('Invalid SemVer Range: ' + range)
  }

  this.format();
}

Range.prototype.format = function () {
  this.range = this.set.map(function (comps) {
    return comps.join(' ').trim()
  }).join('||').trim();
  return this.range
};

Range.prototype.toString = function () {
  return this.range
};

Range.prototype.parseRange = function (range) {
  var loose = this.options.loose;
  range = range.trim();
  // `1.2.3 - 1.2.4` => `>=1.2.3 <=1.2.4`
  var hr = loose ? re[t.HYPHENRANGELOOSE] : re[t.HYPHENRANGE];
  range = range.replace(hr, hyphenReplace);
  debug('hyphen replace', range);
  // `> 1.2.3 < 1.2.5` => `>1.2.3 <1.2.5`
  range = range.replace(re[t.COMPARATORTRIM], comparatorTrimReplace);
  debug('comparator trim', range, re[t.COMPARATORTRIM]);

  // `~ 1.2.3` => `~1.2.3`
  range = range.replace(re[t.TILDETRIM], tildeTrimReplace);

  // `^ 1.2.3` => `^1.2.3`
  range = range.replace(re[t.CARETTRIM], caretTrimReplace);

  // normalize spaces
  range = range.split(/\s+/).join(' ');

  // At this point, the range is completely trimmed and
  // ready to be split into comparators.

  var compRe = loose ? re[t.COMPARATORLOOSE] : re[t.COMPARATOR];
  var set = range.split(' ').map(function (comp) {
    return parseComparator(comp, this.options)
  }, this).join(' ').split(/\s+/);
  if (this.options.loose) {
    // in loose mode, throw out any that are not valid comparators
    set = set.filter(function (comp) {
      return !!comp.match(compRe)
    });
  }
  set = set.map(function (comp) {
    return new Comparator(comp, this.options)
  }, this);

  return set
};

Range.prototype.intersects = function (range, options) {
  if (!(range instanceof Range)) {
    throw new TypeError('a Range is required')
  }

  return this.set.some(function (thisComparators) {
    return (
      isSatisfiable(thisComparators, options) &&
      range.set.some(function (rangeComparators) {
        return (
          isSatisfiable(rangeComparators, options) &&
          thisComparators.every(function (thisComparator) {
            return rangeComparators.every(function (rangeComparator) {
              return thisComparator.intersects(rangeComparator, options)
            })
          })
        )
      })
    )
  })
};

// take a set of comparators and determine whether there
// exists a version which can satisfy it
function isSatisfiable (comparators, options) {
  var result = true;
  var remainingComparators = comparators.slice();
  var testComparator = remainingComparators.pop();

  while (result && remainingComparators.length) {
    result = remainingComparators.every(function (otherComparator) {
      return testComparator.intersects(otherComparator, options)
    });

    testComparator = remainingComparators.pop();
  }

  return result
}

// Mostly just for testing and legacy API reasons
exports.toComparators = toComparators;
function toComparators (range, options) {
  return new Range(range, options).set.map(function (comp) {
    return comp.map(function (c) {
      return c.value
    }).join(' ').trim().split(' ')
  })
}

// comprised of xranges, tildes, stars, and gtlt's at this point.
// already replaced the hyphen ranges
// turn into a set of JUST comparators.
function parseComparator (comp, options) {
  debug('comp', comp, options);
  comp = replaceCarets(comp, options);
  debug('caret', comp);
  comp = replaceTildes(comp, options);
  debug('tildes', comp);
  comp = replaceXRanges(comp, options);
  debug('xrange', comp);
  comp = replaceStars(comp, options);
  debug('stars', comp);
  return comp
}

function isX (id) {
  return !id || id.toLowerCase() === 'x' || id === '*'
}

// ~, ~> --> * (any, kinda silly)
// ~2, ~2.x, ~2.x.x, ~>2, ~>2.x ~>2.x.x --> >=2.0.0 <3.0.0
// ~2.0, ~2.0.x, ~>2.0, ~>2.0.x --> >=2.0.0 <2.1.0
// ~1.2, ~1.2.x, ~>1.2, ~>1.2.x --> >=1.2.0 <1.3.0
// ~1.2.3, ~>1.2.3 --> >=1.2.3 <1.3.0
// ~1.2.0, ~>1.2.0 --> >=1.2.0 <1.3.0
function replaceTildes (comp, options) {
  return comp.trim().split(/\s+/).map(function (comp) {
    return replaceTilde(comp, options)
  }).join(' ')
}

function replaceTilde (comp, options) {
  var r = options.loose ? re[t.TILDELOOSE] : re[t.TILDE];
  return comp.replace(r, function (_, M, m, p, pr) {
    debug('tilde', comp, _, M, m, p, pr);
    var ret;

    if (isX(M)) {
      ret = '';
    } else if (isX(m)) {
      ret = '>=' + M + '.0.0 <' + (+M + 1) + '.0.0';
    } else if (isX(p)) {
      // ~1.2 == >=1.2.0 <1.3.0
      ret = '>=' + M + '.' + m + '.0 <' + M + '.' + (+m + 1) + '.0';
    } else if (pr) {
      debug('replaceTilde pr', pr);
      ret = '>=' + M + '.' + m + '.' + p + '-' + pr +
            ' <' + M + '.' + (+m + 1) + '.0';
    } else {
      // ~1.2.3 == >=1.2.3 <1.3.0
      ret = '>=' + M + '.' + m + '.' + p +
            ' <' + M + '.' + (+m + 1) + '.0';
    }

    debug('tilde return', ret);
    return ret
  })
}

// ^ --> * (any, kinda silly)
// ^2, ^2.x, ^2.x.x --> >=2.0.0 <3.0.0
// ^2.0, ^2.0.x --> >=2.0.0 <3.0.0
// ^1.2, ^1.2.x --> >=1.2.0 <2.0.0
// ^1.2.3 --> >=1.2.3 <2.0.0
// ^1.2.0 --> >=1.2.0 <2.0.0
function replaceCarets (comp, options) {
  return comp.trim().split(/\s+/).map(function (comp) {
    return replaceCaret(comp, options)
  }).join(' ')
}

function replaceCaret (comp, options) {
  debug('caret', comp, options);
  var r = options.loose ? re[t.CARETLOOSE] : re[t.CARET];
  return comp.replace(r, function (_, M, m, p, pr) {
    debug('caret', comp, _, M, m, p, pr);
    var ret;

    if (isX(M)) {
      ret = '';
    } else if (isX(m)) {
      ret = '>=' + M + '.0.0 <' + (+M + 1) + '.0.0';
    } else if (isX(p)) {
      if (M === '0') {
        ret = '>=' + M + '.' + m + '.0 <' + M + '.' + (+m + 1) + '.0';
      } else {
        ret = '>=' + M + '.' + m + '.0 <' + (+M + 1) + '.0.0';
      }
    } else if (pr) {
      debug('replaceCaret pr', pr);
      if (M === '0') {
        if (m === '0') {
          ret = '>=' + M + '.' + m + '.' + p + '-' + pr +
                ' <' + M + '.' + m + '.' + (+p + 1);
        } else {
          ret = '>=' + M + '.' + m + '.' + p + '-' + pr +
                ' <' + M + '.' + (+m + 1) + '.0';
        }
      } else {
        ret = '>=' + M + '.' + m + '.' + p + '-' + pr +
              ' <' + (+M + 1) + '.0.0';
      }
    } else {
      debug('no pr');
      if (M === '0') {
        if (m === '0') {
          ret = '>=' + M + '.' + m + '.' + p +
                ' <' + M + '.' + m + '.' + (+p + 1);
        } else {
          ret = '>=' + M + '.' + m + '.' + p +
                ' <' + M + '.' + (+m + 1) + '.0';
        }
      } else {
        ret = '>=' + M + '.' + m + '.' + p +
              ' <' + (+M + 1) + '.0.0';
      }
    }

    debug('caret return', ret);
    return ret
  })
}

function replaceXRanges (comp, options) {
  debug('replaceXRanges', comp, options);
  return comp.split(/\s+/).map(function (comp) {
    return replaceXRange(comp, options)
  }).join(' ')
}

function replaceXRange (comp, options) {
  comp = comp.trim();
  var r = options.loose ? re[t.XRANGELOOSE] : re[t.XRANGE];
  return comp.replace(r, function (ret, gtlt, M, m, p, pr) {
    debug('xRange', comp, ret, gtlt, M, m, p, pr);
    var xM = isX(M);
    var xm = xM || isX(m);
    var xp = xm || isX(p);
    var anyX = xp;

    if (gtlt === '=' && anyX) {
      gtlt = '';
    }

    // if we're including prereleases in the match, then we need
    // to fix this to -0, the lowest possible prerelease value
    pr = options.includePrerelease ? '-0' : '';

    if (xM) {
      if (gtlt === '>' || gtlt === '<') {
        // nothing is allowed
        ret = '<0.0.0-0';
      } else {
        // nothing is forbidden
        ret = '*';
      }
    } else if (gtlt && anyX) {
      // we know patch is an x, because we have any x at all.
      // replace X with 0
      if (xm) {
        m = 0;
      }
      p = 0;

      if (gtlt === '>') {
        // >1 => >=2.0.0
        // >1.2 => >=1.3.0
        // >1.2.3 => >= 1.2.4
        gtlt = '>=';
        if (xm) {
          M = +M + 1;
          m = 0;
          p = 0;
        } else {
          m = +m + 1;
          p = 0;
        }
      } else if (gtlt === '<=') {
        // <=0.7.x is actually <0.8.0, since any 0.7.x should
        // pass.  Similarly, <=7.x is actually <8.0.0, etc.
        gtlt = '<';
        if (xm) {
          M = +M + 1;
        } else {
          m = +m + 1;
        }
      }

      ret = gtlt + M + '.' + m + '.' + p + pr;
    } else if (xm) {
      ret = '>=' + M + '.0.0' + pr + ' <' + (+M + 1) + '.0.0' + pr;
    } else if (xp) {
      ret = '>=' + M + '.' + m + '.0' + pr +
        ' <' + M + '.' + (+m + 1) + '.0' + pr;
    }

    debug('xRange return', ret);

    return ret
  })
}

// Because * is AND-ed with everything else in the comparator,
// and '' means "any version", just remove the *s entirely.
function replaceStars (comp, options) {
  debug('replaceStars', comp, options);
  // Looseness is ignored here.  star is always as loose as it gets!
  return comp.trim().replace(re[t.STAR], '')
}

// This function is passed to string.replace(re[t.HYPHENRANGE])
// M, m, patch, prerelease, build
// 1.2 - 3.4.5 => >=1.2.0 <=3.4.5
// 1.2.3 - 3.4 => >=1.2.0 <3.5.0 Any 3.4.x will do
// 1.2 - 3.4 => >=1.2.0 <3.5.0
function hyphenReplace ($0,
  from, fM, fm, fp, fpr, fb,
  to, tM, tm, tp, tpr, tb) {
  if (isX(fM)) {
    from = '';
  } else if (isX(fm)) {
    from = '>=' + fM + '.0.0';
  } else if (isX(fp)) {
    from = '>=' + fM + '.' + fm + '.0';
  } else {
    from = '>=' + from;
  }

  if (isX(tM)) {
    to = '';
  } else if (isX(tm)) {
    to = '<' + (+tM + 1) + '.0.0';
  } else if (isX(tp)) {
    to = '<' + tM + '.' + (+tm + 1) + '.0';
  } else if (tpr) {
    to = '<=' + tM + '.' + tm + '.' + tp + '-' + tpr;
  } else {
    to = '<=' + to;
  }

  return (from + ' ' + to).trim()
}

// if ANY of the sets match ALL of its comparators, then pass
Range.prototype.test = function (version) {
  if (!version) {
    return false
  }

  if (typeof version === 'string') {
    try {
      version = new SemVer(version, this.options);
    } catch (er) {
      return false
    }
  }

  for (var i = 0; i < this.set.length; i++) {
    if (testSet(this.set[i], version, this.options)) {
      return true
    }
  }
  return false
};

function testSet (set, version, options) {
  for (var i = 0; i < set.length; i++) {
    if (!set[i].test(version)) {
      return false
    }
  }

  if (version.prerelease.length && !options.includePrerelease) {
    // Find the set of versions that are allowed to have prereleases
    // For example, ^1.2.3-pr.1 desugars to >=1.2.3-pr.1 <2.0.0
    // That should allow `1.2.3-pr.2` to pass.
    // However, `1.2.4-alpha.notready` should NOT be allowed,
    // even though it's within the range set by the comparators.
    for (i = 0; i < set.length; i++) {
      debug(set[i].semver);
      if (set[i].semver === ANY) {
        continue
      }

      if (set[i].semver.prerelease.length > 0) {
        var allowed = set[i].semver;
        if (allowed.major === version.major &&
            allowed.minor === version.minor &&
            allowed.patch === version.patch) {
          return true
        }
      }
    }

    // Version has a -pre, but it's not one of the ones we like.
    return false
  }

  return true
}

exports.satisfies = satisfies;
function satisfies (version, range, options) {
  try {
    range = new Range(range, options);
  } catch (er) {
    return false
  }
  return range.test(version)
}

exports.maxSatisfying = maxSatisfying;
function maxSatisfying (versions, range, options) {
  var max = null;
  var maxSV = null;
  try {
    var rangeObj = new Range(range, options);
  } catch (er) {
    return null
  }
  versions.forEach(function (v) {
    if (rangeObj.test(v)) {
      // satisfies(v, range, options)
      if (!max || maxSV.compare(v) === -1) {
        // compare(max, v, true)
        max = v;
        maxSV = new SemVer(max, options);
      }
    }
  });
  return max
}

exports.minSatisfying = minSatisfying;
function minSatisfying (versions, range, options) {
  var min = null;
  var minSV = null;
  try {
    var rangeObj = new Range(range, options);
  } catch (er) {
    return null
  }
  versions.forEach(function (v) {
    if (rangeObj.test(v)) {
      // satisfies(v, range, options)
      if (!min || minSV.compare(v) === 1) {
        // compare(min, v, true)
        min = v;
        minSV = new SemVer(min, options);
      }
    }
  });
  return min
}

exports.minVersion = minVersion;
function minVersion (range, loose) {
  range = new Range(range, loose);

  var minver = new SemVer('0.0.0');
  if (range.test(minver)) {
    return minver
  }

  minver = new SemVer('0.0.0-0');
  if (range.test(minver)) {
    return minver
  }

  minver = null;
  for (var i = 0; i < range.set.length; ++i) {
    var comparators = range.set[i];

    comparators.forEach(function (comparator) {
      // Clone to avoid manipulating the comparator's semver object.
      var compver = new SemVer(comparator.semver.version);
      switch (comparator.operator) {
        case '>':
          if (compver.prerelease.length === 0) {
            compver.patch++;
          } else {
            compver.prerelease.push(0);
          }
          compver.raw = compver.format();
          /* fallthrough */
        case '':
        case '>=':
          if (!minver || gt(minver, compver)) {
            minver = compver;
          }
          break
        case '<':
        case '<=':
          /* Ignore maximum versions */
          break
        /* istanbul ignore next */
        default:
          throw new Error('Unexpected operation: ' + comparator.operator)
      }
    });
  }

  if (minver && range.test(minver)) {
    return minver
  }

  return null
}

exports.validRange = validRange;
function validRange (range, options) {
  try {
    // Return '*' instead of '' so that truthiness works.
    // This will throw if it's invalid anyway
    return new Range(range, options).range || '*'
  } catch (er) {
    return null
  }
}

// Determine if version is less than all the versions possible in the range
exports.ltr = ltr;
function ltr (version, range, options) {
  return outside(version, range, '<', options)
}

// Determine if version is greater than all the versions possible in the range.
exports.gtr = gtr;
function gtr (version, range, options) {
  return outside(version, range, '>', options)
}

exports.outside = outside;
function outside (version, range, hilo, options) {
  version = new SemVer(version, options);
  range = new Range(range, options);

  var gtfn, ltefn, ltfn, comp, ecomp;
  switch (hilo) {
    case '>':
      gtfn = gt;
      ltefn = lte;
      ltfn = lt;
      comp = '>';
      ecomp = '>=';
      break
    case '<':
      gtfn = lt;
      ltefn = gte;
      ltfn = gt;
      comp = '<';
      ecomp = '<=';
      break
    default:
      throw new TypeError('Must provide a hilo val of "<" or ">"')
  }

  // If it satisifes the range it is not outside
  if (satisfies(version, range, options)) {
    return false
  }

  // From now on, variable terms are as if we're in "gtr" mode.
  // but note that everything is flipped for the "ltr" function.

  for (var i = 0; i < range.set.length; ++i) {
    var comparators = range.set[i];

    var high = null;
    var low = null;

    comparators.forEach(function (comparator) {
      if (comparator.semver === ANY) {
        comparator = new Comparator('>=0.0.0');
      }
      high = high || comparator;
      low = low || comparator;
      if (gtfn(comparator.semver, high.semver, options)) {
        high = comparator;
      } else if (ltfn(comparator.semver, low.semver, options)) {
        low = comparator;
      }
    });

    // If the edge version comparator has a operator then our version
    // isn't outside it
    if (high.operator === comp || high.operator === ecomp) {
      return false
    }

    // If the lowest version comparator has an operator and our version
    // is less than it then it isn't higher than the range
    if ((!low.operator || low.operator === comp) &&
        ltefn(version, low.semver)) {
      return false
    } else if (low.operator === ecomp && ltfn(version, low.semver)) {
      return false
    }
  }
  return true
}

exports.prerelease = prerelease;
function prerelease (version, options) {
  var parsed = parse(version, options);
  return (parsed && parsed.prerelease.length) ? parsed.prerelease : null
}

exports.intersects = intersects;
function intersects (r1, r2, options) {
  r1 = new Range(r1, options);
  r2 = new Range(r2, options);
  return r1.intersects(r2)
}

exports.coerce = coerce;
function coerce (version, options) {
  if (version instanceof SemVer) {
    return version
  }

  if (typeof version === 'number') {
    version = String(version);
  }

  if (typeof version !== 'string') {
    return null
  }

  options = options || {};

  var match = null;
  if (!options.rtl) {
    match = version.match(re[t.COERCE]);
  } else {
    // Find the right-most coercible string that does not share
    // a terminus with a more left-ward coercible string.
    // Eg, '1.2.3.4' wants to coerce '2.3.4', not '3.4' or '4'
    //
    // Walk through the string checking with a /g regexp
    // Manually set the index so as to pick up overlapping matches.
    // Stop when we get a match that ends at the string end, since no
    // coercible string can be more right-ward without the same terminus.
    var next;
    while ((next = re[t.COERCERTL].exec(version)) &&
      (!match || match.index + match[0].length !== version.length)
    ) {
      if (!match ||
          next.index + next[0].length !== match.index + match[0].length) {
        match = next;
      }
      re[t.COERCERTL].lastIndex = next.index + next[1].length + next[2].length;
    }
    // leave it in a clean state
    re[t.COERCERTL].lastIndex = -1;
  }

  if (match === null) {
    return null
  }

  return parse(match[2] +
    '.' + (match[3] || '0') +
    '.' + (match[4] || '0'), options)
}
});
var semver_1 = semver.SEMVER_SPEC_VERSION;
var semver_2 = semver.re;
var semver_3 = semver.src;
var semver_4 = semver.tokens;
var semver_5 = semver.parse;
var semver_6 = semver.valid;
var semver_7 = semver.clean;
var semver_8 = semver.SemVer;
var semver_9 = semver.inc;
var semver_10 = semver.diff;
var semver_11 = semver.compareIdentifiers;
var semver_12 = semver.rcompareIdentifiers;
var semver_13 = semver.major;
var semver_14 = semver.minor;
var semver_15 = semver.patch;
var semver_16 = semver.compare;
var semver_17 = semver.compareLoose;
var semver_18 = semver.compareBuild;
var semver_19 = semver.rcompare;
var semver_20 = semver.sort;
var semver_21 = semver.rsort;
var semver_22 = semver.gt;
var semver_23 = semver.lt;
var semver_24 = semver.eq;
var semver_25 = semver.neq;
var semver_26 = semver.gte;
var semver_27 = semver.lte;
var semver_28 = semver.cmp;
var semver_29 = semver.Comparator;
var semver_30 = semver.Range;
var semver_31 = semver.toComparators;
var semver_32 = semver.satisfies;
var semver_33 = semver.maxSatisfying;
var semver_34 = semver.minSatisfying;
var semver_35 = semver.minVersion;
var semver_36 = semver.validRange;
var semver_37 = semver.ltr;
var semver_38 = semver.gtr;
var semver_39 = semver.outside;
var semver_40 = semver.prerelease;
var semver_41 = semver.intersects;
var semver_42 = semver.coerce;

// 

function throwError(msg) {
  throw new Error(("[vue-test-utils]: " + msg))
}

function warn(msg) {
  console.error(("[vue-test-utils]: " + msg));
}

var camelizeRE = /-(\w)/g;

var camelize = function (str) {
  var camelizedStr = str.replace(camelizeRE, function (_, c) { return c ? c.toUpperCase() : ''; }
  );
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

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop)
}

function keys(obj) {
  return Object.keys(obj)
}

function resolveComponent(id, components) {
  if (typeof id !== 'string') {
    return
  }
  // check local registration variations first
  if (hasOwnProperty(components, id)) {
    return components[id]
  }
  var camelizedId = camelize(id);
  if (hasOwnProperty(components, camelizedId)) {
    return components[camelizedId]
  }
  var PascalCaseId = capitalize(camelizedId);
  if (hasOwnProperty(components, PascalCaseId)) {
    return components[PascalCaseId]
  }
  // fallback to prototype chain
  return components[id] || components[camelizedId] || components[PascalCaseId]
}

var UA =
  typeof window !== 'undefined' &&
  'navigator' in window &&
  navigator.userAgent.toLowerCase();

var isPhantomJS = UA && UA.includes && UA.match(/phantomjs/i);

var isEdge = UA && UA.indexOf('edge/') > 0;
var isChrome = UA && /chrome\/\d+/.test(UA) && !isEdge;

// 

function addMocks(
  _Vue,
  mockedProperties
) {
  if ( mockedProperties === void 0 ) mockedProperties = {};

  if (mockedProperties === false) {
    return
  }
  Object.keys(mockedProperties).forEach(function (key) {
    try {
      // $FlowIgnore
      _Vue.prototype[key] = mockedProperties[key];
    } catch (e) {
      warn(
        "could not overwrite property " + key + ", this is " +
          "usually caused by a plugin that has added " +
          "the property as a read-only value"
      );
    }
    // $FlowIgnore
    Vue.util.defineReactive(_Vue, key, mockedProperties[key]);
  });
}

// 

function logEvents(
  vm,
  emitted,
  emittedByOrder
) {
  var emit = vm.$emit;
  vm.$emit = function (name) {
    var args = [], len = arguments.length - 1;
    while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];
(emitted[name] || (emitted[name] = [])).push(args);
    emittedByOrder.push({ name: name, args: args });
    return emit.call.apply(emit, [ vm, name ].concat( args ))
  };
}

function addEventLogger(_Vue) {
  _Vue.mixin({
    beforeCreate: function() {
      this.__emitted = Object.create(null);
      this.__emittedByOrder = [];
      logEvents(this, this.__emitted, this.__emittedByOrder);
    }
  });
}

var VUE_VERSION = Number(
  ((Vue.version.split('.')[0]) + "." + (Vue.version.split('.')[1]))
);

var BEFORE_RENDER_LIFECYCLE_HOOK = semver.gt(Vue.version, '2.1.8')
  ? 'beforeCreate'
  : 'beforeMount';

var CREATE_ELEMENT_ALIAS = semver.gt(Vue.version, '2.1.5')
  ? '_c'
  : '_h';

function addStubs(_Vue, stubComponents) {
  var obj;

  function addStubComponentsMixin() {
    Object.assign(this.$options.components, stubComponents);
  }

  _Vue.mixin(( obj = {}, obj[BEFORE_RENDER_LIFECYCLE_HOOK] = addStubComponentsMixin, obj ));
}

// 

function isVueComponent(c) {
  if (isConstructor(c)) {
    return true
  }

  if (c === null || typeof c !== 'object') {
    return false
  }

  if (c.extends || c._Ctor) {
    return true
  }

  if (typeof c.template === 'string') {
    return true
  }

  return typeof c.render === 'function'
}

function componentNeedsCompiling(component) {
  return (
    component &&
    !component.render &&
    (component.template || component.extends || component.extendOptions) &&
    !component.functional
  )
}

function isConstructor(c) {
  return typeof c === 'function' && c.cid
}

function isDynamicComponent(c) {
  return typeof c === 'function' && !c.cid
}

function isComponentOptions(c) {
  return typeof c === 'object' && (c.template || c.render)
}

function isFunctionalComponent(c) {
  if (!isVueComponent(c)) {
    return false
  }
  if (isConstructor(c)) {
    return c.options.functional
  }
  return c.functional
}

function templateContainsComponent(
  template,
  name
) {
  return [capitalize, camelize, hyphenate].some(function (format) {
    var re = new RegExp(("<" + (format(name)) + "\\s*(\\s|>|(/>))"), 'g');
    return re.test(template)
  })
}

function isPlainObject(c) {
  return Object.prototype.toString.call(c) === '[object Object]'
}

function makeMap(str, expectsLowerCase) {
  var map = Object.create(null);
  var list = str.split(',');
  for (var i = 0; i < list.length; i++) {
    map[list[i]] = true;
  }
  return expectsLowerCase
    ? function(val) {
        return map[val.toLowerCase()]
      }
    : function(val) {
        return map[val]
      }
}

var isHTMLTag = makeMap(
  'html,body,base,head,link,meta,style,title,' +
    'address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,' +
    'div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,' +
    'a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,' +
    's,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,' +
    'embed,object,param,source,canvas,script,noscript,del,ins,' +
    'caption,col,colgroup,table,thead,tbody,td,th,tr,video,' +
    'button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,' +
    'output,progress,select,textarea,' +
    'details,dialog,menu,menuitem,summary,' +
    'content,element,shadow,template,blockquote,iframe,tfoot'
);

// this map is intentionally selective, only covering SVG elements that may
// contain child elements.
var isSVG = makeMap(
  'svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,font-face,' +
    'foreignObject,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,' +
    'polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view',
  true
);

var isReservedTag = function (tag) { return isHTMLTag(tag) || isSVG(tag); };

// 

function compileFromString(str) {
  if (!vueTemplateCompiler.compileToFunctions) {
    throwError(
      "vueTemplateCompiler is undefined, you must pass " +
        "precompiled components if vue-template-compiler is " +
        "undefined"
    );
  }
  return vueTemplateCompiler.compileToFunctions(str)
}

function compileTemplate(component) {
  if (component.template) {
    if (component.template.charAt('#') === '#') {
      var el = document.querySelector(component.template);
      if (!el) {
        throwError('Cannot find element' + component.template);

        el = document.createElement('div');
      }
      component.template = el.innerHTML;
    }

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

function compileTemplateForSlots(slots) {
  Object.keys(slots).forEach(function (key) {
    var slot = Array.isArray(slots[key]) ? slots[key] : [slots[key]];
    slot.forEach(function (slotValue) {
      if (componentNeedsCompiling(slotValue)) {
        compileTemplate(slotValue);
      }
    });
  });
}

// 

var MOUNTING_OPTIONS = [
  'attachToDocument',
  'mocks',
  'slots',
  'localVue',
  'stubs',
  'context',
  'clone',
  'attrs',
  'listeners',
  'propsData',
  'shouldProxy'
];

function extractInstanceOptions(options) {
  var instanceOptions = Object.assign({}, options);
  MOUNTING_OPTIONS.forEach(function (mountingOption) {
    delete instanceOptions[mountingOption];
  });
  return instanceOptions
}

// 

function isDestructuringSlotScope(slotScope) {
  return slotScope[0] === '{' && slotScope[slotScope.length - 1] === '}'
}

function getVueTemplateCompilerHelpers(
  _Vue
) {
  // $FlowIgnore
  var vue = new _Vue();
  var helpers = {};
  var names = [
    '_c',
    '_o',
    '_n',
    '_s',
    '_l',
    '_t',
    '_q',
    '_i',
    '_m',
    '_f',
    '_k',
    '_b',
    '_v',
    '_e',
    '_u',
    '_g'
  ];
  names.forEach(function (name) {
    helpers[name] = vue._renderProxy[name];
  });
  helpers.$createElement = vue._renderProxy.$createElement;
  helpers.$set = vue._renderProxy.$set;
  return helpers
}

function validateEnvironment() {
  if (VUE_VERSION < 2.1) {
    throwError("the scopedSlots option is only supported in vue@2.1+.");
  }
}

var slotScopeRe = /<[^>]+ slot-scope=\"(.+)\"/;

// Hide warning about <template> disallowed as root element
function customWarn(msg) {
  if (msg.indexOf('Cannot use <template> as component root element') === -1) {
    console.error(msg);
  }
}

function createScopedSlots(
  scopedSlotsOption,
  _Vue
) {
  var scopedSlots = {};
  if (!scopedSlotsOption) {
    return scopedSlots
  }
  validateEnvironment();
  var helpers = getVueTemplateCompilerHelpers(_Vue);
  var loop = function ( scopedSlotName ) {
    var slot = scopedSlotsOption[scopedSlotName];
    var isFn = typeof slot === 'function';
    // Type check to silence flow (can't use isFn)
    var renderFn =
      typeof slot === 'function'
        ? slot
        : vueTemplateCompiler.compileToFunctions(slot, { warn: customWarn }).render;

    var hasSlotScopeAttr = !isFn && slot.match(slotScopeRe);
    var slotScope = hasSlotScopeAttr && hasSlotScopeAttr[1];
    scopedSlots[scopedSlotName] = function(props) {
      var obj;

      var res;
      if (isFn) {
        res = renderFn.call(Object.assign({}, helpers), props);
      } else if (slotScope && !isDestructuringSlotScope(slotScope)) {
        res = renderFn.call(Object.assign({}, helpers, ( obj = {}, obj[slotScope] = props, obj )));
      } else if (slotScope && isDestructuringSlotScope(slotScope)) {
        res = renderFn.call(Object.assign({}, helpers, props));
      } else {
        res = renderFn.call(Object.assign({}, helpers, {props: props}));
      }
      // res is Array if <template> is a root element
      return Array.isArray(res) ? res[0] : res
    };
  };

  for (var scopedSlotName in scopedSlotsOption) loop( scopedSlotName );
  return scopedSlots
}

// 

function isVueComponentStub(comp) {
  return (comp && comp.template) || isVueComponent(comp)
}

function isValidStub(stub) {
  return (
    typeof stub === 'boolean' ||
    (!!stub && typeof stub === 'string') ||
    isVueComponentStub(stub)
  )
}

function resolveComponent$1(obj, component) {
  return (
    obj[component] ||
    obj[hyphenate(component)] ||
    obj[camelize(component)] ||
    obj[capitalize(camelize(component))] ||
    obj[capitalize(component)] ||
    {}
  )
}

function getCoreProperties(componentOptions) {
  return {
    attrs: componentOptions.attrs,
    name: componentOptions.name,
    model: componentOptions.model,
    props: componentOptions.props,
    on: componentOptions.on,
    key: componentOptions.key,
    domProps: componentOptions.domProps,
    class: componentOptions.class,
    staticClass: componentOptions.staticClass,
    staticStyle: componentOptions.staticStyle,
    style: componentOptions.style,
    normalizedStyle: componentOptions.normalizedStyle,
    nativeOn: componentOptions.nativeOn,
    functional: componentOptions.functional
  }
}

function createClassString(staticClass, dynamicClass) {
  // :class="someComputedObject" can return a string, object or undefined
  // if it is a string, we don't need to do anything special.
  var evaluatedDynamicClass = dynamicClass;

  // if it is an object, eg { 'foo': true }, we need to evaluate it.
  // see https://github.com/vuejs/vue-test-utils/issues/1474 for more context.
  if (typeof dynamicClass === 'object') {
    evaluatedDynamicClass = Object.keys(dynamicClass).reduce(function (acc, key) {
      if (dynamicClass[key]) {
        return acc + ' ' + key
      }
      return acc
    }, '');
  }

  if (staticClass && evaluatedDynamicClass) {
    return staticClass + ' ' + evaluatedDynamicClass
  }
  return staticClass || evaluatedDynamicClass
}

function resolveOptions(component, _Vue) {
  if (isDynamicComponent(component)) {
    return {}
  }

  if (isConstructor(component)) {
    return component.options
  }
  var options = _Vue.extend(component).options;
  component._Ctor = {};

  return options
}

function getScopedSlotRenderFunctions(ctx) {
  // In Vue 2.6+ a new v-slot syntax was introduced
  // scopedSlots are now saved in parent._vnode.data.scopedSlots
  // We filter out the _normalized and $stable key
  if (
    ctx &&
    ctx.$options &&
    ctx.$options.parent &&
    ctx.$options.parent._vnode &&
    ctx.$options.parent._vnode.data &&
    ctx.$options.parent._vnode.data.scopedSlots
  ) {
    var slotKeys = ctx.$options.parent._vnode.data.scopedSlots;
    return keys(slotKeys).filter(function (x) { return x !== '_normalized' && x !== '$stable'; })
  }

  return []
}

function createStubFromComponent(
  originalComponent,
  name,
  _Vue
) {
  var componentOptions = resolveOptions(originalComponent, _Vue);
  var tagName = (name || 'anonymous') + "-stub";

  // ignoreElements does not exist in Vue 2.0.x
  if (Vue.config.ignoredElements) {
    Vue.config.ignoredElements.push(tagName);
  }

  return Object.assign({}, getCoreProperties(componentOptions),
    {$_vueTestUtils_original: originalComponent,
    $_doNotStubChildren: true,
    render: function render(h, context) {
      var this$1 = this;

      return h(
        tagName,
        {
          ref: componentOptions.functional ? context.data.ref : undefined,
          attrs: componentOptions.functional
            ? Object.assign({}, context.props,
                context.data.attrs,
                {class: createClassString(
                  context.data.staticClass,
                  context.data.class
                )})
            : Object.assign({}, this.$props)
        },
        context
          ? context.children
          : this.$options._renderChildren ||
              getScopedSlotRenderFunctions(this).map(function (x) { return this$1.$options.parent._vnode.data.scopedSlots[x](); }
              )
      )
    }})
}

function createStubFromString(
  templateString,
  originalComponent,
  name,
  _Vue
) {
  if ( originalComponent === void 0 ) originalComponent = {};

  if (templateContainsComponent(templateString, name)) {
    throwError('options.stub cannot contain a circular reference');
  }
  var componentOptions = resolveOptions(originalComponent, _Vue);

  return Object.assign({}, getCoreProperties(componentOptions),
    {$_doNotStubChildren: true},
    compileFromString(templateString))
}

function validateStub(stub) {
  if (!isValidStub(stub)) {
    throwError("options.stub values must be passed a string or " + "component");
  }
}

function createStubsFromStubsObject(
  originalComponents,
  stubs,
  _Vue
) {
  if ( originalComponents === void 0 ) originalComponents = {};

  return Object.keys(stubs || {}).reduce(function (acc, stubName) {
    var stub = stubs[stubName];

    validateStub(stub);

    if (stub === false) {
      return acc
    }

    if (stub === true) {
      var component = resolveComponent$1(originalComponents, stubName);
      acc[stubName] = createStubFromComponent(component, stubName, _Vue);
      return acc
    }

    if (typeof stub === 'string') {
      var component$1 = resolveComponent$1(originalComponents, stubName);
      acc[stubName] = createStubFromString(stub, component$1, stubName, _Vue);
      return acc
    }

    if (componentNeedsCompiling(stub)) {
      compileTemplate(stub);
    }

    acc[stubName] = stub;
    stub._Ctor = {};

    return acc
  }, {})
}

var isWhitelisted = function (el, whitelist) { return resolveComponent(el, whitelist); };
var isAlreadyStubbed = function (el, stubs) { return stubs.has(el); };

function shouldExtend(component, _Vue) {
  return isConstructor(component) || (component && component.extends)
}

function extend(component, _Vue) {
  var componentOptions = component.options ? component.options : component;
  var stub = _Vue.extend(componentOptions);
  componentOptions._Ctor = {};
  stub.options.$_vueTestUtils_original = component;
  stub.options._base = _Vue;
  return stub
}

function createStubIfNeeded(shouldStub, component, _Vue, el) {
  if (shouldStub) {
    return createStubFromComponent(component || {}, el, _Vue)
  }

  if (shouldExtend(component)) {
    return extend(component, _Vue)
  }
}

function shouldNotBeStubbed(el, whitelist, modifiedComponents) {
  return (
    (typeof el === 'string' && isReservedTag(el)) ||
    isWhitelisted(el, whitelist) ||
    isAlreadyStubbed(el, modifiedComponents)
  )
}

function patchCreateElement(_Vue, stubs, stubAllComponents) {
  var obj;

  // This mixin patches vm.$createElement so that we can stub all components
  // before they are rendered in shallow mode. We also need to ensure that
  // component constructors were created from the _Vue constructor. If not,
  // we must replace them with components created from the _Vue constructor
  // before calling the original $createElement. This ensures that components
  // have the correct instance properties and stubs when they are rendered.
  function patchCreateElementMixin() {
    var vm = this;

    if (vm.$options.$_doNotStubChildren || vm.$options._isFunctionalContainer) {
      return
    }

    var modifiedComponents = new Set();
    var originalCreateElement = vm.$createElement;
    var originalComponents = vm.$options.components;

    var createElement = function (el) {
      var obj;

      var args = [], len = arguments.length - 1;
      while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];
      if (shouldNotBeStubbed(el, stubs, modifiedComponents)) {
        return originalCreateElement.apply(void 0, [ el ].concat( args ))
      }

      if (isConstructor(el) || isComponentOptions(el)) {
        if (stubAllComponents) {
          var stub = createStubFromComponent(el, el.name || 'anonymous', _Vue);
          return originalCreateElement.apply(void 0, [ stub ].concat( args ))
        }
        var Constructor = shouldExtend(el) ? extend(el, _Vue) : el;

        return originalCreateElement.apply(void 0, [ Constructor ].concat( args ))
      }

      if (typeof el === 'string') {
        var original = resolveComponent(el, originalComponents);

        if (!original) {
          return originalCreateElement.apply(void 0, [ el ].concat( args ))
        }

        if (isDynamicComponent(original)) {
          return originalCreateElement.apply(void 0, [ el ].concat( args ))
        }

        var stub$1 = createStubIfNeeded(stubAllComponents, original, _Vue, el);

        if (stub$1) {
          Object.assign(vm.$options.components, ( obj = {}, obj[el] = stub$1, obj ));
          modifiedComponents.add(el);
        }
      }

      return originalCreateElement.apply(void 0, [ el ].concat( args ))
    };

    vm[CREATE_ELEMENT_ALIAS] = createElement;
    vm.$createElement = createElement;
  }

  _Vue.mixin(( obj = {}, obj[BEFORE_RENDER_LIFECYCLE_HOOK] = patchCreateElementMixin, obj ));
}

// 

function createContext(options, scopedSlots) {
  var on = Object.assign({}, (options.context && options.context.on),
    options.listeners);
  return Object.assign({}, {attrs: Object.assign({}, options.attrs,
      // pass as attrs so that inheritAttrs works correctly
      // propsData should take precedence over attrs
      options.propsData)},
    (options.context || {}),
    {on: on,
    scopedSlots: scopedSlots})
}

function createChildren(vm, h, ref) {
  var slots = ref.slots;
  var context = ref.context;

  var slotVNodes = slots ? createSlotVNodes(vm, slots) : undefined;
  return (
    (context &&
      context.children &&
      context.children.map(function (x) { return (typeof x === 'function' ? x(h) : x); })) ||
    slotVNodes
  )
}

function createInstance(
  component,
  options,
  _Vue
) {
  var componentOptions = isConstructor(component)
    ? component.options
    : component;

  // instance options are options that are passed to the
  // root instance when it's instantiated
  var instanceOptions = extractInstanceOptions(options);

  var globalComponents = _Vue.options.components || {};
  var componentsToStub = Object.assign(
    Object.create(globalComponents),
    componentOptions.components
  );

  var stubComponentsObject = createStubsFromStubsObject(
    componentsToStub,
    // $FlowIgnore
    options.stubs,
    _Vue
  );

  addEventLogger(_Vue);
  addMocks(_Vue, options.mocks);
  addStubs(_Vue, stubComponentsObject);
  patchCreateElement(_Vue, stubComponentsObject, options.shouldProxy);

  if (componentNeedsCompiling(componentOptions)) {
    compileTemplate(componentOptions);
  }

  // used to identify extended component using constructor
  componentOptions.$_vueTestUtils_original = component;

  // watchers provided in mounting options should override preexisting ones
  if (componentOptions.watch && instanceOptions.watch) {
    var componentWatchers = Object.keys(componentOptions.watch);
    var instanceWatchers = Object.keys(instanceOptions.watch);

    for (var i = 0; i < instanceWatchers.length; i++) {
      var k = instanceWatchers[i];
      // override the componentOptions with the one provided in mounting options
      if (componentWatchers.includes(k)) {
        componentOptions.watch[k] = instanceOptions.watch[k];
      }
    }
  }

  // make sure all extends are based on this instance
  var Constructor = _Vue.extend(componentOptions).extend(instanceOptions);
  componentOptions._Ctor = {};
  Constructor.options._base = _Vue;

  var scopedSlots = createScopedSlots(options.scopedSlots, _Vue);

  var parentComponentOptions = options.parentComponent || {};

  parentComponentOptions.provide = options.provide;
  parentComponentOptions._provided = options.provide;
  parentComponentOptions.$_doNotStubChildren = true;
  parentComponentOptions._isFunctionalContainer = componentOptions.functional;
  parentComponentOptions.render = function(h) {
    return h(
      Constructor,
      createContext(options, scopedSlots),
      createChildren(this, h, options)
    )
  };
  var Parent = _Vue.extend(parentComponentOptions);

  return new Parent()
}

function normalizeStubs(stubs) {
  if ( stubs === void 0 ) stubs = {};

  if (stubs === false) {
    return false
  }
  if (isPlainObject(stubs)) {
    return stubs
  }
  if (Array.isArray(stubs)) {
    return stubs.reduce(function (acc, stub) {
      if (typeof stub !== 'string') {
        throwError('each item in an options.stubs array must be a string');
      }
      acc[stub] = true;
      return acc
    }, {})
  }
  throwError('options.stubs must be an object or an Array');
}

function normalizeProvide(provide) {
  // Objects are not resolved in extended components in Vue < 2.5
  // https://github.com/vuejs/vue/issues/6436
  if (typeof provide === 'object' && VUE_VERSION < 2.5) {
    var obj = Object.assign({}, provide);
    return function () { return obj; }
  }
  return provide
}

// 

function getOption(option, config) {
  if (option === false) {
    return false
  }
  if (option || (config && Object.keys(config).length > 0)) {
    if (option instanceof Function) {
      return option
    }
    if (config instanceof Function) {
      throw new Error("Config can't be a Function.")
    }
    return Object.assign({}, config,
      option)
  }
}

function getStubs(stubs, configStubs) {
  var normalizedStubs = normalizeStubs(stubs);
  var normalizedConfigStubs = normalizeStubs(configStubs);
  return getOption(normalizedStubs, normalizedConfigStubs)
}

function mergeOptions(
  options,
  config
) {
  var mocks = (getOption(options.mocks, config.mocks));
  var methods = (getOption(options.methods, config.methods));
  var provide = (getOption(options.provide, config.provide));
  var stubs = (getStubs(options.stubs, config.stubs));
  // $FlowIgnore
  return Object.assign({}, options,
    {provide: normalizeProvide(provide),
    stubs: stubs,
    mocks: mocks,
    methods: methods})
}

var config = testUtils.config;

// 

function isValidSlot(slot) {
  return isVueComponent(slot) || typeof slot === 'string'
}

function requiresTemplateCompiler(slot) {
  if (typeof slot === 'string' && !vueTemplateCompiler.compileToFunctions) {
    throwError(
      "vueTemplateCompiler is undefined, you must pass " +
        "precompiled components if vue-template-compiler is " +
        "undefined"
    );
  }
}

function validateSlots(slots) {
  Object.keys(slots).forEach(function (key) {
    var slot = Array.isArray(slots[key]) ? slots[key] : [slots[key]];

    slot.forEach(function (slotValue) {
      if (!isValidSlot(slotValue)) {
        throwError(
          "slots[key] must be a Component, string or an array " +
            "of Components"
        );
      }
      requiresTemplateCompiler(slotValue);
    });
  });
}

function vueExtendUnsupportedOption(option) {
  return (
    "options." + option + " is not supported for " +
    "components created with Vue.extend in Vue < 2.3. " +
    "You can set " + option + " to false to mount the component."
  )
}
// these options aren't supported if Vue is version < 2.3
// for components using Vue.extend. This is due to a bug
// that means the mixins we use to add properties are not applied
// correctly
var UNSUPPORTED_VERSION_OPTIONS = ['mocks', 'stubs', 'localVue'];

function validateOptions(options, component) {
  if (options.parentComponent && !isPlainObject(options.parentComponent)) {
    throwError(
      "options.parentComponent should be a valid Vue component options object"
    );
  }

  if (!isFunctionalComponent(component) && options.context) {
    throwError(
      "mount.context can only be used when mounting a functional component"
    );
  }

  if (options.context && !isPlainObject(options.context)) {
    throwError('mount.context must be an object');
  }

  if (VUE_VERSION < 2.3 && isConstructor(component)) {
    UNSUPPORTED_VERSION_OPTIONS.forEach(function (option) {
      if (options[option]) {
        throwError(vueExtendUnsupportedOption(option));
      }
    });
  }

  if (options.slots) {
    compileTemplateForSlots(options.slots);
    // validate slots outside of the createSlots function so
    // that we can throw an error without it being caught by
    // the Vue error handler
    // $FlowIgnore
    validateSlots(options.slots);
  }
}

// 

Vue.config.productionTip = false;
Vue.config.devtools = false;

function renderToString(
  component,
  options
) {
  if ( options === void 0 ) options = {};

  var renderer = vueServerRenderer.createRenderer();

  if (!renderer) {
    throwError(
      "renderToString must be run in node. It cannot be run in a browser"
    );
  }

  if (options.attachToDocument) {
    throwError("you cannot use attachToDocument with renderToString");
  }

  var mergedOptions = mergeOptions(options, config);
  validateOptions(mergedOptions, component);

  var vm = createInstance(
    component,
    mergedOptions,
    testUtils__default.createLocalVue(options.localVue)
  );

  return renderer.renderToString(vm)
}

// 

function render(
  component,
  options
) {
  if ( options === void 0 ) options = {};

  return renderToString(component, options).then(function (str) { return cheerio.load('')(str); })
}

exports.config = config;
exports.render = render;
exports.renderToString = renderToString;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidnVlLXNlcnZlci10ZXN0LXV0aWxzLmpzIiwic291cmNlcyI6WyIuLi8uLi9jcmVhdGUtaW5zdGFuY2UvY3JlYXRlLXNsb3Qtdm5vZGVzLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3NlbXZlci9zZW12ZXIuanMiLCIuLi8uLi9zaGFyZWQvdXRpbC5qcyIsIi4uLy4uL2NyZWF0ZS1pbnN0YW5jZS9hZGQtbW9ja3MuanMiLCIuLi8uLi9jcmVhdGUtaW5zdGFuY2UvbG9nLWV2ZW50cy5qcyIsIi4uLy4uL3NoYXJlZC9jb25zdHMuanMiLCIuLi8uLi9jcmVhdGUtaW5zdGFuY2UvYWRkLXN0dWJzLmpzIiwiLi4vLi4vc2hhcmVkL3ZhbGlkYXRvcnMuanMiLCIuLi8uLi9zaGFyZWQvY29tcGlsZS10ZW1wbGF0ZS5qcyIsIi4uLy4uL2NyZWF0ZS1pbnN0YW5jZS9leHRyYWN0LWluc3RhbmNlLW9wdGlvbnMuanMiLCIuLi8uLi9jcmVhdGUtaW5zdGFuY2UvY3JlYXRlLXNjb3BlZC1zbG90cy5qcyIsIi4uLy4uL2NyZWF0ZS1pbnN0YW5jZS9jcmVhdGUtY29tcG9uZW50LXN0dWJzLmpzIiwiLi4vLi4vY3JlYXRlLWluc3RhbmNlL3BhdGNoLWNyZWF0ZS1lbGVtZW50LmpzIiwiLi4vLi4vY3JlYXRlLWluc3RhbmNlL2NyZWF0ZS1pbnN0YW5jZS5qcyIsIi4uLy4uL3NoYXJlZC9ub3JtYWxpemUuanMiLCIuLi8uLi9zaGFyZWQvbWVyZ2Utb3B0aW9ucy5qcyIsIi4uL3NyYy9jb25maWcuanMiLCIuLi8uLi9zaGFyZWQvdmFsaWRhdGUtc2xvdHMuanMiLCIuLi8uLi9zaGFyZWQvdmFsaWRhdGUtb3B0aW9ucy5qcyIsIi4uL3NyYy9yZW5kZXJUb1N0cmluZy5qcyIsIi4uL3NyYy9yZW5kZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQGZsb3dcblxuaW1wb3J0IHsgY29tcGlsZVRvRnVuY3Rpb25zIH0gZnJvbSAndnVlLXRlbXBsYXRlLWNvbXBpbGVyJ1xuXG5mdW5jdGlvbiBjcmVhdGVWTm9kZXModm06IENvbXBvbmVudCwgc2xvdFZhbHVlOiBzdHJpbmcsIG5hbWUpOiBBcnJheTxWTm9kZT4ge1xuICBjb25zdCBlbCA9IGNvbXBpbGVUb0Z1bmN0aW9ucyhcbiAgICBgPGRpdj48dGVtcGxhdGUgc2xvdD0ke25hbWV9PiR7c2xvdFZhbHVlfTwvdGVtcGxhdGU+PC9kaXY+YFxuICApXG4gIGNvbnN0IF9zdGF0aWNSZW5kZXJGbnMgPSB2bS5fcmVuZGVyUHJveHkuJG9wdGlvbnMuc3RhdGljUmVuZGVyRm5zXG4gIGNvbnN0IF9zdGF0aWNUcmVlcyA9IHZtLl9yZW5kZXJQcm94eS5fc3RhdGljVHJlZXNcbiAgdm0uX3JlbmRlclByb3h5Ll9zdGF0aWNUcmVlcyA9IFtdXG4gIHZtLl9yZW5kZXJQcm94eS4kb3B0aW9ucy5zdGF0aWNSZW5kZXJGbnMgPSBlbC5zdGF0aWNSZW5kZXJGbnNcbiAgY29uc3Qgdm5vZGUgPSBlbC5yZW5kZXIuY2FsbCh2bS5fcmVuZGVyUHJveHksIHZtLiRjcmVhdGVFbGVtZW50KVxuICB2bS5fcmVuZGVyUHJveHkuJG9wdGlvbnMuc3RhdGljUmVuZGVyRm5zID0gX3N0YXRpY1JlbmRlckZuc1xuICB2bS5fcmVuZGVyUHJveHkuX3N0YXRpY1RyZWVzID0gX3N0YXRpY1RyZWVzXG4gIHJldHVybiB2bm9kZS5jaGlsZHJlblswXVxufVxuXG5mdW5jdGlvbiBjcmVhdGVWTm9kZXNGb3JTbG90KFxuICB2bTogQ29tcG9uZW50LFxuICBzbG90VmFsdWU6IFNsb3RWYWx1ZSxcbiAgbmFtZTogc3RyaW5nXG4pOiBWTm9kZSB8IEFycmF5PFZOb2RlPiB7XG4gIGlmICh0eXBlb2Ygc2xvdFZhbHVlID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBjcmVhdGVWTm9kZXModm0sIHNsb3RWYWx1ZSwgbmFtZSlcbiAgfVxuICBjb25zdCB2bm9kZSA9IHZtLiRjcmVhdGVFbGVtZW50KHNsb3RWYWx1ZSlcbiAgOyh2bm9kZS5kYXRhIHx8ICh2bm9kZS5kYXRhID0ge30pKS5zbG90ID0gbmFtZVxuICByZXR1cm4gdm5vZGVcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVNsb3RWTm9kZXMoXG4gIHZtOiBDb21wb25lbnQsXG4gIHNsb3RzOiBTbG90c09iamVjdFxuKTogQXJyYXk8Vk5vZGUgfCBBcnJheTxWTm9kZT4+IHtcbiAgcmV0dXJuIE9iamVjdC5rZXlzKHNsb3RzKS5yZWR1Y2UoKGFjYywga2V5KSA9PiB7XG4gICAgY29uc3QgY29udGVudCA9IHNsb3RzW2tleV1cbiAgICBpZiAoQXJyYXkuaXNBcnJheShjb250ZW50KSkge1xuICAgICAgY29uc3Qgbm9kZXMgPSBjb250ZW50Lm1hcChzbG90RGVmID0+XG4gICAgICAgIGNyZWF0ZVZOb2Rlc0ZvclNsb3Qodm0sIHNsb3REZWYsIGtleSlcbiAgICAgIClcbiAgICAgIHJldHVybiBhY2MuY29uY2F0KG5vZGVzKVxuICAgIH1cblxuICAgIHJldHVybiBhY2MuY29uY2F0KGNyZWF0ZVZOb2Rlc0ZvclNsb3Qodm0sIGNvbnRlbnQsIGtleSkpXG4gIH0sIFtdKVxufVxuIiwiZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gU2VtVmVyXG5cbnZhciBkZWJ1Z1xuLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbmlmICh0eXBlb2YgcHJvY2VzcyA9PT0gJ29iamVjdCcgJiZcbiAgICBwcm9jZXNzLmVudiAmJlxuICAgIHByb2Nlc3MuZW52Lk5PREVfREVCVUcgJiZcbiAgICAvXFxic2VtdmVyXFxiL2kudGVzdChwcm9jZXNzLmVudi5OT0RFX0RFQlVHKSkge1xuICBkZWJ1ZyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMClcbiAgICBhcmdzLnVuc2hpZnQoJ1NFTVZFUicpXG4gICAgY29uc29sZS5sb2cuYXBwbHkoY29uc29sZSwgYXJncylcbiAgfVxufSBlbHNlIHtcbiAgZGVidWcgPSBmdW5jdGlvbiAoKSB7fVxufVxuXG4vLyBOb3RlOiB0aGlzIGlzIHRoZSBzZW12ZXIub3JnIHZlcnNpb24gb2YgdGhlIHNwZWMgdGhhdCBpdCBpbXBsZW1lbnRzXG4vLyBOb3QgbmVjZXNzYXJpbHkgdGhlIHBhY2thZ2UgdmVyc2lvbiBvZiB0aGlzIGNvZGUuXG5leHBvcnRzLlNFTVZFUl9TUEVDX1ZFUlNJT04gPSAnMi4wLjAnXG5cbnZhciBNQVhfTEVOR1RIID0gMjU2XG52YXIgTUFYX1NBRkVfSU5URUdFUiA9IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSIHx8XG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovIDkwMDcxOTkyNTQ3NDA5OTFcblxuLy8gTWF4IHNhZmUgc2VnbWVudCBsZW5ndGggZm9yIGNvZXJjaW9uLlxudmFyIE1BWF9TQUZFX0NPTVBPTkVOVF9MRU5HVEggPSAxNlxuXG4vLyBUaGUgYWN0dWFsIHJlZ2V4cHMgZ28gb24gZXhwb3J0cy5yZVxudmFyIHJlID0gZXhwb3J0cy5yZSA9IFtdXG52YXIgc3JjID0gZXhwb3J0cy5zcmMgPSBbXVxudmFyIHQgPSBleHBvcnRzLnRva2VucyA9IHt9XG52YXIgUiA9IDBcblxuZnVuY3Rpb24gdG9rIChuKSB7XG4gIHRbbl0gPSBSKytcbn1cblxuLy8gVGhlIGZvbGxvd2luZyBSZWd1bGFyIEV4cHJlc3Npb25zIGNhbiBiZSB1c2VkIGZvciB0b2tlbml6aW5nLFxuLy8gdmFsaWRhdGluZywgYW5kIHBhcnNpbmcgU2VtVmVyIHZlcnNpb24gc3RyaW5ncy5cblxuLy8gIyMgTnVtZXJpYyBJZGVudGlmaWVyXG4vLyBBIHNpbmdsZSBgMGAsIG9yIGEgbm9uLXplcm8gZGlnaXQgZm9sbG93ZWQgYnkgemVybyBvciBtb3JlIGRpZ2l0cy5cblxudG9rKCdOVU1FUklDSURFTlRJRklFUicpXG5zcmNbdC5OVU1FUklDSURFTlRJRklFUl0gPSAnMHxbMS05XVxcXFxkKidcbnRvaygnTlVNRVJJQ0lERU5USUZJRVJMT09TRScpXG5zcmNbdC5OVU1FUklDSURFTlRJRklFUkxPT1NFXSA9ICdbMC05XSsnXG5cbi8vICMjIE5vbi1udW1lcmljIElkZW50aWZpZXJcbi8vIFplcm8gb3IgbW9yZSBkaWdpdHMsIGZvbGxvd2VkIGJ5IGEgbGV0dGVyIG9yIGh5cGhlbiwgYW5kIHRoZW4gemVybyBvclxuLy8gbW9yZSBsZXR0ZXJzLCBkaWdpdHMsIG9yIGh5cGhlbnMuXG5cbnRvaygnTk9OTlVNRVJJQ0lERU5USUZJRVInKVxuc3JjW3QuTk9OTlVNRVJJQ0lERU5USUZJRVJdID0gJ1xcXFxkKlthLXpBLVotXVthLXpBLVowLTktXSonXG5cbi8vICMjIE1haW4gVmVyc2lvblxuLy8gVGhyZWUgZG90LXNlcGFyYXRlZCBudW1lcmljIGlkZW50aWZpZXJzLlxuXG50b2soJ01BSU5WRVJTSU9OJylcbnNyY1t0Lk1BSU5WRVJTSU9OXSA9ICcoJyArIHNyY1t0Lk5VTUVSSUNJREVOVElGSUVSXSArICcpXFxcXC4nICtcbiAgICAgICAgICAgICAgICAgICAnKCcgKyBzcmNbdC5OVU1FUklDSURFTlRJRklFUl0gKyAnKVxcXFwuJyArXG4gICAgICAgICAgICAgICAgICAgJygnICsgc3JjW3QuTlVNRVJJQ0lERU5USUZJRVJdICsgJyknXG5cbnRvaygnTUFJTlZFUlNJT05MT09TRScpXG5zcmNbdC5NQUlOVkVSU0lPTkxPT1NFXSA9ICcoJyArIHNyY1t0Lk5VTUVSSUNJREVOVElGSUVSTE9PU0VdICsgJylcXFxcLicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJygnICsgc3JjW3QuTlVNRVJJQ0lERU5USUZJRVJMT09TRV0gKyAnKVxcXFwuJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnKCcgKyBzcmNbdC5OVU1FUklDSURFTlRJRklFUkxPT1NFXSArICcpJ1xuXG4vLyAjIyBQcmUtcmVsZWFzZSBWZXJzaW9uIElkZW50aWZpZXJcbi8vIEEgbnVtZXJpYyBpZGVudGlmaWVyLCBvciBhIG5vbi1udW1lcmljIGlkZW50aWZpZXIuXG5cbnRvaygnUFJFUkVMRUFTRUlERU5USUZJRVInKVxuc3JjW3QuUFJFUkVMRUFTRUlERU5USUZJRVJdID0gJyg/OicgKyBzcmNbdC5OVU1FUklDSURFTlRJRklFUl0gK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICd8JyArIHNyY1t0Lk5PTk5VTUVSSUNJREVOVElGSUVSXSArICcpJ1xuXG50b2soJ1BSRVJFTEVBU0VJREVOVElGSUVSTE9PU0UnKVxuc3JjW3QuUFJFUkVMRUFTRUlERU5USUZJRVJMT09TRV0gPSAnKD86JyArIHNyY1t0Lk5VTUVSSUNJREVOVElGSUVSTE9PU0VdICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICd8JyArIHNyY1t0Lk5PTk5VTUVSSUNJREVOVElGSUVSXSArICcpJ1xuXG4vLyAjIyBQcmUtcmVsZWFzZSBWZXJzaW9uXG4vLyBIeXBoZW4sIGZvbGxvd2VkIGJ5IG9uZSBvciBtb3JlIGRvdC1zZXBhcmF0ZWQgcHJlLXJlbGVhc2UgdmVyc2lvblxuLy8gaWRlbnRpZmllcnMuXG5cbnRvaygnUFJFUkVMRUFTRScpXG5zcmNbdC5QUkVSRUxFQVNFXSA9ICcoPzotKCcgKyBzcmNbdC5QUkVSRUxFQVNFSURFTlRJRklFUl0gK1xuICAgICAgICAgICAgICAgICAgJyg/OlxcXFwuJyArIHNyY1t0LlBSRVJFTEVBU0VJREVOVElGSUVSXSArICcpKikpJ1xuXG50b2soJ1BSRVJFTEVBU0VMT09TRScpXG5zcmNbdC5QUkVSRUxFQVNFTE9PU0VdID0gJyg/Oi0/KCcgKyBzcmNbdC5QUkVSRUxFQVNFSURFTlRJRklFUkxPT1NFXSArXG4gICAgICAgICAgICAgICAgICAgICAgICcoPzpcXFxcLicgKyBzcmNbdC5QUkVSRUxFQVNFSURFTlRJRklFUkxPT1NFXSArICcpKikpJ1xuXG4vLyAjIyBCdWlsZCBNZXRhZGF0YSBJZGVudGlmaWVyXG4vLyBBbnkgY29tYmluYXRpb24gb2YgZGlnaXRzLCBsZXR0ZXJzLCBvciBoeXBoZW5zLlxuXG50b2soJ0JVSUxESURFTlRJRklFUicpXG5zcmNbdC5CVUlMRElERU5USUZJRVJdID0gJ1swLTlBLVphLXotXSsnXG5cbi8vICMjIEJ1aWxkIE1ldGFkYXRhXG4vLyBQbHVzIHNpZ24sIGZvbGxvd2VkIGJ5IG9uZSBvciBtb3JlIHBlcmlvZC1zZXBhcmF0ZWQgYnVpbGQgbWV0YWRhdGFcbi8vIGlkZW50aWZpZXJzLlxuXG50b2soJ0JVSUxEJylcbnNyY1t0LkJVSUxEXSA9ICcoPzpcXFxcKygnICsgc3JjW3QuQlVJTERJREVOVElGSUVSXSArXG4gICAgICAgICAgICAgJyg/OlxcXFwuJyArIHNyY1t0LkJVSUxESURFTlRJRklFUl0gKyAnKSopKSdcblxuLy8gIyMgRnVsbCBWZXJzaW9uIFN0cmluZ1xuLy8gQSBtYWluIHZlcnNpb24sIGZvbGxvd2VkIG9wdGlvbmFsbHkgYnkgYSBwcmUtcmVsZWFzZSB2ZXJzaW9uIGFuZFxuLy8gYnVpbGQgbWV0YWRhdGEuXG5cbi8vIE5vdGUgdGhhdCB0aGUgb25seSBtYWpvciwgbWlub3IsIHBhdGNoLCBhbmQgcHJlLXJlbGVhc2Ugc2VjdGlvbnMgb2Zcbi8vIHRoZSB2ZXJzaW9uIHN0cmluZyBhcmUgY2FwdHVyaW5nIGdyb3Vwcy4gIFRoZSBidWlsZCBtZXRhZGF0YSBpcyBub3QgYVxuLy8gY2FwdHVyaW5nIGdyb3VwLCBiZWNhdXNlIGl0IHNob3VsZCBub3QgZXZlciBiZSB1c2VkIGluIHZlcnNpb25cbi8vIGNvbXBhcmlzb24uXG5cbnRvaygnRlVMTCcpXG50b2soJ0ZVTExQTEFJTicpXG5zcmNbdC5GVUxMUExBSU5dID0gJ3Y/JyArIHNyY1t0Lk1BSU5WRVJTSU9OXSArXG4gICAgICAgICAgICAgICAgICBzcmNbdC5QUkVSRUxFQVNFXSArICc/JyArXG4gICAgICAgICAgICAgICAgICBzcmNbdC5CVUlMRF0gKyAnPydcblxuc3JjW3QuRlVMTF0gPSAnXicgKyBzcmNbdC5GVUxMUExBSU5dICsgJyQnXG5cbi8vIGxpa2UgZnVsbCwgYnV0IGFsbG93cyB2MS4yLjMgYW5kID0xLjIuMywgd2hpY2ggcGVvcGxlIGRvIHNvbWV0aW1lcy5cbi8vIGFsc28sIDEuMC4wYWxwaGExIChwcmVyZWxlYXNlIHdpdGhvdXQgdGhlIGh5cGhlbikgd2hpY2ggaXMgcHJldHR5XG4vLyBjb21tb24gaW4gdGhlIG5wbSByZWdpc3RyeS5cbnRvaygnTE9PU0VQTEFJTicpXG5zcmNbdC5MT09TRVBMQUlOXSA9ICdbdj1cXFxcc10qJyArIHNyY1t0Lk1BSU5WRVJTSU9OTE9PU0VdICtcbiAgICAgICAgICAgICAgICAgIHNyY1t0LlBSRVJFTEVBU0VMT09TRV0gKyAnPycgK1xuICAgICAgICAgICAgICAgICAgc3JjW3QuQlVJTERdICsgJz8nXG5cbnRvaygnTE9PU0UnKVxuc3JjW3QuTE9PU0VdID0gJ14nICsgc3JjW3QuTE9PU0VQTEFJTl0gKyAnJCdcblxudG9rKCdHVExUJylcbnNyY1t0LkdUTFRdID0gJygoPzo8fD4pPz0/KSdcblxuLy8gU29tZXRoaW5nIGxpa2UgXCIyLipcIiBvciBcIjEuMi54XCIuXG4vLyBOb3RlIHRoYXQgXCJ4LnhcIiBpcyBhIHZhbGlkIHhSYW5nZSBpZGVudGlmZXIsIG1lYW5pbmcgXCJhbnkgdmVyc2lvblwiXG4vLyBPbmx5IHRoZSBmaXJzdCBpdGVtIGlzIHN0cmljdGx5IHJlcXVpcmVkLlxudG9rKCdYUkFOR0VJREVOVElGSUVSTE9PU0UnKVxuc3JjW3QuWFJBTkdFSURFTlRJRklFUkxPT1NFXSA9IHNyY1t0Lk5VTUVSSUNJREVOVElGSUVSTE9PU0VdICsgJ3x4fFh8XFxcXConXG50b2soJ1hSQU5HRUlERU5USUZJRVInKVxuc3JjW3QuWFJBTkdFSURFTlRJRklFUl0gPSBzcmNbdC5OVU1FUklDSURFTlRJRklFUl0gKyAnfHh8WHxcXFxcKidcblxudG9rKCdYUkFOR0VQTEFJTicpXG5zcmNbdC5YUkFOR0VQTEFJTl0gPSAnW3Y9XFxcXHNdKignICsgc3JjW3QuWFJBTkdFSURFTlRJRklFUl0gKyAnKScgK1xuICAgICAgICAgICAgICAgICAgICcoPzpcXFxcLignICsgc3JjW3QuWFJBTkdFSURFTlRJRklFUl0gKyAnKScgK1xuICAgICAgICAgICAgICAgICAgICcoPzpcXFxcLignICsgc3JjW3QuWFJBTkdFSURFTlRJRklFUl0gKyAnKScgK1xuICAgICAgICAgICAgICAgICAgICcoPzonICsgc3JjW3QuUFJFUkVMRUFTRV0gKyAnKT8nICtcbiAgICAgICAgICAgICAgICAgICBzcmNbdC5CVUlMRF0gKyAnPycgK1xuICAgICAgICAgICAgICAgICAgICcpPyk/J1xuXG50b2soJ1hSQU5HRVBMQUlOTE9PU0UnKVxuc3JjW3QuWFJBTkdFUExBSU5MT09TRV0gPSAnW3Y9XFxcXHNdKignICsgc3JjW3QuWFJBTkdFSURFTlRJRklFUkxPT1NFXSArICcpJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnKD86XFxcXC4oJyArIHNyY1t0LlhSQU5HRUlERU5USUZJRVJMT09TRV0gKyAnKScgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJyg/OlxcXFwuKCcgKyBzcmNbdC5YUkFOR0VJREVOVElGSUVSTE9PU0VdICsgJyknICtcbiAgICAgICAgICAgICAgICAgICAgICAgICcoPzonICsgc3JjW3QuUFJFUkVMRUFTRUxPT1NFXSArICcpPycgK1xuICAgICAgICAgICAgICAgICAgICAgICAgc3JjW3QuQlVJTERdICsgJz8nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICcpPyk/J1xuXG50b2soJ1hSQU5HRScpXG5zcmNbdC5YUkFOR0VdID0gJ14nICsgc3JjW3QuR1RMVF0gKyAnXFxcXHMqJyArIHNyY1t0LlhSQU5HRVBMQUlOXSArICckJ1xudG9rKCdYUkFOR0VMT09TRScpXG5zcmNbdC5YUkFOR0VMT09TRV0gPSAnXicgKyBzcmNbdC5HVExUXSArICdcXFxccyonICsgc3JjW3QuWFJBTkdFUExBSU5MT09TRV0gKyAnJCdcblxuLy8gQ29lcmNpb24uXG4vLyBFeHRyYWN0IGFueXRoaW5nIHRoYXQgY291bGQgY29uY2VpdmFibHkgYmUgYSBwYXJ0IG9mIGEgdmFsaWQgc2VtdmVyXG50b2soJ0NPRVJDRScpXG5zcmNbdC5DT0VSQ0VdID0gJyhefFteXFxcXGRdKScgK1xuICAgICAgICAgICAgICAnKFxcXFxkezEsJyArIE1BWF9TQUZFX0NPTVBPTkVOVF9MRU5HVEggKyAnfSknICtcbiAgICAgICAgICAgICAgJyg/OlxcXFwuKFxcXFxkezEsJyArIE1BWF9TQUZFX0NPTVBPTkVOVF9MRU5HVEggKyAnfSkpPycgK1xuICAgICAgICAgICAgICAnKD86XFxcXC4oXFxcXGR7MSwnICsgTUFYX1NBRkVfQ09NUE9ORU5UX0xFTkdUSCArICd9KSk/JyArXG4gICAgICAgICAgICAgICcoPzokfFteXFxcXGRdKSdcbnRvaygnQ09FUkNFUlRMJylcbnJlW3QuQ09FUkNFUlRMXSA9IG5ldyBSZWdFeHAoc3JjW3QuQ09FUkNFXSwgJ2cnKVxuXG4vLyBUaWxkZSByYW5nZXMuXG4vLyBNZWFuaW5nIGlzIFwicmVhc29uYWJseSBhdCBvciBncmVhdGVyIHRoYW5cIlxudG9rKCdMT05FVElMREUnKVxuc3JjW3QuTE9ORVRJTERFXSA9ICcoPzp+Pj8pJ1xuXG50b2soJ1RJTERFVFJJTScpXG5zcmNbdC5USUxERVRSSU1dID0gJyhcXFxccyopJyArIHNyY1t0LkxPTkVUSUxERV0gKyAnXFxcXHMrJ1xucmVbdC5USUxERVRSSU1dID0gbmV3IFJlZ0V4cChzcmNbdC5USUxERVRSSU1dLCAnZycpXG52YXIgdGlsZGVUcmltUmVwbGFjZSA9ICckMX4nXG5cbnRvaygnVElMREUnKVxuc3JjW3QuVElMREVdID0gJ14nICsgc3JjW3QuTE9ORVRJTERFXSArIHNyY1t0LlhSQU5HRVBMQUlOXSArICckJ1xudG9rKCdUSUxERUxPT1NFJylcbnNyY1t0LlRJTERFTE9PU0VdID0gJ14nICsgc3JjW3QuTE9ORVRJTERFXSArIHNyY1t0LlhSQU5HRVBMQUlOTE9PU0VdICsgJyQnXG5cbi8vIENhcmV0IHJhbmdlcy5cbi8vIE1lYW5pbmcgaXMgXCJhdCBsZWFzdCBhbmQgYmFja3dhcmRzIGNvbXBhdGlibGUgd2l0aFwiXG50b2soJ0xPTkVDQVJFVCcpXG5zcmNbdC5MT05FQ0FSRVRdID0gJyg/OlxcXFxeKSdcblxudG9rKCdDQVJFVFRSSU0nKVxuc3JjW3QuQ0FSRVRUUklNXSA9ICcoXFxcXHMqKScgKyBzcmNbdC5MT05FQ0FSRVRdICsgJ1xcXFxzKydcbnJlW3QuQ0FSRVRUUklNXSA9IG5ldyBSZWdFeHAoc3JjW3QuQ0FSRVRUUklNXSwgJ2cnKVxudmFyIGNhcmV0VHJpbVJlcGxhY2UgPSAnJDFeJ1xuXG50b2soJ0NBUkVUJylcbnNyY1t0LkNBUkVUXSA9ICdeJyArIHNyY1t0LkxPTkVDQVJFVF0gKyBzcmNbdC5YUkFOR0VQTEFJTl0gKyAnJCdcbnRvaygnQ0FSRVRMT09TRScpXG5zcmNbdC5DQVJFVExPT1NFXSA9ICdeJyArIHNyY1t0LkxPTkVDQVJFVF0gKyBzcmNbdC5YUkFOR0VQTEFJTkxPT1NFXSArICckJ1xuXG4vLyBBIHNpbXBsZSBndC9sdC9lcSB0aGluZywgb3IganVzdCBcIlwiIHRvIGluZGljYXRlIFwiYW55IHZlcnNpb25cIlxudG9rKCdDT01QQVJBVE9STE9PU0UnKVxuc3JjW3QuQ09NUEFSQVRPUkxPT1NFXSA9ICdeJyArIHNyY1t0LkdUTFRdICsgJ1xcXFxzKignICsgc3JjW3QuTE9PU0VQTEFJTl0gKyAnKSR8XiQnXG50b2soJ0NPTVBBUkFUT1InKVxuc3JjW3QuQ09NUEFSQVRPUl0gPSAnXicgKyBzcmNbdC5HVExUXSArICdcXFxccyooJyArIHNyY1t0LkZVTExQTEFJTl0gKyAnKSR8XiQnXG5cbi8vIEFuIGV4cHJlc3Npb24gdG8gc3RyaXAgYW55IHdoaXRlc3BhY2UgYmV0d2VlbiB0aGUgZ3RsdCBhbmQgdGhlIHRoaW5nXG4vLyBpdCBtb2RpZmllcywgc28gdGhhdCBgPiAxLjIuM2AgPT0+IGA+MS4yLjNgXG50b2soJ0NPTVBBUkFUT1JUUklNJylcbnNyY1t0LkNPTVBBUkFUT1JUUklNXSA9ICcoXFxcXHMqKScgKyBzcmNbdC5HVExUXSArXG4gICAgICAgICAgICAgICAgICAgICAgJ1xcXFxzKignICsgc3JjW3QuTE9PU0VQTEFJTl0gKyAnfCcgKyBzcmNbdC5YUkFOR0VQTEFJTl0gKyAnKSdcblxuLy8gdGhpcyBvbmUgaGFzIHRvIHVzZSB0aGUgL2cgZmxhZ1xucmVbdC5DT01QQVJBVE9SVFJJTV0gPSBuZXcgUmVnRXhwKHNyY1t0LkNPTVBBUkFUT1JUUklNXSwgJ2cnKVxudmFyIGNvbXBhcmF0b3JUcmltUmVwbGFjZSA9ICckMSQyJDMnXG5cbi8vIFNvbWV0aGluZyBsaWtlIGAxLjIuMyAtIDEuMi40YFxuLy8gTm90ZSB0aGF0IHRoZXNlIGFsbCB1c2UgdGhlIGxvb3NlIGZvcm0sIGJlY2F1c2UgdGhleSdsbCBiZVxuLy8gY2hlY2tlZCBhZ2FpbnN0IGVpdGhlciB0aGUgc3RyaWN0IG9yIGxvb3NlIGNvbXBhcmF0b3IgZm9ybVxuLy8gbGF0ZXIuXG50b2soJ0hZUEhFTlJBTkdFJylcbnNyY1t0LkhZUEhFTlJBTkdFXSA9ICdeXFxcXHMqKCcgKyBzcmNbdC5YUkFOR0VQTEFJTl0gKyAnKScgK1xuICAgICAgICAgICAgICAgICAgICdcXFxccystXFxcXHMrJyArXG4gICAgICAgICAgICAgICAgICAgJygnICsgc3JjW3QuWFJBTkdFUExBSU5dICsgJyknICtcbiAgICAgICAgICAgICAgICAgICAnXFxcXHMqJCdcblxudG9rKCdIWVBIRU5SQU5HRUxPT1NFJylcbnNyY1t0LkhZUEhFTlJBTkdFTE9PU0VdID0gJ15cXFxccyooJyArIHNyY1t0LlhSQU5HRVBMQUlOTE9PU0VdICsgJyknICtcbiAgICAgICAgICAgICAgICAgICAgICAgICdcXFxccystXFxcXHMrJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnKCcgKyBzcmNbdC5YUkFOR0VQTEFJTkxPT1NFXSArICcpJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnXFxcXHMqJCdcblxuLy8gU3RhciByYW5nZXMgYmFzaWNhbGx5IGp1c3QgYWxsb3cgYW55dGhpbmcgYXQgYWxsLlxudG9rKCdTVEFSJylcbnNyY1t0LlNUQVJdID0gJyg8fD4pPz0/XFxcXHMqXFxcXConXG5cbi8vIENvbXBpbGUgdG8gYWN0dWFsIHJlZ2V4cCBvYmplY3RzLlxuLy8gQWxsIGFyZSBmbGFnLWZyZWUsIHVubGVzcyB0aGV5IHdlcmUgY3JlYXRlZCBhYm92ZSB3aXRoIGEgZmxhZy5cbmZvciAodmFyIGkgPSAwOyBpIDwgUjsgaSsrKSB7XG4gIGRlYnVnKGksIHNyY1tpXSlcbiAgaWYgKCFyZVtpXSkge1xuICAgIHJlW2ldID0gbmV3IFJlZ0V4cChzcmNbaV0pXG4gIH1cbn1cblxuZXhwb3J0cy5wYXJzZSA9IHBhcnNlXG5mdW5jdGlvbiBwYXJzZSAodmVyc2lvbiwgb3B0aW9ucykge1xuICBpZiAoIW9wdGlvbnMgfHwgdHlwZW9mIG9wdGlvbnMgIT09ICdvYmplY3QnKSB7XG4gICAgb3B0aW9ucyA9IHtcbiAgICAgIGxvb3NlOiAhIW9wdGlvbnMsXG4gICAgICBpbmNsdWRlUHJlcmVsZWFzZTogZmFsc2VcbiAgICB9XG4gIH1cblxuICBpZiAodmVyc2lvbiBpbnN0YW5jZW9mIFNlbVZlcikge1xuICAgIHJldHVybiB2ZXJzaW9uXG4gIH1cblxuICBpZiAodHlwZW9mIHZlcnNpb24gIT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIGlmICh2ZXJzaW9uLmxlbmd0aCA+IE1BWF9MRU5HVEgpIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgdmFyIHIgPSBvcHRpb25zLmxvb3NlID8gcmVbdC5MT09TRV0gOiByZVt0LkZVTExdXG4gIGlmICghci50ZXN0KHZlcnNpb24pKSB7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIHRyeSB7XG4gICAgcmV0dXJuIG5ldyBTZW1WZXIodmVyc2lvbiwgb3B0aW9ucylcbiAgfSBjYXRjaCAoZXIpIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG59XG5cbmV4cG9ydHMudmFsaWQgPSB2YWxpZFxuZnVuY3Rpb24gdmFsaWQgKHZlcnNpb24sIG9wdGlvbnMpIHtcbiAgdmFyIHYgPSBwYXJzZSh2ZXJzaW9uLCBvcHRpb25zKVxuICByZXR1cm4gdiA/IHYudmVyc2lvbiA6IG51bGxcbn1cblxuZXhwb3J0cy5jbGVhbiA9IGNsZWFuXG5mdW5jdGlvbiBjbGVhbiAodmVyc2lvbiwgb3B0aW9ucykge1xuICB2YXIgcyA9IHBhcnNlKHZlcnNpb24udHJpbSgpLnJlcGxhY2UoL15bPXZdKy8sICcnKSwgb3B0aW9ucylcbiAgcmV0dXJuIHMgPyBzLnZlcnNpb24gOiBudWxsXG59XG5cbmV4cG9ydHMuU2VtVmVyID0gU2VtVmVyXG5cbmZ1bmN0aW9uIFNlbVZlciAodmVyc2lvbiwgb3B0aW9ucykge1xuICBpZiAoIW9wdGlvbnMgfHwgdHlwZW9mIG9wdGlvbnMgIT09ICdvYmplY3QnKSB7XG4gICAgb3B0aW9ucyA9IHtcbiAgICAgIGxvb3NlOiAhIW9wdGlvbnMsXG4gICAgICBpbmNsdWRlUHJlcmVsZWFzZTogZmFsc2VcbiAgICB9XG4gIH1cbiAgaWYgKHZlcnNpb24gaW5zdGFuY2VvZiBTZW1WZXIpIHtcbiAgICBpZiAodmVyc2lvbi5sb29zZSA9PT0gb3B0aW9ucy5sb29zZSkge1xuICAgICAgcmV0dXJuIHZlcnNpb25cbiAgICB9IGVsc2Uge1xuICAgICAgdmVyc2lvbiA9IHZlcnNpb24udmVyc2lvblxuICAgIH1cbiAgfSBlbHNlIGlmICh0eXBlb2YgdmVyc2lvbiAhPT0gJ3N0cmluZycpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIFZlcnNpb246ICcgKyB2ZXJzaW9uKVxuICB9XG5cbiAgaWYgKHZlcnNpb24ubGVuZ3RoID4gTUFYX0xFTkdUSCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3ZlcnNpb24gaXMgbG9uZ2VyIHRoYW4gJyArIE1BWF9MRU5HVEggKyAnIGNoYXJhY3RlcnMnKVxuICB9XG5cbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIFNlbVZlcikpIHtcbiAgICByZXR1cm4gbmV3IFNlbVZlcih2ZXJzaW9uLCBvcHRpb25zKVxuICB9XG5cbiAgZGVidWcoJ1NlbVZlcicsIHZlcnNpb24sIG9wdGlvbnMpXG4gIHRoaXMub3B0aW9ucyA9IG9wdGlvbnNcbiAgdGhpcy5sb29zZSA9ICEhb3B0aW9ucy5sb29zZVxuXG4gIHZhciBtID0gdmVyc2lvbi50cmltKCkubWF0Y2gob3B0aW9ucy5sb29zZSA/IHJlW3QuTE9PU0VdIDogcmVbdC5GVUxMXSlcblxuICBpZiAoIW0pIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIFZlcnNpb246ICcgKyB2ZXJzaW9uKVxuICB9XG5cbiAgdGhpcy5yYXcgPSB2ZXJzaW9uXG5cbiAgLy8gdGhlc2UgYXJlIGFjdHVhbGx5IG51bWJlcnNcbiAgdGhpcy5tYWpvciA9ICttWzFdXG4gIHRoaXMubWlub3IgPSArbVsyXVxuICB0aGlzLnBhdGNoID0gK21bM11cblxuICBpZiAodGhpcy5tYWpvciA+IE1BWF9TQUZFX0lOVEVHRVIgfHwgdGhpcy5tYWpvciA8IDApIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIG1ham9yIHZlcnNpb24nKVxuICB9XG5cbiAgaWYgKHRoaXMubWlub3IgPiBNQVhfU0FGRV9JTlRFR0VSIHx8IHRoaXMubWlub3IgPCAwKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBtaW5vciB2ZXJzaW9uJylcbiAgfVxuXG4gIGlmICh0aGlzLnBhdGNoID4gTUFYX1NBRkVfSU5URUdFUiB8fCB0aGlzLnBhdGNoIDwgMCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgcGF0Y2ggdmVyc2lvbicpXG4gIH1cblxuICAvLyBudW1iZXJpZnkgYW55IHByZXJlbGVhc2UgbnVtZXJpYyBpZHNcbiAgaWYgKCFtWzRdKSB7XG4gICAgdGhpcy5wcmVyZWxlYXNlID0gW11cbiAgfSBlbHNlIHtcbiAgICB0aGlzLnByZXJlbGVhc2UgPSBtWzRdLnNwbGl0KCcuJykubWFwKGZ1bmN0aW9uIChpZCkge1xuICAgICAgaWYgKC9eWzAtOV0rJC8udGVzdChpZCkpIHtcbiAgICAgICAgdmFyIG51bSA9ICtpZFxuICAgICAgICBpZiAobnVtID49IDAgJiYgbnVtIDwgTUFYX1NBRkVfSU5URUdFUikge1xuICAgICAgICAgIHJldHVybiBudW1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGlkXG4gICAgfSlcbiAgfVxuXG4gIHRoaXMuYnVpbGQgPSBtWzVdID8gbVs1XS5zcGxpdCgnLicpIDogW11cbiAgdGhpcy5mb3JtYXQoKVxufVxuXG5TZW1WZXIucHJvdG90eXBlLmZvcm1hdCA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy52ZXJzaW9uID0gdGhpcy5tYWpvciArICcuJyArIHRoaXMubWlub3IgKyAnLicgKyB0aGlzLnBhdGNoXG4gIGlmICh0aGlzLnByZXJlbGVhc2UubGVuZ3RoKSB7XG4gICAgdGhpcy52ZXJzaW9uICs9ICctJyArIHRoaXMucHJlcmVsZWFzZS5qb2luKCcuJylcbiAgfVxuICByZXR1cm4gdGhpcy52ZXJzaW9uXG59XG5cblNlbVZlci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLnZlcnNpb25cbn1cblxuU2VtVmVyLnByb3RvdHlwZS5jb21wYXJlID0gZnVuY3Rpb24gKG90aGVyKSB7XG4gIGRlYnVnKCdTZW1WZXIuY29tcGFyZScsIHRoaXMudmVyc2lvbiwgdGhpcy5vcHRpb25zLCBvdGhlcilcbiAgaWYgKCEob3RoZXIgaW5zdGFuY2VvZiBTZW1WZXIpKSB7XG4gICAgb3RoZXIgPSBuZXcgU2VtVmVyKG90aGVyLCB0aGlzLm9wdGlvbnMpXG4gIH1cblxuICByZXR1cm4gdGhpcy5jb21wYXJlTWFpbihvdGhlcikgfHwgdGhpcy5jb21wYXJlUHJlKG90aGVyKVxufVxuXG5TZW1WZXIucHJvdG90eXBlLmNvbXBhcmVNYWluID0gZnVuY3Rpb24gKG90aGVyKSB7XG4gIGlmICghKG90aGVyIGluc3RhbmNlb2YgU2VtVmVyKSkge1xuICAgIG90aGVyID0gbmV3IFNlbVZlcihvdGhlciwgdGhpcy5vcHRpb25zKVxuICB9XG5cbiAgcmV0dXJuIGNvbXBhcmVJZGVudGlmaWVycyh0aGlzLm1ham9yLCBvdGhlci5tYWpvcikgfHxcbiAgICAgICAgIGNvbXBhcmVJZGVudGlmaWVycyh0aGlzLm1pbm9yLCBvdGhlci5taW5vcikgfHxcbiAgICAgICAgIGNvbXBhcmVJZGVudGlmaWVycyh0aGlzLnBhdGNoLCBvdGhlci5wYXRjaClcbn1cblxuU2VtVmVyLnByb3RvdHlwZS5jb21wYXJlUHJlID0gZnVuY3Rpb24gKG90aGVyKSB7XG4gIGlmICghKG90aGVyIGluc3RhbmNlb2YgU2VtVmVyKSkge1xuICAgIG90aGVyID0gbmV3IFNlbVZlcihvdGhlciwgdGhpcy5vcHRpb25zKVxuICB9XG5cbiAgLy8gTk9UIGhhdmluZyBhIHByZXJlbGVhc2UgaXMgPiBoYXZpbmcgb25lXG4gIGlmICh0aGlzLnByZXJlbGVhc2UubGVuZ3RoICYmICFvdGhlci5wcmVyZWxlYXNlLmxlbmd0aCkge1xuICAgIHJldHVybiAtMVxuICB9IGVsc2UgaWYgKCF0aGlzLnByZXJlbGVhc2UubGVuZ3RoICYmIG90aGVyLnByZXJlbGVhc2UubGVuZ3RoKSB7XG4gICAgcmV0dXJuIDFcbiAgfSBlbHNlIGlmICghdGhpcy5wcmVyZWxlYXNlLmxlbmd0aCAmJiAhb3RoZXIucHJlcmVsZWFzZS5sZW5ndGgpIHtcbiAgICByZXR1cm4gMFxuICB9XG5cbiAgdmFyIGkgPSAwXG4gIGRvIHtcbiAgICB2YXIgYSA9IHRoaXMucHJlcmVsZWFzZVtpXVxuICAgIHZhciBiID0gb3RoZXIucHJlcmVsZWFzZVtpXVxuICAgIGRlYnVnKCdwcmVyZWxlYXNlIGNvbXBhcmUnLCBpLCBhLCBiKVxuICAgIGlmIChhID09PSB1bmRlZmluZWQgJiYgYiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gMFxuICAgIH0gZWxzZSBpZiAoYiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gMVxuICAgIH0gZWxzZSBpZiAoYSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gLTFcbiAgICB9IGVsc2UgaWYgKGEgPT09IGIpIHtcbiAgICAgIGNvbnRpbnVlXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjb21wYXJlSWRlbnRpZmllcnMoYSwgYilcbiAgICB9XG4gIH0gd2hpbGUgKCsraSlcbn1cblxuU2VtVmVyLnByb3RvdHlwZS5jb21wYXJlQnVpbGQgPSBmdW5jdGlvbiAob3RoZXIpIHtcbiAgaWYgKCEob3RoZXIgaW5zdGFuY2VvZiBTZW1WZXIpKSB7XG4gICAgb3RoZXIgPSBuZXcgU2VtVmVyKG90aGVyLCB0aGlzLm9wdGlvbnMpXG4gIH1cblxuICB2YXIgaSA9IDBcbiAgZG8ge1xuICAgIHZhciBhID0gdGhpcy5idWlsZFtpXVxuICAgIHZhciBiID0gb3RoZXIuYnVpbGRbaV1cbiAgICBkZWJ1ZygncHJlcmVsZWFzZSBjb21wYXJlJywgaSwgYSwgYilcbiAgICBpZiAoYSA9PT0gdW5kZWZpbmVkICYmIGIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIDBcbiAgICB9IGVsc2UgaWYgKGIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIDFcbiAgICB9IGVsc2UgaWYgKGEgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIC0xXG4gICAgfSBlbHNlIGlmIChhID09PSBiKSB7XG4gICAgICBjb250aW51ZVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gY29tcGFyZUlkZW50aWZpZXJzKGEsIGIpXG4gICAgfVxuICB9IHdoaWxlICgrK2kpXG59XG5cbi8vIHByZW1pbm9yIHdpbGwgYnVtcCB0aGUgdmVyc2lvbiB1cCB0byB0aGUgbmV4dCBtaW5vciByZWxlYXNlLCBhbmQgaW1tZWRpYXRlbHlcbi8vIGRvd24gdG8gcHJlLXJlbGVhc2UuIHByZW1ham9yIGFuZCBwcmVwYXRjaCB3b3JrIHRoZSBzYW1lIHdheS5cblNlbVZlci5wcm90b3R5cGUuaW5jID0gZnVuY3Rpb24gKHJlbGVhc2UsIGlkZW50aWZpZXIpIHtcbiAgc3dpdGNoIChyZWxlYXNlKSB7XG4gICAgY2FzZSAncHJlbWFqb3InOlxuICAgICAgdGhpcy5wcmVyZWxlYXNlLmxlbmd0aCA9IDBcbiAgICAgIHRoaXMucGF0Y2ggPSAwXG4gICAgICB0aGlzLm1pbm9yID0gMFxuICAgICAgdGhpcy5tYWpvcisrXG4gICAgICB0aGlzLmluYygncHJlJywgaWRlbnRpZmllcilcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAncHJlbWlub3InOlxuICAgICAgdGhpcy5wcmVyZWxlYXNlLmxlbmd0aCA9IDBcbiAgICAgIHRoaXMucGF0Y2ggPSAwXG4gICAgICB0aGlzLm1pbm9yKytcbiAgICAgIHRoaXMuaW5jKCdwcmUnLCBpZGVudGlmaWVyKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdwcmVwYXRjaCc6XG4gICAgICAvLyBJZiB0aGlzIGlzIGFscmVhZHkgYSBwcmVyZWxlYXNlLCBpdCB3aWxsIGJ1bXAgdG8gdGhlIG5leHQgdmVyc2lvblxuICAgICAgLy8gZHJvcCBhbnkgcHJlcmVsZWFzZXMgdGhhdCBtaWdodCBhbHJlYWR5IGV4aXN0LCBzaW5jZSB0aGV5IGFyZSBub3RcbiAgICAgIC8vIHJlbGV2YW50IGF0IHRoaXMgcG9pbnQuXG4gICAgICB0aGlzLnByZXJlbGVhc2UubGVuZ3RoID0gMFxuICAgICAgdGhpcy5pbmMoJ3BhdGNoJywgaWRlbnRpZmllcilcbiAgICAgIHRoaXMuaW5jKCdwcmUnLCBpZGVudGlmaWVyKVxuICAgICAgYnJlYWtcbiAgICAvLyBJZiB0aGUgaW5wdXQgaXMgYSBub24tcHJlcmVsZWFzZSB2ZXJzaW9uLCB0aGlzIGFjdHMgdGhlIHNhbWUgYXNcbiAgICAvLyBwcmVwYXRjaC5cbiAgICBjYXNlICdwcmVyZWxlYXNlJzpcbiAgICAgIGlmICh0aGlzLnByZXJlbGVhc2UubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHRoaXMuaW5jKCdwYXRjaCcsIGlkZW50aWZpZXIpXG4gICAgICB9XG4gICAgICB0aGlzLmluYygncHJlJywgaWRlbnRpZmllcilcbiAgICAgIGJyZWFrXG5cbiAgICBjYXNlICdtYWpvcic6XG4gICAgICAvLyBJZiB0aGlzIGlzIGEgcHJlLW1ham9yIHZlcnNpb24sIGJ1bXAgdXAgdG8gdGhlIHNhbWUgbWFqb3IgdmVyc2lvbi5cbiAgICAgIC8vIE90aGVyd2lzZSBpbmNyZW1lbnQgbWFqb3IuXG4gICAgICAvLyAxLjAuMC01IGJ1bXBzIHRvIDEuMC4wXG4gICAgICAvLyAxLjEuMCBidW1wcyB0byAyLjAuMFxuICAgICAgaWYgKHRoaXMubWlub3IgIT09IDAgfHxcbiAgICAgICAgICB0aGlzLnBhdGNoICE9PSAwIHx8XG4gICAgICAgICAgdGhpcy5wcmVyZWxlYXNlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB0aGlzLm1ham9yKytcbiAgICAgIH1cbiAgICAgIHRoaXMubWlub3IgPSAwXG4gICAgICB0aGlzLnBhdGNoID0gMFxuICAgICAgdGhpcy5wcmVyZWxlYXNlID0gW11cbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnbWlub3InOlxuICAgICAgLy8gSWYgdGhpcyBpcyBhIHByZS1taW5vciB2ZXJzaW9uLCBidW1wIHVwIHRvIHRoZSBzYW1lIG1pbm9yIHZlcnNpb24uXG4gICAgICAvLyBPdGhlcndpc2UgaW5jcmVtZW50IG1pbm9yLlxuICAgICAgLy8gMS4yLjAtNSBidW1wcyB0byAxLjIuMFxuICAgICAgLy8gMS4yLjEgYnVtcHMgdG8gMS4zLjBcbiAgICAgIGlmICh0aGlzLnBhdGNoICE9PSAwIHx8IHRoaXMucHJlcmVsZWFzZS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdGhpcy5taW5vcisrXG4gICAgICB9XG4gICAgICB0aGlzLnBhdGNoID0gMFxuICAgICAgdGhpcy5wcmVyZWxlYXNlID0gW11cbiAgICAgIGJyZWFrXG4gICAgY2FzZSAncGF0Y2gnOlxuICAgICAgLy8gSWYgdGhpcyBpcyBub3QgYSBwcmUtcmVsZWFzZSB2ZXJzaW9uLCBpdCB3aWxsIGluY3JlbWVudCB0aGUgcGF0Y2guXG4gICAgICAvLyBJZiBpdCBpcyBhIHByZS1yZWxlYXNlIGl0IHdpbGwgYnVtcCB1cCB0byB0aGUgc2FtZSBwYXRjaCB2ZXJzaW9uLlxuICAgICAgLy8gMS4yLjAtNSBwYXRjaGVzIHRvIDEuMi4wXG4gICAgICAvLyAxLjIuMCBwYXRjaGVzIHRvIDEuMi4xXG4gICAgICBpZiAodGhpcy5wcmVyZWxlYXNlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB0aGlzLnBhdGNoKytcbiAgICAgIH1cbiAgICAgIHRoaXMucHJlcmVsZWFzZSA9IFtdXG4gICAgICBicmVha1xuICAgIC8vIFRoaXMgcHJvYmFibHkgc2hvdWxkbid0IGJlIHVzZWQgcHVibGljbHkuXG4gICAgLy8gMS4wLjAgXCJwcmVcIiB3b3VsZCBiZWNvbWUgMS4wLjAtMCB3aGljaCBpcyB0aGUgd3JvbmcgZGlyZWN0aW9uLlxuICAgIGNhc2UgJ3ByZSc6XG4gICAgICBpZiAodGhpcy5wcmVyZWxlYXNlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB0aGlzLnByZXJlbGVhc2UgPSBbMF1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBpID0gdGhpcy5wcmVyZWxlYXNlLmxlbmd0aFxuICAgICAgICB3aGlsZSAoLS1pID49IDApIHtcbiAgICAgICAgICBpZiAodHlwZW9mIHRoaXMucHJlcmVsZWFzZVtpXSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIHRoaXMucHJlcmVsZWFzZVtpXSsrXG4gICAgICAgICAgICBpID0gLTJcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGkgPT09IC0xKSB7XG4gICAgICAgICAgLy8gZGlkbid0IGluY3JlbWVudCBhbnl0aGluZ1xuICAgICAgICAgIHRoaXMucHJlcmVsZWFzZS5wdXNoKDApXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChpZGVudGlmaWVyKSB7XG4gICAgICAgIC8vIDEuMi4wLWJldGEuMSBidW1wcyB0byAxLjIuMC1iZXRhLjIsXG4gICAgICAgIC8vIDEuMi4wLWJldGEuZm9vYmx6IG9yIDEuMi4wLWJldGEgYnVtcHMgdG8gMS4yLjAtYmV0YS4wXG4gICAgICAgIGlmICh0aGlzLnByZXJlbGVhc2VbMF0gPT09IGlkZW50aWZpZXIpIHtcbiAgICAgICAgICBpZiAoaXNOYU4odGhpcy5wcmVyZWxlYXNlWzFdKSkge1xuICAgICAgICAgICAgdGhpcy5wcmVyZWxlYXNlID0gW2lkZW50aWZpZXIsIDBdXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMucHJlcmVsZWFzZSA9IFtpZGVudGlmaWVyLCAwXVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBicmVha1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBpbmNyZW1lbnQgYXJndW1lbnQ6ICcgKyByZWxlYXNlKVxuICB9XG4gIHRoaXMuZm9ybWF0KClcbiAgdGhpcy5yYXcgPSB0aGlzLnZlcnNpb25cbiAgcmV0dXJuIHRoaXNcbn1cblxuZXhwb3J0cy5pbmMgPSBpbmNcbmZ1bmN0aW9uIGluYyAodmVyc2lvbiwgcmVsZWFzZSwgbG9vc2UsIGlkZW50aWZpZXIpIHtcbiAgaWYgKHR5cGVvZiAobG9vc2UpID09PSAnc3RyaW5nJykge1xuICAgIGlkZW50aWZpZXIgPSBsb29zZVxuICAgIGxvb3NlID0gdW5kZWZpbmVkXG4gIH1cblxuICB0cnkge1xuICAgIHJldHVybiBuZXcgU2VtVmVyKHZlcnNpb24sIGxvb3NlKS5pbmMocmVsZWFzZSwgaWRlbnRpZmllcikudmVyc2lvblxuICB9IGNhdGNoIChlcikge1xuICAgIHJldHVybiBudWxsXG4gIH1cbn1cblxuZXhwb3J0cy5kaWZmID0gZGlmZlxuZnVuY3Rpb24gZGlmZiAodmVyc2lvbjEsIHZlcnNpb24yKSB7XG4gIGlmIChlcSh2ZXJzaW9uMSwgdmVyc2lvbjIpKSB7XG4gICAgcmV0dXJuIG51bGxcbiAgfSBlbHNlIHtcbiAgICB2YXIgdjEgPSBwYXJzZSh2ZXJzaW9uMSlcbiAgICB2YXIgdjIgPSBwYXJzZSh2ZXJzaW9uMilcbiAgICB2YXIgcHJlZml4ID0gJydcbiAgICBpZiAodjEucHJlcmVsZWFzZS5sZW5ndGggfHwgdjIucHJlcmVsZWFzZS5sZW5ndGgpIHtcbiAgICAgIHByZWZpeCA9ICdwcmUnXG4gICAgICB2YXIgZGVmYXVsdFJlc3VsdCA9ICdwcmVyZWxlYXNlJ1xuICAgIH1cbiAgICBmb3IgKHZhciBrZXkgaW4gdjEpIHtcbiAgICAgIGlmIChrZXkgPT09ICdtYWpvcicgfHwga2V5ID09PSAnbWlub3InIHx8IGtleSA9PT0gJ3BhdGNoJykge1xuICAgICAgICBpZiAodjFba2V5XSAhPT0gdjJba2V5XSkge1xuICAgICAgICAgIHJldHVybiBwcmVmaXggKyBrZXlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZGVmYXVsdFJlc3VsdCAvLyBtYXkgYmUgdW5kZWZpbmVkXG4gIH1cbn1cblxuZXhwb3J0cy5jb21wYXJlSWRlbnRpZmllcnMgPSBjb21wYXJlSWRlbnRpZmllcnNcblxudmFyIG51bWVyaWMgPSAvXlswLTldKyQvXG5mdW5jdGlvbiBjb21wYXJlSWRlbnRpZmllcnMgKGEsIGIpIHtcbiAgdmFyIGFudW0gPSBudW1lcmljLnRlc3QoYSlcbiAgdmFyIGJudW0gPSBudW1lcmljLnRlc3QoYilcblxuICBpZiAoYW51bSAmJiBibnVtKSB7XG4gICAgYSA9ICthXG4gICAgYiA9ICtiXG4gIH1cblxuICByZXR1cm4gYSA9PT0gYiA/IDBcbiAgICA6IChhbnVtICYmICFibnVtKSA/IC0xXG4gICAgOiAoYm51bSAmJiAhYW51bSkgPyAxXG4gICAgOiBhIDwgYiA/IC0xXG4gICAgOiAxXG59XG5cbmV4cG9ydHMucmNvbXBhcmVJZGVudGlmaWVycyA9IHJjb21wYXJlSWRlbnRpZmllcnNcbmZ1bmN0aW9uIHJjb21wYXJlSWRlbnRpZmllcnMgKGEsIGIpIHtcbiAgcmV0dXJuIGNvbXBhcmVJZGVudGlmaWVycyhiLCBhKVxufVxuXG5leHBvcnRzLm1ham9yID0gbWFqb3JcbmZ1bmN0aW9uIG1ham9yIChhLCBsb29zZSkge1xuICByZXR1cm4gbmV3IFNlbVZlcihhLCBsb29zZSkubWFqb3Jcbn1cblxuZXhwb3J0cy5taW5vciA9IG1pbm9yXG5mdW5jdGlvbiBtaW5vciAoYSwgbG9vc2UpIHtcbiAgcmV0dXJuIG5ldyBTZW1WZXIoYSwgbG9vc2UpLm1pbm9yXG59XG5cbmV4cG9ydHMucGF0Y2ggPSBwYXRjaFxuZnVuY3Rpb24gcGF0Y2ggKGEsIGxvb3NlKSB7XG4gIHJldHVybiBuZXcgU2VtVmVyKGEsIGxvb3NlKS5wYXRjaFxufVxuXG5leHBvcnRzLmNvbXBhcmUgPSBjb21wYXJlXG5mdW5jdGlvbiBjb21wYXJlIChhLCBiLCBsb29zZSkge1xuICByZXR1cm4gbmV3IFNlbVZlcihhLCBsb29zZSkuY29tcGFyZShuZXcgU2VtVmVyKGIsIGxvb3NlKSlcbn1cblxuZXhwb3J0cy5jb21wYXJlTG9vc2UgPSBjb21wYXJlTG9vc2VcbmZ1bmN0aW9uIGNvbXBhcmVMb29zZSAoYSwgYikge1xuICByZXR1cm4gY29tcGFyZShhLCBiLCB0cnVlKVxufVxuXG5leHBvcnRzLmNvbXBhcmVCdWlsZCA9IGNvbXBhcmVCdWlsZFxuZnVuY3Rpb24gY29tcGFyZUJ1aWxkIChhLCBiLCBsb29zZSkge1xuICB2YXIgdmVyc2lvbkEgPSBuZXcgU2VtVmVyKGEsIGxvb3NlKVxuICB2YXIgdmVyc2lvbkIgPSBuZXcgU2VtVmVyKGIsIGxvb3NlKVxuICByZXR1cm4gdmVyc2lvbkEuY29tcGFyZSh2ZXJzaW9uQikgfHwgdmVyc2lvbkEuY29tcGFyZUJ1aWxkKHZlcnNpb25CKVxufVxuXG5leHBvcnRzLnJjb21wYXJlID0gcmNvbXBhcmVcbmZ1bmN0aW9uIHJjb21wYXJlIChhLCBiLCBsb29zZSkge1xuICByZXR1cm4gY29tcGFyZShiLCBhLCBsb29zZSlcbn1cblxuZXhwb3J0cy5zb3J0ID0gc29ydFxuZnVuY3Rpb24gc29ydCAobGlzdCwgbG9vc2UpIHtcbiAgcmV0dXJuIGxpc3Quc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgIHJldHVybiBleHBvcnRzLmNvbXBhcmVCdWlsZChhLCBiLCBsb29zZSlcbiAgfSlcbn1cblxuZXhwb3J0cy5yc29ydCA9IHJzb3J0XG5mdW5jdGlvbiByc29ydCAobGlzdCwgbG9vc2UpIHtcbiAgcmV0dXJuIGxpc3Quc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgIHJldHVybiBleHBvcnRzLmNvbXBhcmVCdWlsZChiLCBhLCBsb29zZSlcbiAgfSlcbn1cblxuZXhwb3J0cy5ndCA9IGd0XG5mdW5jdGlvbiBndCAoYSwgYiwgbG9vc2UpIHtcbiAgcmV0dXJuIGNvbXBhcmUoYSwgYiwgbG9vc2UpID4gMFxufVxuXG5leHBvcnRzLmx0ID0gbHRcbmZ1bmN0aW9uIGx0IChhLCBiLCBsb29zZSkge1xuICByZXR1cm4gY29tcGFyZShhLCBiLCBsb29zZSkgPCAwXG59XG5cbmV4cG9ydHMuZXEgPSBlcVxuZnVuY3Rpb24gZXEgKGEsIGIsIGxvb3NlKSB7XG4gIHJldHVybiBjb21wYXJlKGEsIGIsIGxvb3NlKSA9PT0gMFxufVxuXG5leHBvcnRzLm5lcSA9IG5lcVxuZnVuY3Rpb24gbmVxIChhLCBiLCBsb29zZSkge1xuICByZXR1cm4gY29tcGFyZShhLCBiLCBsb29zZSkgIT09IDBcbn1cblxuZXhwb3J0cy5ndGUgPSBndGVcbmZ1bmN0aW9uIGd0ZSAoYSwgYiwgbG9vc2UpIHtcbiAgcmV0dXJuIGNvbXBhcmUoYSwgYiwgbG9vc2UpID49IDBcbn1cblxuZXhwb3J0cy5sdGUgPSBsdGVcbmZ1bmN0aW9uIGx0ZSAoYSwgYiwgbG9vc2UpIHtcbiAgcmV0dXJuIGNvbXBhcmUoYSwgYiwgbG9vc2UpIDw9IDBcbn1cblxuZXhwb3J0cy5jbXAgPSBjbXBcbmZ1bmN0aW9uIGNtcCAoYSwgb3AsIGIsIGxvb3NlKSB7XG4gIHN3aXRjaCAob3ApIHtcbiAgICBjYXNlICc9PT0nOlxuICAgICAgaWYgKHR5cGVvZiBhID09PSAnb2JqZWN0JylcbiAgICAgICAgYSA9IGEudmVyc2lvblxuICAgICAgaWYgKHR5cGVvZiBiID09PSAnb2JqZWN0JylcbiAgICAgICAgYiA9IGIudmVyc2lvblxuICAgICAgcmV0dXJuIGEgPT09IGJcblxuICAgIGNhc2UgJyE9PSc6XG4gICAgICBpZiAodHlwZW9mIGEgPT09ICdvYmplY3QnKVxuICAgICAgICBhID0gYS52ZXJzaW9uXG4gICAgICBpZiAodHlwZW9mIGIgPT09ICdvYmplY3QnKVxuICAgICAgICBiID0gYi52ZXJzaW9uXG4gICAgICByZXR1cm4gYSAhPT0gYlxuXG4gICAgY2FzZSAnJzpcbiAgICBjYXNlICc9JzpcbiAgICBjYXNlICc9PSc6XG4gICAgICByZXR1cm4gZXEoYSwgYiwgbG9vc2UpXG5cbiAgICBjYXNlICchPSc6XG4gICAgICByZXR1cm4gbmVxKGEsIGIsIGxvb3NlKVxuXG4gICAgY2FzZSAnPic6XG4gICAgICByZXR1cm4gZ3QoYSwgYiwgbG9vc2UpXG5cbiAgICBjYXNlICc+PSc6XG4gICAgICByZXR1cm4gZ3RlKGEsIGIsIGxvb3NlKVxuXG4gICAgY2FzZSAnPCc6XG4gICAgICByZXR1cm4gbHQoYSwgYiwgbG9vc2UpXG5cbiAgICBjYXNlICc8PSc6XG4gICAgICByZXR1cm4gbHRlKGEsIGIsIGxvb3NlKVxuXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgb3BlcmF0b3I6ICcgKyBvcClcbiAgfVxufVxuXG5leHBvcnRzLkNvbXBhcmF0b3IgPSBDb21wYXJhdG9yXG5mdW5jdGlvbiBDb21wYXJhdG9yIChjb21wLCBvcHRpb25zKSB7XG4gIGlmICghb3B0aW9ucyB8fCB0eXBlb2Ygb3B0aW9ucyAhPT0gJ29iamVjdCcpIHtcbiAgICBvcHRpb25zID0ge1xuICAgICAgbG9vc2U6ICEhb3B0aW9ucyxcbiAgICAgIGluY2x1ZGVQcmVyZWxlYXNlOiBmYWxzZVxuICAgIH1cbiAgfVxuXG4gIGlmIChjb21wIGluc3RhbmNlb2YgQ29tcGFyYXRvcikge1xuICAgIGlmIChjb21wLmxvb3NlID09PSAhIW9wdGlvbnMubG9vc2UpIHtcbiAgICAgIHJldHVybiBjb21wXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbXAgPSBjb21wLnZhbHVlXG4gICAgfVxuICB9XG5cbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIENvbXBhcmF0b3IpKSB7XG4gICAgcmV0dXJuIG5ldyBDb21wYXJhdG9yKGNvbXAsIG9wdGlvbnMpXG4gIH1cblxuICBkZWJ1ZygnY29tcGFyYXRvcicsIGNvbXAsIG9wdGlvbnMpXG4gIHRoaXMub3B0aW9ucyA9IG9wdGlvbnNcbiAgdGhpcy5sb29zZSA9ICEhb3B0aW9ucy5sb29zZVxuICB0aGlzLnBhcnNlKGNvbXApXG5cbiAgaWYgKHRoaXMuc2VtdmVyID09PSBBTlkpIHtcbiAgICB0aGlzLnZhbHVlID0gJydcbiAgfSBlbHNlIHtcbiAgICB0aGlzLnZhbHVlID0gdGhpcy5vcGVyYXRvciArIHRoaXMuc2VtdmVyLnZlcnNpb25cbiAgfVxuXG4gIGRlYnVnKCdjb21wJywgdGhpcylcbn1cblxudmFyIEFOWSA9IHt9XG5Db21wYXJhdG9yLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uIChjb21wKSB7XG4gIHZhciByID0gdGhpcy5vcHRpb25zLmxvb3NlID8gcmVbdC5DT01QQVJBVE9STE9PU0VdIDogcmVbdC5DT01QQVJBVE9SXVxuICB2YXIgbSA9IGNvbXAubWF0Y2gocilcblxuICBpZiAoIW0pIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIGNvbXBhcmF0b3I6ICcgKyBjb21wKVxuICB9XG5cbiAgdGhpcy5vcGVyYXRvciA9IG1bMV0gIT09IHVuZGVmaW5lZCA/IG1bMV0gOiAnJ1xuICBpZiAodGhpcy5vcGVyYXRvciA9PT0gJz0nKSB7XG4gICAgdGhpcy5vcGVyYXRvciA9ICcnXG4gIH1cblxuICAvLyBpZiBpdCBsaXRlcmFsbHkgaXMganVzdCAnPicgb3IgJycgdGhlbiBhbGxvdyBhbnl0aGluZy5cbiAgaWYgKCFtWzJdKSB7XG4gICAgdGhpcy5zZW12ZXIgPSBBTllcbiAgfSBlbHNlIHtcbiAgICB0aGlzLnNlbXZlciA9IG5ldyBTZW1WZXIobVsyXSwgdGhpcy5vcHRpb25zLmxvb3NlKVxuICB9XG59XG5cbkNvbXBhcmF0b3IucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy52YWx1ZVxufVxuXG5Db21wYXJhdG9yLnByb3RvdHlwZS50ZXN0ID0gZnVuY3Rpb24gKHZlcnNpb24pIHtcbiAgZGVidWcoJ0NvbXBhcmF0b3IudGVzdCcsIHZlcnNpb24sIHRoaXMub3B0aW9ucy5sb29zZSlcblxuICBpZiAodGhpcy5zZW12ZXIgPT09IEFOWSB8fCB2ZXJzaW9uID09PSBBTlkpIHtcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgaWYgKHR5cGVvZiB2ZXJzaW9uID09PSAnc3RyaW5nJykge1xuICAgIHRyeSB7XG4gICAgICB2ZXJzaW9uID0gbmV3IFNlbVZlcih2ZXJzaW9uLCB0aGlzLm9wdGlvbnMpXG4gICAgfSBjYXRjaCAoZXIpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBjbXAodmVyc2lvbiwgdGhpcy5vcGVyYXRvciwgdGhpcy5zZW12ZXIsIHRoaXMub3B0aW9ucylcbn1cblxuQ29tcGFyYXRvci5wcm90b3R5cGUuaW50ZXJzZWN0cyA9IGZ1bmN0aW9uIChjb21wLCBvcHRpb25zKSB7XG4gIGlmICghKGNvbXAgaW5zdGFuY2VvZiBDb21wYXJhdG9yKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2EgQ29tcGFyYXRvciBpcyByZXF1aXJlZCcpXG4gIH1cblxuICBpZiAoIW9wdGlvbnMgfHwgdHlwZW9mIG9wdGlvbnMgIT09ICdvYmplY3QnKSB7XG4gICAgb3B0aW9ucyA9IHtcbiAgICAgIGxvb3NlOiAhIW9wdGlvbnMsXG4gICAgICBpbmNsdWRlUHJlcmVsZWFzZTogZmFsc2VcbiAgICB9XG4gIH1cblxuICB2YXIgcmFuZ2VUbXBcblxuICBpZiAodGhpcy5vcGVyYXRvciA9PT0gJycpIHtcbiAgICBpZiAodGhpcy52YWx1ZSA9PT0gJycpIHtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICAgIHJhbmdlVG1wID0gbmV3IFJhbmdlKGNvbXAudmFsdWUsIG9wdGlvbnMpXG4gICAgcmV0dXJuIHNhdGlzZmllcyh0aGlzLnZhbHVlLCByYW5nZVRtcCwgb3B0aW9ucylcbiAgfSBlbHNlIGlmIChjb21wLm9wZXJhdG9yID09PSAnJykge1xuICAgIGlmIChjb21wLnZhbHVlID09PSAnJykge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gICAgcmFuZ2VUbXAgPSBuZXcgUmFuZ2UodGhpcy52YWx1ZSwgb3B0aW9ucylcbiAgICByZXR1cm4gc2F0aXNmaWVzKGNvbXAuc2VtdmVyLCByYW5nZVRtcCwgb3B0aW9ucylcbiAgfVxuXG4gIHZhciBzYW1lRGlyZWN0aW9uSW5jcmVhc2luZyA9XG4gICAgKHRoaXMub3BlcmF0b3IgPT09ICc+PScgfHwgdGhpcy5vcGVyYXRvciA9PT0gJz4nKSAmJlxuICAgIChjb21wLm9wZXJhdG9yID09PSAnPj0nIHx8IGNvbXAub3BlcmF0b3IgPT09ICc+JylcbiAgdmFyIHNhbWVEaXJlY3Rpb25EZWNyZWFzaW5nID1cbiAgICAodGhpcy5vcGVyYXRvciA9PT0gJzw9JyB8fCB0aGlzLm9wZXJhdG9yID09PSAnPCcpICYmXG4gICAgKGNvbXAub3BlcmF0b3IgPT09ICc8PScgfHwgY29tcC5vcGVyYXRvciA9PT0gJzwnKVxuICB2YXIgc2FtZVNlbVZlciA9IHRoaXMuc2VtdmVyLnZlcnNpb24gPT09IGNvbXAuc2VtdmVyLnZlcnNpb25cbiAgdmFyIGRpZmZlcmVudERpcmVjdGlvbnNJbmNsdXNpdmUgPVxuICAgICh0aGlzLm9wZXJhdG9yID09PSAnPj0nIHx8IHRoaXMub3BlcmF0b3IgPT09ICc8PScpICYmXG4gICAgKGNvbXAub3BlcmF0b3IgPT09ICc+PScgfHwgY29tcC5vcGVyYXRvciA9PT0gJzw9JylcbiAgdmFyIG9wcG9zaXRlRGlyZWN0aW9uc0xlc3NUaGFuID1cbiAgICBjbXAodGhpcy5zZW12ZXIsICc8JywgY29tcC5zZW12ZXIsIG9wdGlvbnMpICYmXG4gICAgKCh0aGlzLm9wZXJhdG9yID09PSAnPj0nIHx8IHRoaXMub3BlcmF0b3IgPT09ICc+JykgJiZcbiAgICAoY29tcC5vcGVyYXRvciA9PT0gJzw9JyB8fCBjb21wLm9wZXJhdG9yID09PSAnPCcpKVxuICB2YXIgb3Bwb3NpdGVEaXJlY3Rpb25zR3JlYXRlclRoYW4gPVxuICAgIGNtcCh0aGlzLnNlbXZlciwgJz4nLCBjb21wLnNlbXZlciwgb3B0aW9ucykgJiZcbiAgICAoKHRoaXMub3BlcmF0b3IgPT09ICc8PScgfHwgdGhpcy5vcGVyYXRvciA9PT0gJzwnKSAmJlxuICAgIChjb21wLm9wZXJhdG9yID09PSAnPj0nIHx8IGNvbXAub3BlcmF0b3IgPT09ICc+JykpXG5cbiAgcmV0dXJuIHNhbWVEaXJlY3Rpb25JbmNyZWFzaW5nIHx8IHNhbWVEaXJlY3Rpb25EZWNyZWFzaW5nIHx8XG4gICAgKHNhbWVTZW1WZXIgJiYgZGlmZmVyZW50RGlyZWN0aW9uc0luY2x1c2l2ZSkgfHxcbiAgICBvcHBvc2l0ZURpcmVjdGlvbnNMZXNzVGhhbiB8fCBvcHBvc2l0ZURpcmVjdGlvbnNHcmVhdGVyVGhhblxufVxuXG5leHBvcnRzLlJhbmdlID0gUmFuZ2VcbmZ1bmN0aW9uIFJhbmdlIChyYW5nZSwgb3B0aW9ucykge1xuICBpZiAoIW9wdGlvbnMgfHwgdHlwZW9mIG9wdGlvbnMgIT09ICdvYmplY3QnKSB7XG4gICAgb3B0aW9ucyA9IHtcbiAgICAgIGxvb3NlOiAhIW9wdGlvbnMsXG4gICAgICBpbmNsdWRlUHJlcmVsZWFzZTogZmFsc2VcbiAgICB9XG4gIH1cblxuICBpZiAocmFuZ2UgaW5zdGFuY2VvZiBSYW5nZSkge1xuICAgIGlmIChyYW5nZS5sb29zZSA9PT0gISFvcHRpb25zLmxvb3NlICYmXG4gICAgICAgIHJhbmdlLmluY2x1ZGVQcmVyZWxlYXNlID09PSAhIW9wdGlvbnMuaW5jbHVkZVByZXJlbGVhc2UpIHtcbiAgICAgIHJldHVybiByYW5nZVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbmV3IFJhbmdlKHJhbmdlLnJhdywgb3B0aW9ucylcbiAgICB9XG4gIH1cblxuICBpZiAocmFuZ2UgaW5zdGFuY2VvZiBDb21wYXJhdG9yKSB7XG4gICAgcmV0dXJuIG5ldyBSYW5nZShyYW5nZS52YWx1ZSwgb3B0aW9ucylcbiAgfVxuXG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBSYW5nZSkpIHtcbiAgICByZXR1cm4gbmV3IFJhbmdlKHJhbmdlLCBvcHRpb25zKVxuICB9XG5cbiAgdGhpcy5vcHRpb25zID0gb3B0aW9uc1xuICB0aGlzLmxvb3NlID0gISFvcHRpb25zLmxvb3NlXG4gIHRoaXMuaW5jbHVkZVByZXJlbGVhc2UgPSAhIW9wdGlvbnMuaW5jbHVkZVByZXJlbGVhc2VcblxuICAvLyBGaXJzdCwgc3BsaXQgYmFzZWQgb24gYm9vbGVhbiBvciB8fFxuICB0aGlzLnJhdyA9IHJhbmdlXG4gIHRoaXMuc2V0ID0gcmFuZ2Uuc3BsaXQoL1xccypcXHxcXHxcXHMqLykubWFwKGZ1bmN0aW9uIChyYW5nZSkge1xuICAgIHJldHVybiB0aGlzLnBhcnNlUmFuZ2UocmFuZ2UudHJpbSgpKVxuICB9LCB0aGlzKS5maWx0ZXIoZnVuY3Rpb24gKGMpIHtcbiAgICAvLyB0aHJvdyBvdXQgYW55IHRoYXQgYXJlIG5vdCByZWxldmFudCBmb3Igd2hhdGV2ZXIgcmVhc29uXG4gICAgcmV0dXJuIGMubGVuZ3RoXG4gIH0pXG5cbiAgaWYgKCF0aGlzLnNldC5sZW5ndGgpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIFNlbVZlciBSYW5nZTogJyArIHJhbmdlKVxuICB9XG5cbiAgdGhpcy5mb3JtYXQoKVxufVxuXG5SYW5nZS5wcm90b3R5cGUuZm9ybWF0ID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLnJhbmdlID0gdGhpcy5zZXQubWFwKGZ1bmN0aW9uIChjb21wcykge1xuICAgIHJldHVybiBjb21wcy5qb2luKCcgJykudHJpbSgpXG4gIH0pLmpvaW4oJ3x8JykudHJpbSgpXG4gIHJldHVybiB0aGlzLnJhbmdlXG59XG5cblJhbmdlLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMucmFuZ2Vcbn1cblxuUmFuZ2UucHJvdG90eXBlLnBhcnNlUmFuZ2UgPSBmdW5jdGlvbiAocmFuZ2UpIHtcbiAgdmFyIGxvb3NlID0gdGhpcy5vcHRpb25zLmxvb3NlXG4gIHJhbmdlID0gcmFuZ2UudHJpbSgpXG4gIC8vIGAxLjIuMyAtIDEuMi40YCA9PiBgPj0xLjIuMyA8PTEuMi40YFxuICB2YXIgaHIgPSBsb29zZSA/IHJlW3QuSFlQSEVOUkFOR0VMT09TRV0gOiByZVt0LkhZUEhFTlJBTkdFXVxuICByYW5nZSA9IHJhbmdlLnJlcGxhY2UoaHIsIGh5cGhlblJlcGxhY2UpXG4gIGRlYnVnKCdoeXBoZW4gcmVwbGFjZScsIHJhbmdlKVxuICAvLyBgPiAxLjIuMyA8IDEuMi41YCA9PiBgPjEuMi4zIDwxLjIuNWBcbiAgcmFuZ2UgPSByYW5nZS5yZXBsYWNlKHJlW3QuQ09NUEFSQVRPUlRSSU1dLCBjb21wYXJhdG9yVHJpbVJlcGxhY2UpXG4gIGRlYnVnKCdjb21wYXJhdG9yIHRyaW0nLCByYW5nZSwgcmVbdC5DT01QQVJBVE9SVFJJTV0pXG5cbiAgLy8gYH4gMS4yLjNgID0+IGB+MS4yLjNgXG4gIHJhbmdlID0gcmFuZ2UucmVwbGFjZShyZVt0LlRJTERFVFJJTV0sIHRpbGRlVHJpbVJlcGxhY2UpXG5cbiAgLy8gYF4gMS4yLjNgID0+IGBeMS4yLjNgXG4gIHJhbmdlID0gcmFuZ2UucmVwbGFjZShyZVt0LkNBUkVUVFJJTV0sIGNhcmV0VHJpbVJlcGxhY2UpXG5cbiAgLy8gbm9ybWFsaXplIHNwYWNlc1xuICByYW5nZSA9IHJhbmdlLnNwbGl0KC9cXHMrLykuam9pbignICcpXG5cbiAgLy8gQXQgdGhpcyBwb2ludCwgdGhlIHJhbmdlIGlzIGNvbXBsZXRlbHkgdHJpbW1lZCBhbmRcbiAgLy8gcmVhZHkgdG8gYmUgc3BsaXQgaW50byBjb21wYXJhdG9ycy5cblxuICB2YXIgY29tcFJlID0gbG9vc2UgPyByZVt0LkNPTVBBUkFUT1JMT09TRV0gOiByZVt0LkNPTVBBUkFUT1JdXG4gIHZhciBzZXQgPSByYW5nZS5zcGxpdCgnICcpLm1hcChmdW5jdGlvbiAoY29tcCkge1xuICAgIHJldHVybiBwYXJzZUNvbXBhcmF0b3IoY29tcCwgdGhpcy5vcHRpb25zKVxuICB9LCB0aGlzKS5qb2luKCcgJykuc3BsaXQoL1xccysvKVxuICBpZiAodGhpcy5vcHRpb25zLmxvb3NlKSB7XG4gICAgLy8gaW4gbG9vc2UgbW9kZSwgdGhyb3cgb3V0IGFueSB0aGF0IGFyZSBub3QgdmFsaWQgY29tcGFyYXRvcnNcbiAgICBzZXQgPSBzZXQuZmlsdGVyKGZ1bmN0aW9uIChjb21wKSB7XG4gICAgICByZXR1cm4gISFjb21wLm1hdGNoKGNvbXBSZSlcbiAgICB9KVxuICB9XG4gIHNldCA9IHNldC5tYXAoZnVuY3Rpb24gKGNvbXApIHtcbiAgICByZXR1cm4gbmV3IENvbXBhcmF0b3IoY29tcCwgdGhpcy5vcHRpb25zKVxuICB9LCB0aGlzKVxuXG4gIHJldHVybiBzZXRcbn1cblxuUmFuZ2UucHJvdG90eXBlLmludGVyc2VjdHMgPSBmdW5jdGlvbiAocmFuZ2UsIG9wdGlvbnMpIHtcbiAgaWYgKCEocmFuZ2UgaW5zdGFuY2VvZiBSYW5nZSkpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdhIFJhbmdlIGlzIHJlcXVpcmVkJylcbiAgfVxuXG4gIHJldHVybiB0aGlzLnNldC5zb21lKGZ1bmN0aW9uICh0aGlzQ29tcGFyYXRvcnMpIHtcbiAgICByZXR1cm4gKFxuICAgICAgaXNTYXRpc2ZpYWJsZSh0aGlzQ29tcGFyYXRvcnMsIG9wdGlvbnMpICYmXG4gICAgICByYW5nZS5zZXQuc29tZShmdW5jdGlvbiAocmFuZ2VDb21wYXJhdG9ycykge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIGlzU2F0aXNmaWFibGUocmFuZ2VDb21wYXJhdG9ycywgb3B0aW9ucykgJiZcbiAgICAgICAgICB0aGlzQ29tcGFyYXRvcnMuZXZlcnkoZnVuY3Rpb24gKHRoaXNDb21wYXJhdG9yKSB7XG4gICAgICAgICAgICByZXR1cm4gcmFuZ2VDb21wYXJhdG9ycy5ldmVyeShmdW5jdGlvbiAocmFuZ2VDb21wYXJhdG9yKSB7XG4gICAgICAgICAgICAgIHJldHVybiB0aGlzQ29tcGFyYXRvci5pbnRlcnNlY3RzKHJhbmdlQ29tcGFyYXRvciwgb3B0aW9ucylcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfSlcbiAgICAgICAgKVxuICAgICAgfSlcbiAgICApXG4gIH0pXG59XG5cbi8vIHRha2UgYSBzZXQgb2YgY29tcGFyYXRvcnMgYW5kIGRldGVybWluZSB3aGV0aGVyIHRoZXJlXG4vLyBleGlzdHMgYSB2ZXJzaW9uIHdoaWNoIGNhbiBzYXRpc2Z5IGl0XG5mdW5jdGlvbiBpc1NhdGlzZmlhYmxlIChjb21wYXJhdG9ycywgb3B0aW9ucykge1xuICB2YXIgcmVzdWx0ID0gdHJ1ZVxuICB2YXIgcmVtYWluaW5nQ29tcGFyYXRvcnMgPSBjb21wYXJhdG9ycy5zbGljZSgpXG4gIHZhciB0ZXN0Q29tcGFyYXRvciA9IHJlbWFpbmluZ0NvbXBhcmF0b3JzLnBvcCgpXG5cbiAgd2hpbGUgKHJlc3VsdCAmJiByZW1haW5pbmdDb21wYXJhdG9ycy5sZW5ndGgpIHtcbiAgICByZXN1bHQgPSByZW1haW5pbmdDb21wYXJhdG9ycy5ldmVyeShmdW5jdGlvbiAob3RoZXJDb21wYXJhdG9yKSB7XG4gICAgICByZXR1cm4gdGVzdENvbXBhcmF0b3IuaW50ZXJzZWN0cyhvdGhlckNvbXBhcmF0b3IsIG9wdGlvbnMpXG4gICAgfSlcblxuICAgIHRlc3RDb21wYXJhdG9yID0gcmVtYWluaW5nQ29tcGFyYXRvcnMucG9wKClcbiAgfVxuXG4gIHJldHVybiByZXN1bHRcbn1cblxuLy8gTW9zdGx5IGp1c3QgZm9yIHRlc3RpbmcgYW5kIGxlZ2FjeSBBUEkgcmVhc29uc1xuZXhwb3J0cy50b0NvbXBhcmF0b3JzID0gdG9Db21wYXJhdG9yc1xuZnVuY3Rpb24gdG9Db21wYXJhdG9ycyAocmFuZ2UsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIG5ldyBSYW5nZShyYW5nZSwgb3B0aW9ucykuc2V0Lm1hcChmdW5jdGlvbiAoY29tcCkge1xuICAgIHJldHVybiBjb21wLm1hcChmdW5jdGlvbiAoYykge1xuICAgICAgcmV0dXJuIGMudmFsdWVcbiAgICB9KS5qb2luKCcgJykudHJpbSgpLnNwbGl0KCcgJylcbiAgfSlcbn1cblxuLy8gY29tcHJpc2VkIG9mIHhyYW5nZXMsIHRpbGRlcywgc3RhcnMsIGFuZCBndGx0J3MgYXQgdGhpcyBwb2ludC5cbi8vIGFscmVhZHkgcmVwbGFjZWQgdGhlIGh5cGhlbiByYW5nZXNcbi8vIHR1cm4gaW50byBhIHNldCBvZiBKVVNUIGNvbXBhcmF0b3JzLlxuZnVuY3Rpb24gcGFyc2VDb21wYXJhdG9yIChjb21wLCBvcHRpb25zKSB7XG4gIGRlYnVnKCdjb21wJywgY29tcCwgb3B0aW9ucylcbiAgY29tcCA9IHJlcGxhY2VDYXJldHMoY29tcCwgb3B0aW9ucylcbiAgZGVidWcoJ2NhcmV0JywgY29tcClcbiAgY29tcCA9IHJlcGxhY2VUaWxkZXMoY29tcCwgb3B0aW9ucylcbiAgZGVidWcoJ3RpbGRlcycsIGNvbXApXG4gIGNvbXAgPSByZXBsYWNlWFJhbmdlcyhjb21wLCBvcHRpb25zKVxuICBkZWJ1ZygneHJhbmdlJywgY29tcClcbiAgY29tcCA9IHJlcGxhY2VTdGFycyhjb21wLCBvcHRpb25zKVxuICBkZWJ1Zygnc3RhcnMnLCBjb21wKVxuICByZXR1cm4gY29tcFxufVxuXG5mdW5jdGlvbiBpc1ggKGlkKSB7XG4gIHJldHVybiAhaWQgfHwgaWQudG9Mb3dlckNhc2UoKSA9PT0gJ3gnIHx8IGlkID09PSAnKidcbn1cblxuLy8gfiwgfj4gLS0+ICogKGFueSwga2luZGEgc2lsbHkpXG4vLyB+MiwgfjIueCwgfjIueC54LCB+PjIsIH4+Mi54IH4+Mi54LnggLS0+ID49Mi4wLjAgPDMuMC4wXG4vLyB+Mi4wLCB+Mi4wLngsIH4+Mi4wLCB+PjIuMC54IC0tPiA+PTIuMC4wIDwyLjEuMFxuLy8gfjEuMiwgfjEuMi54LCB+PjEuMiwgfj4xLjIueCAtLT4gPj0xLjIuMCA8MS4zLjBcbi8vIH4xLjIuMywgfj4xLjIuMyAtLT4gPj0xLjIuMyA8MS4zLjBcbi8vIH4xLjIuMCwgfj4xLjIuMCAtLT4gPj0xLjIuMCA8MS4zLjBcbmZ1bmN0aW9uIHJlcGxhY2VUaWxkZXMgKGNvbXAsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIGNvbXAudHJpbSgpLnNwbGl0KC9cXHMrLykubWFwKGZ1bmN0aW9uIChjb21wKSB7XG4gICAgcmV0dXJuIHJlcGxhY2VUaWxkZShjb21wLCBvcHRpb25zKVxuICB9KS5qb2luKCcgJylcbn1cblxuZnVuY3Rpb24gcmVwbGFjZVRpbGRlIChjb21wLCBvcHRpb25zKSB7XG4gIHZhciByID0gb3B0aW9ucy5sb29zZSA/IHJlW3QuVElMREVMT09TRV0gOiByZVt0LlRJTERFXVxuICByZXR1cm4gY29tcC5yZXBsYWNlKHIsIGZ1bmN0aW9uIChfLCBNLCBtLCBwLCBwcikge1xuICAgIGRlYnVnKCd0aWxkZScsIGNvbXAsIF8sIE0sIG0sIHAsIHByKVxuICAgIHZhciByZXRcblxuICAgIGlmIChpc1goTSkpIHtcbiAgICAgIHJldCA9ICcnXG4gICAgfSBlbHNlIGlmIChpc1gobSkpIHtcbiAgICAgIHJldCA9ICc+PScgKyBNICsgJy4wLjAgPCcgKyAoK00gKyAxKSArICcuMC4wJ1xuICAgIH0gZWxzZSBpZiAoaXNYKHApKSB7XG4gICAgICAvLyB+MS4yID09ID49MS4yLjAgPDEuMy4wXG4gICAgICByZXQgPSAnPj0nICsgTSArICcuJyArIG0gKyAnLjAgPCcgKyBNICsgJy4nICsgKCttICsgMSkgKyAnLjAnXG4gICAgfSBlbHNlIGlmIChwcikge1xuICAgICAgZGVidWcoJ3JlcGxhY2VUaWxkZSBwcicsIHByKVxuICAgICAgcmV0ID0gJz49JyArIE0gKyAnLicgKyBtICsgJy4nICsgcCArICctJyArIHByICtcbiAgICAgICAgICAgICcgPCcgKyBNICsgJy4nICsgKCttICsgMSkgKyAnLjAnXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIH4xLjIuMyA9PSA+PTEuMi4zIDwxLjMuMFxuICAgICAgcmV0ID0gJz49JyArIE0gKyAnLicgKyBtICsgJy4nICsgcCArXG4gICAgICAgICAgICAnIDwnICsgTSArICcuJyArICgrbSArIDEpICsgJy4wJ1xuICAgIH1cblxuICAgIGRlYnVnKCd0aWxkZSByZXR1cm4nLCByZXQpXG4gICAgcmV0dXJuIHJldFxuICB9KVxufVxuXG4vLyBeIC0tPiAqIChhbnksIGtpbmRhIHNpbGx5KVxuLy8gXjIsIF4yLngsIF4yLngueCAtLT4gPj0yLjAuMCA8My4wLjBcbi8vIF4yLjAsIF4yLjAueCAtLT4gPj0yLjAuMCA8My4wLjBcbi8vIF4xLjIsIF4xLjIueCAtLT4gPj0xLjIuMCA8Mi4wLjBcbi8vIF4xLjIuMyAtLT4gPj0xLjIuMyA8Mi4wLjBcbi8vIF4xLjIuMCAtLT4gPj0xLjIuMCA8Mi4wLjBcbmZ1bmN0aW9uIHJlcGxhY2VDYXJldHMgKGNvbXAsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIGNvbXAudHJpbSgpLnNwbGl0KC9cXHMrLykubWFwKGZ1bmN0aW9uIChjb21wKSB7XG4gICAgcmV0dXJuIHJlcGxhY2VDYXJldChjb21wLCBvcHRpb25zKVxuICB9KS5qb2luKCcgJylcbn1cblxuZnVuY3Rpb24gcmVwbGFjZUNhcmV0IChjb21wLCBvcHRpb25zKSB7XG4gIGRlYnVnKCdjYXJldCcsIGNvbXAsIG9wdGlvbnMpXG4gIHZhciByID0gb3B0aW9ucy5sb29zZSA/IHJlW3QuQ0FSRVRMT09TRV0gOiByZVt0LkNBUkVUXVxuICByZXR1cm4gY29tcC5yZXBsYWNlKHIsIGZ1bmN0aW9uIChfLCBNLCBtLCBwLCBwcikge1xuICAgIGRlYnVnKCdjYXJldCcsIGNvbXAsIF8sIE0sIG0sIHAsIHByKVxuICAgIHZhciByZXRcblxuICAgIGlmIChpc1goTSkpIHtcbiAgICAgIHJldCA9ICcnXG4gICAgfSBlbHNlIGlmIChpc1gobSkpIHtcbiAgICAgIHJldCA9ICc+PScgKyBNICsgJy4wLjAgPCcgKyAoK00gKyAxKSArICcuMC4wJ1xuICAgIH0gZWxzZSBpZiAoaXNYKHApKSB7XG4gICAgICBpZiAoTSA9PT0gJzAnKSB7XG4gICAgICAgIHJldCA9ICc+PScgKyBNICsgJy4nICsgbSArICcuMCA8JyArIE0gKyAnLicgKyAoK20gKyAxKSArICcuMCdcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldCA9ICc+PScgKyBNICsgJy4nICsgbSArICcuMCA8JyArICgrTSArIDEpICsgJy4wLjAnXG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChwcikge1xuICAgICAgZGVidWcoJ3JlcGxhY2VDYXJldCBwcicsIHByKVxuICAgICAgaWYgKE0gPT09ICcwJykge1xuICAgICAgICBpZiAobSA9PT0gJzAnKSB7XG4gICAgICAgICAgcmV0ID0gJz49JyArIE0gKyAnLicgKyBtICsgJy4nICsgcCArICctJyArIHByICtcbiAgICAgICAgICAgICAgICAnIDwnICsgTSArICcuJyArIG0gKyAnLicgKyAoK3AgKyAxKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldCA9ICc+PScgKyBNICsgJy4nICsgbSArICcuJyArIHAgKyAnLScgKyBwciArXG4gICAgICAgICAgICAgICAgJyA8JyArIE0gKyAnLicgKyAoK20gKyAxKSArICcuMCdcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0ID0gJz49JyArIE0gKyAnLicgKyBtICsgJy4nICsgcCArICctJyArIHByICtcbiAgICAgICAgICAgICAgJyA8JyArICgrTSArIDEpICsgJy4wLjAnXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlYnVnKCdubyBwcicpXG4gICAgICBpZiAoTSA9PT0gJzAnKSB7XG4gICAgICAgIGlmIChtID09PSAnMCcpIHtcbiAgICAgICAgICByZXQgPSAnPj0nICsgTSArICcuJyArIG0gKyAnLicgKyBwICtcbiAgICAgICAgICAgICAgICAnIDwnICsgTSArICcuJyArIG0gKyAnLicgKyAoK3AgKyAxKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldCA9ICc+PScgKyBNICsgJy4nICsgbSArICcuJyArIHAgK1xuICAgICAgICAgICAgICAgICcgPCcgKyBNICsgJy4nICsgKCttICsgMSkgKyAnLjAnXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldCA9ICc+PScgKyBNICsgJy4nICsgbSArICcuJyArIHAgK1xuICAgICAgICAgICAgICAnIDwnICsgKCtNICsgMSkgKyAnLjAuMCdcbiAgICAgIH1cbiAgICB9XG5cbiAgICBkZWJ1ZygnY2FyZXQgcmV0dXJuJywgcmV0KVxuICAgIHJldHVybiByZXRcbiAgfSlcbn1cblxuZnVuY3Rpb24gcmVwbGFjZVhSYW5nZXMgKGNvbXAsIG9wdGlvbnMpIHtcbiAgZGVidWcoJ3JlcGxhY2VYUmFuZ2VzJywgY29tcCwgb3B0aW9ucylcbiAgcmV0dXJuIGNvbXAuc3BsaXQoL1xccysvKS5tYXAoZnVuY3Rpb24gKGNvbXApIHtcbiAgICByZXR1cm4gcmVwbGFjZVhSYW5nZShjb21wLCBvcHRpb25zKVxuICB9KS5qb2luKCcgJylcbn1cblxuZnVuY3Rpb24gcmVwbGFjZVhSYW5nZSAoY29tcCwgb3B0aW9ucykge1xuICBjb21wID0gY29tcC50cmltKClcbiAgdmFyIHIgPSBvcHRpb25zLmxvb3NlID8gcmVbdC5YUkFOR0VMT09TRV0gOiByZVt0LlhSQU5HRV1cbiAgcmV0dXJuIGNvbXAucmVwbGFjZShyLCBmdW5jdGlvbiAocmV0LCBndGx0LCBNLCBtLCBwLCBwcikge1xuICAgIGRlYnVnKCd4UmFuZ2UnLCBjb21wLCByZXQsIGd0bHQsIE0sIG0sIHAsIHByKVxuICAgIHZhciB4TSA9IGlzWChNKVxuICAgIHZhciB4bSA9IHhNIHx8IGlzWChtKVxuICAgIHZhciB4cCA9IHhtIHx8IGlzWChwKVxuICAgIHZhciBhbnlYID0geHBcblxuICAgIGlmIChndGx0ID09PSAnPScgJiYgYW55WCkge1xuICAgICAgZ3RsdCA9ICcnXG4gICAgfVxuXG4gICAgLy8gaWYgd2UncmUgaW5jbHVkaW5nIHByZXJlbGVhc2VzIGluIHRoZSBtYXRjaCwgdGhlbiB3ZSBuZWVkXG4gICAgLy8gdG8gZml4IHRoaXMgdG8gLTAsIHRoZSBsb3dlc3QgcG9zc2libGUgcHJlcmVsZWFzZSB2YWx1ZVxuICAgIHByID0gb3B0aW9ucy5pbmNsdWRlUHJlcmVsZWFzZSA/ICctMCcgOiAnJ1xuXG4gICAgaWYgKHhNKSB7XG4gICAgICBpZiAoZ3RsdCA9PT0gJz4nIHx8IGd0bHQgPT09ICc8Jykge1xuICAgICAgICAvLyBub3RoaW5nIGlzIGFsbG93ZWRcbiAgICAgICAgcmV0ID0gJzwwLjAuMC0wJ1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gbm90aGluZyBpcyBmb3JiaWRkZW5cbiAgICAgICAgcmV0ID0gJyonXG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChndGx0ICYmIGFueVgpIHtcbiAgICAgIC8vIHdlIGtub3cgcGF0Y2ggaXMgYW4geCwgYmVjYXVzZSB3ZSBoYXZlIGFueSB4IGF0IGFsbC5cbiAgICAgIC8vIHJlcGxhY2UgWCB3aXRoIDBcbiAgICAgIGlmICh4bSkge1xuICAgICAgICBtID0gMFxuICAgICAgfVxuICAgICAgcCA9IDBcblxuICAgICAgaWYgKGd0bHQgPT09ICc+Jykge1xuICAgICAgICAvLyA+MSA9PiA+PTIuMC4wXG4gICAgICAgIC8vID4xLjIgPT4gPj0xLjMuMFxuICAgICAgICAvLyA+MS4yLjMgPT4gPj0gMS4yLjRcbiAgICAgICAgZ3RsdCA9ICc+PSdcbiAgICAgICAgaWYgKHhtKSB7XG4gICAgICAgICAgTSA9ICtNICsgMVxuICAgICAgICAgIG0gPSAwXG4gICAgICAgICAgcCA9IDBcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBtID0gK20gKyAxXG4gICAgICAgICAgcCA9IDBcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChndGx0ID09PSAnPD0nKSB7XG4gICAgICAgIC8vIDw9MC43LnggaXMgYWN0dWFsbHkgPDAuOC4wLCBzaW5jZSBhbnkgMC43Lnggc2hvdWxkXG4gICAgICAgIC8vIHBhc3MuICBTaW1pbGFybHksIDw9Ny54IGlzIGFjdHVhbGx5IDw4LjAuMCwgZXRjLlxuICAgICAgICBndGx0ID0gJzwnXG4gICAgICAgIGlmICh4bSkge1xuICAgICAgICAgIE0gPSArTSArIDFcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBtID0gK20gKyAxXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0ID0gZ3RsdCArIE0gKyAnLicgKyBtICsgJy4nICsgcCArIHByXG4gICAgfSBlbHNlIGlmICh4bSkge1xuICAgICAgcmV0ID0gJz49JyArIE0gKyAnLjAuMCcgKyBwciArICcgPCcgKyAoK00gKyAxKSArICcuMC4wJyArIHByXG4gICAgfSBlbHNlIGlmICh4cCkge1xuICAgICAgcmV0ID0gJz49JyArIE0gKyAnLicgKyBtICsgJy4wJyArIHByICtcbiAgICAgICAgJyA8JyArIE0gKyAnLicgKyAoK20gKyAxKSArICcuMCcgKyBwclxuICAgIH1cblxuICAgIGRlYnVnKCd4UmFuZ2UgcmV0dXJuJywgcmV0KVxuXG4gICAgcmV0dXJuIHJldFxuICB9KVxufVxuXG4vLyBCZWNhdXNlICogaXMgQU5ELWVkIHdpdGggZXZlcnl0aGluZyBlbHNlIGluIHRoZSBjb21wYXJhdG9yLFxuLy8gYW5kICcnIG1lYW5zIFwiYW55IHZlcnNpb25cIiwganVzdCByZW1vdmUgdGhlICpzIGVudGlyZWx5LlxuZnVuY3Rpb24gcmVwbGFjZVN0YXJzIChjb21wLCBvcHRpb25zKSB7XG4gIGRlYnVnKCdyZXBsYWNlU3RhcnMnLCBjb21wLCBvcHRpb25zKVxuICAvLyBMb29zZW5lc3MgaXMgaWdub3JlZCBoZXJlLiAgc3RhciBpcyBhbHdheXMgYXMgbG9vc2UgYXMgaXQgZ2V0cyFcbiAgcmV0dXJuIGNvbXAudHJpbSgpLnJlcGxhY2UocmVbdC5TVEFSXSwgJycpXG59XG5cbi8vIFRoaXMgZnVuY3Rpb24gaXMgcGFzc2VkIHRvIHN0cmluZy5yZXBsYWNlKHJlW3QuSFlQSEVOUkFOR0VdKVxuLy8gTSwgbSwgcGF0Y2gsIHByZXJlbGVhc2UsIGJ1aWxkXG4vLyAxLjIgLSAzLjQuNSA9PiA+PTEuMi4wIDw9My40LjVcbi8vIDEuMi4zIC0gMy40ID0+ID49MS4yLjAgPDMuNS4wIEFueSAzLjQueCB3aWxsIGRvXG4vLyAxLjIgLSAzLjQgPT4gPj0xLjIuMCA8My41LjBcbmZ1bmN0aW9uIGh5cGhlblJlcGxhY2UgKCQwLFxuICBmcm9tLCBmTSwgZm0sIGZwLCBmcHIsIGZiLFxuICB0bywgdE0sIHRtLCB0cCwgdHByLCB0Yikge1xuICBpZiAoaXNYKGZNKSkge1xuICAgIGZyb20gPSAnJ1xuICB9IGVsc2UgaWYgKGlzWChmbSkpIHtcbiAgICBmcm9tID0gJz49JyArIGZNICsgJy4wLjAnXG4gIH0gZWxzZSBpZiAoaXNYKGZwKSkge1xuICAgIGZyb20gPSAnPj0nICsgZk0gKyAnLicgKyBmbSArICcuMCdcbiAgfSBlbHNlIHtcbiAgICBmcm9tID0gJz49JyArIGZyb21cbiAgfVxuXG4gIGlmIChpc1godE0pKSB7XG4gICAgdG8gPSAnJ1xuICB9IGVsc2UgaWYgKGlzWCh0bSkpIHtcbiAgICB0byA9ICc8JyArICgrdE0gKyAxKSArICcuMC4wJ1xuICB9IGVsc2UgaWYgKGlzWCh0cCkpIHtcbiAgICB0byA9ICc8JyArIHRNICsgJy4nICsgKCt0bSArIDEpICsgJy4wJ1xuICB9IGVsc2UgaWYgKHRwcikge1xuICAgIHRvID0gJzw9JyArIHRNICsgJy4nICsgdG0gKyAnLicgKyB0cCArICctJyArIHRwclxuICB9IGVsc2Uge1xuICAgIHRvID0gJzw9JyArIHRvXG4gIH1cblxuICByZXR1cm4gKGZyb20gKyAnICcgKyB0bykudHJpbSgpXG59XG5cbi8vIGlmIEFOWSBvZiB0aGUgc2V0cyBtYXRjaCBBTEwgb2YgaXRzIGNvbXBhcmF0b3JzLCB0aGVuIHBhc3NcblJhbmdlLnByb3RvdHlwZS50ZXN0ID0gZnVuY3Rpb24gKHZlcnNpb24pIHtcbiAgaWYgKCF2ZXJzaW9uKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICBpZiAodHlwZW9mIHZlcnNpb24gPT09ICdzdHJpbmcnKSB7XG4gICAgdHJ5IHtcbiAgICAgIHZlcnNpb24gPSBuZXcgU2VtVmVyKHZlcnNpb24sIHRoaXMub3B0aW9ucylcbiAgICB9IGNhdGNoIChlcikge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnNldC5sZW5ndGg7IGkrKykge1xuICAgIGlmICh0ZXN0U2V0KHRoaXMuc2V0W2ldLCB2ZXJzaW9uLCB0aGlzLm9wdGlvbnMpKSB7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2Vcbn1cblxuZnVuY3Rpb24gdGVzdFNldCAoc2V0LCB2ZXJzaW9uLCBvcHRpb25zKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc2V0Lmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKCFzZXRbaV0udGVzdCh2ZXJzaW9uKSkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG5cbiAgaWYgKHZlcnNpb24ucHJlcmVsZWFzZS5sZW5ndGggJiYgIW9wdGlvbnMuaW5jbHVkZVByZXJlbGVhc2UpIHtcbiAgICAvLyBGaW5kIHRoZSBzZXQgb2YgdmVyc2lvbnMgdGhhdCBhcmUgYWxsb3dlZCB0byBoYXZlIHByZXJlbGVhc2VzXG4gICAgLy8gRm9yIGV4YW1wbGUsIF4xLjIuMy1wci4xIGRlc3VnYXJzIHRvID49MS4yLjMtcHIuMSA8Mi4wLjBcbiAgICAvLyBUaGF0IHNob3VsZCBhbGxvdyBgMS4yLjMtcHIuMmAgdG8gcGFzcy5cbiAgICAvLyBIb3dldmVyLCBgMS4yLjQtYWxwaGEubm90cmVhZHlgIHNob3VsZCBOT1QgYmUgYWxsb3dlZCxcbiAgICAvLyBldmVuIHRob3VnaCBpdCdzIHdpdGhpbiB0aGUgcmFuZ2Ugc2V0IGJ5IHRoZSBjb21wYXJhdG9ycy5cbiAgICBmb3IgKGkgPSAwOyBpIDwgc2V0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICBkZWJ1ZyhzZXRbaV0uc2VtdmVyKVxuICAgICAgaWYgKHNldFtpXS5zZW12ZXIgPT09IEFOWSkge1xuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICBpZiAoc2V0W2ldLnNlbXZlci5wcmVyZWxlYXNlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdmFyIGFsbG93ZWQgPSBzZXRbaV0uc2VtdmVyXG4gICAgICAgIGlmIChhbGxvd2VkLm1ham9yID09PSB2ZXJzaW9uLm1ham9yICYmXG4gICAgICAgICAgICBhbGxvd2VkLm1pbm9yID09PSB2ZXJzaW9uLm1pbm9yICYmXG4gICAgICAgICAgICBhbGxvd2VkLnBhdGNoID09PSB2ZXJzaW9uLnBhdGNoKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFZlcnNpb24gaGFzIGEgLXByZSwgYnV0IGl0J3Mgbm90IG9uZSBvZiB0aGUgb25lcyB3ZSBsaWtlLlxuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgcmV0dXJuIHRydWVcbn1cblxuZXhwb3J0cy5zYXRpc2ZpZXMgPSBzYXRpc2ZpZXNcbmZ1bmN0aW9uIHNhdGlzZmllcyAodmVyc2lvbiwgcmFuZ2UsIG9wdGlvbnMpIHtcbiAgdHJ5IHtcbiAgICByYW5nZSA9IG5ldyBSYW5nZShyYW5nZSwgb3B0aW9ucylcbiAgfSBjYXRjaCAoZXIpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuICByZXR1cm4gcmFuZ2UudGVzdCh2ZXJzaW9uKVxufVxuXG5leHBvcnRzLm1heFNhdGlzZnlpbmcgPSBtYXhTYXRpc2Z5aW5nXG5mdW5jdGlvbiBtYXhTYXRpc2Z5aW5nICh2ZXJzaW9ucywgcmFuZ2UsIG9wdGlvbnMpIHtcbiAgdmFyIG1heCA9IG51bGxcbiAgdmFyIG1heFNWID0gbnVsbFxuICB0cnkge1xuICAgIHZhciByYW5nZU9iaiA9IG5ldyBSYW5nZShyYW5nZSwgb3B0aW9ucylcbiAgfSBjYXRjaCAoZXIpIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG4gIHZlcnNpb25zLmZvckVhY2goZnVuY3Rpb24gKHYpIHtcbiAgICBpZiAocmFuZ2VPYmoudGVzdCh2KSkge1xuICAgICAgLy8gc2F0aXNmaWVzKHYsIHJhbmdlLCBvcHRpb25zKVxuICAgICAgaWYgKCFtYXggfHwgbWF4U1YuY29tcGFyZSh2KSA9PT0gLTEpIHtcbiAgICAgICAgLy8gY29tcGFyZShtYXgsIHYsIHRydWUpXG4gICAgICAgIG1heCA9IHZcbiAgICAgICAgbWF4U1YgPSBuZXcgU2VtVmVyKG1heCwgb3B0aW9ucylcbiAgICAgIH1cbiAgICB9XG4gIH0pXG4gIHJldHVybiBtYXhcbn1cblxuZXhwb3J0cy5taW5TYXRpc2Z5aW5nID0gbWluU2F0aXNmeWluZ1xuZnVuY3Rpb24gbWluU2F0aXNmeWluZyAodmVyc2lvbnMsIHJhbmdlLCBvcHRpb25zKSB7XG4gIHZhciBtaW4gPSBudWxsXG4gIHZhciBtaW5TViA9IG51bGxcbiAgdHJ5IHtcbiAgICB2YXIgcmFuZ2VPYmogPSBuZXcgUmFuZ2UocmFuZ2UsIG9wdGlvbnMpXG4gIH0gY2F0Y2ggKGVyKSB7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuICB2ZXJzaW9ucy5mb3JFYWNoKGZ1bmN0aW9uICh2KSB7XG4gICAgaWYgKHJhbmdlT2JqLnRlc3QodikpIHtcbiAgICAgIC8vIHNhdGlzZmllcyh2LCByYW5nZSwgb3B0aW9ucylcbiAgICAgIGlmICghbWluIHx8IG1pblNWLmNvbXBhcmUodikgPT09IDEpIHtcbiAgICAgICAgLy8gY29tcGFyZShtaW4sIHYsIHRydWUpXG4gICAgICAgIG1pbiA9IHZcbiAgICAgICAgbWluU1YgPSBuZXcgU2VtVmVyKG1pbiwgb3B0aW9ucylcbiAgICAgIH1cbiAgICB9XG4gIH0pXG4gIHJldHVybiBtaW5cbn1cblxuZXhwb3J0cy5taW5WZXJzaW9uID0gbWluVmVyc2lvblxuZnVuY3Rpb24gbWluVmVyc2lvbiAocmFuZ2UsIGxvb3NlKSB7XG4gIHJhbmdlID0gbmV3IFJhbmdlKHJhbmdlLCBsb29zZSlcblxuICB2YXIgbWludmVyID0gbmV3IFNlbVZlcignMC4wLjAnKVxuICBpZiAocmFuZ2UudGVzdChtaW52ZXIpKSB7XG4gICAgcmV0dXJuIG1pbnZlclxuICB9XG5cbiAgbWludmVyID0gbmV3IFNlbVZlcignMC4wLjAtMCcpXG4gIGlmIChyYW5nZS50ZXN0KG1pbnZlcikpIHtcbiAgICByZXR1cm4gbWludmVyXG4gIH1cblxuICBtaW52ZXIgPSBudWxsXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcmFuZ2Uuc2V0Lmxlbmd0aDsgKytpKSB7XG4gICAgdmFyIGNvbXBhcmF0b3JzID0gcmFuZ2Uuc2V0W2ldXG5cbiAgICBjb21wYXJhdG9ycy5mb3JFYWNoKGZ1bmN0aW9uIChjb21wYXJhdG9yKSB7XG4gICAgICAvLyBDbG9uZSB0byBhdm9pZCBtYW5pcHVsYXRpbmcgdGhlIGNvbXBhcmF0b3IncyBzZW12ZXIgb2JqZWN0LlxuICAgICAgdmFyIGNvbXB2ZXIgPSBuZXcgU2VtVmVyKGNvbXBhcmF0b3Iuc2VtdmVyLnZlcnNpb24pXG4gICAgICBzd2l0Y2ggKGNvbXBhcmF0b3Iub3BlcmF0b3IpIHtcbiAgICAgICAgY2FzZSAnPic6XG4gICAgICAgICAgaWYgKGNvbXB2ZXIucHJlcmVsZWFzZS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGNvbXB2ZXIucGF0Y2grK1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb21wdmVyLnByZXJlbGVhc2UucHVzaCgwKVxuICAgICAgICAgIH1cbiAgICAgICAgICBjb21wdmVyLnJhdyA9IGNvbXB2ZXIuZm9ybWF0KClcbiAgICAgICAgICAvKiBmYWxsdGhyb3VnaCAqL1xuICAgICAgICBjYXNlICcnOlxuICAgICAgICBjYXNlICc+PSc6XG4gICAgICAgICAgaWYgKCFtaW52ZXIgfHwgZ3QobWludmVyLCBjb21wdmVyKSkge1xuICAgICAgICAgICAgbWludmVyID0gY29tcHZlclxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlICc8JzpcbiAgICAgICAgY2FzZSAnPD0nOlxuICAgICAgICAgIC8qIElnbm9yZSBtYXhpbXVtIHZlcnNpb25zICovXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VuZXhwZWN0ZWQgb3BlcmF0aW9uOiAnICsgY29tcGFyYXRvci5vcGVyYXRvcilcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgaWYgKG1pbnZlciAmJiByYW5nZS50ZXN0KG1pbnZlcikpIHtcbiAgICByZXR1cm4gbWludmVyXG4gIH1cblxuICByZXR1cm4gbnVsbFxufVxuXG5leHBvcnRzLnZhbGlkUmFuZ2UgPSB2YWxpZFJhbmdlXG5mdW5jdGlvbiB2YWxpZFJhbmdlIChyYW5nZSwgb3B0aW9ucykge1xuICB0cnkge1xuICAgIC8vIFJldHVybiAnKicgaW5zdGVhZCBvZiAnJyBzbyB0aGF0IHRydXRoaW5lc3Mgd29ya3MuXG4gICAgLy8gVGhpcyB3aWxsIHRocm93IGlmIGl0J3MgaW52YWxpZCBhbnl3YXlcbiAgICByZXR1cm4gbmV3IFJhbmdlKHJhbmdlLCBvcHRpb25zKS5yYW5nZSB8fCAnKidcbiAgfSBjYXRjaCAoZXIpIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG59XG5cbi8vIERldGVybWluZSBpZiB2ZXJzaW9uIGlzIGxlc3MgdGhhbiBhbGwgdGhlIHZlcnNpb25zIHBvc3NpYmxlIGluIHRoZSByYW5nZVxuZXhwb3J0cy5sdHIgPSBsdHJcbmZ1bmN0aW9uIGx0ciAodmVyc2lvbiwgcmFuZ2UsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIG91dHNpZGUodmVyc2lvbiwgcmFuZ2UsICc8Jywgb3B0aW9ucylcbn1cblxuLy8gRGV0ZXJtaW5lIGlmIHZlcnNpb24gaXMgZ3JlYXRlciB0aGFuIGFsbCB0aGUgdmVyc2lvbnMgcG9zc2libGUgaW4gdGhlIHJhbmdlLlxuZXhwb3J0cy5ndHIgPSBndHJcbmZ1bmN0aW9uIGd0ciAodmVyc2lvbiwgcmFuZ2UsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIG91dHNpZGUodmVyc2lvbiwgcmFuZ2UsICc+Jywgb3B0aW9ucylcbn1cblxuZXhwb3J0cy5vdXRzaWRlID0gb3V0c2lkZVxuZnVuY3Rpb24gb3V0c2lkZSAodmVyc2lvbiwgcmFuZ2UsIGhpbG8sIG9wdGlvbnMpIHtcbiAgdmVyc2lvbiA9IG5ldyBTZW1WZXIodmVyc2lvbiwgb3B0aW9ucylcbiAgcmFuZ2UgPSBuZXcgUmFuZ2UocmFuZ2UsIG9wdGlvbnMpXG5cbiAgdmFyIGd0Zm4sIGx0ZWZuLCBsdGZuLCBjb21wLCBlY29tcFxuICBzd2l0Y2ggKGhpbG8pIHtcbiAgICBjYXNlICc+JzpcbiAgICAgIGd0Zm4gPSBndFxuICAgICAgbHRlZm4gPSBsdGVcbiAgICAgIGx0Zm4gPSBsdFxuICAgICAgY29tcCA9ICc+J1xuICAgICAgZWNvbXAgPSAnPj0nXG4gICAgICBicmVha1xuICAgIGNhc2UgJzwnOlxuICAgICAgZ3RmbiA9IGx0XG4gICAgICBsdGVmbiA9IGd0ZVxuICAgICAgbHRmbiA9IGd0XG4gICAgICBjb21wID0gJzwnXG4gICAgICBlY29tcCA9ICc8PSdcbiAgICAgIGJyZWFrXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ011c3QgcHJvdmlkZSBhIGhpbG8gdmFsIG9mIFwiPFwiIG9yIFwiPlwiJylcbiAgfVxuXG4gIC8vIElmIGl0IHNhdGlzaWZlcyB0aGUgcmFuZ2UgaXQgaXMgbm90IG91dHNpZGVcbiAgaWYgKHNhdGlzZmllcyh2ZXJzaW9uLCByYW5nZSwgb3B0aW9ucykpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIC8vIEZyb20gbm93IG9uLCB2YXJpYWJsZSB0ZXJtcyBhcmUgYXMgaWYgd2UncmUgaW4gXCJndHJcIiBtb2RlLlxuICAvLyBidXQgbm90ZSB0aGF0IGV2ZXJ5dGhpbmcgaXMgZmxpcHBlZCBmb3IgdGhlIFwibHRyXCIgZnVuY3Rpb24uXG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCByYW5nZS5zZXQubGVuZ3RoOyArK2kpIHtcbiAgICB2YXIgY29tcGFyYXRvcnMgPSByYW5nZS5zZXRbaV1cblxuICAgIHZhciBoaWdoID0gbnVsbFxuICAgIHZhciBsb3cgPSBudWxsXG5cbiAgICBjb21wYXJhdG9ycy5mb3JFYWNoKGZ1bmN0aW9uIChjb21wYXJhdG9yKSB7XG4gICAgICBpZiAoY29tcGFyYXRvci5zZW12ZXIgPT09IEFOWSkge1xuICAgICAgICBjb21wYXJhdG9yID0gbmV3IENvbXBhcmF0b3IoJz49MC4wLjAnKVxuICAgICAgfVxuICAgICAgaGlnaCA9IGhpZ2ggfHwgY29tcGFyYXRvclxuICAgICAgbG93ID0gbG93IHx8IGNvbXBhcmF0b3JcbiAgICAgIGlmIChndGZuKGNvbXBhcmF0b3Iuc2VtdmVyLCBoaWdoLnNlbXZlciwgb3B0aW9ucykpIHtcbiAgICAgICAgaGlnaCA9IGNvbXBhcmF0b3JcbiAgICAgIH0gZWxzZSBpZiAobHRmbihjb21wYXJhdG9yLnNlbXZlciwgbG93LnNlbXZlciwgb3B0aW9ucykpIHtcbiAgICAgICAgbG93ID0gY29tcGFyYXRvclxuICAgICAgfVxuICAgIH0pXG5cbiAgICAvLyBJZiB0aGUgZWRnZSB2ZXJzaW9uIGNvbXBhcmF0b3IgaGFzIGEgb3BlcmF0b3IgdGhlbiBvdXIgdmVyc2lvblxuICAgIC8vIGlzbid0IG91dHNpZGUgaXRcbiAgICBpZiAoaGlnaC5vcGVyYXRvciA9PT0gY29tcCB8fCBoaWdoLm9wZXJhdG9yID09PSBlY29tcCkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIGxvd2VzdCB2ZXJzaW9uIGNvbXBhcmF0b3IgaGFzIGFuIG9wZXJhdG9yIGFuZCBvdXIgdmVyc2lvblxuICAgIC8vIGlzIGxlc3MgdGhhbiBpdCB0aGVuIGl0IGlzbid0IGhpZ2hlciB0aGFuIHRoZSByYW5nZVxuICAgIGlmICgoIWxvdy5vcGVyYXRvciB8fCBsb3cub3BlcmF0b3IgPT09IGNvbXApICYmXG4gICAgICAgIGx0ZWZuKHZlcnNpb24sIGxvdy5zZW12ZXIpKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9IGVsc2UgaWYgKGxvdy5vcGVyYXRvciA9PT0gZWNvbXAgJiYgbHRmbih2ZXJzaW9uLCBsb3cuc2VtdmVyKSkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG4gIHJldHVybiB0cnVlXG59XG5cbmV4cG9ydHMucHJlcmVsZWFzZSA9IHByZXJlbGVhc2VcbmZ1bmN0aW9uIHByZXJlbGVhc2UgKHZlcnNpb24sIG9wdGlvbnMpIHtcbiAgdmFyIHBhcnNlZCA9IHBhcnNlKHZlcnNpb24sIG9wdGlvbnMpXG4gIHJldHVybiAocGFyc2VkICYmIHBhcnNlZC5wcmVyZWxlYXNlLmxlbmd0aCkgPyBwYXJzZWQucHJlcmVsZWFzZSA6IG51bGxcbn1cblxuZXhwb3J0cy5pbnRlcnNlY3RzID0gaW50ZXJzZWN0c1xuZnVuY3Rpb24gaW50ZXJzZWN0cyAocjEsIHIyLCBvcHRpb25zKSB7XG4gIHIxID0gbmV3IFJhbmdlKHIxLCBvcHRpb25zKVxuICByMiA9IG5ldyBSYW5nZShyMiwgb3B0aW9ucylcbiAgcmV0dXJuIHIxLmludGVyc2VjdHMocjIpXG59XG5cbmV4cG9ydHMuY29lcmNlID0gY29lcmNlXG5mdW5jdGlvbiBjb2VyY2UgKHZlcnNpb24sIG9wdGlvbnMpIHtcbiAgaWYgKHZlcnNpb24gaW5zdGFuY2VvZiBTZW1WZXIpIHtcbiAgICByZXR1cm4gdmVyc2lvblxuICB9XG5cbiAgaWYgKHR5cGVvZiB2ZXJzaW9uID09PSAnbnVtYmVyJykge1xuICAgIHZlcnNpb24gPSBTdHJpbmcodmVyc2lvbilcbiAgfVxuXG4gIGlmICh0eXBlb2YgdmVyc2lvbiAhPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cblxuICB2YXIgbWF0Y2ggPSBudWxsXG4gIGlmICghb3B0aW9ucy5ydGwpIHtcbiAgICBtYXRjaCA9IHZlcnNpb24ubWF0Y2gocmVbdC5DT0VSQ0VdKVxuICB9IGVsc2Uge1xuICAgIC8vIEZpbmQgdGhlIHJpZ2h0LW1vc3QgY29lcmNpYmxlIHN0cmluZyB0aGF0IGRvZXMgbm90IHNoYXJlXG4gICAgLy8gYSB0ZXJtaW51cyB3aXRoIGEgbW9yZSBsZWZ0LXdhcmQgY29lcmNpYmxlIHN0cmluZy5cbiAgICAvLyBFZywgJzEuMi4zLjQnIHdhbnRzIHRvIGNvZXJjZSAnMi4zLjQnLCBub3QgJzMuNCcgb3IgJzQnXG4gICAgLy9cbiAgICAvLyBXYWxrIHRocm91Z2ggdGhlIHN0cmluZyBjaGVja2luZyB3aXRoIGEgL2cgcmVnZXhwXG4gICAgLy8gTWFudWFsbHkgc2V0IHRoZSBpbmRleCBzbyBhcyB0byBwaWNrIHVwIG92ZXJsYXBwaW5nIG1hdGNoZXMuXG4gICAgLy8gU3RvcCB3aGVuIHdlIGdldCBhIG1hdGNoIHRoYXQgZW5kcyBhdCB0aGUgc3RyaW5nIGVuZCwgc2luY2Ugbm9cbiAgICAvLyBjb2VyY2libGUgc3RyaW5nIGNhbiBiZSBtb3JlIHJpZ2h0LXdhcmQgd2l0aG91dCB0aGUgc2FtZSB0ZXJtaW51cy5cbiAgICB2YXIgbmV4dFxuICAgIHdoaWxlICgobmV4dCA9IHJlW3QuQ09FUkNFUlRMXS5leGVjKHZlcnNpb24pKSAmJlxuICAgICAgKCFtYXRjaCB8fCBtYXRjaC5pbmRleCArIG1hdGNoWzBdLmxlbmd0aCAhPT0gdmVyc2lvbi5sZW5ndGgpXG4gICAgKSB7XG4gICAgICBpZiAoIW1hdGNoIHx8XG4gICAgICAgICAgbmV4dC5pbmRleCArIG5leHRbMF0ubGVuZ3RoICE9PSBtYXRjaC5pbmRleCArIG1hdGNoWzBdLmxlbmd0aCkge1xuICAgICAgICBtYXRjaCA9IG5leHRcbiAgICAgIH1cbiAgICAgIHJlW3QuQ09FUkNFUlRMXS5sYXN0SW5kZXggPSBuZXh0LmluZGV4ICsgbmV4dFsxXS5sZW5ndGggKyBuZXh0WzJdLmxlbmd0aFxuICAgIH1cbiAgICAvLyBsZWF2ZSBpdCBpbiBhIGNsZWFuIHN0YXRlXG4gICAgcmVbdC5DT0VSQ0VSVExdLmxhc3RJbmRleCA9IC0xXG4gIH1cblxuICBpZiAobWF0Y2ggPT09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgcmV0dXJuIHBhcnNlKG1hdGNoWzJdICtcbiAgICAnLicgKyAobWF0Y2hbM10gfHwgJzAnKSArXG4gICAgJy4nICsgKG1hdGNoWzRdIHx8ICcwJyksIG9wdGlvbnMpXG59XG4iLCIvLyBAZmxvd1xuaW1wb3J0IFZ1ZSBmcm9tICd2dWUnXG5pbXBvcnQgc2VtdmVyIGZyb20gJ3NlbXZlcidcblxuZXhwb3J0IGZ1bmN0aW9uIHRocm93RXJyb3IobXNnOiBzdHJpbmcpOiB2b2lkIHtcbiAgdGhyb3cgbmV3IEVycm9yKGBbdnVlLXRlc3QtdXRpbHNdOiAke21zZ31gKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gd2Fybihtc2c6IHN0cmluZyk6IHZvaWQge1xuICBjb25zb2xlLmVycm9yKGBbdnVlLXRlc3QtdXRpbHNdOiAke21zZ31gKVxufVxuXG5jb25zdCBjYW1lbGl6ZVJFID0gLy0oXFx3KS9nXG5cbmV4cG9ydCBjb25zdCBjYW1lbGl6ZSA9IChzdHI6IHN0cmluZyk6IHN0cmluZyA9PiB7XG4gIGNvbnN0IGNhbWVsaXplZFN0ciA9IHN0ci5yZXBsYWNlKGNhbWVsaXplUkUsIChfLCBjKSA9PlxuICAgIGMgPyBjLnRvVXBwZXJDYXNlKCkgOiAnJ1xuICApXG4gIHJldHVybiBjYW1lbGl6ZWRTdHIuY2hhckF0KDApLnRvTG93ZXJDYXNlKCkgKyBjYW1lbGl6ZWRTdHIuc2xpY2UoMSlcbn1cblxuLyoqXG4gKiBDYXBpdGFsaXplIGEgc3RyaW5nLlxuICovXG5leHBvcnQgY29uc3QgY2FwaXRhbGl6ZSA9IChzdHI6IHN0cmluZyk6IHN0cmluZyA9PlxuICBzdHIuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzdHIuc2xpY2UoMSlcblxuLyoqXG4gKiBIeXBoZW5hdGUgYSBjYW1lbENhc2Ugc3RyaW5nLlxuICovXG5jb25zdCBoeXBoZW5hdGVSRSA9IC9cXEIoW0EtWl0pL2dcbmV4cG9ydCBjb25zdCBoeXBoZW5hdGUgPSAoc3RyOiBzdHJpbmcpOiBzdHJpbmcgPT5cbiAgc3RyLnJlcGxhY2UoaHlwaGVuYXRlUkUsICctJDEnKS50b0xvd2VyQ2FzZSgpXG5cbmZ1bmN0aW9uIGhhc093blByb3BlcnR5KG9iaiwgcHJvcCkge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGtleXM8VDogc3RyaW5nPihvYmo6IGFueSk6IEFycmF5PFQ+IHtcbiAgcmV0dXJuIE9iamVjdC5rZXlzKG9iailcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVDb21wb25lbnQoaWQ6IHN0cmluZywgY29tcG9uZW50czogT2JqZWN0KSB7XG4gIGlmICh0eXBlb2YgaWQgIT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuXG4gIH1cbiAgLy8gY2hlY2sgbG9jYWwgcmVnaXN0cmF0aW9uIHZhcmlhdGlvbnMgZmlyc3RcbiAgaWYgKGhhc093blByb3BlcnR5KGNvbXBvbmVudHMsIGlkKSkge1xuICAgIHJldHVybiBjb21wb25lbnRzW2lkXVxuICB9XG4gIHZhciBjYW1lbGl6ZWRJZCA9IGNhbWVsaXplKGlkKVxuICBpZiAoaGFzT3duUHJvcGVydHkoY29tcG9uZW50cywgY2FtZWxpemVkSWQpKSB7XG4gICAgcmV0dXJuIGNvbXBvbmVudHNbY2FtZWxpemVkSWRdXG4gIH1cbiAgdmFyIFBhc2NhbENhc2VJZCA9IGNhcGl0YWxpemUoY2FtZWxpemVkSWQpXG4gIGlmIChoYXNPd25Qcm9wZXJ0eShjb21wb25lbnRzLCBQYXNjYWxDYXNlSWQpKSB7XG4gICAgcmV0dXJuIGNvbXBvbmVudHNbUGFzY2FsQ2FzZUlkXVxuICB9XG4gIC8vIGZhbGxiYWNrIHRvIHByb3RvdHlwZSBjaGFpblxuICByZXR1cm4gY29tcG9uZW50c1tpZF0gfHwgY29tcG9uZW50c1tjYW1lbGl6ZWRJZF0gfHwgY29tcG9uZW50c1tQYXNjYWxDYXNlSWRdXG59XG5cbmNvbnN0IFVBID1cbiAgdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgJ25hdmlnYXRvcicgaW4gd2luZG93ICYmXG4gIG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKVxuXG5leHBvcnQgY29uc3QgaXNQaGFudG9tSlMgPSBVQSAmJiBVQS5pbmNsdWRlcyAmJiBVQS5tYXRjaCgvcGhhbnRvbWpzL2kpXG5cbmV4cG9ydCBjb25zdCBpc0VkZ2UgPSBVQSAmJiBVQS5pbmRleE9mKCdlZGdlLycpID4gMFxuZXhwb3J0IGNvbnN0IGlzQ2hyb21lID0gVUEgJiYgL2Nocm9tZVxcL1xcZCsvLnRlc3QoVUEpICYmICFpc0VkZ2VcblxuLy8gZ2V0IHRoZSBldmVudCB1c2VkIHRvIHRyaWdnZXIgdi1tb2RlbCBoYW5kbGVyIHRoYXQgdXBkYXRlcyBib3VuZCBkYXRhXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q2hlY2tlZEV2ZW50KCkge1xuICBjb25zdCB2ZXJzaW9uID0gVnVlLnZlcnNpb25cblxuICBpZiAoc2VtdmVyLnNhdGlzZmllcyh2ZXJzaW9uLCAnMi4xLjkgLSAyLjEuMTAnKSkge1xuICAgIHJldHVybiAnY2xpY2snXG4gIH1cblxuICBpZiAoc2VtdmVyLnNhdGlzZmllcyh2ZXJzaW9uLCAnMi4yIC0gMi40JykpIHtcbiAgICByZXR1cm4gaXNDaHJvbWUgPyAnY2xpY2snIDogJ2NoYW5nZSdcbiAgfVxuXG4gIC8vIGNoYW5nZSBpcyBoYW5kbGVyIGZvciB2ZXJzaW9uIDIuMCAtIDIuMS44LCBhbmQgMi41K1xuICByZXR1cm4gJ2NoYW5nZSdcbn1cbiIsIi8vIEBmbG93XG5pbXBvcnQgJCRWdWUgZnJvbSAndnVlJ1xuaW1wb3J0IHsgd2FybiB9IGZyb20gJ3NoYXJlZC91dGlsJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBhZGRNb2NrcyhcbiAgX1Z1ZTogQ29tcG9uZW50LFxuICBtb2NrZWRQcm9wZXJ0aWVzOiBPYmplY3QgfCBmYWxzZSA9IHt9XG4pOiB2b2lkIHtcbiAgaWYgKG1vY2tlZFByb3BlcnRpZXMgPT09IGZhbHNlKSB7XG4gICAgcmV0dXJuXG4gIH1cbiAgT2JqZWN0LmtleXMobW9ja2VkUHJvcGVydGllcykuZm9yRWFjaChrZXkgPT4ge1xuICAgIHRyeSB7XG4gICAgICAvLyAkRmxvd0lnbm9yZVxuICAgICAgX1Z1ZS5wcm90b3R5cGVba2V5XSA9IG1vY2tlZFByb3BlcnRpZXNba2V5XVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHdhcm4oXG4gICAgICAgIGBjb3VsZCBub3Qgb3ZlcndyaXRlIHByb3BlcnR5ICR7a2V5fSwgdGhpcyBpcyBgICtcbiAgICAgICAgICBgdXN1YWxseSBjYXVzZWQgYnkgYSBwbHVnaW4gdGhhdCBoYXMgYWRkZWQgYCArXG4gICAgICAgICAgYHRoZSBwcm9wZXJ0eSBhcyBhIHJlYWQtb25seSB2YWx1ZWBcbiAgICAgIClcbiAgICB9XG4gICAgLy8gJEZsb3dJZ25vcmVcbiAgICAkJFZ1ZS51dGlsLmRlZmluZVJlYWN0aXZlKF9WdWUsIGtleSwgbW9ja2VkUHJvcGVydGllc1trZXldKVxuICB9KVxufVxuIiwiLy8gQGZsb3dcblxuZXhwb3J0IGZ1bmN0aW9uIGxvZ0V2ZW50cyhcbiAgdm06IENvbXBvbmVudCxcbiAgZW1pdHRlZDogT2JqZWN0LFxuICBlbWl0dGVkQnlPcmRlcjogQXJyYXk8YW55PlxuKTogdm9pZCB7XG4gIGNvbnN0IGVtaXQgPSB2bS4kZW1pdFxuICB2bS4kZW1pdCA9IChuYW1lLCAuLi5hcmdzKSA9PiB7XG4gICAgOyhlbWl0dGVkW25hbWVdIHx8IChlbWl0dGVkW25hbWVdID0gW10pKS5wdXNoKGFyZ3MpXG4gICAgZW1pdHRlZEJ5T3JkZXIucHVzaCh7IG5hbWUsIGFyZ3MgfSlcbiAgICByZXR1cm4gZW1pdC5jYWxsKHZtLCBuYW1lLCAuLi5hcmdzKVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhZGRFdmVudExvZ2dlcihfVnVlOiBDb21wb25lbnQpOiB2b2lkIHtcbiAgX1Z1ZS5taXhpbih7XG4gICAgYmVmb3JlQ3JlYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuX19lbWl0dGVkID0gT2JqZWN0LmNyZWF0ZShudWxsKVxuICAgICAgdGhpcy5fX2VtaXR0ZWRCeU9yZGVyID0gW11cbiAgICAgIGxvZ0V2ZW50cyh0aGlzLCB0aGlzLl9fZW1pdHRlZCwgdGhpcy5fX2VtaXR0ZWRCeU9yZGVyKVxuICAgIH1cbiAgfSlcbn1cbiIsImltcG9ydCBWdWUgZnJvbSAndnVlJ1xuaW1wb3J0IHNlbXZlciBmcm9tICdzZW12ZXInXG5cbmV4cG9ydCBjb25zdCBOQU1FX1NFTEVDVE9SID0gJ05BTUVfU0VMRUNUT1InXG5leHBvcnQgY29uc3QgQ09NUE9ORU5UX1NFTEVDVE9SID0gJ0NPTVBPTkVOVF9TRUxFQ1RPUidcbmV4cG9ydCBjb25zdCBSRUZfU0VMRUNUT1IgPSAnUkVGX1NFTEVDVE9SJ1xuZXhwb3J0IGNvbnN0IERPTV9TRUxFQ1RPUiA9ICdET01fU0VMRUNUT1InXG5leHBvcnQgY29uc3QgSU5WQUxJRF9TRUxFQ1RPUiA9ICdJTlZBTElEX1NFTEVDVE9SJ1xuXG5leHBvcnQgY29uc3QgVlVFX1ZFUlNJT04gPSBOdW1iZXIoXG4gIGAke1Z1ZS52ZXJzaW9uLnNwbGl0KCcuJylbMF19LiR7VnVlLnZlcnNpb24uc3BsaXQoJy4nKVsxXX1gXG4pXG5cbmV4cG9ydCBjb25zdCBGVU5DVElPTkFMX09QVElPTlMgPVxuICBWVUVfVkVSU0lPTiA+PSAyLjUgPyAnZm5PcHRpb25zJyA6ICdmdW5jdGlvbmFsT3B0aW9ucydcblxuZXhwb3J0IGNvbnN0IEJFRk9SRV9SRU5ERVJfTElGRUNZQ0xFX0hPT0sgPSBzZW12ZXIuZ3QoVnVlLnZlcnNpb24sICcyLjEuOCcpXG4gID8gJ2JlZm9yZUNyZWF0ZSdcbiAgOiAnYmVmb3JlTW91bnQnXG5cbmV4cG9ydCBjb25zdCBDUkVBVEVfRUxFTUVOVF9BTElBUyA9IHNlbXZlci5ndChWdWUudmVyc2lvbiwgJzIuMS41JylcbiAgPyAnX2MnXG4gIDogJ19oJ1xuIiwiaW1wb3J0IHsgQkVGT1JFX1JFTkRFUl9MSUZFQ1lDTEVfSE9PSyB9IGZyb20gJ3NoYXJlZC9jb25zdHMnXG5cbmV4cG9ydCBmdW5jdGlvbiBhZGRTdHVicyhfVnVlLCBzdHViQ29tcG9uZW50cykge1xuICBmdW5jdGlvbiBhZGRTdHViQ29tcG9uZW50c01peGluKCkge1xuICAgIE9iamVjdC5hc3NpZ24odGhpcy4kb3B0aW9ucy5jb21wb25lbnRzLCBzdHViQ29tcG9uZW50cylcbiAgfVxuXG4gIF9WdWUubWl4aW4oe1xuICAgIFtCRUZPUkVfUkVOREVSX0xJRkVDWUNMRV9IT09LXTogYWRkU3R1YkNvbXBvbmVudHNNaXhpblxuICB9KVxufVxuIiwiLy8gQGZsb3dcbmltcG9ydCB7IHRocm93RXJyb3IsIGNhcGl0YWxpemUsIGNhbWVsaXplLCBoeXBoZW5hdGUgfSBmcm9tICcuL3V0aWwnXG5cbmV4cG9ydCBmdW5jdGlvbiBpc0RvbVNlbGVjdG9yKHNlbGVjdG9yOiBhbnkpOiBib29sZWFuIHtcbiAgaWYgKHR5cGVvZiBzZWxlY3RvciAhPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIHRyeSB7XG4gICAgaWYgKHR5cGVvZiBkb2N1bWVudCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRocm93RXJyb3IoXG4gICAgICAgIGBtb3VudCBtdXN0IGJlIHJ1biBpbiBhIGJyb3dzZXIgZW52aXJvbm1lbnQgbGlrZSBgICtcbiAgICAgICAgICBgUGhhbnRvbUpTLCBqc2RvbSBvciBjaHJvbWVgXG4gICAgICApXG4gICAgfVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHRocm93RXJyb3IoXG4gICAgICBgbW91bnQgbXVzdCBiZSBydW4gaW4gYSBicm93c2VyIGVudmlyb25tZW50IGxpa2UgYCArXG4gICAgICAgIGBQaGFudG9tSlMsIGpzZG9tIG9yIGNocm9tZWBcbiAgICApXG4gIH1cblxuICB0cnkge1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpXG4gICAgcmV0dXJuIHRydWVcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNWdWVDb21wb25lbnQoYzogYW55KTogYm9vbGVhbiB7XG4gIGlmIChpc0NvbnN0cnVjdG9yKGMpKSB7XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIGlmIChjID09PSBudWxsIHx8IHR5cGVvZiBjICE9PSAnb2JqZWN0Jykge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgaWYgKGMuZXh0ZW5kcyB8fCBjLl9DdG9yKSB7XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIGlmICh0eXBlb2YgYy50ZW1wbGF0ZSA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgcmV0dXJuIHR5cGVvZiBjLnJlbmRlciA9PT0gJ2Z1bmN0aW9uJ1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29tcG9uZW50TmVlZHNDb21waWxpbmcoY29tcG9uZW50OiBDb21wb25lbnQpOiBib29sZWFuIHtcbiAgcmV0dXJuIChcbiAgICBjb21wb25lbnQgJiZcbiAgICAhY29tcG9uZW50LnJlbmRlciAmJlxuICAgIChjb21wb25lbnQudGVtcGxhdGUgfHwgY29tcG9uZW50LmV4dGVuZHMgfHwgY29tcG9uZW50LmV4dGVuZE9wdGlvbnMpICYmXG4gICAgIWNvbXBvbmVudC5mdW5jdGlvbmFsXG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUmVmU2VsZWN0b3IocmVmT3B0aW9uc09iamVjdDogYW55KTogYm9vbGVhbiB7XG4gIGlmIChcbiAgICB0eXBlb2YgcmVmT3B0aW9uc09iamVjdCAhPT0gJ29iamVjdCcgfHxcbiAgICBPYmplY3Qua2V5cyhyZWZPcHRpb25zT2JqZWN0IHx8IHt9KS5sZW5ndGggIT09IDFcbiAgKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICByZXR1cm4gdHlwZW9mIHJlZk9wdGlvbnNPYmplY3QucmVmID09PSAnc3RyaW5nJ1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNOYW1lU2VsZWN0b3IobmFtZU9wdGlvbnNPYmplY3Q6IGFueSk6IGJvb2xlYW4ge1xuICBpZiAodHlwZW9mIG5hbWVPcHRpb25zT2JqZWN0ICE9PSAnb2JqZWN0JyB8fCBuYW1lT3B0aW9uc09iamVjdCA9PT0gbnVsbCkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgcmV0dXJuICEhbmFtZU9wdGlvbnNPYmplY3QubmFtZVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNDb25zdHJ1Y3RvcihjOiBhbnkpIHtcbiAgcmV0dXJuIHR5cGVvZiBjID09PSAnZnVuY3Rpb24nICYmIGMuY2lkXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0R5bmFtaWNDb21wb25lbnQoYzogYW55KSB7XG4gIHJldHVybiB0eXBlb2YgYyA9PT0gJ2Z1bmN0aW9uJyAmJiAhYy5jaWRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzQ29tcG9uZW50T3B0aW9ucyhjOiBhbnkpIHtcbiAgcmV0dXJuIHR5cGVvZiBjID09PSAnb2JqZWN0JyAmJiAoYy50ZW1wbGF0ZSB8fCBjLnJlbmRlcilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRnVuY3Rpb25hbENvbXBvbmVudChjOiBhbnkpIHtcbiAgaWYgKCFpc1Z1ZUNvbXBvbmVudChjKSkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG4gIGlmIChpc0NvbnN0cnVjdG9yKGMpKSB7XG4gICAgcmV0dXJuIGMub3B0aW9ucy5mdW5jdGlvbmFsXG4gIH1cbiAgcmV0dXJuIGMuZnVuY3Rpb25hbFxufVxuXG5leHBvcnQgZnVuY3Rpb24gdGVtcGxhdGVDb250YWluc0NvbXBvbmVudChcbiAgdGVtcGxhdGU6IHN0cmluZyxcbiAgbmFtZTogc3RyaW5nXG4pOiBib29sZWFuIHtcbiAgcmV0dXJuIFtjYXBpdGFsaXplLCBjYW1lbGl6ZSwgaHlwaGVuYXRlXS5zb21lKGZvcm1hdCA9PiB7XG4gICAgY29uc3QgcmUgPSBuZXcgUmVnRXhwKGA8JHtmb3JtYXQobmFtZSl9XFxcXHMqKFxcXFxzfD58KFxcLz4pKWAsICdnJylcbiAgICByZXR1cm4gcmUudGVzdCh0ZW1wbGF0ZSlcbiAgfSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUGxhaW5PYmplY3QoYzogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYykgPT09ICdbb2JqZWN0IE9iamVjdF0nXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1JlcXVpcmVkQ29tcG9uZW50KG5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gKFxuICAgIG5hbWUgPT09ICdLZWVwQWxpdmUnIHx8IG5hbWUgPT09ICdUcmFuc2l0aW9uJyB8fCBuYW1lID09PSAnVHJhbnNpdGlvbkdyb3VwJ1xuICApXG59XG5cbmZ1bmN0aW9uIG1ha2VNYXAoc3RyOiBzdHJpbmcsIGV4cGVjdHNMb3dlckNhc2U/OiBib29sZWFuKSB7XG4gIHZhciBtYXAgPSBPYmplY3QuY3JlYXRlKG51bGwpXG4gIHZhciBsaXN0ID0gc3RyLnNwbGl0KCcsJylcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgbWFwW2xpc3RbaV1dID0gdHJ1ZVxuICB9XG4gIHJldHVybiBleHBlY3RzTG93ZXJDYXNlXG4gICAgPyBmdW5jdGlvbih2YWw6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gbWFwW3ZhbC50b0xvd2VyQ2FzZSgpXVxuICAgICAgfVxuICAgIDogZnVuY3Rpb24odmFsOiBzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIG1hcFt2YWxdXG4gICAgICB9XG59XG5cbmV4cG9ydCBjb25zdCBpc0hUTUxUYWcgPSBtYWtlTWFwKFxuICAnaHRtbCxib2R5LGJhc2UsaGVhZCxsaW5rLG1ldGEsc3R5bGUsdGl0bGUsJyArXG4gICAgJ2FkZHJlc3MsYXJ0aWNsZSxhc2lkZSxmb290ZXIsaGVhZGVyLGgxLGgyLGgzLGg0LGg1LGg2LGhncm91cCxuYXYsc2VjdGlvbiwnICtcbiAgICAnZGl2LGRkLGRsLGR0LGZpZ2NhcHRpb24sZmlndXJlLHBpY3R1cmUsaHIsaW1nLGxpLG1haW4sb2wscCxwcmUsdWwsJyArXG4gICAgJ2EsYixhYmJyLGJkaSxiZG8sYnIsY2l0ZSxjb2RlLGRhdGEsZGZuLGVtLGksa2JkLG1hcmsscSxycCxydCxydGMscnVieSwnICtcbiAgICAncyxzYW1wLHNtYWxsLHNwYW4sc3Ryb25nLHN1YixzdXAsdGltZSx1LHZhcix3YnIsYXJlYSxhdWRpbyxtYXAsdHJhY2ssJyArXG4gICAgJ2VtYmVkLG9iamVjdCxwYXJhbSxzb3VyY2UsY2FudmFzLHNjcmlwdCxub3NjcmlwdCxkZWwsaW5zLCcgK1xuICAgICdjYXB0aW9uLGNvbCxjb2xncm91cCx0YWJsZSx0aGVhZCx0Ym9keSx0ZCx0aCx0cix2aWRlbywnICtcbiAgICAnYnV0dG9uLGRhdGFsaXN0LGZpZWxkc2V0LGZvcm0saW5wdXQsbGFiZWwsbGVnZW5kLG1ldGVyLG9wdGdyb3VwLG9wdGlvbiwnICtcbiAgICAnb3V0cHV0LHByb2dyZXNzLHNlbGVjdCx0ZXh0YXJlYSwnICtcbiAgICAnZGV0YWlscyxkaWFsb2csbWVudSxtZW51aXRlbSxzdW1tYXJ5LCcgK1xuICAgICdjb250ZW50LGVsZW1lbnQsc2hhZG93LHRlbXBsYXRlLGJsb2NrcXVvdGUsaWZyYW1lLHRmb290J1xuKVxuXG4vLyB0aGlzIG1hcCBpcyBpbnRlbnRpb25hbGx5IHNlbGVjdGl2ZSwgb25seSBjb3ZlcmluZyBTVkcgZWxlbWVudHMgdGhhdCBtYXlcbi8vIGNvbnRhaW4gY2hpbGQgZWxlbWVudHMuXG5leHBvcnQgY29uc3QgaXNTVkcgPSBtYWtlTWFwKFxuICAnc3ZnLGFuaW1hdGUsY2lyY2xlLGNsaXBwYXRoLGN1cnNvcixkZWZzLGRlc2MsZWxsaXBzZSxmaWx0ZXIsZm9udC1mYWNlLCcgK1xuICAgICdmb3JlaWduT2JqZWN0LGcsZ2x5cGgsaW1hZ2UsbGluZSxtYXJrZXIsbWFzayxtaXNzaW5nLWdseXBoLHBhdGgscGF0dGVybiwnICtcbiAgICAncG9seWdvbixwb2x5bGluZSxyZWN0LHN3aXRjaCxzeW1ib2wsdGV4dCx0ZXh0cGF0aCx0c3Bhbix1c2UsdmlldycsXG4gIHRydWVcbilcblxuZXhwb3J0IGNvbnN0IGlzUmVzZXJ2ZWRUYWcgPSAodGFnOiBzdHJpbmcpID0+IGlzSFRNTFRhZyh0YWcpIHx8IGlzU1ZHKHRhZylcbiIsIi8vIEBmbG93XG5cbmltcG9ydCB7IGNvbXBpbGVUb0Z1bmN0aW9ucyB9IGZyb20gJ3Z1ZS10ZW1wbGF0ZS1jb21waWxlcidcbmltcG9ydCB7IGNvbXBvbmVudE5lZWRzQ29tcGlsaW5nIH0gZnJvbSAnLi92YWxpZGF0b3JzJ1xuaW1wb3J0IHsgdGhyb3dFcnJvciB9IGZyb20gJy4vdXRpbCdcblxuZXhwb3J0IGZ1bmN0aW9uIGNvbXBpbGVGcm9tU3RyaW5nKHN0cjogc3RyaW5nKSB7XG4gIGlmICghY29tcGlsZVRvRnVuY3Rpb25zKSB7XG4gICAgdGhyb3dFcnJvcihcbiAgICAgIGB2dWVUZW1wbGF0ZUNvbXBpbGVyIGlzIHVuZGVmaW5lZCwgeW91IG11c3QgcGFzcyBgICtcbiAgICAgICAgYHByZWNvbXBpbGVkIGNvbXBvbmVudHMgaWYgdnVlLXRlbXBsYXRlLWNvbXBpbGVyIGlzIGAgK1xuICAgICAgICBgdW5kZWZpbmVkYFxuICAgIClcbiAgfVxuICByZXR1cm4gY29tcGlsZVRvRnVuY3Rpb25zKHN0cilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbXBpbGVUZW1wbGF0ZShjb21wb25lbnQ6IENvbXBvbmVudCk6IHZvaWQge1xuICBpZiAoY29tcG9uZW50LnRlbXBsYXRlKSB7XG4gICAgaWYgKGNvbXBvbmVudC50ZW1wbGF0ZS5jaGFyQXQoJyMnKSA9PT0gJyMnKSB7XG4gICAgICB2YXIgZWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGNvbXBvbmVudC50ZW1wbGF0ZSlcbiAgICAgIGlmICghZWwpIHtcbiAgICAgICAgdGhyb3dFcnJvcignQ2Fubm90IGZpbmQgZWxlbWVudCcgKyBjb21wb25lbnQudGVtcGxhdGUpXG5cbiAgICAgICAgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgICAgfVxuICAgICAgY29tcG9uZW50LnRlbXBsYXRlID0gZWwuaW5uZXJIVE1MXG4gICAgfVxuXG4gICAgT2JqZWN0LmFzc2lnbihjb21wb25lbnQsIGNvbXBpbGVUb0Z1bmN0aW9ucyhjb21wb25lbnQudGVtcGxhdGUpKVxuICB9XG5cbiAgaWYgKGNvbXBvbmVudC5jb21wb25lbnRzKSB7XG4gICAgT2JqZWN0LmtleXMoY29tcG9uZW50LmNvbXBvbmVudHMpLmZvckVhY2goYyA9PiB7XG4gICAgICBjb25zdCBjbXAgPSBjb21wb25lbnQuY29tcG9uZW50c1tjXVxuICAgICAgaWYgKCFjbXAucmVuZGVyKSB7XG4gICAgICAgIGNvbXBpbGVUZW1wbGF0ZShjbXApXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIGlmIChjb21wb25lbnQuZXh0ZW5kcykge1xuICAgIGNvbXBpbGVUZW1wbGF0ZShjb21wb25lbnQuZXh0ZW5kcylcbiAgfVxuXG4gIGlmIChjb21wb25lbnQuZXh0ZW5kT3B0aW9ucyAmJiAhY29tcG9uZW50Lm9wdGlvbnMucmVuZGVyKSB7XG4gICAgY29tcGlsZVRlbXBsYXRlKGNvbXBvbmVudC5vcHRpb25zKVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb21waWxlVGVtcGxhdGVGb3JTbG90cyhzbG90czogT2JqZWN0KTogdm9pZCB7XG4gIE9iamVjdC5rZXlzKHNsb3RzKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgY29uc3Qgc2xvdCA9IEFycmF5LmlzQXJyYXkoc2xvdHNba2V5XSkgPyBzbG90c1trZXldIDogW3Nsb3RzW2tleV1dXG4gICAgc2xvdC5mb3JFYWNoKHNsb3RWYWx1ZSA9PiB7XG4gICAgICBpZiAoY29tcG9uZW50TmVlZHNDb21waWxpbmcoc2xvdFZhbHVlKSkge1xuICAgICAgICBjb21waWxlVGVtcGxhdGUoc2xvdFZhbHVlKVxuICAgICAgfVxuICAgIH0pXG4gIH0pXG59XG4iLCIvLyBAZmxvd1xuXG5jb25zdCBNT1VOVElOR19PUFRJT05TID0gW1xuICAnYXR0YWNoVG9Eb2N1bWVudCcsXG4gICdtb2NrcycsXG4gICdzbG90cycsXG4gICdsb2NhbFZ1ZScsXG4gICdzdHVicycsXG4gICdjb250ZXh0JyxcbiAgJ2Nsb25lJyxcbiAgJ2F0dHJzJyxcbiAgJ2xpc3RlbmVycycsXG4gICdwcm9wc0RhdGEnLFxuICAnc2hvdWxkUHJveHknXG5dXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGV4dHJhY3RJbnN0YW5jZU9wdGlvbnMob3B0aW9uczogT2JqZWN0KTogT2JqZWN0IHtcbiAgY29uc3QgaW5zdGFuY2VPcHRpb25zID0ge1xuICAgIC4uLm9wdGlvbnNcbiAgfVxuICBNT1VOVElOR19PUFRJT05TLmZvckVhY2gobW91bnRpbmdPcHRpb24gPT4ge1xuICAgIGRlbGV0ZSBpbnN0YW5jZU9wdGlvbnNbbW91bnRpbmdPcHRpb25dXG4gIH0pXG4gIHJldHVybiBpbnN0YW5jZU9wdGlvbnNcbn1cbiIsIi8vIEBmbG93XG5cbmltcG9ydCB7IGNvbXBpbGVUb0Z1bmN0aW9ucyB9IGZyb20gJ3Z1ZS10ZW1wbGF0ZS1jb21waWxlcidcbmltcG9ydCB7IHRocm93RXJyb3IgfSBmcm9tICdzaGFyZWQvdXRpbCdcbmltcG9ydCB7IFZVRV9WRVJTSU9OIH0gZnJvbSAnc2hhcmVkL2NvbnN0cydcblxuZnVuY3Rpb24gaXNEZXN0cnVjdHVyaW5nU2xvdFNjb3BlKHNsb3RTY29wZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiBzbG90U2NvcGVbMF0gPT09ICd7JyAmJiBzbG90U2NvcGVbc2xvdFNjb3BlLmxlbmd0aCAtIDFdID09PSAnfSdcbn1cblxuZnVuY3Rpb24gZ2V0VnVlVGVtcGxhdGVDb21waWxlckhlbHBlcnMoXG4gIF9WdWU6IENvbXBvbmVudFxuKTogeyBbbmFtZTogc3RyaW5nXTogRnVuY3Rpb24gfSB7XG4gIC8vICRGbG93SWdub3JlXG4gIGNvbnN0IHZ1ZSA9IG5ldyBfVnVlKClcbiAgY29uc3QgaGVscGVycyA9IHt9XG4gIGNvbnN0IG5hbWVzID0gW1xuICAgICdfYycsXG4gICAgJ19vJyxcbiAgICAnX24nLFxuICAgICdfcycsXG4gICAgJ19sJyxcbiAgICAnX3QnLFxuICAgICdfcScsXG4gICAgJ19pJyxcbiAgICAnX20nLFxuICAgICdfZicsXG4gICAgJ19rJyxcbiAgICAnX2InLFxuICAgICdfdicsXG4gICAgJ19lJyxcbiAgICAnX3UnLFxuICAgICdfZydcbiAgXVxuICBuYW1lcy5mb3JFYWNoKG5hbWUgPT4ge1xuICAgIGhlbHBlcnNbbmFtZV0gPSB2dWUuX3JlbmRlclByb3h5W25hbWVdXG4gIH0pXG4gIGhlbHBlcnMuJGNyZWF0ZUVsZW1lbnQgPSB2dWUuX3JlbmRlclByb3h5LiRjcmVhdGVFbGVtZW50XG4gIGhlbHBlcnMuJHNldCA9IHZ1ZS5fcmVuZGVyUHJveHkuJHNldFxuICByZXR1cm4gaGVscGVyc1xufVxuXG5mdW5jdGlvbiB2YWxpZGF0ZUVudmlyb25tZW50KCk6IHZvaWQge1xuICBpZiAoVlVFX1ZFUlNJT04gPCAyLjEpIHtcbiAgICB0aHJvd0Vycm9yKGB0aGUgc2NvcGVkU2xvdHMgb3B0aW9uIGlzIG9ubHkgc3VwcG9ydGVkIGluIHZ1ZUAyLjErLmApXG4gIH1cbn1cblxuY29uc3Qgc2xvdFNjb3BlUmUgPSAvPFtePl0rIHNsb3Qtc2NvcGU9XFxcIiguKylcXFwiL1xuXG4vLyBIaWRlIHdhcm5pbmcgYWJvdXQgPHRlbXBsYXRlPiBkaXNhbGxvd2VkIGFzIHJvb3QgZWxlbWVudFxuZnVuY3Rpb24gY3VzdG9tV2Fybihtc2cpIHtcbiAgaWYgKG1zZy5pbmRleE9mKCdDYW5ub3QgdXNlIDx0ZW1wbGF0ZT4gYXMgY29tcG9uZW50IHJvb3QgZWxlbWVudCcpID09PSAtMSkge1xuICAgIGNvbnNvbGUuZXJyb3IobXNnKVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNyZWF0ZVNjb3BlZFNsb3RzKFxuICBzY29wZWRTbG90c09wdGlvbjogP3sgW3Nsb3ROYW1lOiBzdHJpbmddOiBzdHJpbmcgfCBGdW5jdGlvbiB9LFxuICBfVnVlOiBDb21wb25lbnRcbik6IHtcbiAgW3Nsb3ROYW1lOiBzdHJpbmddOiAocHJvcHM6IE9iamVjdCkgPT4gVk5vZGUgfCBBcnJheTxWTm9kZT5cbn0ge1xuICBjb25zdCBzY29wZWRTbG90cyA9IHt9XG4gIGlmICghc2NvcGVkU2xvdHNPcHRpb24pIHtcbiAgICByZXR1cm4gc2NvcGVkU2xvdHNcbiAgfVxuICB2YWxpZGF0ZUVudmlyb25tZW50KClcbiAgY29uc3QgaGVscGVycyA9IGdldFZ1ZVRlbXBsYXRlQ29tcGlsZXJIZWxwZXJzKF9WdWUpXG4gIGZvciAoY29uc3Qgc2NvcGVkU2xvdE5hbWUgaW4gc2NvcGVkU2xvdHNPcHRpb24pIHtcbiAgICBjb25zdCBzbG90ID0gc2NvcGVkU2xvdHNPcHRpb25bc2NvcGVkU2xvdE5hbWVdXG4gICAgY29uc3QgaXNGbiA9IHR5cGVvZiBzbG90ID09PSAnZnVuY3Rpb24nXG4gICAgLy8gVHlwZSBjaGVjayB0byBzaWxlbmNlIGZsb3cgKGNhbid0IHVzZSBpc0ZuKVxuICAgIGNvbnN0IHJlbmRlckZuID1cbiAgICAgIHR5cGVvZiBzbG90ID09PSAnZnVuY3Rpb24nXG4gICAgICAgID8gc2xvdFxuICAgICAgICA6IGNvbXBpbGVUb0Z1bmN0aW9ucyhzbG90LCB7IHdhcm46IGN1c3RvbVdhcm4gfSkucmVuZGVyXG5cbiAgICBjb25zdCBoYXNTbG90U2NvcGVBdHRyID0gIWlzRm4gJiYgc2xvdC5tYXRjaChzbG90U2NvcGVSZSlcbiAgICBjb25zdCBzbG90U2NvcGUgPSBoYXNTbG90U2NvcGVBdHRyICYmIGhhc1Nsb3RTY29wZUF0dHJbMV1cbiAgICBzY29wZWRTbG90c1tzY29wZWRTbG90TmFtZV0gPSBmdW5jdGlvbihwcm9wcykge1xuICAgICAgbGV0IHJlc1xuICAgICAgaWYgKGlzRm4pIHtcbiAgICAgICAgcmVzID0gcmVuZGVyRm4uY2FsbCh7IC4uLmhlbHBlcnMgfSwgcHJvcHMpXG4gICAgICB9IGVsc2UgaWYgKHNsb3RTY29wZSAmJiAhaXNEZXN0cnVjdHVyaW5nU2xvdFNjb3BlKHNsb3RTY29wZSkpIHtcbiAgICAgICAgcmVzID0gcmVuZGVyRm4uY2FsbCh7IC4uLmhlbHBlcnMsIFtzbG90U2NvcGVdOiBwcm9wcyB9KVxuICAgICAgfSBlbHNlIGlmIChzbG90U2NvcGUgJiYgaXNEZXN0cnVjdHVyaW5nU2xvdFNjb3BlKHNsb3RTY29wZSkpIHtcbiAgICAgICAgcmVzID0gcmVuZGVyRm4uY2FsbCh7IC4uLmhlbHBlcnMsIC4uLnByb3BzIH0pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXMgPSByZW5kZXJGbi5jYWxsKHsgLi4uaGVscGVycywgcHJvcHMgfSlcbiAgICAgIH1cbiAgICAgIC8vIHJlcyBpcyBBcnJheSBpZiA8dGVtcGxhdGU+IGlzIGEgcm9vdCBlbGVtZW50XG4gICAgICByZXR1cm4gQXJyYXkuaXNBcnJheShyZXMpID8gcmVzWzBdIDogcmVzXG4gICAgfVxuICB9XG4gIHJldHVybiBzY29wZWRTbG90c1xufVxuIiwiLy8gQGZsb3dcblxuaW1wb3J0IFZ1ZSBmcm9tICd2dWUnXG5pbXBvcnQge1xuICB0aHJvd0Vycm9yLFxuICBjYW1lbGl6ZSxcbiAgY2FwaXRhbGl6ZSxcbiAgaHlwaGVuYXRlLFxuICBrZXlzXG59IGZyb20gJy4uL3NoYXJlZC91dGlsJ1xuaW1wb3J0IHtcbiAgY29tcG9uZW50TmVlZHNDb21waWxpbmcsXG4gIHRlbXBsYXRlQ29udGFpbnNDb21wb25lbnQsXG4gIGlzVnVlQ29tcG9uZW50LFxuICBpc0R5bmFtaWNDb21wb25lbnQsXG4gIGlzQ29uc3RydWN0b3Jcbn0gZnJvbSAnLi4vc2hhcmVkL3ZhbGlkYXRvcnMnXG5pbXBvcnQgeyBjb21waWxlVGVtcGxhdGUsIGNvbXBpbGVGcm9tU3RyaW5nIH0gZnJvbSAnLi4vc2hhcmVkL2NvbXBpbGUtdGVtcGxhdGUnXG5cbmZ1bmN0aW9uIGlzVnVlQ29tcG9uZW50U3R1Yihjb21wKTogYm9vbGVhbiB7XG4gIHJldHVybiAoY29tcCAmJiBjb21wLnRlbXBsYXRlKSB8fCBpc1Z1ZUNvbXBvbmVudChjb21wKVxufVxuXG5mdW5jdGlvbiBpc1ZhbGlkU3R1YihzdHViOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuIChcbiAgICB0eXBlb2Ygc3R1YiA9PT0gJ2Jvb2xlYW4nIHx8XG4gICAgKCEhc3R1YiAmJiB0eXBlb2Ygc3R1YiA9PT0gJ3N0cmluZycpIHx8XG4gICAgaXNWdWVDb21wb25lbnRTdHViKHN0dWIpXG4gIClcbn1cblxuZnVuY3Rpb24gcmVzb2x2ZUNvbXBvbmVudChvYmo6IE9iamVjdCwgY29tcG9uZW50OiBzdHJpbmcpOiBPYmplY3Qge1xuICByZXR1cm4gKFxuICAgIG9ialtjb21wb25lbnRdIHx8XG4gICAgb2JqW2h5cGhlbmF0ZShjb21wb25lbnQpXSB8fFxuICAgIG9ialtjYW1lbGl6ZShjb21wb25lbnQpXSB8fFxuICAgIG9ialtjYXBpdGFsaXplKGNhbWVsaXplKGNvbXBvbmVudCkpXSB8fFxuICAgIG9ialtjYXBpdGFsaXplKGNvbXBvbmVudCldIHx8XG4gICAge31cbiAgKVxufVxuXG5mdW5jdGlvbiBnZXRDb3JlUHJvcGVydGllcyhjb21wb25lbnRPcHRpb25zOiBDb21wb25lbnQpOiBPYmplY3Qge1xuICByZXR1cm4ge1xuICAgIGF0dHJzOiBjb21wb25lbnRPcHRpb25zLmF0dHJzLFxuICAgIG5hbWU6IGNvbXBvbmVudE9wdGlvbnMubmFtZSxcbiAgICBtb2RlbDogY29tcG9uZW50T3B0aW9ucy5tb2RlbCxcbiAgICBwcm9wczogY29tcG9uZW50T3B0aW9ucy5wcm9wcyxcbiAgICBvbjogY29tcG9uZW50T3B0aW9ucy5vbixcbiAgICBrZXk6IGNvbXBvbmVudE9wdGlvbnMua2V5LFxuICAgIGRvbVByb3BzOiBjb21wb25lbnRPcHRpb25zLmRvbVByb3BzLFxuICAgIGNsYXNzOiBjb21wb25lbnRPcHRpb25zLmNsYXNzLFxuICAgIHN0YXRpY0NsYXNzOiBjb21wb25lbnRPcHRpb25zLnN0YXRpY0NsYXNzLFxuICAgIHN0YXRpY1N0eWxlOiBjb21wb25lbnRPcHRpb25zLnN0YXRpY1N0eWxlLFxuICAgIHN0eWxlOiBjb21wb25lbnRPcHRpb25zLnN0eWxlLFxuICAgIG5vcm1hbGl6ZWRTdHlsZTogY29tcG9uZW50T3B0aW9ucy5ub3JtYWxpemVkU3R5bGUsXG4gICAgbmF0aXZlT246IGNvbXBvbmVudE9wdGlvbnMubmF0aXZlT24sXG4gICAgZnVuY3Rpb25hbDogY29tcG9uZW50T3B0aW9ucy5mdW5jdGlvbmFsXG4gIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlQ2xhc3NTdHJpbmcoc3RhdGljQ2xhc3MsIGR5bmFtaWNDbGFzcykge1xuICAvLyA6Y2xhc3M9XCJzb21lQ29tcHV0ZWRPYmplY3RcIiBjYW4gcmV0dXJuIGEgc3RyaW5nLCBvYmplY3Qgb3IgdW5kZWZpbmVkXG4gIC8vIGlmIGl0IGlzIGEgc3RyaW5nLCB3ZSBkb24ndCBuZWVkIHRvIGRvIGFueXRoaW5nIHNwZWNpYWwuXG4gIGxldCBldmFsdWF0ZWREeW5hbWljQ2xhc3MgPSBkeW5hbWljQ2xhc3NcblxuICAvLyBpZiBpdCBpcyBhbiBvYmplY3QsIGVnIHsgJ2Zvbyc6IHRydWUgfSwgd2UgbmVlZCB0byBldmFsdWF0ZSBpdC5cbiAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS92dWVqcy92dWUtdGVzdC11dGlscy9pc3N1ZXMvMTQ3NCBmb3IgbW9yZSBjb250ZXh0LlxuICBpZiAodHlwZW9mIGR5bmFtaWNDbGFzcyA9PT0gJ29iamVjdCcpIHtcbiAgICBldmFsdWF0ZWREeW5hbWljQ2xhc3MgPSBPYmplY3Qua2V5cyhkeW5hbWljQ2xhc3MpLnJlZHVjZSgoYWNjLCBrZXkpID0+IHtcbiAgICAgIGlmIChkeW5hbWljQ2xhc3Nba2V5XSkge1xuICAgICAgICByZXR1cm4gYWNjICsgJyAnICsga2V5XG4gICAgICB9XG4gICAgICByZXR1cm4gYWNjXG4gICAgfSwgJycpXG4gIH1cblxuICBpZiAoc3RhdGljQ2xhc3MgJiYgZXZhbHVhdGVkRHluYW1pY0NsYXNzKSB7XG4gICAgcmV0dXJuIHN0YXRpY0NsYXNzICsgJyAnICsgZXZhbHVhdGVkRHluYW1pY0NsYXNzXG4gIH1cbiAgcmV0dXJuIHN0YXRpY0NsYXNzIHx8IGV2YWx1YXRlZER5bmFtaWNDbGFzc1xufVxuXG5mdW5jdGlvbiByZXNvbHZlT3B0aW9ucyhjb21wb25lbnQsIF9WdWUpIHtcbiAgaWYgKGlzRHluYW1pY0NvbXBvbmVudChjb21wb25lbnQpKSB7XG4gICAgcmV0dXJuIHt9XG4gIH1cblxuICBpZiAoaXNDb25zdHJ1Y3Rvcihjb21wb25lbnQpKSB7XG4gICAgcmV0dXJuIGNvbXBvbmVudC5vcHRpb25zXG4gIH1cbiAgY29uc3Qgb3B0aW9ucyA9IF9WdWUuZXh0ZW5kKGNvbXBvbmVudCkub3B0aW9uc1xuICBjb21wb25lbnQuX0N0b3IgPSB7fVxuXG4gIHJldHVybiBvcHRpb25zXG59XG5cbmZ1bmN0aW9uIGdldFNjb3BlZFNsb3RSZW5kZXJGdW5jdGlvbnMoY3R4OiBhbnkpOiBBcnJheTxzdHJpbmc+IHtcbiAgLy8gSW4gVnVlIDIuNisgYSBuZXcgdi1zbG90IHN5bnRheCB3YXMgaW50cm9kdWNlZFxuICAvLyBzY29wZWRTbG90cyBhcmUgbm93IHNhdmVkIGluIHBhcmVudC5fdm5vZGUuZGF0YS5zY29wZWRTbG90c1xuICAvLyBXZSBmaWx0ZXIgb3V0IHRoZSBfbm9ybWFsaXplZCBhbmQgJHN0YWJsZSBrZXlcbiAgaWYgKFxuICAgIGN0eCAmJlxuICAgIGN0eC4kb3B0aW9ucyAmJlxuICAgIGN0eC4kb3B0aW9ucy5wYXJlbnQgJiZcbiAgICBjdHguJG9wdGlvbnMucGFyZW50Ll92bm9kZSAmJlxuICAgIGN0eC4kb3B0aW9ucy5wYXJlbnQuX3Zub2RlLmRhdGEgJiZcbiAgICBjdHguJG9wdGlvbnMucGFyZW50Ll92bm9kZS5kYXRhLnNjb3BlZFNsb3RzXG4gICkge1xuICAgIGNvbnN0IHNsb3RLZXlzOiBBcnJheTxzdHJpbmc+ID0gY3R4LiRvcHRpb25zLnBhcmVudC5fdm5vZGUuZGF0YS5zY29wZWRTbG90c1xuICAgIHJldHVybiBrZXlzKHNsb3RLZXlzKS5maWx0ZXIoeCA9PiB4ICE9PSAnX25vcm1hbGl6ZWQnICYmIHggIT09ICckc3RhYmxlJylcbiAgfVxuXG4gIHJldHVybiBbXVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU3R1YkZyb21Db21wb25lbnQoXG4gIG9yaWdpbmFsQ29tcG9uZW50OiBDb21wb25lbnQsXG4gIG5hbWU6IHN0cmluZyxcbiAgX1Z1ZTogQ29tcG9uZW50XG4pOiBDb21wb25lbnQge1xuICBjb25zdCBjb21wb25lbnRPcHRpb25zID0gcmVzb2x2ZU9wdGlvbnMob3JpZ2luYWxDb21wb25lbnQsIF9WdWUpXG4gIGNvbnN0IHRhZ05hbWUgPSBgJHtuYW1lIHx8ICdhbm9ueW1vdXMnfS1zdHViYFxuXG4gIC8vIGlnbm9yZUVsZW1lbnRzIGRvZXMgbm90IGV4aXN0IGluIFZ1ZSAyLjAueFxuICBpZiAoVnVlLmNvbmZpZy5pZ25vcmVkRWxlbWVudHMpIHtcbiAgICBWdWUuY29uZmlnLmlnbm9yZWRFbGVtZW50cy5wdXNoKHRhZ05hbWUpXG4gIH1cblxuICByZXR1cm4ge1xuICAgIC4uLmdldENvcmVQcm9wZXJ0aWVzKGNvbXBvbmVudE9wdGlvbnMpLFxuICAgICRfdnVlVGVzdFV0aWxzX29yaWdpbmFsOiBvcmlnaW5hbENvbXBvbmVudCxcbiAgICAkX2RvTm90U3R1YkNoaWxkcmVuOiB0cnVlLFxuICAgIHJlbmRlcihoLCBjb250ZXh0KSB7XG4gICAgICByZXR1cm4gaChcbiAgICAgICAgdGFnTmFtZSxcbiAgICAgICAge1xuICAgICAgICAgIHJlZjogY29tcG9uZW50T3B0aW9ucy5mdW5jdGlvbmFsID8gY29udGV4dC5kYXRhLnJlZiA6IHVuZGVmaW5lZCxcbiAgICAgICAgICBhdHRyczogY29tcG9uZW50T3B0aW9ucy5mdW5jdGlvbmFsXG4gICAgICAgICAgICA/IHtcbiAgICAgICAgICAgICAgICAuLi5jb250ZXh0LnByb3BzLFxuICAgICAgICAgICAgICAgIC4uLmNvbnRleHQuZGF0YS5hdHRycyxcbiAgICAgICAgICAgICAgICBjbGFzczogY3JlYXRlQ2xhc3NTdHJpbmcoXG4gICAgICAgICAgICAgICAgICBjb250ZXh0LmRhdGEuc3RhdGljQ2xhc3MsXG4gICAgICAgICAgICAgICAgICBjb250ZXh0LmRhdGEuY2xhc3NcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIDoge1xuICAgICAgICAgICAgICAgIC4uLnRoaXMuJHByb3BzXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgY29udGV4dFxuICAgICAgICAgID8gY29udGV4dC5jaGlsZHJlblxuICAgICAgICAgIDogdGhpcy4kb3B0aW9ucy5fcmVuZGVyQ2hpbGRyZW4gfHxcbiAgICAgICAgICAgICAgZ2V0U2NvcGVkU2xvdFJlbmRlckZ1bmN0aW9ucyh0aGlzKS5tYXAoeCA9PlxuICAgICAgICAgICAgICAgIHRoaXMuJG9wdGlvbnMucGFyZW50Ll92bm9kZS5kYXRhLnNjb3BlZFNsb3RzW3hdKClcbiAgICAgICAgICAgICAgKVxuICAgICAgKVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVTdHViRnJvbVN0cmluZyhcbiAgdGVtcGxhdGVTdHJpbmc6IHN0cmluZyxcbiAgb3JpZ2luYWxDb21wb25lbnQ6IENvbXBvbmVudCA9IHt9LFxuICBuYW1lOiBzdHJpbmcsXG4gIF9WdWU6IENvbXBvbmVudFxuKTogQ29tcG9uZW50IHtcbiAgaWYgKHRlbXBsYXRlQ29udGFpbnNDb21wb25lbnQodGVtcGxhdGVTdHJpbmcsIG5hbWUpKSB7XG4gICAgdGhyb3dFcnJvcignb3B0aW9ucy5zdHViIGNhbm5vdCBjb250YWluIGEgY2lyY3VsYXIgcmVmZXJlbmNlJylcbiAgfVxuICBjb25zdCBjb21wb25lbnRPcHRpb25zID0gcmVzb2x2ZU9wdGlvbnMob3JpZ2luYWxDb21wb25lbnQsIF9WdWUpXG5cbiAgcmV0dXJuIHtcbiAgICAuLi5nZXRDb3JlUHJvcGVydGllcyhjb21wb25lbnRPcHRpb25zKSxcbiAgICAkX2RvTm90U3R1YkNoaWxkcmVuOiB0cnVlLFxuICAgIC4uLmNvbXBpbGVGcm9tU3RyaW5nKHRlbXBsYXRlU3RyaW5nKVxuICB9XG59XG5cbmZ1bmN0aW9uIHZhbGlkYXRlU3R1YihzdHViKSB7XG4gIGlmICghaXNWYWxpZFN0dWIoc3R1YikpIHtcbiAgICB0aHJvd0Vycm9yKGBvcHRpb25zLnN0dWIgdmFsdWVzIG11c3QgYmUgcGFzc2VkIGEgc3RyaW5nIG9yIGAgKyBgY29tcG9uZW50YClcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU3R1YnNGcm9tU3R1YnNPYmplY3QoXG4gIG9yaWdpbmFsQ29tcG9uZW50czogT2JqZWN0ID0ge30sXG4gIHN0dWJzOiBPYmplY3QsXG4gIF9WdWU6IENvbXBvbmVudFxuKTogQ29tcG9uZW50cyB7XG4gIHJldHVybiBPYmplY3Qua2V5cyhzdHVicyB8fCB7fSkucmVkdWNlKChhY2MsIHN0dWJOYW1lKSA9PiB7XG4gICAgY29uc3Qgc3R1YiA9IHN0dWJzW3N0dWJOYW1lXVxuXG4gICAgdmFsaWRhdGVTdHViKHN0dWIpXG5cbiAgICBpZiAoc3R1YiA9PT0gZmFsc2UpIHtcbiAgICAgIHJldHVybiBhY2NcbiAgICB9XG5cbiAgICBpZiAoc3R1YiA9PT0gdHJ1ZSkge1xuICAgICAgY29uc3QgY29tcG9uZW50ID0gcmVzb2x2ZUNvbXBvbmVudChvcmlnaW5hbENvbXBvbmVudHMsIHN0dWJOYW1lKVxuICAgICAgYWNjW3N0dWJOYW1lXSA9IGNyZWF0ZVN0dWJGcm9tQ29tcG9uZW50KGNvbXBvbmVudCwgc3R1Yk5hbWUsIF9WdWUpXG4gICAgICByZXR1cm4gYWNjXG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBzdHViID09PSAnc3RyaW5nJykge1xuICAgICAgY29uc3QgY29tcG9uZW50ID0gcmVzb2x2ZUNvbXBvbmVudChvcmlnaW5hbENvbXBvbmVudHMsIHN0dWJOYW1lKVxuICAgICAgYWNjW3N0dWJOYW1lXSA9IGNyZWF0ZVN0dWJGcm9tU3RyaW5nKHN0dWIsIGNvbXBvbmVudCwgc3R1Yk5hbWUsIF9WdWUpXG4gICAgICByZXR1cm4gYWNjXG4gICAgfVxuXG4gICAgaWYgKGNvbXBvbmVudE5lZWRzQ29tcGlsaW5nKHN0dWIpKSB7XG4gICAgICBjb21waWxlVGVtcGxhdGUoc3R1YilcbiAgICB9XG5cbiAgICBhY2Nbc3R1Yk5hbWVdID0gc3R1YlxuICAgIHN0dWIuX0N0b3IgPSB7fVxuXG4gICAgcmV0dXJuIGFjY1xuICB9LCB7fSlcbn1cbiIsImltcG9ydCB7IGNyZWF0ZVN0dWJGcm9tQ29tcG9uZW50IH0gZnJvbSAnLi9jcmVhdGUtY29tcG9uZW50LXN0dWJzJ1xuaW1wb3J0IHsgcmVzb2x2ZUNvbXBvbmVudCB9IGZyb20gJ3NoYXJlZC91dGlsJ1xuaW1wb3J0IHtcbiAgaXNSZXNlcnZlZFRhZyxcbiAgaXNDb25zdHJ1Y3RvcixcbiAgaXNEeW5hbWljQ29tcG9uZW50LFxuICBpc0NvbXBvbmVudE9wdGlvbnNcbn0gZnJvbSAnc2hhcmVkL3ZhbGlkYXRvcnMnXG5pbXBvcnQge1xuICBCRUZPUkVfUkVOREVSX0xJRkVDWUNMRV9IT09LLFxuICBDUkVBVEVfRUxFTUVOVF9BTElBU1xufSBmcm9tICdzaGFyZWQvY29uc3RzJ1xuXG5jb25zdCBpc1doaXRlbGlzdGVkID0gKGVsLCB3aGl0ZWxpc3QpID0+IHJlc29sdmVDb21wb25lbnQoZWwsIHdoaXRlbGlzdClcbmNvbnN0IGlzQWxyZWFkeVN0dWJiZWQgPSAoZWwsIHN0dWJzKSA9PiBzdHVicy5oYXMoZWwpXG5cbmZ1bmN0aW9uIHNob3VsZEV4dGVuZChjb21wb25lbnQsIF9WdWUpIHtcbiAgcmV0dXJuIGlzQ29uc3RydWN0b3IoY29tcG9uZW50KSB8fCAoY29tcG9uZW50ICYmIGNvbXBvbmVudC5leHRlbmRzKVxufVxuXG5mdW5jdGlvbiBleHRlbmQoY29tcG9uZW50LCBfVnVlKSB7XG4gIGNvbnN0IGNvbXBvbmVudE9wdGlvbnMgPSBjb21wb25lbnQub3B0aW9ucyA/IGNvbXBvbmVudC5vcHRpb25zIDogY29tcG9uZW50XG4gIGNvbnN0IHN0dWIgPSBfVnVlLmV4dGVuZChjb21wb25lbnRPcHRpb25zKVxuICBjb21wb25lbnRPcHRpb25zLl9DdG9yID0ge31cbiAgc3R1Yi5vcHRpb25zLiRfdnVlVGVzdFV0aWxzX29yaWdpbmFsID0gY29tcG9uZW50XG4gIHN0dWIub3B0aW9ucy5fYmFzZSA9IF9WdWVcbiAgcmV0dXJuIHN0dWJcbn1cblxuZnVuY3Rpb24gY3JlYXRlU3R1YklmTmVlZGVkKHNob3VsZFN0dWIsIGNvbXBvbmVudCwgX1Z1ZSwgZWwpIHtcbiAgaWYgKHNob3VsZFN0dWIpIHtcbiAgICByZXR1cm4gY3JlYXRlU3R1YkZyb21Db21wb25lbnQoY29tcG9uZW50IHx8IHt9LCBlbCwgX1Z1ZSlcbiAgfVxuXG4gIGlmIChzaG91bGRFeHRlbmQoY29tcG9uZW50LCBfVnVlKSkge1xuICAgIHJldHVybiBleHRlbmQoY29tcG9uZW50LCBfVnVlKVxuICB9XG59XG5cbmZ1bmN0aW9uIHNob3VsZE5vdEJlU3R1YmJlZChlbCwgd2hpdGVsaXN0LCBtb2RpZmllZENvbXBvbmVudHMpIHtcbiAgcmV0dXJuIChcbiAgICAodHlwZW9mIGVsID09PSAnc3RyaW5nJyAmJiBpc1Jlc2VydmVkVGFnKGVsKSkgfHxcbiAgICBpc1doaXRlbGlzdGVkKGVsLCB3aGl0ZWxpc3QpIHx8XG4gICAgaXNBbHJlYWR5U3R1YmJlZChlbCwgbW9kaWZpZWRDb21wb25lbnRzKVxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXRjaENyZWF0ZUVsZW1lbnQoX1Z1ZSwgc3R1YnMsIHN0dWJBbGxDb21wb25lbnRzKSB7XG4gIC8vIFRoaXMgbWl4aW4gcGF0Y2hlcyB2bS4kY3JlYXRlRWxlbWVudCBzbyB0aGF0IHdlIGNhbiBzdHViIGFsbCBjb21wb25lbnRzXG4gIC8vIGJlZm9yZSB0aGV5IGFyZSByZW5kZXJlZCBpbiBzaGFsbG93IG1vZGUuIFdlIGFsc28gbmVlZCB0byBlbnN1cmUgdGhhdFxuICAvLyBjb21wb25lbnQgY29uc3RydWN0b3JzIHdlcmUgY3JlYXRlZCBmcm9tIHRoZSBfVnVlIGNvbnN0cnVjdG9yLiBJZiBub3QsXG4gIC8vIHdlIG11c3QgcmVwbGFjZSB0aGVtIHdpdGggY29tcG9uZW50cyBjcmVhdGVkIGZyb20gdGhlIF9WdWUgY29uc3RydWN0b3JcbiAgLy8gYmVmb3JlIGNhbGxpbmcgdGhlIG9yaWdpbmFsICRjcmVhdGVFbGVtZW50LiBUaGlzIGVuc3VyZXMgdGhhdCBjb21wb25lbnRzXG4gIC8vIGhhdmUgdGhlIGNvcnJlY3QgaW5zdGFuY2UgcHJvcGVydGllcyBhbmQgc3R1YnMgd2hlbiB0aGV5IGFyZSByZW5kZXJlZC5cbiAgZnVuY3Rpb24gcGF0Y2hDcmVhdGVFbGVtZW50TWl4aW4oKSB7XG4gICAgY29uc3Qgdm0gPSB0aGlzXG5cbiAgICBpZiAodm0uJG9wdGlvbnMuJF9kb05vdFN0dWJDaGlsZHJlbiB8fCB2bS4kb3B0aW9ucy5faXNGdW5jdGlvbmFsQ29udGFpbmVyKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCBtb2RpZmllZENvbXBvbmVudHMgPSBuZXcgU2V0KClcbiAgICBjb25zdCBvcmlnaW5hbENyZWF0ZUVsZW1lbnQgPSB2bS4kY3JlYXRlRWxlbWVudFxuICAgIGNvbnN0IG9yaWdpbmFsQ29tcG9uZW50cyA9IHZtLiRvcHRpb25zLmNvbXBvbmVudHNcblxuICAgIGNvbnN0IGNyZWF0ZUVsZW1lbnQgPSAoZWwsIC4uLmFyZ3MpID0+IHtcbiAgICAgIGlmIChzaG91bGROb3RCZVN0dWJiZWQoZWwsIHN0dWJzLCBtb2RpZmllZENvbXBvbmVudHMpKSB7XG4gICAgICAgIHJldHVybiBvcmlnaW5hbENyZWF0ZUVsZW1lbnQoZWwsIC4uLmFyZ3MpXG4gICAgICB9XG5cbiAgICAgIGlmIChpc0NvbnN0cnVjdG9yKGVsKSB8fCBpc0NvbXBvbmVudE9wdGlvbnMoZWwpKSB7XG4gICAgICAgIGlmIChzdHViQWxsQ29tcG9uZW50cykge1xuICAgICAgICAgIGNvbnN0IHN0dWIgPSBjcmVhdGVTdHViRnJvbUNvbXBvbmVudChlbCwgZWwubmFtZSB8fCAnYW5vbnltb3VzJywgX1Z1ZSlcbiAgICAgICAgICByZXR1cm4gb3JpZ2luYWxDcmVhdGVFbGVtZW50KHN0dWIsIC4uLmFyZ3MpXG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgQ29uc3RydWN0b3IgPSBzaG91bGRFeHRlbmQoZWwsIF9WdWUpID8gZXh0ZW5kKGVsLCBfVnVlKSA6IGVsXG5cbiAgICAgICAgcmV0dXJuIG9yaWdpbmFsQ3JlYXRlRWxlbWVudChDb25zdHJ1Y3RvciwgLi4uYXJncylcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBlbCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgY29uc3Qgb3JpZ2luYWwgPSByZXNvbHZlQ29tcG9uZW50KGVsLCBvcmlnaW5hbENvbXBvbmVudHMpXG5cbiAgICAgICAgaWYgKCFvcmlnaW5hbCkge1xuICAgICAgICAgIHJldHVybiBvcmlnaW5hbENyZWF0ZUVsZW1lbnQoZWwsIC4uLmFyZ3MpXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaXNEeW5hbWljQ29tcG9uZW50KG9yaWdpbmFsKSkge1xuICAgICAgICAgIHJldHVybiBvcmlnaW5hbENyZWF0ZUVsZW1lbnQoZWwsIC4uLmFyZ3MpXG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzdHViID0gY3JlYXRlU3R1YklmTmVlZGVkKHN0dWJBbGxDb21wb25lbnRzLCBvcmlnaW5hbCwgX1Z1ZSwgZWwpXG5cbiAgICAgICAgaWYgKHN0dWIpIHtcbiAgICAgICAgICBPYmplY3QuYXNzaWduKHZtLiRvcHRpb25zLmNvbXBvbmVudHMsIHtcbiAgICAgICAgICAgIFtlbF06IHN0dWJcbiAgICAgICAgICB9KVxuICAgICAgICAgIG1vZGlmaWVkQ29tcG9uZW50cy5hZGQoZWwpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG9yaWdpbmFsQ3JlYXRlRWxlbWVudChlbCwgLi4uYXJncylcbiAgICB9XG5cbiAgICB2bVtDUkVBVEVfRUxFTUVOVF9BTElBU10gPSBjcmVhdGVFbGVtZW50XG4gICAgdm0uJGNyZWF0ZUVsZW1lbnQgPSBjcmVhdGVFbGVtZW50XG4gIH1cblxuICBfVnVlLm1peGluKHtcbiAgICBbQkVGT1JFX1JFTkRFUl9MSUZFQ1lDTEVfSE9PS106IHBhdGNoQ3JlYXRlRWxlbWVudE1peGluXG4gIH0pXG59XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgeyBjcmVhdGVTbG90Vk5vZGVzIH0gZnJvbSAnLi9jcmVhdGUtc2xvdC12bm9kZXMnXG5pbXBvcnQgYWRkTW9ja3MgZnJvbSAnLi9hZGQtbW9ja3MnXG5pbXBvcnQgeyBhZGRFdmVudExvZ2dlciB9IGZyb20gJy4vbG9nLWV2ZW50cydcbmltcG9ydCB7IGFkZFN0dWJzIH0gZnJvbSAnLi9hZGQtc3R1YnMnXG5pbXBvcnQgeyBjb21waWxlVGVtcGxhdGUgfSBmcm9tICdzaGFyZWQvY29tcGlsZS10ZW1wbGF0ZSdcbmltcG9ydCBleHRyYWN0SW5zdGFuY2VPcHRpb25zIGZyb20gJy4vZXh0cmFjdC1pbnN0YW5jZS1vcHRpb25zJ1xuaW1wb3J0IHsgY29tcG9uZW50TmVlZHNDb21waWxpbmcsIGlzQ29uc3RydWN0b3IgfSBmcm9tICdzaGFyZWQvdmFsaWRhdG9ycydcbmltcG9ydCBjcmVhdGVTY29wZWRTbG90cyBmcm9tICcuL2NyZWF0ZS1zY29wZWQtc2xvdHMnXG5pbXBvcnQgeyBjcmVhdGVTdHVic0Zyb21TdHVic09iamVjdCB9IGZyb20gJy4vY3JlYXRlLWNvbXBvbmVudC1zdHVicydcbmltcG9ydCB7IHBhdGNoQ3JlYXRlRWxlbWVudCB9IGZyb20gJy4vcGF0Y2gtY3JlYXRlLWVsZW1lbnQnXG5cbmZ1bmN0aW9uIGNyZWF0ZUNvbnRleHQob3B0aW9ucywgc2NvcGVkU2xvdHMpIHtcbiAgY29uc3Qgb24gPSB7XG4gICAgLi4uKG9wdGlvbnMuY29udGV4dCAmJiBvcHRpb25zLmNvbnRleHQub24pLFxuICAgIC4uLm9wdGlvbnMubGlzdGVuZXJzXG4gIH1cbiAgcmV0dXJuIHtcbiAgICBhdHRyczoge1xuICAgICAgLi4ub3B0aW9ucy5hdHRycyxcbiAgICAgIC8vIHBhc3MgYXMgYXR0cnMgc28gdGhhdCBpbmhlcml0QXR0cnMgd29ya3MgY29ycmVjdGx5XG4gICAgICAvLyBwcm9wc0RhdGEgc2hvdWxkIHRha2UgcHJlY2VkZW5jZSBvdmVyIGF0dHJzXG4gICAgICAuLi5vcHRpb25zLnByb3BzRGF0YVxuICAgIH0sXG4gICAgLi4uKG9wdGlvbnMuY29udGV4dCB8fCB7fSksXG4gICAgb24sXG4gICAgc2NvcGVkU2xvdHNcbiAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVDaGlsZHJlbih2bSwgaCwgeyBzbG90cywgY29udGV4dCB9KSB7XG4gIGNvbnN0IHNsb3RWTm9kZXMgPSBzbG90cyA/IGNyZWF0ZVNsb3RWTm9kZXModm0sIHNsb3RzKSA6IHVuZGVmaW5lZFxuICByZXR1cm4gKFxuICAgIChjb250ZXh0ICYmXG4gICAgICBjb250ZXh0LmNoaWxkcmVuICYmXG4gICAgICBjb250ZXh0LmNoaWxkcmVuLm1hcCh4ID0+ICh0eXBlb2YgeCA9PT0gJ2Z1bmN0aW9uJyA/IHgoaCkgOiB4KSkpIHx8XG4gICAgc2xvdFZOb2Rlc1xuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNyZWF0ZUluc3RhbmNlKFxuICBjb21wb25lbnQ6IENvbXBvbmVudCxcbiAgb3B0aW9uczogTm9ybWFsaXplZE9wdGlvbnMsXG4gIF9WdWU6IENvbXBvbmVudFxuKTogQ29tcG9uZW50IHtcbiAgY29uc3QgY29tcG9uZW50T3B0aW9ucyA9IGlzQ29uc3RydWN0b3IoY29tcG9uZW50KVxuICAgID8gY29tcG9uZW50Lm9wdGlvbnNcbiAgICA6IGNvbXBvbmVudFxuXG4gIC8vIGluc3RhbmNlIG9wdGlvbnMgYXJlIG9wdGlvbnMgdGhhdCBhcmUgcGFzc2VkIHRvIHRoZVxuICAvLyByb290IGluc3RhbmNlIHdoZW4gaXQncyBpbnN0YW50aWF0ZWRcbiAgY29uc3QgaW5zdGFuY2VPcHRpb25zID0gZXh0cmFjdEluc3RhbmNlT3B0aW9ucyhvcHRpb25zKVxuXG4gIGNvbnN0IGdsb2JhbENvbXBvbmVudHMgPSBfVnVlLm9wdGlvbnMuY29tcG9uZW50cyB8fCB7fVxuICBjb25zdCBjb21wb25lbnRzVG9TdHViID0gT2JqZWN0LmFzc2lnbihcbiAgICBPYmplY3QuY3JlYXRlKGdsb2JhbENvbXBvbmVudHMpLFxuICAgIGNvbXBvbmVudE9wdGlvbnMuY29tcG9uZW50c1xuICApXG5cbiAgY29uc3Qgc3R1YkNvbXBvbmVudHNPYmplY3QgPSBjcmVhdGVTdHVic0Zyb21TdHVic09iamVjdChcbiAgICBjb21wb25lbnRzVG9TdHViLFxuICAgIC8vICRGbG93SWdub3JlXG4gICAgb3B0aW9ucy5zdHVicyxcbiAgICBfVnVlXG4gIClcblxuICBhZGRFdmVudExvZ2dlcihfVnVlKVxuICBhZGRNb2NrcyhfVnVlLCBvcHRpb25zLm1vY2tzKVxuICBhZGRTdHVicyhfVnVlLCBzdHViQ29tcG9uZW50c09iamVjdClcbiAgcGF0Y2hDcmVhdGVFbGVtZW50KF9WdWUsIHN0dWJDb21wb25lbnRzT2JqZWN0LCBvcHRpb25zLnNob3VsZFByb3h5KVxuXG4gIGlmIChjb21wb25lbnROZWVkc0NvbXBpbGluZyhjb21wb25lbnRPcHRpb25zKSkge1xuICAgIGNvbXBpbGVUZW1wbGF0ZShjb21wb25lbnRPcHRpb25zKVxuICB9XG5cbiAgLy8gdXNlZCB0byBpZGVudGlmeSBleHRlbmRlZCBjb21wb25lbnQgdXNpbmcgY29uc3RydWN0b3JcbiAgY29tcG9uZW50T3B0aW9ucy4kX3Z1ZVRlc3RVdGlsc19vcmlnaW5hbCA9IGNvbXBvbmVudFxuXG4gIC8vIHdhdGNoZXJzIHByb3ZpZGVkIGluIG1vdW50aW5nIG9wdGlvbnMgc2hvdWxkIG92ZXJyaWRlIHByZWV4aXN0aW5nIG9uZXNcbiAgaWYgKGNvbXBvbmVudE9wdGlvbnMud2F0Y2ggJiYgaW5zdGFuY2VPcHRpb25zLndhdGNoKSB7XG4gICAgY29uc3QgY29tcG9uZW50V2F0Y2hlcnMgPSBPYmplY3Qua2V5cyhjb21wb25lbnRPcHRpb25zLndhdGNoKVxuICAgIGNvbnN0IGluc3RhbmNlV2F0Y2hlcnMgPSBPYmplY3Qua2V5cyhpbnN0YW5jZU9wdGlvbnMud2F0Y2gpXG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGluc3RhbmNlV2F0Y2hlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGsgPSBpbnN0YW5jZVdhdGNoZXJzW2ldXG4gICAgICAvLyBvdmVycmlkZSB0aGUgY29tcG9uZW50T3B0aW9ucyB3aXRoIHRoZSBvbmUgcHJvdmlkZWQgaW4gbW91bnRpbmcgb3B0aW9uc1xuICAgICAgaWYgKGNvbXBvbmVudFdhdGNoZXJzLmluY2x1ZGVzKGspKSB7XG4gICAgICAgIGNvbXBvbmVudE9wdGlvbnMud2F0Y2hba10gPSBpbnN0YW5jZU9wdGlvbnMud2F0Y2hba11cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBtYWtlIHN1cmUgYWxsIGV4dGVuZHMgYXJlIGJhc2VkIG9uIHRoaXMgaW5zdGFuY2VcbiAgY29uc3QgQ29uc3RydWN0b3IgPSBfVnVlLmV4dGVuZChjb21wb25lbnRPcHRpb25zKS5leHRlbmQoaW5zdGFuY2VPcHRpb25zKVxuICBjb21wb25lbnRPcHRpb25zLl9DdG9yID0ge31cbiAgQ29uc3RydWN0b3Iub3B0aW9ucy5fYmFzZSA9IF9WdWVcblxuICBjb25zdCBzY29wZWRTbG90cyA9IGNyZWF0ZVNjb3BlZFNsb3RzKG9wdGlvbnMuc2NvcGVkU2xvdHMsIF9WdWUpXG5cbiAgY29uc3QgcGFyZW50Q29tcG9uZW50T3B0aW9ucyA9IG9wdGlvbnMucGFyZW50Q29tcG9uZW50IHx8IHt9XG5cbiAgcGFyZW50Q29tcG9uZW50T3B0aW9ucy5wcm92aWRlID0gb3B0aW9ucy5wcm92aWRlXG4gIHBhcmVudENvbXBvbmVudE9wdGlvbnMuX3Byb3ZpZGVkID0gb3B0aW9ucy5wcm92aWRlXG4gIHBhcmVudENvbXBvbmVudE9wdGlvbnMuJF9kb05vdFN0dWJDaGlsZHJlbiA9IHRydWVcbiAgcGFyZW50Q29tcG9uZW50T3B0aW9ucy5faXNGdW5jdGlvbmFsQ29udGFpbmVyID0gY29tcG9uZW50T3B0aW9ucy5mdW5jdGlvbmFsXG4gIHBhcmVudENvbXBvbmVudE9wdGlvbnMucmVuZGVyID0gZnVuY3Rpb24oaCkge1xuICAgIHJldHVybiBoKFxuICAgICAgQ29uc3RydWN0b3IsXG4gICAgICBjcmVhdGVDb250ZXh0KG9wdGlvbnMsIHNjb3BlZFNsb3RzKSxcbiAgICAgIGNyZWF0ZUNoaWxkcmVuKHRoaXMsIGgsIG9wdGlvbnMpXG4gICAgKVxuICB9XG4gIGNvbnN0IFBhcmVudCA9IF9WdWUuZXh0ZW5kKHBhcmVudENvbXBvbmVudE9wdGlvbnMpXG5cbiAgcmV0dXJuIG5ldyBQYXJlbnQoKVxufVxuIiwiaW1wb3J0IHsgaXNQbGFpbk9iamVjdCB9IGZyb20gJy4vdmFsaWRhdG9ycydcbmltcG9ydCB7IHRocm93RXJyb3IgfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQgeyBWVUVfVkVSU0lPTiB9IGZyb20gJy4vY29uc3RzJ1xuXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplU3R1YnMoc3R1YnMgPSB7fSkge1xuICBpZiAoc3R1YnMgPT09IGZhbHNlKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbiAgaWYgKGlzUGxhaW5PYmplY3Qoc3R1YnMpKSB7XG4gICAgcmV0dXJuIHN0dWJzXG4gIH1cbiAgaWYgKEFycmF5LmlzQXJyYXkoc3R1YnMpKSB7XG4gICAgcmV0dXJuIHN0dWJzLnJlZHVjZSgoYWNjLCBzdHViKSA9PiB7XG4gICAgICBpZiAodHlwZW9mIHN0dWIgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRocm93RXJyb3IoJ2VhY2ggaXRlbSBpbiBhbiBvcHRpb25zLnN0dWJzIGFycmF5IG11c3QgYmUgYSBzdHJpbmcnKVxuICAgICAgfVxuICAgICAgYWNjW3N0dWJdID0gdHJ1ZVxuICAgICAgcmV0dXJuIGFjY1xuICAgIH0sIHt9KVxuICB9XG4gIHRocm93RXJyb3IoJ29wdGlvbnMuc3R1YnMgbXVzdCBiZSBhbiBvYmplY3Qgb3IgYW4gQXJyYXknKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplUHJvdmlkZShwcm92aWRlKSB7XG4gIC8vIE9iamVjdHMgYXJlIG5vdCByZXNvbHZlZCBpbiBleHRlbmRlZCBjb21wb25lbnRzIGluIFZ1ZSA8IDIuNVxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vdnVlanMvdnVlL2lzc3Vlcy82NDM2XG4gIGlmICh0eXBlb2YgcHJvdmlkZSA9PT0gJ29iamVjdCcgJiYgVlVFX1ZFUlNJT04gPCAyLjUpIHtcbiAgICBjb25zdCBvYmogPSB7IC4uLnByb3ZpZGUgfVxuICAgIHJldHVybiAoKSA9PiBvYmpcbiAgfVxuICByZXR1cm4gcHJvdmlkZVxufVxuIiwiLy8gQGZsb3dcbmltcG9ydCB7IG5vcm1hbGl6ZVN0dWJzLCBub3JtYWxpemVQcm92aWRlIH0gZnJvbSAnLi9ub3JtYWxpemUnXG5cbmZ1bmN0aW9uIGdldE9wdGlvbihvcHRpb24sIGNvbmZpZz86IE9iamVjdCk6IGFueSB7XG4gIGlmIChvcHRpb24gPT09IGZhbHNlKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbiAgaWYgKG9wdGlvbiB8fCAoY29uZmlnICYmIE9iamVjdC5rZXlzKGNvbmZpZykubGVuZ3RoID4gMCkpIHtcbiAgICBpZiAob3B0aW9uIGluc3RhbmNlb2YgRnVuY3Rpb24pIHtcbiAgICAgIHJldHVybiBvcHRpb25cbiAgICB9XG4gICAgaWYgKGNvbmZpZyBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENvbmZpZyBjYW4ndCBiZSBhIEZ1bmN0aW9uLmApXG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAuLi5jb25maWcsXG4gICAgICAuLi5vcHRpb25cbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0U3R1YnMoc3R1YnMsIGNvbmZpZ1N0dWJzKTogT2JqZWN0IHtcbiAgY29uc3Qgbm9ybWFsaXplZFN0dWJzID0gbm9ybWFsaXplU3R1YnMoc3R1YnMpXG4gIGNvbnN0IG5vcm1hbGl6ZWRDb25maWdTdHVicyA9IG5vcm1hbGl6ZVN0dWJzKGNvbmZpZ1N0dWJzKVxuICByZXR1cm4gZ2V0T3B0aW9uKG5vcm1hbGl6ZWRTdHVicywgbm9ybWFsaXplZENvbmZpZ1N0dWJzKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbWVyZ2VPcHRpb25zKFxuICBvcHRpb25zOiBPcHRpb25zLFxuICBjb25maWc6IENvbmZpZ1xuKTogTm9ybWFsaXplZE9wdGlvbnMge1xuICBjb25zdCBtb2NrcyA9IChnZXRPcHRpb24ob3B0aW9ucy5tb2NrcywgY29uZmlnLm1vY2tzKTogT2JqZWN0KVxuICBjb25zdCBtZXRob2RzID0gKGdldE9wdGlvbihvcHRpb25zLm1ldGhvZHMsIGNvbmZpZy5tZXRob2RzKToge1xuICAgIFtrZXk6IHN0cmluZ106IEZ1bmN0aW9uXG4gIH0pXG4gIGNvbnN0IHByb3ZpZGUgPSAoZ2V0T3B0aW9uKG9wdGlvbnMucHJvdmlkZSwgY29uZmlnLnByb3ZpZGUpOiBPYmplY3QpXG4gIGNvbnN0IHN0dWJzID0gKGdldFN0dWJzKG9wdGlvbnMuc3R1YnMsIGNvbmZpZy5zdHVicyk6IE9iamVjdClcbiAgLy8gJEZsb3dJZ25vcmVcbiAgcmV0dXJuIHtcbiAgICAuLi5vcHRpb25zLFxuICAgIHByb3ZpZGU6IG5vcm1hbGl6ZVByb3ZpZGUocHJvdmlkZSksXG4gICAgc3R1YnMsXG4gICAgbW9ja3MsXG4gICAgbWV0aG9kc1xuICB9XG59XG4iLCJpbXBvcnQgKiBhcyB0ZXN0VXRpbHMgZnJvbSAnQHZ1ZS90ZXN0LXV0aWxzJ1xuXG5leHBvcnQgZGVmYXVsdCB0ZXN0VXRpbHMuY29uZmlnXG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgeyB0aHJvd0Vycm9yIH0gZnJvbSAnc2hhcmVkL3V0aWwnXG5pbXBvcnQgeyBjb21waWxlVG9GdW5jdGlvbnMgfSBmcm9tICd2dWUtdGVtcGxhdGUtY29tcGlsZXInXG5pbXBvcnQgeyBpc1Z1ZUNvbXBvbmVudCB9IGZyb20gJy4vdmFsaWRhdG9ycydcblxuZnVuY3Rpb24gaXNWYWxpZFNsb3Qoc2xvdDogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiBpc1Z1ZUNvbXBvbmVudChzbG90KSB8fCB0eXBlb2Ygc2xvdCA9PT0gJ3N0cmluZydcbn1cblxuZnVuY3Rpb24gcmVxdWlyZXNUZW1wbGF0ZUNvbXBpbGVyKHNsb3Q6IGFueSk6IHZvaWQge1xuICBpZiAodHlwZW9mIHNsb3QgPT09ICdzdHJpbmcnICYmICFjb21waWxlVG9GdW5jdGlvbnMpIHtcbiAgICB0aHJvd0Vycm9yKFxuICAgICAgYHZ1ZVRlbXBsYXRlQ29tcGlsZXIgaXMgdW5kZWZpbmVkLCB5b3UgbXVzdCBwYXNzIGAgK1xuICAgICAgICBgcHJlY29tcGlsZWQgY29tcG9uZW50cyBpZiB2dWUtdGVtcGxhdGUtY29tcGlsZXIgaXMgYCArXG4gICAgICAgIGB1bmRlZmluZWRgXG4gICAgKVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZVNsb3RzKHNsb3RzOiBTbG90c09iamVjdCk6IHZvaWQge1xuICBPYmplY3Qua2V5cyhzbG90cykuZm9yRWFjaChrZXkgPT4ge1xuICAgIGNvbnN0IHNsb3QgPSBBcnJheS5pc0FycmF5KHNsb3RzW2tleV0pID8gc2xvdHNba2V5XSA6IFtzbG90c1trZXldXVxuXG4gICAgc2xvdC5mb3JFYWNoKHNsb3RWYWx1ZSA9PiB7XG4gICAgICBpZiAoIWlzVmFsaWRTbG90KHNsb3RWYWx1ZSkpIHtcbiAgICAgICAgdGhyb3dFcnJvcihcbiAgICAgICAgICBgc2xvdHNba2V5XSBtdXN0IGJlIGEgQ29tcG9uZW50LCBzdHJpbmcgb3IgYW4gYXJyYXkgYCArXG4gICAgICAgICAgICBgb2YgQ29tcG9uZW50c2BcbiAgICAgICAgKVxuICAgICAgfVxuICAgICAgcmVxdWlyZXNUZW1wbGF0ZUNvbXBpbGVyKHNsb3RWYWx1ZSlcbiAgICB9KVxuICB9KVxufVxuIiwiaW1wb3J0IHtcbiAgaXNQbGFpbk9iamVjdCxcbiAgaXNGdW5jdGlvbmFsQ29tcG9uZW50LFxuICBpc0NvbnN0cnVjdG9yXG59IGZyb20gJy4vdmFsaWRhdG9ycydcbmltcG9ydCB7IFZVRV9WRVJTSU9OIH0gZnJvbSAnLi9jb25zdHMnXG5pbXBvcnQgeyBjb21waWxlVGVtcGxhdGVGb3JTbG90cyB9IGZyb20gJy4vY29tcGlsZS10ZW1wbGF0ZSdcbmltcG9ydCB7IHRocm93RXJyb3IgfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQgeyB2YWxpZGF0ZVNsb3RzIH0gZnJvbSAnLi92YWxpZGF0ZS1zbG90cydcblxuZnVuY3Rpb24gdnVlRXh0ZW5kVW5zdXBwb3J0ZWRPcHRpb24ob3B0aW9uKSB7XG4gIHJldHVybiAoXG4gICAgYG9wdGlvbnMuJHtvcHRpb259IGlzIG5vdCBzdXBwb3J0ZWQgZm9yIGAgK1xuICAgIGBjb21wb25lbnRzIGNyZWF0ZWQgd2l0aCBWdWUuZXh0ZW5kIGluIFZ1ZSA8IDIuMy4gYCArXG4gICAgYFlvdSBjYW4gc2V0ICR7b3B0aW9ufSB0byBmYWxzZSB0byBtb3VudCB0aGUgY29tcG9uZW50LmBcbiAgKVxufVxuLy8gdGhlc2Ugb3B0aW9ucyBhcmVuJ3Qgc3VwcG9ydGVkIGlmIFZ1ZSBpcyB2ZXJzaW9uIDwgMi4zXG4vLyBmb3IgY29tcG9uZW50cyB1c2luZyBWdWUuZXh0ZW5kLiBUaGlzIGlzIGR1ZSB0byBhIGJ1Z1xuLy8gdGhhdCBtZWFucyB0aGUgbWl4aW5zIHdlIHVzZSB0byBhZGQgcHJvcGVydGllcyBhcmUgbm90IGFwcGxpZWRcbi8vIGNvcnJlY3RseVxuY29uc3QgVU5TVVBQT1JURURfVkVSU0lPTl9PUFRJT05TID0gWydtb2NrcycsICdzdHVicycsICdsb2NhbFZ1ZSddXG5cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZU9wdGlvbnMob3B0aW9ucywgY29tcG9uZW50KSB7XG4gIGlmIChvcHRpb25zLnBhcmVudENvbXBvbmVudCAmJiAhaXNQbGFpbk9iamVjdChvcHRpb25zLnBhcmVudENvbXBvbmVudCkpIHtcbiAgICB0aHJvd0Vycm9yKFxuICAgICAgYG9wdGlvbnMucGFyZW50Q29tcG9uZW50IHNob3VsZCBiZSBhIHZhbGlkIFZ1ZSBjb21wb25lbnQgb3B0aW9ucyBvYmplY3RgXG4gICAgKVxuICB9XG5cbiAgaWYgKCFpc0Z1bmN0aW9uYWxDb21wb25lbnQoY29tcG9uZW50KSAmJiBvcHRpb25zLmNvbnRleHQpIHtcbiAgICB0aHJvd0Vycm9yKFxuICAgICAgYG1vdW50LmNvbnRleHQgY2FuIG9ubHkgYmUgdXNlZCB3aGVuIG1vdW50aW5nIGEgZnVuY3Rpb25hbCBjb21wb25lbnRgXG4gICAgKVxuICB9XG5cbiAgaWYgKG9wdGlvbnMuY29udGV4dCAmJiAhaXNQbGFpbk9iamVjdChvcHRpb25zLmNvbnRleHQpKSB7XG4gICAgdGhyb3dFcnJvcignbW91bnQuY29udGV4dCBtdXN0IGJlIGFuIG9iamVjdCcpXG4gIH1cblxuICBpZiAoVlVFX1ZFUlNJT04gPCAyLjMgJiYgaXNDb25zdHJ1Y3Rvcihjb21wb25lbnQpKSB7XG4gICAgVU5TVVBQT1JURURfVkVSU0lPTl9PUFRJT05TLmZvckVhY2gob3B0aW9uID0+IHtcbiAgICAgIGlmIChvcHRpb25zW29wdGlvbl0pIHtcbiAgICAgICAgdGhyb3dFcnJvcih2dWVFeHRlbmRVbnN1cHBvcnRlZE9wdGlvbihvcHRpb24pKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBpZiAob3B0aW9ucy5zbG90cykge1xuICAgIGNvbXBpbGVUZW1wbGF0ZUZvclNsb3RzKG9wdGlvbnMuc2xvdHMpXG4gICAgLy8gdmFsaWRhdGUgc2xvdHMgb3V0c2lkZSBvZiB0aGUgY3JlYXRlU2xvdHMgZnVuY3Rpb24gc29cbiAgICAvLyB0aGF0IHdlIGNhbiB0aHJvdyBhbiBlcnJvciB3aXRob3V0IGl0IGJlaW5nIGNhdWdodCBieVxuICAgIC8vIHRoZSBWdWUgZXJyb3IgaGFuZGxlclxuICAgIC8vICRGbG93SWdub3JlXG4gICAgdmFsaWRhdGVTbG90cyhvcHRpb25zLnNsb3RzKVxuICB9XG59XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgVnVlIGZyb20gJ3Z1ZSdcbmltcG9ydCBjcmVhdGVJbnN0YW5jZSBmcm9tICdjcmVhdGUtaW5zdGFuY2UnXG5pbXBvcnQgeyB0aHJvd0Vycm9yIH0gZnJvbSAnc2hhcmVkL3V0aWwnXG5pbXBvcnQgeyBjcmVhdGVSZW5kZXJlciB9IGZyb20gJ3Z1ZS1zZXJ2ZXItcmVuZGVyZXInXG5pbXBvcnQgeyBtZXJnZU9wdGlvbnMgfSBmcm9tICdzaGFyZWQvbWVyZ2Utb3B0aW9ucydcbmltcG9ydCBjb25maWcgZnJvbSAnLi9jb25maWcnXG5pbXBvcnQgdGVzdFV0aWxzIGZyb20gJ0B2dWUvdGVzdC11dGlscydcbmltcG9ydCB7IHZhbGlkYXRlT3B0aW9ucyB9IGZyb20gJ3NoYXJlZC92YWxpZGF0ZS1vcHRpb25zJ1xuXG5WdWUuY29uZmlnLnByb2R1Y3Rpb25UaXAgPSBmYWxzZVxuVnVlLmNvbmZpZy5kZXZ0b29scyA9IGZhbHNlXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHJlbmRlclRvU3RyaW5nKFxuICBjb21wb25lbnQ6IENvbXBvbmVudCxcbiAgb3B0aW9uczogT3B0aW9ucyA9IHt9XG4pOiBQcm9taXNlPHN0cmluZz4ge1xuICBjb25zdCByZW5kZXJlciA9IGNyZWF0ZVJlbmRlcmVyKClcblxuICBpZiAoIXJlbmRlcmVyKSB7XG4gICAgdGhyb3dFcnJvcihcbiAgICAgIGByZW5kZXJUb1N0cmluZyBtdXN0IGJlIHJ1biBpbiBub2RlLiBJdCBjYW5ub3QgYmUgcnVuIGluIGEgYnJvd3NlcmBcbiAgICApXG4gIH1cblxuICBpZiAob3B0aW9ucy5hdHRhY2hUb0RvY3VtZW50KSB7XG4gICAgdGhyb3dFcnJvcihgeW91IGNhbm5vdCB1c2UgYXR0YWNoVG9Eb2N1bWVudCB3aXRoIHJlbmRlclRvU3RyaW5nYClcbiAgfVxuXG4gIGNvbnN0IG1lcmdlZE9wdGlvbnMgPSBtZXJnZU9wdGlvbnMob3B0aW9ucywgY29uZmlnKVxuICB2YWxpZGF0ZU9wdGlvbnMobWVyZ2VkT3B0aW9ucywgY29tcG9uZW50KVxuXG4gIGNvbnN0IHZtID0gY3JlYXRlSW5zdGFuY2UoXG4gICAgY29tcG9uZW50LFxuICAgIG1lcmdlZE9wdGlvbnMsXG4gICAgdGVzdFV0aWxzLmNyZWF0ZUxvY2FsVnVlKG9wdGlvbnMubG9jYWxWdWUpXG4gIClcblxuICByZXR1cm4gcmVuZGVyZXIucmVuZGVyVG9TdHJpbmcodm0pXG59XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgcmVuZGVyVG9TdHJpbmcgZnJvbSAnLi9yZW5kZXJUb1N0cmluZydcbmltcG9ydCBjaGVlcmlvIGZyb20gJ2NoZWVyaW8nXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHJlbmRlcihcbiAgY29tcG9uZW50OiBDb21wb25lbnQsXG4gIG9wdGlvbnM6IE9wdGlvbnMgPSB7fVxuKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgcmV0dXJuIHJlbmRlclRvU3RyaW5nKGNvbXBvbmVudCwgb3B0aW9ucykudGhlbihzdHIgPT4gY2hlZXJpby5sb2FkKCcnKShzdHIpKVxufVxuIl0sIm5hbWVzIjpbImNvbnN0IiwiY29tcGlsZVRvRnVuY3Rpb25zIiwiJCRWdWUiLCJsZXQiLCJyZXNvbHZlQ29tcG9uZW50IiwidGhpcyIsImNvbXBvbmVudCIsInN0dWIiLCJ0ZXN0VXRpbHMuY29uZmlnIiwiY3JlYXRlUmVuZGVyZXIiLCJ0ZXN0VXRpbHMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFBQTs7QUFJQSxTQUFTLFlBQVksQ0FBQyxFQUFFLEVBQWEsU0FBUyxFQUFVLElBQUksRUFBZ0I7RUFDMUVBLElBQU0sRUFBRSxHQUFHQyxzQ0FBa0I7OEJBQ0osSUFBSSxT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
