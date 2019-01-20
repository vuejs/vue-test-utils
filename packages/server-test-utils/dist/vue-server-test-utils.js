'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var vueTemplateCompiler = require('vue-template-compiler');
var Vue = _interopDefault(require('vue'));
var testUtils = _interopDefault(require('@vue/test-utils'));
var vueServerRenderer = require('vue-server-renderer');
var cheerio = _interopDefault(require('cheerio'));

// 

function createVNodes (
  vm,
  slotValue,
  name
) {
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

function createVNodesForSlot (
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

function createSlotVNodes (
  vm,
  slots
) {
  return Object.keys(slots).reduce(function (acc, key) {
    var content = slots[key];
    if (Array.isArray(content)) {
      var nodes = content.map(
        function (slotDef) { return createVNodesForSlot(vm, slotDef, key); }
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

function throwError (msg) {
  throw new Error(("[vue-test-utils]: " + msg))
}

function warn (msg) {
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

function hasOwnProperty (obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop)
}

function resolveComponent (id, components) {
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

var UA = typeof window !== 'undefined' &&
  'navigator' in window &&
  navigator.userAgent.toLowerCase();

var isPhantomJS = UA && UA.includes &&
  UA.match(/phantomjs/i);

var isEdge = UA && UA.indexOf('edge/') > 0;
var isChrome = UA && /chrome\/\d+/.test(UA) && !isEdge;

// 

function addMocks (
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

function logEvents (
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

function addEventLogger (_Vue) {
  _Vue.mixin({
    beforeCreate: function () {
      this.__emitted = Object.create(null);
      this.__emittedByOrder = [];
      logEvents(this, this.__emitted, this.__emittedByOrder);
    }
  });
}

var VUE_VERSION = Number(
  ((Vue.version.split('.')[0]) + "." + (Vue.version.split('.')[1]))
);

var BEFORE_RENDER_LIFECYCLE_HOOK =
  semver.gt(Vue.version, '2.1.8')
    ? 'beforeCreate'
    : 'beforeMount';

var CREATE_ELEMENT_ALIAS = semver.gt(Vue.version, '2.1.5')
  ? '_c'
  : '_h';

function addStubs (_Vue, stubComponents) {
  var obj;

  function addStubComponentsMixin () {
    Object.assign(this.$options.components, stubComponents);
  }

  _Vue.mixin(( obj = {}, obj[BEFORE_RENDER_LIFECYCLE_HOOK] = addStubComponentsMixin, obj));
}

// 

function isVueComponent (c) {
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

function componentNeedsCompiling (component) {
  return (
    component &&
    !component.render &&
    (component.template || component.extends || component.extendOptions) &&
    !component.functional
  )
}

function isConstructor (c) {
  return typeof c === 'function' && c.cid
}

function isDynamicComponent (c) {
  return typeof c === 'function' && !c.cid
}

function isComponentOptions (c) {
  return typeof c === 'object' && (c.template || c.render)
}

function isFunctionalComponent (c) {
  if (!isVueComponent(c)) {
    return false
  }
  if (isConstructor(c)) {
    return c.options.functional
  }
  return c.functional
}

function templateContainsComponent (
  template,
  name
) {
  return [capitalize, camelize, hyphenate].some(function (format) {
    var re = new RegExp(("<" + (format(name)) + "\\s*(\\s|>|(/>))"), 'g');
    return re.test(template)
  })
}

function isPlainObject (c) {
  return Object.prototype.toString.call(c) === '[object Object]'
}

function makeMap (
  str,
  expectsLowerCase
) {
  var map = Object.create(null);
  var list = str.split(',');
  for (var i = 0; i < list.length; i++) {
    map[list[i]] = true;
  }
  return expectsLowerCase
    ? function (val) { return map[val.toLowerCase()] }
    : function (val) { return map[val] }
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

function compileFromString (str) {
  if (!vueTemplateCompiler.compileToFunctions) {
    throwError(
      "vueTemplateCompiler is undefined, you must pass " +
        "precompiled components if vue-template-compiler is " +
        "undefined"
    );
  }
  return vueTemplateCompiler.compileToFunctions(str)
}

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

function compileTemplateForSlots (slots) {
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
  'logModifiedComponents',
  'sync',
  'shouldProxy'
];

function extractInstanceOptions (
  options
) {
  var instanceOptions = Object.assign({}, options);
  MOUNTING_OPTIONS.forEach(function (mountingOption) {
    delete instanceOptions[mountingOption];
  });
  return instanceOptions
}

// 

function isDestructuringSlotScope (slotScope) {
  return slotScope[0] === '{' && slotScope[slotScope.length - 1] === '}'
}

function getVueTemplateCompilerHelpers (
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

function validateEnvironment () {
  if (VUE_VERSION < 2.1) {
    throwError("the scopedSlots option is only supported in vue@2.1+.");
  }
}

var slotScopeRe = /<[^>]+ slot-scope=\"(.+)\"/;

// Hide warning about <template> disallowed as root element
function customWarn (msg) {
  if (msg.indexOf('Cannot use <template> as component root element') === -1) {
    console.error(msg);
  }
}

function createScopedSlots (
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
    var renderFn = typeof slot === 'function'
      ? slot
      : vueTemplateCompiler.compileToFunctions(slot, { warn: customWarn }).render;

    var hasSlotScopeAttr = !isFn && slot.match(slotScopeRe);
    var slotScope = hasSlotScopeAttr && hasSlotScopeAttr[1];
    scopedSlots[scopedSlotName] = function (props) {
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

function isVueComponentStub (comp) {
  return comp && comp.template || isVueComponent(comp)
}

function isValidStub (stub) {
  return (
    typeof stub === 'boolean' ||
    (!!stub && typeof stub === 'string') ||
    isVueComponentStub(stub)
  )
}

function resolveComponent$1 (obj, component) {
  return obj[component] ||
    obj[hyphenate(component)] ||
    obj[camelize(component)] ||
    obj[capitalize(camelize(component))] ||
    obj[capitalize(component)] ||
    {}
}

function getCoreProperties (componentOptions) {
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

function createClassString (staticClass, dynamicClass) {
  if (staticClass && dynamicClass) {
    return staticClass + ' ' + dynamicClass
  }
  return staticClass || dynamicClass
}

function resolveOptions (component, _Vue) {
  if (isDynamicComponent(component)) {
    return {}
  }

  return isConstructor(component)
    ? component.options
    : _Vue.extend(component).options
}

function createStubFromComponent (
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
    render: function render (h, context) {
      return h(
        tagName,
        {
          attrs: componentOptions.functional ? Object.assign({}, context.props,
            context.data.attrs,
            {class: createClassString(
              context.data.staticClass,
              context.data.class
            )}) : Object.assign({}, this.$props)
        },
        context ? context.children : this.$options._renderChildren
      )
    }})
}

function createStubFromString (
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

function validateStub (stub) {
  if (!isValidStub(stub)) {
    throwError(
      "options.stub values must be passed a string or " +
      "component"
    );
  }
}

function createStubsFromStubsObject (
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
      acc[stubName] = createStubFromString(
        stub,
        component$1,
        stubName,
        _Vue
      );
      return acc
    }

    if (componentNeedsCompiling(stub)) {
      compileTemplate(stub);
    }

    acc[stubName] = stub;

    return acc
  }, {})
}

var isWhitelisted = function (el, whitelist) { return resolveComponent(el, whitelist); };
var isAlreadyStubbed = function (el, stubs) { return stubs.has(el); };

function shouldExtend (component, _Vue) {
  return (
    isConstructor(component) ||
    (component && component.extends)
  )
}

function extend (component, _Vue) {
  var componentOptions = component.options ? component.options : component;
  var stub = _Vue.extend(componentOptions);
  stub.options.$_vueTestUtils_original = component;
  stub.options._base = _Vue;
  return stub
}

function createStubIfNeeded (shouldStub, component, _Vue, el) {
  if (shouldStub) {
    return createStubFromComponent(component || {}, el, _Vue)
  }

  if (shouldExtend(component, _Vue)) {
    return extend(component, _Vue)
  }
}

function shouldNotBeStubbed (el, whitelist, modifiedComponents) {
  return (
    (typeof el === 'string' && isReservedTag(el)) ||
    isWhitelisted(el, whitelist) ||
    isAlreadyStubbed(el, modifiedComponents)
  )
}

function patchCreateElement (_Vue, stubs, stubAllComponents) {
  var obj;

  // This mixin patches vm.$createElement so that we can stub all components
  // before they are rendered in shallow mode. We also need to ensure that
  // component constructors were created from the _Vue constructor. If not,
  // we must replace them with components created from the _Vue constructor
  // before calling the original $createElement. This ensures that components
  // have the correct instance properties and stubs when they are rendered.
  function patchCreateElementMixin () {
    var vm = this;

    if (
      vm.$options.$_doNotStubChildren ||
      vm.$options._isFunctionalContainer
    ) {
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

function createContext (options, scopedSlots) {
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

function createChildren (vm, h, ref) {
  var slots = ref.slots;
  var context = ref.context;

  var slotVNodes = slots
    ? createSlotVNodes(vm, slots)
    : undefined;
  return (
    context &&
    context.children &&
    context.children.map(function (x) { return (typeof x === 'function' ? x(h) : x); })
  ) || slotVNodes
}

function createInstance (
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
  componentOptions._base = _Vue;

  var Constructor = _Vue.extend(componentOptions).extend(instanceOptions);

  var scopedSlots = createScopedSlots(options.scopedSlots, _Vue);

  var parentComponentOptions = options.parentComponent || {};

  parentComponentOptions.provide = options.provide;
  parentComponentOptions.$_doNotStubChildren = true;
  parentComponentOptions._isFunctionalContainer = componentOptions.functional;
  parentComponentOptions.render = function (h) {
    return h(
      Constructor,
      createContext(options, scopedSlots),
      createChildren(this, h, options)
    )
  };
  var Parent = _Vue.extend(parentComponentOptions);

  return new Parent()
}

function normalizeStubs (stubs) {
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

function normalizeProvide (provide) {
  // Objects are not resolved in extended components in Vue < 2.5
  // https://github.com/vuejs/vue/issues/6436
  if (
    typeof provide === 'object' &&
    VUE_VERSION < 2.5
  ) {
    var obj = Object.assign({}, provide);
    return function () { return obj; }
  }
  return provide
}

// 

function getOption (option, config) {
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

function mergeOptions (options, config) {
  var mocks = (getOption(options.mocks, config.mocks));
  var methods = (
    (getOption(options.methods, config.methods)));
  var provide = ((getOption(options.provide, config.provide)));
  return Object.assign({}, options,
    {provide: normalizeProvide(provide),
    logModifiedComponents: config.logModifiedComponents,
    stubs: getOption(normalizeStubs(options.stubs), config.stubs),
    mocks: mocks,
    methods: methods,
    sync: !!(options.sync || options.sync === undefined)})
}

var config = testUtils.config

// 

function isValidSlot (slot) {
  return (
    isVueComponent(slot) ||
    typeof slot === 'string'
  )
}

function requiresTemplateCompiler (slot) {
  if (typeof slot === 'string' && !vueTemplateCompiler.compileToFunctions) {
    throwError(
      "vueTemplateCompiler is undefined, you must pass " +
      "precompiled components if vue-template-compiler is " +
      "undefined"
    );
  }
}

function validateSlots (slots) {
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

function vueExtendUnsupportedOption (option) {
  return "options." + option + " is not supported for " +
  "components created with Vue.extend in Vue < 2.3. " +
  "You can set " + option + " to false to mount the component."
}
// these options aren't supported if Vue is version < 2.3
// for components using Vue.extend. This is due to a bug
// that means the mixins we use to add properties are not applied
// correctly
var UNSUPPORTED_VERSION_OPTIONS = [
  'mocks',
  'stubs',
  'localVue'
];

function validateOptions (options, component) {
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

  if (
    VUE_VERSION < 2.3 && isConstructor(component)
  ) {
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

function renderToString (
  component,
  options
) {
  if ( options === void 0 ) options = {};

  var renderer = vueServerRenderer.createRenderer();

  if (!renderer) {
    throwError(
      "renderToString must be run in node. It cannot be " + "run in a browser"
    );
  }

  if (options.attachToDocument) {
    throwError("you cannot use attachToDocument with " + "renderToString");
  }

  var mergedOptions = mergeOptions(options, config);
  validateOptions(mergedOptions, component);

  var vm = createInstance(
    component,
    mergedOptions,
    testUtils.createLocalVue(options.localVue)
  );
  var renderedString = '';

  // $FlowIgnore
  renderer.renderToString(vm, function (err, res) {
    if (err) {
      throw err
    }
    renderedString = res;
  });
  return renderedString
}

// 

function render (
  component,
  options
) {
  if ( options === void 0 ) options = {};

  var renderedString = renderToString(component, options);
  return cheerio.load('')(renderedString)
}

var index = {
  renderToString: renderToString,
  config: config,
  render: render
}

module.exports = index;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidnVlLXNlcnZlci10ZXN0LXV0aWxzLmpzIiwic291cmNlcyI6WyIuLi8uLi9jcmVhdGUtaW5zdGFuY2UvY3JlYXRlLXNsb3Qtdm5vZGVzLmpzIiwiLi4vLi4vc2hhcmVkL25vZGVfbW9kdWxlcy9zZW12ZXIvc2VtdmVyLmpzIiwiLi4vLi4vc2hhcmVkL3V0aWwuanMiLCIuLi8uLi9jcmVhdGUtaW5zdGFuY2UvYWRkLW1vY2tzLmpzIiwiLi4vLi4vY3JlYXRlLWluc3RhbmNlL2xvZy1ldmVudHMuanMiLCIuLi8uLi9zaGFyZWQvY29uc3RzLmpzIiwiLi4vLi4vY3JlYXRlLWluc3RhbmNlL2FkZC1zdHVicy5qcyIsIi4uLy4uL3NoYXJlZC92YWxpZGF0b3JzLmpzIiwiLi4vLi4vc2hhcmVkL2NvbXBpbGUtdGVtcGxhdGUuanMiLCIuLi8uLi9jcmVhdGUtaW5zdGFuY2UvZXh0cmFjdC1pbnN0YW5jZS1vcHRpb25zLmpzIiwiLi4vLi4vY3JlYXRlLWluc3RhbmNlL2NyZWF0ZS1zY29wZWQtc2xvdHMuanMiLCIuLi8uLi9jcmVhdGUtaW5zdGFuY2UvY3JlYXRlLWNvbXBvbmVudC1zdHVicy5qcyIsIi4uLy4uL2NyZWF0ZS1pbnN0YW5jZS9wYXRjaC1jcmVhdGUtZWxlbWVudC5qcyIsIi4uLy4uL2NyZWF0ZS1pbnN0YW5jZS9jcmVhdGUtaW5zdGFuY2UuanMiLCIuLi8uLi9zaGFyZWQvbm9ybWFsaXplLmpzIiwiLi4vLi4vc2hhcmVkL21lcmdlLW9wdGlvbnMuanMiLCIuLi9zcmMvY29uZmlnLmpzIiwiLi4vLi4vc2hhcmVkL3ZhbGlkYXRlLXNsb3RzLmpzIiwiLi4vLi4vc2hhcmVkL3ZhbGlkYXRlLW9wdGlvbnMuanMiLCIuLi9zcmMvcmVuZGVyVG9TdHJpbmcuanMiLCIuLi9zcmMvcmVuZGVyLmpzIiwiLi4vc3JjL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIEBmbG93XG5cbmltcG9ydCB7IGNvbXBpbGVUb0Z1bmN0aW9ucyB9IGZyb20gJ3Z1ZS10ZW1wbGF0ZS1jb21waWxlcidcblxuZnVuY3Rpb24gY3JlYXRlVk5vZGVzIChcbiAgdm06IENvbXBvbmVudCxcbiAgc2xvdFZhbHVlOiBzdHJpbmcsXG4gIG5hbWVcbik6IEFycmF5PFZOb2RlPiB7XG4gIGNvbnN0IGVsID0gY29tcGlsZVRvRnVuY3Rpb25zKFxuICAgIGA8ZGl2Pjx0ZW1wbGF0ZSBzbG90PSR7bmFtZX0+JHtzbG90VmFsdWV9PC90ZW1wbGF0ZT48L2Rpdj5gXG4gIClcbiAgY29uc3QgX3N0YXRpY1JlbmRlckZucyA9IHZtLl9yZW5kZXJQcm94eS4kb3B0aW9ucy5zdGF0aWNSZW5kZXJGbnNcbiAgY29uc3QgX3N0YXRpY1RyZWVzID0gdm0uX3JlbmRlclByb3h5Ll9zdGF0aWNUcmVlc1xuICB2bS5fcmVuZGVyUHJveHkuX3N0YXRpY1RyZWVzID0gW11cbiAgdm0uX3JlbmRlclByb3h5LiRvcHRpb25zLnN0YXRpY1JlbmRlckZucyA9IGVsLnN0YXRpY1JlbmRlckZuc1xuICBjb25zdCB2bm9kZSA9IGVsLnJlbmRlci5jYWxsKHZtLl9yZW5kZXJQcm94eSwgdm0uJGNyZWF0ZUVsZW1lbnQpXG4gIHZtLl9yZW5kZXJQcm94eS4kb3B0aW9ucy5zdGF0aWNSZW5kZXJGbnMgPSBfc3RhdGljUmVuZGVyRm5zXG4gIHZtLl9yZW5kZXJQcm94eS5fc3RhdGljVHJlZXMgPSBfc3RhdGljVHJlZXNcbiAgcmV0dXJuIHZub2RlLmNoaWxkcmVuWzBdXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVZOb2Rlc0ZvclNsb3QgKFxuICB2bTogQ29tcG9uZW50LFxuICBzbG90VmFsdWU6IFNsb3RWYWx1ZSxcbiAgbmFtZTogc3RyaW5nLFxuKTogVk5vZGUgfCBBcnJheTxWTm9kZT4ge1xuICBpZiAodHlwZW9mIHNsb3RWYWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gY3JlYXRlVk5vZGVzKHZtLCBzbG90VmFsdWUsIG5hbWUpXG4gIH1cbiAgY29uc3Qgdm5vZGUgPSB2bS4kY3JlYXRlRWxlbWVudChzbG90VmFsdWUpXG4gIDsodm5vZGUuZGF0YSB8fCAodm5vZGUuZGF0YSA9IHt9KSkuc2xvdCA9IG5hbWVcbiAgcmV0dXJuIHZub2RlXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTbG90Vk5vZGVzIChcbiAgdm06IENvbXBvbmVudCxcbiAgc2xvdHM6IFNsb3RzT2JqZWN0XG4pOiBBcnJheTxWTm9kZSB8IEFycmF5PFZOb2RlPj4ge1xuICByZXR1cm4gT2JqZWN0LmtleXMoc2xvdHMpLnJlZHVjZSgoYWNjLCBrZXkpID0+IHtcbiAgICBjb25zdCBjb250ZW50ID0gc2xvdHNba2V5XVxuICAgIGlmIChBcnJheS5pc0FycmF5KGNvbnRlbnQpKSB7XG4gICAgICBjb25zdCBub2RlcyA9IGNvbnRlbnQubWFwKFxuICAgICAgICBzbG90RGVmID0+IGNyZWF0ZVZOb2Rlc0ZvclNsb3Qodm0sIHNsb3REZWYsIGtleSlcbiAgICAgIClcbiAgICAgIHJldHVybiBhY2MuY29uY2F0KG5vZGVzKVxuICAgIH1cblxuICAgIHJldHVybiBhY2MuY29uY2F0KGNyZWF0ZVZOb2Rlc0ZvclNsb3Qodm0sIGNvbnRlbnQsIGtleSkpXG4gIH0sIFtdKVxufVxuIiwiZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gU2VtVmVyO1xuXG4vLyBUaGUgZGVidWcgZnVuY3Rpb24gaXMgZXhjbHVkZWQgZW50aXJlbHkgZnJvbSB0aGUgbWluaWZpZWQgdmVyc2lvbi5cbi8qIG5vbWluICovIHZhciBkZWJ1Zztcbi8qIG5vbWluICovIGlmICh0eXBlb2YgcHJvY2VzcyA9PT0gJ29iamVjdCcgJiZcbiAgICAvKiBub21pbiAqLyBwcm9jZXNzLmVudiAmJlxuICAgIC8qIG5vbWluICovIHByb2Nlc3MuZW52Lk5PREVfREVCVUcgJiZcbiAgICAvKiBub21pbiAqLyAvXFxic2VtdmVyXFxiL2kudGVzdChwcm9jZXNzLmVudi5OT0RFX0RFQlVHKSlcbiAgLyogbm9taW4gKi8gZGVidWcgPSBmdW5jdGlvbigpIHtcbiAgICAvKiBub21pbiAqLyB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMCk7XG4gICAgLyogbm9taW4gKi8gYXJncy51bnNoaWZ0KCdTRU1WRVInKTtcbiAgICAvKiBub21pbiAqLyBjb25zb2xlLmxvZy5hcHBseShjb25zb2xlLCBhcmdzKTtcbiAgICAvKiBub21pbiAqLyB9O1xuLyogbm9taW4gKi8gZWxzZVxuICAvKiBub21pbiAqLyBkZWJ1ZyA9IGZ1bmN0aW9uKCkge307XG5cbi8vIE5vdGU6IHRoaXMgaXMgdGhlIHNlbXZlci5vcmcgdmVyc2lvbiBvZiB0aGUgc3BlYyB0aGF0IGl0IGltcGxlbWVudHNcbi8vIE5vdCBuZWNlc3NhcmlseSB0aGUgcGFja2FnZSB2ZXJzaW9uIG9mIHRoaXMgY29kZS5cbmV4cG9ydHMuU0VNVkVSX1NQRUNfVkVSU0lPTiA9ICcyLjAuMCc7XG5cbnZhciBNQVhfTEVOR1RIID0gMjU2O1xudmFyIE1BWF9TQUZFX0lOVEVHRVIgPSBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUiB8fCA5MDA3MTk5MjU0NzQwOTkxO1xuXG4vLyBNYXggc2FmZSBzZWdtZW50IGxlbmd0aCBmb3IgY29lcmNpb24uXG52YXIgTUFYX1NBRkVfQ09NUE9ORU5UX0xFTkdUSCA9IDE2O1xuXG4vLyBUaGUgYWN0dWFsIHJlZ2V4cHMgZ28gb24gZXhwb3J0cy5yZVxudmFyIHJlID0gZXhwb3J0cy5yZSA9IFtdO1xudmFyIHNyYyA9IGV4cG9ydHMuc3JjID0gW107XG52YXIgUiA9IDA7XG5cbi8vIFRoZSBmb2xsb3dpbmcgUmVndWxhciBFeHByZXNzaW9ucyBjYW4gYmUgdXNlZCBmb3IgdG9rZW5pemluZyxcbi8vIHZhbGlkYXRpbmcsIGFuZCBwYXJzaW5nIFNlbVZlciB2ZXJzaW9uIHN0cmluZ3MuXG5cbi8vICMjIE51bWVyaWMgSWRlbnRpZmllclxuLy8gQSBzaW5nbGUgYDBgLCBvciBhIG5vbi16ZXJvIGRpZ2l0IGZvbGxvd2VkIGJ5IHplcm8gb3IgbW9yZSBkaWdpdHMuXG5cbnZhciBOVU1FUklDSURFTlRJRklFUiA9IFIrKztcbnNyY1tOVU1FUklDSURFTlRJRklFUl0gPSAnMHxbMS05XVxcXFxkKic7XG52YXIgTlVNRVJJQ0lERU5USUZJRVJMT09TRSA9IFIrKztcbnNyY1tOVU1FUklDSURFTlRJRklFUkxPT1NFXSA9ICdbMC05XSsnO1xuXG5cbi8vICMjIE5vbi1udW1lcmljIElkZW50aWZpZXJcbi8vIFplcm8gb3IgbW9yZSBkaWdpdHMsIGZvbGxvd2VkIGJ5IGEgbGV0dGVyIG9yIGh5cGhlbiwgYW5kIHRoZW4gemVybyBvclxuLy8gbW9yZSBsZXR0ZXJzLCBkaWdpdHMsIG9yIGh5cGhlbnMuXG5cbnZhciBOT05OVU1FUklDSURFTlRJRklFUiA9IFIrKztcbnNyY1tOT05OVU1FUklDSURFTlRJRklFUl0gPSAnXFxcXGQqW2EtekEtWi1dW2EtekEtWjAtOS1dKic7XG5cblxuLy8gIyMgTWFpbiBWZXJzaW9uXG4vLyBUaHJlZSBkb3Qtc2VwYXJhdGVkIG51bWVyaWMgaWRlbnRpZmllcnMuXG5cbnZhciBNQUlOVkVSU0lPTiA9IFIrKztcbnNyY1tNQUlOVkVSU0lPTl0gPSAnKCcgKyBzcmNbTlVNRVJJQ0lERU5USUZJRVJdICsgJylcXFxcLicgK1xuICAgICAgICAgICAgICAgICAgICcoJyArIHNyY1tOVU1FUklDSURFTlRJRklFUl0gKyAnKVxcXFwuJyArXG4gICAgICAgICAgICAgICAgICAgJygnICsgc3JjW05VTUVSSUNJREVOVElGSUVSXSArICcpJztcblxudmFyIE1BSU5WRVJTSU9OTE9PU0UgPSBSKys7XG5zcmNbTUFJTlZFUlNJT05MT09TRV0gPSAnKCcgKyBzcmNbTlVNRVJJQ0lERU5USUZJRVJMT09TRV0gKyAnKVxcXFwuJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnKCcgKyBzcmNbTlVNRVJJQ0lERU5USUZJRVJMT09TRV0gKyAnKVxcXFwuJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnKCcgKyBzcmNbTlVNRVJJQ0lERU5USUZJRVJMT09TRV0gKyAnKSc7XG5cbi8vICMjIFByZS1yZWxlYXNlIFZlcnNpb24gSWRlbnRpZmllclxuLy8gQSBudW1lcmljIGlkZW50aWZpZXIsIG9yIGEgbm9uLW51bWVyaWMgaWRlbnRpZmllci5cblxudmFyIFBSRVJFTEVBU0VJREVOVElGSUVSID0gUisrO1xuc3JjW1BSRVJFTEVBU0VJREVOVElGSUVSXSA9ICcoPzonICsgc3JjW05VTUVSSUNJREVOVElGSUVSXSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3wnICsgc3JjW05PTk5VTUVSSUNJREVOVElGSUVSXSArICcpJztcblxudmFyIFBSRVJFTEVBU0VJREVOVElGSUVSTE9PU0UgPSBSKys7XG5zcmNbUFJFUkVMRUFTRUlERU5USUZJRVJMT09TRV0gPSAnKD86JyArIHNyY1tOVU1FUklDSURFTlRJRklFUkxPT1NFXSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnfCcgKyBzcmNbTk9OTlVNRVJJQ0lERU5USUZJRVJdICsgJyknO1xuXG5cbi8vICMjIFByZS1yZWxlYXNlIFZlcnNpb25cbi8vIEh5cGhlbiwgZm9sbG93ZWQgYnkgb25lIG9yIG1vcmUgZG90LXNlcGFyYXRlZCBwcmUtcmVsZWFzZSB2ZXJzaW9uXG4vLyBpZGVudGlmaWVycy5cblxudmFyIFBSRVJFTEVBU0UgPSBSKys7XG5zcmNbUFJFUkVMRUFTRV0gPSAnKD86LSgnICsgc3JjW1BSRVJFTEVBU0VJREVOVElGSUVSXSArXG4gICAgICAgICAgICAgICAgICAnKD86XFxcXC4nICsgc3JjW1BSRVJFTEVBU0VJREVOVElGSUVSXSArICcpKikpJztcblxudmFyIFBSRVJFTEVBU0VMT09TRSA9IFIrKztcbnNyY1tQUkVSRUxFQVNFTE9PU0VdID0gJyg/Oi0/KCcgKyBzcmNbUFJFUkVMRUFTRUlERU5USUZJRVJMT09TRV0gK1xuICAgICAgICAgICAgICAgICAgICAgICAnKD86XFxcXC4nICsgc3JjW1BSRVJFTEVBU0VJREVOVElGSUVSTE9PU0VdICsgJykqKSknO1xuXG4vLyAjIyBCdWlsZCBNZXRhZGF0YSBJZGVudGlmaWVyXG4vLyBBbnkgY29tYmluYXRpb24gb2YgZGlnaXRzLCBsZXR0ZXJzLCBvciBoeXBoZW5zLlxuXG52YXIgQlVJTERJREVOVElGSUVSID0gUisrO1xuc3JjW0JVSUxESURFTlRJRklFUl0gPSAnWzAtOUEtWmEtei1dKyc7XG5cbi8vICMjIEJ1aWxkIE1ldGFkYXRhXG4vLyBQbHVzIHNpZ24sIGZvbGxvd2VkIGJ5IG9uZSBvciBtb3JlIHBlcmlvZC1zZXBhcmF0ZWQgYnVpbGQgbWV0YWRhdGFcbi8vIGlkZW50aWZpZXJzLlxuXG52YXIgQlVJTEQgPSBSKys7XG5zcmNbQlVJTERdID0gJyg/OlxcXFwrKCcgKyBzcmNbQlVJTERJREVOVElGSUVSXSArXG4gICAgICAgICAgICAgJyg/OlxcXFwuJyArIHNyY1tCVUlMRElERU5USUZJRVJdICsgJykqKSknO1xuXG5cbi8vICMjIEZ1bGwgVmVyc2lvbiBTdHJpbmdcbi8vIEEgbWFpbiB2ZXJzaW9uLCBmb2xsb3dlZCBvcHRpb25hbGx5IGJ5IGEgcHJlLXJlbGVhc2UgdmVyc2lvbiBhbmRcbi8vIGJ1aWxkIG1ldGFkYXRhLlxuXG4vLyBOb3RlIHRoYXQgdGhlIG9ubHkgbWFqb3IsIG1pbm9yLCBwYXRjaCwgYW5kIHByZS1yZWxlYXNlIHNlY3Rpb25zIG9mXG4vLyB0aGUgdmVyc2lvbiBzdHJpbmcgYXJlIGNhcHR1cmluZyBncm91cHMuICBUaGUgYnVpbGQgbWV0YWRhdGEgaXMgbm90IGFcbi8vIGNhcHR1cmluZyBncm91cCwgYmVjYXVzZSBpdCBzaG91bGQgbm90IGV2ZXIgYmUgdXNlZCBpbiB2ZXJzaW9uXG4vLyBjb21wYXJpc29uLlxuXG52YXIgRlVMTCA9IFIrKztcbnZhciBGVUxMUExBSU4gPSAndj8nICsgc3JjW01BSU5WRVJTSU9OXSArXG4gICAgICAgICAgICAgICAgc3JjW1BSRVJFTEVBU0VdICsgJz8nICtcbiAgICAgICAgICAgICAgICBzcmNbQlVJTERdICsgJz8nO1xuXG5zcmNbRlVMTF0gPSAnXicgKyBGVUxMUExBSU4gKyAnJCc7XG5cbi8vIGxpa2UgZnVsbCwgYnV0IGFsbG93cyB2MS4yLjMgYW5kID0xLjIuMywgd2hpY2ggcGVvcGxlIGRvIHNvbWV0aW1lcy5cbi8vIGFsc28sIDEuMC4wYWxwaGExIChwcmVyZWxlYXNlIHdpdGhvdXQgdGhlIGh5cGhlbikgd2hpY2ggaXMgcHJldHR5XG4vLyBjb21tb24gaW4gdGhlIG5wbSByZWdpc3RyeS5cbnZhciBMT09TRVBMQUlOID0gJ1t2PVxcXFxzXSonICsgc3JjW01BSU5WRVJTSU9OTE9PU0VdICtcbiAgICAgICAgICAgICAgICAgc3JjW1BSRVJFTEVBU0VMT09TRV0gKyAnPycgK1xuICAgICAgICAgICAgICAgICBzcmNbQlVJTERdICsgJz8nO1xuXG52YXIgTE9PU0UgPSBSKys7XG5zcmNbTE9PU0VdID0gJ14nICsgTE9PU0VQTEFJTiArICckJztcblxudmFyIEdUTFQgPSBSKys7XG5zcmNbR1RMVF0gPSAnKCg/Ojx8Pik/PT8pJztcblxuLy8gU29tZXRoaW5nIGxpa2UgXCIyLipcIiBvciBcIjEuMi54XCIuXG4vLyBOb3RlIHRoYXQgXCJ4LnhcIiBpcyBhIHZhbGlkIHhSYW5nZSBpZGVudGlmZXIsIG1lYW5pbmcgXCJhbnkgdmVyc2lvblwiXG4vLyBPbmx5IHRoZSBmaXJzdCBpdGVtIGlzIHN0cmljdGx5IHJlcXVpcmVkLlxudmFyIFhSQU5HRUlERU5USUZJRVJMT09TRSA9IFIrKztcbnNyY1tYUkFOR0VJREVOVElGSUVSTE9PU0VdID0gc3JjW05VTUVSSUNJREVOVElGSUVSTE9PU0VdICsgJ3x4fFh8XFxcXConO1xudmFyIFhSQU5HRUlERU5USUZJRVIgPSBSKys7XG5zcmNbWFJBTkdFSURFTlRJRklFUl0gPSBzcmNbTlVNRVJJQ0lERU5USUZJRVJdICsgJ3x4fFh8XFxcXConO1xuXG52YXIgWFJBTkdFUExBSU4gPSBSKys7XG5zcmNbWFJBTkdFUExBSU5dID0gJ1t2PVxcXFxzXSooJyArIHNyY1tYUkFOR0VJREVOVElGSUVSXSArICcpJyArXG4gICAgICAgICAgICAgICAgICAgJyg/OlxcXFwuKCcgKyBzcmNbWFJBTkdFSURFTlRJRklFUl0gKyAnKScgK1xuICAgICAgICAgICAgICAgICAgICcoPzpcXFxcLignICsgc3JjW1hSQU5HRUlERU5USUZJRVJdICsgJyknICtcbiAgICAgICAgICAgICAgICAgICAnKD86JyArIHNyY1tQUkVSRUxFQVNFXSArICcpPycgK1xuICAgICAgICAgICAgICAgICAgIHNyY1tCVUlMRF0gKyAnPycgK1xuICAgICAgICAgICAgICAgICAgICcpPyk/JztcblxudmFyIFhSQU5HRVBMQUlOTE9PU0UgPSBSKys7XG5zcmNbWFJBTkdFUExBSU5MT09TRV0gPSAnW3Y9XFxcXHNdKignICsgc3JjW1hSQU5HRUlERU5USUZJRVJMT09TRV0gKyAnKScgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJyg/OlxcXFwuKCcgKyBzcmNbWFJBTkdFSURFTlRJRklFUkxPT1NFXSArICcpJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnKD86XFxcXC4oJyArIHNyY1tYUkFOR0VJREVOVElGSUVSTE9PU0VdICsgJyknICtcbiAgICAgICAgICAgICAgICAgICAgICAgICcoPzonICsgc3JjW1BSRVJFTEVBU0VMT09TRV0gKyAnKT8nICtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNyY1tCVUlMRF0gKyAnPycgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJyk/KT8nO1xuXG52YXIgWFJBTkdFID0gUisrO1xuc3JjW1hSQU5HRV0gPSAnXicgKyBzcmNbR1RMVF0gKyAnXFxcXHMqJyArIHNyY1tYUkFOR0VQTEFJTl0gKyAnJCc7XG52YXIgWFJBTkdFTE9PU0UgPSBSKys7XG5zcmNbWFJBTkdFTE9PU0VdID0gJ14nICsgc3JjW0dUTFRdICsgJ1xcXFxzKicgKyBzcmNbWFJBTkdFUExBSU5MT09TRV0gKyAnJCc7XG5cbi8vIENvZXJjaW9uLlxuLy8gRXh0cmFjdCBhbnl0aGluZyB0aGF0IGNvdWxkIGNvbmNlaXZhYmx5IGJlIGEgcGFydCBvZiBhIHZhbGlkIHNlbXZlclxudmFyIENPRVJDRSA9IFIrKztcbnNyY1tDT0VSQ0VdID0gJyg/Ol58W15cXFxcZF0pJyArXG4gICAgICAgICAgICAgICcoXFxcXGR7MSwnICsgTUFYX1NBRkVfQ09NUE9ORU5UX0xFTkdUSCArICd9KScgK1xuICAgICAgICAgICAgICAnKD86XFxcXC4oXFxcXGR7MSwnICsgTUFYX1NBRkVfQ09NUE9ORU5UX0xFTkdUSCArICd9KSk/JyArXG4gICAgICAgICAgICAgICcoPzpcXFxcLihcXFxcZHsxLCcgKyBNQVhfU0FGRV9DT01QT05FTlRfTEVOR1RIICsgJ30pKT8nICtcbiAgICAgICAgICAgICAgJyg/OiR8W15cXFxcZF0pJztcblxuLy8gVGlsZGUgcmFuZ2VzLlxuLy8gTWVhbmluZyBpcyBcInJlYXNvbmFibHkgYXQgb3IgZ3JlYXRlciB0aGFuXCJcbnZhciBMT05FVElMREUgPSBSKys7XG5zcmNbTE9ORVRJTERFXSA9ICcoPzp+Pj8pJztcblxudmFyIFRJTERFVFJJTSA9IFIrKztcbnNyY1tUSUxERVRSSU1dID0gJyhcXFxccyopJyArIHNyY1tMT05FVElMREVdICsgJ1xcXFxzKyc7XG5yZVtUSUxERVRSSU1dID0gbmV3IFJlZ0V4cChzcmNbVElMREVUUklNXSwgJ2cnKTtcbnZhciB0aWxkZVRyaW1SZXBsYWNlID0gJyQxfic7XG5cbnZhciBUSUxERSA9IFIrKztcbnNyY1tUSUxERV0gPSAnXicgKyBzcmNbTE9ORVRJTERFXSArIHNyY1tYUkFOR0VQTEFJTl0gKyAnJCc7XG52YXIgVElMREVMT09TRSA9IFIrKztcbnNyY1tUSUxERUxPT1NFXSA9ICdeJyArIHNyY1tMT05FVElMREVdICsgc3JjW1hSQU5HRVBMQUlOTE9PU0VdICsgJyQnO1xuXG4vLyBDYXJldCByYW5nZXMuXG4vLyBNZWFuaW5nIGlzIFwiYXQgbGVhc3QgYW5kIGJhY2t3YXJkcyBjb21wYXRpYmxlIHdpdGhcIlxudmFyIExPTkVDQVJFVCA9IFIrKztcbnNyY1tMT05FQ0FSRVRdID0gJyg/OlxcXFxeKSc7XG5cbnZhciBDQVJFVFRSSU0gPSBSKys7XG5zcmNbQ0FSRVRUUklNXSA9ICcoXFxcXHMqKScgKyBzcmNbTE9ORUNBUkVUXSArICdcXFxccysnO1xucmVbQ0FSRVRUUklNXSA9IG5ldyBSZWdFeHAoc3JjW0NBUkVUVFJJTV0sICdnJyk7XG52YXIgY2FyZXRUcmltUmVwbGFjZSA9ICckMV4nO1xuXG52YXIgQ0FSRVQgPSBSKys7XG5zcmNbQ0FSRVRdID0gJ14nICsgc3JjW0xPTkVDQVJFVF0gKyBzcmNbWFJBTkdFUExBSU5dICsgJyQnO1xudmFyIENBUkVUTE9PU0UgPSBSKys7XG5zcmNbQ0FSRVRMT09TRV0gPSAnXicgKyBzcmNbTE9ORUNBUkVUXSArIHNyY1tYUkFOR0VQTEFJTkxPT1NFXSArICckJztcblxuLy8gQSBzaW1wbGUgZ3QvbHQvZXEgdGhpbmcsIG9yIGp1c3QgXCJcIiB0byBpbmRpY2F0ZSBcImFueSB2ZXJzaW9uXCJcbnZhciBDT01QQVJBVE9STE9PU0UgPSBSKys7XG5zcmNbQ09NUEFSQVRPUkxPT1NFXSA9ICdeJyArIHNyY1tHVExUXSArICdcXFxccyooJyArIExPT1NFUExBSU4gKyAnKSR8XiQnO1xudmFyIENPTVBBUkFUT1IgPSBSKys7XG5zcmNbQ09NUEFSQVRPUl0gPSAnXicgKyBzcmNbR1RMVF0gKyAnXFxcXHMqKCcgKyBGVUxMUExBSU4gKyAnKSR8XiQnO1xuXG5cbi8vIEFuIGV4cHJlc3Npb24gdG8gc3RyaXAgYW55IHdoaXRlc3BhY2UgYmV0d2VlbiB0aGUgZ3RsdCBhbmQgdGhlIHRoaW5nXG4vLyBpdCBtb2RpZmllcywgc28gdGhhdCBgPiAxLjIuM2AgPT0+IGA+MS4yLjNgXG52YXIgQ09NUEFSQVRPUlRSSU0gPSBSKys7XG5zcmNbQ09NUEFSQVRPUlRSSU1dID0gJyhcXFxccyopJyArIHNyY1tHVExUXSArXG4gICAgICAgICAgICAgICAgICAgICAgJ1xcXFxzKignICsgTE9PU0VQTEFJTiArICd8JyArIHNyY1tYUkFOR0VQTEFJTl0gKyAnKSc7XG5cbi8vIHRoaXMgb25lIGhhcyB0byB1c2UgdGhlIC9nIGZsYWdcbnJlW0NPTVBBUkFUT1JUUklNXSA9IG5ldyBSZWdFeHAoc3JjW0NPTVBBUkFUT1JUUklNXSwgJ2cnKTtcbnZhciBjb21wYXJhdG9yVHJpbVJlcGxhY2UgPSAnJDEkMiQzJztcblxuXG4vLyBTb21ldGhpbmcgbGlrZSBgMS4yLjMgLSAxLjIuNGBcbi8vIE5vdGUgdGhhdCB0aGVzZSBhbGwgdXNlIHRoZSBsb29zZSBmb3JtLCBiZWNhdXNlIHRoZXknbGwgYmVcbi8vIGNoZWNrZWQgYWdhaW5zdCBlaXRoZXIgdGhlIHN0cmljdCBvciBsb29zZSBjb21wYXJhdG9yIGZvcm1cbi8vIGxhdGVyLlxudmFyIEhZUEhFTlJBTkdFID0gUisrO1xuc3JjW0hZUEhFTlJBTkdFXSA9ICdeXFxcXHMqKCcgKyBzcmNbWFJBTkdFUExBSU5dICsgJyknICtcbiAgICAgICAgICAgICAgICAgICAnXFxcXHMrLVxcXFxzKycgK1xuICAgICAgICAgICAgICAgICAgICcoJyArIHNyY1tYUkFOR0VQTEFJTl0gKyAnKScgK1xuICAgICAgICAgICAgICAgICAgICdcXFxccyokJztcblxudmFyIEhZUEhFTlJBTkdFTE9PU0UgPSBSKys7XG5zcmNbSFlQSEVOUkFOR0VMT09TRV0gPSAnXlxcXFxzKignICsgc3JjW1hSQU5HRVBMQUlOTE9PU0VdICsgJyknICtcbiAgICAgICAgICAgICAgICAgICAgICAgICdcXFxccystXFxcXHMrJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnKCcgKyBzcmNbWFJBTkdFUExBSU5MT09TRV0gKyAnKScgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJ1xcXFxzKiQnO1xuXG4vLyBTdGFyIHJhbmdlcyBiYXNpY2FsbHkganVzdCBhbGxvdyBhbnl0aGluZyBhdCBhbGwuXG52YXIgU1RBUiA9IFIrKztcbnNyY1tTVEFSXSA9ICcoPHw+KT89P1xcXFxzKlxcXFwqJztcblxuLy8gQ29tcGlsZSB0byBhY3R1YWwgcmVnZXhwIG9iamVjdHMuXG4vLyBBbGwgYXJlIGZsYWctZnJlZSwgdW5sZXNzIHRoZXkgd2VyZSBjcmVhdGVkIGFib3ZlIHdpdGggYSBmbGFnLlxuZm9yICh2YXIgaSA9IDA7IGkgPCBSOyBpKyspIHtcbiAgZGVidWcoaSwgc3JjW2ldKTtcbiAgaWYgKCFyZVtpXSlcbiAgICByZVtpXSA9IG5ldyBSZWdFeHAoc3JjW2ldKTtcbn1cblxuZXhwb3J0cy5wYXJzZSA9IHBhcnNlO1xuZnVuY3Rpb24gcGFyc2UodmVyc2lvbiwgb3B0aW9ucykge1xuICBpZiAoIW9wdGlvbnMgfHwgdHlwZW9mIG9wdGlvbnMgIT09ICdvYmplY3QnKVxuICAgIG9wdGlvbnMgPSB7IGxvb3NlOiAhIW9wdGlvbnMsIGluY2x1ZGVQcmVyZWxlYXNlOiBmYWxzZSB9XG5cbiAgaWYgKHZlcnNpb24gaW5zdGFuY2VvZiBTZW1WZXIpXG4gICAgcmV0dXJuIHZlcnNpb247XG5cbiAgaWYgKHR5cGVvZiB2ZXJzaW9uICE9PSAnc3RyaW5nJylcbiAgICByZXR1cm4gbnVsbDtcblxuICBpZiAodmVyc2lvbi5sZW5ndGggPiBNQVhfTEVOR1RIKVxuICAgIHJldHVybiBudWxsO1xuXG4gIHZhciByID0gb3B0aW9ucy5sb29zZSA/IHJlW0xPT1NFXSA6IHJlW0ZVTExdO1xuICBpZiAoIXIudGVzdCh2ZXJzaW9uKSlcbiAgICByZXR1cm4gbnVsbDtcblxuICB0cnkge1xuICAgIHJldHVybiBuZXcgU2VtVmVyKHZlcnNpb24sIG9wdGlvbnMpO1xuICB9IGNhdGNoIChlcikge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbmV4cG9ydHMudmFsaWQgPSB2YWxpZDtcbmZ1bmN0aW9uIHZhbGlkKHZlcnNpb24sIG9wdGlvbnMpIHtcbiAgdmFyIHYgPSBwYXJzZSh2ZXJzaW9uLCBvcHRpb25zKTtcbiAgcmV0dXJuIHYgPyB2LnZlcnNpb24gOiBudWxsO1xufVxuXG5cbmV4cG9ydHMuY2xlYW4gPSBjbGVhbjtcbmZ1bmN0aW9uIGNsZWFuKHZlcnNpb24sIG9wdGlvbnMpIHtcbiAgdmFyIHMgPSBwYXJzZSh2ZXJzaW9uLnRyaW0oKS5yZXBsYWNlKC9eWz12XSsvLCAnJyksIG9wdGlvbnMpO1xuICByZXR1cm4gcyA/IHMudmVyc2lvbiA6IG51bGw7XG59XG5cbmV4cG9ydHMuU2VtVmVyID0gU2VtVmVyO1xuXG5mdW5jdGlvbiBTZW1WZXIodmVyc2lvbiwgb3B0aW9ucykge1xuICBpZiAoIW9wdGlvbnMgfHwgdHlwZW9mIG9wdGlvbnMgIT09ICdvYmplY3QnKVxuICAgIG9wdGlvbnMgPSB7IGxvb3NlOiAhIW9wdGlvbnMsIGluY2x1ZGVQcmVyZWxlYXNlOiBmYWxzZSB9XG4gIGlmICh2ZXJzaW9uIGluc3RhbmNlb2YgU2VtVmVyKSB7XG4gICAgaWYgKHZlcnNpb24ubG9vc2UgPT09IG9wdGlvbnMubG9vc2UpXG4gICAgICByZXR1cm4gdmVyc2lvbjtcbiAgICBlbHNlXG4gICAgICB2ZXJzaW9uID0gdmVyc2lvbi52ZXJzaW9uO1xuICB9IGVsc2UgaWYgKHR5cGVvZiB2ZXJzaW9uICE9PSAnc3RyaW5nJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgVmVyc2lvbjogJyArIHZlcnNpb24pO1xuICB9XG5cbiAgaWYgKHZlcnNpb24ubGVuZ3RoID4gTUFYX0xFTkdUSClcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCd2ZXJzaW9uIGlzIGxvbmdlciB0aGFuICcgKyBNQVhfTEVOR1RIICsgJyBjaGFyYWN0ZXJzJylcblxuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgU2VtVmVyKSlcbiAgICByZXR1cm4gbmV3IFNlbVZlcih2ZXJzaW9uLCBvcHRpb25zKTtcblxuICBkZWJ1ZygnU2VtVmVyJywgdmVyc2lvbiwgb3B0aW9ucyk7XG4gIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gIHRoaXMubG9vc2UgPSAhIW9wdGlvbnMubG9vc2U7XG5cbiAgdmFyIG0gPSB2ZXJzaW9uLnRyaW0oKS5tYXRjaChvcHRpb25zLmxvb3NlID8gcmVbTE9PU0VdIDogcmVbRlVMTF0pO1xuXG4gIGlmICghbSlcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIFZlcnNpb246ICcgKyB2ZXJzaW9uKTtcblxuICB0aGlzLnJhdyA9IHZlcnNpb247XG5cbiAgLy8gdGhlc2UgYXJlIGFjdHVhbGx5IG51bWJlcnNcbiAgdGhpcy5tYWpvciA9ICttWzFdO1xuICB0aGlzLm1pbm9yID0gK21bMl07XG4gIHRoaXMucGF0Y2ggPSArbVszXTtcblxuICBpZiAodGhpcy5tYWpvciA+IE1BWF9TQUZFX0lOVEVHRVIgfHwgdGhpcy5tYWpvciA8IDApXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBtYWpvciB2ZXJzaW9uJylcblxuICBpZiAodGhpcy5taW5vciA+IE1BWF9TQUZFX0lOVEVHRVIgfHwgdGhpcy5taW5vciA8IDApXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBtaW5vciB2ZXJzaW9uJylcblxuICBpZiAodGhpcy5wYXRjaCA+IE1BWF9TQUZFX0lOVEVHRVIgfHwgdGhpcy5wYXRjaCA8IDApXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBwYXRjaCB2ZXJzaW9uJylcblxuICAvLyBudW1iZXJpZnkgYW55IHByZXJlbGVhc2UgbnVtZXJpYyBpZHNcbiAgaWYgKCFtWzRdKVxuICAgIHRoaXMucHJlcmVsZWFzZSA9IFtdO1xuICBlbHNlXG4gICAgdGhpcy5wcmVyZWxlYXNlID0gbVs0XS5zcGxpdCgnLicpLm1hcChmdW5jdGlvbihpZCkge1xuICAgICAgaWYgKC9eWzAtOV0rJC8udGVzdChpZCkpIHtcbiAgICAgICAgdmFyIG51bSA9ICtpZDtcbiAgICAgICAgaWYgKG51bSA+PSAwICYmIG51bSA8IE1BWF9TQUZFX0lOVEVHRVIpXG4gICAgICAgICAgcmV0dXJuIG51bTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBpZDtcbiAgICB9KTtcblxuICB0aGlzLmJ1aWxkID0gbVs1XSA/IG1bNV0uc3BsaXQoJy4nKSA6IFtdO1xuICB0aGlzLmZvcm1hdCgpO1xufVxuXG5TZW1WZXIucHJvdG90eXBlLmZvcm1hdCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnZlcnNpb24gPSB0aGlzLm1ham9yICsgJy4nICsgdGhpcy5taW5vciArICcuJyArIHRoaXMucGF0Y2g7XG4gIGlmICh0aGlzLnByZXJlbGVhc2UubGVuZ3RoKVxuICAgIHRoaXMudmVyc2lvbiArPSAnLScgKyB0aGlzLnByZXJlbGVhc2Uuam9pbignLicpO1xuICByZXR1cm4gdGhpcy52ZXJzaW9uO1xufTtcblxuU2VtVmVyLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy52ZXJzaW9uO1xufTtcblxuU2VtVmVyLnByb3RvdHlwZS5jb21wYXJlID0gZnVuY3Rpb24ob3RoZXIpIHtcbiAgZGVidWcoJ1NlbVZlci5jb21wYXJlJywgdGhpcy52ZXJzaW9uLCB0aGlzLm9wdGlvbnMsIG90aGVyKTtcbiAgaWYgKCEob3RoZXIgaW5zdGFuY2VvZiBTZW1WZXIpKVxuICAgIG90aGVyID0gbmV3IFNlbVZlcihvdGhlciwgdGhpcy5vcHRpb25zKTtcblxuICByZXR1cm4gdGhpcy5jb21wYXJlTWFpbihvdGhlcikgfHwgdGhpcy5jb21wYXJlUHJlKG90aGVyKTtcbn07XG5cblNlbVZlci5wcm90b3R5cGUuY29tcGFyZU1haW4gPSBmdW5jdGlvbihvdGhlcikge1xuICBpZiAoIShvdGhlciBpbnN0YW5jZW9mIFNlbVZlcikpXG4gICAgb3RoZXIgPSBuZXcgU2VtVmVyKG90aGVyLCB0aGlzLm9wdGlvbnMpO1xuXG4gIHJldHVybiBjb21wYXJlSWRlbnRpZmllcnModGhpcy5tYWpvciwgb3RoZXIubWFqb3IpIHx8XG4gICAgICAgICBjb21wYXJlSWRlbnRpZmllcnModGhpcy5taW5vciwgb3RoZXIubWlub3IpIHx8XG4gICAgICAgICBjb21wYXJlSWRlbnRpZmllcnModGhpcy5wYXRjaCwgb3RoZXIucGF0Y2gpO1xufTtcblxuU2VtVmVyLnByb3RvdHlwZS5jb21wYXJlUHJlID0gZnVuY3Rpb24ob3RoZXIpIHtcbiAgaWYgKCEob3RoZXIgaW5zdGFuY2VvZiBTZW1WZXIpKVxuICAgIG90aGVyID0gbmV3IFNlbVZlcihvdGhlciwgdGhpcy5vcHRpb25zKTtcblxuICAvLyBOT1QgaGF2aW5nIGEgcHJlcmVsZWFzZSBpcyA+IGhhdmluZyBvbmVcbiAgaWYgKHRoaXMucHJlcmVsZWFzZS5sZW5ndGggJiYgIW90aGVyLnByZXJlbGVhc2UubGVuZ3RoKVxuICAgIHJldHVybiAtMTtcbiAgZWxzZSBpZiAoIXRoaXMucHJlcmVsZWFzZS5sZW5ndGggJiYgb3RoZXIucHJlcmVsZWFzZS5sZW5ndGgpXG4gICAgcmV0dXJuIDE7XG4gIGVsc2UgaWYgKCF0aGlzLnByZXJlbGVhc2UubGVuZ3RoICYmICFvdGhlci5wcmVyZWxlYXNlLmxlbmd0aClcbiAgICByZXR1cm4gMDtcblxuICB2YXIgaSA9IDA7XG4gIGRvIHtcbiAgICB2YXIgYSA9IHRoaXMucHJlcmVsZWFzZVtpXTtcbiAgICB2YXIgYiA9IG90aGVyLnByZXJlbGVhc2VbaV07XG4gICAgZGVidWcoJ3ByZXJlbGVhc2UgY29tcGFyZScsIGksIGEsIGIpO1xuICAgIGlmIChhID09PSB1bmRlZmluZWQgJiYgYiA9PT0gdW5kZWZpbmVkKVxuICAgICAgcmV0dXJuIDA7XG4gICAgZWxzZSBpZiAoYiA9PT0gdW5kZWZpbmVkKVxuICAgICAgcmV0dXJuIDE7XG4gICAgZWxzZSBpZiAoYSA9PT0gdW5kZWZpbmVkKVxuICAgICAgcmV0dXJuIC0xO1xuICAgIGVsc2UgaWYgKGEgPT09IGIpXG4gICAgICBjb250aW51ZTtcbiAgICBlbHNlXG4gICAgICByZXR1cm4gY29tcGFyZUlkZW50aWZpZXJzKGEsIGIpO1xuICB9IHdoaWxlICgrK2kpO1xufTtcblxuLy8gcHJlbWlub3Igd2lsbCBidW1wIHRoZSB2ZXJzaW9uIHVwIHRvIHRoZSBuZXh0IG1pbm9yIHJlbGVhc2UsIGFuZCBpbW1lZGlhdGVseVxuLy8gZG93biB0byBwcmUtcmVsZWFzZS4gcHJlbWFqb3IgYW5kIHByZXBhdGNoIHdvcmsgdGhlIHNhbWUgd2F5LlxuU2VtVmVyLnByb3RvdHlwZS5pbmMgPSBmdW5jdGlvbihyZWxlYXNlLCBpZGVudGlmaWVyKSB7XG4gIHN3aXRjaCAocmVsZWFzZSkge1xuICAgIGNhc2UgJ3ByZW1ham9yJzpcbiAgICAgIHRoaXMucHJlcmVsZWFzZS5sZW5ndGggPSAwO1xuICAgICAgdGhpcy5wYXRjaCA9IDA7XG4gICAgICB0aGlzLm1pbm9yID0gMDtcbiAgICAgIHRoaXMubWFqb3IrKztcbiAgICAgIHRoaXMuaW5jKCdwcmUnLCBpZGVudGlmaWVyKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3ByZW1pbm9yJzpcbiAgICAgIHRoaXMucHJlcmVsZWFzZS5sZW5ndGggPSAwO1xuICAgICAgdGhpcy5wYXRjaCA9IDA7XG4gICAgICB0aGlzLm1pbm9yKys7XG4gICAgICB0aGlzLmluYygncHJlJywgaWRlbnRpZmllcik7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdwcmVwYXRjaCc6XG4gICAgICAvLyBJZiB0aGlzIGlzIGFscmVhZHkgYSBwcmVyZWxlYXNlLCBpdCB3aWxsIGJ1bXAgdG8gdGhlIG5leHQgdmVyc2lvblxuICAgICAgLy8gZHJvcCBhbnkgcHJlcmVsZWFzZXMgdGhhdCBtaWdodCBhbHJlYWR5IGV4aXN0LCBzaW5jZSB0aGV5IGFyZSBub3RcbiAgICAgIC8vIHJlbGV2YW50IGF0IHRoaXMgcG9pbnQuXG4gICAgICB0aGlzLnByZXJlbGVhc2UubGVuZ3RoID0gMDtcbiAgICAgIHRoaXMuaW5jKCdwYXRjaCcsIGlkZW50aWZpZXIpO1xuICAgICAgdGhpcy5pbmMoJ3ByZScsIGlkZW50aWZpZXIpO1xuICAgICAgYnJlYWs7XG4gICAgLy8gSWYgdGhlIGlucHV0IGlzIGEgbm9uLXByZXJlbGVhc2UgdmVyc2lvbiwgdGhpcyBhY3RzIHRoZSBzYW1lIGFzXG4gICAgLy8gcHJlcGF0Y2guXG4gICAgY2FzZSAncHJlcmVsZWFzZSc6XG4gICAgICBpZiAodGhpcy5wcmVyZWxlYXNlLmxlbmd0aCA9PT0gMClcbiAgICAgICAgdGhpcy5pbmMoJ3BhdGNoJywgaWRlbnRpZmllcik7XG4gICAgICB0aGlzLmluYygncHJlJywgaWRlbnRpZmllcik7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ21ham9yJzpcbiAgICAgIC8vIElmIHRoaXMgaXMgYSBwcmUtbWFqb3IgdmVyc2lvbiwgYnVtcCB1cCB0byB0aGUgc2FtZSBtYWpvciB2ZXJzaW9uLlxuICAgICAgLy8gT3RoZXJ3aXNlIGluY3JlbWVudCBtYWpvci5cbiAgICAgIC8vIDEuMC4wLTUgYnVtcHMgdG8gMS4wLjBcbiAgICAgIC8vIDEuMS4wIGJ1bXBzIHRvIDIuMC4wXG4gICAgICBpZiAodGhpcy5taW5vciAhPT0gMCB8fCB0aGlzLnBhdGNoICE9PSAwIHx8IHRoaXMucHJlcmVsZWFzZS5sZW5ndGggPT09IDApXG4gICAgICAgIHRoaXMubWFqb3IrKztcbiAgICAgIHRoaXMubWlub3IgPSAwO1xuICAgICAgdGhpcy5wYXRjaCA9IDA7XG4gICAgICB0aGlzLnByZXJlbGVhc2UgPSBbXTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ21pbm9yJzpcbiAgICAgIC8vIElmIHRoaXMgaXMgYSBwcmUtbWlub3IgdmVyc2lvbiwgYnVtcCB1cCB0byB0aGUgc2FtZSBtaW5vciB2ZXJzaW9uLlxuICAgICAgLy8gT3RoZXJ3aXNlIGluY3JlbWVudCBtaW5vci5cbiAgICAgIC8vIDEuMi4wLTUgYnVtcHMgdG8gMS4yLjBcbiAgICAgIC8vIDEuMi4xIGJ1bXBzIHRvIDEuMy4wXG4gICAgICBpZiAodGhpcy5wYXRjaCAhPT0gMCB8fCB0aGlzLnByZXJlbGVhc2UubGVuZ3RoID09PSAwKVxuICAgICAgICB0aGlzLm1pbm9yKys7XG4gICAgICB0aGlzLnBhdGNoID0gMDtcbiAgICAgIHRoaXMucHJlcmVsZWFzZSA9IFtdO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncGF0Y2gnOlxuICAgICAgLy8gSWYgdGhpcyBpcyBub3QgYSBwcmUtcmVsZWFzZSB2ZXJzaW9uLCBpdCB3aWxsIGluY3JlbWVudCB0aGUgcGF0Y2guXG4gICAgICAvLyBJZiBpdCBpcyBhIHByZS1yZWxlYXNlIGl0IHdpbGwgYnVtcCB1cCB0byB0aGUgc2FtZSBwYXRjaCB2ZXJzaW9uLlxuICAgICAgLy8gMS4yLjAtNSBwYXRjaGVzIHRvIDEuMi4wXG4gICAgICAvLyAxLjIuMCBwYXRjaGVzIHRvIDEuMi4xXG4gICAgICBpZiAodGhpcy5wcmVyZWxlYXNlLmxlbmd0aCA9PT0gMClcbiAgICAgICAgdGhpcy5wYXRjaCsrO1xuICAgICAgdGhpcy5wcmVyZWxlYXNlID0gW107XG4gICAgICBicmVhaztcbiAgICAvLyBUaGlzIHByb2JhYmx5IHNob3VsZG4ndCBiZSB1c2VkIHB1YmxpY2x5LlxuICAgIC8vIDEuMC4wIFwicHJlXCIgd291bGQgYmVjb21lIDEuMC4wLTAgd2hpY2ggaXMgdGhlIHdyb25nIGRpcmVjdGlvbi5cbiAgICBjYXNlICdwcmUnOlxuICAgICAgaWYgKHRoaXMucHJlcmVsZWFzZS5sZW5ndGggPT09IDApXG4gICAgICAgIHRoaXMucHJlcmVsZWFzZSA9IFswXTtcbiAgICAgIGVsc2Uge1xuICAgICAgICB2YXIgaSA9IHRoaXMucHJlcmVsZWFzZS5sZW5ndGg7XG4gICAgICAgIHdoaWxlICgtLWkgPj0gMCkge1xuICAgICAgICAgIGlmICh0eXBlb2YgdGhpcy5wcmVyZWxlYXNlW2ldID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgdGhpcy5wcmVyZWxlYXNlW2ldKys7XG4gICAgICAgICAgICBpID0gLTI7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChpID09PSAtMSkgLy8gZGlkbid0IGluY3JlbWVudCBhbnl0aGluZ1xuICAgICAgICAgIHRoaXMucHJlcmVsZWFzZS5wdXNoKDApO1xuICAgICAgfVxuICAgICAgaWYgKGlkZW50aWZpZXIpIHtcbiAgICAgICAgLy8gMS4yLjAtYmV0YS4xIGJ1bXBzIHRvIDEuMi4wLWJldGEuMixcbiAgICAgICAgLy8gMS4yLjAtYmV0YS5mb29ibHogb3IgMS4yLjAtYmV0YSBidW1wcyB0byAxLjIuMC1iZXRhLjBcbiAgICAgICAgaWYgKHRoaXMucHJlcmVsZWFzZVswXSA9PT0gaWRlbnRpZmllcikge1xuICAgICAgICAgIGlmIChpc05hTih0aGlzLnByZXJlbGVhc2VbMV0pKVxuICAgICAgICAgICAgdGhpcy5wcmVyZWxlYXNlID0gW2lkZW50aWZpZXIsIDBdO1xuICAgICAgICB9IGVsc2VcbiAgICAgICAgICB0aGlzLnByZXJlbGVhc2UgPSBbaWRlbnRpZmllciwgMF07XG4gICAgICB9XG4gICAgICBicmVhaztcblxuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgaW5jcmVtZW50IGFyZ3VtZW50OiAnICsgcmVsZWFzZSk7XG4gIH1cbiAgdGhpcy5mb3JtYXQoKTtcbiAgdGhpcy5yYXcgPSB0aGlzLnZlcnNpb247XG4gIHJldHVybiB0aGlzO1xufTtcblxuZXhwb3J0cy5pbmMgPSBpbmM7XG5mdW5jdGlvbiBpbmModmVyc2lvbiwgcmVsZWFzZSwgbG9vc2UsIGlkZW50aWZpZXIpIHtcbiAgaWYgKHR5cGVvZihsb29zZSkgPT09ICdzdHJpbmcnKSB7XG4gICAgaWRlbnRpZmllciA9IGxvb3NlO1xuICAgIGxvb3NlID0gdW5kZWZpbmVkO1xuICB9XG5cbiAgdHJ5IHtcbiAgICByZXR1cm4gbmV3IFNlbVZlcih2ZXJzaW9uLCBsb29zZSkuaW5jKHJlbGVhc2UsIGlkZW50aWZpZXIpLnZlcnNpb247XG4gIH0gY2F0Y2ggKGVyKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuZXhwb3J0cy5kaWZmID0gZGlmZjtcbmZ1bmN0aW9uIGRpZmYodmVyc2lvbjEsIHZlcnNpb24yKSB7XG4gIGlmIChlcSh2ZXJzaW9uMSwgdmVyc2lvbjIpKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH0gZWxzZSB7XG4gICAgdmFyIHYxID0gcGFyc2UodmVyc2lvbjEpO1xuICAgIHZhciB2MiA9IHBhcnNlKHZlcnNpb24yKTtcbiAgICBpZiAodjEucHJlcmVsZWFzZS5sZW5ndGggfHwgdjIucHJlcmVsZWFzZS5sZW5ndGgpIHtcbiAgICAgIGZvciAodmFyIGtleSBpbiB2MSkge1xuICAgICAgICBpZiAoa2V5ID09PSAnbWFqb3InIHx8IGtleSA9PT0gJ21pbm9yJyB8fCBrZXkgPT09ICdwYXRjaCcpIHtcbiAgICAgICAgICBpZiAodjFba2V5XSAhPT0gdjJba2V5XSkge1xuICAgICAgICAgICAgcmV0dXJuICdwcmUnK2tleTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiAncHJlcmVsZWFzZSc7XG4gICAgfVxuICAgIGZvciAodmFyIGtleSBpbiB2MSkge1xuICAgICAgaWYgKGtleSA9PT0gJ21ham9yJyB8fCBrZXkgPT09ICdtaW5vcicgfHwga2V5ID09PSAncGF0Y2gnKSB7XG4gICAgICAgIGlmICh2MVtrZXldICE9PSB2MltrZXldKSB7XG4gICAgICAgICAgcmV0dXJuIGtleTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnRzLmNvbXBhcmVJZGVudGlmaWVycyA9IGNvbXBhcmVJZGVudGlmaWVycztcblxudmFyIG51bWVyaWMgPSAvXlswLTldKyQvO1xuZnVuY3Rpb24gY29tcGFyZUlkZW50aWZpZXJzKGEsIGIpIHtcbiAgdmFyIGFudW0gPSBudW1lcmljLnRlc3QoYSk7XG4gIHZhciBibnVtID0gbnVtZXJpYy50ZXN0KGIpO1xuXG4gIGlmIChhbnVtICYmIGJudW0pIHtcbiAgICBhID0gK2E7XG4gICAgYiA9ICtiO1xuICB9XG5cbiAgcmV0dXJuIChhbnVtICYmICFibnVtKSA/IC0xIDpcbiAgICAgICAgIChibnVtICYmICFhbnVtKSA/IDEgOlxuICAgICAgICAgYSA8IGIgPyAtMSA6XG4gICAgICAgICBhID4gYiA/IDEgOlxuICAgICAgICAgMDtcbn1cblxuZXhwb3J0cy5yY29tcGFyZUlkZW50aWZpZXJzID0gcmNvbXBhcmVJZGVudGlmaWVycztcbmZ1bmN0aW9uIHJjb21wYXJlSWRlbnRpZmllcnMoYSwgYikge1xuICByZXR1cm4gY29tcGFyZUlkZW50aWZpZXJzKGIsIGEpO1xufVxuXG5leHBvcnRzLm1ham9yID0gbWFqb3I7XG5mdW5jdGlvbiBtYWpvcihhLCBsb29zZSkge1xuICByZXR1cm4gbmV3IFNlbVZlcihhLCBsb29zZSkubWFqb3I7XG59XG5cbmV4cG9ydHMubWlub3IgPSBtaW5vcjtcbmZ1bmN0aW9uIG1pbm9yKGEsIGxvb3NlKSB7XG4gIHJldHVybiBuZXcgU2VtVmVyKGEsIGxvb3NlKS5taW5vcjtcbn1cblxuZXhwb3J0cy5wYXRjaCA9IHBhdGNoO1xuZnVuY3Rpb24gcGF0Y2goYSwgbG9vc2UpIHtcbiAgcmV0dXJuIG5ldyBTZW1WZXIoYSwgbG9vc2UpLnBhdGNoO1xufVxuXG5leHBvcnRzLmNvbXBhcmUgPSBjb21wYXJlO1xuZnVuY3Rpb24gY29tcGFyZShhLCBiLCBsb29zZSkge1xuICByZXR1cm4gbmV3IFNlbVZlcihhLCBsb29zZSkuY29tcGFyZShuZXcgU2VtVmVyKGIsIGxvb3NlKSk7XG59XG5cbmV4cG9ydHMuY29tcGFyZUxvb3NlID0gY29tcGFyZUxvb3NlO1xuZnVuY3Rpb24gY29tcGFyZUxvb3NlKGEsIGIpIHtcbiAgcmV0dXJuIGNvbXBhcmUoYSwgYiwgdHJ1ZSk7XG59XG5cbmV4cG9ydHMucmNvbXBhcmUgPSByY29tcGFyZTtcbmZ1bmN0aW9uIHJjb21wYXJlKGEsIGIsIGxvb3NlKSB7XG4gIHJldHVybiBjb21wYXJlKGIsIGEsIGxvb3NlKTtcbn1cblxuZXhwb3J0cy5zb3J0ID0gc29ydDtcbmZ1bmN0aW9uIHNvcnQobGlzdCwgbG9vc2UpIHtcbiAgcmV0dXJuIGxpc3Quc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgcmV0dXJuIGV4cG9ydHMuY29tcGFyZShhLCBiLCBsb29zZSk7XG4gIH0pO1xufVxuXG5leHBvcnRzLnJzb3J0ID0gcnNvcnQ7XG5mdW5jdGlvbiByc29ydChsaXN0LCBsb29zZSkge1xuICByZXR1cm4gbGlzdC5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICByZXR1cm4gZXhwb3J0cy5yY29tcGFyZShhLCBiLCBsb29zZSk7XG4gIH0pO1xufVxuXG5leHBvcnRzLmd0ID0gZ3Q7XG5mdW5jdGlvbiBndChhLCBiLCBsb29zZSkge1xuICByZXR1cm4gY29tcGFyZShhLCBiLCBsb29zZSkgPiAwO1xufVxuXG5leHBvcnRzLmx0ID0gbHQ7XG5mdW5jdGlvbiBsdChhLCBiLCBsb29zZSkge1xuICByZXR1cm4gY29tcGFyZShhLCBiLCBsb29zZSkgPCAwO1xufVxuXG5leHBvcnRzLmVxID0gZXE7XG5mdW5jdGlvbiBlcShhLCBiLCBsb29zZSkge1xuICByZXR1cm4gY29tcGFyZShhLCBiLCBsb29zZSkgPT09IDA7XG59XG5cbmV4cG9ydHMubmVxID0gbmVxO1xuZnVuY3Rpb24gbmVxKGEsIGIsIGxvb3NlKSB7XG4gIHJldHVybiBjb21wYXJlKGEsIGIsIGxvb3NlKSAhPT0gMDtcbn1cblxuZXhwb3J0cy5ndGUgPSBndGU7XG5mdW5jdGlvbiBndGUoYSwgYiwgbG9vc2UpIHtcbiAgcmV0dXJuIGNvbXBhcmUoYSwgYiwgbG9vc2UpID49IDA7XG59XG5cbmV4cG9ydHMubHRlID0gbHRlO1xuZnVuY3Rpb24gbHRlKGEsIGIsIGxvb3NlKSB7XG4gIHJldHVybiBjb21wYXJlKGEsIGIsIGxvb3NlKSA8PSAwO1xufVxuXG5leHBvcnRzLmNtcCA9IGNtcDtcbmZ1bmN0aW9uIGNtcChhLCBvcCwgYiwgbG9vc2UpIHtcbiAgdmFyIHJldDtcbiAgc3dpdGNoIChvcCkge1xuICAgIGNhc2UgJz09PSc6XG4gICAgICBpZiAodHlwZW9mIGEgPT09ICdvYmplY3QnKSBhID0gYS52ZXJzaW9uO1xuICAgICAgaWYgKHR5cGVvZiBiID09PSAnb2JqZWN0JykgYiA9IGIudmVyc2lvbjtcbiAgICAgIHJldCA9IGEgPT09IGI7XG4gICAgICBicmVhaztcbiAgICBjYXNlICchPT0nOlxuICAgICAgaWYgKHR5cGVvZiBhID09PSAnb2JqZWN0JykgYSA9IGEudmVyc2lvbjtcbiAgICAgIGlmICh0eXBlb2YgYiA9PT0gJ29iamVjdCcpIGIgPSBiLnZlcnNpb247XG4gICAgICByZXQgPSBhICE9PSBiO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnJzogY2FzZSAnPSc6IGNhc2UgJz09JzogcmV0ID0gZXEoYSwgYiwgbG9vc2UpOyBicmVhaztcbiAgICBjYXNlICchPSc6IHJldCA9IG5lcShhLCBiLCBsb29zZSk7IGJyZWFrO1xuICAgIGNhc2UgJz4nOiByZXQgPSBndChhLCBiLCBsb29zZSk7IGJyZWFrO1xuICAgIGNhc2UgJz49JzogcmV0ID0gZ3RlKGEsIGIsIGxvb3NlKTsgYnJlYWs7XG4gICAgY2FzZSAnPCc6IHJldCA9IGx0KGEsIGIsIGxvb3NlKTsgYnJlYWs7XG4gICAgY2FzZSAnPD0nOiByZXQgPSBsdGUoYSwgYiwgbG9vc2UpOyBicmVhaztcbiAgICBkZWZhdWx0OiB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIG9wZXJhdG9yOiAnICsgb3ApO1xuICB9XG4gIHJldHVybiByZXQ7XG59XG5cbmV4cG9ydHMuQ29tcGFyYXRvciA9IENvbXBhcmF0b3I7XG5mdW5jdGlvbiBDb21wYXJhdG9yKGNvbXAsIG9wdGlvbnMpIHtcbiAgaWYgKCFvcHRpb25zIHx8IHR5cGVvZiBvcHRpb25zICE9PSAnb2JqZWN0JylcbiAgICBvcHRpb25zID0geyBsb29zZTogISFvcHRpb25zLCBpbmNsdWRlUHJlcmVsZWFzZTogZmFsc2UgfVxuXG4gIGlmIChjb21wIGluc3RhbmNlb2YgQ29tcGFyYXRvcikge1xuICAgIGlmIChjb21wLmxvb3NlID09PSAhIW9wdGlvbnMubG9vc2UpXG4gICAgICByZXR1cm4gY29tcDtcbiAgICBlbHNlXG4gICAgICBjb21wID0gY29tcC52YWx1ZTtcbiAgfVxuXG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBDb21wYXJhdG9yKSlcbiAgICByZXR1cm4gbmV3IENvbXBhcmF0b3IoY29tcCwgb3B0aW9ucyk7XG5cbiAgZGVidWcoJ2NvbXBhcmF0b3InLCBjb21wLCBvcHRpb25zKTtcbiAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgdGhpcy5sb29zZSA9ICEhb3B0aW9ucy5sb29zZTtcbiAgdGhpcy5wYXJzZShjb21wKTtcblxuICBpZiAodGhpcy5zZW12ZXIgPT09IEFOWSlcbiAgICB0aGlzLnZhbHVlID0gJyc7XG4gIGVsc2VcbiAgICB0aGlzLnZhbHVlID0gdGhpcy5vcGVyYXRvciArIHRoaXMuc2VtdmVyLnZlcnNpb247XG5cbiAgZGVidWcoJ2NvbXAnLCB0aGlzKTtcbn1cblxudmFyIEFOWSA9IHt9O1xuQ29tcGFyYXRvci5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbihjb21wKSB7XG4gIHZhciByID0gdGhpcy5vcHRpb25zLmxvb3NlID8gcmVbQ09NUEFSQVRPUkxPT1NFXSA6IHJlW0NPTVBBUkFUT1JdO1xuICB2YXIgbSA9IGNvbXAubWF0Y2gocik7XG5cbiAgaWYgKCFtKVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgY29tcGFyYXRvcjogJyArIGNvbXApO1xuXG4gIHRoaXMub3BlcmF0b3IgPSBtWzFdO1xuICBpZiAodGhpcy5vcGVyYXRvciA9PT0gJz0nKVxuICAgIHRoaXMub3BlcmF0b3IgPSAnJztcblxuICAvLyBpZiBpdCBsaXRlcmFsbHkgaXMganVzdCAnPicgb3IgJycgdGhlbiBhbGxvdyBhbnl0aGluZy5cbiAgaWYgKCFtWzJdKVxuICAgIHRoaXMuc2VtdmVyID0gQU5ZO1xuICBlbHNlXG4gICAgdGhpcy5zZW12ZXIgPSBuZXcgU2VtVmVyKG1bMl0sIHRoaXMub3B0aW9ucy5sb29zZSk7XG59O1xuXG5Db21wYXJhdG9yLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy52YWx1ZTtcbn07XG5cbkNvbXBhcmF0b3IucHJvdG90eXBlLnRlc3QgPSBmdW5jdGlvbih2ZXJzaW9uKSB7XG4gIGRlYnVnKCdDb21wYXJhdG9yLnRlc3QnLCB2ZXJzaW9uLCB0aGlzLm9wdGlvbnMubG9vc2UpO1xuXG4gIGlmICh0aGlzLnNlbXZlciA9PT0gQU5ZKVxuICAgIHJldHVybiB0cnVlO1xuXG4gIGlmICh0eXBlb2YgdmVyc2lvbiA9PT0gJ3N0cmluZycpXG4gICAgdmVyc2lvbiA9IG5ldyBTZW1WZXIodmVyc2lvbiwgdGhpcy5vcHRpb25zKTtcblxuICByZXR1cm4gY21wKHZlcnNpb24sIHRoaXMub3BlcmF0b3IsIHRoaXMuc2VtdmVyLCB0aGlzLm9wdGlvbnMpO1xufTtcblxuQ29tcGFyYXRvci5wcm90b3R5cGUuaW50ZXJzZWN0cyA9IGZ1bmN0aW9uKGNvbXAsIG9wdGlvbnMpIHtcbiAgaWYgKCEoY29tcCBpbnN0YW5jZW9mIENvbXBhcmF0b3IpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignYSBDb21wYXJhdG9yIGlzIHJlcXVpcmVkJyk7XG4gIH1cblxuICBpZiAoIW9wdGlvbnMgfHwgdHlwZW9mIG9wdGlvbnMgIT09ICdvYmplY3QnKVxuICAgIG9wdGlvbnMgPSB7IGxvb3NlOiAhIW9wdGlvbnMsIGluY2x1ZGVQcmVyZWxlYXNlOiBmYWxzZSB9XG5cbiAgdmFyIHJhbmdlVG1wO1xuXG4gIGlmICh0aGlzLm9wZXJhdG9yID09PSAnJykge1xuICAgIHJhbmdlVG1wID0gbmV3IFJhbmdlKGNvbXAudmFsdWUsIG9wdGlvbnMpO1xuICAgIHJldHVybiBzYXRpc2ZpZXModGhpcy52YWx1ZSwgcmFuZ2VUbXAsIG9wdGlvbnMpO1xuICB9IGVsc2UgaWYgKGNvbXAub3BlcmF0b3IgPT09ICcnKSB7XG4gICAgcmFuZ2VUbXAgPSBuZXcgUmFuZ2UodGhpcy52YWx1ZSwgb3B0aW9ucyk7XG4gICAgcmV0dXJuIHNhdGlzZmllcyhjb21wLnNlbXZlciwgcmFuZ2VUbXAsIG9wdGlvbnMpO1xuICB9XG5cbiAgdmFyIHNhbWVEaXJlY3Rpb25JbmNyZWFzaW5nID1cbiAgICAodGhpcy5vcGVyYXRvciA9PT0gJz49JyB8fCB0aGlzLm9wZXJhdG9yID09PSAnPicpICYmXG4gICAgKGNvbXAub3BlcmF0b3IgPT09ICc+PScgfHwgY29tcC5vcGVyYXRvciA9PT0gJz4nKTtcbiAgdmFyIHNhbWVEaXJlY3Rpb25EZWNyZWFzaW5nID1cbiAgICAodGhpcy5vcGVyYXRvciA9PT0gJzw9JyB8fCB0aGlzLm9wZXJhdG9yID09PSAnPCcpICYmXG4gICAgKGNvbXAub3BlcmF0b3IgPT09ICc8PScgfHwgY29tcC5vcGVyYXRvciA9PT0gJzwnKTtcbiAgdmFyIHNhbWVTZW1WZXIgPSB0aGlzLnNlbXZlci52ZXJzaW9uID09PSBjb21wLnNlbXZlci52ZXJzaW9uO1xuICB2YXIgZGlmZmVyZW50RGlyZWN0aW9uc0luY2x1c2l2ZSA9XG4gICAgKHRoaXMub3BlcmF0b3IgPT09ICc+PScgfHwgdGhpcy5vcGVyYXRvciA9PT0gJzw9JykgJiZcbiAgICAoY29tcC5vcGVyYXRvciA9PT0gJz49JyB8fCBjb21wLm9wZXJhdG9yID09PSAnPD0nKTtcbiAgdmFyIG9wcG9zaXRlRGlyZWN0aW9uc0xlc3NUaGFuID1cbiAgICBjbXAodGhpcy5zZW12ZXIsICc8JywgY29tcC5zZW12ZXIsIG9wdGlvbnMpICYmXG4gICAgKCh0aGlzLm9wZXJhdG9yID09PSAnPj0nIHx8IHRoaXMub3BlcmF0b3IgPT09ICc+JykgJiZcbiAgICAoY29tcC5vcGVyYXRvciA9PT0gJzw9JyB8fCBjb21wLm9wZXJhdG9yID09PSAnPCcpKTtcbiAgdmFyIG9wcG9zaXRlRGlyZWN0aW9uc0dyZWF0ZXJUaGFuID1cbiAgICBjbXAodGhpcy5zZW12ZXIsICc+JywgY29tcC5zZW12ZXIsIG9wdGlvbnMpICYmXG4gICAgKCh0aGlzLm9wZXJhdG9yID09PSAnPD0nIHx8IHRoaXMub3BlcmF0b3IgPT09ICc8JykgJiZcbiAgICAoY29tcC5vcGVyYXRvciA9PT0gJz49JyB8fCBjb21wLm9wZXJhdG9yID09PSAnPicpKTtcblxuICByZXR1cm4gc2FtZURpcmVjdGlvbkluY3JlYXNpbmcgfHwgc2FtZURpcmVjdGlvbkRlY3JlYXNpbmcgfHxcbiAgICAoc2FtZVNlbVZlciAmJiBkaWZmZXJlbnREaXJlY3Rpb25zSW5jbHVzaXZlKSB8fFxuICAgIG9wcG9zaXRlRGlyZWN0aW9uc0xlc3NUaGFuIHx8IG9wcG9zaXRlRGlyZWN0aW9uc0dyZWF0ZXJUaGFuO1xufTtcblxuXG5leHBvcnRzLlJhbmdlID0gUmFuZ2U7XG5mdW5jdGlvbiBSYW5nZShyYW5nZSwgb3B0aW9ucykge1xuICBpZiAoIW9wdGlvbnMgfHwgdHlwZW9mIG9wdGlvbnMgIT09ICdvYmplY3QnKVxuICAgIG9wdGlvbnMgPSB7IGxvb3NlOiAhIW9wdGlvbnMsIGluY2x1ZGVQcmVyZWxlYXNlOiBmYWxzZSB9XG5cbiAgaWYgKHJhbmdlIGluc3RhbmNlb2YgUmFuZ2UpIHtcbiAgICBpZiAocmFuZ2UubG9vc2UgPT09ICEhb3B0aW9ucy5sb29zZSAmJlxuICAgICAgICByYW5nZS5pbmNsdWRlUHJlcmVsZWFzZSA9PT0gISFvcHRpb25zLmluY2x1ZGVQcmVyZWxlYXNlKSB7XG4gICAgICByZXR1cm4gcmFuZ2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBuZXcgUmFuZ2UocmFuZ2UucmF3LCBvcHRpb25zKTtcbiAgICB9XG4gIH1cblxuICBpZiAocmFuZ2UgaW5zdGFuY2VvZiBDb21wYXJhdG9yKSB7XG4gICAgcmV0dXJuIG5ldyBSYW5nZShyYW5nZS52YWx1ZSwgb3B0aW9ucyk7XG4gIH1cblxuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgUmFuZ2UpKVxuICAgIHJldHVybiBuZXcgUmFuZ2UocmFuZ2UsIG9wdGlvbnMpO1xuXG4gIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gIHRoaXMubG9vc2UgPSAhIW9wdGlvbnMubG9vc2U7XG4gIHRoaXMuaW5jbHVkZVByZXJlbGVhc2UgPSAhIW9wdGlvbnMuaW5jbHVkZVByZXJlbGVhc2VcblxuICAvLyBGaXJzdCwgc3BsaXQgYmFzZWQgb24gYm9vbGVhbiBvciB8fFxuICB0aGlzLnJhdyA9IHJhbmdlO1xuICB0aGlzLnNldCA9IHJhbmdlLnNwbGl0KC9cXHMqXFx8XFx8XFxzKi8pLm1hcChmdW5jdGlvbihyYW5nZSkge1xuICAgIHJldHVybiB0aGlzLnBhcnNlUmFuZ2UocmFuZ2UudHJpbSgpKTtcbiAgfSwgdGhpcykuZmlsdGVyKGZ1bmN0aW9uKGMpIHtcbiAgICAvLyB0aHJvdyBvdXQgYW55IHRoYXQgYXJlIG5vdCByZWxldmFudCBmb3Igd2hhdGV2ZXIgcmVhc29uXG4gICAgcmV0dXJuIGMubGVuZ3RoO1xuICB9KTtcblxuICBpZiAoIXRoaXMuc2V0Lmxlbmd0aCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgU2VtVmVyIFJhbmdlOiAnICsgcmFuZ2UpO1xuICB9XG5cbiAgdGhpcy5mb3JtYXQoKTtcbn1cblxuUmFuZ2UucHJvdG90eXBlLmZvcm1hdCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnJhbmdlID0gdGhpcy5zZXQubWFwKGZ1bmN0aW9uKGNvbXBzKSB7XG4gICAgcmV0dXJuIGNvbXBzLmpvaW4oJyAnKS50cmltKCk7XG4gIH0pLmpvaW4oJ3x8JykudHJpbSgpO1xuICByZXR1cm4gdGhpcy5yYW5nZTtcbn07XG5cblJhbmdlLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5yYW5nZTtcbn07XG5cblJhbmdlLnByb3RvdHlwZS5wYXJzZVJhbmdlID0gZnVuY3Rpb24ocmFuZ2UpIHtcbiAgdmFyIGxvb3NlID0gdGhpcy5vcHRpb25zLmxvb3NlO1xuICByYW5nZSA9IHJhbmdlLnRyaW0oKTtcbiAgLy8gYDEuMi4zIC0gMS4yLjRgID0+IGA+PTEuMi4zIDw9MS4yLjRgXG4gIHZhciBociA9IGxvb3NlID8gcmVbSFlQSEVOUkFOR0VMT09TRV0gOiByZVtIWVBIRU5SQU5HRV07XG4gIHJhbmdlID0gcmFuZ2UucmVwbGFjZShociwgaHlwaGVuUmVwbGFjZSk7XG4gIGRlYnVnKCdoeXBoZW4gcmVwbGFjZScsIHJhbmdlKTtcbiAgLy8gYD4gMS4yLjMgPCAxLjIuNWAgPT4gYD4xLjIuMyA8MS4yLjVgXG4gIHJhbmdlID0gcmFuZ2UucmVwbGFjZShyZVtDT01QQVJBVE9SVFJJTV0sIGNvbXBhcmF0b3JUcmltUmVwbGFjZSk7XG4gIGRlYnVnKCdjb21wYXJhdG9yIHRyaW0nLCByYW5nZSwgcmVbQ09NUEFSQVRPUlRSSU1dKTtcblxuICAvLyBgfiAxLjIuM2AgPT4gYH4xLjIuM2BcbiAgcmFuZ2UgPSByYW5nZS5yZXBsYWNlKHJlW1RJTERFVFJJTV0sIHRpbGRlVHJpbVJlcGxhY2UpO1xuXG4gIC8vIGBeIDEuMi4zYCA9PiBgXjEuMi4zYFxuICByYW5nZSA9IHJhbmdlLnJlcGxhY2UocmVbQ0FSRVRUUklNXSwgY2FyZXRUcmltUmVwbGFjZSk7XG5cbiAgLy8gbm9ybWFsaXplIHNwYWNlc1xuICByYW5nZSA9IHJhbmdlLnNwbGl0KC9cXHMrLykuam9pbignICcpO1xuXG4gIC8vIEF0IHRoaXMgcG9pbnQsIHRoZSByYW5nZSBpcyBjb21wbGV0ZWx5IHRyaW1tZWQgYW5kXG4gIC8vIHJlYWR5IHRvIGJlIHNwbGl0IGludG8gY29tcGFyYXRvcnMuXG5cbiAgdmFyIGNvbXBSZSA9IGxvb3NlID8gcmVbQ09NUEFSQVRPUkxPT1NFXSA6IHJlW0NPTVBBUkFUT1JdO1xuICB2YXIgc2V0ID0gcmFuZ2Uuc3BsaXQoJyAnKS5tYXAoZnVuY3Rpb24oY29tcCkge1xuICAgIHJldHVybiBwYXJzZUNvbXBhcmF0b3IoY29tcCwgdGhpcy5vcHRpb25zKTtcbiAgfSwgdGhpcykuam9pbignICcpLnNwbGl0KC9cXHMrLyk7XG4gIGlmICh0aGlzLm9wdGlvbnMubG9vc2UpIHtcbiAgICAvLyBpbiBsb29zZSBtb2RlLCB0aHJvdyBvdXQgYW55IHRoYXQgYXJlIG5vdCB2YWxpZCBjb21wYXJhdG9yc1xuICAgIHNldCA9IHNldC5maWx0ZXIoZnVuY3Rpb24oY29tcCkge1xuICAgICAgcmV0dXJuICEhY29tcC5tYXRjaChjb21wUmUpO1xuICAgIH0pO1xuICB9XG4gIHNldCA9IHNldC5tYXAoZnVuY3Rpb24oY29tcCkge1xuICAgIHJldHVybiBuZXcgQ29tcGFyYXRvcihjb21wLCB0aGlzLm9wdGlvbnMpO1xuICB9LCB0aGlzKTtcblxuICByZXR1cm4gc2V0O1xufTtcblxuUmFuZ2UucHJvdG90eXBlLmludGVyc2VjdHMgPSBmdW5jdGlvbihyYW5nZSwgb3B0aW9ucykge1xuICBpZiAoIShyYW5nZSBpbnN0YW5jZW9mIFJhbmdlKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2EgUmFuZ2UgaXMgcmVxdWlyZWQnKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzLnNldC5zb21lKGZ1bmN0aW9uKHRoaXNDb21wYXJhdG9ycykge1xuICAgIHJldHVybiB0aGlzQ29tcGFyYXRvcnMuZXZlcnkoZnVuY3Rpb24odGhpc0NvbXBhcmF0b3IpIHtcbiAgICAgIHJldHVybiByYW5nZS5zZXQuc29tZShmdW5jdGlvbihyYW5nZUNvbXBhcmF0b3JzKSB7XG4gICAgICAgIHJldHVybiByYW5nZUNvbXBhcmF0b3JzLmV2ZXJ5KGZ1bmN0aW9uKHJhbmdlQ29tcGFyYXRvcikge1xuICAgICAgICAgIHJldHVybiB0aGlzQ29tcGFyYXRvci5pbnRlcnNlY3RzKHJhbmdlQ29tcGFyYXRvciwgb3B0aW9ucyk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xufTtcblxuLy8gTW9zdGx5IGp1c3QgZm9yIHRlc3RpbmcgYW5kIGxlZ2FjeSBBUEkgcmVhc29uc1xuZXhwb3J0cy50b0NvbXBhcmF0b3JzID0gdG9Db21wYXJhdG9ycztcbmZ1bmN0aW9uIHRvQ29tcGFyYXRvcnMocmFuZ2UsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIG5ldyBSYW5nZShyYW5nZSwgb3B0aW9ucykuc2V0Lm1hcChmdW5jdGlvbihjb21wKSB7XG4gICAgcmV0dXJuIGNvbXAubWFwKGZ1bmN0aW9uKGMpIHtcbiAgICAgIHJldHVybiBjLnZhbHVlO1xuICAgIH0pLmpvaW4oJyAnKS50cmltKCkuc3BsaXQoJyAnKTtcbiAgfSk7XG59XG5cbi8vIGNvbXByaXNlZCBvZiB4cmFuZ2VzLCB0aWxkZXMsIHN0YXJzLCBhbmQgZ3RsdCdzIGF0IHRoaXMgcG9pbnQuXG4vLyBhbHJlYWR5IHJlcGxhY2VkIHRoZSBoeXBoZW4gcmFuZ2VzXG4vLyB0dXJuIGludG8gYSBzZXQgb2YgSlVTVCBjb21wYXJhdG9ycy5cbmZ1bmN0aW9uIHBhcnNlQ29tcGFyYXRvcihjb21wLCBvcHRpb25zKSB7XG4gIGRlYnVnKCdjb21wJywgY29tcCwgb3B0aW9ucyk7XG4gIGNvbXAgPSByZXBsYWNlQ2FyZXRzKGNvbXAsIG9wdGlvbnMpO1xuICBkZWJ1ZygnY2FyZXQnLCBjb21wKTtcbiAgY29tcCA9IHJlcGxhY2VUaWxkZXMoY29tcCwgb3B0aW9ucyk7XG4gIGRlYnVnKCd0aWxkZXMnLCBjb21wKTtcbiAgY29tcCA9IHJlcGxhY2VYUmFuZ2VzKGNvbXAsIG9wdGlvbnMpO1xuICBkZWJ1ZygneHJhbmdlJywgY29tcCk7XG4gIGNvbXAgPSByZXBsYWNlU3RhcnMoY29tcCwgb3B0aW9ucyk7XG4gIGRlYnVnKCdzdGFycycsIGNvbXApO1xuICByZXR1cm4gY29tcDtcbn1cblxuZnVuY3Rpb24gaXNYKGlkKSB7XG4gIHJldHVybiAhaWQgfHwgaWQudG9Mb3dlckNhc2UoKSA9PT0gJ3gnIHx8IGlkID09PSAnKic7XG59XG5cbi8vIH4sIH4+IC0tPiAqIChhbnksIGtpbmRhIHNpbGx5KVxuLy8gfjIsIH4yLngsIH4yLngueCwgfj4yLCB+PjIueCB+PjIueC54IC0tPiA+PTIuMC4wIDwzLjAuMFxuLy8gfjIuMCwgfjIuMC54LCB+PjIuMCwgfj4yLjAueCAtLT4gPj0yLjAuMCA8Mi4xLjBcbi8vIH4xLjIsIH4xLjIueCwgfj4xLjIsIH4+MS4yLnggLS0+ID49MS4yLjAgPDEuMy4wXG4vLyB+MS4yLjMsIH4+MS4yLjMgLS0+ID49MS4yLjMgPDEuMy4wXG4vLyB+MS4yLjAsIH4+MS4yLjAgLS0+ID49MS4yLjAgPDEuMy4wXG5mdW5jdGlvbiByZXBsYWNlVGlsZGVzKGNvbXAsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIGNvbXAudHJpbSgpLnNwbGl0KC9cXHMrLykubWFwKGZ1bmN0aW9uKGNvbXApIHtcbiAgICByZXR1cm4gcmVwbGFjZVRpbGRlKGNvbXAsIG9wdGlvbnMpO1xuICB9KS5qb2luKCcgJyk7XG59XG5cbmZ1bmN0aW9uIHJlcGxhY2VUaWxkZShjb21wLCBvcHRpb25zKSB7XG4gIGlmICghb3B0aW9ucyB8fCB0eXBlb2Ygb3B0aW9ucyAhPT0gJ29iamVjdCcpXG4gICAgb3B0aW9ucyA9IHsgbG9vc2U6ICEhb3B0aW9ucywgaW5jbHVkZVByZXJlbGVhc2U6IGZhbHNlIH1cbiAgdmFyIHIgPSBvcHRpb25zLmxvb3NlID8gcmVbVElMREVMT09TRV0gOiByZVtUSUxERV07XG4gIHJldHVybiBjb21wLnJlcGxhY2UociwgZnVuY3Rpb24oXywgTSwgbSwgcCwgcHIpIHtcbiAgICBkZWJ1ZygndGlsZGUnLCBjb21wLCBfLCBNLCBtLCBwLCBwcik7XG4gICAgdmFyIHJldDtcblxuICAgIGlmIChpc1goTSkpXG4gICAgICByZXQgPSAnJztcbiAgICBlbHNlIGlmIChpc1gobSkpXG4gICAgICByZXQgPSAnPj0nICsgTSArICcuMC4wIDwnICsgKCtNICsgMSkgKyAnLjAuMCc7XG4gICAgZWxzZSBpZiAoaXNYKHApKVxuICAgICAgLy8gfjEuMiA9PSA+PTEuMi4wIDwxLjMuMFxuICAgICAgcmV0ID0gJz49JyArIE0gKyAnLicgKyBtICsgJy4wIDwnICsgTSArICcuJyArICgrbSArIDEpICsgJy4wJztcbiAgICBlbHNlIGlmIChwcikge1xuICAgICAgZGVidWcoJ3JlcGxhY2VUaWxkZSBwcicsIHByKTtcbiAgICAgIGlmIChwci5jaGFyQXQoMCkgIT09ICctJylcbiAgICAgICAgcHIgPSAnLScgKyBwcjtcbiAgICAgIHJldCA9ICc+PScgKyBNICsgJy4nICsgbSArICcuJyArIHAgKyBwciArXG4gICAgICAgICAgICAnIDwnICsgTSArICcuJyArICgrbSArIDEpICsgJy4wJztcbiAgICB9IGVsc2VcbiAgICAgIC8vIH4xLjIuMyA9PSA+PTEuMi4zIDwxLjMuMFxuICAgICAgcmV0ID0gJz49JyArIE0gKyAnLicgKyBtICsgJy4nICsgcCArXG4gICAgICAgICAgICAnIDwnICsgTSArICcuJyArICgrbSArIDEpICsgJy4wJztcblxuICAgIGRlYnVnKCd0aWxkZSByZXR1cm4nLCByZXQpO1xuICAgIHJldHVybiByZXQ7XG4gIH0pO1xufVxuXG4vLyBeIC0tPiAqIChhbnksIGtpbmRhIHNpbGx5KVxuLy8gXjIsIF4yLngsIF4yLngueCAtLT4gPj0yLjAuMCA8My4wLjBcbi8vIF4yLjAsIF4yLjAueCAtLT4gPj0yLjAuMCA8My4wLjBcbi8vIF4xLjIsIF4xLjIueCAtLT4gPj0xLjIuMCA8Mi4wLjBcbi8vIF4xLjIuMyAtLT4gPj0xLjIuMyA8Mi4wLjBcbi8vIF4xLjIuMCAtLT4gPj0xLjIuMCA8Mi4wLjBcbmZ1bmN0aW9uIHJlcGxhY2VDYXJldHMoY29tcCwgb3B0aW9ucykge1xuICByZXR1cm4gY29tcC50cmltKCkuc3BsaXQoL1xccysvKS5tYXAoZnVuY3Rpb24oY29tcCkge1xuICAgIHJldHVybiByZXBsYWNlQ2FyZXQoY29tcCwgb3B0aW9ucyk7XG4gIH0pLmpvaW4oJyAnKTtcbn1cblxuZnVuY3Rpb24gcmVwbGFjZUNhcmV0KGNvbXAsIG9wdGlvbnMpIHtcbiAgZGVidWcoJ2NhcmV0JywgY29tcCwgb3B0aW9ucyk7XG4gIGlmICghb3B0aW9ucyB8fCB0eXBlb2Ygb3B0aW9ucyAhPT0gJ29iamVjdCcpXG4gICAgb3B0aW9ucyA9IHsgbG9vc2U6ICEhb3B0aW9ucywgaW5jbHVkZVByZXJlbGVhc2U6IGZhbHNlIH1cbiAgdmFyIHIgPSBvcHRpb25zLmxvb3NlID8gcmVbQ0FSRVRMT09TRV0gOiByZVtDQVJFVF07XG4gIHJldHVybiBjb21wLnJlcGxhY2UociwgZnVuY3Rpb24oXywgTSwgbSwgcCwgcHIpIHtcbiAgICBkZWJ1ZygnY2FyZXQnLCBjb21wLCBfLCBNLCBtLCBwLCBwcik7XG4gICAgdmFyIHJldDtcblxuICAgIGlmIChpc1goTSkpXG4gICAgICByZXQgPSAnJztcbiAgICBlbHNlIGlmIChpc1gobSkpXG4gICAgICByZXQgPSAnPj0nICsgTSArICcuMC4wIDwnICsgKCtNICsgMSkgKyAnLjAuMCc7XG4gICAgZWxzZSBpZiAoaXNYKHApKSB7XG4gICAgICBpZiAoTSA9PT0gJzAnKVxuICAgICAgICByZXQgPSAnPj0nICsgTSArICcuJyArIG0gKyAnLjAgPCcgKyBNICsgJy4nICsgKCttICsgMSkgKyAnLjAnO1xuICAgICAgZWxzZVxuICAgICAgICByZXQgPSAnPj0nICsgTSArICcuJyArIG0gKyAnLjAgPCcgKyAoK00gKyAxKSArICcuMC4wJztcbiAgICB9IGVsc2UgaWYgKHByKSB7XG4gICAgICBkZWJ1ZygncmVwbGFjZUNhcmV0IHByJywgcHIpO1xuICAgICAgaWYgKHByLmNoYXJBdCgwKSAhPT0gJy0nKVxuICAgICAgICBwciA9ICctJyArIHByO1xuICAgICAgaWYgKE0gPT09ICcwJykge1xuICAgICAgICBpZiAobSA9PT0gJzAnKVxuICAgICAgICAgIHJldCA9ICc+PScgKyBNICsgJy4nICsgbSArICcuJyArIHAgKyBwciArXG4gICAgICAgICAgICAgICAgJyA8JyArIE0gKyAnLicgKyBtICsgJy4nICsgKCtwICsgMSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICByZXQgPSAnPj0nICsgTSArICcuJyArIG0gKyAnLicgKyBwICsgcHIgK1xuICAgICAgICAgICAgICAgICcgPCcgKyBNICsgJy4nICsgKCttICsgMSkgKyAnLjAnO1xuICAgICAgfSBlbHNlXG4gICAgICAgIHJldCA9ICc+PScgKyBNICsgJy4nICsgbSArICcuJyArIHAgKyBwciArXG4gICAgICAgICAgICAgICcgPCcgKyAoK00gKyAxKSArICcuMC4wJztcbiAgICB9IGVsc2Uge1xuICAgICAgZGVidWcoJ25vIHByJyk7XG4gICAgICBpZiAoTSA9PT0gJzAnKSB7XG4gICAgICAgIGlmIChtID09PSAnMCcpXG4gICAgICAgICAgcmV0ID0gJz49JyArIE0gKyAnLicgKyBtICsgJy4nICsgcCArXG4gICAgICAgICAgICAgICAgJyA8JyArIE0gKyAnLicgKyBtICsgJy4nICsgKCtwICsgMSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICByZXQgPSAnPj0nICsgTSArICcuJyArIG0gKyAnLicgKyBwICtcbiAgICAgICAgICAgICAgICAnIDwnICsgTSArICcuJyArICgrbSArIDEpICsgJy4wJztcbiAgICAgIH0gZWxzZVxuICAgICAgICByZXQgPSAnPj0nICsgTSArICcuJyArIG0gKyAnLicgKyBwICtcbiAgICAgICAgICAgICAgJyA8JyArICgrTSArIDEpICsgJy4wLjAnO1xuICAgIH1cblxuICAgIGRlYnVnKCdjYXJldCByZXR1cm4nLCByZXQpO1xuICAgIHJldHVybiByZXQ7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiByZXBsYWNlWFJhbmdlcyhjb21wLCBvcHRpb25zKSB7XG4gIGRlYnVnKCdyZXBsYWNlWFJhbmdlcycsIGNvbXAsIG9wdGlvbnMpO1xuICByZXR1cm4gY29tcC5zcGxpdCgvXFxzKy8pLm1hcChmdW5jdGlvbihjb21wKSB7XG4gICAgcmV0dXJuIHJlcGxhY2VYUmFuZ2UoY29tcCwgb3B0aW9ucyk7XG4gIH0pLmpvaW4oJyAnKTtcbn1cblxuZnVuY3Rpb24gcmVwbGFjZVhSYW5nZShjb21wLCBvcHRpb25zKSB7XG4gIGNvbXAgPSBjb21wLnRyaW0oKTtcbiAgaWYgKCFvcHRpb25zIHx8IHR5cGVvZiBvcHRpb25zICE9PSAnb2JqZWN0JylcbiAgICBvcHRpb25zID0geyBsb29zZTogISFvcHRpb25zLCBpbmNsdWRlUHJlcmVsZWFzZTogZmFsc2UgfVxuICB2YXIgciA9IG9wdGlvbnMubG9vc2UgPyByZVtYUkFOR0VMT09TRV0gOiByZVtYUkFOR0VdO1xuICByZXR1cm4gY29tcC5yZXBsYWNlKHIsIGZ1bmN0aW9uKHJldCwgZ3RsdCwgTSwgbSwgcCwgcHIpIHtcbiAgICBkZWJ1ZygneFJhbmdlJywgY29tcCwgcmV0LCBndGx0LCBNLCBtLCBwLCBwcik7XG4gICAgdmFyIHhNID0gaXNYKE0pO1xuICAgIHZhciB4bSA9IHhNIHx8IGlzWChtKTtcbiAgICB2YXIgeHAgPSB4bSB8fCBpc1gocCk7XG4gICAgdmFyIGFueVggPSB4cDtcblxuICAgIGlmIChndGx0ID09PSAnPScgJiYgYW55WClcbiAgICAgIGd0bHQgPSAnJztcblxuICAgIGlmICh4TSkge1xuICAgICAgaWYgKGd0bHQgPT09ICc+JyB8fCBndGx0ID09PSAnPCcpIHtcbiAgICAgICAgLy8gbm90aGluZyBpcyBhbGxvd2VkXG4gICAgICAgIHJldCA9ICc8MC4wLjAnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gbm90aGluZyBpcyBmb3JiaWRkZW5cbiAgICAgICAgcmV0ID0gJyonO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoZ3RsdCAmJiBhbnlYKSB7XG4gICAgICAvLyByZXBsYWNlIFggd2l0aCAwXG4gICAgICBpZiAoeG0pXG4gICAgICAgIG0gPSAwO1xuICAgICAgaWYgKHhwKVxuICAgICAgICBwID0gMDtcblxuICAgICAgaWYgKGd0bHQgPT09ICc+Jykge1xuICAgICAgICAvLyA+MSA9PiA+PTIuMC4wXG4gICAgICAgIC8vID4xLjIgPT4gPj0xLjMuMFxuICAgICAgICAvLyA+MS4yLjMgPT4gPj0gMS4yLjRcbiAgICAgICAgZ3RsdCA9ICc+PSc7XG4gICAgICAgIGlmICh4bSkge1xuICAgICAgICAgIE0gPSArTSArIDE7XG4gICAgICAgICAgbSA9IDA7XG4gICAgICAgICAgcCA9IDA7XG4gICAgICAgIH0gZWxzZSBpZiAoeHApIHtcbiAgICAgICAgICBtID0gK20gKyAxO1xuICAgICAgICAgIHAgPSAwO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGd0bHQgPT09ICc8PScpIHtcbiAgICAgICAgLy8gPD0wLjcueCBpcyBhY3R1YWxseSA8MC44LjAsIHNpbmNlIGFueSAwLjcueCBzaG91bGRcbiAgICAgICAgLy8gcGFzcy4gIFNpbWlsYXJseSwgPD03LnggaXMgYWN0dWFsbHkgPDguMC4wLCBldGMuXG4gICAgICAgIGd0bHQgPSAnPCc7XG4gICAgICAgIGlmICh4bSlcbiAgICAgICAgICBNID0gK00gKyAxO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgbSA9ICttICsgMTtcbiAgICAgIH1cblxuICAgICAgcmV0ID0gZ3RsdCArIE0gKyAnLicgKyBtICsgJy4nICsgcDtcbiAgICB9IGVsc2UgaWYgKHhtKSB7XG4gICAgICByZXQgPSAnPj0nICsgTSArICcuMC4wIDwnICsgKCtNICsgMSkgKyAnLjAuMCc7XG4gICAgfSBlbHNlIGlmICh4cCkge1xuICAgICAgcmV0ID0gJz49JyArIE0gKyAnLicgKyBtICsgJy4wIDwnICsgTSArICcuJyArICgrbSArIDEpICsgJy4wJztcbiAgICB9XG5cbiAgICBkZWJ1ZygneFJhbmdlIHJldHVybicsIHJldCk7XG5cbiAgICByZXR1cm4gcmV0O1xuICB9KTtcbn1cblxuLy8gQmVjYXVzZSAqIGlzIEFORC1lZCB3aXRoIGV2ZXJ5dGhpbmcgZWxzZSBpbiB0aGUgY29tcGFyYXRvcixcbi8vIGFuZCAnJyBtZWFucyBcImFueSB2ZXJzaW9uXCIsIGp1c3QgcmVtb3ZlIHRoZSAqcyBlbnRpcmVseS5cbmZ1bmN0aW9uIHJlcGxhY2VTdGFycyhjb21wLCBvcHRpb25zKSB7XG4gIGRlYnVnKCdyZXBsYWNlU3RhcnMnLCBjb21wLCBvcHRpb25zKTtcbiAgLy8gTG9vc2VuZXNzIGlzIGlnbm9yZWQgaGVyZS4gIHN0YXIgaXMgYWx3YXlzIGFzIGxvb3NlIGFzIGl0IGdldHMhXG4gIHJldHVybiBjb21wLnRyaW0oKS5yZXBsYWNlKHJlW1NUQVJdLCAnJyk7XG59XG5cbi8vIFRoaXMgZnVuY3Rpb24gaXMgcGFzc2VkIHRvIHN0cmluZy5yZXBsYWNlKHJlW0hZUEhFTlJBTkdFXSlcbi8vIE0sIG0sIHBhdGNoLCBwcmVyZWxlYXNlLCBidWlsZFxuLy8gMS4yIC0gMy40LjUgPT4gPj0xLjIuMCA8PTMuNC41XG4vLyAxLjIuMyAtIDMuNCA9PiA+PTEuMi4wIDwzLjUuMCBBbnkgMy40Lnggd2lsbCBkb1xuLy8gMS4yIC0gMy40ID0+ID49MS4yLjAgPDMuNS4wXG5mdW5jdGlvbiBoeXBoZW5SZXBsYWNlKCQwLFxuICAgICAgICAgICAgICAgICAgICAgICBmcm9tLCBmTSwgZm0sIGZwLCBmcHIsIGZiLFxuICAgICAgICAgICAgICAgICAgICAgICB0bywgdE0sIHRtLCB0cCwgdHByLCB0Yikge1xuXG4gIGlmIChpc1goZk0pKVxuICAgIGZyb20gPSAnJztcbiAgZWxzZSBpZiAoaXNYKGZtKSlcbiAgICBmcm9tID0gJz49JyArIGZNICsgJy4wLjAnO1xuICBlbHNlIGlmIChpc1goZnApKVxuICAgIGZyb20gPSAnPj0nICsgZk0gKyAnLicgKyBmbSArICcuMCc7XG4gIGVsc2VcbiAgICBmcm9tID0gJz49JyArIGZyb207XG5cbiAgaWYgKGlzWCh0TSkpXG4gICAgdG8gPSAnJztcbiAgZWxzZSBpZiAoaXNYKHRtKSlcbiAgICB0byA9ICc8JyArICgrdE0gKyAxKSArICcuMC4wJztcbiAgZWxzZSBpZiAoaXNYKHRwKSlcbiAgICB0byA9ICc8JyArIHRNICsgJy4nICsgKCt0bSArIDEpICsgJy4wJztcbiAgZWxzZSBpZiAodHByKVxuICAgIHRvID0gJzw9JyArIHRNICsgJy4nICsgdG0gKyAnLicgKyB0cCArICctJyArIHRwcjtcbiAgZWxzZVxuICAgIHRvID0gJzw9JyArIHRvO1xuXG4gIHJldHVybiAoZnJvbSArICcgJyArIHRvKS50cmltKCk7XG59XG5cblxuLy8gaWYgQU5ZIG9mIHRoZSBzZXRzIG1hdGNoIEFMTCBvZiBpdHMgY29tcGFyYXRvcnMsIHRoZW4gcGFzc1xuUmFuZ2UucHJvdG90eXBlLnRlc3QgPSBmdW5jdGlvbih2ZXJzaW9uKSB7XG4gIGlmICghdmVyc2lvbilcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgaWYgKHR5cGVvZiB2ZXJzaW9uID09PSAnc3RyaW5nJylcbiAgICB2ZXJzaW9uID0gbmV3IFNlbVZlcih2ZXJzaW9uLCB0aGlzLm9wdGlvbnMpO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5zZXQubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAodGVzdFNldCh0aGlzLnNldFtpXSwgdmVyc2lvbiwgdGhpcy5vcHRpb25zKSlcbiAgICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG5cbmZ1bmN0aW9uIHRlc3RTZXQoc2V0LCB2ZXJzaW9uLCBvcHRpb25zKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc2V0Lmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKCFzZXRbaV0udGVzdCh2ZXJzaW9uKSlcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmICghb3B0aW9ucylcbiAgICBvcHRpb25zID0ge31cblxuICBpZiAodmVyc2lvbi5wcmVyZWxlYXNlLmxlbmd0aCAmJiAhb3B0aW9ucy5pbmNsdWRlUHJlcmVsZWFzZSkge1xuICAgIC8vIEZpbmQgdGhlIHNldCBvZiB2ZXJzaW9ucyB0aGF0IGFyZSBhbGxvd2VkIHRvIGhhdmUgcHJlcmVsZWFzZXNcbiAgICAvLyBGb3IgZXhhbXBsZSwgXjEuMi4zLXByLjEgZGVzdWdhcnMgdG8gPj0xLjIuMy1wci4xIDwyLjAuMFxuICAgIC8vIFRoYXQgc2hvdWxkIGFsbG93IGAxLjIuMy1wci4yYCB0byBwYXNzLlxuICAgIC8vIEhvd2V2ZXIsIGAxLjIuNC1hbHBoYS5ub3RyZWFkeWAgc2hvdWxkIE5PVCBiZSBhbGxvd2VkLFxuICAgIC8vIGV2ZW4gdGhvdWdoIGl0J3Mgd2l0aGluIHRoZSByYW5nZSBzZXQgYnkgdGhlIGNvbXBhcmF0b3JzLlxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2V0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICBkZWJ1ZyhzZXRbaV0uc2VtdmVyKTtcbiAgICAgIGlmIChzZXRbaV0uc2VtdmVyID09PSBBTlkpXG4gICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICBpZiAoc2V0W2ldLnNlbXZlci5wcmVyZWxlYXNlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdmFyIGFsbG93ZWQgPSBzZXRbaV0uc2VtdmVyO1xuICAgICAgICBpZiAoYWxsb3dlZC5tYWpvciA9PT0gdmVyc2lvbi5tYWpvciAmJlxuICAgICAgICAgICAgYWxsb3dlZC5taW5vciA9PT0gdmVyc2lvbi5taW5vciAmJlxuICAgICAgICAgICAgYWxsb3dlZC5wYXRjaCA9PT0gdmVyc2lvbi5wYXRjaClcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBWZXJzaW9uIGhhcyBhIC1wcmUsIGJ1dCBpdCdzIG5vdCBvbmUgb2YgdGhlIG9uZXMgd2UgbGlrZS5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn1cblxuZXhwb3J0cy5zYXRpc2ZpZXMgPSBzYXRpc2ZpZXM7XG5mdW5jdGlvbiBzYXRpc2ZpZXModmVyc2lvbiwgcmFuZ2UsIG9wdGlvbnMpIHtcbiAgdHJ5IHtcbiAgICByYW5nZSA9IG5ldyBSYW5nZShyYW5nZSwgb3B0aW9ucyk7XG4gIH0gY2F0Y2ggKGVyKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiByYW5nZS50ZXN0KHZlcnNpb24pO1xufVxuXG5leHBvcnRzLm1heFNhdGlzZnlpbmcgPSBtYXhTYXRpc2Z5aW5nO1xuZnVuY3Rpb24gbWF4U2F0aXNmeWluZyh2ZXJzaW9ucywgcmFuZ2UsIG9wdGlvbnMpIHtcbiAgdmFyIG1heCA9IG51bGw7XG4gIHZhciBtYXhTViA9IG51bGw7XG4gIHRyeSB7XG4gICAgdmFyIHJhbmdlT2JqID0gbmV3IFJhbmdlKHJhbmdlLCBvcHRpb25zKTtcbiAgfSBjYXRjaCAoZXIpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICB2ZXJzaW9ucy5mb3JFYWNoKGZ1bmN0aW9uICh2KSB7XG4gICAgaWYgKHJhbmdlT2JqLnRlc3QodikpIHsgLy8gc2F0aXNmaWVzKHYsIHJhbmdlLCBvcHRpb25zKVxuICAgICAgaWYgKCFtYXggfHwgbWF4U1YuY29tcGFyZSh2KSA9PT0gLTEpIHsgLy8gY29tcGFyZShtYXgsIHYsIHRydWUpXG4gICAgICAgIG1heCA9IHY7XG4gICAgICAgIG1heFNWID0gbmV3IFNlbVZlcihtYXgsIG9wdGlvbnMpO1xuICAgICAgfVxuICAgIH1cbiAgfSlcbiAgcmV0dXJuIG1heDtcbn1cblxuZXhwb3J0cy5taW5TYXRpc2Z5aW5nID0gbWluU2F0aXNmeWluZztcbmZ1bmN0aW9uIG1pblNhdGlzZnlpbmcodmVyc2lvbnMsIHJhbmdlLCBvcHRpb25zKSB7XG4gIHZhciBtaW4gPSBudWxsO1xuICB2YXIgbWluU1YgPSBudWxsO1xuICB0cnkge1xuICAgIHZhciByYW5nZU9iaiA9IG5ldyBSYW5nZShyYW5nZSwgb3B0aW9ucyk7XG4gIH0gY2F0Y2ggKGVyKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmVyc2lvbnMuZm9yRWFjaChmdW5jdGlvbiAodikge1xuICAgIGlmIChyYW5nZU9iai50ZXN0KHYpKSB7IC8vIHNhdGlzZmllcyh2LCByYW5nZSwgb3B0aW9ucylcbiAgICAgIGlmICghbWluIHx8IG1pblNWLmNvbXBhcmUodikgPT09IDEpIHsgLy8gY29tcGFyZShtaW4sIHYsIHRydWUpXG4gICAgICAgIG1pbiA9IHY7XG4gICAgICAgIG1pblNWID0gbmV3IFNlbVZlcihtaW4sIG9wdGlvbnMpO1xuICAgICAgfVxuICAgIH1cbiAgfSlcbiAgcmV0dXJuIG1pbjtcbn1cblxuZXhwb3J0cy52YWxpZFJhbmdlID0gdmFsaWRSYW5nZTtcbmZ1bmN0aW9uIHZhbGlkUmFuZ2UocmFuZ2UsIG9wdGlvbnMpIHtcbiAgdHJ5IHtcbiAgICAvLyBSZXR1cm4gJyonIGluc3RlYWQgb2YgJycgc28gdGhhdCB0cnV0aGluZXNzIHdvcmtzLlxuICAgIC8vIFRoaXMgd2lsbCB0aHJvdyBpZiBpdCdzIGludmFsaWQgYW55d2F5XG4gICAgcmV0dXJuIG5ldyBSYW5nZShyYW5nZSwgb3B0aW9ucykucmFuZ2UgfHwgJyonO1xuICB9IGNhdGNoIChlcikge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbi8vIERldGVybWluZSBpZiB2ZXJzaW9uIGlzIGxlc3MgdGhhbiBhbGwgdGhlIHZlcnNpb25zIHBvc3NpYmxlIGluIHRoZSByYW5nZVxuZXhwb3J0cy5sdHIgPSBsdHI7XG5mdW5jdGlvbiBsdHIodmVyc2lvbiwgcmFuZ2UsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIG91dHNpZGUodmVyc2lvbiwgcmFuZ2UsICc8Jywgb3B0aW9ucyk7XG59XG5cbi8vIERldGVybWluZSBpZiB2ZXJzaW9uIGlzIGdyZWF0ZXIgdGhhbiBhbGwgdGhlIHZlcnNpb25zIHBvc3NpYmxlIGluIHRoZSByYW5nZS5cbmV4cG9ydHMuZ3RyID0gZ3RyO1xuZnVuY3Rpb24gZ3RyKHZlcnNpb24sIHJhbmdlLCBvcHRpb25zKSB7XG4gIHJldHVybiBvdXRzaWRlKHZlcnNpb24sIHJhbmdlLCAnPicsIG9wdGlvbnMpO1xufVxuXG5leHBvcnRzLm91dHNpZGUgPSBvdXRzaWRlO1xuZnVuY3Rpb24gb3V0c2lkZSh2ZXJzaW9uLCByYW5nZSwgaGlsbywgb3B0aW9ucykge1xuICB2ZXJzaW9uID0gbmV3IFNlbVZlcih2ZXJzaW9uLCBvcHRpb25zKTtcbiAgcmFuZ2UgPSBuZXcgUmFuZ2UocmFuZ2UsIG9wdGlvbnMpO1xuXG4gIHZhciBndGZuLCBsdGVmbiwgbHRmbiwgY29tcCwgZWNvbXA7XG4gIHN3aXRjaCAoaGlsbykge1xuICAgIGNhc2UgJz4nOlxuICAgICAgZ3RmbiA9IGd0O1xuICAgICAgbHRlZm4gPSBsdGU7XG4gICAgICBsdGZuID0gbHQ7XG4gICAgICBjb21wID0gJz4nO1xuICAgICAgZWNvbXAgPSAnPj0nO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnPCc6XG4gICAgICBndGZuID0gbHQ7XG4gICAgICBsdGVmbiA9IGd0ZTtcbiAgICAgIGx0Zm4gPSBndDtcbiAgICAgIGNvbXAgPSAnPCc7XG4gICAgICBlY29tcCA9ICc8PSc7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignTXVzdCBwcm92aWRlIGEgaGlsbyB2YWwgb2YgXCI8XCIgb3IgXCI+XCInKTtcbiAgfVxuXG4gIC8vIElmIGl0IHNhdGlzaWZlcyB0aGUgcmFuZ2UgaXQgaXMgbm90IG91dHNpZGVcbiAgaWYgKHNhdGlzZmllcyh2ZXJzaW9uLCByYW5nZSwgb3B0aW9ucykpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBGcm9tIG5vdyBvbiwgdmFyaWFibGUgdGVybXMgYXJlIGFzIGlmIHdlJ3JlIGluIFwiZ3RyXCIgbW9kZS5cbiAgLy8gYnV0IG5vdGUgdGhhdCBldmVyeXRoaW5nIGlzIGZsaXBwZWQgZm9yIHRoZSBcImx0clwiIGZ1bmN0aW9uLlxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcmFuZ2Uuc2V0Lmxlbmd0aDsgKytpKSB7XG4gICAgdmFyIGNvbXBhcmF0b3JzID0gcmFuZ2Uuc2V0W2ldO1xuXG4gICAgdmFyIGhpZ2ggPSBudWxsO1xuICAgIHZhciBsb3cgPSBudWxsO1xuXG4gICAgY29tcGFyYXRvcnMuZm9yRWFjaChmdW5jdGlvbihjb21wYXJhdG9yKSB7XG4gICAgICBpZiAoY29tcGFyYXRvci5zZW12ZXIgPT09IEFOWSkge1xuICAgICAgICBjb21wYXJhdG9yID0gbmV3IENvbXBhcmF0b3IoJz49MC4wLjAnKVxuICAgICAgfVxuICAgICAgaGlnaCA9IGhpZ2ggfHwgY29tcGFyYXRvcjtcbiAgICAgIGxvdyA9IGxvdyB8fCBjb21wYXJhdG9yO1xuICAgICAgaWYgKGd0Zm4oY29tcGFyYXRvci5zZW12ZXIsIGhpZ2guc2VtdmVyLCBvcHRpb25zKSkge1xuICAgICAgICBoaWdoID0gY29tcGFyYXRvcjtcbiAgICAgIH0gZWxzZSBpZiAobHRmbihjb21wYXJhdG9yLnNlbXZlciwgbG93LnNlbXZlciwgb3B0aW9ucykpIHtcbiAgICAgICAgbG93ID0gY29tcGFyYXRvcjtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIElmIHRoZSBlZGdlIHZlcnNpb24gY29tcGFyYXRvciBoYXMgYSBvcGVyYXRvciB0aGVuIG91ciB2ZXJzaW9uXG4gICAgLy8gaXNuJ3Qgb3V0c2lkZSBpdFxuICAgIGlmIChoaWdoLm9wZXJhdG9yID09PSBjb21wIHx8IGhpZ2gub3BlcmF0b3IgPT09IGVjb21wKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIGxvd2VzdCB2ZXJzaW9uIGNvbXBhcmF0b3IgaGFzIGFuIG9wZXJhdG9yIGFuZCBvdXIgdmVyc2lvblxuICAgIC8vIGlzIGxlc3MgdGhhbiBpdCB0aGVuIGl0IGlzbid0IGhpZ2hlciB0aGFuIHRoZSByYW5nZVxuICAgIGlmICgoIWxvdy5vcGVyYXRvciB8fCBsb3cub3BlcmF0b3IgPT09IGNvbXApICYmXG4gICAgICAgIGx0ZWZuKHZlcnNpb24sIGxvdy5zZW12ZXIpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSBlbHNlIGlmIChsb3cub3BlcmF0b3IgPT09IGVjb21wICYmIGx0Zm4odmVyc2lvbiwgbG93LnNlbXZlcikpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cbmV4cG9ydHMucHJlcmVsZWFzZSA9IHByZXJlbGVhc2U7XG5mdW5jdGlvbiBwcmVyZWxlYXNlKHZlcnNpb24sIG9wdGlvbnMpIHtcbiAgdmFyIHBhcnNlZCA9IHBhcnNlKHZlcnNpb24sIG9wdGlvbnMpO1xuICByZXR1cm4gKHBhcnNlZCAmJiBwYXJzZWQucHJlcmVsZWFzZS5sZW5ndGgpID8gcGFyc2VkLnByZXJlbGVhc2UgOiBudWxsO1xufVxuXG5leHBvcnRzLmludGVyc2VjdHMgPSBpbnRlcnNlY3RzO1xuZnVuY3Rpb24gaW50ZXJzZWN0cyhyMSwgcjIsIG9wdGlvbnMpIHtcbiAgcjEgPSBuZXcgUmFuZ2UocjEsIG9wdGlvbnMpXG4gIHIyID0gbmV3IFJhbmdlKHIyLCBvcHRpb25zKVxuICByZXR1cm4gcjEuaW50ZXJzZWN0cyhyMilcbn1cblxuZXhwb3J0cy5jb2VyY2UgPSBjb2VyY2U7XG5mdW5jdGlvbiBjb2VyY2UodmVyc2lvbikge1xuICBpZiAodmVyc2lvbiBpbnN0YW5jZW9mIFNlbVZlcilcbiAgICByZXR1cm4gdmVyc2lvbjtcblxuICBpZiAodHlwZW9mIHZlcnNpb24gIT09ICdzdHJpbmcnKVxuICAgIHJldHVybiBudWxsO1xuXG4gIHZhciBtYXRjaCA9IHZlcnNpb24ubWF0Y2gocmVbQ09FUkNFXSk7XG5cbiAgaWYgKG1hdGNoID09IG51bGwpXG4gICAgcmV0dXJuIG51bGw7XG5cbiAgcmV0dXJuIHBhcnNlKChtYXRjaFsxXSB8fCAnMCcpICsgJy4nICsgKG1hdGNoWzJdIHx8ICcwJykgKyAnLicgKyAobWF0Y2hbM10gfHwgJzAnKSk7IFxufVxuIiwiLy8gQGZsb3dcbmltcG9ydCBWdWUgZnJvbSAndnVlJ1xuaW1wb3J0IHNlbXZlciBmcm9tICdzZW12ZXInXG5cbmV4cG9ydCBmdW5jdGlvbiB0aHJvd0Vycm9yIChtc2c6IHN0cmluZyk6IHZvaWQge1xuICB0aHJvdyBuZXcgRXJyb3IoYFt2dWUtdGVzdC11dGlsc106ICR7bXNnfWApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3YXJuIChtc2c6IHN0cmluZyk6IHZvaWQge1xuICBjb25zb2xlLmVycm9yKGBbdnVlLXRlc3QtdXRpbHNdOiAke21zZ31gKVxufVxuXG5jb25zdCBjYW1lbGl6ZVJFID0gLy0oXFx3KS9nXG5cbmV4cG9ydCBjb25zdCBjYW1lbGl6ZSA9IChzdHI6IHN0cmluZyk6IHN0cmluZyA9PiB7XG4gIGNvbnN0IGNhbWVsaXplZFN0ciA9IHN0ci5yZXBsYWNlKGNhbWVsaXplUkUsIChfLCBjKSA9PlxuICAgIGMgPyBjLnRvVXBwZXJDYXNlKCkgOiAnJ1xuICApXG4gIHJldHVybiBjYW1lbGl6ZWRTdHIuY2hhckF0KDApLnRvTG93ZXJDYXNlKCkgKyBjYW1lbGl6ZWRTdHIuc2xpY2UoMSlcbn1cblxuLyoqXG4gKiBDYXBpdGFsaXplIGEgc3RyaW5nLlxuICovXG5leHBvcnQgY29uc3QgY2FwaXRhbGl6ZSA9IChzdHI6IHN0cmluZyk6IHN0cmluZyA9PlxuICBzdHIuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzdHIuc2xpY2UoMSlcblxuLyoqXG4gKiBIeXBoZW5hdGUgYSBjYW1lbENhc2Ugc3RyaW5nLlxuICovXG5jb25zdCBoeXBoZW5hdGVSRSA9IC9cXEIoW0EtWl0pL2dcbmV4cG9ydCBjb25zdCBoeXBoZW5hdGUgPSAoc3RyOiBzdHJpbmcpOiBzdHJpbmcgPT5cbiAgc3RyLnJlcGxhY2UoaHlwaGVuYXRlUkUsICctJDEnKS50b0xvd2VyQ2FzZSgpXG5cbmZ1bmN0aW9uIGhhc093blByb3BlcnR5IChvYmosIHByb3ApIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlQ29tcG9uZW50IChpZDogc3RyaW5nLCBjb21wb25lbnRzOiBPYmplY3QpIHtcbiAgaWYgKHR5cGVvZiBpZCAhPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm5cbiAgfVxuICAvLyBjaGVjayBsb2NhbCByZWdpc3RyYXRpb24gdmFyaWF0aW9ucyBmaXJzdFxuICBpZiAoaGFzT3duUHJvcGVydHkoY29tcG9uZW50cywgaWQpKSB7XG4gICAgcmV0dXJuIGNvbXBvbmVudHNbaWRdXG4gIH1cbiAgdmFyIGNhbWVsaXplZElkID0gY2FtZWxpemUoaWQpXG4gIGlmIChoYXNPd25Qcm9wZXJ0eShjb21wb25lbnRzLCBjYW1lbGl6ZWRJZCkpIHtcbiAgICByZXR1cm4gY29tcG9uZW50c1tjYW1lbGl6ZWRJZF1cbiAgfVxuICB2YXIgUGFzY2FsQ2FzZUlkID0gY2FwaXRhbGl6ZShjYW1lbGl6ZWRJZClcbiAgaWYgKGhhc093blByb3BlcnR5KGNvbXBvbmVudHMsIFBhc2NhbENhc2VJZCkpIHtcbiAgICByZXR1cm4gY29tcG9uZW50c1tQYXNjYWxDYXNlSWRdXG4gIH1cbiAgLy8gZmFsbGJhY2sgdG8gcHJvdG90eXBlIGNoYWluXG4gIHJldHVybiBjb21wb25lbnRzW2lkXSB8fCBjb21wb25lbnRzW2NhbWVsaXplZElkXSB8fCBjb21wb25lbnRzW1Bhc2NhbENhc2VJZF1cbn1cblxuY29uc3QgVUEgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJlxuICAnbmF2aWdhdG9yJyBpbiB3aW5kb3cgJiZcbiAgbmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpXG5cbmV4cG9ydCBjb25zdCBpc1BoYW50b21KUyA9IFVBICYmIFVBLmluY2x1ZGVzICYmXG4gIFVBLm1hdGNoKC9waGFudG9tanMvaSlcblxuZXhwb3J0IGNvbnN0IGlzRWRnZSA9IFVBICYmIFVBLmluZGV4T2YoJ2VkZ2UvJykgPiAwXG5leHBvcnQgY29uc3QgaXNDaHJvbWUgPSBVQSAmJiAvY2hyb21lXFwvXFxkKy8udGVzdChVQSkgJiYgIWlzRWRnZVxuXG4vLyBnZXQgdGhlIGV2ZW50IHVzZWQgdG8gdHJpZ2dlciB2LW1vZGVsIGhhbmRsZXIgdGhhdCB1cGRhdGVzIGJvdW5kIGRhdGFcbmV4cG9ydCBmdW5jdGlvbiBnZXRDaGVja2VkRXZlbnQgKCkge1xuICBjb25zdCB2ZXJzaW9uID0gVnVlLnZlcnNpb25cblxuICBpZiAoc2VtdmVyLnNhdGlzZmllcyh2ZXJzaW9uLCAnMi4xLjkgLSAyLjEuMTAnKSkge1xuICAgIHJldHVybiAnY2xpY2snXG4gIH1cblxuICBpZiAoc2VtdmVyLnNhdGlzZmllcyh2ZXJzaW9uLCAnMi4yIC0gMi40JykpIHtcbiAgICByZXR1cm4gaXNDaHJvbWUgPyAnY2xpY2snIDogJ2NoYW5nZSdcbiAgfVxuXG4gIC8vIGNoYW5nZSBpcyBoYW5kbGVyIGZvciB2ZXJzaW9uIDIuMCAtIDIuMS44LCBhbmQgMi41K1xuICByZXR1cm4gJ2NoYW5nZSdcbn1cbiIsIi8vIEBmbG93XG5pbXBvcnQgJCRWdWUgZnJvbSAndnVlJ1xuaW1wb3J0IHsgd2FybiB9IGZyb20gJ3NoYXJlZC91dGlsJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBhZGRNb2NrcyAoXG4gIF9WdWU6IENvbXBvbmVudCxcbiAgbW9ja2VkUHJvcGVydGllczogT2JqZWN0IHwgZmFsc2UgPSB7fVxuKTogdm9pZCB7XG4gIGlmIChtb2NrZWRQcm9wZXJ0aWVzID09PSBmYWxzZSkge1xuICAgIHJldHVyblxuICB9XG4gIE9iamVjdC5rZXlzKG1vY2tlZFByb3BlcnRpZXMpLmZvckVhY2goa2V5ID0+IHtcbiAgICB0cnkge1xuICAgICAgLy8gJEZsb3dJZ25vcmVcbiAgICAgIF9WdWUucHJvdG90eXBlW2tleV0gPSBtb2NrZWRQcm9wZXJ0aWVzW2tleV1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB3YXJuKFxuICAgICAgICBgY291bGQgbm90IG92ZXJ3cml0ZSBwcm9wZXJ0eSAke2tleX0sIHRoaXMgaXMgYCArXG4gICAgICAgIGB1c3VhbGx5IGNhdXNlZCBieSBhIHBsdWdpbiB0aGF0IGhhcyBhZGRlZCBgICtcbiAgICAgICAgYHRoZSBwcm9wZXJ0eSBhcyBhIHJlYWQtb25seSB2YWx1ZWBcbiAgICAgIClcbiAgICB9XG4gICAgLy8gJEZsb3dJZ25vcmVcbiAgICAkJFZ1ZS51dGlsLmRlZmluZVJlYWN0aXZlKF9WdWUsIGtleSwgbW9ja2VkUHJvcGVydGllc1trZXldKVxuICB9KVxufVxuIiwiLy8gQGZsb3dcblxuZXhwb3J0IGZ1bmN0aW9uIGxvZ0V2ZW50cyAoXG4gIHZtOiBDb21wb25lbnQsXG4gIGVtaXR0ZWQ6IE9iamVjdCxcbiAgZW1pdHRlZEJ5T3JkZXI6IEFycmF5PGFueT5cbik6IHZvaWQge1xuICBjb25zdCBlbWl0ID0gdm0uJGVtaXRcbiAgdm0uJGVtaXQgPSAobmFtZSwgLi4uYXJncykgPT4ge1xuICAgIChlbWl0dGVkW25hbWVdIHx8IChlbWl0dGVkW25hbWVdID0gW10pKS5wdXNoKGFyZ3MpXG4gICAgZW1pdHRlZEJ5T3JkZXIucHVzaCh7IG5hbWUsIGFyZ3MgfSlcbiAgICByZXR1cm4gZW1pdC5jYWxsKHZtLCBuYW1lLCAuLi5hcmdzKVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhZGRFdmVudExvZ2dlciAoX1Z1ZTogQ29tcG9uZW50KTogdm9pZCB7XG4gIF9WdWUubWl4aW4oe1xuICAgIGJlZm9yZUNyZWF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5fX2VtaXR0ZWQgPSBPYmplY3QuY3JlYXRlKG51bGwpXG4gICAgICB0aGlzLl9fZW1pdHRlZEJ5T3JkZXIgPSBbXVxuICAgICAgbG9nRXZlbnRzKHRoaXMsIHRoaXMuX19lbWl0dGVkLCB0aGlzLl9fZW1pdHRlZEJ5T3JkZXIpXG4gICAgfVxuICB9KVxufVxuIiwiaW1wb3J0IFZ1ZSBmcm9tICd2dWUnXG5pbXBvcnQgc2VtdmVyIGZyb20gJ3NlbXZlcidcblxuZXhwb3J0IGNvbnN0IE5BTUVfU0VMRUNUT1IgPSAnTkFNRV9TRUxFQ1RPUidcbmV4cG9ydCBjb25zdCBDT01QT05FTlRfU0VMRUNUT1IgPSAnQ09NUE9ORU5UX1NFTEVDVE9SJ1xuZXhwb3J0IGNvbnN0IFJFRl9TRUxFQ1RPUiA9ICdSRUZfU0VMRUNUT1InXG5leHBvcnQgY29uc3QgRE9NX1NFTEVDVE9SID0gJ0RPTV9TRUxFQ1RPUidcbmV4cG9ydCBjb25zdCBJTlZBTElEX1NFTEVDVE9SID0gJ0lOVkFMSURfU0VMRUNUT1InXG5cbmV4cG9ydCBjb25zdCBWVUVfVkVSU0lPTiA9IE51bWJlcihcbiAgYCR7VnVlLnZlcnNpb24uc3BsaXQoJy4nKVswXX0uJHtWdWUudmVyc2lvbi5zcGxpdCgnLicpWzFdfWBcbilcblxuZXhwb3J0IGNvbnN0IEZVTkNUSU9OQUxfT1BUSU9OUyA9XG4gIFZVRV9WRVJTSU9OID49IDIuNSA/ICdmbk9wdGlvbnMnIDogJ2Z1bmN0aW9uYWxPcHRpb25zJ1xuXG5leHBvcnQgY29uc3QgQkVGT1JFX1JFTkRFUl9MSUZFQ1lDTEVfSE9PSyA9XG4gIHNlbXZlci5ndChWdWUudmVyc2lvbiwgJzIuMS44JylcbiAgICA/ICdiZWZvcmVDcmVhdGUnXG4gICAgOiAnYmVmb3JlTW91bnQnXG5cbmV4cG9ydCBjb25zdCBDUkVBVEVfRUxFTUVOVF9BTElBUyA9IHNlbXZlci5ndChWdWUudmVyc2lvbiwgJzIuMS41JylcbiAgPyAnX2MnXG4gIDogJ19oJ1xuIiwiaW1wb3J0IHsgQkVGT1JFX1JFTkRFUl9MSUZFQ1lDTEVfSE9PSyB9IGZyb20gJ3NoYXJlZC9jb25zdHMnXG5cbmV4cG9ydCBmdW5jdGlvbiBhZGRTdHVicyAoX1Z1ZSwgc3R1YkNvbXBvbmVudHMpIHtcbiAgZnVuY3Rpb24gYWRkU3R1YkNvbXBvbmVudHNNaXhpbiAoKSB7XG4gICAgT2JqZWN0LmFzc2lnbih0aGlzLiRvcHRpb25zLmNvbXBvbmVudHMsIHN0dWJDb21wb25lbnRzKVxuICB9XG5cbiAgX1Z1ZS5taXhpbih7XG4gICAgW0JFRk9SRV9SRU5ERVJfTElGRUNZQ0xFX0hPT0tdOiBhZGRTdHViQ29tcG9uZW50c01peGluXG4gIH0pXG59XG4iLCIvLyBAZmxvd1xuaW1wb3J0IHsgdGhyb3dFcnJvciwgY2FwaXRhbGl6ZSwgY2FtZWxpemUsIGh5cGhlbmF0ZSB9IGZyb20gJy4vdXRpbCdcblxuZXhwb3J0IGZ1bmN0aW9uIGlzRG9tU2VsZWN0b3IgKHNlbGVjdG9yOiBhbnkpOiBib29sZWFuIHtcbiAgaWYgKHR5cGVvZiBzZWxlY3RvciAhPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIHRyeSB7XG4gICAgaWYgKHR5cGVvZiBkb2N1bWVudCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRocm93RXJyb3IoXG4gICAgICAgIGBtb3VudCBtdXN0IGJlIHJ1biBpbiBhIGJyb3dzZXIgZW52aXJvbm1lbnQgbGlrZSBgICtcbiAgICAgICAgICBgUGhhbnRvbUpTLCBqc2RvbSBvciBjaHJvbWVgXG4gICAgICApXG4gICAgfVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHRocm93RXJyb3IoXG4gICAgICBgbW91bnQgbXVzdCBiZSBydW4gaW4gYSBicm93c2VyIGVudmlyb25tZW50IGxpa2UgYCArXG4gICAgICAgIGBQaGFudG9tSlMsIGpzZG9tIG9yIGNocm9tZWBcbiAgICApXG4gIH1cblxuICB0cnkge1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpXG4gICAgcmV0dXJuIHRydWVcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNWdWVDb21wb25lbnQgKGM6IGFueSk6IGJvb2xlYW4ge1xuICBpZiAoaXNDb25zdHJ1Y3RvcihjKSkge1xuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICBpZiAoYyA9PT0gbnVsbCB8fCB0eXBlb2YgYyAhPT0gJ29iamVjdCcpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIGlmIChjLmV4dGVuZHMgfHwgYy5fQ3Rvcikge1xuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICBpZiAodHlwZW9mIGMudGVtcGxhdGUgPT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIHJldHVybiB0eXBlb2YgYy5yZW5kZXIgPT09ICdmdW5jdGlvbidcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbXBvbmVudE5lZWRzQ29tcGlsaW5nIChjb21wb25lbnQ6IENvbXBvbmVudCk6IGJvb2xlYW4ge1xuICByZXR1cm4gKFxuICAgIGNvbXBvbmVudCAmJlxuICAgICFjb21wb25lbnQucmVuZGVyICYmXG4gICAgKGNvbXBvbmVudC50ZW1wbGF0ZSB8fCBjb21wb25lbnQuZXh0ZW5kcyB8fCBjb21wb25lbnQuZXh0ZW5kT3B0aW9ucykgJiZcbiAgICAhY29tcG9uZW50LmZ1bmN0aW9uYWxcbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNSZWZTZWxlY3RvciAocmVmT3B0aW9uc09iamVjdDogYW55KTogYm9vbGVhbiB7XG4gIGlmIChcbiAgICB0eXBlb2YgcmVmT3B0aW9uc09iamVjdCAhPT0gJ29iamVjdCcgfHxcbiAgICBPYmplY3Qua2V5cyhyZWZPcHRpb25zT2JqZWN0IHx8IHt9KS5sZW5ndGggIT09IDFcbiAgKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICByZXR1cm4gdHlwZW9mIHJlZk9wdGlvbnNPYmplY3QucmVmID09PSAnc3RyaW5nJ1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNOYW1lU2VsZWN0b3IgKG5hbWVPcHRpb25zT2JqZWN0OiBhbnkpOiBib29sZWFuIHtcbiAgaWYgKHR5cGVvZiBuYW1lT3B0aW9uc09iamVjdCAhPT0gJ29iamVjdCcgfHwgbmFtZU9wdGlvbnNPYmplY3QgPT09IG51bGwpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIHJldHVybiAhIW5hbWVPcHRpb25zT2JqZWN0Lm5hbWVcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzQ29uc3RydWN0b3IgKGM6IGFueSkge1xuICByZXR1cm4gdHlwZW9mIGMgPT09ICdmdW5jdGlvbicgJiYgYy5jaWRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRHluYW1pY0NvbXBvbmVudCAoYzogYW55KSB7XG4gIHJldHVybiB0eXBlb2YgYyA9PT0gJ2Z1bmN0aW9uJyAmJiAhYy5jaWRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzQ29tcG9uZW50T3B0aW9ucyAoYzogYW55KSB7XG4gIHJldHVybiB0eXBlb2YgYyA9PT0gJ29iamVjdCcgJiYgKGMudGVtcGxhdGUgfHwgYy5yZW5kZXIpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0Z1bmN0aW9uYWxDb21wb25lbnQgKGM6IGFueSkge1xuICBpZiAoIWlzVnVlQ29tcG9uZW50KGMpKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbiAgaWYgKGlzQ29uc3RydWN0b3IoYykpIHtcbiAgICByZXR1cm4gYy5vcHRpb25zLmZ1bmN0aW9uYWxcbiAgfVxuICByZXR1cm4gYy5mdW5jdGlvbmFsXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0ZW1wbGF0ZUNvbnRhaW5zQ29tcG9uZW50IChcbiAgdGVtcGxhdGU6IHN0cmluZyxcbiAgbmFtZTogc3RyaW5nXG4pOiBib29sZWFuIHtcbiAgcmV0dXJuIFtjYXBpdGFsaXplLCBjYW1lbGl6ZSwgaHlwaGVuYXRlXS5zb21lKGZvcm1hdCA9PiB7XG4gICAgY29uc3QgcmUgPSBuZXcgUmVnRXhwKGA8JHtmb3JtYXQobmFtZSl9XFxcXHMqKFxcXFxzfD58KFxcLz4pKWAsICdnJylcbiAgICByZXR1cm4gcmUudGVzdCh0ZW1wbGF0ZSlcbiAgfSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUGxhaW5PYmplY3QgKGM6IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGMpID09PSAnW29iamVjdCBPYmplY3RdJ1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNSZXF1aXJlZENvbXBvbmVudCAobmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiAoXG4gICAgbmFtZSA9PT0gJ0tlZXBBbGl2ZScgfHwgbmFtZSA9PT0gJ1RyYW5zaXRpb24nIHx8IG5hbWUgPT09ICdUcmFuc2l0aW9uR3JvdXAnXG4gIClcbn1cblxuZnVuY3Rpb24gbWFrZU1hcCAoXG4gIHN0cjogc3RyaW5nLFxuICBleHBlY3RzTG93ZXJDYXNlPzogYm9vbGVhblxuKSB7XG4gIHZhciBtYXAgPSBPYmplY3QuY3JlYXRlKG51bGwpXG4gIHZhciBsaXN0ID0gc3RyLnNwbGl0KCcsJylcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgbWFwW2xpc3RbaV1dID0gdHJ1ZVxuICB9XG4gIHJldHVybiBleHBlY3RzTG93ZXJDYXNlXG4gICAgPyBmdW5jdGlvbiAodmFsOiBzdHJpbmcpIHsgcmV0dXJuIG1hcFt2YWwudG9Mb3dlckNhc2UoKV0gfVxuICAgIDogZnVuY3Rpb24gKHZhbDogc3RyaW5nKSB7IHJldHVybiBtYXBbdmFsXSB9XG59XG5cbmV4cG9ydCBjb25zdCBpc0hUTUxUYWcgPSBtYWtlTWFwKFxuICAnaHRtbCxib2R5LGJhc2UsaGVhZCxsaW5rLG1ldGEsc3R5bGUsdGl0bGUsJyArXG4gICdhZGRyZXNzLGFydGljbGUsYXNpZGUsZm9vdGVyLGhlYWRlcixoMSxoMixoMyxoNCxoNSxoNixoZ3JvdXAsbmF2LHNlY3Rpb24sJyArXG4gICdkaXYsZGQsZGwsZHQsZmlnY2FwdGlvbixmaWd1cmUscGljdHVyZSxocixpbWcsbGksbWFpbixvbCxwLHByZSx1bCwnICtcbiAgJ2EsYixhYmJyLGJkaSxiZG8sYnIsY2l0ZSxjb2RlLGRhdGEsZGZuLGVtLGksa2JkLG1hcmsscSxycCxydCxydGMscnVieSwnICtcbiAgJ3Msc2FtcCxzbWFsbCxzcGFuLHN0cm9uZyxzdWIsc3VwLHRpbWUsdSx2YXIsd2JyLGFyZWEsYXVkaW8sbWFwLHRyYWNrLCcgK1xuICAnZW1iZWQsb2JqZWN0LHBhcmFtLHNvdXJjZSxjYW52YXMsc2NyaXB0LG5vc2NyaXB0LGRlbCxpbnMsJyArXG4gICdjYXB0aW9uLGNvbCxjb2xncm91cCx0YWJsZSx0aGVhZCx0Ym9keSx0ZCx0aCx0cix2aWRlbywnICtcbiAgJ2J1dHRvbixkYXRhbGlzdCxmaWVsZHNldCxmb3JtLGlucHV0LGxhYmVsLGxlZ2VuZCxtZXRlcixvcHRncm91cCxvcHRpb24sJyArXG4gICdvdXRwdXQscHJvZ3Jlc3Msc2VsZWN0LHRleHRhcmVhLCcgK1xuICAnZGV0YWlscyxkaWFsb2csbWVudSxtZW51aXRlbSxzdW1tYXJ5LCcgK1xuICAnY29udGVudCxlbGVtZW50LHNoYWRvdyx0ZW1wbGF0ZSxibG9ja3F1b3RlLGlmcmFtZSx0Zm9vdCdcbilcblxuLy8gdGhpcyBtYXAgaXMgaW50ZW50aW9uYWxseSBzZWxlY3RpdmUsIG9ubHkgY292ZXJpbmcgU1ZHIGVsZW1lbnRzIHRoYXQgbWF5XG4vLyBjb250YWluIGNoaWxkIGVsZW1lbnRzLlxuZXhwb3J0IGNvbnN0IGlzU1ZHID0gbWFrZU1hcChcbiAgJ3N2ZyxhbmltYXRlLGNpcmNsZSxjbGlwcGF0aCxjdXJzb3IsZGVmcyxkZXNjLGVsbGlwc2UsZmlsdGVyLGZvbnQtZmFjZSwnICtcbiAgJ2ZvcmVpZ25PYmplY3QsZyxnbHlwaCxpbWFnZSxsaW5lLG1hcmtlcixtYXNrLG1pc3NpbmctZ2x5cGgscGF0aCxwYXR0ZXJuLCcgK1xuICAncG9seWdvbixwb2x5bGluZSxyZWN0LHN3aXRjaCxzeW1ib2wsdGV4dCx0ZXh0cGF0aCx0c3Bhbix1c2UsdmlldycsXG4gIHRydWVcbilcblxuZXhwb3J0IGNvbnN0IGlzUmVzZXJ2ZWRUYWcgPSAodGFnOiBzdHJpbmcpID0+IGlzSFRNTFRhZyh0YWcpIHx8IGlzU1ZHKHRhZylcbiIsIi8vIEBmbG93XG5cbmltcG9ydCB7IGNvbXBpbGVUb0Z1bmN0aW9ucyB9IGZyb20gJ3Z1ZS10ZW1wbGF0ZS1jb21waWxlcidcbmltcG9ydCB7IGNvbXBvbmVudE5lZWRzQ29tcGlsaW5nIH0gZnJvbSAnLi92YWxpZGF0b3JzJ1xuaW1wb3J0IHsgdGhyb3dFcnJvciB9IGZyb20gJy4vdXRpbCdcblxuZXhwb3J0IGZ1bmN0aW9uIGNvbXBpbGVGcm9tU3RyaW5nIChzdHI6IHN0cmluZykge1xuICBpZiAoIWNvbXBpbGVUb0Z1bmN0aW9ucykge1xuICAgIHRocm93RXJyb3IoXG4gICAgICBgdnVlVGVtcGxhdGVDb21waWxlciBpcyB1bmRlZmluZWQsIHlvdSBtdXN0IHBhc3MgYCArXG4gICAgICAgIGBwcmVjb21waWxlZCBjb21wb25lbnRzIGlmIHZ1ZS10ZW1wbGF0ZS1jb21waWxlciBpcyBgICtcbiAgICAgICAgYHVuZGVmaW5lZGBcbiAgICApXG4gIH1cbiAgcmV0dXJuIGNvbXBpbGVUb0Z1bmN0aW9ucyhzdHIpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb21waWxlVGVtcGxhdGUgKGNvbXBvbmVudDogQ29tcG9uZW50KTogdm9pZCB7XG4gIGlmIChjb21wb25lbnQudGVtcGxhdGUpIHtcbiAgICBPYmplY3QuYXNzaWduKGNvbXBvbmVudCwgY29tcGlsZVRvRnVuY3Rpb25zKGNvbXBvbmVudC50ZW1wbGF0ZSkpXG4gIH1cblxuICBpZiAoY29tcG9uZW50LmNvbXBvbmVudHMpIHtcbiAgICBPYmplY3Qua2V5cyhjb21wb25lbnQuY29tcG9uZW50cykuZm9yRWFjaChjID0+IHtcbiAgICAgIGNvbnN0IGNtcCA9IGNvbXBvbmVudC5jb21wb25lbnRzW2NdXG4gICAgICBpZiAoIWNtcC5yZW5kZXIpIHtcbiAgICAgICAgY29tcGlsZVRlbXBsYXRlKGNtcClcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgaWYgKGNvbXBvbmVudC5leHRlbmRzKSB7XG4gICAgY29tcGlsZVRlbXBsYXRlKGNvbXBvbmVudC5leHRlbmRzKVxuICB9XG5cbiAgaWYgKGNvbXBvbmVudC5leHRlbmRPcHRpb25zICYmICFjb21wb25lbnQub3B0aW9ucy5yZW5kZXIpIHtcbiAgICBjb21waWxlVGVtcGxhdGUoY29tcG9uZW50Lm9wdGlvbnMpXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbXBpbGVUZW1wbGF0ZUZvclNsb3RzIChzbG90czogT2JqZWN0KTogdm9pZCB7XG4gIE9iamVjdC5rZXlzKHNsb3RzKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgY29uc3Qgc2xvdCA9IEFycmF5LmlzQXJyYXkoc2xvdHNba2V5XSkgPyBzbG90c1trZXldIDogW3Nsb3RzW2tleV1dXG4gICAgc2xvdC5mb3JFYWNoKHNsb3RWYWx1ZSA9PiB7XG4gICAgICBpZiAoY29tcG9uZW50TmVlZHNDb21waWxpbmcoc2xvdFZhbHVlKSkge1xuICAgICAgICBjb21waWxlVGVtcGxhdGUoc2xvdFZhbHVlKVxuICAgICAgfVxuICAgIH0pXG4gIH0pXG59XG4iLCIvLyBAZmxvd1xuXG5jb25zdCBNT1VOVElOR19PUFRJT05TID0gW1xuICAnYXR0YWNoVG9Eb2N1bWVudCcsXG4gICdtb2NrcycsXG4gICdzbG90cycsXG4gICdsb2NhbFZ1ZScsXG4gICdzdHVicycsXG4gICdjb250ZXh0JyxcbiAgJ2Nsb25lJyxcbiAgJ2F0dHJzJyxcbiAgJ2xpc3RlbmVycycsXG4gICdwcm9wc0RhdGEnLFxuICAnbG9nTW9kaWZpZWRDb21wb25lbnRzJyxcbiAgJ3N5bmMnLFxuICAnc2hvdWxkUHJveHknXG5dXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGV4dHJhY3RJbnN0YW5jZU9wdGlvbnMgKFxuICBvcHRpb25zOiBPYmplY3Rcbik6IE9iamVjdCB7XG4gIGNvbnN0IGluc3RhbmNlT3B0aW9ucyA9IHtcbiAgICAuLi5vcHRpb25zXG4gIH1cbiAgTU9VTlRJTkdfT1BUSU9OUy5mb3JFYWNoKG1vdW50aW5nT3B0aW9uID0+IHtcbiAgICBkZWxldGUgaW5zdGFuY2VPcHRpb25zW21vdW50aW5nT3B0aW9uXVxuICB9KVxuICByZXR1cm4gaW5zdGFuY2VPcHRpb25zXG59XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgeyBjb21waWxlVG9GdW5jdGlvbnMgfSBmcm9tICd2dWUtdGVtcGxhdGUtY29tcGlsZXInXG5pbXBvcnQgeyB0aHJvd0Vycm9yIH0gZnJvbSAnc2hhcmVkL3V0aWwnXG5pbXBvcnQgeyBWVUVfVkVSU0lPTiB9IGZyb20gJ3NoYXJlZC9jb25zdHMnXG5cbmZ1bmN0aW9uIGlzRGVzdHJ1Y3R1cmluZ1Nsb3RTY29wZSAoc2xvdFNjb3BlOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIHNsb3RTY29wZVswXSA9PT0gJ3snICYmIHNsb3RTY29wZVtzbG90U2NvcGUubGVuZ3RoIC0gMV0gPT09ICd9J1xufVxuXG5mdW5jdGlvbiBnZXRWdWVUZW1wbGF0ZUNvbXBpbGVySGVscGVycyAoXG4gIF9WdWU6IENvbXBvbmVudFxuKTogeyBbbmFtZTogc3RyaW5nXTogRnVuY3Rpb24gfSB7XG4gIC8vICRGbG93SWdub3JlXG4gIGNvbnN0IHZ1ZSA9IG5ldyBfVnVlKClcbiAgY29uc3QgaGVscGVycyA9IHt9XG4gIGNvbnN0IG5hbWVzID0gW1xuICAgICdfYycsXG4gICAgJ19vJyxcbiAgICAnX24nLFxuICAgICdfcycsXG4gICAgJ19sJyxcbiAgICAnX3QnLFxuICAgICdfcScsXG4gICAgJ19pJyxcbiAgICAnX20nLFxuICAgICdfZicsXG4gICAgJ19rJyxcbiAgICAnX2InLFxuICAgICdfdicsXG4gICAgJ19lJyxcbiAgICAnX3UnLFxuICAgICdfZydcbiAgXVxuICBuYW1lcy5mb3JFYWNoKG5hbWUgPT4ge1xuICAgIGhlbHBlcnNbbmFtZV0gPSB2dWUuX3JlbmRlclByb3h5W25hbWVdXG4gIH0pXG4gIGhlbHBlcnMuJGNyZWF0ZUVsZW1lbnQgPSB2dWUuX3JlbmRlclByb3h5LiRjcmVhdGVFbGVtZW50XG4gIHJldHVybiBoZWxwZXJzXG59XG5cbmZ1bmN0aW9uIHZhbGlkYXRlRW52aXJvbm1lbnQgKCk6IHZvaWQge1xuICBpZiAoVlVFX1ZFUlNJT04gPCAyLjEpIHtcbiAgICB0aHJvd0Vycm9yKGB0aGUgc2NvcGVkU2xvdHMgb3B0aW9uIGlzIG9ubHkgc3VwcG9ydGVkIGluIHZ1ZUAyLjErLmApXG4gIH1cbn1cblxuY29uc3Qgc2xvdFNjb3BlUmUgPSAvPFtePl0rIHNsb3Qtc2NvcGU9XFxcIiguKylcXFwiL1xuXG4vLyBIaWRlIHdhcm5pbmcgYWJvdXQgPHRlbXBsYXRlPiBkaXNhbGxvd2VkIGFzIHJvb3QgZWxlbWVudFxuZnVuY3Rpb24gY3VzdG9tV2FybiAobXNnKSB7XG4gIGlmIChtc2cuaW5kZXhPZignQ2Fubm90IHVzZSA8dGVtcGxhdGU+IGFzIGNvbXBvbmVudCByb290IGVsZW1lbnQnKSA9PT0gLTEpIHtcbiAgICBjb25zb2xlLmVycm9yKG1zZylcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjcmVhdGVTY29wZWRTbG90cyAoXG4gIHNjb3BlZFNsb3RzT3B0aW9uOiA/eyBbc2xvdE5hbWU6IHN0cmluZ106IHN0cmluZyB8IEZ1bmN0aW9uIH0sXG4gIF9WdWU6IENvbXBvbmVudFxuKToge1xuICBbc2xvdE5hbWU6IHN0cmluZ106IChwcm9wczogT2JqZWN0KSA9PiBWTm9kZSB8IEFycmF5PFZOb2RlPlxufSB7XG4gIGNvbnN0IHNjb3BlZFNsb3RzID0ge31cbiAgaWYgKCFzY29wZWRTbG90c09wdGlvbikge1xuICAgIHJldHVybiBzY29wZWRTbG90c1xuICB9XG4gIHZhbGlkYXRlRW52aXJvbm1lbnQoKVxuICBjb25zdCBoZWxwZXJzID0gZ2V0VnVlVGVtcGxhdGVDb21waWxlckhlbHBlcnMoX1Z1ZSlcbiAgZm9yIChjb25zdCBzY29wZWRTbG90TmFtZSBpbiBzY29wZWRTbG90c09wdGlvbikge1xuICAgIGNvbnN0IHNsb3QgPSBzY29wZWRTbG90c09wdGlvbltzY29wZWRTbG90TmFtZV1cbiAgICBjb25zdCBpc0ZuID0gdHlwZW9mIHNsb3QgPT09ICdmdW5jdGlvbidcbiAgICAvLyBUeXBlIGNoZWNrIHRvIHNpbGVuY2UgZmxvdyAoY2FuJ3QgdXNlIGlzRm4pXG4gICAgY29uc3QgcmVuZGVyRm4gPSB0eXBlb2Ygc2xvdCA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgPyBzbG90XG4gICAgICA6IGNvbXBpbGVUb0Z1bmN0aW9ucyhzbG90LCB7IHdhcm46IGN1c3RvbVdhcm4gfSkucmVuZGVyXG5cbiAgICBjb25zdCBoYXNTbG90U2NvcGVBdHRyID0gIWlzRm4gJiYgc2xvdC5tYXRjaChzbG90U2NvcGVSZSlcbiAgICBjb25zdCBzbG90U2NvcGUgPSBoYXNTbG90U2NvcGVBdHRyICYmIGhhc1Nsb3RTY29wZUF0dHJbMV1cbiAgICBzY29wZWRTbG90c1tzY29wZWRTbG90TmFtZV0gPSBmdW5jdGlvbiAocHJvcHMpIHtcbiAgICAgIGxldCByZXNcbiAgICAgIGlmIChpc0ZuKSB7XG4gICAgICAgIHJlcyA9IHJlbmRlckZuLmNhbGwoeyAuLi5oZWxwZXJzIH0sIHByb3BzKVxuICAgICAgfSBlbHNlIGlmIChzbG90U2NvcGUgJiYgIWlzRGVzdHJ1Y3R1cmluZ1Nsb3RTY29wZShzbG90U2NvcGUpKSB7XG4gICAgICAgIHJlcyA9IHJlbmRlckZuLmNhbGwoeyAuLi5oZWxwZXJzLCBbc2xvdFNjb3BlXTogcHJvcHMgfSlcbiAgICAgIH0gZWxzZSBpZiAoc2xvdFNjb3BlICYmIGlzRGVzdHJ1Y3R1cmluZ1Nsb3RTY29wZShzbG90U2NvcGUpKSB7XG4gICAgICAgIHJlcyA9IHJlbmRlckZuLmNhbGwoeyAuLi5oZWxwZXJzLCAuLi5wcm9wcyB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzID0gcmVuZGVyRm4uY2FsbCh7IC4uLmhlbHBlcnMsIHByb3BzIH0pXG4gICAgICB9XG4gICAgICAvLyByZXMgaXMgQXJyYXkgaWYgPHRlbXBsYXRlPiBpcyBhIHJvb3QgZWxlbWVudFxuICAgICAgcmV0dXJuIEFycmF5LmlzQXJyYXkocmVzKSA/IHJlc1swXSA6IHJlc1xuICAgIH1cbiAgfVxuICByZXR1cm4gc2NvcGVkU2xvdHNcbn1cbiIsIi8vIEBmbG93XG5cbmltcG9ydCBWdWUgZnJvbSAndnVlJ1xuaW1wb3J0IHtcbiAgdGhyb3dFcnJvcixcbiAgY2FtZWxpemUsXG4gIGNhcGl0YWxpemUsXG4gIGh5cGhlbmF0ZVxufSBmcm9tICcuLi9zaGFyZWQvdXRpbCdcbmltcG9ydCB7XG4gIGNvbXBvbmVudE5lZWRzQ29tcGlsaW5nLFxuICB0ZW1wbGF0ZUNvbnRhaW5zQ29tcG9uZW50LFxuICBpc1Z1ZUNvbXBvbmVudCxcbiAgaXNEeW5hbWljQ29tcG9uZW50LFxuICBpc0NvbnN0cnVjdG9yXG59IGZyb20gJy4uL3NoYXJlZC92YWxpZGF0b3JzJ1xuaW1wb3J0IHtcbiAgY29tcGlsZVRlbXBsYXRlLFxuICBjb21waWxlRnJvbVN0cmluZ1xufSBmcm9tICcuLi9zaGFyZWQvY29tcGlsZS10ZW1wbGF0ZSdcblxuZnVuY3Rpb24gaXNWdWVDb21wb25lbnRTdHViIChjb21wKTogYm9vbGVhbiB7XG4gIHJldHVybiBjb21wICYmIGNvbXAudGVtcGxhdGUgfHwgaXNWdWVDb21wb25lbnQoY29tcClcbn1cblxuZnVuY3Rpb24gaXNWYWxpZFN0dWIgKHN0dWI6IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gKFxuICAgIHR5cGVvZiBzdHViID09PSAnYm9vbGVhbicgfHxcbiAgICAoISFzdHViICYmIHR5cGVvZiBzdHViID09PSAnc3RyaW5nJykgfHxcbiAgICBpc1Z1ZUNvbXBvbmVudFN0dWIoc3R1YilcbiAgKVxufVxuXG5mdW5jdGlvbiByZXNvbHZlQ29tcG9uZW50IChvYmo6IE9iamVjdCwgY29tcG9uZW50OiBzdHJpbmcpOiBPYmplY3Qge1xuICByZXR1cm4gb2JqW2NvbXBvbmVudF0gfHxcbiAgICBvYmpbaHlwaGVuYXRlKGNvbXBvbmVudCldIHx8XG4gICAgb2JqW2NhbWVsaXplKGNvbXBvbmVudCldIHx8XG4gICAgb2JqW2NhcGl0YWxpemUoY2FtZWxpemUoY29tcG9uZW50KSldIHx8XG4gICAgb2JqW2NhcGl0YWxpemUoY29tcG9uZW50KV0gfHxcbiAgICB7fVxufVxuXG5mdW5jdGlvbiBnZXRDb3JlUHJvcGVydGllcyAoY29tcG9uZW50T3B0aW9uczogQ29tcG9uZW50KTogT2JqZWN0IHtcbiAgcmV0dXJuIHtcbiAgICBhdHRyczogY29tcG9uZW50T3B0aW9ucy5hdHRycyxcbiAgICBuYW1lOiBjb21wb25lbnRPcHRpb25zLm5hbWUsXG4gICAgcHJvcHM6IGNvbXBvbmVudE9wdGlvbnMucHJvcHMsXG4gICAgb246IGNvbXBvbmVudE9wdGlvbnMub24sXG4gICAga2V5OiBjb21wb25lbnRPcHRpb25zLmtleSxcbiAgICByZWY6IGNvbXBvbmVudE9wdGlvbnMucmVmLFxuICAgIGRvbVByb3BzOiBjb21wb25lbnRPcHRpb25zLmRvbVByb3BzLFxuICAgIGNsYXNzOiBjb21wb25lbnRPcHRpb25zLmNsYXNzLFxuICAgIHN0YXRpY0NsYXNzOiBjb21wb25lbnRPcHRpb25zLnN0YXRpY0NsYXNzLFxuICAgIHN0YXRpY1N0eWxlOiBjb21wb25lbnRPcHRpb25zLnN0YXRpY1N0eWxlLFxuICAgIHN0eWxlOiBjb21wb25lbnRPcHRpb25zLnN0eWxlLFxuICAgIG5vcm1hbGl6ZWRTdHlsZTogY29tcG9uZW50T3B0aW9ucy5ub3JtYWxpemVkU3R5bGUsXG4gICAgbmF0aXZlT246IGNvbXBvbmVudE9wdGlvbnMubmF0aXZlT24sXG4gICAgZnVuY3Rpb25hbDogY29tcG9uZW50T3B0aW9ucy5mdW5jdGlvbmFsXG4gIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlQ2xhc3NTdHJpbmcgKHN0YXRpY0NsYXNzLCBkeW5hbWljQ2xhc3MpIHtcbiAgaWYgKHN0YXRpY0NsYXNzICYmIGR5bmFtaWNDbGFzcykge1xuICAgIHJldHVybiBzdGF0aWNDbGFzcyArICcgJyArIGR5bmFtaWNDbGFzc1xuICB9XG4gIHJldHVybiBzdGF0aWNDbGFzcyB8fCBkeW5hbWljQ2xhc3Ncbn1cblxuZnVuY3Rpb24gcmVzb2x2ZU9wdGlvbnMgKGNvbXBvbmVudCwgX1Z1ZSkge1xuICBpZiAoaXNEeW5hbWljQ29tcG9uZW50KGNvbXBvbmVudCkpIHtcbiAgICByZXR1cm4ge31cbiAgfVxuXG4gIHJldHVybiBpc0NvbnN0cnVjdG9yKGNvbXBvbmVudClcbiAgICA/IGNvbXBvbmVudC5vcHRpb25zXG4gICAgOiBfVnVlLmV4dGVuZChjb21wb25lbnQpLm9wdGlvbnNcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVN0dWJGcm9tQ29tcG9uZW50IChcbiAgb3JpZ2luYWxDb21wb25lbnQ6IENvbXBvbmVudCxcbiAgbmFtZTogc3RyaW5nLFxuICBfVnVlOiBDb21wb25lbnRcbik6IENvbXBvbmVudCB7XG4gIGNvbnN0IGNvbXBvbmVudE9wdGlvbnMgPSByZXNvbHZlT3B0aW9ucyhvcmlnaW5hbENvbXBvbmVudCwgX1Z1ZSlcbiAgY29uc3QgdGFnTmFtZSA9IGAke25hbWUgfHwgJ2Fub255bW91cyd9LXN0dWJgXG5cbiAgLy8gaWdub3JlRWxlbWVudHMgZG9lcyBub3QgZXhpc3QgaW4gVnVlIDIuMC54XG4gIGlmIChWdWUuY29uZmlnLmlnbm9yZWRFbGVtZW50cykge1xuICAgIFZ1ZS5jb25maWcuaWdub3JlZEVsZW1lbnRzLnB1c2godGFnTmFtZSlcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgLi4uZ2V0Q29yZVByb3BlcnRpZXMoY29tcG9uZW50T3B0aW9ucyksXG4gICAgJF92dWVUZXN0VXRpbHNfb3JpZ2luYWw6IG9yaWdpbmFsQ29tcG9uZW50LFxuICAgICRfZG9Ob3RTdHViQ2hpbGRyZW46IHRydWUsXG4gICAgcmVuZGVyIChoLCBjb250ZXh0KSB7XG4gICAgICByZXR1cm4gaChcbiAgICAgICAgdGFnTmFtZSxcbiAgICAgICAge1xuICAgICAgICAgIGF0dHJzOiBjb21wb25lbnRPcHRpb25zLmZ1bmN0aW9uYWwgPyB7XG4gICAgICAgICAgICAuLi5jb250ZXh0LnByb3BzLFxuICAgICAgICAgICAgLi4uY29udGV4dC5kYXRhLmF0dHJzLFxuICAgICAgICAgICAgY2xhc3M6IGNyZWF0ZUNsYXNzU3RyaW5nKFxuICAgICAgICAgICAgICBjb250ZXh0LmRhdGEuc3RhdGljQ2xhc3MsXG4gICAgICAgICAgICAgIGNvbnRleHQuZGF0YS5jbGFzc1xuICAgICAgICAgICAgKVxuICAgICAgICAgIH0gOiB7XG4gICAgICAgICAgICAuLi50aGlzLiRwcm9wc1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgY29udGV4dCA/IGNvbnRleHQuY2hpbGRyZW4gOiB0aGlzLiRvcHRpb25zLl9yZW5kZXJDaGlsZHJlblxuICAgICAgKVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVTdHViRnJvbVN0cmluZyAoXG4gIHRlbXBsYXRlU3RyaW5nOiBzdHJpbmcsXG4gIG9yaWdpbmFsQ29tcG9uZW50OiBDb21wb25lbnQgPSB7fSxcbiAgbmFtZTogc3RyaW5nLFxuICBfVnVlOiBDb21wb25lbnRcbik6IENvbXBvbmVudCB7XG4gIGlmICh0ZW1wbGF0ZUNvbnRhaW5zQ29tcG9uZW50KHRlbXBsYXRlU3RyaW5nLCBuYW1lKSkge1xuICAgIHRocm93RXJyb3IoJ29wdGlvbnMuc3R1YiBjYW5ub3QgY29udGFpbiBhIGNpcmN1bGFyIHJlZmVyZW5jZScpXG4gIH1cbiAgY29uc3QgY29tcG9uZW50T3B0aW9ucyA9IHJlc29sdmVPcHRpb25zKG9yaWdpbmFsQ29tcG9uZW50LCBfVnVlKVxuXG4gIHJldHVybiB7XG4gICAgLi4uZ2V0Q29yZVByb3BlcnRpZXMoY29tcG9uZW50T3B0aW9ucyksXG4gICAgJF9kb05vdFN0dWJDaGlsZHJlbjogdHJ1ZSxcbiAgICAuLi5jb21waWxlRnJvbVN0cmluZyh0ZW1wbGF0ZVN0cmluZylcbiAgfVxufVxuXG5mdW5jdGlvbiB2YWxpZGF0ZVN0dWIgKHN0dWIpIHtcbiAgaWYgKCFpc1ZhbGlkU3R1YihzdHViKSkge1xuICAgIHRocm93RXJyb3IoXG4gICAgICBgb3B0aW9ucy5zdHViIHZhbHVlcyBtdXN0IGJlIHBhc3NlZCBhIHN0cmluZyBvciBgICtcbiAgICAgIGBjb21wb25lbnRgXG4gICAgKVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTdHVic0Zyb21TdHVic09iamVjdCAoXG4gIG9yaWdpbmFsQ29tcG9uZW50czogT2JqZWN0ID0ge30sXG4gIHN0dWJzOiBPYmplY3QsXG4gIF9WdWU6IENvbXBvbmVudFxuKTogQ29tcG9uZW50cyB7XG4gIHJldHVybiBPYmplY3Qua2V5cyhzdHVicyB8fCB7fSkucmVkdWNlKChhY2MsIHN0dWJOYW1lKSA9PiB7XG4gICAgY29uc3Qgc3R1YiA9IHN0dWJzW3N0dWJOYW1lXVxuXG4gICAgdmFsaWRhdGVTdHViKHN0dWIpXG5cbiAgICBpZiAoc3R1YiA9PT0gZmFsc2UpIHtcbiAgICAgIHJldHVybiBhY2NcbiAgICB9XG5cbiAgICBpZiAoc3R1YiA9PT0gdHJ1ZSkge1xuICAgICAgY29uc3QgY29tcG9uZW50ID0gcmVzb2x2ZUNvbXBvbmVudChvcmlnaW5hbENvbXBvbmVudHMsIHN0dWJOYW1lKVxuICAgICAgYWNjW3N0dWJOYW1lXSA9IGNyZWF0ZVN0dWJGcm9tQ29tcG9uZW50KGNvbXBvbmVudCwgc3R1Yk5hbWUsIF9WdWUpXG4gICAgICByZXR1cm4gYWNjXG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBzdHViID09PSAnc3RyaW5nJykge1xuICAgICAgY29uc3QgY29tcG9uZW50ID0gcmVzb2x2ZUNvbXBvbmVudChvcmlnaW5hbENvbXBvbmVudHMsIHN0dWJOYW1lKVxuICAgICAgYWNjW3N0dWJOYW1lXSA9IGNyZWF0ZVN0dWJGcm9tU3RyaW5nKFxuICAgICAgICBzdHViLFxuICAgICAgICBjb21wb25lbnQsXG4gICAgICAgIHN0dWJOYW1lLFxuICAgICAgICBfVnVlXG4gICAgICApXG4gICAgICByZXR1cm4gYWNjXG4gICAgfVxuXG4gICAgaWYgKGNvbXBvbmVudE5lZWRzQ29tcGlsaW5nKHN0dWIpKSB7XG4gICAgICBjb21waWxlVGVtcGxhdGUoc3R1YilcbiAgICB9XG5cbiAgICBhY2Nbc3R1Yk5hbWVdID0gc3R1YlxuXG4gICAgcmV0dXJuIGFjY1xuICB9LCB7fSlcbn1cbiIsImltcG9ydCB7IGNyZWF0ZVN0dWJGcm9tQ29tcG9uZW50IH0gZnJvbSAnLi9jcmVhdGUtY29tcG9uZW50LXN0dWJzJ1xuaW1wb3J0IHsgcmVzb2x2ZUNvbXBvbmVudCB9IGZyb20gJ3NoYXJlZC91dGlsJ1xuaW1wb3J0IHtcbiAgaXNSZXNlcnZlZFRhZyxcbiAgaXNDb25zdHJ1Y3RvcixcbiAgaXNEeW5hbWljQ29tcG9uZW50LFxuICBpc0NvbXBvbmVudE9wdGlvbnNcbn0gZnJvbSAnc2hhcmVkL3ZhbGlkYXRvcnMnXG5pbXBvcnQge1xuICBCRUZPUkVfUkVOREVSX0xJRkVDWUNMRV9IT09LLFxuICBDUkVBVEVfRUxFTUVOVF9BTElBU1xufSBmcm9tICdzaGFyZWQvY29uc3RzJ1xuXG5jb25zdCBpc1doaXRlbGlzdGVkID0gKGVsLCB3aGl0ZWxpc3QpID0+IHJlc29sdmVDb21wb25lbnQoZWwsIHdoaXRlbGlzdClcbmNvbnN0IGlzQWxyZWFkeVN0dWJiZWQgPSAoZWwsIHN0dWJzKSA9PiBzdHVicy5oYXMoZWwpXG5cbmZ1bmN0aW9uIHNob3VsZEV4dGVuZCAoY29tcG9uZW50LCBfVnVlKSB7XG4gIHJldHVybiAoXG4gICAgaXNDb25zdHJ1Y3Rvcihjb21wb25lbnQpIHx8XG4gICAgKGNvbXBvbmVudCAmJiBjb21wb25lbnQuZXh0ZW5kcylcbiAgKVxufVxuXG5mdW5jdGlvbiBleHRlbmQgKGNvbXBvbmVudCwgX1Z1ZSkge1xuICBjb25zdCBjb21wb25lbnRPcHRpb25zID0gY29tcG9uZW50Lm9wdGlvbnMgPyBjb21wb25lbnQub3B0aW9ucyA6IGNvbXBvbmVudFxuICBjb25zdCBzdHViID0gX1Z1ZS5leHRlbmQoY29tcG9uZW50T3B0aW9ucylcbiAgc3R1Yi5vcHRpb25zLiRfdnVlVGVzdFV0aWxzX29yaWdpbmFsID0gY29tcG9uZW50XG4gIHN0dWIub3B0aW9ucy5fYmFzZSA9IF9WdWVcbiAgcmV0dXJuIHN0dWJcbn1cblxuZnVuY3Rpb24gY3JlYXRlU3R1YklmTmVlZGVkIChzaG91bGRTdHViLCBjb21wb25lbnQsIF9WdWUsIGVsKSB7XG4gIGlmIChzaG91bGRTdHViKSB7XG4gICAgcmV0dXJuIGNyZWF0ZVN0dWJGcm9tQ29tcG9uZW50KGNvbXBvbmVudCB8fCB7fSwgZWwsIF9WdWUpXG4gIH1cblxuICBpZiAoc2hvdWxkRXh0ZW5kKGNvbXBvbmVudCwgX1Z1ZSkpIHtcbiAgICByZXR1cm4gZXh0ZW5kKGNvbXBvbmVudCwgX1Z1ZSlcbiAgfVxufVxuXG5mdW5jdGlvbiBzaG91bGROb3RCZVN0dWJiZWQgKGVsLCB3aGl0ZWxpc3QsIG1vZGlmaWVkQ29tcG9uZW50cykge1xuICByZXR1cm4gKFxuICAgICh0eXBlb2YgZWwgPT09ICdzdHJpbmcnICYmIGlzUmVzZXJ2ZWRUYWcoZWwpKSB8fFxuICAgIGlzV2hpdGVsaXN0ZWQoZWwsIHdoaXRlbGlzdCkgfHxcbiAgICBpc0FscmVhZHlTdHViYmVkKGVsLCBtb2RpZmllZENvbXBvbmVudHMpXG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhdGNoQ3JlYXRlRWxlbWVudCAoX1Z1ZSwgc3R1YnMsIHN0dWJBbGxDb21wb25lbnRzKSB7XG4gIC8vIFRoaXMgbWl4aW4gcGF0Y2hlcyB2bS4kY3JlYXRlRWxlbWVudCBzbyB0aGF0IHdlIGNhbiBzdHViIGFsbCBjb21wb25lbnRzXG4gIC8vIGJlZm9yZSB0aGV5IGFyZSByZW5kZXJlZCBpbiBzaGFsbG93IG1vZGUuIFdlIGFsc28gbmVlZCB0byBlbnN1cmUgdGhhdFxuICAvLyBjb21wb25lbnQgY29uc3RydWN0b3JzIHdlcmUgY3JlYXRlZCBmcm9tIHRoZSBfVnVlIGNvbnN0cnVjdG9yLiBJZiBub3QsXG4gIC8vIHdlIG11c3QgcmVwbGFjZSB0aGVtIHdpdGggY29tcG9uZW50cyBjcmVhdGVkIGZyb20gdGhlIF9WdWUgY29uc3RydWN0b3JcbiAgLy8gYmVmb3JlIGNhbGxpbmcgdGhlIG9yaWdpbmFsICRjcmVhdGVFbGVtZW50LiBUaGlzIGVuc3VyZXMgdGhhdCBjb21wb25lbnRzXG4gIC8vIGhhdmUgdGhlIGNvcnJlY3QgaW5zdGFuY2UgcHJvcGVydGllcyBhbmQgc3R1YnMgd2hlbiB0aGV5IGFyZSByZW5kZXJlZC5cbiAgZnVuY3Rpb24gcGF0Y2hDcmVhdGVFbGVtZW50TWl4aW4gKCkge1xuICAgIGNvbnN0IHZtID0gdGhpc1xuXG4gICAgaWYgKFxuICAgICAgdm0uJG9wdGlvbnMuJF9kb05vdFN0dWJDaGlsZHJlbiB8fFxuICAgICAgdm0uJG9wdGlvbnMuX2lzRnVuY3Rpb25hbENvbnRhaW5lclxuICAgICkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc3QgbW9kaWZpZWRDb21wb25lbnRzID0gbmV3IFNldCgpXG4gICAgY29uc3Qgb3JpZ2luYWxDcmVhdGVFbGVtZW50ID0gdm0uJGNyZWF0ZUVsZW1lbnRcbiAgICBjb25zdCBvcmlnaW5hbENvbXBvbmVudHMgPSB2bS4kb3B0aW9ucy5jb21wb25lbnRzXG5cbiAgICBjb25zdCBjcmVhdGVFbGVtZW50ID0gKGVsLCAuLi5hcmdzKSA9PiB7XG4gICAgICBpZiAoc2hvdWxkTm90QmVTdHViYmVkKGVsLCBzdHVicywgbW9kaWZpZWRDb21wb25lbnRzKSkge1xuICAgICAgICByZXR1cm4gb3JpZ2luYWxDcmVhdGVFbGVtZW50KGVsLCAuLi5hcmdzKVxuICAgICAgfVxuXG4gICAgICBpZiAoaXNDb25zdHJ1Y3RvcihlbCkgfHwgaXNDb21wb25lbnRPcHRpb25zKGVsKSkge1xuICAgICAgICBpZiAoc3R1YkFsbENvbXBvbmVudHMpIHtcbiAgICAgICAgICBjb25zdCBzdHViID0gY3JlYXRlU3R1YkZyb21Db21wb25lbnQoZWwsIGVsLm5hbWUgfHwgJ2Fub255bW91cycsIF9WdWUpXG4gICAgICAgICAgcmV0dXJuIG9yaWdpbmFsQ3JlYXRlRWxlbWVudChzdHViLCAuLi5hcmdzKVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IENvbnN0cnVjdG9yID0gc2hvdWxkRXh0ZW5kKGVsLCBfVnVlKSA/IGV4dGVuZChlbCwgX1Z1ZSkgOiBlbFxuXG4gICAgICAgIHJldHVybiBvcmlnaW5hbENyZWF0ZUVsZW1lbnQoQ29uc3RydWN0b3IsIC4uLmFyZ3MpXG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2YgZWwgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGNvbnN0IG9yaWdpbmFsID0gcmVzb2x2ZUNvbXBvbmVudChlbCwgb3JpZ2luYWxDb21wb25lbnRzKVxuXG4gICAgICAgIGlmICghb3JpZ2luYWwpIHtcbiAgICAgICAgICByZXR1cm4gb3JpZ2luYWxDcmVhdGVFbGVtZW50KGVsLCAuLi5hcmdzKVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGlzRHluYW1pY0NvbXBvbmVudChvcmlnaW5hbCkpIHtcbiAgICAgICAgICByZXR1cm4gb3JpZ2luYWxDcmVhdGVFbGVtZW50KGVsLCAuLi5hcmdzKVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc3R1YiA9IGNyZWF0ZVN0dWJJZk5lZWRlZChzdHViQWxsQ29tcG9uZW50cywgb3JpZ2luYWwsIF9WdWUsIGVsKVxuXG4gICAgICAgIGlmIChzdHViKSB7XG4gICAgICAgICAgT2JqZWN0LmFzc2lnbih2bS4kb3B0aW9ucy5jb21wb25lbnRzLCB7XG4gICAgICAgICAgICBbZWxdOiBzdHViXG4gICAgICAgICAgfSlcbiAgICAgICAgICBtb2RpZmllZENvbXBvbmVudHMuYWRkKGVsKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBvcmlnaW5hbENyZWF0ZUVsZW1lbnQoZWwsIC4uLmFyZ3MpXG4gICAgfVxuXG4gICAgdm1bQ1JFQVRFX0VMRU1FTlRfQUxJQVNdID0gY3JlYXRlRWxlbWVudFxuICAgIHZtLiRjcmVhdGVFbGVtZW50ID0gY3JlYXRlRWxlbWVudFxuICB9XG5cbiAgX1Z1ZS5taXhpbih7XG4gICAgW0JFRk9SRV9SRU5ERVJfTElGRUNZQ0xFX0hPT0tdOiBwYXRjaENyZWF0ZUVsZW1lbnRNaXhpblxuICB9KVxufVxuIiwiLy8gQGZsb3dcblxuaW1wb3J0IHsgY3JlYXRlU2xvdFZOb2RlcyB9IGZyb20gJy4vY3JlYXRlLXNsb3Qtdm5vZGVzJ1xuaW1wb3J0IGFkZE1vY2tzIGZyb20gJy4vYWRkLW1vY2tzJ1xuaW1wb3J0IHsgYWRkRXZlbnRMb2dnZXIgfSBmcm9tICcuL2xvZy1ldmVudHMnXG5pbXBvcnQgeyBhZGRTdHVicyB9IGZyb20gJy4vYWRkLXN0dWJzJ1xuaW1wb3J0IHsgY29tcGlsZVRlbXBsYXRlIH0gZnJvbSAnc2hhcmVkL2NvbXBpbGUtdGVtcGxhdGUnXG5pbXBvcnQgZXh0cmFjdEluc3RhbmNlT3B0aW9ucyBmcm9tICcuL2V4dHJhY3QtaW5zdGFuY2Utb3B0aW9ucydcbmltcG9ydCB7XG4gIGNvbXBvbmVudE5lZWRzQ29tcGlsaW5nLFxuICBpc0NvbnN0cnVjdG9yXG59IGZyb20gJ3NoYXJlZC92YWxpZGF0b3JzJ1xuaW1wb3J0IGNyZWF0ZVNjb3BlZFNsb3RzIGZyb20gJy4vY3JlYXRlLXNjb3BlZC1zbG90cydcbmltcG9ydCB7IGNyZWF0ZVN0dWJzRnJvbVN0dWJzT2JqZWN0IH0gZnJvbSAnLi9jcmVhdGUtY29tcG9uZW50LXN0dWJzJ1xuaW1wb3J0IHsgcGF0Y2hDcmVhdGVFbGVtZW50IH0gZnJvbSAnLi9wYXRjaC1jcmVhdGUtZWxlbWVudCdcblxuZnVuY3Rpb24gY3JlYXRlQ29udGV4dCAob3B0aW9ucywgc2NvcGVkU2xvdHMpIHtcbiAgY29uc3Qgb24gPSB7XG4gICAgLi4uKG9wdGlvbnMuY29udGV4dCAmJiBvcHRpb25zLmNvbnRleHQub24pLFxuICAgIC4uLm9wdGlvbnMubGlzdGVuZXJzXG4gIH1cbiAgcmV0dXJuIHtcbiAgICBhdHRyczoge1xuICAgICAgLi4ub3B0aW9ucy5hdHRycyxcbiAgICAgIC8vIHBhc3MgYXMgYXR0cnMgc28gdGhhdCBpbmhlcml0QXR0cnMgd29ya3MgY29ycmVjdGx5XG4gICAgICAvLyBwcm9wc0RhdGEgc2hvdWxkIHRha2UgcHJlY2VkZW5jZSBvdmVyIGF0dHJzXG4gICAgICAuLi5vcHRpb25zLnByb3BzRGF0YVxuICAgIH0sXG4gICAgLi4uKG9wdGlvbnMuY29udGV4dCB8fCB7fSksXG4gICAgb24sXG4gICAgc2NvcGVkU2xvdHNcbiAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVDaGlsZHJlbiAodm0sIGgsIHsgc2xvdHMsIGNvbnRleHQgfSkge1xuICBjb25zdCBzbG90Vk5vZGVzID0gc2xvdHNcbiAgICA/IGNyZWF0ZVNsb3RWTm9kZXModm0sIHNsb3RzKVxuICAgIDogdW5kZWZpbmVkXG4gIHJldHVybiAoXG4gICAgY29udGV4dCAmJlxuICAgIGNvbnRleHQuY2hpbGRyZW4gJiZcbiAgICBjb250ZXh0LmNoaWxkcmVuLm1hcCh4ID0+ICh0eXBlb2YgeCA9PT0gJ2Z1bmN0aW9uJyA/IHgoaCkgOiB4KSlcbiAgKSB8fCBzbG90Vk5vZGVzXG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNyZWF0ZUluc3RhbmNlIChcbiAgY29tcG9uZW50OiBDb21wb25lbnQsXG4gIG9wdGlvbnM6IE9wdGlvbnMsXG4gIF9WdWU6IENvbXBvbmVudFxuKTogQ29tcG9uZW50IHtcbiAgY29uc3QgY29tcG9uZW50T3B0aW9ucyA9IGlzQ29uc3RydWN0b3IoY29tcG9uZW50KVxuICAgID8gY29tcG9uZW50Lm9wdGlvbnNcbiAgICA6IGNvbXBvbmVudFxuXG4gIC8vIGluc3RhbmNlIG9wdGlvbnMgYXJlIG9wdGlvbnMgdGhhdCBhcmUgcGFzc2VkIHRvIHRoZVxuICAvLyByb290IGluc3RhbmNlIHdoZW4gaXQncyBpbnN0YW50aWF0ZWRcbiAgY29uc3QgaW5zdGFuY2VPcHRpb25zID0gZXh0cmFjdEluc3RhbmNlT3B0aW9ucyhvcHRpb25zKVxuXG4gIGNvbnN0IHN0dWJDb21wb25lbnRzT2JqZWN0ID0gY3JlYXRlU3R1YnNGcm9tU3R1YnNPYmplY3QoXG4gICAgY29tcG9uZW50T3B0aW9ucy5jb21wb25lbnRzLFxuICAgIC8vICRGbG93SWdub3JlXG4gICAgb3B0aW9ucy5zdHVicyxcbiAgICBfVnVlXG4gIClcblxuICBhZGRFdmVudExvZ2dlcihfVnVlKVxuICBhZGRNb2NrcyhfVnVlLCBvcHRpb25zLm1vY2tzKVxuICBhZGRTdHVicyhfVnVlLCBzdHViQ29tcG9uZW50c09iamVjdClcbiAgcGF0Y2hDcmVhdGVFbGVtZW50KF9WdWUsIHN0dWJDb21wb25lbnRzT2JqZWN0LCBvcHRpb25zLnNob3VsZFByb3h5KVxuXG4gIGlmIChjb21wb25lbnROZWVkc0NvbXBpbGluZyhjb21wb25lbnRPcHRpb25zKSkge1xuICAgIGNvbXBpbGVUZW1wbGF0ZShjb21wb25lbnRPcHRpb25zKVxuICB9XG5cbiAgLy8gdXNlZCB0byBpZGVudGlmeSBleHRlbmRlZCBjb21wb25lbnQgdXNpbmcgY29uc3RydWN0b3JcbiAgY29tcG9uZW50T3B0aW9ucy4kX3Z1ZVRlc3RVdGlsc19vcmlnaW5hbCA9IGNvbXBvbmVudFxuXG4gIC8vIG1ha2Ugc3VyZSBhbGwgZXh0ZW5kcyBhcmUgYmFzZWQgb24gdGhpcyBpbnN0YW5jZVxuICBjb21wb25lbnRPcHRpb25zLl9iYXNlID0gX1Z1ZVxuXG4gIGNvbnN0IENvbnN0cnVjdG9yID0gX1Z1ZS5leHRlbmQoY29tcG9uZW50T3B0aW9ucykuZXh0ZW5kKGluc3RhbmNlT3B0aW9ucylcblxuICBjb25zdCBzY29wZWRTbG90cyA9IGNyZWF0ZVNjb3BlZFNsb3RzKG9wdGlvbnMuc2NvcGVkU2xvdHMsIF9WdWUpXG5cbiAgY29uc3QgcGFyZW50Q29tcG9uZW50T3B0aW9ucyA9IG9wdGlvbnMucGFyZW50Q29tcG9uZW50IHx8IHt9XG5cbiAgcGFyZW50Q29tcG9uZW50T3B0aW9ucy5wcm92aWRlID0gb3B0aW9ucy5wcm92aWRlXG4gIHBhcmVudENvbXBvbmVudE9wdGlvbnMuJF9kb05vdFN0dWJDaGlsZHJlbiA9IHRydWVcbiAgcGFyZW50Q29tcG9uZW50T3B0aW9ucy5faXNGdW5jdGlvbmFsQ29udGFpbmVyID0gY29tcG9uZW50T3B0aW9ucy5mdW5jdGlvbmFsXG4gIHBhcmVudENvbXBvbmVudE9wdGlvbnMucmVuZGVyID0gZnVuY3Rpb24gKGgpIHtcbiAgICByZXR1cm4gaChcbiAgICAgIENvbnN0cnVjdG9yLFxuICAgICAgY3JlYXRlQ29udGV4dChvcHRpb25zLCBzY29wZWRTbG90cyksXG4gICAgICBjcmVhdGVDaGlsZHJlbih0aGlzLCBoLCBvcHRpb25zKVxuICAgIClcbiAgfVxuICBjb25zdCBQYXJlbnQgPSBfVnVlLmV4dGVuZChwYXJlbnRDb21wb25lbnRPcHRpb25zKVxuXG4gIHJldHVybiBuZXcgUGFyZW50KClcbn1cbiIsImltcG9ydCB7IGlzUGxhaW5PYmplY3QgfSBmcm9tICcuL3ZhbGlkYXRvcnMnXG5pbXBvcnQgeyB0aHJvd0Vycm9yIH0gZnJvbSAnLi91dGlsJ1xuaW1wb3J0IHsgVlVFX1ZFUlNJT04gfSBmcm9tICcuL2NvbnN0cydcblxuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZVN0dWJzIChzdHVicyA9IHt9KSB7XG4gIGlmIChzdHVicyA9PT0gZmFsc2UpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuICBpZiAoaXNQbGFpbk9iamVjdChzdHVicykpIHtcbiAgICByZXR1cm4gc3R1YnNcbiAgfVxuICBpZiAoQXJyYXkuaXNBcnJheShzdHVicykpIHtcbiAgICByZXR1cm4gc3R1YnMucmVkdWNlKChhY2MsIHN0dWIpID0+IHtcbiAgICAgIGlmICh0eXBlb2Ygc3R1YiAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhyb3dFcnJvcignZWFjaCBpdGVtIGluIGFuIG9wdGlvbnMuc3R1YnMgYXJyYXkgbXVzdCBiZSBhIHN0cmluZycpXG4gICAgICB9XG4gICAgICBhY2Nbc3R1Yl0gPSB0cnVlXG4gICAgICByZXR1cm4gYWNjXG4gICAgfSwge30pXG4gIH1cbiAgdGhyb3dFcnJvcignb3B0aW9ucy5zdHVicyBtdXN0IGJlIGFuIG9iamVjdCBvciBhbiBBcnJheScpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVQcm92aWRlIChwcm92aWRlKSB7XG4gIC8vIE9iamVjdHMgYXJlIG5vdCByZXNvbHZlZCBpbiBleHRlbmRlZCBjb21wb25lbnRzIGluIFZ1ZSA8IDIuNVxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vdnVlanMvdnVlL2lzc3Vlcy82NDM2XG4gIGlmIChcbiAgICB0eXBlb2YgcHJvdmlkZSA9PT0gJ29iamVjdCcgJiZcbiAgICBWVUVfVkVSU0lPTiA8IDIuNVxuICApIHtcbiAgICBjb25zdCBvYmogPSB7IC4uLnByb3ZpZGUgfVxuICAgIHJldHVybiAoKSA9PiBvYmpcbiAgfVxuICByZXR1cm4gcHJvdmlkZVxufVxuIiwiLy8gQGZsb3dcbmltcG9ydCB7IG5vcm1hbGl6ZVN0dWJzLCBub3JtYWxpemVQcm92aWRlIH0gZnJvbSAnLi9ub3JtYWxpemUnXG5cbmZ1bmN0aW9uIGdldE9wdGlvbiAob3B0aW9uLCBjb25maWc/OiBPYmplY3QpOiBhbnkge1xuICBpZiAob3B0aW9uID09PSBmYWxzZSkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG4gIGlmIChvcHRpb24gfHwgKGNvbmZpZyAmJiBPYmplY3Qua2V5cyhjb25maWcpLmxlbmd0aCA+IDApKSB7XG4gICAgaWYgKG9wdGlvbiBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB7XG4gICAgICByZXR1cm4gb3B0aW9uXG4gICAgfVxuICAgIGlmIChjb25maWcgaW5zdGFuY2VvZiBGdW5jdGlvbikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDb25maWcgY2FuJ3QgYmUgYSBGdW5jdGlvbi5gKVxuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgLi4uY29uZmlnLFxuICAgICAgLi4ub3B0aW9uXG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtZXJnZU9wdGlvbnMgKG9wdGlvbnM6IE9wdGlvbnMsIGNvbmZpZzogQ29uZmlnKTogT3B0aW9ucyB7XG4gIGNvbnN0IG1vY2tzID0gKGdldE9wdGlvbihvcHRpb25zLm1vY2tzLCBjb25maWcubW9ja3MpOiBPYmplY3QpXG4gIGNvbnN0IG1ldGhvZHMgPSAoXG4gICAgKGdldE9wdGlvbihvcHRpb25zLm1ldGhvZHMsIGNvbmZpZy5tZXRob2RzKSk6IHsgW2tleTogc3RyaW5nXTogRnVuY3Rpb24gfSlcbiAgY29uc3QgcHJvdmlkZSA9ICgoZ2V0T3B0aW9uKG9wdGlvbnMucHJvdmlkZSwgY29uZmlnLnByb3ZpZGUpKTogT2JqZWN0KVxuICByZXR1cm4ge1xuICAgIC4uLm9wdGlvbnMsXG4gICAgcHJvdmlkZTogbm9ybWFsaXplUHJvdmlkZShwcm92aWRlKSxcbiAgICBsb2dNb2RpZmllZENvbXBvbmVudHM6IGNvbmZpZy5sb2dNb2RpZmllZENvbXBvbmVudHMsXG4gICAgc3R1YnM6IGdldE9wdGlvbihub3JtYWxpemVTdHVicyhvcHRpb25zLnN0dWJzKSwgY29uZmlnLnN0dWJzKSxcbiAgICBtb2NrcyxcbiAgICBtZXRob2RzLFxuICAgIHN5bmM6ICEhKG9wdGlvbnMuc3luYyB8fCBvcHRpb25zLnN5bmMgPT09IHVuZGVmaW5lZClcbiAgfVxufVxuIiwiaW1wb3J0IHRlc3RVdGlscyBmcm9tICdAdnVlL3Rlc3QtdXRpbHMnXG5cbmV4cG9ydCBkZWZhdWx0IHRlc3RVdGlscy5jb25maWdcbiIsIi8vIEBmbG93XG5cbmltcG9ydCB7IHRocm93RXJyb3IgfSBmcm9tICdzaGFyZWQvdXRpbCdcbmltcG9ydCB7IGNvbXBpbGVUb0Z1bmN0aW9ucyB9IGZyb20gJ3Z1ZS10ZW1wbGF0ZS1jb21waWxlcidcbmltcG9ydCB7IGlzVnVlQ29tcG9uZW50IH0gZnJvbSAnLi92YWxpZGF0b3JzJ1xuXG5mdW5jdGlvbiBpc1ZhbGlkU2xvdCAoc2xvdDogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiAoXG4gICAgaXNWdWVDb21wb25lbnQoc2xvdCkgfHxcbiAgICB0eXBlb2Ygc2xvdCA9PT0gJ3N0cmluZydcbiAgKVxufVxuXG5mdW5jdGlvbiByZXF1aXJlc1RlbXBsYXRlQ29tcGlsZXIgKHNsb3Q6IGFueSk6IHZvaWQge1xuICBpZiAodHlwZW9mIHNsb3QgPT09ICdzdHJpbmcnICYmICFjb21waWxlVG9GdW5jdGlvbnMpIHtcbiAgICB0aHJvd0Vycm9yKFxuICAgICAgYHZ1ZVRlbXBsYXRlQ29tcGlsZXIgaXMgdW5kZWZpbmVkLCB5b3UgbXVzdCBwYXNzIGAgK1xuICAgICAgYHByZWNvbXBpbGVkIGNvbXBvbmVudHMgaWYgdnVlLXRlbXBsYXRlLWNvbXBpbGVyIGlzIGAgK1xuICAgICAgYHVuZGVmaW5lZGBcbiAgICApXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlU2xvdHMgKHNsb3RzOiBTbG90c09iamVjdCk6IHZvaWQge1xuICBPYmplY3Qua2V5cyhzbG90cykuZm9yRWFjaChrZXkgPT4ge1xuICAgIGNvbnN0IHNsb3QgPSBBcnJheS5pc0FycmF5KHNsb3RzW2tleV0pID8gc2xvdHNba2V5XSA6IFtzbG90c1trZXldXVxuXG4gICAgc2xvdC5mb3JFYWNoKHNsb3RWYWx1ZSA9PiB7XG4gICAgICBpZiAoIWlzVmFsaWRTbG90KHNsb3RWYWx1ZSkpIHtcbiAgICAgICAgdGhyb3dFcnJvcihcbiAgICAgICAgICBgc2xvdHNba2V5XSBtdXN0IGJlIGEgQ29tcG9uZW50LCBzdHJpbmcgb3IgYW4gYXJyYXkgYCArXG4gICAgICAgICAgICBgb2YgQ29tcG9uZW50c2BcbiAgICAgICAgKVxuICAgICAgfVxuICAgICAgcmVxdWlyZXNUZW1wbGF0ZUNvbXBpbGVyKHNsb3RWYWx1ZSlcbiAgICB9KVxuICB9KVxufVxuIiwiaW1wb3J0IHtcbiAgaXNQbGFpbk9iamVjdCxcbiAgaXNGdW5jdGlvbmFsQ29tcG9uZW50LFxuICBpc0NvbnN0cnVjdG9yXG59IGZyb20gJy4vdmFsaWRhdG9ycydcbmltcG9ydCB7IFZVRV9WRVJTSU9OIH0gZnJvbSAnLi9jb25zdHMnXG5pbXBvcnQgeyBjb21waWxlVGVtcGxhdGVGb3JTbG90cyB9IGZyb20gJy4vY29tcGlsZS10ZW1wbGF0ZSdcbmltcG9ydCB7IHRocm93RXJyb3IgfSBmcm9tICcuL3V0aWwnXG5pbXBvcnQgeyB2YWxpZGF0ZVNsb3RzIH0gZnJvbSAnLi92YWxpZGF0ZS1zbG90cydcblxuZnVuY3Rpb24gdnVlRXh0ZW5kVW5zdXBwb3J0ZWRPcHRpb24gKG9wdGlvbikge1xuICByZXR1cm4gYG9wdGlvbnMuJHtvcHRpb259IGlzIG5vdCBzdXBwb3J0ZWQgZm9yIGAgK1xuICBgY29tcG9uZW50cyBjcmVhdGVkIHdpdGggVnVlLmV4dGVuZCBpbiBWdWUgPCAyLjMuIGAgK1xuICBgWW91IGNhbiBzZXQgJHtvcHRpb259IHRvIGZhbHNlIHRvIG1vdW50IHRoZSBjb21wb25lbnQuYFxufVxuLy8gdGhlc2Ugb3B0aW9ucyBhcmVuJ3Qgc3VwcG9ydGVkIGlmIFZ1ZSBpcyB2ZXJzaW9uIDwgMi4zXG4vLyBmb3IgY29tcG9uZW50cyB1c2luZyBWdWUuZXh0ZW5kLiBUaGlzIGlzIGR1ZSB0byBhIGJ1Z1xuLy8gdGhhdCBtZWFucyB0aGUgbWl4aW5zIHdlIHVzZSB0byBhZGQgcHJvcGVydGllcyBhcmUgbm90IGFwcGxpZWRcbi8vIGNvcnJlY3RseVxuY29uc3QgVU5TVVBQT1JURURfVkVSU0lPTl9PUFRJT05TID0gW1xuICAnbW9ja3MnLFxuICAnc3R1YnMnLFxuICAnbG9jYWxWdWUnXG5dXG5cbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZU9wdGlvbnMgKG9wdGlvbnMsIGNvbXBvbmVudCkge1xuICBpZiAob3B0aW9ucy5wYXJlbnRDb21wb25lbnQgJiYgIWlzUGxhaW5PYmplY3Qob3B0aW9ucy5wYXJlbnRDb21wb25lbnQpKSB7XG4gICAgdGhyb3dFcnJvcihcbiAgICAgIGBvcHRpb25zLnBhcmVudENvbXBvbmVudCBzaG91bGQgYmUgYSB2YWxpZCBWdWUgY29tcG9uZW50IG9wdGlvbnMgb2JqZWN0YFxuICAgIClcbiAgfVxuXG4gIGlmICghaXNGdW5jdGlvbmFsQ29tcG9uZW50KGNvbXBvbmVudCkgJiYgb3B0aW9ucy5jb250ZXh0KSB7XG4gICAgdGhyb3dFcnJvcihcbiAgICAgIGBtb3VudC5jb250ZXh0IGNhbiBvbmx5IGJlIHVzZWQgd2hlbiBtb3VudGluZyBhIGZ1bmN0aW9uYWwgY29tcG9uZW50YFxuICAgIClcbiAgfVxuXG4gIGlmIChvcHRpb25zLmNvbnRleHQgJiYgIWlzUGxhaW5PYmplY3Qob3B0aW9ucy5jb250ZXh0KSkge1xuICAgIHRocm93RXJyb3IoJ21vdW50LmNvbnRleHQgbXVzdCBiZSBhbiBvYmplY3QnKVxuICB9XG5cbiAgaWYgKFxuICAgIFZVRV9WRVJTSU9OIDwgMi4zICYmIGlzQ29uc3RydWN0b3IoY29tcG9uZW50KVxuICApIHtcbiAgICBVTlNVUFBPUlRFRF9WRVJTSU9OX09QVElPTlMuZm9yRWFjaCgob3B0aW9uKSA9PiB7XG4gICAgICBpZiAob3B0aW9uc1tvcHRpb25dKSB7XG4gICAgICAgIHRocm93RXJyb3IodnVlRXh0ZW5kVW5zdXBwb3J0ZWRPcHRpb24ob3B0aW9uKSlcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgaWYgKG9wdGlvbnMuc2xvdHMpIHtcbiAgICBjb21waWxlVGVtcGxhdGVGb3JTbG90cyhvcHRpb25zLnNsb3RzKVxuICAgIC8vIHZhbGlkYXRlIHNsb3RzIG91dHNpZGUgb2YgdGhlIGNyZWF0ZVNsb3RzIGZ1bmN0aW9uIHNvXG4gICAgLy8gdGhhdCB3ZSBjYW4gdGhyb3cgYW4gZXJyb3Igd2l0aG91dCBpdCBiZWluZyBjYXVnaHQgYnlcbiAgICAvLyB0aGUgVnVlIGVycm9yIGhhbmRsZXJcbiAgICAvLyAkRmxvd0lnbm9yZVxuICAgIHZhbGlkYXRlU2xvdHMob3B0aW9ucy5zbG90cylcbiAgfVxufVxuIiwiLy8gQGZsb3dcblxuaW1wb3J0IFZ1ZSBmcm9tICd2dWUnXG5pbXBvcnQgY3JlYXRlSW5zdGFuY2UgZnJvbSAnY3JlYXRlLWluc3RhbmNlJ1xuaW1wb3J0IHsgdGhyb3dFcnJvciB9IGZyb20gJ3NoYXJlZC91dGlsJ1xuaW1wb3J0IHsgY3JlYXRlUmVuZGVyZXIgfSBmcm9tICd2dWUtc2VydmVyLXJlbmRlcmVyJ1xuaW1wb3J0IHsgbWVyZ2VPcHRpb25zIH0gZnJvbSAnc2hhcmVkL21lcmdlLW9wdGlvbnMnXG5pbXBvcnQgY29uZmlnIGZyb20gJy4vY29uZmlnJ1xuaW1wb3J0IHRlc3RVdGlscyBmcm9tICdAdnVlL3Rlc3QtdXRpbHMnXG5pbXBvcnQgeyB2YWxpZGF0ZU9wdGlvbnMgfSBmcm9tICdzaGFyZWQvdmFsaWRhdGUtb3B0aW9ucydcblxuVnVlLmNvbmZpZy5wcm9kdWN0aW9uVGlwID0gZmFsc2VcblZ1ZS5jb25maWcuZGV2dG9vbHMgPSBmYWxzZVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiByZW5kZXJUb1N0cmluZyAoXG4gIGNvbXBvbmVudDogQ29tcG9uZW50LFxuICBvcHRpb25zOiBPcHRpb25zID0ge31cbik6IHN0cmluZyB7XG4gIGNvbnN0IHJlbmRlcmVyID0gY3JlYXRlUmVuZGVyZXIoKVxuXG4gIGlmICghcmVuZGVyZXIpIHtcbiAgICB0aHJvd0Vycm9yKFxuICAgICAgYHJlbmRlclRvU3RyaW5nIG11c3QgYmUgcnVuIGluIG5vZGUuIEl0IGNhbm5vdCBiZSBgICsgYHJ1biBpbiBhIGJyb3dzZXJgXG4gICAgKVxuICB9XG5cbiAgaWYgKG9wdGlvbnMuYXR0YWNoVG9Eb2N1bWVudCkge1xuICAgIHRocm93RXJyb3IoYHlvdSBjYW5ub3QgdXNlIGF0dGFjaFRvRG9jdW1lbnQgd2l0aCBgICsgYHJlbmRlclRvU3RyaW5nYClcbiAgfVxuXG4gIGNvbnN0IG1lcmdlZE9wdGlvbnMgPSBtZXJnZU9wdGlvbnMob3B0aW9ucywgY29uZmlnKVxuICB2YWxpZGF0ZU9wdGlvbnMobWVyZ2VkT3B0aW9ucywgY29tcG9uZW50KVxuXG4gIGNvbnN0IHZtID0gY3JlYXRlSW5zdGFuY2UoXG4gICAgY29tcG9uZW50LFxuICAgIG1lcmdlZE9wdGlvbnMsXG4gICAgdGVzdFV0aWxzLmNyZWF0ZUxvY2FsVnVlKG9wdGlvbnMubG9jYWxWdWUpXG4gIClcbiAgbGV0IHJlbmRlcmVkU3RyaW5nID0gJydcblxuICAvLyAkRmxvd0lnbm9yZVxuICByZW5kZXJlci5yZW5kZXJUb1N0cmluZyh2bSwgKGVyciwgcmVzKSA9PiB7XG4gICAgaWYgKGVycikge1xuICAgICAgdGhyb3cgZXJyXG4gICAgfVxuICAgIHJlbmRlcmVkU3RyaW5nID0gcmVzXG4gIH0pXG4gIHJldHVybiByZW5kZXJlZFN0cmluZ1xufVxuIiwiLy8gQGZsb3dcblxuaW1wb3J0IHJlbmRlclRvU3RyaW5nIGZyb20gJy4vcmVuZGVyVG9TdHJpbmcnXG5pbXBvcnQgY2hlZXJpbyBmcm9tICdjaGVlcmlvJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiByZW5kZXIgKFxuICBjb21wb25lbnQ6IENvbXBvbmVudCxcbiAgb3B0aW9uczogT3B0aW9ucyA9IHt9XG4pOiBzdHJpbmcge1xuICBjb25zdCByZW5kZXJlZFN0cmluZyA9IHJlbmRlclRvU3RyaW5nKGNvbXBvbmVudCwgb3B0aW9ucylcbiAgcmV0dXJuIGNoZWVyaW8ubG9hZCgnJykocmVuZGVyZWRTdHJpbmcpXG59XG4iLCJpbXBvcnQgcmVuZGVyVG9TdHJpbmcgZnJvbSAnLi9yZW5kZXJUb1N0cmluZydcbmltcG9ydCByZW5kZXIgZnJvbSAnLi9yZW5kZXInXG5pbXBvcnQgY29uZmlnIGZyb20gJy4vY29uZmlnJ1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIHJlbmRlclRvU3RyaW5nLFxuICBjb25maWcsXG4gIHJlbmRlclxufVxuIl0sIm5hbWVzIjpbImNvbnN0IiwiY29tcGlsZVRvRnVuY3Rpb25zIiwidGhpcyIsIiQkVnVlIiwibGV0IiwicmVzb2x2ZUNvbXBvbmVudCIsImNvbXBvbmVudCIsInN0dWIiLCJjcmVhdGVSZW5kZXJlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBOztBQUlBLFNBQVMsWUFBWTtFQUNuQixFQUFFO0VBQ0YsU0FBUztFQUNULElBQUk7RUFDVTtFQUNkQSxJQUFNLEVBQUUsR0FBR0Msc0NBQWtCOzhCQUNKLElBQUksU0FBSSxTQUFTO0lBQ3pDO0VBQ0RELElBQU0sZ0JBQWdCLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsZ0JBQWU7RUFDakVBLElBQU0sWUFBWSxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsYUFBWTtFQUNqRCxFQUFFLENBQUMsWUFBWSxDQUFDLFlBQVksR0FBRyxHQUFFO0VBQ2pDLEVBQUUsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLGVBQWUsR0FBRyxFQUFFLENBQUMsZ0JBQWU7RUFDN0RBLElBQU0sS0FBSyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUUsRUFBRSxDQUFDLGNBQWMsRUFBQztFQUNoRSxFQUFFLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxlQUFlLEdBQUcsaUJBQWdCO0VBQzNELEVBQUUsQ0FBQyxZQUFZLENBQUMsWUFBWSxHQUFHLGFBQVk7RUFDM0MsT0FBTyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztDQUN6Qjs7QUFFRCxTQUFTLG1CQUFtQjtFQUMxQixFQUFFO0VBQ0YsU0FBUztFQUNULElBQUk7RUFDa0I7RUFDdEIsSUFBSSxPQUFPLFNBQVMsS0FBSyxRQUFRLEVBQUU7SUFDakMsT0FBTyxZQUFZLENBQUMsRUFBRSxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUM7R0FDekM7RUFDREEsSUFBTSxLQUFLLEdBQUcsRUFBRSxDQUFDLGNBQWMsQ0FB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QUMsS0FBSyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBQzs7RUFFMUMsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7Q0FDMUQsQ0FBQzs7QUFFRixNQUFNLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRyxTQUFTLEtBQUssRUFBRTtFQUM3QyxJQUFJLEVBQUUsS0FBSyxZQUFZLE1BQU0sQ0FBQztNQUM1QixLQUFLLEdBQUcsSUFBSSxNQUFNLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBQzs7RUFFMUMsT0FBTyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUM7U0FDM0Msa0JBQWtCLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDO1NBQzNDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0NBQ3BELENBQUM7O0FBRUYsTUFBTSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUcsU0FBUyxLQUFLLEVBQUU7OztFQUM1QyxJQUFJLEVBQUUsS0FBSyxZQUFZLE1BQU0sQ0FBQztNQUM1QixLQUFLLEdBQUcsSUFBSSxNQUFNLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBQzs7O0VBRzFDLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLE1BQU07TUFDcEQsT0FBTyxDQUFDLENBQUMsR0FBQztPQUNQLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sSUFBSSxLQUFLLENBQUMsVUFBVSxDQUFDLE1BQU07TUFDekQsT0FBTyxDQUFDLEdBQUM7T0FDTixJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLE1BQU07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
