'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var vueTemplateCompiler = require('vue-template-compiler');
var Vue = _interopDefault(require('vue'));

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

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var semver = createCommonjsModule(function (module, exports) {
exports = module.exports = SemVer;

// The debug function is excluded entirely from the minified version.
/* nomin */ var debug;
/* nomin */ if (typeof process === 'object' &&
    /* nomin */ process.env &&
    /* nomin */ process.env.NODE_DEBUG &&
    /* nomin */ /\bsemver\b/i.test(process.env.NODE_DEBUG))
  /* nomin */ { debug = function() {
    /* nomin */ var args = Array.prototype.slice.call(arguments, 0);
    /* nomin */ args.unshift('SEMVER');
    /* nomin */ console.log.apply(console, args);
    /* nomin */ }; }
/* nomin */ else
  /* nomin */ { debug = function() {}; }

// Note: this is the semver.org version of the spec that it implements
// Not necessarily the package version of this code.
exports.SEMVER_SPEC_VERSION = '2.0.0';

var MAX_LENGTH = 256;
var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || 9007199254740991;

// Max safe segment length for coercion.
var MAX_SAFE_COMPONENT_LENGTH = 16;

// The actual regexps go on exports.re
var re = exports.re = [];
var src = exports.src = [];
var R = 0;

// The following Regular Expressions can be used for tokenizing,
// validating, and parsing SemVer version strings.

// ## Numeric Identifier
// A single `0`, or a non-zero digit followed by zero or more digits.

var NUMERICIDENTIFIER = R++;
src[NUMERICIDENTIFIER] = '0|[1-9]\\d*';
var NUMERICIDENTIFIERLOOSE = R++;
src[NUMERICIDENTIFIERLOOSE] = '[0-9]+';


// ## Non-numeric Identifier
// Zero or more digits, followed by a letter or hyphen, and then zero or
// more letters, digits, or hyphens.

var NONNUMERICIDENTIFIER = R++;
src[NONNUMERICIDENTIFIER] = '\\d*[a-zA-Z-][a-zA-Z0-9-]*';


// ## Main Version
// Three dot-separated numeric identifiers.

var MAINVERSION = R++;
src[MAINVERSION] = '(' + src[NUMERICIDENTIFIER] + ')\\.' +
                   '(' + src[NUMERICIDENTIFIER] + ')\\.' +
                   '(' + src[NUMERICIDENTIFIER] + ')';

var MAINVERSIONLOOSE = R++;
src[MAINVERSIONLOOSE] = '(' + src[NUMERICIDENTIFIERLOOSE] + ')\\.' +
                        '(' + src[NUMERICIDENTIFIERLOOSE] + ')\\.' +
                        '(' + src[NUMERICIDENTIFIERLOOSE] + ')';

// ## Pre-release Version Identifier
// A numeric identifier, or a non-numeric identifier.

var PRERELEASEIDENTIFIER = R++;
src[PRERELEASEIDENTIFIER] = '(?:' + src[NUMERICIDENTIFIER] +
                            '|' + src[NONNUMERICIDENTIFIER] + ')';

var PRERELEASEIDENTIFIERLOOSE = R++;
src[PRERELEASEIDENTIFIERLOOSE] = '(?:' + src[NUMERICIDENTIFIERLOOSE] +
                                 '|' + src[NONNUMERICIDENTIFIER] + ')';


// ## Pre-release Version
// Hyphen, followed by one or more dot-separated pre-release version
// identifiers.

var PRERELEASE = R++;
src[PRERELEASE] = '(?:-(' + src[PRERELEASEIDENTIFIER] +
                  '(?:\\.' + src[PRERELEASEIDENTIFIER] + ')*))';

var PRERELEASELOOSE = R++;
src[PRERELEASELOOSE] = '(?:-?(' + src[PRERELEASEIDENTIFIERLOOSE] +
                       '(?:\\.' + src[PRERELEASEIDENTIFIERLOOSE] + ')*))';

// ## Build Metadata Identifier
// Any combination of digits, letters, or hyphens.

var BUILDIDENTIFIER = R++;
src[BUILDIDENTIFIER] = '[0-9A-Za-z-]+';

// ## Build Metadata
// Plus sign, followed by one or more period-separated build metadata
// identifiers.

var BUILD = R++;
src[BUILD] = '(?:\\+(' + src[BUILDIDENTIFIER] +
             '(?:\\.' + src[BUILDIDENTIFIER] + ')*))';


// ## Full Version String
// A main version, followed optionally by a pre-release version and
// build metadata.

// Note that the only major, minor, patch, and pre-release sections of
// the version string are capturing groups.  The build metadata is not a
// capturing group, because it should not ever be used in version
// comparison.

var FULL = R++;
var FULLPLAIN = 'v?' + src[MAINVERSION] +
                src[PRERELEASE] + '?' +
                src[BUILD] + '?';

src[FULL] = '^' + FULLPLAIN + '$';

// like full, but allows v1.2.3 and =1.2.3, which people do sometimes.
// also, 1.0.0alpha1 (prerelease without the hyphen) which is pretty
// common in the npm registry.
var LOOSEPLAIN = '[v=\\s]*' + src[MAINVERSIONLOOSE] +
                 src[PRERELEASELOOSE] + '?' +
                 src[BUILD] + '?';

var LOOSE = R++;
src[LOOSE] = '^' + LOOSEPLAIN + '$';

var GTLT = R++;
src[GTLT] = '((?:<|>)?=?)';

// Something like "2.*" or "1.2.x".
// Note that "x.x" is a valid xRange identifer, meaning "any version"
// Only the first item is strictly required.
var XRANGEIDENTIFIERLOOSE = R++;
src[XRANGEIDENTIFIERLOOSE] = src[NUMERICIDENTIFIERLOOSE] + '|x|X|\\*';
var XRANGEIDENTIFIER = R++;
src[XRANGEIDENTIFIER] = src[NUMERICIDENTIFIER] + '|x|X|\\*';

var XRANGEPLAIN = R++;
src[XRANGEPLAIN] = '[v=\\s]*(' + src[XRANGEIDENTIFIER] + ')' +
                   '(?:\\.(' + src[XRANGEIDENTIFIER] + ')' +
                   '(?:\\.(' + src[XRANGEIDENTIFIER] + ')' +
                   '(?:' + src[PRERELEASE] + ')?' +
                   src[BUILD] + '?' +
                   ')?)?';

var XRANGEPLAINLOOSE = R++;
src[XRANGEPLAINLOOSE] = '[v=\\s]*(' + src[XRANGEIDENTIFIERLOOSE] + ')' +
                        '(?:\\.(' + src[XRANGEIDENTIFIERLOOSE] + ')' +
                        '(?:\\.(' + src[XRANGEIDENTIFIERLOOSE] + ')' +
                        '(?:' + src[PRERELEASELOOSE] + ')?' +
                        src[BUILD] + '?' +
                        ')?)?';

var XRANGE = R++;
src[XRANGE] = '^' + src[GTLT] + '\\s*' + src[XRANGEPLAIN] + '$';
var XRANGELOOSE = R++;
src[XRANGELOOSE] = '^' + src[GTLT] + '\\s*' + src[XRANGEPLAINLOOSE] + '$';

// Coercion.
// Extract anything that could conceivably be a part of a valid semver
var COERCE = R++;
src[COERCE] = '(?:^|[^\\d])' +
              '(\\d{1,' + MAX_SAFE_COMPONENT_LENGTH + '})' +
              '(?:\\.(\\d{1,' + MAX_SAFE_COMPONENT_LENGTH + '}))?' +
              '(?:\\.(\\d{1,' + MAX_SAFE_COMPONENT_LENGTH + '}))?' +
              '(?:$|[^\\d])';

// Tilde ranges.
// Meaning is "reasonably at or greater than"
var LONETILDE = R++;
src[LONETILDE] = '(?:~>?)';

var TILDETRIM = R++;
src[TILDETRIM] = '(\\s*)' + src[LONETILDE] + '\\s+';
re[TILDETRIM] = new RegExp(src[TILDETRIM], 'g');
var tildeTrimReplace = '$1~';

var TILDE = R++;
src[TILDE] = '^' + src[LONETILDE] + src[XRANGEPLAIN] + '$';
var TILDELOOSE = R++;
src[TILDELOOSE] = '^' + src[LONETILDE] + src[XRANGEPLAINLOOSE] + '$';

// Caret ranges.
// Meaning is "at least and backwards compatible with"
var LONECARET = R++;
src[LONECARET] = '(?:\\^)';

var CARETTRIM = R++;
src[CARETTRIM] = '(\\s*)' + src[LONECARET] + '\\s+';
re[CARETTRIM] = new RegExp(src[CARETTRIM], 'g');
var caretTrimReplace = '$1^';

var CARET = R++;
src[CARET] = '^' + src[LONECARET] + src[XRANGEPLAIN] + '$';
var CARETLOOSE = R++;
src[CARETLOOSE] = '^' + src[LONECARET] + src[XRANGEPLAINLOOSE] + '$';

// A simple gt/lt/eq thing, or just "" to indicate "any version"
var COMPARATORLOOSE = R++;
src[COMPARATORLOOSE] = '^' + src[GTLT] + '\\s*(' + LOOSEPLAIN + ')$|^$';
var COMPARATOR = R++;
src[COMPARATOR] = '^' + src[GTLT] + '\\s*(' + FULLPLAIN + ')$|^$';


// An expression to strip any whitespace between the gtlt and the thing
// it modifies, so that `> 1.2.3` ==> `>1.2.3`
var COMPARATORTRIM = R++;
src[COMPARATORTRIM] = '(\\s*)' + src[GTLT] +
                      '\\s*(' + LOOSEPLAIN + '|' + src[XRANGEPLAIN] + ')';

// this one has to use the /g flag
re[COMPARATORTRIM] = new RegExp(src[COMPARATORTRIM], 'g');
var comparatorTrimReplace = '$1$2$3';


// Something like `1.2.3 - 1.2.4`
// Note that these all use the loose form, because they'll be
// checked against either the strict or loose comparator form
// later.
var HYPHENRANGE = R++;
src[HYPHENRANGE] = '^\\s*(' + src[XRANGEPLAIN] + ')' +
                   '\\s+-\\s+' +
                   '(' + src[XRANGEPLAIN] + ')' +
                   '\\s*$';

var HYPHENRANGELOOSE = R++;
src[HYPHENRANGELOOSE] = '^\\s*(' + src[XRANGEPLAINLOOSE] + ')' +
                        '\\s+-\\s+' +
                        '(' + src[XRANGEPLAINLOOSE] + ')' +
                        '\\s*$';

// Star ranges basically just allow anything at all.
var STAR = R++;
src[STAR] = '(<|>)?=?\\s*\\*';

// Compile to actual regexp objects.
// All are flag-free, unless they were created above with a flag.
for (var i = 0; i < R; i++) {
  debug(i, src[i]);
  if (!re[i])
    { re[i] = new RegExp(src[i]); }
}

exports.parse = parse;
function parse(version, options) {
  if (!options || typeof options !== 'object')
    { options = { loose: !!options, includePrerelease: false }; }

  if (version instanceof SemVer)
    { return version; }

  if (typeof version !== 'string')
    { return null; }

  if (version.length > MAX_LENGTH)
    { return null; }

  var r = options.loose ? re[LOOSE] : re[FULL];
  if (!r.test(version))
    { return null; }

  try {
    return new SemVer(version, options);
  } catch (er) {
    return null;
  }
}

exports.valid = valid;
function valid(version, options) {
  var v = parse(version, options);
  return v ? v.version : null;
}


exports.clean = clean;
function clean(version, options) {
  var s = parse(version.trim().replace(/^[=v]+/, ''), options);
  return s ? s.version : null;
}

exports.SemVer = SemVer;

function SemVer(version, options) {
  if (!options || typeof options !== 'object')
    { options = { loose: !!options, includePrerelease: false }; }
  if (version instanceof SemVer) {
    if (version.loose === options.loose)
      { return version; }
    else
      { version = version.version; }
  } else if (typeof version !== 'string') {
    throw new TypeError('Invalid Version: ' + version);
  }

  if (version.length > MAX_LENGTH)
    { throw new TypeError('version is longer than ' + MAX_LENGTH + ' characters') }

  if (!(this instanceof SemVer))
    { return new SemVer(version, options); }

  debug('SemVer', version, options);
  this.options = options;
  this.loose = !!options.loose;

  var m = version.trim().match(options.loose ? re[LOOSE] : re[FULL]);

  if (!m)
    { throw new TypeError('Invalid Version: ' + version); }

  this.raw = version;

  // these are actually numbers
  this.major = +m[1];
  this.minor = +m[2];
  this.patch = +m[3];

  if (this.major > MAX_SAFE_INTEGER || this.major < 0)
    { throw new TypeError('Invalid major version') }

  if (this.minor > MAX_SAFE_INTEGER || this.minor < 0)
    { throw new TypeError('Invalid minor version') }

  if (this.patch > MAX_SAFE_INTEGER || this.patch < 0)
    { throw new TypeError('Invalid patch version') }

  // numberify any prerelease numeric ids
  if (!m[4])
    { this.prerelease = []; }
  else
    { this.prerelease = m[4].split('.').map(function(id) {
      if (/^[0-9]+$/.test(id)) {
        var num = +id;
        if (num >= 0 && num < MAX_SAFE_INTEGER)
          { return num; }
      }
      return id;
    }); }

  this.build = m[5] ? m[5].split('.') : [];
  this.format();
}

SemVer.prototype.format = function() {
  this.version = this.major + '.' + this.minor + '.' + this.patch;
  if (this.prerelease.length)
    { this.version += '-' + this.prerelease.join('.'); }
  return this.version;
};

SemVer.prototype.toString = function() {
  return this.version;
};

SemVer.prototype.compare = function(other) {
  debug('SemVer.compare', this.version, this.options, other);
  if (!(other instanceof SemVer))
    { other = new SemVer(other, this.options); }

  return this.compareMain(other) || this.comparePre(other);
};

SemVer.prototype.compareMain = function(other) {
  if (!(other instanceof SemVer))
    { other = new SemVer(other, this.options); }

  return compareIdentifiers(this.major, other.major) ||
         compareIdentifiers(this.minor, other.minor) ||
         compareIdentifiers(this.patch, other.patch);
};

SemVer.prototype.comparePre = function(other) {
  var this$1 = this;

  if (!(other instanceof SemVer))
    { other = new SemVer(other, this.options); }

  // NOT having a prerelease is > having one
  if (this.prerelease.length && !other.prerelease.length)
    { return -1; }
  else if (!this.prerelease.length && other.prerelease.length)
    { return 1; }
  else if (!this.prerelease.length && !other.prerelease.length)
    { return 0; }

  var i = 0;
  do {
    var a = this$1.prerelease[i];
    var b = other.prerelease[i];
    debug('prerelease compare', i, a, b);
    if (a === undefined && b === undefined)
      { return 0; }
    else if (b === undefined)
      { return 1; }
    else if (a === undefined)
      { return -1; }
    else if (a === b)
      { continue; }
    else
      { return compareIdentifiers(a, b); }
  } while (++i);
};

// preminor will bump the version up to the next minor release, and immediately
// down to pre-release. premajor and prepatch work the same way.
SemVer.prototype.inc = function(release, identifier) {
  var this$1 = this;

  switch (release) {
    case 'premajor':
      this.prerelease.length = 0;
      this.patch = 0;
      this.minor = 0;
      this.major++;
      this.inc('pre', identifier);
      break;
    case 'preminor':
      this.prerelease.length = 0;
      this.patch = 0;
      this.minor++;
      this.inc('pre', identifier);
      break;
    case 'prepatch':
      // If this is already a prerelease, it will bump to the next version
      // drop any prereleases that might already exist, since they are not
      // relevant at this point.
      this.prerelease.length = 0;
      this.inc('patch', identifier);
      this.inc('pre', identifier);
      break;
    // If the input is a non-prerelease version, this acts the same as
    // prepatch.
    case 'prerelease':
      if (this.prerelease.length === 0)
        { this.inc('patch', identifier); }
      this.inc('pre', identifier);
      break;

    case 'major':
      // If this is a pre-major version, bump up to the same major version.
      // Otherwise increment major.
      // 1.0.0-5 bumps to 1.0.0
      // 1.1.0 bumps to 2.0.0
      if (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0)
        { this.major++; }
      this.minor = 0;
      this.patch = 0;
      this.prerelease = [];
      break;
    case 'minor':
      // If this is a pre-minor version, bump up to the same minor version.
      // Otherwise increment minor.
      // 1.2.0-5 bumps to 1.2.0
      // 1.2.1 bumps to 1.3.0
      if (this.patch !== 0 || this.prerelease.length === 0)
        { this.minor++; }
      this.patch = 0;
      this.prerelease = [];
      break;
    case 'patch':
      // If this is not a pre-release version, it will increment the patch.
      // If it is a pre-release it will bump up to the same patch version.
      // 1.2.0-5 patches to 1.2.0
      // 1.2.0 patches to 1.2.1
      if (this.prerelease.length === 0)
        { this.patch++; }
      this.prerelease = [];
      break;
    // This probably shouldn't be used publicly.
    // 1.0.0 "pre" would become 1.0.0-0 which is the wrong direction.
    case 'pre':
      if (this.prerelease.length === 0)
        { this.prerelease = [0]; }
      else {
        var i = this.prerelease.length;
        while (--i >= 0) {
          if (typeof this$1.prerelease[i] === 'number') {
            this$1.prerelease[i]++;
            i = -2;
          }
        }
        if (i === -1) // didn't increment anything
          { this.prerelease.push(0); }
      }
      if (identifier) {
        // 1.2.0-beta.1 bumps to 1.2.0-beta.2,
        // 1.2.0-beta.fooblz or 1.2.0-beta bumps to 1.2.0-beta.0
        if (this.prerelease[0] === identifier) {
          if (isNaN(this.prerelease[1]))
            { this.prerelease = [identifier, 0]; }
        } else
          { this.prerelease = [identifier, 0]; }
      }
      break;

    default:
      throw new Error('invalid increment argument: ' + release);
  }
  this.format();
  this.raw = this.version;
  return this;
};

exports.inc = inc;
function inc(version, release, loose, identifier) {
  if (typeof(loose) === 'string') {
    identifier = loose;
    loose = undefined;
  }

  try {
    return new SemVer(version, loose).inc(release, identifier).version;
  } catch (er) {
    return null;
  }
}

exports.diff = diff;
function diff(version1, version2) {
  if (eq(version1, version2)) {
    return null;
  } else {
    var v1 = parse(version1);
    var v2 = parse(version2);
    if (v1.prerelease.length || v2.prerelease.length) {
      for (var key in v1) {
        if (key === 'major' || key === 'minor' || key === 'patch') {
          if (v1[key] !== v2[key]) {
            return 'pre'+key;
          }
        }
      }
      return 'prerelease';
    }
    for (var key in v1) {
      if (key === 'major' || key === 'minor' || key === 'patch') {
        if (v1[key] !== v2[key]) {
          return key;
        }
      }
    }
  }
}

exports.compareIdentifiers = compareIdentifiers;

var numeric = /^[0-9]+$/;
function compareIdentifiers(a, b) {
  var anum = numeric.test(a);
  var bnum = numeric.test(b);

  if (anum && bnum) {
    a = +a;
    b = +b;
  }

  return (anum && !bnum) ? -1 :
         (bnum && !anum) ? 1 :
         a < b ? -1 :
         a > b ? 1 :
         0;
}

exports.rcompareIdentifiers = rcompareIdentifiers;
function rcompareIdentifiers(a, b) {
  return compareIdentifiers(b, a);
}

exports.major = major;
function major(a, loose) {
  return new SemVer(a, loose).major;
}

exports.minor = minor;
function minor(a, loose) {
  return new SemVer(a, loose).minor;
}

exports.patch = patch;
function patch(a, loose) {
  return new SemVer(a, loose).patch;
}

exports.compare = compare;
function compare(a, b, loose) {
  return new SemVer(a, loose).compare(new SemVer(b, loose));
}

exports.compareLoose = compareLoose;
function compareLoose(a, b) {
  return compare(a, b, true);
}

exports.rcompare = rcompare;
function rcompare(a, b, loose) {
  return compare(b, a, loose);
}

exports.sort = sort;
function sort(list, loose) {
  return list.sort(function(a, b) {
    return exports.compare(a, b, loose);
  });
}

exports.rsort = rsort;
function rsort(list, loose) {
  return list.sort(function(a, b) {
    return exports.rcompare(a, b, loose);
  });
}

exports.gt = gt;
function gt(a, b, loose) {
  return compare(a, b, loose) > 0;
}

exports.lt = lt;
function lt(a, b, loose) {
  return compare(a, b, loose) < 0;
}

exports.eq = eq;
function eq(a, b, loose) {
  return compare(a, b, loose) === 0;
}

exports.neq = neq;
function neq(a, b, loose) {
  return compare(a, b, loose) !== 0;
}

exports.gte = gte;
function gte(a, b, loose) {
  return compare(a, b, loose) >= 0;
}

exports.lte = lte;
function lte(a, b, loose) {
  return compare(a, b, loose) <= 0;
}

exports.cmp = cmp;
function cmp(a, op, b, loose) {
  var ret;
  switch (op) {
    case '===':
      if (typeof a === 'object') { a = a.version; }
      if (typeof b === 'object') { b = b.version; }
      ret = a === b;
      break;
    case '!==':
      if (typeof a === 'object') { a = a.version; }
      if (typeof b === 'object') { b = b.version; }
      ret = a !== b;
      break;
    case '': case '=': case '==': ret = eq(a, b, loose); break;
    case '!=': ret = neq(a, b, loose); break;
    case '>': ret = gt(a, b, loose); break;
    case '>=': ret = gte(a, b, loose); break;
    case '<': ret = lt(a, b, loose); break;
    case '<=': ret = lte(a, b, loose); break;
    default: throw new TypeError('Invalid operator: ' + op);
  }
  return ret;
}

exports.Comparator = Comparator;
function Comparator(comp, options) {
  if (!options || typeof options !== 'object')
    { options = { loose: !!options, includePrerelease: false }; }

  if (comp instanceof Comparator) {
    if (comp.loose === !!options.loose)
      { return comp; }
    else
      { comp = comp.value; }
  }

  if (!(this instanceof Comparator))
    { return new Comparator(comp, options); }

  debug('comparator', comp, options);
  this.options = options;
  this.loose = !!options.loose;
  this.parse(comp);

  if (this.semver === ANY)
    { this.value = ''; }
  else
    { this.value = this.operator + this.semver.version; }

  debug('comp', this);
}

var ANY = {};
Comparator.prototype.parse = function(comp) {
  var r = this.options.loose ? re[COMPARATORLOOSE] : re[COMPARATOR];
  var m = comp.match(r);

  if (!m)
    { throw new TypeError('Invalid comparator: ' + comp); }

  this.operator = m[1];
  if (this.operator === '=')
    { this.operator = ''; }

  // if it literally is just '>' or '' then allow anything.
  if (!m[2])
    { this.semver = ANY; }
  else
    { this.semver = new SemVer(m[2], this.options.loose); }
};

Comparator.prototype.toString = function() {
  return this.value;
};

Comparator.prototype.test = function(version) {
  debug('Comparator.test', version, this.options.loose);

  if (this.semver === ANY)
    { return true; }

  if (typeof version === 'string')
    { version = new SemVer(version, this.options); }

  return cmp(version, this.operator, this.semver, this.options);
};

Comparator.prototype.intersects = function(comp, options) {
  if (!(comp instanceof Comparator)) {
    throw new TypeError('a Comparator is required');
  }

  if (!options || typeof options !== 'object')
    { options = { loose: !!options, includePrerelease: false }; }

  var rangeTmp;

  if (this.operator === '') {
    rangeTmp = new Range(comp.value, options);
    return satisfies(this.value, rangeTmp, options);
  } else if (comp.operator === '') {
    rangeTmp = new Range(this.value, options);
    return satisfies(comp.semver, rangeTmp, options);
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
    oppositeDirectionsLessThan || oppositeDirectionsGreaterThan;
};


exports.Range = Range;
function Range(range, options) {
  if (!options || typeof options !== 'object')
    { options = { loose: !!options, includePrerelease: false }; }

  if (range instanceof Range) {
    if (range.loose === !!options.loose &&
        range.includePrerelease === !!options.includePrerelease) {
      return range;
    } else {
      return new Range(range.raw, options);
    }
  }

  if (range instanceof Comparator) {
    return new Range(range.value, options);
  }

  if (!(this instanceof Range))
    { return new Range(range, options); }

  this.options = options;
  this.loose = !!options.loose;
  this.includePrerelease = !!options.includePrerelease;

  // First, split based on boolean or ||
  this.raw = range;
  this.set = range.split(/\s*\|\|\s*/).map(function(range) {
    return this.parseRange(range.trim());
  }, this).filter(function(c) {
    // throw out any that are not relevant for whatever reason
    return c.length;
  });

  if (!this.set.length) {
    throw new TypeError('Invalid SemVer Range: ' + range);
  }

  this.format();
}

Range.prototype.format = function() {
  this.range = this.set.map(function(comps) {
    return comps.join(' ').trim();
  }).join('||').trim();
  return this.range;
};

Range.prototype.toString = function() {
  return this.range;
};

Range.prototype.parseRange = function(range) {
  var loose = this.options.loose;
  range = range.trim();
  // `1.2.3 - 1.2.4` => `>=1.2.3 <=1.2.4`
  var hr = loose ? re[HYPHENRANGELOOSE] : re[HYPHENRANGE];
  range = range.replace(hr, hyphenReplace);
  debug('hyphen replace', range);
  // `> 1.2.3 < 1.2.5` => `>1.2.3 <1.2.5`
  range = range.replace(re[COMPARATORTRIM], comparatorTrimReplace);
  debug('comparator trim', range, re[COMPARATORTRIM]);

  // `~ 1.2.3` => `~1.2.3`
  range = range.replace(re[TILDETRIM], tildeTrimReplace);

  // `^ 1.2.3` => `^1.2.3`
  range = range.replace(re[CARETTRIM], caretTrimReplace);

  // normalize spaces
  range = range.split(/\s+/).join(' ');

  // At this point, the range is completely trimmed and
  // ready to be split into comparators.

  var compRe = loose ? re[COMPARATORLOOSE] : re[COMPARATOR];
  var set = range.split(' ').map(function(comp) {
    return parseComparator(comp, this.options);
  }, this).join(' ').split(/\s+/);
  if (this.options.loose) {
    // in loose mode, throw out any that are not valid comparators
    set = set.filter(function(comp) {
      return !!comp.match(compRe);
    });
  }
  set = set.map(function(comp) {
    return new Comparator(comp, this.options);
  }, this);

  return set;
};

Range.prototype.intersects = function(range, options) {
  if (!(range instanceof Range)) {
    throw new TypeError('a Range is required');
  }

  return this.set.some(function(thisComparators) {
    return thisComparators.every(function(thisComparator) {
      return range.set.some(function(rangeComparators) {
        return rangeComparators.every(function(rangeComparator) {
          return thisComparator.intersects(rangeComparator, options);
        });
      });
    });
  });
};

// Mostly just for testing and legacy API reasons
exports.toComparators = toComparators;
function toComparators(range, options) {
  return new Range(range, options).set.map(function(comp) {
    return comp.map(function(c) {
      return c.value;
    }).join(' ').trim().split(' ');
  });
}

// comprised of xranges, tildes, stars, and gtlt's at this point.
// already replaced the hyphen ranges
// turn into a set of JUST comparators.
function parseComparator(comp, options) {
  debug('comp', comp, options);
  comp = replaceCarets(comp, options);
  debug('caret', comp);
  comp = replaceTildes(comp, options);
  debug('tildes', comp);
  comp = replaceXRanges(comp, options);
  debug('xrange', comp);
  comp = replaceStars(comp, options);
  debug('stars', comp);
  return comp;
}

function isX(id) {
  return !id || id.toLowerCase() === 'x' || id === '*';
}

// ~, ~> --> * (any, kinda silly)
// ~2, ~2.x, ~2.x.x, ~>2, ~>2.x ~>2.x.x --> >=2.0.0 <3.0.0
// ~2.0, ~2.0.x, ~>2.0, ~>2.0.x --> >=2.0.0 <2.1.0
// ~1.2, ~1.2.x, ~>1.2, ~>1.2.x --> >=1.2.0 <1.3.0
// ~1.2.3, ~>1.2.3 --> >=1.2.3 <1.3.0
// ~1.2.0, ~>1.2.0 --> >=1.2.0 <1.3.0
function replaceTildes(comp, options) {
  return comp.trim().split(/\s+/).map(function(comp) {
    return replaceTilde(comp, options);
  }).join(' ');
}

function replaceTilde(comp, options) {
  if (!options || typeof options !== 'object')
    { options = { loose: !!options, includePrerelease: false }; }
  var r = options.loose ? re[TILDELOOSE] : re[TILDE];
  return comp.replace(r, function(_, M, m, p, pr) {
    debug('tilde', comp, _, M, m, p, pr);
    var ret;

    if (isX(M))
      { ret = ''; }
    else if (isX(m))
      { ret = '>=' + M + '.0.0 <' + (+M + 1) + '.0.0'; }
    else if (isX(p))
      // ~1.2 == >=1.2.0 <1.3.0
      { ret = '>=' + M + '.' + m + '.0 <' + M + '.' + (+m + 1) + '.0'; }
    else if (pr) {
      debug('replaceTilde pr', pr);
      if (pr.charAt(0) !== '-')
        { pr = '-' + pr; }
      ret = '>=' + M + '.' + m + '.' + p + pr +
            ' <' + M + '.' + (+m + 1) + '.0';
    } else
      // ~1.2.3 == >=1.2.3 <1.3.0
      { ret = '>=' + M + '.' + m + '.' + p +
            ' <' + M + '.' + (+m + 1) + '.0'; }

    debug('tilde return', ret);
    return ret;
  });
}

// ^ --> * (any, kinda silly)
// ^2, ^2.x, ^2.x.x --> >=2.0.0 <3.0.0
// ^2.0, ^2.0.x --> >=2.0.0 <3.0.0
// ^1.2, ^1.2.x --> >=1.2.0 <2.0.0
// ^1.2.3 --> >=1.2.3 <2.0.0
// ^1.2.0 --> >=1.2.0 <2.0.0
function replaceCarets(comp, options) {
  return comp.trim().split(/\s+/).map(function(comp) {
    return replaceCaret(comp, options);
  }).join(' ');
}

function replaceCaret(comp, options) {
  debug('caret', comp, options);
  if (!options || typeof options !== 'object')
    { options = { loose: !!options, includePrerelease: false }; }
  var r = options.loose ? re[CARETLOOSE] : re[CARET];
  return comp.replace(r, function(_, M, m, p, pr) {
    debug('caret', comp, _, M, m, p, pr);
    var ret;

    if (isX(M))
      { ret = ''; }
    else if (isX(m))
      { ret = '>=' + M + '.0.0 <' + (+M + 1) + '.0.0'; }
    else if (isX(p)) {
      if (M === '0')
        { ret = '>=' + M + '.' + m + '.0 <' + M + '.' + (+m + 1) + '.0'; }
      else
        { ret = '>=' + M + '.' + m + '.0 <' + (+M + 1) + '.0.0'; }
    } else if (pr) {
      debug('replaceCaret pr', pr);
      if (pr.charAt(0) !== '-')
        { pr = '-' + pr; }
      if (M === '0') {
        if (m === '0')
          { ret = '>=' + M + '.' + m + '.' + p + pr +
                ' <' + M + '.' + m + '.' + (+p + 1); }
        else
          { ret = '>=' + M + '.' + m + '.' + p + pr +
                ' <' + M + '.' + (+m + 1) + '.0'; }
      } else
        { ret = '>=' + M + '.' + m + '.' + p + pr +
              ' <' + (+M + 1) + '.0.0'; }
    } else {
      debug('no pr');
      if (M === '0') {
        if (m === '0')
          { ret = '>=' + M + '.' + m + '.' + p +
                ' <' + M + '.' + m + '.' + (+p + 1); }
        else
          { ret = '>=' + M + '.' + m + '.' + p +
                ' <' + M + '.' + (+m + 1) + '.0'; }
      } else
        { ret = '>=' + M + '.' + m + '.' + p +
              ' <' + (+M + 1) + '.0.0'; }
    }

    debug('caret return', ret);
    return ret;
  });
}

function replaceXRanges(comp, options) {
  debug('replaceXRanges', comp, options);
  return comp.split(/\s+/).map(function(comp) {
    return replaceXRange(comp, options);
  }).join(' ');
}

function replaceXRange(comp, options) {
  comp = comp.trim();
  if (!options || typeof options !== 'object')
    { options = { loose: !!options, includePrerelease: false }; }
  var r = options.loose ? re[XRANGELOOSE] : re[XRANGE];
  return comp.replace(r, function(ret, gtlt, M, m, p, pr) {
    debug('xRange', comp, ret, gtlt, M, m, p, pr);
    var xM = isX(M);
    var xm = xM || isX(m);
    var xp = xm || isX(p);
    var anyX = xp;

    if (gtlt === '=' && anyX)
      { gtlt = ''; }

    if (xM) {
      if (gtlt === '>' || gtlt === '<') {
        // nothing is allowed
        ret = '<0.0.0';
      } else {
        // nothing is forbidden
        ret = '*';
      }
    } else if (gtlt && anyX) {
      // replace X with 0
      if (xm)
        { m = 0; }
      if (xp)
        { p = 0; }

      if (gtlt === '>') {
        // >1 => >=2.0.0
        // >1.2 => >=1.3.0
        // >1.2.3 => >= 1.2.4
        gtlt = '>=';
        if (xm) {
          M = +M + 1;
          m = 0;
          p = 0;
        } else if (xp) {
          m = +m + 1;
          p = 0;
        }
      } else if (gtlt === '<=') {
        // <=0.7.x is actually <0.8.0, since any 0.7.x should
        // pass.  Similarly, <=7.x is actually <8.0.0, etc.
        gtlt = '<';
        if (xm)
          { M = +M + 1; }
        else
          { m = +m + 1; }
      }

      ret = gtlt + M + '.' + m + '.' + p;
    } else if (xm) {
      ret = '>=' + M + '.0.0 <' + (+M + 1) + '.0.0';
    } else if (xp) {
      ret = '>=' + M + '.' + m + '.0 <' + M + '.' + (+m + 1) + '.0';
    }

    debug('xRange return', ret);

    return ret;
  });
}

// Because * is AND-ed with everything else in the comparator,
// and '' means "any version", just remove the *s entirely.
function replaceStars(comp, options) {
  debug('replaceStars', comp, options);
  // Looseness is ignored here.  star is always as loose as it gets!
  return comp.trim().replace(re[STAR], '');
}

// This function is passed to string.replace(re[HYPHENRANGE])
// M, m, patch, prerelease, build
// 1.2 - 3.4.5 => >=1.2.0 <=3.4.5
// 1.2.3 - 3.4 => >=1.2.0 <3.5.0 Any 3.4.x will do
// 1.2 - 3.4 => >=1.2.0 <3.5.0
function hyphenReplace($0,
                       from, fM, fm, fp, fpr, fb,
                       to, tM, tm, tp, tpr, tb) {

  if (isX(fM))
    { from = ''; }
  else if (isX(fm))
    { from = '>=' + fM + '.0.0'; }
  else if (isX(fp))
    { from = '>=' + fM + '.' + fm + '.0'; }
  else
    { from = '>=' + from; }

  if (isX(tM))
    { to = ''; }
  else if (isX(tm))
    { to = '<' + (+tM + 1) + '.0.0'; }
  else if (isX(tp))
    { to = '<' + tM + '.' + (+tm + 1) + '.0'; }
  else if (tpr)
    { to = '<=' + tM + '.' + tm + '.' + tp + '-' + tpr; }
  else
    { to = '<=' + to; }

  return (from + ' ' + to).trim();
}


// if ANY of the sets match ALL of its comparators, then pass
Range.prototype.test = function(version) {
  var this$1 = this;

  if (!version)
    { return false; }

  if (typeof version === 'string')
    { version = new SemVer(version, this.options); }

  for (var i = 0; i < this.set.length; i++) {
    if (testSet(this$1.set[i], version, this$1.options))
      { return true; }
  }
  return false;
};

function testSet(set, version, options) {
  for (var i = 0; i < set.length; i++) {
    if (!set[i].test(version))
      { return false; }
  }

  if (!options)
    { options = {}; }

  if (version.prerelease.length && !options.includePrerelease) {
    // Find the set of versions that are allowed to have prereleases
    // For example, ^1.2.3-pr.1 desugars to >=1.2.3-pr.1 <2.0.0
    // That should allow `1.2.3-pr.2` to pass.
    // However, `1.2.4-alpha.notready` should NOT be allowed,
    // even though it's within the range set by the comparators.
    for (var i = 0; i < set.length; i++) {
      debug(set[i].semver);
      if (set[i].semver === ANY)
        { continue; }

      if (set[i].semver.prerelease.length > 0) {
        var allowed = set[i].semver;
        if (allowed.major === version.major &&
            allowed.minor === version.minor &&
            allowed.patch === version.patch)
          { return true; }
      }
    }

    // Version has a -pre, but it's not one of the ones we like.
    return false;
  }

  return true;
}

exports.satisfies = satisfies;
function satisfies(version, range, options) {
  try {
    range = new Range(range, options);
  } catch (er) {
    return false;
  }
  return range.test(version);
}

exports.maxSatisfying = maxSatisfying;
function maxSatisfying(versions, range, options) {
  var max = null;
  var maxSV = null;
  try {
    var rangeObj = new Range(range, options);
  } catch (er) {
    return null;
  }
  versions.forEach(function (v) {
    if (rangeObj.test(v)) { // satisfies(v, range, options)
      if (!max || maxSV.compare(v) === -1) { // compare(max, v, true)
        max = v;
        maxSV = new SemVer(max, options);
      }
    }
  });
  return max;
}

exports.minSatisfying = minSatisfying;
function minSatisfying(versions, range, options) {
  var min = null;
  var minSV = null;
  try {
    var rangeObj = new Range(range, options);
  } catch (er) {
    return null;
  }
  versions.forEach(function (v) {
    if (rangeObj.test(v)) { // satisfies(v, range, options)
      if (!min || minSV.compare(v) === 1) { // compare(min, v, true)
        min = v;
        minSV = new SemVer(min, options);
      }
    }
  });
  return min;
}

exports.validRange = validRange;
function validRange(range, options) {
  try {
    // Return '*' instead of '' so that truthiness works.
    // This will throw if it's invalid anyway
    return new Range(range, options).range || '*';
  } catch (er) {
    return null;
  }
}

// Determine if version is less than all the versions possible in the range
exports.ltr = ltr;
function ltr(version, range, options) {
  return outside(version, range, '<', options);
}

// Determine if version is greater than all the versions possible in the range.
exports.gtr = gtr;
function gtr(version, range, options) {
  return outside(version, range, '>', options);
}

exports.outside = outside;
function outside(version, range, hilo, options) {
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
      break;
    case '<':
      gtfn = lt;
      ltefn = gte;
      ltfn = gt;
      comp = '<';
      ecomp = '<=';
      break;
    default:
      throw new TypeError('Must provide a hilo val of "<" or ">"');
  }

  // If it satisifes the range it is not outside
  if (satisfies(version, range, options)) {
    return false;
  }

  // From now on, variable terms are as if we're in "gtr" mode.
  // but note that everything is flipped for the "ltr" function.

  for (var i = 0; i < range.set.length; ++i) {
    var comparators = range.set[i];

    var high = null;
    var low = null;

    comparators.forEach(function(comparator) {
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
      return false;
    }

    // If the lowest version comparator has an operator and our version
    // is less than it then it isn't higher than the range
    if ((!low.operator || low.operator === comp) &&
        ltefn(version, low.semver)) {
      return false;
    } else if (low.operator === ecomp && ltfn(version, low.semver)) {
      return false;
    }
  }
  return true;
}

exports.prerelease = prerelease;
function prerelease(version, options) {
  var parsed = parse(version, options);
  return (parsed && parsed.prerelease.length) ? parsed.prerelease : null;
}

exports.intersects = intersects;
function intersects(r1, r2, options) {
  r1 = new Range(r1, options);
  r2 = new Range(r2, options);
  return r1.intersects(r2)
}

exports.coerce = coerce;
function coerce(version) {
  if (version instanceof SemVer)
    { return version; }

  if (typeof version !== 'string')
    { return null; }

  var match = version.match(re[COERCE]);

  if (match == null)
    { return null; }

  return parse((match[1] || '0') + '.' + (match[2] || '0') + '.' + (match[3] || '0')); 
}
});
var semver_1 = semver.SEMVER_SPEC_VERSION;
var semver_2 = semver.re;
var semver_3 = semver.src;
var semver_4 = semver.parse;
var semver_5 = semver.valid;
var semver_6 = semver.clean;
var semver_7 = semver.SemVer;
var semver_8 = semver.inc;
var semver_9 = semver.diff;
var semver_10 = semver.compareIdentifiers;
var semver_11 = semver.rcompareIdentifiers;
var semver_12 = semver.major;
var semver_13 = semver.minor;
var semver_14 = semver.patch;
var semver_15 = semver.compare;
var semver_16 = semver.compareLoose;
var semver_17 = semver.rcompare;
var semver_18 = semver.sort;
var semver_19 = semver.rsort;
var semver_20 = semver.gt;
var semver_21 = semver.lt;
var semver_22 = semver.eq;
var semver_23 = semver.neq;
var semver_24 = semver.gte;
var semver_25 = semver.lte;
var semver_26 = semver.cmp;
var semver_27 = semver.Comparator;
var semver_28 = semver.Range;
var semver_29 = semver.toComparators;
var semver_30 = semver.satisfies;
var semver_31 = semver.maxSatisfying;
var semver_32 = semver.minSatisfying;
var semver_33 = semver.validRange;
var semver_34 = semver.ltr;
var semver_35 = semver.gtr;
var semver_36 = semver.outside;
var semver_37 = semver.prerelease;
var semver_38 = semver.intersects;
var semver_39 = semver.coerce;

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

// get the event used to trigger v-model handler that updates bound data
function getCheckedEvent() {
  var version = Vue.version;

  if (semver.satisfies(version, '2.1.9 - 2.1.10')) {
    return 'click'
  }

  if (semver.satisfies(version, '2.2 - 2.4')) {
    return isChrome ? 'click' : 'change'
  }

  // change is handler for version 2.0 - 2.1.8, and 2.5+
  return 'change'
}

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

var NAME_SELECTOR = 'NAME_SELECTOR';
var COMPONENT_SELECTOR = 'COMPONENT_SELECTOR';
var REF_SELECTOR = 'REF_SELECTOR';
var DOM_SELECTOR = 'DOM_SELECTOR';
var INVALID_SELECTOR = 'INVALID_SELECTOR';

var VUE_VERSION = Number(
  ((Vue.version.split('.')[0]) + "." + (Vue.version.split('.')[1]))
);

var FUNCTIONAL_OPTIONS =
  VUE_VERSION >= 2.5 ? 'fnOptions' : 'functionalOptions';

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

  _Vue.mixin(( obj = {}, obj[BEFORE_RENDER_LIFECYCLE_HOOK] = addStubComponentsMixin, obj));
}

// 

function isDomSelector(selector) {
  if (typeof selector !== 'string') {
    return false
  }

  try {
    if (typeof document === 'undefined') {
      throwError(
        "mount must be run in a browser environment like " +
          "PhantomJS, jsdom or chrome"
      );
    }
  } catch (error) {
    throwError(
      "mount must be run in a browser environment like " +
        "PhantomJS, jsdom or chrome"
    );
  }

  try {
    document.querySelector(selector);
    return true
  } catch (error) {
    return false
  }
}

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

function isRefSelector(refOptionsObject) {
  if (
    typeof refOptionsObject !== 'object' ||
    Object.keys(refOptionsObject || {}).length !== 1
  ) {
    return false
  }

  return typeof refOptionsObject.ref === 'string'
}

function isNameSelector(nameOptionsObject) {
  if (typeof nameOptionsObject !== 'object' || nameOptionsObject === null) {
    return false
  }

  return !!nameOptionsObject.name
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
        res = renderFn.call(Object.assign({}, helpers, ( obj = {}, obj[slotScope] = props, obj)));
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
    props: componentOptions.props,
    on: componentOptions.on,
    key: componentOptions.key,
    ref: componentOptions.ref,
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
  if (staticClass && dynamicClass) {
    return staticClass + ' ' + dynamicClass
  }
  return staticClass || dynamicClass
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
      return h(
        tagName,
        {
          attrs: componentOptions.functional
            ? Object.assign({}, context.props,
                context.data.attrs,
                {class: createClassString(
                  context.data.staticClass,
                  context.data.class
                )})
            : Object.assign({}, this.$props)
        },
        context ? context.children : this.$options._renderChildren
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

  if (shouldExtend(component, _Vue)) {
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
        var Constructor = shouldExtend(el, _Vue) ? extend(el, _Vue) : el;

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
          Object.assign(vm.$options.components, ( obj = {}, obj[el] = stub$1, obj));
          modifiedComponents.add(el);
        }
      }

      return originalCreateElement.apply(void 0, [ el ].concat( args ))
    };

    vm[CREATE_ELEMENT_ALIAS] = createElement;
    vm.$createElement = createElement;
  }

  _Vue.mixin(( obj = {}, obj[BEFORE_RENDER_LIFECYCLE_HOOK] = patchCreateElementMixin, obj));
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

  var stubComponentsObject = createStubsFromStubsObject(
    componentOptions.components,
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

  // make sure all extends are based on this instance

  var Constructor = _Vue.extend(componentOptions).extend(instanceOptions);
  componentOptions._Ctor = {};
  Constructor.options._base = _Vue;

  var scopedSlots = createScopedSlots(options.scopedSlots, _Vue);

  var parentComponentOptions = options.parentComponent || {};

  parentComponentOptions.provide = options.provide;
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

// 

function createElement() {
  if (document) {
    var elem = document.createElement('div');

    if (document.body) {
      document.body.appendChild(elem);
    }
    return elem
  }
}

// 

function findDOMNodes(
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

function vmMatchesName(vm, name) {
  return (
    !!name && (vm.name === name || (vm.$options && vm.$options.name === name))
  )
}

function vmCtorMatches(vm, component) {
  if (
    (vm.$options && vm.$options.$_vueTestUtils_original === component) ||
    vm.$_vueTestUtils_original === component
  ) {
    return true
  }

  var Ctor = isConstructor(component)
    ? component.options._Ctor
    : component._Ctor;

  if (!Ctor) {
    return false
  }

  if (vm.constructor.extendOptions === component) {
    return true
  }

  if (component.functional) {
    return Object.keys(vm._Ctor || {}).some(function (c) {
      return component === vm._Ctor[c].extendOptions
    })
  }
}

function matches(node, selector) {
  if (selector.type === DOM_SELECTOR) {
    var element = node instanceof Element ? node : node.elm;
    return element && element.matches && element.matches(selector.value)
  }

  var isFunctionalSelector = isConstructor(selector.value)
    ? selector.value.options.functional
    : selector.value.functional;

  var componentInstance = isFunctionalSelector
    ? node[FUNCTIONAL_OPTIONS]
    : node.child;

  if (!componentInstance) {
    return false
  }

  if (selector.type === COMPONENT_SELECTOR) {
    if (vmCtorMatches(componentInstance, selector.value)) {
      return true
    }
  }

  // Fallback to name selector for COMPONENT_SELECTOR for Vue < 2.1
  var nameSelector = isConstructor(selector.value)
    ? selector.value.extendOptions.name
    : selector.value.name;
  return vmMatchesName(componentInstance, nameSelector)
}

// 

function findAllInstances(rootVm) {
  var instances = [rootVm];
  var i = 0;
  while (i < instances.length) {
    var vm = instances[i]
    ;(vm.$children || []).forEach(function (child) {
      instances.push(child);
    });
    i++;
  }
  return instances
}

function findAllVNodes(vnode, selector) {
  var matchingNodes = [];
  var nodes = [vnode];
  while (nodes.length) {
    var node = nodes.shift();
    if (node.children) {
      var children = [].concat( node.children ).reverse();
      children.forEach(function (n) {
        nodes.unshift(n);
      });
    }
    if (node.child) {
      nodes.unshift(node.child._vnode);
    }
    if (matches(node, selector)) {
      matchingNodes.push(node);
    }
  }

  return matchingNodes
}

function removeDuplicateNodes(vNodes) {
  var vNodeElms = vNodes.map(function (vNode) { return vNode.elm; });
  return vNodes.filter(function (vNode, index) { return index === vNodeElms.indexOf(vNode.elm); })
}

function find(
  root,
  vm,
  selector
) {
  if (root instanceof Element && selector.type !== DOM_SELECTOR) {
    throwError(
      "cannot find a Vue instance on a DOM node. The node " +
        "you are calling find on does not exist in the " +
        "VDom. Are you adding the node as innerHTML?"
    );
  }

  if (
    selector.type === COMPONENT_SELECTOR &&
    (selector.value.functional ||
      (selector.value.options && selector.value.options.functional)) &&
    VUE_VERSION < 2.3
  ) {
    throwError(
      "find for functional components is not supported " + "in Vue < 2.3"
    );
  }

  if (root instanceof Element) {
    return findDOMNodes(root, selector.value)
  }

  if (!root && selector.type !== DOM_SELECTOR) {
    throwError(
      "cannot find a Vue instance on a DOM node. The node " +
        "you are calling find on does not exist in the " +
        "VDom. Are you adding the node as innerHTML?"
    );
  }

  if (!vm && selector.type === REF_SELECTOR) {
    throwError("$ref selectors can only be used on Vue component " + "wrappers");
  }

  if (vm && vm.$refs && selector.value.ref in vm.$refs) {
    var refs = vm.$refs[selector.value.ref];
    return Array.isArray(refs) ? refs : [refs]
  }

  var nodes = findAllVNodes(root, selector);
  var dedupedNodes = removeDuplicateNodes(nodes);

  if (nodes.length > 0 || selector.type !== DOM_SELECTOR) {
    return dedupedNodes
  }

  // Fallback in case element exists in HTML, but not in vnode tree
  // (e.g. if innerHTML is set as a domProp)
  return findDOMNodes(root.elm, selector.value)
}

function errorHandler(errorOrString, vm) {
  var error =
    typeof errorOrString === 'object' ? errorOrString : new Error(errorOrString);

  vm._error = error;
  throw error
}

function throwIfInstancesThrew(vm) {
  var instancesWithError = findAllInstances(vm).filter(function (_vm) { return _vm._error; });

  if (instancesWithError.length > 0) {
    throw instancesWithError[0]._error
  }
}

var hasWarned = false;

// Vue swallows errors thrown by instances, even if the global error handler
// throws. In order to throw in the test, we add an _error property to an
// instance when it throws. Then we loop through the instances with
// throwIfInstancesThrew and throw an error in the test context if any
// instances threw.
function addGlobalErrorHandler(_Vue) {
  var existingErrorHandler = _Vue.config.errorHandler;

  if (existingErrorHandler === errorHandler) {
    return
  }

  if (_Vue.config.errorHandler && !hasWarned) {
    warn(
      "Global error handler detected (Vue.config.errorHandler). \n" +
        "Vue Test Utils sets a custom error handler to throw errors " +
        "thrown by instances. If you want this behavior in " +
        "your tests, you must remove the global error handler."
    );
    hasWarned = true;
  } else {
    _Vue.config.errorHandler = errorHandler;
  }
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

var config = {
  stubs: {},
  mocks: {},
  methods: {},
  provide: {},
  silent: true
}

// 

function warnIfNoWindow() {
  if (typeof window === 'undefined') {
    throwError(
      "window is undefined, vue-test-utils needs to be " +
        "run in a browser environment. \n" +
        "You can run the tests in node using jsdom \n" +
        "See https://vue-test-utils.vuejs.org/guides/#browser-environment " +
        "for more details."
    );
  }
}

// 

function getSelectorType(selector) {
  if (isDomSelector(selector)) { return DOM_SELECTOR }
  if (isVueComponent(selector)) { return COMPONENT_SELECTOR }
  if (isNameSelector(selector)) { return NAME_SELECTOR }
  if (isRefSelector(selector)) { return REF_SELECTOR }

  return INVALID_SELECTOR
}

function getSelector(
  selector,
  methodName
) {
  var type = getSelectorType(selector);
  if (type === INVALID_SELECTOR) {
    throwError(
      "wrapper." + methodName + "() must be passed a valid CSS selector, Vue " +
        "constructor, or valid find option object"
    );
  }
  return {
    type: type,
    value: selector
  }
}

// 

var WrapperArray = function WrapperArray(wrappers) {
  var length = wrappers.length;
  // $FlowIgnore
  Object.defineProperty(this, 'wrappers', {
    get: function () { return wrappers; },
    set: function () { return throwError('wrapperArray.wrappers is read-only'); }
  });
  // $FlowIgnore
  Object.defineProperty(this, 'length', {
    get: function () { return length; },
    set: function () { return throwError('wrapperArray.length is read-only'); }
  });
};

WrapperArray.prototype.at = function at (index) {
  if (index > this.length - 1) {
    throwError(("no item exists at " + index));
  }
  return this.wrappers[index]
};

WrapperArray.prototype.attributes = function attributes () {
  this.throwErrorIfWrappersIsEmpty('attributes');

  throwError(
    "attributes must be called on a single wrapper, use " +
      "at(i) to access a wrapper"
  );
};

WrapperArray.prototype.classes = function classes () {
  this.throwErrorIfWrappersIsEmpty('classes');

  throwError(
    "classes must be called on a single wrapper, use " +
      "at(i) to access a wrapper"
  );
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

WrapperArray.prototype.emitted = function emitted () {
  this.throwErrorIfWrappersIsEmpty('emitted');

  throwError(
    "emitted must be called on a single wrapper, use " +
      "at(i) to access a wrapper"
  );
};

WrapperArray.prototype.emittedByOrder = function emittedByOrder () {
  this.throwErrorIfWrappersIsEmpty('emittedByOrder');

  throwError(
    "emittedByOrder must be called on a single wrapper, " +
      "use at(i) to access a wrapper"
  );
};

WrapperArray.prototype.findAll = function findAll () {
  this.throwErrorIfWrappersIsEmpty('findAll');

  throwError(
    "findAll must be called on a single wrapper, use " +
      "at(i) to access a wrapper"
  );
};

WrapperArray.prototype.find = function find () {
  this.throwErrorIfWrappersIsEmpty('find');

  throwError(
    "find must be called on a single wrapper, use at(i) " +
      "to access a wrapper"
  );
};

WrapperArray.prototype.html = function html () {
  this.throwErrorIfWrappersIsEmpty('html');

  throwError(
    "html must be called on a single wrapper, use at(i) " +
      "to access a wrapper"
  );
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

  throwError(
    "name must be called on a single wrapper, use at(i) " +
      "to access a wrapper"
  );
};

WrapperArray.prototype.props = function props () {
  this.throwErrorIfWrappersIsEmpty('props');

  throwError(
    "props must be called on a single wrapper, use " +
      "at(i) to access a wrapper"
  );
};

WrapperArray.prototype.text = function text () {
  this.throwErrorIfWrappersIsEmpty('text');

  throwError(
    "text must be called on a single wrapper, use at(i) " +
      "to access a wrapper"
  );
};

WrapperArray.prototype.throwErrorIfWrappersIsEmpty = function throwErrorIfWrappersIsEmpty (method) {
  if (this.wrappers.length === 0) {
    throwError((method + " cannot be called on 0 items"));
  }
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
    if ( checked === void 0 ) checked = true;

  this.throwErrorIfWrappersIsEmpty('setChecked');

  this.wrappers.forEach(function (wrapper) { return wrapper.setChecked(checked); });
};

WrapperArray.prototype.setSelected = function setSelected () {
  this.throwErrorIfWrappersIsEmpty('setSelected');

  throwError(
    "setSelected must be called on a single wrapper, " +
      "use at(i) to access a wrapper"
  );
};

WrapperArray.prototype.trigger = function trigger (event, options) {
  this.throwErrorIfWrappersIsEmpty('trigger');

  this.wrappers.forEach(function (wrapper) { return wrapper.trigger(event, options); });
};

WrapperArray.prototype.destroy = function destroy () {
  this.throwErrorIfWrappersIsEmpty('destroy');

  this.wrappers.forEach(function (wrapper) { return wrapper.destroy(); });
};

// 

var ErrorWrapper = function ErrorWrapper(selector) {
  this.selector = selector;
};

ErrorWrapper.prototype.at = function at () {
  throwError(
    ("find did not return " + (this.selector) + ", cannot call at() on empty Wrapper")
  );
};

ErrorWrapper.prototype.attributes = function attributes () {
  throwError(
    ("find did not return " + (this.selector) + ", cannot call attributes() on empty Wrapper")
  );
};

ErrorWrapper.prototype.classes = function classes () {
  throwError(
    ("find did not return " + (this.selector) + ", cannot call classes() on empty Wrapper")
  );
};

ErrorWrapper.prototype.contains = function contains () {
  throwError(
    ("find did not return " + (this.selector) + ", cannot call contains() on empty Wrapper")
  );
};

ErrorWrapper.prototype.emitted = function emitted () {
  throwError(
    ("find did not return " + (this.selector) + ", cannot call emitted() on empty Wrapper")
  );
};

ErrorWrapper.prototype.emittedByOrder = function emittedByOrder () {
  throwError(
    ("find did not return " + (this.selector) + ", cannot call emittedByOrder() on empty Wrapper")
  );
};

ErrorWrapper.prototype.exists = function exists () {
  return false
};

ErrorWrapper.prototype.filter = function filter () {
  throwError(
    ("find did not return " + (this.selector) + ", cannot call filter() on empty Wrapper")
  );
};

ErrorWrapper.prototype.visible = function visible () {
  throwError(
    ("find did not return " + (this.selector) + ", cannot call visible() on empty Wrapper")
  );
};

ErrorWrapper.prototype.hasAttribute = function hasAttribute () {
  throwError(
    ("find did not return " + (this.selector) + ", cannot call hasAttribute() on empty Wrapper")
  );
};

ErrorWrapper.prototype.hasClass = function hasClass () {
  throwError(
    ("find did not return " + (this.selector) + ", cannot call hasClass() on empty Wrapper")
  );
};

ErrorWrapper.prototype.hasProp = function hasProp () {
  throwError(
    ("find did not return " + (this.selector) + ", cannot call hasProp() on empty Wrapper")
  );
};

ErrorWrapper.prototype.hasStyle = function hasStyle () {
  throwError(
    ("find did not return " + (this.selector) + ", cannot call hasStyle() on empty Wrapper")
  );
};

ErrorWrapper.prototype.findAll = function findAll () {
  throwError(
    ("find did not return " + (this.selector) + ", cannot call findAll() on empty Wrapper")
  );
};

ErrorWrapper.prototype.find = function find () {
  throwError(
    ("find did not return " + (this.selector) + ", cannot call find() on empty Wrapper")
  );
};

ErrorWrapper.prototype.html = function html () {
  throwError(
    ("find did not return " + (this.selector) + ", cannot call html() on empty Wrapper")
  );
};

ErrorWrapper.prototype.is = function is () {
  throwError(
    ("find did not return " + (this.selector) + ", cannot call is() on empty Wrapper")
  );
};

ErrorWrapper.prototype.isEmpty = function isEmpty () {
  throwError(
    ("find did not return " + (this.selector) + ", cannot call isEmpty() on empty Wrapper")
  );
};

ErrorWrapper.prototype.isVisible = function isVisible () {
  throwError(
    ("find did not return " + (this.selector) + ", cannot call isVisible() on empty Wrapper")
  );
};

ErrorWrapper.prototype.isVueInstance = function isVueInstance () {
  throwError(
    ("find did not return " + (this.selector) + ", cannot call isVueInstance() on empty Wrapper")
  );
};

ErrorWrapper.prototype.name = function name () {
  throwError(
    ("find did not return " + (this.selector) + ", cannot call name() on empty Wrapper")
  );
};

ErrorWrapper.prototype.props = function props () {
  throwError(
    ("find did not return " + (this.selector) + ", cannot call props() on empty Wrapper")
  );
};

ErrorWrapper.prototype.text = function text () {
  throwError(
    ("find did not return " + (this.selector) + ", cannot call text() on empty Wrapper")
  );
};

ErrorWrapper.prototype.setComputed = function setComputed () {
  throwError(
    ("find did not return " + (this.selector) + ", cannot call setComputed() on empty Wrapper")
  );
};

ErrorWrapper.prototype.setData = function setData () {
  throwError(
    ("find did not return " + (this.selector) + ", cannot call setData() on empty Wrapper")
  );
};

ErrorWrapper.prototype.setMethods = function setMethods () {
  throwError(
    ("find did not return " + (this.selector) + ", cannot call setMethods() on empty Wrapper")
  );
};

ErrorWrapper.prototype.setProps = function setProps () {
  throwError(
    ("find did not return " + (this.selector) + ", cannot call setProps() on empty Wrapper")
  );
};

ErrorWrapper.prototype.setValue = function setValue () {
  throwError(
    ("find did not return " + (this.selector) + ", cannot call setValue() on empty Wrapper")
  );
};

ErrorWrapper.prototype.setChecked = function setChecked () {
  throwError(
    ("find did not return " + (this.selector) + ", cannot call setChecked() on empty Wrapper")
  );
};

ErrorWrapper.prototype.setSelected = function setSelected () {
  throwError(
    ("find did not return " + (this.selector) + ", cannot call setSelected() on empty Wrapper")
  );
};

ErrorWrapper.prototype.trigger = function trigger () {
  throwError(
    ("find did not return " + (this.selector) + ", cannot call trigger() on empty Wrapper")
  );
};

ErrorWrapper.prototype.destroy = function destroy () {
  throwError(
    ("find did not return " + (this.selector) + ", cannot call destroy() on empty Wrapper")
  );
};

function recursivelySetData(vm, target, data) {
  Object.keys(data).forEach(function (key) {
    var val = data[key];
    var targetVal = target[key];

    if (isPlainObject(val) && isPlainObject(targetVal)) {
      recursivelySetData(vm, targetVal, val);
    } else {
      vm.$set(target, key, val);
    }
  });
}

var abort = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var afterprint = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var animationend = {"eventInterface":"AnimationEvent","bubbles":true,"cancelable":false};
var animationiteration = {"eventInterface":"AnimationEvent","bubbles":true,"cancelable":false};
var animationstart = {"eventInterface":"AnimationEvent","bubbles":true,"cancelable":false};
var appinstalled = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var audioprocess = {"eventInterface":"AudioProcessingEvent"};
var audioend = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var audiostart = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var beforeprint = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var beforeunload = {"eventInterface":"BeforeUnloadEvent","bubbles":false,"cancelable":true};
var beginEvent = {"eventInterface":"TimeEvent","bubbles":false,"cancelable":false};
var blur = {"eventInterface":"FocusEvent","bubbles":false,"cancelable":false};
var boundary = {"eventInterface":"SpeechSynthesisEvent","bubbles":false,"cancelable":false};
var cached = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var canplay = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var canplaythrough = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var change = {"eventInterface":"Event","bubbles":true,"cancelable":false};
var chargingchange = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var chargingtimechange = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var checking = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var click = {"eventInterface":"MouseEvent","bubbles":true,"cancelable":true};
var close = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var complete = {"eventInterface":"OfflineAudioCompletionEvent"};
var compositionend = {"eventInterface":"CompositionEvent","bubbles":true,"cancelable":true};
var compositionstart = {"eventInterface":"CompositionEvent","bubbles":true,"cancelable":true};
var compositionupdate = {"eventInterface":"CompositionEvent","bubbles":true,"cancelable":false};
var contextmenu = {"eventInterface":"MouseEvent","bubbles":true,"cancelable":true};
var copy = {"eventInterface":"ClipboardEvent"};
var cut = {"eventInterface":"ClipboardEvent","bubbles":true,"cancelable":true};
var dblclick = {"eventInterface":"MouseEvent","bubbles":true,"cancelable":true};
var devicechange = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var devicelight = {"eventInterface":"DeviceLightEvent","bubbles":false,"cancelable":false};
var devicemotion = {"eventInterface":"DeviceMotionEvent","bubbles":false,"cancelable":false};
var deviceorientation = {"eventInterface":"DeviceOrientationEvent","bubbles":false,"cancelable":false};
var deviceproximity = {"eventInterface":"DeviceProximityEvent","bubbles":false,"cancelable":false};
var dischargingtimechange = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var DOMActivate = {"eventInterface":"UIEvent","bubbles":true,"cancelable":true};
var DOMAttributeNameChanged = {"eventInterface":"MutationNameEvent","bubbles":true,"cancelable":true};
var DOMAttrModified = {"eventInterface":"MutationEvent","bubbles":true,"cancelable":true};
var DOMCharacterDataModified = {"eventInterface":"MutationEvent","bubbles":true,"cancelable":true};
var DOMContentLoaded = {"eventInterface":"Event","bubbles":true,"cancelable":true};
var DOMElementNameChanged = {"eventInterface":"MutationNameEvent","bubbles":true,"cancelable":true};
var DOMFocusIn = {"eventInterface":"FocusEvent","bubbles":true,"cancelable":true};
var DOMFocusOut = {"eventInterface":"FocusEvent","bubbles":true,"cancelable":true};
var DOMNodeInserted = {"eventInterface":"MutationEvent","bubbles":true,"cancelable":true};
var DOMNodeInsertedIntoDocument = {"eventInterface":"MutationEvent","bubbles":true,"cancelable":true};
var DOMNodeRemoved = {"eventInterface":"MutationEvent","bubbles":true,"cancelable":true};
var DOMNodeRemovedFromDocument = {"eventInterface":"MutationEvent","bubbles":true,"cancelable":true};
var DOMSubtreeModified = {"eventInterface":"MutationEvent"};
var downloading = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var drag = {"eventInterface":"DragEvent","bubbles":true,"cancelable":true};
var dragend = {"eventInterface":"DragEvent","bubbles":true,"cancelable":false};
var dragenter = {"eventInterface":"DragEvent","bubbles":true,"cancelable":true};
var dragleave = {"eventInterface":"DragEvent","bubbles":true,"cancelable":false};
var dragover = {"eventInterface":"DragEvent","bubbles":true,"cancelable":true};
var dragstart = {"eventInterface":"DragEvent","bubbles":true,"cancelable":true};
var drop = {"eventInterface":"DragEvent","bubbles":true,"cancelable":true};
var durationchange = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var emptied = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var end = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var ended = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var endEvent = {"eventInterface":"TimeEvent","bubbles":false,"cancelable":false};
var error = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var focus = {"eventInterface":"FocusEvent","bubbles":false,"cancelable":false};
var focusin = {"eventInterface":"FocusEvent","bubbles":true,"cancelable":false};
var focusout = {"eventInterface":"FocusEvent","bubbles":true,"cancelable":false};
var fullscreenchange = {"eventInterface":"Event","bubbles":true,"cancelable":false};
var fullscreenerror = {"eventInterface":"Event","bubbles":true,"cancelable":false};
var gamepadconnected = {"eventInterface":"GamepadEvent","bubbles":false,"cancelable":false};
var gamepaddisconnected = {"eventInterface":"GamepadEvent","bubbles":false,"cancelable":false};
var gotpointercapture = {"eventInterface":"PointerEvent","bubbles":false,"cancelable":false};
var hashchange = {"eventInterface":"HashChangeEvent","bubbles":true,"cancelable":false};
var lostpointercapture = {"eventInterface":"PointerEvent","bubbles":false,"cancelable":false};
var input = {"eventInterface":"Event","bubbles":true,"cancelable":false};
var invalid = {"eventInterface":"Event","cancelable":true,"bubbles":false};
var keydown = {"eventInterface":"KeyboardEvent","bubbles":true,"cancelable":true};
var keypress = {"eventInterface":"KeyboardEvent","bubbles":true,"cancelable":true};
var keyup = {"eventInterface":"KeyboardEvent","bubbles":true,"cancelable":true};
var languagechange = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var levelchange = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var load = {"eventInterface":"UIEvent","bubbles":false,"cancelable":false};
var loadeddata = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var loadedmetadata = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var loadend = {"eventInterface":"ProgressEvent","bubbles":false,"cancelable":false};
var loadstart = {"eventInterface":"ProgressEvent","bubbles":false,"cancelable":false};
var mark = {"eventInterface":"SpeechSynthesisEvent","bubbles":false,"cancelable":false};
var message = {"eventInterface":"MessageEvent","bubbles":false,"cancelable":false};
var messageerror = {"eventInterface":"MessageEvent","bubbles":false,"cancelable":false};
var mousedown = {"eventInterface":"MouseEvent","bubbles":true,"cancelable":true};
var mouseenter = {"eventInterface":"MouseEvent","bubbles":false,"cancelable":false};
var mouseleave = {"eventInterface":"MouseEvent","bubbles":false,"cancelable":false};
var mousemove = {"eventInterface":"MouseEvent","bubbles":true,"cancelable":true};
var mouseout = {"eventInterface":"MouseEvent","bubbles":true,"cancelable":true};
var mouseover = {"eventInterface":"MouseEvent","bubbles":true,"cancelable":true};
var mouseup = {"eventInterface":"MouseEvent","bubbles":true,"cancelable":true};
var nomatch = {"eventInterface":"SpeechRecognitionEvent","bubbles":false,"cancelable":false};
var notificationclick = {"eventInterface":"NotificationEvent","bubbles":false,"cancelable":false};
var noupdate = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var obsolete = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var offline = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var online = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var open = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var orientationchange = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var pagehide = {"eventInterface":"PageTransitionEvent","bubbles":false,"cancelable":false};
var pageshow = {"eventInterface":"PageTransitionEvent","bubbles":false,"cancelable":false};
var paste = {"eventInterface":"ClipboardEvent","bubbles":true,"cancelable":true};
var pause = {"eventInterface":"SpeechSynthesisEvent","bubbles":false,"cancelable":false};
var pointercancel = {"eventInterface":"PointerEvent","bubbles":true,"cancelable":false};
var pointerdown = {"eventInterface":"PointerEvent","bubbles":true,"cancelable":true};
var pointerenter = {"eventInterface":"PointerEvent","bubbles":false,"cancelable":false};
var pointerleave = {"eventInterface":"PointerEvent","bubbles":false,"cancelable":false};
var pointerlockchange = {"eventInterface":"Event","bubbles":true,"cancelable":false};
var pointerlockerror = {"eventInterface":"Event","bubbles":true,"cancelable":false};
var pointermove = {"eventInterface":"PointerEvent","bubbles":true,"cancelable":true};
var pointerout = {"eventInterface":"PointerEvent","bubbles":true,"cancelable":true};
var pointerover = {"eventInterface":"PointerEvent","bubbles":true,"cancelable":true};
var pointerup = {"eventInterface":"PointerEvent","bubbles":true,"cancelable":true};
var play = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var playing = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var popstate = {"eventInterface":"PopStateEvent","bubbles":true,"cancelable":false};
var progress = {"eventInterface":"ProgressEvent","bubbles":false,"cancelable":false};
var push = {"eventInterface":"PushEvent","bubbles":false,"cancelable":false};
var pushsubscriptionchange = {"eventInterface":"PushEvent","bubbles":false,"cancelable":false};
var ratechange = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var readystatechange = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var repeatEvent = {"eventInterface":"TimeEvent","bubbles":false,"cancelable":false};
var reset = {"eventInterface":"Event","bubbles":true,"cancelable":true};
var resize = {"eventInterface":"UIEvent","bubbles":false,"cancelable":false};
var resourcetimingbufferfull = {"eventInterface":"Performance","bubbles":true,"cancelable":true};
var result = {"eventInterface":"SpeechRecognitionEvent","bubbles":false,"cancelable":false};
var resume = {"eventInterface":"SpeechSynthesisEvent","bubbles":false,"cancelable":false};
var scroll = {"eventInterface":"UIEvent","bubbles":false,"cancelable":false};
var seeked = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var seeking = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var select = {"eventInterface":"UIEvent","bubbles":true,"cancelable":false};
var selectstart = {"eventInterface":"Event","bubbles":true,"cancelable":true};
var selectionchange = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var show = {"eventInterface":"MouseEvent","bubbles":false,"cancelable":false};
var slotchange = {"eventInterface":"Event","bubbles":true,"cancelable":false};
var soundend = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var soundstart = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var speechend = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var speechstart = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var stalled = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var start = {"eventInterface":"SpeechSynthesisEvent","bubbles":false,"cancelable":false};
var storage = {"eventInterface":"StorageEvent","bubbles":false,"cancelable":false};
var submit = {"eventInterface":"Event","bubbles":true,"cancelable":true};
var success = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var suspend = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var SVGAbort = {"eventInterface":"SVGEvent","bubbles":true,"cancelable":false};
var SVGError = {"eventInterface":"SVGEvent","bubbles":true,"cancelable":false};
var SVGLoad = {"eventInterface":"SVGEvent","bubbles":false,"cancelable":false};
var SVGResize = {"eventInterface":"SVGEvent","bubbles":true,"cancelable":false};
var SVGScroll = {"eventInterface":"SVGEvent","bubbles":true,"cancelable":false};
var SVGUnload = {"eventInterface":"SVGEvent","bubbles":false,"cancelable":false};
var SVGZoom = {"eventInterface":"SVGZoomEvent","bubbles":true,"cancelable":false};
var timeout = {"eventInterface":"ProgressEvent","bubbles":false,"cancelable":false};
var timeupdate = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var touchcancel = {"eventInterface":"TouchEvent","bubbles":true,"cancelable":false};
var touchend = {"eventInterface":"TouchEvent","bubbles":true,"cancelable":true};
var touchmove = {"eventInterface":"TouchEvent","bubbles":true,"cancelable":true};
var touchstart = {"eventInterface":"TouchEvent","bubbles":true,"cancelable":true};
var transitionend = {"eventInterface":"TransitionEvent","bubbles":true,"cancelable":true};
var unload = {"eventInterface":"UIEvent","bubbles":false};
var updateready = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var userproximity = {"eventInterface":"UserProximityEvent","bubbles":false,"cancelable":false};
var voiceschanged = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var visibilitychange = {"eventInterface":"Event","bubbles":true,"cancelable":false};
var volumechange = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var waiting = {"eventInterface":"Event","bubbles":false,"cancelable":false};
var wheel = {"eventInterface":"WheelEvent","bubbles":true,"cancelable":true};
var domEventTypes = {
	abort: abort,
	afterprint: afterprint,
	animationend: animationend,
	animationiteration: animationiteration,
	animationstart: animationstart,
	appinstalled: appinstalled,
	audioprocess: audioprocess,
	audioend: audioend,
	audiostart: audiostart,
	beforeprint: beforeprint,
	beforeunload: beforeunload,
	beginEvent: beginEvent,
	blur: blur,
	boundary: boundary,
	cached: cached,
	canplay: canplay,
	canplaythrough: canplaythrough,
	change: change,
	chargingchange: chargingchange,
	chargingtimechange: chargingtimechange,
	checking: checking,
	click: click,
	close: close,
	complete: complete,
	compositionend: compositionend,
	compositionstart: compositionstart,
	compositionupdate: compositionupdate,
	contextmenu: contextmenu,
	copy: copy,
	cut: cut,
	dblclick: dblclick,
	devicechange: devicechange,
	devicelight: devicelight,
	devicemotion: devicemotion,
	deviceorientation: deviceorientation,
	deviceproximity: deviceproximity,
	dischargingtimechange: dischargingtimechange,
	DOMActivate: DOMActivate,
	DOMAttributeNameChanged: DOMAttributeNameChanged,
	DOMAttrModified: DOMAttrModified,
	DOMCharacterDataModified: DOMCharacterDataModified,
	DOMContentLoaded: DOMContentLoaded,
	DOMElementNameChanged: DOMElementNameChanged,
	DOMFocusIn: DOMFocusIn,
	DOMFocusOut: DOMFocusOut,
	DOMNodeInserted: DOMNodeInserted,
	DOMNodeInsertedIntoDocument: DOMNodeInsertedIntoDocument,
	DOMNodeRemoved: DOMNodeRemoved,
	DOMNodeRemovedFromDocument: DOMNodeRemovedFromDocument,
	DOMSubtreeModified: DOMSubtreeModified,
	downloading: downloading,
	drag: drag,
	dragend: dragend,
	dragenter: dragenter,
	dragleave: dragleave,
	dragover: dragover,
	dragstart: dragstart,
	drop: drop,
	durationchange: durationchange,
	emptied: emptied,
	end: end,
	ended: ended,
	endEvent: endEvent,
	error: error,
	focus: focus,
	focusin: focusin,
	focusout: focusout,
	fullscreenchange: fullscreenchange,
	fullscreenerror: fullscreenerror,
	gamepadconnected: gamepadconnected,
	gamepaddisconnected: gamepaddisconnected,
	gotpointercapture: gotpointercapture,
	hashchange: hashchange,
	lostpointercapture: lostpointercapture,
	input: input,
	invalid: invalid,
	keydown: keydown,
	keypress: keypress,
	keyup: keyup,
	languagechange: languagechange,
	levelchange: levelchange,
	load: load,
	loadeddata: loadeddata,
	loadedmetadata: loadedmetadata,
	loadend: loadend,
	loadstart: loadstart,
	mark: mark,
	message: message,
	messageerror: messageerror,
	mousedown: mousedown,
	mouseenter: mouseenter,
	mouseleave: mouseleave,
	mousemove: mousemove,
	mouseout: mouseout,
	mouseover: mouseover,
	mouseup: mouseup,
	nomatch: nomatch,
	notificationclick: notificationclick,
	noupdate: noupdate,
	obsolete: obsolete,
	offline: offline,
	online: online,
	open: open,
	orientationchange: orientationchange,
	pagehide: pagehide,
	pageshow: pageshow,
	paste: paste,
	pause: pause,
	pointercancel: pointercancel,
	pointerdown: pointerdown,
	pointerenter: pointerenter,
	pointerleave: pointerleave,
	pointerlockchange: pointerlockchange,
	pointerlockerror: pointerlockerror,
	pointermove: pointermove,
	pointerout: pointerout,
	pointerover: pointerover,
	pointerup: pointerup,
	play: play,
	playing: playing,
	popstate: popstate,
	progress: progress,
	push: push,
	pushsubscriptionchange: pushsubscriptionchange,
	ratechange: ratechange,
	readystatechange: readystatechange,
	repeatEvent: repeatEvent,
	reset: reset,
	resize: resize,
	resourcetimingbufferfull: resourcetimingbufferfull,
	result: result,
	resume: resume,
	scroll: scroll,
	seeked: seeked,
	seeking: seeking,
	select: select,
	selectstart: selectstart,
	selectionchange: selectionchange,
	show: show,
	slotchange: slotchange,
	soundend: soundend,
	soundstart: soundstart,
	speechend: speechend,
	speechstart: speechstart,
	stalled: stalled,
	start: start,
	storage: storage,
	submit: submit,
	success: success,
	suspend: suspend,
	SVGAbort: SVGAbort,
	SVGError: SVGError,
	SVGLoad: SVGLoad,
	SVGResize: SVGResize,
	SVGScroll: SVGScroll,
	SVGUnload: SVGUnload,
	SVGZoom: SVGZoom,
	timeout: timeout,
	timeupdate: timeupdate,
	touchcancel: touchcancel,
	touchend: touchend,
	touchmove: touchmove,
	touchstart: touchstart,
	transitionend: transitionend,
	unload: unload,
	updateready: updateready,
	userproximity: userproximity,
	voiceschanged: voiceschanged,
	visibilitychange: visibilitychange,
	volumechange: volumechange,
	waiting: waiting,
	wheel: wheel
};

var domEventTypes$1 = Object.freeze({
	abort: abort,
	afterprint: afterprint,
	animationend: animationend,
	animationiteration: animationiteration,
	animationstart: animationstart,
	appinstalled: appinstalled,
	audioprocess: audioprocess,
	audioend: audioend,
	audiostart: audiostart,
	beforeprint: beforeprint,
	beforeunload: beforeunload,
	beginEvent: beginEvent,
	blur: blur,
	boundary: boundary,
	cached: cached,
	canplay: canplay,
	canplaythrough: canplaythrough,
	change: change,
	chargingchange: chargingchange,
	chargingtimechange: chargingtimechange,
	checking: checking,
	click: click,
	close: close,
	complete: complete,
	compositionend: compositionend,
	compositionstart: compositionstart,
	compositionupdate: compositionupdate,
	contextmenu: contextmenu,
	copy: copy,
	cut: cut,
	dblclick: dblclick,
	devicechange: devicechange,
	devicelight: devicelight,
	devicemotion: devicemotion,
	deviceorientation: deviceorientation,
	deviceproximity: deviceproximity,
	dischargingtimechange: dischargingtimechange,
	DOMActivate: DOMActivate,
	DOMAttributeNameChanged: DOMAttributeNameChanged,
	DOMAttrModified: DOMAttrModified,
	DOMCharacterDataModified: DOMCharacterDataModified,
	DOMContentLoaded: DOMContentLoaded,
	DOMElementNameChanged: DOMElementNameChanged,
	DOMFocusIn: DOMFocusIn,
	DOMFocusOut: DOMFocusOut,
	DOMNodeInserted: DOMNodeInserted,
	DOMNodeInsertedIntoDocument: DOMNodeInsertedIntoDocument,
	DOMNodeRemoved: DOMNodeRemoved,
	DOMNodeRemovedFromDocument: DOMNodeRemovedFromDocument,
	DOMSubtreeModified: DOMSubtreeModified,
	downloading: downloading,
	drag: drag,
	dragend: dragend,
	dragenter: dragenter,
	dragleave: dragleave,
	dragover: dragover,
	dragstart: dragstart,
	drop: drop,
	durationchange: durationchange,
	emptied: emptied,
	end: end,
	ended: ended,
	endEvent: endEvent,
	error: error,
	focus: focus,
	focusin: focusin,
	focusout: focusout,
	fullscreenchange: fullscreenchange,
	fullscreenerror: fullscreenerror,
	gamepadconnected: gamepadconnected,
	gamepaddisconnected: gamepaddisconnected,
	gotpointercapture: gotpointercapture,
	hashchange: hashchange,
	lostpointercapture: lostpointercapture,
	input: input,
	invalid: invalid,
	keydown: keydown,
	keypress: keypress,
	keyup: keyup,
	languagechange: languagechange,
	levelchange: levelchange,
	load: load,
	loadeddata: loadeddata,
	loadedmetadata: loadedmetadata,
	loadend: loadend,
	loadstart: loadstart,
	mark: mark,
	message: message,
	messageerror: messageerror,
	mousedown: mousedown,
	mouseenter: mouseenter,
	mouseleave: mouseleave,
	mousemove: mousemove,
	mouseout: mouseout,
	mouseover: mouseover,
	mouseup: mouseup,
	nomatch: nomatch,
	notificationclick: notificationclick,
	noupdate: noupdate,
	obsolete: obsolete,
	offline: offline,
	online: online,
	open: open,
	orientationchange: orientationchange,
	pagehide: pagehide,
	pageshow: pageshow,
	paste: paste,
	pause: pause,
	pointercancel: pointercancel,
	pointerdown: pointerdown,
	pointerenter: pointerenter,
	pointerleave: pointerleave,
	pointerlockchange: pointerlockchange,
	pointerlockerror: pointerlockerror,
	pointermove: pointermove,
	pointerout: pointerout,
	pointerover: pointerover,
	pointerup: pointerup,
	play: play,
	playing: playing,
	popstate: popstate,
	progress: progress,
	push: push,
	pushsubscriptionchange: pushsubscriptionchange,
	ratechange: ratechange,
	readystatechange: readystatechange,
	repeatEvent: repeatEvent,
	reset: reset,
	resize: resize,
	resourcetimingbufferfull: resourcetimingbufferfull,
	result: result,
	resume: resume,
	scroll: scroll,
	seeked: seeked,
	seeking: seeking,
	select: select,
	selectstart: selectstart,
	selectionchange: selectionchange,
	show: show,
	slotchange: slotchange,
	soundend: soundend,
	soundstart: soundstart,
	speechend: speechend,
	speechstart: speechstart,
	stalled: stalled,
	start: start,
	storage: storage,
	submit: submit,
	success: success,
	suspend: suspend,
	SVGAbort: SVGAbort,
	SVGError: SVGError,
	SVGLoad: SVGLoad,
	SVGResize: SVGResize,
	SVGScroll: SVGScroll,
	SVGUnload: SVGUnload,
	SVGZoom: SVGZoom,
	timeout: timeout,
	timeupdate: timeupdate,
	touchcancel: touchcancel,
	touchend: touchend,
	touchmove: touchmove,
	touchstart: touchstart,
	transitionend: transitionend,
	unload: unload,
	updateready: updateready,
	userproximity: userproximity,
	voiceschanged: voiceschanged,
	visibilitychange: visibilitychange,
	volumechange: volumechange,
	waiting: waiting,
	wheel: wheel,
	default: domEventTypes
});

var require$$0 = ( domEventTypes$1 && domEventTypes ) || domEventTypes$1;

var domEventTypes$2 = require$$0;

var defaultEventType = {
  eventInterface: 'Event',
  cancelable: true,
  bubbles: true
};

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

function createEvent(
  type,
  modifier,
  ref,
  options
) {
  var eventInterface = ref.eventInterface;
  var bubbles = ref.bubbles;
  var cancelable = ref.cancelable;

  var SupportedEventInterface =
    typeof window[eventInterface] === 'function'
      ? window[eventInterface]
      : window.Event;

  var event = new SupportedEventInterface(type, Object.assign({}, options,
    {bubbles: bubbles,
    cancelable: cancelable,
    keyCode: modifiers[modifier]}));

  return event
}

function createOldEvent(
  type,
  modifier,
  ref
) {
  var eventInterface = ref.eventInterface;
  var bubbles = ref.bubbles;
  var cancelable = ref.cancelable;

  var event = document.createEvent('Event');
  event.initEvent(type, bubbles, cancelable);
  event.keyCode = modifiers[modifier];
  return event
}

function createDOMEvent(type, options) {
  var ref = type.split('.');
  var eventType = ref[0];
  var modifier = ref[1];
  var meta = domEventTypes$2[eventType] || defaultEventType;

  // Fallback for IE10,11 - https://stackoverflow.com/questions/26596123
  var event =
    typeof window.Event === 'function'
      ? createEvent(eventType, modifier, meta, options)
      : createOldEvent(eventType, modifier, meta);

  var eventPrototype = Object.getPrototypeOf(event);
  Object.keys(options || {}).forEach(function (key) {
    var propertyDescriptor = Object.getOwnPropertyDescriptor(
      eventPrototype,
      key
    );

    var canSetProperty = !(
      propertyDescriptor && propertyDescriptor.setter === undefined
    );
    if (canSetProperty) {
      event[key] = options[key];
    }
  });

  return event
}

// 

var Wrapper = function Wrapper(
  node,
  options,
  isVueWrapper
) {
  var vnode = node instanceof Element ? null : node;
  var element = node instanceof Element ? node : node.elm;
  // Prevent redefine by VueWrapper
  if (!isVueWrapper) {
    // $FlowIgnore : issue with defineProperty
    Object.defineProperty(this, 'rootNode', {
      get: function () { return vnode || element; },
      set: function () { return throwError('wrapper.rootNode is read-only'); }
    });
    // $FlowIgnore
    Object.defineProperty(this, 'vnode', {
      get: function () { return vnode; },
      set: function () { return throwError('wrapper.vnode is read-only'); }
    });
    // $FlowIgnore
    Object.defineProperty(this, 'element', {
      get: function () { return element; },
      set: function () { return throwError('wrapper.element is read-only'); }
    });
    // $FlowIgnore
    Object.defineProperty(this, 'vm', {
      get: function () { return undefined; },
      set: function () { return throwError('wrapper.vm is read-only'); }
    });
  }
  var frozenOptions = Object.freeze(options);
  // $FlowIgnore
  Object.defineProperty(this, 'options', {
    get: function () { return frozenOptions; },
    set: function () { return throwError('wrapper.options is read-only'); }
  });
  if (
    this.vnode &&
    (this.vnode[FUNCTIONAL_OPTIONS] || this.vnode.functionalContext)
  ) {
    this.isFunctionalComponent = true;
  }
};

Wrapper.prototype.at = function at () {
  throwError('at() must be called on a WrapperArray');
};

/**
 * Returns an Object containing all the attribute/value pairs on the element.
 */
Wrapper.prototype.attributes = function attributes (key) {
  var attributes = this.element.attributes;
  var attributeMap = {};
  for (var i = 0; i < attributes.length; i++) {
    var att = attributes.item(i);
    attributeMap[att.localName] = att.value;
  }

  return key ? attributeMap[key] : attributeMap
};

/**
 * Returns an Array containing all the classes on the element
 */
Wrapper.prototype.classes = function classes (className) {
    var this$1 = this;

  var classAttribute = this.element.getAttribute('class');
  var classes = classAttribute ? classAttribute.split(' ') : [];
  // Handle converting cssmodules identifiers back to the original class name
  if (this.vm && this.vm.$style) {
    var cssModuleIdentifiers = Object.keys(this.vm.$style).reduce(
      function (acc, key) {
        // $FlowIgnore
        var moduleIdent = this$1.vm.$style[key];
        if (moduleIdent) {
          acc[moduleIdent.split(' ')[0]] = key;
        }
        return acc
      },
      {}
    );
    classes = classes.map(function (name) { return cssModuleIdentifiers[name] || name; });
  }

  return className ? !!(classes.indexOf(className) > -1) : classes
};

/**
 * Checks if wrapper contains provided selector.
 */
Wrapper.prototype.contains = function contains (rawSelector) {
  var selector = getSelector(rawSelector, 'contains');
  var nodes = find(this.rootNode, this.vm, selector);
  return nodes.length > 0
};

/**
 * Calls destroy on vm
 */
Wrapper.prototype.destroy = function destroy () {
  if (!this.isVueInstance()) {
    throwError("wrapper.destroy() can only be called on a Vue instance");
  }

  if (this.element.parentNode) {
    this.element.parentNode.removeChild(this.element);
  }
  // $FlowIgnore
  this.vm.$destroy();
  throwIfInstancesThrew(this.vm);
};

/**
 * Returns an object containing custom events emitted by the Wrapper vm
 */
Wrapper.prototype.emitted = function emitted (
  event
) {
  if (!this._emitted && !this.vm) {
    throwError("wrapper.emitted() can only be called on a Vue instance");
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
    throwError(
      "wrapper.emittedByOrder() can only be called on a Vue instance"
    );
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
 * Finds first node in tree of the current wrapper that
 * matches the provided selector.
 */
Wrapper.prototype.find = function find$1 (rawSelector) {
  var selector = getSelector(rawSelector, 'find');
  var node = find(this.rootNode, this.vm, selector)[0];

  if (!node) {
    if (selector.type === REF_SELECTOR) {
      return new ErrorWrapper(("ref=\"" + (selector.value.ref) + "\""))
    }
    return new ErrorWrapper(
      typeof selector.value === 'string' ? selector.value : 'Component'
    )
  }

  return createWrapper(node, this.options)
};

/**
 * Finds node in tree of the current wrapper that matches
 * the provided selector.
 */
Wrapper.prototype.findAll = function findAll (rawSelector) {
    var this$1 = this;

  var selector = getSelector(rawSelector, 'findAll');
  var nodes = find(this.rootNode, this.vm, selector);
  var wrappers = nodes.map(function (node) {
    // Using CSS Selector, returns a VueWrapper instance if the root element
    // binds a Vue instance.
    return createWrapper(node, this$1.options)
  });
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
Wrapper.prototype.is = function is (rawSelector) {
  var selector = getSelector(rawSelector, 'is');

  if (selector.type === REF_SELECTOR) {
    throwError('$ref selectors can not be used with wrapper.is()');
  }

  return matches(this.rootNode, selector)
};

/**
 * Checks if node is empty
 */
Wrapper.prototype.isEmpty = function isEmpty () {
  if (!this.vnode) {
    return this.element.innerHTML === ''
  }
  var nodes = [];
  var node = this.vnode;
  var i = 0;

  while (node) {
    if (node.child) {
      nodes.push(node.child._vnode);
    }
    node.children &&
      node.children.forEach(function (n) {
        nodes.push(n);
      });
    node = nodes[i++];
  }
  return nodes.every(function (n) { return n.isComment || n.child; })
};

/**
 * Checks if node is visible
 */
Wrapper.prototype.isVisible = function isVisible () {
  var element = this.element;
  while (element) {
    if (
      element.style &&
      (element.style.visibility === 'hidden' ||
        element.style.display === 'none')
    ) {
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
  return !!this.vm
};

/**
 * Returns name of component, or tag name if node is not a Vue component
 */
Wrapper.prototype.name = function name () {
  if (this.vm) {
    return (
      this.vm.$options.name ||
      // compat for Vue < 2.3
      (this.vm.$options.extendOptions && this.vm.$options.extendOptions.name)
    )
  }

  if (!this.vnode) {
    return this.element.tagName
  }

  return this.vnode.tag
};

/**
 * Returns an Object containing the prop name/value pairs on the element
 */
Wrapper.prototype.props = function props (key) {
    var this$1 = this;

  if (this.isFunctionalComponent) {
    throwError(
      "wrapper.props() cannot be called on a mounted functional component."
    );
  }
  if (!this.vm) {
    throwError('wrapper.props() must be called on a Vue instance');
  }

  var props = {};
  var keys = this.vm && this.vm.$options._propKeys;

  if (keys) {
(keys || {}).forEach(function (key) {
      if (this$1.vm) {
        props[key] = this$1.vm[key];
      }
    });
  }

  if (key) {
    return props[key]
  }

  return props
};

/**
 * Checks radio button or checkbox element
 */
Wrapper.prototype.setChecked = function setChecked (checked) {
    if ( checked === void 0 ) checked = true;

  if (typeof checked !== 'boolean') {
    throwError('wrapper.setChecked() must be passed a boolean');
  }
  var tagName = this.element.tagName;
  // $FlowIgnore
  var type = this.attributes().type;
  var event = getCheckedEvent();

  if (tagName === 'INPUT' && type === 'checkbox') {
    if (this.element.checked === checked) {
      return
    }
    if (event !== 'click' || isPhantomJS) {
      // $FlowIgnore
      this.element.checked = checked;
    }
    this.trigger(event);
    return
  }

  if (tagName === 'INPUT' && type === 'radio') {
    if (!checked) {
      throwError(
        "wrapper.setChecked() cannot be called with parameter false on a " +
          "<input type=\"radio\" /> element."
      );
    }

    if (event !== 'click' || isPhantomJS) {
      // $FlowIgnore
      this.element.selected = true;
    }
    this.trigger(event);
    return
  }

  throwError("wrapper.setChecked() cannot be called on this element");
};

/**
 * Selects <option></option> element
 */
Wrapper.prototype.setSelected = function setSelected () {
  var tagName = this.element.tagName;

  if (tagName === 'SELECT') {
    throwError(
      "wrapper.setSelected() cannot be called on select. Call it on one of " +
        "its options"
    );
  }

  if (tagName === 'OPTION') {
    // $FlowIgnore
    this.element.selected = true;
    // $FlowIgnore
    var parentElement = this.element.parentElement;

    // $FlowIgnore
    if (parentElement.tagName === 'OPTGROUP') {
      // $FlowIgnore
      parentElement = parentElement.parentElement;
    }

    // $FlowIgnore
    createWrapper(parentElement, this.options).trigger('change');
    return
  }

  throwError("wrapper.setSelected() cannot be called on this element");
};

/**
 * Sets vm data
 */
Wrapper.prototype.setData = function setData (data) {
  if (this.isFunctionalComponent) {
    throwError("wrapper.setData() cannot be called on a functional component");
  }

  if (!this.vm) {
    throwError("wrapper.setData() can only be called on a Vue instance");
  }

  recursivelySetData(this.vm, this.vm, data);
};

/**
 * Sets vm methods
 */
Wrapper.prototype.setMethods = function setMethods (methods) {
    var this$1 = this;

  if (!this.isVueInstance()) {
    throwError("wrapper.setMethods() can only be called on a Vue instance");
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

  var originalConfig = Vue.config.silent;
  Vue.config.silent = config.silent;
  if (this.isFunctionalComponent) {
    throwError(
      "wrapper.setProps() cannot be called on a functional component"
    );
  }
  if (!this.vm) {
    throwError("wrapper.setProps() can only be called on a Vue instance");
  }

  Object.keys(data).forEach(function (key) {
    if (
      typeof data[key] === 'object' &&
      data[key] !== null &&
      // $FlowIgnore : Problem with possibly null this.vm
      data[key] === this$1.vm[key]
    ) {
      throwError(
        "wrapper.setProps() called with the same object of the existing " +
          key + " property. You must call wrapper.setProps() with a new " +
          "object to trigger reactivity"
      );
    }
    if (
      !this$1.vm ||
      !this$1.vm.$options._propKeys ||
      !this$1.vm.$options._propKeys.some(function (prop) { return prop === key; })
    ) {
      if (VUE_VERSION > 2.3) {
        // $FlowIgnore : Problem with possibly null this.vm
        this$1.vm.$attrs[key] = data[key];
        return
      }
      throwError(
        "wrapper.setProps() called with " + key + " property which " +
          "is not defined on the component"
      );
    }

    if (this$1.vm && this$1.vm._props) {
      // Set actual props value
      this$1.vm._props[key] = data[key];
      // $FlowIgnore : Problem with possibly null this.vm
      this$1.vm[key] = data[key];
    } else {
      // $FlowIgnore : Problem with possibly null this.vm.$options
      this$1.vm.$options.propsData[key] = data[key];
      // $FlowIgnore : Problem with possibly null this.vm
      this$1.vm[key] = data[key];
      // $FlowIgnore : Need to call this twice to fix watcher bug in 2.0.x
      this$1.vm[key] = data[key];
    }
  });
  // $FlowIgnore : Problem with possibly null this.vm
  this.vm.$forceUpdate();
  Vue.config.silent = originalConfig;
};

/**
 * Sets element value and triggers input event
 */
Wrapper.prototype.setValue = function setValue (value) {
  var tagName = this.element.tagName;
  // $FlowIgnore
  var type = this.attributes().type;

  if (tagName === 'OPTION') {
    throwError(
      "wrapper.setValue() cannot be called on an <option> element. Use " +
        "wrapper.setSelected() instead"
    );
  } else if (tagName === 'INPUT' && type === 'checkbox') {
    throwError(
      "wrapper.setValue() cannot be called on a <input type=\"checkbox\" /> " +
        "element. Use wrapper.setChecked() instead"
    );
  } else if (tagName === 'INPUT' && type === 'radio') {
    throwError(
      "wrapper.setValue() cannot be called on a <input type=\"radio\" /> " +
        "element. Use wrapper.setChecked() instead"
    );
  } else if (
    tagName === 'INPUT' ||
    tagName === 'TEXTAREA' ||
    tagName === 'SELECT'
  ) {
    var event = tagName === 'SELECT' ? 'change' : 'input';
    // $FlowIgnore
    this.element.value = value;
    this.trigger(event);
  } else {
    throwError("wrapper.setValue() cannot be called on this element");
  }
};

/**
 * Return text of wrapper element
 */
Wrapper.prototype.text = function text () {
  return this.element.textContent.trim()
};

/**
 * Dispatches a DOM event on wrapper
 */
Wrapper.prototype.trigger = function trigger (type, options) {
    if ( options === void 0 ) options = {};

  if (typeof type !== 'string') {
    throwError('wrapper.trigger() must be passed a string');
  }

  if (options.target) {
    throwError(
      "you cannot set the target value of an event. See the notes section " +
        "of the docs for more details—" +
        "https://vue-test-utils.vuejs.org/api/wrapper/trigger.html"
    );
  }

  // Don't fire event on a disabled element
  if (this.attributes().disabled) {
    return
  }

  var event = createDOMEvent(type, options);
  this.element.dispatchEvent(event);
};

// 

var VueWrapper = (function (Wrapper$$1) {
  function VueWrapper(vm, options) {
    var this$1 = this;

    Wrapper$$1.call(this, vm._vnode, options, true);
    // $FlowIgnore : issue with defineProperty
    Object.defineProperty(this, 'rootNode', {
      get: function () { return vm.$vnode || { child: this$1.vm }; },
      set: function () { return throwError('wrapper.vnode is read-only'); }
    });
    // $FlowIgnore : issue with defineProperty
    Object.defineProperty(this, 'vnode', {
      get: function () { return vm._vnode; },
      set: function () { return throwError('wrapper.vnode is read-only'); }
    });
    // $FlowIgnore
    Object.defineProperty(this, 'element', {
      get: function () { return vm.$el; },
      set: function () { return throwError('wrapper.element is read-only'); }
    });
    // $FlowIgnore
    Object.defineProperty(this, 'vm', {
      get: function () { return vm; },
      set: function () { return throwError('wrapper.vm is read-only'); }
    });
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

function createWrapper(
  node,
  options
) {
  if ( options === void 0 ) options = {};

  var componentInstance = node.child;
  if (componentInstance) {
    return new VueWrapper(componentInstance, options)
  }
  return node instanceof Vue
    ? new VueWrapper(node, options)
    : new Wrapper(node, options)
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
var hasOwnProperty$1 = objectProto.hasOwnProperty;

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
  var isOwn = hasOwnProperty$1.call(value, symToStringTag),
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
var hasOwnProperty$2 = objectProto$2.hasOwnProperty;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString$1.call(hasOwnProperty$2).replace(reRegExpChar, '\\$&')
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
var hasOwnProperty$3 = objectProto$3.hasOwnProperty;

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
  return hasOwnProperty$3.call(data, key) ? data[key] : undefined;
}

var _hashGet = hashGet;

/** Used for built-in method references. */
var objectProto$4 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$4 = objectProto$4.hasOwnProperty;

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
  return _nativeCreate ? (data[key] !== undefined) : hasOwnProperty$4.call(data, key);
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

/** Used for built-in method references. */
var objectProto$5 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$5 = objectProto$5.hasOwnProperty;

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
  if (!(hasOwnProperty$5.call(object, key) && eq_1(objValue, value)) ||
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
var hasOwnProperty$6 = objectProto$6.hasOwnProperty;

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
  return isObjectLike_1(value) && hasOwnProperty$6.call(value, 'callee') &&
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

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

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
  length = length == null ? MAX_SAFE_INTEGER : length;
  return !!length &&
    (typeof value == 'number' || reIsUint.test(value)) &&
    (value > -1 && value % 1 == 0 && value < length);
}

var _isIndex = isIndex;

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER$1 = 9007199254740991;

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
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER$1;
}

var isLength_1 = isLength;

/** `Object#toString` result references. */
var argsTag$1 = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag$1 = '[object Function]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
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
typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
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
var objectProto$7 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$7 = objectProto$7.hasOwnProperty;

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

/** Used for built-in method references. */
var objectProto$8 = Object.prototype;

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto$8;

  return value === proto;
}

var _isPrototype = isPrototype;

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

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeKeys = _overArg(Object.keys, Object);

var _nativeKeys = nativeKeys;

/** Used for built-in method references. */
var objectProto$9 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$8 = objectProto$9.hasOwnProperty;

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
    if (hasOwnProperty$8.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

var _baseKeys = baseKeys;

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
var hasOwnProperty$9 = objectProto$10.hasOwnProperty;

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
    if (!(key == 'constructor' && (isProto || !hasOwnProperty$9.call(object, key)))) {
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
var objectProto$11 = Object.prototype;

/** Built-in value references. */
var propertyIsEnumerable$1 = objectProto$11.propertyIsEnumerable;

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

/** Built-in value references. */
var getPrototype = _overArg(Object.getPrototypeOf, Object);

var _getPrototype = getPrototype;

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
var Set$1 = _getNative(_root, 'Set');

var _Set = Set$1;

/* Built-in method references that are verified to be native. */
var WeakMap = _getNative(_root, 'WeakMap');

var _WeakMap = WeakMap;

/** `Object#toString` result references. */
var mapTag$1 = '[object Map]',
    objectTag$1 = '[object Object]',
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
        Ctor = result == objectTag$1 ? value.constructor : undefined,
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
var objectProto$12 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$10 = objectProto$12.hasOwnProperty;

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
    objectTag$2 = '[object Object]',
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
cloneableTags[numberTag$2] = cloneableTags[objectTag$2] =
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
    if (tag == objectTag$2 || tag == argsTag$2 || (isFunc && !object)) {
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

// 

function createLocalVue(_Vue) {
  if ( _Vue === void 0 ) _Vue = Vue;

  var instance = _Vue.extend();

  // clone global APIs
  Object.keys(_Vue).forEach(function (key) {
    if (!instance.hasOwnProperty(key)) {
      var original = _Vue[key];
      // cloneDeep can fail when cloning Vue instances
      // cloneDeep checks that the instance has a Symbol
      // which errors in Vue < 2.17 (https://github.com/vuejs/vue/pull/7878)
      try {
        instance[key] =
          typeof original === 'object' ? cloneDeep_1(original) : original;
      } catch (e) {
        instance[key] = original;
      }
    }
  });

  // config is not enumerable
  instance.config = cloneDeep_1(Vue.config);

  instance.config.errorHandler = Vue.config.errorHandler;

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

Vue.config.productionTip = false;
Vue.config.devtools = false;

function mount(component, options) {
  if ( options === void 0 ) options = {};

  warnIfNoWindow();

  addGlobalErrorHandler(Vue);

  var _Vue = createLocalVue(options.localVue);

  var mergedOptions = mergeOptions(options, config);

  validateOptions(mergedOptions, component);

  var parentVm = createInstance(component, mergedOptions, _Vue);

  var el = options.attachToDocument ? createElement() : undefined;
  var vm = parentVm.$mount(el);

  component._Ctor = {};

  throwIfInstancesThrew(vm);

  var wrapperOptions = {
    attachedToDocument: !!mergedOptions.attachToDocument
  };

  var root = parentVm.$options._isFunctionalContainer
    ? vm._vnode
    : vm.$children[0];

  return createWrapper(root, wrapperOptions)
}

// 


function shallowMount(
  component,
  options
) {
  if ( options === void 0 ) options = {};

  return mount(component, Object.assign({}, options,
    {shouldProxy: true}))
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
  render: function render(h) {
    return h(this.tag, undefined, this.$slots.default)
  }
}

function shallow(component, options) {
  warn(
    "shallow has been renamed to shallowMount. shallow " +
      "will be removed in 1.0.0, use shallowMount instead"
  );
  return shallowMount(component, options)
}

var index = {
  createLocalVue: createLocalVue,
  createWrapper: createWrapper,
  config: config,
  mount: mount,
  shallow: shallow,
  shallowMount: shallowMount,
  RouterLinkStub: RouterLinkStub,
  Wrapper: Wrapper,
  WrapperArray: WrapperArray
}

module.exports = index;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidnVlLXRlc3QtdXRpbHMuanMiLCJzb3VyY2VzIjpbIi4uLy4uL2NyZWF0ZS1pbnN0YW5jZS9jcmVhdGUtc2xvdC12bm9kZXMuanMiLCIuLi8uLi9zaGFyZWQvbm9kZV9tb2R1bGVzL3NlbXZlci9zZW12ZXIuanMiLCIuLi8uLi9zaGFyZWQvdXRpbC5qcyIsIi4uLy4uL2NyZWF0ZS1pbnN0YW5jZS9hZGQtbW9ja3MuanMiLCIuLi8uLi9jcmVhdGUtaW5zdGFuY2UvbG9nLWV2ZW50cy5qcyIsIi4uLy4uL3NoYXJlZC9jb25zdHMuanMiLCIuLi8uLi9jcmVhdGUtaW5zdGFuY2UvYWRkLXN0dWJzLmpzIiwiLi4vLi4vc2hhcmVkL3ZhbGlkYXRvcnMuanMiLCIuLi8uLi9zaGFyZWQvY29tcGlsZS10ZW1wbGF0ZS5qcyIsIi4uLy4uL2NyZWF0ZS1pbnN0YW5jZS9leHRyYWN0LWluc3RhbmNlLW9wdGlvbnMuanMiLCIuLi8uLi9jcmVhdGUtaW5zdGFuY2UvY3JlYXRlLXNjb3BlZC1zbG90cy5qcyIsIi4uLy4uL2NyZWF0ZS1pbnN0YW5jZS9jcmVhdGUtY29tcG9uZW50LXN0dWJzLmpzIiwiLi4vLi4vY3JlYXRlLWluc3RhbmNlL3BhdGNoLWNyZWF0ZS1lbGVtZW50LmpzIiwiLi4vLi4vY3JlYXRlLWluc3RhbmNlL2NyZWF0ZS1pbnN0YW5jZS5qcyIsIi4uL3NyYy9jcmVhdGUtZWxlbWVudC5qcyIsIi4uL3NyYy9maW5kLWRvbS1ub2Rlcy5qcyIsIi4uL3NyYy9tYXRjaGVzLmpzIiwiLi4vc3JjL2ZpbmQuanMiLCIuLi9zcmMvZXJyb3IuanMiLCIuLi8uLi9zaGFyZWQvbm9ybWFsaXplLmpzIiwiLi4vLi4vc2hhcmVkL21lcmdlLW9wdGlvbnMuanMiLCIuLi9zcmMvY29uZmlnLmpzIiwiLi4vc3JjL3dhcm4taWYtbm8td2luZG93LmpzIiwiLi4vc3JjL2dldC1zZWxlY3Rvci5qcyIsIi4uL3NyYy93cmFwcGVyLWFycmF5LmpzIiwiLi4vc3JjL2Vycm9yLXdyYXBwZXIuanMiLCIuLi9zcmMvcmVjdXJzaXZlbHktc2V0LWRhdGEuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZG9tLWV2ZW50LXR5cGVzL2luZGV4LmpzIiwiLi4vc3JjL2NyZWF0ZS1kb20tZXZlbnQuanMiLCIuLi9zcmMvd3JhcHBlci5qcyIsIi4uL3NyYy92dWUtd3JhcHBlci5qcyIsIi4uL3NyYy9jcmVhdGUtd3JhcHBlci5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2xpc3RDYWNoZUNsZWFyLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9lcS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Fzc29jSW5kZXhPZi5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2xpc3RDYWNoZURlbGV0ZS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2xpc3RDYWNoZUdldC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2xpc3RDYWNoZUhhcy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2xpc3RDYWNoZVNldC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX0xpc3RDYWNoZS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX3N0YWNrQ2xlYXIuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19zdGFja0RlbGV0ZS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX3N0YWNrR2V0LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fc3RhY2tIYXMuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19mcmVlR2xvYmFsLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fcm9vdC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX1N5bWJvbC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2dldFJhd1RhZy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX29iamVjdFRvU3RyaW5nLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZUdldFRhZy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvaXNPYmplY3QuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL2lzRnVuY3Rpb24uanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19jb3JlSnNEYXRhLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9faXNNYXNrZWQuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL190b1NvdXJjZS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VJc05hdGl2ZS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2dldFZhbHVlLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fZ2V0TmF0aXZlLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fTWFwLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fbmF0aXZlQ3JlYXRlLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9faGFzaENsZWFyLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9faGFzaERlbGV0ZS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2hhc2hHZXQuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19oYXNoSGFzLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9faGFzaFNldC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX0hhc2guanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19tYXBDYWNoZUNsZWFyLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9faXNLZXlhYmxlLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fZ2V0TWFwRGF0YS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX21hcENhY2hlRGVsZXRlLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fbWFwQ2FjaGVHZXQuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19tYXBDYWNoZUhhcy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX21hcENhY2hlU2V0LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fTWFwQ2FjaGUuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19zdGFja1NldC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX1N0YWNrLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYXJyYXlFYWNoLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fZGVmaW5lUHJvcGVydHkuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19iYXNlQXNzaWduVmFsdWUuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19hc3NpZ25WYWx1ZS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2NvcHlPYmplY3QuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19iYXNlVGltZXMuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL2lzT2JqZWN0TGlrZS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VJc0FyZ3VtZW50cy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvaXNBcmd1bWVudHMuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL2lzQXJyYXkuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL3N0dWJGYWxzZS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvaXNCdWZmZXIuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19pc0luZGV4LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9pc0xlbmd0aC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VJc1R5cGVkQXJyYXkuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19iYXNlVW5hcnkuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19ub2RlVXRpbC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvaXNUeXBlZEFycmF5LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYXJyYXlMaWtlS2V5cy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2lzUHJvdG90eXBlLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fb3ZlckFyZy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX25hdGl2ZUtleXMuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19iYXNlS2V5cy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvaXNBcnJheUxpa2UuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL2tleXMuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19iYXNlQXNzaWduLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fbmF0aXZlS2V5c0luLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZUtleXNJbi5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gva2V5c0luLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZUFzc2lnbkluLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fY2xvbmVCdWZmZXIuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19jb3B5QXJyYXkuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19hcnJheUZpbHRlci5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvc3R1YkFycmF5LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fZ2V0U3ltYm9scy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2NvcHlTeW1ib2xzLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYXJyYXlQdXNoLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fZ2V0UHJvdG90eXBlLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fZ2V0U3ltYm9sc0luLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fY29weVN5bWJvbHNJbi5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VHZXRBbGxLZXlzLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fZ2V0QWxsS2V5cy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2dldEFsbEtleXNJbi5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX0RhdGFWaWV3LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fUHJvbWlzZS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX1NldC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX1dlYWtNYXAuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19nZXRUYWcuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19pbml0Q2xvbmVBcnJheS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX1VpbnQ4QXJyYXkuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19jbG9uZUFycmF5QnVmZmVyLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fY2xvbmVEYXRhVmlldy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2FkZE1hcEVudHJ5LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYXJyYXlSZWR1Y2UuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19tYXBUb0FycmF5LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fY2xvbmVNYXAuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19jbG9uZVJlZ0V4cC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2FkZFNldEVudHJ5LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fc2V0VG9BcnJheS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Nsb25lU2V0LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fY2xvbmVTeW1ib2wuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19jbG9uZVR5cGVkQXJyYXkuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19pbml0Q2xvbmVCeVRhZy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VDcmVhdGUuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19pbml0Q2xvbmVPYmplY3QuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19iYXNlQ2xvbmUuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL2Nsb25lRGVlcC5qcyIsIi4uL3NyYy9jcmVhdGUtbG9jYWwtdnVlLmpzIiwiLi4vLi4vc2hhcmVkL3ZhbGlkYXRlLXNsb3RzLmpzIiwiLi4vLi4vc2hhcmVkL3ZhbGlkYXRlLW9wdGlvbnMuanMiLCIuLi9zcmMvbW91bnQuanMiLCIuLi9zcmMvc2hhbGxvdy1tb3VudC5qcyIsIi4uL3NyYy9jb21wb25lbnRzL1JvdXRlckxpbmtTdHViLmpzIiwiLi4vc3JjL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIEBmbG93XG5cbmltcG9ydCB7IGNvbXBpbGVUb0Z1bmN0aW9ucyB9IGZyb20gJ3Z1ZS10ZW1wbGF0ZS1jb21waWxlcidcblxuZnVuY3Rpb24gY3JlYXRlVk5vZGVzKHZtOiBDb21wb25lbnQsIHNsb3RWYWx1ZTogc3RyaW5nLCBuYW1lKTogQXJyYXk8Vk5vZGU+IHtcbiAgY29uc3QgZWwgPSBjb21waWxlVG9GdW5jdGlvbnMoXG4gICAgYDxkaXY+PHRlbXBsYXRlIHNsb3Q9JHtuYW1lfT4ke3Nsb3RWYWx1ZX08L3RlbXBsYXRlPjwvZGl2PmBcbiAgKVxuICBjb25zdCBfc3RhdGljUmVuZGVyRm5zID0gdm0uX3JlbmRlclByb3h5LiRvcHRpb25zLnN0YXRpY1JlbmRlckZuc1xuICBjb25zdCBfc3RhdGljVHJlZXMgPSB2bS5fcmVuZGVyUHJveHkuX3N0YXRpY1RyZWVzXG4gIHZtLl9yZW5kZXJQcm94eS5fc3RhdGljVHJlZXMgPSBbXVxuICB2bS5fcmVuZGVyUHJveHkuJG9wdGlvbnMuc3RhdGljUmVuZGVyRm5zID0gZWwuc3RhdGljUmVuZGVyRm5zXG4gIGNvbnN0IHZub2RlID0gZWwucmVuZGVyLmNhbGwodm0uX3JlbmRlclByb3h5LCB2bS4kY3JlYXRlRWxlbWVudClcbiAgdm0uX3JlbmRlclByb3h5LiRvcHRpb25zLnN0YXRpY1JlbmRlckZucyA9IF9zdGF0aWNSZW5kZXJGbnNcbiAgdm0uX3JlbmRlclByb3h5Ll9zdGF0aWNUcmVlcyA9IF9zdGF0aWNUcmVlc1xuICByZXR1cm4gdm5vZGUuY2hpbGRyZW5bMF1cbn1cblxuZnVuY3Rpb24gY3JlYXRlVk5vZGVzRm9yU2xvdChcbiAgdm06IENvbXBvbmVudCxcbiAgc2xvdFZhbHVlOiBTbG90VmFsdWUsXG4gIG5hbWU6IHN0cmluZ1xuKTogVk5vZGUgfCBBcnJheTxWTm9kZT4ge1xuICBpZiAodHlwZW9mIHNsb3RWYWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gY3JlYXRlVk5vZGVzKHZtLCBzbG90VmFsdWUsIG5hbWUpXG4gIH1cbiAgY29uc3Qgdm5vZGUgPSB2bS4kY3JlYXRlRWxlbWVudChzbG90VmFsdWUpXG4gIDsodm5vZGUuZGF0YSB8fCAodm5vZGUuZGF0YSA9IHt9KSkuc2xvdCA9IG5hbWVcbiAgcmV0dXJuIHZub2RlXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTbG90Vk5vZGVzKFxuICB2bTogQ29tcG9uZW50LFxuICBzbG90czogU2xvdHNPYmplY3Rcbik6IEFycmF5PFZOb2RlIHwgQXJyYXk8Vk5vZGU+PiB7XG4gIHJldHVybiBPYmplY3Qua2V5cyhzbG90cykucmVkdWNlKChhY2MsIGtleSkgPT4ge1xuICAgIGNvbnN0IGNvbnRlbnQgPSBzbG90c1trZXldXG4gICAgaWYgKEFycmF5LmlzQXJyYXkoY29udGVudCkpIHtcbiAgICAgIGNvbnN0IG5vZGVzID0gY29udGVudC5tYXAoc2xvdERlZiA9PlxuICAgICAgICBjcmVhdGVWTm9kZXNGb3JTbG90KHZtLCBzbG90RGVmLCBrZXkpXG4gICAgICApXG4gICAgICByZXR1cm4gYWNjLmNvbmNhdChub2RlcylcbiAgICB9XG5cbiAgICByZXR1cm4gYWNjLmNvbmNhdChjcmVhdGVWTm9kZXNGb3JTbG90KHZtLCBjb250ZW50LCBrZXkpKVxuICB9LCBbXSlcbn1cbiIsImV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IFNlbVZlcjtcblxuLy8gVGhlIGRlYnVnIGZ1bmN0aW9uIGlzIGV4Y2x1ZGVkIGVudGlyZWx5IGZyb20gdGhlIG1pbmlmaWVkIHZlcnNpb24uXG4vKiBub21pbiAqLyB2YXIgZGVidWc7XG4vKiBub21pbiAqLyBpZiAodHlwZW9mIHByb2Nlc3MgPT09ICdvYmplY3QnICYmXG4gICAgLyogbm9taW4gKi8gcHJvY2Vzcy5lbnYgJiZcbiAgICAvKiBub21pbiAqLyBwcm9jZXNzLmVudi5OT0RFX0RFQlVHICYmXG4gICAgLyogbm9taW4gKi8gL1xcYnNlbXZlclxcYi9pLnRlc3QocHJvY2Vzcy5lbnYuTk9ERV9ERUJVRykpXG4gIC8qIG5vbWluICovIGRlYnVnID0gZnVuY3Rpb24oKSB7XG4gICAgLyogbm9taW4gKi8gdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApO1xuICAgIC8qIG5vbWluICovIGFyZ3MudW5zaGlmdCgnU0VNVkVSJyk7XG4gICAgLyogbm9taW4gKi8gY29uc29sZS5sb2cuYXBwbHkoY29uc29sZSwgYXJncyk7XG4gICAgLyogbm9taW4gKi8gfTtcbi8qIG5vbWluICovIGVsc2VcbiAgLyogbm9taW4gKi8gZGVidWcgPSBmdW5jdGlvbigpIHt9O1xuXG4vLyBOb3RlOiB0aGlzIGlzIHRoZSBzZW12ZXIub3JnIHZlcnNpb24gb2YgdGhlIHNwZWMgdGhhdCBpdCBpbXBsZW1lbnRzXG4vLyBOb3QgbmVjZXNzYXJpbHkgdGhlIHBhY2thZ2UgdmVyc2lvbiBvZiB0aGlzIGNvZGUuXG5leHBvcnRzLlNFTVZFUl9TUEVDX1ZFUlNJT04gPSAnMi4wLjAnO1xuXG52YXIgTUFYX0xFTkdUSCA9IDI1NjtcbnZhciBNQVhfU0FGRV9JTlRFR0VSID0gTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVIgfHwgOTAwNzE5OTI1NDc0MDk5MTtcblxuLy8gTWF4IHNhZmUgc2VnbWVudCBsZW5ndGggZm9yIGNvZXJjaW9uLlxudmFyIE1BWF9TQUZFX0NPTVBPTkVOVF9MRU5HVEggPSAxNjtcblxuLy8gVGhlIGFjdHVhbCByZWdleHBzIGdvIG9uIGV4cG9ydHMucmVcbnZhciByZSA9IGV4cG9ydHMucmUgPSBbXTtcbnZhciBzcmMgPSBleHBvcnRzLnNyYyA9IFtdO1xudmFyIFIgPSAwO1xuXG4vLyBUaGUgZm9sbG93aW5nIFJlZ3VsYXIgRXhwcmVzc2lvbnMgY2FuIGJlIHVzZWQgZm9yIHRva2VuaXppbmcsXG4vLyB2YWxpZGF0aW5nLCBhbmQgcGFyc2luZyBTZW1WZXIgdmVyc2lvbiBzdHJpbmdzLlxuXG4vLyAjIyBOdW1lcmljIElkZW50aWZpZXJcbi8vIEEgc2luZ2xlIGAwYCwgb3IgYSBub24temVybyBkaWdpdCBmb2xsb3dlZCBieSB6ZXJvIG9yIG1vcmUgZGlnaXRzLlxuXG52YXIgTlVNRVJJQ0lERU5USUZJRVIgPSBSKys7XG5zcmNbTlVNRVJJQ0lERU5USUZJRVJdID0gJzB8WzEtOV1cXFxcZConO1xudmFyIE5VTUVSSUNJREVOVElGSUVSTE9PU0UgPSBSKys7XG5zcmNbTlVNRVJJQ0lERU5USUZJRVJMT09TRV0gPSAnWzAtOV0rJztcblxuXG4vLyAjIyBOb24tbnVtZXJpYyBJZGVudGlmaWVyXG4vLyBaZXJvIG9yIG1vcmUgZGlnaXRzLCBmb2xsb3dlZCBieSBhIGxldHRlciBvciBoeXBoZW4sIGFuZCB0aGVuIHplcm8gb3Jcbi8vIG1vcmUgbGV0dGVycywgZGlnaXRzLCBvciBoeXBoZW5zLlxuXG52YXIgTk9OTlVNRVJJQ0lERU5USUZJRVIgPSBSKys7XG5zcmNbTk9OTlVNRVJJQ0lERU5USUZJRVJdID0gJ1xcXFxkKlthLXpBLVotXVthLXpBLVowLTktXSonO1xuXG5cbi8vICMjIE1haW4gVmVyc2lvblxuLy8gVGhyZWUgZG90LXNlcGFyYXRlZCBudW1lcmljIGlkZW50aWZpZXJzLlxuXG52YXIgTUFJTlZFUlNJT04gPSBSKys7XG5zcmNbTUFJTlZFUlNJT05dID0gJygnICsgc3JjW05VTUVSSUNJREVOVElGSUVSXSArICcpXFxcXC4nICtcbiAgICAgICAgICAgICAgICAgICAnKCcgKyBzcmNbTlVNRVJJQ0lERU5USUZJRVJdICsgJylcXFxcLicgK1xuICAgICAgICAgICAgICAgICAgICcoJyArIHNyY1tOVU1FUklDSURFTlRJRklFUl0gKyAnKSc7XG5cbnZhciBNQUlOVkVSU0lPTkxPT1NFID0gUisrO1xuc3JjW01BSU5WRVJTSU9OTE9PU0VdID0gJygnICsgc3JjW05VTUVSSUNJREVOVElGSUVSTE9PU0VdICsgJylcXFxcLicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJygnICsgc3JjW05VTUVSSUNJREVOVElGSUVSTE9PU0VdICsgJylcXFxcLicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJygnICsgc3JjW05VTUVSSUNJREVOVElGSUVSTE9PU0VdICsgJyknO1xuXG4vLyAjIyBQcmUtcmVsZWFzZSBWZXJzaW9uIElkZW50aWZpZXJcbi8vIEEgbnVtZXJpYyBpZGVudGlmaWVyLCBvciBhIG5vbi1udW1lcmljIGlkZW50aWZpZXIuXG5cbnZhciBQUkVSRUxFQVNFSURFTlRJRklFUiA9IFIrKztcbnNyY1tQUkVSRUxFQVNFSURFTlRJRklFUl0gPSAnKD86JyArIHNyY1tOVU1FUklDSURFTlRJRklFUl0gK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICd8JyArIHNyY1tOT05OVU1FUklDSURFTlRJRklFUl0gKyAnKSc7XG5cbnZhciBQUkVSRUxFQVNFSURFTlRJRklFUkxPT1NFID0gUisrO1xuc3JjW1BSRVJFTEVBU0VJREVOVElGSUVSTE9PU0VdID0gJyg/OicgKyBzcmNbTlVNRVJJQ0lERU5USUZJRVJMT09TRV0gK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3wnICsgc3JjW05PTk5VTUVSSUNJREVOVElGSUVSXSArICcpJztcblxuXG4vLyAjIyBQcmUtcmVsZWFzZSBWZXJzaW9uXG4vLyBIeXBoZW4sIGZvbGxvd2VkIGJ5IG9uZSBvciBtb3JlIGRvdC1zZXBhcmF0ZWQgcHJlLXJlbGVhc2UgdmVyc2lvblxuLy8gaWRlbnRpZmllcnMuXG5cbnZhciBQUkVSRUxFQVNFID0gUisrO1xuc3JjW1BSRVJFTEVBU0VdID0gJyg/Oi0oJyArIHNyY1tQUkVSRUxFQVNFSURFTlRJRklFUl0gK1xuICAgICAgICAgICAgICAgICAgJyg/OlxcXFwuJyArIHNyY1tQUkVSRUxFQVNFSURFTlRJRklFUl0gKyAnKSopKSc7XG5cbnZhciBQUkVSRUxFQVNFTE9PU0UgPSBSKys7XG5zcmNbUFJFUkVMRUFTRUxPT1NFXSA9ICcoPzotPygnICsgc3JjW1BSRVJFTEVBU0VJREVOVElGSUVSTE9PU0VdICtcbiAgICAgICAgICAgICAgICAgICAgICAgJyg/OlxcXFwuJyArIHNyY1tQUkVSRUxFQVNFSURFTlRJRklFUkxPT1NFXSArICcpKikpJztcblxuLy8gIyMgQnVpbGQgTWV0YWRhdGEgSWRlbnRpZmllclxuLy8gQW55IGNvbWJpbmF0aW9uIG9mIGRpZ2l0cywgbGV0dGVycywgb3IgaHlwaGVucy5cblxudmFyIEJVSUxESURFTlRJRklFUiA9IFIrKztcbnNyY1tCVUlMRElERU5USUZJRVJdID0gJ1swLTlBLVphLXotXSsnO1xuXG4vLyAjIyBCdWlsZCBNZXRhZGF0YVxuLy8gUGx1cyBzaWduLCBmb2xsb3dlZCBieSBvbmUgb3IgbW9yZSBwZXJpb2Qtc2VwYXJhdGVkIGJ1aWxkIG1ldGFkYXRhXG4vLyBpZGVudGlmaWVycy5cblxudmFyIEJVSUxEID0gUisrO1xuc3JjW0JVSUxEXSA9ICcoPzpcXFxcKygnICsgc3JjW0JVSUxESURFTlRJRklFUl0gK1xuICAgICAgICAgICAgICcoPzpcXFxcLicgKyBzcmNbQlVJTERJREVOVElGSUVSXSArICcpKikpJztcblxuXG4vLyAjIyBGdWxsIFZlcnNpb24gU3RyaW5nXG4vLyBBIG1haW4gdmVyc2lvbiwgZm9sbG93ZWQgb3B0aW9uYWxseSBieSBhIHByZS1yZWxlYXNlIHZlcnNpb24gYW5kXG4vLyBidWlsZCBtZXRhZGF0YS5cblxuLy8gTm90ZSB0aGF0IHRoZSBvbmx5IG1ham9yLCBtaW5vciwgcGF0Y2gsIGFuZCBwcmUtcmVsZWFzZSBzZWN0aW9ucyBvZlxuLy8gdGhlIHZlcnNpb24gc3RyaW5nIGFyZSBjYXB0dXJpbmcgZ3JvdXBzLiAgVGhlIGJ1aWxkIG1ldGFkYXRhIGlzIG5vdCBhXG4vLyBjYXB0dXJpbmcgZ3JvdXAsIGJlY2F1c2UgaXQgc2hvdWxkIG5vdCBldmVyIGJlIHVzZWQgaW4gdmVyc2lvblxuLy8gY29tcGFyaXNvbi5cblxudmFyIEZVTEwgPSBSKys7XG52YXIgRlVMTFBMQUlOID0gJ3Y/JyArIHNyY1tNQUlOVkVSU0lPTl0gK1xuICAgICAgICAgICAgICAgIHNyY1tQUkVSRUxFQVNFXSArICc/JyArXG4gICAgICAgICAgICAgICAgc3JjW0JVSUxEXSArICc/Jztcblxuc3JjW0ZVTExdID0gJ14nICsgRlVMTFBMQUlOICsgJyQnO1xuXG4vLyBsaWtlIGZ1bGwsIGJ1dCBhbGxvd3MgdjEuMi4zIGFuZCA9MS4yLjMsIHdoaWNoIHBlb3BsZSBkbyBzb21ldGltZXMuXG4vLyBhbHNvLCAxLjAuMGFscGhhMSAocHJlcmVsZWFzZSB3aXRob3V0IHRoZSBoeXBoZW4pIHdoaWNoIGlzIHByZXR0eVxuLy8gY29tbW9uIGluIHRoZSBucG0gcmVnaXN0cnkuXG52YXIgTE9PU0VQTEFJTiA9ICdbdj1cXFxcc10qJyArIHNyY1tNQUlOVkVSU0lPTkxPT1NFXSArXG4gICAgICAgICAgICAgICAgIHNyY1tQUkVSRUxFQVNFTE9PU0VdICsgJz8nICtcbiAgICAgICAgICAgICAgICAgc3JjW0JVSUxEXSArICc/JztcblxudmFyIExPT1NFID0gUisrO1xuc3JjW0xPT1NFXSA9ICdeJyArIExPT1NFUExBSU4gKyAnJCc7XG5cbnZhciBHVExUID0gUisrO1xuc3JjW0dUTFRdID0gJygoPzo8fD4pPz0/KSc7XG5cbi8vIFNvbWV0aGluZyBsaWtlIFwiMi4qXCIgb3IgXCIxLjIueFwiLlxuLy8gTm90ZSB0aGF0IFwieC54XCIgaXMgYSB2YWxpZCB4UmFuZ2UgaWRlbnRpZmVyLCBtZWFuaW5nIFwiYW55IHZlcnNpb25cIlxuLy8gT25seSB0aGUgZmlyc3QgaXRlbSBpcyBzdHJpY3RseSByZXF1aXJlZC5cbnZhciBYUkFOR0VJREVOVElGSUVSTE9PU0UgPSBSKys7XG5zcmNbWFJBTkdFSURFTlRJRklFUkxPT1NFXSA9IHNyY1tOVU1FUklDSURFTlRJRklFUkxPT1NFXSArICd8eHxYfFxcXFwqJztcbnZhciBYUkFOR0VJREVOVElGSUVSID0gUisrO1xuc3JjW1hSQU5HRUlERU5USUZJRVJdID0gc3JjW05VTUVSSUNJREVOVElGSUVSXSArICd8eHxYfFxcXFwqJztcblxudmFyIFhSQU5HRVBMQUlOID0gUisrO1xuc3JjW1hSQU5HRVBMQUlOXSA9ICdbdj1cXFxcc10qKCcgKyBzcmNbWFJBTkdFSURFTlRJRklFUl0gKyAnKScgK1xuICAgICAgICAgICAgICAgICAgICcoPzpcXFxcLignICsgc3JjW1hSQU5HRUlERU5USUZJRVJdICsgJyknICtcbiAgICAgICAgICAgICAgICAgICAnKD86XFxcXC4oJyArIHNyY1tYUkFOR0VJREVOVElGSUVSXSArICcpJyArXG4gICAgICAgICAgICAgICAgICAgJyg/OicgKyBzcmNbUFJFUkVMRUFTRV0gKyAnKT8nICtcbiAgICAgICAgICAgICAgICAgICBzcmNbQlVJTERdICsgJz8nICtcbiAgICAgICAgICAgICAgICAgICAnKT8pPyc7XG5cbnZhciBYUkFOR0VQTEFJTkxPT1NFID0gUisrO1xuc3JjW1hSQU5HRVBMQUlOTE9PU0VdID0gJ1t2PVxcXFxzXSooJyArIHNyY1tYUkFOR0VJREVOVElGSUVSTE9PU0VdICsgJyknICtcbiAgICAgICAgICAgICAgICAgICAgICAgICcoPzpcXFxcLignICsgc3JjW1hSQU5HRUlERU5USUZJRVJMT09TRV0gKyAnKScgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJyg/OlxcXFwuKCcgKyBzcmNbWFJBTkdFSURFTlRJRklFUkxPT1NFXSArICcpJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnKD86JyArIHNyY1tQUkVSRUxFQVNFTE9PU0VdICsgJyk/JyArXG4gICAgICAgICAgICAgICAgICAgICAgICBzcmNbQlVJTERdICsgJz8nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICcpPyk/JztcblxudmFyIFhSQU5HRSA9IFIrKztcbnNyY1tYUkFOR0VdID0gJ14nICsgc3JjW0dUTFRdICsgJ1xcXFxzKicgKyBzcmNbWFJBTkdFUExBSU5dICsgJyQnO1xudmFyIFhSQU5HRUxPT1NFID0gUisrO1xuc3JjW1hSQU5HRUxPT1NFXSA9ICdeJyArIHNyY1tHVExUXSArICdcXFxccyonICsgc3JjW1hSQU5HRVBMQUlOTE9PU0VdICsgJyQnO1xuXG4vLyBDb2VyY2lvbi5cbi8vIEV4dHJhY3QgYW55dGhpbmcgdGhhdCBjb3VsZCBjb25jZWl2YWJseSBiZSBhIHBhcnQgb2YgYSB2YWxpZCBzZW12ZXJcbnZhciBDT0VSQ0UgPSBSKys7XG5zcmNbQ09FUkNFXSA9ICcoPzpefFteXFxcXGRdKScgK1xuICAgICAgICAgICAgICAnKFxcXFxkezEsJyArIE1BWF9TQUZFX0NPTVBPTkVOVF9MRU5HVEggKyAnfSknICtcbiAgICAgICAgICAgICAgJyg/OlxcXFwuKFxcXFxkezEsJyArIE1BWF9TQUZFX0NPTVBPTkVOVF9MRU5HVEggKyAnfSkpPycgK1xuICAgICAgICAgICAgICAnKD86XFxcXC4oXFxcXGR7MSwnICsgTUFYX1NBRkVfQ09NUE9ORU5UX0xFTkdUSCArICd9KSk/JyArXG4gICAgICAgICAgICAgICcoPzokfFteXFxcXGRdKSc7XG5cbi8vIFRpbGRlIHJhbmdlcy5cbi8vIE1lYW5pbmcgaXMgXCJyZWFzb25hYmx5IGF0IG9yIGdyZWF0ZXIgdGhhblwiXG52YXIgTE9ORVRJTERFID0gUisrO1xuc3JjW0xPTkVUSUxERV0gPSAnKD86fj4/KSc7XG5cbnZhciBUSUxERVRSSU0gPSBSKys7XG5zcmNbVElMREVUUklNXSA9ICcoXFxcXHMqKScgKyBzcmNbTE9ORVRJTERFXSArICdcXFxccysnO1xucmVbVElMREVUUklNXSA9IG5ldyBSZWdFeHAoc3JjW1RJTERFVFJJTV0sICdnJyk7XG52YXIgdGlsZGVUcmltUmVwbGFjZSA9ICckMX4nO1xuXG52YXIgVElMREUgPSBSKys7XG5zcmNbVElMREVdID0gJ14nICsgc3JjW0xPTkVUSUxERV0gKyBzcmNbWFJBTkdFUExBSU5dICsgJyQnO1xudmFyIFRJTERFTE9PU0UgPSBSKys7XG5zcmNbVElMREVMT09TRV0gPSAnXicgKyBzcmNbTE9ORVRJTERFXSArIHNyY1tYUkFOR0VQTEFJTkxPT1NFXSArICckJztcblxuLy8gQ2FyZXQgcmFuZ2VzLlxuLy8gTWVhbmluZyBpcyBcImF0IGxlYXN0IGFuZCBiYWNrd2FyZHMgY29tcGF0aWJsZSB3aXRoXCJcbnZhciBMT05FQ0FSRVQgPSBSKys7XG5zcmNbTE9ORUNBUkVUXSA9ICcoPzpcXFxcXiknO1xuXG52YXIgQ0FSRVRUUklNID0gUisrO1xuc3JjW0NBUkVUVFJJTV0gPSAnKFxcXFxzKiknICsgc3JjW0xPTkVDQVJFVF0gKyAnXFxcXHMrJztcbnJlW0NBUkVUVFJJTV0gPSBuZXcgUmVnRXhwKHNyY1tDQVJFVFRSSU1dLCAnZycpO1xudmFyIGNhcmV0VHJpbVJlcGxhY2UgPSAnJDFeJztcblxudmFyIENBUkVUID0gUisrO1xuc3JjW0NBUkVUXSA9ICdeJyArIHNyY1tMT05FQ0FSRVRdICsgc3JjW1hSQU5HRVBMQUlOXSArICckJztcbnZhciBDQVJFVExPT1NFID0gUisrO1xuc3JjW0NBUkVUTE9PU0VdID0gJ14nICsgc3JjW0xPTkVDQVJFVF0gKyBzcmNbWFJBTkdFUExBSU5MT09TRV0gKyAnJCc7XG5cbi8vIEEgc2ltcGxlIGd0L2x0L2VxIHRoaW5nLCBvciBqdXN0IFwiXCIgdG8gaW5kaWNhdGUgXCJhbnkgdmVyc2lvblwiXG52YXIgQ09NUEFSQVRPUkxPT1NFID0gUisrO1xuc3JjW0NPTVBBUkFUT1JMT09TRV0gPSAnXicgKyBzcmNbR1RMVF0gKyAnXFxcXHMqKCcgKyBMT09TRVBMQUlOICsgJykkfF4kJztcbnZhciBDT01QQVJBVE9SID0gUisrO1xuc3JjW0NPTVBBUkFUT1JdID0gJ14nICsgc3JjW0dUTFRdICsgJ1xcXFxzKignICsgRlVMTFBMQUlOICsgJykkfF4kJztcblxuXG4vLyBBbiBleHByZXNzaW9uIHRvIHN0cmlwIGFueSB3aGl0ZXNwYWNlIGJldHdlZW4gdGhlIGd0bHQgYW5kIHRoZSB0aGluZ1xuLy8gaXQgbW9kaWZpZXMsIHNvIHRoYXQgYD4gMS4yLjNgID09PiBgPjEuMi4zYFxudmFyIENPTVBBUkFUT1JUUklNID0gUisrO1xuc3JjW0NPTVBBUkFUT1JUUklNXSA9ICcoXFxcXHMqKScgKyBzcmNbR1RMVF0gK1xuICAgICAgICAgICAgICAgICAgICAgICdcXFxccyooJyArIExPT1NFUExBSU4gKyAnfCcgKyBzcmNbWFJBTkdFUExBSU5dICsgJyknO1xuXG4vLyB0aGlzIG9uZSBoYXMgdG8gdXNlIHRoZSAvZyBmbGFnXG5yZVtDT01QQVJBVE9SVFJJTV0gPSBuZXcgUmVnRXhwKHNyY1tDT01QQVJBVE9SVFJJTV0sICdnJyk7XG52YXIgY29tcGFyYXRvclRyaW1SZXBsYWNlID0gJyQxJDIkMyc7XG5cblxuLy8gU29tZXRoaW5nIGxpa2UgYDEuMi4zIC0gMS4yLjRgXG4vLyBOb3RlIHRoYXQgdGhlc2UgYWxsIHVzZSB0aGUgbG9vc2UgZm9ybSwgYmVjYXVzZSB0aGV5J2xsIGJlXG4vLyBjaGVja2VkIGFnYWluc3QgZWl0aGVyIHRoZSBzdHJpY3Qgb3IgbG9vc2UgY29tcGFyYXRvciBmb3JtXG4vLyBsYXRlci5cbnZhciBIWVBIRU5SQU5HRSA9IFIrKztcbnNyY1tIWVBIRU5SQU5HRV0gPSAnXlxcXFxzKignICsgc3JjW1hSQU5HRVBMQUlOXSArICcpJyArXG4gICAgICAgICAgICAgICAgICAgJ1xcXFxzKy1cXFxccysnICtcbiAgICAgICAgICAgICAgICAgICAnKCcgKyBzcmNbWFJBTkdFUExBSU5dICsgJyknICtcbiAgICAgICAgICAgICAgICAgICAnXFxcXHMqJCc7XG5cbnZhciBIWVBIRU5SQU5HRUxPT1NFID0gUisrO1xuc3JjW0hZUEhFTlJBTkdFTE9PU0VdID0gJ15cXFxccyooJyArIHNyY1tYUkFOR0VQTEFJTkxPT1NFXSArICcpJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnXFxcXHMrLVxcXFxzKycgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJygnICsgc3JjW1hSQU5HRVBMQUlOTE9PU0VdICsgJyknICtcbiAgICAgICAgICAgICAgICAgICAgICAgICdcXFxccyokJztcblxuLy8gU3RhciByYW5nZXMgYmFzaWNhbGx5IGp1c3QgYWxsb3cgYW55dGhpbmcgYXQgYWxsLlxudmFyIFNUQVIgPSBSKys7XG5zcmNbU1RBUl0gPSAnKDx8Pik/PT9cXFxccypcXFxcKic7XG5cbi8vIENvbXBpbGUgdG8gYWN0dWFsIHJlZ2V4cCBvYmplY3RzLlxuLy8gQWxsIGFyZSBmbGFnLWZyZWUsIHVubGVzcyB0aGV5IHdlcmUgY3JlYXRlZCBhYm92ZSB3aXRoIGEgZmxhZy5cbmZvciAodmFyIGkgPSAwOyBpIDwgUjsgaSsrKSB7XG4gIGRlYnVnKGksIHNyY1tpXSk7XG4gIGlmICghcmVbaV0pXG4gICAgcmVbaV0gPSBuZXcgUmVnRXhwKHNyY1tpXSk7XG59XG5cbmV4cG9ydHMucGFyc2UgPSBwYXJzZTtcbmZ1bmN0aW9uIHBhcnNlKHZlcnNpb24sIG9wdGlvbnMpIHtcbiAgaWYgKCFvcHRpb25zIHx8IHR5cGVvZiBvcHRpb25zICE9PSAnb2JqZWN0JylcbiAgICBvcHRpb25zID0geyBsb29zZTogISFvcHRpb25zLCBpbmNsdWRlUHJlcmVsZWFzZTogZmFsc2UgfVxuXG4gIGlmICh2ZXJzaW9uIGluc3RhbmNlb2YgU2VtVmVyKVxuICAgIHJldHVybiB2ZXJzaW9uO1xuXG4gIGlmICh0eXBlb2YgdmVyc2lvbiAhPT0gJ3N0cmluZycpXG4gICAgcmV0dXJuIG51bGw7XG5cbiAgaWYgKHZlcnNpb24ubGVuZ3RoID4gTUFYX0xFTkdUSClcbiAgICByZXR1cm4gbnVsbDtcblxuICB2YXIgciA9IG9wdGlvbnMubG9vc2UgPyByZVtMT09TRV0gOiByZVtGVUxMXTtcbiAgaWYgKCFyLnRlc3QodmVyc2lvbikpXG4gICAgcmV0dXJuIG51bGw7XG5cbiAgdHJ5IHtcbiAgICByZXR1cm4gbmV3IFNlbVZlcih2ZXJzaW9uLCBvcHRpb25zKTtcbiAgfSBjYXRjaCAoZXIpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG5leHBvcnRzLnZhbGlkID0gdmFsaWQ7XG5mdW5jdGlvbiB2YWxpZCh2ZXJzaW9uLCBvcHRpb25zKSB7XG4gIHZhciB2ID0gcGFyc2UodmVyc2lvbiwgb3B0aW9ucyk7XG4gIHJldHVybiB2ID8gdi52ZXJzaW9uIDogbnVsbDtcbn1cblxuXG5leHBvcnRzLmNsZWFuID0gY2xlYW47XG5mdW5jdGlvbiBjbGVhbih2ZXJzaW9uLCBvcHRpb25zKSB7XG4gIHZhciBzID0gcGFyc2UodmVyc2lvbi50cmltKCkucmVwbGFjZSgvXls9dl0rLywgJycpLCBvcHRpb25zKTtcbiAgcmV0dXJuIHMgPyBzLnZlcnNpb24gOiBudWxsO1xufVxuXG5leHBvcnRzLlNlbVZlciA9IFNlbVZlcjtcblxuZnVuY3Rpb24gU2VtVmVyKHZlcnNpb24sIG9wdGlvbnMpIHtcbiAgaWYgKCFvcHRpb25zIHx8IHR5cGVvZiBvcHRpb25zICE9PSAnb2JqZWN0JylcbiAgICBvcHRpb25zID0geyBsb29zZTogISFvcHRpb25zLCBpbmNsdWRlUHJlcmVsZWFzZTogZmFsc2UgfVxuICBpZiAodmVyc2lvbiBpbnN0YW5jZW9mIFNlbVZlcikge1xuICAgIGlmICh2ZXJzaW9uLmxvb3NlID09PSBvcHRpb25zLmxvb3NlKVxuICAgICAgcmV0dXJuIHZlcnNpb247XG4gICAgZWxzZVxuICAgICAgdmVyc2lvbiA9IHZlcnNpb24udmVyc2lvbjtcbiAgfSBlbHNlIGlmICh0eXBlb2YgdmVyc2lvbiAhPT0gJ3N0cmluZycpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIFZlcnNpb246ICcgKyB2ZXJzaW9uKTtcbiAgfVxuXG4gIGlmICh2ZXJzaW9uLmxlbmd0aCA+IE1BWF9MRU5HVEgpXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcigndmVyc2lvbiBpcyBsb25nZXIgdGhhbiAnICsgTUFYX0xFTkdUSCArICcgY2hhcmFjdGVycycpXG5cbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIFNlbVZlcikpXG4gICAgcmV0dXJuIG5ldyBTZW1WZXIodmVyc2lvbiwgb3B0aW9ucyk7XG5cbiAgZGVidWcoJ1NlbVZlcicsIHZlcnNpb24sIG9wdGlvbnMpO1xuICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICB0aGlzLmxvb3NlID0gISFvcHRpb25zLmxvb3NlO1xuXG4gIHZhciBtID0gdmVyc2lvbi50cmltKCkubWF0Y2gob3B0aW9ucy5sb29zZSA/IHJlW0xPT1NFXSA6IHJlW0ZVTExdKTtcblxuICBpZiAoIW0pXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBWZXJzaW9uOiAnICsgdmVyc2lvbik7XG5cbiAgdGhpcy5yYXcgPSB2ZXJzaW9uO1xuXG4gIC8vIHRoZXNlIGFyZSBhY3R1YWxseSBudW1iZXJzXG4gIHRoaXMubWFqb3IgPSArbVsxXTtcbiAgdGhpcy5taW5vciA9ICttWzJdO1xuICB0aGlzLnBhdGNoID0gK21bM107XG5cbiAgaWYgKHRoaXMubWFqb3IgPiBNQVhfU0FGRV9JTlRFR0VSIHx8IHRoaXMubWFqb3IgPCAwKVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgbWFqb3IgdmVyc2lvbicpXG5cbiAgaWYgKHRoaXMubWlub3IgPiBNQVhfU0FGRV9JTlRFR0VSIHx8IHRoaXMubWlub3IgPCAwKVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgbWlub3IgdmVyc2lvbicpXG5cbiAgaWYgKHRoaXMucGF0Y2ggPiBNQVhfU0FGRV9JTlRFR0VSIHx8IHRoaXMucGF0Y2ggPCAwKVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgcGF0Y2ggdmVyc2lvbicpXG5cbiAgLy8gbnVtYmVyaWZ5IGFueSBwcmVyZWxlYXNlIG51bWVyaWMgaWRzXG4gIGlmICghbVs0XSlcbiAgICB0aGlzLnByZXJlbGVhc2UgPSBbXTtcbiAgZWxzZVxuICAgIHRoaXMucHJlcmVsZWFzZSA9IG1bNF0uc3BsaXQoJy4nKS5tYXAoZnVuY3Rpb24oaWQpIHtcbiAgICAgIGlmICgvXlswLTldKyQvLnRlc3QoaWQpKSB7XG4gICAgICAgIHZhciBudW0gPSAraWQ7XG4gICAgICAgIGlmIChudW0gPj0gMCAmJiBudW0gPCBNQVhfU0FGRV9JTlRFR0VSKVxuICAgICAgICAgIHJldHVybiBudW07XG4gICAgICB9XG4gICAgICByZXR1cm4gaWQ7XG4gICAgfSk7XG5cbiAgdGhpcy5idWlsZCA9IG1bNV0gPyBtWzVdLnNwbGl0KCcuJykgOiBbXTtcbiAgdGhpcy5mb3JtYXQoKTtcbn1cblxuU2VtVmVyLnByb3RvdHlwZS5mb3JtYXQgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy52ZXJzaW9uID0gdGhpcy5tYWpvciArICcuJyArIHRoaXMubWlub3IgKyAnLicgKyB0aGlzLnBhdGNoO1xuICBpZiAodGhpcy5wcmVyZWxlYXNlLmxlbmd0aClcbiAgICB0aGlzLnZlcnNpb24gKz0gJy0nICsgdGhpcy5wcmVyZWxlYXNlLmpvaW4oJy4nKTtcbiAgcmV0dXJuIHRoaXMudmVyc2lvbjtcbn07XG5cblNlbVZlci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMudmVyc2lvbjtcbn07XG5cblNlbVZlci5wcm90b3R5cGUuY29tcGFyZSA9IGZ1bmN0aW9uKG90aGVyKSB7XG4gIGRlYnVnKCdTZW1WZXIuY29tcGFyZScsIHRoaXMudmVyc2lvbiwgdGhpcy5vcHRpb25zLCBvdGhlcik7XG4gIGlmICghKG90aGVyIGluc3RhbmNlb2YgU2VtVmVyKSlcbiAgICBvdGhlciA9IG5ldyBTZW1WZXIob3RoZXIsIHRoaXMub3B0aW9ucyk7XG5cbiAgcmV0dXJuIHRoaXMuY29tcGFyZU1haW4ob3RoZXIpIHx8IHRoaXMuY29tcGFyZVByZShvdGhlcik7XG59O1xuXG5TZW1WZXIucHJvdG90eXBlLmNvbXBhcmVNYWluID0gZnVuY3Rpb24ob3RoZXIpIHtcbiAgaWYgKCEob3RoZXIgaW5zdGFuY2VvZiBTZW1WZXIpKVxuICAgIG90aGVyID0gbmV3IFNlbVZlcihvdGhlciwgdGhpcy5vcHRpb25zKTtcblxuICByZXR1cm4gY29tcGFyZUlkZW50aWZpZXJzKHRoaXMubWFqb3IsIG90aGVyLm1ham9yKSB8fFxuICAgICAgICAgY29tcGFyZUlkZW50aWZpZXJzKHRoaXMubWlub3IsIG90aGVyLm1pbm9yKSB8fFxuICAgICAgICAgY29tcGFyZUlkZW50aWZpZXJzKHRoaXMucGF0Y2gsIG90aGVyLnBhdGNoKTtcbn07XG5cblNlbVZlci5wcm90b3R5cGUuY29tcGFyZVByZSA9IGZ1bmN0aW9uKG90aGVyKSB7XG4gIGlmICghKG90aGVyIGluc3RhbmNlb2YgU2VtVmVyKSlcbiAgICBvdGhlciA9IG5ldyBTZW1WZXIob3RoZXIsIHRoaXMub3B0aW9ucyk7XG5cbiAgLy8gTk9UIGhhdmluZyBhIHByZXJlbGVhc2UgaXMgPiBoYXZpbmcgb25lXG4gIGlmICh0aGlzLnByZXJlbGVhc2UubGVuZ3RoICYmICFvdGhlci5wcmVyZWxlYXNlLmxlbmd0aClcbiAgICByZXR1cm4gLTE7XG4gIGVsc2UgaWYgKCF0aGlzLnByZXJlbGVhc2UubGVuZ3RoICYmIG90aGVyLnByZXJlbGVhc2UubGVuZ3RoKVxuICAgIHJldHVybiAxO1xuICBlbHNlIGlmICghdGhpcy5wcmVyZWxlYXNlLmxlbmd0aCAmJiAhb3RoZXIucHJlcmVsZWFzZS5sZW5ndGgpXG4gICAgcmV0dXJuIDA7XG5cbiAgdmFyIGkgPSAwO1xuICBkbyB7XG4gICAgdmFyIGEgPSB0aGlzLnByZXJlbGVhc2VbaV07XG4gICAgdmFyIGIgPSBvdGhlci5wcmVyZWxlYXNlW2ldO1xuICAgIGRlYnVnKCdwcmVyZWxlYXNlIGNvbXBhcmUnLCBpLCBhLCBiKTtcbiAgICBpZiAoYSA9PT0gdW5kZWZpbmVkICYmIGIgPT09IHVuZGVmaW5lZClcbiAgICAgIHJldHVybiAwO1xuICAgIGVsc2UgaWYgKGIgPT09IHVuZGVmaW5lZClcbiAgICAgIHJldHVybiAxO1xuICAgIGVsc2UgaWYgKGEgPT09IHVuZGVmaW5lZClcbiAgICAgIHJldHVybiAtMTtcbiAgICBlbHNlIGlmIChhID09PSBiKVxuICAgICAgY29udGludWU7XG4gICAgZWxzZVxuICAgICAgcmV0dXJuIGNvbXBhcmVJZGVudGlmaWVycyhhLCBiKTtcbiAgfSB3aGlsZSAoKytpKTtcbn07XG5cbi8vIHByZW1pbm9yIHdpbGwgYnVtcCB0aGUgdmVyc2lvbiB1cCB0byB0aGUgbmV4dCBtaW5vciByZWxlYXNlLCBhbmQgaW1tZWRpYXRlbHlcbi8vIGRvd24gdG8gcHJlLXJlbGVhc2UuIHByZW1ham9yIGFuZCBwcmVwYXRjaCB3b3JrIHRoZSBzYW1lIHdheS5cblNlbVZlci5wcm90b3R5cGUuaW5jID0gZnVuY3Rpb24ocmVsZWFzZSwgaWRlbnRpZmllcikge1xuICBzd2l0Y2ggKHJlbGVhc2UpIHtcbiAgICBjYXNlICdwcmVtYWpvcic6XG4gICAgICB0aGlzLnByZXJlbGVhc2UubGVuZ3RoID0gMDtcbiAgICAgIHRoaXMucGF0Y2ggPSAwO1xuICAgICAgdGhpcy5taW5vciA9IDA7XG4gICAgICB0aGlzLm1ham9yKys7XG4gICAgICB0aGlzLmluYygncHJlJywgaWRlbnRpZmllcik7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdwcmVtaW5vcic6XG4gICAgICB0aGlzLnByZXJlbGVhc2UubGVuZ3RoID0gMDtcbiAgICAgIHRoaXMucGF0Y2ggPSAwO1xuICAgICAgdGhpcy5taW5vcisrO1xuICAgICAgdGhpcy5pbmMoJ3ByZScsIGlkZW50aWZpZXIpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncHJlcGF0Y2gnOlxuICAgICAgLy8gSWYgdGhpcyBpcyBhbHJlYWR5IGEgcHJlcmVsZWFzZSwgaXQgd2lsbCBidW1wIHRvIHRoZSBuZXh0IHZlcnNpb25cbiAgICAgIC8vIGRyb3AgYW55IHByZXJlbGVhc2VzIHRoYXQgbWlnaHQgYWxyZWFkeSBleGlzdCwgc2luY2UgdGhleSBhcmUgbm90XG4gICAgICAvLyByZWxldmFudCBhdCB0aGlzIHBvaW50LlxuICAgICAgdGhpcy5wcmVyZWxlYXNlLmxlbmd0aCA9IDA7XG4gICAgICB0aGlzLmluYygncGF0Y2gnLCBpZGVudGlmaWVyKTtcbiAgICAgIHRoaXMuaW5jKCdwcmUnLCBpZGVudGlmaWVyKTtcbiAgICAgIGJyZWFrO1xuICAgIC8vIElmIHRoZSBpbnB1dCBpcyBhIG5vbi1wcmVyZWxlYXNlIHZlcnNpb24sIHRoaXMgYWN0cyB0aGUgc2FtZSBhc1xuICAgIC8vIHByZXBhdGNoLlxuICAgIGNhc2UgJ3ByZXJlbGVhc2UnOlxuICAgICAgaWYgKHRoaXMucHJlcmVsZWFzZS5sZW5ndGggPT09IDApXG4gICAgICAgIHRoaXMuaW5jKCdwYXRjaCcsIGlkZW50aWZpZXIpO1xuICAgICAgdGhpcy5pbmMoJ3ByZScsIGlkZW50aWZpZXIpO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICdtYWpvcic6XG4gICAgICAvLyBJZiB0aGlzIGlzIGEgcHJlLW1ham9yIHZlcnNpb24sIGJ1bXAgdXAgdG8gdGhlIHNhbWUgbWFqb3IgdmVyc2lvbi5cbiAgICAgIC8vIE90aGVyd2lzZSBpbmNyZW1lbnQgbWFqb3IuXG4gICAgICAvLyAxLjAuMC01IGJ1bXBzIHRvIDEuMC4wXG4gICAgICAvLyAxLjEuMCBidW1wcyB0byAyLjAuMFxuICAgICAgaWYgKHRoaXMubWlub3IgIT09IDAgfHwgdGhpcy5wYXRjaCAhPT0gMCB8fCB0aGlzLnByZXJlbGVhc2UubGVuZ3RoID09PSAwKVxuICAgICAgICB0aGlzLm1ham9yKys7XG4gICAgICB0aGlzLm1pbm9yID0gMDtcbiAgICAgIHRoaXMucGF0Y2ggPSAwO1xuICAgICAgdGhpcy5wcmVyZWxlYXNlID0gW107XG4gICAgICBicmVhaztcbiAgICBjYXNlICdtaW5vcic6XG4gICAgICAvLyBJZiB0aGlzIGlzIGEgcHJlLW1pbm9yIHZlcnNpb24sIGJ1bXAgdXAgdG8gdGhlIHNhbWUgbWlub3IgdmVyc2lvbi5cbiAgICAgIC8vIE90aGVyd2lzZSBpbmNyZW1lbnQgbWlub3IuXG4gICAgICAvLyAxLjIuMC01IGJ1bXBzIHRvIDEuMi4wXG4gICAgICAvLyAxLjIuMSBidW1wcyB0byAxLjMuMFxuICAgICAgaWYgKHRoaXMucGF0Y2ggIT09IDAgfHwgdGhpcy5wcmVyZWxlYXNlLmxlbmd0aCA9PT0gMClcbiAgICAgICAgdGhpcy5taW5vcisrO1xuICAgICAgdGhpcy5wYXRjaCA9IDA7XG4gICAgICB0aGlzLnByZXJlbGVhc2UgPSBbXTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3BhdGNoJzpcbiAgICAgIC8vIElmIHRoaXMgaXMgbm90IGEgcHJlLXJlbGVhc2UgdmVyc2lvbiwgaXQgd2lsbCBpbmNyZW1lbnQgdGhlIHBhdGNoLlxuICAgICAgLy8gSWYgaXQgaXMgYSBwcmUtcmVsZWFzZSBpdCB3aWxsIGJ1bXAgdXAgdG8gdGhlIHNhbWUgcGF0Y2ggdmVyc2lvbi5cbiAgICAgIC8vIDEuMi4wLTUgcGF0Y2hlcyB0byAxLjIuMFxuICAgICAgLy8gMS4yLjAgcGF0Y2hlcyB0byAxLjIuMVxuICAgICAgaWYgKHRoaXMucHJlcmVsZWFzZS5sZW5ndGggPT09IDApXG4gICAgICAgIHRoaXMucGF0Y2grKztcbiAgICAgIHRoaXMucHJlcmVsZWFzZSA9IFtdO1xuICAgICAgYnJlYWs7XG4gICAgLy8gVGhpcyBwcm9iYWJseSBzaG91bGRuJ3QgYmUgdXNlZCBwdWJsaWNseS5cbiAgICAvLyAxLjAuMCBcInByZVwiIHdvdWxkIGJlY29tZSAxLjAuMC0wIHdoaWNoIGlzIHRoZSB3cm9uZyBkaXJlY3Rpb24uXG4gICAgY2FzZSAncHJlJzpcbiAgICAgIGlmICh0aGlzLnByZXJlbGVhc2UubGVuZ3RoID09PSAwKVxuICAgICAgICB0aGlzLnByZXJlbGVhc2UgPSBbMF07XG4gICAgICBlbHNlIHtcbiAgICAgICAgdmFyIGkgPSB0aGlzLnByZXJlbGVhc2UubGVuZ3RoO1xuICAgICAgICB3aGlsZSAoLS1pID49IDApIHtcbiAgICAgICAgICBpZiAodHlwZW9mIHRoaXMucHJlcmVsZWFzZVtpXSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIHRoaXMucHJlcmVsZWFzZVtpXSsrO1xuICAgICAgICAgICAgaSA9IC0yO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoaSA9PT0gLTEpIC8vIGRpZG4ndCBpbmNyZW1lbnQgYW55dGhpbmdcbiAgICAgICAgICB0aGlzLnByZXJlbGVhc2UucHVzaCgwKTtcbiAgICAgIH1cbiAgICAgIGlmIChpZGVudGlmaWVyKSB7XG4gICAgICAgIC8vIDEuMi4wLWJldGEuMSBidW1wcyB0byAxLjIuMC1iZXRhLjIsXG4gICAgICAgIC8vIDEuMi4wLWJldGEuZm9vYmx6IG9yIDEuMi4wLWJldGEgYnVtcHMgdG8gMS4yLjAtYmV0YS4wXG4gICAgICAgIGlmICh0aGlzLnByZXJlbGVhc2VbMF0gPT09IGlkZW50aWZpZXIpIHtcbiAgICAgICAgICBpZiAoaXNOYU4odGhpcy5wcmVyZWxlYXNlWzFdKSlcbiAgICAgICAgICAgIHRoaXMucHJlcmVsZWFzZSA9IFtpZGVudGlmaWVyLCAwXTtcbiAgICAgICAgfSBlbHNlXG4gICAgICAgICAgdGhpcy5wcmVyZWxlYXNlID0gW2lkZW50aWZpZXIsIDBdO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGluY3JlbWVudCBhcmd1bWVudDogJyArIHJlbGVhc2UpO1xuICB9XG4gIHRoaXMuZm9ybWF0KCk7XG4gIHRoaXMucmF3ID0gdGhpcy52ZXJzaW9uO1xuICByZXR1cm4gdGhpcztcbn07XG5cbmV4cG9ydHMuaW5jID0gaW5jO1xuZnVuY3Rpb24gaW5jKHZlcnNpb24sIHJlbGVhc2UsIGxvb3NlLCBpZGVudGlmaWVyKSB7XG4gIGlmICh0eXBlb2YobG9vc2UpID09PSAnc3RyaW5nJykge1xuICAgIGlkZW50aWZpZXIgPSBsb29zZTtcbiAgICBsb29zZSA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIHRyeSB7XG4gICAgcmV0dXJuIG5ldyBTZW1WZXIodmVyc2lvbiwgbG9vc2UpLmluYyhyZWxlYXNlLCBpZGVudGlmaWVyKS52ZXJzaW9uO1xuICB9IGNhdGNoIChlcikge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbmV4cG9ydHMuZGlmZiA9IGRpZmY7XG5mdW5jdGlvbiBkaWZmKHZlcnNpb24xLCB2ZXJzaW9uMikge1xuICBpZiAoZXEodmVyc2lvbjEsIHZlcnNpb24yKSkge1xuICAgIHJldHVybiBudWxsO1xuICB9IGVsc2Uge1xuICAgIHZhciB2MSA9IHBhcnNlKHZlcnNpb24xKTtcbiAgICB2YXIgdjIgPSBwYXJzZSh2ZXJzaW9uMik7XG4gICAgaWYgKHYxLnByZXJlbGVhc2UubGVuZ3RoIHx8IHYyLnByZXJlbGVhc2UubGVuZ3RoKSB7XG4gICAgICBmb3IgKHZhciBrZXkgaW4gdjEpIHtcbiAgICAgICAgaWYgKGtleSA9PT0gJ21ham9yJyB8fCBrZXkgPT09ICdtaW5vcicgfHwga2V5ID09PSAncGF0Y2gnKSB7XG4gICAgICAgICAgaWYgKHYxW2tleV0gIT09IHYyW2tleV0pIHtcbiAgICAgICAgICAgIHJldHVybiAncHJlJytrZXk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gJ3ByZXJlbGVhc2UnO1xuICAgIH1cbiAgICBmb3IgKHZhciBrZXkgaW4gdjEpIHtcbiAgICAgIGlmIChrZXkgPT09ICdtYWpvcicgfHwga2V5ID09PSAnbWlub3InIHx8IGtleSA9PT0gJ3BhdGNoJykge1xuICAgICAgICBpZiAodjFba2V5XSAhPT0gdjJba2V5XSkge1xuICAgICAgICAgIHJldHVybiBrZXk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0cy5jb21wYXJlSWRlbnRpZmllcnMgPSBjb21wYXJlSWRlbnRpZmllcnM7XG5cbnZhciBudW1lcmljID0gL15bMC05XSskLztcbmZ1bmN0aW9uIGNvbXBhcmVJZGVudGlmaWVycyhhLCBiKSB7XG4gIHZhciBhbnVtID0gbnVtZXJpYy50ZXN0KGEpO1xuICB2YXIgYm51bSA9IG51bWVyaWMudGVzdChiKTtcblxuICBpZiAoYW51bSAmJiBibnVtKSB7XG4gICAgYSA9ICthO1xuICAgIGIgPSArYjtcbiAgfVxuXG4gIHJldHVybiAoYW51bSAmJiAhYm51bSkgPyAtMSA6XG4gICAgICAgICAoYm51bSAmJiAhYW51bSkgPyAxIDpcbiAgICAgICAgIGEgPCBiID8gLTEgOlxuICAgICAgICAgYSA+IGIgPyAxIDpcbiAgICAgICAgIDA7XG59XG5cbmV4cG9ydHMucmNvbXBhcmVJZGVudGlmaWVycyA9IHJjb21wYXJlSWRlbnRpZmllcnM7XG5mdW5jdGlvbiByY29tcGFyZUlkZW50aWZpZXJzKGEsIGIpIHtcbiAgcmV0dXJuIGNvbXBhcmVJZGVudGlmaWVycyhiLCBhKTtcbn1cblxuZXhwb3J0cy5tYWpvciA9IG1ham9yO1xuZnVuY3Rpb24gbWFqb3IoYSwgbG9vc2UpIHtcbiAgcmV0dXJuIG5ldyBTZW1WZXIoYSwgbG9vc2UpLm1ham9yO1xufVxuXG5leHBvcnRzLm1pbm9yID0gbWlub3I7XG5mdW5jdGlvbiBtaW5vcihhLCBsb29zZSkge1xuICByZXR1cm4gbmV3IFNlbVZlcihhLCBsb29zZSkubWlub3I7XG59XG5cbmV4cG9ydHMucGF0Y2ggPSBwYXRjaDtcbmZ1bmN0aW9uIHBhdGNoKGEsIGxvb3NlKSB7XG4gIHJldHVybiBuZXcgU2VtVmVyKGEsIGxvb3NlKS5wYXRjaDtcbn1cblxuZXhwb3J0cy5jb21wYXJlID0gY29tcGFyZTtcbmZ1bmN0aW9uIGNvbXBhcmUoYSwgYiwgbG9vc2UpIHtcbiAgcmV0dXJuIG5ldyBTZW1WZXIoYSwgbG9vc2UpLmNvbXBhcmUobmV3IFNlbVZlcihiLCBsb29zZSkpO1xufVxuXG5leHBvcnRzLmNvbXBhcmVMb29zZSA9IGNvbXBhcmVMb29zZTtcbmZ1bmN0aW9uIGNvbXBhcmVMb29zZShhLCBiKSB7XG4gIHJldHVybiBjb21wYXJlKGEsIGIsIHRydWUpO1xufVxuXG5leHBvcnRzLnJjb21wYXJlID0gcmNvbXBhcmU7XG5mdW5jdGlvbiByY29tcGFyZShhLCBiLCBsb29zZSkge1xuICByZXR1cm4gY29tcGFyZShiLCBhLCBsb29zZSk7XG59XG5cbmV4cG9ydHMuc29ydCA9IHNvcnQ7XG5mdW5jdGlvbiBzb3J0KGxpc3QsIGxvb3NlKSB7XG4gIHJldHVybiBsaXN0LnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgIHJldHVybiBleHBvcnRzLmNvbXBhcmUoYSwgYiwgbG9vc2UpO1xuICB9KTtcbn1cblxuZXhwb3J0cy5yc29ydCA9IHJzb3J0O1xuZnVuY3Rpb24gcnNvcnQobGlzdCwgbG9vc2UpIHtcbiAgcmV0dXJuIGxpc3Quc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgcmV0dXJuIGV4cG9ydHMucmNvbXBhcmUoYSwgYiwgbG9vc2UpO1xuICB9KTtcbn1cblxuZXhwb3J0cy5ndCA9IGd0O1xuZnVuY3Rpb24gZ3QoYSwgYiwgbG9vc2UpIHtcbiAgcmV0dXJuIGNvbXBhcmUoYSwgYiwgbG9vc2UpID4gMDtcbn1cblxuZXhwb3J0cy5sdCA9IGx0O1xuZnVuY3Rpb24gbHQoYSwgYiwgbG9vc2UpIHtcbiAgcmV0dXJuIGNvbXBhcmUoYSwgYiwgbG9vc2UpIDwgMDtcbn1cblxuZXhwb3J0cy5lcSA9IGVxO1xuZnVuY3Rpb24gZXEoYSwgYiwgbG9vc2UpIHtcbiAgcmV0dXJuIGNvbXBhcmUoYSwgYiwgbG9vc2UpID09PSAwO1xufVxuXG5leHBvcnRzLm5lcSA9IG5lcTtcbmZ1bmN0aW9uIG5lcShhLCBiLCBsb29zZSkge1xuICByZXR1cm4gY29tcGFyZShhLCBiLCBsb29zZSkgIT09IDA7XG59XG5cbmV4cG9ydHMuZ3RlID0gZ3RlO1xuZnVuY3Rpb24gZ3RlKGEsIGIsIGxvb3NlKSB7XG4gIHJldHVybiBjb21wYXJlKGEsIGIsIGxvb3NlKSA+PSAwO1xufVxuXG5leHBvcnRzLmx0ZSA9IGx0ZTtcbmZ1bmN0aW9uIGx0ZShhLCBiLCBsb29zZSkge1xuICByZXR1cm4gY29tcGFyZShhLCBiLCBsb29zZSkgPD0gMDtcbn1cblxuZXhwb3J0cy5jbXAgPSBjbXA7XG5mdW5jdGlvbiBjbXAoYSwgb3AsIGIsIGxvb3NlKSB7XG4gIHZhciByZXQ7XG4gIHN3aXRjaCAob3ApIHtcbiAgICBjYXNlICc9PT0nOlxuICAgICAgaWYgKHR5cGVvZiBhID09PSAnb2JqZWN0JykgYSA9IGEudmVyc2lvbjtcbiAgICAgIGlmICh0eXBlb2YgYiA9PT0gJ29iamVjdCcpIGIgPSBiLnZlcnNpb247XG4gICAgICByZXQgPSBhID09PSBiO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnIT09JzpcbiAgICAgIGlmICh0eXBlb2YgYSA9PT0gJ29iamVjdCcpIGEgPSBhLnZlcnNpb247XG4gICAgICBpZiAodHlwZW9mIGIgPT09ICdvYmplY3QnKSBiID0gYi52ZXJzaW9uO1xuICAgICAgcmV0ID0gYSAhPT0gYjtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJyc6IGNhc2UgJz0nOiBjYXNlICc9PSc6IHJldCA9IGVxKGEsIGIsIGxvb3NlKTsgYnJlYWs7XG4gICAgY2FzZSAnIT0nOiByZXQgPSBuZXEoYSwgYiwgbG9vc2UpOyBicmVhaztcbiAgICBjYXNlICc+JzogcmV0ID0gZ3QoYSwgYiwgbG9vc2UpOyBicmVhaztcbiAgICBjYXNlICc+PSc6IHJldCA9IGd0ZShhLCBiLCBsb29zZSk7IGJyZWFrO1xuICAgIGNhc2UgJzwnOiByZXQgPSBsdChhLCBiLCBsb29zZSk7IGJyZWFrO1xuICAgIGNhc2UgJzw9JzogcmV0ID0gbHRlKGEsIGIsIGxvb3NlKTsgYnJlYWs7XG4gICAgZGVmYXVsdDogdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBvcGVyYXRvcjogJyArIG9wKTtcbiAgfVxuICByZXR1cm4gcmV0O1xufVxuXG5leHBvcnRzLkNvbXBhcmF0b3IgPSBDb21wYXJhdG9yO1xuZnVuY3Rpb24gQ29tcGFyYXRvcihjb21wLCBvcHRpb25zKSB7XG4gIGlmICghb3B0aW9ucyB8fCB0eXBlb2Ygb3B0aW9ucyAhPT0gJ29iamVjdCcpXG4gICAgb3B0aW9ucyA9IHsgbG9vc2U6ICEhb3B0aW9ucywgaW5jbHVkZVByZXJlbGVhc2U6IGZhbHNlIH1cblxuICBpZiAoY29tcCBpbnN0YW5jZW9mIENvbXBhcmF0b3IpIHtcbiAgICBpZiAoY29tcC5sb29zZSA9PT0gISFvcHRpb25zLmxvb3NlKVxuICAgICAgcmV0dXJuIGNvbXA7XG4gICAgZWxzZVxuICAgICAgY29tcCA9IGNvbXAudmFsdWU7XG4gIH1cblxuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgQ29tcGFyYXRvcikpXG4gICAgcmV0dXJuIG5ldyBDb21wYXJhdG9yKGNvbXAsIG9wdGlvbnMpO1xuXG4gIGRlYnVnKCdjb21wYXJhdG9yJywgY29tcCwgb3B0aW9ucyk7XG4gIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gIHRoaXMubG9vc2UgPSAhIW9wdGlvbnMubG9vc2U7XG4gIHRoaXMucGFyc2UoY29tcCk7XG5cbiAgaWYgKHRoaXMuc2VtdmVyID09PSBBTlkpXG4gICAgdGhpcy52YWx1ZSA9ICcnO1xuICBlbHNlXG4gICAgdGhpcy52YWx1ZSA9IHRoaXMub3BlcmF0b3IgKyB0aGlzLnNlbXZlci52ZXJzaW9uO1xuXG4gIGRlYnVnKCdjb21wJywgdGhpcyk7XG59XG5cbnZhciBBTlkgPSB7fTtcbkNvbXBhcmF0b3IucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24oY29tcCkge1xuICB2YXIgciA9IHRoaXMub3B0aW9ucy5sb29zZSA/IHJlW0NPTVBBUkFUT1JMT09TRV0gOiByZVtDT01QQVJBVE9SXTtcbiAgdmFyIG0gPSBjb21wLm1hdGNoKHIpO1xuXG4gIGlmICghbSlcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIGNvbXBhcmF0b3I6ICcgKyBjb21wKTtcblxuICB0aGlzLm9wZXJhdG9yID0gbVsxXTtcbiAgaWYgKHRoaXMub3BlcmF0b3IgPT09ICc9JylcbiAgICB0aGlzLm9wZXJhdG9yID0gJyc7XG5cbiAgLy8gaWYgaXQgbGl0ZXJhbGx5IGlzIGp1c3QgJz4nIG9yICcnIHRoZW4gYWxsb3cgYW55dGhpbmcuXG4gIGlmICghbVsyXSlcbiAgICB0aGlzLnNlbXZlciA9IEFOWTtcbiAgZWxzZVxuICAgIHRoaXMuc2VtdmVyID0gbmV3IFNlbVZlcihtWzJdLCB0aGlzLm9wdGlvbnMubG9vc2UpO1xufTtcblxuQ29tcGFyYXRvci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMudmFsdWU7XG59O1xuXG5Db21wYXJhdG9yLnByb3RvdHlwZS50ZXN0ID0gZnVuY3Rpb24odmVyc2lvbikge1xuICBkZWJ1ZygnQ29tcGFyYXRvci50ZXN0JywgdmVyc2lvbiwgdGhpcy5vcHRpb25zLmxvb3NlKTtcblxuICBpZiAodGhpcy5zZW12ZXIgPT09IEFOWSlcbiAgICByZXR1cm4gdHJ1ZTtcblxuICBpZiAodHlwZW9mIHZlcnNpb24gPT09ICdzdHJpbmcnKVxuICAgIHZlcnNpb24gPSBuZXcgU2VtVmVyKHZlcnNpb24sIHRoaXMub3B0aW9ucyk7XG5cbiAgcmV0dXJuIGNtcCh2ZXJzaW9uLCB0aGlzLm9wZXJhdG9yLCB0aGlzLnNlbXZlciwgdGhpcy5vcHRpb25zKTtcbn07XG5cbkNvbXBhcmF0b3IucHJvdG90eXBlLmludGVyc2VjdHMgPSBmdW5jdGlvbihjb21wLCBvcHRpb25zKSB7XG4gIGlmICghKGNvbXAgaW5zdGFuY2VvZiBDb21wYXJhdG9yKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2EgQ29tcGFyYXRvciBpcyByZXF1aXJlZCcpO1xuICB9XG5cbiAgaWYgKCFvcHRpb25zIHx8IHR5cGVvZiBvcHRpb25zICE9PSAnb2JqZWN0JylcbiAgICBvcHRpb25zID0geyBsb29zZTogISFvcHRpb25zLCBpbmNsdWRlUHJlcmVsZWFzZTogZmFsc2UgfVxuXG4gIHZhciByYW5nZVRtcDtcblxuICBpZiAodGhpcy5vcGVyYXRvciA9PT0gJycpIHtcbiAgICByYW5nZVRtcCA9IG5ldyBSYW5nZShjb21wLnZhbHVlLCBvcHRpb25zKTtcbiAgICByZXR1cm4gc2F0aXNmaWVzKHRoaXMudmFsdWUsIHJhbmdlVG1wLCBvcHRpb25zKTtcbiAgfSBlbHNlIGlmIChjb21wLm9wZXJhdG9yID09PSAnJykge1xuICAgIHJhbmdlVG1wID0gbmV3IFJhbmdlKHRoaXMudmFsdWUsIG9wdGlvbnMpO1xuICAgIHJldHVybiBzYXRpc2ZpZXMoY29tcC5zZW12ZXIsIHJhbmdlVG1wLCBvcHRpb25zKTtcbiAgfVxuXG4gIHZhciBzYW1lRGlyZWN0aW9uSW5jcmVhc2luZyA9XG4gICAgKHRoaXMub3BlcmF0b3IgPT09ICc+PScgfHwgdGhpcy5vcGVyYXRvciA9PT0gJz4nKSAmJlxuICAgIChjb21wLm9wZXJhdG9yID09PSAnPj0nIHx8IGNvbXAub3BlcmF0b3IgPT09ICc+Jyk7XG4gIHZhciBzYW1lRGlyZWN0aW9uRGVjcmVhc2luZyA9XG4gICAgKHRoaXMub3BlcmF0b3IgPT09ICc8PScgfHwgdGhpcy5vcGVyYXRvciA9PT0gJzwnKSAmJlxuICAgIChjb21wLm9wZXJhdG9yID09PSAnPD0nIHx8IGNvbXAub3BlcmF0b3IgPT09ICc8Jyk7XG4gIHZhciBzYW1lU2VtVmVyID0gdGhpcy5zZW12ZXIudmVyc2lvbiA9PT0gY29tcC5zZW12ZXIudmVyc2lvbjtcbiAgdmFyIGRpZmZlcmVudERpcmVjdGlvbnNJbmNsdXNpdmUgPVxuICAgICh0aGlzLm9wZXJhdG9yID09PSAnPj0nIHx8IHRoaXMub3BlcmF0b3IgPT09ICc8PScpICYmXG4gICAgKGNvbXAub3BlcmF0b3IgPT09ICc+PScgfHwgY29tcC5vcGVyYXRvciA9PT0gJzw9Jyk7XG4gIHZhciBvcHBvc2l0ZURpcmVjdGlvbnNMZXNzVGhhbiA9XG4gICAgY21wKHRoaXMuc2VtdmVyLCAnPCcsIGNvbXAuc2VtdmVyLCBvcHRpb25zKSAmJlxuICAgICgodGhpcy5vcGVyYXRvciA9PT0gJz49JyB8fCB0aGlzLm9wZXJhdG9yID09PSAnPicpICYmXG4gICAgKGNvbXAub3BlcmF0b3IgPT09ICc8PScgfHwgY29tcC5vcGVyYXRvciA9PT0gJzwnKSk7XG4gIHZhciBvcHBvc2l0ZURpcmVjdGlvbnNHcmVhdGVyVGhhbiA9XG4gICAgY21wKHRoaXMuc2VtdmVyLCAnPicsIGNvbXAuc2VtdmVyLCBvcHRpb25zKSAmJlxuICAgICgodGhpcy5vcGVyYXRvciA9PT0gJzw9JyB8fCB0aGlzLm9wZXJhdG9yID09PSAnPCcpICYmXG4gICAgKGNvbXAub3BlcmF0b3IgPT09ICc+PScgfHwgY29tcC5vcGVyYXRvciA9PT0gJz4nKSk7XG5cbiAgcmV0dXJuIHNhbWVEaXJlY3Rpb25JbmNyZWFzaW5nIHx8IHNhbWVEaXJlY3Rpb25EZWNyZWFzaW5nIHx8XG4gICAgKHNhbWVTZW1WZXIgJiYgZGlmZmVyZW50RGlyZWN0aW9uc0luY2x1c2l2ZSkgfHxcbiAgICBvcHBvc2l0ZURpcmVjdGlvbnNMZXNzVGhhbiB8fCBvcHBvc2l0ZURpcmVjdGlvbnNHcmVhdGVyVGhhbjtcbn07XG5cblxuZXhwb3J0cy5SYW5nZSA9IFJhbmdlO1xuZnVuY3Rpb24gUmFuZ2UocmFuZ2UsIG9wdGlvbnMpIHtcbiAgaWYgKCFvcHRpb25zIHx8IHR5cGVvZiBvcHRpb25zICE9PSAnb2JqZWN0JylcbiAgICBvcHRpb25zID0geyBsb29zZTogISFvcHRpb25zLCBpbmNsdWRlUHJlcmVsZWFzZTogZmFsc2UgfVxuXG4gIGlmIChyYW5nZSBpbnN0YW5jZW9mIFJhbmdlKSB7XG4gICAgaWYgKHJhbmdlLmxvb3NlID09PSAhIW9wdGlvbnMubG9vc2UgJiZcbiAgICAgICAgcmFuZ2UuaW5jbHVkZVByZXJlbGVhc2UgPT09ICEhb3B0aW9ucy5pbmNsdWRlUHJlcmVsZWFzZSkge1xuICAgICAgcmV0dXJuIHJhbmdlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbmV3IFJhbmdlKHJhbmdlLnJhdywgb3B0aW9ucyk7XG4gICAgfVxuICB9XG5cbiAgaWYgKHJhbmdlIGluc3RhbmNlb2YgQ29tcGFyYXRvcikge1xuICAgIHJldHVybiBuZXcgUmFuZ2UocmFuZ2UudmFsdWUsIG9wdGlvbnMpO1xuICB9XG5cbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIFJhbmdlKSlcbiAgICByZXR1cm4gbmV3IFJhbmdlKHJhbmdlLCBvcHRpb25zKTtcblxuICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICB0aGlzLmxvb3NlID0gISFvcHRpb25zLmxvb3NlO1xuICB0aGlzLmluY2x1ZGVQcmVyZWxlYXNlID0gISFvcHRpb25zLmluY2x1ZGVQcmVyZWxlYXNlXG5cbiAgLy8gRmlyc3QsIHNwbGl0IGJhc2VkIG9uIGJvb2xlYW4gb3IgfHxcbiAgdGhpcy5yYXcgPSByYW5nZTtcbiAgdGhpcy5zZXQgPSByYW5nZS5zcGxpdCgvXFxzKlxcfFxcfFxccyovKS5tYXAoZnVuY3Rpb24ocmFuZ2UpIHtcbiAgICByZXR1cm4gdGhpcy5wYXJzZVJhbmdlKHJhbmdlLnRyaW0oKSk7XG4gIH0sIHRoaXMpLmZpbHRlcihmdW5jdGlvbihjKSB7XG4gICAgLy8gdGhyb3cgb3V0IGFueSB0aGF0IGFyZSBub3QgcmVsZXZhbnQgZm9yIHdoYXRldmVyIHJlYXNvblxuICAgIHJldHVybiBjLmxlbmd0aDtcbiAgfSk7XG5cbiAgaWYgKCF0aGlzLnNldC5sZW5ndGgpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIFNlbVZlciBSYW5nZTogJyArIHJhbmdlKTtcbiAgfVxuXG4gIHRoaXMuZm9ybWF0KCk7XG59XG5cblJhbmdlLnByb3RvdHlwZS5mb3JtYXQgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5yYW5nZSA9IHRoaXMuc2V0Lm1hcChmdW5jdGlvbihjb21wcykge1xuICAgIHJldHVybiBjb21wcy5qb2luKCcgJykudHJpbSgpO1xuICB9KS5qb2luKCd8fCcpLnRyaW0oKTtcbiAgcmV0dXJuIHRoaXMucmFuZ2U7XG59O1xuXG5SYW5nZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMucmFuZ2U7XG59O1xuXG5SYW5nZS5wcm90b3R5cGUucGFyc2VSYW5nZSA9IGZ1bmN0aW9uKHJhbmdlKSB7XG4gIHZhciBsb29zZSA9IHRoaXMub3B0aW9ucy5sb29zZTtcbiAgcmFuZ2UgPSByYW5nZS50cmltKCk7XG4gIC8vIGAxLjIuMyAtIDEuMi40YCA9PiBgPj0xLjIuMyA8PTEuMi40YFxuICB2YXIgaHIgPSBsb29zZSA/IHJlW0hZUEhFTlJBTkdFTE9PU0VdIDogcmVbSFlQSEVOUkFOR0VdO1xuICByYW5nZSA9IHJhbmdlLnJlcGxhY2UoaHIsIGh5cGhlblJlcGxhY2UpO1xuICBkZWJ1ZygnaHlwaGVuIHJlcGxhY2UnLCByYW5nZSk7XG4gIC8vIGA+IDEuMi4zIDwgMS4yLjVgID0+IGA+MS4yLjMgPDEuMi41YFxuICByYW5nZSA9IHJhbmdlLnJlcGxhY2UocmVbQ09NUEFSQVRPUlRSSU1dLCBjb21wYXJhdG9yVHJpbVJlcGxhY2UpO1xuICBkZWJ1ZygnY29tcGFyYXRvciB0cmltJywgcmFuZ2UsIHJlW0NPTVBBUkFUT1JUUklNXSk7XG5cbiAgLy8gYH4gMS4yLjNgID0+IGB+MS4yLjNgXG4gIHJhbmdlID0gcmFuZ2UucmVwbGFjZShyZVtUSUxERVRSSU1dLCB0aWxkZVRyaW1SZXBsYWNlKTtcblxuICAvLyBgXiAxLjIuM2AgPT4gYF4xLjIuM2BcbiAgcmFuZ2UgPSByYW5nZS5yZXBsYWNlKHJlW0NBUkVUVFJJTV0sIGNhcmV0VHJpbVJlcGxhY2UpO1xuXG4gIC8vIG5vcm1hbGl6ZSBzcGFjZXNcbiAgcmFuZ2UgPSByYW5nZS5zcGxpdCgvXFxzKy8pLmpvaW4oJyAnKTtcblxuICAvLyBBdCB0aGlzIHBvaW50LCB0aGUgcmFuZ2UgaXMgY29tcGxldGVseSB0cmltbWVkIGFuZFxuICAvLyByZWFkeSB0byBiZSBzcGxpdCBpbnRvIGNvbXBhcmF0b3JzLlxuXG4gIHZhciBjb21wUmUgPSBsb29zZSA/IHJlW0NPTVBBUkFUT1JMT09TRV0gOiByZVtDT01QQVJBVE9SXTtcbiAgdmFyIHNldCA9IHJhbmdlLnNwbGl0KCcgJykubWFwKGZ1bmN0aW9uKGNvbXApIHtcbiAgICByZXR1cm4gcGFyc2VDb21wYXJhdG9yKGNvbXAsIHRoaXMub3B0aW9ucyk7XG4gIH0sIHRoaXMpLmpvaW4oJyAnKS5zcGxpdCgvXFxzKy8pO1xuICBpZiAodGhpcy5vcHRpb25zLmxvb3NlKSB7XG4gICAgLy8gaW4gbG9vc2UgbW9kZSwgdGhyb3cgb3V0IGFueSB0aGF0IGFyZSBub3QgdmFsaWQgY29tcGFyYXRvcnNcbiAgICBzZXQgPSBzZXQuZmlsdGVyKGZ1bmN0aW9uKGNvbXApIHtcbiAgICAgIHJldHVybiAhIWNvbXAubWF0Y2goY29tcFJlKTtcbiAgICB9KTtcbiAgfVxuICBzZXQgPSBzZXQubWFwKGZ1bmN0aW9uKGNvbXApIHtcbiAgICByZXR1cm4gbmV3IENvbXBhcmF0b3IoY29tcCwgdGhpcy5vcHRpb25zKTtcbiAgfSwgdGhpcyk7XG5cbiAgcmV0dXJuIHNldDtcbn07XG5cblJhbmdlLnByb3RvdHlwZS5pbnRlcnNlY3RzID0gZnVuY3Rpb24ocmFuZ2UsIG9wdGlvbnMpIHtcbiAgaWYgKCEocmFuZ2UgaW5zdGFuY2VvZiBSYW5nZSkpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdhIFJhbmdlIGlzIHJlcXVpcmVkJyk7XG4gIH1cblxuICByZXR1cm4gdGhpcy5zZXQuc29tZShmdW5jdGlvbih0aGlzQ29tcGFyYXRvcnMpIHtcbiAgICByZXR1cm4gdGhpc0NvbXBhcmF0b3JzLmV2ZXJ5KGZ1bmN0aW9uKHRoaXNDb21wYXJhdG9yKSB7XG4gICAgICByZXR1cm4gcmFuZ2Uuc2V0LnNvbWUoZnVuY3Rpb24ocmFuZ2VDb21wYXJhdG9ycykge1xuICAgICAgICByZXR1cm4gcmFuZ2VDb21wYXJhdG9ycy5ldmVyeShmdW5jdGlvbihyYW5nZUNvbXBhcmF0b3IpIHtcbiAgICAgICAgICByZXR1cm4gdGhpc0NvbXBhcmF0b3IuaW50ZXJzZWN0cyhyYW5nZUNvbXBhcmF0b3IsIG9wdGlvbnMpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcbn07XG5cbi8vIE1vc3RseSBqdXN0IGZvciB0ZXN0aW5nIGFuZCBsZWdhY3kgQVBJIHJlYXNvbnNcbmV4cG9ydHMudG9Db21wYXJhdG9ycyA9IHRvQ29tcGFyYXRvcnM7XG5mdW5jdGlvbiB0b0NvbXBhcmF0b3JzKHJhbmdlLCBvcHRpb25zKSB7XG4gIHJldHVybiBuZXcgUmFuZ2UocmFuZ2UsIG9wdGlvbnMpLnNldC5tYXAoZnVuY3Rpb24oY29tcCkge1xuICAgIHJldHVybiBjb21wLm1hcChmdW5jdGlvbihjKSB7XG4gICAgICByZXR1cm4gYy52YWx1ZTtcbiAgICB9KS5qb2luKCcgJykudHJpbSgpLnNwbGl0KCcgJyk7XG4gIH0pO1xufVxuXG4vLyBjb21wcmlzZWQgb2YgeHJhbmdlcywgdGlsZGVzLCBzdGFycywgYW5kIGd0bHQncyBhdCB0aGlzIHBvaW50LlxuLy8gYWxyZWFkeSByZXBsYWNlZCB0aGUgaHlwaGVuIHJhbmdlc1xuLy8gdHVybiBpbnRvIGEgc2V0IG9mIEpVU1QgY29tcGFyYXRvcnMuXG5mdW5jdGlvbiBwYXJzZUNvbXBhcmF0b3IoY29tcCwgb3B0aW9ucykge1xuICBkZWJ1ZygnY29tcCcsIGNvbXAsIG9wdGlvbnMpO1xuICBjb21wID0gcmVwbGFjZUNhcmV0cyhjb21wLCBvcHRpb25zKTtcbiAgZGVidWcoJ2NhcmV0JywgY29tcCk7XG4gIGNvbXAgPSByZXBsYWNlVGlsZGVzKGNvbXAsIG9wdGlvbnMpO1xuICBkZWJ1ZygndGlsZGVzJywgY29tcCk7XG4gIGNvbXAgPSByZXBsYWNlWFJhbmdlcyhjb21wLCBvcHRpb25zKTtcbiAgZGVidWcoJ3hyYW5nZScsIGNvbXApO1xuICBjb21wID0gcmVwbGFjZVN0YXJzKGNvbXAsIG9wdGlvbnMpO1xuICBkZWJ1Zygnc3RhcnMnLCBjb21wKTtcbiAgcmV0dXJuIGNvbXA7XG59XG5cbmZ1bmN0aW9uIGlzWChpZCkge1xuICByZXR1cm4gIWlkIHx8IGlkLnRvTG93ZXJDYXNlKCkgPT09ICd4JyB8fCBpZCA9PT0gJyonO1xufVxuXG4vLyB+LCB+PiAtLT4gKiAoYW55LCBraW5kYSBzaWxseSlcbi8vIH4yLCB+Mi54LCB+Mi54LngsIH4+Miwgfj4yLnggfj4yLngueCAtLT4gPj0yLjAuMCA8My4wLjBcbi8vIH4yLjAsIH4yLjAueCwgfj4yLjAsIH4+Mi4wLnggLS0+ID49Mi4wLjAgPDIuMS4wXG4vLyB+MS4yLCB+MS4yLngsIH4+MS4yLCB+PjEuMi54IC0tPiA+PTEuMi4wIDwxLjMuMFxuLy8gfjEuMi4zLCB+PjEuMi4zIC0tPiA+PTEuMi4zIDwxLjMuMFxuLy8gfjEuMi4wLCB+PjEuMi4wIC0tPiA+PTEuMi4wIDwxLjMuMFxuZnVuY3Rpb24gcmVwbGFjZVRpbGRlcyhjb21wLCBvcHRpb25zKSB7XG4gIHJldHVybiBjb21wLnRyaW0oKS5zcGxpdCgvXFxzKy8pLm1hcChmdW5jdGlvbihjb21wKSB7XG4gICAgcmV0dXJuIHJlcGxhY2VUaWxkZShjb21wLCBvcHRpb25zKTtcbiAgfSkuam9pbignICcpO1xufVxuXG5mdW5jdGlvbiByZXBsYWNlVGlsZGUoY29tcCwgb3B0aW9ucykge1xuICBpZiAoIW9wdGlvbnMgfHwgdHlwZW9mIG9wdGlvbnMgIT09ICdvYmplY3QnKVxuICAgIG9wdGlvbnMgPSB7IGxvb3NlOiAhIW9wdGlvbnMsIGluY2x1ZGVQcmVyZWxlYXNlOiBmYWxzZSB9XG4gIHZhciByID0gb3B0aW9ucy5sb29zZSA/IHJlW1RJTERFTE9PU0VdIDogcmVbVElMREVdO1xuICByZXR1cm4gY29tcC5yZXBsYWNlKHIsIGZ1bmN0aW9uKF8sIE0sIG0sIHAsIHByKSB7XG4gICAgZGVidWcoJ3RpbGRlJywgY29tcCwgXywgTSwgbSwgcCwgcHIpO1xuICAgIHZhciByZXQ7XG5cbiAgICBpZiAoaXNYKE0pKVxuICAgICAgcmV0ID0gJyc7XG4gICAgZWxzZSBpZiAoaXNYKG0pKVxuICAgICAgcmV0ID0gJz49JyArIE0gKyAnLjAuMCA8JyArICgrTSArIDEpICsgJy4wLjAnO1xuICAgIGVsc2UgaWYgKGlzWChwKSlcbiAgICAgIC8vIH4xLjIgPT0gPj0xLjIuMCA8MS4zLjBcbiAgICAgIHJldCA9ICc+PScgKyBNICsgJy4nICsgbSArICcuMCA8JyArIE0gKyAnLicgKyAoK20gKyAxKSArICcuMCc7XG4gICAgZWxzZSBpZiAocHIpIHtcbiAgICAgIGRlYnVnKCdyZXBsYWNlVGlsZGUgcHInLCBwcik7XG4gICAgICBpZiAocHIuY2hhckF0KDApICE9PSAnLScpXG4gICAgICAgIHByID0gJy0nICsgcHI7XG4gICAgICByZXQgPSAnPj0nICsgTSArICcuJyArIG0gKyAnLicgKyBwICsgcHIgK1xuICAgICAgICAgICAgJyA8JyArIE0gKyAnLicgKyAoK20gKyAxKSArICcuMCc7XG4gICAgfSBlbHNlXG4gICAgICAvLyB+MS4yLjMgPT0gPj0xLjIuMyA8MS4zLjBcbiAgICAgIHJldCA9ICc+PScgKyBNICsgJy4nICsgbSArICcuJyArIHAgK1xuICAgICAgICAgICAgJyA8JyArIE0gKyAnLicgKyAoK20gKyAxKSArICcuMCc7XG5cbiAgICBkZWJ1ZygndGlsZGUgcmV0dXJuJywgcmV0KTtcbiAgICByZXR1cm4gcmV0O1xuICB9KTtcbn1cblxuLy8gXiAtLT4gKiAoYW55LCBraW5kYSBzaWxseSlcbi8vIF4yLCBeMi54LCBeMi54LnggLS0+ID49Mi4wLjAgPDMuMC4wXG4vLyBeMi4wLCBeMi4wLnggLS0+ID49Mi4wLjAgPDMuMC4wXG4vLyBeMS4yLCBeMS4yLnggLS0+ID49MS4yLjAgPDIuMC4wXG4vLyBeMS4yLjMgLS0+ID49MS4yLjMgPDIuMC4wXG4vLyBeMS4yLjAgLS0+ID49MS4yLjAgPDIuMC4wXG5mdW5jdGlvbiByZXBsYWNlQ2FyZXRzKGNvbXAsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIGNvbXAudHJpbSgpLnNwbGl0KC9cXHMrLykubWFwKGZ1bmN0aW9uKGNvbXApIHtcbiAgICByZXR1cm4gcmVwbGFjZUNhcmV0KGNvbXAsIG9wdGlvbnMpO1xuICB9KS5qb2luKCcgJyk7XG59XG5cbmZ1bmN0aW9uIHJlcGxhY2VDYXJldChjb21wLCBvcHRpb25zKSB7XG4gIGRlYnVnKCdjYXJldCcsIGNvbXAsIG9wdGlvbnMpO1xuICBpZiAoIW9wdGlvbnMgfHwgdHlwZW9mIG9wdGlvbnMgIT09ICdvYmplY3QnKVxuICAgIG9wdGlvbnMgPSB7IGxvb3NlOiAhIW9wdGlvbnMsIGluY2x1ZGVQcmVyZWxlYXNlOiBmYWxzZSB9XG4gIHZhciByID0gb3B0aW9ucy5sb29zZSA/IHJlW0NBUkVUTE9PU0VdIDogcmVbQ0FSRVRdO1xuICByZXR1cm4gY29tcC5yZXBsYWNlKHIsIGZ1bmN0aW9uKF8sIE0sIG0sIHAsIHByKSB7XG4gICAgZGVidWcoJ2NhcmV0JywgY29tcCwgXywgTSwgbSwgcCwgcHIpO1xuICAgIHZhciByZXQ7XG5cbiAgICBpZiAoaXNYKE0pKVxuICAgICAgcmV0ID0gJyc7XG4gICAgZWxzZSBpZiAoaXNYKG0pKVxuICAgICAgcmV0ID0gJz49JyArIE0gKyAnLjAuMCA8JyArICgrTSArIDEpICsgJy4wLjAnO1xuICAgIGVsc2UgaWYgKGlzWChwKSkge1xuICAgICAgaWYgKE0gPT09ICcwJylcbiAgICAgICAgcmV0ID0gJz49JyArIE0gKyAnLicgKyBtICsgJy4wIDwnICsgTSArICcuJyArICgrbSArIDEpICsgJy4wJztcbiAgICAgIGVsc2VcbiAgICAgICAgcmV0ID0gJz49JyArIE0gKyAnLicgKyBtICsgJy4wIDwnICsgKCtNICsgMSkgKyAnLjAuMCc7XG4gICAgfSBlbHNlIGlmIChwcikge1xuICAgICAgZGVidWcoJ3JlcGxhY2VDYXJldCBwcicsIHByKTtcbiAgICAgIGlmIChwci5jaGFyQXQoMCkgIT09ICctJylcbiAgICAgICAgcHIgPSAnLScgKyBwcjtcbiAgICAgIGlmIChNID09PSAnMCcpIHtcbiAgICAgICAgaWYgKG0gPT09ICcwJylcbiAgICAgICAgICByZXQgPSAnPj0nICsgTSArICcuJyArIG0gKyAnLicgKyBwICsgcHIgK1xuICAgICAgICAgICAgICAgICcgPCcgKyBNICsgJy4nICsgbSArICcuJyArICgrcCArIDEpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgcmV0ID0gJz49JyArIE0gKyAnLicgKyBtICsgJy4nICsgcCArIHByICtcbiAgICAgICAgICAgICAgICAnIDwnICsgTSArICcuJyArICgrbSArIDEpICsgJy4wJztcbiAgICAgIH0gZWxzZVxuICAgICAgICByZXQgPSAnPj0nICsgTSArICcuJyArIG0gKyAnLicgKyBwICsgcHIgK1xuICAgICAgICAgICAgICAnIDwnICsgKCtNICsgMSkgKyAnLjAuMCc7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlYnVnKCdubyBwcicpO1xuICAgICAgaWYgKE0gPT09ICcwJykge1xuICAgICAgICBpZiAobSA9PT0gJzAnKVxuICAgICAgICAgIHJldCA9ICc+PScgKyBNICsgJy4nICsgbSArICcuJyArIHAgK1xuICAgICAgICAgICAgICAgICcgPCcgKyBNICsgJy4nICsgbSArICcuJyArICgrcCArIDEpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgcmV0ID0gJz49JyArIE0gKyAnLicgKyBtICsgJy4nICsgcCArXG4gICAgICAgICAgICAgICAgJyA8JyArIE0gKyAnLicgKyAoK20gKyAxKSArICcuMCc7XG4gICAgICB9IGVsc2VcbiAgICAgICAgcmV0ID0gJz49JyArIE0gKyAnLicgKyBtICsgJy4nICsgcCArXG4gICAgICAgICAgICAgICcgPCcgKyAoK00gKyAxKSArICcuMC4wJztcbiAgICB9XG5cbiAgICBkZWJ1ZygnY2FyZXQgcmV0dXJuJywgcmV0KTtcbiAgICByZXR1cm4gcmV0O1xuICB9KTtcbn1cblxuZnVuY3Rpb24gcmVwbGFjZVhSYW5nZXMoY29tcCwgb3B0aW9ucykge1xuICBkZWJ1ZygncmVwbGFjZVhSYW5nZXMnLCBjb21wLCBvcHRpb25zKTtcbiAgcmV0dXJuIGNvbXAuc3BsaXQoL1xccysvKS5tYXAoZnVuY3Rpb24oY29tcCkge1xuICAgIHJldHVybiByZXBsYWNlWFJhbmdlKGNvbXAsIG9wdGlvbnMpO1xuICB9KS5qb2luKCcgJyk7XG59XG5cbmZ1bmN0aW9uIHJlcGxhY2VYUmFuZ2UoY29tcCwgb3B0aW9ucykge1xuICBjb21wID0gY29tcC50cmltKCk7XG4gIGlmICghb3B0aW9ucyB8fCB0eXBlb2Ygb3B0aW9ucyAhPT0gJ29iamVjdCcpXG4gICAgb3B0aW9ucyA9IHsgbG9vc2U6ICEhb3B0aW9ucywgaW5jbHVkZVByZXJlbGVhc2U6IGZhbHNlIH1cbiAgdmFyIHIgPSBvcHRpb25zLmxvb3NlID8gcmVbWFJBTkdFTE9PU0VdIDogcmVbWFJBTkdFXTtcbiAgcmV0dXJuIGNvbXAucmVwbGFjZShyLCBmdW5jdGlvbihyZXQsIGd0bHQsIE0sIG0sIHAsIHByKSB7XG4gICAgZGVidWcoJ3hSYW5nZScsIGNvbXAsIHJldCwgZ3RsdCwgTSwgbSwgcCwgcHIpO1xuICAgIHZhciB4TSA9IGlzWChNKTtcbiAgICB2YXIgeG0gPSB4TSB8fCBpc1gobSk7XG4gICAgdmFyIHhwID0geG0gfHwgaXNYKHApO1xuICAgIHZhciBhbnlYID0geHA7XG5cbiAgICBpZiAoZ3RsdCA9PT0gJz0nICYmIGFueVgpXG4gICAgICBndGx0ID0gJyc7XG5cbiAgICBpZiAoeE0pIHtcbiAgICAgIGlmIChndGx0ID09PSAnPicgfHwgZ3RsdCA9PT0gJzwnKSB7XG4gICAgICAgIC8vIG5vdGhpbmcgaXMgYWxsb3dlZFxuICAgICAgICByZXQgPSAnPDAuMC4wJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIG5vdGhpbmcgaXMgZm9yYmlkZGVuXG4gICAgICAgIHJldCA9ICcqJztcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGd0bHQgJiYgYW55WCkge1xuICAgICAgLy8gcmVwbGFjZSBYIHdpdGggMFxuICAgICAgaWYgKHhtKVxuICAgICAgICBtID0gMDtcbiAgICAgIGlmICh4cClcbiAgICAgICAgcCA9IDA7XG5cbiAgICAgIGlmIChndGx0ID09PSAnPicpIHtcbiAgICAgICAgLy8gPjEgPT4gPj0yLjAuMFxuICAgICAgICAvLyA+MS4yID0+ID49MS4zLjBcbiAgICAgICAgLy8gPjEuMi4zID0+ID49IDEuMi40XG4gICAgICAgIGd0bHQgPSAnPj0nO1xuICAgICAgICBpZiAoeG0pIHtcbiAgICAgICAgICBNID0gK00gKyAxO1xuICAgICAgICAgIG0gPSAwO1xuICAgICAgICAgIHAgPSAwO1xuICAgICAgICB9IGVsc2UgaWYgKHhwKSB7XG4gICAgICAgICAgbSA9ICttICsgMTtcbiAgICAgICAgICBwID0gMDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChndGx0ID09PSAnPD0nKSB7XG4gICAgICAgIC8vIDw9MC43LnggaXMgYWN0dWFsbHkgPDAuOC4wLCBzaW5jZSBhbnkgMC43Lnggc2hvdWxkXG4gICAgICAgIC8vIHBhc3MuICBTaW1pbGFybHksIDw9Ny54IGlzIGFjdHVhbGx5IDw4LjAuMCwgZXRjLlxuICAgICAgICBndGx0ID0gJzwnO1xuICAgICAgICBpZiAoeG0pXG4gICAgICAgICAgTSA9ICtNICsgMTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgIG0gPSArbSArIDE7XG4gICAgICB9XG5cbiAgICAgIHJldCA9IGd0bHQgKyBNICsgJy4nICsgbSArICcuJyArIHA7XG4gICAgfSBlbHNlIGlmICh4bSkge1xuICAgICAgcmV0ID0gJz49JyArIE0gKyAnLjAuMCA8JyArICgrTSArIDEpICsgJy4wLjAnO1xuICAgIH0gZWxzZSBpZiAoeHApIHtcbiAgICAgIHJldCA9ICc+PScgKyBNICsgJy4nICsgbSArICcuMCA8JyArIE0gKyAnLicgKyAoK20gKyAxKSArICcuMCc7XG4gICAgfVxuXG4gICAgZGVidWcoJ3hSYW5nZSByZXR1cm4nLCByZXQpO1xuXG4gICAgcmV0dXJuIHJldDtcbiAgfSk7XG59XG5cbi8vIEJlY2F1c2UgKiBpcyBBTkQtZWQgd2l0aCBldmVyeXRoaW5nIGVsc2UgaW4gdGhlIGNvbXBhcmF0b3IsXG4vLyBhbmQgJycgbWVhbnMgXCJhbnkgdmVyc2lvblwiLCBqdXN0IHJlbW92ZSB0aGUgKnMgZW50aXJlbHkuXG5mdW5jdGlvbiByZXBsYWNlU3RhcnMoY29tcCwgb3B0aW9ucykge1xuICBkZWJ1ZygncmVwbGFjZVN0YXJzJywgY29tcCwgb3B0aW9ucyk7XG4gIC8vIExvb3NlbmVzcyBpcyBpZ25vcmVkIGhlcmUuICBzdGFyIGlzIGFsd2F5cyBhcyBsb29zZSBhcyBpdCBnZXRzIVxuICByZXR1cm4gY29tcC50cmltKCkucmVwbGFjZShyZVtTVEFSXSwgJycpO1xufVxuXG4vLyBUaGlzIGZ1bmN0aW9uIGlzIHBhc3NlZCB0byBzdHJpbmcucmVwbGFjZShyZVtIWVBIRU5SQU5HRV0pXG4vLyBNLCBtLCBwYXRjaCwgcHJlcmVsZWFzZSwgYnVpbGRcbi8vIDEuMiAtIDMuNC41ID0+ID49MS4yLjAgPD0zLjQuNVxuLy8gMS4yLjMgLSAzLjQgPT4gPj0xLjIuMCA8My41LjAgQW55IDMuNC54IHdpbGwgZG9cbi8vIDEuMiAtIDMuNCA9PiA+PTEuMi4wIDwzLjUuMFxuZnVuY3Rpb24gaHlwaGVuUmVwbGFjZSgkMCxcbiAgICAgICAgICAgICAgICAgICAgICAgZnJvbSwgZk0sIGZtLCBmcCwgZnByLCBmYixcbiAgICAgICAgICAgICAgICAgICAgICAgdG8sIHRNLCB0bSwgdHAsIHRwciwgdGIpIHtcblxuICBpZiAoaXNYKGZNKSlcbiAgICBmcm9tID0gJyc7XG4gIGVsc2UgaWYgKGlzWChmbSkpXG4gICAgZnJvbSA9ICc+PScgKyBmTSArICcuMC4wJztcbiAgZWxzZSBpZiAoaXNYKGZwKSlcbiAgICBmcm9tID0gJz49JyArIGZNICsgJy4nICsgZm0gKyAnLjAnO1xuICBlbHNlXG4gICAgZnJvbSA9ICc+PScgKyBmcm9tO1xuXG4gIGlmIChpc1godE0pKVxuICAgIHRvID0gJyc7XG4gIGVsc2UgaWYgKGlzWCh0bSkpXG4gICAgdG8gPSAnPCcgKyAoK3RNICsgMSkgKyAnLjAuMCc7XG4gIGVsc2UgaWYgKGlzWCh0cCkpXG4gICAgdG8gPSAnPCcgKyB0TSArICcuJyArICgrdG0gKyAxKSArICcuMCc7XG4gIGVsc2UgaWYgKHRwcilcbiAgICB0byA9ICc8PScgKyB0TSArICcuJyArIHRtICsgJy4nICsgdHAgKyAnLScgKyB0cHI7XG4gIGVsc2VcbiAgICB0byA9ICc8PScgKyB0bztcblxuICByZXR1cm4gKGZyb20gKyAnICcgKyB0bykudHJpbSgpO1xufVxuXG5cbi8vIGlmIEFOWSBvZiB0aGUgc2V0cyBtYXRjaCBBTEwgb2YgaXRzIGNvbXBhcmF0b3JzLCB0aGVuIHBhc3NcblJhbmdlLnByb3RvdHlwZS50ZXN0ID0gZnVuY3Rpb24odmVyc2lvbikge1xuICBpZiAoIXZlcnNpb24pXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIGlmICh0eXBlb2YgdmVyc2lvbiA9PT0gJ3N0cmluZycpXG4gICAgdmVyc2lvbiA9IG5ldyBTZW1WZXIodmVyc2lvbiwgdGhpcy5vcHRpb25zKTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuc2V0Lmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKHRlc3RTZXQodGhpcy5zZXRbaV0sIHZlcnNpb24sIHRoaXMub3B0aW9ucykpXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59O1xuXG5mdW5jdGlvbiB0ZXN0U2V0KHNldCwgdmVyc2lvbiwgb3B0aW9ucykge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHNldC5sZW5ndGg7IGkrKykge1xuICAgIGlmICghc2V0W2ldLnRlc3QodmVyc2lvbikpXG4gICAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAoIW9wdGlvbnMpXG4gICAgb3B0aW9ucyA9IHt9XG5cbiAgaWYgKHZlcnNpb24ucHJlcmVsZWFzZS5sZW5ndGggJiYgIW9wdGlvbnMuaW5jbHVkZVByZXJlbGVhc2UpIHtcbiAgICAvLyBGaW5kIHRoZSBzZXQgb2YgdmVyc2lvbnMgdGhhdCBhcmUgYWxsb3dlZCB0byBoYXZlIHByZXJlbGVhc2VzXG4gICAgLy8gRm9yIGV4YW1wbGUsIF4xLjIuMy1wci4xIGRlc3VnYXJzIHRvID49MS4yLjMtcHIuMSA8Mi4wLjBcbiAgICAvLyBUaGF0IHNob3VsZCBhbGxvdyBgMS4yLjMtcHIuMmAgdG8gcGFzcy5cbiAgICAvLyBIb3dldmVyLCBgMS4yLjQtYWxwaGEubm90cmVhZHlgIHNob3VsZCBOT1QgYmUgYWxsb3dlZCxcbiAgICAvLyBldmVuIHRob3VnaCBpdCdzIHdpdGhpbiB0aGUgcmFuZ2Ugc2V0IGJ5IHRoZSBjb21wYXJhdG9ycy5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNldC5sZW5ndGg7IGkrKykge1xuICAgICAgZGVidWcoc2V0W2ldLnNlbXZlcik7XG4gICAgICBpZiAoc2V0W2ldLnNlbXZlciA9PT0gQU5ZKVxuICAgICAgICBjb250aW51ZTtcblxuICAgICAgaWYgKHNldFtpXS5zZW12ZXIucHJlcmVsZWFzZS5sZW5ndGggPiAwKSB7XG4gICAgICAgIHZhciBhbGxvd2VkID0gc2V0W2ldLnNlbXZlcjtcbiAgICAgICAgaWYgKGFsbG93ZWQubWFqb3IgPT09IHZlcnNpb24ubWFqb3IgJiZcbiAgICAgICAgICAgIGFsbG93ZWQubWlub3IgPT09IHZlcnNpb24ubWlub3IgJiZcbiAgICAgICAgICAgIGFsbG93ZWQucGF0Y2ggPT09IHZlcnNpb24ucGF0Y2gpXG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gVmVyc2lvbiBoYXMgYSAtcHJlLCBidXQgaXQncyBub3Qgb25lIG9mIHRoZSBvbmVzIHdlIGxpa2UuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG5cbmV4cG9ydHMuc2F0aXNmaWVzID0gc2F0aXNmaWVzO1xuZnVuY3Rpb24gc2F0aXNmaWVzKHZlcnNpb24sIHJhbmdlLCBvcHRpb25zKSB7XG4gIHRyeSB7XG4gICAgcmFuZ2UgPSBuZXcgUmFuZ2UocmFuZ2UsIG9wdGlvbnMpO1xuICB9IGNhdGNoIChlcikge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gcmFuZ2UudGVzdCh2ZXJzaW9uKTtcbn1cblxuZXhwb3J0cy5tYXhTYXRpc2Z5aW5nID0gbWF4U2F0aXNmeWluZztcbmZ1bmN0aW9uIG1heFNhdGlzZnlpbmcodmVyc2lvbnMsIHJhbmdlLCBvcHRpb25zKSB7XG4gIHZhciBtYXggPSBudWxsO1xuICB2YXIgbWF4U1YgPSBudWxsO1xuICB0cnkge1xuICAgIHZhciByYW5nZU9iaiA9IG5ldyBSYW5nZShyYW5nZSwgb3B0aW9ucyk7XG4gIH0gY2F0Y2ggKGVyKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmVyc2lvbnMuZm9yRWFjaChmdW5jdGlvbiAodikge1xuICAgIGlmIChyYW5nZU9iai50ZXN0KHYpKSB7IC8vIHNhdGlzZmllcyh2LCByYW5nZSwgb3B0aW9ucylcbiAgICAgIGlmICghbWF4IHx8IG1heFNWLmNvbXBhcmUodikgPT09IC0xKSB7IC8vIGNvbXBhcmUobWF4LCB2LCB0cnVlKVxuICAgICAgICBtYXggPSB2O1xuICAgICAgICBtYXhTViA9IG5ldyBTZW1WZXIobWF4LCBvcHRpb25zKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pXG4gIHJldHVybiBtYXg7XG59XG5cbmV4cG9ydHMubWluU2F0aXNmeWluZyA9IG1pblNhdGlzZnlpbmc7XG5mdW5jdGlvbiBtaW5TYXRpc2Z5aW5nKHZlcnNpb25zLCByYW5nZSwgb3B0aW9ucykge1xuICB2YXIgbWluID0gbnVsbDtcbiAgdmFyIG1pblNWID0gbnVsbDtcbiAgdHJ5IHtcbiAgICB2YXIgcmFuZ2VPYmogPSBuZXcgUmFuZ2UocmFuZ2UsIG9wdGlvbnMpO1xuICB9IGNhdGNoIChlcikge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHZlcnNpb25zLmZvckVhY2goZnVuY3Rpb24gKHYpIHtcbiAgICBpZiAocmFuZ2VPYmoudGVzdCh2KSkgeyAvLyBzYXRpc2ZpZXModiwgcmFuZ2UsIG9wdGlvbnMpXG4gICAgICBpZiAoIW1pbiB8fCBtaW5TVi5jb21wYXJlKHYpID09PSAxKSB7IC8vIGNvbXBhcmUobWluLCB2LCB0cnVlKVxuICAgICAgICBtaW4gPSB2O1xuICAgICAgICBtaW5TViA9IG5ldyBTZW1WZXIobWluLCBvcHRpb25zKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pXG4gIHJldHVybiBtaW47XG59XG5cbmV4cG9ydHMudmFsaWRSYW5nZSA9IHZhbGlkUmFuZ2U7XG5mdW5jdGlvbiB2YWxpZFJhbmdlKHJhbmdlLCBvcHRpb25zKSB7XG4gIHRyeSB7XG4gICAgLy8gUmV0dXJuICcqJyBpbnN0ZWFkIG9mICcnIHNvIHRoYXQgdHJ1dGhpbmVzcyB3b3Jrcy5cbiAgICAvLyBUaGlzIHdpbGwgdGhyb3cgaWYgaXQncyBpbnZhbGlkIGFueXdheVxuICAgIHJldHVybiBuZXcgUmFuZ2UocmFuZ2UsIG9wdGlvbnMpLnJhbmdlIHx8ICcqJztcbiAgfSBjYXRjaCAoZXIpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG4vLyBEZXRlcm1pbmUgaWYgdmVyc2lvbiBpcyBsZXNzIHRoYW4gYWxsIHRoZSB2ZXJzaW9ucyBwb3NzaWJsZSBpbiB0aGUgcmFuZ2VcbmV4cG9ydHMubHRyID0gbHRyO1xuZnVuY3Rpb24gbHRyKHZlcnNpb24sIHJhbmdlLCBvcHRpb25zKSB7XG4gIHJldHVybiBvdXRzaWRlKHZlcnNpb24sIHJhbmdlLCAnPCcsIG9wdGlvbnMpO1xufVxuXG4vLyBEZXRlcm1pbmUgaWYgdmVyc2lvbiBpcyBncmVhdGVyIHRoYW4gYWxsIHRoZSB2ZXJzaW9ucyBwb3NzaWJsZSBpbiB0aGUgcmFuZ2UuXG5leHBvcnRzLmd0ciA9IGd0cjtcbmZ1bmN0aW9uIGd0cih2ZXJzaW9uLCByYW5nZSwgb3B0aW9ucykge1xuICByZXR1cm4gb3V0c2lkZSh2ZXJzaW9uLCByYW5nZSwgJz4nLCBvcHRpb25zKTtcbn1cblxuZXhwb3J0cy5vdXRzaWRlID0gb3V0c2lkZTtcbmZ1bmN0aW9uIG91dHNpZGUodmVyc2lvbiwgcmFuZ2UsIGhpbG8sIG9wdGlvbnMpIHtcbiAgdmVyc2lvbiA9IG5ldyBTZW1WZXIodmVyc2lvbiwgb3B0aW9ucyk7XG4gIHJhbmdlID0gbmV3IFJhbmdlKHJhbmdlLCBvcHRpb25zKTtcblxuICB2YXIgZ3RmbiwgbHRlZm4sIGx0Zm4sIGNvbXAsIGVjb21wO1xuICBzd2l0Y2ggKGhpbG8pIHtcbiAgICBjYXNlICc+JzpcbiAgICAgIGd0Zm4gPSBndDtcbiAgICAgIGx0ZWZuID0gbHRlO1xuICAgICAgbHRmbiA9IGx0O1xuICAgICAgY29tcCA9ICc+JztcbiAgICAgIGVjb21wID0gJz49JztcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJzwnOlxuICAgICAgZ3RmbiA9IGx0O1xuICAgICAgbHRlZm4gPSBndGU7XG4gICAgICBsdGZuID0gZ3Q7XG4gICAgICBjb21wID0gJzwnO1xuICAgICAgZWNvbXAgPSAnPD0nO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ011c3QgcHJvdmlkZSBhIGhpbG8gdmFsIG9mIFwiPFwiIG9yIFwiPlwiJyk7XG4gIH1cblxuICAvLyBJZiBpdCBzYXRpc2lmZXMgdGhlIHJhbmdlIGl0IGlzIG5vdCBvdXRzaWRlXG4gIGlmIChzYXRpc2ZpZXModmVyc2lvbiwgcmFuZ2UsIG9wdGlvbnMpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gRnJvbSBub3cgb24sIHZhcmlhYmxlIHRlcm1zIGFyZSBhcyBpZiB3ZSdyZSBpbiBcImd0clwiIG1vZGUuXG4gIC8vIGJ1dCBub3RlIHRoYXQgZXZlcnl0aGluZyBpcyBmbGlwcGVkIGZvciB0aGUgXCJsdHJcIiBmdW5jdGlvbi5cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHJhbmdlLnNldC5sZW5ndGg7ICsraSkge1xuICAgIHZhciBjb21wYXJhdG9ycyA9IHJhbmdlLnNldFtpXTtcblxuICAgIHZhciBoaWdoID0gbnVsbDtcbiAgICB2YXIgbG93ID0gbnVsbDtcblxuICAgIGNvbXBhcmF0b3JzLmZvckVhY2goZnVuY3Rpb24oY29tcGFyYXRvcikge1xuICAgICAgaWYgKGNvbXBhcmF0b3Iuc2VtdmVyID09PSBBTlkpIHtcbiAgICAgICAgY29tcGFyYXRvciA9IG5ldyBDb21wYXJhdG9yKCc+PTAuMC4wJylcbiAgICAgIH1cbiAgICAgIGhpZ2ggPSBoaWdoIHx8IGNvbXBhcmF0b3I7XG4gICAgICBsb3cgPSBsb3cgfHwgY29tcGFyYXRvcjtcbiAgICAgIGlmIChndGZuKGNvbXBhcmF0b3Iuc2VtdmVyLCBoaWdoLnNlbXZlciwgb3B0aW9ucykpIHtcbiAgICAgICAgaGlnaCA9IGNvbXBhcmF0b3I7XG4gICAgICB9IGVsc2UgaWYgKGx0Zm4oY29tcGFyYXRvci5zZW12ZXIsIGxvdy5zZW12ZXIsIG9wdGlvbnMpKSB7XG4gICAgICAgIGxvdyA9IGNvbXBhcmF0b3I7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBJZiB0aGUgZWRnZSB2ZXJzaW9uIGNvbXBhcmF0b3IgaGFzIGEgb3BlcmF0b3IgdGhlbiBvdXIgdmVyc2lvblxuICAgIC8vIGlzbid0IG91dHNpZGUgaXRcbiAgICBpZiAoaGlnaC5vcGVyYXRvciA9PT0gY29tcCB8fCBoaWdoLm9wZXJhdG9yID09PSBlY29tcCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIElmIHRoZSBsb3dlc3QgdmVyc2lvbiBjb21wYXJhdG9yIGhhcyBhbiBvcGVyYXRvciBhbmQgb3VyIHZlcnNpb25cbiAgICAvLyBpcyBsZXNzIHRoYW4gaXQgdGhlbiBpdCBpc24ndCBoaWdoZXIgdGhhbiB0aGUgcmFuZ2VcbiAgICBpZiAoKCFsb3cub3BlcmF0b3IgfHwgbG93Lm9wZXJhdG9yID09PSBjb21wKSAmJlxuICAgICAgICBsdGVmbih2ZXJzaW9uLCBsb3cuc2VtdmVyKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gZWxzZSBpZiAobG93Lm9wZXJhdG9yID09PSBlY29tcCAmJiBsdGZuKHZlcnNpb24sIGxvdy5zZW12ZXIpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG5leHBvcnRzLnByZXJlbGVhc2UgPSBwcmVyZWxlYXNlO1xuZnVuY3Rpb24gcHJlcmVsZWFzZSh2ZXJzaW9uLCBvcHRpb25zKSB7XG4gIHZhciBwYXJzZWQgPSBwYXJzZSh2ZXJzaW9uLCBvcHRpb25zKTtcbiAgcmV0dXJuIChwYXJzZWQgJiYgcGFyc2VkLnByZXJlbGVhc2UubGVuZ3RoKSA/IHBhcnNlZC5wcmVyZWxlYXNlIDogbnVsbDtcbn1cblxuZXhwb3J0cy5pbnRlcnNlY3RzID0gaW50ZXJzZWN0cztcbmZ1bmN0aW9uIGludGVyc2VjdHMocjEsIHIyLCBvcHRpb25zKSB7XG4gIHIxID0gbmV3IFJhbmdlKHIxLCBvcHRpb25zKVxuICByMiA9IG5ldyBSYW5nZShyMiwgb3B0aW9ucylcbiAgcmV0dXJuIHIxLmludGVyc2VjdHMocjIpXG59XG5cbmV4cG9ydHMuY29lcmNlID0gY29lcmNlO1xuZnVuY3Rpb24gY29lcmNlKHZlcnNpb24pIHtcbiAgaWYgKHZlcnNpb24gaW5zdGFuY2VvZiBTZW1WZXIpXG4gICAgcmV0dXJuIHZlcnNpb247XG5cbiAgaWYgKHR5cGVvZiB2ZXJzaW9uICE9PSAnc3RyaW5nJylcbiAgICByZXR1cm4gbnVsbDtcblxuICB2YXIgbWF0Y2ggPSB2ZXJzaW9uLm1hdGNoKHJlW0NPRVJDRV0pO1xuXG4gIGlmIChtYXRjaCA9PSBudWxsKVxuICAgIHJldHVybiBudWxsO1xuXG4gIHJldHVybiBwYXJzZSgobWF0Y2hbMV0gfHwgJzAnKSArICcuJyArIChtYXRjaFsyXSB8fCAnMCcpICsgJy4nICsgKG1hdGNoWzNdIHx8ICcwJykpOyBcbn1cbiIsIi8vIEBmbG93XG5pbXBvcnQgVnVlIGZyb20gJ3Z1ZSdcbmltcG9ydCBzZW12ZXIgZnJvbSAnc2VtdmVyJ1xuXG5leHBvcnQgZnVuY3Rpb24gdGhyb3dFcnJvcihtc2c6IHN0cmluZyk6IHZvaWQge1xuICB0aHJvdyBuZXcgRXJyb3IoYFt2dWUtdGVzdC11dGlsc106ICR7bXNnfWApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3YXJuKG1zZzogc3RyaW5nKTogdm9pZCB7XG4gIGNvbnNvbGUuZXJyb3IoYFt2dWUtdGVzdC11dGlsc106ICR7bXNnfWApXG59XG5cbmNvbnN0IGNhbWVsaXplUkUgPSAvLShcXHcpL2dcblxuZXhwb3J0IGNvbnN0IGNhbWVsaXplID0gKHN0cjogc3RyaW5nKTogc3RyaW5nID0+IHtcbiAgY29uc3QgY2FtZWxpemVkU3RyID0gc3RyLnJlcGxhY2UoY2FtZWxpemVSRSwgKF8sIGMpID0+XG4gICAgYyA/IGMudG9VcHBlckNhc2UoKSA6ICcnXG4gIClcbiAgcmV0dXJuIGNhbWVsaXplZFN0ci5jaGFyQXQoMCkudG9Mb3dlckNhc2UoKSArIGNhbWVsaXplZFN0ci5zbGljZSgxKVxufVxuXG4vKipcbiAqIENhcGl0YWxpemUgYSBzdHJpbmcuXG4gKi9cbmV4cG9ydCBjb25zdCBjYXBpdGFsaXplID0gKHN0cjogc3RyaW5nKTogc3RyaW5nID0+XG4gIHN0ci5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHN0ci5zbGljZSgxKVxuXG4vKipcbiAqIEh5cGhlbmF0ZSBhIGNhbWVsQ2FzZSBzdHJpbmcuXG4gKi9cbmNvbnN0IGh5cGhlbmF0ZVJFID0gL1xcQihbQS1aXSkvZ1xuZXhwb3J0IGNvbnN0IGh5cGhlbmF0ZSA9IChzdHI6IHN0cmluZyk6IHN0cmluZyA9PlxuICBzdHIucmVwbGFjZShoeXBoZW5hdGVSRSwgJy0kMScpLnRvTG93ZXJDYXNlKClcblxuZnVuY3Rpb24gaGFzT3duUHJvcGVydHkob2JqLCBwcm9wKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZUNvbXBvbmVudChpZDogc3RyaW5nLCBjb21wb25lbnRzOiBPYmplY3QpIHtcbiAgaWYgKHR5cGVvZiBpZCAhPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm5cbiAgfVxuICAvLyBjaGVjayBsb2NhbCByZWdpc3RyYXRpb24gdmFyaWF0aW9ucyBmaXJzdFxuICBpZiAoaGFzT3duUHJvcGVydHkoY29tcG9uZW50cywgaWQpKSB7XG4gICAgcmV0dXJuIGNvbXBvbmVudHNbaWRdXG4gIH1cbiAgdmFyIGNhbWVsaXplZElkID0gY2FtZWxpemUoaWQpXG4gIGlmIChoYXNPd25Qcm9wZXJ0eShjb21wb25lbnRzLCBjYW1lbGl6ZWRJZCkpIHtcbiAgICByZXR1cm4gY29tcG9uZW50c1tjYW1lbGl6ZWRJZF1cbiAgfVxuICB2YXIgUGFzY2FsQ2FzZUlkID0gY2FwaXRhbGl6ZShjYW1lbGl6ZWRJZClcbiAgaWYgKGhhc093blByb3BlcnR5KGNvbXBvbmVudHMsIFBhc2NhbENhc2VJZCkpIHtcbiAgICByZXR1cm4gY29tcG9uZW50c1tQYXNjYWxDYXNlSWRdXG4gIH1cbiAgLy8gZmFsbGJhY2sgdG8gcHJvdG90eXBlIGNoYWluXG4gIHJldHVybiBjb21wb25lbnRzW2lkXSB8fCBjb21wb25lbnRzW2NhbWVsaXplZElkXSB8fCBjb21wb25lbnRzW1Bhc2NhbENhc2VJZF1cbn1cblxuY29uc3QgVUEgPVxuICB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJlxuICAnbmF2aWdhdG9yJyBpbiB3aW5kb3cgJiZcbiAgbmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpXG5cbmV4cG9ydCBjb25zdCBpc1BoYW50b21KUyA9IFVBICYmIFVBLmluY2x1ZGVzICYmIFVBLm1hdGNoKC9waGFudG9tanMvaSlcblxuZXhwb3J0IGNvbnN0IGlzRWRnZSA9IFVBICYmIFVBLmluZGV4T2YoJ2VkZ2UvJykgPiAwXG5leHBvcnQgY29uc3QgaXNDaHJvbWUgPSBVQSAmJiAvY2hyb21lXFwvXFxkKy8udGVzdChVQSkgJiYgIWlzRWRnZVxuXG4vLyBnZXQgdGhlIGV2ZW50IHVzZWQgdG8gdHJpZ2dlciB2LW1vZGVsIGhhbmRsZXIgdGhhdCB1cGRhdGVzIGJvdW5kIGRhdGFcbmV4cG9ydCBmdW5jdGlvbiBnZXRDaGVja2VkRXZlbnQoKSB7XG4gIGNvbnN0IHZlcnNpb24gPSBWdWUudmVyc2lvblxuXG4gIGlmIChzZW12ZXIuc2F0aXNmaWVzKHZlcnNpb24sICcyLjEuOSAtIDIuMS4xMCcpKSB7XG4gICAgcmV0dXJuICdjbGljaydcbiAgfVxuXG4gIGlmIChzZW12ZXIuc2F0aXNmaWVzKHZlcnNpb24sICcyLjIgLSAyLjQnKSkge1xuICAgIHJldHVybiBpc0Nocm9tZSA/ICdjbGljaycgOiAnY2hhbmdlJ1xuICB9XG5cbiAgLy8gY2hhbmdlIGlzIGhhbmRsZXIgZm9yIHZlcnNpb24gMi4wIC0gMi4xLjgsIGFuZCAyLjUrXG4gIHJldHVybiAnY2hhbmdlJ1xufVxuIiwiLy8gQGZsb3dcbmltcG9ydCAkJFZ1ZSBmcm9tICd2dWUnXG5pbXBvcnQgeyB3YXJuIH0gZnJvbSAnc2hhcmVkL3V0aWwnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGFkZE1vY2tzKFxuICBfVnVlOiBDb21wb25lbnQsXG4gIG1vY2tlZFByb3BlcnRpZXM6IE9iamVjdCB8IGZhbHNlID0ge31cbik6IHZvaWQge1xuICBpZiAobW9ja2VkUHJvcGVydGllcyA9PT0gZmFsc2UpIHtcbiAgICByZXR1cm5cbiAgfVxuICBPYmplY3Qua2V5cyhtb2NrZWRQcm9wZXJ0aWVzKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIC8vICRGbG93SWdub3JlXG4gICAgICBfVnVlLnByb3RvdHlwZVtrZXldID0gbW9ja2VkUHJvcGVydGllc1trZXldXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgd2FybihcbiAgICAgICAgYGNvdWxkIG5vdCBvdmVyd3JpdGUgcHJvcGVydHkgJHtrZXl9LCB0aGlzIGlzIGAgK1xuICAgICAgICAgIGB1c3VhbGx5IGNhdXNlZCBieSBhIHBsdWdpbiB0aGF0IGhhcyBhZGRlZCBgICtcbiAgICAgICAgICBgdGhlIHByb3BlcnR5IGFzIGEgcmVhZC1vbmx5IHZhbHVlYFxuICAgICAgKVxuICAgIH1cbiAgICAvLyAkRmxvd0lnbm9yZVxuICAgICQkVnVlLnV0aWwuZGVmaW5lUmVhY3RpdmUoX1Z1ZSwga2V5LCBtb2NrZWRQcm9wZXJ0aWVzW2tleV0pXG4gIH0pXG59XG4iLCIvLyBAZmxvd1xuXG5leHBvcnQgZnVuY3Rpb24gbG9nRXZlbnRzKFxuICB2bTogQ29tcG9uZW50LFxuICBlbWl0dGVkOiBPYmplY3QsXG4gIGVtaXR0ZWRCeU9yZGVyOiBBcnJheTxhbnk+XG4pOiB2b2lkIHtcbiAgY29uc3QgZW1pdCA9IHZtLiRlbWl0XG4gIHZtLiRlbWl0ID0gKG5hbWUsIC4uLmFyZ3MpID0+IHtcbiAgICA7KGVtaXR0ZWRbbmFtZV0gfHwgKGVtaXR0ZWRbbmFtZV0gPSBbXSkpLnB1c2goYXJncylcbiAgICBlbWl0dGVkQnlPcmRlci5wdXNoKHsgbmFtZSwgYXJncyB9KVxuICAgIHJldHVybiBlbWl0LmNhbGwodm0sIG5hbWUsIC4uLmFyZ3MpXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFkZEV2ZW50TG9nZ2VyKF9WdWU6IENvbXBvbmVudCk6IHZvaWQge1xuICBfVnVlLm1peGluKHtcbiAgICBiZWZvcmVDcmVhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5fX2VtaXR0ZWQgPSBPYmplY3QuY3JlYXRlKG51bGwpXG4gICAgICB0aGlzLl9fZW1pdHRlZEJ5T3JkZXIgPSBbXVxuICAgICAgbG9nRXZlbnRzKHRoaXMsIHRoaXMuX19lbWl0dGVkLCB0aGlzLl9fZW1pdHRlZEJ5T3JkZXIpXG4gICAgfVxuICB9KVxufVxuIiwiaW1wb3J0IFZ1ZSBmcm9tICd2dWUnXG5pbXBvcnQgc2VtdmVyIGZyb20gJ3NlbXZlcidcblxuZXhwb3J0IGNvbnN0IE5BTUVfU0VMRUNUT1IgPSAnTkFNRV9TRUxFQ1RPUidcbmV4cG9ydCBjb25zdCBDT01QT05FTlRfU0VMRUNUT1IgPSAnQ09NUE9ORU5UX1NFTEVDVE9SJ1xuZXhwb3J0IGNvbnN0IFJFRl9TRUxFQ1RPUiA9ICdSRUZfU0VMRUNUT1InXG5leHBvcnQgY29uc3QgRE9NX1NFTEVDVE9SID0gJ0RPTV9TRUxFQ1RPUidcbmV4cG9ydCBjb25zdCBJTlZBTElEX1NFTEVDVE9SID0gJ0lOVkFMSURfU0VMRUNUT1InXG5cbmV4cG9ydCBjb25zdCBWVUVfVkVSU0lPTiA9IE51bWJlcihcbiAgYCR7VnVlLnZlcnNpb24uc3BsaXQoJy4nKVswXX0uJHtWdWUudmVyc2lvbi5zcGxpdCgnLicpWzFdfWBcbilcblxuZXhwb3J0IGNvbnN0IEZVTkNUSU9OQUxfT1BUSU9OUyA9XG4gIFZVRV9WRVJTSU9OID49IDIuNSA/ICdmbk9wdGlvbnMnIDogJ2Z1bmN0aW9uYWxPcHRpb25zJ1xuXG5leHBvcnQgY29uc3QgQkVGT1JFX1JFTkRFUl9MSUZFQ1lDTEVfSE9PSyA9IHNlbXZlci5ndChWdWUudmVyc2lvbiwgJzIuMS44JylcbiAgPyAnYmVmb3JlQ3JlYXRlJ1xuICA6ICdiZWZvcmVNb3VudCdcblxuZXhwb3J0IGNvbnN0IENSRUFURV9FTEVNRU5UX0FMSUFTID0gc2VtdmVyLmd0KFZ1ZS52ZXJzaW9uLCAnMi4xLjUnKVxuICA/ICdfYydcbiAgOiAnX2gnXG4iLCJpbXBvcnQgeyBCRUZPUkVfUkVOREVSX0xJRkVDWUNMRV9IT09LIH0gZnJvbSAnc2hhcmVkL2NvbnN0cydcblxuZXhwb3J0IGZ1bmN0aW9uIGFkZFN0dWJzKF9WdWUsIHN0dWJDb21wb25lbnRzKSB7XG4gIGZ1bmN0aW9uIGFkZFN0dWJDb21wb25lbnRzTWl4aW4oKSB7XG4gICAgT2JqZWN0LmFzc2lnbih0aGlzLiRvcHRpb25zLmNvbXBvbmVudHMsIHN0dWJDb21wb25lbnRzKVxuICB9XG5cbiAgX1Z1ZS5taXhpbih7XG4gICAgW0JFRk9SRV9SRU5ERVJfTElGRUNZQ0xFX0hPT0tdOiBhZGRTdHViQ29tcG9uZW50c01peGluXG4gIH0pXG59XG4iLCIvLyBAZmxvd1xuaW1wb3J0IHsgdGhyb3dFcnJvciwgY2FwaXRhbGl6ZSwgY2FtZWxpemUsIGh5cGhlbmF0ZSB9IGZyb20gJy4vdXRpbCdcblxuZXhwb3J0IGZ1bmN0aW9uIGlzRG9tU2VsZWN0b3Ioc2VsZWN0b3I6IGFueSk6IGJvb2xlYW4ge1xuICBpZiAodHlwZW9mIHNlbGVjdG9yICE9PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgdHJ5IHtcbiAgICBpZiAodHlwZW9mIGRvY3VtZW50ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhyb3dFcnJvcihcbiAgICAgICAgYG1vdW50IG11c3QgYmUgcnVuIGluIGEgYnJvd3NlciBlbnZpcm9ubWVudCBsaWtlIGAgK1xuICAgICAgICAgIGBQaGFudG9tSlMsIGpzZG9tIG9yIGNocm9tZWBcbiAgICAgIClcbiAgICB9XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgdGhyb3dFcnJvcihcbiAgICAgIGBtb3VudCBtdXN0IGJlIHJ1biBpbiBhIGJyb3dzZXIgZW52aXJvbm1lbnQgbGlrZSBgICtcbiAgICAgICAgYFBoYW50b21KUywganNkb20gb3IgY2hyb21lYFxuICAgIClcbiAgfVxuXG4gIHRyeSB7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3RvcilcbiAgICByZXR1cm4gdHJ1ZVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1Z1ZUNvbXBvbmVudChjOiBhbnkpOiBib29sZWFuIHtcbiAgaWYgKGlzQ29uc3RydWN0b3IoYykpIHtcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgaWYgKGMgPT09IG51bGwgfHwgdHlwZW9mIGMgIT09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICBpZiAoYy5leHRlbmRzIHx8IGMuX0N0b3IpIHtcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgaWYgKHR5cGVvZiBjLnRlbXBsYXRlID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICByZXR1cm4gdHlwZW9mIGMucmVuZGVyID09PSAnZnVuY3Rpb24nXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb21wb25lbnROZWVkc0NvbXBpbGluZyhjb21wb25lbnQ6IENvbXBvbmVudCk6IGJvb2xlYW4ge1xuICByZXR1cm4gKFxuICAgIGNvbXBvbmVudCAmJlxuICAgICFjb21wb25lbnQucmVuZGVyICYmXG4gICAgKGNvbXBvbmVudC50ZW1wbGF0ZSB8fCBjb21wb25lbnQuZXh0ZW5kcyB8fCBjb21wb25lbnQuZXh0ZW5kT3B0aW9ucykgJiZcbiAgICAhY29tcG9uZW50LmZ1bmN0aW9uYWxcbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNSZWZTZWxlY3RvcihyZWZPcHRpb25zT2JqZWN0OiBhbnkpOiBib29sZWFuIHtcbiAgaWYgKFxuICAgIHR5cGVvZiByZWZPcHRpb25zT2JqZWN0ICE9PSAnb2JqZWN0JyB8fFxuICAgIE9iamVjdC5rZXlzKHJlZk9wdGlvbnNPYmplY3QgfHwge30pLmxlbmd0aCAhPT0gMVxuICApIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIHJldHVybiB0eXBlb2YgcmVmT3B0aW9uc09iamVjdC5yZWYgPT09ICdzdHJpbmcnXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc05hbWVTZWxlY3RvcihuYW1lT3B0aW9uc09iamVjdDogYW55KTogYm9vbGVhbiB7XG4gIGlmICh0eXBlb2YgbmFtZU9wdGlvbnNPYmplY3QgIT09ICdvYmplY3QnIHx8IG5hbWVPcHRpb25zT2JqZWN0ID09PSBudWxsKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICByZXR1cm4gISFuYW1lT3B0aW9uc09iamVjdC5uYW1lXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0NvbnN0cnVjdG9yKGM6IGFueSkge1xuICByZXR1cm4gdHlwZW9mIGMgPT09ICdmdW5jdGlvbicgJiYgYy5jaWRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRHluYW1pY0NvbXBvbmVudChjOiBhbnkpIHtcbiAgcmV0dXJuIHR5cGVvZiBjID09PSAnZnVuY3Rpb24nICYmICFjLmNpZFxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNDb21wb25lbnRPcHRpb25zKGM6IGFueSkge1xuICByZXR1cm4gdHlwZW9mIGMgPT09ICdvYmplY3QnICYmIChjLnRlbXBsYXRlIHx8IGMucmVuZGVyKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNGdW5jdGlvbmFsQ29tcG9uZW50KGM6IGFueSkge1xuICBpZiAoIWlzVnVlQ29tcG9uZW50KGMpKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbiAgaWYgKGlzQ29uc3RydWN0b3IoYykpIHtcbiAgICByZXR1cm4gYy5vcHRpb25zLmZ1bmN0aW9uYWxcbiAgfVxuICByZXR1cm4gYy5mdW5jdGlvbmFsXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0ZW1wbGF0ZUNvbnRhaW5zQ29tcG9uZW50KFxuICB0ZW1wbGF0ZTogc3RyaW5nLFxuICBuYW1lOiBzdHJpbmdcbik6IGJvb2xlYW4ge1xuICByZXR1cm4gW2NhcGl0YWxpemUsIGNhbWVsaXplLCBoeXBoZW5hdGVdLnNvbWUoZm9ybWF0ID0+IHtcbiAgICBjb25zdCByZSA9IG5ldyBSZWdFeHAoYDwke2Zvcm1hdChuYW1lKX1cXFxccyooXFxcXHN8PnwoXFwvPikpYCwgJ2cnKVxuICAgIHJldHVybiByZS50ZXN0KHRlbXBsYXRlKVxuICB9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNQbGFpbk9iamVjdChjOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChjKSA9PT0gJ1tvYmplY3QgT2JqZWN0XSdcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUmVxdWlyZWRDb21wb25lbnQobmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiAoXG4gICAgbmFtZSA9PT0gJ0tlZXBBbGl2ZScgfHwgbmFtZSA9PT0gJ1RyYW5zaXRpb24nIHx8IG5hbWUgPT09ICdUcmFuc2l0aW9uR3JvdXAnXG4gIClcbn1cblxuZnVuY3Rpb24gbWFrZU1hcChzdHI6IHN0cmluZywgZXhwZWN0c0xvd2VyQ2FzZT86IGJvb2xlYW4pIHtcbiAgdmFyIG1hcCA9IE9iamVjdC5jcmVhdGUobnVsbClcbiAgdmFyIGxpc3QgPSBzdHIuc3BsaXQoJywnKVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICBtYXBbbGlzdFtpXV0gPSB0cnVlXG4gIH1cbiAgcmV0dXJuIGV4cGVjdHNMb3dlckNhc2VcbiAgICA/IGZ1bmN0aW9uKHZhbDogc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBtYXBbdmFsLnRvTG93ZXJDYXNlKCldXG4gICAgICB9XG4gICAgOiBmdW5jdGlvbih2YWw6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gbWFwW3ZhbF1cbiAgICAgIH1cbn1cblxuZXhwb3J0IGNvbnN0IGlzSFRNTFRhZyA9IG1ha2VNYXAoXG4gICdodG1sLGJvZHksYmFzZSxoZWFkLGxpbmssbWV0YSxzdHlsZSx0aXRsZSwnICtcbiAgICAnYWRkcmVzcyxhcnRpY2xlLGFzaWRlLGZvb3RlcixoZWFkZXIsaDEsaDIsaDMsaDQsaDUsaDYsaGdyb3VwLG5hdixzZWN0aW9uLCcgK1xuICAgICdkaXYsZGQsZGwsZHQsZmlnY2FwdGlvbixmaWd1cmUscGljdHVyZSxocixpbWcsbGksbWFpbixvbCxwLHByZSx1bCwnICtcbiAgICAnYSxiLGFiYnIsYmRpLGJkbyxicixjaXRlLGNvZGUsZGF0YSxkZm4sZW0saSxrYmQsbWFyayxxLHJwLHJ0LHJ0YyxydWJ5LCcgK1xuICAgICdzLHNhbXAsc21hbGwsc3BhbixzdHJvbmcsc3ViLHN1cCx0aW1lLHUsdmFyLHdicixhcmVhLGF1ZGlvLG1hcCx0cmFjaywnICtcbiAgICAnZW1iZWQsb2JqZWN0LHBhcmFtLHNvdXJjZSxjYW52YXMsc2NyaXB0LG5vc2NyaXB0LGRlbCxpbnMsJyArXG4gICAgJ2NhcHRpb24sY29sLGNvbGdyb3VwLHRhYmxlLHRoZWFkLHRib2R5LHRkLHRoLHRyLHZpZGVvLCcgK1xuICAgICdidXR0b24sZGF0YWxpc3QsZmllbGRzZXQsZm9ybSxpbnB1dCxsYWJlbCxsZWdlbmQsbWV0ZXIsb3B0Z3JvdXAsb3B0aW9uLCcgK1xuICAgICdvdXRwdXQscHJvZ3Jlc3Msc2VsZWN0LHRleHRhcmVhLCcgK1xuICAgICdkZXRhaWxzLGRpYWxvZyxtZW51LG1lbnVpdGVtLHN1bW1hcnksJyArXG4gICAgJ2NvbnRlbnQsZWxlbWVudCxzaGFkb3csdGVtcGxhdGUsYmxvY2txdW90ZSxpZnJhbWUsdGZvb3QnXG4pXG5cbi8vIHRoaXMgbWFwIGlzIGludGVudGlvbmFsbHkgc2VsZWN0aXZlLCBvbmx5IGNvdmVyaW5nIFNWRyBlbGVtZW50cyB0aGF0IG1heVxuLy8gY29udGFpbiBjaGlsZCBlbGVtZW50cy5cbmV4cG9ydCBjb25zdCBpc1NWRyA9IG1ha2VNYXAoXG4gICdzdmcsYW5pbWF0ZSxjaXJjbGUsY2xpcHBhdGgsY3Vyc29yLGRlZnMsZGVzYyxlbGxpcHNlLGZpbHRlcixmb250LWZhY2UsJyArXG4gICAgJ2ZvcmVpZ25PYmplY3QsZyxnbHlwaCxpbWFnZSxsaW5lLG1hcmtlcixtYXNrLG1pc3NpbmctZ2x5cGgscGF0aCxwYXR0ZXJuLCcgK1xuICAgICdwb2x5Z29uLHBvbHlsaW5lLHJlY3Qsc3dpdGNoLHN5bWJvbCx0ZXh0LHRleHRwYXRoLHRzcGFuLHVzZSx2aWV3JyxcbiAgdHJ1ZVxuKVxuXG5leHBvcnQgY29uc3QgaXNSZXNlcnZlZFRhZyA9ICh0YWc6IHN0cmluZykgPT4gaXNIVE1MVGFnKHRhZykgfHwgaXNTVkcodGFnKVxuIiwiLy8gQGZsb3dcblxuaW1wb3J0IHsgY29tcGlsZVRvRnVuY3Rpb25zIH0gZnJvbSAndnVlLXRlbXBsYXRlLWNvbXBpbGVyJ1xuaW1wb3J0IHsgY29tcG9uZW50TmVlZHNDb21waWxpbmcgfSBmcm9tICcuL3ZhbGlkYXRvcnMnXG5pbXBvcnQgeyB0aHJvd0Vycm9yIH0gZnJvbSAnLi91dGlsJ1xuXG5leHBvcnQgZnVuY3Rpb24gY29tcGlsZUZyb21TdHJpbmcoc3RyOiBzdHJpbmcpIHtcbiAgaWYgKCFjb21waWxlVG9GdW5jdGlvbnMpIHtcbiAgICB0aHJvd0Vycm9yKFxuICAgICAgYHZ1ZVRlbXBsYXRlQ29tcGlsZXIgaXMgdW5kZWZpbmVkLCB5b3UgbXVzdCBwYXNzIGAgK1xuICAgICAgICBgcHJlY29tcGlsZWQgY29tcG9uZW50cyBpZiB2dWUtdGVtcGxhdGUtY29tcGlsZXIgaXMgYCArXG4gICAgICAgIGB1bmRlZmluZWRgXG4gICAgKVxuICB9XG4gIHJldHVybiBjb21waWxlVG9GdW5jdGlvbnMoc3RyKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY29tcGlsZVRlbXBsYXRlKGNvbXBvbmVudDogQ29tcG9uZW50KTogdm9pZCB7XG4gIGlmIChjb21wb25lbnQudGVtcGxhdGUpIHtcbiAgICBPYmplY3QuYXNzaWduKGNvbXBvbmVudCwgY29tcGlsZVRvRnVuY3Rpb25zKGNvbXBvbmVudC50ZW1wbGF0ZSkpXG4gIH1cblxuICBpZiAoY29tcG9uZW50LmNvbXBvbmVudHMpIHtcbiAgICBPYmplY3Qua2V5cyhjb21wb25lbnQuY29tcG9uZW50cykuZm9yRWFjaChjID0+IHtcbiAgICAgIGNvbnN0IGNtcCA9IGNvbXBvbmVudC5jb21wb25lbnRzW2NdXG4gICAgICBpZiAoIWNtcC5yZW5kZXIpIHtcbiAgICAgICAgY29tcGlsZVRlbXBsYXRlKGNtcClcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgaWYgKGNvbXBvbmVudC5leHRlbmRzKSB7XG4gICAgY29tcGlsZVRlbXBsYXRlKGNvbXBvbmVudC5leHRlbmRzKVxuICB9XG5cbiAgaWYgKGNvbXBvbmVudC5leHRlbmRPcHRpb25zICYmICFjb21wb25lbnQub3B0aW9ucy5yZW5kZXIpIHtcbiAgICBjb21waWxlVGVtcGxhdGUoY29tcG9uZW50Lm9wdGlvbnMpXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbXBpbGVUZW1wbGF0ZUZvclNsb3RzKHNsb3RzOiBPYmplY3QpOiB2b2lkIHtcbiAgT2JqZWN0LmtleXMoc2xvdHMpLmZvckVhY2goa2V5ID0+IHtcbiAgICBjb25zdCBzbG90ID0gQXJyYXkuaXNBcnJheShzbG90c1trZXldKSA/IHNsb3RzW2tleV0gOiBbc2xvdHNba2V5XV1cbiAgICBzbG90LmZvckVhY2goc2xvdFZhbHVlID0+IHtcbiAgICAgIGlmIChjb21wb25lbnROZWVkc0NvbXBpbGluZyhzbG90VmFsdWUpKSB7XG4gICAgICAgIGNvbXBpbGVUZW1wbGF0ZShzbG90VmFsdWUpXG4gICAgICB9XG4gICAgfSlcbiAgfSlcbn1cbiIsIi8vIEBmbG93XG5cbmNvbnN0IE1PVU5USU5HX09QVElPTlMgPSBbXG4gICdhdHRhY2hUb0RvY3VtZW50JyxcbiAgJ21vY2tzJyxcbiAgJ3Nsb3RzJyxcbiAgJ2xvY2FsVnVlJyxcbiAgJ3N0dWJzJyxcbiAgJ2NvbnRleHQnLFxuICAnY2xvbmUnLFxuICAnYXR0cnMnLFxuICAnbGlzdGVuZXJzJyxcbiAgJ3Byb3BzRGF0YScsXG4gICdzaG91bGRQcm94eSdcbl1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZXh0cmFjdEluc3RhbmNlT3B0aW9ucyhvcHRpb25zOiBPYmplY3QpOiBPYmplY3Qge1xuICBjb25zdCBpbnN0YW5jZU9wdGlvbnMgPSB7XG4gICAgLi4ub3B0aW9uc1xuICB9XG4gIE1PVU5USU5HX09QVElPTlMuZm9yRWFjaChtb3VudGluZ09wdGlvbiA9PiB7XG4gICAgZGVsZXRlIGluc3RhbmNlT3B0aW9uc1ttb3VudGluZ09wdGlvbl1cbiAgfSlcbiAgcmV0dXJuIGluc3RhbmNlT3B0aW9uc1xufVxuIiwiLy8gQGZsb3dcblxuaW1wb3J0IHsgY29tcGlsZVRvRnVuY3Rpb25zIH0gZnJvbSAndnVlLXRlbXBsYXRlLWNvbXBpbGVyJ1xuaW1wb3J0IHsgdGhyb3dFcnJvciB9IGZyb20gJ3NoYXJlZC91dGlsJ1xuaW1wb3J0IHsgVlVFX1ZFUlNJT04gfSBmcm9tICdzaGFyZWQvY29uc3RzJ1xuXG5mdW5jdGlvbiBpc0Rlc3RydWN0dXJpbmdTbG90U2NvcGUoc2xvdFNjb3BlOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIHNsb3RTY29wZVswXSA9PT0gJ3snICYmIHNsb3RTY29wZVtzbG90U2NvcGUubGVuZ3RoIC0gMV0gPT09ICd9J1xufVxuXG5mdW5jdGlvbiBnZXRWdWVUZW1wbGF0ZUNvbXBpbGVySGVscGVycyhcbiAgX1Z1ZTogQ29tcG9uZW50XG4pOiB7IFtuYW1lOiBzdHJpbmddOiBGdW5jdGlvbiB9IHtcbiAgLy8gJEZsb3dJZ25vcmVcbiAgY29uc3QgdnVlID0gbmV3IF9WdWUoKVxuICBjb25zdCBoZWxwZXJzID0ge31cbiAgY29uc3QgbmFtZXMgPSBbXG4gICAgJ19jJyxcbiAgICAnX28nLFxuICAgICdfbicsXG4gICAgJ19zJyxcbiAgICAnX2wnLFxuICAgICdfdCcsXG4gICAgJ19xJyxcbiAgICAnX2knLFxuICAgICdfbScsXG4gICAgJ19mJyxcbiAgICAnX2snLFxuICAgICdfYicsXG4gICAgJ192JyxcbiAgICAnX2UnLFxuICAgICdfdScsXG4gICAgJ19nJ1xuICBdXG4gIG5hbWVzLmZvckVhY2gobmFtZSA9PiB7XG4gICAgaGVscGVyc1tuYW1lXSA9IHZ1ZS5fcmVuZGVyUHJveHlbbmFtZV1cbiAgfSlcbiAgaGVscGVycy4kY3JlYXRlRWxlbWVudCA9IHZ1ZS5fcmVuZGVyUHJveHkuJGNyZWF0ZUVsZW1lbnRcbiAgcmV0dXJuIGhlbHBlcnNcbn1cblxuZnVuY3Rpb24gdmFsaWRhdGVFbnZpcm9ubWVudCgpOiB2b2lkIHtcbiAgaWYgKFZVRV9WRVJTSU9OIDwgMi4xKSB7XG4gICAgdGhyb3dFcnJvcihgdGhlIHNjb3BlZFNsb3RzIG9wdGlvbiBpcyBvbmx5IHN1cHBvcnRlZCBpbiB2dWVAMi4xKy5gKVxuICB9XG59XG5cbmNvbnN0IHNsb3RTY29wZVJlID0gLzxbXj5dKyBzbG90LXNjb3BlPVxcXCIoLispXFxcIi9cblxuLy8gSGlkZSB3YXJuaW5nIGFib3V0IDx0ZW1wbGF0ZT4gZGlzYWxsb3dlZCBhcyByb290IGVsZW1lbnRcbmZ1bmN0aW9uIGN1c3RvbVdhcm4obXNnKSB7XG4gIGlmIChtc2cuaW5kZXhPZignQ2Fubm90IHVzZSA8dGVtcGxhdGU+IGFzIGNvbXBvbmVudCByb290IGVsZW1lbnQnKSA9PT0gLTEpIHtcbiAgICBjb25zb2xlLmVycm9yKG1zZylcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjcmVhdGVTY29wZWRTbG90cyhcbiAgc2NvcGVkU2xvdHNPcHRpb246ID97IFtzbG90TmFtZTogc3RyaW5nXTogc3RyaW5nIHwgRnVuY3Rpb24gfSxcbiAgX1Z1ZTogQ29tcG9uZW50XG4pOiB7XG4gIFtzbG90TmFtZTogc3RyaW5nXTogKHByb3BzOiBPYmplY3QpID0+IFZOb2RlIHwgQXJyYXk8Vk5vZGU+XG59IHtcbiAgY29uc3Qgc2NvcGVkU2xvdHMgPSB7fVxuICBpZiAoIXNjb3BlZFNsb3RzT3B0aW9uKSB7XG4gICAgcmV0dXJuIHNjb3BlZFNsb3RzXG4gIH1cbiAgdmFsaWRhdGVFbnZpcm9ubWVudCgpXG4gIGNvbnN0IGhlbHBlcnMgPSBnZXRWdWVUZW1wbGF0ZUNvbXBpbGVySGVscGVycyhfVnVlKVxuICBmb3IgKGNvbnN0IHNjb3BlZFNsb3ROYW1lIGluIHNjb3BlZFNsb3RzT3B0aW9uKSB7XG4gICAgY29uc3Qgc2xvdCA9IHNjb3BlZFNsb3RzT3B0aW9uW3Njb3BlZFNsb3ROYW1lXVxuICAgIGNvbnN0IGlzRm4gPSB0eXBlb2Ygc2xvdCA9PT0gJ2Z1bmN0aW9uJ1xuICAgIC8vIFR5cGUgY2hlY2sgdG8gc2lsZW5jZSBmbG93IChjYW4ndCB1c2UgaXNGbilcbiAgICBjb25zdCByZW5kZXJGbiA9XG4gICAgICB0eXBlb2Ygc2xvdCA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICA/IHNsb3RcbiAgICAgICAgOiBjb21waWxlVG9GdW5jdGlvbnMoc2xvdCwgeyB3YXJuOiBjdXN0b21XYXJuIH0pLnJlbmRlclxuXG4gICAgY29uc3QgaGFzU2xvdFNjb3BlQXR0ciA9ICFpc0ZuICYmIHNsb3QubWF0Y2goc2xvdFNjb3BlUmUpXG4gICAgY29uc3Qgc2xvdFNjb3BlID0gaGFzU2xvdFNjb3BlQXR0ciAmJiBoYXNTbG90U2NvcGVBdHRyWzFdXG4gICAgc2NvcGVkU2xvdHNbc2NvcGVkU2xvdE5hbWVdID0gZnVuY3Rpb24ocHJvcHMpIHtcbiAgICAgIGxldCByZXNcbiAgICAgIGlmIChpc0ZuKSB7XG4gICAgICAgIHJlcyA9IHJlbmRlckZuLmNhbGwoeyAuLi5oZWxwZXJzIH0sIHByb3BzKVxuICAgICAgfSBlbHNlIGlmIChzbG90U2NvcGUgJiYgIWlzRGVzdHJ1Y3R1cmluZ1Nsb3RTY29wZShzbG90U2NvcGUpKSB7XG4gICAgICAgIHJlcyA9IHJlbmRlckZuLmNhbGwoeyAuLi5oZWxwZXJzLCBbc2xvdFNjb3BlXTogcHJvcHMgfSlcbiAgICAgIH0gZWxzZSBpZiAoc2xvdFNjb3BlICYmIGlzRGVzdHJ1Y3R1cmluZ1Nsb3RTY29wZShzbG90U2NvcGUpKSB7XG4gICAgICAgIHJlcyA9IHJlbmRlckZuLmNhbGwoeyAuLi5oZWxwZXJzLCAuLi5wcm9wcyB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzID0gcmVuZGVyRm4uY2FsbCh7IC4uLmhlbHBlcnMsIHByb3BzIH0pXG4gICAgICB9XG4gICAgICAvLyByZXMgaXMgQXJyYXkgaWYgPHRlbXBsYXRlPiBpcyBhIHJvb3QgZWxlbWVudFxuICAgICAgcmV0dXJuIEFycmF5LmlzQXJyYXkocmVzKSA/IHJlc1swXSA6IHJlc1xuICAgIH1cbiAgfVxuICByZXR1cm4gc2NvcGVkU2xvdHNcbn1cbiIsIi8vIEBmbG93XG5cbmltcG9ydCBWdWUgZnJvbSAndnVlJ1xuaW1wb3J0IHsgdGhyb3dFcnJvciwgY2FtZWxpemUsIGNhcGl0YWxpemUsIGh5cGhlbmF0ZSB9IGZyb20gJy4uL3NoYXJlZC91dGlsJ1xuaW1wb3J0IHtcbiAgY29tcG9uZW50TmVlZHNDb21waWxpbmcsXG4gIHRlbXBsYXRlQ29udGFpbnNDb21wb25lbnQsXG4gIGlzVnVlQ29tcG9uZW50LFxuICBpc0R5bmFtaWNDb21wb25lbnQsXG4gIGlzQ29uc3RydWN0b3Jcbn0gZnJvbSAnLi4vc2hhcmVkL3ZhbGlkYXRvcnMnXG5pbXBvcnQgeyBjb21waWxlVGVtcGxhdGUsIGNvbXBpbGVGcm9tU3RyaW5nIH0gZnJvbSAnLi4vc2hhcmVkL2NvbXBpbGUtdGVtcGxhdGUnXG5cbmZ1bmN0aW9uIGlzVnVlQ29tcG9uZW50U3R1Yihjb21wKTogYm9vbGVhbiB7XG4gIHJldHVybiAoY29tcCAmJiBjb21wLnRlbXBsYXRlKSB8fCBpc1Z1ZUNvbXBvbmVudChjb21wKVxufVxuXG5mdW5jdGlvbiBpc1ZhbGlkU3R1YihzdHViOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuIChcbiAgICB0eXBlb2Ygc3R1YiA9PT0gJ2Jvb2xlYW4nIHx8XG4gICAgKCEhc3R1YiAmJiB0eXBlb2Ygc3R1YiA9PT0gJ3N0cmluZycpIHx8XG4gICAgaXNWdWVDb21wb25lbnRTdHViKHN0dWIpXG4gIClcbn1cblxuZnVuY3Rpb24gcmVzb2x2ZUNvbXBvbmVudChvYmo6IE9iamVjdCwgY29tcG9uZW50OiBzdHJpbmcpOiBPYmplY3Qge1xuICByZXR1cm4gKFxuICAgIG9ialtjb21wb25lbnRdIHx8XG4gICAgb2JqW2h5cGhlbmF0ZShjb21wb25lbnQpXSB8fFxuICAgIG9ialtjYW1lbGl6ZShjb21wb25lbnQpXSB8fFxuICAgIG9ialtjYXBpdGFsaXplKGNhbWVsaXplKGNvbXBvbmVudCkpXSB8fFxuICAgIG9ialtjYXBpdGFsaXplKGNvbXBvbmVudCldIHx8XG4gICAge31cbiAgKVxufVxuXG5mdW5jdGlvbiBnZXRDb3JlUHJvcGVydGllcyhjb21wb25lbnRPcHRpb25zOiBDb21wb25lbnQpOiBPYmplY3Qge1xuICByZXR1cm4ge1xuICAgIGF0dHJzOiBjb21wb25lbnRPcHRpb25zLmF0dHJzLFxuICAgIG5hbWU6IGNvbXBvbmVudE9wdGlvbnMubmFtZSxcbiAgICBwcm9wczogY29tcG9uZW50T3B0aW9ucy5wcm9wcyxcbiAgICBvbjogY29tcG9uZW50T3B0aW9ucy5vbixcbiAgICBrZXk6IGNvbXBvbmVudE9wdGlvbnMua2V5LFxuICAgIHJlZjogY29tcG9uZW50T3B0aW9ucy5yZWYsXG4gICAgZG9tUHJvcHM6IGNvbXBvbmVudE9wdGlvbnMuZG9tUHJvcHMsXG4gICAgY2xhc3M6IGNvbXBvbmVudE9wdGlvbnMuY2xhc3MsXG4gICAgc3RhdGljQ2xhc3M6IGNvbXBvbmVudE9wdGlvbnMuc3RhdGljQ2xhc3MsXG4gICAgc3RhdGljU3R5bGU6IGNvbXBvbmVudE9wdGlvbnMuc3RhdGljU3R5bGUsXG4gICAgc3R5bGU6IGNvbXBvbmVudE9wdGlvbnMuc3R5bGUsXG4gICAgbm9ybWFsaXplZFN0eWxlOiBjb21wb25lbnRPcHRpb25zLm5vcm1hbGl6ZWRTdHlsZSxcbiAgICBuYXRpdmVPbjogY29tcG9uZW50T3B0aW9ucy5uYXRpdmVPbixcbiAgICBmdW5jdGlvbmFsOiBjb21wb25lbnRPcHRpb25zLmZ1bmN0aW9uYWxcbiAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVDbGFzc1N0cmluZyhzdGF0aWNDbGFzcywgZHluYW1pY0NsYXNzKSB7XG4gIGlmIChzdGF0aWNDbGFzcyAmJiBkeW5hbWljQ2xhc3MpIHtcbiAgICByZXR1cm4gc3RhdGljQ2xhc3MgKyAnICcgKyBkeW5hbWljQ2xhc3NcbiAgfVxuICByZXR1cm4gc3RhdGljQ2xhc3MgfHwgZHluYW1pY0NsYXNzXG59XG5cbmZ1bmN0aW9uIHJlc29sdmVPcHRpb25zKGNvbXBvbmVudCwgX1Z1ZSkge1xuICBpZiAoaXNEeW5hbWljQ29tcG9uZW50KGNvbXBvbmVudCkpIHtcbiAgICByZXR1cm4ge31cbiAgfVxuXG4gIGlmIChpc0NvbnN0cnVjdG9yKGNvbXBvbmVudCkpIHtcbiAgICByZXR1cm4gY29tcG9uZW50Lm9wdGlvbnNcbiAgfVxuICBjb25zdCBvcHRpb25zID0gX1Z1ZS5leHRlbmQoY29tcG9uZW50KS5vcHRpb25zXG4gIGNvbXBvbmVudC5fQ3RvciA9IHt9XG5cbiAgcmV0dXJuIG9wdGlvbnNcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVN0dWJGcm9tQ29tcG9uZW50KFxuICBvcmlnaW5hbENvbXBvbmVudDogQ29tcG9uZW50LFxuICBuYW1lOiBzdHJpbmcsXG4gIF9WdWU6IENvbXBvbmVudFxuKTogQ29tcG9uZW50IHtcbiAgY29uc3QgY29tcG9uZW50T3B0aW9ucyA9IHJlc29sdmVPcHRpb25zKG9yaWdpbmFsQ29tcG9uZW50LCBfVnVlKVxuICBjb25zdCB0YWdOYW1lID0gYCR7bmFtZSB8fCAnYW5vbnltb3VzJ30tc3R1YmBcblxuICAvLyBpZ25vcmVFbGVtZW50cyBkb2VzIG5vdCBleGlzdCBpbiBWdWUgMi4wLnhcbiAgaWYgKFZ1ZS5jb25maWcuaWdub3JlZEVsZW1lbnRzKSB7XG4gICAgVnVlLmNvbmZpZy5pZ25vcmVkRWxlbWVudHMucHVzaCh0YWdOYW1lKVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICAuLi5nZXRDb3JlUHJvcGVydGllcyhjb21wb25lbnRPcHRpb25zKSxcbiAgICAkX3Z1ZVRlc3RVdGlsc19vcmlnaW5hbDogb3JpZ2luYWxDb21wb25lbnQsXG4gICAgJF9kb05vdFN0dWJDaGlsZHJlbjogdHJ1ZSxcbiAgICByZW5kZXIoaCwgY29udGV4dCkge1xuICAgICAgcmV0dXJuIGgoXG4gICAgICAgIHRhZ05hbWUsXG4gICAgICAgIHtcbiAgICAgICAgICBhdHRyczogY29tcG9uZW50T3B0aW9ucy5mdW5jdGlvbmFsXG4gICAgICAgICAgICA/IHtcbiAgICAgICAgICAgICAgICAuLi5jb250ZXh0LnByb3BzLFxuICAgICAgICAgICAgICAgIC4uLmNvbnRleHQuZGF0YS5hdHRycyxcbiAgICAgICAgICAgICAgICBjbGFzczogY3JlYXRlQ2xhc3NTdHJpbmcoXG4gICAgICAgICAgICAgICAgICBjb250ZXh0LmRhdGEuc3RhdGljQ2xhc3MsXG4gICAgICAgICAgICAgICAgICBjb250ZXh0LmRhdGEuY2xhc3NcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIDoge1xuICAgICAgICAgICAgICAgIC4uLnRoaXMuJHByb3BzXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgY29udGV4dCA/IGNvbnRleHQuY2hpbGRyZW4gOiB0aGlzLiRvcHRpb25zLl9yZW5kZXJDaGlsZHJlblxuICAgICAgKVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVTdHViRnJvbVN0cmluZyhcbiAgdGVtcGxhdGVTdHJpbmc6IHN0cmluZyxcbiAgb3JpZ2luYWxDb21wb25lbnQ6IENvbXBvbmVudCA9IHt9LFxuICBuYW1lOiBzdHJpbmcsXG4gIF9WdWU6IENvbXBvbmVudFxuKTogQ29tcG9uZW50IHtcbiAgaWYgKHRlbXBsYXRlQ29udGFpbnNDb21wb25lbnQodGVtcGxhdGVTdHJpbmcsIG5hbWUpKSB7XG4gICAgdGhyb3dFcnJvcignb3B0aW9ucy5zdHViIGNhbm5vdCBjb250YWluIGEgY2lyY3VsYXIgcmVmZXJlbmNlJylcbiAgfVxuICBjb25zdCBjb21wb25lbnRPcHRpb25zID0gcmVzb2x2ZU9wdGlvbnMob3JpZ2luYWxDb21wb25lbnQsIF9WdWUpXG5cbiAgcmV0dXJuIHtcbiAgICAuLi5nZXRDb3JlUHJvcGVydGllcyhjb21wb25lbnRPcHRpb25zKSxcbiAgICAkX2RvTm90U3R1YkNoaWxkcmVuOiB0cnVlLFxuICAgIC4uLmNvbXBpbGVGcm9tU3RyaW5nKHRlbXBsYXRlU3RyaW5nKVxuICB9XG59XG5cbmZ1bmN0aW9uIHZhbGlkYXRlU3R1YihzdHViKSB7XG4gIGlmICghaXNWYWxpZFN0dWIoc3R1YikpIHtcbiAgICB0aHJvd0Vycm9yKGBvcHRpb25zLnN0dWIgdmFsdWVzIG11c3QgYmUgcGFzc2VkIGEgc3RyaW5nIG9yIGAgKyBgY29tcG9uZW50YClcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU3R1YnNGcm9tU3R1YnNPYmplY3QoXG4gIG9yaWdpbmFsQ29tcG9uZW50czogT2JqZWN0ID0ge30sXG4gIHN0dWJzOiBPYmplY3QsXG4gIF9WdWU6IENvbXBvbmVudFxuKTogQ29tcG9uZW50cyB7XG4gIHJldHVybiBPYmplY3Qua2V5cyhzdHVicyB8fCB7fSkucmVkdWNlKChhY2MsIHN0dWJOYW1lKSA9PiB7XG4gICAgY29uc3Qgc3R1YiA9IHN0dWJzW3N0dWJOYW1lXVxuXG4gICAgdmFsaWRhdGVTdHViKHN0dWIpXG5cbiAgICBpZiAoc3R1YiA9PT0gZmFsc2UpIHtcbiAgICAgIHJldHVybiBhY2NcbiAgICB9XG5cbiAgICBpZiAoc3R1YiA9PT0gdHJ1ZSkge1xuICAgICAgY29uc3QgY29tcG9uZW50ID0gcmVzb2x2ZUNvbXBvbmVudChvcmlnaW5hbENvbXBvbmVudHMsIHN0dWJOYW1lKVxuICAgICAgYWNjW3N0dWJOYW1lXSA9IGNyZWF0ZVN0dWJGcm9tQ29tcG9uZW50KGNvbXBvbmVudCwgc3R1Yk5hbWUsIF9WdWUpXG4gICAgICByZXR1cm4gYWNjXG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBzdHViID09PSAnc3RyaW5nJykge1xuICAgICAgY29uc3QgY29tcG9uZW50ID0gcmVzb2x2ZUNvbXBvbmVudChvcmlnaW5hbENvbXBvbmVudHMsIHN0dWJOYW1lKVxuICAgICAgYWNjW3N0dWJOYW1lXSA9IGNyZWF0ZVN0dWJGcm9tU3RyaW5nKHN0dWIsIGNvbXBvbmVudCwgc3R1Yk5hbWUsIF9WdWUpXG4gICAgICByZXR1cm4gYWNjXG4gICAgfVxuXG4gICAgaWYgKGNvbXBvbmVudE5lZWRzQ29tcGlsaW5nKHN0dWIpKSB7XG4gICAgICBjb21waWxlVGVtcGxhdGUoc3R1YilcbiAgICB9XG5cbiAgICBhY2Nbc3R1Yk5hbWVdID0gc3R1YlxuICAgIHN0dWIuX0N0b3IgPSB7fVxuXG4gICAgcmV0dXJuIGFjY1xuICB9LCB7fSlcbn1cbiIsImltcG9ydCB7IGNyZWF0ZVN0dWJGcm9tQ29tcG9uZW50IH0gZnJvbSAnLi9jcmVhdGUtY29tcG9uZW50LXN0dWJzJ1xuaW1wb3J0IHsgcmVzb2x2ZUNvbXBvbmVudCB9IGZyb20gJ3NoYXJlZC91dGlsJ1xuaW1wb3J0IHtcbiAgaXNSZXNlcnZlZFRhZyxcbiAgaXNDb25zdHJ1Y3RvcixcbiAgaXNEeW5hbWljQ29tcG9uZW50LFxuICBpc0NvbXBvbmVudE9wdGlvbnNcbn0gZnJvbSAnc2hhcmVkL3ZhbGlkYXRvcnMnXG5pbXBvcnQge1xuICBCRUZPUkVfUkVOREVSX0xJRkVDWUNMRV9IT09LLFxuICBDUkVBVEVfRUxFTUVOVF9BTElBU1xufSBmcm9tICdzaGFyZWQvY29uc3RzJ1xuXG5jb25zdCBpc1doaXRlbGlzdGVkID0gKGVsLCB3aGl0ZWxpc3QpID0+IHJlc29sdmVDb21wb25lbnQoZWwsIHdoaXRlbGlzdClcbmNvbnN0IGlzQWxyZWFkeVN0dWJiZWQgPSAoZWwsIHN0dWJzKSA9PiBzdHVicy5oYXMoZWwpXG5cbmZ1bmN0aW9uIHNob3VsZEV4dGVuZChjb21wb25lbnQsIF9WdWUpIHtcbiAgcmV0dXJuIGlzQ29uc3RydWN0b3IoY29tcG9uZW50KSB8fCAoY29tcG9uZW50ICYmIGNvbXBvbmVudC5leHRlbmRzKVxufVxuXG5mdW5jdGlvbiBleHRlbmQoY29tcG9uZW50LCBfVnVlKSB7XG4gIGNvbnN0IGNvbXBvbmVudE9wdGlvbnMgPSBjb21wb25lbnQub3B0aW9ucyA/IGNvbXBvbmVudC5vcHRpb25zIDogY29tcG9uZW50XG4gIGNvbnN0IHN0dWIgPSBfVnVlLmV4dGVuZChjb21wb25lbnRPcHRpb25zKVxuICBjb21wb25lbnRPcHRpb25zLl9DdG9yID0ge31cbiAgc3R1Yi5vcHRpb25zLiRfdnVlVGVzdFV0aWxzX29yaWdpbmFsID0gY29tcG9uZW50XG4gIHN0dWIub3B0aW9ucy5fYmFzZSA9IF9WdWVcbiAgcmV0dXJuIHN0dWJcbn1cblxuZnVuY3Rpb24gY3JlYXRlU3R1YklmTmVlZGVkKHNob3VsZFN0dWIsIGNvbXBvbmVudCwgX1Z1ZSwgZWwpIHtcbiAgaWYgKHNob3VsZFN0dWIpIHtcbiAgICByZXR1cm4gY3JlYXRlU3R1YkZyb21Db21wb25lbnQoY29tcG9uZW50IHx8IHt9LCBlbCwgX1Z1ZSlcbiAgfVxuXG4gIGlmIChzaG91bGRFeHRlbmQoY29tcG9uZW50LCBfVnVlKSkge1xuICAgIHJldHVybiBleHRlbmQoY29tcG9uZW50LCBfVnVlKVxuICB9XG59XG5cbmZ1bmN0aW9uIHNob3VsZE5vdEJlU3R1YmJlZChlbCwgd2hpdGVsaXN0LCBtb2RpZmllZENvbXBvbmVudHMpIHtcbiAgcmV0dXJuIChcbiAgICAodHlwZW9mIGVsID09PSAnc3RyaW5nJyAmJiBpc1Jlc2VydmVkVGFnKGVsKSkgfHxcbiAgICBpc1doaXRlbGlzdGVkKGVsLCB3aGl0ZWxpc3QpIHx8XG4gICAgaXNBbHJlYWR5U3R1YmJlZChlbCwgbW9kaWZpZWRDb21wb25lbnRzKVxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXRjaENyZWF0ZUVsZW1lbnQoX1Z1ZSwgc3R1YnMsIHN0dWJBbGxDb21wb25lbnRzKSB7XG4gIC8vIFRoaXMgbWl4aW4gcGF0Y2hlcyB2bS4kY3JlYXRlRWxlbWVudCBzbyB0aGF0IHdlIGNhbiBzdHViIGFsbCBjb21wb25lbnRzXG4gIC8vIGJlZm9yZSB0aGV5IGFyZSByZW5kZXJlZCBpbiBzaGFsbG93IG1vZGUuIFdlIGFsc28gbmVlZCB0byBlbnN1cmUgdGhhdFxuICAvLyBjb21wb25lbnQgY29uc3RydWN0b3JzIHdlcmUgY3JlYXRlZCBmcm9tIHRoZSBfVnVlIGNvbnN0cnVjdG9yLiBJZiBub3QsXG4gIC8vIHdlIG11c3QgcmVwbGFjZSB0aGVtIHdpdGggY29tcG9uZW50cyBjcmVhdGVkIGZyb20gdGhlIF9WdWUgY29uc3RydWN0b3JcbiAgLy8gYmVmb3JlIGNhbGxpbmcgdGhlIG9yaWdpbmFsICRjcmVhdGVFbGVtZW50LiBUaGlzIGVuc3VyZXMgdGhhdCBjb21wb25lbnRzXG4gIC8vIGhhdmUgdGhlIGNvcnJlY3QgaW5zdGFuY2UgcHJvcGVydGllcyBhbmQgc3R1YnMgd2hlbiB0aGV5IGFyZSByZW5kZXJlZC5cbiAgZnVuY3Rpb24gcGF0Y2hDcmVhdGVFbGVtZW50TWl4aW4oKSB7XG4gICAgY29uc3Qgdm0gPSB0aGlzXG5cbiAgICBpZiAodm0uJG9wdGlvbnMuJF9kb05vdFN0dWJDaGlsZHJlbiB8fCB2bS4kb3B0aW9ucy5faXNGdW5jdGlvbmFsQ29udGFpbmVyKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCBtb2RpZmllZENvbXBvbmVudHMgPSBuZXcgU2V0KClcbiAgICBjb25zdCBvcmlnaW5hbENyZWF0ZUVsZW1lbnQgPSB2bS4kY3JlYXRlRWxlbWVudFxuICAgIGNvbnN0IG9yaWdpbmFsQ29tcG9uZW50cyA9IHZtLiRvcHRpb25zLmNvbXBvbmVudHNcblxuICAgIGNvbnN0IGNyZWF0ZUVsZW1lbnQgPSAoZWwsIC4uLmFyZ3MpID0+IHtcbiAgICAgIGlmIChzaG91bGROb3RCZVN0dWJiZWQoZWwsIHN0dWJzLCBtb2RpZmllZENvbXBvbmVudHMpKSB7XG4gICAgICAgIHJldHVybiBvcmlnaW5hbENyZWF0ZUVsZW1lbnQoZWwsIC4uLmFyZ3MpXG4gICAgICB9XG5cbiAgICAgIGlmIChpc0NvbnN0cnVjdG9yKGVsKSB8fCBpc0NvbXBvbmVudE9wdGlvbnMoZWwpKSB7XG4gICAgICAgIGlmIChzdHViQWxsQ29tcG9uZW50cykge1xuICAgICAgICAgIGNvbnN0IHN0dWIgPSBjcmVhdGVTdHViRnJvbUNvbXBvbmVudChlbCwgZWwubmFtZSB8fCAnYW5vbnltb3VzJywgX1Z1ZSlcbiAgICAgICAgICByZXR1cm4gb3JpZ2luYWxDcmVhdGVFbGVtZW50KHN0dWIsIC4uLmFyZ3MpXG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgQ29uc3RydWN0b3IgPSBzaG91bGRFeHRlbmQoZWwsIF9WdWUpID8gZXh0ZW5kKGVsLCBfVnVlKSA6IGVsXG5cbiAgICAgICAgcmV0dXJuIG9yaWdpbmFsQ3JlYXRlRWxlbWVudChDb25zdHJ1Y3RvciwgLi4uYXJncylcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBlbCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgY29uc3Qgb3JpZ2luYWwgPSByZXNvbHZlQ29tcG9uZW50KGVsLCBvcmlnaW5hbENvbXBvbmVudHMpXG5cbiAgICAgICAgaWYgKCFvcmlnaW5hbCkge1xuICAgICAgICAgIHJldHVybiBvcmlnaW5hbENyZWF0ZUVsZW1lbnQoZWwsIC4uLmFyZ3MpXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaXNEeW5hbWljQ29tcG9uZW50KG9yaWdpbmFsKSkge1xuICAgICAgICAgIHJldHVybiBvcmlnaW5hbENyZWF0ZUVsZW1lbnQoZWwsIC4uLmFyZ3MpXG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzdHViID0gY3JlYXRlU3R1YklmTmVlZGVkKHN0dWJBbGxDb21wb25lbnRzLCBvcmlnaW5hbCwgX1Z1ZSwgZWwpXG5cbiAgICAgICAgaWYgKHN0dWIpIHtcbiAgICAgICAgICBPYmplY3QuYXNzaWduKHZtLiRvcHRpb25zLmNvbXBvbmVudHMsIHtcbiAgICAgICAgICAgIFtlbF06IHN0dWJcbiAgICAgICAgICB9KVxuICAgICAgICAgIG1vZGlmaWVkQ29tcG9uZW50cy5hZGQoZWwpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG9yaWdpbmFsQ3JlYXRlRWxlbWVudChlbCwgLi4uYXJncylcbiAgICB9XG5cbiAgICB2bVtDUkVBVEVfRUxFTUVOVF9BTElBU10gPSBjcmVhdGVFbGVtZW50XG4gICAgdm0uJGNyZWF0ZUVsZW1lbnQgPSBjcmVhdGVFbGVtZW50XG4gIH1cblxuICBfVnVlLm1peGluKHtcbiAgICBbQkVGT1JFX1JFTkRFUl9MSUZFQ1lDTEVfSE9PS106IHBhdGNoQ3JlYXRlRWxlbWVudE1peGluXG4gIH0pXG59XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgeyBjcmVhdGVTbG90Vk5vZGVzIH0gZnJvbSAnLi9jcmVhdGUtc2xvdC12bm9kZXMnXG5pbXBvcnQgYWRkTW9ja3MgZnJvbSAnLi9hZGQtbW9ja3MnXG5pbXBvcnQgeyBhZGRFdmVudExvZ2dlciB9IGZyb20gJy4vbG9nLWV2ZW50cydcbmltcG9ydCB7IGFkZFN0dWJzIH0gZnJvbSAnLi9hZGQtc3R1YnMnXG5pbXBvcnQgeyBjb21waWxlVGVtcGxhdGUgfSBmcm9tICdzaGFyZWQvY29tcGlsZS10ZW1wbGF0ZSdcbmltcG9ydCBleHRyYWN0SW5zdGFuY2VPcHRpb25zIGZyb20gJy4vZXh0cmFjdC1pbnN0YW5jZS1vcHRpb25zJ1xuaW1wb3J0IHsgY29tcG9uZW50TmVlZHNDb21waWxpbmcsIGlzQ29uc3RydWN0b3IgfSBmcm9tICdzaGFyZWQvdmFsaWRhdG9ycydcbmltcG9ydCBjcmVhdGVTY29wZWRTbG90cyBmcm9tICcuL2NyZWF0ZS1zY29wZWQtc2xvdHMnXG5pbXBvcnQgeyBjcmVhdGVTdHVic0Zyb21TdHVic09iamVjdCB9IGZyb20gJy4vY3JlYXRlLWNvbXBvbmVudC1zdHVicydcbmltcG9ydCB7IHBhdGNoQ3JlYXRlRWxlbWVudCB9IGZyb20gJy4vcGF0Y2gtY3JlYXRlLWVsZW1lbnQnXG5cbmZ1bmN0aW9uIGNyZWF0ZUNvbnRleHQob3B0aW9ucywgc2NvcGVkU2xvdHMpIHtcbiAgY29uc3Qgb24gPSB7XG4gICAgLi4uKG9wdGlvbnMuY29udGV4dCAmJiBvcHRpb25zLmNvbnRleHQub24pLFxuICAgIC4uLm9wdGlvbnMubGlzdGVuZXJzXG4gIH1cbiAgcmV0dXJuIHtcbiAgICBhdHRyczoge1xuICAgICAgLi4ub3B0aW9ucy5hdHRycyxcbiAgICAgIC8vIHBhc3MgYXMgYXR0cnMgc28gdGhhdCBpbmhlcml0QXR0cnMgd29ya3MgY29ycmVjdGx5XG4gICAgICAvLyBwcm9wc0RhdGEgc2hvdWxkIHRha2UgcHJlY2VkZW5jZSBvdmVyIGF0dHJzXG4gICAgICAuLi5vcHRpb25zLnByb3BzRGF0YVxuICAgIH0sXG4gICAgLi4uKG9wdGlvbnMuY29udGV4dCB8fCB7fSksXG4gICAgb24sXG4gICAgc2NvcGVkU2xvdHNcbiAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVDaGlsZHJlbih2bSwgaCwgeyBzbG90cywgY29udGV4dCB9KSB7XG4gIGNvbnN0IHNsb3RWTm9kZXMgPSBzbG90cyA/IGNyZWF0ZVNsb3RWTm9kZXModm0sIHNsb3RzKSA6IHVuZGVmaW5lZFxuICByZXR1cm4gKFxuICAgIChjb250ZXh0ICYmXG4gICAgICBjb250ZXh0LmNoaWxkcmVuICYmXG4gICAgICBjb250ZXh0LmNoaWxkcmVuLm1hcCh4ID0+ICh0eXBlb2YgeCA9PT0gJ2Z1bmN0aW9uJyA/IHgoaCkgOiB4KSkpIHx8XG4gICAgc2xvdFZOb2Rlc1xuICApXG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNyZWF0ZUluc3RhbmNlKFxuICBjb21wb25lbnQ6IENvbXBvbmVudCxcbiAgb3B0aW9uczogTm9ybWFsaXplZE9wdGlvbnMsXG4gIF9WdWU6IENvbXBvbmVudFxuKTogQ29tcG9uZW50IHtcbiAgY29uc3QgY29tcG9uZW50T3B0aW9ucyA9IGlzQ29uc3RydWN0b3IoY29tcG9uZW50KVxuICAgID8gY29tcG9uZW50Lm9wdGlvbnNcbiAgICA6IGNvbXBvbmVudFxuXG4gIC8vIGluc3RhbmNlIG9wdGlvbnMgYXJlIG9wdGlvbnMgdGhhdCBhcmUgcGFzc2VkIHRvIHRoZVxuICAvLyByb290IGluc3RhbmNlIHdoZW4gaXQncyBpbnN0YW50aWF0ZWRcbiAgY29uc3QgaW5zdGFuY2VPcHRpb25zID0gZXh0cmFjdEluc3RhbmNlT3B0aW9ucyhvcHRpb25zKVxuXG4gIGNvbnN0IHN0dWJDb21wb25lbnRzT2JqZWN0ID0gY3JlYXRlU3R1YnNGcm9tU3R1YnNPYmplY3QoXG4gICAgY29tcG9uZW50T3B0aW9ucy5jb21wb25lbnRzLFxuICAgIC8vICRGbG93SWdub3JlXG4gICAgb3B0aW9ucy5zdHVicyxcbiAgICBfVnVlXG4gIClcblxuICBhZGRFdmVudExvZ2dlcihfVnVlKVxuICBhZGRNb2NrcyhfVnVlLCBvcHRpb25zLm1vY2tzKVxuICBhZGRTdHVicyhfVnVlLCBzdHViQ29tcG9uZW50c09iamVjdClcbiAgcGF0Y2hDcmVhdGVFbGVtZW50KF9WdWUsIHN0dWJDb21wb25lbnRzT2JqZWN0LCBvcHRpb25zLnNob3VsZFByb3h5KVxuXG4gIGlmIChjb21wb25lbnROZWVkc0NvbXBpbGluZyhjb21wb25lbnRPcHRpb25zKSkge1xuICAgIGNvbXBpbGVUZW1wbGF0ZShjb21wb25lbnRPcHRpb25zKVxuICB9XG5cbiAgLy8gdXNlZCB0byBpZGVudGlmeSBleHRlbmRlZCBjb21wb25lbnQgdXNpbmcgY29uc3RydWN0b3JcbiAgY29tcG9uZW50T3B0aW9ucy4kX3Z1ZVRlc3RVdGlsc19vcmlnaW5hbCA9IGNvbXBvbmVudFxuXG4gIC8vIG1ha2Ugc3VyZSBhbGwgZXh0ZW5kcyBhcmUgYmFzZWQgb24gdGhpcyBpbnN0YW5jZVxuXG4gIGNvbnN0IENvbnN0cnVjdG9yID0gX1Z1ZS5leHRlbmQoY29tcG9uZW50T3B0aW9ucykuZXh0ZW5kKGluc3RhbmNlT3B0aW9ucylcbiAgY29tcG9uZW50T3B0aW9ucy5fQ3RvciA9IHt9XG4gIENvbnN0cnVjdG9yLm9wdGlvbnMuX2Jhc2UgPSBfVnVlXG5cbiAgY29uc3Qgc2NvcGVkU2xvdHMgPSBjcmVhdGVTY29wZWRTbG90cyhvcHRpb25zLnNjb3BlZFNsb3RzLCBfVnVlKVxuXG4gIGNvbnN0IHBhcmVudENvbXBvbmVudE9wdGlvbnMgPSBvcHRpb25zLnBhcmVudENvbXBvbmVudCB8fCB7fVxuXG4gIHBhcmVudENvbXBvbmVudE9wdGlvbnMucHJvdmlkZSA9IG9wdGlvbnMucHJvdmlkZVxuICBwYXJlbnRDb21wb25lbnRPcHRpb25zLiRfZG9Ob3RTdHViQ2hpbGRyZW4gPSB0cnVlXG4gIHBhcmVudENvbXBvbmVudE9wdGlvbnMuX2lzRnVuY3Rpb25hbENvbnRhaW5lciA9IGNvbXBvbmVudE9wdGlvbnMuZnVuY3Rpb25hbFxuICBwYXJlbnRDb21wb25lbnRPcHRpb25zLnJlbmRlciA9IGZ1bmN0aW9uKGgpIHtcbiAgICByZXR1cm4gaChcbiAgICAgIENvbnN0cnVjdG9yLFxuICAgICAgY3JlYXRlQ29udGV4dChvcHRpb25zLCBzY29wZWRTbG90cyksXG4gICAgICBjcmVhdGVDaGlsZHJlbih0aGlzLCBoLCBvcHRpb25zKVxuICAgIClcbiAgfVxuICBjb25zdCBQYXJlbnQgPSBfVnVlLmV4dGVuZChwYXJlbnRDb21wb25lbnRPcHRpb25zKVxuXG4gIHJldHVybiBuZXcgUGFyZW50KClcbn1cbiIsIi8vIEBmbG93XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnQoKTogSFRNTEVsZW1lbnQgfCB2b2lkIHtcbiAgaWYgKGRvY3VtZW50KSB7XG4gICAgY29uc3QgZWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG5cbiAgICBpZiAoZG9jdW1lbnQuYm9keSkge1xuICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChlbGVtKVxuICAgIH1cbiAgICByZXR1cm4gZWxlbVxuICB9XG59XG4iLCIvLyBAZmxvd1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBmaW5kRE9NTm9kZXMoXG4gIGVsZW1lbnQ6IEVsZW1lbnQgfCBudWxsLFxuICBzZWxlY3Rvcjogc3RyaW5nXG4pOiBBcnJheTxWTm9kZT4ge1xuICBjb25zdCBub2RlcyA9IFtdXG4gIGlmICghZWxlbWVudCB8fCAhZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsIHx8ICFlbGVtZW50Lm1hdGNoZXMpIHtcbiAgICByZXR1cm4gbm9kZXNcbiAgfVxuXG4gIGlmIChlbGVtZW50Lm1hdGNoZXMoc2VsZWN0b3IpKSB7XG4gICAgbm9kZXMucHVzaChlbGVtZW50KVxuICB9XG4gIC8vICRGbG93SWdub3JlXG4gIHJldHVybiBub2Rlcy5jb25jYXQoW10uc2xpY2UuY2FsbChlbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpKSlcbn1cbiIsImltcG9ydCB7XG4gIERPTV9TRUxFQ1RPUixcbiAgQ09NUE9ORU5UX1NFTEVDVE9SLFxuICBGVU5DVElPTkFMX09QVElPTlNcbn0gZnJvbSAnc2hhcmVkL2NvbnN0cydcbmltcG9ydCB7IGlzQ29uc3RydWN0b3IgfSBmcm9tICdzaGFyZWQvdmFsaWRhdG9ycydcblxuZXhwb3J0IGZ1bmN0aW9uIHZtTWF0Y2hlc05hbWUodm0sIG5hbWUpIHtcbiAgcmV0dXJuIChcbiAgICAhIW5hbWUgJiYgKHZtLm5hbWUgPT09IG5hbWUgfHwgKHZtLiRvcHRpb25zICYmIHZtLiRvcHRpb25zLm5hbWUgPT09IG5hbWUpKVxuICApXG59XG5cbmZ1bmN0aW9uIHZtQ3Rvck1hdGNoZXModm0sIGNvbXBvbmVudCkge1xuICBpZiAoXG4gICAgKHZtLiRvcHRpb25zICYmIHZtLiRvcHRpb25zLiRfdnVlVGVzdFV0aWxzX29yaWdpbmFsID09PSBjb21wb25lbnQpIHx8XG4gICAgdm0uJF92dWVUZXN0VXRpbHNfb3JpZ2luYWwgPT09IGNvbXBvbmVudFxuICApIHtcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgY29uc3QgQ3RvciA9IGlzQ29uc3RydWN0b3IoY29tcG9uZW50KVxuICAgID8gY29tcG9uZW50Lm9wdGlvbnMuX0N0b3JcbiAgICA6IGNvbXBvbmVudC5fQ3RvclxuXG4gIGlmICghQ3Rvcikge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgaWYgKHZtLmNvbnN0cnVjdG9yLmV4dGVuZE9wdGlvbnMgPT09IGNvbXBvbmVudCkge1xuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICBpZiAoY29tcG9uZW50LmZ1bmN0aW9uYWwpIHtcbiAgICByZXR1cm4gT2JqZWN0LmtleXModm0uX0N0b3IgfHwge30pLnNvbWUoYyA9PiB7XG4gICAgICByZXR1cm4gY29tcG9uZW50ID09PSB2bS5fQ3RvcltjXS5leHRlbmRPcHRpb25zXG4gICAgfSlcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbWF0Y2hlcyhub2RlLCBzZWxlY3Rvcikge1xuICBpZiAoc2VsZWN0b3IudHlwZSA9PT0gRE9NX1NFTEVDVE9SKSB7XG4gICAgY29uc3QgZWxlbWVudCA9IG5vZGUgaW5zdGFuY2VvZiBFbGVtZW50ID8gbm9kZSA6IG5vZGUuZWxtXG4gICAgcmV0dXJuIGVsZW1lbnQgJiYgZWxlbWVudC5tYXRjaGVzICYmIGVsZW1lbnQubWF0Y2hlcyhzZWxlY3Rvci52YWx1ZSlcbiAgfVxuXG4gIGNvbnN0IGlzRnVuY3Rpb25hbFNlbGVjdG9yID0gaXNDb25zdHJ1Y3RvcihzZWxlY3Rvci52YWx1ZSlcbiAgICA/IHNlbGVjdG9yLnZhbHVlLm9wdGlvbnMuZnVuY3Rpb25hbFxuICAgIDogc2VsZWN0b3IudmFsdWUuZnVuY3Rpb25hbFxuXG4gIGNvbnN0IGNvbXBvbmVudEluc3RhbmNlID0gaXNGdW5jdGlvbmFsU2VsZWN0b3JcbiAgICA/IG5vZGVbRlVOQ1RJT05BTF9PUFRJT05TXVxuICAgIDogbm9kZS5jaGlsZFxuXG4gIGlmICghY29tcG9uZW50SW5zdGFuY2UpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIGlmIChzZWxlY3Rvci50eXBlID09PSBDT01QT05FTlRfU0VMRUNUT1IpIHtcbiAgICBpZiAodm1DdG9yTWF0Y2hlcyhjb21wb25lbnRJbnN0YW5jZSwgc2VsZWN0b3IudmFsdWUpKSB7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgfVxuXG4gIC8vIEZhbGxiYWNrIHRvIG5hbWUgc2VsZWN0b3IgZm9yIENPTVBPTkVOVF9TRUxFQ1RPUiBmb3IgVnVlIDwgMi4xXG4gIGNvbnN0IG5hbWVTZWxlY3RvciA9IGlzQ29uc3RydWN0b3Ioc2VsZWN0b3IudmFsdWUpXG4gICAgPyBzZWxlY3Rvci52YWx1ZS5leHRlbmRPcHRpb25zLm5hbWVcbiAgICA6IHNlbGVjdG9yLnZhbHVlLm5hbWVcbiAgcmV0dXJuIHZtTWF0Y2hlc05hbWUoY29tcG9uZW50SW5zdGFuY2UsIG5hbWVTZWxlY3Rvcilcbn1cbiIsIi8vIEBmbG93XG5cbmltcG9ydCBmaW5kRE9NTm9kZXMgZnJvbSAnLi9maW5kLWRvbS1ub2RlcydcbmltcG9ydCB7XG4gIERPTV9TRUxFQ1RPUixcbiAgUkVGX1NFTEVDVE9SLFxuICBDT01QT05FTlRfU0VMRUNUT1IsXG4gIFZVRV9WRVJTSU9OXG59IGZyb20gJ3NoYXJlZC9jb25zdHMnXG5pbXBvcnQgeyB0aHJvd0Vycm9yIH0gZnJvbSAnc2hhcmVkL3V0aWwnXG5pbXBvcnQgeyBtYXRjaGVzIH0gZnJvbSAnLi9tYXRjaGVzJ1xuXG5leHBvcnQgZnVuY3Rpb24gZmluZEFsbEluc3RhbmNlcyhyb290Vm06IGFueSkge1xuICBjb25zdCBpbnN0YW5jZXMgPSBbcm9vdFZtXVxuICBsZXQgaSA9IDBcbiAgd2hpbGUgKGkgPCBpbnN0YW5jZXMubGVuZ3RoKSB7XG4gICAgY29uc3Qgdm0gPSBpbnN0YW5jZXNbaV1cbiAgICA7KHZtLiRjaGlsZHJlbiB8fCBbXSkuZm9yRWFjaChjaGlsZCA9PiB7XG4gICAgICBpbnN0YW5jZXMucHVzaChjaGlsZClcbiAgICB9KVxuICAgIGkrK1xuICB9XG4gIHJldHVybiBpbnN0YW5jZXNcbn1cblxuZnVuY3Rpb24gZmluZEFsbFZOb2Rlcyh2bm9kZTogVk5vZGUsIHNlbGVjdG9yOiBhbnkpOiBBcnJheTxWTm9kZT4ge1xuICBjb25zdCBtYXRjaGluZ05vZGVzID0gW11cbiAgY29uc3Qgbm9kZXMgPSBbdm5vZGVdXG4gIHdoaWxlIChub2Rlcy5sZW5ndGgpIHtcbiAgICBjb25zdCBub2RlID0gbm9kZXMuc2hpZnQoKVxuICAgIGlmIChub2RlLmNoaWxkcmVuKSB7XG4gICAgICBjb25zdCBjaGlsZHJlbiA9IFsuLi5ub2RlLmNoaWxkcmVuXS5yZXZlcnNlKClcbiAgICAgIGNoaWxkcmVuLmZvckVhY2gobiA9PiB7XG4gICAgICAgIG5vZGVzLnVuc2hpZnQobilcbiAgICAgIH0pXG4gICAgfVxuICAgIGlmIChub2RlLmNoaWxkKSB7XG4gICAgICBub2Rlcy51bnNoaWZ0KG5vZGUuY2hpbGQuX3Zub2RlKVxuICAgIH1cbiAgICBpZiAobWF0Y2hlcyhub2RlLCBzZWxlY3RvcikpIHtcbiAgICAgIG1hdGNoaW5nTm9kZXMucHVzaChub2RlKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBtYXRjaGluZ05vZGVzXG59XG5cbmZ1bmN0aW9uIHJlbW92ZUR1cGxpY2F0ZU5vZGVzKHZOb2RlczogQXJyYXk8Vk5vZGU+KTogQXJyYXk8Vk5vZGU+IHtcbiAgY29uc3Qgdk5vZGVFbG1zID0gdk5vZGVzLm1hcCh2Tm9kZSA9PiB2Tm9kZS5lbG0pXG4gIHJldHVybiB2Tm9kZXMuZmlsdGVyKCh2Tm9kZSwgaW5kZXgpID0+IGluZGV4ID09PSB2Tm9kZUVsbXMuaW5kZXhPZih2Tm9kZS5lbG0pKVxufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBmaW5kKFxuICByb290OiBWTm9kZSB8IEVsZW1lbnQsXG4gIHZtPzogQ29tcG9uZW50LFxuICBzZWxlY3RvcjogU2VsZWN0b3Jcbik6IEFycmF5PFZOb2RlIHwgQ29tcG9uZW50PiB7XG4gIGlmIChyb290IGluc3RhbmNlb2YgRWxlbWVudCAmJiBzZWxlY3Rvci50eXBlICE9PSBET01fU0VMRUNUT1IpIHtcbiAgICB0aHJvd0Vycm9yKFxuICAgICAgYGNhbm5vdCBmaW5kIGEgVnVlIGluc3RhbmNlIG9uIGEgRE9NIG5vZGUuIFRoZSBub2RlIGAgK1xuICAgICAgICBgeW91IGFyZSBjYWxsaW5nIGZpbmQgb24gZG9lcyBub3QgZXhpc3QgaW4gdGhlIGAgK1xuICAgICAgICBgVkRvbS4gQXJlIHlvdSBhZGRpbmcgdGhlIG5vZGUgYXMgaW5uZXJIVE1MP2BcbiAgICApXG4gIH1cblxuICBpZiAoXG4gICAgc2VsZWN0b3IudHlwZSA9PT0gQ09NUE9ORU5UX1NFTEVDVE9SICYmXG4gICAgKHNlbGVjdG9yLnZhbHVlLmZ1bmN0aW9uYWwgfHxcbiAgICAgIChzZWxlY3Rvci52YWx1ZS5vcHRpb25zICYmIHNlbGVjdG9yLnZhbHVlLm9wdGlvbnMuZnVuY3Rpb25hbCkpICYmXG4gICAgVlVFX1ZFUlNJT04gPCAyLjNcbiAgKSB7XG4gICAgdGhyb3dFcnJvcihcbiAgICAgIGBmaW5kIGZvciBmdW5jdGlvbmFsIGNvbXBvbmVudHMgaXMgbm90IHN1cHBvcnRlZCBgICsgYGluIFZ1ZSA8IDIuM2BcbiAgICApXG4gIH1cblxuICBpZiAocm9vdCBpbnN0YW5jZW9mIEVsZW1lbnQpIHtcbiAgICByZXR1cm4gZmluZERPTU5vZGVzKHJvb3QsIHNlbGVjdG9yLnZhbHVlKVxuICB9XG5cbiAgaWYgKCFyb290ICYmIHNlbGVjdG9yLnR5cGUgIT09IERPTV9TRUxFQ1RPUikge1xuICAgIHRocm93RXJyb3IoXG4gICAgICBgY2Fubm90IGZpbmQgYSBWdWUgaW5zdGFuY2Ugb24gYSBET00gbm9kZS4gVGhlIG5vZGUgYCArXG4gICAgICAgIGB5b3UgYXJlIGNhbGxpbmcgZmluZCBvbiBkb2VzIG5vdCBleGlzdCBpbiB0aGUgYCArXG4gICAgICAgIGBWRG9tLiBBcmUgeW91IGFkZGluZyB0aGUgbm9kZSBhcyBpbm5lckhUTUw/YFxuICAgIClcbiAgfVxuXG4gIGlmICghdm0gJiYgc2VsZWN0b3IudHlwZSA9PT0gUkVGX1NFTEVDVE9SKSB7XG4gICAgdGhyb3dFcnJvcihgJHJlZiBzZWxlY3RvcnMgY2FuIG9ubHkgYmUgdXNlZCBvbiBWdWUgY29tcG9uZW50IGAgKyBgd3JhcHBlcnNgKVxuICB9XG5cbiAgaWYgKHZtICYmIHZtLiRyZWZzICYmIHNlbGVjdG9yLnZhbHVlLnJlZiBpbiB2bS4kcmVmcykge1xuICAgIGNvbnN0IHJlZnMgPSB2bS4kcmVmc1tzZWxlY3Rvci52YWx1ZS5yZWZdXG4gICAgcmV0dXJuIEFycmF5LmlzQXJyYXkocmVmcykgPyByZWZzIDogW3JlZnNdXG4gIH1cblxuICBjb25zdCBub2RlcyA9IGZpbmRBbGxWTm9kZXMocm9vdCwgc2VsZWN0b3IpXG4gIGNvbnN0IGRlZHVwZWROb2RlcyA9IHJlbW92ZUR1cGxpY2F0ZU5vZGVzKG5vZGVzKVxuXG4gIGlmIChub2Rlcy5sZW5ndGggPiAwIHx8IHNlbGVjdG9yLnR5cGUgIT09IERPTV9TRUxFQ1RPUikge1xuICAgIHJldHVybiBkZWR1cGVkTm9kZXNcbiAgfVxuXG4gIC8vIEZhbGxiYWNrIGluIGNhc2UgZWxlbWVudCBleGlzdHMgaW4gSFRNTCwgYnV0IG5vdCBpbiB2bm9kZSB0cmVlXG4gIC8vIChlLmcuIGlmIGlubmVySFRNTCBpcyBzZXQgYXMgYSBkb21Qcm9wKVxuICByZXR1cm4gZmluZERPTU5vZGVzKHJvb3QuZWxtLCBzZWxlY3Rvci52YWx1ZSlcbn1cbiIsImltcG9ydCB7IHdhcm4gfSBmcm9tICdzaGFyZWQvdXRpbCdcbmltcG9ydCB7IGZpbmRBbGxJbnN0YW5jZXMgfSBmcm9tICcuL2ZpbmQnXG5cbmZ1bmN0aW9uIGVycm9ySGFuZGxlcihlcnJvck9yU3RyaW5nLCB2bSkge1xuICBjb25zdCBlcnJvciA9XG4gICAgdHlwZW9mIGVycm9yT3JTdHJpbmcgPT09ICdvYmplY3QnID8gZXJyb3JPclN0cmluZyA6IG5ldyBFcnJvcihlcnJvck9yU3RyaW5nKVxuXG4gIHZtLl9lcnJvciA9IGVycm9yXG4gIHRocm93IGVycm9yXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0aHJvd0lmSW5zdGFuY2VzVGhyZXcodm0pIHtcbiAgY29uc3QgaW5zdGFuY2VzV2l0aEVycm9yID0gZmluZEFsbEluc3RhbmNlcyh2bSkuZmlsdGVyKF92bSA9PiBfdm0uX2Vycm9yKVxuXG4gIGlmIChpbnN0YW5jZXNXaXRoRXJyb3IubGVuZ3RoID4gMCkge1xuICAgIHRocm93IGluc3RhbmNlc1dpdGhFcnJvclswXS5fZXJyb3JcbiAgfVxufVxuXG5sZXQgaGFzV2FybmVkID0gZmFsc2VcblxuLy8gVnVlIHN3YWxsb3dzIGVycm9ycyB0aHJvd24gYnkgaW5zdGFuY2VzLCBldmVuIGlmIHRoZSBnbG9iYWwgZXJyb3IgaGFuZGxlclxuLy8gdGhyb3dzLiBJbiBvcmRlciB0byB0aHJvdyBpbiB0aGUgdGVzdCwgd2UgYWRkIGFuIF9lcnJvciBwcm9wZXJ0eSB0byBhblxuLy8gaW5zdGFuY2Ugd2hlbiBpdCB0aHJvd3MuIFRoZW4gd2UgbG9vcCB0aHJvdWdoIHRoZSBpbnN0YW5jZXMgd2l0aFxuLy8gdGhyb3dJZkluc3RhbmNlc1RocmV3IGFuZCB0aHJvdyBhbiBlcnJvciBpbiB0aGUgdGVzdCBjb250ZXh0IGlmIGFueVxuLy8gaW5zdGFuY2VzIHRocmV3LlxuZXhwb3J0IGZ1bmN0aW9uIGFkZEdsb2JhbEVycm9ySGFuZGxlcihfVnVlKSB7XG4gIGNvbnN0IGV4aXN0aW5nRXJyb3JIYW5kbGVyID0gX1Z1ZS5jb25maWcuZXJyb3JIYW5kbGVyXG5cbiAgaWYgKGV4aXN0aW5nRXJyb3JIYW5kbGVyID09PSBlcnJvckhhbmRsZXIpIHtcbiAgICByZXR1cm5cbiAgfVxuXG4gIGlmIChfVnVlLmNvbmZpZy5lcnJvckhhbmRsZXIgJiYgIWhhc1dhcm5lZCkge1xuICAgIHdhcm4oXG4gICAgICBgR2xvYmFsIGVycm9yIGhhbmRsZXIgZGV0ZWN0ZWQgKFZ1ZS5jb25maWcuZXJyb3JIYW5kbGVyKS4gXFxuYCArXG4gICAgICAgIGBWdWUgVGVzdCBVdGlscyBzZXRzIGEgY3VzdG9tIGVycm9yIGhhbmRsZXIgdG8gdGhyb3cgZXJyb3JzIGAgK1xuICAgICAgICBgdGhyb3duIGJ5IGluc3RhbmNlcy4gSWYgeW91IHdhbnQgdGhpcyBiZWhhdmlvciBpbiBgICtcbiAgICAgICAgYHlvdXIgdGVzdHMsIHlvdSBtdXN0IHJlbW92ZSB0aGUgZ2xvYmFsIGVycm9yIGhhbmRsZXIuYFxuICAgIClcbiAgICBoYXNXYXJuZWQgPSB0cnVlXG4gIH0gZWxzZSB7XG4gICAgX1Z1ZS5jb25maWcuZXJyb3JIYW5kbGVyID0gZXJyb3JIYW5kbGVyXG4gIH1cbn1cbiIsImltcG9ydCB7IGlzUGxhaW5PYmplY3QgfSBmcm9tICcuL3ZhbGlkYXRvcnMnXG5pbXBvcnQgeyB0aHJvd0Vycm9yIH0gZnJvbSAnLi91dGlsJ1xuaW1wb3J0IHsgVlVFX1ZFUlNJT04gfSBmcm9tICcuL2NvbnN0cydcblxuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZVN0dWJzKHN0dWJzID0ge30pIHtcbiAgaWYgKHN0dWJzID09PSBmYWxzZSkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG4gIGlmIChpc1BsYWluT2JqZWN0KHN0dWJzKSkge1xuICAgIHJldHVybiBzdHVic1xuICB9XG4gIGlmIChBcnJheS5pc0FycmF5KHN0dWJzKSkge1xuICAgIHJldHVybiBzdHVicy5yZWR1Y2UoKGFjYywgc3R1YikgPT4ge1xuICAgICAgaWYgKHR5cGVvZiBzdHViICE9PSAnc3RyaW5nJykge1xuICAgICAgICB0aHJvd0Vycm9yKCdlYWNoIGl0ZW0gaW4gYW4gb3B0aW9ucy5zdHVicyBhcnJheSBtdXN0IGJlIGEgc3RyaW5nJylcbiAgICAgIH1cbiAgICAgIGFjY1tzdHViXSA9IHRydWVcbiAgICAgIHJldHVybiBhY2NcbiAgICB9LCB7fSlcbiAgfVxuICB0aHJvd0Vycm9yKCdvcHRpb25zLnN0dWJzIG11c3QgYmUgYW4gb2JqZWN0IG9yIGFuIEFycmF5Jylcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZVByb3ZpZGUocHJvdmlkZSkge1xuICAvLyBPYmplY3RzIGFyZSBub3QgcmVzb2x2ZWQgaW4gZXh0ZW5kZWQgY29tcG9uZW50cyBpbiBWdWUgPCAyLjVcbiAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3Z1ZWpzL3Z1ZS9pc3N1ZXMvNjQzNlxuICBpZiAodHlwZW9mIHByb3ZpZGUgPT09ICdvYmplY3QnICYmIFZVRV9WRVJTSU9OIDwgMi41KSB7XG4gICAgY29uc3Qgb2JqID0geyAuLi5wcm92aWRlIH1cbiAgICByZXR1cm4gKCkgPT4gb2JqXG4gIH1cbiAgcmV0dXJuIHByb3ZpZGVcbn1cbiIsIi8vIEBmbG93XG5pbXBvcnQgeyBub3JtYWxpemVTdHVicywgbm9ybWFsaXplUHJvdmlkZSB9IGZyb20gJy4vbm9ybWFsaXplJ1xuXG5mdW5jdGlvbiBnZXRPcHRpb24ob3B0aW9uLCBjb25maWc/OiBPYmplY3QpOiBhbnkge1xuICBpZiAob3B0aW9uID09PSBmYWxzZSkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG4gIGlmIChvcHRpb24gfHwgKGNvbmZpZyAmJiBPYmplY3Qua2V5cyhjb25maWcpLmxlbmd0aCA+IDApKSB7XG4gICAgaWYgKG9wdGlvbiBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB7XG4gICAgICByZXR1cm4gb3B0aW9uXG4gICAgfVxuICAgIGlmIChjb25maWcgaW5zdGFuY2VvZiBGdW5jdGlvbikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDb25maWcgY2FuJ3QgYmUgYSBGdW5jdGlvbi5gKVxuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgLi4uY29uZmlnLFxuICAgICAgLi4ub3B0aW9uXG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGdldFN0dWJzKHN0dWJzLCBjb25maWdTdHVicyk6IE9iamVjdCB7XG4gIGNvbnN0IG5vcm1hbGl6ZWRTdHVicyA9IG5vcm1hbGl6ZVN0dWJzKHN0dWJzKVxuICBjb25zdCBub3JtYWxpemVkQ29uZmlnU3R1YnMgPSBub3JtYWxpemVTdHVicyhjb25maWdTdHVicylcbiAgcmV0dXJuIGdldE9wdGlvbihub3JtYWxpemVkU3R1YnMsIG5vcm1hbGl6ZWRDb25maWdTdHVicylcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1lcmdlT3B0aW9ucyhcbiAgb3B0aW9uczogT3B0aW9ucyxcbiAgY29uZmlnOiBDb25maWdcbik6IE5vcm1hbGl6ZWRPcHRpb25zIHtcbiAgY29uc3QgbW9ja3MgPSAoZ2V0T3B0aW9uKG9wdGlvbnMubW9ja3MsIGNvbmZpZy5tb2Nrcyk6IE9iamVjdClcbiAgY29uc3QgbWV0aG9kcyA9IChnZXRPcHRpb24ob3B0aW9ucy5tZXRob2RzLCBjb25maWcubWV0aG9kcyk6IHtcbiAgICBba2V5OiBzdHJpbmddOiBGdW5jdGlvblxuICB9KVxuICBjb25zdCBwcm92aWRlID0gKGdldE9wdGlvbihvcHRpb25zLnByb3ZpZGUsIGNvbmZpZy5wcm92aWRlKTogT2JqZWN0KVxuICBjb25zdCBzdHVicyA9IChnZXRTdHVicyhvcHRpb25zLnN0dWJzLCBjb25maWcuc3R1YnMpOiBPYmplY3QpXG4gIC8vICRGbG93SWdub3JlXG4gIHJldHVybiB7XG4gICAgLi4ub3B0aW9ucyxcbiAgICBwcm92aWRlOiBub3JtYWxpemVQcm92aWRlKHByb3ZpZGUpLFxuICAgIHN0dWJzLFxuICAgIG1vY2tzLFxuICAgIG1ldGhvZHNcbiAgfVxufVxuIiwiZXhwb3J0IGRlZmF1bHQge1xuICBzdHViczoge30sXG4gIG1vY2tzOiB7fSxcbiAgbWV0aG9kczoge30sXG4gIHByb3ZpZGU6IHt9LFxuICBzaWxlbnQ6IHRydWVcbn1cbiIsIi8vIEBmbG93XG5cbmltcG9ydCB7IHRocm93RXJyb3IgfSBmcm9tICdzaGFyZWQvdXRpbCdcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gd2FybklmTm9XaW5kb3coKTogdm9pZCB7XG4gIGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJykge1xuICAgIHRocm93RXJyb3IoXG4gICAgICBgd2luZG93IGlzIHVuZGVmaW5lZCwgdnVlLXRlc3QtdXRpbHMgbmVlZHMgdG8gYmUgYCArXG4gICAgICAgIGBydW4gaW4gYSBicm93c2VyIGVudmlyb25tZW50LiBcXG5gICtcbiAgICAgICAgYFlvdSBjYW4gcnVuIHRoZSB0ZXN0cyBpbiBub2RlIHVzaW5nIGpzZG9tIFxcbmAgK1xuICAgICAgICBgU2VlIGh0dHBzOi8vdnVlLXRlc3QtdXRpbHMudnVlanMub3JnL2d1aWRlcy8jYnJvd3Nlci1lbnZpcm9ubWVudCBgICtcbiAgICAgICAgYGZvciBtb3JlIGRldGFpbHMuYFxuICAgIClcbiAgfVxufVxuIiwiLy8gQGZsb3dcblxuaW1wb3J0IHtcbiAgaXNEb21TZWxlY3RvcixcbiAgaXNOYW1lU2VsZWN0b3IsXG4gIGlzUmVmU2VsZWN0b3IsXG4gIGlzVnVlQ29tcG9uZW50XG59IGZyb20gJ3NoYXJlZC92YWxpZGF0b3JzJ1xuaW1wb3J0IHsgdGhyb3dFcnJvciB9IGZyb20gJ3NoYXJlZC91dGlsJ1xuaW1wb3J0IHtcbiAgUkVGX1NFTEVDVE9SLFxuICBDT01QT05FTlRfU0VMRUNUT1IsXG4gIE5BTUVfU0VMRUNUT1IsXG4gIERPTV9TRUxFQ1RPUixcbiAgSU5WQUxJRF9TRUxFQ1RPUlxufSBmcm9tICdzaGFyZWQvY29uc3RzJ1xuXG5mdW5jdGlvbiBnZXRTZWxlY3RvclR5cGUoc2VsZWN0b3I6IFNlbGVjdG9yKTogc3RyaW5nIHtcbiAgaWYgKGlzRG9tU2VsZWN0b3Ioc2VsZWN0b3IpKSByZXR1cm4gRE9NX1NFTEVDVE9SXG4gIGlmIChpc1Z1ZUNvbXBvbmVudChzZWxlY3RvcikpIHJldHVybiBDT01QT05FTlRfU0VMRUNUT1JcbiAgaWYgKGlzTmFtZVNlbGVjdG9yKHNlbGVjdG9yKSkgcmV0dXJuIE5BTUVfU0VMRUNUT1JcbiAgaWYgKGlzUmVmU2VsZWN0b3Ioc2VsZWN0b3IpKSByZXR1cm4gUkVGX1NFTEVDVE9SXG5cbiAgcmV0dXJuIElOVkFMSURfU0VMRUNUT1Jcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZ2V0U2VsZWN0b3IoXG4gIHNlbGVjdG9yOiBTZWxlY3RvcixcbiAgbWV0aG9kTmFtZTogc3RyaW5nXG4pOiBPYmplY3Qge1xuICBjb25zdCB0eXBlID0gZ2V0U2VsZWN0b3JUeXBlKHNlbGVjdG9yKVxuICBpZiAodHlwZSA9PT0gSU5WQUxJRF9TRUxFQ1RPUikge1xuICAgIHRocm93RXJyb3IoXG4gICAgICBgd3JhcHBlci4ke21ldGhvZE5hbWV9KCkgbXVzdCBiZSBwYXNzZWQgYSB2YWxpZCBDU1Mgc2VsZWN0b3IsIFZ1ZSBgICtcbiAgICAgICAgYGNvbnN0cnVjdG9yLCBvciB2YWxpZCBmaW5kIG9wdGlvbiBvYmplY3RgXG4gICAgKVxuICB9XG4gIHJldHVybiB7XG4gICAgdHlwZSxcbiAgICB2YWx1ZTogc2VsZWN0b3JcbiAgfVxufVxuIiwiLy8gQGZsb3dcblxuaW1wb3J0IHR5cGUgV3JhcHBlciBmcm9tICcuL3dyYXBwZXInXG5pbXBvcnQgdHlwZSBWdWVXcmFwcGVyIGZyb20gJy4vdnVlLXdyYXBwZXInXG5pbXBvcnQgeyB0aHJvd0Vycm9yIH0gZnJvbSAnc2hhcmVkL3V0aWwnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFdyYXBwZXJBcnJheSBpbXBsZW1lbnRzIEJhc2VXcmFwcGVyIHtcbiAgK3dyYXBwZXJzOiBBcnJheTxXcmFwcGVyIHwgVnVlV3JhcHBlcj5cbiAgK2xlbmd0aDogbnVtYmVyXG5cbiAgY29uc3RydWN0b3Iod3JhcHBlcnM6IEFycmF5PFdyYXBwZXIgfCBWdWVXcmFwcGVyPikge1xuICAgIGNvbnN0IGxlbmd0aCA9IHdyYXBwZXJzLmxlbmd0aFxuICAgIC8vICRGbG93SWdub3JlXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICd3cmFwcGVycycsIHtcbiAgICAgIGdldDogKCkgPT4gd3JhcHBlcnMsXG4gICAgICBzZXQ6ICgpID0+IHRocm93RXJyb3IoJ3dyYXBwZXJBcnJheS53cmFwcGVycyBpcyByZWFkLW9ubHknKVxuICAgIH0pXG4gICAgLy8gJEZsb3dJZ25vcmVcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2xlbmd0aCcsIHtcbiAgICAgIGdldDogKCkgPT4gbGVuZ3RoLFxuICAgICAgc2V0OiAoKSA9PiB0aHJvd0Vycm9yKCd3cmFwcGVyQXJyYXkubGVuZ3RoIGlzIHJlYWQtb25seScpXG4gICAgfSlcbiAgfVxuXG4gIGF0KGluZGV4OiBudW1iZXIpOiBXcmFwcGVyIHwgVnVlV3JhcHBlciB7XG4gICAgaWYgKGluZGV4ID4gdGhpcy5sZW5ndGggLSAxKSB7XG4gICAgICB0aHJvd0Vycm9yKGBubyBpdGVtIGV4aXN0cyBhdCAke2luZGV4fWApXG4gICAgfVxuICAgIHJldHVybiB0aGlzLndyYXBwZXJzW2luZGV4XVxuICB9XG5cbiAgYXR0cmlidXRlcygpOiB2b2lkIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgnYXR0cmlidXRlcycpXG5cbiAgICB0aHJvd0Vycm9yKFxuICAgICAgYGF0dHJpYnV0ZXMgbXVzdCBiZSBjYWxsZWQgb24gYSBzaW5nbGUgd3JhcHBlciwgdXNlIGAgK1xuICAgICAgICBgYXQoaSkgdG8gYWNjZXNzIGEgd3JhcHBlcmBcbiAgICApXG4gIH1cblxuICBjbGFzc2VzKCk6IHZvaWQge1xuICAgIHRoaXMudGhyb3dFcnJvcklmV3JhcHBlcnNJc0VtcHR5KCdjbGFzc2VzJylcblxuICAgIHRocm93RXJyb3IoXG4gICAgICBgY2xhc3NlcyBtdXN0IGJlIGNhbGxlZCBvbiBhIHNpbmdsZSB3cmFwcGVyLCB1c2UgYCArXG4gICAgICAgIGBhdChpKSB0byBhY2Nlc3MgYSB3cmFwcGVyYFxuICAgIClcbiAgfVxuXG4gIGNvbnRhaW5zKHNlbGVjdG9yOiBTZWxlY3Rvcik6IGJvb2xlYW4ge1xuICAgIHRoaXMudGhyb3dFcnJvcklmV3JhcHBlcnNJc0VtcHR5KCdjb250YWlucycpXG5cbiAgICByZXR1cm4gdGhpcy53cmFwcGVycy5ldmVyeSh3cmFwcGVyID0+IHdyYXBwZXIuY29udGFpbnMoc2VsZWN0b3IpKVxuICB9XG5cbiAgZXhpc3RzKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmxlbmd0aCA+IDAgJiYgdGhpcy53cmFwcGVycy5ldmVyeSh3cmFwcGVyID0+IHdyYXBwZXIuZXhpc3RzKCkpXG4gIH1cblxuICBmaWx0ZXIocHJlZGljYXRlOiBGdW5jdGlvbik6IFdyYXBwZXJBcnJheSB7XG4gICAgcmV0dXJuIG5ldyBXcmFwcGVyQXJyYXkodGhpcy53cmFwcGVycy5maWx0ZXIocHJlZGljYXRlKSlcbiAgfVxuXG4gIGVtaXR0ZWQoKTogdm9pZCB7XG4gICAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ2VtaXR0ZWQnKVxuXG4gICAgdGhyb3dFcnJvcihcbiAgICAgIGBlbWl0dGVkIG11c3QgYmUgY2FsbGVkIG9uIGEgc2luZ2xlIHdyYXBwZXIsIHVzZSBgICtcbiAgICAgICAgYGF0KGkpIHRvIGFjY2VzcyBhIHdyYXBwZXJgXG4gICAgKVxuICB9XG5cbiAgZW1pdHRlZEJ5T3JkZXIoKTogdm9pZCB7XG4gICAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ2VtaXR0ZWRCeU9yZGVyJylcblxuICAgIHRocm93RXJyb3IoXG4gICAgICBgZW1pdHRlZEJ5T3JkZXIgbXVzdCBiZSBjYWxsZWQgb24gYSBzaW5nbGUgd3JhcHBlciwgYCArXG4gICAgICAgIGB1c2UgYXQoaSkgdG8gYWNjZXNzIGEgd3JhcHBlcmBcbiAgICApXG4gIH1cblxuICBmaW5kQWxsKCk6IHZvaWQge1xuICAgIHRoaXMudGhyb3dFcnJvcklmV3JhcHBlcnNJc0VtcHR5KCdmaW5kQWxsJylcblxuICAgIHRocm93RXJyb3IoXG4gICAgICBgZmluZEFsbCBtdXN0IGJlIGNhbGxlZCBvbiBhIHNpbmdsZSB3cmFwcGVyLCB1c2UgYCArXG4gICAgICAgIGBhdChpKSB0byBhY2Nlc3MgYSB3cmFwcGVyYFxuICAgIClcbiAgfVxuXG4gIGZpbmQoKTogdm9pZCB7XG4gICAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ2ZpbmQnKVxuXG4gICAgdGhyb3dFcnJvcihcbiAgICAgIGBmaW5kIG11c3QgYmUgY2FsbGVkIG9uIGEgc2luZ2xlIHdyYXBwZXIsIHVzZSBhdChpKSBgICtcbiAgICAgICAgYHRvIGFjY2VzcyBhIHdyYXBwZXJgXG4gICAgKVxuICB9XG5cbiAgaHRtbCgpOiB2b2lkIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgnaHRtbCcpXG5cbiAgICB0aHJvd0Vycm9yKFxuICAgICAgYGh0bWwgbXVzdCBiZSBjYWxsZWQgb24gYSBzaW5nbGUgd3JhcHBlciwgdXNlIGF0KGkpIGAgK1xuICAgICAgICBgdG8gYWNjZXNzIGEgd3JhcHBlcmBcbiAgICApXG4gIH1cblxuICBpcyhzZWxlY3RvcjogU2VsZWN0b3IpOiBib29sZWFuIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgnaXMnKVxuXG4gICAgcmV0dXJuIHRoaXMud3JhcHBlcnMuZXZlcnkod3JhcHBlciA9PiB3cmFwcGVyLmlzKHNlbGVjdG9yKSlcbiAgfVxuXG4gIGlzRW1wdHkoKTogYm9vbGVhbiB7XG4gICAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ2lzRW1wdHknKVxuXG4gICAgcmV0dXJuIHRoaXMud3JhcHBlcnMuZXZlcnkod3JhcHBlciA9PiB3cmFwcGVyLmlzRW1wdHkoKSlcbiAgfVxuXG4gIGlzVmlzaWJsZSgpOiBib29sZWFuIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgnaXNWaXNpYmxlJylcblxuICAgIHJldHVybiB0aGlzLndyYXBwZXJzLmV2ZXJ5KHdyYXBwZXIgPT4gd3JhcHBlci5pc1Zpc2libGUoKSlcbiAgfVxuXG4gIGlzVnVlSW5zdGFuY2UoKTogYm9vbGVhbiB7XG4gICAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ2lzVnVlSW5zdGFuY2UnKVxuXG4gICAgcmV0dXJuIHRoaXMud3JhcHBlcnMuZXZlcnkod3JhcHBlciA9PiB3cmFwcGVyLmlzVnVlSW5zdGFuY2UoKSlcbiAgfVxuXG4gIG5hbWUoKTogdm9pZCB7XG4gICAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ25hbWUnKVxuXG4gICAgdGhyb3dFcnJvcihcbiAgICAgIGBuYW1lIG11c3QgYmUgY2FsbGVkIG9uIGEgc2luZ2xlIHdyYXBwZXIsIHVzZSBhdChpKSBgICtcbiAgICAgICAgYHRvIGFjY2VzcyBhIHdyYXBwZXJgXG4gICAgKVxuICB9XG5cbiAgcHJvcHMoKTogdm9pZCB7XG4gICAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ3Byb3BzJylcblxuICAgIHRocm93RXJyb3IoXG4gICAgICBgcHJvcHMgbXVzdCBiZSBjYWxsZWQgb24gYSBzaW5nbGUgd3JhcHBlciwgdXNlIGAgK1xuICAgICAgICBgYXQoaSkgdG8gYWNjZXNzIGEgd3JhcHBlcmBcbiAgICApXG4gIH1cblxuICB0ZXh0KCk6IHZvaWQge1xuICAgIHRoaXMudGhyb3dFcnJvcklmV3JhcHBlcnNJc0VtcHR5KCd0ZXh0JylcblxuICAgIHRocm93RXJyb3IoXG4gICAgICBgdGV4dCBtdXN0IGJlIGNhbGxlZCBvbiBhIHNpbmdsZSB3cmFwcGVyLCB1c2UgYXQoaSkgYCArXG4gICAgICAgIGB0byBhY2Nlc3MgYSB3cmFwcGVyYFxuICAgIClcbiAgfVxuXG4gIHRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eShtZXRob2Q6IHN0cmluZyk6IHZvaWQge1xuICAgIGlmICh0aGlzLndyYXBwZXJzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhyb3dFcnJvcihgJHttZXRob2R9IGNhbm5vdCBiZSBjYWxsZWQgb24gMCBpdGVtc2ApXG4gICAgfVxuICB9XG5cbiAgc2V0RGF0YShkYXRhOiBPYmplY3QpOiB2b2lkIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgnc2V0RGF0YScpXG5cbiAgICB0aGlzLndyYXBwZXJzLmZvckVhY2god3JhcHBlciA9PiB3cmFwcGVyLnNldERhdGEoZGF0YSkpXG4gIH1cblxuICBzZXRNZXRob2RzKHByb3BzOiBPYmplY3QpOiB2b2lkIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgnc2V0TWV0aG9kcycpXG5cbiAgICB0aGlzLndyYXBwZXJzLmZvckVhY2god3JhcHBlciA9PiB3cmFwcGVyLnNldE1ldGhvZHMocHJvcHMpKVxuICB9XG5cbiAgc2V0UHJvcHMocHJvcHM6IE9iamVjdCk6IHZvaWQge1xuICAgIHRoaXMudGhyb3dFcnJvcklmV3JhcHBlcnNJc0VtcHR5KCdzZXRQcm9wcycpXG5cbiAgICB0aGlzLndyYXBwZXJzLmZvckVhY2god3JhcHBlciA9PiB3cmFwcGVyLnNldFByb3BzKHByb3BzKSlcbiAgfVxuXG4gIHNldFZhbHVlKHZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgnc2V0VmFsdWUnKVxuXG4gICAgdGhpcy53cmFwcGVycy5mb3JFYWNoKHdyYXBwZXIgPT4gd3JhcHBlci5zZXRWYWx1ZSh2YWx1ZSkpXG4gIH1cblxuICBzZXRDaGVja2VkKGNoZWNrZWQ6IGJvb2xlYW4gPSB0cnVlKTogdm9pZCB7XG4gICAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ3NldENoZWNrZWQnKVxuXG4gICAgdGhpcy53cmFwcGVycy5mb3JFYWNoKHdyYXBwZXIgPT4gd3JhcHBlci5zZXRDaGVja2VkKGNoZWNrZWQpKVxuICB9XG5cbiAgc2V0U2VsZWN0ZWQoKTogdm9pZCB7XG4gICAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ3NldFNlbGVjdGVkJylcblxuICAgIHRocm93RXJyb3IoXG4gICAgICBgc2V0U2VsZWN0ZWQgbXVzdCBiZSBjYWxsZWQgb24gYSBzaW5nbGUgd3JhcHBlciwgYCArXG4gICAgICAgIGB1c2UgYXQoaSkgdG8gYWNjZXNzIGEgd3JhcHBlcmBcbiAgICApXG4gIH1cblxuICB0cmlnZ2VyKGV2ZW50OiBzdHJpbmcsIG9wdGlvbnM6IE9iamVjdCk6IHZvaWQge1xuICAgIHRoaXMudGhyb3dFcnJvcklmV3JhcHBlcnNJc0VtcHR5KCd0cmlnZ2VyJylcblxuICAgIHRoaXMud3JhcHBlcnMuZm9yRWFjaCh3cmFwcGVyID0+IHdyYXBwZXIudHJpZ2dlcihldmVudCwgb3B0aW9ucykpXG4gIH1cblxuICBkZXN0cm95KCk6IHZvaWQge1xuICAgIHRoaXMudGhyb3dFcnJvcklmV3JhcHBlcnNJc0VtcHR5KCdkZXN0cm95JylcblxuICAgIHRoaXMud3JhcHBlcnMuZm9yRWFjaCh3cmFwcGVyID0+IHdyYXBwZXIuZGVzdHJveSgpKVxuICB9XG59XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgeyB0aHJvd0Vycm9yIH0gZnJvbSAnc2hhcmVkL3V0aWwnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEVycm9yV3JhcHBlciBpbXBsZW1lbnRzIEJhc2VXcmFwcGVyIHtcbiAgc2VsZWN0b3I6IHN0cmluZ1xuXG4gIGNvbnN0cnVjdG9yKHNlbGVjdG9yOiBzdHJpbmcpIHtcbiAgICB0aGlzLnNlbGVjdG9yID0gc2VsZWN0b3JcbiAgfVxuXG4gIGF0KCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoXG4gICAgICBgZmluZCBkaWQgbm90IHJldHVybiAke3RoaXMuc2VsZWN0b3J9LCBjYW5ub3QgY2FsbCBhdCgpIG9uIGVtcHR5IFdyYXBwZXJgXG4gICAgKVxuICB9XG5cbiAgYXR0cmlidXRlcygpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKFxuICAgICAgYGZpbmQgZGlkIG5vdCByZXR1cm4gJHtcbiAgICAgICAgdGhpcy5zZWxlY3RvclxuICAgICAgfSwgY2Fubm90IGNhbGwgYXR0cmlidXRlcygpIG9uIGVtcHR5IFdyYXBwZXJgXG4gICAgKVxuICB9XG5cbiAgY2xhc3NlcygpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKFxuICAgICAgYGZpbmQgZGlkIG5vdCByZXR1cm4gJHtcbiAgICAgICAgdGhpcy5zZWxlY3RvclxuICAgICAgfSwgY2Fubm90IGNhbGwgY2xhc3NlcygpIG9uIGVtcHR5IFdyYXBwZXJgXG4gICAgKVxuICB9XG5cbiAgY29udGFpbnMoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihcbiAgICAgIGBmaW5kIGRpZCBub3QgcmV0dXJuICR7XG4gICAgICAgIHRoaXMuc2VsZWN0b3JcbiAgICAgIH0sIGNhbm5vdCBjYWxsIGNvbnRhaW5zKCkgb24gZW1wdHkgV3JhcHBlcmBcbiAgICApXG4gIH1cblxuICBlbWl0dGVkKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoXG4gICAgICBgZmluZCBkaWQgbm90IHJldHVybiAke1xuICAgICAgICB0aGlzLnNlbGVjdG9yXG4gICAgICB9LCBjYW5ub3QgY2FsbCBlbWl0dGVkKCkgb24gZW1wdHkgV3JhcHBlcmBcbiAgICApXG4gIH1cblxuICBlbWl0dGVkQnlPcmRlcigpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKFxuICAgICAgYGZpbmQgZGlkIG5vdCByZXR1cm4gJHtcbiAgICAgICAgdGhpcy5zZWxlY3RvclxuICAgICAgfSwgY2Fubm90IGNhbGwgZW1pdHRlZEJ5T3JkZXIoKSBvbiBlbXB0eSBXcmFwcGVyYFxuICAgIClcbiAgfVxuXG4gIGV4aXN0cygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIGZpbHRlcigpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKFxuICAgICAgYGZpbmQgZGlkIG5vdCByZXR1cm4gJHtcbiAgICAgICAgdGhpcy5zZWxlY3RvclxuICAgICAgfSwgY2Fubm90IGNhbGwgZmlsdGVyKCkgb24gZW1wdHkgV3JhcHBlcmBcbiAgICApXG4gIH1cblxuICB2aXNpYmxlKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoXG4gICAgICBgZmluZCBkaWQgbm90IHJldHVybiAke1xuICAgICAgICB0aGlzLnNlbGVjdG9yXG4gICAgICB9LCBjYW5ub3QgY2FsbCB2aXNpYmxlKCkgb24gZW1wdHkgV3JhcHBlcmBcbiAgICApXG4gIH1cblxuICBoYXNBdHRyaWJ1dGUoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihcbiAgICAgIGBmaW5kIGRpZCBub3QgcmV0dXJuICR7XG4gICAgICAgIHRoaXMuc2VsZWN0b3JcbiAgICAgIH0sIGNhbm5vdCBjYWxsIGhhc0F0dHJpYnV0ZSgpIG9uIGVtcHR5IFdyYXBwZXJgXG4gICAgKVxuICB9XG5cbiAgaGFzQ2xhc3MoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihcbiAgICAgIGBmaW5kIGRpZCBub3QgcmV0dXJuICR7XG4gICAgICAgIHRoaXMuc2VsZWN0b3JcbiAgICAgIH0sIGNhbm5vdCBjYWxsIGhhc0NsYXNzKCkgb24gZW1wdHkgV3JhcHBlcmBcbiAgICApXG4gIH1cblxuICBoYXNQcm9wKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoXG4gICAgICBgZmluZCBkaWQgbm90IHJldHVybiAke1xuICAgICAgICB0aGlzLnNlbGVjdG9yXG4gICAgICB9LCBjYW5ub3QgY2FsbCBoYXNQcm9wKCkgb24gZW1wdHkgV3JhcHBlcmBcbiAgICApXG4gIH1cblxuICBoYXNTdHlsZSgpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKFxuICAgICAgYGZpbmQgZGlkIG5vdCByZXR1cm4gJHtcbiAgICAgICAgdGhpcy5zZWxlY3RvclxuICAgICAgfSwgY2Fubm90IGNhbGwgaGFzU3R5bGUoKSBvbiBlbXB0eSBXcmFwcGVyYFxuICAgIClcbiAgfVxuXG4gIGZpbmRBbGwoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihcbiAgICAgIGBmaW5kIGRpZCBub3QgcmV0dXJuICR7XG4gICAgICAgIHRoaXMuc2VsZWN0b3JcbiAgICAgIH0sIGNhbm5vdCBjYWxsIGZpbmRBbGwoKSBvbiBlbXB0eSBXcmFwcGVyYFxuICAgIClcbiAgfVxuXG4gIGZpbmQoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihcbiAgICAgIGBmaW5kIGRpZCBub3QgcmV0dXJuICR7XG4gICAgICAgIHRoaXMuc2VsZWN0b3JcbiAgICAgIH0sIGNhbm5vdCBjYWxsIGZpbmQoKSBvbiBlbXB0eSBXcmFwcGVyYFxuICAgIClcbiAgfVxuXG4gIGh0bWwoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihcbiAgICAgIGBmaW5kIGRpZCBub3QgcmV0dXJuICR7XG4gICAgICAgIHRoaXMuc2VsZWN0b3JcbiAgICAgIH0sIGNhbm5vdCBjYWxsIGh0bWwoKSBvbiBlbXB0eSBXcmFwcGVyYFxuICAgIClcbiAgfVxuXG4gIGlzKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoXG4gICAgICBgZmluZCBkaWQgbm90IHJldHVybiAke3RoaXMuc2VsZWN0b3J9LCBjYW5ub3QgY2FsbCBpcygpIG9uIGVtcHR5IFdyYXBwZXJgXG4gICAgKVxuICB9XG5cbiAgaXNFbXB0eSgpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKFxuICAgICAgYGZpbmQgZGlkIG5vdCByZXR1cm4gJHtcbiAgICAgICAgdGhpcy5zZWxlY3RvclxuICAgICAgfSwgY2Fubm90IGNhbGwgaXNFbXB0eSgpIG9uIGVtcHR5IFdyYXBwZXJgXG4gICAgKVxuICB9XG5cbiAgaXNWaXNpYmxlKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoXG4gICAgICBgZmluZCBkaWQgbm90IHJldHVybiAke1xuICAgICAgICB0aGlzLnNlbGVjdG9yXG4gICAgICB9LCBjYW5ub3QgY2FsbCBpc1Zpc2libGUoKSBvbiBlbXB0eSBXcmFwcGVyYFxuICAgIClcbiAgfVxuXG4gIGlzVnVlSW5zdGFuY2UoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihcbiAgICAgIGBmaW5kIGRpZCBub3QgcmV0dXJuICR7XG4gICAgICAgIHRoaXMuc2VsZWN0b3JcbiAgICAgIH0sIGNhbm5vdCBjYWxsIGlzVnVlSW5zdGFuY2UoKSBvbiBlbXB0eSBXcmFwcGVyYFxuICAgIClcbiAgfVxuXG4gIG5hbWUoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihcbiAgICAgIGBmaW5kIGRpZCBub3QgcmV0dXJuICR7XG4gICAgICAgIHRoaXMuc2VsZWN0b3JcbiAgICAgIH0sIGNhbm5vdCBjYWxsIG5hbWUoKSBvbiBlbXB0eSBXcmFwcGVyYFxuICAgIClcbiAgfVxuXG4gIHByb3BzKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoXG4gICAgICBgZmluZCBkaWQgbm90IHJldHVybiAke1xuICAgICAgICB0aGlzLnNlbGVjdG9yXG4gICAgICB9LCBjYW5ub3QgY2FsbCBwcm9wcygpIG9uIGVtcHR5IFdyYXBwZXJgXG4gICAgKVxuICB9XG5cbiAgdGV4dCgpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKFxuICAgICAgYGZpbmQgZGlkIG5vdCByZXR1cm4gJHtcbiAgICAgICAgdGhpcy5zZWxlY3RvclxuICAgICAgfSwgY2Fubm90IGNhbGwgdGV4dCgpIG9uIGVtcHR5IFdyYXBwZXJgXG4gICAgKVxuICB9XG5cbiAgc2V0Q29tcHV0ZWQoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihcbiAgICAgIGBmaW5kIGRpZCBub3QgcmV0dXJuICR7XG4gICAgICAgIHRoaXMuc2VsZWN0b3JcbiAgICAgIH0sIGNhbm5vdCBjYWxsIHNldENvbXB1dGVkKCkgb24gZW1wdHkgV3JhcHBlcmBcbiAgICApXG4gIH1cblxuICBzZXREYXRhKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoXG4gICAgICBgZmluZCBkaWQgbm90IHJldHVybiAke1xuICAgICAgICB0aGlzLnNlbGVjdG9yXG4gICAgICB9LCBjYW5ub3QgY2FsbCBzZXREYXRhKCkgb24gZW1wdHkgV3JhcHBlcmBcbiAgICApXG4gIH1cblxuICBzZXRNZXRob2RzKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoXG4gICAgICBgZmluZCBkaWQgbm90IHJldHVybiAke1xuICAgICAgICB0aGlzLnNlbGVjdG9yXG4gICAgICB9LCBjYW5ub3QgY2FsbCBzZXRNZXRob2RzKCkgb24gZW1wdHkgV3JhcHBlcmBcbiAgICApXG4gIH1cblxuICBzZXRQcm9wcygpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKFxuICAgICAgYGZpbmQgZGlkIG5vdCByZXR1cm4gJHtcbiAgICAgICAgdGhpcy5zZWxlY3RvclxuICAgICAgfSwgY2Fubm90IGNhbGwgc2V0UHJvcHMoKSBvbiBlbXB0eSBXcmFwcGVyYFxuICAgIClcbiAgfVxuXG4gIHNldFZhbHVlKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoXG4gICAgICBgZmluZCBkaWQgbm90IHJldHVybiAke1xuICAgICAgICB0aGlzLnNlbGVjdG9yXG4gICAgICB9LCBjYW5ub3QgY2FsbCBzZXRWYWx1ZSgpIG9uIGVtcHR5IFdyYXBwZXJgXG4gICAgKVxuICB9XG5cbiAgc2V0Q2hlY2tlZCgpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKFxuICAgICAgYGZpbmQgZGlkIG5vdCByZXR1cm4gJHtcbiAgICAgICAgdGhpcy5zZWxlY3RvclxuICAgICAgfSwgY2Fubm90IGNhbGwgc2V0Q2hlY2tlZCgpIG9uIGVtcHR5IFdyYXBwZXJgXG4gICAgKVxuICB9XG5cbiAgc2V0U2VsZWN0ZWQoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihcbiAgICAgIGBmaW5kIGRpZCBub3QgcmV0dXJuICR7XG4gICAgICAgIHRoaXMuc2VsZWN0b3JcbiAgICAgIH0sIGNhbm5vdCBjYWxsIHNldFNlbGVjdGVkKCkgb24gZW1wdHkgV3JhcHBlcmBcbiAgICApXG4gIH1cblxuICB0cmlnZ2VyKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoXG4gICAgICBgZmluZCBkaWQgbm90IHJldHVybiAke1xuICAgICAgICB0aGlzLnNlbGVjdG9yXG4gICAgICB9LCBjYW5ub3QgY2FsbCB0cmlnZ2VyKCkgb24gZW1wdHkgV3JhcHBlcmBcbiAgICApXG4gIH1cblxuICBkZXN0cm95KCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoXG4gICAgICBgZmluZCBkaWQgbm90IHJldHVybiAke1xuICAgICAgICB0aGlzLnNlbGVjdG9yXG4gICAgICB9LCBjYW5ub3QgY2FsbCBkZXN0cm95KCkgb24gZW1wdHkgV3JhcHBlcmBcbiAgICApXG4gIH1cbn1cbiIsImltcG9ydCB7IGlzUGxhaW5PYmplY3QgfSBmcm9tICdzaGFyZWQvdmFsaWRhdG9ycydcblxuZXhwb3J0IGZ1bmN0aW9uIHJlY3Vyc2l2ZWx5U2V0RGF0YSh2bSwgdGFyZ2V0LCBkYXRhKSB7XG4gIE9iamVjdC5rZXlzKGRhdGEpLmZvckVhY2goa2V5ID0+IHtcbiAgICBjb25zdCB2YWwgPSBkYXRhW2tleV1cbiAgICBjb25zdCB0YXJnZXRWYWwgPSB0YXJnZXRba2V5XVxuXG4gICAgaWYgKGlzUGxhaW5PYmplY3QodmFsKSAmJiBpc1BsYWluT2JqZWN0KHRhcmdldFZhbCkpIHtcbiAgICAgIHJlY3Vyc2l2ZWx5U2V0RGF0YSh2bSwgdGFyZ2V0VmFsLCB2YWwpXG4gICAgfSBlbHNlIHtcbiAgICAgIHZtLiRzZXQodGFyZ2V0LCBrZXksIHZhbClcbiAgICB9XG4gIH0pXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCIuL2RvbS1ldmVudC10eXBlcy5qc29uXCIpO1xuIiwiaW1wb3J0IGV2ZW50VHlwZXMgZnJvbSAnZG9tLWV2ZW50LXR5cGVzJ1xuXG5jb25zdCBkZWZhdWx0RXZlbnRUeXBlID0ge1xuICBldmVudEludGVyZmFjZTogJ0V2ZW50JyxcbiAgY2FuY2VsYWJsZTogdHJ1ZSxcbiAgYnViYmxlczogdHJ1ZVxufVxuXG5jb25zdCBtb2RpZmllcnMgPSB7XG4gIGVudGVyOiAxMyxcbiAgdGFiOiA5LFxuICBkZWxldGU6IDQ2LFxuICBlc2M6IDI3LFxuICBzcGFjZTogMzIsXG4gIHVwOiAzOCxcbiAgZG93bjogNDAsXG4gIGxlZnQ6IDM3LFxuICByaWdodDogMzksXG4gIGVuZDogMzUsXG4gIGhvbWU6IDM2LFxuICBiYWNrc3BhY2U6IDgsXG4gIGluc2VydDogNDUsXG4gIHBhZ2V1cDogMzMsXG4gIHBhZ2Vkb3duOiAzNFxufVxuXG5mdW5jdGlvbiBjcmVhdGVFdmVudChcbiAgdHlwZSxcbiAgbW9kaWZpZXIsXG4gIHsgZXZlbnRJbnRlcmZhY2UsIGJ1YmJsZXMsIGNhbmNlbGFibGUgfSxcbiAgb3B0aW9uc1xuKSB7XG4gIGNvbnN0IFN1cHBvcnRlZEV2ZW50SW50ZXJmYWNlID1cbiAgICB0eXBlb2Ygd2luZG93W2V2ZW50SW50ZXJmYWNlXSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgPyB3aW5kb3dbZXZlbnRJbnRlcmZhY2VdXG4gICAgICA6IHdpbmRvdy5FdmVudFxuXG4gIGNvbnN0IGV2ZW50ID0gbmV3IFN1cHBvcnRlZEV2ZW50SW50ZXJmYWNlKHR5cGUsIHtcbiAgICAvLyBldmVudCBwcm9wZXJ0aWVzIGNhbiBvbmx5IGJlIGFkZGVkIHdoZW4gdGhlIGV2ZW50IGlzIGluc3RhbnRpYXRlZFxuICAgIC8vIGN1c3RvbSBwcm9wZXJ0aWVzIG11c3QgYmUgYWRkZWQgYWZ0ZXIgdGhlIGV2ZW50IGhhcyBiZWVuIGluc3RhbnRpYXRlZFxuICAgIC4uLm9wdGlvbnMsXG4gICAgYnViYmxlcyxcbiAgICBjYW5jZWxhYmxlLFxuICAgIGtleUNvZGU6IG1vZGlmaWVyc1ttb2RpZmllcl1cbiAgfSlcblxuICByZXR1cm4gZXZlbnRcbn1cblxuZnVuY3Rpb24gY3JlYXRlT2xkRXZlbnQoXG4gIHR5cGUsXG4gIG1vZGlmaWVyLFxuICB7IGV2ZW50SW50ZXJmYWNlLCBidWJibGVzLCBjYW5jZWxhYmxlIH1cbikge1xuICBjb25zdCBldmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdFdmVudCcpXG4gIGV2ZW50LmluaXRFdmVudCh0eXBlLCBidWJibGVzLCBjYW5jZWxhYmxlKVxuICBldmVudC5rZXlDb2RlID0gbW9kaWZpZXJzW21vZGlmaWVyXVxuICByZXR1cm4gZXZlbnRcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY3JlYXRlRE9NRXZlbnQodHlwZSwgb3B0aW9ucykge1xuICBjb25zdCBbZXZlbnRUeXBlLCBtb2RpZmllcl0gPSB0eXBlLnNwbGl0KCcuJylcbiAgY29uc3QgbWV0YSA9IGV2ZW50VHlwZXNbZXZlbnRUeXBlXSB8fCBkZWZhdWx0RXZlbnRUeXBlXG5cbiAgLy8gRmFsbGJhY2sgZm9yIElFMTAsMTEgLSBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8yNjU5NjEyM1xuICBjb25zdCBldmVudCA9XG4gICAgdHlwZW9mIHdpbmRvdy5FdmVudCA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgPyBjcmVhdGVFdmVudChldmVudFR5cGUsIG1vZGlmaWVyLCBtZXRhLCBvcHRpb25zKVxuICAgICAgOiBjcmVhdGVPbGRFdmVudChldmVudFR5cGUsIG1vZGlmaWVyLCBtZXRhKVxuXG4gIGNvbnN0IGV2ZW50UHJvdG90eXBlID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKGV2ZW50KVxuICBPYmplY3Qua2V5cyhvcHRpb25zIHx8IHt9KS5mb3JFYWNoKGtleSA9PiB7XG4gICAgY29uc3QgcHJvcGVydHlEZXNjcmlwdG9yID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihcbiAgICAgIGV2ZW50UHJvdG90eXBlLFxuICAgICAga2V5XG4gICAgKVxuXG4gICAgY29uc3QgY2FuU2V0UHJvcGVydHkgPSAhKFxuICAgICAgcHJvcGVydHlEZXNjcmlwdG9yICYmIHByb3BlcnR5RGVzY3JpcHRvci5zZXR0ZXIgPT09IHVuZGVmaW5lZFxuICAgIClcbiAgICBpZiAoY2FuU2V0UHJvcGVydHkpIHtcbiAgICAgIGV2ZW50W2tleV0gPSBvcHRpb25zW2tleV1cbiAgICB9XG4gIH0pXG5cbiAgcmV0dXJuIGV2ZW50XG59XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgVnVlIGZyb20gJ3Z1ZSdcbmltcG9ydCBnZXRTZWxlY3RvciBmcm9tICcuL2dldC1zZWxlY3RvcidcbmltcG9ydCB7IFJFRl9TRUxFQ1RPUiwgRlVOQ1RJT05BTF9PUFRJT05TLCBWVUVfVkVSU0lPTiB9IGZyb20gJ3NoYXJlZC9jb25zdHMnXG5pbXBvcnQgY29uZmlnIGZyb20gJy4vY29uZmlnJ1xuaW1wb3J0IFdyYXBwZXJBcnJheSBmcm9tICcuL3dyYXBwZXItYXJyYXknXG5pbXBvcnQgRXJyb3JXcmFwcGVyIGZyb20gJy4vZXJyb3Itd3JhcHBlcidcbmltcG9ydCB7IHRocm93RXJyb3IsIGdldENoZWNrZWRFdmVudCwgaXNQaGFudG9tSlMgfSBmcm9tICdzaGFyZWQvdXRpbCdcbmltcG9ydCBmaW5kIGZyb20gJy4vZmluZCdcbmltcG9ydCBjcmVhdGVXcmFwcGVyIGZyb20gJy4vY3JlYXRlLXdyYXBwZXInXG5pbXBvcnQgeyByZWN1cnNpdmVseVNldERhdGEgfSBmcm9tICcuL3JlY3Vyc2l2ZWx5LXNldC1kYXRhJ1xuaW1wb3J0IHsgbWF0Y2hlcyB9IGZyb20gJy4vbWF0Y2hlcydcbmltcG9ydCBjcmVhdGVET01FdmVudCBmcm9tICcuL2NyZWF0ZS1kb20tZXZlbnQnXG5pbXBvcnQgeyB0aHJvd0lmSW5zdGFuY2VzVGhyZXcgfSBmcm9tICcuL2Vycm9yJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBXcmFwcGVyIGltcGxlbWVudHMgQmFzZVdyYXBwZXIge1xuICArdm5vZGU6IFZOb2RlIHwgbnVsbFxuICArdm06IENvbXBvbmVudCB8IHZvaWRcbiAgX2VtaXR0ZWQ6IHsgW25hbWU6IHN0cmluZ106IEFycmF5PEFycmF5PGFueT4+IH1cbiAgX2VtaXR0ZWRCeU9yZGVyOiBBcnJheTx7IG5hbWU6IHN0cmluZywgYXJnczogQXJyYXk8YW55PiB9PlxuICArZWxlbWVudDogRWxlbWVudFxuICArb3B0aW9uczogV3JhcHBlck9wdGlvbnNcbiAgaXNGdW5jdGlvbmFsQ29tcG9uZW50OiBib29sZWFuXG4gIHJvb3ROb2RlOiBWTm9kZSB8IEVsZW1lbnRcblxuICBjb25zdHJ1Y3RvcihcbiAgICBub2RlOiBWTm9kZSB8IEVsZW1lbnQsXG4gICAgb3B0aW9uczogV3JhcHBlck9wdGlvbnMsXG4gICAgaXNWdWVXcmFwcGVyPzogYm9vbGVhblxuICApIHtcbiAgICBjb25zdCB2bm9kZSA9IG5vZGUgaW5zdGFuY2VvZiBFbGVtZW50ID8gbnVsbCA6IG5vZGVcbiAgICBjb25zdCBlbGVtZW50ID0gbm9kZSBpbnN0YW5jZW9mIEVsZW1lbnQgPyBub2RlIDogbm9kZS5lbG1cbiAgICAvLyBQcmV2ZW50IHJlZGVmaW5lIGJ5IFZ1ZVdyYXBwZXJcbiAgICBpZiAoIWlzVnVlV3JhcHBlcikge1xuICAgICAgLy8gJEZsb3dJZ25vcmUgOiBpc3N1ZSB3aXRoIGRlZmluZVByb3BlcnR5XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3Jvb3ROb2RlJywge1xuICAgICAgICBnZXQ6ICgpID0+IHZub2RlIHx8IGVsZW1lbnQsXG4gICAgICAgIHNldDogKCkgPT4gdGhyb3dFcnJvcignd3JhcHBlci5yb290Tm9kZSBpcyByZWFkLW9ubHknKVxuICAgICAgfSlcbiAgICAgIC8vICRGbG93SWdub3JlXG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3Zub2RlJywge1xuICAgICAgICBnZXQ6ICgpID0+IHZub2RlLFxuICAgICAgICBzZXQ6ICgpID0+IHRocm93RXJyb3IoJ3dyYXBwZXIudm5vZGUgaXMgcmVhZC1vbmx5JylcbiAgICAgIH0pXG4gICAgICAvLyAkRmxvd0lnbm9yZVxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdlbGVtZW50Jywge1xuICAgICAgICBnZXQ6ICgpID0+IGVsZW1lbnQsXG4gICAgICAgIHNldDogKCkgPT4gdGhyb3dFcnJvcignd3JhcHBlci5lbGVtZW50IGlzIHJlYWQtb25seScpXG4gICAgICB9KVxuICAgICAgLy8gJEZsb3dJZ25vcmVcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAndm0nLCB7XG4gICAgICAgIGdldDogKCkgPT4gdW5kZWZpbmVkLFxuICAgICAgICBzZXQ6ICgpID0+IHRocm93RXJyb3IoJ3dyYXBwZXIudm0gaXMgcmVhZC1vbmx5JylcbiAgICAgIH0pXG4gICAgfVxuICAgIGNvbnN0IGZyb3plbk9wdGlvbnMgPSBPYmplY3QuZnJlZXplKG9wdGlvbnMpXG4gICAgLy8gJEZsb3dJZ25vcmVcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ29wdGlvbnMnLCB7XG4gICAgICBnZXQ6ICgpID0+IGZyb3plbk9wdGlvbnMsXG4gICAgICBzZXQ6ICgpID0+IHRocm93RXJyb3IoJ3dyYXBwZXIub3B0aW9ucyBpcyByZWFkLW9ubHknKVxuICAgIH0pXG4gICAgaWYgKFxuICAgICAgdGhpcy52bm9kZSAmJlxuICAgICAgKHRoaXMudm5vZGVbRlVOQ1RJT05BTF9PUFRJT05TXSB8fCB0aGlzLnZub2RlLmZ1bmN0aW9uYWxDb250ZXh0KVxuICAgICkge1xuICAgICAgdGhpcy5pc0Z1bmN0aW9uYWxDb21wb25lbnQgPSB0cnVlXG4gICAgfVxuICB9XG5cbiAgYXQoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcignYXQoKSBtdXN0IGJlIGNhbGxlZCBvbiBhIFdyYXBwZXJBcnJheScpXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiBPYmplY3QgY29udGFpbmluZyBhbGwgdGhlIGF0dHJpYnV0ZS92YWx1ZSBwYWlycyBvbiB0aGUgZWxlbWVudC5cbiAgICovXG4gIGF0dHJpYnV0ZXMoa2V5Pzogc3RyaW5nKTogeyBbbmFtZTogc3RyaW5nXTogc3RyaW5nIH0gfCBzdHJpbmcge1xuICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSB0aGlzLmVsZW1lbnQuYXR0cmlidXRlc1xuICAgIGNvbnN0IGF0dHJpYnV0ZU1hcCA9IHt9XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhdHRyaWJ1dGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBhdHQgPSBhdHRyaWJ1dGVzLml0ZW0oaSlcbiAgICAgIGF0dHJpYnV0ZU1hcFthdHQubG9jYWxOYW1lXSA9IGF0dC52YWx1ZVxuICAgIH1cblxuICAgIHJldHVybiBrZXkgPyBhdHRyaWJ1dGVNYXBba2V5XSA6IGF0dHJpYnV0ZU1hcFxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW4gQXJyYXkgY29udGFpbmluZyBhbGwgdGhlIGNsYXNzZXMgb24gdGhlIGVsZW1lbnRcbiAgICovXG4gIGNsYXNzZXMoY2xhc3NOYW1lPzogc3RyaW5nKTogQXJyYXk8c3RyaW5nPiB8IGJvb2xlYW4ge1xuICAgIGNvbnN0IGNsYXNzQXR0cmlidXRlID0gdGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZSgnY2xhc3MnKVxuICAgIGxldCBjbGFzc2VzID0gY2xhc3NBdHRyaWJ1dGUgPyBjbGFzc0F0dHJpYnV0ZS5zcGxpdCgnICcpIDogW11cbiAgICAvLyBIYW5kbGUgY29udmVydGluZyBjc3Ntb2R1bGVzIGlkZW50aWZpZXJzIGJhY2sgdG8gdGhlIG9yaWdpbmFsIGNsYXNzIG5hbWVcbiAgICBpZiAodGhpcy52bSAmJiB0aGlzLnZtLiRzdHlsZSkge1xuICAgICAgY29uc3QgY3NzTW9kdWxlSWRlbnRpZmllcnMgPSBPYmplY3Qua2V5cyh0aGlzLnZtLiRzdHlsZSkucmVkdWNlKFxuICAgICAgICAoYWNjLCBrZXkpID0+IHtcbiAgICAgICAgICAvLyAkRmxvd0lnbm9yZVxuICAgICAgICAgIGNvbnN0IG1vZHVsZUlkZW50ID0gdGhpcy52bS4kc3R5bGVba2V5XVxuICAgICAgICAgIGlmIChtb2R1bGVJZGVudCkge1xuICAgICAgICAgICAgYWNjW21vZHVsZUlkZW50LnNwbGl0KCcgJylbMF1dID0ga2V5XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBhY2NcbiAgICAgICAgfSxcbiAgICAgICAge31cbiAgICAgIClcbiAgICAgIGNsYXNzZXMgPSBjbGFzc2VzLm1hcChuYW1lID0+IGNzc01vZHVsZUlkZW50aWZpZXJzW25hbWVdIHx8IG5hbWUpXG4gICAgfVxuXG4gICAgcmV0dXJuIGNsYXNzTmFtZSA/ICEhKGNsYXNzZXMuaW5kZXhPZihjbGFzc05hbWUpID4gLTEpIDogY2xhc3Nlc1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiB3cmFwcGVyIGNvbnRhaW5zIHByb3ZpZGVkIHNlbGVjdG9yLlxuICAgKi9cbiAgY29udGFpbnMocmF3U2VsZWN0b3I6IFNlbGVjdG9yKTogYm9vbGVhbiB7XG4gICAgY29uc3Qgc2VsZWN0b3IgPSBnZXRTZWxlY3RvcihyYXdTZWxlY3RvciwgJ2NvbnRhaW5zJylcbiAgICBjb25zdCBub2RlcyA9IGZpbmQodGhpcy5yb290Tm9kZSwgdGhpcy52bSwgc2VsZWN0b3IpXG4gICAgcmV0dXJuIG5vZGVzLmxlbmd0aCA+IDBcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxscyBkZXN0cm95IG9uIHZtXG4gICAqL1xuICBkZXN0cm95KCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5pc1Z1ZUluc3RhbmNlKCkpIHtcbiAgICAgIHRocm93RXJyb3IoYHdyYXBwZXIuZGVzdHJveSgpIGNhbiBvbmx5IGJlIGNhbGxlZCBvbiBhIFZ1ZSBpbnN0YW5jZWApXG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZWxlbWVudC5wYXJlbnROb2RlKSB7XG4gICAgICB0aGlzLmVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLmVsZW1lbnQpXG4gICAgfVxuICAgIC8vICRGbG93SWdub3JlXG4gICAgdGhpcy52bS4kZGVzdHJveSgpXG4gICAgdGhyb3dJZkluc3RhbmNlc1RocmV3KHRoaXMudm0pXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiBvYmplY3QgY29udGFpbmluZyBjdXN0b20gZXZlbnRzIGVtaXR0ZWQgYnkgdGhlIFdyYXBwZXIgdm1cbiAgICovXG4gIGVtaXR0ZWQoXG4gICAgZXZlbnQ/OiBzdHJpbmdcbiAgKTogQXJyYXk8QXJyYXk8YW55Pj4gfCB7IFtuYW1lOiBzdHJpbmddOiBBcnJheTxBcnJheTxhbnk+PiB9IHtcbiAgICBpZiAoIXRoaXMuX2VtaXR0ZWQgJiYgIXRoaXMudm0pIHtcbiAgICAgIHRocm93RXJyb3IoYHdyYXBwZXIuZW1pdHRlZCgpIGNhbiBvbmx5IGJlIGNhbGxlZCBvbiBhIFZ1ZSBpbnN0YW5jZWApXG4gICAgfVxuICAgIGlmIChldmVudCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2VtaXR0ZWRbZXZlbnRdXG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9lbWl0dGVkXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiBBcnJheSBjb250YWluaW5nIGN1c3RvbSBldmVudHMgZW1pdHRlZCBieSB0aGUgV3JhcHBlciB2bVxuICAgKi9cbiAgZW1pdHRlZEJ5T3JkZXIoKTogQXJyYXk8eyBuYW1lOiBzdHJpbmcsIGFyZ3M6IEFycmF5PGFueT4gfT4ge1xuICAgIGlmICghdGhpcy5fZW1pdHRlZEJ5T3JkZXIgJiYgIXRoaXMudm0pIHtcbiAgICAgIHRocm93RXJyb3IoXG4gICAgICAgIGB3cmFwcGVyLmVtaXR0ZWRCeU9yZGVyKCkgY2FuIG9ubHkgYmUgY2FsbGVkIG9uIGEgVnVlIGluc3RhbmNlYFxuICAgICAgKVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fZW1pdHRlZEJ5T3JkZXJcbiAgfVxuXG4gIC8qKlxuICAgKiBVdGlsaXR5IHRvIGNoZWNrIHdyYXBwZXIgZXhpc3RzLiBSZXR1cm5zIHRydWUgYXMgV3JhcHBlciBhbHdheXMgZXhpc3RzXG4gICAqL1xuICBleGlzdHMoKTogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMudm0pIHtcbiAgICAgIHJldHVybiAhIXRoaXMudm0gJiYgIXRoaXMudm0uX2lzRGVzdHJveWVkXG4gICAgfVxuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICBmaWx0ZXIoKSB7XG4gICAgdGhyb3dFcnJvcignZmlsdGVyKCkgbXVzdCBiZSBjYWxsZWQgb24gYSBXcmFwcGVyQXJyYXknKVxuICB9XG5cbiAgLyoqXG4gICAqIEZpbmRzIGZpcnN0IG5vZGUgaW4gdHJlZSBvZiB0aGUgY3VycmVudCB3cmFwcGVyIHRoYXRcbiAgICogbWF0Y2hlcyB0aGUgcHJvdmlkZWQgc2VsZWN0b3IuXG4gICAqL1xuICBmaW5kKHJhd1NlbGVjdG9yOiBTZWxlY3Rvcik6IFdyYXBwZXIgfCBFcnJvcldyYXBwZXIge1xuICAgIGNvbnN0IHNlbGVjdG9yID0gZ2V0U2VsZWN0b3IocmF3U2VsZWN0b3IsICdmaW5kJylcbiAgICBjb25zdCBub2RlID0gZmluZCh0aGlzLnJvb3ROb2RlLCB0aGlzLnZtLCBzZWxlY3RvcilbMF1cblxuICAgIGlmICghbm9kZSkge1xuICAgICAgaWYgKHNlbGVjdG9yLnR5cGUgPT09IFJFRl9TRUxFQ1RPUikge1xuICAgICAgICByZXR1cm4gbmV3IEVycm9yV3JhcHBlcihgcmVmPVwiJHtzZWxlY3Rvci52YWx1ZS5yZWZ9XCJgKVxuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBFcnJvcldyYXBwZXIoXG4gICAgICAgIHR5cGVvZiBzZWxlY3Rvci52YWx1ZSA9PT0gJ3N0cmluZycgPyBzZWxlY3Rvci52YWx1ZSA6ICdDb21wb25lbnQnXG4gICAgICApXG4gICAgfVxuXG4gICAgcmV0dXJuIGNyZWF0ZVdyYXBwZXIobm9kZSwgdGhpcy5vcHRpb25zKVxuICB9XG5cbiAgLyoqXG4gICAqIEZpbmRzIG5vZGUgaW4gdHJlZSBvZiB0aGUgY3VycmVudCB3cmFwcGVyIHRoYXQgbWF0Y2hlc1xuICAgKiB0aGUgcHJvdmlkZWQgc2VsZWN0b3IuXG4gICAqL1xuICBmaW5kQWxsKHJhd1NlbGVjdG9yOiBTZWxlY3Rvcik6IFdyYXBwZXJBcnJheSB7XG4gICAgY29uc3Qgc2VsZWN0b3IgPSBnZXRTZWxlY3RvcihyYXdTZWxlY3RvciwgJ2ZpbmRBbGwnKVxuICAgIGNvbnN0IG5vZGVzID0gZmluZCh0aGlzLnJvb3ROb2RlLCB0aGlzLnZtLCBzZWxlY3RvcilcbiAgICBjb25zdCB3cmFwcGVycyA9IG5vZGVzLm1hcChub2RlID0+IHtcbiAgICAgIC8vIFVzaW5nIENTUyBTZWxlY3RvciwgcmV0dXJucyBhIFZ1ZVdyYXBwZXIgaW5zdGFuY2UgaWYgdGhlIHJvb3QgZWxlbWVudFxuICAgICAgLy8gYmluZHMgYSBWdWUgaW5zdGFuY2UuXG4gICAgICByZXR1cm4gY3JlYXRlV3JhcHBlcihub2RlLCB0aGlzLm9wdGlvbnMpXG4gICAgfSlcbiAgICByZXR1cm4gbmV3IFdyYXBwZXJBcnJheSh3cmFwcGVycylcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIEhUTUwgb2YgZWxlbWVudCBhcyBhIHN0cmluZ1xuICAgKi9cbiAgaHRtbCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnQub3V0ZXJIVE1MXG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIGlmIG5vZGUgbWF0Y2hlcyBzZWxlY3RvclxuICAgKi9cbiAgaXMocmF3U2VsZWN0b3I6IFNlbGVjdG9yKTogYm9vbGVhbiB7XG4gICAgY29uc3Qgc2VsZWN0b3IgPSBnZXRTZWxlY3RvcihyYXdTZWxlY3RvciwgJ2lzJylcblxuICAgIGlmIChzZWxlY3Rvci50eXBlID09PSBSRUZfU0VMRUNUT1IpIHtcbiAgICAgIHRocm93RXJyb3IoJyRyZWYgc2VsZWN0b3JzIGNhbiBub3QgYmUgdXNlZCB3aXRoIHdyYXBwZXIuaXMoKScpXG4gICAgfVxuXG4gICAgcmV0dXJuIG1hdGNoZXModGhpcy5yb290Tm9kZSwgc2VsZWN0b3IpXG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIGlmIG5vZGUgaXMgZW1wdHlcbiAgICovXG4gIGlzRW1wdHkoKTogYm9vbGVhbiB7XG4gICAgaWYgKCF0aGlzLnZub2RlKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbGVtZW50LmlubmVySFRNTCA9PT0gJydcbiAgICB9XG4gICAgY29uc3Qgbm9kZXMgPSBbXVxuICAgIGxldCBub2RlID0gdGhpcy52bm9kZVxuICAgIGxldCBpID0gMFxuXG4gICAgd2hpbGUgKG5vZGUpIHtcbiAgICAgIGlmIChub2RlLmNoaWxkKSB7XG4gICAgICAgIG5vZGVzLnB1c2gobm9kZS5jaGlsZC5fdm5vZGUpXG4gICAgICB9XG4gICAgICBub2RlLmNoaWxkcmVuICYmXG4gICAgICAgIG5vZGUuY2hpbGRyZW4uZm9yRWFjaChuID0+IHtcbiAgICAgICAgICBub2Rlcy5wdXNoKG4pXG4gICAgICAgIH0pXG4gICAgICBub2RlID0gbm9kZXNbaSsrXVxuICAgIH1cbiAgICByZXR1cm4gbm9kZXMuZXZlcnkobiA9PiBuLmlzQ29tbWVudCB8fCBuLmNoaWxkKVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiBub2RlIGlzIHZpc2libGVcbiAgICovXG4gIGlzVmlzaWJsZSgpOiBib29sZWFuIHtcbiAgICBsZXQgZWxlbWVudCA9IHRoaXMuZWxlbWVudFxuICAgIHdoaWxlIChlbGVtZW50KSB7XG4gICAgICBpZiAoXG4gICAgICAgIGVsZW1lbnQuc3R5bGUgJiZcbiAgICAgICAgKGVsZW1lbnQuc3R5bGUudmlzaWJpbGl0eSA9PT0gJ2hpZGRlbicgfHxcbiAgICAgICAgICBlbGVtZW50LnN0eWxlLmRpc3BsYXkgPT09ICdub25lJylcbiAgICAgICkge1xuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH1cbiAgICAgIGVsZW1lbnQgPSBlbGVtZW50LnBhcmVudEVsZW1lbnRcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiB3cmFwcGVyIGlzIGEgdnVlIGluc3RhbmNlXG4gICAqL1xuICBpc1Z1ZUluc3RhbmNlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhIXRoaXMudm1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIG5hbWUgb2YgY29tcG9uZW50LCBvciB0YWcgbmFtZSBpZiBub2RlIGlzIG5vdCBhIFZ1ZSBjb21wb25lbnRcbiAgICovXG4gIG5hbWUoKTogc3RyaW5nIHtcbiAgICBpZiAodGhpcy52bSkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgdGhpcy52bS4kb3B0aW9ucy5uYW1lIHx8XG4gICAgICAgIC8vIGNvbXBhdCBmb3IgVnVlIDwgMi4zXG4gICAgICAgICh0aGlzLnZtLiRvcHRpb25zLmV4dGVuZE9wdGlvbnMgJiYgdGhpcy52bS4kb3B0aW9ucy5leHRlbmRPcHRpb25zLm5hbWUpXG4gICAgICApXG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLnZub2RlKSB7XG4gICAgICByZXR1cm4gdGhpcy5lbGVtZW50LnRhZ05hbWVcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy52bm9kZS50YWdcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIE9iamVjdCBjb250YWluaW5nIHRoZSBwcm9wIG5hbWUvdmFsdWUgcGFpcnMgb24gdGhlIGVsZW1lbnRcbiAgICovXG4gIHByb3BzKGtleT86IHN0cmluZyk6IHsgW25hbWU6IHN0cmluZ106IGFueSB9IHwgYW55IHtcbiAgICBpZiAodGhpcy5pc0Z1bmN0aW9uYWxDb21wb25lbnQpIHtcbiAgICAgIHRocm93RXJyb3IoXG4gICAgICAgIGB3cmFwcGVyLnByb3BzKCkgY2Fubm90IGJlIGNhbGxlZCBvbiBhIG1vdW50ZWQgZnVuY3Rpb25hbCBjb21wb25lbnQuYFxuICAgICAgKVxuICAgIH1cbiAgICBpZiAoIXRoaXMudm0pIHtcbiAgICAgIHRocm93RXJyb3IoJ3dyYXBwZXIucHJvcHMoKSBtdXN0IGJlIGNhbGxlZCBvbiBhIFZ1ZSBpbnN0YW5jZScpXG4gICAgfVxuXG4gICAgY29uc3QgcHJvcHMgPSB7fVxuICAgIGNvbnN0IGtleXMgPSB0aGlzLnZtICYmIHRoaXMudm0uJG9wdGlvbnMuX3Byb3BLZXlzXG5cbiAgICBpZiAoa2V5cykge1xuICAgICAgOyhrZXlzIHx8IHt9KS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICAgIGlmICh0aGlzLnZtKSB7XG4gICAgICAgICAgcHJvcHNba2V5XSA9IHRoaXMudm1ba2V5XVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cblxuICAgIGlmIChrZXkpIHtcbiAgICAgIHJldHVybiBwcm9wc1trZXldXG4gICAgfVxuXG4gICAgcmV0dXJuIHByb3BzXG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIHJhZGlvIGJ1dHRvbiBvciBjaGVja2JveCBlbGVtZW50XG4gICAqL1xuICBzZXRDaGVja2VkKGNoZWNrZWQ6IGJvb2xlYW4gPSB0cnVlKTogdm9pZCB7XG4gICAgaWYgKHR5cGVvZiBjaGVja2VkICE9PSAnYm9vbGVhbicpIHtcbiAgICAgIHRocm93RXJyb3IoJ3dyYXBwZXIuc2V0Q2hlY2tlZCgpIG11c3QgYmUgcGFzc2VkIGEgYm9vbGVhbicpXG4gICAgfVxuICAgIGNvbnN0IHRhZ05hbWUgPSB0aGlzLmVsZW1lbnQudGFnTmFtZVxuICAgIC8vICRGbG93SWdub3JlXG4gICAgY29uc3QgdHlwZSA9IHRoaXMuYXR0cmlidXRlcygpLnR5cGVcbiAgICBjb25zdCBldmVudCA9IGdldENoZWNrZWRFdmVudCgpXG5cbiAgICBpZiAodGFnTmFtZSA9PT0gJ0lOUFVUJyAmJiB0eXBlID09PSAnY2hlY2tib3gnKSB7XG4gICAgICBpZiAodGhpcy5lbGVtZW50LmNoZWNrZWQgPT09IGNoZWNrZWQpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBpZiAoZXZlbnQgIT09ICdjbGljaycgfHwgaXNQaGFudG9tSlMpIHtcbiAgICAgICAgLy8gJEZsb3dJZ25vcmVcbiAgICAgICAgdGhpcy5lbGVtZW50LmNoZWNrZWQgPSBjaGVja2VkXG4gICAgICB9XG4gICAgICB0aGlzLnRyaWdnZXIoZXZlbnQpXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBpZiAodGFnTmFtZSA9PT0gJ0lOUFVUJyAmJiB0eXBlID09PSAncmFkaW8nKSB7XG4gICAgICBpZiAoIWNoZWNrZWQpIHtcbiAgICAgICAgdGhyb3dFcnJvcihcbiAgICAgICAgICBgd3JhcHBlci5zZXRDaGVja2VkKCkgY2Fubm90IGJlIGNhbGxlZCB3aXRoIHBhcmFtZXRlciBmYWxzZSBvbiBhIGAgK1xuICAgICAgICAgICAgYDxpbnB1dCB0eXBlPVwicmFkaW9cIiAvPiBlbGVtZW50LmBcbiAgICAgICAgKVxuICAgICAgfVxuXG4gICAgICBpZiAoZXZlbnQgIT09ICdjbGljaycgfHwgaXNQaGFudG9tSlMpIHtcbiAgICAgICAgLy8gJEZsb3dJZ25vcmVcbiAgICAgICAgdGhpcy5lbGVtZW50LnNlbGVjdGVkID0gdHJ1ZVxuICAgICAgfVxuICAgICAgdGhpcy50cmlnZ2VyKGV2ZW50KVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgdGhyb3dFcnJvcihgd3JhcHBlci5zZXRDaGVja2VkKCkgY2Fubm90IGJlIGNhbGxlZCBvbiB0aGlzIGVsZW1lbnRgKVxuICB9XG5cbiAgLyoqXG4gICAqIFNlbGVjdHMgPG9wdGlvbj48L29wdGlvbj4gZWxlbWVudFxuICAgKi9cbiAgc2V0U2VsZWN0ZWQoKTogdm9pZCB7XG4gICAgY29uc3QgdGFnTmFtZSA9IHRoaXMuZWxlbWVudC50YWdOYW1lXG5cbiAgICBpZiAodGFnTmFtZSA9PT0gJ1NFTEVDVCcpIHtcbiAgICAgIHRocm93RXJyb3IoXG4gICAgICAgIGB3cmFwcGVyLnNldFNlbGVjdGVkKCkgY2Fubm90IGJlIGNhbGxlZCBvbiBzZWxlY3QuIENhbGwgaXQgb24gb25lIG9mIGAgK1xuICAgICAgICAgIGBpdHMgb3B0aW9uc2BcbiAgICAgIClcbiAgICB9XG5cbiAgICBpZiAodGFnTmFtZSA9PT0gJ09QVElPTicpIHtcbiAgICAgIC8vICRGbG93SWdub3JlXG4gICAgICB0aGlzLmVsZW1lbnQuc2VsZWN0ZWQgPSB0cnVlXG4gICAgICAvLyAkRmxvd0lnbm9yZVxuICAgICAgbGV0IHBhcmVudEVsZW1lbnQgPSB0aGlzLmVsZW1lbnQucGFyZW50RWxlbWVudFxuXG4gICAgICAvLyAkRmxvd0lnbm9yZVxuICAgICAgaWYgKHBhcmVudEVsZW1lbnQudGFnTmFtZSA9PT0gJ09QVEdST1VQJykge1xuICAgICAgICAvLyAkRmxvd0lnbm9yZVxuICAgICAgICBwYXJlbnRFbGVtZW50ID0gcGFyZW50RWxlbWVudC5wYXJlbnRFbGVtZW50XG4gICAgICB9XG5cbiAgICAgIC8vICRGbG93SWdub3JlXG4gICAgICBjcmVhdGVXcmFwcGVyKHBhcmVudEVsZW1lbnQsIHRoaXMub3B0aW9ucykudHJpZ2dlcignY2hhbmdlJylcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHRocm93RXJyb3IoYHdyYXBwZXIuc2V0U2VsZWN0ZWQoKSBjYW5ub3QgYmUgY2FsbGVkIG9uIHRoaXMgZWxlbWVudGApXG4gIH1cblxuICAvKipcbiAgICogU2V0cyB2bSBkYXRhXG4gICAqL1xuICBzZXREYXRhKGRhdGE6IE9iamVjdCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmlzRnVuY3Rpb25hbENvbXBvbmVudCkge1xuICAgICAgdGhyb3dFcnJvcihgd3JhcHBlci5zZXREYXRhKCkgY2Fubm90IGJlIGNhbGxlZCBvbiBhIGZ1bmN0aW9uYWwgY29tcG9uZW50YClcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMudm0pIHtcbiAgICAgIHRocm93RXJyb3IoYHdyYXBwZXIuc2V0RGF0YSgpIGNhbiBvbmx5IGJlIGNhbGxlZCBvbiBhIFZ1ZSBpbnN0YW5jZWApXG4gICAgfVxuXG4gICAgcmVjdXJzaXZlbHlTZXREYXRhKHRoaXMudm0sIHRoaXMudm0sIGRhdGEpXG4gIH1cblxuICAvKipcbiAgICogU2V0cyB2bSBtZXRob2RzXG4gICAqL1xuICBzZXRNZXRob2RzKG1ldGhvZHM6IE9iamVjdCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5pc1Z1ZUluc3RhbmNlKCkpIHtcbiAgICAgIHRocm93RXJyb3IoYHdyYXBwZXIuc2V0TWV0aG9kcygpIGNhbiBvbmx5IGJlIGNhbGxlZCBvbiBhIFZ1ZSBpbnN0YW5jZWApXG4gICAgfVxuICAgIE9iamVjdC5rZXlzKG1ldGhvZHMpLmZvckVhY2goa2V5ID0+IHtcbiAgICAgIC8vICRGbG93SWdub3JlIDogUHJvYmxlbSB3aXRoIHBvc3NpYmx5IG51bGwgdGhpcy52bVxuICAgICAgdGhpcy52bVtrZXldID0gbWV0aG9kc1trZXldXG4gICAgICAvLyAkRmxvd0lnbm9yZSA6IFByb2JsZW0gd2l0aCBwb3NzaWJseSBudWxsIHRoaXMudm1cbiAgICAgIHRoaXMudm0uJG9wdGlvbnMubWV0aG9kc1trZXldID0gbWV0aG9kc1trZXldXG4gICAgfSlcblxuICAgIGlmICh0aGlzLnZub2RlKSB7XG4gICAgICBjb25zdCBjb250ZXh0ID0gdGhpcy52bm9kZS5jb250ZXh0XG4gICAgICBpZiAoY29udGV4dC4kb3B0aW9ucy5yZW5kZXIpIGNvbnRleHQuX3VwZGF0ZShjb250ZXh0Ll9yZW5kZXIoKSlcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB2bSBwcm9wc1xuICAgKi9cbiAgc2V0UHJvcHMoZGF0YTogT2JqZWN0KTogdm9pZCB7XG4gICAgY29uc3Qgb3JpZ2luYWxDb25maWcgPSBWdWUuY29uZmlnLnNpbGVudFxuICAgIFZ1ZS5jb25maWcuc2lsZW50ID0gY29uZmlnLnNpbGVudFxuICAgIGlmICh0aGlzLmlzRnVuY3Rpb25hbENvbXBvbmVudCkge1xuICAgICAgdGhyb3dFcnJvcihcbiAgICAgICAgYHdyYXBwZXIuc2V0UHJvcHMoKSBjYW5ub3QgYmUgY2FsbGVkIG9uIGEgZnVuY3Rpb25hbCBjb21wb25lbnRgXG4gICAgICApXG4gICAgfVxuICAgIGlmICghdGhpcy52bSkge1xuICAgICAgdGhyb3dFcnJvcihgd3JhcHBlci5zZXRQcm9wcygpIGNhbiBvbmx5IGJlIGNhbGxlZCBvbiBhIFZ1ZSBpbnN0YW5jZWApXG4gICAgfVxuXG4gICAgT2JqZWN0LmtleXMoZGF0YSkuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgaWYgKFxuICAgICAgICB0eXBlb2YgZGF0YVtrZXldID09PSAnb2JqZWN0JyAmJlxuICAgICAgICBkYXRhW2tleV0gIT09IG51bGwgJiZcbiAgICAgICAgLy8gJEZsb3dJZ25vcmUgOiBQcm9ibGVtIHdpdGggcG9zc2libHkgbnVsbCB0aGlzLnZtXG4gICAgICAgIGRhdGFba2V5XSA9PT0gdGhpcy52bVtrZXldXG4gICAgICApIHtcbiAgICAgICAgdGhyb3dFcnJvcihcbiAgICAgICAgICBgd3JhcHBlci5zZXRQcm9wcygpIGNhbGxlZCB3aXRoIHRoZSBzYW1lIG9iamVjdCBvZiB0aGUgZXhpc3RpbmcgYCArXG4gICAgICAgICAgICBgJHtrZXl9IHByb3BlcnR5LiBZb3UgbXVzdCBjYWxsIHdyYXBwZXIuc2V0UHJvcHMoKSB3aXRoIGEgbmV3IGAgK1xuICAgICAgICAgICAgYG9iamVjdCB0byB0cmlnZ2VyIHJlYWN0aXZpdHlgXG4gICAgICAgIClcbiAgICAgIH1cbiAgICAgIGlmIChcbiAgICAgICAgIXRoaXMudm0gfHxcbiAgICAgICAgIXRoaXMudm0uJG9wdGlvbnMuX3Byb3BLZXlzIHx8XG4gICAgICAgICF0aGlzLnZtLiRvcHRpb25zLl9wcm9wS2V5cy5zb21lKHByb3AgPT4gcHJvcCA9PT0ga2V5KVxuICAgICAgKSB7XG4gICAgICAgIGlmIChWVUVfVkVSU0lPTiA+IDIuMykge1xuICAgICAgICAgIC8vICRGbG93SWdub3JlIDogUHJvYmxlbSB3aXRoIHBvc3NpYmx5IG51bGwgdGhpcy52bVxuICAgICAgICAgIHRoaXMudm0uJGF0dHJzW2tleV0gPSBkYXRhW2tleV1cbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICB0aHJvd0Vycm9yKFxuICAgICAgICAgIGB3cmFwcGVyLnNldFByb3BzKCkgY2FsbGVkIHdpdGggJHtrZXl9IHByb3BlcnR5IHdoaWNoIGAgK1xuICAgICAgICAgICAgYGlzIG5vdCBkZWZpbmVkIG9uIHRoZSBjb21wb25lbnRgXG4gICAgICAgIClcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMudm0gJiYgdGhpcy52bS5fcHJvcHMpIHtcbiAgICAgICAgLy8gU2V0IGFjdHVhbCBwcm9wcyB2YWx1ZVxuICAgICAgICB0aGlzLnZtLl9wcm9wc1trZXldID0gZGF0YVtrZXldXG4gICAgICAgIC8vICRGbG93SWdub3JlIDogUHJvYmxlbSB3aXRoIHBvc3NpYmx5IG51bGwgdGhpcy52bVxuICAgICAgICB0aGlzLnZtW2tleV0gPSBkYXRhW2tleV1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vICRGbG93SWdub3JlIDogUHJvYmxlbSB3aXRoIHBvc3NpYmx5IG51bGwgdGhpcy52bS4kb3B0aW9uc1xuICAgICAgICB0aGlzLnZtLiRvcHRpb25zLnByb3BzRGF0YVtrZXldID0gZGF0YVtrZXldXG4gICAgICAgIC8vICRGbG93SWdub3JlIDogUHJvYmxlbSB3aXRoIHBvc3NpYmx5IG51bGwgdGhpcy52bVxuICAgICAgICB0aGlzLnZtW2tleV0gPSBkYXRhW2tleV1cbiAgICAgICAgLy8gJEZsb3dJZ25vcmUgOiBOZWVkIHRvIGNhbGwgdGhpcyB0d2ljZSB0byBmaXggd2F0Y2hlciBidWcgaW4gMi4wLnhcbiAgICAgICAgdGhpcy52bVtrZXldID0gZGF0YVtrZXldXG4gICAgICB9XG4gICAgfSlcbiAgICAvLyAkRmxvd0lnbm9yZSA6IFByb2JsZW0gd2l0aCBwb3NzaWJseSBudWxsIHRoaXMudm1cbiAgICB0aGlzLnZtLiRmb3JjZVVwZGF0ZSgpXG4gICAgVnVlLmNvbmZpZy5zaWxlbnQgPSBvcmlnaW5hbENvbmZpZ1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgZWxlbWVudCB2YWx1ZSBhbmQgdHJpZ2dlcnMgaW5wdXQgZXZlbnRcbiAgICovXG4gIHNldFZhbHVlKHZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgICBjb25zdCB0YWdOYW1lID0gdGhpcy5lbGVtZW50LnRhZ05hbWVcbiAgICAvLyAkRmxvd0lnbm9yZVxuICAgIGNvbnN0IHR5cGUgPSB0aGlzLmF0dHJpYnV0ZXMoKS50eXBlXG5cbiAgICBpZiAodGFnTmFtZSA9PT0gJ09QVElPTicpIHtcbiAgICAgIHRocm93RXJyb3IoXG4gICAgICAgIGB3cmFwcGVyLnNldFZhbHVlKCkgY2Fubm90IGJlIGNhbGxlZCBvbiBhbiA8b3B0aW9uPiBlbGVtZW50LiBVc2UgYCArXG4gICAgICAgICAgYHdyYXBwZXIuc2V0U2VsZWN0ZWQoKSBpbnN0ZWFkYFxuICAgICAgKVxuICAgIH0gZWxzZSBpZiAodGFnTmFtZSA9PT0gJ0lOUFVUJyAmJiB0eXBlID09PSAnY2hlY2tib3gnKSB7XG4gICAgICB0aHJvd0Vycm9yKFxuICAgICAgICBgd3JhcHBlci5zZXRWYWx1ZSgpIGNhbm5vdCBiZSBjYWxsZWQgb24gYSA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgLz4gYCArXG4gICAgICAgICAgYGVsZW1lbnQuIFVzZSB3cmFwcGVyLnNldENoZWNrZWQoKSBpbnN0ZWFkYFxuICAgICAgKVxuICAgIH0gZWxzZSBpZiAodGFnTmFtZSA9PT0gJ0lOUFVUJyAmJiB0eXBlID09PSAncmFkaW8nKSB7XG4gICAgICB0aHJvd0Vycm9yKFxuICAgICAgICBgd3JhcHBlci5zZXRWYWx1ZSgpIGNhbm5vdCBiZSBjYWxsZWQgb24gYSA8aW5wdXQgdHlwZT1cInJhZGlvXCIgLz4gYCArXG4gICAgICAgICAgYGVsZW1lbnQuIFVzZSB3cmFwcGVyLnNldENoZWNrZWQoKSBpbnN0ZWFkYFxuICAgICAgKVxuICAgIH0gZWxzZSBpZiAoXG4gICAgICB0YWdOYW1lID09PSAnSU5QVVQnIHx8XG4gICAgICB0YWdOYW1lID09PSAnVEVYVEFSRUEnIHx8XG4gICAgICB0YWdOYW1lID09PSAnU0VMRUNUJ1xuICAgICkge1xuICAgICAgY29uc3QgZXZlbnQgPSB0YWdOYW1lID09PSAnU0VMRUNUJyA/ICdjaGFuZ2UnIDogJ2lucHV0J1xuICAgICAgLy8gJEZsb3dJZ25vcmVcbiAgICAgIHRoaXMuZWxlbWVudC52YWx1ZSA9IHZhbHVlXG4gICAgICB0aGlzLnRyaWdnZXIoZXZlbnQpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93RXJyb3IoYHdyYXBwZXIuc2V0VmFsdWUoKSBjYW5ub3QgYmUgY2FsbGVkIG9uIHRoaXMgZWxlbWVudGApXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiB0ZXh0IG9mIHdyYXBwZXIgZWxlbWVudFxuICAgKi9cbiAgdGV4dCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnQudGV4dENvbnRlbnQudHJpbSgpXG4gIH1cblxuICAvKipcbiAgICogRGlzcGF0Y2hlcyBhIERPTSBldmVudCBvbiB3cmFwcGVyXG4gICAqL1xuICB0cmlnZ2VyKHR5cGU6IHN0cmluZywgb3B0aW9uczogT2JqZWN0ID0ge30pIHtcbiAgICBpZiAodHlwZW9mIHR5cGUgIT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvd0Vycm9yKCd3cmFwcGVyLnRyaWdnZXIoKSBtdXN0IGJlIHBhc3NlZCBhIHN0cmluZycpXG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnMudGFyZ2V0KSB7XG4gICAgICB0aHJvd0Vycm9yKFxuICAgICAgICBgeW91IGNhbm5vdCBzZXQgdGhlIHRhcmdldCB2YWx1ZSBvZiBhbiBldmVudC4gU2VlIHRoZSBub3RlcyBzZWN0aW9uIGAgK1xuICAgICAgICAgIGBvZiB0aGUgZG9jcyBmb3IgbW9yZSBkZXRhaWxz4oCUYCArXG4gICAgICAgICAgYGh0dHBzOi8vdnVlLXRlc3QtdXRpbHMudnVlanMub3JnL2FwaS93cmFwcGVyL3RyaWdnZXIuaHRtbGBcbiAgICAgIClcbiAgICB9XG5cbiAgICAvLyBEb24ndCBmaXJlIGV2ZW50IG9uIGEgZGlzYWJsZWQgZWxlbWVudFxuICAgIGlmICh0aGlzLmF0dHJpYnV0ZXMoKS5kaXNhYmxlZCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc3QgZXZlbnQgPSBjcmVhdGVET01FdmVudCh0eXBlLCBvcHRpb25zKVxuICAgIHRoaXMuZWxlbWVudC5kaXNwYXRjaEV2ZW50KGV2ZW50KVxuICB9XG59XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgV3JhcHBlciBmcm9tICcuL3dyYXBwZXInXG5pbXBvcnQgeyB0aHJvd0Vycm9yIH0gZnJvbSAnc2hhcmVkL3V0aWwnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFZ1ZVdyYXBwZXIgZXh0ZW5kcyBXcmFwcGVyIGltcGxlbWVudHMgQmFzZVdyYXBwZXIge1xuICBjb25zdHJ1Y3Rvcih2bTogQ29tcG9uZW50LCBvcHRpb25zOiBXcmFwcGVyT3B0aW9ucykge1xuICAgIHN1cGVyKHZtLl92bm9kZSwgb3B0aW9ucywgdHJ1ZSlcbiAgICAvLyAkRmxvd0lnbm9yZSA6IGlzc3VlIHdpdGggZGVmaW5lUHJvcGVydHlcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3Jvb3ROb2RlJywge1xuICAgICAgZ2V0OiAoKSA9PiB2bS4kdm5vZGUgfHwgeyBjaGlsZDogdGhpcy52bSB9LFxuICAgICAgc2V0OiAoKSA9PiB0aHJvd0Vycm9yKCd3cmFwcGVyLnZub2RlIGlzIHJlYWQtb25seScpXG4gICAgfSlcbiAgICAvLyAkRmxvd0lnbm9yZSA6IGlzc3VlIHdpdGggZGVmaW5lUHJvcGVydHlcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3Zub2RlJywge1xuICAgICAgZ2V0OiAoKSA9PiB2bS5fdm5vZGUsXG4gICAgICBzZXQ6ICgpID0+IHRocm93RXJyb3IoJ3dyYXBwZXIudm5vZGUgaXMgcmVhZC1vbmx5JylcbiAgICB9KVxuICAgIC8vICRGbG93SWdub3JlXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdlbGVtZW50Jywge1xuICAgICAgZ2V0OiAoKSA9PiB2bS4kZWwsXG4gICAgICBzZXQ6ICgpID0+IHRocm93RXJyb3IoJ3dyYXBwZXIuZWxlbWVudCBpcyByZWFkLW9ubHknKVxuICAgIH0pXG4gICAgLy8gJEZsb3dJZ25vcmVcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3ZtJywge1xuICAgICAgZ2V0OiAoKSA9PiB2bSxcbiAgICAgIHNldDogKCkgPT4gdGhyb3dFcnJvcignd3JhcHBlci52bSBpcyByZWFkLW9ubHknKVxuICAgIH0pXG4gICAgdGhpcy5pc0Z1bmN0aW9uYWxDb21wb25lbnQgPSB2bS4kb3B0aW9ucy5faXNGdW5jdGlvbmFsQ29udGFpbmVyXG4gICAgdGhpcy5fZW1pdHRlZCA9IHZtLl9fZW1pdHRlZFxuICAgIHRoaXMuX2VtaXR0ZWRCeU9yZGVyID0gdm0uX19lbWl0dGVkQnlPcmRlclxuICB9XG59XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgVnVlIGZyb20gJ3Z1ZSdcbmltcG9ydCBXcmFwcGVyIGZyb20gJy4vd3JhcHBlcidcbmltcG9ydCBWdWVXcmFwcGVyIGZyb20gJy4vdnVlLXdyYXBwZXInXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNyZWF0ZVdyYXBwZXIoXG4gIG5vZGU6IFZOb2RlIHwgQ29tcG9uZW50LFxuICBvcHRpb25zOiBXcmFwcGVyT3B0aW9ucyA9IHt9XG4pOiBWdWVXcmFwcGVyIHwgV3JhcHBlciB7XG4gIGNvbnN0IGNvbXBvbmVudEluc3RhbmNlID0gbm9kZS5jaGlsZFxuICBpZiAoY29tcG9uZW50SW5zdGFuY2UpIHtcbiAgICByZXR1cm4gbmV3IFZ1ZVdyYXBwZXIoY29tcG9uZW50SW5zdGFuY2UsIG9wdGlvbnMpXG4gIH1cbiAgcmV0dXJuIG5vZGUgaW5zdGFuY2VvZiBWdWVcbiAgICA/IG5ldyBWdWVXcmFwcGVyKG5vZGUsIG9wdGlvbnMpXG4gICAgOiBuZXcgV3JhcHBlcihub2RlLCBvcHRpb25zKVxufVxuIiwiLyoqXG4gKiBSZW1vdmVzIGFsbCBrZXktdmFsdWUgZW50cmllcyBmcm9tIHRoZSBsaXN0IGNhY2hlLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBjbGVhclxuICogQG1lbWJlck9mIExpc3RDYWNoZVxuICovXG5mdW5jdGlvbiBsaXN0Q2FjaGVDbGVhcigpIHtcbiAgdGhpcy5fX2RhdGFfXyA9IFtdO1xuICB0aGlzLnNpemUgPSAwO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGxpc3RDYWNoZUNsZWFyO1xuIiwiLyoqXG4gKiBQZXJmb3JtcyBhXG4gKiBbYFNhbWVWYWx1ZVplcm9gXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1zYW1ldmFsdWV6ZXJvKVxuICogY29tcGFyaXNvbiBiZXR3ZWVuIHR3byB2YWx1ZXMgdG8gZGV0ZXJtaW5lIGlmIHRoZXkgYXJlIGVxdWl2YWxlbnQuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNvbXBhcmUuXG4gKiBAcGFyYW0geyp9IG90aGVyIFRoZSBvdGhlciB2YWx1ZSB0byBjb21wYXJlLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSB2YWx1ZXMgYXJlIGVxdWl2YWxlbnQsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogdmFyIG9iamVjdCA9IHsgJ2EnOiAxIH07XG4gKiB2YXIgb3RoZXIgPSB7ICdhJzogMSB9O1xuICpcbiAqIF8uZXEob2JqZWN0LCBvYmplY3QpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uZXEob2JqZWN0LCBvdGhlcik7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uZXEoJ2EnLCAnYScpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uZXEoJ2EnLCBPYmplY3QoJ2EnKSk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uZXEoTmFOLCBOYU4pO1xuICogLy8gPT4gdHJ1ZVxuICovXG5mdW5jdGlvbiBlcSh2YWx1ZSwgb3RoZXIpIHtcbiAgcmV0dXJuIHZhbHVlID09PSBvdGhlciB8fCAodmFsdWUgIT09IHZhbHVlICYmIG90aGVyICE9PSBvdGhlcik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZXE7XG4iLCJ2YXIgZXEgPSByZXF1aXJlKCcuL2VxJyk7XG5cbi8qKlxuICogR2V0cyB0aGUgaW5kZXggYXQgd2hpY2ggdGhlIGBrZXlgIGlzIGZvdW5kIGluIGBhcnJheWAgb2Yga2V5LXZhbHVlIHBhaXJzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gaW5zcGVjdC5cbiAqIEBwYXJhbSB7Kn0ga2V5IFRoZSBrZXkgdG8gc2VhcmNoIGZvci5cbiAqIEByZXR1cm5zIHtudW1iZXJ9IFJldHVybnMgdGhlIGluZGV4IG9mIHRoZSBtYXRjaGVkIHZhbHVlLCBlbHNlIGAtMWAuXG4gKi9cbmZ1bmN0aW9uIGFzc29jSW5kZXhPZihhcnJheSwga2V5KSB7XG4gIHZhciBsZW5ndGggPSBhcnJheS5sZW5ndGg7XG4gIHdoaWxlIChsZW5ndGgtLSkge1xuICAgIGlmIChlcShhcnJheVtsZW5ndGhdWzBdLCBrZXkpKSB7XG4gICAgICByZXR1cm4gbGVuZ3RoO1xuICAgIH1cbiAgfVxuICByZXR1cm4gLTE7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYXNzb2NJbmRleE9mO1xuIiwidmFyIGFzc29jSW5kZXhPZiA9IHJlcXVpcmUoJy4vX2Fzc29jSW5kZXhPZicpO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgYXJyYXlQcm90byA9IEFycmF5LnByb3RvdHlwZTtcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgc3BsaWNlID0gYXJyYXlQcm90by5zcGxpY2U7XG5cbi8qKlxuICogUmVtb3ZlcyBga2V5YCBhbmQgaXRzIHZhbHVlIGZyb20gdGhlIGxpc3QgY2FjaGUuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGRlbGV0ZVxuICogQG1lbWJlck9mIExpc3RDYWNoZVxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byByZW1vdmUuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGVudHJ5IHdhcyByZW1vdmVkLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGxpc3RDYWNoZURlbGV0ZShrZXkpIHtcbiAgdmFyIGRhdGEgPSB0aGlzLl9fZGF0YV9fLFxuICAgICAgaW5kZXggPSBhc3NvY0luZGV4T2YoZGF0YSwga2V5KTtcblxuICBpZiAoaW5kZXggPCAwKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciBsYXN0SW5kZXggPSBkYXRhLmxlbmd0aCAtIDE7XG4gIGlmIChpbmRleCA9PSBsYXN0SW5kZXgpIHtcbiAgICBkYXRhLnBvcCgpO1xuICB9IGVsc2Uge1xuICAgIHNwbGljZS5jYWxsKGRhdGEsIGluZGV4LCAxKTtcbiAgfVxuICAtLXRoaXMuc2l6ZTtcbiAgcmV0dXJuIHRydWU7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbGlzdENhY2hlRGVsZXRlO1xuIiwidmFyIGFzc29jSW5kZXhPZiA9IHJlcXVpcmUoJy4vX2Fzc29jSW5kZXhPZicpO1xuXG4vKipcbiAqIEdldHMgdGhlIGxpc3QgY2FjaGUgdmFsdWUgZm9yIGBrZXlgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBnZXRcbiAqIEBtZW1iZXJPZiBMaXN0Q2FjaGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gZ2V0LlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIGVudHJ5IHZhbHVlLlxuICovXG5mdW5jdGlvbiBsaXN0Q2FjaGVHZXQoa2V5KSB7XG4gIHZhciBkYXRhID0gdGhpcy5fX2RhdGFfXyxcbiAgICAgIGluZGV4ID0gYXNzb2NJbmRleE9mKGRhdGEsIGtleSk7XG5cbiAgcmV0dXJuIGluZGV4IDwgMCA/IHVuZGVmaW5lZCA6IGRhdGFbaW5kZXhdWzFdO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGxpc3RDYWNoZUdldDtcbiIsInZhciBhc3NvY0luZGV4T2YgPSByZXF1aXJlKCcuL19hc3NvY0luZGV4T2YnKTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYSBsaXN0IGNhY2hlIHZhbHVlIGZvciBga2V5YCBleGlzdHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGhhc1xuICogQG1lbWJlck9mIExpc3RDYWNoZVxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBlbnRyeSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBhbiBlbnRyeSBmb3IgYGtleWAgZXhpc3RzLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGxpc3RDYWNoZUhhcyhrZXkpIHtcbiAgcmV0dXJuIGFzc29jSW5kZXhPZih0aGlzLl9fZGF0YV9fLCBrZXkpID4gLTE7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbGlzdENhY2hlSGFzO1xuIiwidmFyIGFzc29jSW5kZXhPZiA9IHJlcXVpcmUoJy4vX2Fzc29jSW5kZXhPZicpO1xuXG4vKipcbiAqIFNldHMgdGhlIGxpc3QgY2FjaGUgYGtleWAgdG8gYHZhbHVlYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgc2V0XG4gKiBAbWVtYmVyT2YgTGlzdENhY2hlXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIHNldC5cbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHNldC5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIGxpc3QgY2FjaGUgaW5zdGFuY2UuXG4gKi9cbmZ1bmN0aW9uIGxpc3RDYWNoZVNldChrZXksIHZhbHVlKSB7XG4gIHZhciBkYXRhID0gdGhpcy5fX2RhdGFfXyxcbiAgICAgIGluZGV4ID0gYXNzb2NJbmRleE9mKGRhdGEsIGtleSk7XG5cbiAgaWYgKGluZGV4IDwgMCkge1xuICAgICsrdGhpcy5zaXplO1xuICAgIGRhdGEucHVzaChba2V5LCB2YWx1ZV0pO1xuICB9IGVsc2Uge1xuICAgIGRhdGFbaW5kZXhdWzFdID0gdmFsdWU7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbGlzdENhY2hlU2V0O1xuIiwidmFyIGxpc3RDYWNoZUNsZWFyID0gcmVxdWlyZSgnLi9fbGlzdENhY2hlQ2xlYXInKSxcbiAgICBsaXN0Q2FjaGVEZWxldGUgPSByZXF1aXJlKCcuL19saXN0Q2FjaGVEZWxldGUnKSxcbiAgICBsaXN0Q2FjaGVHZXQgPSByZXF1aXJlKCcuL19saXN0Q2FjaGVHZXQnKSxcbiAgICBsaXN0Q2FjaGVIYXMgPSByZXF1aXJlKCcuL19saXN0Q2FjaGVIYXMnKSxcbiAgICBsaXN0Q2FjaGVTZXQgPSByZXF1aXJlKCcuL19saXN0Q2FjaGVTZXQnKTtcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGxpc3QgY2FjaGUgb2JqZWN0LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7QXJyYXl9IFtlbnRyaWVzXSBUaGUga2V5LXZhbHVlIHBhaXJzIHRvIGNhY2hlLlxuICovXG5mdW5jdGlvbiBMaXN0Q2FjaGUoZW50cmllcykge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IGVudHJpZXMgPT0gbnVsbCA/IDAgOiBlbnRyaWVzLmxlbmd0aDtcblxuICB0aGlzLmNsZWFyKCk7XG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgdmFyIGVudHJ5ID0gZW50cmllc1tpbmRleF07XG4gICAgdGhpcy5zZXQoZW50cnlbMF0sIGVudHJ5WzFdKTtcbiAgfVxufVxuXG4vLyBBZGQgbWV0aG9kcyB0byBgTGlzdENhY2hlYC5cbkxpc3RDYWNoZS5wcm90b3R5cGUuY2xlYXIgPSBsaXN0Q2FjaGVDbGVhcjtcbkxpc3RDYWNoZS5wcm90b3R5cGVbJ2RlbGV0ZSddID0gbGlzdENhY2hlRGVsZXRlO1xuTGlzdENhY2hlLnByb3RvdHlwZS5nZXQgPSBsaXN0Q2FjaGVHZXQ7XG5MaXN0Q2FjaGUucHJvdG90eXBlLmhhcyA9IGxpc3RDYWNoZUhhcztcbkxpc3RDYWNoZS5wcm90b3R5cGUuc2V0ID0gbGlzdENhY2hlU2V0O1xuXG5tb2R1bGUuZXhwb3J0cyA9IExpc3RDYWNoZTtcbiIsInZhciBMaXN0Q2FjaGUgPSByZXF1aXJlKCcuL19MaXN0Q2FjaGUnKTtcblxuLyoqXG4gKiBSZW1vdmVzIGFsbCBrZXktdmFsdWUgZW50cmllcyBmcm9tIHRoZSBzdGFjay5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgY2xlYXJcbiAqIEBtZW1iZXJPZiBTdGFja1xuICovXG5mdW5jdGlvbiBzdGFja0NsZWFyKCkge1xuICB0aGlzLl9fZGF0YV9fID0gbmV3IExpc3RDYWNoZTtcbiAgdGhpcy5zaXplID0gMDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzdGFja0NsZWFyO1xuIiwiLyoqXG4gKiBSZW1vdmVzIGBrZXlgIGFuZCBpdHMgdmFsdWUgZnJvbSB0aGUgc3RhY2suXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGRlbGV0ZVxuICogQG1lbWJlck9mIFN0YWNrXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIHJlbW92ZS5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgZW50cnkgd2FzIHJlbW92ZWQsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gc3RhY2tEZWxldGUoa2V5KSB7XG4gIHZhciBkYXRhID0gdGhpcy5fX2RhdGFfXyxcbiAgICAgIHJlc3VsdCA9IGRhdGFbJ2RlbGV0ZSddKGtleSk7XG5cbiAgdGhpcy5zaXplID0gZGF0YS5zaXplO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHN0YWNrRGVsZXRlO1xuIiwiLyoqXG4gKiBHZXRzIHRoZSBzdGFjayB2YWx1ZSBmb3IgYGtleWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGdldFxuICogQG1lbWJlck9mIFN0YWNrXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIGdldC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBlbnRyeSB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gc3RhY2tHZXQoa2V5KSB7XG4gIHJldHVybiB0aGlzLl9fZGF0YV9fLmdldChrZXkpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHN0YWNrR2V0O1xuIiwiLyoqXG4gKiBDaGVja3MgaWYgYSBzdGFjayB2YWx1ZSBmb3IgYGtleWAgZXhpc3RzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBoYXNcbiAqIEBtZW1iZXJPZiBTdGFja1xuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBlbnRyeSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBhbiBlbnRyeSBmb3IgYGtleWAgZXhpc3RzLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIHN0YWNrSGFzKGtleSkge1xuICByZXR1cm4gdGhpcy5fX2RhdGFfXy5oYXMoa2V5KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzdGFja0hhcztcbiIsIi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgZ2xvYmFsYCBmcm9tIE5vZGUuanMuICovXG52YXIgZnJlZUdsb2JhbCA9IHR5cGVvZiBnbG9iYWwgPT0gJ29iamVjdCcgJiYgZ2xvYmFsICYmIGdsb2JhbC5PYmplY3QgPT09IE9iamVjdCAmJiBnbG9iYWw7XG5cbm1vZHVsZS5leHBvcnRzID0gZnJlZUdsb2JhbDtcbiIsInZhciBmcmVlR2xvYmFsID0gcmVxdWlyZSgnLi9fZnJlZUdsb2JhbCcpO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYHNlbGZgLiAqL1xudmFyIGZyZWVTZWxmID0gdHlwZW9mIHNlbGYgPT0gJ29iamVjdCcgJiYgc2VsZiAmJiBzZWxmLk9iamVjdCA9PT0gT2JqZWN0ICYmIHNlbGY7XG5cbi8qKiBVc2VkIGFzIGEgcmVmZXJlbmNlIHRvIHRoZSBnbG9iYWwgb2JqZWN0LiAqL1xudmFyIHJvb3QgPSBmcmVlR2xvYmFsIHx8IGZyZWVTZWxmIHx8IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gcm9vdDtcbiIsInZhciByb290ID0gcmVxdWlyZSgnLi9fcm9vdCcpO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBTeW1ib2wgPSByb290LlN5bWJvbDtcblxubW9kdWxlLmV4cG9ydHMgPSBTeW1ib2w7XG4iLCJ2YXIgU3ltYm9sID0gcmVxdWlyZSgnLi9fU3ltYm9sJyk7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogVXNlZCB0byByZXNvbHZlIHRoZVxuICogW2B0b1N0cmluZ1RhZ2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLW9iamVjdC5wcm90b3R5cGUudG9zdHJpbmcpXG4gKiBvZiB2YWx1ZXMuXG4gKi9cbnZhciBuYXRpdmVPYmplY3RUb1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBzeW1Ub1N0cmluZ1RhZyA9IFN5bWJvbCA/IFN5bWJvbC50b1N0cmluZ1RhZyA6IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBBIHNwZWNpYWxpemVkIHZlcnNpb24gb2YgYGJhc2VHZXRUYWdgIHdoaWNoIGlnbm9yZXMgYFN5bWJvbC50b1N0cmluZ1RhZ2AgdmFsdWVzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIHJhdyBgdG9TdHJpbmdUYWdgLlxuICovXG5mdW5jdGlvbiBnZXRSYXdUYWcodmFsdWUpIHtcbiAgdmFyIGlzT3duID0gaGFzT3duUHJvcGVydHkuY2FsbCh2YWx1ZSwgc3ltVG9TdHJpbmdUYWcpLFxuICAgICAgdGFnID0gdmFsdWVbc3ltVG9TdHJpbmdUYWddO1xuXG4gIHRyeSB7XG4gICAgdmFsdWVbc3ltVG9TdHJpbmdUYWddID0gdW5kZWZpbmVkO1xuICAgIHZhciB1bm1hc2tlZCA9IHRydWU7XG4gIH0gY2F0Y2ggKGUpIHt9XG5cbiAgdmFyIHJlc3VsdCA9IG5hdGl2ZU9iamVjdFRvU3RyaW5nLmNhbGwodmFsdWUpO1xuICBpZiAodW5tYXNrZWQpIHtcbiAgICBpZiAoaXNPd24pIHtcbiAgICAgIHZhbHVlW3N5bVRvU3RyaW5nVGFnXSA9IHRhZztcbiAgICB9IGVsc2Uge1xuICAgICAgZGVsZXRlIHZhbHVlW3N5bVRvU3RyaW5nVGFnXTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZXRSYXdUYWc7XG4iLCIvKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKipcbiAqIFVzZWQgdG8gcmVzb2x2ZSB0aGVcbiAqIFtgdG9TdHJpbmdUYWdgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1vYmplY3QucHJvdG90eXBlLnRvc3RyaW5nKVxuICogb2YgdmFsdWVzLlxuICovXG52YXIgbmF0aXZlT2JqZWN0VG9TdHJpbmcgPSBvYmplY3RQcm90by50b1N0cmluZztcblxuLyoqXG4gKiBDb252ZXJ0cyBgdmFsdWVgIHRvIGEgc3RyaW5nIHVzaW5nIGBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY29udmVydC5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIGNvbnZlcnRlZCBzdHJpbmcuXG4gKi9cbmZ1bmN0aW9uIG9iamVjdFRvU3RyaW5nKHZhbHVlKSB7XG4gIHJldHVybiBuYXRpdmVPYmplY3RUb1N0cmluZy5jYWxsKHZhbHVlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBvYmplY3RUb1N0cmluZztcbiIsInZhciBTeW1ib2wgPSByZXF1aXJlKCcuL19TeW1ib2wnKSxcbiAgICBnZXRSYXdUYWcgPSByZXF1aXJlKCcuL19nZXRSYXdUYWcnKSxcbiAgICBvYmplY3RUb1N0cmluZyA9IHJlcXVpcmUoJy4vX29iamVjdFRvU3RyaW5nJyk7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBudWxsVGFnID0gJ1tvYmplY3QgTnVsbF0nLFxuICAgIHVuZGVmaW5lZFRhZyA9ICdbb2JqZWN0IFVuZGVmaW5lZF0nO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBzeW1Ub1N0cmluZ1RhZyA9IFN5bWJvbCA/IFN5bWJvbC50b1N0cmluZ1RhZyA6IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgZ2V0VGFnYCB3aXRob3V0IGZhbGxiYWNrcyBmb3IgYnVnZ3kgZW52aXJvbm1lbnRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIGB0b1N0cmluZ1RhZ2AuXG4gKi9cbmZ1bmN0aW9uIGJhc2VHZXRUYWcodmFsdWUpIHtcbiAgaWYgKHZhbHVlID09IG51bGwpIHtcbiAgICByZXR1cm4gdmFsdWUgPT09IHVuZGVmaW5lZCA/IHVuZGVmaW5lZFRhZyA6IG51bGxUYWc7XG4gIH1cbiAgcmV0dXJuIChzeW1Ub1N0cmluZ1RhZyAmJiBzeW1Ub1N0cmluZ1RhZyBpbiBPYmplY3QodmFsdWUpKVxuICAgID8gZ2V0UmF3VGFnKHZhbHVlKVxuICAgIDogb2JqZWN0VG9TdHJpbmcodmFsdWUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VHZXRUYWc7XG4iLCIvKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIHRoZVxuICogW2xhbmd1YWdlIHR5cGVdKGh0dHA6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1lY21hc2NyaXB0LWxhbmd1YWdlLXR5cGVzKVxuICogb2YgYE9iamVjdGAuIChlLmcuIGFycmF5cywgZnVuY3Rpb25zLCBvYmplY3RzLCByZWdleGVzLCBgbmV3IE51bWJlcigwKWAsIGFuZCBgbmV3IFN0cmluZygnJylgKVxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFuIG9iamVjdCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzT2JqZWN0KHt9KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChfLm5vb3ApO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QobnVsbCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdCh2YWx1ZSkge1xuICB2YXIgdHlwZSA9IHR5cGVvZiB2YWx1ZTtcbiAgcmV0dXJuIHZhbHVlICE9IG51bGwgJiYgKHR5cGUgPT0gJ29iamVjdCcgfHwgdHlwZSA9PSAnZnVuY3Rpb24nKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc09iamVjdDtcbiIsInZhciBiYXNlR2V0VGFnID0gcmVxdWlyZSgnLi9fYmFzZUdldFRhZycpLFxuICAgIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9pc09iamVjdCcpO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgYXN5bmNUYWcgPSAnW29iamVjdCBBc3luY0Z1bmN0aW9uXScsXG4gICAgZnVuY1RhZyA9ICdbb2JqZWN0IEZ1bmN0aW9uXScsXG4gICAgZ2VuVGFnID0gJ1tvYmplY3QgR2VuZXJhdG9yRnVuY3Rpb25dJyxcbiAgICBwcm94eVRhZyA9ICdbb2JqZWN0IFByb3h5XSc7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgY2xhc3NpZmllZCBhcyBhIGBGdW5jdGlvbmAgb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgZnVuY3Rpb24sIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0Z1bmN0aW9uKF8pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNGdW5jdGlvbigvYWJjLyk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKHZhbHVlKSB7XG4gIGlmICghaXNPYmplY3QodmFsdWUpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIC8vIFRoZSB1c2Ugb2YgYE9iamVjdCN0b1N0cmluZ2AgYXZvaWRzIGlzc3VlcyB3aXRoIHRoZSBgdHlwZW9mYCBvcGVyYXRvclxuICAvLyBpbiBTYWZhcmkgOSB3aGljaCByZXR1cm5zICdvYmplY3QnIGZvciB0eXBlZCBhcnJheXMgYW5kIG90aGVyIGNvbnN0cnVjdG9ycy5cbiAgdmFyIHRhZyA9IGJhc2VHZXRUYWcodmFsdWUpO1xuICByZXR1cm4gdGFnID09IGZ1bmNUYWcgfHwgdGFnID09IGdlblRhZyB8fCB0YWcgPT0gYXN5bmNUYWcgfHwgdGFnID09IHByb3h5VGFnO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzRnVuY3Rpb247XG4iLCJ2YXIgcm9vdCA9IHJlcXVpcmUoJy4vX3Jvb3QnKTtcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IG92ZXJyZWFjaGluZyBjb3JlLWpzIHNoaW1zLiAqL1xudmFyIGNvcmVKc0RhdGEgPSByb290WydfX2NvcmUtanNfc2hhcmVkX18nXTtcblxubW9kdWxlLmV4cG9ydHMgPSBjb3JlSnNEYXRhO1xuIiwidmFyIGNvcmVKc0RhdGEgPSByZXF1aXJlKCcuL19jb3JlSnNEYXRhJyk7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBtZXRob2RzIG1hc3F1ZXJhZGluZyBhcyBuYXRpdmUuICovXG52YXIgbWFza1NyY0tleSA9IChmdW5jdGlvbigpIHtcbiAgdmFyIHVpZCA9IC9bXi5dKyQvLmV4ZWMoY29yZUpzRGF0YSAmJiBjb3JlSnNEYXRhLmtleXMgJiYgY29yZUpzRGF0YS5rZXlzLklFX1BST1RPIHx8ICcnKTtcbiAgcmV0dXJuIHVpZCA/ICgnU3ltYm9sKHNyYylfMS4nICsgdWlkKSA6ICcnO1xufSgpKTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYGZ1bmNgIGhhcyBpdHMgc291cmNlIG1hc2tlZC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYGZ1bmNgIGlzIG1hc2tlZCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc01hc2tlZChmdW5jKSB7XG4gIHJldHVybiAhIW1hc2tTcmNLZXkgJiYgKG1hc2tTcmNLZXkgaW4gZnVuYyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNNYXNrZWQ7XG4iLCIvKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgZnVuY1Byb3RvID0gRnVuY3Rpb24ucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byByZXNvbHZlIHRoZSBkZWNvbXBpbGVkIHNvdXJjZSBvZiBmdW5jdGlvbnMuICovXG52YXIgZnVuY1RvU3RyaW5nID0gZnVuY1Byb3RvLnRvU3RyaW5nO1xuXG4vKipcbiAqIENvbnZlcnRzIGBmdW5jYCB0byBpdHMgc291cmNlIGNvZGUuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGNvbnZlcnQuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBzb3VyY2UgY29kZS5cbiAqL1xuZnVuY3Rpb24gdG9Tb3VyY2UoZnVuYykge1xuICBpZiAoZnVuYyAhPSBudWxsKSB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBmdW5jVG9TdHJpbmcuY2FsbChmdW5jKTtcbiAgICB9IGNhdGNoIChlKSB7fVxuICAgIHRyeSB7XG4gICAgICByZXR1cm4gKGZ1bmMgKyAnJyk7XG4gICAgfSBjYXRjaCAoZSkge31cbiAgfVxuICByZXR1cm4gJyc7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdG9Tb3VyY2U7XG4iLCJ2YXIgaXNGdW5jdGlvbiA9IHJlcXVpcmUoJy4vaXNGdW5jdGlvbicpLFxuICAgIGlzTWFza2VkID0gcmVxdWlyZSgnLi9faXNNYXNrZWQnKSxcbiAgICBpc09iamVjdCA9IHJlcXVpcmUoJy4vaXNPYmplY3QnKSxcbiAgICB0b1NvdXJjZSA9IHJlcXVpcmUoJy4vX3RvU291cmNlJyk7XG5cbi8qKlxuICogVXNlZCB0byBtYXRjaCBgUmVnRXhwYFxuICogW3N5bnRheCBjaGFyYWN0ZXJzXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1wYXR0ZXJucykuXG4gKi9cbnZhciByZVJlZ0V4cENoYXIgPSAvW1xcXFxeJC4qKz8oKVtcXF17fXxdL2c7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBob3N0IGNvbnN0cnVjdG9ycyAoU2FmYXJpKS4gKi9cbnZhciByZUlzSG9zdEN0b3IgPSAvXlxcW29iamVjdCAuKz9Db25zdHJ1Y3RvclxcXSQvO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgZnVuY1Byb3RvID0gRnVuY3Rpb24ucHJvdG90eXBlLFxuICAgIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gcmVzb2x2ZSB0aGUgZGVjb21waWxlZCBzb3VyY2Ugb2YgZnVuY3Rpb25zLiAqL1xudmFyIGZ1bmNUb1N0cmluZyA9IGZ1bmNQcm90by50b1N0cmluZztcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IGlmIGEgbWV0aG9kIGlzIG5hdGl2ZS4gKi9cbnZhciByZUlzTmF0aXZlID0gUmVnRXhwKCdeJyArXG4gIGZ1bmNUb1N0cmluZy5jYWxsKGhhc093blByb3BlcnR5KS5yZXBsYWNlKHJlUmVnRXhwQ2hhciwgJ1xcXFwkJicpXG4gIC5yZXBsYWNlKC9oYXNPd25Qcm9wZXJ0eXwoZnVuY3Rpb24pLio/KD89XFxcXFxcKCl8IGZvciAuKz8oPz1cXFxcXFxdKS9nLCAnJDEuKj8nKSArICckJ1xuKTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5pc05hdGl2ZWAgd2l0aG91dCBiYWQgc2hpbSBjaGVja3MuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBuYXRpdmUgZnVuY3Rpb24sXG4gKiAgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBiYXNlSXNOYXRpdmUodmFsdWUpIHtcbiAgaWYgKCFpc09iamVjdCh2YWx1ZSkgfHwgaXNNYXNrZWQodmFsdWUpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciBwYXR0ZXJuID0gaXNGdW5jdGlvbih2YWx1ZSkgPyByZUlzTmF0aXZlIDogcmVJc0hvc3RDdG9yO1xuICByZXR1cm4gcGF0dGVybi50ZXN0KHRvU291cmNlKHZhbHVlKSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUlzTmF0aXZlO1xuIiwiLyoqXG4gKiBHZXRzIHRoZSB2YWx1ZSBhdCBga2V5YCBvZiBgb2JqZWN0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IFtvYmplY3RdIFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHByb3BlcnR5IHRvIGdldC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBwcm9wZXJ0eSB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gZ2V0VmFsdWUob2JqZWN0LCBrZXkpIHtcbiAgcmV0dXJuIG9iamVjdCA9PSBudWxsID8gdW5kZWZpbmVkIDogb2JqZWN0W2tleV07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0VmFsdWU7XG4iLCJ2YXIgYmFzZUlzTmF0aXZlID0gcmVxdWlyZSgnLi9fYmFzZUlzTmF0aXZlJyksXG4gICAgZ2V0VmFsdWUgPSByZXF1aXJlKCcuL19nZXRWYWx1ZScpO1xuXG4vKipcbiAqIEdldHMgdGhlIG5hdGl2ZSBmdW5jdGlvbiBhdCBga2V5YCBvZiBgb2JqZWN0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBtZXRob2QgdG8gZ2V0LlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIGZ1bmN0aW9uIGlmIGl0J3MgbmF0aXZlLCBlbHNlIGB1bmRlZmluZWRgLlxuICovXG5mdW5jdGlvbiBnZXROYXRpdmUob2JqZWN0LCBrZXkpIHtcbiAgdmFyIHZhbHVlID0gZ2V0VmFsdWUob2JqZWN0LCBrZXkpO1xuICByZXR1cm4gYmFzZUlzTmF0aXZlKHZhbHVlKSA/IHZhbHVlIDogdW5kZWZpbmVkO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldE5hdGl2ZTtcbiIsInZhciBnZXROYXRpdmUgPSByZXF1aXJlKCcuL19nZXROYXRpdmUnKSxcbiAgICByb290ID0gcmVxdWlyZSgnLi9fcm9vdCcpO1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyB0aGF0IGFyZSB2ZXJpZmllZCB0byBiZSBuYXRpdmUuICovXG52YXIgTWFwID0gZ2V0TmF0aXZlKHJvb3QsICdNYXAnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBNYXA7XG4iLCJ2YXIgZ2V0TmF0aXZlID0gcmVxdWlyZSgnLi9fZ2V0TmF0aXZlJyk7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIHRoYXQgYXJlIHZlcmlmaWVkIHRvIGJlIG5hdGl2ZS4gKi9cbnZhciBuYXRpdmVDcmVhdGUgPSBnZXROYXRpdmUoT2JqZWN0LCAnY3JlYXRlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gbmF0aXZlQ3JlYXRlO1xuIiwidmFyIG5hdGl2ZUNyZWF0ZSA9IHJlcXVpcmUoJy4vX25hdGl2ZUNyZWF0ZScpO1xuXG4vKipcbiAqIFJlbW92ZXMgYWxsIGtleS12YWx1ZSBlbnRyaWVzIGZyb20gdGhlIGhhc2guXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGNsZWFyXG4gKiBAbWVtYmVyT2YgSGFzaFxuICovXG5mdW5jdGlvbiBoYXNoQ2xlYXIoKSB7XG4gIHRoaXMuX19kYXRhX18gPSBuYXRpdmVDcmVhdGUgPyBuYXRpdmVDcmVhdGUobnVsbCkgOiB7fTtcbiAgdGhpcy5zaXplID0gMDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBoYXNoQ2xlYXI7XG4iLCIvKipcbiAqIFJlbW92ZXMgYGtleWAgYW5kIGl0cyB2YWx1ZSBmcm9tIHRoZSBoYXNoLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBkZWxldGVcbiAqIEBtZW1iZXJPZiBIYXNoXG4gKiBAcGFyYW0ge09iamVjdH0gaGFzaCBUaGUgaGFzaCB0byBtb2RpZnkuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIHJlbW92ZS5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgZW50cnkgd2FzIHJlbW92ZWQsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaGFzaERlbGV0ZShrZXkpIHtcbiAgdmFyIHJlc3VsdCA9IHRoaXMuaGFzKGtleSkgJiYgZGVsZXRlIHRoaXMuX19kYXRhX19ba2V5XTtcbiAgdGhpcy5zaXplIC09IHJlc3VsdCA/IDEgOiAwO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGhhc2hEZWxldGU7XG4iLCJ2YXIgbmF0aXZlQ3JlYXRlID0gcmVxdWlyZSgnLi9fbmF0aXZlQ3JlYXRlJyk7XG5cbi8qKiBVc2VkIHRvIHN0YW5kLWluIGZvciBgdW5kZWZpbmVkYCBoYXNoIHZhbHVlcy4gKi9cbnZhciBIQVNIX1VOREVGSU5FRCA9ICdfX2xvZGFzaF9oYXNoX3VuZGVmaW5lZF9fJztcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBHZXRzIHRoZSBoYXNoIHZhbHVlIGZvciBga2V5YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgZ2V0XG4gKiBAbWVtYmVyT2YgSGFzaFxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byBnZXQuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgZW50cnkgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIGhhc2hHZXQoa2V5KSB7XG4gIHZhciBkYXRhID0gdGhpcy5fX2RhdGFfXztcbiAgaWYgKG5hdGl2ZUNyZWF0ZSkge1xuICAgIHZhciByZXN1bHQgPSBkYXRhW2tleV07XG4gICAgcmV0dXJuIHJlc3VsdCA9PT0gSEFTSF9VTkRFRklORUQgPyB1bmRlZmluZWQgOiByZXN1bHQ7XG4gIH1cbiAgcmV0dXJuIGhhc093blByb3BlcnR5LmNhbGwoZGF0YSwga2V5KSA/IGRhdGFba2V5XSA6IHVuZGVmaW5lZDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBoYXNoR2V0O1xuIiwidmFyIG5hdGl2ZUNyZWF0ZSA9IHJlcXVpcmUoJy4vX25hdGl2ZUNyZWF0ZScpO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIENoZWNrcyBpZiBhIGhhc2ggdmFsdWUgZm9yIGBrZXlgIGV4aXN0cy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgaGFzXG4gKiBAbWVtYmVyT2YgSGFzaFxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBlbnRyeSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBhbiBlbnRyeSBmb3IgYGtleWAgZXhpc3RzLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGhhc2hIYXMoa2V5KSB7XG4gIHZhciBkYXRhID0gdGhpcy5fX2RhdGFfXztcbiAgcmV0dXJuIG5hdGl2ZUNyZWF0ZSA/IChkYXRhW2tleV0gIT09IHVuZGVmaW5lZCkgOiBoYXNPd25Qcm9wZXJ0eS5jYWxsKGRhdGEsIGtleSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaGFzaEhhcztcbiIsInZhciBuYXRpdmVDcmVhdGUgPSByZXF1aXJlKCcuL19uYXRpdmVDcmVhdGUnKTtcblxuLyoqIFVzZWQgdG8gc3RhbmQtaW4gZm9yIGB1bmRlZmluZWRgIGhhc2ggdmFsdWVzLiAqL1xudmFyIEhBU0hfVU5ERUZJTkVEID0gJ19fbG9kYXNoX2hhc2hfdW5kZWZpbmVkX18nO1xuXG4vKipcbiAqIFNldHMgdGhlIGhhc2ggYGtleWAgdG8gYHZhbHVlYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgc2V0XG4gKiBAbWVtYmVyT2YgSGFzaFxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byBzZXQuXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBzZXQuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBoYXNoIGluc3RhbmNlLlxuICovXG5mdW5jdGlvbiBoYXNoU2V0KGtleSwgdmFsdWUpIHtcbiAgdmFyIGRhdGEgPSB0aGlzLl9fZGF0YV9fO1xuICB0aGlzLnNpemUgKz0gdGhpcy5oYXMoa2V5KSA/IDAgOiAxO1xuICBkYXRhW2tleV0gPSAobmF0aXZlQ3JlYXRlICYmIHZhbHVlID09PSB1bmRlZmluZWQpID8gSEFTSF9VTkRFRklORUQgOiB2YWx1ZTtcbiAgcmV0dXJuIHRoaXM7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaGFzaFNldDtcbiIsInZhciBoYXNoQ2xlYXIgPSByZXF1aXJlKCcuL19oYXNoQ2xlYXInKSxcbiAgICBoYXNoRGVsZXRlID0gcmVxdWlyZSgnLi9faGFzaERlbGV0ZScpLFxuICAgIGhhc2hHZXQgPSByZXF1aXJlKCcuL19oYXNoR2V0JyksXG4gICAgaGFzaEhhcyA9IHJlcXVpcmUoJy4vX2hhc2hIYXMnKSxcbiAgICBoYXNoU2V0ID0gcmVxdWlyZSgnLi9faGFzaFNldCcpO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBoYXNoIG9iamVjdC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge0FycmF5fSBbZW50cmllc10gVGhlIGtleS12YWx1ZSBwYWlycyB0byBjYWNoZS5cbiAqL1xuZnVuY3Rpb24gSGFzaChlbnRyaWVzKSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gZW50cmllcyA9PSBudWxsID8gMCA6IGVudHJpZXMubGVuZ3RoO1xuXG4gIHRoaXMuY2xlYXIoKTtcbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICB2YXIgZW50cnkgPSBlbnRyaWVzW2luZGV4XTtcbiAgICB0aGlzLnNldChlbnRyeVswXSwgZW50cnlbMV0pO1xuICB9XG59XG5cbi8vIEFkZCBtZXRob2RzIHRvIGBIYXNoYC5cbkhhc2gucHJvdG90eXBlLmNsZWFyID0gaGFzaENsZWFyO1xuSGFzaC5wcm90b3R5cGVbJ2RlbGV0ZSddID0gaGFzaERlbGV0ZTtcbkhhc2gucHJvdG90eXBlLmdldCA9IGhhc2hHZXQ7XG5IYXNoLnByb3RvdHlwZS5oYXMgPSBoYXNoSGFzO1xuSGFzaC5wcm90b3R5cGUuc2V0ID0gaGFzaFNldDtcblxubW9kdWxlLmV4cG9ydHMgPSBIYXNoO1xuIiwidmFyIEhhc2ggPSByZXF1aXJlKCcuL19IYXNoJyksXG4gICAgTGlzdENhY2hlID0gcmVxdWlyZSgnLi9fTGlzdENhY2hlJyksXG4gICAgTWFwID0gcmVxdWlyZSgnLi9fTWFwJyk7XG5cbi8qKlxuICogUmVtb3ZlcyBhbGwga2V5LXZhbHVlIGVudHJpZXMgZnJvbSB0aGUgbWFwLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBjbGVhclxuICogQG1lbWJlck9mIE1hcENhY2hlXG4gKi9cbmZ1bmN0aW9uIG1hcENhY2hlQ2xlYXIoKSB7XG4gIHRoaXMuc2l6ZSA9IDA7XG4gIHRoaXMuX19kYXRhX18gPSB7XG4gICAgJ2hhc2gnOiBuZXcgSGFzaCxcbiAgICAnbWFwJzogbmV3IChNYXAgfHwgTGlzdENhY2hlKSxcbiAgICAnc3RyaW5nJzogbmV3IEhhc2hcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBtYXBDYWNoZUNsZWFyO1xuIiwiLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBzdWl0YWJsZSBmb3IgdXNlIGFzIHVuaXF1ZSBvYmplY3Qga2V5LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIHN1aXRhYmxlLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGlzS2V5YWJsZSh2YWx1ZSkge1xuICB2YXIgdHlwZSA9IHR5cGVvZiB2YWx1ZTtcbiAgcmV0dXJuICh0eXBlID09ICdzdHJpbmcnIHx8IHR5cGUgPT0gJ251bWJlcicgfHwgdHlwZSA9PSAnc3ltYm9sJyB8fCB0eXBlID09ICdib29sZWFuJylcbiAgICA/ICh2YWx1ZSAhPT0gJ19fcHJvdG9fXycpXG4gICAgOiAodmFsdWUgPT09IG51bGwpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzS2V5YWJsZTtcbiIsInZhciBpc0tleWFibGUgPSByZXF1aXJlKCcuL19pc0tleWFibGUnKTtcblxuLyoqXG4gKiBHZXRzIHRoZSBkYXRhIGZvciBgbWFwYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG1hcCBUaGUgbWFwIHRvIHF1ZXJ5LlxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUgcmVmZXJlbmNlIGtleS5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBtYXAgZGF0YS5cbiAqL1xuZnVuY3Rpb24gZ2V0TWFwRGF0YShtYXAsIGtleSkge1xuICB2YXIgZGF0YSA9IG1hcC5fX2RhdGFfXztcbiAgcmV0dXJuIGlzS2V5YWJsZShrZXkpXG4gICAgPyBkYXRhW3R5cGVvZiBrZXkgPT0gJ3N0cmluZycgPyAnc3RyaW5nJyA6ICdoYXNoJ11cbiAgICA6IGRhdGEubWFwO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldE1hcERhdGE7XG4iLCJ2YXIgZ2V0TWFwRGF0YSA9IHJlcXVpcmUoJy4vX2dldE1hcERhdGEnKTtcblxuLyoqXG4gKiBSZW1vdmVzIGBrZXlgIGFuZCBpdHMgdmFsdWUgZnJvbSB0aGUgbWFwLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBkZWxldGVcbiAqIEBtZW1iZXJPZiBNYXBDYWNoZVxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byByZW1vdmUuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGVudHJ5IHdhcyByZW1vdmVkLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIG1hcENhY2hlRGVsZXRlKGtleSkge1xuICB2YXIgcmVzdWx0ID0gZ2V0TWFwRGF0YSh0aGlzLCBrZXkpWydkZWxldGUnXShrZXkpO1xuICB0aGlzLnNpemUgLT0gcmVzdWx0ID8gMSA6IDA7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbWFwQ2FjaGVEZWxldGU7XG4iLCJ2YXIgZ2V0TWFwRGF0YSA9IHJlcXVpcmUoJy4vX2dldE1hcERhdGEnKTtcblxuLyoqXG4gKiBHZXRzIHRoZSBtYXAgdmFsdWUgZm9yIGBrZXlgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBnZXRcbiAqIEBtZW1iZXJPZiBNYXBDYWNoZVxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byBnZXQuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgZW50cnkgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIG1hcENhY2hlR2V0KGtleSkge1xuICByZXR1cm4gZ2V0TWFwRGF0YSh0aGlzLCBrZXkpLmdldChrZXkpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG1hcENhY2hlR2V0O1xuIiwidmFyIGdldE1hcERhdGEgPSByZXF1aXJlKCcuL19nZXRNYXBEYXRhJyk7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGEgbWFwIHZhbHVlIGZvciBga2V5YCBleGlzdHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGhhc1xuICogQG1lbWJlck9mIE1hcENhY2hlXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIGVudHJ5IHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGFuIGVudHJ5IGZvciBga2V5YCBleGlzdHMsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gbWFwQ2FjaGVIYXMoa2V5KSB7XG4gIHJldHVybiBnZXRNYXBEYXRhKHRoaXMsIGtleSkuaGFzKGtleSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbWFwQ2FjaGVIYXM7XG4iLCJ2YXIgZ2V0TWFwRGF0YSA9IHJlcXVpcmUoJy4vX2dldE1hcERhdGEnKTtcblxuLyoqXG4gKiBTZXRzIHRoZSBtYXAgYGtleWAgdG8gYHZhbHVlYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgc2V0XG4gKiBAbWVtYmVyT2YgTWFwQ2FjaGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gc2V0LlxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gc2V0LlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgbWFwIGNhY2hlIGluc3RhbmNlLlxuICovXG5mdW5jdGlvbiBtYXBDYWNoZVNldChrZXksIHZhbHVlKSB7XG4gIHZhciBkYXRhID0gZ2V0TWFwRGF0YSh0aGlzLCBrZXkpLFxuICAgICAgc2l6ZSA9IGRhdGEuc2l6ZTtcblxuICBkYXRhLnNldChrZXksIHZhbHVlKTtcbiAgdGhpcy5zaXplICs9IGRhdGEuc2l6ZSA9PSBzaXplID8gMCA6IDE7XG4gIHJldHVybiB0aGlzO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG1hcENhY2hlU2V0O1xuIiwidmFyIG1hcENhY2hlQ2xlYXIgPSByZXF1aXJlKCcuL19tYXBDYWNoZUNsZWFyJyksXG4gICAgbWFwQ2FjaGVEZWxldGUgPSByZXF1aXJlKCcuL19tYXBDYWNoZURlbGV0ZScpLFxuICAgIG1hcENhY2hlR2V0ID0gcmVxdWlyZSgnLi9fbWFwQ2FjaGVHZXQnKSxcbiAgICBtYXBDYWNoZUhhcyA9IHJlcXVpcmUoJy4vX21hcENhY2hlSGFzJyksXG4gICAgbWFwQ2FjaGVTZXQgPSByZXF1aXJlKCcuL19tYXBDYWNoZVNldCcpO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBtYXAgY2FjaGUgb2JqZWN0IHRvIHN0b3JlIGtleS12YWx1ZSBwYWlycy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge0FycmF5fSBbZW50cmllc10gVGhlIGtleS12YWx1ZSBwYWlycyB0byBjYWNoZS5cbiAqL1xuZnVuY3Rpb24gTWFwQ2FjaGUoZW50cmllcykge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IGVudHJpZXMgPT0gbnVsbCA/IDAgOiBlbnRyaWVzLmxlbmd0aDtcblxuICB0aGlzLmNsZWFyKCk7XG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgdmFyIGVudHJ5ID0gZW50cmllc1tpbmRleF07XG4gICAgdGhpcy5zZXQoZW50cnlbMF0sIGVudHJ5WzFdKTtcbiAgfVxufVxuXG4vLyBBZGQgbWV0aG9kcyB0byBgTWFwQ2FjaGVgLlxuTWFwQ2FjaGUucHJvdG90eXBlLmNsZWFyID0gbWFwQ2FjaGVDbGVhcjtcbk1hcENhY2hlLnByb3RvdHlwZVsnZGVsZXRlJ10gPSBtYXBDYWNoZURlbGV0ZTtcbk1hcENhY2hlLnByb3RvdHlwZS5nZXQgPSBtYXBDYWNoZUdldDtcbk1hcENhY2hlLnByb3RvdHlwZS5oYXMgPSBtYXBDYWNoZUhhcztcbk1hcENhY2hlLnByb3RvdHlwZS5zZXQgPSBtYXBDYWNoZVNldDtcblxubW9kdWxlLmV4cG9ydHMgPSBNYXBDYWNoZTtcbiIsInZhciBMaXN0Q2FjaGUgPSByZXF1aXJlKCcuL19MaXN0Q2FjaGUnKSxcbiAgICBNYXAgPSByZXF1aXJlKCcuL19NYXAnKSxcbiAgICBNYXBDYWNoZSA9IHJlcXVpcmUoJy4vX01hcENhY2hlJyk7XG5cbi8qKiBVc2VkIGFzIHRoZSBzaXplIHRvIGVuYWJsZSBsYXJnZSBhcnJheSBvcHRpbWl6YXRpb25zLiAqL1xudmFyIExBUkdFX0FSUkFZX1NJWkUgPSAyMDA7XG5cbi8qKlxuICogU2V0cyB0aGUgc3RhY2sgYGtleWAgdG8gYHZhbHVlYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgc2V0XG4gKiBAbWVtYmVyT2YgU3RhY2tcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gc2V0LlxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gc2V0LlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgc3RhY2sgY2FjaGUgaW5zdGFuY2UuXG4gKi9cbmZ1bmN0aW9uIHN0YWNrU2V0KGtleSwgdmFsdWUpIHtcbiAgdmFyIGRhdGEgPSB0aGlzLl9fZGF0YV9fO1xuICBpZiAoZGF0YSBpbnN0YW5jZW9mIExpc3RDYWNoZSkge1xuICAgIHZhciBwYWlycyA9IGRhdGEuX19kYXRhX187XG4gICAgaWYgKCFNYXAgfHwgKHBhaXJzLmxlbmd0aCA8IExBUkdFX0FSUkFZX1NJWkUgLSAxKSkge1xuICAgICAgcGFpcnMucHVzaChba2V5LCB2YWx1ZV0pO1xuICAgICAgdGhpcy5zaXplID0gKytkYXRhLnNpemU7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgZGF0YSA9IHRoaXMuX19kYXRhX18gPSBuZXcgTWFwQ2FjaGUocGFpcnMpO1xuICB9XG4gIGRhdGEuc2V0KGtleSwgdmFsdWUpO1xuICB0aGlzLnNpemUgPSBkYXRhLnNpemU7XG4gIHJldHVybiB0aGlzO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHN0YWNrU2V0O1xuIiwidmFyIExpc3RDYWNoZSA9IHJlcXVpcmUoJy4vX0xpc3RDYWNoZScpLFxuICAgIHN0YWNrQ2xlYXIgPSByZXF1aXJlKCcuL19zdGFja0NsZWFyJyksXG4gICAgc3RhY2tEZWxldGUgPSByZXF1aXJlKCcuL19zdGFja0RlbGV0ZScpLFxuICAgIHN0YWNrR2V0ID0gcmVxdWlyZSgnLi9fc3RhY2tHZXQnKSxcbiAgICBzdGFja0hhcyA9IHJlcXVpcmUoJy4vX3N0YWNrSGFzJyksXG4gICAgc3RhY2tTZXQgPSByZXF1aXJlKCcuL19zdGFja1NldCcpO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBzdGFjayBjYWNoZSBvYmplY3QgdG8gc3RvcmUga2V5LXZhbHVlIHBhaXJzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7QXJyYXl9IFtlbnRyaWVzXSBUaGUga2V5LXZhbHVlIHBhaXJzIHRvIGNhY2hlLlxuICovXG5mdW5jdGlvbiBTdGFjayhlbnRyaWVzKSB7XG4gIHZhciBkYXRhID0gdGhpcy5fX2RhdGFfXyA9IG5ldyBMaXN0Q2FjaGUoZW50cmllcyk7XG4gIHRoaXMuc2l6ZSA9IGRhdGEuc2l6ZTtcbn1cblxuLy8gQWRkIG1ldGhvZHMgdG8gYFN0YWNrYC5cblN0YWNrLnByb3RvdHlwZS5jbGVhciA9IHN0YWNrQ2xlYXI7XG5TdGFjay5wcm90b3R5cGVbJ2RlbGV0ZSddID0gc3RhY2tEZWxldGU7XG5TdGFjay5wcm90b3R5cGUuZ2V0ID0gc3RhY2tHZXQ7XG5TdGFjay5wcm90b3R5cGUuaGFzID0gc3RhY2tIYXM7XG5TdGFjay5wcm90b3R5cGUuc2V0ID0gc3RhY2tTZXQ7XG5cbm1vZHVsZS5leHBvcnRzID0gU3RhY2s7XG4iLCIvKipcbiAqIEEgc3BlY2lhbGl6ZWQgdmVyc2lvbiBvZiBgXy5mb3JFYWNoYCBmb3IgYXJyYXlzIHdpdGhvdXQgc3VwcG9ydCBmb3JcbiAqIGl0ZXJhdGVlIHNob3J0aGFuZHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl9IFthcnJheV0gVGhlIGFycmF5IHRvIGl0ZXJhdGUgb3Zlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdGVlIFRoZSBmdW5jdGlvbiBpbnZva2VkIHBlciBpdGVyYXRpb24uXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgYGFycmF5YC5cbiAqL1xuZnVuY3Rpb24gYXJyYXlFYWNoKGFycmF5LCBpdGVyYXRlZSkge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IGFycmF5ID09IG51bGwgPyAwIDogYXJyYXkubGVuZ3RoO1xuXG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgaWYgKGl0ZXJhdGVlKGFycmF5W2luZGV4XSwgaW5kZXgsIGFycmF5KSA9PT0gZmFsc2UpIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gYXJyYXk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYXJyYXlFYWNoO1xuIiwidmFyIGdldE5hdGl2ZSA9IHJlcXVpcmUoJy4vX2dldE5hdGl2ZScpO1xuXG52YXIgZGVmaW5lUHJvcGVydHkgPSAoZnVuY3Rpb24oKSB7XG4gIHRyeSB7XG4gICAgdmFyIGZ1bmMgPSBnZXROYXRpdmUoT2JqZWN0LCAnZGVmaW5lUHJvcGVydHknKTtcbiAgICBmdW5jKHt9LCAnJywge30pO1xuICAgIHJldHVybiBmdW5jO1xuICB9IGNhdGNoIChlKSB7fVxufSgpKTtcblxubW9kdWxlLmV4cG9ydHMgPSBkZWZpbmVQcm9wZXJ0eTtcbiIsInZhciBkZWZpbmVQcm9wZXJ0eSA9IHJlcXVpcmUoJy4vX2RlZmluZVByb3BlcnR5Jyk7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYGFzc2lnblZhbHVlYCBhbmQgYGFzc2lnbk1lcmdlVmFsdWVgIHdpdGhvdXRcbiAqIHZhbHVlIGNoZWNrcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIG1vZGlmeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgcHJvcGVydHkgdG8gYXNzaWduLlxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gYXNzaWduLlxuICovXG5mdW5jdGlvbiBiYXNlQXNzaWduVmFsdWUob2JqZWN0LCBrZXksIHZhbHVlKSB7XG4gIGlmIChrZXkgPT0gJ19fcHJvdG9fXycgJiYgZGVmaW5lUHJvcGVydHkpIHtcbiAgICBkZWZpbmVQcm9wZXJ0eShvYmplY3QsIGtleSwge1xuICAgICAgJ2NvbmZpZ3VyYWJsZSc6IHRydWUsXG4gICAgICAnZW51bWVyYWJsZSc6IHRydWUsXG4gICAgICAndmFsdWUnOiB2YWx1ZSxcbiAgICAgICd3cml0YWJsZSc6IHRydWVcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICBvYmplY3Rba2V5XSA9IHZhbHVlO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUFzc2lnblZhbHVlO1xuIiwidmFyIGJhc2VBc3NpZ25WYWx1ZSA9IHJlcXVpcmUoJy4vX2Jhc2VBc3NpZ25WYWx1ZScpLFxuICAgIGVxID0gcmVxdWlyZSgnLi9lcScpO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIEFzc2lnbnMgYHZhbHVlYCB0byBga2V5YCBvZiBgb2JqZWN0YCBpZiB0aGUgZXhpc3RpbmcgdmFsdWUgaXMgbm90IGVxdWl2YWxlbnRcbiAqIHVzaW5nIFtgU2FtZVZhbHVlWmVyb2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLXNhbWV2YWx1ZXplcm8pXG4gKiBmb3IgZXF1YWxpdHkgY29tcGFyaXNvbnMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBtb2RpZnkuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHByb3BlcnR5IHRvIGFzc2lnbi5cbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGFzc2lnbi5cbiAqL1xuZnVuY3Rpb24gYXNzaWduVmFsdWUob2JqZWN0LCBrZXksIHZhbHVlKSB7XG4gIHZhciBvYmpWYWx1ZSA9IG9iamVjdFtrZXldO1xuICBpZiAoIShoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwga2V5KSAmJiBlcShvYmpWYWx1ZSwgdmFsdWUpKSB8fFxuICAgICAgKHZhbHVlID09PSB1bmRlZmluZWQgJiYgIShrZXkgaW4gb2JqZWN0KSkpIHtcbiAgICBiYXNlQXNzaWduVmFsdWUob2JqZWN0LCBrZXksIHZhbHVlKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFzc2lnblZhbHVlO1xuIiwidmFyIGFzc2lnblZhbHVlID0gcmVxdWlyZSgnLi9fYXNzaWduVmFsdWUnKSxcbiAgICBiYXNlQXNzaWduVmFsdWUgPSByZXF1aXJlKCcuL19iYXNlQXNzaWduVmFsdWUnKTtcblxuLyoqXG4gKiBDb3BpZXMgcHJvcGVydGllcyBvZiBgc291cmNlYCB0byBgb2JqZWN0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IHNvdXJjZSBUaGUgb2JqZWN0IHRvIGNvcHkgcHJvcGVydGllcyBmcm9tLlxuICogQHBhcmFtIHtBcnJheX0gcHJvcHMgVGhlIHByb3BlcnR5IGlkZW50aWZpZXJzIHRvIGNvcHkuXG4gKiBAcGFyYW0ge09iamVjdH0gW29iamVjdD17fV0gVGhlIG9iamVjdCB0byBjb3B5IHByb3BlcnRpZXMgdG8uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY3VzdG9taXplcl0gVGhlIGZ1bmN0aW9uIHRvIGN1c3RvbWl6ZSBjb3BpZWQgdmFsdWVzLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBgb2JqZWN0YC5cbiAqL1xuZnVuY3Rpb24gY29weU9iamVjdChzb3VyY2UsIHByb3BzLCBvYmplY3QsIGN1c3RvbWl6ZXIpIHtcbiAgdmFyIGlzTmV3ID0gIW9iamVjdDtcbiAgb2JqZWN0IHx8IChvYmplY3QgPSB7fSk7XG5cbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBwcm9wcy5sZW5ndGg7XG5cbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICB2YXIga2V5ID0gcHJvcHNbaW5kZXhdO1xuXG4gICAgdmFyIG5ld1ZhbHVlID0gY3VzdG9taXplclxuICAgICAgPyBjdXN0b21pemVyKG9iamVjdFtrZXldLCBzb3VyY2Vba2V5XSwga2V5LCBvYmplY3QsIHNvdXJjZSlcbiAgICAgIDogdW5kZWZpbmVkO1xuXG4gICAgaWYgKG5ld1ZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIG5ld1ZhbHVlID0gc291cmNlW2tleV07XG4gICAgfVxuICAgIGlmIChpc05ldykge1xuICAgICAgYmFzZUFzc2lnblZhbHVlKG9iamVjdCwga2V5LCBuZXdWYWx1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFzc2lnblZhbHVlKG9iamVjdCwga2V5LCBuZXdWYWx1ZSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBvYmplY3Q7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY29weU9iamVjdDtcbiIsIi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8udGltZXNgIHdpdGhvdXQgc3VwcG9ydCBmb3IgaXRlcmF0ZWUgc2hvcnRoYW5kc1xuICogb3IgbWF4IGFycmF5IGxlbmd0aCBjaGVja3MuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7bnVtYmVyfSBuIFRoZSBudW1iZXIgb2YgdGltZXMgdG8gaW52b2tlIGBpdGVyYXRlZWAuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRlZSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiByZXN1bHRzLlxuICovXG5mdW5jdGlvbiBiYXNlVGltZXMobiwgaXRlcmF0ZWUpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICByZXN1bHQgPSBBcnJheShuKTtcblxuICB3aGlsZSAoKytpbmRleCA8IG4pIHtcbiAgICByZXN1bHRbaW5kZXhdID0gaXRlcmF0ZWUoaW5kZXgpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZVRpbWVzO1xuIiwiLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZS4gQSB2YWx1ZSBpcyBvYmplY3QtbGlrZSBpZiBpdCdzIG5vdCBgbnVsbGBcbiAqIGFuZCBoYXMgYSBgdHlwZW9mYCByZXN1bHQgb2YgXCJvYmplY3RcIi5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZSwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZSh7fSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdExpa2UoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShfLm5vb3ApO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShudWxsKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0TGlrZSh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgIT0gbnVsbCAmJiB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCc7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNPYmplY3RMaWtlO1xuIiwidmFyIGJhc2VHZXRUYWcgPSByZXF1aXJlKCcuL19iYXNlR2V0VGFnJyksXG4gICAgaXNPYmplY3RMaWtlID0gcmVxdWlyZSgnLi9pc09iamVjdExpa2UnKTtcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIGFyZ3NUYWcgPSAnW29iamVjdCBBcmd1bWVudHNdJztcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5pc0FyZ3VtZW50c2AuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYW4gYGFyZ3VtZW50c2Agb2JqZWN0LFxuICovXG5mdW5jdGlvbiBiYXNlSXNBcmd1bWVudHModmFsdWUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0TGlrZSh2YWx1ZSkgJiYgYmFzZUdldFRhZyh2YWx1ZSkgPT0gYXJnc1RhZztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlSXNBcmd1bWVudHM7XG4iLCJ2YXIgYmFzZUlzQXJndW1lbnRzID0gcmVxdWlyZSgnLi9fYmFzZUlzQXJndW1lbnRzJyksXG4gICAgaXNPYmplY3RMaWtlID0gcmVxdWlyZSgnLi9pc09iamVjdExpa2UnKTtcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgcHJvcGVydHlJc0VudW1lcmFibGUgPSBvYmplY3RQcm90by5wcm9wZXJ0eUlzRW51bWVyYWJsZTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBsaWtlbHkgYW4gYGFyZ3VtZW50c2Agb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFuIGBhcmd1bWVudHNgIG9iamVjdCxcbiAqICBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNBcmd1bWVudHMoZnVuY3Rpb24oKSB7IHJldHVybiBhcmd1bWVudHM7IH0oKSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0FyZ3VtZW50cyhbMSwgMiwgM10pO1xuICogLy8gPT4gZmFsc2VcbiAqL1xudmFyIGlzQXJndW1lbnRzID0gYmFzZUlzQXJndW1lbnRzKGZ1bmN0aW9uKCkgeyByZXR1cm4gYXJndW1lbnRzOyB9KCkpID8gYmFzZUlzQXJndW1lbnRzIDogZnVuY3Rpb24odmFsdWUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0TGlrZSh2YWx1ZSkgJiYgaGFzT3duUHJvcGVydHkuY2FsbCh2YWx1ZSwgJ2NhbGxlZScpICYmXG4gICAgIXByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwodmFsdWUsICdjYWxsZWUnKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gaXNBcmd1bWVudHM7XG4iLCIvKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYW4gYEFycmF5YCBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYW4gYXJyYXksIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0FycmF5KFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0FycmF5KGRvY3VtZW50LmJvZHkuY2hpbGRyZW4pO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzQXJyYXkoJ2FiYycpO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzQXJyYXkoXy5ub29wKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheTtcblxubW9kdWxlLmV4cG9ydHMgPSBpc0FycmF5O1xuIiwiLyoqXG4gKiBUaGlzIG1ldGhvZCByZXR1cm5zIGBmYWxzZWAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjEzLjBcbiAqIEBjYXRlZ29yeSBVdGlsXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLnRpbWVzKDIsIF8uc3R1YkZhbHNlKTtcbiAqIC8vID0+IFtmYWxzZSwgZmFsc2VdXG4gKi9cbmZ1bmN0aW9uIHN0dWJGYWxzZSgpIHtcbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHN0dWJGYWxzZTtcbiIsInZhciByb290ID0gcmVxdWlyZSgnLi9fcm9vdCcpLFxuICAgIHN0dWJGYWxzZSA9IHJlcXVpcmUoJy4vc3R1YkZhbHNlJyk7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgZXhwb3J0c2AuICovXG52YXIgZnJlZUV4cG9ydHMgPSB0eXBlb2YgZXhwb3J0cyA9PSAnb2JqZWN0JyAmJiBleHBvcnRzICYmICFleHBvcnRzLm5vZGVUeXBlICYmIGV4cG9ydHM7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgbW9kdWxlYC4gKi9cbnZhciBmcmVlTW9kdWxlID0gZnJlZUV4cG9ydHMgJiYgdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUgJiYgIW1vZHVsZS5ub2RlVHlwZSAmJiBtb2R1bGU7XG5cbi8qKiBEZXRlY3QgdGhlIHBvcHVsYXIgQ29tbW9uSlMgZXh0ZW5zaW9uIGBtb2R1bGUuZXhwb3J0c2AuICovXG52YXIgbW9kdWxlRXhwb3J0cyA9IGZyZWVNb2R1bGUgJiYgZnJlZU1vZHVsZS5leHBvcnRzID09PSBmcmVlRXhwb3J0cztcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgQnVmZmVyID0gbW9kdWxlRXhwb3J0cyA/IHJvb3QuQnVmZmVyIDogdW5kZWZpbmVkO1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyBmb3IgdGhvc2Ugd2l0aCB0aGUgc2FtZSBuYW1lIGFzIG90aGVyIGBsb2Rhc2hgIG1ldGhvZHMuICovXG52YXIgbmF0aXZlSXNCdWZmZXIgPSBCdWZmZXIgPyBCdWZmZXIuaXNCdWZmZXIgOiB1bmRlZmluZWQ7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSBidWZmZXIuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjMuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBidWZmZXIsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0J1ZmZlcihuZXcgQnVmZmVyKDIpKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQnVmZmVyKG5ldyBVaW50OEFycmF5KDIpKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbnZhciBpc0J1ZmZlciA9IG5hdGl2ZUlzQnVmZmVyIHx8IHN0dWJGYWxzZTtcblxubW9kdWxlLmV4cG9ydHMgPSBpc0J1ZmZlcjtcbiIsIi8qKiBVc2VkIGFzIHJlZmVyZW5jZXMgZm9yIHZhcmlvdXMgYE51bWJlcmAgY29uc3RhbnRzLiAqL1xudmFyIE1BWF9TQUZFX0lOVEVHRVIgPSA5MDA3MTk5MjU0NzQwOTkxO1xuXG4vKiogVXNlZCB0byBkZXRlY3QgdW5zaWduZWQgaW50ZWdlciB2YWx1ZXMuICovXG52YXIgcmVJc1VpbnQgPSAvXig/OjB8WzEtOV1cXGQqKSQvO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgdmFsaWQgYXJyYXktbGlrZSBpbmRleC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcGFyYW0ge251bWJlcn0gW2xlbmd0aD1NQVhfU0FGRV9JTlRFR0VSXSBUaGUgdXBwZXIgYm91bmRzIG9mIGEgdmFsaWQgaW5kZXguXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHZhbGlkIGluZGV4LCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGlzSW5kZXgodmFsdWUsIGxlbmd0aCkge1xuICBsZW5ndGggPSBsZW5ndGggPT0gbnVsbCA/IE1BWF9TQUZFX0lOVEVHRVIgOiBsZW5ndGg7XG4gIHJldHVybiAhIWxlbmd0aCAmJlxuICAgICh0eXBlb2YgdmFsdWUgPT0gJ251bWJlcicgfHwgcmVJc1VpbnQudGVzdCh2YWx1ZSkpICYmXG4gICAgKHZhbHVlID4gLTEgJiYgdmFsdWUgJSAxID09IDAgJiYgdmFsdWUgPCBsZW5ndGgpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzSW5kZXg7XG4iLCIvKiogVXNlZCBhcyByZWZlcmVuY2VzIGZvciB2YXJpb3VzIGBOdW1iZXJgIGNvbnN0YW50cy4gKi9cbnZhciBNQVhfU0FGRV9JTlRFR0VSID0gOTAwNzE5OTI1NDc0MDk5MTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIHZhbGlkIGFycmF5LWxpa2UgbGVuZ3RoLlxuICpcbiAqICoqTm90ZToqKiBUaGlzIG1ldGhvZCBpcyBsb29zZWx5IGJhc2VkIG9uXG4gKiBbYFRvTGVuZ3RoYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtdG9sZW5ndGgpLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgdmFsaWQgbGVuZ3RoLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNMZW5ndGgoMyk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0xlbmd0aChOdW1iZXIuTUlOX1ZBTFVFKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc0xlbmd0aChJbmZpbml0eSk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNMZW5ndGgoJzMnKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzTGVuZ3RoKHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT0gJ251bWJlcicgJiZcbiAgICB2YWx1ZSA+IC0xICYmIHZhbHVlICUgMSA9PSAwICYmIHZhbHVlIDw9IE1BWF9TQUZFX0lOVEVHRVI7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNMZW5ndGg7XG4iLCJ2YXIgYmFzZUdldFRhZyA9IHJlcXVpcmUoJy4vX2Jhc2VHZXRUYWcnKSxcbiAgICBpc0xlbmd0aCA9IHJlcXVpcmUoJy4vaXNMZW5ndGgnKSxcbiAgICBpc09iamVjdExpa2UgPSByZXF1aXJlKCcuL2lzT2JqZWN0TGlrZScpO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgYXJnc1RhZyA9ICdbb2JqZWN0IEFyZ3VtZW50c10nLFxuICAgIGFycmF5VGFnID0gJ1tvYmplY3QgQXJyYXldJyxcbiAgICBib29sVGFnID0gJ1tvYmplY3QgQm9vbGVhbl0nLFxuICAgIGRhdGVUYWcgPSAnW29iamVjdCBEYXRlXScsXG4gICAgZXJyb3JUYWcgPSAnW29iamVjdCBFcnJvcl0nLFxuICAgIGZ1bmNUYWcgPSAnW29iamVjdCBGdW5jdGlvbl0nLFxuICAgIG1hcFRhZyA9ICdbb2JqZWN0IE1hcF0nLFxuICAgIG51bWJlclRhZyA9ICdbb2JqZWN0IE51bWJlcl0nLFxuICAgIG9iamVjdFRhZyA9ICdbb2JqZWN0IE9iamVjdF0nLFxuICAgIHJlZ2V4cFRhZyA9ICdbb2JqZWN0IFJlZ0V4cF0nLFxuICAgIHNldFRhZyA9ICdbb2JqZWN0IFNldF0nLFxuICAgIHN0cmluZ1RhZyA9ICdbb2JqZWN0IFN0cmluZ10nLFxuICAgIHdlYWtNYXBUYWcgPSAnW29iamVjdCBXZWFrTWFwXSc7XG5cbnZhciBhcnJheUJ1ZmZlclRhZyA9ICdbb2JqZWN0IEFycmF5QnVmZmVyXScsXG4gICAgZGF0YVZpZXdUYWcgPSAnW29iamVjdCBEYXRhVmlld10nLFxuICAgIGZsb2F0MzJUYWcgPSAnW29iamVjdCBGbG9hdDMyQXJyYXldJyxcbiAgICBmbG9hdDY0VGFnID0gJ1tvYmplY3QgRmxvYXQ2NEFycmF5XScsXG4gICAgaW50OFRhZyA9ICdbb2JqZWN0IEludDhBcnJheV0nLFxuICAgIGludDE2VGFnID0gJ1tvYmplY3QgSW50MTZBcnJheV0nLFxuICAgIGludDMyVGFnID0gJ1tvYmplY3QgSW50MzJBcnJheV0nLFxuICAgIHVpbnQ4VGFnID0gJ1tvYmplY3QgVWludDhBcnJheV0nLFxuICAgIHVpbnQ4Q2xhbXBlZFRhZyA9ICdbb2JqZWN0IFVpbnQ4Q2xhbXBlZEFycmF5XScsXG4gICAgdWludDE2VGFnID0gJ1tvYmplY3QgVWludDE2QXJyYXldJyxcbiAgICB1aW50MzJUYWcgPSAnW29iamVjdCBVaW50MzJBcnJheV0nO1xuXG4vKiogVXNlZCB0byBpZGVudGlmeSBgdG9TdHJpbmdUYWdgIHZhbHVlcyBvZiB0eXBlZCBhcnJheXMuICovXG52YXIgdHlwZWRBcnJheVRhZ3MgPSB7fTtcbnR5cGVkQXJyYXlUYWdzW2Zsb2F0MzJUYWddID0gdHlwZWRBcnJheVRhZ3NbZmxvYXQ2NFRhZ10gPVxudHlwZWRBcnJheVRhZ3NbaW50OFRhZ10gPSB0eXBlZEFycmF5VGFnc1tpbnQxNlRhZ10gPVxudHlwZWRBcnJheVRhZ3NbaW50MzJUYWddID0gdHlwZWRBcnJheVRhZ3NbdWludDhUYWddID1cbnR5cGVkQXJyYXlUYWdzW3VpbnQ4Q2xhbXBlZFRhZ10gPSB0eXBlZEFycmF5VGFnc1t1aW50MTZUYWddID1cbnR5cGVkQXJyYXlUYWdzW3VpbnQzMlRhZ10gPSB0cnVlO1xudHlwZWRBcnJheVRhZ3NbYXJnc1RhZ10gPSB0eXBlZEFycmF5VGFnc1thcnJheVRhZ10gPVxudHlwZWRBcnJheVRhZ3NbYXJyYXlCdWZmZXJUYWddID0gdHlwZWRBcnJheVRhZ3NbYm9vbFRhZ10gPVxudHlwZWRBcnJheVRhZ3NbZGF0YVZpZXdUYWddID0gdHlwZWRBcnJheVRhZ3NbZGF0ZVRhZ10gPVxudHlwZWRBcnJheVRhZ3NbZXJyb3JUYWddID0gdHlwZWRBcnJheVRhZ3NbZnVuY1RhZ10gPVxudHlwZWRBcnJheVRhZ3NbbWFwVGFnXSA9IHR5cGVkQXJyYXlUYWdzW251bWJlclRhZ10gPVxudHlwZWRBcnJheVRhZ3Nbb2JqZWN0VGFnXSA9IHR5cGVkQXJyYXlUYWdzW3JlZ2V4cFRhZ10gPVxudHlwZWRBcnJheVRhZ3Nbc2V0VGFnXSA9IHR5cGVkQXJyYXlUYWdzW3N0cmluZ1RhZ10gPVxudHlwZWRBcnJheVRhZ3Nbd2Vha01hcFRhZ10gPSBmYWxzZTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5pc1R5cGVkQXJyYXlgIHdpdGhvdXQgTm9kZS5qcyBvcHRpbWl6YXRpb25zLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgdHlwZWQgYXJyYXksIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gYmFzZUlzVHlwZWRBcnJheSh2YWx1ZSkge1xuICByZXR1cm4gaXNPYmplY3RMaWtlKHZhbHVlKSAmJlxuICAgIGlzTGVuZ3RoKHZhbHVlLmxlbmd0aCkgJiYgISF0eXBlZEFycmF5VGFnc1tiYXNlR2V0VGFnKHZhbHVlKV07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUlzVHlwZWRBcnJheTtcbiIsIi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8udW5hcnlgIHdpdGhvdXQgc3VwcG9ydCBmb3Igc3RvcmluZyBtZXRhZGF0YS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gY2FwIGFyZ3VtZW50cyBmb3IuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBjYXBwZWQgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGJhc2VVbmFyeShmdW5jKSB7XG4gIHJldHVybiBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHJldHVybiBmdW5jKHZhbHVlKTtcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlVW5hcnk7XG4iLCJ2YXIgZnJlZUdsb2JhbCA9IHJlcXVpcmUoJy4vX2ZyZWVHbG9iYWwnKTtcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBleHBvcnRzYC4gKi9cbnZhciBmcmVlRXhwb3J0cyA9IHR5cGVvZiBleHBvcnRzID09ICdvYmplY3QnICYmIGV4cG9ydHMgJiYgIWV4cG9ydHMubm9kZVR5cGUgJiYgZXhwb3J0cztcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBtb2R1bGVgLiAqL1xudmFyIGZyZWVNb2R1bGUgPSBmcmVlRXhwb3J0cyAmJiB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZSAmJiAhbW9kdWxlLm5vZGVUeXBlICYmIG1vZHVsZTtcblxuLyoqIERldGVjdCB0aGUgcG9wdWxhciBDb21tb25KUyBleHRlbnNpb24gYG1vZHVsZS5leHBvcnRzYC4gKi9cbnZhciBtb2R1bGVFeHBvcnRzID0gZnJlZU1vZHVsZSAmJiBmcmVlTW9kdWxlLmV4cG9ydHMgPT09IGZyZWVFeHBvcnRzO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYHByb2Nlc3NgIGZyb20gTm9kZS5qcy4gKi9cbnZhciBmcmVlUHJvY2VzcyA9IG1vZHVsZUV4cG9ydHMgJiYgZnJlZUdsb2JhbC5wcm9jZXNzO1xuXG4vKiogVXNlZCB0byBhY2Nlc3MgZmFzdGVyIE5vZGUuanMgaGVscGVycy4gKi9cbnZhciBub2RlVXRpbCA9IChmdW5jdGlvbigpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gZnJlZVByb2Nlc3MgJiYgZnJlZVByb2Nlc3MuYmluZGluZyAmJiBmcmVlUHJvY2Vzcy5iaW5kaW5nKCd1dGlsJyk7XG4gIH0gY2F0Y2ggKGUpIHt9XG59KCkpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5vZGVVdGlsO1xuIiwidmFyIGJhc2VJc1R5cGVkQXJyYXkgPSByZXF1aXJlKCcuL19iYXNlSXNUeXBlZEFycmF5JyksXG4gICAgYmFzZVVuYXJ5ID0gcmVxdWlyZSgnLi9fYmFzZVVuYXJ5JyksXG4gICAgbm9kZVV0aWwgPSByZXF1aXJlKCcuL19ub2RlVXRpbCcpO1xuXG4vKiBOb2RlLmpzIGhlbHBlciByZWZlcmVuY2VzLiAqL1xudmFyIG5vZGVJc1R5cGVkQXJyYXkgPSBub2RlVXRpbCAmJiBub2RlVXRpbC5pc1R5cGVkQXJyYXk7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgY2xhc3NpZmllZCBhcyBhIHR5cGVkIGFycmF5LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMy4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgdHlwZWQgYXJyYXksIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc1R5cGVkQXJyYXkobmV3IFVpbnQ4QXJyYXkpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNUeXBlZEFycmF5KFtdKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbnZhciBpc1R5cGVkQXJyYXkgPSBub2RlSXNUeXBlZEFycmF5ID8gYmFzZVVuYXJ5KG5vZGVJc1R5cGVkQXJyYXkpIDogYmFzZUlzVHlwZWRBcnJheTtcblxubW9kdWxlLmV4cG9ydHMgPSBpc1R5cGVkQXJyYXk7XG4iLCJ2YXIgYmFzZVRpbWVzID0gcmVxdWlyZSgnLi9fYmFzZVRpbWVzJyksXG4gICAgaXNBcmd1bWVudHMgPSByZXF1aXJlKCcuL2lzQXJndW1lbnRzJyksXG4gICAgaXNBcnJheSA9IHJlcXVpcmUoJy4vaXNBcnJheScpLFxuICAgIGlzQnVmZmVyID0gcmVxdWlyZSgnLi9pc0J1ZmZlcicpLFxuICAgIGlzSW5kZXggPSByZXF1aXJlKCcuL19pc0luZGV4JyksXG4gICAgaXNUeXBlZEFycmF5ID0gcmVxdWlyZSgnLi9pc1R5cGVkQXJyYXknKTtcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGFycmF5IG9mIHRoZSBlbnVtZXJhYmxlIHByb3BlcnR5IG5hbWVzIG9mIHRoZSBhcnJheS1saWtlIGB2YWx1ZWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHF1ZXJ5LlxuICogQHBhcmFtIHtib29sZWFufSBpbmhlcml0ZWQgU3BlY2lmeSByZXR1cm5pbmcgaW5oZXJpdGVkIHByb3BlcnR5IG5hbWVzLlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcy5cbiAqL1xuZnVuY3Rpb24gYXJyYXlMaWtlS2V5cyh2YWx1ZSwgaW5oZXJpdGVkKSB7XG4gIHZhciBpc0FyciA9IGlzQXJyYXkodmFsdWUpLFxuICAgICAgaXNBcmcgPSAhaXNBcnIgJiYgaXNBcmd1bWVudHModmFsdWUpLFxuICAgICAgaXNCdWZmID0gIWlzQXJyICYmICFpc0FyZyAmJiBpc0J1ZmZlcih2YWx1ZSksXG4gICAgICBpc1R5cGUgPSAhaXNBcnIgJiYgIWlzQXJnICYmICFpc0J1ZmYgJiYgaXNUeXBlZEFycmF5KHZhbHVlKSxcbiAgICAgIHNraXBJbmRleGVzID0gaXNBcnIgfHwgaXNBcmcgfHwgaXNCdWZmIHx8IGlzVHlwZSxcbiAgICAgIHJlc3VsdCA9IHNraXBJbmRleGVzID8gYmFzZVRpbWVzKHZhbHVlLmxlbmd0aCwgU3RyaW5nKSA6IFtdLFxuICAgICAgbGVuZ3RoID0gcmVzdWx0Lmxlbmd0aDtcblxuICBmb3IgKHZhciBrZXkgaW4gdmFsdWUpIHtcbiAgICBpZiAoKGluaGVyaXRlZCB8fCBoYXNPd25Qcm9wZXJ0eS5jYWxsKHZhbHVlLCBrZXkpKSAmJlxuICAgICAgICAhKHNraXBJbmRleGVzICYmIChcbiAgICAgICAgICAgLy8gU2FmYXJpIDkgaGFzIGVudW1lcmFibGUgYGFyZ3VtZW50cy5sZW5ndGhgIGluIHN0cmljdCBtb2RlLlxuICAgICAgICAgICBrZXkgPT0gJ2xlbmd0aCcgfHxcbiAgICAgICAgICAgLy8gTm9kZS5qcyAwLjEwIGhhcyBlbnVtZXJhYmxlIG5vbi1pbmRleCBwcm9wZXJ0aWVzIG9uIGJ1ZmZlcnMuXG4gICAgICAgICAgIChpc0J1ZmYgJiYgKGtleSA9PSAnb2Zmc2V0JyB8fCBrZXkgPT0gJ3BhcmVudCcpKSB8fFxuICAgICAgICAgICAvLyBQaGFudG9tSlMgMiBoYXMgZW51bWVyYWJsZSBub24taW5kZXggcHJvcGVydGllcyBvbiB0eXBlZCBhcnJheXMuXG4gICAgICAgICAgIChpc1R5cGUgJiYgKGtleSA9PSAnYnVmZmVyJyB8fCBrZXkgPT0gJ2J5dGVMZW5ndGgnIHx8IGtleSA9PSAnYnl0ZU9mZnNldCcpKSB8fFxuICAgICAgICAgICAvLyBTa2lwIGluZGV4IHByb3BlcnRpZXMuXG4gICAgICAgICAgIGlzSW5kZXgoa2V5LCBsZW5ndGgpXG4gICAgICAgICkpKSB7XG4gICAgICByZXN1bHQucHVzaChrZXkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFycmF5TGlrZUtleXM7XG4iLCIvKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGxpa2VseSBhIHByb3RvdHlwZSBvYmplY3QuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBwcm90b3R5cGUsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaXNQcm90b3R5cGUodmFsdWUpIHtcbiAgdmFyIEN0b3IgPSB2YWx1ZSAmJiB2YWx1ZS5jb25zdHJ1Y3RvcixcbiAgICAgIHByb3RvID0gKHR5cGVvZiBDdG9yID09ICdmdW5jdGlvbicgJiYgQ3Rvci5wcm90b3R5cGUpIHx8IG9iamVjdFByb3RvO1xuXG4gIHJldHVybiB2YWx1ZSA9PT0gcHJvdG87XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNQcm90b3R5cGU7XG4iLCIvKipcbiAqIENyZWF0ZXMgYSB1bmFyeSBmdW5jdGlvbiB0aGF0IGludm9rZXMgYGZ1bmNgIHdpdGggaXRzIGFyZ3VtZW50IHRyYW5zZm9ybWVkLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byB3cmFwLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gdHJhbnNmb3JtIFRoZSBhcmd1bWVudCB0cmFuc2Zvcm0uXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gb3ZlckFyZyhmdW5jLCB0cmFuc2Zvcm0pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGFyZykge1xuICAgIHJldHVybiBmdW5jKHRyYW5zZm9ybShhcmcpKTtcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBvdmVyQXJnO1xuIiwidmFyIG92ZXJBcmcgPSByZXF1aXJlKCcuL19vdmVyQXJnJyk7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIGZvciB0aG9zZSB3aXRoIHRoZSBzYW1lIG5hbWUgYXMgb3RoZXIgYGxvZGFzaGAgbWV0aG9kcy4gKi9cbnZhciBuYXRpdmVLZXlzID0gb3ZlckFyZyhPYmplY3Qua2V5cywgT2JqZWN0KTtcblxubW9kdWxlLmV4cG9ydHMgPSBuYXRpdmVLZXlzO1xuIiwidmFyIGlzUHJvdG90eXBlID0gcmVxdWlyZSgnLi9faXNQcm90b3R5cGUnKSxcbiAgICBuYXRpdmVLZXlzID0gcmVxdWlyZSgnLi9fbmF0aXZlS2V5cycpO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmtleXNgIHdoaWNoIGRvZXNuJ3QgdHJlYXQgc3BhcnNlIGFycmF5cyBhcyBkZW5zZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcy5cbiAqL1xuZnVuY3Rpb24gYmFzZUtleXMob2JqZWN0KSB7XG4gIGlmICghaXNQcm90b3R5cGUob2JqZWN0KSkge1xuICAgIHJldHVybiBuYXRpdmVLZXlzKG9iamVjdCk7XG4gIH1cbiAgdmFyIHJlc3VsdCA9IFtdO1xuICBmb3IgKHZhciBrZXkgaW4gT2JqZWN0KG9iamVjdCkpIHtcbiAgICBpZiAoaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIGtleSkgJiYga2V5ICE9ICdjb25zdHJ1Y3RvcicpIHtcbiAgICAgIHJlc3VsdC5wdXNoKGtleSk7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUtleXM7XG4iLCJ2YXIgaXNGdW5jdGlvbiA9IHJlcXVpcmUoJy4vaXNGdW5jdGlvbicpLFxuICAgIGlzTGVuZ3RoID0gcmVxdWlyZSgnLi9pc0xlbmd0aCcpO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGFycmF5LWxpa2UuIEEgdmFsdWUgaXMgY29uc2lkZXJlZCBhcnJheS1saWtlIGlmIGl0J3NcbiAqIG5vdCBhIGZ1bmN0aW9uIGFuZCBoYXMgYSBgdmFsdWUubGVuZ3RoYCB0aGF0J3MgYW4gaW50ZWdlciBncmVhdGVyIHRoYW4gb3JcbiAqIGVxdWFsIHRvIGAwYCBhbmQgbGVzcyB0aGFuIG9yIGVxdWFsIHRvIGBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUmAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYXJyYXktbGlrZSwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzQXJyYXlMaWtlKFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0FycmF5TGlrZShkb2N1bWVudC5ib2R5LmNoaWxkcmVuKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQXJyYXlMaWtlKCdhYmMnKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQXJyYXlMaWtlKF8ubm9vcCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0FycmF5TGlrZSh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgIT0gbnVsbCAmJiBpc0xlbmd0aCh2YWx1ZS5sZW5ndGgpICYmICFpc0Z1bmN0aW9uKHZhbHVlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc0FycmF5TGlrZTtcbiIsInZhciBhcnJheUxpa2VLZXlzID0gcmVxdWlyZSgnLi9fYXJyYXlMaWtlS2V5cycpLFxuICAgIGJhc2VLZXlzID0gcmVxdWlyZSgnLi9fYmFzZUtleXMnKSxcbiAgICBpc0FycmF5TGlrZSA9IHJlcXVpcmUoJy4vaXNBcnJheUxpa2UnKTtcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGFycmF5IG9mIHRoZSBvd24gZW51bWVyYWJsZSBwcm9wZXJ0eSBuYW1lcyBvZiBgb2JqZWN0YC5cbiAqXG4gKiAqKk5vdGU6KiogTm9uLW9iamVjdCB2YWx1ZXMgYXJlIGNvZXJjZWQgdG8gb2JqZWN0cy4gU2VlIHRoZVxuICogW0VTIHNwZWNdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLW9iamVjdC5rZXlzKVxuICogZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBAc3RhdGljXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgT2JqZWN0XG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzLlxuICogQGV4YW1wbGVcbiAqXG4gKiBmdW5jdGlvbiBGb28oKSB7XG4gKiAgIHRoaXMuYSA9IDE7XG4gKiAgIHRoaXMuYiA9IDI7XG4gKiB9XG4gKlxuICogRm9vLnByb3RvdHlwZS5jID0gMztcbiAqXG4gKiBfLmtleXMobmV3IEZvbyk7XG4gKiAvLyA9PiBbJ2EnLCAnYiddIChpdGVyYXRpb24gb3JkZXIgaXMgbm90IGd1YXJhbnRlZWQpXG4gKlxuICogXy5rZXlzKCdoaScpO1xuICogLy8gPT4gWycwJywgJzEnXVxuICovXG5mdW5jdGlvbiBrZXlzKG9iamVjdCkge1xuICByZXR1cm4gaXNBcnJheUxpa2Uob2JqZWN0KSA/IGFycmF5TGlrZUtleXMob2JqZWN0KSA6IGJhc2VLZXlzKG9iamVjdCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ga2V5cztcbiIsInZhciBjb3B5T2JqZWN0ID0gcmVxdWlyZSgnLi9fY29weU9iamVjdCcpLFxuICAgIGtleXMgPSByZXF1aXJlKCcuL2tleXMnKTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5hc3NpZ25gIHdpdGhvdXQgc3VwcG9ydCBmb3IgbXVsdGlwbGUgc291cmNlc1xuICogb3IgYGN1c3RvbWl6ZXJgIGZ1bmN0aW9ucy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgZGVzdGluYXRpb24gb2JqZWN0LlxuICogQHBhcmFtIHtPYmplY3R9IHNvdXJjZSBUaGUgc291cmNlIG9iamVjdC5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgYG9iamVjdGAuXG4gKi9cbmZ1bmN0aW9uIGJhc2VBc3NpZ24ob2JqZWN0LCBzb3VyY2UpIHtcbiAgcmV0dXJuIG9iamVjdCAmJiBjb3B5T2JqZWN0KHNvdXJjZSwga2V5cyhzb3VyY2UpLCBvYmplY3QpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VBc3NpZ247XG4iLCIvKipcbiAqIFRoaXMgZnVuY3Rpb24gaXMgbGlrZVxuICogW2BPYmplY3Qua2V5c2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLW9iamVjdC5rZXlzKVxuICogZXhjZXB0IHRoYXQgaXQgaW5jbHVkZXMgaW5oZXJpdGVkIGVudW1lcmFibGUgcHJvcGVydGllcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcy5cbiAqL1xuZnVuY3Rpb24gbmF0aXZlS2V5c0luKG9iamVjdCkge1xuICB2YXIgcmVzdWx0ID0gW107XG4gIGlmIChvYmplY3QgIT0gbnVsbCkge1xuICAgIGZvciAodmFyIGtleSBpbiBPYmplY3Qob2JqZWN0KSkge1xuICAgICAgcmVzdWx0LnB1c2goa2V5KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBuYXRpdmVLZXlzSW47XG4iLCJ2YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuL2lzT2JqZWN0JyksXG4gICAgaXNQcm90b3R5cGUgPSByZXF1aXJlKCcuL19pc1Byb3RvdHlwZScpLFxuICAgIG5hdGl2ZUtleXNJbiA9IHJlcXVpcmUoJy4vX25hdGl2ZUtleXNJbicpO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmtleXNJbmAgd2hpY2ggZG9lc24ndCB0cmVhdCBzcGFyc2UgYXJyYXlzIGFzIGRlbnNlLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzLlxuICovXG5mdW5jdGlvbiBiYXNlS2V5c0luKG9iamVjdCkge1xuICBpZiAoIWlzT2JqZWN0KG9iamVjdCkpIHtcbiAgICByZXR1cm4gbmF0aXZlS2V5c0luKG9iamVjdCk7XG4gIH1cbiAgdmFyIGlzUHJvdG8gPSBpc1Byb3RvdHlwZShvYmplY3QpLFxuICAgICAgcmVzdWx0ID0gW107XG5cbiAgZm9yICh2YXIga2V5IGluIG9iamVjdCkge1xuICAgIGlmICghKGtleSA9PSAnY29uc3RydWN0b3InICYmIChpc1Byb3RvIHx8ICFoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwga2V5KSkpKSB7XG4gICAgICByZXN1bHQucHVzaChrZXkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VLZXlzSW47XG4iLCJ2YXIgYXJyYXlMaWtlS2V5cyA9IHJlcXVpcmUoJy4vX2FycmF5TGlrZUtleXMnKSxcbiAgICBiYXNlS2V5c0luID0gcmVxdWlyZSgnLi9fYmFzZUtleXNJbicpLFxuICAgIGlzQXJyYXlMaWtlID0gcmVxdWlyZSgnLi9pc0FycmF5TGlrZScpO1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gYXJyYXkgb2YgdGhlIG93biBhbmQgaW5oZXJpdGVkIGVudW1lcmFibGUgcHJvcGVydHkgbmFtZXMgb2YgYG9iamVjdGAuXG4gKlxuICogKipOb3RlOioqIE5vbi1vYmplY3QgdmFsdWVzIGFyZSBjb2VyY2VkIHRvIG9iamVjdHMuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAzLjAuMFxuICogQGNhdGVnb3J5IE9iamVjdFxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcy5cbiAqIEBleGFtcGxlXG4gKlxuICogZnVuY3Rpb24gRm9vKCkge1xuICogICB0aGlzLmEgPSAxO1xuICogICB0aGlzLmIgPSAyO1xuICogfVxuICpcbiAqIEZvby5wcm90b3R5cGUuYyA9IDM7XG4gKlxuICogXy5rZXlzSW4obmV3IEZvbyk7XG4gKiAvLyA9PiBbJ2EnLCAnYicsICdjJ10gKGl0ZXJhdGlvbiBvcmRlciBpcyBub3QgZ3VhcmFudGVlZClcbiAqL1xuZnVuY3Rpb24ga2V5c0luKG9iamVjdCkge1xuICByZXR1cm4gaXNBcnJheUxpa2Uob2JqZWN0KSA/IGFycmF5TGlrZUtleXMob2JqZWN0LCB0cnVlKSA6IGJhc2VLZXlzSW4ob2JqZWN0KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBrZXlzSW47XG4iLCJ2YXIgY29weU9iamVjdCA9IHJlcXVpcmUoJy4vX2NvcHlPYmplY3QnKSxcbiAgICBrZXlzSW4gPSByZXF1aXJlKCcuL2tleXNJbicpO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmFzc2lnbkluYCB3aXRob3V0IHN1cHBvcnQgZm9yIG11bHRpcGxlIHNvdXJjZXNcbiAqIG9yIGBjdXN0b21pemVyYCBmdW5jdGlvbnMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIGRlc3RpbmF0aW9uIG9iamVjdC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBzb3VyY2UgVGhlIHNvdXJjZSBvYmplY3QuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGBvYmplY3RgLlxuICovXG5mdW5jdGlvbiBiYXNlQXNzaWduSW4ob2JqZWN0LCBzb3VyY2UpIHtcbiAgcmV0dXJuIG9iamVjdCAmJiBjb3B5T2JqZWN0KHNvdXJjZSwga2V5c0luKHNvdXJjZSksIG9iamVjdCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUFzc2lnbkluO1xuIiwidmFyIHJvb3QgPSByZXF1aXJlKCcuL19yb290Jyk7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgZXhwb3J0c2AuICovXG52YXIgZnJlZUV4cG9ydHMgPSB0eXBlb2YgZXhwb3J0cyA9PSAnb2JqZWN0JyAmJiBleHBvcnRzICYmICFleHBvcnRzLm5vZGVUeXBlICYmIGV4cG9ydHM7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgbW9kdWxlYC4gKi9cbnZhciBmcmVlTW9kdWxlID0gZnJlZUV4cG9ydHMgJiYgdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUgJiYgIW1vZHVsZS5ub2RlVHlwZSAmJiBtb2R1bGU7XG5cbi8qKiBEZXRlY3QgdGhlIHBvcHVsYXIgQ29tbW9uSlMgZXh0ZW5zaW9uIGBtb2R1bGUuZXhwb3J0c2AuICovXG52YXIgbW9kdWxlRXhwb3J0cyA9IGZyZWVNb2R1bGUgJiYgZnJlZU1vZHVsZS5leHBvcnRzID09PSBmcmVlRXhwb3J0cztcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgQnVmZmVyID0gbW9kdWxlRXhwb3J0cyA/IHJvb3QuQnVmZmVyIDogdW5kZWZpbmVkLFxuICAgIGFsbG9jVW5zYWZlID0gQnVmZmVyID8gQnVmZmVyLmFsbG9jVW5zYWZlIDogdW5kZWZpbmVkO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBjbG9uZSBvZiAgYGJ1ZmZlcmAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QnVmZmVyfSBidWZmZXIgVGhlIGJ1ZmZlciB0byBjbG9uZS5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzRGVlcF0gU3BlY2lmeSBhIGRlZXAgY2xvbmUuXG4gKiBAcmV0dXJucyB7QnVmZmVyfSBSZXR1cm5zIHRoZSBjbG9uZWQgYnVmZmVyLlxuICovXG5mdW5jdGlvbiBjbG9uZUJ1ZmZlcihidWZmZXIsIGlzRGVlcCkge1xuICBpZiAoaXNEZWVwKSB7XG4gICAgcmV0dXJuIGJ1ZmZlci5zbGljZSgpO1xuICB9XG4gIHZhciBsZW5ndGggPSBidWZmZXIubGVuZ3RoLFxuICAgICAgcmVzdWx0ID0gYWxsb2NVbnNhZmUgPyBhbGxvY1Vuc2FmZShsZW5ndGgpIDogbmV3IGJ1ZmZlci5jb25zdHJ1Y3RvcihsZW5ndGgpO1xuXG4gIGJ1ZmZlci5jb3B5KHJlc3VsdCk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY2xvbmVCdWZmZXI7XG4iLCIvKipcbiAqIENvcGllcyB0aGUgdmFsdWVzIG9mIGBzb3VyY2VgIHRvIGBhcnJheWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl9IHNvdXJjZSBUaGUgYXJyYXkgdG8gY29weSB2YWx1ZXMgZnJvbS5cbiAqIEBwYXJhbSB7QXJyYXl9IFthcnJheT1bXV0gVGhlIGFycmF5IHRvIGNvcHkgdmFsdWVzIHRvLlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIGBhcnJheWAuXG4gKi9cbmZ1bmN0aW9uIGNvcHlBcnJheShzb3VyY2UsIGFycmF5KSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gc291cmNlLmxlbmd0aDtcblxuICBhcnJheSB8fCAoYXJyYXkgPSBBcnJheShsZW5ndGgpKTtcbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICBhcnJheVtpbmRleF0gPSBzb3VyY2VbaW5kZXhdO1xuICB9XG4gIHJldHVybiBhcnJheTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjb3B5QXJyYXk7XG4iLCIvKipcbiAqIEEgc3BlY2lhbGl6ZWQgdmVyc2lvbiBvZiBgXy5maWx0ZXJgIGZvciBhcnJheXMgd2l0aG91dCBzdXBwb3J0IGZvclxuICogaXRlcmF0ZWUgc2hvcnRoYW5kcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheX0gW2FycmF5XSBUaGUgYXJyYXkgdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcHJlZGljYXRlIFRoZSBmdW5jdGlvbiBpbnZva2VkIHBlciBpdGVyYXRpb24uXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIG5ldyBmaWx0ZXJlZCBhcnJheS5cbiAqL1xuZnVuY3Rpb24gYXJyYXlGaWx0ZXIoYXJyYXksIHByZWRpY2F0ZSkge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IGFycmF5ID09IG51bGwgPyAwIDogYXJyYXkubGVuZ3RoLFxuICAgICAgcmVzSW5kZXggPSAwLFxuICAgICAgcmVzdWx0ID0gW107XG5cbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICB2YXIgdmFsdWUgPSBhcnJheVtpbmRleF07XG4gICAgaWYgKHByZWRpY2F0ZSh2YWx1ZSwgaW5kZXgsIGFycmF5KSkge1xuICAgICAgcmVzdWx0W3Jlc0luZGV4KytdID0gdmFsdWU7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYXJyYXlGaWx0ZXI7XG4iLCIvKipcbiAqIFRoaXMgbWV0aG9kIHJldHVybnMgYSBuZXcgZW1wdHkgYXJyYXkuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjEzLjBcbiAqIEBjYXRlZ29yeSBVdGlsXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIG5ldyBlbXB0eSBhcnJheS5cbiAqIEBleGFtcGxlXG4gKlxuICogdmFyIGFycmF5cyA9IF8udGltZXMoMiwgXy5zdHViQXJyYXkpO1xuICpcbiAqIGNvbnNvbGUubG9nKGFycmF5cyk7XG4gKiAvLyA9PiBbW10sIFtdXVxuICpcbiAqIGNvbnNvbGUubG9nKGFycmF5c1swXSA9PT0gYXJyYXlzWzFdKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIHN0dWJBcnJheSgpIHtcbiAgcmV0dXJuIFtdO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHN0dWJBcnJheTtcbiIsInZhciBhcnJheUZpbHRlciA9IHJlcXVpcmUoJy4vX2FycmF5RmlsdGVyJyksXG4gICAgc3R1YkFycmF5ID0gcmVxdWlyZSgnLi9zdHViQXJyYXknKTtcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgcHJvcGVydHlJc0VudW1lcmFibGUgPSBvYmplY3RQcm90by5wcm9wZXJ0eUlzRW51bWVyYWJsZTtcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgZm9yIHRob3NlIHdpdGggdGhlIHNhbWUgbmFtZSBhcyBvdGhlciBgbG9kYXNoYCBtZXRob2RzLiAqL1xudmFyIG5hdGl2ZUdldFN5bWJvbHMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzO1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gYXJyYXkgb2YgdGhlIG93biBlbnVtZXJhYmxlIHN5bWJvbHMgb2YgYG9iamVjdGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2Ygc3ltYm9scy5cbiAqL1xudmFyIGdldFN5bWJvbHMgPSAhbmF0aXZlR2V0U3ltYm9scyA/IHN0dWJBcnJheSA6IGZ1bmN0aW9uKG9iamVjdCkge1xuICBpZiAob2JqZWN0ID09IG51bGwpIHtcbiAgICByZXR1cm4gW107XG4gIH1cbiAgb2JqZWN0ID0gT2JqZWN0KG9iamVjdCk7XG4gIHJldHVybiBhcnJheUZpbHRlcihuYXRpdmVHZXRTeW1ib2xzKG9iamVjdCksIGZ1bmN0aW9uKHN5bWJvbCkge1xuICAgIHJldHVybiBwcm9wZXJ0eUlzRW51bWVyYWJsZS5jYWxsKG9iamVjdCwgc3ltYm9sKTtcbiAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGdldFN5bWJvbHM7XG4iLCJ2YXIgY29weU9iamVjdCA9IHJlcXVpcmUoJy4vX2NvcHlPYmplY3QnKSxcbiAgICBnZXRTeW1ib2xzID0gcmVxdWlyZSgnLi9fZ2V0U3ltYm9scycpO1xuXG4vKipcbiAqIENvcGllcyBvd24gc3ltYm9scyBvZiBgc291cmNlYCB0byBgb2JqZWN0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IHNvdXJjZSBUaGUgb2JqZWN0IHRvIGNvcHkgc3ltYm9scyBmcm9tLlxuICogQHBhcmFtIHtPYmplY3R9IFtvYmplY3Q9e31dIFRoZSBvYmplY3QgdG8gY29weSBzeW1ib2xzIHRvLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBgb2JqZWN0YC5cbiAqL1xuZnVuY3Rpb24gY29weVN5bWJvbHMoc291cmNlLCBvYmplY3QpIHtcbiAgcmV0dXJuIGNvcHlPYmplY3Qoc291cmNlLCBnZXRTeW1ib2xzKHNvdXJjZSksIG9iamVjdCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY29weVN5bWJvbHM7XG4iLCIvKipcbiAqIEFwcGVuZHMgdGhlIGVsZW1lbnRzIG9mIGB2YWx1ZXNgIHRvIGBhcnJheWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBtb2RpZnkuXG4gKiBAcGFyYW0ge0FycmF5fSB2YWx1ZXMgVGhlIHZhbHVlcyB0byBhcHBlbmQuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgYGFycmF5YC5cbiAqL1xuZnVuY3Rpb24gYXJyYXlQdXNoKGFycmF5LCB2YWx1ZXMpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSB2YWx1ZXMubGVuZ3RoLFxuICAgICAgb2Zmc2V0ID0gYXJyYXkubGVuZ3RoO1xuXG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgYXJyYXlbb2Zmc2V0ICsgaW5kZXhdID0gdmFsdWVzW2luZGV4XTtcbiAgfVxuICByZXR1cm4gYXJyYXk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYXJyYXlQdXNoO1xuIiwidmFyIG92ZXJBcmcgPSByZXF1aXJlKCcuL19vdmVyQXJnJyk7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIGdldFByb3RvdHlwZSA9IG92ZXJBcmcoT2JqZWN0LmdldFByb3RvdHlwZU9mLCBPYmplY3QpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGdldFByb3RvdHlwZTtcbiIsInZhciBhcnJheVB1c2ggPSByZXF1aXJlKCcuL19hcnJheVB1c2gnKSxcbiAgICBnZXRQcm90b3R5cGUgPSByZXF1aXJlKCcuL19nZXRQcm90b3R5cGUnKSxcbiAgICBnZXRTeW1ib2xzID0gcmVxdWlyZSgnLi9fZ2V0U3ltYm9scycpLFxuICAgIHN0dWJBcnJheSA9IHJlcXVpcmUoJy4vc3R1YkFycmF5Jyk7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIGZvciB0aG9zZSB3aXRoIHRoZSBzYW1lIG5hbWUgYXMgb3RoZXIgYGxvZGFzaGAgbWV0aG9kcy4gKi9cbnZhciBuYXRpdmVHZXRTeW1ib2xzID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scztcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGFycmF5IG9mIHRoZSBvd24gYW5kIGluaGVyaXRlZCBlbnVtZXJhYmxlIHN5bWJvbHMgb2YgYG9iamVjdGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2Ygc3ltYm9scy5cbiAqL1xudmFyIGdldFN5bWJvbHNJbiA9ICFuYXRpdmVHZXRTeW1ib2xzID8gc3R1YkFycmF5IDogZnVuY3Rpb24ob2JqZWN0KSB7XG4gIHZhciByZXN1bHQgPSBbXTtcbiAgd2hpbGUgKG9iamVjdCkge1xuICAgIGFycmF5UHVzaChyZXN1bHQsIGdldFN5bWJvbHMob2JqZWN0KSk7XG4gICAgb2JqZWN0ID0gZ2V0UHJvdG90eXBlKG9iamVjdCk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0U3ltYm9sc0luO1xuIiwidmFyIGNvcHlPYmplY3QgPSByZXF1aXJlKCcuL19jb3B5T2JqZWN0JyksXG4gICAgZ2V0U3ltYm9sc0luID0gcmVxdWlyZSgnLi9fZ2V0U3ltYm9sc0luJyk7XG5cbi8qKlxuICogQ29waWVzIG93biBhbmQgaW5oZXJpdGVkIHN5bWJvbHMgb2YgYHNvdXJjZWAgdG8gYG9iamVjdGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBzb3VyY2UgVGhlIG9iamVjdCB0byBjb3B5IHN5bWJvbHMgZnJvbS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb2JqZWN0PXt9XSBUaGUgb2JqZWN0IHRvIGNvcHkgc3ltYm9scyB0by5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgYG9iamVjdGAuXG4gKi9cbmZ1bmN0aW9uIGNvcHlTeW1ib2xzSW4oc291cmNlLCBvYmplY3QpIHtcbiAgcmV0dXJuIGNvcHlPYmplY3Qoc291cmNlLCBnZXRTeW1ib2xzSW4oc291cmNlKSwgb2JqZWN0KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjb3B5U3ltYm9sc0luO1xuIiwidmFyIGFycmF5UHVzaCA9IHJlcXVpcmUoJy4vX2FycmF5UHVzaCcpLFxuICAgIGlzQXJyYXkgPSByZXF1aXJlKCcuL2lzQXJyYXknKTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgZ2V0QWxsS2V5c2AgYW5kIGBnZXRBbGxLZXlzSW5gIHdoaWNoIHVzZXNcbiAqIGBrZXlzRnVuY2AgYW5kIGBzeW1ib2xzRnVuY2AgdG8gZ2V0IHRoZSBlbnVtZXJhYmxlIHByb3BlcnR5IG5hbWVzIGFuZFxuICogc3ltYm9scyBvZiBgb2JqZWN0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHBhcmFtIHtGdW5jdGlvbn0ga2V5c0Z1bmMgVGhlIGZ1bmN0aW9uIHRvIGdldCB0aGUga2V5cyBvZiBgb2JqZWN0YC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHN5bWJvbHNGdW5jIFRoZSBmdW5jdGlvbiB0byBnZXQgdGhlIHN5bWJvbHMgb2YgYG9iamVjdGAuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzIGFuZCBzeW1ib2xzLlxuICovXG5mdW5jdGlvbiBiYXNlR2V0QWxsS2V5cyhvYmplY3QsIGtleXNGdW5jLCBzeW1ib2xzRnVuYykge1xuICB2YXIgcmVzdWx0ID0ga2V5c0Z1bmMob2JqZWN0KTtcbiAgcmV0dXJuIGlzQXJyYXkob2JqZWN0KSA/IHJlc3VsdCA6IGFycmF5UHVzaChyZXN1bHQsIHN5bWJvbHNGdW5jKG9iamVjdCkpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VHZXRBbGxLZXlzO1xuIiwidmFyIGJhc2VHZXRBbGxLZXlzID0gcmVxdWlyZSgnLi9fYmFzZUdldEFsbEtleXMnKSxcbiAgICBnZXRTeW1ib2xzID0gcmVxdWlyZSgnLi9fZ2V0U3ltYm9scycpLFxuICAgIGtleXMgPSByZXF1aXJlKCcuL2tleXMnKTtcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGFycmF5IG9mIG93biBlbnVtZXJhYmxlIHByb3BlcnR5IG5hbWVzIGFuZCBzeW1ib2xzIG9mIGBvYmplY3RgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzIGFuZCBzeW1ib2xzLlxuICovXG5mdW5jdGlvbiBnZXRBbGxLZXlzKG9iamVjdCkge1xuICByZXR1cm4gYmFzZUdldEFsbEtleXMob2JqZWN0LCBrZXlzLCBnZXRTeW1ib2xzKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZXRBbGxLZXlzO1xuIiwidmFyIGJhc2VHZXRBbGxLZXlzID0gcmVxdWlyZSgnLi9fYmFzZUdldEFsbEtleXMnKSxcbiAgICBnZXRTeW1ib2xzSW4gPSByZXF1aXJlKCcuL19nZXRTeW1ib2xzSW4nKSxcbiAgICBrZXlzSW4gPSByZXF1aXJlKCcuL2tleXNJbicpO1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gYXJyYXkgb2Ygb3duIGFuZCBpbmhlcml0ZWQgZW51bWVyYWJsZSBwcm9wZXJ0eSBuYW1lcyBhbmRcbiAqIHN5bWJvbHMgb2YgYG9iamVjdGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMgYW5kIHN5bWJvbHMuXG4gKi9cbmZ1bmN0aW9uIGdldEFsbEtleXNJbihvYmplY3QpIHtcbiAgcmV0dXJuIGJhc2VHZXRBbGxLZXlzKG9iamVjdCwga2V5c0luLCBnZXRTeW1ib2xzSW4pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldEFsbEtleXNJbjtcbiIsInZhciBnZXROYXRpdmUgPSByZXF1aXJlKCcuL19nZXROYXRpdmUnKSxcbiAgICByb290ID0gcmVxdWlyZSgnLi9fcm9vdCcpO1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyB0aGF0IGFyZSB2ZXJpZmllZCB0byBiZSBuYXRpdmUuICovXG52YXIgRGF0YVZpZXcgPSBnZXROYXRpdmUocm9vdCwgJ0RhdGFWaWV3Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gRGF0YVZpZXc7XG4iLCJ2YXIgZ2V0TmF0aXZlID0gcmVxdWlyZSgnLi9fZ2V0TmF0aXZlJyksXG4gICAgcm9vdCA9IHJlcXVpcmUoJy4vX3Jvb3QnKTtcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgdGhhdCBhcmUgdmVyaWZpZWQgdG8gYmUgbmF0aXZlLiAqL1xudmFyIFByb21pc2UgPSBnZXROYXRpdmUocm9vdCwgJ1Byb21pc2UnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBQcm9taXNlO1xuIiwidmFyIGdldE5hdGl2ZSA9IHJlcXVpcmUoJy4vX2dldE5hdGl2ZScpLFxuICAgIHJvb3QgPSByZXF1aXJlKCcuL19yb290Jyk7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIHRoYXQgYXJlIHZlcmlmaWVkIHRvIGJlIG5hdGl2ZS4gKi9cbnZhciBTZXQgPSBnZXROYXRpdmUocm9vdCwgJ1NldCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNldDtcbiIsInZhciBnZXROYXRpdmUgPSByZXF1aXJlKCcuL19nZXROYXRpdmUnKSxcbiAgICByb290ID0gcmVxdWlyZSgnLi9fcm9vdCcpO1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyB0aGF0IGFyZSB2ZXJpZmllZCB0byBiZSBuYXRpdmUuICovXG52YXIgV2Vha01hcCA9IGdldE5hdGl2ZShyb290LCAnV2Vha01hcCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFdlYWtNYXA7XG4iLCJ2YXIgRGF0YVZpZXcgPSByZXF1aXJlKCcuL19EYXRhVmlldycpLFxuICAgIE1hcCA9IHJlcXVpcmUoJy4vX01hcCcpLFxuICAgIFByb21pc2UgPSByZXF1aXJlKCcuL19Qcm9taXNlJyksXG4gICAgU2V0ID0gcmVxdWlyZSgnLi9fU2V0JyksXG4gICAgV2Vha01hcCA9IHJlcXVpcmUoJy4vX1dlYWtNYXAnKSxcbiAgICBiYXNlR2V0VGFnID0gcmVxdWlyZSgnLi9fYmFzZUdldFRhZycpLFxuICAgIHRvU291cmNlID0gcmVxdWlyZSgnLi9fdG9Tb3VyY2UnKTtcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIG1hcFRhZyA9ICdbb2JqZWN0IE1hcF0nLFxuICAgIG9iamVjdFRhZyA9ICdbb2JqZWN0IE9iamVjdF0nLFxuICAgIHByb21pc2VUYWcgPSAnW29iamVjdCBQcm9taXNlXScsXG4gICAgc2V0VGFnID0gJ1tvYmplY3QgU2V0XScsXG4gICAgd2Vha01hcFRhZyA9ICdbb2JqZWN0IFdlYWtNYXBdJztcblxudmFyIGRhdGFWaWV3VGFnID0gJ1tvYmplY3QgRGF0YVZpZXddJztcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IG1hcHMsIHNldHMsIGFuZCB3ZWFrbWFwcy4gKi9cbnZhciBkYXRhVmlld0N0b3JTdHJpbmcgPSB0b1NvdXJjZShEYXRhVmlldyksXG4gICAgbWFwQ3RvclN0cmluZyA9IHRvU291cmNlKE1hcCksXG4gICAgcHJvbWlzZUN0b3JTdHJpbmcgPSB0b1NvdXJjZShQcm9taXNlKSxcbiAgICBzZXRDdG9yU3RyaW5nID0gdG9Tb3VyY2UoU2V0KSxcbiAgICB3ZWFrTWFwQ3RvclN0cmluZyA9IHRvU291cmNlKFdlYWtNYXApO1xuXG4vKipcbiAqIEdldHMgdGhlIGB0b1N0cmluZ1RhZ2Agb2YgYHZhbHVlYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBgdG9TdHJpbmdUYWdgLlxuICovXG52YXIgZ2V0VGFnID0gYmFzZUdldFRhZztcblxuLy8gRmFsbGJhY2sgZm9yIGRhdGEgdmlld3MsIG1hcHMsIHNldHMsIGFuZCB3ZWFrIG1hcHMgaW4gSUUgMTEgYW5kIHByb21pc2VzIGluIE5vZGUuanMgPCA2LlxuaWYgKChEYXRhVmlldyAmJiBnZXRUYWcobmV3IERhdGFWaWV3KG5ldyBBcnJheUJ1ZmZlcigxKSkpICE9IGRhdGFWaWV3VGFnKSB8fFxuICAgIChNYXAgJiYgZ2V0VGFnKG5ldyBNYXApICE9IG1hcFRhZykgfHxcbiAgICAoUHJvbWlzZSAmJiBnZXRUYWcoUHJvbWlzZS5yZXNvbHZlKCkpICE9IHByb21pc2VUYWcpIHx8XG4gICAgKFNldCAmJiBnZXRUYWcobmV3IFNldCkgIT0gc2V0VGFnKSB8fFxuICAgIChXZWFrTWFwICYmIGdldFRhZyhuZXcgV2Vha01hcCkgIT0gd2Vha01hcFRhZykpIHtcbiAgZ2V0VGFnID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICB2YXIgcmVzdWx0ID0gYmFzZUdldFRhZyh2YWx1ZSksXG4gICAgICAgIEN0b3IgPSByZXN1bHQgPT0gb2JqZWN0VGFnID8gdmFsdWUuY29uc3RydWN0b3IgOiB1bmRlZmluZWQsXG4gICAgICAgIGN0b3JTdHJpbmcgPSBDdG9yID8gdG9Tb3VyY2UoQ3RvcikgOiAnJztcblxuICAgIGlmIChjdG9yU3RyaW5nKSB7XG4gICAgICBzd2l0Y2ggKGN0b3JTdHJpbmcpIHtcbiAgICAgICAgY2FzZSBkYXRhVmlld0N0b3JTdHJpbmc6IHJldHVybiBkYXRhVmlld1RhZztcbiAgICAgICAgY2FzZSBtYXBDdG9yU3RyaW5nOiByZXR1cm4gbWFwVGFnO1xuICAgICAgICBjYXNlIHByb21pc2VDdG9yU3RyaW5nOiByZXR1cm4gcHJvbWlzZVRhZztcbiAgICAgICAgY2FzZSBzZXRDdG9yU3RyaW5nOiByZXR1cm4gc2V0VGFnO1xuICAgICAgICBjYXNlIHdlYWtNYXBDdG9yU3RyaW5nOiByZXR1cm4gd2Vha01hcFRhZztcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZXRUYWc7XG4iLCIvKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIEluaXRpYWxpemVzIGFuIGFycmF5IGNsb25lLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gY2xvbmUuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGluaXRpYWxpemVkIGNsb25lLlxuICovXG5mdW5jdGlvbiBpbml0Q2xvbmVBcnJheShhcnJheSkge1xuICB2YXIgbGVuZ3RoID0gYXJyYXkubGVuZ3RoLFxuICAgICAgcmVzdWx0ID0gYXJyYXkuY29uc3RydWN0b3IobGVuZ3RoKTtcblxuICAvLyBBZGQgcHJvcGVydGllcyBhc3NpZ25lZCBieSBgUmVnRXhwI2V4ZWNgLlxuICBpZiAobGVuZ3RoICYmIHR5cGVvZiBhcnJheVswXSA9PSAnc3RyaW5nJyAmJiBoYXNPd25Qcm9wZXJ0eS5jYWxsKGFycmF5LCAnaW5kZXgnKSkge1xuICAgIHJlc3VsdC5pbmRleCA9IGFycmF5LmluZGV4O1xuICAgIHJlc3VsdC5pbnB1dCA9IGFycmF5LmlucHV0O1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaW5pdENsb25lQXJyYXk7XG4iLCJ2YXIgcm9vdCA9IHJlcXVpcmUoJy4vX3Jvb3QnKTtcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgVWludDhBcnJheSA9IHJvb3QuVWludDhBcnJheTtcblxubW9kdWxlLmV4cG9ydHMgPSBVaW50OEFycmF5O1xuIiwidmFyIFVpbnQ4QXJyYXkgPSByZXF1aXJlKCcuL19VaW50OEFycmF5Jyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGNsb25lIG9mIGBhcnJheUJ1ZmZlcmAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXlCdWZmZXJ9IGFycmF5QnVmZmVyIFRoZSBhcnJheSBidWZmZXIgdG8gY2xvbmUuXG4gKiBAcmV0dXJucyB7QXJyYXlCdWZmZXJ9IFJldHVybnMgdGhlIGNsb25lZCBhcnJheSBidWZmZXIuXG4gKi9cbmZ1bmN0aW9uIGNsb25lQXJyYXlCdWZmZXIoYXJyYXlCdWZmZXIpIHtcbiAgdmFyIHJlc3VsdCA9IG5ldyBhcnJheUJ1ZmZlci5jb25zdHJ1Y3RvcihhcnJheUJ1ZmZlci5ieXRlTGVuZ3RoKTtcbiAgbmV3IFVpbnQ4QXJyYXkocmVzdWx0KS5zZXQobmV3IFVpbnQ4QXJyYXkoYXJyYXlCdWZmZXIpKTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjbG9uZUFycmF5QnVmZmVyO1xuIiwidmFyIGNsb25lQXJyYXlCdWZmZXIgPSByZXF1aXJlKCcuL19jbG9uZUFycmF5QnVmZmVyJyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGNsb25lIG9mIGBkYXRhVmlld2AuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBkYXRhVmlldyBUaGUgZGF0YSB2aWV3IHRvIGNsb25lLlxuICogQHBhcmFtIHtib29sZWFufSBbaXNEZWVwXSBTcGVjaWZ5IGEgZGVlcCBjbG9uZS5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIGNsb25lZCBkYXRhIHZpZXcuXG4gKi9cbmZ1bmN0aW9uIGNsb25lRGF0YVZpZXcoZGF0YVZpZXcsIGlzRGVlcCkge1xuICB2YXIgYnVmZmVyID0gaXNEZWVwID8gY2xvbmVBcnJheUJ1ZmZlcihkYXRhVmlldy5idWZmZXIpIDogZGF0YVZpZXcuYnVmZmVyO1xuICByZXR1cm4gbmV3IGRhdGFWaWV3LmNvbnN0cnVjdG9yKGJ1ZmZlciwgZGF0YVZpZXcuYnl0ZU9mZnNldCwgZGF0YVZpZXcuYnl0ZUxlbmd0aCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY2xvbmVEYXRhVmlldztcbiIsIi8qKlxuICogQWRkcyB0aGUga2V5LXZhbHVlIGBwYWlyYCB0byBgbWFwYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG1hcCBUaGUgbWFwIHRvIG1vZGlmeS5cbiAqIEBwYXJhbSB7QXJyYXl9IHBhaXIgVGhlIGtleS12YWx1ZSBwYWlyIHRvIGFkZC5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgYG1hcGAuXG4gKi9cbmZ1bmN0aW9uIGFkZE1hcEVudHJ5KG1hcCwgcGFpcikge1xuICAvLyBEb24ndCByZXR1cm4gYG1hcC5zZXRgIGJlY2F1c2UgaXQncyBub3QgY2hhaW5hYmxlIGluIElFIDExLlxuICBtYXAuc2V0KHBhaXJbMF0sIHBhaXJbMV0pO1xuICByZXR1cm4gbWFwO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFkZE1hcEVudHJ5O1xuIiwiLyoqXG4gKiBBIHNwZWNpYWxpemVkIHZlcnNpb24gb2YgYF8ucmVkdWNlYCBmb3IgYXJyYXlzIHdpdGhvdXQgc3VwcG9ydCBmb3JcbiAqIGl0ZXJhdGVlIHNob3J0aGFuZHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl9IFthcnJheV0gVGhlIGFycmF5IHRvIGl0ZXJhdGUgb3Zlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdGVlIFRoZSBmdW5jdGlvbiBpbnZva2VkIHBlciBpdGVyYXRpb24uXG4gKiBAcGFyYW0geyp9IFthY2N1bXVsYXRvcl0gVGhlIGluaXRpYWwgdmFsdWUuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtpbml0QWNjdW1dIFNwZWNpZnkgdXNpbmcgdGhlIGZpcnN0IGVsZW1lbnQgb2YgYGFycmF5YCBhc1xuICogIHRoZSBpbml0aWFsIHZhbHVlLlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIGFjY3VtdWxhdGVkIHZhbHVlLlxuICovXG5mdW5jdGlvbiBhcnJheVJlZHVjZShhcnJheSwgaXRlcmF0ZWUsIGFjY3VtdWxhdG9yLCBpbml0QWNjdW0pIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBhcnJheSA9PSBudWxsID8gMCA6IGFycmF5Lmxlbmd0aDtcblxuICBpZiAoaW5pdEFjY3VtICYmIGxlbmd0aCkge1xuICAgIGFjY3VtdWxhdG9yID0gYXJyYXlbKytpbmRleF07XG4gIH1cbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICBhY2N1bXVsYXRvciA9IGl0ZXJhdGVlKGFjY3VtdWxhdG9yLCBhcnJheVtpbmRleF0sIGluZGV4LCBhcnJheSk7XG4gIH1cbiAgcmV0dXJuIGFjY3VtdWxhdG9yO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFycmF5UmVkdWNlO1xuIiwiLyoqXG4gKiBDb252ZXJ0cyBgbWFwYCB0byBpdHMga2V5LXZhbHVlIHBhaXJzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gbWFwIFRoZSBtYXAgdG8gY29udmVydC5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUga2V5LXZhbHVlIHBhaXJzLlxuICovXG5mdW5jdGlvbiBtYXBUb0FycmF5KG1hcCkge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIHJlc3VsdCA9IEFycmF5KG1hcC5zaXplKTtcblxuICBtYXAuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gICAgcmVzdWx0WysraW5kZXhdID0gW2tleSwgdmFsdWVdO1xuICB9KTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBtYXBUb0FycmF5O1xuIiwidmFyIGFkZE1hcEVudHJ5ID0gcmVxdWlyZSgnLi9fYWRkTWFwRW50cnknKSxcbiAgICBhcnJheVJlZHVjZSA9IHJlcXVpcmUoJy4vX2FycmF5UmVkdWNlJyksXG4gICAgbWFwVG9BcnJheSA9IHJlcXVpcmUoJy4vX21hcFRvQXJyYXknKTtcblxuLyoqIFVzZWQgdG8gY29tcG9zZSBiaXRtYXNrcyBmb3IgY2xvbmluZy4gKi9cbnZhciBDTE9ORV9ERUVQX0ZMQUcgPSAxO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBjbG9uZSBvZiBgbWFwYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG1hcCBUaGUgbWFwIHRvIGNsb25lLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2xvbmVGdW5jIFRoZSBmdW5jdGlvbiB0byBjbG9uZSB2YWx1ZXMuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtpc0RlZXBdIFNwZWNpZnkgYSBkZWVwIGNsb25lLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgY2xvbmVkIG1hcC5cbiAqL1xuZnVuY3Rpb24gY2xvbmVNYXAobWFwLCBpc0RlZXAsIGNsb25lRnVuYykge1xuICB2YXIgYXJyYXkgPSBpc0RlZXAgPyBjbG9uZUZ1bmMobWFwVG9BcnJheShtYXApLCBDTE9ORV9ERUVQX0ZMQUcpIDogbWFwVG9BcnJheShtYXApO1xuICByZXR1cm4gYXJyYXlSZWR1Y2UoYXJyYXksIGFkZE1hcEVudHJ5LCBuZXcgbWFwLmNvbnN0cnVjdG9yKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjbG9uZU1hcDtcbiIsIi8qKiBVc2VkIHRvIG1hdGNoIGBSZWdFeHBgIGZsYWdzIGZyb20gdGhlaXIgY29lcmNlZCBzdHJpbmcgdmFsdWVzLiAqL1xudmFyIHJlRmxhZ3MgPSAvXFx3KiQvO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBjbG9uZSBvZiBgcmVnZXhwYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IHJlZ2V4cCBUaGUgcmVnZXhwIHRvIGNsb25lLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgY2xvbmVkIHJlZ2V4cC5cbiAqL1xuZnVuY3Rpb24gY2xvbmVSZWdFeHAocmVnZXhwKSB7XG4gIHZhciByZXN1bHQgPSBuZXcgcmVnZXhwLmNvbnN0cnVjdG9yKHJlZ2V4cC5zb3VyY2UsIHJlRmxhZ3MuZXhlYyhyZWdleHApKTtcbiAgcmVzdWx0Lmxhc3RJbmRleCA9IHJlZ2V4cC5sYXN0SW5kZXg7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY2xvbmVSZWdFeHA7XG4iLCIvKipcbiAqIEFkZHMgYHZhbHVlYCB0byBgc2V0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IHNldCBUaGUgc2V0IHRvIG1vZGlmeS5cbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGFkZC5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgYHNldGAuXG4gKi9cbmZ1bmN0aW9uIGFkZFNldEVudHJ5KHNldCwgdmFsdWUpIHtcbiAgLy8gRG9uJ3QgcmV0dXJuIGBzZXQuYWRkYCBiZWNhdXNlIGl0J3Mgbm90IGNoYWluYWJsZSBpbiBJRSAxMS5cbiAgc2V0LmFkZCh2YWx1ZSk7XG4gIHJldHVybiBzZXQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYWRkU2V0RW50cnk7XG4iLCIvKipcbiAqIENvbnZlcnRzIGBzZXRgIHRvIGFuIGFycmF5IG9mIGl0cyB2YWx1ZXMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBzZXQgVGhlIHNldCB0byBjb252ZXJ0LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSB2YWx1ZXMuXG4gKi9cbmZ1bmN0aW9uIHNldFRvQXJyYXkoc2V0KSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgcmVzdWx0ID0gQXJyYXkoc2V0LnNpemUpO1xuXG4gIHNldC5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmVzdWx0WysraW5kZXhdID0gdmFsdWU7XG4gIH0pO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNldFRvQXJyYXk7XG4iLCJ2YXIgYWRkU2V0RW50cnkgPSByZXF1aXJlKCcuL19hZGRTZXRFbnRyeScpLFxuICAgIGFycmF5UmVkdWNlID0gcmVxdWlyZSgnLi9fYXJyYXlSZWR1Y2UnKSxcbiAgICBzZXRUb0FycmF5ID0gcmVxdWlyZSgnLi9fc2V0VG9BcnJheScpO1xuXG4vKiogVXNlZCB0byBjb21wb3NlIGJpdG1hc2tzIGZvciBjbG9uaW5nLiAqL1xudmFyIENMT05FX0RFRVBfRkxBRyA9IDE7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGNsb25lIG9mIGBzZXRgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gc2V0IFRoZSBzZXQgdG8gY2xvbmUuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjbG9uZUZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGNsb25lIHZhbHVlcy5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzRGVlcF0gU3BlY2lmeSBhIGRlZXAgY2xvbmUuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBjbG9uZWQgc2V0LlxuICovXG5mdW5jdGlvbiBjbG9uZVNldChzZXQsIGlzRGVlcCwgY2xvbmVGdW5jKSB7XG4gIHZhciBhcnJheSA9IGlzRGVlcCA/IGNsb25lRnVuYyhzZXRUb0FycmF5KHNldCksIENMT05FX0RFRVBfRkxBRykgOiBzZXRUb0FycmF5KHNldCk7XG4gIHJldHVybiBhcnJheVJlZHVjZShhcnJheSwgYWRkU2V0RW50cnksIG5ldyBzZXQuY29uc3RydWN0b3IpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsb25lU2V0O1xuIiwidmFyIFN5bWJvbCA9IHJlcXVpcmUoJy4vX1N5bWJvbCcpO1xuXG4vKiogVXNlZCB0byBjb252ZXJ0IHN5bWJvbHMgdG8gcHJpbWl0aXZlcyBhbmQgc3RyaW5ncy4gKi9cbnZhciBzeW1ib2xQcm90byA9IFN5bWJvbCA/IFN5bWJvbC5wcm90b3R5cGUgOiB1bmRlZmluZWQsXG4gICAgc3ltYm9sVmFsdWVPZiA9IHN5bWJvbFByb3RvID8gc3ltYm9sUHJvdG8udmFsdWVPZiA6IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBDcmVhdGVzIGEgY2xvbmUgb2YgdGhlIGBzeW1ib2xgIG9iamVjdC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IHN5bWJvbCBUaGUgc3ltYm9sIG9iamVjdCB0byBjbG9uZS5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIGNsb25lZCBzeW1ib2wgb2JqZWN0LlxuICovXG5mdW5jdGlvbiBjbG9uZVN5bWJvbChzeW1ib2wpIHtcbiAgcmV0dXJuIHN5bWJvbFZhbHVlT2YgPyBPYmplY3Qoc3ltYm9sVmFsdWVPZi5jYWxsKHN5bWJvbCkpIDoge307XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY2xvbmVTeW1ib2w7XG4iLCJ2YXIgY2xvbmVBcnJheUJ1ZmZlciA9IHJlcXVpcmUoJy4vX2Nsb25lQXJyYXlCdWZmZXInKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgY2xvbmUgb2YgYHR5cGVkQXJyYXlgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gdHlwZWRBcnJheSBUaGUgdHlwZWQgYXJyYXkgdG8gY2xvbmUuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtpc0RlZXBdIFNwZWNpZnkgYSBkZWVwIGNsb25lLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgY2xvbmVkIHR5cGVkIGFycmF5LlxuICovXG5mdW5jdGlvbiBjbG9uZVR5cGVkQXJyYXkodHlwZWRBcnJheSwgaXNEZWVwKSB7XG4gIHZhciBidWZmZXIgPSBpc0RlZXAgPyBjbG9uZUFycmF5QnVmZmVyKHR5cGVkQXJyYXkuYnVmZmVyKSA6IHR5cGVkQXJyYXkuYnVmZmVyO1xuICByZXR1cm4gbmV3IHR5cGVkQXJyYXkuY29uc3RydWN0b3IoYnVmZmVyLCB0eXBlZEFycmF5LmJ5dGVPZmZzZXQsIHR5cGVkQXJyYXkubGVuZ3RoKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjbG9uZVR5cGVkQXJyYXk7XG4iLCJ2YXIgY2xvbmVBcnJheUJ1ZmZlciA9IHJlcXVpcmUoJy4vX2Nsb25lQXJyYXlCdWZmZXInKSxcbiAgICBjbG9uZURhdGFWaWV3ID0gcmVxdWlyZSgnLi9fY2xvbmVEYXRhVmlldycpLFxuICAgIGNsb25lTWFwID0gcmVxdWlyZSgnLi9fY2xvbmVNYXAnKSxcbiAgICBjbG9uZVJlZ0V4cCA9IHJlcXVpcmUoJy4vX2Nsb25lUmVnRXhwJyksXG4gICAgY2xvbmVTZXQgPSByZXF1aXJlKCcuL19jbG9uZVNldCcpLFxuICAgIGNsb25lU3ltYm9sID0gcmVxdWlyZSgnLi9fY2xvbmVTeW1ib2wnKSxcbiAgICBjbG9uZVR5cGVkQXJyYXkgPSByZXF1aXJlKCcuL19jbG9uZVR5cGVkQXJyYXknKTtcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIGJvb2xUYWcgPSAnW29iamVjdCBCb29sZWFuXScsXG4gICAgZGF0ZVRhZyA9ICdbb2JqZWN0IERhdGVdJyxcbiAgICBtYXBUYWcgPSAnW29iamVjdCBNYXBdJyxcbiAgICBudW1iZXJUYWcgPSAnW29iamVjdCBOdW1iZXJdJyxcbiAgICByZWdleHBUYWcgPSAnW29iamVjdCBSZWdFeHBdJyxcbiAgICBzZXRUYWcgPSAnW29iamVjdCBTZXRdJyxcbiAgICBzdHJpbmdUYWcgPSAnW29iamVjdCBTdHJpbmddJyxcbiAgICBzeW1ib2xUYWcgPSAnW29iamVjdCBTeW1ib2xdJztcblxudmFyIGFycmF5QnVmZmVyVGFnID0gJ1tvYmplY3QgQXJyYXlCdWZmZXJdJyxcbiAgICBkYXRhVmlld1RhZyA9ICdbb2JqZWN0IERhdGFWaWV3XScsXG4gICAgZmxvYXQzMlRhZyA9ICdbb2JqZWN0IEZsb2F0MzJBcnJheV0nLFxuICAgIGZsb2F0NjRUYWcgPSAnW29iamVjdCBGbG9hdDY0QXJyYXldJyxcbiAgICBpbnQ4VGFnID0gJ1tvYmplY3QgSW50OEFycmF5XScsXG4gICAgaW50MTZUYWcgPSAnW29iamVjdCBJbnQxNkFycmF5XScsXG4gICAgaW50MzJUYWcgPSAnW29iamVjdCBJbnQzMkFycmF5XScsXG4gICAgdWludDhUYWcgPSAnW29iamVjdCBVaW50OEFycmF5XScsXG4gICAgdWludDhDbGFtcGVkVGFnID0gJ1tvYmplY3QgVWludDhDbGFtcGVkQXJyYXldJyxcbiAgICB1aW50MTZUYWcgPSAnW29iamVjdCBVaW50MTZBcnJheV0nLFxuICAgIHVpbnQzMlRhZyA9ICdbb2JqZWN0IFVpbnQzMkFycmF5XSc7XG5cbi8qKlxuICogSW5pdGlhbGl6ZXMgYW4gb2JqZWN0IGNsb25lIGJhc2VkIG9uIGl0cyBgdG9TdHJpbmdUYWdgLlxuICpcbiAqICoqTm90ZToqKiBUaGlzIGZ1bmN0aW9uIG9ubHkgc3VwcG9ydHMgY2xvbmluZyB2YWx1ZXMgd2l0aCB0YWdzIG9mXG4gKiBgQm9vbGVhbmAsIGBEYXRlYCwgYEVycm9yYCwgYE51bWJlcmAsIGBSZWdFeHBgLCBvciBgU3RyaW5nYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIGNsb25lLlxuICogQHBhcmFtIHtzdHJpbmd9IHRhZyBUaGUgYHRvU3RyaW5nVGFnYCBvZiB0aGUgb2JqZWN0IHRvIGNsb25lLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2xvbmVGdW5jIFRoZSBmdW5jdGlvbiB0byBjbG9uZSB2YWx1ZXMuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtpc0RlZXBdIFNwZWNpZnkgYSBkZWVwIGNsb25lLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgaW5pdGlhbGl6ZWQgY2xvbmUuXG4gKi9cbmZ1bmN0aW9uIGluaXRDbG9uZUJ5VGFnKG9iamVjdCwgdGFnLCBjbG9uZUZ1bmMsIGlzRGVlcCkge1xuICB2YXIgQ3RvciA9IG9iamVjdC5jb25zdHJ1Y3RvcjtcbiAgc3dpdGNoICh0YWcpIHtcbiAgICBjYXNlIGFycmF5QnVmZmVyVGFnOlxuICAgICAgcmV0dXJuIGNsb25lQXJyYXlCdWZmZXIob2JqZWN0KTtcblxuICAgIGNhc2UgYm9vbFRhZzpcbiAgICBjYXNlIGRhdGVUYWc6XG4gICAgICByZXR1cm4gbmV3IEN0b3IoK29iamVjdCk7XG5cbiAgICBjYXNlIGRhdGFWaWV3VGFnOlxuICAgICAgcmV0dXJuIGNsb25lRGF0YVZpZXcob2JqZWN0LCBpc0RlZXApO1xuXG4gICAgY2FzZSBmbG9hdDMyVGFnOiBjYXNlIGZsb2F0NjRUYWc6XG4gICAgY2FzZSBpbnQ4VGFnOiBjYXNlIGludDE2VGFnOiBjYXNlIGludDMyVGFnOlxuICAgIGNhc2UgdWludDhUYWc6IGNhc2UgdWludDhDbGFtcGVkVGFnOiBjYXNlIHVpbnQxNlRhZzogY2FzZSB1aW50MzJUYWc6XG4gICAgICByZXR1cm4gY2xvbmVUeXBlZEFycmF5KG9iamVjdCwgaXNEZWVwKTtcblxuICAgIGNhc2UgbWFwVGFnOlxuICAgICAgcmV0dXJuIGNsb25lTWFwKG9iamVjdCwgaXNEZWVwLCBjbG9uZUZ1bmMpO1xuXG4gICAgY2FzZSBudW1iZXJUYWc6XG4gICAgY2FzZSBzdHJpbmdUYWc6XG4gICAgICByZXR1cm4gbmV3IEN0b3Iob2JqZWN0KTtcblxuICAgIGNhc2UgcmVnZXhwVGFnOlxuICAgICAgcmV0dXJuIGNsb25lUmVnRXhwKG9iamVjdCk7XG5cbiAgICBjYXNlIHNldFRhZzpcbiAgICAgIHJldHVybiBjbG9uZVNldChvYmplY3QsIGlzRGVlcCwgY2xvbmVGdW5jKTtcblxuICAgIGNhc2Ugc3ltYm9sVGFnOlxuICAgICAgcmV0dXJuIGNsb25lU3ltYm9sKG9iamVjdCk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpbml0Q2xvbmVCeVRhZztcbiIsInZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vaXNPYmplY3QnKTtcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0Q3JlYXRlID0gT2JqZWN0LmNyZWF0ZTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5jcmVhdGVgIHdpdGhvdXQgc3VwcG9ydCBmb3IgYXNzaWduaW5nXG4gKiBwcm9wZXJ0aWVzIHRvIHRoZSBjcmVhdGVkIG9iamVjdC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IHByb3RvIFRoZSBvYmplY3QgdG8gaW5oZXJpdCBmcm9tLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgbmV3IG9iamVjdC5cbiAqL1xudmFyIGJhc2VDcmVhdGUgPSAoZnVuY3Rpb24oKSB7XG4gIGZ1bmN0aW9uIG9iamVjdCgpIHt9XG4gIHJldHVybiBmdW5jdGlvbihwcm90bykge1xuICAgIGlmICghaXNPYmplY3QocHJvdG8pKSB7XG4gICAgICByZXR1cm4ge307XG4gICAgfVxuICAgIGlmIChvYmplY3RDcmVhdGUpIHtcbiAgICAgIHJldHVybiBvYmplY3RDcmVhdGUocHJvdG8pO1xuICAgIH1cbiAgICBvYmplY3QucHJvdG90eXBlID0gcHJvdG87XG4gICAgdmFyIHJlc3VsdCA9IG5ldyBvYmplY3Q7XG4gICAgb2JqZWN0LnByb3RvdHlwZSA9IHVuZGVmaW5lZDtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xufSgpKTtcblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlQ3JlYXRlO1xuIiwidmFyIGJhc2VDcmVhdGUgPSByZXF1aXJlKCcuL19iYXNlQ3JlYXRlJyksXG4gICAgZ2V0UHJvdG90eXBlID0gcmVxdWlyZSgnLi9fZ2V0UHJvdG90eXBlJyksXG4gICAgaXNQcm90b3R5cGUgPSByZXF1aXJlKCcuL19pc1Byb3RvdHlwZScpO1xuXG4vKipcbiAqIEluaXRpYWxpemVzIGFuIG9iamVjdCBjbG9uZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIGNsb25lLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgaW5pdGlhbGl6ZWQgY2xvbmUuXG4gKi9cbmZ1bmN0aW9uIGluaXRDbG9uZU9iamVjdChvYmplY3QpIHtcbiAgcmV0dXJuICh0eXBlb2Ygb2JqZWN0LmNvbnN0cnVjdG9yID09ICdmdW5jdGlvbicgJiYgIWlzUHJvdG90eXBlKG9iamVjdCkpXG4gICAgPyBiYXNlQ3JlYXRlKGdldFByb3RvdHlwZShvYmplY3QpKVxuICAgIDoge307XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaW5pdENsb25lT2JqZWN0O1xuIiwidmFyIFN0YWNrID0gcmVxdWlyZSgnLi9fU3RhY2snKSxcbiAgICBhcnJheUVhY2ggPSByZXF1aXJlKCcuL19hcnJheUVhY2gnKSxcbiAgICBhc3NpZ25WYWx1ZSA9IHJlcXVpcmUoJy4vX2Fzc2lnblZhbHVlJyksXG4gICAgYmFzZUFzc2lnbiA9IHJlcXVpcmUoJy4vX2Jhc2VBc3NpZ24nKSxcbiAgICBiYXNlQXNzaWduSW4gPSByZXF1aXJlKCcuL19iYXNlQXNzaWduSW4nKSxcbiAgICBjbG9uZUJ1ZmZlciA9IHJlcXVpcmUoJy4vX2Nsb25lQnVmZmVyJyksXG4gICAgY29weUFycmF5ID0gcmVxdWlyZSgnLi9fY29weUFycmF5JyksXG4gICAgY29weVN5bWJvbHMgPSByZXF1aXJlKCcuL19jb3B5U3ltYm9scycpLFxuICAgIGNvcHlTeW1ib2xzSW4gPSByZXF1aXJlKCcuL19jb3B5U3ltYm9sc0luJyksXG4gICAgZ2V0QWxsS2V5cyA9IHJlcXVpcmUoJy4vX2dldEFsbEtleXMnKSxcbiAgICBnZXRBbGxLZXlzSW4gPSByZXF1aXJlKCcuL19nZXRBbGxLZXlzSW4nKSxcbiAgICBnZXRUYWcgPSByZXF1aXJlKCcuL19nZXRUYWcnKSxcbiAgICBpbml0Q2xvbmVBcnJheSA9IHJlcXVpcmUoJy4vX2luaXRDbG9uZUFycmF5JyksXG4gICAgaW5pdENsb25lQnlUYWcgPSByZXF1aXJlKCcuL19pbml0Q2xvbmVCeVRhZycpLFxuICAgIGluaXRDbG9uZU9iamVjdCA9IHJlcXVpcmUoJy4vX2luaXRDbG9uZU9iamVjdCcpLFxuICAgIGlzQXJyYXkgPSByZXF1aXJlKCcuL2lzQXJyYXknKSxcbiAgICBpc0J1ZmZlciA9IHJlcXVpcmUoJy4vaXNCdWZmZXInKSxcbiAgICBpc09iamVjdCA9IHJlcXVpcmUoJy4vaXNPYmplY3QnKSxcbiAgICBrZXlzID0gcmVxdWlyZSgnLi9rZXlzJyk7XG5cbi8qKiBVc2VkIHRvIGNvbXBvc2UgYml0bWFza3MgZm9yIGNsb25pbmcuICovXG52YXIgQ0xPTkVfREVFUF9GTEFHID0gMSxcbiAgICBDTE9ORV9GTEFUX0ZMQUcgPSAyLFxuICAgIENMT05FX1NZTUJPTFNfRkxBRyA9IDQ7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBhcmdzVGFnID0gJ1tvYmplY3QgQXJndW1lbnRzXScsXG4gICAgYXJyYXlUYWcgPSAnW29iamVjdCBBcnJheV0nLFxuICAgIGJvb2xUYWcgPSAnW29iamVjdCBCb29sZWFuXScsXG4gICAgZGF0ZVRhZyA9ICdbb2JqZWN0IERhdGVdJyxcbiAgICBlcnJvclRhZyA9ICdbb2JqZWN0IEVycm9yXScsXG4gICAgZnVuY1RhZyA9ICdbb2JqZWN0IEZ1bmN0aW9uXScsXG4gICAgZ2VuVGFnID0gJ1tvYmplY3QgR2VuZXJhdG9yRnVuY3Rpb25dJyxcbiAgICBtYXBUYWcgPSAnW29iamVjdCBNYXBdJyxcbiAgICBudW1iZXJUYWcgPSAnW29iamVjdCBOdW1iZXJdJyxcbiAgICBvYmplY3RUYWcgPSAnW29iamVjdCBPYmplY3RdJyxcbiAgICByZWdleHBUYWcgPSAnW29iamVjdCBSZWdFeHBdJyxcbiAgICBzZXRUYWcgPSAnW29iamVjdCBTZXRdJyxcbiAgICBzdHJpbmdUYWcgPSAnW29iamVjdCBTdHJpbmddJyxcbiAgICBzeW1ib2xUYWcgPSAnW29iamVjdCBTeW1ib2xdJyxcbiAgICB3ZWFrTWFwVGFnID0gJ1tvYmplY3QgV2Vha01hcF0nO1xuXG52YXIgYXJyYXlCdWZmZXJUYWcgPSAnW29iamVjdCBBcnJheUJ1ZmZlcl0nLFxuICAgIGRhdGFWaWV3VGFnID0gJ1tvYmplY3QgRGF0YVZpZXddJyxcbiAgICBmbG9hdDMyVGFnID0gJ1tvYmplY3QgRmxvYXQzMkFycmF5XScsXG4gICAgZmxvYXQ2NFRhZyA9ICdbb2JqZWN0IEZsb2F0NjRBcnJheV0nLFxuICAgIGludDhUYWcgPSAnW29iamVjdCBJbnQ4QXJyYXldJyxcbiAgICBpbnQxNlRhZyA9ICdbb2JqZWN0IEludDE2QXJyYXldJyxcbiAgICBpbnQzMlRhZyA9ICdbb2JqZWN0IEludDMyQXJyYXldJyxcbiAgICB1aW50OFRhZyA9ICdbb2JqZWN0IFVpbnQ4QXJyYXldJyxcbiAgICB1aW50OENsYW1wZWRUYWcgPSAnW29iamVjdCBVaW50OENsYW1wZWRBcnJheV0nLFxuICAgIHVpbnQxNlRhZyA9ICdbb2JqZWN0IFVpbnQxNkFycmF5XScsXG4gICAgdWludDMyVGFnID0gJ1tvYmplY3QgVWludDMyQXJyYXldJztcblxuLyoqIFVzZWQgdG8gaWRlbnRpZnkgYHRvU3RyaW5nVGFnYCB2YWx1ZXMgc3VwcG9ydGVkIGJ5IGBfLmNsb25lYC4gKi9cbnZhciBjbG9uZWFibGVUYWdzID0ge307XG5jbG9uZWFibGVUYWdzW2FyZ3NUYWddID0gY2xvbmVhYmxlVGFnc1thcnJheVRhZ10gPVxuY2xvbmVhYmxlVGFnc1thcnJheUJ1ZmZlclRhZ10gPSBjbG9uZWFibGVUYWdzW2RhdGFWaWV3VGFnXSA9XG5jbG9uZWFibGVUYWdzW2Jvb2xUYWddID0gY2xvbmVhYmxlVGFnc1tkYXRlVGFnXSA9XG5jbG9uZWFibGVUYWdzW2Zsb2F0MzJUYWddID0gY2xvbmVhYmxlVGFnc1tmbG9hdDY0VGFnXSA9XG5jbG9uZWFibGVUYWdzW2ludDhUYWddID0gY2xvbmVhYmxlVGFnc1tpbnQxNlRhZ10gPVxuY2xvbmVhYmxlVGFnc1tpbnQzMlRhZ10gPSBjbG9uZWFibGVUYWdzW21hcFRhZ10gPVxuY2xvbmVhYmxlVGFnc1tudW1iZXJUYWddID0gY2xvbmVhYmxlVGFnc1tvYmplY3RUYWddID1cbmNsb25lYWJsZVRhZ3NbcmVnZXhwVGFnXSA9IGNsb25lYWJsZVRhZ3Nbc2V0VGFnXSA9XG5jbG9uZWFibGVUYWdzW3N0cmluZ1RhZ10gPSBjbG9uZWFibGVUYWdzW3N5bWJvbFRhZ10gPVxuY2xvbmVhYmxlVGFnc1t1aW50OFRhZ10gPSBjbG9uZWFibGVUYWdzW3VpbnQ4Q2xhbXBlZFRhZ10gPVxuY2xvbmVhYmxlVGFnc1t1aW50MTZUYWddID0gY2xvbmVhYmxlVGFnc1t1aW50MzJUYWddID0gdHJ1ZTtcbmNsb25lYWJsZVRhZ3NbZXJyb3JUYWddID0gY2xvbmVhYmxlVGFnc1tmdW5jVGFnXSA9XG5jbG9uZWFibGVUYWdzW3dlYWtNYXBUYWddID0gZmFsc2U7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uY2xvbmVgIGFuZCBgXy5jbG9uZURlZXBgIHdoaWNoIHRyYWNrc1xuICogdHJhdmVyc2VkIG9iamVjdHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNsb25lLlxuICogQHBhcmFtIHtib29sZWFufSBiaXRtYXNrIFRoZSBiaXRtYXNrIGZsYWdzLlxuICogIDEgLSBEZWVwIGNsb25lXG4gKiAgMiAtIEZsYXR0ZW4gaW5oZXJpdGVkIHByb3BlcnRpZXNcbiAqICA0IC0gQ2xvbmUgc3ltYm9sc1xuICogQHBhcmFtIHtGdW5jdGlvbn0gW2N1c3RvbWl6ZXJdIFRoZSBmdW5jdGlvbiB0byBjdXN0b21pemUgY2xvbmluZy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBba2V5XSBUaGUga2V5IG9mIGB2YWx1ZWAuXG4gKiBAcGFyYW0ge09iamVjdH0gW29iamVjdF0gVGhlIHBhcmVudCBvYmplY3Qgb2YgYHZhbHVlYC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbc3RhY2tdIFRyYWNrcyB0cmF2ZXJzZWQgb2JqZWN0cyBhbmQgdGhlaXIgY2xvbmUgY291bnRlcnBhcnRzLlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIGNsb25lZCB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gYmFzZUNsb25lKHZhbHVlLCBiaXRtYXNrLCBjdXN0b21pemVyLCBrZXksIG9iamVjdCwgc3RhY2spIHtcbiAgdmFyIHJlc3VsdCxcbiAgICAgIGlzRGVlcCA9IGJpdG1hc2sgJiBDTE9ORV9ERUVQX0ZMQUcsXG4gICAgICBpc0ZsYXQgPSBiaXRtYXNrICYgQ0xPTkVfRkxBVF9GTEFHLFxuICAgICAgaXNGdWxsID0gYml0bWFzayAmIENMT05FX1NZTUJPTFNfRkxBRztcblxuICBpZiAoY3VzdG9taXplcikge1xuICAgIHJlc3VsdCA9IG9iamVjdCA/IGN1c3RvbWl6ZXIodmFsdWUsIGtleSwgb2JqZWN0LCBzdGFjaykgOiBjdXN0b21pemVyKHZhbHVlKTtcbiAgfVxuICBpZiAocmVzdWx0ICE9PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG4gIGlmICghaXNPYmplY3QodmFsdWUpKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG4gIHZhciBpc0FyciA9IGlzQXJyYXkodmFsdWUpO1xuICBpZiAoaXNBcnIpIHtcbiAgICByZXN1bHQgPSBpbml0Q2xvbmVBcnJheSh2YWx1ZSk7XG4gICAgaWYgKCFpc0RlZXApIHtcbiAgICAgIHJldHVybiBjb3B5QXJyYXkodmFsdWUsIHJlc3VsdCk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHZhciB0YWcgPSBnZXRUYWcodmFsdWUpLFxuICAgICAgICBpc0Z1bmMgPSB0YWcgPT0gZnVuY1RhZyB8fCB0YWcgPT0gZ2VuVGFnO1xuXG4gICAgaWYgKGlzQnVmZmVyKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGNsb25lQnVmZmVyKHZhbHVlLCBpc0RlZXApO1xuICAgIH1cbiAgICBpZiAodGFnID09IG9iamVjdFRhZyB8fCB0YWcgPT0gYXJnc1RhZyB8fCAoaXNGdW5jICYmICFvYmplY3QpKSB7XG4gICAgICByZXN1bHQgPSAoaXNGbGF0IHx8IGlzRnVuYykgPyB7fSA6IGluaXRDbG9uZU9iamVjdCh2YWx1ZSk7XG4gICAgICBpZiAoIWlzRGVlcCkge1xuICAgICAgICByZXR1cm4gaXNGbGF0XG4gICAgICAgICAgPyBjb3B5U3ltYm9sc0luKHZhbHVlLCBiYXNlQXNzaWduSW4ocmVzdWx0LCB2YWx1ZSkpXG4gICAgICAgICAgOiBjb3B5U3ltYm9scyh2YWx1ZSwgYmFzZUFzc2lnbihyZXN1bHQsIHZhbHVlKSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICghY2xvbmVhYmxlVGFnc1t0YWddKSB7XG4gICAgICAgIHJldHVybiBvYmplY3QgPyB2YWx1ZSA6IHt9O1xuICAgICAgfVxuICAgICAgcmVzdWx0ID0gaW5pdENsb25lQnlUYWcodmFsdWUsIHRhZywgYmFzZUNsb25lLCBpc0RlZXApO1xuICAgIH1cbiAgfVxuICAvLyBDaGVjayBmb3IgY2lyY3VsYXIgcmVmZXJlbmNlcyBhbmQgcmV0dXJuIGl0cyBjb3JyZXNwb25kaW5nIGNsb25lLlxuICBzdGFjayB8fCAoc3RhY2sgPSBuZXcgU3RhY2spO1xuICB2YXIgc3RhY2tlZCA9IHN0YWNrLmdldCh2YWx1ZSk7XG4gIGlmIChzdGFja2VkKSB7XG4gICAgcmV0dXJuIHN0YWNrZWQ7XG4gIH1cbiAgc3RhY2suc2V0KHZhbHVlLCByZXN1bHQpO1xuXG4gIHZhciBrZXlzRnVuYyA9IGlzRnVsbFxuICAgID8gKGlzRmxhdCA/IGdldEFsbEtleXNJbiA6IGdldEFsbEtleXMpXG4gICAgOiAoaXNGbGF0ID8ga2V5c0luIDoga2V5cyk7XG5cbiAgdmFyIHByb3BzID0gaXNBcnIgPyB1bmRlZmluZWQgOiBrZXlzRnVuYyh2YWx1ZSk7XG4gIGFycmF5RWFjaChwcm9wcyB8fCB2YWx1ZSwgZnVuY3Rpb24oc3ViVmFsdWUsIGtleSkge1xuICAgIGlmIChwcm9wcykge1xuICAgICAga2V5ID0gc3ViVmFsdWU7XG4gICAgICBzdWJWYWx1ZSA9IHZhbHVlW2tleV07XG4gICAgfVxuICAgIC8vIFJlY3Vyc2l2ZWx5IHBvcHVsYXRlIGNsb25lIChzdXNjZXB0aWJsZSB0byBjYWxsIHN0YWNrIGxpbWl0cykuXG4gICAgYXNzaWduVmFsdWUocmVzdWx0LCBrZXksIGJhc2VDbG9uZShzdWJWYWx1ZSwgYml0bWFzaywgY3VzdG9taXplciwga2V5LCB2YWx1ZSwgc3RhY2spKTtcbiAgfSk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUNsb25lO1xuIiwidmFyIGJhc2VDbG9uZSA9IHJlcXVpcmUoJy4vX2Jhc2VDbG9uZScpO1xuXG4vKiogVXNlZCB0byBjb21wb3NlIGJpdG1hc2tzIGZvciBjbG9uaW5nLiAqL1xudmFyIENMT05FX0RFRVBfRkxBRyA9IDEsXG4gICAgQ0xPTkVfU1lNQk9MU19GTEFHID0gNDtcblxuLyoqXG4gKiBUaGlzIG1ldGhvZCBpcyBsaWtlIGBfLmNsb25lYCBleGNlcHQgdGhhdCBpdCByZWN1cnNpdmVseSBjbG9uZXMgYHZhbHVlYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDEuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcmVjdXJzaXZlbHkgY2xvbmUuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgZGVlcCBjbG9uZWQgdmFsdWUuXG4gKiBAc2VlIF8uY2xvbmVcbiAqIEBleGFtcGxlXG4gKlxuICogdmFyIG9iamVjdHMgPSBbeyAnYSc6IDEgfSwgeyAnYic6IDIgfV07XG4gKlxuICogdmFyIGRlZXAgPSBfLmNsb25lRGVlcChvYmplY3RzKTtcbiAqIGNvbnNvbGUubG9nKGRlZXBbMF0gPT09IG9iamVjdHNbMF0pO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gY2xvbmVEZWVwKHZhbHVlKSB7XG4gIHJldHVybiBiYXNlQ2xvbmUodmFsdWUsIENMT05FX0RFRVBfRkxBRyB8IENMT05FX1NZTUJPTFNfRkxBRyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY2xvbmVEZWVwO1xuIiwiLy8gQGZsb3dcblxuaW1wb3J0IFZ1ZSBmcm9tICd2dWUnXG5pbXBvcnQgY2xvbmVEZWVwIGZyb20gJ2xvZGFzaC9jbG9uZURlZXAnXG5cbmZ1bmN0aW9uIGNyZWF0ZUxvY2FsVnVlKF9WdWU6IENvbXBvbmVudCA9IFZ1ZSk6IENvbXBvbmVudCB7XG4gIGNvbnN0IGluc3RhbmNlID0gX1Z1ZS5leHRlbmQoKVxuXG4gIC8vIGNsb25lIGdsb2JhbCBBUElzXG4gIE9iamVjdC5rZXlzKF9WdWUpLmZvckVhY2goa2V5ID0+IHtcbiAgICBpZiAoIWluc3RhbmNlLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgIGNvbnN0IG9yaWdpbmFsID0gX1Z1ZVtrZXldXG4gICAgICAvLyBjbG9uZURlZXAgY2FuIGZhaWwgd2hlbiBjbG9uaW5nIFZ1ZSBpbnN0YW5jZXNcbiAgICAgIC8vIGNsb25lRGVlcCBjaGVja3MgdGhhdCB0aGUgaW5zdGFuY2UgaGFzIGEgU3ltYm9sXG4gICAgICAvLyB3aGljaCBlcnJvcnMgaW4gVnVlIDwgMi4xNyAoaHR0cHM6Ly9naXRodWIuY29tL3Z1ZWpzL3Z1ZS9wdWxsLzc4NzgpXG4gICAgICB0cnkge1xuICAgICAgICBpbnN0YW5jZVtrZXldID1cbiAgICAgICAgICB0eXBlb2Ygb3JpZ2luYWwgPT09ICdvYmplY3QnID8gY2xvbmVEZWVwKG9yaWdpbmFsKSA6IG9yaWdpbmFsXG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGluc3RhbmNlW2tleV0gPSBvcmlnaW5hbFxuICAgICAgfVxuICAgIH1cbiAgfSlcblxuICAvLyBjb25maWcgaXMgbm90IGVudW1lcmFibGVcbiAgaW5zdGFuY2UuY29uZmlnID0gY2xvbmVEZWVwKFZ1ZS5jb25maWcpXG5cbiAgaW5zdGFuY2UuY29uZmlnLmVycm9ySGFuZGxlciA9IFZ1ZS5jb25maWcuZXJyb3JIYW5kbGVyXG5cbiAgLy8gb3B0aW9uIG1lcmdlIHN0cmF0ZWdpZXMgbmVlZCB0byBiZSBleHBvc2VkIGJ5IHJlZmVyZW5jZVxuICAvLyBzbyB0aGF0IG1lcmdlIHN0cmF0cyByZWdpc3RlcmVkIGJ5IHBsdWdpbnMgY2FuIHdvcmsgcHJvcGVybHlcbiAgaW5zdGFuY2UuY29uZmlnLm9wdGlvbk1lcmdlU3RyYXRlZ2llcyA9IFZ1ZS5jb25maWcub3B0aW9uTWVyZ2VTdHJhdGVnaWVzXG5cbiAgLy8gbWFrZSBzdXJlIGFsbCBleHRlbmRzIGFyZSBiYXNlZCBvbiB0aGlzIGluc3RhbmNlLlxuICAvLyB0aGlzIGlzIGltcG9ydGFudCBzbyB0aGF0IGdsb2JhbCBjb21wb25lbnRzIHJlZ2lzdGVyZWQgYnkgcGx1Z2lucyxcbiAgLy8gZS5nLiByb3V0ZXItbGluayBhcmUgY3JlYXRlZCB1c2luZyB0aGUgY29ycmVjdCBiYXNlIGNvbnN0cnVjdG9yXG4gIGluc3RhbmNlLm9wdGlvbnMuX2Jhc2UgPSBpbnN0YW5jZVxuXG4gIC8vIGNvbXBhdCBmb3IgdnVlLXJvdXRlciA8IDIuNy4xIHdoZXJlIGl0IGRvZXMgbm90IGFsbG93IG11bHRpcGxlIGluc3RhbGxzXG4gIGlmIChpbnN0YW5jZS5faW5zdGFsbGVkUGx1Z2lucyAmJiBpbnN0YW5jZS5faW5zdGFsbGVkUGx1Z2lucy5sZW5ndGgpIHtcbiAgICBpbnN0YW5jZS5faW5zdGFsbGVkUGx1Z2lucy5sZW5ndGggPSAwXG4gIH1cbiAgY29uc3QgdXNlID0gaW5zdGFuY2UudXNlXG4gIGluc3RhbmNlLnVzZSA9IChwbHVnaW4sIC4uLnJlc3QpID0+IHtcbiAgICBpZiAocGx1Z2luLmluc3RhbGxlZCA9PT0gdHJ1ZSkge1xuICAgICAgcGx1Z2luLmluc3RhbGxlZCA9IGZhbHNlXG4gICAgfVxuICAgIGlmIChwbHVnaW4uaW5zdGFsbCAmJiBwbHVnaW4uaW5zdGFsbC5pbnN0YWxsZWQgPT09IHRydWUpIHtcbiAgICAgIHBsdWdpbi5pbnN0YWxsLmluc3RhbGxlZCA9IGZhbHNlXG4gICAgfVxuICAgIHVzZS5jYWxsKGluc3RhbmNlLCBwbHVnaW4sIC4uLnJlc3QpXG4gIH1cbiAgcmV0dXJuIGluc3RhbmNlXG59XG5cbmV4cG9ydCBkZWZhdWx0IGNyZWF0ZUxvY2FsVnVlXG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgeyB0aHJvd0Vycm9yIH0gZnJvbSAnc2hhcmVkL3V0aWwnXG5pbXBvcnQgeyBjb21waWxlVG9GdW5jdGlvbnMgfSBmcm9tICd2dWUtdGVtcGxhdGUtY29tcGlsZXInXG5pbXBvcnQgeyBpc1Z1ZUNvbXBvbmVudCB9IGZyb20gJy4vdmFsaWRhdG9ycydcblxuZnVuY3Rpb24gaXNWYWxpZFNsb3Qoc2xvdDogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiBpc1Z1ZUNvbXBvbmVudChzbG90KSB8fCB0eXBlb2Ygc2xvdCA9PT0gJ3N0cmluZydcbn1cblxuZnVuY3Rpb24gcmVxdWlyZXNUZW1wbGF0ZUNvbXBpbGVyKHNsb3Q6IGFueSk6IHZvaWQge1xuICBpZiAodHlwZW9mIHNsb3QgPT09ICdzdHJpbmcnICYmICFjb21waWxlVG9GdW5jdGlvbnMpIHtcbiAgICB0aHJvd0Vycm9yKFxuICAgICAgYHZ1ZVRlbXBsYXRlQ29tcGlsZXIgaXMgdW5kZWZpbmVkLCB5b3UgbXVzdCBwYXNzIGAgK1xuICAgICAgICBgcHJlY29tcGlsZWQgY29tcG9uZW50cyBpZiB2dWUtdGVtcGxhdGUtY29tcGlsZXIgaXMgYCArXG4gICAgICAgIGB1bmRlZmluZWRgXG4gICAgKVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZVNsb3RzKHNsb3RzOiBTbG90c09iamVjdCk6IHZvaWQge1xuICBPYmplY3Qua2V5cyhzbG90cykuZm9yRWFjaChrZXkgPT4ge1xuICAgIGNvbnN0IHNsb3QgPSBBcnJheS5pc0FycmF5KHNsb3RzW2tleV0pID8gc2xvdHNba2V5XSA6IFtzbG90c1trZXldXVxuXG4gICAgc2xvdC5mb3JFYWNoKHNsb3RWYWx1ZSA9PiB7XG4gICAgICBpZiAoIWlzVmFsaWRTbG90KHNsb3RWYWx1ZSkpIHtcbiAgICAgICAgdGhyb3dFcnJvcihcbiAgICAgICAgICBgc2xvdHNba2V5XSBtdXN0IGJlIGEgQ29tcG9uZW50LCBzdHJpbmcgb3IgYW4gYXJyYXkgYCArXG4gICAgICAgICAgICBgb2YgQ29tcG9uZW50c2BcbiAgICAgICAgKVxuICAgICAgfVxuICAgICAgcmVxdWlyZXNUZW1wbGF0ZUNvbXBpbGVyKHNsb3RWYWx1ZSlcbiAgICB9KVxuICB9KVxufVxuIiwiaW1wb3J0IHtcbiAgaXNQbGFpbk9iamVjdCxcbiAgaXNGdW5jdGlvbmFsQ29tcG9uZW50LFxuICBpc0NvbnN0cnVjdG9yXG59IGZyb20gJy4vdmFsaWRhdG9ycydcbmltcG9ydCB7IFZVRV9WRVJTSU9OIH0gZnJvbSAnLi9jb25zdHMnXG5pbXBvcnQgeyBjb21waWxlVGVtcGxhdGVGb3JTbG90cyB9IGZyb20gJy4vY29tcGlsZS10ZW1wbGF0ZSdcbmltcG9ydCB7IHRocm93RXJyb3IgfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQgeyB2YWxpZGF0ZVNsb3RzIH0gZnJvbSAnLi92YWxpZGF0ZS1zbG90cydcblxuZnVuY3Rpb24gdnVlRXh0ZW5kVW5zdXBwb3J0ZWRPcHRpb24ob3B0aW9uKSB7XG4gIHJldHVybiAoXG4gICAgYG9wdGlvbnMuJHtvcHRpb259IGlzIG5vdCBzdXBwb3J0ZWQgZm9yIGAgK1xuICAgIGBjb21wb25lbnRzIGNyZWF0ZWQgd2l0aCBWdWUuZXh0ZW5kIGluIFZ1ZSA8IDIuMy4gYCArXG4gICAgYFlvdSBjYW4gc2V0ICR7b3B0aW9ufSB0byBmYWxzZSB0byBtb3VudCB0aGUgY29tcG9uZW50LmBcbiAgKVxufVxuLy8gdGhlc2Ugb3B0aW9ucyBhcmVuJ3Qgc3VwcG9ydGVkIGlmIFZ1ZSBpcyB2ZXJzaW9uIDwgMi4zXG4vLyBmb3IgY29tcG9uZW50cyB1c2luZyBWdWUuZXh0ZW5kLiBUaGlzIGlzIGR1ZSB0byBhIGJ1Z1xuLy8gdGhhdCBtZWFucyB0aGUgbWl4aW5zIHdlIHVzZSB0byBhZGQgcHJvcGVydGllcyBhcmUgbm90IGFwcGxpZWRcbi8vIGNvcnJlY3RseVxuY29uc3QgVU5TVVBQT1JURURfVkVSU0lPTl9PUFRJT05TID0gWydtb2NrcycsICdzdHVicycsICdsb2NhbFZ1ZSddXG5cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZU9wdGlvbnMob3B0aW9ucywgY29tcG9uZW50KSB7XG4gIGlmIChvcHRpb25zLnBhcmVudENvbXBvbmVudCAmJiAhaXNQbGFpbk9iamVjdChvcHRpb25zLnBhcmVudENvbXBvbmVudCkpIHtcbiAgICB0aHJvd0Vycm9yKFxuICAgICAgYG9wdGlvbnMucGFyZW50Q29tcG9uZW50IHNob3VsZCBiZSBhIHZhbGlkIFZ1ZSBjb21wb25lbnQgb3B0aW9ucyBvYmplY3RgXG4gICAgKVxuICB9XG5cbiAgaWYgKCFpc0Z1bmN0aW9uYWxDb21wb25lbnQoY29tcG9uZW50KSAmJiBvcHRpb25zLmNvbnRleHQpIHtcbiAgICB0aHJvd0Vycm9yKFxuICAgICAgYG1vdW50LmNvbnRleHQgY2FuIG9ubHkgYmUgdXNlZCB3aGVuIG1vdW50aW5nIGEgZnVuY3Rpb25hbCBjb21wb25lbnRgXG4gICAgKVxuICB9XG5cbiAgaWYgKG9wdGlvbnMuY29udGV4dCAmJiAhaXNQbGFpbk9iamVjdChvcHRpb25zLmNvbnRleHQpKSB7XG4gICAgdGhyb3dFcnJvcignbW91bnQuY29udGV4dCBtdXN0IGJlIGFuIG9iamVjdCcpXG4gIH1cblxuICBpZiAoVlVFX1ZFUlNJT04gPCAyLjMgJiYgaXNDb25zdHJ1Y3Rvcihjb21wb25lbnQpKSB7XG4gICAgVU5TVVBQT1JURURfVkVSU0lPTl9PUFRJT05TLmZvckVhY2gob3B0aW9uID0+IHtcbiAgICAgIGlmIChvcHRpb25zW29wdGlvbl0pIHtcbiAgICAgICAgdGhyb3dFcnJvcih2dWVFeHRlbmRVbnN1cHBvcnRlZE9wdGlvbihvcHRpb24pKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBpZiAob3B0aW9ucy5zbG90cykge1xuICAgIGNvbXBpbGVUZW1wbGF0ZUZvclNsb3RzKG9wdGlvbnMuc2xvdHMpXG4gICAgLy8gdmFsaWRhdGUgc2xvdHMgb3V0c2lkZSBvZiB0aGUgY3JlYXRlU2xvdHMgZnVuY3Rpb24gc29cbiAgICAvLyB0aGF0IHdlIGNhbiB0aHJvdyBhbiBlcnJvciB3aXRob3V0IGl0IGJlaW5nIGNhdWdodCBieVxuICAgIC8vIHRoZSBWdWUgZXJyb3IgaGFuZGxlclxuICAgIC8vICRGbG93SWdub3JlXG4gICAgdmFsaWRhdGVTbG90cyhvcHRpb25zLnNsb3RzKVxuICB9XG59XG4iLCJpbXBvcnQgVnVlIGZyb20gJ3Z1ZSdcbmltcG9ydCBjcmVhdGVJbnN0YW5jZSBmcm9tICdjcmVhdGUtaW5zdGFuY2UnXG5pbXBvcnQgY3JlYXRlRWxlbWVudCBmcm9tICcuL2NyZWF0ZS1lbGVtZW50J1xuaW1wb3J0IHsgdGhyb3dJZkluc3RhbmNlc1RocmV3LCBhZGRHbG9iYWxFcnJvckhhbmRsZXIgfSBmcm9tICcuL2Vycm9yJ1xuaW1wb3J0IHsgbWVyZ2VPcHRpb25zIH0gZnJvbSAnc2hhcmVkL21lcmdlLW9wdGlvbnMnXG5pbXBvcnQgY29uZmlnIGZyb20gJy4vY29uZmlnJ1xuaW1wb3J0IHdhcm5JZk5vV2luZG93IGZyb20gJy4vd2Fybi1pZi1uby13aW5kb3cnXG5pbXBvcnQgY3JlYXRlV3JhcHBlciBmcm9tICcuL2NyZWF0ZS13cmFwcGVyJ1xuaW1wb3J0IGNyZWF0ZUxvY2FsVnVlIGZyb20gJy4vY3JlYXRlLWxvY2FsLXZ1ZSdcbmltcG9ydCB7IHZhbGlkYXRlT3B0aW9ucyB9IGZyb20gJ3NoYXJlZC92YWxpZGF0ZS1vcHRpb25zJ1xuXG5WdWUuY29uZmlnLnByb2R1Y3Rpb25UaXAgPSBmYWxzZVxuVnVlLmNvbmZpZy5kZXZ0b29scyA9IGZhbHNlXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG1vdW50KGNvbXBvbmVudCwgb3B0aW9ucyA9IHt9KSB7XG4gIHdhcm5JZk5vV2luZG93KClcblxuICBhZGRHbG9iYWxFcnJvckhhbmRsZXIoVnVlKVxuXG4gIGNvbnN0IF9WdWUgPSBjcmVhdGVMb2NhbFZ1ZShvcHRpb25zLmxvY2FsVnVlKVxuXG4gIGNvbnN0IG1lcmdlZE9wdGlvbnMgPSBtZXJnZU9wdGlvbnMob3B0aW9ucywgY29uZmlnKVxuXG4gIHZhbGlkYXRlT3B0aW9ucyhtZXJnZWRPcHRpb25zLCBjb21wb25lbnQpXG5cbiAgY29uc3QgcGFyZW50Vm0gPSBjcmVhdGVJbnN0YW5jZShjb21wb25lbnQsIG1lcmdlZE9wdGlvbnMsIF9WdWUpXG5cbiAgY29uc3QgZWwgPSBvcHRpb25zLmF0dGFjaFRvRG9jdW1lbnQgPyBjcmVhdGVFbGVtZW50KCkgOiB1bmRlZmluZWRcbiAgY29uc3Qgdm0gPSBwYXJlbnRWbS4kbW91bnQoZWwpXG5cbiAgY29tcG9uZW50Ll9DdG9yID0ge31cblxuICB0aHJvd0lmSW5zdGFuY2VzVGhyZXcodm0pXG5cbiAgY29uc3Qgd3JhcHBlck9wdGlvbnMgPSB7XG4gICAgYXR0YWNoZWRUb0RvY3VtZW50OiAhIW1lcmdlZE9wdGlvbnMuYXR0YWNoVG9Eb2N1bWVudFxuICB9XG5cbiAgY29uc3Qgcm9vdCA9IHBhcmVudFZtLiRvcHRpb25zLl9pc0Z1bmN0aW9uYWxDb250YWluZXJcbiAgICA/IHZtLl92bm9kZVxuICAgIDogdm0uJGNoaWxkcmVuWzBdXG5cbiAgcmV0dXJuIGNyZWF0ZVdyYXBwZXIocm9vdCwgd3JhcHBlck9wdGlvbnMpXG59XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgbW91bnQgZnJvbSAnLi9tb3VudCdcbmltcG9ydCB0eXBlIFZ1ZVdyYXBwZXIgZnJvbSAnLi92dWUtd3JhcHBlcidcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gc2hhbGxvd01vdW50KFxuICBjb21wb25lbnQ6IENvbXBvbmVudCxcbiAgb3B0aW9uczogT3B0aW9ucyA9IHt9XG4pOiBWdWVXcmFwcGVyIHtcbiAgcmV0dXJuIG1vdW50KGNvbXBvbmVudCwge1xuICAgIC4uLm9wdGlvbnMsXG4gICAgc2hvdWxkUHJveHk6IHRydWVcbiAgfSlcbn1cbiIsIi8vIEBmbG93XG5jb25zdCB0b1R5cGVzOiBBcnJheTxGdW5jdGlvbj4gPSBbU3RyaW5nLCBPYmplY3RdXG5jb25zdCBldmVudFR5cGVzOiBBcnJheTxGdW5jdGlvbj4gPSBbU3RyaW5nLCBBcnJheV1cblxuZXhwb3J0IGRlZmF1bHQge1xuICBuYW1lOiAnUm91dGVyTGlua1N0dWInLFxuICBwcm9wczoge1xuICAgIHRvOiB7XG4gICAgICB0eXBlOiB0b1R5cGVzLFxuICAgICAgcmVxdWlyZWQ6IHRydWVcbiAgICB9LFxuICAgIHRhZzoge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgZGVmYXVsdDogJ2EnXG4gICAgfSxcbiAgICBleGFjdDogQm9vbGVhbixcbiAgICBhcHBlbmQ6IEJvb2xlYW4sXG4gICAgcmVwbGFjZTogQm9vbGVhbixcbiAgICBhY3RpdmVDbGFzczogU3RyaW5nLFxuICAgIGV4YWN0QWN0aXZlQ2xhc3M6IFN0cmluZyxcbiAgICBldmVudDoge1xuICAgICAgdHlwZTogZXZlbnRUeXBlcyxcbiAgICAgIGRlZmF1bHQ6ICdjbGljaydcbiAgICB9XG4gIH0sXG4gIHJlbmRlcihoOiBGdW5jdGlvbikge1xuICAgIHJldHVybiBoKHRoaXMudGFnLCB1bmRlZmluZWQsIHRoaXMuJHNsb3RzLmRlZmF1bHQpXG4gIH1cbn1cbiIsImltcG9ydCBzaGFsbG93TW91bnQgZnJvbSAnLi9zaGFsbG93LW1vdW50J1xuaW1wb3J0IG1vdW50IGZyb20gJy4vbW91bnQnXG5pbXBvcnQgY3JlYXRlTG9jYWxWdWUgZnJvbSAnLi9jcmVhdGUtbG9jYWwtdnVlJ1xuaW1wb3J0IFJvdXRlckxpbmtTdHViIGZyb20gJy4vY29tcG9uZW50cy9Sb3V0ZXJMaW5rU3R1YidcbmltcG9ydCBjcmVhdGVXcmFwcGVyIGZyb20gJy4vY3JlYXRlLXdyYXBwZXInXG5pbXBvcnQgV3JhcHBlciBmcm9tICcuL3dyYXBwZXInXG5pbXBvcnQgV3JhcHBlckFycmF5IGZyb20gJy4vd3JhcHBlci1hcnJheSdcbmltcG9ydCBjb25maWcgZnJvbSAnLi9jb25maWcnXG5pbXBvcnQgeyB3YXJuIH0gZnJvbSAnc2hhcmVkL3V0aWwnXG5cbmZ1bmN0aW9uIHNoYWxsb3coY29tcG9uZW50LCBvcHRpb25zKSB7XG4gIHdhcm4oXG4gICAgYHNoYWxsb3cgaGFzIGJlZW4gcmVuYW1lZCB0byBzaGFsbG93TW91bnQuIHNoYWxsb3cgYCArXG4gICAgICBgd2lsbCBiZSByZW1vdmVkIGluIDEuMC4wLCB1c2Ugc2hhbGxvd01vdW50IGluc3RlYWRgXG4gIClcbiAgcmV0dXJuIHNoYWxsb3dNb3VudChjb21wb25lbnQsIG9wdGlvbnMpXG59XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgY3JlYXRlTG9jYWxWdWUsXG4gIGNyZWF0ZVdyYXBwZXIsXG4gIGNvbmZpZyxcbiAgbW91bnQsXG4gIHNoYWxsb3csXG4gIHNoYWxsb3dNb3VudCxcbiAgUm91dGVyTGlua1N0dWIsXG4gIFdyYXBwZXIsXG4gIFdyYXBwZXJBcnJheVxufVxuIl0sIm5hbWVzIjpbImNvbnN0IiwiY29tcGlsZVRvRnVuY3Rpb25zIiwidGhpcyIsIiQkVnVlIiwibGV0IiwicmVzb2x2ZUNvbXBvbmVudCIsImNvbXBvbmVudCIsInN0dWIiLCJldmVudFR5cGVzIiwic3VwZXIiLCJlcSIsImFzc29jSW5kZXhPZiIsImxpc3RDYWNoZUNsZWFyIiwibGlzdENhY2hlRGVsZXRlIiwibGlzdENhY2hlR2V0IiwibGlzdENhY2hlSGFzIiwibGlzdENhY2hlU2V0IiwiTGlzdENhY2hlIiwiZ2xvYmFsIiwiZnJlZUdsb2JhbCIsInJvb3QiLCJoYXNPd25Qcm9wZXJ0eSIsIlN5bWJvbCIsIm9iamVjdFByb3RvIiwibmF0aXZlT2JqZWN0VG9TdHJpbmciLCJzeW1Ub1N0cmluZ1RhZyIsImdldFJhd1RhZyIsIm9iamVjdFRvU3RyaW5nIiwiaXNPYmplY3QiLCJiYXNlR2V0VGFnIiwiY29yZUpzRGF0YSIsImZ1bmNQcm90byIsImZ1bmNUb1N0cmluZyIsImlzTWFza2VkIiwiaXNGdW5jdGlvbiIsInRvU291cmNlIiwiZ2V0VmFsdWUiLCJiYXNlSXNOYXRpdmUiLCJnZXROYXRpdmUiLCJuYXRpdmVDcmVhdGUiLCJIQVNIX1VOREVGSU5FRCIsImhhc2hDbGVhciIsImhhc2hEZWxldGUiLCJoYXNoR2V0IiwiaGFzaEhhcyIsImhhc2hTZXQiLCJIYXNoIiwiTWFwIiwiaXNLZXlhYmxlIiwiZ2V0TWFwRGF0YSIsIm1hcENhY2hlQ2xlYXIiLCJtYXBDYWNoZURlbGV0ZSIsIm1hcENhY2hlR2V0IiwibWFwQ2FjaGVIYXMiLCJtYXBDYWNoZVNldCIsIk1hcENhY2hlIiwic3RhY2tDbGVhciIsInN0YWNrRGVsZXRlIiwic3RhY2tHZXQiLCJzdGFja0hhcyIsInN0YWNrU2V0IiwiZGVmaW5lUHJvcGVydHkiLCJiYXNlQXNzaWduVmFsdWUiLCJhc3NpZ25WYWx1ZSIsImlzT2JqZWN0TGlrZSIsImJhc2VJc0FyZ3VtZW50cyIsInN0dWJGYWxzZSIsIk1BWF9TQUZFX0lOVEVHRVIiLCJhcmdzVGFnIiwiZnVuY1RhZyIsImlzTGVuZ3RoIiwibm9kZVV0aWwiLCJiYXNlVW5hcnkiLCJiYXNlSXNUeXBlZEFycmF5IiwiaXNBcnJheSIsImlzQXJndW1lbnRzIiwiaXNCdWZmZXIiLCJpc1R5cGVkQXJyYXkiLCJiYXNlVGltZXMiLCJpc0luZGV4Iiwib3ZlckFyZyIsImlzUHJvdG90eXBlIiwibmF0aXZlS2V5cyIsImlzQXJyYXlMaWtlIiwiYXJyYXlMaWtlS2V5cyIsImJhc2VLZXlzIiwiY29weU9iamVjdCIsImtleXMiLCJuYXRpdmVLZXlzSW4iLCJrZXlzSW4iLCJiYXNlS2V5c0luIiwicHJvcGVydHlJc0VudW1lcmFibGUiLCJzdHViQXJyYXkiLCJhcnJheUZpbHRlciIsImdldFN5bWJvbHMiLCJuYXRpdmVHZXRTeW1ib2xzIiwiYXJyYXlQdXNoIiwiZ2V0UHJvdG90eXBlIiwiZ2V0U3ltYm9sc0luIiwiYmFzZUdldEFsbEtleXMiLCJTZXQiLCJtYXBUYWciLCJvYmplY3RUYWciLCJzZXRUYWciLCJ3ZWFrTWFwVGFnIiwiZGF0YVZpZXdUYWciLCJEYXRhVmlldyIsIlByb21pc2UiLCJXZWFrTWFwIiwiVWludDhBcnJheSIsImNsb25lQXJyYXlCdWZmZXIiLCJtYXBUb0FycmF5IiwiYXJyYXlSZWR1Y2UiLCJhZGRNYXBFbnRyeSIsIkNMT05FX0RFRVBfRkxBRyIsInNldFRvQXJyYXkiLCJhZGRTZXRFbnRyeSIsImJvb2xUYWciLCJkYXRlVGFnIiwibnVtYmVyVGFnIiwicmVnZXhwVGFnIiwic3RyaW5nVGFnIiwiYXJyYXlCdWZmZXJUYWciLCJmbG9hdDMyVGFnIiwiZmxvYXQ2NFRhZyIsImludDhUYWciLCJpbnQxNlRhZyIsImludDMyVGFnIiwidWludDhUYWciLCJ1aW50OENsYW1wZWRUYWciLCJ1aW50MTZUYWciLCJ1aW50MzJUYWciLCJjbG9uZURhdGFWaWV3IiwiY2xvbmVUeXBlZEFycmF5IiwiY2xvbmVNYXAiLCJjbG9uZVJlZ0V4cCIsImNsb25lU2V0IiwiY2xvbmVTeW1ib2wiLCJiYXNlQ3JlYXRlIiwiYXJyYXlUYWciLCJlcnJvclRhZyIsImdlblRhZyIsInN5bWJvbFRhZyIsImluaXRDbG9uZUFycmF5IiwiY29weUFycmF5IiwiZ2V0VGFnIiwiY2xvbmVCdWZmZXIiLCJpbml0Q2xvbmVPYmplY3QiLCJjb3B5U3ltYm9sc0luIiwiYmFzZUFzc2lnbkluIiwiY29weVN5bWJvbHMiLCJiYXNlQXNzaWduIiwiaW5pdENsb25lQnlUYWciLCJTdGFjayIsImdldEFsbEtleXNJbiIsImdldEFsbEtleXMiLCJhcnJheUVhY2giLCJDTE9ORV9TWU1CT0xTX0ZMQUciLCJiYXNlQ2xvbmUiLCJjbG9uZURlZXAiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFJQSxTQUFTLFlBQVksQ0FBQyxFQUFFLEVBQWEsU0FBUyxFQUFVLElBQUksRUFBZ0I7RUFDMUVBLElBQU0sRUFBRSxHQUFHQyxz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QUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRTtJQUM5QyxLQUFLLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDckMsSUFBSSxHQUFHLENBQUM7O0lBRVIsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ1IsR0FBRyxHQUFHLEVBQUUsR0FBQztTQUNOLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNiLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLFFBQVEsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxNQUFNLEdBQUM7U0FDM0MsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDOztRQUViLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsTUFBTSxHQUFHLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFDO1NBQzNELElBQUksRUFBRSxFQUFFO01BQ1gsS0FBSyxDQUFDLGlCQUFpQixFQUFFLEVBQUUsQ0FBQyxDQUFDO01BQzdCLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHO1VBQ3RCLEVBQUUsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFDO01BQ2hCLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxFQUFFO1lBQ2pDLElBQUksR0FBRyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQztLQUN4Qzs7UUFFQyxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO1lBQzVCLElBQUksR0FBRyxDQUFDLEdBQUcsR0FBRyxJQUFJLENB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
