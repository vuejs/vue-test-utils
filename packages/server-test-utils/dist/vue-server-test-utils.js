'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var vueTemplateCompiler = require('vue-template-compiler');
var Vue = _interopDefault(require('vue'));
var testUtils = _interopDefault(require('@vue/test-utils'));
var vueServerRenderer = require('vue-server-renderer');
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

  _Vue.mixin(( obj = {}, obj[BEFORE_RENDER_LIFECYCLE_HOOK] = addStubComponentsMixin, obj));
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
  'sync',
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

  return isConstructor(component)
    ? component.options
    : _Vue.extend(component).options
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
  componentOptions._base = _Vue;

  var Constructor = _Vue.extend(componentOptions).extend(instanceOptions);

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

function mergeOptions(options, config) {
  var mocks = (getOption(options.mocks, config.mocks));
  var methods = (getOption(options.methods, config.methods));
  var provide = (getOption(options.provide, config.provide));
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

function render(
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidnVlLXNlcnZlci10ZXN0LXV0aWxzLmpzIiwic291cmNlcyI6WyIuLi8uLi9jcmVhdGUtaW5zdGFuY2UvY3JlYXRlLXNsb3Qtdm5vZGVzLmpzIiwiLi4vLi4vc2hhcmVkL25vZGVfbW9kdWxlcy9zZW12ZXIvc2VtdmVyLmpzIiwiLi4vLi4vc2hhcmVkL3V0aWwuanMiLCIuLi8uLi9jcmVhdGUtaW5zdGFuY2UvYWRkLW1vY2tzLmpzIiwiLi4vLi4vY3JlYXRlLWluc3RhbmNlL2xvZy1ldmVudHMuanMiLCIuLi8uLi9zaGFyZWQvY29uc3RzLmpzIiwiLi4vLi4vY3JlYXRlLWluc3RhbmNlL2FkZC1zdHVicy5qcyIsIi4uLy4uL3NoYXJlZC92YWxpZGF0b3JzLmpzIiwiLi4vLi4vc2hhcmVkL2NvbXBpbGUtdGVtcGxhdGUuanMiLCIuLi8uLi9jcmVhdGUtaW5zdGFuY2UvZXh0cmFjdC1pbnN0YW5jZS1vcHRpb25zLmpzIiwiLi4vLi4vY3JlYXRlLWluc3RhbmNlL2NyZWF0ZS1zY29wZWQtc2xvdHMuanMiLCIuLi8uLi9jcmVhdGUtaW5zdGFuY2UvY3JlYXRlLWNvbXBvbmVudC1zdHVicy5qcyIsIi4uLy4uL2NyZWF0ZS1pbnN0YW5jZS9wYXRjaC1jcmVhdGUtZWxlbWVudC5qcyIsIi4uLy4uL2NyZWF0ZS1pbnN0YW5jZS9jcmVhdGUtaW5zdGFuY2UuanMiLCIuLi8uLi9zaGFyZWQvbm9ybWFsaXplLmpzIiwiLi4vLi4vc2hhcmVkL21lcmdlLW9wdGlvbnMuanMiLCIuLi9zcmMvY29uZmlnLmpzIiwiLi4vLi4vc2hhcmVkL3ZhbGlkYXRlLXNsb3RzLmpzIiwiLi4vLi4vc2hhcmVkL3ZhbGlkYXRlLW9wdGlvbnMuanMiLCIuLi9zcmMvcmVuZGVyVG9TdHJpbmcuanMiLCIuLi9zcmMvcmVuZGVyLmpzIiwiLi4vc3JjL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIEBmbG93XG5cbmltcG9ydCB7IGNvbXBpbGVUb0Z1bmN0aW9ucyB9IGZyb20gJ3Z1ZS10ZW1wbGF0ZS1jb21waWxlcidcblxuZnVuY3Rpb24gY3JlYXRlVk5vZGVzKHZtOiBDb21wb25lbnQsIHNsb3RWYWx1ZTogc3RyaW5nLCBuYW1lKTogQXJyYXk8Vk5vZGU+IHtcbiAgY29uc3QgZWwgPSBjb21waWxlVG9GdW5jdGlvbnMoXG4gICAgYDxkaXY+PHRlbXBsYXRlIHNsb3Q9JHtuYW1lfT4ke3Nsb3RWYWx1ZX08L3RlbXBsYXRlPjwvZGl2PmBcbiAgKVxuICBjb25zdCBfc3RhdGljUmVuZGVyRm5zID0gdm0uX3JlbmRlclByb3h5LiRvcHRpb25zLnN0YXRpY1JlbmRlckZuc1xuICBjb25zdCBfc3RhdGljVHJlZXMgPSB2bS5fcmVuZGVyUHJveHkuX3N0YXRpY1RyZWVzXG4gIHZtLl9yZW5kZXJQcm94eS5fc3RhdGljVHJlZXMgPSBbXVxuICB2bS5fcmVuZGVyUHJveHkuJG9wdGlvbnMuc3RhdGljUmVuZGVyRm5zID0gZWwuc3RhdGljUmVuZGVyRm5zXG4gIGNvbnN0IHZub2RlID0gZWwucmVuZGVyLmNhbGwodm0uX3JlbmRlclByb3h5LCB2bS4kY3JlYXRlRWxlbWVudClcbiAgdm0uX3JlbmRlclByb3h5LiRvcHRpb25zLnN0YXRpY1JlbmRlckZucyA9IF9zdGF0aWNSZW5kZXJGbnNcbiAgdm0uX3JlbmRlclByb3h5Ll9zdGF0aWNUcmVlcyA9IF9zdGF0aWNUcmVlc1xuICByZXR1cm4gdm5vZGUuY2hpbGRyZW5bMF1cbn1cblxuZnVuY3Rpb24gY3JlYXRlVk5vZGVzRm9yU2xvdChcbiAgdm06IENvbXBvbmVudCxcbiAgc2xvdFZhbHVlOiBTbG90VmFsdWUsXG4gIG5hbWU6IHN0cmluZ1xuKTogVk5vZGUgfCBBcnJheTxWTm9kZT4ge1xuICBpZiAodHlwZW9mIHNsb3RWYWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gY3JlYXRlVk5vZGVzKHZtLCBzbG90VmFsdWUsIG5hbWUpXG4gIH1cbiAgY29uc3Qgdm5vZGUgPSB2bS4kY3JlYXRlRWxlbWVudChzbG90VmFsdWUpXG4gIDsodm5vZGUuZGF0YSB8fCAodm5vZGUuZGF0YSA9IHt9KSkuc2xvdCA9IG5hbWVcbiAgcmV0dXJuIHZub2RlXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTbG90Vk5vZGVzKFxuICB2bTogQ29tcG9uZW50LFxuICBzbG90czogU2xvdHNPYmplY3Rcbik6IEFycmF5PFZOb2RlIHwgQXJyYXk8Vk5vZGU+PiB7XG4gIHJldHVybiBPYmplY3Qua2V5cyhzbG90cykucmVkdWNlKChhY2MsIGtleSkgPT4ge1xuICAgIGNvbnN0IGNvbnRlbnQgPSBzbG90c1trZXldXG4gICAgaWYgKEFycmF5LmlzQXJyYXkoY29udGVudCkpIHtcbiAgICAgIGNvbnN0IG5vZGVzID0gY29udGVudC5tYXAoc2xvdERlZiA9PlxuICAgICAgICBjcmVhdGVWTm9kZXNGb3JTbG90KHZtLCBzbG90RGVmLCBrZXkpXG4gICAgICApXG4gICAgICByZXR1cm4gYWNjLmNvbmNhdChub2RlcylcbiAgICB9XG5cbiAgICByZXR1cm4gYWNjLmNvbmNhdChjcmVhdGVWTm9kZXNGb3JTbG90KHZtLCBjb250ZW50LCBrZXkpKVxuICB9LCBbXSlcbn1cbiIsImV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IFNlbVZlcjtcblxuLy8gVGhlIGRlYnVnIGZ1bmN0aW9uIGlzIGV4Y2x1ZGVkIGVudGlyZWx5IGZyb20gdGhlIG1pbmlmaWVkIHZlcnNpb24uXG4vKiBub21pbiAqLyB2YXIgZGVidWc7XG4vKiBub21pbiAqLyBpZiAodHlwZW9mIHByb2Nlc3MgPT09ICdvYmplY3QnICYmXG4gICAgLyogbm9taW4gKi8gcHJvY2Vzcy5lbnYgJiZcbiAgICAvKiBub21pbiAqLyBwcm9jZXNzLmVudi5OT0RFX0RFQlVHICYmXG4gICAgLyogbm9taW4gKi8gL1xcYnNlbXZlclxcYi9pLnRlc3QocHJvY2Vzcy5lbnYuTk9ERV9ERUJVRykpXG4gIC8qIG5vbWluICovIGRlYnVnID0gZnVuY3Rpb24oKSB7XG4gICAgLyogbm9taW4gKi8gdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApO1xuICAgIC8qIG5vbWluICovIGFyZ3MudW5zaGlmdCgnU0VNVkVSJyk7XG4gICAgLyogbm9taW4gKi8gY29uc29sZS5sb2cuYXBwbHkoY29uc29sZSwgYXJncyk7XG4gICAgLyogbm9taW4gKi8gfTtcbi8qIG5vbWluICovIGVsc2VcbiAgLyogbm9taW4gKi8gZGVidWcgPSBmdW5jdGlvbigpIHt9O1xuXG4vLyBOb3RlOiB0aGlzIGlzIHRoZSBzZW12ZXIub3JnIHZlcnNpb24gb2YgdGhlIHNwZWMgdGhhdCBpdCBpbXBsZW1lbnRzXG4vLyBOb3QgbmVjZXNzYXJpbHkgdGhlIHBhY2thZ2UgdmVyc2lvbiBvZiB0aGlzIGNvZGUuXG5leHBvcnRzLlNFTVZFUl9TUEVDX1ZFUlNJT04gPSAnMi4wLjAnO1xuXG52YXIgTUFYX0xFTkdUSCA9IDI1NjtcbnZhciBNQVhfU0FGRV9JTlRFR0VSID0gTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVIgfHwgOTAwNzE5OTI1NDc0MDk5MTtcblxuLy8gTWF4IHNhZmUgc2VnbWVudCBsZW5ndGggZm9yIGNvZXJjaW9uLlxudmFyIE1BWF9TQUZFX0NPTVBPTkVOVF9MRU5HVEggPSAxNjtcblxuLy8gVGhlIGFjdHVhbCByZWdleHBzIGdvIG9uIGV4cG9ydHMucmVcbnZhciByZSA9IGV4cG9ydHMucmUgPSBbXTtcbnZhciBzcmMgPSBleHBvcnRzLnNyYyA9IFtdO1xudmFyIFIgPSAwO1xuXG4vLyBUaGUgZm9sbG93aW5nIFJlZ3VsYXIgRXhwcmVzc2lvbnMgY2FuIGJlIHVzZWQgZm9yIHRva2VuaXppbmcsXG4vLyB2YWxpZGF0aW5nLCBhbmQgcGFyc2luZyBTZW1WZXIgdmVyc2lvbiBzdHJpbmdzLlxuXG4vLyAjIyBOdW1lcmljIElkZW50aWZpZXJcbi8vIEEgc2luZ2xlIGAwYCwgb3IgYSBub24temVybyBkaWdpdCBmb2xsb3dlZCBieSB6ZXJvIG9yIG1vcmUgZGlnaXRzLlxuXG52YXIgTlVNRVJJQ0lERU5USUZJRVIgPSBSKys7XG5zcmNbTlVNRVJJQ0lERU5USUZJRVJdID0gJzB8WzEtOV1cXFxcZConO1xudmFyIE5VTUVSSUNJREVOVElGSUVSTE9PU0UgPSBSKys7XG5zcmNbTlVNRVJJQ0lERU5USUZJRVJMT09TRV0gPSAnWzAtOV0rJztcblxuXG4vLyAjIyBOb24tbnVtZXJpYyBJZGVudGlmaWVyXG4vLyBaZXJvIG9yIG1vcmUgZGlnaXRzLCBmb2xsb3dlZCBieSBhIGxldHRlciBvciBoeXBoZW4sIGFuZCB0aGVuIHplcm8gb3Jcbi8vIG1vcmUgbGV0dGVycywgZGlnaXRzLCBvciBoeXBoZW5zLlxuXG52YXIgTk9OTlVNRVJJQ0lERU5USUZJRVIgPSBSKys7XG5zcmNbTk9OTlVNRVJJQ0lERU5USUZJRVJdID0gJ1xcXFxkKlthLXpBLVotXVthLXpBLVowLTktXSonO1xuXG5cbi8vICMjIE1haW4gVmVyc2lvblxuLy8gVGhyZWUgZG90LXNlcGFyYXRlZCBudW1lcmljIGlkZW50aWZpZXJzLlxuXG52YXIgTUFJTlZFUlNJT04gPSBSKys7XG5zcmNbTUFJTlZFUlNJT05dID0gJygnICsgc3JjW05VTUVSSUNJREVOVElGSUVSXSArICcpXFxcXC4nICtcbiAgICAgICAgICAgICAgICAgICAnKCcgKyBzcmNbTlVNRVJJQ0lERU5USUZJRVJdICsgJylcXFxcLicgK1xuICAgICAgICAgICAgICAgICAgICcoJyArIHNyY1tOVU1FUklDSURFTlRJRklFUl0gKyAnKSc7XG5cbnZhciBNQUlOVkVSU0lPTkxPT1NFID0gUisrO1xuc3JjW01BSU5WRVJTSU9OTE9PU0VdID0gJygnICsgc3JjW05VTUVSSUNJREVOVElGSUVSTE9PU0VdICsgJylcXFxcLicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJygnICsgc3JjW05VTUVSSUNJREVOVElGSUVSTE9PU0VdICsgJylcXFxcLicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJygnICsgc3JjW05VTUVSSUNJREVOVElGSUVSTE9PU0VdICsgJyknO1xuXG4vLyAjIyBQcmUtcmVsZWFzZSBWZXJzaW9uIElkZW50aWZpZXJcbi8vIEEgbnVtZXJpYyBpZGVudGlmaWVyLCBvciBhIG5vbi1udW1lcmljIGlkZW50aWZpZXIuXG5cbnZhciBQUkVSRUxFQVNFSURFTlRJRklFUiA9IFIrKztcbnNyY1tQUkVSRUxFQVNFSURFTlRJRklFUl0gPSAnKD86JyArIHNyY1tOVU1FUklDSURFTlRJRklFUl0gK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICd8JyArIHNyY1tOT05OVU1FUklDSURFTlRJRklFUl0gKyAnKSc7XG5cbnZhciBQUkVSRUxFQVNFSURFTlRJRklFUkxPT1NFID0gUisrO1xuc3JjW1BSRVJFTEVBU0VJREVOVElGSUVSTE9PU0VdID0gJyg/OicgKyBzcmNbTlVNRVJJQ0lERU5USUZJRVJMT09TRV0gK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3wnICsgc3JjW05PTk5VTUVSSUNJREVOVElGSUVSXSArICcpJztcblxuXG4vLyAjIyBQcmUtcmVsZWFzZSBWZXJzaW9uXG4vLyBIeXBoZW4sIGZvbGxvd2VkIGJ5IG9uZSBvciBtb3JlIGRvdC1zZXBhcmF0ZWQgcHJlLXJlbGVhc2UgdmVyc2lvblxuLy8gaWRlbnRpZmllcnMuXG5cbnZhciBQUkVSRUxFQVNFID0gUisrO1xuc3JjW1BSRVJFTEVBU0VdID0gJyg/Oi0oJyArIHNyY1tQUkVSRUxFQVNFSURFTlRJRklFUl0gK1xuICAgICAgICAgICAgICAgICAgJyg/OlxcXFwuJyArIHNyY1tQUkVSRUxFQVNFSURFTlRJRklFUl0gKyAnKSopKSc7XG5cbnZhciBQUkVSRUxFQVNFTE9PU0UgPSBSKys7XG5zcmNbUFJFUkVMRUFTRUxPT1NFXSA9ICcoPzotPygnICsgc3JjW1BSRVJFTEVBU0VJREVOVElGSUVSTE9PU0VdICtcbiAgICAgICAgICAgICAgICAgICAgICAgJyg/OlxcXFwuJyArIHNyY1tQUkVSRUxFQVNFSURFTlRJRklFUkxPT1NFXSArICcpKikpJztcblxuLy8gIyMgQnVpbGQgTWV0YWRhdGEgSWRlbnRpZmllclxuLy8gQW55IGNvbWJpbmF0aW9uIG9mIGRpZ2l0cywgbGV0dGVycywgb3IgaHlwaGVucy5cblxudmFyIEJVSUxESURFTlRJRklFUiA9IFIrKztcbnNyY1tCVUlMRElERU5USUZJRVJdID0gJ1swLTlBLVphLXotXSsnO1xuXG4vLyAjIyBCdWlsZCBNZXRhZGF0YVxuLy8gUGx1cyBzaWduLCBmb2xsb3dlZCBieSBvbmUgb3IgbW9yZSBwZXJpb2Qtc2VwYXJhdGVkIGJ1aWxkIG1ldGFkYXRhXG4vLyBpZGVudGlmaWVycy5cblxudmFyIEJVSUxEID0gUisrO1xuc3JjW0JVSUxEXSA9ICcoPzpcXFxcKygnICsgc3JjW0JVSUxESURFTlRJRklFUl0gK1xuICAgICAgICAgICAgICcoPzpcXFxcLicgKyBzcmNbQlVJTERJREVOVElGSUVSXSArICcpKikpJztcblxuXG4vLyAjIyBGdWxsIFZlcnNpb24gU3RyaW5nXG4vLyBBIG1haW4gdmVyc2lvbiwgZm9sbG93ZWQgb3B0aW9uYWxseSBieSBhIHByZS1yZWxlYXNlIHZlcnNpb24gYW5kXG4vLyBidWlsZCBtZXRhZGF0YS5cblxuLy8gTm90ZSB0aGF0IHRoZSBvbmx5IG1ham9yLCBtaW5vciwgcGF0Y2gsIGFuZCBwcmUtcmVsZWFzZSBzZWN0aW9ucyBvZlxuLy8gdGhlIHZlcnNpb24gc3RyaW5nIGFyZSBjYXB0dXJpbmcgZ3JvdXBzLiAgVGhlIGJ1aWxkIG1ldGFkYXRhIGlzIG5vdCBhXG4vLyBjYXB0dXJpbmcgZ3JvdXAsIGJlY2F1c2UgaXQgc2hvdWxkIG5vdCBldmVyIGJlIHVzZWQgaW4gdmVyc2lvblxuLy8gY29tcGFyaXNvbi5cblxudmFyIEZVTEwgPSBSKys7XG52YXIgRlVMTFBMQUlOID0gJ3Y/JyArIHNyY1tNQUlOVkVSU0lPTl0gK1xuICAgICAgICAgICAgICAgIHNyY1tQUkVSRUxFQVNFXSArICc/JyArXG4gICAgICAgICAgICAgICAgc3JjW0JVSUxEXSArICc/Jztcblxuc3JjW0ZVTExdID0gJ14nICsgRlVMTFBMQUlOICsgJyQnO1xuXG4vLyBsaWtlIGZ1bGwsIGJ1dCBhbGxvd3MgdjEuMi4zIGFuZCA9MS4yLjMsIHdoaWNoIHBlb3BsZSBkbyBzb21ldGltZXMuXG4vLyBhbHNvLCAxLjAuMGFscGhhMSAocHJlcmVsZWFzZSB3aXRob3V0IHRoZSBoeXBoZW4pIHdoaWNoIGlzIHByZXR0eVxuLy8gY29tbW9uIGluIHRoZSBucG0gcmVnaXN0cnkuXG52YXIgTE9PU0VQTEFJTiA9ICdbdj1cXFxcc10qJyArIHNyY1tNQUlOVkVSU0lPTkxPT1NFXSArXG4gICAgICAgICAgICAgICAgIHNyY1tQUkVSRUxFQVNFTE9PU0VdICsgJz8nICtcbiAgICAgICAgICAgICAgICAgc3JjW0JVSUxEXSArICc/JztcblxudmFyIExPT1NFID0gUisrO1xuc3JjW0xPT1NFXSA9ICdeJyArIExPT1NFUExBSU4gKyAnJCc7XG5cbnZhciBHVExUID0gUisrO1xuc3JjW0dUTFRdID0gJygoPzo8fD4pPz0/KSc7XG5cbi8vIFNvbWV0aGluZyBsaWtlIFwiMi4qXCIgb3IgXCIxLjIueFwiLlxuLy8gTm90ZSB0aGF0IFwieC54XCIgaXMgYSB2YWxpZCB4UmFuZ2UgaWRlbnRpZmVyLCBtZWFuaW5nIFwiYW55IHZlcnNpb25cIlxuLy8gT25seSB0aGUgZmlyc3QgaXRlbSBpcyBzdHJpY3RseSByZXF1aXJlZC5cbnZhciBYUkFOR0VJREVOVElGSUVSTE9PU0UgPSBSKys7XG5zcmNbWFJBTkdFSURFTlRJRklFUkxPT1NFXSA9IHNyY1tOVU1FUklDSURFTlRJRklFUkxPT1NFXSArICd8eHxYfFxcXFwqJztcbnZhciBYUkFOR0VJREVOVElGSUVSID0gUisrO1xuc3JjW1hSQU5HRUlERU5USUZJRVJdID0gc3JjW05VTUVSSUNJREVOVElGSUVSXSArICd8eHxYfFxcXFwqJztcblxudmFyIFhSQU5HRVBMQUlOID0gUisrO1xuc3JjW1hSQU5HRVBMQUlOXSA9ICdbdj1cXFxcc10qKCcgKyBzcmNbWFJBTkdFSURFTlRJRklFUl0gKyAnKScgK1xuICAgICAgICAgICAgICAgICAgICcoPzpcXFxcLignICsgc3JjW1hSQU5HRUlERU5USUZJRVJdICsgJyknICtcbiAgICAgICAgICAgICAgICAgICAnKD86XFxcXC4oJyArIHNyY1tYUkFOR0VJREVOVElGSUVSXSArICcpJyArXG4gICAgICAgICAgICAgICAgICAgJyg/OicgKyBzcmNbUFJFUkVMRUFTRV0gKyAnKT8nICtcbiAgICAgICAgICAgICAgICAgICBzcmNbQlVJTERdICsgJz8nICtcbiAgICAgICAgICAgICAgICAgICAnKT8pPyc7XG5cbnZhciBYUkFOR0VQTEFJTkxPT1NFID0gUisrO1xuc3JjW1hSQU5HRVBMQUlOTE9PU0VdID0gJ1t2PVxcXFxzXSooJyArIHNyY1tYUkFOR0VJREVOVElGSUVSTE9PU0VdICsgJyknICtcbiAgICAgICAgICAgICAgICAgICAgICAgICcoPzpcXFxcLignICsgc3JjW1hSQU5HRUlERU5USUZJRVJMT09TRV0gKyAnKScgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJyg/OlxcXFwuKCcgKyBzcmNbWFJBTkdFSURFTlRJRklFUkxPT1NFXSArICcpJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnKD86JyArIHNyY1tQUkVSRUxFQVNFTE9PU0VdICsgJyk/JyArXG4gICAgICAgICAgICAgICAgICAgICAgICBzcmNbQlVJTERdICsgJz8nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICcpPyk/JztcblxudmFyIFhSQU5HRSA9IFIrKztcbnNyY1tYUkFOR0VdID0gJ14nICsgc3JjW0dUTFRdICsgJ1xcXFxzKicgKyBzcmNbWFJBTkdFUExBSU5dICsgJyQnO1xudmFyIFhSQU5HRUxPT1NFID0gUisrO1xuc3JjW1hSQU5HRUxPT1NFXSA9ICdeJyArIHNyY1tHVExUXSArICdcXFxccyonICsgc3JjW1hSQU5HRVBMQUlOTE9PU0VdICsgJyQnO1xuXG4vLyBDb2VyY2lvbi5cbi8vIEV4dHJhY3QgYW55dGhpbmcgdGhhdCBjb3VsZCBjb25jZWl2YWJseSBiZSBhIHBhcnQgb2YgYSB2YWxpZCBzZW12ZXJcbnZhciBDT0VSQ0UgPSBSKys7XG5zcmNbQ09FUkNFXSA9ICcoPzpefFteXFxcXGRdKScgK1xuICAgICAgICAgICAgICAnKFxcXFxkezEsJyArIE1BWF9TQUZFX0NPTVBPTkVOVF9MRU5HVEggKyAnfSknICtcbiAgICAgICAgICAgICAgJyg/OlxcXFwuKFxcXFxkezEsJyArIE1BWF9TQUZFX0NPTVBPTkVOVF9MRU5HVEggKyAnfSkpPycgK1xuICAgICAgICAgICAgICAnKD86XFxcXC4oXFxcXGR7MSwnICsgTUFYX1NBRkVfQ09NUE9ORU5UX0xFTkdUSCArICd9KSk/JyArXG4gICAgICAgICAgICAgICcoPzokfFteXFxcXGRdKSc7XG5cbi8vIFRpbGRlIHJhbmdlcy5cbi8vIE1lYW5pbmcgaXMgXCJyZWFzb25hYmx5IGF0IG9yIGdyZWF0ZXIgdGhhblwiXG52YXIgTE9ORVRJTERFID0gUisrO1xuc3JjW0xPTkVUSUxERV0gPSAnKD86fj4/KSc7XG5cbnZhciBUSUxERVRSSU0gPSBSKys7XG5zcmNbVElMREVUUklNXSA9ICcoXFxcXHMqKScgKyBzcmNbTE9ORVRJTERFXSArICdcXFxccysnO1xucmVbVElMREVUUklNXSA9IG5ldyBSZWdFeHAoc3JjW1RJTERFVFJJTV0sICdnJyk7XG52YXIgdGlsZGVUcmltUmVwbGFjZSA9ICckMX4nO1xuXG52YXIgVElMREUgPSBSKys7XG5zcmNbVElMREVdID0gJ14nICsgc3JjW0xPTkVUSUxERV0gKyBzcmNbWFJBTkdFUExBSU5dICsgJyQnO1xudmFyIFRJTERFTE9PU0UgPSBSKys7XG5zcmNbVElMREVMT09TRV0gPSAnXicgKyBzcmNbTE9ORVRJTERFXSArIHNyY1tYUkFOR0VQTEFJTkxPT1NFXSArICckJztcblxuLy8gQ2FyZXQgcmFuZ2VzLlxuLy8gTWVhbmluZyBpcyBcImF0IGxlYXN0IGFuZCBiYWNrd2FyZHMgY29tcGF0aWJsZSB3aXRoXCJcbnZhciBMT05FQ0FSRVQgPSBSKys7XG5zcmNbTE9ORUNBUkVUXSA9ICcoPzpcXFxcXiknO1xuXG52YXIgQ0FSRVRUUklNID0gUisrO1xuc3JjW0NBUkVUVFJJTV0gPSAnKFxcXFxzKiknICsgc3JjW0xPTkVDQVJFVF0gKyAnXFxcXHMrJztcbnJlW0NBUkVUVFJJTV0gPSBuZXcgUmVnRXhwKHNyY1tDQVJFVFRSSU1dLCAnZycpO1xudmFyIGNhcmV0VHJpbVJlcGxhY2UgPSAnJDFeJztcblxudmFyIENBUkVUID0gUisrO1xuc3JjW0NBUkVUXSA9ICdeJyArIHNyY1tMT05FQ0FSRVRdICsgc3JjW1hSQU5HRVBMQUlOXSArICckJztcbnZhciBDQVJFVExPT1NFID0gUisrO1xuc3JjW0NBUkVUTE9PU0VdID0gJ14nICsgc3JjW0xPTkVDQVJFVF0gKyBzcmNbWFJBTkdFUExBSU5MT09TRV0gKyAnJCc7XG5cbi8vIEEgc2ltcGxlIGd0L2x0L2VxIHRoaW5nLCBvciBqdXN0IFwiXCIgdG8gaW5kaWNhdGUgXCJhbnkgdmVyc2lvblwiXG52YXIgQ09NUEFSQVRPUkxPT1NFID0gUisrO1xuc3JjW0NPTVBBUkFUT1JMT09TRV0gPSAnXicgKyBzcmNbR1RMVF0gKyAnXFxcXHMqKCcgKyBMT09TRVBMQUlOICsgJykkfF4kJztcbnZhciBDT01QQVJBVE9SID0gUisrO1xuc3JjW0NPTVBBUkFUT1JdID0gJ14nICsgc3JjW0dUTFRdICsgJ1xcXFxzKignICsgRlVMTFBMQUlOICsgJykkfF4kJztcblxuXG4vLyBBbiBleHByZXNzaW9uIHRvIHN0cmlwIGFueSB3aGl0ZXNwYWNlIGJldHdlZW4gdGhlIGd0bHQgYW5kIHRoZSB0aGluZ1xuLy8gaXQgbW9kaWZpZXMsIHNvIHRoYXQgYD4gMS4yLjNgID09PiBgPjEuMi4zYFxudmFyIENPTVBBUkFUT1JUUklNID0gUisrO1xuc3JjW0NPTVBBUkFUT1JUUklNXSA9ICcoXFxcXHMqKScgKyBzcmNbR1RMVF0gK1xuICAgICAgICAgICAgICAgICAgICAgICdcXFxccyooJyArIExPT1NFUExBSU4gKyAnfCcgKyBzcmNbWFJBTkdFUExBSU5dICsgJyknO1xuXG4vLyB0aGlzIG9uZSBoYXMgdG8gdXNlIHRoZSAvZyBmbGFnXG5yZVtDT01QQVJBVE9SVFJJTV0gPSBuZXcgUmVnRXhwKHNyY1tDT01QQVJBVE9SVFJJTV0sICdnJyk7XG52YXIgY29tcGFyYXRvclRyaW1SZXBsYWNlID0gJyQxJDIkMyc7XG5cblxuLy8gU29tZXRoaW5nIGxpa2UgYDEuMi4zIC0gMS4yLjRgXG4vLyBOb3RlIHRoYXQgdGhlc2UgYWxsIHVzZSB0aGUgbG9vc2UgZm9ybSwgYmVjYXVzZSB0aGV5J2xsIGJlXG4vLyBjaGVja2VkIGFnYWluc3QgZWl0aGVyIHRoZSBzdHJpY3Qgb3IgbG9vc2UgY29tcGFyYXRvciBmb3JtXG4vLyBsYXRlci5cbnZhciBIWVBIRU5SQU5HRSA9IFIrKztcbnNyY1tIWVBIRU5SQU5HRV0gPSAnXlxcXFxzKignICsgc3JjW1hSQU5HRVBMQUlOXSArICcpJyArXG4gICAgICAgICAgICAgICAgICAgJ1xcXFxzKy1cXFxccysnICtcbiAgICAgICAgICAgICAgICAgICAnKCcgKyBzcmNbWFJBTkdFUExBSU5dICsgJyknICtcbiAgICAgICAgICAgICAgICAgICAnXFxcXHMqJCc7XG5cbnZhciBIWVBIRU5SQU5HRUxPT1NFID0gUisrO1xuc3JjW0hZUEhFTlJBTkdFTE9PU0VdID0gJ15cXFxccyooJyArIHNyY1tYUkFOR0VQTEFJTkxPT1NFXSArICcpJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnXFxcXHMrLVxcXFxzKycgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJygnICsgc3JjW1hSQU5HRVBMQUlOTE9PU0VdICsgJyknICtcbiAgICAgICAgICAgICAgICAgICAgICAgICdcXFxccyokJztcblxuLy8gU3RhciByYW5nZXMgYmFzaWNhbGx5IGp1c3QgYWxsb3cgYW55dGhpbmcgYXQgYWxsLlxudmFyIFNUQVIgPSBSKys7XG5zcmNbU1RBUl0gPSAnKDx8Pik/PT9cXFxccypcXFxcKic7XG5cbi8vIENvbXBpbGUgdG8gYWN0dWFsIHJlZ2V4cCBvYmplY3RzLlxuLy8gQWxsIGFyZSBmbGFnLWZyZWUsIHVubGVzcyB0aGV5IHdlcmUgY3JlYXRlZCBhYm92ZSB3aXRoIGEgZmxhZy5cbmZvciAodmFyIGkgPSAwOyBpIDwgUjsgaSsrKSB7XG4gIGRlYnVnKGksIHNyY1tpXSk7XG4gIGlmICghcmVbaV0pXG4gICAgcmVbaV0gPSBuZXcgUmVnRXhwKHNyY1tpXSk7XG59XG5cbmV4cG9ydHMucGFyc2UgPSBwYXJzZTtcbmZ1bmN0aW9uIHBhcnNlKHZlcnNpb24sIG9wdGlvbnMpIHtcbiAgaWYgKCFvcHRpb25zIHx8IHR5cGVvZiBvcHRpb25zICE9PSAnb2JqZWN0JylcbiAgICBvcHRpb25zID0geyBsb29zZTogISFvcHRpb25zLCBpbmNsdWRlUHJlcmVsZWFzZTogZmFsc2UgfVxuXG4gIGlmICh2ZXJzaW9uIGluc3RhbmNlb2YgU2VtVmVyKVxuICAgIHJldHVybiB2ZXJzaW9uO1xuXG4gIGlmICh0eXBlb2YgdmVyc2lvbiAhPT0gJ3N0cmluZycpXG4gICAgcmV0dXJuIG51bGw7XG5cbiAgaWYgKHZlcnNpb24ubGVuZ3RoID4gTUFYX0xFTkdUSClcbiAgICByZXR1cm4gbnVsbDtcblxuICB2YXIgciA9IG9wdGlvbnMubG9vc2UgPyByZVtMT09TRV0gOiByZVtGVUxMXTtcbiAgaWYgKCFyLnRlc3QodmVyc2lvbikpXG4gICAgcmV0dXJuIG51bGw7XG5cbiAgdHJ5IHtcbiAgICByZXR1cm4gbmV3IFNlbVZlcih2ZXJzaW9uLCBvcHRpb25zKTtcbiAgfSBjYXRjaCAoZXIpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG5leHBvcnRzLnZhbGlkID0gdmFsaWQ7XG5mdW5jdGlvbiB2YWxpZCh2ZXJzaW9uLCBvcHRpb25zKSB7XG4gIHZhciB2ID0gcGFyc2UodmVyc2lvbiwgb3B0aW9ucyk7XG4gIHJldHVybiB2ID8gdi52ZXJzaW9uIDogbnVsbDtcbn1cblxuXG5leHBvcnRzLmNsZWFuID0gY2xlYW47XG5mdW5jdGlvbiBjbGVhbih2ZXJzaW9uLCBvcHRpb25zKSB7XG4gIHZhciBzID0gcGFyc2UodmVyc2lvbi50cmltKCkucmVwbGFjZSgvXls9dl0rLywgJycpLCBvcHRpb25zKTtcbiAgcmV0dXJuIHMgPyBzLnZlcnNpb24gOiBudWxsO1xufVxuXG5leHBvcnRzLlNlbVZlciA9IFNlbVZlcjtcblxuZnVuY3Rpb24gU2VtVmVyKHZlcnNpb24sIG9wdGlvbnMpIHtcbiAgaWYgKCFvcHRpb25zIHx8IHR5cGVvZiBvcHRpb25zICE9PSAnb2JqZWN0JylcbiAgICBvcHRpb25zID0geyBsb29zZTogISFvcHRpb25zLCBpbmNsdWRlUHJlcmVsZWFzZTogZmFsc2UgfVxuICBpZiAodmVyc2lvbiBpbnN0YW5jZW9mIFNlbVZlcikge1xuICAgIGlmICh2ZXJzaW9uLmxvb3NlID09PSBvcHRpb25zLmxvb3NlKVxuICAgICAgcmV0dXJuIHZlcnNpb247XG4gICAgZWxzZVxuICAgICAgdmVyc2lvbiA9IHZlcnNpb24udmVyc2lvbjtcbiAgfSBlbHNlIGlmICh0eXBlb2YgdmVyc2lvbiAhPT0gJ3N0cmluZycpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIFZlcnNpb246ICcgKyB2ZXJzaW9uKTtcbiAgfVxuXG4gIGlmICh2ZXJzaW9uLmxlbmd0aCA+IE1BWF9MRU5HVEgpXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcigndmVyc2lvbiBpcyBsb25nZXIgdGhhbiAnICsgTUFYX0xFTkdUSCArICcgY2hhcmFjdGVycycpXG5cbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIFNlbVZlcikpXG4gICAgcmV0dXJuIG5ldyBTZW1WZXIodmVyc2lvbiwgb3B0aW9ucyk7XG5cbiAgZGVidWcoJ1NlbVZlcicsIHZlcnNpb24sIG9wdGlvbnMpO1xuICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICB0aGlzLmxvb3NlID0gISFvcHRpb25zLmxvb3NlO1xuXG4gIHZhciBtID0gdmVyc2lvbi50cmltKCkubWF0Y2gob3B0aW9ucy5sb29zZSA/IHJlW0xPT1NFXSA6IHJlW0ZVTExdKTtcblxuICBpZiAoIW0pXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBWZXJzaW9uOiAnICsgdmVyc2lvbik7XG5cbiAgdGhpcy5yYXcgPSB2ZXJzaW9uO1xuXG4gIC8vIHRoZXNlIGFyZSBhY3R1YWxseSBudW1iZXJzXG4gIHRoaXMubWFqb3IgPSArbVsxXTtcbiAgdGhpcy5taW5vciA9ICttWzJdO1xuICB0aGlzLnBhdGNoID0gK21bM107XG5cbiAgaWYgKHRoaXMubWFqb3IgPiBNQVhfU0FGRV9JTlRFR0VSIHx8IHRoaXMubWFqb3IgPCAwKVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgbWFqb3IgdmVyc2lvbicpXG5cbiAgaWYgKHRoaXMubWlub3IgPiBNQVhfU0FGRV9JTlRFR0VSIHx8IHRoaXMubWlub3IgPCAwKVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgbWlub3IgdmVyc2lvbicpXG5cbiAgaWYgKHRoaXMucGF0Y2ggPiBNQVhfU0FGRV9JTlRFR0VSIHx8IHRoaXMucGF0Y2ggPCAwKVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgcGF0Y2ggdmVyc2lvbicpXG5cbiAgLy8gbnVtYmVyaWZ5IGFueSBwcmVyZWxlYXNlIG51bWVyaWMgaWRzXG4gIGlmICghbVs0XSlcbiAgICB0aGlzLnByZXJlbGVhc2UgPSBbXTtcbiAgZWxzZVxuICAgIHRoaXMucHJlcmVsZWFzZSA9IG1bNF0uc3BsaXQoJy4nKS5tYXAoZnVuY3Rpb24oaWQpIHtcbiAgICAgIGlmICgvXlswLTldKyQvLnRlc3QoaWQpKSB7XG4gICAgICAgIHZhciBudW0gPSAraWQ7XG4gICAgICAgIGlmIChudW0gPj0gMCAmJiBudW0gPCBNQVhfU0FGRV9JTlRFR0VSKVxuICAgICAgICAgIHJldHVybiBudW07XG4gICAgICB9XG4gICAgICByZXR1cm4gaWQ7XG4gICAgfSk7XG5cbiAgdGhpcy5idWlsZCA9IG1bNV0gPyBtWzVdLnNwbGl0KCcuJykgOiBbXTtcbiAgdGhpcy5mb3JtYXQoKTtcbn1cblxuU2VtVmVyLnByb3RvdHlwZS5mb3JtYXQgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy52ZXJzaW9uID0gdGhpcy5tYWpvciArICcuJyArIHRoaXMubWlub3IgKyAnLicgKyB0aGlzLnBhdGNoO1xuICBpZiAodGhpcy5wcmVyZWxlYXNlLmxlbmd0aClcbiAgICB0aGlzLnZlcnNpb24gKz0gJy0nICsgdGhpcy5wcmVyZWxlYXNlLmpvaW4oJy4nKTtcbiAgcmV0dXJuIHRoaXMudmVyc2lvbjtcbn07XG5cblNlbVZlci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMudmVyc2lvbjtcbn07XG5cblNlbVZlci5wcm90b3R5cGUuY29tcGFyZSA9IGZ1bmN0aW9uKG90aGVyKSB7XG4gIGRlYnVnKCdTZW1WZXIuY29tcGFyZScsIHRoaXMudmVyc2lvbiwgdGhpcy5vcHRpb25zLCBvdGhlcik7XG4gIGlmICghKG90aGVyIGluc3RhbmNlb2YgU2VtVmVyKSlcbiAgICBvdGhlciA9IG5ldyBTZW1WZXIob3RoZXIsIHRoaXMub3B0aW9ucyk7XG5cbiAgcmV0dXJuIHRoaXMuY29tcGFyZU1haW4ob3RoZXIpIHx8IHRoaXMuY29tcGFyZVByZShvdGhlcik7XG59O1xuXG5TZW1WZXIucHJvdG90eXBlLmNvbXBhcmVNYWluID0gZnVuY3Rpb24ob3RoZXIpIHtcbiAgaWYgKCEob3RoZXIgaW5zdGFuY2VvZiBTZW1WZXIpKVxuICAgIG90aGVyID0gbmV3IFNlbVZlcihvdGhlciwgdGhpcy5vcHRpb25zKTtcblxuICByZXR1cm4gY29tcGFyZUlkZW50aWZpZXJzKHRoaXMubWFqb3IsIG90aGVyLm1ham9yKSB8fFxuICAgICAgICAgY29tcGFyZUlkZW50aWZpZXJzKHRoaXMubWlub3IsIG90aGVyLm1pbm9yKSB8fFxuICAgICAgICAgY29tcGFyZUlkZW50aWZpZXJzKHRoaXMucGF0Y2gsIG90aGVyLnBhdGNoKTtcbn07XG5cblNlbVZlci5wcm90b3R5cGUuY29tcGFyZVByZSA9IGZ1bmN0aW9uKG90aGVyKSB7XG4gIGlmICghKG90aGVyIGluc3RhbmNlb2YgU2VtVmVyKSlcbiAgICBvdGhlciA9IG5ldyBTZW1WZXIob3RoZXIsIHRoaXMub3B0aW9ucyk7XG5cbiAgLy8gTk9UIGhhdmluZyBhIHByZXJlbGVhc2UgaXMgPiBoYXZpbmcgb25lXG4gIGlmICh0aGlzLnByZXJlbGVhc2UubGVuZ3RoICYmICFvdGhlci5wcmVyZWxlYXNlLmxlbmd0aClcbiAgICByZXR1cm4gLTE7XG4gIGVsc2UgaWYgKCF0aGlzLnByZXJlbGVhc2UubGVuZ3RoICYmIG90aGVyLnByZXJlbGVhc2UubGVuZ3RoKVxuICAgIHJldHVybiAxO1xuICBlbHNlIGlmICghdGhpcy5wcmVyZWxlYXNlLmxlbmd0aCAmJiAhb3RoZXIucHJlcmVsZWFzZS5sZW5ndGgpXG4gICAgcmV0dXJuIDA7XG5cbiAgdmFyIGkgPSAwO1xuICBkbyB7XG4gICAgdmFyIGEgPSB0aGlzLnByZXJlbGVhc2VbaV07XG4gICAgdmFyIGIgPSBvdGhlci5wcmVyZWxlYXNlW2ldO1xuICAgIGRlYnVnKCdwcmVyZWxlYXNlIGNvbXBhcmUnLCBpLCBhLCBiKTtcbiAgICBpZiAoYSA9PT0gdW5kZWZpbmVkICYmIGIgPT09IHVuZGVmaW5lZClcbiAgICAgIHJldHVybiAwO1xuICAgIGVsc2UgaWYgKGIgPT09IHVuZGVmaW5lZClcbiAgICAgIHJldHVybiAxO1xuICAgIGVsc2UgaWYgKGEgPT09IHVuZGVmaW5lZClcbiAgICAgIHJldHVybiAtMTtcbiAgICBlbHNlIGlmIChhID09PSBiKVxuICAgICAgY29udGludWU7XG4gICAgZWxzZVxuICAgICAgcmV0dXJuIGNvbXBhcmVJZGVudGlmaWVycyhhLCBiKTtcbiAgfSB3aGlsZSAoKytpKTtcbn07XG5cbi8vIHByZW1pbm9yIHdpbGwgYnVtcCB0aGUgdmVyc2lvbiB1cCB0byB0aGUgbmV4dCBtaW5vciByZWxlYXNlLCBhbmQgaW1tZWRpYXRlbHlcbi8vIGRvd24gdG8gcHJlLXJlbGVhc2UuIHByZW1ham9yIGFuZCBwcmVwYXRjaCB3b3JrIHRoZSBzYW1lIHdheS5cblNlbVZlci5wcm90b3R5cGUuaW5jID0gZnVuY3Rpb24ocmVsZWFzZSwgaWRlbnRpZmllcikge1xuICBzd2l0Y2ggKHJlbGVhc2UpIHtcbiAgICBjYXNlICdwcmVtYWpvcic6XG4gICAgICB0aGlzLnByZXJlbGVhc2UubGVuZ3RoID0gMDtcbiAgICAgIHRoaXMucGF0Y2ggPSAwO1xuICAgICAgdGhpcy5taW5vciA9IDA7XG4gICAgICB0aGlzLm1ham9yKys7XG4gICAgICB0aGlzLmluYygncHJlJywgaWRlbnRpZmllcik7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdwcmVtaW5vcic6XG4gICAgICB0aGlzLnByZXJlbGVhc2UubGVuZ3RoID0gMDtcbiAgICAgIHRoaXMucGF0Y2ggPSAwO1xuICAgICAgdGhpcy5taW5vcisrO1xuICAgICAgdGhpcy5pbmMoJ3ByZScsIGlkZW50aWZpZXIpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncHJlcGF0Y2gnOlxuICAgICAgLy8gSWYgdGhpcyBpcyBhbHJlYWR5IGEgcHJlcmVsZWFzZSwgaXQgd2lsbCBidW1wIHRvIHRoZSBuZXh0IHZlcnNpb25cbiAgICAgIC8vIGRyb3AgYW55IHByZXJlbGVhc2VzIHRoYXQgbWlnaHQgYWxyZWFkeSBleGlzdCwgc2luY2UgdGhleSBhcmUgbm90XG4gICAgICAvLyByZWxldmFudCBhdCB0aGlzIHBvaW50LlxuICAgICAgdGhpcy5wcmVyZWxlYXNlLmxlbmd0aCA9IDA7XG4gICAgICB0aGlzLmluYygncGF0Y2gnLCBpZGVudGlmaWVyKTtcbiAgICAgIHRoaXMuaW5jKCdwcmUnLCBpZGVudGlmaWVyKTtcbiAgICAgIGJyZWFrO1xuICAgIC8vIElmIHRoZSBpbnB1dCBpcyBhIG5vbi1wcmVyZWxlYXNlIHZlcnNpb24sIHRoaXMgYWN0cyB0aGUgc2FtZSBhc1xuICAgIC8vIHByZXBhdGNoLlxuICAgIGNhc2UgJ3ByZXJlbGVhc2UnOlxuICAgICAgaWYgKHRoaXMucHJlcmVsZWFzZS5sZW5ndGggPT09IDApXG4gICAgICAgIHRoaXMuaW5jKCdwYXRjaCcsIGlkZW50aWZpZXIpO1xuICAgICAgdGhpcy5pbmMoJ3ByZScsIGlkZW50aWZpZXIpO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICdtYWpvcic6XG4gICAgICAvLyBJZiB0aGlzIGlzIGEgcHJlLW1ham9yIHZlcnNpb24sIGJ1bXAgdXAgdG8gdGhlIHNhbWUgbWFqb3IgdmVyc2lvbi5cbiAgICAgIC8vIE90aGVyd2lzZSBpbmNyZW1lbnQgbWFqb3IuXG4gICAgICAvLyAxLjAuMC01IGJ1bXBzIHRvIDEuMC4wXG4gICAgICAvLyAxLjEuMCBidW1wcyB0byAyLjAuMFxuICAgICAgaWYgKHRoaXMubWlub3IgIT09IDAgfHwgdGhpcy5wYXRjaCAhPT0gMCB8fCB0aGlzLnByZXJlbGVhc2UubGVuZ3RoID09PSAwKVxuICAgICAgICB0aGlzLm1ham9yKys7XG4gICAgICB0aGlzLm1pbm9yID0gMDtcbiAgICAgIHRoaXMucGF0Y2ggPSAwO1xuICAgICAgdGhpcy5wcmVyZWxlYXNlID0gW107XG4gICAgICBicmVhaztcbiAgICBjYXNlICdtaW5vcic6XG4gICAgICAvLyBJZiB0aGlzIGlzIGEgcHJlLW1pbm9yIHZlcnNpb24sIGJ1bXAgdXAgdG8gdGhlIHNhbWUgbWlub3IgdmVyc2lvbi5cbiAgICAgIC8vIE90aGVyd2lzZSBpbmNyZW1lbnQgbWlub3IuXG4gICAgICAvLyAxLjIuMC01IGJ1bXBzIHRvIDEuMi4wXG4gICAgICAvLyAxLjIuMSBidW1wcyB0byAxLjMuMFxuICAgICAgaWYgKHRoaXMucGF0Y2ggIT09IDAgfHwgdGhpcy5wcmVyZWxlYXNlLmxlbmd0aCA9PT0gMClcbiAgICAgICAgdGhpcy5taW5vcisrO1xuICAgICAgdGhpcy5wYXRjaCA9IDA7XG4gICAgICB0aGlzLnByZXJlbGVhc2UgPSBbXTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3BhdGNoJzpcbiAgICAgIC8vIElmIHRoaXMgaXMgbm90IGEgcHJlLXJlbGVhc2UgdmVyc2lvbiwgaXQgd2lsbCBpbmNyZW1lbnQgdGhlIHBhdGNoLlxuICAgICAgLy8gSWYgaXQgaXMgYSBwcmUtcmVsZWFzZSBpdCB3aWxsIGJ1bXAgdXAgdG8gdGhlIHNhbWUgcGF0Y2ggdmVyc2lvbi5cbiAgICAgIC8vIDEuMi4wLTUgcGF0Y2hlcyB0byAxLjIuMFxuICAgICAgLy8gMS4yLjAgcGF0Y2hlcyB0byAxLjIuMVxuICAgICAgaWYgKHRoaXMucHJlcmVsZWFzZS5sZW5ndGggPT09IDApXG4gICAgICAgIHRoaXMucGF0Y2grKztcbiAgICAgIHRoaXMucHJlcmVsZWFzZSA9IFtdO1xuICAgICAgYnJlYWs7XG4gICAgLy8gVGhpcyBwcm9iYWJseSBzaG91bGRuJ3QgYmUgdXNlZCBwdWJsaWNseS5cbiAgICAvLyAxLjAuMCBcInByZVwiIHdvdWxkIGJlY29tZSAxLjAuMC0wIHdoaWNoIGlzIHRoZSB3cm9uZyBkaXJlY3Rpb24uXG4gICAgY2FzZSAncHJlJzpcbiAgICAgIGlmICh0aGlzLnByZXJlbGVhc2UubGVuZ3RoID09PSAwKVxuICAgICAgICB0aGlzLnByZXJlbGVhc2UgPSBbMF07XG4gICAgICBlbHNlIHtcbiAgICAgICAgdmFyIGkgPSB0aGlzLnByZXJlbGVhc2UubGVuZ3RoO1xuICAgICAgICB3aGlsZSAoLS1pID49IDApIHtcbiAgICAgICAgICBpZiAodHlwZW9mIHRoaXMucHJlcmVsZWFzZVtpXSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIHRoaXMucHJlcmVsZWFzZVtpXSsrO1xuICAgICAgICAgICAgaSA9IC0yO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoaSA9PT0gLTEpIC8vIGRpZG4ndCBpbmNyZW1lbnQgYW55dGhpbmdcbiAgICAgICAgICB0aGlzLnByZXJlbGVhc2UucHVzaCgwKTtcbiAgICAgIH1cbiAgICAgIGlmIChpZGVudGlmaWVyKSB7XG4gICAgICAgIC8vIDEuMi4wLWJldGEuMSBidW1wcyB0byAxLjIuMC1iZXRhLjIsXG4gICAgICAgIC8vIDEuMi4wLWJldGEuZm9vYmx6IG9yIDEuMi4wLWJldGEgYnVtcHMgdG8gMS4yLjAtYmV0YS4wXG4gICAgICAgIGlmICh0aGlzLnByZXJlbGVhc2VbMF0gPT09IGlkZW50aWZpZXIpIHtcbiAgICAgICAgICBpZiAoaXNOYU4odGhpcy5wcmVyZWxlYXNlWzFdKSlcbiAgICAgICAgICAgIHRoaXMucHJlcmVsZWFzZSA9IFtpZGVudGlmaWVyLCAwXTtcbiAgICAgICAgfSBlbHNlXG4gICAgICAgICAgdGhpcy5wcmVyZWxlYXNlID0gW2lkZW50aWZpZXIsIDBdO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGluY3JlbWVudCBhcmd1bWVudDogJyArIHJlbGVhc2UpO1xuICB9XG4gIHRoaXMuZm9ybWF0KCk7XG4gIHRoaXMucmF3ID0gdGhpcy52ZXJzaW9uO1xuICByZXR1cm4gdGhpcztcbn07XG5cbmV4cG9ydHMuaW5jID0gaW5jO1xuZnVuY3Rpb24gaW5jKHZlcnNpb24sIHJlbGVhc2UsIGxvb3NlLCBpZGVudGlmaWVyKSB7XG4gIGlmICh0eXBlb2YobG9vc2UpID09PSAnc3RyaW5nJykge1xuICAgIGlkZW50aWZpZXIgPSBsb29zZTtcbiAgICBsb29zZSA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIHRyeSB7XG4gICAgcmV0dXJuIG5ldyBTZW1WZXIodmVyc2lvbiwgbG9vc2UpLmluYyhyZWxlYXNlLCBpZGVudGlmaWVyKS52ZXJzaW9uO1xuICB9IGNhdGNoIChlcikge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbmV4cG9ydHMuZGlmZiA9IGRpZmY7XG5mdW5jdGlvbiBkaWZmKHZlcnNpb24xLCB2ZXJzaW9uMikge1xuICBpZiAoZXEodmVyc2lvbjEsIHZlcnNpb24yKSkge1xuICAgIHJldHVybiBudWxsO1xuICB9IGVsc2Uge1xuICAgIHZhciB2MSA9IHBhcnNlKHZlcnNpb24xKTtcbiAgICB2YXIgdjIgPSBwYXJzZSh2ZXJzaW9uMik7XG4gICAgaWYgKHYxLnByZXJlbGVhc2UubGVuZ3RoIHx8IHYyLnByZXJlbGVhc2UubGVuZ3RoKSB7XG4gICAgICBmb3IgKHZhciBrZXkgaW4gdjEpIHtcbiAgICAgICAgaWYgKGtleSA9PT0gJ21ham9yJyB8fCBrZXkgPT09ICdtaW5vcicgfHwga2V5ID09PSAncGF0Y2gnKSB7XG4gICAgICAgICAgaWYgKHYxW2tleV0gIT09IHYyW2tleV0pIHtcbiAgICAgICAgICAgIHJldHVybiAncHJlJytrZXk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gJ3ByZXJlbGVhc2UnO1xuICAgIH1cbiAgICBmb3IgKHZhciBrZXkgaW4gdjEpIHtcbiAgICAgIGlmIChrZXkgPT09ICdtYWpvcicgfHwga2V5ID09PSAnbWlub3InIHx8IGtleSA9PT0gJ3BhdGNoJykge1xuICAgICAgICBpZiAodjFba2V5XSAhPT0gdjJba2V5XSkge1xuICAgICAgICAgIHJldHVybiBrZXk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0cy5jb21wYXJlSWRlbnRpZmllcnMgPSBjb21wYXJlSWRlbnRpZmllcnM7XG5cbnZhciBudW1lcmljID0gL15bMC05XSskLztcbmZ1bmN0aW9uIGNvbXBhcmVJZGVudGlmaWVycyhhLCBiKSB7XG4gIHZhciBhbnVtID0gbnVtZXJpYy50ZXN0KGEpO1xuICB2YXIgYm51bSA9IG51bWVyaWMudGVzdChiKTtcblxuICBpZiAoYW51bSAmJiBibnVtKSB7XG4gICAgYSA9ICthO1xuICAgIGIgPSArYjtcbiAgfVxuXG4gIHJldHVybiAoYW51bSAmJiAhYm51bSkgPyAtMSA6XG4gICAgICAgICAoYm51bSAmJiAhYW51bSkgPyAxIDpcbiAgICAgICAgIGEgPCBiID8gLTEgOlxuICAgICAgICAgYSA+IGIgPyAxIDpcbiAgICAgICAgIDA7XG59XG5cbmV4cG9ydHMucmNvbXBhcmVJZGVudGlmaWVycyA9IHJjb21wYXJlSWRlbnRpZmllcnM7XG5mdW5jdGlvbiByY29tcGFyZUlkZW50aWZpZXJzKGEsIGIpIHtcbiAgcmV0dXJuIGNvbXBhcmVJZGVudGlmaWVycyhiLCBhKTtcbn1cblxuZXhwb3J0cy5tYWpvciA9IG1ham9yO1xuZnVuY3Rpb24gbWFqb3IoYSwgbG9vc2UpIHtcbiAgcmV0dXJuIG5ldyBTZW1WZXIoYSwgbG9vc2UpLm1ham9yO1xufVxuXG5leHBvcnRzLm1pbm9yID0gbWlub3I7XG5mdW5jdGlvbiBtaW5vcihhLCBsb29zZSkge1xuICByZXR1cm4gbmV3IFNlbVZlcihhLCBsb29zZSkubWlub3I7XG59XG5cbmV4cG9ydHMucGF0Y2ggPSBwYXRjaDtcbmZ1bmN0aW9uIHBhdGNoKGEsIGxvb3NlKSB7XG4gIHJldHVybiBuZXcgU2VtVmVyKGEsIGxvb3NlKS5wYXRjaDtcbn1cblxuZXhwb3J0cy5jb21wYXJlID0gY29tcGFyZTtcbmZ1bmN0aW9uIGNvbXBhcmUoYSwgYiwgbG9vc2UpIHtcbiAgcmV0dXJuIG5ldyBTZW1WZXIoYSwgbG9vc2UpLmNvbXBhcmUobmV3IFNlbVZlcihiLCBsb29zZSkpO1xufVxuXG5leHBvcnRzLmNvbXBhcmVMb29zZSA9IGNvbXBhcmVMb29zZTtcbmZ1bmN0aW9uIGNvbXBhcmVMb29zZShhLCBiKSB7XG4gIHJldHVybiBjb21wYXJlKGEsIGIsIHRydWUpO1xufVxuXG5leHBvcnRzLnJjb21wYXJlID0gcmNvbXBhcmU7XG5mdW5jdGlvbiByY29tcGFyZShhLCBiLCBsb29zZSkge1xuICByZXR1cm4gY29tcGFyZShiLCBhLCBsb29zZSk7XG59XG5cbmV4cG9ydHMuc29ydCA9IHNvcnQ7XG5mdW5jdGlvbiBzb3J0KGxpc3QsIGxvb3NlKSB7XG4gIHJldHVybiBsaXN0LnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgIHJldHVybiBleHBvcnRzLmNvbXBhcmUoYSwgYiwgbG9vc2UpO1xuICB9KTtcbn1cblxuZXhwb3J0cy5yc29ydCA9IHJzb3J0O1xuZnVuY3Rpb24gcnNvcnQobGlzdCwgbG9vc2UpIHtcbiAgcmV0dXJuIGxpc3Quc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgcmV0dXJuIGV4cG9ydHMucmNvbXBhcmUoYSwgYiwgbG9vc2UpO1xuICB9KTtcbn1cblxuZXhwb3J0cy5ndCA9IGd0O1xuZnVuY3Rpb24gZ3QoYSwgYiwgbG9vc2UpIHtcbiAgcmV0dXJuIGNvbXBhcmUoYSwgYiwgbG9vc2UpID4gMDtcbn1cblxuZXhwb3J0cy5sdCA9IGx0O1xuZnVuY3Rpb24gbHQoYSwgYiwgbG9vc2UpIHtcbiAgcmV0dXJuIGNvbXBhcmUoYSwgYiwgbG9vc2UpIDwgMDtcbn1cblxuZXhwb3J0cy5lcSA9IGVxO1xuZnVuY3Rpb24gZXEoYSwgYiwgbG9vc2UpIHtcbiAgcmV0dXJuIGNvbXBhcmUoYSwgYiwgbG9vc2UpID09PSAwO1xufVxuXG5leHBvcnRzLm5lcSA9IG5lcTtcbmZ1bmN0aW9uIG5lcShhLCBiLCBsb29zZSkge1xuICByZXR1cm4gY29tcGFyZShhLCBiLCBsb29zZSkgIT09IDA7XG59XG5cbmV4cG9ydHMuZ3RlID0gZ3RlO1xuZnVuY3Rpb24gZ3RlKGEsIGIsIGxvb3NlKSB7XG4gIHJldHVybiBjb21wYXJlKGEsIGIsIGxvb3NlKSA+PSAwO1xufVxuXG5leHBvcnRzLmx0ZSA9IGx0ZTtcbmZ1bmN0aW9uIGx0ZShhLCBiLCBsb29zZSkge1xuICByZXR1cm4gY29tcGFyZShhLCBiLCBsb29zZSkgPD0gMDtcbn1cblxuZXhwb3J0cy5jbXAgPSBjbXA7XG5mdW5jdGlvbiBjbXAoYSwgb3AsIGIsIGxvb3NlKSB7XG4gIHZhciByZXQ7XG4gIHN3aXRjaCAob3ApIHtcbiAgICBjYXNlICc9PT0nOlxuICAgICAgaWYgKHR5cGVvZiBhID09PSAnb2JqZWN0JykgYSA9IGEudmVyc2lvbjtcbiAgICAgIGlmICh0eXBlb2YgYiA9PT0gJ29iamVjdCcpIGIgPSBiLnZlcnNpb247XG4gICAgICByZXQgPSBhID09PSBiO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnIT09JzpcbiAgICAgIGlmICh0eXBlb2YgYSA9PT0gJ29iamVjdCcpIGEgPSBhLnZlcnNpb247XG4gICAgICBpZiAodHlwZW9mIGIgPT09ICdvYmplY3QnKSBiID0gYi52ZXJzaW9uO1xuICAgICAgcmV0ID0gYSAhPT0gYjtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJyc6IGNhc2UgJz0nOiBjYXNlICc9PSc6IHJldCA9IGVxKGEsIGIsIGxvb3NlKTsgYnJlYWs7XG4gICAgY2FzZSAnIT0nOiByZXQgPSBuZXEoYSwgYiwgbG9vc2UpOyBicmVhaztcbiAgICBjYXNlICc+JzogcmV0ID0gZ3QoYSwgYiwgbG9vc2UpOyBicmVhaztcbiAgICBjYXNlICc+PSc6IHJldCA9IGd0ZShhLCBiLCBsb29zZSk7IGJyZWFrO1xuICAgIGNhc2UgJzwnOiByZXQgPSBsdChhLCBiLCBsb29zZSk7IGJyZWFrO1xuICAgIGNhc2UgJzw9JzogcmV0ID0gbHRlKGEsIGIsIGxvb3NlKTsgYnJlYWs7XG4gICAgZGVmYXVsdDogdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBvcGVyYXRvcjogJyArIG9wKTtcbiAgfVxuICByZXR1cm4gcmV0O1xufVxuXG5leHBvcnRzLkNvbXBhcmF0b3IgPSBDb21wYXJhdG9yO1xuZnVuY3Rpb24gQ29tcGFyYXRvcihjb21wLCBvcHRpb25zKSB7XG4gIGlmICghb3B0aW9ucyB8fCB0eXBlb2Ygb3B0aW9ucyAhPT0gJ29iamVjdCcpXG4gICAgb3B0aW9ucyA9IHsgbG9vc2U6ICEhb3B0aW9ucywgaW5jbHVkZVByZXJlbGVhc2U6IGZhbHNlIH1cblxuICBpZiAoY29tcCBpbnN0YW5jZW9mIENvbXBhcmF0b3IpIHtcbiAgICBpZiAoY29tcC5sb29zZSA9PT0gISFvcHRpb25zLmxvb3NlKVxuICAgICAgcmV0dXJuIGNvbXA7XG4gICAgZWxzZVxuICAgICAgY29tcCA9IGNvbXAudmFsdWU7XG4gIH1cblxuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgQ29tcGFyYXRvcikpXG4gICAgcmV0dXJuIG5ldyBDb21wYXJhdG9yKGNvbXAsIG9wdGlvbnMpO1xuXG4gIGRlYnVnKCdjb21wYXJhdG9yJywgY29tcCwgb3B0aW9ucyk7XG4gIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gIHRoaXMubG9vc2UgPSAhIW9wdGlvbnMubG9vc2U7XG4gIHRoaXMucGFyc2UoY29tcCk7XG5cbiAgaWYgKHRoaXMuc2VtdmVyID09PSBBTlkpXG4gICAgdGhpcy52YWx1ZSA9ICcnO1xuICBlbHNlXG4gICAgdGhpcy52YWx1ZSA9IHRoaXMub3BlcmF0b3IgKyB0aGlzLnNlbXZlci52ZXJzaW9uO1xuXG4gIGRlYnVnKCdjb21wJywgdGhpcyk7XG59XG5cbnZhciBBTlkgPSB7fTtcbkNvbXBhcmF0b3IucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24oY29tcCkge1xuICB2YXIgciA9IHRoaXMub3B0aW9ucy5sb29zZSA/IHJlW0NPTVBBUkFUT1JMT09TRV0gOiByZVtDT01QQVJBVE9SXTtcbiAgdmFyIG0gPSBjb21wLm1hdGNoKHIpO1xuXG4gIGlmICghbSlcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIGNvbXBhcmF0b3I6ICcgKyBjb21wKTtcblxuICB0aGlzLm9wZXJhdG9yID0gbVsxXTtcbiAgaWYgKHRoaXMub3BlcmF0b3IgPT09ICc9JylcbiAgICB0aGlzLm9wZXJhdG9yID0gJyc7XG5cbiAgLy8gaWYgaXQgbGl0ZXJhbGx5IGlzIGp1c3QgJz4nIG9yICcnIHRoZW4gYWxsb3cgYW55dGhpbmcuXG4gIGlmICghbVsyXSlcbiAgICB0aGlzLnNlbXZlciA9IEFOWTtcbiAgZWxzZVxuICAgIHRoaXMuc2VtdmVyID0gbmV3IFNlbVZlcihtWzJdLCB0aGlzLm9wdGlvbnMubG9vc2UpO1xufTtcblxuQ29tcGFyYXRvci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMudmFsdWU7XG59O1xuXG5Db21wYXJhdG9yLnByb3RvdHlwZS50ZXN0ID0gZnVuY3Rpb24odmVyc2lvbikge1xuICBkZWJ1ZygnQ29tcGFyYXRvci50ZXN0JywgdmVyc2lvbiwgdGhpcy5vcHRpb25zLmxvb3NlKTtcblxuICBpZiAodGhpcy5zZW12ZXIgPT09IEFOWSlcbiAgICByZXR1cm4gdHJ1ZTtcblxuICBpZiAodHlwZW9mIHZlcnNpb24gPT09ICdzdHJpbmcnKVxuICAgIHZlcnNpb24gPSBuZXcgU2VtVmVyKHZlcnNpb24sIHRoaXMub3B0aW9ucyk7XG5cbiAgcmV0dXJuIGNtcCh2ZXJzaW9uLCB0aGlzLm9wZXJhdG9yLCB0aGlzLnNlbXZlciwgdGhpcy5vcHRpb25zKTtcbn07XG5cbkNvbXBhcmF0b3IucHJvdG90eXBlLmludGVyc2VjdHMgPSBmdW5jdGlvbihjb21wLCBvcHRpb25zKSB7XG4gIGlmICghKGNvbXAgaW5zdGFuY2VvZiBDb21wYXJhdG9yKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2EgQ29tcGFyYXRvciBpcyByZXF1aXJlZCcpO1xuICB9XG5cbiAgaWYgKCFvcHRpb25zIHx8IHR5cGVvZiBvcHRpb25zICE9PSAnb2JqZWN0JylcbiAgICBvcHRpb25zID0geyBsb29zZTogISFvcHRpb25zLCBpbmNsdWRlUHJlcmVsZWFzZTogZmFsc2UgfVxuXG4gIHZhciByYW5nZVRtcDtcblxuICBpZiAodGhpcy5vcGVyYXRvciA9PT0gJycpIHtcbiAgICByYW5nZVRtcCA9IG5ldyBSYW5nZShjb21wLnZhbHVlLCBvcHRpb25zKTtcbiAgICByZXR1cm4gc2F0aXNmaWVzKHRoaXMudmFsdWUsIHJhbmdlVG1wLCBvcHRpb25zKTtcbiAgfSBlbHNlIGlmIChjb21wLm9wZXJhdG9yID09PSAnJykge1xuICAgIHJhbmdlVG1wID0gbmV3IFJhbmdlKHRoaXMudmFsdWUsIG9wdGlvbnMpO1xuICAgIHJldHVybiBzYXRpc2ZpZXMoY29tcC5zZW12ZXIsIHJhbmdlVG1wLCBvcHRpb25zKTtcbiAgfVxuXG4gIHZhciBzYW1lRGlyZWN0aW9uSW5jcmVhc2luZyA9XG4gICAgKHRoaXMub3BlcmF0b3IgPT09ICc+PScgfHwgdGhpcy5vcGVyYXRvciA9PT0gJz4nKSAmJlxuICAgIChjb21wLm9wZXJhdG9yID09PSAnPj0nIHx8IGNvbXAub3BlcmF0b3IgPT09ICc+Jyk7XG4gIHZhciBzYW1lRGlyZWN0aW9uRGVjcmVhc2luZyA9XG4gICAgKHRoaXMub3BlcmF0b3IgPT09ICc8PScgfHwgdGhpcy5vcGVyYXRvciA9PT0gJzwnKSAmJlxuICAgIChjb21wLm9wZXJhdG9yID09PSAnPD0nIHx8IGNvbXAub3BlcmF0b3IgPT09ICc8Jyk7XG4gIHZhciBzYW1lU2VtVmVyID0gdGhpcy5zZW12ZXIudmVyc2lvbiA9PT0gY29tcC5zZW12ZXIudmVyc2lvbjtcbiAgdmFyIGRpZmZlcmVudERpcmVjdGlvbnNJbmNsdXNpdmUgPVxuICAgICh0aGlzLm9wZXJhdG9yID09PSAnPj0nIHx8IHRoaXMub3BlcmF0b3IgPT09ICc8PScpICYmXG4gICAgKGNvbXAub3BlcmF0b3IgPT09ICc+PScgfHwgY29tcC5vcGVyYXRvciA9PT0gJzw9Jyk7XG4gIHZhciBvcHBvc2l0ZURpcmVjdGlvbnNMZXNzVGhhbiA9XG4gICAgY21wKHRoaXMuc2VtdmVyLCAnPCcsIGNvbXAuc2VtdmVyLCBvcHRpb25zKSAmJlxuICAgICgodGhpcy5vcGVyYXRvciA9PT0gJz49JyB8fCB0aGlzLm9wZXJhdG9yID09PSAnPicpICYmXG4gICAgKGNvbXAub3BlcmF0b3IgPT09ICc8PScgfHwgY29tcC5vcGVyYXRvciA9PT0gJzwnKSk7XG4gIHZhciBvcHBvc2l0ZURpcmVjdGlvbnNHcmVhdGVyVGhhbiA9XG4gICAgY21wKHRoaXMuc2VtdmVyLCAnPicsIGNvbXAuc2VtdmVyLCBvcHRpb25zKSAmJlxuICAgICgodGhpcy5vcGVyYXRvciA9PT0gJzw9JyB8fCB0aGlzLm9wZXJhdG9yID09PSAnPCcpICYmXG4gICAgKGNvbXAub3BlcmF0b3IgPT09ICc+PScgfHwgY29tcC5vcGVyYXRvciA9PT0gJz4nKSk7XG5cbiAgcmV0dXJuIHNhbWVEaXJlY3Rpb25JbmNyZWFzaW5nIHx8IHNhbWVEaXJlY3Rpb25EZWNyZWFzaW5nIHx8XG4gICAgKHNhbWVTZW1WZXIgJiYgZGlmZmVyZW50RGlyZWN0aW9uc0luY2x1c2l2ZSkgfHxcbiAgICBvcHBvc2l0ZURpcmVjdGlvbnNMZXNzVGhhbiB8fCBvcHBvc2l0ZURpcmVjdGlvbnNHcmVhdGVyVGhhbjtcbn07XG5cblxuZXhwb3J0cy5SYW5nZSA9IFJhbmdlO1xuZnVuY3Rpb24gUmFuZ2UocmFuZ2UsIG9wdGlvbnMpIHtcbiAgaWYgKCFvcHRpb25zIHx8IHR5cGVvZiBvcHRpb25zICE9PSAnb2JqZWN0JylcbiAgICBvcHRpb25zID0geyBsb29zZTogISFvcHRpb25zLCBpbmNsdWRlUHJlcmVsZWFzZTogZmFsc2UgfVxuXG4gIGlmIChyYW5nZSBpbnN0YW5jZW9mIFJhbmdlKSB7XG4gICAgaWYgKHJhbmdlLmxvb3NlID09PSAhIW9wdGlvbnMubG9vc2UgJiZcbiAgICAgICAgcmFuZ2UuaW5jbHVkZVByZXJlbGVhc2UgPT09ICEhb3B0aW9ucy5pbmNsdWRlUHJlcmVsZWFzZSkge1xuICAgICAgcmV0dXJuIHJhbmdlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbmV3IFJhbmdlKHJhbmdlLnJhdywgb3B0aW9ucyk7XG4gICAgfVxuICB9XG5cbiAgaWYgKHJhbmdlIGluc3RhbmNlb2YgQ29tcGFyYXRvcikge1xuICAgIHJldHVybiBuZXcgUmFuZ2UocmFuZ2UudmFsdWUsIG9wdGlvbnMpO1xuICB9XG5cbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIFJhbmdlKSlcbiAgICByZXR1cm4gbmV3IFJhbmdlKHJhbmdlLCBvcHRpb25zKTtcblxuICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICB0aGlzLmxvb3NlID0gISFvcHRpb25zLmxvb3NlO1xuICB0aGlzLmluY2x1ZGVQcmVyZWxlYXNlID0gISFvcHRpb25zLmluY2x1ZGVQcmVyZWxlYXNlXG5cbiAgLy8gRmlyc3QsIHNwbGl0IGJhc2VkIG9uIGJvb2xlYW4gb3IgfHxcbiAgdGhpcy5yYXcgPSByYW5nZTtcbiAgdGhpcy5zZXQgPSByYW5nZS5zcGxpdCgvXFxzKlxcfFxcfFxccyovKS5tYXAoZnVuY3Rpb24ocmFuZ2UpIHtcbiAgICByZXR1cm4gdGhpcy5wYXJzZVJhbmdlKHJhbmdlLnRyaW0oKSk7XG4gIH0sIHRoaXMpLmZpbHRlcihmdW5jdGlvbihjKSB7XG4gICAgLy8gdGhyb3cgb3V0IGFueSB0aGF0IGFyZSBub3QgcmVsZXZhbnQgZm9yIHdoYXRldmVyIHJlYXNvblxuICAgIHJldHVybiBjLmxlbmd0aDtcbiAgfSk7XG5cbiAgaWYgKCF0aGlzLnNldC5sZW5ndGgpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIFNlbVZlciBSYW5nZTogJyArIHJhbmdlKTtcbiAgfVxuXG4gIHRoaXMuZm9ybWF0KCk7XG59XG5cblJhbmdlLnByb3RvdHlwZS5mb3JtYXQgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5yYW5nZSA9IHRoaXMuc2V0Lm1hcChmdW5jdGlvbihjb21wcykge1xuICAgIHJldHVybiBjb21wcy5qb2luKCcgJykudHJpbSgpO1xuICB9KS5qb2luKCd8fCcpLnRyaW0oKTtcbiAgcmV0dXJuIHRoaXMucmFuZ2U7XG59O1xuXG5SYW5nZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMucmFuZ2U7XG59O1xuXG5SYW5nZS5wcm90b3R5cGUucGFyc2VSYW5nZSA9IGZ1bmN0aW9uKHJhbmdlKSB7XG4gIHZhciBsb29zZSA9IHRoaXMub3B0aW9ucy5sb29zZTtcbiAgcmFuZ2UgPSByYW5nZS50cmltKCk7XG4gIC8vIGAxLjIuMyAtIDEuMi40YCA9PiBgPj0xLjIuMyA8PTEuMi40YFxuICB2YXIgaHIgPSBsb29zZSA/IHJlW0hZUEhFTlJBTkdFTE9PU0VdIDogcmVbSFlQSEVOUkFOR0VdO1xuICByYW5nZSA9IHJhbmdlLnJlcGxhY2UoaHIsIGh5cGhlblJlcGxhY2UpO1xuICBkZWJ1ZygnaHlwaGVuIHJlcGxhY2UnLCByYW5nZSk7XG4gIC8vIGA+IDEuMi4zIDwgMS4yLjVgID0+IGA+MS4yLjMgPDEuMi41YFxuICByYW5nZSA9IHJhbmdlLnJlcGxhY2UocmVbQ09NUEFSQVRPUlRSSU1dLCBjb21wYXJhdG9yVHJpbVJlcGxhY2UpO1xuICBkZWJ1ZygnY29tcGFyYXRvciB0cmltJywgcmFuZ2UsIHJlW0NPTVBBUkFUT1JUUklNXSk7XG5cbiAgLy8gYH4gMS4yLjNgID0+IGB+MS4yLjNgXG4gIHJhbmdlID0gcmFuZ2UucmVwbGFjZShyZVtUSUxERVRSSU1dLCB0aWxkZVRyaW1SZXBsYWNlKTtcblxuICAvLyBgXiAxLjIuM2AgPT4gYF4xLjIuM2BcbiAgcmFuZ2UgPSByYW5nZS5yZXBsYWNlKHJlW0NBUkVUVFJJTV0sIGNhcmV0VHJpbVJlcGxhY2UpO1xuXG4gIC8vIG5vcm1hbGl6ZSBzcGFjZXNcbiAgcmFuZ2UgPSByYW5nZS5zcGxpdCgvXFxzKy8pLmpvaW4oJyAnKTtcblxuICAvLyBBdCB0aGlzIHBvaW50LCB0aGUgcmFuZ2UgaXMgY29tcGxldGVseSB0cmltbWVkIGFuZFxuICAvLyByZWFkeSB0byBiZSBzcGxpdCBpbnRvIGNvbXBhcmF0b3JzLlxuXG4gIHZhciBjb21wUmUgPSBsb29zZSA/IHJlW0NPTVBBUkFUT1JMT09TRV0gOiByZVtDT01QQVJBVE9SXTtcbiAgdmFyIHNldCA9IHJhbmdlLnNwbGl0KCcgJykubWFwKGZ1bmN0aW9uKGNvbXApIHtcbiAgICByZXR1cm4gcGFyc2VDb21wYXJhdG9yKGNvbXAsIHRoaXMub3B0aW9ucyk7XG4gIH0sIHRoaXMpLmpvaW4oJyAnKS5zcGxpdCgvXFxzKy8pO1xuICBpZiAodGhpcy5vcHRpb25zLmxvb3NlKSB7XG4gICAgLy8gaW4gbG9vc2UgbW9kZSwgdGhyb3cgb3V0IGFueSB0aGF0IGFyZSBub3QgdmFsaWQgY29tcGFyYXRvcnNcbiAgICBzZXQgPSBzZXQuZmlsdGVyKGZ1bmN0aW9uKGNvbXApIHtcbiAgICAgIHJldHVybiAhIWNvbXAubWF0Y2goY29tcFJlKTtcbiAgICB9KTtcbiAgfVxuICBzZXQgPSBzZXQubWFwKGZ1bmN0aW9uKGNvbXApIHtcbiAgICByZXR1cm4gbmV3IENvbXBhcmF0b3IoY29tcCwgdGhpcy5vcHRpb25zKTtcbiAgfSwgdGhpcyk7XG5cbiAgcmV0dXJuIHNldDtcbn07XG5cblJhbmdlLnByb3RvdHlwZS5pbnRlcnNlY3RzID0gZnVuY3Rpb24ocmFuZ2UsIG9wdGlvbnMpIHtcbiAgaWYgKCEocmFuZ2UgaW5zdGFuY2VvZiBSYW5nZSkpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdhIFJhbmdlIGlzIHJlcXVpcmVkJyk7XG4gIH1cblxuICByZXR1cm4gdGhpcy5zZXQuc29tZShmdW5jdGlvbih0aGlzQ29tcGFyYXRvcnMpIHtcbiAgICByZXR1cm4gdGhpc0NvbXBhcmF0b3JzLmV2ZXJ5KGZ1bmN0aW9uKHRoaXNDb21wYXJhdG9yKSB7XG4gICAgICByZXR1cm4gcmFuZ2Uuc2V0LnNvbWUoZnVuY3Rpb24ocmFuZ2VDb21wYXJhdG9ycykge1xuICAgICAgICByZXR1cm4gcmFuZ2VDb21wYXJhdG9ycy5ldmVyeShmdW5jdGlvbihyYW5nZUNvbXBhcmF0b3IpIHtcbiAgICAgICAgICByZXR1cm4gdGhpc0NvbXBhcmF0b3IuaW50ZXJzZWN0cyhyYW5nZUNvbXBhcmF0b3IsIG9wdGlvbnMpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcbn07XG5cbi8vIE1vc3RseSBqdXN0IGZvciB0ZXN0aW5nIGFuZCBsZWdhY3kgQVBJIHJlYXNvbnNcbmV4cG9ydHMudG9Db21wYXJhdG9ycyA9IHRvQ29tcGFyYXRvcnM7XG5mdW5jdGlvbiB0b0NvbXBhcmF0b3JzKHJhbmdlLCBvcHRpb25zKSB7XG4gIHJldHVybiBuZXcgUmFuZ2UocmFuZ2UsIG9wdGlvbnMpLnNldC5tYXAoZnVuY3Rpb24oY29tcCkge1xuICAgIHJldHVybiBjb21wLm1hcChmdW5jdGlvbihjKSB7XG4gICAgICByZXR1cm4gYy52YWx1ZTtcbiAgICB9KS5qb2luKCcgJykudHJpbSgpLnNwbGl0KCcgJyk7XG4gIH0pO1xufVxuXG4vLyBjb21wcmlzZWQgb2YgeHJhbmdlcywgdGlsZGVzLCBzdGFycywgYW5kIGd0bHQncyBhdCB0aGlzIHBvaW50LlxuLy8gYWxyZWFkeSByZXBsYWNlZCB0aGUgaHlwaGVuIHJhbmdlc1xuLy8gdHVybiBpbnRvIGEgc2V0IG9mIEpVU1QgY29tcGFyYXRvcnMuXG5mdW5jdGlvbiBwYXJzZUNvbXBhcmF0b3IoY29tcCwgb3B0aW9ucykge1xuICBkZWJ1ZygnY29tcCcsIGNvbXAsIG9wdGlvbnMpO1xuICBjb21wID0gcmVwbGFjZUNhcmV0cyhjb21wLCBvcHRpb25zKTtcbiAgZGVidWcoJ2NhcmV0JywgY29tcCk7XG4gIGNvbXAgPSByZXBsYWNlVGlsZGVzKGNvbXAsIG9wdGlvbnMpO1xuICBkZWJ1ZygndGlsZGVzJywgY29tcCk7XG4gIGNvbXAgPSByZXBsYWNlWFJhbmdlcyhjb21wLCBvcHRpb25zKTtcbiAgZGVidWcoJ3hyYW5nZScsIGNvbXApO1xuICBjb21wID0gcmVwbGFjZVN0YXJzKGNvbXAsIG9wdGlvbnMpO1xuICBkZWJ1Zygnc3RhcnMnLCBjb21wKTtcbiAgcmV0dXJuIGNvbXA7XG59XG5cbmZ1bmN0aW9uIGlzWChpZCkge1xuICByZXR1cm4gIWlkIHx8IGlkLnRvTG93ZXJDYXNlKCkgPT09ICd4JyB8fCBpZCA9PT0gJyonO1xufVxuXG4vLyB+LCB+PiAtLT4gKiAoYW55LCBraW5kYSBzaWxseSlcbi8vIH4yLCB+Mi54LCB+Mi54LngsIH4+Miwgfj4yLnggfj4yLngueCAtLT4gPj0yLjAuMCA8My4wLjBcbi8vIH4yLjAsIH4yLjAueCwgfj4yLjAsIH4+Mi4wLnggLS0+ID49Mi4wLjAgPDIuMS4wXG4vLyB+MS4yLCB+MS4yLngsIH4+MS4yLCB+PjEuMi54IC0tPiA+PTEuMi4wIDwxLjMuMFxuLy8gfjEuMi4zLCB+PjEuMi4zIC0tPiA+PTEuMi4zIDwxLjMuMFxuLy8gfjEuMi4wLCB+PjEuMi4wIC0tPiA+PTEuMi4wIDwxLjMuMFxuZnVuY3Rpb24gcmVwbGFjZVRpbGRlcyhjb21wLCBvcHRpb25zKSB7XG4gIHJldHVybiBjb21wLnRyaW0oKS5zcGxpdCgvXFxzKy8pLm1hcChmdW5jdGlvbihjb21wKSB7XG4gICAgcmV0dXJuIHJlcGxhY2VUaWxkZShjb21wLCBvcHRpb25zKTtcbiAgfSkuam9pbignICcpO1xufVxuXG5mdW5jdGlvbiByZXBsYWNlVGlsZGUoY29tcCwgb3B0aW9ucykge1xuICBpZiAoIW9wdGlvbnMgfHwgdHlwZW9mIG9wdGlvbnMgIT09ICdvYmplY3QnKVxuICAgIG9wdGlvbnMgPSB7IGxvb3NlOiAhIW9wdGlvbnMsIGluY2x1ZGVQcmVyZWxlYXNlOiBmYWxzZSB9XG4gIHZhciByID0gb3B0aW9ucy5sb29zZSA/IHJlW1RJTERFTE9PU0VdIDogcmVbVElMREVdO1xuICByZXR1cm4gY29tcC5yZXBsYWNlKHIsIGZ1bmN0aW9uKF8sIE0sIG0sIHAsIHByKSB7XG4gICAgZGVidWcoJ3RpbGRlJywgY29tcCwgXywgTSwgbSwgcCwgcHIpO1xuICAgIHZhciByZXQ7XG5cbiAgICBpZiAoaXNYKE0pKVxuICAgICAgcmV0ID0gJyc7XG4gICAgZWxzZSBpZiAoaXNYKG0pKVxuICAgICAgcmV0ID0gJz49JyArIE0gKyAnLjAuMCA8JyArICgrTSArIDEpICsgJy4wLjAnO1xuICAgIGVsc2UgaWYgKGlzWChwKSlcbiAgICAgIC8vIH4xLjIgPT0gPj0xLjIuMCA8MS4zLjBcbiAgICAgIHJldCA9ICc+PScgKyBNICsgJy4nICsgbSArICcuMCA8JyArIE0gKyAnLicgKyAoK20gKyAxKSArICcuMCc7XG4gICAgZWxzZSBpZiAocHIpIHtcbiAgICAgIGRlYnVnKCdyZXBsYWNlVGlsZGUgcHInLCBwcik7XG4gICAgICBpZiAocHIuY2hhckF0KDApICE9PSAnLScpXG4gICAgICAgIHByID0gJy0nICsgcHI7XG4gICAgICByZXQgPSAnPj0nICsgTSArICcuJyArIG0gKyAnLicgKyBwICsgcHIgK1xuICAgICAgICAgICAgJyA8JyArIE0gKyAnLicgKyAoK20gKyAxKSArICcuMCc7XG4gICAgfSBlbHNlXG4gICAgICAvLyB+MS4yLjMgPT0gPj0xLjIuMyA8MS4zLjBcbiAgICAgIHJldCA9ICc+PScgKyBNICsgJy4nICsgbSArICcuJyArIHAgK1xuICAgICAgICAgICAgJyA8JyArIE0gKyAnLicgKyAoK20gKyAxKSArICcuMCc7XG5cbiAgICBkZWJ1ZygndGlsZGUgcmV0dXJuJywgcmV0KTtcbiAgICByZXR1cm4gcmV0O1xuICB9KTtcbn1cblxuLy8gXiAtLT4gKiAoYW55LCBraW5kYSBzaWxseSlcbi8vIF4yLCBeMi54LCBeMi54LnggLS0+ID49Mi4wLjAgPDMuMC4wXG4vLyBeMi4wLCBeMi4wLnggLS0+ID49Mi4wLjAgPDMuMC4wXG4vLyBeMS4yLCBeMS4yLnggLS0+ID49MS4yLjAgPDIuMC4wXG4vLyBeMS4yLjMgLS0+ID49MS4yLjMgPDIuMC4wXG4vLyBeMS4yLjAgLS0+ID49MS4yLjAgPDIuMC4wXG5mdW5jdGlvbiByZXBsYWNlQ2FyZXRzKGNvbXAsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIGNvbXAudHJpbSgpLnNwbGl0KC9cXHMrLykubWFwKGZ1bmN0aW9uKGNvbXApIHtcbiAgICByZXR1cm4gcmVwbGFjZUNhcmV0KGNvbXAsIG9wdGlvbnMpO1xuICB9KS5qb2luKCcgJyk7XG59XG5cbmZ1bmN0aW9uIHJlcGxhY2VDYXJldChjb21wLCBvcHRpb25zKSB7XG4gIGRlYnVnKCdjYXJldCcsIGNvbXAsIG9wdGlvbnMpO1xuICBpZiAoIW9wdGlvbnMgfHwgdHlwZW9mIG9wdGlvbnMgIT09ICdvYmplY3QnKVxuICAgIG9wdGlvbnMgPSB7IGxvb3NlOiAhIW9wdGlvbnMsIGluY2x1ZGVQcmVyZWxlYXNlOiBmYWxzZSB9XG4gIHZhciByID0gb3B0aW9ucy5sb29zZSA/IHJlW0NBUkVUTE9PU0VdIDogcmVbQ0FSRVRdO1xuICByZXR1cm4gY29tcC5yZXBsYWNlKHIsIGZ1bmN0aW9uKF8sIE0sIG0sIHAsIHByKSB7XG4gICAgZGVidWcoJ2NhcmV0JywgY29tcCwgXywgTSwgbSwgcCwgcHIpO1xuICAgIHZhciByZXQ7XG5cbiAgICBpZiAoaXNYKE0pKVxuICAgICAgcmV0ID0gJyc7XG4gICAgZWxzZSBpZiAoaXNYKG0pKVxuICAgICAgcmV0ID0gJz49JyArIE0gKyAnLjAuMCA8JyArICgrTSArIDEpICsgJy4wLjAnO1xuICAgIGVsc2UgaWYgKGlzWChwKSkge1xuICAgICAgaWYgKE0gPT09ICcwJylcbiAgICAgICAgcmV0ID0gJz49JyArIE0gKyAnLicgKyBtICsgJy4wIDwnICsgTSArICcuJyArICgrbSArIDEpICsgJy4wJztcbiAgICAgIGVsc2VcbiAgICAgICAgcmV0ID0gJz49JyArIE0gKyAnLicgKyBtICsgJy4wIDwnICsgKCtNICsgMSkgKyAnLjAuMCc7XG4gICAgfSBlbHNlIGlmIChwcikge1xuICAgICAgZGVidWcoJ3JlcGxhY2VDYXJldCBwcicsIHByKTtcbiAgICAgIGlmIChwci5jaGFyQXQoMCkgIT09ICctJylcbiAgICAgICAgcHIgPSAnLScgKyBwcjtcbiAgICAgIGlmIChNID09PSAnMCcpIHtcbiAgICAgICAgaWYgKG0gPT09ICcwJylcbiAgICAgICAgICByZXQgPSAnPj0nICsgTSArICcuJyArIG0gKyAnLicgKyBwICsgcHIgK1xuICAgICAgICAgICAgICAgICcgPCcgKyBNICsgJy4nICsgbSArICcuJyArICgrcCArIDEpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgcmV0ID0gJz49JyArIE0gKyAnLicgKyBtICsgJy4nICsgcCArIHByICtcbiAgICAgICAgICAgICAgICAnIDwnICsgTSArICcuJyArICgrbSArIDEpICsgJy4wJztcbiAgICAgIH0gZWxzZVxuICAgICAgICByZXQgPSAnPj0nICsgTSArICcuJyArIG0gKyAnLicgKyBwICsgcHIgK1xuICAgICAgICAgICAgICAnIDwnICsgKCtNICsgMSkgKyAnLjAuMCc7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlYnVnKCdubyBwcicpO1xuICAgICAgaWYgKE0gPT09ICcwJykge1xuICAgICAgICBpZiAobSA9PT0gJzAnKVxuICAgICAgICAgIHJldCA9ICc+PScgKyBNICsgJy4nICsgbSArICcuJyArIHAgK1xuICAgICAgICAgICAgICAgICcgPCcgKyBNICsgJy4nICsgbSArICcuJyArICgrcCArIDEpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgcmV0ID0gJz49JyArIE0gKyAnLicgKyBtICsgJy4nICsgcCArXG4gICAgICAgICAgICAgICAgJyA8JyArIE0gKyAnLicgKyAoK20gKyAxKSArICcuMCc7XG4gICAgICB9IGVsc2VcbiAgICAgICAgcmV0ID0gJz49JyArIE0gKyAnLicgKyBtICsgJy4nICsgcCArXG4gICAgICAgICAgICAgICcgPCcgKyAoK00gKyAxKSArICcuMC4wJztcbiAgICB9XG5cbiAgICBkZWJ1ZygnY2FyZXQgcmV0dXJuJywgcmV0KTtcbiAgICByZXR1cm4gcmV0O1xuICB9KTtcbn1cblxuZnVuY3Rpb24gcmVwbGFjZVhSYW5nZXMoY29tcCwgb3B0aW9ucykge1xuICBkZWJ1ZygncmVwbGFjZVhSYW5nZXMnLCBjb21wLCBvcHRpb25zKTtcbiAgcmV0dXJuIGNvbXAuc3BsaXQoL1xccysvKS5tYXAoZnVuY3Rpb24oY29tcCkge1xuICAgIHJldHVybiByZXBsYWNlWFJhbmdlKGNvbXAsIG9wdGlvbnMpO1xuICB9KS5qb2luKCcgJyk7XG59XG5cbmZ1bmN0aW9uIHJlcGxhY2VYUmFuZ2UoY29tcCwgb3B0aW9ucykge1xuICBjb21wID0gY29tcC50cmltKCk7XG4gIGlmICghb3B0aW9ucyB8fCB0eXBlb2Ygb3B0aW9ucyAhPT0gJ29iamVjdCcpXG4gICAgb3B0aW9ucyA9IHsgbG9vc2U6ICEhb3B0aW9ucywgaW5jbHVkZVByZXJlbGVhc2U6IGZhbHNlIH1cbiAgdmFyIHIgPSBvcHRpb25zLmxvb3NlID8gcmVbWFJBTkdFTE9PU0VdIDogcmVbWFJBTkdFXTtcbiAgcmV0dXJuIGNvbXAucmVwbGFjZShyLCBmdW5jdGlvbihyZXQsIGd0bHQsIE0sIG0sIHAsIHByKSB7XG4gICAgZGVidWcoJ3hSYW5nZScsIGNvbXAsIHJldCwgZ3RsdCwgTSwgbSwgcCwgcHIpO1xuICAgIHZhciB4TSA9IGlzWChNKTtcbiAgICB2YXIgeG0gPSB4TSB8fCBpc1gobSk7XG4gICAgdmFyIHhwID0geG0gfHwgaXNYKHApO1xuICAgIHZhciBhbnlYID0geHA7XG5cbiAgICBpZiAoZ3RsdCA9PT0gJz0nICYmIGFueVgpXG4gICAgICBndGx0ID0gJyc7XG5cbiAgICBpZiAoeE0pIHtcbiAgICAgIGlmIChndGx0ID09PSAnPicgfHwgZ3RsdCA9PT0gJzwnKSB7XG4gICAgICAgIC8vIG5vdGhpbmcgaXMgYWxsb3dlZFxuICAgICAgICByZXQgPSAnPDAuMC4wJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIG5vdGhpbmcgaXMgZm9yYmlkZGVuXG4gICAgICAgIHJldCA9ICcqJztcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGd0bHQgJiYgYW55WCkge1xuICAgICAgLy8gcmVwbGFjZSBYIHdpdGggMFxuICAgICAgaWYgKHhtKVxuICAgICAgICBtID0gMDtcbiAgICAgIGlmICh4cClcbiAgICAgICAgcCA9IDA7XG5cbiAgICAgIGlmIChndGx0ID09PSAnPicpIHtcbiAgICAgICAgLy8gPjEgPT4gPj0yLjAuMFxuICAgICAgICAvLyA+MS4yID0+ID49MS4zLjBcbiAgICAgICAgLy8gPjEuMi4zID0+ID49IDEuMi40XG4gICAgICAgIGd0bHQgPSAnPj0nO1xuICAgICAgICBpZiAoeG0pIHtcbiAgICAgICAgICBNID0gK00gKyAxO1xuICAgICAgICAgIG0gPSAwO1xuICAgICAgICAgIHAgPSAwO1xuICAgICAgICB9IGVsc2UgaWYgKHhwKSB7XG4gICAgICAgICAgbSA9ICttICsgMTtcbiAgICAgICAgICBwID0gMDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChndGx0ID09PSAnPD0nKSB7XG4gICAgICAgIC8vIDw9MC43LnggaXMgYWN0dWFsbHkgPDAuOC4wLCBzaW5jZSBhbnkgMC43Lnggc2hvdWxkXG4gICAgICAgIC8vIHBhc3MuICBTaW1pbGFybHksIDw9Ny54IGlzIGFjdHVhbGx5IDw4LjAuMCwgZXRjLlxuICAgICAgICBndGx0ID0gJzwnO1xuICAgICAgICBpZiAoeG0pXG4gICAgICAgICAgTSA9ICtNICsgMTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgIG0gPSArbSArIDE7XG4gICAgICB9XG5cbiAgICAgIHJldCA9IGd0bHQgKyBNICsgJy4nICsgbSArICcuJyArIHA7XG4gICAgfSBlbHNlIGlmICh4bSkge1xuICAgICAgcmV0ID0gJz49JyArIE0gKyAnLjAuMCA8JyArICgrTSArIDEpICsgJy4wLjAnO1xuICAgIH0gZWxzZSBpZiAoeHApIHtcbiAgICAgIHJldCA9ICc+PScgKyBNICsgJy4nICsgbSArICcuMCA8JyArIE0gKyAnLicgKyAoK20gKyAxKSArICcuMCc7XG4gICAgfVxuXG4gICAgZGVidWcoJ3hSYW5nZSByZXR1cm4nLCByZXQpO1xuXG4gICAgcmV0dXJuIHJldDtcbiAgfSk7XG59XG5cbi8vIEJlY2F1c2UgKiBpcyBBTkQtZWQgd2l0aCBldmVyeXRoaW5nIGVsc2UgaW4gdGhlIGNvbXBhcmF0b3IsXG4vLyBhbmQgJycgbWVhbnMgXCJhbnkgdmVyc2lvblwiLCBqdXN0IHJlbW92ZSB0aGUgKnMgZW50aXJlbHkuXG5mdW5jdGlvbiByZXBsYWNlU3RhcnMoY29tcCwgb3B0aW9ucykge1xuICBkZWJ1ZygncmVwbGFjZVN0YXJzJywgY29tcCwgb3B0aW9ucyk7XG4gIC8vIExvb3NlbmVzcyBpcyBpZ25vcmVkIGhlcmUuICBzdGFyIGlzIGFsd2F5cyBhcyBsb29zZSBhcyBpdCBnZXRzIVxuICByZXR1cm4gY29tcC50cmltKCkucmVwbGFjZShyZVtTVEFSXSwgJycpO1xufVxuXG4vLyBUaGlzIGZ1bmN0aW9uIGlzIHBhc3NlZCB0byBzdHJpbmcucmVwbGFjZShyZVtIWVBIRU5SQU5HRV0pXG4vLyBNLCBtLCBwYXRjaCwgcHJlcmVsZWFzZSwgYnVpbGRcbi8vIDEuMiAtIDMuNC41ID0+ID49MS4yLjAgPD0zLjQuNVxuLy8gMS4yLjMgLSAzLjQgPT4gPj0xLjIuMCA8My41LjAgQW55IDMuNC54IHdpbGwgZG9cbi8vIDEuMiAtIDMuNCA9PiA+PTEuMi4wIDwzLjUuMFxuZnVuY3Rpb24gaHlwaGVuUmVwbGFjZSgkMCxcbiAgICAgICAgICAgICAgICAgICAgICAgZnJvbSwgZk0sIGZtLCBmcCwgZnByLCBmYixcbiAgICAgICAgICAgICAgICAgICAgICAgdG8sIHRNLCB0bSwgdHAsIHRwciwgdGIpIHtcblxuICBpZiAoaXNYKGZNKSlcbiAgICBmcm9tID0gJyc7XG4gIGVsc2UgaWYgKGlzWChmbSkpXG4gICAgZnJvbSA9ICc+PScgKyBmTSArICcuMC4wJztcbiAgZWxzZSBpZiAoaXNYKGZwKSlcbiAgICBmcm9tID0gJz49JyArIGZNICsgJy4nICsgZm0gKyAnLjAnO1xuICBlbHNlXG4gICAgZnJvbSA9ICc+PScgKyBmcm9tO1xuXG4gIGlmIChpc1godE0pKVxuICAgIHRvID0gJyc7XG4gIGVsc2UgaWYgKGlzWCh0bSkpXG4gICAgdG8gPSAnPCcgKyAoK3RNICsgMSkgKyAnLjAuMCc7XG4gIGVsc2UgaWYgKGlzWCh0cCkpXG4gICAgdG8gPSAnPCcgKyB0TSArICcuJyArICgrdG0gKyAxKSArICcuMCc7XG4gIGVsc2UgaWYgKHRwcilcbiAgICB0byA9ICc8PScgKyB0TSArICcuJyArIHRtICsgJy4nICsgdHAgKyAnLScgKyB0cHI7XG4gIGVsc2VcbiAgICB0byA9ICc8PScgKyB0bztcblxuICByZXR1cm4gKGZyb20gKyAnICcgKyB0bykudHJpbSgpO1xufVxuXG5cbi8vIGlmIEFOWSBvZiB0aGUgc2V0cyBtYXRjaCBBTEwgb2YgaXRzIGNvbXBhcmF0b3JzLCB0aGVuIHBhc3NcblJhbmdlLnByb3RvdHlwZS50ZXN0ID0gZnVuY3Rpb24odmVyc2lvbikge1xuICBpZiAoIXZlcnNpb24pXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIGlmICh0eXBlb2YgdmVyc2lvbiA9PT0gJ3N0cmluZycpXG4gICAgdmVyc2lvbiA9IG5ldyBTZW1WZXIodmVyc2lvbiwgdGhpcy5vcHRpb25zKTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuc2V0Lmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKHRlc3RTZXQodGhpcy5zZXRbaV0sIHZlcnNpb24sIHRoaXMub3B0aW9ucykpXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59O1xuXG5mdW5jdGlvbiB0ZXN0U2V0KHNldCwgdmVyc2lvbiwgb3B0aW9ucykge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHNldC5sZW5ndGg7IGkrKykge1xuICAgIGlmICghc2V0W2ldLnRlc3QodmVyc2lvbikpXG4gICAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAoIW9wdGlvbnMpXG4gICAgb3B0aW9ucyA9IHt9XG5cbiAgaWYgKHZlcnNpb24ucHJlcmVsZWFzZS5sZW5ndGggJiYgIW9wdGlvbnMuaW5jbHVkZVByZXJlbGVhc2UpIHtcbiAgICAvLyBGaW5kIHRoZSBzZXQgb2YgdmVyc2lvbnMgdGhhdCBhcmUgYWxsb3dlZCB0byBoYXZlIHByZXJlbGVhc2VzXG4gICAgLy8gRm9yIGV4YW1wbGUsIF4xLjIuMy1wci4xIGRlc3VnYXJzIHRvID49MS4yLjMtcHIuMSA8Mi4wLjBcbiAgICAvLyBUaGF0IHNob3VsZCBhbGxvdyBgMS4yLjMtcHIuMmAgdG8gcGFzcy5cbiAgICAvLyBIb3dldmVyLCBgMS4yLjQtYWxwaGEubm90cmVhZHlgIHNob3VsZCBOT1QgYmUgYWxsb3dlZCxcbiAgICAvLyBldmVuIHRob3VnaCBpdCdzIHdpdGhpbiB0aGUgcmFuZ2Ugc2V0IGJ5IHRoZSBjb21wYXJhdG9ycy5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNldC5sZW5ndGg7IGkrKykge1xuICAgICAgZGVidWcoc2V0W2ldLnNlbXZlcik7XG4gICAgICBpZiAoc2V0W2ldLnNlbXZlciA9PT0gQU5ZKVxuICAgICAgICBjb250aW51ZTtcblxuICAgICAgaWYgKHNldFtpXS5zZW12ZXIucHJlcmVsZWFzZS5sZW5ndGggPiAwKSB7XG4gICAgICAgIHZhciBhbGxvd2VkID0gc2V0W2ldLnNlbXZlcjtcbiAgICAgICAgaWYgKGFsbG93ZWQubWFqb3IgPT09IHZlcnNpb24ubWFqb3IgJiZcbiAgICAgICAgICAgIGFsbG93ZWQubWlub3IgPT09IHZlcnNpb24ubWlub3IgJiZcbiAgICAgICAgICAgIGFsbG93ZWQucGF0Y2ggPT09IHZlcnNpb24ucGF0Y2gpXG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gVmVyc2lvbiBoYXMgYSAtcHJlLCBidXQgaXQncyBub3Qgb25lIG9mIHRoZSBvbmVzIHdlIGxpa2UuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG5cbmV4cG9ydHMuc2F0aXNmaWVzID0gc2F0aXNmaWVzO1xuZnVuY3Rpb24gc2F0aXNmaWVzKHZlcnNpb24sIHJhbmdlLCBvcHRpb25zKSB7XG4gIHRyeSB7XG4gICAgcmFuZ2UgPSBuZXcgUmFuZ2UocmFuZ2UsIG9wdGlvbnMpO1xuICB9IGNhdGNoIChlcikge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gcmFuZ2UudGVzdCh2ZXJzaW9uKTtcbn1cblxuZXhwb3J0cy5tYXhTYXRpc2Z5aW5nID0gbWF4U2F0aXNmeWluZztcbmZ1bmN0aW9uIG1heFNhdGlzZnlpbmcodmVyc2lvbnMsIHJhbmdlLCBvcHRpb25zKSB7XG4gIHZhciBtYXggPSBudWxsO1xuICB2YXIgbWF4U1YgPSBudWxsO1xuICB0cnkge1xuICAgIHZhciByYW5nZU9iaiA9IG5ldyBSYW5nZShyYW5nZSwgb3B0aW9ucyk7XG4gIH0gY2F0Y2ggKGVyKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmVyc2lvbnMuZm9yRWFjaChmdW5jdGlvbiAodikge1xuICAgIGlmIChyYW5nZU9iai50ZXN0KHYpKSB7IC8vIHNhdGlzZmllcyh2LCByYW5nZSwgb3B0aW9ucylcbiAgICAgIGlmICghbWF4IHx8IG1heFNWLmNvbXBhcmUodikgPT09IC0xKSB7IC8vIGNvbXBhcmUobWF4LCB2LCB0cnVlKVxuICAgICAgICBtYXggPSB2O1xuICAgICAgICBtYXhTViA9IG5ldyBTZW1WZXIobWF4LCBvcHRpb25zKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pXG4gIHJldHVybiBtYXg7XG59XG5cbmV4cG9ydHMubWluU2F0aXNmeWluZyA9IG1pblNhdGlzZnlpbmc7XG5mdW5jdGlvbiBtaW5TYXRpc2Z5aW5nKHZlcnNpb25zLCByYW5nZSwgb3B0aW9ucykge1xuICB2YXIgbWluID0gbnVsbDtcbiAgdmFyIG1pblNWID0gbnVsbDtcbiAgdHJ5IHtcbiAgICB2YXIgcmFuZ2VPYmogPSBuZXcgUmFuZ2UocmFuZ2UsIG9wdGlvbnMpO1xuICB9IGNhdGNoIChlcikge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHZlcnNpb25zLmZvckVhY2goZnVuY3Rpb24gKHYpIHtcbiAgICBpZiAocmFuZ2VPYmoudGVzdCh2KSkgeyAvLyBzYXRpc2ZpZXModiwgcmFuZ2UsIG9wdGlvbnMpXG4gICAgICBpZiAoIW1pbiB8fCBtaW5TVi5jb21wYXJlKHYpID09PSAxKSB7IC8vIGNvbXBhcmUobWluLCB2LCB0cnVlKVxuICAgICAgICBtaW4gPSB2O1xuICAgICAgICBtaW5TViA9IG5ldyBTZW1WZXIobWluLCBvcHRpb25zKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pXG4gIHJldHVybiBtaW47XG59XG5cbmV4cG9ydHMudmFsaWRSYW5nZSA9IHZhbGlkUmFuZ2U7XG5mdW5jdGlvbiB2YWxpZFJhbmdlKHJhbmdlLCBvcHRpb25zKSB7XG4gIHRyeSB7XG4gICAgLy8gUmV0dXJuICcqJyBpbnN0ZWFkIG9mICcnIHNvIHRoYXQgdHJ1dGhpbmVzcyB3b3Jrcy5cbiAgICAvLyBUaGlzIHdpbGwgdGhyb3cgaWYgaXQncyBpbnZhbGlkIGFueXdheVxuICAgIHJldHVybiBuZXcgUmFuZ2UocmFuZ2UsIG9wdGlvbnMpLnJhbmdlIHx8ICcqJztcbiAgfSBjYXRjaCAoZXIpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG4vLyBEZXRlcm1pbmUgaWYgdmVyc2lvbiBpcyBsZXNzIHRoYW4gYWxsIHRoZSB2ZXJzaW9ucyBwb3NzaWJsZSBpbiB0aGUgcmFuZ2VcbmV4cG9ydHMubHRyID0gbHRyO1xuZnVuY3Rpb24gbHRyKHZlcnNpb24sIHJhbmdlLCBvcHRpb25zKSB7XG4gIHJldHVybiBvdXRzaWRlKHZlcnNpb24sIHJhbmdlLCAnPCcsIG9wdGlvbnMpO1xufVxuXG4vLyBEZXRlcm1pbmUgaWYgdmVyc2lvbiBpcyBncmVhdGVyIHRoYW4gYWxsIHRoZSB2ZXJzaW9ucyBwb3NzaWJsZSBpbiB0aGUgcmFuZ2UuXG5leHBvcnRzLmd0ciA9IGd0cjtcbmZ1bmN0aW9uIGd0cih2ZXJzaW9uLCByYW5nZSwgb3B0aW9ucykge1xuICByZXR1cm4gb3V0c2lkZSh2ZXJzaW9uLCByYW5nZSwgJz4nLCBvcHRpb25zKTtcbn1cblxuZXhwb3J0cy5vdXRzaWRlID0gb3V0c2lkZTtcbmZ1bmN0aW9uIG91dHNpZGUodmVyc2lvbiwgcmFuZ2UsIGhpbG8sIG9wdGlvbnMpIHtcbiAgdmVyc2lvbiA9IG5ldyBTZW1WZXIodmVyc2lvbiwgb3B0aW9ucyk7XG4gIHJhbmdlID0gbmV3IFJhbmdlKHJhbmdlLCBvcHRpb25zKTtcblxuICB2YXIgZ3RmbiwgbHRlZm4sIGx0Zm4sIGNvbXAsIGVjb21wO1xuICBzd2l0Y2ggKGhpbG8pIHtcbiAgICBjYXNlICc+JzpcbiAgICAgIGd0Zm4gPSBndDtcbiAgICAgIGx0ZWZuID0gbHRlO1xuICAgICAgbHRmbiA9IGx0O1xuICAgICAgY29tcCA9ICc+JztcbiAgICAgIGVjb21wID0gJz49JztcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJzwnOlxuICAgICAgZ3RmbiA9IGx0O1xuICAgICAgbHRlZm4gPSBndGU7XG4gICAgICBsdGZuID0gZ3Q7XG4gICAgICBjb21wID0gJzwnO1xuICAgICAgZWNvbXAgPSAnPD0nO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ011c3QgcHJvdmlkZSBhIGhpbG8gdmFsIG9mIFwiPFwiIG9yIFwiPlwiJyk7XG4gIH1cblxuICAvLyBJZiBpdCBzYXRpc2lmZXMgdGhlIHJhbmdlIGl0IGlzIG5vdCBvdXRzaWRlXG4gIGlmIChzYXRpc2ZpZXModmVyc2lvbiwgcmFuZ2UsIG9wdGlvbnMpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gRnJvbSBub3cgb24sIHZhcmlhYmxlIHRlcm1zIGFyZSBhcyBpZiB3ZSdyZSBpbiBcImd0clwiIG1vZGUuXG4gIC8vIGJ1dCBub3RlIHRoYXQgZXZlcnl0aGluZyBpcyBmbGlwcGVkIGZvciB0aGUgXCJsdHJcIiBmdW5jdGlvbi5cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHJhbmdlLnNldC5sZW5ndGg7ICsraSkge1xuICAgIHZhciBjb21wYXJhdG9ycyA9IHJhbmdlLnNldFtpXTtcblxuICAgIHZhciBoaWdoID0gbnVsbDtcbiAgICB2YXIgbG93ID0gbnVsbDtcblxuICAgIGNvbXBhcmF0b3JzLmZvckVhY2goZnVuY3Rpb24oY29tcGFyYXRvcikge1xuICAgICAgaWYgKGNvbXBhcmF0b3Iuc2VtdmVyID09PSBBTlkpIHtcbiAgICAgICAgY29tcGFyYXRvciA9IG5ldyBDb21wYXJhdG9yKCc+PTAuMC4wJylcbiAgICAgIH1cbiAgICAgIGhpZ2ggPSBoaWdoIHx8IGNvbXBhcmF0b3I7XG4gICAgICBsb3cgPSBsb3cgfHwgY29tcGFyYXRvcjtcbiAgICAgIGlmIChndGZuKGNvbXBhcmF0b3Iuc2VtdmVyLCBoaWdoLnNlbXZlciwgb3B0aW9ucykpIHtcbiAgICAgICAgaGlnaCA9IGNvbXBhcmF0b3I7XG4gICAgICB9IGVsc2UgaWYgKGx0Zm4oY29tcGFyYXRvci5zZW12ZXIsIGxvdy5zZW12ZXIsIG9wdGlvbnMpKSB7XG4gICAgICAgIGxvdyA9IGNvbXBhcmF0b3I7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBJZiB0aGUgZWRnZSB2ZXJzaW9uIGNvbXBhcmF0b3IgaGFzIGEgb3BlcmF0b3IgdGhlbiBvdXIgdmVyc2lvblxuICAgIC8vIGlzbid0IG91dHNpZGUgaXRcbiAgICBpZiAoaGlnaC5vcGVyYXRvciA9PT0gY29tcCB8fCBoaWdoLm9wZXJhdG9yID09PSBlY29tcCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIElmIHRoZSBsb3dlc3QgdmVyc2lvbiBjb21wYXJhdG9yIGhhcyBhbiBvcGVyYXRvciBhbmQgb3VyIHZlcnNpb25cbiAgICAvLyBpcyBsZXNzIHRoYW4gaXQgdGhlbiBpdCBpc24ndCBoaWdoZXIgdGhhbiB0aGUgcmFuZ2VcbiAgICBpZiAoKCFsb3cub3BlcmF0b3IgfHwgbG93Lm9wZXJhdG9yID09PSBjb21wKSAmJlxuICAgICAgICBsdGVmbih2ZXJzaW9uLCBsb3cuc2VtdmVyKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gZWxzZSBpZiAobG93Lm9wZXJhdG9yID09PSBlY29tcCAmJiBsdGZuKHZlcnNpb24sIGxvdy5zZW12ZXIpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG5leHBvcnRzLnByZXJlbGVhc2UgPSBwcmVyZWxlYXNlO1xuZnVuY3Rpb24gcHJlcmVsZWFzZSh2ZXJzaW9uLCBvcHRpb25zKSB7XG4gIHZhciBwYXJzZWQgPSBwYXJzZSh2ZXJzaW9uLCBvcHRpb25zKTtcbiAgcmV0dXJuIChwYXJzZWQgJiYgcGFyc2VkLnByZXJlbGVhc2UubGVuZ3RoKSA/IHBhcnNlZC5wcmVyZWxlYXNlIDogbnVsbDtcbn1cblxuZXhwb3J0cy5pbnRlcnNlY3RzID0gaW50ZXJzZWN0cztcbmZ1bmN0aW9uIGludGVyc2VjdHMocjEsIHIyLCBvcHRpb25zKSB7XG4gIHIxID0gbmV3IFJhbmdlKHIxLCBvcHRpb25zKVxuICByMiA9IG5ldyBSYW5nZShyMiwgb3B0aW9ucylcbiAgcmV0dXJuIHIxLmludGVyc2VjdHMocjIpXG59XG5cbmV4cG9ydHMuY29lcmNlID0gY29lcmNlO1xuZnVuY3Rpb24gY29lcmNlKHZlcnNpb24pIHtcbiAgaWYgKHZlcnNpb24gaW5zdGFuY2VvZiBTZW1WZXIpXG4gICAgcmV0dXJuIHZlcnNpb247XG5cbiAgaWYgKHR5cGVvZiB2ZXJzaW9uICE9PSAnc3RyaW5nJylcbiAgICByZXR1cm4gbnVsbDtcblxuICB2YXIgbWF0Y2ggPSB2ZXJzaW9uLm1hdGNoKHJlW0NPRVJDRV0pO1xuXG4gIGlmIChtYXRjaCA9PSBudWxsKVxuICAgIHJldHVybiBudWxsO1xuXG4gIHJldHVybiBwYXJzZSgobWF0Y2hbMV0gfHwgJzAnKSArICcuJyArIChtYXRjaFsyXSB8fCAnMCcpICsgJy4nICsgKG1hdGNoWzNdIHx8ICcwJykpOyBcbn1cbiIsIi8vIEBmbG93XG5pbXBvcnQgVnVlIGZyb20gJ3Z1ZSdcbmltcG9ydCBzZW12ZXIgZnJvbSAnc2VtdmVyJ1xuXG5leHBvcnQgZnVuY3Rpb24gdGhyb3dFcnJvcihtc2c6IHN0cmluZyk6IHZvaWQge1xuICB0aHJvdyBuZXcgRXJyb3IoYFt2dWUtdGVzdC11dGlsc106ICR7bXNnfWApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3YXJuKG1zZzogc3RyaW5nKTogdm9pZCB7XG4gIGNvbnNvbGUuZXJyb3IoYFt2dWUtdGVzdC11dGlsc106ICR7bXNnfWApXG59XG5cbmNvbnN0IGNhbWVsaXplUkUgPSAvLShcXHcpL2dcblxuZXhwb3J0IGNvbnN0IGNhbWVsaXplID0gKHN0cjogc3RyaW5nKTogc3RyaW5nID0+IHtcbiAgY29uc3QgY2FtZWxpemVkU3RyID0gc3RyLnJlcGxhY2UoY2FtZWxpemVSRSwgKF8sIGMpID0+XG4gICAgYyA/IGMudG9VcHBlckNhc2UoKSA6ICcnXG4gIClcbiAgcmV0dXJuIGNhbWVsaXplZFN0ci5jaGFyQXQoMCkudG9Mb3dlckNhc2UoKSArIGNhbWVsaXplZFN0ci5zbGljZSgxKVxufVxuXG4vKipcbiAqIENhcGl0YWxpemUgYSBzdHJpbmcuXG4gKi9cbmV4cG9ydCBjb25zdCBjYXBpdGFsaXplID0gKHN0cjogc3RyaW5nKTogc3RyaW5nID0+XG4gIHN0ci5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHN0ci5zbGljZSgxKVxuXG4vKipcbiAqIEh5cGhlbmF0ZSBhIGNhbWVsQ2FzZSBzdHJpbmcuXG4gKi9cbmNvbnN0IGh5cGhlbmF0ZVJFID0gL1xcQihbQS1aXSkvZ1xuZXhwb3J0IGNvbnN0IGh5cGhlbmF0ZSA9IChzdHI6IHN0cmluZyk6IHN0cmluZyA9PlxuICBzdHIucmVwbGFjZShoeXBoZW5hdGVSRSwgJy0kMScpLnRvTG93ZXJDYXNlKClcblxuZnVuY3Rpb24gaGFzT3duUHJvcGVydHkob2JqLCBwcm9wKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVzb2x2ZUNvbXBvbmVudChpZDogc3RyaW5nLCBjb21wb25lbnRzOiBPYmplY3QpIHtcbiAgaWYgKHR5cGVvZiBpZCAhPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm5cbiAgfVxuICAvLyBjaGVjayBsb2NhbCByZWdpc3RyYXRpb24gdmFyaWF0aW9ucyBmaXJzdFxuICBpZiAoaGFzT3duUHJvcGVydHkoY29tcG9uZW50cywgaWQpKSB7XG4gICAgcmV0dXJuIGNvbXBvbmVudHNbaWRdXG4gIH1cbiAgdmFyIGNhbWVsaXplZElkID0gY2FtZWxpemUoaWQpXG4gIGlmIChoYXNPd25Qcm9wZXJ0eShjb21wb25lbnRzLCBjYW1lbGl6ZWRJZCkpIHtcbiAgICByZXR1cm4gY29tcG9uZW50c1tjYW1lbGl6ZWRJZF1cbiAgfVxuICB2YXIgUGFzY2FsQ2FzZUlkID0gY2FwaXRhbGl6ZShjYW1lbGl6ZWRJZClcbiAgaWYgKGhhc093blByb3BlcnR5KGNvbXBvbmVudHMsIFBhc2NhbENhc2VJZCkpIHtcbiAgICByZXR1cm4gY29tcG9uZW50c1tQYXNjYWxDYXNlSWRdXG4gIH1cbiAgLy8gZmFsbGJhY2sgdG8gcHJvdG90eXBlIGNoYWluXG4gIHJldHVybiBjb21wb25lbnRzW2lkXSB8fCBjb21wb25lbnRzW2NhbWVsaXplZElkXSB8fCBjb21wb25lbnRzW1Bhc2NhbENhc2VJZF1cbn1cblxuY29uc3QgVUEgPVxuICB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJlxuICAnbmF2aWdhdG9yJyBpbiB3aW5kb3cgJiZcbiAgbmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpXG5cbmV4cG9ydCBjb25zdCBpc1BoYW50b21KUyA9IFVBICYmIFVBLmluY2x1ZGVzICYmIFVBLm1hdGNoKC9waGFudG9tanMvaSlcblxuZXhwb3J0IGNvbnN0IGlzRWRnZSA9IFVBICYmIFVBLmluZGV4T2YoJ2VkZ2UvJykgPiAwXG5leHBvcnQgY29uc3QgaXNDaHJvbWUgPSBVQSAmJiAvY2hyb21lXFwvXFxkKy8udGVzdChVQSkgJiYgIWlzRWRnZVxuXG4vLyBnZXQgdGhlIGV2ZW50IHVzZWQgdG8gdHJpZ2dlciB2LW1vZGVsIGhhbmRsZXIgdGhhdCB1cGRhdGVzIGJvdW5kIGRhdGFcbmV4cG9ydCBmdW5jdGlvbiBnZXRDaGVja2VkRXZlbnQoKSB7XG4gIGNvbnN0IHZlcnNpb24gPSBWdWUudmVyc2lvblxuXG4gIGlmIChzZW12ZXIuc2F0aXNmaWVzKHZlcnNpb24sICcyLjEuOSAtIDIuMS4xMCcpKSB7XG4gICAgcmV0dXJuICdjbGljaydcbiAgfVxuXG4gIGlmIChzZW12ZXIuc2F0aXNmaWVzKHZlcnNpb24sICcyLjIgLSAyLjQnKSkge1xuICAgIHJldHVybiBpc0Nocm9tZSA/ICdjbGljaycgOiAnY2hhbmdlJ1xuICB9XG5cbiAgLy8gY2hhbmdlIGlzIGhhbmRsZXIgZm9yIHZlcnNpb24gMi4wIC0gMi4xLjgsIGFuZCAyLjUrXG4gIHJldHVybiAnY2hhbmdlJ1xufVxuIiwiLy8gQGZsb3dcbmltcG9ydCAkJFZ1ZSBmcm9tICd2dWUnXG5pbXBvcnQgeyB3YXJuIH0gZnJvbSAnc2hhcmVkL3V0aWwnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGFkZE1vY2tzKFxuICBfVnVlOiBDb21wb25lbnQsXG4gIG1vY2tlZFByb3BlcnRpZXM6IE9iamVjdCB8IGZhbHNlID0ge31cbik6IHZvaWQge1xuICBpZiAobW9ja2VkUHJvcGVydGllcyA9PT0gZmFsc2UpIHtcbiAgICByZXR1cm5cbiAgfVxuICBPYmplY3Qua2V5cyhtb2NrZWRQcm9wZXJ0aWVzKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIC8vICRGbG93SWdub3JlXG4gICAgICBfVnVlLnByb3RvdHlwZVtrZXldID0gbW9ja2VkUHJvcGVydGllc1trZXldXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgd2FybihcbiAgICAgICAgYGNvdWxkIG5vdCBvdmVyd3JpdGUgcHJvcGVydHkgJHtrZXl9LCB0aGlzIGlzIGAgK1xuICAgICAgICAgIGB1c3VhbGx5IGNhdXNlZCBieSBhIHBsdWdpbiB0aGF0IGhhcyBhZGRlZCBgICtcbiAgICAgICAgICBgdGhlIHByb3BlcnR5IGFzIGEgcmVhZC1vbmx5IHZhbHVlYFxuICAgICAgKVxuICAgIH1cbiAgICAvLyAkRmxvd0lnbm9yZVxuICAgICQkVnVlLnV0aWwuZGVmaW5lUmVhY3RpdmUoX1Z1ZSwga2V5LCBtb2NrZWRQcm9wZXJ0aWVzW2tleV0pXG4gIH0pXG59XG4iLCIvLyBAZmxvd1xuXG5leHBvcnQgZnVuY3Rpb24gbG9nRXZlbnRzKFxuICB2bTogQ29tcG9uZW50LFxuICBlbWl0dGVkOiBPYmplY3QsXG4gIGVtaXR0ZWRCeU9yZGVyOiBBcnJheTxhbnk+XG4pOiB2b2lkIHtcbiAgY29uc3QgZW1pdCA9IHZtLiRlbWl0XG4gIHZtLiRlbWl0ID0gKG5hbWUsIC4uLmFyZ3MpID0+IHtcbiAgICA7KGVtaXR0ZWRbbmFtZV0gfHwgKGVtaXR0ZWRbbmFtZV0gPSBbXSkpLnB1c2goYXJncylcbiAgICBlbWl0dGVkQnlPcmRlci5wdXNoKHsgbmFtZSwgYXJncyB9KVxuICAgIHJldHVybiBlbWl0LmNhbGwodm0sIG5hbWUsIC4uLmFyZ3MpXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFkZEV2ZW50TG9nZ2VyKF9WdWU6IENvbXBvbmVudCk6IHZvaWQge1xuICBfVnVlLm1peGluKHtcbiAgICBiZWZvcmVDcmVhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5fX2VtaXR0ZWQgPSBPYmplY3QuY3JlYXRlKG51bGwpXG4gICAgICB0aGlzLl9fZW1pdHRlZEJ5T3JkZXIgPSBbXVxuICAgICAgbG9nRXZlbnRzKHRoaXMsIHRoaXMuX19lbWl0dGVkLCB0aGlzLl9fZW1pdHRlZEJ5T3JkZXIpXG4gICAgfVxuICB9KVxufVxuIiwiaW1wb3J0IFZ1ZSBmcm9tICd2dWUnXG5pbXBvcnQgc2VtdmVyIGZyb20gJ3NlbXZlcidcblxuZXhwb3J0IGNvbnN0IE5BTUVfU0VMRUNUT1IgPSAnTkFNRV9TRUxFQ1RPUidcbmV4cG9ydCBjb25zdCBDT01QT05FTlRfU0VMRUNUT1IgPSAnQ09NUE9ORU5UX1NFTEVDVE9SJ1xuZXhwb3J0IGNvbnN0IFJFRl9TRUxFQ1RPUiA9ICdSRUZfU0VMRUNUT1InXG5leHBvcnQgY29uc3QgRE9NX1NFTEVDVE9SID0gJ0RPTV9TRUxFQ1RPUidcbmV4cG9ydCBjb25zdCBJTlZBTElEX1NFTEVDVE9SID0gJ0lOVkFMSURfU0VMRUNUT1InXG5leHBvcnQgY29uc3QgQ09NUEFUX1NZTkNfTU9ERSA9ICdDT01QQVRfU1lOQ19NT0RFJ1xuXG5leHBvcnQgY29uc3QgVlVFX1ZFUlNJT04gPSBOdW1iZXIoXG4gIGAke1Z1ZS52ZXJzaW9uLnNwbGl0KCcuJylbMF19LiR7VnVlLnZlcnNpb24uc3BsaXQoJy4nKVsxXX1gXG4pXG5cbmV4cG9ydCBjb25zdCBGVU5DVElPTkFMX09QVElPTlMgPVxuICBWVUVfVkVSU0lPTiA+PSAyLjUgPyAnZm5PcHRpb25zJyA6ICdmdW5jdGlvbmFsT3B0aW9ucydcblxuZXhwb3J0IGNvbnN0IEJFRk9SRV9SRU5ERVJfTElGRUNZQ0xFX0hPT0sgPSBzZW12ZXIuZ3QoVnVlLnZlcnNpb24sICcyLjEuOCcpXG4gID8gJ2JlZm9yZUNyZWF0ZSdcbiAgOiAnYmVmb3JlTW91bnQnXG5cbmV4cG9ydCBjb25zdCBDUkVBVEVfRUxFTUVOVF9BTElBUyA9IHNlbXZlci5ndChWdWUudmVyc2lvbiwgJzIuMS41JylcbiAgPyAnX2MnXG4gIDogJ19oJ1xuIiwiaW1wb3J0IHsgQkVGT1JFX1JFTkRFUl9MSUZFQ1lDTEVfSE9PSyB9IGZyb20gJ3NoYXJlZC9jb25zdHMnXG5cbmV4cG9ydCBmdW5jdGlvbiBhZGRTdHVicyhfVnVlLCBzdHViQ29tcG9uZW50cykge1xuICBmdW5jdGlvbiBhZGRTdHViQ29tcG9uZW50c01peGluKCkge1xuICAgIE9iamVjdC5hc3NpZ24odGhpcy4kb3B0aW9ucy5jb21wb25lbnRzLCBzdHViQ29tcG9uZW50cylcbiAgfVxuXG4gIF9WdWUubWl4aW4oe1xuICAgIFtCRUZPUkVfUkVOREVSX0xJRkVDWUNMRV9IT09LXTogYWRkU3R1YkNvbXBvbmVudHNNaXhpblxuICB9KVxufVxuIiwiLy8gQGZsb3dcbmltcG9ydCB7IHRocm93RXJyb3IsIGNhcGl0YWxpemUsIGNhbWVsaXplLCBoeXBoZW5hdGUgfSBmcm9tICcuL3V0aWwnXG5cbmV4cG9ydCBmdW5jdGlvbiBpc0RvbVNlbGVjdG9yKHNlbGVjdG9yOiBhbnkpOiBib29sZWFuIHtcbiAgaWYgKHR5cGVvZiBzZWxlY3RvciAhPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIHRyeSB7XG4gICAgaWYgKHR5cGVvZiBkb2N1bWVudCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRocm93RXJyb3IoXG4gICAgICAgIGBtb3VudCBtdXN0IGJlIHJ1biBpbiBhIGJyb3dzZXIgZW52aXJvbm1lbnQgbGlrZSBgICtcbiAgICAgICAgICBgUGhhbnRvbUpTLCBqc2RvbSBvciBjaHJvbWVgXG4gICAgICApXG4gICAgfVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHRocm93RXJyb3IoXG4gICAgICBgbW91bnQgbXVzdCBiZSBydW4gaW4gYSBicm93c2VyIGVudmlyb25tZW50IGxpa2UgYCArXG4gICAgICAgIGBQaGFudG9tSlMsIGpzZG9tIG9yIGNocm9tZWBcbiAgICApXG4gIH1cblxuICB0cnkge1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpXG4gICAgcmV0dXJuIHRydWVcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNWdWVDb21wb25lbnQoYzogYW55KTogYm9vbGVhbiB7XG4gIGlmIChpc0NvbnN0cnVjdG9yKGMpKSB7XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIGlmIChjID09PSBudWxsIHx8IHR5cGVvZiBjICE9PSAnb2JqZWN0Jykge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgaWYgKGMuZXh0ZW5kcyB8fCBjLl9DdG9yKSB7XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIGlmICh0eXBlb2YgYy50ZW1wbGF0ZSA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgcmV0dXJuIHR5cGVvZiBjLnJlbmRlciA9PT0gJ2Z1bmN0aW9uJ1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29tcG9uZW50TmVlZHNDb21waWxpbmcoY29tcG9uZW50OiBDb21wb25lbnQpOiBib29sZWFuIHtcbiAgcmV0dXJuIChcbiAgICBjb21wb25lbnQgJiZcbiAgICAhY29tcG9uZW50LnJlbmRlciAmJlxuICAgIChjb21wb25lbnQudGVtcGxhdGUgfHwgY29tcG9uZW50LmV4dGVuZHMgfHwgY29tcG9uZW50LmV4dGVuZE9wdGlvbnMpICYmXG4gICAgIWNvbXBvbmVudC5mdW5jdGlvbmFsXG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUmVmU2VsZWN0b3IocmVmT3B0aW9uc09iamVjdDogYW55KTogYm9vbGVhbiB7XG4gIGlmIChcbiAgICB0eXBlb2YgcmVmT3B0aW9uc09iamVjdCAhPT0gJ29iamVjdCcgfHxcbiAgICBPYmplY3Qua2V5cyhyZWZPcHRpb25zT2JqZWN0IHx8IHt9KS5sZW5ndGggIT09IDFcbiAgKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICByZXR1cm4gdHlwZW9mIHJlZk9wdGlvbnNPYmplY3QucmVmID09PSAnc3RyaW5nJ1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNOYW1lU2VsZWN0b3IobmFtZU9wdGlvbnNPYmplY3Q6IGFueSk6IGJvb2xlYW4ge1xuICBpZiAodHlwZW9mIG5hbWVPcHRpb25zT2JqZWN0ICE9PSAnb2JqZWN0JyB8fCBuYW1lT3B0aW9uc09iamVjdCA9PT0gbnVsbCkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgcmV0dXJuICEhbmFtZU9wdGlvbnNPYmplY3QubmFtZVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNDb25zdHJ1Y3RvcihjOiBhbnkpIHtcbiAgcmV0dXJuIHR5cGVvZiBjID09PSAnZnVuY3Rpb24nICYmIGMuY2lkXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0R5bmFtaWNDb21wb25lbnQoYzogYW55KSB7XG4gIHJldHVybiB0eXBlb2YgYyA9PT0gJ2Z1bmN0aW9uJyAmJiAhYy5jaWRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzQ29tcG9uZW50T3B0aW9ucyhjOiBhbnkpIHtcbiAgcmV0dXJuIHR5cGVvZiBjID09PSAnb2JqZWN0JyAmJiAoYy50ZW1wbGF0ZSB8fCBjLnJlbmRlcilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRnVuY3Rpb25hbENvbXBvbmVudChjOiBhbnkpIHtcbiAgaWYgKCFpc1Z1ZUNvbXBvbmVudChjKSkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG4gIGlmIChpc0NvbnN0cnVjdG9yKGMpKSB7XG4gICAgcmV0dXJuIGMub3B0aW9ucy5mdW5jdGlvbmFsXG4gIH1cbiAgcmV0dXJuIGMuZnVuY3Rpb25hbFxufVxuXG5leHBvcnQgZnVuY3Rpb24gdGVtcGxhdGVDb250YWluc0NvbXBvbmVudChcbiAgdGVtcGxhdGU6IHN0cmluZyxcbiAgbmFtZTogc3RyaW5nXG4pOiBib29sZWFuIHtcbiAgcmV0dXJuIFtjYXBpdGFsaXplLCBjYW1lbGl6ZSwgaHlwaGVuYXRlXS5zb21lKGZvcm1hdCA9PiB7XG4gICAgY29uc3QgcmUgPSBuZXcgUmVnRXhwKGA8JHtmb3JtYXQobmFtZSl9XFxcXHMqKFxcXFxzfD58KFxcLz4pKWAsICdnJylcbiAgICByZXR1cm4gcmUudGVzdCh0ZW1wbGF0ZSlcbiAgfSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUGxhaW5PYmplY3QoYzogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYykgPT09ICdbb2JqZWN0IE9iamVjdF0nXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1JlcXVpcmVkQ29tcG9uZW50KG5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gKFxuICAgIG5hbWUgPT09ICdLZWVwQWxpdmUnIHx8IG5hbWUgPT09ICdUcmFuc2l0aW9uJyB8fCBuYW1lID09PSAnVHJhbnNpdGlvbkdyb3VwJ1xuICApXG59XG5cbmZ1bmN0aW9uIG1ha2VNYXAoc3RyOiBzdHJpbmcsIGV4cGVjdHNMb3dlckNhc2U/OiBib29sZWFuKSB7XG4gIHZhciBtYXAgPSBPYmplY3QuY3JlYXRlKG51bGwpXG4gIHZhciBsaXN0ID0gc3RyLnNwbGl0KCcsJylcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgbWFwW2xpc3RbaV1dID0gdHJ1ZVxuICB9XG4gIHJldHVybiBleHBlY3RzTG93ZXJDYXNlXG4gICAgPyBmdW5jdGlvbih2YWw6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gbWFwW3ZhbC50b0xvd2VyQ2FzZSgpXVxuICAgICAgfVxuICAgIDogZnVuY3Rpb24odmFsOiBzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIG1hcFt2YWxdXG4gICAgICB9XG59XG5cbmV4cG9ydCBjb25zdCBpc0hUTUxUYWcgPSBtYWtlTWFwKFxuICAnaHRtbCxib2R5LGJhc2UsaGVhZCxsaW5rLG1ldGEsc3R5bGUsdGl0bGUsJyArXG4gICAgJ2FkZHJlc3MsYXJ0aWNsZSxhc2lkZSxmb290ZXIsaGVhZGVyLGgxLGgyLGgzLGg0LGg1LGg2LGhncm91cCxuYXYsc2VjdGlvbiwnICtcbiAgICAnZGl2LGRkLGRsLGR0LGZpZ2NhcHRpb24sZmlndXJlLHBpY3R1cmUsaHIsaW1nLGxpLG1haW4sb2wscCxwcmUsdWwsJyArXG4gICAgJ2EsYixhYmJyLGJkaSxiZG8sYnIsY2l0ZSxjb2RlLGRhdGEsZGZuLGVtLGksa2JkLG1hcmsscSxycCxydCxydGMscnVieSwnICtcbiAgICAncyxzYW1wLHNtYWxsLHNwYW4sc3Ryb25nLHN1YixzdXAsdGltZSx1LHZhcix3YnIsYXJlYSxhdWRpbyxtYXAsdHJhY2ssJyArXG4gICAgJ2VtYmVkLG9iamVjdCxwYXJhbSxzb3VyY2UsY2FudmFzLHNjcmlwdCxub3NjcmlwdCxkZWwsaW5zLCcgK1xuICAgICdjYXB0aW9uLGNvbCxjb2xncm91cCx0YWJsZSx0aGVhZCx0Ym9keSx0ZCx0aCx0cix2aWRlbywnICtcbiAgICAnYnV0dG9uLGRhdGFsaXN0LGZpZWxkc2V0LGZvcm0saW5wdXQsbGFiZWwsbGVnZW5kLG1ldGVyLG9wdGdyb3VwLG9wdGlvbiwnICtcbiAgICAnb3V0cHV0LHByb2dyZXNzLHNlbGVjdCx0ZXh0YXJlYSwnICtcbiAgICAnZGV0YWlscyxkaWFsb2csbWVudSxtZW51aXRlbSxzdW1tYXJ5LCcgK1xuICAgICdjb250ZW50LGVsZW1lbnQsc2hhZG93LHRlbXBsYXRlLGJsb2NrcXVvdGUsaWZyYW1lLHRmb290J1xuKVxuXG4vLyB0aGlzIG1hcCBpcyBpbnRlbnRpb25hbGx5IHNlbGVjdGl2ZSwgb25seSBjb3ZlcmluZyBTVkcgZWxlbWVudHMgdGhhdCBtYXlcbi8vIGNvbnRhaW4gY2hpbGQgZWxlbWVudHMuXG5leHBvcnQgY29uc3QgaXNTVkcgPSBtYWtlTWFwKFxuICAnc3ZnLGFuaW1hdGUsY2lyY2xlLGNsaXBwYXRoLGN1cnNvcixkZWZzLGRlc2MsZWxsaXBzZSxmaWx0ZXIsZm9udC1mYWNlLCcgK1xuICAgICdmb3JlaWduT2JqZWN0LGcsZ2x5cGgsaW1hZ2UsbGluZSxtYXJrZXIsbWFzayxtaXNzaW5nLWdseXBoLHBhdGgscGF0dGVybiwnICtcbiAgICAncG9seWdvbixwb2x5bGluZSxyZWN0LHN3aXRjaCxzeW1ib2wsdGV4dCx0ZXh0cGF0aCx0c3Bhbix1c2UsdmlldycsXG4gIHRydWVcbilcblxuZXhwb3J0IGNvbnN0IGlzUmVzZXJ2ZWRUYWcgPSAodGFnOiBzdHJpbmcpID0+IGlzSFRNTFRhZyh0YWcpIHx8IGlzU1ZHKHRhZylcbiIsIi8vIEBmbG93XG5cbmltcG9ydCB7IGNvbXBpbGVUb0Z1bmN0aW9ucyB9IGZyb20gJ3Z1ZS10ZW1wbGF0ZS1jb21waWxlcidcbmltcG9ydCB7IGNvbXBvbmVudE5lZWRzQ29tcGlsaW5nIH0gZnJvbSAnLi92YWxpZGF0b3JzJ1xuaW1wb3J0IHsgdGhyb3dFcnJvciB9IGZyb20gJy4vdXRpbCdcblxuZXhwb3J0IGZ1bmN0aW9uIGNvbXBpbGVGcm9tU3RyaW5nKHN0cjogc3RyaW5nKSB7XG4gIGlmICghY29tcGlsZVRvRnVuY3Rpb25zKSB7XG4gICAgdGhyb3dFcnJvcihcbiAgICAgIGB2dWVUZW1wbGF0ZUNvbXBpbGVyIGlzIHVuZGVmaW5lZCwgeW91IG11c3QgcGFzcyBgICtcbiAgICAgICAgYHByZWNvbXBpbGVkIGNvbXBvbmVudHMgaWYgdnVlLXRlbXBsYXRlLWNvbXBpbGVyIGlzIGAgK1xuICAgICAgICBgdW5kZWZpbmVkYFxuICAgIClcbiAgfVxuICByZXR1cm4gY29tcGlsZVRvRnVuY3Rpb25zKHN0cilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbXBpbGVUZW1wbGF0ZShjb21wb25lbnQ6IENvbXBvbmVudCk6IHZvaWQge1xuICBpZiAoY29tcG9uZW50LnRlbXBsYXRlKSB7XG4gICAgT2JqZWN0LmFzc2lnbihjb21wb25lbnQsIGNvbXBpbGVUb0Z1bmN0aW9ucyhjb21wb25lbnQudGVtcGxhdGUpKVxuICB9XG5cbiAgaWYgKGNvbXBvbmVudC5jb21wb25lbnRzKSB7XG4gICAgT2JqZWN0LmtleXMoY29tcG9uZW50LmNvbXBvbmVudHMpLmZvckVhY2goYyA9PiB7XG4gICAgICBjb25zdCBjbXAgPSBjb21wb25lbnQuY29tcG9uZW50c1tjXVxuICAgICAgaWYgKCFjbXAucmVuZGVyKSB7XG4gICAgICAgIGNvbXBpbGVUZW1wbGF0ZShjbXApXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIGlmIChjb21wb25lbnQuZXh0ZW5kcykge1xuICAgIGNvbXBpbGVUZW1wbGF0ZShjb21wb25lbnQuZXh0ZW5kcylcbiAgfVxuXG4gIGlmIChjb21wb25lbnQuZXh0ZW5kT3B0aW9ucyAmJiAhY29tcG9uZW50Lm9wdGlvbnMucmVuZGVyKSB7XG4gICAgY29tcGlsZVRlbXBsYXRlKGNvbXBvbmVudC5vcHRpb25zKVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb21waWxlVGVtcGxhdGVGb3JTbG90cyhzbG90czogT2JqZWN0KTogdm9pZCB7XG4gIE9iamVjdC5rZXlzKHNsb3RzKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgY29uc3Qgc2xvdCA9IEFycmF5LmlzQXJyYXkoc2xvdHNba2V5XSkgPyBzbG90c1trZXldIDogW3Nsb3RzW2tleV1dXG4gICAgc2xvdC5mb3JFYWNoKHNsb3RWYWx1ZSA9PiB7XG4gICAgICBpZiAoY29tcG9uZW50TmVlZHNDb21waWxpbmcoc2xvdFZhbHVlKSkge1xuICAgICAgICBjb21waWxlVGVtcGxhdGUoc2xvdFZhbHVlKVxuICAgICAgfVxuICAgIH0pXG4gIH0pXG59XG4iLCIvLyBAZmxvd1xuXG5jb25zdCBNT1VOVElOR19PUFRJT05TID0gW1xuICAnYXR0YWNoVG9Eb2N1bWVudCcsXG4gICdtb2NrcycsXG4gICdzbG90cycsXG4gICdsb2NhbFZ1ZScsXG4gICdzdHVicycsXG4gICdjb250ZXh0JyxcbiAgJ2Nsb25lJyxcbiAgJ2F0dHJzJyxcbiAgJ2xpc3RlbmVycycsXG4gICdwcm9wc0RhdGEnLFxuICAnc3luYycsXG4gICdzaG91bGRQcm94eSdcbl1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZXh0cmFjdEluc3RhbmNlT3B0aW9ucyhvcHRpb25zOiBPYmplY3QpOiBPYmplY3Qge1xuICBjb25zdCBpbnN0YW5jZU9wdGlvbnMgPSB7XG4gICAgLi4ub3B0aW9uc1xuICB9XG4gIE1PVU5USU5HX09QVElPTlMuZm9yRWFjaChtb3VudGluZ09wdGlvbiA9PiB7XG4gICAgZGVsZXRlIGluc3RhbmNlT3B0aW9uc1ttb3VudGluZ09wdGlvbl1cbiAgfSlcbiAgcmV0dXJuIGluc3RhbmNlT3B0aW9uc1xufVxuIiwiLy8gQGZsb3dcblxuaW1wb3J0IHsgY29tcGlsZVRvRnVuY3Rpb25zIH0gZnJvbSAndnVlLXRlbXBsYXRlLWNvbXBpbGVyJ1xuaW1wb3J0IHsgdGhyb3dFcnJvciB9IGZyb20gJ3NoYXJlZC91dGlsJ1xuaW1wb3J0IHsgVlVFX1ZFUlNJT04gfSBmcm9tICdzaGFyZWQvY29uc3RzJ1xuXG5mdW5jdGlvbiBpc0Rlc3RydWN0dXJpbmdTbG90U2NvcGUoc2xvdFNjb3BlOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIHNsb3RTY29wZVswXSA9PT0gJ3snICYmIHNsb3RTY29wZVtzbG90U2NvcGUubGVuZ3RoIC0gMV0gPT09ICd9J1xufVxuXG5mdW5jdGlvbiBnZXRWdWVUZW1wbGF0ZUNvbXBpbGVySGVscGVycyhcbiAgX1Z1ZTogQ29tcG9uZW50XG4pOiB7IFtuYW1lOiBzdHJpbmddOiBGdW5jdGlvbiB9IHtcbiAgLy8gJEZsb3dJZ25vcmVcbiAgY29uc3QgdnVlID0gbmV3IF9WdWUoKVxuICBjb25zdCBoZWxwZXJzID0ge31cbiAgY29uc3QgbmFtZXMgPSBbXG4gICAgJ19jJyxcbiAgICAnX28nLFxuICAgICdfbicsXG4gICAgJ19zJyxcbiAgICAnX2wnLFxuICAgICdfdCcsXG4gICAgJ19xJyxcbiAgICAnX2knLFxuICAgICdfbScsXG4gICAgJ19mJyxcbiAgICAnX2snLFxuICAgICdfYicsXG4gICAgJ192JyxcbiAgICAnX2UnLFxuICAgICdfdScsXG4gICAgJ19nJ1xuICBdXG4gIG5hbWVzLmZvckVhY2gobmFtZSA9PiB7XG4gICAgaGVscGVyc1tuYW1lXSA9IHZ1ZS5fcmVuZGVyUHJveHlbbmFtZV1cbiAgfSlcbiAgaGVscGVycy4kY3JlYXRlRWxlbWVudCA9IHZ1ZS5fcmVuZGVyUHJveHkuJGNyZWF0ZUVsZW1lbnRcbiAgcmV0dXJuIGhlbHBlcnNcbn1cblxuZnVuY3Rpb24gdmFsaWRhdGVFbnZpcm9ubWVudCgpOiB2b2lkIHtcbiAgaWYgKFZVRV9WRVJTSU9OIDwgMi4xKSB7XG4gICAgdGhyb3dFcnJvcihgdGhlIHNjb3BlZFNsb3RzIG9wdGlvbiBpcyBvbmx5IHN1cHBvcnRlZCBpbiB2dWVAMi4xKy5gKVxuICB9XG59XG5cbmNvbnN0IHNsb3RTY29wZVJlID0gLzxbXj5dKyBzbG90LXNjb3BlPVxcXCIoLispXFxcIi9cblxuLy8gSGlkZSB3YXJuaW5nIGFib3V0IDx0ZW1wbGF0ZT4gZGlzYWxsb3dlZCBhcyByb290IGVsZW1lbnRcbmZ1bmN0aW9uIGN1c3RvbVdhcm4obXNnKSB7XG4gIGlmIChtc2cuaW5kZXhPZignQ2Fubm90IHVzZSA8dGVtcGxhdGU+IGFzIGNvbXBvbmVudCByb290IGVsZW1lbnQnKSA9PT0gLTEpIHtcbiAgICBjb25zb2xlLmVycm9yKG1zZylcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjcmVhdGVTY29wZWRTbG90cyhcbiAgc2NvcGVkU2xvdHNPcHRpb246ID97IFtzbG90TmFtZTogc3RyaW5nXTogc3RyaW5nIHwgRnVuY3Rpb24gfSxcbiAgX1Z1ZTogQ29tcG9uZW50XG4pOiB7XG4gIFtzbG90TmFtZTogc3RyaW5nXTogKHByb3BzOiBPYmplY3QpID0+IFZOb2RlIHwgQXJyYXk8Vk5vZGU+XG59IHtcbiAgY29uc3Qgc2NvcGVkU2xvdHMgPSB7fVxuICBpZiAoIXNjb3BlZFNsb3RzT3B0aW9uKSB7XG4gICAgcmV0dXJuIHNjb3BlZFNsb3RzXG4gIH1cbiAgdmFsaWRhdGVFbnZpcm9ubWVudCgpXG4gIGNvbnN0IGhlbHBlcnMgPSBnZXRWdWVUZW1wbGF0ZUNvbXBpbGVySGVscGVycyhfVnVlKVxuICBmb3IgKGNvbnN0IHNjb3BlZFNsb3ROYW1lIGluIHNjb3BlZFNsb3RzT3B0aW9uKSB7XG4gICAgY29uc3Qgc2xvdCA9IHNjb3BlZFNsb3RzT3B0aW9uW3Njb3BlZFNsb3ROYW1lXVxuICAgIGNvbnN0IGlzRm4gPSB0eXBlb2Ygc2xvdCA9PT0gJ2Z1bmN0aW9uJ1xuICAgIC8vIFR5cGUgY2hlY2sgdG8gc2lsZW5jZSBmbG93IChjYW4ndCB1c2UgaXNGbilcbiAgICBjb25zdCByZW5kZXJGbiA9XG4gICAgICB0eXBlb2Ygc2xvdCA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICA/IHNsb3RcbiAgICAgICAgOiBjb21waWxlVG9GdW5jdGlvbnMoc2xvdCwgeyB3YXJuOiBjdXN0b21XYXJuIH0pLnJlbmRlclxuXG4gICAgY29uc3QgaGFzU2xvdFNjb3BlQXR0ciA9ICFpc0ZuICYmIHNsb3QubWF0Y2goc2xvdFNjb3BlUmUpXG4gICAgY29uc3Qgc2xvdFNjb3BlID0gaGFzU2xvdFNjb3BlQXR0ciAmJiBoYXNTbG90U2NvcGVBdHRyWzFdXG4gICAgc2NvcGVkU2xvdHNbc2NvcGVkU2xvdE5hbWVdID0gZnVuY3Rpb24ocHJvcHMpIHtcbiAgICAgIGxldCByZXNcbiAgICAgIGlmIChpc0ZuKSB7XG4gICAgICAgIHJlcyA9IHJlbmRlckZuLmNhbGwoeyAuLi5oZWxwZXJzIH0sIHByb3BzKVxuICAgICAgfSBlbHNlIGlmIChzbG90U2NvcGUgJiYgIWlzRGVzdHJ1Y3R1cmluZ1Nsb3RTY29wZShzbG90U2NvcGUpKSB7XG4gICAgICAgIHJlcyA9IHJlbmRlckZuLmNhbGwoeyAuLi5oZWxwZXJzLCBbc2xvdFNjb3BlXTogcHJvcHMgfSlcbiAgICAgIH0gZWxzZSBpZiAoc2xvdFNjb3BlICYmIGlzRGVzdHJ1Y3R1cmluZ1Nsb3RTY29wZShzbG90U2NvcGUpKSB7XG4gICAgICAgIHJlcyA9IHJlbmRlckZuLmNhbGwoeyAuLi5oZWxwZXJzLCAuLi5wcm9wcyB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzID0gcmVuZGVyRm4uY2FsbCh7IC4uLmhlbHBlcnMsIHByb3BzIH0pXG4gICAgICB9XG4gICAgICAvLyByZXMgaXMgQXJyYXkgaWYgPHRlbXBsYXRlPiBpcyBhIHJvb3QgZWxlbWVudFxuICAgICAgcmV0dXJuIEFycmF5LmlzQXJyYXkocmVzKSA/IHJlc1swXSA6IHJlc1xuICAgIH1cbiAgfVxuICByZXR1cm4gc2NvcGVkU2xvdHNcbn1cbiIsIi8vIEBmbG93XG5cbmltcG9ydCBWdWUgZnJvbSAndnVlJ1xuaW1wb3J0IHsgdGhyb3dFcnJvciwgY2FtZWxpemUsIGNhcGl0YWxpemUsIGh5cGhlbmF0ZSB9IGZyb20gJy4uL3NoYXJlZC91dGlsJ1xuaW1wb3J0IHtcbiAgY29tcG9uZW50TmVlZHNDb21waWxpbmcsXG4gIHRlbXBsYXRlQ29udGFpbnNDb21wb25lbnQsXG4gIGlzVnVlQ29tcG9uZW50LFxuICBpc0R5bmFtaWNDb21wb25lbnQsXG4gIGlzQ29uc3RydWN0b3Jcbn0gZnJvbSAnLi4vc2hhcmVkL3ZhbGlkYXRvcnMnXG5pbXBvcnQgeyBjb21waWxlVGVtcGxhdGUsIGNvbXBpbGVGcm9tU3RyaW5nIH0gZnJvbSAnLi4vc2hhcmVkL2NvbXBpbGUtdGVtcGxhdGUnXG5cbmZ1bmN0aW9uIGlzVnVlQ29tcG9uZW50U3R1Yihjb21wKTogYm9vbGVhbiB7XG4gIHJldHVybiAoY29tcCAmJiBjb21wLnRlbXBsYXRlKSB8fCBpc1Z1ZUNvbXBvbmVudChjb21wKVxufVxuXG5mdW5jdGlvbiBpc1ZhbGlkU3R1YihzdHViOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuIChcbiAgICB0eXBlb2Ygc3R1YiA9PT0gJ2Jvb2xlYW4nIHx8XG4gICAgKCEhc3R1YiAmJiB0eXBlb2Ygc3R1YiA9PT0gJ3N0cmluZycpIHx8XG4gICAgaXNWdWVDb21wb25lbnRTdHViKHN0dWIpXG4gIClcbn1cblxuZnVuY3Rpb24gcmVzb2x2ZUNvbXBvbmVudChvYmo6IE9iamVjdCwgY29tcG9uZW50OiBzdHJpbmcpOiBPYmplY3Qge1xuICByZXR1cm4gKFxuICAgIG9ialtjb21wb25lbnRdIHx8XG4gICAgb2JqW2h5cGhlbmF0ZShjb21wb25lbnQpXSB8fFxuICAgIG9ialtjYW1lbGl6ZShjb21wb25lbnQpXSB8fFxuICAgIG9ialtjYXBpdGFsaXplKGNhbWVsaXplKGNvbXBvbmVudCkpXSB8fFxuICAgIG9ialtjYXBpdGFsaXplKGNvbXBvbmVudCldIHx8XG4gICAge31cbiAgKVxufVxuXG5mdW5jdGlvbiBnZXRDb3JlUHJvcGVydGllcyhjb21wb25lbnRPcHRpb25zOiBDb21wb25lbnQpOiBPYmplY3Qge1xuICByZXR1cm4ge1xuICAgIGF0dHJzOiBjb21wb25lbnRPcHRpb25zLmF0dHJzLFxuICAgIG5hbWU6IGNvbXBvbmVudE9wdGlvbnMubmFtZSxcbiAgICBwcm9wczogY29tcG9uZW50T3B0aW9ucy5wcm9wcyxcbiAgICBvbjogY29tcG9uZW50T3B0aW9ucy5vbixcbiAgICBrZXk6IGNvbXBvbmVudE9wdGlvbnMua2V5LFxuICAgIHJlZjogY29tcG9uZW50T3B0aW9ucy5yZWYsXG4gICAgZG9tUHJvcHM6IGNvbXBvbmVudE9wdGlvbnMuZG9tUHJvcHMsXG4gICAgY2xhc3M6IGNvbXBvbmVudE9wdGlvbnMuY2xhc3MsXG4gICAgc3RhdGljQ2xhc3M6IGNvbXBvbmVudE9wdGlvbnMuc3RhdGljQ2xhc3MsXG4gICAgc3RhdGljU3R5bGU6IGNvbXBvbmVudE9wdGlvbnMuc3RhdGljU3R5bGUsXG4gICAgc3R5bGU6IGNvbXBvbmVudE9wdGlvbnMuc3R5bGUsXG4gICAgbm9ybWFsaXplZFN0eWxlOiBjb21wb25lbnRPcHRpb25zLm5vcm1hbGl6ZWRTdHlsZSxcbiAgICBuYXRpdmVPbjogY29tcG9uZW50T3B0aW9ucy5uYXRpdmVPbixcbiAgICBmdW5jdGlvbmFsOiBjb21wb25lbnRPcHRpb25zLmZ1bmN0aW9uYWxcbiAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVDbGFzc1N0cmluZyhzdGF0aWNDbGFzcywgZHluYW1pY0NsYXNzKSB7XG4gIGlmIChzdGF0aWNDbGFzcyAmJiBkeW5hbWljQ2xhc3MpIHtcbiAgICByZXR1cm4gc3RhdGljQ2xhc3MgKyAnICcgKyBkeW5hbWljQ2xhc3NcbiAgfVxuICByZXR1cm4gc3RhdGljQ2xhc3MgfHwgZHluYW1pY0NsYXNzXG59XG5cbmZ1bmN0aW9uIHJlc29sdmVPcHRpb25zKGNvbXBvbmVudCwgX1Z1ZSkge1xuICBpZiAoaXNEeW5hbWljQ29tcG9uZW50KGNvbXBvbmVudCkpIHtcbiAgICByZXR1cm4ge31cbiAgfVxuXG4gIHJldHVybiBpc0NvbnN0cnVjdG9yKGNvbXBvbmVudClcbiAgICA/IGNvbXBvbmVudC5vcHRpb25zXG4gICAgOiBfVnVlLmV4dGVuZChjb21wb25lbnQpLm9wdGlvbnNcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVN0dWJGcm9tQ29tcG9uZW50KFxuICBvcmlnaW5hbENvbXBvbmVudDogQ29tcG9uZW50LFxuICBuYW1lOiBzdHJpbmcsXG4gIF9WdWU6IENvbXBvbmVudFxuKTogQ29tcG9uZW50IHtcbiAgY29uc3QgY29tcG9uZW50T3B0aW9ucyA9IHJlc29sdmVPcHRpb25zKG9yaWdpbmFsQ29tcG9uZW50LCBfVnVlKVxuICBjb25zdCB0YWdOYW1lID0gYCR7bmFtZSB8fCAnYW5vbnltb3VzJ30tc3R1YmBcblxuICAvLyBpZ25vcmVFbGVtZW50cyBkb2VzIG5vdCBleGlzdCBpbiBWdWUgMi4wLnhcbiAgaWYgKFZ1ZS5jb25maWcuaWdub3JlZEVsZW1lbnRzKSB7XG4gICAgVnVlLmNvbmZpZy5pZ25vcmVkRWxlbWVudHMucHVzaCh0YWdOYW1lKVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICAuLi5nZXRDb3JlUHJvcGVydGllcyhjb21wb25lbnRPcHRpb25zKSxcbiAgICAkX3Z1ZVRlc3RVdGlsc19vcmlnaW5hbDogb3JpZ2luYWxDb21wb25lbnQsXG4gICAgJF9kb05vdFN0dWJDaGlsZHJlbjogdHJ1ZSxcbiAgICByZW5kZXIoaCwgY29udGV4dCkge1xuICAgICAgcmV0dXJuIGgoXG4gICAgICAgIHRhZ05hbWUsXG4gICAgICAgIHtcbiAgICAgICAgICBhdHRyczogY29tcG9uZW50T3B0aW9ucy5mdW5jdGlvbmFsXG4gICAgICAgICAgICA/IHtcbiAgICAgICAgICAgICAgICAuLi5jb250ZXh0LnByb3BzLFxuICAgICAgICAgICAgICAgIC4uLmNvbnRleHQuZGF0YS5hdHRycyxcbiAgICAgICAgICAgICAgICBjbGFzczogY3JlYXRlQ2xhc3NTdHJpbmcoXG4gICAgICAgICAgICAgICAgICBjb250ZXh0LmRhdGEuc3RhdGljQ2xhc3MsXG4gICAgICAgICAgICAgICAgICBjb250ZXh0LmRhdGEuY2xhc3NcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIDoge1xuICAgICAgICAgICAgICAgIC4uLnRoaXMuJHByb3BzXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgY29udGV4dCA/IGNvbnRleHQuY2hpbGRyZW4gOiB0aGlzLiRvcHRpb25zLl9yZW5kZXJDaGlsZHJlblxuICAgICAgKVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVTdHViRnJvbVN0cmluZyhcbiAgdGVtcGxhdGVTdHJpbmc6IHN0cmluZyxcbiAgb3JpZ2luYWxDb21wb25lbnQ6IENvbXBvbmVudCA9IHt9LFxuICBuYW1lOiBzdHJpbmcsXG4gIF9WdWU6IENvbXBvbmVudFxuKTogQ29tcG9uZW50IHtcbiAgaWYgKHRlbXBsYXRlQ29udGFpbnNDb21wb25lbnQodGVtcGxhdGVTdHJpbmcsIG5hbWUpKSB7XG4gICAgdGhyb3dFcnJvcignb3B0aW9ucy5zdHViIGNhbm5vdCBjb250YWluIGEgY2lyY3VsYXIgcmVmZXJlbmNlJylcbiAgfVxuICBjb25zdCBjb21wb25lbnRPcHRpb25zID0gcmVzb2x2ZU9wdGlvbnMob3JpZ2luYWxDb21wb25lbnQsIF9WdWUpXG5cbiAgcmV0dXJuIHtcbiAgICAuLi5nZXRDb3JlUHJvcGVydGllcyhjb21wb25lbnRPcHRpb25zKSxcbiAgICAkX2RvTm90U3R1YkNoaWxkcmVuOiB0cnVlLFxuICAgIC4uLmNvbXBpbGVGcm9tU3RyaW5nKHRlbXBsYXRlU3RyaW5nKVxuICB9XG59XG5cbmZ1bmN0aW9uIHZhbGlkYXRlU3R1YihzdHViKSB7XG4gIGlmICghaXNWYWxpZFN0dWIoc3R1YikpIHtcbiAgICB0aHJvd0Vycm9yKGBvcHRpb25zLnN0dWIgdmFsdWVzIG11c3QgYmUgcGFzc2VkIGEgc3RyaW5nIG9yIGAgKyBgY29tcG9uZW50YClcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU3R1YnNGcm9tU3R1YnNPYmplY3QoXG4gIG9yaWdpbmFsQ29tcG9uZW50czogT2JqZWN0ID0ge30sXG4gIHN0dWJzOiBPYmplY3QsXG4gIF9WdWU6IENvbXBvbmVudFxuKTogQ29tcG9uZW50cyB7XG4gIHJldHVybiBPYmplY3Qua2V5cyhzdHVicyB8fCB7fSkucmVkdWNlKChhY2MsIHN0dWJOYW1lKSA9PiB7XG4gICAgY29uc3Qgc3R1YiA9IHN0dWJzW3N0dWJOYW1lXVxuXG4gICAgdmFsaWRhdGVTdHViKHN0dWIpXG5cbiAgICBpZiAoc3R1YiA9PT0gZmFsc2UpIHtcbiAgICAgIHJldHVybiBhY2NcbiAgICB9XG5cbiAgICBpZiAoc3R1YiA9PT0gdHJ1ZSkge1xuICAgICAgY29uc3QgY29tcG9uZW50ID0gcmVzb2x2ZUNvbXBvbmVudChvcmlnaW5hbENvbXBvbmVudHMsIHN0dWJOYW1lKVxuICAgICAgYWNjW3N0dWJOYW1lXSA9IGNyZWF0ZVN0dWJGcm9tQ29tcG9uZW50KGNvbXBvbmVudCwgc3R1Yk5hbWUsIF9WdWUpXG4gICAgICByZXR1cm4gYWNjXG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBzdHViID09PSAnc3RyaW5nJykge1xuICAgICAgY29uc3QgY29tcG9uZW50ID0gcmVzb2x2ZUNvbXBvbmVudChvcmlnaW5hbENvbXBvbmVudHMsIHN0dWJOYW1lKVxuICAgICAgYWNjW3N0dWJOYW1lXSA9IGNyZWF0ZVN0dWJGcm9tU3RyaW5nKHN0dWIsIGNvbXBvbmVudCwgc3R1Yk5hbWUsIF9WdWUpXG4gICAgICByZXR1cm4gYWNjXG4gICAgfVxuXG4gICAgaWYgKGNvbXBvbmVudE5lZWRzQ29tcGlsaW5nKHN0dWIpKSB7XG4gICAgICBjb21waWxlVGVtcGxhdGUoc3R1YilcbiAgICB9XG5cbiAgICBhY2Nbc3R1Yk5hbWVdID0gc3R1YlxuXG4gICAgcmV0dXJuIGFjY1xuICB9LCB7fSlcbn1cbiIsImltcG9ydCB7IGNyZWF0ZVN0dWJGcm9tQ29tcG9uZW50IH0gZnJvbSAnLi9jcmVhdGUtY29tcG9uZW50LXN0dWJzJ1xuaW1wb3J0IHsgcmVzb2x2ZUNvbXBvbmVudCB9IGZyb20gJ3NoYXJlZC91dGlsJ1xuaW1wb3J0IHtcbiAgaXNSZXNlcnZlZFRhZyxcbiAgaXNDb25zdHJ1Y3RvcixcbiAgaXNEeW5hbWljQ29tcG9uZW50LFxuICBpc0NvbXBvbmVudE9wdGlvbnNcbn0gZnJvbSAnc2hhcmVkL3ZhbGlkYXRvcnMnXG5pbXBvcnQge1xuICBCRUZPUkVfUkVOREVSX0xJRkVDWUNMRV9IT09LLFxuICBDUkVBVEVfRUxFTUVOVF9BTElBU1xufSBmcm9tICdzaGFyZWQvY29uc3RzJ1xuXG5jb25zdCBpc1doaXRlbGlzdGVkID0gKGVsLCB3aGl0ZWxpc3QpID0+IHJlc29sdmVDb21wb25lbnQoZWwsIHdoaXRlbGlzdClcbmNvbnN0IGlzQWxyZWFkeVN0dWJiZWQgPSAoZWwsIHN0dWJzKSA9PiBzdHVicy5oYXMoZWwpXG5cbmZ1bmN0aW9uIHNob3VsZEV4dGVuZChjb21wb25lbnQsIF9WdWUpIHtcbiAgcmV0dXJuIGlzQ29uc3RydWN0b3IoY29tcG9uZW50KSB8fCAoY29tcG9uZW50ICYmIGNvbXBvbmVudC5leHRlbmRzKVxufVxuXG5mdW5jdGlvbiBleHRlbmQoY29tcG9uZW50LCBfVnVlKSB7XG4gIGNvbnN0IGNvbXBvbmVudE9wdGlvbnMgPSBjb21wb25lbnQub3B0aW9ucyA/IGNvbXBvbmVudC5vcHRpb25zIDogY29tcG9uZW50XG4gIGNvbnN0IHN0dWIgPSBfVnVlLmV4dGVuZChjb21wb25lbnRPcHRpb25zKVxuICBzdHViLm9wdGlvbnMuJF92dWVUZXN0VXRpbHNfb3JpZ2luYWwgPSBjb21wb25lbnRcbiAgc3R1Yi5vcHRpb25zLl9iYXNlID0gX1Z1ZVxuICByZXR1cm4gc3R1YlxufVxuXG5mdW5jdGlvbiBjcmVhdGVTdHViSWZOZWVkZWQoc2hvdWxkU3R1YiwgY29tcG9uZW50LCBfVnVlLCBlbCkge1xuICBpZiAoc2hvdWxkU3R1Yikge1xuICAgIHJldHVybiBjcmVhdGVTdHViRnJvbUNvbXBvbmVudChjb21wb25lbnQgfHwge30sIGVsLCBfVnVlKVxuICB9XG5cbiAgaWYgKHNob3VsZEV4dGVuZChjb21wb25lbnQsIF9WdWUpKSB7XG4gICAgcmV0dXJuIGV4dGVuZChjb21wb25lbnQsIF9WdWUpXG4gIH1cbn1cblxuZnVuY3Rpb24gc2hvdWxkTm90QmVTdHViYmVkKGVsLCB3aGl0ZWxpc3QsIG1vZGlmaWVkQ29tcG9uZW50cykge1xuICByZXR1cm4gKFxuICAgICh0eXBlb2YgZWwgPT09ICdzdHJpbmcnICYmIGlzUmVzZXJ2ZWRUYWcoZWwpKSB8fFxuICAgIGlzV2hpdGVsaXN0ZWQoZWwsIHdoaXRlbGlzdCkgfHxcbiAgICBpc0FscmVhZHlTdHViYmVkKGVsLCBtb2RpZmllZENvbXBvbmVudHMpXG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhdGNoQ3JlYXRlRWxlbWVudChfVnVlLCBzdHVicywgc3R1YkFsbENvbXBvbmVudHMpIHtcbiAgLy8gVGhpcyBtaXhpbiBwYXRjaGVzIHZtLiRjcmVhdGVFbGVtZW50IHNvIHRoYXQgd2UgY2FuIHN0dWIgYWxsIGNvbXBvbmVudHNcbiAgLy8gYmVmb3JlIHRoZXkgYXJlIHJlbmRlcmVkIGluIHNoYWxsb3cgbW9kZS4gV2UgYWxzbyBuZWVkIHRvIGVuc3VyZSB0aGF0XG4gIC8vIGNvbXBvbmVudCBjb25zdHJ1Y3RvcnMgd2VyZSBjcmVhdGVkIGZyb20gdGhlIF9WdWUgY29uc3RydWN0b3IuIElmIG5vdCxcbiAgLy8gd2UgbXVzdCByZXBsYWNlIHRoZW0gd2l0aCBjb21wb25lbnRzIGNyZWF0ZWQgZnJvbSB0aGUgX1Z1ZSBjb25zdHJ1Y3RvclxuICAvLyBiZWZvcmUgY2FsbGluZyB0aGUgb3JpZ2luYWwgJGNyZWF0ZUVsZW1lbnQuIFRoaXMgZW5zdXJlcyB0aGF0IGNvbXBvbmVudHNcbiAgLy8gaGF2ZSB0aGUgY29ycmVjdCBpbnN0YW5jZSBwcm9wZXJ0aWVzIGFuZCBzdHVicyB3aGVuIHRoZXkgYXJlIHJlbmRlcmVkLlxuICBmdW5jdGlvbiBwYXRjaENyZWF0ZUVsZW1lbnRNaXhpbigpIHtcbiAgICBjb25zdCB2bSA9IHRoaXNcblxuICAgIGlmICh2bS4kb3B0aW9ucy4kX2RvTm90U3R1YkNoaWxkcmVuIHx8IHZtLiRvcHRpb25zLl9pc0Z1bmN0aW9uYWxDb250YWluZXIpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnN0IG1vZGlmaWVkQ29tcG9uZW50cyA9IG5ldyBTZXQoKVxuICAgIGNvbnN0IG9yaWdpbmFsQ3JlYXRlRWxlbWVudCA9IHZtLiRjcmVhdGVFbGVtZW50XG4gICAgY29uc3Qgb3JpZ2luYWxDb21wb25lbnRzID0gdm0uJG9wdGlvbnMuY29tcG9uZW50c1xuXG4gICAgY29uc3QgY3JlYXRlRWxlbWVudCA9IChlbCwgLi4uYXJncykgPT4ge1xuICAgICAgaWYgKHNob3VsZE5vdEJlU3R1YmJlZChlbCwgc3R1YnMsIG1vZGlmaWVkQ29tcG9uZW50cykpIHtcbiAgICAgICAgcmV0dXJuIG9yaWdpbmFsQ3JlYXRlRWxlbWVudChlbCwgLi4uYXJncylcbiAgICAgIH1cblxuICAgICAgaWYgKGlzQ29uc3RydWN0b3IoZWwpIHx8IGlzQ29tcG9uZW50T3B0aW9ucyhlbCkpIHtcbiAgICAgICAgaWYgKHN0dWJBbGxDb21wb25lbnRzKSB7XG4gICAgICAgICAgY29uc3Qgc3R1YiA9IGNyZWF0ZVN0dWJGcm9tQ29tcG9uZW50KGVsLCBlbC5uYW1lIHx8ICdhbm9ueW1vdXMnLCBfVnVlKVxuICAgICAgICAgIHJldHVybiBvcmlnaW5hbENyZWF0ZUVsZW1lbnQoc3R1YiwgLi4uYXJncylcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBDb25zdHJ1Y3RvciA9IHNob3VsZEV4dGVuZChlbCwgX1Z1ZSkgPyBleHRlbmQoZWwsIF9WdWUpIDogZWxcblxuICAgICAgICByZXR1cm4gb3JpZ2luYWxDcmVhdGVFbGVtZW50KENvbnN0cnVjdG9yLCAuLi5hcmdzKVxuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIGVsID09PSAnc3RyaW5nJykge1xuICAgICAgICBjb25zdCBvcmlnaW5hbCA9IHJlc29sdmVDb21wb25lbnQoZWwsIG9yaWdpbmFsQ29tcG9uZW50cylcblxuICAgICAgICBpZiAoIW9yaWdpbmFsKSB7XG4gICAgICAgICAgcmV0dXJuIG9yaWdpbmFsQ3JlYXRlRWxlbWVudChlbCwgLi4uYXJncylcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpc0R5bmFtaWNDb21wb25lbnQob3JpZ2luYWwpKSB7XG4gICAgICAgICAgcmV0dXJuIG9yaWdpbmFsQ3JlYXRlRWxlbWVudChlbCwgLi4uYXJncylcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHN0dWIgPSBjcmVhdGVTdHViSWZOZWVkZWQoc3R1YkFsbENvbXBvbmVudHMsIG9yaWdpbmFsLCBfVnVlLCBlbClcblxuICAgICAgICBpZiAoc3R1Yikge1xuICAgICAgICAgIE9iamVjdC5hc3NpZ24odm0uJG9wdGlvbnMuY29tcG9uZW50cywge1xuICAgICAgICAgICAgW2VsXTogc3R1YlxuICAgICAgICAgIH0pXG4gICAgICAgICAgbW9kaWZpZWRDb21wb25lbnRzLmFkZChlbClcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gb3JpZ2luYWxDcmVhdGVFbGVtZW50KGVsLCAuLi5hcmdzKVxuICAgIH1cblxuICAgIHZtW0NSRUFURV9FTEVNRU5UX0FMSUFTXSA9IGNyZWF0ZUVsZW1lbnRcbiAgICB2bS4kY3JlYXRlRWxlbWVudCA9IGNyZWF0ZUVsZW1lbnRcbiAgfVxuXG4gIF9WdWUubWl4aW4oe1xuICAgIFtCRUZPUkVfUkVOREVSX0xJRkVDWUNMRV9IT09LXTogcGF0Y2hDcmVhdGVFbGVtZW50TWl4aW5cbiAgfSlcbn1cbiIsIi8vIEBmbG93XG5cbmltcG9ydCB7IGNyZWF0ZVNsb3RWTm9kZXMgfSBmcm9tICcuL2NyZWF0ZS1zbG90LXZub2RlcydcbmltcG9ydCBhZGRNb2NrcyBmcm9tICcuL2FkZC1tb2NrcydcbmltcG9ydCB7IGFkZEV2ZW50TG9nZ2VyIH0gZnJvbSAnLi9sb2ctZXZlbnRzJ1xuaW1wb3J0IHsgYWRkU3R1YnMgfSBmcm9tICcuL2FkZC1zdHVicydcbmltcG9ydCB7IGNvbXBpbGVUZW1wbGF0ZSB9IGZyb20gJ3NoYXJlZC9jb21waWxlLXRlbXBsYXRlJ1xuaW1wb3J0IGV4dHJhY3RJbnN0YW5jZU9wdGlvbnMgZnJvbSAnLi9leHRyYWN0LWluc3RhbmNlLW9wdGlvbnMnXG5pbXBvcnQgeyBjb21wb25lbnROZWVkc0NvbXBpbGluZywgaXNDb25zdHJ1Y3RvciB9IGZyb20gJ3NoYXJlZC92YWxpZGF0b3JzJ1xuaW1wb3J0IGNyZWF0ZVNjb3BlZFNsb3RzIGZyb20gJy4vY3JlYXRlLXNjb3BlZC1zbG90cydcbmltcG9ydCB7IGNyZWF0ZVN0dWJzRnJvbVN0dWJzT2JqZWN0IH0gZnJvbSAnLi9jcmVhdGUtY29tcG9uZW50LXN0dWJzJ1xuaW1wb3J0IHsgcGF0Y2hDcmVhdGVFbGVtZW50IH0gZnJvbSAnLi9wYXRjaC1jcmVhdGUtZWxlbWVudCdcblxuZnVuY3Rpb24gY3JlYXRlQ29udGV4dChvcHRpb25zLCBzY29wZWRTbG90cykge1xuICBjb25zdCBvbiA9IHtcbiAgICAuLi4ob3B0aW9ucy5jb250ZXh0ICYmIG9wdGlvbnMuY29udGV4dC5vbiksXG4gICAgLi4ub3B0aW9ucy5saXN0ZW5lcnNcbiAgfVxuICByZXR1cm4ge1xuICAgIGF0dHJzOiB7XG4gICAgICAuLi5vcHRpb25zLmF0dHJzLFxuICAgICAgLy8gcGFzcyBhcyBhdHRycyBzbyB0aGF0IGluaGVyaXRBdHRycyB3b3JrcyBjb3JyZWN0bHlcbiAgICAgIC8vIHByb3BzRGF0YSBzaG91bGQgdGFrZSBwcmVjZWRlbmNlIG92ZXIgYXR0cnNcbiAgICAgIC4uLm9wdGlvbnMucHJvcHNEYXRhXG4gICAgfSxcbiAgICAuLi4ob3B0aW9ucy5jb250ZXh0IHx8IHt9KSxcbiAgICBvbixcbiAgICBzY29wZWRTbG90c1xuICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUNoaWxkcmVuKHZtLCBoLCB7IHNsb3RzLCBjb250ZXh0IH0pIHtcbiAgY29uc3Qgc2xvdFZOb2RlcyA9IHNsb3RzID8gY3JlYXRlU2xvdFZOb2Rlcyh2bSwgc2xvdHMpIDogdW5kZWZpbmVkXG4gIHJldHVybiAoXG4gICAgKGNvbnRleHQgJiZcbiAgICAgIGNvbnRleHQuY2hpbGRyZW4gJiZcbiAgICAgIGNvbnRleHQuY2hpbGRyZW4ubWFwKHggPT4gKHR5cGVvZiB4ID09PSAnZnVuY3Rpb24nID8geChoKSA6IHgpKSkgfHxcbiAgICBzbG90Vk5vZGVzXG4gIClcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY3JlYXRlSW5zdGFuY2UoXG4gIGNvbXBvbmVudDogQ29tcG9uZW50LFxuICBvcHRpb25zOiBPcHRpb25zLFxuICBfVnVlOiBDb21wb25lbnRcbik6IENvbXBvbmVudCB7XG4gIGNvbnN0IGNvbXBvbmVudE9wdGlvbnMgPSBpc0NvbnN0cnVjdG9yKGNvbXBvbmVudClcbiAgICA/IGNvbXBvbmVudC5vcHRpb25zXG4gICAgOiBjb21wb25lbnRcblxuICAvLyBpbnN0YW5jZSBvcHRpb25zIGFyZSBvcHRpb25zIHRoYXQgYXJlIHBhc3NlZCB0byB0aGVcbiAgLy8gcm9vdCBpbnN0YW5jZSB3aGVuIGl0J3MgaW5zdGFudGlhdGVkXG4gIGNvbnN0IGluc3RhbmNlT3B0aW9ucyA9IGV4dHJhY3RJbnN0YW5jZU9wdGlvbnMob3B0aW9ucylcblxuICBjb25zdCBzdHViQ29tcG9uZW50c09iamVjdCA9IGNyZWF0ZVN0dWJzRnJvbVN0dWJzT2JqZWN0KFxuICAgIGNvbXBvbmVudE9wdGlvbnMuY29tcG9uZW50cyxcbiAgICAvLyAkRmxvd0lnbm9yZVxuICAgIG9wdGlvbnMuc3R1YnMsXG4gICAgX1Z1ZVxuICApXG5cbiAgYWRkRXZlbnRMb2dnZXIoX1Z1ZSlcbiAgYWRkTW9ja3MoX1Z1ZSwgb3B0aW9ucy5tb2NrcylcbiAgYWRkU3R1YnMoX1Z1ZSwgc3R1YkNvbXBvbmVudHNPYmplY3QpXG4gIHBhdGNoQ3JlYXRlRWxlbWVudChfVnVlLCBzdHViQ29tcG9uZW50c09iamVjdCwgb3B0aW9ucy5zaG91bGRQcm94eSlcblxuICBpZiAoY29tcG9uZW50TmVlZHNDb21waWxpbmcoY29tcG9uZW50T3B0aW9ucykpIHtcbiAgICBjb21waWxlVGVtcGxhdGUoY29tcG9uZW50T3B0aW9ucylcbiAgfVxuXG4gIC8vIHVzZWQgdG8gaWRlbnRpZnkgZXh0ZW5kZWQgY29tcG9uZW50IHVzaW5nIGNvbnN0cnVjdG9yXG4gIGNvbXBvbmVudE9wdGlvbnMuJF92dWVUZXN0VXRpbHNfb3JpZ2luYWwgPSBjb21wb25lbnRcblxuICAvLyBtYWtlIHN1cmUgYWxsIGV4dGVuZHMgYXJlIGJhc2VkIG9uIHRoaXMgaW5zdGFuY2VcbiAgY29tcG9uZW50T3B0aW9ucy5fYmFzZSA9IF9WdWVcblxuICBjb25zdCBDb25zdHJ1Y3RvciA9IF9WdWUuZXh0ZW5kKGNvbXBvbmVudE9wdGlvbnMpLmV4dGVuZChpbnN0YW5jZU9wdGlvbnMpXG5cbiAgY29uc3Qgc2NvcGVkU2xvdHMgPSBjcmVhdGVTY29wZWRTbG90cyhvcHRpb25zLnNjb3BlZFNsb3RzLCBfVnVlKVxuXG4gIGNvbnN0IHBhcmVudENvbXBvbmVudE9wdGlvbnMgPSBvcHRpb25zLnBhcmVudENvbXBvbmVudCB8fCB7fVxuXG4gIHBhcmVudENvbXBvbmVudE9wdGlvbnMucHJvdmlkZSA9IG9wdGlvbnMucHJvdmlkZVxuICBwYXJlbnRDb21wb25lbnRPcHRpb25zLiRfZG9Ob3RTdHViQ2hpbGRyZW4gPSB0cnVlXG4gIHBhcmVudENvbXBvbmVudE9wdGlvbnMuX2lzRnVuY3Rpb25hbENvbnRhaW5lciA9IGNvbXBvbmVudE9wdGlvbnMuZnVuY3Rpb25hbFxuICBwYXJlbnRDb21wb25lbnRPcHRpb25zLnJlbmRlciA9IGZ1bmN0aW9uKGgpIHtcbiAgICByZXR1cm4gaChcbiAgICAgIENvbnN0cnVjdG9yLFxuICAgICAgY3JlYXRlQ29udGV4dChvcHRpb25zLCBzY29wZWRTbG90cyksXG4gICAgICBjcmVhdGVDaGlsZHJlbih0aGlzLCBoLCBvcHRpb25zKVxuICAgIClcbiAgfVxuICBjb25zdCBQYXJlbnQgPSBfVnVlLmV4dGVuZChwYXJlbnRDb21wb25lbnRPcHRpb25zKVxuXG4gIHJldHVybiBuZXcgUGFyZW50KClcbn1cbiIsImltcG9ydCB7IGlzUGxhaW5PYmplY3QgfSBmcm9tICcuL3ZhbGlkYXRvcnMnXG5pbXBvcnQgeyB0aHJvd0Vycm9yIH0gZnJvbSAnLi91dGlsJ1xuaW1wb3J0IHsgVlVFX1ZFUlNJT04gfSBmcm9tICcuL2NvbnN0cydcblxuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZVN0dWJzKHN0dWJzID0ge30pIHtcbiAgaWYgKHN0dWJzID09PSBmYWxzZSkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG4gIGlmIChpc1BsYWluT2JqZWN0KHN0dWJzKSkge1xuICAgIHJldHVybiBzdHVic1xuICB9XG4gIGlmIChBcnJheS5pc0FycmF5KHN0dWJzKSkge1xuICAgIHJldHVybiBzdHVicy5yZWR1Y2UoKGFjYywgc3R1YikgPT4ge1xuICAgICAgaWYgKHR5cGVvZiBzdHViICE9PSAnc3RyaW5nJykge1xuICAgICAgICB0aHJvd0Vycm9yKCdlYWNoIGl0ZW0gaW4gYW4gb3B0aW9ucy5zdHVicyBhcnJheSBtdXN0IGJlIGEgc3RyaW5nJylcbiAgICAgIH1cbiAgICAgIGFjY1tzdHViXSA9IHRydWVcbiAgICAgIHJldHVybiBhY2NcbiAgICB9LCB7fSlcbiAgfVxuICB0aHJvd0Vycm9yKCdvcHRpb25zLnN0dWJzIG11c3QgYmUgYW4gb2JqZWN0IG9yIGFuIEFycmF5Jylcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZVByb3ZpZGUocHJvdmlkZSkge1xuICAvLyBPYmplY3RzIGFyZSBub3QgcmVzb2x2ZWQgaW4gZXh0ZW5kZWQgY29tcG9uZW50cyBpbiBWdWUgPCAyLjVcbiAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3Z1ZWpzL3Z1ZS9pc3N1ZXMvNjQzNlxuICBpZiAodHlwZW9mIHByb3ZpZGUgPT09ICdvYmplY3QnICYmIFZVRV9WRVJTSU9OIDwgMi41KSB7XG4gICAgY29uc3Qgb2JqID0geyAuLi5wcm92aWRlIH1cbiAgICByZXR1cm4gKCkgPT4gb2JqXG4gIH1cbiAgcmV0dXJuIHByb3ZpZGVcbn1cbiIsIi8vIEBmbG93XG5pbXBvcnQgeyBub3JtYWxpemVTdHVicywgbm9ybWFsaXplUHJvdmlkZSB9IGZyb20gJy4vbm9ybWFsaXplJ1xuXG5mdW5jdGlvbiBnZXRPcHRpb24ob3B0aW9uLCBjb25maWc/OiBPYmplY3QpOiBhbnkge1xuICBpZiAob3B0aW9uID09PSBmYWxzZSkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG4gIGlmIChvcHRpb24gfHwgKGNvbmZpZyAmJiBPYmplY3Qua2V5cyhjb25maWcpLmxlbmd0aCA+IDApKSB7XG4gICAgaWYgKG9wdGlvbiBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB7XG4gICAgICByZXR1cm4gb3B0aW9uXG4gICAgfVxuICAgIGlmIChjb25maWcgaW5zdGFuY2VvZiBGdW5jdGlvbikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDb25maWcgY2FuJ3QgYmUgYSBGdW5jdGlvbi5gKVxuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgLi4uY29uZmlnLFxuICAgICAgLi4ub3B0aW9uXG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtZXJnZU9wdGlvbnMob3B0aW9uczogT3B0aW9ucywgY29uZmlnOiBDb25maWcpOiBPcHRpb25zIHtcbiAgY29uc3QgbW9ja3MgPSAoZ2V0T3B0aW9uKG9wdGlvbnMubW9ja3MsIGNvbmZpZy5tb2Nrcyk6IE9iamVjdClcbiAgY29uc3QgbWV0aG9kcyA9IChnZXRPcHRpb24ob3B0aW9ucy5tZXRob2RzLCBjb25maWcubWV0aG9kcyk6IHtcbiAgICBba2V5OiBzdHJpbmddOiBGdW5jdGlvblxuICB9KVxuICBjb25zdCBwcm92aWRlID0gKGdldE9wdGlvbihvcHRpb25zLnByb3ZpZGUsIGNvbmZpZy5wcm92aWRlKTogT2JqZWN0KVxuICByZXR1cm4ge1xuICAgIC4uLm9wdGlvbnMsXG4gICAgcHJvdmlkZTogbm9ybWFsaXplUHJvdmlkZShwcm92aWRlKSxcbiAgICBsb2dNb2RpZmllZENvbXBvbmVudHM6IGNvbmZpZy5sb2dNb2RpZmllZENvbXBvbmVudHMsXG4gICAgc3R1YnM6IGdldE9wdGlvbihub3JtYWxpemVTdHVicyhvcHRpb25zLnN0dWJzKSwgY29uZmlnLnN0dWJzKSxcbiAgICBtb2NrcyxcbiAgICBtZXRob2RzLFxuICAgIHN5bmM6ICEhKG9wdGlvbnMuc3luYyB8fCBvcHRpb25zLnN5bmMgPT09IHVuZGVmaW5lZClcbiAgfVxufVxuIiwiaW1wb3J0IHRlc3RVdGlscyBmcm9tICdAdnVlL3Rlc3QtdXRpbHMnXG5cbmV4cG9ydCBkZWZhdWx0IHRlc3RVdGlscy5jb25maWdcbiIsIi8vIEBmbG93XG5cbmltcG9ydCB7IHRocm93RXJyb3IgfSBmcm9tICdzaGFyZWQvdXRpbCdcbmltcG9ydCB7IGNvbXBpbGVUb0Z1bmN0aW9ucyB9IGZyb20gJ3Z1ZS10ZW1wbGF0ZS1jb21waWxlcidcbmltcG9ydCB7IGlzVnVlQ29tcG9uZW50IH0gZnJvbSAnLi92YWxpZGF0b3JzJ1xuXG5mdW5jdGlvbiBpc1ZhbGlkU2xvdChzbG90OiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuIGlzVnVlQ29tcG9uZW50KHNsb3QpIHx8IHR5cGVvZiBzbG90ID09PSAnc3RyaW5nJ1xufVxuXG5mdW5jdGlvbiByZXF1aXJlc1RlbXBsYXRlQ29tcGlsZXIoc2xvdDogYW55KTogdm9pZCB7XG4gIGlmICh0eXBlb2Ygc2xvdCA9PT0gJ3N0cmluZycgJiYgIWNvbXBpbGVUb0Z1bmN0aW9ucykge1xuICAgIHRocm93RXJyb3IoXG4gICAgICBgdnVlVGVtcGxhdGVDb21waWxlciBpcyB1bmRlZmluZWQsIHlvdSBtdXN0IHBhc3MgYCArXG4gICAgICAgIGBwcmVjb21waWxlZCBjb21wb25lbnRzIGlmIHZ1ZS10ZW1wbGF0ZS1jb21waWxlciBpcyBgICtcbiAgICAgICAgYHVuZGVmaW5lZGBcbiAgICApXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlU2xvdHMoc2xvdHM6IFNsb3RzT2JqZWN0KTogdm9pZCB7XG4gIE9iamVjdC5rZXlzKHNsb3RzKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgY29uc3Qgc2xvdCA9IEFycmF5LmlzQXJyYXkoc2xvdHNba2V5XSkgPyBzbG90c1trZXldIDogW3Nsb3RzW2tleV1dXG5cbiAgICBzbG90LmZvckVhY2goc2xvdFZhbHVlID0+IHtcbiAgICAgIGlmICghaXNWYWxpZFNsb3Qoc2xvdFZhbHVlKSkge1xuICAgICAgICB0aHJvd0Vycm9yKFxuICAgICAgICAgIGBzbG90c1trZXldIG11c3QgYmUgYSBDb21wb25lbnQsIHN0cmluZyBvciBhbiBhcnJheSBgICtcbiAgICAgICAgICAgIGBvZiBDb21wb25lbnRzYFxuICAgICAgICApXG4gICAgICB9XG4gICAgICByZXF1aXJlc1RlbXBsYXRlQ29tcGlsZXIoc2xvdFZhbHVlKVxuICAgIH0pXG4gIH0pXG59XG4iLCJpbXBvcnQge1xuICBpc1BsYWluT2JqZWN0LFxuICBpc0Z1bmN0aW9uYWxDb21wb25lbnQsXG4gIGlzQ29uc3RydWN0b3Jcbn0gZnJvbSAnLi92YWxpZGF0b3JzJ1xuaW1wb3J0IHsgVlVFX1ZFUlNJT04gfSBmcm9tICcuL2NvbnN0cydcbmltcG9ydCB7IGNvbXBpbGVUZW1wbGF0ZUZvclNsb3RzIH0gZnJvbSAnLi9jb21waWxlLXRlbXBsYXRlJ1xuaW1wb3J0IHsgdGhyb3dFcnJvciB9IGZyb20gJy4vdXRpbCdcbmltcG9ydCB7IHZhbGlkYXRlU2xvdHMgfSBmcm9tICcuL3ZhbGlkYXRlLXNsb3RzJ1xuXG5mdW5jdGlvbiB2dWVFeHRlbmRVbnN1cHBvcnRlZE9wdGlvbihvcHRpb24pIHtcbiAgcmV0dXJuIChcbiAgICBgb3B0aW9ucy4ke29wdGlvbn0gaXMgbm90IHN1cHBvcnRlZCBmb3IgYCArXG4gICAgYGNvbXBvbmVudHMgY3JlYXRlZCB3aXRoIFZ1ZS5leHRlbmQgaW4gVnVlIDwgMi4zLiBgICtcbiAgICBgWW91IGNhbiBzZXQgJHtvcHRpb259IHRvIGZhbHNlIHRvIG1vdW50IHRoZSBjb21wb25lbnQuYFxuICApXG59XG4vLyB0aGVzZSBvcHRpb25zIGFyZW4ndCBzdXBwb3J0ZWQgaWYgVnVlIGlzIHZlcnNpb24gPCAyLjNcbi8vIGZvciBjb21wb25lbnRzIHVzaW5nIFZ1ZS5leHRlbmQuIFRoaXMgaXMgZHVlIHRvIGEgYnVnXG4vLyB0aGF0IG1lYW5zIHRoZSBtaXhpbnMgd2UgdXNlIHRvIGFkZCBwcm9wZXJ0aWVzIGFyZSBub3QgYXBwbGllZFxuLy8gY29ycmVjdGx5XG5jb25zdCBVTlNVUFBPUlRFRF9WRVJTSU9OX09QVElPTlMgPSBbJ21vY2tzJywgJ3N0dWJzJywgJ2xvY2FsVnVlJ11cblxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlT3B0aW9ucyhvcHRpb25zLCBjb21wb25lbnQpIHtcbiAgaWYgKG9wdGlvbnMucGFyZW50Q29tcG9uZW50ICYmICFpc1BsYWluT2JqZWN0KG9wdGlvbnMucGFyZW50Q29tcG9uZW50KSkge1xuICAgIHRocm93RXJyb3IoXG4gICAgICBgb3B0aW9ucy5wYXJlbnRDb21wb25lbnQgc2hvdWxkIGJlIGEgdmFsaWQgVnVlIGNvbXBvbmVudCBvcHRpb25zIG9iamVjdGBcbiAgICApXG4gIH1cblxuICBpZiAoIWlzRnVuY3Rpb25hbENvbXBvbmVudChjb21wb25lbnQpICYmIG9wdGlvbnMuY29udGV4dCkge1xuICAgIHRocm93RXJyb3IoXG4gICAgICBgbW91bnQuY29udGV4dCBjYW4gb25seSBiZSB1c2VkIHdoZW4gbW91bnRpbmcgYSBmdW5jdGlvbmFsIGNvbXBvbmVudGBcbiAgICApXG4gIH1cblxuICBpZiAob3B0aW9ucy5jb250ZXh0ICYmICFpc1BsYWluT2JqZWN0KG9wdGlvbnMuY29udGV4dCkpIHtcbiAgICB0aHJvd0Vycm9yKCdtb3VudC5jb250ZXh0IG11c3QgYmUgYW4gb2JqZWN0JylcbiAgfVxuXG4gIGlmIChWVUVfVkVSU0lPTiA8IDIuMyAmJiBpc0NvbnN0cnVjdG9yKGNvbXBvbmVudCkpIHtcbiAgICBVTlNVUFBPUlRFRF9WRVJTSU9OX09QVElPTlMuZm9yRWFjaChvcHRpb24gPT4ge1xuICAgICAgaWYgKG9wdGlvbnNbb3B0aW9uXSkge1xuICAgICAgICB0aHJvd0Vycm9yKHZ1ZUV4dGVuZFVuc3VwcG9ydGVkT3B0aW9uKG9wdGlvbikpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIGlmIChvcHRpb25zLnNsb3RzKSB7XG4gICAgY29tcGlsZVRlbXBsYXRlRm9yU2xvdHMob3B0aW9ucy5zbG90cylcbiAgICAvLyB2YWxpZGF0ZSBzbG90cyBvdXRzaWRlIG9mIHRoZSBjcmVhdGVTbG90cyBmdW5jdGlvbiBzb1xuICAgIC8vIHRoYXQgd2UgY2FuIHRocm93IGFuIGVycm9yIHdpdGhvdXQgaXQgYmVpbmcgY2F1Z2h0IGJ5XG4gICAgLy8gdGhlIFZ1ZSBlcnJvciBoYW5kbGVyXG4gICAgLy8gJEZsb3dJZ25vcmVcbiAgICB2YWxpZGF0ZVNsb3RzKG9wdGlvbnMuc2xvdHMpXG4gIH1cbn1cbiIsIi8vIEBmbG93XG5cbmltcG9ydCBWdWUgZnJvbSAndnVlJ1xuaW1wb3J0IGNyZWF0ZUluc3RhbmNlIGZyb20gJ2NyZWF0ZS1pbnN0YW5jZSdcbmltcG9ydCB7IHRocm93RXJyb3IgfSBmcm9tICdzaGFyZWQvdXRpbCdcbmltcG9ydCB7IGNyZWF0ZVJlbmRlcmVyIH0gZnJvbSAndnVlLXNlcnZlci1yZW5kZXJlcidcbmltcG9ydCB7IG1lcmdlT3B0aW9ucyB9IGZyb20gJ3NoYXJlZC9tZXJnZS1vcHRpb25zJ1xuaW1wb3J0IGNvbmZpZyBmcm9tICcuL2NvbmZpZydcbmltcG9ydCB0ZXN0VXRpbHMgZnJvbSAnQHZ1ZS90ZXN0LXV0aWxzJ1xuaW1wb3J0IHsgdmFsaWRhdGVPcHRpb25zIH0gZnJvbSAnc2hhcmVkL3ZhbGlkYXRlLW9wdGlvbnMnXG5cblZ1ZS5jb25maWcucHJvZHVjdGlvblRpcCA9IGZhbHNlXG5WdWUuY29uZmlnLmRldnRvb2xzID0gZmFsc2VcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcmVuZGVyVG9TdHJpbmcoXG4gIGNvbXBvbmVudDogQ29tcG9uZW50LFxuICBvcHRpb25zOiBPcHRpb25zID0ge31cbik6IHN0cmluZyB7XG4gIGNvbnN0IHJlbmRlcmVyID0gY3JlYXRlUmVuZGVyZXIoKVxuXG4gIGlmICghcmVuZGVyZXIpIHtcbiAgICB0aHJvd0Vycm9yKFxuICAgICAgYHJlbmRlclRvU3RyaW5nIG11c3QgYmUgcnVuIGluIG5vZGUuIEl0IGNhbm5vdCBiZSBgICsgYHJ1biBpbiBhIGJyb3dzZXJgXG4gICAgKVxuICB9XG5cbiAgaWYgKG9wdGlvbnMuYXR0YWNoVG9Eb2N1bWVudCkge1xuICAgIHRocm93RXJyb3IoYHlvdSBjYW5ub3QgdXNlIGF0dGFjaFRvRG9jdW1lbnQgd2l0aCBgICsgYHJlbmRlclRvU3RyaW5nYClcbiAgfVxuXG4gIGNvbnN0IG1lcmdlZE9wdGlvbnMgPSBtZXJnZU9wdGlvbnMob3B0aW9ucywgY29uZmlnKVxuICB2YWxpZGF0ZU9wdGlvbnMobWVyZ2VkT3B0aW9ucywgY29tcG9uZW50KVxuXG4gIGNvbnN0IHZtID0gY3JlYXRlSW5zdGFuY2UoXG4gICAgY29tcG9uZW50LFxuICAgIG1lcmdlZE9wdGlvbnMsXG4gICAgdGVzdFV0aWxzLmNyZWF0ZUxvY2FsVnVlKG9wdGlvbnMubG9jYWxWdWUpXG4gIClcbiAgbGV0IHJlbmRlcmVkU3RyaW5nID0gJydcblxuICAvLyAkRmxvd0lnbm9yZVxuICByZW5kZXJlci5yZW5kZXJUb1N0cmluZyh2bSwgKGVyciwgcmVzKSA9PiB7XG4gICAgaWYgKGVycikge1xuICAgICAgdGhyb3cgZXJyXG4gICAgfVxuICAgIHJlbmRlcmVkU3RyaW5nID0gcmVzXG4gIH0pXG4gIHJldHVybiByZW5kZXJlZFN0cmluZ1xufVxuIiwiLy8gQGZsb3dcblxuaW1wb3J0IHJlbmRlclRvU3RyaW5nIGZyb20gJy4vcmVuZGVyVG9TdHJpbmcnXG5pbXBvcnQgY2hlZXJpbyBmcm9tICdjaGVlcmlvJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiByZW5kZXIoXG4gIGNvbXBvbmVudDogQ29tcG9uZW50LFxuICBvcHRpb25zOiBPcHRpb25zID0ge31cbik6IHN0cmluZyB7XG4gIGNvbnN0IHJlbmRlcmVkU3RyaW5nID0gcmVuZGVyVG9TdHJpbmcoY29tcG9uZW50LCBvcHRpb25zKVxuICByZXR1cm4gY2hlZXJpby5sb2FkKCcnKShyZW5kZXJlZFN0cmluZylcbn1cbiIsImltcG9ydCByZW5kZXJUb1N0cmluZyBmcm9tICcuL3JlbmRlclRvU3RyaW5nJ1xuaW1wb3J0IHJlbmRlciBmcm9tICcuL3JlbmRlcidcbmltcG9ydCBjb25maWcgZnJvbSAnLi9jb25maWcnXG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgcmVuZGVyVG9TdHJpbmcsXG4gIGNvbmZpZyxcbiAgcmVuZGVyXG59XG4iXSwibmFtZXMiOlsiY29uc3QiLCJjb21waWxlVG9GdW5jdGlvbnMiLCJ0aGlzIiwiJCRWdWUiLCJsZXQiLCJyZXNvbHZlQ29tcG9uZW50IiwiY29t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LEdBQUcsT0FBTyxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDO0VBQ25ELE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsU0FBUyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFO0lBQzlDLEtBQUssQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUNyQyxJQUFJLEdBQUcsQ0FBQzs7SUFFUixJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDUixHQUFHLEdBQUcsRUFBRSxHQUFDO1NBQ04sSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ2IsR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsUUFBUSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLE1BQU0sR0FBQztTQUMzQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUM7O1FBRWIsR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxNQUFNLEdBQUcsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUM7U0FDM0QsSUFBSSxFQUFFLEVBQUU7TUFDWCxLQUFLLENBQUMsaUJBQWlCLEVBQUUsRUFBRSxDQUFDLENBQUM7TUFDN0IsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUc7VUFDdEIsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUM7TUFDaEIsR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEVBQUU7WUFDakMsSUFBSSxHQUFHLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxD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SSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBQzs7WUFFMUMsR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEVBQUU7Z0JBQ2pDLElBQUksR0FBRyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksR0FBQztPQUMxQztVQUNDLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxFQUFFO2NBQ2pDLElBQUksSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxNQUFNLEdBQUM7S0FDbEMsTUFBTTtNQUNMLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztNQUNmLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRTtRQUNiLElBQUksQ0FBQyxLQUFLLEdBQUc7WUFDWCxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO2dCQUM1QixJQUFJLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFDOztZQUUxQyxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO2dCQUM1QixJQUFJLEdBQUcsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUM7T0FDMUM7VUFDQyxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO2NBQzVCLElBQUksSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxNQUFNLEdBQUM7S0FDbEM7O0lBRUQsS0FBSyxDQUFDLGNBQWMsRUFBRSxH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
