'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Vue = _interopDefault(require('vue'));
var vueTemplateCompiler = require('vue-template-compiler');

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

var NAME_SELECTOR = 'NAME_SELECTOR';
var COMPONENT_SELECTOR = 'COMPONENT_SELECTOR';
var REF_SELECTOR = 'REF_SELECTOR';
var DOM_SELECTOR = 'DOM_SELECTOR';
var INVALID_SELECTOR = 'INVALID_SELECTOR';
var COMPAT_SYNC_MODE = 'COMPAT_SYNC_MODE';

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

function getRealChild(vnode) {
  var compOptions = vnode && vnode.componentOptions;
  if (compOptions && compOptions.Ctor.options.abstract) {
    return getRealChild(getFirstComponentChild(compOptions.children))
  } else {
    return vnode
  }
}

function isSameChild(child, oldChild) {
  return oldChild.key === child.key && oldChild.tag === child.tag
}

function getFirstComponentChild(children) {
  if (Array.isArray(children)) {
    for (var i = 0; i < children.length; i++) {
      var c = children[i];
      if (c && (c.componentOptions || isAsyncPlaceholder(c))) {
        return c
      }
    }
  }
}

function isPrimitive(value) {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    // $FlowIgnore
    typeof value === 'symbol' ||
    typeof value === 'boolean'
  )
}

function isAsyncPlaceholder(node) {
  return node.isComment && node.asyncFactory
}

function hasParentTransition(vnode) {
  while ((vnode = vnode.parent)) {
    if (vnode.data.transition) {
      return true
    }
  }
}

var TransitionStub = {
  render: function render(h) {
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
        "<transition> can only be used on a single element. " +
          "Use " +
          '<transition-group> for lists.'
      );
    }

    var mode = this.mode;

    // warn invalid mode
    if (mode && mode !== 'in-out' && mode !== 'out-in') {
      warn('invalid <transition> mode: ' + mode);
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
    child.key =
      child.key == null
        ? child.isComment
          ? id + 'comment'
          : id + child.tag
        : isPrimitive(child.key)
        ? String(child.key).indexOf(id) === 0
          ? child.key
          : id + child.key
        : child.key;

    var data = child.data || (child.data = {});
    var oldRawChild = this._vnode;
    var oldChild = getRealChild(oldRawChild);
    if (
      child.data.directives &&
      child.data.directives.some(function (d) { return d.name === 'show'; })
    ) {
      child.data.show = true;
    }

    // mark v-show
    // so that the transition module can hand over the control
    // to the directive
    if (
      child.data.directives &&
      child.data.directives.some(function (d) { return d.name === 'show'; })
    ) {
      child.data.show = true;
    }
    if (
      oldChild &&
      oldChild.data &&
      !isSameChild(child, oldChild) &&
      !isAsyncPlaceholder(oldChild) &&
      // #6687 component root is a comment node
      !(
        oldChild.componentInstance &&
        oldChild.componentInstance._vnode.isComment
      )
    ) {
      oldChild.data = Object.assign({}, data);
    }
    return rawChild
  }
}

// 

var TransitionGroupStub = {
  render: function render(h) {
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
  logModifiedComponents: true,
  silent: true
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

WrapperArray.prototype.update = function update () {
  this.throwErrorIfWrappersIsEmpty('update');
  warn(
    "update has been removed. All changes are now " +
      "synchrnous without calling update"
  );
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

ErrorWrapper.prototype.update = function update () {
  throwError(
    "update has been removed from vue-test-utils." +
      "All updates are now synchronous by default"
  );
};

ErrorWrapper.prototype.destroy = function destroy () {
  throwError(
    ("find did not return " + (this.selector) + ", cannot call destroy() on empty Wrapper")
  );
};

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

// 

var i = 0;

function orderDeps(watcher) {
  watcher.deps.forEach(function (dep) {
    if (dep._sortedId === i) {
      return
    }
    dep._sortedId = i;
    dep.subs.forEach(orderDeps);
    dep.subs = dep.subs.sort(function (a, b) { return a.id - b.id; });
  });
}

function orderVmWatchers(vm) {
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

function orderWatchers(vm) {
  orderVmWatchers(vm);
  i++;
}

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
  if (this.options.sync === COMPAT_SYNC_MODE) {
    // $FlowIgnore : Problem with possibly null this.vm
    orderWatchers(this.vm || this.vnode.context.$root);
  }
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

  if (this.vnode && this.options.sync === COMPAT_SYNC_MODE) {
    orderWatchers(this.vm || this.vnode.context.$root);
  }
};

Wrapper.prototype.update = function update () {
  warn(
    "update has been removed from vue-test-utils. All updates are now " +
      "synchronous by default"
  );
};

// 

function setDepsSync(dep) {
  dep.subs.forEach(setWatcherSync);
}

function setWatcherSync(watcher) {
  if (watcher.sync === true) {
    return
  }
  watcher.sync = true;
  watcher.deps.forEach(setDepsSync);
}

function setWatchersToSync(vm) {
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
    vm._update = function(vnode, hydrating) {
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
    if (options.sync === COMPAT_SYNC_MODE) {
      setWatchersToSync(vm);
      orderWatchers(vm);
    }
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

function addStubs(_Vue, stubComponents) {
  var obj;

  function addStubComponentsMixin() {
    Object.assign(this.$options.components, stubComponents);
  }

  _Vue.mixin(( obj = {}, obj[BEFORE_RENDER_LIFECYCLE_HOOK] = addStubComponentsMixin, obj));
}

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

var semver$1 = createCommonjsModule(function (module, exports) {
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
function parse(version, loose) {
  if (version instanceof SemVer)
    { return version; }

  if (typeof version !== 'string')
    { return null; }

  if (version.length > MAX_LENGTH)
    { return null; }

  var r = loose ? re[LOOSE] : re[FULL];
  if (!r.test(version))
    { return null; }

  try {
    return new SemVer(version, loose);
  } catch (er) {
    return null;
  }
}

exports.valid = valid;
function valid(version, loose) {
  var v = parse(version, loose);
  return v ? v.version : null;
}


exports.clean = clean;
function clean(version, loose) {
  var s = parse(version.trim().replace(/^[=v]+/, ''), loose);
  return s ? s.version : null;
}

exports.SemVer = SemVer;

function SemVer(version, loose) {
  if (version instanceof SemVer) {
    if (version.loose === loose)
      { return version; }
    else
      { version = version.version; }
  } else if (typeof version !== 'string') {
    throw new TypeError('Invalid Version: ' + version);
  }

  if (version.length > MAX_LENGTH)
    { throw new TypeError('version is longer than ' + MAX_LENGTH + ' characters') }

  if (!(this instanceof SemVer))
    { return new SemVer(version, loose); }

  debug('SemVer', version, loose);
  this.loose = loose;
  var m = version.trim().match(loose ? re[LOOSE] : re[FULL]);

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
  debug('SemVer.compare', this.version, this.loose, other);
  if (!(other instanceof SemVer))
    { other = new SemVer(other, this.loose); }

  return this.compareMain(other) || this.comparePre(other);
};

SemVer.prototype.compareMain = function(other) {
  if (!(other instanceof SemVer))
    { other = new SemVer(other, this.loose); }

  return compareIdentifiers(this.major, other.major) ||
         compareIdentifiers(this.minor, other.minor) ||
         compareIdentifiers(this.patch, other.patch);
};

SemVer.prototype.comparePre = function(other) {
  var this$1 = this;

  if (!(other instanceof SemVer))
    { other = new SemVer(other, this.loose); }

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
function Comparator(comp, loose) {
  if (comp instanceof Comparator) {
    if (comp.loose === loose)
      { return comp; }
    else
      { comp = comp.value; }
  }

  if (!(this instanceof Comparator))
    { return new Comparator(comp, loose); }

  debug('comparator', comp, loose);
  this.loose = loose;
  this.parse(comp);

  if (this.semver === ANY)
    { this.value = ''; }
  else
    { this.value = this.operator + this.semver.version; }

  debug('comp', this);
}

var ANY = {};
Comparator.prototype.parse = function(comp) {
  var r = this.loose ? re[COMPARATORLOOSE] : re[COMPARATOR];
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
    { this.semver = new SemVer(m[2], this.loose); }
};

Comparator.prototype.toString = function() {
  return this.value;
};

Comparator.prototype.test = function(version) {
  debug('Comparator.test', version, this.loose);

  if (this.semver === ANY)
    { return true; }

  if (typeof version === 'string')
    { version = new SemVer(version, this.loose); }

  return cmp(version, this.operator, this.semver, this.loose);
};

Comparator.prototype.intersects = function(comp, loose) {
  if (!(comp instanceof Comparator)) {
    throw new TypeError('a Comparator is required');
  }

  var rangeTmp;

  if (this.operator === '') {
    rangeTmp = new Range(comp.value, loose);
    return satisfies(this.value, rangeTmp, loose);
  } else if (comp.operator === '') {
    rangeTmp = new Range(this.value, loose);
    return satisfies(comp.semver, rangeTmp, loose);
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
    cmp(this.semver, '<', comp.semver, loose) &&
    ((this.operator === '>=' || this.operator === '>') &&
    (comp.operator === '<=' || comp.operator === '<'));
  var oppositeDirectionsGreaterThan =
    cmp(this.semver, '>', comp.semver, loose) &&
    ((this.operator === '<=' || this.operator === '<') &&
    (comp.operator === '>=' || comp.operator === '>'));

  return sameDirectionIncreasing || sameDirectionDecreasing ||
    (sameSemVer && differentDirectionsInclusive) ||
    oppositeDirectionsLessThan || oppositeDirectionsGreaterThan;
};


exports.Range = Range;
function Range(range, loose) {
  if (range instanceof Range) {
    if (range.loose === loose) {
      return range;
    } else {
      return new Range(range.raw, loose);
    }
  }

  if (range instanceof Comparator) {
    return new Range(range.value, loose);
  }

  if (!(this instanceof Range))
    { return new Range(range, loose); }

  this.loose = loose;

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
  var loose = this.loose;
  range = range.trim();
  debug('range', range, loose);
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
    return parseComparator(comp, loose);
  }).join(' ').split(/\s+/);
  if (this.loose) {
    // in loose mode, throw out any that are not valid comparators
    set = set.filter(function(comp) {
      return !!comp.match(compRe);
    });
  }
  set = set.map(function(comp) {
    return new Comparator(comp, loose);
  });

  return set;
};

Range.prototype.intersects = function(range, loose) {
  if (!(range instanceof Range)) {
    throw new TypeError('a Range is required');
  }

  return this.set.some(function(thisComparators) {
    return thisComparators.every(function(thisComparator) {
      return range.set.some(function(rangeComparators) {
        return rangeComparators.every(function(rangeComparator) {
          return thisComparator.intersects(rangeComparator, loose);
        });
      });
    });
  });
};

// Mostly just for testing and legacy API reasons
exports.toComparators = toComparators;
function toComparators(range, loose) {
  return new Range(range, loose).set.map(function(comp) {
    return comp.map(function(c) {
      return c.value;
    }).join(' ').trim().split(' ');
  });
}

// comprised of xranges, tildes, stars, and gtlt's at this point.
// already replaced the hyphen ranges
// turn into a set of JUST comparators.
function parseComparator(comp, loose) {
  debug('comp', comp);
  comp = replaceCarets(comp, loose);
  debug('caret', comp);
  comp = replaceTildes(comp, loose);
  debug('tildes', comp);
  comp = replaceXRanges(comp, loose);
  debug('xrange', comp);
  comp = replaceStars(comp, loose);
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
function replaceTildes(comp, loose) {
  return comp.trim().split(/\s+/).map(function(comp) {
    return replaceTilde(comp, loose);
  }).join(' ');
}

function replaceTilde(comp, loose) {
  var r = loose ? re[TILDELOOSE] : re[TILDE];
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
function replaceCarets(comp, loose) {
  return comp.trim().split(/\s+/).map(function(comp) {
    return replaceCaret(comp, loose);
  }).join(' ');
}

function replaceCaret(comp, loose) {
  debug('caret', comp, loose);
  var r = loose ? re[CARETLOOSE] : re[CARET];
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

function replaceXRanges(comp, loose) {
  debug('replaceXRanges', comp, loose);
  return comp.split(/\s+/).map(function(comp) {
    return replaceXRange(comp, loose);
  }).join(' ');
}

function replaceXRange(comp, loose) {
  comp = comp.trim();
  var r = loose ? re[XRANGELOOSE] : re[XRANGE];
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
function replaceStars(comp, loose) {
  debug('replaceStars', comp, loose);
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
    { version = new SemVer(version, this.loose); }

  for (var i = 0; i < this.set.length; i++) {
    if (testSet(this$1.set[i], version))
      { return true; }
  }
  return false;
};

function testSet(set, version) {
  for (var i = 0; i < set.length; i++) {
    if (!set[i].test(version))
      { return false; }
  }

  if (version.prerelease.length) {
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
function satisfies(version, range, loose) {
  try {
    range = new Range(range, loose);
  } catch (er) {
    return false;
  }
  return range.test(version);
}

exports.maxSatisfying = maxSatisfying;
function maxSatisfying(versions, range, loose) {
  var max = null;
  var maxSV = null;
  try {
    var rangeObj = new Range(range, loose);
  } catch (er) {
    return null;
  }
  versions.forEach(function (v) {
    if (rangeObj.test(v)) { // satisfies(v, range, loose)
      if (!max || maxSV.compare(v) === -1) { // compare(max, v, true)
        max = v;
        maxSV = new SemVer(max, loose);
      }
    }
  });
  return max;
}

exports.minSatisfying = minSatisfying;
function minSatisfying(versions, range, loose) {
  var min = null;
  var minSV = null;
  try {
    var rangeObj = new Range(range, loose);
  } catch (er) {
    return null;
  }
  versions.forEach(function (v) {
    if (rangeObj.test(v)) { // satisfies(v, range, loose)
      if (!min || minSV.compare(v) === 1) { // compare(min, v, true)
        min = v;
        minSV = new SemVer(min, loose);
      }
    }
  });
  return min;
}

exports.validRange = validRange;
function validRange(range, loose) {
  try {
    // Return '*' instead of '' so that truthiness works.
    // This will throw if it's invalid anyway
    return new Range(range, loose).range || '*';
  } catch (er) {
    return null;
  }
}

// Determine if version is less than all the versions possible in the range
exports.ltr = ltr;
function ltr(version, range, loose) {
  return outside(version, range, '<', loose);
}

// Determine if version is greater than all the versions possible in the range.
exports.gtr = gtr;
function gtr(version, range, loose) {
  return outside(version, range, '>', loose);
}

exports.outside = outside;
function outside(version, range, hilo, loose) {
  version = new SemVer(version, loose);
  range = new Range(range, loose);

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
  if (satisfies(version, range, loose)) {
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
      if (gtfn(comparator.semver, high.semver, loose)) {
        high = comparator;
      } else if (ltfn(comparator.semver, low.semver, loose)) {
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
function prerelease(version, loose) {
  var parsed = parse(version, loose);
  return (parsed && parsed.prerelease.length) ? parsed.prerelease : null;
}

exports.intersects = intersects;
function intersects(r1, r2, loose) {
  r1 = new Range(r1, loose);
  r2 = new Range(r2, loose);
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
var semver_1$1 = semver$1.SEMVER_SPEC_VERSION;
var semver_2$1 = semver$1.re;
var semver_3$1 = semver$1.src;
var semver_4$1 = semver$1.parse;
var semver_5$1 = semver$1.valid;
var semver_6$1 = semver$1.clean;
var semver_7$1 = semver$1.SemVer;
var semver_8$1 = semver$1.inc;
var semver_9$1 = semver$1.diff;
var semver_10$1 = semver$1.compareIdentifiers;
var semver_11$1 = semver$1.rcompareIdentifiers;
var semver_12$1 = semver$1.major;
var semver_13$1 = semver$1.minor;
var semver_14$1 = semver$1.patch;
var semver_15$1 = semver$1.compare;
var semver_16$1 = semver$1.compareLoose;
var semver_17$1 = semver$1.rcompare;
var semver_18$1 = semver$1.sort;
var semver_19$1 = semver$1.rsort;
var semver_20$1 = semver$1.gt;
var semver_21$1 = semver$1.lt;
var semver_22$1 = semver$1.eq;
var semver_23$1 = semver$1.neq;
var semver_24$1 = semver$1.gte;
var semver_25$1 = semver$1.lte;
var semver_26$1 = semver$1.cmp;
var semver_27$1 = semver$1.Comparator;
var semver_28$1 = semver$1.Range;
var semver_29$1 = semver$1.toComparators;
var semver_30$1 = semver$1.satisfies;
var semver_31$1 = semver$1.maxSatisfying;
var semver_32$1 = semver$1.minSatisfying;
var semver_33$1 = semver$1.validRange;
var semver_34$1 = semver$1.ltr;
var semver_35$1 = semver$1.gtr;
var semver_36$1 = semver$1.outside;
var semver_37$1 = semver$1.prerelease;
var semver_38$1 = semver$1.intersects;
var semver_39$1 = semver$1.coerce;

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

function getSyncOption(syncOption) {
  if (syncOption === false) {
    Vue.config.async = true;
    return false
  }
  if (!semver$1.gt(Vue.version, '2.5.17')) {
    warn(
      "Vue Test Utils runs in sync mode by default. Due to bugs, sync mode " +
        "requires Vue > 2.5.18. In Vue Test Utils 1.0 sync mode will only be " +
        "supported with Vue 2.5.18 running in development mode. If you are " +
        "unable to upgrade, you should rewrite your tests to run synchronously" +
        "you can do this by setting the sync mounting option to false."
    );
    return COMPAT_SYNC_MODE
  }

  if (typeof Vue.config.async === 'undefined') {
    warn(
      "Sync mode only works when Vue runs in dev mode. " +
        "Please set Vue to run in dev mode, or set sync to false"
    );
  }

  Vue.config.async = false;
  return true
}

function mount(
  component,
  options
) {
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
  var sync = getSyncOption(mergedOptions.sync);

  var wrapperOptions = {
    attachedToDocument: !!mergedOptions.attachToDocument,
    sync: sync
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
  TransitionStub: TransitionStub,
  TransitionGroupStub: TransitionGroupStub,
  RouterLinkStub: RouterLinkStub,
  Wrapper: Wrapper,
  WrapperArray: WrapperArray
}

module.exports = index;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidnVlLXRlc3QtdXRpbHMuanMiLCJzb3VyY2VzIjpbIi4uLy4uL3NoYXJlZC9ub2RlX21vZHVsZXMvc2VtdmVyL3NlbXZlci5qcyIsIi4uLy4uL3NoYXJlZC91dGlsLmpzIiwiLi4vLi4vc2hhcmVkL3ZhbGlkYXRvcnMuanMiLCIuLi8uLi9zaGFyZWQvY29uc3RzLmpzIiwiLi4vc3JjL2dldC1zZWxlY3Rvci5qcyIsIi4uL3NyYy9jb21wb25lbnRzL1RyYW5zaXRpb25TdHViLmpzIiwiLi4vc3JjL2NvbXBvbmVudHMvVHJhbnNpdGlvbkdyb3VwU3R1Yi5qcyIsIi4uL3NyYy9jb25maWcuanMiLCIuLi9zcmMvd3JhcHBlci1hcnJheS5qcyIsIi4uL3NyYy9lcnJvci13cmFwcGVyLmpzIiwiLi4vc3JjL2ZpbmQtZG9tLW5vZGVzLmpzIiwiLi4vc3JjL21hdGNoZXMuanMiLCIuLi9zcmMvZmluZC5qcyIsIi4uL3NyYy9jcmVhdGUtd3JhcHBlci5qcyIsIi4uL3NyYy9vcmRlci13YXRjaGVycy5qcyIsIi4uL3NyYy9yZWN1cnNpdmVseS1zZXQtZGF0YS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9kb20tZXZlbnQtdHlwZXMvaW5kZXguanMiLCIuLi9zcmMvY3JlYXRlLWRvbS1ldmVudC5qcyIsIi4uL3NyYy9lcnJvci5qcyIsIi4uL3NyYy93cmFwcGVyLmpzIiwiLi4vc3JjL3NldC13YXRjaGVycy10by1zeW5jLmpzIiwiLi4vc3JjL3Z1ZS13cmFwcGVyLmpzIiwiLi4vLi4vY3JlYXRlLWluc3RhbmNlL2NyZWF0ZS1zbG90LXZub2Rlcy5qcyIsIi4uLy4uL2NyZWF0ZS1pbnN0YW5jZS9hZGQtbW9ja3MuanMiLCIuLi8uLi9jcmVhdGUtaW5zdGFuY2UvbG9nLWV2ZW50cy5qcyIsIi4uLy4uL2NyZWF0ZS1pbnN0YW5jZS9hZGQtc3R1YnMuanMiLCIuLi8uLi9zaGFyZWQvY29tcGlsZS10ZW1wbGF0ZS5qcyIsIi4uLy4uL2NyZWF0ZS1pbnN0YW5jZS9leHRyYWN0LWluc3RhbmNlLW9wdGlvbnMuanMiLCIuLi8uLi9jcmVhdGUtaW5zdGFuY2UvY3JlYXRlLXNjb3BlZC1zbG90cy5qcyIsIi4uLy4uL2NyZWF0ZS1pbnN0YW5jZS9jcmVhdGUtY29tcG9uZW50LXN0dWJzLmpzIiwiLi4vLi4vY3JlYXRlLWluc3RhbmNlL3BhdGNoLWNyZWF0ZS1lbGVtZW50LmpzIiwiLi4vLi4vY3JlYXRlLWluc3RhbmNlL2NyZWF0ZS1pbnN0YW5jZS5qcyIsIi4uL3NyYy9jcmVhdGUtZWxlbWVudC5qcyIsIi4uLy4uL3NoYXJlZC9ub3JtYWxpemUuanMiLCIuLi8uLi9zaGFyZWQvbWVyZ2Utb3B0aW9ucy5qcyIsIi4uL3NyYy93YXJuLWlmLW5vLXdpbmRvdy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2xpc3RDYWNoZUNsZWFyLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9lcS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Fzc29jSW5kZXhPZi5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2xpc3RDYWNoZURlbGV0ZS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2xpc3RDYWNoZUdldC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2xpc3RDYWNoZUhhcy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2xpc3RDYWNoZVNldC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX0xpc3RDYWNoZS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX3N0YWNrQ2xlYXIuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19zdGFja0RlbGV0ZS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX3N0YWNrR2V0LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fc3RhY2tIYXMuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19mcmVlR2xvYmFsLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fcm9vdC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX1N5bWJvbC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2dldFJhd1RhZy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX29iamVjdFRvU3RyaW5nLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZUdldFRhZy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvaXNPYmplY3QuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL2lzRnVuY3Rpb24uanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19jb3JlSnNEYXRhLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9faXNNYXNrZWQuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL190b1NvdXJjZS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VJc05hdGl2ZS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2dldFZhbHVlLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fZ2V0TmF0aXZlLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fTWFwLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fbmF0aXZlQ3JlYXRlLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9faGFzaENsZWFyLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9faGFzaERlbGV0ZS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2hhc2hHZXQuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19oYXNoSGFzLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9faGFzaFNldC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX0hhc2guanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19tYXBDYWNoZUNsZWFyLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9faXNLZXlhYmxlLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fZ2V0TWFwRGF0YS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX21hcENhY2hlRGVsZXRlLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fbWFwQ2FjaGVHZXQuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19tYXBDYWNoZUhhcy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX21hcENhY2hlU2V0LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fTWFwQ2FjaGUuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19zdGFja1NldC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX1N0YWNrLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYXJyYXlFYWNoLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fZGVmaW5lUHJvcGVydHkuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19iYXNlQXNzaWduVmFsdWUuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19hc3NpZ25WYWx1ZS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2NvcHlPYmplY3QuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19iYXNlVGltZXMuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL2lzT2JqZWN0TGlrZS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VJc0FyZ3VtZW50cy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvaXNBcmd1bWVudHMuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL2lzQXJyYXkuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL3N0dWJGYWxzZS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvaXNCdWZmZXIuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19pc0luZGV4LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9pc0xlbmd0aC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VJc1R5cGVkQXJyYXkuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19iYXNlVW5hcnkuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19ub2RlVXRpbC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvaXNUeXBlZEFycmF5LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYXJyYXlMaWtlS2V5cy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2lzUHJvdG90eXBlLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fb3ZlckFyZy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX25hdGl2ZUtleXMuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19iYXNlS2V5cy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvaXNBcnJheUxpa2UuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL2tleXMuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19iYXNlQXNzaWduLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fbmF0aXZlS2V5c0luLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZUtleXNJbi5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gva2V5c0luLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZUFzc2lnbkluLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fY2xvbmVCdWZmZXIuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19jb3B5QXJyYXkuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19hcnJheUZpbHRlci5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvc3R1YkFycmF5LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fZ2V0U3ltYm9scy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2NvcHlTeW1ib2xzLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYXJyYXlQdXNoLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fZ2V0UHJvdG90eXBlLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fZ2V0U3ltYm9sc0luLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fY29weVN5bWJvbHNJbi5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VHZXRBbGxLZXlzLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fZ2V0QWxsS2V5cy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2dldEFsbEtleXNJbi5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX0RhdGFWaWV3LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fUHJvbWlzZS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX1NldC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX1dlYWtNYXAuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19nZXRUYWcuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19pbml0Q2xvbmVBcnJheS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX1VpbnQ4QXJyYXkuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19jbG9uZUFycmF5QnVmZmVyLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fY2xvbmVEYXRhVmlldy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2FkZE1hcEVudHJ5LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYXJyYXlSZWR1Y2UuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19tYXBUb0FycmF5LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fY2xvbmVNYXAuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19jbG9uZVJlZ0V4cC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2FkZFNldEVudHJ5LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fc2V0VG9BcnJheS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Nsb25lU2V0LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fY2xvbmVTeW1ib2wuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19jbG9uZVR5cGVkQXJyYXkuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19pbml0Q2xvbmVCeVRhZy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VDcmVhdGUuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19pbml0Q2xvbmVPYmplY3QuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19iYXNlQ2xvbmUuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL2Nsb25lRGVlcC5qcyIsIi4uL3NyYy9jcmVhdGUtbG9jYWwtdnVlLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL3NlbXZlci9zZW12ZXIuanMiLCIuLi8uLi9zaGFyZWQvdmFsaWRhdGUtc2xvdHMuanMiLCIuLi8uLi9zaGFyZWQvdmFsaWRhdGUtb3B0aW9ucy5qcyIsIi4uL3NyYy9tb3VudC5qcyIsIi4uL3NyYy9zaGFsbG93LW1vdW50LmpzIiwiLi4vc3JjL2NvbXBvbmVudHMvUm91dGVyTGlua1N0dWIuanMiLCIuLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gU2VtVmVyO1xuXG4vLyBUaGUgZGVidWcgZnVuY3Rpb24gaXMgZXhjbHVkZWQgZW50aXJlbHkgZnJvbSB0aGUgbWluaWZpZWQgdmVyc2lvbi5cbi8qIG5vbWluICovIHZhciBkZWJ1Zztcbi8qIG5vbWluICovIGlmICh0eXBlb2YgcHJvY2VzcyA9PT0gJ29iamVjdCcgJiZcbiAgICAvKiBub21pbiAqLyBwcm9jZXNzLmVudiAmJlxuICAgIC8qIG5vbWluICovIHByb2Nlc3MuZW52Lk5PREVfREVCVUcgJiZcbiAgICAvKiBub21pbiAqLyAvXFxic2VtdmVyXFxiL2kudGVzdChwcm9jZXNzLmVudi5OT0RFX0RFQlVHKSlcbiAgLyogbm9taW4gKi8gZGVidWcgPSBmdW5jdGlvbigpIHtcbiAgICAvKiBub21pbiAqLyB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMCk7XG4gICAgLyogbm9taW4gKi8gYXJncy51bnNoaWZ0KCdTRU1WRVInKTtcbiAgICAvKiBub21pbiAqLyBjb25zb2xlLmxvZy5hcHBseShjb25zb2xlLCBhcmdzKTtcbiAgICAvKiBub21pbiAqLyB9O1xuLyogbm9taW4gKi8gZWxzZVxuICAvKiBub21pbiAqLyBkZWJ1ZyA9IGZ1bmN0aW9uKCkge307XG5cbi8vIE5vdGU6IHRoaXMgaXMgdGhlIHNlbXZlci5vcmcgdmVyc2lvbiBvZiB0aGUgc3BlYyB0aGF0IGl0IGltcGxlbWVudHNcbi8vIE5vdCBuZWNlc3NhcmlseSB0aGUgcGFja2FnZSB2ZXJzaW9uIG9mIHRoaXMgY29kZS5cbmV4cG9ydHMuU0VNVkVSX1NQRUNfVkVSU0lPTiA9ICcyLjAuMCc7XG5cbnZhciBNQVhfTEVOR1RIID0gMjU2O1xudmFyIE1BWF9TQUZFX0lOVEVHRVIgPSBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUiB8fCA5MDA3MTk5MjU0NzQwOTkxO1xuXG4vLyBNYXggc2FmZSBzZWdtZW50IGxlbmd0aCBmb3IgY29lcmNpb24uXG52YXIgTUFYX1NBRkVfQ09NUE9ORU5UX0xFTkdUSCA9IDE2O1xuXG4vLyBUaGUgYWN0dWFsIHJlZ2V4cHMgZ28gb24gZXhwb3J0cy5yZVxudmFyIHJlID0gZXhwb3J0cy5yZSA9IFtdO1xudmFyIHNyYyA9IGV4cG9ydHMuc3JjID0gW107XG52YXIgUiA9IDA7XG5cbi8vIFRoZSBmb2xsb3dpbmcgUmVndWxhciBFeHByZXNzaW9ucyBjYW4gYmUgdXNlZCBmb3IgdG9rZW5pemluZyxcbi8vIHZhbGlkYXRpbmcsIGFuZCBwYXJzaW5nIFNlbVZlciB2ZXJzaW9uIHN0cmluZ3MuXG5cbi8vICMjIE51bWVyaWMgSWRlbnRpZmllclxuLy8gQSBzaW5nbGUgYDBgLCBvciBhIG5vbi16ZXJvIGRpZ2l0IGZvbGxvd2VkIGJ5IHplcm8gb3IgbW9yZSBkaWdpdHMuXG5cbnZhciBOVU1FUklDSURFTlRJRklFUiA9IFIrKztcbnNyY1tOVU1FUklDSURFTlRJRklFUl0gPSAnMHxbMS05XVxcXFxkKic7XG52YXIgTlVNRVJJQ0lERU5USUZJRVJMT09TRSA9IFIrKztcbnNyY1tOVU1FUklDSURFTlRJRklFUkxPT1NFXSA9ICdbMC05XSsnO1xuXG5cbi8vICMjIE5vbi1udW1lcmljIElkZW50aWZpZXJcbi8vIFplcm8gb3IgbW9yZSBkaWdpdHMsIGZvbGxvd2VkIGJ5IGEgbGV0dGVyIG9yIGh5cGhlbiwgYW5kIHRoZW4gemVybyBvclxuLy8gbW9yZSBsZXR0ZXJzLCBkaWdpdHMsIG9yIGh5cGhlbnMuXG5cbnZhciBOT05OVU1FUklDSURFTlRJRklFUiA9IFIrKztcbnNyY1tOT05OVU1FUklDSURFTlRJRklFUl0gPSAnXFxcXGQqW2EtekEtWi1dW2EtekEtWjAtOS1dKic7XG5cblxuLy8gIyMgTWFpbiBWZXJzaW9uXG4vLyBUaHJlZSBkb3Qtc2VwYXJhdGVkIG51bWVyaWMgaWRlbnRpZmllcnMuXG5cbnZhciBNQUlOVkVSU0lPTiA9IFIrKztcbnNyY1tNQUlOVkVSU0lPTl0gPSAnKCcgKyBzcmNbTlVNRVJJQ0lERU5USUZJRVJdICsgJylcXFxcLicgK1xuICAgICAgICAgICAgICAgICAgICcoJyArIHNyY1tOVU1FUklDSURFTlRJRklFUl0gKyAnKVxcXFwuJyArXG4gICAgICAgICAgICAgICAgICAgJygnICsgc3JjW05VTUVSSUNJREVOVElGSUVSXSArICcpJztcblxudmFyIE1BSU5WRVJTSU9OTE9PU0UgPSBSKys7XG5zcmNbTUFJTlZFUlNJT05MT09TRV0gPSAnKCcgKyBzcmNbTlVNRVJJQ0lERU5USUZJRVJMT09TRV0gKyAnKVxcXFwuJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnKCcgKyBzcmNbTlVNRVJJQ0lERU5USUZJRVJMT09TRV0gKyAnKVxcXFwuJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnKCcgKyBzcmNbTlVNRVJJQ0lERU5USUZJRVJMT09TRV0gKyAnKSc7XG5cbi8vICMjIFByZS1yZWxlYXNlIFZlcnNpb24gSWRlbnRpZmllclxuLy8gQSBudW1lcmljIGlkZW50aWZpZXIsIG9yIGEgbm9uLW51bWVyaWMgaWRlbnRpZmllci5cblxudmFyIFBSRVJFTEVBU0VJREVOVElGSUVSID0gUisrO1xuc3JjW1BSRVJFTEVBU0VJREVOVElGSUVSXSA9ICcoPzonICsgc3JjW05VTUVSSUNJREVOVElGSUVSXSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3wnICsgc3JjW05PTk5VTUVSSUNJREVOVElGSUVSXSArICcpJztcblxudmFyIFBSRVJFTEVBU0VJREVOVElGSUVSTE9PU0UgPSBSKys7XG5zcmNbUFJFUkVMRUFTRUlERU5USUZJRVJMT09TRV0gPSAnKD86JyArIHNyY1tOVU1FUklDSURFTlRJRklFUkxPT1NFXSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnfCcgKyBzcmNbTk9OTlVNRVJJQ0lERU5USUZJRVJdICsgJyknO1xuXG5cbi8vICMjIFByZS1yZWxlYXNlIFZlcnNpb25cbi8vIEh5cGhlbiwgZm9sbG93ZWQgYnkgb25lIG9yIG1vcmUgZG90LXNlcGFyYXRlZCBwcmUtcmVsZWFzZSB2ZXJzaW9uXG4vLyBpZGVudGlmaWVycy5cblxudmFyIFBSRVJFTEVBU0UgPSBSKys7XG5zcmNbUFJFUkVMRUFTRV0gPSAnKD86LSgnICsgc3JjW1BSRVJFTEVBU0VJREVOVElGSUVSXSArXG4gICAgICAgICAgICAgICAgICAnKD86XFxcXC4nICsgc3JjW1BSRVJFTEVBU0VJREVOVElGSUVSXSArICcpKikpJztcblxudmFyIFBSRVJFTEVBU0VMT09TRSA9IFIrKztcbnNyY1tQUkVSRUxFQVNFTE9PU0VdID0gJyg/Oi0/KCcgKyBzcmNbUFJFUkVMRUFTRUlERU5USUZJRVJMT09TRV0gK1xuICAgICAgICAgICAgICAgICAgICAgICAnKD86XFxcXC4nICsgc3JjW1BSRVJFTEVBU0VJREVOVElGSUVSTE9PU0VdICsgJykqKSknO1xuXG4vLyAjIyBCdWlsZCBNZXRhZGF0YSBJZGVudGlmaWVyXG4vLyBBbnkgY29tYmluYXRpb24gb2YgZGlnaXRzLCBsZXR0ZXJzLCBvciBoeXBoZW5zLlxuXG52YXIgQlVJTERJREVOVElGSUVSID0gUisrO1xuc3JjW0JVSUxESURFTlRJRklFUl0gPSAnWzAtOUEtWmEtei1dKyc7XG5cbi8vICMjIEJ1aWxkIE1ldGFkYXRhXG4vLyBQbHVzIHNpZ24sIGZvbGxvd2VkIGJ5IG9uZSBvciBtb3JlIHBlcmlvZC1zZXBhcmF0ZWQgYnVpbGQgbWV0YWRhdGFcbi8vIGlkZW50aWZpZXJzLlxuXG52YXIgQlVJTEQgPSBSKys7XG5zcmNbQlVJTERdID0gJyg/OlxcXFwrKCcgKyBzcmNbQlVJTERJREVOVElGSUVSXSArXG4gICAgICAgICAgICAgJyg/OlxcXFwuJyArIHNyY1tCVUlMRElERU5USUZJRVJdICsgJykqKSknO1xuXG5cbi8vICMjIEZ1bGwgVmVyc2lvbiBTdHJpbmdcbi8vIEEgbWFpbiB2ZXJzaW9uLCBmb2xsb3dlZCBvcHRpb25hbGx5IGJ5IGEgcHJlLXJlbGVhc2UgdmVyc2lvbiBhbmRcbi8vIGJ1aWxkIG1ldGFkYXRhLlxuXG4vLyBOb3RlIHRoYXQgdGhlIG9ubHkgbWFqb3IsIG1pbm9yLCBwYXRjaCwgYW5kIHByZS1yZWxlYXNlIHNlY3Rpb25zIG9mXG4vLyB0aGUgdmVyc2lvbiBzdHJpbmcgYXJlIGNhcHR1cmluZyBncm91cHMuICBUaGUgYnVpbGQgbWV0YWRhdGEgaXMgbm90IGFcbi8vIGNhcHR1cmluZyBncm91cCwgYmVjYXVzZSBpdCBzaG91bGQgbm90IGV2ZXIgYmUgdXNlZCBpbiB2ZXJzaW9uXG4vLyBjb21wYXJpc29uLlxuXG52YXIgRlVMTCA9IFIrKztcbnZhciBGVUxMUExBSU4gPSAndj8nICsgc3JjW01BSU5WRVJTSU9OXSArXG4gICAgICAgICAgICAgICAgc3JjW1BSRVJFTEVBU0VdICsgJz8nICtcbiAgICAgICAgICAgICAgICBzcmNbQlVJTERdICsgJz8nO1xuXG5zcmNbRlVMTF0gPSAnXicgKyBGVUxMUExBSU4gKyAnJCc7XG5cbi8vIGxpa2UgZnVsbCwgYnV0IGFsbG93cyB2MS4yLjMgYW5kID0xLjIuMywgd2hpY2ggcGVvcGxlIGRvIHNvbWV0aW1lcy5cbi8vIGFsc28sIDEuMC4wYWxwaGExIChwcmVyZWxlYXNlIHdpdGhvdXQgdGhlIGh5cGhlbikgd2hpY2ggaXMgcHJldHR5XG4vLyBjb21tb24gaW4gdGhlIG5wbSByZWdpc3RyeS5cbnZhciBMT09TRVBMQUlOID0gJ1t2PVxcXFxzXSonICsgc3JjW01BSU5WRVJTSU9OTE9PU0VdICtcbiAgICAgICAgICAgICAgICAgc3JjW1BSRVJFTEVBU0VMT09TRV0gKyAnPycgK1xuICAgICAgICAgICAgICAgICBzcmNbQlVJTERdICsgJz8nO1xuXG52YXIgTE9PU0UgPSBSKys7XG5zcmNbTE9PU0VdID0gJ14nICsgTE9PU0VQTEFJTiArICckJztcblxudmFyIEdUTFQgPSBSKys7XG5zcmNbR1RMVF0gPSAnKCg/Ojx8Pik/PT8pJztcblxuLy8gU29tZXRoaW5nIGxpa2UgXCIyLipcIiBvciBcIjEuMi54XCIuXG4vLyBOb3RlIHRoYXQgXCJ4LnhcIiBpcyBhIHZhbGlkIHhSYW5nZSBpZGVudGlmZXIsIG1lYW5pbmcgXCJhbnkgdmVyc2lvblwiXG4vLyBPbmx5IHRoZSBmaXJzdCBpdGVtIGlzIHN0cmljdGx5IHJlcXVpcmVkLlxudmFyIFhSQU5HRUlERU5USUZJRVJMT09TRSA9IFIrKztcbnNyY1tYUkFOR0VJREVOVElGSUVSTE9PU0VdID0gc3JjW05VTUVSSUNJREVOVElGSUVSTE9PU0VdICsgJ3x4fFh8XFxcXConO1xudmFyIFhSQU5HRUlERU5USUZJRVIgPSBSKys7XG5zcmNbWFJBTkdFSURFTlRJRklFUl0gPSBzcmNbTlVNRVJJQ0lERU5USUZJRVJdICsgJ3x4fFh8XFxcXConO1xuXG52YXIgWFJBTkdFUExBSU4gPSBSKys7XG5zcmNbWFJBTkdFUExBSU5dID0gJ1t2PVxcXFxzXSooJyArIHNyY1tYUkFOR0VJREVOVElGSUVSXSArICcpJyArXG4gICAgICAgICAgICAgICAgICAgJyg/OlxcXFwuKCcgKyBzcmNbWFJBTkdFSURFTlRJRklFUl0gKyAnKScgK1xuICAgICAgICAgICAgICAgICAgICcoPzpcXFxcLignICsgc3JjW1hSQU5HRUlERU5USUZJRVJdICsgJyknICtcbiAgICAgICAgICAgICAgICAgICAnKD86JyArIHNyY1tQUkVSRUxFQVNFXSArICcpPycgK1xuICAgICAgICAgICAgICAgICAgIHNyY1tCVUlMRF0gKyAnPycgK1xuICAgICAgICAgICAgICAgICAgICcpPyk/JztcblxudmFyIFhSQU5HRVBMQUlOTE9PU0UgPSBSKys7XG5zcmNbWFJBTkdFUExBSU5MT09TRV0gPSAnW3Y9XFxcXHNdKignICsgc3JjW1hSQU5HRUlERU5USUZJRVJMT09TRV0gKyAnKScgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJyg/OlxcXFwuKCcgKyBzcmNbWFJBTkdFSURFTlRJRklFUkxPT1NFXSArICcpJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnKD86XFxcXC4oJyArIHNyY1tYUkFOR0VJREVOVElGSUVSTE9PU0VdICsgJyknICtcbiAgICAgICAgICAgICAgICAgICAgICAgICcoPzonICsgc3JjW1BSRVJFTEVBU0VMT09TRV0gKyAnKT8nICtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNyY1tCVUlMRF0gKyAnPycgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJyk/KT8nO1xuXG52YXIgWFJBTkdFID0gUisrO1xuc3JjW1hSQU5HRV0gPSAnXicgKyBzcmNbR1RMVF0gKyAnXFxcXHMqJyArIHNyY1tYUkFOR0VQTEFJTl0gKyAnJCc7XG52YXIgWFJBTkdFTE9PU0UgPSBSKys7XG5zcmNbWFJBTkdFTE9PU0VdID0gJ14nICsgc3JjW0dUTFRdICsgJ1xcXFxzKicgKyBzcmNbWFJBTkdFUExBSU5MT09TRV0gKyAnJCc7XG5cbi8vIENvZXJjaW9uLlxuLy8gRXh0cmFjdCBhbnl0aGluZyB0aGF0IGNvdWxkIGNvbmNlaXZhYmx5IGJlIGEgcGFydCBvZiBhIHZhbGlkIHNlbXZlclxudmFyIENPRVJDRSA9IFIrKztcbnNyY1tDT0VSQ0VdID0gJyg/Ol58W15cXFxcZF0pJyArXG4gICAgICAgICAgICAgICcoXFxcXGR7MSwnICsgTUFYX1NBRkVfQ09NUE9ORU5UX0xFTkdUSCArICd9KScgK1xuICAgICAgICAgICAgICAnKD86XFxcXC4oXFxcXGR7MSwnICsgTUFYX1NBRkVfQ09NUE9ORU5UX0xFTkdUSCArICd9KSk/JyArXG4gICAgICAgICAgICAgICcoPzpcXFxcLihcXFxcZHsxLCcgKyBNQVhfU0FGRV9DT01QT05FTlRfTEVOR1RIICsgJ30pKT8nICtcbiAgICAgICAgICAgICAgJyg/OiR8W15cXFxcZF0pJztcblxuLy8gVGlsZGUgcmFuZ2VzLlxuLy8gTWVhbmluZyBpcyBcInJlYXNvbmFibHkgYXQgb3IgZ3JlYXRlciB0aGFuXCJcbnZhciBMT05FVElMREUgPSBSKys7XG5zcmNbTE9ORVRJTERFXSA9ICcoPzp+Pj8pJztcblxudmFyIFRJTERFVFJJTSA9IFIrKztcbnNyY1tUSUxERVRSSU1dID0gJyhcXFxccyopJyArIHNyY1tMT05FVElMREVdICsgJ1xcXFxzKyc7XG5yZVtUSUxERVRSSU1dID0gbmV3IFJlZ0V4cChzcmNbVElMREVUUklNXSwgJ2cnKTtcbnZhciB0aWxkZVRyaW1SZXBsYWNlID0gJyQxfic7XG5cbnZhciBUSUxERSA9IFIrKztcbnNyY1tUSUxERV0gPSAnXicgKyBzcmNbTE9ORVRJTERFXSArIHNyY1tYUkFOR0VQTEFJTl0gKyAnJCc7XG52YXIgVElMREVMT09TRSA9IFIrKztcbnNyY1tUSUxERUxPT1NFXSA9ICdeJyArIHNyY1tMT05FVElMREVdICsgc3JjW1hSQU5HRVBMQUlOTE9PU0VdICsgJyQnO1xuXG4vLyBDYXJldCByYW5nZXMuXG4vLyBNZWFuaW5nIGlzIFwiYXQgbGVhc3QgYW5kIGJhY2t3YXJkcyBjb21wYXRpYmxlIHdpdGhcIlxudmFyIExPTkVDQVJFVCA9IFIrKztcbnNyY1tMT05FQ0FSRVRdID0gJyg/OlxcXFxeKSc7XG5cbnZhciBDQVJFVFRSSU0gPSBSKys7XG5zcmNbQ0FSRVRUUklNXSA9ICcoXFxcXHMqKScgKyBzcmNbTE9ORUNBUkVUXSArICdcXFxccysnO1xucmVbQ0FSRVRUUklNXSA9IG5ldyBSZWdFeHAoc3JjW0NBUkVUVFJJTV0sICdnJyk7XG52YXIgY2FyZXRUcmltUmVwbGFjZSA9ICckMV4nO1xuXG52YXIgQ0FSRVQgPSBSKys7XG5zcmNbQ0FSRVRdID0gJ14nICsgc3JjW0xPTkVDQVJFVF0gKyBzcmNbWFJBTkdFUExBSU5dICsgJyQnO1xudmFyIENBUkVUTE9PU0UgPSBSKys7XG5zcmNbQ0FSRVRMT09TRV0gPSAnXicgKyBzcmNbTE9ORUNBUkVUXSArIHNyY1tYUkFOR0VQTEFJTkxPT1NFXSArICckJztcblxuLy8gQSBzaW1wbGUgZ3QvbHQvZXEgdGhpbmcsIG9yIGp1c3QgXCJcIiB0byBpbmRpY2F0ZSBcImFueSB2ZXJzaW9uXCJcbnZhciBDT01QQVJBVE9STE9PU0UgPSBSKys7XG5zcmNbQ09NUEFSQVRPUkxPT1NFXSA9ICdeJyArIHNyY1tHVExUXSArICdcXFxccyooJyArIExPT1NFUExBSU4gKyAnKSR8XiQnO1xudmFyIENPTVBBUkFUT1IgPSBSKys7XG5zcmNbQ09NUEFSQVRPUl0gPSAnXicgKyBzcmNbR1RMVF0gKyAnXFxcXHMqKCcgKyBGVUxMUExBSU4gKyAnKSR8XiQnO1xuXG5cbi8vIEFuIGV4cHJlc3Npb24gdG8gc3RyaXAgYW55IHdoaXRlc3BhY2UgYmV0d2VlbiB0aGUgZ3RsdCBhbmQgdGhlIHRoaW5nXG4vLyBpdCBtb2RpZmllcywgc28gdGhhdCBgPiAxLjIuM2AgPT0+IGA+MS4yLjNgXG52YXIgQ09NUEFSQVRPUlRSSU0gPSBSKys7XG5zcmNbQ09NUEFSQVRPUlRSSU1dID0gJyhcXFxccyopJyArIHNyY1tHVExUXSArXG4gICAgICAgICAgICAgICAgICAgICAgJ1xcXFxzKignICsgTE9PU0VQTEFJTiArICd8JyArIHNyY1tYUkFOR0VQTEFJTl0gKyAnKSc7XG5cbi8vIHRoaXMgb25lIGhhcyB0byB1c2UgdGhlIC9nIGZsYWdcbnJlW0NPTVBBUkFUT1JUUklNXSA9IG5ldyBSZWdFeHAoc3JjW0NPTVBBUkFUT1JUUklNXSwgJ2cnKTtcbnZhciBjb21wYXJhdG9yVHJpbVJlcGxhY2UgPSAnJDEkMiQzJztcblxuXG4vLyBTb21ldGhpbmcgbGlrZSBgMS4yLjMgLSAxLjIuNGBcbi8vIE5vdGUgdGhhdCB0aGVzZSBhbGwgdXNlIHRoZSBsb29zZSBmb3JtLCBiZWNhdXNlIHRoZXknbGwgYmVcbi8vIGNoZWNrZWQgYWdhaW5zdCBlaXRoZXIgdGhlIHN0cmljdCBvciBsb29zZSBjb21wYXJhdG9yIGZvcm1cbi8vIGxhdGVyLlxudmFyIEhZUEhFTlJBTkdFID0gUisrO1xuc3JjW0hZUEhFTlJBTkdFXSA9ICdeXFxcXHMqKCcgKyBzcmNbWFJBTkdFUExBSU5dICsgJyknICtcbiAgICAgICAgICAgICAgICAgICAnXFxcXHMrLVxcXFxzKycgK1xuICAgICAgICAgICAgICAgICAgICcoJyArIHNyY1tYUkFOR0VQTEFJTl0gKyAnKScgK1xuICAgICAgICAgICAgICAgICAgICdcXFxccyokJztcblxudmFyIEhZUEhFTlJBTkdFTE9PU0UgPSBSKys7XG5zcmNbSFlQSEVOUkFOR0VMT09TRV0gPSAnXlxcXFxzKignICsgc3JjW1hSQU5HRVBMQUlOTE9PU0VdICsgJyknICtcbiAgICAgICAgICAgICAgICAgICAgICAgICdcXFxccystXFxcXHMrJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnKCcgKyBzcmNbWFJBTkdFUExBSU5MT09TRV0gKyAnKScgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJ1xcXFxzKiQnO1xuXG4vLyBTdGFyIHJhbmdlcyBiYXNpY2FsbHkganVzdCBhbGxvdyBhbnl0aGluZyBhdCBhbGwuXG52YXIgU1RBUiA9IFIrKztcbnNyY1tTVEFSXSA9ICcoPHw+KT89P1xcXFxzKlxcXFwqJztcblxuLy8gQ29tcGlsZSB0byBhY3R1YWwgcmVnZXhwIG9iamVjdHMuXG4vLyBBbGwgYXJlIGZsYWctZnJlZSwgdW5sZXNzIHRoZXkgd2VyZSBjcmVhdGVkIGFib3ZlIHdpdGggYSBmbGFnLlxuZm9yICh2YXIgaSA9IDA7IGkgPCBSOyBpKyspIHtcbiAgZGVidWcoaSwgc3JjW2ldKTtcbiAgaWYgKCFyZVtpXSlcbiAgICByZVtpXSA9IG5ldyBSZWdFeHAoc3JjW2ldKTtcbn1cblxuZXhwb3J0cy5wYXJzZSA9IHBhcnNlO1xuZnVuY3Rpb24gcGFyc2UodmVyc2lvbiwgb3B0aW9ucykge1xuICBpZiAoIW9wdGlvbnMgfHwgdHlwZW9mIG9wdGlvbnMgIT09ICdvYmplY3QnKVxuICAgIG9wdGlvbnMgPSB7IGxvb3NlOiAhIW9wdGlvbnMsIGluY2x1ZGVQcmVyZWxlYXNlOiBmYWxzZSB9XG5cbiAgaWYgKHZlcnNpb24gaW5zdGFuY2VvZiBTZW1WZXIpXG4gICAgcmV0dXJuIHZlcnNpb247XG5cbiAgaWYgKHR5cGVvZiB2ZXJzaW9uICE9PSAnc3RyaW5nJylcbiAgICByZXR1cm4gbnVsbDtcblxuICBpZiAodmVyc2lvbi5sZW5ndGggPiBNQVhfTEVOR1RIKVxuICAgIHJldHVybiBudWxsO1xuXG4gIHZhciByID0gb3B0aW9ucy5sb29zZSA/IHJlW0xPT1NFXSA6IHJlW0ZVTExdO1xuICBpZiAoIXIudGVzdCh2ZXJzaW9uKSlcbiAgICByZXR1cm4gbnVsbDtcblxuICB0cnkge1xuICAgIHJldHVybiBuZXcgU2VtVmVyKHZlcnNpb24sIG9wdGlvbnMpO1xuICB9IGNhdGNoIChlcikge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbmV4cG9ydHMudmFsaWQgPSB2YWxpZDtcbmZ1bmN0aW9uIHZhbGlkKHZlcnNpb24sIG9wdGlvbnMpIHtcbiAgdmFyIHYgPSBwYXJzZSh2ZXJzaW9uLCBvcHRpb25zKTtcbiAgcmV0dXJuIHYgPyB2LnZlcnNpb24gOiBudWxsO1xufVxuXG5cbmV4cG9ydHMuY2xlYW4gPSBjbGVhbjtcbmZ1bmN0aW9uIGNsZWFuKHZlcnNpb24sIG9wdGlvbnMpIHtcbiAgdmFyIHMgPSBwYXJzZSh2ZXJzaW9uLnRyaW0oKS5yZXBsYWNlKC9eWz12XSsvLCAnJyksIG9wdGlvbnMpO1xuICByZXR1cm4gcyA/IHMudmVyc2lvbiA6IG51bGw7XG59XG5cbmV4cG9ydHMuU2VtVmVyID0gU2VtVmVyO1xuXG5mdW5jdGlvbiBTZW1WZXIodmVyc2lvbiwgb3B0aW9ucykge1xuICBpZiAoIW9wdGlvbnMgfHwgdHlwZW9mIG9wdGlvbnMgIT09ICdvYmplY3QnKVxuICAgIG9wdGlvbnMgPSB7IGxvb3NlOiAhIW9wdGlvbnMsIGluY2x1ZGVQcmVyZWxlYXNlOiBmYWxzZSB9XG4gIGlmICh2ZXJzaW9uIGluc3RhbmNlb2YgU2VtVmVyKSB7XG4gICAgaWYgKHZlcnNpb24ubG9vc2UgPT09IG9wdGlvbnMubG9vc2UpXG4gICAgICByZXR1cm4gdmVyc2lvbjtcbiAgICBlbHNlXG4gICAgICB2ZXJzaW9uID0gdmVyc2lvbi52ZXJzaW9uO1xuICB9IGVsc2UgaWYgKHR5cGVvZiB2ZXJzaW9uICE9PSAnc3RyaW5nJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgVmVyc2lvbjogJyArIHZlcnNpb24pO1xuICB9XG5cbiAgaWYgKHZlcnNpb24ubGVuZ3RoID4gTUFYX0xFTkdUSClcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCd2ZXJzaW9uIGlzIGxvbmdlciB0aGFuICcgKyBNQVhfTEVOR1RIICsgJyBjaGFyYWN0ZXJzJylcblxuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgU2VtVmVyKSlcbiAgICByZXR1cm4gbmV3IFNlbVZlcih2ZXJzaW9uLCBvcHRpb25zKTtcblxuICBkZWJ1ZygnU2VtVmVyJywgdmVyc2lvbiwgb3B0aW9ucyk7XG4gIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gIHRoaXMubG9vc2UgPSAhIW9wdGlvbnMubG9vc2U7XG5cbiAgdmFyIG0gPSB2ZXJzaW9uLnRyaW0oKS5tYXRjaChvcHRpb25zLmxvb3NlID8gcmVbTE9PU0VdIDogcmVbRlVMTF0pO1xuXG4gIGlmICghbSlcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIFZlcnNpb246ICcgKyB2ZXJzaW9uKTtcblxuICB0aGlzLnJhdyA9IHZlcnNpb247XG5cbiAgLy8gdGhlc2UgYXJlIGFjdHVhbGx5IG51bWJlcnNcbiAgdGhpcy5tYWpvciA9ICttWzFdO1xuICB0aGlzLm1pbm9yID0gK21bMl07XG4gIHRoaXMucGF0Y2ggPSArbVszXTtcblxuICBpZiAodGhpcy5tYWpvciA+IE1BWF9TQUZFX0lOVEVHRVIgfHwgdGhpcy5tYWpvciA8IDApXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBtYWpvciB2ZXJzaW9uJylcblxuICBpZiAodGhpcy5taW5vciA+IE1BWF9TQUZFX0lOVEVHRVIgfHwgdGhpcy5taW5vciA8IDApXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBtaW5vciB2ZXJzaW9uJylcblxuICBpZiAodGhpcy5wYXRjaCA+IE1BWF9TQUZFX0lOVEVHRVIgfHwgdGhpcy5wYXRjaCA8IDApXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBwYXRjaCB2ZXJzaW9uJylcblxuICAvLyBudW1iZXJpZnkgYW55IHByZXJlbGVhc2UgbnVtZXJpYyBpZHNcbiAgaWYgKCFtWzRdKVxuICAgIHRoaXMucHJlcmVsZWFzZSA9IFtdO1xuICBlbHNlXG4gICAgdGhpcy5wcmVyZWxlYXNlID0gbVs0XS5zcGxpdCgnLicpLm1hcChmdW5jdGlvbihpZCkge1xuICAgICAgaWYgKC9eWzAtOV0rJC8udGVzdChpZCkpIHtcbiAgICAgICAgdmFyIG51bSA9ICtpZDtcbiAgICAgICAgaWYgKG51bSA+PSAwICYmIG51bSA8IE1BWF9TQUZFX0lOVEVHRVIpXG4gICAgICAgICAgcmV0dXJuIG51bTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBpZDtcbiAgICB9KTtcblxuICB0aGlzLmJ1aWxkID0gbVs1XSA/IG1bNV0uc3BsaXQoJy4nKSA6IFtdO1xuICB0aGlzLmZvcm1hdCgpO1xufVxuXG5TZW1WZXIucHJvdG90eXBlLmZvcm1hdCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnZlcnNpb24gPSB0aGlzLm1ham9yICsgJy4nICsgdGhpcy5taW5vciArICcuJyArIHRoaXMucGF0Y2g7XG4gIGlmICh0aGlzLnByZXJlbGVhc2UubGVuZ3RoKVxuICAgIHRoaXMudmVyc2lvbiArPSAnLScgKyB0aGlzLnByZXJlbGVhc2Uuam9pbignLicpO1xuICByZXR1cm4gdGhpcy52ZXJzaW9uO1xufTtcblxuU2VtVmVyLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy52ZXJzaW9uO1xufTtcblxuU2VtVmVyLnByb3RvdHlwZS5jb21wYXJlID0gZnVuY3Rpb24ob3RoZXIpIHtcbiAgZGVidWcoJ1NlbVZlci5jb21wYXJlJywgdGhpcy52ZXJzaW9uLCB0aGlzLm9wdGlvbnMsIG90aGVyKTtcbiAgaWYgKCEob3RoZXIgaW5zdGFuY2VvZiBTZW1WZXIpKVxuICAgIG90aGVyID0gbmV3IFNlbVZlcihvdGhlciwgdGhpcy5vcHRpb25zKTtcblxuICByZXR1cm4gdGhpcy5jb21wYXJlTWFpbihvdGhlcikgfHwgdGhpcy5jb21wYXJlUHJlKG90aGVyKTtcbn07XG5cblNlbVZlci5wcm90b3R5cGUuY29tcGFyZU1haW4gPSBmdW5jdGlvbihvdGhlcikge1xuICBpZiAoIShvdGhlciBpbnN0YW5jZW9mIFNlbVZlcikpXG4gICAgb3RoZXIgPSBuZXcgU2VtVmVyKG90aGVyLCB0aGlzLm9wdGlvbnMpO1xuXG4gIHJldHVybiBjb21wYXJlSWRlbnRpZmllcnModGhpcy5tYWpvciwgb3RoZXIubWFqb3IpIHx8XG4gICAgICAgICBjb21wYXJlSWRlbnRpZmllcnModGhpcy5taW5vciwgb3RoZXIubWlub3IpIHx8XG4gICAgICAgICBjb21wYXJlSWRlbnRpZmllcnModGhpcy5wYXRjaCwgb3RoZXIucGF0Y2gpO1xufTtcblxuU2VtVmVyLnByb3RvdHlwZS5jb21wYXJlUHJlID0gZnVuY3Rpb24ob3RoZXIpIHtcbiAgaWYgKCEob3RoZXIgaW5zdGFuY2VvZiBTZW1WZXIpKVxuICAgIG90aGVyID0gbmV3IFNlbVZlcihvdGhlciwgdGhpcy5vcHRpb25zKTtcblxuICAvLyBOT1QgaGF2aW5nIGEgcHJlcmVsZWFzZSBpcyA+IGhhdmluZyBvbmVcbiAgaWYgKHRoaXMucHJlcmVsZWFzZS5sZW5ndGggJiYgIW90aGVyLnByZXJlbGVhc2UubGVuZ3RoKVxuICAgIHJldHVybiAtMTtcbiAgZWxzZSBpZiAoIXRoaXMucHJlcmVsZWFzZS5sZW5ndGggJiYgb3RoZXIucHJlcmVsZWFzZS5sZW5ndGgpXG4gICAgcmV0dXJuIDE7XG4gIGVsc2UgaWYgKCF0aGlzLnByZXJlbGVhc2UubGVuZ3RoICYmICFvdGhlci5wcmVyZWxlYXNlLmxlbmd0aClcbiAgICByZXR1cm4gMDtcblxuICB2YXIgaSA9IDA7XG4gIGRvIHtcbiAgICB2YXIgYSA9IHRoaXMucHJlcmVsZWFzZVtpXTtcbiAgICB2YXIgYiA9IG90aGVyLnByZXJlbGVhc2VbaV07XG4gICAgZGVidWcoJ3ByZXJlbGVhc2UgY29tcGFyZScsIGksIGEsIGIpO1xuICAgIGlmIChhID09PSB1bmRlZmluZWQgJiYgYiA9PT0gdW5kZWZpbmVkKVxuICAgICAgcmV0dXJuIDA7XG4gICAgZWxzZSBpZiAoYiA9PT0gdW5kZWZpbmVkKVxuICAgICAgcmV0dXJuIDE7XG4gICAgZWxzZSBpZiAoYSA9PT0gdW5kZWZpbmVkKVxuICAgICAgcmV0dXJuIC0xO1xuICAgIGVsc2UgaWYgKGEgPT09IGIpXG4gICAgICBjb250aW51ZTtcbiAgICBlbHNlXG4gICAgICByZXR1cm4gY29tcGFyZUlkZW50aWZpZXJzKGEsIGIpO1xuICB9IHdoaWxlICgrK2kpO1xufTtcblxuLy8gcHJlbWlub3Igd2lsbCBidW1wIHRoZSB2ZXJzaW9uIHVwIHRvIHRoZSBuZXh0IG1pbm9yIHJlbGVhc2UsIGFuZCBpbW1lZGlhdGVseVxuLy8gZG93biB0byBwcmUtcmVsZWFzZS4gcHJlbWFqb3IgYW5kIHByZXBhdGNoIHdvcmsgdGhlIHNhbWUgd2F5LlxuU2VtVmVyLnByb3RvdHlwZS5pbmMgPSBmdW5jdGlvbihyZWxlYXNlLCBpZGVudGlmaWVyKSB7XG4gIHN3aXRjaCAocmVsZWFzZSkge1xuICAgIGNhc2UgJ3ByZW1ham9yJzpcbiAgICAgIHRoaXMucHJlcmVsZWFzZS5sZW5ndGggPSAwO1xuICAgICAgdGhpcy5wYXRjaCA9IDA7XG4gICAgICB0aGlzLm1pbm9yID0gMDtcbiAgICAgIHRoaXMubWFqb3IrKztcbiAgICAgIHRoaXMuaW5jKCdwcmUnLCBpZGVudGlmaWVyKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3ByZW1pbm9yJzpcbiAgICAgIHRoaXMucHJlcmVsZWFzZS5sZW5ndGggPSAwO1xuICAgICAgdGhpcy5wYXRjaCA9IDA7XG4gICAgICB0aGlzLm1pbm9yKys7XG4gICAgICB0aGlzLmluYygncHJlJywgaWRlbnRpZmllcik7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdwcmVwYXRjaCc6XG4gICAgICAvLyBJZiB0aGlzIGlzIGFscmVhZHkgYSBwcmVyZWxlYXNlLCBpdCB3aWxsIGJ1bXAgdG8gdGhlIG5leHQgdmVyc2lvblxuICAgICAgLy8gZHJvcCBhbnkgcHJlcmVsZWFzZXMgdGhhdCBtaWdodCBhbHJlYWR5IGV4aXN0LCBzaW5jZSB0aGV5IGFyZSBub3RcbiAgICAgIC8vIHJlbGV2YW50IGF0IHRoaXMgcG9pbnQuXG4gICAgICB0aGlzLnByZXJlbGVhc2UubGVuZ3RoID0gMDtcbiAgICAgIHRoaXMuaW5jKCdwYXRjaCcsIGlkZW50aWZpZXIpO1xuICAgICAgdGhpcy5pbmMoJ3ByZScsIGlkZW50aWZpZXIpO1xuICAgICAgYnJlYWs7XG4gICAgLy8gSWYgdGhlIGlucHV0IGlzIGEgbm9uLXByZXJlbGVhc2UgdmVyc2lvbiwgdGhpcyBhY3RzIHRoZSBzYW1lIGFzXG4gICAgLy8gcHJlcGF0Y2guXG4gICAgY2FzZSAncHJlcmVsZWFzZSc6XG4gICAgICBpZiAodGhpcy5wcmVyZWxlYXNlLmxlbmd0aCA9PT0gMClcbiAgICAgICAgdGhpcy5pbmMoJ3BhdGNoJywgaWRlbnRpZmllcik7XG4gICAgICB0aGlzLmluYygncHJlJywgaWRlbnRpZmllcik7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ21ham9yJzpcbiAgICAgIC8vIElmIHRoaXMgaXMgYSBwcmUtbWFqb3IgdmVyc2lvbiwgYnVtcCB1cCB0byB0aGUgc2FtZSBtYWpvciB2ZXJzaW9uLlxuICAgICAgLy8gT3RoZXJ3aXNlIGluY3JlbWVudCBtYWpvci5cbiAgICAgIC8vIDEuMC4wLTUgYnVtcHMgdG8gMS4wLjBcbiAgICAgIC8vIDEuMS4wIGJ1bXBzIHRvIDIuMC4wXG4gICAgICBpZiAodGhpcy5taW5vciAhPT0gMCB8fCB0aGlzLnBhdGNoICE9PSAwIHx8IHRoaXMucHJlcmVsZWFzZS5sZW5ndGggPT09IDApXG4gICAgICAgIHRoaXMubWFqb3IrKztcbiAgICAgIHRoaXMubWlub3IgPSAwO1xuICAgICAgdGhpcy5wYXRjaCA9IDA7XG4gICAgICB0aGlzLnByZXJlbGVhc2UgPSBbXTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ21pbm9yJzpcbiAgICAgIC8vIElmIHRoaXMgaXMgYSBwcmUtbWlub3IgdmVyc2lvbiwgYnVtcCB1cCB0byB0aGUgc2FtZSBtaW5vciB2ZXJzaW9uLlxuICAgICAgLy8gT3RoZXJ3aXNlIGluY3JlbWVudCBtaW5vci5cbiAgICAgIC8vIDEuMi4wLTUgYnVtcHMgdG8gMS4yLjBcbiAgICAgIC8vIDEuMi4xIGJ1bXBzIHRvIDEuMy4wXG4gICAgICBpZiAodGhpcy5wYXRjaCAhPT0gMCB8fCB0aGlzLnByZXJlbGVhc2UubGVuZ3RoID09PSAwKVxuICAgICAgICB0aGlzLm1pbm9yKys7XG4gICAgICB0aGlzLnBhdGNoID0gMDtcbiAgICAgIHRoaXMucHJlcmVsZWFzZSA9IFtdO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncGF0Y2gnOlxuICAgICAgLy8gSWYgdGhpcyBpcyBub3QgYSBwcmUtcmVsZWFzZSB2ZXJzaW9uLCBpdCB3aWxsIGluY3JlbWVudCB0aGUgcGF0Y2guXG4gICAgICAvLyBJZiBpdCBpcyBhIHByZS1yZWxlYXNlIGl0IHdpbGwgYnVtcCB1cCB0byB0aGUgc2FtZSBwYXRjaCB2ZXJzaW9uLlxuICAgICAgLy8gMS4yLjAtNSBwYXRjaGVzIHRvIDEuMi4wXG4gICAgICAvLyAxLjIuMCBwYXRjaGVzIHRvIDEuMi4xXG4gICAgICBpZiAodGhpcy5wcmVyZWxlYXNlLmxlbmd0aCA9PT0gMClcbiAgICAgICAgdGhpcy5wYXRjaCsrO1xuICAgICAgdGhpcy5wcmVyZWxlYXNlID0gW107XG4gICAgICBicmVhaztcbiAgICAvLyBUaGlzIHByb2JhYmx5IHNob3VsZG4ndCBiZSB1c2VkIHB1YmxpY2x5LlxuICAgIC8vIDEuMC4wIFwicHJlXCIgd291bGQgYmVjb21lIDEuMC4wLTAgd2hpY2ggaXMgdGhlIHdyb25nIGRpcmVjdGlvbi5cbiAgICBjYXNlICdwcmUnOlxuICAgICAgaWYgKHRoaXMucHJlcmVsZWFzZS5sZW5ndGggPT09IDApXG4gICAgICAgIHRoaXMucHJlcmVsZWFzZSA9IFswXTtcbiAgICAgIGVsc2Uge1xuICAgICAgICB2YXIgaSA9IHRoaXMucHJlcmVsZWFzZS5sZW5ndGg7XG4gICAgICAgIHdoaWxlICgtLWkgPj0gMCkge1xuICAgICAgICAgIGlmICh0eXBlb2YgdGhpcy5wcmVyZWxlYXNlW2ldID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgdGhpcy5wcmVyZWxlYXNlW2ldKys7XG4gICAgICAgICAgICBpID0gLTI7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChpID09PSAtMSkgLy8gZGlkbid0IGluY3JlbWVudCBhbnl0aGluZ1xuICAgICAgICAgIHRoaXMucHJlcmVsZWFzZS5wdXNoKDApO1xuICAgICAgfVxuICAgICAgaWYgKGlkZW50aWZpZXIpIHtcbiAgICAgICAgLy8gMS4yLjAtYmV0YS4xIGJ1bXBzIHRvIDEuMi4wLWJldGEuMixcbiAgICAgICAgLy8gMS4yLjAtYmV0YS5mb29ibHogb3IgMS4yLjAtYmV0YSBidW1wcyB0byAxLjIuMC1iZXRhLjBcbiAgICAgICAgaWYgKHRoaXMucHJlcmVsZWFzZVswXSA9PT0gaWRlbnRpZmllcikge1xuICAgICAgICAgIGlmIChpc05hTih0aGlzLnByZXJlbGVhc2VbMV0pKVxuICAgICAgICAgICAgdGhpcy5wcmVyZWxlYXNlID0gW2lkZW50aWZpZXIsIDBdO1xuICAgICAgICB9IGVsc2VcbiAgICAgICAgICB0aGlzLnByZXJlbGVhc2UgPSBbaWRlbnRpZmllciwgMF07XG4gICAgICB9XG4gICAgICBicmVhaztcblxuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgaW5jcmVtZW50IGFyZ3VtZW50OiAnICsgcmVsZWFzZSk7XG4gIH1cbiAgdGhpcy5mb3JtYXQoKTtcbiAgdGhpcy5yYXcgPSB0aGlzLnZlcnNpb247XG4gIHJldHVybiB0aGlzO1xufTtcblxuZXhwb3J0cy5pbmMgPSBpbmM7XG5mdW5jdGlvbiBpbmModmVyc2lvbiwgcmVsZWFzZSwgbG9vc2UsIGlkZW50aWZpZXIpIHtcbiAgaWYgKHR5cGVvZihsb29zZSkgPT09ICdzdHJpbmcnKSB7XG4gICAgaWRlbnRpZmllciA9IGxvb3NlO1xuICAgIGxvb3NlID0gdW5kZWZpbmVkO1xuICB9XG5cbiAgdHJ5IHtcbiAgICByZXR1cm4gbmV3IFNlbVZlcih2ZXJzaW9uLCBsb29zZSkuaW5jKHJlbGVhc2UsIGlkZW50aWZpZXIpLnZlcnNpb247XG4gIH0gY2F0Y2ggKGVyKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuZXhwb3J0cy5kaWZmID0gZGlmZjtcbmZ1bmN0aW9uIGRpZmYodmVyc2lvbjEsIHZlcnNpb24yKSB7XG4gIGlmIChlcSh2ZXJzaW9uMSwgdmVyc2lvbjIpKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH0gZWxzZSB7XG4gICAgdmFyIHYxID0gcGFyc2UodmVyc2lvbjEpO1xuICAgIHZhciB2MiA9IHBhcnNlKHZlcnNpb24yKTtcbiAgICBpZiAodjEucHJlcmVsZWFzZS5sZW5ndGggfHwgdjIucHJlcmVsZWFzZS5sZW5ndGgpIHtcbiAgICAgIGZvciAodmFyIGtleSBpbiB2MSkge1xuICAgICAgICBpZiAoa2V5ID09PSAnbWFqb3InIHx8IGtleSA9PT0gJ21pbm9yJyB8fCBrZXkgPT09ICdwYXRjaCcpIHtcbiAgICAgICAgICBpZiAodjFba2V5XSAhPT0gdjJba2V5XSkge1xuICAgICAgICAgICAgcmV0dXJuICdwcmUnK2tleTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiAncHJlcmVsZWFzZSc7XG4gICAgfVxuICAgIGZvciAodmFyIGtleSBpbiB2MSkge1xuICAgICAgaWYgKGtleSA9PT0gJ21ham9yJyB8fCBrZXkgPT09ICdtaW5vcicgfHwga2V5ID09PSAncGF0Y2gnKSB7XG4gICAgICAgIGlmICh2MVtrZXldICE9PSB2MltrZXldKSB7XG4gICAgICAgICAgcmV0dXJuIGtleTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnRzLmNvbXBhcmVJZGVudGlmaWVycyA9IGNvbXBhcmVJZGVudGlmaWVycztcblxudmFyIG51bWVyaWMgPSAvXlswLTldKyQvO1xuZnVuY3Rpb24gY29tcGFyZUlkZW50aWZpZXJzKGEsIGIpIHtcbiAgdmFyIGFudW0gPSBudW1lcmljLnRlc3QoYSk7XG4gIHZhciBibnVtID0gbnVtZXJpYy50ZXN0KGIpO1xuXG4gIGlmIChhbnVtICYmIGJudW0pIHtcbiAgICBhID0gK2E7XG4gICAgYiA9ICtiO1xuICB9XG5cbiAgcmV0dXJuIChhbnVtICYmICFibnVtKSA/IC0xIDpcbiAgICAgICAgIChibnVtICYmICFhbnVtKSA/IDEgOlxuICAgICAgICAgYSA8IGIgPyAtMSA6XG4gICAgICAgICBhID4gYiA/IDEgOlxuICAgICAgICAgMDtcbn1cblxuZXhwb3J0cy5yY29tcGFyZUlkZW50aWZpZXJzID0gcmNvbXBhcmVJZGVudGlmaWVycztcbmZ1bmN0aW9uIHJjb21wYXJlSWRlbnRpZmllcnMoYSwgYikge1xuICByZXR1cm4gY29tcGFyZUlkZW50aWZpZXJzKGIsIGEpO1xufVxuXG5leHBvcnRzLm1ham9yID0gbWFqb3I7XG5mdW5jdGlvbiBtYWpvcihhLCBsb29zZSkge1xuICByZXR1cm4gbmV3IFNlbVZlcihhLCBsb29zZSkubWFqb3I7XG59XG5cbmV4cG9ydHMubWlub3IgPSBtaW5vcjtcbmZ1bmN0aW9uIG1pbm9yKGEsIGxvb3NlKSB7XG4gIHJldHVybiBuZXcgU2VtVmVyKGEsIGxvb3NlKS5taW5vcjtcbn1cblxuZXhwb3J0cy5wYXRjaCA9IHBhdGNoO1xuZnVuY3Rpb24gcGF0Y2goYSwgbG9vc2UpIHtcbiAgcmV0dXJuIG5ldyBTZW1WZXIoYSwgbG9vc2UpLnBhdGNoO1xufVxuXG5leHBvcnRzLmNvbXBhcmUgPSBjb21wYXJlO1xuZnVuY3Rpb24gY29tcGFyZShhLCBiLCBsb29zZSkge1xuICByZXR1cm4gbmV3IFNlbVZlcihhLCBsb29zZSkuY29tcGFyZShuZXcgU2VtVmVyKGIsIGxvb3NlKSk7XG59XG5cbmV4cG9ydHMuY29tcGFyZUxvb3NlID0gY29tcGFyZUxvb3NlO1xuZnVuY3Rpb24gY29tcGFyZUxvb3NlKGEsIGIpIHtcbiAgcmV0dXJuIGNvbXBhcmUoYSwgYiwgdHJ1ZSk7XG59XG5cbmV4cG9ydHMucmNvbXBhcmUgPSByY29tcGFyZTtcbmZ1bmN0aW9uIHJjb21wYXJlKGEsIGIsIGxvb3NlKSB7XG4gIHJldHVybiBjb21wYXJlKGIsIGEsIGxvb3NlKTtcbn1cblxuZXhwb3J0cy5zb3J0ID0gc29ydDtcbmZ1bmN0aW9uIHNvcnQobGlzdCwgbG9vc2UpIHtcbiAgcmV0dXJuIGxpc3Quc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgcmV0dXJuIGV4cG9ydHMuY29tcGFyZShhLCBiLCBsb29zZSk7XG4gIH0pO1xufVxuXG5leHBvcnRzLnJzb3J0ID0gcnNvcnQ7XG5mdW5jdGlvbiByc29ydChsaXN0LCBsb29zZSkge1xuICByZXR1cm4gbGlzdC5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICByZXR1cm4gZXhwb3J0cy5yY29tcGFyZShhLCBiLCBsb29zZSk7XG4gIH0pO1xufVxuXG5leHBvcnRzLmd0ID0gZ3Q7XG5mdW5jdGlvbiBndChhLCBiLCBsb29zZSkge1xuICByZXR1cm4gY29tcGFyZShhLCBiLCBsb29zZSkgPiAwO1xufVxuXG5leHBvcnRzLmx0ID0gbHQ7XG5mdW5jdGlvbiBsdChhLCBiLCBsb29zZSkge1xuICByZXR1cm4gY29tcGFyZShhLCBiLCBsb29zZSkgPCAwO1xufVxuXG5leHBvcnRzLmVxID0gZXE7XG5mdW5jdGlvbiBlcShhLCBiLCBsb29zZSkge1xuICByZXR1cm4gY29tcGFyZShhLCBiLCBsb29zZSkgPT09IDA7XG59XG5cbmV4cG9ydHMubmVxID0gbmVxO1xuZnVuY3Rpb24gbmVxKGEsIGIsIGxvb3NlKSB7XG4gIHJldHVybiBjb21wYXJlKGEsIGIsIGxvb3NlKSAhPT0gMDtcbn1cblxuZXhwb3J0cy5ndGUgPSBndGU7XG5mdW5jdGlvbiBndGUoYSwgYiwgbG9vc2UpIHtcbiAgcmV0dXJuIGNvbXBhcmUoYSwgYiwgbG9vc2UpID49IDA7XG59XG5cbmV4cG9ydHMubHRlID0gbHRlO1xuZnVuY3Rpb24gbHRlKGEsIGIsIGxvb3NlKSB7XG4gIHJldHVybiBjb21wYXJlKGEsIGIsIGxvb3NlKSA8PSAwO1xufVxuXG5leHBvcnRzLmNtcCA9IGNtcDtcbmZ1bmN0aW9uIGNtcChhLCBvcCwgYiwgbG9vc2UpIHtcbiAgdmFyIHJldDtcbiAgc3dpdGNoIChvcCkge1xuICAgIGNhc2UgJz09PSc6XG4gICAgICBpZiAodHlwZW9mIGEgPT09ICdvYmplY3QnKSBhID0gYS52ZXJzaW9uO1xuICAgICAgaWYgKHR5cGVvZiBiID09PSAnb2JqZWN0JykgYiA9IGIudmVyc2lvbjtcbiAgICAgIHJldCA9IGEgPT09IGI7XG4gICAgICBicmVhaztcbiAgICBjYXNlICchPT0nOlxuICAgICAgaWYgKHR5cGVvZiBhID09PSAnb2JqZWN0JykgYSA9IGEudmVyc2lvbjtcbiAgICAgIGlmICh0eXBlb2YgYiA9PT0gJ29iamVjdCcpIGIgPSBiLnZlcnNpb247XG4gICAgICByZXQgPSBhICE9PSBiO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnJzogY2FzZSAnPSc6IGNhc2UgJz09JzogcmV0ID0gZXEoYSwgYiwgbG9vc2UpOyBicmVhaztcbiAgICBjYXNlICchPSc6IHJldCA9IG5lcShhLCBiLCBsb29zZSk7IGJyZWFrO1xuICAgIGNhc2UgJz4nOiByZXQgPSBndChhLCBiLCBsb29zZSk7IGJyZWFrO1xuICAgIGNhc2UgJz49JzogcmV0ID0gZ3RlKGEsIGIsIGxvb3NlKTsgYnJlYWs7XG4gICAgY2FzZSAnPCc6IHJldCA9IGx0KGEsIGIsIGxvb3NlKTsgYnJlYWs7XG4gICAgY2FzZSAnPD0nOiByZXQgPSBsdGUoYSwgYiwgbG9vc2UpOyBicmVhaztcbiAgICBkZWZhdWx0OiB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIG9wZXJhdG9yOiAnICsgb3ApO1xuICB9XG4gIHJldHVybiByZXQ7XG59XG5cbmV4cG9ydHMuQ29tcGFyYXRvciA9IENvbXBhcmF0b3I7XG5mdW5jdGlvbiBDb21wYXJhdG9yKGNvbXAsIG9wdGlvbnMpIHtcbiAgaWYgKCFvcHRpb25zIHx8IHR5cGVvZiBvcHRpb25zICE9PSAnb2JqZWN0JylcbiAgICBvcHRpb25zID0geyBsb29zZTogISFvcHRpb25zLCBpbmNsdWRlUHJlcmVsZWFzZTogZmFsc2UgfVxuXG4gIGlmIChjb21wIGluc3RhbmNlb2YgQ29tcGFyYXRvcikge1xuICAgIGlmIChjb21wLmxvb3NlID09PSAhIW9wdGlvbnMubG9vc2UpXG4gICAgICByZXR1cm4gY29tcDtcbiAgICBlbHNlXG4gICAgICBjb21wID0gY29tcC52YWx1ZTtcbiAgfVxuXG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBDb21wYXJhdG9yKSlcbiAgICByZXR1cm4gbmV3IENvbXBhcmF0b3IoY29tcCwgb3B0aW9ucyk7XG5cbiAgZGVidWcoJ2NvbXBhcmF0b3InLCBjb21wLCBvcHRpb25zKTtcbiAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgdGhpcy5sb29zZSA9ICEhb3B0aW9ucy5sb29zZTtcbiAgdGhpcy5wYXJzZShjb21wKTtcblxuICBpZiAodGhpcy5zZW12ZXIgPT09IEFOWSlcbiAgICB0aGlzLnZhbHVlID0gJyc7XG4gIGVsc2VcbiAgICB0aGlzLnZhbHVlID0gdGhpcy5vcGVyYXRvciArIHRoaXMuc2VtdmVyLnZlcnNpb247XG5cbiAgZGVidWcoJ2NvbXAnLCB0aGlzKTtcbn1cblxudmFyIEFOWSA9IHt9O1xuQ29tcGFyYXRvci5wcm90b3R5cGUucGFyc2UgPSBmdW5jdGlvbihjb21wKSB7XG4gIHZhciByID0gdGhpcy5vcHRpb25zLmxvb3NlID8gcmVbQ09NUEFSQVRPUkxPT1NFXSA6IHJlW0NPTVBBUkFUT1JdO1xuICB2YXIgbSA9IGNvbXAubWF0Y2gocik7XG5cbiAgaWYgKCFtKVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgY29tcGFyYXRvcjogJyArIGNvbXApO1xuXG4gIHRoaXMub3BlcmF0b3IgPSBtWzFdO1xuICBpZiAodGhpcy5vcGVyYXRvciA9PT0gJz0nKVxuICAgIHRoaXMub3BlcmF0b3IgPSAnJztcblxuICAvLyBpZiBpdCBsaXRlcmFsbHkgaXMganVzdCAnPicgb3IgJycgdGhlbiBhbGxvdyBhbnl0aGluZy5cbiAgaWYgKCFtWzJdKVxuICAgIHRoaXMuc2VtdmVyID0gQU5ZO1xuICBlbHNlXG4gICAgdGhpcy5zZW12ZXIgPSBuZXcgU2VtVmVyKG1bMl0sIHRoaXMub3B0aW9ucy5sb29zZSk7XG59O1xuXG5Db21wYXJhdG9yLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy52YWx1ZTtcbn07XG5cbkNvbXBhcmF0b3IucHJvdG90eXBlLnRlc3QgPSBmdW5jdGlvbih2ZXJzaW9uKSB7XG4gIGRlYnVnKCdDb21wYXJhdG9yLnRlc3QnLCB2ZXJzaW9uLCB0aGlzLm9wdGlvbnMubG9vc2UpO1xuXG4gIGlmICh0aGlzLnNlbXZlciA9PT0gQU5ZKVxuICAgIHJldHVybiB0cnVlO1xuXG4gIGlmICh0eXBlb2YgdmVyc2lvbiA9PT0gJ3N0cmluZycpXG4gICAgdmVyc2lvbiA9IG5ldyBTZW1WZXIodmVyc2lvbiwgdGhpcy5vcHRpb25zKTtcblxuICByZXR1cm4gY21wKHZlcnNpb24sIHRoaXMub3BlcmF0b3IsIHRoaXMuc2VtdmVyLCB0aGlzLm9wdGlvbnMpO1xufTtcblxuQ29tcGFyYXRvci5wcm90b3R5cGUuaW50ZXJzZWN0cyA9IGZ1bmN0aW9uKGNvbXAsIG9wdGlvbnMpIHtcbiAgaWYgKCEoY29tcCBpbnN0YW5jZW9mIENvbXBhcmF0b3IpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignYSBDb21wYXJhdG9yIGlzIHJlcXVpcmVkJyk7XG4gIH1cblxuICBpZiAoIW9wdGlvbnMgfHwgdHlwZW9mIG9wdGlvbnMgIT09ICdvYmplY3QnKVxuICAgIG9wdGlvbnMgPSB7IGxvb3NlOiAhIW9wdGlvbnMsIGluY2x1ZGVQcmVyZWxlYXNlOiBmYWxzZSB9XG5cbiAgdmFyIHJhbmdlVG1wO1xuXG4gIGlmICh0aGlzLm9wZXJhdG9yID09PSAnJykge1xuICAgIHJhbmdlVG1wID0gbmV3IFJhbmdlKGNvbXAudmFsdWUsIG9wdGlvbnMpO1xuICAgIHJldHVybiBzYXRpc2ZpZXModGhpcy52YWx1ZSwgcmFuZ2VUbXAsIG9wdGlvbnMpO1xuICB9IGVsc2UgaWYgKGNvbXAub3BlcmF0b3IgPT09ICcnKSB7XG4gICAgcmFuZ2VUbXAgPSBuZXcgUmFuZ2UodGhpcy52YWx1ZSwgb3B0aW9ucyk7XG4gICAgcmV0dXJuIHNhdGlzZmllcyhjb21wLnNlbXZlciwgcmFuZ2VUbXAsIG9wdGlvbnMpO1xuICB9XG5cbiAgdmFyIHNhbWVEaXJlY3Rpb25JbmNyZWFzaW5nID1cbiAgICAodGhpcy5vcGVyYXRvciA9PT0gJz49JyB8fCB0aGlzLm9wZXJhdG9yID09PSAnPicpICYmXG4gICAgKGNvbXAub3BlcmF0b3IgPT09ICc+PScgfHwgY29tcC5vcGVyYXRvciA9PT0gJz4nKTtcbiAgdmFyIHNhbWVEaXJlY3Rpb25EZWNyZWFzaW5nID1cbiAgICAodGhpcy5vcGVyYXRvciA9PT0gJzw9JyB8fCB0aGlzLm9wZXJhdG9yID09PSAnPCcpICYmXG4gICAgKGNvbXAub3BlcmF0b3IgPT09ICc8PScgfHwgY29tcC5vcGVyYXRvciA9PT0gJzwnKTtcbiAgdmFyIHNhbWVTZW1WZXIgPSB0aGlzLnNlbXZlci52ZXJzaW9uID09PSBjb21wLnNlbXZlci52ZXJzaW9uO1xuICB2YXIgZGlmZmVyZW50RGlyZWN0aW9uc0luY2x1c2l2ZSA9XG4gICAgKHRoaXMub3BlcmF0b3IgPT09ICc+PScgfHwgdGhpcy5vcGVyYXRvciA9PT0gJzw9JykgJiZcbiAgICAoY29tcC5vcGVyYXRvciA9PT0gJz49JyB8fCBjb21wLm9wZXJhdG9yID09PSAnPD0nKTtcbiAgdmFyIG9wcG9zaXRlRGlyZWN0aW9uc0xlc3NUaGFuID1cbiAgICBjbXAodGhpcy5zZW12ZXIsICc8JywgY29tcC5zZW12ZXIsIG9wdGlvbnMpICYmXG4gICAgKCh0aGlzLm9wZXJhdG9yID09PSAnPj0nIHx8IHRoaXMub3BlcmF0b3IgPT09ICc+JykgJiZcbiAgICAoY29tcC5vcGVyYXRvciA9PT0gJzw9JyB8fCBjb21wLm9wZXJhdG9yID09PSAnPCcpKTtcbiAgdmFyIG9wcG9zaXRlRGlyZWN0aW9uc0dyZWF0ZXJUaGFuID1cbiAgICBjbXAodGhpcy5zZW12ZXIsICc+JywgY29tcC5zZW12ZXIsIG9wdGlvbnMpICYmXG4gICAgKCh0aGlzLm9wZXJhdG9yID09PSAnPD0nIHx8IHRoaXMub3BlcmF0b3IgPT09ICc8JykgJiZcbiAgICAoY29tcC5vcGVyYXRvciA9PT0gJz49JyB8fCBjb21wLm9wZXJhdG9yID09PSAnPicpKTtcblxuICByZXR1cm4gc2FtZURpcmVjdGlvbkluY3JlYXNpbmcgfHwgc2FtZURpcmVjdGlvbkRlY3JlYXNpbmcgfHxcbiAgICAoc2FtZVNlbVZlciAmJiBkaWZmZXJlbnREaXJlY3Rpb25zSW5jbHVzaXZlKSB8fFxuICAgIG9wcG9zaXRlRGlyZWN0aW9uc0xlc3NUaGFuIHx8IG9wcG9zaXRlRGlyZWN0aW9uc0dyZWF0ZXJUaGFuO1xufTtcblxuXG5leHBvcnRzLlJhbmdlID0gUmFuZ2U7XG5mdW5jdGlvbiBSYW5nZShyYW5nZSwgb3B0aW9ucykge1xuICBpZiAoIW9wdGlvbnMgfHwgdHlwZW9mIG9wdGlvbnMgIT09ICdvYmplY3QnKVxuICAgIG9wdGlvbnMgPSB7IGxvb3NlOiAhIW9wdGlvbnMsIGluY2x1ZGVQcmVyZWxlYXNlOiBmYWxzZSB9XG5cbiAgaWYgKHJhbmdlIGluc3RhbmNlb2YgUmFuZ2UpIHtcbiAgICBpZiAocmFuZ2UubG9vc2UgPT09ICEhb3B0aW9ucy5sb29zZSAmJlxuICAgICAgICByYW5nZS5pbmNsdWRlUHJlcmVsZWFzZSA9PT0gISFvcHRpb25zLmluY2x1ZGVQcmVyZWxlYXNlKSB7XG4gICAgICByZXR1cm4gcmFuZ2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBuZXcgUmFuZ2UocmFuZ2UucmF3LCBvcHRpb25zKTtcbiAgICB9XG4gIH1cblxuICBpZiAocmFuZ2UgaW5zdGFuY2VvZiBDb21wYXJhdG9yKSB7XG4gICAgcmV0dXJuIG5ldyBSYW5nZShyYW5nZS52YWx1ZSwgb3B0aW9ucyk7XG4gIH1cblxuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgUmFuZ2UpKVxuICAgIHJldHVybiBuZXcgUmFuZ2UocmFuZ2UsIG9wdGlvbnMpO1xuXG4gIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gIHRoaXMubG9vc2UgPSAhIW9wdGlvbnMubG9vc2U7XG4gIHRoaXMuaW5jbHVkZVByZXJlbGVhc2UgPSAhIW9wdGlvbnMuaW5jbHVkZVByZXJlbGVhc2VcblxuICAvLyBGaXJzdCwgc3BsaXQgYmFzZWQgb24gYm9vbGVhbiBvciB8fFxuICB0aGlzLnJhdyA9IHJhbmdlO1xuICB0aGlzLnNldCA9IHJhbmdlLnNwbGl0KC9cXHMqXFx8XFx8XFxzKi8pLm1hcChmdW5jdGlvbihyYW5nZSkge1xuICAgIHJldHVybiB0aGlzLnBhcnNlUmFuZ2UocmFuZ2UudHJpbSgpKTtcbiAgfSwgdGhpcykuZmlsdGVyKGZ1bmN0aW9uKGMpIHtcbiAgICAvLyB0aHJvdyBvdXQgYW55IHRoYXQgYXJlIG5vdCByZWxldmFudCBmb3Igd2hhdGV2ZXIgcmVhc29uXG4gICAgcmV0dXJuIGMubGVuZ3RoO1xuICB9KTtcblxuICBpZiAoIXRoaXMuc2V0Lmxlbmd0aCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgU2VtVmVyIFJhbmdlOiAnICsgcmFuZ2UpO1xuICB9XG5cbiAgdGhpcy5mb3JtYXQoKTtcbn1cblxuUmFuZ2UucHJvdG90eXBlLmZvcm1hdCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnJhbmdlID0gdGhpcy5zZXQubWFwKGZ1bmN0aW9uKGNvbXBzKSB7XG4gICAgcmV0dXJuIGNvbXBzLmpvaW4oJyAnKS50cmltKCk7XG4gIH0pLmpvaW4oJ3x8JykudHJpbSgpO1xuICByZXR1cm4gdGhpcy5yYW5nZTtcbn07XG5cblJhbmdlLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5yYW5nZTtcbn07XG5cblJhbmdlLnByb3RvdHlwZS5wYXJzZVJhbmdlID0gZnVuY3Rpb24ocmFuZ2UpIHtcbiAgdmFyIGxvb3NlID0gdGhpcy5vcHRpb25zLmxvb3NlO1xuICByYW5nZSA9IHJhbmdlLnRyaW0oKTtcbiAgLy8gYDEuMi4zIC0gMS4yLjRgID0+IGA+PTEuMi4zIDw9MS4yLjRgXG4gIHZhciBociA9IGxvb3NlID8gcmVbSFlQSEVOUkFOR0VMT09TRV0gOiByZVtIWVBIRU5SQU5HRV07XG4gIHJhbmdlID0gcmFuZ2UucmVwbGFjZShociwgaHlwaGVuUmVwbGFjZSk7XG4gIGRlYnVnKCdoeXBoZW4gcmVwbGFjZScsIHJhbmdlKTtcbiAgLy8gYD4gMS4yLjMgPCAxLjIuNWAgPT4gYD4xLjIuMyA8MS4yLjVgXG4gIHJhbmdlID0gcmFuZ2UucmVwbGFjZShyZVtDT01QQVJBVE9SVFJJTV0sIGNvbXBhcmF0b3JUcmltUmVwbGFjZSk7XG4gIGRlYnVnKCdjb21wYXJhdG9yIHRyaW0nLCByYW5nZSwgcmVbQ09NUEFSQVRPUlRSSU1dKTtcblxuICAvLyBgfiAxLjIuM2AgPT4gYH4xLjIuM2BcbiAgcmFuZ2UgPSByYW5nZS5yZXBsYWNlKHJlW1RJTERFVFJJTV0sIHRpbGRlVHJpbVJlcGxhY2UpO1xuXG4gIC8vIGBeIDEuMi4zYCA9PiBgXjEuMi4zYFxuICByYW5nZSA9IHJhbmdlLnJlcGxhY2UocmVbQ0FSRVRUUklNXSwgY2FyZXRUcmltUmVwbGFjZSk7XG5cbiAgLy8gbm9ybWFsaXplIHNwYWNlc1xuICByYW5nZSA9IHJhbmdlLnNwbGl0KC9cXHMrLykuam9pbignICcpO1xuXG4gIC8vIEF0IHRoaXMgcG9pbnQsIHRoZSByYW5nZSBpcyBjb21wbGV0ZWx5IHRyaW1tZWQgYW5kXG4gIC8vIHJlYWR5IHRvIGJlIHNwbGl0IGludG8gY29tcGFyYXRvcnMuXG5cbiAgdmFyIGNvbXBSZSA9IGxvb3NlID8gcmVbQ09NUEFSQVRPUkxPT1NFXSA6IHJlW0NPTVBBUkFUT1JdO1xuICB2YXIgc2V0ID0gcmFuZ2Uuc3BsaXQoJyAnKS5tYXAoZnVuY3Rpb24oY29tcCkge1xuICAgIHJldHVybiBwYXJzZUNvbXBhcmF0b3IoY29tcCwgdGhpcy5vcHRpb25zKTtcbiAgfSwgdGhpcykuam9pbignICcpLnNwbGl0KC9cXHMrLyk7XG4gIGlmICh0aGlzLm9wdGlvbnMubG9vc2UpIHtcbiAgICAvLyBpbiBsb29zZSBtb2RlLCB0aHJvdyBvdXQgYW55IHRoYXQgYXJlIG5vdCB2YWxpZCBjb21wYXJhdG9yc1xuICAgIHNldCA9IHNldC5maWx0ZXIoZnVuY3Rpb24oY29tcCkge1xuICAgICAgcmV0dXJuICEhY29tcC5tYXRjaChjb21wUmUpO1xuICAgIH0pO1xuICB9XG4gIHNldCA9IHNldC5tYXAoZnVuY3Rpb24oY29tcCkge1xuICAgIHJldHVybiBuZXcgQ29tcGFyYXRvcihjb21wLCB0aGlzLm9wdGlvbnMpO1xuICB9LCB0aGlzKTtcblxuICByZXR1cm4gc2V0O1xufTtcblxuUmFuZ2UucHJvdG90eXBlLmludGVyc2VjdHMgPSBmdW5jdGlvbihyYW5nZSwgb3B0aW9ucykge1xuICBpZiAoIShyYW5nZSBpbnN0YW5jZW9mIFJhbmdlKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2EgUmFuZ2UgaXMgcmVxdWlyZWQnKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzLnNldC5zb21lKGZ1bmN0aW9uKHRoaXNDb21wYXJhdG9ycykge1xuICAgIHJldHVybiB0aGlzQ29tcGFyYXRvcnMuZXZlcnkoZnVuY3Rpb24odGhpc0NvbXBhcmF0b3IpIHtcbiAgICAgIHJldHVybiByYW5nZS5zZXQuc29tZShmdW5jdGlvbihyYW5nZUNvbXBhcmF0b3JzKSB7XG4gICAgICAgIHJldHVybiByYW5nZUNvbXBhcmF0b3JzLmV2ZXJ5KGZ1bmN0aW9uKHJhbmdlQ29tcGFyYXRvcikge1xuICAgICAgICAgIHJldHVybiB0aGlzQ29tcGFyYXRvci5pbnRlcnNlY3RzKHJhbmdlQ29tcGFyYXRvciwgb3B0aW9ucyk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xufTtcblxuLy8gTW9zdGx5IGp1c3QgZm9yIHRlc3RpbmcgYW5kIGxlZ2FjeSBBUEkgcmVhc29uc1xuZXhwb3J0cy50b0NvbXBhcmF0b3JzID0gdG9Db21wYXJhdG9ycztcbmZ1bmN0aW9uIHRvQ29tcGFyYXRvcnMocmFuZ2UsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIG5ldyBSYW5nZShyYW5nZSwgb3B0aW9ucykuc2V0Lm1hcChmdW5jdGlvbihjb21wKSB7XG4gICAgcmV0dXJuIGNvbXAubWFwKGZ1bmN0aW9uKGMpIHtcbiAgICAgIHJldHVybiBjLnZhbHVlO1xuICAgIH0pLmpvaW4oJyAnKS50cmltKCkuc3BsaXQoJyAnKTtcbiAgfSk7XG59XG5cbi8vIGNvbXByaXNlZCBvZiB4cmFuZ2VzLCB0aWxkZXMsIHN0YXJzLCBhbmQgZ3RsdCdzIGF0IHRoaXMgcG9pbnQuXG4vLyBhbHJlYWR5IHJlcGxhY2VkIHRoZSBoeXBoZW4gcmFuZ2VzXG4vLyB0dXJuIGludG8gYSBzZXQgb2YgSlVTVCBjb21wYXJhdG9ycy5cbmZ1bmN0aW9uIHBhcnNlQ29tcGFyYXRvcihjb21wLCBvcHRpb25zKSB7XG4gIGRlYnVnKCdjb21wJywgY29tcCwgb3B0aW9ucyk7XG4gIGNvbXAgPSByZXBsYWNlQ2FyZXRzKGNvbXAsIG9wdGlvbnMpO1xuICBkZWJ1ZygnY2FyZXQnLCBjb21wKTtcbiAgY29tcCA9IHJlcGxhY2VUaWxkZXMoY29tcCwgb3B0aW9ucyk7XG4gIGRlYnVnKCd0aWxkZXMnLCBjb21wKTtcbiAgY29tcCA9IHJlcGxhY2VYUmFuZ2VzKGNvbXAsIG9wdGlvbnMpO1xuICBkZWJ1ZygneHJhbmdlJywgY29tcCk7XG4gIGNvbXAgPSByZXBsYWNlU3RhcnMoY29tcCwgb3B0aW9ucyk7XG4gIGRlYnVnKCdzdGFycycsIGNvbXApO1xuICByZXR1cm4gY29tcDtcbn1cblxuZnVuY3Rpb24gaXNYKGlkKSB7XG4gIHJldHVybiAhaWQgfHwgaWQudG9Mb3dlckNhc2UoKSA9PT0gJ3gnIHx8IGlkID09PSAnKic7XG59XG5cbi8vIH4sIH4+IC0tPiAqIChhbnksIGtpbmRhIHNpbGx5KVxuLy8gfjIsIH4yLngsIH4yLngueCwgfj4yLCB+PjIueCB+PjIueC54IC0tPiA+PTIuMC4wIDwzLjAuMFxuLy8gfjIuMCwgfjIuMC54LCB+PjIuMCwgfj4yLjAueCAtLT4gPj0yLjAuMCA8Mi4xLjBcbi8vIH4xLjIsIH4xLjIueCwgfj4xLjIsIH4+MS4yLnggLS0+ID49MS4yLjAgPDEuMy4wXG4vLyB+MS4yLjMsIH4+MS4yLjMgLS0+ID49MS4yLjMgPDEuMy4wXG4vLyB+MS4yLjAsIH4+MS4yLjAgLS0+ID49MS4yLjAgPDEuMy4wXG5mdW5jdGlvbiByZXBsYWNlVGlsZGVzKGNvbXAsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIGNvbXAudHJpbSgpLnNwbGl0KC9cXHMrLykubWFwKGZ1bmN0aW9uKGNvbXApIHtcbiAgICByZXR1cm4gcmVwbGFjZVRpbGRlKGNvbXAsIG9wdGlvbnMpO1xuICB9KS5qb2luKCcgJyk7XG59XG5cbmZ1bmN0aW9uIHJlcGxhY2VUaWxkZShjb21wLCBvcHRpb25zKSB7XG4gIGlmICghb3B0aW9ucyB8fCB0eXBlb2Ygb3B0aW9ucyAhPT0gJ29iamVjdCcpXG4gICAgb3B0aW9ucyA9IHsgbG9vc2U6ICEhb3B0aW9ucywgaW5jbHVkZVByZXJlbGVhc2U6IGZhbHNlIH1cbiAgdmFyIHIgPSBvcHRpb25zLmxvb3NlID8gcmVbVElMREVMT09TRV0gOiByZVtUSUxERV07XG4gIHJldHVybiBjb21wLnJlcGxhY2UociwgZnVuY3Rpb24oXywgTSwgbSwgcCwgcHIpIHtcbiAgICBkZWJ1ZygndGlsZGUnLCBjb21wLCBfLCBNLCBtLCBwLCBwcik7XG4gICAgdmFyIHJldDtcblxuICAgIGlmIChpc1goTSkpXG4gICAgICByZXQgPSAnJztcbiAgICBlbHNlIGlmIChpc1gobSkpXG4gICAgICByZXQgPSAnPj0nICsgTSArICcuMC4wIDwnICsgKCtNICsgMSkgKyAnLjAuMCc7XG4gICAgZWxzZSBpZiAoaXNYKHApKVxuICAgICAgLy8gfjEuMiA9PSA+PTEuMi4wIDwxLjMuMFxuICAgICAgcmV0ID0gJz49JyArIE0gKyAnLicgKyBtICsgJy4wIDwnICsgTSArICcuJyArICgrbSArIDEpICsgJy4wJztcbiAgICBlbHNlIGlmIChwcikge1xuICAgICAgZGVidWcoJ3JlcGxhY2VUaWxkZSBwcicsIHByKTtcbiAgICAgIGlmIChwci5jaGFyQXQoMCkgIT09ICctJylcbiAgICAgICAgcHIgPSAnLScgKyBwcjtcbiAgICAgIHJldCA9ICc+PScgKyBNICsgJy4nICsgbSArICcuJyArIHAgKyBwciArXG4gICAgICAgICAgICAnIDwnICsgTSArICcuJyArICgrbSArIDEpICsgJy4wJztcbiAgICB9IGVsc2VcbiAgICAgIC8vIH4xLjIuMyA9PSA+PTEuMi4zIDwxLjMuMFxuICAgICAgcmV0ID0gJz49JyArIE0gKyAnLicgKyBtICsgJy4nICsgcCArXG4gICAgICAgICAgICAnIDwnICsgTSArICcuJyArICgrbSArIDEpICsgJy4wJztcblxuICAgIGRlYnVnKCd0aWxkZSByZXR1cm4nLCByZXQpO1xuICAgIHJldHVybiByZXQ7XG4gIH0pO1xufVxuXG4vLyBeIC0tPiAqIChhbnksIGtpbmRhIHNpbGx5KVxuLy8gXjIsIF4yLngsIF4yLngueCAtLT4gPj0yLjAuMCA8My4wLjBcbi8vIF4yLjAsIF4yLjAueCAtLT4gPj0yLjAuMCA8My4wLjBcbi8vIF4xLjIsIF4xLjIueCAtLT4gPj0xLjIuMCA8Mi4wLjBcbi8vIF4xLjIuMyAtLT4gPj0xLjIuMyA8Mi4wLjBcbi8vIF4xLjIuMCAtLT4gPj0xLjIuMCA8Mi4wLjBcbmZ1bmN0aW9uIHJlcGxhY2VDYXJldHMoY29tcCwgb3B0aW9ucykge1xuICByZXR1cm4gY29tcC50cmltKCkuc3BsaXQoL1xccysvKS5tYXAoZnVuY3Rpb24oY29tcCkge1xuICAgIHJldHVybiByZXBsYWNlQ2FyZXQoY29tcCwgb3B0aW9ucyk7XG4gIH0pLmpvaW4oJyAnKTtcbn1cblxuZnVuY3Rpb24gcmVwbGFjZUNhcmV0KGNvbXAsIG9wdGlvbnMpIHtcbiAgZGVidWcoJ2NhcmV0JywgY29tcCwgb3B0aW9ucyk7XG4gIGlmICghb3B0aW9ucyB8fCB0eXBlb2Ygb3B0aW9ucyAhPT0gJ29iamVjdCcpXG4gICAgb3B0aW9ucyA9IHsgbG9vc2U6ICEhb3B0aW9ucywgaW5jbHVkZVByZXJlbGVhc2U6IGZhbHNlIH1cbiAgdmFyIHIgPSBvcHRpb25zLmxvb3NlID8gcmVbQ0FSRVRMT09TRV0gOiByZVtDQVJFVF07XG4gIHJldHVybiBjb21wLnJlcGxhY2UociwgZnVuY3Rpb24oXywgTSwgbSwgcCwgcHIpIHtcbiAgICBkZWJ1ZygnY2FyZXQnLCBjb21wLCBfLCBNLCBtLCBwLCBwcik7XG4gICAgdmFyIHJldDtcblxuICAgIGlmIChpc1goTSkpXG4gICAgICByZXQgPSAnJztcbiAgICBlbHNlIGlmIChpc1gobSkpXG4gICAgICByZXQgPSAnPj0nICsgTSArICcuMC4wIDwnICsgKCtNICsgMSkgKyAnLjAuMCc7XG4gICAgZWxzZSBpZiAoaXNYKHApKSB7XG4gICAgICBpZiAoTSA9PT0gJzAnKVxuICAgICAgICByZXQgPSAnPj0nICsgTSArICcuJyArIG0gKyAnLjAgPCcgKyBNICsgJy4nICsgKCttICsgMSkgKyAnLjAnO1xuICAgICAgZWxzZVxuICAgICAgICByZXQgPSAnPj0nICsgTSArICcuJyArIG0gKyAnLjAgPCcgKyAoK00gKyAxKSArICcuMC4wJztcbiAgICB9IGVsc2UgaWYgKHByKSB7XG4gICAgICBkZWJ1ZygncmVwbGFjZUNhcmV0IHByJywgcHIpO1xuICAgICAgaWYgKHByLmNoYXJBdCgwKSAhPT0gJy0nKVxuICAgICAgICBwciA9ICctJyArIHByO1xuICAgICAgaWYgKE0gPT09ICcwJykge1xuICAgICAgICBpZiAobSA9PT0gJzAnKVxuICAgICAgICAgIHJldCA9ICc+PScgKyBNICsgJy4nICsgbSArICcuJyArIHAgKyBwciArXG4gICAgICAgICAgICAgICAgJyA8JyArIE0gKyAnLicgKyBtICsgJy4nICsgKCtwICsgMSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICByZXQgPSAnPj0nICsgTSArICcuJyArIG0gKyAnLicgKyBwICsgcHIgK1xuICAgICAgICAgICAgICAgICcgPCcgKyBNICsgJy4nICsgKCttICsgMSkgKyAnLjAnO1xuICAgICAgfSBlbHNlXG4gICAgICAgIHJldCA9ICc+PScgKyBNICsgJy4nICsgbSArICcuJyArIHAgKyBwciArXG4gICAgICAgICAgICAgICcgPCcgKyAoK00gKyAxKSArICcuMC4wJztcbiAgICB9IGVsc2Uge1xuICAgICAgZGVidWcoJ25vIHByJyk7XG4gICAgICBpZiAoTSA9PT0gJzAnKSB7XG4gICAgICAgIGlmIChtID09PSAnMCcpXG4gICAgICAgICAgcmV0ID0gJz49JyArIE0gKyAnLicgKyBtICsgJy4nICsgcCArXG4gICAgICAgICAgICAgICAgJyA8JyArIE0gKyAnLicgKyBtICsgJy4nICsgKCtwICsgMSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICByZXQgPSAnPj0nICsgTSArICcuJyArIG0gKyAnLicgKyBwICtcbiAgICAgICAgICAgICAgICAnIDwnICsgTSArICcuJyArICgrbSArIDEpICsgJy4wJztcbiAgICAgIH0gZWxzZVxuICAgICAgICByZXQgPSAnPj0nICsgTSArICcuJyArIG0gKyAnLicgKyBwICtcbiAgICAgICAgICAgICAgJyA8JyArICgrTSArIDEpICsgJy4wLjAnO1xuICAgIH1cblxuICAgIGRlYnVnKCdjYXJldCByZXR1cm4nLCByZXQpO1xuICAgIHJldHVybiByZXQ7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiByZXBsYWNlWFJhbmdlcyhjb21wLCBvcHRpb25zKSB7XG4gIGRlYnVnKCdyZXBsYWNlWFJhbmdlcycsIGNvbXAsIG9wdGlvbnMpO1xuICByZXR1cm4gY29tcC5zcGxpdCgvXFxzKy8pLm1hcChmdW5jdGlvbihjb21wKSB7XG4gICAgcmV0dXJuIHJlcGxhY2VYUmFuZ2UoY29tcCwgb3B0aW9ucyk7XG4gIH0pLmpvaW4oJyAnKTtcbn1cblxuZnVuY3Rpb24gcmVwbGFjZVhSYW5nZShjb21wLCBvcHRpb25zKSB7XG4gIGNvbXAgPSBjb21wLnRyaW0oKTtcbiAgaWYgKCFvcHRpb25zIHx8IHR5cGVvZiBvcHRpb25zICE9PSAnb2JqZWN0JylcbiAgICBvcHRpb25zID0geyBsb29zZTogISFvcHRpb25zLCBpbmNsdWRlUHJlcmVsZWFzZTogZmFsc2UgfVxuICB2YXIgciA9IG9wdGlvbnMubG9vc2UgPyByZVtYUkFOR0VMT09TRV0gOiByZVtYUkFOR0VdO1xuICByZXR1cm4gY29tcC5yZXBsYWNlKHIsIGZ1bmN0aW9uKHJldCwgZ3RsdCwgTSwgbSwgcCwgcHIpIHtcbiAgICBkZWJ1ZygneFJhbmdlJywgY29tcCwgcmV0LCBndGx0LCBNLCBtLCBwLCBwcik7XG4gICAgdmFyIHhNID0gaXNYKE0pO1xuICAgIHZhciB4bSA9IHhNIHx8IGlzWChtKTtcbiAgICB2YXIgeHAgPSB4bSB8fCBpc1gocCk7XG4gICAgdmFyIGFueVggPSB4cDtcblxuICAgIGlmIChndGx0ID09PSAnPScgJiYgYW55WClcbiAgICAgIGd0bHQgPSAnJztcblxuICAgIGlmICh4TSkge1xuICAgICAgaWYgKGd0bHQgPT09ICc+JyB8fCBndGx0ID09PSAnPCcpIHtcbiAgICAgICAgLy8gbm90aGluZyBpcyBhbGxvd2VkXG4gICAgICAgIHJldCA9ICc8MC4wLjAnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gbm90aGluZyBpcyBmb3JiaWRkZW5cbiAgICAgICAgcmV0ID0gJyonO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoZ3RsdCAmJiBhbnlYKSB7XG4gICAgICAvLyByZXBsYWNlIFggd2l0aCAwXG4gICAgICBpZiAoeG0pXG4gICAgICAgIG0gPSAwO1xuICAgICAgaWYgKHhwKVxuICAgICAgICBwID0gMDtcblxuICAgICAgaWYgKGd0bHQgPT09ICc+Jykge1xuICAgICAgICAvLyA+MSA9PiA+PTIuMC4wXG4gICAgICAgIC8vID4xLjIgPT4gPj0xLjMuMFxuICAgICAgICAvLyA+MS4yLjMgPT4gPj0gMS4yLjRcbiAgICAgICAgZ3RsdCA9ICc+PSc7XG4gICAgICAgIGlmICh4bSkge1xuICAgICAgICAgIE0gPSArTSArIDE7XG4gICAgICAgICAgbSA9IDA7XG4gICAgICAgICAgcCA9IDA7XG4gICAgICAgIH0gZWxzZSBpZiAoeHApIHtcbiAgICAgICAgICBtID0gK20gKyAxO1xuICAgICAgICAgIHAgPSAwO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGd0bHQgPT09ICc8PScpIHtcbiAgICAgICAgLy8gPD0wLjcueCBpcyBhY3R1YWxseSA8MC44LjAsIHNpbmNlIGFueSAwLjcueCBzaG91bGRcbiAgICAgICAgLy8gcGFzcy4gIFNpbWlsYXJseSwgPD03LnggaXMgYWN0dWFsbHkgPDguMC4wLCBldGMuXG4gICAgICAgIGd0bHQgPSAnPCc7XG4gICAgICAgIGlmICh4bSlcbiAgICAgICAgICBNID0gK00gKyAxO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgbSA9ICttICsgMTtcbiAgICAgIH1cblxuICAgICAgcmV0ID0gZ3RsdCArIE0gKyAnLicgKyBtICsgJy4nICsgcDtcbiAgICB9IGVsc2UgaWYgKHhtKSB7XG4gICAgICByZXQgPSAnPj0nICsgTSArICcuMC4wIDwnICsgKCtNICsgMSkgKyAnLjAuMCc7XG4gICAgfSBlbHNlIGlmICh4cCkge1xuICAgICAgcmV0ID0gJz49JyArIE0gKyAnLicgKyBtICsgJy4wIDwnICsgTSArICcuJyArICgrbSArIDEpICsgJy4wJztcbiAgICB9XG5cbiAgICBkZWJ1ZygneFJhbmdlIHJldHVybicsIHJldCk7XG5cbiAgICByZXR1cm4gcmV0O1xuICB9KTtcbn1cblxuLy8gQmVjYXVzZSAqIGlzIEFORC1lZCB3aXRoIGV2ZXJ5dGhpbmcgZWxzZSBpbiB0aGUgY29tcGFyYXRvcixcbi8vIGFuZCAnJyBtZWFucyBcImFueSB2ZXJzaW9uXCIsIGp1c3QgcmVtb3ZlIHRoZSAqcyBlbnRpcmVseS5cbmZ1bmN0aW9uIHJlcGxhY2VTdGFycyhjb21wLCBvcHRpb25zKSB7XG4gIGRlYnVnKCdyZXBsYWNlU3RhcnMnLCBjb21wLCBvcHRpb25zKTtcbiAgLy8gTG9vc2VuZXNzIGlzIGlnbm9yZWQgaGVyZS4gIHN0YXIgaXMgYWx3YXlzIGFzIGxvb3NlIGFzIGl0IGdldHMhXG4gIHJldHVybiBjb21wLnRyaW0oKS5yZXBsYWNlKHJlW1NUQVJdLCAnJyk7XG59XG5cbi8vIFRoaXMgZnVuY3Rpb24gaXMgcGFzc2VkIHRvIHN0cmluZy5yZXBsYWNlKHJlW0hZUEhFTlJBTkdFXSlcbi8vIE0sIG0sIHBhdGNoLCBwcmVyZWxlYXNlLCBidWlsZFxuLy8gMS4yIC0gMy40LjUgPT4gPj0xLjIuMCA8PTMuNC41XG4vLyAxLjIuMyAtIDMuNCA9PiA+PTEuMi4wIDwzLjUuMCBBbnkgMy40Lnggd2lsbCBkb1xuLy8gMS4yIC0gMy40ID0+ID49MS4yLjAgPDMuNS4wXG5mdW5jdGlvbiBoeXBoZW5SZXBsYWNlKCQwLFxuICAgICAgICAgICAgICAgICAgICAgICBmcm9tLCBmTSwgZm0sIGZwLCBmcHIsIGZiLFxuICAgICAgICAgICAgICAgICAgICAgICB0bywgdE0sIHRtLCB0cCwgdHByLCB0Yikge1xuXG4gIGlmIChpc1goZk0pKVxuICAgIGZyb20gPSAnJztcbiAgZWxzZSBpZiAoaXNYKGZtKSlcbiAgICBmcm9tID0gJz49JyArIGZNICsgJy4wLjAnO1xuICBlbHNlIGlmIChpc1goZnApKVxuICAgIGZyb20gPSAnPj0nICsgZk0gKyAnLicgKyBmbSArICcuMCc7XG4gIGVsc2VcbiAgICBmcm9tID0gJz49JyArIGZyb207XG5cbiAgaWYgKGlzWCh0TSkpXG4gICAgdG8gPSAnJztcbiAgZWxzZSBpZiAoaXNYKHRtKSlcbiAgICB0byA9ICc8JyArICgrdE0gKyAxKSArICcuMC4wJztcbiAgZWxzZSBpZiAoaXNYKHRwKSlcbiAgICB0byA9ICc8JyArIHRNICsgJy4nICsgKCt0bSArIDEpICsgJy4wJztcbiAgZWxzZSBpZiAodHByKVxuICAgIHRvID0gJzw9JyArIHRNICsgJy4nICsgdG0gKyAnLicgKyB0cCArICctJyArIHRwcjtcbiAgZWxzZVxuICAgIHRvID0gJzw9JyArIHRvO1xuXG4gIHJldHVybiAoZnJvbSArICcgJyArIHRvKS50cmltKCk7XG59XG5cblxuLy8gaWYgQU5ZIG9mIHRoZSBzZXRzIG1hdGNoIEFMTCBvZiBpdHMgY29tcGFyYXRvcnMsIHRoZW4gcGFzc1xuUmFuZ2UucHJvdG90eXBlLnRlc3QgPSBmdW5jdGlvbih2ZXJzaW9uKSB7XG4gIGlmICghdmVyc2lvbilcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgaWYgKHR5cGVvZiB2ZXJzaW9uID09PSAnc3RyaW5nJylcbiAgICB2ZXJzaW9uID0gbmV3IFNlbVZlcih2ZXJzaW9uLCB0aGlzLm9wdGlvbnMpO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5zZXQubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAodGVzdFNldCh0aGlzLnNldFtpXSwgdmVyc2lvbiwgdGhpcy5vcHRpb25zKSlcbiAgICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn07XG5cbmZ1bmN0aW9uIHRlc3RTZXQoc2V0LCB2ZXJzaW9uLCBvcHRpb25zKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc2V0Lmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKCFzZXRbaV0udGVzdCh2ZXJzaW9uKSlcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmICghb3B0aW9ucylcbiAgICBvcHRpb25zID0ge31cblxuICBpZiAodmVyc2lvbi5wcmVyZWxlYXNlLmxlbmd0aCAmJiAhb3B0aW9ucy5pbmNsdWRlUHJlcmVsZWFzZSkge1xuICAgIC8vIEZpbmQgdGhlIHNldCBvZiB2ZXJzaW9ucyB0aGF0IGFyZSBhbGxvd2VkIHRvIGhhdmUgcHJlcmVsZWFzZXNcbiAgICAvLyBGb3IgZXhhbXBsZSwgXjEuMi4zLXByLjEgZGVzdWdhcnMgdG8gPj0xLjIuMy1wci4xIDwyLjAuMFxuICAgIC8vIFRoYXQgc2hvdWxkIGFsbG93IGAxLjIuMy1wci4yYCB0byBwYXNzLlxuICAgIC8vIEhvd2V2ZXIsIGAxLjIuNC1hbHBoYS5ub3RyZWFkeWAgc2hvdWxkIE5PVCBiZSBhbGxvd2VkLFxuICAgIC8vIGV2ZW4gdGhvdWdoIGl0J3Mgd2l0aGluIHRoZSByYW5nZSBzZXQgYnkgdGhlIGNvbXBhcmF0b3JzLlxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2V0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICBkZWJ1ZyhzZXRbaV0uc2VtdmVyKTtcbiAgICAgIGlmIChzZXRbaV0uc2VtdmVyID09PSBBTlkpXG4gICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICBpZiAoc2V0W2ldLnNlbXZlci5wcmVyZWxlYXNlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdmFyIGFsbG93ZWQgPSBzZXRbaV0uc2VtdmVyO1xuICAgICAgICBpZiAoYWxsb3dlZC5tYWpvciA9PT0gdmVyc2lvbi5tYWpvciAmJlxuICAgICAgICAgICAgYWxsb3dlZC5taW5vciA9PT0gdmVyc2lvbi5taW5vciAmJlxuICAgICAgICAgICAgYWxsb3dlZC5wYXRjaCA9PT0gdmVyc2lvbi5wYXRjaClcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBWZXJzaW9uIGhhcyBhIC1wcmUsIGJ1dCBpdCdzIG5vdCBvbmUgb2YgdGhlIG9uZXMgd2UgbGlrZS5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn1cblxuZXhwb3J0cy5zYXRpc2ZpZXMgPSBzYXRpc2ZpZXM7XG5mdW5jdGlvbiBzYXRpc2ZpZXModmVyc2lvbiwgcmFuZ2UsIG9wdGlvbnMpIHtcbiAgdHJ5IHtcbiAgICByYW5nZSA9IG5ldyBSYW5nZShyYW5nZSwgb3B0aW9ucyk7XG4gIH0gY2F0Y2ggKGVyKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiByYW5nZS50ZXN0KHZlcnNpb24pO1xufVxuXG5leHBvcnRzLm1heFNhdGlzZnlpbmcgPSBtYXhTYXRpc2Z5aW5nO1xuZnVuY3Rpb24gbWF4U2F0aXNmeWluZyh2ZXJzaW9ucywgcmFuZ2UsIG9wdGlvbnMpIHtcbiAgdmFyIG1heCA9IG51bGw7XG4gIHZhciBtYXhTViA9IG51bGw7XG4gIHRyeSB7XG4gICAgdmFyIHJhbmdlT2JqID0gbmV3IFJhbmdlKHJhbmdlLCBvcHRpb25zKTtcbiAgfSBjYXRjaCAoZXIpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICB2ZXJzaW9ucy5mb3JFYWNoKGZ1bmN0aW9uICh2KSB7XG4gICAgaWYgKHJhbmdlT2JqLnRlc3QodikpIHsgLy8gc2F0aXNmaWVzKHYsIHJhbmdlLCBvcHRpb25zKVxuICAgICAgaWYgKCFtYXggfHwgbWF4U1YuY29tcGFyZSh2KSA9PT0gLTEpIHsgLy8gY29tcGFyZShtYXgsIHYsIHRydWUpXG4gICAgICAgIG1heCA9IHY7XG4gICAgICAgIG1heFNWID0gbmV3IFNlbVZlcihtYXgsIG9wdGlvbnMpO1xuICAgICAgfVxuICAgIH1cbiAgfSlcbiAgcmV0dXJuIG1heDtcbn1cblxuZXhwb3J0cy5taW5TYXRpc2Z5aW5nID0gbWluU2F0aXNmeWluZztcbmZ1bmN0aW9uIG1pblNhdGlzZnlpbmcodmVyc2lvbnMsIHJhbmdlLCBvcHRpb25zKSB7XG4gIHZhciBtaW4gPSBudWxsO1xuICB2YXIgbWluU1YgPSBudWxsO1xuICB0cnkge1xuICAgIHZhciByYW5nZU9iaiA9IG5ldyBSYW5nZShyYW5nZSwgb3B0aW9ucyk7XG4gIH0gY2F0Y2ggKGVyKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmVyc2lvbnMuZm9yRWFjaChmdW5jdGlvbiAodikge1xuICAgIGlmIChyYW5nZU9iai50ZXN0KHYpKSB7IC8vIHNhdGlzZmllcyh2LCByYW5nZSwgb3B0aW9ucylcbiAgICAgIGlmICghbWluIHx8IG1pblNWLmNvbXBhcmUodikgPT09IDEpIHsgLy8gY29tcGFyZShtaW4sIHYsIHRydWUpXG4gICAgICAgIG1pbiA9IHY7XG4gICAgICAgIG1pblNWID0gbmV3IFNlbVZlcihtaW4sIG9wdGlvbnMpO1xuICAgICAgfVxuICAgIH1cbiAgfSlcbiAgcmV0dXJuIG1pbjtcbn1cblxuZXhwb3J0cy52YWxpZFJhbmdlID0gdmFsaWRSYW5nZTtcbmZ1bmN0aW9uIHZhbGlkUmFuZ2UocmFuZ2UsIG9wdGlvbnMpIHtcbiAgdHJ5IHtcbiAgICAvLyBSZXR1cm4gJyonIGluc3RlYWQgb2YgJycgc28gdGhhdCB0cnV0aGluZXNzIHdvcmtzLlxuICAgIC8vIFRoaXMgd2lsbCB0aHJvdyBpZiBpdCdzIGludmFsaWQgYW55d2F5XG4gICAgcmV0dXJuIG5ldyBSYW5nZShyYW5nZSwgb3B0aW9ucykucmFuZ2UgfHwgJyonO1xuICB9IGNhdGNoIChlcikge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbi8vIERldGVybWluZSBpZiB2ZXJzaW9uIGlzIGxlc3MgdGhhbiBhbGwgdGhlIHZlcnNpb25zIHBvc3NpYmxlIGluIHRoZSByYW5nZVxuZXhwb3J0cy5sdHIgPSBsdHI7XG5mdW5jdGlvbiBsdHIodmVyc2lvbiwgcmFuZ2UsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIG91dHNpZGUodmVyc2lvbiwgcmFuZ2UsICc8Jywgb3B0aW9ucyk7XG59XG5cbi8vIERldGVybWluZSBpZiB2ZXJzaW9uIGlzIGdyZWF0ZXIgdGhhbiBhbGwgdGhlIHZlcnNpb25zIHBvc3NpYmxlIGluIHRoZSByYW5nZS5cbmV4cG9ydHMuZ3RyID0gZ3RyO1xuZnVuY3Rpb24gZ3RyKHZlcnNpb24sIHJhbmdlLCBvcHRpb25zKSB7XG4gIHJldHVybiBvdXRzaWRlKHZlcnNpb24sIHJhbmdlLCAnPicsIG9wdGlvbnMpO1xufVxuXG5leHBvcnRzLm91dHNpZGUgPSBvdXRzaWRlO1xuZnVuY3Rpb24gb3V0c2lkZSh2ZXJzaW9uLCByYW5nZSwgaGlsbywgb3B0aW9ucykge1xuICB2ZXJzaW9uID0gbmV3IFNlbVZlcih2ZXJzaW9uLCBvcHRpb25zKTtcbiAgcmFuZ2UgPSBuZXcgUmFuZ2UocmFuZ2UsIG9wdGlvbnMpO1xuXG4gIHZhciBndGZuLCBsdGVmbiwgbHRmbiwgY29tcCwgZWNvbXA7XG4gIHN3aXRjaCAoaGlsbykge1xuICAgIGNhc2UgJz4nOlxuICAgICAgZ3RmbiA9IGd0O1xuICAgICAgbHRlZm4gPSBsdGU7XG4gICAgICBsdGZuID0gbHQ7XG4gICAgICBjb21wID0gJz4nO1xuICAgICAgZWNvbXAgPSAnPj0nO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnPCc6XG4gICAgICBndGZuID0gbHQ7XG4gICAgICBsdGVmbiA9IGd0ZTtcbiAgICAgIGx0Zm4gPSBndDtcbiAgICAgIGNvbXAgPSAnPCc7XG4gICAgICBlY29tcCA9ICc8PSc7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignTXVzdCBwcm92aWRlIGEgaGlsbyB2YWwgb2YgXCI8XCIgb3IgXCI+XCInKTtcbiAgfVxuXG4gIC8vIElmIGl0IHNhdGlzaWZlcyB0aGUgcmFuZ2UgaXQgaXMgbm90IG91dHNpZGVcbiAgaWYgKHNhdGlzZmllcyh2ZXJzaW9uLCByYW5nZSwgb3B0aW9ucykpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBGcm9tIG5vdyBvbiwgdmFyaWFibGUgdGVybXMgYXJlIGFzIGlmIHdlJ3JlIGluIFwiZ3RyXCIgbW9kZS5cbiAgLy8gYnV0IG5vdGUgdGhhdCBldmVyeXRoaW5nIGlzIGZsaXBwZWQgZm9yIHRoZSBcImx0clwiIGZ1bmN0aW9uLlxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcmFuZ2Uuc2V0Lmxlbmd0aDsgKytpKSB7XG4gICAgdmFyIGNvbXBhcmF0b3JzID0gcmFuZ2Uuc2V0W2ldO1xuXG4gICAgdmFyIGhpZ2ggPSBudWxsO1xuICAgIHZhciBsb3cgPSBudWxsO1xuXG4gICAgY29tcGFyYXRvcnMuZm9yRWFjaChmdW5jdGlvbihjb21wYXJhdG9yKSB7XG4gICAgICBpZiAoY29tcGFyYXRvci5zZW12ZXIgPT09IEFOWSkge1xuICAgICAgICBjb21wYXJhdG9yID0gbmV3IENvbXBhcmF0b3IoJz49MC4wLjAnKVxuICAgICAgfVxuICAgICAgaGlnaCA9IGhpZ2ggfHwgY29tcGFyYXRvcjtcbiAgICAgIGxvdyA9IGxvdyB8fCBjb21wYXJhdG9yO1xuICAgICAgaWYgKGd0Zm4oY29tcGFyYXRvci5zZW12ZXIsIGhpZ2guc2VtdmVyLCBvcHRpb25zKSkge1xuICAgICAgICBoaWdoID0gY29tcGFyYXRvcjtcbiAgICAgIH0gZWxzZSBpZiAobHRmbihjb21wYXJhdG9yLnNlbXZlciwgbG93LnNlbXZlciwgb3B0aW9ucykpIHtcbiAgICAgICAgbG93ID0gY29tcGFyYXRvcjtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIElmIHRoZSBlZGdlIHZlcnNpb24gY29tcGFyYXRvciBoYXMgYSBvcGVyYXRvciB0aGVuIG91ciB2ZXJzaW9uXG4gICAgLy8gaXNuJ3Qgb3V0c2lkZSBpdFxuICAgIGlmIChoaWdoLm9wZXJhdG9yID09PSBjb21wIHx8IGhpZ2gub3BlcmF0b3IgPT09IGVjb21wKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIGxvd2VzdCB2ZXJzaW9uIGNvbXBhcmF0b3IgaGFzIGFuIG9wZXJhdG9yIGFuZCBvdXIgdmVyc2lvblxuICAgIC8vIGlzIGxlc3MgdGhhbiBpdCB0aGVuIGl0IGlzbid0IGhpZ2hlciB0aGFuIHRoZSByYW5nZVxuICAgIGlmICgoIWxvdy5vcGVyYXRvciB8fCBsb3cub3BlcmF0b3IgPT09IGNvbXApICYmXG4gICAgICAgIGx0ZWZuKHZlcnNpb24sIGxvdy5zZW12ZXIpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSBlbHNlIGlmIChsb3cub3BlcmF0b3IgPT09IGVjb21wICYmIGx0Zm4odmVyc2lvbiwgbG93LnNlbXZlcikpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cbmV4cG9ydHMucHJlcmVsZWFzZSA9IHByZXJlbGVhc2U7XG5mdW5jdGlvbiBwcmVyZWxlYXNlKHZlcnNpb24sIG9wdGlvbnMpIHtcbiAgdmFyIHBhcnNlZCA9IHBhcnNlKHZlcnNpb24sIG9wdGlvbnMpO1xuICByZXR1cm4gKHBhcnNlZCAmJiBwYXJzZWQucHJlcmVsZWFzZS5sZW5ndGgpID8gcGFyc2VkLnByZXJlbGVhc2UgOiBudWxsO1xufVxuXG5leHBvcnRzLmludGVyc2VjdHMgPSBpbnRlcnNlY3RzO1xuZnVuY3Rpb24gaW50ZXJzZWN0cyhyMSwgcjIsIG9wdGlvbnMpIHtcbiAgcjEgPSBuZXcgUmFuZ2UocjEsIG9wdGlvbnMpXG4gIHIyID0gbmV3IFJhbmdlKHIyLCBvcHRpb25zKVxuICByZXR1cm4gcjEuaW50ZXJzZWN0cyhyMilcbn1cblxuZXhwb3J0cy5jb2VyY2UgPSBjb2VyY2U7XG5mdW5jdGlvbiBjb2VyY2UodmVyc2lvbikge1xuICBpZiAodmVyc2lvbiBpbnN0YW5jZW9mIFNlbVZlcilcbiAgICByZXR1cm4gdmVyc2lvbjtcblxuICBpZiAodHlwZW9mIHZlcnNpb24gIT09ICdzdHJpbmcnKVxuICAgIHJldHVybiBudWxsO1xuXG4gIHZhciBtYXRjaCA9IHZlcnNpb24ubWF0Y2gocmVbQ09FUkNFXSk7XG5cbiAgaWYgKG1hdGNoID09IG51bGwpXG4gICAgcmV0dXJuIG51bGw7XG5cbiAgcmV0dXJuIHBhcnNlKChtYXRjaFsxXSB8fCAnMCcpICsgJy4nICsgKG1hdGNoWzJdIHx8ICcwJykgKyAnLicgKyAobWF0Y2hbM10gfHwgJzAnKSk7IFxufVxuIiwiLy8gQGZsb3dcbmltcG9ydCBWdWUgZnJvbSAndnVlJ1xuaW1wb3J0IHNlbXZlciBmcm9tICdzZW12ZXInXG5cbmV4cG9ydCBmdW5jdGlvbiB0aHJvd0Vycm9yKG1zZzogc3RyaW5nKTogdm9pZCB7XG4gIHRocm93IG5ldyBFcnJvcihgW3Z1ZS10ZXN0LXV0aWxzXTogJHttc2d9YClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdhcm4obXNnOiBzdHJpbmcpOiB2b2lkIHtcbiAgY29uc29sZS5lcnJvcihgW3Z1ZS10ZXN0LXV0aWxzXTogJHttc2d9YClcbn1cblxuY29uc3QgY2FtZWxpemVSRSA9IC8tKFxcdykvZ1xuXG5leHBvcnQgY29uc3QgY2FtZWxpemUgPSAoc3RyOiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xuICBjb25zdCBjYW1lbGl6ZWRTdHIgPSBzdHIucmVwbGFjZShjYW1lbGl6ZVJFLCAoXywgYykgPT5cbiAgICBjID8gYy50b1VwcGVyQ2FzZSgpIDogJydcbiAgKVxuICByZXR1cm4gY2FtZWxpemVkU3RyLmNoYXJBdCgwKS50b0xvd2VyQ2FzZSgpICsgY2FtZWxpemVkU3RyLnNsaWNlKDEpXG59XG5cbi8qKlxuICogQ2FwaXRhbGl6ZSBhIHN0cmluZy5cbiAqL1xuZXhwb3J0IGNvbnN0IGNhcGl0YWxpemUgPSAoc3RyOiBzdHJpbmcpOiBzdHJpbmcgPT5cbiAgc3RyLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgc3RyLnNsaWNlKDEpXG5cbi8qKlxuICogSHlwaGVuYXRlIGEgY2FtZWxDYXNlIHN0cmluZy5cbiAqL1xuY29uc3QgaHlwaGVuYXRlUkUgPSAvXFxCKFtBLVpdKS9nXG5leHBvcnQgY29uc3QgaHlwaGVuYXRlID0gKHN0cjogc3RyaW5nKTogc3RyaW5nID0+XG4gIHN0ci5yZXBsYWNlKGh5cGhlbmF0ZVJFLCAnLSQxJykudG9Mb3dlckNhc2UoKVxuXG5mdW5jdGlvbiBoYXNPd25Qcm9wZXJ0eShvYmosIHByb3ApIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlQ29tcG9uZW50KGlkOiBzdHJpbmcsIGNvbXBvbmVudHM6IE9iamVjdCkge1xuICBpZiAodHlwZW9mIGlkICE9PSAnc3RyaW5nJykge1xuICAgIHJldHVyblxuICB9XG4gIC8vIGNoZWNrIGxvY2FsIHJlZ2lzdHJhdGlvbiB2YXJpYXRpb25zIGZpcnN0XG4gIGlmIChoYXNPd25Qcm9wZXJ0eShjb21wb25lbnRzLCBpZCkpIHtcbiAgICByZXR1cm4gY29tcG9uZW50c1tpZF1cbiAgfVxuICB2YXIgY2FtZWxpemVkSWQgPSBjYW1lbGl6ZShpZClcbiAgaWYgKGhhc093blByb3BlcnR5KGNvbXBvbmVudHMsIGNhbWVsaXplZElkKSkge1xuICAgIHJldHVybiBjb21wb25lbnRzW2NhbWVsaXplZElkXVxuICB9XG4gIHZhciBQYXNjYWxDYXNlSWQgPSBjYXBpdGFsaXplKGNhbWVsaXplZElkKVxuICBpZiAoaGFzT3duUHJvcGVydHkoY29tcG9uZW50cywgUGFzY2FsQ2FzZUlkKSkge1xuICAgIHJldHVybiBjb21wb25lbnRzW1Bhc2NhbENhc2VJZF1cbiAgfVxuICAvLyBmYWxsYmFjayB0byBwcm90b3R5cGUgY2hhaW5cbiAgcmV0dXJuIGNvbXBvbmVudHNbaWRdIHx8IGNvbXBvbmVudHNbY2FtZWxpemVkSWRdIHx8IGNvbXBvbmVudHNbUGFzY2FsQ2FzZUlkXVxufVxuXG5jb25zdCBVQSA9XG4gIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmXG4gICduYXZpZ2F0b3InIGluIHdpbmRvdyAmJlxuICBuYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKClcblxuZXhwb3J0IGNvbnN0IGlzUGhhbnRvbUpTID0gVUEgJiYgVUEuaW5jbHVkZXMgJiYgVUEubWF0Y2goL3BoYW50b21qcy9pKVxuXG5leHBvcnQgY29uc3QgaXNFZGdlID0gVUEgJiYgVUEuaW5kZXhPZignZWRnZS8nKSA+IDBcbmV4cG9ydCBjb25zdCBpc0Nocm9tZSA9IFVBICYmIC9jaHJvbWVcXC9cXGQrLy50ZXN0KFVBKSAmJiAhaXNFZGdlXG5cbi8vIGdldCB0aGUgZXZlbnQgdXNlZCB0byB0cmlnZ2VyIHYtbW9kZWwgaGFuZGxlciB0aGF0IHVwZGF0ZXMgYm91bmQgZGF0YVxuZXhwb3J0IGZ1bmN0aW9uIGdldENoZWNrZWRFdmVudCgpIHtcbiAgY29uc3QgdmVyc2lvbiA9IFZ1ZS52ZXJzaW9uXG5cbiAgaWYgKHNlbXZlci5zYXRpc2ZpZXModmVyc2lvbiwgJzIuMS45IC0gMi4xLjEwJykpIHtcbiAgICByZXR1cm4gJ2NsaWNrJ1xuICB9XG5cbiAgaWYgKHNlbXZlci5zYXRpc2ZpZXModmVyc2lvbiwgJzIuMiAtIDIuNCcpKSB7XG4gICAgcmV0dXJuIGlzQ2hyb21lID8gJ2NsaWNrJyA6ICdjaGFuZ2UnXG4gIH1cblxuICAvLyBjaGFuZ2UgaXMgaGFuZGxlciBmb3IgdmVyc2lvbiAyLjAgLSAyLjEuOCwgYW5kIDIuNStcbiAgcmV0dXJuICdjaGFuZ2UnXG59XG4iLCIvLyBAZmxvd1xuaW1wb3J0IHsgdGhyb3dFcnJvciwgY2FwaXRhbGl6ZSwgY2FtZWxpemUsIGh5cGhlbmF0ZSB9IGZyb20gJy4vdXRpbCdcblxuZXhwb3J0IGZ1bmN0aW9uIGlzRG9tU2VsZWN0b3Ioc2VsZWN0b3I6IGFueSk6IGJvb2xlYW4ge1xuICBpZiAodHlwZW9mIHNlbGVjdG9yICE9PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgdHJ5IHtcbiAgICBpZiAodHlwZW9mIGRvY3VtZW50ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhyb3dFcnJvcihcbiAgICAgICAgYG1vdW50IG11c3QgYmUgcnVuIGluIGEgYnJvd3NlciBlbnZpcm9ubWVudCBsaWtlIGAgK1xuICAgICAgICAgIGBQaGFudG9tSlMsIGpzZG9tIG9yIGNocm9tZWBcbiAgICAgIClcbiAgICB9XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgdGhyb3dFcnJvcihcbiAgICAgIGBtb3VudCBtdXN0IGJlIHJ1biBpbiBhIGJyb3dzZXIgZW52aXJvbm1lbnQgbGlrZSBgICtcbiAgICAgICAgYFBoYW50b21KUywganNkb20gb3IgY2hyb21lYFxuICAgIClcbiAgfVxuXG4gIHRyeSB7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3RvcilcbiAgICByZXR1cm4gdHJ1ZVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1Z1ZUNvbXBvbmVudChjOiBhbnkpOiBib29sZWFuIHtcbiAgaWYgKGlzQ29uc3RydWN0b3IoYykpIHtcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgaWYgKGMgPT09IG51bGwgfHwgdHlwZW9mIGMgIT09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICBpZiAoYy5leHRlbmRzIHx8IGMuX0N0b3IpIHtcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgaWYgKHR5cGVvZiBjLnRlbXBsYXRlID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICByZXR1cm4gdHlwZW9mIGMucmVuZGVyID09PSAnZnVuY3Rpb24nXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb21wb25lbnROZWVkc0NvbXBpbGluZyhjb21wb25lbnQ6IENvbXBvbmVudCk6IGJvb2xlYW4ge1xuICByZXR1cm4gKFxuICAgIGNvbXBvbmVudCAmJlxuICAgICFjb21wb25lbnQucmVuZGVyICYmXG4gICAgKGNvbXBvbmVudC50ZW1wbGF0ZSB8fCBjb21wb25lbnQuZXh0ZW5kcyB8fCBjb21wb25lbnQuZXh0ZW5kT3B0aW9ucykgJiZcbiAgICAhY29tcG9uZW50LmZ1bmN0aW9uYWxcbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNSZWZTZWxlY3RvcihyZWZPcHRpb25zT2JqZWN0OiBhbnkpOiBib29sZWFuIHtcbiAgaWYgKFxuICAgIHR5cGVvZiByZWZPcHRpb25zT2JqZWN0ICE9PSAnb2JqZWN0JyB8fFxuICAgIE9iamVjdC5rZXlzKHJlZk9wdGlvbnNPYmplY3QgfHwge30pLmxlbmd0aCAhPT0gMVxuICApIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIHJldHVybiB0eXBlb2YgcmVmT3B0aW9uc09iamVjdC5yZWYgPT09ICdzdHJpbmcnXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc05hbWVTZWxlY3RvcihuYW1lT3B0aW9uc09iamVjdDogYW55KTogYm9vbGVhbiB7XG4gIGlmICh0eXBlb2YgbmFtZU9wdGlvbnNPYmplY3QgIT09ICdvYmplY3QnIHx8IG5hbWVPcHRpb25zT2JqZWN0ID09PSBudWxsKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICByZXR1cm4gISFuYW1lT3B0aW9uc09iamVjdC5uYW1lXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0NvbnN0cnVjdG9yKGM6IGFueSkge1xuICByZXR1cm4gdHlwZW9mIGMgPT09ICdmdW5jdGlvbicgJiYgYy5jaWRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRHluYW1pY0NvbXBvbmVudChjOiBhbnkpIHtcbiAgcmV0dXJuIHR5cGVvZiBjID09PSAnZnVuY3Rpb24nICYmICFjLmNpZFxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNDb21wb25lbnRPcHRpb25zKGM6IGFueSkge1xuICByZXR1cm4gdHlwZW9mIGMgPT09ICdvYmplY3QnICYmIChjLnRlbXBsYXRlIHx8IGMucmVuZGVyKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNGdW5jdGlvbmFsQ29tcG9uZW50KGM6IGFueSkge1xuICBpZiAoIWlzVnVlQ29tcG9uZW50KGMpKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbiAgaWYgKGlzQ29uc3RydWN0b3IoYykpIHtcbiAgICByZXR1cm4gYy5vcHRpb25zLmZ1bmN0aW9uYWxcbiAgfVxuICByZXR1cm4gYy5mdW5jdGlvbmFsXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0ZW1wbGF0ZUNvbnRhaW5zQ29tcG9uZW50KFxuICB0ZW1wbGF0ZTogc3RyaW5nLFxuICBuYW1lOiBzdHJpbmdcbik6IGJvb2xlYW4ge1xuICByZXR1cm4gW2NhcGl0YWxpemUsIGNhbWVsaXplLCBoeXBoZW5hdGVdLnNvbWUoZm9ybWF0ID0+IHtcbiAgICBjb25zdCByZSA9IG5ldyBSZWdFeHAoYDwke2Zvcm1hdChuYW1lKX1cXFxccyooXFxcXHN8PnwoXFwvPikpYCwgJ2cnKVxuICAgIHJldHVybiByZS50ZXN0KHRlbXBsYXRlKVxuICB9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNQbGFpbk9iamVjdChjOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChjKSA9PT0gJ1tvYmplY3QgT2JqZWN0XSdcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUmVxdWlyZWRDb21wb25lbnQobmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiAoXG4gICAgbmFtZSA9PT0gJ0tlZXBBbGl2ZScgfHwgbmFtZSA9PT0gJ1RyYW5zaXRpb24nIHx8IG5hbWUgPT09ICdUcmFuc2l0aW9uR3JvdXAnXG4gIClcbn1cblxuZnVuY3Rpb24gbWFrZU1hcChzdHI6IHN0cmluZywgZXhwZWN0c0xvd2VyQ2FzZT86IGJvb2xlYW4pIHtcbiAgdmFyIG1hcCA9IE9iamVjdC5jcmVhdGUobnVsbClcbiAgdmFyIGxpc3QgPSBzdHIuc3BsaXQoJywnKVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICBtYXBbbGlzdFtpXV0gPSB0cnVlXG4gIH1cbiAgcmV0dXJuIGV4cGVjdHNMb3dlckNhc2VcbiAgICA/IGZ1bmN0aW9uKHZhbDogc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBtYXBbdmFsLnRvTG93ZXJDYXNlKCldXG4gICAgICB9XG4gICAgOiBmdW5jdGlvbih2YWw6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gbWFwW3ZhbF1cbiAgICAgIH1cbn1cblxuZXhwb3J0IGNvbnN0IGlzSFRNTFRhZyA9IG1ha2VNYXAoXG4gICdodG1sLGJvZHksYmFzZSxoZWFkLGxpbmssbWV0YSxzdHlsZSx0aXRsZSwnICtcbiAgICAnYWRkcmVzcyxhcnRpY2xlLGFzaWRlLGZvb3RlcixoZWFkZXIsaDEsaDIsaDMsaDQsaDUsaDYsaGdyb3VwLG5hdixzZWN0aW9uLCcgK1xuICAgICdkaXYsZGQsZGwsZHQsZmlnY2FwdGlvbixmaWd1cmUscGljdHVyZSxocixpbWcsbGksbWFpbixvbCxwLHByZSx1bCwnICtcbiAgICAnYSxiLGFiYnIsYmRpLGJkbyxicixjaXRlLGNvZGUsZGF0YSxkZm4sZW0saSxrYmQsbWFyayxxLHJwLHJ0LHJ0YyxydWJ5LCcgK1xuICAgICdzLHNhbXAsc21hbGwsc3BhbixzdHJvbmcsc3ViLHN1cCx0aW1lLHUsdmFyLHdicixhcmVhLGF1ZGlvLG1hcCx0cmFjaywnICtcbiAgICAnZW1iZWQsb2JqZWN0LHBhcmFtLHNvdXJjZSxjYW52YXMsc2NyaXB0LG5vc2NyaXB0LGRlbCxpbnMsJyArXG4gICAgJ2NhcHRpb24sY29sLGNvbGdyb3VwLHRhYmxlLHRoZWFkLHRib2R5LHRkLHRoLHRyLHZpZGVvLCcgK1xuICAgICdidXR0b24sZGF0YWxpc3QsZmllbGRzZXQsZm9ybSxpbnB1dCxsYWJlbCxsZWdlbmQsbWV0ZXIsb3B0Z3JvdXAsb3B0aW9uLCcgK1xuICAgICdvdXRwdXQscHJvZ3Jlc3Msc2VsZWN0LHRleHRhcmVhLCcgK1xuICAgICdkZXRhaWxzLGRpYWxvZyxtZW51LG1lbnVpdGVtLHN1bW1hcnksJyArXG4gICAgJ2NvbnRlbnQsZWxlbWVudCxzaGFkb3csdGVtcGxhdGUsYmxvY2txdW90ZSxpZnJhbWUsdGZvb3QnXG4pXG5cbi8vIHRoaXMgbWFwIGlzIGludGVudGlvbmFsbHkgc2VsZWN0aXZlLCBvbmx5IGNvdmVyaW5nIFNWRyBlbGVtZW50cyB0aGF0IG1heVxuLy8gY29udGFpbiBjaGlsZCBlbGVtZW50cy5cbmV4cG9ydCBjb25zdCBpc1NWRyA9IG1ha2VNYXAoXG4gICdzdmcsYW5pbWF0ZSxjaXJjbGUsY2xpcHBhdGgsY3Vyc29yLGRlZnMsZGVzYyxlbGxpcHNlLGZpbHRlcixmb250LWZhY2UsJyArXG4gICAgJ2ZvcmVpZ25PYmplY3QsZyxnbHlwaCxpbWFnZSxsaW5lLG1hcmtlcixtYXNrLG1pc3NpbmctZ2x5cGgscGF0aCxwYXR0ZXJuLCcgK1xuICAgICdwb2x5Z29uLHBvbHlsaW5lLHJlY3Qsc3dpdGNoLHN5bWJvbCx0ZXh0LHRleHRwYXRoLHRzcGFuLHVzZSx2aWV3JyxcbiAgdHJ1ZVxuKVxuXG5leHBvcnQgY29uc3QgaXNSZXNlcnZlZFRhZyA9ICh0YWc6IHN0cmluZykgPT4gaXNIVE1MVGFnKHRhZykgfHwgaXNTVkcodGFnKVxuIiwiaW1wb3J0IFZ1ZSBmcm9tICd2dWUnXG5pbXBvcnQgc2VtdmVyIGZyb20gJ3NlbXZlcidcblxuZXhwb3J0IGNvbnN0IE5BTUVfU0VMRUNUT1IgPSAnTkFNRV9TRUxFQ1RPUidcbmV4cG9ydCBjb25zdCBDT01QT05FTlRfU0VMRUNUT1IgPSAnQ09NUE9ORU5UX1NFTEVDVE9SJ1xuZXhwb3J0IGNvbnN0IFJFRl9TRUxFQ1RPUiA9ICdSRUZfU0VMRUNUT1InXG5leHBvcnQgY29uc3QgRE9NX1NFTEVDVE9SID0gJ0RPTV9TRUxFQ1RPUidcbmV4cG9ydCBjb25zdCBJTlZBTElEX1NFTEVDVE9SID0gJ0lOVkFMSURfU0VMRUNUT1InXG5leHBvcnQgY29uc3QgQ09NUEFUX1NZTkNfTU9ERSA9ICdDT01QQVRfU1lOQ19NT0RFJ1xuXG5leHBvcnQgY29uc3QgVlVFX1ZFUlNJT04gPSBOdW1iZXIoXG4gIGAke1Z1ZS52ZXJzaW9uLnNwbGl0KCcuJylbMF19LiR7VnVlLnZlcnNpb24uc3BsaXQoJy4nKVsxXX1gXG4pXG5cbmV4cG9ydCBjb25zdCBGVU5DVElPTkFMX09QVElPTlMgPVxuICBWVUVfVkVSU0lPTiA+PSAyLjUgPyAnZm5PcHRpb25zJyA6ICdmdW5jdGlvbmFsT3B0aW9ucydcblxuZXhwb3J0IGNvbnN0IEJFRk9SRV9SRU5ERVJfTElGRUNZQ0xFX0hPT0sgPSBzZW12ZXIuZ3QoVnVlLnZlcnNpb24sICcyLjEuOCcpXG4gID8gJ2JlZm9yZUNyZWF0ZSdcbiAgOiAnYmVmb3JlTW91bnQnXG5cbmV4cG9ydCBjb25zdCBDUkVBVEVfRUxFTUVOVF9BTElBUyA9IHNlbXZlci5ndChWdWUudmVyc2lvbiwgJzIuMS41JylcbiAgPyAnX2MnXG4gIDogJ19oJ1xuIiwiLy8gQGZsb3dcblxuaW1wb3J0IHtcbiAgaXNEb21TZWxlY3RvcixcbiAgaXNOYW1lU2VsZWN0b3IsXG4gIGlzUmVmU2VsZWN0b3IsXG4gIGlzVnVlQ29tcG9uZW50XG59IGZyb20gJ3NoYXJlZC92YWxpZGF0b3JzJ1xuaW1wb3J0IHsgdGhyb3dFcnJvciB9IGZyb20gJ3NoYXJlZC91dGlsJ1xuaW1wb3J0IHtcbiAgUkVGX1NFTEVDVE9SLFxuICBDT01QT05FTlRfU0VMRUNUT1IsXG4gIE5BTUVfU0VMRUNUT1IsXG4gIERPTV9TRUxFQ1RPUixcbiAgSU5WQUxJRF9TRUxFQ1RPUlxufSBmcm9tICdzaGFyZWQvY29uc3RzJ1xuXG5mdW5jdGlvbiBnZXRTZWxlY3RvclR5cGUoc2VsZWN0b3I6IFNlbGVjdG9yKTogc3RyaW5nIHtcbiAgaWYgKGlzRG9tU2VsZWN0b3Ioc2VsZWN0b3IpKSByZXR1cm4gRE9NX1NFTEVDVE9SXG4gIGlmIChpc1Z1ZUNvbXBvbmVudChzZWxlY3RvcikpIHJldHVybiBDT01QT05FTlRfU0VMRUNUT1JcbiAgaWYgKGlzTmFtZVNlbGVjdG9yKHNlbGVjdG9yKSkgcmV0dXJuIE5BTUVfU0VMRUNUT1JcbiAgaWYgKGlzUmVmU2VsZWN0b3Ioc2VsZWN0b3IpKSByZXR1cm4gUkVGX1NFTEVDVE9SXG5cbiAgcmV0dXJuIElOVkFMSURfU0VMRUNUT1Jcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZ2V0U2VsZWN0b3IoXG4gIHNlbGVjdG9yOiBTZWxlY3RvcixcbiAgbWV0aG9kTmFtZTogc3RyaW5nXG4pOiBPYmplY3Qge1xuICBjb25zdCB0eXBlID0gZ2V0U2VsZWN0b3JUeXBlKHNlbGVjdG9yKVxuICBpZiAodHlwZSA9PT0gSU5WQUxJRF9TRUxFQ1RPUikge1xuICAgIHRocm93RXJyb3IoXG4gICAgICBgd3JhcHBlci4ke21ldGhvZE5hbWV9KCkgbXVzdCBiZSBwYXNzZWQgYSB2YWxpZCBDU1Mgc2VsZWN0b3IsIFZ1ZSBgICtcbiAgICAgICAgYGNvbnN0cnVjdG9yLCBvciB2YWxpZCBmaW5kIG9wdGlvbiBvYmplY3RgXG4gICAgKVxuICB9XG4gIHJldHVybiB7XG4gICAgdHlwZSxcbiAgICB2YWx1ZTogc2VsZWN0b3JcbiAgfVxufVxuIiwiLy8gQGZsb3dcblxuaW1wb3J0IHsgd2FybiB9IGZyb20gJ3NoYXJlZC91dGlsJ1xuXG5mdW5jdGlvbiBnZXRSZWFsQ2hpbGQodm5vZGU6ID9WTm9kZSk6ID9WTm9kZSB7XG4gIGNvbnN0IGNvbXBPcHRpb25zID0gdm5vZGUgJiYgdm5vZGUuY29tcG9uZW50T3B0aW9uc1xuICBpZiAoY29tcE9wdGlvbnMgJiYgY29tcE9wdGlvbnMuQ3Rvci5vcHRpb25zLmFic3RyYWN0KSB7XG4gICAgcmV0dXJuIGdldFJlYWxDaGlsZChnZXRGaXJzdENvbXBvbmVudENoaWxkKGNvbXBPcHRpb25zLmNoaWxkcmVuKSlcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gdm5vZGVcbiAgfVxufVxuXG5mdW5jdGlvbiBpc1NhbWVDaGlsZChjaGlsZDogVk5vZGUsIG9sZENoaWxkOiBWTm9kZSk6IGJvb2xlYW4ge1xuICByZXR1cm4gb2xkQ2hpbGQua2V5ID09PSBjaGlsZC5rZXkgJiYgb2xkQ2hpbGQudGFnID09PSBjaGlsZC50YWdcbn1cblxuZnVuY3Rpb24gZ2V0Rmlyc3RDb21wb25lbnRDaGlsZChjaGlsZHJlbjogP0FycmF5PFZOb2RlPik6ID9WTm9kZSB7XG4gIGlmIChBcnJheS5pc0FycmF5KGNoaWxkcmVuKSkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGMgPSBjaGlsZHJlbltpXVxuICAgICAgaWYgKGMgJiYgKGMuY29tcG9uZW50T3B0aW9ucyB8fCBpc0FzeW5jUGxhY2Vob2xkZXIoYykpKSB7XG4gICAgICAgIHJldHVybiBjXG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGlzUHJpbWl0aXZlKHZhbHVlOiBhbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuIChcbiAgICB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnIHx8XG4gICAgdHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyB8fFxuICAgIC8vICRGbG93SWdub3JlXG4gICAgdHlwZW9mIHZhbHVlID09PSAnc3ltYm9sJyB8fFxuICAgIHR5cGVvZiB2YWx1ZSA9PT0gJ2Jvb2xlYW4nXG4gIClcbn1cblxuZnVuY3Rpb24gaXNBc3luY1BsYWNlaG9sZGVyKG5vZGU6IFZOb2RlKTogYm9vbGVhbiB7XG4gIHJldHVybiBub2RlLmlzQ29tbWVudCAmJiBub2RlLmFzeW5jRmFjdG9yeVxufVxuY29uc3QgY2FtZWxpemVSRSA9IC8tKFxcdykvZ1xuZXhwb3J0IGNvbnN0IGNhbWVsaXplID0gKHN0cjogc3RyaW5nKTogc3RyaW5nID0+IHtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKGNhbWVsaXplUkUsIChfLCBjKSA9PiAoYyA/IGMudG9VcHBlckNhc2UoKSA6ICcnKSlcbn1cblxuZnVuY3Rpb24gaGFzUGFyZW50VHJhbnNpdGlvbih2bm9kZTogVk5vZGUpOiA/Ym9vbGVhbiB7XG4gIHdoaWxlICgodm5vZGUgPSB2bm9kZS5wYXJlbnQpKSB7XG4gICAgaWYgKHZub2RlLmRhdGEudHJhbnNpdGlvbikge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQge1xuICByZW5kZXIoaDogRnVuY3Rpb24pIHtcbiAgICBsZXQgY2hpbGRyZW46ID9BcnJheTxWTm9kZT4gPSB0aGlzLiRvcHRpb25zLl9yZW5kZXJDaGlsZHJlblxuICAgIGlmICghY2hpbGRyZW4pIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIC8vIGZpbHRlciBvdXQgdGV4dCBub2RlcyAocG9zc2libGUgd2hpdGVzcGFjZXMpXG4gICAgY2hpbGRyZW4gPSBjaGlsZHJlbi5maWx0ZXIoKGM6IFZOb2RlKSA9PiBjLnRhZyB8fCBpc0FzeW5jUGxhY2Vob2xkZXIoYykpXG4gICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgaWYgKCFjaGlsZHJlbi5sZW5ndGgpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIC8vIHdhcm4gbXVsdGlwbGUgZWxlbWVudHNcbiAgICBpZiAoY2hpbGRyZW4ubGVuZ3RoID4gMSkge1xuICAgICAgd2FybihcbiAgICAgICAgYDx0cmFuc2l0aW9uPiBjYW4gb25seSBiZSB1c2VkIG9uIGEgc2luZ2xlIGVsZW1lbnQuIGAgK1xuICAgICAgICAgIGBVc2UgYCArXG4gICAgICAgICAgJzx0cmFuc2l0aW9uLWdyb3VwPiBmb3IgbGlzdHMuJ1xuICAgICAgKVxuICAgIH1cblxuICAgIGNvbnN0IG1vZGU6IHN0cmluZyA9IHRoaXMubW9kZVxuXG4gICAgLy8gd2FybiBpbnZhbGlkIG1vZGVcbiAgICBpZiAobW9kZSAmJiBtb2RlICE9PSAnaW4tb3V0JyAmJiBtb2RlICE9PSAnb3V0LWluJykge1xuICAgICAgd2FybignaW52YWxpZCA8dHJhbnNpdGlvbj4gbW9kZTogJyArIG1vZGUpXG4gICAgfVxuXG4gICAgY29uc3QgcmF3Q2hpbGQ6IFZOb2RlID0gY2hpbGRyZW5bMF1cblxuICAgIC8vIGlmIHRoaXMgaXMgYSBjb21wb25lbnQgcm9vdCBub2RlIGFuZCB0aGUgY29tcG9uZW50J3NcbiAgICAvLyBwYXJlbnQgY29udGFpbmVyIG5vZGUgYWxzbyBoYXMgdHJhbnNpdGlvbiwgc2tpcC5cbiAgICBpZiAoaGFzUGFyZW50VHJhbnNpdGlvbih0aGlzLiR2bm9kZSkpIHtcbiAgICAgIHJldHVybiByYXdDaGlsZFxuICAgIH1cblxuICAgIC8vIGFwcGx5IHRyYW5zaXRpb24gZGF0YSB0byBjaGlsZFxuICAgIC8vIHVzZSBnZXRSZWFsQ2hpbGQoKSB0byBpZ25vcmUgYWJzdHJhY3QgY29tcG9uZW50cyBlLmcuIGtlZXAtYWxpdmVcbiAgICBjb25zdCBjaGlsZDogP1ZOb2RlID0gZ2V0UmVhbENoaWxkKHJhd0NoaWxkKVxuXG4gICAgaWYgKCFjaGlsZCkge1xuICAgICAgcmV0dXJuIHJhd0NoaWxkXG4gICAgfVxuXG4gICAgY29uc3QgaWQ6IHN0cmluZyA9IGBfX3RyYW5zaXRpb24tJHt0aGlzLl91aWR9LWBcbiAgICBjaGlsZC5rZXkgPVxuICAgICAgY2hpbGQua2V5ID09IG51bGxcbiAgICAgICAgPyBjaGlsZC5pc0NvbW1lbnRcbiAgICAgICAgICA/IGlkICsgJ2NvbW1lbnQnXG4gICAgICAgICAgOiBpZCArIGNoaWxkLnRhZ1xuICAgICAgICA6IGlzUHJpbWl0aXZlKGNoaWxkLmtleSlcbiAgICAgICAgPyBTdHJpbmcoY2hpbGQua2V5KS5pbmRleE9mKGlkKSA9PT0gMFxuICAgICAgICAgID8gY2hpbGQua2V5XG4gICAgICAgICAgOiBpZCArIGNoaWxkLmtleVxuICAgICAgICA6IGNoaWxkLmtleVxuXG4gICAgY29uc3QgZGF0YTogT2JqZWN0ID0gY2hpbGQuZGF0YSB8fCAoY2hpbGQuZGF0YSA9IHt9KVxuICAgIGNvbnN0IG9sZFJhd0NoaWxkOiA/Vk5vZGUgPSB0aGlzLl92bm9kZVxuICAgIGNvbnN0IG9sZENoaWxkOiA/Vk5vZGUgPSBnZXRSZWFsQ2hpbGQob2xkUmF3Q2hpbGQpXG4gICAgaWYgKFxuICAgICAgY2hpbGQuZGF0YS5kaXJlY3RpdmVzICYmXG4gICAgICBjaGlsZC5kYXRhLmRpcmVjdGl2ZXMuc29tZShkID0+IGQubmFtZSA9PT0gJ3Nob3cnKVxuICAgICkge1xuICAgICAgY2hpbGQuZGF0YS5zaG93ID0gdHJ1ZVxuICAgIH1cblxuICAgIC8vIG1hcmsgdi1zaG93XG4gICAgLy8gc28gdGhhdCB0aGUgdHJhbnNpdGlvbiBtb2R1bGUgY2FuIGhhbmQgb3ZlciB0aGUgY29udHJvbFxuICAgIC8vIHRvIHRoZSBkaXJlY3RpdmVcbiAgICBpZiAoXG4gICAgICBjaGlsZC5kYXRhLmRpcmVjdGl2ZXMgJiZcbiAgICAgIGNoaWxkLmRhdGEuZGlyZWN0aXZlcy5zb21lKGQgPT4gZC5uYW1lID09PSAnc2hvdycpXG4gICAgKSB7XG4gICAgICBjaGlsZC5kYXRhLnNob3cgPSB0cnVlXG4gICAgfVxuICAgIGlmIChcbiAgICAgIG9sZENoaWxkICYmXG4gICAgICBvbGRDaGlsZC5kYXRhICYmXG4gICAgICAhaXNTYW1lQ2hpbGQoY2hpbGQsIG9sZENoaWxkKSAmJlxuICAgICAgIWlzQXN5bmNQbGFjZWhvbGRlcihvbGRDaGlsZCkgJiZcbiAgICAgIC8vICM2Njg3IGNvbXBvbmVudCByb290IGlzIGEgY29tbWVudCBub2RlXG4gICAgICAhKFxuICAgICAgICBvbGRDaGlsZC5jb21wb25lbnRJbnN0YW5jZSAmJlxuICAgICAgICBvbGRDaGlsZC5jb21wb25lbnRJbnN0YW5jZS5fdm5vZGUuaXNDb21tZW50XG4gICAgICApXG4gICAgKSB7XG4gICAgICBvbGRDaGlsZC5kYXRhID0geyAuLi5kYXRhIH1cbiAgICB9XG4gICAgcmV0dXJuIHJhd0NoaWxkXG4gIH1cbn1cbiIsIi8vIEBmbG93XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgcmVuZGVyKGg6IEZ1bmN0aW9uKSB7XG4gICAgY29uc3QgdGFnOiBzdHJpbmcgPSB0aGlzLnRhZyB8fCB0aGlzLiR2bm9kZS5kYXRhLnRhZyB8fCAnc3BhbidcbiAgICBjb25zdCBjaGlsZHJlbjogQXJyYXk8Vk5vZGU+ID0gdGhpcy4kc2xvdHMuZGVmYXVsdCB8fCBbXVxuXG4gICAgcmV0dXJuIGgodGFnLCBudWxsLCBjaGlsZHJlbilcbiAgfVxufVxuIiwiaW1wb3J0IFRyYW5zaXRpb25TdHViIGZyb20gJy4vY29tcG9uZW50cy9UcmFuc2l0aW9uU3R1YidcbmltcG9ydCBUcmFuc2l0aW9uR3JvdXBTdHViIGZyb20gJy4vY29tcG9uZW50cy9UcmFuc2l0aW9uR3JvdXBTdHViJ1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIHN0dWJzOiB7XG4gICAgdHJhbnNpdGlvbjogVHJhbnNpdGlvblN0dWIsXG4gICAgJ3RyYW5zaXRpb24tZ3JvdXAnOiBUcmFuc2l0aW9uR3JvdXBTdHViXG4gIH0sXG4gIG1vY2tzOiB7fSxcbiAgbWV0aG9kczoge30sXG4gIHByb3ZpZGU6IHt9LFxuICBsb2dNb2RpZmllZENvbXBvbmVudHM6IHRydWUsXG4gIHNpbGVudDogdHJ1ZVxufVxuIiwiLy8gQGZsb3dcblxuaW1wb3J0IHR5cGUgV3JhcHBlciBmcm9tICcuL3dyYXBwZXInXG5pbXBvcnQgdHlwZSBWdWVXcmFwcGVyIGZyb20gJy4vdnVlLXdyYXBwZXInXG5pbXBvcnQgeyB0aHJvd0Vycm9yLCB3YXJuIH0gZnJvbSAnc2hhcmVkL3V0aWwnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFdyYXBwZXJBcnJheSBpbXBsZW1lbnRzIEJhc2VXcmFwcGVyIHtcbiAgK3dyYXBwZXJzOiBBcnJheTxXcmFwcGVyIHwgVnVlV3JhcHBlcj5cbiAgK2xlbmd0aDogbnVtYmVyXG5cbiAgY29uc3RydWN0b3Iod3JhcHBlcnM6IEFycmF5PFdyYXBwZXIgfCBWdWVXcmFwcGVyPikge1xuICAgIGNvbnN0IGxlbmd0aCA9IHdyYXBwZXJzLmxlbmd0aFxuICAgIC8vICRGbG93SWdub3JlXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICd3cmFwcGVycycsIHtcbiAgICAgIGdldDogKCkgPT4gd3JhcHBlcnMsXG4gICAgICBzZXQ6ICgpID0+IHRocm93RXJyb3IoJ3dyYXBwZXJBcnJheS53cmFwcGVycyBpcyByZWFkLW9ubHknKVxuICAgIH0pXG4gICAgLy8gJEZsb3dJZ25vcmVcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2xlbmd0aCcsIHtcbiAgICAgIGdldDogKCkgPT4gbGVuZ3RoLFxuICAgICAgc2V0OiAoKSA9PiB0aHJvd0Vycm9yKCd3cmFwcGVyQXJyYXkubGVuZ3RoIGlzIHJlYWQtb25seScpXG4gICAgfSlcbiAgfVxuXG4gIGF0KGluZGV4OiBudW1iZXIpOiBXcmFwcGVyIHwgVnVlV3JhcHBlciB7XG4gICAgaWYgKGluZGV4ID4gdGhpcy5sZW5ndGggLSAxKSB7XG4gICAgICB0aHJvd0Vycm9yKGBubyBpdGVtIGV4aXN0cyBhdCAke2luZGV4fWApXG4gICAgfVxuICAgIHJldHVybiB0aGlzLndyYXBwZXJzW2luZGV4XVxuICB9XG5cbiAgYXR0cmlidXRlcygpOiB2b2lkIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgnYXR0cmlidXRlcycpXG5cbiAgICB0aHJvd0Vycm9yKFxuICAgICAgYGF0dHJpYnV0ZXMgbXVzdCBiZSBjYWxsZWQgb24gYSBzaW5nbGUgd3JhcHBlciwgdXNlIGAgK1xuICAgICAgICBgYXQoaSkgdG8gYWNjZXNzIGEgd3JhcHBlcmBcbiAgICApXG4gIH1cblxuICBjbGFzc2VzKCk6IHZvaWQge1xuICAgIHRoaXMudGhyb3dFcnJvcklmV3JhcHBlcnNJc0VtcHR5KCdjbGFzc2VzJylcblxuICAgIHRocm93RXJyb3IoXG4gICAgICBgY2xhc3NlcyBtdXN0IGJlIGNhbGxlZCBvbiBhIHNpbmdsZSB3cmFwcGVyLCB1c2UgYCArXG4gICAgICAgIGBhdChpKSB0byBhY2Nlc3MgYSB3cmFwcGVyYFxuICAgIClcbiAgfVxuXG4gIGNvbnRhaW5zKHNlbGVjdG9yOiBTZWxlY3Rvcik6IGJvb2xlYW4ge1xuICAgIHRoaXMudGhyb3dFcnJvcklmV3JhcHBlcnNJc0VtcHR5KCdjb250YWlucycpXG5cbiAgICByZXR1cm4gdGhpcy53cmFwcGVycy5ldmVyeSh3cmFwcGVyID0+IHdyYXBwZXIuY29udGFpbnMoc2VsZWN0b3IpKVxuICB9XG5cbiAgZXhpc3RzKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmxlbmd0aCA+IDAgJiYgdGhpcy53cmFwcGVycy5ldmVyeSh3cmFwcGVyID0+IHdyYXBwZXIuZXhpc3RzKCkpXG4gIH1cblxuICBmaWx0ZXIocHJlZGljYXRlOiBGdW5jdGlvbik6IFdyYXBwZXJBcnJheSB7XG4gICAgcmV0dXJuIG5ldyBXcmFwcGVyQXJyYXkodGhpcy53cmFwcGVycy5maWx0ZXIocHJlZGljYXRlKSlcbiAgfVxuXG4gIGVtaXR0ZWQoKTogdm9pZCB7XG4gICAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ2VtaXR0ZWQnKVxuXG4gICAgdGhyb3dFcnJvcihcbiAgICAgIGBlbWl0dGVkIG11c3QgYmUgY2FsbGVkIG9uIGEgc2luZ2xlIHdyYXBwZXIsIHVzZSBgICtcbiAgICAgICAgYGF0KGkpIHRvIGFjY2VzcyBhIHdyYXBwZXJgXG4gICAgKVxuICB9XG5cbiAgZW1pdHRlZEJ5T3JkZXIoKTogdm9pZCB7XG4gICAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ2VtaXR0ZWRCeU9yZGVyJylcblxuICAgIHRocm93RXJyb3IoXG4gICAgICBgZW1pdHRlZEJ5T3JkZXIgbXVzdCBiZSBjYWxsZWQgb24gYSBzaW5nbGUgd3JhcHBlciwgYCArXG4gICAgICAgIGB1c2UgYXQoaSkgdG8gYWNjZXNzIGEgd3JhcHBlcmBcbiAgICApXG4gIH1cblxuICBmaW5kQWxsKCk6IHZvaWQge1xuICAgIHRoaXMudGhyb3dFcnJvcklmV3JhcHBlcnNJc0VtcHR5KCdmaW5kQWxsJylcblxuICAgIHRocm93RXJyb3IoXG4gICAgICBgZmluZEFsbCBtdXN0IGJlIGNhbGxlZCBvbiBhIHNpbmdsZSB3cmFwcGVyLCB1c2UgYCArXG4gICAgICAgIGBhdChpKSB0byBhY2Nlc3MgYSB3cmFwcGVyYFxuICAgIClcbiAgfVxuXG4gIGZpbmQoKTogdm9pZCB7XG4gICAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ2ZpbmQnKVxuXG4gICAgdGhyb3dFcnJvcihcbiAgICAgIGBmaW5kIG11c3QgYmUgY2FsbGVkIG9uIGEgc2luZ2xlIHdyYXBwZXIsIHVzZSBhdChpKSBgICtcbiAgICAgICAgYHRvIGFjY2VzcyBhIHdyYXBwZXJgXG4gICAgKVxuICB9XG5cbiAgaHRtbCgpOiB2b2lkIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgnaHRtbCcpXG5cbiAgICB0aHJvd0Vycm9yKFxuICAgICAgYGh0bWwgbXVzdCBiZSBjYWxsZWQgb24gYSBzaW5nbGUgd3JhcHBlciwgdXNlIGF0KGkpIGAgK1xuICAgICAgICBgdG8gYWNjZXNzIGEgd3JhcHBlcmBcbiAgICApXG4gIH1cblxuICBpcyhzZWxlY3RvcjogU2VsZWN0b3IpOiBib29sZWFuIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgnaXMnKVxuXG4gICAgcmV0dXJuIHRoaXMud3JhcHBlcnMuZXZlcnkod3JhcHBlciA9PiB3cmFwcGVyLmlzKHNlbGVjdG9yKSlcbiAgfVxuXG4gIGlzRW1wdHkoKTogYm9vbGVhbiB7XG4gICAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ2lzRW1wdHknKVxuXG4gICAgcmV0dXJuIHRoaXMud3JhcHBlcnMuZXZlcnkod3JhcHBlciA9PiB3cmFwcGVyLmlzRW1wdHkoKSlcbiAgfVxuXG4gIGlzVmlzaWJsZSgpOiBib29sZWFuIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgnaXNWaXNpYmxlJylcblxuICAgIHJldHVybiB0aGlzLndyYXBwZXJzLmV2ZXJ5KHdyYXBwZXIgPT4gd3JhcHBlci5pc1Zpc2libGUoKSlcbiAgfVxuXG4gIGlzVnVlSW5zdGFuY2UoKTogYm9vbGVhbiB7XG4gICAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ2lzVnVlSW5zdGFuY2UnKVxuXG4gICAgcmV0dXJuIHRoaXMud3JhcHBlcnMuZXZlcnkod3JhcHBlciA9PiB3cmFwcGVyLmlzVnVlSW5zdGFuY2UoKSlcbiAgfVxuXG4gIG5hbWUoKTogdm9pZCB7XG4gICAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ25hbWUnKVxuXG4gICAgdGhyb3dFcnJvcihcbiAgICAgIGBuYW1lIG11c3QgYmUgY2FsbGVkIG9uIGEgc2luZ2xlIHdyYXBwZXIsIHVzZSBhdChpKSBgICtcbiAgICAgICAgYHRvIGFjY2VzcyBhIHdyYXBwZXJgXG4gICAgKVxuICB9XG5cbiAgcHJvcHMoKTogdm9pZCB7XG4gICAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ3Byb3BzJylcblxuICAgIHRocm93RXJyb3IoXG4gICAgICBgcHJvcHMgbXVzdCBiZSBjYWxsZWQgb24gYSBzaW5nbGUgd3JhcHBlciwgdXNlIGAgK1xuICAgICAgICBgYXQoaSkgdG8gYWNjZXNzIGEgd3JhcHBlcmBcbiAgICApXG4gIH1cblxuICB0ZXh0KCk6IHZvaWQge1xuICAgIHRoaXMudGhyb3dFcnJvcklmV3JhcHBlcnNJc0VtcHR5KCd0ZXh0JylcblxuICAgIHRocm93RXJyb3IoXG4gICAgICBgdGV4dCBtdXN0IGJlIGNhbGxlZCBvbiBhIHNpbmdsZSB3cmFwcGVyLCB1c2UgYXQoaSkgYCArXG4gICAgICAgIGB0byBhY2Nlc3MgYSB3cmFwcGVyYFxuICAgIClcbiAgfVxuXG4gIHRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eShtZXRob2Q6IHN0cmluZyk6IHZvaWQge1xuICAgIGlmICh0aGlzLndyYXBwZXJzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhyb3dFcnJvcihgJHttZXRob2R9IGNhbm5vdCBiZSBjYWxsZWQgb24gMCBpdGVtc2ApXG4gICAgfVxuICB9XG5cbiAgc2V0RGF0YShkYXRhOiBPYmplY3QpOiB2b2lkIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgnc2V0RGF0YScpXG5cbiAgICB0aGlzLndyYXBwZXJzLmZvckVhY2god3JhcHBlciA9PiB3cmFwcGVyLnNldERhdGEoZGF0YSkpXG4gIH1cblxuICBzZXRNZXRob2RzKHByb3BzOiBPYmplY3QpOiB2b2lkIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgnc2V0TWV0aG9kcycpXG5cbiAgICB0aGlzLndyYXBwZXJzLmZvckVhY2god3JhcHBlciA9PiB3cmFwcGVyLnNldE1ldGhvZHMocHJvcHMpKVxuICB9XG5cbiAgc2V0UHJvcHMocHJvcHM6IE9iamVjdCk6IHZvaWQge1xuICAgIHRoaXMudGhyb3dFcnJvcklmV3JhcHBlcnNJc0VtcHR5KCdzZXRQcm9wcycpXG5cbiAgICB0aGlzLndyYXBwZXJzLmZvckVhY2god3JhcHBlciA9PiB3cmFwcGVyLnNldFByb3BzKHByb3BzKSlcbiAgfVxuXG4gIHNldFZhbHVlKHZhbHVlOiBhbnkpOiB2b2lkIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgnc2V0VmFsdWUnKVxuXG4gICAgdGhpcy53cmFwcGVycy5mb3JFYWNoKHdyYXBwZXIgPT4gd3JhcHBlci5zZXRWYWx1ZSh2YWx1ZSkpXG4gIH1cblxuICBzZXRDaGVja2VkKGNoZWNrZWQ6IGJvb2xlYW4gPSB0cnVlKTogdm9pZCB7XG4gICAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ3NldENoZWNrZWQnKVxuXG4gICAgdGhpcy53cmFwcGVycy5mb3JFYWNoKHdyYXBwZXIgPT4gd3JhcHBlci5zZXRDaGVja2VkKGNoZWNrZWQpKVxuICB9XG5cbiAgc2V0U2VsZWN0ZWQoKTogdm9pZCB7XG4gICAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ3NldFNlbGVjdGVkJylcblxuICAgIHRocm93RXJyb3IoXG4gICAgICBgc2V0U2VsZWN0ZWQgbXVzdCBiZSBjYWxsZWQgb24gYSBzaW5nbGUgd3JhcHBlciwgYCArXG4gICAgICAgIGB1c2UgYXQoaSkgdG8gYWNjZXNzIGEgd3JhcHBlcmBcbiAgICApXG4gIH1cblxuICB0cmlnZ2VyKGV2ZW50OiBzdHJpbmcsIG9wdGlvbnM6IE9iamVjdCk6IHZvaWQge1xuICAgIHRoaXMudGhyb3dFcnJvcklmV3JhcHBlcnNJc0VtcHR5KCd0cmlnZ2VyJylcblxuICAgIHRoaXMud3JhcHBlcnMuZm9yRWFjaCh3cmFwcGVyID0+IHdyYXBwZXIudHJpZ2dlcihldmVudCwgb3B0aW9ucykpXG4gIH1cblxuICB1cGRhdGUoKTogdm9pZCB7XG4gICAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ3VwZGF0ZScpXG4gICAgd2FybihcbiAgICAgIGB1cGRhdGUgaGFzIGJlZW4gcmVtb3ZlZC4gQWxsIGNoYW5nZXMgYXJlIG5vdyBgICtcbiAgICAgICAgYHN5bmNocm5vdXMgd2l0aG91dCBjYWxsaW5nIHVwZGF0ZWBcbiAgICApXG4gIH1cblxuICBkZXN0cm95KCk6IHZvaWQge1xuICAgIHRoaXMudGhyb3dFcnJvcklmV3JhcHBlcnNJc0VtcHR5KCdkZXN0cm95JylcblxuICAgIHRoaXMud3JhcHBlcnMuZm9yRWFjaCh3cmFwcGVyID0+IHdyYXBwZXIuZGVzdHJveSgpKVxuICB9XG59XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgeyB0aHJvd0Vycm9yIH0gZnJvbSAnc2hhcmVkL3V0aWwnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEVycm9yV3JhcHBlciBpbXBsZW1lbnRzIEJhc2VXcmFwcGVyIHtcbiAgc2VsZWN0b3I6IHN0cmluZ1xuXG4gIGNvbnN0cnVjdG9yKHNlbGVjdG9yOiBzdHJpbmcpIHtcbiAgICB0aGlzLnNlbGVjdG9yID0gc2VsZWN0b3JcbiAgfVxuXG4gIGF0KCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoXG4gICAgICBgZmluZCBkaWQgbm90IHJldHVybiAke3RoaXMuc2VsZWN0b3J9LCBjYW5ub3QgY2FsbCBhdCgpIG9uIGVtcHR5IFdyYXBwZXJgXG4gICAgKVxuICB9XG5cbiAgYXR0cmlidXRlcygpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKFxuICAgICAgYGZpbmQgZGlkIG5vdCByZXR1cm4gJHtcbiAgICAgICAgdGhpcy5zZWxlY3RvclxuICAgICAgfSwgY2Fubm90IGNhbGwgYXR0cmlidXRlcygpIG9uIGVtcHR5IFdyYXBwZXJgXG4gICAgKVxuICB9XG5cbiAgY2xhc3NlcygpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKFxuICAgICAgYGZpbmQgZGlkIG5vdCByZXR1cm4gJHtcbiAgICAgICAgdGhpcy5zZWxlY3RvclxuICAgICAgfSwgY2Fubm90IGNhbGwgY2xhc3NlcygpIG9uIGVtcHR5IFdyYXBwZXJgXG4gICAgKVxuICB9XG5cbiAgY29udGFpbnMoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihcbiAgICAgIGBmaW5kIGRpZCBub3QgcmV0dXJuICR7XG4gICAgICAgIHRoaXMuc2VsZWN0b3JcbiAgICAgIH0sIGNhbm5vdCBjYWxsIGNvbnRhaW5zKCkgb24gZW1wdHkgV3JhcHBlcmBcbiAgICApXG4gIH1cblxuICBlbWl0dGVkKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoXG4gICAgICBgZmluZCBkaWQgbm90IHJldHVybiAke1xuICAgICAgICB0aGlzLnNlbGVjdG9yXG4gICAgICB9LCBjYW5ub3QgY2FsbCBlbWl0dGVkKCkgb24gZW1wdHkgV3JhcHBlcmBcbiAgICApXG4gIH1cblxuICBlbWl0dGVkQnlPcmRlcigpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKFxuICAgICAgYGZpbmQgZGlkIG5vdCByZXR1cm4gJHtcbiAgICAgICAgdGhpcy5zZWxlY3RvclxuICAgICAgfSwgY2Fubm90IGNhbGwgZW1pdHRlZEJ5T3JkZXIoKSBvbiBlbXB0eSBXcmFwcGVyYFxuICAgIClcbiAgfVxuXG4gIGV4aXN0cygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIGZpbHRlcigpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKFxuICAgICAgYGZpbmQgZGlkIG5vdCByZXR1cm4gJHtcbiAgICAgICAgdGhpcy5zZWxlY3RvclxuICAgICAgfSwgY2Fubm90IGNhbGwgZmlsdGVyKCkgb24gZW1wdHkgV3JhcHBlcmBcbiAgICApXG4gIH1cblxuICB2aXNpYmxlKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoXG4gICAgICBgZmluZCBkaWQgbm90IHJldHVybiAke1xuICAgICAgICB0aGlzLnNlbGVjdG9yXG4gICAgICB9LCBjYW5ub3QgY2FsbCB2aXNpYmxlKCkgb24gZW1wdHkgV3JhcHBlcmBcbiAgICApXG4gIH1cblxuICBoYXNBdHRyaWJ1dGUoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihcbiAgICAgIGBmaW5kIGRpZCBub3QgcmV0dXJuICR7XG4gICAgICAgIHRoaXMuc2VsZWN0b3JcbiAgICAgIH0sIGNhbm5vdCBjYWxsIGhhc0F0dHJpYnV0ZSgpIG9uIGVtcHR5IFdyYXBwZXJgXG4gICAgKVxuICB9XG5cbiAgaGFzQ2xhc3MoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihcbiAgICAgIGBmaW5kIGRpZCBub3QgcmV0dXJuICR7XG4gICAgICAgIHRoaXMuc2VsZWN0b3JcbiAgICAgIH0sIGNhbm5vdCBjYWxsIGhhc0NsYXNzKCkgb24gZW1wdHkgV3JhcHBlcmBcbiAgICApXG4gIH1cblxuICBoYXNQcm9wKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoXG4gICAgICBgZmluZCBkaWQgbm90IHJldHVybiAke1xuICAgICAgICB0aGlzLnNlbGVjdG9yXG4gICAgICB9LCBjYW5ub3QgY2FsbCBoYXNQcm9wKCkgb24gZW1wdHkgV3JhcHBlcmBcbiAgICApXG4gIH1cblxuICBoYXNTdHlsZSgpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKFxuICAgICAgYGZpbmQgZGlkIG5vdCByZXR1cm4gJHtcbiAgICAgICAgdGhpcy5zZWxlY3RvclxuICAgICAgfSwgY2Fubm90IGNhbGwgaGFzU3R5bGUoKSBvbiBlbXB0eSBXcmFwcGVyYFxuICAgIClcbiAgfVxuXG4gIGZpbmRBbGwoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihcbiAgICAgIGBmaW5kIGRpZCBub3QgcmV0dXJuICR7XG4gICAgICAgIHRoaXMuc2VsZWN0b3JcbiAgICAgIH0sIGNhbm5vdCBjYWxsIGZpbmRBbGwoKSBvbiBlbXB0eSBXcmFwcGVyYFxuICAgIClcbiAgfVxuXG4gIGZpbmQoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihcbiAgICAgIGBmaW5kIGRpZCBub3QgcmV0dXJuICR7XG4gICAgICAgIHRoaXMuc2VsZWN0b3JcbiAgICAgIH0sIGNhbm5vdCBjYWxsIGZpbmQoKSBvbiBlbXB0eSBXcmFwcGVyYFxuICAgIClcbiAgfVxuXG4gIGh0bWwoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihcbiAgICAgIGBmaW5kIGRpZCBub3QgcmV0dXJuICR7XG4gICAgICAgIHRoaXMuc2VsZWN0b3JcbiAgICAgIH0sIGNhbm5vdCBjYWxsIGh0bWwoKSBvbiBlbXB0eSBXcmFwcGVyYFxuICAgIClcbiAgfVxuXG4gIGlzKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoXG4gICAgICBgZmluZCBkaWQgbm90IHJldHVybiAke3RoaXMuc2VsZWN0b3J9LCBjYW5ub3QgY2FsbCBpcygpIG9uIGVtcHR5IFdyYXBwZXJgXG4gICAgKVxuICB9XG5cbiAgaXNFbXB0eSgpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKFxuICAgICAgYGZpbmQgZGlkIG5vdCByZXR1cm4gJHtcbiAgICAgICAgdGhpcy5zZWxlY3RvclxuICAgICAgfSwgY2Fubm90IGNhbGwgaXNFbXB0eSgpIG9uIGVtcHR5IFdyYXBwZXJgXG4gICAgKVxuICB9XG5cbiAgaXNWaXNpYmxlKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoXG4gICAgICBgZmluZCBkaWQgbm90IHJldHVybiAke1xuICAgICAgICB0aGlzLnNlbGVjdG9yXG4gICAgICB9LCBjYW5ub3QgY2FsbCBpc1Zpc2libGUoKSBvbiBlbXB0eSBXcmFwcGVyYFxuICAgIClcbiAgfVxuXG4gIGlzVnVlSW5zdGFuY2UoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihcbiAgICAgIGBmaW5kIGRpZCBub3QgcmV0dXJuICR7XG4gICAgICAgIHRoaXMuc2VsZWN0b3JcbiAgICAgIH0sIGNhbm5vdCBjYWxsIGlzVnVlSW5zdGFuY2UoKSBvbiBlbXB0eSBXcmFwcGVyYFxuICAgIClcbiAgfVxuXG4gIG5hbWUoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihcbiAgICAgIGBmaW5kIGRpZCBub3QgcmV0dXJuICR7XG4gICAgICAgIHRoaXMuc2VsZWN0b3JcbiAgICAgIH0sIGNhbm5vdCBjYWxsIG5hbWUoKSBvbiBlbXB0eSBXcmFwcGVyYFxuICAgIClcbiAgfVxuXG4gIHByb3BzKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoXG4gICAgICBgZmluZCBkaWQgbm90IHJldHVybiAke1xuICAgICAgICB0aGlzLnNlbGVjdG9yXG4gICAgICB9LCBjYW5ub3QgY2FsbCBwcm9wcygpIG9uIGVtcHR5IFdyYXBwZXJgXG4gICAgKVxuICB9XG5cbiAgdGV4dCgpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKFxuICAgICAgYGZpbmQgZGlkIG5vdCByZXR1cm4gJHtcbiAgICAgICAgdGhpcy5zZWxlY3RvclxuICAgICAgfSwgY2Fubm90IGNhbGwgdGV4dCgpIG9uIGVtcHR5IFdyYXBwZXJgXG4gICAgKVxuICB9XG5cbiAgc2V0Q29tcHV0ZWQoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihcbiAgICAgIGBmaW5kIGRpZCBub3QgcmV0dXJuICR7XG4gICAgICAgIHRoaXMuc2VsZWN0b3JcbiAgICAgIH0sIGNhbm5vdCBjYWxsIHNldENvbXB1dGVkKCkgb24gZW1wdHkgV3JhcHBlcmBcbiAgICApXG4gIH1cblxuICBzZXREYXRhKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoXG4gICAgICBgZmluZCBkaWQgbm90IHJldHVybiAke1xuICAgICAgICB0aGlzLnNlbGVjdG9yXG4gICAgICB9LCBjYW5ub3QgY2FsbCBzZXREYXRhKCkgb24gZW1wdHkgV3JhcHBlcmBcbiAgICApXG4gIH1cblxuICBzZXRNZXRob2RzKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoXG4gICAgICBgZmluZCBkaWQgbm90IHJldHVybiAke1xuICAgICAgICB0aGlzLnNlbGVjdG9yXG4gICAgICB9LCBjYW5ub3QgY2FsbCBzZXRNZXRob2RzKCkgb24gZW1wdHkgV3JhcHBlcmBcbiAgICApXG4gIH1cblxuICBzZXRQcm9wcygpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKFxuICAgICAgYGZpbmQgZGlkIG5vdCByZXR1cm4gJHtcbiAgICAgICAgdGhpcy5zZWxlY3RvclxuICAgICAgfSwgY2Fubm90IGNhbGwgc2V0UHJvcHMoKSBvbiBlbXB0eSBXcmFwcGVyYFxuICAgIClcbiAgfVxuXG4gIHNldFZhbHVlKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoXG4gICAgICBgZmluZCBkaWQgbm90IHJldHVybiAke1xuICAgICAgICB0aGlzLnNlbGVjdG9yXG4gICAgICB9LCBjYW5ub3QgY2FsbCBzZXRWYWx1ZSgpIG9uIGVtcHR5IFdyYXBwZXJgXG4gICAgKVxuICB9XG5cbiAgc2V0Q2hlY2tlZCgpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKFxuICAgICAgYGZpbmQgZGlkIG5vdCByZXR1cm4gJHtcbiAgICAgICAgdGhpcy5zZWxlY3RvclxuICAgICAgfSwgY2Fubm90IGNhbGwgc2V0Q2hlY2tlZCgpIG9uIGVtcHR5IFdyYXBwZXJgXG4gICAgKVxuICB9XG5cbiAgc2V0U2VsZWN0ZWQoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihcbiAgICAgIGBmaW5kIGRpZCBub3QgcmV0dXJuICR7XG4gICAgICAgIHRoaXMuc2VsZWN0b3JcbiAgICAgIH0sIGNhbm5vdCBjYWxsIHNldFNlbGVjdGVkKCkgb24gZW1wdHkgV3JhcHBlcmBcbiAgICApXG4gIH1cblxuICB0cmlnZ2VyKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoXG4gICAgICBgZmluZCBkaWQgbm90IHJldHVybiAke1xuICAgICAgICB0aGlzLnNlbGVjdG9yXG4gICAgICB9LCBjYW5ub3QgY2FsbCB0cmlnZ2VyKCkgb24gZW1wdHkgV3JhcHBlcmBcbiAgICApXG4gIH1cblxuICB1cGRhdGUoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihcbiAgICAgIGB1cGRhdGUgaGFzIGJlZW4gcmVtb3ZlZCBmcm9tIHZ1ZS10ZXN0LXV0aWxzLmAgK1xuICAgICAgICBgQWxsIHVwZGF0ZXMgYXJlIG5vdyBzeW5jaHJvbm91cyBieSBkZWZhdWx0YFxuICAgIClcbiAgfVxuXG4gIGRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihcbiAgICAgIGBmaW5kIGRpZCBub3QgcmV0dXJuICR7XG4gICAgICAgIHRoaXMuc2VsZWN0b3JcbiAgICAgIH0sIGNhbm5vdCBjYWxsIGRlc3Ryb3koKSBvbiBlbXB0eSBXcmFwcGVyYFxuICAgIClcbiAgfVxufVxuIiwiLy8gQGZsb3dcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZmluZERPTU5vZGVzKFxuICBlbGVtZW50OiBFbGVtZW50IHwgbnVsbCxcbiAgc2VsZWN0b3I6IHN0cmluZ1xuKTogQXJyYXk8Vk5vZGU+IHtcbiAgY29uc3Qgbm9kZXMgPSBbXVxuICBpZiAoIWVsZW1lbnQgfHwgIWVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCB8fCAhZWxlbWVudC5tYXRjaGVzKSB7XG4gICAgcmV0dXJuIG5vZGVzXG4gIH1cblxuICBpZiAoZWxlbWVudC5tYXRjaGVzKHNlbGVjdG9yKSkge1xuICAgIG5vZGVzLnB1c2goZWxlbWVudClcbiAgfVxuICAvLyAkRmxvd0lnbm9yZVxuICByZXR1cm4gbm9kZXMuY29uY2F0KFtdLnNsaWNlLmNhbGwoZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKSkpXG59XG4iLCJpbXBvcnQge1xuICBET01fU0VMRUNUT1IsXG4gIENPTVBPTkVOVF9TRUxFQ1RPUixcbiAgRlVOQ1RJT05BTF9PUFRJT05TXG59IGZyb20gJ3NoYXJlZC9jb25zdHMnXG5pbXBvcnQgeyBpc0NvbnN0cnVjdG9yIH0gZnJvbSAnc2hhcmVkL3ZhbGlkYXRvcnMnXG5cbmV4cG9ydCBmdW5jdGlvbiB2bU1hdGNoZXNOYW1lKHZtLCBuYW1lKSB7XG4gIHJldHVybiAoXG4gICAgISFuYW1lICYmICh2bS5uYW1lID09PSBuYW1lIHx8ICh2bS4kb3B0aW9ucyAmJiB2bS4kb3B0aW9ucy5uYW1lID09PSBuYW1lKSlcbiAgKVxufVxuXG5mdW5jdGlvbiB2bUN0b3JNYXRjaGVzKHZtLCBjb21wb25lbnQpIHtcbiAgaWYgKFxuICAgICh2bS4kb3B0aW9ucyAmJiB2bS4kb3B0aW9ucy4kX3Z1ZVRlc3RVdGlsc19vcmlnaW5hbCA9PT0gY29tcG9uZW50KSB8fFxuICAgIHZtLiRfdnVlVGVzdFV0aWxzX29yaWdpbmFsID09PSBjb21wb25lbnRcbiAgKSB7XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIGNvbnN0IEN0b3IgPSBpc0NvbnN0cnVjdG9yKGNvbXBvbmVudClcbiAgICA/IGNvbXBvbmVudC5vcHRpb25zLl9DdG9yXG4gICAgOiBjb21wb25lbnQuX0N0b3JcblxuICBpZiAoIUN0b3IpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIGlmICh2bS5jb25zdHJ1Y3Rvci5leHRlbmRPcHRpb25zID09PSBjb21wb25lbnQpIHtcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgaWYgKGNvbXBvbmVudC5mdW5jdGlvbmFsKSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHZtLl9DdG9yIHx8IHt9KS5zb21lKGMgPT4ge1xuICAgICAgcmV0dXJuIGNvbXBvbmVudCA9PT0gdm0uX0N0b3JbY10uZXh0ZW5kT3B0aW9uc1xuICAgIH0pXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1hdGNoZXMobm9kZSwgc2VsZWN0b3IpIHtcbiAgaWYgKHNlbGVjdG9yLnR5cGUgPT09IERPTV9TRUxFQ1RPUikge1xuICAgIGNvbnN0IGVsZW1lbnQgPSBub2RlIGluc3RhbmNlb2YgRWxlbWVudCA/IG5vZGUgOiBub2RlLmVsbVxuICAgIHJldHVybiBlbGVtZW50ICYmIGVsZW1lbnQubWF0Y2hlcyAmJiBlbGVtZW50Lm1hdGNoZXMoc2VsZWN0b3IudmFsdWUpXG4gIH1cblxuICBjb25zdCBpc0Z1bmN0aW9uYWxTZWxlY3RvciA9IGlzQ29uc3RydWN0b3Ioc2VsZWN0b3IudmFsdWUpXG4gICAgPyBzZWxlY3Rvci52YWx1ZS5vcHRpb25zLmZ1bmN0aW9uYWxcbiAgICA6IHNlbGVjdG9yLnZhbHVlLmZ1bmN0aW9uYWxcblxuICBjb25zdCBjb21wb25lbnRJbnN0YW5jZSA9IGlzRnVuY3Rpb25hbFNlbGVjdG9yXG4gICAgPyBub2RlW0ZVTkNUSU9OQUxfT1BUSU9OU11cbiAgICA6IG5vZGUuY2hpbGRcblxuICBpZiAoIWNvbXBvbmVudEluc3RhbmNlKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICBpZiAoc2VsZWN0b3IudHlwZSA9PT0gQ09NUE9ORU5UX1NFTEVDVE9SKSB7XG4gICAgaWYgKHZtQ3Rvck1hdGNoZXMoY29tcG9uZW50SW5zdGFuY2UsIHNlbGVjdG9yLnZhbHVlKSkge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gIH1cblxuICAvLyBGYWxsYmFjayB0byBuYW1lIHNlbGVjdG9yIGZvciBDT01QT05FTlRfU0VMRUNUT1IgZm9yIFZ1ZSA8IDIuMVxuICBjb25zdCBuYW1lU2VsZWN0b3IgPSBpc0NvbnN0cnVjdG9yKHNlbGVjdG9yLnZhbHVlKVxuICAgID8gc2VsZWN0b3IudmFsdWUuZXh0ZW5kT3B0aW9ucy5uYW1lXG4gICAgOiBzZWxlY3Rvci52YWx1ZS5uYW1lXG4gIHJldHVybiB2bU1hdGNoZXNOYW1lKGNvbXBvbmVudEluc3RhbmNlLCBuYW1lU2VsZWN0b3IpXG59XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgZmluZERPTU5vZGVzIGZyb20gJy4vZmluZC1kb20tbm9kZXMnXG5pbXBvcnQge1xuICBET01fU0VMRUNUT1IsXG4gIFJFRl9TRUxFQ1RPUixcbiAgQ09NUE9ORU5UX1NFTEVDVE9SLFxuICBWVUVfVkVSU0lPTlxufSBmcm9tICdzaGFyZWQvY29uc3RzJ1xuaW1wb3J0IHsgdGhyb3dFcnJvciB9IGZyb20gJ3NoYXJlZC91dGlsJ1xuaW1wb3J0IHsgbWF0Y2hlcyB9IGZyb20gJy4vbWF0Y2hlcydcblxuZXhwb3J0IGZ1bmN0aW9uIGZpbmRBbGxJbnN0YW5jZXMocm9vdFZtOiBhbnkpIHtcbiAgY29uc3QgaW5zdGFuY2VzID0gW3Jvb3RWbV1cbiAgbGV0IGkgPSAwXG4gIHdoaWxlIChpIDwgaW5zdGFuY2VzLmxlbmd0aCkge1xuICAgIGNvbnN0IHZtID0gaW5zdGFuY2VzW2ldXG4gICAgOyh2bS4kY2hpbGRyZW4gfHwgW10pLmZvckVhY2goY2hpbGQgPT4ge1xuICAgICAgaW5zdGFuY2VzLnB1c2goY2hpbGQpXG4gICAgfSlcbiAgICBpKytcbiAgfVxuICByZXR1cm4gaW5zdGFuY2VzXG59XG5cbmZ1bmN0aW9uIGZpbmRBbGxWTm9kZXModm5vZGU6IFZOb2RlLCBzZWxlY3RvcjogYW55KTogQXJyYXk8Vk5vZGU+IHtcbiAgY29uc3QgbWF0Y2hpbmdOb2RlcyA9IFtdXG4gIGNvbnN0IG5vZGVzID0gW3Zub2RlXVxuICB3aGlsZSAobm9kZXMubGVuZ3RoKSB7XG4gICAgY29uc3Qgbm9kZSA9IG5vZGVzLnNoaWZ0KClcbiAgICBpZiAobm9kZS5jaGlsZHJlbikge1xuICAgICAgY29uc3QgY2hpbGRyZW4gPSBbLi4ubm9kZS5jaGlsZHJlbl0ucmV2ZXJzZSgpXG4gICAgICBjaGlsZHJlbi5mb3JFYWNoKG4gPT4ge1xuICAgICAgICBub2Rlcy51bnNoaWZ0KG4pXG4gICAgICB9KVxuICAgIH1cbiAgICBpZiAobm9kZS5jaGlsZCkge1xuICAgICAgbm9kZXMudW5zaGlmdChub2RlLmNoaWxkLl92bm9kZSlcbiAgICB9XG4gICAgaWYgKG1hdGNoZXMobm9kZSwgc2VsZWN0b3IpKSB7XG4gICAgICBtYXRjaGluZ05vZGVzLnB1c2gobm9kZSlcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbWF0Y2hpbmdOb2Rlc1xufVxuXG5mdW5jdGlvbiByZW1vdmVEdXBsaWNhdGVOb2Rlcyh2Tm9kZXM6IEFycmF5PFZOb2RlPik6IEFycmF5PFZOb2RlPiB7XG4gIGNvbnN0IHZOb2RlRWxtcyA9IHZOb2Rlcy5tYXAodk5vZGUgPT4gdk5vZGUuZWxtKVxuICByZXR1cm4gdk5vZGVzLmZpbHRlcigodk5vZGUsIGluZGV4KSA9PiBpbmRleCA9PT0gdk5vZGVFbG1zLmluZGV4T2Yodk5vZGUuZWxtKSlcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZmluZChcbiAgcm9vdDogVk5vZGUgfCBFbGVtZW50LFxuICB2bT86IENvbXBvbmVudCxcbiAgc2VsZWN0b3I6IFNlbGVjdG9yXG4pOiBBcnJheTxWTm9kZSB8IENvbXBvbmVudD4ge1xuICBpZiAocm9vdCBpbnN0YW5jZW9mIEVsZW1lbnQgJiYgc2VsZWN0b3IudHlwZSAhPT0gRE9NX1NFTEVDVE9SKSB7XG4gICAgdGhyb3dFcnJvcihcbiAgICAgIGBjYW5ub3QgZmluZCBhIFZ1ZSBpbnN0YW5jZSBvbiBhIERPTSBub2RlLiBUaGUgbm9kZSBgICtcbiAgICAgICAgYHlvdSBhcmUgY2FsbGluZyBmaW5kIG9uIGRvZXMgbm90IGV4aXN0IGluIHRoZSBgICtcbiAgICAgICAgYFZEb20uIEFyZSB5b3UgYWRkaW5nIHRoZSBub2RlIGFzIGlubmVySFRNTD9gXG4gICAgKVxuICB9XG5cbiAgaWYgKFxuICAgIHNlbGVjdG9yLnR5cGUgPT09IENPTVBPTkVOVF9TRUxFQ1RPUiAmJlxuICAgIChzZWxlY3Rvci52YWx1ZS5mdW5jdGlvbmFsIHx8XG4gICAgICAoc2VsZWN0b3IudmFsdWUub3B0aW9ucyAmJiBzZWxlY3Rvci52YWx1ZS5vcHRpb25zLmZ1bmN0aW9uYWwpKSAmJlxuICAgIFZVRV9WRVJTSU9OIDwgMi4zXG4gICkge1xuICAgIHRocm93RXJyb3IoXG4gICAgICBgZmluZCBmb3IgZnVuY3Rpb25hbCBjb21wb25lbnRzIGlzIG5vdCBzdXBwb3J0ZWQgYCArIGBpbiBWdWUgPCAyLjNgXG4gICAgKVxuICB9XG5cbiAgaWYgKHJvb3QgaW5zdGFuY2VvZiBFbGVtZW50KSB7XG4gICAgcmV0dXJuIGZpbmRET01Ob2Rlcyhyb290LCBzZWxlY3Rvci52YWx1ZSlcbiAgfVxuXG4gIGlmICghcm9vdCAmJiBzZWxlY3Rvci50eXBlICE9PSBET01fU0VMRUNUT1IpIHtcbiAgICB0aHJvd0Vycm9yKFxuICAgICAgYGNhbm5vdCBmaW5kIGEgVnVlIGluc3RhbmNlIG9uIGEgRE9NIG5vZGUuIFRoZSBub2RlIGAgK1xuICAgICAgICBgeW91IGFyZSBjYWxsaW5nIGZpbmQgb24gZG9lcyBub3QgZXhpc3QgaW4gdGhlIGAgK1xuICAgICAgICBgVkRvbS4gQXJlIHlvdSBhZGRpbmcgdGhlIG5vZGUgYXMgaW5uZXJIVE1MP2BcbiAgICApXG4gIH1cblxuICBpZiAoIXZtICYmIHNlbGVjdG9yLnR5cGUgPT09IFJFRl9TRUxFQ1RPUikge1xuICAgIHRocm93RXJyb3IoYCRyZWYgc2VsZWN0b3JzIGNhbiBvbmx5IGJlIHVzZWQgb24gVnVlIGNvbXBvbmVudCBgICsgYHdyYXBwZXJzYClcbiAgfVxuXG4gIGlmICh2bSAmJiB2bS4kcmVmcyAmJiBzZWxlY3Rvci52YWx1ZS5yZWYgaW4gdm0uJHJlZnMpIHtcbiAgICBjb25zdCByZWZzID0gdm0uJHJlZnNbc2VsZWN0b3IudmFsdWUucmVmXVxuICAgIHJldHVybiBBcnJheS5pc0FycmF5KHJlZnMpID8gcmVmcyA6IFtyZWZzXVxuICB9XG5cbiAgY29uc3Qgbm9kZXMgPSBmaW5kQWxsVk5vZGVzKHJvb3QsIHNlbGVjdG9yKVxuICBjb25zdCBkZWR1cGVkTm9kZXMgPSByZW1vdmVEdXBsaWNhdGVOb2Rlcyhub2RlcylcblxuICBpZiAobm9kZXMubGVuZ3RoID4gMCB8fCBzZWxlY3Rvci50eXBlICE9PSBET01fU0VMRUNUT1IpIHtcbiAgICByZXR1cm4gZGVkdXBlZE5vZGVzXG4gIH1cblxuICAvLyBGYWxsYmFjayBpbiBjYXNlIGVsZW1lbnQgZXhpc3RzIGluIEhUTUwsIGJ1dCBub3QgaW4gdm5vZGUgdHJlZVxuICAvLyAoZS5nLiBpZiBpbm5lckhUTUwgaXMgc2V0IGFzIGEgZG9tUHJvcClcbiAgcmV0dXJuIGZpbmRET01Ob2Rlcyhyb290LmVsbSwgc2VsZWN0b3IudmFsdWUpXG59XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgVnVlIGZyb20gJ3Z1ZSdcbmltcG9ydCBXcmFwcGVyIGZyb20gJy4vd3JhcHBlcidcbmltcG9ydCBWdWVXcmFwcGVyIGZyb20gJy4vdnVlLXdyYXBwZXInXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNyZWF0ZVdyYXBwZXIoXG4gIG5vZGU6IFZOb2RlIHwgQ29tcG9uZW50LFxuICBvcHRpb25zOiBXcmFwcGVyT3B0aW9ucyA9IHt9XG4pOiBWdWVXcmFwcGVyIHwgV3JhcHBlciB7XG4gIGNvbnN0IGNvbXBvbmVudEluc3RhbmNlID0gbm9kZS5jaGlsZFxuICBpZiAoY29tcG9uZW50SW5zdGFuY2UpIHtcbiAgICByZXR1cm4gbmV3IFZ1ZVdyYXBwZXIoY29tcG9uZW50SW5zdGFuY2UsIG9wdGlvbnMpXG4gIH1cbiAgcmV0dXJuIG5vZGUgaW5zdGFuY2VvZiBWdWVcbiAgICA/IG5ldyBWdWVXcmFwcGVyKG5vZGUsIG9wdGlvbnMpXG4gICAgOiBuZXcgV3JhcHBlcihub2RlLCBvcHRpb25zKVxufVxuIiwiLy8gQGZsb3dcblxubGV0IGkgPSAwXG5cbmZ1bmN0aW9uIG9yZGVyRGVwcyh3YXRjaGVyKTogdm9pZCB7XG4gIHdhdGNoZXIuZGVwcy5mb3JFYWNoKGRlcCA9PiB7XG4gICAgaWYgKGRlcC5fc29ydGVkSWQgPT09IGkpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBkZXAuX3NvcnRlZElkID0gaVxuICAgIGRlcC5zdWJzLmZvckVhY2gob3JkZXJEZXBzKVxuICAgIGRlcC5zdWJzID0gZGVwLnN1YnMuc29ydCgoYSwgYikgPT4gYS5pZCAtIGIuaWQpXG4gIH0pXG59XG5cbmZ1bmN0aW9uIG9yZGVyVm1XYXRjaGVycyh2bTogQ29tcG9uZW50KTogdm9pZCB7XG4gIGlmICh2bS5fd2F0Y2hlcnMpIHtcbiAgICB2bS5fd2F0Y2hlcnMuZm9yRWFjaChvcmRlckRlcHMpXG4gIH1cblxuICBpZiAodm0uX2NvbXB1dGVkV2F0Y2hlcnMpIHtcbiAgICBPYmplY3Qua2V5cyh2bS5fY29tcHV0ZWRXYXRjaGVycykuZm9yRWFjaChjb21wdXRlZFdhdGNoZXIgPT4ge1xuICAgICAgb3JkZXJEZXBzKHZtLl9jb21wdXRlZFdhdGNoZXJzW2NvbXB1dGVkV2F0Y2hlcl0pXG4gICAgfSlcbiAgfVxuXG4gIHZtLl93YXRjaGVyICYmIG9yZGVyRGVwcyh2bS5fd2F0Y2hlcilcblxuICB2bS4kY2hpbGRyZW4uZm9yRWFjaChvcmRlclZtV2F0Y2hlcnMpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvcmRlcldhdGNoZXJzKHZtOiBDb21wb25lbnQpOiB2b2lkIHtcbiAgb3JkZXJWbVdhdGNoZXJzKHZtKVxuICBpKytcbn1cbiIsImltcG9ydCB7IGlzUGxhaW5PYmplY3QgfSBmcm9tICdzaGFyZWQvdmFsaWRhdG9ycydcblxuZXhwb3J0IGZ1bmN0aW9uIHJlY3Vyc2l2ZWx5U2V0RGF0YSh2bSwgdGFyZ2V0LCBkYXRhKSB7XG4gIE9iamVjdC5rZXlzKGRhdGEpLmZvckVhY2goa2V5ID0+IHtcbiAgICBjb25zdCB2YWwgPSBkYXRhW2tleV1cbiAgICBjb25zdCB0YXJnZXRWYWwgPSB0YXJnZXRba2V5XVxuXG4gICAgaWYgKGlzUGxhaW5PYmplY3QodmFsKSAmJiBpc1BsYWluT2JqZWN0KHRhcmdldFZhbCkpIHtcbiAgICAgIHJlY3Vyc2l2ZWx5U2V0RGF0YSh2bSwgdGFyZ2V0VmFsLCB2YWwpXG4gICAgfSBlbHNlIHtcbiAgICAgIHZtLiRzZXQodGFyZ2V0LCBrZXksIHZhbClcbiAgICB9XG4gIH0pXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCIuL2RvbS1ldmVudC10eXBlcy5qc29uXCIpO1xuIiwiaW1wb3J0IGV2ZW50VHlwZXMgZnJvbSAnZG9tLWV2ZW50LXR5cGVzJ1xuXG5jb25zdCBkZWZhdWx0RXZlbnRUeXBlID0ge1xuICBldmVudEludGVyZmFjZTogJ0V2ZW50JyxcbiAgY2FuY2VsYWJsZTogdHJ1ZSxcbiAgYnViYmxlczogdHJ1ZVxufVxuXG5jb25zdCBtb2RpZmllcnMgPSB7XG4gIGVudGVyOiAxMyxcbiAgdGFiOiA5LFxuICBkZWxldGU6IDQ2LFxuICBlc2M6IDI3LFxuICBzcGFjZTogMzIsXG4gIHVwOiAzOCxcbiAgZG93bjogNDAsXG4gIGxlZnQ6IDM3LFxuICByaWdodDogMzksXG4gIGVuZDogMzUsXG4gIGhvbWU6IDM2LFxuICBiYWNrc3BhY2U6IDgsXG4gIGluc2VydDogNDUsXG4gIHBhZ2V1cDogMzMsXG4gIHBhZ2Vkb3duOiAzNFxufVxuXG5mdW5jdGlvbiBjcmVhdGVFdmVudChcbiAgdHlwZSxcbiAgbW9kaWZpZXIsXG4gIHsgZXZlbnRJbnRlcmZhY2UsIGJ1YmJsZXMsIGNhbmNlbGFibGUgfSxcbiAgb3B0aW9uc1xuKSB7XG4gIGNvbnN0IFN1cHBvcnRlZEV2ZW50SW50ZXJmYWNlID1cbiAgICB0eXBlb2Ygd2luZG93W2V2ZW50SW50ZXJmYWNlXSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgPyB3aW5kb3dbZXZlbnRJbnRlcmZhY2VdXG4gICAgICA6IHdpbmRvdy5FdmVudFxuXG4gIGNvbnN0IGV2ZW50ID0gbmV3IFN1cHBvcnRlZEV2ZW50SW50ZXJmYWNlKHR5cGUsIHtcbiAgICAvLyBldmVudCBwcm9wZXJ0aWVzIGNhbiBvbmx5IGJlIGFkZGVkIHdoZW4gdGhlIGV2ZW50IGlzIGluc3RhbnRpYXRlZFxuICAgIC8vIGN1c3RvbSBwcm9wZXJ0aWVzIG11c3QgYmUgYWRkZWQgYWZ0ZXIgdGhlIGV2ZW50IGhhcyBiZWVuIGluc3RhbnRpYXRlZFxuICAgIC4uLm9wdGlvbnMsXG4gICAgYnViYmxlcyxcbiAgICBjYW5jZWxhYmxlLFxuICAgIGtleUNvZGU6IG1vZGlmaWVyc1ttb2RpZmllcl1cbiAgfSlcblxuICByZXR1cm4gZXZlbnRcbn1cblxuZnVuY3Rpb24gY3JlYXRlT2xkRXZlbnQoXG4gIHR5cGUsXG4gIG1vZGlmaWVyLFxuICB7IGV2ZW50SW50ZXJmYWNlLCBidWJibGVzLCBjYW5jZWxhYmxlIH1cbikge1xuICBjb25zdCBldmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdFdmVudCcpXG4gIGV2ZW50LmluaXRFdmVudCh0eXBlLCBidWJibGVzLCBjYW5jZWxhYmxlKVxuICBldmVudC5rZXlDb2RlID0gbW9kaWZpZXJzW21vZGlmaWVyXVxuICByZXR1cm4gZXZlbnRcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY3JlYXRlRE9NRXZlbnQodHlwZSwgb3B0aW9ucykge1xuICBjb25zdCBbZXZlbnRUeXBlLCBtb2RpZmllcl0gPSB0eXBlLnNwbGl0KCcuJylcbiAgY29uc3QgbWV0YSA9IGV2ZW50VHlwZXNbZXZlbnRUeXBlXSB8fCBkZWZhdWx0RXZlbnRUeXBlXG5cbiAgLy8gRmFsbGJhY2sgZm9yIElFMTAsMTEgLSBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8yNjU5NjEyM1xuICBjb25zdCBldmVudCA9XG4gICAgdHlwZW9mIHdpbmRvdy5FdmVudCA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgPyBjcmVhdGVFdmVudChldmVudFR5cGUsIG1vZGlmaWVyLCBtZXRhLCBvcHRpb25zKVxuICAgICAgOiBjcmVhdGVPbGRFdmVudChldmVudFR5cGUsIG1vZGlmaWVyLCBtZXRhKVxuXG4gIGNvbnN0IGV2ZW50UHJvdG90eXBlID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKGV2ZW50KVxuICBPYmplY3Qua2V5cyhvcHRpb25zIHx8IHt9KS5mb3JFYWNoKGtleSA9PiB7XG4gICAgY29uc3QgcHJvcGVydHlEZXNjcmlwdG9yID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihcbiAgICAgIGV2ZW50UHJvdG90eXBlLFxuICAgICAga2V5XG4gICAgKVxuXG4gICAgY29uc3QgY2FuU2V0UHJvcGVydHkgPSAhKFxuICAgICAgcHJvcGVydHlEZXNjcmlwdG9yICYmIHByb3BlcnR5RGVzY3JpcHRvci5zZXR0ZXIgPT09IHVuZGVmaW5lZFxuICAgIClcbiAgICBpZiAoY2FuU2V0UHJvcGVydHkpIHtcbiAgICAgIGV2ZW50W2tleV0gPSBvcHRpb25zW2tleV1cbiAgICB9XG4gIH0pXG5cbiAgcmV0dXJuIGV2ZW50XG59XG4iLCJpbXBvcnQgeyB3YXJuIH0gZnJvbSAnc2hhcmVkL3V0aWwnXG5pbXBvcnQgeyBmaW5kQWxsSW5zdGFuY2VzIH0gZnJvbSAnLi9maW5kJ1xuXG5mdW5jdGlvbiBlcnJvckhhbmRsZXIoZXJyb3JPclN0cmluZywgdm0pIHtcbiAgY29uc3QgZXJyb3IgPVxuICAgIHR5cGVvZiBlcnJvck9yU3RyaW5nID09PSAnb2JqZWN0JyA/IGVycm9yT3JTdHJpbmcgOiBuZXcgRXJyb3IoZXJyb3JPclN0cmluZylcblxuICB2bS5fZXJyb3IgPSBlcnJvclxuICB0aHJvdyBlcnJvclxufVxuXG5leHBvcnQgZnVuY3Rpb24gdGhyb3dJZkluc3RhbmNlc1RocmV3KHZtKSB7XG4gIGNvbnN0IGluc3RhbmNlc1dpdGhFcnJvciA9IGZpbmRBbGxJbnN0YW5jZXModm0pLmZpbHRlcihfdm0gPT4gX3ZtLl9lcnJvcilcblxuICBpZiAoaW5zdGFuY2VzV2l0aEVycm9yLmxlbmd0aCA+IDApIHtcbiAgICB0aHJvdyBpbnN0YW5jZXNXaXRoRXJyb3JbMF0uX2Vycm9yXG4gIH1cbn1cblxubGV0IGhhc1dhcm5lZCA9IGZhbHNlXG5cbi8vIFZ1ZSBzd2FsbG93cyBlcnJvcnMgdGhyb3duIGJ5IGluc3RhbmNlcywgZXZlbiBpZiB0aGUgZ2xvYmFsIGVycm9yIGhhbmRsZXJcbi8vIHRocm93cy4gSW4gb3JkZXIgdG8gdGhyb3cgaW4gdGhlIHRlc3QsIHdlIGFkZCBhbiBfZXJyb3IgcHJvcGVydHkgdG8gYW5cbi8vIGluc3RhbmNlIHdoZW4gaXQgdGhyb3dzLiBUaGVuIHdlIGxvb3AgdGhyb3VnaCB0aGUgaW5zdGFuY2VzIHdpdGhcbi8vIHRocm93SWZJbnN0YW5jZXNUaHJldyBhbmQgdGhyb3cgYW4gZXJyb3IgaW4gdGhlIHRlc3QgY29udGV4dCBpZiBhbnlcbi8vIGluc3RhbmNlcyB0aHJldy5cbmV4cG9ydCBmdW5jdGlvbiBhZGRHbG9iYWxFcnJvckhhbmRsZXIoX1Z1ZSkge1xuICBjb25zdCBleGlzdGluZ0Vycm9ySGFuZGxlciA9IF9WdWUuY29uZmlnLmVycm9ySGFuZGxlclxuXG4gIGlmIChleGlzdGluZ0Vycm9ySGFuZGxlciA9PT0gZXJyb3JIYW5kbGVyKSB7XG4gICAgcmV0dXJuXG4gIH1cblxuICBpZiAoX1Z1ZS5jb25maWcuZXJyb3JIYW5kbGVyICYmICFoYXNXYXJuZWQpIHtcbiAgICB3YXJuKFxuICAgICAgYEdsb2JhbCBlcnJvciBoYW5kbGVyIGRldGVjdGVkIChWdWUuY29uZmlnLmVycm9ySGFuZGxlcikuIFxcbmAgK1xuICAgICAgICBgVnVlIFRlc3QgVXRpbHMgc2V0cyBhIGN1c3RvbSBlcnJvciBoYW5kbGVyIHRvIHRocm93IGVycm9ycyBgICtcbiAgICAgICAgYHRocm93biBieSBpbnN0YW5jZXMuIElmIHlvdSB3YW50IHRoaXMgYmVoYXZpb3IgaW4gYCArXG4gICAgICAgIGB5b3VyIHRlc3RzLCB5b3UgbXVzdCByZW1vdmUgdGhlIGdsb2JhbCBlcnJvciBoYW5kbGVyLmBcbiAgICApXG4gICAgaGFzV2FybmVkID0gdHJ1ZVxuICB9IGVsc2Uge1xuICAgIF9WdWUuY29uZmlnLmVycm9ySGFuZGxlciA9IGVycm9ySGFuZGxlclxuICB9XG59XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgVnVlIGZyb20gJ3Z1ZSdcbmltcG9ydCBnZXRTZWxlY3RvciBmcm9tICcuL2dldC1zZWxlY3RvcidcbmltcG9ydCB7IFJFRl9TRUxFQ1RPUiwgRlVOQ1RJT05BTF9PUFRJT05TLCBWVUVfVkVSU0lPTiwgQ09NUEFUX1NZTkNfTU9ERSB9IGZyb20gJ3NoYXJlZC9jb25zdHMnXG5pbXBvcnQgY29uZmlnIGZyb20gJy4vY29uZmlnJ1xuaW1wb3J0IFdyYXBwZXJBcnJheSBmcm9tICcuL3dyYXBwZXItYXJyYXknXG5pbXBvcnQgRXJyb3JXcmFwcGVyIGZyb20gJy4vZXJyb3Itd3JhcHBlcidcbmltcG9ydCB7IHRocm93RXJyb3IsIHdhcm4sIGdldENoZWNrZWRFdmVudCwgaXNQaGFudG9tSlMgfSBmcm9tICdzaGFyZWQvdXRpbCdcbmltcG9ydCBmaW5kIGZyb20gJy4vZmluZCdcbmltcG9ydCBjcmVhdGVXcmFwcGVyIGZyb20gJy4vY3JlYXRlLXdyYXBwZXInXG5pbXBvcnQgeyBvcmRlcldhdGNoZXJzIH0gZnJvbSAnLi9vcmRlci13YXRjaGVycydcbmltcG9ydCB7IHJlY3Vyc2l2ZWx5U2V0RGF0YSB9IGZyb20gJy4vcmVjdXJzaXZlbHktc2V0LWRhdGEnXG5pbXBvcnQgeyBtYXRjaGVzIH0gZnJvbSAnLi9tYXRjaGVzJ1xuaW1wb3J0IGNyZWF0ZURPTUV2ZW50IGZyb20gJy4vY3JlYXRlLWRvbS1ldmVudCdcbmltcG9ydCB7IHRocm93SWZJbnN0YW5jZXNUaHJldyB9IGZyb20gJy4vZXJyb3InXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFdyYXBwZXIgaW1wbGVtZW50cyBCYXNlV3JhcHBlciB7XG4gICt2bm9kZTogVk5vZGUgfCBudWxsXG4gICt2bTogQ29tcG9uZW50IHwgdm9pZFxuICBfZW1pdHRlZDogeyBbbmFtZTogc3RyaW5nXTogQXJyYXk8QXJyYXk8YW55Pj4gfVxuICBfZW1pdHRlZEJ5T3JkZXI6IEFycmF5PHsgbmFtZTogc3RyaW5nLCBhcmdzOiBBcnJheTxhbnk+IH0+XG4gICtlbGVtZW50OiBFbGVtZW50XG4gIHVwZGF0ZTogRnVuY3Rpb25cbiAgK29wdGlvbnM6IFdyYXBwZXJPcHRpb25zXG4gIGlzRnVuY3Rpb25hbENvbXBvbmVudDogYm9vbGVhblxuICByb290Tm9kZTogVk5vZGUgfCBFbGVtZW50XG5cbiAgY29uc3RydWN0b3IoXG4gICAgbm9kZTogVk5vZGUgfCBFbGVtZW50LFxuICAgIG9wdGlvbnM6IFdyYXBwZXJPcHRpb25zLFxuICAgIGlzVnVlV3JhcHBlcj86IGJvb2xlYW5cbiAgKSB7XG4gICAgY29uc3Qgdm5vZGUgPSBub2RlIGluc3RhbmNlb2YgRWxlbWVudCA/IG51bGwgOiBub2RlXG4gICAgY29uc3QgZWxlbWVudCA9IG5vZGUgaW5zdGFuY2VvZiBFbGVtZW50ID8gbm9kZSA6IG5vZGUuZWxtXG4gICAgLy8gUHJldmVudCByZWRlZmluZSBieSBWdWVXcmFwcGVyXG4gICAgaWYgKCFpc1Z1ZVdyYXBwZXIpIHtcbiAgICAgIC8vICRGbG93SWdub3JlIDogaXNzdWUgd2l0aCBkZWZpbmVQcm9wZXJ0eVxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdyb290Tm9kZScsIHtcbiAgICAgICAgZ2V0OiAoKSA9PiB2bm9kZSB8fCBlbGVtZW50LFxuICAgICAgICBzZXQ6ICgpID0+IHRocm93RXJyb3IoJ3dyYXBwZXIucm9vdE5vZGUgaXMgcmVhZC1vbmx5JylcbiAgICAgIH0pXG4gICAgICAvLyAkRmxvd0lnbm9yZVxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICd2bm9kZScsIHtcbiAgICAgICAgZ2V0OiAoKSA9PiB2bm9kZSxcbiAgICAgICAgc2V0OiAoKSA9PiB0aHJvd0Vycm9yKCd3cmFwcGVyLnZub2RlIGlzIHJlYWQtb25seScpXG4gICAgICB9KVxuICAgICAgLy8gJEZsb3dJZ25vcmVcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnZWxlbWVudCcsIHtcbiAgICAgICAgZ2V0OiAoKSA9PiBlbGVtZW50LFxuICAgICAgICBzZXQ6ICgpID0+IHRocm93RXJyb3IoJ3dyYXBwZXIuZWxlbWVudCBpcyByZWFkLW9ubHknKVxuICAgICAgfSlcbiAgICAgIC8vICRGbG93SWdub3JlXG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3ZtJywge1xuICAgICAgICBnZXQ6ICgpID0+IHVuZGVmaW5lZCxcbiAgICAgICAgc2V0OiAoKSA9PiB0aHJvd0Vycm9yKCd3cmFwcGVyLnZtIGlzIHJlYWQtb25seScpXG4gICAgICB9KVxuICAgIH1cbiAgICBjb25zdCBmcm96ZW5PcHRpb25zID0gT2JqZWN0LmZyZWV6ZShvcHRpb25zKVxuICAgIC8vICRGbG93SWdub3JlXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdvcHRpb25zJywge1xuICAgICAgZ2V0OiAoKSA9PiBmcm96ZW5PcHRpb25zLFxuICAgICAgc2V0OiAoKSA9PiB0aHJvd0Vycm9yKCd3cmFwcGVyLm9wdGlvbnMgaXMgcmVhZC1vbmx5JylcbiAgICB9KVxuICAgIGlmIChcbiAgICAgIHRoaXMudm5vZGUgJiZcbiAgICAgICh0aGlzLnZub2RlW0ZVTkNUSU9OQUxfT1BUSU9OU10gfHwgdGhpcy52bm9kZS5mdW5jdGlvbmFsQ29udGV4dClcbiAgICApIHtcbiAgICAgIHRoaXMuaXNGdW5jdGlvbmFsQ29tcG9uZW50ID0gdHJ1ZVxuICAgIH1cbiAgfVxuXG4gIGF0KCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoJ2F0KCkgbXVzdCBiZSBjYWxsZWQgb24gYSBXcmFwcGVyQXJyYXknKVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW4gT2JqZWN0IGNvbnRhaW5pbmcgYWxsIHRoZSBhdHRyaWJ1dGUvdmFsdWUgcGFpcnMgb24gdGhlIGVsZW1lbnQuXG4gICAqL1xuICBhdHRyaWJ1dGVzKGtleT86IHN0cmluZyk6IHsgW25hbWU6IHN0cmluZ106IHN0cmluZyB9IHwgc3RyaW5nIHtcbiAgICBjb25zdCBhdHRyaWJ1dGVzID0gdGhpcy5lbGVtZW50LmF0dHJpYnV0ZXNcbiAgICBjb25zdCBhdHRyaWJ1dGVNYXAgPSB7fVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXR0cmlidXRlcy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgYXR0ID0gYXR0cmlidXRlcy5pdGVtKGkpXG4gICAgICBhdHRyaWJ1dGVNYXBbYXR0LmxvY2FsTmFtZV0gPSBhdHQudmFsdWVcbiAgICB9XG5cbiAgICByZXR1cm4ga2V5ID8gYXR0cmlidXRlTWFwW2tleV0gOiBhdHRyaWJ1dGVNYXBcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIEFycmF5IGNvbnRhaW5pbmcgYWxsIHRoZSBjbGFzc2VzIG9uIHRoZSBlbGVtZW50XG4gICAqL1xuICBjbGFzc2VzKGNsYXNzTmFtZT86IHN0cmluZyk6IEFycmF5PHN0cmluZz4gfCBib29sZWFuIHtcbiAgICBjb25zdCBjbGFzc0F0dHJpYnV0ZSA9IHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ2NsYXNzJylcbiAgICBsZXQgY2xhc3NlcyA9IGNsYXNzQXR0cmlidXRlID8gY2xhc3NBdHRyaWJ1dGUuc3BsaXQoJyAnKSA6IFtdXG4gICAgLy8gSGFuZGxlIGNvbnZlcnRpbmcgY3NzbW9kdWxlcyBpZGVudGlmaWVycyBiYWNrIHRvIHRoZSBvcmlnaW5hbCBjbGFzcyBuYW1lXG4gICAgaWYgKHRoaXMudm0gJiYgdGhpcy52bS4kc3R5bGUpIHtcbiAgICAgIGNvbnN0IGNzc01vZHVsZUlkZW50aWZpZXJzID0gT2JqZWN0LmtleXModGhpcy52bS4kc3R5bGUpLnJlZHVjZShcbiAgICAgICAgKGFjYywga2V5KSA9PiB7XG4gICAgICAgICAgLy8gJEZsb3dJZ25vcmVcbiAgICAgICAgICBjb25zdCBtb2R1bGVJZGVudCA9IHRoaXMudm0uJHN0eWxlW2tleV1cbiAgICAgICAgICBpZiAobW9kdWxlSWRlbnQpIHtcbiAgICAgICAgICAgIGFjY1ttb2R1bGVJZGVudC5zcGxpdCgnICcpWzBdXSA9IGtleVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gYWNjXG4gICAgICAgIH0sXG4gICAgICAgIHt9XG4gICAgICApXG4gICAgICBjbGFzc2VzID0gY2xhc3Nlcy5tYXAobmFtZSA9PiBjc3NNb2R1bGVJZGVudGlmaWVyc1tuYW1lXSB8fCBuYW1lKVxuICAgIH1cblxuICAgIHJldHVybiBjbGFzc05hbWUgPyAhIShjbGFzc2VzLmluZGV4T2YoY2xhc3NOYW1lKSA+IC0xKSA6IGNsYXNzZXNcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgd3JhcHBlciBjb250YWlucyBwcm92aWRlZCBzZWxlY3Rvci5cbiAgICovXG4gIGNvbnRhaW5zKHJhd1NlbGVjdG9yOiBTZWxlY3Rvcik6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHNlbGVjdG9yID0gZ2V0U2VsZWN0b3IocmF3U2VsZWN0b3IsICdjb250YWlucycpXG4gICAgY29uc3Qgbm9kZXMgPSBmaW5kKHRoaXMucm9vdE5vZGUsIHRoaXMudm0sIHNlbGVjdG9yKVxuICAgIHJldHVybiBub2Rlcy5sZW5ndGggPiAwXG4gIH1cblxuICAvKipcbiAgICogQ2FsbHMgZGVzdHJveSBvbiB2bVxuICAgKi9cbiAgZGVzdHJveSgpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuaXNWdWVJbnN0YW5jZSgpKSB7XG4gICAgICB0aHJvd0Vycm9yKGB3cmFwcGVyLmRlc3Ryb3koKSBjYW4gb25seSBiZSBjYWxsZWQgb24gYSBWdWUgaW5zdGFuY2VgKVxuICAgIH1cblxuICAgIGlmICh0aGlzLmVsZW1lbnQucGFyZW50Tm9kZSkge1xuICAgICAgdGhpcy5lbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5lbGVtZW50KVxuICAgIH1cbiAgICAvLyAkRmxvd0lnbm9yZVxuICAgIHRoaXMudm0uJGRlc3Ryb3koKVxuICAgIHRocm93SWZJbnN0YW5jZXNUaHJldyh0aGlzLnZtKVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW4gb2JqZWN0IGNvbnRhaW5pbmcgY3VzdG9tIGV2ZW50cyBlbWl0dGVkIGJ5IHRoZSBXcmFwcGVyIHZtXG4gICAqL1xuICBlbWl0dGVkKFxuICAgIGV2ZW50Pzogc3RyaW5nXG4gICk6IEFycmF5PEFycmF5PGFueT4+IHwgeyBbbmFtZTogc3RyaW5nXTogQXJyYXk8QXJyYXk8YW55Pj4gfSB7XG4gICAgaWYgKCF0aGlzLl9lbWl0dGVkICYmICF0aGlzLnZtKSB7XG4gICAgICB0aHJvd0Vycm9yKGB3cmFwcGVyLmVtaXR0ZWQoKSBjYW4gb25seSBiZSBjYWxsZWQgb24gYSBWdWUgaW5zdGFuY2VgKVxuICAgIH1cbiAgICBpZiAoZXZlbnQpIHtcbiAgICAgIHJldHVybiB0aGlzLl9lbWl0dGVkW2V2ZW50XVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fZW1pdHRlZFxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW4gQXJyYXkgY29udGFpbmluZyBjdXN0b20gZXZlbnRzIGVtaXR0ZWQgYnkgdGhlIFdyYXBwZXIgdm1cbiAgICovXG4gIGVtaXR0ZWRCeU9yZGVyKCk6IEFycmF5PHsgbmFtZTogc3RyaW5nLCBhcmdzOiBBcnJheTxhbnk+IH0+IHtcbiAgICBpZiAoIXRoaXMuX2VtaXR0ZWRCeU9yZGVyICYmICF0aGlzLnZtKSB7XG4gICAgICB0aHJvd0Vycm9yKFxuICAgICAgICBgd3JhcHBlci5lbWl0dGVkQnlPcmRlcigpIGNhbiBvbmx5IGJlIGNhbGxlZCBvbiBhIFZ1ZSBpbnN0YW5jZWBcbiAgICAgIClcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZWRCeU9yZGVyXG4gIH1cblxuICAvKipcbiAgICogVXRpbGl0eSB0byBjaGVjayB3cmFwcGVyIGV4aXN0cy4gUmV0dXJucyB0cnVlIGFzIFdyYXBwZXIgYWx3YXlzIGV4aXN0c1xuICAgKi9cbiAgZXhpc3RzKCk6IGJvb2xlYW4ge1xuICAgIGlmICh0aGlzLnZtKSB7XG4gICAgICByZXR1cm4gISF0aGlzLnZtICYmICF0aGlzLnZtLl9pc0Rlc3Ryb3llZFxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgZmlsdGVyKCkge1xuICAgIHRocm93RXJyb3IoJ2ZpbHRlcigpIG11c3QgYmUgY2FsbGVkIG9uIGEgV3JhcHBlckFycmF5JylcbiAgfVxuXG4gIC8qKlxuICAgKiBGaW5kcyBmaXJzdCBub2RlIGluIHRyZWUgb2YgdGhlIGN1cnJlbnQgd3JhcHBlciB0aGF0XG4gICAqIG1hdGNoZXMgdGhlIHByb3ZpZGVkIHNlbGVjdG9yLlxuICAgKi9cbiAgZmluZChyYXdTZWxlY3RvcjogU2VsZWN0b3IpOiBXcmFwcGVyIHwgRXJyb3JXcmFwcGVyIHtcbiAgICBjb25zdCBzZWxlY3RvciA9IGdldFNlbGVjdG9yKHJhd1NlbGVjdG9yLCAnZmluZCcpXG4gICAgY29uc3Qgbm9kZSA9IGZpbmQodGhpcy5yb290Tm9kZSwgdGhpcy52bSwgc2VsZWN0b3IpWzBdXG5cbiAgICBpZiAoIW5vZGUpIHtcbiAgICAgIGlmIChzZWxlY3Rvci50eXBlID09PSBSRUZfU0VMRUNUT1IpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBFcnJvcldyYXBwZXIoYHJlZj1cIiR7c2VsZWN0b3IudmFsdWUucmVmfVwiYClcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgRXJyb3JXcmFwcGVyKFxuICAgICAgICB0eXBlb2Ygc2VsZWN0b3IudmFsdWUgPT09ICdzdHJpbmcnID8gc2VsZWN0b3IudmFsdWUgOiAnQ29tcG9uZW50J1xuICAgICAgKVxuICAgIH1cblxuICAgIHJldHVybiBjcmVhdGVXcmFwcGVyKG5vZGUsIHRoaXMub3B0aW9ucylcbiAgfVxuXG4gIC8qKlxuICAgKiBGaW5kcyBub2RlIGluIHRyZWUgb2YgdGhlIGN1cnJlbnQgd3JhcHBlciB0aGF0IG1hdGNoZXNcbiAgICogdGhlIHByb3ZpZGVkIHNlbGVjdG9yLlxuICAgKi9cbiAgZmluZEFsbChyYXdTZWxlY3RvcjogU2VsZWN0b3IpOiBXcmFwcGVyQXJyYXkge1xuICAgIGNvbnN0IHNlbGVjdG9yID0gZ2V0U2VsZWN0b3IocmF3U2VsZWN0b3IsICdmaW5kQWxsJylcbiAgICBjb25zdCBub2RlcyA9IGZpbmQodGhpcy5yb290Tm9kZSwgdGhpcy52bSwgc2VsZWN0b3IpXG4gICAgY29uc3Qgd3JhcHBlcnMgPSBub2Rlcy5tYXAobm9kZSA9PiB7XG4gICAgICAvLyBVc2luZyBDU1MgU2VsZWN0b3IsIHJldHVybnMgYSBWdWVXcmFwcGVyIGluc3RhbmNlIGlmIHRoZSByb290IGVsZW1lbnRcbiAgICAgIC8vIGJpbmRzIGEgVnVlIGluc3RhbmNlLlxuICAgICAgcmV0dXJuIGNyZWF0ZVdyYXBwZXIobm9kZSwgdGhpcy5vcHRpb25zKVxuICAgIH0pXG4gICAgcmV0dXJuIG5ldyBXcmFwcGVyQXJyYXkod3JhcHBlcnMpXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBIVE1MIG9mIGVsZW1lbnQgYXMgYSBzdHJpbmdcbiAgICovXG4gIGh0bWwoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50Lm91dGVySFRNTFxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiBub2RlIG1hdGNoZXMgc2VsZWN0b3JcbiAgICovXG4gIGlzKHJhd1NlbGVjdG9yOiBTZWxlY3Rvcik6IGJvb2xlYW4ge1xuICAgIGNvbnN0IHNlbGVjdG9yID0gZ2V0U2VsZWN0b3IocmF3U2VsZWN0b3IsICdpcycpXG5cbiAgICBpZiAoc2VsZWN0b3IudHlwZSA9PT0gUkVGX1NFTEVDVE9SKSB7XG4gICAgICB0aHJvd0Vycm9yKCckcmVmIHNlbGVjdG9ycyBjYW4gbm90IGJlIHVzZWQgd2l0aCB3cmFwcGVyLmlzKCknKVxuICAgIH1cblxuICAgIHJldHVybiBtYXRjaGVzKHRoaXMucm9vdE5vZGUsIHNlbGVjdG9yKVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiBub2RlIGlzIGVtcHR5XG4gICAqL1xuICBpc0VtcHR5KCk6IGJvb2xlYW4ge1xuICAgIGlmICghdGhpcy52bm9kZSkge1xuICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudC5pbm5lckhUTUwgPT09ICcnXG4gICAgfVxuICAgIGNvbnN0IG5vZGVzID0gW11cbiAgICBsZXQgbm9kZSA9IHRoaXMudm5vZGVcbiAgICBsZXQgaSA9IDBcblxuICAgIHdoaWxlIChub2RlKSB7XG4gICAgICBpZiAobm9kZS5jaGlsZCkge1xuICAgICAgICBub2Rlcy5wdXNoKG5vZGUuY2hpbGQuX3Zub2RlKVxuICAgICAgfVxuICAgICAgbm9kZS5jaGlsZHJlbiAmJlxuICAgICAgICBub2RlLmNoaWxkcmVuLmZvckVhY2gobiA9PiB7XG4gICAgICAgICAgbm9kZXMucHVzaChuKVxuICAgICAgICB9KVxuICAgICAgbm9kZSA9IG5vZGVzW2krK11cbiAgICB9XG4gICAgcmV0dXJuIG5vZGVzLmV2ZXJ5KG4gPT4gbi5pc0NvbW1lbnQgfHwgbi5jaGlsZClcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgbm9kZSBpcyB2aXNpYmxlXG4gICAqL1xuICBpc1Zpc2libGUoKTogYm9vbGVhbiB7XG4gICAgbGV0IGVsZW1lbnQgPSB0aGlzLmVsZW1lbnRcbiAgICB3aGlsZSAoZWxlbWVudCkge1xuICAgICAgaWYgKFxuICAgICAgICBlbGVtZW50LnN0eWxlICYmXG4gICAgICAgIChlbGVtZW50LnN0eWxlLnZpc2liaWxpdHkgPT09ICdoaWRkZW4nIHx8XG4gICAgICAgICAgZWxlbWVudC5zdHlsZS5kaXNwbGF5ID09PSAnbm9uZScpXG4gICAgICApIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgICBlbGVtZW50ID0gZWxlbWVudC5wYXJlbnRFbGVtZW50XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgd3JhcHBlciBpcyBhIHZ1ZSBpbnN0YW5jZVxuICAgKi9cbiAgaXNWdWVJbnN0YW5jZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gISF0aGlzLnZtXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBuYW1lIG9mIGNvbXBvbmVudCwgb3IgdGFnIG5hbWUgaWYgbm9kZSBpcyBub3QgYSBWdWUgY29tcG9uZW50XG4gICAqL1xuICBuYW1lKCk6IHN0cmluZyB7XG4gICAgaWYgKHRoaXMudm0pIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIHRoaXMudm0uJG9wdGlvbnMubmFtZSB8fFxuICAgICAgICAvLyBjb21wYXQgZm9yIFZ1ZSA8IDIuM1xuICAgICAgICAodGhpcy52bS4kb3B0aW9ucy5leHRlbmRPcHRpb25zICYmIHRoaXMudm0uJG9wdGlvbnMuZXh0ZW5kT3B0aW9ucy5uYW1lKVxuICAgICAgKVxuICAgIH1cblxuICAgIGlmICghdGhpcy52bm9kZSkge1xuICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudC50YWdOYW1lXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMudm5vZGUudGFnXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiBPYmplY3QgY29udGFpbmluZyB0aGUgcHJvcCBuYW1lL3ZhbHVlIHBhaXJzIG9uIHRoZSBlbGVtZW50XG4gICAqL1xuICBwcm9wcyhrZXk/OiBzdHJpbmcpOiB7IFtuYW1lOiBzdHJpbmddOiBhbnkgfSB8IGFueSB7XG4gICAgaWYgKHRoaXMuaXNGdW5jdGlvbmFsQ29tcG9uZW50KSB7XG4gICAgICB0aHJvd0Vycm9yKFxuICAgICAgICBgd3JhcHBlci5wcm9wcygpIGNhbm5vdCBiZSBjYWxsZWQgb24gYSBtb3VudGVkIGZ1bmN0aW9uYWwgY29tcG9uZW50LmBcbiAgICAgIClcbiAgICB9XG4gICAgaWYgKCF0aGlzLnZtKSB7XG4gICAgICB0aHJvd0Vycm9yKCd3cmFwcGVyLnByb3BzKCkgbXVzdCBiZSBjYWxsZWQgb24gYSBWdWUgaW5zdGFuY2UnKVxuICAgIH1cblxuICAgIGNvbnN0IHByb3BzID0ge31cbiAgICBjb25zdCBrZXlzID0gdGhpcy52bSAmJiB0aGlzLnZtLiRvcHRpb25zLl9wcm9wS2V5c1xuXG4gICAgaWYgKGtleXMpIHtcbiAgICAgIDsoa2V5cyB8fCB7fSkuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICBpZiAodGhpcy52bSkge1xuICAgICAgICAgIHByb3BzW2tleV0gPSB0aGlzLnZtW2tleV1cbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG5cbiAgICBpZiAoa2V5KSB7XG4gICAgICByZXR1cm4gcHJvcHNba2V5XVxuICAgIH1cblxuICAgIHJldHVybiBwcm9wc1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyByYWRpbyBidXR0b24gb3IgY2hlY2tib3ggZWxlbWVudFxuICAgKi9cbiAgc2V0Q2hlY2tlZChjaGVja2VkOiBib29sZWFuID0gdHJ1ZSk6IHZvaWQge1xuICAgIGlmICh0eXBlb2YgY2hlY2tlZCAhPT0gJ2Jvb2xlYW4nKSB7XG4gICAgICB0aHJvd0Vycm9yKCd3cmFwcGVyLnNldENoZWNrZWQoKSBtdXN0IGJlIHBhc3NlZCBhIGJvb2xlYW4nKVxuICAgIH1cbiAgICBjb25zdCB0YWdOYW1lID0gdGhpcy5lbGVtZW50LnRhZ05hbWVcbiAgICAvLyAkRmxvd0lnbm9yZVxuICAgIGNvbnN0IHR5cGUgPSB0aGlzLmF0dHJpYnV0ZXMoKS50eXBlXG4gICAgY29uc3QgZXZlbnQgPSBnZXRDaGVja2VkRXZlbnQoKVxuXG4gICAgaWYgKHRhZ05hbWUgPT09ICdJTlBVVCcgJiYgdHlwZSA9PT0gJ2NoZWNrYm94Jykge1xuICAgICAgaWYgKHRoaXMuZWxlbWVudC5jaGVja2VkID09PSBjaGVja2VkKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgaWYgKGV2ZW50ICE9PSAnY2xpY2snIHx8IGlzUGhhbnRvbUpTKSB7XG4gICAgICAgIC8vICRGbG93SWdub3JlXG4gICAgICAgIHRoaXMuZWxlbWVudC5jaGVja2VkID0gY2hlY2tlZFxuICAgICAgfVxuICAgICAgdGhpcy50cmlnZ2VyKGV2ZW50KVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgaWYgKHRhZ05hbWUgPT09ICdJTlBVVCcgJiYgdHlwZSA9PT0gJ3JhZGlvJykge1xuICAgICAgaWYgKCFjaGVja2VkKSB7XG4gICAgICAgIHRocm93RXJyb3IoXG4gICAgICAgICAgYHdyYXBwZXIuc2V0Q2hlY2tlZCgpIGNhbm5vdCBiZSBjYWxsZWQgd2l0aCBwYXJhbWV0ZXIgZmFsc2Ugb24gYSBgICtcbiAgICAgICAgICAgIGA8aW5wdXQgdHlwZT1cInJhZGlvXCIgLz4gZWxlbWVudC5gXG4gICAgICAgIClcbiAgICAgIH1cblxuICAgICAgaWYgKGV2ZW50ICE9PSAnY2xpY2snIHx8IGlzUGhhbnRvbUpTKSB7XG4gICAgICAgIC8vICRGbG93SWdub3JlXG4gICAgICAgIHRoaXMuZWxlbWVudC5zZWxlY3RlZCA9IHRydWVcbiAgICAgIH1cbiAgICAgIHRoaXMudHJpZ2dlcihldmVudClcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHRocm93RXJyb3IoYHdyYXBwZXIuc2V0Q2hlY2tlZCgpIGNhbm5vdCBiZSBjYWxsZWQgb24gdGhpcyBlbGVtZW50YClcbiAgfVxuXG4gIC8qKlxuICAgKiBTZWxlY3RzIDxvcHRpb24+PC9vcHRpb24+IGVsZW1lbnRcbiAgICovXG4gIHNldFNlbGVjdGVkKCk6IHZvaWQge1xuICAgIGNvbnN0IHRhZ05hbWUgPSB0aGlzLmVsZW1lbnQudGFnTmFtZVxuXG4gICAgaWYgKHRhZ05hbWUgPT09ICdTRUxFQ1QnKSB7XG4gICAgICB0aHJvd0Vycm9yKFxuICAgICAgICBgd3JhcHBlci5zZXRTZWxlY3RlZCgpIGNhbm5vdCBiZSBjYWxsZWQgb24gc2VsZWN0LiBDYWxsIGl0IG9uIG9uZSBvZiBgICtcbiAgICAgICAgICBgaXRzIG9wdGlvbnNgXG4gICAgICApXG4gICAgfVxuXG4gICAgaWYgKHRhZ05hbWUgPT09ICdPUFRJT04nKSB7XG4gICAgICAvLyAkRmxvd0lnbm9yZVxuICAgICAgdGhpcy5lbGVtZW50LnNlbGVjdGVkID0gdHJ1ZVxuICAgICAgLy8gJEZsb3dJZ25vcmVcbiAgICAgIGxldCBwYXJlbnRFbGVtZW50ID0gdGhpcy5lbGVtZW50LnBhcmVudEVsZW1lbnRcblxuICAgICAgLy8gJEZsb3dJZ25vcmVcbiAgICAgIGlmIChwYXJlbnRFbGVtZW50LnRhZ05hbWUgPT09ICdPUFRHUk9VUCcpIHtcbiAgICAgICAgLy8gJEZsb3dJZ25vcmVcbiAgICAgICAgcGFyZW50RWxlbWVudCA9IHBhcmVudEVsZW1lbnQucGFyZW50RWxlbWVudFxuICAgICAgfVxuXG4gICAgICAvLyAkRmxvd0lnbm9yZVxuICAgICAgY3JlYXRlV3JhcHBlcihwYXJlbnRFbGVtZW50LCB0aGlzLm9wdGlvbnMpLnRyaWdnZXIoJ2NoYW5nZScpXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB0aHJvd0Vycm9yKGB3cmFwcGVyLnNldFNlbGVjdGVkKCkgY2Fubm90IGJlIGNhbGxlZCBvbiB0aGlzIGVsZW1lbnRgKVxuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdm0gZGF0YVxuICAgKi9cbiAgc2V0RGF0YShkYXRhOiBPYmplY3QpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5pc0Z1bmN0aW9uYWxDb21wb25lbnQpIHtcbiAgICAgIHRocm93RXJyb3IoYHdyYXBwZXIuc2V0RGF0YSgpIGNhbm5vdCBiZSBjYWxsZWQgb24gYSBmdW5jdGlvbmFsIGNvbXBvbmVudGApXG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLnZtKSB7XG4gICAgICB0aHJvd0Vycm9yKGB3cmFwcGVyLnNldERhdGEoKSBjYW4gb25seSBiZSBjYWxsZWQgb24gYSBWdWUgaW5zdGFuY2VgKVxuICAgIH1cblxuICAgIHJlY3Vyc2l2ZWx5U2V0RGF0YSh0aGlzLnZtLCB0aGlzLnZtLCBkYXRhKVxuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdm0gbWV0aG9kc1xuICAgKi9cbiAgc2V0TWV0aG9kcyhtZXRob2RzOiBPYmplY3QpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuaXNWdWVJbnN0YW5jZSgpKSB7XG4gICAgICB0aHJvd0Vycm9yKGB3cmFwcGVyLnNldE1ldGhvZHMoKSBjYW4gb25seSBiZSBjYWxsZWQgb24gYSBWdWUgaW5zdGFuY2VgKVxuICAgIH1cbiAgICBPYmplY3Qua2V5cyhtZXRob2RzKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICAvLyAkRmxvd0lnbm9yZSA6IFByb2JsZW0gd2l0aCBwb3NzaWJseSBudWxsIHRoaXMudm1cbiAgICAgIHRoaXMudm1ba2V5XSA9IG1ldGhvZHNba2V5XVxuICAgICAgLy8gJEZsb3dJZ25vcmUgOiBQcm9ibGVtIHdpdGggcG9zc2libHkgbnVsbCB0aGlzLnZtXG4gICAgICB0aGlzLnZtLiRvcHRpb25zLm1ldGhvZHNba2V5XSA9IG1ldGhvZHNba2V5XVxuICAgIH0pXG5cbiAgICBpZiAodGhpcy52bm9kZSkge1xuICAgICAgY29uc3QgY29udGV4dCA9IHRoaXMudm5vZGUuY29udGV4dFxuICAgICAgaWYgKGNvbnRleHQuJG9wdGlvbnMucmVuZGVyKSBjb250ZXh0Ll91cGRhdGUoY29udGV4dC5fcmVuZGVyKCkpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdm0gcHJvcHNcbiAgICovXG4gIHNldFByb3BzKGRhdGE6IE9iamVjdCk6IHZvaWQge1xuICAgIGNvbnN0IG9yaWdpbmFsQ29uZmlnID0gVnVlLmNvbmZpZy5zaWxlbnRcbiAgICBWdWUuY29uZmlnLnNpbGVudCA9IGNvbmZpZy5zaWxlbnRcbiAgICBpZiAodGhpcy5pc0Z1bmN0aW9uYWxDb21wb25lbnQpIHtcbiAgICAgIHRocm93RXJyb3IoXG4gICAgICAgIGB3cmFwcGVyLnNldFByb3BzKCkgY2Fubm90IGJlIGNhbGxlZCBvbiBhIGZ1bmN0aW9uYWwgY29tcG9uZW50YFxuICAgICAgKVxuICAgIH1cbiAgICBpZiAoIXRoaXMudm0pIHtcbiAgICAgIHRocm93RXJyb3IoYHdyYXBwZXIuc2V0UHJvcHMoKSBjYW4gb25seSBiZSBjYWxsZWQgb24gYSBWdWUgaW5zdGFuY2VgKVxuICAgIH1cblxuICAgIE9iamVjdC5rZXlzKGRhdGEpLmZvckVhY2goa2V5ID0+IHtcbiAgICAgIGlmIChcbiAgICAgICAgdHlwZW9mIGRhdGFba2V5XSA9PT0gJ29iamVjdCcgJiZcbiAgICAgICAgZGF0YVtrZXldICE9PSBudWxsICYmXG4gICAgICAgIC8vICRGbG93SWdub3JlIDogUHJvYmxlbSB3aXRoIHBvc3NpYmx5IG51bGwgdGhpcy52bVxuICAgICAgICBkYXRhW2tleV0gPT09IHRoaXMudm1ba2V5XVxuICAgICAgKSB7XG4gICAgICAgIHRocm93RXJyb3IoXG4gICAgICAgICAgYHdyYXBwZXIuc2V0UHJvcHMoKSBjYWxsZWQgd2l0aCB0aGUgc2FtZSBvYmplY3Qgb2YgdGhlIGV4aXN0aW5nIGAgK1xuICAgICAgICAgICAgYCR7a2V5fSBwcm9wZXJ0eS4gWW91IG11c3QgY2FsbCB3cmFwcGVyLnNldFByb3BzKCkgd2l0aCBhIG5ldyBgICtcbiAgICAgICAgICAgIGBvYmplY3QgdG8gdHJpZ2dlciByZWFjdGl2aXR5YFxuICAgICAgICApXG4gICAgICB9XG4gICAgICBpZiAoXG4gICAgICAgICF0aGlzLnZtIHx8XG4gICAgICAgICF0aGlzLnZtLiRvcHRpb25zLl9wcm9wS2V5cyB8fFxuICAgICAgICAhdGhpcy52bS4kb3B0aW9ucy5fcHJvcEtleXMuc29tZShwcm9wID0+IHByb3AgPT09IGtleSlcbiAgICAgICkge1xuICAgICAgICBpZiAoVlVFX1ZFUlNJT04gPiAyLjMpIHtcbiAgICAgICAgICAvLyAkRmxvd0lnbm9yZSA6IFByb2JsZW0gd2l0aCBwb3NzaWJseSBudWxsIHRoaXMudm1cbiAgICAgICAgICB0aGlzLnZtLiRhdHRyc1trZXldID0gZGF0YVtrZXldXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgdGhyb3dFcnJvcihcbiAgICAgICAgICBgd3JhcHBlci5zZXRQcm9wcygpIGNhbGxlZCB3aXRoICR7a2V5fSBwcm9wZXJ0eSB3aGljaCBgICtcbiAgICAgICAgICAgIGBpcyBub3QgZGVmaW5lZCBvbiB0aGUgY29tcG9uZW50YFxuICAgICAgICApXG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLnZtICYmIHRoaXMudm0uX3Byb3BzKSB7XG4gICAgICAgIC8vIFNldCBhY3R1YWwgcHJvcHMgdmFsdWVcbiAgICAgICAgdGhpcy52bS5fcHJvcHNba2V5XSA9IGRhdGFba2V5XVxuICAgICAgICAvLyAkRmxvd0lnbm9yZSA6IFByb2JsZW0gd2l0aCBwb3NzaWJseSBudWxsIHRoaXMudm1cbiAgICAgICAgdGhpcy52bVtrZXldID0gZGF0YVtrZXldXG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyAkRmxvd0lnbm9yZSA6IFByb2JsZW0gd2l0aCBwb3NzaWJseSBudWxsIHRoaXMudm0uJG9wdGlvbnNcbiAgICAgICAgdGhpcy52bS4kb3B0aW9ucy5wcm9wc0RhdGFba2V5XSA9IGRhdGFba2V5XVxuICAgICAgICAvLyAkRmxvd0lnbm9yZSA6IFByb2JsZW0gd2l0aCBwb3NzaWJseSBudWxsIHRoaXMudm1cbiAgICAgICAgdGhpcy52bVtrZXldID0gZGF0YVtrZXldXG4gICAgICAgIC8vICRGbG93SWdub3JlIDogTmVlZCB0byBjYWxsIHRoaXMgdHdpY2UgdG8gZml4IHdhdGNoZXIgYnVnIGluIDIuMC54XG4gICAgICAgIHRoaXMudm1ba2V5XSA9IGRhdGFba2V5XVxuICAgICAgfVxuICAgIH0pXG4gICAgLy8gJEZsb3dJZ25vcmUgOiBQcm9ibGVtIHdpdGggcG9zc2libHkgbnVsbCB0aGlzLnZtXG4gICAgdGhpcy52bS4kZm9yY2VVcGRhdGUoKVxuICAgIGlmICh0aGlzLm9wdGlvbnMuc3luYyA9PT0gQ09NUEFUX1NZTkNfTU9ERSkge1xuICAgICAgLy8gJEZsb3dJZ25vcmUgOiBQcm9ibGVtIHdpdGggcG9zc2libHkgbnVsbCB0aGlzLnZtXG4gICAgICBvcmRlcldhdGNoZXJzKHRoaXMudm0gfHwgdGhpcy52bm9kZS5jb250ZXh0LiRyb290KVxuICAgIH1cbiAgICBWdWUuY29uZmlnLnNpbGVudCA9IG9yaWdpbmFsQ29uZmlnXG4gIH1cblxuICAvKipcbiAgICogU2V0cyBlbGVtZW50IHZhbHVlIGFuZCB0cmlnZ2VycyBpbnB1dCBldmVudFxuICAgKi9cbiAgc2V0VmFsdWUodmFsdWU6IGFueSk6IHZvaWQge1xuICAgIGNvbnN0IHRhZ05hbWUgPSB0aGlzLmVsZW1lbnQudGFnTmFtZVxuICAgIC8vICRGbG93SWdub3JlXG4gICAgY29uc3QgdHlwZSA9IHRoaXMuYXR0cmlidXRlcygpLnR5cGVcblxuICAgIGlmICh0YWdOYW1lID09PSAnT1BUSU9OJykge1xuICAgICAgdGhyb3dFcnJvcihcbiAgICAgICAgYHdyYXBwZXIuc2V0VmFsdWUoKSBjYW5ub3QgYmUgY2FsbGVkIG9uIGFuIDxvcHRpb24+IGVsZW1lbnQuIFVzZSBgICtcbiAgICAgICAgICBgd3JhcHBlci5zZXRTZWxlY3RlZCgpIGluc3RlYWRgXG4gICAgICApXG4gICAgfSBlbHNlIGlmICh0YWdOYW1lID09PSAnSU5QVVQnICYmIHR5cGUgPT09ICdjaGVja2JveCcpIHtcbiAgICAgIHRocm93RXJyb3IoXG4gICAgICAgIGB3cmFwcGVyLnNldFZhbHVlKCkgY2Fubm90IGJlIGNhbGxlZCBvbiBhIDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiAvPiBgICtcbiAgICAgICAgICBgZWxlbWVudC4gVXNlIHdyYXBwZXIuc2V0Q2hlY2tlZCgpIGluc3RlYWRgXG4gICAgICApXG4gICAgfSBlbHNlIGlmICh0YWdOYW1lID09PSAnSU5QVVQnICYmIHR5cGUgPT09ICdyYWRpbycpIHtcbiAgICAgIHRocm93RXJyb3IoXG4gICAgICAgIGB3cmFwcGVyLnNldFZhbHVlKCkgY2Fubm90IGJlIGNhbGxlZCBvbiBhIDxpbnB1dCB0eXBlPVwicmFkaW9cIiAvPiBgICtcbiAgICAgICAgICBgZWxlbWVudC4gVXNlIHdyYXBwZXIuc2V0Q2hlY2tlZCgpIGluc3RlYWRgXG4gICAgICApXG4gICAgfSBlbHNlIGlmIChcbiAgICAgIHRhZ05hbWUgPT09ICdJTlBVVCcgfHxcbiAgICAgIHRhZ05hbWUgPT09ICdURVhUQVJFQScgfHxcbiAgICAgIHRhZ05hbWUgPT09ICdTRUxFQ1QnXG4gICAgKSB7XG4gICAgICBjb25zdCBldmVudCA9IHRhZ05hbWUgPT09ICdTRUxFQ1QnID8gJ2NoYW5nZScgOiAnaW5wdXQnXG4gICAgICAvLyAkRmxvd0lnbm9yZVxuICAgICAgdGhpcy5lbGVtZW50LnZhbHVlID0gdmFsdWVcbiAgICAgIHRoaXMudHJpZ2dlcihldmVudClcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3dFcnJvcihgd3JhcHBlci5zZXRWYWx1ZSgpIGNhbm5vdCBiZSBjYWxsZWQgb24gdGhpcyBlbGVtZW50YClcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIHRleHQgb2Ygd3JhcHBlciBlbGVtZW50XG4gICAqL1xuICB0ZXh0KCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudC50ZXh0Q29udGVudC50cmltKClcbiAgfVxuXG4gIC8qKlxuICAgKiBEaXNwYXRjaGVzIGEgRE9NIGV2ZW50IG9uIHdyYXBwZXJcbiAgICovXG4gIHRyaWdnZXIodHlwZTogc3RyaW5nLCBvcHRpb25zOiBPYmplY3QgPSB7fSkge1xuICAgIGlmICh0eXBlb2YgdHlwZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93RXJyb3IoJ3dyYXBwZXIudHJpZ2dlcigpIG11c3QgYmUgcGFzc2VkIGEgc3RyaW5nJylcbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucy50YXJnZXQpIHtcbiAgICAgIHRocm93RXJyb3IoXG4gICAgICAgIGB5b3UgY2Fubm90IHNldCB0aGUgdGFyZ2V0IHZhbHVlIG9mIGFuIGV2ZW50LiBTZWUgdGhlIG5vdGVzIHNlY3Rpb24gYCArXG4gICAgICAgICAgYG9mIHRoZSBkb2NzIGZvciBtb3JlIGRldGFpbHPigJRgICtcbiAgICAgICAgICBgaHR0cHM6Ly92dWUtdGVzdC11dGlscy52dWVqcy5vcmcvYXBpL3dyYXBwZXIvdHJpZ2dlci5odG1sYFxuICAgICAgKVxuICAgIH1cblxuICAgIC8vIERvbid0IGZpcmUgZXZlbnQgb24gYSBkaXNhYmxlZCBlbGVtZW50XG4gICAgaWYgKHRoaXMuYXR0cmlidXRlcygpLmRpc2FibGVkKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb25zdCBldmVudCA9IGNyZWF0ZURPTUV2ZW50KHR5cGUsIG9wdGlvbnMpXG4gICAgdGhpcy5lbGVtZW50LmRpc3BhdGNoRXZlbnQoZXZlbnQpXG5cbiAgICBpZiAodGhpcy52bm9kZSAmJiB0aGlzLm9wdGlvbnMuc3luYyA9PT0gQ09NUEFUX1NZTkNfTU9ERSkge1xuICAgICAgb3JkZXJXYXRjaGVycyh0aGlzLnZtIHx8IHRoaXMudm5vZGUuY29udGV4dC4kcm9vdClcbiAgICB9XG4gIH1cblxuICB1cGRhdGUoKTogdm9pZCB7XG4gICAgd2FybihcbiAgICAgIGB1cGRhdGUgaGFzIGJlZW4gcmVtb3ZlZCBmcm9tIHZ1ZS10ZXN0LXV0aWxzLiBBbGwgdXBkYXRlcyBhcmUgbm93IGAgK1xuICAgICAgICBgc3luY2hyb25vdXMgYnkgZGVmYXVsdGBcbiAgICApXG4gIH1cbn1cbiIsIi8vIEBmbG93XG5cbmltcG9ydCB7IFZVRV9WRVJTSU9OIH0gZnJvbSAnc2hhcmVkL2NvbnN0cydcblxuZnVuY3Rpb24gc2V0RGVwc1N5bmMoZGVwKTogdm9pZCB7XG4gIGRlcC5zdWJzLmZvckVhY2goc2V0V2F0Y2hlclN5bmMpXG59XG5cbmZ1bmN0aW9uIHNldFdhdGNoZXJTeW5jKHdhdGNoZXIpOiB2b2lkIHtcbiAgaWYgKHdhdGNoZXIuc3luYyA9PT0gdHJ1ZSkge1xuICAgIHJldHVyblxuICB9XG4gIHdhdGNoZXIuc3luYyA9IHRydWVcbiAgd2F0Y2hlci5kZXBzLmZvckVhY2goc2V0RGVwc1N5bmMpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRXYXRjaGVyc1RvU3luYyh2bTogQ29tcG9uZW50KTogdm9pZCB7XG4gIGlmICh2bS5fd2F0Y2hlcnMpIHtcbiAgICB2bS5fd2F0Y2hlcnMuZm9yRWFjaChzZXRXYXRjaGVyU3luYylcbiAgfVxuXG4gIGlmICh2bS5fY29tcHV0ZWRXYXRjaGVycykge1xuICAgIE9iamVjdC5rZXlzKHZtLl9jb21wdXRlZFdhdGNoZXJzKS5mb3JFYWNoKGNvbXB1dGVkV2F0Y2hlciA9PiB7XG4gICAgICBzZXRXYXRjaGVyU3luYyh2bS5fY29tcHV0ZWRXYXRjaGVyc1tjb21wdXRlZFdhdGNoZXJdKVxuICAgIH0pXG4gIH1cblxuICBzZXRXYXRjaGVyU3luYyh2bS5fd2F0Y2hlcilcblxuICB2bS4kY2hpbGRyZW4uZm9yRWFjaChzZXRXYXRjaGVyc1RvU3luYylcbiAgLy8gcHJldmVudGluZyBkb3VibGUgcmVnaXN0cmF0aW9uXG4gIGlmICghdm0uJF92dWVUZXN0VXRpbHNfdXBkYXRlSW5TZXRXYXRjaGVyU3luYykge1xuICAgIHZtLiRfdnVlVGVzdFV0aWxzX3VwZGF0ZUluU2V0V2F0Y2hlclN5bmMgPSB2bS5fdXBkYXRlXG4gICAgdm0uX3VwZGF0ZSA9IGZ1bmN0aW9uKHZub2RlLCBoeWRyYXRpbmcpIHtcbiAgICAgIHRoaXMuJF92dWVUZXN0VXRpbHNfdXBkYXRlSW5TZXRXYXRjaGVyU3luYyh2bm9kZSwgaHlkcmF0aW5nKVxuICAgICAgaWYgKFZVRV9WRVJTSU9OID49IDIuMSAmJiB0aGlzLl9pc01vdW50ZWQgJiYgdGhpcy4kb3B0aW9ucy51cGRhdGVkKSB7XG4gICAgICAgIHRoaXMuJG9wdGlvbnMudXBkYXRlZC5mb3JFYWNoKGhhbmRsZXIgPT4ge1xuICAgICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzKVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIiwiLy8gQGZsb3dcblxuaW1wb3J0IFdyYXBwZXIgZnJvbSAnLi93cmFwcGVyJ1xuaW1wb3J0IHsgdGhyb3dFcnJvciB9IGZyb20gJ3NoYXJlZC91dGlsJ1xuaW1wb3J0IHsgc2V0V2F0Y2hlcnNUb1N5bmMgfSBmcm9tICcuL3NldC13YXRjaGVycy10by1zeW5jJ1xuaW1wb3J0IHsgb3JkZXJXYXRjaGVycyB9IGZyb20gJy4vb3JkZXItd2F0Y2hlcnMnXG5pbXBvcnQgeyBDT01QQVRfU1lOQ19NT0RFIH0gZnJvbSAnc2hhcmVkL2NvbnN0cydcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVnVlV3JhcHBlciBleHRlbmRzIFdyYXBwZXIgaW1wbGVtZW50cyBCYXNlV3JhcHBlciB7XG4gIGNvbnN0cnVjdG9yKHZtOiBDb21wb25lbnQsIG9wdGlvbnM6IFdyYXBwZXJPcHRpb25zKSB7XG4gICAgc3VwZXIodm0uX3Zub2RlLCBvcHRpb25zLCB0cnVlKVxuICAgIC8vICRGbG93SWdub3JlIDogaXNzdWUgd2l0aCBkZWZpbmVQcm9wZXJ0eVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAncm9vdE5vZGUnLCB7XG4gICAgICBnZXQ6ICgpID0+IHZtLiR2bm9kZSB8fCB7IGNoaWxkOiB0aGlzLnZtIH0sXG4gICAgICBzZXQ6ICgpID0+IHRocm93RXJyb3IoJ3dyYXBwZXIudm5vZGUgaXMgcmVhZC1vbmx5JylcbiAgICB9KVxuICAgIC8vICRGbG93SWdub3JlIDogaXNzdWUgd2l0aCBkZWZpbmVQcm9wZXJ0eVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAndm5vZGUnLCB7XG4gICAgICBnZXQ6ICgpID0+IHZtLl92bm9kZSxcbiAgICAgIHNldDogKCkgPT4gdGhyb3dFcnJvcignd3JhcHBlci52bm9kZSBpcyByZWFkLW9ubHknKVxuICAgIH0pXG4gICAgLy8gJEZsb3dJZ25vcmVcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2VsZW1lbnQnLCB7XG4gICAgICBnZXQ6ICgpID0+IHZtLiRlbCxcbiAgICAgIHNldDogKCkgPT4gdGhyb3dFcnJvcignd3JhcHBlci5lbGVtZW50IGlzIHJlYWQtb25seScpXG4gICAgfSlcbiAgICAvLyAkRmxvd0lnbm9yZVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAndm0nLCB7XG4gICAgICBnZXQ6ICgpID0+IHZtLFxuICAgICAgc2V0OiAoKSA9PiB0aHJvd0Vycm9yKCd3cmFwcGVyLnZtIGlzIHJlYWQtb25seScpXG4gICAgfSlcbiAgICBpZiAob3B0aW9ucy5zeW5jID09PSBDT01QQVRfU1lOQ19NT0RFKSB7XG4gICAgICBzZXRXYXRjaGVyc1RvU3luYyh2bSlcbiAgICAgIG9yZGVyV2F0Y2hlcnModm0pXG4gICAgfVxuICAgIHRoaXMuaXNGdW5jdGlvbmFsQ29tcG9uZW50ID0gdm0uJG9wdGlvbnMuX2lzRnVuY3Rpb25hbENvbnRhaW5lclxuICAgIHRoaXMuX2VtaXR0ZWQgPSB2bS5fX2VtaXR0ZWRcbiAgICB0aGlzLl9lbWl0dGVkQnlPcmRlciA9IHZtLl9fZW1pdHRlZEJ5T3JkZXJcbiAgfVxufVxuIiwiLy8gQGZsb3dcblxuaW1wb3J0IHsgY29tcGlsZVRvRnVuY3Rpb25zIH0gZnJvbSAndnVlLXRlbXBsYXRlLWNvbXBpbGVyJ1xuXG5mdW5jdGlvbiBjcmVhdGVWTm9kZXModm06IENvbXBvbmVudCwgc2xvdFZhbHVlOiBzdHJpbmcsIG5hbWUpOiBBcnJheTxWTm9kZT4ge1xuICBjb25zdCBlbCA9IGNvbXBpbGVUb0Z1bmN0aW9ucyhcbiAgICBgPGRpdj48dGVtcGxhdGUgc2xvdD0ke25hbWV9PiR7c2xvdFZhbHVlfTwvdGVtcGxhdGU+PC9kaXY+YFxuICApXG4gIGNvbnN0IF9zdGF0aWNSZW5kZXJGbnMgPSB2bS5fcmVuZGVyUHJveHkuJG9wdGlvbnMuc3RhdGljUmVuZGVyRm5zXG4gIGNvbnN0IF9zdGF0aWNUcmVlcyA9IHZtLl9yZW5kZXJQcm94eS5fc3RhdGljVHJlZXNcbiAgdm0uX3JlbmRlclByb3h5Ll9zdGF0aWNUcmVlcyA9IFtdXG4gIHZtLl9yZW5kZXJQcm94eS4kb3B0aW9ucy5zdGF0aWNSZW5kZXJGbnMgPSBlbC5zdGF0aWNSZW5kZXJGbnNcbiAgY29uc3Qgdm5vZGUgPSBlbC5yZW5kZXIuY2FsbCh2bS5fcmVuZGVyUHJveHksIHZtLiRjcmVhdGVFbGVtZW50KVxuICB2bS5fcmVuZGVyUHJveHkuJG9wdGlvbnMuc3RhdGljUmVuZGVyRm5zID0gX3N0YXRpY1JlbmRlckZuc1xuICB2bS5fcmVuZGVyUHJveHkuX3N0YXRpY1RyZWVzID0gX3N0YXRpY1RyZWVzXG4gIHJldHVybiB2bm9kZS5jaGlsZHJlblswXVxufVxuXG5mdW5jdGlvbiBjcmVhdGVWTm9kZXNGb3JTbG90KFxuICB2bTogQ29tcG9uZW50LFxuICBzbG90VmFsdWU6IFNsb3RWYWx1ZSxcbiAgbmFtZTogc3RyaW5nXG4pOiBWTm9kZSB8IEFycmF5PFZOb2RlPiB7XG4gIGlmICh0eXBlb2Ygc2xvdFZhbHVlID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBjcmVhdGVWTm9kZXModm0sIHNsb3RWYWx1ZSwgbmFtZSlcbiAgfVxuICBjb25zdCB2bm9kZSA9IHZtLiRjcmVhdGVFbGVtZW50KHNsb3RWYWx1ZSlcbiAgOyh2bm9kZS5kYXRhIHx8ICh2bm9kZS5kYXRhID0ge30pKS5zbG90ID0gbmFtZVxuICByZXR1cm4gdm5vZGVcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVNsb3RWTm9kZXMoXG4gIHZtOiBDb21wb25lbnQsXG4gIHNsb3RzOiBTbG90c09iamVjdFxuKTogQXJyYXk8Vk5vZGUgfCBBcnJheTxWTm9kZT4+IHtcbiAgcmV0dXJuIE9iamVjdC5rZXlzKHNsb3RzKS5yZWR1Y2UoKGFjYywga2V5KSA9PiB7XG4gICAgY29uc3QgY29udGVudCA9IHNsb3RzW2tleV1cbiAgICBpZiAoQXJyYXkuaXNBcnJheShjb250ZW50KSkge1xuICAgICAgY29uc3Qgbm9kZXMgPSBjb250ZW50Lm1hcChzbG90RGVmID0+XG4gICAgICAgIGNyZWF0ZVZOb2Rlc0ZvclNsb3Qodm0sIHNsb3REZWYsIGtleSlcbiAgICAgIClcbiAgICAgIHJldHVybiBhY2MuY29uY2F0KG5vZGVzKVxuICAgIH1cblxuICAgIHJldHVybiBhY2MuY29uY2F0KGNyZWF0ZVZOb2Rlc0ZvclNsb3Qodm0sIGNvbnRlbnQsIGtleSkpXG4gIH0sIFtdKVxufVxuIiwiLy8gQGZsb3dcbmltcG9ydCAkJFZ1ZSBmcm9tICd2dWUnXG5pbXBvcnQgeyB3YXJuIH0gZnJvbSAnc2hhcmVkL3V0aWwnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGFkZE1vY2tzKFxuICBfVnVlOiBDb21wb25lbnQsXG4gIG1vY2tlZFByb3BlcnRpZXM6IE9iamVjdCB8IGZhbHNlID0ge31cbik6IHZvaWQge1xuICBpZiAobW9ja2VkUHJvcGVydGllcyA9PT0gZmFsc2UpIHtcbiAgICByZXR1cm5cbiAgfVxuICBPYmplY3Qua2V5cyhtb2NrZWRQcm9wZXJ0aWVzKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIC8vICRGbG93SWdub3JlXG4gICAgICBfVnVlLnByb3RvdHlwZVtrZXldID0gbW9ja2VkUHJvcGVydGllc1trZXldXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgd2FybihcbiAgICAgICAgYGNvdWxkIG5vdCBvdmVyd3JpdGUgcHJvcGVydHkgJHtrZXl9LCB0aGlzIGlzIGAgK1xuICAgICAgICAgIGB1c3VhbGx5IGNhdXNlZCBieSBhIHBsdWdpbiB0aGF0IGhhcyBhZGRlZCBgICtcbiAgICAgICAgICBgdGhlIHByb3BlcnR5IGFzIGEgcmVhZC1vbmx5IHZhbHVlYFxuICAgICAgKVxuICAgIH1cbiAgICAvLyAkRmxvd0lnbm9yZVxuICAgICQkVnVlLnV0aWwuZGVmaW5lUmVhY3RpdmUoX1Z1ZSwga2V5LCBtb2NrZWRQcm9wZXJ0aWVzW2tleV0pXG4gIH0pXG59XG4iLCIvLyBAZmxvd1xuXG5leHBvcnQgZnVuY3Rpb24gbG9nRXZlbnRzKFxuICB2bTogQ29tcG9uZW50LFxuICBlbWl0dGVkOiBPYmplY3QsXG4gIGVtaXR0ZWRCeU9yZGVyOiBBcnJheTxhbnk+XG4pOiB2b2lkIHtcbiAgY29uc3QgZW1pdCA9IHZtLiRlbWl0XG4gIHZtLiRlbWl0ID0gKG5hbWUsIC4uLmFyZ3MpID0+IHtcbiAgICA7KGVtaXR0ZWRbbmFtZV0gfHwgKGVtaXR0ZWRbbmFtZV0gPSBbXSkpLnB1c2goYXJncylcbiAgICBlbWl0dGVkQnlPcmRlci5wdXNoKHsgbmFtZSwgYXJncyB9KVxuICAgIHJldHVybiBlbWl0LmNhbGwodm0sIG5hbWUsIC4uLmFyZ3MpXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFkZEV2ZW50TG9nZ2VyKF9WdWU6IENvbXBvbmVudCk6IHZvaWQge1xuICBfVnVlLm1peGluKHtcbiAgICBiZWZvcmVDcmVhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5fX2VtaXR0ZWQgPSBPYmplY3QuY3JlYXRlKG51bGwpXG4gICAgICB0aGlzLl9fZW1pdHRlZEJ5T3JkZXIgPSBbXVxuICAgICAgbG9nRXZlbnRzKHRoaXMsIHRoaXMuX19lbWl0dGVkLCB0aGlzLl9fZW1pdHRlZEJ5T3JkZXIpXG4gICAgfVxuICB9KVxufVxuIiwiaW1wb3J0IHsgQkVGT1JFX1JFTkRFUl9MSUZFQ1lDTEVfSE9PSyB9IGZyb20gJ3NoYXJlZC9jb25zdHMnXG5cbmV4cG9ydCBmdW5jdGlvbiBhZGRTdHVicyhfVnVlLCBzdHViQ29tcG9uZW50cykge1xuICBmdW5jdGlvbiBhZGRTdHViQ29tcG9uZW50c01peGluKCkge1xuICAgIE9iamVjdC5hc3NpZ24odGhpcy4kb3B0aW9ucy5jb21wb25lbnRzLCBzdHViQ29tcG9uZW50cylcbiAgfVxuXG4gIF9WdWUubWl4aW4oe1xuICAgIFtCRUZPUkVfUkVOREVSX0xJRkVDWUNMRV9IT09LXTogYWRkU3R1YkNvbXBvbmVudHNNaXhpblxuICB9KVxufVxuIiwiLy8gQGZsb3dcblxuaW1wb3J0IHsgY29tcGlsZVRvRnVuY3Rpb25zIH0gZnJvbSAndnVlLXRlbXBsYXRlLWNvbXBpbGVyJ1xuaW1wb3J0IHsgY29tcG9uZW50TmVlZHNDb21waWxpbmcgfSBmcm9tICcuL3ZhbGlkYXRvcnMnXG5pbXBvcnQgeyB0aHJvd0Vycm9yIH0gZnJvbSAnLi91dGlsJ1xuXG5leHBvcnQgZnVuY3Rpb24gY29tcGlsZUZyb21TdHJpbmcoc3RyOiBzdHJpbmcpIHtcbiAgaWYgKCFjb21waWxlVG9GdW5jdGlvbnMpIHtcbiAgICB0aHJvd0Vycm9yKFxuICAgICAgYHZ1ZVRlbXBsYXRlQ29tcGlsZXIgaXMgdW5kZWZpbmVkLCB5b3UgbXVzdCBwYXNzIGAgK1xuICAgICAgICBgcHJlY29tcGlsZWQgY29tcG9uZW50cyBpZiB2dWUtdGVtcGxhdGUtY29tcGlsZXIgaXMgYCArXG4gICAgICAgIGB1bmRlZmluZWRgXG4gICAgKVxuICB9XG4gIHJldHVybiBjb21waWxlVG9GdW5jdGlvbnMoc3RyKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY29tcGlsZVRlbXBsYXRlKGNvbXBvbmVudDogQ29tcG9uZW50KTogdm9pZCB7XG4gIGlmIChjb21wb25lbnQudGVtcGxhdGUpIHtcbiAgICBPYmplY3QuYXNzaWduKGNvbXBvbmVudCwgY29tcGlsZVRvRnVuY3Rpb25zKGNvbXBvbmVudC50ZW1wbGF0ZSkpXG4gIH1cblxuICBpZiAoY29tcG9uZW50LmNvbXBvbmVudHMpIHtcbiAgICBPYmplY3Qua2V5cyhjb21wb25lbnQuY29tcG9uZW50cykuZm9yRWFjaChjID0+IHtcbiAgICAgIGNvbnN0IGNtcCA9IGNvbXBvbmVudC5jb21wb25lbnRzW2NdXG4gICAgICBpZiAoIWNtcC5yZW5kZXIpIHtcbiAgICAgICAgY29tcGlsZVRlbXBsYXRlKGNtcClcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgaWYgKGNvbXBvbmVudC5leHRlbmRzKSB7XG4gICAgY29tcGlsZVRlbXBsYXRlKGNvbXBvbmVudC5leHRlbmRzKVxuICB9XG5cbiAgaWYgKGNvbXBvbmVudC5leHRlbmRPcHRpb25zICYmICFjb21wb25lbnQub3B0aW9ucy5yZW5kZXIpIHtcbiAgICBjb21waWxlVGVtcGxhdGUoY29tcG9uZW50Lm9wdGlvbnMpXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbXBpbGVUZW1wbGF0ZUZvclNsb3RzKHNsb3RzOiBPYmplY3QpOiB2b2lkIHtcbiAgT2JqZWN0LmtleXMoc2xvdHMpLmZvckVhY2goa2V5ID0+IHtcbiAgICBjb25zdCBzbG90ID0gQXJyYXkuaXNBcnJheShzbG90c1trZXldKSA/IHNsb3RzW2tleV0gOiBbc2xvdHNba2V5XV1cbiAgICBzbG90LmZvckVhY2goc2xvdFZhbHVlID0+IHtcbiAgICAgIGlmIChjb21wb25lbnROZWVkc0NvbXBpbGluZyhzbG90VmFsdWUpKSB7XG4gICAgICAgIGNvbXBpbGVUZW1wbGF0ZShzbG90VmFsdWUpXG4gICAgICB9XG4gICAgfSlcbiAgfSlcbn1cbiIsIi8vIEBmbG93XG5cbmNvbnN0IE1PVU5USU5HX09QVElPTlMgPSBbXG4gICdhdHRhY2hUb0RvY3VtZW50JyxcbiAgJ21vY2tzJyxcbiAgJ3Nsb3RzJyxcbiAgJ2xvY2FsVnVlJyxcbiAgJ3N0dWJzJyxcbiAgJ2NvbnRleHQnLFxuICAnY2xvbmUnLFxuICAnYXR0cnMnLFxuICAnbGlzdGVuZXJzJyxcbiAgJ3Byb3BzRGF0YScsXG4gICdzeW5jJyxcbiAgJ3Nob3VsZFByb3h5J1xuXVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBleHRyYWN0SW5zdGFuY2VPcHRpb25zKG9wdGlvbnM6IE9iamVjdCk6IE9iamVjdCB7XG4gIGNvbnN0IGluc3RhbmNlT3B0aW9ucyA9IHtcbiAgICAuLi5vcHRpb25zXG4gIH1cbiAgTU9VTlRJTkdfT1BUSU9OUy5mb3JFYWNoKG1vdW50aW5nT3B0aW9uID0+IHtcbiAgICBkZWxldGUgaW5zdGFuY2VPcHRpb25zW21vdW50aW5nT3B0aW9uXVxuICB9KVxuICByZXR1cm4gaW5zdGFuY2VPcHRpb25zXG59XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgeyBjb21waWxlVG9GdW5jdGlvbnMgfSBmcm9tICd2dWUtdGVtcGxhdGUtY29tcGlsZXInXG5pbXBvcnQgeyB0aHJvd0Vycm9yIH0gZnJvbSAnc2hhcmVkL3V0aWwnXG5pbXBvcnQgeyBWVUVfVkVSU0lPTiB9IGZyb20gJ3NoYXJlZC9jb25zdHMnXG5cbmZ1bmN0aW9uIGlzRGVzdHJ1Y3R1cmluZ1Nsb3RTY29wZShzbG90U2NvcGU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gc2xvdFNjb3BlWzBdID09PSAneycgJiYgc2xvdFNjb3BlW3Nsb3RTY29wZS5sZW5ndGggLSAxXSA9PT0gJ30nXG59XG5cbmZ1bmN0aW9uIGdldFZ1ZVRlbXBsYXRlQ29tcGlsZXJIZWxwZXJzKFxuICBfVnVlOiBDb21wb25lbnRcbik6IHsgW25hbWU6IHN0cmluZ106IEZ1bmN0aW9uIH0ge1xuICAvLyAkRmxvd0lnbm9yZVxuICBjb25zdCB2dWUgPSBuZXcgX1Z1ZSgpXG4gIGNvbnN0IGhlbHBlcnMgPSB7fVxuICBjb25zdCBuYW1lcyA9IFtcbiAgICAnX2MnLFxuICAgICdfbycsXG4gICAgJ19uJyxcbiAgICAnX3MnLFxuICAgICdfbCcsXG4gICAgJ190JyxcbiAgICAnX3EnLFxuICAgICdfaScsXG4gICAgJ19tJyxcbiAgICAnX2YnLFxuICAgICdfaycsXG4gICAgJ19iJyxcbiAgICAnX3YnLFxuICAgICdfZScsXG4gICAgJ191JyxcbiAgICAnX2cnXG4gIF1cbiAgbmFtZXMuZm9yRWFjaChuYW1lID0+IHtcbiAgICBoZWxwZXJzW25hbWVdID0gdnVlLl9yZW5kZXJQcm94eVtuYW1lXVxuICB9KVxuICBoZWxwZXJzLiRjcmVhdGVFbGVtZW50ID0gdnVlLl9yZW5kZXJQcm94eS4kY3JlYXRlRWxlbWVudFxuICByZXR1cm4gaGVscGVyc1xufVxuXG5mdW5jdGlvbiB2YWxpZGF0ZUVudmlyb25tZW50KCk6IHZvaWQge1xuICBpZiAoVlVFX1ZFUlNJT04gPCAyLjEpIHtcbiAgICB0aHJvd0Vycm9yKGB0aGUgc2NvcGVkU2xvdHMgb3B0aW9uIGlzIG9ubHkgc3VwcG9ydGVkIGluIHZ1ZUAyLjErLmApXG4gIH1cbn1cblxuY29uc3Qgc2xvdFNjb3BlUmUgPSAvPFtePl0rIHNsb3Qtc2NvcGU9XFxcIiguKylcXFwiL1xuXG4vLyBIaWRlIHdhcm5pbmcgYWJvdXQgPHRlbXBsYXRlPiBkaXNhbGxvd2VkIGFzIHJvb3QgZWxlbWVudFxuZnVuY3Rpb24gY3VzdG9tV2Fybihtc2cpIHtcbiAgaWYgKG1zZy5pbmRleE9mKCdDYW5ub3QgdXNlIDx0ZW1wbGF0ZT4gYXMgY29tcG9uZW50IHJvb3QgZWxlbWVudCcpID09PSAtMSkge1xuICAgIGNvbnNvbGUuZXJyb3IobXNnKVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNyZWF0ZVNjb3BlZFNsb3RzKFxuICBzY29wZWRTbG90c09wdGlvbjogP3sgW3Nsb3ROYW1lOiBzdHJpbmddOiBzdHJpbmcgfCBGdW5jdGlvbiB9LFxuICBfVnVlOiBDb21wb25lbnRcbik6IHtcbiAgW3Nsb3ROYW1lOiBzdHJpbmddOiAocHJvcHM6IE9iamVjdCkgPT4gVk5vZGUgfCBBcnJheTxWTm9kZT5cbn0ge1xuICBjb25zdCBzY29wZWRTbG90cyA9IHt9XG4gIGlmICghc2NvcGVkU2xvdHNPcHRpb24pIHtcbiAgICByZXR1cm4gc2NvcGVkU2xvdHNcbiAgfVxuICB2YWxpZGF0ZUVudmlyb25tZW50KClcbiAgY29uc3QgaGVscGVycyA9IGdldFZ1ZVRlbXBsYXRlQ29tcGlsZXJIZWxwZXJzKF9WdWUpXG4gIGZvciAoY29uc3Qgc2NvcGVkU2xvdE5hbWUgaW4gc2NvcGVkU2xvdHNPcHRpb24pIHtcbiAgICBjb25zdCBzbG90ID0gc2NvcGVkU2xvdHNPcHRpb25bc2NvcGVkU2xvdE5hbWVdXG4gICAgY29uc3QgaXNGbiA9IHR5cGVvZiBzbG90ID09PSAnZnVuY3Rpb24nXG4gICAgLy8gVHlwZSBjaGVjayB0byBzaWxlbmNlIGZsb3cgKGNhbid0IHVzZSBpc0ZuKVxuICAgIGNvbnN0IHJlbmRlckZuID1cbiAgICAgIHR5cGVvZiBzbG90ID09PSAnZnVuY3Rpb24nXG4gICAgICAgID8gc2xvdFxuICAgICAgICA6IGNvbXBpbGVUb0Z1bmN0aW9ucyhzbG90LCB7IHdhcm46IGN1c3RvbVdhcm4gfSkucmVuZGVyXG5cbiAgICBjb25zdCBoYXNTbG90U2NvcGVBdHRyID0gIWlzRm4gJiYgc2xvdC5tYXRjaChzbG90U2NvcGVSZSlcbiAgICBjb25zdCBzbG90U2NvcGUgPSBoYXNTbG90U2NvcGVBdHRyICYmIGhhc1Nsb3RTY29wZUF0dHJbMV1cbiAgICBzY29wZWRTbG90c1tzY29wZWRTbG90TmFtZV0gPSBmdW5jdGlvbihwcm9wcykge1xuICAgICAgbGV0IHJlc1xuICAgICAgaWYgKGlzRm4pIHtcbiAgICAgICAgcmVzID0gcmVuZGVyRm4uY2FsbCh7IC4uLmhlbHBlcnMgfSwgcHJvcHMpXG4gICAgICB9IGVsc2UgaWYgKHNsb3RTY29wZSAmJiAhaXNEZXN0cnVjdHVyaW5nU2xvdFNjb3BlKHNsb3RTY29wZSkpIHtcbiAgICAgICAgcmVzID0gcmVuZGVyRm4uY2FsbCh7IC4uLmhlbHBlcnMsIFtzbG90U2NvcGVdOiBwcm9wcyB9KVxuICAgICAgfSBlbHNlIGlmIChzbG90U2NvcGUgJiYgaXNEZXN0cnVjdHVyaW5nU2xvdFNjb3BlKHNsb3RTY29wZSkpIHtcbiAgICAgICAgcmVzID0gcmVuZGVyRm4uY2FsbCh7IC4uLmhlbHBlcnMsIC4uLnByb3BzIH0pXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXMgPSByZW5kZXJGbi5jYWxsKHsgLi4uaGVscGVycywgcHJvcHMgfSlcbiAgICAgIH1cbiAgICAgIC8vIHJlcyBpcyBBcnJheSBpZiA8dGVtcGxhdGU+IGlzIGEgcm9vdCBlbGVtZW50XG4gICAgICByZXR1cm4gQXJyYXkuaXNBcnJheShyZXMpID8gcmVzWzBdIDogcmVzXG4gICAgfVxuICB9XG4gIHJldHVybiBzY29wZWRTbG90c1xufVxuIiwiLy8gQGZsb3dcblxuaW1wb3J0IFZ1ZSBmcm9tICd2dWUnXG5pbXBvcnQgeyB0aHJvd0Vycm9yLCBjYW1lbGl6ZSwgY2FwaXRhbGl6ZSwgaHlwaGVuYXRlIH0gZnJvbSAnLi4vc2hhcmVkL3V0aWwnXG5pbXBvcnQge1xuICBjb21wb25lbnROZWVkc0NvbXBpbGluZyxcbiAgdGVtcGxhdGVDb250YWluc0NvbXBvbmVudCxcbiAgaXNWdWVDb21wb25lbnQsXG4gIGlzRHluYW1pY0NvbXBvbmVudCxcbiAgaXNDb25zdHJ1Y3RvclxufSBmcm9tICcuLi9zaGFyZWQvdmFsaWRhdG9ycydcbmltcG9ydCB7IGNvbXBpbGVUZW1wbGF0ZSwgY29tcGlsZUZyb21TdHJpbmcgfSBmcm9tICcuLi9zaGFyZWQvY29tcGlsZS10ZW1wbGF0ZSdcblxuZnVuY3Rpb24gaXNWdWVDb21wb25lbnRTdHViKGNvbXApOiBib29sZWFuIHtcbiAgcmV0dXJuIChjb21wICYmIGNvbXAudGVtcGxhdGUpIHx8IGlzVnVlQ29tcG9uZW50KGNvbXApXG59XG5cbmZ1bmN0aW9uIGlzVmFsaWRTdHViKHN0dWI6IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gKFxuICAgIHR5cGVvZiBzdHViID09PSAnYm9vbGVhbicgfHxcbiAgICAoISFzdHViICYmIHR5cGVvZiBzdHViID09PSAnc3RyaW5nJykgfHxcbiAgICBpc1Z1ZUNvbXBvbmVudFN0dWIoc3R1YilcbiAgKVxufVxuXG5mdW5jdGlvbiByZXNvbHZlQ29tcG9uZW50KG9iajogT2JqZWN0LCBjb21wb25lbnQ6IHN0cmluZyk6IE9iamVjdCB7XG4gIHJldHVybiAoXG4gICAgb2JqW2NvbXBvbmVudF0gfHxcbiAgICBvYmpbaHlwaGVuYXRlKGNvbXBvbmVudCldIHx8XG4gICAgb2JqW2NhbWVsaXplKGNvbXBvbmVudCldIHx8XG4gICAgb2JqW2NhcGl0YWxpemUoY2FtZWxpemUoY29tcG9uZW50KSldIHx8XG4gICAgb2JqW2NhcGl0YWxpemUoY29tcG9uZW50KV0gfHxcbiAgICB7fVxuICApXG59XG5cbmZ1bmN0aW9uIGdldENvcmVQcm9wZXJ0aWVzKGNvbXBvbmVudE9wdGlvbnM6IENvbXBvbmVudCk6IE9iamVjdCB7XG4gIHJldHVybiB7XG4gICAgYXR0cnM6IGNvbXBvbmVudE9wdGlvbnMuYXR0cnMsXG4gICAgbmFtZTogY29tcG9uZW50T3B0aW9ucy5uYW1lLFxuICAgIHByb3BzOiBjb21wb25lbnRPcHRpb25zLnByb3BzLFxuICAgIG9uOiBjb21wb25lbnRPcHRpb25zLm9uLFxuICAgIGtleTogY29tcG9uZW50T3B0aW9ucy5rZXksXG4gICAgcmVmOiBjb21wb25lbnRPcHRpb25zLnJlZixcbiAgICBkb21Qcm9wczogY29tcG9uZW50T3B0aW9ucy5kb21Qcm9wcyxcbiAgICBjbGFzczogY29tcG9uZW50T3B0aW9ucy5jbGFzcyxcbiAgICBzdGF0aWNDbGFzczogY29tcG9uZW50T3B0aW9ucy5zdGF0aWNDbGFzcyxcbiAgICBzdGF0aWNTdHlsZTogY29tcG9uZW50T3B0aW9ucy5zdGF0aWNTdHlsZSxcbiAgICBzdHlsZTogY29tcG9uZW50T3B0aW9ucy5zdHlsZSxcbiAgICBub3JtYWxpemVkU3R5bGU6IGNvbXBvbmVudE9wdGlvbnMubm9ybWFsaXplZFN0eWxlLFxuICAgIG5hdGl2ZU9uOiBjb21wb25lbnRPcHRpb25zLm5hdGl2ZU9uLFxuICAgIGZ1bmN0aW9uYWw6IGNvbXBvbmVudE9wdGlvbnMuZnVuY3Rpb25hbFxuICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUNsYXNzU3RyaW5nKHN0YXRpY0NsYXNzLCBkeW5hbWljQ2xhc3MpIHtcbiAgaWYgKHN0YXRpY0NsYXNzICYmIGR5bmFtaWNDbGFzcykge1xuICAgIHJldHVybiBzdGF0aWNDbGFzcyArICcgJyArIGR5bmFtaWNDbGFzc1xuICB9XG4gIHJldHVybiBzdGF0aWNDbGFzcyB8fCBkeW5hbWljQ2xhc3Ncbn1cblxuZnVuY3Rpb24gcmVzb2x2ZU9wdGlvbnMoY29tcG9uZW50LCBfVnVlKSB7XG4gIGlmIChpc0R5bmFtaWNDb21wb25lbnQoY29tcG9uZW50KSkge1xuICAgIHJldHVybiB7fVxuICB9XG5cbiAgcmV0dXJuIGlzQ29uc3RydWN0b3IoY29tcG9uZW50KVxuICAgID8gY29tcG9uZW50Lm9wdGlvbnNcbiAgICA6IF9WdWUuZXh0ZW5kKGNvbXBvbmVudCkub3B0aW9uc1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU3R1YkZyb21Db21wb25lbnQoXG4gIG9yaWdpbmFsQ29tcG9uZW50OiBDb21wb25lbnQsXG4gIG5hbWU6IHN0cmluZyxcbiAgX1Z1ZTogQ29tcG9uZW50XG4pOiBDb21wb25lbnQge1xuICBjb25zdCBjb21wb25lbnRPcHRpb25zID0gcmVzb2x2ZU9wdGlvbnMob3JpZ2luYWxDb21wb25lbnQsIF9WdWUpXG4gIGNvbnN0IHRhZ05hbWUgPSBgJHtuYW1lIHx8ICdhbm9ueW1vdXMnfS1zdHViYFxuXG4gIC8vIGlnbm9yZUVsZW1lbnRzIGRvZXMgbm90IGV4aXN0IGluIFZ1ZSAyLjAueFxuICBpZiAoVnVlLmNvbmZpZy5pZ25vcmVkRWxlbWVudHMpIHtcbiAgICBWdWUuY29uZmlnLmlnbm9yZWRFbGVtZW50cy5wdXNoKHRhZ05hbWUpXG4gIH1cblxuICByZXR1cm4ge1xuICAgIC4uLmdldENvcmVQcm9wZXJ0aWVzKGNvbXBvbmVudE9wdGlvbnMpLFxuICAgICRfdnVlVGVzdFV0aWxzX29yaWdpbmFsOiBvcmlnaW5hbENvbXBvbmVudCxcbiAgICAkX2RvTm90U3R1YkNoaWxkcmVuOiB0cnVlLFxuICAgIHJlbmRlcihoLCBjb250ZXh0KSB7XG4gICAgICByZXR1cm4gaChcbiAgICAgICAgdGFnTmFtZSxcbiAgICAgICAge1xuICAgICAgICAgIGF0dHJzOiBjb21wb25lbnRPcHRpb25zLmZ1bmN0aW9uYWxcbiAgICAgICAgICAgID8ge1xuICAgICAgICAgICAgICAgIC4uLmNvbnRleHQucHJvcHMsXG4gICAgICAgICAgICAgICAgLi4uY29udGV4dC5kYXRhLmF0dHJzLFxuICAgICAgICAgICAgICAgIGNsYXNzOiBjcmVhdGVDbGFzc1N0cmluZyhcbiAgICAgICAgICAgICAgICAgIGNvbnRleHQuZGF0YS5zdGF0aWNDbGFzcyxcbiAgICAgICAgICAgICAgICAgIGNvbnRleHQuZGF0YS5jbGFzc1xuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgOiB7XG4gICAgICAgICAgICAgICAgLi4udGhpcy4kcHJvcHNcbiAgICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBjb250ZXh0ID8gY29udGV4dC5jaGlsZHJlbiA6IHRoaXMuJG9wdGlvbnMuX3JlbmRlckNoaWxkcmVuXG4gICAgICApXG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVN0dWJGcm9tU3RyaW5nKFxuICB0ZW1wbGF0ZVN0cmluZzogc3RyaW5nLFxuICBvcmlnaW5hbENvbXBvbmVudDogQ29tcG9uZW50ID0ge30sXG4gIG5hbWU6IHN0cmluZyxcbiAgX1Z1ZTogQ29tcG9uZW50XG4pOiBDb21wb25lbnQge1xuICBpZiAodGVtcGxhdGVDb250YWluc0NvbXBvbmVudCh0ZW1wbGF0ZVN0cmluZywgbmFtZSkpIHtcbiAgICB0aHJvd0Vycm9yKCdvcHRpb25zLnN0dWIgY2Fubm90IGNvbnRhaW4gYSBjaXJjdWxhciByZWZlcmVuY2UnKVxuICB9XG4gIGNvbnN0IGNvbXBvbmVudE9wdGlvbnMgPSByZXNvbHZlT3B0aW9ucyhvcmlnaW5hbENvbXBvbmVudCwgX1Z1ZSlcblxuICByZXR1cm4ge1xuICAgIC4uLmdldENvcmVQcm9wZXJ0aWVzKGNvbXBvbmVudE9wdGlvbnMpLFxuICAgICRfZG9Ob3RTdHViQ2hpbGRyZW46IHRydWUsXG4gICAgLi4uY29tcGlsZUZyb21TdHJpbmcodGVtcGxhdGVTdHJpbmcpXG4gIH1cbn1cblxuZnVuY3Rpb24gdmFsaWRhdGVTdHViKHN0dWIpIHtcbiAgaWYgKCFpc1ZhbGlkU3R1YihzdHViKSkge1xuICAgIHRocm93RXJyb3IoYG9wdGlvbnMuc3R1YiB2YWx1ZXMgbXVzdCBiZSBwYXNzZWQgYSBzdHJpbmcgb3IgYCArIGBjb21wb25lbnRgKVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTdHVic0Zyb21TdHVic09iamVjdChcbiAgb3JpZ2luYWxDb21wb25lbnRzOiBPYmplY3QgPSB7fSxcbiAgc3R1YnM6IE9iamVjdCxcbiAgX1Z1ZTogQ29tcG9uZW50XG4pOiBDb21wb25lbnRzIHtcbiAgcmV0dXJuIE9iamVjdC5rZXlzKHN0dWJzIHx8IHt9KS5yZWR1Y2UoKGFjYywgc3R1Yk5hbWUpID0+IHtcbiAgICBjb25zdCBzdHViID0gc3R1YnNbc3R1Yk5hbWVdXG5cbiAgICB2YWxpZGF0ZVN0dWIoc3R1YilcblxuICAgIGlmIChzdHViID09PSBmYWxzZSkge1xuICAgICAgcmV0dXJuIGFjY1xuICAgIH1cblxuICAgIGlmIChzdHViID09PSB0cnVlKSB7XG4gICAgICBjb25zdCBjb21wb25lbnQgPSByZXNvbHZlQ29tcG9uZW50KG9yaWdpbmFsQ29tcG9uZW50cywgc3R1Yk5hbWUpXG4gICAgICBhY2Nbc3R1Yk5hbWVdID0gY3JlYXRlU3R1YkZyb21Db21wb25lbnQoY29tcG9uZW50LCBzdHViTmFtZSwgX1Z1ZSlcbiAgICAgIHJldHVybiBhY2NcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHN0dWIgPT09ICdzdHJpbmcnKSB7XG4gICAgICBjb25zdCBjb21wb25lbnQgPSByZXNvbHZlQ29tcG9uZW50KG9yaWdpbmFsQ29tcG9uZW50cywgc3R1Yk5hbWUpXG4gICAgICBhY2Nbc3R1Yk5hbWVdID0gY3JlYXRlU3R1YkZyb21TdHJpbmcoc3R1YiwgY29tcG9uZW50LCBzdHViTmFtZSwgX1Z1ZSlcbiAgICAgIHJldHVybiBhY2NcbiAgICB9XG5cbiAgICBpZiAoY29tcG9uZW50TmVlZHNDb21waWxpbmcoc3R1YikpIHtcbiAgICAgIGNvbXBpbGVUZW1wbGF0ZShzdHViKVxuICAgIH1cblxuICAgIGFjY1tzdHViTmFtZV0gPSBzdHViXG5cbiAgICByZXR1cm4gYWNjXG4gIH0sIHt9KVxufVxuIiwiaW1wb3J0IHsgY3JlYXRlU3R1YkZyb21Db21wb25lbnQgfSBmcm9tICcuL2NyZWF0ZS1jb21wb25lbnQtc3R1YnMnXG5pbXBvcnQgeyByZXNvbHZlQ29tcG9uZW50IH0gZnJvbSAnc2hhcmVkL3V0aWwnXG5pbXBvcnQge1xuICBpc1Jlc2VydmVkVGFnLFxuICBpc0NvbnN0cnVjdG9yLFxuICBpc0R5bmFtaWNDb21wb25lbnQsXG4gIGlzQ29tcG9uZW50T3B0aW9uc1xufSBmcm9tICdzaGFyZWQvdmFsaWRhdG9ycydcbmltcG9ydCB7XG4gIEJFRk9SRV9SRU5ERVJfTElGRUNZQ0xFX0hPT0ssXG4gIENSRUFURV9FTEVNRU5UX0FMSUFTXG59IGZyb20gJ3NoYXJlZC9jb25zdHMnXG5cbmNvbnN0IGlzV2hpdGVsaXN0ZWQgPSAoZWwsIHdoaXRlbGlzdCkgPT4gcmVzb2x2ZUNvbXBvbmVudChlbCwgd2hpdGVsaXN0KVxuY29uc3QgaXNBbHJlYWR5U3R1YmJlZCA9IChlbCwgc3R1YnMpID0+IHN0dWJzLmhhcyhlbClcblxuZnVuY3Rpb24gc2hvdWxkRXh0ZW5kKGNvbXBvbmVudCwgX1Z1ZSkge1xuICByZXR1cm4gaXNDb25zdHJ1Y3Rvcihjb21wb25lbnQpIHx8IChjb21wb25lbnQgJiYgY29tcG9uZW50LmV4dGVuZHMpXG59XG5cbmZ1bmN0aW9uIGV4dGVuZChjb21wb25lbnQsIF9WdWUpIHtcbiAgY29uc3QgY29tcG9uZW50T3B0aW9ucyA9IGNvbXBvbmVudC5vcHRpb25zID8gY29tcG9uZW50Lm9wdGlvbnMgOiBjb21wb25lbnRcbiAgY29uc3Qgc3R1YiA9IF9WdWUuZXh0ZW5kKGNvbXBvbmVudE9wdGlvbnMpXG4gIHN0dWIub3B0aW9ucy4kX3Z1ZVRlc3RVdGlsc19vcmlnaW5hbCA9IGNvbXBvbmVudFxuICBzdHViLm9wdGlvbnMuX2Jhc2UgPSBfVnVlXG4gIHJldHVybiBzdHViXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVN0dWJJZk5lZWRlZChzaG91bGRTdHViLCBjb21wb25lbnQsIF9WdWUsIGVsKSB7XG4gIGlmIChzaG91bGRTdHViKSB7XG4gICAgcmV0dXJuIGNyZWF0ZVN0dWJGcm9tQ29tcG9uZW50KGNvbXBvbmVudCB8fCB7fSwgZWwsIF9WdWUpXG4gIH1cblxuICBpZiAoc2hvdWxkRXh0ZW5kKGNvbXBvbmVudCwgX1Z1ZSkpIHtcbiAgICByZXR1cm4gZXh0ZW5kKGNvbXBvbmVudCwgX1Z1ZSlcbiAgfVxufVxuXG5mdW5jdGlvbiBzaG91bGROb3RCZVN0dWJiZWQoZWwsIHdoaXRlbGlzdCwgbW9kaWZpZWRDb21wb25lbnRzKSB7XG4gIHJldHVybiAoXG4gICAgKHR5cGVvZiBlbCA9PT0gJ3N0cmluZycgJiYgaXNSZXNlcnZlZFRhZyhlbCkpIHx8XG4gICAgaXNXaGl0ZWxpc3RlZChlbCwgd2hpdGVsaXN0KSB8fFxuICAgIGlzQWxyZWFkeVN0dWJiZWQoZWwsIG1vZGlmaWVkQ29tcG9uZW50cylcbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcGF0Y2hDcmVhdGVFbGVtZW50KF9WdWUsIHN0dWJzLCBzdHViQWxsQ29tcG9uZW50cykge1xuICAvLyBUaGlzIG1peGluIHBhdGNoZXMgdm0uJGNyZWF0ZUVsZW1lbnQgc28gdGhhdCB3ZSBjYW4gc3R1YiBhbGwgY29tcG9uZW50c1xuICAvLyBiZWZvcmUgdGhleSBhcmUgcmVuZGVyZWQgaW4gc2hhbGxvdyBtb2RlLiBXZSBhbHNvIG5lZWQgdG8gZW5zdXJlIHRoYXRcbiAgLy8gY29tcG9uZW50IGNvbnN0cnVjdG9ycyB3ZXJlIGNyZWF0ZWQgZnJvbSB0aGUgX1Z1ZSBjb25zdHJ1Y3Rvci4gSWYgbm90LFxuICAvLyB3ZSBtdXN0IHJlcGxhY2UgdGhlbSB3aXRoIGNvbXBvbmVudHMgY3JlYXRlZCBmcm9tIHRoZSBfVnVlIGNvbnN0cnVjdG9yXG4gIC8vIGJlZm9yZSBjYWxsaW5nIHRoZSBvcmlnaW5hbCAkY3JlYXRlRWxlbWVudC4gVGhpcyBlbnN1cmVzIHRoYXQgY29tcG9uZW50c1xuICAvLyBoYXZlIHRoZSBjb3JyZWN0IGluc3RhbmNlIHByb3BlcnRpZXMgYW5kIHN0dWJzIHdoZW4gdGhleSBhcmUgcmVuZGVyZWQuXG4gIGZ1bmN0aW9uIHBhdGNoQ3JlYXRlRWxlbWVudE1peGluKCkge1xuICAgIGNvbnN0IHZtID0gdGhpc1xuXG4gICAgaWYgKHZtLiRvcHRpb25zLiRfZG9Ob3RTdHViQ2hpbGRyZW4gfHwgdm0uJG9wdGlvbnMuX2lzRnVuY3Rpb25hbENvbnRhaW5lcikge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgY29uc3QgbW9kaWZpZWRDb21wb25lbnRzID0gbmV3IFNldCgpXG4gICAgY29uc3Qgb3JpZ2luYWxDcmVhdGVFbGVtZW50ID0gdm0uJGNyZWF0ZUVsZW1lbnRcbiAgICBjb25zdCBvcmlnaW5hbENvbXBvbmVudHMgPSB2bS4kb3B0aW9ucy5jb21wb25lbnRzXG5cbiAgICBjb25zdCBjcmVhdGVFbGVtZW50ID0gKGVsLCAuLi5hcmdzKSA9PiB7XG4gICAgICBpZiAoc2hvdWxkTm90QmVTdHViYmVkKGVsLCBzdHVicywgbW9kaWZpZWRDb21wb25lbnRzKSkge1xuICAgICAgICByZXR1cm4gb3JpZ2luYWxDcmVhdGVFbGVtZW50KGVsLCAuLi5hcmdzKVxuICAgICAgfVxuXG4gICAgICBpZiAoaXNDb25zdHJ1Y3RvcihlbCkgfHwgaXNDb21wb25lbnRPcHRpb25zKGVsKSkge1xuICAgICAgICBpZiAoc3R1YkFsbENvbXBvbmVudHMpIHtcbiAgICAgICAgICBjb25zdCBzdHViID0gY3JlYXRlU3R1YkZyb21Db21wb25lbnQoZWwsIGVsLm5hbWUgfHwgJ2Fub255bW91cycsIF9WdWUpXG4gICAgICAgICAgcmV0dXJuIG9yaWdpbmFsQ3JlYXRlRWxlbWVudChzdHViLCAuLi5hcmdzKVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IENvbnN0cnVjdG9yID0gc2hvdWxkRXh0ZW5kKGVsLCBfVnVlKSA/IGV4dGVuZChlbCwgX1Z1ZSkgOiBlbFxuXG4gICAgICAgIHJldHVybiBvcmlnaW5hbENyZWF0ZUVsZW1lbnQoQ29uc3RydWN0b3IsIC4uLmFyZ3MpXG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2YgZWwgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGNvbnN0IG9yaWdpbmFsID0gcmVzb2x2ZUNvbXBvbmVudChlbCwgb3JpZ2luYWxDb21wb25lbnRzKVxuXG4gICAgICAgIGlmICghb3JpZ2luYWwpIHtcbiAgICAgICAgICByZXR1cm4gb3JpZ2luYWxDcmVhdGVFbGVtZW50KGVsLCAuLi5hcmdzKVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGlzRHluYW1pY0NvbXBvbmVudChvcmlnaW5hbCkpIHtcbiAgICAgICAgICByZXR1cm4gb3JpZ2luYWxDcmVhdGVFbGVtZW50KGVsLCAuLi5hcmdzKVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc3R1YiA9IGNyZWF0ZVN0dWJJZk5lZWRlZChzdHViQWxsQ29tcG9uZW50cywgb3JpZ2luYWwsIF9WdWUsIGVsKVxuXG4gICAgICAgIGlmIChzdHViKSB7XG4gICAgICAgICAgT2JqZWN0LmFzc2lnbih2bS4kb3B0aW9ucy5jb21wb25lbnRzLCB7XG4gICAgICAgICAgICBbZWxdOiBzdHViXG4gICAgICAgICAgfSlcbiAgICAgICAgICBtb2RpZmllZENvbXBvbmVudHMuYWRkKGVsKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBvcmlnaW5hbENyZWF0ZUVsZW1lbnQoZWwsIC4uLmFyZ3MpXG4gICAgfVxuXG4gICAgdm1bQ1JFQVRFX0VMRU1FTlRfQUxJQVNdID0gY3JlYXRlRWxlbWVudFxuICAgIHZtLiRjcmVhdGVFbGVtZW50ID0gY3JlYXRlRWxlbWVudFxuICB9XG5cbiAgX1Z1ZS5taXhpbih7XG4gICAgW0JFRk9SRV9SRU5ERVJfTElGRUNZQ0xFX0hPT0tdOiBwYXRjaENyZWF0ZUVsZW1lbnRNaXhpblxuICB9KVxufVxuIiwiLy8gQGZsb3dcblxuaW1wb3J0IHsgY3JlYXRlU2xvdFZOb2RlcyB9IGZyb20gJy4vY3JlYXRlLXNsb3Qtdm5vZGVzJ1xuaW1wb3J0IGFkZE1vY2tzIGZyb20gJy4vYWRkLW1vY2tzJ1xuaW1wb3J0IHsgYWRkRXZlbnRMb2dnZXIgfSBmcm9tICcuL2xvZy1ldmVudHMnXG5pbXBvcnQgeyBhZGRTdHVicyB9IGZyb20gJy4vYWRkLXN0dWJzJ1xuaW1wb3J0IHsgY29tcGlsZVRlbXBsYXRlIH0gZnJvbSAnc2hhcmVkL2NvbXBpbGUtdGVtcGxhdGUnXG5pbXBvcnQgZXh0cmFjdEluc3RhbmNlT3B0aW9ucyBmcm9tICcuL2V4dHJhY3QtaW5zdGFuY2Utb3B0aW9ucydcbmltcG9ydCB7IGNvbXBvbmVudE5lZWRzQ29tcGlsaW5nLCBpc0NvbnN0cnVjdG9yIH0gZnJvbSAnc2hhcmVkL3ZhbGlkYXRvcnMnXG5pbXBvcnQgY3JlYXRlU2NvcGVkU2xvdHMgZnJvbSAnLi9jcmVhdGUtc2NvcGVkLXNsb3RzJ1xuaW1wb3J0IHsgY3JlYXRlU3R1YnNGcm9tU3R1YnNPYmplY3QgfSBmcm9tICcuL2NyZWF0ZS1jb21wb25lbnQtc3R1YnMnXG5pbXBvcnQgeyBwYXRjaENyZWF0ZUVsZW1lbnQgfSBmcm9tICcuL3BhdGNoLWNyZWF0ZS1lbGVtZW50J1xuXG5mdW5jdGlvbiBjcmVhdGVDb250ZXh0KG9wdGlvbnMsIHNjb3BlZFNsb3RzKSB7XG4gIGNvbnN0IG9uID0ge1xuICAgIC4uLihvcHRpb25zLmNvbnRleHQgJiYgb3B0aW9ucy5jb250ZXh0Lm9uKSxcbiAgICAuLi5vcHRpb25zLmxpc3RlbmVyc1xuICB9XG4gIHJldHVybiB7XG4gICAgYXR0cnM6IHtcbiAgICAgIC4uLm9wdGlvbnMuYXR0cnMsXG4gICAgICAvLyBwYXNzIGFzIGF0dHJzIHNvIHRoYXQgaW5oZXJpdEF0dHJzIHdvcmtzIGNvcnJlY3RseVxuICAgICAgLy8gcHJvcHNEYXRhIHNob3VsZCB0YWtlIHByZWNlZGVuY2Ugb3ZlciBhdHRyc1xuICAgICAgLi4ub3B0aW9ucy5wcm9wc0RhdGFcbiAgICB9LFxuICAgIC4uLihvcHRpb25zLmNvbnRleHQgfHwge30pLFxuICAgIG9uLFxuICAgIHNjb3BlZFNsb3RzXG4gIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlQ2hpbGRyZW4odm0sIGgsIHsgc2xvdHMsIGNvbnRleHQgfSkge1xuICBjb25zdCBzbG90Vk5vZGVzID0gc2xvdHMgPyBjcmVhdGVTbG90Vk5vZGVzKHZtLCBzbG90cykgOiB1bmRlZmluZWRcbiAgcmV0dXJuIChcbiAgICAoY29udGV4dCAmJlxuICAgICAgY29udGV4dC5jaGlsZHJlbiAmJlxuICAgICAgY29udGV4dC5jaGlsZHJlbi5tYXAoeCA9PiAodHlwZW9mIHggPT09ICdmdW5jdGlvbicgPyB4KGgpIDogeCkpKSB8fFxuICAgIHNsb3RWTm9kZXNcbiAgKVxufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjcmVhdGVJbnN0YW5jZShcbiAgY29tcG9uZW50OiBDb21wb25lbnQsXG4gIG9wdGlvbnM6IE9wdGlvbnMsXG4gIF9WdWU6IENvbXBvbmVudFxuKTogQ29tcG9uZW50IHtcbiAgY29uc3QgY29tcG9uZW50T3B0aW9ucyA9IGlzQ29uc3RydWN0b3IoY29tcG9uZW50KVxuICAgID8gY29tcG9uZW50Lm9wdGlvbnNcbiAgICA6IGNvbXBvbmVudFxuXG4gIC8vIGluc3RhbmNlIG9wdGlvbnMgYXJlIG9wdGlvbnMgdGhhdCBhcmUgcGFzc2VkIHRvIHRoZVxuICAvLyByb290IGluc3RhbmNlIHdoZW4gaXQncyBpbnN0YW50aWF0ZWRcbiAgY29uc3QgaW5zdGFuY2VPcHRpb25zID0gZXh0cmFjdEluc3RhbmNlT3B0aW9ucyhvcHRpb25zKVxuXG4gIGNvbnN0IHN0dWJDb21wb25lbnRzT2JqZWN0ID0gY3JlYXRlU3R1YnNGcm9tU3R1YnNPYmplY3QoXG4gICAgY29tcG9uZW50T3B0aW9ucy5jb21wb25lbnRzLFxuICAgIC8vICRGbG93SWdub3JlXG4gICAgb3B0aW9ucy5zdHVicyxcbiAgICBfVnVlXG4gIClcblxuICBhZGRFdmVudExvZ2dlcihfVnVlKVxuICBhZGRNb2NrcyhfVnVlLCBvcHRpb25zLm1vY2tzKVxuICBhZGRTdHVicyhfVnVlLCBzdHViQ29tcG9uZW50c09iamVjdClcbiAgcGF0Y2hDcmVhdGVFbGVtZW50KF9WdWUsIHN0dWJDb21wb25lbnRzT2JqZWN0LCBvcHRpb25zLnNob3VsZFByb3h5KVxuXG4gIGlmIChjb21wb25lbnROZWVkc0NvbXBpbGluZyhjb21wb25lbnRPcHRpb25zKSkge1xuICAgIGNvbXBpbGVUZW1wbGF0ZShjb21wb25lbnRPcHRpb25zKVxuICB9XG5cbiAgLy8gdXNlZCB0byBpZGVudGlmeSBleHRlbmRlZCBjb21wb25lbnQgdXNpbmcgY29uc3RydWN0b3JcbiAgY29tcG9uZW50T3B0aW9ucy4kX3Z1ZVRlc3RVdGlsc19vcmlnaW5hbCA9IGNvbXBvbmVudFxuXG4gIC8vIG1ha2Ugc3VyZSBhbGwgZXh0ZW5kcyBhcmUgYmFzZWQgb24gdGhpcyBpbnN0YW5jZVxuICBjb21wb25lbnRPcHRpb25zLl9iYXNlID0gX1Z1ZVxuXG4gIGNvbnN0IENvbnN0cnVjdG9yID0gX1Z1ZS5leHRlbmQoY29tcG9uZW50T3B0aW9ucykuZXh0ZW5kKGluc3RhbmNlT3B0aW9ucylcblxuICBjb25zdCBzY29wZWRTbG90cyA9IGNyZWF0ZVNjb3BlZFNsb3RzKG9wdGlvbnMuc2NvcGVkU2xvdHMsIF9WdWUpXG5cbiAgY29uc3QgcGFyZW50Q29tcG9uZW50T3B0aW9ucyA9IG9wdGlvbnMucGFyZW50Q29tcG9uZW50IHx8IHt9XG5cbiAgcGFyZW50Q29tcG9uZW50T3B0aW9ucy5wcm92aWRlID0gb3B0aW9ucy5wcm92aWRlXG4gIHBhcmVudENvbXBvbmVudE9wdGlvbnMuJF9kb05vdFN0dWJDaGlsZHJlbiA9IHRydWVcbiAgcGFyZW50Q29tcG9uZW50T3B0aW9ucy5faXNGdW5jdGlvbmFsQ29udGFpbmVyID0gY29tcG9uZW50T3B0aW9ucy5mdW5jdGlvbmFsXG4gIHBhcmVudENvbXBvbmVudE9wdGlvbnMucmVuZGVyID0gZnVuY3Rpb24oaCkge1xuICAgIHJldHVybiBoKFxuICAgICAgQ29uc3RydWN0b3IsXG4gICAgICBjcmVhdGVDb250ZXh0KG9wdGlvbnMsIHNjb3BlZFNsb3RzKSxcbiAgICAgIGNyZWF0ZUNoaWxkcmVuKHRoaXMsIGgsIG9wdGlvbnMpXG4gICAgKVxuICB9XG4gIGNvbnN0IFBhcmVudCA9IF9WdWUuZXh0ZW5kKHBhcmVudENvbXBvbmVudE9wdGlvbnMpXG5cbiAgcmV0dXJuIG5ldyBQYXJlbnQoKVxufVxuIiwiLy8gQGZsb3dcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY3JlYXRlRWxlbWVudCgpOiBIVE1MRWxlbWVudCB8IHZvaWQge1xuICBpZiAoZG9jdW1lbnQpIHtcbiAgICBjb25zdCBlbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcblxuICAgIGlmIChkb2N1bWVudC5ib2R5KSB7XG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGVsZW0pXG4gICAgfVxuICAgIHJldHVybiBlbGVtXG4gIH1cbn1cbiIsImltcG9ydCB7IGlzUGxhaW5PYmplY3QgfSBmcm9tICcuL3ZhbGlkYXRvcnMnXG5pbXBvcnQgeyB0aHJvd0Vycm9yIH0gZnJvbSAnLi91dGlsJ1xuaW1wb3J0IHsgVlVFX1ZFUlNJT04gfSBmcm9tICcuL2NvbnN0cydcblxuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZVN0dWJzKHN0dWJzID0ge30pIHtcbiAgaWYgKHN0dWJzID09PSBmYWxzZSkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG4gIGlmIChpc1BsYWluT2JqZWN0KHN0dWJzKSkge1xuICAgIHJldHVybiBzdHVic1xuICB9XG4gIGlmIChBcnJheS5pc0FycmF5KHN0dWJzKSkge1xuICAgIHJldHVybiBzdHVicy5yZWR1Y2UoKGFjYywgc3R1YikgPT4ge1xuICAgICAgaWYgKHR5cGVvZiBzdHViICE9PSAnc3RyaW5nJykge1xuICAgICAgICB0aHJvd0Vycm9yKCdlYWNoIGl0ZW0gaW4gYW4gb3B0aW9ucy5zdHVicyBhcnJheSBtdXN0IGJlIGEgc3RyaW5nJylcbiAgICAgIH1cbiAgICAgIGFjY1tzdHViXSA9IHRydWVcbiAgICAgIHJldHVybiBhY2NcbiAgICB9LCB7fSlcbiAgfVxuICB0aHJvd0Vycm9yKCdvcHRpb25zLnN0dWJzIG11c3QgYmUgYW4gb2JqZWN0IG9yIGFuIEFycmF5Jylcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZVByb3ZpZGUocHJvdmlkZSkge1xuICAvLyBPYmplY3RzIGFyZSBub3QgcmVzb2x2ZWQgaW4gZXh0ZW5kZWQgY29tcG9uZW50cyBpbiBWdWUgPCAyLjVcbiAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3Z1ZWpzL3Z1ZS9pc3N1ZXMvNjQzNlxuICBpZiAodHlwZW9mIHByb3ZpZGUgPT09ICdvYmplY3QnICYmIFZVRV9WRVJTSU9OIDwgMi41KSB7XG4gICAgY29uc3Qgb2JqID0geyAuLi5wcm92aWRlIH1cbiAgICByZXR1cm4gKCkgPT4gb2JqXG4gIH1cbiAgcmV0dXJuIHByb3ZpZGVcbn1cbiIsIi8vIEBmbG93XG5pbXBvcnQgeyBub3JtYWxpemVTdHVicywgbm9ybWFsaXplUHJvdmlkZSB9IGZyb20gJy4vbm9ybWFsaXplJ1xuXG5mdW5jdGlvbiBnZXRPcHRpb24ob3B0aW9uLCBjb25maWc/OiBPYmplY3QpOiBhbnkge1xuICBpZiAob3B0aW9uID09PSBmYWxzZSkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG4gIGlmIChvcHRpb24gfHwgKGNvbmZpZyAmJiBPYmplY3Qua2V5cyhjb25maWcpLmxlbmd0aCA+IDApKSB7XG4gICAgaWYgKG9wdGlvbiBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB7XG4gICAgICByZXR1cm4gb3B0aW9uXG4gICAgfVxuICAgIGlmIChjb25maWcgaW5zdGFuY2VvZiBGdW5jdGlvbikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDb25maWcgY2FuJ3QgYmUgYSBGdW5jdGlvbi5gKVxuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgLi4uY29uZmlnLFxuICAgICAgLi4ub3B0aW9uXG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtZXJnZU9wdGlvbnMob3B0aW9uczogT3B0aW9ucywgY29uZmlnOiBDb25maWcpOiBPcHRpb25zIHtcbiAgY29uc3QgbW9ja3MgPSAoZ2V0T3B0aW9uKG9wdGlvbnMubW9ja3MsIGNvbmZpZy5tb2Nrcyk6IE9iamVjdClcbiAgY29uc3QgbWV0aG9kcyA9IChnZXRPcHRpb24ob3B0aW9ucy5tZXRob2RzLCBjb25maWcubWV0aG9kcyk6IHtcbiAgICBba2V5OiBzdHJpbmddOiBGdW5jdGlvblxuICB9KVxuICBjb25zdCBwcm92aWRlID0gKGdldE9wdGlvbihvcHRpb25zLnByb3ZpZGUsIGNvbmZpZy5wcm92aWRlKTogT2JqZWN0KVxuICByZXR1cm4ge1xuICAgIC4uLm9wdGlvbnMsXG4gICAgcHJvdmlkZTogbm9ybWFsaXplUHJvdmlkZShwcm92aWRlKSxcbiAgICBsb2dNb2RpZmllZENvbXBvbmVudHM6IGNvbmZpZy5sb2dNb2RpZmllZENvbXBvbmVudHMsXG4gICAgc3R1YnM6IGdldE9wdGlvbihub3JtYWxpemVTdHVicyhvcHRpb25zLnN0dWJzKSwgY29uZmlnLnN0dWJzKSxcbiAgICBtb2NrcyxcbiAgICBtZXRob2RzLFxuICAgIHN5bmM6ICEhKG9wdGlvbnMuc3luYyB8fCBvcHRpb25zLnN5bmMgPT09IHVuZGVmaW5lZClcbiAgfVxufVxuIiwiLy8gQGZsb3dcblxuaW1wb3J0IHsgdGhyb3dFcnJvciB9IGZyb20gJ3NoYXJlZC91dGlsJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB3YXJuSWZOb1dpbmRvdygpOiB2b2lkIHtcbiAgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgdGhyb3dFcnJvcihcbiAgICAgIGB3aW5kb3cgaXMgdW5kZWZpbmVkLCB2dWUtdGVzdC11dGlscyBuZWVkcyB0byBiZSBgICtcbiAgICAgICAgYHJ1biBpbiBhIGJyb3dzZXIgZW52aXJvbm1lbnQuIFxcbmAgK1xuICAgICAgICBgWW91IGNhbiBydW4gdGhlIHRlc3RzIGluIG5vZGUgdXNpbmcganNkb20gXFxuYCArXG4gICAgICAgIGBTZWUgaHR0cHM6Ly92dWUtdGVzdC11dGlscy52dWVqcy5vcmcvZ3VpZGVzLyNicm93c2VyLWVudmlyb25tZW50IGAgK1xuICAgICAgICBgZm9yIG1vcmUgZGV0YWlscy5gXG4gICAgKVxuICB9XG59XG4iLCIvKipcbiAqIFJlbW92ZXMgYWxsIGtleS12YWx1ZSBlbnRyaWVzIGZyb20gdGhlIGxpc3QgY2FjaGUuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGNsZWFyXG4gKiBAbWVtYmVyT2YgTGlzdENhY2hlXG4gKi9cbmZ1bmN0aW9uIGxpc3RDYWNoZUNsZWFyKCkge1xuICB0aGlzLl9fZGF0YV9fID0gW107XG4gIHRoaXMuc2l6ZSA9IDA7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbGlzdENhY2hlQ2xlYXI7XG4iLCIvKipcbiAqIFBlcmZvcm1zIGFcbiAqIFtgU2FtZVZhbHVlWmVyb2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLXNhbWV2YWx1ZXplcm8pXG4gKiBjb21wYXJpc29uIGJldHdlZW4gdHdvIHZhbHVlcyB0byBkZXRlcm1pbmUgaWYgdGhleSBhcmUgZXF1aXZhbGVudC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY29tcGFyZS5cbiAqIEBwYXJhbSB7Kn0gb3RoZXIgVGhlIG90aGVyIHZhbHVlIHRvIGNvbXBhcmUuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIHZhbHVlcyBhcmUgZXF1aXZhbGVudCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgb2JqZWN0ID0geyAnYSc6IDEgfTtcbiAqIHZhciBvdGhlciA9IHsgJ2EnOiAxIH07XG4gKlxuICogXy5lcShvYmplY3QsIG9iamVjdCk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5lcShvYmplY3QsIG90aGVyKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5lcSgnYScsICdhJyk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5lcSgnYScsIE9iamVjdCgnYScpKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5lcShOYU4sIE5hTik7XG4gKiAvLyA9PiB0cnVlXG4gKi9cbmZ1bmN0aW9uIGVxKHZhbHVlLCBvdGhlcikge1xuICByZXR1cm4gdmFsdWUgPT09IG90aGVyIHx8ICh2YWx1ZSAhPT0gdmFsdWUgJiYgb3RoZXIgIT09IG90aGVyKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBlcTtcbiIsInZhciBlcSA9IHJlcXVpcmUoJy4vZXEnKTtcblxuLyoqXG4gKiBHZXRzIHRoZSBpbmRleCBhdCB3aGljaCB0aGUgYGtleWAgaXMgZm91bmQgaW4gYGFycmF5YCBvZiBrZXktdmFsdWUgcGFpcnMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBpbnNwZWN0LlxuICogQHBhcmFtIHsqfSBrZXkgVGhlIGtleSB0byBzZWFyY2ggZm9yLlxuICogQHJldHVybnMge251bWJlcn0gUmV0dXJucyB0aGUgaW5kZXggb2YgdGhlIG1hdGNoZWQgdmFsdWUsIGVsc2UgYC0xYC5cbiAqL1xuZnVuY3Rpb24gYXNzb2NJbmRleE9mKGFycmF5LCBrZXkpIHtcbiAgdmFyIGxlbmd0aCA9IGFycmF5Lmxlbmd0aDtcbiAgd2hpbGUgKGxlbmd0aC0tKSB7XG4gICAgaWYgKGVxKGFycmF5W2xlbmd0aF1bMF0sIGtleSkpIHtcbiAgICAgIHJldHVybiBsZW5ndGg7XG4gICAgfVxuICB9XG4gIHJldHVybiAtMTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBhc3NvY0luZGV4T2Y7XG4iLCJ2YXIgYXNzb2NJbmRleE9mID0gcmVxdWlyZSgnLi9fYXNzb2NJbmRleE9mJyk7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBhcnJheVByb3RvID0gQXJyYXkucHJvdG90eXBlO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBzcGxpY2UgPSBhcnJheVByb3RvLnNwbGljZTtcblxuLyoqXG4gKiBSZW1vdmVzIGBrZXlgIGFuZCBpdHMgdmFsdWUgZnJvbSB0aGUgbGlzdCBjYWNoZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgZGVsZXRlXG4gKiBAbWVtYmVyT2YgTGlzdENhY2hlXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIHJlbW92ZS5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgZW50cnkgd2FzIHJlbW92ZWQsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gbGlzdENhY2hlRGVsZXRlKGtleSkge1xuICB2YXIgZGF0YSA9IHRoaXMuX19kYXRhX18sXG4gICAgICBpbmRleCA9IGFzc29jSW5kZXhPZihkYXRhLCBrZXkpO1xuXG4gIGlmIChpbmRleCA8IDApIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgdmFyIGxhc3RJbmRleCA9IGRhdGEubGVuZ3RoIC0gMTtcbiAgaWYgKGluZGV4ID09IGxhc3RJbmRleCkge1xuICAgIGRhdGEucG9wKCk7XG4gIH0gZWxzZSB7XG4gICAgc3BsaWNlLmNhbGwoZGF0YSwgaW5kZXgsIDEpO1xuICB9XG4gIC0tdGhpcy5zaXplO1xuICByZXR1cm4gdHJ1ZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBsaXN0Q2FjaGVEZWxldGU7XG4iLCJ2YXIgYXNzb2NJbmRleE9mID0gcmVxdWlyZSgnLi9fYXNzb2NJbmRleE9mJyk7XG5cbi8qKlxuICogR2V0cyB0aGUgbGlzdCBjYWNoZSB2YWx1ZSBmb3IgYGtleWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGdldFxuICogQG1lbWJlck9mIExpc3RDYWNoZVxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byBnZXQuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgZW50cnkgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIGxpc3RDYWNoZUdldChrZXkpIHtcbiAgdmFyIGRhdGEgPSB0aGlzLl9fZGF0YV9fLFxuICAgICAgaW5kZXggPSBhc3NvY0luZGV4T2YoZGF0YSwga2V5KTtcblxuICByZXR1cm4gaW5kZXggPCAwID8gdW5kZWZpbmVkIDogZGF0YVtpbmRleF1bMV07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbGlzdENhY2hlR2V0O1xuIiwidmFyIGFzc29jSW5kZXhPZiA9IHJlcXVpcmUoJy4vX2Fzc29jSW5kZXhPZicpO1xuXG4vKipcbiAqIENoZWNrcyBpZiBhIGxpc3QgY2FjaGUgdmFsdWUgZm9yIGBrZXlgIGV4aXN0cy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgaGFzXG4gKiBAbWVtYmVyT2YgTGlzdENhY2hlXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIGVudHJ5IHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGFuIGVudHJ5IGZvciBga2V5YCBleGlzdHMsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gbGlzdENhY2hlSGFzKGtleSkge1xuICByZXR1cm4gYXNzb2NJbmRleE9mKHRoaXMuX19kYXRhX18sIGtleSkgPiAtMTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBsaXN0Q2FjaGVIYXM7XG4iLCJ2YXIgYXNzb2NJbmRleE9mID0gcmVxdWlyZSgnLi9fYXNzb2NJbmRleE9mJyk7XG5cbi8qKlxuICogU2V0cyB0aGUgbGlzdCBjYWNoZSBga2V5YCB0byBgdmFsdWVgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBzZXRcbiAqIEBtZW1iZXJPZiBMaXN0Q2FjaGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gc2V0LlxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gc2V0LlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgbGlzdCBjYWNoZSBpbnN0YW5jZS5cbiAqL1xuZnVuY3Rpb24gbGlzdENhY2hlU2V0KGtleSwgdmFsdWUpIHtcbiAgdmFyIGRhdGEgPSB0aGlzLl9fZGF0YV9fLFxuICAgICAgaW5kZXggPSBhc3NvY0luZGV4T2YoZGF0YSwga2V5KTtcblxuICBpZiAoaW5kZXggPCAwKSB7XG4gICAgKyt0aGlzLnNpemU7XG4gICAgZGF0YS5wdXNoKFtrZXksIHZhbHVlXSk7XG4gIH0gZWxzZSB7XG4gICAgZGF0YVtpbmRleF1bMV0gPSB2YWx1ZTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBsaXN0Q2FjaGVTZXQ7XG4iLCJ2YXIgbGlzdENhY2hlQ2xlYXIgPSByZXF1aXJlKCcuL19saXN0Q2FjaGVDbGVhcicpLFxuICAgIGxpc3RDYWNoZURlbGV0ZSA9IHJlcXVpcmUoJy4vX2xpc3RDYWNoZURlbGV0ZScpLFxuICAgIGxpc3RDYWNoZUdldCA9IHJlcXVpcmUoJy4vX2xpc3RDYWNoZUdldCcpLFxuICAgIGxpc3RDYWNoZUhhcyA9IHJlcXVpcmUoJy4vX2xpc3RDYWNoZUhhcycpLFxuICAgIGxpc3RDYWNoZVNldCA9IHJlcXVpcmUoJy4vX2xpc3RDYWNoZVNldCcpO1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gbGlzdCBjYWNoZSBvYmplY3QuXG4gKlxuICogQHByaXZhdGVcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtBcnJheX0gW2VudHJpZXNdIFRoZSBrZXktdmFsdWUgcGFpcnMgdG8gY2FjaGUuXG4gKi9cbmZ1bmN0aW9uIExpc3RDYWNoZShlbnRyaWVzKSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gZW50cmllcyA9PSBudWxsID8gMCA6IGVudHJpZXMubGVuZ3RoO1xuXG4gIHRoaXMuY2xlYXIoKTtcbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICB2YXIgZW50cnkgPSBlbnRyaWVzW2luZGV4XTtcbiAgICB0aGlzLnNldChlbnRyeVswXSwgZW50cnlbMV0pO1xuICB9XG59XG5cbi8vIEFkZCBtZXRob2RzIHRvIGBMaXN0Q2FjaGVgLlxuTGlzdENhY2hlLnByb3RvdHlwZS5jbGVhciA9IGxpc3RDYWNoZUNsZWFyO1xuTGlzdENhY2hlLnByb3RvdHlwZVsnZGVsZXRlJ10gPSBsaXN0Q2FjaGVEZWxldGU7XG5MaXN0Q2FjaGUucHJvdG90eXBlLmdldCA9IGxpc3RDYWNoZUdldDtcbkxpc3RDYWNoZS5wcm90b3R5cGUuaGFzID0gbGlzdENhY2hlSGFzO1xuTGlzdENhY2hlLnByb3RvdHlwZS5zZXQgPSBsaXN0Q2FjaGVTZXQ7XG5cbm1vZHVsZS5leHBvcnRzID0gTGlzdENhY2hlO1xuIiwidmFyIExpc3RDYWNoZSA9IHJlcXVpcmUoJy4vX0xpc3RDYWNoZScpO1xuXG4vKipcbiAqIFJlbW92ZXMgYWxsIGtleS12YWx1ZSBlbnRyaWVzIGZyb20gdGhlIHN0YWNrLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBjbGVhclxuICogQG1lbWJlck9mIFN0YWNrXG4gKi9cbmZ1bmN0aW9uIHN0YWNrQ2xlYXIoKSB7XG4gIHRoaXMuX19kYXRhX18gPSBuZXcgTGlzdENhY2hlO1xuICB0aGlzLnNpemUgPSAwO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHN0YWNrQ2xlYXI7XG4iLCIvKipcbiAqIFJlbW92ZXMgYGtleWAgYW5kIGl0cyB2YWx1ZSBmcm9tIHRoZSBzdGFjay5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgZGVsZXRlXG4gKiBAbWVtYmVyT2YgU3RhY2tcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gcmVtb3ZlLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBlbnRyeSB3YXMgcmVtb3ZlZCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBzdGFja0RlbGV0ZShrZXkpIHtcbiAgdmFyIGRhdGEgPSB0aGlzLl9fZGF0YV9fLFxuICAgICAgcmVzdWx0ID0gZGF0YVsnZGVsZXRlJ10oa2V5KTtcblxuICB0aGlzLnNpemUgPSBkYXRhLnNpemU7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc3RhY2tEZWxldGU7XG4iLCIvKipcbiAqIEdldHMgdGhlIHN0YWNrIHZhbHVlIGZvciBga2V5YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgZ2V0XG4gKiBAbWVtYmVyT2YgU3RhY2tcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gZ2V0LlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIGVudHJ5IHZhbHVlLlxuICovXG5mdW5jdGlvbiBzdGFja0dldChrZXkpIHtcbiAgcmV0dXJuIHRoaXMuX19kYXRhX18uZ2V0KGtleSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc3RhY2tHZXQ7XG4iLCIvKipcbiAqIENoZWNrcyBpZiBhIHN0YWNrIHZhbHVlIGZvciBga2V5YCBleGlzdHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGhhc1xuICogQG1lbWJlck9mIFN0YWNrXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIGVudHJ5IHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGFuIGVudHJ5IGZvciBga2V5YCBleGlzdHMsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gc3RhY2tIYXMoa2V5KSB7XG4gIHJldHVybiB0aGlzLl9fZGF0YV9fLmhhcyhrZXkpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHN0YWNrSGFzO1xuIiwiLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBnbG9iYWxgIGZyb20gTm9kZS5qcy4gKi9cbnZhciBmcmVlR2xvYmFsID0gdHlwZW9mIGdsb2JhbCA9PSAnb2JqZWN0JyAmJiBnbG9iYWwgJiYgZ2xvYmFsLk9iamVjdCA9PT0gT2JqZWN0ICYmIGdsb2JhbDtcblxubW9kdWxlLmV4cG9ydHMgPSBmcmVlR2xvYmFsO1xuIiwidmFyIGZyZWVHbG9iYWwgPSByZXF1aXJlKCcuL19mcmVlR2xvYmFsJyk7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgc2VsZmAuICovXG52YXIgZnJlZVNlbGYgPSB0eXBlb2Ygc2VsZiA9PSAnb2JqZWN0JyAmJiBzZWxmICYmIHNlbGYuT2JqZWN0ID09PSBPYmplY3QgJiYgc2VsZjtcblxuLyoqIFVzZWQgYXMgYSByZWZlcmVuY2UgdG8gdGhlIGdsb2JhbCBvYmplY3QuICovXG52YXIgcm9vdCA9IGZyZWVHbG9iYWwgfHwgZnJlZVNlbGYgfHwgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcblxubW9kdWxlLmV4cG9ydHMgPSByb290O1xuIiwidmFyIHJvb3QgPSByZXF1aXJlKCcuL19yb290Jyk7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIFN5bWJvbCA9IHJvb3QuU3ltYm9sO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFN5bWJvbDtcbiIsInZhciBTeW1ib2wgPSByZXF1aXJlKCcuL19TeW1ib2wnKTtcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBVc2VkIHRvIHJlc29sdmUgdGhlXG4gKiBbYHRvU3RyaW5nVGFnYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtb2JqZWN0LnByb3RvdHlwZS50b3N0cmluZylcbiAqIG9mIHZhbHVlcy5cbiAqL1xudmFyIG5hdGl2ZU9iamVjdFRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIHN5bVRvU3RyaW5nVGFnID0gU3ltYm9sID8gU3ltYm9sLnRvU3RyaW5nVGFnIDogdW5kZWZpbmVkO1xuXG4vKipcbiAqIEEgc3BlY2lhbGl6ZWQgdmVyc2lvbiBvZiBgYmFzZUdldFRhZ2Agd2hpY2ggaWdub3JlcyBgU3ltYm9sLnRvU3RyaW5nVGFnYCB2YWx1ZXMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHF1ZXJ5LlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgcmF3IGB0b1N0cmluZ1RhZ2AuXG4gKi9cbmZ1bmN0aW9uIGdldFJhd1RhZyh2YWx1ZSkge1xuICB2YXIgaXNPd24gPSBoYXNPd25Qcm9wZXJ0eS5jYWxsKHZhbHVlLCBzeW1Ub1N0cmluZ1RhZyksXG4gICAgICB0YWcgPSB2YWx1ZVtzeW1Ub1N0cmluZ1RhZ107XG5cbiAgdHJ5IHtcbiAgICB2YWx1ZVtzeW1Ub1N0cmluZ1RhZ10gPSB1bmRlZmluZWQ7XG4gICAgdmFyIHVubWFza2VkID0gdHJ1ZTtcbiAgfSBjYXRjaCAoZSkge31cblxuICB2YXIgcmVzdWx0ID0gbmF0aXZlT2JqZWN0VG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG4gIGlmICh1bm1hc2tlZCkge1xuICAgIGlmIChpc093bikge1xuICAgICAgdmFsdWVbc3ltVG9TdHJpbmdUYWddID0gdGFnO1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWxldGUgdmFsdWVbc3ltVG9TdHJpbmdUYWddO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldFJhd1RhZztcbiIsIi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKlxuICogVXNlZCB0byByZXNvbHZlIHRoZVxuICogW2B0b1N0cmluZ1RhZ2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLW9iamVjdC5wcm90b3R5cGUudG9zdHJpbmcpXG4gKiBvZiB2YWx1ZXMuXG4gKi9cbnZhciBuYXRpdmVPYmplY3RUb1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xuXG4vKipcbiAqIENvbnZlcnRzIGB2YWx1ZWAgdG8gYSBzdHJpbmcgdXNpbmcgYE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmdgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjb252ZXJ0LlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgY29udmVydGVkIHN0cmluZy5cbiAqL1xuZnVuY3Rpb24gb2JqZWN0VG9TdHJpbmcodmFsdWUpIHtcbiAgcmV0dXJuIG5hdGl2ZU9iamVjdFRvU3RyaW5nLmNhbGwodmFsdWUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG9iamVjdFRvU3RyaW5nO1xuIiwidmFyIFN5bWJvbCA9IHJlcXVpcmUoJy4vX1N5bWJvbCcpLFxuICAgIGdldFJhd1RhZyA9IHJlcXVpcmUoJy4vX2dldFJhd1RhZycpLFxuICAgIG9iamVjdFRvU3RyaW5nID0gcmVxdWlyZSgnLi9fb2JqZWN0VG9TdHJpbmcnKTtcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIG51bGxUYWcgPSAnW29iamVjdCBOdWxsXScsXG4gICAgdW5kZWZpbmVkVGFnID0gJ1tvYmplY3QgVW5kZWZpbmVkXSc7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIHN5bVRvU3RyaW5nVGFnID0gU3ltYm9sID8gU3ltYm9sLnRvU3RyaW5nVGFnIDogdW5kZWZpbmVkO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBnZXRUYWdgIHdpdGhvdXQgZmFsbGJhY2tzIGZvciBidWdneSBlbnZpcm9ubWVudHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHF1ZXJ5LlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgYHRvU3RyaW5nVGFnYC5cbiAqL1xuZnVuY3Rpb24gYmFzZUdldFRhZyh2YWx1ZSkge1xuICBpZiAodmFsdWUgPT0gbnVsbCkge1xuICAgIHJldHVybiB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gdW5kZWZpbmVkVGFnIDogbnVsbFRhZztcbiAgfVxuICByZXR1cm4gKHN5bVRvU3RyaW5nVGFnICYmIHN5bVRvU3RyaW5nVGFnIGluIE9iamVjdCh2YWx1ZSkpXG4gICAgPyBnZXRSYXdUYWcodmFsdWUpXG4gICAgOiBvYmplY3RUb1N0cmluZyh2YWx1ZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUdldFRhZztcbiIsIi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgdGhlXG4gKiBbbGFuZ3VhZ2UgdHlwZV0oaHR0cDovL3d3dy5lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLWVjbWFzY3JpcHQtbGFuZ3VhZ2UtdHlwZXMpXG4gKiBvZiBgT2JqZWN0YC4gKGUuZy4gYXJyYXlzLCBmdW5jdGlvbnMsIG9iamVjdHMsIHJlZ2V4ZXMsIGBuZXcgTnVtYmVyKDApYCwgYW5kIGBuZXcgU3RyaW5nKCcnKWApXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYW4gb2JqZWN0LCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNPYmplY3Qoe30pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KF8ubm9vcCk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChudWxsKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0KHZhbHVlKSB7XG4gIHZhciB0eXBlID0gdHlwZW9mIHZhbHVlO1xuICByZXR1cm4gdmFsdWUgIT0gbnVsbCAmJiAodHlwZSA9PSAnb2JqZWN0JyB8fCB0eXBlID09ICdmdW5jdGlvbicpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzT2JqZWN0O1xuIiwidmFyIGJhc2VHZXRUYWcgPSByZXF1aXJlKCcuL19iYXNlR2V0VGFnJyksXG4gICAgaXNPYmplY3QgPSByZXF1aXJlKCcuL2lzT2JqZWN0Jyk7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBhc3luY1RhZyA9ICdbb2JqZWN0IEFzeW5jRnVuY3Rpb25dJyxcbiAgICBmdW5jVGFnID0gJ1tvYmplY3QgRnVuY3Rpb25dJyxcbiAgICBnZW5UYWcgPSAnW29iamVjdCBHZW5lcmF0b3JGdW5jdGlvbl0nLFxuICAgIHByb3h5VGFnID0gJ1tvYmplY3QgUHJveHldJztcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBjbGFzc2lmaWVkIGFzIGEgYEZ1bmN0aW9uYCBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBmdW5jdGlvbiwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzRnVuY3Rpb24oXyk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0Z1bmN0aW9uKC9hYmMvKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRnVuY3Rpb24odmFsdWUpIHtcbiAgaWYgKCFpc09iamVjdCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgLy8gVGhlIHVzZSBvZiBgT2JqZWN0I3RvU3RyaW5nYCBhdm9pZHMgaXNzdWVzIHdpdGggdGhlIGB0eXBlb2ZgIG9wZXJhdG9yXG4gIC8vIGluIFNhZmFyaSA5IHdoaWNoIHJldHVybnMgJ29iamVjdCcgZm9yIHR5cGVkIGFycmF5cyBhbmQgb3RoZXIgY29uc3RydWN0b3JzLlxuICB2YXIgdGFnID0gYmFzZUdldFRhZyh2YWx1ZSk7XG4gIHJldHVybiB0YWcgPT0gZnVuY1RhZyB8fCB0YWcgPT0gZ2VuVGFnIHx8IHRhZyA9PSBhc3luY1RhZyB8fCB0YWcgPT0gcHJveHlUYWc7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNGdW5jdGlvbjtcbiIsInZhciByb290ID0gcmVxdWlyZSgnLi9fcm9vdCcpO1xuXG4vKiogVXNlZCB0byBkZXRlY3Qgb3ZlcnJlYWNoaW5nIGNvcmUtanMgc2hpbXMuICovXG52YXIgY29yZUpzRGF0YSA9IHJvb3RbJ19fY29yZS1qc19zaGFyZWRfXyddO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNvcmVKc0RhdGE7XG4iLCJ2YXIgY29yZUpzRGF0YSA9IHJlcXVpcmUoJy4vX2NvcmVKc0RhdGEnKTtcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IG1ldGhvZHMgbWFzcXVlcmFkaW5nIGFzIG5hdGl2ZS4gKi9cbnZhciBtYXNrU3JjS2V5ID0gKGZ1bmN0aW9uKCkge1xuICB2YXIgdWlkID0gL1teLl0rJC8uZXhlYyhjb3JlSnNEYXRhICYmIGNvcmVKc0RhdGEua2V5cyAmJiBjb3JlSnNEYXRhLmtleXMuSUVfUFJPVE8gfHwgJycpO1xuICByZXR1cm4gdWlkID8gKCdTeW1ib2woc3JjKV8xLicgKyB1aWQpIDogJyc7XG59KCkpO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgZnVuY2AgaGFzIGl0cyBzb3VyY2UgbWFza2VkLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgZnVuY2AgaXMgbWFza2VkLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGlzTWFza2VkKGZ1bmMpIHtcbiAgcmV0dXJuICEhbWFza1NyY0tleSAmJiAobWFza1NyY0tleSBpbiBmdW5jKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc01hc2tlZDtcbiIsIi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBmdW5jUHJvdG8gPSBGdW5jdGlvbi5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIHJlc29sdmUgdGhlIGRlY29tcGlsZWQgc291cmNlIG9mIGZ1bmN0aW9ucy4gKi9cbnZhciBmdW5jVG9TdHJpbmcgPSBmdW5jUHJvdG8udG9TdHJpbmc7XG5cbi8qKlxuICogQ29udmVydHMgYGZ1bmNgIHRvIGl0cyBzb3VyY2UgY29kZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gY29udmVydC5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIHNvdXJjZSBjb2RlLlxuICovXG5mdW5jdGlvbiB0b1NvdXJjZShmdW5jKSB7XG4gIGlmIChmdW5jICE9IG51bGwpIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGZ1bmNUb1N0cmluZy5jYWxsKGZ1bmMpO1xuICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiAoZnVuYyArICcnKTtcbiAgICB9IGNhdGNoIChlKSB7fVxuICB9XG4gIHJldHVybiAnJztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB0b1NvdXJjZTtcbiIsInZhciBpc0Z1bmN0aW9uID0gcmVxdWlyZSgnLi9pc0Z1bmN0aW9uJyksXG4gICAgaXNNYXNrZWQgPSByZXF1aXJlKCcuL19pc01hc2tlZCcpLFxuICAgIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9pc09iamVjdCcpLFxuICAgIHRvU291cmNlID0gcmVxdWlyZSgnLi9fdG9Tb3VyY2UnKTtcblxuLyoqXG4gKiBVc2VkIHRvIG1hdGNoIGBSZWdFeHBgXG4gKiBbc3ludGF4IGNoYXJhY3RlcnNdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLXBhdHRlcm5zKS5cbiAqL1xudmFyIHJlUmVnRXhwQ2hhciA9IC9bXFxcXF4kLiorPygpW1xcXXt9fF0vZztcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IGhvc3QgY29uc3RydWN0b3JzIChTYWZhcmkpLiAqL1xudmFyIHJlSXNIb3N0Q3RvciA9IC9eXFxbb2JqZWN0IC4rP0NvbnN0cnVjdG9yXFxdJC87XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBmdW5jUHJvdG8gPSBGdW5jdGlvbi5wcm90b3R5cGUsXG4gICAgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byByZXNvbHZlIHRoZSBkZWNvbXBpbGVkIHNvdXJjZSBvZiBmdW5jdGlvbnMuICovXG52YXIgZnVuY1RvU3RyaW5nID0gZnVuY1Byb3RvLnRvU3RyaW5nO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKiogVXNlZCB0byBkZXRlY3QgaWYgYSBtZXRob2QgaXMgbmF0aXZlLiAqL1xudmFyIHJlSXNOYXRpdmUgPSBSZWdFeHAoJ14nICtcbiAgZnVuY1RvU3RyaW5nLmNhbGwoaGFzT3duUHJvcGVydHkpLnJlcGxhY2UocmVSZWdFeHBDaGFyLCAnXFxcXCQmJylcbiAgLnJlcGxhY2UoL2hhc093blByb3BlcnR5fChmdW5jdGlvbikuKj8oPz1cXFxcXFwoKXwgZm9yIC4rPyg/PVxcXFxcXF0pL2csICckMS4qPycpICsgJyQnXG4pO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmlzTmF0aXZlYCB3aXRob3V0IGJhZCBzaGltIGNoZWNrcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIG5hdGl2ZSBmdW5jdGlvbixcbiAqICBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGJhc2VJc05hdGl2ZSh2YWx1ZSkge1xuICBpZiAoIWlzT2JqZWN0KHZhbHVlKSB8fCBpc01hc2tlZCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgdmFyIHBhdHRlcm4gPSBpc0Z1bmN0aW9uKHZhbHVlKSA/IHJlSXNOYXRpdmUgOiByZUlzSG9zdEN0b3I7XG4gIHJldHVybiBwYXR0ZXJuLnRlc3QodG9Tb3VyY2UodmFsdWUpKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlSXNOYXRpdmU7XG4iLCIvKipcbiAqIEdldHMgdGhlIHZhbHVlIGF0IGBrZXlgIG9mIGBvYmplY3RgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gW29iamVjdF0gVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgcHJvcGVydHkgdG8gZ2V0LlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIHByb3BlcnR5IHZhbHVlLlxuICovXG5mdW5jdGlvbiBnZXRWYWx1ZShvYmplY3QsIGtleSkge1xuICByZXR1cm4gb2JqZWN0ID09IG51bGwgPyB1bmRlZmluZWQgOiBvYmplY3Rba2V5XTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZXRWYWx1ZTtcbiIsInZhciBiYXNlSXNOYXRpdmUgPSByZXF1aXJlKCcuL19iYXNlSXNOYXRpdmUnKSxcbiAgICBnZXRWYWx1ZSA9IHJlcXVpcmUoJy4vX2dldFZhbHVlJyk7XG5cbi8qKlxuICogR2V0cyB0aGUgbmF0aXZlIGZ1bmN0aW9uIGF0IGBrZXlgIG9mIGBvYmplY3RgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIG1ldGhvZCB0byBnZXQuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgZnVuY3Rpb24gaWYgaXQncyBuYXRpdmUsIGVsc2UgYHVuZGVmaW5lZGAuXG4gKi9cbmZ1bmN0aW9uIGdldE5hdGl2ZShvYmplY3QsIGtleSkge1xuICB2YXIgdmFsdWUgPSBnZXRWYWx1ZShvYmplY3QsIGtleSk7XG4gIHJldHVybiBiYXNlSXNOYXRpdmUodmFsdWUpID8gdmFsdWUgOiB1bmRlZmluZWQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0TmF0aXZlO1xuIiwidmFyIGdldE5hdGl2ZSA9IHJlcXVpcmUoJy4vX2dldE5hdGl2ZScpLFxuICAgIHJvb3QgPSByZXF1aXJlKCcuL19yb290Jyk7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIHRoYXQgYXJlIHZlcmlmaWVkIHRvIGJlIG5hdGl2ZS4gKi9cbnZhciBNYXAgPSBnZXROYXRpdmUocm9vdCwgJ01hcCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1hcDtcbiIsInZhciBnZXROYXRpdmUgPSByZXF1aXJlKCcuL19nZXROYXRpdmUnKTtcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgdGhhdCBhcmUgdmVyaWZpZWQgdG8gYmUgbmF0aXZlLiAqL1xudmFyIG5hdGl2ZUNyZWF0ZSA9IGdldE5hdGl2ZShPYmplY3QsICdjcmVhdGUnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBuYXRpdmVDcmVhdGU7XG4iLCJ2YXIgbmF0aXZlQ3JlYXRlID0gcmVxdWlyZSgnLi9fbmF0aXZlQ3JlYXRlJyk7XG5cbi8qKlxuICogUmVtb3ZlcyBhbGwga2V5LXZhbHVlIGVudHJpZXMgZnJvbSB0aGUgaGFzaC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgY2xlYXJcbiAqIEBtZW1iZXJPZiBIYXNoXG4gKi9cbmZ1bmN0aW9uIGhhc2hDbGVhcigpIHtcbiAgdGhpcy5fX2RhdGFfXyA9IG5hdGl2ZUNyZWF0ZSA/IG5hdGl2ZUNyZWF0ZShudWxsKSA6IHt9O1xuICB0aGlzLnNpemUgPSAwO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGhhc2hDbGVhcjtcbiIsIi8qKlxuICogUmVtb3ZlcyBga2V5YCBhbmQgaXRzIHZhbHVlIGZyb20gdGhlIGhhc2guXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGRlbGV0ZVxuICogQG1lbWJlck9mIEhhc2hcbiAqIEBwYXJhbSB7T2JqZWN0fSBoYXNoIFRoZSBoYXNoIHRvIG1vZGlmeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gcmVtb3ZlLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBlbnRyeSB3YXMgcmVtb3ZlZCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBoYXNoRGVsZXRlKGtleSkge1xuICB2YXIgcmVzdWx0ID0gdGhpcy5oYXMoa2V5KSAmJiBkZWxldGUgdGhpcy5fX2RhdGFfX1trZXldO1xuICB0aGlzLnNpemUgLT0gcmVzdWx0ID8gMSA6IDA7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaGFzaERlbGV0ZTtcbiIsInZhciBuYXRpdmVDcmVhdGUgPSByZXF1aXJlKCcuL19uYXRpdmVDcmVhdGUnKTtcblxuLyoqIFVzZWQgdG8gc3RhbmQtaW4gZm9yIGB1bmRlZmluZWRgIGhhc2ggdmFsdWVzLiAqL1xudmFyIEhBU0hfVU5ERUZJTkVEID0gJ19fbG9kYXNoX2hhc2hfdW5kZWZpbmVkX18nO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIEdldHMgdGhlIGhhc2ggdmFsdWUgZm9yIGBrZXlgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBnZXRcbiAqIEBtZW1iZXJPZiBIYXNoXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIGdldC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBlbnRyeSB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gaGFzaEdldChrZXkpIHtcbiAgdmFyIGRhdGEgPSB0aGlzLl9fZGF0YV9fO1xuICBpZiAobmF0aXZlQ3JlYXRlKSB7XG4gICAgdmFyIHJlc3VsdCA9IGRhdGFba2V5XTtcbiAgICByZXR1cm4gcmVzdWx0ID09PSBIQVNIX1VOREVGSU5FRCA/IHVuZGVmaW5lZCA6IHJlc3VsdDtcbiAgfVxuICByZXR1cm4gaGFzT3duUHJvcGVydHkuY2FsbChkYXRhLCBrZXkpID8gZGF0YVtrZXldIDogdW5kZWZpbmVkO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGhhc2hHZXQ7XG4iLCJ2YXIgbmF0aXZlQ3JlYXRlID0gcmVxdWlyZSgnLi9fbmF0aXZlQ3JlYXRlJyk7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGEgaGFzaCB2YWx1ZSBmb3IgYGtleWAgZXhpc3RzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBoYXNcbiAqIEBtZW1iZXJPZiBIYXNoXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIGVudHJ5IHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGFuIGVudHJ5IGZvciBga2V5YCBleGlzdHMsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaGFzaEhhcyhrZXkpIHtcbiAgdmFyIGRhdGEgPSB0aGlzLl9fZGF0YV9fO1xuICByZXR1cm4gbmF0aXZlQ3JlYXRlID8gKGRhdGFba2V5XSAhPT0gdW5kZWZpbmVkKSA6IGhhc093blByb3BlcnR5LmNhbGwoZGF0YSwga2V5KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBoYXNoSGFzO1xuIiwidmFyIG5hdGl2ZUNyZWF0ZSA9IHJlcXVpcmUoJy4vX25hdGl2ZUNyZWF0ZScpO1xuXG4vKiogVXNlZCB0byBzdGFuZC1pbiBmb3IgYHVuZGVmaW5lZGAgaGFzaCB2YWx1ZXMuICovXG52YXIgSEFTSF9VTkRFRklORUQgPSAnX19sb2Rhc2hfaGFzaF91bmRlZmluZWRfXyc7XG5cbi8qKlxuICogU2V0cyB0aGUgaGFzaCBga2V5YCB0byBgdmFsdWVgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBzZXRcbiAqIEBtZW1iZXJPZiBIYXNoXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIHNldC5cbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHNldC5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIGhhc2ggaW5zdGFuY2UuXG4gKi9cbmZ1bmN0aW9uIGhhc2hTZXQoa2V5LCB2YWx1ZSkge1xuICB2YXIgZGF0YSA9IHRoaXMuX19kYXRhX187XG4gIHRoaXMuc2l6ZSArPSB0aGlzLmhhcyhrZXkpID8gMCA6IDE7XG4gIGRhdGFba2V5XSA9IChuYXRpdmVDcmVhdGUgJiYgdmFsdWUgPT09IHVuZGVmaW5lZCkgPyBIQVNIX1VOREVGSU5FRCA6IHZhbHVlO1xuICByZXR1cm4gdGhpcztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBoYXNoU2V0O1xuIiwidmFyIGhhc2hDbGVhciA9IHJlcXVpcmUoJy4vX2hhc2hDbGVhcicpLFxuICAgIGhhc2hEZWxldGUgPSByZXF1aXJlKCcuL19oYXNoRGVsZXRlJyksXG4gICAgaGFzaEdldCA9IHJlcXVpcmUoJy4vX2hhc2hHZXQnKSxcbiAgICBoYXNoSGFzID0gcmVxdWlyZSgnLi9faGFzaEhhcycpLFxuICAgIGhhc2hTZXQgPSByZXF1aXJlKCcuL19oYXNoU2V0Jyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGhhc2ggb2JqZWN0LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7QXJyYXl9IFtlbnRyaWVzXSBUaGUga2V5LXZhbHVlIHBhaXJzIHRvIGNhY2hlLlxuICovXG5mdW5jdGlvbiBIYXNoKGVudHJpZXMpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBlbnRyaWVzID09IG51bGwgPyAwIDogZW50cmllcy5sZW5ndGg7XG5cbiAgdGhpcy5jbGVhcigpO1xuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIHZhciBlbnRyeSA9IGVudHJpZXNbaW5kZXhdO1xuICAgIHRoaXMuc2V0KGVudHJ5WzBdLCBlbnRyeVsxXSk7XG4gIH1cbn1cblxuLy8gQWRkIG1ldGhvZHMgdG8gYEhhc2hgLlxuSGFzaC5wcm90b3R5cGUuY2xlYXIgPSBoYXNoQ2xlYXI7XG5IYXNoLnByb3RvdHlwZVsnZGVsZXRlJ10gPSBoYXNoRGVsZXRlO1xuSGFzaC5wcm90b3R5cGUuZ2V0ID0gaGFzaEdldDtcbkhhc2gucHJvdG90eXBlLmhhcyA9IGhhc2hIYXM7XG5IYXNoLnByb3RvdHlwZS5zZXQgPSBoYXNoU2V0O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEhhc2g7XG4iLCJ2YXIgSGFzaCA9IHJlcXVpcmUoJy4vX0hhc2gnKSxcbiAgICBMaXN0Q2FjaGUgPSByZXF1aXJlKCcuL19MaXN0Q2FjaGUnKSxcbiAgICBNYXAgPSByZXF1aXJlKCcuL19NYXAnKTtcblxuLyoqXG4gKiBSZW1vdmVzIGFsbCBrZXktdmFsdWUgZW50cmllcyBmcm9tIHRoZSBtYXAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGNsZWFyXG4gKiBAbWVtYmVyT2YgTWFwQ2FjaGVcbiAqL1xuZnVuY3Rpb24gbWFwQ2FjaGVDbGVhcigpIHtcbiAgdGhpcy5zaXplID0gMDtcbiAgdGhpcy5fX2RhdGFfXyA9IHtcbiAgICAnaGFzaCc6IG5ldyBIYXNoLFxuICAgICdtYXAnOiBuZXcgKE1hcCB8fCBMaXN0Q2FjaGUpLFxuICAgICdzdHJpbmcnOiBuZXcgSGFzaFxuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG1hcENhY2hlQ2xlYXI7XG4iLCIvKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIHN1aXRhYmxlIGZvciB1c2UgYXMgdW5pcXVlIG9iamVjdCBrZXkuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgc3VpdGFibGUsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaXNLZXlhYmxlKHZhbHVlKSB7XG4gIHZhciB0eXBlID0gdHlwZW9mIHZhbHVlO1xuICByZXR1cm4gKHR5cGUgPT0gJ3N0cmluZycgfHwgdHlwZSA9PSAnbnVtYmVyJyB8fCB0eXBlID09ICdzeW1ib2wnIHx8IHR5cGUgPT0gJ2Jvb2xlYW4nKVxuICAgID8gKHZhbHVlICE9PSAnX19wcm90b19fJylcbiAgICA6ICh2YWx1ZSA9PT0gbnVsbCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNLZXlhYmxlO1xuIiwidmFyIGlzS2V5YWJsZSA9IHJlcXVpcmUoJy4vX2lzS2V5YWJsZScpO1xuXG4vKipcbiAqIEdldHMgdGhlIGRhdGEgZm9yIGBtYXBgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gbWFwIFRoZSBtYXAgdG8gcXVlcnkuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSByZWZlcmVuY2Uga2V5LlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIG1hcCBkYXRhLlxuICovXG5mdW5jdGlvbiBnZXRNYXBEYXRhKG1hcCwga2V5KSB7XG4gIHZhciBkYXRhID0gbWFwLl9fZGF0YV9fO1xuICByZXR1cm4gaXNLZXlhYmxlKGtleSlcbiAgICA/IGRhdGFbdHlwZW9mIGtleSA9PSAnc3RyaW5nJyA/ICdzdHJpbmcnIDogJ2hhc2gnXVxuICAgIDogZGF0YS5tYXA7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0TWFwRGF0YTtcbiIsInZhciBnZXRNYXBEYXRhID0gcmVxdWlyZSgnLi9fZ2V0TWFwRGF0YScpO1xuXG4vKipcbiAqIFJlbW92ZXMgYGtleWAgYW5kIGl0cyB2YWx1ZSBmcm9tIHRoZSBtYXAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGRlbGV0ZVxuICogQG1lbWJlck9mIE1hcENhY2hlXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIHJlbW92ZS5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgZW50cnkgd2FzIHJlbW92ZWQsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gbWFwQ2FjaGVEZWxldGUoa2V5KSB7XG4gIHZhciByZXN1bHQgPSBnZXRNYXBEYXRhKHRoaXMsIGtleSlbJ2RlbGV0ZSddKGtleSk7XG4gIHRoaXMuc2l6ZSAtPSByZXN1bHQgPyAxIDogMDtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBtYXBDYWNoZURlbGV0ZTtcbiIsInZhciBnZXRNYXBEYXRhID0gcmVxdWlyZSgnLi9fZ2V0TWFwRGF0YScpO1xuXG4vKipcbiAqIEdldHMgdGhlIG1hcCB2YWx1ZSBmb3IgYGtleWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGdldFxuICogQG1lbWJlck9mIE1hcENhY2hlXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIGdldC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBlbnRyeSB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gbWFwQ2FjaGVHZXQoa2V5KSB7XG4gIHJldHVybiBnZXRNYXBEYXRhKHRoaXMsIGtleSkuZ2V0KGtleSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbWFwQ2FjaGVHZXQ7XG4iLCJ2YXIgZ2V0TWFwRGF0YSA9IHJlcXVpcmUoJy4vX2dldE1hcERhdGEnKTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYSBtYXAgdmFsdWUgZm9yIGBrZXlgIGV4aXN0cy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgaGFzXG4gKiBAbWVtYmVyT2YgTWFwQ2FjaGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgZW50cnkgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYW4gZW50cnkgZm9yIGBrZXlgIGV4aXN0cywgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBtYXBDYWNoZUhhcyhrZXkpIHtcbiAgcmV0dXJuIGdldE1hcERhdGEodGhpcywga2V5KS5oYXMoa2V5KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBtYXBDYWNoZUhhcztcbiIsInZhciBnZXRNYXBEYXRhID0gcmVxdWlyZSgnLi9fZ2V0TWFwRGF0YScpO1xuXG4vKipcbiAqIFNldHMgdGhlIG1hcCBga2V5YCB0byBgdmFsdWVgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBzZXRcbiAqIEBtZW1iZXJPZiBNYXBDYWNoZVxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byBzZXQuXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBzZXQuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBtYXAgY2FjaGUgaW5zdGFuY2UuXG4gKi9cbmZ1bmN0aW9uIG1hcENhY2hlU2V0KGtleSwgdmFsdWUpIHtcbiAgdmFyIGRhdGEgPSBnZXRNYXBEYXRhKHRoaXMsIGtleSksXG4gICAgICBzaXplID0gZGF0YS5zaXplO1xuXG4gIGRhdGEuc2V0KGtleSwgdmFsdWUpO1xuICB0aGlzLnNpemUgKz0gZGF0YS5zaXplID09IHNpemUgPyAwIDogMTtcbiAgcmV0dXJuIHRoaXM7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbWFwQ2FjaGVTZXQ7XG4iLCJ2YXIgbWFwQ2FjaGVDbGVhciA9IHJlcXVpcmUoJy4vX21hcENhY2hlQ2xlYXInKSxcbiAgICBtYXBDYWNoZURlbGV0ZSA9IHJlcXVpcmUoJy4vX21hcENhY2hlRGVsZXRlJyksXG4gICAgbWFwQ2FjaGVHZXQgPSByZXF1aXJlKCcuL19tYXBDYWNoZUdldCcpLFxuICAgIG1hcENhY2hlSGFzID0gcmVxdWlyZSgnLi9fbWFwQ2FjaGVIYXMnKSxcbiAgICBtYXBDYWNoZVNldCA9IHJlcXVpcmUoJy4vX21hcENhY2hlU2V0Jyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG1hcCBjYWNoZSBvYmplY3QgdG8gc3RvcmUga2V5LXZhbHVlIHBhaXJzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7QXJyYXl9IFtlbnRyaWVzXSBUaGUga2V5LXZhbHVlIHBhaXJzIHRvIGNhY2hlLlxuICovXG5mdW5jdGlvbiBNYXBDYWNoZShlbnRyaWVzKSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gZW50cmllcyA9PSBudWxsID8gMCA6IGVudHJpZXMubGVuZ3RoO1xuXG4gIHRoaXMuY2xlYXIoKTtcbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICB2YXIgZW50cnkgPSBlbnRyaWVzW2luZGV4XTtcbiAgICB0aGlzLnNldChlbnRyeVswXSwgZW50cnlbMV0pO1xuICB9XG59XG5cbi8vIEFkZCBtZXRob2RzIHRvIGBNYXBDYWNoZWAuXG5NYXBDYWNoZS5wcm90b3R5cGUuY2xlYXIgPSBtYXBDYWNoZUNsZWFyO1xuTWFwQ2FjaGUucHJvdG90eXBlWydkZWxldGUnXSA9IG1hcENhY2hlRGVsZXRlO1xuTWFwQ2FjaGUucHJvdG90eXBlLmdldCA9IG1hcENhY2hlR2V0O1xuTWFwQ2FjaGUucHJvdG90eXBlLmhhcyA9IG1hcENhY2hlSGFzO1xuTWFwQ2FjaGUucHJvdG90eXBlLnNldCA9IG1hcENhY2hlU2V0O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1hcENhY2hlO1xuIiwidmFyIExpc3RDYWNoZSA9IHJlcXVpcmUoJy4vX0xpc3RDYWNoZScpLFxuICAgIE1hcCA9IHJlcXVpcmUoJy4vX01hcCcpLFxuICAgIE1hcENhY2hlID0gcmVxdWlyZSgnLi9fTWFwQ2FjaGUnKTtcblxuLyoqIFVzZWQgYXMgdGhlIHNpemUgdG8gZW5hYmxlIGxhcmdlIGFycmF5IG9wdGltaXphdGlvbnMuICovXG52YXIgTEFSR0VfQVJSQVlfU0laRSA9IDIwMDtcblxuLyoqXG4gKiBTZXRzIHRoZSBzdGFjayBga2V5YCB0byBgdmFsdWVgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBzZXRcbiAqIEBtZW1iZXJPZiBTdGFja1xuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byBzZXQuXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBzZXQuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBzdGFjayBjYWNoZSBpbnN0YW5jZS5cbiAqL1xuZnVuY3Rpb24gc3RhY2tTZXQoa2V5LCB2YWx1ZSkge1xuICB2YXIgZGF0YSA9IHRoaXMuX19kYXRhX187XG4gIGlmIChkYXRhIGluc3RhbmNlb2YgTGlzdENhY2hlKSB7XG4gICAgdmFyIHBhaXJzID0gZGF0YS5fX2RhdGFfXztcbiAgICBpZiAoIU1hcCB8fCAocGFpcnMubGVuZ3RoIDwgTEFSR0VfQVJSQVlfU0laRSAtIDEpKSB7XG4gICAgICBwYWlycy5wdXNoKFtrZXksIHZhbHVlXSk7XG4gICAgICB0aGlzLnNpemUgPSArK2RhdGEuc2l6ZTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBkYXRhID0gdGhpcy5fX2RhdGFfXyA9IG5ldyBNYXBDYWNoZShwYWlycyk7XG4gIH1cbiAgZGF0YS5zZXQoa2V5LCB2YWx1ZSk7XG4gIHRoaXMuc2l6ZSA9IGRhdGEuc2l6ZTtcbiAgcmV0dXJuIHRoaXM7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc3RhY2tTZXQ7XG4iLCJ2YXIgTGlzdENhY2hlID0gcmVxdWlyZSgnLi9fTGlzdENhY2hlJyksXG4gICAgc3RhY2tDbGVhciA9IHJlcXVpcmUoJy4vX3N0YWNrQ2xlYXInKSxcbiAgICBzdGFja0RlbGV0ZSA9IHJlcXVpcmUoJy4vX3N0YWNrRGVsZXRlJyksXG4gICAgc3RhY2tHZXQgPSByZXF1aXJlKCcuL19zdGFja0dldCcpLFxuICAgIHN0YWNrSGFzID0gcmVxdWlyZSgnLi9fc3RhY2tIYXMnKSxcbiAgICBzdGFja1NldCA9IHJlcXVpcmUoJy4vX3N0YWNrU2V0Jyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIHN0YWNrIGNhY2hlIG9iamVjdCB0byBzdG9yZSBrZXktdmFsdWUgcGFpcnMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtBcnJheX0gW2VudHJpZXNdIFRoZSBrZXktdmFsdWUgcGFpcnMgdG8gY2FjaGUuXG4gKi9cbmZ1bmN0aW9uIFN0YWNrKGVudHJpZXMpIHtcbiAgdmFyIGRhdGEgPSB0aGlzLl9fZGF0YV9fID0gbmV3IExpc3RDYWNoZShlbnRyaWVzKTtcbiAgdGhpcy5zaXplID0gZGF0YS5zaXplO1xufVxuXG4vLyBBZGQgbWV0aG9kcyB0byBgU3RhY2tgLlxuU3RhY2sucHJvdG90eXBlLmNsZWFyID0gc3RhY2tDbGVhcjtcblN0YWNrLnByb3RvdHlwZVsnZGVsZXRlJ10gPSBzdGFja0RlbGV0ZTtcblN0YWNrLnByb3RvdHlwZS5nZXQgPSBzdGFja0dldDtcblN0YWNrLnByb3RvdHlwZS5oYXMgPSBzdGFja0hhcztcblN0YWNrLnByb3RvdHlwZS5zZXQgPSBzdGFja1NldDtcblxubW9kdWxlLmV4cG9ydHMgPSBTdGFjaztcbiIsIi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBfLmZvckVhY2hgIGZvciBhcnJheXMgd2l0aG91dCBzdXBwb3J0IGZvclxuICogaXRlcmF0ZWUgc2hvcnRoYW5kcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheX0gW2FycmF5XSBUaGUgYXJyYXkgdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0ZWUgVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyBgYXJyYXlgLlxuICovXG5mdW5jdGlvbiBhcnJheUVhY2goYXJyYXksIGl0ZXJhdGVlKSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gYXJyYXkgPT0gbnVsbCA/IDAgOiBhcnJheS5sZW5ndGg7XG5cbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICBpZiAoaXRlcmF0ZWUoYXJyYXlbaW5kZXhdLCBpbmRleCwgYXJyYXkpID09PSBmYWxzZSkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIHJldHVybiBhcnJheTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBhcnJheUVhY2g7XG4iLCJ2YXIgZ2V0TmF0aXZlID0gcmVxdWlyZSgnLi9fZ2V0TmF0aXZlJyk7XG5cbnZhciBkZWZpbmVQcm9wZXJ0eSA9IChmdW5jdGlvbigpIHtcbiAgdHJ5IHtcbiAgICB2YXIgZnVuYyA9IGdldE5hdGl2ZShPYmplY3QsICdkZWZpbmVQcm9wZXJ0eScpO1xuICAgIGZ1bmMoe30sICcnLCB7fSk7XG4gICAgcmV0dXJuIGZ1bmM7XG4gIH0gY2F0Y2ggKGUpIHt9XG59KCkpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRlZmluZVByb3BlcnR5O1xuIiwidmFyIGRlZmluZVByb3BlcnR5ID0gcmVxdWlyZSgnLi9fZGVmaW5lUHJvcGVydHknKTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgYXNzaWduVmFsdWVgIGFuZCBgYXNzaWduTWVyZ2VWYWx1ZWAgd2l0aG91dFxuICogdmFsdWUgY2hlY2tzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gbW9kaWZ5LlxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBwcm9wZXJ0eSB0byBhc3NpZ24uXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBhc3NpZ24uXG4gKi9cbmZ1bmN0aW9uIGJhc2VBc3NpZ25WYWx1ZShvYmplY3QsIGtleSwgdmFsdWUpIHtcbiAgaWYgKGtleSA9PSAnX19wcm90b19fJyAmJiBkZWZpbmVQcm9wZXJ0eSkge1xuICAgIGRlZmluZVByb3BlcnR5KG9iamVjdCwga2V5LCB7XG4gICAgICAnY29uZmlndXJhYmxlJzogdHJ1ZSxcbiAgICAgICdlbnVtZXJhYmxlJzogdHJ1ZSxcbiAgICAgICd2YWx1ZSc6IHZhbHVlLFxuICAgICAgJ3dyaXRhYmxlJzogdHJ1ZVxuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIG9iamVjdFtrZXldID0gdmFsdWU7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlQXNzaWduVmFsdWU7XG4iLCJ2YXIgYmFzZUFzc2lnblZhbHVlID0gcmVxdWlyZSgnLi9fYmFzZUFzc2lnblZhbHVlJyksXG4gICAgZXEgPSByZXF1aXJlKCcuL2VxJyk7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogQXNzaWducyBgdmFsdWVgIHRvIGBrZXlgIG9mIGBvYmplY3RgIGlmIHRoZSBleGlzdGluZyB2YWx1ZSBpcyBub3QgZXF1aXZhbGVudFxuICogdXNpbmcgW2BTYW1lVmFsdWVaZXJvYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtc2FtZXZhbHVlemVybylcbiAqIGZvciBlcXVhbGl0eSBjb21wYXJpc29ucy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIG1vZGlmeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgcHJvcGVydHkgdG8gYXNzaWduLlxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gYXNzaWduLlxuICovXG5mdW5jdGlvbiBhc3NpZ25WYWx1ZShvYmplY3QsIGtleSwgdmFsdWUpIHtcbiAgdmFyIG9ialZhbHVlID0gb2JqZWN0W2tleV07XG4gIGlmICghKGhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBrZXkpICYmIGVxKG9ialZhbHVlLCB2YWx1ZSkpIHx8XG4gICAgICAodmFsdWUgPT09IHVuZGVmaW5lZCAmJiAhKGtleSBpbiBvYmplY3QpKSkge1xuICAgIGJhc2VBc3NpZ25WYWx1ZShvYmplY3QsIGtleSwgdmFsdWUpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYXNzaWduVmFsdWU7XG4iLCJ2YXIgYXNzaWduVmFsdWUgPSByZXF1aXJlKCcuL19hc3NpZ25WYWx1ZScpLFxuICAgIGJhc2VBc3NpZ25WYWx1ZSA9IHJlcXVpcmUoJy4vX2Jhc2VBc3NpZ25WYWx1ZScpO1xuXG4vKipcbiAqIENvcGllcyBwcm9wZXJ0aWVzIG9mIGBzb3VyY2VgIHRvIGBvYmplY3RgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gc291cmNlIFRoZSBvYmplY3QgdG8gY29weSBwcm9wZXJ0aWVzIGZyb20uXG4gKiBAcGFyYW0ge0FycmF5fSBwcm9wcyBUaGUgcHJvcGVydHkgaWRlbnRpZmllcnMgdG8gY29weS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb2JqZWN0PXt9XSBUaGUgb2JqZWN0IHRvIGNvcHkgcHJvcGVydGllcyB0by5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtjdXN0b21pemVyXSBUaGUgZnVuY3Rpb24gdG8gY3VzdG9taXplIGNvcGllZCB2YWx1ZXMuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGBvYmplY3RgLlxuICovXG5mdW5jdGlvbiBjb3B5T2JqZWN0KHNvdXJjZSwgcHJvcHMsIG9iamVjdCwgY3VzdG9taXplcikge1xuICB2YXIgaXNOZXcgPSAhb2JqZWN0O1xuICBvYmplY3QgfHwgKG9iamVjdCA9IHt9KTtcblxuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IHByb3BzLmxlbmd0aDtcblxuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIHZhciBrZXkgPSBwcm9wc1tpbmRleF07XG5cbiAgICB2YXIgbmV3VmFsdWUgPSBjdXN0b21pemVyXG4gICAgICA/IGN1c3RvbWl6ZXIob2JqZWN0W2tleV0sIHNvdXJjZVtrZXldLCBrZXksIG9iamVjdCwgc291cmNlKVxuICAgICAgOiB1bmRlZmluZWQ7XG5cbiAgICBpZiAobmV3VmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgbmV3VmFsdWUgPSBzb3VyY2Vba2V5XTtcbiAgICB9XG4gICAgaWYgKGlzTmV3KSB7XG4gICAgICBiYXNlQXNzaWduVmFsdWUob2JqZWN0LCBrZXksIG5ld1ZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXNzaWduVmFsdWUob2JqZWN0LCBrZXksIG5ld1ZhbHVlKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG9iamVjdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjb3B5T2JqZWN0O1xuIiwiLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy50aW1lc2Agd2l0aG91dCBzdXBwb3J0IGZvciBpdGVyYXRlZSBzaG9ydGhhbmRzXG4gKiBvciBtYXggYXJyYXkgbGVuZ3RoIGNoZWNrcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtudW1iZXJ9IG4gVGhlIG51bWJlciBvZiB0aW1lcyB0byBpbnZva2UgYGl0ZXJhdGVlYC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdGVlIFRoZSBmdW5jdGlvbiBpbnZva2VkIHBlciBpdGVyYXRpb24uXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHJlc3VsdHMuXG4gKi9cbmZ1bmN0aW9uIGJhc2VUaW1lcyhuLCBpdGVyYXRlZSkge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIHJlc3VsdCA9IEFycmF5KG4pO1xuXG4gIHdoaWxlICgrK2luZGV4IDwgbikge1xuICAgIHJlc3VsdFtpbmRleF0gPSBpdGVyYXRlZShpbmRleCk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlVGltZXM7XG4iLCIvKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIG9iamVjdC1saWtlLiBBIHZhbHVlIGlzIG9iamVjdC1saWtlIGlmIGl0J3Mgbm90IGBudWxsYFxuICogYW5kIGhhcyBhIGB0eXBlb2ZgIHJlc3VsdCBvZiBcIm9iamVjdFwiLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIG9iamVjdC1saWtlLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKHt9KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKF8ubm9vcCk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKG51bGwpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3RMaWtlKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSAhPSBudWxsICYmIHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0Jztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc09iamVjdExpa2U7XG4iLCJ2YXIgYmFzZUdldFRhZyA9IHJlcXVpcmUoJy4vX2Jhc2VHZXRUYWcnKSxcbiAgICBpc09iamVjdExpa2UgPSByZXF1aXJlKCcuL2lzT2JqZWN0TGlrZScpO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgYXJnc1RhZyA9ICdbb2JqZWN0IEFyZ3VtZW50c10nO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmlzQXJndW1lbnRzYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhbiBgYXJndW1lbnRzYCBvYmplY3QsXG4gKi9cbmZ1bmN0aW9uIGJhc2VJc0FyZ3VtZW50cyh2YWx1ZSkge1xuICByZXR1cm4gaXNPYmplY3RMaWtlKHZhbHVlKSAmJiBiYXNlR2V0VGFnKHZhbHVlKSA9PSBhcmdzVGFnO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VJc0FyZ3VtZW50cztcbiIsInZhciBiYXNlSXNBcmd1bWVudHMgPSByZXF1aXJlKCcuL19iYXNlSXNBcmd1bWVudHMnKSxcbiAgICBpc09iamVjdExpa2UgPSByZXF1aXJlKCcuL2lzT2JqZWN0TGlrZScpO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBwcm9wZXJ0eUlzRW51bWVyYWJsZSA9IG9iamVjdFByb3RvLnByb3BlcnR5SXNFbnVtZXJhYmxlO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGxpa2VseSBhbiBgYXJndW1lbnRzYCBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYW4gYGFyZ3VtZW50c2Agb2JqZWN0LFxuICogIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0FyZ3VtZW50cyhmdW5jdGlvbigpIHsgcmV0dXJuIGFyZ3VtZW50czsgfSgpKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQXJndW1lbnRzKFsxLCAyLCAzXSk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG52YXIgaXNBcmd1bWVudHMgPSBiYXNlSXNBcmd1bWVudHMoZnVuY3Rpb24oKSB7IHJldHVybiBhcmd1bWVudHM7IH0oKSkgPyBiYXNlSXNBcmd1bWVudHMgOiBmdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gaXNPYmplY3RMaWtlKHZhbHVlKSAmJiBoYXNPd25Qcm9wZXJ0eS5jYWxsKHZhbHVlLCAnY2FsbGVlJykgJiZcbiAgICAhcHJvcGVydHlJc0VudW1lcmFibGUuY2FsbCh2YWx1ZSwgJ2NhbGxlZScpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBpc0FyZ3VtZW50cztcbiIsIi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgY2xhc3NpZmllZCBhcyBhbiBgQXJyYXlgIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhbiBhcnJheSwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzQXJyYXkoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQXJyYXkoZG9jdW1lbnQuYm9keS5jaGlsZHJlbik7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNBcnJheSgnYWJjJyk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNBcnJheShfLm5vb3ApO1xuICogLy8gPT4gZmFsc2VcbiAqL1xudmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGlzQXJyYXk7XG4iLCIvKipcbiAqIFRoaXMgbWV0aG9kIHJldHVybnMgYGZhbHNlYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMTMuMFxuICogQGNhdGVnb3J5IFV0aWxcbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8udGltZXMoMiwgXy5zdHViRmFsc2UpO1xuICogLy8gPT4gW2ZhbHNlLCBmYWxzZV1cbiAqL1xuZnVuY3Rpb24gc3R1YkZhbHNlKCkge1xuICByZXR1cm4gZmFsc2U7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc3R1YkZhbHNlO1xuIiwidmFyIHJvb3QgPSByZXF1aXJlKCcuL19yb290JyksXG4gICAgc3R1YkZhbHNlID0gcmVxdWlyZSgnLi9zdHViRmFsc2UnKTtcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBleHBvcnRzYC4gKi9cbnZhciBmcmVlRXhwb3J0cyA9IHR5cGVvZiBleHBvcnRzID09ICdvYmplY3QnICYmIGV4cG9ydHMgJiYgIWV4cG9ydHMubm9kZVR5cGUgJiYgZXhwb3J0cztcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBtb2R1bGVgLiAqL1xudmFyIGZyZWVNb2R1bGUgPSBmcmVlRXhwb3J0cyAmJiB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZSAmJiAhbW9kdWxlLm5vZGVUeXBlICYmIG1vZHVsZTtcblxuLyoqIERldGVjdCB0aGUgcG9wdWxhciBDb21tb25KUyBleHRlbnNpb24gYG1vZHVsZS5leHBvcnRzYC4gKi9cbnZhciBtb2R1bGVFeHBvcnRzID0gZnJlZU1vZHVsZSAmJiBmcmVlTW9kdWxlLmV4cG9ydHMgPT09IGZyZWVFeHBvcnRzO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBCdWZmZXIgPSBtb2R1bGVFeHBvcnRzID8gcm9vdC5CdWZmZXIgOiB1bmRlZmluZWQ7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIGZvciB0aG9zZSB3aXRoIHRoZSBzYW1lIG5hbWUgYXMgb3RoZXIgYGxvZGFzaGAgbWV0aG9kcy4gKi9cbnZhciBuYXRpdmVJc0J1ZmZlciA9IEJ1ZmZlciA/IEJ1ZmZlci5pc0J1ZmZlciA6IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIGJ1ZmZlci5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMy4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIGJ1ZmZlciwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzQnVmZmVyKG5ldyBCdWZmZXIoMikpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNCdWZmZXIobmV3IFVpbnQ4QXJyYXkoMikpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xudmFyIGlzQnVmZmVyID0gbmF0aXZlSXNCdWZmZXIgfHwgc3R1YkZhbHNlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGlzQnVmZmVyO1xuIiwiLyoqIFVzZWQgYXMgcmVmZXJlbmNlcyBmb3IgdmFyaW91cyBgTnVtYmVyYCBjb25zdGFudHMuICovXG52YXIgTUFYX1NBRkVfSU5URUdFUiA9IDkwMDcxOTkyNTQ3NDA5OTE7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCB1bnNpZ25lZCBpbnRlZ2VyIHZhbHVlcy4gKi9cbnZhciByZUlzVWludCA9IC9eKD86MHxbMS05XVxcZCopJC87XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSB2YWxpZCBhcnJheS1saWtlIGluZGV4LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbbGVuZ3RoPU1BWF9TQUZFX0lOVEVHRVJdIFRoZSB1cHBlciBib3VuZHMgb2YgYSB2YWxpZCBpbmRleC5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgdmFsaWQgaW5kZXgsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaXNJbmRleCh2YWx1ZSwgbGVuZ3RoKSB7XG4gIGxlbmd0aCA9IGxlbmd0aCA9PSBudWxsID8gTUFYX1NBRkVfSU5URUdFUiA6IGxlbmd0aDtcbiAgcmV0dXJuICEhbGVuZ3RoICYmXG4gICAgKHR5cGVvZiB2YWx1ZSA9PSAnbnVtYmVyJyB8fCByZUlzVWludC50ZXN0KHZhbHVlKSkgJiZcbiAgICAodmFsdWUgPiAtMSAmJiB2YWx1ZSAlIDEgPT0gMCAmJiB2YWx1ZSA8IGxlbmd0aCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNJbmRleDtcbiIsIi8qKiBVc2VkIGFzIHJlZmVyZW5jZXMgZm9yIHZhcmlvdXMgYE51bWJlcmAgY29uc3RhbnRzLiAqL1xudmFyIE1BWF9TQUZFX0lOVEVHRVIgPSA5MDA3MTk5MjU0NzQwOTkxO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgdmFsaWQgYXJyYXktbGlrZSBsZW5ndGguXG4gKlxuICogKipOb3RlOioqIFRoaXMgbWV0aG9kIGlzIGxvb3NlbHkgYmFzZWQgb25cbiAqIFtgVG9MZW5ndGhgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy10b2xlbmd0aCkuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSB2YWxpZCBsZW5ndGgsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0xlbmd0aCgzKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzTGVuZ3RoKE51bWJlci5NSU5fVkFMVUUpO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzTGVuZ3RoKEluZmluaXR5KTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc0xlbmd0aCgnMycpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNMZW5ndGgodmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAnbnVtYmVyJyAmJlxuICAgIHZhbHVlID4gLTEgJiYgdmFsdWUgJSAxID09IDAgJiYgdmFsdWUgPD0gTUFYX1NBRkVfSU5URUdFUjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc0xlbmd0aDtcbiIsInZhciBiYXNlR2V0VGFnID0gcmVxdWlyZSgnLi9fYmFzZUdldFRhZycpLFxuICAgIGlzTGVuZ3RoID0gcmVxdWlyZSgnLi9pc0xlbmd0aCcpLFxuICAgIGlzT2JqZWN0TGlrZSA9IHJlcXVpcmUoJy4vaXNPYmplY3RMaWtlJyk7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBhcmdzVGFnID0gJ1tvYmplY3QgQXJndW1lbnRzXScsXG4gICAgYXJyYXlUYWcgPSAnW29iamVjdCBBcnJheV0nLFxuICAgIGJvb2xUYWcgPSAnW29iamVjdCBCb29sZWFuXScsXG4gICAgZGF0ZVRhZyA9ICdbb2JqZWN0IERhdGVdJyxcbiAgICBlcnJvclRhZyA9ICdbb2JqZWN0IEVycm9yXScsXG4gICAgZnVuY1RhZyA9ICdbb2JqZWN0IEZ1bmN0aW9uXScsXG4gICAgbWFwVGFnID0gJ1tvYmplY3QgTWFwXScsXG4gICAgbnVtYmVyVGFnID0gJ1tvYmplY3QgTnVtYmVyXScsXG4gICAgb2JqZWN0VGFnID0gJ1tvYmplY3QgT2JqZWN0XScsXG4gICAgcmVnZXhwVGFnID0gJ1tvYmplY3QgUmVnRXhwXScsXG4gICAgc2V0VGFnID0gJ1tvYmplY3QgU2V0XScsXG4gICAgc3RyaW5nVGFnID0gJ1tvYmplY3QgU3RyaW5nXScsXG4gICAgd2Vha01hcFRhZyA9ICdbb2JqZWN0IFdlYWtNYXBdJztcblxudmFyIGFycmF5QnVmZmVyVGFnID0gJ1tvYmplY3QgQXJyYXlCdWZmZXJdJyxcbiAgICBkYXRhVmlld1RhZyA9ICdbb2JqZWN0IERhdGFWaWV3XScsXG4gICAgZmxvYXQzMlRhZyA9ICdbb2JqZWN0IEZsb2F0MzJBcnJheV0nLFxuICAgIGZsb2F0NjRUYWcgPSAnW29iamVjdCBGbG9hdDY0QXJyYXldJyxcbiAgICBpbnQ4VGFnID0gJ1tvYmplY3QgSW50OEFycmF5XScsXG4gICAgaW50MTZUYWcgPSAnW29iamVjdCBJbnQxNkFycmF5XScsXG4gICAgaW50MzJUYWcgPSAnW29iamVjdCBJbnQzMkFycmF5XScsXG4gICAgdWludDhUYWcgPSAnW29iamVjdCBVaW50OEFycmF5XScsXG4gICAgdWludDhDbGFtcGVkVGFnID0gJ1tvYmplY3QgVWludDhDbGFtcGVkQXJyYXldJyxcbiAgICB1aW50MTZUYWcgPSAnW29iamVjdCBVaW50MTZBcnJheV0nLFxuICAgIHVpbnQzMlRhZyA9ICdbb2JqZWN0IFVpbnQzMkFycmF5XSc7XG5cbi8qKiBVc2VkIHRvIGlkZW50aWZ5IGB0b1N0cmluZ1RhZ2AgdmFsdWVzIG9mIHR5cGVkIGFycmF5cy4gKi9cbnZhciB0eXBlZEFycmF5VGFncyA9IHt9O1xudHlwZWRBcnJheVRhZ3NbZmxvYXQzMlRhZ10gPSB0eXBlZEFycmF5VGFnc1tmbG9hdDY0VGFnXSA9XG50eXBlZEFycmF5VGFnc1tpbnQ4VGFnXSA9IHR5cGVkQXJyYXlUYWdzW2ludDE2VGFnXSA9XG50eXBlZEFycmF5VGFnc1tpbnQzMlRhZ10gPSB0eXBlZEFycmF5VGFnc1t1aW50OFRhZ10gPVxudHlwZWRBcnJheVRhZ3NbdWludDhDbGFtcGVkVGFnXSA9IHR5cGVkQXJyYXlUYWdzW3VpbnQxNlRhZ10gPVxudHlwZWRBcnJheVRhZ3NbdWludDMyVGFnXSA9IHRydWU7XG50eXBlZEFycmF5VGFnc1thcmdzVGFnXSA9IHR5cGVkQXJyYXlUYWdzW2FycmF5VGFnXSA9XG50eXBlZEFycmF5VGFnc1thcnJheUJ1ZmZlclRhZ10gPSB0eXBlZEFycmF5VGFnc1tib29sVGFnXSA9XG50eXBlZEFycmF5VGFnc1tkYXRhVmlld1RhZ10gPSB0eXBlZEFycmF5VGFnc1tkYXRlVGFnXSA9XG50eXBlZEFycmF5VGFnc1tlcnJvclRhZ10gPSB0eXBlZEFycmF5VGFnc1tmdW5jVGFnXSA9XG50eXBlZEFycmF5VGFnc1ttYXBUYWddID0gdHlwZWRBcnJheVRhZ3NbbnVtYmVyVGFnXSA9XG50eXBlZEFycmF5VGFnc1tvYmplY3RUYWddID0gdHlwZWRBcnJheVRhZ3NbcmVnZXhwVGFnXSA9XG50eXBlZEFycmF5VGFnc1tzZXRUYWddID0gdHlwZWRBcnJheVRhZ3Nbc3RyaW5nVGFnXSA9XG50eXBlZEFycmF5VGFnc1t3ZWFrTWFwVGFnXSA9IGZhbHNlO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmlzVHlwZWRBcnJheWAgd2l0aG91dCBOb2RlLmpzIG9wdGltaXphdGlvbnMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSB0eXBlZCBhcnJheSwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBiYXNlSXNUeXBlZEFycmF5KHZhbHVlKSB7XG4gIHJldHVybiBpc09iamVjdExpa2UodmFsdWUpICYmXG4gICAgaXNMZW5ndGgodmFsdWUubGVuZ3RoKSAmJiAhIXR5cGVkQXJyYXlUYWdzW2Jhc2VHZXRUYWcodmFsdWUpXTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlSXNUeXBlZEFycmF5O1xuIiwiLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy51bmFyeWAgd2l0aG91dCBzdXBwb3J0IGZvciBzdG9yaW5nIG1ldGFkYXRhLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBjYXAgYXJndW1lbnRzIGZvci5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGNhcHBlZCBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gYmFzZVVuYXJ5KGZ1bmMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIGZ1bmModmFsdWUpO1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VVbmFyeTtcbiIsInZhciBmcmVlR2xvYmFsID0gcmVxdWlyZSgnLi9fZnJlZUdsb2JhbCcpO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYGV4cG9ydHNgLiAqL1xudmFyIGZyZWVFeHBvcnRzID0gdHlwZW9mIGV4cG9ydHMgPT0gJ29iamVjdCcgJiYgZXhwb3J0cyAmJiAhZXhwb3J0cy5ub2RlVHlwZSAmJiBleHBvcnRzO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYG1vZHVsZWAuICovXG52YXIgZnJlZU1vZHVsZSA9IGZyZWVFeHBvcnRzICYmIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlICYmICFtb2R1bGUubm9kZVR5cGUgJiYgbW9kdWxlO1xuXG4vKiogRGV0ZWN0IHRoZSBwb3B1bGFyIENvbW1vbkpTIGV4dGVuc2lvbiBgbW9kdWxlLmV4cG9ydHNgLiAqL1xudmFyIG1vZHVsZUV4cG9ydHMgPSBmcmVlTW9kdWxlICYmIGZyZWVNb2R1bGUuZXhwb3J0cyA9PT0gZnJlZUV4cG9ydHM7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgcHJvY2Vzc2AgZnJvbSBOb2RlLmpzLiAqL1xudmFyIGZyZWVQcm9jZXNzID0gbW9kdWxlRXhwb3J0cyAmJiBmcmVlR2xvYmFsLnByb2Nlc3M7XG5cbi8qKiBVc2VkIHRvIGFjY2VzcyBmYXN0ZXIgTm9kZS5qcyBoZWxwZXJzLiAqL1xudmFyIG5vZGVVdGlsID0gKGZ1bmN0aW9uKCkge1xuICB0cnkge1xuICAgIHJldHVybiBmcmVlUHJvY2VzcyAmJiBmcmVlUHJvY2Vzcy5iaW5kaW5nICYmIGZyZWVQcm9jZXNzLmJpbmRpbmcoJ3V0aWwnKTtcbiAgfSBjYXRjaCAoZSkge31cbn0oKSk7XG5cbm1vZHVsZS5leHBvcnRzID0gbm9kZVV0aWw7XG4iLCJ2YXIgYmFzZUlzVHlwZWRBcnJheSA9IHJlcXVpcmUoJy4vX2Jhc2VJc1R5cGVkQXJyYXknKSxcbiAgICBiYXNlVW5hcnkgPSByZXF1aXJlKCcuL19iYXNlVW5hcnknKSxcbiAgICBub2RlVXRpbCA9IHJlcXVpcmUoJy4vX25vZGVVdGlsJyk7XG5cbi8qIE5vZGUuanMgaGVscGVyIHJlZmVyZW5jZXMuICovXG52YXIgbm9kZUlzVHlwZWRBcnJheSA9IG5vZGVVdGlsICYmIG5vZGVVdGlsLmlzVHlwZWRBcnJheTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBjbGFzc2lmaWVkIGFzIGEgdHlwZWQgYXJyYXkuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAzLjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSB0eXBlZCBhcnJheSwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzVHlwZWRBcnJheShuZXcgVWludDhBcnJheSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc1R5cGVkQXJyYXkoW10pO1xuICogLy8gPT4gZmFsc2VcbiAqL1xudmFyIGlzVHlwZWRBcnJheSA9IG5vZGVJc1R5cGVkQXJyYXkgPyBiYXNlVW5hcnkobm9kZUlzVHlwZWRBcnJheSkgOiBiYXNlSXNUeXBlZEFycmF5O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGlzVHlwZWRBcnJheTtcbiIsInZhciBiYXNlVGltZXMgPSByZXF1aXJlKCcuL19iYXNlVGltZXMnKSxcbiAgICBpc0FyZ3VtZW50cyA9IHJlcXVpcmUoJy4vaXNBcmd1bWVudHMnKSxcbiAgICBpc0FycmF5ID0gcmVxdWlyZSgnLi9pc0FycmF5JyksXG4gICAgaXNCdWZmZXIgPSByZXF1aXJlKCcuL2lzQnVmZmVyJyksXG4gICAgaXNJbmRleCA9IHJlcXVpcmUoJy4vX2lzSW5kZXgnKSxcbiAgICBpc1R5cGVkQXJyYXkgPSByZXF1aXJlKCcuL2lzVHlwZWRBcnJheScpO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gYXJyYXkgb2YgdGhlIGVudW1lcmFibGUgcHJvcGVydHkgbmFtZXMgb2YgdGhlIGFycmF5LWxpa2UgYHZhbHVlYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcXVlcnkuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGluaGVyaXRlZCBTcGVjaWZ5IHJldHVybmluZyBpbmhlcml0ZWQgcHJvcGVydHkgbmFtZXMuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzLlxuICovXG5mdW5jdGlvbiBhcnJheUxpa2VLZXlzKHZhbHVlLCBpbmhlcml0ZWQpIHtcbiAgdmFyIGlzQXJyID0gaXNBcnJheSh2YWx1ZSksXG4gICAgICBpc0FyZyA9ICFpc0FyciAmJiBpc0FyZ3VtZW50cyh2YWx1ZSksXG4gICAgICBpc0J1ZmYgPSAhaXNBcnIgJiYgIWlzQXJnICYmIGlzQnVmZmVyKHZhbHVlKSxcbiAgICAgIGlzVHlwZSA9ICFpc0FyciAmJiAhaXNBcmcgJiYgIWlzQnVmZiAmJiBpc1R5cGVkQXJyYXkodmFsdWUpLFxuICAgICAgc2tpcEluZGV4ZXMgPSBpc0FyciB8fCBpc0FyZyB8fCBpc0J1ZmYgfHwgaXNUeXBlLFxuICAgICAgcmVzdWx0ID0gc2tpcEluZGV4ZXMgPyBiYXNlVGltZXModmFsdWUubGVuZ3RoLCBTdHJpbmcpIDogW10sXG4gICAgICBsZW5ndGggPSByZXN1bHQubGVuZ3RoO1xuXG4gIGZvciAodmFyIGtleSBpbiB2YWx1ZSkge1xuICAgIGlmICgoaW5oZXJpdGVkIHx8IGhhc093blByb3BlcnR5LmNhbGwodmFsdWUsIGtleSkpICYmXG4gICAgICAgICEoc2tpcEluZGV4ZXMgJiYgKFxuICAgICAgICAgICAvLyBTYWZhcmkgOSBoYXMgZW51bWVyYWJsZSBgYXJndW1lbnRzLmxlbmd0aGAgaW4gc3RyaWN0IG1vZGUuXG4gICAgICAgICAgIGtleSA9PSAnbGVuZ3RoJyB8fFxuICAgICAgICAgICAvLyBOb2RlLmpzIDAuMTAgaGFzIGVudW1lcmFibGUgbm9uLWluZGV4IHByb3BlcnRpZXMgb24gYnVmZmVycy5cbiAgICAgICAgICAgKGlzQnVmZiAmJiAoa2V5ID09ICdvZmZzZXQnIHx8IGtleSA9PSAncGFyZW50JykpIHx8XG4gICAgICAgICAgIC8vIFBoYW50b21KUyAyIGhhcyBlbnVtZXJhYmxlIG5vbi1pbmRleCBwcm9wZXJ0aWVzIG9uIHR5cGVkIGFycmF5cy5cbiAgICAgICAgICAgKGlzVHlwZSAmJiAoa2V5ID09ICdidWZmZXInIHx8IGtleSA9PSAnYnl0ZUxlbmd0aCcgfHwga2V5ID09ICdieXRlT2Zmc2V0JykpIHx8XG4gICAgICAgICAgIC8vIFNraXAgaW5kZXggcHJvcGVydGllcy5cbiAgICAgICAgICAgaXNJbmRleChrZXksIGxlbmd0aClcbiAgICAgICAgKSkpIHtcbiAgICAgIHJlc3VsdC5wdXNoKGtleSk7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYXJyYXlMaWtlS2V5cztcbiIsIi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgbGlrZWx5IGEgcHJvdG90eXBlIG9iamVjdC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHByb3RvdHlwZSwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc1Byb3RvdHlwZSh2YWx1ZSkge1xuICB2YXIgQ3RvciA9IHZhbHVlICYmIHZhbHVlLmNvbnN0cnVjdG9yLFxuICAgICAgcHJvdG8gPSAodHlwZW9mIEN0b3IgPT0gJ2Z1bmN0aW9uJyAmJiBDdG9yLnByb3RvdHlwZSkgfHwgb2JqZWN0UHJvdG87XG5cbiAgcmV0dXJuIHZhbHVlID09PSBwcm90bztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc1Byb3RvdHlwZTtcbiIsIi8qKlxuICogQ3JlYXRlcyBhIHVuYXJ5IGZ1bmN0aW9uIHRoYXQgaW52b2tlcyBgZnVuY2Agd2l0aCBpdHMgYXJndW1lbnQgdHJhbnNmb3JtZWQuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIHdyYXAuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSB0cmFuc2Zvcm0gVGhlIGFyZ3VtZW50IHRyYW5zZm9ybS5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBvdmVyQXJnKGZ1bmMsIHRyYW5zZm9ybSkge1xuICByZXR1cm4gZnVuY3Rpb24oYXJnKSB7XG4gICAgcmV0dXJuIGZ1bmModHJhbnNmb3JtKGFyZykpO1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG92ZXJBcmc7XG4iLCJ2YXIgb3ZlckFyZyA9IHJlcXVpcmUoJy4vX292ZXJBcmcnKTtcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgZm9yIHRob3NlIHdpdGggdGhlIHNhbWUgbmFtZSBhcyBvdGhlciBgbG9kYXNoYCBtZXRob2RzLiAqL1xudmFyIG5hdGl2ZUtleXMgPSBvdmVyQXJnKE9iamVjdC5rZXlzLCBPYmplY3QpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5hdGl2ZUtleXM7XG4iLCJ2YXIgaXNQcm90b3R5cGUgPSByZXF1aXJlKCcuL19pc1Byb3RvdHlwZScpLFxuICAgIG5hdGl2ZUtleXMgPSByZXF1aXJlKCcuL19uYXRpdmVLZXlzJyk7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8ua2V5c2Agd2hpY2ggZG9lc24ndCB0cmVhdCBzcGFyc2UgYXJyYXlzIGFzIGRlbnNlLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzLlxuICovXG5mdW5jdGlvbiBiYXNlS2V5cyhvYmplY3QpIHtcbiAgaWYgKCFpc1Byb3RvdHlwZShvYmplY3QpKSB7XG4gICAgcmV0dXJuIG5hdGl2ZUtleXMob2JqZWN0KTtcbiAgfVxuICB2YXIgcmVzdWx0ID0gW107XG4gIGZvciAodmFyIGtleSBpbiBPYmplY3Qob2JqZWN0KSkge1xuICAgIGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwga2V5KSAmJiBrZXkgIT0gJ2NvbnN0cnVjdG9yJykge1xuICAgICAgcmVzdWx0LnB1c2goa2V5KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlS2V5cztcbiIsInZhciBpc0Z1bmN0aW9uID0gcmVxdWlyZSgnLi9pc0Z1bmN0aW9uJyksXG4gICAgaXNMZW5ndGggPSByZXF1aXJlKCcuL2lzTGVuZ3RoJyk7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYXJyYXktbGlrZS4gQSB2YWx1ZSBpcyBjb25zaWRlcmVkIGFycmF5LWxpa2UgaWYgaXQnc1xuICogbm90IGEgZnVuY3Rpb24gYW5kIGhhcyBhIGB2YWx1ZS5sZW5ndGhgIHRoYXQncyBhbiBpbnRlZ2VyIGdyZWF0ZXIgdGhhbiBvclxuICogZXF1YWwgdG8gYDBgIGFuZCBsZXNzIHRoYW4gb3IgZXF1YWwgdG8gYE51bWJlci5NQVhfU0FGRV9JTlRFR0VSYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhcnJheS1saWtlLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNBcnJheUxpa2UoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQXJyYXlMaWtlKGRvY3VtZW50LmJvZHkuY2hpbGRyZW4pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcnJheUxpa2UoJ2FiYycpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcnJheUxpa2UoXy5ub29wKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlMaWtlKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSAhPSBudWxsICYmIGlzTGVuZ3RoKHZhbHVlLmxlbmd0aCkgJiYgIWlzRnVuY3Rpb24odmFsdWUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzQXJyYXlMaWtlO1xuIiwidmFyIGFycmF5TGlrZUtleXMgPSByZXF1aXJlKCcuL19hcnJheUxpa2VLZXlzJyksXG4gICAgYmFzZUtleXMgPSByZXF1aXJlKCcuL19iYXNlS2V5cycpLFxuICAgIGlzQXJyYXlMaWtlID0gcmVxdWlyZSgnLi9pc0FycmF5TGlrZScpO1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gYXJyYXkgb2YgdGhlIG93biBlbnVtZXJhYmxlIHByb3BlcnR5IG5hbWVzIG9mIGBvYmplY3RgLlxuICpcbiAqICoqTm90ZToqKiBOb24tb2JqZWN0IHZhbHVlcyBhcmUgY29lcmNlZCB0byBvYmplY3RzLiBTZWUgdGhlXG4gKiBbRVMgc3BlY10oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtb2JqZWN0LmtleXMpXG4gKiBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBzaW5jZSAwLjEuMFxuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBPYmplY3RcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMuXG4gKiBAZXhhbXBsZVxuICpcbiAqIGZ1bmN0aW9uIEZvbygpIHtcbiAqICAgdGhpcy5hID0gMTtcbiAqICAgdGhpcy5iID0gMjtcbiAqIH1cbiAqXG4gKiBGb28ucHJvdG90eXBlLmMgPSAzO1xuICpcbiAqIF8ua2V5cyhuZXcgRm9vKTtcbiAqIC8vID0+IFsnYScsICdiJ10gKGl0ZXJhdGlvbiBvcmRlciBpcyBub3QgZ3VhcmFudGVlZClcbiAqXG4gKiBfLmtleXMoJ2hpJyk7XG4gKiAvLyA9PiBbJzAnLCAnMSddXG4gKi9cbmZ1bmN0aW9uIGtleXMob2JqZWN0KSB7XG4gIHJldHVybiBpc0FycmF5TGlrZShvYmplY3QpID8gYXJyYXlMaWtlS2V5cyhvYmplY3QpIDogYmFzZUtleXMob2JqZWN0KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBrZXlzO1xuIiwidmFyIGNvcHlPYmplY3QgPSByZXF1aXJlKCcuL19jb3B5T2JqZWN0JyksXG4gICAga2V5cyA9IHJlcXVpcmUoJy4va2V5cycpO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmFzc2lnbmAgd2l0aG91dCBzdXBwb3J0IGZvciBtdWx0aXBsZSBzb3VyY2VzXG4gKiBvciBgY3VzdG9taXplcmAgZnVuY3Rpb25zLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBkZXN0aW5hdGlvbiBvYmplY3QuXG4gKiBAcGFyYW0ge09iamVjdH0gc291cmNlIFRoZSBzb3VyY2Ugb2JqZWN0LlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBgb2JqZWN0YC5cbiAqL1xuZnVuY3Rpb24gYmFzZUFzc2lnbihvYmplY3QsIHNvdXJjZSkge1xuICByZXR1cm4gb2JqZWN0ICYmIGNvcHlPYmplY3Qoc291cmNlLCBrZXlzKHNvdXJjZSksIG9iamVjdCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUFzc2lnbjtcbiIsIi8qKlxuICogVGhpcyBmdW5jdGlvbiBpcyBsaWtlXG4gKiBbYE9iamVjdC5rZXlzYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtb2JqZWN0LmtleXMpXG4gKiBleGNlcHQgdGhhdCBpdCBpbmNsdWRlcyBpbmhlcml0ZWQgZW51bWVyYWJsZSBwcm9wZXJ0aWVzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzLlxuICovXG5mdW5jdGlvbiBuYXRpdmVLZXlzSW4ob2JqZWN0KSB7XG4gIHZhciByZXN1bHQgPSBbXTtcbiAgaWYgKG9iamVjdCAhPSBudWxsKSB7XG4gICAgZm9yICh2YXIga2V5IGluIE9iamVjdChvYmplY3QpKSB7XG4gICAgICByZXN1bHQucHVzaChrZXkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG5hdGl2ZUtleXNJbjtcbiIsInZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vaXNPYmplY3QnKSxcbiAgICBpc1Byb3RvdHlwZSA9IHJlcXVpcmUoJy4vX2lzUHJvdG90eXBlJyksXG4gICAgbmF0aXZlS2V5c0luID0gcmVxdWlyZSgnLi9fbmF0aXZlS2V5c0luJyk7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8ua2V5c0luYCB3aGljaCBkb2Vzbid0IHRyZWF0IHNwYXJzZSBhcnJheXMgYXMgZGVuc2UuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMuXG4gKi9cbmZ1bmN0aW9uIGJhc2VLZXlzSW4ob2JqZWN0KSB7XG4gIGlmICghaXNPYmplY3Qob2JqZWN0KSkge1xuICAgIHJldHVybiBuYXRpdmVLZXlzSW4ob2JqZWN0KTtcbiAgfVxuICB2YXIgaXNQcm90byA9IGlzUHJvdG90eXBlKG9iamVjdCksXG4gICAgICByZXN1bHQgPSBbXTtcblxuICBmb3IgKHZhciBrZXkgaW4gb2JqZWN0KSB7XG4gICAgaWYgKCEoa2V5ID09ICdjb25zdHJ1Y3RvcicgJiYgKGlzUHJvdG8gfHwgIWhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBrZXkpKSkpIHtcbiAgICAgIHJlc3VsdC5wdXNoKGtleSk7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUtleXNJbjtcbiIsInZhciBhcnJheUxpa2VLZXlzID0gcmVxdWlyZSgnLi9fYXJyYXlMaWtlS2V5cycpLFxuICAgIGJhc2VLZXlzSW4gPSByZXF1aXJlKCcuL19iYXNlS2V5c0luJyksXG4gICAgaXNBcnJheUxpa2UgPSByZXF1aXJlKCcuL2lzQXJyYXlMaWtlJyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhcnJheSBvZiB0aGUgb3duIGFuZCBpbmhlcml0ZWQgZW51bWVyYWJsZSBwcm9wZXJ0eSBuYW1lcyBvZiBgb2JqZWN0YC5cbiAqXG4gKiAqKk5vdGU6KiogTm9uLW9iamVjdCB2YWx1ZXMgYXJlIGNvZXJjZWQgdG8gb2JqZWN0cy5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDMuMC4wXG4gKiBAY2F0ZWdvcnkgT2JqZWN0XG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzLlxuICogQGV4YW1wbGVcbiAqXG4gKiBmdW5jdGlvbiBGb28oKSB7XG4gKiAgIHRoaXMuYSA9IDE7XG4gKiAgIHRoaXMuYiA9IDI7XG4gKiB9XG4gKlxuICogRm9vLnByb3RvdHlwZS5jID0gMztcbiAqXG4gKiBfLmtleXNJbihuZXcgRm9vKTtcbiAqIC8vID0+IFsnYScsICdiJywgJ2MnXSAoaXRlcmF0aW9uIG9yZGVyIGlzIG5vdCBndWFyYW50ZWVkKVxuICovXG5mdW5jdGlvbiBrZXlzSW4ob2JqZWN0KSB7XG4gIHJldHVybiBpc0FycmF5TGlrZShvYmplY3QpID8gYXJyYXlMaWtlS2V5cyhvYmplY3QsIHRydWUpIDogYmFzZUtleXNJbihvYmplY3QpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGtleXNJbjtcbiIsInZhciBjb3B5T2JqZWN0ID0gcmVxdWlyZSgnLi9fY29weU9iamVjdCcpLFxuICAgIGtleXNJbiA9IHJlcXVpcmUoJy4va2V5c0luJyk7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uYXNzaWduSW5gIHdpdGhvdXQgc3VwcG9ydCBmb3IgbXVsdGlwbGUgc291cmNlc1xuICogb3IgYGN1c3RvbWl6ZXJgIGZ1bmN0aW9ucy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgZGVzdGluYXRpb24gb2JqZWN0LlxuICogQHBhcmFtIHtPYmplY3R9IHNvdXJjZSBUaGUgc291cmNlIG9iamVjdC5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgYG9iamVjdGAuXG4gKi9cbmZ1bmN0aW9uIGJhc2VBc3NpZ25JbihvYmplY3QsIHNvdXJjZSkge1xuICByZXR1cm4gb2JqZWN0ICYmIGNvcHlPYmplY3Qoc291cmNlLCBrZXlzSW4oc291cmNlKSwgb2JqZWN0KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlQXNzaWduSW47XG4iLCJ2YXIgcm9vdCA9IHJlcXVpcmUoJy4vX3Jvb3QnKTtcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBleHBvcnRzYC4gKi9cbnZhciBmcmVlRXhwb3J0cyA9IHR5cGVvZiBleHBvcnRzID09ICdvYmplY3QnICYmIGV4cG9ydHMgJiYgIWV4cG9ydHMubm9kZVR5cGUgJiYgZXhwb3J0cztcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBtb2R1bGVgLiAqL1xudmFyIGZyZWVNb2R1bGUgPSBmcmVlRXhwb3J0cyAmJiB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZSAmJiAhbW9kdWxlLm5vZGVUeXBlICYmIG1vZHVsZTtcblxuLyoqIERldGVjdCB0aGUgcG9wdWxhciBDb21tb25KUyBleHRlbnNpb24gYG1vZHVsZS5leHBvcnRzYC4gKi9cbnZhciBtb2R1bGVFeHBvcnRzID0gZnJlZU1vZHVsZSAmJiBmcmVlTW9kdWxlLmV4cG9ydHMgPT09IGZyZWVFeHBvcnRzO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBCdWZmZXIgPSBtb2R1bGVFeHBvcnRzID8gcm9vdC5CdWZmZXIgOiB1bmRlZmluZWQsXG4gICAgYWxsb2NVbnNhZmUgPSBCdWZmZXIgPyBCdWZmZXIuYWxsb2NVbnNhZmUgOiB1bmRlZmluZWQ7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGNsb25lIG9mICBgYnVmZmVyYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtCdWZmZXJ9IGJ1ZmZlciBUaGUgYnVmZmVyIHRvIGNsb25lLlxuICogQHBhcmFtIHtib29sZWFufSBbaXNEZWVwXSBTcGVjaWZ5IGEgZGVlcCBjbG9uZS5cbiAqIEByZXR1cm5zIHtCdWZmZXJ9IFJldHVybnMgdGhlIGNsb25lZCBidWZmZXIuXG4gKi9cbmZ1bmN0aW9uIGNsb25lQnVmZmVyKGJ1ZmZlciwgaXNEZWVwKSB7XG4gIGlmIChpc0RlZXApIHtcbiAgICByZXR1cm4gYnVmZmVyLnNsaWNlKCk7XG4gIH1cbiAgdmFyIGxlbmd0aCA9IGJ1ZmZlci5sZW5ndGgsXG4gICAgICByZXN1bHQgPSBhbGxvY1Vuc2FmZSA/IGFsbG9jVW5zYWZlKGxlbmd0aCkgOiBuZXcgYnVmZmVyLmNvbnN0cnVjdG9yKGxlbmd0aCk7XG5cbiAgYnVmZmVyLmNvcHkocmVzdWx0KTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjbG9uZUJ1ZmZlcjtcbiIsIi8qKlxuICogQ29waWVzIHRoZSB2YWx1ZXMgb2YgYHNvdXJjZWAgdG8gYGFycmF5YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheX0gc291cmNlIFRoZSBhcnJheSB0byBjb3B5IHZhbHVlcyBmcm9tLlxuICogQHBhcmFtIHtBcnJheX0gW2FycmF5PVtdXSBUaGUgYXJyYXkgdG8gY29weSB2YWx1ZXMgdG8uXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgYGFycmF5YC5cbiAqL1xuZnVuY3Rpb24gY29weUFycmF5KHNvdXJjZSwgYXJyYXkpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBzb3VyY2UubGVuZ3RoO1xuXG4gIGFycmF5IHx8IChhcnJheSA9IEFycmF5KGxlbmd0aCkpO1xuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIGFycmF5W2luZGV4XSA9IHNvdXJjZVtpbmRleF07XG4gIH1cbiAgcmV0dXJuIGFycmF5O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNvcHlBcnJheTtcbiIsIi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBfLmZpbHRlcmAgZm9yIGFycmF5cyB3aXRob3V0IHN1cHBvcnQgZm9yXG4gKiBpdGVyYXRlZSBzaG9ydGhhbmRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fSBbYXJyYXldIFRoZSBhcnJheSB0byBpdGVyYXRlIG92ZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBwcmVkaWNhdGUgVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgbmV3IGZpbHRlcmVkIGFycmF5LlxuICovXG5mdW5jdGlvbiBhcnJheUZpbHRlcihhcnJheSwgcHJlZGljYXRlKSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gYXJyYXkgPT0gbnVsbCA/IDAgOiBhcnJheS5sZW5ndGgsXG4gICAgICByZXNJbmRleCA9IDAsXG4gICAgICByZXN1bHQgPSBbXTtcblxuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIHZhciB2YWx1ZSA9IGFycmF5W2luZGV4XTtcbiAgICBpZiAocHJlZGljYXRlKHZhbHVlLCBpbmRleCwgYXJyYXkpKSB7XG4gICAgICByZXN1bHRbcmVzSW5kZXgrK10gPSB2YWx1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBhcnJheUZpbHRlcjtcbiIsIi8qKlxuICogVGhpcyBtZXRob2QgcmV0dXJucyBhIG5ldyBlbXB0eSBhcnJheS5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMTMuMFxuICogQGNhdGVnb3J5IFV0aWxcbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgbmV3IGVtcHR5IGFycmF5LlxuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgYXJyYXlzID0gXy50aW1lcygyLCBfLnN0dWJBcnJheSk7XG4gKlxuICogY29uc29sZS5sb2coYXJyYXlzKTtcbiAqIC8vID0+IFtbXSwgW11dXG4gKlxuICogY29uc29sZS5sb2coYXJyYXlzWzBdID09PSBhcnJheXNbMV0pO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gc3R1YkFycmF5KCkge1xuICByZXR1cm4gW107XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc3R1YkFycmF5O1xuIiwidmFyIGFycmF5RmlsdGVyID0gcmVxdWlyZSgnLi9fYXJyYXlGaWx0ZXInKSxcbiAgICBzdHViQXJyYXkgPSByZXF1aXJlKCcuL3N0dWJBcnJheScpO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBwcm9wZXJ0eUlzRW51bWVyYWJsZSA9IG9iamVjdFByb3RvLnByb3BlcnR5SXNFbnVtZXJhYmxlO1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyBmb3IgdGhvc2Ugd2l0aCB0aGUgc2FtZSBuYW1lIGFzIG90aGVyIGBsb2Rhc2hgIG1ldGhvZHMuICovXG52YXIgbmF0aXZlR2V0U3ltYm9scyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHM7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhcnJheSBvZiB0aGUgb3duIGVudW1lcmFibGUgc3ltYm9scyBvZiBgb2JqZWN0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBzeW1ib2xzLlxuICovXG52YXIgZ2V0U3ltYm9scyA9ICFuYXRpdmVHZXRTeW1ib2xzID8gc3R1YkFycmF5IDogZnVuY3Rpb24ob2JqZWN0KSB7XG4gIGlmIChvYmplY3QgPT0gbnVsbCkge1xuICAgIHJldHVybiBbXTtcbiAgfVxuICBvYmplY3QgPSBPYmplY3Qob2JqZWN0KTtcbiAgcmV0dXJuIGFycmF5RmlsdGVyKG5hdGl2ZUdldFN5bWJvbHMob2JqZWN0KSwgZnVuY3Rpb24oc3ltYm9sKSB7XG4gICAgcmV0dXJuIHByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwob2JqZWN0LCBzeW1ib2wpO1xuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0U3ltYm9scztcbiIsInZhciBjb3B5T2JqZWN0ID0gcmVxdWlyZSgnLi9fY29weU9iamVjdCcpLFxuICAgIGdldFN5bWJvbHMgPSByZXF1aXJlKCcuL19nZXRTeW1ib2xzJyk7XG5cbi8qKlxuICogQ29waWVzIG93biBzeW1ib2xzIG9mIGBzb3VyY2VgIHRvIGBvYmplY3RgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gc291cmNlIFRoZSBvYmplY3QgdG8gY29weSBzeW1ib2xzIGZyb20uXG4gKiBAcGFyYW0ge09iamVjdH0gW29iamVjdD17fV0gVGhlIG9iamVjdCB0byBjb3B5IHN5bWJvbHMgdG8uXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGBvYmplY3RgLlxuICovXG5mdW5jdGlvbiBjb3B5U3ltYm9scyhzb3VyY2UsIG9iamVjdCkge1xuICByZXR1cm4gY29weU9iamVjdChzb3VyY2UsIGdldFN5bWJvbHMoc291cmNlKSwgb2JqZWN0KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjb3B5U3ltYm9scztcbiIsIi8qKlxuICogQXBwZW5kcyB0aGUgZWxlbWVudHMgb2YgYHZhbHVlc2AgdG8gYGFycmF5YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIG1vZGlmeS5cbiAqIEBwYXJhbSB7QXJyYXl9IHZhbHVlcyBUaGUgdmFsdWVzIHRvIGFwcGVuZC5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyBgYXJyYXlgLlxuICovXG5mdW5jdGlvbiBhcnJheVB1c2goYXJyYXksIHZhbHVlcykge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IHZhbHVlcy5sZW5ndGgsXG4gICAgICBvZmZzZXQgPSBhcnJheS5sZW5ndGg7XG5cbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICBhcnJheVtvZmZzZXQgKyBpbmRleF0gPSB2YWx1ZXNbaW5kZXhdO1xuICB9XG4gIHJldHVybiBhcnJheTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBhcnJheVB1c2g7XG4iLCJ2YXIgb3ZlckFyZyA9IHJlcXVpcmUoJy4vX292ZXJBcmcnKTtcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgZ2V0UHJvdG90eXBlID0gb3ZlckFyZyhPYmplY3QuZ2V0UHJvdG90eXBlT2YsIE9iamVjdCk7XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0UHJvdG90eXBlO1xuIiwidmFyIGFycmF5UHVzaCA9IHJlcXVpcmUoJy4vX2FycmF5UHVzaCcpLFxuICAgIGdldFByb3RvdHlwZSA9IHJlcXVpcmUoJy4vX2dldFByb3RvdHlwZScpLFxuICAgIGdldFN5bWJvbHMgPSByZXF1aXJlKCcuL19nZXRTeW1ib2xzJyksXG4gICAgc3R1YkFycmF5ID0gcmVxdWlyZSgnLi9zdHViQXJyYXknKTtcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgZm9yIHRob3NlIHdpdGggdGhlIHNhbWUgbmFtZSBhcyBvdGhlciBgbG9kYXNoYCBtZXRob2RzLiAqL1xudmFyIG5hdGl2ZUdldFN5bWJvbHMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzO1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gYXJyYXkgb2YgdGhlIG93biBhbmQgaW5oZXJpdGVkIGVudW1lcmFibGUgc3ltYm9scyBvZiBgb2JqZWN0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBzeW1ib2xzLlxuICovXG52YXIgZ2V0U3ltYm9sc0luID0gIW5hdGl2ZUdldFN5bWJvbHMgPyBzdHViQXJyYXkgOiBmdW5jdGlvbihvYmplY3QpIHtcbiAgdmFyIHJlc3VsdCA9IFtdO1xuICB3aGlsZSAob2JqZWN0KSB7XG4gICAgYXJyYXlQdXNoKHJlc3VsdCwgZ2V0U3ltYm9scyhvYmplY3QpKTtcbiAgICBvYmplY3QgPSBnZXRQcm90b3R5cGUob2JqZWN0KTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBnZXRTeW1ib2xzSW47XG4iLCJ2YXIgY29weU9iamVjdCA9IHJlcXVpcmUoJy4vX2NvcHlPYmplY3QnKSxcbiAgICBnZXRTeW1ib2xzSW4gPSByZXF1aXJlKCcuL19nZXRTeW1ib2xzSW4nKTtcblxuLyoqXG4gKiBDb3BpZXMgb3duIGFuZCBpbmhlcml0ZWQgc3ltYm9scyBvZiBgc291cmNlYCB0byBgb2JqZWN0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IHNvdXJjZSBUaGUgb2JqZWN0IHRvIGNvcHkgc3ltYm9scyBmcm9tLlxuICogQHBhcmFtIHtPYmplY3R9IFtvYmplY3Q9e31dIFRoZSBvYmplY3QgdG8gY29weSBzeW1ib2xzIHRvLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBgb2JqZWN0YC5cbiAqL1xuZnVuY3Rpb24gY29weVN5bWJvbHNJbihzb3VyY2UsIG9iamVjdCkge1xuICByZXR1cm4gY29weU9iamVjdChzb3VyY2UsIGdldFN5bWJvbHNJbihzb3VyY2UpLCBvYmplY3QpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNvcHlTeW1ib2xzSW47XG4iLCJ2YXIgYXJyYXlQdXNoID0gcmVxdWlyZSgnLi9fYXJyYXlQdXNoJyksXG4gICAgaXNBcnJheSA9IHJlcXVpcmUoJy4vaXNBcnJheScpO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBnZXRBbGxLZXlzYCBhbmQgYGdldEFsbEtleXNJbmAgd2hpY2ggdXNlc1xuICogYGtleXNGdW5jYCBhbmQgYHN5bWJvbHNGdW5jYCB0byBnZXQgdGhlIGVudW1lcmFibGUgcHJvcGVydHkgbmFtZXMgYW5kXG4gKiBzeW1ib2xzIG9mIGBvYmplY3RgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBrZXlzRnVuYyBUaGUgZnVuY3Rpb24gdG8gZ2V0IHRoZSBrZXlzIG9mIGBvYmplY3RgLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gc3ltYm9sc0Z1bmMgVGhlIGZ1bmN0aW9uIHRvIGdldCB0aGUgc3ltYm9scyBvZiBgb2JqZWN0YC5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMgYW5kIHN5bWJvbHMuXG4gKi9cbmZ1bmN0aW9uIGJhc2VHZXRBbGxLZXlzKG9iamVjdCwga2V5c0Z1bmMsIHN5bWJvbHNGdW5jKSB7XG4gIHZhciByZXN1bHQgPSBrZXlzRnVuYyhvYmplY3QpO1xuICByZXR1cm4gaXNBcnJheShvYmplY3QpID8gcmVzdWx0IDogYXJyYXlQdXNoKHJlc3VsdCwgc3ltYm9sc0Z1bmMob2JqZWN0KSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUdldEFsbEtleXM7XG4iLCJ2YXIgYmFzZUdldEFsbEtleXMgPSByZXF1aXJlKCcuL19iYXNlR2V0QWxsS2V5cycpLFxuICAgIGdldFN5bWJvbHMgPSByZXF1aXJlKCcuL19nZXRTeW1ib2xzJyksXG4gICAga2V5cyA9IHJlcXVpcmUoJy4va2V5cycpO1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gYXJyYXkgb2Ygb3duIGVudW1lcmFibGUgcHJvcGVydHkgbmFtZXMgYW5kIHN5bWJvbHMgb2YgYG9iamVjdGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMgYW5kIHN5bWJvbHMuXG4gKi9cbmZ1bmN0aW9uIGdldEFsbEtleXMob2JqZWN0KSB7XG4gIHJldHVybiBiYXNlR2V0QWxsS2V5cyhvYmplY3QsIGtleXMsIGdldFN5bWJvbHMpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldEFsbEtleXM7XG4iLCJ2YXIgYmFzZUdldEFsbEtleXMgPSByZXF1aXJlKCcuL19iYXNlR2V0QWxsS2V5cycpLFxuICAgIGdldFN5bWJvbHNJbiA9IHJlcXVpcmUoJy4vX2dldFN5bWJvbHNJbicpLFxuICAgIGtleXNJbiA9IHJlcXVpcmUoJy4va2V5c0luJyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhcnJheSBvZiBvd24gYW5kIGluaGVyaXRlZCBlbnVtZXJhYmxlIHByb3BlcnR5IG5hbWVzIGFuZFxuICogc3ltYm9scyBvZiBgb2JqZWN0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcyBhbmQgc3ltYm9scy5cbiAqL1xuZnVuY3Rpb24gZ2V0QWxsS2V5c0luKG9iamVjdCkge1xuICByZXR1cm4gYmFzZUdldEFsbEtleXMob2JqZWN0LCBrZXlzSW4sIGdldFN5bWJvbHNJbik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0QWxsS2V5c0luO1xuIiwidmFyIGdldE5hdGl2ZSA9IHJlcXVpcmUoJy4vX2dldE5hdGl2ZScpLFxuICAgIHJvb3QgPSByZXF1aXJlKCcuL19yb290Jyk7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIHRoYXQgYXJlIHZlcmlmaWVkIHRvIGJlIG5hdGl2ZS4gKi9cbnZhciBEYXRhVmlldyA9IGdldE5hdGl2ZShyb290LCAnRGF0YVZpZXcnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBEYXRhVmlldztcbiIsInZhciBnZXROYXRpdmUgPSByZXF1aXJlKCcuL19nZXROYXRpdmUnKSxcbiAgICByb290ID0gcmVxdWlyZSgnLi9fcm9vdCcpO1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyB0aGF0IGFyZSB2ZXJpZmllZCB0byBiZSBuYXRpdmUuICovXG52YXIgUHJvbWlzZSA9IGdldE5hdGl2ZShyb290LCAnUHJvbWlzZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFByb21pc2U7XG4iLCJ2YXIgZ2V0TmF0aXZlID0gcmVxdWlyZSgnLi9fZ2V0TmF0aXZlJyksXG4gICAgcm9vdCA9IHJlcXVpcmUoJy4vX3Jvb3QnKTtcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgdGhhdCBhcmUgdmVyaWZpZWQgdG8gYmUgbmF0aXZlLiAqL1xudmFyIFNldCA9IGdldE5hdGl2ZShyb290LCAnU2V0Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gU2V0O1xuIiwidmFyIGdldE5hdGl2ZSA9IHJlcXVpcmUoJy4vX2dldE5hdGl2ZScpLFxuICAgIHJvb3QgPSByZXF1aXJlKCcuL19yb290Jyk7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIHRoYXQgYXJlIHZlcmlmaWVkIHRvIGJlIG5hdGl2ZS4gKi9cbnZhciBXZWFrTWFwID0gZ2V0TmF0aXZlKHJvb3QsICdXZWFrTWFwJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gV2Vha01hcDtcbiIsInZhciBEYXRhVmlldyA9IHJlcXVpcmUoJy4vX0RhdGFWaWV3JyksXG4gICAgTWFwID0gcmVxdWlyZSgnLi9fTWFwJyksXG4gICAgUHJvbWlzZSA9IHJlcXVpcmUoJy4vX1Byb21pc2UnKSxcbiAgICBTZXQgPSByZXF1aXJlKCcuL19TZXQnKSxcbiAgICBXZWFrTWFwID0gcmVxdWlyZSgnLi9fV2Vha01hcCcpLFxuICAgIGJhc2VHZXRUYWcgPSByZXF1aXJlKCcuL19iYXNlR2V0VGFnJyksXG4gICAgdG9Tb3VyY2UgPSByZXF1aXJlKCcuL190b1NvdXJjZScpO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgbWFwVGFnID0gJ1tvYmplY3QgTWFwXScsXG4gICAgb2JqZWN0VGFnID0gJ1tvYmplY3QgT2JqZWN0XScsXG4gICAgcHJvbWlzZVRhZyA9ICdbb2JqZWN0IFByb21pc2VdJyxcbiAgICBzZXRUYWcgPSAnW29iamVjdCBTZXRdJyxcbiAgICB3ZWFrTWFwVGFnID0gJ1tvYmplY3QgV2Vha01hcF0nO1xuXG52YXIgZGF0YVZpZXdUYWcgPSAnW29iamVjdCBEYXRhVmlld10nO1xuXG4vKiogVXNlZCB0byBkZXRlY3QgbWFwcywgc2V0cywgYW5kIHdlYWttYXBzLiAqL1xudmFyIGRhdGFWaWV3Q3RvclN0cmluZyA9IHRvU291cmNlKERhdGFWaWV3KSxcbiAgICBtYXBDdG9yU3RyaW5nID0gdG9Tb3VyY2UoTWFwKSxcbiAgICBwcm9taXNlQ3RvclN0cmluZyA9IHRvU291cmNlKFByb21pc2UpLFxuICAgIHNldEN0b3JTdHJpbmcgPSB0b1NvdXJjZShTZXQpLFxuICAgIHdlYWtNYXBDdG9yU3RyaW5nID0gdG9Tb3VyY2UoV2Vha01hcCk7XG5cbi8qKlxuICogR2V0cyB0aGUgYHRvU3RyaW5nVGFnYCBvZiBgdmFsdWVgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIGB0b1N0cmluZ1RhZ2AuXG4gKi9cbnZhciBnZXRUYWcgPSBiYXNlR2V0VGFnO1xuXG4vLyBGYWxsYmFjayBmb3IgZGF0YSB2aWV3cywgbWFwcywgc2V0cywgYW5kIHdlYWsgbWFwcyBpbiBJRSAxMSBhbmQgcHJvbWlzZXMgaW4gTm9kZS5qcyA8IDYuXG5pZiAoKERhdGFWaWV3ICYmIGdldFRhZyhuZXcgRGF0YVZpZXcobmV3IEFycmF5QnVmZmVyKDEpKSkgIT0gZGF0YVZpZXdUYWcpIHx8XG4gICAgKE1hcCAmJiBnZXRUYWcobmV3IE1hcCkgIT0gbWFwVGFnKSB8fFxuICAgIChQcm9taXNlICYmIGdldFRhZyhQcm9taXNlLnJlc29sdmUoKSkgIT0gcHJvbWlzZVRhZykgfHxcbiAgICAoU2V0ICYmIGdldFRhZyhuZXcgU2V0KSAhPSBzZXRUYWcpIHx8XG4gICAgKFdlYWtNYXAgJiYgZ2V0VGFnKG5ldyBXZWFrTWFwKSAhPSB3ZWFrTWFwVGFnKSkge1xuICBnZXRUYWcgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHZhciByZXN1bHQgPSBiYXNlR2V0VGFnKHZhbHVlKSxcbiAgICAgICAgQ3RvciA9IHJlc3VsdCA9PSBvYmplY3RUYWcgPyB2YWx1ZS5jb25zdHJ1Y3RvciA6IHVuZGVmaW5lZCxcbiAgICAgICAgY3RvclN0cmluZyA9IEN0b3IgPyB0b1NvdXJjZShDdG9yKSA6ICcnO1xuXG4gICAgaWYgKGN0b3JTdHJpbmcpIHtcbiAgICAgIHN3aXRjaCAoY3RvclN0cmluZykge1xuICAgICAgICBjYXNlIGRhdGFWaWV3Q3RvclN0cmluZzogcmV0dXJuIGRhdGFWaWV3VGFnO1xuICAgICAgICBjYXNlIG1hcEN0b3JTdHJpbmc6IHJldHVybiBtYXBUYWc7XG4gICAgICAgIGNhc2UgcHJvbWlzZUN0b3JTdHJpbmc6IHJldHVybiBwcm9taXNlVGFnO1xuICAgICAgICBjYXNlIHNldEN0b3JTdHJpbmc6IHJldHVybiBzZXRUYWc7XG4gICAgICAgIGNhc2Ugd2Vha01hcEN0b3JTdHJpbmc6IHJldHVybiB3ZWFrTWFwVGFnO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldFRhZztcbiIsIi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogSW5pdGlhbGl6ZXMgYW4gYXJyYXkgY2xvbmUuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBjbG9uZS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgaW5pdGlhbGl6ZWQgY2xvbmUuXG4gKi9cbmZ1bmN0aW9uIGluaXRDbG9uZUFycmF5KGFycmF5KSB7XG4gIHZhciBsZW5ndGggPSBhcnJheS5sZW5ndGgsXG4gICAgICByZXN1bHQgPSBhcnJheS5jb25zdHJ1Y3RvcihsZW5ndGgpO1xuXG4gIC8vIEFkZCBwcm9wZXJ0aWVzIGFzc2lnbmVkIGJ5IGBSZWdFeHAjZXhlY2AuXG4gIGlmIChsZW5ndGggJiYgdHlwZW9mIGFycmF5WzBdID09ICdzdHJpbmcnICYmIGhhc093blByb3BlcnR5LmNhbGwoYXJyYXksICdpbmRleCcpKSB7XG4gICAgcmVzdWx0LmluZGV4ID0gYXJyYXkuaW5kZXg7XG4gICAgcmVzdWx0LmlucHV0ID0gYXJyYXkuaW5wdXQ7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpbml0Q2xvbmVBcnJheTtcbiIsInZhciByb290ID0gcmVxdWlyZSgnLi9fcm9vdCcpO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBVaW50OEFycmF5ID0gcm9vdC5VaW50OEFycmF5O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFVpbnQ4QXJyYXk7XG4iLCJ2YXIgVWludDhBcnJheSA9IHJlcXVpcmUoJy4vX1VpbnQ4QXJyYXknKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgY2xvbmUgb2YgYGFycmF5QnVmZmVyYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheUJ1ZmZlcn0gYXJyYXlCdWZmZXIgVGhlIGFycmF5IGJ1ZmZlciB0byBjbG9uZS5cbiAqIEByZXR1cm5zIHtBcnJheUJ1ZmZlcn0gUmV0dXJucyB0aGUgY2xvbmVkIGFycmF5IGJ1ZmZlci5cbiAqL1xuZnVuY3Rpb24gY2xvbmVBcnJheUJ1ZmZlcihhcnJheUJ1ZmZlcikge1xuICB2YXIgcmVzdWx0ID0gbmV3IGFycmF5QnVmZmVyLmNvbnN0cnVjdG9yKGFycmF5QnVmZmVyLmJ5dGVMZW5ndGgpO1xuICBuZXcgVWludDhBcnJheShyZXN1bHQpLnNldChuZXcgVWludDhBcnJheShhcnJheUJ1ZmZlcikpO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsb25lQXJyYXlCdWZmZXI7XG4iLCJ2YXIgY2xvbmVBcnJheUJ1ZmZlciA9IHJlcXVpcmUoJy4vX2Nsb25lQXJyYXlCdWZmZXInKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgY2xvbmUgb2YgYGRhdGFWaWV3YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IGRhdGFWaWV3IFRoZSBkYXRhIHZpZXcgdG8gY2xvbmUuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtpc0RlZXBdIFNwZWNpZnkgYSBkZWVwIGNsb25lLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgY2xvbmVkIGRhdGEgdmlldy5cbiAqL1xuZnVuY3Rpb24gY2xvbmVEYXRhVmlldyhkYXRhVmlldywgaXNEZWVwKSB7XG4gIHZhciBidWZmZXIgPSBpc0RlZXAgPyBjbG9uZUFycmF5QnVmZmVyKGRhdGFWaWV3LmJ1ZmZlcikgOiBkYXRhVmlldy5idWZmZXI7XG4gIHJldHVybiBuZXcgZGF0YVZpZXcuY29uc3RydWN0b3IoYnVmZmVyLCBkYXRhVmlldy5ieXRlT2Zmc2V0LCBkYXRhVmlldy5ieXRlTGVuZ3RoKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjbG9uZURhdGFWaWV3O1xuIiwiLyoqXG4gKiBBZGRzIHRoZSBrZXktdmFsdWUgYHBhaXJgIHRvIGBtYXBgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gbWFwIFRoZSBtYXAgdG8gbW9kaWZ5LlxuICogQHBhcmFtIHtBcnJheX0gcGFpciBUaGUga2V5LXZhbHVlIHBhaXIgdG8gYWRkLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBgbWFwYC5cbiAqL1xuZnVuY3Rpb24gYWRkTWFwRW50cnkobWFwLCBwYWlyKSB7XG4gIC8vIERvbid0IHJldHVybiBgbWFwLnNldGAgYmVjYXVzZSBpdCdzIG5vdCBjaGFpbmFibGUgaW4gSUUgMTEuXG4gIG1hcC5zZXQocGFpclswXSwgcGFpclsxXSk7XG4gIHJldHVybiBtYXA7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYWRkTWFwRW50cnk7XG4iLCIvKipcbiAqIEEgc3BlY2lhbGl6ZWQgdmVyc2lvbiBvZiBgXy5yZWR1Y2VgIGZvciBhcnJheXMgd2l0aG91dCBzdXBwb3J0IGZvclxuICogaXRlcmF0ZWUgc2hvcnRoYW5kcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheX0gW2FycmF5XSBUaGUgYXJyYXkgdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0ZWUgVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEBwYXJhbSB7Kn0gW2FjY3VtdWxhdG9yXSBUaGUgaW5pdGlhbCB2YWx1ZS5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2luaXRBY2N1bV0gU3BlY2lmeSB1c2luZyB0aGUgZmlyc3QgZWxlbWVudCBvZiBgYXJyYXlgIGFzXG4gKiAgdGhlIGluaXRpYWwgdmFsdWUuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgYWNjdW11bGF0ZWQgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIGFycmF5UmVkdWNlKGFycmF5LCBpdGVyYXRlZSwgYWNjdW11bGF0b3IsIGluaXRBY2N1bSkge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IGFycmF5ID09IG51bGwgPyAwIDogYXJyYXkubGVuZ3RoO1xuXG4gIGlmIChpbml0QWNjdW0gJiYgbGVuZ3RoKSB7XG4gICAgYWNjdW11bGF0b3IgPSBhcnJheVsrK2luZGV4XTtcbiAgfVxuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIGFjY3VtdWxhdG9yID0gaXRlcmF0ZWUoYWNjdW11bGF0b3IsIGFycmF5W2luZGV4XSwgaW5kZXgsIGFycmF5KTtcbiAgfVxuICByZXR1cm4gYWNjdW11bGF0b3I7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYXJyYXlSZWR1Y2U7XG4iLCIvKipcbiAqIENvbnZlcnRzIGBtYXBgIHRvIGl0cyBrZXktdmFsdWUgcGFpcnMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBtYXAgVGhlIG1hcCB0byBjb252ZXJ0LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBrZXktdmFsdWUgcGFpcnMuXG4gKi9cbmZ1bmN0aW9uIG1hcFRvQXJyYXkobWFwKSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgcmVzdWx0ID0gQXJyYXkobWFwLnNpemUpO1xuXG4gIG1hcC5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICByZXN1bHRbKytpbmRleF0gPSBba2V5LCB2YWx1ZV07XG4gIH0pO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG1hcFRvQXJyYXk7XG4iLCJ2YXIgYWRkTWFwRW50cnkgPSByZXF1aXJlKCcuL19hZGRNYXBFbnRyeScpLFxuICAgIGFycmF5UmVkdWNlID0gcmVxdWlyZSgnLi9fYXJyYXlSZWR1Y2UnKSxcbiAgICBtYXBUb0FycmF5ID0gcmVxdWlyZSgnLi9fbWFwVG9BcnJheScpO1xuXG4vKiogVXNlZCB0byBjb21wb3NlIGJpdG1hc2tzIGZvciBjbG9uaW5nLiAqL1xudmFyIENMT05FX0RFRVBfRkxBRyA9IDE7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGNsb25lIG9mIGBtYXBgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gbWFwIFRoZSBtYXAgdG8gY2xvbmUuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjbG9uZUZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGNsb25lIHZhbHVlcy5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzRGVlcF0gU3BlY2lmeSBhIGRlZXAgY2xvbmUuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBjbG9uZWQgbWFwLlxuICovXG5mdW5jdGlvbiBjbG9uZU1hcChtYXAsIGlzRGVlcCwgY2xvbmVGdW5jKSB7XG4gIHZhciBhcnJheSA9IGlzRGVlcCA/IGNsb25lRnVuYyhtYXBUb0FycmF5KG1hcCksIENMT05FX0RFRVBfRkxBRykgOiBtYXBUb0FycmF5KG1hcCk7XG4gIHJldHVybiBhcnJheVJlZHVjZShhcnJheSwgYWRkTWFwRW50cnksIG5ldyBtYXAuY29uc3RydWN0b3IpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsb25lTWFwO1xuIiwiLyoqIFVzZWQgdG8gbWF0Y2ggYFJlZ0V4cGAgZmxhZ3MgZnJvbSB0aGVpciBjb2VyY2VkIHN0cmluZyB2YWx1ZXMuICovXG52YXIgcmVGbGFncyA9IC9cXHcqJC87XG5cbi8qKlxuICogQ3JlYXRlcyBhIGNsb25lIG9mIGByZWdleHBgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gcmVnZXhwIFRoZSByZWdleHAgdG8gY2xvbmUuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBjbG9uZWQgcmVnZXhwLlxuICovXG5mdW5jdGlvbiBjbG9uZVJlZ0V4cChyZWdleHApIHtcbiAgdmFyIHJlc3VsdCA9IG5ldyByZWdleHAuY29uc3RydWN0b3IocmVnZXhwLnNvdXJjZSwgcmVGbGFncy5leGVjKHJlZ2V4cCkpO1xuICByZXN1bHQubGFzdEluZGV4ID0gcmVnZXhwLmxhc3RJbmRleDtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjbG9uZVJlZ0V4cDtcbiIsIi8qKlxuICogQWRkcyBgdmFsdWVgIHRvIGBzZXRgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gc2V0IFRoZSBzZXQgdG8gbW9kaWZ5LlxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gYWRkLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBgc2V0YC5cbiAqL1xuZnVuY3Rpb24gYWRkU2V0RW50cnkoc2V0LCB2YWx1ZSkge1xuICAvLyBEb24ndCByZXR1cm4gYHNldC5hZGRgIGJlY2F1c2UgaXQncyBub3QgY2hhaW5hYmxlIGluIElFIDExLlxuICBzZXQuYWRkKHZhbHVlKTtcbiAgcmV0dXJuIHNldDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBhZGRTZXRFbnRyeTtcbiIsIi8qKlxuICogQ29udmVydHMgYHNldGAgdG8gYW4gYXJyYXkgb2YgaXRzIHZhbHVlcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IHNldCBUaGUgc2V0IHRvIGNvbnZlcnQuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIHZhbHVlcy5cbiAqL1xuZnVuY3Rpb24gc2V0VG9BcnJheShzZXQpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICByZXN1bHQgPSBBcnJheShzZXQuc2l6ZSk7XG5cbiAgc2V0LmZvckVhY2goZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXN1bHRbKytpbmRleF0gPSB2YWx1ZTtcbiAgfSk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc2V0VG9BcnJheTtcbiIsInZhciBhZGRTZXRFbnRyeSA9IHJlcXVpcmUoJy4vX2FkZFNldEVudHJ5JyksXG4gICAgYXJyYXlSZWR1Y2UgPSByZXF1aXJlKCcuL19hcnJheVJlZHVjZScpLFxuICAgIHNldFRvQXJyYXkgPSByZXF1aXJlKCcuL19zZXRUb0FycmF5Jyk7XG5cbi8qKiBVc2VkIHRvIGNvbXBvc2UgYml0bWFza3MgZm9yIGNsb25pbmcuICovXG52YXIgQ0xPTkVfREVFUF9GTEFHID0gMTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgY2xvbmUgb2YgYHNldGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBzZXQgVGhlIHNldCB0byBjbG9uZS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNsb25lRnVuYyBUaGUgZnVuY3Rpb24gdG8gY2xvbmUgdmFsdWVzLlxuICogQHBhcmFtIHtib29sZWFufSBbaXNEZWVwXSBTcGVjaWZ5IGEgZGVlcCBjbG9uZS5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIGNsb25lZCBzZXQuXG4gKi9cbmZ1bmN0aW9uIGNsb25lU2V0KHNldCwgaXNEZWVwLCBjbG9uZUZ1bmMpIHtcbiAgdmFyIGFycmF5ID0gaXNEZWVwID8gY2xvbmVGdW5jKHNldFRvQXJyYXkoc2V0KSwgQ0xPTkVfREVFUF9GTEFHKSA6IHNldFRvQXJyYXkoc2V0KTtcbiAgcmV0dXJuIGFycmF5UmVkdWNlKGFycmF5LCBhZGRTZXRFbnRyeSwgbmV3IHNldC5jb25zdHJ1Y3Rvcik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY2xvbmVTZXQ7XG4iLCJ2YXIgU3ltYm9sID0gcmVxdWlyZSgnLi9fU3ltYm9sJyk7XG5cbi8qKiBVc2VkIHRvIGNvbnZlcnQgc3ltYm9scyB0byBwcmltaXRpdmVzIGFuZCBzdHJpbmdzLiAqL1xudmFyIHN5bWJvbFByb3RvID0gU3ltYm9sID8gU3ltYm9sLnByb3RvdHlwZSA6IHVuZGVmaW5lZCxcbiAgICBzeW1ib2xWYWx1ZU9mID0gc3ltYm9sUHJvdG8gPyBzeW1ib2xQcm90by52YWx1ZU9mIDogdW5kZWZpbmVkO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBjbG9uZSBvZiB0aGUgYHN5bWJvbGAgb2JqZWN0LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gc3ltYm9sIFRoZSBzeW1ib2wgb2JqZWN0IHRvIGNsb25lLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgY2xvbmVkIHN5bWJvbCBvYmplY3QuXG4gKi9cbmZ1bmN0aW9uIGNsb25lU3ltYm9sKHN5bWJvbCkge1xuICByZXR1cm4gc3ltYm9sVmFsdWVPZiA/IE9iamVjdChzeW1ib2xWYWx1ZU9mLmNhbGwoc3ltYm9sKSkgOiB7fTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjbG9uZVN5bWJvbDtcbiIsInZhciBjbG9uZUFycmF5QnVmZmVyID0gcmVxdWlyZSgnLi9fY2xvbmVBcnJheUJ1ZmZlcicpO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBjbG9uZSBvZiBgdHlwZWRBcnJheWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSB0eXBlZEFycmF5IFRoZSB0eXBlZCBhcnJheSB0byBjbG9uZS5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzRGVlcF0gU3BlY2lmeSBhIGRlZXAgY2xvbmUuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBjbG9uZWQgdHlwZWQgYXJyYXkuXG4gKi9cbmZ1bmN0aW9uIGNsb25lVHlwZWRBcnJheSh0eXBlZEFycmF5LCBpc0RlZXApIHtcbiAgdmFyIGJ1ZmZlciA9IGlzRGVlcCA/IGNsb25lQXJyYXlCdWZmZXIodHlwZWRBcnJheS5idWZmZXIpIDogdHlwZWRBcnJheS5idWZmZXI7XG4gIHJldHVybiBuZXcgdHlwZWRBcnJheS5jb25zdHJ1Y3RvcihidWZmZXIsIHR5cGVkQXJyYXkuYnl0ZU9mZnNldCwgdHlwZWRBcnJheS5sZW5ndGgpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsb25lVHlwZWRBcnJheTtcbiIsInZhciBjbG9uZUFycmF5QnVmZmVyID0gcmVxdWlyZSgnLi9fY2xvbmVBcnJheUJ1ZmZlcicpLFxuICAgIGNsb25lRGF0YVZpZXcgPSByZXF1aXJlKCcuL19jbG9uZURhdGFWaWV3JyksXG4gICAgY2xvbmVNYXAgPSByZXF1aXJlKCcuL19jbG9uZU1hcCcpLFxuICAgIGNsb25lUmVnRXhwID0gcmVxdWlyZSgnLi9fY2xvbmVSZWdFeHAnKSxcbiAgICBjbG9uZVNldCA9IHJlcXVpcmUoJy4vX2Nsb25lU2V0JyksXG4gICAgY2xvbmVTeW1ib2wgPSByZXF1aXJlKCcuL19jbG9uZVN5bWJvbCcpLFxuICAgIGNsb25lVHlwZWRBcnJheSA9IHJlcXVpcmUoJy4vX2Nsb25lVHlwZWRBcnJheScpO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgYm9vbFRhZyA9ICdbb2JqZWN0IEJvb2xlYW5dJyxcbiAgICBkYXRlVGFnID0gJ1tvYmplY3QgRGF0ZV0nLFxuICAgIG1hcFRhZyA9ICdbb2JqZWN0IE1hcF0nLFxuICAgIG51bWJlclRhZyA9ICdbb2JqZWN0IE51bWJlcl0nLFxuICAgIHJlZ2V4cFRhZyA9ICdbb2JqZWN0IFJlZ0V4cF0nLFxuICAgIHNldFRhZyA9ICdbb2JqZWN0IFNldF0nLFxuICAgIHN0cmluZ1RhZyA9ICdbb2JqZWN0IFN0cmluZ10nLFxuICAgIHN5bWJvbFRhZyA9ICdbb2JqZWN0IFN5bWJvbF0nO1xuXG52YXIgYXJyYXlCdWZmZXJUYWcgPSAnW29iamVjdCBBcnJheUJ1ZmZlcl0nLFxuICAgIGRhdGFWaWV3VGFnID0gJ1tvYmplY3QgRGF0YVZpZXddJyxcbiAgICBmbG9hdDMyVGFnID0gJ1tvYmplY3QgRmxvYXQzMkFycmF5XScsXG4gICAgZmxvYXQ2NFRhZyA9ICdbb2JqZWN0IEZsb2F0NjRBcnJheV0nLFxuICAgIGludDhUYWcgPSAnW29iamVjdCBJbnQ4QXJyYXldJyxcbiAgICBpbnQxNlRhZyA9ICdbb2JqZWN0IEludDE2QXJyYXldJyxcbiAgICBpbnQzMlRhZyA9ICdbb2JqZWN0IEludDMyQXJyYXldJyxcbiAgICB1aW50OFRhZyA9ICdbb2JqZWN0IFVpbnQ4QXJyYXldJyxcbiAgICB1aW50OENsYW1wZWRUYWcgPSAnW29iamVjdCBVaW50OENsYW1wZWRBcnJheV0nLFxuICAgIHVpbnQxNlRhZyA9ICdbb2JqZWN0IFVpbnQxNkFycmF5XScsXG4gICAgdWludDMyVGFnID0gJ1tvYmplY3QgVWludDMyQXJyYXldJztcblxuLyoqXG4gKiBJbml0aWFsaXplcyBhbiBvYmplY3QgY2xvbmUgYmFzZWQgb24gaXRzIGB0b1N0cmluZ1RhZ2AuXG4gKlxuICogKipOb3RlOioqIFRoaXMgZnVuY3Rpb24gb25seSBzdXBwb3J0cyBjbG9uaW5nIHZhbHVlcyB3aXRoIHRhZ3Mgb2ZcbiAqIGBCb29sZWFuYCwgYERhdGVgLCBgRXJyb3JgLCBgTnVtYmVyYCwgYFJlZ0V4cGAsIG9yIGBTdHJpbmdgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gY2xvbmUuXG4gKiBAcGFyYW0ge3N0cmluZ30gdGFnIFRoZSBgdG9TdHJpbmdUYWdgIG9mIHRoZSBvYmplY3QgdG8gY2xvbmUuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjbG9uZUZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGNsb25lIHZhbHVlcy5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzRGVlcF0gU3BlY2lmeSBhIGRlZXAgY2xvbmUuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBpbml0aWFsaXplZCBjbG9uZS5cbiAqL1xuZnVuY3Rpb24gaW5pdENsb25lQnlUYWcob2JqZWN0LCB0YWcsIGNsb25lRnVuYywgaXNEZWVwKSB7XG4gIHZhciBDdG9yID0gb2JqZWN0LmNvbnN0cnVjdG9yO1xuICBzd2l0Y2ggKHRhZykge1xuICAgIGNhc2UgYXJyYXlCdWZmZXJUYWc6XG4gICAgICByZXR1cm4gY2xvbmVBcnJheUJ1ZmZlcihvYmplY3QpO1xuXG4gICAgY2FzZSBib29sVGFnOlxuICAgIGNhc2UgZGF0ZVRhZzpcbiAgICAgIHJldHVybiBuZXcgQ3Rvcigrb2JqZWN0KTtcblxuICAgIGNhc2UgZGF0YVZpZXdUYWc6XG4gICAgICByZXR1cm4gY2xvbmVEYXRhVmlldyhvYmplY3QsIGlzRGVlcCk7XG5cbiAgICBjYXNlIGZsb2F0MzJUYWc6IGNhc2UgZmxvYXQ2NFRhZzpcbiAgICBjYXNlIGludDhUYWc6IGNhc2UgaW50MTZUYWc6IGNhc2UgaW50MzJUYWc6XG4gICAgY2FzZSB1aW50OFRhZzogY2FzZSB1aW50OENsYW1wZWRUYWc6IGNhc2UgdWludDE2VGFnOiBjYXNlIHVpbnQzMlRhZzpcbiAgICAgIHJldHVybiBjbG9uZVR5cGVkQXJyYXkob2JqZWN0LCBpc0RlZXApO1xuXG4gICAgY2FzZSBtYXBUYWc6XG4gICAgICByZXR1cm4gY2xvbmVNYXAob2JqZWN0LCBpc0RlZXAsIGNsb25lRnVuYyk7XG5cbiAgICBjYXNlIG51bWJlclRhZzpcbiAgICBjYXNlIHN0cmluZ1RhZzpcbiAgICAgIHJldHVybiBuZXcgQ3RvcihvYmplY3QpO1xuXG4gICAgY2FzZSByZWdleHBUYWc6XG4gICAgICByZXR1cm4gY2xvbmVSZWdFeHAob2JqZWN0KTtcblxuICAgIGNhc2Ugc2V0VGFnOlxuICAgICAgcmV0dXJuIGNsb25lU2V0KG9iamVjdCwgaXNEZWVwLCBjbG9uZUZ1bmMpO1xuXG4gICAgY2FzZSBzeW1ib2xUYWc6XG4gICAgICByZXR1cm4gY2xvbmVTeW1ib2wob2JqZWN0KTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGluaXRDbG9uZUJ5VGFnO1xuIiwidmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9pc09iamVjdCcpO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RDcmVhdGUgPSBPYmplY3QuY3JlYXRlO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmNyZWF0ZWAgd2l0aG91dCBzdXBwb3J0IGZvciBhc3NpZ25pbmdcbiAqIHByb3BlcnRpZXMgdG8gdGhlIGNyZWF0ZWQgb2JqZWN0LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gcHJvdG8gVGhlIG9iamVjdCB0byBpbmhlcml0IGZyb20uXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBuZXcgb2JqZWN0LlxuICovXG52YXIgYmFzZUNyZWF0ZSA9IChmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gb2JqZWN0KCkge31cbiAgcmV0dXJuIGZ1bmN0aW9uKHByb3RvKSB7XG4gICAgaWYgKCFpc09iamVjdChwcm90bykpIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG4gICAgaWYgKG9iamVjdENyZWF0ZSkge1xuICAgICAgcmV0dXJuIG9iamVjdENyZWF0ZShwcm90byk7XG4gICAgfVxuICAgIG9iamVjdC5wcm90b3R5cGUgPSBwcm90bztcbiAgICB2YXIgcmVzdWx0ID0gbmV3IG9iamVjdDtcbiAgICBvYmplY3QucHJvdG90eXBlID0gdW5kZWZpbmVkO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG59KCkpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VDcmVhdGU7XG4iLCJ2YXIgYmFzZUNyZWF0ZSA9IHJlcXVpcmUoJy4vX2Jhc2VDcmVhdGUnKSxcbiAgICBnZXRQcm90b3R5cGUgPSByZXF1aXJlKCcuL19nZXRQcm90b3R5cGUnKSxcbiAgICBpc1Byb3RvdHlwZSA9IHJlcXVpcmUoJy4vX2lzUHJvdG90eXBlJyk7XG5cbi8qKlxuICogSW5pdGlhbGl6ZXMgYW4gb2JqZWN0IGNsb25lLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gY2xvbmUuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBpbml0aWFsaXplZCBjbG9uZS5cbiAqL1xuZnVuY3Rpb24gaW5pdENsb25lT2JqZWN0KG9iamVjdCkge1xuICByZXR1cm4gKHR5cGVvZiBvYmplY3QuY29uc3RydWN0b3IgPT0gJ2Z1bmN0aW9uJyAmJiAhaXNQcm90b3R5cGUob2JqZWN0KSlcbiAgICA/IGJhc2VDcmVhdGUoZ2V0UHJvdG90eXBlKG9iamVjdCkpXG4gICAgOiB7fTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpbml0Q2xvbmVPYmplY3Q7XG4iLCJ2YXIgU3RhY2sgPSByZXF1aXJlKCcuL19TdGFjaycpLFxuICAgIGFycmF5RWFjaCA9IHJlcXVpcmUoJy4vX2FycmF5RWFjaCcpLFxuICAgIGFzc2lnblZhbHVlID0gcmVxdWlyZSgnLi9fYXNzaWduVmFsdWUnKSxcbiAgICBiYXNlQXNzaWduID0gcmVxdWlyZSgnLi9fYmFzZUFzc2lnbicpLFxuICAgIGJhc2VBc3NpZ25JbiA9IHJlcXVpcmUoJy4vX2Jhc2VBc3NpZ25JbicpLFxuICAgIGNsb25lQnVmZmVyID0gcmVxdWlyZSgnLi9fY2xvbmVCdWZmZXInKSxcbiAgICBjb3B5QXJyYXkgPSByZXF1aXJlKCcuL19jb3B5QXJyYXknKSxcbiAgICBjb3B5U3ltYm9scyA9IHJlcXVpcmUoJy4vX2NvcHlTeW1ib2xzJyksXG4gICAgY29weVN5bWJvbHNJbiA9IHJlcXVpcmUoJy4vX2NvcHlTeW1ib2xzSW4nKSxcbiAgICBnZXRBbGxLZXlzID0gcmVxdWlyZSgnLi9fZ2V0QWxsS2V5cycpLFxuICAgIGdldEFsbEtleXNJbiA9IHJlcXVpcmUoJy4vX2dldEFsbEtleXNJbicpLFxuICAgIGdldFRhZyA9IHJlcXVpcmUoJy4vX2dldFRhZycpLFxuICAgIGluaXRDbG9uZUFycmF5ID0gcmVxdWlyZSgnLi9faW5pdENsb25lQXJyYXknKSxcbiAgICBpbml0Q2xvbmVCeVRhZyA9IHJlcXVpcmUoJy4vX2luaXRDbG9uZUJ5VGFnJyksXG4gICAgaW5pdENsb25lT2JqZWN0ID0gcmVxdWlyZSgnLi9faW5pdENsb25lT2JqZWN0JyksXG4gICAgaXNBcnJheSA9IHJlcXVpcmUoJy4vaXNBcnJheScpLFxuICAgIGlzQnVmZmVyID0gcmVxdWlyZSgnLi9pc0J1ZmZlcicpLFxuICAgIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9pc09iamVjdCcpLFxuICAgIGtleXMgPSByZXF1aXJlKCcuL2tleXMnKTtcblxuLyoqIFVzZWQgdG8gY29tcG9zZSBiaXRtYXNrcyBmb3IgY2xvbmluZy4gKi9cbnZhciBDTE9ORV9ERUVQX0ZMQUcgPSAxLFxuICAgIENMT05FX0ZMQVRfRkxBRyA9IDIsXG4gICAgQ0xPTkVfU1lNQk9MU19GTEFHID0gNDtcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIGFyZ3NUYWcgPSAnW29iamVjdCBBcmd1bWVudHNdJyxcbiAgICBhcnJheVRhZyA9ICdbb2JqZWN0IEFycmF5XScsXG4gICAgYm9vbFRhZyA9ICdbb2JqZWN0IEJvb2xlYW5dJyxcbiAgICBkYXRlVGFnID0gJ1tvYmplY3QgRGF0ZV0nLFxuICAgIGVycm9yVGFnID0gJ1tvYmplY3QgRXJyb3JdJyxcbiAgICBmdW5jVGFnID0gJ1tvYmplY3QgRnVuY3Rpb25dJyxcbiAgICBnZW5UYWcgPSAnW29iamVjdCBHZW5lcmF0b3JGdW5jdGlvbl0nLFxuICAgIG1hcFRhZyA9ICdbb2JqZWN0IE1hcF0nLFxuICAgIG51bWJlclRhZyA9ICdbb2JqZWN0IE51bWJlcl0nLFxuICAgIG9iamVjdFRhZyA9ICdbb2JqZWN0IE9iamVjdF0nLFxuICAgIHJlZ2V4cFRhZyA9ICdbb2JqZWN0IFJlZ0V4cF0nLFxuICAgIHNldFRhZyA9ICdbb2JqZWN0IFNldF0nLFxuICAgIHN0cmluZ1RhZyA9ICdbb2JqZWN0IFN0cmluZ10nLFxuICAgIHN5bWJvbFRhZyA9ICdbb2JqZWN0IFN5bWJvbF0nLFxuICAgIHdlYWtNYXBUYWcgPSAnW29iamVjdCBXZWFrTWFwXSc7XG5cbnZhciBhcnJheUJ1ZmZlclRhZyA9ICdbb2JqZWN0IEFycmF5QnVmZmVyXScsXG4gICAgZGF0YVZpZXdUYWcgPSAnW29iamVjdCBEYXRhVmlld10nLFxuICAgIGZsb2F0MzJUYWcgPSAnW29iamVjdCBGbG9hdDMyQXJyYXldJyxcbiAgICBmbG9hdDY0VGFnID0gJ1tvYmplY3QgRmxvYXQ2NEFycmF5XScsXG4gICAgaW50OFRhZyA9ICdbb2JqZWN0IEludDhBcnJheV0nLFxuICAgIGludDE2VGFnID0gJ1tvYmplY3QgSW50MTZBcnJheV0nLFxuICAgIGludDMyVGFnID0gJ1tvYmplY3QgSW50MzJBcnJheV0nLFxuICAgIHVpbnQ4VGFnID0gJ1tvYmplY3QgVWludDhBcnJheV0nLFxuICAgIHVpbnQ4Q2xhbXBlZFRhZyA9ICdbb2JqZWN0IFVpbnQ4Q2xhbXBlZEFycmF5XScsXG4gICAgdWludDE2VGFnID0gJ1tvYmplY3QgVWludDE2QXJyYXldJyxcbiAgICB1aW50MzJUYWcgPSAnW29iamVjdCBVaW50MzJBcnJheV0nO1xuXG4vKiogVXNlZCB0byBpZGVudGlmeSBgdG9TdHJpbmdUYWdgIHZhbHVlcyBzdXBwb3J0ZWQgYnkgYF8uY2xvbmVgLiAqL1xudmFyIGNsb25lYWJsZVRhZ3MgPSB7fTtcbmNsb25lYWJsZVRhZ3NbYXJnc1RhZ10gPSBjbG9uZWFibGVUYWdzW2FycmF5VGFnXSA9XG5jbG9uZWFibGVUYWdzW2FycmF5QnVmZmVyVGFnXSA9IGNsb25lYWJsZVRhZ3NbZGF0YVZpZXdUYWddID1cbmNsb25lYWJsZVRhZ3NbYm9vbFRhZ10gPSBjbG9uZWFibGVUYWdzW2RhdGVUYWddID1cbmNsb25lYWJsZVRhZ3NbZmxvYXQzMlRhZ10gPSBjbG9uZWFibGVUYWdzW2Zsb2F0NjRUYWddID1cbmNsb25lYWJsZVRhZ3NbaW50OFRhZ10gPSBjbG9uZWFibGVUYWdzW2ludDE2VGFnXSA9XG5jbG9uZWFibGVUYWdzW2ludDMyVGFnXSA9IGNsb25lYWJsZVRhZ3NbbWFwVGFnXSA9XG5jbG9uZWFibGVUYWdzW251bWJlclRhZ10gPSBjbG9uZWFibGVUYWdzW29iamVjdFRhZ10gPVxuY2xvbmVhYmxlVGFnc1tyZWdleHBUYWddID0gY2xvbmVhYmxlVGFnc1tzZXRUYWddID1cbmNsb25lYWJsZVRhZ3Nbc3RyaW5nVGFnXSA9IGNsb25lYWJsZVRhZ3Nbc3ltYm9sVGFnXSA9XG5jbG9uZWFibGVUYWdzW3VpbnQ4VGFnXSA9IGNsb25lYWJsZVRhZ3NbdWludDhDbGFtcGVkVGFnXSA9XG5jbG9uZWFibGVUYWdzW3VpbnQxNlRhZ10gPSBjbG9uZWFibGVUYWdzW3VpbnQzMlRhZ10gPSB0cnVlO1xuY2xvbmVhYmxlVGFnc1tlcnJvclRhZ10gPSBjbG9uZWFibGVUYWdzW2Z1bmNUYWddID1cbmNsb25lYWJsZVRhZ3Nbd2Vha01hcFRhZ10gPSBmYWxzZTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5jbG9uZWAgYW5kIGBfLmNsb25lRGVlcGAgd2hpY2ggdHJhY2tzXG4gKiB0cmF2ZXJzZWQgb2JqZWN0cy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2xvbmUuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGJpdG1hc2sgVGhlIGJpdG1hc2sgZmxhZ3MuXG4gKiAgMSAtIERlZXAgY2xvbmVcbiAqICAyIC0gRmxhdHRlbiBpbmhlcml0ZWQgcHJvcGVydGllc1xuICogIDQgLSBDbG9uZSBzeW1ib2xzXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY3VzdG9taXplcl0gVGhlIGZ1bmN0aW9uIHRvIGN1c3RvbWl6ZSBjbG9uaW5nLlxuICogQHBhcmFtIHtzdHJpbmd9IFtrZXldIFRoZSBrZXkgb2YgYHZhbHVlYC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb2JqZWN0XSBUaGUgcGFyZW50IG9iamVjdCBvZiBgdmFsdWVgLlxuICogQHBhcmFtIHtPYmplY3R9IFtzdGFja10gVHJhY2tzIHRyYXZlcnNlZCBvYmplY3RzIGFuZCB0aGVpciBjbG9uZSBjb3VudGVycGFydHMuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgY2xvbmVkIHZhbHVlLlxuICovXG5mdW5jdGlvbiBiYXNlQ2xvbmUodmFsdWUsIGJpdG1hc2ssIGN1c3RvbWl6ZXIsIGtleSwgb2JqZWN0LCBzdGFjaykge1xuICB2YXIgcmVzdWx0LFxuICAgICAgaXNEZWVwID0gYml0bWFzayAmIENMT05FX0RFRVBfRkxBRyxcbiAgICAgIGlzRmxhdCA9IGJpdG1hc2sgJiBDTE9ORV9GTEFUX0ZMQUcsXG4gICAgICBpc0Z1bGwgPSBiaXRtYXNrICYgQ0xPTkVfU1lNQk9MU19GTEFHO1xuXG4gIGlmIChjdXN0b21pemVyKSB7XG4gICAgcmVzdWx0ID0gb2JqZWN0ID8gY3VzdG9taXplcih2YWx1ZSwga2V5LCBvYmplY3QsIHN0YWNrKSA6IGN1c3RvbWl6ZXIodmFsdWUpO1xuICB9XG4gIGlmIChyZXN1bHQgIT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbiAgaWYgKCFpc09iamVjdCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbiAgdmFyIGlzQXJyID0gaXNBcnJheSh2YWx1ZSk7XG4gIGlmIChpc0Fycikge1xuICAgIHJlc3VsdCA9IGluaXRDbG9uZUFycmF5KHZhbHVlKTtcbiAgICBpZiAoIWlzRGVlcCkge1xuICAgICAgcmV0dXJuIGNvcHlBcnJheSh2YWx1ZSwgcmVzdWx0KTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdmFyIHRhZyA9IGdldFRhZyh2YWx1ZSksXG4gICAgICAgIGlzRnVuYyA9IHRhZyA9PSBmdW5jVGFnIHx8IHRhZyA9PSBnZW5UYWc7XG5cbiAgICBpZiAoaXNCdWZmZXIodmFsdWUpKSB7XG4gICAgICByZXR1cm4gY2xvbmVCdWZmZXIodmFsdWUsIGlzRGVlcCk7XG4gICAgfVxuICAgIGlmICh0YWcgPT0gb2JqZWN0VGFnIHx8IHRhZyA9PSBhcmdzVGFnIHx8IChpc0Z1bmMgJiYgIW9iamVjdCkpIHtcbiAgICAgIHJlc3VsdCA9IChpc0ZsYXQgfHwgaXNGdW5jKSA/IHt9IDogaW5pdENsb25lT2JqZWN0KHZhbHVlKTtcbiAgICAgIGlmICghaXNEZWVwKSB7XG4gICAgICAgIHJldHVybiBpc0ZsYXRcbiAgICAgICAgICA/IGNvcHlTeW1ib2xzSW4odmFsdWUsIGJhc2VBc3NpZ25JbihyZXN1bHQsIHZhbHVlKSlcbiAgICAgICAgICA6IGNvcHlTeW1ib2xzKHZhbHVlLCBiYXNlQXNzaWduKHJlc3VsdCwgdmFsdWUpKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCFjbG9uZWFibGVUYWdzW3RhZ10pIHtcbiAgICAgICAgcmV0dXJuIG9iamVjdCA/IHZhbHVlIDoge307XG4gICAgICB9XG4gICAgICByZXN1bHQgPSBpbml0Q2xvbmVCeVRhZyh2YWx1ZSwgdGFnLCBiYXNlQ2xvbmUsIGlzRGVlcCk7XG4gICAgfVxuICB9XG4gIC8vIENoZWNrIGZvciBjaXJjdWxhciByZWZlcmVuY2VzIGFuZCByZXR1cm4gaXRzIGNvcnJlc3BvbmRpbmcgY2xvbmUuXG4gIHN0YWNrIHx8IChzdGFjayA9IG5ldyBTdGFjayk7XG4gIHZhciBzdGFja2VkID0gc3RhY2suZ2V0KHZhbHVlKTtcbiAgaWYgKHN0YWNrZWQpIHtcbiAgICByZXR1cm4gc3RhY2tlZDtcbiAgfVxuICBzdGFjay5zZXQodmFsdWUsIHJlc3VsdCk7XG5cbiAgdmFyIGtleXNGdW5jID0gaXNGdWxsXG4gICAgPyAoaXNGbGF0ID8gZ2V0QWxsS2V5c0luIDogZ2V0QWxsS2V5cylcbiAgICA6IChpc0ZsYXQgPyBrZXlzSW4gOiBrZXlzKTtcblxuICB2YXIgcHJvcHMgPSBpc0FyciA/IHVuZGVmaW5lZCA6IGtleXNGdW5jKHZhbHVlKTtcbiAgYXJyYXlFYWNoKHByb3BzIHx8IHZhbHVlLCBmdW5jdGlvbihzdWJWYWx1ZSwga2V5KSB7XG4gICAgaWYgKHByb3BzKSB7XG4gICAgICBrZXkgPSBzdWJWYWx1ZTtcbiAgICAgIHN1YlZhbHVlID0gdmFsdWVba2V5XTtcbiAgICB9XG4gICAgLy8gUmVjdXJzaXZlbHkgcG9wdWxhdGUgY2xvbmUgKHN1c2NlcHRpYmxlIHRvIGNhbGwgc3RhY2sgbGltaXRzKS5cbiAgICBhc3NpZ25WYWx1ZShyZXN1bHQsIGtleSwgYmFzZUNsb25lKHN1YlZhbHVlLCBiaXRtYXNrLCBjdXN0b21pemVyLCBrZXksIHZhbHVlLCBzdGFjaykpO1xuICB9KTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlQ2xvbmU7XG4iLCJ2YXIgYmFzZUNsb25lID0gcmVxdWlyZSgnLi9fYmFzZUNsb25lJyk7XG5cbi8qKiBVc2VkIHRvIGNvbXBvc2UgYml0bWFza3MgZm9yIGNsb25pbmcuICovXG52YXIgQ0xPTkVfREVFUF9GTEFHID0gMSxcbiAgICBDTE9ORV9TWU1CT0xTX0ZMQUcgPSA0O1xuXG4vKipcbiAqIFRoaXMgbWV0aG9kIGlzIGxpa2UgYF8uY2xvbmVgIGV4Y2VwdCB0aGF0IGl0IHJlY3Vyc2l2ZWx5IGNsb25lcyBgdmFsdWVgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMS4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byByZWN1cnNpdmVseSBjbG9uZS5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBkZWVwIGNsb25lZCB2YWx1ZS5cbiAqIEBzZWUgXy5jbG9uZVxuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgb2JqZWN0cyA9IFt7ICdhJzogMSB9LCB7ICdiJzogMiB9XTtcbiAqXG4gKiB2YXIgZGVlcCA9IF8uY2xvbmVEZWVwKG9iamVjdHMpO1xuICogY29uc29sZS5sb2coZGVlcFswXSA9PT0gb2JqZWN0c1swXSk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBjbG9uZURlZXAodmFsdWUpIHtcbiAgcmV0dXJuIGJhc2VDbG9uZSh2YWx1ZSwgQ0xPTkVfREVFUF9GTEFHIHwgQ0xPTkVfU1lNQk9MU19GTEFHKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjbG9uZURlZXA7XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgVnVlIGZyb20gJ3Z1ZSdcbmltcG9ydCBjbG9uZURlZXAgZnJvbSAnbG9kYXNoL2Nsb25lRGVlcCdcblxuZnVuY3Rpb24gY3JlYXRlTG9jYWxWdWUoX1Z1ZTogQ29tcG9uZW50ID0gVnVlKTogQ29tcG9uZW50IHtcbiAgY29uc3QgaW5zdGFuY2UgPSBfVnVlLmV4dGVuZCgpXG5cbiAgLy8gY2xvbmUgZ2xvYmFsIEFQSXNcbiAgT2JqZWN0LmtleXMoX1Z1ZSkuZm9yRWFjaChrZXkgPT4ge1xuICAgIGlmICghaW5zdGFuY2UuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgY29uc3Qgb3JpZ2luYWwgPSBfVnVlW2tleV1cbiAgICAgIC8vIGNsb25lRGVlcCBjYW4gZmFpbCB3aGVuIGNsb25pbmcgVnVlIGluc3RhbmNlc1xuICAgICAgLy8gY2xvbmVEZWVwIGNoZWNrcyB0aGF0IHRoZSBpbnN0YW5jZSBoYXMgYSBTeW1ib2xcbiAgICAgIC8vIHdoaWNoIGVycm9ycyBpbiBWdWUgPCAyLjE3IChodHRwczovL2dpdGh1Yi5jb20vdnVlanMvdnVlL3B1bGwvNzg3OClcbiAgICAgIHRyeSB7XG4gICAgICAgIGluc3RhbmNlW2tleV0gPVxuICAgICAgICAgIHR5cGVvZiBvcmlnaW5hbCA9PT0gJ29iamVjdCcgPyBjbG9uZURlZXAob3JpZ2luYWwpIDogb3JpZ2luYWxcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgaW5zdGFuY2Vba2V5XSA9IG9yaWdpbmFsXG4gICAgICB9XG4gICAgfVxuICB9KVxuXG4gIC8vIGNvbmZpZyBpcyBub3QgZW51bWVyYWJsZVxuICBpbnN0YW5jZS5jb25maWcgPSBjbG9uZURlZXAoVnVlLmNvbmZpZylcblxuICBpbnN0YW5jZS5jb25maWcuZXJyb3JIYW5kbGVyID0gVnVlLmNvbmZpZy5lcnJvckhhbmRsZXJcblxuICAvLyBvcHRpb24gbWVyZ2Ugc3RyYXRlZ2llcyBuZWVkIHRvIGJlIGV4cG9zZWQgYnkgcmVmZXJlbmNlXG4gIC8vIHNvIHRoYXQgbWVyZ2Ugc3RyYXRzIHJlZ2lzdGVyZWQgYnkgcGx1Z2lucyBjYW4gd29yayBwcm9wZXJseVxuICBpbnN0YW5jZS5jb25maWcub3B0aW9uTWVyZ2VTdHJhdGVnaWVzID0gVnVlLmNvbmZpZy5vcHRpb25NZXJnZVN0cmF0ZWdpZXNcblxuICAvLyBtYWtlIHN1cmUgYWxsIGV4dGVuZHMgYXJlIGJhc2VkIG9uIHRoaXMgaW5zdGFuY2UuXG4gIC8vIHRoaXMgaXMgaW1wb3J0YW50IHNvIHRoYXQgZ2xvYmFsIGNvbXBvbmVudHMgcmVnaXN0ZXJlZCBieSBwbHVnaW5zLFxuICAvLyBlLmcuIHJvdXRlci1saW5rIGFyZSBjcmVhdGVkIHVzaW5nIHRoZSBjb3JyZWN0IGJhc2UgY29uc3RydWN0b3JcbiAgaW5zdGFuY2Uub3B0aW9ucy5fYmFzZSA9IGluc3RhbmNlXG5cbiAgLy8gY29tcGF0IGZvciB2dWUtcm91dGVyIDwgMi43LjEgd2hlcmUgaXQgZG9lcyBub3QgYWxsb3cgbXVsdGlwbGUgaW5zdGFsbHNcbiAgaWYgKGluc3RhbmNlLl9pbnN0YWxsZWRQbHVnaW5zICYmIGluc3RhbmNlLl9pbnN0YWxsZWRQbHVnaW5zLmxlbmd0aCkge1xuICAgIGluc3RhbmNlLl9pbnN0YWxsZWRQbHVnaW5zLmxlbmd0aCA9IDBcbiAgfVxuICBjb25zdCB1c2UgPSBpbnN0YW5jZS51c2VcbiAgaW5zdGFuY2UudXNlID0gKHBsdWdpbiwgLi4ucmVzdCkgPT4ge1xuICAgIGlmIChwbHVnaW4uaW5zdGFsbGVkID09PSB0cnVlKSB7XG4gICAgICBwbHVnaW4uaW5zdGFsbGVkID0gZmFsc2VcbiAgICB9XG4gICAgaWYgKHBsdWdpbi5pbnN0YWxsICYmIHBsdWdpbi5pbnN0YWxsLmluc3RhbGxlZCA9PT0gdHJ1ZSkge1xuICAgICAgcGx1Z2luLmluc3RhbGwuaW5zdGFsbGVkID0gZmFsc2VcbiAgICB9XG4gICAgdXNlLmNhbGwoaW5zdGFuY2UsIHBsdWdpbiwgLi4ucmVzdClcbiAgfVxuICByZXR1cm4gaW5zdGFuY2Vcbn1cblxuZXhwb3J0IGRlZmF1bHQgY3JlYXRlTG9jYWxWdWVcbiIsImV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IFNlbVZlcjtcblxuLy8gVGhlIGRlYnVnIGZ1bmN0aW9uIGlzIGV4Y2x1ZGVkIGVudGlyZWx5IGZyb20gdGhlIG1pbmlmaWVkIHZlcnNpb24uXG4vKiBub21pbiAqLyB2YXIgZGVidWc7XG4vKiBub21pbiAqLyBpZiAodHlwZW9mIHByb2Nlc3MgPT09ICdvYmplY3QnICYmXG4gICAgLyogbm9taW4gKi8gcHJvY2Vzcy5lbnYgJiZcbiAgICAvKiBub21pbiAqLyBwcm9jZXNzLmVudi5OT0RFX0RFQlVHICYmXG4gICAgLyogbm9taW4gKi8gL1xcYnNlbXZlclxcYi9pLnRlc3QocHJvY2Vzcy5lbnYuTk9ERV9ERUJVRykpXG4gIC8qIG5vbWluICovIGRlYnVnID0gZnVuY3Rpb24oKSB7XG4gICAgLyogbm9taW4gKi8gdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApO1xuICAgIC8qIG5vbWluICovIGFyZ3MudW5zaGlmdCgnU0VNVkVSJyk7XG4gICAgLyogbm9taW4gKi8gY29uc29sZS5sb2cuYXBwbHkoY29uc29sZSwgYXJncyk7XG4gICAgLyogbm9taW4gKi8gfTtcbi8qIG5vbWluICovIGVsc2VcbiAgLyogbm9taW4gKi8gZGVidWcgPSBmdW5jdGlvbigpIHt9O1xuXG4vLyBOb3RlOiB0aGlzIGlzIHRoZSBzZW12ZXIub3JnIHZlcnNpb24gb2YgdGhlIHNwZWMgdGhhdCBpdCBpbXBsZW1lbnRzXG4vLyBOb3QgbmVjZXNzYXJpbHkgdGhlIHBhY2thZ2UgdmVyc2lvbiBvZiB0aGlzIGNvZGUuXG5leHBvcnRzLlNFTVZFUl9TUEVDX1ZFUlNJT04gPSAnMi4wLjAnO1xuXG52YXIgTUFYX0xFTkdUSCA9IDI1NjtcbnZhciBNQVhfU0FGRV9JTlRFR0VSID0gTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVIgfHwgOTAwNzE5OTI1NDc0MDk5MTtcblxuLy8gTWF4IHNhZmUgc2VnbWVudCBsZW5ndGggZm9yIGNvZXJjaW9uLlxudmFyIE1BWF9TQUZFX0NPTVBPTkVOVF9MRU5HVEggPSAxNjtcblxuLy8gVGhlIGFjdHVhbCByZWdleHBzIGdvIG9uIGV4cG9ydHMucmVcbnZhciByZSA9IGV4cG9ydHMucmUgPSBbXTtcbnZhciBzcmMgPSBleHBvcnRzLnNyYyA9IFtdO1xudmFyIFIgPSAwO1xuXG4vLyBUaGUgZm9sbG93aW5nIFJlZ3VsYXIgRXhwcmVzc2lvbnMgY2FuIGJlIHVzZWQgZm9yIHRva2VuaXppbmcsXG4vLyB2YWxpZGF0aW5nLCBhbmQgcGFyc2luZyBTZW1WZXIgdmVyc2lvbiBzdHJpbmdzLlxuXG4vLyAjIyBOdW1lcmljIElkZW50aWZpZXJcbi8vIEEgc2luZ2xlIGAwYCwgb3IgYSBub24temVybyBkaWdpdCBmb2xsb3dlZCBieSB6ZXJvIG9yIG1vcmUgZGlnaXRzLlxuXG52YXIgTlVNRVJJQ0lERU5USUZJRVIgPSBSKys7XG5zcmNbTlVNRVJJQ0lERU5USUZJRVJdID0gJzB8WzEtOV1cXFxcZConO1xudmFyIE5VTUVSSUNJREVOVElGSUVSTE9PU0UgPSBSKys7XG5zcmNbTlVNRVJJQ0lERU5USUZJRVJMT09TRV0gPSAnWzAtOV0rJztcblxuXG4vLyAjIyBOb24tbnVtZXJpYyBJZGVudGlmaWVyXG4vLyBaZXJvIG9yIG1vcmUgZGlnaXRzLCBmb2xsb3dlZCBieSBhIGxldHRlciBvciBoeXBoZW4sIGFuZCB0aGVuIHplcm8gb3Jcbi8vIG1vcmUgbGV0dGVycywgZGlnaXRzLCBvciBoeXBoZW5zLlxuXG52YXIgTk9OTlVNRVJJQ0lERU5USUZJRVIgPSBSKys7XG5zcmNbTk9OTlVNRVJJQ0lERU5USUZJRVJdID0gJ1xcXFxkKlthLXpBLVotXVthLXpBLVowLTktXSonO1xuXG5cbi8vICMjIE1haW4gVmVyc2lvblxuLy8gVGhyZWUgZG90LXNlcGFyYXRlZCBudW1lcmljIGlkZW50aWZpZXJzLlxuXG52YXIgTUFJTlZFUlNJT04gPSBSKys7XG5zcmNbTUFJTlZFUlNJT05dID0gJygnICsgc3JjW05VTUVSSUNJREVOVElGSUVSXSArICcpXFxcXC4nICtcbiAgICAgICAgICAgICAgICAgICAnKCcgKyBzcmNbTlVNRVJJQ0lERU5USUZJRVJdICsgJylcXFxcLicgK1xuICAgICAgICAgICAgICAgICAgICcoJyArIHNyY1tOVU1FUklDSURFTlRJRklFUl0gKyAnKSc7XG5cbnZhciBNQUlOVkVSU0lPTkxPT1NFID0gUisrO1xuc3JjW01BSU5WRVJTSU9OTE9PU0VdID0gJygnICsgc3JjW05VTUVSSUNJREVOVElGSUVSTE9PU0VdICsgJylcXFxcLicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJygnICsgc3JjW05VTUVSSUNJREVOVElGSUVSTE9PU0VdICsgJylcXFxcLicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJygnICsgc3JjW05VTUVSSUNJREVOVElGSUVSTE9PU0VdICsgJyknO1xuXG4vLyAjIyBQcmUtcmVsZWFzZSBWZXJzaW9uIElkZW50aWZpZXJcbi8vIEEgbnVtZXJpYyBpZGVudGlmaWVyLCBvciBhIG5vbi1udW1lcmljIGlkZW50aWZpZXIuXG5cbnZhciBQUkVSRUxFQVNFSURFTlRJRklFUiA9IFIrKztcbnNyY1tQUkVSRUxFQVNFSURFTlRJRklFUl0gPSAnKD86JyArIHNyY1tOVU1FUklDSURFTlRJRklFUl0gK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICd8JyArIHNyY1tOT05OVU1FUklDSURFTlRJRklFUl0gKyAnKSc7XG5cbnZhciBQUkVSRUxFQVNFSURFTlRJRklFUkxPT1NFID0gUisrO1xuc3JjW1BSRVJFTEVBU0VJREVOVElGSUVSTE9PU0VdID0gJyg/OicgKyBzcmNbTlVNRVJJQ0lERU5USUZJRVJMT09TRV0gK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3wnICsgc3JjW05PTk5VTUVSSUNJREVOVElGSUVSXSArICcpJztcblxuXG4vLyAjIyBQcmUtcmVsZWFzZSBWZXJzaW9uXG4vLyBIeXBoZW4sIGZvbGxvd2VkIGJ5IG9uZSBvciBtb3JlIGRvdC1zZXBhcmF0ZWQgcHJlLXJlbGVhc2UgdmVyc2lvblxuLy8gaWRlbnRpZmllcnMuXG5cbnZhciBQUkVSRUxFQVNFID0gUisrO1xuc3JjW1BSRVJFTEVBU0VdID0gJyg/Oi0oJyArIHNyY1tQUkVSRUxFQVNFSURFTlRJRklFUl0gK1xuICAgICAgICAgICAgICAgICAgJyg/OlxcXFwuJyArIHNyY1tQUkVSRUxFQVNFSURFTlRJRklFUl0gKyAnKSopKSc7XG5cbnZhciBQUkVSRUxFQVNFTE9PU0UgPSBSKys7XG5zcmNbUFJFUkVMRUFTRUxPT1NFXSA9ICcoPzotPygnICsgc3JjW1BSRVJFTEVBU0VJREVOVElGSUVSTE9PU0VdICtcbiAgICAgICAgICAgICAgICAgICAgICAgJyg/OlxcXFwuJyArIHNyY1tQUkVSRUxFQVNFSURFTlRJRklFUkxPT1NFXSArICcpKikpJztcblxuLy8gIyMgQnVpbGQgTWV0YWRhdGEgSWRlbnRpZmllclxuLy8gQW55IGNvbWJpbmF0aW9uIG9mIGRpZ2l0cywgbGV0dGVycywgb3IgaHlwaGVucy5cblxudmFyIEJVSUxESURFTlRJRklFUiA9IFIrKztcbnNyY1tCVUlMRElERU5USUZJRVJdID0gJ1swLTlBLVphLXotXSsnO1xuXG4vLyAjIyBCdWlsZCBNZXRhZGF0YVxuLy8gUGx1cyBzaWduLCBmb2xsb3dlZCBieSBvbmUgb3IgbW9yZSBwZXJpb2Qtc2VwYXJhdGVkIGJ1aWxkIG1ldGFkYXRhXG4vLyBpZGVudGlmaWVycy5cblxudmFyIEJVSUxEID0gUisrO1xuc3JjW0JVSUxEXSA9ICcoPzpcXFxcKygnICsgc3JjW0JVSUxESURFTlRJRklFUl0gK1xuICAgICAgICAgICAgICcoPzpcXFxcLicgKyBzcmNbQlVJTERJREVOVElGSUVSXSArICcpKikpJztcblxuXG4vLyAjIyBGdWxsIFZlcnNpb24gU3RyaW5nXG4vLyBBIG1haW4gdmVyc2lvbiwgZm9sbG93ZWQgb3B0aW9uYWxseSBieSBhIHByZS1yZWxlYXNlIHZlcnNpb24gYW5kXG4vLyBidWlsZCBtZXRhZGF0YS5cblxuLy8gTm90ZSB0aGF0IHRoZSBvbmx5IG1ham9yLCBtaW5vciwgcGF0Y2gsIGFuZCBwcmUtcmVsZWFzZSBzZWN0aW9ucyBvZlxuLy8gdGhlIHZlcnNpb24gc3RyaW5nIGFyZSBjYXB0dXJpbmcgZ3JvdXBzLiAgVGhlIGJ1aWxkIG1ldGFkYXRhIGlzIG5vdCBhXG4vLyBjYXB0dXJpbmcgZ3JvdXAsIGJlY2F1c2UgaXQgc2hvdWxkIG5vdCBldmVyIGJlIHVzZWQgaW4gdmVyc2lvblxuLy8gY29tcGFyaXNvbi5cblxudmFyIEZVTEwgPSBSKys7XG52YXIgRlVMTFBMQUlOID0gJ3Y/JyArIHNyY1tNQUlOVkVSU0lPTl0gK1xuICAgICAgICAgICAgICAgIHNyY1tQUkVSRUxFQVNFXSArICc/JyArXG4gICAgICAgICAgICAgICAgc3JjW0JVSUxEXSArICc/Jztcblxuc3JjW0ZVTExdID0gJ14nICsgRlVMTFBMQUlOICsgJyQnO1xuXG4vLyBsaWtlIGZ1bGwsIGJ1dCBhbGxvd3MgdjEuMi4zIGFuZCA9MS4yLjMsIHdoaWNoIHBlb3BsZSBkbyBzb21ldGltZXMuXG4vLyBhbHNvLCAxLjAuMGFscGhhMSAocHJlcmVsZWFzZSB3aXRob3V0IHRoZSBoeXBoZW4pIHdoaWNoIGlzIHByZXR0eVxuLy8gY29tbW9uIGluIHRoZSBucG0gcmVnaXN0cnkuXG52YXIgTE9PU0VQTEFJTiA9ICdbdj1cXFxcc10qJyArIHNyY1tNQUlOVkVSU0lPTkxPT1NFXSArXG4gICAgICAgICAgICAgICAgIHNyY1tQUkVSRUxFQVNFTE9PU0VdICsgJz8nICtcbiAgICAgICAgICAgICAgICAgc3JjW0JVSUxEXSArICc/JztcblxudmFyIExPT1NFID0gUisrO1xuc3JjW0xPT1NFXSA9ICdeJyArIExPT1NFUExBSU4gKyAnJCc7XG5cbnZhciBHVExUID0gUisrO1xuc3JjW0dUTFRdID0gJygoPzo8fD4pPz0/KSc7XG5cbi8vIFNvbWV0aGluZyBsaWtlIFwiMi4qXCIgb3IgXCIxLjIueFwiLlxuLy8gTm90ZSB0aGF0IFwieC54XCIgaXMgYSB2YWxpZCB4UmFuZ2UgaWRlbnRpZmVyLCBtZWFuaW5nIFwiYW55IHZlcnNpb25cIlxuLy8gT25seSB0aGUgZmlyc3QgaXRlbSBpcyBzdHJpY3RseSByZXF1aXJlZC5cbnZhciBYUkFOR0VJREVOVElGSUVSTE9PU0UgPSBSKys7XG5zcmNbWFJBTkdFSURFTlRJRklFUkxPT1NFXSA9IHNyY1tOVU1FUklDSURFTlRJRklFUkxPT1NFXSArICd8eHxYfFxcXFwqJztcbnZhciBYUkFOR0VJREVOVElGSUVSID0gUisrO1xuc3JjW1hSQU5HRUlERU5USUZJRVJdID0gc3JjW05VTUVSSUNJREVOVElGSUVSXSArICd8eHxYfFxcXFwqJztcblxudmFyIFhSQU5HRVBMQUlOID0gUisrO1xuc3JjW1hSQU5HRVBMQUlOXSA9ICdbdj1cXFxcc10qKCcgKyBzcmNbWFJBTkdFSURFTlRJRklFUl0gKyAnKScgK1xuICAgICAgICAgICAgICAgICAgICcoPzpcXFxcLignICsgc3JjW1hSQU5HRUlERU5USUZJRVJdICsgJyknICtcbiAgICAgICAgICAgICAgICAgICAnKD86XFxcXC4oJyArIHNyY1tYUkFOR0VJREVOVElGSUVSXSArICcpJyArXG4gICAgICAgICAgICAgICAgICAgJyg/OicgKyBzcmNbUFJFUkVMRUFTRV0gKyAnKT8nICtcbiAgICAgICAgICAgICAgICAgICBzcmNbQlVJTERdICsgJz8nICtcbiAgICAgICAgICAgICAgICAgICAnKT8pPyc7XG5cbnZhciBYUkFOR0VQTEFJTkxPT1NFID0gUisrO1xuc3JjW1hSQU5HRVBMQUlOTE9PU0VdID0gJ1t2PVxcXFxzXSooJyArIHNyY1tYUkFOR0VJREVOVElGSUVSTE9PU0VdICsgJyknICtcbiAgICAgICAgICAgICAgICAgICAgICAgICcoPzpcXFxcLignICsgc3JjW1hSQU5HRUlERU5USUZJRVJMT09TRV0gKyAnKScgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJyg/OlxcXFwuKCcgKyBzcmNbWFJBTkdFSURFTlRJRklFUkxPT1NFXSArICcpJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnKD86JyArIHNyY1tQUkVSRUxFQVNFTE9PU0VdICsgJyk/JyArXG4gICAgICAgICAgICAgICAgICAgICAgICBzcmNbQlVJTERdICsgJz8nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICcpPyk/JztcblxudmFyIFhSQU5HRSA9IFIrKztcbnNyY1tYUkFOR0VdID0gJ14nICsgc3JjW0dUTFRdICsgJ1xcXFxzKicgKyBzcmNbWFJBTkdFUExBSU5dICsgJyQnO1xudmFyIFhSQU5HRUxPT1NFID0gUisrO1xuc3JjW1hSQU5HRUxPT1NFXSA9ICdeJyArIHNyY1tHVExUXSArICdcXFxccyonICsgc3JjW1hSQU5HRVBMQUlOTE9PU0VdICsgJyQnO1xuXG4vLyBDb2VyY2lvbi5cbi8vIEV4dHJhY3QgYW55dGhpbmcgdGhhdCBjb3VsZCBjb25jZWl2YWJseSBiZSBhIHBhcnQgb2YgYSB2YWxpZCBzZW12ZXJcbnZhciBDT0VSQ0UgPSBSKys7XG5zcmNbQ09FUkNFXSA9ICcoPzpefFteXFxcXGRdKScgK1xuICAgICAgICAgICAgICAnKFxcXFxkezEsJyArIE1BWF9TQUZFX0NPTVBPTkVOVF9MRU5HVEggKyAnfSknICtcbiAgICAgICAgICAgICAgJyg/OlxcXFwuKFxcXFxkezEsJyArIE1BWF9TQUZFX0NPTVBPTkVOVF9MRU5HVEggKyAnfSkpPycgK1xuICAgICAgICAgICAgICAnKD86XFxcXC4oXFxcXGR7MSwnICsgTUFYX1NBRkVfQ09NUE9ORU5UX0xFTkdUSCArICd9KSk/JyArXG4gICAgICAgICAgICAgICcoPzokfFteXFxcXGRdKSc7XG5cbi8vIFRpbGRlIHJhbmdlcy5cbi8vIE1lYW5pbmcgaXMgXCJyZWFzb25hYmx5IGF0IG9yIGdyZWF0ZXIgdGhhblwiXG52YXIgTE9ORVRJTERFID0gUisrO1xuc3JjW0xPTkVUSUxERV0gPSAnKD86fj4/KSc7XG5cbnZhciBUSUxERVRSSU0gPSBSKys7XG5zcmNbVElMREVUUklNXSA9ICcoXFxcXHMqKScgKyBzcmNbTE9ORVRJTERFXSArICdcXFxccysnO1xucmVbVElMREVUUklNXSA9IG5ldyBSZWdFeHAoc3JjW1RJTERFVFJJTV0sICdnJyk7XG52YXIgdGlsZGVUcmltUmVwbGFjZSA9ICckMX4nO1xuXG52YXIgVElMREUgPSBSKys7XG5zcmNbVElMREVdID0gJ14nICsgc3JjW0xPTkVUSUxERV0gKyBzcmNbWFJBTkdFUExBSU5dICsgJyQnO1xudmFyIFRJTERFTE9PU0UgPSBSKys7XG5zcmNbVElMREVMT09TRV0gPSAnXicgKyBzcmNbTE9ORVRJTERFXSArIHNyY1tYUkFOR0VQTEFJTkxPT1NFXSArICckJztcblxuLy8gQ2FyZXQgcmFuZ2VzLlxuLy8gTWVhbmluZyBpcyBcImF0IGxlYXN0IGFuZCBiYWNrd2FyZHMgY29tcGF0aWJsZSB3aXRoXCJcbnZhciBMT05FQ0FSRVQgPSBSKys7XG5zcmNbTE9ORUNBUkVUXSA9ICcoPzpcXFxcXiknO1xuXG52YXIgQ0FSRVRUUklNID0gUisrO1xuc3JjW0NBUkVUVFJJTV0gPSAnKFxcXFxzKiknICsgc3JjW0xPTkVDQVJFVF0gKyAnXFxcXHMrJztcbnJlW0NBUkVUVFJJTV0gPSBuZXcgUmVnRXhwKHNyY1tDQVJFVFRSSU1dLCAnZycpO1xudmFyIGNhcmV0VHJpbVJlcGxhY2UgPSAnJDFeJztcblxudmFyIENBUkVUID0gUisrO1xuc3JjW0NBUkVUXSA9ICdeJyArIHNyY1tMT05FQ0FSRVRdICsgc3JjW1hSQU5HRVBMQUlOXSArICckJztcbnZhciBDQVJFVExPT1NFID0gUisrO1xuc3JjW0NBUkVUTE9PU0VdID0gJ14nICsgc3JjW0xPTkVDQVJFVF0gKyBzcmNbWFJBTkdFUExBSU5MT09TRV0gKyAnJCc7XG5cbi8vIEEgc2ltcGxlIGd0L2x0L2VxIHRoaW5nLCBvciBqdXN0IFwiXCIgdG8gaW5kaWNhdGUgXCJhbnkgdmVyc2lvblwiXG52YXIgQ09NUEFSQVRPUkxPT1NFID0gUisrO1xuc3JjW0NPTVBBUkFUT1JMT09TRV0gPSAnXicgKyBzcmNbR1RMVF0gKyAnXFxcXHMqKCcgKyBMT09TRVBMQUlOICsgJykkfF4kJztcbnZhciBDT01QQVJBVE9SID0gUisrO1xuc3JjW0NPTVBBUkFUT1JdID0gJ14nICsgc3JjW0dUTFRdICsgJ1xcXFxzKignICsgRlVMTFBMQUlOICsgJykkfF4kJztcblxuXG4vLyBBbiBleHByZXNzaW9uIHRvIHN0cmlwIGFueSB3aGl0ZXNwYWNlIGJldHdlZW4gdGhlIGd0bHQgYW5kIHRoZSB0aGluZ1xuLy8gaXQgbW9kaWZpZXMsIHNvIHRoYXQgYD4gMS4yLjNgID09PiBgPjEuMi4zYFxudmFyIENPTVBBUkFUT1JUUklNID0gUisrO1xuc3JjW0NPTVBBUkFUT1JUUklNXSA9ICcoXFxcXHMqKScgKyBzcmNbR1RMVF0gK1xuICAgICAgICAgICAgICAgICAgICAgICdcXFxccyooJyArIExPT1NFUExBSU4gKyAnfCcgKyBzcmNbWFJBTkdFUExBSU5dICsgJyknO1xuXG4vLyB0aGlzIG9uZSBoYXMgdG8gdXNlIHRoZSAvZyBmbGFnXG5yZVtDT01QQVJBVE9SVFJJTV0gPSBuZXcgUmVnRXhwKHNyY1tDT01QQVJBVE9SVFJJTV0sICdnJyk7XG52YXIgY29tcGFyYXRvclRyaW1SZXBsYWNlID0gJyQxJDIkMyc7XG5cblxuLy8gU29tZXRoaW5nIGxpa2UgYDEuMi4zIC0gMS4yLjRgXG4vLyBOb3RlIHRoYXQgdGhlc2UgYWxsIHVzZSB0aGUgbG9vc2UgZm9ybSwgYmVjYXVzZSB0aGV5J2xsIGJlXG4vLyBjaGVja2VkIGFnYWluc3QgZWl0aGVyIHRoZSBzdHJpY3Qgb3IgbG9vc2UgY29tcGFyYXRvciBmb3JtXG4vLyBsYXRlci5cbnZhciBIWVBIRU5SQU5HRSA9IFIrKztcbnNyY1tIWVBIRU5SQU5HRV0gPSAnXlxcXFxzKignICsgc3JjW1hSQU5HRVBMQUlOXSArICcpJyArXG4gICAgICAgICAgICAgICAgICAgJ1xcXFxzKy1cXFxccysnICtcbiAgICAgICAgICAgICAgICAgICAnKCcgKyBzcmNbWFJBTkdFUExBSU5dICsgJyknICtcbiAgICAgICAgICAgICAgICAgICAnXFxcXHMqJCc7XG5cbnZhciBIWVBIRU5SQU5HRUxPT1NFID0gUisrO1xuc3JjW0hZUEhFTlJBTkdFTE9PU0VdID0gJ15cXFxccyooJyArIHNyY1tYUkFOR0VQTEFJTkxPT1NFXSArICcpJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnXFxcXHMrLVxcXFxzKycgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJygnICsgc3JjW1hSQU5HRVBMQUlOTE9PU0VdICsgJyknICtcbiAgICAgICAgICAgICAgICAgICAgICAgICdcXFxccyokJztcblxuLy8gU3RhciByYW5nZXMgYmFzaWNhbGx5IGp1c3QgYWxsb3cgYW55dGhpbmcgYXQgYWxsLlxudmFyIFNUQVIgPSBSKys7XG5zcmNbU1RBUl0gPSAnKDx8Pik/PT9cXFxccypcXFxcKic7XG5cbi8vIENvbXBpbGUgdG8gYWN0dWFsIHJlZ2V4cCBvYmplY3RzLlxuLy8gQWxsIGFyZSBmbGFnLWZyZWUsIHVubGVzcyB0aGV5IHdlcmUgY3JlYXRlZCBhYm92ZSB3aXRoIGEgZmxhZy5cbmZvciAodmFyIGkgPSAwOyBpIDwgUjsgaSsrKSB7XG4gIGRlYnVnKGksIHNyY1tpXSk7XG4gIGlmICghcmVbaV0pXG4gICAgcmVbaV0gPSBuZXcgUmVnRXhwKHNyY1tpXSk7XG59XG5cbmV4cG9ydHMucGFyc2UgPSBwYXJzZTtcbmZ1bmN0aW9uIHBhcnNlKHZlcnNpb24sIGxvb3NlKSB7XG4gIGlmICh2ZXJzaW9uIGluc3RhbmNlb2YgU2VtVmVyKVxuICAgIHJldHVybiB2ZXJzaW9uO1xuXG4gIGlmICh0eXBlb2YgdmVyc2lvbiAhPT0gJ3N0cmluZycpXG4gICAgcmV0dXJuIG51bGw7XG5cbiAgaWYgKHZlcnNpb24ubGVuZ3RoID4gTUFYX0xFTkdUSClcbiAgICByZXR1cm4gbnVsbDtcblxuICB2YXIgciA9IGxvb3NlID8gcmVbTE9PU0VdIDogcmVbRlVMTF07XG4gIGlmICghci50ZXN0KHZlcnNpb24pKVxuICAgIHJldHVybiBudWxsO1xuXG4gIHRyeSB7XG4gICAgcmV0dXJuIG5ldyBTZW1WZXIodmVyc2lvbiwgbG9vc2UpO1xuICB9IGNhdGNoIChlcikge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbmV4cG9ydHMudmFsaWQgPSB2YWxpZDtcbmZ1bmN0aW9uIHZhbGlkKHZlcnNpb24sIGxvb3NlKSB7XG4gIHZhciB2ID0gcGFyc2UodmVyc2lvbiwgbG9vc2UpO1xuICByZXR1cm4gdiA/IHYudmVyc2lvbiA6IG51bGw7XG59XG5cblxuZXhwb3J0cy5jbGVhbiA9IGNsZWFuO1xuZnVuY3Rpb24gY2xlYW4odmVyc2lvbiwgbG9vc2UpIHtcbiAgdmFyIHMgPSBwYXJzZSh2ZXJzaW9uLnRyaW0oKS5yZXBsYWNlKC9eWz12XSsvLCAnJyksIGxvb3NlKTtcbiAgcmV0dXJuIHMgPyBzLnZlcnNpb24gOiBudWxsO1xufVxuXG5leHBvcnRzLlNlbVZlciA9IFNlbVZlcjtcblxuZnVuY3Rpb24gU2VtVmVyKHZlcnNpb24sIGxvb3NlKSB7XG4gIGlmICh2ZXJzaW9uIGluc3RhbmNlb2YgU2VtVmVyKSB7XG4gICAgaWYgKHZlcnNpb24ubG9vc2UgPT09IGxvb3NlKVxuICAgICAgcmV0dXJuIHZlcnNpb247XG4gICAgZWxzZVxuICAgICAgdmVyc2lvbiA9IHZlcnNpb24udmVyc2lvbjtcbiAgfSBlbHNlIGlmICh0eXBlb2YgdmVyc2lvbiAhPT0gJ3N0cmluZycpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIFZlcnNpb246ICcgKyB2ZXJzaW9uKTtcbiAgfVxuXG4gIGlmICh2ZXJzaW9uLmxlbmd0aCA+IE1BWF9MRU5HVEgpXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcigndmVyc2lvbiBpcyBsb25nZXIgdGhhbiAnICsgTUFYX0xFTkdUSCArICcgY2hhcmFjdGVycycpXG5cbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIFNlbVZlcikpXG4gICAgcmV0dXJuIG5ldyBTZW1WZXIodmVyc2lvbiwgbG9vc2UpO1xuXG4gIGRlYnVnKCdTZW1WZXInLCB2ZXJzaW9uLCBsb29zZSk7XG4gIHRoaXMubG9vc2UgPSBsb29zZTtcbiAgdmFyIG0gPSB2ZXJzaW9uLnRyaW0oKS5tYXRjaChsb29zZSA/IHJlW0xPT1NFXSA6IHJlW0ZVTExdKTtcblxuICBpZiAoIW0pXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBWZXJzaW9uOiAnICsgdmVyc2lvbik7XG5cbiAgdGhpcy5yYXcgPSB2ZXJzaW9uO1xuXG4gIC8vIHRoZXNlIGFyZSBhY3R1YWxseSBudW1iZXJzXG4gIHRoaXMubWFqb3IgPSArbVsxXTtcbiAgdGhpcy5taW5vciA9ICttWzJdO1xuICB0aGlzLnBhdGNoID0gK21bM107XG5cbiAgaWYgKHRoaXMubWFqb3IgPiBNQVhfU0FGRV9JTlRFR0VSIHx8IHRoaXMubWFqb3IgPCAwKVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgbWFqb3IgdmVyc2lvbicpXG5cbiAgaWYgKHRoaXMubWlub3IgPiBNQVhfU0FGRV9JTlRFR0VSIHx8IHRoaXMubWlub3IgPCAwKVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgbWlub3IgdmVyc2lvbicpXG5cbiAgaWYgKHRoaXMucGF0Y2ggPiBNQVhfU0FGRV9JTlRFR0VSIHx8IHRoaXMucGF0Y2ggPCAwKVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgcGF0Y2ggdmVyc2lvbicpXG5cbiAgLy8gbnVtYmVyaWZ5IGFueSBwcmVyZWxlYXNlIG51bWVyaWMgaWRzXG4gIGlmICghbVs0XSlcbiAgICB0aGlzLnByZXJlbGVhc2UgPSBbXTtcbiAgZWxzZVxuICAgIHRoaXMucHJlcmVsZWFzZSA9IG1bNF0uc3BsaXQoJy4nKS5tYXAoZnVuY3Rpb24oaWQpIHtcbiAgICAgIGlmICgvXlswLTldKyQvLnRlc3QoaWQpKSB7XG4gICAgICAgIHZhciBudW0gPSAraWQ7XG4gICAgICAgIGlmIChudW0gPj0gMCAmJiBudW0gPCBNQVhfU0FGRV9JTlRFR0VSKVxuICAgICAgICAgIHJldHVybiBudW07XG4gICAgICB9XG4gICAgICByZXR1cm4gaWQ7XG4gICAgfSk7XG5cbiAgdGhpcy5idWlsZCA9IG1bNV0gPyBtWzVdLnNwbGl0KCcuJykgOiBbXTtcbiAgdGhpcy5mb3JtYXQoKTtcbn1cblxuU2VtVmVyLnByb3RvdHlwZS5mb3JtYXQgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy52ZXJzaW9uID0gdGhpcy5tYWpvciArICcuJyArIHRoaXMubWlub3IgKyAnLicgKyB0aGlzLnBhdGNoO1xuICBpZiAodGhpcy5wcmVyZWxlYXNlLmxlbmd0aClcbiAgICB0aGlzLnZlcnNpb24gKz0gJy0nICsgdGhpcy5wcmVyZWxlYXNlLmpvaW4oJy4nKTtcbiAgcmV0dXJuIHRoaXMudmVyc2lvbjtcbn07XG5cblNlbVZlci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMudmVyc2lvbjtcbn07XG5cblNlbVZlci5wcm90b3R5cGUuY29tcGFyZSA9IGZ1bmN0aW9uKG90aGVyKSB7XG4gIGRlYnVnKCdTZW1WZXIuY29tcGFyZScsIHRoaXMudmVyc2lvbiwgdGhpcy5sb29zZSwgb3RoZXIpO1xuICBpZiAoIShvdGhlciBpbnN0YW5jZW9mIFNlbVZlcikpXG4gICAgb3RoZXIgPSBuZXcgU2VtVmVyKG90aGVyLCB0aGlzLmxvb3NlKTtcblxuICByZXR1cm4gdGhpcy5jb21wYXJlTWFpbihvdGhlcikgfHwgdGhpcy5jb21wYXJlUHJlKG90aGVyKTtcbn07XG5cblNlbVZlci5wcm90b3R5cGUuY29tcGFyZU1haW4gPSBmdW5jdGlvbihvdGhlcikge1xuICBpZiAoIShvdGhlciBpbnN0YW5jZW9mIFNlbVZlcikpXG4gICAgb3RoZXIgPSBuZXcgU2VtVmVyKG90aGVyLCB0aGlzLmxvb3NlKTtcblxuICByZXR1cm4gY29tcGFyZUlkZW50aWZpZXJzKHRoaXMubWFqb3IsIG90aGVyLm1ham9yKSB8fFxuICAgICAgICAgY29tcGFyZUlkZW50aWZpZXJzKHRoaXMubWlub3IsIG90aGVyLm1pbm9yKSB8fFxuICAgICAgICAgY29tcGFyZUlkZW50aWZpZXJzKHRoaXMucGF0Y2gsIG90aGVyLnBhdGNoKTtcbn07XG5cblNlbVZlci5wcm90b3R5cGUuY29tcGFyZVByZSA9IGZ1bmN0aW9uKG90aGVyKSB7XG4gIGlmICghKG90aGVyIGluc3RhbmNlb2YgU2VtVmVyKSlcbiAgICBvdGhlciA9IG5ldyBTZW1WZXIob3RoZXIsIHRoaXMubG9vc2UpO1xuXG4gIC8vIE5PVCBoYXZpbmcgYSBwcmVyZWxlYXNlIGlzID4gaGF2aW5nIG9uZVxuICBpZiAodGhpcy5wcmVyZWxlYXNlLmxlbmd0aCAmJiAhb3RoZXIucHJlcmVsZWFzZS5sZW5ndGgpXG4gICAgcmV0dXJuIC0xO1xuICBlbHNlIGlmICghdGhpcy5wcmVyZWxlYXNlLmxlbmd0aCAmJiBvdGhlci5wcmVyZWxlYXNlLmxlbmd0aClcbiAgICByZXR1cm4gMTtcbiAgZWxzZSBpZiAoIXRoaXMucHJlcmVsZWFzZS5sZW5ndGggJiYgIW90aGVyLnByZXJlbGVhc2UubGVuZ3RoKVxuICAgIHJldHVybiAwO1xuXG4gIHZhciBpID0gMDtcbiAgZG8ge1xuICAgIHZhciBhID0gdGhpcy5wcmVyZWxlYXNlW2ldO1xuICAgIHZhciBiID0gb3RoZXIucHJlcmVsZWFzZVtpXTtcbiAgICBkZWJ1ZygncHJlcmVsZWFzZSBjb21wYXJlJywgaSwgYSwgYik7XG4gICAgaWYgKGEgPT09IHVuZGVmaW5lZCAmJiBiID09PSB1bmRlZmluZWQpXG4gICAgICByZXR1cm4gMDtcbiAgICBlbHNlIGlmIChiID09PSB1bmRlZmluZWQpXG4gICAgICByZXR1cm4gMTtcbiAgICBlbHNlIGlmIChhID09PSB1bmRlZmluZWQpXG4gICAgICByZXR1cm4gLTE7XG4gICAgZWxzZSBpZiAoYSA9PT0gYilcbiAgICAgIGNvbnRpbnVlO1xuICAgIGVsc2VcbiAgICAgIHJldHVybiBjb21wYXJlSWRlbnRpZmllcnMoYSwgYik7XG4gIH0gd2hpbGUgKCsraSk7XG59O1xuXG4vLyBwcmVtaW5vciB3aWxsIGJ1bXAgdGhlIHZlcnNpb24gdXAgdG8gdGhlIG5leHQgbWlub3IgcmVsZWFzZSwgYW5kIGltbWVkaWF0ZWx5XG4vLyBkb3duIHRvIHByZS1yZWxlYXNlLiBwcmVtYWpvciBhbmQgcHJlcGF0Y2ggd29yayB0aGUgc2FtZSB3YXkuXG5TZW1WZXIucHJvdG90eXBlLmluYyA9IGZ1bmN0aW9uKHJlbGVhc2UsIGlkZW50aWZpZXIpIHtcbiAgc3dpdGNoIChyZWxlYXNlKSB7XG4gICAgY2FzZSAncHJlbWFqb3InOlxuICAgICAgdGhpcy5wcmVyZWxlYXNlLmxlbmd0aCA9IDA7XG4gICAgICB0aGlzLnBhdGNoID0gMDtcbiAgICAgIHRoaXMubWlub3IgPSAwO1xuICAgICAgdGhpcy5tYWpvcisrO1xuICAgICAgdGhpcy5pbmMoJ3ByZScsIGlkZW50aWZpZXIpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncHJlbWlub3InOlxuICAgICAgdGhpcy5wcmVyZWxlYXNlLmxlbmd0aCA9IDA7XG4gICAgICB0aGlzLnBhdGNoID0gMDtcbiAgICAgIHRoaXMubWlub3IrKztcbiAgICAgIHRoaXMuaW5jKCdwcmUnLCBpZGVudGlmaWVyKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3ByZXBhdGNoJzpcbiAgICAgIC8vIElmIHRoaXMgaXMgYWxyZWFkeSBhIHByZXJlbGVhc2UsIGl0IHdpbGwgYnVtcCB0byB0aGUgbmV4dCB2ZXJzaW9uXG4gICAgICAvLyBkcm9wIGFueSBwcmVyZWxlYXNlcyB0aGF0IG1pZ2h0IGFscmVhZHkgZXhpc3QsIHNpbmNlIHRoZXkgYXJlIG5vdFxuICAgICAgLy8gcmVsZXZhbnQgYXQgdGhpcyBwb2ludC5cbiAgICAgIHRoaXMucHJlcmVsZWFzZS5sZW5ndGggPSAwO1xuICAgICAgdGhpcy5pbmMoJ3BhdGNoJywgaWRlbnRpZmllcik7XG4gICAgICB0aGlzLmluYygncHJlJywgaWRlbnRpZmllcik7XG4gICAgICBicmVhaztcbiAgICAvLyBJZiB0aGUgaW5wdXQgaXMgYSBub24tcHJlcmVsZWFzZSB2ZXJzaW9uLCB0aGlzIGFjdHMgdGhlIHNhbWUgYXNcbiAgICAvLyBwcmVwYXRjaC5cbiAgICBjYXNlICdwcmVyZWxlYXNlJzpcbiAgICAgIGlmICh0aGlzLnByZXJlbGVhc2UubGVuZ3RoID09PSAwKVxuICAgICAgICB0aGlzLmluYygncGF0Y2gnLCBpZGVudGlmaWVyKTtcbiAgICAgIHRoaXMuaW5jKCdwcmUnLCBpZGVudGlmaWVyKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAnbWFqb3InOlxuICAgICAgLy8gSWYgdGhpcyBpcyBhIHByZS1tYWpvciB2ZXJzaW9uLCBidW1wIHVwIHRvIHRoZSBzYW1lIG1ham9yIHZlcnNpb24uXG4gICAgICAvLyBPdGhlcndpc2UgaW5jcmVtZW50IG1ham9yLlxuICAgICAgLy8gMS4wLjAtNSBidW1wcyB0byAxLjAuMFxuICAgICAgLy8gMS4xLjAgYnVtcHMgdG8gMi4wLjBcbiAgICAgIGlmICh0aGlzLm1pbm9yICE9PSAwIHx8IHRoaXMucGF0Y2ggIT09IDAgfHwgdGhpcy5wcmVyZWxlYXNlLmxlbmd0aCA9PT0gMClcbiAgICAgICAgdGhpcy5tYWpvcisrO1xuICAgICAgdGhpcy5taW5vciA9IDA7XG4gICAgICB0aGlzLnBhdGNoID0gMDtcbiAgICAgIHRoaXMucHJlcmVsZWFzZSA9IFtdO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnbWlub3InOlxuICAgICAgLy8gSWYgdGhpcyBpcyBhIHByZS1taW5vciB2ZXJzaW9uLCBidW1wIHVwIHRvIHRoZSBzYW1lIG1pbm9yIHZlcnNpb24uXG4gICAgICAvLyBPdGhlcndpc2UgaW5jcmVtZW50IG1pbm9yLlxuICAgICAgLy8gMS4yLjAtNSBidW1wcyB0byAxLjIuMFxuICAgICAgLy8gMS4yLjEgYnVtcHMgdG8gMS4zLjBcbiAgICAgIGlmICh0aGlzLnBhdGNoICE9PSAwIHx8IHRoaXMucHJlcmVsZWFzZS5sZW5ndGggPT09IDApXG4gICAgICAgIHRoaXMubWlub3IrKztcbiAgICAgIHRoaXMucGF0Y2ggPSAwO1xuICAgICAgdGhpcy5wcmVyZWxlYXNlID0gW107XG4gICAgICBicmVhaztcbiAgICBjYXNlICdwYXRjaCc6XG4gICAgICAvLyBJZiB0aGlzIGlzIG5vdCBhIHByZS1yZWxlYXNlIHZlcnNpb24sIGl0IHdpbGwgaW5jcmVtZW50IHRoZSBwYXRjaC5cbiAgICAgIC8vIElmIGl0IGlzIGEgcHJlLXJlbGVhc2UgaXQgd2lsbCBidW1wIHVwIHRvIHRoZSBzYW1lIHBhdGNoIHZlcnNpb24uXG4gICAgICAvLyAxLjIuMC01IHBhdGNoZXMgdG8gMS4yLjBcbiAgICAgIC8vIDEuMi4wIHBhdGNoZXMgdG8gMS4yLjFcbiAgICAgIGlmICh0aGlzLnByZXJlbGVhc2UubGVuZ3RoID09PSAwKVxuICAgICAgICB0aGlzLnBhdGNoKys7XG4gICAgICB0aGlzLnByZXJlbGVhc2UgPSBbXTtcbiAgICAgIGJyZWFrO1xuICAgIC8vIFRoaXMgcHJvYmFibHkgc2hvdWxkbid0IGJlIHVzZWQgcHVibGljbHkuXG4gICAgLy8gMS4wLjAgXCJwcmVcIiB3b3VsZCBiZWNvbWUgMS4wLjAtMCB3aGljaCBpcyB0aGUgd3JvbmcgZGlyZWN0aW9uLlxuICAgIGNhc2UgJ3ByZSc6XG4gICAgICBpZiAodGhpcy5wcmVyZWxlYXNlLmxlbmd0aCA9PT0gMClcbiAgICAgICAgdGhpcy5wcmVyZWxlYXNlID0gWzBdO1xuICAgICAgZWxzZSB7XG4gICAgICAgIHZhciBpID0gdGhpcy5wcmVyZWxlYXNlLmxlbmd0aDtcbiAgICAgICAgd2hpbGUgKC0taSA+PSAwKSB7XG4gICAgICAgICAgaWYgKHR5cGVvZiB0aGlzLnByZXJlbGVhc2VbaV0gPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICB0aGlzLnByZXJlbGVhc2VbaV0rKztcbiAgICAgICAgICAgIGkgPSAtMjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGkgPT09IC0xKSAvLyBkaWRuJ3QgaW5jcmVtZW50IGFueXRoaW5nXG4gICAgICAgICAgdGhpcy5wcmVyZWxlYXNlLnB1c2goMCk7XG4gICAgICB9XG4gICAgICBpZiAoaWRlbnRpZmllcikge1xuICAgICAgICAvLyAxLjIuMC1iZXRhLjEgYnVtcHMgdG8gMS4yLjAtYmV0YS4yLFxuICAgICAgICAvLyAxLjIuMC1iZXRhLmZvb2JseiBvciAxLjIuMC1iZXRhIGJ1bXBzIHRvIDEuMi4wLWJldGEuMFxuICAgICAgICBpZiAodGhpcy5wcmVyZWxlYXNlWzBdID09PSBpZGVudGlmaWVyKSB7XG4gICAgICAgICAgaWYgKGlzTmFOKHRoaXMucHJlcmVsZWFzZVsxXSkpXG4gICAgICAgICAgICB0aGlzLnByZXJlbGVhc2UgPSBbaWRlbnRpZmllciwgMF07XG4gICAgICAgIH0gZWxzZVxuICAgICAgICAgIHRoaXMucHJlcmVsZWFzZSA9IFtpZGVudGlmaWVyLCAwXTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBpbmNyZW1lbnQgYXJndW1lbnQ6ICcgKyByZWxlYXNlKTtcbiAgfVxuICB0aGlzLmZvcm1hdCgpO1xuICB0aGlzLnJhdyA9IHRoaXMudmVyc2lvbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5leHBvcnRzLmluYyA9IGluYztcbmZ1bmN0aW9uIGluYyh2ZXJzaW9uLCByZWxlYXNlLCBsb29zZSwgaWRlbnRpZmllcikge1xuICBpZiAodHlwZW9mKGxvb3NlKSA9PT0gJ3N0cmluZycpIHtcbiAgICBpZGVudGlmaWVyID0gbG9vc2U7XG4gICAgbG9vc2UgPSB1bmRlZmluZWQ7XG4gIH1cblxuICB0cnkge1xuICAgIHJldHVybiBuZXcgU2VtVmVyKHZlcnNpb24sIGxvb3NlKS5pbmMocmVsZWFzZSwgaWRlbnRpZmllcikudmVyc2lvbjtcbiAgfSBjYXRjaCAoZXIpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG5leHBvcnRzLmRpZmYgPSBkaWZmO1xuZnVuY3Rpb24gZGlmZih2ZXJzaW9uMSwgdmVyc2lvbjIpIHtcbiAgaWYgKGVxKHZlcnNpb24xLCB2ZXJzaW9uMikpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfSBlbHNlIHtcbiAgICB2YXIgdjEgPSBwYXJzZSh2ZXJzaW9uMSk7XG4gICAgdmFyIHYyID0gcGFyc2UodmVyc2lvbjIpO1xuICAgIGlmICh2MS5wcmVyZWxlYXNlLmxlbmd0aCB8fCB2Mi5wcmVyZWxlYXNlLmxlbmd0aCkge1xuICAgICAgZm9yICh2YXIga2V5IGluIHYxKSB7XG4gICAgICAgIGlmIChrZXkgPT09ICdtYWpvcicgfHwga2V5ID09PSAnbWlub3InIHx8IGtleSA9PT0gJ3BhdGNoJykge1xuICAgICAgICAgIGlmICh2MVtrZXldICE9PSB2MltrZXldKSB7XG4gICAgICAgICAgICByZXR1cm4gJ3ByZScra2V5O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuICdwcmVyZWxlYXNlJztcbiAgICB9XG4gICAgZm9yICh2YXIga2V5IGluIHYxKSB7XG4gICAgICBpZiAoa2V5ID09PSAnbWFqb3InIHx8IGtleSA9PT0gJ21pbm9yJyB8fCBrZXkgPT09ICdwYXRjaCcpIHtcbiAgICAgICAgaWYgKHYxW2tleV0gIT09IHYyW2tleV0pIHtcbiAgICAgICAgICByZXR1cm4ga2V5O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydHMuY29tcGFyZUlkZW50aWZpZXJzID0gY29tcGFyZUlkZW50aWZpZXJzO1xuXG52YXIgbnVtZXJpYyA9IC9eWzAtOV0rJC87XG5mdW5jdGlvbiBjb21wYXJlSWRlbnRpZmllcnMoYSwgYikge1xuICB2YXIgYW51bSA9IG51bWVyaWMudGVzdChhKTtcbiAgdmFyIGJudW0gPSBudW1lcmljLnRlc3QoYik7XG5cbiAgaWYgKGFudW0gJiYgYm51bSkge1xuICAgIGEgPSArYTtcbiAgICBiID0gK2I7XG4gIH1cblxuICByZXR1cm4gKGFudW0gJiYgIWJudW0pID8gLTEgOlxuICAgICAgICAgKGJudW0gJiYgIWFudW0pID8gMSA6XG4gICAgICAgICBhIDwgYiA/IC0xIDpcbiAgICAgICAgIGEgPiBiID8gMSA6XG4gICAgICAgICAwO1xufVxuXG5leHBvcnRzLnJjb21wYXJlSWRlbnRpZmllcnMgPSByY29tcGFyZUlkZW50aWZpZXJzO1xuZnVuY3Rpb24gcmNvbXBhcmVJZGVudGlmaWVycyhhLCBiKSB7XG4gIHJldHVybiBjb21wYXJlSWRlbnRpZmllcnMoYiwgYSk7XG59XG5cbmV4cG9ydHMubWFqb3IgPSBtYWpvcjtcbmZ1bmN0aW9uIG1ham9yKGEsIGxvb3NlKSB7XG4gIHJldHVybiBuZXcgU2VtVmVyKGEsIGxvb3NlKS5tYWpvcjtcbn1cblxuZXhwb3J0cy5taW5vciA9IG1pbm9yO1xuZnVuY3Rpb24gbWlub3IoYSwgbG9vc2UpIHtcbiAgcmV0dXJuIG5ldyBTZW1WZXIoYSwgbG9vc2UpLm1pbm9yO1xufVxuXG5leHBvcnRzLnBhdGNoID0gcGF0Y2g7XG5mdW5jdGlvbiBwYXRjaChhLCBsb29zZSkge1xuICByZXR1cm4gbmV3IFNlbVZlcihhLCBsb29zZSkucGF0Y2g7XG59XG5cbmV4cG9ydHMuY29tcGFyZSA9IGNvbXBhcmU7XG5mdW5jdGlvbiBjb21wYXJlKGEsIGIsIGxvb3NlKSB7XG4gIHJldHVybiBuZXcgU2VtVmVyKGEsIGxvb3NlKS5jb21wYXJlKG5ldyBTZW1WZXIoYiwgbG9vc2UpKTtcbn1cblxuZXhwb3J0cy5jb21wYXJlTG9vc2UgPSBjb21wYXJlTG9vc2U7XG5mdW5jdGlvbiBjb21wYXJlTG9vc2UoYSwgYikge1xuICByZXR1cm4gY29tcGFyZShhLCBiLCB0cnVlKTtcbn1cblxuZXhwb3J0cy5yY29tcGFyZSA9IHJjb21wYXJlO1xuZnVuY3Rpb24gcmNvbXBhcmUoYSwgYiwgbG9vc2UpIHtcbiAgcmV0dXJuIGNvbXBhcmUoYiwgYSwgbG9vc2UpO1xufVxuXG5leHBvcnRzLnNvcnQgPSBzb3J0O1xuZnVuY3Rpb24gc29ydChsaXN0LCBsb29zZSkge1xuICByZXR1cm4gbGlzdC5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICByZXR1cm4gZXhwb3J0cy5jb21wYXJlKGEsIGIsIGxvb3NlKTtcbiAgfSk7XG59XG5cbmV4cG9ydHMucnNvcnQgPSByc29ydDtcbmZ1bmN0aW9uIHJzb3J0KGxpc3QsIGxvb3NlKSB7XG4gIHJldHVybiBsaXN0LnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgIHJldHVybiBleHBvcnRzLnJjb21wYXJlKGEsIGIsIGxvb3NlKTtcbiAgfSk7XG59XG5cbmV4cG9ydHMuZ3QgPSBndDtcbmZ1bmN0aW9uIGd0KGEsIGIsIGxvb3NlKSB7XG4gIHJldHVybiBjb21wYXJlKGEsIGIsIGxvb3NlKSA+IDA7XG59XG5cbmV4cG9ydHMubHQgPSBsdDtcbmZ1bmN0aW9uIGx0KGEsIGIsIGxvb3NlKSB7XG4gIHJldHVybiBjb21wYXJlKGEsIGIsIGxvb3NlKSA8IDA7XG59XG5cbmV4cG9ydHMuZXEgPSBlcTtcbmZ1bmN0aW9uIGVxKGEsIGIsIGxvb3NlKSB7XG4gIHJldHVybiBjb21wYXJlKGEsIGIsIGxvb3NlKSA9PT0gMDtcbn1cblxuZXhwb3J0cy5uZXEgPSBuZXE7XG5mdW5jdGlvbiBuZXEoYSwgYiwgbG9vc2UpIHtcbiAgcmV0dXJuIGNvbXBhcmUoYSwgYiwgbG9vc2UpICE9PSAwO1xufVxuXG5leHBvcnRzLmd0ZSA9IGd0ZTtcbmZ1bmN0aW9uIGd0ZShhLCBiLCBsb29zZSkge1xuICByZXR1cm4gY29tcGFyZShhLCBiLCBsb29zZSkgPj0gMDtcbn1cblxuZXhwb3J0cy5sdGUgPSBsdGU7XG5mdW5jdGlvbiBsdGUoYSwgYiwgbG9vc2UpIHtcbiAgcmV0dXJuIGNvbXBhcmUoYSwgYiwgbG9vc2UpIDw9IDA7XG59XG5cbmV4cG9ydHMuY21wID0gY21wO1xuZnVuY3Rpb24gY21wKGEsIG9wLCBiLCBsb29zZSkge1xuICB2YXIgcmV0O1xuICBzd2l0Y2ggKG9wKSB7XG4gICAgY2FzZSAnPT09JzpcbiAgICAgIGlmICh0eXBlb2YgYSA9PT0gJ29iamVjdCcpIGEgPSBhLnZlcnNpb247XG4gICAgICBpZiAodHlwZW9mIGIgPT09ICdvYmplY3QnKSBiID0gYi52ZXJzaW9uO1xuICAgICAgcmV0ID0gYSA9PT0gYjtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJyE9PSc6XG4gICAgICBpZiAodHlwZW9mIGEgPT09ICdvYmplY3QnKSBhID0gYS52ZXJzaW9uO1xuICAgICAgaWYgKHR5cGVvZiBiID09PSAnb2JqZWN0JykgYiA9IGIudmVyc2lvbjtcbiAgICAgIHJldCA9IGEgIT09IGI7XG4gICAgICBicmVhaztcbiAgICBjYXNlICcnOiBjYXNlICc9JzogY2FzZSAnPT0nOiByZXQgPSBlcShhLCBiLCBsb29zZSk7IGJyZWFrO1xuICAgIGNhc2UgJyE9JzogcmV0ID0gbmVxKGEsIGIsIGxvb3NlKTsgYnJlYWs7XG4gICAgY2FzZSAnPic6IHJldCA9IGd0KGEsIGIsIGxvb3NlKTsgYnJlYWs7XG4gICAgY2FzZSAnPj0nOiByZXQgPSBndGUoYSwgYiwgbG9vc2UpOyBicmVhaztcbiAgICBjYXNlICc8JzogcmV0ID0gbHQoYSwgYiwgbG9vc2UpOyBicmVhaztcbiAgICBjYXNlICc8PSc6IHJldCA9IGx0ZShhLCBiLCBsb29zZSk7IGJyZWFrO1xuICAgIGRlZmF1bHQ6IHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgb3BlcmF0b3I6ICcgKyBvcCk7XG4gIH1cbiAgcmV0dXJuIHJldDtcbn1cblxuZXhwb3J0cy5Db21wYXJhdG9yID0gQ29tcGFyYXRvcjtcbmZ1bmN0aW9uIENvbXBhcmF0b3IoY29tcCwgbG9vc2UpIHtcbiAgaWYgKGNvbXAgaW5zdGFuY2VvZiBDb21wYXJhdG9yKSB7XG4gICAgaWYgKGNvbXAubG9vc2UgPT09IGxvb3NlKVxuICAgICAgcmV0dXJuIGNvbXA7XG4gICAgZWxzZVxuICAgICAgY29tcCA9IGNvbXAudmFsdWU7XG4gIH1cblxuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgQ29tcGFyYXRvcikpXG4gICAgcmV0dXJuIG5ldyBDb21wYXJhdG9yKGNvbXAsIGxvb3NlKTtcblxuICBkZWJ1ZygnY29tcGFyYXRvcicsIGNvbXAsIGxvb3NlKTtcbiAgdGhpcy5sb29zZSA9IGxvb3NlO1xuICB0aGlzLnBhcnNlKGNvbXApO1xuXG4gIGlmICh0aGlzLnNlbXZlciA9PT0gQU5ZKVxuICAgIHRoaXMudmFsdWUgPSAnJztcbiAgZWxzZVxuICAgIHRoaXMudmFsdWUgPSB0aGlzLm9wZXJhdG9yICsgdGhpcy5zZW12ZXIudmVyc2lvbjtcblxuICBkZWJ1ZygnY29tcCcsIHRoaXMpO1xufVxuXG52YXIgQU5ZID0ge307XG5Db21wYXJhdG9yLnByb3RvdHlwZS5wYXJzZSA9IGZ1bmN0aW9uKGNvbXApIHtcbiAgdmFyIHIgPSB0aGlzLmxvb3NlID8gcmVbQ09NUEFSQVRPUkxPT1NFXSA6IHJlW0NPTVBBUkFUT1JdO1xuICB2YXIgbSA9IGNvbXAubWF0Y2gocik7XG5cbiAgaWYgKCFtKVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgY29tcGFyYXRvcjogJyArIGNvbXApO1xuXG4gIHRoaXMub3BlcmF0b3IgPSBtWzFdO1xuICBpZiAodGhpcy5vcGVyYXRvciA9PT0gJz0nKVxuICAgIHRoaXMub3BlcmF0b3IgPSAnJztcblxuICAvLyBpZiBpdCBsaXRlcmFsbHkgaXMganVzdCAnPicgb3IgJycgdGhlbiBhbGxvdyBhbnl0aGluZy5cbiAgaWYgKCFtWzJdKVxuICAgIHRoaXMuc2VtdmVyID0gQU5ZO1xuICBlbHNlXG4gICAgdGhpcy5zZW12ZXIgPSBuZXcgU2VtVmVyKG1bMl0sIHRoaXMubG9vc2UpO1xufTtcblxuQ29tcGFyYXRvci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMudmFsdWU7XG59O1xuXG5Db21wYXJhdG9yLnByb3RvdHlwZS50ZXN0ID0gZnVuY3Rpb24odmVyc2lvbikge1xuICBkZWJ1ZygnQ29tcGFyYXRvci50ZXN0JywgdmVyc2lvbiwgdGhpcy5sb29zZSk7XG5cbiAgaWYgKHRoaXMuc2VtdmVyID09PSBBTlkpXG4gICAgcmV0dXJuIHRydWU7XG5cbiAgaWYgKHR5cGVvZiB2ZXJzaW9uID09PSAnc3RyaW5nJylcbiAgICB2ZXJzaW9uID0gbmV3IFNlbVZlcih2ZXJzaW9uLCB0aGlzLmxvb3NlKTtcblxuICByZXR1cm4gY21wKHZlcnNpb24sIHRoaXMub3BlcmF0b3IsIHRoaXMuc2VtdmVyLCB0aGlzLmxvb3NlKTtcbn07XG5cbkNvbXBhcmF0b3IucHJvdG90eXBlLmludGVyc2VjdHMgPSBmdW5jdGlvbihjb21wLCBsb29zZSkge1xuICBpZiAoIShjb21wIGluc3RhbmNlb2YgQ29tcGFyYXRvcikpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdhIENvbXBhcmF0b3IgaXMgcmVxdWlyZWQnKTtcbiAgfVxuXG4gIHZhciByYW5nZVRtcDtcblxuICBpZiAodGhpcy5vcGVyYXRvciA9PT0gJycpIHtcbiAgICByYW5nZVRtcCA9IG5ldyBSYW5nZShjb21wLnZhbHVlLCBsb29zZSk7XG4gICAgcmV0dXJuIHNhdGlzZmllcyh0aGlzLnZhbHVlLCByYW5nZVRtcCwgbG9vc2UpO1xuICB9IGVsc2UgaWYgKGNvbXAub3BlcmF0b3IgPT09ICcnKSB7XG4gICAgcmFuZ2VUbXAgPSBuZXcgUmFuZ2UodGhpcy52YWx1ZSwgbG9vc2UpO1xuICAgIHJldHVybiBzYXRpc2ZpZXMoY29tcC5zZW12ZXIsIHJhbmdlVG1wLCBsb29zZSk7XG4gIH1cblxuICB2YXIgc2FtZURpcmVjdGlvbkluY3JlYXNpbmcgPVxuICAgICh0aGlzLm9wZXJhdG9yID09PSAnPj0nIHx8IHRoaXMub3BlcmF0b3IgPT09ICc+JykgJiZcbiAgICAoY29tcC5vcGVyYXRvciA9PT0gJz49JyB8fCBjb21wLm9wZXJhdG9yID09PSAnPicpO1xuICB2YXIgc2FtZURpcmVjdGlvbkRlY3JlYXNpbmcgPVxuICAgICh0aGlzLm9wZXJhdG9yID09PSAnPD0nIHx8IHRoaXMub3BlcmF0b3IgPT09ICc8JykgJiZcbiAgICAoY29tcC5vcGVyYXRvciA9PT0gJzw9JyB8fCBjb21wLm9wZXJhdG9yID09PSAnPCcpO1xuICB2YXIgc2FtZVNlbVZlciA9IHRoaXMuc2VtdmVyLnZlcnNpb24gPT09IGNvbXAuc2VtdmVyLnZlcnNpb247XG4gIHZhciBkaWZmZXJlbnREaXJlY3Rpb25zSW5jbHVzaXZlID1cbiAgICAodGhpcy5vcGVyYXRvciA9PT0gJz49JyB8fCB0aGlzLm9wZXJhdG9yID09PSAnPD0nKSAmJlxuICAgIChjb21wLm9wZXJhdG9yID09PSAnPj0nIHx8IGNvbXAub3BlcmF0b3IgPT09ICc8PScpO1xuICB2YXIgb3Bwb3NpdGVEaXJlY3Rpb25zTGVzc1RoYW4gPVxuICAgIGNtcCh0aGlzLnNlbXZlciwgJzwnLCBjb21wLnNlbXZlciwgbG9vc2UpICYmXG4gICAgKCh0aGlzLm9wZXJhdG9yID09PSAnPj0nIHx8IHRoaXMub3BlcmF0b3IgPT09ICc+JykgJiZcbiAgICAoY29tcC5vcGVyYXRvciA9PT0gJzw9JyB8fCBjb21wLm9wZXJhdG9yID09PSAnPCcpKTtcbiAgdmFyIG9wcG9zaXRlRGlyZWN0aW9uc0dyZWF0ZXJUaGFuID1cbiAgICBjbXAodGhpcy5zZW12ZXIsICc+JywgY29tcC5zZW12ZXIsIGxvb3NlKSAmJlxuICAgICgodGhpcy5vcGVyYXRvciA9PT0gJzw9JyB8fCB0aGlzLm9wZXJhdG9yID09PSAnPCcpICYmXG4gICAgKGNvbXAub3BlcmF0b3IgPT09ICc+PScgfHwgY29tcC5vcGVyYXRvciA9PT0gJz4nKSk7XG5cbiAgcmV0dXJuIHNhbWVEaXJlY3Rpb25JbmNyZWFzaW5nIHx8IHNhbWVEaXJlY3Rpb25EZWNyZWFzaW5nIHx8XG4gICAgKHNhbWVTZW1WZXIgJiYgZGlmZmVyZW50RGlyZWN0aW9uc0luY2x1c2l2ZSkgfHxcbiAgICBvcHBvc2l0ZURpcmVjdGlvbnNMZXNzVGhhbiB8fCBvcHBvc2l0ZURpcmVjdGlvbnNHcmVhdGVyVGhhbjtcbn07XG5cblxuZXhwb3J0cy5SYW5nZSA9IFJhbmdlO1xuZnVuY3Rpb24gUmFuZ2UocmFuZ2UsIGxvb3NlKSB7XG4gIGlmIChyYW5nZSBpbnN0YW5jZW9mIFJhbmdlKSB7XG4gICAgaWYgKHJhbmdlLmxvb3NlID09PSBsb29zZSkge1xuICAgICAgcmV0dXJuIHJhbmdlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbmV3IFJhbmdlKHJhbmdlLnJhdywgbG9vc2UpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChyYW5nZSBpbnN0YW5jZW9mIENvbXBhcmF0b3IpIHtcbiAgICByZXR1cm4gbmV3IFJhbmdlKHJhbmdlLnZhbHVlLCBsb29zZSk7XG4gIH1cblxuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgUmFuZ2UpKVxuICAgIHJldHVybiBuZXcgUmFuZ2UocmFuZ2UsIGxvb3NlKTtcblxuICB0aGlzLmxvb3NlID0gbG9vc2U7XG5cbiAgLy8gRmlyc3QsIHNwbGl0IGJhc2VkIG9uIGJvb2xlYW4gb3IgfHxcbiAgdGhpcy5yYXcgPSByYW5nZTtcbiAgdGhpcy5zZXQgPSByYW5nZS5zcGxpdCgvXFxzKlxcfFxcfFxccyovKS5tYXAoZnVuY3Rpb24ocmFuZ2UpIHtcbiAgICByZXR1cm4gdGhpcy5wYXJzZVJhbmdlKHJhbmdlLnRyaW0oKSk7XG4gIH0sIHRoaXMpLmZpbHRlcihmdW5jdGlvbihjKSB7XG4gICAgLy8gdGhyb3cgb3V0IGFueSB0aGF0IGFyZSBub3QgcmVsZXZhbnQgZm9yIHdoYXRldmVyIHJlYXNvblxuICAgIHJldHVybiBjLmxlbmd0aDtcbiAgfSk7XG5cbiAgaWYgKCF0aGlzLnNldC5sZW5ndGgpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIFNlbVZlciBSYW5nZTogJyArIHJhbmdlKTtcbiAgfVxuXG4gIHRoaXMuZm9ybWF0KCk7XG59XG5cblJhbmdlLnByb3RvdHlwZS5mb3JtYXQgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5yYW5nZSA9IHRoaXMuc2V0Lm1hcChmdW5jdGlvbihjb21wcykge1xuICAgIHJldHVybiBjb21wcy5qb2luKCcgJykudHJpbSgpO1xuICB9KS5qb2luKCd8fCcpLnRyaW0oKTtcbiAgcmV0dXJuIHRoaXMucmFuZ2U7XG59O1xuXG5SYW5nZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMucmFuZ2U7XG59O1xuXG5SYW5nZS5wcm90b3R5cGUucGFyc2VSYW5nZSA9IGZ1bmN0aW9uKHJhbmdlKSB7XG4gIHZhciBsb29zZSA9IHRoaXMubG9vc2U7XG4gIHJhbmdlID0gcmFuZ2UudHJpbSgpO1xuICBkZWJ1ZygncmFuZ2UnLCByYW5nZSwgbG9vc2UpO1xuICAvLyBgMS4yLjMgLSAxLjIuNGAgPT4gYD49MS4yLjMgPD0xLjIuNGBcbiAgdmFyIGhyID0gbG9vc2UgPyByZVtIWVBIRU5SQU5HRUxPT1NFXSA6IHJlW0hZUEhFTlJBTkdFXTtcbiAgcmFuZ2UgPSByYW5nZS5yZXBsYWNlKGhyLCBoeXBoZW5SZXBsYWNlKTtcbiAgZGVidWcoJ2h5cGhlbiByZXBsYWNlJywgcmFuZ2UpO1xuICAvLyBgPiAxLjIuMyA8IDEuMi41YCA9PiBgPjEuMi4zIDwxLjIuNWBcbiAgcmFuZ2UgPSByYW5nZS5yZXBsYWNlKHJlW0NPTVBBUkFUT1JUUklNXSwgY29tcGFyYXRvclRyaW1SZXBsYWNlKTtcbiAgZGVidWcoJ2NvbXBhcmF0b3IgdHJpbScsIHJhbmdlLCByZVtDT01QQVJBVE9SVFJJTV0pO1xuXG4gIC8vIGB+IDEuMi4zYCA9PiBgfjEuMi4zYFxuICByYW5nZSA9IHJhbmdlLnJlcGxhY2UocmVbVElMREVUUklNXSwgdGlsZGVUcmltUmVwbGFjZSk7XG5cbiAgLy8gYF4gMS4yLjNgID0+IGBeMS4yLjNgXG4gIHJhbmdlID0gcmFuZ2UucmVwbGFjZShyZVtDQVJFVFRSSU1dLCBjYXJldFRyaW1SZXBsYWNlKTtcblxuICAvLyBub3JtYWxpemUgc3BhY2VzXG4gIHJhbmdlID0gcmFuZ2Uuc3BsaXQoL1xccysvKS5qb2luKCcgJyk7XG5cbiAgLy8gQXQgdGhpcyBwb2ludCwgdGhlIHJhbmdlIGlzIGNvbXBsZXRlbHkgdHJpbW1lZCBhbmRcbiAgLy8gcmVhZHkgdG8gYmUgc3BsaXQgaW50byBjb21wYXJhdG9ycy5cblxuICB2YXIgY29tcFJlID0gbG9vc2UgPyByZVtDT01QQVJBVE9STE9PU0VdIDogcmVbQ09NUEFSQVRPUl07XG4gIHZhciBzZXQgPSByYW5nZS5zcGxpdCgnICcpLm1hcChmdW5jdGlvbihjb21wKSB7XG4gICAgcmV0dXJuIHBhcnNlQ29tcGFyYXRvcihjb21wLCBsb29zZSk7XG4gIH0pLmpvaW4oJyAnKS5zcGxpdCgvXFxzKy8pO1xuICBpZiAodGhpcy5sb29zZSkge1xuICAgIC8vIGluIGxvb3NlIG1vZGUsIHRocm93IG91dCBhbnkgdGhhdCBhcmUgbm90IHZhbGlkIGNvbXBhcmF0b3JzXG4gICAgc2V0ID0gc2V0LmZpbHRlcihmdW5jdGlvbihjb21wKSB7XG4gICAgICByZXR1cm4gISFjb21wLm1hdGNoKGNvbXBSZSk7XG4gICAgfSk7XG4gIH1cbiAgc2V0ID0gc2V0Lm1hcChmdW5jdGlvbihjb21wKSB7XG4gICAgcmV0dXJuIG5ldyBDb21wYXJhdG9yKGNvbXAsIGxvb3NlKTtcbiAgfSk7XG5cbiAgcmV0dXJuIHNldDtcbn07XG5cblJhbmdlLnByb3RvdHlwZS5pbnRlcnNlY3RzID0gZnVuY3Rpb24ocmFuZ2UsIGxvb3NlKSB7XG4gIGlmICghKHJhbmdlIGluc3RhbmNlb2YgUmFuZ2UpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignYSBSYW5nZSBpcyByZXF1aXJlZCcpO1xuICB9XG5cbiAgcmV0dXJuIHRoaXMuc2V0LnNvbWUoZnVuY3Rpb24odGhpc0NvbXBhcmF0b3JzKSB7XG4gICAgcmV0dXJuIHRoaXNDb21wYXJhdG9ycy5ldmVyeShmdW5jdGlvbih0aGlzQ29tcGFyYXRvcikge1xuICAgICAgcmV0dXJuIHJhbmdlLnNldC5zb21lKGZ1bmN0aW9uKHJhbmdlQ29tcGFyYXRvcnMpIHtcbiAgICAgICAgcmV0dXJuIHJhbmdlQ29tcGFyYXRvcnMuZXZlcnkoZnVuY3Rpb24ocmFuZ2VDb21wYXJhdG9yKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXNDb21wYXJhdG9yLmludGVyc2VjdHMocmFuZ2VDb21wYXJhdG9yLCBsb29zZSk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xufTtcblxuLy8gTW9zdGx5IGp1c3QgZm9yIHRlc3RpbmcgYW5kIGxlZ2FjeSBBUEkgcmVhc29uc1xuZXhwb3J0cy50b0NvbXBhcmF0b3JzID0gdG9Db21wYXJhdG9ycztcbmZ1bmN0aW9uIHRvQ29tcGFyYXRvcnMocmFuZ2UsIGxvb3NlKSB7XG4gIHJldHVybiBuZXcgUmFuZ2UocmFuZ2UsIGxvb3NlKS5zZXQubWFwKGZ1bmN0aW9uKGNvbXApIHtcbiAgICByZXR1cm4gY29tcC5tYXAoZnVuY3Rpb24oYykge1xuICAgICAgcmV0dXJuIGMudmFsdWU7XG4gICAgfSkuam9pbignICcpLnRyaW0oKS5zcGxpdCgnICcpO1xuICB9KTtcbn1cblxuLy8gY29tcHJpc2VkIG9mIHhyYW5nZXMsIHRpbGRlcywgc3RhcnMsIGFuZCBndGx0J3MgYXQgdGhpcyBwb2ludC5cbi8vIGFscmVhZHkgcmVwbGFjZWQgdGhlIGh5cGhlbiByYW5nZXNcbi8vIHR1cm4gaW50byBhIHNldCBvZiBKVVNUIGNvbXBhcmF0b3JzLlxuZnVuY3Rpb24gcGFyc2VDb21wYXJhdG9yKGNvbXAsIGxvb3NlKSB7XG4gIGRlYnVnKCdjb21wJywgY29tcCk7XG4gIGNvbXAgPSByZXBsYWNlQ2FyZXRzKGNvbXAsIGxvb3NlKTtcbiAgZGVidWcoJ2NhcmV0JywgY29tcCk7XG4gIGNvbXAgPSByZXBsYWNlVGlsZGVzKGNvbXAsIGxvb3NlKTtcbiAgZGVidWcoJ3RpbGRlcycsIGNvbXApO1xuICBjb21wID0gcmVwbGFjZVhSYW5nZXMoY29tcCwgbG9vc2UpO1xuICBkZWJ1ZygneHJhbmdlJywgY29tcCk7XG4gIGNvbXAgPSByZXBsYWNlU3RhcnMoY29tcCwgbG9vc2UpO1xuICBkZWJ1Zygnc3RhcnMnLCBjb21wKTtcbiAgcmV0dXJuIGNvbXA7XG59XG5cbmZ1bmN0aW9uIGlzWChpZCkge1xuICByZXR1cm4gIWlkIHx8IGlkLnRvTG93ZXJDYXNlKCkgPT09ICd4JyB8fCBpZCA9PT0gJyonO1xufVxuXG4vLyB+LCB+PiAtLT4gKiAoYW55LCBraW5kYSBzaWxseSlcbi8vIH4yLCB+Mi54LCB+Mi54LngsIH4+Miwgfj4yLnggfj4yLngueCAtLT4gPj0yLjAuMCA8My4wLjBcbi8vIH4yLjAsIH4yLjAueCwgfj4yLjAsIH4+Mi4wLnggLS0+ID49Mi4wLjAgPDIuMS4wXG4vLyB+MS4yLCB+MS4yLngsIH4+MS4yLCB+PjEuMi54IC0tPiA+PTEuMi4wIDwxLjMuMFxuLy8gfjEuMi4zLCB+PjEuMi4zIC0tPiA+PTEuMi4zIDwxLjMuMFxuLy8gfjEuMi4wLCB+PjEuMi4wIC0tPiA+PTEuMi4wIDwxLjMuMFxuZnVuY3Rpb24gcmVwbGFjZVRpbGRlcyhjb21wLCBsb29zZSkge1xuICByZXR1cm4gY29tcC50cmltKCkuc3BsaXQoL1xccysvKS5tYXAoZnVuY3Rpb24oY29tcCkge1xuICAgIHJldHVybiByZXBsYWNlVGlsZGUoY29tcCwgbG9vc2UpO1xuICB9KS5qb2luKCcgJyk7XG59XG5cbmZ1bmN0aW9uIHJlcGxhY2VUaWxkZShjb21wLCBsb29zZSkge1xuICB2YXIgciA9IGxvb3NlID8gcmVbVElMREVMT09TRV0gOiByZVtUSUxERV07XG4gIHJldHVybiBjb21wLnJlcGxhY2UociwgZnVuY3Rpb24oXywgTSwgbSwgcCwgcHIpIHtcbiAgICBkZWJ1ZygndGlsZGUnLCBjb21wLCBfLCBNLCBtLCBwLCBwcik7XG4gICAgdmFyIHJldDtcblxuICAgIGlmIChpc1goTSkpXG4gICAgICByZXQgPSAnJztcbiAgICBlbHNlIGlmIChpc1gobSkpXG4gICAgICByZXQgPSAnPj0nICsgTSArICcuMC4wIDwnICsgKCtNICsgMSkgKyAnLjAuMCc7XG4gICAgZWxzZSBpZiAoaXNYKHApKVxuICAgICAgLy8gfjEuMiA9PSA+PTEuMi4wIDwxLjMuMFxuICAgICAgcmV0ID0gJz49JyArIE0gKyAnLicgKyBtICsgJy4wIDwnICsgTSArICcuJyArICgrbSArIDEpICsgJy4wJztcbiAgICBlbHNlIGlmIChwcikge1xuICAgICAgZGVidWcoJ3JlcGxhY2VUaWxkZSBwcicsIHByKTtcbiAgICAgIGlmIChwci5jaGFyQXQoMCkgIT09ICctJylcbiAgICAgICAgcHIgPSAnLScgKyBwcjtcbiAgICAgIHJldCA9ICc+PScgKyBNICsgJy4nICsgbSArICcuJyArIHAgKyBwciArXG4gICAgICAgICAgICAnIDwnICsgTSArICcuJyArICgrbSArIDEpICsgJy4wJztcbiAgICB9IGVsc2VcbiAgICAgIC8vIH4xLjIuMyA9PSA+PTEuMi4zIDwxLjMuMFxuICAgICAgcmV0ID0gJz49JyArIE0gKyAnLicgKyBtICsgJy4nICsgcCArXG4gICAgICAgICAgICAnIDwnICsgTSArICcuJyArICgrbSArIDEpICsgJy4wJztcblxuICAgIGRlYnVnKCd0aWxkZSByZXR1cm4nLCByZXQpO1xuICAgIHJldHVybiByZXQ7XG4gIH0pO1xufVxuXG4vLyBeIC0tPiAqIChhbnksIGtpbmRhIHNpbGx5KVxuLy8gXjIsIF4yLngsIF4yLngueCAtLT4gPj0yLjAuMCA8My4wLjBcbi8vIF4yLjAsIF4yLjAueCAtLT4gPj0yLjAuMCA8My4wLjBcbi8vIF4xLjIsIF4xLjIueCAtLT4gPj0xLjIuMCA8Mi4wLjBcbi8vIF4xLjIuMyAtLT4gPj0xLjIuMyA8Mi4wLjBcbi8vIF4xLjIuMCAtLT4gPj0xLjIuMCA8Mi4wLjBcbmZ1bmN0aW9uIHJlcGxhY2VDYXJldHMoY29tcCwgbG9vc2UpIHtcbiAgcmV0dXJuIGNvbXAudHJpbSgpLnNwbGl0KC9cXHMrLykubWFwKGZ1bmN0aW9uKGNvbXApIHtcbiAgICByZXR1cm4gcmVwbGFjZUNhcmV0KGNvbXAsIGxvb3NlKTtcbiAgfSkuam9pbignICcpO1xufVxuXG5mdW5jdGlvbiByZXBsYWNlQ2FyZXQoY29tcCwgbG9vc2UpIHtcbiAgZGVidWcoJ2NhcmV0JywgY29tcCwgbG9vc2UpO1xuICB2YXIgciA9IGxvb3NlID8gcmVbQ0FSRVRMT09TRV0gOiByZVtDQVJFVF07XG4gIHJldHVybiBjb21wLnJlcGxhY2UociwgZnVuY3Rpb24oXywgTSwgbSwgcCwgcHIpIHtcbiAgICBkZWJ1ZygnY2FyZXQnLCBjb21wLCBfLCBNLCBtLCBwLCBwcik7XG4gICAgdmFyIHJldDtcblxuICAgIGlmIChpc1goTSkpXG4gICAgICByZXQgPSAnJztcbiAgICBlbHNlIGlmIChpc1gobSkpXG4gICAgICByZXQgPSAnPj0nICsgTSArICcuMC4wIDwnICsgKCtNICsgMSkgKyAnLjAuMCc7XG4gICAgZWxzZSBpZiAoaXNYKHApKSB7XG4gICAgICBpZiAoTSA9PT0gJzAnKVxuICAgICAgICByZXQgPSAnPj0nICsgTSArICcuJyArIG0gKyAnLjAgPCcgKyBNICsgJy4nICsgKCttICsgMSkgKyAnLjAnO1xuICAgICAgZWxzZVxuICAgICAgICByZXQgPSAnPj0nICsgTSArICcuJyArIG0gKyAnLjAgPCcgKyAoK00gKyAxKSArICcuMC4wJztcbiAgICB9IGVsc2UgaWYgKHByKSB7XG4gICAgICBkZWJ1ZygncmVwbGFjZUNhcmV0IHByJywgcHIpO1xuICAgICAgaWYgKHByLmNoYXJBdCgwKSAhPT0gJy0nKVxuICAgICAgICBwciA9ICctJyArIHByO1xuICAgICAgaWYgKE0gPT09ICcwJykge1xuICAgICAgICBpZiAobSA9PT0gJzAnKVxuICAgICAgICAgIHJldCA9ICc+PScgKyBNICsgJy4nICsgbSArICcuJyArIHAgKyBwciArXG4gICAgICAgICAgICAgICAgJyA8JyArIE0gKyAnLicgKyBtICsgJy4nICsgKCtwICsgMSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICByZXQgPSAnPj0nICsgTSArICcuJyArIG0gKyAnLicgKyBwICsgcHIgK1xuICAgICAgICAgICAgICAgICcgPCcgKyBNICsgJy4nICsgKCttICsgMSkgKyAnLjAnO1xuICAgICAgfSBlbHNlXG4gICAgICAgIHJldCA9ICc+PScgKyBNICsgJy4nICsgbSArICcuJyArIHAgKyBwciArXG4gICAgICAgICAgICAgICcgPCcgKyAoK00gKyAxKSArICcuMC4wJztcbiAgICB9IGVsc2Uge1xuICAgICAgZGVidWcoJ25vIHByJyk7XG4gICAgICBpZiAoTSA9PT0gJzAnKSB7XG4gICAgICAgIGlmIChtID09PSAnMCcpXG4gICAgICAgICAgcmV0ID0gJz49JyArIE0gKyAnLicgKyBtICsgJy4nICsgcCArXG4gICAgICAgICAgICAgICAgJyA8JyArIE0gKyAnLicgKyBtICsgJy4nICsgKCtwICsgMSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICByZXQgPSAnPj0nICsgTSArICcuJyArIG0gKyAnLicgKyBwICtcbiAgICAgICAgICAgICAgICAnIDwnICsgTSArICcuJyArICgrbSArIDEpICsgJy4wJztcbiAgICAgIH0gZWxzZVxuICAgICAgICByZXQgPSAnPj0nICsgTSArICcuJyArIG0gKyAnLicgKyBwICtcbiAgICAgICAgICAgICAgJyA8JyArICgrTSArIDEpICsgJy4wLjAnO1xuICAgIH1cblxuICAgIGRlYnVnKCdjYXJldCByZXR1cm4nLCByZXQpO1xuICAgIHJldHVybiByZXQ7XG4gIH0pO1xufVxuXG5mdW5jdGlvbiByZXBsYWNlWFJhbmdlcyhjb21wLCBsb29zZSkge1xuICBkZWJ1ZygncmVwbGFjZVhSYW5nZXMnLCBjb21wLCBsb29zZSk7XG4gIHJldHVybiBjb21wLnNwbGl0KC9cXHMrLykubWFwKGZ1bmN0aW9uKGNvbXApIHtcbiAgICByZXR1cm4gcmVwbGFjZVhSYW5nZShjb21wLCBsb29zZSk7XG4gIH0pLmpvaW4oJyAnKTtcbn1cblxuZnVuY3Rpb24gcmVwbGFjZVhSYW5nZShjb21wLCBsb29zZSkge1xuICBjb21wID0gY29tcC50cmltKCk7XG4gIHZhciByID0gbG9vc2UgPyByZVtYUkFOR0VMT09TRV0gOiByZVtYUkFOR0VdO1xuICByZXR1cm4gY29tcC5yZXBsYWNlKHIsIGZ1bmN0aW9uKHJldCwgZ3RsdCwgTSwgbSwgcCwgcHIpIHtcbiAgICBkZWJ1ZygneFJhbmdlJywgY29tcCwgcmV0LCBndGx0LCBNLCBtLCBwLCBwcik7XG4gICAgdmFyIHhNID0gaXNYKE0pO1xuICAgIHZhciB4bSA9IHhNIHx8IGlzWChtKTtcbiAgICB2YXIgeHAgPSB4bSB8fCBpc1gocCk7XG4gICAgdmFyIGFueVggPSB4cDtcblxuICAgIGlmIChndGx0ID09PSAnPScgJiYgYW55WClcbiAgICAgIGd0bHQgPSAnJztcblxuICAgIGlmICh4TSkge1xuICAgICAgaWYgKGd0bHQgPT09ICc+JyB8fCBndGx0ID09PSAnPCcpIHtcbiAgICAgICAgLy8gbm90aGluZyBpcyBhbGxvd2VkXG4gICAgICAgIHJldCA9ICc8MC4wLjAnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gbm90aGluZyBpcyBmb3JiaWRkZW5cbiAgICAgICAgcmV0ID0gJyonO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoZ3RsdCAmJiBhbnlYKSB7XG4gICAgICAvLyByZXBsYWNlIFggd2l0aCAwXG4gICAgICBpZiAoeG0pXG4gICAgICAgIG0gPSAwO1xuICAgICAgaWYgKHhwKVxuICAgICAgICBwID0gMDtcblxuICAgICAgaWYgKGd0bHQgPT09ICc+Jykge1xuICAgICAgICAvLyA+MSA9PiA+PTIuMC4wXG4gICAgICAgIC8vID4xLjIgPT4gPj0xLjMuMFxuICAgICAgICAvLyA+MS4yLjMgPT4gPj0gMS4yLjRcbiAgICAgICAgZ3RsdCA9ICc+PSc7XG4gICAgICAgIGlmICh4bSkge1xuICAgICAgICAgIE0gPSArTSArIDE7XG4gICAgICAgICAgbSA9IDA7XG4gICAgICAgICAgcCA9IDA7XG4gICAgICAgIH0gZWxzZSBpZiAoeHApIHtcbiAgICAgICAgICBtID0gK20gKyAxO1xuICAgICAgICAgIHAgPSAwO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGd0bHQgPT09ICc8PScpIHtcbiAgICAgICAgLy8gPD0wLjcueCBpcyBhY3R1YWxseSA8MC44LjAsIHNpbmNlIGFueSAwLjcueCBzaG91bGRcbiAgICAgICAgLy8gcGFzcy4gIFNpbWlsYXJseSwgPD03LnggaXMgYWN0dWFsbHkgPDguMC4wLCBldGMuXG4gICAgICAgIGd0bHQgPSAnPCc7XG4gICAgICAgIGlmICh4bSlcbiAgICAgICAgICBNID0gK00gKyAxO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgbSA9ICttICsgMTtcbiAgICAgIH1cblxuICAgICAgcmV0ID0gZ3RsdCArIE0gKyAnLicgKyBtICsgJy4nICsgcDtcbiAgICB9IGVsc2UgaWYgKHhtKSB7XG4gICAgICByZXQgPSAnPj0nICsgTSArICcuMC4wIDwnICsgKCtNICsgMSkgKyAnLjAuMCc7XG4gICAgfSBlbHNlIGlmICh4cCkge1xuICAgICAgcmV0ID0gJz49JyArIE0gKyAnLicgKyBtICsgJy4wIDwnICsgTSArICcuJyArICgrbSArIDEpICsgJy4wJztcbiAgICB9XG5cbiAgICBkZWJ1ZygneFJhbmdlIHJldHVybicsIHJldCk7XG5cbiAgICByZXR1cm4gcmV0O1xuICB9KTtcbn1cblxuLy8gQmVjYXVzZSAqIGlzIEFORC1lZCB3aXRoIGV2ZXJ5dGhpbmcgZWxzZSBpbiB0aGUgY29tcGFyYXRvcixcbi8vIGFuZCAnJyBtZWFucyBcImFueSB2ZXJzaW9uXCIsIGp1c3QgcmVtb3ZlIHRoZSAqcyBlbnRpcmVseS5cbmZ1bmN0aW9uIHJlcGxhY2VTdGFycyhjb21wLCBsb29zZSkge1xuICBkZWJ1ZygncmVwbGFjZVN0YXJzJywgY29tcCwgbG9vc2UpO1xuICAvLyBMb29zZW5lc3MgaXMgaWdub3JlZCBoZXJlLiAgc3RhciBpcyBhbHdheXMgYXMgbG9vc2UgYXMgaXQgZ2V0cyFcbiAgcmV0dXJuIGNvbXAudHJpbSgpLnJlcGxhY2UocmVbU1RBUl0sICcnKTtcbn1cblxuLy8gVGhpcyBmdW5jdGlvbiBpcyBwYXNzZWQgdG8gc3RyaW5nLnJlcGxhY2UocmVbSFlQSEVOUkFOR0VdKVxuLy8gTSwgbSwgcGF0Y2gsIHByZXJlbGVhc2UsIGJ1aWxkXG4vLyAxLjIgLSAzLjQuNSA9PiA+PTEuMi4wIDw9My40LjVcbi8vIDEuMi4zIC0gMy40ID0+ID49MS4yLjAgPDMuNS4wIEFueSAzLjQueCB3aWxsIGRvXG4vLyAxLjIgLSAzLjQgPT4gPj0xLjIuMCA8My41LjBcbmZ1bmN0aW9uIGh5cGhlblJlcGxhY2UoJDAsXG4gICAgICAgICAgICAgICAgICAgICAgIGZyb20sIGZNLCBmbSwgZnAsIGZwciwgZmIsXG4gICAgICAgICAgICAgICAgICAgICAgIHRvLCB0TSwgdG0sIHRwLCB0cHIsIHRiKSB7XG5cbiAgaWYgKGlzWChmTSkpXG4gICAgZnJvbSA9ICcnO1xuICBlbHNlIGlmIChpc1goZm0pKVxuICAgIGZyb20gPSAnPj0nICsgZk0gKyAnLjAuMCc7XG4gIGVsc2UgaWYgKGlzWChmcCkpXG4gICAgZnJvbSA9ICc+PScgKyBmTSArICcuJyArIGZtICsgJy4wJztcbiAgZWxzZVxuICAgIGZyb20gPSAnPj0nICsgZnJvbTtcblxuICBpZiAoaXNYKHRNKSlcbiAgICB0byA9ICcnO1xuICBlbHNlIGlmIChpc1godG0pKVxuICAgIHRvID0gJzwnICsgKCt0TSArIDEpICsgJy4wLjAnO1xuICBlbHNlIGlmIChpc1godHApKVxuICAgIHRvID0gJzwnICsgdE0gKyAnLicgKyAoK3RtICsgMSkgKyAnLjAnO1xuICBlbHNlIGlmICh0cHIpXG4gICAgdG8gPSAnPD0nICsgdE0gKyAnLicgKyB0bSArICcuJyArIHRwICsgJy0nICsgdHByO1xuICBlbHNlXG4gICAgdG8gPSAnPD0nICsgdG87XG5cbiAgcmV0dXJuIChmcm9tICsgJyAnICsgdG8pLnRyaW0oKTtcbn1cblxuXG4vLyBpZiBBTlkgb2YgdGhlIHNldHMgbWF0Y2ggQUxMIG9mIGl0cyBjb21wYXJhdG9ycywgdGhlbiBwYXNzXG5SYW5nZS5wcm90b3R5cGUudGVzdCA9IGZ1bmN0aW9uKHZlcnNpb24pIHtcbiAgaWYgKCF2ZXJzaW9uKVxuICAgIHJldHVybiBmYWxzZTtcblxuICBpZiAodHlwZW9mIHZlcnNpb24gPT09ICdzdHJpbmcnKVxuICAgIHZlcnNpb24gPSBuZXcgU2VtVmVyKHZlcnNpb24sIHRoaXMubG9vc2UpO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5zZXQubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAodGVzdFNldCh0aGlzLnNldFtpXSwgdmVyc2lvbikpXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59O1xuXG5mdW5jdGlvbiB0ZXN0U2V0KHNldCwgdmVyc2lvbikge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHNldC5sZW5ndGg7IGkrKykge1xuICAgIGlmICghc2V0W2ldLnRlc3QodmVyc2lvbikpXG4gICAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAodmVyc2lvbi5wcmVyZWxlYXNlLmxlbmd0aCkge1xuICAgIC8vIEZpbmQgdGhlIHNldCBvZiB2ZXJzaW9ucyB0aGF0IGFyZSBhbGxvd2VkIHRvIGhhdmUgcHJlcmVsZWFzZXNcbiAgICAvLyBGb3IgZXhhbXBsZSwgXjEuMi4zLXByLjEgZGVzdWdhcnMgdG8gPj0xLjIuMy1wci4xIDwyLjAuMFxuICAgIC8vIFRoYXQgc2hvdWxkIGFsbG93IGAxLjIuMy1wci4yYCB0byBwYXNzLlxuICAgIC8vIEhvd2V2ZXIsIGAxLjIuNC1hbHBoYS5ub3RyZWFkeWAgc2hvdWxkIE5PVCBiZSBhbGxvd2VkLFxuICAgIC8vIGV2ZW4gdGhvdWdoIGl0J3Mgd2l0aGluIHRoZSByYW5nZSBzZXQgYnkgdGhlIGNvbXBhcmF0b3JzLlxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2V0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICBkZWJ1ZyhzZXRbaV0uc2VtdmVyKTtcbiAgICAgIGlmIChzZXRbaV0uc2VtdmVyID09PSBBTlkpXG4gICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICBpZiAoc2V0W2ldLnNlbXZlci5wcmVyZWxlYXNlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdmFyIGFsbG93ZWQgPSBzZXRbaV0uc2VtdmVyO1xuICAgICAgICBpZiAoYWxsb3dlZC5tYWpvciA9PT0gdmVyc2lvbi5tYWpvciAmJlxuICAgICAgICAgICAgYWxsb3dlZC5taW5vciA9PT0gdmVyc2lvbi5taW5vciAmJlxuICAgICAgICAgICAgYWxsb3dlZC5wYXRjaCA9PT0gdmVyc2lvbi5wYXRjaClcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBWZXJzaW9uIGhhcyBhIC1wcmUsIGJ1dCBpdCdzIG5vdCBvbmUgb2YgdGhlIG9uZXMgd2UgbGlrZS5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn1cblxuZXhwb3J0cy5zYXRpc2ZpZXMgPSBzYXRpc2ZpZXM7XG5mdW5jdGlvbiBzYXRpc2ZpZXModmVyc2lvbiwgcmFuZ2UsIGxvb3NlKSB7XG4gIHRyeSB7XG4gICAgcmFuZ2UgPSBuZXcgUmFuZ2UocmFuZ2UsIGxvb3NlKTtcbiAgfSBjYXRjaCAoZXIpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHJhbmdlLnRlc3QodmVyc2lvbik7XG59XG5cbmV4cG9ydHMubWF4U2F0aXNmeWluZyA9IG1heFNhdGlzZnlpbmc7XG5mdW5jdGlvbiBtYXhTYXRpc2Z5aW5nKHZlcnNpb25zLCByYW5nZSwgbG9vc2UpIHtcbiAgdmFyIG1heCA9IG51bGw7XG4gIHZhciBtYXhTViA9IG51bGw7XG4gIHRyeSB7XG4gICAgdmFyIHJhbmdlT2JqID0gbmV3IFJhbmdlKHJhbmdlLCBsb29zZSk7XG4gIH0gY2F0Y2ggKGVyKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgdmVyc2lvbnMuZm9yRWFjaChmdW5jdGlvbiAodikge1xuICAgIGlmIChyYW5nZU9iai50ZXN0KHYpKSB7IC8vIHNhdGlzZmllcyh2LCByYW5nZSwgbG9vc2UpXG4gICAgICBpZiAoIW1heCB8fCBtYXhTVi5jb21wYXJlKHYpID09PSAtMSkgeyAvLyBjb21wYXJlKG1heCwgdiwgdHJ1ZSlcbiAgICAgICAgbWF4ID0gdjtcbiAgICAgICAgbWF4U1YgPSBuZXcgU2VtVmVyKG1heCwgbG9vc2UpO1xuICAgICAgfVxuICAgIH1cbiAgfSlcbiAgcmV0dXJuIG1heDtcbn1cblxuZXhwb3J0cy5taW5TYXRpc2Z5aW5nID0gbWluU2F0aXNmeWluZztcbmZ1bmN0aW9uIG1pblNhdGlzZnlpbmcodmVyc2lvbnMsIHJhbmdlLCBsb29zZSkge1xuICB2YXIgbWluID0gbnVsbDtcbiAgdmFyIG1pblNWID0gbnVsbDtcbiAgdHJ5IHtcbiAgICB2YXIgcmFuZ2VPYmogPSBuZXcgUmFuZ2UocmFuZ2UsIGxvb3NlKTtcbiAgfSBjYXRjaCAoZXIpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICB2ZXJzaW9ucy5mb3JFYWNoKGZ1bmN0aW9uICh2KSB7XG4gICAgaWYgKHJhbmdlT2JqLnRlc3QodikpIHsgLy8gc2F0aXNmaWVzKHYsIHJhbmdlLCBsb29zZSlcbiAgICAgIGlmICghbWluIHx8IG1pblNWLmNvbXBhcmUodikgPT09IDEpIHsgLy8gY29tcGFyZShtaW4sIHYsIHRydWUpXG4gICAgICAgIG1pbiA9IHY7XG4gICAgICAgIG1pblNWID0gbmV3IFNlbVZlcihtaW4sIGxvb3NlKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pXG4gIHJldHVybiBtaW47XG59XG5cbmV4cG9ydHMudmFsaWRSYW5nZSA9IHZhbGlkUmFuZ2U7XG5mdW5jdGlvbiB2YWxpZFJhbmdlKHJhbmdlLCBsb29zZSkge1xuICB0cnkge1xuICAgIC8vIFJldHVybiAnKicgaW5zdGVhZCBvZiAnJyBzbyB0aGF0IHRydXRoaW5lc3Mgd29ya3MuXG4gICAgLy8gVGhpcyB3aWxsIHRocm93IGlmIGl0J3MgaW52YWxpZCBhbnl3YXlcbiAgICByZXR1cm4gbmV3IFJhbmdlKHJhbmdlLCBsb29zZSkucmFuZ2UgfHwgJyonO1xuICB9IGNhdGNoIChlcikge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbi8vIERldGVybWluZSBpZiB2ZXJzaW9uIGlzIGxlc3MgdGhhbiBhbGwgdGhlIHZlcnNpb25zIHBvc3NpYmxlIGluIHRoZSByYW5nZVxuZXhwb3J0cy5sdHIgPSBsdHI7XG5mdW5jdGlvbiBsdHIodmVyc2lvbiwgcmFuZ2UsIGxvb3NlKSB7XG4gIHJldHVybiBvdXRzaWRlKHZlcnNpb24sIHJhbmdlLCAnPCcsIGxvb3NlKTtcbn1cblxuLy8gRGV0ZXJtaW5lIGlmIHZlcnNpb24gaXMgZ3JlYXRlciB0aGFuIGFsbCB0aGUgdmVyc2lvbnMgcG9zc2libGUgaW4gdGhlIHJhbmdlLlxuZXhwb3J0cy5ndHIgPSBndHI7XG5mdW5jdGlvbiBndHIodmVyc2lvbiwgcmFuZ2UsIGxvb3NlKSB7XG4gIHJldHVybiBvdXRzaWRlKHZlcnNpb24sIHJhbmdlLCAnPicsIGxvb3NlKTtcbn1cblxuZXhwb3J0cy5vdXRzaWRlID0gb3V0c2lkZTtcbmZ1bmN0aW9uIG91dHNpZGUodmVyc2lvbiwgcmFuZ2UsIGhpbG8sIGxvb3NlKSB7XG4gIHZlcnNpb24gPSBuZXcgU2VtVmVyKHZlcnNpb24sIGxvb3NlKTtcbiAgcmFuZ2UgPSBuZXcgUmFuZ2UocmFuZ2UsIGxvb3NlKTtcblxuICB2YXIgZ3RmbiwgbHRlZm4sIGx0Zm4sIGNvbXAsIGVjb21wO1xuICBzd2l0Y2ggKGhpbG8pIHtcbiAgICBjYXNlICc+JzpcbiAgICAgIGd0Zm4gPSBndDtcbiAgICAgIGx0ZWZuID0gbHRlO1xuICAgICAgbHRmbiA9IGx0O1xuICAgICAgY29tcCA9ICc+JztcbiAgICAgIGVjb21wID0gJz49JztcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJzwnOlxuICAgICAgZ3RmbiA9IGx0O1xuICAgICAgbHRlZm4gPSBndGU7XG4gICAgICBsdGZuID0gZ3Q7XG4gICAgICBjb21wID0gJzwnO1xuICAgICAgZWNvbXAgPSAnPD0nO1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ011c3QgcHJvdmlkZSBhIGhpbG8gdmFsIG9mIFwiPFwiIG9yIFwiPlwiJyk7XG4gIH1cblxuICAvLyBJZiBpdCBzYXRpc2lmZXMgdGhlIHJhbmdlIGl0IGlzIG5vdCBvdXRzaWRlXG4gIGlmIChzYXRpc2ZpZXModmVyc2lvbiwgcmFuZ2UsIGxvb3NlKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIEZyb20gbm93IG9uLCB2YXJpYWJsZSB0ZXJtcyBhcmUgYXMgaWYgd2UncmUgaW4gXCJndHJcIiBtb2RlLlxuICAvLyBidXQgbm90ZSB0aGF0IGV2ZXJ5dGhpbmcgaXMgZmxpcHBlZCBmb3IgdGhlIFwibHRyXCIgZnVuY3Rpb24uXG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCByYW5nZS5zZXQubGVuZ3RoOyArK2kpIHtcbiAgICB2YXIgY29tcGFyYXRvcnMgPSByYW5nZS5zZXRbaV07XG5cbiAgICB2YXIgaGlnaCA9IG51bGw7XG4gICAgdmFyIGxvdyA9IG51bGw7XG5cbiAgICBjb21wYXJhdG9ycy5mb3JFYWNoKGZ1bmN0aW9uKGNvbXBhcmF0b3IpIHtcbiAgICAgIGlmIChjb21wYXJhdG9yLnNlbXZlciA9PT0gQU5ZKSB7XG4gICAgICAgIGNvbXBhcmF0b3IgPSBuZXcgQ29tcGFyYXRvcignPj0wLjAuMCcpXG4gICAgICB9XG4gICAgICBoaWdoID0gaGlnaCB8fCBjb21wYXJhdG9yO1xuICAgICAgbG93ID0gbG93IHx8IGNvbXBhcmF0b3I7XG4gICAgICBpZiAoZ3Rmbihjb21wYXJhdG9yLnNlbXZlciwgaGlnaC5zZW12ZXIsIGxvb3NlKSkge1xuICAgICAgICBoaWdoID0gY29tcGFyYXRvcjtcbiAgICAgIH0gZWxzZSBpZiAobHRmbihjb21wYXJhdG9yLnNlbXZlciwgbG93LnNlbXZlciwgbG9vc2UpKSB7XG4gICAgICAgIGxvdyA9IGNvbXBhcmF0b3I7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBJZiB0aGUgZWRnZSB2ZXJzaW9uIGNvbXBhcmF0b3IgaGFzIGEgb3BlcmF0b3IgdGhlbiBvdXIgdmVyc2lvblxuICAgIC8vIGlzbid0IG91dHNpZGUgaXRcbiAgICBpZiAoaGlnaC5vcGVyYXRvciA9PT0gY29tcCB8fCBoaWdoLm9wZXJhdG9yID09PSBlY29tcCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIC8vIElmIHRoZSBsb3dlc3QgdmVyc2lvbiBjb21wYXJhdG9yIGhhcyBhbiBvcGVyYXRvciBhbmQgb3VyIHZlcnNpb25cbiAgICAvLyBpcyBsZXNzIHRoYW4gaXQgdGhlbiBpdCBpc24ndCBoaWdoZXIgdGhhbiB0aGUgcmFuZ2VcbiAgICBpZiAoKCFsb3cub3BlcmF0b3IgfHwgbG93Lm9wZXJhdG9yID09PSBjb21wKSAmJlxuICAgICAgICBsdGVmbih2ZXJzaW9uLCBsb3cuc2VtdmVyKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gZWxzZSBpZiAobG93Lm9wZXJhdG9yID09PSBlY29tcCAmJiBsdGZuKHZlcnNpb24sIGxvdy5zZW12ZXIpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG5leHBvcnRzLnByZXJlbGVhc2UgPSBwcmVyZWxlYXNlO1xuZnVuY3Rpb24gcHJlcmVsZWFzZSh2ZXJzaW9uLCBsb29zZSkge1xuICB2YXIgcGFyc2VkID0gcGFyc2UodmVyc2lvbiwgbG9vc2UpO1xuICByZXR1cm4gKHBhcnNlZCAmJiBwYXJzZWQucHJlcmVsZWFzZS5sZW5ndGgpID8gcGFyc2VkLnByZXJlbGVhc2UgOiBudWxsO1xufVxuXG5leHBvcnRzLmludGVyc2VjdHMgPSBpbnRlcnNlY3RzO1xuZnVuY3Rpb24gaW50ZXJzZWN0cyhyMSwgcjIsIGxvb3NlKSB7XG4gIHIxID0gbmV3IFJhbmdlKHIxLCBsb29zZSlcbiAgcjIgPSBuZXcgUmFuZ2UocjIsIGxvb3NlKVxuICByZXR1cm4gcjEuaW50ZXJzZWN0cyhyMilcbn1cblxuZXhwb3J0cy5jb2VyY2UgPSBjb2VyY2U7XG5mdW5jdGlvbiBjb2VyY2UodmVyc2lvbikge1xuICBpZiAodmVyc2lvbiBpbnN0YW5jZW9mIFNlbVZlcilcbiAgICByZXR1cm4gdmVyc2lvbjtcblxuICBpZiAodHlwZW9mIHZlcnNpb24gIT09ICdzdHJpbmcnKVxuICAgIHJldHVybiBudWxsO1xuXG4gIHZhciBtYXRjaCA9IHZlcnNpb24ubWF0Y2gocmVbQ09FUkNFXSk7XG5cbiAgaWYgKG1hdGNoID09IG51bGwpXG4gICAgcmV0dXJuIG51bGw7XG5cbiAgcmV0dXJuIHBhcnNlKChtYXRjaFsxXSB8fCAnMCcpICsgJy4nICsgKG1hdGNoWzJdIHx8ICcwJykgKyAnLicgKyAobWF0Y2hbM10gfHwgJzAnKSk7IFxufVxuIiwiLy8gQGZsb3dcblxuaW1wb3J0IHsgdGhyb3dFcnJvciB9IGZyb20gJ3NoYXJlZC91dGlsJ1xuaW1wb3J0IHsgY29tcGlsZVRvRnVuY3Rpb25zIH0gZnJvbSAndnVlLXRlbXBsYXRlLWNvbXBpbGVyJ1xuaW1wb3J0IHsgaXNWdWVDb21wb25lbnQgfSBmcm9tICcuL3ZhbGlkYXRvcnMnXG5cbmZ1bmN0aW9uIGlzVmFsaWRTbG90KHNsb3Q6IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gaXNWdWVDb21wb25lbnQoc2xvdCkgfHwgdHlwZW9mIHNsb3QgPT09ICdzdHJpbmcnXG59XG5cbmZ1bmN0aW9uIHJlcXVpcmVzVGVtcGxhdGVDb21waWxlcihzbG90OiBhbnkpOiB2b2lkIHtcbiAgaWYgKHR5cGVvZiBzbG90ID09PSAnc3RyaW5nJyAmJiAhY29tcGlsZVRvRnVuY3Rpb25zKSB7XG4gICAgdGhyb3dFcnJvcihcbiAgICAgIGB2dWVUZW1wbGF0ZUNvbXBpbGVyIGlzIHVuZGVmaW5lZCwgeW91IG11c3QgcGFzcyBgICtcbiAgICAgICAgYHByZWNvbXBpbGVkIGNvbXBvbmVudHMgaWYgdnVlLXRlbXBsYXRlLWNvbXBpbGVyIGlzIGAgK1xuICAgICAgICBgdW5kZWZpbmVkYFxuICAgIClcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVTbG90cyhzbG90czogU2xvdHNPYmplY3QpOiB2b2lkIHtcbiAgT2JqZWN0LmtleXMoc2xvdHMpLmZvckVhY2goa2V5ID0+IHtcbiAgICBjb25zdCBzbG90ID0gQXJyYXkuaXNBcnJheShzbG90c1trZXldKSA/IHNsb3RzW2tleV0gOiBbc2xvdHNba2V5XV1cblxuICAgIHNsb3QuZm9yRWFjaChzbG90VmFsdWUgPT4ge1xuICAgICAgaWYgKCFpc1ZhbGlkU2xvdChzbG90VmFsdWUpKSB7XG4gICAgICAgIHRocm93RXJyb3IoXG4gICAgICAgICAgYHNsb3RzW2tleV0gbXVzdCBiZSBhIENvbXBvbmVudCwgc3RyaW5nIG9yIGFuIGFycmF5IGAgK1xuICAgICAgICAgICAgYG9mIENvbXBvbmVudHNgXG4gICAgICAgIClcbiAgICAgIH1cbiAgICAgIHJlcXVpcmVzVGVtcGxhdGVDb21waWxlcihzbG90VmFsdWUpXG4gICAgfSlcbiAgfSlcbn1cbiIsImltcG9ydCB7XG4gIGlzUGxhaW5PYmplY3QsXG4gIGlzRnVuY3Rpb25hbENvbXBvbmVudCxcbiAgaXNDb25zdHJ1Y3RvclxufSBmcm9tICcuL3ZhbGlkYXRvcnMnXG5pbXBvcnQgeyBWVUVfVkVSU0lPTiB9IGZyb20gJy4vY29uc3RzJ1xuaW1wb3J0IHsgY29tcGlsZVRlbXBsYXRlRm9yU2xvdHMgfSBmcm9tICcuL2NvbXBpbGUtdGVtcGxhdGUnXG5pbXBvcnQgeyB0aHJvd0Vycm9yIH0gZnJvbSAnLi91dGlsJ1xuaW1wb3J0IHsgdmFsaWRhdGVTbG90cyB9IGZyb20gJy4vdmFsaWRhdGUtc2xvdHMnXG5cbmZ1bmN0aW9uIHZ1ZUV4dGVuZFVuc3VwcG9ydGVkT3B0aW9uKG9wdGlvbikge1xuICByZXR1cm4gKFxuICAgIGBvcHRpb25zLiR7b3B0aW9ufSBpcyBub3Qgc3VwcG9ydGVkIGZvciBgICtcbiAgICBgY29tcG9uZW50cyBjcmVhdGVkIHdpdGggVnVlLmV4dGVuZCBpbiBWdWUgPCAyLjMuIGAgK1xuICAgIGBZb3UgY2FuIHNldCAke29wdGlvbn0gdG8gZmFsc2UgdG8gbW91bnQgdGhlIGNvbXBvbmVudC5gXG4gIClcbn1cbi8vIHRoZXNlIG9wdGlvbnMgYXJlbid0IHN1cHBvcnRlZCBpZiBWdWUgaXMgdmVyc2lvbiA8IDIuM1xuLy8gZm9yIGNvbXBvbmVudHMgdXNpbmcgVnVlLmV4dGVuZC4gVGhpcyBpcyBkdWUgdG8gYSBidWdcbi8vIHRoYXQgbWVhbnMgdGhlIG1peGlucyB3ZSB1c2UgdG8gYWRkIHByb3BlcnRpZXMgYXJlIG5vdCBhcHBsaWVkXG4vLyBjb3JyZWN0bHlcbmNvbnN0IFVOU1VQUE9SVEVEX1ZFUlNJT05fT1BUSU9OUyA9IFsnbW9ja3MnLCAnc3R1YnMnLCAnbG9jYWxWdWUnXVxuXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVPcHRpb25zKG9wdGlvbnMsIGNvbXBvbmVudCkge1xuICBpZiAob3B0aW9ucy5wYXJlbnRDb21wb25lbnQgJiYgIWlzUGxhaW5PYmplY3Qob3B0aW9ucy5wYXJlbnRDb21wb25lbnQpKSB7XG4gICAgdGhyb3dFcnJvcihcbiAgICAgIGBvcHRpb25zLnBhcmVudENvbXBvbmVudCBzaG91bGQgYmUgYSB2YWxpZCBWdWUgY29tcG9uZW50IG9wdGlvbnMgb2JqZWN0YFxuICAgIClcbiAgfVxuXG4gIGlmICghaXNGdW5jdGlvbmFsQ29tcG9uZW50KGNvbXBvbmVudCkgJiYgb3B0aW9ucy5jb250ZXh0KSB7XG4gICAgdGhyb3dFcnJvcihcbiAgICAgIGBtb3VudC5jb250ZXh0IGNhbiBvbmx5IGJlIHVzZWQgd2hlbiBtb3VudGluZyBhIGZ1bmN0aW9uYWwgY29tcG9uZW50YFxuICAgIClcbiAgfVxuXG4gIGlmIChvcHRpb25zLmNvbnRleHQgJiYgIWlzUGxhaW5PYmplY3Qob3B0aW9ucy5jb250ZXh0KSkge1xuICAgIHRocm93RXJyb3IoJ21vdW50LmNvbnRleHQgbXVzdCBiZSBhbiBvYmplY3QnKVxuICB9XG5cbiAgaWYgKFZVRV9WRVJTSU9OIDwgMi4zICYmIGlzQ29uc3RydWN0b3IoY29tcG9uZW50KSkge1xuICAgIFVOU1VQUE9SVEVEX1ZFUlNJT05fT1BUSU9OUy5mb3JFYWNoKG9wdGlvbiA9PiB7XG4gICAgICBpZiAob3B0aW9uc1tvcHRpb25dKSB7XG4gICAgICAgIHRocm93RXJyb3IodnVlRXh0ZW5kVW5zdXBwb3J0ZWRPcHRpb24ob3B0aW9uKSlcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgaWYgKG9wdGlvbnMuc2xvdHMpIHtcbiAgICBjb21waWxlVGVtcGxhdGVGb3JTbG90cyhvcHRpb25zLnNsb3RzKVxuICAgIC8vIHZhbGlkYXRlIHNsb3RzIG91dHNpZGUgb2YgdGhlIGNyZWF0ZVNsb3RzIGZ1bmN0aW9uIHNvXG4gICAgLy8gdGhhdCB3ZSBjYW4gdGhyb3cgYW4gZXJyb3Igd2l0aG91dCBpdCBiZWluZyBjYXVnaHQgYnlcbiAgICAvLyB0aGUgVnVlIGVycm9yIGhhbmRsZXJcbiAgICAvLyAkRmxvd0lnbm9yZVxuICAgIHZhbGlkYXRlU2xvdHMob3B0aW9ucy5zbG90cylcbiAgfVxufVxuIiwiLy8gQGZsb3dcblxuaW1wb3J0IFZ1ZSBmcm9tICd2dWUnXG5pbXBvcnQgVnVlV3JhcHBlciBmcm9tICcuL3Z1ZS13cmFwcGVyJ1xuaW1wb3J0IGNyZWF0ZUluc3RhbmNlIGZyb20gJ2NyZWF0ZS1pbnN0YW5jZSdcbmltcG9ydCBjcmVhdGVFbGVtZW50IGZyb20gJy4vY3JlYXRlLWVsZW1lbnQnXG5pbXBvcnQgeyB0aHJvd0lmSW5zdGFuY2VzVGhyZXcsIGFkZEdsb2JhbEVycm9ySGFuZGxlciB9IGZyb20gJy4vZXJyb3InXG5pbXBvcnQgeyBtZXJnZU9wdGlvbnMgfSBmcm9tICdzaGFyZWQvbWVyZ2Utb3B0aW9ucydcbmltcG9ydCBjb25maWcgZnJvbSAnLi9jb25maWcnXG5pbXBvcnQgd2FybklmTm9XaW5kb3cgZnJvbSAnLi93YXJuLWlmLW5vLXdpbmRvdydcbmltcG9ydCBjcmVhdGVXcmFwcGVyIGZyb20gJy4vY3JlYXRlLXdyYXBwZXInXG5pbXBvcnQgY3JlYXRlTG9jYWxWdWUgZnJvbSAnLi9jcmVhdGUtbG9jYWwtdnVlJ1xuaW1wb3J0IHsgd2FybiB9IGZyb20gJ3NoYXJlZC91dGlsJ1xuaW1wb3J0IHNlbXZlciBmcm9tICdzZW12ZXInXG5pbXBvcnQgeyBDT01QQVRfU1lOQ19NT0RFIH0gZnJvbSAnc2hhcmVkL2NvbnN0cydcbmltcG9ydCB7IHZhbGlkYXRlT3B0aW9ucyB9IGZyb20gJ3NoYXJlZC92YWxpZGF0ZS1vcHRpb25zJ1xuXG5WdWUuY29uZmlnLnByb2R1Y3Rpb25UaXAgPSBmYWxzZVxuVnVlLmNvbmZpZy5kZXZ0b29scyA9IGZhbHNlXG5cbmZ1bmN0aW9uIGdldFN5bmNPcHRpb24oc3luY09wdGlvbikge1xuICBpZiAoc3luY09wdGlvbiA9PT0gZmFsc2UpIHtcbiAgICBWdWUuY29uZmlnLmFzeW5jID0gdHJ1ZVxuICAgIHJldHVybiBmYWxzZVxuICB9XG4gIGlmICghc2VtdmVyLmd0KFZ1ZS52ZXJzaW9uLCAnMi41LjE3JykpIHtcbiAgICB3YXJuKFxuICAgICAgYFZ1ZSBUZXN0IFV0aWxzIHJ1bnMgaW4gc3luYyBtb2RlIGJ5IGRlZmF1bHQuIER1ZSB0byBidWdzLCBzeW5jIG1vZGUgYCArXG4gICAgICAgIGByZXF1aXJlcyBWdWUgPiAyLjUuMTguIEluIFZ1ZSBUZXN0IFV0aWxzIDEuMCBzeW5jIG1vZGUgd2lsbCBvbmx5IGJlIGAgK1xuICAgICAgICBgc3VwcG9ydGVkIHdpdGggVnVlIDIuNS4xOCBydW5uaW5nIGluIGRldmVsb3BtZW50IG1vZGUuIElmIHlvdSBhcmUgYCArXG4gICAgICAgIGB1bmFibGUgdG8gdXBncmFkZSwgeW91IHNob3VsZCByZXdyaXRlIHlvdXIgdGVzdHMgdG8gcnVuIHN5bmNocm9ub3VzbHlgICtcbiAgICAgICAgYHlvdSBjYW4gZG8gdGhpcyBieSBzZXR0aW5nIHRoZSBzeW5jIG1vdW50aW5nIG9wdGlvbiB0byBmYWxzZS5gXG4gICAgKVxuICAgIHJldHVybiBDT01QQVRfU1lOQ19NT0RFXG4gIH1cblxuICBpZiAodHlwZW9mIFZ1ZS5jb25maWcuYXN5bmMgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgd2FybihcbiAgICAgIGBTeW5jIG1vZGUgb25seSB3b3JrcyB3aGVuIFZ1ZSBydW5zIGluIGRldiBtb2RlLiBgICtcbiAgICAgICAgYFBsZWFzZSBzZXQgVnVlIHRvIHJ1biBpbiBkZXYgbW9kZSwgb3Igc2V0IHN5bmMgdG8gZmFsc2VgXG4gICAgKVxuICB9XG5cbiAgVnVlLmNvbmZpZy5hc3luYyA9IGZhbHNlXG4gIHJldHVybiB0cnVlXG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG1vdW50KFxuICBjb21wb25lbnQ6IENvbXBvbmVudCxcbiAgb3B0aW9uczogT3B0aW9ucyA9IHt9XG4pOiBWdWVXcmFwcGVyIHwgV3JhcHBlciB7XG4gIHdhcm5JZk5vV2luZG93KClcblxuICBhZGRHbG9iYWxFcnJvckhhbmRsZXIoVnVlKVxuXG4gIGNvbnN0IF9WdWUgPSBjcmVhdGVMb2NhbFZ1ZShvcHRpb25zLmxvY2FsVnVlKVxuXG4gIGNvbnN0IG1lcmdlZE9wdGlvbnMgPSBtZXJnZU9wdGlvbnMob3B0aW9ucywgY29uZmlnKVxuXG4gIHZhbGlkYXRlT3B0aW9ucyhtZXJnZWRPcHRpb25zLCBjb21wb25lbnQpXG5cbiAgY29uc3QgcGFyZW50Vm0gPSBjcmVhdGVJbnN0YW5jZShjb21wb25lbnQsIG1lcmdlZE9wdGlvbnMsIF9WdWUpXG5cbiAgY29uc3QgZWwgPSBvcHRpb25zLmF0dGFjaFRvRG9jdW1lbnQgPyBjcmVhdGVFbGVtZW50KCkgOiB1bmRlZmluZWRcbiAgY29uc3Qgdm0gPSBwYXJlbnRWbS4kbW91bnQoZWwpXG5cbiAgY29tcG9uZW50Ll9DdG9yID0ge31cblxuICB0aHJvd0lmSW5zdGFuY2VzVGhyZXcodm0pXG4gIGNvbnN0IHN5bmMgPSBnZXRTeW5jT3B0aW9uKG1lcmdlZE9wdGlvbnMuc3luYylcblxuICBjb25zdCB3cmFwcGVyT3B0aW9ucyA9IHtcbiAgICBhdHRhY2hlZFRvRG9jdW1lbnQ6ICEhbWVyZ2VkT3B0aW9ucy5hdHRhY2hUb0RvY3VtZW50LFxuICAgIHN5bmNcbiAgfVxuXG4gIGNvbnN0IHJvb3QgPSBwYXJlbnRWbS4kb3B0aW9ucy5faXNGdW5jdGlvbmFsQ29udGFpbmVyXG4gICAgPyB2bS5fdm5vZGVcbiAgICA6IHZtLiRjaGlsZHJlblswXVxuXG4gIHJldHVybiBjcmVhdGVXcmFwcGVyKHJvb3QsIHdyYXBwZXJPcHRpb25zKVxufVxuIiwiLy8gQGZsb3dcblxuaW1wb3J0IG1vdW50IGZyb20gJy4vbW91bnQnXG5pbXBvcnQgdHlwZSBWdWVXcmFwcGVyIGZyb20gJy4vdnVlLXdyYXBwZXInXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHNoYWxsb3dNb3VudChcbiAgY29tcG9uZW50OiBDb21wb25lbnQsXG4gIG9wdGlvbnM6IE9wdGlvbnMgPSB7fVxuKTogVnVlV3JhcHBlciB7XG4gIHJldHVybiBtb3VudChjb21wb25lbnQsIHtcbiAgICAuLi5vcHRpb25zLFxuICAgIHNob3VsZFByb3h5OiB0cnVlXG4gIH0pXG59XG4iLCIvLyBAZmxvd1xuY29uc3QgdG9UeXBlczogQXJyYXk8RnVuY3Rpb24+ID0gW1N0cmluZywgT2JqZWN0XVxuY29uc3QgZXZlbnRUeXBlczogQXJyYXk8RnVuY3Rpb24+ID0gW1N0cmluZywgQXJyYXldXG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgbmFtZTogJ1JvdXRlckxpbmtTdHViJyxcbiAgcHJvcHM6IHtcbiAgICB0bzoge1xuICAgICAgdHlwZTogdG9UeXBlcyxcbiAgICAgIHJlcXVpcmVkOiB0cnVlXG4gICAgfSxcbiAgICB0YWc6IHtcbiAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgIGRlZmF1bHQ6ICdhJ1xuICAgIH0sXG4gICAgZXhhY3Q6IEJvb2xlYW4sXG4gICAgYXBwZW5kOiBCb29sZWFuLFxuICAgIHJlcGxhY2U6IEJvb2xlYW4sXG4gICAgYWN0aXZlQ2xhc3M6IFN0cmluZyxcbiAgICBleGFjdEFjdGl2ZUNsYXNzOiBTdHJpbmcsXG4gICAgZXZlbnQ6IHtcbiAgICAgIHR5cGU6IGV2ZW50VHlwZXMsXG4gICAgICBkZWZhdWx0OiAnY2xpY2snXG4gICAgfVxuICB9LFxuICByZW5kZXIoaDogRnVuY3Rpb24pIHtcbiAgICByZXR1cm4gaCh0aGlzLnRhZywgdW5kZWZpbmVkLCB0aGlzLiRzbG90cy5kZWZhdWx0KVxuICB9XG59XG4iLCJpbXBvcnQgc2hhbGxvd01vdW50IGZyb20gJy4vc2hhbGxvdy1tb3VudCdcbmltcG9ydCBtb3VudCBmcm9tICcuL21vdW50J1xuaW1wb3J0IGNyZWF0ZUxvY2FsVnVlIGZyb20gJy4vY3JlYXRlLWxvY2FsLXZ1ZSdcbmltcG9ydCBUcmFuc2l0aW9uU3R1YiBmcm9tICcuL2NvbXBvbmVudHMvVHJhbnNpdGlvblN0dWInXG5pbXBvcnQgVHJhbnNpdGlvbkdyb3VwU3R1YiBmcm9tICcuL2NvbXBvbmVudHMvVHJhbnNpdGlvbkdyb3VwU3R1YidcbmltcG9ydCBSb3V0ZXJMaW5rU3R1YiBmcm9tICcuL2NvbXBvbmVudHMvUm91dGVyTGlua1N0dWInXG5pbXBvcnQgY3JlYXRlV3JhcHBlciBmcm9tICcuL2NyZWF0ZS13cmFwcGVyJ1xuaW1wb3J0IFdyYXBwZXIgZnJvbSAnLi93cmFwcGVyJ1xuaW1wb3J0IFdyYXBwZXJBcnJheSBmcm9tICcuL3dyYXBwZXItYXJyYXknXG5pbXBvcnQgY29uZmlnIGZyb20gJy4vY29uZmlnJ1xuaW1wb3J0IHsgd2FybiB9IGZyb20gJ3NoYXJlZC91dGlsJ1xuXG5mdW5jdGlvbiBzaGFsbG93KGNvbXBvbmVudCwgb3B0aW9ucykge1xuICB3YXJuKFxuICAgIGBzaGFsbG93IGhhcyBiZWVuIHJlbmFtZWQgdG8gc2hhbGxvd01vdW50LiBzaGFsbG93IGAgK1xuICAgICAgYHdpbGwgYmUgcmVtb3ZlZCBpbiAxLjAuMCwgdXNlIHNoYWxsb3dNb3VudCBpbnN0ZWFkYFxuICApXG4gIHJldHVybiBzaGFsbG93TW91bnQoY29tcG9uZW50LCBvcHRpb25zKVxufVxuXG5leHBvcnQgZGVmYXVsdCB7XG4gIGNyZWF0ZUxvY2FsVnVlLFxuICBjcmVhdGVXcmFwcGVyLFxuICBjb25maWcsXG4gIG1vdW50LFxuICBzaGFsbG93LFxuICBzaGFsbG93TW91bnQsXG4gIFRyYW5zaXRpb25TdHViLFxuICBUcmFuc2l0aW9uR3JvdXBTdHViLFxuICBSb3V0ZXJMaW5rU3R1YixcbiAgV3JhcHBlcixcbiAgV3JhcHBlckFycmF5XG59XG4iXSwibmFtZXMiOlsidGhpcyIsImNvbnN0IiwibGV0IiwiZXZlbnRUeXBlcyIsInN1cGVyIiwiY29tcGlsZVRvRnVuY3Rpb25zIiwiJCRWdWUiLCJyZXNvbHZlQ29tcG9uZW50IiwiY29tcG9uZW50Iiwic3R1YiIsImVxIiwiYXNzb2NJbmRleE9mIiwibGlzdENhY2hlQ2xlYXIiLCJsaXN0Q2FjaGVEZWxldGUiLCJsaXN0Q2FjaGVHZXQiLCJsaXN0Q2FjaGVIYXMiLCJsaXN0Q2FjaGVTZXQiLCJMaXN0Q2FjaGUiLCJnbG9iYWwiLCJmcmVlR2xvYmFsIiwicm9vdCIsImhhc093blByb3BlcnR5IiwiU3ltYm9sIiwib2JqZWN0UHJvdG8iLCJuYXRpdmVPYmplY3RUb1N0cmluZyIsInN5bVRvU3RyaW5nVGFnIiwiZ2V0UmF3VGFnIiwib2JqZWN0VG9TdHJpbmciLCJpc09iamVjdCIsImJhc2VHZXRUYWciLCJjb3JlSnNEYXRhIiwiZnVuY1Byb3RvIiwiZnVuY1RvU3RyaW5nIiwiaXNNYXNrZWQiLCJpc0Z1bmN0aW9uIiwidG9Tb3VyY2UiLCJnZXRWYWx1ZSIsImJhc2VJc05hdGl2ZSIsImdldE5hdGl2ZSIsIm5hdGl2ZUNyZWF0ZSIsIkhBU0hfVU5ERUZJTkVEIiwiaGFzaENsZWFyIiwiaGFzaERlbGV0ZSIsImhhc2hHZXQiLCJoYXNoSGFzIiwiaGFzaFNldCIsIkhhc2giLCJNYXAiLCJpc0tleWFibGUiLCJnZXRNYXBEYXRhIiwibWFwQ2FjaGVDbGVhciIsIm1hcENhY2hlRGVsZXRlIiwibWFwQ2FjaGVHZXQiLCJtYXBDYWNoZUhhcyIsIm1hcENhY2hlU2V0IiwiTWFwQ2FjaGUiLCJzdGFja0NsZWFyIiwic3RhY2tEZWxldGUiLCJzdGFja0dldCIsInN0YWNrSGFzIiwic3RhY2tTZXQiLCJkZWZpbmVQcm9wZXJ0eSIsImJhc2VBc3NpZ25WYWx1ZSIsImFzc2lnblZhbHVlIiwiaXNPYmplY3RMaWtlIiwiYmFzZUlzQXJndW1lbnRzIiwic3R1YkZhbHNlIiwiTUFYX1NBRkVfSU5URUdFUiIsImFyZ3NUYWciLCJmdW5jVGFnIiwiaXNMZW5ndGgiLCJub2RlVXRpbCIsImJhc2VVbmFyeSIsImJhc2VJc1R5cGVkQXJyYXkiLCJpc0FycmF5IiwiaXNBcmd1bWVudHMiLCJpc0J1ZmZlciIsImlzVHlwZWRBcnJheSIsImJhc2VUaW1lcyIsImlzSW5kZXgiLCJvdmVyQXJnIiwiaXNQcm90b3R5cGUiLCJuYXRpdmVLZXlzIiwiaXNBcnJheUxpa2UiLCJhcnJheUxpa2VLZXlzIiwiYmFzZUtleXMiLCJjb3B5T2JqZWN0Iiwia2V5cyIsIm5hdGl2ZUtleXNJbiIsImtleXNJbiIsImJhc2VLZXlzSW4iLCJwcm9wZXJ0eUlzRW51bWVyYWJsZSIsInN0dWJBcnJheSIsImFycmF5RmlsdGVyIiwiZ2V0U3ltYm9scyIsIm5hdGl2ZUdldFN5bWJvbHMiLCJhcnJheVB1c2giLCJnZXRQcm90b3R5cGUiLCJnZXRTeW1ib2xzSW4iLCJiYXNlR2V0QWxsS2V5cyIsIlNldCIsIm1hcFRhZyIsIm9iamVjdFRhZyIsInNldFRhZyIsIndlYWtNYXBUYWciLCJkYXRhVmlld1RhZyIsIkRhdGFWaWV3IiwiUHJvbWlzZSIsIldlYWtNYXAiLCJVaW50OEFycmF5IiwiY2xvbmVBcnJheUJ1ZmZlciIsIm1hcFRvQXJyYXkiLCJhcnJheVJlZHVjZSIsImFkZE1hcEVudHJ5IiwiQ0xPTkVfREVFUF9GTEFHIiwic2V0VG9BcnJheSIsImFkZFNldEVudHJ5IiwiYm9vbFRhZyIsImRhdGVUYWciLCJudW1iZXJUYWciLCJyZWdleHBUYWciLCJzdHJpbmdUYWciLCJhcnJheUJ1ZmZlclRhZyIsImZsb2F0MzJUYWciLCJmbG9hdDY0VGFnIiwiaW50OFRhZyIsImludDE2VGFnIiwiaW50MzJUYWciLCJ1aW50OFRhZyIsInVpbnQ4Q2xhbXBlZFRhZyIsInVpbnQxNlRhZyIsInVpbnQzMlRhZyIsImNsb25lRGF0YVZpZXciLCJjbG9uZVR5cGVkQXJyYXkiLCJjbG9uZU1hcCIsImNsb25lUmVnRXhwIiwiY2xvbmVTZXQiLCJjbG9uZVN5bWJvbCIsImJhc2VDcmVhdGUiLCJhcnJheVRhZyIsImVycm9yVGFnIiwiZ2VuVGFnIiwic3ltYm9sVGFnIiwiaW5pdENsb25lQXJyYXkiLCJjb3B5QXJyYXkiLCJnZXRUYWciLCJjbG9uZUJ1ZmZlciIsImluaXRDbG9uZU9iamVjdCIsImNvcHlTeW1ib2xzSW4iLCJiYXNlQXNzaWduSW4iLCJjb3B5U3ltYm9scyIsImJhc2VBc3NpZ24iLCJpbml0Q2xvbmVCeVRhZyIsIlN0YWNrIiwiZ2V0QWxsS2V5c0luIiwiZ2V0QWxsS2V5cyIsImFycmF5RWFjaCIsIkNMT05FX1NZTUJPTFNfRkxBRyIsImJhc2VDbG9uZSIsImNsb25lRGVlcCIsInNlbXZlciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQSxPQUFPLEdBQUcsY0FBYyxHQUFHLE1BQU0sQ0FBQzs7O1lBR3RCLElBQUksS0FBSyxDQUFDO1lBQ1YsSUFBSSxPQUFPLE9BQU8sS0FBSyxRQUFRO2dCQUMzQixPQUFPLENBQUMsR0FBRztnQkFDWCxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVU7Z0JBQ3RCLGFBQWEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUM7Z0JBQzVDLEtBQUssR0FBRyxXQUFXO2dCQUNqQixJQUFJLElBQUksR0FBRyxL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QUssVUFBVTtNQUNiLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztNQUMzQixJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztNQUNmLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztNQUNiLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLFVBQVUsQ0FBQyxDQUFDO01BQzVCLE1BQU07SUFDUixLQUFLLFVBQVU7Ozs7TUFJYixJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7TUFDM0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUFDLENBQUM7TUFDOUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsVUFBVSxDQUFDLENBQUM7TUFDNUIsTUFBTTs7O0lBR1IsS0FBSyxZQUFZO01BQ2YsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sS0FBSyxDQUFDO1VBQzlCLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxHQUFDO01BQ2hDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLFVBQVUsQ0FBQyxDQUFDO01BQzVCLE1BQU07O0lBRVIsS0FBSyxPQUFPOzs7OztNQUtWLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEtBQUssQ0FBQztVQUN0RSxJQUFJLENBQUMsS0FBSyxFQUFFLEdBQUM7TUFDZixJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztNQUNmLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO01BQ2YsSUFBSSxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUM7TUFDckIsTUFBTTtJQUNSLEtBQUssT0FBTzs7Ozs7TUFLVixJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxLQUFLLENBQUM7VUFD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QUssR0FBRyxFQUFFO1FBQ2IsSUFBSSxDQUFDLEtBQUssR0FBRztZQUNYLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxFQUFFO2dCQUNqQyxJQUFJLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFDOztZQUUxQyxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsRUFBRTtnQkFDakMsSUFBSSxHQUFHLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFDO09BQzFDO1VBQ0MsR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEVBQUU7Y0FDakMsSUFBSSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLE1BQU0sR0FBQztLQUNsQyxNQUFNO01BQ0wsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO01BQ2YsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFO1FBQ2IsSUFBSSxDQUFDLEtBQUssR0FBRztZQUNYLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7Z0JBQzVCLElBQUksR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUM7O1lBRTFDLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7Z0JBQzVCLElBQUksR0FBRyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElB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Q0FBQyxDQUFDO01BQzVCLE1BQU07SUFDUixLQUFLLFVBQVU7Ozs7TUFJYixJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7TUFDM0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUFDLENBQUM7TUFDOUIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsVUFBVSxDQUFDLENBQUM7TUFDNUIsTUFBTTs7O0lBR1IsS0FBSyxZQUFZO01BQ2YsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sS0FBSyxDQUFDO1VBQzlCLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxHQUFDO01BQ2hDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLFVBQVUsQ0FBQyxDQUFDO01BQzVCLE1BQU07O0lBRVIsS0FBSyxPQUFPOzs7OztNQUtWLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEtBQUssQ0FBQztVQUN0RSxJQUFJLENBQUMsS0FBSyxFQUFFLEdBQUM7TUFDZixJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztNQUNmLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO01BQ2YsSUFBSSxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUM7TUFDckIsTUFBTTtJQUNSLEtBQUssT0FBTzs7Ozs7TUFLVixJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxLQUFLLENBQUM7VUFDbEQsSUFBSSxDQUFDLEtBQUssRUFBRSxHQUFDO01BQ2YsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7TUFDZixJQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztNQUNyQixNQUFNO0lBQ1IsS0FBSyxPQUFPOzs7OztNQUtWLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEtBQUssQ0FBQztVQUM5QixJQUFJLENBQUMsS0FBSyxFQUFFLEdBQUM7TUFDZixJQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztNQUNyQixNQUFNOzs7SUFHUixLQUFLLEtBQUs7TUFDUixJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxLQUFLLENBQUM7VUFDOUIsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFDO1dBQ25CO1FBQ0gsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUM7UUFDL0IsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUU7VUFDZixJQUFJLE9BQU9BLE1BQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEtBQUssUUFBUSxFQUFFO1lBQzFDQSxNQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDckIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1dBQ1I7U0FDRjtRQUNELElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNWLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDO09BQzNCO01BQ0QsSUFBSSxVQUFVLEVBQUU7OztRQUdkLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsS0FBSyxVQUFVLEVBQUU7VUFDckMsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztjQUMzQixJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxHQUFDO1NBQ3JDO1lBQ0MsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsR0FBQztPQUNyQztNQUNELE1BQU07O0lBRVI7TUFDRSxNQUFNLElBQUksS0FBSyxDQUFDLDhCQUE4QixHQUFHLE9BQU8sQ0FBQyxDQUFDO0dBQzdEO0VBQ0QsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0VBQ2QsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO0VBQ3hCLE9BQU8sSUFBSSxDQUFDO0NBQ2IsQ0FBQzs7QUFFRixXQUFXLEdBQUcsR0FBRyxDQUFDO0FBQ2xCLFNBQVMsR0FBRyxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRTtFQUNoRCxJQUFJLE9BQU8sS0FBSyxDQUFDLEtBQUssUUFBUSxFQUFFO0lBQzlCLFVBQVUsR0FBRyxLQUFLLENBQUM7SUFDbkIsS0FBSyxHQUFHLFNBQVMsQ0FBQztHQUNuQjs7RUFFRCxJQUFJO0lBQ0YsT0FBTyxJQUFJLE1BQU0sQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxVQUFVLENBQUMsQ0FBQyxPQUFPLENBQUM7R0FDcEUsQ0FBQyxPQUFPLEVBQUUsRUFBRTtJQUNYLE9BQU8sSUFBSSxDQUFDO0dBQ2I7Q0FDRjs7QUFFRCxZQUFZLEdBQUcsSUFBSSxDQUFDO0FBQ3BCLFNBQVMsSUFBSSxDQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUU7RUFDaEMsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxFQUFFO0lBQzFCLE9BQU8sSUFBSSxDQUFDO0dBQ2IsTUFBTTtJQUNMLElBQUksRUFBRSxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUN6QixJQUFJLEVBQUUsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDekIsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLE1BQU0sSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRTtNQUNoRCxLQUFLLElBQUksR0FBRyxJQUFJLEVBQUUsRUFBRTtRQUNsQixJQUFJLEdBQUcsS0FBSyxPQUFPLElBQUksR0FBRyxLQUFLLE9BQU8sSUFBSSxHQUFHLEtBQUssT0FBTyxFQUFFO1VBQ3pELElBQUksRUFBRSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUN2QixPQUFPLEtBQUssQ0FBQyxHQUFHLENBQUM7V0FDbEI7U0FDRjtPQUNGO01BQ0QsT0FBTyxZQUFZLENBQUM7S0FDckI7SUFDRCxLQUFLLElBQUksR0FBRyxJQUFJLEVBQUUsRUFBRTtNQUNsQixJQUFJLEdBQUcsS0FBSyxPQUFPLElBQUksR0FBRyxLQUFLLE9BQU8sSUFBSSxHQUFHLEtBQUssT0FBTyxFQUFFO1FBQ3pELElBQUksRUFBRSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRTtVQUN2QixPQUFPLEdBQUcsQ0FBQztTQUNaO09BQ0Y7S0FDRjtHQUNGO0NBQ0Y7O0FBRUQsMEJBQTBCLEdBQUcsa0JBQWtCLENBQUM7O0FBRWhELElBQUksT0FBTyxHQUFHLFVBQVUsQ0FBQztBQUN6QixTQUFTLGtCQUFrQixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUU7RUFDaEMsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUMzQixJQUFJLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDOztFQUUzQixJQUFJLElBQUksSUFBSSxJQUFJLEVBQUU7SUFDaEIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0dBQ1I7O0VBRUQsT0FBTyxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLENBQUM7U0FDcEIsQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQztTQUNuQixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUNWLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQztTQUNULENBQUMsQ0FBQztDQUNWOztBQUVELDJCQUEyQixHQUFHLG1CQUFtQixDQUFDO0FBQ2xELFNBQVMsbUJBQW1CLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRTtFQUNqQyxPQUFPLGtCQUFrQixDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztDQUNqQzs7QUFFRCxhQUFhLEdBQUcsS0FBSyxDQUFDO0FBQ3RCLFNBQVMsS0FBSyxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUU7RUFDdkIsT0FBTyxJQUFJLE1BQU0sQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDO0NBQ25DOztBQUVELGFBQWEsR0FBRyxLQUFLLENBQUM7QUFDdEIsU0FBUyxLQUFLLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRTtFQUN2QixPQUFPLElBQUksTUFBTSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUM7Q0FDbkM7O0FBRUQsYUFBYSxHQUFHLEtBQUssQ0FBQztBQUN0QixTQUFTLEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFO0VBQ3ZCLE9BQU8sSUFBSSxNQUFNLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQztDQUNuQzs7QUFFRCxlQUFlLEdBQUcsT0FBTyxDQUFDO0FBQzFCLFNBQVMsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFO0VBQzVCLE9BQU8sSUFBSSxNQUFNLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLE1BQU0sQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztDQUMzRDs7QUFFRCxvQkFBb0IsR0FBRyxZQUFZLENBQUM7QUFDcEMsU0FBUyxZQUFZLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRTtFQUMxQixPQUFPLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0NBQzVCOztBQUVELGdCQUFnQixHQUFHLFFBQVEsQ0FBQztBQUM1QixTQUFTLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRTtFQUM3QixPQUFPLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO0NBQzdCOztBQUVELFlBQVksR0FBRyxJQUFJLENBQUM7QUFDcEIsU0FBUyxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRTtFQUN6QixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxFQUFFO0lBQzlCLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO0dBQ3JDLENBQUMsQ0FBQztDQUNKOztBQUVELGFBQWEsR0FBRyxLQUFLLENBQUM7QUFDdEIsU0FBUyxLQUFLLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRTtFQUMxQixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxFQUFFO0lBQzlCLE9BQU8sT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDO0dBQ3RDLENBQUMsQ0FBQztDQUNKOztBQUVELFVBQVUsR0FBRyxFQUFFLENBQUM7QUFDaEIsU0FBUyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUU7RUFDdkIsT0FBTyxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7Q0FDakM7O0FBRUQsVUFBVSxHQUFHLEVBQUUsQ0FBQztBQUNoQixTQUFTLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRTtFQUN2QixPQUFPLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUNqQzs7QUFFRCxVQUFVLEdBQUcsRUFBRSxDQUFDO0FBQ2hCLFNBQVMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFO0VBQ3ZCLE9BQU8sT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0NBQ25DOztBQUVELFdBQVcsR0FBRyxHQUFHLENBQUM7QUFDbEIsU0FBUyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUU7RUFDeEIsT0FBTyxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7Q0FDbkM7O0FBRUQsV0FBVyxHQUFHLEdBQUcsQ0FBQztBQUNsQixTQUFTLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRTtFQUN4QixPQUFPLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztDQUNsQzs7QUFFRCxXQUFXLEdBQUcsR0FBRyxDQUFDO0FBQ2xCLFNBQVMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFO0VBQ3hCLE9BQU8sT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0NBQ2xDOztBQUVELFdBQVcsR0FBRyxHQUFHLENBQUM7QUFDbEIsU0FBUyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFO0VBQzVCLElBQUksR0FBRyxDQUFDO0VBQ1IsUUFBUSxFQUFFO0lBQ1IsS0FBSyxLQUFLO01BQ1IsSUFBSSxPQUFPLENBQUMsS0FBSyxRQUFRLElBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLEdBQUM7TUFDekMsSUFBSSxPQUFPLENBQUMsS0FBSyxRQUFRLElBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLEdBQUM7TUFDekMsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7TUFDZCxNQUFNO0lBQ1IsS0FBSyxLQUFLO01BQ1IsSUFBSSxPQUFPLENBQUMsS0FBSyxRQUFRLElBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLEdBQUM7TUFDekMsSUFBSSxPQUFPLENBQUMsS0FBSyxRQUFRLElBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLEdBQUM7TUFDekMsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7TUFDZCxNQUFNO0lBQ1IsS0FBSyxFQUFFLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEtBQUssSUFBSSxFQUFFLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU07SUFDM0QsS0FBSyxJQUFJLEVBQUUsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsTUFBTTtJQUN6QyxLQUFLLEdBQUcsRUFBRSxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNO0lBQ3ZDLEtBQUssSUFBSSxFQUFFLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU07SUFDekMsS0FBSyxHQUFHLEVBQUUsR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsTUFBTTtJQUN2QyxLQUFLLElBQUksRUFBRSxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNO0lBQ3pDLFNBQVMsTUFBTSxJQUFJLFNBQVMsQ0FBQyxvQkFBb0IsR0FBRyxFQUFFLENBQUMsQ0FBQztHQUN6RDtFQUNELE9BQU8sR0FBRyxDQUFDO0NBQ1o7O0FBRUQsa0JBQWtCLEdBQUcsVUFBVSxDQUFDO0FBQ2hDLFNBQVMsVUFBVSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUU7RUFDL0IsSUFBSSxJQUFJLFlBQVksVUFBVSxFQUFFO0lBQzlCLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxLQUFLO1FBQ3RCLE9BQU8sSUFBSSxHQUFDOztRQUVaLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFDO0dBQ3JCOztFQUVELElBQUksRUFBRSxJQUFJLFlBQVksVUFBVSxDQUFDO01BQy9CLE9BQU8sSUFBSSxVQUFVLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxHQUFDOztFQUVyQyxLQUFLLENBQUMsWUFBWSxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztFQUNqQyxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztFQUNuQixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDOztFQUVqQixJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssR0FBRztNQUNyQixJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsR0FBQzs7TUFFaEIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxHQUFDOztFQUVuRCxLQUFLLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO0NBQ3JCOztBQUVELElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQztBQUNiLFVBQVUsQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLFNBQVMsSUFBSSxFQUFFO0VBQzFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLGVBQWUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsQ0FBQztFQUMxRCxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDOztFQUV0QixJQUFJLENBQUMsQ0FBQztNQUNKLE1BQU0sSUFBSSxTQUFTLENBQUMsc0JBQXNCLEdBQUcsSUFBSSxDQUFDLEdBQUM7O0VBRXJELElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ3JCLElBQUksSUFBSSxDQUFDLFFBQVEsS0FBSyxHQUFHO01BQ3ZCLElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxHQUFDOzs7RUFHckIsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7TUFDUCxJQUFJLENBQUMsTUFBTSxHQUFHLEdBQUcsR0FBQzs7TUFFbEIsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFDO0NBQzlDLENBQUM7O0FBRUYsVUFBVSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEdBQUcsV0FBVztFQUN6QyxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUM7Q0FDbkIsQ0FBQzs7QUFFRixVQUFVLENBQUMsU0FBUyxDQUFDLElBQUksR0FBRyxTQUFTLE9BQU8sRUFBRTtFQUM1QyxLQUFLLENBQUMsaUJBQWlCLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQzs7RUFFOUMsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLEdBQUc7TUFDckIsT0FBTyxJQUFJLEdBQUM7O0VBRWQsSUFBSSxPQUFPLE9BQU8sS0FBSyxRQUFRO01BQzdCLE9BQU8sR0FBRyxJQUFJLE1BQU0sQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFDOztFQUU1QyxPQUFPLEdBQUcsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztDQUM3RCxDQUFDOztBQUVGLFVBQVUsQ0FBQyxTQUFTLENBQUMsVUFBVSxHQUFHLFNBQVMsSUFBSSxFQUFFLEtBQUssRUFBRTtFQUN0RCxJQUFJLEVBQUUsSUFBSSxZQUFZLFVBQVUsQ0FBQyxFQUFFO0lBQ2pDLE1BQU0sSUFBSSxTQUFTLENBQUMsMEJBQTBCLENBQUMsQ0FBQztHQUNqRDs7RUFFRCxJQUFJLFFBQVEsQ0FBQzs7RUFFYixJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssRUFBRSxFQUFFO0lBQ3hCLFFBQVEsR0FBRyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3hDLE9BQU8sU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO0dBQy9DLE1BQU0sSUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLEVBQUUsRUFBRTtJQUMvQixRQUFRLEdBQUcsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztJQUN4QyxPQUFPLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztHQUNoRDs7RUFFRCxJQUFJLHVCQUF1QjtJQUN6QixDQUFDLElBQUksQ0FBQyxRQUFRLEtBQUssSUFBSSxJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssR0FBRztLQUMvQyxJQUFJLENBQUMsUUFBUSxLQUFLLElBQUksSUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLEdBQUcsQ0FBQyxDQUFDO0VBQ3BELElBQUksdUJBQXVCO0lBQ3pCLENBQUMsSUFBSSxDQUFDLFFBQVEsS0FBSyxJQUFJLElBQUksSUFBSSxDQUFDLFFBQVEsS0FBSyxHQUFHO0tBQy9DLElBQUksQ0FBQyxRQUFRLEtBQUssSUFBSSxJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssR0FBRyxDQUFDLENBQUM7RUFDcEQsSUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEtBQUssSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUM7RUFDN0QsSUFBSSw0QkFBNEI7SUFDOUIsQ0FBQyxJQUFJLENBQUMsUUFBUSxLQUFLLElBQUksSUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLElBQUk7S0FDaEQsSUFBSSxDQUFDLFFBQVEsS0FBSyxJQUFJLElBQUksSUFBSSxDQUFDLFFBQVEsS0FBSyxJQUFJLENBQUMsQ0FBQztFQUNyRCxJQUFJLDBCQUEwQjtJQUM1QixHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUM7S0FDeEMsQ0FBQyxJQUFJLENBQUMsUUFBUSxLQUFLLElBQUksSUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLEdBQUc7S0FDaEQsSUFBSSxDQUFDLFFBQVEsS0FBSyxJQUFJLElBQUksSUFBSSxDQUFDLFFBQVEsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO0VBQ3JELElBQUksNkJBQTZCO0lBQy9CLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQztLQUN4QyxDQUFDLElBQUksQ0FBQyxRQUFRLEtBQUssSUFBSSxJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssR0FBRztLQUNoRCxJQUFJLENBQUMsUUFBUSxLQUFLLElBQUksSUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7O0VBRXJELE9BQU8sdUJBQXVCLElBQUksdUJBQXVCO0tBQ3RELFVBQVUsSUFBSSw0QkFBNEIsQ0FBQztJQUM1QywwQkFBMEIsSUFBSSw2QkFBNkIsQ0FBQztDQUMvRCxDQUFDOzs7QUFHRixhQUFhLEdBQUcsS0FBSyxDQUFDO0FBQ3RCLFNBQVMsS0FBSyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUU7RUFDM0IsSUFBSSxLQUFLLFlBQVksS0FBSyxFQUFFO0lBQzFCLElBQUksS0FBSyxDQUFDLEtBQUssS0FBSyxLQUFLLEVBQUU7TUFDekIsT0FBTyxLQUFLLENBQUM7S0FDZCxNQUFNO01BQ0wsT0FBTyxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO0tBQ3BDO0dBQ0Y7O0VBRUQsSUFBSSxLQUFLLFlBQVksVUFBVSxFQUFFO0lBQy9CLE9BQU8sSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztHQUN0Qzs7RUFFRCxJQUFJLEVBQUUsSUFBSSxZQUFZLEtBQUssQ0FBQztNQUMxQixPQUFPLElBQUksS0FBSyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsR0FBQzs7RUFFakMsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7OztFQUduQixJQUFJLENBQUMsR0FBRyxHQUFHLEtBQUssQ0FBQztFQUNqQixJQUFJLENBQUMsR0FBRyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUMsR0FBRyxDQUFDLFNBQVMsS0FBSyxFQUFFO0lBQ3ZELE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztHQUN0QyxFQUFFLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsRUFBRTs7SUFFMUIsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDO0dBQ2pCLENBQUMsQ0FBQzs7RUFFSCxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUU7SUFDcEIsTUFBTSxJQUFJLFNBQVMsQ0FBQyx3QkFBd0IsR0FBRyxLQUFLLENBQUMsQ0FBQztHQUN2RDs7RUFFRCxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7Q0FDZjs7QUFFRCxLQUFLLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxXQUFXO0VBQ2xDLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsU0FBUyxLQUFLLEVBQUU7SUFDeEMsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0dBQy9CLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7RUFDckIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDO0NBQ25CLENBQUM7O0FBRUYsS0FBSyxDQUFDLFNBQVMsQ0FBQyxRQUFRLEdBQUcsV0FBVztFQUNwQyxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUM7Q0FDbkIsQ0FBQzs7QUFFRixLQUFLLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBRyxTQUFTLEtBQUssRUFBRTtFQUMzQyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0VBQ3ZCLEtBQUssR0FBRyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7RUFDckIsS0FBSyxDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7O0VBRTdCLElBQUksRUFBRSxHQUFHLEtBQUssR0FBRyxFQUFFLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxFQUFFLENBQUMsV0FBVyxDQUFDLENBQUM7RUFDeEQsS0FBSyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLGFBQWEsQ0FBQyxDQUFDO0VBQ3pDLEtBQUssQ0FBQyxnQkFBZ0IsRUFBRSxLQUFLLENBQUMsQ0FBQzs7RUFFL0IsS0FBSyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLGNBQWMsQ0FBQyxFQUFFLHFCQUFxQixDQUFDLENBQUM7RUFDakUsS0FBSyxDQUFDLGlCQUFpQixFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQzs7O0VBR3BELEtBQUssR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDOzs7RUFHdkQsS0FBSyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUFFLGdCQUFnQixDQUFDLENBQUM7OztFQUd2RCxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7Ozs7O0VBS3JDLElBQUksTUFBTSxHQUFHLEtBQUssR0FBRyxFQUFFLENBQUMsZUFBZSxDQUFDLEdBQUcsRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0VBQzFELElBQUksR0FBRyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLFNBQVMsSUFBSSxFQUFFO0lBQzVDLE9BQU8sZUFBZSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztHQUNyQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztFQUMxQixJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7O0lBRWQsR0FBRyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsU0FBUyxJQUFJLEVBQUU7TUFDOUIsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUM3QixDQUFDLENBQUM7R0FDSjtFQUNELEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLFNBQVMsSUFBSSxFQUFFO0lBQzNCLE9BQU8sSUFBSSxVQUFVLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO0dBQ3BDLENBQUMsQ0FBQzs7RUFFSCxPQUFPLEdBQUcsQ0FBQztDQUNaLENBQUM7O0FBRUYsS0FBSyxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUcsU0FBUyxLQUFLLEVBQUUsS0FBSyxFQUFFO0VBQ2xELElBQUksRUFBRSxLQUFLLFlBQVksS0FBSyxDQUFDLEVBQUU7SUFDN0IsTUFBTSxJQUFJLFNBQVMsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0dBQzVDOztFQUVELE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxlQUFlLEVBQUU7SUFDN0MsT0FBTyxlQUFlLENBQUMsS0FBSyxDQUFDLFNBQVMsY0FBYyxFQUFFO01BQ3BELE9BQU8sS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxnQkFBZ0IsRUFBRTtRQUMvQyxPQUFPLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxTQUFTLGVBQWUsRUFBRTtVQUN0RCxPQUFPLGNBQWMsQ0FBQyxVQUFVLENBQUMsZUFBZSxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQzFELENBQUMsQ0FBQztPQUNKLENBQUMsQ0FBQztLQUNKLENBQUMsQ0FBQztHQUNKLENBQUMsQ0FBQztDQUNKLENBQUM7OztBQUdGLHFCQUFxQixHQUFHLGFBQWEsQ0FBQztBQUN0QyxTQUFTLGFBQWEsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFO0VBQ25DLE9BQU8sSUFBSSxLQUFLLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsU0FBUyxJQUFJLEVBQUU7SUFDcEQsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFO01BQzFCLE9BQU8sQ0FBQyxDQUFDLEtBQUssQ0FBQztLQUNoQixDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztHQUNoQyxDQUFDLENBQUM7Q0FDSjs7Ozs7QUFLRCxTQUFTLGVBQWUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFO0VBQ3BDLEtBQUssQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7RUFDcEIsSUFBSSxHQUFHLGFBQWEsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7RUFDbEMsS0FBSyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztFQUNyQixJQUFJLEdBQUcsYUFBYSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztFQUNsQyxLQUFLLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO0VBQ3RCLElBQUksR0FBRyxjQUFjLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO0VBQ25DLEtBQUssQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7RUFDdEIsSUFBSSxHQUFHLFlBQVksQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7RUFDakMsS0FBSyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztFQUNyQixPQUFPLElBQUksQ0FBQztDQUNiOztBQUVELFNBQVMsR0FBRyxDQUFDLEVBQUUsRUFBRTtFQUNmLE9BQU8sQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSxLQUFLLEdBQUcsSUFBSSxFQUFFLEtBQUssR0FBRyxDQUFDO0NBQ3REOzs7Ozs7OztBQVFELFNBQVMsYUFBYSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUU7RUFDbEMsT0FBTyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxTQUFTLElBQUksRUFBRTtJQUNqRCxPQUFPLFlBQVksQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7R0FDbEMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUNkOztBQUVELFNBQVMsWUFBWSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUU7RUFDakMsSUFBSSxDQUFDLEdBQUcsS0FBSyxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUM7RUFDM0MsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUU7SUFDOUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQ3JDLElBQUksR0FBRyxDQUFDOztJQUVSLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNSLEdBQUcsR0FBRyxFQUFFLEdBQUM7U0FDTixJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDYixHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxRQUFRLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsTUFBTSxHQUFDO1NBQzNDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQzs7UUFFYixHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLE1BQU0sR0FBRyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksR0FBQztTQUMzRCxJQUFJLEVBQUUsRUFBRTtNQUNYLEtBQUssQ0FBQyxpQkFBaUIsRUFBRSxFQUFFLENBQUMsQ0FBQztNQUM3QixJQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRztVQUN0QixFQUFFLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBQztNQUNoQixHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsRUFBRTtZQUNqQyxJQUFJLEdBQUcsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUM7S0FDeEM7O1FBRUMsR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUM1QixJQUFJLEdBQUcsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUM7O0lBRXpDLEtBQUssQ0FBQyxjQUFjLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDM0IsT0FBTyxHQUFHLENBQUM7R0FDWixDQUFDLENBQUM7Q0FDSjs7Ozs7Ozs7QUFRRCxTQUFTLGFBQWEsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFO0VBQ2xDLE9BQU8sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsU0FBUyxJQUFJLEVBQUU7SUFDakQsT0FBTyxZQUFZLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO0dBQ2xDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7Q0FDZDs7QUFFRCxTQUFTLFlBQVksQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFO0VBQ2pDLEtBQUssQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO0VBQzVCLElBQUksQ0FBQyxHQUFHLEtBQUssR0FBRyxFQUFFLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDO0VBQzNDLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsU0FBUyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFO0lBQzlDLEtBQUssQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUNyQyxJQUFJLEdBQUcsQ0FBQzs7SUFFUixJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDUixHQUFHLEdBQUcsRUFBRSxHQUFDO1NBQ04sSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ2IsR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsUUFBUSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLE1BQU0sR0FBQztTQUMzQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRTtNQUNmLElBQUksQ0FBQyxLQUFLLEdBQUc7VUFDWCxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLE1BQU0sR0FBRyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksR0FBQzs7VUFFOUQsR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxNQUFNLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsTUFBTSxHQUFDO0tBQ3pELE1BQU0sSUFBSSxFQUFFLEVBQUU7TUFDYixLQUFLLENBQUMsaUJBQWlCLEVBQUUsRUFBRSxDQUFDLENBQUM7TUFDN0IsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUc7VUFDdEIsRUFBRSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUM7TUFDaEIsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFO1FBQ2IsSUFBSSxDQUFDLEtBQUssR0FBRztZQUNYLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxFQUFFO2dCQUNqQyxJQUFJLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFDOztZQUUxQyxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsRUFBRTtnQkFDakMsSUFBSSxHQUFHLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFDO09BQzFDO1VBQ0MsR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEVBQUU7Y0FDakMsSUFBSSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLE1BQU0sR0FBQztLQUNsQyxNQUFNO01BQ0wsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO01BQ2YsSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFO1FBQ2IsSUFBSSxDQUFDLEtBQUssR0FBRztZQUNYLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7Z0JBQzVCLElBQUksR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUM7O1lBRTFDLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7Z0JBQzVCLElBQUksR0FBRyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksR0FBQztPQUMxQztVQUNDLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7Y0FDNUIsSUFBSSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLE1BQU0sR0FBQztLQUNsQzs7SUFFRCxLQUFLLENBQUMsY0FBYyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lB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
