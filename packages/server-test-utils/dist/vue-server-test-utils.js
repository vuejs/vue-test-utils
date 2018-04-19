'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var vueTemplateCompiler = require('vue-template-compiler');
var vueTemplateCompiler__default = _interopDefault(vueTemplateCompiler);
var Vue = _interopDefault(require('vue'));
var vueServerRenderer = require('vue-server-renderer');
var cheerio = _interopDefault(require('cheerio'));

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

function addSlotToVm (vm, slotName, slotValue) {
  var elem;
  if (typeof slotValue === 'string') {
    if (!vueTemplateCompiler.compileToFunctions) {
      throwError('vueTemplateCompiler is undefined, you must pass components explicitly if vue-template-compiler is undefined');
    }
    if (window.navigator.userAgent.match(/PhantomJS/i)) {
      throwError('the slots option does not support strings in PhantomJS. Please use Puppeteer, or pass a component.');
    }
    var domParser = new window.DOMParser();
    var _document = domParser.parseFromString(slotValue, 'text/html');
    var _slotValue = slotValue.trim();
    if (_slotValue[0] === '<' && _slotValue[_slotValue.length - 1] === '>' && _document.body.childElementCount === 1) {
      elem = vm.$createElement(vueTemplateCompiler.compileToFunctions(slotValue));
    } else {
      var compiledResult = vueTemplateCompiler.compileToFunctions(("<div>" + slotValue + "{{ }}</div>"));
      var _staticRenderFns = vm._renderProxy.$options.staticRenderFns;
      vm._renderProxy.$options.staticRenderFns = compiledResult.staticRenderFns;
      elem = compiledResult.render.call(vm._renderProxy, vm.$createElement).children;
      vm._renderProxy.$options.staticRenderFns = _staticRenderFns;
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

function addAttrs (vm, attrs) {
  var originalSilent = Vue.config.silent;
  Vue.config.silent = true;
  if (attrs) {
    vm.$attrs = attrs;
  } else {
    vm.$attrs = {};
  }
  Vue.config.silent = originalSilent;
}

function addListeners (vm, listeners) {
  var originalSilent = Vue.config.silent;
  Vue.config.silent = true;
  if (listeners) {
    vm.$listeners = listeners;
  } else {
    vm.$listeners = {};
  }
  Vue.config.silent = originalSilent;
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

function componentNeedsCompiling (component) {
  return component &&
    !component.render &&
    (component.template || component.extends) &&
    !component.functional
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
  vue
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

  var Constructor = vue.extend(component);

  var instanceOptions = Object.assign({}, options);
  deleteMountingOptions(instanceOptions);
  if (options.stubs) {
    instanceOptions.components = Object.assign({}, instanceOptions.components,
      // $FlowIgnore
      createComponentStubs(component.components, options.stubs));
  }

  var vm = new Constructor(instanceOptions);

  addAttrs(vm, options.attrs);
  addListeners(vm, options.listeners);

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
          var proxy = {};
          var helpers = ['_c', '_o', '_n', '_s', '_l', '_t', '_q', '_i', '_m', '_f', '_k', '_b', '_v', '_e', '_u', '_g'];
          helpers.forEach(function (key) {
            proxy[key] = vm._renderProxy[key];
          });
          proxy[slotScope] = props;
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

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function _interopDefault$1 (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Vue$1 = _interopDefault$1(Vue);


// 

function throwError$1 (msg) {
  throw new Error(("[vue-test-utils]: " + msg))
}

function warn$1 (msg) {
  console.error(("[vue-test-utils]: " + msg));
}

var camelizeRE$1 = /-(\w)/g;
var camelize$1 = function (str) { return str.replace(camelizeRE$1, function (_, c) { return c ? c.toUpperCase() : ''; }); };

/**
 * Capitalize a string.
 */
var capitalize$1 = function (str) { return str.charAt(0).toUpperCase() + str.slice(1); };

/**
 * Hyphenate a camelCase string.
 */
var hyphenateRE$1 = /\B([A-Z])/g;
var hyphenate$1 = function (str) { return str.replace(hyphenateRE$1, '-$1').toLowerCase(); };

if (typeof window === 'undefined') {
  throwError$1(
    'window is undefined, vue-test-utils needs to be run in a browser environment.\n' +
    'You can run the tests in node using jsdom + jsdom-global.\n' +
    'See https://vue-test-utils.vuejs.org/en/guides/common-tips.html for more details.'
  );
}

if (!Element.prototype.matches) {
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

// 

function isDomSelector$1 (selector) {
  if (typeof selector !== 'string') {
    return false
  }

  try {
    if (typeof document === 'undefined') {
      throwError$1('mount must be run in a browser environment like PhantomJS, jsdom or chrome');
    }
  } catch (error) {
    throwError$1('mount must be run in a browser environment like PhantomJS, jsdom or chrome');
  }

  try {
    document.querySelector(selector);
    return true
  } catch (error) {
    return false
  }
}

function isVueComponent$2 (component) {
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

function componentNeedsCompiling$1 (component) {
  return component &&
    !component.render &&
    (component.template || component.extends) &&
    !component.functional
}

function isRefSelector$1 (refOptionsObject) {
  if (typeof refOptionsObject !== 'object' || Object.keys(refOptionsObject || {}).length !== 1) {
    return false
  }

  return typeof refOptionsObject.ref === 'string'
}

function isNameSelector$1 (nameOptionsObject) {
  if (typeof nameOptionsObject !== 'object' || nameOptionsObject === null) {
    return false
  }

  return !!nameOptionsObject.name
}

var NAME_SELECTOR = 'NAME_SELECTOR';
var COMPONENT_SELECTOR = 'COMPONENT_SELECTOR';
var REF_SELECTOR = 'REF_SELECTOR';
var DOM_SELECTOR = 'DOM_SELECTOR';
var VUE_VERSION = Number(((Vue$1.version.split('.')[0]) + "." + (Vue$1.version.split('.')[1])));
var FUNCTIONAL_OPTIONS = VUE_VERSION >= 2.5 ? 'fnOptions' : 'functionalOptions';

// 

function getSelectorTypeOrThrow (selector, methodName) {
  if (isDomSelector$1(selector)) { return DOM_SELECTOR }
  if (isNameSelector$1(selector)) { return NAME_SELECTOR }
  if (isVueComponent$2(selector)) { return COMPONENT_SELECTOR }
  if (isRefSelector$1(selector)) { return REF_SELECTOR }

  throwError$1(("wrapper." + methodName + "() must be passed a valid CSS selector, Vue constructor, or valid find option object"));
}

// 

function findAllVueComponentsFromVm (
  vm,
  components
) {
  if ( components === void 0 ) { components = []; }

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
  if ( components === void 0 ) { components = []; }

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
  if ( components === void 0 ) { components = []; }

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
    throwError$1('find for functional components is not support in Vue < 2.3');
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
    throwError$1(("no item exists at " + index));
  }
  return this.wrappers[index]
};

WrapperArray.prototype.attributes = function attributes () {
  this.throwErrorIfWrappersIsEmpty('attributes');

  throwError$1('attributes must be called on a single wrapper, use at(i) to access a wrapper');
};

WrapperArray.prototype.classes = function classes () {
  this.throwErrorIfWrappersIsEmpty('classes');

  throwError$1('classes must be called on a single wrapper, use at(i) to access a wrapper');
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

  throwError$1('emitted must be called on a single wrapper, use at(i) to access a wrapper');
};

WrapperArray.prototype.emittedByOrder = function emittedByOrder () {
  this.throwErrorIfWrappersIsEmpty('emittedByOrder');

  throwError$1('emittedByOrder must be called on a single wrapper, use at(i) to access a wrapper');
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

  throwError$1('findAll must be called on a single wrapper, use at(i) to access a wrapper');
};

WrapperArray.prototype.find = function find () {
  this.throwErrorIfWrappersIsEmpty('find');

  throwError$1('find must be called on a single wrapper, use at(i) to access a wrapper');
};

WrapperArray.prototype.html = function html () {
  this.throwErrorIfWrappersIsEmpty('html');

  throwError$1('html must be called on a single wrapper, use at(i) to access a wrapper');
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

  throwError$1('name must be called on a single wrapper, use at(i) to access a wrapper');
};

WrapperArray.prototype.props = function props () {
  this.throwErrorIfWrappersIsEmpty('props');

  throwError$1('props must be called on a single wrapper, use at(i) to access a wrapper');
};

WrapperArray.prototype.text = function text () {
  this.throwErrorIfWrappersIsEmpty('text');

  throwError$1('text must be called on a single wrapper, use at(i) to access a wrapper');
};

WrapperArray.prototype.throwErrorIfWrappersIsEmpty = function throwErrorIfWrappersIsEmpty (method) {
  if (this.wrappers.length === 0) {
    throwError$1((method + " cannot be called on 0 items"));
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
  warn$1('update has been removed. All changes are now synchrnous without calling update');
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
  throwError$1(("find did not return " + (this.selector) + ", cannot call at() on empty Wrapper"));
};

ErrorWrapper.prototype.attributes = function attributes () {
  throwError$1(("find did not return " + (this.selector) + ", cannot call attributes() on empty Wrapper"));
};

ErrorWrapper.prototype.classes = function classes () {
  throwError$1(("find did not return " + (this.selector) + ", cannot call classes() on empty Wrapper"));
};

ErrorWrapper.prototype.contains = function contains () {
  throwError$1(("find did not return " + (this.selector) + ", cannot call contains() on empty Wrapper"));
};

ErrorWrapper.prototype.emitted = function emitted () {
  throwError$1(("find did not return " + (this.selector) + ", cannot call emitted() on empty Wrapper"));
};

ErrorWrapper.prototype.emittedByOrder = function emittedByOrder () {
  throwError$1(("find did not return " + (this.selector) + ", cannot call emittedByOrder() on empty Wrapper"));
};

ErrorWrapper.prototype.exists = function exists () {
  return false
};

ErrorWrapper.prototype.filter = function filter () {
  throwError$1(("find did not return " + (this.selector) + ", cannot call filter() on empty Wrapper"));
};

ErrorWrapper.prototype.visible = function visible () {
  throwError$1(("find did not return " + (this.selector) + ", cannot call visible() on empty Wrapper"));
};

ErrorWrapper.prototype.hasAttribute = function hasAttribute () {
  throwError$1(("find did not return " + (this.selector) + ", cannot call hasAttribute() on empty Wrapper"));
};

ErrorWrapper.prototype.hasClass = function hasClass () {
  throwError$1(("find did not return " + (this.selector) + ", cannot call hasClass() on empty Wrapper"));
};

ErrorWrapper.prototype.hasProp = function hasProp () {
  throwError$1(("find did not return " + (this.selector) + ", cannot call hasProp() on empty Wrapper"));
};

ErrorWrapper.prototype.hasStyle = function hasStyle () {
  throwError$1(("find did not return " + (this.selector) + ", cannot call hasStyle() on empty Wrapper"));
};

ErrorWrapper.prototype.findAll = function findAll () {
  throwError$1(("find did not return " + (this.selector) + ", cannot call findAll() on empty Wrapper"));
};

ErrorWrapper.prototype.find = function find () {
  throwError$1(("find did not return " + (this.selector) + ", cannot call find() on empty Wrapper"));
};

ErrorWrapper.prototype.html = function html () {
  throwError$1(("find did not return " + (this.selector) + ", cannot call html() on empty Wrapper"));
};

ErrorWrapper.prototype.is = function is () {
  throwError$1(("find did not return " + (this.selector) + ", cannot call is() on empty Wrapper"));
};

ErrorWrapper.prototype.isEmpty = function isEmpty () {
  throwError$1(("find did not return " + (this.selector) + ", cannot call isEmpty() on empty Wrapper"));
};

ErrorWrapper.prototype.isVisible = function isVisible () {
  throwError$1(("find did not return " + (this.selector) + ", cannot call isVisible() on empty Wrapper"));
};

ErrorWrapper.prototype.isVueInstance = function isVueInstance () {
  throwError$1(("find did not return " + (this.selector) + ", cannot call isVueInstance() on empty Wrapper"));
};

ErrorWrapper.prototype.name = function name () {
  throwError$1(("find did not return " + (this.selector) + ", cannot call name() on empty Wrapper"));
};

ErrorWrapper.prototype.props = function props () {
  throwError$1(("find did not return " + (this.selector) + ", cannot call props() on empty Wrapper"));
};

ErrorWrapper.prototype.text = function text () {
  throwError$1(("find did not return " + (this.selector) + ", cannot call text() on empty Wrapper"));
};

ErrorWrapper.prototype.setComputed = function setComputed () {
  throwError$1(("find did not return " + (this.selector) + ", cannot call setComputed() on empty Wrapper"));
};

ErrorWrapper.prototype.setData = function setData () {
  throwError$1(("find did not return " + (this.selector) + ", cannot call setData() on empty Wrapper"));
};

ErrorWrapper.prototype.setMethods = function setMethods () {
  throwError$1(("find did not return " + (this.selector) + ", cannot call setMethods() on empty Wrapper"));
};

ErrorWrapper.prototype.setProps = function setProps () {
  throwError$1(("find did not return " + (this.selector) + ", cannot call setProps() on empty Wrapper"));
};

ErrorWrapper.prototype.trigger = function trigger () {
  throwError$1(("find did not return " + (this.selector) + ", cannot call trigger() on empty Wrapper"));
};

ErrorWrapper.prototype.update = function update () {
  throwError$1("update has been removed from vue-test-utils. All updates are now synchronous by default");
};

ErrorWrapper.prototype.destroy = function destroy () {
  throwError$1(("find did not return " + (this.selector) + ", cannot call destroy() on empty Wrapper"));
};

// 

function findAllVNodes (vnode, nodes) {
  if ( nodes === void 0 ) { nodes = []; }

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
      throwError$1('$ref selectors can only be used on Vue component wrappers');
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
    throwError$1('cannot find a Vue instance on a DOM node. The node you are calling find on does not exist in the VDom. Are you adding the node as innerHTML?');
  }

  if (selectorType === COMPONENT_SELECTOR || selectorType === NAME_SELECTOR) {
    var root = vm || vnode;
    if (!root) {
      return []
    }
    return findVueComponents(root, selectorType, selector)
  }

  if (vm && vm.$refs && selector.ref in vm.$refs && vm.$refs[selector.ref] instanceof Vue$1) {
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
  return node instanceof Vue$1
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

  orderDeps(vm._watcher);

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
  this.version = Number(((Vue$1.version.split('.')[0]) + "." + (Vue$1.version.split('.')[1])));
};

Wrapper.prototype.at = function at () {
  throwError$1('at() must be called on a WrapperArray');
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
    throwError$1('wrapper.emitted() can only be called on a Vue instance');
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
    throwError$1('wrapper.emittedByOrder() can only be called on a Vue instance');
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
  throwError$1('filter() must be called on a WrapperArray');
};

/**
 * Utility to check wrapper is visible. Returns false if a parent element has display: none or visibility: hidden style.
 */
Wrapper.prototype.visible = function visible () {
  warn$1('visible has been deprecated and will be removed in version 1, use isVisible instead');

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
  warn$1('hasAttribute() has been deprecated and will be removed in version 1.0.0. Use attributes() instead—https://vue-test-utils.vuejs.org/en/api/wrapper/attributes');

  if (typeof attribute !== 'string') {
    throwError$1('wrapper.hasAttribute() must be passed attribute as a string');
  }

  if (typeof value !== 'string') {
    throwError$1('wrapper.hasAttribute() must be passed value as a string');
  }

  return !!(this.element && this.element.getAttribute(attribute) === value)
};

/**
 * Asserts wrapper has a class name
 */
Wrapper.prototype.hasClass = function hasClass (className) {
    var this$1 = this;

  warn$1('hasClass() has been deprecated and will be removed in version 1.0.0. Use classes() instead—https://vue-test-utils.vuejs.org/en/api/wrapper/classes');
  var targetClass = className;

  if (typeof targetClass !== 'string') {
    throwError$1('wrapper.hasClass() must be passed a string');
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
  warn$1('hasProp() has been deprecated and will be removed in version 1.0.0. Use props() instead—https://vue-test-utils.vuejs.org/en/api/wrapper/props');

  if (!this.isVueComponent) {
    throwError$1('wrapper.hasProp() must be called on a Vue instance');
  }
  if (typeof prop !== 'string') {
    throwError$1('wrapper.hasProp() must be passed prop as a string');
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
  warn$1('hasStyle() has been deprecated and will be removed in version 1.0.0. Use wrapper.element.style instead');

  if (typeof style !== 'string') {
    throwError$1('wrapper.hasStyle() must be passed style as a string');
  }

  if (typeof value !== 'string') {
    throwError$1('wrapper.hasClass() must be passed value as string');
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
    throwError$1('$ref selectors can not be used with wrapper.is()');
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
    throwError$1('wrapper.props() cannot be called on a mounted functional component.');
  }
  if (!this.vm) {
    throwError$1('wrapper.props() must be called on a Vue instance');
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
    throwError$1('wrapper.setData() canot be called on a functional component');
  }

  if (!this.vm) {
    throwError$1('wrapper.setData() can only be called on a Vue instance');
  }

  Object.keys(data).forEach(function (key) {
    // $FlowIgnore : Problem with possibly null this.vm
    this$1.vm.$set(this$1.vm, [key], data[key]);
  });
};

/**
 * Sets vm computed
 */
Wrapper.prototype.setComputed = function setComputed (computed) {
    var this$1 = this;

  if (!this.isVueComponent) {
    throwError$1('wrapper.setComputed() can only be called on a Vue instance');
  }

  warn$1('setComputed() has been deprecated and will be removed in version 1.0.0. You can overwrite computed properties by passing a computed object in the mounting options');

  Object.keys(computed).forEach(function (key) {
    if (this$1.version > 2.1) {
      // $FlowIgnore : Problem with possibly null this.vm
      if (!this$1.vm._computedWatchers[key]) {
        throwError$1(("wrapper.setComputed() was passed a value that does not exist as a computed property on the Vue instance. Property " + key + " does not exist on the Vue instance"));
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
        throwError$1(("wrapper.setComputed() was passed a value that does not exist as a computed property on the Vue instance. Property " + key + " does not exist on the Vue instance"));
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
    throwError$1('wrapper.setMethods() can only be called on a Vue instance');
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
    throwError$1('wrapper.setProps() canot be called on a functional component');
  }
  if (!this.isVueComponent || !this.vm) {
    throwError$1('wrapper.setProps() can only be called on a Vue instance');
  }
  if (this.vm && this.vm.$options && !this.vm.$options.propsData) {
    this.vm.$options.propsData = {};
  }
  Object.keys(data).forEach(function (key) {
    // Ignore properties that were not specified in the component options
    // $FlowIgnore : Problem with possibly null this.vm
    if (!this$1.vm.$options._propKeys || !this$1.vm.$options._propKeys.includes(key)) {
      throwError$1(("wrapper.setProps() called with " + key + " property which is not defined on component"));
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
};

/**
 * Return text of wrapper element
 */
Wrapper.prototype.text = function text () {
  if (!this.element) {
    throwError$1('cannot call wrapper.text() on a wrapper without an element');
  }

  return this.element.textContent.trim()
};

/**
 * Calls destroy on vm
 */
Wrapper.prototype.destroy = function destroy () {
  if (!this.isVueComponent) {
    throwError$1('wrapper.destroy() can only be called on a Vue instance');
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
    if ( options === void 0 ) { options = {}; }

  if (typeof type !== 'string') {
    throwError$1('wrapper.trigger() must be passed a string');
  }

  if (!this.element) {
    throwError$1('cannot call wrapper.trigger() on a wrapper without an element');
  }

  if (options.target) {
    throwError$1('you cannot set the target value of an event. See the notes section of the docs for more details—https://vue-test-utils.vuejs.org/en/api/wrapper/trigger.html');
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
  warn$1('update has been removed from vue-test-utils. All updates are now synchronous by default');
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

  if ( Wrapper$$1 ) { VueWrapper.__proto__ = Wrapper$$1; }
  VueWrapper.prototype = Object.create( Wrapper$$1 && Wrapper$$1.prototype );
  VueWrapper.prototype.constructor = VueWrapper;

  return VueWrapper;
}(Wrapper));

// 

function isValidSlot$1 (slot) {
  return Array.isArray(slot) || (slot !== null && typeof slot === 'object') || typeof slot === 'string'
}

function validateSlots$1 (slots) {
  slots && Object.keys(slots).forEach(function (key) {
    if (!isValidSlot$1(slots[key])) {
      throwError$1('slots[key] must be a Component, string or an array of Components');
    }

    if (Array.isArray(slots[key])) {
      slots[key].forEach(function (slotValue) {
        if (!isValidSlot$1(slotValue)) {
          throwError$1('slots[key] must be a Component, string or an array of Components');
        }
      });
    }
  });
}

// 

function addSlotToVm$1 (vm, slotName, slotValue) {
  var elem;
  if (typeof slotValue === 'string') {
    if (!vueTemplateCompiler__default.compileToFunctions) {
      throwError$1('vueTemplateCompiler is undefined, you must pass components explicitly if vue-template-compiler is undefined');
    }
    if (window.navigator.userAgent.match(/PhantomJS/i)) {
      throwError$1('the slots option does not support strings in PhantomJS. Please use Puppeteer, or pass a component.');
    }
    var domParser = new window.DOMParser();
    var _document = domParser.parseFromString(slotValue, 'text/html');
    var _slotValue = slotValue.trim();
    if (_slotValue[0] === '<' && _slotValue[_slotValue.length - 1] === '>' && _document.body.childElementCount === 1) {
      elem = vm.$createElement(vueTemplateCompiler__default.compileToFunctions(slotValue));
    } else {
      var compiledResult = vueTemplateCompiler__default.compileToFunctions(("<div>" + slotValue + "{{ }}</div>"));
      var _staticRenderFns = vm._renderProxy.$options.staticRenderFns;
      vm._renderProxy.$options.staticRenderFns = compiledResult.staticRenderFns;
      elem = compiledResult.render.call(vm._renderProxy, vm.$createElement).children;
      vm._renderProxy.$options.staticRenderFns = _staticRenderFns;
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

function addSlots$1 (vm, slots) {
  validateSlots$1(slots);
  Object.keys(slots).forEach(function (key) {
    if (Array.isArray(slots[key])) {
      slots[key].forEach(function (slotValue) {
        addSlotToVm$1(vm, key, slotValue);
      });
    } else {
      addSlotToVm$1(vm, key, slots[key]);
    }
  });
}

// 

function addScopedSlots$1 (vm, scopedSlots) {
  Object.keys(scopedSlots).forEach(function (key) {
    var template = scopedSlots[key].trim();
    if (template.substr(0, 9) === '<template') {
      throwError$1('the scopedSlots option does not support a template tag as the root element.');
    }
    var domParser = new window.DOMParser();
    var _document = domParser.parseFromString(template, 'text/html');
    vm.$_vueTestUtils_scopedSlots[key] = vueTemplateCompiler__default.compileToFunctions(template).render;
    vm.$_vueTestUtils_slotScopes[key] = _document.body.firstChild.getAttribute('slot-scope');
  });
}

// 

function addMocks$1 (mockedProperties, Vue$$1) {
  Object.keys(mockedProperties).forEach(function (key) {
    try {
      Vue$$1.prototype[key] = mockedProperties[key];
    } catch (e) {
      warn$1(("could not overwrite property " + key + ", this usually caused by a plugin that has added the property as a read-only value"));
    }
    Vue$1.util.defineReactive(Vue$$1, key, mockedProperties[key]);
  });
}

function addAttrs$1 (vm, attrs) {
  var originalSilent = Vue$1.config.silent;
  Vue$1.config.silent = true;
  if (attrs) {
    vm.$attrs = attrs;
  } else {
    vm.$attrs = {};
  }
  Vue$1.config.silent = originalSilent;
}

function addListeners$1 (vm, listeners) {
  var originalSilent = Vue$1.config.silent;
  Vue$1.config.silent = true;
  if (listeners) {
    vm.$listeners = listeners;
  } else {
    vm.$listeners = {};
  }
  Vue$1.config.silent = originalSilent;
}

function addProvide$1 (component, optionProvide, options) {
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

function logEvents$1 (vm, emitted, emittedByOrder) {
  var emit = vm.$emit;
  vm.$emit = function (name) {
    var arguments$1 = arguments;

    var args = [], len = arguments.length - 1;
    while ( len-- > 0 ) { args[ len ] = arguments$1[ len + 1 ]; }

    (emitted[name] || (emitted[name] = [])).push(args);
    emittedByOrder.push({ name: name, args: args });
    return emit.call.apply(emit, [ vm, name ].concat( args ))
  };
}

function addEventLogger$1 (vue) {
  vue.mixin({
    beforeCreate: function () {
      this.__emitted = Object.create(null);
      this.__emittedByOrder = [];
      logEvents$1(this, this.__emitted, this.__emittedByOrder);
    }
  });
}

// 

function compileTemplate$2 (component) {
  if (component.components) {
    Object.keys(component.components).forEach(function (c) {
      var cmp = component.components[c];
      if (!cmp.render) {
        compileTemplate$2(cmp);
      }
    });
  }
  if (component.extends) {
    compileTemplate$2(component.extends);
  }
  if (component.template) {
    Object.assign(component, vueTemplateCompiler__default.compileToFunctions(component.template));
  }
}

// 

function isVueComponent$1$1 (comp) {
  return comp && (comp.render || comp.template || comp.options)
}

function isValidStub$1 (stub) {
  return !!stub &&
      typeof stub === 'string' ||
      (stub === true) ||
      (isVueComponent$1$1(stub))
}

function isRequiredComponent$1 (name) {
  return name === 'KeepAlive' || name === 'Transition' || name === 'TransitionGroup'
}

function getCoreProperties$1 (component) {
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
function createStubFromString$1 (templateString, originalComponent) {
  if (!vueTemplateCompiler__default.compileToFunctions) {
    throwError$1('vueTemplateCompiler is undefined, you must pass components explicitly if vue-template-compiler is undefined');
  }

  if (templateString.indexOf(hyphenate$1(originalComponent.name)) !== -1 ||
  templateString.indexOf(capitalize$1(originalComponent.name)) !== -1 ||
  templateString.indexOf(camelize$1(originalComponent.name)) !== -1) {
    throwError$1('options.stub cannot contain a circular reference');
  }

  return Object.assign({}, getCoreProperties$1(originalComponent),
    vueTemplateCompiler__default.compileToFunctions(templateString))
}

function createBlankStub$1 (originalComponent) {
  return Object.assign({}, getCoreProperties$1(originalComponent),
    {render: function (h) { return h(''); }})
}

function createComponentStubs$1 (originalComponents, stubs) {
  if ( originalComponents === void 0 ) { originalComponents = {}; }

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
        throwError$1('each item in an options.stubs array must be a string');
      }
      components[stub] = createBlankStub$1({});
    });
  } else {
    Object.keys(stubs).forEach(function (stub) {
      if (stubs[stub] === false) {
        return
      }
      if (!isValidStub$1(stubs[stub])) {
        throwError$1('options.stub values must be passed a string or component');
      }
      if (stubs[stub] === true) {
        components[stub] = createBlankStub$1({});
        return
      }

      if (componentNeedsCompiling$1(stubs[stub])) {
        compileTemplate$2(stubs[stub]);
      }

      if (originalComponents[stub]) {
        // Remove cached constructor
        delete originalComponents[stub]._Ctor;
        if (typeof stubs[stub] === 'string') {
          components[stub] = createStubFromString$1(stubs[stub], originalComponents[stub]);
        } else {
          components[stub] = Object.assign({}, stubs[stub],
            {name: originalComponents[stub].name});
        }
      } else {
        if (typeof stubs[stub] === 'string') {
          if (!vueTemplateCompiler__default.compileToFunctions) {
            throwError$1('vueTemplateCompiler is undefined, you must pass components explicitly if vue-template-compiler is undefined');
          }
          components[stub] = Object.assign({}, vueTemplateCompiler__default.compileToFunctions(stubs[stub]));
        } else {
          components[stub] = Object.assign({}, stubs[stub]);
        }
      }
      // ignoreElements does not exist in Vue 2.0.x
      if (Vue$1.config.ignoredElements) {
        Vue$1.config.ignoredElements.push(stub);
      }
    });
  }
  return components
}

function stubComponents$1 (components, stubbedComponents) {
  Object.keys(components).forEach(function (component) {
    // Remove cached constructor
    delete components[component]._Ctor;
    if (!components[component].name) {
      components[component].name = component;
    }
    stubbedComponents[component] = createBlankStub$1(components[component]);

    // ignoreElements does not exist in Vue 2.0.x
    if (Vue$1.config.ignoredElements) {
      Vue$1.config.ignoredElements.push(component);
    }
  });
}

function createComponentStubsForAll$1 (component) {
  var stubbedComponents = {};

  if (component.components) {
    stubComponents$1(component.components, stubbedComponents);
  }

  var extended = component.extends;

  // Loop through extended component chains to stub all child components
  while (extended) {
    if (extended.components) {
      stubComponents$1(extended.components, stubbedComponents);
    }
    extended = extended.extends;
  }

  if (component.extendOptions && component.extendOptions.components) {
    stubComponents$1(component.extendOptions.components, stubbedComponents);
  }

  return stubbedComponents
}

function createComponentStubsForGlobals$1 (instance) {
  var components = {};
  Object.keys(instance.options.components).forEach(function (c) {
    if (isRequiredComponent$1(c)) {
      return
    }

    components[c] = createBlankStub$1(instance.options.components[c]);
    delete instance.options.components[c]._Ctor; // eslint-disable-line no-param-reassign
    delete components[c]._Ctor; // eslint-disable-line no-param-reassign
  });
  return components
}

// 

function compileTemplate$1$1 (component) {
  if (component.components) {
    Object.keys(component.components).forEach(function (c) {
      var cmp = component.components[c];
      if (!cmp.render) {
        compileTemplate$1$1(cmp);
      }
    });
  }
  if (component.extends) {
    compileTemplate$1$1(component.extends);
  }
  if (component.template) {
    Object.assign(component, vueTemplateCompiler__default.compileToFunctions(component.template));
  }
}

function deleteMountingOptions$1 (options) {
  delete options.attachToDocument;
  delete options.mocks;
  delete options.slots;
  delete options.localVue;
  delete options.stubs;
  delete options.context;
  delete options.clone;
  delete options.attrs;
  delete options.listeners;
}

// 

function createFunctionalSlots$1 (slots, h) {
  if ( slots === void 0 ) { slots = {}; }

  if (Array.isArray(slots.default)) {
    return slots.default.map(h)
  }

  if (typeof slots.default === 'string') {
    return [h(vueTemplateCompiler__default.compileToFunctions(slots.default))]
  }
  var children = [];
  Object.keys(slots).forEach(function (slotType) {
    if (Array.isArray(slots[slotType])) {
      slots[slotType].forEach(function (slot) {
        var component = typeof slot === 'string' ? vueTemplateCompiler__default.compileToFunctions(slot) : slot;
        var newSlot = h(component);
        newSlot.data.slot = slotType;
        children.push(newSlot);
      });
    } else {
      var component = typeof slots[slotType] === 'string' ? vueTemplateCompiler__default.compileToFunctions(slots[slotType]) : slots[slotType];
      var slot = h(component);
      slot.data.slot = slotType;
      children.push(slot);
    }
  });
  return children
}

function createFunctionalComponent$1 (component, mountingOptions) {
  if (mountingOptions.context && typeof mountingOptions.context !== 'object') {
    throwError$1('mount.context must be an object');
  }
  if (mountingOptions.slots) {
    validateSlots$1(mountingOptions.slots);
  }

  return {
    render: function render (h) {
      return h(
        component,
        mountingOptions.context || component.FunctionalRenderContext,
        (mountingOptions.context && mountingOptions.context.children && mountingOptions.context.children.map(function (x) { return typeof x === 'function' ? x(h) : x; })) || createFunctionalSlots$1(mountingOptions.slots, h)
      )
    },
    name: component.name,
    _isFunctionalContainer: true
  }
}

// 

function createInstance$1 (
  component,
  options,
  vue
) {
  if (options.mocks) {
    addMocks$1(options.mocks, vue);
  }

  if ((component.options && component.options.functional) || component.functional) {
    component = createFunctionalComponent$1(component, options);
  } else if (options.context) {
    throwError$1(
      'mount.context can only be used when mounting a functional component'
    );
  }

  if (options.provide) {
    addProvide$1(component, options.provide, options);
  }

  if (componentNeedsCompiling$1(component)) {
    compileTemplate$1$1(component);
  }

  addEventLogger$1(vue);

  var Constructor = vue.extend(component);

  var instanceOptions = Object.assign({}, options);
  deleteMountingOptions$1(instanceOptions);
  if (options.stubs) {
    instanceOptions.components = Object.assign({}, instanceOptions.components,
      // $FlowIgnore
      createComponentStubs$1(component.components, options.stubs));
  }

  var vm = new Constructor(instanceOptions);

  addAttrs$1(vm, options.attrs);
  addListeners$1(vm, options.listeners);

  if (options.scopedSlots) {
    if (window.navigator.userAgent.match(/PhantomJS/i)) {
      throwError$1('the scopedSlots option does not support PhantomJS. Please use Puppeteer, or pass a component.');
    }
    var vueVersion = Number(((Vue$1.version.split('.')[0]) + "." + (Vue$1.version.split('.')[1])));
    if (vueVersion >= 2.5) {
      vm.$_vueTestUtils_scopedSlots = {};
      vm.$_vueTestUtils_slotScopes = {};
      var renderSlot = vm._renderProxy._t;

      vm._renderProxy._t = function (name, feedback, props, bindObject) {
        var scopedSlotFn = vm.$_vueTestUtils_scopedSlots[name];
        var slotScope = vm.$_vueTestUtils_slotScopes[name];
        if (scopedSlotFn) {
          props = Object.assign({}, bindObject, props);
          var proxy = {};
          var helpers = ['_c', '_o', '_n', '_s', '_l', '_t', '_q', '_i', '_m', '_f', '_k', '_b', '_v', '_e', '_u', '_g'];
          helpers.forEach(function (key) {
            proxy[key] = vm._renderProxy[key];
          });
          proxy[slotScope] = props;
          return scopedSlotFn.call(proxy)
        } else {
          return renderSlot.call(vm._renderProxy, name, feedback, props, bindObject)
        }
      };

      // $FlowIgnore
      addScopedSlots$1(vm, options.scopedSlots);
    } else {
      throwError$1('the scopedSlots option is only supported in vue@2.5+.');
    }
  }

  if (options.slots) {
    addSlots$1(vm, options.slots);
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

var commonjsGlobal$1 = typeof window !== 'undefined' ? window : typeof commonjsGlobal !== 'undefined' ? commonjsGlobal : typeof self !== 'undefined' ? self : {};

function createCommonjsModule$1(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof commonjsGlobal$1 == 'object' && commonjsGlobal$1 && commonjsGlobal$1.Object === Object && commonjsGlobal$1;

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
var hasOwnProperty$4 = objectProto$5.hasOwnProperty;

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
  if (!(hasOwnProperty$4.call(object, key) && eq_1(objValue, value)) ||
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
var hasOwnProperty$5 = objectProto$6.hasOwnProperty;

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
  return isObjectLike_1(value) && hasOwnProperty$5.call(value, 'callee') &&
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

var isBuffer_1 = createCommonjsModule$1(function (module, exports) {
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

var _nodeUtil = createCommonjsModule$1(function (module, exports) {
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
var hasOwnProperty$6 = objectProto$7.hasOwnProperty;

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
    if ((inherited || hasOwnProperty$6.call(value, key)) &&
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
var hasOwnProperty$7 = objectProto$9.hasOwnProperty;

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
    if (hasOwnProperty$7.call(object, key) && key != 'constructor') {
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

var _cloneBuffer = createCommonjsModule$1(function (module, exports) {
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
var Set = _getNative(_root, 'Set');

var _Set = Set;

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
var hasOwnProperty$9 = objectProto$12.hasOwnProperty;

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
  if (length && typeof array[0] == 'string' && hasOwnProperty$9.call(array, 'index')) {
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

function errorHandler (errorOrString, vm) {
  var error = (typeof errorOrString === 'object')
    ? errorOrString
    : new Error(errorOrString);

  vm._error = error;

  throw error
}

// 

function createLocalVue () {
  var instance = Vue$1.extend();

  // clone global APIs
  Object.keys(Vue$1).forEach(function (key) {
    if (!instance.hasOwnProperty(key)) {
      var original = Vue$1[key];
      instance[key] = typeof original === 'object'
        ? cloneDeep_1(original)
        : original;
    }
  });

  // config is not enumerable
  instance.config = cloneDeep_1(Vue$1.config);

  instance.config.errorHandler = errorHandler;

  // option merge strategies need to be exposed by reference
  // so that merge strats registered by plugins can work properly
  instance.config.optionMergeStrategies = Vue$1.config.optionMergeStrategies;

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
    var arguments$1 = arguments;

    var rest = [], len = arguments.length - 1;
    while ( len-- > 0 ) { rest[ len ] = arguments$1[ len + 1 ]; }

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
    if (Array.isArray(options)) {
      return options.concat( Object.keys(config[key] || {}))
    } else {
      return Object.assign({}, config[key],
        options)
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
    methods: getOptions('methods', options.methods, config)})
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
      warn$1(
        '<transition> can only be used on a single element. Use ' +
         '<transition-group> for lists.'
      );
    }

    var mode = this.mode;

    // warn invalid mode
    if (mode && mode !== 'in-out' && mode !== 'out-in'
    ) {
      warn$1(
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
};

// 

var TransitionGroupStub = {
  render: function render (h) {
    var tag = this.tag || this.$vnode.data.tag || 'span';
    var children = this.$slots.default || [];

    return h(tag, null, children)
  }
};

var config = {
  stubs: {
    transition: TransitionStub,
    'transition-group': TransitionGroupStub
  },
  mocks: {},
  methods: {}
};

// 

Vue$1.config.productionTip = false;
Vue$1.config.devtools = false;
Vue$1.config.errorHandler = errorHandler;

function mount (component, options) {
  if ( options === void 0 ) { options = {}; }

  // Remove cached constructor
  delete component._Ctor;
  var vueClass = options.localVue || createLocalVue();
  var vm = createInstance$1(component, mergeOptions(options, config), vueClass);

  if (options.attachToDocument) {
    vm.$mount(createElement());
  } else {
    vm.$mount();
  }

  var componentWithError = findAllVueComponentsFromVm(vm).find(function (c) { return c._error; });

  if (componentWithError) {
    throw (componentWithError._error)
  }

  var wrappperOptions = {
    attachedToDocument: !!options.attachToDocument,
    sync: !!((options.sync || options.sync === undefined))
  };

  return new VueWrapper(vm, wrappperOptions)
}

// 

function shallow (
  component,
  options
) {
  if ( options === void 0 ) { options = {}; }

  var vue = options.localVue || Vue$1;

  // remove any recursive components added to the constructor
  // in vm._init from previous tests
  if (component.name && component.components) {
    delete component.components[capitalize$1(camelize$1(component.name))];
    delete component.components[hyphenate$1(component.name)];
  }

  var stubbedComponents = createComponentStubsForAll$1(component);
  var stubbedGlobalComponents = createComponentStubsForGlobals$1(vue);

  return mount(component, Object.assign({}, options,
    {components: Object.assign({}, stubbedGlobalComponents,
      stubbedComponents)}))
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
};

var index = {
  createLocalVue: createLocalVue,
  config: config,
  mount: mount,
  shallow: shallow,
  TransitionStub: TransitionStub,
  TransitionGroupStub: TransitionGroupStub,
  RouterLinkStub: RouterLinkStub
};

var vueTestUtils = index;

// 

function getOptions$1 (key, options, config) {
  if (options ||
    (config[key] && Object.keys(config[key]).length > 0)) {
    if (Array.isArray(options)) {
      return options.concat( Object.keys(config[key] || {}))
    } else {
      return Object.assign({}, config[key],
        options)
    }
  }
}

function mergeOptions$1 (
  options,
  config
) {
  return Object.assign({}, options,
    {stubs: getOptions$1('stubs', options.stubs, config),
    mocks: getOptions$1('mocks', options.mocks, config),
    methods: getOptions$1('methods', options.methods, config)})
}

var config$1 = vueTestUtils.config

// 

Vue.config.productionTip = false;
Vue.config.devtools = false;

function renderToString (component, options) {
  if ( options === void 0 ) options = {};

  var renderer = vueServerRenderer.createRenderer();

  if (!renderer) {
    throwError('renderToString must be run in node. It cannot be run in a browser');
  }
  // Remove cached constructor
  delete component._Ctor;

  if (options.attachToDocument) {
    throwError('you cannot use attachToDocument with renderToString');
  }
  var vueClass = options.localVue || vueTestUtils.createLocalVue();
  var vm = createInstance(component, mergeOptions$1(options, config$1), vueClass);
  var renderedString = '';

  // $FlowIgnore
  renderer.renderToString(vm, function (err, res) {
    if (err) {
      console.log(err);
    }
    renderedString = res;
  });
  return renderedString
}

// 

function render (component, options) {
  if ( options === void 0 ) options = {};

  var renderedString = renderToString(component, options);
  return cheerio.load('')(renderedString)
}

var index$1 = {
  renderToString: renderToString,
  config: config$1,
  render: render
}

module.exports = index$1;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidnVlLXNlcnZlci10ZXN0LXV0aWxzLmpzIiwic291cmNlcyI6WyIuLi8uLi9zaGFyZWQvdXRpbC5qcyIsIi4uLy4uL2NyZWF0ZS1pbnN0YW5jZS92YWxpZGF0ZS1zbG90cy5qcyIsIi4uLy4uL2NyZWF0ZS1pbnN0YW5jZS9hZGQtc2xvdHMuanMiLCIuLi8uLi9jcmVhdGUtaW5zdGFuY2UvYWRkLXNjb3BlZC1zbG90cy5qcyIsIi4uLy4uL2NyZWF0ZS1pbnN0YW5jZS9hZGQtbW9ja3MuanMiLCIuLi8uLi9jcmVhdGUtaW5zdGFuY2UvYWRkLWF0dHJzLmpzIiwiLi4vLi4vY3JlYXRlLWluc3RhbmNlL2FkZC1saXN0ZW5lcnMuanMiLCIuLi8uLi9jcmVhdGUtaW5zdGFuY2UvYWRkLXByb3ZpZGUuanMiLCIuLi8uLi9jcmVhdGUtaW5zdGFuY2UvbG9nLWV2ZW50cy5qcyIsIi4uLy4uL3NoYXJlZC92YWxpZGF0b3JzLmpzIiwiLi4vLi4vc2hhcmVkL2NvbXBpbGUtdGVtcGxhdGUuanMiLCIuLi8uLi9zaGFyZWQvc3R1Yi1jb21wb25lbnRzLmpzIiwiLi4vLi4vY3JlYXRlLWluc3RhbmNlL2NvbXBpbGUtdGVtcGxhdGUuanMiLCIuLi8uLi9jcmVhdGUtaW5zdGFuY2UvZGVsZXRlLW1vdW50aW5nLW9wdGlvbnMuanMiLCIuLi8uLi9jcmVhdGUtaW5zdGFuY2UvY3JlYXRlLWZ1bmN0aW9uYWwtY29tcG9uZW50LmpzIiwiLi4vLi4vY3JlYXRlLWluc3RhbmNlL2NyZWF0ZS1pbnN0YW5jZS5qcyIsIi4uLy4uL3Rlc3QtdXRpbHMvZGlzdC92dWUtdGVzdC11dGlscy5qcyIsIi4uLy4uL3NoYXJlZC9tZXJnZS1vcHRpb25zLmpzIiwiLi4vc3JjL2NvbmZpZy5qcyIsIi4uL3NyYy9yZW5kZXJUb1N0cmluZy5qcyIsIi4uL3NyYy9yZW5kZXIuanMiLCIuLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQGZsb3dcblxuZXhwb3J0IGZ1bmN0aW9uIHRocm93RXJyb3IgKG1zZzogc3RyaW5nKSB7XG4gIHRocm93IG5ldyBFcnJvcihgW3Z1ZS10ZXN0LXV0aWxzXTogJHttc2d9YClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdhcm4gKG1zZzogc3RyaW5nKSB7XG4gIGNvbnNvbGUuZXJyb3IoYFt2dWUtdGVzdC11dGlsc106ICR7bXNnfWApXG59XG5cbmNvbnN0IGNhbWVsaXplUkUgPSAvLShcXHcpL2dcbmV4cG9ydCBjb25zdCBjYW1lbGl6ZSA9IChzdHI6IHN0cmluZykgPT4gc3RyLnJlcGxhY2UoY2FtZWxpemVSRSwgKF8sIGMpID0+IGMgPyBjLnRvVXBwZXJDYXNlKCkgOiAnJylcblxuLyoqXG4gKiBDYXBpdGFsaXplIGEgc3RyaW5nLlxuICovXG5leHBvcnQgY29uc3QgY2FwaXRhbGl6ZSA9IChzdHI6IHN0cmluZykgPT4gc3RyLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgc3RyLnNsaWNlKDEpXG5cbi8qKlxuICogSHlwaGVuYXRlIGEgY2FtZWxDYXNlIHN0cmluZy5cbiAqL1xuY29uc3QgaHlwaGVuYXRlUkUgPSAvXFxCKFtBLVpdKS9nXG5leHBvcnQgY29uc3QgaHlwaGVuYXRlID0gKHN0cjogc3RyaW5nKSA9PiBzdHIucmVwbGFjZShoeXBoZW5hdGVSRSwgJy0kMScpLnRvTG93ZXJDYXNlKClcbiIsIi8vIEBmbG93XG5cbmltcG9ydCB7IHRocm93RXJyb3IgfSBmcm9tICdzaGFyZWQvdXRpbCdcblxuZnVuY3Rpb24gaXNWYWxpZFNsb3QgKHNsb3Q6IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gQXJyYXkuaXNBcnJheShzbG90KSB8fCAoc2xvdCAhPT0gbnVsbCAmJiB0eXBlb2Ygc2xvdCA9PT0gJ29iamVjdCcpIHx8IHR5cGVvZiBzbG90ID09PSAnc3RyaW5nJ1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVTbG90cyAoc2xvdHM6IE9iamVjdCk6IHZvaWQge1xuICBzbG90cyAmJiBPYmplY3Qua2V5cyhzbG90cykuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgaWYgKCFpc1ZhbGlkU2xvdChzbG90c1trZXldKSkge1xuICAgICAgdGhyb3dFcnJvcignc2xvdHNba2V5XSBtdXN0IGJlIGEgQ29tcG9uZW50LCBzdHJpbmcgb3IgYW4gYXJyYXkgb2YgQ29tcG9uZW50cycpXG4gICAgfVxuXG4gICAgaWYgKEFycmF5LmlzQXJyYXkoc2xvdHNba2V5XSkpIHtcbiAgICAgIHNsb3RzW2tleV0uZm9yRWFjaCgoc2xvdFZhbHVlKSA9PiB7XG4gICAgICAgIGlmICghaXNWYWxpZFNsb3Qoc2xvdFZhbHVlKSkge1xuICAgICAgICAgIHRocm93RXJyb3IoJ3Nsb3RzW2tleV0gbXVzdCBiZSBhIENvbXBvbmVudCwgc3RyaW5nIG9yIGFuIGFycmF5IG9mIENvbXBvbmVudHMnKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cbiAgfSlcbn1cbiIsIi8vIEBmbG93XG5cbmltcG9ydCB7IGNvbXBpbGVUb0Z1bmN0aW9ucyB9IGZyb20gJ3Z1ZS10ZW1wbGF0ZS1jb21waWxlcidcbmltcG9ydCB7IHRocm93RXJyb3IgfSBmcm9tICdzaGFyZWQvdXRpbCdcbmltcG9ydCB7IHZhbGlkYXRlU2xvdHMgfSBmcm9tICcuL3ZhbGlkYXRlLXNsb3RzJ1xuXG5mdW5jdGlvbiBhZGRTbG90VG9WbSAodm06IENvbXBvbmVudCwgc2xvdE5hbWU6IHN0cmluZywgc2xvdFZhbHVlOiBDb21wb25lbnQgfCBzdHJpbmcgfCBBcnJheTxDb21wb25lbnQ+IHwgQXJyYXk8c3RyaW5nPik6IHZvaWQge1xuICBsZXQgZWxlbVxuICBpZiAodHlwZW9mIHNsb3RWYWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICBpZiAoIWNvbXBpbGVUb0Z1bmN0aW9ucykge1xuICAgICAgdGhyb3dFcnJvcigndnVlVGVtcGxhdGVDb21waWxlciBpcyB1bmRlZmluZWQsIHlvdSBtdXN0IHBhc3MgY29tcG9uZW50cyBleHBsaWNpdGx5IGlmIHZ1ZS10ZW1wbGF0ZS1jb21waWxlciBpcyB1bmRlZmluZWQnKVxuICAgIH1cbiAgICBpZiAod2luZG93Lm5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL1BoYW50b21KUy9pKSkge1xuICAgICAgdGhyb3dFcnJvcigndGhlIHNsb3RzIG9wdGlvbiBkb2VzIG5vdCBzdXBwb3J0IHN0cmluZ3MgaW4gUGhhbnRvbUpTLiBQbGVhc2UgdXNlIFB1cHBldGVlciwgb3IgcGFzcyBhIGNvbXBvbmVudC4nKVxuICAgIH1cbiAgICBjb25zdCBkb21QYXJzZXIgPSBuZXcgd2luZG93LkRPTVBhcnNlcigpXG4gICAgY29uc3QgX2RvY3VtZW50ID0gZG9tUGFyc2VyLnBhcnNlRnJvbVN0cmluZyhzbG90VmFsdWUsICd0ZXh0L2h0bWwnKVxuICAgIGNvbnN0IF9zbG90VmFsdWUgPSBzbG90VmFsdWUudHJpbSgpXG4gICAgaWYgKF9zbG90VmFsdWVbMF0gPT09ICc8JyAmJiBfc2xvdFZhbHVlW19zbG90VmFsdWUubGVuZ3RoIC0gMV0gPT09ICc+JyAmJiBfZG9jdW1lbnQuYm9keS5jaGlsZEVsZW1lbnRDb3VudCA9PT0gMSkge1xuICAgICAgZWxlbSA9IHZtLiRjcmVhdGVFbGVtZW50KGNvbXBpbGVUb0Z1bmN0aW9ucyhzbG90VmFsdWUpKVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBjb21waWxlZFJlc3VsdCA9IGNvbXBpbGVUb0Z1bmN0aW9ucyhgPGRpdj4ke3Nsb3RWYWx1ZX17eyB9fTwvZGl2PmApXG4gICAgICBjb25zdCBfc3RhdGljUmVuZGVyRm5zID0gdm0uX3JlbmRlclByb3h5LiRvcHRpb25zLnN0YXRpY1JlbmRlckZuc1xuICAgICAgdm0uX3JlbmRlclByb3h5LiRvcHRpb25zLnN0YXRpY1JlbmRlckZucyA9IGNvbXBpbGVkUmVzdWx0LnN0YXRpY1JlbmRlckZuc1xuICAgICAgZWxlbSA9IGNvbXBpbGVkUmVzdWx0LnJlbmRlci5jYWxsKHZtLl9yZW5kZXJQcm94eSwgdm0uJGNyZWF0ZUVsZW1lbnQpLmNoaWxkcmVuXG4gICAgICB2bS5fcmVuZGVyUHJveHkuJG9wdGlvbnMuc3RhdGljUmVuZGVyRm5zID0gX3N0YXRpY1JlbmRlckZuc1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBlbGVtID0gdm0uJGNyZWF0ZUVsZW1lbnQoc2xvdFZhbHVlKVxuICB9XG4gIGlmIChBcnJheS5pc0FycmF5KGVsZW0pKSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkodm0uJHNsb3RzW3Nsb3ROYW1lXSkpIHtcbiAgICAgIHZtLiRzbG90c1tzbG90TmFtZV0gPSBbLi4udm0uJHNsb3RzW3Nsb3ROYW1lXSwgLi4uZWxlbV1cbiAgICB9IGVsc2Uge1xuICAgICAgdm0uJHNsb3RzW3Nsb3ROYW1lXSA9IFsuLi5lbGVtXVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh2bS4kc2xvdHNbc2xvdE5hbWVdKSkge1xuICAgICAgdm0uJHNsb3RzW3Nsb3ROYW1lXS5wdXNoKGVsZW0pXG4gICAgfSBlbHNlIHtcbiAgICAgIHZtLiRzbG90c1tzbG90TmFtZV0gPSBbZWxlbV1cbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFkZFNsb3RzICh2bTogQ29tcG9uZW50LCBzbG90czogT2JqZWN0KTogdm9pZCB7XG4gIHZhbGlkYXRlU2xvdHMoc2xvdHMpXG4gIE9iamVjdC5rZXlzKHNsb3RzKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShzbG90c1trZXldKSkge1xuICAgICAgc2xvdHNba2V5XS5mb3JFYWNoKChzbG90VmFsdWUpID0+IHtcbiAgICAgICAgYWRkU2xvdFRvVm0odm0sIGtleSwgc2xvdFZhbHVlKVxuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgYWRkU2xvdFRvVm0odm0sIGtleSwgc2xvdHNba2V5XSlcbiAgICB9XG4gIH0pXG59XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgeyBjb21waWxlVG9GdW5jdGlvbnMgfSBmcm9tICd2dWUtdGVtcGxhdGUtY29tcGlsZXInXG5pbXBvcnQgeyB0aHJvd0Vycm9yIH0gZnJvbSAnc2hhcmVkL3V0aWwnXG5cbmV4cG9ydCBmdW5jdGlvbiBhZGRTY29wZWRTbG90cyAodm06IENvbXBvbmVudCwgc2NvcGVkU2xvdHM6IE9iamVjdCk6IHZvaWQge1xuICBPYmplY3Qua2V5cyhzY29wZWRTbG90cykuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgY29uc3QgdGVtcGxhdGUgPSBzY29wZWRTbG90c1trZXldLnRyaW0oKVxuICAgIGlmICh0ZW1wbGF0ZS5zdWJzdHIoMCwgOSkgPT09ICc8dGVtcGxhdGUnKSB7XG4gICAgICB0aHJvd0Vycm9yKCd0aGUgc2NvcGVkU2xvdHMgb3B0aW9uIGRvZXMgbm90IHN1cHBvcnQgYSB0ZW1wbGF0ZSB0YWcgYXMgdGhlIHJvb3QgZWxlbWVudC4nKVxuICAgIH1cbiAgICBjb25zdCBkb21QYXJzZXIgPSBuZXcgd2luZG93LkRPTVBhcnNlcigpXG4gICAgY29uc3QgX2RvY3VtZW50ID0gZG9tUGFyc2VyLnBhcnNlRnJvbVN0cmluZyh0ZW1wbGF0ZSwgJ3RleHQvaHRtbCcpXG4gICAgdm0uJF92dWVUZXN0VXRpbHNfc2NvcGVkU2xvdHNba2V5XSA9IGNvbXBpbGVUb0Z1bmN0aW9ucyh0ZW1wbGF0ZSkucmVuZGVyXG4gICAgdm0uJF92dWVUZXN0VXRpbHNfc2xvdFNjb3Blc1trZXldID0gX2RvY3VtZW50LmJvZHkuZmlyc3RDaGlsZC5nZXRBdHRyaWJ1dGUoJ3Nsb3Qtc2NvcGUnKVxuICB9KVxufVxuIiwiLy8gQGZsb3dcbmltcG9ydCAkJFZ1ZSBmcm9tICd2dWUnXG5pbXBvcnQgeyB3YXJuIH0gZnJvbSAnc2hhcmVkL3V0aWwnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGFkZE1vY2tzIChtb2NrZWRQcm9wZXJ0aWVzOiBPYmplY3QsIFZ1ZTogQ29tcG9uZW50KSB7XG4gIE9iamVjdC5rZXlzKG1vY2tlZFByb3BlcnRpZXMpLmZvckVhY2goKGtleSkgPT4ge1xuICAgIHRyeSB7XG4gICAgICBWdWUucHJvdG90eXBlW2tleV0gPSBtb2NrZWRQcm9wZXJ0aWVzW2tleV1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB3YXJuKGBjb3VsZCBub3Qgb3ZlcndyaXRlIHByb3BlcnR5ICR7a2V5fSwgdGhpcyB1c3VhbGx5IGNhdXNlZCBieSBhIHBsdWdpbiB0aGF0IGhhcyBhZGRlZCB0aGUgcHJvcGVydHkgYXMgYSByZWFkLW9ubHkgdmFsdWVgKVxuICAgIH1cbiAgICAkJFZ1ZS51dGlsLmRlZmluZVJlYWN0aXZlKFZ1ZSwga2V5LCBtb2NrZWRQcm9wZXJ0aWVzW2tleV0pXG4gIH0pXG59XG4iLCJpbXBvcnQgVnVlIGZyb20gJ3Z1ZSdcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gYWRkQXR0cnMgKHZtLCBhdHRycykge1xuICBjb25zdCBvcmlnaW5hbFNpbGVudCA9IFZ1ZS5jb25maWcuc2lsZW50XG4gIFZ1ZS5jb25maWcuc2lsZW50ID0gdHJ1ZVxuICBpZiAoYXR0cnMpIHtcbiAgICB2bS4kYXR0cnMgPSBhdHRyc1xuICB9IGVsc2Uge1xuICAgIHZtLiRhdHRycyA9IHt9XG4gIH1cbiAgVnVlLmNvbmZpZy5zaWxlbnQgPSBvcmlnaW5hbFNpbGVudFxufVxuIiwiaW1wb3J0IFZ1ZSBmcm9tICd2dWUnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGFkZExpc3RlbmVycyAodm0sIGxpc3RlbmVycykge1xuICBjb25zdCBvcmlnaW5hbFNpbGVudCA9IFZ1ZS5jb25maWcuc2lsZW50XG4gIFZ1ZS5jb25maWcuc2lsZW50ID0gdHJ1ZVxuICBpZiAobGlzdGVuZXJzKSB7XG4gICAgdm0uJGxpc3RlbmVycyA9IGxpc3RlbmVyc1xuICB9IGVsc2Uge1xuICAgIHZtLiRsaXN0ZW5lcnMgPSB7fVxuICB9XG4gIFZ1ZS5jb25maWcuc2lsZW50ID0gb3JpZ2luYWxTaWxlbnRcbn1cbiIsImZ1bmN0aW9uIGFkZFByb3ZpZGUgKGNvbXBvbmVudCwgb3B0aW9uUHJvdmlkZSwgb3B0aW9ucykge1xuICBjb25zdCBwcm92aWRlID0gdHlwZW9mIG9wdGlvblByb3ZpZGUgPT09ICdmdW5jdGlvbidcbiAgICA/IG9wdGlvblByb3ZpZGVcbiAgICA6IE9iamVjdC5hc3NpZ24oe30sIG9wdGlvblByb3ZpZGUpXG5cbiAgb3B0aW9ucy5iZWZvcmVDcmVhdGUgPSBmdW5jdGlvbiB2dWVUZXN0VXRpbEJlZm9yZUNyZWF0ZSAoKSB7XG4gICAgdGhpcy5fcHJvdmlkZWQgPSB0eXBlb2YgcHJvdmlkZSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgPyBwcm92aWRlLmNhbGwodGhpcylcbiAgICAgIDogcHJvdmlkZVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGFkZFByb3ZpZGVcbiIsIi8vIEBmbG93XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2dFdmVudHMgKHZtOiBDb21wb25lbnQsIGVtaXR0ZWQ6IE9iamVjdCwgZW1pdHRlZEJ5T3JkZXI6IEFycmF5PGFueT4pIHtcbiAgY29uc3QgZW1pdCA9IHZtLiRlbWl0XG4gIHZtLiRlbWl0ID0gKG5hbWUsIC4uLmFyZ3MpID0+IHtcbiAgICAoZW1pdHRlZFtuYW1lXSB8fCAoZW1pdHRlZFtuYW1lXSA9IFtdKSkucHVzaChhcmdzKVxuICAgIGVtaXR0ZWRCeU9yZGVyLnB1c2goeyBuYW1lLCBhcmdzIH0pXG4gICAgcmV0dXJuIGVtaXQuY2FsbCh2bSwgbmFtZSwgLi4uYXJncylcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYWRkRXZlbnRMb2dnZXIgKHZ1ZTogQ29tcG9uZW50KSB7XG4gIHZ1ZS5taXhpbih7XG4gICAgYmVmb3JlQ3JlYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLl9fZW1pdHRlZCA9IE9iamVjdC5jcmVhdGUobnVsbClcbiAgICAgIHRoaXMuX19lbWl0dGVkQnlPcmRlciA9IFtdXG4gICAgICBsb2dFdmVudHModGhpcywgdGhpcy5fX2VtaXR0ZWQsIHRoaXMuX19lbWl0dGVkQnlPcmRlcilcbiAgICB9XG4gIH0pXG59XG4iLCIvLyBAZmxvd1xuaW1wb3J0IHsgdGhyb3dFcnJvciB9IGZyb20gJy4vdXRpbCdcblxuZXhwb3J0IGZ1bmN0aW9uIGlzRG9tU2VsZWN0b3IgKHNlbGVjdG9yOiBhbnkpIHtcbiAgaWYgKHR5cGVvZiBzZWxlY3RvciAhPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIHRyeSB7XG4gICAgaWYgKHR5cGVvZiBkb2N1bWVudCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRocm93RXJyb3IoJ21vdW50IG11c3QgYmUgcnVuIGluIGEgYnJvd3NlciBlbnZpcm9ubWVudCBsaWtlIFBoYW50b21KUywganNkb20gb3IgY2hyb21lJylcbiAgICB9XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgdGhyb3dFcnJvcignbW91bnQgbXVzdCBiZSBydW4gaW4gYSBicm93c2VyIGVudmlyb25tZW50IGxpa2UgUGhhbnRvbUpTLCBqc2RvbSBvciBjaHJvbWUnKVxuICB9XG5cbiAgdHJ5IHtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKVxuICAgIHJldHVybiB0cnVlXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzVnVlQ29tcG9uZW50IChjb21wb25lbnQ6IGFueSkge1xuICBpZiAodHlwZW9mIGNvbXBvbmVudCA9PT0gJ2Z1bmN0aW9uJyAmJiBjb21wb25lbnQub3B0aW9ucykge1xuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICBpZiAoY29tcG9uZW50ID09PSBudWxsIHx8IHR5cGVvZiBjb21wb25lbnQgIT09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICBpZiAoY29tcG9uZW50LmV4dGVuZHMgfHwgY29tcG9uZW50Ll9DdG9yKSB7XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIHJldHVybiB0eXBlb2YgY29tcG9uZW50LnJlbmRlciA9PT0gJ2Z1bmN0aW9uJ1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29tcG9uZW50TmVlZHNDb21waWxpbmcgKGNvbXBvbmVudDogQ29tcG9uZW50KSB7XG4gIHJldHVybiBjb21wb25lbnQgJiZcbiAgICAhY29tcG9uZW50LnJlbmRlciAmJlxuICAgIChjb21wb25lbnQudGVtcGxhdGUgfHwgY29tcG9uZW50LmV4dGVuZHMpICYmXG4gICAgIWNvbXBvbmVudC5mdW5jdGlvbmFsXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1JlZlNlbGVjdG9yIChyZWZPcHRpb25zT2JqZWN0OiBhbnkpIHtcbiAgaWYgKHR5cGVvZiByZWZPcHRpb25zT2JqZWN0ICE9PSAnb2JqZWN0JyB8fCBPYmplY3Qua2V5cyhyZWZPcHRpb25zT2JqZWN0IHx8IHt9KS5sZW5ndGggIT09IDEpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIHJldHVybiB0eXBlb2YgcmVmT3B0aW9uc09iamVjdC5yZWYgPT09ICdzdHJpbmcnXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc05hbWVTZWxlY3RvciAobmFtZU9wdGlvbnNPYmplY3Q6IGFueSkge1xuICBpZiAodHlwZW9mIG5hbWVPcHRpb25zT2JqZWN0ICE9PSAnb2JqZWN0JyB8fCBuYW1lT3B0aW9uc09iamVjdCA9PT0gbnVsbCkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgcmV0dXJuICEhbmFtZU9wdGlvbnNPYmplY3QubmFtZVxufVxuIiwiLy8gQGZsb3dcblxuaW1wb3J0IHsgY29tcGlsZVRvRnVuY3Rpb25zIH0gZnJvbSAndnVlLXRlbXBsYXRlLWNvbXBpbGVyJ1xuXG5leHBvcnQgZnVuY3Rpb24gY29tcGlsZVRlbXBsYXRlIChjb21wb25lbnQ6IENvbXBvbmVudCkge1xuICBpZiAoY29tcG9uZW50LmNvbXBvbmVudHMpIHtcbiAgICBPYmplY3Qua2V5cyhjb21wb25lbnQuY29tcG9uZW50cykuZm9yRWFjaCgoYykgPT4ge1xuICAgICAgY29uc3QgY21wID0gY29tcG9uZW50LmNvbXBvbmVudHNbY11cbiAgICAgIGlmICghY21wLnJlbmRlcikge1xuICAgICAgICBjb21waWxlVGVtcGxhdGUoY21wKVxuICAgICAgfVxuICAgIH0pXG4gIH1cbiAgaWYgKGNvbXBvbmVudC5leHRlbmRzKSB7XG4gICAgY29tcGlsZVRlbXBsYXRlKGNvbXBvbmVudC5leHRlbmRzKVxuICB9XG4gIGlmIChjb21wb25lbnQudGVtcGxhdGUpIHtcbiAgICBPYmplY3QuYXNzaWduKGNvbXBvbmVudCwgY29tcGlsZVRvRnVuY3Rpb25zKGNvbXBvbmVudC50ZW1wbGF0ZSkpXG4gIH1cbn1cbiIsIi8vIEBmbG93XG5cbmltcG9ydCBWdWUgZnJvbSAndnVlJ1xuaW1wb3J0IHsgY29tcGlsZVRvRnVuY3Rpb25zIH0gZnJvbSAndnVlLXRlbXBsYXRlLWNvbXBpbGVyJ1xuaW1wb3J0IHsgdGhyb3dFcnJvciB9IGZyb20gJy4vdXRpbCdcbmltcG9ydCB7IGNvbXBvbmVudE5lZWRzQ29tcGlsaW5nIH0gZnJvbSAnLi92YWxpZGF0b3JzJ1xuaW1wb3J0IHsgY29tcGlsZVRlbXBsYXRlIH0gZnJvbSAnLi9jb21waWxlLXRlbXBsYXRlJ1xuaW1wb3J0IHsgY2FwaXRhbGl6ZSwgY2FtZWxpemUsIGh5cGhlbmF0ZSB9IGZyb20gJy4vdXRpbCdcblxuZnVuY3Rpb24gaXNWdWVDb21wb25lbnQgKGNvbXApIHtcbiAgcmV0dXJuIGNvbXAgJiYgKGNvbXAucmVuZGVyIHx8IGNvbXAudGVtcGxhdGUgfHwgY29tcC5vcHRpb25zKVxufVxuXG5mdW5jdGlvbiBpc1ZhbGlkU3R1YiAoc3R1YjogYW55KSB7XG4gIHJldHVybiAhIXN0dWIgJiZcbiAgICAgIHR5cGVvZiBzdHViID09PSAnc3RyaW5nJyB8fFxuICAgICAgKHN0dWIgPT09IHRydWUpIHx8XG4gICAgICAoaXNWdWVDb21wb25lbnQoc3R1YikpXG59XG5cbmZ1bmN0aW9uIGlzUmVxdWlyZWRDb21wb25lbnQgKG5hbWUpIHtcbiAgcmV0dXJuIG5hbWUgPT09ICdLZWVwQWxpdmUnIHx8IG5hbWUgPT09ICdUcmFuc2l0aW9uJyB8fCBuYW1lID09PSAnVHJhbnNpdGlvbkdyb3VwJ1xufVxuXG5mdW5jdGlvbiBnZXRDb3JlUHJvcGVydGllcyAoY29tcG9uZW50OiBDb21wb25lbnQpOiBPYmplY3Qge1xuICByZXR1cm4ge1xuICAgIGF0dHJzOiBjb21wb25lbnQuYXR0cnMsXG4gICAgbmFtZTogY29tcG9uZW50Lm5hbWUsXG4gICAgb246IGNvbXBvbmVudC5vbixcbiAgICBrZXk6IGNvbXBvbmVudC5rZXksXG4gICAgcmVmOiBjb21wb25lbnQucmVmLFxuICAgIHByb3BzOiBjb21wb25lbnQucHJvcHMsXG4gICAgZG9tUHJvcHM6IGNvbXBvbmVudC5kb21Qcm9wcyxcbiAgICBjbGFzczogY29tcG9uZW50LmNsYXNzLFxuICAgIHN0YXRpY0NsYXNzOiBjb21wb25lbnQuc3RhdGljQ2xhc3MsXG4gICAgc3RhdGljU3R5bGU6IGNvbXBvbmVudC5zdGF0aWNTdHlsZSxcbiAgICBzdHlsZTogY29tcG9uZW50LnN0eWxlLFxuICAgIG5vcm1hbGl6ZWRTdHlsZTogY29tcG9uZW50Lm5vcm1hbGl6ZWRTdHlsZSxcbiAgICBuYXRpdmVPbjogY29tcG9uZW50Lm5hdGl2ZU9uLFxuICAgIGZ1bmN0aW9uYWw6IGNvbXBvbmVudC5mdW5jdGlvbmFsXG4gIH1cbn1cbmZ1bmN0aW9uIGNyZWF0ZVN0dWJGcm9tU3RyaW5nICh0ZW1wbGF0ZVN0cmluZzogc3RyaW5nLCBvcmlnaW5hbENvbXBvbmVudDogQ29tcG9uZW50KTogT2JqZWN0IHtcbiAgaWYgKCFjb21waWxlVG9GdW5jdGlvbnMpIHtcbiAgICB0aHJvd0Vycm9yKCd2dWVUZW1wbGF0ZUNvbXBpbGVyIGlzIHVuZGVmaW5lZCwgeW91IG11c3QgcGFzcyBjb21wb25lbnRzIGV4cGxpY2l0bHkgaWYgdnVlLXRlbXBsYXRlLWNvbXBpbGVyIGlzIHVuZGVmaW5lZCcpXG4gIH1cblxuICBpZiAodGVtcGxhdGVTdHJpbmcuaW5kZXhPZihoeXBoZW5hdGUob3JpZ2luYWxDb21wb25lbnQubmFtZSkpICE9PSAtMSB8fFxuICB0ZW1wbGF0ZVN0cmluZy5pbmRleE9mKGNhcGl0YWxpemUob3JpZ2luYWxDb21wb25lbnQubmFtZSkpICE9PSAtMSB8fFxuICB0ZW1wbGF0ZVN0cmluZy5pbmRleE9mKGNhbWVsaXplKG9yaWdpbmFsQ29tcG9uZW50Lm5hbWUpKSAhPT0gLTEpIHtcbiAgICB0aHJvd0Vycm9yKCdvcHRpb25zLnN0dWIgY2Fubm90IGNvbnRhaW4gYSBjaXJjdWxhciByZWZlcmVuY2UnKVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICAuLi5nZXRDb3JlUHJvcGVydGllcyhvcmlnaW5hbENvbXBvbmVudCksXG4gICAgLi4uY29tcGlsZVRvRnVuY3Rpb25zKHRlbXBsYXRlU3RyaW5nKVxuICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUJsYW5rU3R1YiAob3JpZ2luYWxDb21wb25lbnQ6IENvbXBvbmVudCkge1xuICByZXR1cm4ge1xuICAgIC4uLmdldENvcmVQcm9wZXJ0aWVzKG9yaWdpbmFsQ29tcG9uZW50KSxcbiAgICByZW5kZXI6IGggPT4gaCgnJylcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQ29tcG9uZW50U3R1YnMgKG9yaWdpbmFsQ29tcG9uZW50czogT2JqZWN0ID0ge30sIHN0dWJzOiBPYmplY3QpOiBPYmplY3Qge1xuICBjb25zdCBjb21wb25lbnRzID0ge31cbiAgaWYgKCFzdHVicykge1xuICAgIHJldHVybiBjb21wb25lbnRzXG4gIH1cbiAgaWYgKEFycmF5LmlzQXJyYXkoc3R1YnMpKSB7XG4gICAgc3R1YnMuZm9yRWFjaChzdHViID0+IHtcbiAgICAgIGlmIChzdHViID09PSBmYWxzZSkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBzdHViICE9PSAnc3RyaW5nJykge1xuICAgICAgICB0aHJvd0Vycm9yKCdlYWNoIGl0ZW0gaW4gYW4gb3B0aW9ucy5zdHVicyBhcnJheSBtdXN0IGJlIGEgc3RyaW5nJylcbiAgICAgIH1cbiAgICAgIGNvbXBvbmVudHNbc3R1Yl0gPSBjcmVhdGVCbGFua1N0dWIoe30pXG4gICAgfSlcbiAgfSBlbHNlIHtcbiAgICBPYmplY3Qua2V5cyhzdHVicykuZm9yRWFjaChzdHViID0+IHtcbiAgICAgIGlmIChzdHVic1tzdHViXSA9PT0gZmFsc2UpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBpZiAoIWlzVmFsaWRTdHViKHN0dWJzW3N0dWJdKSkge1xuICAgICAgICB0aHJvd0Vycm9yKCdvcHRpb25zLnN0dWIgdmFsdWVzIG11c3QgYmUgcGFzc2VkIGEgc3RyaW5nIG9yIGNvbXBvbmVudCcpXG4gICAgICB9XG4gICAgICBpZiAoc3R1YnNbc3R1Yl0gPT09IHRydWUpIHtcbiAgICAgICAgY29tcG9uZW50c1tzdHViXSA9IGNyZWF0ZUJsYW5rU3R1Yih7fSlcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGlmIChjb21wb25lbnROZWVkc0NvbXBpbGluZyhzdHVic1tzdHViXSkpIHtcbiAgICAgICAgY29tcGlsZVRlbXBsYXRlKHN0dWJzW3N0dWJdKVxuICAgICAgfVxuXG4gICAgICBpZiAob3JpZ2luYWxDb21wb25lbnRzW3N0dWJdKSB7XG4gICAgICAgIC8vIFJlbW92ZSBjYWNoZWQgY29uc3RydWN0b3JcbiAgICAgICAgZGVsZXRlIG9yaWdpbmFsQ29tcG9uZW50c1tzdHViXS5fQ3RvclxuICAgICAgICBpZiAodHlwZW9mIHN0dWJzW3N0dWJdID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIGNvbXBvbmVudHNbc3R1Yl0gPSBjcmVhdGVTdHViRnJvbVN0cmluZyhzdHVic1tzdHViXSwgb3JpZ2luYWxDb21wb25lbnRzW3N0dWJdKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbXBvbmVudHNbc3R1Yl0gPSB7XG4gICAgICAgICAgICAuLi5zdHVic1tzdHViXSxcbiAgICAgICAgICAgIG5hbWU6IG9yaWdpbmFsQ29tcG9uZW50c1tzdHViXS5uYW1lXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAodHlwZW9mIHN0dWJzW3N0dWJdID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIGlmICghY29tcGlsZVRvRnVuY3Rpb25zKSB7XG4gICAgICAgICAgICB0aHJvd0Vycm9yKCd2dWVUZW1wbGF0ZUNvbXBpbGVyIGlzIHVuZGVmaW5lZCwgeW91IG11c3QgcGFzcyBjb21wb25lbnRzIGV4cGxpY2l0bHkgaWYgdnVlLXRlbXBsYXRlLWNvbXBpbGVyIGlzIHVuZGVmaW5lZCcpXG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbXBvbmVudHNbc3R1Yl0gPSB7XG4gICAgICAgICAgICAuLi5jb21waWxlVG9GdW5jdGlvbnMoc3R1YnNbc3R1Yl0pXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbXBvbmVudHNbc3R1Yl0gPSB7XG4gICAgICAgICAgICAuLi5zdHVic1tzdHViXVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gaWdub3JlRWxlbWVudHMgZG9lcyBub3QgZXhpc3QgaW4gVnVlIDIuMC54XG4gICAgICBpZiAoVnVlLmNvbmZpZy5pZ25vcmVkRWxlbWVudHMpIHtcbiAgICAgICAgVnVlLmNvbmZpZy5pZ25vcmVkRWxlbWVudHMucHVzaChzdHViKVxuICAgICAgfVxuICAgIH0pXG4gIH1cbiAgcmV0dXJuIGNvbXBvbmVudHNcbn1cblxuZnVuY3Rpb24gc3R1YkNvbXBvbmVudHMgKGNvbXBvbmVudHM6IE9iamVjdCwgc3R1YmJlZENvbXBvbmVudHM6IE9iamVjdCkge1xuICBPYmplY3Qua2V5cyhjb21wb25lbnRzKS5mb3JFYWNoKGNvbXBvbmVudCA9PiB7XG4gICAgLy8gUmVtb3ZlIGNhY2hlZCBjb25zdHJ1Y3RvclxuICAgIGRlbGV0ZSBjb21wb25lbnRzW2NvbXBvbmVudF0uX0N0b3JcbiAgICBpZiAoIWNvbXBvbmVudHNbY29tcG9uZW50XS5uYW1lKSB7XG4gICAgICBjb21wb25lbnRzW2NvbXBvbmVudF0ubmFtZSA9IGNvbXBvbmVudFxuICAgIH1cbiAgICBzdHViYmVkQ29tcG9uZW50c1tjb21wb25lbnRdID0gY3JlYXRlQmxhbmtTdHViKGNvbXBvbmVudHNbY29tcG9uZW50XSlcblxuICAgIC8vIGlnbm9yZUVsZW1lbnRzIGRvZXMgbm90IGV4aXN0IGluIFZ1ZSAyLjAueFxuICAgIGlmIChWdWUuY29uZmlnLmlnbm9yZWRFbGVtZW50cykge1xuICAgICAgVnVlLmNvbmZpZy5pZ25vcmVkRWxlbWVudHMucHVzaChjb21wb25lbnQpXG4gICAgfVxuICB9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQ29tcG9uZW50U3R1YnNGb3JBbGwgKGNvbXBvbmVudDogQ29tcG9uZW50KTogT2JqZWN0IHtcbiAgY29uc3Qgc3R1YmJlZENvbXBvbmVudHMgPSB7fVxuXG4gIGlmIChjb21wb25lbnQuY29tcG9uZW50cykge1xuICAgIHN0dWJDb21wb25lbnRzKGNvbXBvbmVudC5jb21wb25lbnRzLCBzdHViYmVkQ29tcG9uZW50cylcbiAgfVxuXG4gIGxldCBleHRlbmRlZCA9IGNvbXBvbmVudC5leHRlbmRzXG5cbiAgLy8gTG9vcCB0aHJvdWdoIGV4dGVuZGVkIGNvbXBvbmVudCBjaGFpbnMgdG8gc3R1YiBhbGwgY2hpbGQgY29tcG9uZW50c1xuICB3aGlsZSAoZXh0ZW5kZWQpIHtcbiAgICBpZiAoZXh0ZW5kZWQuY29tcG9uZW50cykge1xuICAgICAgc3R1YkNvbXBvbmVudHMoZXh0ZW5kZWQuY29tcG9uZW50cywgc3R1YmJlZENvbXBvbmVudHMpXG4gICAgfVxuICAgIGV4dGVuZGVkID0gZXh0ZW5kZWQuZXh0ZW5kc1xuICB9XG5cbiAgaWYgKGNvbXBvbmVudC5leHRlbmRPcHRpb25zICYmIGNvbXBvbmVudC5leHRlbmRPcHRpb25zLmNvbXBvbmVudHMpIHtcbiAgICBzdHViQ29tcG9uZW50cyhjb21wb25lbnQuZXh0ZW5kT3B0aW9ucy5jb21wb25lbnRzLCBzdHViYmVkQ29tcG9uZW50cylcbiAgfVxuXG4gIHJldHVybiBzdHViYmVkQ29tcG9uZW50c1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQ29tcG9uZW50U3R1YnNGb3JHbG9iYWxzIChpbnN0YW5jZTogQ29tcG9uZW50KTogT2JqZWN0IHtcbiAgY29uc3QgY29tcG9uZW50cyA9IHt9XG4gIE9iamVjdC5rZXlzKGluc3RhbmNlLm9wdGlvbnMuY29tcG9uZW50cykuZm9yRWFjaCgoYykgPT4ge1xuICAgIGlmIChpc1JlcXVpcmVkQ29tcG9uZW50KGMpKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb21wb25lbnRzW2NdID0gY3JlYXRlQmxhbmtTdHViKGluc3RhbmNlLm9wdGlvbnMuY29tcG9uZW50c1tjXSlcbiAgICBkZWxldGUgaW5zdGFuY2Uub3B0aW9ucy5jb21wb25lbnRzW2NdLl9DdG9yIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tcGFyYW0tcmVhc3NpZ25cbiAgICBkZWxldGUgY29tcG9uZW50c1tjXS5fQ3RvciAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXBhcmFtLXJlYXNzaWduXG4gIH0pXG4gIHJldHVybiBjb21wb25lbnRzXG59XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgeyBjb21waWxlVG9GdW5jdGlvbnMgfSBmcm9tICd2dWUtdGVtcGxhdGUtY29tcGlsZXInXG5cbmV4cG9ydCBmdW5jdGlvbiBjb21waWxlVGVtcGxhdGUgKGNvbXBvbmVudDogQ29tcG9uZW50KSB7XG4gIGlmIChjb21wb25lbnQuY29tcG9uZW50cykge1xuICAgIE9iamVjdC5rZXlzKGNvbXBvbmVudC5jb21wb25lbnRzKS5mb3JFYWNoKChjKSA9PiB7XG4gICAgICBjb25zdCBjbXAgPSBjb21wb25lbnQuY29tcG9uZW50c1tjXVxuICAgICAgaWYgKCFjbXAucmVuZGVyKSB7XG4gICAgICAgIGNvbXBpbGVUZW1wbGF0ZShjbXApXG4gICAgICB9XG4gICAgfSlcbiAgfVxuICBpZiAoY29tcG9uZW50LmV4dGVuZHMpIHtcbiAgICBjb21waWxlVGVtcGxhdGUoY29tcG9uZW50LmV4dGVuZHMpXG4gIH1cbiAgaWYgKGNvbXBvbmVudC50ZW1wbGF0ZSkge1xuICAgIE9iamVjdC5hc3NpZ24oY29tcG9uZW50LCBjb21waWxlVG9GdW5jdGlvbnMoY29tcG9uZW50LnRlbXBsYXRlKSlcbiAgfVxufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZGVsZXRlTW91bnRpbmdPcHRpb25zIChvcHRpb25zKSB7XG4gIGRlbGV0ZSBvcHRpb25zLmF0dGFjaFRvRG9jdW1lbnRcbiAgZGVsZXRlIG9wdGlvbnMubW9ja3NcbiAgZGVsZXRlIG9wdGlvbnMuc2xvdHNcbiAgZGVsZXRlIG9wdGlvbnMubG9jYWxWdWVcbiAgZGVsZXRlIG9wdGlvbnMuc3R1YnNcbiAgZGVsZXRlIG9wdGlvbnMuY29udGV4dFxuICBkZWxldGUgb3B0aW9ucy5jbG9uZVxuICBkZWxldGUgb3B0aW9ucy5hdHRyc1xuICBkZWxldGUgb3B0aW9ucy5saXN0ZW5lcnNcbn1cbiIsIi8vIEBmbG93XG5cbmltcG9ydCB7IGNvbXBpbGVUb0Z1bmN0aW9ucyB9IGZyb20gJ3Z1ZS10ZW1wbGF0ZS1jb21waWxlcidcbmltcG9ydCB7IHRocm93RXJyb3IgfSBmcm9tICdzaGFyZWQvdXRpbCdcbmltcG9ydCB7IHZhbGlkYXRlU2xvdHMgfSBmcm9tICcuL3ZhbGlkYXRlLXNsb3RzJ1xuXG5mdW5jdGlvbiBjcmVhdGVGdW5jdGlvbmFsU2xvdHMgKHNsb3RzID0ge30sIGgpIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkoc2xvdHMuZGVmYXVsdCkpIHtcbiAgICByZXR1cm4gc2xvdHMuZGVmYXVsdC5tYXAoaClcbiAgfVxuXG4gIGlmICh0eXBlb2Ygc2xvdHMuZGVmYXVsdCA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gW2goY29tcGlsZVRvRnVuY3Rpb25zKHNsb3RzLmRlZmF1bHQpKV1cbiAgfVxuICBjb25zdCBjaGlsZHJlbiA9IFtdXG4gIE9iamVjdC5rZXlzKHNsb3RzKS5mb3JFYWNoKHNsb3RUeXBlID0+IHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShzbG90c1tzbG90VHlwZV0pKSB7XG4gICAgICBzbG90c1tzbG90VHlwZV0uZm9yRWFjaChzbG90ID0+IHtcbiAgICAgICAgY29uc3QgY29tcG9uZW50ID0gdHlwZW9mIHNsb3QgPT09ICdzdHJpbmcnID8gY29tcGlsZVRvRnVuY3Rpb25zKHNsb3QpIDogc2xvdFxuICAgICAgICBjb25zdCBuZXdTbG90ID0gaChjb21wb25lbnQpXG4gICAgICAgIG5ld1Nsb3QuZGF0YS5zbG90ID0gc2xvdFR5cGVcbiAgICAgICAgY2hpbGRyZW4ucHVzaChuZXdTbG90KVxuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgY29tcG9uZW50ID0gdHlwZW9mIHNsb3RzW3Nsb3RUeXBlXSA9PT0gJ3N0cmluZycgPyBjb21waWxlVG9GdW5jdGlvbnMoc2xvdHNbc2xvdFR5cGVdKSA6IHNsb3RzW3Nsb3RUeXBlXVxuICAgICAgY29uc3Qgc2xvdCA9IGgoY29tcG9uZW50KVxuICAgICAgc2xvdC5kYXRhLnNsb3QgPSBzbG90VHlwZVxuICAgICAgY2hpbGRyZW4ucHVzaChzbG90KVxuICAgIH1cbiAgfSlcbiAgcmV0dXJuIGNoaWxkcmVuXG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNyZWF0ZUZ1bmN0aW9uYWxDb21wb25lbnQgKGNvbXBvbmVudDogQ29tcG9uZW50LCBtb3VudGluZ09wdGlvbnM6IE9wdGlvbnMpIHtcbiAgaWYgKG1vdW50aW5nT3B0aW9ucy5jb250ZXh0ICYmIHR5cGVvZiBtb3VudGluZ09wdGlvbnMuY29udGV4dCAhPT0gJ29iamVjdCcpIHtcbiAgICB0aHJvd0Vycm9yKCdtb3VudC5jb250ZXh0IG11c3QgYmUgYW4gb2JqZWN0JylcbiAgfVxuICBpZiAobW91bnRpbmdPcHRpb25zLnNsb3RzKSB7XG4gICAgdmFsaWRhdGVTbG90cyhtb3VudGluZ09wdGlvbnMuc2xvdHMpXG4gIH1cblxuICByZXR1cm4ge1xuICAgIHJlbmRlciAoaDogRnVuY3Rpb24pIHtcbiAgICAgIHJldHVybiBoKFxuICAgICAgICBjb21wb25lbnQsXG4gICAgICAgIG1vdW50aW5nT3B0aW9ucy5jb250ZXh0IHx8IGNvbXBvbmVudC5GdW5jdGlvbmFsUmVuZGVyQ29udGV4dCxcbiAgICAgICAgKG1vdW50aW5nT3B0aW9ucy5jb250ZXh0ICYmIG1vdW50aW5nT3B0aW9ucy5jb250ZXh0LmNoaWxkcmVuICYmIG1vdW50aW5nT3B0aW9ucy5jb250ZXh0LmNoaWxkcmVuLm1hcCh4ID0+IHR5cGVvZiB4ID09PSAnZnVuY3Rpb24nID8geChoKSA6IHgpKSB8fCBjcmVhdGVGdW5jdGlvbmFsU2xvdHMobW91bnRpbmdPcHRpb25zLnNsb3RzLCBoKVxuICAgICAgKVxuICAgIH0sXG4gICAgbmFtZTogY29tcG9uZW50Lm5hbWUsXG4gICAgX2lzRnVuY3Rpb25hbENvbnRhaW5lcjogdHJ1ZVxuICB9XG59XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgVnVlIGZyb20gJ3Z1ZSdcbmltcG9ydCB7IGFkZFNsb3RzIH0gZnJvbSAnLi9hZGQtc2xvdHMnXG5pbXBvcnQgeyBhZGRTY29wZWRTbG90cyB9IGZyb20gJy4vYWRkLXNjb3BlZC1zbG90cydcbmltcG9ydCBhZGRNb2NrcyBmcm9tICcuL2FkZC1tb2NrcydcbmltcG9ydCBhZGRBdHRycyBmcm9tICcuL2FkZC1hdHRycydcbmltcG9ydCBhZGRMaXN0ZW5lcnMgZnJvbSAnLi9hZGQtbGlzdGVuZXJzJ1xuaW1wb3J0IGFkZFByb3ZpZGUgZnJvbSAnLi9hZGQtcHJvdmlkZSdcbmltcG9ydCB7IGFkZEV2ZW50TG9nZ2VyIH0gZnJvbSAnLi9sb2ctZXZlbnRzJ1xuaW1wb3J0IHsgY3JlYXRlQ29tcG9uZW50U3R1YnMgfSBmcm9tICdzaGFyZWQvc3R1Yi1jb21wb25lbnRzJ1xuaW1wb3J0IHsgdGhyb3dFcnJvciB9IGZyb20gJ3NoYXJlZC91dGlsJ1xuaW1wb3J0IHsgY29tcGlsZVRlbXBsYXRlIH0gZnJvbSAnLi9jb21waWxlLXRlbXBsYXRlJ1xuaW1wb3J0IGRlbGV0ZW9wdGlvbnMgZnJvbSAnLi9kZWxldGUtbW91bnRpbmctb3B0aW9ucydcbmltcG9ydCBjcmVhdGVGdW5jdGlvbmFsQ29tcG9uZW50IGZyb20gJy4vY3JlYXRlLWZ1bmN0aW9uYWwtY29tcG9uZW50J1xuaW1wb3J0IHsgY29tcG9uZW50TmVlZHNDb21waWxpbmcgfSBmcm9tICdzaGFyZWQvdmFsaWRhdG9ycydcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY3JlYXRlSW5zdGFuY2UgKFxuICBjb21wb25lbnQ6IENvbXBvbmVudCxcbiAgb3B0aW9uczogT3B0aW9ucyxcbiAgdnVlOiBDb21wb25lbnRcbik6IENvbXBvbmVudCB7XG4gIGlmIChvcHRpb25zLm1vY2tzKSB7XG4gICAgYWRkTW9ja3Mob3B0aW9ucy5tb2NrcywgdnVlKVxuICB9XG5cbiAgaWYgKChjb21wb25lbnQub3B0aW9ucyAmJiBjb21wb25lbnQub3B0aW9ucy5mdW5jdGlvbmFsKSB8fCBjb21wb25lbnQuZnVuY3Rpb25hbCkge1xuICAgIGNvbXBvbmVudCA9IGNyZWF0ZUZ1bmN0aW9uYWxDb21wb25lbnQoY29tcG9uZW50LCBvcHRpb25zKVxuICB9IGVsc2UgaWYgKG9wdGlvbnMuY29udGV4dCkge1xuICAgIHRocm93RXJyb3IoXG4gICAgICAnbW91bnQuY29udGV4dCBjYW4gb25seSBiZSB1c2VkIHdoZW4gbW91bnRpbmcgYSBmdW5jdGlvbmFsIGNvbXBvbmVudCdcbiAgICApXG4gIH1cblxuICBpZiAob3B0aW9ucy5wcm92aWRlKSB7XG4gICAgYWRkUHJvdmlkZShjb21wb25lbnQsIG9wdGlvbnMucHJvdmlkZSwgb3B0aW9ucylcbiAgfVxuXG4gIGlmIChjb21wb25lbnROZWVkc0NvbXBpbGluZyhjb21wb25lbnQpKSB7XG4gICAgY29tcGlsZVRlbXBsYXRlKGNvbXBvbmVudClcbiAgfVxuXG4gIGFkZEV2ZW50TG9nZ2VyKHZ1ZSlcblxuICBjb25zdCBDb25zdHJ1Y3RvciA9IHZ1ZS5leHRlbmQoY29tcG9uZW50KVxuXG4gIGNvbnN0IGluc3RhbmNlT3B0aW9ucyA9IHsgLi4ub3B0aW9ucyB9XG4gIGRlbGV0ZW9wdGlvbnMoaW5zdGFuY2VPcHRpb25zKVxuICBpZiAob3B0aW9ucy5zdHVicykge1xuICAgIGluc3RhbmNlT3B0aW9ucy5jb21wb25lbnRzID0ge1xuICAgICAgLi4uaW5zdGFuY2VPcHRpb25zLmNvbXBvbmVudHMsXG4gICAgICAvLyAkRmxvd0lnbm9yZVxuICAgICAgLi4uY3JlYXRlQ29tcG9uZW50U3R1YnMoY29tcG9uZW50LmNvbXBvbmVudHMsIG9wdGlvbnMuc3R1YnMpXG4gICAgfVxuICB9XG5cbiAgY29uc3Qgdm0gPSBuZXcgQ29uc3RydWN0b3IoaW5zdGFuY2VPcHRpb25zKVxuXG4gIGFkZEF0dHJzKHZtLCBvcHRpb25zLmF0dHJzKVxuICBhZGRMaXN0ZW5lcnModm0sIG9wdGlvbnMubGlzdGVuZXJzKVxuXG4gIGlmIChvcHRpb25zLnNjb3BlZFNsb3RzKSB7XG4gICAgaWYgKHdpbmRvdy5uYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9QaGFudG9tSlMvaSkpIHtcbiAgICAgIHRocm93RXJyb3IoJ3RoZSBzY29wZWRTbG90cyBvcHRpb24gZG9lcyBub3Qgc3VwcG9ydCBQaGFudG9tSlMuIFBsZWFzZSB1c2UgUHVwcGV0ZWVyLCBvciBwYXNzIGEgY29tcG9uZW50LicpXG4gICAgfVxuICAgIGNvbnN0IHZ1ZVZlcnNpb24gPSBOdW1iZXIoYCR7VnVlLnZlcnNpb24uc3BsaXQoJy4nKVswXX0uJHtWdWUudmVyc2lvbi5zcGxpdCgnLicpWzFdfWApXG4gICAgaWYgKHZ1ZVZlcnNpb24gPj0gMi41KSB7XG4gICAgICB2bS4kX3Z1ZVRlc3RVdGlsc19zY29wZWRTbG90cyA9IHt9XG4gICAgICB2bS4kX3Z1ZVRlc3RVdGlsc19zbG90U2NvcGVzID0ge31cbiAgICAgIGNvbnN0IHJlbmRlclNsb3QgPSB2bS5fcmVuZGVyUHJveHkuX3RcblxuICAgICAgdm0uX3JlbmRlclByb3h5Ll90ID0gZnVuY3Rpb24gKG5hbWUsIGZlZWRiYWNrLCBwcm9wcywgYmluZE9iamVjdCkge1xuICAgICAgICBjb25zdCBzY29wZWRTbG90Rm4gPSB2bS4kX3Z1ZVRlc3RVdGlsc19zY29wZWRTbG90c1tuYW1lXVxuICAgICAgICBjb25zdCBzbG90U2NvcGUgPSB2bS4kX3Z1ZVRlc3RVdGlsc19zbG90U2NvcGVzW25hbWVdXG4gICAgICAgIGlmIChzY29wZWRTbG90Rm4pIHtcbiAgICAgICAgICBwcm9wcyA9IHsgLi4uYmluZE9iamVjdCwgLi4ucHJvcHMgfVxuICAgICAgICAgIGNvbnN0IHByb3h5ID0ge31cbiAgICAgICAgICBjb25zdCBoZWxwZXJzID0gWydfYycsICdfbycsICdfbicsICdfcycsICdfbCcsICdfdCcsICdfcScsICdfaScsICdfbScsICdfZicsICdfaycsICdfYicsICdfdicsICdfZScsICdfdScsICdfZyddXG4gICAgICAgICAgaGVscGVycy5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgICAgICAgIHByb3h5W2tleV0gPSB2bS5fcmVuZGVyUHJveHlba2V5XVxuICAgICAgICAgIH0pXG4gICAgICAgICAgcHJveHlbc2xvdFNjb3BlXSA9IHByb3BzXG4gICAgICAgICAgcmV0dXJuIHNjb3BlZFNsb3RGbi5jYWxsKHByb3h5KVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiByZW5kZXJTbG90LmNhbGwodm0uX3JlbmRlclByb3h5LCBuYW1lLCBmZWVkYmFjaywgcHJvcHMsIGJpbmRPYmplY3QpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gJEZsb3dJZ25vcmVcbiAgICAgIGFkZFNjb3BlZFNsb3RzKHZtLCBvcHRpb25zLnNjb3BlZFNsb3RzKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvd0Vycm9yKCd0aGUgc2NvcGVkU2xvdHMgb3B0aW9uIGlzIG9ubHkgc3VwcG9ydGVkIGluIHZ1ZUAyLjUrLicpXG4gICAgfVxuICB9XG5cbiAgaWYgKG9wdGlvbnMuc2xvdHMpIHtcbiAgICBhZGRTbG90cyh2bSwgb3B0aW9ucy5zbG90cylcbiAgfVxuXG4gIHJldHVybiB2bVxufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBfaW50ZXJvcERlZmF1bHQgKGV4KSB7IHJldHVybiAoZXggJiYgKHR5cGVvZiBleCA9PT0gJ29iamVjdCcpICYmICdkZWZhdWx0JyBpbiBleCkgPyBleFsnZGVmYXVsdCddIDogZXg7IH1cblxudmFyIFZ1ZSA9IF9pbnRlcm9wRGVmYXVsdChyZXF1aXJlKCd2dWUnKSk7XG52YXIgdnVlVGVtcGxhdGVDb21waWxlciA9IHJlcXVpcmUoJ3Z1ZS10ZW1wbGF0ZS1jb21waWxlcicpO1xuXG4vLyBcblxuZnVuY3Rpb24gdGhyb3dFcnJvciAobXNnKSB7XG4gIHRocm93IG5ldyBFcnJvcigoXCJbdnVlLXRlc3QtdXRpbHNdOiBcIiArIG1zZykpXG59XG5cbmZ1bmN0aW9uIHdhcm4gKG1zZykge1xuICBjb25zb2xlLmVycm9yKChcIlt2dWUtdGVzdC11dGlsc106IFwiICsgbXNnKSk7XG59XG5cbnZhciBjYW1lbGl6ZVJFID0gLy0oXFx3KS9nO1xudmFyIGNhbWVsaXplID0gZnVuY3Rpb24gKHN0cikgeyByZXR1cm4gc3RyLnJlcGxhY2UoY2FtZWxpemVSRSwgZnVuY3Rpb24gKF8sIGMpIHsgcmV0dXJuIGMgPyBjLnRvVXBwZXJDYXNlKCkgOiAnJzsgfSk7IH07XG5cbi8qKlxuICogQ2FwaXRhbGl6ZSBhIHN0cmluZy5cbiAqL1xudmFyIGNhcGl0YWxpemUgPSBmdW5jdGlvbiAoc3RyKSB7IHJldHVybiBzdHIuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzdHIuc2xpY2UoMSk7IH07XG5cbi8qKlxuICogSHlwaGVuYXRlIGEgY2FtZWxDYXNlIHN0cmluZy5cbiAqL1xudmFyIGh5cGhlbmF0ZVJFID0gL1xcQihbQS1aXSkvZztcbnZhciBoeXBoZW5hdGUgPSBmdW5jdGlvbiAoc3RyKSB7IHJldHVybiBzdHIucmVwbGFjZShoeXBoZW5hdGVSRSwgJy0kMScpLnRvTG93ZXJDYXNlKCk7IH07XG5cbmlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJykge1xuICB0aHJvd0Vycm9yKFxuICAgICd3aW5kb3cgaXMgdW5kZWZpbmVkLCB2dWUtdGVzdC11dGlscyBuZWVkcyB0byBiZSBydW4gaW4gYSBicm93c2VyIGVudmlyb25tZW50LlxcbicgK1xuICAgICdZb3UgY2FuIHJ1biB0aGUgdGVzdHMgaW4gbm9kZSB1c2luZyBqc2RvbSArIGpzZG9tLWdsb2JhbC5cXG4nICtcbiAgICAnU2VlIGh0dHBzOi8vdnVlLXRlc3QtdXRpbHMudnVlanMub3JnL2VuL2d1aWRlcy9jb21tb24tdGlwcy5odG1sIGZvciBtb3JlIGRldGFpbHMuJ1xuICApO1xufVxuXG5pZiAoIUVsZW1lbnQucHJvdG90eXBlLm1hdGNoZXMpIHtcbiAgRWxlbWVudC5wcm90b3R5cGUubWF0Y2hlcyA9XG4gICAgICAgIEVsZW1lbnQucHJvdG90eXBlLm1hdGNoZXNTZWxlY3RvciB8fFxuICAgICAgICBFbGVtZW50LnByb3RvdHlwZS5tb3pNYXRjaGVzU2VsZWN0b3IgfHxcbiAgICAgICAgRWxlbWVudC5wcm90b3R5cGUubXNNYXRjaGVzU2VsZWN0b3IgfHxcbiAgICAgICAgRWxlbWVudC5wcm90b3R5cGUub01hdGNoZXNTZWxlY3RvciB8fFxuICAgICAgICBFbGVtZW50LnByb3RvdHlwZS53ZWJraXRNYXRjaGVzU2VsZWN0b3IgfHxcbiAgICAgICAgZnVuY3Rpb24gKHMpIHtcbiAgICAgICAgICB2YXIgbWF0Y2hlcyA9ICh0aGlzLmRvY3VtZW50IHx8IHRoaXMub3duZXJEb2N1bWVudCkucXVlcnlTZWxlY3RvckFsbChzKTtcbiAgICAgICAgICB2YXIgaSA9IG1hdGNoZXMubGVuZ3RoO1xuICAgICAgICAgIHdoaWxlICgtLWkgPj0gMCAmJiBtYXRjaGVzLml0ZW0oaSkgIT09IHRoaXMpIHt9XG4gICAgICAgICAgcmV0dXJuIGkgPiAtMVxuICAgICAgICB9O1xufVxuXG5pZiAodHlwZW9mIE9iamVjdC5hc3NpZ24gIT09ICdmdW5jdGlvbicpIHtcbiAgKGZ1bmN0aW9uICgpIHtcbiAgICBPYmplY3QuYXNzaWduID0gZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgdmFyIGFyZ3VtZW50cyQxID0gYXJndW1lbnRzO1xuXG4gICAgICBpZiAodGFyZ2V0ID09PSB1bmRlZmluZWQgfHwgdGFyZ2V0ID09PSBudWxsKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjb252ZXJ0IHVuZGVmaW5lZCBvciBudWxsIHRvIG9iamVjdCcpXG4gICAgICB9XG5cbiAgICAgIHZhciBvdXRwdXQgPSBPYmplY3QodGFyZ2V0KTtcbiAgICAgIGZvciAodmFyIGluZGV4ID0gMTsgaW5kZXggPCBhcmd1bWVudHMubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgIHZhciBzb3VyY2UgPSBhcmd1bWVudHMkMVtpbmRleF07XG4gICAgICAgIGlmIChzb3VyY2UgIT09IHVuZGVmaW5lZCAmJiBzb3VyY2UgIT09IG51bGwpIHtcbiAgICAgICAgICBmb3IgKHZhciBuZXh0S2V5IGluIHNvdXJjZSkge1xuICAgICAgICAgICAgaWYgKHNvdXJjZS5oYXNPd25Qcm9wZXJ0eShuZXh0S2V5KSkge1xuICAgICAgICAgICAgICBvdXRwdXRbbmV4dEtleV0gPSBzb3VyY2VbbmV4dEtleV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gb3V0cHV0XG4gICAgfTtcbiAgfSkoKTtcbn1cblxuLy8gXG5cbmZ1bmN0aW9uIGlzRG9tU2VsZWN0b3IgKHNlbGVjdG9yKSB7XG4gIGlmICh0eXBlb2Ygc2VsZWN0b3IgIT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICB0cnkge1xuICAgIGlmICh0eXBlb2YgZG9jdW1lbnQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aHJvd0Vycm9yKCdtb3VudCBtdXN0IGJlIHJ1biBpbiBhIGJyb3dzZXIgZW52aXJvbm1lbnQgbGlrZSBQaGFudG9tSlMsIGpzZG9tIG9yIGNocm9tZScpO1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICB0aHJvd0Vycm9yKCdtb3VudCBtdXN0IGJlIHJ1biBpbiBhIGJyb3dzZXIgZW52aXJvbm1lbnQgbGlrZSBQaGFudG9tSlMsIGpzZG9tIG9yIGNocm9tZScpO1xuICB9XG5cbiAgdHJ5IHtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICByZXR1cm4gdHJ1ZVxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG59XG5cbmZ1bmN0aW9uIGlzVnVlQ29tcG9uZW50IChjb21wb25lbnQpIHtcbiAgaWYgKHR5cGVvZiBjb21wb25lbnQgPT09ICdmdW5jdGlvbicgJiYgY29tcG9uZW50Lm9wdGlvbnMpIHtcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgaWYgKGNvbXBvbmVudCA9PT0gbnVsbCB8fCB0eXBlb2YgY29tcG9uZW50ICE9PSAnb2JqZWN0Jykge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgaWYgKGNvbXBvbmVudC5leHRlbmRzIHx8IGNvbXBvbmVudC5fQ3Rvcikge1xuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICByZXR1cm4gdHlwZW9mIGNvbXBvbmVudC5yZW5kZXIgPT09ICdmdW5jdGlvbidcbn1cblxuZnVuY3Rpb24gY29tcG9uZW50TmVlZHNDb21waWxpbmcgKGNvbXBvbmVudCkge1xuICByZXR1cm4gY29tcG9uZW50ICYmXG4gICAgIWNvbXBvbmVudC5yZW5kZXIgJiZcbiAgICAoY29tcG9uZW50LnRlbXBsYXRlIHx8IGNvbXBvbmVudC5leHRlbmRzKSAmJlxuICAgICFjb21wb25lbnQuZnVuY3Rpb25hbFxufVxuXG5mdW5jdGlvbiBpc1JlZlNlbGVjdG9yIChyZWZPcHRpb25zT2JqZWN0KSB7XG4gIGlmICh0eXBlb2YgcmVmT3B0aW9uc09iamVjdCAhPT0gJ29iamVjdCcgfHwgT2JqZWN0LmtleXMocmVmT3B0aW9uc09iamVjdCB8fCB7fSkubGVuZ3RoICE9PSAxKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICByZXR1cm4gdHlwZW9mIHJlZk9wdGlvbnNPYmplY3QucmVmID09PSAnc3RyaW5nJ1xufVxuXG5mdW5jdGlvbiBpc05hbWVTZWxlY3RvciAobmFtZU9wdGlvbnNPYmplY3QpIHtcbiAgaWYgKHR5cGVvZiBuYW1lT3B0aW9uc09iamVjdCAhPT0gJ29iamVjdCcgfHwgbmFtZU9wdGlvbnNPYmplY3QgPT09IG51bGwpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIHJldHVybiAhIW5hbWVPcHRpb25zT2JqZWN0Lm5hbWVcbn1cblxudmFyIE5BTUVfU0VMRUNUT1IgPSAnTkFNRV9TRUxFQ1RPUic7XG52YXIgQ09NUE9ORU5UX1NFTEVDVE9SID0gJ0NPTVBPTkVOVF9TRUxFQ1RPUic7XG52YXIgUkVGX1NFTEVDVE9SID0gJ1JFRl9TRUxFQ1RPUic7XG52YXIgRE9NX1NFTEVDVE9SID0gJ0RPTV9TRUxFQ1RPUic7XG52YXIgVlVFX1ZFUlNJT04gPSBOdW1iZXIoKChWdWUudmVyc2lvbi5zcGxpdCgnLicpWzBdKSArIFwiLlwiICsgKFZ1ZS52ZXJzaW9uLnNwbGl0KCcuJylbMV0pKSk7XG52YXIgRlVOQ1RJT05BTF9PUFRJT05TID0gVlVFX1ZFUlNJT04gPj0gMi41ID8gJ2ZuT3B0aW9ucycgOiAnZnVuY3Rpb25hbE9wdGlvbnMnO1xuXG4vLyBcblxuZnVuY3Rpb24gZ2V0U2VsZWN0b3JUeXBlT3JUaHJvdyAoc2VsZWN0b3IsIG1ldGhvZE5hbWUpIHtcbiAgaWYgKGlzRG9tU2VsZWN0b3Ioc2VsZWN0b3IpKSB7IHJldHVybiBET01fU0VMRUNUT1IgfVxuICBpZiAoaXNOYW1lU2VsZWN0b3Ioc2VsZWN0b3IpKSB7IHJldHVybiBOQU1FX1NFTEVDVE9SIH1cbiAgaWYgKGlzVnVlQ29tcG9uZW50KHNlbGVjdG9yKSkgeyByZXR1cm4gQ09NUE9ORU5UX1NFTEVDVE9SIH1cbiAgaWYgKGlzUmVmU2VsZWN0b3Ioc2VsZWN0b3IpKSB7IHJldHVybiBSRUZfU0VMRUNUT1IgfVxuXG4gIHRocm93RXJyb3IoKFwid3JhcHBlci5cIiArIG1ldGhvZE5hbWUgKyBcIigpIG11c3QgYmUgcGFzc2VkIGEgdmFsaWQgQ1NTIHNlbGVjdG9yLCBWdWUgY29uc3RydWN0b3IsIG9yIHZhbGlkIGZpbmQgb3B0aW9uIG9iamVjdFwiKSk7XG59XG5cbi8vIFxuXG5mdW5jdGlvbiBmaW5kQWxsVnVlQ29tcG9uZW50c0Zyb21WbSAoXG4gIHZtLFxuICBjb21wb25lbnRzXG4pIHtcbiAgaWYgKCBjb21wb25lbnRzID09PSB2b2lkIDAgKSBjb21wb25lbnRzID0gW107XG5cbiAgY29tcG9uZW50cy5wdXNoKHZtKTtcbiAgdm0uJGNoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24gKGNoaWxkKSB7XG4gICAgZmluZEFsbFZ1ZUNvbXBvbmVudHNGcm9tVm0oY2hpbGQsIGNvbXBvbmVudHMpO1xuICB9KTtcblxuICByZXR1cm4gY29tcG9uZW50c1xufVxuXG5mdW5jdGlvbiBmaW5kQWxsVnVlQ29tcG9uZW50c0Zyb21Wbm9kZSAoXG4gIHZub2RlLFxuICBjb21wb25lbnRzXG4pIHtcbiAgaWYgKCBjb21wb25lbnRzID09PSB2b2lkIDAgKSBjb21wb25lbnRzID0gW107XG5cbiAgaWYgKHZub2RlLmNoaWxkKSB7XG4gICAgY29tcG9uZW50cy5wdXNoKHZub2RlLmNoaWxkKTtcbiAgfVxuICBpZiAodm5vZGUuY2hpbGRyZW4pIHtcbiAgICB2bm9kZS5jaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uIChjaGlsZCkge1xuICAgICAgZmluZEFsbFZ1ZUNvbXBvbmVudHNGcm9tVm5vZGUoY2hpbGQsIGNvbXBvbmVudHMpO1xuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIGNvbXBvbmVudHNcbn1cblxuZnVuY3Rpb24gZmluZEFsbEZ1bmN0aW9uYWxDb21wb25lbnRzRnJvbVZub2RlIChcbiAgdm5vZGUsXG4gIGNvbXBvbmVudHNcbikge1xuICBpZiAoIGNvbXBvbmVudHMgPT09IHZvaWQgMCApIGNvbXBvbmVudHMgPSBbXTtcblxuICBpZiAodm5vZGVbRlVOQ1RJT05BTF9PUFRJT05TXSB8fCB2bm9kZS5mdW5jdGlvbmFsQ29udGV4dCkge1xuICAgIGNvbXBvbmVudHMucHVzaCh2bm9kZSk7XG4gIH1cbiAgaWYgKHZub2RlLmNoaWxkcmVuKSB7XG4gICAgdm5vZGUuY2hpbGRyZW4uZm9yRWFjaChmdW5jdGlvbiAoY2hpbGQpIHtcbiAgICAgIGZpbmRBbGxGdW5jdGlvbmFsQ29tcG9uZW50c0Zyb21Wbm9kZShjaGlsZCwgY29tcG9uZW50cyk7XG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIGNvbXBvbmVudHNcbn1cblxuZnVuY3Rpb24gdm1DdG9yTWF0Y2hlc05hbWUgKHZtLCBuYW1lKSB7XG4gIHJldHVybiAhISgodm0uJHZub2RlICYmIHZtLiR2bm9kZS5jb21wb25lbnRPcHRpb25zICYmXG4gICAgdm0uJHZub2RlLmNvbXBvbmVudE9wdGlvbnMuQ3Rvci5vcHRpb25zLm5hbWUgPT09IG5hbWUpIHx8XG4gICAgKHZtLl92bm9kZSAmJlxuICAgIHZtLl92bm9kZS5mdW5jdGlvbmFsT3B0aW9ucyAmJlxuICAgIHZtLl92bm9kZS5mdW5jdGlvbmFsT3B0aW9ucy5uYW1lID09PSBuYW1lKSB8fFxuICAgIHZtLiRvcHRpb25zICYmIHZtLiRvcHRpb25zLm5hbWUgPT09IG5hbWUgfHxcbiAgICB2bS5vcHRpb25zICYmIHZtLm9wdGlvbnMubmFtZSA9PT0gbmFtZSlcbn1cblxuZnVuY3Rpb24gdm1DdG9yTWF0Y2hlc1NlbGVjdG9yIChjb21wb25lbnQsIHNlbGVjdG9yKSB7XG4gIHZhciBDdG9yID0gc2VsZWN0b3IuX0N0b3IgfHwgKHNlbGVjdG9yLm9wdGlvbnMgJiYgc2VsZWN0b3Iub3B0aW9ucy5fQ3Rvcik7XG4gIGlmICghQ3Rvcikge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG4gIHZhciBDdG9ycyA9IE9iamVjdC5rZXlzKEN0b3IpO1xuICByZXR1cm4gQ3RvcnMuc29tZShmdW5jdGlvbiAoYykgeyByZXR1cm4gQ3RvcltjXSA9PT0gY29tcG9uZW50Ll9fcHJvdG9fXy5jb25zdHJ1Y3RvcjsgfSlcbn1cblxuZnVuY3Rpb24gdm1GdW5jdGlvbmFsQ3Rvck1hdGNoZXNTZWxlY3RvciAoY29tcG9uZW50LCBDdG9yKSB7XG4gIGlmIChWVUVfVkVSU0lPTiA8IDIuMykge1xuICAgIHRocm93RXJyb3IoJ2ZpbmQgZm9yIGZ1bmN0aW9uYWwgY29tcG9uZW50cyBpcyBub3Qgc3VwcG9ydCBpbiBWdWUgPCAyLjMnKTtcbiAgfVxuXG4gIGlmICghQ3Rvcikge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgaWYgKCFjb21wb25lbnRbRlVOQ1RJT05BTF9PUFRJT05TXSkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG4gIHZhciBDdG9ycyA9IE9iamVjdC5rZXlzKGNvbXBvbmVudFtGVU5DVElPTkFMX09QVElPTlNdLl9DdG9yKTtcbiAgcmV0dXJuIEN0b3JzLnNvbWUoZnVuY3Rpb24gKGMpIHsgcmV0dXJuIEN0b3JbY10gPT09IGNvbXBvbmVudFtGVU5DVElPTkFMX09QVElPTlNdLl9DdG9yW2NdOyB9KVxufVxuXG5mdW5jdGlvbiBmaW5kVnVlQ29tcG9uZW50cyAoXG4gIHJvb3QsXG4gIHNlbGVjdG9yVHlwZSxcbiAgc2VsZWN0b3Jcbikge1xuICBpZiAoc2VsZWN0b3IuZnVuY3Rpb25hbCkge1xuICAgIHZhciBub2RlcyA9IHJvb3QuX3Zub2RlXG4gICAgICA/IGZpbmRBbGxGdW5jdGlvbmFsQ29tcG9uZW50c0Zyb21Wbm9kZShyb290Ll92bm9kZSlcbiAgICAgIDogZmluZEFsbEZ1bmN0aW9uYWxDb21wb25lbnRzRnJvbVZub2RlKHJvb3QpO1xuICAgIHJldHVybiBub2Rlcy5maWx0ZXIoZnVuY3Rpb24gKG5vZGUpIHsgcmV0dXJuIHZtRnVuY3Rpb25hbEN0b3JNYXRjaGVzU2VsZWN0b3Iobm9kZSwgc2VsZWN0b3IuX0N0b3IpIHx8XG4gICAgICBub2RlW0ZVTkNUSU9OQUxfT1BUSU9OU10ubmFtZSA9PT0gc2VsZWN0b3IubmFtZTsgfVxuICAgIClcbiAgfVxuICB2YXIgbmFtZVNlbGVjdG9yID0gdHlwZW9mIHNlbGVjdG9yID09PSAnZnVuY3Rpb24nID8gc2VsZWN0b3Iub3B0aW9ucy5uYW1lIDogc2VsZWN0b3IubmFtZTtcbiAgdmFyIGNvbXBvbmVudHMgPSByb290Ll9pc1Z1ZVxuICAgID8gZmluZEFsbFZ1ZUNvbXBvbmVudHNGcm9tVm0ocm9vdClcbiAgICA6IGZpbmRBbGxWdWVDb21wb25lbnRzRnJvbVZub2RlKHJvb3QpO1xuICByZXR1cm4gY29tcG9uZW50cy5maWx0ZXIoZnVuY3Rpb24gKGNvbXBvbmVudCkge1xuICAgIGlmICghY29tcG9uZW50LiR2bm9kZSAmJiAhY29tcG9uZW50LiRvcHRpb25zLmV4dGVuZHMpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgICByZXR1cm4gdm1DdG9yTWF0Y2hlc1NlbGVjdG9yKGNvbXBvbmVudCwgc2VsZWN0b3IpIHx8IHZtQ3Rvck1hdGNoZXNOYW1lKGNvbXBvbmVudCwgbmFtZVNlbGVjdG9yKVxuICB9KVxufVxuXG4vLyBcblxudmFyIFdyYXBwZXJBcnJheSA9IGZ1bmN0aW9uIFdyYXBwZXJBcnJheSAod3JhcHBlcnMpIHtcbiAgdGhpcy53cmFwcGVycyA9IHdyYXBwZXJzIHx8IFtdO1xuICB0aGlzLmxlbmd0aCA9IHRoaXMud3JhcHBlcnMubGVuZ3RoO1xufTtcblxuV3JhcHBlckFycmF5LnByb3RvdHlwZS5hdCA9IGZ1bmN0aW9uIGF0IChpbmRleCkge1xuICBpZiAoaW5kZXggPiB0aGlzLmxlbmd0aCAtIDEpIHtcbiAgICB0aHJvd0Vycm9yKChcIm5vIGl0ZW0gZXhpc3RzIGF0IFwiICsgaW5kZXgpKTtcbiAgfVxuICByZXR1cm4gdGhpcy53cmFwcGVyc1tpbmRleF1cbn07XG5cbldyYXBwZXJBcnJheS5wcm90b3R5cGUuYXR0cmlidXRlcyA9IGZ1bmN0aW9uIGF0dHJpYnV0ZXMgKCkge1xuICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgnYXR0cmlidXRlcycpO1xuXG4gIHRocm93RXJyb3IoJ2F0dHJpYnV0ZXMgbXVzdCBiZSBjYWxsZWQgb24gYSBzaW5nbGUgd3JhcHBlciwgdXNlIGF0KGkpIHRvIGFjY2VzcyBhIHdyYXBwZXInKTtcbn07XG5cbldyYXBwZXJBcnJheS5wcm90b3R5cGUuY2xhc3NlcyA9IGZ1bmN0aW9uIGNsYXNzZXMgKCkge1xuICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgnY2xhc3NlcycpO1xuXG4gIHRocm93RXJyb3IoJ2NsYXNzZXMgbXVzdCBiZSBjYWxsZWQgb24gYSBzaW5nbGUgd3JhcHBlciwgdXNlIGF0KGkpIHRvIGFjY2VzcyBhIHdyYXBwZXInKTtcbn07XG5cbldyYXBwZXJBcnJheS5wcm90b3R5cGUuY29udGFpbnMgPSBmdW5jdGlvbiBjb250YWlucyAoc2VsZWN0b3IpIHtcbiAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ2NvbnRhaW5zJyk7XG5cbiAgcmV0dXJuIHRoaXMud3JhcHBlcnMuZXZlcnkoZnVuY3Rpb24gKHdyYXBwZXIpIHsgcmV0dXJuIHdyYXBwZXIuY29udGFpbnMoc2VsZWN0b3IpOyB9KVxufTtcblxuV3JhcHBlckFycmF5LnByb3RvdHlwZS5leGlzdHMgPSBmdW5jdGlvbiBleGlzdHMgKCkge1xuICByZXR1cm4gdGhpcy5sZW5ndGggPiAwICYmIHRoaXMud3JhcHBlcnMuZXZlcnkoZnVuY3Rpb24gKHdyYXBwZXIpIHsgcmV0dXJuIHdyYXBwZXIuZXhpc3RzKCk7IH0pXG59O1xuXG5XcmFwcGVyQXJyYXkucHJvdG90eXBlLmZpbHRlciA9IGZ1bmN0aW9uIGZpbHRlciAocHJlZGljYXRlKSB7XG4gIHJldHVybiBuZXcgV3JhcHBlckFycmF5KHRoaXMud3JhcHBlcnMuZmlsdGVyKHByZWRpY2F0ZSkpXG59O1xuXG5XcmFwcGVyQXJyYXkucHJvdG90eXBlLnZpc2libGUgPSBmdW5jdGlvbiB2aXNpYmxlICgpIHtcbiAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ3Zpc2libGUnKTtcblxuICByZXR1cm4gdGhpcy5sZW5ndGggPiAwICYmIHRoaXMud3JhcHBlcnMuZXZlcnkoZnVuY3Rpb24gKHdyYXBwZXIpIHsgcmV0dXJuIHdyYXBwZXIudmlzaWJsZSgpOyB9KVxufTtcblxuV3JhcHBlckFycmF5LnByb3RvdHlwZS5lbWl0dGVkID0gZnVuY3Rpb24gZW1pdHRlZCAoKSB7XG4gIHRoaXMudGhyb3dFcnJvcklmV3JhcHBlcnNJc0VtcHR5KCdlbWl0dGVkJyk7XG5cbiAgdGhyb3dFcnJvcignZW1pdHRlZCBtdXN0IGJlIGNhbGxlZCBvbiBhIHNpbmdsZSB3cmFwcGVyLCB1c2UgYXQoaSkgdG8gYWNjZXNzIGEgd3JhcHBlcicpO1xufTtcblxuV3JhcHBlckFycmF5LnByb3RvdHlwZS5lbWl0dGVkQnlPcmRlciA9IGZ1bmN0aW9uIGVtaXR0ZWRCeU9yZGVyICgpIHtcbiAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ2VtaXR0ZWRCeU9yZGVyJyk7XG5cbiAgdGhyb3dFcnJvcignZW1pdHRlZEJ5T3JkZXIgbXVzdCBiZSBjYWxsZWQgb24gYSBzaW5nbGUgd3JhcHBlciwgdXNlIGF0KGkpIHRvIGFjY2VzcyBhIHdyYXBwZXInKTtcbn07XG5cbldyYXBwZXJBcnJheS5wcm90b3R5cGUuaGFzQXR0cmlidXRlID0gZnVuY3Rpb24gaGFzQXR0cmlidXRlIChhdHRyaWJ1dGUsIHZhbHVlKSB7XG4gIHRoaXMudGhyb3dFcnJvcklmV3JhcHBlcnNJc0VtcHR5KCdoYXNBdHRyaWJ1dGUnKTtcblxuICByZXR1cm4gdGhpcy53cmFwcGVycy5ldmVyeShmdW5jdGlvbiAod3JhcHBlcikgeyByZXR1cm4gd3JhcHBlci5oYXNBdHRyaWJ1dGUoYXR0cmlidXRlLCB2YWx1ZSk7IH0pXG59O1xuXG5XcmFwcGVyQXJyYXkucHJvdG90eXBlLmhhc0NsYXNzID0gZnVuY3Rpb24gaGFzQ2xhc3MgKGNsYXNzTmFtZSkge1xuICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgnaGFzQ2xhc3MnKTtcblxuICByZXR1cm4gdGhpcy53cmFwcGVycy5ldmVyeShmdW5jdGlvbiAod3JhcHBlcikgeyByZXR1cm4gd3JhcHBlci5oYXNDbGFzcyhjbGFzc05hbWUpOyB9KVxufTtcblxuV3JhcHBlckFycmF5LnByb3RvdHlwZS5oYXNQcm9wID0gZnVuY3Rpb24gaGFzUHJvcCAocHJvcCwgdmFsdWUpIHtcbiAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ2hhc1Byb3AnKTtcblxuICByZXR1cm4gdGhpcy53cmFwcGVycy5ldmVyeShmdW5jdGlvbiAod3JhcHBlcikgeyByZXR1cm4gd3JhcHBlci5oYXNQcm9wKHByb3AsIHZhbHVlKTsgfSlcbn07XG5cbldyYXBwZXJBcnJheS5wcm90b3R5cGUuaGFzU3R5bGUgPSBmdW5jdGlvbiBoYXNTdHlsZSAoc3R5bGUsIHZhbHVlKSB7XG4gIHRoaXMudGhyb3dFcnJvcklmV3JhcHBlcnNJc0VtcHR5KCdoYXNTdHlsZScpO1xuXG4gIHJldHVybiB0aGlzLndyYXBwZXJzLmV2ZXJ5KGZ1bmN0aW9uICh3cmFwcGVyKSB7IHJldHVybiB3cmFwcGVyLmhhc1N0eWxlKHN0eWxlLCB2YWx1ZSk7IH0pXG59O1xuXG5XcmFwcGVyQXJyYXkucHJvdG90eXBlLmZpbmRBbGwgPSBmdW5jdGlvbiBmaW5kQWxsICgpIHtcbiAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ2ZpbmRBbGwnKTtcblxuICB0aHJvd0Vycm9yKCdmaW5kQWxsIG11c3QgYmUgY2FsbGVkIG9uIGEgc2luZ2xlIHdyYXBwZXIsIHVzZSBhdChpKSB0byBhY2Nlc3MgYSB3cmFwcGVyJyk7XG59O1xuXG5XcmFwcGVyQXJyYXkucHJvdG90eXBlLmZpbmQgPSBmdW5jdGlvbiBmaW5kICgpIHtcbiAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ2ZpbmQnKTtcblxuICB0aHJvd0Vycm9yKCdmaW5kIG11c3QgYmUgY2FsbGVkIG9uIGEgc2luZ2xlIHdyYXBwZXIsIHVzZSBhdChpKSB0byBhY2Nlc3MgYSB3cmFwcGVyJyk7XG59O1xuXG5XcmFwcGVyQXJyYXkucHJvdG90eXBlLmh0bWwgPSBmdW5jdGlvbiBodG1sICgpIHtcbiAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ2h0bWwnKTtcblxuICB0aHJvd0Vycm9yKCdodG1sIG11c3QgYmUgY2FsbGVkIG9uIGEgc2luZ2xlIHdyYXBwZXIsIHVzZSBhdChpKSB0byBhY2Nlc3MgYSB3cmFwcGVyJyk7XG59O1xuXG5XcmFwcGVyQXJyYXkucHJvdG90eXBlLmlzID0gZnVuY3Rpb24gaXMgKHNlbGVjdG9yKSB7XG4gIHRoaXMudGhyb3dFcnJvcklmV3JhcHBlcnNJc0VtcHR5KCdpcycpO1xuXG4gIHJldHVybiB0aGlzLndyYXBwZXJzLmV2ZXJ5KGZ1bmN0aW9uICh3cmFwcGVyKSB7IHJldHVybiB3cmFwcGVyLmlzKHNlbGVjdG9yKTsgfSlcbn07XG5cbldyYXBwZXJBcnJheS5wcm90b3R5cGUuaXNFbXB0eSA9IGZ1bmN0aW9uIGlzRW1wdHkgKCkge1xuICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgnaXNFbXB0eScpO1xuXG4gIHJldHVybiB0aGlzLndyYXBwZXJzLmV2ZXJ5KGZ1bmN0aW9uICh3cmFwcGVyKSB7IHJldHVybiB3cmFwcGVyLmlzRW1wdHkoKTsgfSlcbn07XG5cbldyYXBwZXJBcnJheS5wcm90b3R5cGUuaXNWaXNpYmxlID0gZnVuY3Rpb24gaXNWaXNpYmxlICgpIHtcbiAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ2lzVmlzaWJsZScpO1xuXG4gIHJldHVybiB0aGlzLndyYXBwZXJzLmV2ZXJ5KGZ1bmN0aW9uICh3cmFwcGVyKSB7IHJldHVybiB3cmFwcGVyLmlzVmlzaWJsZSgpOyB9KVxufTtcblxuV3JhcHBlckFycmF5LnByb3RvdHlwZS5pc1Z1ZUluc3RhbmNlID0gZnVuY3Rpb24gaXNWdWVJbnN0YW5jZSAoKSB7XG4gIHRoaXMudGhyb3dFcnJvcklmV3JhcHBlcnNJc0VtcHR5KCdpc1Z1ZUluc3RhbmNlJyk7XG5cbiAgcmV0dXJuIHRoaXMud3JhcHBlcnMuZXZlcnkoZnVuY3Rpb24gKHdyYXBwZXIpIHsgcmV0dXJuIHdyYXBwZXIuaXNWdWVJbnN0YW5jZSgpOyB9KVxufTtcblxuV3JhcHBlckFycmF5LnByb3RvdHlwZS5uYW1lID0gZnVuY3Rpb24gbmFtZSAoKSB7XG4gIHRoaXMudGhyb3dFcnJvcklmV3JhcHBlcnNJc0VtcHR5KCduYW1lJyk7XG5cbiAgdGhyb3dFcnJvcignbmFtZSBtdXN0IGJlIGNhbGxlZCBvbiBhIHNpbmdsZSB3cmFwcGVyLCB1c2UgYXQoaSkgdG8gYWNjZXNzIGEgd3JhcHBlcicpO1xufTtcblxuV3JhcHBlckFycmF5LnByb3RvdHlwZS5wcm9wcyA9IGZ1bmN0aW9uIHByb3BzICgpIHtcbiAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ3Byb3BzJyk7XG5cbiAgdGhyb3dFcnJvcigncHJvcHMgbXVzdCBiZSBjYWxsZWQgb24gYSBzaW5nbGUgd3JhcHBlciwgdXNlIGF0KGkpIHRvIGFjY2VzcyBhIHdyYXBwZXInKTtcbn07XG5cbldyYXBwZXJBcnJheS5wcm90b3R5cGUudGV4dCA9IGZ1bmN0aW9uIHRleHQgKCkge1xuICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgndGV4dCcpO1xuXG4gIHRocm93RXJyb3IoJ3RleHQgbXVzdCBiZSBjYWxsZWQgb24gYSBzaW5nbGUgd3JhcHBlciwgdXNlIGF0KGkpIHRvIGFjY2VzcyBhIHdyYXBwZXInKTtcbn07XG5cbldyYXBwZXJBcnJheS5wcm90b3R5cGUudGhyb3dFcnJvcklmV3JhcHBlcnNJc0VtcHR5ID0gZnVuY3Rpb24gdGhyb3dFcnJvcklmV3JhcHBlcnNJc0VtcHR5IChtZXRob2QpIHtcbiAgaWYgKHRoaXMud3JhcHBlcnMubGVuZ3RoID09PSAwKSB7XG4gICAgdGhyb3dFcnJvcigobWV0aG9kICsgXCIgY2Fubm90IGJlIGNhbGxlZCBvbiAwIGl0ZW1zXCIpKTtcbiAgfVxufTtcblxuV3JhcHBlckFycmF5LnByb3RvdHlwZS5zZXRDb21wdXRlZCA9IGZ1bmN0aW9uIHNldENvbXB1dGVkIChjb21wdXRlZCkge1xuICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgnc2V0Q29tcHV0ZWQnKTtcblxuICB0aGlzLndyYXBwZXJzLmZvckVhY2goZnVuY3Rpb24gKHdyYXBwZXIpIHsgcmV0dXJuIHdyYXBwZXIuc2V0Q29tcHV0ZWQoY29tcHV0ZWQpOyB9KTtcbn07XG5cbldyYXBwZXJBcnJheS5wcm90b3R5cGUuc2V0RGF0YSA9IGZ1bmN0aW9uIHNldERhdGEgKGRhdGEpIHtcbiAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ3NldERhdGEnKTtcblxuICB0aGlzLndyYXBwZXJzLmZvckVhY2goZnVuY3Rpb24gKHdyYXBwZXIpIHsgcmV0dXJuIHdyYXBwZXIuc2V0RGF0YShkYXRhKTsgfSk7XG59O1xuXG5XcmFwcGVyQXJyYXkucHJvdG90eXBlLnNldE1ldGhvZHMgPSBmdW5jdGlvbiBzZXRNZXRob2RzIChwcm9wcykge1xuICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgnc2V0TWV0aG9kcycpO1xuXG4gIHRoaXMud3JhcHBlcnMuZm9yRWFjaChmdW5jdGlvbiAod3JhcHBlcikgeyByZXR1cm4gd3JhcHBlci5zZXRNZXRob2RzKHByb3BzKTsgfSk7XG59O1xuXG5XcmFwcGVyQXJyYXkucHJvdG90eXBlLnNldFByb3BzID0gZnVuY3Rpb24gc2V0UHJvcHMgKHByb3BzKSB7XG4gIHRoaXMudGhyb3dFcnJvcklmV3JhcHBlcnNJc0VtcHR5KCdzZXRQcm9wcycpO1xuXG4gIHRoaXMud3JhcHBlcnMuZm9yRWFjaChmdW5jdGlvbiAod3JhcHBlcikgeyByZXR1cm4gd3JhcHBlci5zZXRQcm9wcyhwcm9wcyk7IH0pO1xufTtcblxuV3JhcHBlckFycmF5LnByb3RvdHlwZS50cmlnZ2VyID0gZnVuY3Rpb24gdHJpZ2dlciAoZXZlbnQsIG9wdGlvbnMpIHtcbiAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ3RyaWdnZXInKTtcblxuICB0aGlzLndyYXBwZXJzLmZvckVhY2goZnVuY3Rpb24gKHdyYXBwZXIpIHsgcmV0dXJuIHdyYXBwZXIudHJpZ2dlcihldmVudCwgb3B0aW9ucyk7IH0pO1xufTtcblxuV3JhcHBlckFycmF5LnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiB1cGRhdGUgKCkge1xuICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgndXBkYXRlJyk7XG4gIHdhcm4oJ3VwZGF0ZSBoYXMgYmVlbiByZW1vdmVkLiBBbGwgY2hhbmdlcyBhcmUgbm93IHN5bmNocm5vdXMgd2l0aG91dCBjYWxsaW5nIHVwZGF0ZScpO1xufTtcblxuV3JhcHBlckFycmF5LnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24gZGVzdHJveSAoKSB7XG4gIHRoaXMudGhyb3dFcnJvcklmV3JhcHBlcnNJc0VtcHR5KCdkZXN0cm95Jyk7XG5cbiAgdGhpcy53cmFwcGVycy5mb3JFYWNoKGZ1bmN0aW9uICh3cmFwcGVyKSB7IHJldHVybiB3cmFwcGVyLmRlc3Ryb3koKTsgfSk7XG59O1xuXG4vLyBcblxudmFyIEVycm9yV3JhcHBlciA9IGZ1bmN0aW9uIEVycm9yV3JhcHBlciAoc2VsZWN0b3IpIHtcbiAgdGhpcy5zZWxlY3RvciA9IHNlbGVjdG9yO1xufTtcblxuRXJyb3JXcmFwcGVyLnByb3RvdHlwZS5hdCA9IGZ1bmN0aW9uIGF0ICgpIHtcbiAgdGhyb3dFcnJvcigoXCJmaW5kIGRpZCBub3QgcmV0dXJuIFwiICsgKHRoaXMuc2VsZWN0b3IpICsgXCIsIGNhbm5vdCBjYWxsIGF0KCkgb24gZW1wdHkgV3JhcHBlclwiKSk7XG59O1xuXG5FcnJvcldyYXBwZXIucHJvdG90eXBlLmF0dHJpYnV0ZXMgPSBmdW5jdGlvbiBhdHRyaWJ1dGVzICgpIHtcbiAgdGhyb3dFcnJvcigoXCJmaW5kIGRpZCBub3QgcmV0dXJuIFwiICsgKHRoaXMuc2VsZWN0b3IpICsgXCIsIGNhbm5vdCBjYWxsIGF0dHJpYnV0ZXMoKSBvbiBlbXB0eSBXcmFwcGVyXCIpKTtcbn07XG5cbkVycm9yV3JhcHBlci5wcm90b3R5cGUuY2xhc3NlcyA9IGZ1bmN0aW9uIGNsYXNzZXMgKCkge1xuICB0aHJvd0Vycm9yKChcImZpbmQgZGlkIG5vdCByZXR1cm4gXCIgKyAodGhpcy5zZWxlY3RvcikgKyBcIiwgY2Fubm90IGNhbGwgY2xhc3NlcygpIG9uIGVtcHR5IFdyYXBwZXJcIikpO1xufTtcblxuRXJyb3JXcmFwcGVyLnByb3RvdHlwZS5jb250YWlucyA9IGZ1bmN0aW9uIGNvbnRhaW5zICgpIHtcbiAgdGhyb3dFcnJvcigoXCJmaW5kIGRpZCBub3QgcmV0dXJuIFwiICsgKHRoaXMuc2VsZWN0b3IpICsgXCIsIGNhbm5vdCBjYWxsIGNvbnRhaW5zKCkgb24gZW1wdHkgV3JhcHBlclwiKSk7XG59O1xuXG5FcnJvcldyYXBwZXIucHJvdG90eXBlLmVtaXR0ZWQgPSBmdW5jdGlvbiBlbWl0dGVkICgpIHtcbiAgdGhyb3dFcnJvcigoXCJmaW5kIGRpZCBub3QgcmV0dXJuIFwiICsgKHRoaXMuc2VsZWN0b3IpICsgXCIsIGNhbm5vdCBjYWxsIGVtaXR0ZWQoKSBvbiBlbXB0eSBXcmFwcGVyXCIpKTtcbn07XG5cbkVycm9yV3JhcHBlci5wcm90b3R5cGUuZW1pdHRlZEJ5T3JkZXIgPSBmdW5jdGlvbiBlbWl0dGVkQnlPcmRlciAoKSB7XG4gIHRocm93RXJyb3IoKFwiZmluZCBkaWQgbm90IHJldHVybiBcIiArICh0aGlzLnNlbGVjdG9yKSArIFwiLCBjYW5ub3QgY2FsbCBlbWl0dGVkQnlPcmRlcigpIG9uIGVtcHR5IFdyYXBwZXJcIikpO1xufTtcblxuRXJyb3JXcmFwcGVyLnByb3RvdHlwZS5leGlzdHMgPSBmdW5jdGlvbiBleGlzdHMgKCkge1xuICByZXR1cm4gZmFsc2Vcbn07XG5cbkVycm9yV3JhcHBlci5wcm90b3R5cGUuZmlsdGVyID0gZnVuY3Rpb24gZmlsdGVyICgpIHtcbiAgdGhyb3dFcnJvcigoXCJmaW5kIGRpZCBub3QgcmV0dXJuIFwiICsgKHRoaXMuc2VsZWN0b3IpICsgXCIsIGNhbm5vdCBjYWxsIGZpbHRlcigpIG9uIGVtcHR5IFdyYXBwZXJcIikpO1xufTtcblxuRXJyb3JXcmFwcGVyLnByb3RvdHlwZS52aXNpYmxlID0gZnVuY3Rpb24gdmlzaWJsZSAoKSB7XG4gIHRocm93RXJyb3IoKFwiZmluZCBkaWQgbm90IHJldHVybiBcIiArICh0aGlzLnNlbGVjdG9yKSArIFwiLCBjYW5ub3QgY2FsbCB2aXNpYmxlKCkgb24gZW1wdHkgV3JhcHBlclwiKSk7XG59O1xuXG5FcnJvcldyYXBwZXIucHJvdG90eXBlLmhhc0F0dHJpYnV0ZSA9IGZ1bmN0aW9uIGhhc0F0dHJpYnV0ZSAoKSB7XG4gIHRocm93RXJyb3IoKFwiZmluZCBkaWQgbm90IHJldHVybiBcIiArICh0aGlzLnNlbGVjdG9yKSArIFwiLCBjYW5ub3QgY2FsbCBoYXNBdHRyaWJ1dGUoKSBvbiBlbXB0eSBXcmFwcGVyXCIpKTtcbn07XG5cbkVycm9yV3JhcHBlci5wcm90b3R5cGUuaGFzQ2xhc3MgPSBmdW5jdGlvbiBoYXNDbGFzcyAoKSB7XG4gIHRocm93RXJyb3IoKFwiZmluZCBkaWQgbm90IHJldHVybiBcIiArICh0aGlzLnNlbGVjdG9yKSArIFwiLCBjYW5ub3QgY2FsbCBoYXNDbGFzcygpIG9uIGVtcHR5IFdyYXBwZXJcIikpO1xufTtcblxuRXJyb3JXcmFwcGVyLnByb3RvdHlwZS5oYXNQcm9wID0gZnVuY3Rpb24gaGFzUHJvcCAoKSB7XG4gIHRocm93RXJyb3IoKFwiZmluZCBkaWQgbm90IHJldHVybiBcIiArICh0aGlzLnNlbGVjdG9yKSArIFwiLCBjYW5ub3QgY2FsbCBoYXNQcm9wKCkgb24gZW1wdHkgV3JhcHBlclwiKSk7XG59O1xuXG5FcnJvcldyYXBwZXIucHJvdG90eXBlLmhhc1N0eWxlID0gZnVuY3Rpb24gaGFzU3R5bGUgKCkge1xuICB0aHJvd0Vycm9yKChcImZpbmQgZGlkIG5vdCByZXR1cm4gXCIgKyAodGhpcy5zZWxlY3RvcikgKyBcIiwgY2Fubm90IGNhbGwgaGFzU3R5bGUoKSBvbiBlbXB0eSBXcmFwcGVyXCIpKTtcbn07XG5cbkVycm9yV3JhcHBlci5wcm90b3R5cGUuZmluZEFsbCA9IGZ1bmN0aW9uIGZpbmRBbGwgKCkge1xuICB0aHJvd0Vycm9yKChcImZpbmQgZGlkIG5vdCByZXR1cm4gXCIgKyAodGhpcy5zZWxlY3RvcikgKyBcIiwgY2Fubm90IGNhbGwgZmluZEFsbCgpIG9uIGVtcHR5IFdyYXBwZXJcIikpO1xufTtcblxuRXJyb3JXcmFwcGVyLnByb3RvdHlwZS5maW5kID0gZnVuY3Rpb24gZmluZCAoKSB7XG4gIHRocm93RXJyb3IoKFwiZmluZCBkaWQgbm90IHJldHVybiBcIiArICh0aGlzLnNlbGVjdG9yKSArIFwiLCBjYW5ub3QgY2FsbCBmaW5kKCkgb24gZW1wdHkgV3JhcHBlclwiKSk7XG59O1xuXG5FcnJvcldyYXBwZXIucHJvdG90eXBlLmh0bWwgPSBmdW5jdGlvbiBodG1sICgpIHtcbiAgdGhyb3dFcnJvcigoXCJmaW5kIGRpZCBub3QgcmV0dXJuIFwiICsgKHRoaXMuc2VsZWN0b3IpICsgXCIsIGNhbm5vdCBjYWxsIGh0bWwoKSBvbiBlbXB0eSBXcmFwcGVyXCIpKTtcbn07XG5cbkVycm9yV3JhcHBlci5wcm90b3R5cGUuaXMgPSBmdW5jdGlvbiBpcyAoKSB7XG4gIHRocm93RXJyb3IoKFwiZmluZCBkaWQgbm90IHJldHVybiBcIiArICh0aGlzLnNlbGVjdG9yKSArIFwiLCBjYW5ub3QgY2FsbCBpcygpIG9uIGVtcHR5IFdyYXBwZXJcIikpO1xufTtcblxuRXJyb3JXcmFwcGVyLnByb3RvdHlwZS5pc0VtcHR5ID0gZnVuY3Rpb24gaXNFbXB0eSAoKSB7XG4gIHRocm93RXJyb3IoKFwiZmluZCBkaWQgbm90IHJldHVybiBcIiArICh0aGlzLnNlbGVjdG9yKSArIFwiLCBjYW5ub3QgY2FsbCBpc0VtcHR5KCkgb24gZW1wdHkgV3JhcHBlclwiKSk7XG59O1xuXG5FcnJvcldyYXBwZXIucHJvdG90eXBlLmlzVmlzaWJsZSA9IGZ1bmN0aW9uIGlzVmlzaWJsZSAoKSB7XG4gIHRocm93RXJyb3IoKFwiZmluZCBkaWQgbm90IHJldHVybiBcIiArICh0aGlzLnNlbGVjdG9yKSArIFwiLCBjYW5ub3QgY2FsbCBpc1Zpc2libGUoKSBvbiBlbXB0eSBXcmFwcGVyXCIpKTtcbn07XG5cbkVycm9yV3JhcHBlci5wcm90b3R5cGUuaXNWdWVJbnN0YW5jZSA9IGZ1bmN0aW9uIGlzVnVlSW5zdGFuY2UgKCkge1xuICB0aHJvd0Vycm9yKChcImZpbmQgZGlkIG5vdCByZXR1cm4gXCIgKyAodGhpcy5zZWxlY3RvcikgKyBcIiwgY2Fubm90IGNhbGwgaXNWdWVJbnN0YW5jZSgpIG9uIGVtcHR5IFdyYXBwZXJcIikpO1xufTtcblxuRXJyb3JXcmFwcGVyLnByb3RvdHlwZS5uYW1lID0gZnVuY3Rpb24gbmFtZSAoKSB7XG4gIHRocm93RXJyb3IoKFwiZmluZCBkaWQgbm90IHJldHVybiBcIiArICh0aGlzLnNlbGVjdG9yKSArIFwiLCBjYW5ub3QgY2FsbCBuYW1lKCkgb24gZW1wdHkgV3JhcHBlclwiKSk7XG59O1xuXG5FcnJvcldyYXBwZXIucHJvdG90eXBlLnByb3BzID0gZnVuY3Rpb24gcHJvcHMgKCkge1xuICB0aHJvd0Vycm9yKChcImZpbmQgZGlkIG5vdCByZXR1cm4gXCIgKyAodGhpcy5zZWxlY3RvcikgKyBcIiwgY2Fubm90IGNhbGwgcHJvcHMoKSBvbiBlbXB0eSBXcmFwcGVyXCIpKTtcbn07XG5cbkVycm9yV3JhcHBlci5wcm90b3R5cGUudGV4dCA9IGZ1bmN0aW9uIHRleHQgKCkge1xuICB0aHJvd0Vycm9yKChcImZpbmQgZGlkIG5vdCByZXR1cm4gXCIgKyAodGhpcy5zZWxlY3RvcikgKyBcIiwgY2Fubm90IGNhbGwgdGV4dCgpIG9uIGVtcHR5IFdyYXBwZXJcIikpO1xufTtcblxuRXJyb3JXcmFwcGVyLnByb3RvdHlwZS5zZXRDb21wdXRlZCA9IGZ1bmN0aW9uIHNldENvbXB1dGVkICgpIHtcbiAgdGhyb3dFcnJvcigoXCJmaW5kIGRpZCBub3QgcmV0dXJuIFwiICsgKHRoaXMuc2VsZWN0b3IpICsgXCIsIGNhbm5vdCBjYWxsIHNldENvbXB1dGVkKCkgb24gZW1wdHkgV3JhcHBlclwiKSk7XG59O1xuXG5FcnJvcldyYXBwZXIucHJvdG90eXBlLnNldERhdGEgPSBmdW5jdGlvbiBzZXREYXRhICgpIHtcbiAgdGhyb3dFcnJvcigoXCJmaW5kIGRpZCBub3QgcmV0dXJuIFwiICsgKHRoaXMuc2VsZWN0b3IpICsgXCIsIGNhbm5vdCBjYWxsIHNldERhdGEoKSBvbiBlbXB0eSBXcmFwcGVyXCIpKTtcbn07XG5cbkVycm9yV3JhcHBlci5wcm90b3R5cGUuc2V0TWV0aG9kcyA9IGZ1bmN0aW9uIHNldE1ldGhvZHMgKCkge1xuICB0aHJvd0Vycm9yKChcImZpbmQgZGlkIG5vdCByZXR1cm4gXCIgKyAodGhpcy5zZWxlY3RvcikgKyBcIiwgY2Fubm90IGNhbGwgc2V0TWV0aG9kcygpIG9uIGVtcHR5IFdyYXBwZXJcIikpO1xufTtcblxuRXJyb3JXcmFwcGVyLnByb3RvdHlwZS5zZXRQcm9wcyA9IGZ1bmN0aW9uIHNldFByb3BzICgpIHtcbiAgdGhyb3dFcnJvcigoXCJmaW5kIGRpZCBub3QgcmV0dXJuIFwiICsgKHRoaXMuc2VsZWN0b3IpICsgXCIsIGNhbm5vdCBjYWxsIHNldFByb3BzKCkgb24gZW1wdHkgV3JhcHBlclwiKSk7XG59O1xuXG5FcnJvcldyYXBwZXIucHJvdG90eXBlLnRyaWdnZXIgPSBmdW5jdGlvbiB0cmlnZ2VyICgpIHtcbiAgdGhyb3dFcnJvcigoXCJmaW5kIGRpZCBub3QgcmV0dXJuIFwiICsgKHRoaXMuc2VsZWN0b3IpICsgXCIsIGNhbm5vdCBjYWxsIHRyaWdnZXIoKSBvbiBlbXB0eSBXcmFwcGVyXCIpKTtcbn07XG5cbkVycm9yV3JhcHBlci5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gdXBkYXRlICgpIHtcbiAgdGhyb3dFcnJvcihcInVwZGF0ZSBoYXMgYmVlbiByZW1vdmVkIGZyb20gdnVlLXRlc3QtdXRpbHMuIEFsbCB1cGRhdGVzIGFyZSBub3cgc3luY2hyb25vdXMgYnkgZGVmYXVsdFwiKTtcbn07XG5cbkVycm9yV3JhcHBlci5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uIGRlc3Ryb3kgKCkge1xuICB0aHJvd0Vycm9yKChcImZpbmQgZGlkIG5vdCByZXR1cm4gXCIgKyAodGhpcy5zZWxlY3RvcikgKyBcIiwgY2Fubm90IGNhbGwgZGVzdHJveSgpIG9uIGVtcHR5IFdyYXBwZXJcIikpO1xufTtcblxuLy8gXG5cbmZ1bmN0aW9uIGZpbmRBbGxWTm9kZXMgKHZub2RlLCBub2Rlcykge1xuICBpZiAoIG5vZGVzID09PSB2b2lkIDAgKSBub2RlcyA9IFtdO1xuXG4gIG5vZGVzLnB1c2godm5vZGUpO1xuXG4gIGlmIChBcnJheS5pc0FycmF5KHZub2RlLmNoaWxkcmVuKSkge1xuICAgIHZub2RlLmNoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24gKGNoaWxkVk5vZGUpIHtcbiAgICAgIGZpbmRBbGxWTm9kZXMoY2hpbGRWTm9kZSwgbm9kZXMpO1xuICAgIH0pO1xuICB9XG5cbiAgaWYgKHZub2RlLmNoaWxkKSB7XG4gICAgZmluZEFsbFZOb2Rlcyh2bm9kZS5jaGlsZC5fdm5vZGUsIG5vZGVzKTtcbiAgfVxuXG4gIHJldHVybiBub2Rlc1xufVxuXG5mdW5jdGlvbiByZW1vdmVEdXBsaWNhdGVOb2RlcyAodk5vZGVzKSB7XG4gIHJldHVybiB2Tm9kZXMuZmlsdGVyKGZ1bmN0aW9uICh2Tm9kZSwgaW5kZXgpIHsgcmV0dXJuIGluZGV4ID09PSB2Tm9kZXMuZmluZEluZGV4KGZ1bmN0aW9uIChub2RlKSB7IHJldHVybiB2Tm9kZS5lbG0gPT09IG5vZGUuZWxtOyB9KTsgfSlcbn1cblxuZnVuY3Rpb24gbm9kZU1hdGNoZXNSZWYgKG5vZGUsIHJlZk5hbWUpIHtcbiAgcmV0dXJuIG5vZGUuZGF0YSAmJiBub2RlLmRhdGEucmVmID09PSByZWZOYW1lXG59XG5cbmZ1bmN0aW9uIGZpbmRWTm9kZXNCeVJlZiAodk5vZGUsIHJlZk5hbWUpIHtcbiAgdmFyIG5vZGVzID0gZmluZEFsbFZOb2Rlcyh2Tm9kZSk7XG4gIHZhciByZWZGaWx0ZXJlZE5vZGVzID0gbm9kZXMuZmlsdGVyKGZ1bmN0aW9uIChub2RlKSB7IHJldHVybiBub2RlTWF0Y2hlc1JlZihub2RlLCByZWZOYW1lKTsgfSk7XG4gIC8vIE9ubHkgcmV0dXJuIHJlZnMgZGVmaW5lZCBvbiB0b3AtbGV2ZWwgVk5vZGUgdG8gcHJvdmlkZSB0aGUgc2FtZVxuICAvLyBiZWhhdmlvciBhcyBzZWxlY3RpbmcgdmlhIHZtLiRyZWYue3NvbWVSZWZOYW1lfVxuICB2YXIgbWFpblZOb2RlRmlsdGVyZWROb2RlcyA9IHJlZkZpbHRlcmVkTm9kZXMuZmlsdGVyKGZ1bmN0aW9uIChub2RlKSB7IHJldHVybiAoXG4gICAgISF2Tm9kZS5jb250ZXh0LiRyZWZzW25vZGUuZGF0YS5yZWZdXG4gICk7IH0pO1xuICByZXR1cm4gcmVtb3ZlRHVwbGljYXRlTm9kZXMobWFpblZOb2RlRmlsdGVyZWROb2Rlcylcbn1cblxuZnVuY3Rpb24gbm9kZU1hdGNoZXNTZWxlY3RvciAobm9kZSwgc2VsZWN0b3IpIHtcbiAgcmV0dXJuIG5vZGUuZWxtICYmIG5vZGUuZWxtLmdldEF0dHJpYnV0ZSAmJiBub2RlLmVsbS5tYXRjaGVzKHNlbGVjdG9yKVxufVxuXG5mdW5jdGlvbiBmaW5kVk5vZGVzQnlTZWxlY3RvciAoXG4gIHZOb2RlLFxuICBzZWxlY3RvclxuKSB7XG4gIHZhciBub2RlcyA9IGZpbmRBbGxWTm9kZXModk5vZGUpO1xuICB2YXIgZmlsdGVyZWROb2RlcyA9IG5vZGVzLmZpbHRlcihmdW5jdGlvbiAobm9kZSkgeyByZXR1cm4gKFxuICAgIG5vZGVNYXRjaGVzU2VsZWN0b3Iobm9kZSwgc2VsZWN0b3IpXG4gICk7IH0pO1xuICByZXR1cm4gcmVtb3ZlRHVwbGljYXRlTm9kZXMoZmlsdGVyZWROb2Rlcylcbn1cblxuZnVuY3Rpb24gZmluZFZub2RlcyAoXG4gIHZub2RlLFxuICB2bSxcbiAgc2VsZWN0b3JUeXBlLFxuICBzZWxlY3RvclxuKSB7XG4gIGlmIChzZWxlY3RvclR5cGUgPT09IFJFRl9TRUxFQ1RPUikge1xuICAgIGlmICghdm0pIHtcbiAgICAgIHRocm93RXJyb3IoJyRyZWYgc2VsZWN0b3JzIGNhbiBvbmx5IGJlIHVzZWQgb24gVnVlIGNvbXBvbmVudCB3cmFwcGVycycpO1xuICAgIH1cbiAgICAvLyAkRmxvd0lnbm9yZVxuICAgIHJldHVybiBmaW5kVk5vZGVzQnlSZWYodm5vZGUsIHNlbGVjdG9yLnJlZilcbiAgfVxuICAvLyAkRmxvd0lnbm9yZVxuICByZXR1cm4gZmluZFZOb2Rlc0J5U2VsZWN0b3Iodm5vZGUsIHNlbGVjdG9yKVxufVxuXG4vLyBcblxuZnVuY3Rpb24gZmluZERPTU5vZGVzIChcbiAgZWxlbWVudCxcbiAgc2VsZWN0b3Jcbikge1xuICB2YXIgbm9kZXMgPSBbXTtcbiAgaWYgKCFlbGVtZW50IHx8ICFlbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwgfHwgIWVsZW1lbnQubWF0Y2hlcykge1xuICAgIHJldHVybiBub2Rlc1xuICB9XG5cbiAgaWYgKGVsZW1lbnQubWF0Y2hlcyhzZWxlY3RvcikpIHtcbiAgICBub2Rlcy5wdXNoKGVsZW1lbnQpO1xuICB9XG4gIC8vICRGbG93SWdub3JlXG4gIHJldHVybiBub2Rlcy5jb25jYXQoW10uc2xpY2UuY2FsbChlbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpKSlcbn1cblxuLy8gXG5cbmZ1bmN0aW9uIGZpbmQgKFxuICB2bSxcbiAgdm5vZGUsXG4gIGVsZW1lbnQsXG4gIHNlbGVjdG9yXG4pIHtcbiAgdmFyIHNlbGVjdG9yVHlwZSA9IGdldFNlbGVjdG9yVHlwZU9yVGhyb3coc2VsZWN0b3IsICdmaW5kJyk7XG5cbiAgaWYgKCF2bm9kZSAmJiAhdm0gJiYgc2VsZWN0b3JUeXBlICE9PSBET01fU0VMRUNUT1IpIHtcbiAgICB0aHJvd0Vycm9yKCdjYW5ub3QgZmluZCBhIFZ1ZSBpbnN0YW5jZSBvbiBhIERPTSBub2RlLiBUaGUgbm9kZSB5b3UgYXJlIGNhbGxpbmcgZmluZCBvbiBkb2VzIG5vdCBleGlzdCBpbiB0aGUgVkRvbS4gQXJlIHlvdSBhZGRpbmcgdGhlIG5vZGUgYXMgaW5uZXJIVE1MPycpO1xuICB9XG5cbiAgaWYgKHNlbGVjdG9yVHlwZSA9PT0gQ09NUE9ORU5UX1NFTEVDVE9SIHx8IHNlbGVjdG9yVHlwZSA9PT0gTkFNRV9TRUxFQ1RPUikge1xuICAgIHZhciByb290ID0gdm0gfHwgdm5vZGU7XG4gICAgaWYgKCFyb290KSB7XG4gICAgICByZXR1cm4gW11cbiAgICB9XG4gICAgcmV0dXJuIGZpbmRWdWVDb21wb25lbnRzKHJvb3QsIHNlbGVjdG9yVHlwZSwgc2VsZWN0b3IpXG4gIH1cblxuICBpZiAodm0gJiYgdm0uJHJlZnMgJiYgc2VsZWN0b3IucmVmIGluIHZtLiRyZWZzICYmIHZtLiRyZWZzW3NlbGVjdG9yLnJlZl0gaW5zdGFuY2VvZiBWdWUpIHtcbiAgICByZXR1cm4gW3ZtLiRyZWZzW3NlbGVjdG9yLnJlZl1dXG4gIH1cblxuICBpZiAodm5vZGUpIHtcbiAgICB2YXIgbm9kZXMgPSBmaW5kVm5vZGVzKHZub2RlLCB2bSwgc2VsZWN0b3JUeXBlLCBzZWxlY3Rvcik7XG4gICAgaWYgKHNlbGVjdG9yVHlwZSAhPT0gRE9NX1NFTEVDVE9SKSB7XG4gICAgICByZXR1cm4gbm9kZXNcbiAgICB9XG4gICAgcmV0dXJuIG5vZGVzLmxlbmd0aCA+IDAgPyBub2RlcyA6IGZpbmRET01Ob2RlcyhlbGVtZW50LCBzZWxlY3RvcilcbiAgfVxuXG4gIHJldHVybiBmaW5kRE9NTm9kZXMoZWxlbWVudCwgc2VsZWN0b3IpXG59XG5cbi8vIFxuXG5mdW5jdGlvbiBjcmVhdGVXcmFwcGVyIChcbiAgbm9kZSxcbiAgb3B0aW9uc1xuKSB7XG4gIHJldHVybiBub2RlIGluc3RhbmNlb2YgVnVlXG4gICAgPyBuZXcgVnVlV3JhcHBlcihub2RlLCBvcHRpb25zKVxuICAgIDogbmV3IFdyYXBwZXIobm9kZSwgb3B0aW9ucylcbn1cblxudmFyIGkgPSAwO1xuXG5mdW5jdGlvbiBvcmRlckRlcHMgKHdhdGNoZXIpIHtcbiAgd2F0Y2hlci5kZXBzLmZvckVhY2goZnVuY3Rpb24gKGRlcCkge1xuICAgIGlmIChkZXAuX3NvcnRlZElkID09PSBpKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgZGVwLl9zb3J0ZWRJZCA9IGk7XG4gICAgZGVwLnN1YnMuZm9yRWFjaChvcmRlckRlcHMpO1xuICAgIGRlcC5zdWJzID0gZGVwLnN1YnMuc29ydChmdW5jdGlvbiAoYSwgYikgeyByZXR1cm4gYS5pZCAtIGIuaWQ7IH0pO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gb3JkZXJWbVdhdGNoZXJzICh2bSkge1xuICBpZiAodm0uX3dhdGNoZXJzKSB7XG4gICAgdm0uX3dhdGNoZXJzLmZvckVhY2gob3JkZXJEZXBzKTtcbiAgfVxuXG4gIGlmICh2bS5fY29tcHV0ZWRXYXRjaGVycykge1xuICAgIE9iamVjdC5rZXlzKHZtLl9jb21wdXRlZFdhdGNoZXJzKS5mb3JFYWNoKGZ1bmN0aW9uIChjb21wdXRlZFdhdGNoZXIpIHtcbiAgICAgIG9yZGVyRGVwcyh2bS5fY29tcHV0ZWRXYXRjaGVyc1tjb21wdXRlZFdhdGNoZXJdKTtcbiAgICB9KTtcbiAgfVxuXG4gIG9yZGVyRGVwcyh2bS5fd2F0Y2hlcik7XG5cbiAgdm0uJGNoaWxkcmVuLmZvckVhY2gob3JkZXJWbVdhdGNoZXJzKTtcbn1cblxuZnVuY3Rpb24gb3JkZXJXYXRjaGVycyAodm0pIHtcbiAgb3JkZXJWbVdhdGNoZXJzKHZtKTtcbiAgaSsrO1xufVxuXG4vLyBcblxudmFyIFdyYXBwZXIgPSBmdW5jdGlvbiBXcmFwcGVyIChub2RlLCBvcHRpb25zKSB7XG4gIGlmIChub2RlIGluc3RhbmNlb2YgRWxlbWVudCkge1xuICAgIHRoaXMuZWxlbWVudCA9IG5vZGU7XG4gICAgdGhpcy52bm9kZSA9IG51bGw7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy52bm9kZSA9IG5vZGU7XG4gICAgdGhpcy5lbGVtZW50ID0gbm9kZS5lbG07XG4gIH1cbiAgaWYgKHRoaXMudm5vZGUgJiYgKHRoaXMudm5vZGVbRlVOQ1RJT05BTF9PUFRJT05TXSB8fCB0aGlzLnZub2RlLmZ1bmN0aW9uYWxDb250ZXh0KSkge1xuICAgIHRoaXMuaXNGdW5jdGlvbmFsQ29tcG9uZW50ID0gdHJ1ZTtcbiAgfVxuICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICB0aGlzLnZlcnNpb24gPSBOdW1iZXIoKChWdWUudmVyc2lvbi5zcGxpdCgnLicpWzBdKSArIFwiLlwiICsgKFZ1ZS52ZXJzaW9uLnNwbGl0KCcuJylbMV0pKSk7XG59O1xuXG5XcmFwcGVyLnByb3RvdHlwZS5hdCA9IGZ1bmN0aW9uIGF0ICgpIHtcbiAgdGhyb3dFcnJvcignYXQoKSBtdXN0IGJlIGNhbGxlZCBvbiBhIFdyYXBwZXJBcnJheScpO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIGFuIE9iamVjdCBjb250YWluaW5nIGFsbCB0aGUgYXR0cmlidXRlL3ZhbHVlIHBhaXJzIG9uIHRoZSBlbGVtZW50LlxuICovXG5XcmFwcGVyLnByb3RvdHlwZS5hdHRyaWJ1dGVzID0gZnVuY3Rpb24gYXR0cmlidXRlcyAoKSB7XG4gIHZhciBhdHRyaWJ1dGVzID0gdGhpcy5lbGVtZW50LmF0dHJpYnV0ZXM7XG4gIHZhciBhdHRyaWJ1dGVNYXAgPSB7fTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBhdHRyaWJ1dGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGF0dCA9IGF0dHJpYnV0ZXMuaXRlbShpKTtcbiAgICBhdHRyaWJ1dGVNYXBbYXR0LmxvY2FsTmFtZV0gPSBhdHQudmFsdWU7XG4gIH1cbiAgcmV0dXJuIGF0dHJpYnV0ZU1hcFxufTtcblxuLyoqXG4gKiBSZXR1cm5zIGFuIEFycmF5IGNvbnRhaW5pbmcgYWxsIHRoZSBjbGFzc2VzIG9uIHRoZSBlbGVtZW50XG4gKi9cbldyYXBwZXIucHJvdG90eXBlLmNsYXNzZXMgPSBmdW5jdGlvbiBjbGFzc2VzICgpIHtcbiAgICB2YXIgdGhpcyQxID0gdGhpcztcblxuICAvLyB3b3JrcyBmb3IgSFRNTCBFbGVtZW50IGFuZCBTVkcgRWxlbWVudFxuICB2YXIgY2xhc3NOYW1lID0gdGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZSgnY2xhc3MnKTtcbiAgdmFyIGNsYXNzZXMgPSBjbGFzc05hbWUgPyBjbGFzc05hbWUuc3BsaXQoJyAnKSA6IFtdO1xuICAvLyBIYW5kbGUgY29udmVydGluZyBjc3Ntb2R1bGVzIGlkZW50aWZpZXJzIGJhY2sgdG8gdGhlIG9yaWdpbmFsIGNsYXNzIG5hbWVcbiAgaWYgKHRoaXMudm0gJiYgdGhpcy52bS4kc3R5bGUpIHtcbiAgICB2YXIgY3NzTW9kdWxlSWRlbnRpZmllcnMgPSB7fTtcbiAgICB2YXIgbW9kdWxlSWRlbnQ7XG4gICAgT2JqZWN0LmtleXModGhpcy52bS4kc3R5bGUpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgLy8gJEZsb3dJZ25vcmUgOiBGbG93IHRoaW5rcyB2bSBpcyBhIHByb3BlcnR5XG4gICAgICBtb2R1bGVJZGVudCA9IHRoaXMkMS52bS4kc3R5bGVba2V5XTtcbiAgICAgIC8vIENTUyBNb2R1bGVzIG1heSBiZSBtdWx0aS1jbGFzcyBpZiB0aGV5IGV4dGVuZCBvdGhlcnMuXG4gICAgICAvLyBFeHRlbmRlZCBjbGFzc2VzIHNob3VsZCBiZSBhbHJlYWR5IHByZXNlbnQgaW4gJHN0eWxlLlxuICAgICAgbW9kdWxlSWRlbnQgPSBtb2R1bGVJZGVudC5zcGxpdCgnICcpWzBdO1xuICAgICAgY3NzTW9kdWxlSWRlbnRpZmllcnNbbW9kdWxlSWRlbnRdID0ga2V5O1xuICAgIH0pO1xuICAgIGNsYXNzZXMgPSBjbGFzc2VzLm1hcChmdW5jdGlvbiAoY2xhc3NOYW1lKSB7IHJldHVybiBjc3NNb2R1bGVJZGVudGlmaWVyc1tjbGFzc05hbWVdIHx8IGNsYXNzTmFtZTsgfSk7XG4gIH1cbiAgcmV0dXJuIGNsYXNzZXNcbn07XG5cbi8qKlxuICogQ2hlY2tzIGlmIHdyYXBwZXIgY29udGFpbnMgcHJvdmlkZWQgc2VsZWN0b3IuXG4gKi9cbldyYXBwZXIucHJvdG90eXBlLmNvbnRhaW5zID0gZnVuY3Rpb24gY29udGFpbnMgKHNlbGVjdG9yKSB7XG4gIHZhciBzZWxlY3RvclR5cGUgPSBnZXRTZWxlY3RvclR5cGVPclRocm93KHNlbGVjdG9yLCAnY29udGFpbnMnKTtcbiAgdmFyIG5vZGVzID0gZmluZCh0aGlzLnZtLCB0aGlzLnZub2RlLCB0aGlzLmVsZW1lbnQsIHNlbGVjdG9yKTtcbiAgdmFyIGlzID0gc2VsZWN0b3JUeXBlID09PSBSRUZfU0VMRUNUT1IgPyBmYWxzZSA6IHRoaXMuaXMoc2VsZWN0b3IpO1xuICByZXR1cm4gbm9kZXMubGVuZ3RoID4gMCB8fCBpc1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIGFuIG9iamVjdCBjb250YWluaW5nIGN1c3RvbSBldmVudHMgZW1pdHRlZCBieSB0aGUgV3JhcHBlciB2bVxuICovXG5XcmFwcGVyLnByb3RvdHlwZS5lbWl0dGVkID0gZnVuY3Rpb24gZW1pdHRlZCAoZXZlbnQpIHtcbiAgaWYgKCF0aGlzLl9lbWl0dGVkICYmICF0aGlzLnZtKSB7XG4gICAgdGhyb3dFcnJvcignd3JhcHBlci5lbWl0dGVkKCkgY2FuIG9ubHkgYmUgY2FsbGVkIG9uIGEgVnVlIGluc3RhbmNlJyk7XG4gIH1cbiAgaWYgKGV2ZW50KSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZWRbZXZlbnRdXG4gIH1cbiAgcmV0dXJuIHRoaXMuX2VtaXR0ZWRcbn07XG5cbi8qKlxuICogUmV0dXJucyBhbiBBcnJheSBjb250YWluaW5nIGN1c3RvbSBldmVudHMgZW1pdHRlZCBieSB0aGUgV3JhcHBlciB2bVxuICovXG5XcmFwcGVyLnByb3RvdHlwZS5lbWl0dGVkQnlPcmRlciA9IGZ1bmN0aW9uIGVtaXR0ZWRCeU9yZGVyICgpIHtcbiAgaWYgKCF0aGlzLl9lbWl0dGVkQnlPcmRlciAmJiAhdGhpcy52bSkge1xuICAgIHRocm93RXJyb3IoJ3dyYXBwZXIuZW1pdHRlZEJ5T3JkZXIoKSBjYW4gb25seSBiZSBjYWxsZWQgb24gYSBWdWUgaW5zdGFuY2UnKTtcbiAgfVxuICByZXR1cm4gdGhpcy5fZW1pdHRlZEJ5T3JkZXJcbn07XG5cbi8qKlxuICogVXRpbGl0eSB0byBjaGVjayB3cmFwcGVyIGV4aXN0cy4gUmV0dXJucyB0cnVlIGFzIFdyYXBwZXIgYWx3YXlzIGV4aXN0c1xuICovXG5XcmFwcGVyLnByb3RvdHlwZS5leGlzdHMgPSBmdW5jdGlvbiBleGlzdHMgKCkge1xuICBpZiAodGhpcy52bSkge1xuICAgIHJldHVybiAhIXRoaXMudm0gJiYgIXRoaXMudm0uX2lzRGVzdHJveWVkXG4gIH1cbiAgcmV0dXJuIHRydWVcbn07XG5cbldyYXBwZXIucHJvdG90eXBlLmZpbHRlciA9IGZ1bmN0aW9uIGZpbHRlciAoKSB7XG4gIHRocm93RXJyb3IoJ2ZpbHRlcigpIG11c3QgYmUgY2FsbGVkIG9uIGEgV3JhcHBlckFycmF5Jyk7XG59O1xuXG4vKipcbiAqIFV0aWxpdHkgdG8gY2hlY2sgd3JhcHBlciBpcyB2aXNpYmxlLiBSZXR1cm5zIGZhbHNlIGlmIGEgcGFyZW50IGVsZW1lbnQgaGFzIGRpc3BsYXk6IG5vbmUgb3IgdmlzaWJpbGl0eTogaGlkZGVuIHN0eWxlLlxuICovXG5XcmFwcGVyLnByb3RvdHlwZS52aXNpYmxlID0gZnVuY3Rpb24gdmlzaWJsZSAoKSB7XG4gIHdhcm4oJ3Zpc2libGUgaGFzIGJlZW4gZGVwcmVjYXRlZCBhbmQgd2lsbCBiZSByZW1vdmVkIGluIHZlcnNpb24gMSwgdXNlIGlzVmlzaWJsZSBpbnN0ZWFkJyk7XG5cbiAgdmFyIGVsZW1lbnQgPSB0aGlzLmVsZW1lbnQ7XG5cbiAgaWYgKCFlbGVtZW50KSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICB3aGlsZSAoZWxlbWVudCkge1xuICAgIGlmIChlbGVtZW50LnN0eWxlICYmIChlbGVtZW50LnN0eWxlLnZpc2liaWxpdHkgPT09ICdoaWRkZW4nIHx8IGVsZW1lbnQuc3R5bGUuZGlzcGxheSA9PT0gJ25vbmUnKSkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICAgIGVsZW1lbnQgPSBlbGVtZW50LnBhcmVudEVsZW1lbnQ7XG4gIH1cblxuICByZXR1cm4gdHJ1ZVxufTtcblxuLyoqXG4gKiBDaGVja3MgaWYgd3JhcHBlciBoYXMgYW4gYXR0cmlidXRlIHdpdGggbWF0Y2hpbmcgdmFsdWVcbiAqL1xuV3JhcHBlci5wcm90b3R5cGUuaGFzQXR0cmlidXRlID0gZnVuY3Rpb24gaGFzQXR0cmlidXRlIChhdHRyaWJ1dGUsIHZhbHVlKSB7XG4gIHdhcm4oJ2hhc0F0dHJpYnV0ZSgpIGhhcyBiZWVuIGRlcHJlY2F0ZWQgYW5kIHdpbGwgYmUgcmVtb3ZlZCBpbiB2ZXJzaW9uIDEuMC4wLiBVc2UgYXR0cmlidXRlcygpIGluc3RlYWTigJRodHRwczovL3Z1ZS10ZXN0LXV0aWxzLnZ1ZWpzLm9yZy9lbi9hcGkvd3JhcHBlci9hdHRyaWJ1dGVzJyk7XG5cbiAgaWYgKHR5cGVvZiBhdHRyaWJ1dGUgIT09ICdzdHJpbmcnKSB7XG4gICAgdGhyb3dFcnJvcignd3JhcHBlci5oYXNBdHRyaWJ1dGUoKSBtdXN0IGJlIHBhc3NlZCBhdHRyaWJ1dGUgYXMgYSBzdHJpbmcnKTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSB7XG4gICAgdGhyb3dFcnJvcignd3JhcHBlci5oYXNBdHRyaWJ1dGUoKSBtdXN0IGJlIHBhc3NlZCB2YWx1ZSBhcyBhIHN0cmluZycpO1xuICB9XG5cbiAgcmV0dXJuICEhKHRoaXMuZWxlbWVudCAmJiB0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKGF0dHJpYnV0ZSkgPT09IHZhbHVlKVxufTtcblxuLyoqXG4gKiBBc3NlcnRzIHdyYXBwZXIgaGFzIGEgY2xhc3MgbmFtZVxuICovXG5XcmFwcGVyLnByb3RvdHlwZS5oYXNDbGFzcyA9IGZ1bmN0aW9uIGhhc0NsYXNzIChjbGFzc05hbWUpIHtcbiAgICB2YXIgdGhpcyQxID0gdGhpcztcblxuICB3YXJuKCdoYXNDbGFzcygpIGhhcyBiZWVuIGRlcHJlY2F0ZWQgYW5kIHdpbGwgYmUgcmVtb3ZlZCBpbiB2ZXJzaW9uIDEuMC4wLiBVc2UgY2xhc3NlcygpIGluc3RlYWTigJRodHRwczovL3Z1ZS10ZXN0LXV0aWxzLnZ1ZWpzLm9yZy9lbi9hcGkvd3JhcHBlci9jbGFzc2VzJyk7XG4gIHZhciB0YXJnZXRDbGFzcyA9IGNsYXNzTmFtZTtcblxuICBpZiAodHlwZW9mIHRhcmdldENsYXNzICE9PSAnc3RyaW5nJykge1xuICAgIHRocm93RXJyb3IoJ3dyYXBwZXIuaGFzQ2xhc3MoKSBtdXN0IGJlIHBhc3NlZCBhIHN0cmluZycpO1xuICB9XG5cbiAgLy8gaWYgJHN0eWxlIGlzIGF2YWlsYWJsZSBhbmQgaGFzIGEgbWF0Y2hpbmcgdGFyZ2V0LCB1c2UgdGhhdCBpbnN0ZWFkLlxuICBpZiAodGhpcy52bSAmJiB0aGlzLnZtLiRzdHlsZSAmJiB0aGlzLnZtLiRzdHlsZVt0YXJnZXRDbGFzc10pIHtcbiAgICB0YXJnZXRDbGFzcyA9IHRoaXMudm0uJHN0eWxlW3RhcmdldENsYXNzXTtcbiAgfVxuXG4gIHZhciBjb250YWluc0FsbENsYXNzZXMgPSB0YXJnZXRDbGFzc1xuICAgIC5zcGxpdCgnICcpXG4gICAgLmV2ZXJ5KGZ1bmN0aW9uICh0YXJnZXQpIHsgcmV0dXJuIHRoaXMkMS5lbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyh0YXJnZXQpOyB9KTtcblxuICByZXR1cm4gISEodGhpcy5lbGVtZW50ICYmIGNvbnRhaW5zQWxsQ2xhc3Nlcylcbn07XG5cbi8qKlxuICogQXNzZXJ0cyB3cmFwcGVyIGhhcyBhIHByb3AgbmFtZVxuICovXG5XcmFwcGVyLnByb3RvdHlwZS5oYXNQcm9wID0gZnVuY3Rpb24gaGFzUHJvcCAocHJvcCwgdmFsdWUpIHtcbiAgd2FybignaGFzUHJvcCgpIGhhcyBiZWVuIGRlcHJlY2F0ZWQgYW5kIHdpbGwgYmUgcmVtb3ZlZCBpbiB2ZXJzaW9uIDEuMC4wLiBVc2UgcHJvcHMoKSBpbnN0ZWFk4oCUaHR0cHM6Ly92dWUtdGVzdC11dGlscy52dWVqcy5vcmcvZW4vYXBpL3dyYXBwZXIvcHJvcHMnKTtcblxuICBpZiAoIXRoaXMuaXNWdWVDb21wb25lbnQpIHtcbiAgICB0aHJvd0Vycm9yKCd3cmFwcGVyLmhhc1Byb3AoKSBtdXN0IGJlIGNhbGxlZCBvbiBhIFZ1ZSBpbnN0YW5jZScpO1xuICB9XG4gIGlmICh0eXBlb2YgcHJvcCAhPT0gJ3N0cmluZycpIHtcbiAgICB0aHJvd0Vycm9yKCd3cmFwcGVyLmhhc1Byb3AoKSBtdXN0IGJlIHBhc3NlZCBwcm9wIGFzIGEgc3RyaW5nJyk7XG4gIH1cblxuICAvLyAkcHJvcHMgb2JqZWN0IGRvZXMgbm90IGV4aXN0IGluIFZ1ZSAyLjEueCwgc28gdXNlICRvcHRpb25zLnByb3BzRGF0YSBpbnN0ZWFkXG4gIGlmICh0aGlzLnZtICYmIHRoaXMudm0uJG9wdGlvbnMgJiYgdGhpcy52bS4kb3B0aW9ucy5wcm9wc0RhdGEgJiYgdGhpcy52bS4kb3B0aW9ucy5wcm9wc0RhdGFbcHJvcF0gPT09IHZhbHVlKSB7XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIHJldHVybiAhIXRoaXMudm0gJiYgISF0aGlzLnZtLiRwcm9wcyAmJiB0aGlzLnZtLiRwcm9wc1twcm9wXSA9PT0gdmFsdWVcbn07XG5cbi8qKlxuICogQ2hlY2tzIGlmIHdyYXBwZXIgaGFzIGEgc3R5bGUgd2l0aCB2YWx1ZVxuICovXG5XcmFwcGVyLnByb3RvdHlwZS5oYXNTdHlsZSA9IGZ1bmN0aW9uIGhhc1N0eWxlIChzdHlsZSwgdmFsdWUpIHtcbiAgd2FybignaGFzU3R5bGUoKSBoYXMgYmVlbiBkZXByZWNhdGVkIGFuZCB3aWxsIGJlIHJlbW92ZWQgaW4gdmVyc2lvbiAxLjAuMC4gVXNlIHdyYXBwZXIuZWxlbWVudC5zdHlsZSBpbnN0ZWFkJyk7XG5cbiAgaWYgKHR5cGVvZiBzdHlsZSAhPT0gJ3N0cmluZycpIHtcbiAgICB0aHJvd0Vycm9yKCd3cmFwcGVyLmhhc1N0eWxlKCkgbXVzdCBiZSBwYXNzZWQgc3R5bGUgYXMgYSBzdHJpbmcnKTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSB7XG4gICAgdGhyb3dFcnJvcignd3JhcHBlci5oYXNDbGFzcygpIG11c3QgYmUgcGFzc2VkIHZhbHVlIGFzIHN0cmluZycpO1xuICB9XG5cbiAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgaWYgKG5hdmlnYXRvci51c2VyQWdlbnQuaW5jbHVkZXMgJiYgKG5hdmlnYXRvci51c2VyQWdlbnQuaW5jbHVkZXMoJ25vZGUuanMnKSB8fCBuYXZpZ2F0b3IudXNlckFnZW50LmluY2x1ZGVzKCdqc2RvbScpKSkge1xuICAgIGNvbnNvbGUud2Fybignd3JhcHBlci5oYXNTdHlsZSBpcyBub3QgZnVsbHkgc3VwcG9ydGVkIHdoZW4gcnVubmluZyBqc2RvbSAtIG9ubHkgaW5saW5lIHN0eWxlcyBhcmUgc3VwcG9ydGVkJyk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29uc29sZVxuICB9XG4gIHZhciBib2R5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpO1xuICB2YXIgbW9ja0VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblxuICBpZiAoIShib2R5IGluc3RhbmNlb2YgRWxlbWVudCkpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuICB2YXIgbW9ja05vZGUgPSBib2R5Lmluc2VydEJlZm9yZShtb2NrRWxlbWVudCwgbnVsbCk7XG4gIC8vICRGbG93SWdub3JlIDogRmxvdyB0aGlua3Mgc3R5bGVbc3R5bGVdIHJldHVybnMgYSBudW1iZXJcbiAgbW9ja0VsZW1lbnQuc3R5bGVbc3R5bGVdID0gdmFsdWU7XG5cbiAgaWYgKCF0aGlzLm9wdGlvbnMuYXR0YWNoZWRUb0RvY3VtZW50ICYmICh0aGlzLnZtIHx8IHRoaXMudm5vZGUpKSB7XG4gICAgLy8gJEZsb3dJZ25vcmUgOiBQb3NzaWJsZSBudWxsIHZhbHVlLCB3aWxsIGJlIHJlbW92ZWQgaW4gMS4wLjBcbiAgICB2YXIgdm0gPSB0aGlzLnZtIHx8IHRoaXMudm5vZGUuY29udGV4dC4kcm9vdDtcbiAgICBib2R5Lmluc2VydEJlZm9yZSh2bS4kcm9vdC5fdm5vZGUuZWxtLCBudWxsKTtcbiAgfVxuXG4gIHZhciBlbFN0eWxlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUodGhpcy5lbGVtZW50KVtzdHlsZV07XG4gIHZhciBtb2NrTm9kZVN0eWxlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUobW9ja05vZGUpW3N0eWxlXTtcbiAgcmV0dXJuICEhKGVsU3R5bGUgJiYgbW9ja05vZGVTdHlsZSAmJiBlbFN0eWxlID09PSBtb2NrTm9kZVN0eWxlKVxufTtcblxuLyoqXG4gKiBGaW5kcyBmaXJzdCBub2RlIGluIHRyZWUgb2YgdGhlIGN1cnJlbnQgd3JhcHBlciB0aGF0IG1hdGNoZXMgdGhlIHByb3ZpZGVkIHNlbGVjdG9yLlxuICovXG5XcmFwcGVyLnByb3RvdHlwZS5maW5kID0gZnVuY3Rpb24gZmluZCQkMSAoc2VsZWN0b3IpIHtcbiAgdmFyIG5vZGVzID0gZmluZCh0aGlzLnZtLCB0aGlzLnZub2RlLCB0aGlzLmVsZW1lbnQsIHNlbGVjdG9yKTtcbiAgaWYgKG5vZGVzLmxlbmd0aCA9PT0gMCkge1xuICAgIGlmIChzZWxlY3Rvci5yZWYpIHtcbiAgICAgIHJldHVybiBuZXcgRXJyb3JXcmFwcGVyKChcInJlZj1cXFwiXCIgKyAoc2VsZWN0b3IucmVmKSArIFwiXFxcIlwiKSlcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBFcnJvcldyYXBwZXIodHlwZW9mIHNlbGVjdG9yID09PSAnc3RyaW5nJyA/IHNlbGVjdG9yIDogJ0NvbXBvbmVudCcpXG4gIH1cbiAgcmV0dXJuIGNyZWF0ZVdyYXBwZXIobm9kZXNbMF0sIHRoaXMub3B0aW9ucylcbn07XG5cbi8qKlxuICogRmluZHMgbm9kZSBpbiB0cmVlIG9mIHRoZSBjdXJyZW50IHdyYXBwZXIgdGhhdCBtYXRjaGVzIHRoZSBwcm92aWRlZCBzZWxlY3Rvci5cbiAqL1xuV3JhcHBlci5wcm90b3R5cGUuZmluZEFsbCA9IGZ1bmN0aW9uIGZpbmRBbGwkMSAoc2VsZWN0b3IpIHtcbiAgICB2YXIgdGhpcyQxID0gdGhpcztcblxuICBnZXRTZWxlY3RvclR5cGVPclRocm93KHNlbGVjdG9yLCAnZmluZEFsbCcpO1xuICB2YXIgbm9kZXMgPSBmaW5kKHRoaXMudm0sIHRoaXMudm5vZGUsIHRoaXMuZWxlbWVudCwgc2VsZWN0b3IpO1xuICB2YXIgd3JhcHBlcnMgPSBub2Rlcy5tYXAoZnVuY3Rpb24gKG5vZGUpIHsgcmV0dXJuIGNyZWF0ZVdyYXBwZXIobm9kZSwgdGhpcyQxLm9wdGlvbnMpOyB9XG4gICk7XG4gIHJldHVybiBuZXcgV3JhcHBlckFycmF5KHdyYXBwZXJzKVxufTtcblxuLyoqXG4gKiBSZXR1cm5zIEhUTUwgb2YgZWxlbWVudCBhcyBhIHN0cmluZ1xuICovXG5XcmFwcGVyLnByb3RvdHlwZS5odG1sID0gZnVuY3Rpb24gaHRtbCAoKSB7XG4gIHJldHVybiB0aGlzLmVsZW1lbnQub3V0ZXJIVE1MXG59O1xuXG4vKipcbiAqIENoZWNrcyBpZiBub2RlIG1hdGNoZXMgc2VsZWN0b3JcbiAqL1xuV3JhcHBlci5wcm90b3R5cGUuaXMgPSBmdW5jdGlvbiBpcyAoc2VsZWN0b3IpIHtcbiAgdmFyIHNlbGVjdG9yVHlwZSA9IGdldFNlbGVjdG9yVHlwZU9yVGhyb3coc2VsZWN0b3IsICdpcycpO1xuXG4gIGlmIChzZWxlY3RvclR5cGUgPT09IE5BTUVfU0VMRUNUT1IpIHtcbiAgICBpZiAoIXRoaXMudm0pIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgICByZXR1cm4gdm1DdG9yTWF0Y2hlc05hbWUodGhpcy52bSwgc2VsZWN0b3IubmFtZSlcbiAgfVxuXG4gIGlmIChzZWxlY3RvclR5cGUgPT09IENPTVBPTkVOVF9TRUxFQ1RPUikge1xuICAgIGlmICghdGhpcy52bSkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICAgIGlmIChzZWxlY3Rvci5mdW5jdGlvbmFsKSB7XG4gICAgICByZXR1cm4gdm1GdW5jdGlvbmFsQ3Rvck1hdGNoZXNTZWxlY3Rvcih0aGlzLnZtLl92bm9kZSwgc2VsZWN0b3IuX0N0b3IpXG4gICAgfVxuICAgIHJldHVybiB2bUN0b3JNYXRjaGVzU2VsZWN0b3IodGhpcy52bSwgc2VsZWN0b3IpXG4gIH1cblxuICBpZiAoc2VsZWN0b3JUeXBlID09PSBSRUZfU0VMRUNUT1IpIHtcbiAgICB0aHJvd0Vycm9yKCckcmVmIHNlbGVjdG9ycyBjYW4gbm90IGJlIHVzZWQgd2l0aCB3cmFwcGVyLmlzKCknKTtcbiAgfVxuXG4gIGlmICh0eXBlb2Ygc2VsZWN0b3IgPT09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICByZXR1cm4gISEodGhpcy5lbGVtZW50ICYmXG4gIHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUgJiZcbiAgdGhpcy5lbGVtZW50Lm1hdGNoZXMoc2VsZWN0b3IpKVxufTtcblxuLyoqXG4gKiBDaGVja3MgaWYgbm9kZSBpcyBlbXB0eVxuICovXG5XcmFwcGVyLnByb3RvdHlwZS5pc0VtcHR5ID0gZnVuY3Rpb24gaXNFbXB0eSAoKSB7XG4gIGlmICghdGhpcy52bm9kZSkge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnQuaW5uZXJIVE1MID09PSAnJ1xuICB9XG4gIGlmICh0aGlzLnZub2RlLmNoaWxkcmVuKSB7XG4gICAgcmV0dXJuIHRoaXMudm5vZGUuY2hpbGRyZW4uZXZlcnkoZnVuY3Rpb24gKHZub2RlKSB7IHJldHVybiB2bm9kZS5pc0NvbW1lbnQ7IH0pXG4gIH1cbiAgcmV0dXJuIHRoaXMudm5vZGUuY2hpbGRyZW4gPT09IHVuZGVmaW5lZCB8fCB0aGlzLnZub2RlLmNoaWxkcmVuLmxlbmd0aCA9PT0gMFxufTtcblxuLyoqXG4gKiBDaGVja3MgaWYgbm9kZSBpcyB2aXNpYmxlXG4gKi9cbldyYXBwZXIucHJvdG90eXBlLmlzVmlzaWJsZSA9IGZ1bmN0aW9uIGlzVmlzaWJsZSAoKSB7XG4gIHZhciBlbGVtZW50ID0gdGhpcy5lbGVtZW50O1xuXG4gIGlmICghZWxlbWVudCkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgd2hpbGUgKGVsZW1lbnQpIHtcbiAgICBpZiAoZWxlbWVudC5zdHlsZSAmJiAoZWxlbWVudC5zdHlsZS52aXNpYmlsaXR5ID09PSAnaGlkZGVuJyB8fCBlbGVtZW50LnN0eWxlLmRpc3BsYXkgPT09ICdub25lJykpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgICBlbGVtZW50ID0gZWxlbWVudC5wYXJlbnRFbGVtZW50O1xuICB9XG5cbiAgcmV0dXJuIHRydWVcbn07XG5cbi8qKlxuICogQ2hlY2tzIGlmIHdyYXBwZXIgaXMgYSB2dWUgaW5zdGFuY2VcbiAqL1xuV3JhcHBlci5wcm90b3R5cGUuaXNWdWVJbnN0YW5jZSA9IGZ1bmN0aW9uIGlzVnVlSW5zdGFuY2UgKCkge1xuICByZXR1cm4gISF0aGlzLmlzVnVlQ29tcG9uZW50XG59O1xuXG4vKipcbiAqIFJldHVybnMgbmFtZSBvZiBjb21wb25lbnQsIG9yIHRhZyBuYW1lIGlmIG5vZGUgaXMgbm90IGEgVnVlIGNvbXBvbmVudFxuICovXG5XcmFwcGVyLnByb3RvdHlwZS5uYW1lID0gZnVuY3Rpb24gbmFtZSAoKSB7XG4gIGlmICh0aGlzLnZtKSB7XG4gICAgcmV0dXJuIHRoaXMudm0uJG9wdGlvbnMubmFtZVxuICB9XG5cbiAgaWYgKCF0aGlzLnZub2RlKSB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudC50YWdOYW1lXG4gIH1cblxuICByZXR1cm4gdGhpcy52bm9kZS50YWdcbn07XG5cbi8qKlxuICogUmV0dXJucyBhbiBPYmplY3QgY29udGFpbmluZyB0aGUgcHJvcCBuYW1lL3ZhbHVlIHBhaXJzIG9uIHRoZSBlbGVtZW50XG4gKi9cbldyYXBwZXIucHJvdG90eXBlLnByb3BzID0gZnVuY3Rpb24gcHJvcHMgKCkge1xuICBpZiAodGhpcy5pc0Z1bmN0aW9uYWxDb21wb25lbnQpIHtcbiAgICB0aHJvd0Vycm9yKCd3cmFwcGVyLnByb3BzKCkgY2Fubm90IGJlIGNhbGxlZCBvbiBhIG1vdW50ZWQgZnVuY3Rpb25hbCBjb21wb25lbnQuJyk7XG4gIH1cbiAgaWYgKCF0aGlzLnZtKSB7XG4gICAgdGhyb3dFcnJvcignd3JhcHBlci5wcm9wcygpIG11c3QgYmUgY2FsbGVkIG9uIGEgVnVlIGluc3RhbmNlJyk7XG4gIH1cbiAgLy8gJHByb3BzIG9iamVjdCBkb2VzIG5vdCBleGlzdCBpbiBWdWUgMi4xLngsIHNvIHVzZSAkb3B0aW9ucy5wcm9wc0RhdGEgaW5zdGVhZFxuICB2YXIgX3Byb3BzO1xuICBpZiAodGhpcy52bSAmJiB0aGlzLnZtLiRvcHRpb25zICYmIHRoaXMudm0uJG9wdGlvbnMucHJvcHNEYXRhKSB7XG4gICAgX3Byb3BzID0gdGhpcy52bS4kb3B0aW9ucy5wcm9wc0RhdGE7XG4gIH0gZWxzZSB7XG4gICAgLy8gJEZsb3dJZ25vcmVcbiAgICBfcHJvcHMgPSB0aGlzLnZtLiRwcm9wcztcbiAgfVxuICByZXR1cm4gX3Byb3BzIHx8IHt9IC8vIFJldHVybiBhbiBlbXB0eSBvYmplY3QgaWYgbm8gcHJvcHMgZXhpc3Rcbn07XG5cbi8qKlxuICogU2V0cyB2bSBkYXRhXG4gKi9cbldyYXBwZXIucHJvdG90eXBlLnNldERhdGEgPSBmdW5jdGlvbiBzZXREYXRhIChkYXRhKSB7XG4gICAgdmFyIHRoaXMkMSA9IHRoaXM7XG5cbiAgaWYgKHRoaXMuaXNGdW5jdGlvbmFsQ29tcG9uZW50KSB7XG4gICAgdGhyb3dFcnJvcignd3JhcHBlci5zZXREYXRhKCkgY2Fub3QgYmUgY2FsbGVkIG9uIGEgZnVuY3Rpb25hbCBjb21wb25lbnQnKTtcbiAgfVxuXG4gIGlmICghdGhpcy52bSkge1xuICAgIHRocm93RXJyb3IoJ3dyYXBwZXIuc2V0RGF0YSgpIGNhbiBvbmx5IGJlIGNhbGxlZCBvbiBhIFZ1ZSBpbnN0YW5jZScpO1xuICB9XG5cbiAgT2JqZWN0LmtleXMoZGF0YSkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgLy8gJEZsb3dJZ25vcmUgOiBQcm9ibGVtIHdpdGggcG9zc2libHkgbnVsbCB0aGlzLnZtXG4gICAgdGhpcyQxLnZtLiRzZXQodGhpcyQxLnZtLCBba2V5XSwgZGF0YVtrZXldKTtcbiAgfSk7XG59O1xuXG4vKipcbiAqIFNldHMgdm0gY29tcHV0ZWRcbiAqL1xuV3JhcHBlci5wcm90b3R5cGUuc2V0Q29tcHV0ZWQgPSBmdW5jdGlvbiBzZXRDb21wdXRlZCAoY29tcHV0ZWQpIHtcbiAgICB2YXIgdGhpcyQxID0gdGhpcztcblxuICBpZiAoIXRoaXMuaXNWdWVDb21wb25lbnQpIHtcbiAgICB0aHJvd0Vycm9yKCd3cmFwcGVyLnNldENvbXB1dGVkKCkgY2FuIG9ubHkgYmUgY2FsbGVkIG9uIGEgVnVlIGluc3RhbmNlJyk7XG4gIH1cblxuICB3YXJuKCdzZXRDb21wdXRlZCgpIGhhcyBiZWVuIGRlcHJlY2F0ZWQgYW5kIHdpbGwgYmUgcmVtb3ZlZCBpbiB2ZXJzaW9uIDEuMC4wLiBZb3UgY2FuIG92ZXJ3cml0ZSBjb21wdXRlZCBwcm9wZXJ0aWVzIGJ5IHBhc3NpbmcgYSBjb21wdXRlZCBvYmplY3QgaW4gdGhlIG1vdW50aW5nIG9wdGlvbnMnKTtcblxuICBPYmplY3Qua2V5cyhjb21wdXRlZCkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgaWYgKHRoaXMkMS52ZXJzaW9uID4gMi4xKSB7XG4gICAgICAvLyAkRmxvd0lnbm9yZSA6IFByb2JsZW0gd2l0aCBwb3NzaWJseSBudWxsIHRoaXMudm1cbiAgICAgIGlmICghdGhpcyQxLnZtLl9jb21wdXRlZFdhdGNoZXJzW2tleV0pIHtcbiAgICAgICAgdGhyb3dFcnJvcigoXCJ3cmFwcGVyLnNldENvbXB1dGVkKCkgd2FzIHBhc3NlZCBhIHZhbHVlIHRoYXQgZG9lcyBub3QgZXhpc3QgYXMgYSBjb21wdXRlZCBwcm9wZXJ0eSBvbiB0aGUgVnVlIGluc3RhbmNlLiBQcm9wZXJ0eSBcIiArIGtleSArIFwiIGRvZXMgbm90IGV4aXN0IG9uIHRoZSBWdWUgaW5zdGFuY2VcIikpO1xuICAgICAgfVxuICAgICAgLy8gJEZsb3dJZ25vcmUgOiBQcm9ibGVtIHdpdGggcG9zc2libHkgbnVsbCB0aGlzLnZtXG4gICAgICB0aGlzJDEudm0uX2NvbXB1dGVkV2F0Y2hlcnNba2V5XS52YWx1ZSA9IGNvbXB1dGVkW2tleV07XG4gICAgICAvLyAkRmxvd0lnbm9yZSA6IFByb2JsZW0gd2l0aCBwb3NzaWJseSBudWxsIHRoaXMudm1cbiAgICAgIHRoaXMkMS52bS5fY29tcHV0ZWRXYXRjaGVyc1trZXldLmdldHRlciA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIGNvbXB1dGVkW2tleV07IH07XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBpc1N0b3JlID0gZmFsc2U7XG4gICAgICAvLyAkRmxvd0lnbm9yZSA6IFByb2JsZW0gd2l0aCBwb3NzaWJseSBudWxsIHRoaXMudm1cbiAgICAgIHRoaXMkMS52bS5fd2F0Y2hlcnMuZm9yRWFjaChmdW5jdGlvbiAod2F0Y2hlcikge1xuICAgICAgICBpZiAod2F0Y2hlci5nZXR0ZXIudnVleCAmJiBrZXkgaW4gd2F0Y2hlci52bS4kb3B0aW9ucy5zdG9yZS5nZXR0ZXJzKSB7XG4gICAgICAgICAgd2F0Y2hlci52bS4kb3B0aW9ucy5zdG9yZS5nZXR0ZXJzID0gT2JqZWN0LmFzc2lnbih7fSwgd2F0Y2hlci52bS4kb3B0aW9ucy5zdG9yZS5nZXR0ZXJzKTtcbiAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkod2F0Y2hlci52bS4kb3B0aW9ucy5zdG9yZS5nZXR0ZXJzLCBrZXksIHsgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiBjb21wdXRlZFtrZXldIH0gfSk7XG4gICAgICAgICAgaXNTdG9yZSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyAkRmxvd0lnbm9yZSA6IFByb2JsZW0gd2l0aCBwb3NzaWJseSBudWxsIHRoaXMudm1cbiAgICAgIGlmICghaXNTdG9yZSAmJiAhdGhpcyQxLnZtLl93YXRjaGVycy5zb21lKGZ1bmN0aW9uICh3KSB7IHJldHVybiB3LmdldHRlci5uYW1lID09PSBrZXk7IH0pKSB7XG4gICAgICAgIHRocm93RXJyb3IoKFwid3JhcHBlci5zZXRDb21wdXRlZCgpIHdhcyBwYXNzZWQgYSB2YWx1ZSB0aGF0IGRvZXMgbm90IGV4aXN0IGFzIGEgY29tcHV0ZWQgcHJvcGVydHkgb24gdGhlIFZ1ZSBpbnN0YW5jZS4gUHJvcGVydHkgXCIgKyBrZXkgKyBcIiBkb2VzIG5vdCBleGlzdCBvbiB0aGUgVnVlIGluc3RhbmNlXCIpKTtcbiAgICAgIH1cbiAgICAgIC8vICRGbG93SWdub3JlIDogUHJvYmxlbSB3aXRoIHBvc3NpYmx5IG51bGwgdGhpcy52bVxuICAgICAgdGhpcyQxLnZtLl93YXRjaGVycy5mb3JFYWNoKGZ1bmN0aW9uICh3YXRjaGVyKSB7XG4gICAgICAgIGlmICh3YXRjaGVyLmdldHRlci5uYW1lID09PSBrZXkpIHtcbiAgICAgICAgICB3YXRjaGVyLnZhbHVlID0gY29tcHV0ZWRba2V5XTtcbiAgICAgICAgICB3YXRjaGVyLmdldHRlciA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIGNvbXB1dGVkW2tleV07IH07XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG4gIC8vICRGbG93SWdub3JlIDogUHJvYmxlbSB3aXRoIHBvc3NpYmx5IG51bGwgdGhpcy52bVxuICB0aGlzLnZtLl93YXRjaGVycy5mb3JFYWNoKGZ1bmN0aW9uICh3YXRjaGVyKSB7XG4gICAgd2F0Y2hlci5ydW4oKTtcbiAgfSk7XG59O1xuXG4vKipcbiAqIFNldHMgdm0gbWV0aG9kc1xuICovXG5XcmFwcGVyLnByb3RvdHlwZS5zZXRNZXRob2RzID0gZnVuY3Rpb24gc2V0TWV0aG9kcyAobWV0aG9kcykge1xuICAgIHZhciB0aGlzJDEgPSB0aGlzO1xuXG4gIGlmICghdGhpcy5pc1Z1ZUNvbXBvbmVudCkge1xuICAgIHRocm93RXJyb3IoJ3dyYXBwZXIuc2V0TWV0aG9kcygpIGNhbiBvbmx5IGJlIGNhbGxlZCBvbiBhIFZ1ZSBpbnN0YW5jZScpO1xuICB9XG4gIE9iamVjdC5rZXlzKG1ldGhvZHMpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgIC8vICRGbG93SWdub3JlIDogUHJvYmxlbSB3aXRoIHBvc3NpYmx5IG51bGwgdGhpcy52bVxuICAgIHRoaXMkMS52bVtrZXldID0gbWV0aG9kc1trZXldO1xuICAgIC8vICRGbG93SWdub3JlIDogUHJvYmxlbSB3aXRoIHBvc3NpYmx5IG51bGwgdGhpcy52bVxuICAgIHRoaXMkMS52bS4kb3B0aW9ucy5tZXRob2RzW2tleV0gPSBtZXRob2RzW2tleV07XG4gIH0pO1xufTtcblxuLyoqXG4gKiBTZXRzIHZtIHByb3BzXG4gKi9cbldyYXBwZXIucHJvdG90eXBlLnNldFByb3BzID0gZnVuY3Rpb24gc2V0UHJvcHMgKGRhdGEpIHtcbiAgICB2YXIgdGhpcyQxID0gdGhpcztcblxuICBpZiAodGhpcy5pc0Z1bmN0aW9uYWxDb21wb25lbnQpIHtcbiAgICB0aHJvd0Vycm9yKCd3cmFwcGVyLnNldFByb3BzKCkgY2Fub3QgYmUgY2FsbGVkIG9uIGEgZnVuY3Rpb25hbCBjb21wb25lbnQnKTtcbiAgfVxuICBpZiAoIXRoaXMuaXNWdWVDb21wb25lbnQgfHwgIXRoaXMudm0pIHtcbiAgICB0aHJvd0Vycm9yKCd3cmFwcGVyLnNldFByb3BzKCkgY2FuIG9ubHkgYmUgY2FsbGVkIG9uIGEgVnVlIGluc3RhbmNlJyk7XG4gIH1cbiAgaWYgKHRoaXMudm0gJiYgdGhpcy52bS4kb3B0aW9ucyAmJiAhdGhpcy52bS4kb3B0aW9ucy5wcm9wc0RhdGEpIHtcbiAgICB0aGlzLnZtLiRvcHRpb25zLnByb3BzRGF0YSA9IHt9O1xuICB9XG4gIE9iamVjdC5rZXlzKGRhdGEpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgIC8vIElnbm9yZSBwcm9wZXJ0aWVzIHRoYXQgd2VyZSBub3Qgc3BlY2lmaWVkIGluIHRoZSBjb21wb25lbnQgb3B0aW9uc1xuICAgIC8vICRGbG93SWdub3JlIDogUHJvYmxlbSB3aXRoIHBvc3NpYmx5IG51bGwgdGhpcy52bVxuICAgIGlmICghdGhpcyQxLnZtLiRvcHRpb25zLl9wcm9wS2V5cyB8fCAhdGhpcyQxLnZtLiRvcHRpb25zLl9wcm9wS2V5cy5pbmNsdWRlcyhrZXkpKSB7XG4gICAgICB0aHJvd0Vycm9yKChcIndyYXBwZXIuc2V0UHJvcHMoKSBjYWxsZWQgd2l0aCBcIiArIGtleSArIFwiIHByb3BlcnR5IHdoaWNoIGlzIG5vdCBkZWZpbmVkIG9uIGNvbXBvbmVudFwiKSk7XG4gICAgfVxuXG4gICAgLy8gJEZsb3dJZ25vcmUgOiBQcm9ibGVtIHdpdGggcG9zc2libHkgbnVsbCB0aGlzLnZtXG4gICAgaWYgKHRoaXMkMS52bS5fcHJvcHMpIHtcbiAgICAgIHRoaXMkMS52bS5fcHJvcHNba2V5XSA9IGRhdGFba2V5XTtcbiAgICAgIC8vICRGbG93SWdub3JlIDogUHJvYmxlbSB3aXRoIHBvc3NpYmx5IG51bGwgdGhpcy52bS4kcHJvcHNcbiAgICAgIHRoaXMkMS52bS4kcHJvcHNba2V5XSA9IGRhdGFba2V5XTtcbiAgICAgIC8vICRGbG93SWdub3JlIDogUHJvYmxlbSB3aXRoIHBvc3NpYmx5IG51bGwgdGhpcy52bS4kb3B0aW9uc1xuICAgICAgdGhpcyQxLnZtLiRvcHRpb25zLnByb3BzRGF0YVtrZXldID0gZGF0YVtrZXldO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyAkRmxvd0lnbm9yZSA6IFByb2JsZW0gd2l0aCBwb3NzaWJseSBudWxsIHRoaXMudm1cbiAgICAgIHRoaXMkMS52bVtrZXldID0gZGF0YVtrZXldO1xuICAgICAgLy8gJEZsb3dJZ25vcmUgOiBQcm9ibGVtIHdpdGggcG9zc2libHkgbnVsbCB0aGlzLnZtLiRvcHRpb25zXG4gICAgICB0aGlzJDEudm0uJG9wdGlvbnMucHJvcHNEYXRhW2tleV0gPSBkYXRhW2tleV07XG4gICAgfVxuICB9KTtcblxuICAvLyAkRmxvd0lnbm9yZSA6IFByb2JsZW0gd2l0aCBwb3NzaWJseSBudWxsIHRoaXMudm1cbiAgdGhpcy52bm9kZSA9IHRoaXMudm0uX3Zub2RlO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gdGV4dCBvZiB3cmFwcGVyIGVsZW1lbnRcbiAqL1xuV3JhcHBlci5wcm90b3R5cGUudGV4dCA9IGZ1bmN0aW9uIHRleHQgKCkge1xuICBpZiAoIXRoaXMuZWxlbWVudCkge1xuICAgIHRocm93RXJyb3IoJ2Nhbm5vdCBjYWxsIHdyYXBwZXIudGV4dCgpIG9uIGEgd3JhcHBlciB3aXRob3V0IGFuIGVsZW1lbnQnKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzLmVsZW1lbnQudGV4dENvbnRlbnQudHJpbSgpXG59O1xuXG4vKipcbiAqIENhbGxzIGRlc3Ryb3kgb24gdm1cbiAqL1xuV3JhcHBlci5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uIGRlc3Ryb3kgKCkge1xuICBpZiAoIXRoaXMuaXNWdWVDb21wb25lbnQpIHtcbiAgICB0aHJvd0Vycm9yKCd3cmFwcGVyLmRlc3Ryb3koKSBjYW4gb25seSBiZSBjYWxsZWQgb24gYSBWdWUgaW5zdGFuY2UnKTtcbiAgfVxuXG4gIGlmICh0aGlzLmVsZW1lbnQucGFyZW50Tm9kZSkge1xuICAgIHRoaXMuZWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuZWxlbWVudCk7XG4gIH1cbiAgLy8gJEZsb3dJZ25vcmVcbiAgdGhpcy52bS4kZGVzdHJveSgpO1xufTtcblxuLyoqXG4gKiBEaXNwYXRjaGVzIGEgRE9NIGV2ZW50IG9uIHdyYXBwZXJcbiAqL1xuV3JhcHBlci5wcm90b3R5cGUudHJpZ2dlciA9IGZ1bmN0aW9uIHRyaWdnZXIgKHR5cGUsIG9wdGlvbnMpIHtcbiAgICBpZiAoIG9wdGlvbnMgPT09IHZvaWQgMCApIG9wdGlvbnMgPSB7fTtcblxuICBpZiAodHlwZW9mIHR5cGUgIT09ICdzdHJpbmcnKSB7XG4gICAgdGhyb3dFcnJvcignd3JhcHBlci50cmlnZ2VyKCkgbXVzdCBiZSBwYXNzZWQgYSBzdHJpbmcnKTtcbiAgfVxuXG4gIGlmICghdGhpcy5lbGVtZW50KSB7XG4gICAgdGhyb3dFcnJvcignY2Fubm90IGNhbGwgd3JhcHBlci50cmlnZ2VyKCkgb24gYSB3cmFwcGVyIHdpdGhvdXQgYW4gZWxlbWVudCcpO1xuICB9XG5cbiAgaWYgKG9wdGlvbnMudGFyZ2V0KSB7XG4gICAgdGhyb3dFcnJvcigneW91IGNhbm5vdCBzZXQgdGhlIHRhcmdldCB2YWx1ZSBvZiBhbiBldmVudC4gU2VlIHRoZSBub3RlcyBzZWN0aW9uIG9mIHRoZSBkb2NzIGZvciBtb3JlIGRldGFpbHPigJRodHRwczovL3Z1ZS10ZXN0LXV0aWxzLnZ1ZWpzLm9yZy9lbi9hcGkvd3JhcHBlci90cmlnZ2VyLmh0bWwnKTtcbiAgfVxuXG4gIC8vIERvbid0IGZpcmUgZXZlbnQgb24gYSBkaXNhYmxlZCBlbGVtZW50XG4gIGlmICh0aGlzLmF0dHJpYnV0ZXMoKS5kaXNhYmxlZCkge1xuICAgIHJldHVyblxuICB9XG5cbiAgdmFyIG1vZGlmaWVycyA9IHtcbiAgICBlbnRlcjogMTMsXG4gICAgdGFiOiA5LFxuICAgIGRlbGV0ZTogNDYsXG4gICAgZXNjOiAyNyxcbiAgICBzcGFjZTogMzIsXG4gICAgdXA6IDM4LFxuICAgIGRvd246IDQwLFxuICAgIGxlZnQ6IDM3LFxuICAgIHJpZ2h0OiAzOSxcbiAgICBlbmQ6IDM1LFxuICAgIGhvbWU6IDM2LFxuICAgIGJhY2tzcGFjZTogOCxcbiAgICBpbnNlcnQ6IDQ1LFxuICAgIHBhZ2V1cDogMzMsXG4gICAgcGFnZWRvd246IDM0XG4gIH07XG5cbiAgdmFyIGV2ZW50ID0gdHlwZS5zcGxpdCgnLicpO1xuXG4gIHZhciBldmVudE9iamVjdDtcblxuICAvLyBGYWxsYmFjayBmb3IgSUUxMCwxMSAtIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzI2NTk2MTIzXG4gIGlmICh0eXBlb2YgKHdpbmRvdy5FdmVudCkgPT09ICdmdW5jdGlvbicpIHtcbiAgICBldmVudE9iamVjdCA9IG5ldyB3aW5kb3cuRXZlbnQoZXZlbnRbMF0sIHtcbiAgICAgIGJ1YmJsZXM6IHRydWUsXG4gICAgICBjYW5jZWxhYmxlOiB0cnVlXG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgZXZlbnRPYmplY3QgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnRXZlbnQnKTtcbiAgICBldmVudE9iamVjdC5pbml0RXZlbnQoZXZlbnRbMF0sIHRydWUsIHRydWUpO1xuICB9XG5cbiAgaWYgKG9wdGlvbnMpIHtcbiAgICBPYmplY3Qua2V5cyhvcHRpb25zKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIC8vICRGbG93SWdub3JlXG4gICAgICBldmVudE9iamVjdFtrZXldID0gb3B0aW9uc1trZXldO1xuICAgIH0pO1xuICB9XG5cbiAgaWYgKGV2ZW50Lmxlbmd0aCA9PT0gMikge1xuICAgIC8vICRGbG93SWdub3JlXG4gICAgZXZlbnRPYmplY3Qua2V5Q29kZSA9IG1vZGlmaWVyc1tldmVudFsxXV07XG4gIH1cblxuICB0aGlzLmVsZW1lbnQuZGlzcGF0Y2hFdmVudChldmVudE9iamVjdCk7XG4gIGlmICh0aGlzLnZub2RlKSB7XG4gICAgb3JkZXJXYXRjaGVycyh0aGlzLnZtIHx8IHRoaXMudm5vZGUuY29udGV4dC4kcm9vdCk7XG4gIH1cbn07XG5cbldyYXBwZXIucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uIHVwZGF0ZSAoKSB7XG4gIHdhcm4oJ3VwZGF0ZSBoYXMgYmVlbiByZW1vdmVkIGZyb20gdnVlLXRlc3QtdXRpbHMuIEFsbCB1cGRhdGVzIGFyZSBub3cgc3luY2hyb25vdXMgYnkgZGVmYXVsdCcpO1xufTtcblxuZnVuY3Rpb24gc2V0RGVwc1N5bmMgKGRlcCkge1xuICBkZXAuc3Vicy5mb3JFYWNoKHNldFdhdGNoZXJTeW5jKTtcbn1cblxuZnVuY3Rpb24gc2V0V2F0Y2hlclN5bmMgKHdhdGNoZXIpIHtcbiAgaWYgKHdhdGNoZXIuc3luYyA9PT0gdHJ1ZSkge1xuICAgIHJldHVyblxuICB9XG4gIHdhdGNoZXIuc3luYyA9IHRydWU7XG4gIHdhdGNoZXIuZGVwcy5mb3JFYWNoKHNldERlcHNTeW5jKTtcbn1cblxuZnVuY3Rpb24gc2V0V2F0Y2hlcnNUb1N5bmMgKHZtKSB7XG4gIGlmICh2bS5fd2F0Y2hlcnMpIHtcbiAgICB2bS5fd2F0Y2hlcnMuZm9yRWFjaChzZXRXYXRjaGVyU3luYyk7XG4gIH1cblxuICBpZiAodm0uX2NvbXB1dGVkV2F0Y2hlcnMpIHtcbiAgICBPYmplY3Qua2V5cyh2bS5fY29tcHV0ZWRXYXRjaGVycykuZm9yRWFjaChmdW5jdGlvbiAoY29tcHV0ZWRXYXRjaGVyKSB7XG4gICAgICBzZXRXYXRjaGVyU3luYyh2bS5fY29tcHV0ZWRXYXRjaGVyc1tjb21wdXRlZFdhdGNoZXJdKTtcbiAgICB9KTtcbiAgfVxuXG4gIHNldFdhdGNoZXJTeW5jKHZtLl93YXRjaGVyKTtcblxuICB2bS4kY2hpbGRyZW4uZm9yRWFjaChzZXRXYXRjaGVyc1RvU3luYyk7XG59XG5cbi8vIFxuXG52YXIgVnVlV3JhcHBlciA9IChmdW5jdGlvbiAoV3JhcHBlciQkMSkge1xuICBmdW5jdGlvbiBWdWVXcmFwcGVyICh2bSwgb3B0aW9ucykge1xuICAgIFdyYXBwZXIkJDEuY2FsbCh0aGlzLCB2bS5fdm5vZGUsIG9wdGlvbnMpO1xuXG4gICAgLy8gJEZsb3dJZ25vcmUgOiBpc3N1ZSB3aXRoIGRlZmluZVByb3BlcnR5IC0gaHR0cHM6Ly9naXRodWIuY29tL2ZhY2Vib29rL2Zsb3cvaXNzdWVzLzI4NVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAndm5vZGUnLCAoe1xuICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiB2bS5fdm5vZGU7IH0sXG4gICAgICBzZXQ6IGZ1bmN0aW9uICgpIHt9XG4gICAgfSkpO1xuICAgIC8vICRGbG93SWdub3JlXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdlbGVtZW50JywgKHtcbiAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gdm0uJGVsOyB9LFxuICAgICAgc2V0OiBmdW5jdGlvbiAoKSB7fVxuICAgIH0pKTtcbiAgICB0aGlzLnZtID0gdm07XG4gICAgaWYgKG9wdGlvbnMuc3luYykge1xuICAgICAgc2V0V2F0Y2hlcnNUb1N5bmModm0pO1xuICAgICAgb3JkZXJXYXRjaGVycyh2bSk7XG4gICAgfVxuICAgIHRoaXMuaXNWdWVDb21wb25lbnQgPSB0cnVlO1xuICAgIHRoaXMuaXNGdW5jdGlvbmFsQ29tcG9uZW50ID0gdm0uJG9wdGlvbnMuX2lzRnVuY3Rpb25hbENvbnRhaW5lcjtcbiAgICB0aGlzLl9lbWl0dGVkID0gdm0uX19lbWl0dGVkO1xuICAgIHRoaXMuX2VtaXR0ZWRCeU9yZGVyID0gdm0uX19lbWl0dGVkQnlPcmRlcjtcbiAgfVxuXG4gIGlmICggV3JhcHBlciQkMSApIFZ1ZVdyYXBwZXIuX19wcm90b19fID0gV3JhcHBlciQkMTtcbiAgVnVlV3JhcHBlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBXcmFwcGVyJCQxICYmIFdyYXBwZXIkJDEucHJvdG90eXBlICk7XG4gIFZ1ZVdyYXBwZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gVnVlV3JhcHBlcjtcblxuICByZXR1cm4gVnVlV3JhcHBlcjtcbn0oV3JhcHBlcikpO1xuXG4vLyBcblxuZnVuY3Rpb24gaXNWYWxpZFNsb3QgKHNsb3QpIHtcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkoc2xvdCkgfHwgKHNsb3QgIT09IG51bGwgJiYgdHlwZW9mIHNsb3QgPT09ICdvYmplY3QnKSB8fCB0eXBlb2Ygc2xvdCA9PT0gJ3N0cmluZydcbn1cblxuZnVuY3Rpb24gdmFsaWRhdGVTbG90cyAoc2xvdHMpIHtcbiAgc2xvdHMgJiYgT2JqZWN0LmtleXMoc2xvdHMpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgIGlmICghaXNWYWxpZFNsb3Qoc2xvdHNba2V5XSkpIHtcbiAgICAgIHRocm93RXJyb3IoJ3Nsb3RzW2tleV0gbXVzdCBiZSBhIENvbXBvbmVudCwgc3RyaW5nIG9yIGFuIGFycmF5IG9mIENvbXBvbmVudHMnKTtcbiAgICB9XG5cbiAgICBpZiAoQXJyYXkuaXNBcnJheShzbG90c1trZXldKSkge1xuICAgICAgc2xvdHNba2V5XS5mb3JFYWNoKGZ1bmN0aW9uIChzbG90VmFsdWUpIHtcbiAgICAgICAgaWYgKCFpc1ZhbGlkU2xvdChzbG90VmFsdWUpKSB7XG4gICAgICAgICAgdGhyb3dFcnJvcignc2xvdHNba2V5XSBtdXN0IGJlIGEgQ29tcG9uZW50LCBzdHJpbmcgb3IgYW4gYXJyYXkgb2YgQ29tcG9uZW50cycpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xufVxuXG4vLyBcblxuZnVuY3Rpb24gYWRkU2xvdFRvVm0gKHZtLCBzbG90TmFtZSwgc2xvdFZhbHVlKSB7XG4gIHZhciBlbGVtO1xuICBpZiAodHlwZW9mIHNsb3RWYWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICBpZiAoIXZ1ZVRlbXBsYXRlQ29tcGlsZXIuY29tcGlsZVRvRnVuY3Rpb25zKSB7XG4gICAgICB0aHJvd0Vycm9yKCd2dWVUZW1wbGF0ZUNvbXBpbGVyIGlzIHVuZGVmaW5lZCwgeW91IG11c3QgcGFzcyBjb21wb25lbnRzIGV4cGxpY2l0bHkgaWYgdnVlLXRlbXBsYXRlLWNvbXBpbGVyIGlzIHVuZGVmaW5lZCcpO1xuICAgIH1cbiAgICBpZiAod2luZG93Lm5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL1BoYW50b21KUy9pKSkge1xuICAgICAgdGhyb3dFcnJvcigndGhlIHNsb3RzIG9wdGlvbiBkb2VzIG5vdCBzdXBwb3J0IHN0cmluZ3MgaW4gUGhhbnRvbUpTLiBQbGVhc2UgdXNlIFB1cHBldGVlciwgb3IgcGFzcyBhIGNvbXBvbmVudC4nKTtcbiAgICB9XG4gICAgdmFyIGRvbVBhcnNlciA9IG5ldyB3aW5kb3cuRE9NUGFyc2VyKCk7XG4gICAgdmFyIF9kb2N1bWVudCA9IGRvbVBhcnNlci5wYXJzZUZyb21TdHJpbmcoc2xvdFZhbHVlLCAndGV4dC9odG1sJyk7XG4gICAgdmFyIF9zbG90VmFsdWUgPSBzbG90VmFsdWUudHJpbSgpO1xuICAgIGlmIChfc2xvdFZhbHVlWzBdID09PSAnPCcgJiYgX3Nsb3RWYWx1ZVtfc2xvdFZhbHVlLmxlbmd0aCAtIDFdID09PSAnPicgJiYgX2RvY3VtZW50LmJvZHkuY2hpbGRFbGVtZW50Q291bnQgPT09IDEpIHtcbiAgICAgIGVsZW0gPSB2bS4kY3JlYXRlRWxlbWVudCh2dWVUZW1wbGF0ZUNvbXBpbGVyLmNvbXBpbGVUb0Z1bmN0aW9ucyhzbG90VmFsdWUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGNvbXBpbGVkUmVzdWx0ID0gdnVlVGVtcGxhdGVDb21waWxlci5jb21waWxlVG9GdW5jdGlvbnMoKFwiPGRpdj5cIiArIHNsb3RWYWx1ZSArIFwie3sgfX08L2Rpdj5cIikpO1xuICAgICAgdmFyIF9zdGF0aWNSZW5kZXJGbnMgPSB2bS5fcmVuZGVyUHJveHkuJG9wdGlvbnMuc3RhdGljUmVuZGVyRm5zO1xuICAgICAgdm0uX3JlbmRlclByb3h5LiRvcHRpb25zLnN0YXRpY1JlbmRlckZucyA9IGNvbXBpbGVkUmVzdWx0LnN0YXRpY1JlbmRlckZucztcbiAgICAgIGVsZW0gPSBjb21waWxlZFJlc3VsdC5yZW5kZXIuY2FsbCh2bS5fcmVuZGVyUHJveHksIHZtLiRjcmVhdGVFbGVtZW50KS5jaGlsZHJlbjtcbiAgICAgIHZtLl9yZW5kZXJQcm94eS4kb3B0aW9ucy5zdGF0aWNSZW5kZXJGbnMgPSBfc3RhdGljUmVuZGVyRm5zO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBlbGVtID0gdm0uJGNyZWF0ZUVsZW1lbnQoc2xvdFZhbHVlKTtcbiAgfVxuICBpZiAoQXJyYXkuaXNBcnJheShlbGVtKSkge1xuICAgIGlmIChBcnJheS5pc0FycmF5KHZtLiRzbG90c1tzbG90TmFtZV0pKSB7XG4gICAgICB2bS4kc2xvdHNbc2xvdE5hbWVdID0gdm0uJHNsb3RzW3Nsb3ROYW1lXS5jb25jYXQoIGVsZW0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB2bS4kc2xvdHNbc2xvdE5hbWVdID0gW10uY29uY2F0KCBlbGVtICk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmIChBcnJheS5pc0FycmF5KHZtLiRzbG90c1tzbG90TmFtZV0pKSB7XG4gICAgICB2bS4kc2xvdHNbc2xvdE5hbWVdLnB1c2goZWxlbSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZtLiRzbG90c1tzbG90TmFtZV0gPSBbZWxlbV07XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGFkZFNsb3RzICh2bSwgc2xvdHMpIHtcbiAgdmFsaWRhdGVTbG90cyhzbG90cyk7XG4gIE9iamVjdC5rZXlzKHNsb3RzKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShzbG90c1trZXldKSkge1xuICAgICAgc2xvdHNba2V5XS5mb3JFYWNoKGZ1bmN0aW9uIChzbG90VmFsdWUpIHtcbiAgICAgICAgYWRkU2xvdFRvVm0odm0sIGtleSwgc2xvdFZhbHVlKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBhZGRTbG90VG9WbSh2bSwga2V5LCBzbG90c1trZXldKTtcbiAgICB9XG4gIH0pO1xufVxuXG4vLyBcblxuZnVuY3Rpb24gYWRkU2NvcGVkU2xvdHMgKHZtLCBzY29wZWRTbG90cykge1xuICBPYmplY3Qua2V5cyhzY29wZWRTbG90cykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgdmFyIHRlbXBsYXRlID0gc2NvcGVkU2xvdHNba2V5XS50cmltKCk7XG4gICAgaWYgKHRlbXBsYXRlLnN1YnN0cigwLCA5KSA9PT0gJzx0ZW1wbGF0ZScpIHtcbiAgICAgIHRocm93RXJyb3IoJ3RoZSBzY29wZWRTbG90cyBvcHRpb24gZG9lcyBub3Qgc3VwcG9ydCBhIHRlbXBsYXRlIHRhZyBhcyB0aGUgcm9vdCBlbGVtZW50LicpO1xuICAgIH1cbiAgICB2YXIgZG9tUGFyc2VyID0gbmV3IHdpbmRvdy5ET01QYXJzZXIoKTtcbiAgICB2YXIgX2RvY3VtZW50ID0gZG9tUGFyc2VyLnBhcnNlRnJvbVN0cmluZyh0ZW1wbGF0ZSwgJ3RleHQvaHRtbCcpO1xuICAgIHZtLiRfdnVlVGVzdFV0aWxzX3Njb3BlZFNsb3RzW2tleV0gPSB2dWVUZW1wbGF0ZUNvbXBpbGVyLmNvbXBpbGVUb0Z1bmN0aW9ucyh0ZW1wbGF0ZSkucmVuZGVyO1xuICAgIHZtLiRfdnVlVGVzdFV0aWxzX3Nsb3RTY29wZXNba2V5XSA9IF9kb2N1bWVudC5ib2R5LmZpcnN0Q2hpbGQuZ2V0QXR0cmlidXRlKCdzbG90LXNjb3BlJyk7XG4gIH0pO1xufVxuXG4vLyBcblxuZnVuY3Rpb24gYWRkTW9ja3MgKG1vY2tlZFByb3BlcnRpZXMsIFZ1ZSQkMSkge1xuICBPYmplY3Qua2V5cyhtb2NrZWRQcm9wZXJ0aWVzKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICB0cnkge1xuICAgICAgVnVlJCQxLnByb3RvdHlwZVtrZXldID0gbW9ja2VkUHJvcGVydGllc1trZXldO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHdhcm4oKFwiY291bGQgbm90IG92ZXJ3cml0ZSBwcm9wZXJ0eSBcIiArIGtleSArIFwiLCB0aGlzIHVzdWFsbHkgY2F1c2VkIGJ5IGEgcGx1Z2luIHRoYXQgaGFzIGFkZGVkIHRoZSBwcm9wZXJ0eSBhcyBhIHJlYWQtb25seSB2YWx1ZVwiKSk7XG4gICAgfVxuICAgIFZ1ZS51dGlsLmRlZmluZVJlYWN0aXZlKFZ1ZSQkMSwga2V5LCBtb2NrZWRQcm9wZXJ0aWVzW2tleV0pO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gYWRkQXR0cnMgKHZtLCBhdHRycykge1xuICB2YXIgb3JpZ2luYWxTaWxlbnQgPSBWdWUuY29uZmlnLnNpbGVudDtcbiAgVnVlLmNvbmZpZy5zaWxlbnQgPSB0cnVlO1xuICBpZiAoYXR0cnMpIHtcbiAgICB2bS4kYXR0cnMgPSBhdHRycztcbiAgfSBlbHNlIHtcbiAgICB2bS4kYXR0cnMgPSB7fTtcbiAgfVxuICBWdWUuY29uZmlnLnNpbGVudCA9IG9yaWdpbmFsU2lsZW50O1xufVxuXG5mdW5jdGlvbiBhZGRMaXN0ZW5lcnMgKHZtLCBsaXN0ZW5lcnMpIHtcbiAgdmFyIG9yaWdpbmFsU2lsZW50ID0gVnVlLmNvbmZpZy5zaWxlbnQ7XG4gIFZ1ZS5jb25maWcuc2lsZW50ID0gdHJ1ZTtcbiAgaWYgKGxpc3RlbmVycykge1xuICAgIHZtLiRsaXN0ZW5lcnMgPSBsaXN0ZW5lcnM7XG4gIH0gZWxzZSB7XG4gICAgdm0uJGxpc3RlbmVycyA9IHt9O1xuICB9XG4gIFZ1ZS5jb25maWcuc2lsZW50ID0gb3JpZ2luYWxTaWxlbnQ7XG59XG5cbmZ1bmN0aW9uIGFkZFByb3ZpZGUgKGNvbXBvbmVudCwgb3B0aW9uUHJvdmlkZSwgb3B0aW9ucykge1xuICB2YXIgcHJvdmlkZSA9IHR5cGVvZiBvcHRpb25Qcm92aWRlID09PSAnZnVuY3Rpb24nXG4gICAgPyBvcHRpb25Qcm92aWRlXG4gICAgOiBPYmplY3QuYXNzaWduKHt9LCBvcHRpb25Qcm92aWRlKTtcblxuICBvcHRpb25zLmJlZm9yZUNyZWF0ZSA9IGZ1bmN0aW9uIHZ1ZVRlc3RVdGlsQmVmb3JlQ3JlYXRlICgpIHtcbiAgICB0aGlzLl9wcm92aWRlZCA9IHR5cGVvZiBwcm92aWRlID09PSAnZnVuY3Rpb24nXG4gICAgICA/IHByb3ZpZGUuY2FsbCh0aGlzKVxuICAgICAgOiBwcm92aWRlO1xuICB9O1xufVxuXG4vLyBcblxuZnVuY3Rpb24gbG9nRXZlbnRzICh2bSwgZW1pdHRlZCwgZW1pdHRlZEJ5T3JkZXIpIHtcbiAgdmFyIGVtaXQgPSB2bS4kZW1pdDtcbiAgdm0uJGVtaXQgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHZhciBhcmdzID0gW10sIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGggLSAxO1xuICAgIHdoaWxlICggbGVuLS0gPiAwICkgYXJnc1sgbGVuIF0gPSBhcmd1bWVudHNbIGxlbiArIDEgXTtcblxuICAgIChlbWl0dGVkW25hbWVdIHx8IChlbWl0dGVkW25hbWVdID0gW10pKS5wdXNoKGFyZ3MpO1xuICAgIGVtaXR0ZWRCeU9yZGVyLnB1c2goeyBuYW1lOiBuYW1lLCBhcmdzOiBhcmdzIH0pO1xuICAgIHJldHVybiBlbWl0LmNhbGwuYXBwbHkoZW1pdCwgWyB2bSwgbmFtZSBdLmNvbmNhdCggYXJncyApKVxuICB9O1xufVxuXG5mdW5jdGlvbiBhZGRFdmVudExvZ2dlciAodnVlKSB7XG4gIHZ1ZS5taXhpbih7XG4gICAgYmVmb3JlQ3JlYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLl9fZW1pdHRlZCA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgICB0aGlzLl9fZW1pdHRlZEJ5T3JkZXIgPSBbXTtcbiAgICAgIGxvZ0V2ZW50cyh0aGlzLCB0aGlzLl9fZW1pdHRlZCwgdGhpcy5fX2VtaXR0ZWRCeU9yZGVyKTtcbiAgICB9XG4gIH0pO1xufVxuXG4vLyBcblxuZnVuY3Rpb24gY29tcGlsZVRlbXBsYXRlIChjb21wb25lbnQpIHtcbiAgaWYgKGNvbXBvbmVudC5jb21wb25lbnRzKSB7XG4gICAgT2JqZWN0LmtleXMoY29tcG9uZW50LmNvbXBvbmVudHMpLmZvckVhY2goZnVuY3Rpb24gKGMpIHtcbiAgICAgIHZhciBjbXAgPSBjb21wb25lbnQuY29tcG9uZW50c1tjXTtcbiAgICAgIGlmICghY21wLnJlbmRlcikge1xuICAgICAgICBjb21waWxlVGVtcGxhdGUoY21wKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuICBpZiAoY29tcG9uZW50LmV4dGVuZHMpIHtcbiAgICBjb21waWxlVGVtcGxhdGUoY29tcG9uZW50LmV4dGVuZHMpO1xuICB9XG4gIGlmIChjb21wb25lbnQudGVtcGxhdGUpIHtcbiAgICBPYmplY3QuYXNzaWduKGNvbXBvbmVudCwgdnVlVGVtcGxhdGVDb21waWxlci5jb21waWxlVG9GdW5jdGlvbnMoY29tcG9uZW50LnRlbXBsYXRlKSk7XG4gIH1cbn1cblxuLy8gXG5cbmZ1bmN0aW9uIGlzVnVlQ29tcG9uZW50JDEgKGNvbXApIHtcbiAgcmV0dXJuIGNvbXAgJiYgKGNvbXAucmVuZGVyIHx8IGNvbXAudGVtcGxhdGUgfHwgY29tcC5vcHRpb25zKVxufVxuXG5mdW5jdGlvbiBpc1ZhbGlkU3R1YiAoc3R1Yikge1xuICByZXR1cm4gISFzdHViICYmXG4gICAgICB0eXBlb2Ygc3R1YiA9PT0gJ3N0cmluZycgfHxcbiAgICAgIChzdHViID09PSB0cnVlKSB8fFxuICAgICAgKGlzVnVlQ29tcG9uZW50JDEoc3R1YikpXG59XG5cbmZ1bmN0aW9uIGlzUmVxdWlyZWRDb21wb25lbnQgKG5hbWUpIHtcbiAgcmV0dXJuIG5hbWUgPT09ICdLZWVwQWxpdmUnIHx8IG5hbWUgPT09ICdUcmFuc2l0aW9uJyB8fCBuYW1lID09PSAnVHJhbnNpdGlvbkdyb3VwJ1xufVxuXG5mdW5jdGlvbiBnZXRDb3JlUHJvcGVydGllcyAoY29tcG9uZW50KSB7XG4gIHJldHVybiB7XG4gICAgYXR0cnM6IGNvbXBvbmVudC5hdHRycyxcbiAgICBuYW1lOiBjb21wb25lbnQubmFtZSxcbiAgICBvbjogY29tcG9uZW50Lm9uLFxuICAgIGtleTogY29tcG9uZW50LmtleSxcbiAgICByZWY6IGNvbXBvbmVudC5yZWYsXG4gICAgcHJvcHM6IGNvbXBvbmVudC5wcm9wcyxcbiAgICBkb21Qcm9wczogY29tcG9uZW50LmRvbVByb3BzLFxuICAgIGNsYXNzOiBjb21wb25lbnQuY2xhc3MsXG4gICAgc3RhdGljQ2xhc3M6IGNvbXBvbmVudC5zdGF0aWNDbGFzcyxcbiAgICBzdGF0aWNTdHlsZTogY29tcG9uZW50LnN0YXRpY1N0eWxlLFxuICAgIHN0eWxlOiBjb21wb25lbnQuc3R5bGUsXG4gICAgbm9ybWFsaXplZFN0eWxlOiBjb21wb25lbnQubm9ybWFsaXplZFN0eWxlLFxuICAgIG5hdGl2ZU9uOiBjb21wb25lbnQubmF0aXZlT24sXG4gICAgZnVuY3Rpb25hbDogY29tcG9uZW50LmZ1bmN0aW9uYWxcbiAgfVxufVxuZnVuY3Rpb24gY3JlYXRlU3R1YkZyb21TdHJpbmcgKHRlbXBsYXRlU3RyaW5nLCBvcmlnaW5hbENvbXBvbmVudCkge1xuICBpZiAoIXZ1ZVRlbXBsYXRlQ29tcGlsZXIuY29tcGlsZVRvRnVuY3Rpb25zKSB7XG4gICAgdGhyb3dFcnJvcigndnVlVGVtcGxhdGVDb21waWxlciBpcyB1bmRlZmluZWQsIHlvdSBtdXN0IHBhc3MgY29tcG9uZW50cyBleHBsaWNpdGx5IGlmIHZ1ZS10ZW1wbGF0ZS1jb21waWxlciBpcyB1bmRlZmluZWQnKTtcbiAgfVxuXG4gIGlmICh0ZW1wbGF0ZVN0cmluZy5pbmRleE9mKGh5cGhlbmF0ZShvcmlnaW5hbENvbXBvbmVudC5uYW1lKSkgIT09IC0xIHx8XG4gIHRlbXBsYXRlU3RyaW5nLmluZGV4T2YoY2FwaXRhbGl6ZShvcmlnaW5hbENvbXBvbmVudC5uYW1lKSkgIT09IC0xIHx8XG4gIHRlbXBsYXRlU3RyaW5nLmluZGV4T2YoY2FtZWxpemUob3JpZ2luYWxDb21wb25lbnQubmFtZSkpICE9PSAtMSkge1xuICAgIHRocm93RXJyb3IoJ29wdGlvbnMuc3R1YiBjYW5ub3QgY29udGFpbiBhIGNpcmN1bGFyIHJlZmVyZW5jZScpO1xuICB9XG5cbiAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIGdldENvcmVQcm9wZXJ0aWVzKG9yaWdpbmFsQ29tcG9uZW50KSxcbiAgICB2dWVUZW1wbGF0ZUNvbXBpbGVyLmNvbXBpbGVUb0Z1bmN0aW9ucyh0ZW1wbGF0ZVN0cmluZykpXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUJsYW5rU3R1YiAob3JpZ2luYWxDb21wb25lbnQpIHtcbiAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIGdldENvcmVQcm9wZXJ0aWVzKG9yaWdpbmFsQ29tcG9uZW50KSxcbiAgICB7cmVuZGVyOiBmdW5jdGlvbiAoaCkgeyByZXR1cm4gaCgnJyk7IH19KVxufVxuXG5mdW5jdGlvbiBjcmVhdGVDb21wb25lbnRTdHVicyAob3JpZ2luYWxDb21wb25lbnRzLCBzdHVicykge1xuICBpZiAoIG9yaWdpbmFsQ29tcG9uZW50cyA9PT0gdm9pZCAwICkgb3JpZ2luYWxDb21wb25lbnRzID0ge307XG5cbiAgdmFyIGNvbXBvbmVudHMgPSB7fTtcbiAgaWYgKCFzdHVicykge1xuICAgIHJldHVybiBjb21wb25lbnRzXG4gIH1cbiAgaWYgKEFycmF5LmlzQXJyYXkoc3R1YnMpKSB7XG4gICAgc3R1YnMuZm9yRWFjaChmdW5jdGlvbiAoc3R1Yikge1xuICAgICAgaWYgKHN0dWIgPT09IGZhbHNlKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIHN0dWIgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRocm93RXJyb3IoJ2VhY2ggaXRlbSBpbiBhbiBvcHRpb25zLnN0dWJzIGFycmF5IG11c3QgYmUgYSBzdHJpbmcnKTtcbiAgICAgIH1cbiAgICAgIGNvbXBvbmVudHNbc3R1Yl0gPSBjcmVhdGVCbGFua1N0dWIoe30pO1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIE9iamVjdC5rZXlzKHN0dWJzKS5mb3JFYWNoKGZ1bmN0aW9uIChzdHViKSB7XG4gICAgICBpZiAoc3R1YnNbc3R1Yl0gPT09IGZhbHNlKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgaWYgKCFpc1ZhbGlkU3R1YihzdHVic1tzdHViXSkpIHtcbiAgICAgICAgdGhyb3dFcnJvcignb3B0aW9ucy5zdHViIHZhbHVlcyBtdXN0IGJlIHBhc3NlZCBhIHN0cmluZyBvciBjb21wb25lbnQnKTtcbiAgICAgIH1cbiAgICAgIGlmIChzdHVic1tzdHViXSA9PT0gdHJ1ZSkge1xuICAgICAgICBjb21wb25lbnRzW3N0dWJdID0gY3JlYXRlQmxhbmtTdHViKHt9KTtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGlmIChjb21wb25lbnROZWVkc0NvbXBpbGluZyhzdHVic1tzdHViXSkpIHtcbiAgICAgICAgY29tcGlsZVRlbXBsYXRlKHN0dWJzW3N0dWJdKTtcbiAgICAgIH1cblxuICAgICAgaWYgKG9yaWdpbmFsQ29tcG9uZW50c1tzdHViXSkge1xuICAgICAgICAvLyBSZW1vdmUgY2FjaGVkIGNvbnN0cnVjdG9yXG4gICAgICAgIGRlbGV0ZSBvcmlnaW5hbENvbXBvbmVudHNbc3R1Yl0uX0N0b3I7XG4gICAgICAgIGlmICh0eXBlb2Ygc3R1YnNbc3R1Yl0gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgY29tcG9uZW50c1tzdHViXSA9IGNyZWF0ZVN0dWJGcm9tU3RyaW5nKHN0dWJzW3N0dWJdLCBvcmlnaW5hbENvbXBvbmVudHNbc3R1Yl0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbXBvbmVudHNbc3R1Yl0gPSBPYmplY3QuYXNzaWduKHt9LCBzdHVic1tzdHViXSxcbiAgICAgICAgICAgIHtuYW1lOiBvcmlnaW5hbENvbXBvbmVudHNbc3R1Yl0ubmFtZX0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAodHlwZW9mIHN0dWJzW3N0dWJdID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIGlmICghdnVlVGVtcGxhdGVDb21waWxlci5jb21waWxlVG9GdW5jdGlvbnMpIHtcbiAgICAgICAgICAgIHRocm93RXJyb3IoJ3Z1ZVRlbXBsYXRlQ29tcGlsZXIgaXMgdW5kZWZpbmVkLCB5b3UgbXVzdCBwYXNzIGNvbXBvbmVudHMgZXhwbGljaXRseSBpZiB2dWUtdGVtcGxhdGUtY29tcGlsZXIgaXMgdW5kZWZpbmVkJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbXBvbmVudHNbc3R1Yl0gPSBPYmplY3QuYXNzaWduKHt9LCB2dWVUZW1wbGF0ZUNvbXBpbGVyLmNvbXBpbGVUb0Z1bmN0aW9ucyhzdHVic1tzdHViXSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbXBvbmVudHNbc3R1Yl0gPSBPYmplY3QuYXNzaWduKHt9LCBzdHVic1tzdHViXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIGlnbm9yZUVsZW1lbnRzIGRvZXMgbm90IGV4aXN0IGluIFZ1ZSAyLjAueFxuICAgICAgaWYgKFZ1ZS5jb25maWcuaWdub3JlZEVsZW1lbnRzKSB7XG4gICAgICAgIFZ1ZS5jb25maWcuaWdub3JlZEVsZW1lbnRzLnB1c2goc3R1Yik7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIGNvbXBvbmVudHNcbn1cblxuZnVuY3Rpb24gc3R1YkNvbXBvbmVudHMgKGNvbXBvbmVudHMsIHN0dWJiZWRDb21wb25lbnRzKSB7XG4gIE9iamVjdC5rZXlzKGNvbXBvbmVudHMpLmZvckVhY2goZnVuY3Rpb24gKGNvbXBvbmVudCkge1xuICAgIC8vIFJlbW92ZSBjYWNoZWQgY29uc3RydWN0b3JcbiAgICBkZWxldGUgY29tcG9uZW50c1tjb21wb25lbnRdLl9DdG9yO1xuICAgIGlmICghY29tcG9uZW50c1tjb21wb25lbnRdLm5hbWUpIHtcbiAgICAgIGNvbXBvbmVudHNbY29tcG9uZW50XS5uYW1lID0gY29tcG9uZW50O1xuICAgIH1cbiAgICBzdHViYmVkQ29tcG9uZW50c1tjb21wb25lbnRdID0gY3JlYXRlQmxhbmtTdHViKGNvbXBvbmVudHNbY29tcG9uZW50XSk7XG5cbiAgICAvLyBpZ25vcmVFbGVtZW50cyBkb2VzIG5vdCBleGlzdCBpbiBWdWUgMi4wLnhcbiAgICBpZiAoVnVlLmNvbmZpZy5pZ25vcmVkRWxlbWVudHMpIHtcbiAgICAgIFZ1ZS5jb25maWcuaWdub3JlZEVsZW1lbnRzLnB1c2goY29tcG9uZW50KTtcbiAgICB9XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVDb21wb25lbnRTdHVic0ZvckFsbCAoY29tcG9uZW50KSB7XG4gIHZhciBzdHViYmVkQ29tcG9uZW50cyA9IHt9O1xuXG4gIGlmIChjb21wb25lbnQuY29tcG9uZW50cykge1xuICAgIHN0dWJDb21wb25lbnRzKGNvbXBvbmVudC5jb21wb25lbnRzLCBzdHViYmVkQ29tcG9uZW50cyk7XG4gIH1cblxuICB2YXIgZXh0ZW5kZWQgPSBjb21wb25lbnQuZXh0ZW5kcztcblxuICAvLyBMb29wIHRocm91Z2ggZXh0ZW5kZWQgY29tcG9uZW50IGNoYWlucyB0byBzdHViIGFsbCBjaGlsZCBjb21wb25lbnRzXG4gIHdoaWxlIChleHRlbmRlZCkge1xuICAgIGlmIChleHRlbmRlZC5jb21wb25lbnRzKSB7XG4gICAgICBzdHViQ29tcG9uZW50cyhleHRlbmRlZC5jb21wb25lbnRzLCBzdHViYmVkQ29tcG9uZW50cyk7XG4gICAgfVxuICAgIGV4dGVuZGVkID0gZXh0ZW5kZWQuZXh0ZW5kcztcbiAgfVxuXG4gIGlmIChjb21wb25lbnQuZXh0ZW5kT3B0aW9ucyAmJiBjb21wb25lbnQuZXh0ZW5kT3B0aW9ucy5jb21wb25lbnRzKSB7XG4gICAgc3R1YkNvbXBvbmVudHMoY29tcG9uZW50LmV4dGVuZE9wdGlvbnMuY29tcG9uZW50cywgc3R1YmJlZENvbXBvbmVudHMpO1xuICB9XG5cbiAgcmV0dXJuIHN0dWJiZWRDb21wb25lbnRzXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUNvbXBvbmVudFN0dWJzRm9yR2xvYmFscyAoaW5zdGFuY2UpIHtcbiAgdmFyIGNvbXBvbmVudHMgPSB7fTtcbiAgT2JqZWN0LmtleXMoaW5zdGFuY2Uub3B0aW9ucy5jb21wb25lbnRzKS5mb3JFYWNoKGZ1bmN0aW9uIChjKSB7XG4gICAgaWYgKGlzUmVxdWlyZWRDb21wb25lbnQoYykpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbXBvbmVudHNbY10gPSBjcmVhdGVCbGFua1N0dWIoaW5zdGFuY2Uub3B0aW9ucy5jb21wb25lbnRzW2NdKTtcbiAgICBkZWxldGUgaW5zdGFuY2Uub3B0aW9ucy5jb21wb25lbnRzW2NdLl9DdG9yOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXBhcmFtLXJlYXNzaWduXG4gICAgZGVsZXRlIGNvbXBvbmVudHNbY10uX0N0b3I7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tcGFyYW0tcmVhc3NpZ25cbiAgfSk7XG4gIHJldHVybiBjb21wb25lbnRzXG59XG5cbi8vIFxuXG5mdW5jdGlvbiBjb21waWxlVGVtcGxhdGUkMSAoY29tcG9uZW50KSB7XG4gIGlmIChjb21wb25lbnQuY29tcG9uZW50cykge1xuICAgIE9iamVjdC5rZXlzKGNvbXBvbmVudC5jb21wb25lbnRzKS5mb3JFYWNoKGZ1bmN0aW9uIChjKSB7XG4gICAgICB2YXIgY21wID0gY29tcG9uZW50LmNvbXBvbmVudHNbY107XG4gICAgICBpZiAoIWNtcC5yZW5kZXIpIHtcbiAgICAgICAgY29tcGlsZVRlbXBsYXRlJDEoY21wKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuICBpZiAoY29tcG9uZW50LmV4dGVuZHMpIHtcbiAgICBjb21waWxlVGVtcGxhdGUkMShjb21wb25lbnQuZXh0ZW5kcyk7XG4gIH1cbiAgaWYgKGNvbXBvbmVudC50ZW1wbGF0ZSkge1xuICAgIE9iamVjdC5hc3NpZ24oY29tcG9uZW50LCB2dWVUZW1wbGF0ZUNvbXBpbGVyLmNvbXBpbGVUb0Z1bmN0aW9ucyhjb21wb25lbnQudGVtcGxhdGUpKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBkZWxldGVNb3VudGluZ09wdGlvbnMgKG9wdGlvbnMpIHtcbiAgZGVsZXRlIG9wdGlvbnMuYXR0YWNoVG9Eb2N1bWVudDtcbiAgZGVsZXRlIG9wdGlvbnMubW9ja3M7XG4gIGRlbGV0ZSBvcHRpb25zLnNsb3RzO1xuICBkZWxldGUgb3B0aW9ucy5sb2NhbFZ1ZTtcbiAgZGVsZXRlIG9wdGlvbnMuc3R1YnM7XG4gIGRlbGV0ZSBvcHRpb25zLmNvbnRleHQ7XG4gIGRlbGV0ZSBvcHRpb25zLmNsb25lO1xuICBkZWxldGUgb3B0aW9ucy5hdHRycztcbiAgZGVsZXRlIG9wdGlvbnMubGlzdGVuZXJzO1xufVxuXG4vLyBcblxuZnVuY3Rpb24gY3JlYXRlRnVuY3Rpb25hbFNsb3RzIChzbG90cywgaCkge1xuICBpZiAoIHNsb3RzID09PSB2b2lkIDAgKSBzbG90cyA9IHt9O1xuXG4gIGlmIChBcnJheS5pc0FycmF5KHNsb3RzLmRlZmF1bHQpKSB7XG4gICAgcmV0dXJuIHNsb3RzLmRlZmF1bHQubWFwKGgpXG4gIH1cblxuICBpZiAodHlwZW9mIHNsb3RzLmRlZmF1bHQgPT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIFtoKHZ1ZVRlbXBsYXRlQ29tcGlsZXIuY29tcGlsZVRvRnVuY3Rpb25zKHNsb3RzLmRlZmF1bHQpKV1cbiAgfVxuICB2YXIgY2hpbGRyZW4gPSBbXTtcbiAgT2JqZWN0LmtleXMoc2xvdHMpLmZvckVhY2goZnVuY3Rpb24gKHNsb3RUeXBlKSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoc2xvdHNbc2xvdFR5cGVdKSkge1xuICAgICAgc2xvdHNbc2xvdFR5cGVdLmZvckVhY2goZnVuY3Rpb24gKHNsb3QpIHtcbiAgICAgICAgdmFyIGNvbXBvbmVudCA9IHR5cGVvZiBzbG90ID09PSAnc3RyaW5nJyA/IHZ1ZVRlbXBsYXRlQ29tcGlsZXIuY29tcGlsZVRvRnVuY3Rpb25zKHNsb3QpIDogc2xvdDtcbiAgICAgICAgdmFyIG5ld1Nsb3QgPSBoKGNvbXBvbmVudCk7XG4gICAgICAgIG5ld1Nsb3QuZGF0YS5zbG90ID0gc2xvdFR5cGU7XG4gICAgICAgIGNoaWxkcmVuLnB1c2gobmV3U2xvdCk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGNvbXBvbmVudCA9IHR5cGVvZiBzbG90c1tzbG90VHlwZV0gPT09ICdzdHJpbmcnID8gdnVlVGVtcGxhdGVDb21waWxlci5jb21waWxlVG9GdW5jdGlvbnMoc2xvdHNbc2xvdFR5cGVdKSA6IHNsb3RzW3Nsb3RUeXBlXTtcbiAgICAgIHZhciBzbG90ID0gaChjb21wb25lbnQpO1xuICAgICAgc2xvdC5kYXRhLnNsb3QgPSBzbG90VHlwZTtcbiAgICAgIGNoaWxkcmVuLnB1c2goc2xvdCk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIGNoaWxkcmVuXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUZ1bmN0aW9uYWxDb21wb25lbnQgKGNvbXBvbmVudCwgbW91bnRpbmdPcHRpb25zKSB7XG4gIGlmIChtb3VudGluZ09wdGlvbnMuY29udGV4dCAmJiB0eXBlb2YgbW91bnRpbmdPcHRpb25zLmNvbnRleHQgIT09ICdvYmplY3QnKSB7XG4gICAgdGhyb3dFcnJvcignbW91bnQuY29udGV4dCBtdXN0IGJlIGFuIG9iamVjdCcpO1xuICB9XG4gIGlmIChtb3VudGluZ09wdGlvbnMuc2xvdHMpIHtcbiAgICB2YWxpZGF0ZVNsb3RzKG1vdW50aW5nT3B0aW9ucy5zbG90cyk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyIChoKSB7XG4gICAgICByZXR1cm4gaChcbiAgICAgICAgY29tcG9uZW50LFxuICAgICAgICBtb3VudGluZ09wdGlvbnMuY29udGV4dCB8fCBjb21wb25lbnQuRnVuY3Rpb25hbFJlbmRlckNvbnRleHQsXG4gICAgICAgIChtb3VudGluZ09wdGlvbnMuY29udGV4dCAmJiBtb3VudGluZ09wdGlvbnMuY29udGV4dC5jaGlsZHJlbiAmJiBtb3VudGluZ09wdGlvbnMuY29udGV4dC5jaGlsZHJlbi5tYXAoZnVuY3Rpb24gKHgpIHsgcmV0dXJuIHR5cGVvZiB4ID09PSAnZnVuY3Rpb24nID8geChoKSA6IHg7IH0pKSB8fCBjcmVhdGVGdW5jdGlvbmFsU2xvdHMobW91bnRpbmdPcHRpb25zLnNsb3RzLCBoKVxuICAgICAgKVxuICAgIH0sXG4gICAgbmFtZTogY29tcG9uZW50Lm5hbWUsXG4gICAgX2lzRnVuY3Rpb25hbENvbnRhaW5lcjogdHJ1ZVxuICB9XG59XG5cbi8vIFxuXG5mdW5jdGlvbiBjcmVhdGVJbnN0YW5jZSAoXG4gIGNvbXBvbmVudCxcbiAgb3B0aW9ucyxcbiAgdnVlXG4pIHtcbiAgaWYgKG9wdGlvbnMubW9ja3MpIHtcbiAgICBhZGRNb2NrcyhvcHRpb25zLm1vY2tzLCB2dWUpO1xuICB9XG5cbiAgaWYgKChjb21wb25lbnQub3B0aW9ucyAmJiBjb21wb25lbnQub3B0aW9ucy5mdW5jdGlvbmFsKSB8fCBjb21wb25lbnQuZnVuY3Rpb25hbCkge1xuICAgIGNvbXBvbmVudCA9IGNyZWF0ZUZ1bmN0aW9uYWxDb21wb25lbnQoY29tcG9uZW50LCBvcHRpb25zKTtcbiAgfSBlbHNlIGlmIChvcHRpb25zLmNvbnRleHQpIHtcbiAgICB0aHJvd0Vycm9yKFxuICAgICAgJ21vdW50LmNvbnRleHQgY2FuIG9ubHkgYmUgdXNlZCB3aGVuIG1vdW50aW5nIGEgZnVuY3Rpb25hbCBjb21wb25lbnQnXG4gICAgKTtcbiAgfVxuXG4gIGlmIChvcHRpb25zLnByb3ZpZGUpIHtcbiAgICBhZGRQcm92aWRlKGNvbXBvbmVudCwgb3B0aW9ucy5wcm92aWRlLCBvcHRpb25zKTtcbiAgfVxuXG4gIGlmIChjb21wb25lbnROZWVkc0NvbXBpbGluZyhjb21wb25lbnQpKSB7XG4gICAgY29tcGlsZVRlbXBsYXRlJDEoY29tcG9uZW50KTtcbiAgfVxuXG4gIGFkZEV2ZW50TG9nZ2VyKHZ1ZSk7XG5cbiAgdmFyIENvbnN0cnVjdG9yID0gdnVlLmV4dGVuZChjb21wb25lbnQpO1xuXG4gIHZhciBpbnN0YW5jZU9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBvcHRpb25zKTtcbiAgZGVsZXRlTW91bnRpbmdPcHRpb25zKGluc3RhbmNlT3B0aW9ucyk7XG4gIGlmIChvcHRpb25zLnN0dWJzKSB7XG4gICAgaW5zdGFuY2VPcHRpb25zLmNvbXBvbmVudHMgPSBPYmplY3QuYXNzaWduKHt9LCBpbnN0YW5jZU9wdGlvbnMuY29tcG9uZW50cyxcbiAgICAgIC8vICRGbG93SWdub3JlXG4gICAgICBjcmVhdGVDb21wb25lbnRTdHVicyhjb21wb25lbnQuY29tcG9uZW50cywgb3B0aW9ucy5zdHVicykpO1xuICB9XG5cbiAgdmFyIHZtID0gbmV3IENvbnN0cnVjdG9yKGluc3RhbmNlT3B0aW9ucyk7XG5cbiAgYWRkQXR0cnModm0sIG9wdGlvbnMuYXR0cnMpO1xuICBhZGRMaXN0ZW5lcnModm0sIG9wdGlvbnMubGlzdGVuZXJzKTtcblxuICBpZiAob3B0aW9ucy5zY29wZWRTbG90cykge1xuICAgIGlmICh3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvUGhhbnRvbUpTL2kpKSB7XG4gICAgICB0aHJvd0Vycm9yKCd0aGUgc2NvcGVkU2xvdHMgb3B0aW9uIGRvZXMgbm90IHN1cHBvcnQgUGhhbnRvbUpTLiBQbGVhc2UgdXNlIFB1cHBldGVlciwgb3IgcGFzcyBhIGNvbXBvbmVudC4nKTtcbiAgICB9XG4gICAgdmFyIHZ1ZVZlcnNpb24gPSBOdW1iZXIoKChWdWUudmVyc2lvbi5zcGxpdCgnLicpWzBdKSArIFwiLlwiICsgKFZ1ZS52ZXJzaW9uLnNwbGl0KCcuJylbMV0pKSk7XG4gICAgaWYgKHZ1ZVZlcnNpb24gPj0gMi41KSB7XG4gICAgICB2bS4kX3Z1ZVRlc3RVdGlsc19zY29wZWRTbG90cyA9IHt9O1xuICAgICAgdm0uJF92dWVUZXN0VXRpbHNfc2xvdFNjb3BlcyA9IHt9O1xuICAgICAgdmFyIHJlbmRlclNsb3QgPSB2bS5fcmVuZGVyUHJveHkuX3Q7XG5cbiAgICAgIHZtLl9yZW5kZXJQcm94eS5fdCA9IGZ1bmN0aW9uIChuYW1lLCBmZWVkYmFjaywgcHJvcHMsIGJpbmRPYmplY3QpIHtcbiAgICAgICAgdmFyIHNjb3BlZFNsb3RGbiA9IHZtLiRfdnVlVGVzdFV0aWxzX3Njb3BlZFNsb3RzW25hbWVdO1xuICAgICAgICB2YXIgc2xvdFNjb3BlID0gdm0uJF92dWVUZXN0VXRpbHNfc2xvdFNjb3Blc1tuYW1lXTtcbiAgICAgICAgaWYgKHNjb3BlZFNsb3RGbikge1xuICAgICAgICAgIHByb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgYmluZE9iamVjdCwgcHJvcHMpO1xuICAgICAgICAgIHZhciBwcm94eSA9IHt9O1xuICAgICAgICAgIHZhciBoZWxwZXJzID0gWydfYycsICdfbycsICdfbicsICdfcycsICdfbCcsICdfdCcsICdfcScsICdfaScsICdfbScsICdfZicsICdfaycsICdfYicsICdfdicsICdfZScsICdfdScsICdfZyddO1xuICAgICAgICAgIGhlbHBlcnMuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICBwcm94eVtrZXldID0gdm0uX3JlbmRlclByb3h5W2tleV07XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcHJveHlbc2xvdFNjb3BlXSA9IHByb3BzO1xuICAgICAgICAgIHJldHVybiBzY29wZWRTbG90Rm4uY2FsbChwcm94eSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gcmVuZGVyU2xvdC5jYWxsKHZtLl9yZW5kZXJQcm94eSwgbmFtZSwgZmVlZGJhY2ssIHByb3BzLCBiaW5kT2JqZWN0KVxuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICAvLyAkRmxvd0lnbm9yZVxuICAgICAgYWRkU2NvcGVkU2xvdHModm0sIG9wdGlvbnMuc2NvcGVkU2xvdHMpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvd0Vycm9yKCd0aGUgc2NvcGVkU2xvdHMgb3B0aW9uIGlzIG9ubHkgc3VwcG9ydGVkIGluIHZ1ZUAyLjUrLicpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChvcHRpb25zLnNsb3RzKSB7XG4gICAgYWRkU2xvdHModm0sIG9wdGlvbnMuc2xvdHMpO1xuICB9XG5cbiAgcmV0dXJuIHZtXG59XG5cbi8vIFxuXG5mdW5jdGlvbiBjcmVhdGVFbGVtZW50ICgpIHtcbiAgaWYgKGRvY3VtZW50KSB7XG4gICAgdmFyIGVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblxuICAgIGlmIChkb2N1bWVudC5ib2R5KSB7XG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGVsZW0pO1xuICAgIH1cbiAgICByZXR1cm4gZWxlbVxuICB9XG59XG5cbi8qKlxuICogUmVtb3ZlcyBhbGwga2V5LXZhbHVlIGVudHJpZXMgZnJvbSB0aGUgbGlzdCBjYWNoZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgY2xlYXJcbiAqIEBtZW1iZXJPZiBMaXN0Q2FjaGVcbiAqL1xuZnVuY3Rpb24gbGlzdENhY2hlQ2xlYXIoKSB7XG4gIHRoaXMuX19kYXRhX18gPSBbXTtcbiAgdGhpcy5zaXplID0gMDtcbn1cblxudmFyIF9saXN0Q2FjaGVDbGVhciA9IGxpc3RDYWNoZUNsZWFyO1xuXG4vKipcbiAqIFBlcmZvcm1zIGFcbiAqIFtgU2FtZVZhbHVlWmVyb2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLXNhbWV2YWx1ZXplcm8pXG4gKiBjb21wYXJpc29uIGJldHdlZW4gdHdvIHZhbHVlcyB0byBkZXRlcm1pbmUgaWYgdGhleSBhcmUgZXF1aXZhbGVudC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY29tcGFyZS5cbiAqIEBwYXJhbSB7Kn0gb3RoZXIgVGhlIG90aGVyIHZhbHVlIHRvIGNvbXBhcmUuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIHZhbHVlcyBhcmUgZXF1aXZhbGVudCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgb2JqZWN0ID0geyAnYSc6IDEgfTtcbiAqIHZhciBvdGhlciA9IHsgJ2EnOiAxIH07XG4gKlxuICogXy5lcShvYmplY3QsIG9iamVjdCk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5lcShvYmplY3QsIG90aGVyKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5lcSgnYScsICdhJyk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5lcSgnYScsIE9iamVjdCgnYScpKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5lcShOYU4sIE5hTik7XG4gKiAvLyA9PiB0cnVlXG4gKi9cbmZ1bmN0aW9uIGVxKHZhbHVlLCBvdGhlcikge1xuICByZXR1cm4gdmFsdWUgPT09IG90aGVyIHx8ICh2YWx1ZSAhPT0gdmFsdWUgJiYgb3RoZXIgIT09IG90aGVyKTtcbn1cblxudmFyIGVxXzEgPSBlcTtcblxuLyoqXG4gKiBHZXRzIHRoZSBpbmRleCBhdCB3aGljaCB0aGUgYGtleWAgaXMgZm91bmQgaW4gYGFycmF5YCBvZiBrZXktdmFsdWUgcGFpcnMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBpbnNwZWN0LlxuICogQHBhcmFtIHsqfSBrZXkgVGhlIGtleSB0byBzZWFyY2ggZm9yLlxuICogQHJldHVybnMge251bWJlcn0gUmV0dXJucyB0aGUgaW5kZXggb2YgdGhlIG1hdGNoZWQgdmFsdWUsIGVsc2UgYC0xYC5cbiAqL1xuZnVuY3Rpb24gYXNzb2NJbmRleE9mKGFycmF5LCBrZXkpIHtcbiAgdmFyIGxlbmd0aCA9IGFycmF5Lmxlbmd0aDtcbiAgd2hpbGUgKGxlbmd0aC0tKSB7XG4gICAgaWYgKGVxXzEoYXJyYXlbbGVuZ3RoXVswXSwga2V5KSkge1xuICAgICAgcmV0dXJuIGxlbmd0aDtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIC0xO1xufVxuXG52YXIgX2Fzc29jSW5kZXhPZiA9IGFzc29jSW5kZXhPZjtcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIGFycmF5UHJvdG8gPSBBcnJheS5wcm90b3R5cGU7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIHNwbGljZSA9IGFycmF5UHJvdG8uc3BsaWNlO1xuXG4vKipcbiAqIFJlbW92ZXMgYGtleWAgYW5kIGl0cyB2YWx1ZSBmcm9tIHRoZSBsaXN0IGNhY2hlLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBkZWxldGVcbiAqIEBtZW1iZXJPZiBMaXN0Q2FjaGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gcmVtb3ZlLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBlbnRyeSB3YXMgcmVtb3ZlZCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBsaXN0Q2FjaGVEZWxldGUoa2V5KSB7XG4gIHZhciBkYXRhID0gdGhpcy5fX2RhdGFfXyxcbiAgICAgIGluZGV4ID0gX2Fzc29jSW5kZXhPZihkYXRhLCBrZXkpO1xuXG4gIGlmIChpbmRleCA8IDApIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgdmFyIGxhc3RJbmRleCA9IGRhdGEubGVuZ3RoIC0gMTtcbiAgaWYgKGluZGV4ID09IGxhc3RJbmRleCkge1xuICAgIGRhdGEucG9wKCk7XG4gIH0gZWxzZSB7XG4gICAgc3BsaWNlLmNhbGwoZGF0YSwgaW5kZXgsIDEpO1xuICB9XG4gIC0tdGhpcy5zaXplO1xuICByZXR1cm4gdHJ1ZTtcbn1cblxudmFyIF9saXN0Q2FjaGVEZWxldGUgPSBsaXN0Q2FjaGVEZWxldGU7XG5cbi8qKlxuICogR2V0cyB0aGUgbGlzdCBjYWNoZSB2YWx1ZSBmb3IgYGtleWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGdldFxuICogQG1lbWJlck9mIExpc3RDYWNoZVxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byBnZXQuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgZW50cnkgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIGxpc3RDYWNoZUdldChrZXkpIHtcbiAgdmFyIGRhdGEgPSB0aGlzLl9fZGF0YV9fLFxuICAgICAgaW5kZXggPSBfYXNzb2NJbmRleE9mKGRhdGEsIGtleSk7XG5cbiAgcmV0dXJuIGluZGV4IDwgMCA/IHVuZGVmaW5lZCA6IGRhdGFbaW5kZXhdWzFdO1xufVxuXG52YXIgX2xpc3RDYWNoZUdldCA9IGxpc3RDYWNoZUdldDtcblxuLyoqXG4gKiBDaGVja3MgaWYgYSBsaXN0IGNhY2hlIHZhbHVlIGZvciBga2V5YCBleGlzdHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGhhc1xuICogQG1lbWJlck9mIExpc3RDYWNoZVxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBlbnRyeSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBhbiBlbnRyeSBmb3IgYGtleWAgZXhpc3RzLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGxpc3RDYWNoZUhhcyhrZXkpIHtcbiAgcmV0dXJuIF9hc3NvY0luZGV4T2YodGhpcy5fX2RhdGFfXywga2V5KSA+IC0xO1xufVxuXG52YXIgX2xpc3RDYWNoZUhhcyA9IGxpc3RDYWNoZUhhcztcblxuLyoqXG4gKiBTZXRzIHRoZSBsaXN0IGNhY2hlIGBrZXlgIHRvIGB2YWx1ZWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIHNldFxuICogQG1lbWJlck9mIExpc3RDYWNoZVxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byBzZXQuXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBzZXQuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBsaXN0IGNhY2hlIGluc3RhbmNlLlxuICovXG5mdW5jdGlvbiBsaXN0Q2FjaGVTZXQoa2V5LCB2YWx1ZSkge1xuICB2YXIgZGF0YSA9IHRoaXMuX19kYXRhX18sXG4gICAgICBpbmRleCA9IF9hc3NvY0luZGV4T2YoZGF0YSwga2V5KTtcblxuICBpZiAoaW5kZXggPCAwKSB7XG4gICAgKyt0aGlzLnNpemU7XG4gICAgZGF0YS5wdXNoKFtrZXksIHZhbHVlXSk7XG4gIH0gZWxzZSB7XG4gICAgZGF0YVtpbmRleF1bMV0gPSB2YWx1ZTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn1cblxudmFyIF9saXN0Q2FjaGVTZXQgPSBsaXN0Q2FjaGVTZXQ7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBsaXN0IGNhY2hlIG9iamVjdC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge0FycmF5fSBbZW50cmllc10gVGhlIGtleS12YWx1ZSBwYWlycyB0byBjYWNoZS5cbiAqL1xuZnVuY3Rpb24gTGlzdENhY2hlKGVudHJpZXMpIHtcbiAgdmFyIHRoaXMkMSA9IHRoaXM7XG5cbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBlbnRyaWVzID09IG51bGwgPyAwIDogZW50cmllcy5sZW5ndGg7XG5cbiAgdGhpcy5jbGVhcigpO1xuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIHZhciBlbnRyeSA9IGVudHJpZXNbaW5kZXhdO1xuICAgIHRoaXMkMS5zZXQoZW50cnlbMF0sIGVudHJ5WzFdKTtcbiAgfVxufVxuXG4vLyBBZGQgbWV0aG9kcyB0byBgTGlzdENhY2hlYC5cbkxpc3RDYWNoZS5wcm90b3R5cGUuY2xlYXIgPSBfbGlzdENhY2hlQ2xlYXI7XG5MaXN0Q2FjaGUucHJvdG90eXBlWydkZWxldGUnXSA9IF9saXN0Q2FjaGVEZWxldGU7XG5MaXN0Q2FjaGUucHJvdG90eXBlLmdldCA9IF9saXN0Q2FjaGVHZXQ7XG5MaXN0Q2FjaGUucHJvdG90eXBlLmhhcyA9IF9saXN0Q2FjaGVIYXM7XG5MaXN0Q2FjaGUucHJvdG90eXBlLnNldCA9IF9saXN0Q2FjaGVTZXQ7XG5cbnZhciBfTGlzdENhY2hlID0gTGlzdENhY2hlO1xuXG4vKipcbiAqIFJlbW92ZXMgYWxsIGtleS12YWx1ZSBlbnRyaWVzIGZyb20gdGhlIHN0YWNrLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBjbGVhclxuICogQG1lbWJlck9mIFN0YWNrXG4gKi9cbmZ1bmN0aW9uIHN0YWNrQ2xlYXIoKSB7XG4gIHRoaXMuX19kYXRhX18gPSBuZXcgX0xpc3RDYWNoZTtcbiAgdGhpcy5zaXplID0gMDtcbn1cblxudmFyIF9zdGFja0NsZWFyID0gc3RhY2tDbGVhcjtcblxuLyoqXG4gKiBSZW1vdmVzIGBrZXlgIGFuZCBpdHMgdmFsdWUgZnJvbSB0aGUgc3RhY2suXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGRlbGV0ZVxuICogQG1lbWJlck9mIFN0YWNrXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIHJlbW92ZS5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgZW50cnkgd2FzIHJlbW92ZWQsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gc3RhY2tEZWxldGUoa2V5KSB7XG4gIHZhciBkYXRhID0gdGhpcy5fX2RhdGFfXyxcbiAgICAgIHJlc3VsdCA9IGRhdGFbJ2RlbGV0ZSddKGtleSk7XG5cbiAgdGhpcy5zaXplID0gZGF0YS5zaXplO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG52YXIgX3N0YWNrRGVsZXRlID0gc3RhY2tEZWxldGU7XG5cbi8qKlxuICogR2V0cyB0aGUgc3RhY2sgdmFsdWUgZm9yIGBrZXlgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBnZXRcbiAqIEBtZW1iZXJPZiBTdGFja1xuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byBnZXQuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgZW50cnkgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIHN0YWNrR2V0KGtleSkge1xuICByZXR1cm4gdGhpcy5fX2RhdGFfXy5nZXQoa2V5KTtcbn1cblxudmFyIF9zdGFja0dldCA9IHN0YWNrR2V0O1xuXG4vKipcbiAqIENoZWNrcyBpZiBhIHN0YWNrIHZhbHVlIGZvciBga2V5YCBleGlzdHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGhhc1xuICogQG1lbWJlck9mIFN0YWNrXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIGVudHJ5IHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGFuIGVudHJ5IGZvciBga2V5YCBleGlzdHMsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gc3RhY2tIYXMoa2V5KSB7XG4gIHJldHVybiB0aGlzLl9fZGF0YV9fLmhhcyhrZXkpO1xufVxuXG52YXIgX3N0YWNrSGFzID0gc3RhY2tIYXM7XG5cbnZhciBjb21tb25qc0dsb2JhbCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93IDogdHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gJ3VuZGVmaW5lZCcgPyBzZWxmIDoge307XG5cbmZ1bmN0aW9uIGNyZWF0ZUNvbW1vbmpzTW9kdWxlKGZuLCBtb2R1bGUpIHtcblx0cmV0dXJuIG1vZHVsZSA9IHsgZXhwb3J0czoge30gfSwgZm4obW9kdWxlLCBtb2R1bGUuZXhwb3J0cyksIG1vZHVsZS5leHBvcnRzO1xufVxuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYGdsb2JhbGAgZnJvbSBOb2RlLmpzLiAqL1xudmFyIGZyZWVHbG9iYWwgPSB0eXBlb2YgY29tbW9uanNHbG9iYWwgPT0gJ29iamVjdCcgJiYgY29tbW9uanNHbG9iYWwgJiYgY29tbW9uanNHbG9iYWwuT2JqZWN0ID09PSBPYmplY3QgJiYgY29tbW9uanNHbG9iYWw7XG5cbnZhciBfZnJlZUdsb2JhbCA9IGZyZWVHbG9iYWw7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgc2VsZmAuICovXG52YXIgZnJlZVNlbGYgPSB0eXBlb2Ygc2VsZiA9PSAnb2JqZWN0JyAmJiBzZWxmICYmIHNlbGYuT2JqZWN0ID09PSBPYmplY3QgJiYgc2VsZjtcblxuLyoqIFVzZWQgYXMgYSByZWZlcmVuY2UgdG8gdGhlIGdsb2JhbCBvYmplY3QuICovXG52YXIgcm9vdCA9IF9mcmVlR2xvYmFsIHx8IGZyZWVTZWxmIHx8IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5cbnZhciBfcm9vdCA9IHJvb3Q7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIFN5bWJvbCA9IF9yb290LlN5bWJvbDtcblxudmFyIF9TeW1ib2wgPSBTeW1ib2w7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogVXNlZCB0byByZXNvbHZlIHRoZVxuICogW2B0b1N0cmluZ1RhZ2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLW9iamVjdC5wcm90b3R5cGUudG9zdHJpbmcpXG4gKiBvZiB2YWx1ZXMuXG4gKi9cbnZhciBuYXRpdmVPYmplY3RUb1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBzeW1Ub1N0cmluZ1RhZyA9IF9TeW1ib2wgPyBfU3ltYm9sLnRvU3RyaW5nVGFnIDogdW5kZWZpbmVkO1xuXG4vKipcbiAqIEEgc3BlY2lhbGl6ZWQgdmVyc2lvbiBvZiBgYmFzZUdldFRhZ2Agd2hpY2ggaWdub3JlcyBgU3ltYm9sLnRvU3RyaW5nVGFnYCB2YWx1ZXMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHF1ZXJ5LlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgcmF3IGB0b1N0cmluZ1RhZ2AuXG4gKi9cbmZ1bmN0aW9uIGdldFJhd1RhZyh2YWx1ZSkge1xuICB2YXIgaXNPd24gPSBoYXNPd25Qcm9wZXJ0eS5jYWxsKHZhbHVlLCBzeW1Ub1N0cmluZ1RhZyksXG4gICAgICB0YWcgPSB2YWx1ZVtzeW1Ub1N0cmluZ1RhZ107XG5cbiAgdHJ5IHtcbiAgICB2YWx1ZVtzeW1Ub1N0cmluZ1RhZ10gPSB1bmRlZmluZWQ7XG4gICAgdmFyIHVubWFza2VkID0gdHJ1ZTtcbiAgfSBjYXRjaCAoZSkge31cblxuICB2YXIgcmVzdWx0ID0gbmF0aXZlT2JqZWN0VG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG4gIGlmICh1bm1hc2tlZCkge1xuICAgIGlmIChpc093bikge1xuICAgICAgdmFsdWVbc3ltVG9TdHJpbmdUYWddID0gdGFnO1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWxldGUgdmFsdWVbc3ltVG9TdHJpbmdUYWddO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG52YXIgX2dldFJhd1RhZyA9IGdldFJhd1RhZztcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvJDEgPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKipcbiAqIFVzZWQgdG8gcmVzb2x2ZSB0aGVcbiAqIFtgdG9TdHJpbmdUYWdgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1vYmplY3QucHJvdG90eXBlLnRvc3RyaW5nKVxuICogb2YgdmFsdWVzLlxuICovXG52YXIgbmF0aXZlT2JqZWN0VG9TdHJpbmckMSA9IG9iamVjdFByb3RvJDEudG9TdHJpbmc7XG5cbi8qKlxuICogQ29udmVydHMgYHZhbHVlYCB0byBhIHN0cmluZyB1c2luZyBgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZ2AuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNvbnZlcnQuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBjb252ZXJ0ZWQgc3RyaW5nLlxuICovXG5mdW5jdGlvbiBvYmplY3RUb1N0cmluZyh2YWx1ZSkge1xuICByZXR1cm4gbmF0aXZlT2JqZWN0VG9TdHJpbmckMS5jYWxsKHZhbHVlKTtcbn1cblxudmFyIF9vYmplY3RUb1N0cmluZyA9IG9iamVjdFRvU3RyaW5nO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgbnVsbFRhZyA9ICdbb2JqZWN0IE51bGxdJyxcbiAgICB1bmRlZmluZWRUYWcgPSAnW29iamVjdCBVbmRlZmluZWRdJztcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgc3ltVG9TdHJpbmdUYWckMSA9IF9TeW1ib2wgPyBfU3ltYm9sLnRvU3RyaW5nVGFnIDogdW5kZWZpbmVkO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBnZXRUYWdgIHdpdGhvdXQgZmFsbGJhY2tzIGZvciBidWdneSBlbnZpcm9ubWVudHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHF1ZXJ5LlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgYHRvU3RyaW5nVGFnYC5cbiAqL1xuZnVuY3Rpb24gYmFzZUdldFRhZyh2YWx1ZSkge1xuICBpZiAodmFsdWUgPT0gbnVsbCkge1xuICAgIHJldHVybiB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gdW5kZWZpbmVkVGFnIDogbnVsbFRhZztcbiAgfVxuICByZXR1cm4gKHN5bVRvU3RyaW5nVGFnJDEgJiYgc3ltVG9TdHJpbmdUYWckMSBpbiBPYmplY3QodmFsdWUpKVxuICAgID8gX2dldFJhd1RhZyh2YWx1ZSlcbiAgICA6IF9vYmplY3RUb1N0cmluZyh2YWx1ZSk7XG59XG5cbnZhciBfYmFzZUdldFRhZyA9IGJhc2VHZXRUYWc7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgdGhlXG4gKiBbbGFuZ3VhZ2UgdHlwZV0oaHR0cDovL3d3dy5lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLWVjbWFzY3JpcHQtbGFuZ3VhZ2UtdHlwZXMpXG4gKiBvZiBgT2JqZWN0YC4gKGUuZy4gYXJyYXlzLCBmdW5jdGlvbnMsIG9iamVjdHMsIHJlZ2V4ZXMsIGBuZXcgTnVtYmVyKDApYCwgYW5kIGBuZXcgU3RyaW5nKCcnKWApXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYW4gb2JqZWN0LCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNPYmplY3Qoe30pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KF8ubm9vcCk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChudWxsKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0KHZhbHVlKSB7XG4gIHZhciB0eXBlID0gdHlwZW9mIHZhbHVlO1xuICByZXR1cm4gdmFsdWUgIT0gbnVsbCAmJiAodHlwZSA9PSAnb2JqZWN0JyB8fCB0eXBlID09ICdmdW5jdGlvbicpO1xufVxuXG52YXIgaXNPYmplY3RfMSA9IGlzT2JqZWN0O1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgYXN5bmNUYWcgPSAnW29iamVjdCBBc3luY0Z1bmN0aW9uXScsXG4gICAgZnVuY1RhZyA9ICdbb2JqZWN0IEZ1bmN0aW9uXScsXG4gICAgZ2VuVGFnID0gJ1tvYmplY3QgR2VuZXJhdG9yRnVuY3Rpb25dJyxcbiAgICBwcm94eVRhZyA9ICdbb2JqZWN0IFByb3h5XSc7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgY2xhc3NpZmllZCBhcyBhIGBGdW5jdGlvbmAgb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgZnVuY3Rpb24sIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0Z1bmN0aW9uKF8pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNGdW5jdGlvbigvYWJjLyk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKHZhbHVlKSB7XG4gIGlmICghaXNPYmplY3RfMSh2YWx1ZSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgLy8gVGhlIHVzZSBvZiBgT2JqZWN0I3RvU3RyaW5nYCBhdm9pZHMgaXNzdWVzIHdpdGggdGhlIGB0eXBlb2ZgIG9wZXJhdG9yXG4gIC8vIGluIFNhZmFyaSA5IHdoaWNoIHJldHVybnMgJ29iamVjdCcgZm9yIHR5cGVkIGFycmF5cyBhbmQgb3RoZXIgY29uc3RydWN0b3JzLlxuICB2YXIgdGFnID0gX2Jhc2VHZXRUYWcodmFsdWUpO1xuICByZXR1cm4gdGFnID09IGZ1bmNUYWcgfHwgdGFnID09IGdlblRhZyB8fCB0YWcgPT0gYXN5bmNUYWcgfHwgdGFnID09IHByb3h5VGFnO1xufVxuXG52YXIgaXNGdW5jdGlvbl8xID0gaXNGdW5jdGlvbjtcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IG92ZXJyZWFjaGluZyBjb3JlLWpzIHNoaW1zLiAqL1xudmFyIGNvcmVKc0RhdGEgPSBfcm9vdFsnX19jb3JlLWpzX3NoYXJlZF9fJ107XG5cbnZhciBfY29yZUpzRGF0YSA9IGNvcmVKc0RhdGE7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBtZXRob2RzIG1hc3F1ZXJhZGluZyBhcyBuYXRpdmUuICovXG52YXIgbWFza1NyY0tleSA9IChmdW5jdGlvbigpIHtcbiAgdmFyIHVpZCA9IC9bXi5dKyQvLmV4ZWMoX2NvcmVKc0RhdGEgJiYgX2NvcmVKc0RhdGEua2V5cyAmJiBfY29yZUpzRGF0YS5rZXlzLklFX1BST1RPIHx8ICcnKTtcbiAgcmV0dXJuIHVpZCA/ICgnU3ltYm9sKHNyYylfMS4nICsgdWlkKSA6ICcnO1xufSgpKTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYGZ1bmNgIGhhcyBpdHMgc291cmNlIG1hc2tlZC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYGZ1bmNgIGlzIG1hc2tlZCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc01hc2tlZChmdW5jKSB7XG4gIHJldHVybiAhIW1hc2tTcmNLZXkgJiYgKG1hc2tTcmNLZXkgaW4gZnVuYyk7XG59XG5cbnZhciBfaXNNYXNrZWQgPSBpc01hc2tlZDtcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIGZ1bmNQcm90byA9IEZ1bmN0aW9uLnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gcmVzb2x2ZSB0aGUgZGVjb21waWxlZCBzb3VyY2Ugb2YgZnVuY3Rpb25zLiAqL1xudmFyIGZ1bmNUb1N0cmluZyA9IGZ1bmNQcm90by50b1N0cmluZztcblxuLyoqXG4gKiBDb252ZXJ0cyBgZnVuY2AgdG8gaXRzIHNvdXJjZSBjb2RlLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBjb252ZXJ0LlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgc291cmNlIGNvZGUuXG4gKi9cbmZ1bmN0aW9uIHRvU291cmNlKGZ1bmMpIHtcbiAgaWYgKGZ1bmMgIT0gbnVsbCkge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gZnVuY1RvU3RyaW5nLmNhbGwoZnVuYyk7XG4gICAgfSBjYXRjaCAoZSkge31cbiAgICB0cnkge1xuICAgICAgcmV0dXJuIChmdW5jICsgJycpO1xuICAgIH0gY2F0Y2ggKGUpIHt9XG4gIH1cbiAgcmV0dXJuICcnO1xufVxuXG52YXIgX3RvU291cmNlID0gdG9Tb3VyY2U7XG5cbi8qKlxuICogVXNlZCB0byBtYXRjaCBgUmVnRXhwYFxuICogW3N5bnRheCBjaGFyYWN0ZXJzXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1wYXR0ZXJucykuXG4gKi9cbnZhciByZVJlZ0V4cENoYXIgPSAvW1xcXFxeJC4qKz8oKVtcXF17fXxdL2c7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBob3N0IGNvbnN0cnVjdG9ycyAoU2FmYXJpKS4gKi9cbnZhciByZUlzSG9zdEN0b3IgPSAvXlxcW29iamVjdCAuKz9Db25zdHJ1Y3RvclxcXSQvO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgZnVuY1Byb3RvJDEgPSBGdW5jdGlvbi5wcm90b3R5cGUsXG4gICAgb2JqZWN0UHJvdG8kMiA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIHJlc29sdmUgdGhlIGRlY29tcGlsZWQgc291cmNlIG9mIGZ1bmN0aW9ucy4gKi9cbnZhciBmdW5jVG9TdHJpbmckMSA9IGZ1bmNQcm90byQxLnRvU3RyaW5nO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSQxID0gb2JqZWN0UHJvdG8kMi5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IGlmIGEgbWV0aG9kIGlzIG5hdGl2ZS4gKi9cbnZhciByZUlzTmF0aXZlID0gUmVnRXhwKCdeJyArXG4gIGZ1bmNUb1N0cmluZyQxLmNhbGwoaGFzT3duUHJvcGVydHkkMSkucmVwbGFjZShyZVJlZ0V4cENoYXIsICdcXFxcJCYnKVxuICAucmVwbGFjZSgvaGFzT3duUHJvcGVydHl8KGZ1bmN0aW9uKS4qPyg/PVxcXFxcXCgpfCBmb3IgLis/KD89XFxcXFxcXSkvZywgJyQxLio/JykgKyAnJCdcbik7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uaXNOYXRpdmVgIHdpdGhvdXQgYmFkIHNoaW0gY2hlY2tzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgbmF0aXZlIGZ1bmN0aW9uLFxuICogIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gYmFzZUlzTmF0aXZlKHZhbHVlKSB7XG4gIGlmICghaXNPYmplY3RfMSh2YWx1ZSkgfHwgX2lzTWFza2VkKHZhbHVlKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICB2YXIgcGF0dGVybiA9IGlzRnVuY3Rpb25fMSh2YWx1ZSkgPyByZUlzTmF0aXZlIDogcmVJc0hvc3RDdG9yO1xuICByZXR1cm4gcGF0dGVybi50ZXN0KF90b1NvdXJjZSh2YWx1ZSkpO1xufVxuXG52YXIgX2Jhc2VJc05hdGl2ZSA9IGJhc2VJc05hdGl2ZTtcblxuLyoqXG4gKiBHZXRzIHRoZSB2YWx1ZSBhdCBga2V5YCBvZiBgb2JqZWN0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IFtvYmplY3RdIFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHByb3BlcnR5IHRvIGdldC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBwcm9wZXJ0eSB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gZ2V0VmFsdWUob2JqZWN0LCBrZXkpIHtcbiAgcmV0dXJuIG9iamVjdCA9PSBudWxsID8gdW5kZWZpbmVkIDogb2JqZWN0W2tleV07XG59XG5cbnZhciBfZ2V0VmFsdWUgPSBnZXRWYWx1ZTtcblxuLyoqXG4gKiBHZXRzIHRoZSBuYXRpdmUgZnVuY3Rpb24gYXQgYGtleWAgb2YgYG9iamVjdGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgbWV0aG9kIHRvIGdldC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBmdW5jdGlvbiBpZiBpdCdzIG5hdGl2ZSwgZWxzZSBgdW5kZWZpbmVkYC5cbiAqL1xuZnVuY3Rpb24gZ2V0TmF0aXZlKG9iamVjdCwga2V5KSB7XG4gIHZhciB2YWx1ZSA9IF9nZXRWYWx1ZShvYmplY3QsIGtleSk7XG4gIHJldHVybiBfYmFzZUlzTmF0aXZlKHZhbHVlKSA/IHZhbHVlIDogdW5kZWZpbmVkO1xufVxuXG52YXIgX2dldE5hdGl2ZSA9IGdldE5hdGl2ZTtcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgdGhhdCBhcmUgdmVyaWZpZWQgdG8gYmUgbmF0aXZlLiAqL1xudmFyIE1hcCA9IF9nZXROYXRpdmUoX3Jvb3QsICdNYXAnKTtcblxudmFyIF9NYXAgPSBNYXA7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIHRoYXQgYXJlIHZlcmlmaWVkIHRvIGJlIG5hdGl2ZS4gKi9cbnZhciBuYXRpdmVDcmVhdGUgPSBfZ2V0TmF0aXZlKE9iamVjdCwgJ2NyZWF0ZScpO1xuXG52YXIgX25hdGl2ZUNyZWF0ZSA9IG5hdGl2ZUNyZWF0ZTtcblxuLyoqXG4gKiBSZW1vdmVzIGFsbCBrZXktdmFsdWUgZW50cmllcyBmcm9tIHRoZSBoYXNoLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBjbGVhclxuICogQG1lbWJlck9mIEhhc2hcbiAqL1xuZnVuY3Rpb24gaGFzaENsZWFyKCkge1xuICB0aGlzLl9fZGF0YV9fID0gX25hdGl2ZUNyZWF0ZSA/IF9uYXRpdmVDcmVhdGUobnVsbCkgOiB7fTtcbiAgdGhpcy5zaXplID0gMDtcbn1cblxudmFyIF9oYXNoQ2xlYXIgPSBoYXNoQ2xlYXI7XG5cbi8qKlxuICogUmVtb3ZlcyBga2V5YCBhbmQgaXRzIHZhbHVlIGZyb20gdGhlIGhhc2guXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGRlbGV0ZVxuICogQG1lbWJlck9mIEhhc2hcbiAqIEBwYXJhbSB7T2JqZWN0fSBoYXNoIFRoZSBoYXNoIHRvIG1vZGlmeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gcmVtb3ZlLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBlbnRyeSB3YXMgcmVtb3ZlZCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBoYXNoRGVsZXRlKGtleSkge1xuICB2YXIgcmVzdWx0ID0gdGhpcy5oYXMoa2V5KSAmJiBkZWxldGUgdGhpcy5fX2RhdGFfX1trZXldO1xuICB0aGlzLnNpemUgLT0gcmVzdWx0ID8gMSA6IDA7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbnZhciBfaGFzaERlbGV0ZSA9IGhhc2hEZWxldGU7XG5cbi8qKiBVc2VkIHRvIHN0YW5kLWluIGZvciBgdW5kZWZpbmVkYCBoYXNoIHZhbHVlcy4gKi9cbnZhciBIQVNIX1VOREVGSU5FRCA9ICdfX2xvZGFzaF9oYXNoX3VuZGVmaW5lZF9fJztcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvJDMgPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSQyID0gb2JqZWN0UHJvdG8kMy5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBHZXRzIHRoZSBoYXNoIHZhbHVlIGZvciBga2V5YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgZ2V0XG4gKiBAbWVtYmVyT2YgSGFzaFxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byBnZXQuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgZW50cnkgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIGhhc2hHZXQoa2V5KSB7XG4gIHZhciBkYXRhID0gdGhpcy5fX2RhdGFfXztcbiAgaWYgKF9uYXRpdmVDcmVhdGUpIHtcbiAgICB2YXIgcmVzdWx0ID0gZGF0YVtrZXldO1xuICAgIHJldHVybiByZXN1bHQgPT09IEhBU0hfVU5ERUZJTkVEID8gdW5kZWZpbmVkIDogcmVzdWx0O1xuICB9XG4gIHJldHVybiBoYXNPd25Qcm9wZXJ0eSQyLmNhbGwoZGF0YSwga2V5KSA/IGRhdGFba2V5XSA6IHVuZGVmaW5lZDtcbn1cblxudmFyIF9oYXNoR2V0ID0gaGFzaEdldDtcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvJDQgPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSQzID0gb2JqZWN0UHJvdG8kNC5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYSBoYXNoIHZhbHVlIGZvciBga2V5YCBleGlzdHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGhhc1xuICogQG1lbWJlck9mIEhhc2hcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgZW50cnkgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYW4gZW50cnkgZm9yIGBrZXlgIGV4aXN0cywgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBoYXNoSGFzKGtleSkge1xuICB2YXIgZGF0YSA9IHRoaXMuX19kYXRhX187XG4gIHJldHVybiBfbmF0aXZlQ3JlYXRlID8gKGRhdGFba2V5XSAhPT0gdW5kZWZpbmVkKSA6IGhhc093blByb3BlcnR5JDMuY2FsbChkYXRhLCBrZXkpO1xufVxuXG52YXIgX2hhc2hIYXMgPSBoYXNoSGFzO1xuXG4vKiogVXNlZCB0byBzdGFuZC1pbiBmb3IgYHVuZGVmaW5lZGAgaGFzaCB2YWx1ZXMuICovXG52YXIgSEFTSF9VTkRFRklORUQkMSA9ICdfX2xvZGFzaF9oYXNoX3VuZGVmaW5lZF9fJztcblxuLyoqXG4gKiBTZXRzIHRoZSBoYXNoIGBrZXlgIHRvIGB2YWx1ZWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIHNldFxuICogQG1lbWJlck9mIEhhc2hcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gc2V0LlxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gc2V0LlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgaGFzaCBpbnN0YW5jZS5cbiAqL1xuZnVuY3Rpb24gaGFzaFNldChrZXksIHZhbHVlKSB7XG4gIHZhciBkYXRhID0gdGhpcy5fX2RhdGFfXztcbiAgdGhpcy5zaXplICs9IHRoaXMuaGFzKGtleSkgPyAwIDogMTtcbiAgZGF0YVtrZXldID0gKF9uYXRpdmVDcmVhdGUgJiYgdmFsdWUgPT09IHVuZGVmaW5lZCkgPyBIQVNIX1VOREVGSU5FRCQxIDogdmFsdWU7XG4gIHJldHVybiB0aGlzO1xufVxuXG52YXIgX2hhc2hTZXQgPSBoYXNoU2V0O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBoYXNoIG9iamVjdC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge0FycmF5fSBbZW50cmllc10gVGhlIGtleS12YWx1ZSBwYWlycyB0byBjYWNoZS5cbiAqL1xuZnVuY3Rpb24gSGFzaChlbnRyaWVzKSB7XG4gIHZhciB0aGlzJDEgPSB0aGlzO1xuXG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gZW50cmllcyA9PSBudWxsID8gMCA6IGVudHJpZXMubGVuZ3RoO1xuXG4gIHRoaXMuY2xlYXIoKTtcbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICB2YXIgZW50cnkgPSBlbnRyaWVzW2luZGV4XTtcbiAgICB0aGlzJDEuc2V0KGVudHJ5WzBdLCBlbnRyeVsxXSk7XG4gIH1cbn1cblxuLy8gQWRkIG1ldGhvZHMgdG8gYEhhc2hgLlxuSGFzaC5wcm90b3R5cGUuY2xlYXIgPSBfaGFzaENsZWFyO1xuSGFzaC5wcm90b3R5cGVbJ2RlbGV0ZSddID0gX2hhc2hEZWxldGU7XG5IYXNoLnByb3RvdHlwZS5nZXQgPSBfaGFzaEdldDtcbkhhc2gucHJvdG90eXBlLmhhcyA9IF9oYXNoSGFzO1xuSGFzaC5wcm90b3R5cGUuc2V0ID0gX2hhc2hTZXQ7XG5cbnZhciBfSGFzaCA9IEhhc2g7XG5cbi8qKlxuICogUmVtb3ZlcyBhbGwga2V5LXZhbHVlIGVudHJpZXMgZnJvbSB0aGUgbWFwLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBjbGVhclxuICogQG1lbWJlck9mIE1hcENhY2hlXG4gKi9cbmZ1bmN0aW9uIG1hcENhY2hlQ2xlYXIoKSB7XG4gIHRoaXMuc2l6ZSA9IDA7XG4gIHRoaXMuX19kYXRhX18gPSB7XG4gICAgJ2hhc2gnOiBuZXcgX0hhc2gsXG4gICAgJ21hcCc6IG5ldyAoX01hcCB8fCBfTGlzdENhY2hlKSxcbiAgICAnc3RyaW5nJzogbmV3IF9IYXNoXG4gIH07XG59XG5cbnZhciBfbWFwQ2FjaGVDbGVhciA9IG1hcENhY2hlQ2xlYXI7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgc3VpdGFibGUgZm9yIHVzZSBhcyB1bmlxdWUgb2JqZWN0IGtleS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBzdWl0YWJsZSwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc0tleWFibGUodmFsdWUpIHtcbiAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsdWU7XG4gIHJldHVybiAodHlwZSA9PSAnc3RyaW5nJyB8fCB0eXBlID09ICdudW1iZXInIHx8IHR5cGUgPT0gJ3N5bWJvbCcgfHwgdHlwZSA9PSAnYm9vbGVhbicpXG4gICAgPyAodmFsdWUgIT09ICdfX3Byb3RvX18nKVxuICAgIDogKHZhbHVlID09PSBudWxsKTtcbn1cblxudmFyIF9pc0tleWFibGUgPSBpc0tleWFibGU7XG5cbi8qKlxuICogR2V0cyB0aGUgZGF0YSBmb3IgYG1hcGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBtYXAgVGhlIG1hcCB0byBxdWVyeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIHJlZmVyZW5jZSBrZXkuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgbWFwIGRhdGEuXG4gKi9cbmZ1bmN0aW9uIGdldE1hcERhdGEobWFwLCBrZXkpIHtcbiAgdmFyIGRhdGEgPSBtYXAuX19kYXRhX187XG4gIHJldHVybiBfaXNLZXlhYmxlKGtleSlcbiAgICA/IGRhdGFbdHlwZW9mIGtleSA9PSAnc3RyaW5nJyA/ICdzdHJpbmcnIDogJ2hhc2gnXVxuICAgIDogZGF0YS5tYXA7XG59XG5cbnZhciBfZ2V0TWFwRGF0YSA9IGdldE1hcERhdGE7XG5cbi8qKlxuICogUmVtb3ZlcyBga2V5YCBhbmQgaXRzIHZhbHVlIGZyb20gdGhlIG1hcC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgZGVsZXRlXG4gKiBAbWVtYmVyT2YgTWFwQ2FjaGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gcmVtb3ZlLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBlbnRyeSB3YXMgcmVtb3ZlZCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBtYXBDYWNoZURlbGV0ZShrZXkpIHtcbiAgdmFyIHJlc3VsdCA9IF9nZXRNYXBEYXRhKHRoaXMsIGtleSlbJ2RlbGV0ZSddKGtleSk7XG4gIHRoaXMuc2l6ZSAtPSByZXN1bHQgPyAxIDogMDtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxudmFyIF9tYXBDYWNoZURlbGV0ZSA9IG1hcENhY2hlRGVsZXRlO1xuXG4vKipcbiAqIEdldHMgdGhlIG1hcCB2YWx1ZSBmb3IgYGtleWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGdldFxuICogQG1lbWJlck9mIE1hcENhY2hlXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIGdldC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBlbnRyeSB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gbWFwQ2FjaGVHZXQoa2V5KSB7XG4gIHJldHVybiBfZ2V0TWFwRGF0YSh0aGlzLCBrZXkpLmdldChrZXkpO1xufVxuXG52YXIgX21hcENhY2hlR2V0ID0gbWFwQ2FjaGVHZXQ7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGEgbWFwIHZhbHVlIGZvciBga2V5YCBleGlzdHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGhhc1xuICogQG1lbWJlck9mIE1hcENhY2hlXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIGVudHJ5IHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGFuIGVudHJ5IGZvciBga2V5YCBleGlzdHMsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gbWFwQ2FjaGVIYXMoa2V5KSB7XG4gIHJldHVybiBfZ2V0TWFwRGF0YSh0aGlzLCBrZXkpLmhhcyhrZXkpO1xufVxuXG52YXIgX21hcENhY2hlSGFzID0gbWFwQ2FjaGVIYXM7XG5cbi8qKlxuICogU2V0cyB0aGUgbWFwIGBrZXlgIHRvIGB2YWx1ZWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIHNldFxuICogQG1lbWJlck9mIE1hcENhY2hlXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIHNldC5cbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHNldC5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIG1hcCBjYWNoZSBpbnN0YW5jZS5cbiAqL1xuZnVuY3Rpb24gbWFwQ2FjaGVTZXQoa2V5LCB2YWx1ZSkge1xuICB2YXIgZGF0YSA9IF9nZXRNYXBEYXRhKHRoaXMsIGtleSksXG4gICAgICBzaXplID0gZGF0YS5zaXplO1xuXG4gIGRhdGEuc2V0KGtleSwgdmFsdWUpO1xuICB0aGlzLnNpemUgKz0gZGF0YS5zaXplID09IHNpemUgPyAwIDogMTtcbiAgcmV0dXJuIHRoaXM7XG59XG5cbnZhciBfbWFwQ2FjaGVTZXQgPSBtYXBDYWNoZVNldDtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbWFwIGNhY2hlIG9iamVjdCB0byBzdG9yZSBrZXktdmFsdWUgcGFpcnMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtBcnJheX0gW2VudHJpZXNdIFRoZSBrZXktdmFsdWUgcGFpcnMgdG8gY2FjaGUuXG4gKi9cbmZ1bmN0aW9uIE1hcENhY2hlKGVudHJpZXMpIHtcbiAgdmFyIHRoaXMkMSA9IHRoaXM7XG5cbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBlbnRyaWVzID09IG51bGwgPyAwIDogZW50cmllcy5sZW5ndGg7XG5cbiAgdGhpcy5jbGVhcigpO1xuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIHZhciBlbnRyeSA9IGVudHJpZXNbaW5kZXhdO1xuICAgIHRoaXMkMS5zZXQoZW50cnlbMF0sIGVudHJ5WzFdKTtcbiAgfVxufVxuXG4vLyBBZGQgbWV0aG9kcyB0byBgTWFwQ2FjaGVgLlxuTWFwQ2FjaGUucHJvdG90eXBlLmNsZWFyID0gX21hcENhY2hlQ2xlYXI7XG5NYXBDYWNoZS5wcm90b3R5cGVbJ2RlbGV0ZSddID0gX21hcENhY2hlRGVsZXRlO1xuTWFwQ2FjaGUucHJvdG90eXBlLmdldCA9IF9tYXBDYWNoZUdldDtcbk1hcENhY2hlLnByb3RvdHlwZS5oYXMgPSBfbWFwQ2FjaGVIYXM7XG5NYXBDYWNoZS5wcm90b3R5cGUuc2V0ID0gX21hcENhY2hlU2V0O1xuXG52YXIgX01hcENhY2hlID0gTWFwQ2FjaGU7XG5cbi8qKiBVc2VkIGFzIHRoZSBzaXplIHRvIGVuYWJsZSBsYXJnZSBhcnJheSBvcHRpbWl6YXRpb25zLiAqL1xudmFyIExBUkdFX0FSUkFZX1NJWkUgPSAyMDA7XG5cbi8qKlxuICogU2V0cyB0aGUgc3RhY2sgYGtleWAgdG8gYHZhbHVlYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgc2V0XG4gKiBAbWVtYmVyT2YgU3RhY2tcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gc2V0LlxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gc2V0LlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgc3RhY2sgY2FjaGUgaW5zdGFuY2UuXG4gKi9cbmZ1bmN0aW9uIHN0YWNrU2V0KGtleSwgdmFsdWUpIHtcbiAgdmFyIGRhdGEgPSB0aGlzLl9fZGF0YV9fO1xuICBpZiAoZGF0YSBpbnN0YW5jZW9mIF9MaXN0Q2FjaGUpIHtcbiAgICB2YXIgcGFpcnMgPSBkYXRhLl9fZGF0YV9fO1xuICAgIGlmICghX01hcCB8fCAocGFpcnMubGVuZ3RoIDwgTEFSR0VfQVJSQVlfU0laRSAtIDEpKSB7XG4gICAgICBwYWlycy5wdXNoKFtrZXksIHZhbHVlXSk7XG4gICAgICB0aGlzLnNpemUgPSArK2RhdGEuc2l6ZTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBkYXRhID0gdGhpcy5fX2RhdGFfXyA9IG5ldyBfTWFwQ2FjaGUocGFpcnMpO1xuICB9XG4gIGRhdGEuc2V0KGtleSwgdmFsdWUpO1xuICB0aGlzLnNpemUgPSBkYXRhLnNpemU7XG4gIHJldHVybiB0aGlzO1xufVxuXG52YXIgX3N0YWNrU2V0ID0gc3RhY2tTZXQ7XG5cbi8qKlxuICogQ3JlYXRlcyBhIHN0YWNrIGNhY2hlIG9iamVjdCB0byBzdG9yZSBrZXktdmFsdWUgcGFpcnMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtBcnJheX0gW2VudHJpZXNdIFRoZSBrZXktdmFsdWUgcGFpcnMgdG8gY2FjaGUuXG4gKi9cbmZ1bmN0aW9uIFN0YWNrKGVudHJpZXMpIHtcbiAgdmFyIGRhdGEgPSB0aGlzLl9fZGF0YV9fID0gbmV3IF9MaXN0Q2FjaGUoZW50cmllcyk7XG4gIHRoaXMuc2l6ZSA9IGRhdGEuc2l6ZTtcbn1cblxuLy8gQWRkIG1ldGhvZHMgdG8gYFN0YWNrYC5cblN0YWNrLnByb3RvdHlwZS5jbGVhciA9IF9zdGFja0NsZWFyO1xuU3RhY2sucHJvdG90eXBlWydkZWxldGUnXSA9IF9zdGFja0RlbGV0ZTtcblN0YWNrLnByb3RvdHlwZS5nZXQgPSBfc3RhY2tHZXQ7XG5TdGFjay5wcm90b3R5cGUuaGFzID0gX3N0YWNrSGFzO1xuU3RhY2sucHJvdG90eXBlLnNldCA9IF9zdGFja1NldDtcblxudmFyIF9TdGFjayA9IFN0YWNrO1xuXG4vKipcbiAqIEEgc3BlY2lhbGl6ZWQgdmVyc2lvbiBvZiBgXy5mb3JFYWNoYCBmb3IgYXJyYXlzIHdpdGhvdXQgc3VwcG9ydCBmb3JcbiAqIGl0ZXJhdGVlIHNob3J0aGFuZHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl9IFthcnJheV0gVGhlIGFycmF5IHRvIGl0ZXJhdGUgb3Zlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdGVlIFRoZSBmdW5jdGlvbiBpbnZva2VkIHBlciBpdGVyYXRpb24uXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgYGFycmF5YC5cbiAqL1xuZnVuY3Rpb24gYXJyYXlFYWNoKGFycmF5LCBpdGVyYXRlZSkge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IGFycmF5ID09IG51bGwgPyAwIDogYXJyYXkubGVuZ3RoO1xuXG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgaWYgKGl0ZXJhdGVlKGFycmF5W2luZGV4XSwgaW5kZXgsIGFycmF5KSA9PT0gZmFsc2UpIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gYXJyYXk7XG59XG5cbnZhciBfYXJyYXlFYWNoID0gYXJyYXlFYWNoO1xuXG52YXIgZGVmaW5lUHJvcGVydHkgPSAoZnVuY3Rpb24oKSB7XG4gIHRyeSB7XG4gICAgdmFyIGZ1bmMgPSBfZ2V0TmF0aXZlKE9iamVjdCwgJ2RlZmluZVByb3BlcnR5Jyk7XG4gICAgZnVuYyh7fSwgJycsIHt9KTtcbiAgICByZXR1cm4gZnVuYztcbiAgfSBjYXRjaCAoZSkge31cbn0oKSk7XG5cbnZhciBfZGVmaW5lUHJvcGVydHkgPSBkZWZpbmVQcm9wZXJ0eTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgYXNzaWduVmFsdWVgIGFuZCBgYXNzaWduTWVyZ2VWYWx1ZWAgd2l0aG91dFxuICogdmFsdWUgY2hlY2tzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gbW9kaWZ5LlxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBwcm9wZXJ0eSB0byBhc3NpZ24uXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBhc3NpZ24uXG4gKi9cbmZ1bmN0aW9uIGJhc2VBc3NpZ25WYWx1ZShvYmplY3QsIGtleSwgdmFsdWUpIHtcbiAgaWYgKGtleSA9PSAnX19wcm90b19fJyAmJiBfZGVmaW5lUHJvcGVydHkpIHtcbiAgICBfZGVmaW5lUHJvcGVydHkob2JqZWN0LCBrZXksIHtcbiAgICAgICdjb25maWd1cmFibGUnOiB0cnVlLFxuICAgICAgJ2VudW1lcmFibGUnOiB0cnVlLFxuICAgICAgJ3ZhbHVlJzogdmFsdWUsXG4gICAgICAnd3JpdGFibGUnOiB0cnVlXG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgb2JqZWN0W2tleV0gPSB2YWx1ZTtcbiAgfVxufVxuXG52YXIgX2Jhc2VBc3NpZ25WYWx1ZSA9IGJhc2VBc3NpZ25WYWx1ZTtcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvJDUgPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSQ0ID0gb2JqZWN0UHJvdG8kNS5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBBc3NpZ25zIGB2YWx1ZWAgdG8gYGtleWAgb2YgYG9iamVjdGAgaWYgdGhlIGV4aXN0aW5nIHZhbHVlIGlzIG5vdCBlcXVpdmFsZW50XG4gKiB1c2luZyBbYFNhbWVWYWx1ZVplcm9gXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1zYW1ldmFsdWV6ZXJvKVxuICogZm9yIGVxdWFsaXR5IGNvbXBhcmlzb25zLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gbW9kaWZ5LlxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBwcm9wZXJ0eSB0byBhc3NpZ24uXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBhc3NpZ24uXG4gKi9cbmZ1bmN0aW9uIGFzc2lnblZhbHVlKG9iamVjdCwga2V5LCB2YWx1ZSkge1xuICB2YXIgb2JqVmFsdWUgPSBvYmplY3Rba2V5XTtcbiAgaWYgKCEoaGFzT3duUHJvcGVydHkkNC5jYWxsKG9iamVjdCwga2V5KSAmJiBlcV8xKG9ialZhbHVlLCB2YWx1ZSkpIHx8XG4gICAgICAodmFsdWUgPT09IHVuZGVmaW5lZCAmJiAhKGtleSBpbiBvYmplY3QpKSkge1xuICAgIF9iYXNlQXNzaWduVmFsdWUob2JqZWN0LCBrZXksIHZhbHVlKTtcbiAgfVxufVxuXG52YXIgX2Fzc2lnblZhbHVlID0gYXNzaWduVmFsdWU7XG5cbi8qKlxuICogQ29waWVzIHByb3BlcnRpZXMgb2YgYHNvdXJjZWAgdG8gYG9iamVjdGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBzb3VyY2UgVGhlIG9iamVjdCB0byBjb3B5IHByb3BlcnRpZXMgZnJvbS5cbiAqIEBwYXJhbSB7QXJyYXl9IHByb3BzIFRoZSBwcm9wZXJ0eSBpZGVudGlmaWVycyB0byBjb3B5LlxuICogQHBhcmFtIHtPYmplY3R9IFtvYmplY3Q9e31dIFRoZSBvYmplY3QgdG8gY29weSBwcm9wZXJ0aWVzIHRvLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2N1c3RvbWl6ZXJdIFRoZSBmdW5jdGlvbiB0byBjdXN0b21pemUgY29waWVkIHZhbHVlcy5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgYG9iamVjdGAuXG4gKi9cbmZ1bmN0aW9uIGNvcHlPYmplY3Qoc291cmNlLCBwcm9wcywgb2JqZWN0LCBjdXN0b21pemVyKSB7XG4gIHZhciBpc05ldyA9ICFvYmplY3Q7XG4gIG9iamVjdCB8fCAob2JqZWN0ID0ge30pO1xuXG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gcHJvcHMubGVuZ3RoO1xuXG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgdmFyIGtleSA9IHByb3BzW2luZGV4XTtcblxuICAgIHZhciBuZXdWYWx1ZSA9IGN1c3RvbWl6ZXJcbiAgICAgID8gY3VzdG9taXplcihvYmplY3Rba2V5XSwgc291cmNlW2tleV0sIGtleSwgb2JqZWN0LCBzb3VyY2UpXG4gICAgICA6IHVuZGVmaW5lZDtcblxuICAgIGlmIChuZXdWYWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBuZXdWYWx1ZSA9IHNvdXJjZVtrZXldO1xuICAgIH1cbiAgICBpZiAoaXNOZXcpIHtcbiAgICAgIF9iYXNlQXNzaWduVmFsdWUob2JqZWN0LCBrZXksIG5ld1ZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgX2Fzc2lnblZhbHVlKG9iamVjdCwga2V5LCBuZXdWYWx1ZSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBvYmplY3Q7XG59XG5cbnZhciBfY29weU9iamVjdCA9IGNvcHlPYmplY3Q7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8udGltZXNgIHdpdGhvdXQgc3VwcG9ydCBmb3IgaXRlcmF0ZWUgc2hvcnRoYW5kc1xuICogb3IgbWF4IGFycmF5IGxlbmd0aCBjaGVja3MuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7bnVtYmVyfSBuIFRoZSBudW1iZXIgb2YgdGltZXMgdG8gaW52b2tlIGBpdGVyYXRlZWAuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRlZSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiByZXN1bHRzLlxuICovXG5mdW5jdGlvbiBiYXNlVGltZXMobiwgaXRlcmF0ZWUpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICByZXN1bHQgPSBBcnJheShuKTtcblxuICB3aGlsZSAoKytpbmRleCA8IG4pIHtcbiAgICByZXN1bHRbaW5kZXhdID0gaXRlcmF0ZWUoaW5kZXgpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbnZhciBfYmFzZVRpbWVzID0gYmFzZVRpbWVzO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIG9iamVjdC1saWtlLiBBIHZhbHVlIGlzIG9iamVjdC1saWtlIGlmIGl0J3Mgbm90IGBudWxsYFxuICogYW5kIGhhcyBhIGB0eXBlb2ZgIHJlc3VsdCBvZiBcIm9iamVjdFwiLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIG9iamVjdC1saWtlLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKHt9KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKF8ubm9vcCk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKG51bGwpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3RMaWtlKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSAhPSBudWxsICYmIHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0Jztcbn1cblxudmFyIGlzT2JqZWN0TGlrZV8xID0gaXNPYmplY3RMaWtlO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgYXJnc1RhZyA9ICdbb2JqZWN0IEFyZ3VtZW50c10nO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmlzQXJndW1lbnRzYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhbiBgYXJndW1lbnRzYCBvYmplY3QsXG4gKi9cbmZ1bmN0aW9uIGJhc2VJc0FyZ3VtZW50cyh2YWx1ZSkge1xuICByZXR1cm4gaXNPYmplY3RMaWtlXzEodmFsdWUpICYmIF9iYXNlR2V0VGFnKHZhbHVlKSA9PSBhcmdzVGFnO1xufVxuXG52YXIgX2Jhc2VJc0FyZ3VtZW50cyA9IGJhc2VJc0FyZ3VtZW50cztcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvJDYgPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSQ1ID0gb2JqZWN0UHJvdG8kNi5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgcHJvcGVydHlJc0VudW1lcmFibGUgPSBvYmplY3RQcm90byQ2LnByb3BlcnR5SXNFbnVtZXJhYmxlO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGxpa2VseSBhbiBgYXJndW1lbnRzYCBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYW4gYGFyZ3VtZW50c2Agb2JqZWN0LFxuICogIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0FyZ3VtZW50cyhmdW5jdGlvbigpIHsgcmV0dXJuIGFyZ3VtZW50czsgfSgpKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQXJndW1lbnRzKFsxLCAyLCAzXSk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG52YXIgaXNBcmd1bWVudHMgPSBfYmFzZUlzQXJndW1lbnRzKGZ1bmN0aW9uKCkgeyByZXR1cm4gYXJndW1lbnRzOyB9KCkpID8gX2Jhc2VJc0FyZ3VtZW50cyA6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiBpc09iamVjdExpa2VfMSh2YWx1ZSkgJiYgaGFzT3duUHJvcGVydHkkNS5jYWxsKHZhbHVlLCAnY2FsbGVlJykgJiZcbiAgICAhcHJvcGVydHlJc0VudW1lcmFibGUuY2FsbCh2YWx1ZSwgJ2NhbGxlZScpO1xufTtcblxudmFyIGlzQXJndW1lbnRzXzEgPSBpc0FyZ3VtZW50cztcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBjbGFzc2lmaWVkIGFzIGFuIGBBcnJheWAgb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFuIGFycmF5LCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNBcnJheShbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcnJheShkb2N1bWVudC5ib2R5LmNoaWxkcmVuKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc0FycmF5KCdhYmMnKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc0FycmF5KF8ubm9vcCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXk7XG5cbnZhciBpc0FycmF5XzEgPSBpc0FycmF5O1xuXG4vKipcbiAqIFRoaXMgbWV0aG9kIHJldHVybnMgYGZhbHNlYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMTMuMFxuICogQGNhdGVnb3J5IFV0aWxcbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8udGltZXMoMiwgXy5zdHViRmFsc2UpO1xuICogLy8gPT4gW2ZhbHNlLCBmYWxzZV1cbiAqL1xuZnVuY3Rpb24gc3R1YkZhbHNlKCkge1xuICByZXR1cm4gZmFsc2U7XG59XG5cbnZhciBzdHViRmFsc2VfMSA9IHN0dWJGYWxzZTtcblxudmFyIGlzQnVmZmVyXzEgPSBjcmVhdGVDb21tb25qc01vZHVsZShmdW5jdGlvbiAobW9kdWxlLCBleHBvcnRzKSB7XG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYGV4cG9ydHNgLiAqL1xudmFyIGZyZWVFeHBvcnRzID0gJ29iamVjdCcgPT0gJ29iamVjdCcgJiYgZXhwb3J0cyAmJiAhZXhwb3J0cy5ub2RlVHlwZSAmJiBleHBvcnRzO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYG1vZHVsZWAuICovXG52YXIgZnJlZU1vZHVsZSA9IGZyZWVFeHBvcnRzICYmICdvYmplY3QnID09ICdvYmplY3QnICYmIG1vZHVsZSAmJiAhbW9kdWxlLm5vZGVUeXBlICYmIG1vZHVsZTtcblxuLyoqIERldGVjdCB0aGUgcG9wdWxhciBDb21tb25KUyBleHRlbnNpb24gYG1vZHVsZS5leHBvcnRzYC4gKi9cbnZhciBtb2R1bGVFeHBvcnRzID0gZnJlZU1vZHVsZSAmJiBmcmVlTW9kdWxlLmV4cG9ydHMgPT09IGZyZWVFeHBvcnRzO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBCdWZmZXIgPSBtb2R1bGVFeHBvcnRzID8gX3Jvb3QuQnVmZmVyIDogdW5kZWZpbmVkO1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyBmb3IgdGhvc2Ugd2l0aCB0aGUgc2FtZSBuYW1lIGFzIG90aGVyIGBsb2Rhc2hgIG1ldGhvZHMuICovXG52YXIgbmF0aXZlSXNCdWZmZXIgPSBCdWZmZXIgPyBCdWZmZXIuaXNCdWZmZXIgOiB1bmRlZmluZWQ7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSBidWZmZXIuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjMuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBidWZmZXIsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0J1ZmZlcihuZXcgQnVmZmVyKDIpKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQnVmZmVyKG5ldyBVaW50OEFycmF5KDIpKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbnZhciBpc0J1ZmZlciA9IG5hdGl2ZUlzQnVmZmVyIHx8IHN0dWJGYWxzZV8xO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGlzQnVmZmVyO1xufSk7XG5cbi8qKiBVc2VkIGFzIHJlZmVyZW5jZXMgZm9yIHZhcmlvdXMgYE51bWJlcmAgY29uc3RhbnRzLiAqL1xudmFyIE1BWF9TQUZFX0lOVEVHRVIgPSA5MDA3MTk5MjU0NzQwOTkxO1xuXG4vKiogVXNlZCB0byBkZXRlY3QgdW5zaWduZWQgaW50ZWdlciB2YWx1ZXMuICovXG52YXIgcmVJc1VpbnQgPSAvXig/OjB8WzEtOV1cXGQqKSQvO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgdmFsaWQgYXJyYXktbGlrZSBpbmRleC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcGFyYW0ge251bWJlcn0gW2xlbmd0aD1NQVhfU0FGRV9JTlRFR0VSXSBUaGUgdXBwZXIgYm91bmRzIG9mIGEgdmFsaWQgaW5kZXguXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHZhbGlkIGluZGV4LCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGlzSW5kZXgodmFsdWUsIGxlbmd0aCkge1xuICBsZW5ndGggPSBsZW5ndGggPT0gbnVsbCA/IE1BWF9TQUZFX0lOVEVHRVIgOiBsZW5ndGg7XG4gIHJldHVybiAhIWxlbmd0aCAmJlxuICAgICh0eXBlb2YgdmFsdWUgPT0gJ251bWJlcicgfHwgcmVJc1VpbnQudGVzdCh2YWx1ZSkpICYmXG4gICAgKHZhbHVlID4gLTEgJiYgdmFsdWUgJSAxID09IDAgJiYgdmFsdWUgPCBsZW5ndGgpO1xufVxuXG52YXIgX2lzSW5kZXggPSBpc0luZGV4O1xuXG4vKiogVXNlZCBhcyByZWZlcmVuY2VzIGZvciB2YXJpb3VzIGBOdW1iZXJgIGNvbnN0YW50cy4gKi9cbnZhciBNQVhfU0FGRV9JTlRFR0VSJDEgPSA5MDA3MTk5MjU0NzQwOTkxO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgdmFsaWQgYXJyYXktbGlrZSBsZW5ndGguXG4gKlxuICogKipOb3RlOioqIFRoaXMgbWV0aG9kIGlzIGxvb3NlbHkgYmFzZWQgb25cbiAqIFtgVG9MZW5ndGhgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy10b2xlbmd0aCkuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSB2YWxpZCBsZW5ndGgsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0xlbmd0aCgzKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzTGVuZ3RoKE51bWJlci5NSU5fVkFMVUUpO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzTGVuZ3RoKEluZmluaXR5KTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc0xlbmd0aCgnMycpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNMZW5ndGgodmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAnbnVtYmVyJyAmJlxuICAgIHZhbHVlID4gLTEgJiYgdmFsdWUgJSAxID09IDAgJiYgdmFsdWUgPD0gTUFYX1NBRkVfSU5URUdFUiQxO1xufVxuXG52YXIgaXNMZW5ndGhfMSA9IGlzTGVuZ3RoO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgYXJnc1RhZyQxID0gJ1tvYmplY3QgQXJndW1lbnRzXScsXG4gICAgYXJyYXlUYWcgPSAnW29iamVjdCBBcnJheV0nLFxuICAgIGJvb2xUYWcgPSAnW29iamVjdCBCb29sZWFuXScsXG4gICAgZGF0ZVRhZyA9ICdbb2JqZWN0IERhdGVdJyxcbiAgICBlcnJvclRhZyA9ICdbb2JqZWN0IEVycm9yXScsXG4gICAgZnVuY1RhZyQxID0gJ1tvYmplY3QgRnVuY3Rpb25dJyxcbiAgICBtYXBUYWcgPSAnW29iamVjdCBNYXBdJyxcbiAgICBudW1iZXJUYWcgPSAnW29iamVjdCBOdW1iZXJdJyxcbiAgICBvYmplY3RUYWcgPSAnW29iamVjdCBPYmplY3RdJyxcbiAgICByZWdleHBUYWcgPSAnW29iamVjdCBSZWdFeHBdJyxcbiAgICBzZXRUYWcgPSAnW29iamVjdCBTZXRdJyxcbiAgICBzdHJpbmdUYWcgPSAnW29iamVjdCBTdHJpbmddJyxcbiAgICB3ZWFrTWFwVGFnID0gJ1tvYmplY3QgV2Vha01hcF0nO1xuXG52YXIgYXJyYXlCdWZmZXJUYWcgPSAnW29iamVjdCBBcnJheUJ1ZmZlcl0nLFxuICAgIGRhdGFWaWV3VGFnID0gJ1tvYmplY3QgRGF0YVZpZXddJyxcbiAgICBmbG9hdDMyVGFnID0gJ1tvYmplY3QgRmxvYXQzMkFycmF5XScsXG4gICAgZmxvYXQ2NFRhZyA9ICdbb2JqZWN0IEZsb2F0NjRBcnJheV0nLFxuICAgIGludDhUYWcgPSAnW29iamVjdCBJbnQ4QXJyYXldJyxcbiAgICBpbnQxNlRhZyA9ICdbb2JqZWN0IEludDE2QXJyYXldJyxcbiAgICBpbnQzMlRhZyA9ICdbb2JqZWN0IEludDMyQXJyYXldJyxcbiAgICB1aW50OFRhZyA9ICdbb2JqZWN0IFVpbnQ4QXJyYXldJyxcbiAgICB1aW50OENsYW1wZWRUYWcgPSAnW29iamVjdCBVaW50OENsYW1wZWRBcnJheV0nLFxuICAgIHVpbnQxNlRhZyA9ICdbb2JqZWN0IFVpbnQxNkFycmF5XScsXG4gICAgdWludDMyVGFnID0gJ1tvYmplY3QgVWludDMyQXJyYXldJztcblxuLyoqIFVzZWQgdG8gaWRlbnRpZnkgYHRvU3RyaW5nVGFnYCB2YWx1ZXMgb2YgdHlwZWQgYXJyYXlzLiAqL1xudmFyIHR5cGVkQXJyYXlUYWdzID0ge307XG50eXBlZEFycmF5VGFnc1tmbG9hdDMyVGFnXSA9IHR5cGVkQXJyYXlUYWdzW2Zsb2F0NjRUYWddID1cbnR5cGVkQXJyYXlUYWdzW2ludDhUYWddID0gdHlwZWRBcnJheVRhZ3NbaW50MTZUYWddID1cbnR5cGVkQXJyYXlUYWdzW2ludDMyVGFnXSA9IHR5cGVkQXJyYXlUYWdzW3VpbnQ4VGFnXSA9XG50eXBlZEFycmF5VGFnc1t1aW50OENsYW1wZWRUYWddID0gdHlwZWRBcnJheVRhZ3NbdWludDE2VGFnXSA9XG50eXBlZEFycmF5VGFnc1t1aW50MzJUYWddID0gdHJ1ZTtcbnR5cGVkQXJyYXlUYWdzW2FyZ3NUYWckMV0gPSB0eXBlZEFycmF5VGFnc1thcnJheVRhZ10gPVxudHlwZWRBcnJheVRhZ3NbYXJyYXlCdWZmZXJUYWddID0gdHlwZWRBcnJheVRhZ3NbYm9vbFRhZ10gPVxudHlwZWRBcnJheVRhZ3NbZGF0YVZpZXdUYWddID0gdHlwZWRBcnJheVRhZ3NbZGF0ZVRhZ10gPVxudHlwZWRBcnJheVRhZ3NbZXJyb3JUYWddID0gdHlwZWRBcnJheVRhZ3NbZnVuY1RhZyQxXSA9XG50eXBlZEFycmF5VGFnc1ttYXBUYWddID0gdHlwZWRBcnJheVRhZ3NbbnVtYmVyVGFnXSA9XG50eXBlZEFycmF5VGFnc1tvYmplY3RUYWddID0gdHlwZWRBcnJheVRhZ3NbcmVnZXhwVGFnXSA9XG50eXBlZEFycmF5VGFnc1tzZXRUYWddID0gdHlwZWRBcnJheVRhZ3Nbc3RyaW5nVGFnXSA9XG50eXBlZEFycmF5VGFnc1t3ZWFrTWFwVGFnXSA9IGZhbHNlO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmlzVHlwZWRBcnJheWAgd2l0aG91dCBOb2RlLmpzIG9wdGltaXphdGlvbnMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSB0eXBlZCBhcnJheSwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBiYXNlSXNUeXBlZEFycmF5KHZhbHVlKSB7XG4gIHJldHVybiBpc09iamVjdExpa2VfMSh2YWx1ZSkgJiZcbiAgICBpc0xlbmd0aF8xKHZhbHVlLmxlbmd0aCkgJiYgISF0eXBlZEFycmF5VGFnc1tfYmFzZUdldFRhZyh2YWx1ZSldO1xufVxuXG52YXIgX2Jhc2VJc1R5cGVkQXJyYXkgPSBiYXNlSXNUeXBlZEFycmF5O1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLnVuYXJ5YCB3aXRob3V0IHN1cHBvcnQgZm9yIHN0b3JpbmcgbWV0YWRhdGEuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGNhcCBhcmd1bWVudHMgZm9yLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgY2FwcGVkIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBiYXNlVW5hcnkoZnVuYykge1xuICByZXR1cm4gZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gZnVuYyh2YWx1ZSk7XG4gIH07XG59XG5cbnZhciBfYmFzZVVuYXJ5ID0gYmFzZVVuYXJ5O1xuXG52YXIgX25vZGVVdGlsID0gY3JlYXRlQ29tbW9uanNNb2R1bGUoZnVuY3Rpb24gKG1vZHVsZSwgZXhwb3J0cykge1xuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBleHBvcnRzYC4gKi9cbnZhciBmcmVlRXhwb3J0cyA9ICdvYmplY3QnID09ICdvYmplY3QnICYmIGV4cG9ydHMgJiYgIWV4cG9ydHMubm9kZVR5cGUgJiYgZXhwb3J0cztcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBtb2R1bGVgLiAqL1xudmFyIGZyZWVNb2R1bGUgPSBmcmVlRXhwb3J0cyAmJiAnb2JqZWN0JyA9PSAnb2JqZWN0JyAmJiBtb2R1bGUgJiYgIW1vZHVsZS5ub2RlVHlwZSAmJiBtb2R1bGU7XG5cbi8qKiBEZXRlY3QgdGhlIHBvcHVsYXIgQ29tbW9uSlMgZXh0ZW5zaW9uIGBtb2R1bGUuZXhwb3J0c2AuICovXG52YXIgbW9kdWxlRXhwb3J0cyA9IGZyZWVNb2R1bGUgJiYgZnJlZU1vZHVsZS5leHBvcnRzID09PSBmcmVlRXhwb3J0cztcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBwcm9jZXNzYCBmcm9tIE5vZGUuanMuICovXG52YXIgZnJlZVByb2Nlc3MgPSBtb2R1bGVFeHBvcnRzICYmIF9mcmVlR2xvYmFsLnByb2Nlc3M7XG5cbi8qKiBVc2VkIHRvIGFjY2VzcyBmYXN0ZXIgTm9kZS5qcyBoZWxwZXJzLiAqL1xudmFyIG5vZGVVdGlsID0gKGZ1bmN0aW9uKCkge1xuICB0cnkge1xuICAgIHJldHVybiBmcmVlUHJvY2VzcyAmJiBmcmVlUHJvY2Vzcy5iaW5kaW5nICYmIGZyZWVQcm9jZXNzLmJpbmRpbmcoJ3V0aWwnKTtcbiAgfSBjYXRjaCAoZSkge31cbn0oKSk7XG5cbm1vZHVsZS5leHBvcnRzID0gbm9kZVV0aWw7XG59KTtcblxuLyogTm9kZS5qcyBoZWxwZXIgcmVmZXJlbmNlcy4gKi9cbnZhciBub2RlSXNUeXBlZEFycmF5ID0gX25vZGVVdGlsICYmIF9ub2RlVXRpbC5pc1R5cGVkQXJyYXk7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgY2xhc3NpZmllZCBhcyBhIHR5cGVkIGFycmF5LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMy4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgdHlwZWQgYXJyYXksIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc1R5cGVkQXJyYXkobmV3IFVpbnQ4QXJyYXkpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNUeXBlZEFycmF5KFtdKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbnZhciBpc1R5cGVkQXJyYXkgPSBub2RlSXNUeXBlZEFycmF5ID8gX2Jhc2VVbmFyeShub2RlSXNUeXBlZEFycmF5KSA6IF9iYXNlSXNUeXBlZEFycmF5O1xuXG52YXIgaXNUeXBlZEFycmF5XzEgPSBpc1R5cGVkQXJyYXk7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byQ3ID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkkNiA9IG9iamVjdFByb3RvJDcuaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhcnJheSBvZiB0aGUgZW51bWVyYWJsZSBwcm9wZXJ0eSBuYW1lcyBvZiB0aGUgYXJyYXktbGlrZSBgdmFsdWVgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBxdWVyeS5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gaW5oZXJpdGVkIFNwZWNpZnkgcmV0dXJuaW5nIGluaGVyaXRlZCBwcm9wZXJ0eSBuYW1lcy5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMuXG4gKi9cbmZ1bmN0aW9uIGFycmF5TGlrZUtleXModmFsdWUsIGluaGVyaXRlZCkge1xuICB2YXIgaXNBcnIgPSBpc0FycmF5XzEodmFsdWUpLFxuICAgICAgaXNBcmcgPSAhaXNBcnIgJiYgaXNBcmd1bWVudHNfMSh2YWx1ZSksXG4gICAgICBpc0J1ZmYgPSAhaXNBcnIgJiYgIWlzQXJnICYmIGlzQnVmZmVyXzEodmFsdWUpLFxuICAgICAgaXNUeXBlID0gIWlzQXJyICYmICFpc0FyZyAmJiAhaXNCdWZmICYmIGlzVHlwZWRBcnJheV8xKHZhbHVlKSxcbiAgICAgIHNraXBJbmRleGVzID0gaXNBcnIgfHwgaXNBcmcgfHwgaXNCdWZmIHx8IGlzVHlwZSxcbiAgICAgIHJlc3VsdCA9IHNraXBJbmRleGVzID8gX2Jhc2VUaW1lcyh2YWx1ZS5sZW5ndGgsIFN0cmluZykgOiBbXSxcbiAgICAgIGxlbmd0aCA9IHJlc3VsdC5sZW5ndGg7XG5cbiAgZm9yICh2YXIga2V5IGluIHZhbHVlKSB7XG4gICAgaWYgKChpbmhlcml0ZWQgfHwgaGFzT3duUHJvcGVydHkkNi5jYWxsKHZhbHVlLCBrZXkpKSAmJlxuICAgICAgICAhKHNraXBJbmRleGVzICYmIChcbiAgICAgICAgICAgLy8gU2FmYXJpIDkgaGFzIGVudW1lcmFibGUgYGFyZ3VtZW50cy5sZW5ndGhgIGluIHN0cmljdCBtb2RlLlxuICAgICAgICAgICBrZXkgPT0gJ2xlbmd0aCcgfHxcbiAgICAgICAgICAgLy8gTm9kZS5qcyAwLjEwIGhhcyBlbnVtZXJhYmxlIG5vbi1pbmRleCBwcm9wZXJ0aWVzIG9uIGJ1ZmZlcnMuXG4gICAgICAgICAgIChpc0J1ZmYgJiYgKGtleSA9PSAnb2Zmc2V0JyB8fCBrZXkgPT0gJ3BhcmVudCcpKSB8fFxuICAgICAgICAgICAvLyBQaGFudG9tSlMgMiBoYXMgZW51bWVyYWJsZSBub24taW5kZXggcHJvcGVydGllcyBvbiB0eXBlZCBhcnJheXMuXG4gICAgICAgICAgIChpc1R5cGUgJiYgKGtleSA9PSAnYnVmZmVyJyB8fCBrZXkgPT0gJ2J5dGVMZW5ndGgnIHx8IGtleSA9PSAnYnl0ZU9mZnNldCcpKSB8fFxuICAgICAgICAgICAvLyBTa2lwIGluZGV4IHByb3BlcnRpZXMuXG4gICAgICAgICAgIF9pc0luZGV4KGtleSwgbGVuZ3RoKVxuICAgICAgICApKSkge1xuICAgICAgcmVzdWx0LnB1c2goa2V5KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxudmFyIF9hcnJheUxpa2VLZXlzID0gYXJyYXlMaWtlS2V5cztcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvJDggPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGxpa2VseSBhIHByb3RvdHlwZSBvYmplY3QuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBwcm90b3R5cGUsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaXNQcm90b3R5cGUodmFsdWUpIHtcbiAgdmFyIEN0b3IgPSB2YWx1ZSAmJiB2YWx1ZS5jb25zdHJ1Y3RvcixcbiAgICAgIHByb3RvID0gKHR5cGVvZiBDdG9yID09ICdmdW5jdGlvbicgJiYgQ3Rvci5wcm90b3R5cGUpIHx8IG9iamVjdFByb3RvJDg7XG5cbiAgcmV0dXJuIHZhbHVlID09PSBwcm90bztcbn1cblxudmFyIF9pc1Byb3RvdHlwZSA9IGlzUHJvdG90eXBlO1xuXG4vKipcbiAqIENyZWF0ZXMgYSB1bmFyeSBmdW5jdGlvbiB0aGF0IGludm9rZXMgYGZ1bmNgIHdpdGggaXRzIGFyZ3VtZW50IHRyYW5zZm9ybWVkLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byB3cmFwLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gdHJhbnNmb3JtIFRoZSBhcmd1bWVudCB0cmFuc2Zvcm0uXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gb3ZlckFyZyhmdW5jLCB0cmFuc2Zvcm0pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGFyZykge1xuICAgIHJldHVybiBmdW5jKHRyYW5zZm9ybShhcmcpKTtcbiAgfTtcbn1cblxudmFyIF9vdmVyQXJnID0gb3ZlckFyZztcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgZm9yIHRob3NlIHdpdGggdGhlIHNhbWUgbmFtZSBhcyBvdGhlciBgbG9kYXNoYCBtZXRob2RzLiAqL1xudmFyIG5hdGl2ZUtleXMgPSBfb3ZlckFyZyhPYmplY3Qua2V5cywgT2JqZWN0KTtcblxudmFyIF9uYXRpdmVLZXlzID0gbmF0aXZlS2V5cztcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvJDkgPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSQ3ID0gb2JqZWN0UHJvdG8kOS5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5rZXlzYCB3aGljaCBkb2Vzbid0IHRyZWF0IHNwYXJzZSBhcnJheXMgYXMgZGVuc2UuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMuXG4gKi9cbmZ1bmN0aW9uIGJhc2VLZXlzKG9iamVjdCkge1xuICBpZiAoIV9pc1Byb3RvdHlwZShvYmplY3QpKSB7XG4gICAgcmV0dXJuIF9uYXRpdmVLZXlzKG9iamVjdCk7XG4gIH1cbiAgdmFyIHJlc3VsdCA9IFtdO1xuICBmb3IgKHZhciBrZXkgaW4gT2JqZWN0KG9iamVjdCkpIHtcbiAgICBpZiAoaGFzT3duUHJvcGVydHkkNy5jYWxsKG9iamVjdCwga2V5KSAmJiBrZXkgIT0gJ2NvbnN0cnVjdG9yJykge1xuICAgICAgcmVzdWx0LnB1c2goa2V5KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxudmFyIF9iYXNlS2V5cyA9IGJhc2VLZXlzO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGFycmF5LWxpa2UuIEEgdmFsdWUgaXMgY29uc2lkZXJlZCBhcnJheS1saWtlIGlmIGl0J3NcbiAqIG5vdCBhIGZ1bmN0aW9uIGFuZCBoYXMgYSBgdmFsdWUubGVuZ3RoYCB0aGF0J3MgYW4gaW50ZWdlciBncmVhdGVyIHRoYW4gb3JcbiAqIGVxdWFsIHRvIGAwYCBhbmQgbGVzcyB0aGFuIG9yIGVxdWFsIHRvIGBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUmAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYXJyYXktbGlrZSwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzQXJyYXlMaWtlKFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0FycmF5TGlrZShkb2N1bWVudC5ib2R5LmNoaWxkcmVuKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQXJyYXlMaWtlKCdhYmMnKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQXJyYXlMaWtlKF8ubm9vcCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0FycmF5TGlrZSh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgIT0gbnVsbCAmJiBpc0xlbmd0aF8xKHZhbHVlLmxlbmd0aCkgJiYgIWlzRnVuY3Rpb25fMSh2YWx1ZSk7XG59XG5cbnZhciBpc0FycmF5TGlrZV8xID0gaXNBcnJheUxpa2U7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhcnJheSBvZiB0aGUgb3duIGVudW1lcmFibGUgcHJvcGVydHkgbmFtZXMgb2YgYG9iamVjdGAuXG4gKlxuICogKipOb3RlOioqIE5vbi1vYmplY3QgdmFsdWVzIGFyZSBjb2VyY2VkIHRvIG9iamVjdHMuIFNlZSB0aGVcbiAqIFtFUyBzcGVjXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1vYmplY3Qua2V5cylcbiAqIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogQHN0YXRpY1xuICogQHNpbmNlIDAuMS4wXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IE9iamVjdFxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcy5cbiAqIEBleGFtcGxlXG4gKlxuICogZnVuY3Rpb24gRm9vKCkge1xuICogICB0aGlzLmEgPSAxO1xuICogICB0aGlzLmIgPSAyO1xuICogfVxuICpcbiAqIEZvby5wcm90b3R5cGUuYyA9IDM7XG4gKlxuICogXy5rZXlzKG5ldyBGb28pO1xuICogLy8gPT4gWydhJywgJ2InXSAoaXRlcmF0aW9uIG9yZGVyIGlzIG5vdCBndWFyYW50ZWVkKVxuICpcbiAqIF8ua2V5cygnaGknKTtcbiAqIC8vID0+IFsnMCcsICcxJ11cbiAqL1xuZnVuY3Rpb24ga2V5cyhvYmplY3QpIHtcbiAgcmV0dXJuIGlzQXJyYXlMaWtlXzEob2JqZWN0KSA/IF9hcnJheUxpa2VLZXlzKG9iamVjdCkgOiBfYmFzZUtleXMob2JqZWN0KTtcbn1cblxudmFyIGtleXNfMSA9IGtleXM7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uYXNzaWduYCB3aXRob3V0IHN1cHBvcnQgZm9yIG11bHRpcGxlIHNvdXJjZXNcbiAqIG9yIGBjdXN0b21pemVyYCBmdW5jdGlvbnMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIGRlc3RpbmF0aW9uIG9iamVjdC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBzb3VyY2UgVGhlIHNvdXJjZSBvYmplY3QuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGBvYmplY3RgLlxuICovXG5mdW5jdGlvbiBiYXNlQXNzaWduKG9iamVjdCwgc291cmNlKSB7XG4gIHJldHVybiBvYmplY3QgJiYgX2NvcHlPYmplY3Qoc291cmNlLCBrZXlzXzEoc291cmNlKSwgb2JqZWN0KTtcbn1cblxudmFyIF9iYXNlQXNzaWduID0gYmFzZUFzc2lnbjtcblxuLyoqXG4gKiBUaGlzIGZ1bmN0aW9uIGlzIGxpa2VcbiAqIFtgT2JqZWN0LmtleXNgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1vYmplY3Qua2V5cylcbiAqIGV4Y2VwdCB0aGF0IGl0IGluY2x1ZGVzIGluaGVyaXRlZCBlbnVtZXJhYmxlIHByb3BlcnRpZXMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMuXG4gKi9cbmZ1bmN0aW9uIG5hdGl2ZUtleXNJbihvYmplY3QpIHtcbiAgdmFyIHJlc3VsdCA9IFtdO1xuICBpZiAob2JqZWN0ICE9IG51bGwpIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gT2JqZWN0KG9iamVjdCkpIHtcbiAgICAgIHJlc3VsdC5wdXNoKGtleSk7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbnZhciBfbmF0aXZlS2V5c0luID0gbmF0aXZlS2V5c0luO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8kMTAgPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSQ4ID0gb2JqZWN0UHJvdG8kMTAuaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8ua2V5c0luYCB3aGljaCBkb2Vzbid0IHRyZWF0IHNwYXJzZSBhcnJheXMgYXMgZGVuc2UuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMuXG4gKi9cbmZ1bmN0aW9uIGJhc2VLZXlzSW4ob2JqZWN0KSB7XG4gIGlmICghaXNPYmplY3RfMShvYmplY3QpKSB7XG4gICAgcmV0dXJuIF9uYXRpdmVLZXlzSW4ob2JqZWN0KTtcbiAgfVxuICB2YXIgaXNQcm90byA9IF9pc1Byb3RvdHlwZShvYmplY3QpLFxuICAgICAgcmVzdWx0ID0gW107XG5cbiAgZm9yICh2YXIga2V5IGluIG9iamVjdCkge1xuICAgIGlmICghKGtleSA9PSAnY29uc3RydWN0b3InICYmIChpc1Byb3RvIHx8ICFoYXNPd25Qcm9wZXJ0eSQ4LmNhbGwob2JqZWN0LCBrZXkpKSkpIHtcbiAgICAgIHJlc3VsdC5wdXNoKGtleSk7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbnZhciBfYmFzZUtleXNJbiA9IGJhc2VLZXlzSW47XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhcnJheSBvZiB0aGUgb3duIGFuZCBpbmhlcml0ZWQgZW51bWVyYWJsZSBwcm9wZXJ0eSBuYW1lcyBvZiBgb2JqZWN0YC5cbiAqXG4gKiAqKk5vdGU6KiogTm9uLW9iamVjdCB2YWx1ZXMgYXJlIGNvZXJjZWQgdG8gb2JqZWN0cy5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDMuMC4wXG4gKiBAY2F0ZWdvcnkgT2JqZWN0XG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzLlxuICogQGV4YW1wbGVcbiAqXG4gKiBmdW5jdGlvbiBGb28oKSB7XG4gKiAgIHRoaXMuYSA9IDE7XG4gKiAgIHRoaXMuYiA9IDI7XG4gKiB9XG4gKlxuICogRm9vLnByb3RvdHlwZS5jID0gMztcbiAqXG4gKiBfLmtleXNJbihuZXcgRm9vKTtcbiAqIC8vID0+IFsnYScsICdiJywgJ2MnXSAoaXRlcmF0aW9uIG9yZGVyIGlzIG5vdCBndWFyYW50ZWVkKVxuICovXG5mdW5jdGlvbiBrZXlzSW4kMShvYmplY3QpIHtcbiAgcmV0dXJuIGlzQXJyYXlMaWtlXzEob2JqZWN0KSA/IF9hcnJheUxpa2VLZXlzKG9iamVjdCwgdHJ1ZSkgOiBfYmFzZUtleXNJbihvYmplY3QpO1xufVxuXG52YXIga2V5c0luXzEgPSBrZXlzSW4kMTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5hc3NpZ25JbmAgd2l0aG91dCBzdXBwb3J0IGZvciBtdWx0aXBsZSBzb3VyY2VzXG4gKiBvciBgY3VzdG9taXplcmAgZnVuY3Rpb25zLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBkZXN0aW5hdGlvbiBvYmplY3QuXG4gKiBAcGFyYW0ge09iamVjdH0gc291cmNlIFRoZSBzb3VyY2Ugb2JqZWN0LlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBgb2JqZWN0YC5cbiAqL1xuZnVuY3Rpb24gYmFzZUFzc2lnbkluKG9iamVjdCwgc291cmNlKSB7XG4gIHJldHVybiBvYmplY3QgJiYgX2NvcHlPYmplY3Qoc291cmNlLCBrZXlzSW5fMShzb3VyY2UpLCBvYmplY3QpO1xufVxuXG52YXIgX2Jhc2VBc3NpZ25JbiA9IGJhc2VBc3NpZ25JbjtcblxudmFyIF9jbG9uZUJ1ZmZlciA9IGNyZWF0ZUNvbW1vbmpzTW9kdWxlKGZ1bmN0aW9uIChtb2R1bGUsIGV4cG9ydHMpIHtcbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgZXhwb3J0c2AuICovXG52YXIgZnJlZUV4cG9ydHMgPSAnb2JqZWN0JyA9PSAnb2JqZWN0JyAmJiBleHBvcnRzICYmICFleHBvcnRzLm5vZGVUeXBlICYmIGV4cG9ydHM7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgbW9kdWxlYC4gKi9cbnZhciBmcmVlTW9kdWxlID0gZnJlZUV4cG9ydHMgJiYgJ29iamVjdCcgPT0gJ29iamVjdCcgJiYgbW9kdWxlICYmICFtb2R1bGUubm9kZVR5cGUgJiYgbW9kdWxlO1xuXG4vKiogRGV0ZWN0IHRoZSBwb3B1bGFyIENvbW1vbkpTIGV4dGVuc2lvbiBgbW9kdWxlLmV4cG9ydHNgLiAqL1xudmFyIG1vZHVsZUV4cG9ydHMgPSBmcmVlTW9kdWxlICYmIGZyZWVNb2R1bGUuZXhwb3J0cyA9PT0gZnJlZUV4cG9ydHM7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIEJ1ZmZlciA9IG1vZHVsZUV4cG9ydHMgPyBfcm9vdC5CdWZmZXIgOiB1bmRlZmluZWQsXG4gICAgYWxsb2NVbnNhZmUgPSBCdWZmZXIgPyBCdWZmZXIuYWxsb2NVbnNhZmUgOiB1bmRlZmluZWQ7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGNsb25lIG9mICBgYnVmZmVyYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtCdWZmZXJ9IGJ1ZmZlciBUaGUgYnVmZmVyIHRvIGNsb25lLlxuICogQHBhcmFtIHtib29sZWFufSBbaXNEZWVwXSBTcGVjaWZ5IGEgZGVlcCBjbG9uZS5cbiAqIEByZXR1cm5zIHtCdWZmZXJ9IFJldHVybnMgdGhlIGNsb25lZCBidWZmZXIuXG4gKi9cbmZ1bmN0aW9uIGNsb25lQnVmZmVyKGJ1ZmZlciwgaXNEZWVwKSB7XG4gIGlmIChpc0RlZXApIHtcbiAgICByZXR1cm4gYnVmZmVyLnNsaWNlKCk7XG4gIH1cbiAgdmFyIGxlbmd0aCA9IGJ1ZmZlci5sZW5ndGgsXG4gICAgICByZXN1bHQgPSBhbGxvY1Vuc2FmZSA/IGFsbG9jVW5zYWZlKGxlbmd0aCkgOiBuZXcgYnVmZmVyLmNvbnN0cnVjdG9yKGxlbmd0aCk7XG5cbiAgYnVmZmVyLmNvcHkocmVzdWx0KTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjbG9uZUJ1ZmZlcjtcbn0pO1xuXG4vKipcbiAqIENvcGllcyB0aGUgdmFsdWVzIG9mIGBzb3VyY2VgIHRvIGBhcnJheWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl9IHNvdXJjZSBUaGUgYXJyYXkgdG8gY29weSB2YWx1ZXMgZnJvbS5cbiAqIEBwYXJhbSB7QXJyYXl9IFthcnJheT1bXV0gVGhlIGFycmF5IHRvIGNvcHkgdmFsdWVzIHRvLlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIGBhcnJheWAuXG4gKi9cbmZ1bmN0aW9uIGNvcHlBcnJheShzb3VyY2UsIGFycmF5KSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gc291cmNlLmxlbmd0aDtcblxuICBhcnJheSB8fCAoYXJyYXkgPSBBcnJheShsZW5ndGgpKTtcbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICBhcnJheVtpbmRleF0gPSBzb3VyY2VbaW5kZXhdO1xuICB9XG4gIHJldHVybiBhcnJheTtcbn1cblxudmFyIF9jb3B5QXJyYXkgPSBjb3B5QXJyYXk7XG5cbi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBfLmZpbHRlcmAgZm9yIGFycmF5cyB3aXRob3V0IHN1cHBvcnQgZm9yXG4gKiBpdGVyYXRlZSBzaG9ydGhhbmRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fSBbYXJyYXldIFRoZSBhcnJheSB0byBpdGVyYXRlIG92ZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBwcmVkaWNhdGUgVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgbmV3IGZpbHRlcmVkIGFycmF5LlxuICovXG5mdW5jdGlvbiBhcnJheUZpbHRlcihhcnJheSwgcHJlZGljYXRlKSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gYXJyYXkgPT0gbnVsbCA/IDAgOiBhcnJheS5sZW5ndGgsXG4gICAgICByZXNJbmRleCA9IDAsXG4gICAgICByZXN1bHQgPSBbXTtcblxuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIHZhciB2YWx1ZSA9IGFycmF5W2luZGV4XTtcbiAgICBpZiAocHJlZGljYXRlKHZhbHVlLCBpbmRleCwgYXJyYXkpKSB7XG4gICAgICByZXN1bHRbcmVzSW5kZXgrK10gPSB2YWx1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxudmFyIF9hcnJheUZpbHRlciA9IGFycmF5RmlsdGVyO1xuXG4vKipcbiAqIFRoaXMgbWV0aG9kIHJldHVybnMgYSBuZXcgZW1wdHkgYXJyYXkuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjEzLjBcbiAqIEBjYXRlZ29yeSBVdGlsXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIG5ldyBlbXB0eSBhcnJheS5cbiAqIEBleGFtcGxlXG4gKlxuICogdmFyIGFycmF5cyA9IF8udGltZXMoMiwgXy5zdHViQXJyYXkpO1xuICpcbiAqIGNvbnNvbGUubG9nKGFycmF5cyk7XG4gKiAvLyA9PiBbW10sIFtdXVxuICpcbiAqIGNvbnNvbGUubG9nKGFycmF5c1swXSA9PT0gYXJyYXlzWzFdKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIHN0dWJBcnJheSgpIHtcbiAgcmV0dXJuIFtdO1xufVxuXG52YXIgc3R1YkFycmF5XzEgPSBzdHViQXJyYXk7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byQxMSA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIHByb3BlcnR5SXNFbnVtZXJhYmxlJDEgPSBvYmplY3RQcm90byQxMS5wcm9wZXJ0eUlzRW51bWVyYWJsZTtcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgZm9yIHRob3NlIHdpdGggdGhlIHNhbWUgbmFtZSBhcyBvdGhlciBgbG9kYXNoYCBtZXRob2RzLiAqL1xudmFyIG5hdGl2ZUdldFN5bWJvbHMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzO1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gYXJyYXkgb2YgdGhlIG93biBlbnVtZXJhYmxlIHN5bWJvbHMgb2YgYG9iamVjdGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2Ygc3ltYm9scy5cbiAqL1xudmFyIGdldFN5bWJvbHMgPSAhbmF0aXZlR2V0U3ltYm9scyA/IHN0dWJBcnJheV8xIDogZnVuY3Rpb24ob2JqZWN0KSB7XG4gIGlmIChvYmplY3QgPT0gbnVsbCkge1xuICAgIHJldHVybiBbXTtcbiAgfVxuICBvYmplY3QgPSBPYmplY3Qob2JqZWN0KTtcbiAgcmV0dXJuIF9hcnJheUZpbHRlcihuYXRpdmVHZXRTeW1ib2xzKG9iamVjdCksIGZ1bmN0aW9uKHN5bWJvbCkge1xuICAgIHJldHVybiBwcm9wZXJ0eUlzRW51bWVyYWJsZSQxLmNhbGwob2JqZWN0LCBzeW1ib2wpO1xuICB9KTtcbn07XG5cbnZhciBfZ2V0U3ltYm9scyA9IGdldFN5bWJvbHM7XG5cbi8qKlxuICogQ29waWVzIG93biBzeW1ib2xzIG9mIGBzb3VyY2VgIHRvIGBvYmplY3RgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gc291cmNlIFRoZSBvYmplY3QgdG8gY29weSBzeW1ib2xzIGZyb20uXG4gKiBAcGFyYW0ge09iamVjdH0gW29iamVjdD17fV0gVGhlIG9iamVjdCB0byBjb3B5IHN5bWJvbHMgdG8uXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGBvYmplY3RgLlxuICovXG5mdW5jdGlvbiBjb3B5U3ltYm9scyhzb3VyY2UsIG9iamVjdCkge1xuICByZXR1cm4gX2NvcHlPYmplY3Qoc291cmNlLCBfZ2V0U3ltYm9scyhzb3VyY2UpLCBvYmplY3QpO1xufVxuXG52YXIgX2NvcHlTeW1ib2xzID0gY29weVN5bWJvbHM7XG5cbi8qKlxuICogQXBwZW5kcyB0aGUgZWxlbWVudHMgb2YgYHZhbHVlc2AgdG8gYGFycmF5YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIG1vZGlmeS5cbiAqIEBwYXJhbSB7QXJyYXl9IHZhbHVlcyBUaGUgdmFsdWVzIHRvIGFwcGVuZC5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyBgYXJyYXlgLlxuICovXG5mdW5jdGlvbiBhcnJheVB1c2goYXJyYXksIHZhbHVlcykge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IHZhbHVlcy5sZW5ndGgsXG4gICAgICBvZmZzZXQgPSBhcnJheS5sZW5ndGg7XG5cbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICBhcnJheVtvZmZzZXQgKyBpbmRleF0gPSB2YWx1ZXNbaW5kZXhdO1xuICB9XG4gIHJldHVybiBhcnJheTtcbn1cblxudmFyIF9hcnJheVB1c2ggPSBhcnJheVB1c2g7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIGdldFByb3RvdHlwZSA9IF9vdmVyQXJnKE9iamVjdC5nZXRQcm90b3R5cGVPZiwgT2JqZWN0KTtcblxudmFyIF9nZXRQcm90b3R5cGUgPSBnZXRQcm90b3R5cGU7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIGZvciB0aG9zZSB3aXRoIHRoZSBzYW1lIG5hbWUgYXMgb3RoZXIgYGxvZGFzaGAgbWV0aG9kcy4gKi9cbnZhciBuYXRpdmVHZXRTeW1ib2xzJDEgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzO1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gYXJyYXkgb2YgdGhlIG93biBhbmQgaW5oZXJpdGVkIGVudW1lcmFibGUgc3ltYm9scyBvZiBgb2JqZWN0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBzeW1ib2xzLlxuICovXG52YXIgZ2V0U3ltYm9sc0luID0gIW5hdGl2ZUdldFN5bWJvbHMkMSA/IHN0dWJBcnJheV8xIDogZnVuY3Rpb24ob2JqZWN0KSB7XG4gIHZhciByZXN1bHQgPSBbXTtcbiAgd2hpbGUgKG9iamVjdCkge1xuICAgIF9hcnJheVB1c2gocmVzdWx0LCBfZ2V0U3ltYm9scyhvYmplY3QpKTtcbiAgICBvYmplY3QgPSBfZ2V0UHJvdG90eXBlKG9iamVjdCk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbnZhciBfZ2V0U3ltYm9sc0luID0gZ2V0U3ltYm9sc0luO1xuXG4vKipcbiAqIENvcGllcyBvd24gYW5kIGluaGVyaXRlZCBzeW1ib2xzIG9mIGBzb3VyY2VgIHRvIGBvYmplY3RgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gc291cmNlIFRoZSBvYmplY3QgdG8gY29weSBzeW1ib2xzIGZyb20uXG4gKiBAcGFyYW0ge09iamVjdH0gW29iamVjdD17fV0gVGhlIG9iamVjdCB0byBjb3B5IHN5bWJvbHMgdG8uXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGBvYmplY3RgLlxuICovXG5mdW5jdGlvbiBjb3B5U3ltYm9sc0luKHNvdXJjZSwgb2JqZWN0KSB7XG4gIHJldHVybiBfY29weU9iamVjdChzb3VyY2UsIF9nZXRTeW1ib2xzSW4oc291cmNlKSwgb2JqZWN0KTtcbn1cblxudmFyIF9jb3B5U3ltYm9sc0luID0gY29weVN5bWJvbHNJbjtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgZ2V0QWxsS2V5c2AgYW5kIGBnZXRBbGxLZXlzSW5gIHdoaWNoIHVzZXNcbiAqIGBrZXlzRnVuY2AgYW5kIGBzeW1ib2xzRnVuY2AgdG8gZ2V0IHRoZSBlbnVtZXJhYmxlIHByb3BlcnR5IG5hbWVzIGFuZFxuICogc3ltYm9scyBvZiBgb2JqZWN0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHBhcmFtIHtGdW5jdGlvbn0ga2V5c0Z1bmMgVGhlIGZ1bmN0aW9uIHRvIGdldCB0aGUga2V5cyBvZiBgb2JqZWN0YC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHN5bWJvbHNGdW5jIFRoZSBmdW5jdGlvbiB0byBnZXQgdGhlIHN5bWJvbHMgb2YgYG9iamVjdGAuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzIGFuZCBzeW1ib2xzLlxuICovXG5mdW5jdGlvbiBiYXNlR2V0QWxsS2V5cyhvYmplY3QsIGtleXNGdW5jLCBzeW1ib2xzRnVuYykge1xuICB2YXIgcmVzdWx0ID0ga2V5c0Z1bmMob2JqZWN0KTtcbiAgcmV0dXJuIGlzQXJyYXlfMShvYmplY3QpID8gcmVzdWx0IDogX2FycmF5UHVzaChyZXN1bHQsIHN5bWJvbHNGdW5jKG9iamVjdCkpO1xufVxuXG52YXIgX2Jhc2VHZXRBbGxLZXlzID0gYmFzZUdldEFsbEtleXM7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhcnJheSBvZiBvd24gZW51bWVyYWJsZSBwcm9wZXJ0eSBuYW1lcyBhbmQgc3ltYm9scyBvZiBgb2JqZWN0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcyBhbmQgc3ltYm9scy5cbiAqL1xuZnVuY3Rpb24gZ2V0QWxsS2V5cyhvYmplY3QpIHtcbiAgcmV0dXJuIF9iYXNlR2V0QWxsS2V5cyhvYmplY3QsIGtleXNfMSwgX2dldFN5bWJvbHMpO1xufVxuXG52YXIgX2dldEFsbEtleXMgPSBnZXRBbGxLZXlzO1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gYXJyYXkgb2Ygb3duIGFuZCBpbmhlcml0ZWQgZW51bWVyYWJsZSBwcm9wZXJ0eSBuYW1lcyBhbmRcbiAqIHN5bWJvbHMgb2YgYG9iamVjdGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMgYW5kIHN5bWJvbHMuXG4gKi9cbmZ1bmN0aW9uIGdldEFsbEtleXNJbihvYmplY3QpIHtcbiAgcmV0dXJuIF9iYXNlR2V0QWxsS2V5cyhvYmplY3QsIGtleXNJbl8xLCBfZ2V0U3ltYm9sc0luKTtcbn1cblxudmFyIF9nZXRBbGxLZXlzSW4gPSBnZXRBbGxLZXlzSW47XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIHRoYXQgYXJlIHZlcmlmaWVkIHRvIGJlIG5hdGl2ZS4gKi9cbnZhciBEYXRhVmlldyA9IF9nZXROYXRpdmUoX3Jvb3QsICdEYXRhVmlldycpO1xuXG52YXIgX0RhdGFWaWV3ID0gRGF0YVZpZXc7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIHRoYXQgYXJlIHZlcmlmaWVkIHRvIGJlIG5hdGl2ZS4gKi9cbnZhciBQcm9taXNlID0gX2dldE5hdGl2ZShfcm9vdCwgJ1Byb21pc2UnKTtcblxudmFyIF9Qcm9taXNlID0gUHJvbWlzZTtcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgdGhhdCBhcmUgdmVyaWZpZWQgdG8gYmUgbmF0aXZlLiAqL1xudmFyIFNldCA9IF9nZXROYXRpdmUoX3Jvb3QsICdTZXQnKTtcblxudmFyIF9TZXQgPSBTZXQ7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIHRoYXQgYXJlIHZlcmlmaWVkIHRvIGJlIG5hdGl2ZS4gKi9cbnZhciBXZWFrTWFwID0gX2dldE5hdGl2ZShfcm9vdCwgJ1dlYWtNYXAnKTtcblxudmFyIF9XZWFrTWFwID0gV2Vha01hcDtcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIG1hcFRhZyQxID0gJ1tvYmplY3QgTWFwXScsXG4gICAgb2JqZWN0VGFnJDEgPSAnW29iamVjdCBPYmplY3RdJyxcbiAgICBwcm9taXNlVGFnID0gJ1tvYmplY3QgUHJvbWlzZV0nLFxuICAgIHNldFRhZyQxID0gJ1tvYmplY3QgU2V0XScsXG4gICAgd2Vha01hcFRhZyQxID0gJ1tvYmplY3QgV2Vha01hcF0nO1xuXG52YXIgZGF0YVZpZXdUYWckMSA9ICdbb2JqZWN0IERhdGFWaWV3XSc7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBtYXBzLCBzZXRzLCBhbmQgd2Vha21hcHMuICovXG52YXIgZGF0YVZpZXdDdG9yU3RyaW5nID0gX3RvU291cmNlKF9EYXRhVmlldyksXG4gICAgbWFwQ3RvclN0cmluZyA9IF90b1NvdXJjZShfTWFwKSxcbiAgICBwcm9taXNlQ3RvclN0cmluZyA9IF90b1NvdXJjZShfUHJvbWlzZSksXG4gICAgc2V0Q3RvclN0cmluZyA9IF90b1NvdXJjZShfU2V0KSxcbiAgICB3ZWFrTWFwQ3RvclN0cmluZyA9IF90b1NvdXJjZShfV2Vha01hcCk7XG5cbi8qKlxuICogR2V0cyB0aGUgYHRvU3RyaW5nVGFnYCBvZiBgdmFsdWVgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIGB0b1N0cmluZ1RhZ2AuXG4gKi9cbnZhciBnZXRUYWcgPSBfYmFzZUdldFRhZztcblxuLy8gRmFsbGJhY2sgZm9yIGRhdGEgdmlld3MsIG1hcHMsIHNldHMsIGFuZCB3ZWFrIG1hcHMgaW4gSUUgMTEgYW5kIHByb21pc2VzIGluIE5vZGUuanMgPCA2LlxuaWYgKChfRGF0YVZpZXcgJiYgZ2V0VGFnKG5ldyBfRGF0YVZpZXcobmV3IEFycmF5QnVmZmVyKDEpKSkgIT0gZGF0YVZpZXdUYWckMSkgfHxcbiAgICAoX01hcCAmJiBnZXRUYWcobmV3IF9NYXApICE9IG1hcFRhZyQxKSB8fFxuICAgIChfUHJvbWlzZSAmJiBnZXRUYWcoX1Byb21pc2UucmVzb2x2ZSgpKSAhPSBwcm9taXNlVGFnKSB8fFxuICAgIChfU2V0ICYmIGdldFRhZyhuZXcgX1NldCkgIT0gc2V0VGFnJDEpIHx8XG4gICAgKF9XZWFrTWFwICYmIGdldFRhZyhuZXcgX1dlYWtNYXApICE9IHdlYWtNYXBUYWckMSkpIHtcbiAgZ2V0VGFnID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICB2YXIgcmVzdWx0ID0gX2Jhc2VHZXRUYWcodmFsdWUpLFxuICAgICAgICBDdG9yID0gcmVzdWx0ID09IG9iamVjdFRhZyQxID8gdmFsdWUuY29uc3RydWN0b3IgOiB1bmRlZmluZWQsXG4gICAgICAgIGN0b3JTdHJpbmcgPSBDdG9yID8gX3RvU291cmNlKEN0b3IpIDogJyc7XG5cbiAgICBpZiAoY3RvclN0cmluZykge1xuICAgICAgc3dpdGNoIChjdG9yU3RyaW5nKSB7XG4gICAgICAgIGNhc2UgZGF0YVZpZXdDdG9yU3RyaW5nOiByZXR1cm4gZGF0YVZpZXdUYWckMTtcbiAgICAgICAgY2FzZSBtYXBDdG9yU3RyaW5nOiByZXR1cm4gbWFwVGFnJDE7XG4gICAgICAgIGNhc2UgcHJvbWlzZUN0b3JTdHJpbmc6IHJldHVybiBwcm9taXNlVGFnO1xuICAgICAgICBjYXNlIHNldEN0b3JTdHJpbmc6IHJldHVybiBzZXRUYWckMTtcbiAgICAgICAgY2FzZSB3ZWFrTWFwQ3RvclN0cmluZzogcmV0dXJuIHdlYWtNYXBUYWckMTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcbn1cblxudmFyIF9nZXRUYWcgPSBnZXRUYWc7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byQxMiA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5JDkgPSBvYmplY3RQcm90byQxMi5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBJbml0aWFsaXplcyBhbiBhcnJheSBjbG9uZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIGNsb25lLlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBpbml0aWFsaXplZCBjbG9uZS5cbiAqL1xuZnVuY3Rpb24gaW5pdENsb25lQXJyYXkoYXJyYXkpIHtcbiAgdmFyIGxlbmd0aCA9IGFycmF5Lmxlbmd0aCxcbiAgICAgIHJlc3VsdCA9IGFycmF5LmNvbnN0cnVjdG9yKGxlbmd0aCk7XG5cbiAgLy8gQWRkIHByb3BlcnRpZXMgYXNzaWduZWQgYnkgYFJlZ0V4cCNleGVjYC5cbiAgaWYgKGxlbmd0aCAmJiB0eXBlb2YgYXJyYXlbMF0gPT0gJ3N0cmluZycgJiYgaGFzT3duUHJvcGVydHkkOS5jYWxsKGFycmF5LCAnaW5kZXgnKSkge1xuICAgIHJlc3VsdC5pbmRleCA9IGFycmF5LmluZGV4O1xuICAgIHJlc3VsdC5pbnB1dCA9IGFycmF5LmlucHV0O1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbnZhciBfaW5pdENsb25lQXJyYXkgPSBpbml0Q2xvbmVBcnJheTtcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgVWludDhBcnJheSA9IF9yb290LlVpbnQ4QXJyYXk7XG5cbnZhciBfVWludDhBcnJheSA9IFVpbnQ4QXJyYXk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGNsb25lIG9mIGBhcnJheUJ1ZmZlcmAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXlCdWZmZXJ9IGFycmF5QnVmZmVyIFRoZSBhcnJheSBidWZmZXIgdG8gY2xvbmUuXG4gKiBAcmV0dXJucyB7QXJyYXlCdWZmZXJ9IFJldHVybnMgdGhlIGNsb25lZCBhcnJheSBidWZmZXIuXG4gKi9cbmZ1bmN0aW9uIGNsb25lQXJyYXlCdWZmZXIoYXJyYXlCdWZmZXIpIHtcbiAgdmFyIHJlc3VsdCA9IG5ldyBhcnJheUJ1ZmZlci5jb25zdHJ1Y3RvcihhcnJheUJ1ZmZlci5ieXRlTGVuZ3RoKTtcbiAgbmV3IF9VaW50OEFycmF5KHJlc3VsdCkuc2V0KG5ldyBfVWludDhBcnJheShhcnJheUJ1ZmZlcikpO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG52YXIgX2Nsb25lQXJyYXlCdWZmZXIgPSBjbG9uZUFycmF5QnVmZmVyO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBjbG9uZSBvZiBgZGF0YVZpZXdgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gZGF0YVZpZXcgVGhlIGRhdGEgdmlldyB0byBjbG9uZS5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzRGVlcF0gU3BlY2lmeSBhIGRlZXAgY2xvbmUuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBjbG9uZWQgZGF0YSB2aWV3LlxuICovXG5mdW5jdGlvbiBjbG9uZURhdGFWaWV3KGRhdGFWaWV3LCBpc0RlZXApIHtcbiAgdmFyIGJ1ZmZlciA9IGlzRGVlcCA/IF9jbG9uZUFycmF5QnVmZmVyKGRhdGFWaWV3LmJ1ZmZlcikgOiBkYXRhVmlldy5idWZmZXI7XG4gIHJldHVybiBuZXcgZGF0YVZpZXcuY29uc3RydWN0b3IoYnVmZmVyLCBkYXRhVmlldy5ieXRlT2Zmc2V0LCBkYXRhVmlldy5ieXRlTGVuZ3RoKTtcbn1cblxudmFyIF9jbG9uZURhdGFWaWV3ID0gY2xvbmVEYXRhVmlldztcblxuLyoqXG4gKiBBZGRzIHRoZSBrZXktdmFsdWUgYHBhaXJgIHRvIGBtYXBgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gbWFwIFRoZSBtYXAgdG8gbW9kaWZ5LlxuICogQHBhcmFtIHtBcnJheX0gcGFpciBUaGUga2V5LXZhbHVlIHBhaXIgdG8gYWRkLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBgbWFwYC5cbiAqL1xuZnVuY3Rpb24gYWRkTWFwRW50cnkobWFwLCBwYWlyKSB7XG4gIC8vIERvbid0IHJldHVybiBgbWFwLnNldGAgYmVjYXVzZSBpdCdzIG5vdCBjaGFpbmFibGUgaW4gSUUgMTEuXG4gIG1hcC5zZXQocGFpclswXSwgcGFpclsxXSk7XG4gIHJldHVybiBtYXA7XG59XG5cbnZhciBfYWRkTWFwRW50cnkgPSBhZGRNYXBFbnRyeTtcblxuLyoqXG4gKiBBIHNwZWNpYWxpemVkIHZlcnNpb24gb2YgYF8ucmVkdWNlYCBmb3IgYXJyYXlzIHdpdGhvdXQgc3VwcG9ydCBmb3JcbiAqIGl0ZXJhdGVlIHNob3J0aGFuZHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl9IFthcnJheV0gVGhlIGFycmF5IHRvIGl0ZXJhdGUgb3Zlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdGVlIFRoZSBmdW5jdGlvbiBpbnZva2VkIHBlciBpdGVyYXRpb24uXG4gKiBAcGFyYW0geyp9IFthY2N1bXVsYXRvcl0gVGhlIGluaXRpYWwgdmFsdWUuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtpbml0QWNjdW1dIFNwZWNpZnkgdXNpbmcgdGhlIGZpcnN0IGVsZW1lbnQgb2YgYGFycmF5YCBhc1xuICogIHRoZSBpbml0aWFsIHZhbHVlLlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIGFjY3VtdWxhdGVkIHZhbHVlLlxuICovXG5mdW5jdGlvbiBhcnJheVJlZHVjZShhcnJheSwgaXRlcmF0ZWUsIGFjY3VtdWxhdG9yLCBpbml0QWNjdW0pIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBhcnJheSA9PSBudWxsID8gMCA6IGFycmF5Lmxlbmd0aDtcblxuICBpZiAoaW5pdEFjY3VtICYmIGxlbmd0aCkge1xuICAgIGFjY3VtdWxhdG9yID0gYXJyYXlbKytpbmRleF07XG4gIH1cbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICBhY2N1bXVsYXRvciA9IGl0ZXJhdGVlKGFjY3VtdWxhdG9yLCBhcnJheVtpbmRleF0sIGluZGV4LCBhcnJheSk7XG4gIH1cbiAgcmV0dXJuIGFjY3VtdWxhdG9yO1xufVxuXG52YXIgX2FycmF5UmVkdWNlID0gYXJyYXlSZWR1Y2U7XG5cbi8qKlxuICogQ29udmVydHMgYG1hcGAgdG8gaXRzIGtleS12YWx1ZSBwYWlycy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG1hcCBUaGUgbWFwIHRvIGNvbnZlcnQuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGtleS12YWx1ZSBwYWlycy5cbiAqL1xuZnVuY3Rpb24gbWFwVG9BcnJheShtYXApIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICByZXN1bHQgPSBBcnJheShtYXAuc2l6ZSk7XG5cbiAgbWFwLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIGtleSkge1xuICAgIHJlc3VsdFsrK2luZGV4XSA9IFtrZXksIHZhbHVlXTtcbiAgfSk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbnZhciBfbWFwVG9BcnJheSA9IG1hcFRvQXJyYXk7XG5cbi8qKiBVc2VkIHRvIGNvbXBvc2UgYml0bWFza3MgZm9yIGNsb25pbmcuICovXG52YXIgQ0xPTkVfREVFUF9GTEFHID0gMTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgY2xvbmUgb2YgYG1hcGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBtYXAgVGhlIG1hcCB0byBjbG9uZS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNsb25lRnVuYyBUaGUgZnVuY3Rpb24gdG8gY2xvbmUgdmFsdWVzLlxuICogQHBhcmFtIHtib29sZWFufSBbaXNEZWVwXSBTcGVjaWZ5IGEgZGVlcCBjbG9uZS5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIGNsb25lZCBtYXAuXG4gKi9cbmZ1bmN0aW9uIGNsb25lTWFwKG1hcCwgaXNEZWVwLCBjbG9uZUZ1bmMpIHtcbiAgdmFyIGFycmF5ID0gaXNEZWVwID8gY2xvbmVGdW5jKF9tYXBUb0FycmF5KG1hcCksIENMT05FX0RFRVBfRkxBRykgOiBfbWFwVG9BcnJheShtYXApO1xuICByZXR1cm4gX2FycmF5UmVkdWNlKGFycmF5LCBfYWRkTWFwRW50cnksIG5ldyBtYXAuY29uc3RydWN0b3IpO1xufVxuXG52YXIgX2Nsb25lTWFwID0gY2xvbmVNYXA7XG5cbi8qKiBVc2VkIHRvIG1hdGNoIGBSZWdFeHBgIGZsYWdzIGZyb20gdGhlaXIgY29lcmNlZCBzdHJpbmcgdmFsdWVzLiAqL1xudmFyIHJlRmxhZ3MgPSAvXFx3KiQvO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBjbG9uZSBvZiBgcmVnZXhwYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IHJlZ2V4cCBUaGUgcmVnZXhwIHRvIGNsb25lLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgY2xvbmVkIHJlZ2V4cC5cbiAqL1xuZnVuY3Rpb24gY2xvbmVSZWdFeHAocmVnZXhwKSB7XG4gIHZhciByZXN1bHQgPSBuZXcgcmVnZXhwLmNvbnN0cnVjdG9yKHJlZ2V4cC5zb3VyY2UsIHJlRmxhZ3MuZXhlYyhyZWdleHApKTtcbiAgcmVzdWx0Lmxhc3RJbmRleCA9IHJlZ2V4cC5sYXN0SW5kZXg7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbnZhciBfY2xvbmVSZWdFeHAgPSBjbG9uZVJlZ0V4cDtcblxuLyoqXG4gKiBBZGRzIGB2YWx1ZWAgdG8gYHNldGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBzZXQgVGhlIHNldCB0byBtb2RpZnkuXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBhZGQuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGBzZXRgLlxuICovXG5mdW5jdGlvbiBhZGRTZXRFbnRyeShzZXQsIHZhbHVlKSB7XG4gIC8vIERvbid0IHJldHVybiBgc2V0LmFkZGAgYmVjYXVzZSBpdCdzIG5vdCBjaGFpbmFibGUgaW4gSUUgMTEuXG4gIHNldC5hZGQodmFsdWUpO1xuICByZXR1cm4gc2V0O1xufVxuXG52YXIgX2FkZFNldEVudHJ5ID0gYWRkU2V0RW50cnk7XG5cbi8qKlxuICogQ29udmVydHMgYHNldGAgdG8gYW4gYXJyYXkgb2YgaXRzIHZhbHVlcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IHNldCBUaGUgc2V0IHRvIGNvbnZlcnQuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIHZhbHVlcy5cbiAqL1xuZnVuY3Rpb24gc2V0VG9BcnJheShzZXQpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICByZXN1bHQgPSBBcnJheShzZXQuc2l6ZSk7XG5cbiAgc2V0LmZvckVhY2goZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXN1bHRbKytpbmRleF0gPSB2YWx1ZTtcbiAgfSk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbnZhciBfc2V0VG9BcnJheSA9IHNldFRvQXJyYXk7XG5cbi8qKiBVc2VkIHRvIGNvbXBvc2UgYml0bWFza3MgZm9yIGNsb25pbmcuICovXG52YXIgQ0xPTkVfREVFUF9GTEFHJDEgPSAxO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBjbG9uZSBvZiBgc2V0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IHNldCBUaGUgc2V0IHRvIGNsb25lLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2xvbmVGdW5jIFRoZSBmdW5jdGlvbiB0byBjbG9uZSB2YWx1ZXMuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtpc0RlZXBdIFNwZWNpZnkgYSBkZWVwIGNsb25lLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgY2xvbmVkIHNldC5cbiAqL1xuZnVuY3Rpb24gY2xvbmVTZXQoc2V0LCBpc0RlZXAsIGNsb25lRnVuYykge1xuICB2YXIgYXJyYXkgPSBpc0RlZXAgPyBjbG9uZUZ1bmMoX3NldFRvQXJyYXkoc2V0KSwgQ0xPTkVfREVFUF9GTEFHJDEpIDogX3NldFRvQXJyYXkoc2V0KTtcbiAgcmV0dXJuIF9hcnJheVJlZHVjZShhcnJheSwgX2FkZFNldEVudHJ5LCBuZXcgc2V0LmNvbnN0cnVjdG9yKTtcbn1cblxudmFyIF9jbG9uZVNldCA9IGNsb25lU2V0O1xuXG4vKiogVXNlZCB0byBjb252ZXJ0IHN5bWJvbHMgdG8gcHJpbWl0aXZlcyBhbmQgc3RyaW5ncy4gKi9cbnZhciBzeW1ib2xQcm90byA9IF9TeW1ib2wgPyBfU3ltYm9sLnByb3RvdHlwZSA6IHVuZGVmaW5lZCxcbiAgICBzeW1ib2xWYWx1ZU9mID0gc3ltYm9sUHJvdG8gPyBzeW1ib2xQcm90by52YWx1ZU9mIDogdW5kZWZpbmVkO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBjbG9uZSBvZiB0aGUgYHN5bWJvbGAgb2JqZWN0LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gc3ltYm9sIFRoZSBzeW1ib2wgb2JqZWN0IHRvIGNsb25lLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgY2xvbmVkIHN5bWJvbCBvYmplY3QuXG4gKi9cbmZ1bmN0aW9uIGNsb25lU3ltYm9sKHN5bWJvbCkge1xuICByZXR1cm4gc3ltYm9sVmFsdWVPZiA/IE9iamVjdChzeW1ib2xWYWx1ZU9mLmNhbGwoc3ltYm9sKSkgOiB7fTtcbn1cblxudmFyIF9jbG9uZVN5bWJvbCA9IGNsb25lU3ltYm9sO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBjbG9uZSBvZiBgdHlwZWRBcnJheWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSB0eXBlZEFycmF5IFRoZSB0eXBlZCBhcnJheSB0byBjbG9uZS5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzRGVlcF0gU3BlY2lmeSBhIGRlZXAgY2xvbmUuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBjbG9uZWQgdHlwZWQgYXJyYXkuXG4gKi9cbmZ1bmN0aW9uIGNsb25lVHlwZWRBcnJheSh0eXBlZEFycmF5LCBpc0RlZXApIHtcbiAgdmFyIGJ1ZmZlciA9IGlzRGVlcCA/IF9jbG9uZUFycmF5QnVmZmVyKHR5cGVkQXJyYXkuYnVmZmVyKSA6IHR5cGVkQXJyYXkuYnVmZmVyO1xuICByZXR1cm4gbmV3IHR5cGVkQXJyYXkuY29uc3RydWN0b3IoYnVmZmVyLCB0eXBlZEFycmF5LmJ5dGVPZmZzZXQsIHR5cGVkQXJyYXkubGVuZ3RoKTtcbn1cblxudmFyIF9jbG9uZVR5cGVkQXJyYXkgPSBjbG9uZVR5cGVkQXJyYXk7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBib29sVGFnJDEgPSAnW29iamVjdCBCb29sZWFuXScsXG4gICAgZGF0ZVRhZyQxID0gJ1tvYmplY3QgRGF0ZV0nLFxuICAgIG1hcFRhZyQyID0gJ1tvYmplY3QgTWFwXScsXG4gICAgbnVtYmVyVGFnJDEgPSAnW29iamVjdCBOdW1iZXJdJyxcbiAgICByZWdleHBUYWckMSA9ICdbb2JqZWN0IFJlZ0V4cF0nLFxuICAgIHNldFRhZyQyID0gJ1tvYmplY3QgU2V0XScsXG4gICAgc3RyaW5nVGFnJDEgPSAnW29iamVjdCBTdHJpbmddJyxcbiAgICBzeW1ib2xUYWcgPSAnW29iamVjdCBTeW1ib2xdJztcblxudmFyIGFycmF5QnVmZmVyVGFnJDEgPSAnW29iamVjdCBBcnJheUJ1ZmZlcl0nLFxuICAgIGRhdGFWaWV3VGFnJDIgPSAnW29iamVjdCBEYXRhVmlld10nLFxuICAgIGZsb2F0MzJUYWckMSA9ICdbb2JqZWN0IEZsb2F0MzJBcnJheV0nLFxuICAgIGZsb2F0NjRUYWckMSA9ICdbb2JqZWN0IEZsb2F0NjRBcnJheV0nLFxuICAgIGludDhUYWckMSA9ICdbb2JqZWN0IEludDhBcnJheV0nLFxuICAgIGludDE2VGFnJDEgPSAnW29iamVjdCBJbnQxNkFycmF5XScsXG4gICAgaW50MzJUYWckMSA9ICdbb2JqZWN0IEludDMyQXJyYXldJyxcbiAgICB1aW50OFRhZyQxID0gJ1tvYmplY3QgVWludDhBcnJheV0nLFxuICAgIHVpbnQ4Q2xhbXBlZFRhZyQxID0gJ1tvYmplY3QgVWludDhDbGFtcGVkQXJyYXldJyxcbiAgICB1aW50MTZUYWckMSA9ICdbb2JqZWN0IFVpbnQxNkFycmF5XScsXG4gICAgdWludDMyVGFnJDEgPSAnW29iamVjdCBVaW50MzJBcnJheV0nO1xuXG4vKipcbiAqIEluaXRpYWxpemVzIGFuIG9iamVjdCBjbG9uZSBiYXNlZCBvbiBpdHMgYHRvU3RyaW5nVGFnYC5cbiAqXG4gKiAqKk5vdGU6KiogVGhpcyBmdW5jdGlvbiBvbmx5IHN1cHBvcnRzIGNsb25pbmcgdmFsdWVzIHdpdGggdGFncyBvZlxuICogYEJvb2xlYW5gLCBgRGF0ZWAsIGBFcnJvcmAsIGBOdW1iZXJgLCBgUmVnRXhwYCwgb3IgYFN0cmluZ2AuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBjbG9uZS5cbiAqIEBwYXJhbSB7c3RyaW5nfSB0YWcgVGhlIGB0b1N0cmluZ1RhZ2Agb2YgdGhlIG9iamVjdCB0byBjbG9uZS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNsb25lRnVuYyBUaGUgZnVuY3Rpb24gdG8gY2xvbmUgdmFsdWVzLlxuICogQHBhcmFtIHtib29sZWFufSBbaXNEZWVwXSBTcGVjaWZ5IGEgZGVlcCBjbG9uZS5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIGluaXRpYWxpemVkIGNsb25lLlxuICovXG5mdW5jdGlvbiBpbml0Q2xvbmVCeVRhZyhvYmplY3QsIHRhZywgY2xvbmVGdW5jLCBpc0RlZXApIHtcbiAgdmFyIEN0b3IgPSBvYmplY3QuY29uc3RydWN0b3I7XG4gIHN3aXRjaCAodGFnKSB7XG4gICAgY2FzZSBhcnJheUJ1ZmZlclRhZyQxOlxuICAgICAgcmV0dXJuIF9jbG9uZUFycmF5QnVmZmVyKG9iamVjdCk7XG5cbiAgICBjYXNlIGJvb2xUYWckMTpcbiAgICBjYXNlIGRhdGVUYWckMTpcbiAgICAgIHJldHVybiBuZXcgQ3Rvcigrb2JqZWN0KTtcblxuICAgIGNhc2UgZGF0YVZpZXdUYWckMjpcbiAgICAgIHJldHVybiBfY2xvbmVEYXRhVmlldyhvYmplY3QsIGlzRGVlcCk7XG5cbiAgICBjYXNlIGZsb2F0MzJUYWckMTogY2FzZSBmbG9hdDY0VGFnJDE6XG4gICAgY2FzZSBpbnQ4VGFnJDE6IGNhc2UgaW50MTZUYWckMTogY2FzZSBpbnQzMlRhZyQxOlxuICAgIGNhc2UgdWludDhUYWckMTogY2FzZSB1aW50OENsYW1wZWRUYWckMTogY2FzZSB1aW50MTZUYWckMTogY2FzZSB1aW50MzJUYWckMTpcbiAgICAgIHJldHVybiBfY2xvbmVUeXBlZEFycmF5KG9iamVjdCwgaXNEZWVwKTtcblxuICAgIGNhc2UgbWFwVGFnJDI6XG4gICAgICByZXR1cm4gX2Nsb25lTWFwKG9iamVjdCwgaXNEZWVwLCBjbG9uZUZ1bmMpO1xuXG4gICAgY2FzZSBudW1iZXJUYWckMTpcbiAgICBjYXNlIHN0cmluZ1RhZyQxOlxuICAgICAgcmV0dXJuIG5ldyBDdG9yKG9iamVjdCk7XG5cbiAgICBjYXNlIHJlZ2V4cFRhZyQxOlxuICAgICAgcmV0dXJuIF9jbG9uZVJlZ0V4cChvYmplY3QpO1xuXG4gICAgY2FzZSBzZXRUYWckMjpcbiAgICAgIHJldHVybiBfY2xvbmVTZXQob2JqZWN0LCBpc0RlZXAsIGNsb25lRnVuYyk7XG5cbiAgICBjYXNlIHN5bWJvbFRhZzpcbiAgICAgIHJldHVybiBfY2xvbmVTeW1ib2wob2JqZWN0KTtcbiAgfVxufVxuXG52YXIgX2luaXRDbG9uZUJ5VGFnID0gaW5pdENsb25lQnlUYWc7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdENyZWF0ZSA9IE9iamVjdC5jcmVhdGU7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uY3JlYXRlYCB3aXRob3V0IHN1cHBvcnQgZm9yIGFzc2lnbmluZ1xuICogcHJvcGVydGllcyB0byB0aGUgY3JlYXRlZCBvYmplY3QuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBwcm90byBUaGUgb2JqZWN0IHRvIGluaGVyaXQgZnJvbS5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIG5ldyBvYmplY3QuXG4gKi9cbnZhciBiYXNlQ3JlYXRlID0gKGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBvYmplY3QoKSB7fVxuICByZXR1cm4gZnVuY3Rpb24ocHJvdG8pIHtcbiAgICBpZiAoIWlzT2JqZWN0XzEocHJvdG8pKSB7XG4gICAgICByZXR1cm4ge307XG4gICAgfVxuICAgIGlmIChvYmplY3RDcmVhdGUpIHtcbiAgICAgIHJldHVybiBvYmplY3RDcmVhdGUocHJvdG8pO1xuICAgIH1cbiAgICBvYmplY3QucHJvdG90eXBlID0gcHJvdG87XG4gICAgdmFyIHJlc3VsdCA9IG5ldyBvYmplY3Q7XG4gICAgb2JqZWN0LnByb3RvdHlwZSA9IHVuZGVmaW5lZDtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xufSgpKTtcblxudmFyIF9iYXNlQ3JlYXRlID0gYmFzZUNyZWF0ZTtcblxuLyoqXG4gKiBJbml0aWFsaXplcyBhbiBvYmplY3QgY2xvbmUuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBjbG9uZS5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIGluaXRpYWxpemVkIGNsb25lLlxuICovXG5mdW5jdGlvbiBpbml0Q2xvbmVPYmplY3Qob2JqZWN0KSB7XG4gIHJldHVybiAodHlwZW9mIG9iamVjdC5jb25zdHJ1Y3RvciA9PSAnZnVuY3Rpb24nICYmICFfaXNQcm90b3R5cGUob2JqZWN0KSlcbiAgICA/IF9iYXNlQ3JlYXRlKF9nZXRQcm90b3R5cGUob2JqZWN0KSlcbiAgICA6IHt9O1xufVxuXG52YXIgX2luaXRDbG9uZU9iamVjdCA9IGluaXRDbG9uZU9iamVjdDtcblxuLyoqIFVzZWQgdG8gY29tcG9zZSBiaXRtYXNrcyBmb3IgY2xvbmluZy4gKi9cbnZhciBDTE9ORV9ERUVQX0ZMQUckMiA9IDEsXG4gICAgQ0xPTkVfRkxBVF9GTEFHID0gMixcbiAgICBDTE9ORV9TWU1CT0xTX0ZMQUcgPSA0O1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgYXJnc1RhZyQyID0gJ1tvYmplY3QgQXJndW1lbnRzXScsXG4gICAgYXJyYXlUYWckMSA9ICdbb2JqZWN0IEFycmF5XScsXG4gICAgYm9vbFRhZyQyID0gJ1tvYmplY3QgQm9vbGVhbl0nLFxuICAgIGRhdGVUYWckMiA9ICdbb2JqZWN0IERhdGVdJyxcbiAgICBlcnJvclRhZyQxID0gJ1tvYmplY3QgRXJyb3JdJyxcbiAgICBmdW5jVGFnJDIgPSAnW29iamVjdCBGdW5jdGlvbl0nLFxuICAgIGdlblRhZyQxID0gJ1tvYmplY3QgR2VuZXJhdG9yRnVuY3Rpb25dJyxcbiAgICBtYXBUYWckMyA9ICdbb2JqZWN0IE1hcF0nLFxuICAgIG51bWJlclRhZyQyID0gJ1tvYmplY3QgTnVtYmVyXScsXG4gICAgb2JqZWN0VGFnJDIgPSAnW29iamVjdCBPYmplY3RdJyxcbiAgICByZWdleHBUYWckMiA9ICdbb2JqZWN0IFJlZ0V4cF0nLFxuICAgIHNldFRhZyQzID0gJ1tvYmplY3QgU2V0XScsXG4gICAgc3RyaW5nVGFnJDIgPSAnW29iamVjdCBTdHJpbmddJyxcbiAgICBzeW1ib2xUYWckMSA9ICdbb2JqZWN0IFN5bWJvbF0nLFxuICAgIHdlYWtNYXBUYWckMiA9ICdbb2JqZWN0IFdlYWtNYXBdJztcblxudmFyIGFycmF5QnVmZmVyVGFnJDIgPSAnW29iamVjdCBBcnJheUJ1ZmZlcl0nLFxuICAgIGRhdGFWaWV3VGFnJDMgPSAnW29iamVjdCBEYXRhVmlld10nLFxuICAgIGZsb2F0MzJUYWckMiA9ICdbb2JqZWN0IEZsb2F0MzJBcnJheV0nLFxuICAgIGZsb2F0NjRUYWckMiA9ICdbb2JqZWN0IEZsb2F0NjRBcnJheV0nLFxuICAgIGludDhUYWckMiA9ICdbb2JqZWN0IEludDhBcnJheV0nLFxuICAgIGludDE2VGFnJDIgPSAnW29iamVjdCBJbnQxNkFycmF5XScsXG4gICAgaW50MzJUYWckMiA9ICdbb2JqZWN0IEludDMyQXJyYXldJyxcbiAgICB1aW50OFRhZyQyID0gJ1tvYmplY3QgVWludDhBcnJheV0nLFxuICAgIHVpbnQ4Q2xhbXBlZFRhZyQyID0gJ1tvYmplY3QgVWludDhDbGFtcGVkQXJyYXldJyxcbiAgICB1aW50MTZUYWckMiA9ICdbb2JqZWN0IFVpbnQxNkFycmF5XScsXG4gICAgdWludDMyVGFnJDIgPSAnW29iamVjdCBVaW50MzJBcnJheV0nO1xuXG4vKiogVXNlZCB0byBpZGVudGlmeSBgdG9TdHJpbmdUYWdgIHZhbHVlcyBzdXBwb3J0ZWQgYnkgYF8uY2xvbmVgLiAqL1xudmFyIGNsb25lYWJsZVRhZ3MgPSB7fTtcbmNsb25lYWJsZVRhZ3NbYXJnc1RhZyQyXSA9IGNsb25lYWJsZVRhZ3NbYXJyYXlUYWckMV0gPVxuY2xvbmVhYmxlVGFnc1thcnJheUJ1ZmZlclRhZyQyXSA9IGNsb25lYWJsZVRhZ3NbZGF0YVZpZXdUYWckM10gPVxuY2xvbmVhYmxlVGFnc1tib29sVGFnJDJdID0gY2xvbmVhYmxlVGFnc1tkYXRlVGFnJDJdID1cbmNsb25lYWJsZVRhZ3NbZmxvYXQzMlRhZyQyXSA9IGNsb25lYWJsZVRhZ3NbZmxvYXQ2NFRhZyQyXSA9XG5jbG9uZWFibGVUYWdzW2ludDhUYWckMl0gPSBjbG9uZWFibGVUYWdzW2ludDE2VGFnJDJdID1cbmNsb25lYWJsZVRhZ3NbaW50MzJUYWckMl0gPSBjbG9uZWFibGVUYWdzW21hcFRhZyQzXSA9XG5jbG9uZWFibGVUYWdzW251bWJlclRhZyQyXSA9IGNsb25lYWJsZVRhZ3Nbb2JqZWN0VGFnJDJdID1cbmNsb25lYWJsZVRhZ3NbcmVnZXhwVGFnJDJdID0gY2xvbmVhYmxlVGFnc1tzZXRUYWckM10gPVxuY2xvbmVhYmxlVGFnc1tzdHJpbmdUYWckMl0gPSBjbG9uZWFibGVUYWdzW3N5bWJvbFRhZyQxXSA9XG5jbG9uZWFibGVUYWdzW3VpbnQ4VGFnJDJdID0gY2xvbmVhYmxlVGFnc1t1aW50OENsYW1wZWRUYWckMl0gPVxuY2xvbmVhYmxlVGFnc1t1aW50MTZUYWckMl0gPSBjbG9uZWFibGVUYWdzW3VpbnQzMlRhZyQyXSA9IHRydWU7XG5jbG9uZWFibGVUYWdzW2Vycm9yVGFnJDFdID0gY2xvbmVhYmxlVGFnc1tmdW5jVGFnJDJdID1cbmNsb25lYWJsZVRhZ3Nbd2Vha01hcFRhZyQyXSA9IGZhbHNlO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmNsb25lYCBhbmQgYF8uY2xvbmVEZWVwYCB3aGljaCB0cmFja3NcbiAqIHRyYXZlcnNlZCBvYmplY3RzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjbG9uZS5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gYml0bWFzayBUaGUgYml0bWFzayBmbGFncy5cbiAqICAxIC0gRGVlcCBjbG9uZVxuICogIDIgLSBGbGF0dGVuIGluaGVyaXRlZCBwcm9wZXJ0aWVzXG4gKiAgNCAtIENsb25lIHN5bWJvbHNcbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtjdXN0b21pemVyXSBUaGUgZnVuY3Rpb24gdG8gY3VzdG9taXplIGNsb25pbmcuXG4gKiBAcGFyYW0ge3N0cmluZ30gW2tleV0gVGhlIGtleSBvZiBgdmFsdWVgLlxuICogQHBhcmFtIHtPYmplY3R9IFtvYmplY3RdIFRoZSBwYXJlbnQgb2JqZWN0IG9mIGB2YWx1ZWAuXG4gKiBAcGFyYW0ge09iamVjdH0gW3N0YWNrXSBUcmFja3MgdHJhdmVyc2VkIG9iamVjdHMgYW5kIHRoZWlyIGNsb25lIGNvdW50ZXJwYXJ0cy5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBjbG9uZWQgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIGJhc2VDbG9uZSh2YWx1ZSwgYml0bWFzaywgY3VzdG9taXplciwga2V5LCBvYmplY3QsIHN0YWNrKSB7XG4gIHZhciByZXN1bHQsXG4gICAgICBpc0RlZXAgPSBiaXRtYXNrICYgQ0xPTkVfREVFUF9GTEFHJDIsXG4gICAgICBpc0ZsYXQgPSBiaXRtYXNrICYgQ0xPTkVfRkxBVF9GTEFHLFxuICAgICAgaXNGdWxsID0gYml0bWFzayAmIENMT05FX1NZTUJPTFNfRkxBRztcblxuICBpZiAoY3VzdG9taXplcikge1xuICAgIHJlc3VsdCA9IG9iamVjdCA/IGN1c3RvbWl6ZXIodmFsdWUsIGtleSwgb2JqZWN0LCBzdGFjaykgOiBjdXN0b21pemVyKHZhbHVlKTtcbiAgfVxuICBpZiAocmVzdWx0ICE9PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG4gIGlmICghaXNPYmplY3RfMSh2YWx1ZSkpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbiAgdmFyIGlzQXJyID0gaXNBcnJheV8xKHZhbHVlKTtcbiAgaWYgKGlzQXJyKSB7XG4gICAgcmVzdWx0ID0gX2luaXRDbG9uZUFycmF5KHZhbHVlKTtcbiAgICBpZiAoIWlzRGVlcCkge1xuICAgICAgcmV0dXJuIF9jb3B5QXJyYXkodmFsdWUsIHJlc3VsdCk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHZhciB0YWcgPSBfZ2V0VGFnKHZhbHVlKSxcbiAgICAgICAgaXNGdW5jID0gdGFnID09IGZ1bmNUYWckMiB8fCB0YWcgPT0gZ2VuVGFnJDE7XG5cbiAgICBpZiAoaXNCdWZmZXJfMSh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBfY2xvbmVCdWZmZXIodmFsdWUsIGlzRGVlcCk7XG4gICAgfVxuICAgIGlmICh0YWcgPT0gb2JqZWN0VGFnJDIgfHwgdGFnID09IGFyZ3NUYWckMiB8fCAoaXNGdW5jICYmICFvYmplY3QpKSB7XG4gICAgICByZXN1bHQgPSAoaXNGbGF0IHx8IGlzRnVuYykgPyB7fSA6IF9pbml0Q2xvbmVPYmplY3QodmFsdWUpO1xuICAgICAgaWYgKCFpc0RlZXApIHtcbiAgICAgICAgcmV0dXJuIGlzRmxhdFxuICAgICAgICAgID8gX2NvcHlTeW1ib2xzSW4odmFsdWUsIF9iYXNlQXNzaWduSW4ocmVzdWx0LCB2YWx1ZSkpXG4gICAgICAgICAgOiBfY29weVN5bWJvbHModmFsdWUsIF9iYXNlQXNzaWduKHJlc3VsdCwgdmFsdWUpKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCFjbG9uZWFibGVUYWdzW3RhZ10pIHtcbiAgICAgICAgcmV0dXJuIG9iamVjdCA/IHZhbHVlIDoge307XG4gICAgICB9XG4gICAgICByZXN1bHQgPSBfaW5pdENsb25lQnlUYWcodmFsdWUsIHRhZywgYmFzZUNsb25lLCBpc0RlZXApO1xuICAgIH1cbiAgfVxuICAvLyBDaGVjayBmb3IgY2lyY3VsYXIgcmVmZXJlbmNlcyBhbmQgcmV0dXJuIGl0cyBjb3JyZXNwb25kaW5nIGNsb25lLlxuICBzdGFjayB8fCAoc3RhY2sgPSBuZXcgX1N0YWNrKTtcbiAgdmFyIHN0YWNrZWQgPSBzdGFjay5nZXQodmFsdWUpO1xuICBpZiAoc3RhY2tlZCkge1xuICAgIHJldHVybiBzdGFja2VkO1xuICB9XG4gIHN0YWNrLnNldCh2YWx1ZSwgcmVzdWx0KTtcblxuICB2YXIga2V5c0Z1bmMgPSBpc0Z1bGxcbiAgICA/IChpc0ZsYXQgPyBfZ2V0QWxsS2V5c0luIDogX2dldEFsbEtleXMpXG4gICAgOiAoaXNGbGF0ID8ga2V5c0luIDoga2V5c18xKTtcblxuICB2YXIgcHJvcHMgPSBpc0FyciA/IHVuZGVmaW5lZCA6IGtleXNGdW5jKHZhbHVlKTtcbiAgX2FycmF5RWFjaChwcm9wcyB8fCB2YWx1ZSwgZnVuY3Rpb24oc3ViVmFsdWUsIGtleSkge1xuICAgIGlmIChwcm9wcykge1xuICAgICAga2V5ID0gc3ViVmFsdWU7XG4gICAgICBzdWJWYWx1ZSA9IHZhbHVlW2tleV07XG4gICAgfVxuICAgIC8vIFJlY3Vyc2l2ZWx5IHBvcHVsYXRlIGNsb25lIChzdXNjZXB0aWJsZSB0byBjYWxsIHN0YWNrIGxpbWl0cykuXG4gICAgX2Fzc2lnblZhbHVlKHJlc3VsdCwga2V5LCBiYXNlQ2xvbmUoc3ViVmFsdWUsIGJpdG1hc2ssIGN1c3RvbWl6ZXIsIGtleSwgdmFsdWUsIHN0YWNrKSk7XG4gIH0pO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG52YXIgX2Jhc2VDbG9uZSA9IGJhc2VDbG9uZTtcblxuLyoqIFVzZWQgdG8gY29tcG9zZSBiaXRtYXNrcyBmb3IgY2xvbmluZy4gKi9cbnZhciBDTE9ORV9ERUVQX0ZMQUckMyA9IDEsXG4gICAgQ0xPTkVfU1lNQk9MU19GTEFHJDEgPSA0O1xuXG4vKipcbiAqIFRoaXMgbWV0aG9kIGlzIGxpa2UgYF8uY2xvbmVgIGV4Y2VwdCB0aGF0IGl0IHJlY3Vyc2l2ZWx5IGNsb25lcyBgdmFsdWVgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMS4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byByZWN1cnNpdmVseSBjbG9uZS5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBkZWVwIGNsb25lZCB2YWx1ZS5cbiAqIEBzZWUgXy5jbG9uZVxuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgb2JqZWN0cyA9IFt7ICdhJzogMSB9LCB7ICdiJzogMiB9XTtcbiAqXG4gKiB2YXIgZGVlcCA9IF8uY2xvbmVEZWVwKG9iamVjdHMpO1xuICogY29uc29sZS5sb2coZGVlcFswXSA9PT0gb2JqZWN0c1swXSk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBjbG9uZURlZXAodmFsdWUpIHtcbiAgcmV0dXJuIF9iYXNlQ2xvbmUodmFsdWUsIENMT05FX0RFRVBfRkxBRyQzIHwgQ0xPTkVfU1lNQk9MU19GTEFHJDEpO1xufVxuXG52YXIgY2xvbmVEZWVwXzEgPSBjbG9uZURlZXA7XG5cbmZ1bmN0aW9uIGVycm9ySGFuZGxlciAoZXJyb3JPclN0cmluZywgdm0pIHtcbiAgdmFyIGVycm9yID0gKHR5cGVvZiBlcnJvck9yU3RyaW5nID09PSAnb2JqZWN0JylcbiAgICA/IGVycm9yT3JTdHJpbmdcbiAgICA6IG5ldyBFcnJvcihlcnJvck9yU3RyaW5nKTtcblxuICB2bS5fZXJyb3IgPSBlcnJvcjtcblxuICB0aHJvdyBlcnJvclxufVxuXG4vLyBcblxuZnVuY3Rpb24gY3JlYXRlTG9jYWxWdWUgKCkge1xuICB2YXIgaW5zdGFuY2UgPSBWdWUuZXh0ZW5kKCk7XG5cbiAgLy8gY2xvbmUgZ2xvYmFsIEFQSXNcbiAgT2JqZWN0LmtleXMoVnVlKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICBpZiAoIWluc3RhbmNlLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgIHZhciBvcmlnaW5hbCA9IFZ1ZVtrZXldO1xuICAgICAgaW5zdGFuY2Vba2V5XSA9IHR5cGVvZiBvcmlnaW5hbCA9PT0gJ29iamVjdCdcbiAgICAgICAgPyBjbG9uZURlZXBfMShvcmlnaW5hbClcbiAgICAgICAgOiBvcmlnaW5hbDtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIGNvbmZpZyBpcyBub3QgZW51bWVyYWJsZVxuICBpbnN0YW5jZS5jb25maWcgPSBjbG9uZURlZXBfMShWdWUuY29uZmlnKTtcblxuICBpbnN0YW5jZS5jb25maWcuZXJyb3JIYW5kbGVyID0gZXJyb3JIYW5kbGVyO1xuXG4gIC8vIG9wdGlvbiBtZXJnZSBzdHJhdGVnaWVzIG5lZWQgdG8gYmUgZXhwb3NlZCBieSByZWZlcmVuY2VcbiAgLy8gc28gdGhhdCBtZXJnZSBzdHJhdHMgcmVnaXN0ZXJlZCBieSBwbHVnaW5zIGNhbiB3b3JrIHByb3Blcmx5XG4gIGluc3RhbmNlLmNvbmZpZy5vcHRpb25NZXJnZVN0cmF0ZWdpZXMgPSBWdWUuY29uZmlnLm9wdGlvbk1lcmdlU3RyYXRlZ2llcztcblxuICAvLyBtYWtlIHN1cmUgYWxsIGV4dGVuZHMgYXJlIGJhc2VkIG9uIHRoaXMgaW5zdGFuY2UuXG4gIC8vIHRoaXMgaXMgaW1wb3J0YW50IHNvIHRoYXQgZ2xvYmFsIGNvbXBvbmVudHMgcmVnaXN0ZXJlZCBieSBwbHVnaW5zLFxuICAvLyBlLmcuIHJvdXRlci1saW5rIGFyZSBjcmVhdGVkIHVzaW5nIHRoZSBjb3JyZWN0IGJhc2UgY29uc3RydWN0b3JcbiAgaW5zdGFuY2Uub3B0aW9ucy5fYmFzZSA9IGluc3RhbmNlO1xuXG4gIC8vIGNvbXBhdCBmb3IgdnVlLXJvdXRlciA8IDIuNy4xIHdoZXJlIGl0IGRvZXMgbm90IGFsbG93IG11bHRpcGxlIGluc3RhbGxzXG4gIGlmIChpbnN0YW5jZS5faW5zdGFsbGVkUGx1Z2lucyAmJiBpbnN0YW5jZS5faW5zdGFsbGVkUGx1Z2lucy5sZW5ndGgpIHtcbiAgICBpbnN0YW5jZS5faW5zdGFsbGVkUGx1Z2lucy5sZW5ndGggPSAwO1xuICB9XG4gIHZhciB1c2UgPSBpbnN0YW5jZS51c2U7XG4gIGluc3RhbmNlLnVzZSA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcbiAgICB2YXIgcmVzdCA9IFtdLCBsZW4gPSBhcmd1bWVudHMubGVuZ3RoIC0gMTtcbiAgICB3aGlsZSAoIGxlbi0tID4gMCApIHJlc3RbIGxlbiBdID0gYXJndW1lbnRzWyBsZW4gKyAxIF07XG5cbiAgICBpZiAocGx1Z2luLmluc3RhbGxlZCA9PT0gdHJ1ZSkge1xuICAgICAgcGx1Z2luLmluc3RhbGxlZCA9IGZhbHNlO1xuICAgIH1cbiAgICBpZiAocGx1Z2luLmluc3RhbGwgJiYgcGx1Z2luLmluc3RhbGwuaW5zdGFsbGVkID09PSB0cnVlKSB7XG4gICAgICBwbHVnaW4uaW5zdGFsbC5pbnN0YWxsZWQgPSBmYWxzZTtcbiAgICB9XG4gICAgdXNlLmNhbGwuYXBwbHkodXNlLCBbIGluc3RhbmNlLCBwbHVnaW4gXS5jb25jYXQoIHJlc3QgKSk7XG4gIH07XG4gIHJldHVybiBpbnN0YW5jZVxufVxuXG4vLyBcblxuZnVuY3Rpb24gZ2V0T3B0aW9ucyAoa2V5LCBvcHRpb25zLCBjb25maWcpIHtcbiAgaWYgKG9wdGlvbnMgfHxcbiAgICAoY29uZmlnW2tleV0gJiYgT2JqZWN0LmtleXMoY29uZmlnW2tleV0pLmxlbmd0aCA+IDApKSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkob3B0aW9ucykpIHtcbiAgICAgIHJldHVybiBvcHRpb25zLmNvbmNhdCggT2JqZWN0LmtleXMoY29uZmlnW2tleV0gfHwge30pKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgY29uZmlnW2tleV0sXG4gICAgICAgIG9wdGlvbnMpXG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIG1lcmdlT3B0aW9ucyAoXG4gIG9wdGlvbnMsXG4gIGNvbmZpZ1xuKSB7XG4gIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCBvcHRpb25zLFxuICAgIHtzdHViczogZ2V0T3B0aW9ucygnc3R1YnMnLCBvcHRpb25zLnN0dWJzLCBjb25maWcpLFxuICAgIG1vY2tzOiBnZXRPcHRpb25zKCdtb2NrcycsIG9wdGlvbnMubW9ja3MsIGNvbmZpZyksXG4gICAgbWV0aG9kczogZ2V0T3B0aW9ucygnbWV0aG9kcycsIG9wdGlvbnMubWV0aG9kcywgY29uZmlnKX0pXG59XG5cbi8vIFxuXG5mdW5jdGlvbiBnZXRSZWFsQ2hpbGQgKHZub2RlKSB7XG4gIHZhciBjb21wT3B0aW9ucyA9IHZub2RlICYmIHZub2RlLmNvbXBvbmVudE9wdGlvbnM7XG4gIGlmIChjb21wT3B0aW9ucyAmJiBjb21wT3B0aW9ucy5DdG9yLm9wdGlvbnMuYWJzdHJhY3QpIHtcbiAgICByZXR1cm4gZ2V0UmVhbENoaWxkKGdldEZpcnN0Q29tcG9uZW50Q2hpbGQoY29tcE9wdGlvbnMuY2hpbGRyZW4pKVxuICB9IGVsc2Uge1xuICAgIHJldHVybiB2bm9kZVxuICB9XG59XG5cbmZ1bmN0aW9uIGlzU2FtZUNoaWxkIChjaGlsZCwgb2xkQ2hpbGQpIHtcbiAgcmV0dXJuIG9sZENoaWxkLmtleSA9PT0gY2hpbGQua2V5ICYmIG9sZENoaWxkLnRhZyA9PT0gY2hpbGQudGFnXG59XG5cbmZ1bmN0aW9uIGdldEZpcnN0Q29tcG9uZW50Q2hpbGQgKGNoaWxkcmVuKSB7XG4gIGlmIChBcnJheS5pc0FycmF5KGNoaWxkcmVuKSkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBjID0gY2hpbGRyZW5baV07XG4gICAgICBpZiAoYyAmJiAoYy5jb21wb25lbnRPcHRpb25zIHx8IGlzQXN5bmNQbGFjZWhvbGRlcihjKSkpIHtcbiAgICAgICAgcmV0dXJuIGNcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNQcmltaXRpdmUgKHZhbHVlKSB7XG4gIHJldHVybiAoXG4gICAgdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyB8fFxuICAgIHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgfHxcbiAgICAvLyAkRmxvd0lnbm9yZVxuICAgIHR5cGVvZiB2YWx1ZSA9PT0gJ3N5bWJvbCcgfHxcbiAgICB0eXBlb2YgdmFsdWUgPT09ICdib29sZWFuJ1xuICApXG59XG5cbmZ1bmN0aW9uIGlzQXN5bmNQbGFjZWhvbGRlciAobm9kZSkge1xuICByZXR1cm4gbm9kZS5pc0NvbW1lbnQgJiYgbm9kZS5hc3luY0ZhY3Rvcnlcbn1cblxuZnVuY3Rpb24gaGFzUGFyZW50VHJhbnNpdGlvbiAodm5vZGUpIHtcbiAgd2hpbGUgKCh2bm9kZSA9IHZub2RlLnBhcmVudCkpIHtcbiAgICBpZiAodm5vZGUuZGF0YS50cmFuc2l0aW9uKSB7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgfVxufVxuXG52YXIgVHJhbnNpdGlvblN0dWIgPSB7XG4gIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyIChoKSB7XG4gICAgdmFyIGNoaWxkcmVuID0gdGhpcy4kb3B0aW9ucy5fcmVuZGVyQ2hpbGRyZW47XG4gICAgaWYgKCFjaGlsZHJlbikge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgLy8gZmlsdGVyIG91dCB0ZXh0IG5vZGVzIChwb3NzaWJsZSB3aGl0ZXNwYWNlcylcbiAgICBjaGlsZHJlbiA9IGNoaWxkcmVuLmZpbHRlcihmdW5jdGlvbiAoYykgeyByZXR1cm4gYy50YWcgfHwgaXNBc3luY1BsYWNlaG9sZGVyKGMpOyB9KTtcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICBpZiAoIWNoaWxkcmVuLmxlbmd0aCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgLy8gd2FybiBtdWx0aXBsZSBlbGVtZW50c1xuICAgIGlmIChjaGlsZHJlbi5sZW5ndGggPiAxKSB7XG4gICAgICB3YXJuKFxuICAgICAgICAnPHRyYW5zaXRpb24+IGNhbiBvbmx5IGJlIHVzZWQgb24gYSBzaW5nbGUgZWxlbWVudC4gVXNlICcgK1xuICAgICAgICAgJzx0cmFuc2l0aW9uLWdyb3VwPiBmb3IgbGlzdHMuJ1xuICAgICAgKTtcbiAgICB9XG5cbiAgICB2YXIgbW9kZSA9IHRoaXMubW9kZTtcblxuICAgIC8vIHdhcm4gaW52YWxpZCBtb2RlXG4gICAgaWYgKG1vZGUgJiYgbW9kZSAhPT0gJ2luLW91dCcgJiYgbW9kZSAhPT0gJ291dC1pbidcbiAgICApIHtcbiAgICAgIHdhcm4oXG4gICAgICAgICdpbnZhbGlkIDx0cmFuc2l0aW9uPiBtb2RlOiAnICsgbW9kZVxuICAgICAgKTtcbiAgICB9XG5cbiAgICB2YXIgcmF3Q2hpbGQgPSBjaGlsZHJlblswXTtcblxuICAgIC8vIGlmIHRoaXMgaXMgYSBjb21wb25lbnQgcm9vdCBub2RlIGFuZCB0aGUgY29tcG9uZW50J3NcbiAgICAvLyBwYXJlbnQgY29udGFpbmVyIG5vZGUgYWxzbyBoYXMgdHJhbnNpdGlvbiwgc2tpcC5cbiAgICBpZiAoaGFzUGFyZW50VHJhbnNpdGlvbih0aGlzLiR2bm9kZSkpIHtcbiAgICAgIHJldHVybiByYXdDaGlsZFxuICAgIH1cblxuICAgIC8vIGFwcGx5IHRyYW5zaXRpb24gZGF0YSB0byBjaGlsZFxuICAgIC8vIHVzZSBnZXRSZWFsQ2hpbGQoKSB0byBpZ25vcmUgYWJzdHJhY3QgY29tcG9uZW50cyBlLmcuIGtlZXAtYWxpdmVcbiAgICB2YXIgY2hpbGQgPSBnZXRSZWFsQ2hpbGQocmF3Q2hpbGQpO1xuXG4gICAgaWYgKCFjaGlsZCkge1xuICAgICAgcmV0dXJuIHJhd0NoaWxkXG4gICAgfVxuXG4gICAgdmFyIGlkID0gXCJfX3RyYW5zaXRpb24tXCIgKyAodGhpcy5fdWlkKSArIFwiLVwiO1xuICAgIGNoaWxkLmtleSA9IGNoaWxkLmtleSA9PSBudWxsXG4gICAgICA/IGNoaWxkLmlzQ29tbWVudFxuICAgICAgICA/IGlkICsgJ2NvbW1lbnQnXG4gICAgICAgIDogaWQgKyBjaGlsZC50YWdcbiAgICAgIDogaXNQcmltaXRpdmUoY2hpbGQua2V5KVxuICAgICAgICA/IChTdHJpbmcoY2hpbGQua2V5KS5pbmRleE9mKGlkKSA9PT0gMCA/IGNoaWxkLmtleSA6IGlkICsgY2hpbGQua2V5KVxuICAgICAgICA6IGNoaWxkLmtleTtcblxuICAgIHZhciBkYXRhID0gKGNoaWxkLmRhdGEgfHwgKGNoaWxkLmRhdGEgPSB7fSkpO1xuICAgIHZhciBvbGRSYXdDaGlsZCA9IHRoaXMuX3Zub2RlO1xuICAgIHZhciBvbGRDaGlsZCA9IGdldFJlYWxDaGlsZChvbGRSYXdDaGlsZCk7XG4gICAgaWYgKGNoaWxkLmRhdGEuZGlyZWN0aXZlcyAmJiBjaGlsZC5kYXRhLmRpcmVjdGl2ZXMuc29tZShmdW5jdGlvbiAoZCkgeyByZXR1cm4gZC5uYW1lID09PSAnc2hvdyc7IH0pKSB7XG4gICAgICBjaGlsZC5kYXRhLnNob3cgPSB0cnVlO1xuICAgIH1cblxuICAgIC8vIG1hcmsgdi1zaG93XG4gICAgLy8gc28gdGhhdCB0aGUgdHJhbnNpdGlvbiBtb2R1bGUgY2FuIGhhbmQgb3ZlciB0aGUgY29udHJvbCB0byB0aGUgZGlyZWN0aXZlXG4gICAgaWYgKGNoaWxkLmRhdGEuZGlyZWN0aXZlcyAmJiBjaGlsZC5kYXRhLmRpcmVjdGl2ZXMuc29tZShmdW5jdGlvbiAoZCkgeyByZXR1cm4gZC5uYW1lID09PSAnc2hvdyc7IH0pKSB7XG4gICAgICBjaGlsZC5kYXRhLnNob3cgPSB0cnVlO1xuICAgIH1cbiAgICBpZiAoXG4gICAgICBvbGRDaGlsZCAmJlxuICAgICAgICAgb2xkQ2hpbGQuZGF0YSAmJlxuICAgICAgICAgIWlzU2FtZUNoaWxkKGNoaWxkLCBvbGRDaGlsZCkgJiZcbiAgICAgICAgICFpc0FzeW5jUGxhY2Vob2xkZXIob2xkQ2hpbGQpICYmXG4gICAgICAgICAvLyAjNjY4NyBjb21wb25lbnQgcm9vdCBpcyBhIGNvbW1lbnQgbm9kZVxuICAgICAgICAgIShvbGRDaGlsZC5jb21wb25lbnRJbnN0YW5jZSAmJiBvbGRDaGlsZC5jb21wb25lbnRJbnN0YW5jZS5fdm5vZGUuaXNDb21tZW50KVxuICAgICkge1xuICAgICAgb2xkQ2hpbGQuZGF0YSA9IE9iamVjdC5hc3NpZ24oe30sIGRhdGEpO1xuICAgIH1cbiAgICByZXR1cm4gcmF3Q2hpbGRcbiAgfVxufVxuXG4vLyBcblxudmFyIFRyYW5zaXRpb25Hcm91cFN0dWIgPSB7XG4gIHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyIChoKSB7XG4gICAgdmFyIHRhZyA9IHRoaXMudGFnIHx8IHRoaXMuJHZub2RlLmRhdGEudGFnIHx8ICdzcGFuJztcbiAgICB2YXIgY2hpbGRyZW4gPSB0aGlzLiRzbG90cy5kZWZhdWx0IHx8IFtdO1xuXG4gICAgcmV0dXJuIGgodGFnLCBudWxsLCBjaGlsZHJlbilcbiAgfVxufVxuXG52YXIgY29uZmlnID0ge1xuICBzdHViczoge1xuICAgIHRyYW5zaXRpb246IFRyYW5zaXRpb25TdHViLFxuICAgICd0cmFuc2l0aW9uLWdyb3VwJzogVHJhbnNpdGlvbkdyb3VwU3R1YlxuICB9LFxuICBtb2Nrczoge30sXG4gIG1ldGhvZHM6IHt9XG59XG5cbi8vIFxuXG5WdWUuY29uZmlnLnByb2R1Y3Rpb25UaXAgPSBmYWxzZTtcblZ1ZS5jb25maWcuZGV2dG9vbHMgPSBmYWxzZTtcblZ1ZS5jb25maWcuZXJyb3JIYW5kbGVyID0gZXJyb3JIYW5kbGVyO1xuXG5mdW5jdGlvbiBtb3VudCAoY29tcG9uZW50LCBvcHRpb25zKSB7XG4gIGlmICggb3B0aW9ucyA9PT0gdm9pZCAwICkgb3B0aW9ucyA9IHt9O1xuXG4gIC8vIFJlbW92ZSBjYWNoZWQgY29uc3RydWN0b3JcbiAgZGVsZXRlIGNvbXBvbmVudC5fQ3RvcjtcbiAgdmFyIHZ1ZUNsYXNzID0gb3B0aW9ucy5sb2NhbFZ1ZSB8fCBjcmVhdGVMb2NhbFZ1ZSgpO1xuICB2YXIgdm0gPSBjcmVhdGVJbnN0YW5jZShjb21wb25lbnQsIG1lcmdlT3B0aW9ucyhvcHRpb25zLCBjb25maWcpLCB2dWVDbGFzcyk7XG5cbiAgaWYgKG9wdGlvbnMuYXR0YWNoVG9Eb2N1bWVudCkge1xuICAgIHZtLiRtb3VudChjcmVhdGVFbGVtZW50KCkpO1xuICB9IGVsc2Uge1xuICAgIHZtLiRtb3VudCgpO1xuICB9XG5cbiAgdmFyIGNvbXBvbmVudFdpdGhFcnJvciA9IGZpbmRBbGxWdWVDb21wb25lbnRzRnJvbVZtKHZtKS5maW5kKGZ1bmN0aW9uIChjKSB7IHJldHVybiBjLl9lcnJvcjsgfSk7XG5cbiAgaWYgKGNvbXBvbmVudFdpdGhFcnJvcikge1xuICAgIHRocm93IChjb21wb25lbnRXaXRoRXJyb3IuX2Vycm9yKVxuICB9XG5cbiAgdmFyIHdyYXBwcGVyT3B0aW9ucyA9IHtcbiAgICBhdHRhY2hlZFRvRG9jdW1lbnQ6ICEhb3B0aW9ucy5hdHRhY2hUb0RvY3VtZW50LFxuICAgIHN5bmM6ICEhKChvcHRpb25zLnN5bmMgfHwgb3B0aW9ucy5zeW5jID09PSB1bmRlZmluZWQpKVxuICB9O1xuXG4gIHJldHVybiBuZXcgVnVlV3JhcHBlcih2bSwgd3JhcHBwZXJPcHRpb25zKVxufVxuXG4vLyBcblxuZnVuY3Rpb24gc2hhbGxvdyAoXG4gIGNvbXBvbmVudCxcbiAgb3B0aW9uc1xuKSB7XG4gIGlmICggb3B0aW9ucyA9PT0gdm9pZCAwICkgb3B0aW9ucyA9IHt9O1xuXG4gIHZhciB2dWUgPSBvcHRpb25zLmxvY2FsVnVlIHx8IFZ1ZTtcblxuICAvLyByZW1vdmUgYW55IHJlY3Vyc2l2ZSBjb21wb25lbnRzIGFkZGVkIHRvIHRoZSBjb25zdHJ1Y3RvclxuICAvLyBpbiB2bS5faW5pdCBmcm9tIHByZXZpb3VzIHRlc3RzXG4gIGlmIChjb21wb25lbnQubmFtZSAmJiBjb21wb25lbnQuY29tcG9uZW50cykge1xuICAgIGRlbGV0ZSBjb21wb25lbnQuY29tcG9uZW50c1tjYXBpdGFsaXplKGNhbWVsaXplKGNvbXBvbmVudC5uYW1lKSldO1xuICAgIGRlbGV0ZSBjb21wb25lbnQuY29tcG9uZW50c1toeXBoZW5hdGUoY29tcG9uZW50Lm5hbWUpXTtcbiAgfVxuXG4gIHZhciBzdHViYmVkQ29tcG9uZW50cyA9IGNyZWF0ZUNvbXBvbmVudFN0dWJzRm9yQWxsKGNvbXBvbmVudCk7XG4gIHZhciBzdHViYmVkR2xvYmFsQ29tcG9uZW50cyA9IGNyZWF0ZUNvbXBvbmVudFN0dWJzRm9yR2xvYmFscyh2dWUpO1xuXG4gIHJldHVybiBtb3VudChjb21wb25lbnQsIE9iamVjdC5hc3NpZ24oe30sIG9wdGlvbnMsXG4gICAge2NvbXBvbmVudHM6IE9iamVjdC5hc3NpZ24oe30sIHN0dWJiZWRHbG9iYWxDb21wb25lbnRzLFxuICAgICAgc3R1YmJlZENvbXBvbmVudHMpfSkpXG59XG5cbi8vIFxudmFyIHRvVHlwZXMgPSBbU3RyaW5nLCBPYmplY3RdO1xudmFyIGV2ZW50VHlwZXMgPSBbU3RyaW5nLCBBcnJheV07XG5cbnZhciBSb3V0ZXJMaW5rU3R1YiA9IHtcbiAgbmFtZTogJ1JvdXRlckxpbmtTdHViJyxcbiAgcHJvcHM6IHtcbiAgICB0bzoge1xuICAgICAgdHlwZTogdG9UeXBlcyxcbiAgICAgIHJlcXVpcmVkOiB0cnVlXG4gICAgfSxcbiAgICB0YWc6IHtcbiAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgIGRlZmF1bHQ6ICdhJ1xuICAgIH0sXG4gICAgZXhhY3Q6IEJvb2xlYW4sXG4gICAgYXBwZW5kOiBCb29sZWFuLFxuICAgIHJlcGxhY2U6IEJvb2xlYW4sXG4gICAgYWN0aXZlQ2xhc3M6IFN0cmluZyxcbiAgICBleGFjdEFjdGl2ZUNsYXNzOiBTdHJpbmcsXG4gICAgZXZlbnQ6IHtcbiAgICAgIHR5cGU6IGV2ZW50VHlwZXMsXG4gICAgICBkZWZhdWx0OiAnY2xpY2snXG4gICAgfVxuICB9LFxuICByZW5kZXI6IGZ1bmN0aW9uIHJlbmRlciAoaCkge1xuICAgIHJldHVybiBoKHRoaXMudGFnLCB1bmRlZmluZWQsIHRoaXMuJHNsb3RzLmRlZmF1bHQpXG4gIH1cbn1cblxudmFyIGluZGV4ID0ge1xuICBjcmVhdGVMb2NhbFZ1ZTogY3JlYXRlTG9jYWxWdWUsXG4gIGNvbmZpZzogY29uZmlnLFxuICBtb3VudDogbW91bnQsXG4gIHNoYWxsb3c6IHNoYWxsb3csXG4gIFRyYW5zaXRpb25TdHViOiBUcmFuc2l0aW9uU3R1YixcbiAgVHJhbnNpdGlvbkdyb3VwU3R1YjogVHJhbnNpdGlvbkdyb3VwU3R1YixcbiAgUm91dGVyTGlua1N0dWI6IFJvdXRlckxpbmtTdHViXG59XG5cbm1vZHVsZS5leHBvcnRzID0gaW5kZXg7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldD11dGYtODtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaWRuVmxMWFJsYzNRdGRYUnBiSE11YW5NaUxDSnpiM1Z5WTJWeklqcGJJaTR1THk0dUwzTm9ZWEpsWkM5MWRHbHNMbXB6SWl3aUxpNHZjM0pqTDNkaGNtNHRhV1l0Ym04dGQybHVaRzkzTG1weklpd2lMaTR2YzNKakwyMWhkR05vWlhNdGNHOXNlV1pwYkd3dWFuTWlMQ0l1TGk5emNtTXZiMkpxWldOMExXRnpjMmxuYmkxd2IyeDVabWxzYkM1cWN5SXNJaTR1THk0dUwzTm9ZWEpsWkM5MllXeHBaR0YwYjNKekxtcHpJaXdpTGk0dmMzSmpMMk52Ym5OMGN5NXFjeUlzSWk0dUwzTnlZeTluWlhRdGMyVnNaV04wYjNJdGRIbHdaUzVxY3lJc0lpNHVMM055WXk5bWFXNWtMWFoxWlMxamIyMXdiMjVsYm5SekxtcHpJaXdpTGk0dmMzSmpMM2R5WVhCd1pYSXRZWEp5WVhrdWFuTWlMQ0l1TGk5emNtTXZaWEp5YjNJdGQzSmhjSEJsY2k1cWN5SXNJaTR1TDNOeVl5OW1hVzVrTFhadWIyUmxjeTVxY3lJc0lpNHVMM055WXk5bWFXNWtMV1J2YlMxdWIyUmxjeTVxY3lJc0lpNHVMM055WXk5bWFXNWtMbXB6SWl3aUxpNHZjM0pqTDJOeVpXRjBaUzEzY21Gd2NHVnlMbXB6SWl3aUxpNHZjM0pqTDI5eVpHVnlMWGRoZEdOb1pYSnpMbXB6SWl3aUxpNHZjM0pqTDNkeVlYQndaWEl1YW5NaUxDSXVMaTl6Y21NdmMyVjBMWGRoZEdOb1pYSnpMWFJ2TFhONWJtTXVhbk1pTENJdUxpOXpjbU12ZG5WbExYZHlZWEJ3WlhJdWFuTWlMQ0l1TGk4dUxpOWpjbVZoZEdVdGFXNXpkR0Z1WTJVdmRtRnNhV1JoZEdVdGMyeHZkSE11YW5NaUxDSXVMaTh1TGk5amNtVmhkR1V0YVc1emRHRnVZMlV2WVdSa0xYTnNiM1J6TG1weklpd2lMaTR2TGk0dlkzSmxZWFJsTFdsdWMzUmhibU5sTDJGa1pDMXpZMjl3WldRdGMyeHZkSE11YW5NaUxDSXVMaTh1TGk5amNtVmhkR1V0YVc1emRHRnVZMlV2WVdSa0xXMXZZMnR6TG1weklpd2lMaTR2TGk0dlkzSmxZWFJsTFdsdWMzUmhibU5sTDJGa1pDMWhkSFJ5Y3k1cWN5SXNJaTR1THk0dUwyTnlaV0YwWlMxcGJuTjBZVzVqWlM5aFpHUXRiR2x6ZEdWdVpYSnpMbXB6SWl3aUxpNHZMaTR2WTNKbFlYUmxMV2x1YzNSaGJtTmxMMkZrWkMxd2NtOTJhV1JsTG1weklpd2lMaTR2TGk0dlkzSmxZWFJsTFdsdWMzUmhibU5sTDJ4dlp5MWxkbVZ1ZEhNdWFuTWlMQ0l1TGk4dUxpOXphR0Z5WldRdlkyOXRjR2xzWlMxMFpXMXdiR0YwWlM1cWN5SXNJaTR1THk0dUwzTm9ZWEpsWkM5emRIVmlMV052YlhCdmJtVnVkSE11YW5NaUxDSXVMaTh1TGk5amNtVmhkR1V0YVc1emRHRnVZMlV2WTI5dGNHbHNaUzEwWlcxd2JHRjBaUzVxY3lJc0lpNHVMeTR1TDJOeVpXRjBaUzFwYm5OMFlXNWpaUzlrWld4bGRHVXRiVzkxYm5ScGJtY3RiM0IwYVc5dWN5NXFjeUlzSWk0dUx5NHVMMk55WldGMFpTMXBibk4wWVc1alpTOWpjbVZoZEdVdFpuVnVZM1JwYjI1aGJDMWpiMjF3YjI1bGJuUXVhbk1pTENJdUxpOHVMaTlqY21WaGRHVXRhVzV6ZEdGdVkyVXZZM0psWVhSbExXbHVjM1JoYm1ObExtcHpJaXdpTGk0dmMzSmpMMk55WldGMFpTMWxiR1Z0Wlc1MExtcHpJaXdpTGk0dkxpNHZMaTR2Ym05a1pWOXRiMlIxYkdWekwyeHZaR0Z6YUM5ZmJHbHpkRU5oWTJobFEyeGxZWEl1YW5NaUxDSXVMaTh1TGk4dUxpOXViMlJsWDIxdlpIVnNaWE12Ykc5a1lYTm9MMlZ4TG1weklpd2lMaTR2TGk0dkxpNHZibTlrWlY5dGIyUjFiR1Z6TDJ4dlpHRnphQzlmWVhOemIyTkpibVJsZUU5bUxtcHpJaXdpTGk0dkxpNHZMaTR2Ym05a1pWOXRiMlIxYkdWekwyeHZaR0Z6YUM5ZmJHbHpkRU5oWTJobFJHVnNaWFJsTG1weklpd2lMaTR2TGk0dkxpNHZibTlrWlY5dGIyUjFiR1Z6TDJ4dlpHRnphQzlmYkdsemRFTmhZMmhsUjJWMExtcHpJaXdpTGk0dkxpNHZMaTR2Ym05a1pWOXRiMlIxYkdWekwyeHZaR0Z6YUM5ZmJHbHpkRU5oWTJobFNHRnpMbXB6SWl3aUxpNHZMaTR2TGk0dmJtOWtaVjl0YjJSMWJHVnpMMnh2WkdGemFDOWZiR2x6ZEVOaFkyaGxVMlYwTG1weklpd2lMaTR2TGk0dkxpNHZibTlrWlY5dGIyUjFiR1Z6TDJ4dlpHRnphQzlmVEdsemRFTmhZMmhsTG1weklpd2lMaTR2TGk0dkxpNHZibTlrWlY5dGIyUjFiR1Z6TDJ4dlpHRnphQzlmYzNSaFkydERiR1ZoY2k1cWN5SXNJaTR1THk0dUx5NHVMMjV2WkdWZmJXOWtkV3hsY3k5c2IyUmhjMmd2WDNOMFlXTnJSR1ZzWlhSbExtcHpJaXdpTGk0dkxpNHZMaTR2Ym05a1pWOXRiMlIxYkdWekwyeHZaR0Z6YUM5ZmMzUmhZMnRIWlhRdWFuTWlMQ0l1TGk4dUxpOHVMaTl1YjJSbFgyMXZaSFZzWlhNdmJHOWtZWE5vTDE5emRHRmphMGhoY3k1cWN5SXNJaTR1THk0dUx5NHVMMjV2WkdWZmJXOWtkV3hsY3k5c2IyUmhjMmd2WDJaeVpXVkhiRzlpWVd3dWFuTWlMQ0l1TGk4dUxpOHVMaTl1YjJSbFgyMXZaSFZzWlhNdmJHOWtZWE5vTDE5eWIyOTBMbXB6SWl3aUxpNHZMaTR2TGk0dmJtOWtaVjl0YjJSMWJHVnpMMnh2WkdGemFDOWZVM2x0WW05c0xtcHpJaXdpTGk0dkxpNHZMaTR2Ym05a1pWOXRiMlIxYkdWekwyeHZaR0Z6YUM5ZloyVjBVbUYzVkdGbkxtcHpJaXdpTGk0dkxpNHZMaTR2Ym05a1pWOXRiMlIxYkdWekwyeHZaR0Z6YUM5ZmIySnFaV04wVkc5VGRISnBibWN1YW5NaUxDSXVMaTh1TGk4dUxpOXViMlJsWDIxdlpIVnNaWE12Ykc5a1lYTm9MMTlpWVhObFIyVjBWR0ZuTG1weklpd2lMaTR2TGk0dkxpNHZibTlrWlY5dGIyUjFiR1Z6TDJ4dlpHRnphQzlwYzA5aWFtVmpkQzVxY3lJc0lpNHVMeTR1THk0dUwyNXZaR1ZmYlc5a2RXeGxjeTlzYjJSaGMyZ3ZhWE5HZFc1amRHbHZiaTVxY3lJc0lpNHVMeTR1THk0dUwyNXZaR1ZmYlc5a2RXeGxjeTlzYjJSaGMyZ3ZYMk52Y21WS2MwUmhkR0V1YW5NaUxDSXVMaTh1TGk4dUxpOXViMlJsWDIxdlpIVnNaWE12Ykc5a1lYTm9MMTlwYzAxaGMydGxaQzVxY3lJc0lpNHVMeTR1THk0dUwyNXZaR1ZmYlc5a2RXeGxjeTlzYjJSaGMyZ3ZYM1J2VTI5MWNtTmxMbXB6SWl3aUxpNHZMaTR2TGk0dmJtOWtaVjl0YjJSMWJHVnpMMnh2WkdGemFDOWZZbUZ6WlVselRtRjBhWFpsTG1weklpd2lMaTR2TGk0dkxpNHZibTlrWlY5dGIyUjFiR1Z6TDJ4dlpHRnphQzlmWjJWMFZtRnNkV1V1YW5NaUxDSXVMaTh1TGk4dUxpOXViMlJsWDIxdlpIVnNaWE12Ykc5a1lYTm9MMTluWlhST1lYUnBkbVV1YW5NaUxDSXVMaTh1TGk4dUxpOXViMlJsWDIxdlpIVnNaWE12Ykc5a1lYTm9MMTlOWVhBdWFuTWlMQ0l1TGk4dUxpOHVMaTl1YjJSbFgyMXZaSFZzWlhNdmJHOWtZWE5vTDE5dVlYUnBkbVZEY21WaGRHVXVhbk1pTENJdUxpOHVMaTh1TGk5dWIyUmxYMjF2WkhWc1pYTXZiRzlrWVhOb0wxOW9ZWE5vUTJ4bFlYSXVhbk1pTENJdUxpOHVMaTh1TGk5dWIyUmxYMjF2WkhWc1pYTXZiRzlrWVhOb0wxOW9ZWE5vUkdWc1pYUmxMbXB6SWl3aUxpNHZMaTR2TGk0dmJtOWtaVjl0YjJSMWJHVnpMMnh2WkdGemFDOWZhR0Z6YUVkbGRDNXFjeUlzSWk0dUx5NHVMeTR1TDI1dlpHVmZiVzlrZFd4bGN5OXNiMlJoYzJndlgyaGhjMmhJWVhNdWFuTWlMQ0l1TGk4dUxpOHVMaTl1YjJSbFgyMXZaSFZzWlhNdmJHOWtZWE5vTDE5b1lYTm9VMlYwTG1weklpd2lMaTR2TGk0dkxpNHZibTlrWlY5dGIyUjFiR1Z6TDJ4dlpHRnphQzlmU0dGemFDNXFjeUlzSWk0dUx5NHVMeTR1TDI1dlpHVmZiVzlrZFd4bGN5OXNiMlJoYzJndlgyMWhjRU5oWTJobFEyeGxZWEl1YW5NaUxDSXVMaTh1TGk4dUxpOXViMlJsWDIxdlpIVnNaWE12Ykc5a1lYTm9MMTlwYzB0bGVXRmliR1V1YW5NaUxDSXVMaTh1TGk4dUxpOXViMlJsWDIxdlpIVnNaWE12Ykc5a1lYTm9MMTluWlhSTllYQkVZWFJoTG1weklpd2lMaTR2TGk0dkxpNHZibTlrWlY5dGIyUjFiR1Z6TDJ4dlpHRnphQzlmYldGd1EyRmphR1ZFWld4bGRHVXVhbk1pTENJdUxpOHVMaTh1TGk5dWIyUmxYMjF2WkhWc1pYTXZiRzlrWVhOb0wxOXRZWEJEWVdOb1pVZGxkQzVxY3lJc0lpNHVMeTR1THk0dUwyNXZaR1ZmYlc5a2RXeGxjeTlzYjJSaGMyZ3ZYMjFoY0VOaFkyaGxTR0Z6TG1weklpd2lMaTR2TGk0dkxpNHZibTlrWlY5dGIyUjFiR1Z6TDJ4dlpHRnphQzlmYldGd1EyRmphR1ZUWlhRdWFuTWlMQ0l1TGk4dUxpOHVMaTl1YjJSbFgyMXZaSFZzWlhNdmJHOWtZWE5vTDE5TllYQkRZV05vWlM1cWN5SXNJaTR1THk0dUx5NHVMMjV2WkdWZmJXOWtkV3hsY3k5c2IyUmhjMmd2WDNOMFlXTnJVMlYwTG1weklpd2lMaTR2TGk0dkxpNHZibTlrWlY5dGIyUjFiR1Z6TDJ4dlpHRnphQzlmVTNSaFkyc3Vhbk1pTENJdUxpOHVMaTh1TGk5dWIyUmxYMjF2WkhWc1pYTXZiRzlrWVhOb0wxOWhjbkpoZVVWaFkyZ3Vhbk1pTENJdUxpOHVMaTh1TGk5dWIyUmxYMjF2WkhWc1pYTXZiRzlrWVhOb0wxOWtaV1pwYm1WUWNtOXdaWEowZVM1cWN5SXNJaTR1THk0dUx5NHVMMjV2WkdWZmJXOWtkV3hsY3k5c2IyUmhjMmd2WDJKaGMyVkJjM05wWjI1V1lXeDFaUzVxY3lJc0lpNHVMeTR1THk0dUwyNXZaR1ZmYlc5a2RXeGxjeTlzYjJSaGMyZ3ZYMkZ6YzJsbmJsWmhiSFZsTG1weklpd2lMaTR2TGk0dkxpNHZibTlrWlY5dGIyUjFiR1Z6TDJ4dlpHRnphQzlmWTI5d2VVOWlhbVZqZEM1cWN5SXNJaTR1THk0dUx5NHVMMjV2WkdWZmJXOWtkV3hsY3k5c2IyUmhjMmd2WDJKaGMyVlVhVzFsY3k1cWN5SXNJaTR1THk0dUx5NHVMMjV2WkdWZmJXOWtkV3hsY3k5c2IyUmhjMmd2YVhOUFltcGxZM1JNYVd0bExtcHpJaXdpTGk0dkxpNHZMaTR2Ym05a1pWOXRiMlIxYkdWekwyeHZaR0Z6YUM5ZlltRnpaVWx6UVhKbmRXMWxiblJ6TG1weklpd2lMaTR2TGk0dkxpNHZibTlrWlY5dGIyUjFiR1Z6TDJ4dlpHRnphQzlwYzBGeVozVnRaVzUwY3k1cWN5SXNJaTR1THk0dUx5NHVMMjV2WkdWZmJXOWtkV3hsY3k5c2IyUmhjMmd2YVhOQmNuSmhlUzVxY3lJc0lpNHVMeTR1THk0dUwyNXZaR1ZmYlc5a2RXeGxjeTlzYjJSaGMyZ3ZjM1IxWWtaaGJITmxMbXB6SWl3aUxpNHZMaTR2TGk0dmJtOWtaVjl0YjJSMWJHVnpMMnh2WkdGemFDOXBjMEoxWm1abGNpNXFjeUlzSWk0dUx5NHVMeTR1TDI1dlpHVmZiVzlrZFd4bGN5OXNiMlJoYzJndlgybHpTVzVrWlhndWFuTWlMQ0l1TGk4dUxpOHVMaTl1YjJSbFgyMXZaSFZzWlhNdmJHOWtZWE5vTDJselRHVnVaM1JvTG1weklpd2lMaTR2TGk0dkxpNHZibTlrWlY5dGIyUjFiR1Z6TDJ4dlpHRnphQzlmWW1GelpVbHpWSGx3WldSQmNuSmhlUzVxY3lJc0lpNHVMeTR1THk0dUwyNXZaR1ZmYlc5a2RXeGxjeTlzYjJSaGMyZ3ZYMkpoYzJWVmJtRnllUzVxY3lJc0lpNHVMeTR1THk0dUwyNXZaR1ZmYlc5a2RXeGxjeTlzYjJSaGMyZ3ZYMjV2WkdWVmRHbHNMbXB6SWl3aUxpNHZMaTR2TGk0dmJtOWtaVjl0YjJSMWJHVnpMMnh2WkdGemFDOXBjMVI1Y0dWa1FYSnlZWGt1YW5NaUxDSXVMaTh1TGk4dUxpOXViMlJsWDIxdlpIVnNaWE12Ykc5a1lYTm9MMTloY25KaGVVeHBhMlZMWlhsekxtcHpJaXdpTGk0dkxpNHZMaTR2Ym05a1pWOXRiMlIxYkdWekwyeHZaR0Z6YUM5ZmFYTlFjbTkwYjNSNWNHVXVhbk1pTENJdUxpOHVMaTh1TGk5dWIyUmxYMjF2WkhWc1pYTXZiRzlrWVhOb0wxOXZkbVZ5UVhKbkxtcHpJaXdpTGk0dkxpNHZMaTR2Ym05a1pWOXRiMlIxYkdWekwyeHZaR0Z6YUM5ZmJtRjBhWFpsUzJWNWN5NXFjeUlzSWk0dUx5NHVMeTR1TDI1dlpHVmZiVzlrZFd4bGN5OXNiMlJoYzJndlgySmhjMlZMWlhsekxtcHpJaXdpTGk0dkxpNHZMaTR2Ym05a1pWOXRiMlIxYkdWekwyeHZaR0Z6YUM5cGMwRnljbUY1VEdsclpTNXFjeUlzSWk0dUx5NHVMeTR1TDI1dlpHVmZiVzlrZFd4bGN5OXNiMlJoYzJndmEyVjVjeTVxY3lJc0lpNHVMeTR1THk0dUwyNXZaR1ZmYlc5a2RXeGxjeTlzYjJSaGMyZ3ZYMkpoYzJWQmMzTnBaMjR1YW5NaUxDSXVMaTh1TGk4dUxpOXViMlJsWDIxdlpIVnNaWE12Ykc5a1lYTm9MMTl1WVhScGRtVkxaWGx6U1c0dWFuTWlMQ0l1TGk4dUxpOHVMaTl1YjJSbFgyMXZaSFZzWlhNdmJHOWtZWE5vTDE5aVlYTmxTMlY1YzBsdUxtcHpJaXdpTGk0dkxpNHZMaTR2Ym05a1pWOXRiMlIxYkdWekwyeHZaR0Z6YUM5clpYbHpTVzR1YW5NaUxDSXVMaTh1TGk4dUxpOXViMlJsWDIxdlpIVnNaWE12Ykc5a1lYTm9MMTlpWVhObFFYTnphV2R1U1c0dWFuTWlMQ0l1TGk4dUxpOHVMaTl1YjJSbFgyMXZaSFZzWlhNdmJHOWtZWE5vTDE5amJHOXVaVUoxWm1abGNpNXFjeUlzSWk0dUx5NHVMeTR1TDI1dlpHVmZiVzlrZFd4bGN5OXNiMlJoYzJndlgyTnZjSGxCY25KaGVTNXFjeUlzSWk0dUx5NHVMeTR1TDI1dlpHVmZiVzlrZFd4bGN5OXNiMlJoYzJndlgyRnljbUY1Um1sc2RHVnlMbXB6SWl3aUxpNHZMaTR2TGk0dmJtOWtaVjl0YjJSMWJHVnpMMnh2WkdGemFDOXpkSFZpUVhKeVlYa3Vhbk1pTENJdUxpOHVMaTh1TGk5dWIyUmxYMjF2WkhWc1pYTXZiRzlrWVhOb0wxOW5aWFJUZVcxaWIyeHpMbXB6SWl3aUxpNHZMaTR2TGk0dmJtOWtaVjl0YjJSMWJHVnpMMnh2WkdGemFDOWZZMjl3ZVZONWJXSnZiSE11YW5NaUxDSXVMaTh1TGk4dUxpOXViMlJsWDIxdlpIVnNaWE12Ykc5a1lYTm9MMTloY25KaGVWQjFjMmd1YW5NaUxDSXVMaTh1TGk4dUxpOXViMlJsWDIxdlpIVnNaWE12Ykc5a1lYTm9MMTluWlhSUWNtOTBiM1I1Y0dVdWFuTWlMQ0l1TGk4dUxpOHVMaTl1YjJSbFgyMXZaSFZzWlhNdmJHOWtZWE5vTDE5blpYUlRlVzFpYjJ4elNXNHVhbk1pTENJdUxpOHVMaTh1TGk5dWIyUmxYMjF2WkhWc1pYTXZiRzlrWVhOb0wxOWpiM0I1VTNsdFltOXNjMGx1TG1weklpd2lMaTR2TGk0dkxpNHZibTlrWlY5dGIyUjFiR1Z6TDJ4dlpHRnphQzlmWW1GelpVZGxkRUZzYkV0bGVYTXVhbk1pTENJdUxpOHVMaTh1TGk5dWIyUmxYMjF2WkhWc1pYTXZiRzlrWVhOb0wxOW5aWFJCYkd4TFpYbHpMbXB6SWl3aUxpNHZMaTR2TGk0dmJtOWtaVjl0YjJSMWJHVnpMMnh2WkdGemFDOWZaMlYwUVd4c1MyVjVjMGx1TG1weklpd2lMaTR2TGk0dkxpNHZibTlrWlY5dGIyUjFiR1Z6TDJ4dlpHRnphQzlmUkdGMFlWWnBaWGN1YW5NaUxDSXVMaTh1TGk4dUxpOXViMlJsWDIxdlpIVnNaWE12Ykc5a1lYTm9MMTlRY205dGFYTmxMbXB6SWl3aUxpNHZMaTR2TGk0dmJtOWtaVjl0YjJSMWJHVnpMMnh2WkdGemFDOWZVMlYwTG1weklpd2lMaTR2TGk0dkxpNHZibTlrWlY5dGIyUjFiR1Z6TDJ4dlpHRnphQzlmVjJWaGEwMWhjQzVxY3lJc0lpNHVMeTR1THk0dUwyNXZaR1ZmYlc5a2RXeGxjeTlzYjJSaGMyZ3ZYMmRsZEZSaFp5NXFjeUlzSWk0dUx5NHVMeTR1TDI1dlpHVmZiVzlrZFd4bGN5OXNiMlJoYzJndlgybHVhWFJEYkc5dVpVRnljbUY1TG1weklpd2lMaTR2TGk0dkxpNHZibTlrWlY5dGIyUjFiR1Z6TDJ4dlpHRnphQzlmVldsdWREaEJjbkpoZVM1cWN5SXNJaTR1THk0dUx5NHVMMjV2WkdWZmJXOWtkV3hsY3k5c2IyUmhjMmd2WDJOc2IyNWxRWEp5WVhsQ2RXWm1aWEl1YW5NaUxDSXVMaTh1TGk4dUxpOXViMlJsWDIxdlpIVnNaWE12Ykc5a1lYTm9MMTlqYkc5dVpVUmhkR0ZXYVdWM0xtcHpJaXdpTGk0dkxpNHZMaTR2Ym05a1pWOXRiMlIxYkdWekwyeHZaR0Z6YUM5ZllXUmtUV0Z3Ulc1MGNua3Vhbk1pTENJdUxpOHVMaTh1TGk5dWIyUmxYMjF2WkhWc1pYTXZiRzlrWVhOb0wxOWhjbkpoZVZKbFpIVmpaUzVxY3lJc0lpNHVMeTR1THk0dUwyNXZaR1ZmYlc5a2RXeGxjeTlzYjJSaGMyZ3ZYMjFoY0ZSdlFYSnlZWGt1YW5NaUxDSXVMaTh1TGk4dUxpOXViMlJsWDIxdlpIVnNaWE12Ykc5a1lYTm9MMTlqYkc5dVpVMWhjQzVxY3lJc0lpNHVMeTR1THk0dUwyNXZaR1ZmYlc5a2RXeGxjeTlzYjJSaGMyZ3ZYMk5zYjI1bFVtVm5SWGh3TG1weklpd2lMaTR2TGk0dkxpNHZibTlrWlY5dGIyUjFiR1Z6TDJ4dlpHRnphQzlmWVdSa1UyVjBSVzUwY25rdWFuTWlMQ0l1TGk4dUxpOHVMaTl1YjJSbFgyMXZaSFZzWlhNdmJHOWtZWE5vTDE5elpYUlViMEZ5Y21GNUxtcHpJaXdpTGk0dkxpNHZMaTR2Ym05a1pWOXRiMlIxYkdWekwyeHZaR0Z6YUM5ZlkyeHZibVZUWlhRdWFuTWlMQ0l1TGk4dUxpOHVMaTl1YjJSbFgyMXZaSFZzWlhNdmJHOWtZWE5vTDE5amJHOXVaVk41YldKdmJDNXFjeUlzSWk0dUx5NHVMeTR1TDI1dlpHVmZiVzlrZFd4bGN5OXNiMlJoYzJndlgyTnNiMjVsVkhsd1pXUkJjbkpoZVM1cWN5SXNJaTR1THk0dUx5NHVMMjV2WkdWZmJXOWtkV3hsY3k5c2IyUmhjMmd2WDJsdWFYUkRiRzl1WlVKNVZHRm5MbXB6SWl3aUxpNHZMaTR2TGk0dmJtOWtaVjl0YjJSMWJHVnpMMnh2WkdGemFDOWZZbUZ6WlVOeVpXRjBaUzVxY3lJc0lpNHVMeTR1THk0dUwyNXZaR1ZmYlc5a2RXeGxjeTlzYjJSaGMyZ3ZYMmx1YVhSRGJHOXVaVTlpYW1WamRDNXFjeUlzSWk0dUx5NHVMeTR1TDI1dlpHVmZiVzlrZFd4bGN5OXNiMlJoYzJndlgySmhjMlZEYkc5dVpTNXFjeUlzSWk0dUx5NHVMeTR1TDI1dlpHVmZiVzlrZFd4bGN5OXNiMlJoYzJndlkyeHZibVZFWldWd0xtcHpJaXdpTGk0dmMzSmpMMlZ5Y205eUxXaGhibVJzWlhJdWFuTWlMQ0l1TGk5emNtTXZZM0psWVhSbExXeHZZMkZzTFhaMVpTNXFjeUlzSWk0dUx5NHVMM05vWVhKbFpDOXRaWEpuWlMxdmNIUnBiMjV6TG1weklpd2lMaTR2YzNKakwyTnZiWEJ2Ym1WdWRITXZWSEpoYm5OcGRHbHZibE4wZFdJdWFuTWlMQ0l1TGk5emNtTXZZMjl0Y0c5dVpXNTBjeTlVY21GdWMybDBhVzl1UjNKdmRYQlRkSFZpTG1weklpd2lMaTR2YzNKakwyTnZibVpwWnk1cWN5SXNJaTR1TDNOeVl5OXRiM1Z1ZEM1cWN5SXNJaTR1TDNOeVl5OXphR0ZzYkc5M0xtcHpJaXdpTGk0dmMzSmpMMk52YlhCdmJtVnVkSE12VW05MWRHVnlUR2x1YTFOMGRXSXVhbk1pTENJdUxpOXpjbU12YVc1a1pYZ3Vhbk1pWFN3aWMyOTFjbU5sYzBOdmJuUmxiblFpT2xzaUx5OGdRR1pzYjNkY2JseHVaWGh3YjNKMElHWjFibU4wYVc5dUlIUm9jbTkzUlhKeWIzSWdLRzF6WnpvZ2MzUnlhVzVuS1NCN1hHNGdJSFJvY205M0lHNWxkeUJGY25KdmNpaGdXM1oxWlMxMFpYTjBMWFYwYVd4elhUb2dKSHR0YzJkOVlDbGNibjFjYmx4dVpYaHdiM0owSUdaMWJtTjBhVzl1SUhkaGNtNGdLRzF6WnpvZ2MzUnlhVzVuS1NCN1hHNGdJR052Ym5OdmJHVXVaWEp5YjNJb1lGdDJkV1V0ZEdWemRDMTFkR2xzYzEwNklDUjdiWE5uZldBcFhHNTlYRzVjYm1OdmJuTjBJR05oYldWc2FYcGxVa1VnUFNBdkxTaGNYSGNwTDJkY2JtVjRjRzl5ZENCamIyNXpkQ0JqWVcxbGJHbDZaU0E5SUNoemRISTZJSE4wY21sdVp5a2dQVDRnYzNSeUxuSmxjR3hoWTJVb1kyRnRaV3hwZW1WU1JTd2dLRjhzSUdNcElEMCtJR01nUHlCakxuUnZWWEJ3WlhKRFlYTmxLQ2tnT2lBbkp5bGNibHh1THlvcVhHNGdLaUJEWVhCcGRHRnNhWHBsSUdFZ2MzUnlhVzVuTGx4dUlDb3ZYRzVsZUhCdmNuUWdZMjl1YzNRZ1kyRndhWFJoYkdsNlpTQTlJQ2h6ZEhJNklITjBjbWx1WnlrZ1BUNGdjM1J5TG1Ob1lYSkJkQ2d3S1M1MGIxVndjR1Z5UTJGelpTZ3BJQ3NnYzNSeUxuTnNhV05sS0RFcFhHNWNiaThxS2x4dUlDb2dTSGx3YUdWdVlYUmxJR0VnWTJGdFpXeERZWE5sSUhOMGNtbHVaeTVjYmlBcUwxeHVZMjl1YzNRZ2FIbHdhR1Z1WVhSbFVrVWdQU0F2WEZ4Q0tGdEJMVnBkS1M5blhHNWxlSEJ2Y25RZ1kyOXVjM1FnYUhsd2FHVnVZWFJsSUQwZ0tITjBjam9nYzNSeWFXNW5LU0E5UGlCemRISXVjbVZ3YkdGalpTaG9lWEJvWlc1aGRHVlNSU3dnSnkwa01TY3BMblJ2VEc5M1pYSkRZWE5sS0NsY2JpSXNJbWx0Y0c5eWRDQjdJSFJvY205M1JYSnliM0lnZlNCbWNtOXRJQ2R6YUdGeVpXUXZkWFJwYkNkY2JseHVhV1lnS0hSNWNHVnZaaUIzYVc1a2IzY2dQVDA5SUNkMWJtUmxabWx1WldRbktTQjdYRzRnSUhSb2NtOTNSWEp5YjNJb1hHNGdJQ0FnSjNkcGJtUnZkeUJwY3lCMWJtUmxabWx1WldRc0lIWjFaUzEwWlhOMExYVjBhV3h6SUc1bFpXUnpJSFJ2SUdKbElISjFiaUJwYmlCaElHSnliM2R6WlhJZ1pXNTJhWEp2Ym0xbGJuUXVYRnh1SnlBclhHNGdJQ0FnSjFsdmRTQmpZVzRnY25WdUlIUm9aU0IwWlhOMGN5QnBiaUJ1YjJSbElIVnphVzVuSUdwelpHOXRJQ3NnYW5Oa2IyMHRaMnh2WW1Gc0xseGNiaWNnSzF4dUlDQWdJQ2RUWldVZ2FIUjBjSE02THk5MmRXVXRkR1Z6ZEMxMWRHbHNjeTUyZFdWcWN5NXZjbWN2Wlc0dlozVnBaR1Z6TDJOdmJXMXZiaTEwYVhCekxtaDBiV3dnWm05eUlHMXZjbVVnWkdWMFlXbHNjeTRuWEc0Z0lDbGNibjFjYmlJc0ltbG1JQ2doUld4bGJXVnVkQzV3Y205MGIzUjVjR1V1YldGMFkyaGxjeWtnZTF4dUlDQkZiR1Z0Wlc1MExuQnliM1J2ZEhsd1pTNXRZWFJqYUdWeklEMWNiaUFnSUNBZ0lDQWdSV3hsYldWdWRDNXdjbTkwYjNSNWNHVXViV0YwWTJobGMxTmxiR1ZqZEc5eUlIeDhYRzRnSUNBZ0lDQWdJRVZzWlcxbGJuUXVjSEp2ZEc5MGVYQmxMbTF2ZWsxaGRHTm9aWE5UWld4bFkzUnZjaUI4ZkZ4dUlDQWdJQ0FnSUNCRmJHVnRaVzUwTG5CeWIzUnZkSGx3WlM1dGMwMWhkR05vWlhOVFpXeGxZM1J2Y2lCOGZGeHVJQ0FnSUNBZ0lDQkZiR1Z0Wlc1MExuQnliM1J2ZEhsd1pTNXZUV0YwWTJobGMxTmxiR1ZqZEc5eUlIeDhYRzRnSUNBZ0lDQWdJRVZzWlcxbGJuUXVjSEp2ZEc5MGVYQmxMbmRsWW10cGRFMWhkR05vWlhOVFpXeGxZM1J2Y2lCOGZGeHVJQ0FnSUNBZ0lDQm1kVzVqZEdsdmJpQW9jeWtnZTF4dUlDQWdJQ0FnSUNBZ0lHTnZibk4wSUcxaGRHTm9aWE1nUFNBb2RHaHBjeTVrYjJOMWJXVnVkQ0I4ZkNCMGFHbHpMbTkzYm1WeVJHOWpkVzFsYm5RcExuRjFaWEo1VTJWc1pXTjBiM0pCYkd3b2N5bGNiaUFnSUNBZ0lDQWdJQ0JzWlhRZ2FTQTlJRzFoZEdOb1pYTXViR1Z1WjNSb1hHNGdJQ0FnSUNBZ0lDQWdkMmhwYkdVZ0tDMHRhU0ErUFNBd0lDWW1JRzFoZEdOb1pYTXVhWFJsYlNocEtTQWhQVDBnZEdocGN5a2dlMzFjYmlBZ0lDQWdJQ0FnSUNCeVpYUjFjbTRnYVNBK0lDMHhYRzRnSUNBZ0lDQWdJSDFjYm4xY2JpSXNJbWxtSUNoMGVYQmxiMllnVDJKcVpXTjBMbUZ6YzJsbmJpQWhQVDBnSjJaMWJtTjBhVzl1SnlrZ2UxeHVJQ0FvWm5WdVkzUnBiMjRnS0NrZ2UxeHVJQ0FnSUU5aWFtVmpkQzVoYzNOcFoyNGdQU0JtZFc1amRHbHZiaUFvZEdGeVoyVjBLU0I3WEc0Z0lDQWdJQ0FuZFhObElITjBjbWxqZENkY2JpQWdJQ0FnSUdsbUlDaDBZWEpuWlhRZ1BUMDlJSFZ1WkdWbWFXNWxaQ0I4ZkNCMFlYSm5aWFFnUFQwOUlHNTFiR3dwSUh0Y2JpQWdJQ0FnSUNBZ2RHaHliM2NnYm1WM0lGUjVjR1ZGY25KdmNpZ25RMkZ1Ym05MElHTnZiblpsY25RZ2RXNWtaV1pwYm1Wa0lHOXlJRzUxYkd3Z2RHOGdiMkpxWldOMEp5bGNiaUFnSUNBZ0lIMWNibHh1SUNBZ0lDQWdkbUZ5SUc5MWRIQjFkQ0E5SUU5aWFtVmpkQ2gwWVhKblpYUXBYRzRnSUNBZ0lDQm1iM0lnS0haaGNpQnBibVJsZUNBOUlERTdJR2x1WkdWNElEd2dZWEpuZFcxbGJuUnpMbXhsYm1kMGFEc2dhVzVrWlhnckt5a2dlMXh1SUNBZ0lDQWdJQ0IyWVhJZ2MyOTFjbU5sSUQwZ1lYSm5kVzFsYm5SelcybHVaR1Y0WFZ4dUlDQWdJQ0FnSUNCcFppQW9jMjkxY21ObElDRTlQU0IxYm1SbFptbHVaV1FnSmlZZ2MyOTFjbU5sSUNFOVBTQnVkV3hzS1NCN1hHNGdJQ0FnSUNBZ0lDQWdabTl5SUNoMllYSWdibVY0ZEV0bGVTQnBiaUJ6YjNWeVkyVXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHbG1JQ2h6YjNWeVkyVXVhR0Z6VDNkdVVISnZjR1Z5ZEhrb2JtVjRkRXRsZVNrcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ2IzVjBjSFYwVzI1bGVIUkxaWGxkSUQwZ2MyOTFjbU5sVzI1bGVIUkxaWGxkWEc0Z0lDQWdJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNCOVhHNGdJQ0FnSUNCeVpYUjFjbTRnYjNWMGNIVjBYRzRnSUNBZ2ZWeHVJQ0I5S1NncFhHNTlYRzRpTENJdkx5QkFabXh2ZDF4dWFXMXdiM0owSUhzZ2RHaHliM2RGY25KdmNpQjlJR1p5YjIwZ0p5NHZkWFJwYkNkY2JseHVaWGh3YjNKMElHWjFibU4wYVc5dUlHbHpSRzl0VTJWc1pXTjBiM0lnS0hObGJHVmpkRzl5T2lCaGJua3BJSHRjYmlBZ2FXWWdLSFI1Y0dWdlppQnpaV3hsWTNSdmNpQWhQVDBnSjNOMGNtbHVaeWNwSUh0Y2JpQWdJQ0J5WlhSMWNtNGdabUZzYzJWY2JpQWdmVnh1WEc0Z0lIUnllU0I3WEc0Z0lDQWdhV1lnS0hSNWNHVnZaaUJrYjJOMWJXVnVkQ0E5UFQwZ0ozVnVaR1ZtYVc1bFpDY3BJSHRjYmlBZ0lDQWdJSFJvY205M1JYSnliM0lvSjIxdmRXNTBJRzExYzNRZ1ltVWdjblZ1SUdsdUlHRWdZbkp2ZDNObGNpQmxiblpwY205dWJXVnVkQ0JzYVd0bElGQm9ZVzUwYjIxS1V5d2dhbk5rYjIwZ2IzSWdZMmh5YjIxbEp5bGNiaUFnSUNCOVhHNGdJSDBnWTJGMFkyZ2dLR1Z5Y205eUtTQjdYRzRnSUNBZ2RHaHliM2RGY25KdmNpZ25iVzkxYm5RZ2JYVnpkQ0JpWlNCeWRXNGdhVzRnWVNCaWNtOTNjMlZ5SUdWdWRtbHliMjV0Wlc1MElHeHBhMlVnVUdoaGJuUnZiVXBUTENCcWMyUnZiU0J2Y2lCamFISnZiV1VuS1Z4dUlDQjlYRzVjYmlBZ2RISjVJSHRjYmlBZ0lDQmtiMk4xYldWdWRDNXhkV1Z5ZVZObGJHVmpkRzl5S0hObGJHVmpkRzl5S1Z4dUlDQWdJSEpsZEhWeWJpQjBjblZsWEc0Z0lIMGdZMkYwWTJnZ0tHVnljbTl5S1NCN1hHNGdJQ0FnY21WMGRYSnVJR1poYkhObFhHNGdJSDFjYm4xY2JseHVaWGh3YjNKMElHWjFibU4wYVc5dUlHbHpWblZsUTI5dGNHOXVaVzUwSUNoamIyMXdiMjVsYm5RNklHRnVlU2tnZTF4dUlDQnBaaUFvZEhsd1pXOW1JR052YlhCdmJtVnVkQ0E5UFQwZ0oyWjFibU4wYVc5dUp5QW1KaUJqYjIxd2IyNWxiblF1YjNCMGFXOXVjeWtnZTF4dUlDQWdJSEpsZEhWeWJpQjBjblZsWEc0Z0lIMWNibHh1SUNCcFppQW9ZMjl0Y0c5dVpXNTBJRDA5UFNCdWRXeHNJSHg4SUhSNWNHVnZaaUJqYjIxd2IyNWxiblFnSVQwOUlDZHZZbXBsWTNRbktTQjdYRzRnSUNBZ2NtVjBkWEp1SUdaaGJITmxYRzRnSUgxY2JseHVJQ0JwWmlBb1kyOXRjRzl1Wlc1MExtVjRkR1Z1WkhNZ2ZId2dZMjl0Y0c5dVpXNTBMbDlEZEc5eUtTQjdYRzRnSUNBZ2NtVjBkWEp1SUhSeWRXVmNiaUFnZlZ4dVhHNGdJSEpsZEhWeWJpQjBlWEJsYjJZZ1kyOXRjRzl1Wlc1MExuSmxibVJsY2lBOVBUMGdKMloxYm1OMGFXOXVKMXh1ZlZ4dVhHNWxlSEJ2Y25RZ1puVnVZM1JwYjI0Z1kyOXRjRzl1Wlc1MFRtVmxaSE5EYjIxd2FXeHBibWNnS0dOdmJYQnZibVZ1ZERvZ1EyOXRjRzl1Wlc1MEtTQjdYRzRnSUhKbGRIVnliaUJqYjIxd2IyNWxiblFnSmlaY2JpQWdJQ0FoWTI5dGNHOXVaVzUwTG5KbGJtUmxjaUFtSmx4dUlDQWdJQ2hqYjIxd2IyNWxiblF1ZEdWdGNHeGhkR1VnZkh3Z1kyOXRjRzl1Wlc1MExtVjRkR1Z1WkhNcElDWW1YRzRnSUNBZ0lXTnZiWEJ2Ym1WdWRDNW1kVzVqZEdsdmJtRnNYRzU5WEc1Y2JtVjRjRzl5ZENCbWRXNWpkR2x2YmlCcGMxSmxabE5sYkdWamRHOXlJQ2h5WldaUGNIUnBiMjV6VDJKcVpXTjBPaUJoYm5rcElIdGNiaUFnYVdZZ0tIUjVjR1Z2WmlCeVpXWlBjSFJwYjI1elQySnFaV04wSUNFOVBTQW5iMkpxWldOMEp5QjhmQ0JQWW1wbFkzUXVhMlY1Y3loeVpXWlBjSFJwYjI1elQySnFaV04wSUh4OElIdDlLUzVzWlc1bmRHZ2dJVDA5SURFcElIdGNiaUFnSUNCeVpYUjFjbTRnWm1Gc2MyVmNiaUFnZlZ4dVhHNGdJSEpsZEhWeWJpQjBlWEJsYjJZZ2NtVm1UM0IwYVc5dWMwOWlhbVZqZEM1eVpXWWdQVDA5SUNkemRISnBibWNuWEc1OVhHNWNibVY0Y0c5eWRDQm1kVzVqZEdsdmJpQnBjMDVoYldWVFpXeGxZM1J2Y2lBb2JtRnRaVTl3ZEdsdmJuTlBZbXBsWTNRNklHRnVlU2tnZTF4dUlDQnBaaUFvZEhsd1pXOW1JRzVoYldWUGNIUnBiMjV6VDJKcVpXTjBJQ0U5UFNBbmIySnFaV04wSnlCOGZDQnVZVzFsVDNCMGFXOXVjMDlpYW1WamRDQTlQVDBnYm5Wc2JDa2dlMXh1SUNBZ0lISmxkSFZ5YmlCbVlXeHpaVnh1SUNCOVhHNWNiaUFnY21WMGRYSnVJQ0VoYm1GdFpVOXdkR2x2Ym5OUFltcGxZM1F1Ym1GdFpWeHVmVnh1SWl3aWFXMXdiM0owSUZaMVpTQm1jbTl0SUNkMmRXVW5YRzVjYm1WNGNHOXlkQ0JqYjI1emRDQk9RVTFGWDFORlRFVkRWRTlTSUQwZ0owNUJUVVZmVTBWTVJVTlVUMUluWEc1bGVIQnZjblFnWTI5dWMzUWdRMDlOVUU5T1JVNVVYMU5GVEVWRFZFOVNJRDBnSjBOUFRWQlBUa1ZPVkY5VFJVeEZRMVJQVWlkY2JtVjRjRzl5ZENCamIyNXpkQ0JTUlVaZlUwVk1SVU5VVDFJZ1BTQW5Va1ZHWDFORlRFVkRWRTlTSjF4dVpYaHdiM0owSUdOdmJuTjBJRVJQVFY5VFJVeEZRMVJQVWlBOUlDZEVUMDFmVTBWTVJVTlVUMUluWEc1bGVIQnZjblFnWTI5dWMzUWdWbFZGWDFaRlVsTkpUMDRnUFNCT2RXMWlaWElvWUNSN1ZuVmxMblpsY25OcGIyNHVjM0JzYVhRb0p5NG5LVnN3WFgwdUpIdFdkV1V1ZG1WeWMybHZiaTV6Y0d4cGRDZ25MaWNwV3pGZGZXQXBYRzVsZUhCdmNuUWdZMjl1YzNRZ1JsVk9RMVJKVDA1QlRGOVBVRlJKVDA1VElEMGdWbFZGWDFaRlVsTkpUMDRnUGowZ01pNDFJRDhnSjJadVQzQjBhVzl1Y3ljZ09pQW5ablZ1WTNScGIyNWhiRTl3ZEdsdmJuTW5YRzRpTENJdkx5QkFabXh2ZDF4dVhHNXBiWEJ2Y25RZ2UxeHVJQ0JwYzBSdmJWTmxiR1ZqZEc5eUxGeHVJQ0JwYzA1aGJXVlRaV3hsWTNSdmNpeGNiaUFnYVhOU1pXWlRaV3hsWTNSdmNpeGNiaUFnYVhOV2RXVkRiMjF3YjI1bGJuUmNibjBnWm5KdmJTQW5jMmhoY21Wa0wzWmhiR2xrWVhSdmNuTW5YRzVwYlhCdmNuUWdlMXh1SUNCMGFISnZkMFZ5Y205eVhHNTlJR1p5YjIwZ0ozTm9ZWEpsWkM5MWRHbHNKMXh1YVcxd2IzSjBJSHRjYmlBZ1VrVkdYMU5GVEVWRFZFOVNMRnh1SUNCRFQwMVFUMDVGVGxSZlUwVk1SVU5VVDFJc1hHNGdJRTVCVFVWZlUwVk1SVU5VVDFJc1hHNGdJRVJQVFY5VFJVeEZRMVJQVWx4dWZTQm1jbTl0SUNjdUwyTnZibk4wY3lkY2JseHVaWGh3YjNKMElHUmxabUYxYkhRZ1puVnVZM1JwYjI0Z1oyVjBVMlZzWldOMGIzSlVlWEJsVDNKVWFISnZkeUFvYzJWc1pXTjBiM0k2SUZObGJHVmpkRzl5TENCdFpYUm9iMlJPWVcxbE9pQnpkSEpwYm1jcE9pQnpkSEpwYm1jZ2ZDQjJiMmxrSUh0Y2JpQWdhV1lnS0dselJHOXRVMlZzWldOMGIzSW9jMlZzWldOMGIzSXBLU0J5WlhSMWNtNGdSRTlOWDFORlRFVkRWRTlTWEc0Z0lHbG1JQ2hwYzA1aGJXVlRaV3hsWTNSdmNpaHpaV3hsWTNSdmNpa3BJSEpsZEhWeWJpQk9RVTFGWDFORlRFVkRWRTlTWEc0Z0lHbG1JQ2hwYzFaMVpVTnZiWEJ2Ym1WdWRDaHpaV3hsWTNSdmNpa3BJSEpsZEhWeWJpQkRUMDFRVDA1RlRsUmZVMFZNUlVOVVQxSmNiaUFnYVdZZ0tHbHpVbVZtVTJWc1pXTjBiM0lvYzJWc1pXTjBiM0lwS1NCeVpYUjFjbTRnVWtWR1gxTkZURVZEVkU5U1hHNWNiaUFnZEdoeWIzZEZjbkp2Y2loZ2QzSmhjSEJsY2k0a2UyMWxkR2h2WkU1aGJXVjlLQ2tnYlhWemRDQmlaU0J3WVhOelpXUWdZU0IyWVd4cFpDQkRVMU1nYzJWc1pXTjBiM0lzSUZaMVpTQmpiMjV6ZEhKMVkzUnZjaXdnYjNJZ2RtRnNhV1FnWm1sdVpDQnZjSFJwYjI0Z2IySnFaV04wWUNsY2JuMWNiaUlzSWk4dklFQm1iRzkzWEc1cGJYQnZjblFnZTF4dUlDQkdWVTVEVkVsUFRrRk1YMDlRVkVsUFRsTXNYRzRnSUZaVlJWOVdSVkpUU1U5T1hHNTlJR1p5YjIwZ0p5NHZZMjl1YzNSekoxeHVhVzF3YjNKMElIdGNiaUFnZEdoeWIzZEZjbkp2Y2x4dWZTQm1jbTl0SUNkemFHRnlaV1F2ZFhScGJDZGNibHh1Wlhod2IzSjBJR1oxYm1OMGFXOXVJR1pwYm1SQmJHeFdkV1ZEYjIxd2IyNWxiblJ6Um5KdmJWWnRJQ2hjYmlBZ2RtMDZJRU52YlhCdmJtVnVkQ3hjYmlBZ1kyOXRjRzl1Wlc1MGN6b2dRWEp5WVhrOFEyOXRjRzl1Wlc1MFBpQTlJRnRkWEc0cE9pQkJjbkpoZVR4RGIyMXdiMjVsYm5RK0lIdGNiaUFnWTI5dGNHOXVaVzUwY3k1d2RYTm9LSFp0S1Z4dUlDQjJiUzRrWTJocGJHUnlaVzR1Wm05eVJXRmphQ2dvWTJocGJHUXBJRDArSUh0Y2JpQWdJQ0JtYVc1a1FXeHNWblZsUTI5dGNHOXVaVzUwYzBaeWIyMVdiU2hqYUdsc1pDd2dZMjl0Y0c5dVpXNTBjeWxjYmlBZ2ZTbGNibHh1SUNCeVpYUjFjbTRnWTI5dGNHOXVaVzUwYzF4dWZWeHVYRzVtZFc1amRHbHZiaUJtYVc1a1FXeHNWblZsUTI5dGNHOXVaVzUwYzBaeWIyMVdibTlrWlNBb1hHNGdJSFp1YjJSbE9pQkRiMjF3YjI1bGJuUXNYRzRnSUdOdmJYQnZibVZ1ZEhNNklFRnljbUY1UEVOdmJYQnZibVZ1ZEQ0Z1BTQmJYVnh1S1RvZ1FYSnlZWGs4UTI5dGNHOXVaVzUwUGlCN1hHNGdJR2xtSUNoMmJtOWtaUzVqYUdsc1pDa2dlMXh1SUNBZ0lHTnZiWEJ2Ym1WdWRITXVjSFZ6YUNoMmJtOWtaUzVqYUdsc1pDbGNiaUFnZlZ4dUlDQnBaaUFvZG01dlpHVXVZMmhwYkdSeVpXNHBJSHRjYmlBZ0lDQjJibTlrWlM1amFHbHNaSEpsYmk1bWIzSkZZV05vS0NoamFHbHNaQ2tnUFQ0Z2UxeHVJQ0FnSUNBZ1ptbHVaRUZzYkZaMVpVTnZiWEJ2Ym1WdWRITkdjbTl0Vm01dlpHVW9ZMmhwYkdRc0lHTnZiWEJ2Ym1WdWRITXBYRzRnSUNBZ2ZTbGNiaUFnZlZ4dVhHNGdJSEpsZEhWeWJpQmpiMjF3YjI1bGJuUnpYRzU5WEc1Y2JtWjFibU4wYVc5dUlHWnBibVJCYkd4R2RXNWpkR2x2Ym1Gc1EyOXRjRzl1Wlc1MGMwWnliMjFXYm05a1pTQW9YRzRnSUhadWIyUmxPaUJEYjIxd2IyNWxiblFzWEc0Z0lHTnZiWEJ2Ym1WdWRITTZJRUZ5Y21GNVBFTnZiWEJ2Ym1WdWRENGdQU0JiWFZ4dUtUb2dRWEp5WVhrOFEyOXRjRzl1Wlc1MFBpQjdYRzRnSUdsbUlDaDJibTlrWlZ0R1ZVNURWRWxQVGtGTVgwOVFWRWxQVGxOZElIeDhJSFp1YjJSbExtWjFibU4wYVc5dVlXeERiMjUwWlhoMEtTQjdYRzRnSUNBZ1kyOXRjRzl1Wlc1MGN5NXdkWE5vS0hadWIyUmxLVnh1SUNCOVhHNGdJR2xtSUNoMmJtOWtaUzVqYUdsc1pISmxiaWtnZTF4dUlDQWdJSFp1YjJSbExtTm9hV3hrY21WdUxtWnZja1ZoWTJnb0tHTm9hV3hrS1NBOVBpQjdYRzRnSUNBZ0lDQm1hVzVrUVd4c1JuVnVZM1JwYjI1aGJFTnZiWEJ2Ym1WdWRITkdjbTl0Vm01dlpHVW9ZMmhwYkdRc0lHTnZiWEJ2Ym1WdWRITXBYRzRnSUNBZ2ZTbGNiaUFnZlZ4dUlDQnlaWFIxY200Z1kyOXRjRzl1Wlc1MGMxeHVmVnh1WEc1bGVIQnZjblFnWm5WdVkzUnBiMjRnZG0xRGRHOXlUV0YwWTJobGMwNWhiV1VnS0hadE9pQkRiMjF3YjI1bGJuUXNJRzVoYldVNklITjBjbWx1WnlrNklHSnZiMnhsWVc0Z2UxeHVJQ0J5WlhSMWNtNGdJU0VvS0hadExpUjJibTlrWlNBbUppQjJiUzRrZG01dlpHVXVZMjl0Y0c5dVpXNTBUM0IwYVc5dWN5QW1KbHh1SUNBZ0lIWnRMaVIyYm05a1pTNWpiMjF3YjI1bGJuUlBjSFJwYjI1ekxrTjBiM0l1YjNCMGFXOXVjeTV1WVcxbElEMDlQU0J1WVcxbEtTQjhmRnh1SUNBZ0lDaDJiUzVmZG01dlpHVWdKaVpjYmlBZ0lDQjJiUzVmZG01dlpHVXVablZ1WTNScGIyNWhiRTl3ZEdsdmJuTWdKaVpjYmlBZ0lDQjJiUzVmZG01dlpHVXVablZ1WTNScGIyNWhiRTl3ZEdsdmJuTXVibUZ0WlNBOVBUMGdibUZ0WlNrZ2ZIeGNiaUFnSUNCMmJTNGtiM0IwYVc5dWN5QW1KaUIyYlM0a2IzQjBhVzl1Y3k1dVlXMWxJRDA5UFNCdVlXMWxJSHg4WEc0Z0lDQWdkbTB1YjNCMGFXOXVjeUFtSmlCMmJTNXZjSFJwYjI1ekxtNWhiV1VnUFQwOUlHNWhiV1VwWEc1OVhHNWNibVY0Y0c5eWRDQm1kVzVqZEdsdmJpQjJiVU4wYjNKTllYUmphR1Z6VTJWc1pXTjBiM0lnS0dOdmJYQnZibVZ1ZERvZ1EyOXRjRzl1Wlc1MExDQnpaV3hsWTNSdmNqb2dUMkpxWldOMEtTQjdYRzRnSUdOdmJuTjBJRU4wYjNJZ1BTQnpaV3hsWTNSdmNpNWZRM1J2Y2lCOGZDQW9jMlZzWldOMGIzSXViM0IwYVc5dWN5QW1KaUJ6Wld4bFkzUnZjaTV2Y0hScGIyNXpMbDlEZEc5eUtWeHVJQ0JwWmlBb0lVTjBiM0lwSUh0Y2JpQWdJQ0J5WlhSMWNtNGdabUZzYzJWY2JpQWdmVnh1SUNCamIyNXpkQ0JEZEc5eWN5QTlJRTlpYW1WamRDNXJaWGx6S0VOMGIzSXBYRzRnSUhKbGRIVnliaUJEZEc5eWN5NXpiMjFsS0dNZ1BUNGdRM1J2Y2x0alhTQTlQVDBnWTI5dGNHOXVaVzUwTGw5ZmNISnZkRzlmWHk1amIyNXpkSEoxWTNSdmNpbGNibjFjYmx4dVpYaHdiM0owSUdaMWJtTjBhVzl1SUhadFJuVnVZM1JwYjI1aGJFTjBiM0pOWVhSamFHVnpVMlZzWldOMGIzSWdLR052YlhCdmJtVnVkRG9nVms1dlpHVXNJRU4wYjNJNklFOWlhbVZqZENrZ2UxeHVJQ0JwWmlBb1ZsVkZYMVpGVWxOSlQwNGdQQ0F5TGpNcElIdGNiaUFnSUNCMGFISnZkMFZ5Y205eUtDZG1hVzVrSUdadmNpQm1kVzVqZEdsdmJtRnNJR052YlhCdmJtVnVkSE1nYVhNZ2JtOTBJSE4xY0hCdmNuUWdhVzRnVm5WbElEd2dNaTR6SnlsY2JpQWdmVnh1WEc0Z0lHbG1JQ2doUTNSdmNpa2dlMXh1SUNBZ0lISmxkSFZ5YmlCbVlXeHpaVnh1SUNCOVhHNWNiaUFnYVdZZ0tDRmpiMjF3YjI1bGJuUmJSbFZPUTFSSlQwNUJURjlQVUZSSlQwNVRYU2tnZTF4dUlDQWdJSEpsZEhWeWJpQm1ZV3h6WlZ4dUlDQjlYRzRnSUdOdmJuTjBJRU4wYjNKeklEMGdUMkpxWldOMExtdGxlWE1vWTI5dGNHOXVaVzUwVzBaVlRrTlVTVTlPUVV4ZlQxQlVTVTlPVTEwdVgwTjBiM0lwWEc0Z0lISmxkSFZ5YmlCRGRHOXljeTV6YjIxbEtHTWdQVDRnUTNSdmNsdGpYU0E5UFQwZ1kyOXRjRzl1Wlc1MFcwWlZUa05VU1U5T1FVeGZUMUJVU1U5T1UxMHVYME4wYjNKYlkxMHBYRzU5WEc1Y2JtVjRjRzl5ZENCa1pXWmhkV3gwSUdaMWJtTjBhVzl1SUdacGJtUldkV1ZEYjIxd2IyNWxiblJ6SUNoY2JpQWdjbTl2ZERvZ1EyOXRjRzl1Wlc1MExGeHVJQ0J6Wld4bFkzUnZjbFI1Y0dVNklEOXpkSEpwYm1jc1hHNGdJSE5sYkdWamRHOXlPaUJQWW1wbFkzUmNiaWs2SUVGeWNtRjVQRU52YlhCdmJtVnVkRDRnZTF4dUlDQnBaaUFvYzJWc1pXTjBiM0l1Wm5WdVkzUnBiMjVoYkNrZ2UxeHVJQ0FnSUdOdmJuTjBJRzV2WkdWeklEMGdjbTl2ZEM1ZmRtNXZaR1ZjYmlBZ0lDQWdJRDhnWm1sdVpFRnNiRVoxYm1OMGFXOXVZV3hEYjIxd2IyNWxiblJ6Um5KdmJWWnViMlJsS0hKdmIzUXVYM1p1YjJSbEtWeHVJQ0FnSUNBZ09pQm1hVzVrUVd4c1JuVnVZM1JwYjI1aGJFTnZiWEJ2Ym1WdWRITkdjbTl0Vm01dlpHVW9jbTl2ZENsY2JpQWdJQ0J5WlhSMWNtNGdibTlrWlhNdVptbHNkR1Z5S0c1dlpHVWdQVDVjYmlBZ0lDQWdJSFp0Um5WdVkzUnBiMjVoYkVOMGIzSk5ZWFJqYUdWelUyVnNaV04wYjNJb2JtOWtaU3dnYzJWc1pXTjBiM0l1WDBOMGIzSXBJSHg4WEc0Z0lDQWdJQ0J1YjJSbFcwWlZUa05VU1U5T1FVeGZUMUJVU1U5T1UxMHVibUZ0WlNBOVBUMGdjMlZzWldOMGIzSXVibUZ0WlZ4dUlDQWdJQ2xjYmlBZ2ZWeHVJQ0JqYjI1emRDQnVZVzFsVTJWc1pXTjBiM0lnUFNCMGVYQmxiMllnYzJWc1pXTjBiM0lnUFQwOUlDZG1kVzVqZEdsdmJpY2dQeUJ6Wld4bFkzUnZjaTV2Y0hScGIyNXpMbTVoYldVZ09pQnpaV3hsWTNSdmNpNXVZVzFsWEc0Z0lHTnZibk4wSUdOdmJYQnZibVZ1ZEhNZ1BTQnliMjkwTGw5cGMxWjFaVnh1SUNBZ0lEOGdabWx1WkVGc2JGWjFaVU52YlhCdmJtVnVkSE5HY205dFZtMG9jbTl2ZENsY2JpQWdJQ0E2SUdacGJtUkJiR3hXZFdWRGIyMXdiMjVsYm5SelJuSnZiVlp1YjJSbEtISnZiM1FwWEc0Z0lISmxkSFZ5YmlCamIyMXdiMjVsYm5SekxtWnBiSFJsY2lnb1kyOXRjRzl1Wlc1MEtTQTlQaUI3WEc0Z0lDQWdhV1lnS0NGamIyMXdiMjVsYm5RdUpIWnViMlJsSUNZbUlDRmpiMjF3YjI1bGJuUXVKRzl3ZEdsdmJuTXVaWGgwWlc1a2N5a2dlMXh1SUNBZ0lDQWdjbVYwZFhKdUlHWmhiSE5sWEc0Z0lDQWdmVnh1SUNBZ0lISmxkSFZ5YmlCMmJVTjBiM0pOWVhSamFHVnpVMlZzWldOMGIzSW9ZMjl0Y0c5dVpXNTBMQ0J6Wld4bFkzUnZjaWtnZkh3Z2RtMURkRzl5VFdGMFkyaGxjMDVoYldVb1kyOXRjRzl1Wlc1MExDQnVZVzFsVTJWc1pXTjBiM0lwWEc0Z0lIMHBYRzU5WEc0aUxDSXZMeUJBWm14dmQxeHVYRzVwYlhCdmNuUWdkSGx3WlNCWGNtRndjR1Z5SUdaeWIyMGdKeTR2ZDNKaGNIQmxjaWRjYm1sdGNHOXlkQ0IwZVhCbElGWjFaVmR5WVhCd1pYSWdabkp2YlNBbkxpOTJkV1V0ZDNKaGNIQmxjaWRjYm1sdGNHOXlkQ0I3WEc0Z0lIUm9jbTkzUlhKeWIzSXNYRzRnSUhkaGNtNWNibjBnWm5KdmJTQW5jMmhoY21Wa0wzVjBhV3duWEc1Y2JtVjRjRzl5ZENCa1pXWmhkV3gwSUdOc1lYTnpJRmR5WVhCd1pYSkJjbkpoZVNCcGJYQnNaVzFsYm5SeklFSmhjMlZYY21Gd2NHVnlJSHRjYmlBZ2QzSmhjSEJsY25NNklFRnljbUY1UEZkeVlYQndaWElnZkNCV2RXVlhjbUZ3Y0dWeVBqdGNiaUFnYkdWdVozUm9PaUJ1ZFcxaVpYSTdYRzVjYmlBZ1kyOXVjM1J5ZFdOMGIzSWdLSGR5WVhCd1pYSnpPaUJCY25KaGVUeFhjbUZ3Y0dWeUlId2dWblZsVjNKaGNIQmxjajRwSUh0Y2JpQWdJQ0IwYUdsekxuZHlZWEJ3WlhKeklEMGdkM0poY0hCbGNuTWdmSHdnVzExY2JpQWdJQ0IwYUdsekxteGxibWQwYUNBOUlIUm9hWE11ZDNKaGNIQmxjbk11YkdWdVozUm9YRzRnSUgxY2JseHVJQ0JoZENBb2FXNWtaWGc2SUc1MWJXSmxjaWs2SUZkeVlYQndaWElnZkNCV2RXVlhjbUZ3Y0dWeUlIdGNiaUFnSUNCcFppQW9hVzVrWlhnZ1BpQjBhR2x6TG14bGJtZDBhQ0F0SURFcElIdGNiaUFnSUNBZ0lIUm9jbTkzUlhKeWIzSW9ZRzV2SUdsMFpXMGdaWGhwYzNSeklHRjBJQ1I3YVc1a1pYaDlZQ2xjYmlBZ0lDQjlYRzRnSUNBZ2NtVjBkWEp1SUhSb2FYTXVkM0poY0hCbGNuTmJhVzVrWlhoZFhHNGdJSDFjYmx4dUlDQmhkSFJ5YVdKMWRHVnpJQ2dwT2lCMmIybGtJSHRjYmlBZ0lDQjBhR2x6TG5Sb2NtOTNSWEp5YjNKSlpsZHlZWEJ3WlhKelNYTkZiWEIwZVNnbllYUjBjbWxpZFhSbGN5Y3BYRzVjYmlBZ0lDQjBhSEp2ZDBWeWNtOXlLQ2RoZEhSeWFXSjFkR1Z6SUcxMWMzUWdZbVVnWTJGc2JHVmtJRzl1SUdFZ2MybHVaMnhsSUhkeVlYQndaWElzSUhWelpTQmhkQ2hwS1NCMGJ5QmhZMk5sYzNNZ1lTQjNjbUZ3Y0dWeUp5bGNiaUFnZlZ4dVhHNGdJR05zWVhOelpYTWdLQ2s2SUhadmFXUWdlMXh1SUNBZ0lIUm9hWE11ZEdoeWIzZEZjbkp2Y2tsbVYzSmhjSEJsY25OSmMwVnRjSFI1S0NkamJHRnpjMlZ6SnlsY2JseHVJQ0FnSUhSb2NtOTNSWEp5YjNJb0oyTnNZWE56WlhNZ2JYVnpkQ0JpWlNCallXeHNaV1FnYjI0Z1lTQnphVzVuYkdVZ2QzSmhjSEJsY2l3Z2RYTmxJR0YwS0drcElIUnZJR0ZqWTJWemN5QmhJSGR5WVhCd1pYSW5LVnh1SUNCOVhHNWNiaUFnWTI5dWRHRnBibk1nS0hObGJHVmpkRzl5T2lCVFpXeGxZM1J2Y2lrNklHSnZiMnhsWVc0Z2UxeHVJQ0FnSUhSb2FYTXVkR2h5YjNkRmNuSnZja2xtVjNKaGNIQmxjbk5KYzBWdGNIUjVLQ2RqYjI1MFlXbHVjeWNwWEc1Y2JpQWdJQ0J5WlhSMWNtNGdkR2hwY3k1M2NtRndjR1Z5Y3k1bGRtVnllU2gzY21Gd2NHVnlJRDArSUhkeVlYQndaWEl1WTI5dWRHRnBibk1vYzJWc1pXTjBiM0lwS1Z4dUlDQjlYRzVjYmlBZ1pYaHBjM1J6SUNncE9pQmliMjlzWldGdUlIdGNiaUFnSUNCeVpYUjFjbTRnZEdocGN5NXNaVzVuZEdnZ1BpQXdJQ1ltSUhSb2FYTXVkM0poY0hCbGNuTXVaWFpsY25rb2QzSmhjSEJsY2lBOVBpQjNjbUZ3Y0dWeUxtVjRhWE4wY3lncEtWeHVJQ0I5WEc1Y2JpQWdabWxzZEdWeUlDaHdjbVZrYVdOaGRHVTZJRVoxYm1OMGFXOXVLVG9nVjNKaGNIQmxja0Z5Y21GNUlIdGNiaUFnSUNCeVpYUjFjbTRnYm1WM0lGZHlZWEJ3WlhKQmNuSmhlU2gwYUdsekxuZHlZWEJ3WlhKekxtWnBiSFJsY2lod2NtVmthV05oZEdVcEtWeHVJQ0I5WEc1Y2JpQWdkbWx6YVdKc1pTQW9LVG9nWW05dmJHVmhiaUI3WEc0Z0lDQWdkR2hwY3k1MGFISnZkMFZ5Y205eVNXWlhjbUZ3Y0dWeWMwbHpSVzF3ZEhrb0ozWnBjMmxpYkdVbktWeHVYRzRnSUNBZ2NtVjBkWEp1SUhSb2FYTXViR1Z1WjNSb0lENGdNQ0FtSmlCMGFHbHpMbmR5WVhCd1pYSnpMbVYyWlhKNUtIZHlZWEJ3WlhJZ1BUNGdkM0poY0hCbGNpNTJhWE5wWW14bEtDa3BYRzRnSUgxY2JseHVJQ0JsYldsMGRHVmtJQ2dwT2lCMmIybGtJSHRjYmlBZ0lDQjBhR2x6TG5Sb2NtOTNSWEp5YjNKSlpsZHlZWEJ3WlhKelNYTkZiWEIwZVNnblpXMXBkSFJsWkNjcFhHNWNiaUFnSUNCMGFISnZkMFZ5Y205eUtDZGxiV2wwZEdWa0lHMTFjM1FnWW1VZ1kyRnNiR1ZrSUc5dUlHRWdjMmx1WjJ4bElIZHlZWEJ3WlhJc0lIVnpaU0JoZENocEtTQjBieUJoWTJObGMzTWdZU0IzY21Gd2NHVnlKeWxjYmlBZ2ZWeHVYRzRnSUdWdGFYUjBaV1JDZVU5eVpHVnlJQ2dwT2lCMmIybGtJSHRjYmlBZ0lDQjBhR2x6TG5Sb2NtOTNSWEp5YjNKSlpsZHlZWEJ3WlhKelNYTkZiWEIwZVNnblpXMXBkSFJsWkVKNVQzSmtaWEluS1Z4dVhHNGdJQ0FnZEdoeWIzZEZjbkp2Y2lnblpXMXBkSFJsWkVKNVQzSmtaWElnYlhWemRDQmlaU0JqWVd4c1pXUWdiMjRnWVNCemFXNW5iR1VnZDNKaGNIQmxjaXdnZFhObElHRjBLR2twSUhSdklHRmpZMlZ6Y3lCaElIZHlZWEJ3WlhJbktWeHVJQ0I5WEc1Y2JpQWdhR0Z6UVhSMGNtbGlkWFJsSUNoaGRIUnlhV0oxZEdVNklITjBjbWx1Wnl3Z2RtRnNkV1U2SUhOMGNtbHVaeWs2SUdKdmIyeGxZVzRnZTF4dUlDQWdJSFJvYVhNdWRHaHliM2RGY25KdmNrbG1WM0poY0hCbGNuTkpjMFZ0Y0hSNUtDZG9ZWE5CZEhSeWFXSjFkR1VuS1Z4dVhHNGdJQ0FnY21WMGRYSnVJSFJvYVhNdWQzSmhjSEJsY25NdVpYWmxjbmtvZDNKaGNIQmxjaUE5UGlCM2NtRndjR1Z5TG1oaGMwRjBkSEpwWW5WMFpTaGhkSFJ5YVdKMWRHVXNJSFpoYkhWbEtTbGNiaUFnZlZ4dVhHNGdJR2hoYzBOc1lYTnpJQ2hqYkdGemMwNWhiV1U2SUhOMGNtbHVaeWs2SUdKdmIyeGxZVzRnZTF4dUlDQWdJSFJvYVhNdWRHaHliM2RGY25KdmNrbG1WM0poY0hCbGNuTkpjMFZ0Y0hSNUtDZG9ZWE5EYkdGemN5Y3BYRzVjYmlBZ0lDQnlaWFIxY200Z2RHaHBjeTUzY21Gd2NHVnljeTVsZG1WeWVTaDNjbUZ3Y0dWeUlEMCtJSGR5WVhCd1pYSXVhR0Z6UTJ4aGMzTW9ZMnhoYzNOT1lXMWxLU2xjYmlBZ2ZWeHVYRzRnSUdoaGMxQnliM0FnS0hCeWIzQTZJSE4wY21sdVp5d2dkbUZzZFdVNklITjBjbWx1WnlrNklHSnZiMnhsWVc0Z2UxeHVJQ0FnSUhSb2FYTXVkR2h5YjNkRmNuSnZja2xtVjNKaGNIQmxjbk5KYzBWdGNIUjVLQ2RvWVhOUWNtOXdKeWxjYmx4dUlDQWdJSEpsZEhWeWJpQjBhR2x6TG5keVlYQndaWEp6TG1WMlpYSjVLSGR5WVhCd1pYSWdQVDRnZDNKaGNIQmxjaTVvWVhOUWNtOXdLSEJ5YjNBc0lIWmhiSFZsS1NsY2JpQWdmVnh1WEc0Z0lHaGhjMU4wZVd4bElDaHpkSGxzWlRvZ2MzUnlhVzVuTENCMllXeDFaVG9nYzNSeWFXNW5LVG9nWW05dmJHVmhiaUI3WEc0Z0lDQWdkR2hwY3k1MGFISnZkMFZ5Y205eVNXWlhjbUZ3Y0dWeWMwbHpSVzF3ZEhrb0oyaGhjMU4wZVd4bEp5bGNibHh1SUNBZ0lISmxkSFZ5YmlCMGFHbHpMbmR5WVhCd1pYSnpMbVYyWlhKNUtIZHlZWEJ3WlhJZ1BUNGdkM0poY0hCbGNpNW9ZWE5UZEhsc1pTaHpkSGxzWlN3Z2RtRnNkV1VwS1Z4dUlDQjlYRzVjYmlBZ1ptbHVaRUZzYkNBb0tUb2dkbTlwWkNCN1hHNGdJQ0FnZEdocGN5NTBhSEp2ZDBWeWNtOXlTV1pYY21Gd2NHVnljMGx6Ulcxd2RIa29KMlpwYm1SQmJHd25LVnh1WEc0Z0lDQWdkR2h5YjNkRmNuSnZjaWduWm1sdVpFRnNiQ0J0ZFhOMElHSmxJR05oYkd4bFpDQnZiaUJoSUhOcGJtZHNaU0IzY21Gd2NHVnlMQ0IxYzJVZ1lYUW9hU2tnZEc4Z1lXTmpaWE56SUdFZ2QzSmhjSEJsY2ljcFhHNGdJSDFjYmx4dUlDQm1hVzVrSUNncE9pQjJiMmxrSUh0Y2JpQWdJQ0IwYUdsekxuUm9jbTkzUlhKeWIzSkpabGR5WVhCd1pYSnpTWE5GYlhCMGVTZ25abWx1WkNjcFhHNWNiaUFnSUNCMGFISnZkMFZ5Y205eUtDZG1hVzVrSUcxMWMzUWdZbVVnWTJGc2JHVmtJRzl1SUdFZ2MybHVaMnhsSUhkeVlYQndaWElzSUhWelpTQmhkQ2hwS1NCMGJ5QmhZMk5sYzNNZ1lTQjNjbUZ3Y0dWeUp5bGNiaUFnZlZ4dVhHNGdJR2gwYld3Z0tDazZJSFp2YVdRZ2UxeHVJQ0FnSUhSb2FYTXVkR2h5YjNkRmNuSnZja2xtVjNKaGNIQmxjbk5KYzBWdGNIUjVLQ2RvZEcxc0p5bGNibHh1SUNBZ0lIUm9jbTkzUlhKeWIzSW9KMmgwYld3Z2JYVnpkQ0JpWlNCallXeHNaV1FnYjI0Z1lTQnphVzVuYkdVZ2QzSmhjSEJsY2l3Z2RYTmxJR0YwS0drcElIUnZJR0ZqWTJWemN5QmhJSGR5WVhCd1pYSW5LVnh1SUNCOVhHNWNiaUFnYVhNZ0tITmxiR1ZqZEc5eU9pQlRaV3hsWTNSdmNpazZJR0p2YjJ4bFlXNGdlMXh1SUNBZ0lIUm9hWE11ZEdoeWIzZEZjbkp2Y2tsbVYzSmhjSEJsY25OSmMwVnRjSFI1S0NkcGN5Y3BYRzVjYmlBZ0lDQnlaWFIxY200Z2RHaHBjeTUzY21Gd2NHVnljeTVsZG1WeWVTaDNjbUZ3Y0dWeUlEMCtJSGR5WVhCd1pYSXVhWE1vYzJWc1pXTjBiM0lwS1Z4dUlDQjlYRzVjYmlBZ2FYTkZiWEIwZVNBb0tUb2dZbTl2YkdWaGJpQjdYRzRnSUNBZ2RHaHBjeTUwYUhKdmQwVnljbTl5U1daWGNtRndjR1Z5YzBselJXMXdkSGtvSjJselJXMXdkSGtuS1Z4dVhHNGdJQ0FnY21WMGRYSnVJSFJvYVhNdWQzSmhjSEJsY25NdVpYWmxjbmtvZDNKaGNIQmxjaUE5UGlCM2NtRndjR1Z5TG1selJXMXdkSGtvS1NsY2JpQWdmVnh1WEc0Z0lHbHpWbWx6YVdKc1pTQW9LVG9nWW05dmJHVmhiaUI3WEc0Z0lDQWdkR2hwY3k1MGFISnZkMFZ5Y205eVNXWlhjbUZ3Y0dWeWMwbHpSVzF3ZEhrb0oybHpWbWx6YVdKc1pTY3BYRzVjYmlBZ0lDQnlaWFIxY200Z2RHaHBjeTUzY21Gd2NHVnljeTVsZG1WeWVTaDNjbUZ3Y0dWeUlEMCtJSGR5WVhCd1pYSXVhWE5XYVhOcFlteGxLQ2twWEc0Z0lIMWNibHh1SUNCcGMxWjFaVWx1YzNSaGJtTmxJQ2dwT2lCaWIyOXNaV0Z1SUh0Y2JpQWdJQ0IwYUdsekxuUm9jbTkzUlhKeWIzSkpabGR5WVhCd1pYSnpTWE5GYlhCMGVTZ25hWE5XZFdWSmJuTjBZVzVqWlNjcFhHNWNiaUFnSUNCeVpYUjFjbTRnZEdocGN5NTNjbUZ3Y0dWeWN5NWxkbVZ5ZVNoM2NtRndjR1Z5SUQwK0lIZHlZWEJ3WlhJdWFYTldkV1ZKYm5OMFlXNWpaU2dwS1Z4dUlDQjlYRzVjYmlBZ2JtRnRaU0FvS1RvZ2RtOXBaQ0I3WEc0Z0lDQWdkR2hwY3k1MGFISnZkMFZ5Y205eVNXWlhjbUZ3Y0dWeWMwbHpSVzF3ZEhrb0oyNWhiV1VuS1Z4dVhHNGdJQ0FnZEdoeWIzZEZjbkp2Y2lnbmJtRnRaU0J0ZFhOMElHSmxJR05oYkd4bFpDQnZiaUJoSUhOcGJtZHNaU0IzY21Gd2NHVnlMQ0IxYzJVZ1lYUW9hU2tnZEc4Z1lXTmpaWE56SUdFZ2QzSmhjSEJsY2ljcFhHNGdJSDFjYmx4dUlDQndjbTl3Y3lBb0tUb2dkbTlwWkNCN1hHNGdJQ0FnZEdocGN5NTBhSEp2ZDBWeWNtOXlTV1pYY21Gd2NHVnljMGx6Ulcxd2RIa29KM0J5YjNCekp5bGNibHh1SUNBZ0lIUm9jbTkzUlhKeWIzSW9KM0J5YjNCeklHMTFjM1FnWW1VZ1kyRnNiR1ZrSUc5dUlHRWdjMmx1WjJ4bElIZHlZWEJ3WlhJc0lIVnpaU0JoZENocEtTQjBieUJoWTJObGMzTWdZU0IzY21Gd2NHVnlKeWxjYmlBZ2ZWeHVYRzRnSUhSbGVIUWdLQ2s2SUhadmFXUWdlMXh1SUNBZ0lIUm9hWE11ZEdoeWIzZEZjbkp2Y2tsbVYzSmhjSEJsY25OSmMwVnRjSFI1S0NkMFpYaDBKeWxjYmx4dUlDQWdJSFJvY205M1JYSnliM0lvSjNSbGVIUWdiWFZ6ZENCaVpTQmpZV3hzWldRZ2IyNGdZU0J6YVc1bmJHVWdkM0poY0hCbGNpd2dkWE5sSUdGMEtHa3BJSFJ2SUdGalkyVnpjeUJoSUhkeVlYQndaWEluS1Z4dUlDQjlYRzVjYmlBZ2RHaHliM2RGY25KdmNrbG1WM0poY0hCbGNuTkpjMFZ0Y0hSNUlDaHRaWFJvYjJRNklITjBjbWx1WnlrNklIWnZhV1FnZTF4dUlDQWdJR2xtSUNoMGFHbHpMbmR5WVhCd1pYSnpMbXhsYm1kMGFDQTlQVDBnTUNrZ2UxeHVJQ0FnSUNBZ2RHaHliM2RGY25KdmNpaGdKSHR0WlhSb2IyUjlJR05oYm01dmRDQmlaU0JqWVd4c1pXUWdiMjRnTUNCcGRHVnRjMkFwWEc0Z0lDQWdmVnh1SUNCOVhHNWNiaUFnYzJWMFEyOXRjSFYwWldRZ0tHTnZiWEIxZEdWa09pQlBZbXBsWTNRcE9pQjJiMmxrSUh0Y2JpQWdJQ0IwYUdsekxuUm9jbTkzUlhKeWIzSkpabGR5WVhCd1pYSnpTWE5GYlhCMGVTZ25jMlYwUTI5dGNIVjBaV1FuS1Z4dVhHNGdJQ0FnZEdocGN5NTNjbUZ3Y0dWeWN5NW1iM0pGWVdOb0tIZHlZWEJ3WlhJZ1BUNGdkM0poY0hCbGNpNXpaWFJEYjIxd2RYUmxaQ2hqYjIxd2RYUmxaQ2twWEc0Z0lIMWNibHh1SUNCelpYUkVZWFJoSUNoa1lYUmhPaUJQWW1wbFkzUXBPaUIyYjJsa0lIdGNiaUFnSUNCMGFHbHpMblJvY205M1JYSnliM0pKWmxkeVlYQndaWEp6U1hORmJYQjBlU2duYzJWMFJHRjBZU2NwWEc1Y2JpQWdJQ0IwYUdsekxuZHlZWEJ3WlhKekxtWnZja1ZoWTJnb2QzSmhjSEJsY2lBOVBpQjNjbUZ3Y0dWeUxuTmxkRVJoZEdFb1pHRjBZU2twWEc0Z0lIMWNibHh1SUNCelpYUk5aWFJvYjJSeklDaHdjbTl3Y3pvZ1QySnFaV04wS1RvZ2RtOXBaQ0I3WEc0Z0lDQWdkR2hwY3k1MGFISnZkMFZ5Y205eVNXWlhjbUZ3Y0dWeWMwbHpSVzF3ZEhrb0ozTmxkRTFsZEdodlpITW5LVnh1WEc0Z0lDQWdkR2hwY3k1M2NtRndjR1Z5Y3k1bWIzSkZZV05vS0hkeVlYQndaWElnUFQ0Z2QzSmhjSEJsY2k1elpYUk5aWFJvYjJSektIQnliM0J6S1NsY2JpQWdmVnh1WEc0Z0lITmxkRkJ5YjNCeklDaHdjbTl3Y3pvZ1QySnFaV04wS1RvZ2RtOXBaQ0I3WEc0Z0lDQWdkR2hwY3k1MGFISnZkMFZ5Y205eVNXWlhjbUZ3Y0dWeWMwbHpSVzF3ZEhrb0ozTmxkRkJ5YjNCekp5bGNibHh1SUNBZ0lIUm9hWE11ZDNKaGNIQmxjbk11Wm05eVJXRmphQ2gzY21Gd2NHVnlJRDArSUhkeVlYQndaWEl1YzJWMFVISnZjSE1vY0hKdmNITXBLVnh1SUNCOVhHNWNiaUFnZEhKcFoyZGxjaUFvWlhabGJuUTZJSE4wY21sdVp5d2diM0IwYVc5dWN6b2dUMkpxWldOMEtUb2dkbTlwWkNCN1hHNGdJQ0FnZEdocGN5NTBhSEp2ZDBWeWNtOXlTV1pYY21Gd2NHVnljMGx6Ulcxd2RIa29KM1J5YVdkblpYSW5LVnh1WEc0Z0lDQWdkR2hwY3k1M2NtRndjR1Z5Y3k1bWIzSkZZV05vS0hkeVlYQndaWElnUFQ0Z2QzSmhjSEJsY2k1MGNtbG5aMlZ5S0dWMlpXNTBMQ0J2Y0hScGIyNXpLU2xjYmlBZ2ZWeHVYRzRnSUhWd1pHRjBaU0FvS1RvZ2RtOXBaQ0I3WEc0Z0lDQWdkR2hwY3k1MGFISnZkMFZ5Y205eVNXWlhjbUZ3Y0dWeWMwbHpSVzF3ZEhrb0ozVndaR0YwWlNjcFhHNGdJQ0FnZDJGeWJpZ25kWEJrWVhSbElHaGhjeUJpWldWdUlISmxiVzkyWldRdUlFRnNiQ0JqYUdGdVoyVnpJR0Z5WlNCdWIzY2djM2x1WTJoeWJtOTFjeUIzYVhSb2IzVjBJR05oYkd4cGJtY2dkWEJrWVhSbEp5bGNiaUFnZlZ4dVhHNGdJR1JsYzNSeWIza2dLQ2s2SUhadmFXUWdlMXh1SUNBZ0lIUm9hWE11ZEdoeWIzZEZjbkp2Y2tsbVYzSmhjSEJsY25OSmMwVnRjSFI1S0Nka1pYTjBjbTk1SnlsY2JseHVJQ0FnSUhSb2FYTXVkM0poY0hCbGNuTXVabTl5UldGamFDaDNjbUZ3Y0dWeUlEMCtJSGR5WVhCd1pYSXVaR1Z6ZEhKdmVTZ3BLVnh1SUNCOVhHNTlYRzRpTENJdkx5QkFabXh2ZDF4dVhHNXBiWEJ2Y25RZ2V5QjBhSEp2ZDBWeWNtOXlJSDBnWm5KdmJTQW5jMmhoY21Wa0wzVjBhV3duWEc1Y2JtVjRjRzl5ZENCa1pXWmhkV3gwSUdOc1lYTnpJRVZ5Y205eVYzSmhjSEJsY2lCcGJYQnNaVzFsYm5SeklFSmhjMlZYY21Gd2NHVnlJSHRjYmlBZ2MyVnNaV04wYjNJNklITjBjbWx1Wnp0Y2JseHVJQ0JqYjI1emRISjFZM1J2Y2lBb2MyVnNaV04wYjNJNklITjBjbWx1WnlrZ2UxeHVJQ0FnSUhSb2FYTXVjMlZzWldOMGIzSWdQU0J6Wld4bFkzUnZjbHh1SUNCOVhHNWNiaUFnWVhRZ0tDazZJSFp2YVdRZ2UxeHVJQ0FnSUhSb2NtOTNSWEp5YjNJb1lHWnBibVFnWkdsa0lHNXZkQ0J5WlhSMWNtNGdKSHQwYUdsekxuTmxiR1ZqZEc5eWZTd2dZMkZ1Ym05MElHTmhiR3dnWVhRb0tTQnZiaUJsYlhCMGVTQlhjbUZ3Y0dWeVlDbGNiaUFnZlZ4dVhHNGdJR0YwZEhKcFluVjBaWE1nS0NrNklIWnZhV1FnZTF4dUlDQWdJSFJvY205M1JYSnliM0lvWUdacGJtUWdaR2xrSUc1dmRDQnlaWFIxY200Z0pIdDBhR2x6TG5ObGJHVmpkRzl5ZlN3Z1kyRnVibTkwSUdOaGJHd2dZWFIwY21saWRYUmxjeWdwSUc5dUlHVnRjSFI1SUZkeVlYQndaWEpnS1Z4dUlDQjlYRzVjYmlBZ1kyeGhjM05sY3lBb0tUb2dkbTlwWkNCN1hHNGdJQ0FnZEdoeWIzZEZjbkp2Y2loZ1ptbHVaQ0JrYVdRZ2JtOTBJSEpsZEhWeWJpQWtlM1JvYVhNdWMyVnNaV04wYjNKOUxDQmpZVzV1YjNRZ1kyRnNiQ0JqYkdGemMyVnpLQ2tnYjI0Z1pXMXdkSGtnVjNKaGNIQmxjbUFwWEc0Z0lIMWNibHh1SUNCamIyNTBZV2x1Y3lBb0tUb2dkbTlwWkNCN1hHNGdJQ0FnZEdoeWIzZEZjbkp2Y2loZ1ptbHVaQ0JrYVdRZ2JtOTBJSEpsZEhWeWJpQWtlM1JvYVhNdWMyVnNaV04wYjNKOUxDQmpZVzV1YjNRZ1kyRnNiQ0JqYjI1MFlXbHVjeWdwSUc5dUlHVnRjSFI1SUZkeVlYQndaWEpnS1Z4dUlDQjlYRzVjYmlBZ1pXMXBkSFJsWkNBb0tUb2dkbTlwWkNCN1hHNGdJQ0FnZEdoeWIzZEZjbkp2Y2loZ1ptbHVaQ0JrYVdRZ2JtOTBJSEpsZEhWeWJpQWtlM1JvYVhNdWMyVnNaV04wYjNKOUxDQmpZVzV1YjNRZ1kyRnNiQ0JsYldsMGRHVmtLQ2tnYjI0Z1pXMXdkSGtnVjNKaGNIQmxjbUFwWEc0Z0lIMWNibHh1SUNCbGJXbDBkR1ZrUW5sUGNtUmxjaUFvS1RvZ2RtOXBaQ0I3WEc0Z0lDQWdkR2h5YjNkRmNuSnZjaWhnWm1sdVpDQmthV1FnYm05MElISmxkSFZ5YmlBa2UzUm9hWE11YzJWc1pXTjBiM0o5TENCallXNXViM1FnWTJGc2JDQmxiV2wwZEdWa1FubFBjbVJsY2lncElHOXVJR1Z0Y0hSNUlGZHlZWEJ3WlhKZ0tWeHVJQ0I5WEc1Y2JpQWdaWGhwYzNSeklDZ3BPaUJpYjI5c1pXRnVJSHRjYmlBZ0lDQnlaWFIxY200Z1ptRnNjMlZjYmlBZ2ZWeHVYRzRnSUdacGJIUmxjaUFvS1RvZ2RtOXBaQ0I3WEc0Z0lDQWdkR2h5YjNkRmNuSnZjaWhnWm1sdVpDQmthV1FnYm05MElISmxkSFZ5YmlBa2UzUm9hWE11YzJWc1pXTjBiM0o5TENCallXNXViM1FnWTJGc2JDQm1hV3gwWlhJb0tTQnZiaUJsYlhCMGVTQlhjbUZ3Y0dWeVlDbGNiaUFnZlZ4dVhHNGdJSFpwYzJsaWJHVWdLQ2s2SUhadmFXUWdlMXh1SUNBZ0lIUm9jbTkzUlhKeWIzSW9ZR1pwYm1RZ1pHbGtJRzV2ZENCeVpYUjFjbTRnSkh0MGFHbHpMbk5sYkdWamRHOXlmU3dnWTJGdWJtOTBJR05oYkd3Z2RtbHphV0pzWlNncElHOXVJR1Z0Y0hSNUlGZHlZWEJ3WlhKZ0tWeHVJQ0I5WEc1Y2JpQWdhR0Z6UVhSMGNtbGlkWFJsSUNncE9pQjJiMmxrSUh0Y2JpQWdJQ0IwYUhKdmQwVnljbTl5S0dCbWFXNWtJR1JwWkNCdWIzUWdjbVYwZFhKdUlDUjdkR2hwY3k1elpXeGxZM1J2Y24wc0lHTmhibTV2ZENCallXeHNJR2hoYzBGMGRISnBZblYwWlNncElHOXVJR1Z0Y0hSNUlGZHlZWEJ3WlhKZ0tWeHVJQ0I5WEc1Y2JpQWdhR0Z6UTJ4aGMzTWdLQ2s2SUhadmFXUWdlMXh1SUNBZ0lIUm9jbTkzUlhKeWIzSW9ZR1pwYm1RZ1pHbGtJRzV2ZENCeVpYUjFjbTRnSkh0MGFHbHpMbk5sYkdWamRHOXlmU3dnWTJGdWJtOTBJR05oYkd3Z2FHRnpRMnhoYzNNb0tTQnZiaUJsYlhCMGVTQlhjbUZ3Y0dWeVlDbGNiaUFnZlZ4dVhHNGdJR2hoYzFCeWIzQWdLQ2s2SUhadmFXUWdlMXh1SUNBZ0lIUm9jbTkzUlhKeWIzSW9ZR1pwYm1RZ1pHbGtJRzV2ZENCeVpYUjFjbTRnSkh0MGFHbHpMbk5sYkdWamRHOXlmU3dnWTJGdWJtOTBJR05oYkd3Z2FHRnpVSEp2Y0NncElHOXVJR1Z0Y0hSNUlGZHlZWEJ3WlhKZ0tWeHVJQ0I5WEc1Y2JpQWdhR0Z6VTNSNWJHVWdLQ2s2SUhadmFXUWdlMXh1SUNBZ0lIUm9jbTkzUlhKeWIzSW9ZR1pwYm1RZ1pHbGtJRzV2ZENCeVpYUjFjbTRnSkh0MGFHbHpMbk5sYkdWamRHOXlmU3dnWTJGdWJtOTBJR05oYkd3Z2FHRnpVM1I1YkdVb0tTQnZiaUJsYlhCMGVTQlhjbUZ3Y0dWeVlDbGNiaUFnZlZ4dVhHNGdJR1pwYm1SQmJHd2dLQ2s2SUhadmFXUWdlMXh1SUNBZ0lIUm9jbTkzUlhKeWIzSW9ZR1pwYm1RZ1pHbGtJRzV2ZENCeVpYUjFjbTRnSkh0MGFHbHpMbk5sYkdWamRHOXlmU3dnWTJGdWJtOTBJR05oYkd3Z1ptbHVaRUZzYkNncElHOXVJR1Z0Y0hSNUlGZHlZWEJ3WlhKZ0tWeHVJQ0I5WEc1Y2JpQWdabWx1WkNBb0tUb2dkbTlwWkNCN1hHNGdJQ0FnZEdoeWIzZEZjbkp2Y2loZ1ptbHVaQ0JrYVdRZ2JtOTBJSEpsZEhWeWJpQWtlM1JvYVhNdWMyVnNaV04wYjNKOUxDQmpZVzV1YjNRZ1kyRnNiQ0JtYVc1a0tDa2diMjRnWlcxd2RIa2dWM0poY0hCbGNtQXBYRzRnSUgxY2JseHVJQ0JvZEcxc0lDZ3BPaUIyYjJsa0lIdGNiaUFnSUNCMGFISnZkMFZ5Y205eUtHQm1hVzVrSUdScFpDQnViM1FnY21WMGRYSnVJQ1I3ZEdocGN5NXpaV3hsWTNSdmNuMHNJR05oYm01dmRDQmpZV3hzSUdoMGJXd29LU0J2YmlCbGJYQjBlU0JYY21Gd2NHVnlZQ2xjYmlBZ2ZWeHVYRzRnSUdseklDZ3BPaUIyYjJsa0lIdGNiaUFnSUNCMGFISnZkMFZ5Y205eUtHQm1hVzVrSUdScFpDQnViM1FnY21WMGRYSnVJQ1I3ZEdocGN5NXpaV3hsWTNSdmNuMHNJR05oYm01dmRDQmpZV3hzSUdsektDa2diMjRnWlcxd2RIa2dWM0poY0hCbGNtQXBYRzRnSUgxY2JseHVJQ0JwYzBWdGNIUjVJQ2dwT2lCMmIybGtJSHRjYmlBZ0lDQjBhSEp2ZDBWeWNtOXlLR0JtYVc1a0lHUnBaQ0J1YjNRZ2NtVjBkWEp1SUNSN2RHaHBjeTV6Wld4bFkzUnZjbjBzSUdOaGJtNXZkQ0JqWVd4c0lHbHpSVzF3ZEhrb0tTQnZiaUJsYlhCMGVTQlhjbUZ3Y0dWeVlDbGNiaUFnZlZ4dVhHNGdJR2x6Vm1semFXSnNaU0FvS1RvZ2RtOXBaQ0I3WEc0Z0lDQWdkR2h5YjNkRmNuSnZjaWhnWm1sdVpDQmthV1FnYm05MElISmxkSFZ5YmlBa2UzUm9hWE11YzJWc1pXTjBiM0o5TENCallXNXViM1FnWTJGc2JDQnBjMVpwYzJsaWJHVW9LU0J2YmlCbGJYQjBlU0JYY21Gd2NHVnlZQ2xjYmlBZ2ZWeHVYRzRnSUdselZuVmxTVzV6ZEdGdVkyVWdLQ2s2SUhadmFXUWdlMXh1SUNBZ0lIUm9jbTkzUlhKeWIzSW9ZR1pwYm1RZ1pHbGtJRzV2ZENCeVpYUjFjbTRnSkh0MGFHbHpMbk5sYkdWamRHOXlmU3dnWTJGdWJtOTBJR05oYkd3Z2FYTldkV1ZKYm5OMFlXNWpaU2dwSUc5dUlHVnRjSFI1SUZkeVlYQndaWEpnS1Z4dUlDQjlYRzVjYmlBZ2JtRnRaU0FvS1RvZ2RtOXBaQ0I3WEc0Z0lDQWdkR2h5YjNkRmNuSnZjaWhnWm1sdVpDQmthV1FnYm05MElISmxkSFZ5YmlBa2UzUm9hWE11YzJWc1pXTjBiM0o5TENCallXNXViM1FnWTJGc2JDQnVZVzFsS0NrZ2IyNGdaVzF3ZEhrZ1YzSmhjSEJsY21BcFhHNGdJSDFjYmx4dUlDQndjbTl3Y3lBb0tUb2dkbTlwWkNCN1hHNGdJQ0FnZEdoeWIzZEZjbkp2Y2loZ1ptbHVaQ0JrYVdRZ2JtOTBJSEpsZEhWeWJpQWtlM1JvYVhNdWMyVnNaV04wYjNKOUxDQmpZVzV1YjNRZ1kyRnNiQ0J3Y205d2N5Z3BJRzl1SUdWdGNIUjVJRmR5WVhCd1pYSmdLVnh1SUNCOVhHNWNiaUFnZEdWNGRDQW9LVG9nZG05cFpDQjdYRzRnSUNBZ2RHaHliM2RGY25KdmNpaGdabWx1WkNCa2FXUWdibTkwSUhKbGRIVnliaUFrZTNSb2FYTXVjMlZzWldOMGIzSjlMQ0JqWVc1dWIzUWdZMkZzYkNCMFpYaDBLQ2tnYjI0Z1pXMXdkSGtnVjNKaGNIQmxjbUFwWEc0Z0lIMWNibHh1SUNCelpYUkRiMjF3ZFhSbFpDQW9LVG9nZG05cFpDQjdYRzRnSUNBZ2RHaHliM2RGY25KdmNpaGdabWx1WkNCa2FXUWdibTkwSUhKbGRIVnliaUFrZTNSb2FYTXVjMlZzWldOMGIzSjlMQ0JqWVc1dWIzUWdZMkZzYkNCelpYUkRiMjF3ZFhSbFpDZ3BJRzl1SUdWdGNIUjVJRmR5WVhCd1pYSmdLVnh1SUNCOVhHNWNiaUFnYzJWMFJHRjBZU0FvS1RvZ2RtOXBaQ0I3WEc0Z0lDQWdkR2h5YjNkRmNuSnZjaWhnWm1sdVpDQmthV1FnYm05MElISmxkSFZ5YmlBa2UzUm9hWE11YzJWc1pXTjBiM0o5TENCallXNXViM1FnWTJGc2JDQnpaWFJFWVhSaEtDa2diMjRnWlcxd2RIa2dWM0poY0hCbGNtQXBYRzRnSUgxY2JseHVJQ0J6WlhSTlpYUm9iMlJ6SUNncE9pQjJiMmxrSUh0Y2JpQWdJQ0IwYUhKdmQwVnljbTl5S0dCbWFXNWtJR1JwWkNCdWIzUWdjbVYwZFhKdUlDUjdkR2hwY3k1elpXeGxZM1J2Y24wc0lHTmhibTV2ZENCallXeHNJSE5sZEUxbGRHaHZaSE1vS1NCdmJpQmxiWEIwZVNCWGNtRndjR1Z5WUNsY2JpQWdmVnh1WEc0Z0lITmxkRkJ5YjNCeklDZ3BPaUIyYjJsa0lIdGNiaUFnSUNCMGFISnZkMFZ5Y205eUtHQm1hVzVrSUdScFpDQnViM1FnY21WMGRYSnVJQ1I3ZEdocGN5NXpaV3hsWTNSdmNuMHNJR05oYm01dmRDQmpZV3hzSUhObGRGQnliM0J6S0NrZ2IyNGdaVzF3ZEhrZ1YzSmhjSEJsY21BcFhHNGdJSDFjYmx4dUlDQjBjbWxuWjJWeUlDZ3BPaUIyYjJsa0lIdGNiaUFnSUNCMGFISnZkMFZ5Y205eUtHQm1hVzVrSUdScFpDQnViM1FnY21WMGRYSnVJQ1I3ZEdocGN5NXpaV3hsWTNSdmNuMHNJR05oYm01dmRDQmpZV3hzSUhSeWFXZG5aWElvS1NCdmJpQmxiWEIwZVNCWGNtRndjR1Z5WUNsY2JpQWdmVnh1WEc0Z0lIVndaR0YwWlNBb0tUb2dkbTlwWkNCN1hHNGdJQ0FnZEdoeWIzZEZjbkp2Y2loZ2RYQmtZWFJsSUdoaGN5QmlaV1Z1SUhKbGJXOTJaV1FnWm5KdmJTQjJkV1V0ZEdWemRDMTFkR2xzY3k0Z1FXeHNJSFZ3WkdGMFpYTWdZWEpsSUc1dmR5QnplVzVqYUhKdmJtOTFjeUJpZVNCa1pXWmhkV3gwWUNsY2JpQWdmVnh1WEc0Z0lHUmxjM1J5YjNrZ0tDazZJSFp2YVdRZ2UxeHVJQ0FnSUhSb2NtOTNSWEp5YjNJb1lHWnBibVFnWkdsa0lHNXZkQ0J5WlhSMWNtNGdKSHQwYUdsekxuTmxiR1ZqZEc5eWZTd2dZMkZ1Ym05MElHTmhiR3dnWkdWemRISnZlU2dwSUc5dUlHVnRjSFI1SUZkeVlYQndaWEpnS1Z4dUlDQjlYRzU5WEc0aUxDSXZMeUJBWm14dmQxeHVYRzVwYlhCdmNuUWdlMXh1SUNCU1JVWmZVMFZNUlVOVVQxSmNibjBnWm5KdmJTQW5MaTlqYjI1emRITW5YRzVwYlhCdmNuUWdlMXh1SUNCMGFISnZkMFZ5Y205eVhHNTlJR1p5YjIwZ0ozTm9ZWEpsWkM5MWRHbHNKMXh1WEc1bWRXNWpkR2x2YmlCbWFXNWtRV3hzVms1dlpHVnpJQ2gyYm05a1pUb2dWazV2WkdVc0lHNXZaR1Z6T2lCQmNuSmhlVHhXVG05a1pUNGdQU0JiWFNrNklFRnljbUY1UEZaT2IyUmxQaUI3WEc0Z0lHNXZaR1Z6TG5CMWMyZ29kbTV2WkdVcFhHNWNiaUFnYVdZZ0tFRnljbUY1TG1selFYSnlZWGtvZG01dlpHVXVZMmhwYkdSeVpXNHBLU0I3WEc0Z0lDQWdkbTV2WkdVdVkyaHBiR1J5Wlc0dVptOXlSV0ZqYUNnb1kyaHBiR1JXVG05a1pTa2dQVDRnZTF4dUlDQWdJQ0FnWm1sdVpFRnNiRlpPYjJSbGN5aGphR2xzWkZaT2IyUmxMQ0J1YjJSbGN5bGNiaUFnSUNCOUtWeHVJQ0I5WEc1Y2JpQWdhV1lnS0hadWIyUmxMbU5vYVd4a0tTQjdYRzRnSUNBZ1ptbHVaRUZzYkZaT2IyUmxjeWgyYm05a1pTNWphR2xzWkM1ZmRtNXZaR1VzSUc1dlpHVnpLVnh1SUNCOVhHNWNiaUFnY21WMGRYSnVJRzV2WkdWelhHNTlYRzVjYm1aMWJtTjBhVzl1SUhKbGJXOTJaVVIxY0d4cFkyRjBaVTV2WkdWeklDaDJUbTlrWlhNNklFRnljbUY1UEZaT2IyUmxQaWs2SUVGeWNtRjVQRlpPYjJSbFBpQjdYRzRnSUhKbGRIVnliaUIyVG05a1pYTXVabWxzZEdWeUtDaDJUbTlrWlN3Z2FXNWtaWGdwSUQwK0lHbHVaR1Y0SUQwOVBTQjJUbTlrWlhNdVptbHVaRWx1WkdWNEtHNXZaR1VnUFQ0Z2RrNXZaR1V1Wld4dElEMDlQU0J1YjJSbExtVnNiU2twWEc1OVhHNWNibVoxYm1OMGFXOXVJRzV2WkdWTllYUmphR1Z6VW1WbUlDaHViMlJsT2lCV1RtOWtaU3dnY21WbVRtRnRaVG9nYzNSeWFXNW5LVG9nWW05dmJHVmhiaUI3WEc0Z0lISmxkSFZ5YmlCdWIyUmxMbVJoZEdFZ0ppWWdibTlrWlM1a1lYUmhMbkpsWmlBOVBUMGdjbVZtVG1GdFpWeHVmVnh1WEc1bWRXNWpkR2x2YmlCbWFXNWtWazV2WkdWelFubFNaV1lnS0haT2IyUmxPaUJXVG05a1pTd2djbVZtVG1GdFpUb2djM1J5YVc1bktUb2dRWEp5WVhrOFZrNXZaR1UrSUh0Y2JpQWdZMjl1YzNRZ2JtOWtaWE1nUFNCbWFXNWtRV3hzVms1dlpHVnpLSFpPYjJSbEtWeHVJQ0JqYjI1emRDQnlaV1pHYVd4MFpYSmxaRTV2WkdWeklEMGdibTlrWlhNdVptbHNkR1Z5S0c1dlpHVWdQVDRnYm05a1pVMWhkR05vWlhOU1pXWW9ibTlrWlN3Z2NtVm1UbUZ0WlNrcFhHNGdJQzh2SUU5dWJIa2djbVYwZFhKdUlISmxabk1nWkdWbWFXNWxaQ0J2YmlCMGIzQXRiR1YyWld3Z1ZrNXZaR1VnZEc4Z2NISnZkbWxrWlNCMGFHVWdjMkZ0WlZ4dUlDQXZMeUJpWldoaGRtbHZjaUJoY3lCelpXeGxZM1JwYm1jZ2RtbGhJSFp0TGlSeVpXWXVlM052YldWU1pXWk9ZVzFsZlZ4dUlDQmpiMjV6ZENCdFlXbHVWazV2WkdWR2FXeDBaWEpsWkU1dlpHVnpJRDBnY21WbVJtbHNkR1Z5WldST2IyUmxjeTVtYVd4MFpYSW9ibTlrWlNBOVBpQW9YRzRnSUNBZ0lTRjJUbTlrWlM1amIyNTBaWGgwTGlSeVpXWnpXMjV2WkdVdVpHRjBZUzV5WldaZFhHNGdJQ2twWEc0Z0lISmxkSFZ5YmlCeVpXMXZkbVZFZFhCc2FXTmhkR1ZPYjJSbGN5aHRZV2x1Vms1dlpHVkdhV3gwWlhKbFpFNXZaR1Z6S1Z4dWZWeHVYRzVtZFc1amRHbHZiaUJ1YjJSbFRXRjBZMmhsYzFObGJHVmpkRzl5SUNodWIyUmxPaUJXVG05a1pTd2djMlZzWldOMGIzSTZJSE4wY21sdVp5azZJR0p2YjJ4bFlXNGdlMXh1SUNCeVpYUjFjbTRnYm05a1pTNWxiRzBnSmlZZ2JtOWtaUzVsYkcwdVoyVjBRWFIwY21saWRYUmxJQ1ltSUc1dlpHVXVaV3h0TG0xaGRHTm9aWE1vYzJWc1pXTjBiM0lwWEc1OVhHNWNibVoxYm1OMGFXOXVJR1pwYm1SV1RtOWtaWE5DZVZObGJHVmpkRzl5SUNoY2JpQWdkazV2WkdVNklGWk9iMlJsTEZ4dUlDQnpaV3hsWTNSdmNqb2djM1J5YVc1blhHNHBPaUJCY25KaGVUeFdUbTlrWlQ0Z2UxeHVJQ0JqYjI1emRDQnViMlJsY3lBOUlHWnBibVJCYkd4V1RtOWtaWE1vZGs1dlpHVXBYRzRnSUdOdmJuTjBJR1pwYkhSbGNtVmtUbTlrWlhNZ1BTQnViMlJsY3k1bWFXeDBaWElvYm05a1pTQTlQaUFvWEc0Z0lDQWdibTlrWlUxaGRHTm9aWE5UWld4bFkzUnZjaWh1YjJSbExDQnpaV3hsWTNSdmNpbGNiaUFnS1NsY2JpQWdjbVYwZFhKdUlISmxiVzkyWlVSMWNHeHBZMkYwWlU1dlpHVnpLR1pwYkhSbGNtVmtUbTlrWlhNcFhHNTlYRzVjYm1WNGNHOXlkQ0JrWldaaGRXeDBJR1oxYm1OMGFXOXVJR1pwYm1SV2JtOWtaWE1nS0Z4dUlDQjJibTlrWlRvZ1ZrNXZaR1VzWEc0Z0lIWnRPaUJEYjIxd2IyNWxiblFnZkNCdWRXeHNMRnh1SUNCelpXeGxZM1J2Y2xSNWNHVTZJRDl6ZEhKcGJtY3NYRzRnSUhObGJHVmpkRzl5T2lCUFltcGxZM1FnZkNCemRISnBibWRjYmlrNklFRnljbUY1UEZaT2IyUmxQaUI3WEc0Z0lHbG1JQ2h6Wld4bFkzUnZjbFI1Y0dVZ1BUMDlJRkpGUmw5VFJVeEZRMVJQVWlrZ2UxeHVJQ0FnSUdsbUlDZ2hkbTBwSUh0Y2JpQWdJQ0FnSUhSb2NtOTNSWEp5YjNJb0p5UnlaV1lnYzJWc1pXTjBiM0p6SUdOaGJpQnZibXg1SUdKbElIVnpaV1FnYjI0Z1ZuVmxJR052YlhCdmJtVnVkQ0IzY21Gd2NHVnljeWNwWEc0Z0lDQWdmVnh1SUNBZ0lDOHZJQ1JHYkc5M1NXZHViM0psWEc0Z0lDQWdjbVYwZFhKdUlHWnBibVJXVG05a1pYTkNlVkpsWmloMmJtOWtaU3dnYzJWc1pXTjBiM0l1Y21WbUtWeHVJQ0I5WEc0Z0lDOHZJQ1JHYkc5M1NXZHViM0psWEc0Z0lISmxkSFZ5YmlCbWFXNWtWazV2WkdWelFubFRaV3hsWTNSdmNpaDJibTlrWlN3Z2MyVnNaV04wYjNJcFhHNTlYRzRpTENJdkx5QkFabXh2ZDF4dVhHNWxlSEJ2Y25RZ1pHVm1ZWFZzZENCbWRXNWpkR2x2YmlCbWFXNWtSRTlOVG05a1pYTWdLRnh1SUNCbGJHVnRaVzUwT2lCRmJHVnRaVzUwSUh3Z2JuVnNiQ3hjYmlBZ2MyVnNaV04wYjNJNklITjBjbWx1WjF4dUtUb2dRWEp5WVhrOFZrNXZaR1UrSUh0Y2JpQWdZMjl1YzNRZ2JtOWtaWE1nUFNCYlhWeHVJQ0JwWmlBb0lXVnNaVzFsYm5RZ2ZId2dJV1ZzWlcxbGJuUXVjWFZsY25sVFpXeGxZM1J2Y2tGc2JDQjhmQ0FoWld4bGJXVnVkQzV0WVhSamFHVnpLU0I3WEc0Z0lDQWdjbVYwZFhKdUlHNXZaR1Z6WEc0Z0lIMWNibHh1SUNCcFppQW9aV3hsYldWdWRDNXRZWFJqYUdWektITmxiR1ZqZEc5eUtTa2dlMXh1SUNBZ0lHNXZaR1Z6TG5CMWMyZ29aV3hsYldWdWRDbGNiaUFnZlZ4dUlDQXZMeUFrUm14dmQwbG5ibTl5WlZ4dUlDQnlaWFIxY200Z2JtOWtaWE11WTI5dVkyRjBLRnRkTG5Oc2FXTmxMbU5oYkd3b1pXeGxiV1Z1ZEM1eGRXVnllVk5sYkdWamRHOXlRV3hzS0hObGJHVmpkRzl5S1NrcFhHNTlYRzRpTENJdkx5QkFabXh2ZDF4dVhHNXBiWEJ2Y25RZ1ptbHVaRlp1YjJSbGN5Qm1jbTl0SUNjdUwyWnBibVF0ZG01dlpHVnpKMXh1YVcxd2IzSjBJR1pwYm1SV2RXVkRiMjF3YjI1bGJuUnpJR1p5YjIwZ0p5NHZabWx1WkMxMmRXVXRZMjl0Y0c5dVpXNTBjeWRjYm1sdGNHOXlkQ0JtYVc1a1JFOU5UbTlrWlhNZ1puSnZiU0FuTGk5bWFXNWtMV1J2YlMxdWIyUmxjeWRjYm1sdGNHOXlkQ0I3WEc0Z0lFTlBUVkJQVGtWT1ZGOVRSVXhGUTFSUFVpeGNiaUFnVGtGTlJWOVRSVXhGUTFSUFVpeGNiaUFnUkU5TlgxTkZURVZEVkU5U1hHNTlJR1p5YjIwZ0p5NHZZMjl1YzNSekoxeHVhVzF3YjNKMElGWjFaU0JtY205dElDZDJkV1VuWEc1cGJYQnZjblFnWjJWMFUyVnNaV04wYjNKVWVYQmxUM0pVYUhKdmR5Qm1jbTl0SUNjdUwyZGxkQzF6Wld4bFkzUnZjaTEwZVhCbEoxeHVhVzF3YjNKMElIc2dkR2h5YjNkRmNuSnZjaUI5SUdaeWIyMGdKM05vWVhKbFpDOTFkR2xzSjF4dVhHNWxlSEJ2Y25RZ1pHVm1ZWFZzZENCbWRXNWpkR2x2YmlCbWFXNWtJQ2hjYmlBZ2RtMDZJRU52YlhCdmJtVnVkQ0I4SUc1MWJHd3NYRzRnSUhadWIyUmxPaUJXVG05a1pTQjhJRzUxYkd3c1hHNGdJR1ZzWlcxbGJuUTZJRVZzWlcxbGJuUXNYRzRnSUhObGJHVmpkRzl5T2lCVFpXeGxZM1J2Y2x4dUtUb2dRWEp5WVhrOFZrNXZaR1VnZkNCRGIyMXdiMjVsYm5RK0lIdGNiaUFnWTI5dWMzUWdjMlZzWldOMGIzSlVlWEJsSUQwZ1oyVjBVMlZzWldOMGIzSlVlWEJsVDNKVWFISnZkeWh6Wld4bFkzUnZjaXdnSjJacGJtUW5LVnh1WEc0Z0lHbG1JQ2doZG01dlpHVWdKaVlnSVhadElDWW1JSE5sYkdWamRHOXlWSGx3WlNBaFBUMGdSRTlOWDFORlRFVkRWRTlTS1NCN1hHNGdJQ0FnZEdoeWIzZEZjbkp2Y2lnblkyRnVibTkwSUdacGJtUWdZU0JXZFdVZ2FXNXpkR0Z1WTJVZ2IyNGdZU0JFVDAwZ2JtOWtaUzRnVkdobElHNXZaR1VnZVc5MUlHRnlaU0JqWVd4c2FXNW5JR1pwYm1RZ2IyNGdaRzlsY3lCdWIzUWdaWGhwYzNRZ2FXNGdkR2hsSUZaRWIyMHVJRUZ5WlNCNWIzVWdZV1JrYVc1bklIUm9aU0J1YjJSbElHRnpJR2x1Ym1WeVNGUk5URDhuS1Z4dUlDQjlYRzVjYmlBZ2FXWWdLSE5sYkdWamRHOXlWSGx3WlNBOVBUMGdRMDlOVUU5T1JVNVVYMU5GVEVWRFZFOVNJSHg4SUhObGJHVmpkRzl5Vkhsd1pTQTlQVDBnVGtGTlJWOVRSVXhGUTFSUFVpa2dlMXh1SUNBZ0lHTnZibk4wSUhKdmIzUWdQU0IyYlNCOGZDQjJibTlrWlZ4dUlDQWdJR2xtSUNnaGNtOXZkQ2tnZTF4dUlDQWdJQ0FnY21WMGRYSnVJRnRkWEc0Z0lDQWdmVnh1SUNBZ0lISmxkSFZ5YmlCbWFXNWtWblZsUTI5dGNHOXVaVzUwY3loeWIyOTBMQ0J6Wld4bFkzUnZjbFI1Y0dVc0lITmxiR1ZqZEc5eUtWeHVJQ0I5WEc1Y2JpQWdhV1lnS0hadElDWW1JSFp0TGlSeVpXWnpJQ1ltSUhObGJHVmpkRzl5TG5KbFppQnBiaUIyYlM0a2NtVm1jeUFtSmlCMmJTNGtjbVZtYzF0elpXeGxZM1J2Y2k1eVpXWmRJR2x1YzNSaGJtTmxiMllnVm5WbEtTQjdYRzRnSUNBZ2NtVjBkWEp1SUZ0MmJTNGtjbVZtYzF0elpXeGxZM1J2Y2k1eVpXWmRYVnh1SUNCOVhHNWNiaUFnYVdZZ0tIWnViMlJsS1NCN1hHNGdJQ0FnWTI5dWMzUWdibTlrWlhNZ1BTQm1hVzVrVm01dlpHVnpLSFp1YjJSbExDQjJiU3dnYzJWc1pXTjBiM0pVZVhCbExDQnpaV3hsWTNSdmNpbGNiaUFnSUNCcFppQW9jMlZzWldOMGIzSlVlWEJsSUNFOVBTQkVUMDFmVTBWTVJVTlVUMUlwSUh0Y2JpQWdJQ0FnSUhKbGRIVnliaUJ1YjJSbGMxeHVJQ0FnSUgxY2JpQWdJQ0J5WlhSMWNtNGdibTlrWlhNdWJHVnVaM1JvSUQ0Z01DQS9JRzV2WkdWeklEb2dabWx1WkVSUFRVNXZaR1Z6S0dWc1pXMWxiblFzSUhObGJHVmpkRzl5S1Z4dUlDQjlYRzVjYmlBZ2NtVjBkWEp1SUdacGJtUkVUMDFPYjJSbGN5aGxiR1Z0Wlc1MExDQnpaV3hsWTNSdmNpbGNibjFjYmlJc0lpOHZJRUJtYkc5M1hHNWNibWx0Y0c5eWRDQldkV1VnWm5KdmJTQW5kblZsSjF4dWFXMXdiM0owSUZkeVlYQndaWElnWm5KdmJTQW5MaTkzY21Gd2NHVnlKMXh1YVcxd2IzSjBJRloxWlZkeVlYQndaWElnWm5KdmJTQW5MaTkyZFdVdGQzSmhjSEJsY2lkY2JseHVaWGh3YjNKMElHUmxabUYxYkhRZ1puVnVZM1JwYjI0Z1kzSmxZWFJsVjNKaGNIQmxjaUFvWEc0Z0lHNXZaR1U2SUZaT2IyUmxJSHdnUTI5dGNHOXVaVzUwTEZ4dUlDQnZjSFJwYjI1ek9pQlhjbUZ3Y0dWeVQzQjBhVzl1YzF4dUtTQjdYRzRnSUhKbGRIVnliaUJ1YjJSbElHbHVjM1JoYm1ObGIyWWdWblZsWEc0Z0lDQWdQeUJ1WlhjZ1ZuVmxWM0poY0hCbGNpaHViMlJsTENCdmNIUnBiMjV6S1Z4dUlDQWdJRG9nYm1WM0lGZHlZWEJ3WlhJb2JtOWtaU3dnYjNCMGFXOXVjeWxjYm4xY2JpSXNJbXhsZENCcElEMGdNRnh1WEc1bWRXNWpkR2x2YmlCdmNtUmxja1JsY0hNZ0tIZGhkR05vWlhJcElIdGNiaUFnZDJGMFkyaGxjaTVrWlhCekxtWnZja1ZoWTJnb1pHVndJRDArSUh0Y2JpQWdJQ0JwWmlBb1pHVndMbDl6YjNKMFpXUkpaQ0E5UFQwZ2FTa2dlMXh1SUNBZ0lDQWdjbVYwZFhKdVhHNGdJQ0FnZlZ4dUlDQWdJR1JsY0M1ZmMyOXlkR1ZrU1dRZ1BTQnBYRzRnSUNBZ1pHVndMbk4xWW5NdVptOXlSV0ZqYUNodmNtUmxja1JsY0hNcFhHNGdJQ0FnWkdWd0xuTjFZbk1nUFNCa1pYQXVjM1ZpY3k1emIzSjBLQ2hoTENCaUtTQTlQaUJoTG1sa0lDMGdZaTVwWkNsY2JpQWdmU2xjYm4xY2JseHVablZ1WTNScGIyNGdiM0prWlhKV2JWZGhkR05vWlhKeklDaDJiU2tnZTF4dUlDQnBaaUFvZG0wdVgzZGhkR05vWlhKektTQjdYRzRnSUNBZ2RtMHVYM2RoZEdOb1pYSnpMbVp2Y2tWaFkyZ29iM0prWlhKRVpYQnpLVnh1SUNCOVhHNWNiaUFnYVdZZ0tIWnRMbDlqYjIxd2RYUmxaRmRoZEdOb1pYSnpLU0I3WEc0Z0lDQWdUMkpxWldOMExtdGxlWE1vZG0wdVgyTnZiWEIxZEdWa1YyRjBZMmhsY25NcExtWnZja1ZoWTJnb0tHTnZiWEIxZEdWa1YyRjBZMmhsY2lrZ1BUNGdlMXh1SUNBZ0lDQWdiM0prWlhKRVpYQnpLSFp0TGw5amIyMXdkWFJsWkZkaGRHTm9aWEp6VzJOdmJYQjFkR1ZrVjJGMFkyaGxjbDBwWEc0Z0lDQWdmU2xjYmlBZ2ZWeHVYRzRnSUc5eVpHVnlSR1Z3Y3loMmJTNWZkMkYwWTJobGNpbGNibHh1SUNCMmJTNGtZMmhwYkdSeVpXNHVabTl5UldGamFDaHZjbVJsY2xadFYyRjBZMmhsY25NcFhHNTlYRzVjYm1WNGNHOXlkQ0JtZFc1amRHbHZiaUJ2Y21SbGNsZGhkR05vWlhKeklDaDJiU2tnZTF4dUlDQnZjbVJsY2xadFYyRjBZMmhsY25Nb2RtMHBYRzRnSUdrcksxeHVmVnh1SWl3aUx5OGdRR1pzYjNkY2JseHVhVzF3YjNKMElGWjFaU0JtY205dElDZDJkV1VuWEc1cGJYQnZjblFnWjJWMFUyVnNaV04wYjNKVWVYQmxUM0pVYUhKdmR5Qm1jbTl0SUNjdUwyZGxkQzF6Wld4bFkzUnZjaTEwZVhCbEoxeHVhVzF3YjNKMElIdGNiaUFnVWtWR1gxTkZURVZEVkU5U0xGeHVJQ0JEVDAxUVQwNUZUbFJmVTBWTVJVTlVUMUlzWEc0Z0lFNUJUVVZmVTBWTVJVTlVUMUlzWEc0Z0lFWlZUa05VU1U5T1FVeGZUMUJVU1U5T1UxeHVmU0JtY205dElDY3VMMk52Ym5OMGN5ZGNibWx0Y0c5eWRDQjdYRzRnSUhadFEzUnZjazFoZEdOb1pYTk9ZVzFsTEZ4dUlDQjJiVU4wYjNKTllYUmphR1Z6VTJWc1pXTjBiM0lzWEc0Z0lIWnRSblZ1WTNScGIyNWhiRU4wYjNKTllYUmphR1Z6VTJWc1pXTjBiM0pjYm4wZ1puSnZiU0FuTGk5bWFXNWtMWFoxWlMxamIyMXdiMjVsYm5SekoxeHVhVzF3YjNKMElGZHlZWEJ3WlhKQmNuSmhlU0JtY205dElDY3VMM2R5WVhCd1pYSXRZWEp5WVhrblhHNXBiWEJ2Y25RZ1JYSnliM0pYY21Gd2NHVnlJR1p5YjIwZ0p5NHZaWEp5YjNJdGQzSmhjSEJsY2lkY2JtbHRjRzl5ZENCN1hHNGdJSFJvY205M1JYSnliM0lzWEc0Z0lIZGhjbTVjYm4wZ1puSnZiU0FuYzJoaGNtVmtMM1YwYVd3blhHNXBiWEJ2Y25RZ1ptbHVaRUZzYkNCbWNtOXRJQ2N1TDJacGJtUW5YRzVwYlhCdmNuUWdZM0psWVhSbFYzSmhjSEJsY2lCbWNtOXRJQ2N1TDJOeVpXRjBaUzEzY21Gd2NHVnlKMXh1YVcxd2IzSjBJSHRjYmlBZ2IzSmtaWEpYWVhSamFHVnljMXh1ZlNCbWNtOXRJQ2N1TDI5eVpHVnlMWGRoZEdOb1pYSnpKMXh1WEc1bGVIQnZjblFnWkdWbVlYVnNkQ0JqYkdGemN5QlhjbUZ3Y0dWeUlHbHRjR3hsYldWdWRITWdRbUZ6WlZkeVlYQndaWElnZTF4dUlDQjJibTlrWlRvZ1ZrNXZaR1VnZkNCdWRXeHNPMXh1SUNCMmJUb2dRMjl0Y0c5dVpXNTBJSHdnYm5Wc2JEdGNiaUFnWDJWdGFYUjBaV1E2SUhzZ1cyNWhiV1U2SUhOMGNtbHVaMTA2SUVGeWNtRjVQRUZ5Y21GNVBHRnVlVDQrSUgwN1hHNGdJRjlsYldsMGRHVmtRbmxQY21SbGNqb2dRWEp5WVhrOGV5QnVZVzFsT2lCemRISnBibWM3SUdGeVozTTZJRUZ5Y21GNVBHRnVlVDRnZlQ0N1hHNGdJR2x6Vm5WbFEyOXRjRzl1Wlc1ME9pQmliMjlzWldGdU8xeHVJQ0JsYkdWdFpXNTBPaUJGYkdWdFpXNTBPMXh1SUNCMWNHUmhkR1U2SUVaMWJtTjBhVzl1TzF4dUlDQnZjSFJwYjI1ek9pQlhjbUZ3Y0dWeVQzQjBhVzl1Y3p0Y2JpQWdkbVZ5YzJsdmJqb2diblZ0WW1WeU8xeHVJQ0JwYzBaMWJtTjBhVzl1WVd4RGIyMXdiMjVsYm5RNklHSnZiMnhsWVc0N1hHNWNiaUFnWTI5dWMzUnlkV04wYjNJZ0tHNXZaR1U2SUZaT2IyUmxJSHdnUld4bGJXVnVkQ3dnYjNCMGFXOXVjem9nVjNKaGNIQmxjazl3ZEdsdmJuTXBJSHRjYmlBZ0lDQnBaaUFvYm05a1pTQnBibk4wWVc1alpXOW1JRVZzWlcxbGJuUXBJSHRjYmlBZ0lDQWdJSFJvYVhNdVpXeGxiV1Z1ZENBOUlHNXZaR1ZjYmlBZ0lDQWdJSFJvYVhNdWRtNXZaR1VnUFNCdWRXeHNYRzRnSUNBZ2ZTQmxiSE5sSUh0Y2JpQWdJQ0FnSUhSb2FYTXVkbTV2WkdVZ1BTQnViMlJsWEc0Z0lDQWdJQ0IwYUdsekxtVnNaVzFsYm5RZ1BTQnViMlJsTG1Wc2JWeHVJQ0FnSUgxY2JpQWdJQ0JwWmlBb2RHaHBjeTUyYm05a1pTQW1KaUFvZEdocGN5NTJibTlrWlZ0R1ZVNURWRWxQVGtGTVgwOVFWRWxQVGxOZElIeDhJSFJvYVhNdWRtNXZaR1V1Wm5WdVkzUnBiMjVoYkVOdmJuUmxlSFFwS1NCN1hHNGdJQ0FnSUNCMGFHbHpMbWx6Um5WdVkzUnBiMjVoYkVOdmJYQnZibVZ1ZENBOUlIUnlkV1ZjYmlBZ0lDQjlYRzRnSUNBZ2RHaHBjeTV2Y0hScGIyNXpJRDBnYjNCMGFXOXVjMXh1SUNBZ0lIUm9hWE11ZG1WeWMybHZiaUE5SUU1MWJXSmxjaWhnSkh0V2RXVXVkbVZ5YzJsdmJpNXpjR3hwZENnbkxpY3BXekJkZlM0a2UxWjFaUzUyWlhKemFXOXVMbk53YkdsMEtDY3VKeWxiTVYxOVlDbGNiaUFnZlZ4dVhHNGdJR0YwSUNncElIdGNiaUFnSUNCMGFISnZkMFZ5Y205eUtDZGhkQ2dwSUcxMWMzUWdZbVVnWTJGc2JHVmtJRzl1SUdFZ1YzSmhjSEJsY2tGeWNtRjVKeWxjYmlBZ2ZWeHVYRzRnSUM4cUtseHVJQ0FnS2lCU1pYUjFjbTV6SUdGdUlFOWlhbVZqZENCamIyNTBZV2x1YVc1bklHRnNiQ0IwYUdVZ1lYUjBjbWxpZFhSbEwzWmhiSFZsSUhCaGFYSnpJRzl1SUhSb1pTQmxiR1Z0Wlc1MExseHVJQ0FnS2k5Y2JpQWdZWFIwY21saWRYUmxjeUFvS1RvZ2V5QmJibUZ0WlRvZ2MzUnlhVzVuWFRvZ2MzUnlhVzVuSUgwZ2UxeHVJQ0FnSUdOdmJuTjBJR0YwZEhKcFluVjBaWE1nUFNCMGFHbHpMbVZzWlcxbGJuUXVZWFIwY21saWRYUmxjMXh1SUNBZ0lHTnZibk4wSUdGMGRISnBZblYwWlUxaGNDQTlJSHQ5WEc0Z0lDQWdabTl5SUNoc1pYUWdhU0E5SURBN0lHa2dQQ0JoZEhSeWFXSjFkR1Z6TG14bGJtZDBhRHNnYVNzcktTQjdYRzRnSUNBZ0lDQmpiMjV6ZENCaGRIUWdQU0JoZEhSeWFXSjFkR1Z6TG1sMFpXMG9hU2xjYmlBZ0lDQWdJR0YwZEhKcFluVjBaVTFoY0Z0aGRIUXViRzlqWVd4T1lXMWxYU0E5SUdGMGRDNTJZV3gxWlZ4dUlDQWdJSDFjYmlBZ0lDQnlaWFIxY200Z1lYUjBjbWxpZFhSbFRXRndYRzRnSUgxY2JseHVJQ0F2S2lwY2JpQWdJQ29nVW1WMGRYSnVjeUJoYmlCQmNuSmhlU0JqYjI1MFlXbHVhVzVuSUdGc2JDQjBhR1VnWTJ4aGMzTmxjeUJ2YmlCMGFHVWdaV3hsYldWdWRGeHVJQ0FnS2k5Y2JpQWdZMnhoYzNObGN5QW9LVG9nUVhKeVlYazhjM1J5YVc1blBpQjdYRzRnSUNBZ0x5OGdkMjl5YTNNZ1ptOXlJRWhVVFV3Z1JXeGxiV1Z1ZENCaGJtUWdVMVpISUVWc1pXMWxiblJjYmlBZ0lDQmpiMjV6ZENCamJHRnpjMDVoYldVZ1BTQjBhR2x6TG1Wc1pXMWxiblF1WjJWMFFYUjBjbWxpZFhSbEtDZGpiR0Z6Y3ljcFhHNGdJQ0FnYkdWMElHTnNZWE56WlhNZ1BTQmpiR0Z6YzA1aGJXVWdQeUJqYkdGemMwNWhiV1V1YzNCc2FYUW9KeUFuS1NBNklGdGRYRzRnSUNBZ0x5OGdTR0Z1Wkd4bElHTnZiblpsY25ScGJtY2dZM056Ylc5a2RXeGxjeUJwWkdWdWRHbG1hV1Z5Y3lCaVlXTnJJSFJ2SUhSb1pTQnZjbWxuYVc1aGJDQmpiR0Z6Y3lCdVlXMWxYRzRnSUNBZ2FXWWdLSFJvYVhNdWRtMGdKaVlnZEdocGN5NTJiUzRrYzNSNWJHVXBJSHRjYmlBZ0lDQWdJR052Ym5OMElHTnpjMDF2WkhWc1pVbGtaVzUwYVdacFpYSnpJRDBnZTMxY2JpQWdJQ0FnSUd4bGRDQnRiMlIxYkdWSlpHVnVkRnh1SUNBZ0lDQWdUMkpxWldOMExtdGxlWE1vZEdocGN5NTJiUzRrYzNSNWJHVXBMbVp2Y2tWaFkyZ29LR3RsZVNrZ1BUNGdlMXh1SUNBZ0lDQWdJQ0F2THlBa1JteHZkMGxuYm05eVpTQTZJRVpzYjNjZ2RHaHBibXR6SUhadElHbHpJR0VnY0hKdmNHVnlkSGxjYmlBZ0lDQWdJQ0FnYlc5a2RXeGxTV1JsYm5RZ1BTQjBhR2x6TG5adExpUnpkSGxzWlZ0clpYbGRYRzRnSUNBZ0lDQWdJQzh2SUVOVFV5Qk5iMlIxYkdWeklHMWhlU0JpWlNCdGRXeDBhUzFqYkdGemN5QnBaaUIwYUdWNUlHVjRkR1Z1WkNCdmRHaGxjbk11WEc0Z0lDQWdJQ0FnSUM4dklFVjRkR1Z1WkdWa0lHTnNZWE56WlhNZ2MyaHZkV3hrSUdKbElHRnNjbVZoWkhrZ2NISmxjMlZ1ZENCcGJpQWtjM1I1YkdVdVhHNGdJQ0FnSUNBZ0lHMXZaSFZzWlVsa1pXNTBJRDBnYlc5a2RXeGxTV1JsYm5RdWMzQnNhWFFvSnlBbktWc3dYVnh1SUNBZ0lDQWdJQ0JqYzNOTmIyUjFiR1ZKWkdWdWRHbG1hV1Z5YzF0dGIyUjFiR1ZKWkdWdWRGMGdQU0JyWlhsY2JpQWdJQ0FnSUgwcFhHNGdJQ0FnSUNCamJHRnpjMlZ6SUQwZ1kyeGhjM05sY3k1dFlYQW9ZMnhoYzNOT1lXMWxJRDArSUdOemMwMXZaSFZzWlVsa1pXNTBhV1pwWlhKelcyTnNZWE56VG1GdFpWMGdmSHdnWTJ4aGMzTk9ZVzFsS1Z4dUlDQWdJSDFjYmlBZ0lDQnlaWFIxY200Z1kyeGhjM05sYzF4dUlDQjlYRzVjYmlBZ0x5b3FYRzRnSUNBcUlFTm9aV05yY3lCcFppQjNjbUZ3Y0dWeUlHTnZiblJoYVc1eklIQnliM1pwWkdWa0lITmxiR1ZqZEc5eUxseHVJQ0FnS2k5Y2JpQWdZMjl1ZEdGcGJuTWdLSE5sYkdWamRHOXlPaUJUWld4bFkzUnZjaWtnZTF4dUlDQWdJR052Ym5OMElITmxiR1ZqZEc5eVZIbHdaU0E5SUdkbGRGTmxiR1ZqZEc5eVZIbHdaVTl5VkdoeWIzY29jMlZzWldOMGIzSXNJQ2RqYjI1MFlXbHVjeWNwWEc0Z0lDQWdZMjl1YzNRZ2JtOWtaWE1nUFNCbWFXNWtRV3hzS0hSb2FYTXVkbTBzSUhSb2FYTXVkbTV2WkdVc0lIUm9hWE11Wld4bGJXVnVkQ3dnYzJWc1pXTjBiM0lwWEc0Z0lDQWdZMjl1YzNRZ2FYTWdQU0J6Wld4bFkzUnZjbFI1Y0dVZ1BUMDlJRkpGUmw5VFJVeEZRMVJQVWlBL0lHWmhiSE5sSURvZ2RHaHBjeTVwY3loelpXeGxZM1J2Y2lsY2JpQWdJQ0J5WlhSMWNtNGdibTlrWlhNdWJHVnVaM1JvSUQ0Z01DQjhmQ0JwYzF4dUlDQjlYRzVjYmlBZ0x5b3FYRzRnSUNBcUlGSmxkSFZ5Ym5NZ1lXNGdiMkpxWldOMElHTnZiblJoYVc1cGJtY2dZM1Z6ZEc5dElHVjJaVzUwY3lCbGJXbDBkR1ZrSUdKNUlIUm9aU0JYY21Gd2NHVnlJSFp0WEc0Z0lDQXFMMXh1SUNCbGJXbDBkR1ZrSUNobGRtVnVkRDg2SUhOMGNtbHVaeWtnZTF4dUlDQWdJR2xtSUNnaGRHaHBjeTVmWlcxcGRIUmxaQ0FtSmlBaGRHaHBjeTUyYlNrZ2UxeHVJQ0FnSUNBZ2RHaHliM2RGY25KdmNpZ25kM0poY0hCbGNpNWxiV2wwZEdWa0tDa2dZMkZ1SUc5dWJIa2dZbVVnWTJGc2JHVmtJRzl1SUdFZ1ZuVmxJR2x1YzNSaGJtTmxKeWxjYmlBZ0lDQjlYRzRnSUNBZ2FXWWdLR1YyWlc1MEtTQjdYRzRnSUNBZ0lDQnlaWFIxY200Z2RHaHBjeTVmWlcxcGRIUmxaRnRsZG1WdWRGMWNiaUFnSUNCOVhHNGdJQ0FnY21WMGRYSnVJSFJvYVhNdVgyVnRhWFIwWldSY2JpQWdmVnh1WEc0Z0lDOHFLbHh1SUNBZ0tpQlNaWFIxY201eklHRnVJRUZ5Y21GNUlHTnZiblJoYVc1cGJtY2dZM1Z6ZEc5dElHVjJaVzUwY3lCbGJXbDBkR1ZrSUdKNUlIUm9aU0JYY21Gd2NHVnlJSFp0WEc0Z0lDQXFMMXh1SUNCbGJXbDBkR1ZrUW5sUGNtUmxjaUFvS1NCN1hHNGdJQ0FnYVdZZ0tDRjBhR2x6TGw5bGJXbDBkR1ZrUW5sUGNtUmxjaUFtSmlBaGRHaHBjeTUyYlNrZ2UxeHVJQ0FnSUNBZ2RHaHliM2RGY25KdmNpZ25kM0poY0hCbGNpNWxiV2wwZEdWa1FubFBjbVJsY2lncElHTmhiaUJ2Ym14NUlHSmxJR05oYkd4bFpDQnZiaUJoSUZaMVpTQnBibk4wWVc1alpTY3BYRzRnSUNBZ2ZWeHVJQ0FnSUhKbGRIVnliaUIwYUdsekxsOWxiV2wwZEdWa1FubFBjbVJsY2x4dUlDQjlYRzVjYmlBZ0x5b3FYRzRnSUNBcUlGVjBhV3hwZEhrZ2RHOGdZMmhsWTJzZ2QzSmhjSEJsY2lCbGVHbHpkSE11SUZKbGRIVnlibk1nZEhKMVpTQmhjeUJYY21Gd2NHVnlJR0ZzZDJGNWN5QmxlR2x6ZEhOY2JpQWdJQ292WEc0Z0lHVjRhWE4wY3lBb0tUb2dZbTl2YkdWaGJpQjdYRzRnSUNBZ2FXWWdLSFJvYVhNdWRtMHBJSHRjYmlBZ0lDQWdJSEpsZEhWeWJpQWhJWFJvYVhNdWRtMGdKaVlnSVhSb2FYTXVkbTB1WDJselJHVnpkSEp2ZVdWa1hHNGdJQ0FnZlZ4dUlDQWdJSEpsZEhWeWJpQjBjblZsWEc0Z0lIMWNibHh1SUNCbWFXeDBaWElnS0NrZ2UxeHVJQ0FnSUhSb2NtOTNSWEp5YjNJb0oyWnBiSFJsY2lncElHMTFjM1FnWW1VZ1kyRnNiR1ZrSUc5dUlHRWdWM0poY0hCbGNrRnljbUY1SnlsY2JpQWdmVnh1WEc0Z0lDOHFLbHh1SUNBZ0tpQlZkR2xzYVhSNUlIUnZJR05vWldOcklIZHlZWEJ3WlhJZ2FYTWdkbWx6YVdKc1pTNGdVbVYwZFhKdWN5Qm1ZV3h6WlNCcFppQmhJSEJoY21WdWRDQmxiR1Z0Wlc1MElHaGhjeUJrYVhOd2JHRjVPaUJ1YjI1bElHOXlJSFpwYzJsaWFXeHBkSGs2SUdocFpHUmxiaUJ6ZEhsc1pTNWNiaUFnSUNvdlhHNGdJSFpwYzJsaWJHVWdLQ2s2SUdKdmIyeGxZVzRnZTF4dUlDQWdJSGRoY200b0ozWnBjMmxpYkdVZ2FHRnpJR0psWlc0Z1pHVndjbVZqWVhSbFpDQmhibVFnZDJsc2JDQmlaU0J5WlcxdmRtVmtJR2x1SUhabGNuTnBiMjRnTVN3Z2RYTmxJR2x6Vm1semFXSnNaU0JwYm5OMFpXRmtKeWxjYmx4dUlDQWdJR3hsZENCbGJHVnRaVzUwSUQwZ2RHaHBjeTVsYkdWdFpXNTBYRzVjYmlBZ0lDQnBaaUFvSVdWc1pXMWxiblFwSUh0Y2JpQWdJQ0FnSUhKbGRIVnliaUJtWVd4elpWeHVJQ0FnSUgxY2JseHVJQ0FnSUhkb2FXeGxJQ2hsYkdWdFpXNTBLU0I3WEc0Z0lDQWdJQ0JwWmlBb1pXeGxiV1Z1ZEM1emRIbHNaU0FtSmlBb1pXeGxiV1Z1ZEM1emRIbHNaUzUyYVhOcFltbHNhWFI1SUQwOVBTQW5hR2xrWkdWdUp5QjhmQ0JsYkdWdFpXNTBMbk4wZVd4bExtUnBjM0JzWVhrZ1BUMDlJQ2R1YjI1bEp5a3BJSHRjYmlBZ0lDQWdJQ0FnY21WMGRYSnVJR1poYkhObFhHNGdJQ0FnSUNCOVhHNGdJQ0FnSUNCbGJHVnRaVzUwSUQwZ1pXeGxiV1Z1ZEM1d1lYSmxiblJGYkdWdFpXNTBYRzRnSUNBZ2ZWeHVYRzRnSUNBZ2NtVjBkWEp1SUhSeWRXVmNiaUFnZlZ4dVhHNGdJQzhxS2x4dUlDQWdLaUJEYUdWamEzTWdhV1lnZDNKaGNIQmxjaUJvWVhNZ1lXNGdZWFIwY21saWRYUmxJSGRwZEdnZ2JXRjBZMmhwYm1jZ2RtRnNkV1ZjYmlBZ0lDb3ZYRzRnSUdoaGMwRjBkSEpwWW5WMFpTQW9ZWFIwY21saWRYUmxPaUJ6ZEhKcGJtY3NJSFpoYkhWbE9pQnpkSEpwYm1jcElIdGNiaUFnSUNCM1lYSnVLQ2RvWVhOQmRIUnlhV0oxZEdVb0tTQm9ZWE1nWW1WbGJpQmtaWEJ5WldOaGRHVmtJR0Z1WkNCM2FXeHNJR0psSUhKbGJXOTJaV1FnYVc0Z2RtVnljMmx2YmlBeExqQXVNQzRnVlhObElHRjBkSEpwWW5WMFpYTW9LU0JwYm5OMFpXRms0b0NVYUhSMGNITTZMeTkyZFdVdGRHVnpkQzExZEdsc2N5NTJkV1ZxY3k1dmNtY3ZaVzR2WVhCcEwzZHlZWEJ3WlhJdllYUjBjbWxpZFhSbGN5Y3BYRzVjYmlBZ0lDQnBaaUFvZEhsd1pXOW1JR0YwZEhKcFluVjBaU0FoUFQwZ0ozTjBjbWx1WnljcElIdGNiaUFnSUNBZ0lIUm9jbTkzUlhKeWIzSW9KM2R5WVhCd1pYSXVhR0Z6UVhSMGNtbGlkWFJsS0NrZ2JYVnpkQ0JpWlNCd1lYTnpaV1FnWVhSMGNtbGlkWFJsSUdGeklHRWdjM1J5YVc1bkp5bGNiaUFnSUNCOVhHNWNiaUFnSUNCcFppQW9kSGx3Wlc5bUlIWmhiSFZsSUNFOVBTQW5jM1J5YVc1bkp5a2dlMXh1SUNBZ0lDQWdkR2h5YjNkRmNuSnZjaWduZDNKaGNIQmxjaTVvWVhOQmRIUnlhV0oxZEdVb0tTQnRkWE4wSUdKbElIQmhjM05sWkNCMllXeDFaU0JoY3lCaElITjBjbWx1WnljcFhHNGdJQ0FnZlZ4dVhHNGdJQ0FnY21WMGRYSnVJQ0VoS0hSb2FYTXVaV3hsYldWdWRDQW1KaUIwYUdsekxtVnNaVzFsYm5RdVoyVjBRWFIwY21saWRYUmxLR0YwZEhKcFluVjBaU2tnUFQwOUlIWmhiSFZsS1Z4dUlDQjlYRzVjYmlBZ0x5b3FYRzRnSUNBcUlFRnpjMlZ5ZEhNZ2QzSmhjSEJsY2lCb1lYTWdZU0JqYkdGemN5QnVZVzFsWEc0Z0lDQXFMMXh1SUNCb1lYTkRiR0Z6Y3lBb1kyeGhjM05PWVcxbE9pQnpkSEpwYm1jcElIdGNiaUFnSUNCM1lYSnVLQ2RvWVhORGJHRnpjeWdwSUdoaGN5QmlaV1Z1SUdSbGNISmxZMkYwWldRZ1lXNWtJSGRwYkd3Z1ltVWdjbVZ0YjNabFpDQnBiaUIyWlhKemFXOXVJREV1TUM0d0xpQlZjMlVnWTJ4aGMzTmxjeWdwSUdsdWMzUmxZV1RpZ0pSb2RIUndjem92TDNaMVpTMTBaWE4wTFhWMGFXeHpMbloxWldwekxtOXlaeTlsYmk5aGNHa3ZkM0poY0hCbGNpOWpiR0Z6YzJWekp5bGNiaUFnSUNCc1pYUWdkR0Z5WjJWMFEyeGhjM01nUFNCamJHRnpjMDVoYldWY2JseHVJQ0FnSUdsbUlDaDBlWEJsYjJZZ2RHRnlaMlYwUTJ4aGMzTWdJVDA5SUNkemRISnBibWNuS1NCN1hHNGdJQ0FnSUNCMGFISnZkMFZ5Y205eUtDZDNjbUZ3Y0dWeUxtaGhjME5zWVhOektDa2diWFZ6ZENCaVpTQndZWE56WldRZ1lTQnpkSEpwYm1jbktWeHVJQ0FnSUgxY2JseHVJQ0FnSUM4dklHbG1JQ1J6ZEhsc1pTQnBjeUJoZG1GcGJHRmliR1VnWVc1a0lHaGhjeUJoSUcxaGRHTm9hVzVuSUhSaGNtZGxkQ3dnZFhObElIUm9ZWFFnYVc1emRHVmhaQzVjYmlBZ0lDQnBaaUFvZEdocGN5NTJiU0FtSmlCMGFHbHpMblp0TGlSemRIbHNaU0FtSmlCMGFHbHpMblp0TGlSemRIbHNaVnQwWVhKblpYUkRiR0Z6YzEwcElIdGNiaUFnSUNBZ0lIUmhjbWRsZEVOc1lYTnpJRDBnZEdocGN5NTJiUzRrYzNSNWJHVmJkR0Z5WjJWMFEyeGhjM05kWEc0Z0lDQWdmVnh1WEc0Z0lDQWdZMjl1YzNRZ1kyOXVkR0ZwYm5OQmJHeERiR0Z6YzJWeklEMGdkR0Z5WjJWMFEyeGhjM05jYmlBZ0lDQWdJQzV6Y0d4cGRDZ25JQ2NwWEc0Z0lDQWdJQ0F1WlhabGNua29kR0Z5WjJWMElEMCtJSFJvYVhNdVpXeGxiV1Z1ZEM1amJHRnpjMHhwYzNRdVkyOXVkR0ZwYm5Nb2RHRnlaMlYwS1NsY2JseHVJQ0FnSUhKbGRIVnliaUFoSVNoMGFHbHpMbVZzWlcxbGJuUWdKaVlnWTI5dWRHRnBibk5CYkd4RGJHRnpjMlZ6S1Z4dUlDQjlYRzVjYmlBZ0x5b3FYRzRnSUNBcUlFRnpjMlZ5ZEhNZ2QzSmhjSEJsY2lCb1lYTWdZU0J3Y205d0lHNWhiV1ZjYmlBZ0lDb3ZYRzRnSUdoaGMxQnliM0FnS0hCeWIzQTZJSE4wY21sdVp5d2dkbUZzZFdVNklITjBjbWx1WnlrZ2UxeHVJQ0FnSUhkaGNtNG9KMmhoYzFCeWIzQW9LU0JvWVhNZ1ltVmxiaUJrWlhCeVpXTmhkR1ZrSUdGdVpDQjNhV3hzSUdKbElISmxiVzkyWldRZ2FXNGdkbVZ5YzJsdmJpQXhMakF1TUM0Z1ZYTmxJSEJ5YjNCektDa2dhVzV6ZEdWaFpPS0FsR2gwZEhCek9pOHZkblZsTFhSbGMzUXRkWFJwYkhNdWRuVmxhbk11YjNKbkwyVnVMMkZ3YVM5M2NtRndjR1Z5TDNCeWIzQnpKeWxjYmx4dUlDQWdJR2xtSUNnaGRHaHBjeTVwYzFaMVpVTnZiWEJ2Ym1WdWRDa2dlMXh1SUNBZ0lDQWdkR2h5YjNkRmNuSnZjaWduZDNKaGNIQmxjaTVvWVhOUWNtOXdLQ2tnYlhWemRDQmlaU0JqWVd4c1pXUWdiMjRnWVNCV2RXVWdhVzV6ZEdGdVkyVW5LVnh1SUNBZ0lIMWNiaUFnSUNCcFppQW9kSGx3Wlc5bUlIQnliM0FnSVQwOUlDZHpkSEpwYm1jbktTQjdYRzRnSUNBZ0lDQjBhSEp2ZDBWeWNtOXlLQ2QzY21Gd2NHVnlMbWhoYzFCeWIzQW9LU0J0ZFhOMElHSmxJSEJoYzNObFpDQndjbTl3SUdGeklHRWdjM1J5YVc1bkp5bGNiaUFnSUNCOVhHNWNiaUFnSUNBdkx5QWtjSEp2Y0hNZ2IySnFaV04wSUdSdlpYTWdibTkwSUdWNGFYTjBJR2x1SUZaMVpTQXlMakV1ZUN3Z2MyOGdkWE5sSUNSdmNIUnBiMjV6TG5CeWIzQnpSR0YwWVNCcGJuTjBaV0ZrWEc0Z0lDQWdhV1lnS0hSb2FYTXVkbTBnSmlZZ2RHaHBjeTUyYlM0a2IzQjBhVzl1Y3lBbUppQjBhR2x6TG5adExpUnZjSFJwYjI1ekxuQnliM0J6UkdGMFlTQW1KaUIwYUdsekxuWnRMaVJ2Y0hScGIyNXpMbkJ5YjNCelJHRjBZVnR3Y205d1hTQTlQVDBnZG1Gc2RXVXBJSHRjYmlBZ0lDQWdJSEpsZEhWeWJpQjBjblZsWEc0Z0lDQWdmVnh1WEc0Z0lDQWdjbVYwZFhKdUlDRWhkR2hwY3k1MmJTQW1KaUFoSVhSb2FYTXVkbTB1SkhCeWIzQnpJQ1ltSUhSb2FYTXVkbTB1SkhCeWIzQnpXM0J5YjNCZElEMDlQU0IyWVd4MVpWeHVJQ0I5WEc1Y2JpQWdMeW9xWEc0Z0lDQXFJRU5vWldOcmN5QnBaaUIzY21Gd2NHVnlJR2hoY3lCaElITjBlV3hsSUhkcGRHZ2dkbUZzZFdWY2JpQWdJQ292WEc0Z0lHaGhjMU4wZVd4bElDaHpkSGxzWlRvZ2MzUnlhVzVuTENCMllXeDFaVG9nYzNSeWFXNW5LU0I3WEc0Z0lDQWdkMkZ5YmlnbmFHRnpVM1I1YkdVb0tTQm9ZWE1nWW1WbGJpQmtaWEJ5WldOaGRHVmtJR0Z1WkNCM2FXeHNJR0psSUhKbGJXOTJaV1FnYVc0Z2RtVnljMmx2YmlBeExqQXVNQzRnVlhObElIZHlZWEJ3WlhJdVpXeGxiV1Z1ZEM1emRIbHNaU0JwYm5OMFpXRmtKeWxjYmx4dUlDQWdJR2xtSUNoMGVYQmxiMllnYzNSNWJHVWdJVDA5SUNkemRISnBibWNuS1NCN1hHNGdJQ0FnSUNCMGFISnZkMFZ5Y205eUtDZDNjbUZ3Y0dWeUxtaGhjMU4wZVd4bEtDa2diWFZ6ZENCaVpTQndZWE56WldRZ2MzUjViR1VnWVhNZ1lTQnpkSEpwYm1jbktWeHVJQ0FnSUgxY2JseHVJQ0FnSUdsbUlDaDBlWEJsYjJZZ2RtRnNkV1VnSVQwOUlDZHpkSEpwYm1jbktTQjdYRzRnSUNBZ0lDQjBhSEp2ZDBWeWNtOXlLQ2QzY21Gd2NHVnlMbWhoYzBOc1lYTnpLQ2tnYlhWemRDQmlaU0J3WVhOelpXUWdkbUZzZFdVZ1lYTWdjM1J5YVc1bkp5bGNiaUFnSUNCOVhHNWNiaUFnSUNBdktpQnBjM1JoYm1KMWJDQnBaMjV2Y21VZ2JtVjRkQ0FxTDF4dUlDQWdJR2xtSUNodVlYWnBaMkYwYjNJdWRYTmxja0ZuWlc1MExtbHVZMngxWkdWeklDWW1JQ2h1WVhacFoyRjBiM0l1ZFhObGNrRm5aVzUwTG1sdVkyeDFaR1Z6S0NkdWIyUmxMbXB6SnlrZ2ZId2dibUYyYVdkaGRHOXlMblZ6WlhKQloyVnVkQzVwYm1Oc2RXUmxjeWduYW5Oa2IyMG5LU2twSUh0Y2JpQWdJQ0FnSUdOdmJuTnZiR1V1ZDJGeWJpZ25kM0poY0hCbGNpNW9ZWE5UZEhsc1pTQnBjeUJ1YjNRZ1puVnNiSGtnYzNWd2NHOXlkR1ZrSUhkb1pXNGdjblZ1Ym1sdVp5QnFjMlJ2YlNBdElHOXViSGtnYVc1c2FXNWxJSE4wZVd4bGN5QmhjbVVnYzNWd2NHOXlkR1ZrSnlrZ0x5OGdaWE5zYVc1MExXUnBjMkZpYkdVdGJHbHVaU0J1YnkxamIyNXpiMnhsWEc0Z0lDQWdmVnh1SUNBZ0lHTnZibk4wSUdKdlpIa2dQU0JrYjJOMWJXVnVkQzV4ZFdWeWVWTmxiR1ZqZEc5eUtDZGliMlI1SnlsY2JpQWdJQ0JqYjI1emRDQnRiMk5yUld4bGJXVnVkQ0E5SUdSdlkzVnRaVzUwTG1OeVpXRjBaVVZzWlcxbGJuUW9KMlJwZGljcFhHNWNiaUFnSUNCcFppQW9JU2hpYjJSNUlHbHVjM1JoYm1ObGIyWWdSV3hsYldWdWRDa3BJSHRjYmlBZ0lDQWdJSEpsZEhWeWJpQm1ZV3h6WlZ4dUlDQWdJSDFjYmlBZ0lDQmpiMjV6ZENCdGIyTnJUbTlrWlNBOUlHSnZaSGt1YVc1elpYSjBRbVZtYjNKbEtHMXZZMnRGYkdWdFpXNTBMQ0J1ZFd4c0tWeHVJQ0FnSUM4dklDUkdiRzkzU1dkdWIzSmxJRG9nUm14dmR5QjBhR2x1YTNNZ2MzUjViR1ZiYzNSNWJHVmRJSEpsZEhWeWJuTWdZU0J1ZFcxaVpYSmNiaUFnSUNCdGIyTnJSV3hsYldWdWRDNXpkSGxzWlZ0emRIbHNaVjBnUFNCMllXeDFaVnh1WEc0Z0lDQWdhV1lnS0NGMGFHbHpMbTl3ZEdsdmJuTXVZWFIwWVdOb1pXUlViMFJ2WTNWdFpXNTBJQ1ltSUNoMGFHbHpMblp0SUh4OElIUm9hWE11ZG01dlpHVXBLU0I3WEc0Z0lDQWdJQ0F2THlBa1JteHZkMGxuYm05eVpTQTZJRkJ2YzNOcFlteGxJRzUxYkd3Z2RtRnNkV1VzSUhkcGJHd2dZbVVnY21WdGIzWmxaQ0JwYmlBeExqQXVNRnh1SUNBZ0lDQWdZMjl1YzNRZ2RtMGdQU0IwYUdsekxuWnRJSHg4SUhSb2FYTXVkbTV2WkdVdVkyOXVkR1Y0ZEM0a2NtOXZkRnh1SUNBZ0lDQWdZbTlrZVM1cGJuTmxjblJDWldadmNtVW9kbTB1SkhKdmIzUXVYM1p1YjJSbExtVnNiU3dnYm5Wc2JDbGNiaUFnSUNCOVhHNWNiaUFnSUNCamIyNXpkQ0JsYkZOMGVXeGxJRDBnZDJsdVpHOTNMbWRsZEVOdmJYQjFkR1ZrVTNSNWJHVW9kR2hwY3k1bGJHVnRaVzUwS1Z0emRIbHNaVjFjYmlBZ0lDQmpiMjV6ZENCdGIyTnJUbTlrWlZOMGVXeGxJRDBnZDJsdVpHOTNMbWRsZEVOdmJYQjFkR1ZrVTNSNWJHVW9iVzlqYTA1dlpHVXBXM04wZVd4bFhWeHVJQ0FnSUhKbGRIVnliaUFoSVNobGJGTjBlV3hsSUNZbUlHMXZZMnRPYjJSbFUzUjViR1VnSmlZZ1pXeFRkSGxzWlNBOVBUMGdiVzlqYTA1dlpHVlRkSGxzWlNsY2JpQWdmVnh1WEc0Z0lDOHFLbHh1SUNBZ0tpQkdhVzVrY3lCbWFYSnpkQ0J1YjJSbElHbHVJSFJ5WldVZ2IyWWdkR2hsSUdOMWNuSmxiblFnZDNKaGNIQmxjaUIwYUdGMElHMWhkR05vWlhNZ2RHaGxJSEJ5YjNacFpHVmtJSE5sYkdWamRHOXlMbHh1SUNBZ0tpOWNiaUFnWm1sdVpDQW9jMlZzWldOMGIzSTZJRk5sYkdWamRHOXlLVG9nVjNKaGNIQmxjaUI4SUVWeWNtOXlWM0poY0hCbGNpQjdYRzRnSUNBZ1kyOXVjM1FnYm05a1pYTWdQU0JtYVc1a1FXeHNLSFJvYVhNdWRtMHNJSFJvYVhNdWRtNXZaR1VzSUhSb2FYTXVaV3hsYldWdWRDd2djMlZzWldOMGIzSXBYRzRnSUNBZ2FXWWdLRzV2WkdWekxteGxibWQwYUNBOVBUMGdNQ2tnZTF4dUlDQWdJQ0FnYVdZZ0tITmxiR1ZqZEc5eUxuSmxaaWtnZTF4dUlDQWdJQ0FnSUNCeVpYUjFjbTRnYm1WM0lFVnljbTl5VjNKaGNIQmxjaWhnY21WbVBWd2lKSHR6Wld4bFkzUnZjaTV5WldaOVhDSmdLVnh1SUNBZ0lDQWdmVnh1SUNBZ0lDQWdjbVYwZFhKdUlHNWxkeUJGY25KdmNsZHlZWEJ3WlhJb2RIbHdaVzltSUhObGJHVmpkRzl5SUQwOVBTQW5jM1J5YVc1bkp5QS9JSE5sYkdWamRHOXlJRG9nSjBOdmJYQnZibVZ1ZENjcFhHNGdJQ0FnZlZ4dUlDQWdJSEpsZEhWeWJpQmpjbVZoZEdWWGNtRndjR1Z5S0c1dlpHVnpXekJkTENCMGFHbHpMbTl3ZEdsdmJuTXBYRzRnSUgxY2JseHVJQ0F2S2lwY2JpQWdJQ29nUm1sdVpITWdibTlrWlNCcGJpQjBjbVZsSUc5bUlIUm9aU0JqZFhKeVpXNTBJSGR5WVhCd1pYSWdkR2hoZENCdFlYUmphR1Z6SUhSb1pTQndjbTkyYVdSbFpDQnpaV3hsWTNSdmNpNWNiaUFnSUNvdlhHNGdJR1pwYm1SQmJHd2dLSE5sYkdWamRHOXlPaUJUWld4bFkzUnZjaWs2SUZkeVlYQndaWEpCY25KaGVTQjdYRzRnSUNBZ1oyVjBVMlZzWldOMGIzSlVlWEJsVDNKVWFISnZkeWh6Wld4bFkzUnZjaXdnSjJacGJtUkJiR3duS1Z4dUlDQWdJR052Ym5OMElHNXZaR1Z6SUQwZ1ptbHVaRUZzYkNoMGFHbHpMblp0TENCMGFHbHpMblp1YjJSbExDQjBhR2x6TG1Wc1pXMWxiblFzSUhObGJHVmpkRzl5S1Z4dUlDQWdJR052Ym5OMElIZHlZWEJ3WlhKeklEMGdibTlrWlhNdWJXRndLRzV2WkdVZ1BUNWNiaUFnSUNBZ0lHTnlaV0YwWlZkeVlYQndaWElvYm05a1pTd2dkR2hwY3k1dmNIUnBiMjV6S1Z4dUlDQWdJQ2xjYmlBZ0lDQnlaWFIxY200Z2JtVjNJRmR5WVhCd1pYSkJjbkpoZVNoM2NtRndjR1Z5Y3lsY2JpQWdmVnh1WEc0Z0lDOHFLbHh1SUNBZ0tpQlNaWFIxY201eklFaFVUVXdnYjJZZ1pXeGxiV1Z1ZENCaGN5QmhJSE4wY21sdVoxeHVJQ0FnS2k5Y2JpQWdhSFJ0YkNBb0tUb2djM1J5YVc1bklIdGNiaUFnSUNCeVpYUjFjbTRnZEdocGN5NWxiR1Z0Wlc1MExtOTFkR1Z5U0ZSTlRGeHVJQ0I5WEc1Y2JpQWdMeW9xWEc0Z0lDQXFJRU5vWldOcmN5QnBaaUJ1YjJSbElHMWhkR05vWlhNZ2MyVnNaV04wYjNKY2JpQWdJQ292WEc0Z0lHbHpJQ2h6Wld4bFkzUnZjam9nVTJWc1pXTjBiM0lwT2lCaWIyOXNaV0Z1SUh0Y2JpQWdJQ0JqYjI1emRDQnpaV3hsWTNSdmNsUjVjR1VnUFNCblpYUlRaV3hsWTNSdmNsUjVjR1ZQY2xSb2NtOTNLSE5sYkdWamRHOXlMQ0FuYVhNbktWeHVYRzRnSUNBZ2FXWWdLSE5sYkdWamRHOXlWSGx3WlNBOVBUMGdUa0ZOUlY5VFJVeEZRMVJQVWlrZ2UxeHVJQ0FnSUNBZ2FXWWdLQ0YwYUdsekxuWnRLU0I3WEc0Z0lDQWdJQ0FnSUhKbGRIVnliaUJtWVd4elpWeHVJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ2NtVjBkWEp1SUhadFEzUnZjazFoZEdOb1pYTk9ZVzFsS0hSb2FYTXVkbTBzSUhObGJHVmpkRzl5TG01aGJXVXBYRzRnSUNBZ2ZWeHVYRzRnSUNBZ2FXWWdLSE5sYkdWamRHOXlWSGx3WlNBOVBUMGdRMDlOVUU5T1JVNVVYMU5GVEVWRFZFOVNLU0I3WEc0Z0lDQWdJQ0JwWmlBb0lYUm9hWE11ZG0wcElIdGNiaUFnSUNBZ0lDQWdjbVYwZFhKdUlHWmhiSE5sWEc0Z0lDQWdJQ0I5WEc0Z0lDQWdJQ0JwWmlBb2MyVnNaV04wYjNJdVpuVnVZM1JwYjI1aGJDa2dlMXh1SUNBZ0lDQWdJQ0J5WlhSMWNtNGdkbTFHZFc1amRHbHZibUZzUTNSdmNrMWhkR05vWlhOVFpXeGxZM1J2Y2loMGFHbHpMblp0TGw5MmJtOWtaU3dnYzJWc1pXTjBiM0l1WDBOMGIzSXBYRzRnSUNBZ0lDQjlYRzRnSUNBZ0lDQnlaWFIxY200Z2RtMURkRzl5VFdGMFkyaGxjMU5sYkdWamRHOXlLSFJvYVhNdWRtMHNJSE5sYkdWamRHOXlLVnh1SUNBZ0lIMWNibHh1SUNBZ0lHbG1JQ2h6Wld4bFkzUnZjbFI1Y0dVZ1BUMDlJRkpGUmw5VFJVeEZRMVJQVWlrZ2UxeHVJQ0FnSUNBZ2RHaHliM2RGY25KdmNpZ25KSEpsWmlCelpXeGxZM1J2Y25NZ1kyRnVJRzV2ZENCaVpTQjFjMlZrSUhkcGRHZ2dkM0poY0hCbGNpNXBjeWdwSnlsY2JpQWdJQ0I5WEc1Y2JpQWdJQ0JwWmlBb2RIbHdaVzltSUhObGJHVmpkRzl5SUQwOVBTQW5iMkpxWldOMEp5a2dlMXh1SUNBZ0lDQWdjbVYwZFhKdUlHWmhiSE5sWEc0Z0lDQWdmVnh1WEc0Z0lDQWdjbVYwZFhKdUlDRWhLSFJvYVhNdVpXeGxiV1Z1ZENBbUpseHVJQ0FnSUhSb2FYTXVaV3hsYldWdWRDNW5aWFJCZEhSeWFXSjFkR1VnSmlaY2JpQWdJQ0IwYUdsekxtVnNaVzFsYm5RdWJXRjBZMmhsY3loelpXeGxZM1J2Y2lrcFhHNGdJSDFjYmx4dUlDQXZLaXBjYmlBZ0lDb2dRMmhsWTJ0eklHbG1JRzV2WkdVZ2FYTWdaVzF3ZEhsY2JpQWdJQ292WEc0Z0lHbHpSVzF3ZEhrZ0tDazZJR0p2YjJ4bFlXNGdlMXh1SUNBZ0lHbG1JQ2doZEdocGN5NTJibTlrWlNrZ2UxeHVJQ0FnSUNBZ2NtVjBkWEp1SUhSb2FYTXVaV3hsYldWdWRDNXBibTVsY2toVVRVd2dQVDA5SUNjblhHNGdJQ0FnZlZ4dUlDQWdJR2xtSUNoMGFHbHpMblp1YjJSbExtTm9hV3hrY21WdUtTQjdYRzRnSUNBZ0lDQnlaWFIxY200Z2RHaHBjeTUyYm05a1pTNWphR2xzWkhKbGJpNWxkbVZ5ZVNoMmJtOWtaU0E5UGlCMmJtOWtaUzVwYzBOdmJXMWxiblFwWEc0Z0lDQWdmVnh1SUNBZ0lISmxkSFZ5YmlCMGFHbHpMblp1YjJSbExtTm9hV3hrY21WdUlEMDlQU0IxYm1SbFptbHVaV1FnZkh3Z2RHaHBjeTUyYm05a1pTNWphR2xzWkhKbGJpNXNaVzVuZEdnZ1BUMDlJREJjYmlBZ2ZWeHVYRzRnSUM4cUtseHVJQ0FnS2lCRGFHVmphM01nYVdZZ2JtOWtaU0JwY3lCMmFYTnBZbXhsWEc0Z0lDQXFMMXh1SUNCcGMxWnBjMmxpYkdVZ0tDazZJR0p2YjJ4bFlXNGdlMXh1SUNBZ0lHeGxkQ0JsYkdWdFpXNTBJRDBnZEdocGN5NWxiR1Z0Wlc1MFhHNWNiaUFnSUNCcFppQW9JV1ZzWlcxbGJuUXBJSHRjYmlBZ0lDQWdJSEpsZEhWeWJpQm1ZV3h6WlZ4dUlDQWdJSDFjYmx4dUlDQWdJSGRvYVd4bElDaGxiR1Z0Wlc1MEtTQjdYRzRnSUNBZ0lDQnBaaUFvWld4bGJXVnVkQzV6ZEhsc1pTQW1KaUFvWld4bGJXVnVkQzV6ZEhsc1pTNTJhWE5wWW1sc2FYUjVJRDA5UFNBbmFHbGtaR1Z1SnlCOGZDQmxiR1Z0Wlc1MExuTjBlV3hsTG1ScGMzQnNZWGtnUFQwOUlDZHViMjVsSnlrcElIdGNiaUFnSUNBZ0lDQWdjbVYwZFhKdUlHWmhiSE5sWEc0Z0lDQWdJQ0I5WEc0Z0lDQWdJQ0JsYkdWdFpXNTBJRDBnWld4bGJXVnVkQzV3WVhKbGJuUkZiR1Z0Wlc1MFhHNGdJQ0FnZlZ4dVhHNGdJQ0FnY21WMGRYSnVJSFJ5ZFdWY2JpQWdmVnh1WEc0Z0lDOHFLbHh1SUNBZ0tpQkRhR1ZqYTNNZ2FXWWdkM0poY0hCbGNpQnBjeUJoSUhaMVpTQnBibk4wWVc1alpWeHVJQ0FnS2k5Y2JpQWdhWE5XZFdWSmJuTjBZVzVqWlNBb0tUb2dZbTl2YkdWaGJpQjdYRzRnSUNBZ2NtVjBkWEp1SUNFaGRHaHBjeTVwYzFaMVpVTnZiWEJ2Ym1WdWRGeHVJQ0I5WEc1Y2JpQWdMeW9xWEc0Z0lDQXFJRkpsZEhWeWJuTWdibUZ0WlNCdlppQmpiMjF3YjI1bGJuUXNJRzl5SUhSaFp5QnVZVzFsSUdsbUlHNXZaR1VnYVhNZ2JtOTBJR0VnVm5WbElHTnZiWEJ2Ym1WdWRGeHVJQ0FnS2k5Y2JpQWdibUZ0WlNBb0tUb2djM1J5YVc1bklIdGNiaUFnSUNCcFppQW9kR2hwY3k1MmJTa2dlMXh1SUNBZ0lDQWdjbVYwZFhKdUlIUm9hWE11ZG0wdUpHOXdkR2x2Ym5NdWJtRnRaVnh1SUNBZ0lIMWNibHh1SUNBZ0lHbG1JQ2doZEdocGN5NTJibTlrWlNrZ2UxeHVJQ0FnSUNBZ2NtVjBkWEp1SUhSb2FYTXVaV3hsYldWdWRDNTBZV2RPWVcxbFhHNGdJQ0FnZlZ4dVhHNGdJQ0FnY21WMGRYSnVJSFJvYVhNdWRtNXZaR1V1ZEdGblhHNGdJSDFjYmx4dUlDQXZLaXBjYmlBZ0lDb2dVbVYwZFhKdWN5QmhiaUJQWW1wbFkzUWdZMjl1ZEdGcGJtbHVaeUIwYUdVZ2NISnZjQ0J1WVcxbEwzWmhiSFZsSUhCaGFYSnpJRzl1SUhSb1pTQmxiR1Z0Wlc1MFhHNGdJQ0FxTDF4dUlDQndjbTl3Y3lBb0tUb2dleUJiYm1GdFpUb2djM1J5YVc1blhUb2dZVzU1SUgwZ2UxeHVJQ0FnSUdsbUlDaDBhR2x6TG1selJuVnVZM1JwYjI1aGJFTnZiWEJ2Ym1WdWRDa2dlMXh1SUNBZ0lDQWdkR2h5YjNkRmNuSnZjaWduZDNKaGNIQmxjaTV3Y205d2N5Z3BJR05oYm01dmRDQmlaU0JqWVd4c1pXUWdiMjRnWVNCdGIzVnVkR1ZrSUdaMWJtTjBhVzl1WVd3Z1kyOXRjRzl1Wlc1MExpY3BYRzRnSUNBZ2ZWeHVJQ0FnSUdsbUlDZ2hkR2hwY3k1MmJTa2dlMXh1SUNBZ0lDQWdkR2h5YjNkRmNuSnZjaWduZDNKaGNIQmxjaTV3Y205d2N5Z3BJRzExYzNRZ1ltVWdZMkZzYkdWa0lHOXVJR0VnVm5WbElHbHVjM1JoYm1ObEp5bGNiaUFnSUNCOVhHNGdJQ0FnTHk4Z0pIQnliM0J6SUc5aWFtVmpkQ0JrYjJWeklHNXZkQ0JsZUdsemRDQnBiaUJXZFdVZ01pNHhMbmdzSUhOdklIVnpaU0FrYjNCMGFXOXVjeTV3Y205d2MwUmhkR0VnYVc1emRHVmhaRnh1SUNBZ0lHeGxkQ0JmY0hKdmNITmNiaUFnSUNCcFppQW9kR2hwY3k1MmJTQW1KaUIwYUdsekxuWnRMaVJ2Y0hScGIyNXpJQ1ltSUhSb2FYTXVkbTB1Skc5d2RHbHZibk11Y0hKdmNITkVZWFJoS1NCN1hHNGdJQ0FnSUNCZmNISnZjSE1nUFNCMGFHbHpMblp0TGlSdmNIUnBiMjV6TG5CeWIzQnpSR0YwWVZ4dUlDQWdJSDBnWld4elpTQjdYRzRnSUNBZ0lDQXZMeUFrUm14dmQwbG5ibTl5WlZ4dUlDQWdJQ0FnWDNCeWIzQnpJRDBnZEdocGN5NTJiUzRrY0hKdmNITmNiaUFnSUNCOVhHNGdJQ0FnY21WMGRYSnVJRjl3Y205d2N5QjhmQ0I3ZlNBdkx5QlNaWFIxY200Z1lXNGdaVzF3ZEhrZ2IySnFaV04wSUdsbUlHNXZJSEJ5YjNCeklHVjRhWE4wWEc0Z0lIMWNibHh1SUNBdktpcGNiaUFnSUNvZ1UyVjBjeUIyYlNCa1lYUmhYRzRnSUNBcUwxeHVJQ0J6WlhSRVlYUmhJQ2hrWVhSaE9pQlBZbXBsWTNRcElIdGNiaUFnSUNCcFppQW9kR2hwY3k1cGMwWjFibU4wYVc5dVlXeERiMjF3YjI1bGJuUXBJSHRjYmlBZ0lDQWdJSFJvY205M1JYSnliM0lvSjNkeVlYQndaWEl1YzJWMFJHRjBZU2dwSUdOaGJtOTBJR0psSUdOaGJHeGxaQ0J2YmlCaElHWjFibU4wYVc5dVlXd2dZMjl0Y0c5dVpXNTBKeWxjYmlBZ0lDQjlYRzVjYmlBZ0lDQnBaaUFvSVhSb2FYTXVkbTBwSUh0Y2JpQWdJQ0FnSUhSb2NtOTNSWEp5YjNJb0ozZHlZWEJ3WlhJdWMyVjBSR0YwWVNncElHTmhiaUJ2Ym14NUlHSmxJR05oYkd4bFpDQnZiaUJoSUZaMVpTQnBibk4wWVc1alpTY3BYRzRnSUNBZ2ZWeHVYRzRnSUNBZ1QySnFaV04wTG10bGVYTW9aR0YwWVNrdVptOXlSV0ZqYUNnb2EyVjVLU0E5UGlCN1hHNGdJQ0FnSUNBdkx5QWtSbXh2ZDBsbmJtOXlaU0E2SUZCeWIySnNaVzBnZDJsMGFDQndiM056YVdKc2VTQnVkV3hzSUhSb2FYTXVkbTFjYmlBZ0lDQWdJSFJvYVhNdWRtMHVKSE5sZENoMGFHbHpMblp0TENCYmEyVjVYU3dnWkdGMFlWdHJaWGxkS1Z4dUlDQWdJSDBwWEc0Z0lIMWNibHh1SUNBdktpcGNiaUFnSUNvZ1UyVjBjeUIyYlNCamIyMXdkWFJsWkZ4dUlDQWdLaTljYmlBZ2MyVjBRMjl0Y0hWMFpXUWdLR052YlhCMWRHVmtPaUJQWW1wbFkzUXBJSHRjYmlBZ0lDQnBaaUFvSVhSb2FYTXVhWE5XZFdWRGIyMXdiMjVsYm5RcElIdGNiaUFnSUNBZ0lIUm9jbTkzUlhKeWIzSW9KM2R5WVhCd1pYSXVjMlYwUTI5dGNIVjBaV1FvS1NCallXNGdiMjVzZVNCaVpTQmpZV3hzWldRZ2IyNGdZU0JXZFdVZ2FXNXpkR0Z1WTJVbktWeHVJQ0FnSUgxY2JseHVJQ0FnSUhkaGNtNG9KM05sZEVOdmJYQjFkR1ZrS0NrZ2FHRnpJR0psWlc0Z1pHVndjbVZqWVhSbFpDQmhibVFnZDJsc2JDQmlaU0J5WlcxdmRtVmtJR2x1SUhabGNuTnBiMjRnTVM0d0xqQXVJRmx2ZFNCallXNGdiM1psY25keWFYUmxJR052YlhCMWRHVmtJSEJ5YjNCbGNuUnBaWE1nWW5rZ2NHRnpjMmx1WnlCaElHTnZiWEIxZEdWa0lHOWlhbVZqZENCcGJpQjBhR1VnYlc5MWJuUnBibWNnYjNCMGFXOXVjeWNwWEc1Y2JpQWdJQ0JQWW1wbFkzUXVhMlY1Y3loamIyMXdkWFJsWkNrdVptOXlSV0ZqYUNnb2EyVjVLU0E5UGlCN1hHNGdJQ0FnSUNCcFppQW9kR2hwY3k1MlpYSnphVzl1SUQ0Z01pNHhLU0I3WEc0Z0lDQWdJQ0FnSUM4dklDUkdiRzkzU1dkdWIzSmxJRG9nVUhKdllteGxiU0IzYVhSb0lIQnZjM05wWW14NUlHNTFiR3dnZEdocGN5NTJiVnh1SUNBZ0lDQWdJQ0JwWmlBb0lYUm9hWE11ZG0wdVgyTnZiWEIxZEdWa1YyRjBZMmhsY25OYmEyVjVYU2tnZTF4dUlDQWdJQ0FnSUNBZ0lIUm9jbTkzUlhKeWIzSW9ZSGR5WVhCd1pYSXVjMlYwUTI5dGNIVjBaV1FvS1NCM1lYTWdjR0Z6YzJWa0lHRWdkbUZzZFdVZ2RHaGhkQ0JrYjJWeklHNXZkQ0JsZUdsemRDQmhjeUJoSUdOdmJYQjFkR1ZrSUhCeWIzQmxjblI1SUc5dUlIUm9aU0JXZFdVZ2FXNXpkR0Z1WTJVdUlGQnliM0JsY25SNUlDUjdhMlY1ZlNCa2IyVnpJRzV2ZENCbGVHbHpkQ0J2YmlCMGFHVWdWblZsSUdsdWMzUmhibU5sWUNsY2JpQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQXZMeUFrUm14dmQwbG5ibTl5WlNBNklGQnliMkpzWlcwZ2QybDBhQ0J3YjNOemFXSnNlU0J1ZFd4c0lIUm9hWE11ZG0xY2JpQWdJQ0FnSUNBZ2RHaHBjeTUyYlM1ZlkyOXRjSFYwWldSWFlYUmphR1Z5YzF0clpYbGRMblpoYkhWbElEMGdZMjl0Y0hWMFpXUmJhMlY1WFZ4dUlDQWdJQ0FnSUNBdkx5QWtSbXh2ZDBsbmJtOXlaU0E2SUZCeWIySnNaVzBnZDJsMGFDQndiM056YVdKc2VTQnVkV3hzSUhSb2FYTXVkbTFjYmlBZ0lDQWdJQ0FnZEdocGN5NTJiUzVmWTI5dGNIVjBaV1JYWVhSamFHVnljMXRyWlhsZExtZGxkSFJsY2lBOUlDZ3BJRDArSUdOdmJYQjFkR1ZrVzJ0bGVWMWNiaUFnSUNBZ0lIMGdaV3h6WlNCN1hHNGdJQ0FnSUNBZ0lHeGxkQ0JwYzFOMGIzSmxJRDBnWm1Gc2MyVmNiaUFnSUNBZ0lDQWdMeThnSkVac2IzZEpaMjV2Y21VZ09pQlFjbTlpYkdWdElIZHBkR2dnY0c5emMybGliSGtnYm5Wc2JDQjBhR2x6TG5adFhHNGdJQ0FnSUNBZ0lIUm9hWE11ZG0wdVgzZGhkR05vWlhKekxtWnZja1ZoWTJnb2QyRjBZMmhsY2lBOVBpQjdYRzRnSUNBZ0lDQWdJQ0FnYVdZZ0tIZGhkR05vWlhJdVoyVjBkR1Z5TG5aMVpYZ2dKaVlnYTJWNUlHbHVJSGRoZEdOb1pYSXVkbTB1Skc5d2RHbHZibk11YzNSdmNtVXVaMlYwZEdWeWN5a2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2QyRjBZMmhsY2k1MmJTNGtiM0IwYVc5dWN5NXpkRzl5WlM1blpYUjBaWEp6SUQwZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBdUxpNTNZWFJqYUdWeUxuWnRMaVJ2Y0hScGIyNXpMbk4wYjNKbExtZGxkSFJsY25OY2JpQWdJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnSUNBZ0lFOWlhbVZqZEM1a1pXWnBibVZRY205d1pYSjBlU2gzWVhSamFHVnlMblp0TGlSdmNIUnBiMjV6TG5OMGIzSmxMbWRsZEhSbGNuTXNJR3RsZVN3Z2V5Qm5aWFE2SUdaMWJtTjBhVzl1SUNncElIc2djbVYwZFhKdUlHTnZiWEIxZEdWa1cydGxlVjBnZlNCOUtWeHVJQ0FnSUNBZ0lDQWdJQ0FnYVhOVGRHOXlaU0E5SUhSeWRXVmNiaUFnSUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUgwcFhHNWNiaUFnSUNBZ0lDQWdMeThnSkVac2IzZEpaMjV2Y21VZ09pQlFjbTlpYkdWdElIZHBkR2dnY0c5emMybGliSGtnYm5Wc2JDQjBhR2x6TG5adFhHNGdJQ0FnSUNBZ0lHbG1JQ2doYVhOVGRHOXlaU0FtSmlBaGRHaHBjeTUyYlM1ZmQyRjBZMmhsY25NdWMyOXRaU2gzSUQwK0lIY3VaMlYwZEdWeUxtNWhiV1VnUFQwOUlHdGxlU2twSUh0Y2JpQWdJQ0FnSUNBZ0lDQjBhSEp2ZDBWeWNtOXlLR0IzY21Gd2NHVnlMbk5sZEVOdmJYQjFkR1ZrS0NrZ2QyRnpJSEJoYzNObFpDQmhJSFpoYkhWbElIUm9ZWFFnWkc5bGN5QnViM1FnWlhocGMzUWdZWE1nWVNCamIyMXdkWFJsWkNCd2NtOXdaWEowZVNCdmJpQjBhR1VnVm5WbElHbHVjM1JoYm1ObExpQlFjbTl3WlhKMGVTQWtlMnRsZVgwZ1pHOWxjeUJ1YjNRZ1pYaHBjM1FnYjI0Z2RHaGxJRloxWlNCcGJuTjBZVzVqWldBcFhHNGdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdMeThnSkVac2IzZEpaMjV2Y21VZ09pQlFjbTlpYkdWdElIZHBkR2dnY0c5emMybGliSGtnYm5Wc2JDQjBhR2x6TG5adFhHNGdJQ0FnSUNBZ0lIUm9hWE11ZG0wdVgzZGhkR05vWlhKekxtWnZja1ZoWTJnb0tIZGhkR05vWlhJcElEMCtJSHRjYmlBZ0lDQWdJQ0FnSUNCcFppQW9kMkYwWTJobGNpNW5aWFIwWlhJdWJtRnRaU0E5UFQwZ2EyVjVLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjNZWFJqYUdWeUxuWmhiSFZsSUQwZ1kyOXRjSFYwWldSYmEyVjVYVnh1SUNBZ0lDQWdJQ0FnSUNBZ2QyRjBZMmhsY2k1blpYUjBaWElnUFNBb0tTQTlQaUJqYjIxd2RYUmxaRnRyWlhsZFhHNGdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0I5S1Z4dUlDQWdJQ0FnZlZ4dUlDQWdJSDBwWEc0Z0lDQWdMeThnSkVac2IzZEpaMjV2Y21VZ09pQlFjbTlpYkdWdElIZHBkR2dnY0c5emMybGliSGtnYm5Wc2JDQjBhR2x6TG5adFhHNGdJQ0FnZEdocGN5NTJiUzVmZDJGMFkyaGxjbk11Wm05eVJXRmphQ2dvZDJGMFkyaGxjaWtnUFQ0Z2UxeHVJQ0FnSUNBZ2QyRjBZMmhsY2k1eWRXNG9LVnh1SUNBZ0lIMHBYRzRnSUgxY2JseHVJQ0F2S2lwY2JpQWdJQ29nVTJWMGN5QjJiU0J0WlhSb2IyUnpYRzRnSUNBcUwxeHVJQ0J6WlhSTlpYUm9iMlJ6SUNodFpYUm9iMlJ6T2lCUFltcGxZM1FwSUh0Y2JpQWdJQ0JwWmlBb0lYUm9hWE11YVhOV2RXVkRiMjF3YjI1bGJuUXBJSHRjYmlBZ0lDQWdJSFJvY205M1JYSnliM0lvSjNkeVlYQndaWEl1YzJWMFRXVjBhRzlrY3lncElHTmhiaUJ2Ym14NUlHSmxJR05oYkd4bFpDQnZiaUJoSUZaMVpTQnBibk4wWVc1alpTY3BYRzRnSUNBZ2ZWeHVJQ0FnSUU5aWFtVmpkQzVyWlhsektHMWxkR2h2WkhNcExtWnZja1ZoWTJnb0tHdGxlU2tnUFQ0Z2UxeHVJQ0FnSUNBZ0x5OGdKRVpzYjNkSloyNXZjbVVnT2lCUWNtOWliR1Z0SUhkcGRHZ2djRzl6YzJsaWJIa2diblZzYkNCMGFHbHpMblp0WEc0Z0lDQWdJQ0IwYUdsekxuWnRXMnRsZVYwZ1BTQnRaWFJvYjJSelcydGxlVjFjYmlBZ0lDQWdJQzh2SUNSR2JHOTNTV2R1YjNKbElEb2dVSEp2WW14bGJTQjNhWFJvSUhCdmMzTnBZbXg1SUc1MWJHd2dkR2hwY3k1MmJWeHVJQ0FnSUNBZ2RHaHBjeTUyYlM0a2IzQjBhVzl1Y3k1dFpYUm9iMlJ6VzJ0bGVWMGdQU0J0WlhSb2IyUnpXMnRsZVYxY2JpQWdJQ0I5S1Z4dUlDQjlYRzVjYmlBZ0x5b3FYRzRnSUNBcUlGTmxkSE1nZG0wZ2NISnZjSE5jYmlBZ0lDb3ZYRzRnSUhObGRGQnliM0J6SUNoa1lYUmhPaUJQWW1wbFkzUXBJSHRjYmlBZ0lDQnBaaUFvZEdocGN5NXBjMFoxYm1OMGFXOXVZV3hEYjIxd2IyNWxiblFwSUh0Y2JpQWdJQ0FnSUhSb2NtOTNSWEp5YjNJb0ozZHlZWEJ3WlhJdWMyVjBVSEp2Y0hNb0tTQmpZVzV2ZENCaVpTQmpZV3hzWldRZ2IyNGdZU0JtZFc1amRHbHZibUZzSUdOdmJYQnZibVZ1ZENjcFhHNGdJQ0FnZlZ4dUlDQWdJR2xtSUNnaGRHaHBjeTVwYzFaMVpVTnZiWEJ2Ym1WdWRDQjhmQ0FoZEdocGN5NTJiU2tnZTF4dUlDQWdJQ0FnZEdoeWIzZEZjbkp2Y2lnbmQzSmhjSEJsY2k1elpYUlFjbTl3Y3lncElHTmhiaUJ2Ym14NUlHSmxJR05oYkd4bFpDQnZiaUJoSUZaMVpTQnBibk4wWVc1alpTY3BYRzRnSUNBZ2ZWeHVJQ0FnSUdsbUlDaDBhR2x6TG5adElDWW1JSFJvYVhNdWRtMHVKRzl3ZEdsdmJuTWdKaVlnSVhSb2FYTXVkbTB1Skc5d2RHbHZibk11Y0hKdmNITkVZWFJoS1NCN1hHNGdJQ0FnSUNCMGFHbHpMblp0TGlSdmNIUnBiMjV6TG5CeWIzQnpSR0YwWVNBOUlIdDlYRzRnSUNBZ2ZWeHVJQ0FnSUU5aWFtVmpkQzVyWlhsektHUmhkR0VwTG1admNrVmhZMmdvS0d0bGVTa2dQVDRnZTF4dUlDQWdJQ0FnTHk4Z1NXZHViM0psSUhCeWIzQmxjblJwWlhNZ2RHaGhkQ0IzWlhKbElHNXZkQ0J6Y0dWamFXWnBaV1FnYVc0Z2RHaGxJR052YlhCdmJtVnVkQ0J2Y0hScGIyNXpYRzRnSUNBZ0lDQXZMeUFrUm14dmQwbG5ibTl5WlNBNklGQnliMkpzWlcwZ2QybDBhQ0J3YjNOemFXSnNlU0J1ZFd4c0lIUm9hWE11ZG0xY2JpQWdJQ0FnSUdsbUlDZ2hkR2hwY3k1MmJTNGtiM0IwYVc5dWN5NWZjSEp2Y0V0bGVYTWdmSHdnSVhSb2FYTXVkbTB1Skc5d2RHbHZibk11WDNCeWIzQkxaWGx6TG1sdVkyeDFaR1Z6S0d0bGVTa3BJSHRjYmlBZ0lDQWdJQ0FnZEdoeWIzZEZjbkp2Y2loZ2QzSmhjSEJsY2k1elpYUlFjbTl3Y3lncElHTmhiR3hsWkNCM2FYUm9JQ1I3YTJWNWZTQndjbTl3WlhKMGVTQjNhR2xqYUNCcGN5QnViM1FnWkdWbWFXNWxaQ0J2YmlCamIyMXdiMjVsYm5SZ0tWeHVJQ0FnSUNBZ2ZWeHVYRzRnSUNBZ0lDQXZMeUFrUm14dmQwbG5ibTl5WlNBNklGQnliMkpzWlcwZ2QybDBhQ0J3YjNOemFXSnNlU0J1ZFd4c0lIUm9hWE11ZG0xY2JpQWdJQ0FnSUdsbUlDaDBhR2x6TG5adExsOXdjbTl3Y3lrZ2UxeHVJQ0FnSUNBZ0lDQjBhR2x6TG5adExsOXdjbTl3YzF0clpYbGRJRDBnWkdGMFlWdHJaWGxkWEc0Z0lDQWdJQ0FnSUM4dklDUkdiRzkzU1dkdWIzSmxJRG9nVUhKdllteGxiU0IzYVhSb0lIQnZjM05wWW14NUlHNTFiR3dnZEdocGN5NTJiUzRrY0hKdmNITmNiaUFnSUNBZ0lDQWdkR2hwY3k1MmJTNGtjSEp2Y0hOYmEyVjVYU0E5SUdSaGRHRmJhMlY1WFZ4dUlDQWdJQ0FnSUNBdkx5QWtSbXh2ZDBsbmJtOXlaU0E2SUZCeWIySnNaVzBnZDJsMGFDQndiM056YVdKc2VTQnVkV3hzSUhSb2FYTXVkbTB1Skc5d2RHbHZibk5jYmlBZ0lDQWdJQ0FnZEdocGN5NTJiUzRrYjNCMGFXOXVjeTV3Y205d2MwUmhkR0ZiYTJWNVhTQTlJR1JoZEdGYmEyVjVYVnh1SUNBZ0lDQWdmU0JsYkhObElIdGNiaUFnSUNBZ0lDQWdMeThnSkVac2IzZEpaMjV2Y21VZ09pQlFjbTlpYkdWdElIZHBkR2dnY0c5emMybGliSGtnYm5Wc2JDQjBhR2x6TG5adFhHNGdJQ0FnSUNBZ0lIUm9hWE11ZG0xYmEyVjVYU0E5SUdSaGRHRmJhMlY1WFZ4dUlDQWdJQ0FnSUNBdkx5QWtSbXh2ZDBsbmJtOXlaU0E2SUZCeWIySnNaVzBnZDJsMGFDQndiM056YVdKc2VTQnVkV3hzSUhSb2FYTXVkbTB1Skc5d2RHbHZibk5jYmlBZ0lDQWdJQ0FnZEdocGN5NTJiUzRrYjNCMGFXOXVjeTV3Y205d2MwUmhkR0ZiYTJWNVhTQTlJR1JoZEdGYmEyVjVYVnh1SUNBZ0lDQWdmVnh1SUNBZ0lIMHBYRzVjYmlBZ0lDQXZMeUFrUm14dmQwbG5ibTl5WlNBNklGQnliMkpzWlcwZ2QybDBhQ0J3YjNOemFXSnNlU0J1ZFd4c0lIUm9hWE11ZG0xY2JpQWdJQ0IwYUdsekxuWnViMlJsSUQwZ2RHaHBjeTUyYlM1ZmRtNXZaR1ZjYmlBZ2ZWeHVYRzRnSUM4cUtseHVJQ0FnS2lCU1pYUjFjbTRnZEdWNGRDQnZaaUIzY21Gd2NHVnlJR1ZzWlcxbGJuUmNiaUFnSUNvdlhHNGdJSFJsZUhRZ0tDazZJSE4wY21sdVp5QjdYRzRnSUNBZ2FXWWdLQ0YwYUdsekxtVnNaVzFsYm5RcElIdGNiaUFnSUNBZ0lIUm9jbTkzUlhKeWIzSW9KMk5oYm01dmRDQmpZV3hzSUhkeVlYQndaWEl1ZEdWNGRDZ3BJRzl1SUdFZ2QzSmhjSEJsY2lCM2FYUm9iM1YwSUdGdUlHVnNaVzFsYm5RbktWeHVJQ0FnSUgxY2JseHVJQ0FnSUhKbGRIVnliaUIwYUdsekxtVnNaVzFsYm5RdWRHVjRkRU52Ym5SbGJuUXVkSEpwYlNncFhHNGdJSDFjYmx4dUlDQXZLaXBjYmlBZ0lDb2dRMkZzYkhNZ1pHVnpkSEp2ZVNCdmJpQjJiVnh1SUNBZ0tpOWNiaUFnWkdWemRISnZlU0FvS1NCN1hHNGdJQ0FnYVdZZ0tDRjBhR2x6TG1selZuVmxRMjl0Y0c5dVpXNTBLU0I3WEc0Z0lDQWdJQ0IwYUhKdmQwVnljbTl5S0NkM2NtRndjR1Z5TG1SbGMzUnliM2tvS1NCallXNGdiMjVzZVNCaVpTQmpZV3hzWldRZ2IyNGdZU0JXZFdVZ2FXNXpkR0Z1WTJVbktWeHVJQ0FnSUgxY2JseHVJQ0FnSUdsbUlDaDBhR2x6TG1Wc1pXMWxiblF1Y0dGeVpXNTBUbTlrWlNrZ2UxeHVJQ0FnSUNBZ2RHaHBjeTVsYkdWdFpXNTBMbkJoY21WdWRFNXZaR1V1Y21WdGIzWmxRMmhwYkdRb2RHaHBjeTVsYkdWdFpXNTBLVnh1SUNBZ0lIMWNiaUFnSUNBdkx5QWtSbXh2ZDBsbmJtOXlaVnh1SUNBZ0lIUm9hWE11ZG0wdUpHUmxjM1J5YjNrb0tWeHVJQ0I5WEc1Y2JpQWdMeW9xWEc0Z0lDQXFJRVJwYzNCaGRHTm9aWE1nWVNCRVQwMGdaWFpsYm5RZ2IyNGdkM0poY0hCbGNseHVJQ0FnS2k5Y2JpQWdkSEpwWjJkbGNpQW9kSGx3WlRvZ2MzUnlhVzVuTENCdmNIUnBiMjV6T2lCUFltcGxZM1FnUFNCN2ZTa2dlMXh1SUNBZ0lHbG1JQ2gwZVhCbGIyWWdkSGx3WlNBaFBUMGdKM04wY21sdVp5Y3BJSHRjYmlBZ0lDQWdJSFJvY205M1JYSnliM0lvSjNkeVlYQndaWEl1ZEhKcFoyZGxjaWdwSUcxMWMzUWdZbVVnY0dGemMyVmtJR0VnYzNSeWFXNW5KeWxjYmlBZ0lDQjlYRzVjYmlBZ0lDQnBaaUFvSVhSb2FYTXVaV3hsYldWdWRDa2dlMXh1SUNBZ0lDQWdkR2h5YjNkRmNuSnZjaWduWTJGdWJtOTBJR05oYkd3Z2QzSmhjSEJsY2k1MGNtbG5aMlZ5S0NrZ2IyNGdZU0IzY21Gd2NHVnlJSGRwZEdodmRYUWdZVzRnWld4bGJXVnVkQ2NwWEc0Z0lDQWdmVnh1WEc0Z0lDQWdhV1lnS0c5d2RHbHZibk11ZEdGeVoyVjBLU0I3WEc0Z0lDQWdJQ0IwYUhKdmQwVnljbTl5S0NkNWIzVWdZMkZ1Ym05MElITmxkQ0IwYUdVZ2RHRnlaMlYwSUhaaGJIVmxJRzltSUdGdUlHVjJaVzUwTGlCVFpXVWdkR2hsSUc1dmRHVnpJSE5sWTNScGIyNGdiMllnZEdobElHUnZZM01nWm05eUlHMXZjbVVnWkdWMFlXbHNjK0tBbEdoMGRIQnpPaTh2ZG5WbExYUmxjM1F0ZFhScGJITXVkblZsYW5NdWIzSm5MMlZ1TDJGd2FTOTNjbUZ3Y0dWeUwzUnlhV2RuWlhJdWFIUnRiQ2NwWEc0Z0lDQWdmVnh1WEc0Z0lDQWdMeThnUkc5dUozUWdabWx5WlNCbGRtVnVkQ0J2YmlCaElHUnBjMkZpYkdWa0lHVnNaVzFsYm5SY2JpQWdJQ0JwWmlBb2RHaHBjeTVoZEhSeWFXSjFkR1Z6S0NrdVpHbHpZV0pzWldRcElIdGNiaUFnSUNBZ0lISmxkSFZ5Ymx4dUlDQWdJSDFjYmx4dUlDQWdJR052Ym5OMElHMXZaR2xtYVdWeWN5QTlJSHRjYmlBZ0lDQWdJR1Z1ZEdWeU9pQXhNeXhjYmlBZ0lDQWdJSFJoWWpvZ09TeGNiaUFnSUNBZ0lHUmxiR1YwWlRvZ05EWXNYRzRnSUNBZ0lDQmxjMk02SURJM0xGeHVJQ0FnSUNBZ2MzQmhZMlU2SURNeUxGeHVJQ0FnSUNBZ2RYQTZJRE00TEZ4dUlDQWdJQ0FnWkc5M2Jqb2dOREFzWEc0Z0lDQWdJQ0JzWldaME9pQXpOeXhjYmlBZ0lDQWdJSEpwWjJoME9pQXpPU3hjYmlBZ0lDQWdJR1Z1WkRvZ016VXNYRzRnSUNBZ0lDQm9iMjFsT2lBek5peGNiaUFnSUNBZ0lHSmhZMnR6Y0dGalpUb2dPQ3hjYmlBZ0lDQWdJR2x1YzJWeWREb2dORFVzWEc0Z0lDQWdJQ0J3WVdkbGRYQTZJRE16TEZ4dUlDQWdJQ0FnY0dGblpXUnZkMjQ2SURNMFhHNGdJQ0FnZlZ4dVhHNGdJQ0FnWTI5dWMzUWdaWFpsYm5RZ1BTQjBlWEJsTG5Od2JHbDBLQ2N1SnlsY2JseHVJQ0FnSUd4bGRDQmxkbVZ1ZEU5aWFtVmpkRnh1WEc0Z0lDQWdMeThnUm1Gc2JHSmhZMnNnWm05eUlFbEZNVEFzTVRFZ0xTQm9kSFJ3Y3pvdkwzTjBZV05yYjNabGNtWnNiM2N1WTI5dEwzRjFaWE4wYVc5dWN5OHlOalU1TmpFeU0xeHVJQ0FnSUdsbUlDaDBlWEJsYjJZZ0tIZHBibVJ2ZHk1RmRtVnVkQ2tnUFQwOUlDZG1kVzVqZEdsdmJpY3BJSHRjYmlBZ0lDQWdJR1YyWlc1MFQySnFaV04wSUQwZ2JtVjNJSGRwYm1SdmR5NUZkbVZ1ZENobGRtVnVkRnN3WFN3Z2UxeHVJQ0FnSUNBZ0lDQmlkV0ppYkdWek9pQjBjblZsTEZ4dUlDQWdJQ0FnSUNCallXNWpaV3hoWW14bE9pQjBjblZsWEc0Z0lDQWdJQ0I5S1Z4dUlDQWdJSDBnWld4elpTQjdYRzRnSUNBZ0lDQmxkbVZ1ZEU5aWFtVmpkQ0E5SUdSdlkzVnRaVzUwTG1OeVpXRjBaVVYyWlc1MEtDZEZkbVZ1ZENjcFhHNGdJQ0FnSUNCbGRtVnVkRTlpYW1WamRDNXBibWwwUlhabGJuUW9aWFpsYm5SYk1GMHNJSFJ5ZFdVc0lIUnlkV1VwWEc0Z0lDQWdmVnh1WEc0Z0lDQWdhV1lnS0c5d2RHbHZibk1wSUh0Y2JpQWdJQ0FnSUU5aWFtVmpkQzVyWlhsektHOXdkR2x2Ym5NcExtWnZja1ZoWTJnb2EyVjVJRDArSUh0Y2JpQWdJQ0FnSUNBZ0x5OGdKRVpzYjNkSloyNXZjbVZjYmlBZ0lDQWdJQ0FnWlhabGJuUlBZbXBsWTNSYmEyVjVYU0E5SUc5d2RHbHZibk5iYTJWNVhWeHVJQ0FnSUNBZ2ZTbGNiaUFnSUNCOVhHNWNiaUFnSUNCcFppQW9aWFpsYm5RdWJHVnVaM1JvSUQwOVBTQXlLU0I3WEc0Z0lDQWdJQ0F2THlBa1JteHZkMGxuYm05eVpWeHVJQ0FnSUNBZ1pYWmxiblJQWW1wbFkzUXVhMlY1UTI5a1pTQTlJRzF2WkdsbWFXVnljMXRsZG1WdWRGc3hYVjFjYmlBZ0lDQjlYRzVjYmlBZ0lDQjBhR2x6TG1Wc1pXMWxiblF1WkdsemNHRjBZMmhGZG1WdWRDaGxkbVZ1ZEU5aWFtVmpkQ2xjYmlBZ0lDQnBaaUFvZEdocGN5NTJibTlrWlNrZ2UxeHVJQ0FnSUNBZ2IzSmtaWEpYWVhSamFHVnljeWgwYUdsekxuWnRJSHg4SUhSb2FYTXVkbTV2WkdVdVkyOXVkR1Y0ZEM0a2NtOXZkQ2xjYmlBZ0lDQjlYRzRnSUgxY2JseHVJQ0IxY0dSaGRHVWdLQ2tnZTF4dUlDQWdJSGRoY200b0ozVndaR0YwWlNCb1lYTWdZbVZsYmlCeVpXMXZkbVZrSUdaeWIyMGdkblZsTFhSbGMzUXRkWFJwYkhNdUlFRnNiQ0IxY0dSaGRHVnpJR0Z5WlNCdWIzY2djM2x1WTJoeWIyNXZkWE1nWW5rZ1pHVm1ZWFZzZENjcFhHNGdJSDFjYm4xY2JpSXNJbVoxYm1OMGFXOXVJSE5sZEVSbGNITlRlVzVqSUNoa1pYQXBJSHRjYmlBZ1pHVndMbk4xWW5NdVptOXlSV0ZqYUNoelpYUlhZWFJqYUdWeVUzbHVZeWxjYm4xY2JseHVablZ1WTNScGIyNGdjMlYwVjJGMFkyaGxjbE41Ym1NZ0tIZGhkR05vWlhJcElIdGNiaUFnYVdZZ0tIZGhkR05vWlhJdWMzbHVZeUE5UFQwZ2RISjFaU2tnZTF4dUlDQWdJSEpsZEhWeWJseHVJQ0I5WEc0Z0lIZGhkR05vWlhJdWMzbHVZeUE5SUhSeWRXVmNiaUFnZDJGMFkyaGxjaTVrWlhCekxtWnZja1ZoWTJnb2MyVjBSR1Z3YzFONWJtTXBYRzU5WEc1Y2JtVjRjRzl5ZENCbWRXNWpkR2x2YmlCelpYUlhZWFJqYUdWeWMxUnZVM2x1WXlBb2RtMHBJSHRjYmlBZ2FXWWdLSFp0TGw5M1lYUmphR1Z5Y3lrZ2UxeHVJQ0FnSUhadExsOTNZWFJqYUdWeWN5NW1iM0pGWVdOb0tITmxkRmRoZEdOb1pYSlRlVzVqS1Z4dUlDQjlYRzVjYmlBZ2FXWWdLSFp0TGw5amIyMXdkWFJsWkZkaGRHTm9aWEp6S1NCN1hHNGdJQ0FnVDJKcVpXTjBMbXRsZVhNb2RtMHVYMk52YlhCMWRHVmtWMkYwWTJobGNuTXBMbVp2Y2tWaFkyZ29LR052YlhCMWRHVmtWMkYwWTJobGNpa2dQVDRnZTF4dUlDQWdJQ0FnYzJWMFYyRjBZMmhsY2xONWJtTW9kbTB1WDJOdmJYQjFkR1ZrVjJGMFkyaGxjbk5iWTI5dGNIVjBaV1JYWVhSamFHVnlYU2xjYmlBZ0lDQjlLVnh1SUNCOVhHNWNiaUFnYzJWMFYyRjBZMmhsY2xONWJtTW9kbTB1WDNkaGRHTm9aWElwWEc1Y2JpQWdkbTB1SkdOb2FXeGtjbVZ1TG1admNrVmhZMmdvYzJWMFYyRjBZMmhsY25OVWIxTjVibU1wWEc1OVhHNGlMQ0l2THlCQVpteHZkMXh1WEc1cGJYQnZjblFnVjNKaGNIQmxjaUJtY205dElDY3VMM2R5WVhCd1pYSW5YRzVwYlhCdmNuUWdleUJ6WlhSWFlYUmphR1Z5YzFSdlUzbHVZeUI5SUdaeWIyMGdKeTR2YzJWMExYZGhkR05vWlhKekxYUnZMWE41Ym1NblhHNXBiWEJ2Y25RZ2V5QnZjbVJsY2xkaGRHTm9aWEp6SUgwZ1puSnZiU0FuTGk5dmNtUmxjaTEzWVhSamFHVnljeWRjYmx4dVpYaHdiM0owSUdSbFptRjFiSFFnWTJ4aGMzTWdWblZsVjNKaGNIQmxjaUJsZUhSbGJtUnpJRmR5WVhCd1pYSWdhVzF3YkdWdFpXNTBjeUJDWVhObFYzSmhjSEJsY2lCN1hHNGdJR052Ym5OMGNuVmpkRzl5SUNoMmJUb2dRMjl0Y0c5dVpXNTBMQ0J2Y0hScGIyNXpPaUJYY21Gd2NHVnlUM0IwYVc5dWN5a2dlMXh1SUNBZ0lITjFjR1Z5S0hadExsOTJibTlrWlN3Z2IzQjBhVzl1Y3lsY2JseHVJQ0FnSUM4dklDUkdiRzkzU1dkdWIzSmxJRG9nYVhOemRXVWdkMmwwYUNCa1pXWnBibVZRY205d1pYSjBlU0F0SUdoMGRIQnpPaTh2WjJsMGFIVmlMbU52YlM5bVlXTmxZbTl2YXk5bWJHOTNMMmx6YzNWbGN5OHlPRFZjYmlBZ0lDQlBZbXBsWTNRdVpHVm1hVzVsVUhKdmNHVnlkSGtvZEdocGN5d2dKM1p1YjJSbEp5d2dLSHRjYmlBZ0lDQWdJR2RsZERvZ0tDa2dQVDRnZG0wdVgzWnViMlJsTEZ4dUlDQWdJQ0FnYzJWME9pQW9LU0E5UGlCN2ZWeHVJQ0FnSUgwcEtWeHVJQ0FnSUM4dklDUkdiRzkzU1dkdWIzSmxYRzRnSUNBZ1QySnFaV04wTG1SbFptbHVaVkJ5YjNCbGNuUjVLSFJvYVhNc0lDZGxiR1Z0Wlc1MEp5d2dLSHRjYmlBZ0lDQWdJR2RsZERvZ0tDa2dQVDRnZG0wdUpHVnNMRnh1SUNBZ0lDQWdjMlYwT2lBb0tTQTlQaUI3ZlZ4dUlDQWdJSDBwS1Z4dUlDQWdJSFJvYVhNdWRtMGdQU0IyYlZ4dUlDQWdJR2xtSUNodmNIUnBiMjV6TG5ONWJtTXBJSHRjYmlBZ0lDQWdJSE5sZEZkaGRHTm9aWEp6Vkc5VGVXNWpLSFp0S1Z4dUlDQWdJQ0FnYjNKa1pYSlhZWFJqYUdWeWN5aDJiU2xjYmlBZ0lDQjlYRzRnSUNBZ2RHaHBjeTVwYzFaMVpVTnZiWEJ2Ym1WdWRDQTlJSFJ5ZFdWY2JpQWdJQ0IwYUdsekxtbHpSblZ1WTNScGIyNWhiRU52YlhCdmJtVnVkQ0E5SUhadExpUnZjSFJwYjI1ekxsOXBjMFoxYm1OMGFXOXVZV3hEYjI1MFlXbHVaWEpjYmlBZ0lDQjBhR2x6TGw5bGJXbDBkR1ZrSUQwZ2RtMHVYMTlsYldsMGRHVmtYRzRnSUNBZ2RHaHBjeTVmWlcxcGRIUmxaRUo1VDNKa1pYSWdQU0IyYlM1ZlgyVnRhWFIwWldSQ2VVOXlaR1Z5WEc0Z0lIMWNibjFjYmlJc0lpOHZJRUJtYkc5M1hHNWNibWx0Y0c5eWRDQjdJSFJvY205M1JYSnliM0lnZlNCbWNtOXRJQ2R6YUdGeVpXUXZkWFJwYkNkY2JseHVablZ1WTNScGIyNGdhWE5XWVd4cFpGTnNiM1FnS0hOc2IzUTZJR0Z1ZVNrNklHSnZiMnhsWVc0Z2UxeHVJQ0J5WlhSMWNtNGdRWEp5WVhrdWFYTkJjbkpoZVNoemJHOTBLU0I4ZkNBb2MyeHZkQ0FoUFQwZ2JuVnNiQ0FtSmlCMGVYQmxiMllnYzJ4dmRDQTlQVDBnSjI5aWFtVmpkQ2NwSUh4OElIUjVjR1Z2WmlCemJHOTBJRDA5UFNBbmMzUnlhVzVuSjF4dWZWeHVYRzVsZUhCdmNuUWdablZ1WTNScGIyNGdkbUZzYVdSaGRHVlRiRzkwY3lBb2MyeHZkSE02SUU5aWFtVmpkQ2s2SUhadmFXUWdlMXh1SUNCemJHOTBjeUFtSmlCUFltcGxZM1F1YTJWNWN5aHpiRzkwY3lrdVptOXlSV0ZqYUNnb2EyVjVLU0E5UGlCN1hHNGdJQ0FnYVdZZ0tDRnBjMVpoYkdsa1UyeHZkQ2h6Ykc5MGMxdHJaWGxkS1NrZ2UxeHVJQ0FnSUNBZ2RHaHliM2RGY25KdmNpZ25jMnh2ZEhOYmEyVjVYU0J0ZFhOMElHSmxJR0VnUTI5dGNHOXVaVzUwTENCemRISnBibWNnYjNJZ1lXNGdZWEp5WVhrZ2IyWWdRMjl0Y0c5dVpXNTBjeWNwWEc0Z0lDQWdmVnh1WEc0Z0lDQWdhV1lnS0VGeWNtRjVMbWx6UVhKeVlYa29jMnh2ZEhOYmEyVjVYU2twSUh0Y2JpQWdJQ0FnSUhOc2IzUnpXMnRsZVYwdVptOXlSV0ZqYUNnb2MyeHZkRlpoYkhWbEtTQTlQaUI3WEc0Z0lDQWdJQ0FnSUdsbUlDZ2hhWE5XWVd4cFpGTnNiM1FvYzJ4dmRGWmhiSFZsS1NrZ2UxeHVJQ0FnSUNBZ0lDQWdJSFJvY205M1JYSnliM0lvSjNOc2IzUnpXMnRsZVYwZ2JYVnpkQ0JpWlNCaElFTnZiWEJ2Ym1WdWRDd2djM1J5YVc1bklHOXlJR0Z1SUdGeWNtRjVJRzltSUVOdmJYQnZibVZ1ZEhNbktWeHVJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQjlLVnh1SUNBZ0lIMWNiaUFnZlNsY2JuMWNiaUlzSWk4dklFQm1iRzkzWEc1Y2JtbHRjRzl5ZENCN0lHTnZiWEJwYkdWVWIwWjFibU4wYVc5dWN5QjlJR1p5YjIwZ0ozWjFaUzEwWlcxd2JHRjBaUzFqYjIxd2FXeGxjaWRjYm1sdGNHOXlkQ0I3SUhSb2NtOTNSWEp5YjNJZ2ZTQm1jbTl0SUNkemFHRnlaV1F2ZFhScGJDZGNibWx0Y0c5eWRDQjdJSFpoYkdsa1lYUmxVMnh2ZEhNZ2ZTQm1jbTl0SUNjdUwzWmhiR2xrWVhSbExYTnNiM1J6SjF4dVhHNW1kVzVqZEdsdmJpQmhaR1JUYkc5MFZHOVdiU0FvZG0wNklFTnZiWEJ2Ym1WdWRDd2djMnh2ZEU1aGJXVTZJSE4wY21sdVp5d2djMnh2ZEZaaGJIVmxPaUJEYjIxd2IyNWxiblFnZkNCemRISnBibWNnZkNCQmNuSmhlVHhEYjIxd2IyNWxiblErSUh3Z1FYSnlZWGs4YzNSeWFXNW5QaWs2SUhadmFXUWdlMXh1SUNCc1pYUWdaV3hsYlZ4dUlDQnBaaUFvZEhsd1pXOW1JSE5zYjNSV1lXeDFaU0E5UFQwZ0ozTjBjbWx1WnljcElIdGNiaUFnSUNCcFppQW9JV052YlhCcGJHVlViMFoxYm1OMGFXOXVjeWtnZTF4dUlDQWdJQ0FnZEdoeWIzZEZjbkp2Y2lnbmRuVmxWR1Z0Y0d4aGRHVkRiMjF3YVd4bGNpQnBjeUIxYm1SbFptbHVaV1FzSUhsdmRTQnRkWE4wSUhCaGMzTWdZMjl0Y0c5dVpXNTBjeUJsZUhCc2FXTnBkR3g1SUdsbUlIWjFaUzEwWlcxd2JHRjBaUzFqYjIxd2FXeGxjaUJwY3lCMWJtUmxabWx1WldRbktWeHVJQ0FnSUgxY2JpQWdJQ0JwWmlBb2QybHVaRzkzTG01aGRtbG5ZWFJ2Y2k1MWMyVnlRV2RsYm5RdWJXRjBZMmdvTDFCb1lXNTBiMjFLVXk5cEtTa2dlMXh1SUNBZ0lDQWdkR2h5YjNkRmNuSnZjaWduZEdobElITnNiM1J6SUc5d2RHbHZiaUJrYjJWeklHNXZkQ0J6ZFhCd2IzSjBJSE4wY21sdVozTWdhVzRnVUdoaGJuUnZiVXBUTGlCUWJHVmhjMlVnZFhObElGQjFjSEJsZEdWbGNpd2diM0lnY0dGemN5QmhJR052YlhCdmJtVnVkQzRuS1Z4dUlDQWdJSDFjYmlBZ0lDQmpiMjV6ZENCa2IyMVFZWEp6WlhJZ1BTQnVaWGNnZDJsdVpHOTNMa1JQVFZCaGNuTmxjaWdwWEc0Z0lDQWdZMjl1YzNRZ1gyUnZZM1Z0Wlc1MElEMGdaRzl0VUdGeWMyVnlMbkJoY25ObFJuSnZiVk4wY21sdVp5aHpiRzkwVm1Gc2RXVXNJQ2QwWlhoMEwyaDBiV3duS1Z4dUlDQWdJR052Ym5OMElGOXpiRzkwVm1Gc2RXVWdQU0J6Ykc5MFZtRnNkV1V1ZEhKcGJTZ3BYRzRnSUNBZ2FXWWdLRjl6Ykc5MFZtRnNkV1ZiTUYwZ1BUMDlJQ2M4SnlBbUppQmZjMnh2ZEZaaGJIVmxXMTl6Ykc5MFZtRnNkV1V1YkdWdVozUm9JQzBnTVYwZ1BUMDlJQ2MrSnlBbUppQmZaRzlqZFcxbGJuUXVZbTlrZVM1amFHbHNaRVZzWlcxbGJuUkRiM1Z1ZENBOVBUMGdNU2tnZTF4dUlDQWdJQ0FnWld4bGJTQTlJSFp0TGlSamNtVmhkR1ZGYkdWdFpXNTBLR052YlhCcGJHVlViMFoxYm1OMGFXOXVjeWh6Ykc5MFZtRnNkV1VwS1Z4dUlDQWdJSDBnWld4elpTQjdYRzRnSUNBZ0lDQmpiMjV6ZENCamIyMXdhV3hsWkZKbGMzVnNkQ0E5SUdOdmJYQnBiR1ZVYjBaMWJtTjBhVzl1Y3loZ1BHUnBkajRrZTNOc2IzUldZV3gxWlgxN2V5QjlmVHd2WkdsMlBtQXBYRzRnSUNBZ0lDQmpiMjV6ZENCZmMzUmhkR2xqVW1WdVpHVnlSbTV6SUQwZ2RtMHVYM0psYm1SbGNsQnliM2g1TGlSdmNIUnBiMjV6TG5OMFlYUnBZMUpsYm1SbGNrWnVjMXh1SUNBZ0lDQWdkbTB1WDNKbGJtUmxjbEJ5YjNoNUxpUnZjSFJwYjI1ekxuTjBZWFJwWTFKbGJtUmxja1p1Y3lBOUlHTnZiWEJwYkdWa1VtVnpkV3gwTG5OMFlYUnBZMUpsYm1SbGNrWnVjMXh1SUNBZ0lDQWdaV3hsYlNBOUlHTnZiWEJwYkdWa1VtVnpkV3gwTG5KbGJtUmxjaTVqWVd4c0tIWnRMbDl5Wlc1a1pYSlFjbTk0ZVN3Z2RtMHVKR055WldGMFpVVnNaVzFsYm5RcExtTm9hV3hrY21WdVhHNGdJQ0FnSUNCMmJTNWZjbVZ1WkdWeVVISnZlSGt1Skc5d2RHbHZibk11YzNSaGRHbGpVbVZ1WkdWeVJtNXpJRDBnWDNOMFlYUnBZMUpsYm1SbGNrWnVjMXh1SUNBZ0lIMWNiaUFnZlNCbGJITmxJSHRjYmlBZ0lDQmxiR1Z0SUQwZ2RtMHVKR055WldGMFpVVnNaVzFsYm5Rb2MyeHZkRlpoYkhWbEtWeHVJQ0I5WEc0Z0lHbG1JQ2hCY25KaGVTNXBjMEZ5Y21GNUtHVnNaVzBwS1NCN1hHNGdJQ0FnYVdZZ0tFRnljbUY1TG1selFYSnlZWGtvZG0wdUpITnNiM1J6VzNOc2IzUk9ZVzFsWFNrcElIdGNiaUFnSUNBZ0lIWnRMaVJ6Ykc5MGMxdHpiRzkwVG1GdFpWMGdQU0JiTGk0dWRtMHVKSE5zYjNSelczTnNiM1JPWVcxbFhTd2dMaTR1Wld4bGJWMWNiaUFnSUNCOUlHVnNjMlVnZTF4dUlDQWdJQ0FnZG0wdUpITnNiM1J6VzNOc2IzUk9ZVzFsWFNBOUlGc3VMaTVsYkdWdFhWeHVJQ0FnSUgxY2JpQWdmU0JsYkhObElIdGNiaUFnSUNCcFppQW9RWEp5WVhrdWFYTkJjbkpoZVNoMmJTNGtjMnh2ZEhOYmMyeHZkRTVoYldWZEtTa2dlMXh1SUNBZ0lDQWdkbTB1SkhOc2IzUnpXM05zYjNST1lXMWxYUzV3ZFhOb0tHVnNaVzBwWEc0Z0lDQWdmU0JsYkhObElIdGNiaUFnSUNBZ0lIWnRMaVJ6Ykc5MGMxdHpiRzkwVG1GdFpWMGdQU0JiWld4bGJWMWNiaUFnSUNCOVhHNGdJSDFjYm4xY2JseHVaWGh3YjNKMElHWjFibU4wYVc5dUlHRmtaRk5zYjNSeklDaDJiVG9nUTI5dGNHOXVaVzUwTENCemJHOTBjem9nVDJKcVpXTjBLVG9nZG05cFpDQjdYRzRnSUhaaGJHbGtZWFJsVTJ4dmRITW9jMnh2ZEhNcFhHNGdJRTlpYW1WamRDNXJaWGx6S0hOc2IzUnpLUzVtYjNKRllXTm9LQ2hyWlhrcElEMCtJSHRjYmlBZ0lDQnBaaUFvUVhKeVlYa3VhWE5CY25KaGVTaHpiRzkwYzF0clpYbGRLU2tnZTF4dUlDQWdJQ0FnYzJ4dmRITmJhMlY1WFM1bWIzSkZZV05vS0NoemJHOTBWbUZzZFdVcElEMCtJSHRjYmlBZ0lDQWdJQ0FnWVdSa1UyeHZkRlJ2Vm0wb2RtMHNJR3RsZVN3Z2MyeHZkRlpoYkhWbEtWeHVJQ0FnSUNBZ2ZTbGNiaUFnSUNCOUlHVnNjMlVnZTF4dUlDQWdJQ0FnWVdSa1UyeHZkRlJ2Vm0wb2RtMHNJR3RsZVN3Z2MyeHZkSE5iYTJWNVhTbGNiaUFnSUNCOVhHNGdJSDBwWEc1OVhHNGlMQ0l2THlCQVpteHZkMXh1WEc1cGJYQnZjblFnZXlCamIyMXdhV3hsVkc5R2RXNWpkR2x2Ym5NZ2ZTQm1jbTl0SUNkMmRXVXRkR1Z0Y0d4aGRHVXRZMjl0Y0dsc1pYSW5YRzVwYlhCdmNuUWdleUIwYUhKdmQwVnljbTl5SUgwZ1puSnZiU0FuYzJoaGNtVmtMM1YwYVd3blhHNWNibVY0Y0c5eWRDQm1kVzVqZEdsdmJpQmhaR1JUWTI5d1pXUlRiRzkwY3lBb2RtMDZJRU52YlhCdmJtVnVkQ3dnYzJOdmNHVmtVMnh2ZEhNNklFOWlhbVZqZENrNklIWnZhV1FnZTF4dUlDQlBZbXBsWTNRdWEyVjVjeWh6WTI5d1pXUlRiRzkwY3lrdVptOXlSV0ZqYUNnb2EyVjVLU0E5UGlCN1hHNGdJQ0FnWTI5dWMzUWdkR1Z0Y0d4aGRHVWdQU0J6WTI5d1pXUlRiRzkwYzF0clpYbGRMblJ5YVcwb0tWeHVJQ0FnSUdsbUlDaDBaVzF3YkdGMFpTNXpkV0p6ZEhJb01Dd2dPU2tnUFQwOUlDYzhkR1Z0Y0d4aGRHVW5LU0I3WEc0Z0lDQWdJQ0IwYUhKdmQwVnljbTl5S0NkMGFHVWdjMk52Y0dWa1UyeHZkSE1nYjNCMGFXOXVJR1J2WlhNZ2JtOTBJSE4xY0hCdmNuUWdZU0IwWlcxd2JHRjBaU0IwWVdjZ1lYTWdkR2hsSUhKdmIzUWdaV3hsYldWdWRDNG5LVnh1SUNBZ0lIMWNiaUFnSUNCamIyNXpkQ0JrYjIxUVlYSnpaWElnUFNCdVpYY2dkMmx1Wkc5M0xrUlBUVkJoY25ObGNpZ3BYRzRnSUNBZ1kyOXVjM1FnWDJSdlkzVnRaVzUwSUQwZ1pHOXRVR0Z5YzJWeUxuQmhjbk5sUm5KdmJWTjBjbWx1WnloMFpXMXdiR0YwWlN3Z0ozUmxlSFF2YUhSdGJDY3BYRzRnSUNBZ2RtMHVKRjkyZFdWVVpYTjBWWFJwYkhOZmMyTnZjR1ZrVTJ4dmRITmJhMlY1WFNBOUlHTnZiWEJwYkdWVWIwWjFibU4wYVc5dWN5aDBaVzF3YkdGMFpTa3VjbVZ1WkdWeVhHNGdJQ0FnZG0wdUpGOTJkV1ZVWlhOMFZYUnBiSE5mYzJ4dmRGTmpiM0JsYzF0clpYbGRJRDBnWDJSdlkzVnRaVzUwTG1KdlpIa3VabWx5YzNSRGFHbHNaQzVuWlhSQmRIUnlhV0oxZEdVb0ozTnNiM1F0YzJOdmNHVW5LVnh1SUNCOUtWeHVmVnh1SWl3aUx5OGdRR1pzYjNkY2JtbHRjRzl5ZENBa0pGWjFaU0JtY205dElDZDJkV1VuWEc1cGJYQnZjblFnZXlCM1lYSnVJSDBnWm5KdmJTQW5jMmhoY21Wa0wzVjBhV3duWEc1Y2JtVjRjRzl5ZENCa1pXWmhkV3gwSUdaMWJtTjBhVzl1SUdGa1pFMXZZMnR6SUNodGIyTnJaV1JRY205d1pYSjBhV1Z6T2lCUFltcGxZM1FzSUZaMVpUb2dRMjl0Y0c5dVpXNTBLU0I3WEc0Z0lFOWlhbVZqZEM1clpYbHpLRzF2WTJ0bFpGQnliM0JsY25ScFpYTXBMbVp2Y2tWaFkyZ29LR3RsZVNrZ1BUNGdlMXh1SUNBZ0lIUnllU0I3WEc0Z0lDQWdJQ0JXZFdVdWNISnZkRzkwZVhCbFcydGxlVjBnUFNCdGIyTnJaV1JRY205d1pYSjBhV1Z6VzJ0bGVWMWNiaUFnSUNCOUlHTmhkR05vSUNobEtTQjdYRzRnSUNBZ0lDQjNZWEp1S0dCamIzVnNaQ0J1YjNRZ2IzWmxjbmR5YVhSbElIQnliM0JsY25SNUlDUjdhMlY1ZlN3Z2RHaHBjeUIxYzNWaGJHeDVJR05oZFhObFpDQmllU0JoSUhCc2RXZHBiaUIwYUdGMElHaGhjeUJoWkdSbFpDQjBhR1VnY0hKdmNHVnlkSGtnWVhNZ1lTQnlaV0ZrTFc5dWJIa2dkbUZzZFdWZ0tWeHVJQ0FnSUgxY2JpQWdJQ0FrSkZaMVpTNTFkR2xzTG1SbFptbHVaVkpsWVdOMGFYWmxLRloxWlN3Z2EyVjVMQ0J0YjJOclpXUlFjbTl3WlhKMGFXVnpXMnRsZVYwcFhHNGdJSDBwWEc1OVhHNGlMQ0pwYlhCdmNuUWdWblZsSUdaeWIyMGdKM1oxWlNkY2JseHVaWGh3YjNKMElHUmxabUYxYkhRZ1puVnVZM1JwYjI0Z1lXUmtRWFIwY25NZ0tIWnRMQ0JoZEhSeWN5a2dlMXh1SUNCamIyNXpkQ0J2Y21sbmFXNWhiRk5wYkdWdWRDQTlJRloxWlM1amIyNW1hV2N1YzJsc1pXNTBYRzRnSUZaMVpTNWpiMjVtYVdjdWMybHNaVzUwSUQwZ2RISjFaVnh1SUNCcFppQW9ZWFIwY25NcElIdGNiaUFnSUNCMmJTNGtZWFIwY25NZ1BTQmhkSFJ5YzF4dUlDQjlJR1ZzYzJVZ2UxeHVJQ0FnSUhadExpUmhkSFJ5Y3lBOUlIdDlYRzRnSUgxY2JpQWdWblZsTG1OdmJtWnBaeTV6YVd4bGJuUWdQU0J2Y21sbmFXNWhiRk5wYkdWdWRGeHVmVnh1SWl3aWFXMXdiM0owSUZaMVpTQm1jbTl0SUNkMmRXVW5YRzVjYm1WNGNHOXlkQ0JrWldaaGRXeDBJR1oxYm1OMGFXOXVJR0ZrWkV4cGMzUmxibVZ5Y3lBb2RtMHNJR3hwYzNSbGJtVnljeWtnZTF4dUlDQmpiMjV6ZENCdmNtbG5hVzVoYkZOcGJHVnVkQ0E5SUZaMVpTNWpiMjVtYVdjdWMybHNaVzUwWEc0Z0lGWjFaUzVqYjI1bWFXY3VjMmxzWlc1MElEMGdkSEoxWlZ4dUlDQnBaaUFvYkdsemRHVnVaWEp6S1NCN1hHNGdJQ0FnZG0wdUpHeHBjM1JsYm1WeWN5QTlJR3hwYzNSbGJtVnljMXh1SUNCOUlHVnNjMlVnZTF4dUlDQWdJSFp0TGlSc2FYTjBaVzVsY25NZ1BTQjdmVnh1SUNCOVhHNGdJRloxWlM1amIyNW1hV2N1YzJsc1pXNTBJRDBnYjNKcFoybHVZV3hUYVd4bGJuUmNibjFjYmlJc0ltWjFibU4wYVc5dUlHRmtaRkJ5YjNacFpHVWdLR052YlhCdmJtVnVkQ3dnYjNCMGFXOXVVSEp2ZG1sa1pTd2diM0IwYVc5dWN5a2dlMXh1SUNCamIyNXpkQ0J3Y205MmFXUmxJRDBnZEhsd1pXOW1JRzl3ZEdsdmJsQnliM1pwWkdVZ1BUMDlJQ2RtZFc1amRHbHZiaWRjYmlBZ0lDQS9JRzl3ZEdsdmJsQnliM1pwWkdWY2JpQWdJQ0E2SUU5aWFtVmpkQzVoYzNOcFoyNG9lMzBzSUc5d2RHbHZibEJ5YjNacFpHVXBYRzVjYmlBZ2IzQjBhVzl1Y3k1aVpXWnZjbVZEY21WaGRHVWdQU0JtZFc1amRHbHZiaUIyZFdWVVpYTjBWWFJwYkVKbFptOXlaVU55WldGMFpTQW9LU0I3WEc0Z0lDQWdkR2hwY3k1ZmNISnZkbWxrWldRZ1BTQjBlWEJsYjJZZ2NISnZkbWxrWlNBOVBUMGdKMloxYm1OMGFXOXVKMXh1SUNBZ0lDQWdQeUJ3Y205MmFXUmxMbU5oYkd3b2RHaHBjeWxjYmlBZ0lDQWdJRG9nY0hKdmRtbGtaVnh1SUNCOVhHNTlYRzVjYm1WNGNHOXlkQ0JrWldaaGRXeDBJR0ZrWkZCeWIzWnBaR1ZjYmlJc0lpOHZJRUJtYkc5M1hHNWNibVY0Y0c5eWRDQm1kVzVqZEdsdmJpQnNiMmRGZG1WdWRITWdLSFp0T2lCRGIyMXdiMjVsYm5Rc0lHVnRhWFIwWldRNklFOWlhbVZqZEN3Z1pXMXBkSFJsWkVKNVQzSmtaWEk2SUVGeWNtRjVQR0Z1ZVQ0cElIdGNiaUFnWTI5dWMzUWdaVzFwZENBOUlIWnRMaVJsYldsMFhHNGdJSFp0TGlSbGJXbDBJRDBnS0c1aGJXVXNJQzR1TG1GeVozTXBJRDArSUh0Y2JpQWdJQ0FvWlcxcGRIUmxaRnR1WVcxbFhTQjhmQ0FvWlcxcGRIUmxaRnR1WVcxbFhTQTlJRnRkS1NrdWNIVnphQ2hoY21kektWeHVJQ0FnSUdWdGFYUjBaV1JDZVU5eVpHVnlMbkIxYzJnb2V5QnVZVzFsTENCaGNtZHpJSDBwWEc0Z0lDQWdjbVYwZFhKdUlHVnRhWFF1WTJGc2JDaDJiU3dnYm1GdFpTd2dMaTR1WVhKbmN5bGNiaUFnZlZ4dWZWeHVYRzVsZUhCdmNuUWdablZ1WTNScGIyNGdZV1JrUlhabGJuUk1iMmRuWlhJZ0tIWjFaVG9nUTI5dGNHOXVaVzUwS1NCN1hHNGdJSFoxWlM1dGFYaHBiaWg3WEc0Z0lDQWdZbVZtYjNKbFEzSmxZWFJsT2lCbWRXNWpkR2x2YmlBb0tTQjdYRzRnSUNBZ0lDQjBhR2x6TGw5ZlpXMXBkSFJsWkNBOUlFOWlhbVZqZEM1amNtVmhkR1VvYm5Wc2JDbGNiaUFnSUNBZ0lIUm9hWE11WDE5bGJXbDBkR1ZrUW5sUGNtUmxjaUE5SUZ0ZFhHNGdJQ0FnSUNCc2IyZEZkbVZ1ZEhNb2RHaHBjeXdnZEdocGN5NWZYMlZ0YVhSMFpXUXNJSFJvYVhNdVgxOWxiV2wwZEdWa1FubFBjbVJsY2lsY2JpQWdJQ0I5WEc0Z0lIMHBYRzU5WEc0aUxDSXZMeUJBWm14dmQxeHVYRzVwYlhCdmNuUWdleUJqYjIxd2FXeGxWRzlHZFc1amRHbHZibk1nZlNCbWNtOXRJQ2QyZFdVdGRHVnRjR3hoZEdVdFkyOXRjR2xzWlhJblhHNWNibVY0Y0c5eWRDQm1kVzVqZEdsdmJpQmpiMjF3YVd4bFZHVnRjR3hoZEdVZ0tHTnZiWEJ2Ym1WdWREb2dRMjl0Y0c5dVpXNTBLU0I3WEc0Z0lHbG1JQ2hqYjIxd2IyNWxiblF1WTI5dGNHOXVaVzUwY3lrZ2UxeHVJQ0FnSUU5aWFtVmpkQzVyWlhsektHTnZiWEJ2Ym1WdWRDNWpiMjF3YjI1bGJuUnpLUzVtYjNKRllXTm9LQ2hqS1NBOVBpQjdYRzRnSUNBZ0lDQmpiMjV6ZENCamJYQWdQU0JqYjIxd2IyNWxiblF1WTI5dGNHOXVaVzUwYzF0alhWeHVJQ0FnSUNBZ2FXWWdLQ0ZqYlhBdWNtVnVaR1Z5S1NCN1hHNGdJQ0FnSUNBZ0lHTnZiWEJwYkdWVVpXMXdiR0YwWlNoamJYQXBYRzRnSUNBZ0lDQjlYRzRnSUNBZ2ZTbGNiaUFnZlZ4dUlDQnBaaUFvWTI5dGNHOXVaVzUwTG1WNGRHVnVaSE1wSUh0Y2JpQWdJQ0JqYjIxd2FXeGxWR1Z0Y0d4aGRHVW9ZMjl0Y0c5dVpXNTBMbVY0ZEdWdVpITXBYRzRnSUgxY2JpQWdhV1lnS0dOdmJYQnZibVZ1ZEM1MFpXMXdiR0YwWlNrZ2UxeHVJQ0FnSUU5aWFtVmpkQzVoYzNOcFoyNG9ZMjl0Y0c5dVpXNTBMQ0JqYjIxd2FXeGxWRzlHZFc1amRHbHZibk1vWTI5dGNHOXVaVzUwTG5SbGJYQnNZWFJsS1NsY2JpQWdmVnh1ZlZ4dUlpd2lMeThnUUdac2IzZGNibHh1YVcxd2IzSjBJRloxWlNCbWNtOXRJQ2QyZFdVblhHNXBiWEJ2Y25RZ2V5QmpiMjF3YVd4bFZHOUdkVzVqZEdsdmJuTWdmU0JtY205dElDZDJkV1V0ZEdWdGNHeGhkR1V0WTI5dGNHbHNaWEluWEc1cGJYQnZjblFnZXlCMGFISnZkMFZ5Y205eUlIMGdabkp2YlNBbkxpOTFkR2xzSjF4dWFXMXdiM0owSUhzZ1kyOXRjRzl1Wlc1MFRtVmxaSE5EYjIxd2FXeHBibWNnZlNCbWNtOXRJQ2N1TDNaaGJHbGtZWFJ2Y25NblhHNXBiWEJ2Y25RZ2V5QmpiMjF3YVd4bFZHVnRjR3hoZEdVZ2ZTQm1jbTl0SUNjdUwyTnZiWEJwYkdVdGRHVnRjR3hoZEdVblhHNXBiWEJ2Y25RZ2V5QmpZWEJwZEdGc2FYcGxMQ0JqWVcxbGJHbDZaU3dnYUhsd2FHVnVZWFJsSUgwZ1puSnZiU0FuTGk5MWRHbHNKMXh1WEc1bWRXNWpkR2x2YmlCcGMxWjFaVU52YlhCdmJtVnVkQ0FvWTI5dGNDa2dlMXh1SUNCeVpYUjFjbTRnWTI5dGNDQW1KaUFvWTI5dGNDNXlaVzVrWlhJZ2ZId2dZMjl0Y0M1MFpXMXdiR0YwWlNCOGZDQmpiMjF3TG05d2RHbHZibk1wWEc1OVhHNWNibVoxYm1OMGFXOXVJR2x6Vm1Gc2FXUlRkSFZpSUNoemRIVmlPaUJoYm5rcElIdGNiaUFnY21WMGRYSnVJQ0VoYzNSMVlpQW1KbHh1SUNBZ0lDQWdkSGx3Wlc5bUlITjBkV0lnUFQwOUlDZHpkSEpwYm1jbklIeDhYRzRnSUNBZ0lDQW9jM1IxWWlBOVBUMGdkSEoxWlNrZ2ZIeGNiaUFnSUNBZ0lDaHBjMVoxWlVOdmJYQnZibVZ1ZENoemRIVmlLU2xjYm4xY2JseHVablZ1WTNScGIyNGdhWE5TWlhGMWFYSmxaRU52YlhCdmJtVnVkQ0FvYm1GdFpTa2dlMXh1SUNCeVpYUjFjbTRnYm1GdFpTQTlQVDBnSjB0bFpYQkJiR2wyWlNjZ2ZId2dibUZ0WlNBOVBUMGdKMVJ5WVc1emFYUnBiMjRuSUh4OElHNWhiV1VnUFQwOUlDZFVjbUZ1YzJsMGFXOXVSM0p2ZFhBblhHNTlYRzVjYm1aMWJtTjBhVzl1SUdkbGRFTnZjbVZRY205d1pYSjBhV1Z6SUNoamIyMXdiMjVsYm5RNklFTnZiWEJ2Ym1WdWRDazZJRTlpYW1WamRDQjdYRzRnSUhKbGRIVnliaUI3WEc0Z0lDQWdZWFIwY25NNklHTnZiWEJ2Ym1WdWRDNWhkSFJ5Y3l4Y2JpQWdJQ0J1WVcxbE9pQmpiMjF3YjI1bGJuUXVibUZ0WlN4Y2JpQWdJQ0J2YmpvZ1kyOXRjRzl1Wlc1MExtOXVMRnh1SUNBZ0lHdGxlVG9nWTI5dGNHOXVaVzUwTG10bGVTeGNiaUFnSUNCeVpXWTZJR052YlhCdmJtVnVkQzV5WldZc1hHNGdJQ0FnY0hKdmNITTZJR052YlhCdmJtVnVkQzV3Y205d2N5eGNiaUFnSUNCa2IyMVFjbTl3Y3pvZ1kyOXRjRzl1Wlc1MExtUnZiVkJ5YjNCekxGeHVJQ0FnSUdOc1lYTnpPaUJqYjIxd2IyNWxiblF1WTJ4aGMzTXNYRzRnSUNBZ2MzUmhkR2xqUTJ4aGMzTTZJR052YlhCdmJtVnVkQzV6ZEdGMGFXTkRiR0Z6Y3l4Y2JpQWdJQ0J6ZEdGMGFXTlRkSGxzWlRvZ1kyOXRjRzl1Wlc1MExuTjBZWFJwWTFOMGVXeGxMRnh1SUNBZ0lITjBlV3hsT2lCamIyMXdiMjVsYm5RdWMzUjViR1VzWEc0Z0lDQWdibTl5YldGc2FYcGxaRk4wZVd4bE9pQmpiMjF3YjI1bGJuUXVibTl5YldGc2FYcGxaRk4wZVd4bExGeHVJQ0FnSUc1aGRHbDJaVTl1T2lCamIyMXdiMjVsYm5RdWJtRjBhWFpsVDI0c1hHNGdJQ0FnWm5WdVkzUnBiMjVoYkRvZ1kyOXRjRzl1Wlc1MExtWjFibU4wYVc5dVlXeGNiaUFnZlZ4dWZWeHVablZ1WTNScGIyNGdZM0psWVhSbFUzUjFZa1p5YjIxVGRISnBibWNnS0hSbGJYQnNZWFJsVTNSeWFXNW5PaUJ6ZEhKcGJtY3NJRzl5YVdkcGJtRnNRMjl0Y0c5dVpXNTBPaUJEYjIxd2IyNWxiblFwT2lCUFltcGxZM1FnZTF4dUlDQnBaaUFvSVdOdmJYQnBiR1ZVYjBaMWJtTjBhVzl1Y3lrZ2UxeHVJQ0FnSUhSb2NtOTNSWEp5YjNJb0ozWjFaVlJsYlhCc1lYUmxRMjl0Y0dsc1pYSWdhWE1nZFc1a1pXWnBibVZrTENCNWIzVWdiWFZ6ZENCd1lYTnpJR052YlhCdmJtVnVkSE1nWlhod2JHbGphWFJzZVNCcFppQjJkV1V0ZEdWdGNHeGhkR1V0WTI5dGNHbHNaWElnYVhNZ2RXNWtaV1pwYm1Wa0p5bGNiaUFnZlZ4dVhHNGdJR2xtSUNoMFpXMXdiR0YwWlZOMGNtbHVaeTVwYm1SbGVFOW1LR2g1Y0dobGJtRjBaU2h2Y21sbmFXNWhiRU52YlhCdmJtVnVkQzV1WVcxbEtTa2dJVDA5SUMweElIeDhYRzRnSUhSbGJYQnNZWFJsVTNSeWFXNW5MbWx1WkdWNFQyWW9ZMkZ3YVhSaGJHbDZaU2h2Y21sbmFXNWhiRU52YlhCdmJtVnVkQzV1WVcxbEtTa2dJVDA5SUMweElIeDhYRzRnSUhSbGJYQnNZWFJsVTNSeWFXNW5MbWx1WkdWNFQyWW9ZMkZ0Wld4cGVtVW9iM0pwWjJsdVlXeERiMjF3YjI1bGJuUXVibUZ0WlNrcElDRTlQU0F0TVNrZ2UxeHVJQ0FnSUhSb2NtOTNSWEp5YjNJb0oyOXdkR2x2Ym5NdWMzUjFZaUJqWVc1dWIzUWdZMjl1ZEdGcGJpQmhJR05wY21OMWJHRnlJSEpsWm1WeVpXNWpaU2NwWEc0Z0lIMWNibHh1SUNCeVpYUjFjbTRnZTF4dUlDQWdJQzR1TG1kbGRFTnZjbVZRY205d1pYSjBhV1Z6S0c5eWFXZHBibUZzUTI5dGNHOXVaVzUwS1N4Y2JpQWdJQ0F1TGk1amIyMXdhV3hsVkc5R2RXNWpkR2x2Ym5Nb2RHVnRjR3hoZEdWVGRISnBibWNwWEc0Z0lIMWNibjFjYmx4dVpuVnVZM1JwYjI0Z1kzSmxZWFJsUW14aGJtdFRkSFZpSUNodmNtbG5hVzVoYkVOdmJYQnZibVZ1ZERvZ1EyOXRjRzl1Wlc1MEtTQjdYRzRnSUhKbGRIVnliaUI3WEc0Z0lDQWdMaTR1WjJWMFEyOXlaVkJ5YjNCbGNuUnBaWE1vYjNKcFoybHVZV3hEYjIxd2IyNWxiblFwTEZ4dUlDQWdJSEpsYm1SbGNqb2dhQ0E5UGlCb0tDY25LVnh1SUNCOVhHNTlYRzVjYm1WNGNHOXlkQ0JtZFc1amRHbHZiaUJqY21WaGRHVkRiMjF3YjI1bGJuUlRkSFZpY3lBb2IzSnBaMmx1WVd4RGIyMXdiMjVsYm5Sek9pQlBZbXBsWTNRZ1BTQjdmU3dnYzNSMVluTTZJRTlpYW1WamRDazZJRTlpYW1WamRDQjdYRzRnSUdOdmJuTjBJR052YlhCdmJtVnVkSE1nUFNCN2ZWeHVJQ0JwWmlBb0lYTjBkV0p6S1NCN1hHNGdJQ0FnY21WMGRYSnVJR052YlhCdmJtVnVkSE5jYmlBZ2ZWeHVJQ0JwWmlBb1FYSnlZWGt1YVhOQmNuSmhlU2h6ZEhWaWN5a3BJSHRjYmlBZ0lDQnpkSFZpY3k1bWIzSkZZV05vS0hOMGRXSWdQVDRnZTF4dUlDQWdJQ0FnYVdZZ0tITjBkV0lnUFQwOUlHWmhiSE5sS1NCN1hHNGdJQ0FnSUNBZ0lISmxkSFZ5Ymx4dUlDQWdJQ0FnZlZ4dVhHNGdJQ0FnSUNCcFppQW9kSGx3Wlc5bUlITjBkV0lnSVQwOUlDZHpkSEpwYm1jbktTQjdYRzRnSUNBZ0lDQWdJSFJvY205M1JYSnliM0lvSjJWaFkyZ2dhWFJsYlNCcGJpQmhiaUJ2Y0hScGIyNXpMbk4wZFdKeklHRnljbUY1SUcxMWMzUWdZbVVnWVNCemRISnBibWNuS1Z4dUlDQWdJQ0FnZlZ4dUlDQWdJQ0FnWTI5dGNHOXVaVzUwYzF0emRIVmlYU0E5SUdOeVpXRjBaVUpzWVc1clUzUjFZaWg3ZlNsY2JpQWdJQ0I5S1Z4dUlDQjlJR1ZzYzJVZ2UxeHVJQ0FnSUU5aWFtVmpkQzVyWlhsektITjBkV0p6S1M1bWIzSkZZV05vS0hOMGRXSWdQVDRnZTF4dUlDQWdJQ0FnYVdZZ0tITjBkV0p6VzNOMGRXSmRJRDA5UFNCbVlXeHpaU2tnZTF4dUlDQWdJQ0FnSUNCeVpYUjFjbTVjYmlBZ0lDQWdJSDFjYmlBZ0lDQWdJR2xtSUNnaGFYTldZV3hwWkZOMGRXSW9jM1IxWW5OYmMzUjFZbDBwS1NCN1hHNGdJQ0FnSUNBZ0lIUm9jbTkzUlhKeWIzSW9KMjl3ZEdsdmJuTXVjM1IxWWlCMllXeDFaWE1nYlhWemRDQmlaU0J3WVhOelpXUWdZU0J6ZEhKcGJtY2diM0lnWTI5dGNHOXVaVzUwSnlsY2JpQWdJQ0FnSUgxY2JpQWdJQ0FnSUdsbUlDaHpkSFZpYzF0emRIVmlYU0E5UFQwZ2RISjFaU2tnZTF4dUlDQWdJQ0FnSUNCamIyMXdiMjVsYm5SelczTjBkV0pkSUQwZ1kzSmxZWFJsUW14aGJtdFRkSFZpS0h0OUtWeHVJQ0FnSUNBZ0lDQnlaWFIxY201Y2JpQWdJQ0FnSUgxY2JseHVJQ0FnSUNBZ2FXWWdLR052YlhCdmJtVnVkRTVsWldSelEyOXRjR2xzYVc1bktITjBkV0p6VzNOMGRXSmRLU2tnZTF4dUlDQWdJQ0FnSUNCamIyMXdhV3hsVkdWdGNHeGhkR1VvYzNSMVluTmJjM1IxWWwwcFhHNGdJQ0FnSUNCOVhHNWNiaUFnSUNBZ0lHbG1JQ2h2Y21sbmFXNWhiRU52YlhCdmJtVnVkSE5iYzNSMVlsMHBJSHRjYmlBZ0lDQWdJQ0FnTHk4Z1VtVnRiM1psSUdOaFkyaGxaQ0JqYjI1emRISjFZM1J2Y2x4dUlDQWdJQ0FnSUNCa1pXeGxkR1VnYjNKcFoybHVZV3hEYjIxd2IyNWxiblJ6VzNOMGRXSmRMbDlEZEc5eVhHNGdJQ0FnSUNBZ0lHbG1JQ2gwZVhCbGIyWWdjM1IxWW5OYmMzUjFZbDBnUFQwOUlDZHpkSEpwYm1jbktTQjdYRzRnSUNBZ0lDQWdJQ0FnWTI5dGNHOXVaVzUwYzF0emRIVmlYU0E5SUdOeVpXRjBaVk4wZFdKR2NtOXRVM1J5YVc1bktITjBkV0p6VzNOMGRXSmRMQ0J2Y21sbmFXNWhiRU52YlhCdmJtVnVkSE5iYzNSMVlsMHBYRzRnSUNBZ0lDQWdJSDBnWld4elpTQjdYRzRnSUNBZ0lDQWdJQ0FnWTI5dGNHOXVaVzUwYzF0emRIVmlYU0E5SUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQzR1TG5OMGRXSnpXM04wZFdKZExGeHVJQ0FnSUNBZ0lDQWdJQ0FnYm1GdFpUb2diM0pwWjJsdVlXeERiMjF3YjI1bGJuUnpXM04wZFdKZExtNWhiV1ZjYmlBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lIMGdaV3h6WlNCN1hHNGdJQ0FnSUNBZ0lHbG1JQ2gwZVhCbGIyWWdjM1IxWW5OYmMzUjFZbDBnUFQwOUlDZHpkSEpwYm1jbktTQjdYRzRnSUNBZ0lDQWdJQ0FnYVdZZ0tDRmpiMjF3YVd4bFZHOUdkVzVqZEdsdmJuTXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIUm9jbTkzUlhKeWIzSW9KM1oxWlZSbGJYQnNZWFJsUTI5dGNHbHNaWElnYVhNZ2RXNWtaV1pwYm1Wa0xDQjViM1VnYlhWemRDQndZWE56SUdOdmJYQnZibVZ1ZEhNZ1pYaHdiR2xqYVhSc2VTQnBaaUIyZFdVdGRHVnRjR3hoZEdVdFkyOXRjR2xzWlhJZ2FYTWdkVzVrWldacGJtVmtKeWxjYmlBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lDQWdZMjl0Y0c5dVpXNTBjMXR6ZEhWaVhTQTlJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDNHVMbU52YlhCcGJHVlViMFoxYm1OMGFXOXVjeWh6ZEhWaWMxdHpkSFZpWFNsY2JpQWdJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJSDBnWld4elpTQjdYRzRnSUNBZ0lDQWdJQ0FnWTI5dGNHOXVaVzUwYzF0emRIVmlYU0E5SUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQzR1TG5OMGRXSnpXM04wZFdKZFhHNGdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0I5WEc0Z0lDQWdJQ0F2THlCcFoyNXZjbVZGYkdWdFpXNTBjeUJrYjJWeklHNXZkQ0JsZUdsemRDQnBiaUJXZFdVZ01pNHdMbmhjYmlBZ0lDQWdJR2xtSUNoV2RXVXVZMjl1Wm1sbkxtbG5ibTl5WldSRmJHVnRaVzUwY3lrZ2UxeHVJQ0FnSUNBZ0lDQldkV1V1WTI5dVptbG5MbWxuYm05eVpXUkZiR1Z0Wlc1MGN5NXdkWE5vS0hOMGRXSXBYRzRnSUNBZ0lDQjlYRzRnSUNBZ2ZTbGNiaUFnZlZ4dUlDQnlaWFIxY200Z1kyOXRjRzl1Wlc1MGMxeHVmVnh1WEc1bWRXNWpkR2x2YmlCemRIVmlRMjl0Y0c5dVpXNTBjeUFvWTI5dGNHOXVaVzUwY3pvZ1QySnFaV04wTENCemRIVmlZbVZrUTI5dGNHOXVaVzUwY3pvZ1QySnFaV04wS1NCN1hHNGdJRTlpYW1WamRDNXJaWGx6S0dOdmJYQnZibVZ1ZEhNcExtWnZja1ZoWTJnb1kyOXRjRzl1Wlc1MElEMCtJSHRjYmlBZ0lDQXZMeUJTWlcxdmRtVWdZMkZqYUdWa0lHTnZibk4wY25WamRHOXlYRzRnSUNBZ1pHVnNaWFJsSUdOdmJYQnZibVZ1ZEhOYlkyOXRjRzl1Wlc1MFhTNWZRM1J2Y2x4dUlDQWdJR2xtSUNnaFkyOXRjRzl1Wlc1MGMxdGpiMjF3YjI1bGJuUmRMbTVoYldVcElIdGNiaUFnSUNBZ0lHTnZiWEJ2Ym1WdWRITmJZMjl0Y0c5dVpXNTBYUzV1WVcxbElEMGdZMjl0Y0c5dVpXNTBYRzRnSUNBZ2ZWeHVJQ0FnSUhOMGRXSmlaV1JEYjIxd2IyNWxiblJ6VzJOdmJYQnZibVZ1ZEYwZ1BTQmpjbVZoZEdWQ2JHRnVhMU4wZFdJb1kyOXRjRzl1Wlc1MGMxdGpiMjF3YjI1bGJuUmRLVnh1WEc0Z0lDQWdMeThnYVdkdWIzSmxSV3hsYldWdWRITWdaRzlsY3lCdWIzUWdaWGhwYzNRZ2FXNGdWblZsSURJdU1DNTRYRzRnSUNBZ2FXWWdLRloxWlM1amIyNW1hV2N1YVdkdWIzSmxaRVZzWlcxbGJuUnpLU0I3WEc0Z0lDQWdJQ0JXZFdVdVkyOXVabWxuTG1sbmJtOXlaV1JGYkdWdFpXNTBjeTV3ZFhOb0tHTnZiWEJ2Ym1WdWRDbGNiaUFnSUNCOVhHNGdJSDBwWEc1OVhHNWNibVY0Y0c5eWRDQm1kVzVqZEdsdmJpQmpjbVZoZEdWRGIyMXdiMjVsYm5SVGRIVmljMFp2Y2tGc2JDQW9ZMjl0Y0c5dVpXNTBPaUJEYjIxd2IyNWxiblFwT2lCUFltcGxZM1FnZTF4dUlDQmpiMjV6ZENCemRIVmlZbVZrUTI5dGNHOXVaVzUwY3lBOUlIdDlYRzVjYmlBZ2FXWWdLR052YlhCdmJtVnVkQzVqYjIxd2IyNWxiblJ6S1NCN1hHNGdJQ0FnYzNSMVlrTnZiWEJ2Ym1WdWRITW9ZMjl0Y0c5dVpXNTBMbU52YlhCdmJtVnVkSE1zSUhOMGRXSmlaV1JEYjIxd2IyNWxiblJ6S1Z4dUlDQjlYRzVjYmlBZ2JHVjBJR1Y0ZEdWdVpHVmtJRDBnWTI5dGNHOXVaVzUwTG1WNGRHVnVaSE5jYmx4dUlDQXZMeUJNYjI5d0lIUm9jbTkxWjJnZ1pYaDBaVzVrWldRZ1kyOXRjRzl1Wlc1MElHTm9ZV2x1Y3lCMGJ5QnpkSFZpSUdGc2JDQmphR2xzWkNCamIyMXdiMjVsYm5SelhHNGdJSGRvYVd4bElDaGxlSFJsYm1SbFpDa2dlMXh1SUNBZ0lHbG1JQ2hsZUhSbGJtUmxaQzVqYjIxd2IyNWxiblJ6S1NCN1hHNGdJQ0FnSUNCemRIVmlRMjl0Y0c5dVpXNTBjeWhsZUhSbGJtUmxaQzVqYjIxd2IyNWxiblJ6TENCemRIVmlZbVZrUTI5dGNHOXVaVzUwY3lsY2JpQWdJQ0I5WEc0Z0lDQWdaWGgwWlc1a1pXUWdQU0JsZUhSbGJtUmxaQzVsZUhSbGJtUnpYRzRnSUgxY2JseHVJQ0JwWmlBb1kyOXRjRzl1Wlc1MExtVjRkR1Z1WkU5d2RHbHZibk1nSmlZZ1kyOXRjRzl1Wlc1MExtVjRkR1Z1WkU5d2RHbHZibk11WTI5dGNHOXVaVzUwY3lrZ2UxeHVJQ0FnSUhOMGRXSkRiMjF3YjI1bGJuUnpLR052YlhCdmJtVnVkQzVsZUhSbGJtUlBjSFJwYjI1ekxtTnZiWEJ2Ym1WdWRITXNJSE4wZFdKaVpXUkRiMjF3YjI1bGJuUnpLVnh1SUNCOVhHNWNiaUFnY21WMGRYSnVJSE4wZFdKaVpXUkRiMjF3YjI1bGJuUnpYRzU5WEc1Y2JtVjRjRzl5ZENCbWRXNWpkR2x2YmlCamNtVmhkR1ZEYjIxd2IyNWxiblJUZEhWaWMwWnZja2RzYjJKaGJITWdLR2x1YzNSaGJtTmxPaUJEYjIxd2IyNWxiblFwT2lCUFltcGxZM1FnZTF4dUlDQmpiMjV6ZENCamIyMXdiMjVsYm5SeklEMGdlMzFjYmlBZ1QySnFaV04wTG10bGVYTW9hVzV6ZEdGdVkyVXViM0IwYVc5dWN5NWpiMjF3YjI1bGJuUnpLUzVtYjNKRllXTm9LQ2hqS1NBOVBpQjdYRzRnSUNBZ2FXWWdLR2x6VW1WeGRXbHlaV1JEYjIxd2IyNWxiblFvWXlrcElIdGNiaUFnSUNBZ0lISmxkSFZ5Ymx4dUlDQWdJSDFjYmx4dUlDQWdJR052YlhCdmJtVnVkSE5iWTEwZ1BTQmpjbVZoZEdWQ2JHRnVhMU4wZFdJb2FXNXpkR0Z1WTJVdWIzQjBhVzl1Y3k1amIyMXdiMjVsYm5SelcyTmRLVnh1SUNBZ0lHUmxiR1YwWlNCcGJuTjBZVzVqWlM1dmNIUnBiMjV6TG1OdmJYQnZibVZ1ZEhOYlkxMHVYME4wYjNJZ0x5OGdaWE5zYVc1MExXUnBjMkZpYkdVdGJHbHVaU0J1Ynkxd1lYSmhiUzF5WldGemMybG5ibHh1SUNBZ0lHUmxiR1YwWlNCamIyMXdiMjVsYm5SelcyTmRMbDlEZEc5eUlDOHZJR1Z6YkdsdWRDMWthWE5oWW14bExXeHBibVVnYm04dGNHRnlZVzB0Y21WaGMzTnBaMjVjYmlBZ2ZTbGNiaUFnY21WMGRYSnVJR052YlhCdmJtVnVkSE5jYm4xY2JpSXNJaTh2SUVCbWJHOTNYRzVjYm1sdGNHOXlkQ0I3SUdOdmJYQnBiR1ZVYjBaMWJtTjBhVzl1Y3lCOUlHWnliMjBnSjNaMVpTMTBaVzF3YkdGMFpTMWpiMjF3YVd4bGNpZGNibHh1Wlhod2IzSjBJR1oxYm1OMGFXOXVJR052YlhCcGJHVlVaVzF3YkdGMFpTQW9ZMjl0Y0c5dVpXNTBPaUJEYjIxd2IyNWxiblFwSUh0Y2JpQWdhV1lnS0dOdmJYQnZibVZ1ZEM1amIyMXdiMjVsYm5SektTQjdYRzRnSUNBZ1QySnFaV04wTG10bGVYTW9ZMjl0Y0c5dVpXNTBMbU52YlhCdmJtVnVkSE1wTG1admNrVmhZMmdvS0dNcElEMCtJSHRjYmlBZ0lDQWdJR052Ym5OMElHTnRjQ0E5SUdOdmJYQnZibVZ1ZEM1amIyMXdiMjVsYm5SelcyTmRYRzRnSUNBZ0lDQnBaaUFvSVdOdGNDNXlaVzVrWlhJcElIdGNiaUFnSUNBZ0lDQWdZMjl0Y0dsc1pWUmxiWEJzWVhSbEtHTnRjQ2xjYmlBZ0lDQWdJSDFjYmlBZ0lDQjlLVnh1SUNCOVhHNGdJR2xtSUNoamIyMXdiMjVsYm5RdVpYaDBaVzVrY3lrZ2UxeHVJQ0FnSUdOdmJYQnBiR1ZVWlcxd2JHRjBaU2hqYjIxd2IyNWxiblF1WlhoMFpXNWtjeWxjYmlBZ2ZWeHVJQ0JwWmlBb1kyOXRjRzl1Wlc1MExuUmxiWEJzWVhSbEtTQjdYRzRnSUNBZ1QySnFaV04wTG1GemMybG5iaWhqYjIxd2IyNWxiblFzSUdOdmJYQnBiR1ZVYjBaMWJtTjBhVzl1Y3loamIyMXdiMjVsYm5RdWRHVnRjR3hoZEdVcEtWeHVJQ0I5WEc1OVhHNGlMQ0psZUhCdmNuUWdaR1ZtWVhWc2RDQm1kVzVqZEdsdmJpQmtaV3hsZEdWTmIzVnVkR2x1WjA5d2RHbHZibk1nS0c5d2RHbHZibk1wSUh0Y2JpQWdaR1ZzWlhSbElHOXdkR2x2Ym5NdVlYUjBZV05vVkc5RWIyTjFiV1Z1ZEZ4dUlDQmtaV3hsZEdVZ2IzQjBhVzl1Y3k1dGIyTnJjMXh1SUNCa1pXeGxkR1VnYjNCMGFXOXVjeTV6Ykc5MGMxeHVJQ0JrWld4bGRHVWdiM0IwYVc5dWN5NXNiMk5oYkZaMVpWeHVJQ0JrWld4bGRHVWdiM0IwYVc5dWN5NXpkSFZpYzF4dUlDQmtaV3hsZEdVZ2IzQjBhVzl1Y3k1amIyNTBaWGgwWEc0Z0lHUmxiR1YwWlNCdmNIUnBiMjV6TG1Oc2IyNWxYRzRnSUdSbGJHVjBaU0J2Y0hScGIyNXpMbUYwZEhKelhHNGdJR1JsYkdWMFpTQnZjSFJwYjI1ekxteHBjM1JsYm1WeWMxeHVmVnh1SWl3aUx5OGdRR1pzYjNkY2JseHVhVzF3YjNKMElIc2dZMjl0Y0dsc1pWUnZSblZ1WTNScGIyNXpJSDBnWm5KdmJTQW5kblZsTFhSbGJYQnNZWFJsTFdOdmJYQnBiR1Z5SjF4dWFXMXdiM0owSUhzZ2RHaHliM2RGY25KdmNpQjlJR1p5YjIwZ0ozTm9ZWEpsWkM5MWRHbHNKMXh1YVcxd2IzSjBJSHNnZG1Gc2FXUmhkR1ZUYkc5MGN5QjlJR1p5YjIwZ0p5NHZkbUZzYVdSaGRHVXRjMnh2ZEhNblhHNWNibVoxYm1OMGFXOXVJR055WldGMFpVWjFibU4wYVc5dVlXeFRiRzkwY3lBb2MyeHZkSE1nUFNCN2ZTd2dhQ2tnZTF4dUlDQnBaaUFvUVhKeVlYa3VhWE5CY25KaGVTaHpiRzkwY3k1a1pXWmhkV3gwS1NrZ2UxeHVJQ0FnSUhKbGRIVnliaUJ6Ykc5MGN5NWtaV1poZFd4MExtMWhjQ2hvS1Z4dUlDQjlYRzVjYmlBZ2FXWWdLSFI1Y0dWdlppQnpiRzkwY3k1a1pXWmhkV3gwSUQwOVBTQW5jM1J5YVc1bkp5a2dlMXh1SUNBZ0lISmxkSFZ5YmlCYmFDaGpiMjF3YVd4bFZHOUdkVzVqZEdsdmJuTW9jMnh2ZEhNdVpHVm1ZWFZzZENrcFhWeHVJQ0I5WEc0Z0lHTnZibk4wSUdOb2FXeGtjbVZ1SUQwZ1cxMWNiaUFnVDJKcVpXTjBMbXRsZVhNb2MyeHZkSE1wTG1admNrVmhZMmdvYzJ4dmRGUjVjR1VnUFQ0Z2UxeHVJQ0FnSUdsbUlDaEJjbkpoZVM1cGMwRnljbUY1S0hOc2IzUnpXM05zYjNSVWVYQmxYU2twSUh0Y2JpQWdJQ0FnSUhOc2IzUnpXM05zYjNSVWVYQmxYUzVtYjNKRllXTm9LSE5zYjNRZ1BUNGdlMXh1SUNBZ0lDQWdJQ0JqYjI1emRDQmpiMjF3YjI1bGJuUWdQU0IwZVhCbGIyWWdjMnh2ZENBOVBUMGdKM04wY21sdVp5Y2dQeUJqYjIxd2FXeGxWRzlHZFc1amRHbHZibk1vYzJ4dmRDa2dPaUJ6Ykc5MFhHNGdJQ0FnSUNBZ0lHTnZibk4wSUc1bGQxTnNiM1FnUFNCb0tHTnZiWEJ2Ym1WdWRDbGNiaUFnSUNBZ0lDQWdibVYzVTJ4dmRDNWtZWFJoTG5Oc2IzUWdQU0J6Ykc5MFZIbHdaVnh1SUNBZ0lDQWdJQ0JqYUdsc1pISmxiaTV3ZFhOb0tHNWxkMU5zYjNRcFhHNGdJQ0FnSUNCOUtWeHVJQ0FnSUgwZ1pXeHpaU0I3WEc0Z0lDQWdJQ0JqYjI1emRDQmpiMjF3YjI1bGJuUWdQU0IwZVhCbGIyWWdjMnh2ZEhOYmMyeHZkRlI1Y0dWZElEMDlQU0FuYzNSeWFXNW5KeUEvSUdOdmJYQnBiR1ZVYjBaMWJtTjBhVzl1Y3loemJHOTBjMXR6Ykc5MFZIbHdaVjBwSURvZ2MyeHZkSE5iYzJ4dmRGUjVjR1ZkWEc0Z0lDQWdJQ0JqYjI1emRDQnpiRzkwSUQwZ2FDaGpiMjF3YjI1bGJuUXBYRzRnSUNBZ0lDQnpiRzkwTG1SaGRHRXVjMnh2ZENBOUlITnNiM1JVZVhCbFhHNGdJQ0FnSUNCamFHbHNaSEpsYmk1d2RYTm9LSE5zYjNRcFhHNGdJQ0FnZlZ4dUlDQjlLVnh1SUNCeVpYUjFjbTRnWTJocGJHUnlaVzVjYm4xY2JseHVaWGh3YjNKMElHUmxabUYxYkhRZ1puVnVZM1JwYjI0Z1kzSmxZWFJsUm5WdVkzUnBiMjVoYkVOdmJYQnZibVZ1ZENBb1kyOXRjRzl1Wlc1ME9pQkRiMjF3YjI1bGJuUXNJRzF2ZFc1MGFXNW5UM0IwYVc5dWN6b2dUM0IwYVc5dWN5a2dlMXh1SUNCcFppQW9iVzkxYm5ScGJtZFBjSFJwYjI1ekxtTnZiblJsZUhRZ0ppWWdkSGx3Wlc5bUlHMXZkVzUwYVc1blQzQjBhVzl1Y3k1amIyNTBaWGgwSUNFOVBTQW5iMkpxWldOMEp5a2dlMXh1SUNBZ0lIUm9jbTkzUlhKeWIzSW9KMjF2ZFc1MExtTnZiblJsZUhRZ2JYVnpkQ0JpWlNCaGJpQnZZbXBsWTNRbktWeHVJQ0I5WEc0Z0lHbG1JQ2h0YjNWdWRHbHVaMDl3ZEdsdmJuTXVjMnh2ZEhNcElIdGNiaUFnSUNCMllXeHBaR0YwWlZOc2IzUnpLRzF2ZFc1MGFXNW5UM0IwYVc5dWN5NXpiRzkwY3lsY2JpQWdmVnh1WEc0Z0lISmxkSFZ5YmlCN1hHNGdJQ0FnY21WdVpHVnlJQ2hvT2lCR2RXNWpkR2x2YmlrZ2UxeHVJQ0FnSUNBZ2NtVjBkWEp1SUdnb1hHNGdJQ0FnSUNBZ0lHTnZiWEJ2Ym1WdWRDeGNiaUFnSUNBZ0lDQWdiVzkxYm5ScGJtZFBjSFJwYjI1ekxtTnZiblJsZUhRZ2ZId2dZMjl0Y0c5dVpXNTBMa1oxYm1OMGFXOXVZV3hTWlc1a1pYSkRiMjUwWlhoMExGeHVJQ0FnSUNBZ0lDQW9iVzkxYm5ScGJtZFBjSFJwYjI1ekxtTnZiblJsZUhRZ0ppWWdiVzkxYm5ScGJtZFBjSFJwYjI1ekxtTnZiblJsZUhRdVkyaHBiR1J5Wlc0Z0ppWWdiVzkxYm5ScGJtZFBjSFJwYjI1ekxtTnZiblJsZUhRdVkyaHBiR1J5Wlc0dWJXRndLSGdnUFQ0Z2RIbHdaVzltSUhnZ1BUMDlJQ2RtZFc1amRHbHZiaWNnUHlCNEtHZ3BJRG9nZUNrcElIeDhJR055WldGMFpVWjFibU4wYVc5dVlXeFRiRzkwY3lodGIzVnVkR2x1WjA5d2RHbHZibk11YzJ4dmRITXNJR2dwWEc0Z0lDQWdJQ0FwWEc0Z0lDQWdmU3hjYmlBZ0lDQnVZVzFsT2lCamIyMXdiMjVsYm5RdWJtRnRaU3hjYmlBZ0lDQmZhWE5HZFc1amRHbHZibUZzUTI5dWRHRnBibVZ5T2lCMGNuVmxYRzRnSUgxY2JuMWNiaUlzSWk4dklFQm1iRzkzWEc1Y2JtbHRjRzl5ZENCV2RXVWdabkp2YlNBbmRuVmxKMXh1YVcxd2IzSjBJSHNnWVdSa1UyeHZkSE1nZlNCbWNtOXRJQ2N1TDJGa1pDMXpiRzkwY3lkY2JtbHRjRzl5ZENCN0lHRmtaRk5qYjNCbFpGTnNiM1J6SUgwZ1puSnZiU0FuTGk5aFpHUXRjMk52Y0dWa0xYTnNiM1J6SjF4dWFXMXdiM0owSUdGa1pFMXZZMnR6SUdaeWIyMGdKeTR2WVdSa0xXMXZZMnR6SjF4dWFXMXdiM0owSUdGa1pFRjBkSEp6SUdaeWIyMGdKeTR2WVdSa0xXRjBkSEp6SjF4dWFXMXdiM0owSUdGa1pFeHBjM1JsYm1WeWN5Qm1jbTl0SUNjdUwyRmtaQzFzYVhOMFpXNWxjbk1uWEc1cGJYQnZjblFnWVdSa1VISnZkbWxrWlNCbWNtOXRJQ2N1TDJGa1pDMXdjbTkyYVdSbEoxeHVhVzF3YjNKMElIc2dZV1JrUlhabGJuUk1iMmRuWlhJZ2ZTQm1jbTl0SUNjdUwyeHZaeTFsZG1WdWRITW5YRzVwYlhCdmNuUWdleUJqY21WaGRHVkRiMjF3YjI1bGJuUlRkSFZpY3lCOUlHWnliMjBnSjNOb1lYSmxaQzl6ZEhWaUxXTnZiWEJ2Ym1WdWRITW5YRzVwYlhCdmNuUWdleUIwYUhKdmQwVnljbTl5SUgwZ1puSnZiU0FuYzJoaGNtVmtMM1YwYVd3blhHNXBiWEJ2Y25RZ2V5QmpiMjF3YVd4bFZHVnRjR3hoZEdVZ2ZTQm1jbTl0SUNjdUwyTnZiWEJwYkdVdGRHVnRjR3hoZEdVblhHNXBiWEJ2Y25RZ1pHVnNaWFJsYjNCMGFXOXVjeUJtY205dElDY3VMMlJsYkdWMFpTMXRiM1Z1ZEdsdVp5MXZjSFJwYjI1ekoxeHVhVzF3YjNKMElHTnlaV0YwWlVaMWJtTjBhVzl1WVd4RGIyMXdiMjVsYm5RZ1puSnZiU0FuTGk5amNtVmhkR1V0Wm5WdVkzUnBiMjVoYkMxamIyMXdiMjVsYm5RblhHNXBiWEJ2Y25RZ2V5QmpiMjF3YjI1bGJuUk9aV1ZrYzBOdmJYQnBiR2x1WnlCOUlHWnliMjBnSjNOb1lYSmxaQzkyWVd4cFpHRjBiM0p6SjF4dVhHNWxlSEJ2Y25RZ1pHVm1ZWFZzZENCbWRXNWpkR2x2YmlCamNtVmhkR1ZKYm5OMFlXNWpaU0FvWEc0Z0lHTnZiWEJ2Ym1WdWREb2dRMjl0Y0c5dVpXNTBMRnh1SUNCdmNIUnBiMjV6T2lCUGNIUnBiMjV6TEZ4dUlDQjJkV1U2SUVOdmJYQnZibVZ1ZEZ4dUtUb2dRMjl0Y0c5dVpXNTBJSHRjYmlBZ2FXWWdLRzl3ZEdsdmJuTXViVzlqYTNNcElIdGNiaUFnSUNCaFpHUk5iMk5yY3lodmNIUnBiMjV6TG0xdlkydHpMQ0IyZFdVcFhHNGdJSDFjYmx4dUlDQnBaaUFvS0dOdmJYQnZibVZ1ZEM1dmNIUnBiMjV6SUNZbUlHTnZiWEJ2Ym1WdWRDNXZjSFJwYjI1ekxtWjFibU4wYVc5dVlXd3BJSHg4SUdOdmJYQnZibVZ1ZEM1bWRXNWpkR2x2Ym1Gc0tTQjdYRzRnSUNBZ1kyOXRjRzl1Wlc1MElEMGdZM0psWVhSbFJuVnVZM1JwYjI1aGJFTnZiWEJ2Ym1WdWRDaGpiMjF3YjI1bGJuUXNJRzl3ZEdsdmJuTXBYRzRnSUgwZ1pXeHpaU0JwWmlBb2IzQjBhVzl1Y3k1amIyNTBaWGgwS1NCN1hHNGdJQ0FnZEdoeWIzZEZjbkp2Y2loY2JpQWdJQ0FnSUNkdGIzVnVkQzVqYjI1MFpYaDBJR05oYmlCdmJteDVJR0psSUhWelpXUWdkMmhsYmlCdGIzVnVkR2x1WnlCaElHWjFibU4wYVc5dVlXd2dZMjl0Y0c5dVpXNTBKMXh1SUNBZ0lDbGNiaUFnZlZ4dVhHNGdJR2xtSUNodmNIUnBiMjV6TG5CeWIzWnBaR1VwSUh0Y2JpQWdJQ0JoWkdSUWNtOTJhV1JsS0dOdmJYQnZibVZ1ZEN3Z2IzQjBhVzl1Y3k1d2NtOTJhV1JsTENCdmNIUnBiMjV6S1Z4dUlDQjlYRzVjYmlBZ2FXWWdLR052YlhCdmJtVnVkRTVsWldSelEyOXRjR2xzYVc1bktHTnZiWEJ2Ym1WdWRDa3BJSHRjYmlBZ0lDQmpiMjF3YVd4bFZHVnRjR3hoZEdVb1kyOXRjRzl1Wlc1MEtWeHVJQ0I5WEc1Y2JpQWdZV1JrUlhabGJuUk1iMmRuWlhJb2RuVmxLVnh1WEc0Z0lHTnZibk4wSUVOdmJuTjBjblZqZEc5eUlEMGdkblZsTG1WNGRHVnVaQ2hqYjIxd2IyNWxiblFwWEc1Y2JpQWdZMjl1YzNRZ2FXNXpkR0Z1WTJWUGNIUnBiMjV6SUQwZ2V5QXVMaTV2Y0hScGIyNXpJSDFjYmlBZ1pHVnNaWFJsYjNCMGFXOXVjeWhwYm5OMFlXNWpaVTl3ZEdsdmJuTXBYRzRnSUdsbUlDaHZjSFJwYjI1ekxuTjBkV0p6S1NCN1hHNGdJQ0FnYVc1emRHRnVZMlZQY0hScGIyNXpMbU52YlhCdmJtVnVkSE1nUFNCN1hHNGdJQ0FnSUNBdUxpNXBibk4wWVc1alpVOXdkR2x2Ym5NdVkyOXRjRzl1Wlc1MGN5eGNiaUFnSUNBZ0lDOHZJQ1JHYkc5M1NXZHViM0psWEc0Z0lDQWdJQ0F1TGk1amNtVmhkR1ZEYjIxd2IyNWxiblJUZEhWaWN5aGpiMjF3YjI1bGJuUXVZMjl0Y0c5dVpXNTBjeXdnYjNCMGFXOXVjeTV6ZEhWaWN5bGNiaUFnSUNCOVhHNGdJSDFjYmx4dUlDQmpiMjV6ZENCMmJTQTlJRzVsZHlCRGIyNXpkSEoxWTNSdmNpaHBibk4wWVc1alpVOXdkR2x2Ym5NcFhHNWNiaUFnWVdSa1FYUjBjbk1vZG0wc0lHOXdkR2x2Ym5NdVlYUjBjbk1wWEc0Z0lHRmtaRXhwYzNSbGJtVnljeWgyYlN3Z2IzQjBhVzl1Y3k1c2FYTjBaVzVsY25NcFhHNWNiaUFnYVdZZ0tHOXdkR2x2Ym5NdWMyTnZjR1ZrVTJ4dmRITXBJSHRjYmlBZ0lDQnBaaUFvZDJsdVpHOTNMbTVoZG1sbllYUnZjaTUxYzJWeVFXZGxiblF1YldGMFkyZ29MMUJvWVc1MGIyMUtVeTlwS1NrZ2UxeHVJQ0FnSUNBZ2RHaHliM2RGY25KdmNpZ25kR2hsSUhOamIzQmxaRk5zYjNSeklHOXdkR2x2YmlCa2IyVnpJRzV2ZENCemRYQndiM0owSUZCb1lXNTBiMjFLVXk0Z1VHeGxZWE5sSUhWelpTQlFkWEJ3WlhSbFpYSXNJRzl5SUhCaGMzTWdZU0JqYjIxd2IyNWxiblF1SnlsY2JpQWdJQ0I5WEc0Z0lDQWdZMjl1YzNRZ2RuVmxWbVZ5YzJsdmJpQTlJRTUxYldKbGNpaGdKSHRXZFdVdWRtVnljMmx2Ymk1emNHeHBkQ2duTGljcFd6QmRmUzRrZTFaMVpTNTJaWEp6YVc5dUxuTndiR2wwS0NjdUp5bGJNVjE5WUNsY2JpQWdJQ0JwWmlBb2RuVmxWbVZ5YzJsdmJpQStQU0F5TGpVcElIdGNiaUFnSUNBZ0lIWnRMaVJmZG5WbFZHVnpkRlYwYVd4elgzTmpiM0JsWkZOc2IzUnpJRDBnZTMxY2JpQWdJQ0FnSUhadExpUmZkblZsVkdWemRGVjBhV3h6WDNOc2IzUlRZMjl3WlhNZ1BTQjdmVnh1SUNBZ0lDQWdZMjl1YzNRZ2NtVnVaR1Z5VTJ4dmRDQTlJSFp0TGw5eVpXNWtaWEpRY205NGVTNWZkRnh1WEc0Z0lDQWdJQ0IyYlM1ZmNtVnVaR1Z5VUhKdmVIa3VYM1FnUFNCbWRXNWpkR2x2YmlBb2JtRnRaU3dnWm1WbFpHSmhZMnNzSUhCeWIzQnpMQ0JpYVc1a1QySnFaV04wS1NCN1hHNGdJQ0FnSUNBZ0lHTnZibk4wSUhOamIzQmxaRk5zYjNSR2JpQTlJSFp0TGlSZmRuVmxWR1Z6ZEZWMGFXeHpYM05qYjNCbFpGTnNiM1J6VzI1aGJXVmRYRzRnSUNBZ0lDQWdJR052Ym5OMElITnNiM1JUWTI5d1pTQTlJSFp0TGlSZmRuVmxWR1Z6ZEZWMGFXeHpYM05zYjNSVFkyOXdaWE5iYm1GdFpWMWNiaUFnSUNBZ0lDQWdhV1lnS0hOamIzQmxaRk5zYjNSR2Jpa2dlMXh1SUNBZ0lDQWdJQ0FnSUhCeWIzQnpJRDBnZXlBdUxpNWlhVzVrVDJKcVpXTjBMQ0F1TGk1d2NtOXdjeUI5WEc0Z0lDQWdJQ0FnSUNBZ1kyOXVjM1FnY0hKdmVIa2dQU0I3ZlZ4dUlDQWdJQ0FnSUNBZ0lHTnZibk4wSUdobGJIQmxjbk1nUFNCYkoxOWpKeXdnSjE5dkp5d2dKMTl1Snl3Z0oxOXpKeXdnSjE5c0p5d2dKMTkwSnl3Z0oxOXhKeXdnSjE5cEp5d2dKMTl0Snl3Z0oxOW1KeXdnSjE5ckp5d2dKMTlpSnl3Z0oxOTJKeXdnSjE5bEp5d2dKMTkxSnl3Z0oxOW5KMTFjYmlBZ0lDQWdJQ0FnSUNCb1pXeHdaWEp6TG1admNrVmhZMmdvS0d0bGVTa2dQVDRnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdjSEp2ZUhsYmEyVjVYU0E5SUhadExsOXlaVzVrWlhKUWNtOTRlVnRyWlhsZFhHNGdJQ0FnSUNBZ0lDQWdmU2xjYmlBZ0lDQWdJQ0FnSUNCd2NtOTRlVnR6Ykc5MFUyTnZjR1ZkSUQwZ2NISnZjSE5jYmlBZ0lDQWdJQ0FnSUNCeVpYUjFjbTRnYzJOdmNHVmtVMnh2ZEVadUxtTmhiR3dvY0hKdmVIa3BYRzRnSUNBZ0lDQWdJSDBnWld4elpTQjdYRzRnSUNBZ0lDQWdJQ0FnY21WMGRYSnVJSEpsYm1SbGNsTnNiM1F1WTJGc2JDaDJiUzVmY21WdVpHVnlVSEp2ZUhrc0lHNWhiV1VzSUdabFpXUmlZV05yTENCd2NtOXdjeXdnWW1sdVpFOWlhbVZqZENsY2JpQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ2ZWeHVYRzRnSUNBZ0lDQXZMeUFrUm14dmQwbG5ibTl5WlZ4dUlDQWdJQ0FnWVdSa1UyTnZjR1ZrVTJ4dmRITW9kbTBzSUc5d2RHbHZibk11YzJOdmNHVmtVMnh2ZEhNcFhHNGdJQ0FnZlNCbGJITmxJSHRjYmlBZ0lDQWdJSFJvY205M1JYSnliM0lvSjNSb1pTQnpZMjl3WldSVGJHOTBjeUJ2Y0hScGIyNGdhWE1nYjI1c2VTQnpkWEJ3YjNKMFpXUWdhVzRnZG5WbFFESXVOU3N1SnlsY2JpQWdJQ0I5WEc0Z0lIMWNibHh1SUNCcFppQW9iM0IwYVc5dWN5NXpiRzkwY3lrZ2UxeHVJQ0FnSUdGa1pGTnNiM1J6S0hadExDQnZjSFJwYjI1ekxuTnNiM1J6S1Z4dUlDQjlYRzVjYmlBZ2NtVjBkWEp1SUhadFhHNTlYRzRpTENJdkx5QkFabXh2ZDF4dVhHNWxlSEJ2Y25RZ1pHVm1ZWFZzZENCbWRXNWpkR2x2YmlCamNtVmhkR1ZGYkdWdFpXNTBJQ2dwT2lCSVZFMU1SV3hsYldWdWRDQjhJSFp2YVdRZ2UxeHVJQ0JwWmlBb1pHOWpkVzFsYm5RcElIdGNiaUFnSUNCamIyNXpkQ0JsYkdWdElEMGdaRzlqZFcxbGJuUXVZM0psWVhSbFJXeGxiV1Z1ZENnblpHbDJKeWxjYmx4dUlDQWdJR2xtSUNoa2IyTjFiV1Z1ZEM1aWIyUjVLU0I3WEc0Z0lDQWdJQ0JrYjJOMWJXVnVkQzVpYjJSNUxtRndjR1Z1WkVOb2FXeGtLR1ZzWlcwcFhHNGdJQ0FnZlZ4dUlDQWdJSEpsZEhWeWJpQmxiR1Z0WEc0Z0lIMWNibjFjYmlJc0lpOHFLbHh1SUNvZ1VtVnRiM1psY3lCaGJHd2dhMlY1TFhaaGJIVmxJR1Z1ZEhKcFpYTWdabkp2YlNCMGFHVWdiR2x6ZENCallXTm9aUzVjYmlBcVhHNGdLaUJBY0hKcGRtRjBaVnh1SUNvZ1FHNWhiV1VnWTJ4bFlYSmNiaUFxSUVCdFpXMWlaWEpQWmlCTWFYTjBRMkZqYUdWY2JpQXFMMXh1Wm5WdVkzUnBiMjRnYkdsemRFTmhZMmhsUTJ4bFlYSW9LU0I3WEc0Z0lIUm9hWE11WDE5a1lYUmhYMThnUFNCYlhUdGNiaUFnZEdocGN5NXphWHBsSUQwZ01EdGNibjFjYmx4dWJXOWtkV3hsTG1WNGNHOXlkSE1nUFNCc2FYTjBRMkZqYUdWRGJHVmhjanRjYmlJc0lpOHFLbHh1SUNvZ1VHVnlabTl5YlhNZ1lWeHVJQ29nVzJCVFlXMWxWbUZzZFdWYVpYSnZZRjBvYUhSMGNEb3ZMMlZqYldFdGFXNTBaWEp1WVhScGIyNWhiQzV2Y21jdlpXTnRZUzB5TmpJdk55NHdMeU56WldNdGMyRnRaWFpoYkhWbGVtVnlieWxjYmlBcUlHTnZiWEJoY21semIyNGdZbVYwZDJWbGJpQjBkMjhnZG1Gc2RXVnpJSFJ2SUdSbGRHVnliV2x1WlNCcFppQjBhR1Y1SUdGeVpTQmxjWFZwZG1Gc1pXNTBMbHh1SUNwY2JpQXFJRUJ6ZEdGMGFXTmNiaUFxSUVCdFpXMWlaWEpQWmlCZlhHNGdLaUJBYzJsdVkyVWdOQzR3TGpCY2JpQXFJRUJqWVhSbFoyOXllU0JNWVc1blhHNGdLaUJBY0dGeVlXMGdleXA5SUhaaGJIVmxJRlJvWlNCMllXeDFaU0IwYnlCamIyMXdZWEpsTGx4dUlDb2dRSEJoY21GdElIc3FmU0J2ZEdobGNpQlVhR1VnYjNSb1pYSWdkbUZzZFdVZ2RHOGdZMjl0Y0dGeVpTNWNiaUFxSUVCeVpYUjFjbTV6SUh0aWIyOXNaV0Z1ZlNCU1pYUjFjbTV6SUdCMGNuVmxZQ0JwWmlCMGFHVWdkbUZzZFdWeklHRnlaU0JsY1hWcGRtRnNaVzUwTENCbGJITmxJR0JtWVd4elpXQXVYRzRnS2lCQVpYaGhiWEJzWlZ4dUlDcGNiaUFxSUhaaGNpQnZZbXBsWTNRZ1BTQjdJQ2RoSnpvZ01TQjlPMXh1SUNvZ2RtRnlJRzkwYUdWeUlEMGdleUFuWVNjNklERWdmVHRjYmlBcVhHNGdLaUJmTG1WeEtHOWlhbVZqZEN3Z2IySnFaV04wS1R0Y2JpQXFJQzh2SUQwK0lIUnlkV1ZjYmlBcVhHNGdLaUJmTG1WeEtHOWlhbVZqZEN3Z2IzUm9aWElwTzF4dUlDb2dMeThnUFQ0Z1ptRnNjMlZjYmlBcVhHNGdLaUJmTG1WeEtDZGhKeXdnSjJFbktUdGNiaUFxSUM4dklEMCtJSFJ5ZFdWY2JpQXFYRzRnS2lCZkxtVnhLQ2RoSnl3Z1QySnFaV04wS0NkaEp5a3BPMXh1SUNvZ0x5OGdQVDRnWm1Gc2MyVmNiaUFxWEc0Z0tpQmZMbVZ4S0U1aFRpd2dUbUZPS1R0Y2JpQXFJQzh2SUQwK0lIUnlkV1ZjYmlBcUwxeHVablZ1WTNScGIyNGdaWEVvZG1Gc2RXVXNJRzkwYUdWeUtTQjdYRzRnSUhKbGRIVnliaUIyWVd4MVpTQTlQVDBnYjNSb1pYSWdmSHdnS0haaGJIVmxJQ0U5UFNCMllXeDFaU0FtSmlCdmRHaGxjaUFoUFQwZ2IzUm9aWElwTzF4dWZWeHVYRzV0YjJSMWJHVXVaWGh3YjNKMGN5QTlJR1Z4TzF4dUlpd2lkbUZ5SUdWeElEMGdjbVZ4ZFdseVpTZ25MaTlsY1NjcE8xeHVYRzR2S2lwY2JpQXFJRWRsZEhNZ2RHaGxJR2x1WkdWNElHRjBJSGRvYVdOb0lIUm9aU0JnYTJWNVlDQnBjeUJtYjNWdVpDQnBiaUJnWVhKeVlYbGdJRzltSUd0bGVTMTJZV3gxWlNCd1lXbHljeTVjYmlBcVhHNGdLaUJBY0hKcGRtRjBaVnh1SUNvZ1FIQmhjbUZ0SUh0QmNuSmhlWDBnWVhKeVlYa2dWR2hsSUdGeWNtRjVJSFJ2SUdsdWMzQmxZM1F1WEc0Z0tpQkFjR0Z5WVcwZ2V5cDlJR3RsZVNCVWFHVWdhMlY1SUhSdklITmxZWEpqYUNCbWIzSXVYRzRnS2lCQWNtVjBkWEp1Y3lCN2JuVnRZbVZ5ZlNCU1pYUjFjbTV6SUhSb1pTQnBibVJsZUNCdlppQjBhR1VnYldGMFkyaGxaQ0IyWVd4MVpTd2daV3h6WlNCZ0xURmdMbHh1SUNvdlhHNW1kVzVqZEdsdmJpQmhjM052WTBsdVpHVjRUMllvWVhKeVlYa3NJR3RsZVNrZ2UxeHVJQ0IyWVhJZ2JHVnVaM1JvSUQwZ1lYSnlZWGt1YkdWdVozUm9PMXh1SUNCM2FHbHNaU0FvYkdWdVozUm9MUzBwSUh0Y2JpQWdJQ0JwWmlBb1pYRW9ZWEp5WVhsYmJHVnVaM1JvWFZzd1hTd2dhMlY1S1NrZ2UxeHVJQ0FnSUNBZ2NtVjBkWEp1SUd4bGJtZDBhRHRjYmlBZ0lDQjlYRzRnSUgxY2JpQWdjbVYwZFhKdUlDMHhPMXh1ZlZ4dVhHNXRiMlIxYkdVdVpYaHdiM0owY3lBOUlHRnpjMjlqU1c1a1pYaFBaanRjYmlJc0luWmhjaUJoYzNOdlkwbHVaR1Y0VDJZZ1BTQnlaWEYxYVhKbEtDY3VMMTloYzNOdlkwbHVaR1Y0VDJZbktUdGNibHh1THlvcUlGVnpaV1FnWm05eUlHSjFhV3gwTFdsdUlHMWxkR2h2WkNCeVpXWmxjbVZ1WTJWekxpQXFMMXh1ZG1GeUlHRnljbUY1VUhKdmRHOGdQU0JCY25KaGVTNXdjbTkwYjNSNWNHVTdYRzVjYmk4cUtpQkNkV2xzZEMxcGJpQjJZV3gxWlNCeVpXWmxjbVZ1WTJWekxpQXFMMXh1ZG1GeUlITndiR2xqWlNBOUlHRnljbUY1VUhKdmRHOHVjM0JzYVdObE8xeHVYRzR2S2lwY2JpQXFJRkpsYlc5MlpYTWdZR3RsZVdBZ1lXNWtJR2wwY3lCMllXeDFaU0JtY205dElIUm9aU0JzYVhOMElHTmhZMmhsTGx4dUlDcGNiaUFxSUVCd2NtbDJZWFJsWEc0Z0tpQkFibUZ0WlNCa1pXeGxkR1ZjYmlBcUlFQnRaVzFpWlhKUFppQk1hWE4wUTJGamFHVmNiaUFxSUVCd1lYSmhiU0I3YzNSeWFXNW5mU0JyWlhrZ1ZHaGxJR3RsZVNCdlppQjBhR1VnZG1Gc2RXVWdkRzhnY21WdGIzWmxMbHh1SUNvZ1FISmxkSFZ5Ym5NZ2UySnZiMnhsWVc1OUlGSmxkSFZ5Ym5NZ1lIUnlkV1ZnSUdsbUlIUm9aU0JsYm5SeWVTQjNZWE1nY21WdGIzWmxaQ3dnWld4elpTQmdabUZzYzJWZ0xseHVJQ292WEc1bWRXNWpkR2x2YmlCc2FYTjBRMkZqYUdWRVpXeGxkR1VvYTJWNUtTQjdYRzRnSUhaaGNpQmtZWFJoSUQwZ2RHaHBjeTVmWDJSaGRHRmZYeXhjYmlBZ0lDQWdJR2x1WkdWNElEMGdZWE56YjJOSmJtUmxlRTltS0dSaGRHRXNJR3RsZVNrN1hHNWNiaUFnYVdZZ0tHbHVaR1Y0SUR3Z01Da2dlMXh1SUNBZ0lISmxkSFZ5YmlCbVlXeHpaVHRjYmlBZ2ZWeHVJQ0IyWVhJZ2JHRnpkRWx1WkdWNElEMGdaR0YwWVM1c1pXNW5kR2dnTFNBeE8xeHVJQ0JwWmlBb2FXNWtaWGdnUFQwZ2JHRnpkRWx1WkdWNEtTQjdYRzRnSUNBZ1pHRjBZUzV3YjNBb0tUdGNiaUFnZlNCbGJITmxJSHRjYmlBZ0lDQnpjR3hwWTJVdVkyRnNiQ2hrWVhSaExDQnBibVJsZUN3Z01TazdYRzRnSUgxY2JpQWdMUzEwYUdsekxuTnBlbVU3WEc0Z0lISmxkSFZ5YmlCMGNuVmxPMXh1ZlZ4dVhHNXRiMlIxYkdVdVpYaHdiM0owY3lBOUlHeHBjM1JEWVdOb1pVUmxiR1YwWlR0Y2JpSXNJblpoY2lCaGMzTnZZMGx1WkdWNFQyWWdQU0J5WlhGMWFYSmxLQ2N1TDE5aGMzTnZZMGx1WkdWNFQyWW5LVHRjYmx4dUx5b3FYRzRnS2lCSFpYUnpJSFJvWlNCc2FYTjBJR05oWTJobElIWmhiSFZsSUdadmNpQmdhMlY1WUM1Y2JpQXFYRzRnS2lCQWNISnBkbUYwWlZ4dUlDb2dRRzVoYldVZ1oyVjBYRzRnS2lCQWJXVnRZbVZ5VDJZZ1RHbHpkRU5oWTJobFhHNGdLaUJBY0dGeVlXMGdlM04wY21sdVozMGdhMlY1SUZSb1pTQnJaWGtnYjJZZ2RHaGxJSFpoYkhWbElIUnZJR2RsZEM1Y2JpQXFJRUJ5WlhSMWNtNXpJSHNxZlNCU1pYUjFjbTV6SUhSb1pTQmxiblJ5ZVNCMllXeDFaUzVjYmlBcUwxeHVablZ1WTNScGIyNGdiR2x6ZEVOaFkyaGxSMlYwS0d0bGVTa2dlMXh1SUNCMllYSWdaR0YwWVNBOUlIUm9hWE11WDE5a1lYUmhYMThzWEc0Z0lDQWdJQ0JwYm1SbGVDQTlJR0Z6YzI5alNXNWtaWGhQWmloa1lYUmhMQ0JyWlhrcE8xeHVYRzRnSUhKbGRIVnliaUJwYm1SbGVDQThJREFnUHlCMWJtUmxabWx1WldRZ09pQmtZWFJoVzJsdVpHVjRYVnN4WFR0Y2JuMWNibHh1Ylc5a2RXeGxMbVY0Y0c5eWRITWdQU0JzYVhOMFEyRmphR1ZIWlhRN1hHNGlMQ0oyWVhJZ1lYTnpiMk5KYm1SbGVFOW1JRDBnY21WeGRXbHlaU2duTGk5ZllYTnpiMk5KYm1SbGVFOW1KeWs3WEc1Y2JpOHFLbHh1SUNvZ1EyaGxZMnR6SUdsbUlHRWdiR2x6ZENCallXTm9aU0IyWVd4MVpTQm1iM0lnWUd0bGVXQWdaWGhwYzNSekxseHVJQ3BjYmlBcUlFQndjbWwyWVhSbFhHNGdLaUJBYm1GdFpTQm9ZWE5jYmlBcUlFQnRaVzFpWlhKUFppQk1hWE4wUTJGamFHVmNiaUFxSUVCd1lYSmhiU0I3YzNSeWFXNW5mU0JyWlhrZ1ZHaGxJR3RsZVNCdlppQjBhR1VnWlc1MGNua2dkRzhnWTJobFkyc3VYRzRnS2lCQWNtVjBkWEp1Y3lCN1ltOXZiR1ZoYm4wZ1VtVjBkWEp1Y3lCZ2RISjFaV0FnYVdZZ1lXNGdaVzUwY25rZ1ptOXlJR0JyWlhsZ0lHVjRhWE4wY3l3Z1pXeHpaU0JnWm1Gc2MyVmdMbHh1SUNvdlhHNW1kVzVqZEdsdmJpQnNhWE4wUTJGamFHVklZWE1vYTJWNUtTQjdYRzRnSUhKbGRIVnliaUJoYzNOdlkwbHVaR1Y0VDJZb2RHaHBjeTVmWDJSaGRHRmZYeXdnYTJWNUtTQStJQzB4TzF4dWZWeHVYRzV0YjJSMWJHVXVaWGh3YjNKMGN5QTlJR3hwYzNSRFlXTm9aVWhoY3p0Y2JpSXNJblpoY2lCaGMzTnZZMGx1WkdWNFQyWWdQU0J5WlhGMWFYSmxLQ2N1TDE5aGMzTnZZMGx1WkdWNFQyWW5LVHRjYmx4dUx5b3FYRzRnS2lCVFpYUnpJSFJvWlNCc2FYTjBJR05oWTJobElHQnJaWGxnSUhSdklHQjJZV3gxWldBdVhHNGdLbHh1SUNvZ1FIQnlhWFpoZEdWY2JpQXFJRUJ1WVcxbElITmxkRnh1SUNvZ1FHMWxiV0psY2s5bUlFeHBjM1JEWVdOb1pWeHVJQ29nUUhCaGNtRnRJSHR6ZEhKcGJtZDlJR3RsZVNCVWFHVWdhMlY1SUc5bUlIUm9aU0IyWVd4MVpTQjBieUJ6WlhRdVhHNGdLaUJBY0dGeVlXMGdleXA5SUhaaGJIVmxJRlJvWlNCMllXeDFaU0IwYnlCelpYUXVYRzRnS2lCQWNtVjBkWEp1Y3lCN1QySnFaV04wZlNCU1pYUjFjbTV6SUhSb1pTQnNhWE4wSUdOaFkyaGxJR2x1YzNSaGJtTmxMbHh1SUNvdlhHNW1kVzVqZEdsdmJpQnNhWE4wUTJGamFHVlRaWFFvYTJWNUxDQjJZV3gxWlNrZ2UxeHVJQ0IyWVhJZ1pHRjBZU0E5SUhSb2FYTXVYMTlrWVhSaFgxOHNYRzRnSUNBZ0lDQnBibVJsZUNBOUlHRnpjMjlqU1c1a1pYaFBaaWhrWVhSaExDQnJaWGtwTzF4dVhHNGdJR2xtSUNocGJtUmxlQ0E4SURBcElIdGNiaUFnSUNBckszUm9hWE11YzJsNlpUdGNiaUFnSUNCa1lYUmhMbkIxYzJnb1cydGxlU3dnZG1Gc2RXVmRLVHRjYmlBZ2ZTQmxiSE5sSUh0Y2JpQWdJQ0JrWVhSaFcybHVaR1Y0WFZzeFhTQTlJSFpoYkhWbE8xeHVJQ0I5WEc0Z0lISmxkSFZ5YmlCMGFHbHpPMXh1ZlZ4dVhHNXRiMlIxYkdVdVpYaHdiM0owY3lBOUlHeHBjM1JEWVdOb1pWTmxkRHRjYmlJc0luWmhjaUJzYVhOMFEyRmphR1ZEYkdWaGNpQTlJSEpsY1hWcGNtVW9KeTR2WDJ4cGMzUkRZV05vWlVOc1pXRnlKeWtzWEc0Z0lDQWdiR2x6ZEVOaFkyaGxSR1ZzWlhSbElEMGdjbVZ4ZFdseVpTZ25MaTlmYkdsemRFTmhZMmhsUkdWc1pYUmxKeWtzWEc0Z0lDQWdiR2x6ZEVOaFkyaGxSMlYwSUQwZ2NtVnhkV2x5WlNnbkxpOWZiR2x6ZEVOaFkyaGxSMlYwSnlrc1hHNGdJQ0FnYkdsemRFTmhZMmhsU0dGeklEMGdjbVZ4ZFdseVpTZ25MaTlmYkdsemRFTmhZMmhsU0dGekp5a3NYRzRnSUNBZ2JHbHpkRU5oWTJobFUyVjBJRDBnY21WeGRXbHlaU2duTGk5ZmJHbHpkRU5oWTJobFUyVjBKeWs3WEc1Y2JpOHFLbHh1SUNvZ1EzSmxZWFJsY3lCaGJpQnNhWE4wSUdOaFkyaGxJRzlpYW1WamRDNWNiaUFxWEc0Z0tpQkFjSEpwZG1GMFpWeHVJQ29nUUdOdmJuTjBjblZqZEc5eVhHNGdLaUJBY0dGeVlXMGdlMEZ5Y21GNWZTQmJaVzUwY21sbGMxMGdWR2hsSUd0bGVTMTJZV3gxWlNCd1lXbHljeUIwYnlCallXTm9aUzVjYmlBcUwxeHVablZ1WTNScGIyNGdUR2x6ZEVOaFkyaGxLR1Z1ZEhKcFpYTXBJSHRjYmlBZ2RtRnlJR2x1WkdWNElEMGdMVEVzWEc0Z0lDQWdJQ0JzWlc1bmRHZ2dQU0JsYm5SeWFXVnpJRDA5SUc1MWJHd2dQeUF3SURvZ1pXNTBjbWxsY3k1c1pXNW5kR2c3WEc1Y2JpQWdkR2hwY3k1amJHVmhjaWdwTzF4dUlDQjNhR2xzWlNBb0t5dHBibVJsZUNBOElHeGxibWQwYUNrZ2UxeHVJQ0FnSUhaaGNpQmxiblJ5ZVNBOUlHVnVkSEpwWlhOYmFXNWtaWGhkTzF4dUlDQWdJSFJvYVhNdWMyVjBLR1Z1ZEhKNVd6QmRMQ0JsYm5SeWVWc3hYU2s3WEc0Z0lIMWNibjFjYmx4dUx5OGdRV1JrSUcxbGRHaHZaSE1nZEc4Z1lFeHBjM1JEWVdOb1pXQXVYRzVNYVhOMFEyRmphR1V1Y0hKdmRHOTBlWEJsTG1Oc1pXRnlJRDBnYkdsemRFTmhZMmhsUTJ4bFlYSTdYRzVNYVhOMFEyRmphR1V1Y0hKdmRHOTBlWEJsV3lka1pXeGxkR1VuWFNBOUlHeHBjM1JEWVdOb1pVUmxiR1YwWlR0Y2JreHBjM1JEWVdOb1pTNXdjbTkwYjNSNWNHVXVaMlYwSUQwZ2JHbHpkRU5oWTJobFIyVjBPMXh1VEdsemRFTmhZMmhsTG5CeWIzUnZkSGx3WlM1b1lYTWdQU0JzYVhOMFEyRmphR1ZJWVhNN1hHNU1hWE4wUTJGamFHVXVjSEp2ZEc5MGVYQmxMbk5sZENBOUlHeHBjM1JEWVdOb1pWTmxkRHRjYmx4dWJXOWtkV3hsTG1WNGNHOXlkSE1nUFNCTWFYTjBRMkZqYUdVN1hHNGlMQ0oyWVhJZ1RHbHpkRU5oWTJobElEMGdjbVZ4ZFdseVpTZ25MaTlmVEdsemRFTmhZMmhsSnlrN1hHNWNiaThxS2x4dUlDb2dVbVZ0YjNabGN5QmhiR3dnYTJWNUxYWmhiSFZsSUdWdWRISnBaWE1nWm5KdmJTQjBhR1VnYzNSaFkyc3VYRzRnS2x4dUlDb2dRSEJ5YVhaaGRHVmNiaUFxSUVCdVlXMWxJR05zWldGeVhHNGdLaUJBYldWdFltVnlUMllnVTNSaFkydGNiaUFxTDF4dVpuVnVZM1JwYjI0Z2MzUmhZMnREYkdWaGNpZ3BJSHRjYmlBZ2RHaHBjeTVmWDJSaGRHRmZYeUE5SUc1bGR5Qk1hWE4wUTJGamFHVTdYRzRnSUhSb2FYTXVjMmw2WlNBOUlEQTdYRzU5WEc1Y2JtMXZaSFZzWlM1bGVIQnZjblJ6SUQwZ2MzUmhZMnREYkdWaGNqdGNiaUlzSWk4cUtseHVJQ29nVW1WdGIzWmxjeUJnYTJWNVlDQmhibVFnYVhSeklIWmhiSFZsSUdaeWIyMGdkR2hsSUhOMFlXTnJMbHh1SUNwY2JpQXFJRUJ3Y21sMllYUmxYRzRnS2lCQWJtRnRaU0JrWld4bGRHVmNiaUFxSUVCdFpXMWlaWEpQWmlCVGRHRmphMXh1SUNvZ1FIQmhjbUZ0SUh0emRISnBibWQ5SUd0bGVTQlVhR1VnYTJWNUlHOW1JSFJvWlNCMllXeDFaU0IwYnlCeVpXMXZkbVV1WEc0Z0tpQkFjbVYwZFhKdWN5QjdZbTl2YkdWaGJuMGdVbVYwZFhKdWN5QmdkSEoxWldBZ2FXWWdkR2hsSUdWdWRISjVJSGRoY3lCeVpXMXZkbVZrTENCbGJITmxJR0JtWVd4elpXQXVYRzRnS2k5Y2JtWjFibU4wYVc5dUlITjBZV05yUkdWc1pYUmxLR3RsZVNrZ2UxeHVJQ0IyWVhJZ1pHRjBZU0E5SUhSb2FYTXVYMTlrWVhSaFgxOHNYRzRnSUNBZ0lDQnlaWE4xYkhRZ1BTQmtZWFJoV3lka1pXeGxkR1VuWFNoclpYa3BPMXh1WEc0Z0lIUm9hWE11YzJsNlpTQTlJR1JoZEdFdWMybDZaVHRjYmlBZ2NtVjBkWEp1SUhKbGMzVnNkRHRjYm4xY2JseHViVzlrZFd4bExtVjRjRzl5ZEhNZ1BTQnpkR0ZqYTBSbGJHVjBaVHRjYmlJc0lpOHFLbHh1SUNvZ1IyVjBjeUIwYUdVZ2MzUmhZMnNnZG1Gc2RXVWdabTl5SUdCclpYbGdMbHh1SUNwY2JpQXFJRUJ3Y21sMllYUmxYRzRnS2lCQWJtRnRaU0JuWlhSY2JpQXFJRUJ0WlcxaVpYSlBaaUJUZEdGamExeHVJQ29nUUhCaGNtRnRJSHR6ZEhKcGJtZDlJR3RsZVNCVWFHVWdhMlY1SUc5bUlIUm9aU0IyWVd4MVpTQjBieUJuWlhRdVhHNGdLaUJBY21WMGRYSnVjeUI3S24wZ1VtVjBkWEp1Y3lCMGFHVWdaVzUwY25rZ2RtRnNkV1V1WEc0Z0tpOWNibVoxYm1OMGFXOXVJSE4wWVdOclIyVjBLR3RsZVNrZ2UxeHVJQ0J5WlhSMWNtNGdkR2hwY3k1ZlgyUmhkR0ZmWHk1blpYUW9hMlY1S1R0Y2JuMWNibHh1Ylc5a2RXeGxMbVY0Y0c5eWRITWdQU0J6ZEdGamEwZGxkRHRjYmlJc0lpOHFLbHh1SUNvZ1EyaGxZMnR6SUdsbUlHRWdjM1JoWTJzZ2RtRnNkV1VnWm05eUlHQnJaWGxnSUdWNGFYTjBjeTVjYmlBcVhHNGdLaUJBY0hKcGRtRjBaVnh1SUNvZ1FHNWhiV1VnYUdGelhHNGdLaUJBYldWdFltVnlUMllnVTNSaFkydGNiaUFxSUVCd1lYSmhiU0I3YzNSeWFXNW5mU0JyWlhrZ1ZHaGxJR3RsZVNCdlppQjBhR1VnWlc1MGNua2dkRzhnWTJobFkyc3VYRzRnS2lCQWNtVjBkWEp1Y3lCN1ltOXZiR1ZoYm4wZ1VtVjBkWEp1Y3lCZ2RISjFaV0FnYVdZZ1lXNGdaVzUwY25rZ1ptOXlJR0JyWlhsZ0lHVjRhWE4wY3l3Z1pXeHpaU0JnWm1Gc2MyVmdMbHh1SUNvdlhHNW1kVzVqZEdsdmJpQnpkR0ZqYTBoaGN5aHJaWGtwSUh0Y2JpQWdjbVYwZFhKdUlIUm9hWE11WDE5a1lYUmhYMTh1YUdGektHdGxlU2s3WEc1OVhHNWNibTF2WkhWc1pTNWxlSEJ2Y25SeklEMGdjM1JoWTJ0SVlYTTdYRzRpTENJdktpb2dSR1YwWldOMElHWnlaV1VnZG1GeWFXRmliR1VnWUdkc2IySmhiR0FnWm5KdmJTQk9iMlJsTG1wekxpQXFMMXh1ZG1GeUlHWnlaV1ZIYkc5aVlXd2dQU0IwZVhCbGIyWWdaMnh2WW1Gc0lEMDlJQ2R2WW1wbFkzUW5JQ1ltSUdkc2IySmhiQ0FtSmlCbmJHOWlZV3d1VDJKcVpXTjBJRDA5UFNCUFltcGxZM1FnSmlZZ1oyeHZZbUZzTzF4dVhHNXRiMlIxYkdVdVpYaHdiM0owY3lBOUlHWnlaV1ZIYkc5aVlXdzdYRzRpTENKMllYSWdabkpsWlVkc2IySmhiQ0E5SUhKbGNYVnBjbVVvSnk0dlgyWnlaV1ZIYkc5aVlXd25LVHRjYmx4dUx5b3FJRVJsZEdWamRDQm1jbVZsSUhaaGNtbGhZbXhsSUdCelpXeG1ZQzRnS2k5Y2JuWmhjaUJtY21WbFUyVnNaaUE5SUhSNWNHVnZaaUJ6Wld4bUlEMDlJQ2R2WW1wbFkzUW5JQ1ltSUhObGJHWWdKaVlnYzJWc1ppNVBZbXBsWTNRZ1BUMDlJRTlpYW1WamRDQW1KaUJ6Wld4bU8xeHVYRzR2S2lvZ1ZYTmxaQ0JoY3lCaElISmxabVZ5Wlc1alpTQjBieUIwYUdVZ1oyeHZZbUZzSUc5aWFtVmpkQzRnS2k5Y2JuWmhjaUJ5YjI5MElEMGdabkpsWlVkc2IySmhiQ0I4ZkNCbWNtVmxVMlZzWmlCOGZDQkdkVzVqZEdsdmJpZ25jbVYwZFhKdUlIUm9hWE1uS1NncE8xeHVYRzV0YjJSMWJHVXVaWGh3YjNKMGN5QTlJSEp2YjNRN1hHNGlMQ0oyWVhJZ2NtOXZkQ0E5SUhKbGNYVnBjbVVvSnk0dlgzSnZiM1FuS1R0Y2JseHVMeW9xSUVKMWFXeDBMV2x1SUhaaGJIVmxJSEpsWm1WeVpXNWpaWE11SUNvdlhHNTJZWElnVTNsdFltOXNJRDBnY205dmRDNVRlVzFpYjJ3N1hHNWNibTF2WkhWc1pTNWxlSEJ2Y25SeklEMGdVM2x0WW05c08xeHVJaXdpZG1GeUlGTjViV0p2YkNBOUlISmxjWFZwY21Vb0p5NHZYMU41YldKdmJDY3BPMXh1WEc0dktpb2dWWE5sWkNCbWIzSWdZblZwYkhRdGFXNGdiV1YwYUc5a0lISmxabVZ5Wlc1alpYTXVJQ292WEc1MllYSWdiMkpxWldOMFVISnZkRzhnUFNCUFltcGxZM1F1Y0hKdmRHOTBlWEJsTzF4dVhHNHZLaW9nVlhObFpDQjBieUJqYUdWamF5QnZZbXBsWTNSeklHWnZjaUJ2ZDI0Z2NISnZjR1Z5ZEdsbGN5NGdLaTljYm5aaGNpQm9ZWE5QZDI1UWNtOXdaWEowZVNBOUlHOWlhbVZqZEZCeWIzUnZMbWhoYzA5M2JsQnliM0JsY25SNU8xeHVYRzR2S2lwY2JpQXFJRlZ6WldRZ2RHOGdjbVZ6YjJ4MlpTQjBhR1ZjYmlBcUlGdGdkRzlUZEhKcGJtZFVZV2RnWFNob2RIUndPaTh2WldOdFlTMXBiblJsY201aGRHbHZibUZzTG05eVp5OWxZMjFoTFRJMk1pODNMakF2STNObFl5MXZZbXBsWTNRdWNISnZkRzkwZVhCbExuUnZjM1J5YVc1bktWeHVJQ29nYjJZZ2RtRnNkV1Z6TGx4dUlDb3ZYRzUyWVhJZ2JtRjBhWFpsVDJKcVpXTjBWRzlUZEhKcGJtY2dQU0J2WW1wbFkzUlFjbTkwYnk1MGIxTjBjbWx1Wnp0Y2JseHVMeW9xSUVKMWFXeDBMV2x1SUhaaGJIVmxJSEpsWm1WeVpXNWpaWE11SUNvdlhHNTJZWElnYzNsdFZHOVRkSEpwYm1kVVlXY2dQU0JUZVcxaWIyd2dQeUJUZVcxaWIyd3VkRzlUZEhKcGJtZFVZV2NnT2lCMWJtUmxabWx1WldRN1hHNWNiaThxS2x4dUlDb2dRU0J6Y0dWamFXRnNhWHBsWkNCMlpYSnphVzl1SUc5bUlHQmlZWE5sUjJWMFZHRm5ZQ0IzYUdsamFDQnBaMjV2Y21WeklHQlRlVzFpYjJ3dWRHOVRkSEpwYm1kVVlXZGdJSFpoYkhWbGN5NWNiaUFxWEc0Z0tpQkFjSEpwZG1GMFpWeHVJQ29nUUhCaGNtRnRJSHNxZlNCMllXeDFaU0JVYUdVZ2RtRnNkV1VnZEc4Z2NYVmxjbmt1WEc0Z0tpQkFjbVYwZFhKdWN5QjdjM1J5YVc1bmZTQlNaWFIxY201eklIUm9aU0J5WVhjZ1lIUnZVM1J5YVc1blZHRm5ZQzVjYmlBcUwxeHVablZ1WTNScGIyNGdaMlYwVW1GM1ZHRm5LSFpoYkhWbEtTQjdYRzRnSUhaaGNpQnBjMDkzYmlBOUlHaGhjMDkzYmxCeWIzQmxjblI1TG1OaGJHd29kbUZzZFdVc0lITjViVlJ2VTNSeWFXNW5WR0ZuS1N4Y2JpQWdJQ0FnSUhSaFp5QTlJSFpoYkhWbFczTjViVlJ2VTNSeWFXNW5WR0ZuWFR0Y2JseHVJQ0IwY25rZ2UxeHVJQ0FnSUhaaGJIVmxXM041YlZSdlUzUnlhVzVuVkdGblhTQTlJSFZ1WkdWbWFXNWxaRHRjYmlBZ0lDQjJZWElnZFc1dFlYTnJaV1FnUFNCMGNuVmxPMXh1SUNCOUlHTmhkR05vSUNobEtTQjdmVnh1WEc0Z0lIWmhjaUJ5WlhOMWJIUWdQU0J1WVhScGRtVlBZbXBsWTNSVWIxTjBjbWx1Wnk1allXeHNLSFpoYkhWbEtUdGNiaUFnYVdZZ0tIVnViV0Z6YTJWa0tTQjdYRzRnSUNBZ2FXWWdLR2x6VDNkdUtTQjdYRzRnSUNBZ0lDQjJZV3gxWlZ0emVXMVViMU4wY21sdVoxUmhaMTBnUFNCMFlXYzdYRzRnSUNBZ2ZTQmxiSE5sSUh0Y2JpQWdJQ0FnSUdSbGJHVjBaU0IyWVd4MVpWdHplVzFVYjFOMGNtbHVaMVJoWjEwN1hHNGdJQ0FnZlZ4dUlDQjlYRzRnSUhKbGRIVnliaUJ5WlhOMWJIUTdYRzU5WEc1Y2JtMXZaSFZzWlM1bGVIQnZjblJ6SUQwZ1oyVjBVbUYzVkdGbk8xeHVJaXdpTHlvcUlGVnpaV1FnWm05eUlHSjFhV3gwTFdsdUlHMWxkR2h2WkNCeVpXWmxjbVZ1WTJWekxpQXFMMXh1ZG1GeUlHOWlhbVZqZEZCeWIzUnZJRDBnVDJKcVpXTjBMbkJ5YjNSdmRIbHdaVHRjYmx4dUx5b3FYRzRnS2lCVmMyVmtJSFJ2SUhKbGMyOXNkbVVnZEdobFhHNGdLaUJiWUhSdlUzUnlhVzVuVkdGbllGMG9hSFIwY0RvdkwyVmpiV0V0YVc1MFpYSnVZWFJwYjI1aGJDNXZjbWN2WldOdFlTMHlOakl2Tnk0d0x5TnpaV010YjJKcVpXTjBMbkJ5YjNSdmRIbHdaUzUwYjNOMGNtbHVaeWxjYmlBcUlHOW1JSFpoYkhWbGN5NWNiaUFxTDF4dWRtRnlJRzVoZEdsMlpVOWlhbVZqZEZSdlUzUnlhVzVuSUQwZ2IySnFaV04wVUhKdmRHOHVkRzlUZEhKcGJtYzdYRzVjYmk4cUtseHVJQ29nUTI5dWRtVnlkSE1nWUhaaGJIVmxZQ0IwYnlCaElITjBjbWx1WnlCMWMybHVaeUJnVDJKcVpXTjBMbkJ5YjNSdmRIbHdaUzUwYjFOMGNtbHVaMkF1WEc0Z0tseHVJQ29nUUhCeWFYWmhkR1ZjYmlBcUlFQndZWEpoYlNCN0tuMGdkbUZzZFdVZ1ZHaGxJSFpoYkhWbElIUnZJR052Ym5abGNuUXVYRzRnS2lCQWNtVjBkWEp1Y3lCN2MzUnlhVzVuZlNCU1pYUjFjbTV6SUhSb1pTQmpiMjUyWlhKMFpXUWdjM1J5YVc1bkxseHVJQ292WEc1bWRXNWpkR2x2YmlCdlltcGxZM1JVYjFOMGNtbHVaeWgyWVd4MVpTa2dlMXh1SUNCeVpYUjFjbTRnYm1GMGFYWmxUMkpxWldOMFZHOVRkSEpwYm1jdVkyRnNiQ2gyWVd4MVpTazdYRzU5WEc1Y2JtMXZaSFZzWlM1bGVIQnZjblJ6SUQwZ2IySnFaV04wVkc5VGRISnBibWM3WEc0aUxDSjJZWElnVTNsdFltOXNJRDBnY21WeGRXbHlaU2duTGk5ZlUzbHRZbTlzSnlrc1hHNGdJQ0FnWjJWMFVtRjNWR0ZuSUQwZ2NtVnhkV2x5WlNnbkxpOWZaMlYwVW1GM1ZHRm5KeWtzWEc0Z0lDQWdiMkpxWldOMFZHOVRkSEpwYm1jZ1BTQnlaWEYxYVhKbEtDY3VMMTl2WW1wbFkzUlViMU4wY21sdVp5Y3BPMXh1WEc0dktpb2dZRTlpYW1WamRDTjBiMU4wY21sdVoyQWdjbVZ6ZFd4MElISmxabVZ5Wlc1alpYTXVJQ292WEc1MllYSWdiblZzYkZSaFp5QTlJQ2RiYjJKcVpXTjBJRTUxYkd4ZEp5eGNiaUFnSUNCMWJtUmxabWx1WldSVVlXY2dQU0FuVzI5aWFtVmpkQ0JWYm1SbFptbHVaV1JkSnp0Y2JseHVMeW9xSUVKMWFXeDBMV2x1SUhaaGJIVmxJSEpsWm1WeVpXNWpaWE11SUNvdlhHNTJZWElnYzNsdFZHOVRkSEpwYm1kVVlXY2dQU0JUZVcxaWIyd2dQeUJUZVcxaWIyd3VkRzlUZEhKcGJtZFVZV2NnT2lCMWJtUmxabWx1WldRN1hHNWNiaThxS2x4dUlDb2dWR2hsSUdKaGMyVWdhVzF3YkdWdFpXNTBZWFJwYjI0Z2IyWWdZR2RsZEZSaFoyQWdkMmwwYUc5MWRDQm1ZV3hzWW1GamEzTWdabTl5SUdKMVoyZDVJR1Z1ZG1seWIyNXRaVzUwY3k1Y2JpQXFYRzRnS2lCQWNISnBkbUYwWlZ4dUlDb2dRSEJoY21GdElIc3FmU0IyWVd4MVpTQlVhR1VnZG1Gc2RXVWdkRzhnY1hWbGNua3VYRzRnS2lCQWNtVjBkWEp1Y3lCN2MzUnlhVzVuZlNCU1pYUjFjbTV6SUhSb1pTQmdkRzlUZEhKcGJtZFVZV2RnTGx4dUlDb3ZYRzVtZFc1amRHbHZiaUJpWVhObFIyVjBWR0ZuS0haaGJIVmxLU0I3WEc0Z0lHbG1JQ2gyWVd4MVpTQTlQU0J1ZFd4c0tTQjdYRzRnSUNBZ2NtVjBkWEp1SUhaaGJIVmxJRDA5UFNCMWJtUmxabWx1WldRZ1B5QjFibVJsWm1sdVpXUlVZV2NnT2lCdWRXeHNWR0ZuTzF4dUlDQjlYRzRnSUhKbGRIVnliaUFvYzNsdFZHOVRkSEpwYm1kVVlXY2dKaVlnYzNsdFZHOVRkSEpwYm1kVVlXY2dhVzRnVDJKcVpXTjBLSFpoYkhWbEtTbGNiaUFnSUNBL0lHZGxkRkpoZDFSaFp5aDJZV3gxWlNsY2JpQWdJQ0E2SUc5aWFtVmpkRlJ2VTNSeWFXNW5LSFpoYkhWbEtUdGNibjFjYmx4dWJXOWtkV3hsTG1WNGNHOXlkSE1nUFNCaVlYTmxSMlYwVkdGbk8xeHVJaXdpTHlvcVhHNGdLaUJEYUdWamEzTWdhV1lnWUhaaGJIVmxZQ0JwY3lCMGFHVmNiaUFxSUZ0c1lXNW5kV0ZuWlNCMGVYQmxYU2hvZEhSd09pOHZkM2QzTG1WamJXRXRhVzUwWlhKdVlYUnBiMjVoYkM1dmNtY3ZaV050WVMweU5qSXZOeTR3THlOelpXTXRaV050WVhOamNtbHdkQzFzWVc1bmRXRm5aUzEwZVhCbGN5bGNiaUFxSUc5bUlHQlBZbXBsWTNSZ0xpQW9aUzVuTGlCaGNuSmhlWE1zSUdaMWJtTjBhVzl1Y3l3Z2IySnFaV04wY3l3Z2NtVm5aWGhsY3l3Z1lHNWxkeUJPZFcxaVpYSW9NQ2xnTENCaGJtUWdZRzVsZHlCVGRISnBibWNvSnljcFlDbGNiaUFxWEc0Z0tpQkFjM1JoZEdsalhHNGdLaUJBYldWdFltVnlUMllnWDF4dUlDb2dRSE5wYm1ObElEQXVNUzR3WEc0Z0tpQkFZMkYwWldkdmNua2dUR0Z1WjF4dUlDb2dRSEJoY21GdElIc3FmU0IyWVd4MVpTQlVhR1VnZG1Gc2RXVWdkRzhnWTJobFkyc3VYRzRnS2lCQWNtVjBkWEp1Y3lCN1ltOXZiR1ZoYm4wZ1VtVjBkWEp1Y3lCZ2RISjFaV0FnYVdZZ1lIWmhiSFZsWUNCcGN5QmhiaUJ2WW1wbFkzUXNJR1ZzYzJVZ1lHWmhiSE5sWUM1Y2JpQXFJRUJsZUdGdGNHeGxYRzRnS2x4dUlDb2dYeTVwYzA5aWFtVmpkQ2g3ZlNrN1hHNGdLaUF2THlBOVBpQjBjblZsWEc0Z0tseHVJQ29nWHk1cGMwOWlhbVZqZENoYk1Td2dNaXdnTTEwcE8xeHVJQ29nTHk4Z1BUNGdkSEoxWlZ4dUlDcGNiaUFxSUY4dWFYTlBZbXBsWTNRb1h5NXViMjl3S1R0Y2JpQXFJQzh2SUQwK0lIUnlkV1ZjYmlBcVhHNGdLaUJmTG1selQySnFaV04wS0c1MWJHd3BPMXh1SUNvZ0x5OGdQVDRnWm1Gc2MyVmNiaUFxTDF4dVpuVnVZM1JwYjI0Z2FYTlBZbXBsWTNRb2RtRnNkV1VwSUh0Y2JpQWdkbUZ5SUhSNWNHVWdQU0IwZVhCbGIyWWdkbUZzZFdVN1hHNGdJSEpsZEhWeWJpQjJZV3gxWlNBaFBTQnVkV3hzSUNZbUlDaDBlWEJsSUQwOUlDZHZZbXBsWTNRbklIeDhJSFI1Y0dVZ1BUMGdKMloxYm1OMGFXOXVKeWs3WEc1OVhHNWNibTF2WkhWc1pTNWxlSEJ2Y25SeklEMGdhWE5QWW1wbFkzUTdYRzRpTENKMllYSWdZbUZ6WlVkbGRGUmhaeUE5SUhKbGNYVnBjbVVvSnk0dlgySmhjMlZIWlhSVVlXY25LU3hjYmlBZ0lDQnBjMDlpYW1WamRDQTlJSEpsY1hWcGNtVW9KeTR2YVhOUFltcGxZM1FuS1R0Y2JseHVMeW9xSUdCUFltcGxZM1FqZEc5VGRISnBibWRnSUhKbGMzVnNkQ0J5WldabGNtVnVZMlZ6TGlBcUwxeHVkbUZ5SUdGemVXNWpWR0ZuSUQwZ0oxdHZZbXBsWTNRZ1FYTjVibU5HZFc1amRHbHZibDBuTEZ4dUlDQWdJR1oxYm1OVVlXY2dQU0FuVzI5aWFtVmpkQ0JHZFc1amRHbHZibDBuTEZ4dUlDQWdJR2RsYmxSaFp5QTlJQ2RiYjJKcVpXTjBJRWRsYm1WeVlYUnZja1oxYm1OMGFXOXVYU2NzWEc0Z0lDQWdjSEp2ZUhsVVlXY2dQU0FuVzI5aWFtVmpkQ0JRY205NGVWMG5PMXh1WEc0dktpcGNiaUFxSUVOb1pXTnJjeUJwWmlCZ2RtRnNkV1ZnSUdseklHTnNZWE56YVdacFpXUWdZWE1nWVNCZ1JuVnVZM1JwYjI1Z0lHOWlhbVZqZEM1Y2JpQXFYRzRnS2lCQWMzUmhkR2xqWEc0Z0tpQkFiV1Z0WW1WeVQyWWdYMXh1SUNvZ1FITnBibU5sSURBdU1TNHdYRzRnS2lCQVkyRjBaV2R2Y25rZ1RHRnVaMXh1SUNvZ1FIQmhjbUZ0SUhzcWZTQjJZV3gxWlNCVWFHVWdkbUZzZFdVZ2RHOGdZMmhsWTJzdVhHNGdLaUJBY21WMGRYSnVjeUI3WW05dmJHVmhibjBnVW1WMGRYSnVjeUJnZEhKMVpXQWdhV1lnWUhaaGJIVmxZQ0JwY3lCaElHWjFibU4wYVc5dUxDQmxiSE5sSUdCbVlXeHpaV0F1WEc0Z0tpQkFaWGhoYlhCc1pWeHVJQ3BjYmlBcUlGOHVhWE5HZFc1amRHbHZiaWhmS1R0Y2JpQXFJQzh2SUQwK0lIUnlkV1ZjYmlBcVhHNGdLaUJmTG1selJuVnVZM1JwYjI0b0wyRmlZeThwTzF4dUlDb2dMeThnUFQ0Z1ptRnNjMlZjYmlBcUwxeHVablZ1WTNScGIyNGdhWE5HZFc1amRHbHZiaWgyWVd4MVpTa2dlMXh1SUNCcFppQW9JV2x6VDJKcVpXTjBLSFpoYkhWbEtTa2dlMXh1SUNBZ0lISmxkSFZ5YmlCbVlXeHpaVHRjYmlBZ2ZWeHVJQ0F2THlCVWFHVWdkWE5sSUc5bUlHQlBZbXBsWTNRamRHOVRkSEpwYm1kZ0lHRjJiMmxrY3lCcGMzTjFaWE1nZDJsMGFDQjBhR1VnWUhSNWNHVnZabUFnYjNCbGNtRjBiM0pjYmlBZ0x5OGdhVzRnVTJGbVlYSnBJRGtnZDJocFkyZ2djbVYwZFhKdWN5QW5iMkpxWldOMEp5Qm1iM0lnZEhsd1pXUWdZWEp5WVhseklHRnVaQ0J2ZEdobGNpQmpiMjV6ZEhKMVkzUnZjbk11WEc0Z0lIWmhjaUIwWVdjZ1BTQmlZWE5sUjJWMFZHRm5LSFpoYkhWbEtUdGNiaUFnY21WMGRYSnVJSFJoWnlBOVBTQm1kVzVqVkdGbklIeDhJSFJoWnlBOVBTQm5aVzVVWVdjZ2ZId2dkR0ZuSUQwOUlHRnplVzVqVkdGbklIeDhJSFJoWnlBOVBTQndjbTk0ZVZSaFp6dGNibjFjYmx4dWJXOWtkV3hsTG1WNGNHOXlkSE1nUFNCcGMwWjFibU4wYVc5dU8xeHVJaXdpZG1GeUlISnZiM1FnUFNCeVpYRjFhWEpsS0NjdUwxOXliMjkwSnlrN1hHNWNiaThxS2lCVmMyVmtJSFJ2SUdSbGRHVmpkQ0J2ZG1WeWNtVmhZMmhwYm1jZ1kyOXlaUzFxY3lCemFHbHRjeTRnS2k5Y2JuWmhjaUJqYjNKbFNuTkVZWFJoSUQwZ2NtOXZkRnNuWDE5amIzSmxMV3B6WDNOb1lYSmxaRjlmSjEwN1hHNWNibTF2WkhWc1pTNWxlSEJ2Y25SeklEMGdZMjl5WlVwelJHRjBZVHRjYmlJc0luWmhjaUJqYjNKbFNuTkVZWFJoSUQwZ2NtVnhkV2x5WlNnbkxpOWZZMjl5WlVwelJHRjBZU2NwTzF4dVhHNHZLaW9nVlhObFpDQjBieUJrWlhSbFkzUWdiV1YwYUc5a2N5QnRZWE54ZFdWeVlXUnBibWNnWVhNZ2JtRjBhWFpsTGlBcUwxeHVkbUZ5SUcxaGMydFRjbU5MWlhrZ1BTQW9ablZ1WTNScGIyNG9LU0I3WEc0Z0lIWmhjaUIxYVdRZ1BTQXZXMTR1WFNza0x5NWxlR1ZqS0dOdmNtVktjMFJoZEdFZ0ppWWdZMjl5WlVwelJHRjBZUzVyWlhseklDWW1JR052Y21WS2MwUmhkR0V1YTJWNWN5NUpSVjlRVWs5VVR5QjhmQ0FuSnlrN1hHNGdJSEpsZEhWeWJpQjFhV1FnUHlBb0oxTjViV0p2YkNoemNtTXBYekV1SnlBcklIVnBaQ2tnT2lBbkp6dGNibjBvS1NrN1hHNWNiaThxS2x4dUlDb2dRMmhsWTJ0eklHbG1JR0JtZFc1allDQm9ZWE1nYVhSeklITnZkWEpqWlNCdFlYTnJaV1F1WEc0Z0tseHVJQ29nUUhCeWFYWmhkR1ZjYmlBcUlFQndZWEpoYlNCN1JuVnVZM1JwYjI1OUlHWjFibU1nVkdobElHWjFibU4wYVc5dUlIUnZJR05vWldOckxseHVJQ29nUUhKbGRIVnlibk1nZTJKdmIyeGxZVzU5SUZKbGRIVnlibk1nWUhSeWRXVmdJR2xtSUdCbWRXNWpZQ0JwY3lCdFlYTnJaV1FzSUdWc2MyVWdZR1poYkhObFlDNWNiaUFxTDF4dVpuVnVZM1JwYjI0Z2FYTk5ZWE5yWldRb1puVnVZeWtnZTF4dUlDQnlaWFIxY200Z0lTRnRZWE5yVTNKalMyVjVJQ1ltSUNodFlYTnJVM0pqUzJWNUlHbHVJR1oxYm1NcE8xeHVmVnh1WEc1dGIyUjFiR1V1Wlhod2IzSjBjeUE5SUdselRXRnphMlZrTzF4dUlpd2lMeW9xSUZWelpXUWdabTl5SUdKMWFXeDBMV2x1SUcxbGRHaHZaQ0J5WldabGNtVnVZMlZ6TGlBcUwxeHVkbUZ5SUdaMWJtTlFjbTkwYnlBOUlFWjFibU4wYVc5dUxuQnliM1J2ZEhsd1pUdGNibHh1THlvcUlGVnpaV1FnZEc4Z2NtVnpiMngyWlNCMGFHVWdaR1ZqYjIxd2FXeGxaQ0J6YjNWeVkyVWdiMllnWm5WdVkzUnBiMjV6TGlBcUwxeHVkbUZ5SUdaMWJtTlViMU4wY21sdVp5QTlJR1oxYm1OUWNtOTBieTUwYjFOMGNtbHVaenRjYmx4dUx5b3FYRzRnS2lCRGIyNTJaWEowY3lCZ1puVnVZMkFnZEc4Z2FYUnpJSE52ZFhKalpTQmpiMlJsTGx4dUlDcGNiaUFxSUVCd2NtbDJZWFJsWEc0Z0tpQkFjR0Z5WVcwZ2UwWjFibU4wYVc5dWZTQm1kVzVqSUZSb1pTQm1kVzVqZEdsdmJpQjBieUJqYjI1MlpYSjBMbHh1SUNvZ1FISmxkSFZ5Ym5NZ2UzTjBjbWx1WjMwZ1VtVjBkWEp1Y3lCMGFHVWdjMjkxY21ObElHTnZaR1V1WEc0Z0tpOWNibVoxYm1OMGFXOXVJSFJ2VTI5MWNtTmxLR1oxYm1NcElIdGNiaUFnYVdZZ0tHWjFibU1nSVQwZ2JuVnNiQ2tnZTF4dUlDQWdJSFJ5ZVNCN1hHNGdJQ0FnSUNCeVpYUjFjbTRnWm5WdVkxUnZVM1J5YVc1bkxtTmhiR3dvWm5WdVl5azdYRzRnSUNBZ2ZTQmpZWFJqYUNBb1pTa2dlMzFjYmlBZ0lDQjBjbmtnZTF4dUlDQWdJQ0FnY21WMGRYSnVJQ2htZFc1aklDc2dKeWNwTzF4dUlDQWdJSDBnWTJGMFkyZ2dLR1VwSUh0OVhHNGdJSDFjYmlBZ2NtVjBkWEp1SUNjbk8xeHVmVnh1WEc1dGIyUjFiR1V1Wlhod2IzSjBjeUE5SUhSdlUyOTFjbU5sTzF4dUlpd2lkbUZ5SUdselJuVnVZM1JwYjI0Z1BTQnlaWEYxYVhKbEtDY3VMMmx6Um5WdVkzUnBiMjRuS1N4Y2JpQWdJQ0JwYzAxaGMydGxaQ0E5SUhKbGNYVnBjbVVvSnk0dlgybHpUV0Z6YTJWa0p5a3NYRzRnSUNBZ2FYTlBZbXBsWTNRZ1BTQnlaWEYxYVhKbEtDY3VMMmx6VDJKcVpXTjBKeWtzWEc0Z0lDQWdkRzlUYjNWeVkyVWdQU0J5WlhGMWFYSmxLQ2N1TDE5MGIxTnZkWEpqWlNjcE8xeHVYRzR2S2lwY2JpQXFJRlZ6WldRZ2RHOGdiV0YwWTJnZ1lGSmxaMFY0Y0dCY2JpQXFJRnR6ZVc1MFlYZ2dZMmhoY21GamRHVnljMTBvYUhSMGNEb3ZMMlZqYldFdGFXNTBaWEp1WVhScGIyNWhiQzV2Y21jdlpXTnRZUzB5TmpJdk55NHdMeU56WldNdGNHRjBkR1Z5Ym5NcExseHVJQ292WEc1MllYSWdjbVZTWldkRmVIQkRhR0Z5SUQwZ0wxdGNYRnhjWGlRdUtpcy9LQ2xiWEZ4ZGUzMThYUzluTzF4dVhHNHZLaW9nVlhObFpDQjBieUJrWlhSbFkzUWdhRzl6ZENCamIyNXpkSEoxWTNSdmNuTWdLRk5oWm1GeWFTa3VJQ292WEc1MllYSWdjbVZKYzBodmMzUkRkRzl5SUQwZ0wxNWNYRnR2WW1wbFkzUWdMaXMvUTI5dWMzUnlkV04wYjNKY1hGMGtMenRjYmx4dUx5b3FJRlZ6WldRZ1ptOXlJR0oxYVd4MExXbHVJRzFsZEdodlpDQnlaV1psY21WdVkyVnpMaUFxTDF4dWRtRnlJR1oxYm1OUWNtOTBieUE5SUVaMWJtTjBhVzl1TG5CeWIzUnZkSGx3WlN4Y2JpQWdJQ0J2WW1wbFkzUlFjbTkwYnlBOUlFOWlhbVZqZEM1d2NtOTBiM1I1Y0dVN1hHNWNiaThxS2lCVmMyVmtJSFJ2SUhKbGMyOXNkbVVnZEdobElHUmxZMjl0Y0dsc1pXUWdjMjkxY21ObElHOW1JR1oxYm1OMGFXOXVjeTRnS2k5Y2JuWmhjaUJtZFc1alZHOVRkSEpwYm1jZ1BTQm1kVzVqVUhKdmRHOHVkRzlUZEhKcGJtYzdYRzVjYmk4cUtpQlZjMlZrSUhSdklHTm9aV05ySUc5aWFtVmpkSE1nWm05eUlHOTNiaUJ3Y205d1pYSjBhV1Z6TGlBcUwxeHVkbUZ5SUdoaGMwOTNibEJ5YjNCbGNuUjVJRDBnYjJKcVpXTjBVSEp2ZEc4dWFHRnpUM2R1VUhKdmNHVnlkSGs3WEc1Y2JpOHFLaUJWYzJWa0lIUnZJR1JsZEdWamRDQnBaaUJoSUcxbGRHaHZaQ0JwY3lCdVlYUnBkbVV1SUNvdlhHNTJZWElnY21WSmMwNWhkR2wyWlNBOUlGSmxaMFY0Y0NnblhpY2dLMXh1SUNCbWRXNWpWRzlUZEhKcGJtY3VZMkZzYkNob1lYTlBkMjVRY205d1pYSjBlU2t1Y21Wd2JHRmpaU2h5WlZKbFowVjRjRU5vWVhJc0lDZGNYRnhjSkNZbktWeHVJQ0F1Y21Wd2JHRmpaU2d2YUdGelQzZHVVSEp2Y0dWeWRIbDhLR1oxYm1OMGFXOXVLUzRxUHlnL1BWeGNYRnhjWENncGZDQm1iM0lnTGlzL0tEODlYRnhjWEZ4Y1hTa3ZaeXdnSnlReExpby9KeWtnS3lBbkpDZGNiaWs3WEc1Y2JpOHFLbHh1SUNvZ1ZHaGxJR0poYzJVZ2FXMXdiR1Z0Wlc1MFlYUnBiMjRnYjJZZ1lGOHVhWE5PWVhScGRtVmdJSGRwZEdodmRYUWdZbUZrSUhOb2FXMGdZMmhsWTJ0ekxseHVJQ3BjYmlBcUlFQndjbWwyWVhSbFhHNGdLaUJBY0dGeVlXMGdleXA5SUhaaGJIVmxJRlJvWlNCMllXeDFaU0IwYnlCamFHVmpheTVjYmlBcUlFQnlaWFIxY201eklIdGliMjlzWldGdWZTQlNaWFIxY201eklHQjBjblZsWUNCcFppQmdkbUZzZFdWZ0lHbHpJR0VnYm1GMGFYWmxJR1oxYm1OMGFXOXVMRnh1SUNvZ0lHVnNjMlVnWUdaaGJITmxZQzVjYmlBcUwxeHVablZ1WTNScGIyNGdZbUZ6WlVselRtRjBhWFpsS0haaGJIVmxLU0I3WEc0Z0lHbG1JQ2doYVhOUFltcGxZM1FvZG1Gc2RXVXBJSHg4SUdselRXRnphMlZrS0haaGJIVmxLU2tnZTF4dUlDQWdJSEpsZEhWeWJpQm1ZV3h6WlR0Y2JpQWdmVnh1SUNCMllYSWdjR0YwZEdWeWJpQTlJR2x6Um5WdVkzUnBiMjRvZG1Gc2RXVXBJRDhnY21WSmMwNWhkR2wyWlNBNklISmxTWE5JYjNOMFEzUnZjanRjYmlBZ2NtVjBkWEp1SUhCaGRIUmxjbTR1ZEdWemRDaDBiMU52ZFhKalpTaDJZV3gxWlNrcE8xeHVmVnh1WEc1dGIyUjFiR1V1Wlhod2IzSjBjeUE5SUdKaGMyVkpjMDVoZEdsMlpUdGNiaUlzSWk4cUtseHVJQ29nUjJWMGN5QjBhR1VnZG1Gc2RXVWdZWFFnWUd0bGVXQWdiMllnWUc5aWFtVmpkR0F1WEc0Z0tseHVJQ29nUUhCeWFYWmhkR1ZjYmlBcUlFQndZWEpoYlNCN1QySnFaV04wZlNCYmIySnFaV04wWFNCVWFHVWdiMkpxWldOMElIUnZJSEYxWlhKNUxseHVJQ29nUUhCaGNtRnRJSHR6ZEhKcGJtZDlJR3RsZVNCVWFHVWdhMlY1SUc5bUlIUm9aU0J3Y205d1pYSjBlU0IwYnlCblpYUXVYRzRnS2lCQWNtVjBkWEp1Y3lCN0tuMGdVbVYwZFhKdWN5QjBhR1VnY0hKdmNHVnlkSGtnZG1Gc2RXVXVYRzRnS2k5Y2JtWjFibU4wYVc5dUlHZGxkRlpoYkhWbEtHOWlhbVZqZEN3Z2EyVjVLU0I3WEc0Z0lISmxkSFZ5YmlCdlltcGxZM1FnUFQwZ2JuVnNiQ0EvSUhWdVpHVm1hVzVsWkNBNklHOWlhbVZqZEZ0clpYbGRPMXh1ZlZ4dVhHNXRiMlIxYkdVdVpYaHdiM0owY3lBOUlHZGxkRlpoYkhWbE8xeHVJaXdpZG1GeUlHSmhjMlZKYzA1aGRHbDJaU0E5SUhKbGNYVnBjbVVvSnk0dlgySmhjMlZKYzA1aGRHbDJaU2NwTEZ4dUlDQWdJR2RsZEZaaGJIVmxJRDBnY21WeGRXbHlaU2duTGk5ZloyVjBWbUZzZFdVbktUdGNibHh1THlvcVhHNGdLaUJIWlhSeklIUm9aU0J1WVhScGRtVWdablZ1WTNScGIyNGdZWFFnWUd0bGVXQWdiMllnWUc5aWFtVmpkR0F1WEc0Z0tseHVJQ29nUUhCeWFYWmhkR1ZjYmlBcUlFQndZWEpoYlNCN1QySnFaV04wZlNCdlltcGxZM1FnVkdobElHOWlhbVZqZENCMGJ5QnhkV1Z5ZVM1Y2JpQXFJRUJ3WVhKaGJTQjdjM1J5YVc1bmZTQnJaWGtnVkdobElHdGxlU0J2WmlCMGFHVWdiV1YwYUc5a0lIUnZJR2RsZEM1Y2JpQXFJRUJ5WlhSMWNtNXpJSHNxZlNCU1pYUjFjbTV6SUhSb1pTQm1kVzVqZEdsdmJpQnBaaUJwZENkeklHNWhkR2wyWlN3Z1pXeHpaU0JnZFc1a1pXWnBibVZrWUM1Y2JpQXFMMXh1Wm5WdVkzUnBiMjRnWjJWMFRtRjBhWFpsS0c5aWFtVmpkQ3dnYTJWNUtTQjdYRzRnSUhaaGNpQjJZV3gxWlNBOUlHZGxkRlpoYkhWbEtHOWlhbVZqZEN3Z2EyVjVLVHRjYmlBZ2NtVjBkWEp1SUdKaGMyVkpjMDVoZEdsMlpTaDJZV3gxWlNrZ1B5QjJZV3gxWlNBNklIVnVaR1ZtYVc1bFpEdGNibjFjYmx4dWJXOWtkV3hsTG1WNGNHOXlkSE1nUFNCblpYUk9ZWFJwZG1VN1hHNGlMQ0oyWVhJZ1oyVjBUbUYwYVhabElEMGdjbVZ4ZFdseVpTZ25MaTlmWjJWMFRtRjBhWFpsSnlrc1hHNGdJQ0FnY205dmRDQTlJSEpsY1hWcGNtVW9KeTR2WDNKdmIzUW5LVHRjYmx4dUx5b2dRblZwYkhRdGFXNGdiV1YwYUc5a0lISmxabVZ5Wlc1alpYTWdkR2hoZENCaGNtVWdkbVZ5YVdacFpXUWdkRzhnWW1VZ2JtRjBhWFpsTGlBcUwxeHVkbUZ5SUUxaGNDQTlJR2RsZEU1aGRHbDJaU2h5YjI5MExDQW5UV0Z3SnlrN1hHNWNibTF2WkhWc1pTNWxlSEJ2Y25SeklEMGdUV0Z3TzF4dUlpd2lkbUZ5SUdkbGRFNWhkR2wyWlNBOUlISmxjWFZwY21Vb0p5NHZYMmRsZEU1aGRHbDJaU2NwTzF4dVhHNHZLaUJDZFdsc2RDMXBiaUJ0WlhSb2IyUWdjbVZtWlhKbGJtTmxjeUIwYUdGMElHRnlaU0IyWlhKcFptbGxaQ0IwYnlCaVpTQnVZWFJwZG1VdUlDb3ZYRzUyWVhJZ2JtRjBhWFpsUTNKbFlYUmxJRDBnWjJWMFRtRjBhWFpsS0U5aWFtVmpkQ3dnSjJOeVpXRjBaU2NwTzF4dVhHNXRiMlIxYkdVdVpYaHdiM0owY3lBOUlHNWhkR2wyWlVOeVpXRjBaVHRjYmlJc0luWmhjaUJ1WVhScGRtVkRjbVZoZEdVZ1BTQnlaWEYxYVhKbEtDY3VMMTl1WVhScGRtVkRjbVZoZEdVbktUdGNibHh1THlvcVhHNGdLaUJTWlcxdmRtVnpJR0ZzYkNCclpYa3RkbUZzZFdVZ1pXNTBjbWxsY3lCbWNtOXRJSFJvWlNCb1lYTm9MbHh1SUNwY2JpQXFJRUJ3Y21sMllYUmxYRzRnS2lCQWJtRnRaU0JqYkdWaGNseHVJQ29nUUcxbGJXSmxjazltSUVoaGMyaGNiaUFxTDF4dVpuVnVZM1JwYjI0Z2FHRnphRU5zWldGeUtDa2dlMXh1SUNCMGFHbHpMbDlmWkdGMFlWOWZJRDBnYm1GMGFYWmxRM0psWVhSbElEOGdibUYwYVhabFEzSmxZWFJsS0c1MWJHd3BJRG9nZTMwN1hHNGdJSFJvYVhNdWMybDZaU0E5SURBN1hHNTlYRzVjYm0xdlpIVnNaUzVsZUhCdmNuUnpJRDBnYUdGemFFTnNaV0Z5TzF4dUlpd2lMeW9xWEc0Z0tpQlNaVzF2ZG1WeklHQnJaWGxnSUdGdVpDQnBkSE1nZG1Gc2RXVWdabkp2YlNCMGFHVWdhR0Z6YUM1Y2JpQXFYRzRnS2lCQWNISnBkbUYwWlZ4dUlDb2dRRzVoYldVZ1pHVnNaWFJsWEc0Z0tpQkFiV1Z0WW1WeVQyWWdTR0Z6YUZ4dUlDb2dRSEJoY21GdElIdFBZbXBsWTNSOUlHaGhjMmdnVkdobElHaGhjMmdnZEc4Z2JXOWthV1o1TGx4dUlDb2dRSEJoY21GdElIdHpkSEpwYm1kOUlHdGxlU0JVYUdVZ2EyVjVJRzltSUhSb1pTQjJZV3gxWlNCMGJ5QnlaVzF2ZG1VdVhHNGdLaUJBY21WMGRYSnVjeUI3WW05dmJHVmhibjBnVW1WMGRYSnVjeUJnZEhKMVpXQWdhV1lnZEdobElHVnVkSEo1SUhkaGN5QnlaVzF2ZG1Wa0xDQmxiSE5sSUdCbVlXeHpaV0F1WEc0Z0tpOWNibVoxYm1OMGFXOXVJR2hoYzJoRVpXeGxkR1VvYTJWNUtTQjdYRzRnSUhaaGNpQnlaWE4xYkhRZ1BTQjBhR2x6TG1oaGN5aHJaWGtwSUNZbUlHUmxiR1YwWlNCMGFHbHpMbDlmWkdGMFlWOWZXMnRsZVYwN1hHNGdJSFJvYVhNdWMybDZaU0F0UFNCeVpYTjFiSFFnUHlBeElEb2dNRHRjYmlBZ2NtVjBkWEp1SUhKbGMzVnNkRHRjYm4xY2JseHViVzlrZFd4bExtVjRjRzl5ZEhNZ1BTQm9ZWE5vUkdWc1pYUmxPMXh1SWl3aWRtRnlJRzVoZEdsMlpVTnlaV0YwWlNBOUlISmxjWFZwY21Vb0p5NHZYMjVoZEdsMlpVTnlaV0YwWlNjcE8xeHVYRzR2S2lvZ1ZYTmxaQ0IwYnlCemRHRnVaQzFwYmlCbWIzSWdZSFZ1WkdWbWFXNWxaR0FnYUdGemFDQjJZV3gxWlhNdUlDb3ZYRzUyWVhJZ1NFRlRTRjlWVGtSRlJrbE9SVVFnUFNBblgxOXNiMlJoYzJoZmFHRnphRjkxYm1SbFptbHVaV1JmWHljN1hHNWNiaThxS2lCVmMyVmtJR1p2Y2lCaWRXbHNkQzFwYmlCdFpYUm9iMlFnY21WbVpYSmxibU5sY3k0Z0tpOWNiblpoY2lCdlltcGxZM1JRY205MGJ5QTlJRTlpYW1WamRDNXdjbTkwYjNSNWNHVTdYRzVjYmk4cUtpQlZjMlZrSUhSdklHTm9aV05ySUc5aWFtVmpkSE1nWm05eUlHOTNiaUJ3Y205d1pYSjBhV1Z6TGlBcUwxeHVkbUZ5SUdoaGMwOTNibEJ5YjNCbGNuUjVJRDBnYjJKcVpXTjBVSEp2ZEc4dWFHRnpUM2R1VUhKdmNHVnlkSGs3WEc1Y2JpOHFLbHh1SUNvZ1IyVjBjeUIwYUdVZ2FHRnphQ0IyWVd4MVpTQm1iM0lnWUd0bGVXQXVYRzRnS2x4dUlDb2dRSEJ5YVhaaGRHVmNiaUFxSUVCdVlXMWxJR2RsZEZ4dUlDb2dRRzFsYldKbGNrOW1JRWhoYzJoY2JpQXFJRUJ3WVhKaGJTQjdjM1J5YVc1bmZTQnJaWGtnVkdobElHdGxlU0J2WmlCMGFHVWdkbUZzZFdVZ2RHOGdaMlYwTGx4dUlDb2dRSEpsZEhWeWJuTWdleXA5SUZKbGRIVnlibk1nZEdobElHVnVkSEo1SUhaaGJIVmxMbHh1SUNvdlhHNW1kVzVqZEdsdmJpQm9ZWE5vUjJWMEtHdGxlU2tnZTF4dUlDQjJZWElnWkdGMFlTQTlJSFJvYVhNdVgxOWtZWFJoWDE4N1hHNGdJR2xtSUNodVlYUnBkbVZEY21WaGRHVXBJSHRjYmlBZ0lDQjJZWElnY21WemRXeDBJRDBnWkdGMFlWdHJaWGxkTzF4dUlDQWdJSEpsZEhWeWJpQnlaWE4xYkhRZ1BUMDlJRWhCVTBoZlZVNUVSVVpKVGtWRUlEOGdkVzVrWldacGJtVmtJRG9nY21WemRXeDBPMXh1SUNCOVhHNGdJSEpsZEhWeWJpQm9ZWE5QZDI1UWNtOXdaWEowZVM1allXeHNLR1JoZEdFc0lHdGxlU2tnUHlCa1lYUmhXMnRsZVYwZ09pQjFibVJsWm1sdVpXUTdYRzU5WEc1Y2JtMXZaSFZzWlM1bGVIQnZjblJ6SUQwZ2FHRnphRWRsZER0Y2JpSXNJblpoY2lCdVlYUnBkbVZEY21WaGRHVWdQU0J5WlhGMWFYSmxLQ2N1TDE5dVlYUnBkbVZEY21WaGRHVW5LVHRjYmx4dUx5b3FJRlZ6WldRZ1ptOXlJR0oxYVd4MExXbHVJRzFsZEdodlpDQnlaV1psY21WdVkyVnpMaUFxTDF4dWRtRnlJRzlpYW1WamRGQnliM1J2SUQwZ1QySnFaV04wTG5CeWIzUnZkSGx3WlR0Y2JseHVMeW9xSUZWelpXUWdkRzhnWTJobFkyc2diMkpxWldOMGN5Qm1iM0lnYjNkdUlIQnliM0JsY25ScFpYTXVJQ292WEc1MllYSWdhR0Z6VDNkdVVISnZjR1Z5ZEhrZ1BTQnZZbXBsWTNSUWNtOTBieTVvWVhOUGQyNVFjbTl3WlhKMGVUdGNibHh1THlvcVhHNGdLaUJEYUdWamEzTWdhV1lnWVNCb1lYTm9JSFpoYkhWbElHWnZjaUJnYTJWNVlDQmxlR2x6ZEhNdVhHNGdLbHh1SUNvZ1FIQnlhWFpoZEdWY2JpQXFJRUJ1WVcxbElHaGhjMXh1SUNvZ1FHMWxiV0psY2s5bUlFaGhjMmhjYmlBcUlFQndZWEpoYlNCN2MzUnlhVzVuZlNCclpYa2dWR2hsSUd0bGVTQnZaaUIwYUdVZ1pXNTBjbmtnZEc4Z1kyaGxZMnN1WEc0Z0tpQkFjbVYwZFhKdWN5QjdZbTl2YkdWaGJuMGdVbVYwZFhKdWN5QmdkSEoxWldBZ2FXWWdZVzRnWlc1MGNua2dabTl5SUdCclpYbGdJR1Y0YVhOMGN5d2daV3h6WlNCZ1ptRnNjMlZnTGx4dUlDb3ZYRzVtZFc1amRHbHZiaUJvWVhOb1NHRnpLR3RsZVNrZ2UxeHVJQ0IyWVhJZ1pHRjBZU0E5SUhSb2FYTXVYMTlrWVhSaFgxODdYRzRnSUhKbGRIVnliaUJ1WVhScGRtVkRjbVZoZEdVZ1B5QW9aR0YwWVZ0clpYbGRJQ0U5UFNCMWJtUmxabWx1WldRcElEb2dhR0Z6VDNkdVVISnZjR1Z5ZEhrdVkyRnNiQ2hrWVhSaExDQnJaWGtwTzF4dWZWeHVYRzV0YjJSMWJHVXVaWGh3YjNKMGN5QTlJR2hoYzJoSVlYTTdYRzRpTENKMllYSWdibUYwYVhabFEzSmxZWFJsSUQwZ2NtVnhkV2x5WlNnbkxpOWZibUYwYVhabFEzSmxZWFJsSnlrN1hHNWNiaThxS2lCVmMyVmtJSFJ2SUhOMFlXNWtMV2x1SUdadmNpQmdkVzVrWldacGJtVmtZQ0JvWVhOb0lIWmhiSFZsY3k0Z0tpOWNiblpoY2lCSVFWTklYMVZPUkVWR1NVNUZSQ0E5SUNkZlgyeHZaR0Z6YUY5b1lYTm9YM1Z1WkdWbWFXNWxaRjlmSnp0Y2JseHVMeW9xWEc0Z0tpQlRaWFJ6SUhSb1pTQm9ZWE5vSUdCclpYbGdJSFJ2SUdCMllXeDFaV0F1WEc0Z0tseHVJQ29nUUhCeWFYWmhkR1ZjYmlBcUlFQnVZVzFsSUhObGRGeHVJQ29nUUcxbGJXSmxjazltSUVoaGMyaGNiaUFxSUVCd1lYSmhiU0I3YzNSeWFXNW5mU0JyWlhrZ1ZHaGxJR3RsZVNCdlppQjBhR1VnZG1Gc2RXVWdkRzhnYzJWMExseHVJQ29nUUhCaGNtRnRJSHNxZlNCMllXeDFaU0JVYUdVZ2RtRnNkV1VnZEc4Z2MyVjBMbHh1SUNvZ1FISmxkSFZ5Ym5NZ2UwOWlhbVZqZEgwZ1VtVjBkWEp1Y3lCMGFHVWdhR0Z6YUNCcGJuTjBZVzVqWlM1Y2JpQXFMMXh1Wm5WdVkzUnBiMjRnYUdGemFGTmxkQ2hyWlhrc0lIWmhiSFZsS1NCN1hHNGdJSFpoY2lCa1lYUmhJRDBnZEdocGN5NWZYMlJoZEdGZlh6dGNiaUFnZEdocGN5NXphWHBsSUNzOUlIUm9hWE11YUdGektHdGxlU2tnUHlBd0lEb2dNVHRjYmlBZ1pHRjBZVnRyWlhsZElEMGdLRzVoZEdsMlpVTnlaV0YwWlNBbUppQjJZV3gxWlNBOVBUMGdkVzVrWldacGJtVmtLU0EvSUVoQlUwaGZWVTVFUlVaSlRrVkVJRG9nZG1Gc2RXVTdYRzRnSUhKbGRIVnliaUIwYUdsek8xeHVmVnh1WEc1dGIyUjFiR1V1Wlhod2IzSjBjeUE5SUdoaGMyaFRaWFE3WEc0aUxDSjJZWElnYUdGemFFTnNaV0Z5SUQwZ2NtVnhkV2x5WlNnbkxpOWZhR0Z6YUVOc1pXRnlKeWtzWEc0Z0lDQWdhR0Z6YUVSbGJHVjBaU0E5SUhKbGNYVnBjbVVvSnk0dlgyaGhjMmhFWld4bGRHVW5LU3hjYmlBZ0lDQm9ZWE5vUjJWMElEMGdjbVZ4ZFdseVpTZ25MaTlmYUdGemFFZGxkQ2NwTEZ4dUlDQWdJR2hoYzJoSVlYTWdQU0J5WlhGMWFYSmxLQ2N1TDE5b1lYTm9TR0Z6Snlrc1hHNGdJQ0FnYUdGemFGTmxkQ0E5SUhKbGNYVnBjbVVvSnk0dlgyaGhjMmhUWlhRbktUdGNibHh1THlvcVhHNGdLaUJEY21WaGRHVnpJR0VnYUdGemFDQnZZbXBsWTNRdVhHNGdLbHh1SUNvZ1FIQnlhWFpoZEdWY2JpQXFJRUJqYjI1emRISjFZM1J2Y2x4dUlDb2dRSEJoY21GdElIdEJjbkpoZVgwZ1cyVnVkSEpwWlhOZElGUm9aU0JyWlhrdGRtRnNkV1VnY0dGcGNuTWdkRzhnWTJGamFHVXVYRzRnS2k5Y2JtWjFibU4wYVc5dUlFaGhjMmdvWlc1MGNtbGxjeWtnZTF4dUlDQjJZWElnYVc1a1pYZ2dQU0F0TVN4Y2JpQWdJQ0FnSUd4bGJtZDBhQ0E5SUdWdWRISnBaWE1nUFQwZ2JuVnNiQ0EvSURBZ09pQmxiblJ5YVdWekxteGxibWQwYUR0Y2JseHVJQ0IwYUdsekxtTnNaV0Z5S0NrN1hHNGdJSGRvYVd4bElDZ3JLMmx1WkdWNElEd2diR1Z1WjNSb0tTQjdYRzRnSUNBZ2RtRnlJR1Z1ZEhKNUlEMGdaVzUwY21sbGMxdHBibVJsZUYwN1hHNGdJQ0FnZEdocGN5NXpaWFFvWlc1MGNubGJNRjBzSUdWdWRISjVXekZkS1R0Y2JpQWdmVnh1ZlZ4dVhHNHZMeUJCWkdRZ2JXVjBhRzlrY3lCMGJ5QmdTR0Z6YUdBdVhHNUlZWE5vTG5CeWIzUnZkSGx3WlM1amJHVmhjaUE5SUdoaGMyaERiR1ZoY2p0Y2JraGhjMmd1Y0hKdmRHOTBlWEJsV3lka1pXeGxkR1VuWFNBOUlHaGhjMmhFWld4bGRHVTdYRzVJWVhOb0xuQnliM1J2ZEhsd1pTNW5aWFFnUFNCb1lYTm9SMlYwTzF4dVNHRnphQzV3Y205MGIzUjVjR1V1YUdGeklEMGdhR0Z6YUVoaGN6dGNia2hoYzJndWNISnZkRzkwZVhCbExuTmxkQ0E5SUdoaGMyaFRaWFE3WEc1Y2JtMXZaSFZzWlM1bGVIQnZjblJ6SUQwZ1NHRnphRHRjYmlJc0luWmhjaUJJWVhOb0lEMGdjbVZ4ZFdseVpTZ25MaTlmU0dGemFDY3BMRnh1SUNBZ0lFeHBjM1JEWVdOb1pTQTlJSEpsY1hWcGNtVW9KeTR2WDB4cGMzUkRZV05vWlNjcExGeHVJQ0FnSUUxaGNDQTlJSEpsY1hWcGNtVW9KeTR2WDAxaGNDY3BPMXh1WEc0dktpcGNiaUFxSUZKbGJXOTJaWE1nWVd4c0lHdGxlUzEyWVd4MVpTQmxiblJ5YVdWeklHWnliMjBnZEdobElHMWhjQzVjYmlBcVhHNGdLaUJBY0hKcGRtRjBaVnh1SUNvZ1FHNWhiV1VnWTJ4bFlYSmNiaUFxSUVCdFpXMWlaWEpQWmlCTllYQkRZV05vWlZ4dUlDb3ZYRzVtZFc1amRHbHZiaUJ0WVhCRFlXTm9aVU5zWldGeUtDa2dlMXh1SUNCMGFHbHpMbk5wZW1VZ1BTQXdPMXh1SUNCMGFHbHpMbDlmWkdGMFlWOWZJRDBnZTF4dUlDQWdJQ2RvWVhOb0p6b2dibVYzSUVoaGMyZ3NYRzRnSUNBZ0oyMWhjQ2M2SUc1bGR5QW9UV0Z3SUh4OElFeHBjM1JEWVdOb1pTa3NYRzRnSUNBZ0ozTjBjbWx1WnljNklHNWxkeUJJWVhOb1hHNGdJSDA3WEc1OVhHNWNibTF2WkhWc1pTNWxlSEJ2Y25SeklEMGdiV0Z3UTJGamFHVkRiR1ZoY2p0Y2JpSXNJaThxS2x4dUlDb2dRMmhsWTJ0eklHbG1JR0IyWVd4MVpXQWdhWE1nYzNWcGRHRmliR1VnWm05eUlIVnpaU0JoY3lCMWJtbHhkV1VnYjJKcVpXTjBJR3RsZVM1Y2JpQXFYRzRnS2lCQWNISnBkbUYwWlZ4dUlDb2dRSEJoY21GdElIc3FmU0IyWVd4MVpTQlVhR1VnZG1Gc2RXVWdkRzhnWTJobFkyc3VYRzRnS2lCQWNtVjBkWEp1Y3lCN1ltOXZiR1ZoYm4wZ1VtVjBkWEp1Y3lCZ2RISjFaV0FnYVdZZ1lIWmhiSFZsWUNCcGN5QnpkV2wwWVdKc1pTd2daV3h6WlNCZ1ptRnNjMlZnTGx4dUlDb3ZYRzVtZFc1amRHbHZiaUJwYzB0bGVXRmliR1VvZG1Gc2RXVXBJSHRjYmlBZ2RtRnlJSFI1Y0dVZ1BTQjBlWEJsYjJZZ2RtRnNkV1U3WEc0Z0lISmxkSFZ5YmlBb2RIbHdaU0E5UFNBbmMzUnlhVzVuSnlCOGZDQjBlWEJsSUQwOUlDZHVkVzFpWlhJbklIeDhJSFI1Y0dVZ1BUMGdKM041YldKdmJDY2dmSHdnZEhsd1pTQTlQU0FuWW05dmJHVmhiaWNwWEc0Z0lDQWdQeUFvZG1Gc2RXVWdJVDA5SUNkZlgzQnliM1J2WDE4bktWeHVJQ0FnSURvZ0tIWmhiSFZsSUQwOVBTQnVkV3hzS1R0Y2JuMWNibHh1Ylc5a2RXeGxMbVY0Y0c5eWRITWdQU0JwYzB0bGVXRmliR1U3WEc0aUxDSjJZWElnYVhOTFpYbGhZbXhsSUQwZ2NtVnhkV2x5WlNnbkxpOWZhWE5MWlhsaFlteGxKeWs3WEc1Y2JpOHFLbHh1SUNvZ1IyVjBjeUIwYUdVZ1pHRjBZU0JtYjNJZ1lHMWhjR0F1WEc0Z0tseHVJQ29nUUhCeWFYWmhkR1ZjYmlBcUlFQndZWEpoYlNCN1QySnFaV04wZlNCdFlYQWdWR2hsSUcxaGNDQjBieUJ4ZFdWeWVTNWNiaUFxSUVCd1lYSmhiU0I3YzNSeWFXNW5mU0JyWlhrZ1ZHaGxJSEpsWm1WeVpXNWpaU0JyWlhrdVhHNGdLaUJBY21WMGRYSnVjeUI3S24wZ1VtVjBkWEp1Y3lCMGFHVWdiV0Z3SUdSaGRHRXVYRzRnS2k5Y2JtWjFibU4wYVc5dUlHZGxkRTFoY0VSaGRHRW9iV0Z3TENCclpYa3BJSHRjYmlBZ2RtRnlJR1JoZEdFZ1BTQnRZWEF1WDE5a1lYUmhYMTg3WEc0Z0lISmxkSFZ5YmlCcGMwdGxlV0ZpYkdVb2EyVjVLVnh1SUNBZ0lEOGdaR0YwWVZ0MGVYQmxiMllnYTJWNUlEMDlJQ2R6ZEhKcGJtY25JRDhnSjNOMGNtbHVaeWNnT2lBbmFHRnphQ2RkWEc0Z0lDQWdPaUJrWVhSaExtMWhjRHRjYm4xY2JseHViVzlrZFd4bExtVjRjRzl5ZEhNZ1BTQm5aWFJOWVhCRVlYUmhPMXh1SWl3aWRtRnlJR2RsZEUxaGNFUmhkR0VnUFNCeVpYRjFhWEpsS0NjdUwxOW5aWFJOWVhCRVlYUmhKeWs3WEc1Y2JpOHFLbHh1SUNvZ1VtVnRiM1psY3lCZ2EyVjVZQ0JoYm1RZ2FYUnpJSFpoYkhWbElHWnliMjBnZEdobElHMWhjQzVjYmlBcVhHNGdLaUJBY0hKcGRtRjBaVnh1SUNvZ1FHNWhiV1VnWkdWc1pYUmxYRzRnS2lCQWJXVnRZbVZ5VDJZZ1RXRndRMkZqYUdWY2JpQXFJRUJ3WVhKaGJTQjdjM1J5YVc1bmZTQnJaWGtnVkdobElHdGxlU0J2WmlCMGFHVWdkbUZzZFdVZ2RHOGdjbVZ0YjNabExseHVJQ29nUUhKbGRIVnlibk1nZTJKdmIyeGxZVzU5SUZKbGRIVnlibk1nWUhSeWRXVmdJR2xtSUhSb1pTQmxiblJ5ZVNCM1lYTWdjbVZ0YjNabFpDd2daV3h6WlNCZ1ptRnNjMlZnTGx4dUlDb3ZYRzVtZFc1amRHbHZiaUJ0WVhCRFlXTm9aVVJsYkdWMFpTaHJaWGtwSUh0Y2JpQWdkbUZ5SUhKbGMzVnNkQ0E5SUdkbGRFMWhjRVJoZEdFb2RHaHBjeXdnYTJWNUtWc25aR1ZzWlhSbEoxMG9hMlY1S1R0Y2JpQWdkR2hwY3k1emFYcGxJQzA5SUhKbGMzVnNkQ0EvSURFZ09pQXdPMXh1SUNCeVpYUjFjbTRnY21WemRXeDBPMXh1ZlZ4dVhHNXRiMlIxYkdVdVpYaHdiM0owY3lBOUlHMWhjRU5oWTJobFJHVnNaWFJsTzF4dUlpd2lkbUZ5SUdkbGRFMWhjRVJoZEdFZ1BTQnlaWEYxYVhKbEtDY3VMMTluWlhSTllYQkVZWFJoSnlrN1hHNWNiaThxS2x4dUlDb2dSMlYwY3lCMGFHVWdiV0Z3SUhaaGJIVmxJR1p2Y2lCZ2EyVjVZQzVjYmlBcVhHNGdLaUJBY0hKcGRtRjBaVnh1SUNvZ1FHNWhiV1VnWjJWMFhHNGdLaUJBYldWdFltVnlUMllnVFdGd1EyRmphR1ZjYmlBcUlFQndZWEpoYlNCN2MzUnlhVzVuZlNCclpYa2dWR2hsSUd0bGVTQnZaaUIwYUdVZ2RtRnNkV1VnZEc4Z1oyVjBMbHh1SUNvZ1FISmxkSFZ5Ym5NZ2V5cDlJRkpsZEhWeWJuTWdkR2hsSUdWdWRISjVJSFpoYkhWbExseHVJQ292WEc1bWRXNWpkR2x2YmlCdFlYQkRZV05vWlVkbGRDaHJaWGtwSUh0Y2JpQWdjbVYwZFhKdUlHZGxkRTFoY0VSaGRHRW9kR2hwY3l3Z2EyVjVLUzVuWlhRb2EyVjVLVHRjYm4xY2JseHViVzlrZFd4bExtVjRjRzl5ZEhNZ1BTQnRZWEJEWVdOb1pVZGxkRHRjYmlJc0luWmhjaUJuWlhSTllYQkVZWFJoSUQwZ2NtVnhkV2x5WlNnbkxpOWZaMlYwVFdGd1JHRjBZU2NwTzF4dVhHNHZLaXBjYmlBcUlFTm9aV05yY3lCcFppQmhJRzFoY0NCMllXeDFaU0JtYjNJZ1lHdGxlV0FnWlhocGMzUnpMbHh1SUNwY2JpQXFJRUJ3Y21sMllYUmxYRzRnS2lCQWJtRnRaU0JvWVhOY2JpQXFJRUJ0WlcxaVpYSlBaaUJOWVhCRFlXTm9aVnh1SUNvZ1FIQmhjbUZ0SUh0emRISnBibWQ5SUd0bGVTQlVhR1VnYTJWNUlHOW1JSFJvWlNCbGJuUnllU0IwYnlCamFHVmpheTVjYmlBcUlFQnlaWFIxY201eklIdGliMjlzWldGdWZTQlNaWFIxY201eklHQjBjblZsWUNCcFppQmhiaUJsYm5SeWVTQm1iM0lnWUd0bGVXQWdaWGhwYzNSekxDQmxiSE5sSUdCbVlXeHpaV0F1WEc0Z0tpOWNibVoxYm1OMGFXOXVJRzFoY0VOaFkyaGxTR0Z6S0d0bGVTa2dlMXh1SUNCeVpYUjFjbTRnWjJWMFRXRndSR0YwWVNoMGFHbHpMQ0JyWlhrcExtaGhjeWhyWlhrcE8xeHVmVnh1WEc1dGIyUjFiR1V1Wlhod2IzSjBjeUE5SUcxaGNFTmhZMmhsU0dGek8xeHVJaXdpZG1GeUlHZGxkRTFoY0VSaGRHRWdQU0J5WlhGMWFYSmxLQ2N1TDE5blpYUk5ZWEJFWVhSaEp5azdYRzVjYmk4cUtseHVJQ29nVTJWMGN5QjBhR1VnYldGd0lHQnJaWGxnSUhSdklHQjJZV3gxWldBdVhHNGdLbHh1SUNvZ1FIQnlhWFpoZEdWY2JpQXFJRUJ1WVcxbElITmxkRnh1SUNvZ1FHMWxiV0psY2s5bUlFMWhjRU5oWTJobFhHNGdLaUJBY0dGeVlXMGdlM04wY21sdVozMGdhMlY1SUZSb1pTQnJaWGtnYjJZZ2RHaGxJSFpoYkhWbElIUnZJSE5sZEM1Y2JpQXFJRUJ3WVhKaGJTQjdLbjBnZG1Gc2RXVWdWR2hsSUhaaGJIVmxJSFJ2SUhObGRDNWNiaUFxSUVCeVpYUjFjbTV6SUh0UFltcGxZM1I5SUZKbGRIVnlibk1nZEdobElHMWhjQ0JqWVdOb1pTQnBibk4wWVc1alpTNWNiaUFxTDF4dVpuVnVZM1JwYjI0Z2JXRndRMkZqYUdWVFpYUW9hMlY1TENCMllXeDFaU2tnZTF4dUlDQjJZWElnWkdGMFlTQTlJR2RsZEUxaGNFUmhkR0VvZEdocGN5d2dhMlY1S1N4Y2JpQWdJQ0FnSUhOcGVtVWdQU0JrWVhSaExuTnBlbVU3WEc1Y2JpQWdaR0YwWVM1elpYUW9hMlY1TENCMllXeDFaU2s3WEc0Z0lIUm9hWE11YzJsNlpTQXJQU0JrWVhSaExuTnBlbVVnUFQwZ2MybDZaU0EvSURBZ09pQXhPMXh1SUNCeVpYUjFjbTRnZEdocGN6dGNibjFjYmx4dWJXOWtkV3hsTG1WNGNHOXlkSE1nUFNCdFlYQkRZV05vWlZObGREdGNiaUlzSW5aaGNpQnRZWEJEWVdOb1pVTnNaV0Z5SUQwZ2NtVnhkV2x5WlNnbkxpOWZiV0Z3UTJGamFHVkRiR1ZoY2ljcExGeHVJQ0FnSUcxaGNFTmhZMmhsUkdWc1pYUmxJRDBnY21WeGRXbHlaU2duTGk5ZmJXRndRMkZqYUdWRVpXeGxkR1VuS1N4Y2JpQWdJQ0J0WVhCRFlXTm9aVWRsZENBOUlISmxjWFZwY21Vb0p5NHZYMjFoY0VOaFkyaGxSMlYwSnlrc1hHNGdJQ0FnYldGd1EyRmphR1ZJWVhNZ1BTQnlaWEYxYVhKbEtDY3VMMTl0WVhCRFlXTm9aVWhoY3ljcExGeHVJQ0FnSUcxaGNFTmhZMmhsVTJWMElEMGdjbVZ4ZFdseVpTZ25MaTlmYldGd1EyRmphR1ZUWlhRbktUdGNibHh1THlvcVhHNGdLaUJEY21WaGRHVnpJR0VnYldGd0lHTmhZMmhsSUc5aWFtVmpkQ0IwYnlCemRHOXlaU0JyWlhrdGRtRnNkV1VnY0dGcGNuTXVYRzRnS2x4dUlDb2dRSEJ5YVhaaGRHVmNiaUFxSUVCamIyNXpkSEoxWTNSdmNseHVJQ29nUUhCaGNtRnRJSHRCY25KaGVYMGdXMlZ1ZEhKcFpYTmRJRlJvWlNCclpYa3RkbUZzZFdVZ2NHRnBjbk1nZEc4Z1kyRmphR1V1WEc0Z0tpOWNibVoxYm1OMGFXOXVJRTFoY0VOaFkyaGxLR1Z1ZEhKcFpYTXBJSHRjYmlBZ2RtRnlJR2x1WkdWNElEMGdMVEVzWEc0Z0lDQWdJQ0JzWlc1bmRHZ2dQU0JsYm5SeWFXVnpJRDA5SUc1MWJHd2dQeUF3SURvZ1pXNTBjbWxsY3k1c1pXNW5kR2c3WEc1Y2JpQWdkR2hwY3k1amJHVmhjaWdwTzF4dUlDQjNhR2xzWlNBb0t5dHBibVJsZUNBOElHeGxibWQwYUNrZ2UxeHVJQ0FnSUhaaGNpQmxiblJ5ZVNBOUlHVnVkSEpwWlhOYmFXNWtaWGhkTzF4dUlDQWdJSFJvYVhNdWMyVjBLR1Z1ZEhKNVd6QmRMQ0JsYm5SeWVWc3hYU2s3WEc0Z0lIMWNibjFjYmx4dUx5OGdRV1JrSUcxbGRHaHZaSE1nZEc4Z1lFMWhjRU5oWTJobFlDNWNiazFoY0VOaFkyaGxMbkJ5YjNSdmRIbHdaUzVqYkdWaGNpQTlJRzFoY0VOaFkyaGxRMnhsWVhJN1hHNU5ZWEJEWVdOb1pTNXdjbTkwYjNSNWNHVmJKMlJsYkdWMFpTZGRJRDBnYldGd1EyRmphR1ZFWld4bGRHVTdYRzVOWVhCRFlXTm9aUzV3Y205MGIzUjVjR1V1WjJWMElEMGdiV0Z3UTJGamFHVkhaWFE3WEc1TllYQkRZV05vWlM1d2NtOTBiM1I1Y0dVdWFHRnpJRDBnYldGd1EyRmphR1ZJWVhNN1hHNU5ZWEJEWVdOb1pTNXdjbTkwYjNSNWNHVXVjMlYwSUQwZ2JXRndRMkZqYUdWVFpYUTdYRzVjYm0xdlpIVnNaUzVsZUhCdmNuUnpJRDBnVFdGd1EyRmphR1U3WEc0aUxDSjJZWElnVEdsemRFTmhZMmhsSUQwZ2NtVnhkV2x5WlNnbkxpOWZUR2x6ZEVOaFkyaGxKeWtzWEc0Z0lDQWdUV0Z3SUQwZ2NtVnhkV2x5WlNnbkxpOWZUV0Z3Snlrc1hHNGdJQ0FnVFdGd1EyRmphR1VnUFNCeVpYRjFhWEpsS0NjdUwxOU5ZWEJEWVdOb1pTY3BPMXh1WEc0dktpb2dWWE5sWkNCaGN5QjBhR1VnYzJsNlpTQjBieUJsYm1GaWJHVWdiR0Z5WjJVZ1lYSnlZWGtnYjNCMGFXMXBlbUYwYVc5dWN5NGdLaTljYm5aaGNpQk1RVkpIUlY5QlVsSkJXVjlUU1ZwRklEMGdNakF3TzF4dVhHNHZLaXBjYmlBcUlGTmxkSE1nZEdobElITjBZV05ySUdCclpYbGdJSFJ2SUdCMllXeDFaV0F1WEc0Z0tseHVJQ29nUUhCeWFYWmhkR1ZjYmlBcUlFQnVZVzFsSUhObGRGeHVJQ29nUUcxbGJXSmxjazltSUZOMFlXTnJYRzRnS2lCQWNHRnlZVzBnZTNOMGNtbHVaMzBnYTJWNUlGUm9aU0JyWlhrZ2IyWWdkR2hsSUhaaGJIVmxJSFJ2SUhObGRDNWNiaUFxSUVCd1lYSmhiU0I3S24wZ2RtRnNkV1VnVkdobElIWmhiSFZsSUhSdklITmxkQzVjYmlBcUlFQnlaWFIxY201eklIdFBZbXBsWTNSOUlGSmxkSFZ5Ym5NZ2RHaGxJSE4wWVdOcklHTmhZMmhsSUdsdWMzUmhibU5sTGx4dUlDb3ZYRzVtZFc1amRHbHZiaUJ6ZEdGamExTmxkQ2hyWlhrc0lIWmhiSFZsS1NCN1hHNGdJSFpoY2lCa1lYUmhJRDBnZEdocGN5NWZYMlJoZEdGZlh6dGNiaUFnYVdZZ0tHUmhkR0VnYVc1emRHRnVZMlZ2WmlCTWFYTjBRMkZqYUdVcElIdGNiaUFnSUNCMllYSWdjR0ZwY25NZ1BTQmtZWFJoTGw5ZlpHRjBZVjlmTzF4dUlDQWdJR2xtSUNnaFRXRndJSHg4SUNod1lXbHljeTVzWlc1bmRHZ2dQQ0JNUVZKSFJWOUJVbEpCV1Y5VFNWcEZJQzBnTVNrcElIdGNiaUFnSUNBZ0lIQmhhWEp6TG5CMWMyZ29XMnRsZVN3Z2RtRnNkV1ZkS1R0Y2JpQWdJQ0FnSUhSb2FYTXVjMmw2WlNBOUlDc3JaR0YwWVM1emFYcGxPMXh1SUNBZ0lDQWdjbVYwZFhKdUlIUm9hWE03WEc0Z0lDQWdmVnh1SUNBZ0lHUmhkR0VnUFNCMGFHbHpMbDlmWkdGMFlWOWZJRDBnYm1WM0lFMWhjRU5oWTJobEtIQmhhWEp6S1R0Y2JpQWdmVnh1SUNCa1lYUmhMbk5sZENoclpYa3NJSFpoYkhWbEtUdGNiaUFnZEdocGN5NXphWHBsSUQwZ1pHRjBZUzV6YVhwbE8xeHVJQ0J5WlhSMWNtNGdkR2hwY3p0Y2JuMWNibHh1Ylc5a2RXeGxMbVY0Y0c5eWRITWdQU0J6ZEdGamExTmxkRHRjYmlJc0luWmhjaUJNYVhOMFEyRmphR1VnUFNCeVpYRjFhWEpsS0NjdUwxOU1hWE4wUTJGamFHVW5LU3hjYmlBZ0lDQnpkR0ZqYTBOc1pXRnlJRDBnY21WeGRXbHlaU2duTGk5ZmMzUmhZMnREYkdWaGNpY3BMRnh1SUNBZ0lITjBZV05yUkdWc1pYUmxJRDBnY21WeGRXbHlaU2duTGk5ZmMzUmhZMnRFWld4bGRHVW5LU3hjYmlBZ0lDQnpkR0ZqYTBkbGRDQTlJSEpsY1hWcGNtVW9KeTR2WDNOMFlXTnJSMlYwSnlrc1hHNGdJQ0FnYzNSaFkydElZWE1nUFNCeVpYRjFhWEpsS0NjdUwxOXpkR0ZqYTBoaGN5Y3BMRnh1SUNBZ0lITjBZV05yVTJWMElEMGdjbVZ4ZFdseVpTZ25MaTlmYzNSaFkydFRaWFFuS1R0Y2JseHVMeW9xWEc0Z0tpQkRjbVZoZEdWeklHRWdjM1JoWTJzZ1kyRmphR1VnYjJKcVpXTjBJSFJ2SUhOMGIzSmxJR3RsZVMxMllXeDFaU0J3WVdseWN5NWNiaUFxWEc0Z0tpQkFjSEpwZG1GMFpWeHVJQ29nUUdOdmJuTjBjblZqZEc5eVhHNGdLaUJBY0dGeVlXMGdlMEZ5Y21GNWZTQmJaVzUwY21sbGMxMGdWR2hsSUd0bGVTMTJZV3gxWlNCd1lXbHljeUIwYnlCallXTm9aUzVjYmlBcUwxeHVablZ1WTNScGIyNGdVM1JoWTJzb1pXNTBjbWxsY3lrZ2UxeHVJQ0IyWVhJZ1pHRjBZU0E5SUhSb2FYTXVYMTlrWVhSaFgxOGdQU0J1WlhjZ1RHbHpkRU5oWTJobEtHVnVkSEpwWlhNcE8xeHVJQ0IwYUdsekxuTnBlbVVnUFNCa1lYUmhMbk5wZW1VN1hHNTlYRzVjYmk4dklFRmtaQ0J0WlhSb2IyUnpJSFJ2SUdCVGRHRmphMkF1WEc1VGRHRmpheTV3Y205MGIzUjVjR1V1WTJ4bFlYSWdQU0J6ZEdGamEwTnNaV0Z5TzF4dVUzUmhZMnN1Y0hKdmRHOTBlWEJsV3lka1pXeGxkR1VuWFNBOUlITjBZV05yUkdWc1pYUmxPMXh1VTNSaFkyc3VjSEp2ZEc5MGVYQmxMbWRsZENBOUlITjBZV05yUjJWME8xeHVVM1JoWTJzdWNISnZkRzkwZVhCbExtaGhjeUE5SUhOMFlXTnJTR0Z6TzF4dVUzUmhZMnN1Y0hKdmRHOTBlWEJsTG5ObGRDQTlJSE4wWVdOclUyVjBPMXh1WEc1dGIyUjFiR1V1Wlhod2IzSjBjeUE5SUZOMFlXTnJPMXh1SWl3aUx5b3FYRzRnS2lCQklITndaV05wWVd4cGVtVmtJSFpsY25OcGIyNGdiMllnWUY4dVptOXlSV0ZqYUdBZ1ptOXlJR0Z5Y21GNWN5QjNhWFJvYjNWMElITjFjSEJ2Y25RZ1ptOXlYRzRnS2lCcGRHVnlZWFJsWlNCemFHOXlkR2hoYm1SekxseHVJQ3BjYmlBcUlFQndjbWwyWVhSbFhHNGdLaUJBY0dGeVlXMGdlMEZ5Y21GNWZTQmJZWEp5WVhsZElGUm9aU0JoY25KaGVTQjBieUJwZEdWeVlYUmxJRzkyWlhJdVhHNGdLaUJBY0dGeVlXMGdlMFoxYm1OMGFXOXVmU0JwZEdWeVlYUmxaU0JVYUdVZ1puVnVZM1JwYjI0Z2FXNTJiMnRsWkNCd1pYSWdhWFJsY21GMGFXOXVMbHh1SUNvZ1FISmxkSFZ5Ym5NZ2UwRnljbUY1ZlNCU1pYUjFjbTV6SUdCaGNuSmhlV0F1WEc0Z0tpOWNibVoxYm1OMGFXOXVJR0Z5Y21GNVJXRmphQ2hoY25KaGVTd2dhWFJsY21GMFpXVXBJSHRjYmlBZ2RtRnlJR2x1WkdWNElEMGdMVEVzWEc0Z0lDQWdJQ0JzWlc1bmRHZ2dQU0JoY25KaGVTQTlQU0J1ZFd4c0lEOGdNQ0E2SUdGeWNtRjVMbXhsYm1kMGFEdGNibHh1SUNCM2FHbHNaU0FvS3l0cGJtUmxlQ0E4SUd4bGJtZDBhQ2tnZTF4dUlDQWdJR2xtSUNocGRHVnlZWFJsWlNoaGNuSmhlVnRwYm1SbGVGMHNJR2x1WkdWNExDQmhjbkpoZVNrZ1BUMDlJR1poYkhObEtTQjdYRzRnSUNBZ0lDQmljbVZoYXp0Y2JpQWdJQ0I5WEc0Z0lIMWNiaUFnY21WMGRYSnVJR0Z5Y21GNU8xeHVmVnh1WEc1dGIyUjFiR1V1Wlhod2IzSjBjeUE5SUdGeWNtRjVSV0ZqYUR0Y2JpSXNJblpoY2lCblpYUk9ZWFJwZG1VZ1BTQnlaWEYxYVhKbEtDY3VMMTluWlhST1lYUnBkbVVuS1R0Y2JseHVkbUZ5SUdSbFptbHVaVkJ5YjNCbGNuUjVJRDBnS0daMWJtTjBhVzl1S0NrZ2UxeHVJQ0IwY25rZ2UxeHVJQ0FnSUhaaGNpQm1kVzVqSUQwZ1oyVjBUbUYwYVhabEtFOWlhbVZqZEN3Z0oyUmxabWx1WlZCeWIzQmxjblI1SnlrN1hHNGdJQ0FnWm5WdVl5aDdmU3dnSnljc0lIdDlLVHRjYmlBZ0lDQnlaWFIxY200Z1puVnVZenRjYmlBZ2ZTQmpZWFJqYUNBb1pTa2dlMzFjYm4wb0tTazdYRzVjYm0xdlpIVnNaUzVsZUhCdmNuUnpJRDBnWkdWbWFXNWxVSEp2Y0dWeWRIazdYRzRpTENKMllYSWdaR1ZtYVc1bFVISnZjR1Z5ZEhrZ1BTQnlaWEYxYVhKbEtDY3VMMTlrWldacGJtVlFjbTl3WlhKMGVTY3BPMXh1WEc0dktpcGNiaUFxSUZSb1pTQmlZWE5sSUdsdGNHeGxiV1Z1ZEdGMGFXOXVJRzltSUdCaGMzTnBaMjVXWVd4MVpXQWdZVzVrSUdCaGMzTnBaMjVOWlhKblpWWmhiSFZsWUNCM2FYUm9iM1YwWEc0Z0tpQjJZV3gxWlNCamFHVmphM011WEc0Z0tseHVJQ29nUUhCeWFYWmhkR1ZjYmlBcUlFQndZWEpoYlNCN1QySnFaV04wZlNCdlltcGxZM1FnVkdobElHOWlhbVZqZENCMGJ5QnRiMlJwWm5rdVhHNGdLaUJBY0dGeVlXMGdlM04wY21sdVozMGdhMlY1SUZSb1pTQnJaWGtnYjJZZ2RHaGxJSEJ5YjNCbGNuUjVJSFJ2SUdGemMybG5iaTVjYmlBcUlFQndZWEpoYlNCN0tuMGdkbUZzZFdVZ1ZHaGxJSFpoYkhWbElIUnZJR0Z6YzJsbmJpNWNiaUFxTDF4dVpuVnVZM1JwYjI0Z1ltRnpaVUZ6YzJsbmJsWmhiSFZsS0c5aWFtVmpkQ3dnYTJWNUxDQjJZV3gxWlNrZ2UxeHVJQ0JwWmlBb2EyVjVJRDA5SUNkZlgzQnliM1J2WDE4bklDWW1JR1JsWm1sdVpWQnliM0JsY25SNUtTQjdYRzRnSUNBZ1pHVm1hVzVsVUhKdmNHVnlkSGtvYjJKcVpXTjBMQ0JyWlhrc0lIdGNiaUFnSUNBZ0lDZGpiMjVtYVdkMWNtRmliR1VuT2lCMGNuVmxMRnh1SUNBZ0lDQWdKMlZ1ZFcxbGNtRmliR1VuT2lCMGNuVmxMRnh1SUNBZ0lDQWdKM1poYkhWbEp6b2dkbUZzZFdVc1hHNGdJQ0FnSUNBbmQzSnBkR0ZpYkdVbk9pQjBjblZsWEc0Z0lDQWdmU2s3WEc0Z0lIMGdaV3h6WlNCN1hHNGdJQ0FnYjJKcVpXTjBXMnRsZVYwZ1BTQjJZV3gxWlR0Y2JpQWdmVnh1ZlZ4dVhHNXRiMlIxYkdVdVpYaHdiM0owY3lBOUlHSmhjMlZCYzNOcFoyNVdZV3gxWlR0Y2JpSXNJblpoY2lCaVlYTmxRWE56YVdkdVZtRnNkV1VnUFNCeVpYRjFhWEpsS0NjdUwxOWlZWE5sUVhOemFXZHVWbUZzZFdVbktTeGNiaUFnSUNCbGNTQTlJSEpsY1hWcGNtVW9KeTR2WlhFbktUdGNibHh1THlvcUlGVnpaV1FnWm05eUlHSjFhV3gwTFdsdUlHMWxkR2h2WkNCeVpXWmxjbVZ1WTJWekxpQXFMMXh1ZG1GeUlHOWlhbVZqZEZCeWIzUnZJRDBnVDJKcVpXTjBMbkJ5YjNSdmRIbHdaVHRjYmx4dUx5b3FJRlZ6WldRZ2RHOGdZMmhsWTJzZ2IySnFaV04wY3lCbWIzSWdiM2R1SUhCeWIzQmxjblJwWlhNdUlDb3ZYRzUyWVhJZ2FHRnpUM2R1VUhKdmNHVnlkSGtnUFNCdlltcGxZM1JRY205MGJ5NW9ZWE5QZDI1UWNtOXdaWEowZVR0Y2JseHVMeW9xWEc0Z0tpQkJjM05wWjI1eklHQjJZV3gxWldBZ2RHOGdZR3RsZVdBZ2IyWWdZRzlpYW1WamRHQWdhV1lnZEdobElHVjRhWE4wYVc1bklIWmhiSFZsSUdseklHNXZkQ0JsY1hWcGRtRnNaVzUwWEc0Z0tpQjFjMmx1WnlCYllGTmhiV1ZXWVd4MVpWcGxjbTlnWFNob2RIUndPaTh2WldOdFlTMXBiblJsY201aGRHbHZibUZzTG05eVp5OWxZMjFoTFRJMk1pODNMakF2STNObFl5MXpZVzFsZG1Gc2RXVjZaWEp2S1Z4dUlDb2dabTl5SUdWeGRXRnNhWFI1SUdOdmJYQmhjbWx6YjI1ekxseHVJQ3BjYmlBcUlFQndjbWwyWVhSbFhHNGdLaUJBY0dGeVlXMGdlMDlpYW1WamRIMGdiMkpxWldOMElGUm9aU0J2WW1wbFkzUWdkRzhnYlc5a2FXWjVMbHh1SUNvZ1FIQmhjbUZ0SUh0emRISnBibWQ5SUd0bGVTQlVhR1VnYTJWNUlHOW1JSFJvWlNCd2NtOXdaWEowZVNCMGJ5QmhjM05wWjI0dVhHNGdLaUJBY0dGeVlXMGdleXA5SUhaaGJIVmxJRlJvWlNCMllXeDFaU0IwYnlCaGMzTnBaMjR1WEc0Z0tpOWNibVoxYm1OMGFXOXVJR0Z6YzJsbmJsWmhiSFZsS0c5aWFtVmpkQ3dnYTJWNUxDQjJZV3gxWlNrZ2UxeHVJQ0IyWVhJZ2IySnFWbUZzZFdVZ1BTQnZZbXBsWTNSYmEyVjVYVHRjYmlBZ2FXWWdLQ0VvYUdGelQzZHVVSEp2Y0dWeWRIa3VZMkZzYkNodlltcGxZM1FzSUd0bGVTa2dKaVlnWlhFb2IySnFWbUZzZFdVc0lIWmhiSFZsS1NrZ2ZIeGNiaUFnSUNBZ0lDaDJZV3gxWlNBOVBUMGdkVzVrWldacGJtVmtJQ1ltSUNFb2EyVjVJR2x1SUc5aWFtVmpkQ2twS1NCN1hHNGdJQ0FnWW1GelpVRnpjMmxuYmxaaGJIVmxLRzlpYW1WamRDd2dhMlY1TENCMllXeDFaU2s3WEc0Z0lIMWNibjFjYmx4dWJXOWtkV3hsTG1WNGNHOXlkSE1nUFNCaGMzTnBaMjVXWVd4MVpUdGNiaUlzSW5aaGNpQmhjM05wWjI1V1lXeDFaU0E5SUhKbGNYVnBjbVVvSnk0dlgyRnpjMmxuYmxaaGJIVmxKeWtzWEc0Z0lDQWdZbUZ6WlVGemMybG5ibFpoYkhWbElEMGdjbVZ4ZFdseVpTZ25MaTlmWW1GelpVRnpjMmxuYmxaaGJIVmxKeWs3WEc1Y2JpOHFLbHh1SUNvZ1EyOXdhV1Z6SUhCeWIzQmxjblJwWlhNZ2IyWWdZSE52ZFhKalpXQWdkRzhnWUc5aWFtVmpkR0F1WEc0Z0tseHVJQ29nUUhCeWFYWmhkR1ZjYmlBcUlFQndZWEpoYlNCN1QySnFaV04wZlNCemIzVnlZMlVnVkdobElHOWlhbVZqZENCMGJ5QmpiM0I1SUhCeWIzQmxjblJwWlhNZ1puSnZiUzVjYmlBcUlFQndZWEpoYlNCN1FYSnlZWGw5SUhCeWIzQnpJRlJvWlNCd2NtOXdaWEowZVNCcFpHVnVkR2xtYVdWeWN5QjBieUJqYjNCNUxseHVJQ29nUUhCaGNtRnRJSHRQWW1wbFkzUjlJRnR2WW1wbFkzUTllMzFkSUZSb1pTQnZZbXBsWTNRZ2RHOGdZMjl3ZVNCd2NtOXdaWEowYVdWeklIUnZMbHh1SUNvZ1FIQmhjbUZ0SUh0R2RXNWpkR2x2Ym4wZ1cyTjFjM1J2YldsNlpYSmRJRlJvWlNCbWRXNWpkR2x2YmlCMGJ5QmpkWE4wYjIxcGVtVWdZMjl3YVdWa0lIWmhiSFZsY3k1Y2JpQXFJRUJ5WlhSMWNtNXpJSHRQWW1wbFkzUjlJRkpsZEhWeWJuTWdZRzlpYW1WamRHQXVYRzRnS2k5Y2JtWjFibU4wYVc5dUlHTnZjSGxQWW1wbFkzUW9jMjkxY21ObExDQndjbTl3Y3l3Z2IySnFaV04wTENCamRYTjBiMjFwZW1WeUtTQjdYRzRnSUhaaGNpQnBjMDVsZHlBOUlDRnZZbXBsWTNRN1hHNGdJRzlpYW1WamRDQjhmQ0FvYjJKcVpXTjBJRDBnZTMwcE8xeHVYRzRnSUhaaGNpQnBibVJsZUNBOUlDMHhMRnh1SUNBZ0lDQWdiR1Z1WjNSb0lEMGdjSEp2Y0hNdWJHVnVaM1JvTzF4dVhHNGdJSGRvYVd4bElDZ3JLMmx1WkdWNElEd2diR1Z1WjNSb0tTQjdYRzRnSUNBZ2RtRnlJR3RsZVNBOUlIQnliM0J6VzJsdVpHVjRYVHRjYmx4dUlDQWdJSFpoY2lCdVpYZFdZV3gxWlNBOUlHTjFjM1J2YldsNlpYSmNiaUFnSUNBZ0lEOGdZM1Z6ZEc5dGFYcGxjaWh2WW1wbFkzUmJhMlY1WFN3Z2MyOTFjbU5sVzJ0bGVWMHNJR3RsZVN3Z2IySnFaV04wTENCemIzVnlZMlVwWEc0Z0lDQWdJQ0E2SUhWdVpHVm1hVzVsWkR0Y2JseHVJQ0FnSUdsbUlDaHVaWGRXWVd4MVpTQTlQVDBnZFc1a1pXWnBibVZrS1NCN1hHNGdJQ0FnSUNCdVpYZFdZV3gxWlNBOUlITnZkWEpqWlZ0clpYbGRPMXh1SUNBZ0lIMWNiaUFnSUNCcFppQW9hWE5PWlhjcElIdGNiaUFnSUNBZ0lHSmhjMlZCYzNOcFoyNVdZV3gxWlNodlltcGxZM1FzSUd0bGVTd2dibVYzVm1Gc2RXVXBPMXh1SUNBZ0lIMGdaV3h6WlNCN1hHNGdJQ0FnSUNCaGMzTnBaMjVXWVd4MVpTaHZZbXBsWTNRc0lHdGxlU3dnYm1WM1ZtRnNkV1VwTzF4dUlDQWdJSDFjYmlBZ2ZWeHVJQ0J5WlhSMWNtNGdiMkpxWldOME8xeHVmVnh1WEc1dGIyUjFiR1V1Wlhod2IzSjBjeUE5SUdOdmNIbFBZbXBsWTNRN1hHNGlMQ0l2S2lwY2JpQXFJRlJvWlNCaVlYTmxJR2x0Y0d4bGJXVnVkR0YwYVc5dUlHOW1JR0JmTG5ScGJXVnpZQ0IzYVhSb2IzVjBJSE4xY0hCdmNuUWdabTl5SUdsMFpYSmhkR1ZsSUhOb2IzSjBhR0Z1WkhOY2JpQXFJRzl5SUcxaGVDQmhjbkpoZVNCc1pXNW5kR2dnWTJobFkydHpMbHh1SUNwY2JpQXFJRUJ3Y21sMllYUmxYRzRnS2lCQWNHRnlZVzBnZTI1MWJXSmxjbjBnYmlCVWFHVWdiblZ0WW1WeUlHOW1JSFJwYldWeklIUnZJR2x1ZG05clpTQmdhWFJsY21GMFpXVmdMbHh1SUNvZ1FIQmhjbUZ0SUh0R2RXNWpkR2x2Ym4wZ2FYUmxjbUYwWldVZ1ZHaGxJR1oxYm1OMGFXOXVJR2x1ZG05clpXUWdjR1Z5SUdsMFpYSmhkR2x2Ymk1Y2JpQXFJRUJ5WlhSMWNtNXpJSHRCY25KaGVYMGdVbVYwZFhKdWN5QjBhR1VnWVhKeVlYa2diMllnY21WemRXeDBjeTVjYmlBcUwxeHVablZ1WTNScGIyNGdZbUZ6WlZScGJXVnpLRzRzSUdsMFpYSmhkR1ZsS1NCN1hHNGdJSFpoY2lCcGJtUmxlQ0E5SUMweExGeHVJQ0FnSUNBZ2NtVnpkV3gwSUQwZ1FYSnlZWGtvYmlrN1hHNWNiaUFnZDJocGJHVWdLQ3NyYVc1a1pYZ2dQQ0J1S1NCN1hHNGdJQ0FnY21WemRXeDBXMmx1WkdWNFhTQTlJR2wwWlhKaGRHVmxLR2x1WkdWNEtUdGNiaUFnZlZ4dUlDQnlaWFIxY200Z2NtVnpkV3gwTzF4dWZWeHVYRzV0YjJSMWJHVXVaWGh3YjNKMGN5QTlJR0poYzJWVWFXMWxjenRjYmlJc0lpOHFLbHh1SUNvZ1EyaGxZMnR6SUdsbUlHQjJZV3gxWldBZ2FYTWdiMkpxWldOMExXeHBhMlV1SUVFZ2RtRnNkV1VnYVhNZ2IySnFaV04wTFd4cGEyVWdhV1lnYVhRbmN5QnViM1FnWUc1MWJHeGdYRzRnS2lCaGJtUWdhR0Z6SUdFZ1lIUjVjR1Z2Wm1BZ2NtVnpkV3gwSUc5bUlGd2liMkpxWldOMFhDSXVYRzRnS2x4dUlDb2dRSE4wWVhScFkxeHVJQ29nUUcxbGJXSmxjazltSUY5Y2JpQXFJRUJ6YVc1alpTQTBMakF1TUZ4dUlDb2dRR05oZEdWbmIzSjVJRXhoYm1kY2JpQXFJRUJ3WVhKaGJTQjdLbjBnZG1Gc2RXVWdWR2hsSUhaaGJIVmxJSFJ2SUdOb1pXTnJMbHh1SUNvZ1FISmxkSFZ5Ym5NZ2UySnZiMnhsWVc1OUlGSmxkSFZ5Ym5NZ1lIUnlkV1ZnSUdsbUlHQjJZV3gxWldBZ2FYTWdiMkpxWldOMExXeHBhMlVzSUdWc2MyVWdZR1poYkhObFlDNWNiaUFxSUVCbGVHRnRjR3hsWEc0Z0tseHVJQ29nWHk1cGMwOWlhbVZqZEV4cGEyVW9lMzBwTzF4dUlDb2dMeThnUFQ0Z2RISjFaVnh1SUNwY2JpQXFJRjh1YVhOUFltcGxZM1JNYVd0bEtGc3hMQ0F5TENBelhTazdYRzRnS2lBdkx5QTlQaUIwY25WbFhHNGdLbHh1SUNvZ1h5NXBjMDlpYW1WamRFeHBhMlVvWHk1dWIyOXdLVHRjYmlBcUlDOHZJRDArSUdaaGJITmxYRzRnS2x4dUlDb2dYeTVwYzA5aWFtVmpkRXhwYTJVb2JuVnNiQ2s3WEc0Z0tpQXZMeUE5UGlCbVlXeHpaVnh1SUNvdlhHNW1kVzVqZEdsdmJpQnBjMDlpYW1WamRFeHBhMlVvZG1Gc2RXVXBJSHRjYmlBZ2NtVjBkWEp1SUhaaGJIVmxJQ0U5SUc1MWJHd2dKaVlnZEhsd1pXOW1JSFpoYkhWbElEMDlJQ2R2WW1wbFkzUW5PMXh1ZlZ4dVhHNXRiMlIxYkdVdVpYaHdiM0owY3lBOUlHbHpUMkpxWldOMFRHbHJaVHRjYmlJc0luWmhjaUJpWVhObFIyVjBWR0ZuSUQwZ2NtVnhkV2x5WlNnbkxpOWZZbUZ6WlVkbGRGUmhaeWNwTEZ4dUlDQWdJR2x6VDJKcVpXTjBUR2xyWlNBOUlISmxjWFZwY21Vb0p5NHZhWE5QWW1wbFkzUk1hV3RsSnlrN1hHNWNiaThxS2lCZ1QySnFaV04wSTNSdlUzUnlhVzVuWUNCeVpYTjFiSFFnY21WbVpYSmxibU5sY3k0Z0tpOWNiblpoY2lCaGNtZHpWR0ZuSUQwZ0oxdHZZbXBsWTNRZ1FYSm5kVzFsYm5SelhTYzdYRzVjYmk4cUtseHVJQ29nVkdobElHSmhjMlVnYVcxd2JHVnRaVzUwWVhScGIyNGdiMllnWUY4dWFYTkJjbWQxYldWdWRITmdMbHh1SUNwY2JpQXFJRUJ3Y21sMllYUmxYRzRnS2lCQWNHRnlZVzBnZXlwOUlIWmhiSFZsSUZSb1pTQjJZV3gxWlNCMGJ5QmphR1ZqYXk1Y2JpQXFJRUJ5WlhSMWNtNXpJSHRpYjI5c1pXRnVmU0JTWlhSMWNtNXpJR0IwY25WbFlDQnBaaUJnZG1Gc2RXVmdJR2x6SUdGdUlHQmhjbWQxYldWdWRITmdJRzlpYW1WamRDeGNiaUFxTDF4dVpuVnVZM1JwYjI0Z1ltRnpaVWx6UVhKbmRXMWxiblJ6S0haaGJIVmxLU0I3WEc0Z0lISmxkSFZ5YmlCcGMwOWlhbVZqZEV4cGEyVW9kbUZzZFdVcElDWW1JR0poYzJWSFpYUlVZV2NvZG1Gc2RXVXBJRDA5SUdGeVozTlVZV2M3WEc1OVhHNWNibTF2WkhWc1pTNWxlSEJ2Y25SeklEMGdZbUZ6WlVselFYSm5kVzFsYm5Sek8xeHVJaXdpZG1GeUlHSmhjMlZKYzBGeVozVnRaVzUwY3lBOUlISmxjWFZwY21Vb0p5NHZYMkpoYzJWSmMwRnlaM1Z0Wlc1MGN5Y3BMRnh1SUNBZ0lHbHpUMkpxWldOMFRHbHJaU0E5SUhKbGNYVnBjbVVvSnk0dmFYTlBZbXBsWTNSTWFXdGxKeWs3WEc1Y2JpOHFLaUJWYzJWa0lHWnZjaUJpZFdsc2RDMXBiaUJ0WlhSb2IyUWdjbVZtWlhKbGJtTmxjeTRnS2k5Y2JuWmhjaUJ2WW1wbFkzUlFjbTkwYnlBOUlFOWlhbVZqZEM1d2NtOTBiM1I1Y0dVN1hHNWNiaThxS2lCVmMyVmtJSFJ2SUdOb1pXTnJJRzlpYW1WamRITWdabTl5SUc5M2JpQndjbTl3WlhKMGFXVnpMaUFxTDF4dWRtRnlJR2hoYzA5M2JsQnliM0JsY25SNUlEMGdiMkpxWldOMFVISnZkRzh1YUdGelQzZHVVSEp2Y0dWeWRIazdYRzVjYmk4cUtpQkNkV2xzZEMxcGJpQjJZV3gxWlNCeVpXWmxjbVZ1WTJWekxpQXFMMXh1ZG1GeUlIQnliM0JsY25SNVNYTkZiblZ0WlhKaFlteGxJRDBnYjJKcVpXTjBVSEp2ZEc4dWNISnZjR1Z5ZEhsSmMwVnVkVzFsY21GaWJHVTdYRzVjYmk4cUtseHVJQ29nUTJobFkydHpJR2xtSUdCMllXeDFaV0FnYVhNZ2JHbHJaV3g1SUdGdUlHQmhjbWQxYldWdWRITmdJRzlpYW1WamRDNWNiaUFxWEc0Z0tpQkFjM1JoZEdsalhHNGdLaUJBYldWdFltVnlUMllnWDF4dUlDb2dRSE5wYm1ObElEQXVNUzR3WEc0Z0tpQkFZMkYwWldkdmNua2dUR0Z1WjF4dUlDb2dRSEJoY21GdElIc3FmU0IyWVd4MVpTQlVhR1VnZG1Gc2RXVWdkRzhnWTJobFkyc3VYRzRnS2lCQWNtVjBkWEp1Y3lCN1ltOXZiR1ZoYm4wZ1VtVjBkWEp1Y3lCZ2RISjFaV0FnYVdZZ1lIWmhiSFZsWUNCcGN5QmhiaUJnWVhKbmRXMWxiblJ6WUNCdlltcGxZM1FzWEc0Z0tpQWdaV3h6WlNCZ1ptRnNjMlZnTGx4dUlDb2dRR1Y0WVcxd2JHVmNiaUFxWEc0Z0tpQmZMbWx6UVhKbmRXMWxiblJ6S0daMWJtTjBhVzl1S0NrZ2V5QnlaWFIxY200Z1lYSm5kVzFsYm5Sek95QjlLQ2twTzF4dUlDb2dMeThnUFQ0Z2RISjFaVnh1SUNwY2JpQXFJRjh1YVhOQmNtZDFiV1Z1ZEhNb1d6RXNJRElzSUROZEtUdGNiaUFxSUM4dklEMCtJR1poYkhObFhHNGdLaTljYm5aaGNpQnBjMEZ5WjNWdFpXNTBjeUE5SUdKaGMyVkpjMEZ5WjNWdFpXNTBjeWhtZFc1amRHbHZiaWdwSUhzZ2NtVjBkWEp1SUdGeVozVnRaVzUwY3pzZ2ZTZ3BLU0EvSUdKaGMyVkpjMEZ5WjNWdFpXNTBjeUE2SUdaMWJtTjBhVzl1S0haaGJIVmxLU0I3WEc0Z0lISmxkSFZ5YmlCcGMwOWlhbVZqZEV4cGEyVW9kbUZzZFdVcElDWW1JR2hoYzA5M2JsQnliM0JsY25SNUxtTmhiR3dvZG1Gc2RXVXNJQ2RqWVd4c1pXVW5LU0FtSmx4dUlDQWdJQ0Z3Y205d1pYSjBlVWx6Ulc1MWJXVnlZV0pzWlM1allXeHNLSFpoYkhWbExDQW5ZMkZzYkdWbEp5azdYRzU5TzF4dVhHNXRiMlIxYkdVdVpYaHdiM0owY3lBOUlHbHpRWEpuZFcxbGJuUnpPMXh1SWl3aUx5b3FYRzRnS2lCRGFHVmphM01nYVdZZ1lIWmhiSFZsWUNCcGN5QmpiR0Z6YzJsbWFXVmtJR0Z6SUdGdUlHQkJjbkpoZVdBZ2IySnFaV04wTGx4dUlDcGNiaUFxSUVCemRHRjBhV05jYmlBcUlFQnRaVzFpWlhKUFppQmZYRzRnS2lCQWMybHVZMlVnTUM0eExqQmNiaUFxSUVCallYUmxaMjl5ZVNCTVlXNW5YRzRnS2lCQWNHRnlZVzBnZXlwOUlIWmhiSFZsSUZSb1pTQjJZV3gxWlNCMGJ5QmphR1ZqYXk1Y2JpQXFJRUJ5WlhSMWNtNXpJSHRpYjI5c1pXRnVmU0JTWlhSMWNtNXpJR0IwY25WbFlDQnBaaUJnZG1Gc2RXVmdJR2x6SUdGdUlHRnljbUY1TENCbGJITmxJR0JtWVd4elpXQXVYRzRnS2lCQVpYaGhiWEJzWlZ4dUlDcGNiaUFxSUY4dWFYTkJjbkpoZVNoYk1Td2dNaXdnTTEwcE8xeHVJQ29nTHk4Z1BUNGdkSEoxWlZ4dUlDcGNiaUFxSUY4dWFYTkJjbkpoZVNoa2IyTjFiV1Z1ZEM1aWIyUjVMbU5vYVd4a2NtVnVLVHRjYmlBcUlDOHZJRDArSUdaaGJITmxYRzRnS2x4dUlDb2dYeTVwYzBGeWNtRjVLQ2RoWW1NbktUdGNiaUFxSUM4dklEMCtJR1poYkhObFhHNGdLbHh1SUNvZ1h5NXBjMEZ5Y21GNUtGOHVibTl2Y0NrN1hHNGdLaUF2THlBOVBpQm1ZV3h6WlZ4dUlDb3ZYRzUyWVhJZ2FYTkJjbkpoZVNBOUlFRnljbUY1TG1selFYSnlZWGs3WEc1Y2JtMXZaSFZzWlM1bGVIQnZjblJ6SUQwZ2FYTkJjbkpoZVR0Y2JpSXNJaThxS2x4dUlDb2dWR2hwY3lCdFpYUm9iMlFnY21WMGRYSnVjeUJnWm1Gc2MyVmdMbHh1SUNwY2JpQXFJRUJ6ZEdGMGFXTmNiaUFxSUVCdFpXMWlaWEpQWmlCZlhHNGdLaUJBYzJsdVkyVWdOQzR4TXk0d1hHNGdLaUJBWTJGMFpXZHZjbmtnVlhScGJGeHVJQ29nUUhKbGRIVnlibk1nZTJKdmIyeGxZVzU5SUZKbGRIVnlibk1nWUdaaGJITmxZQzVjYmlBcUlFQmxlR0Z0Y0d4bFhHNGdLbHh1SUNvZ1h5NTBhVzFsY3lneUxDQmZMbk4wZFdKR1lXeHpaU2s3WEc0Z0tpQXZMeUE5UGlCYlptRnNjMlVzSUdaaGJITmxYVnh1SUNvdlhHNW1kVzVqZEdsdmJpQnpkSFZpUm1Gc2MyVW9LU0I3WEc0Z0lISmxkSFZ5YmlCbVlXeHpaVHRjYm4xY2JseHViVzlrZFd4bExtVjRjRzl5ZEhNZ1BTQnpkSFZpUm1Gc2MyVTdYRzRpTENKMllYSWdjbTl2ZENBOUlISmxjWFZwY21Vb0p5NHZYM0p2YjNRbktTeGNiaUFnSUNCemRIVmlSbUZzYzJVZ1BTQnlaWEYxYVhKbEtDY3VMM04wZFdKR1lXeHpaU2NwTzF4dVhHNHZLaW9nUkdWMFpXTjBJR1p5WldVZ2RtRnlhV0ZpYkdVZ1lHVjRjRzl5ZEhOZ0xpQXFMMXh1ZG1GeUlHWnlaV1ZGZUhCdmNuUnpJRDBnZEhsd1pXOW1JR1Y0Y0c5eWRITWdQVDBnSjI5aWFtVmpkQ2NnSmlZZ1pYaHdiM0owY3lBbUppQWhaWGh3YjNKMGN5NXViMlJsVkhsd1pTQW1KaUJsZUhCdmNuUnpPMXh1WEc0dktpb2dSR1YwWldOMElHWnlaV1VnZG1GeWFXRmliR1VnWUcxdlpIVnNaV0F1SUNvdlhHNTJZWElnWm5KbFpVMXZaSFZzWlNBOUlHWnlaV1ZGZUhCdmNuUnpJQ1ltSUhSNWNHVnZaaUJ0YjJSMWJHVWdQVDBnSjI5aWFtVmpkQ2NnSmlZZ2JXOWtkV3hsSUNZbUlDRnRiMlIxYkdVdWJtOWtaVlI1Y0dVZ0ppWWdiVzlrZFd4bE8xeHVYRzR2S2lvZ1JHVjBaV04wSUhSb1pTQndiM0IxYkdGeUlFTnZiVzF2YmtwVElHVjRkR1Z1YzJsdmJpQmdiVzlrZFd4bExtVjRjRzl5ZEhOZ0xpQXFMMXh1ZG1GeUlHMXZaSFZzWlVWNGNHOXlkSE1nUFNCbWNtVmxUVzlrZFd4bElDWW1JR1p5WldWTmIyUjFiR1V1Wlhod2IzSjBjeUE5UFQwZ1puSmxaVVY0Y0c5eWRITTdYRzVjYmk4cUtpQkNkV2xzZEMxcGJpQjJZV3gxWlNCeVpXWmxjbVZ1WTJWekxpQXFMMXh1ZG1GeUlFSjFabVpsY2lBOUlHMXZaSFZzWlVWNGNHOXlkSE1nUHlCeWIyOTBMa0oxWm1abGNpQTZJSFZ1WkdWbWFXNWxaRHRjYmx4dUx5b2dRblZwYkhRdGFXNGdiV1YwYUc5a0lISmxabVZ5Wlc1alpYTWdabTl5SUhSb2IzTmxJSGRwZEdnZ2RHaGxJSE5oYldVZ2JtRnRaU0JoY3lCdmRHaGxjaUJnYkc5a1lYTm9ZQ0J0WlhSb2IyUnpMaUFxTDF4dWRtRnlJRzVoZEdsMlpVbHpRblZtWm1WeUlEMGdRblZtWm1WeUlEOGdRblZtWm1WeUxtbHpRblZtWm1WeUlEb2dkVzVrWldacGJtVmtPMXh1WEc0dktpcGNiaUFxSUVOb1pXTnJjeUJwWmlCZ2RtRnNkV1ZnSUdseklHRWdZblZtWm1WeUxseHVJQ3BjYmlBcUlFQnpkR0YwYVdOY2JpQXFJRUJ0WlcxaVpYSlBaaUJmWEc0Z0tpQkFjMmx1WTJVZ05DNHpMakJjYmlBcUlFQmpZWFJsWjI5eWVTQk1ZVzVuWEc0Z0tpQkFjR0Z5WVcwZ2V5cDlJSFpoYkhWbElGUm9aU0IyWVd4MVpTQjBieUJqYUdWamF5NWNiaUFxSUVCeVpYUjFjbTV6SUh0aWIyOXNaV0Z1ZlNCU1pYUjFjbTV6SUdCMGNuVmxZQ0JwWmlCZ2RtRnNkV1ZnSUdseklHRWdZblZtWm1WeUxDQmxiSE5sSUdCbVlXeHpaV0F1WEc0Z0tpQkFaWGhoYlhCc1pWeHVJQ3BjYmlBcUlGOHVhWE5DZFdabVpYSW9ibVYzSUVKMVptWmxjaWd5S1NrN1hHNGdLaUF2THlBOVBpQjBjblZsWEc0Z0tseHVJQ29nWHk1cGMwSjFabVpsY2lodVpYY2dWV2x1ZERoQmNuSmhlU2d5S1NrN1hHNGdLaUF2THlBOVBpQm1ZV3h6WlZ4dUlDb3ZYRzUyWVhJZ2FYTkNkV1ptWlhJZ1BTQnVZWFJwZG1WSmMwSjFabVpsY2lCOGZDQnpkSFZpUm1Gc2MyVTdYRzVjYm0xdlpIVnNaUzVsZUhCdmNuUnpJRDBnYVhOQ2RXWm1aWEk3WEc0aUxDSXZLaW9nVlhObFpDQmhjeUJ5WldabGNtVnVZMlZ6SUdadmNpQjJZWEpwYjNWeklHQk9kVzFpWlhKZ0lHTnZibk4wWVc1MGN5NGdLaTljYm5aaGNpQk5RVmhmVTBGR1JWOUpUbFJGUjBWU0lEMGdPVEF3TnpFNU9USTFORGMwTURrNU1UdGNibHh1THlvcUlGVnpaV1FnZEc4Z1pHVjBaV04wSUhWdWMybG5ibVZrSUdsdWRHVm5aWElnZG1Gc2RXVnpMaUFxTDF4dWRtRnlJSEpsU1hOVmFXNTBJRDBnTDE0b1B6b3dmRnN4TFRsZFhGeGtLaWtrTHp0Y2JseHVMeW9xWEc0Z0tpQkRhR1ZqYTNNZ2FXWWdZSFpoYkhWbFlDQnBjeUJoSUhaaGJHbGtJR0Z5Y21GNUxXeHBhMlVnYVc1a1pYZ3VYRzRnS2x4dUlDb2dRSEJ5YVhaaGRHVmNiaUFxSUVCd1lYSmhiU0I3S24wZ2RtRnNkV1VnVkdobElIWmhiSFZsSUhSdklHTm9aV05yTGx4dUlDb2dRSEJoY21GdElIdHVkVzFpWlhKOUlGdHNaVzVuZEdnOVRVRllYMU5CUmtWZlNVNVVSVWRGVWwwZ1ZHaGxJSFZ3Y0dWeUlHSnZkVzVrY3lCdlppQmhJSFpoYkdsa0lHbHVaR1Y0TGx4dUlDb2dRSEpsZEhWeWJuTWdlMkp2YjJ4bFlXNTlJRkpsZEhWeWJuTWdZSFJ5ZFdWZ0lHbG1JR0IyWVd4MVpXQWdhWE1nWVNCMllXeHBaQ0JwYm1SbGVDd2daV3h6WlNCZ1ptRnNjMlZnTGx4dUlDb3ZYRzVtZFc1amRHbHZiaUJwYzBsdVpHVjRLSFpoYkhWbExDQnNaVzVuZEdncElIdGNiaUFnYkdWdVozUm9JRDBnYkdWdVozUm9JRDA5SUc1MWJHd2dQeUJOUVZoZlUwRkdSVjlKVGxSRlIwVlNJRG9nYkdWdVozUm9PMXh1SUNCeVpYUjFjbTRnSVNGc1pXNW5kR2dnSmlaY2JpQWdJQ0FvZEhsd1pXOW1JSFpoYkhWbElEMDlJQ2R1ZFcxaVpYSW5JSHg4SUhKbFNYTlZhVzUwTG5SbGMzUW9kbUZzZFdVcEtTQW1KbHh1SUNBZ0lDaDJZV3gxWlNBK0lDMHhJQ1ltSUhaaGJIVmxJQ1VnTVNBOVBTQXdJQ1ltSUhaaGJIVmxJRHdnYkdWdVozUm9LVHRjYm4xY2JseHViVzlrZFd4bExtVjRjRzl5ZEhNZ1BTQnBjMGx1WkdWNE8xeHVJaXdpTHlvcUlGVnpaV1FnWVhNZ2NtVm1aWEpsYm1ObGN5Qm1iM0lnZG1GeWFXOTFjeUJnVG5WdFltVnlZQ0JqYjI1emRHRnVkSE11SUNvdlhHNTJZWElnVFVGWVgxTkJSa1ZmU1U1VVJVZEZVaUE5SURrd01EY3hPVGt5TlRRM05EQTVPVEU3WEc1Y2JpOHFLbHh1SUNvZ1EyaGxZMnR6SUdsbUlHQjJZV3gxWldBZ2FYTWdZU0IyWVd4cFpDQmhjbkpoZVMxc2FXdGxJR3hsYm1kMGFDNWNiaUFxWEc0Z0tpQXFLazV2ZEdVNktpb2dWR2hwY3lCdFpYUm9iMlFnYVhNZ2JHOXZjMlZzZVNCaVlYTmxaQ0J2Ymx4dUlDb2dXMkJVYjB4bGJtZDBhR0JkS0doMGRIQTZMeTlsWTIxaExXbHVkR1Z5Ym1GMGFXOXVZV3d1YjNKbkwyVmpiV0V0TWpZeUx6Y3VNQzhqYzJWakxYUnZiR1Z1WjNSb0tTNWNiaUFxWEc0Z0tpQkFjM1JoZEdsalhHNGdLaUJBYldWdFltVnlUMllnWDF4dUlDb2dRSE5wYm1ObElEUXVNQzR3WEc0Z0tpQkFZMkYwWldkdmNua2dUR0Z1WjF4dUlDb2dRSEJoY21GdElIc3FmU0IyWVd4MVpTQlVhR1VnZG1Gc2RXVWdkRzhnWTJobFkyc3VYRzRnS2lCQWNtVjBkWEp1Y3lCN1ltOXZiR1ZoYm4wZ1VtVjBkWEp1Y3lCZ2RISjFaV0FnYVdZZ1lIWmhiSFZsWUNCcGN5QmhJSFpoYkdsa0lHeGxibWQwYUN3Z1pXeHpaU0JnWm1Gc2MyVmdMbHh1SUNvZ1FHVjRZVzF3YkdWY2JpQXFYRzRnS2lCZkxtbHpUR1Z1WjNSb0tETXBPMXh1SUNvZ0x5OGdQVDRnZEhKMVpWeHVJQ3BjYmlBcUlGOHVhWE5NWlc1bmRHZ29UblZ0WW1WeUxrMUpUbDlXUVV4VlJTazdYRzRnS2lBdkx5QTlQaUJtWVd4elpWeHVJQ3BjYmlBcUlGOHVhWE5NWlc1bmRHZ29TVzVtYVc1cGRIa3BPMXh1SUNvZ0x5OGdQVDRnWm1Gc2MyVmNiaUFxWEc0Z0tpQmZMbWx6VEdWdVozUm9LQ2N6SnlrN1hHNGdLaUF2THlBOVBpQm1ZV3h6WlZ4dUlDb3ZYRzVtZFc1amRHbHZiaUJwYzB4bGJtZDBhQ2gyWVd4MVpTa2dlMXh1SUNCeVpYUjFjbTRnZEhsd1pXOW1JSFpoYkhWbElEMDlJQ2R1ZFcxaVpYSW5JQ1ltWEc0Z0lDQWdkbUZzZFdVZ1BpQXRNU0FtSmlCMllXeDFaU0FsSURFZ1BUMGdNQ0FtSmlCMllXeDFaU0E4UFNCTlFWaGZVMEZHUlY5SlRsUkZSMFZTTzF4dWZWeHVYRzV0YjJSMWJHVXVaWGh3YjNKMGN5QTlJR2x6VEdWdVozUm9PMXh1SWl3aWRtRnlJR0poYzJWSFpYUlVZV2NnUFNCeVpYRjFhWEpsS0NjdUwxOWlZWE5sUjJWMFZHRm5KeWtzWEc0Z0lDQWdhWE5NWlc1bmRHZ2dQU0J5WlhGMWFYSmxLQ2N1TDJselRHVnVaM1JvSnlrc1hHNGdJQ0FnYVhOUFltcGxZM1JNYVd0bElEMGdjbVZ4ZFdseVpTZ25MaTlwYzA5aWFtVmpkRXhwYTJVbktUdGNibHh1THlvcUlHQlBZbXBsWTNRamRHOVRkSEpwYm1kZ0lISmxjM1ZzZENCeVpXWmxjbVZ1WTJWekxpQXFMMXh1ZG1GeUlHRnlaM05VWVdjZ1BTQW5XMjlpYW1WamRDQkJjbWQxYldWdWRITmRKeXhjYmlBZ0lDQmhjbkpoZVZSaFp5QTlJQ2RiYjJKcVpXTjBJRUZ5Y21GNVhTY3NYRzRnSUNBZ1ltOXZiRlJoWnlBOUlDZGJiMkpxWldOMElFSnZiMnhsWVc1ZEp5eGNiaUFnSUNCa1lYUmxWR0ZuSUQwZ0oxdHZZbXBsWTNRZ1JHRjBaVjBuTEZ4dUlDQWdJR1Z5Y205eVZHRm5JRDBnSjF0dlltcGxZM1FnUlhKeWIzSmRKeXhjYmlBZ0lDQm1kVzVqVkdGbklEMGdKMXR2WW1wbFkzUWdSblZ1WTNScGIyNWRKeXhjYmlBZ0lDQnRZWEJVWVdjZ1BTQW5XMjlpYW1WamRDQk5ZWEJkSnl4Y2JpQWdJQ0J1ZFcxaVpYSlVZV2NnUFNBblcyOWlhbVZqZENCT2RXMWlaWEpkSnl4Y2JpQWdJQ0J2WW1wbFkzUlVZV2NnUFNBblcyOWlhbVZqZENCUFltcGxZM1JkSnl4Y2JpQWdJQ0J5WldkbGVIQlVZV2NnUFNBblcyOWlhbVZqZENCU1pXZEZlSEJkSnl4Y2JpQWdJQ0J6WlhSVVlXY2dQU0FuVzI5aWFtVmpkQ0JUWlhSZEp5eGNiaUFnSUNCemRISnBibWRVWVdjZ1BTQW5XMjlpYW1WamRDQlRkSEpwYm1kZEp5eGNiaUFnSUNCM1pXRnJUV0Z3VkdGbklEMGdKMXR2WW1wbFkzUWdWMlZoYTAxaGNGMG5PMXh1WEc1MllYSWdZWEp5WVhsQ2RXWm1aWEpVWVdjZ1BTQW5XMjlpYW1WamRDQkJjbkpoZVVKMVptWmxjbDBuTEZ4dUlDQWdJR1JoZEdGV2FXVjNWR0ZuSUQwZ0oxdHZZbXBsWTNRZ1JHRjBZVlpwWlhkZEp5eGNiaUFnSUNCbWJHOWhkRE15VkdGbklEMGdKMXR2WW1wbFkzUWdSbXh2WVhRek1rRnljbUY1WFNjc1hHNGdJQ0FnWm14dllYUTJORlJoWnlBOUlDZGJiMkpxWldOMElFWnNiMkYwTmpSQmNuSmhlVjBuTEZ4dUlDQWdJR2x1ZERoVVlXY2dQU0FuVzI5aWFtVmpkQ0JKYm5RNFFYSnlZWGxkSnl4Y2JpQWdJQ0JwYm5ReE5sUmhaeUE5SUNkYmIySnFaV04wSUVsdWRERTJRWEp5WVhsZEp5eGNiaUFnSUNCcGJuUXpNbFJoWnlBOUlDZGJiMkpxWldOMElFbHVkRE15UVhKeVlYbGRKeXhjYmlBZ0lDQjFhVzUwT0ZSaFp5QTlJQ2RiYjJKcVpXTjBJRlZwYm5RNFFYSnlZWGxkSnl4Y2JpQWdJQ0IxYVc1ME9FTnNZVzF3WldSVVlXY2dQU0FuVzI5aWFtVmpkQ0JWYVc1ME9FTnNZVzF3WldSQmNuSmhlVjBuTEZ4dUlDQWdJSFZwYm5ReE5sUmhaeUE5SUNkYmIySnFaV04wSUZWcGJuUXhOa0Z5Y21GNVhTY3NYRzRnSUNBZ2RXbHVkRE15VkdGbklEMGdKMXR2WW1wbFkzUWdWV2x1ZERNeVFYSnlZWGxkSnp0Y2JseHVMeW9xSUZWelpXUWdkRzhnYVdSbGJuUnBabmtnWUhSdlUzUnlhVzVuVkdGbllDQjJZV3gxWlhNZ2IyWWdkSGx3WldRZ1lYSnlZWGx6TGlBcUwxeHVkbUZ5SUhSNWNHVmtRWEp5WVhsVVlXZHpJRDBnZTMwN1hHNTBlWEJsWkVGeWNtRjVWR0ZuYzF0bWJHOWhkRE15VkdGblhTQTlJSFI1Y0dWa1FYSnlZWGxVWVdkelcyWnNiMkYwTmpSVVlXZGRJRDFjYm5SNWNHVmtRWEp5WVhsVVlXZHpXMmx1ZERoVVlXZGRJRDBnZEhsd1pXUkJjbkpoZVZSaFozTmJhVzUwTVRaVVlXZGRJRDFjYm5SNWNHVmtRWEp5WVhsVVlXZHpXMmx1ZERNeVZHRm5YU0E5SUhSNWNHVmtRWEp5WVhsVVlXZHpXM1ZwYm5RNFZHRm5YU0E5WEc1MGVYQmxaRUZ5Y21GNVZHRm5jMXQxYVc1ME9FTnNZVzF3WldSVVlXZGRJRDBnZEhsd1pXUkJjbkpoZVZSaFozTmJkV2x1ZERFMlZHRm5YU0E5WEc1MGVYQmxaRUZ5Y21GNVZHRm5jMXQxYVc1ME16SlVZV2RkSUQwZ2RISjFaVHRjYm5SNWNHVmtRWEp5WVhsVVlXZHpXMkZ5WjNOVVlXZGRJRDBnZEhsd1pXUkJjbkpoZVZSaFozTmJZWEp5WVhsVVlXZGRJRDFjYm5SNWNHVmtRWEp5WVhsVVlXZHpXMkZ5Y21GNVFuVm1abVZ5VkdGblhTQTlJSFI1Y0dWa1FYSnlZWGxVWVdkelcySnZiMnhVWVdkZElEMWNiblI1Y0dWa1FYSnlZWGxVWVdkelcyUmhkR0ZXYVdWM1ZHRm5YU0E5SUhSNWNHVmtRWEp5WVhsVVlXZHpXMlJoZEdWVVlXZGRJRDFjYm5SNWNHVmtRWEp5WVhsVVlXZHpXMlZ5Y205eVZHRm5YU0E5SUhSNWNHVmtRWEp5WVhsVVlXZHpXMloxYm1OVVlXZGRJRDFjYm5SNWNHVmtRWEp5WVhsVVlXZHpXMjFoY0ZSaFoxMGdQU0IwZVhCbFpFRnljbUY1VkdGbmMxdHVkVzFpWlhKVVlXZGRJRDFjYm5SNWNHVmtRWEp5WVhsVVlXZHpXMjlpYW1WamRGUmhaMTBnUFNCMGVYQmxaRUZ5Y21GNVZHRm5jMXR5WldkbGVIQlVZV2RkSUQxY2JuUjVjR1ZrUVhKeVlYbFVZV2R6VzNObGRGUmhaMTBnUFNCMGVYQmxaRUZ5Y21GNVZHRm5jMXR6ZEhKcGJtZFVZV2RkSUQxY2JuUjVjR1ZrUVhKeVlYbFVZV2R6VzNkbFlXdE5ZWEJVWVdkZElEMGdabUZzYzJVN1hHNWNiaThxS2x4dUlDb2dWR2hsSUdKaGMyVWdhVzF3YkdWdFpXNTBZWFJwYjI0Z2IyWWdZRjh1YVhOVWVYQmxaRUZ5Y21GNVlDQjNhWFJvYjNWMElFNXZaR1V1YW5NZ2IzQjBhVzFwZW1GMGFXOXVjeTVjYmlBcVhHNGdLaUJBY0hKcGRtRjBaVnh1SUNvZ1FIQmhjbUZ0SUhzcWZTQjJZV3gxWlNCVWFHVWdkbUZzZFdVZ2RHOGdZMmhsWTJzdVhHNGdLaUJBY21WMGRYSnVjeUI3WW05dmJHVmhibjBnVW1WMGRYSnVjeUJnZEhKMVpXQWdhV1lnWUhaaGJIVmxZQ0JwY3lCaElIUjVjR1ZrSUdGeWNtRjVMQ0JsYkhObElHQm1ZV3h6WldBdVhHNGdLaTljYm1aMWJtTjBhVzl1SUdKaGMyVkpjMVI1Y0dWa1FYSnlZWGtvZG1Gc2RXVXBJSHRjYmlBZ2NtVjBkWEp1SUdselQySnFaV04wVEdsclpTaDJZV3gxWlNrZ0ppWmNiaUFnSUNCcGMweGxibWQwYUNoMllXeDFaUzVzWlc1bmRHZ3BJQ1ltSUNFaGRIbHdaV1JCY25KaGVWUmhaM05iWW1GelpVZGxkRlJoWnloMllXeDFaU2xkTzF4dWZWeHVYRzV0YjJSMWJHVXVaWGh3YjNKMGN5QTlJR0poYzJWSmMxUjVjR1ZrUVhKeVlYazdYRzRpTENJdktpcGNiaUFxSUZSb1pTQmlZWE5sSUdsdGNHeGxiV1Z1ZEdGMGFXOXVJRzltSUdCZkxuVnVZWEo1WUNCM2FYUm9iM1YwSUhOMWNIQnZjblFnWm05eUlITjBiM0pwYm1jZ2JXVjBZV1JoZEdFdVhHNGdLbHh1SUNvZ1FIQnlhWFpoZEdWY2JpQXFJRUJ3WVhKaGJTQjdSblZ1WTNScGIyNTlJR1oxYm1NZ1ZHaGxJR1oxYm1OMGFXOXVJSFJ2SUdOaGNDQmhjbWQxYldWdWRITWdabTl5TGx4dUlDb2dRSEpsZEhWeWJuTWdlMFoxYm1OMGFXOXVmU0JTWlhSMWNtNXpJSFJvWlNCdVpYY2dZMkZ3Y0dWa0lHWjFibU4wYVc5dUxseHVJQ292WEc1bWRXNWpkR2x2YmlCaVlYTmxWVzVoY25rb1puVnVZeWtnZTF4dUlDQnlaWFIxY200Z1puVnVZM1JwYjI0b2RtRnNkV1VwSUh0Y2JpQWdJQ0J5WlhSMWNtNGdablZ1WXloMllXeDFaU2s3WEc0Z0lIMDdYRzU5WEc1Y2JtMXZaSFZzWlM1bGVIQnZjblJ6SUQwZ1ltRnpaVlZ1WVhKNU8xeHVJaXdpZG1GeUlHWnlaV1ZIYkc5aVlXd2dQU0J5WlhGMWFYSmxLQ2N1TDE5bWNtVmxSMnh2WW1Gc0p5azdYRzVjYmk4cUtpQkVaWFJsWTNRZ1puSmxaU0IyWVhKcFlXSnNaU0JnWlhod2IzSjBjMkF1SUNvdlhHNTJZWElnWm5KbFpVVjRjRzl5ZEhNZ1BTQjBlWEJsYjJZZ1pYaHdiM0owY3lBOVBTQW5iMkpxWldOMEp5QW1KaUJsZUhCdmNuUnpJQ1ltSUNGbGVIQnZjblJ6TG01dlpHVlVlWEJsSUNZbUlHVjRjRzl5ZEhNN1hHNWNiaThxS2lCRVpYUmxZM1FnWm5KbFpTQjJZWEpwWVdKc1pTQmdiVzlrZFd4bFlDNGdLaTljYm5aaGNpQm1jbVZsVFc5a2RXeGxJRDBnWm5KbFpVVjRjRzl5ZEhNZ0ppWWdkSGx3Wlc5bUlHMXZaSFZzWlNBOVBTQW5iMkpxWldOMEp5QW1KaUJ0YjJSMWJHVWdKaVlnSVcxdlpIVnNaUzV1YjJSbFZIbHdaU0FtSmlCdGIyUjFiR1U3WEc1Y2JpOHFLaUJFWlhSbFkzUWdkR2hsSUhCdmNIVnNZWElnUTI5dGJXOXVTbE1nWlhoMFpXNXphVzl1SUdCdGIyUjFiR1V1Wlhod2IzSjBjMkF1SUNvdlhHNTJZWElnYlc5a2RXeGxSWGh3YjNKMGN5QTlJR1p5WldWTmIyUjFiR1VnSmlZZ1puSmxaVTF2WkhWc1pTNWxlSEJ2Y25SeklEMDlQU0JtY21WbFJYaHdiM0owY3p0Y2JseHVMeW9xSUVSbGRHVmpkQ0JtY21WbElIWmhjbWxoWW14bElHQndjbTlqWlhOellDQm1jbTl0SUU1dlpHVXVhbk11SUNvdlhHNTJZWElnWm5KbFpWQnliMk5sYzNNZ1BTQnRiMlIxYkdWRmVIQnZjblJ6SUNZbUlHWnlaV1ZIYkc5aVlXd3VjSEp2WTJWemN6dGNibHh1THlvcUlGVnpaV1FnZEc4Z1lXTmpaWE56SUdaaGMzUmxjaUJPYjJSbExtcHpJR2hsYkhCbGNuTXVJQ292WEc1MllYSWdibTlrWlZWMGFXd2dQU0FvWm5WdVkzUnBiMjRvS1NCN1hHNGdJSFJ5ZVNCN1hHNGdJQ0FnY21WMGRYSnVJR1p5WldWUWNtOWpaWE56SUNZbUlHWnlaV1ZRY205alpYTnpMbUpwYm1ScGJtY2dKaVlnWm5KbFpWQnliMk5sYzNNdVltbHVaR2x1WnlnbmRYUnBiQ2NwTzF4dUlDQjlJR05oZEdOb0lDaGxLU0I3ZlZ4dWZTZ3BLVHRjYmx4dWJXOWtkV3hsTG1WNGNHOXlkSE1nUFNCdWIyUmxWWFJwYkR0Y2JpSXNJblpoY2lCaVlYTmxTWE5VZVhCbFpFRnljbUY1SUQwZ2NtVnhkV2x5WlNnbkxpOWZZbUZ6WlVselZIbHdaV1JCY25KaGVTY3BMRnh1SUNBZ0lHSmhjMlZWYm1GeWVTQTlJSEpsY1hWcGNtVW9KeTR2WDJKaGMyVlZibUZ5ZVNjcExGeHVJQ0FnSUc1dlpHVlZkR2xzSUQwZ2NtVnhkV2x5WlNnbkxpOWZibTlrWlZWMGFXd25LVHRjYmx4dUx5b2dUbTlrWlM1cWN5Qm9aV3h3WlhJZ2NtVm1aWEpsYm1ObGN5NGdLaTljYm5aaGNpQnViMlJsU1hOVWVYQmxaRUZ5Y21GNUlEMGdibTlrWlZWMGFXd2dKaVlnYm05a1pWVjBhV3d1YVhOVWVYQmxaRUZ5Y21GNU8xeHVYRzR2S2lwY2JpQXFJRU5vWldOcmN5QnBaaUJnZG1Gc2RXVmdJR2x6SUdOc1lYTnphV1pwWldRZ1lYTWdZU0IwZVhCbFpDQmhjbkpoZVM1Y2JpQXFYRzRnS2lCQWMzUmhkR2xqWEc0Z0tpQkFiV1Z0WW1WeVQyWWdYMXh1SUNvZ1FITnBibU5sSURNdU1DNHdYRzRnS2lCQVkyRjBaV2R2Y25rZ1RHRnVaMXh1SUNvZ1FIQmhjbUZ0SUhzcWZTQjJZV3gxWlNCVWFHVWdkbUZzZFdVZ2RHOGdZMmhsWTJzdVhHNGdLaUJBY21WMGRYSnVjeUI3WW05dmJHVmhibjBnVW1WMGRYSnVjeUJnZEhKMVpXQWdhV1lnWUhaaGJIVmxZQ0JwY3lCaElIUjVjR1ZrSUdGeWNtRjVMQ0JsYkhObElHQm1ZV3h6WldBdVhHNGdLaUJBWlhoaGJYQnNaVnh1SUNwY2JpQXFJRjh1YVhOVWVYQmxaRUZ5Y21GNUtHNWxkeUJWYVc1ME9FRnljbUY1S1R0Y2JpQXFJQzh2SUQwK0lIUnlkV1ZjYmlBcVhHNGdLaUJmTG1selZIbHdaV1JCY25KaGVTaGJYU2s3WEc0Z0tpQXZMeUE5UGlCbVlXeHpaVnh1SUNvdlhHNTJZWElnYVhOVWVYQmxaRUZ5Y21GNUlEMGdibTlrWlVselZIbHdaV1JCY25KaGVTQS9JR0poYzJWVmJtRnllU2h1YjJSbFNYTlVlWEJsWkVGeWNtRjVLU0E2SUdKaGMyVkpjMVI1Y0dWa1FYSnlZWGs3WEc1Y2JtMXZaSFZzWlM1bGVIQnZjblJ6SUQwZ2FYTlVlWEJsWkVGeWNtRjVPMXh1SWl3aWRtRnlJR0poYzJWVWFXMWxjeUE5SUhKbGNYVnBjbVVvSnk0dlgySmhjMlZVYVcxbGN5Y3BMRnh1SUNBZ0lHbHpRWEpuZFcxbGJuUnpJRDBnY21WeGRXbHlaU2duTGk5cGMwRnlaM1Z0Wlc1MGN5Y3BMRnh1SUNBZ0lHbHpRWEp5WVhrZ1BTQnlaWEYxYVhKbEtDY3VMMmx6UVhKeVlYa25LU3hjYmlBZ0lDQnBjMEoxWm1abGNpQTlJSEpsY1hWcGNtVW9KeTR2YVhOQ2RXWm1aWEluS1N4Y2JpQWdJQ0JwYzBsdVpHVjRJRDBnY21WeGRXbHlaU2duTGk5ZmFYTkpibVJsZUNjcExGeHVJQ0FnSUdselZIbHdaV1JCY25KaGVTQTlJSEpsY1hWcGNtVW9KeTR2YVhOVWVYQmxaRUZ5Y21GNUp5azdYRzVjYmk4cUtpQlZjMlZrSUdadmNpQmlkV2xzZEMxcGJpQnRaWFJvYjJRZ2NtVm1aWEpsYm1ObGN5NGdLaTljYm5aaGNpQnZZbXBsWTNSUWNtOTBieUE5SUU5aWFtVmpkQzV3Y205MGIzUjVjR1U3WEc1Y2JpOHFLaUJWYzJWa0lIUnZJR05vWldOcklHOWlhbVZqZEhNZ1ptOXlJRzkzYmlCd2NtOXdaWEowYVdWekxpQXFMMXh1ZG1GeUlHaGhjMDkzYmxCeWIzQmxjblI1SUQwZ2IySnFaV04wVUhKdmRHOHVhR0Z6VDNkdVVISnZjR1Z5ZEhrN1hHNWNiaThxS2x4dUlDb2dRM0psWVhSbGN5QmhiaUJoY25KaGVTQnZaaUIwYUdVZ1pXNTFiV1Z5WVdKc1pTQndjbTl3WlhKMGVTQnVZVzFsY3lCdlppQjBhR1VnWVhKeVlYa3RiR2xyWlNCZ2RtRnNkV1ZnTGx4dUlDcGNiaUFxSUVCd2NtbDJZWFJsWEc0Z0tpQkFjR0Z5WVcwZ2V5cDlJSFpoYkhWbElGUm9aU0IyWVd4MVpTQjBieUJ4ZFdWeWVTNWNiaUFxSUVCd1lYSmhiU0I3WW05dmJHVmhibjBnYVc1b1pYSnBkR1ZrSUZOd1pXTnBabmtnY21WMGRYSnVhVzVuSUdsdWFHVnlhWFJsWkNCd2NtOXdaWEowZVNCdVlXMWxjeTVjYmlBcUlFQnlaWFIxY201eklIdEJjbkpoZVgwZ1VtVjBkWEp1Y3lCMGFHVWdZWEp5WVhrZ2IyWWdjSEp2Y0dWeWRIa2dibUZ0WlhNdVhHNGdLaTljYm1aMWJtTjBhVzl1SUdGeWNtRjVUR2xyWlV0bGVYTW9kbUZzZFdVc0lHbHVhR1Z5YVhSbFpDa2dlMXh1SUNCMllYSWdhWE5CY25JZ1BTQnBjMEZ5Y21GNUtIWmhiSFZsS1N4Y2JpQWdJQ0FnSUdselFYSm5JRDBnSVdselFYSnlJQ1ltSUdselFYSm5kVzFsYm5SektIWmhiSFZsS1N4Y2JpQWdJQ0FnSUdselFuVm1aaUE5SUNGcGMwRnljaUFtSmlBaGFYTkJjbWNnSmlZZ2FYTkNkV1ptWlhJb2RtRnNkV1VwTEZ4dUlDQWdJQ0FnYVhOVWVYQmxJRDBnSVdselFYSnlJQ1ltSUNGcGMwRnlaeUFtSmlBaGFYTkNkV1ptSUNZbUlHbHpWSGx3WldSQmNuSmhlU2gyWVd4MVpTa3NYRzRnSUNBZ0lDQnphMmx3U1c1a1pYaGxjeUE5SUdselFYSnlJSHg4SUdselFYSm5JSHg4SUdselFuVm1aaUI4ZkNCcGMxUjVjR1VzWEc0Z0lDQWdJQ0J5WlhOMWJIUWdQU0J6YTJsd1NXNWtaWGhsY3lBL0lHSmhjMlZVYVcxbGN5aDJZV3gxWlM1c1pXNW5kR2dzSUZOMGNtbHVaeWtnT2lCYlhTeGNiaUFnSUNBZ0lHeGxibWQwYUNBOUlISmxjM1ZzZEM1c1pXNW5kR2c3WEc1Y2JpQWdabTl5SUNoMllYSWdhMlY1SUdsdUlIWmhiSFZsS1NCN1hHNGdJQ0FnYVdZZ0tDaHBibWhsY21sMFpXUWdmSHdnYUdGelQzZHVVSEp2Y0dWeWRIa3VZMkZzYkNoMllXeDFaU3dnYTJWNUtTa2dKaVpjYmlBZ0lDQWdJQ0FnSVNoemEybHdTVzVrWlhobGN5QW1KaUFvWEc0Z0lDQWdJQ0FnSUNBZ0lDOHZJRk5oWm1GeWFTQTVJR2hoY3lCbGJuVnRaWEpoWW14bElHQmhjbWQxYldWdWRITXViR1Z1WjNSb1lDQnBiaUJ6ZEhKcFkzUWdiVzlrWlM1Y2JpQWdJQ0FnSUNBZ0lDQWdhMlY1SUQwOUlDZHNaVzVuZEdnbklIeDhYRzRnSUNBZ0lDQWdJQ0FnSUM4dklFNXZaR1V1YW5NZ01DNHhNQ0JvWVhNZ1pXNTFiV1Z5WVdKc1pTQnViMjR0YVc1a1pYZ2djSEp2Y0dWeWRHbGxjeUJ2YmlCaWRXWm1aWEp6TGx4dUlDQWdJQ0FnSUNBZ0lDQW9hWE5DZFdabUlDWW1JQ2hyWlhrZ1BUMGdKMjltWm5ObGRDY2dmSHdnYTJWNUlEMDlJQ2R3WVhKbGJuUW5LU2tnZkh4Y2JpQWdJQ0FnSUNBZ0lDQWdMeThnVUdoaGJuUnZiVXBUSURJZ2FHRnpJR1Z1ZFcxbGNtRmliR1VnYm05dUxXbHVaR1Y0SUhCeWIzQmxjblJwWlhNZ2IyNGdkSGx3WldRZ1lYSnlZWGx6TGx4dUlDQWdJQ0FnSUNBZ0lDQW9hWE5VZVhCbElDWW1JQ2hyWlhrZ1BUMGdKMkoxWm1abGNpY2dmSHdnYTJWNUlEMDlJQ2RpZVhSbFRHVnVaM1JvSnlCOGZDQnJaWGtnUFQwZ0oySjVkR1ZQWm1aelpYUW5LU2tnZkh4Y2JpQWdJQ0FnSUNBZ0lDQWdMeThnVTJ0cGNDQnBibVJsZUNCd2NtOXdaWEowYVdWekxseHVJQ0FnSUNBZ0lDQWdJQ0JwYzBsdVpHVjRLR3RsZVN3Z2JHVnVaM1JvS1Z4dUlDQWdJQ0FnSUNBcEtTa2dlMXh1SUNBZ0lDQWdjbVZ6ZFd4MExuQjFjMmdvYTJWNUtUdGNiaUFnSUNCOVhHNGdJSDFjYmlBZ2NtVjBkWEp1SUhKbGMzVnNkRHRjYm4xY2JseHViVzlrZFd4bExtVjRjRzl5ZEhNZ1BTQmhjbkpoZVV4cGEyVkxaWGx6TzF4dUlpd2lMeW9xSUZWelpXUWdabTl5SUdKMWFXeDBMV2x1SUcxbGRHaHZaQ0J5WldabGNtVnVZMlZ6TGlBcUwxeHVkbUZ5SUc5aWFtVmpkRkJ5YjNSdklEMGdUMkpxWldOMExuQnliM1J2ZEhsd1pUdGNibHh1THlvcVhHNGdLaUJEYUdWamEzTWdhV1lnWUhaaGJIVmxZQ0JwY3lCc2FXdGxiSGtnWVNCd2NtOTBiM1I1Y0dVZ2IySnFaV04wTGx4dUlDcGNiaUFxSUVCd2NtbDJZWFJsWEc0Z0tpQkFjR0Z5WVcwZ2V5cDlJSFpoYkhWbElGUm9aU0IyWVd4MVpTQjBieUJqYUdWamF5NWNiaUFxSUVCeVpYUjFjbTV6SUh0aWIyOXNaV0Z1ZlNCU1pYUjFjbTV6SUdCMGNuVmxZQ0JwWmlCZ2RtRnNkV1ZnSUdseklHRWdjSEp2ZEc5MGVYQmxMQ0JsYkhObElHQm1ZV3h6WldBdVhHNGdLaTljYm1aMWJtTjBhVzl1SUdselVISnZkRzkwZVhCbEtIWmhiSFZsS1NCN1hHNGdJSFpoY2lCRGRHOXlJRDBnZG1Gc2RXVWdKaVlnZG1Gc2RXVXVZMjl1YzNSeWRXTjBiM0lzWEc0Z0lDQWdJQ0J3Y205MGJ5QTlJQ2gwZVhCbGIyWWdRM1J2Y2lBOVBTQW5ablZ1WTNScGIyNG5JQ1ltSUVOMGIzSXVjSEp2ZEc5MGVYQmxLU0I4ZkNCdlltcGxZM1JRY205MGJ6dGNibHh1SUNCeVpYUjFjbTRnZG1Gc2RXVWdQVDA5SUhCeWIzUnZPMXh1ZlZ4dVhHNXRiMlIxYkdVdVpYaHdiM0owY3lBOUlHbHpVSEp2ZEc5MGVYQmxPMXh1SWl3aUx5b3FYRzRnS2lCRGNtVmhkR1Z6SUdFZ2RXNWhjbmtnWm5WdVkzUnBiMjRnZEdoaGRDQnBiblp2YTJWeklHQm1kVzVqWUNCM2FYUm9JR2wwY3lCaGNtZDFiV1Z1ZENCMGNtRnVjMlp2Y20xbFpDNWNiaUFxWEc0Z0tpQkFjSEpwZG1GMFpWeHVJQ29nUUhCaGNtRnRJSHRHZFc1amRHbHZibjBnWm5WdVl5QlVhR1VnWm5WdVkzUnBiMjRnZEc4Z2QzSmhjQzVjYmlBcUlFQndZWEpoYlNCN1JuVnVZM1JwYjI1OUlIUnlZVzV6Wm05eWJTQlVhR1VnWVhKbmRXMWxiblFnZEhKaGJuTm1iM0p0TGx4dUlDb2dRSEpsZEhWeWJuTWdlMFoxYm1OMGFXOXVmU0JTWlhSMWNtNXpJSFJvWlNCdVpYY2dablZ1WTNScGIyNHVYRzRnS2k5Y2JtWjFibU4wYVc5dUlHOTJaWEpCY21jb1puVnVZeXdnZEhKaGJuTm1iM0p0S1NCN1hHNGdJSEpsZEhWeWJpQm1kVzVqZEdsdmJpaGhjbWNwSUh0Y2JpQWdJQ0J5WlhSMWNtNGdablZ1WXloMGNtRnVjMlp2Y20wb1lYSm5LU2s3WEc0Z0lIMDdYRzU5WEc1Y2JtMXZaSFZzWlM1bGVIQnZjblJ6SUQwZ2IzWmxja0Z5Wnp0Y2JpSXNJblpoY2lCdmRtVnlRWEpuSUQwZ2NtVnhkV2x5WlNnbkxpOWZiM1psY2tGeVp5Y3BPMXh1WEc0dktpQkNkV2xzZEMxcGJpQnRaWFJvYjJRZ2NtVm1aWEpsYm1ObGN5Qm1iM0lnZEdodmMyVWdkMmwwYUNCMGFHVWdjMkZ0WlNCdVlXMWxJR0Z6SUc5MGFHVnlJR0JzYjJSaGMyaGdJRzFsZEdodlpITXVJQ292WEc1MllYSWdibUYwYVhabFMyVjVjeUE5SUc5MlpYSkJjbWNvVDJKcVpXTjBMbXRsZVhNc0lFOWlhbVZqZENrN1hHNWNibTF2WkhWc1pTNWxlSEJ2Y25SeklEMGdibUYwYVhabFMyVjVjenRjYmlJc0luWmhjaUJwYzFCeWIzUnZkSGx3WlNBOUlISmxjWFZwY21Vb0p5NHZYMmx6VUhKdmRHOTBlWEJsSnlrc1hHNGdJQ0FnYm1GMGFYWmxTMlY1Y3lBOUlISmxjWFZwY21Vb0p5NHZYMjVoZEdsMlpVdGxlWE1uS1R0Y2JseHVMeW9xSUZWelpXUWdabTl5SUdKMWFXeDBMV2x1SUcxbGRHaHZaQ0J5WldabGNtVnVZMlZ6TGlBcUwxeHVkbUZ5SUc5aWFtVmpkRkJ5YjNSdklEMGdUMkpxWldOMExuQnliM1J2ZEhsd1pUdGNibHh1THlvcUlGVnpaV1FnZEc4Z1kyaGxZMnNnYjJKcVpXTjBjeUJtYjNJZ2IzZHVJSEJ5YjNCbGNuUnBaWE11SUNvdlhHNTJZWElnYUdGelQzZHVVSEp2Y0dWeWRIa2dQU0J2WW1wbFkzUlFjbTkwYnk1b1lYTlBkMjVRY205d1pYSjBlVHRjYmx4dUx5b3FYRzRnS2lCVWFHVWdZbUZ6WlNCcGJYQnNaVzFsYm5SaGRHbHZiaUJ2WmlCZ1h5NXJaWGx6WUNCM2FHbGphQ0JrYjJWemJpZDBJSFJ5WldGMElITndZWEp6WlNCaGNuSmhlWE1nWVhNZ1pHVnVjMlV1WEc0Z0tseHVJQ29nUUhCeWFYWmhkR1ZjYmlBcUlFQndZWEpoYlNCN1QySnFaV04wZlNCdlltcGxZM1FnVkdobElHOWlhbVZqZENCMGJ5QnhkV1Z5ZVM1Y2JpQXFJRUJ5WlhSMWNtNXpJSHRCY25KaGVYMGdVbVYwZFhKdWN5QjBhR1VnWVhKeVlYa2diMllnY0hKdmNHVnlkSGtnYm1GdFpYTXVYRzRnS2k5Y2JtWjFibU4wYVc5dUlHSmhjMlZMWlhsektHOWlhbVZqZENrZ2UxeHVJQ0JwWmlBb0lXbHpVSEp2ZEc5MGVYQmxLRzlpYW1WamRDa3BJSHRjYmlBZ0lDQnlaWFIxY200Z2JtRjBhWFpsUzJWNWN5aHZZbXBsWTNRcE8xeHVJQ0I5WEc0Z0lIWmhjaUJ5WlhOMWJIUWdQU0JiWFR0Y2JpQWdabTl5SUNoMllYSWdhMlY1SUdsdUlFOWlhbVZqZENodlltcGxZM1FwS1NCN1hHNGdJQ0FnYVdZZ0tHaGhjMDkzYmxCeWIzQmxjblI1TG1OaGJHd29iMkpxWldOMExDQnJaWGtwSUNZbUlHdGxlU0FoUFNBblkyOXVjM1J5ZFdOMGIzSW5LU0I3WEc0Z0lDQWdJQ0J5WlhOMWJIUXVjSFZ6YUNoclpYa3BPMXh1SUNBZ0lIMWNiaUFnZlZ4dUlDQnlaWFIxY200Z2NtVnpkV3gwTzF4dWZWeHVYRzV0YjJSMWJHVXVaWGh3YjNKMGN5QTlJR0poYzJWTFpYbHpPMXh1SWl3aWRtRnlJR2x6Um5WdVkzUnBiMjRnUFNCeVpYRjFhWEpsS0NjdUwybHpSblZ1WTNScGIyNG5LU3hjYmlBZ0lDQnBjMHhsYm1kMGFDQTlJSEpsY1hWcGNtVW9KeTR2YVhOTVpXNW5kR2duS1R0Y2JseHVMeW9xWEc0Z0tpQkRhR1ZqYTNNZ2FXWWdZSFpoYkhWbFlDQnBjeUJoY25KaGVTMXNhV3RsTGlCQklIWmhiSFZsSUdseklHTnZibk5wWkdWeVpXUWdZWEp5WVhrdGJHbHJaU0JwWmlCcGRDZHpYRzRnS2lCdWIzUWdZU0JtZFc1amRHbHZiaUJoYm1RZ2FHRnpJR0VnWUhaaGJIVmxMbXhsYm1kMGFHQWdkR2hoZENkeklHRnVJR2x1ZEdWblpYSWdaM0psWVhSbGNpQjBhR0Z1SUc5eVhHNGdLaUJsY1hWaGJDQjBieUJnTUdBZ1lXNWtJR3hsYzNNZ2RHaGhiaUJ2Y2lCbGNYVmhiQ0IwYnlCZ1RuVnRZbVZ5TGsxQldGOVRRVVpGWDBsT1ZFVkhSVkpnTGx4dUlDcGNiaUFxSUVCemRHRjBhV05jYmlBcUlFQnRaVzFpWlhKUFppQmZYRzRnS2lCQWMybHVZMlVnTkM0d0xqQmNiaUFxSUVCallYUmxaMjl5ZVNCTVlXNW5YRzRnS2lCQWNHRnlZVzBnZXlwOUlIWmhiSFZsSUZSb1pTQjJZV3gxWlNCMGJ5QmphR1ZqYXk1Y2JpQXFJRUJ5WlhSMWNtNXpJSHRpYjI5c1pXRnVmU0JTWlhSMWNtNXpJR0IwY25WbFlDQnBaaUJnZG1Gc2RXVmdJR2x6SUdGeWNtRjVMV3hwYTJVc0lHVnNjMlVnWUdaaGJITmxZQzVjYmlBcUlFQmxlR0Z0Y0d4bFhHNGdLbHh1SUNvZ1h5NXBjMEZ5Y21GNVRHbHJaU2hiTVN3Z01pd2dNMTBwTzF4dUlDb2dMeThnUFQ0Z2RISjFaVnh1SUNwY2JpQXFJRjh1YVhOQmNuSmhlVXhwYTJVb1pHOWpkVzFsYm5RdVltOWtlUzVqYUdsc1pISmxiaWs3WEc0Z0tpQXZMeUE5UGlCMGNuVmxYRzRnS2x4dUlDb2dYeTVwYzBGeWNtRjVUR2xyWlNnbllXSmpKeWs3WEc0Z0tpQXZMeUE5UGlCMGNuVmxYRzRnS2x4dUlDb2dYeTVwYzBGeWNtRjVUR2xyWlNoZkxtNXZiM0FwTzF4dUlDb2dMeThnUFQ0Z1ptRnNjMlZjYmlBcUwxeHVablZ1WTNScGIyNGdhWE5CY25KaGVVeHBhMlVvZG1Gc2RXVXBJSHRjYmlBZ2NtVjBkWEp1SUhaaGJIVmxJQ0U5SUc1MWJHd2dKaVlnYVhOTVpXNW5kR2dvZG1Gc2RXVXViR1Z1WjNSb0tTQW1KaUFoYVhOR2RXNWpkR2x2YmloMllXeDFaU2s3WEc1OVhHNWNibTF2WkhWc1pTNWxlSEJ2Y25SeklEMGdhWE5CY25KaGVVeHBhMlU3WEc0aUxDSjJZWElnWVhKeVlYbE1hV3RsUzJWNWN5QTlJSEpsY1hWcGNtVW9KeTR2WDJGeWNtRjVUR2xyWlV0bGVYTW5LU3hjYmlBZ0lDQmlZWE5sUzJWNWN5QTlJSEpsY1hWcGNtVW9KeTR2WDJKaGMyVkxaWGx6Snlrc1hHNGdJQ0FnYVhOQmNuSmhlVXhwYTJVZ1BTQnlaWEYxYVhKbEtDY3VMMmx6UVhKeVlYbE1hV3RsSnlrN1hHNWNiaThxS2x4dUlDb2dRM0psWVhSbGN5QmhiaUJoY25KaGVTQnZaaUIwYUdVZ2IzZHVJR1Z1ZFcxbGNtRmliR1VnY0hKdmNHVnlkSGtnYm1GdFpYTWdiMllnWUc5aWFtVmpkR0F1WEc0Z0tseHVJQ29nS2lwT2IzUmxPaW9xSUU1dmJpMXZZbXBsWTNRZ2RtRnNkV1Z6SUdGeVpTQmpiMlZ5WTJWa0lIUnZJRzlpYW1WamRITXVJRk5sWlNCMGFHVmNiaUFxSUZ0RlV5QnpjR1ZqWFNob2RIUndPaTh2WldOdFlTMXBiblJsY201aGRHbHZibUZzTG05eVp5OWxZMjFoTFRJMk1pODNMakF2STNObFl5MXZZbXBsWTNRdWEyVjVjeWxjYmlBcUlHWnZjaUJ0YjNKbElHUmxkR0ZwYkhNdVhHNGdLbHh1SUNvZ1FITjBZWFJwWTF4dUlDb2dRSE5wYm1ObElEQXVNUzR3WEc0Z0tpQkFiV1Z0WW1WeVQyWWdYMXh1SUNvZ1FHTmhkR1ZuYjNKNUlFOWlhbVZqZEZ4dUlDb2dRSEJoY21GdElIdFBZbXBsWTNSOUlHOWlhbVZqZENCVWFHVWdiMkpxWldOMElIUnZJSEYxWlhKNUxseHVJQ29nUUhKbGRIVnlibk1nZTBGeWNtRjVmU0JTWlhSMWNtNXpJSFJvWlNCaGNuSmhlU0J2WmlCd2NtOXdaWEowZVNCdVlXMWxjeTVjYmlBcUlFQmxlR0Z0Y0d4bFhHNGdLbHh1SUNvZ1puVnVZM1JwYjI0Z1JtOXZLQ2tnZTF4dUlDb2dJQ0IwYUdsekxtRWdQU0F4TzF4dUlDb2dJQ0IwYUdsekxtSWdQU0F5TzF4dUlDb2dmVnh1SUNwY2JpQXFJRVp2Ynk1d2NtOTBiM1I1Y0dVdVl5QTlJRE03WEc0Z0tseHVJQ29nWHk1clpYbHpLRzVsZHlCR2IyOHBPMXh1SUNvZ0x5OGdQVDRnV3lkaEp5d2dKMkluWFNBb2FYUmxjbUYwYVc5dUlHOXlaR1Z5SUdseklHNXZkQ0JuZFdGeVlXNTBaV1ZrS1Z4dUlDcGNiaUFxSUY4dWEyVjVjeWduYUdrbktUdGNiaUFxSUM4dklEMCtJRnNuTUNjc0lDY3hKMTFjYmlBcUwxeHVablZ1WTNScGIyNGdhMlY1Y3lodlltcGxZM1FwSUh0Y2JpQWdjbVYwZFhKdUlHbHpRWEp5WVhsTWFXdGxLRzlpYW1WamRDa2dQeUJoY25KaGVVeHBhMlZMWlhsektHOWlhbVZqZENrZ09pQmlZWE5sUzJWNWN5aHZZbXBsWTNRcE8xeHVmVnh1WEc1dGIyUjFiR1V1Wlhod2IzSjBjeUE5SUd0bGVYTTdYRzRpTENKMllYSWdZMjl3ZVU5aWFtVmpkQ0E5SUhKbGNYVnBjbVVvSnk0dlgyTnZjSGxQWW1wbFkzUW5LU3hjYmlBZ0lDQnJaWGx6SUQwZ2NtVnhkV2x5WlNnbkxpOXJaWGx6SnlrN1hHNWNiaThxS2x4dUlDb2dWR2hsSUdKaGMyVWdhVzF3YkdWdFpXNTBZWFJwYjI0Z2IyWWdZRjh1WVhOemFXZHVZQ0IzYVhSb2IzVjBJSE4xY0hCdmNuUWdabTl5SUcxMWJIUnBjR3hsSUhOdmRYSmpaWE5jYmlBcUlHOXlJR0JqZFhOMGIyMXBlbVZ5WUNCbWRXNWpkR2x2Ym5NdVhHNGdLbHh1SUNvZ1FIQnlhWFpoZEdWY2JpQXFJRUJ3WVhKaGJTQjdUMkpxWldOMGZTQnZZbXBsWTNRZ1ZHaGxJR1JsYzNScGJtRjBhVzl1SUc5aWFtVmpkQzVjYmlBcUlFQndZWEpoYlNCN1QySnFaV04wZlNCemIzVnlZMlVnVkdobElITnZkWEpqWlNCdlltcGxZM1F1WEc0Z0tpQkFjbVYwZFhKdWN5QjdUMkpxWldOMGZTQlNaWFIxY201eklHQnZZbXBsWTNSZ0xseHVJQ292WEc1bWRXNWpkR2x2YmlCaVlYTmxRWE56YVdkdUtHOWlhbVZqZEN3Z2MyOTFjbU5sS1NCN1hHNGdJSEpsZEhWeWJpQnZZbXBsWTNRZ0ppWWdZMjl3ZVU5aWFtVmpkQ2h6YjNWeVkyVXNJR3RsZVhNb2MyOTFjbU5sS1N3Z2IySnFaV04wS1R0Y2JuMWNibHh1Ylc5a2RXeGxMbVY0Y0c5eWRITWdQU0JpWVhObFFYTnphV2R1TzF4dUlpd2lMeW9xWEc0Z0tpQlVhR2x6SUdaMWJtTjBhVzl1SUdseklHeHBhMlZjYmlBcUlGdGdUMkpxWldOMExtdGxlWE5nWFNob2RIUndPaTh2WldOdFlTMXBiblJsY201aGRHbHZibUZzTG05eVp5OWxZMjFoTFRJMk1pODNMakF2STNObFl5MXZZbXBsWTNRdWEyVjVjeWxjYmlBcUlHVjRZMlZ3ZENCMGFHRjBJR2wwSUdsdVkyeDFaR1Z6SUdsdWFHVnlhWFJsWkNCbGJuVnRaWEpoWW14bElIQnliM0JsY25ScFpYTXVYRzRnS2x4dUlDb2dRSEJ5YVhaaGRHVmNiaUFxSUVCd1lYSmhiU0I3VDJKcVpXTjBmU0J2WW1wbFkzUWdWR2hsSUc5aWFtVmpkQ0IwYnlCeGRXVnllUzVjYmlBcUlFQnlaWFIxY201eklIdEJjbkpoZVgwZ1VtVjBkWEp1Y3lCMGFHVWdZWEp5WVhrZ2IyWWdjSEp2Y0dWeWRIa2dibUZ0WlhNdVhHNGdLaTljYm1aMWJtTjBhVzl1SUc1aGRHbDJaVXRsZVhOSmJpaHZZbXBsWTNRcElIdGNiaUFnZG1GeUlISmxjM1ZzZENBOUlGdGRPMXh1SUNCcFppQW9iMkpxWldOMElDRTlJRzUxYkd3cElIdGNiaUFnSUNCbWIzSWdLSFpoY2lCclpYa2dhVzRnVDJKcVpXTjBLRzlpYW1WamRDa3BJSHRjYmlBZ0lDQWdJSEpsYzNWc2RDNXdkWE5vS0d0bGVTazdYRzRnSUNBZ2ZWeHVJQ0I5WEc0Z0lISmxkSFZ5YmlCeVpYTjFiSFE3WEc1OVhHNWNibTF2WkhWc1pTNWxlSEJ2Y25SeklEMGdibUYwYVhabFMyVjVjMGx1TzF4dUlpd2lkbUZ5SUdselQySnFaV04wSUQwZ2NtVnhkV2x5WlNnbkxpOXBjMDlpYW1WamRDY3BMRnh1SUNBZ0lHbHpVSEp2ZEc5MGVYQmxJRDBnY21WeGRXbHlaU2duTGk5ZmFYTlFjbTkwYjNSNWNHVW5LU3hjYmlBZ0lDQnVZWFJwZG1WTFpYbHpTVzRnUFNCeVpYRjFhWEpsS0NjdUwxOXVZWFJwZG1WTFpYbHpTVzRuS1R0Y2JseHVMeW9xSUZWelpXUWdabTl5SUdKMWFXeDBMV2x1SUcxbGRHaHZaQ0J5WldabGNtVnVZMlZ6TGlBcUwxeHVkbUZ5SUc5aWFtVmpkRkJ5YjNSdklEMGdUMkpxWldOMExuQnliM1J2ZEhsd1pUdGNibHh1THlvcUlGVnpaV1FnZEc4Z1kyaGxZMnNnYjJKcVpXTjBjeUJtYjNJZ2IzZHVJSEJ5YjNCbGNuUnBaWE11SUNvdlhHNTJZWElnYUdGelQzZHVVSEp2Y0dWeWRIa2dQU0J2WW1wbFkzUlFjbTkwYnk1b1lYTlBkMjVRY205d1pYSjBlVHRjYmx4dUx5b3FYRzRnS2lCVWFHVWdZbUZ6WlNCcGJYQnNaVzFsYm5SaGRHbHZiaUJ2WmlCZ1h5NXJaWGx6U1c1Z0lIZG9hV05vSUdSdlpYTnVKM1FnZEhKbFlYUWdjM0JoY25ObElHRnljbUY1Y3lCaGN5QmtaVzV6WlM1Y2JpQXFYRzRnS2lCQWNISnBkbUYwWlZ4dUlDb2dRSEJoY21GdElIdFBZbXBsWTNSOUlHOWlhbVZqZENCVWFHVWdiMkpxWldOMElIUnZJSEYxWlhKNUxseHVJQ29nUUhKbGRIVnlibk1nZTBGeWNtRjVmU0JTWlhSMWNtNXpJSFJvWlNCaGNuSmhlU0J2WmlCd2NtOXdaWEowZVNCdVlXMWxjeTVjYmlBcUwxeHVablZ1WTNScGIyNGdZbUZ6WlV0bGVYTkpiaWh2WW1wbFkzUXBJSHRjYmlBZ2FXWWdLQ0ZwYzA5aWFtVmpkQ2h2WW1wbFkzUXBLU0I3WEc0Z0lDQWdjbVYwZFhKdUlHNWhkR2wyWlV0bGVYTkpiaWh2WW1wbFkzUXBPMXh1SUNCOVhHNGdJSFpoY2lCcGMxQnliM1J2SUQwZ2FYTlFjbTkwYjNSNWNHVW9iMkpxWldOMEtTeGNiaUFnSUNBZ0lISmxjM1ZzZENBOUlGdGRPMXh1WEc0Z0lHWnZjaUFvZG1GeUlHdGxlU0JwYmlCdlltcGxZM1FwSUh0Y2JpQWdJQ0JwWmlBb0lTaHJaWGtnUFQwZ0oyTnZibk4wY25WamRHOXlKeUFtSmlBb2FYTlFjbTkwYnlCOGZDQWhhR0Z6VDNkdVVISnZjR1Z5ZEhrdVkyRnNiQ2h2WW1wbFkzUXNJR3RsZVNrcEtTa2dlMXh1SUNBZ0lDQWdjbVZ6ZFd4MExuQjFjMmdvYTJWNUtUdGNiaUFnSUNCOVhHNGdJSDFjYmlBZ2NtVjBkWEp1SUhKbGMzVnNkRHRjYm4xY2JseHViVzlrZFd4bExtVjRjRzl5ZEhNZ1BTQmlZWE5sUzJWNWMwbHVPMXh1SWl3aWRtRnlJR0Z5Y21GNVRHbHJaVXRsZVhNZ1BTQnlaWEYxYVhKbEtDY3VMMTloY25KaGVVeHBhMlZMWlhsekp5a3NYRzRnSUNBZ1ltRnpaVXRsZVhOSmJpQTlJSEpsY1hWcGNtVW9KeTR2WDJKaGMyVkxaWGx6U1c0bktTeGNiaUFnSUNCcGMwRnljbUY1VEdsclpTQTlJSEpsY1hWcGNtVW9KeTR2YVhOQmNuSmhlVXhwYTJVbktUdGNibHh1THlvcVhHNGdLaUJEY21WaGRHVnpJR0Z1SUdGeWNtRjVJRzltSUhSb1pTQnZkMjRnWVc1a0lHbHVhR1Z5YVhSbFpDQmxiblZ0WlhKaFlteGxJSEJ5YjNCbGNuUjVJRzVoYldWeklHOW1JR0J2WW1wbFkzUmdMbHh1SUNwY2JpQXFJQ29xVG05MFpUb3FLaUJPYjI0dGIySnFaV04wSUhaaGJIVmxjeUJoY21VZ1kyOWxjbU5sWkNCMGJ5QnZZbXBsWTNSekxseHVJQ3BjYmlBcUlFQnpkR0YwYVdOY2JpQXFJRUJ0WlcxaVpYSlBaaUJmWEc0Z0tpQkFjMmx1WTJVZ015NHdMakJjYmlBcUlFQmpZWFJsWjI5eWVTQlBZbXBsWTNSY2JpQXFJRUJ3WVhKaGJTQjdUMkpxWldOMGZTQnZZbXBsWTNRZ1ZHaGxJRzlpYW1WamRDQjBieUJ4ZFdWeWVTNWNiaUFxSUVCeVpYUjFjbTV6SUh0QmNuSmhlWDBnVW1WMGRYSnVjeUIwYUdVZ1lYSnlZWGtnYjJZZ2NISnZjR1Z5ZEhrZ2JtRnRaWE11WEc0Z0tpQkFaWGhoYlhCc1pWeHVJQ3BjYmlBcUlHWjFibU4wYVc5dUlFWnZieWdwSUh0Y2JpQXFJQ0FnZEdocGN5NWhJRDBnTVR0Y2JpQXFJQ0FnZEdocGN5NWlJRDBnTWp0Y2JpQXFJSDFjYmlBcVhHNGdLaUJHYjI4dWNISnZkRzkwZVhCbExtTWdQU0F6TzF4dUlDcGNiaUFxSUY4dWEyVjVjMGx1S0c1bGR5QkdiMjhwTzF4dUlDb2dMeThnUFQ0Z1d5ZGhKeXdnSjJJbkxDQW5ZeWRkSUNocGRHVnlZWFJwYjI0Z2IzSmtaWElnYVhNZ2JtOTBJR2QxWVhKaGJuUmxaV1FwWEc0Z0tpOWNibVoxYm1OMGFXOXVJR3RsZVhOSmJpaHZZbXBsWTNRcElIdGNiaUFnY21WMGRYSnVJR2x6UVhKeVlYbE1hV3RsS0c5aWFtVmpkQ2tnUHlCaGNuSmhlVXhwYTJWTFpYbHpLRzlpYW1WamRDd2dkSEoxWlNrZ09pQmlZWE5sUzJWNWMwbHVLRzlpYW1WamRDazdYRzU5WEc1Y2JtMXZaSFZzWlM1bGVIQnZjblJ6SUQwZ2EyVjVjMGx1TzF4dUlpd2lkbUZ5SUdOdmNIbFBZbXBsWTNRZ1BTQnlaWEYxYVhKbEtDY3VMMTlqYjNCNVQySnFaV04wSnlrc1hHNGdJQ0FnYTJWNWMwbHVJRDBnY21WeGRXbHlaU2duTGk5clpYbHpTVzRuS1R0Y2JseHVMeW9xWEc0Z0tpQlVhR1VnWW1GelpTQnBiWEJzWlcxbGJuUmhkR2x2YmlCdlppQmdYeTVoYzNOcFoyNUpibUFnZDJsMGFHOTFkQ0J6ZFhCd2IzSjBJR1p2Y2lCdGRXeDBhWEJzWlNCemIzVnlZMlZ6WEc0Z0tpQnZjaUJnWTNWemRHOXRhWHBsY21BZ1puVnVZM1JwYjI1ekxseHVJQ3BjYmlBcUlFQndjbWwyWVhSbFhHNGdLaUJBY0dGeVlXMGdlMDlpYW1WamRIMGdiMkpxWldOMElGUm9aU0JrWlhOMGFXNWhkR2x2YmlCdlltcGxZM1F1WEc0Z0tpQkFjR0Z5WVcwZ2UwOWlhbVZqZEgwZ2MyOTFjbU5sSUZSb1pTQnpiM1Z5WTJVZ2IySnFaV04wTGx4dUlDb2dRSEpsZEhWeWJuTWdlMDlpYW1WamRIMGdVbVYwZFhKdWN5QmdiMkpxWldOMFlDNWNiaUFxTDF4dVpuVnVZM1JwYjI0Z1ltRnpaVUZ6YzJsbmJrbHVLRzlpYW1WamRDd2djMjkxY21ObEtTQjdYRzRnSUhKbGRIVnliaUJ2WW1wbFkzUWdKaVlnWTI5d2VVOWlhbVZqZENoemIzVnlZMlVzSUd0bGVYTkpiaWh6YjNWeVkyVXBMQ0J2WW1wbFkzUXBPMXh1ZlZ4dVhHNXRiMlIxYkdVdVpYaHdiM0owY3lBOUlHSmhjMlZCYzNOcFoyNUpianRjYmlJc0luWmhjaUJ5YjI5MElEMGdjbVZ4ZFdseVpTZ25MaTlmY205dmRDY3BPMXh1WEc0dktpb2dSR1YwWldOMElHWnlaV1VnZG1GeWFXRmliR1VnWUdWNGNHOXlkSE5nTGlBcUwxeHVkbUZ5SUdaeVpXVkZlSEJ2Y25SeklEMGdkSGx3Wlc5bUlHVjRjRzl5ZEhNZ1BUMGdKMjlpYW1WamRDY2dKaVlnWlhod2IzSjBjeUFtSmlBaFpYaHdiM0owY3k1dWIyUmxWSGx3WlNBbUppQmxlSEJ2Y25Sek8xeHVYRzR2S2lvZ1JHVjBaV04wSUdaeVpXVWdkbUZ5YVdGaWJHVWdZRzF2WkhWc1pXQXVJQ292WEc1MllYSWdabkpsWlUxdlpIVnNaU0E5SUdaeVpXVkZlSEJ2Y25SeklDWW1JSFI1Y0dWdlppQnRiMlIxYkdVZ1BUMGdKMjlpYW1WamRDY2dKaVlnYlc5a2RXeGxJQ1ltSUNGdGIyUjFiR1V1Ym05a1pWUjVjR1VnSmlZZ2JXOWtkV3hsTzF4dVhHNHZLaW9nUkdWMFpXTjBJSFJvWlNCd2IzQjFiR0Z5SUVOdmJXMXZia3BUSUdWNGRHVnVjMmx2YmlCZ2JXOWtkV3hsTG1WNGNHOXlkSE5nTGlBcUwxeHVkbUZ5SUcxdlpIVnNaVVY0Y0c5eWRITWdQU0JtY21WbFRXOWtkV3hsSUNZbUlHWnlaV1ZOYjJSMWJHVXVaWGh3YjNKMGN5QTlQVDBnWm5KbFpVVjRjRzl5ZEhNN1hHNWNiaThxS2lCQ2RXbHNkQzFwYmlCMllXeDFaU0J5WldabGNtVnVZMlZ6TGlBcUwxeHVkbUZ5SUVKMVptWmxjaUE5SUcxdlpIVnNaVVY0Y0c5eWRITWdQeUJ5YjI5MExrSjFabVpsY2lBNklIVnVaR1ZtYVc1bFpDeGNiaUFnSUNCaGJHeHZZMVZ1YzJGbVpTQTlJRUoxWm1abGNpQS9JRUoxWm1abGNpNWhiR3h2WTFWdWMyRm1aU0E2SUhWdVpHVm1hVzVsWkR0Y2JseHVMeW9xWEc0Z0tpQkRjbVZoZEdWeklHRWdZMnh2Ym1VZ2IyWWdJR0JpZFdabVpYSmdMbHh1SUNwY2JpQXFJRUJ3Y21sMllYUmxYRzRnS2lCQWNHRnlZVzBnZTBKMVptWmxjbjBnWW5WbVptVnlJRlJvWlNCaWRXWm1aWElnZEc4Z1kyeHZibVV1WEc0Z0tpQkFjR0Z5WVcwZ2UySnZiMnhsWVc1OUlGdHBjMFJsWlhCZElGTndaV05wWm5rZ1lTQmtaV1Z3SUdOc2IyNWxMbHh1SUNvZ1FISmxkSFZ5Ym5NZ2UwSjFabVpsY24wZ1VtVjBkWEp1Y3lCMGFHVWdZMnh2Ym1Wa0lHSjFabVpsY2k1Y2JpQXFMMXh1Wm5WdVkzUnBiMjRnWTJ4dmJtVkNkV1ptWlhJb1luVm1abVZ5TENCcGMwUmxaWEFwSUh0Y2JpQWdhV1lnS0dselJHVmxjQ2tnZTF4dUlDQWdJSEpsZEhWeWJpQmlkV1ptWlhJdWMyeHBZMlVvS1R0Y2JpQWdmVnh1SUNCMllYSWdiR1Z1WjNSb0lEMGdZblZtWm1WeUxteGxibWQwYUN4Y2JpQWdJQ0FnSUhKbGMzVnNkQ0E5SUdGc2JHOWpWVzV6WVdabElEOGdZV3hzYjJOVmJuTmhabVVvYkdWdVozUm9LU0E2SUc1bGR5QmlkV1ptWlhJdVkyOXVjM1J5ZFdOMGIzSW9iR1Z1WjNSb0tUdGNibHh1SUNCaWRXWm1aWEl1WTI5d2VTaHlaWE4xYkhRcE8xeHVJQ0J5WlhSMWNtNGdjbVZ6ZFd4ME8xeHVmVnh1WEc1dGIyUjFiR1V1Wlhod2IzSjBjeUE5SUdOc2IyNWxRblZtWm1WeU8xeHVJaXdpTHlvcVhHNGdLaUJEYjNCcFpYTWdkR2hsSUhaaGJIVmxjeUJ2WmlCZ2MyOTFjbU5sWUNCMGJ5QmdZWEp5WVhsZ0xseHVJQ3BjYmlBcUlFQndjbWwyWVhSbFhHNGdLaUJBY0dGeVlXMGdlMEZ5Y21GNWZTQnpiM1Z5WTJVZ1ZHaGxJR0Z5Y21GNUlIUnZJR052Y0hrZ2RtRnNkV1Z6SUdaeWIyMHVYRzRnS2lCQWNHRnlZVzBnZTBGeWNtRjVmU0JiWVhKeVlYazlXMTFkSUZSb1pTQmhjbkpoZVNCMGJ5QmpiM0I1SUhaaGJIVmxjeUIwYnk1Y2JpQXFJRUJ5WlhSMWNtNXpJSHRCY25KaGVYMGdVbVYwZFhKdWN5QmdZWEp5WVhsZ0xseHVJQ292WEc1bWRXNWpkR2x2YmlCamIzQjVRWEp5WVhrb2MyOTFjbU5sTENCaGNuSmhlU2tnZTF4dUlDQjJZWElnYVc1a1pYZ2dQU0F0TVN4Y2JpQWdJQ0FnSUd4bGJtZDBhQ0E5SUhOdmRYSmpaUzVzWlc1bmRHZzdYRzVjYmlBZ1lYSnlZWGtnZkh3Z0tHRnljbUY1SUQwZ1FYSnlZWGtvYkdWdVozUm9LU2s3WEc0Z0lIZG9hV3hsSUNncksybHVaR1Y0SUR3Z2JHVnVaM1JvS1NCN1hHNGdJQ0FnWVhKeVlYbGJhVzVrWlhoZElEMGdjMjkxY21ObFcybHVaR1Y0WFR0Y2JpQWdmVnh1SUNCeVpYUjFjbTRnWVhKeVlYazdYRzU5WEc1Y2JtMXZaSFZzWlM1bGVIQnZjblJ6SUQwZ1kyOXdlVUZ5Y21GNU8xeHVJaXdpTHlvcVhHNGdLaUJCSUhOd1pXTnBZV3hwZW1Wa0lIWmxjbk5wYjI0Z2IyWWdZRjh1Wm1sc2RHVnlZQ0JtYjNJZ1lYSnlZWGx6SUhkcGRHaHZkWFFnYzNWd2NHOXlkQ0JtYjNKY2JpQXFJR2wwWlhKaGRHVmxJSE5vYjNKMGFHRnVaSE11WEc0Z0tseHVJQ29nUUhCeWFYWmhkR1ZjYmlBcUlFQndZWEpoYlNCN1FYSnlZWGw5SUZ0aGNuSmhlVjBnVkdobElHRnljbUY1SUhSdklHbDBaWEpoZEdVZ2IzWmxjaTVjYmlBcUlFQndZWEpoYlNCN1JuVnVZM1JwYjI1OUlIQnlaV1JwWTJGMFpTQlVhR1VnWm5WdVkzUnBiMjRnYVc1MmIydGxaQ0J3WlhJZ2FYUmxjbUYwYVc5dUxseHVJQ29nUUhKbGRIVnlibk1nZTBGeWNtRjVmU0JTWlhSMWNtNXpJSFJvWlNCdVpYY2dabWxzZEdWeVpXUWdZWEp5WVhrdVhHNGdLaTljYm1aMWJtTjBhVzl1SUdGeWNtRjVSbWxzZEdWeUtHRnljbUY1TENCd2NtVmthV05oZEdVcElIdGNiaUFnZG1GeUlHbHVaR1Y0SUQwZ0xURXNYRzRnSUNBZ0lDQnNaVzVuZEdnZ1BTQmhjbkpoZVNBOVBTQnVkV3hzSUQ4Z01DQTZJR0Z5Y21GNUxteGxibWQwYUN4Y2JpQWdJQ0FnSUhKbGMwbHVaR1Y0SUQwZ01DeGNiaUFnSUNBZ0lISmxjM1ZzZENBOUlGdGRPMXh1WEc0Z0lIZG9hV3hsSUNncksybHVaR1Y0SUR3Z2JHVnVaM1JvS1NCN1hHNGdJQ0FnZG1GeUlIWmhiSFZsSUQwZ1lYSnlZWGxiYVc1a1pYaGRPMXh1SUNBZ0lHbG1JQ2h3Y21Wa2FXTmhkR1VvZG1Gc2RXVXNJR2x1WkdWNExDQmhjbkpoZVNrcElIdGNiaUFnSUNBZ0lISmxjM1ZzZEZ0eVpYTkpibVJsZUNzclhTQTlJSFpoYkhWbE8xeHVJQ0FnSUgxY2JpQWdmVnh1SUNCeVpYUjFjbTRnY21WemRXeDBPMXh1ZlZ4dVhHNXRiMlIxYkdVdVpYaHdiM0owY3lBOUlHRnljbUY1Um1sc2RHVnlPMXh1SWl3aUx5b3FYRzRnS2lCVWFHbHpJRzFsZEdodlpDQnlaWFIxY201eklHRWdibVYzSUdWdGNIUjVJR0Z5Y21GNUxseHVJQ3BjYmlBcUlFQnpkR0YwYVdOY2JpQXFJRUJ0WlcxaVpYSlBaaUJmWEc0Z0tpQkFjMmx1WTJVZ05DNHhNeTR3WEc0Z0tpQkFZMkYwWldkdmNua2dWWFJwYkZ4dUlDb2dRSEpsZEhWeWJuTWdlMEZ5Y21GNWZTQlNaWFIxY201eklIUm9aU0J1WlhjZ1pXMXdkSGtnWVhKeVlYa3VYRzRnS2lCQVpYaGhiWEJzWlZ4dUlDcGNiaUFxSUhaaGNpQmhjbkpoZVhNZ1BTQmZMblJwYldWektESXNJRjh1YzNSMVlrRnljbUY1S1R0Y2JpQXFYRzRnS2lCamIyNXpiMnhsTG14dlp5aGhjbkpoZVhNcE8xeHVJQ29nTHk4Z1BUNGdXMXRkTENCYlhWMWNiaUFxWEc0Z0tpQmpiMjV6YjJ4bExteHZaeWhoY25KaGVYTmJNRjBnUFQwOUlHRnljbUY1YzFzeFhTazdYRzRnS2lBdkx5QTlQaUJtWVd4elpWeHVJQ292WEc1bWRXNWpkR2x2YmlCemRIVmlRWEp5WVhrb0tTQjdYRzRnSUhKbGRIVnliaUJiWFR0Y2JuMWNibHh1Ylc5a2RXeGxMbVY0Y0c5eWRITWdQU0J6ZEhWaVFYSnlZWGs3WEc0aUxDSjJZWElnWVhKeVlYbEdhV3gwWlhJZ1BTQnlaWEYxYVhKbEtDY3VMMTloY25KaGVVWnBiSFJsY2ljcExGeHVJQ0FnSUhOMGRXSkJjbkpoZVNBOUlISmxjWFZwY21Vb0p5NHZjM1IxWWtGeWNtRjVKeWs3WEc1Y2JpOHFLaUJWYzJWa0lHWnZjaUJpZFdsc2RDMXBiaUJ0WlhSb2IyUWdjbVZtWlhKbGJtTmxjeTRnS2k5Y2JuWmhjaUJ2WW1wbFkzUlFjbTkwYnlBOUlFOWlhbVZqZEM1d2NtOTBiM1I1Y0dVN1hHNWNiaThxS2lCQ2RXbHNkQzFwYmlCMllXeDFaU0J5WldabGNtVnVZMlZ6TGlBcUwxeHVkbUZ5SUhCeWIzQmxjblI1U1hORmJuVnRaWEpoWW14bElEMGdiMkpxWldOMFVISnZkRzh1Y0hKdmNHVnlkSGxKYzBWdWRXMWxjbUZpYkdVN1hHNWNiaThxSUVKMWFXeDBMV2x1SUcxbGRHaHZaQ0J5WldabGNtVnVZMlZ6SUdadmNpQjBhRzl6WlNCM2FYUm9JSFJvWlNCellXMWxJRzVoYldVZ1lYTWdiM1JvWlhJZ1lHeHZaR0Z6YUdBZ2JXVjBhRzlrY3k0Z0tpOWNiblpoY2lCdVlYUnBkbVZIWlhSVGVXMWliMnh6SUQwZ1QySnFaV04wTG1kbGRFOTNibEJ5YjNCbGNuUjVVM2x0WW05c2N6dGNibHh1THlvcVhHNGdLaUJEY21WaGRHVnpJR0Z1SUdGeWNtRjVJRzltSUhSb1pTQnZkMjRnWlc1MWJXVnlZV0pzWlNCemVXMWliMnh6SUc5bUlHQnZZbXBsWTNSZ0xseHVJQ3BjYmlBcUlFQndjbWwyWVhSbFhHNGdLaUJBY0dGeVlXMGdlMDlpYW1WamRIMGdiMkpxWldOMElGUm9aU0J2WW1wbFkzUWdkRzhnY1hWbGNua3VYRzRnS2lCQWNtVjBkWEp1Y3lCN1FYSnlZWGw5SUZKbGRIVnlibk1nZEdobElHRnljbUY1SUc5bUlITjViV0p2YkhNdVhHNGdLaTljYm5aaGNpQm5aWFJUZVcxaWIyeHpJRDBnSVc1aGRHbDJaVWRsZEZONWJXSnZiSE1nUHlCemRIVmlRWEp5WVhrZ09pQm1kVzVqZEdsdmJpaHZZbXBsWTNRcElIdGNiaUFnYVdZZ0tHOWlhbVZqZENBOVBTQnVkV3hzS1NCN1hHNGdJQ0FnY21WMGRYSnVJRnRkTzF4dUlDQjlYRzRnSUc5aWFtVmpkQ0E5SUU5aWFtVmpkQ2h2WW1wbFkzUXBPMXh1SUNCeVpYUjFjbTRnWVhKeVlYbEdhV3gwWlhJb2JtRjBhWFpsUjJWMFUzbHRZbTlzY3lodlltcGxZM1FwTENCbWRXNWpkR2x2YmloemVXMWliMndwSUh0Y2JpQWdJQ0J5WlhSMWNtNGdjSEp2Y0dWeWRIbEpjMFZ1ZFcxbGNtRmliR1V1WTJGc2JDaHZZbXBsWTNRc0lITjViV0p2YkNrN1hHNGdJSDBwTzF4dWZUdGNibHh1Ylc5a2RXeGxMbVY0Y0c5eWRITWdQU0JuWlhSVGVXMWliMnh6TzF4dUlpd2lkbUZ5SUdOdmNIbFBZbXBsWTNRZ1BTQnlaWEYxYVhKbEtDY3VMMTlqYjNCNVQySnFaV04wSnlrc1hHNGdJQ0FnWjJWMFUzbHRZbTlzY3lBOUlISmxjWFZwY21Vb0p5NHZYMmRsZEZONWJXSnZiSE1uS1R0Y2JseHVMeW9xWEc0Z0tpQkRiM0JwWlhNZ2IzZHVJSE41YldKdmJITWdiMllnWUhOdmRYSmpaV0FnZEc4Z1lHOWlhbVZqZEdBdVhHNGdLbHh1SUNvZ1FIQnlhWFpoZEdWY2JpQXFJRUJ3WVhKaGJTQjdUMkpxWldOMGZTQnpiM1Z5WTJVZ1ZHaGxJRzlpYW1WamRDQjBieUJqYjNCNUlITjViV0p2YkhNZ1puSnZiUzVjYmlBcUlFQndZWEpoYlNCN1QySnFaV04wZlNCYmIySnFaV04wUFh0OVhTQlVhR1VnYjJKcVpXTjBJSFJ2SUdOdmNIa2djM2x0WW05c2N5QjBieTVjYmlBcUlFQnlaWFIxY201eklIdFBZbXBsWTNSOUlGSmxkSFZ5Ym5NZ1lHOWlhbVZqZEdBdVhHNGdLaTljYm1aMWJtTjBhVzl1SUdOdmNIbFRlVzFpYjJ4ektITnZkWEpqWlN3Z2IySnFaV04wS1NCN1hHNGdJSEpsZEhWeWJpQmpiM0I1VDJKcVpXTjBLSE52ZFhKalpTd2daMlYwVTNsdFltOXNjeWh6YjNWeVkyVXBMQ0J2WW1wbFkzUXBPMXh1ZlZ4dVhHNXRiMlIxYkdVdVpYaHdiM0owY3lBOUlHTnZjSGxUZVcxaWIyeHpPMXh1SWl3aUx5b3FYRzRnS2lCQmNIQmxibVJ6SUhSb1pTQmxiR1Z0Wlc1MGN5QnZaaUJnZG1Gc2RXVnpZQ0IwYnlCZ1lYSnlZWGxnTGx4dUlDcGNiaUFxSUVCd2NtbDJZWFJsWEc0Z0tpQkFjR0Z5WVcwZ2UwRnljbUY1ZlNCaGNuSmhlU0JVYUdVZ1lYSnlZWGtnZEc4Z2JXOWthV1o1TGx4dUlDb2dRSEJoY21GdElIdEJjbkpoZVgwZ2RtRnNkV1Z6SUZSb1pTQjJZV3gxWlhNZ2RHOGdZWEJ3Wlc1a0xseHVJQ29nUUhKbGRIVnlibk1nZTBGeWNtRjVmU0JTWlhSMWNtNXpJR0JoY25KaGVXQXVYRzRnS2k5Y2JtWjFibU4wYVc5dUlHRnljbUY1VUhWemFDaGhjbkpoZVN3Z2RtRnNkV1Z6S1NCN1hHNGdJSFpoY2lCcGJtUmxlQ0E5SUMweExGeHVJQ0FnSUNBZ2JHVnVaM1JvSUQwZ2RtRnNkV1Z6TG14bGJtZDBhQ3hjYmlBZ0lDQWdJRzltWm5ObGRDQTlJR0Z5Y21GNUxteGxibWQwYUR0Y2JseHVJQ0IzYUdsc1pTQW9LeXRwYm1SbGVDQThJR3hsYm1kMGFDa2dlMXh1SUNBZ0lHRnljbUY1VzI5bVpuTmxkQ0FySUdsdVpHVjRYU0E5SUhaaGJIVmxjMXRwYm1SbGVGMDdYRzRnSUgxY2JpQWdjbVYwZFhKdUlHRnljbUY1TzF4dWZWeHVYRzV0YjJSMWJHVXVaWGh3YjNKMGN5QTlJR0Z5Y21GNVVIVnphRHRjYmlJc0luWmhjaUJ2ZG1WeVFYSm5JRDBnY21WeGRXbHlaU2duTGk5ZmIzWmxja0Z5WnljcE8xeHVYRzR2S2lvZ1FuVnBiSFF0YVc0Z2RtRnNkV1VnY21WbVpYSmxibU5sY3k0Z0tpOWNiblpoY2lCblpYUlFjbTkwYjNSNWNHVWdQU0J2ZG1WeVFYSm5LRTlpYW1WamRDNW5aWFJRY205MGIzUjVjR1ZQWml3Z1QySnFaV04wS1R0Y2JseHViVzlrZFd4bExtVjRjRzl5ZEhNZ1BTQm5aWFJRY205MGIzUjVjR1U3WEc0aUxDSjJZWElnWVhKeVlYbFFkWE5vSUQwZ2NtVnhkV2x5WlNnbkxpOWZZWEp5WVhsUWRYTm9KeWtzWEc0Z0lDQWdaMlYwVUhKdmRHOTBlWEJsSUQwZ2NtVnhkV2x5WlNnbkxpOWZaMlYwVUhKdmRHOTBlWEJsSnlrc1hHNGdJQ0FnWjJWMFUzbHRZbTlzY3lBOUlISmxjWFZwY21Vb0p5NHZYMmRsZEZONWJXSnZiSE1uS1N4Y2JpQWdJQ0J6ZEhWaVFYSnlZWGtnUFNCeVpYRjFhWEpsS0NjdUwzTjBkV0pCY25KaGVTY3BPMXh1WEc0dktpQkNkV2xzZEMxcGJpQnRaWFJvYjJRZ2NtVm1aWEpsYm1ObGN5Qm1iM0lnZEdodmMyVWdkMmwwYUNCMGFHVWdjMkZ0WlNCdVlXMWxJR0Z6SUc5MGFHVnlJR0JzYjJSaGMyaGdJRzFsZEdodlpITXVJQ292WEc1MllYSWdibUYwYVhabFIyVjBVM2x0WW05c2N5QTlJRTlpYW1WamRDNW5aWFJQZDI1UWNtOXdaWEowZVZONWJXSnZiSE03WEc1Y2JpOHFLbHh1SUNvZ1EzSmxZWFJsY3lCaGJpQmhjbkpoZVNCdlppQjBhR1VnYjNkdUlHRnVaQ0JwYm1obGNtbDBaV1FnWlc1MWJXVnlZV0pzWlNCemVXMWliMnh6SUc5bUlHQnZZbXBsWTNSZ0xseHVJQ3BjYmlBcUlFQndjbWwyWVhSbFhHNGdLaUJBY0dGeVlXMGdlMDlpYW1WamRIMGdiMkpxWldOMElGUm9aU0J2WW1wbFkzUWdkRzhnY1hWbGNua3VYRzRnS2lCQWNtVjBkWEp1Y3lCN1FYSnlZWGw5SUZKbGRIVnlibk1nZEdobElHRnljbUY1SUc5bUlITjViV0p2YkhNdVhHNGdLaTljYm5aaGNpQm5aWFJUZVcxaWIyeHpTVzRnUFNBaGJtRjBhWFpsUjJWMFUzbHRZbTlzY3lBL0lITjBkV0pCY25KaGVTQTZJR1oxYm1OMGFXOXVLRzlpYW1WamRDa2dlMXh1SUNCMllYSWdjbVZ6ZFd4MElEMGdXMTA3WEc0Z0lIZG9hV3hsSUNodlltcGxZM1FwSUh0Y2JpQWdJQ0JoY25KaGVWQjFjMmdvY21WemRXeDBMQ0JuWlhSVGVXMWliMnh6S0c5aWFtVmpkQ2twTzF4dUlDQWdJRzlpYW1WamRDQTlJR2RsZEZCeWIzUnZkSGx3WlNodlltcGxZM1FwTzF4dUlDQjlYRzRnSUhKbGRIVnliaUJ5WlhOMWJIUTdYRzU5TzF4dVhHNXRiMlIxYkdVdVpYaHdiM0owY3lBOUlHZGxkRk41YldKdmJITkpianRjYmlJc0luWmhjaUJqYjNCNVQySnFaV04wSUQwZ2NtVnhkV2x5WlNnbkxpOWZZMjl3ZVU5aWFtVmpkQ2NwTEZ4dUlDQWdJR2RsZEZONWJXSnZiSE5KYmlBOUlISmxjWFZwY21Vb0p5NHZYMmRsZEZONWJXSnZiSE5KYmljcE8xeHVYRzR2S2lwY2JpQXFJRU52Y0dsbGN5QnZkMjRnWVc1a0lHbHVhR1Z5YVhSbFpDQnplVzFpYjJ4eklHOW1JR0J6YjNWeVkyVmdJSFJ2SUdCdlltcGxZM1JnTGx4dUlDcGNiaUFxSUVCd2NtbDJZWFJsWEc0Z0tpQkFjR0Z5WVcwZ2UwOWlhbVZqZEgwZ2MyOTFjbU5sSUZSb1pTQnZZbXBsWTNRZ2RHOGdZMjl3ZVNCemVXMWliMnh6SUdaeWIyMHVYRzRnS2lCQWNHRnlZVzBnZTA5aWFtVmpkSDBnVzI5aWFtVmpkRDE3ZlYwZ1ZHaGxJRzlpYW1WamRDQjBieUJqYjNCNUlITjViV0p2YkhNZ2RHOHVYRzRnS2lCQWNtVjBkWEp1Y3lCN1QySnFaV04wZlNCU1pYUjFjbTV6SUdCdlltcGxZM1JnTGx4dUlDb3ZYRzVtZFc1amRHbHZiaUJqYjNCNVUzbHRZbTlzYzBsdUtITnZkWEpqWlN3Z2IySnFaV04wS1NCN1hHNGdJSEpsZEhWeWJpQmpiM0I1VDJKcVpXTjBLSE52ZFhKalpTd2daMlYwVTNsdFltOXNjMGx1S0hOdmRYSmpaU2tzSUc5aWFtVmpkQ2s3WEc1OVhHNWNibTF2WkhWc1pTNWxlSEJ2Y25SeklEMGdZMjl3ZVZONWJXSnZiSE5KYmp0Y2JpSXNJblpoY2lCaGNuSmhlVkIxYzJnZ1BTQnlaWEYxYVhKbEtDY3VMMTloY25KaGVWQjFjMmduS1N4Y2JpQWdJQ0JwYzBGeWNtRjVJRDBnY21WeGRXbHlaU2duTGk5cGMwRnljbUY1SnlrN1hHNWNiaThxS2x4dUlDb2dWR2hsSUdKaGMyVWdhVzF3YkdWdFpXNTBZWFJwYjI0Z2IyWWdZR2RsZEVGc2JFdGxlWE5nSUdGdVpDQmdaMlYwUVd4c1MyVjVjMGx1WUNCM2FHbGphQ0IxYzJWelhHNGdLaUJnYTJWNWMwWjFibU5nSUdGdVpDQmdjM2x0WW05c2MwWjFibU5nSUhSdklHZGxkQ0IwYUdVZ1pXNTFiV1Z5WVdKc1pTQndjbTl3WlhKMGVTQnVZVzFsY3lCaGJtUmNiaUFxSUhONWJXSnZiSE1nYjJZZ1lHOWlhbVZqZEdBdVhHNGdLbHh1SUNvZ1FIQnlhWFpoZEdWY2JpQXFJRUJ3WVhKaGJTQjdUMkpxWldOMGZTQnZZbXBsWTNRZ1ZHaGxJRzlpYW1WamRDQjBieUJ4ZFdWeWVTNWNiaUFxSUVCd1lYSmhiU0I3Um5WdVkzUnBiMjU5SUd0bGVYTkdkVzVqSUZSb1pTQm1kVzVqZEdsdmJpQjBieUJuWlhRZ2RHaGxJR3RsZVhNZ2IyWWdZRzlpYW1WamRHQXVYRzRnS2lCQWNHRnlZVzBnZTBaMWJtTjBhVzl1ZlNCemVXMWliMnh6Um5WdVl5QlVhR1VnWm5WdVkzUnBiMjRnZEc4Z1oyVjBJSFJvWlNCemVXMWliMnh6SUc5bUlHQnZZbXBsWTNSZ0xseHVJQ29nUUhKbGRIVnlibk1nZTBGeWNtRjVmU0JTWlhSMWNtNXpJSFJvWlNCaGNuSmhlU0J2WmlCd2NtOXdaWEowZVNCdVlXMWxjeUJoYm1RZ2MzbHRZbTlzY3k1Y2JpQXFMMXh1Wm5WdVkzUnBiMjRnWW1GelpVZGxkRUZzYkV0bGVYTW9iMkpxWldOMExDQnJaWGx6Um5WdVl5d2djM2x0WW05c2MwWjFibU1wSUh0Y2JpQWdkbUZ5SUhKbGMzVnNkQ0E5SUd0bGVYTkdkVzVqS0c5aWFtVmpkQ2s3WEc0Z0lISmxkSFZ5YmlCcGMwRnljbUY1S0c5aWFtVmpkQ2tnUHlCeVpYTjFiSFFnT2lCaGNuSmhlVkIxYzJnb2NtVnpkV3gwTENCemVXMWliMnh6Um5WdVl5aHZZbXBsWTNRcEtUdGNibjFjYmx4dWJXOWtkV3hsTG1WNGNHOXlkSE1nUFNCaVlYTmxSMlYwUVd4c1MyVjVjenRjYmlJc0luWmhjaUJpWVhObFIyVjBRV3hzUzJWNWN5QTlJSEpsY1hWcGNtVW9KeTR2WDJKaGMyVkhaWFJCYkd4TFpYbHpKeWtzWEc0Z0lDQWdaMlYwVTNsdFltOXNjeUE5SUhKbGNYVnBjbVVvSnk0dlgyZGxkRk41YldKdmJITW5LU3hjYmlBZ0lDQnJaWGx6SUQwZ2NtVnhkV2x5WlNnbkxpOXJaWGx6SnlrN1hHNWNiaThxS2x4dUlDb2dRM0psWVhSbGN5QmhiaUJoY25KaGVTQnZaaUJ2ZDI0Z1pXNTFiV1Z5WVdKc1pTQndjbTl3WlhKMGVTQnVZVzFsY3lCaGJtUWdjM2x0WW05c2N5QnZaaUJnYjJKcVpXTjBZQzVjYmlBcVhHNGdLaUJBY0hKcGRtRjBaVnh1SUNvZ1FIQmhjbUZ0SUh0UFltcGxZM1I5SUc5aWFtVmpkQ0JVYUdVZ2IySnFaV04wSUhSdklIRjFaWEo1TGx4dUlDb2dRSEpsZEhWeWJuTWdlMEZ5Y21GNWZTQlNaWFIxY201eklIUm9aU0JoY25KaGVTQnZaaUJ3Y205d1pYSjBlU0J1WVcxbGN5QmhibVFnYzNsdFltOXNjeTVjYmlBcUwxeHVablZ1WTNScGIyNGdaMlYwUVd4c1MyVjVjeWh2WW1wbFkzUXBJSHRjYmlBZ2NtVjBkWEp1SUdKaGMyVkhaWFJCYkd4TFpYbHpLRzlpYW1WamRDd2dhMlY1Y3l3Z1oyVjBVM2x0WW05c2N5azdYRzU5WEc1Y2JtMXZaSFZzWlM1bGVIQnZjblJ6SUQwZ1oyVjBRV3hzUzJWNWN6dGNiaUlzSW5aaGNpQmlZWE5sUjJWMFFXeHNTMlY1Y3lBOUlISmxjWFZwY21Vb0p5NHZYMkpoYzJWSFpYUkJiR3hMWlhsekp5a3NYRzRnSUNBZ1oyVjBVM2x0WW05c2MwbHVJRDBnY21WeGRXbHlaU2duTGk5ZloyVjBVM2x0WW05c2MwbHVKeWtzWEc0Z0lDQWdhMlY1YzBsdUlEMGdjbVZ4ZFdseVpTZ25MaTlyWlhselNXNG5LVHRjYmx4dUx5b3FYRzRnS2lCRGNtVmhkR1Z6SUdGdUlHRnljbUY1SUc5bUlHOTNiaUJoYm1RZ2FXNW9aWEpwZEdWa0lHVnVkVzFsY21GaWJHVWdjSEp2Y0dWeWRIa2dibUZ0WlhNZ1lXNWtYRzRnS2lCemVXMWliMnh6SUc5bUlHQnZZbXBsWTNSZ0xseHVJQ3BjYmlBcUlFQndjbWwyWVhSbFhHNGdLaUJBY0dGeVlXMGdlMDlpYW1WamRIMGdiMkpxWldOMElGUm9aU0J2WW1wbFkzUWdkRzhnY1hWbGNua3VYRzRnS2lCQWNtVjBkWEp1Y3lCN1FYSnlZWGw5SUZKbGRIVnlibk1nZEdobElHRnljbUY1SUc5bUlIQnliM0JsY25SNUlHNWhiV1Z6SUdGdVpDQnplVzFpYjJ4ekxseHVJQ292WEc1bWRXNWpkR2x2YmlCblpYUkJiR3hMWlhselNXNG9iMkpxWldOMEtTQjdYRzRnSUhKbGRIVnliaUJpWVhObFIyVjBRV3hzUzJWNWN5aHZZbXBsWTNRc0lHdGxlWE5KYml3Z1oyVjBVM2x0WW05c2MwbHVLVHRjYm4xY2JseHViVzlrZFd4bExtVjRjRzl5ZEhNZ1BTQm5aWFJCYkd4TFpYbHpTVzQ3WEc0aUxDSjJZWElnWjJWMFRtRjBhWFpsSUQwZ2NtVnhkV2x5WlNnbkxpOWZaMlYwVG1GMGFYWmxKeWtzWEc0Z0lDQWdjbTl2ZENBOUlISmxjWFZwY21Vb0p5NHZYM0p2YjNRbktUdGNibHh1THlvZ1FuVnBiSFF0YVc0Z2JXVjBhRzlrSUhKbFptVnlaVzVqWlhNZ2RHaGhkQ0JoY21VZ2RtVnlhV1pwWldRZ2RHOGdZbVVnYm1GMGFYWmxMaUFxTDF4dWRtRnlJRVJoZEdGV2FXVjNJRDBnWjJWMFRtRjBhWFpsS0hKdmIzUXNJQ2RFWVhSaFZtbGxkeWNwTzF4dVhHNXRiMlIxYkdVdVpYaHdiM0owY3lBOUlFUmhkR0ZXYVdWM08xeHVJaXdpZG1GeUlHZGxkRTVoZEdsMlpTQTlJSEpsY1hWcGNtVW9KeTR2WDJkbGRFNWhkR2wyWlNjcExGeHVJQ0FnSUhKdmIzUWdQU0J5WlhGMWFYSmxLQ2N1TDE5eWIyOTBKeWs3WEc1Y2JpOHFJRUoxYVd4MExXbHVJRzFsZEdodlpDQnlaV1psY21WdVkyVnpJSFJvWVhRZ1lYSmxJSFpsY21sbWFXVmtJSFJ2SUdKbElHNWhkR2wyWlM0Z0tpOWNiblpoY2lCUWNtOXRhWE5sSUQwZ1oyVjBUbUYwYVhabEtISnZiM1FzSUNkUWNtOXRhWE5sSnlrN1hHNWNibTF2WkhWc1pTNWxlSEJ2Y25SeklEMGdVSEp2YldselpUdGNiaUlzSW5aaGNpQm5aWFJPWVhScGRtVWdQU0J5WlhGMWFYSmxLQ2N1TDE5blpYUk9ZWFJwZG1VbktTeGNiaUFnSUNCeWIyOTBJRDBnY21WeGRXbHlaU2duTGk5ZmNtOXZkQ2NwTzF4dVhHNHZLaUJDZFdsc2RDMXBiaUJ0WlhSb2IyUWdjbVZtWlhKbGJtTmxjeUIwYUdGMElHRnlaU0IyWlhKcFptbGxaQ0IwYnlCaVpTQnVZWFJwZG1VdUlDb3ZYRzUyWVhJZ1UyVjBJRDBnWjJWMFRtRjBhWFpsS0hKdmIzUXNJQ2RUWlhRbktUdGNibHh1Ylc5a2RXeGxMbVY0Y0c5eWRITWdQU0JUWlhRN1hHNGlMQ0oyWVhJZ1oyVjBUbUYwYVhabElEMGdjbVZ4ZFdseVpTZ25MaTlmWjJWMFRtRjBhWFpsSnlrc1hHNGdJQ0FnY205dmRDQTlJSEpsY1hWcGNtVW9KeTR2WDNKdmIzUW5LVHRjYmx4dUx5b2dRblZwYkhRdGFXNGdiV1YwYUc5a0lISmxabVZ5Wlc1alpYTWdkR2hoZENCaGNtVWdkbVZ5YVdacFpXUWdkRzhnWW1VZ2JtRjBhWFpsTGlBcUwxeHVkbUZ5SUZkbFlXdE5ZWEFnUFNCblpYUk9ZWFJwZG1Vb2NtOXZkQ3dnSjFkbFlXdE5ZWEFuS1R0Y2JseHViVzlrZFd4bExtVjRjRzl5ZEhNZ1BTQlhaV0ZyVFdGd08xeHVJaXdpZG1GeUlFUmhkR0ZXYVdWM0lEMGdjbVZ4ZFdseVpTZ25MaTlmUkdGMFlWWnBaWGNuS1N4Y2JpQWdJQ0JOWVhBZ1BTQnlaWEYxYVhKbEtDY3VMMTlOWVhBbktTeGNiaUFnSUNCUWNtOXRhWE5sSUQwZ2NtVnhkV2x5WlNnbkxpOWZVSEp2YldselpTY3BMRnh1SUNBZ0lGTmxkQ0E5SUhKbGNYVnBjbVVvSnk0dlgxTmxkQ2NwTEZ4dUlDQWdJRmRsWVd0TllYQWdQU0J5WlhGMWFYSmxLQ2N1TDE5WFpXRnJUV0Z3Snlrc1hHNGdJQ0FnWW1GelpVZGxkRlJoWnlBOUlISmxjWFZwY21Vb0p5NHZYMkpoYzJWSFpYUlVZV2NuS1N4Y2JpQWdJQ0IwYjFOdmRYSmpaU0E5SUhKbGNYVnBjbVVvSnk0dlgzUnZVMjkxY21ObEp5azdYRzVjYmk4cUtpQmdUMkpxWldOMEkzUnZVM1J5YVc1bllDQnlaWE4xYkhRZ2NtVm1aWEpsYm1ObGN5NGdLaTljYm5aaGNpQnRZWEJVWVdjZ1BTQW5XMjlpYW1WamRDQk5ZWEJkSnl4Y2JpQWdJQ0J2WW1wbFkzUlVZV2NnUFNBblcyOWlhbVZqZENCUFltcGxZM1JkSnl4Y2JpQWdJQ0J3Y205dGFYTmxWR0ZuSUQwZ0oxdHZZbXBsWTNRZ1VISnZiV2x6WlYwbkxGeHVJQ0FnSUhObGRGUmhaeUE5SUNkYmIySnFaV04wSUZObGRGMG5MRnh1SUNBZ0lIZGxZV3ROWVhCVVlXY2dQU0FuVzI5aWFtVmpkQ0JYWldGclRXRndYU2M3WEc1Y2JuWmhjaUJrWVhSaFZtbGxkMVJoWnlBOUlDZGJiMkpxWldOMElFUmhkR0ZXYVdWM1hTYzdYRzVjYmk4cUtpQlZjMlZrSUhSdklHUmxkR1ZqZENCdFlYQnpMQ0J6WlhSekxDQmhibVFnZDJWaGEyMWhjSE11SUNvdlhHNTJZWElnWkdGMFlWWnBaWGREZEc5eVUzUnlhVzVuSUQwZ2RHOVRiM1Z5WTJVb1JHRjBZVlpwWlhjcExGeHVJQ0FnSUcxaGNFTjBiM0pUZEhKcGJtY2dQU0IwYjFOdmRYSmpaU2hOWVhBcExGeHVJQ0FnSUhCeWIyMXBjMlZEZEc5eVUzUnlhVzVuSUQwZ2RHOVRiM1Z5WTJVb1VISnZiV2x6WlNrc1hHNGdJQ0FnYzJWMFEzUnZjbE4wY21sdVp5QTlJSFJ2VTI5MWNtTmxLRk5sZENrc1hHNGdJQ0FnZDJWaGEwMWhjRU4wYjNKVGRISnBibWNnUFNCMGIxTnZkWEpqWlNoWFpXRnJUV0Z3S1R0Y2JseHVMeW9xWEc0Z0tpQkhaWFJ6SUhSb1pTQmdkRzlUZEhKcGJtZFVZV2RnSUc5bUlHQjJZV3gxWldBdVhHNGdLbHh1SUNvZ1FIQnlhWFpoZEdWY2JpQXFJRUJ3WVhKaGJTQjdLbjBnZG1Gc2RXVWdWR2hsSUhaaGJIVmxJSFJ2SUhGMVpYSjVMbHh1SUNvZ1FISmxkSFZ5Ym5NZ2UzTjBjbWx1WjMwZ1VtVjBkWEp1Y3lCMGFHVWdZSFJ2VTNSeWFXNW5WR0ZuWUM1Y2JpQXFMMXh1ZG1GeUlHZGxkRlJoWnlBOUlHSmhjMlZIWlhSVVlXYzdYRzVjYmk4dklFWmhiR3hpWVdOcklHWnZjaUJrWVhSaElIWnBaWGR6TENCdFlYQnpMQ0J6WlhSekxDQmhibVFnZDJWaGF5QnRZWEJ6SUdsdUlFbEZJREV4SUdGdVpDQndjbTl0YVhObGN5QnBiaUJPYjJSbExtcHpJRHdnTmk1Y2JtbG1JQ2dvUkdGMFlWWnBaWGNnSmlZZ1oyVjBWR0ZuS0c1bGR5QkVZWFJoVm1sbGR5aHVaWGNnUVhKeVlYbENkV1ptWlhJb01Ta3BLU0FoUFNCa1lYUmhWbWxsZDFSaFp5a2dmSHhjYmlBZ0lDQW9UV0Z3SUNZbUlHZGxkRlJoWnlodVpYY2dUV0Z3S1NBaFBTQnRZWEJVWVdjcElIeDhYRzRnSUNBZ0tGQnliMjFwYzJVZ0ppWWdaMlYwVkdGbktGQnliMjFwYzJVdWNtVnpiMngyWlNncEtTQWhQU0J3Y205dGFYTmxWR0ZuS1NCOGZGeHVJQ0FnSUNoVFpYUWdKaVlnWjJWMFZHRm5LRzVsZHlCVFpYUXBJQ0U5SUhObGRGUmhaeWtnZkh4Y2JpQWdJQ0FvVjJWaGEwMWhjQ0FtSmlCblpYUlVZV2NvYm1WM0lGZGxZV3ROWVhBcElDRTlJSGRsWVd0TllYQlVZV2NwS1NCN1hHNGdJR2RsZEZSaFp5QTlJR1oxYm1OMGFXOXVLSFpoYkhWbEtTQjdYRzRnSUNBZ2RtRnlJSEpsYzNWc2RDQTlJR0poYzJWSFpYUlVZV2NvZG1Gc2RXVXBMRnh1SUNBZ0lDQWdJQ0JEZEc5eUlEMGdjbVZ6ZFd4MElEMDlJRzlpYW1WamRGUmhaeUEvSUhaaGJIVmxMbU52Ym5OMGNuVmpkRzl5SURvZ2RXNWtaV1pwYm1Wa0xGeHVJQ0FnSUNBZ0lDQmpkRzl5VTNSeWFXNW5JRDBnUTNSdmNpQS9JSFJ2VTI5MWNtTmxLRU4wYjNJcElEb2dKeWM3WEc1Y2JpQWdJQ0JwWmlBb1kzUnZjbE4wY21sdVp5a2dlMXh1SUNBZ0lDQWdjM2RwZEdOb0lDaGpkRzl5VTNSeWFXNW5LU0I3WEc0Z0lDQWdJQ0FnSUdOaGMyVWdaR0YwWVZacFpYZERkRzl5VTNSeWFXNW5PaUJ5WlhSMWNtNGdaR0YwWVZacFpYZFVZV2M3WEc0Z0lDQWdJQ0FnSUdOaGMyVWdiV0Z3UTNSdmNsTjBjbWx1WnpvZ2NtVjBkWEp1SUcxaGNGUmhaenRjYmlBZ0lDQWdJQ0FnWTJGelpTQndjbTl0YVhObFEzUnZjbE4wY21sdVp6b2djbVYwZFhKdUlIQnliMjFwYzJWVVlXYzdYRzRnSUNBZ0lDQWdJR05oYzJVZ2MyVjBRM1J2Y2xOMGNtbHVaem9nY21WMGRYSnVJSE5sZEZSaFp6dGNiaUFnSUNBZ0lDQWdZMkZ6WlNCM1pXRnJUV0Z3UTNSdmNsTjBjbWx1WnpvZ2NtVjBkWEp1SUhkbFlXdE5ZWEJVWVdjN1hHNGdJQ0FnSUNCOVhHNGdJQ0FnZlZ4dUlDQWdJSEpsZEhWeWJpQnlaWE4xYkhRN1hHNGdJSDA3WEc1OVhHNWNibTF2WkhWc1pTNWxlSEJ2Y25SeklEMGdaMlYwVkdGbk8xeHVJaXdpTHlvcUlGVnpaV1FnWm05eUlHSjFhV3gwTFdsdUlHMWxkR2h2WkNCeVpXWmxjbVZ1WTJWekxpQXFMMXh1ZG1GeUlHOWlhbVZqZEZCeWIzUnZJRDBnVDJKcVpXTjBMbkJ5YjNSdmRIbHdaVHRjYmx4dUx5b3FJRlZ6WldRZ2RHOGdZMmhsWTJzZ2IySnFaV04wY3lCbWIzSWdiM2R1SUhCeWIzQmxjblJwWlhNdUlDb3ZYRzUyWVhJZ2FHRnpUM2R1VUhKdmNHVnlkSGtnUFNCdlltcGxZM1JRY205MGJ5NW9ZWE5QZDI1UWNtOXdaWEowZVR0Y2JseHVMeW9xWEc0Z0tpQkpibWwwYVdGc2FYcGxjeUJoYmlCaGNuSmhlU0JqYkc5dVpTNWNiaUFxWEc0Z0tpQkFjSEpwZG1GMFpWeHVJQ29nUUhCaGNtRnRJSHRCY25KaGVYMGdZWEp5WVhrZ1ZHaGxJR0Z5Y21GNUlIUnZJR05zYjI1bExseHVJQ29nUUhKbGRIVnlibk1nZTBGeWNtRjVmU0JTWlhSMWNtNXpJSFJvWlNCcGJtbDBhV0ZzYVhwbFpDQmpiRzl1WlM1Y2JpQXFMMXh1Wm5WdVkzUnBiMjRnYVc1cGRFTnNiMjVsUVhKeVlYa29ZWEp5WVhrcElIdGNiaUFnZG1GeUlHeGxibWQwYUNBOUlHRnljbUY1TG14bGJtZDBhQ3hjYmlBZ0lDQWdJSEpsYzNWc2RDQTlJR0Z5Y21GNUxtTnZibk4wY25WamRHOXlLR3hsYm1kMGFDazdYRzVjYmlBZ0x5OGdRV1JrSUhCeWIzQmxjblJwWlhNZ1lYTnphV2R1WldRZ1lua2dZRkpsWjBWNGNDTmxlR1ZqWUM1Y2JpQWdhV1lnS0d4bGJtZDBhQ0FtSmlCMGVYQmxiMllnWVhKeVlYbGJNRjBnUFQwZ0ozTjBjbWx1WnljZ0ppWWdhR0Z6VDNkdVVISnZjR1Z5ZEhrdVkyRnNiQ2hoY25KaGVTd2dKMmx1WkdWNEp5a3BJSHRjYmlBZ0lDQnlaWE4xYkhRdWFXNWtaWGdnUFNCaGNuSmhlUzVwYm1SbGVEdGNiaUFnSUNCeVpYTjFiSFF1YVc1d2RYUWdQU0JoY25KaGVTNXBibkIxZER0Y2JpQWdmVnh1SUNCeVpYUjFjbTRnY21WemRXeDBPMXh1ZlZ4dVhHNXRiMlIxYkdVdVpYaHdiM0owY3lBOUlHbHVhWFJEYkc5dVpVRnljbUY1TzF4dUlpd2lkbUZ5SUhKdmIzUWdQU0J5WlhGMWFYSmxLQ2N1TDE5eWIyOTBKeWs3WEc1Y2JpOHFLaUJDZFdsc2RDMXBiaUIyWVd4MVpTQnlaV1psY21WdVkyVnpMaUFxTDF4dWRtRnlJRlZwYm5RNFFYSnlZWGtnUFNCeWIyOTBMbFZwYm5RNFFYSnlZWGs3WEc1Y2JtMXZaSFZzWlM1bGVIQnZjblJ6SUQwZ1ZXbHVkRGhCY25KaGVUdGNiaUlzSW5aaGNpQlZhVzUwT0VGeWNtRjVJRDBnY21WeGRXbHlaU2duTGk5ZlZXbHVkRGhCY25KaGVTY3BPMXh1WEc0dktpcGNiaUFxSUVOeVpXRjBaWE1nWVNCamJHOXVaU0J2WmlCZ1lYSnlZWGxDZFdabVpYSmdMbHh1SUNwY2JpQXFJRUJ3Y21sMllYUmxYRzRnS2lCQWNHRnlZVzBnZTBGeWNtRjVRblZtWm1WeWZTQmhjbkpoZVVKMVptWmxjaUJVYUdVZ1lYSnlZWGtnWW5WbVptVnlJSFJ2SUdOc2IyNWxMbHh1SUNvZ1FISmxkSFZ5Ym5NZ2UwRnljbUY1UW5WbVptVnlmU0JTWlhSMWNtNXpJSFJvWlNCamJHOXVaV1FnWVhKeVlYa2dZblZtWm1WeUxseHVJQ292WEc1bWRXNWpkR2x2YmlCamJHOXVaVUZ5Y21GNVFuVm1abVZ5S0dGeWNtRjVRblZtWm1WeUtTQjdYRzRnSUhaaGNpQnlaWE4xYkhRZ1BTQnVaWGNnWVhKeVlYbENkV1ptWlhJdVkyOXVjM1J5ZFdOMGIzSW9ZWEp5WVhsQ2RXWm1aWEl1WW5sMFpVeGxibWQwYUNrN1hHNGdJRzVsZHlCVmFXNTBPRUZ5Y21GNUtISmxjM1ZzZENrdWMyVjBLRzVsZHlCVmFXNTBPRUZ5Y21GNUtHRnljbUY1UW5WbVptVnlLU2s3WEc0Z0lISmxkSFZ5YmlCeVpYTjFiSFE3WEc1OVhHNWNibTF2WkhWc1pTNWxlSEJ2Y25SeklEMGdZMnh2Ym1WQmNuSmhlVUoxWm1abGNqdGNiaUlzSW5aaGNpQmpiRzl1WlVGeWNtRjVRblZtWm1WeUlEMGdjbVZ4ZFdseVpTZ25MaTlmWTJ4dmJtVkJjbkpoZVVKMVptWmxjaWNwTzF4dVhHNHZLaXBjYmlBcUlFTnlaV0YwWlhNZ1lTQmpiRzl1WlNCdlppQmdaR0YwWVZacFpYZGdMbHh1SUNwY2JpQXFJRUJ3Y21sMllYUmxYRzRnS2lCQWNHRnlZVzBnZTA5aWFtVmpkSDBnWkdGMFlWWnBaWGNnVkdobElHUmhkR0VnZG1sbGR5QjBieUJqYkc5dVpTNWNiaUFxSUVCd1lYSmhiU0I3WW05dmJHVmhibjBnVzJselJHVmxjRjBnVTNCbFkybG1lU0JoSUdSbFpYQWdZMnh2Ym1VdVhHNGdLaUJBY21WMGRYSnVjeUI3VDJKcVpXTjBmU0JTWlhSMWNtNXpJSFJvWlNCamJHOXVaV1FnWkdGMFlTQjJhV1YzTGx4dUlDb3ZYRzVtZFc1amRHbHZiaUJqYkc5dVpVUmhkR0ZXYVdWM0tHUmhkR0ZXYVdWM0xDQnBjMFJsWlhBcElIdGNiaUFnZG1GeUlHSjFabVpsY2lBOUlHbHpSR1ZsY0NBL0lHTnNiMjVsUVhKeVlYbENkV1ptWlhJb1pHRjBZVlpwWlhjdVluVm1abVZ5S1NBNklHUmhkR0ZXYVdWM0xtSjFabVpsY2p0Y2JpQWdjbVYwZFhKdUlHNWxkeUJrWVhSaFZtbGxkeTVqYjI1emRISjFZM1J2Y2loaWRXWm1aWElzSUdSaGRHRldhV1YzTG1KNWRHVlBabVp6WlhRc0lHUmhkR0ZXYVdWM0xtSjVkR1ZNWlc1bmRHZ3BPMXh1ZlZ4dVhHNXRiMlIxYkdVdVpYaHdiM0owY3lBOUlHTnNiMjVsUkdGMFlWWnBaWGM3WEc0aUxDSXZLaXBjYmlBcUlFRmtaSE1nZEdobElHdGxlUzEyWVd4MVpTQmdjR0ZwY21BZ2RHOGdZRzFoY0dBdVhHNGdLbHh1SUNvZ1FIQnlhWFpoZEdWY2JpQXFJRUJ3WVhKaGJTQjdUMkpxWldOMGZTQnRZWEFnVkdobElHMWhjQ0IwYnlCdGIyUnBabmt1WEc0Z0tpQkFjR0Z5WVcwZ2UwRnljbUY1ZlNCd1lXbHlJRlJvWlNCclpYa3RkbUZzZFdVZ2NHRnBjaUIwYnlCaFpHUXVYRzRnS2lCQWNtVjBkWEp1Y3lCN1QySnFaV04wZlNCU1pYUjFjbTV6SUdCdFlYQmdMbHh1SUNvdlhHNW1kVzVqZEdsdmJpQmhaR1JOWVhCRmJuUnllU2h0WVhBc0lIQmhhWElwSUh0Y2JpQWdMeThnUkc5dUozUWdjbVYwZFhKdUlHQnRZWEF1YzJWMFlDQmlaV05oZFhObElHbDBKM01nYm05MElHTm9ZV2x1WVdKc1pTQnBiaUJKUlNBeE1TNWNiaUFnYldGd0xuTmxkQ2h3WVdseVd6QmRMQ0J3WVdseVd6RmRLVHRjYmlBZ2NtVjBkWEp1SUcxaGNEdGNibjFjYmx4dWJXOWtkV3hsTG1WNGNHOXlkSE1nUFNCaFpHUk5ZWEJGYm5SeWVUdGNiaUlzSWk4cUtseHVJQ29nUVNCemNHVmphV0ZzYVhwbFpDQjJaWEp6YVc5dUlHOW1JR0JmTG5KbFpIVmpaV0FnWm05eUlHRnljbUY1Y3lCM2FYUm9iM1YwSUhOMWNIQnZjblFnWm05eVhHNGdLaUJwZEdWeVlYUmxaU0J6YUc5eWRHaGhibVJ6TGx4dUlDcGNiaUFxSUVCd2NtbDJZWFJsWEc0Z0tpQkFjR0Z5WVcwZ2UwRnljbUY1ZlNCYllYSnlZWGxkSUZSb1pTQmhjbkpoZVNCMGJ5QnBkR1Z5WVhSbElHOTJaWEl1WEc0Z0tpQkFjR0Z5WVcwZ2UwWjFibU4wYVc5dWZTQnBkR1Z5WVhSbFpTQlVhR1VnWm5WdVkzUnBiMjRnYVc1MmIydGxaQ0J3WlhJZ2FYUmxjbUYwYVc5dUxseHVJQ29nUUhCaGNtRnRJSHNxZlNCYllXTmpkVzExYkdGMGIzSmRJRlJvWlNCcGJtbDBhV0ZzSUhaaGJIVmxMbHh1SUNvZ1FIQmhjbUZ0SUh0aWIyOXNaV0Z1ZlNCYmFXNXBkRUZqWTNWdFhTQlRjR1ZqYVdaNUlIVnphVzVuSUhSb1pTQm1hWEp6ZENCbGJHVnRaVzUwSUc5bUlHQmhjbkpoZVdBZ1lYTmNiaUFxSUNCMGFHVWdhVzVwZEdsaGJDQjJZV3gxWlM1Y2JpQXFJRUJ5WlhSMWNtNXpJSHNxZlNCU1pYUjFjbTV6SUhSb1pTQmhZMk4xYlhWc1lYUmxaQ0IyWVd4MVpTNWNiaUFxTDF4dVpuVnVZM1JwYjI0Z1lYSnlZWGxTWldSMVkyVW9ZWEp5WVhrc0lHbDBaWEpoZEdWbExDQmhZMk4xYlhWc1lYUnZjaXdnYVc1cGRFRmpZM1Z0S1NCN1hHNGdJSFpoY2lCcGJtUmxlQ0E5SUMweExGeHVJQ0FnSUNBZ2JHVnVaM1JvSUQwZ1lYSnlZWGtnUFQwZ2JuVnNiQ0EvSURBZ09pQmhjbkpoZVM1c1pXNW5kR2c3WEc1Y2JpQWdhV1lnS0dsdWFYUkJZMk4xYlNBbUppQnNaVzVuZEdncElIdGNiaUFnSUNCaFkyTjFiWFZzWVhSdmNpQTlJR0Z5Y21GNVd5c3JhVzVrWlhoZE8xeHVJQ0I5WEc0Z0lIZG9hV3hsSUNncksybHVaR1Y0SUR3Z2JHVnVaM1JvS1NCN1hHNGdJQ0FnWVdOamRXMTFiR0YwYjNJZ1BTQnBkR1Z5WVhSbFpTaGhZMk4xYlhWc1lYUnZjaXdnWVhKeVlYbGJhVzVrWlhoZExDQnBibVJsZUN3Z1lYSnlZWGtwTzF4dUlDQjlYRzRnSUhKbGRIVnliaUJoWTJOMWJYVnNZWFJ2Y2p0Y2JuMWNibHh1Ylc5a2RXeGxMbVY0Y0c5eWRITWdQU0JoY25KaGVWSmxaSFZqWlR0Y2JpSXNJaThxS2x4dUlDb2dRMjl1ZG1WeWRITWdZRzFoY0dBZ2RHOGdhWFJ6SUd0bGVTMTJZV3gxWlNCd1lXbHljeTVjYmlBcVhHNGdLaUJBY0hKcGRtRjBaVnh1SUNvZ1FIQmhjbUZ0SUh0UFltcGxZM1I5SUcxaGNDQlVhR1VnYldGd0lIUnZJR052Ym5abGNuUXVYRzRnS2lCQWNtVjBkWEp1Y3lCN1FYSnlZWGw5SUZKbGRIVnlibk1nZEdobElHdGxlUzEyWVd4MVpTQndZV2x5Y3k1Y2JpQXFMMXh1Wm5WdVkzUnBiMjRnYldGd1ZHOUJjbkpoZVNodFlYQXBJSHRjYmlBZ2RtRnlJR2x1WkdWNElEMGdMVEVzWEc0Z0lDQWdJQ0J5WlhOMWJIUWdQU0JCY25KaGVTaHRZWEF1YzJsNlpTazdYRzVjYmlBZ2JXRndMbVp2Y2tWaFkyZ29ablZ1WTNScGIyNG9kbUZzZFdVc0lHdGxlU2tnZTF4dUlDQWdJSEpsYzNWc2RGc3JLMmx1WkdWNFhTQTlJRnRyWlhrc0lIWmhiSFZsWFR0Y2JpQWdmU2s3WEc0Z0lISmxkSFZ5YmlCeVpYTjFiSFE3WEc1OVhHNWNibTF2WkhWc1pTNWxlSEJ2Y25SeklEMGdiV0Z3Vkc5QmNuSmhlVHRjYmlJc0luWmhjaUJoWkdSTllYQkZiblJ5ZVNBOUlISmxjWFZwY21Vb0p5NHZYMkZrWkUxaGNFVnVkSEo1Snlrc1hHNGdJQ0FnWVhKeVlYbFNaV1IxWTJVZ1BTQnlaWEYxYVhKbEtDY3VMMTloY25KaGVWSmxaSFZqWlNjcExGeHVJQ0FnSUcxaGNGUnZRWEp5WVhrZ1BTQnlaWEYxYVhKbEtDY3VMMTl0WVhCVWIwRnljbUY1SnlrN1hHNWNiaThxS2lCVmMyVmtJSFJ2SUdOdmJYQnZjMlVnWW1sMGJXRnphM01nWm05eUlHTnNiMjVwYm1jdUlDb3ZYRzUyWVhJZ1EweFBUa1ZmUkVWRlVGOUdURUZISUQwZ01UdGNibHh1THlvcVhHNGdLaUJEY21WaGRHVnpJR0VnWTJ4dmJtVWdiMllnWUcxaGNHQXVYRzRnS2x4dUlDb2dRSEJ5YVhaaGRHVmNiaUFxSUVCd1lYSmhiU0I3VDJKcVpXTjBmU0J0WVhBZ1ZHaGxJRzFoY0NCMGJ5QmpiRzl1WlM1Y2JpQXFJRUJ3WVhKaGJTQjdSblZ1WTNScGIyNTlJR05zYjI1bFJuVnVZeUJVYUdVZ1puVnVZM1JwYjI0Z2RHOGdZMnh2Ym1VZ2RtRnNkV1Z6TGx4dUlDb2dRSEJoY21GdElIdGliMjlzWldGdWZTQmJhWE5FWldWd1hTQlRjR1ZqYVdaNUlHRWdaR1ZsY0NCamJHOXVaUzVjYmlBcUlFQnlaWFIxY201eklIdFBZbXBsWTNSOUlGSmxkSFZ5Ym5NZ2RHaGxJR05zYjI1bFpDQnRZWEF1WEc0Z0tpOWNibVoxYm1OMGFXOXVJR05zYjI1bFRXRndLRzFoY0N3Z2FYTkVaV1Z3TENCamJHOXVaVVoxYm1NcElIdGNiaUFnZG1GeUlHRnljbUY1SUQwZ2FYTkVaV1Z3SUQ4Z1kyeHZibVZHZFc1aktHMWhjRlJ2UVhKeVlYa29iV0Z3S1N3Z1EweFBUa1ZmUkVWRlVGOUdURUZIS1NBNklHMWhjRlJ2UVhKeVlYa29iV0Z3S1R0Y2JpQWdjbVYwZFhKdUlHRnljbUY1VW1Wa2RXTmxLR0Z5Y21GNUxDQmhaR1JOWVhCRmJuUnllU3dnYm1WM0lHMWhjQzVqYjI1emRISjFZM1J2Y2lrN1hHNTlYRzVjYm0xdlpIVnNaUzVsZUhCdmNuUnpJRDBnWTJ4dmJtVk5ZWEE3WEc0aUxDSXZLaW9nVlhObFpDQjBieUJ0WVhSamFDQmdVbVZuUlhod1lDQm1iR0ZuY3lCbWNtOXRJSFJvWldseUlHTnZaWEpqWldRZ2MzUnlhVzVuSUhaaGJIVmxjeTRnS2k5Y2JuWmhjaUJ5WlVac1lXZHpJRDBnTDF4Y2R5b2tMenRjYmx4dUx5b3FYRzRnS2lCRGNtVmhkR1Z6SUdFZ1kyeHZibVVnYjJZZ1lISmxaMlY0Y0dBdVhHNGdLbHh1SUNvZ1FIQnlhWFpoZEdWY2JpQXFJRUJ3WVhKaGJTQjdUMkpxWldOMGZTQnlaV2RsZUhBZ1ZHaGxJSEpsWjJWNGNDQjBieUJqYkc5dVpTNWNiaUFxSUVCeVpYUjFjbTV6SUh0UFltcGxZM1I5SUZKbGRIVnlibk1nZEdobElHTnNiMjVsWkNCeVpXZGxlSEF1WEc0Z0tpOWNibVoxYm1OMGFXOXVJR05zYjI1bFVtVm5SWGh3S0hKbFoyVjRjQ2tnZTF4dUlDQjJZWElnY21WemRXeDBJRDBnYm1WM0lISmxaMlY0Y0M1amIyNXpkSEoxWTNSdmNpaHlaV2RsZUhBdWMyOTFjbU5sTENCeVpVWnNZV2R6TG1WNFpXTW9jbVZuWlhod0tTazdYRzRnSUhKbGMzVnNkQzVzWVhOMFNXNWtaWGdnUFNCeVpXZGxlSEF1YkdGemRFbHVaR1Y0TzF4dUlDQnlaWFIxY200Z2NtVnpkV3gwTzF4dWZWeHVYRzV0YjJSMWJHVXVaWGh3YjNKMGN5QTlJR05zYjI1bFVtVm5SWGh3TzF4dUlpd2lMeW9xWEc0Z0tpQkJaR1J6SUdCMllXeDFaV0FnZEc4Z1lITmxkR0F1WEc0Z0tseHVJQ29nUUhCeWFYWmhkR1ZjYmlBcUlFQndZWEpoYlNCN1QySnFaV04wZlNCelpYUWdWR2hsSUhObGRDQjBieUJ0YjJScFpua3VYRzRnS2lCQWNHRnlZVzBnZXlwOUlIWmhiSFZsSUZSb1pTQjJZV3gxWlNCMGJ5QmhaR1F1WEc0Z0tpQkFjbVYwZFhKdWN5QjdUMkpxWldOMGZTQlNaWFIxY201eklHQnpaWFJnTGx4dUlDb3ZYRzVtZFc1amRHbHZiaUJoWkdSVFpYUkZiblJ5ZVNoelpYUXNJSFpoYkhWbEtTQjdYRzRnSUM4dklFUnZiaWQwSUhKbGRIVnliaUJnYzJWMExtRmtaR0FnWW1WallYVnpaU0JwZENkeklHNXZkQ0JqYUdGcGJtRmliR1VnYVc0Z1NVVWdNVEV1WEc0Z0lITmxkQzVoWkdRb2RtRnNkV1VwTzF4dUlDQnlaWFIxY200Z2MyVjBPMXh1ZlZ4dVhHNXRiMlIxYkdVdVpYaHdiM0owY3lBOUlHRmtaRk5sZEVWdWRISjVPMXh1SWl3aUx5b3FYRzRnS2lCRGIyNTJaWEowY3lCZ2MyVjBZQ0IwYnlCaGJpQmhjbkpoZVNCdlppQnBkSE1nZG1Gc2RXVnpMbHh1SUNwY2JpQXFJRUJ3Y21sMllYUmxYRzRnS2lCQWNHRnlZVzBnZTA5aWFtVmpkSDBnYzJWMElGUm9aU0J6WlhRZ2RHOGdZMjl1ZG1WeWRDNWNiaUFxSUVCeVpYUjFjbTV6SUh0QmNuSmhlWDBnVW1WMGRYSnVjeUIwYUdVZ2RtRnNkV1Z6TGx4dUlDb3ZYRzVtZFc1amRHbHZiaUJ6WlhSVWIwRnljbUY1S0hObGRDa2dlMXh1SUNCMllYSWdhVzVrWlhnZ1BTQXRNU3hjYmlBZ0lDQWdJSEpsYzNWc2RDQTlJRUZ5Y21GNUtITmxkQzV6YVhwbEtUdGNibHh1SUNCelpYUXVabTl5UldGamFDaG1kVzVqZEdsdmJpaDJZV3gxWlNrZ2UxeHVJQ0FnSUhKbGMzVnNkRnNySzJsdVpHVjRYU0E5SUhaaGJIVmxPMXh1SUNCOUtUdGNiaUFnY21WMGRYSnVJSEpsYzNWc2REdGNibjFjYmx4dWJXOWtkV3hsTG1WNGNHOXlkSE1nUFNCelpYUlViMEZ5Y21GNU8xeHVJaXdpZG1GeUlHRmtaRk5sZEVWdWRISjVJRDBnY21WeGRXbHlaU2duTGk5ZllXUmtVMlYwUlc1MGNua25LU3hjYmlBZ0lDQmhjbkpoZVZKbFpIVmpaU0E5SUhKbGNYVnBjbVVvSnk0dlgyRnljbUY1VW1Wa2RXTmxKeWtzWEc0Z0lDQWdjMlYwVkc5QmNuSmhlU0E5SUhKbGNYVnBjbVVvSnk0dlgzTmxkRlJ2UVhKeVlYa25LVHRjYmx4dUx5b3FJRlZ6WldRZ2RHOGdZMjl0Y0c5elpTQmlhWFJ0WVhOcmN5Qm1iM0lnWTJ4dmJtbHVaeTRnS2k5Y2JuWmhjaUJEVEU5T1JWOUVSVVZRWDBaTVFVY2dQU0F4TzF4dVhHNHZLaXBjYmlBcUlFTnlaV0YwWlhNZ1lTQmpiRzl1WlNCdlppQmdjMlYwWUM1Y2JpQXFYRzRnS2lCQWNISnBkbUYwWlZ4dUlDb2dRSEJoY21GdElIdFBZbXBsWTNSOUlITmxkQ0JVYUdVZ2MyVjBJSFJ2SUdOc2IyNWxMbHh1SUNvZ1FIQmhjbUZ0SUh0R2RXNWpkR2x2Ym4wZ1kyeHZibVZHZFc1aklGUm9aU0JtZFc1amRHbHZiaUIwYnlCamJHOXVaU0IyWVd4MVpYTXVYRzRnS2lCQWNHRnlZVzBnZTJKdmIyeGxZVzU5SUZ0cGMwUmxaWEJkSUZOd1pXTnBabmtnWVNCa1pXVndJR05zYjI1bExseHVJQ29nUUhKbGRIVnlibk1nZTA5aWFtVmpkSDBnVW1WMGRYSnVjeUIwYUdVZ1kyeHZibVZrSUhObGRDNWNiaUFxTDF4dVpuVnVZM1JwYjI0Z1kyeHZibVZUWlhRb2MyVjBMQ0JwYzBSbFpYQXNJR05zYjI1bFJuVnVZeWtnZTF4dUlDQjJZWElnWVhKeVlYa2dQU0JwYzBSbFpYQWdQeUJqYkc5dVpVWjFibU1vYzJWMFZHOUJjbkpoZVNoelpYUXBMQ0JEVEU5T1JWOUVSVVZRWDBaTVFVY3BJRG9nYzJWMFZHOUJjbkpoZVNoelpYUXBPMXh1SUNCeVpYUjFjbTRnWVhKeVlYbFNaV1IxWTJVb1lYSnlZWGtzSUdGa1pGTmxkRVZ1ZEhKNUxDQnVaWGNnYzJWMExtTnZibk4wY25WamRHOXlLVHRjYm4xY2JseHViVzlrZFd4bExtVjRjRzl5ZEhNZ1BTQmpiRzl1WlZObGREdGNiaUlzSW5aaGNpQlRlVzFpYjJ3Z1BTQnlaWEYxYVhKbEtDY3VMMTlUZVcxaWIyd25LVHRjYmx4dUx5b3FJRlZ6WldRZ2RHOGdZMjl1ZG1WeWRDQnplVzFpYjJ4eklIUnZJSEJ5YVcxcGRHbDJaWE1nWVc1a0lITjBjbWx1WjNNdUlDb3ZYRzUyWVhJZ2MzbHRZbTlzVUhKdmRHOGdQU0JUZVcxaWIyd2dQeUJUZVcxaWIyd3VjSEp2ZEc5MGVYQmxJRG9nZFc1a1pXWnBibVZrTEZ4dUlDQWdJSE41YldKdmJGWmhiSFZsVDJZZ1BTQnplVzFpYjJ4UWNtOTBieUEvSUhONWJXSnZiRkJ5YjNSdkxuWmhiSFZsVDJZZ09pQjFibVJsWm1sdVpXUTdYRzVjYmk4cUtseHVJQ29nUTNKbFlYUmxjeUJoSUdOc2IyNWxJRzltSUhSb1pTQmdjM2x0WW05c1lDQnZZbXBsWTNRdVhHNGdLbHh1SUNvZ1FIQnlhWFpoZEdWY2JpQXFJRUJ3WVhKaGJTQjdUMkpxWldOMGZTQnplVzFpYjJ3Z1ZHaGxJSE41YldKdmJDQnZZbXBsWTNRZ2RHOGdZMnh2Ym1VdVhHNGdLaUJBY21WMGRYSnVjeUI3VDJKcVpXTjBmU0JTWlhSMWNtNXpJSFJvWlNCamJHOXVaV1FnYzNsdFltOXNJRzlpYW1WamRDNWNiaUFxTDF4dVpuVnVZM1JwYjI0Z1kyeHZibVZUZVcxaWIyd29jM2x0WW05c0tTQjdYRzRnSUhKbGRIVnliaUJ6ZVcxaWIyeFdZV3gxWlU5bUlEOGdUMkpxWldOMEtITjViV0p2YkZaaGJIVmxUMll1WTJGc2JDaHplVzFpYjJ3cEtTQTZJSHQ5TzF4dWZWeHVYRzV0YjJSMWJHVXVaWGh3YjNKMGN5QTlJR05zYjI1bFUzbHRZbTlzTzF4dUlpd2lkbUZ5SUdOc2IyNWxRWEp5WVhsQ2RXWm1aWElnUFNCeVpYRjFhWEpsS0NjdUwxOWpiRzl1WlVGeWNtRjVRblZtWm1WeUp5azdYRzVjYmk4cUtseHVJQ29nUTNKbFlYUmxjeUJoSUdOc2IyNWxJRzltSUdCMGVYQmxaRUZ5Y21GNVlDNWNiaUFxWEc0Z0tpQkFjSEpwZG1GMFpWeHVJQ29nUUhCaGNtRnRJSHRQWW1wbFkzUjlJSFI1Y0dWa1FYSnlZWGtnVkdobElIUjVjR1ZrSUdGeWNtRjVJSFJ2SUdOc2IyNWxMbHh1SUNvZ1FIQmhjbUZ0SUh0aWIyOXNaV0Z1ZlNCYmFYTkVaV1Z3WFNCVGNHVmphV1o1SUdFZ1pHVmxjQ0JqYkc5dVpTNWNiaUFxSUVCeVpYUjFjbTV6SUh0UFltcGxZM1I5SUZKbGRIVnlibk1nZEdobElHTnNiMjVsWkNCMGVYQmxaQ0JoY25KaGVTNWNiaUFxTDF4dVpuVnVZM1JwYjI0Z1kyeHZibVZVZVhCbFpFRnljbUY1S0hSNWNHVmtRWEp5WVhrc0lHbHpSR1ZsY0NrZ2UxeHVJQ0IyWVhJZ1luVm1abVZ5SUQwZ2FYTkVaV1Z3SUQ4Z1kyeHZibVZCY25KaGVVSjFabVpsY2loMGVYQmxaRUZ5Y21GNUxtSjFabVpsY2lrZ09pQjBlWEJsWkVGeWNtRjVMbUoxWm1abGNqdGNiaUFnY21WMGRYSnVJRzVsZHlCMGVYQmxaRUZ5Y21GNUxtTnZibk4wY25WamRHOXlLR0oxWm1abGNpd2dkSGx3WldSQmNuSmhlUzVpZVhSbFQyWm1jMlYwTENCMGVYQmxaRUZ5Y21GNUxteGxibWQwYUNrN1hHNTlYRzVjYm0xdlpIVnNaUzVsZUhCdmNuUnpJRDBnWTJ4dmJtVlVlWEJsWkVGeWNtRjVPMXh1SWl3aWRtRnlJR05zYjI1bFFYSnlZWGxDZFdabVpYSWdQU0J5WlhGMWFYSmxLQ2N1TDE5amJHOXVaVUZ5Y21GNVFuVm1abVZ5Snlrc1hHNGdJQ0FnWTJ4dmJtVkVZWFJoVm1sbGR5QTlJSEpsY1hWcGNtVW9KeTR2WDJOc2IyNWxSR0YwWVZacFpYY25LU3hjYmlBZ0lDQmpiRzl1WlUxaGNDQTlJSEpsY1hWcGNtVW9KeTR2WDJOc2IyNWxUV0Z3Snlrc1hHNGdJQ0FnWTJ4dmJtVlNaV2RGZUhBZ1BTQnlaWEYxYVhKbEtDY3VMMTlqYkc5dVpWSmxaMFY0Y0NjcExGeHVJQ0FnSUdOc2IyNWxVMlYwSUQwZ2NtVnhkV2x5WlNnbkxpOWZZMnh2Ym1WVFpYUW5LU3hjYmlBZ0lDQmpiRzl1WlZONWJXSnZiQ0E5SUhKbGNYVnBjbVVvSnk0dlgyTnNiMjVsVTNsdFltOXNKeWtzWEc0Z0lDQWdZMnh2Ym1WVWVYQmxaRUZ5Y21GNUlEMGdjbVZ4ZFdseVpTZ25MaTlmWTJ4dmJtVlVlWEJsWkVGeWNtRjVKeWs3WEc1Y2JpOHFLaUJnVDJKcVpXTjBJM1J2VTNSeWFXNW5ZQ0J5WlhOMWJIUWdjbVZtWlhKbGJtTmxjeTRnS2k5Y2JuWmhjaUJpYjI5c1ZHRm5JRDBnSjF0dlltcGxZM1FnUW05dmJHVmhibDBuTEZ4dUlDQWdJR1JoZEdWVVlXY2dQU0FuVzI5aWFtVmpkQ0JFWVhSbFhTY3NYRzRnSUNBZ2JXRndWR0ZuSUQwZ0oxdHZZbXBsWTNRZ1RXRndYU2NzWEc0Z0lDQWdiblZ0WW1WeVZHRm5JRDBnSjF0dlltcGxZM1FnVG5WdFltVnlYU2NzWEc0Z0lDQWdjbVZuWlhod1ZHRm5JRDBnSjF0dlltcGxZM1FnVW1WblJYaHdYU2NzWEc0Z0lDQWdjMlYwVkdGbklEMGdKMXR2WW1wbFkzUWdVMlYwWFNjc1hHNGdJQ0FnYzNSeWFXNW5WR0ZuSUQwZ0oxdHZZbXBsWTNRZ1UzUnlhVzVuWFNjc1hHNGdJQ0FnYzNsdFltOXNWR0ZuSUQwZ0oxdHZZbXBsWTNRZ1UzbHRZbTlzWFNjN1hHNWNiblpoY2lCaGNuSmhlVUoxWm1abGNsUmhaeUE5SUNkYmIySnFaV04wSUVGeWNtRjVRblZtWm1WeVhTY3NYRzRnSUNBZ1pHRjBZVlpwWlhkVVlXY2dQU0FuVzI5aWFtVmpkQ0JFWVhSaFZtbGxkMTBuTEZ4dUlDQWdJR1pzYjJGME16SlVZV2NnUFNBblcyOWlhbVZqZENCR2JHOWhkRE15UVhKeVlYbGRKeXhjYmlBZ0lDQm1iRzloZERZMFZHRm5JRDBnSjF0dlltcGxZM1FnUm14dllYUTJORUZ5Y21GNVhTY3NYRzRnSUNBZ2FXNTBPRlJoWnlBOUlDZGJiMkpxWldOMElFbHVkRGhCY25KaGVWMG5MRnh1SUNBZ0lHbHVkREUyVkdGbklEMGdKMXR2WW1wbFkzUWdTVzUwTVRaQmNuSmhlVjBuTEZ4dUlDQWdJR2x1ZERNeVZHRm5JRDBnSjF0dlltcGxZM1FnU1c1ME16SkJjbkpoZVYwbkxGeHVJQ0FnSUhWcGJuUTRWR0ZuSUQwZ0oxdHZZbXBsWTNRZ1ZXbHVkRGhCY25KaGVWMG5MRnh1SUNBZ0lIVnBiblE0UTJ4aGJYQmxaRlJoWnlBOUlDZGJiMkpxWldOMElGVnBiblE0UTJ4aGJYQmxaRUZ5Y21GNVhTY3NYRzRnSUNBZ2RXbHVkREUyVkdGbklEMGdKMXR2WW1wbFkzUWdWV2x1ZERFMlFYSnlZWGxkSnl4Y2JpQWdJQ0IxYVc1ME16SlVZV2NnUFNBblcyOWlhbVZqZENCVmFXNTBNekpCY25KaGVWMG5PMXh1WEc0dktpcGNiaUFxSUVsdWFYUnBZV3hwZW1WeklHRnVJRzlpYW1WamRDQmpiRzl1WlNCaVlYTmxaQ0J2YmlCcGRITWdZSFJ2VTNSeWFXNW5WR0ZuWUM1Y2JpQXFYRzRnS2lBcUtrNXZkR1U2S2lvZ1ZHaHBjeUJtZFc1amRHbHZiaUJ2Ym14NUlITjFjSEJ2Y25SeklHTnNiMjVwYm1jZ2RtRnNkV1Z6SUhkcGRHZ2dkR0ZuY3lCdlpseHVJQ29nWUVKdmIyeGxZVzVnTENCZ1JHRjBaV0FzSUdCRmNuSnZjbUFzSUdCT2RXMWlaWEpnTENCZ1VtVm5SWGh3WUN3Z2IzSWdZRk4wY21sdVoyQXVYRzRnS2x4dUlDb2dRSEJ5YVhaaGRHVmNiaUFxSUVCd1lYSmhiU0I3VDJKcVpXTjBmU0J2WW1wbFkzUWdWR2hsSUc5aWFtVmpkQ0IwYnlCamJHOXVaUzVjYmlBcUlFQndZWEpoYlNCN2MzUnlhVzVuZlNCMFlXY2dWR2hsSUdCMGIxTjBjbWx1WjFSaFoyQWdiMllnZEdobElHOWlhbVZqZENCMGJ5QmpiRzl1WlM1Y2JpQXFJRUJ3WVhKaGJTQjdSblZ1WTNScGIyNTlJR05zYjI1bFJuVnVZeUJVYUdVZ1puVnVZM1JwYjI0Z2RHOGdZMnh2Ym1VZ2RtRnNkV1Z6TGx4dUlDb2dRSEJoY21GdElIdGliMjlzWldGdWZTQmJhWE5FWldWd1hTQlRjR1ZqYVdaNUlHRWdaR1ZsY0NCamJHOXVaUzVjYmlBcUlFQnlaWFIxY201eklIdFBZbXBsWTNSOUlGSmxkSFZ5Ym5NZ2RHaGxJR2x1YVhScFlXeHBlbVZrSUdOc2IyNWxMbHh1SUNvdlhHNW1kVzVqZEdsdmJpQnBibWwwUTJ4dmJtVkNlVlJoWnlodlltcGxZM1FzSUhSaFp5d2dZMnh2Ym1WR2RXNWpMQ0JwYzBSbFpYQXBJSHRjYmlBZ2RtRnlJRU4wYjNJZ1BTQnZZbXBsWTNRdVkyOXVjM1J5ZFdOMGIzSTdYRzRnSUhOM2FYUmphQ0FvZEdGbktTQjdYRzRnSUNBZ1kyRnpaU0JoY25KaGVVSjFabVpsY2xSaFp6cGNiaUFnSUNBZ0lISmxkSFZ5YmlCamJHOXVaVUZ5Y21GNVFuVm1abVZ5S0c5aWFtVmpkQ2s3WEc1Y2JpQWdJQ0JqWVhObElHSnZiMnhVWVdjNlhHNGdJQ0FnWTJGelpTQmtZWFJsVkdGbk9seHVJQ0FnSUNBZ2NtVjBkWEp1SUc1bGR5QkRkRzl5S0N0dlltcGxZM1FwTzF4dVhHNGdJQ0FnWTJGelpTQmtZWFJoVm1sbGQxUmhaenBjYmlBZ0lDQWdJSEpsZEhWeWJpQmpiRzl1WlVSaGRHRldhV1YzS0c5aWFtVmpkQ3dnYVhORVpXVndLVHRjYmx4dUlDQWdJR05oYzJVZ1pteHZZWFF6TWxSaFp6b2dZMkZ6WlNCbWJHOWhkRFkwVkdGbk9seHVJQ0FnSUdOaGMyVWdhVzUwT0ZSaFp6b2dZMkZ6WlNCcGJuUXhObFJoWnpvZ1kyRnpaU0JwYm5Rek1sUmhaenBjYmlBZ0lDQmpZWE5sSUhWcGJuUTRWR0ZuT2lCallYTmxJSFZwYm5RNFEyeGhiWEJsWkZSaFp6b2dZMkZ6WlNCMWFXNTBNVFpVWVdjNklHTmhjMlVnZFdsdWRETXlWR0ZuT2x4dUlDQWdJQ0FnY21WMGRYSnVJR05zYjI1bFZIbHdaV1JCY25KaGVTaHZZbXBsWTNRc0lHbHpSR1ZsY0NrN1hHNWNiaUFnSUNCallYTmxJRzFoY0ZSaFp6cGNiaUFnSUNBZ0lISmxkSFZ5YmlCamJHOXVaVTFoY0NodlltcGxZM1FzSUdselJHVmxjQ3dnWTJ4dmJtVkdkVzVqS1R0Y2JseHVJQ0FnSUdOaGMyVWdiblZ0WW1WeVZHRm5PbHh1SUNBZ0lHTmhjMlVnYzNSeWFXNW5WR0ZuT2x4dUlDQWdJQ0FnY21WMGRYSnVJRzVsZHlCRGRHOXlLRzlpYW1WamRDazdYRzVjYmlBZ0lDQmpZWE5sSUhKbFoyVjRjRlJoWnpwY2JpQWdJQ0FnSUhKbGRIVnliaUJqYkc5dVpWSmxaMFY0Y0NodlltcGxZM1FwTzF4dVhHNGdJQ0FnWTJGelpTQnpaWFJVWVdjNlhHNGdJQ0FnSUNCeVpYUjFjbTRnWTJ4dmJtVlRaWFFvYjJKcVpXTjBMQ0JwYzBSbFpYQXNJR05zYjI1bFJuVnVZeWs3WEc1Y2JpQWdJQ0JqWVhObElITjViV0p2YkZSaFp6cGNiaUFnSUNBZ0lISmxkSFZ5YmlCamJHOXVaVk41YldKdmJDaHZZbXBsWTNRcE8xeHVJQ0I5WEc1OVhHNWNibTF2WkhWc1pTNWxlSEJ2Y25SeklEMGdhVzVwZEVOc2IyNWxRbmxVWVdjN1hHNGlMQ0oyWVhJZ2FYTlBZbXBsWTNRZ1BTQnlaWEYxYVhKbEtDY3VMMmx6VDJKcVpXTjBKeWs3WEc1Y2JpOHFLaUJDZFdsc2RDMXBiaUIyWVd4MVpTQnlaV1psY21WdVkyVnpMaUFxTDF4dWRtRnlJRzlpYW1WamRFTnlaV0YwWlNBOUlFOWlhbVZqZEM1amNtVmhkR1U3WEc1Y2JpOHFLbHh1SUNvZ1ZHaGxJR0poYzJVZ2FXMXdiR1Z0Wlc1MFlYUnBiMjRnYjJZZ1lGOHVZM0psWVhSbFlDQjNhWFJvYjNWMElITjFjSEJ2Y25RZ1ptOXlJR0Z6YzJsbmJtbHVaMXh1SUNvZ2NISnZjR1Z5ZEdsbGN5QjBieUIwYUdVZ1kzSmxZWFJsWkNCdlltcGxZM1F1WEc0Z0tseHVJQ29nUUhCeWFYWmhkR1ZjYmlBcUlFQndZWEpoYlNCN1QySnFaV04wZlNCd2NtOTBieUJVYUdVZ2IySnFaV04wSUhSdklHbHVhR1Z5YVhRZ1puSnZiUzVjYmlBcUlFQnlaWFIxY201eklIdFBZbXBsWTNSOUlGSmxkSFZ5Ym5NZ2RHaGxJRzVsZHlCdlltcGxZM1F1WEc0Z0tpOWNiblpoY2lCaVlYTmxRM0psWVhSbElEMGdLR1oxYm1OMGFXOXVLQ2tnZTF4dUlDQm1kVzVqZEdsdmJpQnZZbXBsWTNRb0tTQjdmVnh1SUNCeVpYUjFjbTRnWm5WdVkzUnBiMjRvY0hKdmRHOHBJSHRjYmlBZ0lDQnBaaUFvSVdselQySnFaV04wS0hCeWIzUnZLU2tnZTF4dUlDQWdJQ0FnY21WMGRYSnVJSHQ5TzF4dUlDQWdJSDFjYmlBZ0lDQnBaaUFvYjJKcVpXTjBRM0psWVhSbEtTQjdYRzRnSUNBZ0lDQnlaWFIxY200Z2IySnFaV04wUTNKbFlYUmxLSEJ5YjNSdktUdGNiaUFnSUNCOVhHNGdJQ0FnYjJKcVpXTjBMbkJ5YjNSdmRIbHdaU0E5SUhCeWIzUnZPMXh1SUNBZ0lIWmhjaUJ5WlhOMWJIUWdQU0J1WlhjZ2IySnFaV04wTzF4dUlDQWdJRzlpYW1WamRDNXdjbTkwYjNSNWNHVWdQU0IxYm1SbFptbHVaV1E3WEc0Z0lDQWdjbVYwZFhKdUlISmxjM1ZzZER0Y2JpQWdmVHRjYm4wb0tTazdYRzVjYm0xdlpIVnNaUzVsZUhCdmNuUnpJRDBnWW1GelpVTnlaV0YwWlR0Y2JpSXNJblpoY2lCaVlYTmxRM0psWVhSbElEMGdjbVZ4ZFdseVpTZ25MaTlmWW1GelpVTnlaV0YwWlNjcExGeHVJQ0FnSUdkbGRGQnliM1J2ZEhsd1pTQTlJSEpsY1hWcGNtVW9KeTR2WDJkbGRGQnliM1J2ZEhsd1pTY3BMRnh1SUNBZ0lHbHpVSEp2ZEc5MGVYQmxJRDBnY21WeGRXbHlaU2duTGk5ZmFYTlFjbTkwYjNSNWNHVW5LVHRjYmx4dUx5b3FYRzRnS2lCSmJtbDBhV0ZzYVhwbGN5QmhiaUJ2WW1wbFkzUWdZMnh2Ym1VdVhHNGdLbHh1SUNvZ1FIQnlhWFpoZEdWY2JpQXFJRUJ3WVhKaGJTQjdUMkpxWldOMGZTQnZZbXBsWTNRZ1ZHaGxJRzlpYW1WamRDQjBieUJqYkc5dVpTNWNiaUFxSUVCeVpYUjFjbTV6SUh0UFltcGxZM1I5SUZKbGRIVnlibk1nZEdobElHbHVhWFJwWVd4cGVtVmtJR05zYjI1bExseHVJQ292WEc1bWRXNWpkR2x2YmlCcGJtbDBRMnh2Ym1WUFltcGxZM1FvYjJKcVpXTjBLU0I3WEc0Z0lISmxkSFZ5YmlBb2RIbHdaVzltSUc5aWFtVmpkQzVqYjI1emRISjFZM1J2Y2lBOVBTQW5ablZ1WTNScGIyNG5JQ1ltSUNGcGMxQnliM1J2ZEhsd1pTaHZZbXBsWTNRcEtWeHVJQ0FnSUQ4Z1ltRnpaVU55WldGMFpTaG5aWFJRY205MGIzUjVjR1VvYjJKcVpXTjBLU2xjYmlBZ0lDQTZJSHQ5TzF4dWZWeHVYRzV0YjJSMWJHVXVaWGh3YjNKMGN5QTlJR2x1YVhSRGJHOXVaVTlpYW1WamREdGNiaUlzSW5aaGNpQlRkR0ZqYXlBOUlISmxjWFZwY21Vb0p5NHZYMU4wWVdOckp5a3NYRzRnSUNBZ1lYSnlZWGxGWVdOb0lEMGdjbVZ4ZFdseVpTZ25MaTlmWVhKeVlYbEZZV05vSnlrc1hHNGdJQ0FnWVhOemFXZHVWbUZzZFdVZ1BTQnlaWEYxYVhKbEtDY3VMMTloYzNOcFoyNVdZV3gxWlNjcExGeHVJQ0FnSUdKaGMyVkJjM05wWjI0Z1BTQnlaWEYxYVhKbEtDY3VMMTlpWVhObFFYTnphV2R1Snlrc1hHNGdJQ0FnWW1GelpVRnpjMmxuYmtsdUlEMGdjbVZ4ZFdseVpTZ25MaTlmWW1GelpVRnpjMmxuYmtsdUp5a3NYRzRnSUNBZ1kyeHZibVZDZFdabVpYSWdQU0J5WlhGMWFYSmxLQ2N1TDE5amJHOXVaVUoxWm1abGNpY3BMRnh1SUNBZ0lHTnZjSGxCY25KaGVTQTlJSEpsY1hWcGNtVW9KeTR2WDJOdmNIbEJjbkpoZVNjcExGeHVJQ0FnSUdOdmNIbFRlVzFpYjJ4eklEMGdjbVZ4ZFdseVpTZ25MaTlmWTI5d2VWTjViV0p2YkhNbktTeGNiaUFnSUNCamIzQjVVM2x0WW05c2MwbHVJRDBnY21WeGRXbHlaU2duTGk5ZlkyOXdlVk41YldKdmJITkpiaWNwTEZ4dUlDQWdJR2RsZEVGc2JFdGxlWE1nUFNCeVpYRjFhWEpsS0NjdUwxOW5aWFJCYkd4TFpYbHpKeWtzWEc0Z0lDQWdaMlYwUVd4c1MyVjVjMGx1SUQwZ2NtVnhkV2x5WlNnbkxpOWZaMlYwUVd4c1MyVjVjMGx1Snlrc1hHNGdJQ0FnWjJWMFZHRm5JRDBnY21WeGRXbHlaU2duTGk5ZloyVjBWR0ZuSnlrc1hHNGdJQ0FnYVc1cGRFTnNiMjVsUVhKeVlYa2dQU0J5WlhGMWFYSmxLQ2N1TDE5cGJtbDBRMnh2Ym1WQmNuSmhlU2NwTEZ4dUlDQWdJR2x1YVhSRGJHOXVaVUo1VkdGbklEMGdjbVZ4ZFdseVpTZ25MaTlmYVc1cGRFTnNiMjVsUW5sVVlXY25LU3hjYmlBZ0lDQnBibWwwUTJ4dmJtVlBZbXBsWTNRZ1BTQnlaWEYxYVhKbEtDY3VMMTlwYm1sMFEyeHZibVZQWW1wbFkzUW5LU3hjYmlBZ0lDQnBjMEZ5Y21GNUlEMGdjbVZ4ZFdseVpTZ25MaTlwYzBGeWNtRjVKeWtzWEc0Z0lDQWdhWE5DZFdabVpYSWdQU0J5WlhGMWFYSmxLQ2N1TDJselFuVm1abVZ5Snlrc1hHNGdJQ0FnYVhOUFltcGxZM1FnUFNCeVpYRjFhWEpsS0NjdUwybHpUMkpxWldOMEp5a3NYRzRnSUNBZ2EyVjVjeUE5SUhKbGNYVnBjbVVvSnk0dmEyVjVjeWNwTzF4dVhHNHZLaW9nVlhObFpDQjBieUJqYjIxd2IzTmxJR0pwZEcxaGMydHpJR1p2Y2lCamJHOXVhVzVuTGlBcUwxeHVkbUZ5SUVOTVQwNUZYMFJGUlZCZlJreEJSeUE5SURFc1hHNGdJQ0FnUTB4UFRrVmZSa3hCVkY5R1RFRkhJRDBnTWl4Y2JpQWdJQ0JEVEU5T1JWOVRXVTFDVDB4VFgwWk1RVWNnUFNBME8xeHVYRzR2S2lvZ1lFOWlhbVZqZENOMGIxTjBjbWx1WjJBZ2NtVnpkV3gwSUhKbFptVnlaVzVqWlhNdUlDb3ZYRzUyWVhJZ1lYSm5jMVJoWnlBOUlDZGJiMkpxWldOMElFRnlaM1Z0Wlc1MGMxMG5MRnh1SUNBZ0lHRnljbUY1VkdGbklEMGdKMXR2WW1wbFkzUWdRWEp5WVhsZEp5eGNiaUFnSUNCaWIyOXNWR0ZuSUQwZ0oxdHZZbXBsWTNRZ1FtOXZiR1ZoYmwwbkxGeHVJQ0FnSUdSaGRHVlVZV2NnUFNBblcyOWlhbVZqZENCRVlYUmxYU2NzWEc0Z0lDQWdaWEp5YjNKVVlXY2dQU0FuVzI5aWFtVmpkQ0JGY25KdmNsMG5MRnh1SUNBZ0lHWjFibU5VWVdjZ1BTQW5XMjlpYW1WamRDQkdkVzVqZEdsdmJsMG5MRnh1SUNBZ0lHZGxibFJoWnlBOUlDZGJiMkpxWldOMElFZGxibVZ5WVhSdmNrWjFibU4wYVc5dVhTY3NYRzRnSUNBZ2JXRndWR0ZuSUQwZ0oxdHZZbXBsWTNRZ1RXRndYU2NzWEc0Z0lDQWdiblZ0WW1WeVZHRm5JRDBnSjF0dlltcGxZM1FnVG5WdFltVnlYU2NzWEc0Z0lDQWdiMkpxWldOMFZHRm5JRDBnSjF0dlltcGxZM1FnVDJKcVpXTjBYU2NzWEc0Z0lDQWdjbVZuWlhod1ZHRm5JRDBnSjF0dlltcGxZM1FnVW1WblJYaHdYU2NzWEc0Z0lDQWdjMlYwVkdGbklEMGdKMXR2WW1wbFkzUWdVMlYwWFNjc1hHNGdJQ0FnYzNSeWFXNW5WR0ZuSUQwZ0oxdHZZbXBsWTNRZ1UzUnlhVzVuWFNjc1hHNGdJQ0FnYzNsdFltOXNWR0ZuSUQwZ0oxdHZZbXBsWTNRZ1UzbHRZbTlzWFNjc1hHNGdJQ0FnZDJWaGEwMWhjRlJoWnlBOUlDZGJiMkpxWldOMElGZGxZV3ROWVhCZEp6dGNibHh1ZG1GeUlHRnljbUY1UW5WbVptVnlWR0ZuSUQwZ0oxdHZZbXBsWTNRZ1FYSnlZWGxDZFdabVpYSmRKeXhjYmlBZ0lDQmtZWFJoVm1sbGQxUmhaeUE5SUNkYmIySnFaV04wSUVSaGRHRldhV1YzWFNjc1hHNGdJQ0FnWm14dllYUXpNbFJoWnlBOUlDZGJiMkpxWldOMElFWnNiMkYwTXpKQmNuSmhlVjBuTEZ4dUlDQWdJR1pzYjJGME5qUlVZV2NnUFNBblcyOWlhbVZqZENCR2JHOWhkRFkwUVhKeVlYbGRKeXhjYmlBZ0lDQnBiblE0VkdGbklEMGdKMXR2WW1wbFkzUWdTVzUwT0VGeWNtRjVYU2NzWEc0Z0lDQWdhVzUwTVRaVVlXY2dQU0FuVzI5aWFtVmpkQ0JKYm5ReE5rRnljbUY1WFNjc1hHNGdJQ0FnYVc1ME16SlVZV2NnUFNBblcyOWlhbVZqZENCSmJuUXpNa0Z5Y21GNVhTY3NYRzRnSUNBZ2RXbHVkRGhVWVdjZ1BTQW5XMjlpYW1WamRDQlZhVzUwT0VGeWNtRjVYU2NzWEc0Z0lDQWdkV2x1ZERoRGJHRnRjR1ZrVkdGbklEMGdKMXR2WW1wbFkzUWdWV2x1ZERoRGJHRnRjR1ZrUVhKeVlYbGRKeXhjYmlBZ0lDQjFhVzUwTVRaVVlXY2dQU0FuVzI5aWFtVmpkQ0JWYVc1ME1UWkJjbkpoZVYwbkxGeHVJQ0FnSUhWcGJuUXpNbFJoWnlBOUlDZGJiMkpxWldOMElGVnBiblF6TWtGeWNtRjVYU2M3WEc1Y2JpOHFLaUJWYzJWa0lIUnZJR2xrWlc1MGFXWjVJR0IwYjFOMGNtbHVaMVJoWjJBZ2RtRnNkV1Z6SUhOMWNIQnZjblJsWkNCaWVTQmdYeTVqYkc5dVpXQXVJQ292WEc1MllYSWdZMnh2Ym1WaFlteGxWR0ZuY3lBOUlIdDlPMXh1WTJ4dmJtVmhZbXhsVkdGbmMxdGhjbWR6VkdGblhTQTlJR05zYjI1bFlXSnNaVlJoWjNOYllYSnlZWGxVWVdkZElEMWNibU5zYjI1bFlXSnNaVlJoWjNOYllYSnlZWGxDZFdabVpYSlVZV2RkSUQwZ1kyeHZibVZoWW14bFZHRm5jMXRrWVhSaFZtbGxkMVJoWjEwZ1BWeHVZMnh2Ym1WaFlteGxWR0ZuYzF0aWIyOXNWR0ZuWFNBOUlHTnNiMjVsWVdKc1pWUmhaM05iWkdGMFpWUmhaMTBnUFZ4dVkyeHZibVZoWW14bFZHRm5jMXRtYkc5aGRETXlWR0ZuWFNBOUlHTnNiMjVsWVdKc1pWUmhaM05iWm14dllYUTJORlJoWjEwZ1BWeHVZMnh2Ym1WaFlteGxWR0ZuYzF0cGJuUTRWR0ZuWFNBOUlHTnNiMjVsWVdKc1pWUmhaM05iYVc1ME1UWlVZV2RkSUQxY2JtTnNiMjVsWVdKc1pWUmhaM05iYVc1ME16SlVZV2RkSUQwZ1kyeHZibVZoWW14bFZHRm5jMXR0WVhCVVlXZGRJRDFjYm1Oc2IyNWxZV0pzWlZSaFozTmJiblZ0WW1WeVZHRm5YU0E5SUdOc2IyNWxZV0pzWlZSaFozTmJiMkpxWldOMFZHRm5YU0E5WEc1amJHOXVaV0ZpYkdWVVlXZHpXM0psWjJWNGNGUmhaMTBnUFNCamJHOXVaV0ZpYkdWVVlXZHpXM05sZEZSaFoxMGdQVnh1WTJ4dmJtVmhZbXhsVkdGbmMxdHpkSEpwYm1kVVlXZGRJRDBnWTJ4dmJtVmhZbXhsVkdGbmMxdHplVzFpYjJ4VVlXZGRJRDFjYm1Oc2IyNWxZV0pzWlZSaFozTmJkV2x1ZERoVVlXZGRJRDBnWTJ4dmJtVmhZbXhsVkdGbmMxdDFhVzUwT0VOc1lXMXdaV1JVWVdkZElEMWNibU5zYjI1bFlXSnNaVlJoWjNOYmRXbHVkREUyVkdGblhTQTlJR05zYjI1bFlXSnNaVlJoWjNOYmRXbHVkRE15VkdGblhTQTlJSFJ5ZFdVN1hHNWpiRzl1WldGaWJHVlVZV2R6VzJWeWNtOXlWR0ZuWFNBOUlHTnNiMjVsWVdKc1pWUmhaM05iWm5WdVkxUmhaMTBnUFZ4dVkyeHZibVZoWW14bFZHRm5jMXQzWldGclRXRndWR0ZuWFNBOUlHWmhiSE5sTzF4dVhHNHZLaXBjYmlBcUlGUm9aU0JpWVhObElHbHRjR3hsYldWdWRHRjBhVzl1SUc5bUlHQmZMbU5zYjI1bFlDQmhibVFnWUY4dVkyeHZibVZFWldWd1lDQjNhR2xqYUNCMGNtRmphM05jYmlBcUlIUnlZWFpsY25ObFpDQnZZbXBsWTNSekxseHVJQ3BjYmlBcUlFQndjbWwyWVhSbFhHNGdLaUJBY0dGeVlXMGdleXA5SUhaaGJIVmxJRlJvWlNCMllXeDFaU0IwYnlCamJHOXVaUzVjYmlBcUlFQndZWEpoYlNCN1ltOXZiR1ZoYm4wZ1ltbDBiV0Z6YXlCVWFHVWdZbWwwYldGemF5Qm1iR0ZuY3k1Y2JpQXFJQ0F4SUMwZ1JHVmxjQ0JqYkc5dVpWeHVJQ29nSURJZ0xTQkdiR0YwZEdWdUlHbHVhR1Z5YVhSbFpDQndjbTl3WlhKMGFXVnpYRzRnS2lBZ05DQXRJRU5zYjI1bElITjViV0p2YkhOY2JpQXFJRUJ3WVhKaGJTQjdSblZ1WTNScGIyNTlJRnRqZFhOMGIyMXBlbVZ5WFNCVWFHVWdablZ1WTNScGIyNGdkRzhnWTNWemRHOXRhWHBsSUdOc2IyNXBibWN1WEc0Z0tpQkFjR0Z5WVcwZ2UzTjBjbWx1WjMwZ1cydGxlVjBnVkdobElHdGxlU0J2WmlCZ2RtRnNkV1ZnTGx4dUlDb2dRSEJoY21GdElIdFBZbXBsWTNSOUlGdHZZbXBsWTNSZElGUm9aU0J3WVhKbGJuUWdiMkpxWldOMElHOW1JR0IyWVd4MVpXQXVYRzRnS2lCQWNHRnlZVzBnZTA5aWFtVmpkSDBnVzNOMFlXTnJYU0JVY21GamEzTWdkSEpoZG1WeWMyVmtJRzlpYW1WamRITWdZVzVrSUhSb1pXbHlJR05zYjI1bElHTnZkVzUwWlhKd1lYSjBjeTVjYmlBcUlFQnlaWFIxY201eklIc3FmU0JTWlhSMWNtNXpJSFJvWlNCamJHOXVaV1FnZG1Gc2RXVXVYRzRnS2k5Y2JtWjFibU4wYVc5dUlHSmhjMlZEYkc5dVpTaDJZV3gxWlN3Z1ltbDBiV0Z6YXl3Z1kzVnpkRzl0YVhwbGNpd2dhMlY1TENCdlltcGxZM1FzSUhOMFlXTnJLU0I3WEc0Z0lIWmhjaUJ5WlhOMWJIUXNYRzRnSUNBZ0lDQnBjMFJsWlhBZ1BTQmlhWFJ0WVhOcklDWWdRMHhQVGtWZlJFVkZVRjlHVEVGSExGeHVJQ0FnSUNBZ2FYTkdiR0YwSUQwZ1ltbDBiV0Z6YXlBbUlFTk1UMDVGWDBaTVFWUmZSa3hCUnl4Y2JpQWdJQ0FnSUdselJuVnNiQ0E5SUdKcGRHMWhjMnNnSmlCRFRFOU9SVjlUV1UxQ1QweFRYMFpNUVVjN1hHNWNiaUFnYVdZZ0tHTjFjM1J2YldsNlpYSXBJSHRjYmlBZ0lDQnlaWE4xYkhRZ1BTQnZZbXBsWTNRZ1B5QmpkWE4wYjIxcGVtVnlLSFpoYkhWbExDQnJaWGtzSUc5aWFtVmpkQ3dnYzNSaFkyc3BJRG9nWTNWemRHOXRhWHBsY2loMllXeDFaU2s3WEc0Z0lIMWNiaUFnYVdZZ0tISmxjM1ZzZENBaFBUMGdkVzVrWldacGJtVmtLU0I3WEc0Z0lDQWdjbVYwZFhKdUlISmxjM1ZzZER0Y2JpQWdmVnh1SUNCcFppQW9JV2x6VDJKcVpXTjBLSFpoYkhWbEtTa2dlMXh1SUNBZ0lISmxkSFZ5YmlCMllXeDFaVHRjYmlBZ2ZWeHVJQ0IyWVhJZ2FYTkJjbklnUFNCcGMwRnljbUY1S0haaGJIVmxLVHRjYmlBZ2FXWWdLR2x6UVhKeUtTQjdYRzRnSUNBZ2NtVnpkV3gwSUQwZ2FXNXBkRU5zYjI1bFFYSnlZWGtvZG1Gc2RXVXBPMXh1SUNBZ0lHbG1JQ2doYVhORVpXVndLU0I3WEc0Z0lDQWdJQ0J5WlhSMWNtNGdZMjl3ZVVGeWNtRjVLSFpoYkhWbExDQnlaWE4xYkhRcE8xeHVJQ0FnSUgxY2JpQWdmU0JsYkhObElIdGNiaUFnSUNCMllYSWdkR0ZuSUQwZ1oyVjBWR0ZuS0haaGJIVmxLU3hjYmlBZ0lDQWdJQ0FnYVhOR2RXNWpJRDBnZEdGbklEMDlJR1oxYm1OVVlXY2dmSHdnZEdGbklEMDlJR2RsYmxSaFp6dGNibHh1SUNBZ0lHbG1JQ2hwYzBKMVptWmxjaWgyWVd4MVpTa3BJSHRjYmlBZ0lDQWdJSEpsZEhWeWJpQmpiRzl1WlVKMVptWmxjaWgyWVd4MVpTd2dhWE5FWldWd0tUdGNiaUFnSUNCOVhHNGdJQ0FnYVdZZ0tIUmhaeUE5UFNCdlltcGxZM1JVWVdjZ2ZId2dkR0ZuSUQwOUlHRnlaM05VWVdjZ2ZId2dLR2x6Um5WdVl5QW1KaUFoYjJKcVpXTjBLU2tnZTF4dUlDQWdJQ0FnY21WemRXeDBJRDBnS0dselJteGhkQ0I4ZkNCcGMwWjFibU1wSUQ4Z2UzMGdPaUJwYm1sMFEyeHZibVZQWW1wbFkzUW9kbUZzZFdVcE8xeHVJQ0FnSUNBZ2FXWWdLQ0ZwYzBSbFpYQXBJSHRjYmlBZ0lDQWdJQ0FnY21WMGRYSnVJR2x6Um14aGRGeHVJQ0FnSUNBZ0lDQWdJRDhnWTI5d2VWTjViV0p2YkhOSmJpaDJZV3gxWlN3Z1ltRnpaVUZ6YzJsbmJrbHVLSEpsYzNWc2RDd2dkbUZzZFdVcEtWeHVJQ0FnSUNBZ0lDQWdJRG9nWTI5d2VWTjViV0p2YkhNb2RtRnNkV1VzSUdKaGMyVkJjM05wWjI0b2NtVnpkV3gwTENCMllXeDFaU2twTzF4dUlDQWdJQ0FnZlZ4dUlDQWdJSDBnWld4elpTQjdYRzRnSUNBZ0lDQnBaaUFvSVdOc2IyNWxZV0pzWlZSaFozTmJkR0ZuWFNrZ2UxeHVJQ0FnSUNBZ0lDQnlaWFIxY200Z2IySnFaV04wSUQ4Z2RtRnNkV1VnT2lCN2ZUdGNiaUFnSUNBZ0lIMWNiaUFnSUNBZ0lISmxjM1ZzZENBOUlHbHVhWFJEYkc5dVpVSjVWR0ZuS0haaGJIVmxMQ0IwWVdjc0lHSmhjMlZEYkc5dVpTd2dhWE5FWldWd0tUdGNiaUFnSUNCOVhHNGdJSDFjYmlBZ0x5OGdRMmhsWTJzZ1ptOXlJR05wY21OMWJHRnlJSEpsWm1WeVpXNWpaWE1nWVc1a0lISmxkSFZ5YmlCcGRITWdZMjl5Y21WemNHOXVaR2x1WnlCamJHOXVaUzVjYmlBZ2MzUmhZMnNnZkh3Z0tITjBZV05ySUQwZ2JtVjNJRk4wWVdOcktUdGNiaUFnZG1GeUlITjBZV05yWldRZ1BTQnpkR0ZqYXk1blpYUW9kbUZzZFdVcE8xeHVJQ0JwWmlBb2MzUmhZMnRsWkNrZ2UxeHVJQ0FnSUhKbGRIVnliaUJ6ZEdGamEyVmtPMXh1SUNCOVhHNGdJSE4wWVdOckxuTmxkQ2gyWVd4MVpTd2djbVZ6ZFd4MEtUdGNibHh1SUNCMllYSWdhMlY1YzBaMWJtTWdQU0JwYzBaMWJHeGNiaUFnSUNBL0lDaHBjMFpzWVhRZ1B5Qm5aWFJCYkd4TFpYbHpTVzRnT2lCblpYUkJiR3hMWlhsektWeHVJQ0FnSURvZ0tHbHpSbXhoZENBL0lHdGxlWE5KYmlBNklHdGxlWE1wTzF4dVhHNGdJSFpoY2lCd2NtOXdjeUE5SUdselFYSnlJRDhnZFc1a1pXWnBibVZrSURvZ2EyVjVjMFoxYm1Nb2RtRnNkV1VwTzF4dUlDQmhjbkpoZVVWaFkyZ29jSEp2Y0hNZ2ZId2dkbUZzZFdVc0lHWjFibU4wYVc5dUtITjFZbFpoYkhWbExDQnJaWGtwSUh0Y2JpQWdJQ0JwWmlBb2NISnZjSE1wSUh0Y2JpQWdJQ0FnSUd0bGVTQTlJSE4xWWxaaGJIVmxPMXh1SUNBZ0lDQWdjM1ZpVm1Gc2RXVWdQU0IyWVd4MVpWdHJaWGxkTzF4dUlDQWdJSDFjYmlBZ0lDQXZMeUJTWldOMWNuTnBkbVZzZVNCd2IzQjFiR0YwWlNCamJHOXVaU0FvYzNWelkyVndkR2xpYkdVZ2RHOGdZMkZzYkNCemRHRmpheUJzYVcxcGRITXBMbHh1SUNBZ0lHRnpjMmxuYmxaaGJIVmxLSEpsYzNWc2RDd2dhMlY1TENCaVlYTmxRMnh2Ym1Vb2MzVmlWbUZzZFdVc0lHSnBkRzFoYzJzc0lHTjFjM1J2YldsNlpYSXNJR3RsZVN3Z2RtRnNkV1VzSUhOMFlXTnJLU2s3WEc0Z0lIMHBPMXh1SUNCeVpYUjFjbTRnY21WemRXeDBPMXh1ZlZ4dVhHNXRiMlIxYkdVdVpYaHdiM0owY3lBOUlHSmhjMlZEYkc5dVpUdGNiaUlzSW5aaGNpQmlZWE5sUTJ4dmJtVWdQU0J5WlhGMWFYSmxLQ2N1TDE5aVlYTmxRMnh2Ym1VbktUdGNibHh1THlvcUlGVnpaV1FnZEc4Z1kyOXRjRzl6WlNCaWFYUnRZWE5yY3lCbWIzSWdZMnh2Ym1sdVp5NGdLaTljYm5aaGNpQkRURTlPUlY5RVJVVlFYMFpNUVVjZ1BTQXhMRnh1SUNBZ0lFTk1UMDVGWDFOWlRVSlBURk5mUmt4QlJ5QTlJRFE3WEc1Y2JpOHFLbHh1SUNvZ1ZHaHBjeUJ0WlhSb2IyUWdhWE1nYkdsclpTQmdYeTVqYkc5dVpXQWdaWGhqWlhCMElIUm9ZWFFnYVhRZ2NtVmpkWEp6YVhabGJIa2dZMnh2Ym1WeklHQjJZV3gxWldBdVhHNGdLbHh1SUNvZ1FITjBZWFJwWTF4dUlDb2dRRzFsYldKbGNrOW1JRjljYmlBcUlFQnphVzVqWlNBeExqQXVNRnh1SUNvZ1FHTmhkR1ZuYjNKNUlFeGhibWRjYmlBcUlFQndZWEpoYlNCN0tuMGdkbUZzZFdVZ1ZHaGxJSFpoYkhWbElIUnZJSEpsWTNWeWMybDJaV3g1SUdOc2IyNWxMbHh1SUNvZ1FISmxkSFZ5Ym5NZ2V5cDlJRkpsZEhWeWJuTWdkR2hsSUdSbFpYQWdZMnh2Ym1Wa0lIWmhiSFZsTGx4dUlDb2dRSE5sWlNCZkxtTnNiMjVsWEc0Z0tpQkFaWGhoYlhCc1pWeHVJQ3BjYmlBcUlIWmhjaUJ2WW1wbFkzUnpJRDBnVzNzZ0oyRW5PaUF4SUgwc0lIc2dKMkluT2lBeUlIMWRPMXh1SUNwY2JpQXFJSFpoY2lCa1pXVndJRDBnWHk1amJHOXVaVVJsWlhBb2IySnFaV04wY3lrN1hHNGdLaUJqYjI1emIyeGxMbXh2Wnloa1pXVndXekJkSUQwOVBTQnZZbXBsWTNSeld6QmRLVHRjYmlBcUlDOHZJRDArSUdaaGJITmxYRzRnS2k5Y2JtWjFibU4wYVc5dUlHTnNiMjVsUkdWbGNDaDJZV3gxWlNrZ2UxeHVJQ0J5WlhSMWNtNGdZbUZ6WlVOc2IyNWxLSFpoYkhWbExDQkRURTlPUlY5RVJVVlFYMFpNUVVjZ2ZDQkRURTlPUlY5VFdVMUNUMHhUWDBaTVFVY3BPMXh1ZlZ4dVhHNXRiMlIxYkdVdVpYaHdiM0owY3lBOUlHTnNiMjVsUkdWbGNEdGNiaUlzSW1WNGNHOXlkQ0JrWldaaGRXeDBJR1oxYm1OMGFXOXVJR1Z5Y205eVNHRnVaR3hsY2lBb1pYSnliM0pQY2xOMGNtbHVaeXdnZG0wcElIdGNiaUFnWTI5dWMzUWdaWEp5YjNJZ1BTQW9kSGx3Wlc5bUlHVnljbTl5VDNKVGRISnBibWNnUFQwOUlDZHZZbXBsWTNRbktWeHVJQ0FnSUQ4Z1pYSnliM0pQY2xOMGNtbHVaMXh1SUNBZ0lEb2dibVYzSUVWeWNtOXlLR1Z5Y205eVQzSlRkSEpwYm1jcFhHNWNiaUFnZG0wdVgyVnljbTl5SUQwZ1pYSnliM0pjYmx4dUlDQjBhSEp2ZHlCbGNuSnZjbHh1ZlZ4dUlpd2lMeThnUUdac2IzZGNibHh1YVcxd2IzSjBJRloxWlNCbWNtOXRJQ2QyZFdVblhHNXBiWEJ2Y25RZ1kyeHZibVZFWldWd0lHWnliMjBnSjJ4dlpHRnphQzlqYkc5dVpVUmxaWEFuWEc1cGJYQnZjblFnWlhKeWIzSklZVzVrYkdWeUlHWnliMjBnSnk0dlpYSnliM0l0YUdGdVpHeGxjaWRjYmx4dVpuVnVZM1JwYjI0Z1kzSmxZWFJsVEc5allXeFdkV1VnS0NrNklFTnZiWEJ2Ym1WdWRDQjdYRzRnSUdOdmJuTjBJR2x1YzNSaGJtTmxJRDBnVm5WbExtVjRkR1Z1WkNncFhHNWNiaUFnTHk4Z1kyeHZibVVnWjJ4dlltRnNJRUZRU1hOY2JpQWdUMkpxWldOMExtdGxlWE1vVm5WbEtTNW1iM0pGWVdOb0tHdGxlU0E5UGlCN1hHNGdJQ0FnYVdZZ0tDRnBibk4wWVc1alpTNW9ZWE5QZDI1UWNtOXdaWEowZVNoclpYa3BLU0I3WEc0Z0lDQWdJQ0JqYjI1emRDQnZjbWxuYVc1aGJDQTlJRloxWlZ0clpYbGRYRzRnSUNBZ0lDQnBibk4wWVc1alpWdHJaWGxkSUQwZ2RIbHdaVzltSUc5eWFXZHBibUZzSUQwOVBTQW5iMkpxWldOMEoxeHVJQ0FnSUNBZ0lDQS9JR05zYjI1bFJHVmxjQ2h2Y21sbmFXNWhiQ2xjYmlBZ0lDQWdJQ0FnT2lCdmNtbG5hVzVoYkZ4dUlDQWdJSDFjYmlBZ2ZTbGNibHh1SUNBdkx5QmpiMjVtYVdjZ2FYTWdibTkwSUdWdWRXMWxjbUZpYkdWY2JpQWdhVzV6ZEdGdVkyVXVZMjl1Wm1sbklEMGdZMnh2Ym1WRVpXVndLRloxWlM1amIyNW1hV2NwWEc1Y2JpQWdhVzV6ZEdGdVkyVXVZMjl1Wm1sbkxtVnljbTl5U0dGdVpHeGxjaUE5SUdWeWNtOXlTR0Z1Wkd4bGNseHVYRzRnSUM4dklHOXdkR2x2YmlCdFpYSm5aU0J6ZEhKaGRHVm5hV1Z6SUc1bFpXUWdkRzhnWW1VZ1pYaHdiM05sWkNCaWVTQnlaV1psY21WdVkyVmNiaUFnTHk4Z2MyOGdkR2hoZENCdFpYSm5aU0J6ZEhKaGRITWdjbVZuYVhOMFpYSmxaQ0JpZVNCd2JIVm5hVzV6SUdOaGJpQjNiM0pySUhCeWIzQmxjbXg1WEc0Z0lHbHVjM1JoYm1ObExtTnZibVpwWnk1dmNIUnBiMjVOWlhKblpWTjBjbUYwWldkcFpYTWdQU0JXZFdVdVkyOXVabWxuTG05d2RHbHZiazFsY21kbFUzUnlZWFJsWjJsbGMxeHVYRzRnSUM4dklHMWhhMlVnYzNWeVpTQmhiR3dnWlhoMFpXNWtjeUJoY21VZ1ltRnpaV1FnYjI0Z2RHaHBjeUJwYm5OMFlXNWpaUzVjYmlBZ0x5OGdkR2hwY3lCcGN5QnBiWEJ2Y25SaGJuUWdjMjhnZEdoaGRDQm5iRzlpWVd3Z1kyOXRjRzl1Wlc1MGN5QnlaV2RwYzNSbGNtVmtJR0o1SUhCc2RXZHBibk1zWEc0Z0lDOHZJR1V1Wnk0Z2NtOTFkR1Z5TFd4cGJtc2dZWEpsSUdOeVpXRjBaV1FnZFhOcGJtY2dkR2hsSUdOdmNuSmxZM1FnWW1GelpTQmpiMjV6ZEhKMVkzUnZjbHh1SUNCcGJuTjBZVzVqWlM1dmNIUnBiMjV6TGw5aVlYTmxJRDBnYVc1emRHRnVZMlZjYmx4dUlDQXZMeUJqYjIxd1lYUWdabTl5SUhaMVpTMXliM1YwWlhJZ1BDQXlMamN1TVNCM2FHVnlaU0JwZENCa2IyVnpJRzV2ZENCaGJHeHZkeUJ0ZFd4MGFYQnNaU0JwYm5OMFlXeHNjMXh1SUNCcFppQW9hVzV6ZEdGdVkyVXVYMmx1YzNSaGJHeGxaRkJzZFdkcGJuTWdKaVlnYVc1emRHRnVZMlV1WDJsdWMzUmhiR3hsWkZCc2RXZHBibk11YkdWdVozUm9LU0I3WEc0Z0lDQWdhVzV6ZEdGdVkyVXVYMmx1YzNSaGJHeGxaRkJzZFdkcGJuTXViR1Z1WjNSb0lEMGdNRnh1SUNCOVhHNGdJR052Ym5OMElIVnpaU0E5SUdsdWMzUmhibU5sTG5WelpWeHVJQ0JwYm5OMFlXNWpaUzUxYzJVZ1BTQW9jR3gxWjJsdUxDQXVMaTV5WlhOMEtTQTlQaUI3WEc0Z0lDQWdhV1lnS0hCc2RXZHBiaTVwYm5OMFlXeHNaV1FnUFQwOUlIUnlkV1VwSUh0Y2JpQWdJQ0FnSUhCc2RXZHBiaTVwYm5OMFlXeHNaV1FnUFNCbVlXeHpaVnh1SUNBZ0lIMWNiaUFnSUNCcFppQW9jR3gxWjJsdUxtbHVjM1JoYkd3Z0ppWWdjR3gxWjJsdUxtbHVjM1JoYkd3dWFXNXpkR0ZzYkdWa0lEMDlQU0IwY25WbEtTQjdYRzRnSUNBZ0lDQndiSFZuYVc0dWFXNXpkR0ZzYkM1cGJuTjBZV3hzWldRZ1BTQm1ZV3h6WlZ4dUlDQWdJSDFjYmlBZ0lDQjFjMlV1WTJGc2JDaHBibk4wWVc1alpTd2djR3gxWjJsdUxDQXVMaTV5WlhOMEtWeHVJQ0I5WEc0Z0lISmxkSFZ5YmlCcGJuTjBZVzVqWlZ4dWZWeHVYRzVsZUhCdmNuUWdaR1ZtWVhWc2RDQmpjbVZoZEdWTWIyTmhiRloxWlZ4dUlpd2lMeThnUUdac2IzZGNibHh1Wm5WdVkzUnBiMjRnWjJWMFQzQjBhVzl1Y3lBb2EyVjVMQ0J2Y0hScGIyNXpMQ0JqYjI1bWFXY3BJSHRjYmlBZ2FXWWdLRzl3ZEdsdmJuTWdmSHhjYmlBZ0lDQW9ZMjl1Wm1sblcydGxlVjBnSmlZZ1QySnFaV04wTG10bGVYTW9ZMjl1Wm1sblcydGxlVjBwTG14bGJtZDBhQ0ErSURBcEtTQjdYRzRnSUNBZ2FXWWdLRUZ5Y21GNUxtbHpRWEp5WVhrb2IzQjBhVzl1Y3lrcElIdGNiaUFnSUNBZ0lISmxkSFZ5YmlCYlhHNGdJQ0FnSUNBZ0lDNHVMbTl3ZEdsdmJuTXNYRzRnSUNBZ0lDQWdJQzR1TGs5aWFtVmpkQzVyWlhsektHTnZibVpwWjF0clpYbGRJSHg4SUh0OUtWMWNiaUFnSUNCOUlHVnNjMlVnZTF4dUlDQWdJQ0FnY21WMGRYSnVJSHRjYmlBZ0lDQWdJQ0FnTGk0dVkyOXVabWxuVzJ0bGVWMHNYRzRnSUNBZ0lDQWdJQzR1TG05d2RHbHZibk5jYmlBZ0lDQWdJSDFjYmlBZ0lDQjlYRzRnSUgxY2JuMWNibHh1Wlhod2IzSjBJR1oxYm1OMGFXOXVJRzFsY21kbFQzQjBhVzl1Y3lBb1hHNGdJRzl3ZEdsdmJuTTZJRTl3ZEdsdmJuTXNYRzRnSUdOdmJtWnBaem9nVDNCMGFXOXVjMXh1S1RvZ1QzQjBhVzl1Y3lCN1hHNGdJSEpsZEhWeWJpQjdYRzRnSUNBZ0xpNHViM0IwYVc5dWN5eGNiaUFnSUNCemRIVmljem9nWjJWMFQzQjBhVzl1Y3lnbmMzUjFZbk1uTENCdmNIUnBiMjV6TG5OMGRXSnpMQ0JqYjI1bWFXY3BMRnh1SUNBZ0lHMXZZMnR6T2lCblpYUlBjSFJwYjI1ektDZHRiMk5yY3ljc0lHOXdkR2x2Ym5NdWJXOWphM01zSUdOdmJtWnBaeWtzWEc0Z0lDQWdiV1YwYUc5a2N6b2daMlYwVDNCMGFXOXVjeWduYldWMGFHOWtjeWNzSUc5d2RHbHZibk11YldWMGFHOWtjeXdnWTI5dVptbG5LVnh1SUNCOVhHNTlYRzVjYmlJc0lpOHZJRUJtYkc5M1hHNWNibWx0Y0c5eWRDQjdJSGRoY200Z2ZTQm1jbTl0SUNkemFHRnlaV1F2ZFhScGJDZGNibHh1Wm5WdVkzUnBiMjRnWjJWMFVtVmhiRU5vYVd4a0lDaDJibTlrWlRvZ1AxWk9iMlJsS1RvZ1AxWk9iMlJsSUh0Y2JpQWdZMjl1YzNRZ1kyOXRjRTl3ZEdsdmJuTWdQU0IyYm05a1pTQW1KaUIyYm05a1pTNWpiMjF3YjI1bGJuUlBjSFJwYjI1elhHNGdJR2xtSUNoamIyMXdUM0IwYVc5dWN5QW1KaUJqYjIxd1QzQjBhVzl1Y3k1RGRHOXlMbTl3ZEdsdmJuTXVZV0p6ZEhKaFkzUXBJSHRjYmlBZ0lDQnlaWFIxY200Z1oyVjBVbVZoYkVOb2FXeGtLR2RsZEVacGNuTjBRMjl0Y0c5dVpXNTBRMmhwYkdRb1kyOXRjRTl3ZEdsdmJuTXVZMmhwYkdSeVpXNHBLVnh1SUNCOUlHVnNjMlVnZTF4dUlDQWdJSEpsZEhWeWJpQjJibTlrWlZ4dUlDQjlYRzU5WEc1Y2JtWjFibU4wYVc5dUlHbHpVMkZ0WlVOb2FXeGtJQ2hqYUdsc1pEb2dWazV2WkdVc0lHOXNaRU5vYVd4a09pQldUbTlrWlNrNklHSnZiMnhsWVc0Z2UxeHVJQ0J5WlhSMWNtNGdiMnhrUTJocGJHUXVhMlY1SUQwOVBTQmphR2xzWkM1clpYa2dKaVlnYjJ4a1EyaHBiR1F1ZEdGbklEMDlQU0JqYUdsc1pDNTBZV2RjYm4xY2JseHVablZ1WTNScGIyNGdaMlYwUm1seWMzUkRiMjF3YjI1bGJuUkRhR2xzWkNBb1kyaHBiR1J5Wlc0NklEOUJjbkpoZVR4V1RtOWtaVDRwT2lBL1ZrNXZaR1VnZTF4dUlDQnBaaUFvUVhKeVlYa3VhWE5CY25KaGVTaGphR2xzWkhKbGJpa3BJSHRjYmlBZ0lDQm1iM0lnS0d4bGRDQnBJRDBnTURzZ2FTQThJR05vYVd4a2NtVnVMbXhsYm1kMGFEc2dhU3NyS1NCN1hHNGdJQ0FnSUNCamIyNXpkQ0JqSUQwZ1kyaHBiR1J5Wlc1YmFWMWNiaUFnSUNBZ0lHbG1JQ2hqSUNZbUlDaGpMbU52YlhCdmJtVnVkRTl3ZEdsdmJuTWdmSHdnYVhOQmMzbHVZMUJzWVdObGFHOXNaR1Z5S0dNcEtTa2dlMXh1SUNBZ0lDQWdJQ0J5WlhSMWNtNGdZMXh1SUNBZ0lDQWdmVnh1SUNBZ0lIMWNiaUFnZlZ4dWZWeHVYRzVtZFc1amRHbHZiaUJwYzFCeWFXMXBkR2wyWlNBb2RtRnNkV1U2SUdGdWVTazZJR0p2YjJ4bFlXNGdlMXh1SUNCeVpYUjFjbTRnS0Z4dUlDQWdJSFI1Y0dWdlppQjJZV3gxWlNBOVBUMGdKM04wY21sdVp5Y2dmSHhjYmlBZ0lDQjBlWEJsYjJZZ2RtRnNkV1VnUFQwOUlDZHVkVzFpWlhJbklIeDhYRzRnSUNBZ0x5OGdKRVpzYjNkSloyNXZjbVZjYmlBZ0lDQjBlWEJsYjJZZ2RtRnNkV1VnUFQwOUlDZHplVzFpYjJ3bklIeDhYRzRnSUNBZ2RIbHdaVzltSUhaaGJIVmxJRDA5UFNBblltOXZiR1ZoYmlkY2JpQWdLVnh1ZlZ4dVhHNW1kVzVqZEdsdmJpQnBjMEZ6ZVc1alVHeGhZMlZvYjJ4a1pYSWdLRzV2WkdVNklGWk9iMlJsS1RvZ1ltOXZiR1ZoYmlCN1hHNGdJSEpsZEhWeWJpQnViMlJsTG1selEyOXRiV1Z1ZENBbUppQnViMlJsTG1GemVXNWpSbUZqZEc5eWVWeHVmVnh1WTI5dWMzUWdZMkZ0Wld4cGVtVlNSU0E5SUM4dEtGeGNkeWt2WjF4dVpYaHdiM0owSUdOdmJuTjBJR05oYldWc2FYcGxJRDBnS0hOMGNqb2djM1J5YVc1bktUb2djM1J5YVc1bklEMCtJSHRjYmlBZ2NtVjBkWEp1SUhOMGNpNXlaWEJzWVdObEtHTmhiV1ZzYVhwbFVrVXNJQ2hmTENCaktTQTlQaUJqSUQ4Z1l5NTBiMVZ3Y0dWeVEyRnpaU2dwSURvZ0p5Y3BYRzU5WEc1Y2JtWjFibU4wYVc5dUlHaGhjMUJoY21WdWRGUnlZVzV6YVhScGIyNGdLSFp1YjJSbE9pQldUbTlrWlNrNklEOWliMjlzWldGdUlIdGNiaUFnZDJocGJHVWdLQ2gyYm05a1pTQTlJSFp1YjJSbExuQmhjbVZ1ZENrcElIdGNiaUFnSUNCcFppQW9kbTV2WkdVdVpHRjBZUzUwY21GdWMybDBhVzl1S1NCN1hHNGdJQ0FnSUNCeVpYUjFjbTRnZEhKMVpWeHVJQ0FnSUgxY2JpQWdmVnh1ZlZ4dVhHNWxlSEJ2Y25RZ1pHVm1ZWFZzZENCN1hHNGdJSEpsYm1SbGNpQW9hRG9nUm5WdVkzUnBiMjRwSUh0Y2JpQWdJQ0JzWlhRZ1kyaHBiR1J5Wlc0NklEOUJjbkpoZVR4V1RtOWtaVDRnUFNCMGFHbHpMaVJ2Y0hScGIyNXpMbDl5Wlc1a1pYSkRhR2xzWkhKbGJseHVJQ0FnSUdsbUlDZ2hZMmhwYkdSeVpXNHBJSHRjYmlBZ0lDQWdJSEpsZEhWeWJseHVJQ0FnSUgxY2JseHVJQ0FnSUM4dklHWnBiSFJsY2lCdmRYUWdkR1Y0ZENCdWIyUmxjeUFvY0c5emMybGliR1VnZDJocGRHVnpjR0ZqWlhNcFhHNGdJQ0FnWTJocGJHUnlaVzRnUFNCamFHbHNaSEpsYmk1bWFXeDBaWElvS0dNNklGWk9iMlJsS1NBOVBpQmpMblJoWnlCOGZDQnBjMEZ6ZVc1alVHeGhZMlZvYjJ4a1pYSW9ZeWtwWEc0Z0lDQWdMeW9nYVhOMFlXNWlkV3dnYVdkdWIzSmxJR2xtSUNvdlhHNGdJQ0FnYVdZZ0tDRmphR2xzWkhKbGJpNXNaVzVuZEdncElIdGNiaUFnSUNBZ0lISmxkSFZ5Ymx4dUlDQWdJSDFjYmx4dUlDQWdJQzh2SUhkaGNtNGdiWFZzZEdsd2JHVWdaV3hsYldWdWRITmNiaUFnSUNCcFppQW9ZMmhwYkdSeVpXNHViR1Z1WjNSb0lENGdNU2tnZTF4dUlDQWdJQ0FnZDJGeWJpaGNiaUFnSUNBZ0lDQWdKengwY21GdWMybDBhVzl1UGlCallXNGdiMjVzZVNCaVpTQjFjMlZrSUc5dUlHRWdjMmx1WjJ4bElHVnNaVzFsYm5RdUlGVnpaU0FuSUN0Y2JpQWdJQ0FnSUNBZ0lDYzhkSEpoYm5OcGRHbHZiaTFuY205MWNENGdabTl5SUd4cGMzUnpMaWRjYmlBZ0lDQWdJQ2xjYmlBZ0lDQjlYRzVjYmlBZ0lDQmpiMjV6ZENCdGIyUmxPaUJ6ZEhKcGJtY2dQU0IwYUdsekxtMXZaR1ZjYmx4dUlDQWdJQzh2SUhkaGNtNGdhVzUyWVd4cFpDQnRiMlJsWEc0Z0lDQWdhV1lnS0cxdlpHVWdKaVlnYlc5a1pTQWhQVDBnSjJsdUxXOTFkQ2NnSmlZZ2JXOWtaU0FoUFQwZ0oyOTFkQzFwYmlkY2JpQWdJQ0FwSUh0Y2JpQWdJQ0FnSUhkaGNtNG9YRzRnSUNBZ0lDQWdJQ2RwYm5aaGJHbGtJRHgwY21GdWMybDBhVzl1UGlCdGIyUmxPaUFuSUNzZ2JXOWtaVnh1SUNBZ0lDQWdLVnh1SUNBZ0lIMWNibHh1SUNBZ0lHTnZibk4wSUhKaGQwTm9hV3hrT2lCV1RtOWtaU0E5SUdOb2FXeGtjbVZ1V3pCZFhHNWNiaUFnSUNBdkx5QnBaaUIwYUdseklHbHpJR0VnWTI5dGNHOXVaVzUwSUhKdmIzUWdibTlrWlNCaGJtUWdkR2hsSUdOdmJYQnZibVZ1ZENkelhHNGdJQ0FnTHk4Z2NHRnlaVzUwSUdOdmJuUmhhVzVsY2lCdWIyUmxJR0ZzYzI4Z2FHRnpJSFJ5WVc1emFYUnBiMjRzSUhOcmFYQXVYRzRnSUNBZ2FXWWdLR2hoYzFCaGNtVnVkRlJ5WVc1emFYUnBiMjRvZEdocGN5NGtkbTV2WkdVcEtTQjdYRzRnSUNBZ0lDQnlaWFIxY200Z2NtRjNRMmhwYkdSY2JpQWdJQ0I5WEc1Y2JpQWdJQ0F2THlCaGNIQnNlU0IwY21GdWMybDBhVzl1SUdSaGRHRWdkRzhnWTJocGJHUmNiaUFnSUNBdkx5QjFjMlVnWjJWMFVtVmhiRU5vYVd4a0tDa2dkRzhnYVdkdWIzSmxJR0ZpYzNSeVlXTjBJR052YlhCdmJtVnVkSE1nWlM1bkxpQnJaV1Z3TFdGc2FYWmxYRzRnSUNBZ1kyOXVjM1FnWTJocGJHUTZJRDlXVG05a1pTQTlJR2RsZEZKbFlXeERhR2xzWkNoeVlYZERhR2xzWkNsY2JseHVJQ0FnSUdsbUlDZ2hZMmhwYkdRcElIdGNiaUFnSUNBZ0lISmxkSFZ5YmlCeVlYZERhR2xzWkZ4dUlDQWdJSDFjYmx4dUlDQWdJR052Ym5OMElHbGtPaUJ6ZEhKcGJtY2dQU0JnWDE5MGNtRnVjMmwwYVc5dUxTUjdkR2hwY3k1ZmRXbGtmUzFnWEc0Z0lDQWdZMmhwYkdRdWEyVjVJRDBnWTJocGJHUXVhMlY1SUQwOUlHNTFiR3hjYmlBZ0lDQWdJRDhnWTJocGJHUXVhWE5EYjIxdFpXNTBYRzRnSUNBZ0lDQWdJRDhnYVdRZ0t5QW5ZMjl0YldWdWRDZGNiaUFnSUNBZ0lDQWdPaUJwWkNBcklHTm9hV3hrTG5SaFoxeHVJQ0FnSUNBZ09pQnBjMUJ5YVcxcGRHbDJaU2hqYUdsc1pDNXJaWGtwWEc0Z0lDQWdJQ0FnSUQ4Z0tGTjBjbWx1WnloamFHbHNaQzVyWlhrcExtbHVaR1Y0VDJZb2FXUXBJRDA5UFNBd0lEOGdZMmhwYkdRdWEyVjVJRG9nYVdRZ0t5QmphR2xzWkM1clpYa3BYRzRnSUNBZ0lDQWdJRG9nWTJocGJHUXVhMlY1WEc1Y2JpQWdJQ0JqYjI1emRDQmtZWFJoT2lCUFltcGxZM1FnUFNBb1kyaHBiR1F1WkdGMFlTQjhmQ0FvWTJocGJHUXVaR0YwWVNBOUlIdDlLU2xjYmlBZ0lDQmpiMjV6ZENCdmJHUlNZWGREYUdsc1pEb2dQMVpPYjJSbElEMGdkR2hwY3k1ZmRtNXZaR1ZjYmlBZ0lDQmpiMjV6ZENCdmJHUkRhR2xzWkRvZ1AxWk9iMlJsSUQwZ1oyVjBVbVZoYkVOb2FXeGtLRzlzWkZKaGQwTm9hV3hrS1Z4dUlDQWdJR2xtSUNoamFHbHNaQzVrWVhSaExtUnBjbVZqZEdsMlpYTWdKaVlnWTJocGJHUXVaR0YwWVM1a2FYSmxZM1JwZG1WekxuTnZiV1VvWkNBOVBpQmtMbTVoYldVZ1BUMDlJQ2R6YUc5M0p5a3BJSHRjYmlBZ0lDQWdJR05vYVd4a0xtUmhkR0V1YzJodmR5QTlJSFJ5ZFdWY2JpQWdJQ0I5WEc1Y2JpQWdJQ0F2THlCdFlYSnJJSFl0YzJodmQxeHVJQ0FnSUM4dklITnZJSFJvWVhRZ2RHaGxJSFJ5WVc1emFYUnBiMjRnYlc5a2RXeGxJR05oYmlCb1lXNWtJRzkyWlhJZ2RHaGxJR052Ym5SeWIyd2dkRzhnZEdobElHUnBjbVZqZEdsMlpWeHVJQ0FnSUdsbUlDaGphR2xzWkM1a1lYUmhMbVJwY21WamRHbDJaWE1nSmlZZ1kyaHBiR1F1WkdGMFlTNWthWEpsWTNScGRtVnpMbk52YldVb1pDQTlQaUJrTG01aGJXVWdQVDA5SUNkemFHOTNKeWtwSUh0Y2JpQWdJQ0FnSUdOb2FXeGtMbVJoZEdFdWMyaHZkeUE5SUhSeWRXVmNiaUFnSUNCOVhHNGdJQ0FnYVdZZ0tGeHVJQ0FnSUNBZ2IyeGtRMmhwYkdRZ0ppWmNiaUFnSUNBZ0lDQWdJRzlzWkVOb2FXeGtMbVJoZEdFZ0ppWmNiaUFnSUNBZ0lDQWdJQ0ZwYzFOaGJXVkRhR2xzWkNoamFHbHNaQ3dnYjJ4a1EyaHBiR1FwSUNZbVhHNGdJQ0FnSUNBZ0lDQWhhWE5CYzNsdVkxQnNZV05sYUc5c1pHVnlLRzlzWkVOb2FXeGtLU0FtSmx4dUlDQWdJQ0FnSUNBZ0x5OGdJelkyT0RjZ1kyOXRjRzl1Wlc1MElISnZiM1FnYVhNZ1lTQmpiMjF0Wlc1MElHNXZaR1ZjYmlBZ0lDQWdJQ0FnSUNFb2IyeGtRMmhwYkdRdVkyOXRjRzl1Wlc1MFNXNXpkR0Z1WTJVZ0ppWWdiMnhrUTJocGJHUXVZMjl0Y0c5dVpXNTBTVzV6ZEdGdVkyVXVYM1p1YjJSbExtbHpRMjl0YldWdWRDbGNiaUFnSUNBcElIdGNiaUFnSUNBZ0lHOXNaRU5vYVd4a0xtUmhkR0VnUFNCN0lDNHVMbVJoZEdFZ2ZWeHVJQ0FnSUgxY2JpQWdJQ0J5WlhSMWNtNGdjbUYzUTJocGJHUmNiaUFnZlZ4dWZWeHVJaXdpTHk4Z1FHWnNiM2RjYmx4dVpYaHdiM0owSUdSbFptRjFiSFFnZTF4dUlDQnlaVzVrWlhJZ0tHZzZJRVoxYm1OMGFXOXVLU0I3WEc0Z0lDQWdZMjl1YzNRZ2RHRm5PaUJ6ZEhKcGJtY2dQU0IwYUdsekxuUmhaeUI4ZkNCMGFHbHpMaVIyYm05a1pTNWtZWFJoTG5SaFp5QjhmQ0FuYzNCaGJpZGNiaUFnSUNCamIyNXpkQ0JqYUdsc1pISmxiam9nUVhKeVlYazhWazV2WkdVK0lEMGdkR2hwY3k0a2MyeHZkSE11WkdWbVlYVnNkQ0I4ZkNCYlhWeHVYRzRnSUNBZ2NtVjBkWEp1SUdnb2RHRm5MQ0J1ZFd4c0xDQmphR2xzWkhKbGJpbGNiaUFnZlZ4dWZWeHVJaXdpYVcxd2IzSjBJRlJ5WVc1emFYUnBiMjVUZEhWaUlHWnliMjBnSnk0dlkyOXRjRzl1Wlc1MGN5OVVjbUZ1YzJsMGFXOXVVM1IxWWlkY2JtbHRjRzl5ZENCVWNtRnVjMmwwYVc5dVIzSnZkWEJUZEhWaUlHWnliMjBnSnk0dlkyOXRjRzl1Wlc1MGN5OVVjbUZ1YzJsMGFXOXVSM0p2ZFhCVGRIVmlKMXh1WEc1bGVIQnZjblFnWkdWbVlYVnNkQ0I3WEc0Z0lITjBkV0p6T2lCN1hHNGdJQ0FnZEhKaGJuTnBkR2x2YmpvZ1ZISmhibk5wZEdsdmJsTjBkV0lzWEc0Z0lDQWdKM1J5WVc1emFYUnBiMjR0WjNKdmRYQW5PaUJVY21GdWMybDBhVzl1UjNKdmRYQlRkSFZpWEc0Z0lIMHNYRzRnSUcxdlkydHpPaUI3ZlN4Y2JpQWdiV1YwYUc5a2N6b2dlMzFjYm4xY2JpSXNJaTh2SUVCbWJHOTNYRzVjYm1sdGNHOXlkQ0FuTGk5M1lYSnVMV2xtTFc1dkxYZHBibVJ2ZHlkY2JtbHRjRzl5ZENBbkxpOXRZWFJqYUdWekxYQnZiSGxtYVd4c0oxeHVhVzF3YjNKMElDY3VMMjlpYW1WamRDMWhjM05wWjI0dGNHOXNlV1pwYkd3blhHNXBiWEJ2Y25RZ1ZuVmxJR1p5YjIwZ0ozWjFaU2RjYm1sdGNHOXlkQ0JXZFdWWGNtRndjR1Z5SUdaeWIyMGdKeTR2ZG5WbExYZHlZWEJ3WlhJblhHNXBiWEJ2Y25RZ1kzSmxZWFJsU1c1emRHRnVZMlVnWm5KdmJTQW5ZM0psWVhSbExXbHVjM1JoYm1ObEoxeHVhVzF3YjNKMElHTnlaV0YwWlVWc1pXMWxiblFnWm5KdmJTQW5MaTlqY21WaGRHVXRaV3hsYldWdWRDZGNibWx0Y0c5eWRDQmpjbVZoZEdWTWIyTmhiRloxWlNCbWNtOXRJQ2N1TDJOeVpXRjBaUzFzYjJOaGJDMTJkV1VuWEc1cGJYQnZjblFnWlhKeWIzSklZVzVrYkdWeUlHWnliMjBnSnk0dlpYSnliM0l0YUdGdVpHeGxjaWRjYm1sdGNHOXlkQ0I3SUdacGJtUkJiR3hXZFdWRGIyMXdiMjVsYm5SelJuSnZiVlp0SUgwZ1puSnZiU0FuTGk5bWFXNWtMWFoxWlMxamIyMXdiMjVsYm5SekoxeHVhVzF3YjNKMElIc2diV1Z5WjJWUGNIUnBiMjV6SUgwZ1puSnZiU0FuYzJoaGNtVmtMMjFsY21kbExXOXdkR2x2Ym5NblhHNXBiWEJ2Y25RZ1kyOXVabWxuSUdaeWIyMGdKeTR2WTI5dVptbG5KMXh1WEc1V2RXVXVZMjl1Wm1sbkxuQnliMlIxWTNScGIyNVVhWEFnUFNCbVlXeHpaVnh1Vm5WbExtTnZibVpwWnk1a1pYWjBiMjlzY3lBOUlHWmhiSE5sWEc1V2RXVXVZMjl1Wm1sbkxtVnljbTl5U0dGdVpHeGxjaUE5SUdWeWNtOXlTR0Z1Wkd4bGNseHVYRzVsZUhCdmNuUWdaR1ZtWVhWc2RDQm1kVzVqZEdsdmJpQnRiM1Z1ZENBb1kyOXRjRzl1Wlc1ME9pQkRiMjF3YjI1bGJuUXNJRzl3ZEdsdmJuTTZJRTl3ZEdsdmJuTWdQU0I3ZlNrNklGWjFaVmR5WVhCd1pYSWdlMXh1SUNBdkx5QlNaVzF2ZG1VZ1kyRmphR1ZrSUdOdmJuTjBjblZqZEc5eVhHNGdJR1JsYkdWMFpTQmpiMjF3YjI1bGJuUXVYME4wYjNKY2JpQWdZMjl1YzNRZ2RuVmxRMnhoYzNNZ1BTQnZjSFJwYjI1ekxteHZZMkZzVm5WbElIeDhJR055WldGMFpVeHZZMkZzVm5WbEtDbGNiaUFnWTI5dWMzUWdkbTBnUFNCamNtVmhkR1ZKYm5OMFlXNWpaU2hqYjIxd2IyNWxiblFzSUcxbGNtZGxUM0IwYVc5dWN5aHZjSFJwYjI1ekxDQmpiMjVtYVdjcExDQjJkV1ZEYkdGemN5bGNibHh1SUNCcFppQW9iM0IwYVc5dWN5NWhkSFJoWTJoVWIwUnZZM1Z0Wlc1MEtTQjdYRzRnSUNBZ2RtMHVKRzF2ZFc1MEtHTnlaV0YwWlVWc1pXMWxiblFvS1NsY2JpQWdmU0JsYkhObElIdGNiaUFnSUNCMmJTNGtiVzkxYm5Rb0tWeHVJQ0I5WEc1Y2JpQWdZMjl1YzNRZ1kyOXRjRzl1Wlc1MFYybDBhRVZ5Y205eUlEMGdabWx1WkVGc2JGWjFaVU52YlhCdmJtVnVkSE5HY205dFZtMG9kbTBwTG1acGJtUW9ZeUE5UGlCakxsOWxjbkp2Y2lsY2JseHVJQ0JwWmlBb1kyOXRjRzl1Wlc1MFYybDBhRVZ5Y205eUtTQjdYRzRnSUNBZ2RHaHliM2NnS0dOdmJYQnZibVZ1ZEZkcGRHaEZjbkp2Y2k1ZlpYSnliM0lwWEc0Z0lIMWNibHh1SUNCamIyNXpkQ0IzY21Gd2NIQmxjazl3ZEdsdmJuTWdQU0I3WEc0Z0lDQWdZWFIwWVdOb1pXUlViMFJ2WTNWdFpXNTBPaUFoSVc5d2RHbHZibk11WVhSMFlXTm9WRzlFYjJOMWJXVnVkQ3hjYmlBZ0lDQnplVzVqT2lBaElTZ29iM0IwYVc5dWN5NXplVzVqSUh4OElHOXdkR2x2Ym5NdWMzbHVZeUE5UFQwZ2RXNWtaV1pwYm1Wa0tTbGNiaUFnZlZ4dVhHNGdJSEpsZEhWeWJpQnVaWGNnVm5WbFYzSmhjSEJsY2loMmJTd2dkM0poY0hCd1pYSlBjSFJwYjI1ektWeHVmVnh1SWl3aUx5OGdRR1pzYjNkY2JseHVhVzF3YjNKMElDY3VMM2RoY200dGFXWXRibTh0ZDJsdVpHOTNKMXh1YVcxd2IzSjBJRloxWlNCbWNtOXRJQ2QyZFdVblhHNXBiWEJ2Y25RZ2JXOTFiblFnWm5KdmJTQW5MaTl0YjNWdWRDZGNibWx0Y0c5eWRDQjBlWEJsSUZaMVpWZHlZWEJ3WlhJZ1puSnZiU0FuTGk5MmRXVXRkM0poY0hCbGNpZGNibWx0Y0c5eWRDQjdYRzRnSUdOeVpXRjBaVU52YlhCdmJtVnVkRk4wZFdKelJtOXlRV3hzTEZ4dUlDQmpjbVZoZEdWRGIyMXdiMjVsYm5SVGRIVmljMFp2Y2tkc2IySmhiSE5jYm4wZ1puSnZiU0FuYzJoaGNtVmtMM04wZFdJdFkyOXRjRzl1Wlc1MGN5ZGNibWx0Y0c5eWRDQjdJR05oYldWc2FYcGxMRnh1SUNCallYQnBkR0ZzYVhwbExGeHVJQ0JvZVhCb1pXNWhkR1ZjYm4wZ1puSnZiU0FuYzJoaGNtVmtMM1YwYVd3blhHNWNibVY0Y0c5eWRDQmtaV1poZFd4MElHWjFibU4wYVc5dUlITm9ZV3hzYjNjZ0tGeHVJQ0JqYjIxd2IyNWxiblE2SUVOdmJYQnZibVZ1ZEN4Y2JpQWdiM0IwYVc5dWN6b2dUM0IwYVc5dWN5QTlJSHQ5WEc0cE9pQldkV1ZYY21Gd2NHVnlJSHRjYmlBZ1kyOXVjM1FnZG5WbElEMGdiM0IwYVc5dWN5NXNiMk5oYkZaMVpTQjhmQ0JXZFdWY2JseHVJQ0F2THlCeVpXMXZkbVVnWVc1NUlISmxZM1Z5YzJsMlpTQmpiMjF3YjI1bGJuUnpJR0ZrWkdWa0lIUnZJSFJvWlNCamIyNXpkSEoxWTNSdmNseHVJQ0F2THlCcGJpQjJiUzVmYVc1cGRDQm1jbTl0SUhCeVpYWnBiM1Z6SUhSbGMzUnpYRzRnSUdsbUlDaGpiMjF3YjI1bGJuUXVibUZ0WlNBbUppQmpiMjF3YjI1bGJuUXVZMjl0Y0c5dVpXNTBjeWtnZTF4dUlDQWdJR1JsYkdWMFpTQmpiMjF3YjI1bGJuUXVZMjl0Y0c5dVpXNTBjMXRqWVhCcGRHRnNhWHBsS0dOaGJXVnNhWHBsS0dOdmJYQnZibVZ1ZEM1dVlXMWxLU2xkWEc0Z0lDQWdaR1ZzWlhSbElHTnZiWEJ2Ym1WdWRDNWpiMjF3YjI1bGJuUnpXMmg1Y0dobGJtRjBaU2hqYjIxd2IyNWxiblF1Ym1GdFpTbGRYRzRnSUgxY2JseHVJQ0JqYjI1emRDQnpkSFZpWW1Wa1EyOXRjRzl1Wlc1MGN5QTlJR055WldGMFpVTnZiWEJ2Ym1WdWRGTjBkV0p6Um05eVFXeHNLR052YlhCdmJtVnVkQ2xjYmlBZ1kyOXVjM1FnYzNSMVltSmxaRWRzYjJKaGJFTnZiWEJ2Ym1WdWRITWdQU0JqY21WaGRHVkRiMjF3YjI1bGJuUlRkSFZpYzBadmNrZHNiMkpoYkhNb2RuVmxLVnh1WEc0Z0lISmxkSFZ5YmlCdGIzVnVkQ2hqYjIxd2IyNWxiblFzSUh0Y2JpQWdJQ0F1TGk1dmNIUnBiMjV6TEZ4dUlDQWdJR052YlhCdmJtVnVkSE02SUh0Y2JpQWdJQ0FnSUM4dklITjBkV0ppWldRZ1kyOXRjRzl1Wlc1MGN5QmhjbVVnZFhObFpDQnBibk4wWldGa0lHOW1JRzl5YVdkcGJtRnNJR052YlhCdmJtVnVkSE1nWTI5dGNHOXVaVzUwYzF4dUlDQWdJQ0FnTGk0dWMzUjFZbUpsWkVkc2IySmhiRU52YlhCdmJtVnVkSE1zWEc0Z0lDQWdJQ0F1TGk1emRIVmlZbVZrUTI5dGNHOXVaVzUwYzF4dUlDQWdJSDFjYmlBZ2ZTbGNibjFjYmlJc0lpOHZJRUJtYkc5M1hHNWpiMjV6ZENCMGIxUjVjR1Z6T2lCQmNuSmhlVHhHZFc1amRHbHZiajRnUFNCYlUzUnlhVzVuTENCUFltcGxZM1JkWEc1amIyNXpkQ0JsZG1WdWRGUjVjR1Z6T2lCQmNuSmhlVHhHZFc1amRHbHZiajRnUFNCYlUzUnlhVzVuTENCQmNuSmhlVjFjYmx4dVpYaHdiM0owSUdSbFptRjFiSFFnZTF4dUlDQnVZVzFsT2lBblVtOTFkR1Z5VEdsdWExTjBkV0luTEZ4dUlDQndjbTl3Y3pvZ2UxeHVJQ0FnSUhSdk9pQjdYRzRnSUNBZ0lDQjBlWEJsT2lCMGIxUjVjR1Z6TEZ4dUlDQWdJQ0FnY21WeGRXbHlaV1E2SUhSeWRXVmNiaUFnSUNCOUxGeHVJQ0FnSUhSaFp6b2dlMXh1SUNBZ0lDQWdkSGx3WlRvZ1UzUnlhVzVuTEZ4dUlDQWdJQ0FnWkdWbVlYVnNkRG9nSjJFblhHNGdJQ0FnZlN4Y2JpQWdJQ0JsZUdGamREb2dRbTl2YkdWaGJpeGNiaUFnSUNCaGNIQmxibVE2SUVKdmIyeGxZVzRzWEc0Z0lDQWdjbVZ3YkdGalpUb2dRbTl2YkdWaGJpeGNiaUFnSUNCaFkzUnBkbVZEYkdGemN6b2dVM1J5YVc1bkxGeHVJQ0FnSUdWNFlXTjBRV04wYVhabFEyeGhjM002SUZOMGNtbHVaeXhjYmlBZ0lDQmxkbVZ1ZERvZ2UxeHVJQ0FnSUNBZ2RIbHdaVG9nWlhabGJuUlVlWEJsY3l4Y2JpQWdJQ0FnSUdSbFptRjFiSFE2SUNkamJHbGpheWRjYmlBZ0lDQjlYRzRnSUgwc1hHNGdJSEpsYm1SbGNpQW9hRG9nUm5WdVkzUnBiMjRwSUh0Y2JpQWdJQ0J5WlhSMWNtNGdhQ2gwYUdsekxuUmhaeXdnZFc1a1pXWnBibVZrTENCMGFHbHpMaVJ6Ykc5MGN5NWtaV1poZFd4MEtWeHVJQ0I5WEc1OVhHNGlMQ0pwYlhCdmNuUWdjMmhoYkd4dmR5Qm1jbTl0SUNjdUwzTm9ZV3hzYjNjblhHNXBiWEJ2Y25RZ2JXOTFiblFnWm5KdmJTQW5MaTl0YjNWdWRDZGNibWx0Y0c5eWRDQmpjbVZoZEdWTWIyTmhiRloxWlNCbWNtOXRJQ2N1TDJOeVpXRjBaUzFzYjJOaGJDMTJkV1VuWEc1cGJYQnZjblFnVkhKaGJuTnBkR2x2YmxOMGRXSWdabkp2YlNBbkxpOWpiMjF3YjI1bGJuUnpMMVJ5WVc1emFYUnBiMjVUZEhWaUoxeHVhVzF3YjNKMElGUnlZVzV6YVhScGIyNUhjbTkxY0ZOMGRXSWdabkp2YlNBbkxpOWpiMjF3YjI1bGJuUnpMMVJ5WVc1emFYUnBiMjVIY205MWNGTjBkV0luWEc1cGJYQnZjblFnVW05MWRHVnlUR2x1YTFOMGRXSWdabkp2YlNBbkxpOWpiMjF3YjI1bGJuUnpMMUp2ZFhSbGNreHBibXRUZEhWaUoxeHVhVzF3YjNKMElHTnZibVpwWnlCbWNtOXRJQ2N1TDJOdmJtWnBaeWRjYmx4dVpYaHdiM0owSUdSbFptRjFiSFFnZTF4dUlDQmpjbVZoZEdWTWIyTmhiRloxWlN4Y2JpQWdZMjl1Wm1sbkxGeHVJQ0J0YjNWdWRDeGNiaUFnYzJoaGJHeHZkeXhjYmlBZ1ZISmhibk5wZEdsdmJsTjBkV0lzWEc0Z0lGUnlZVzV6YVhScGIyNUhjbTkxY0ZOMGRXSXNYRzRnSUZKdmRYUmxja3hwYm10VGRIVmlYRzU5WEc0aVhTd2libUZ0WlhNaU9sc2lZMjl1YzNRaUxDSnNaWFFpTENKaGNtZDFiV1Z1ZEhNaUxDSjBhR2x6SWl3aVptbHVaRUZzYkNJc0luTjFjR1Z5SWl3aVkyOXRjR2xzWlZSdlJuVnVZM1JwYjI1eklpd2lWblZsSWl3aUpDUldkV1VpTENKcGMxWjFaVU52YlhCdmJtVnVkQ0lzSW1OdmJYQnBiR1ZVWlcxd2JHRjBaU0lzSW1SbGJHVjBaVzl3ZEdsdmJuTWlMQ0psY1NJc0ltRnpjMjlqU1c1a1pYaFBaaUlzSW14cGMzUkRZV05vWlVOc1pXRnlJaXdpYkdsemRFTmhZMmhsUkdWc1pYUmxJaXdpYkdsemRFTmhZMmhsUjJWMElpd2liR2x6ZEVOaFkyaGxTR0Z6SWl3aWJHbHpkRU5oWTJobFUyVjBJaXdpVEdsemRFTmhZMmhsSWl3aVoyeHZZbUZzSWl3aVpuSmxaVWRzYjJKaGJDSXNJbkp2YjNRaUxDSlRlVzFpYjJ3aUxDSnZZbXBsWTNSUWNtOTBieUlzSW01aGRHbDJaVTlpYW1WamRGUnZVM1J5YVc1bklpd2ljM2x0Vkc5VGRISnBibWRVWVdjaUxDSm5aWFJTWVhkVVlXY2lMQ0p2WW1wbFkzUlViMU4wY21sdVp5SXNJbWx6VDJKcVpXTjBJaXdpWW1GelpVZGxkRlJoWnlJc0ltTnZjbVZLYzBSaGRHRWlMQ0ptZFc1alVISnZkRzhpTENKbWRXNWpWRzlUZEhKcGJtY2lMQ0pvWVhOUGQyNVFjbTl3WlhKMGVTSXNJbWx6VFdGemEyVmtJaXdpYVhOR2RXNWpkR2x2YmlJc0luUnZVMjkxY21ObElpd2laMlYwVm1Gc2RXVWlMQ0ppWVhObFNYTk9ZWFJwZG1VaUxDSm5aWFJPWVhScGRtVWlMQ0p1WVhScGRtVkRjbVZoZEdVaUxDSklRVk5JWDFWT1JFVkdTVTVGUkNJc0ltaGhjMmhEYkdWaGNpSXNJbWhoYzJoRVpXeGxkR1VpTENKb1lYTm9SMlYwSWl3aWFHRnphRWhoY3lJc0ltaGhjMmhUWlhRaUxDSklZWE5vSWl3aVRXRndJaXdpYVhOTFpYbGhZbXhsSWl3aVoyVjBUV0Z3UkdGMFlTSXNJbTFoY0VOaFkyaGxRMnhsWVhJaUxDSnRZWEJEWVdOb1pVUmxiR1YwWlNJc0ltMWhjRU5oWTJobFIyVjBJaXdpYldGd1EyRmphR1ZJWVhNaUxDSnRZWEJEWVdOb1pWTmxkQ0lzSWsxaGNFTmhZMmhsSWl3aWMzUmhZMnREYkdWaGNpSXNJbk4wWVdOclJHVnNaWFJsSWl3aWMzUmhZMnRIWlhRaUxDSnpkR0ZqYTBoaGN5SXNJbk4wWVdOclUyVjBJaXdpWkdWbWFXNWxVSEp2Y0dWeWRIa2lMQ0ppWVhObFFYTnphV2R1Vm1Gc2RXVWlMQ0poYzNOcFoyNVdZV3gxWlNJc0ltbHpUMkpxWldOMFRHbHJaU0lzSW1KaGMyVkpjMEZ5WjNWdFpXNTBjeUlzSW5OMGRXSkdZV3h6WlNJc0lrMUJXRjlUUVVaRlgwbE9WRVZIUlZJaUxDSmhjbWR6VkdGbklpd2lablZ1WTFSaFp5SXNJbWx6VEdWdVozUm9JaXdpYm05a1pWVjBhV3dpTENKaVlYTmxWVzVoY25raUxDSmlZWE5sU1hOVWVYQmxaRUZ5Y21GNUlpd2lhWE5CY25KaGVTSXNJbWx6UVhKbmRXMWxiblJ6SWl3aWFYTkNkV1ptWlhJaUxDSnBjMVI1Y0dWa1FYSnlZWGtpTENKaVlYTmxWR2x0WlhNaUxDSnBjMGx1WkdWNElpd2liM1psY2tGeVp5SXNJbWx6VUhKdmRHOTBlWEJsSWl3aWJtRjBhWFpsUzJWNWN5SXNJbWx6UVhKeVlYbE1hV3RsSWl3aVlYSnlZWGxNYVd0bFMyVjVjeUlzSW1KaGMyVkxaWGx6SWl3aVkyOXdlVTlpYW1WamRDSXNJbXRsZVhNaUxDSnVZWFJwZG1WTFpYbHpTVzRpTENKclpYbHpTVzRpTENKaVlYTmxTMlY1YzBsdUlpd2ljSEp2Y0dWeWRIbEpjMFZ1ZFcxbGNtRmliR1VpTENKemRIVmlRWEp5WVhraUxDSmhjbkpoZVVacGJIUmxjaUlzSW1kbGRGTjViV0p2YkhNaUxDSnVZWFJwZG1WSFpYUlRlVzFpYjJ4eklpd2lZWEp5WVhsUWRYTm9JaXdpWjJWMFVISnZkRzkwZVhCbElpd2laMlYwVTNsdFltOXNjMGx1SWl3aVltRnpaVWRsZEVGc2JFdGxlWE1pTENKdFlYQlVZV2NpTENKdlltcGxZM1JVWVdjaUxDSnpaWFJVWVdjaUxDSjNaV0ZyVFdGd1ZHRm5JaXdpWkdGMFlWWnBaWGRVWVdjaUxDSkVZWFJoVm1sbGR5SXNJbEJ5YjIxcGMyVWlMQ0pUWlhRaUxDSlhaV0ZyVFdGd0lpd2lWV2x1ZERoQmNuSmhlU0lzSW1Oc2IyNWxRWEp5WVhsQ2RXWm1aWElpTENKdFlYQlViMEZ5Y21GNUlpd2lZWEp5WVhsU1pXUjFZMlVpTENKaFpHUk5ZWEJGYm5SeWVTSXNJa05NVDA1RlgwUkZSVkJmUmt4QlJ5SXNJbk5sZEZSdlFYSnlZWGtpTENKaFpHUlRaWFJGYm5SeWVTSXNJbUp2YjJ4VVlXY2lMQ0prWVhSbFZHRm5JaXdpYm5WdFltVnlWR0ZuSWl3aWNtVm5aWGh3VkdGbklpd2ljM1J5YVc1blZHRm5JaXdpWVhKeVlYbENkV1ptWlhKVVlXY2lMQ0ptYkc5aGRETXlWR0ZuSWl3aVpteHZZWFEyTkZSaFp5SXNJbWx1ZERoVVlXY2lMQ0pwYm5ReE5sUmhaeUlzSW1sdWRETXlWR0ZuSWl3aWRXbHVkRGhVWVdjaUxDSjFhVzUwT0VOc1lXMXdaV1JVWVdjaUxDSjFhVzUwTVRaVVlXY2lMQ0oxYVc1ME16SlVZV2NpTENKamJHOXVaVVJoZEdGV2FXVjNJaXdpWTJ4dmJtVlVlWEJsWkVGeWNtRjVJaXdpWTJ4dmJtVk5ZWEFpTENKamJHOXVaVkpsWjBWNGNDSXNJbU5zYjI1bFUyVjBJaXdpWTJ4dmJtVlRlVzFpYjJ3aUxDSmlZWE5sUTNKbFlYUmxJaXdpWVhKeVlYbFVZV2NpTENKbGNuSnZjbFJoWnlJc0ltZGxibFJoWnlJc0luTjViV0p2YkZSaFp5SXNJbWx1YVhSRGJHOXVaVUZ5Y21GNUlpd2lZMjl3ZVVGeWNtRjVJaXdpWjJWMFZHRm5JaXdpWTJ4dmJtVkNkV1ptWlhJaUxDSnBibWwwUTJ4dmJtVlBZbXBsWTNRaUxDSmpiM0I1VTNsdFltOXNjMGx1SWl3aVltRnpaVUZ6YzJsbmJrbHVJaXdpWTI5d2VWTjViV0p2YkhNaUxDSmlZWE5sUVhOemFXZHVJaXdpYVc1cGRFTnNiMjVsUW5sVVlXY2lMQ0pUZEdGamF5SXNJbWRsZEVGc2JFdGxlWE5KYmlJc0ltZGxkRUZzYkV0bGVYTWlMQ0poY25KaGVVVmhZMmdpTENKRFRFOU9SVjlUV1UxQ1QweFRYMFpNUVVjaUxDSmlZWE5sUTJ4dmJtVWlMQ0pqYkc5dVpVUmxaWEFpWFN3aWJXRndjR2x1WjNNaU9pSTdPenM3T3pzN1FVRkJRVHM3UVVGRlFTeEJRVUZQTEZOQlFWTXNWVUZCVlN4RlFVRkZMRWRCUVVjc1JVRkJWVHRGUVVOMlF5eE5RVUZOTEVsQlFVa3NTMEZCU3l4NVFrRkJjMElzUjBGQlJ5eEZRVUZITzBOQlF6VkRPenRCUVVWRUxFRkJRVThzVTBGQlV5eEpRVUZKTEVWQlFVVXNSMEZCUnl4RlFVRlZPMFZCUTJwRExFOUJRVThzUTBGQlF5eExRVUZMTEhsQ1FVRnpRaXhIUVVGSExFZEJRVWM3UTBGRE1VTTdPMEZCUlVSQkxFbEJRVTBzVlVGQlZTeEhRVUZITEZOQlFWRTdRVUZETTBJc1FVRkJUMEVzU1VGQlRTeFJRVUZSTEdGQlFVa3NSMEZCUnl4RlFVRlZMRk5CUVVjc1IwRkJSeXhEUVVGRExFOUJRVThzUTBGQlF5eFZRVUZWTEZsQlFVY3NRMEZCUXl4RlFVRkZMRU5CUVVNc1JVRkJSU3hUUVVGSExFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTXNWMEZCVnl4RlFVRkZMRWRCUVVjc1MwRkJSU3hMUVVGRE96czdPenRCUVV0d1J5eEJRVUZQUVN4SlFVRk5MRlZCUVZVc1lVRkJTU3hIUVVGSExFVkJRVlVzVTBGQlJ5eEhRVUZITEVOQlFVTXNUVUZCVFN4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExGZEJRVmNzUlVGQlJTeEhRVUZITEVkQlFVY3NRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJReXhMUVVGRE96czdPenRCUVV0eVJrRXNTVUZCVFN4WFFVRlhMRWRCUVVjc1lVRkJXVHRCUVVOb1F5eEJRVUZQUVN4SlFVRk5MRk5CUVZNc1lVRkJTU3hIUVVGSExFVkJRVlVzVTBGQlJ5eEhRVUZITEVOQlFVTXNUMEZCVHl4RFFVRkRMRmRCUVZjc1JVRkJSU3hMUVVGTExFTkJRVU1zUTBGQlF5eFhRVUZYTEV0QlFVVTdPMEZEY0VKMlJpeEpRVUZKTEU5QlFVOHNUVUZCVFN4TFFVRkxMRmRCUVZjc1JVRkJSVHRGUVVOcVF5eFZRVUZWTzBsQlExSXNhVVpCUVdsR08wbEJRMnBHTERaRVFVRTJSRHRKUVVNM1JDeHRSa0ZCYlVZN1NVRkRjRVk3UTBGRFJqczdRVU5TUkN4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExGTkJRVk1zUTBGQlF5eFBRVUZQTEVWQlFVVTdSVUZET1VJc1QwRkJUeXhEUVVGRExGTkJRVk1zUTBGQlF5eFBRVUZQTzFGQlEyNUNMRTlCUVU4c1EwRkJReXhUUVVGVExFTkJRVU1zWlVGQlpUdFJRVU5xUXl4UFFVRlBMRU5CUVVNc1UwRkJVeXhEUVVGRExHdENRVUZyUWp0UlFVTndReXhQUVVGUExFTkJRVU1zVTBGQlV5eERRVUZETEdsQ1FVRnBRanRSUVVOdVF5eFBRVUZQTEVOQlFVTXNVMEZCVXl4RFFVRkRMR2RDUVVGblFqdFJRVU5zUXl4UFFVRlBMRU5CUVVNc1UwRkJVeXhEUVVGRExIRkNRVUZ4UWp0UlFVTjJReXhWUVVGVkxFTkJRVU1zUlVGQlJUdFZRVU5ZUVN4SlFVRk5MRTlCUVU4c1IwRkJSeXhEUVVGRExFbEJRVWtzUTBGQlF5eFJRVUZSTEVsQlFVa3NTVUZCU1N4RFFVRkRMR0ZCUVdFc1JVRkJSU3huUWtGQlowSXNRMEZCUXl4RFFVRkRMRVZCUVVNN1ZVRkRla1ZETEVsQlFVa3NRMEZCUXl4SFFVRkhMRTlCUVU4c1EwRkJReXhQUVVGTk8xVkJRM1JDTEU5QlFVOHNSVUZCUlN4RFFVRkRMRWxCUVVrc1EwRkJReXhKUVVGSkxFOUJRVThzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRMRXRCUVVzc1NVRkJTU3hGUVVGRkxFVkJRVVU3VlVGREwwTXNUMEZCVHl4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRE8xVkJRMlE3UTBGRFVqczdRVU5pUkN4SlFVRkpMRTlCUVU4c1RVRkJUU3hEUVVGRExFMUJRVTBzUzBGQlN5eFZRVUZWTEVWQlFVVTdSVUZEZGtNc1EwRkJReXhaUVVGWk8wbEJRMWdzVFVGQlRTeERRVUZETEUxQlFVMHNSMEZCUnl4VlFVRlZMRTFCUVUwc1JVRkJSVHM3TzAxQlJXaERMRWxCUVVrc1RVRkJUU3hMUVVGTExGTkJRVk1zU1VGQlNTeE5RVUZOTEV0QlFVc3NTVUZCU1N4RlFVRkZPMUZCUXpORExFMUJRVTBzU1VGQlNTeFRRVUZUTEVOQlFVTXNORU5CUVRSRExFTkJRVU03VDBGRGJFVTdPMDFCUlVRc1NVRkJTU3hOUVVGTkxFZEJRVWNzVFVGQlRTeERRVUZETEUxQlFVMHNSVUZCUXp0TlFVTXpRaXhMUVVGTExFbEJRVWtzUzBGQlN5eEhRVUZITEVOQlFVTXNSVUZCUlN4TFFVRkxMRWRCUVVjc1UwRkJVeXhEUVVGRExFMUJRVTBzUlVGQlJTeExRVUZMTEVWQlFVVXNSVUZCUlR0UlFVTnlSQ3hKUVVGSkxFMUJRVTBzUjBGQlIwTXNWMEZCVXl4RFFVRkRMRXRCUVVzc1JVRkJRenRSUVVNM1FpeEpRVUZKTEUxQlFVMHNTMEZCU3l4VFFVRlRMRWxCUVVrc1RVRkJUU3hMUVVGTExFbEJRVWtzUlVGQlJUdFZRVU16UXl4TFFVRkxMRWxCUVVrc1QwRkJUeXhKUVVGSkxFMUJRVTBzUlVGQlJUdFpRVU14UWl4SlFVRkpMRTFCUVUwc1EwRkJReXhqUVVGakxFTkJRVU1zVDBGQlR5eERRVUZETEVWQlFVVTdZMEZEYkVNc1RVRkJUU3hEUVVGRExFOUJRVThzUTBGQlF5eEhRVUZITEUxQlFVMHNRMEZCUXl4UFFVRlBMRVZCUVVNN1lVRkRiRU03VjBGRFJqdFRRVU5HTzA5QlEwWTdUVUZEUkN4UFFVRlBMRTFCUVUwN1RVRkRaRHRIUVVOR0xFbEJRVWM3UTBGRFREczdRVU4wUWtRN1FVRkRRVHRCUVVWQkxFRkJRVThzVTBGQlV5eGhRVUZoTEVWQlFVVXNVVUZCVVN4RlFVRlBPMFZCUXpWRExFbEJRVWtzVDBGQlR5eFJRVUZSTEV0QlFVc3NVVUZCVVN4RlFVRkZPMGxCUTJoRExFOUJRVThzUzBGQlN6dEhRVU5pT3p0RlFVVkVMRWxCUVVrN1NVRkRSaXhKUVVGSkxFOUJRVThzVVVGQlVTeExRVUZMTEZkQlFWY3NSVUZCUlR0TlFVTnVReXhWUVVGVkxFTkJRVU1zTkVWQlFUUkZMRVZCUVVNN1MwRkRla1k3UjBGRFJpeERRVUZETEU5QlFVOHNTMEZCU3l4RlFVRkZPMGxCUTJRc1ZVRkJWU3hEUVVGRExEUkZRVUUwUlN4RlFVRkRPMGRCUTNwR096dEZRVVZFTEVsQlFVazdTVUZEUml4UlFVRlJMRU5CUVVNc1lVRkJZU3hEUVVGRExGRkJRVkVzUlVGQlF6dEpRVU5vUXl4UFFVRlBMRWxCUVVrN1IwRkRXaXhEUVVGRExFOUJRVThzUzBGQlN5eEZRVUZGTzBsQlEyUXNUMEZCVHl4TFFVRkxPMGRCUTJJN1EwRkRSanM3UVVGRlJDeEJRVUZQTEZOQlFWTXNZMEZCWXl4RlFVRkZMRk5CUVZNc1JVRkJUenRGUVVNNVF5eEpRVUZKTEU5QlFVOHNVMEZCVXl4TFFVRkxMRlZCUVZVc1NVRkJTU3hUUVVGVExFTkJRVU1zVDBGQlR5eEZRVUZGTzBsQlEzaEVMRTlCUVU4c1NVRkJTVHRIUVVOYU96dEZRVVZFTEVsQlFVa3NVMEZCVXl4TFFVRkxMRWxCUVVrc1NVRkJTU3hQUVVGUExGTkJRVk1zUzBGQlN5eFJRVUZSTEVWQlFVVTdTVUZEZGtRc1QwRkJUeXhMUVVGTE8wZEJRMkk3TzBWQlJVUXNTVUZCU1N4VFFVRlRMRU5CUVVNc1QwRkJUeXhKUVVGSkxGTkJRVk1zUTBGQlF5eExRVUZMTEVWQlFVVTdTVUZEZUVNc1QwRkJUeXhKUVVGSk8wZEJRMW83TzBWQlJVUXNUMEZCVHl4UFFVRlBMRk5CUVZNc1EwRkJReXhOUVVGTkxFdEJRVXNzVlVGQlZUdERRVU01UXpzN1FVRkZSQ3hCUVVGUExGTkJRVk1zZFVKQlFYVkNMRVZCUVVVc1UwRkJVeXhGUVVGaE8wVkJRemRFTEU5QlFVOHNVMEZCVXp0SlFVTmtMRU5CUVVNc1UwRkJVeXhEUVVGRExFMUJRVTA3UzBGRGFFSXNVMEZCVXl4RFFVRkRMRkZCUVZFc1NVRkJTU3hUUVVGVExFTkJRVU1zVDBGQlR5eERRVUZETzBsQlEzcERMRU5CUVVNc1UwRkJVeXhEUVVGRExGVkJRVlU3UTBGRGVFSTdPMEZCUlVRc1FVRkJUeXhUUVVGVExHRkJRV0VzUlVGQlJTeG5Ra0ZCWjBJc1JVRkJUenRGUVVOd1JDeEpRVUZKTEU5QlFVOHNaMEpCUVdkQ0xFdEJRVXNzVVVGQlVTeEpRVUZKTEUxQlFVMHNRMEZCUXl4SlFVRkpMRU5CUVVNc1owSkJRV2RDTEVsQlFVa3NSVUZCUlN4RFFVRkRMRU5CUVVNc1RVRkJUU3hMUVVGTExFTkJRVU1zUlVGQlJUdEpRVU0xUml4UFFVRlBMRXRCUVVzN1IwRkRZanM3UlVGRlJDeFBRVUZQTEU5QlFVOHNaMEpCUVdkQ0xFTkJRVU1zUjBGQlJ5eExRVUZMTEZGQlFWRTdRMEZEYUVRN08wRkJSVVFzUVVGQlR5eFRRVUZUTEdOQlFXTXNSVUZCUlN4cFFrRkJhVUlzUlVGQlR6dEZRVU4wUkN4SlFVRkpMRTlCUVU4c2FVSkJRV2xDTEV0QlFVc3NVVUZCVVN4SlFVRkpMR2xDUVVGcFFpeExRVUZMTEVsQlFVa3NSVUZCUlR0SlFVTjJSU3hQUVVGUExFdEJRVXM3UjBGRFlqczdSVUZGUkN4UFFVRlBMRU5CUVVNc1EwRkJReXhwUWtGQmFVSXNRMEZCUXl4SlFVRkpPME5CUTJoRE96dEJRek5FVFVZc1NVRkJUU3hoUVVGaExFZEJRVWNzWjBKQlFXVTdRVUZETlVNc1FVRkJUMEVzU1VGQlRTeHJRa0ZCYTBJc1IwRkJSeXh4UWtGQmIwSTdRVUZEZEVRc1FVRkJUMEVzU1VGQlRTeFpRVUZaTEVkQlFVY3NaVUZCWXp0QlFVTXhReXhCUVVGUFFTeEpRVUZOTEZsQlFWa3NSMEZCUnl4bFFVRmpPMEZCUXpGRExFRkJRVTlCTEVsQlFVMHNWMEZCVnl4SFFVRkhMRTFCUVUwc1IwRkJTU3hIUVVGSExFTkJRVU1zVDBGQlR5eERRVUZETEV0QlFVc3NRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJReXhEUVVGRExGbEJRVXNzUjBGQlJ5eERRVUZETEU5QlFVOHNRMEZCUXl4TFFVRkxMRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVsQlFVYzdRVUZET1VZc1FVRkJUMEVzU1VGQlRTeHJRa0ZCYTBJc1IwRkJSeXhYUVVGWExFbEJRVWtzUjBGQlJ5eEhRVUZITEZkQlFWY3NSMEZCUnl4dFFrRkJiVUk3TzBGRFVIaEdPenRCUVd0Q1FTeEJRVUZsTEZOQlFWTXNjMEpCUVhOQ0xFVkJRVVVzVVVGQlVTeEZRVUZaTEZWQlFWVXNSVUZCZVVJN1JVRkRja2NzU1VGQlNTeGhRVUZoTEVOQlFVTXNVVUZCVVN4RFFVRkRMRWxCUVVVc1QwRkJUeXhqUVVGWk8wVkJRMmhFTEVsQlFVa3NZMEZCWXl4RFFVRkRMRkZCUVZFc1EwRkJReXhKUVVGRkxFOUJRVThzWlVGQllUdEZRVU5zUkN4SlFVRkpMR05CUVdNc1EwRkJReXhSUVVGUkxFTkJRVU1zU1VGQlJTeFBRVUZQTEc5Q1FVRnJRanRGUVVOMlJDeEpRVUZKTEdGQlFXRXNRMEZCUXl4UlFVRlJMRU5CUVVNc1NVRkJSU3hQUVVGUExHTkJRVms3TzBWQlJXaEVMRlZCUVZVc1pVRkJXU3hWUVVGVkxEUkdRVUYxUmp0RFFVTjRTRHM3UVVONlFrUTdRVUZEUVR0QlFWRkJMRUZCUVU4c1UwRkJVeXd3UWtGQk1FSTdSVUZEZUVNc1JVRkJSVHRGUVVOR0xGVkJRV2xETzBWQlEyWTdlVU5CUkZJc1IwRkJjVUk3TzBWQlJTOUNMRlZCUVZVc1EwRkJReXhKUVVGSkxFTkJRVU1zUlVGQlJTeEZRVUZETzBWQlEyNUNMRVZCUVVVc1EwRkJReXhUUVVGVExFTkJRVU1zVDBGQlR5eFhRVUZGTEV0QlFVc3NSVUZCUlR0SlFVTXpRaXd3UWtGQk1FSXNRMEZCUXl4TFFVRkxMRVZCUVVVc1ZVRkJWU3hGUVVGRE8wZEJRemxETEVWQlFVTTdPMFZCUlVZc1QwRkJUeXhWUVVGVk8wTkJRMnhDT3p0QlFVVkVMRk5CUVZNc05rSkJRVFpDTzBWQlEzQkRMRXRCUVVzN1JVRkRUQ3hWUVVGcFF6dEZRVU5tTzNsRFFVUlNMRWRCUVhGQ096dEZRVVV2UWl4SlFVRkpMRXRCUVVzc1EwRkJReXhMUVVGTExFVkJRVVU3U1VGRFppeFZRVUZWTEVOQlFVTXNTVUZCU1N4RFFVRkRMRXRCUVVzc1EwRkJReXhMUVVGTExFVkJRVU03UjBGRE4wSTdSVUZEUkN4SlFVRkpMRXRCUVVzc1EwRkJReXhSUVVGUkxFVkJRVVU3U1VGRGJFSXNTMEZCU3l4RFFVRkRMRkZCUVZFc1EwRkJReXhQUVVGUExGZEJRVVVzUzBGQlN5eEZRVUZGTzAxQlF6ZENMRFpDUVVFMlFpeERRVUZETEV0QlFVc3NSVUZCUlN4VlFVRlZMRVZCUVVNN1MwRkRha1FzUlVGQlF6dEhRVU5JT3p0RlFVVkVMRTlCUVU4c1ZVRkJWVHREUVVOc1FqczdRVUZGUkN4VFFVRlRMRzlEUVVGdlF6dEZRVU16UXl4TFFVRkxPMFZCUTB3c1ZVRkJhVU03UlVGRFpqdDVRMEZFVWl4SFFVRnhRanM3UlVGRkwwSXNTVUZCU1N4TFFVRkxMRU5CUVVNc2EwSkJRV3RDTEVOQlFVTXNTVUZCU1N4TFFVRkxMRU5CUVVNc2FVSkJRV2xDTEVWQlFVVTdTVUZEZUVRc1ZVRkJWU3hEUVVGRExFbEJRVWtzUTBGQlF5eExRVUZMTEVWQlFVTTdSMEZEZGtJN1JVRkRSQ3hKUVVGSkxFdEJRVXNzUTBGQlF5eFJRVUZSTEVWQlFVVTdTVUZEYkVJc1MwRkJTeXhEUVVGRExGRkJRVkVzUTBGQlF5eFBRVUZQTEZkQlFVVXNTMEZCU3l4RlFVRkZPMDFCUXpkQ0xHOURRVUZ2UXl4RFFVRkRMRXRCUVVzc1JVRkJSU3hWUVVGVkxFVkJRVU03UzBGRGVFUXNSVUZCUXp0SFFVTklPMFZCUTBRc1QwRkJUeXhWUVVGVk8wTkJRMnhDT3p0QlFVVkVMRUZCUVU4c1UwRkJVeXhwUWtGQmFVSXNSVUZCUlN4RlFVRkZMRVZCUVdFc1NVRkJTU3hGUVVGdFFqdEZRVU4yUlN4UFFVRlBMRU5CUVVNc1JVRkJSU3hEUVVGRExFVkJRVVVzUTBGQlF5eE5RVUZOTEVsQlFVa3NSVUZCUlN4RFFVRkRMRTFCUVUwc1EwRkJReXhuUWtGQlowSTdTVUZEYUVRc1JVRkJSU3hEUVVGRExFMUJRVTBzUTBGQlF5eG5Ra0ZCWjBJc1EwRkJReXhKUVVGSkxFTkJRVU1zVDBGQlR5eERRVUZETEVsQlFVa3NTMEZCU3l4SlFVRkpPMHRCUTNCRUxFVkJRVVVzUTBGQlF5eE5RVUZOTzBsQlExWXNSVUZCUlN4RFFVRkRMRTFCUVUwc1EwRkJReXhwUWtGQmFVSTdTVUZETTBJc1JVRkJSU3hEUVVGRExFMUJRVTBzUTBGQlF5eHBRa0ZCYVVJc1EwRkJReXhKUVVGSkxFdEJRVXNzU1VGQlNTeERRVUZETzBsQlF6RkRMRVZCUVVVc1EwRkJReXhSUVVGUkxFbEJRVWtzUlVGQlJTeERRVUZETEZGQlFWRXNRMEZCUXl4SlFVRkpMRXRCUVVzc1NVRkJTVHRKUVVONFF5eEZRVUZGTEVOQlFVTXNUMEZCVHl4SlFVRkpMRVZCUVVVc1EwRkJReXhQUVVGUExFTkJRVU1zU1VGQlNTeExRVUZMTEVsQlFVa3NRMEZCUXp0RFFVTXhRenM3UVVGRlJDeEJRVUZQTEZOQlFWTXNjVUpCUVhGQ0xFVkJRVVVzVTBGQlV5eEZRVUZoTEZGQlFWRXNSVUZCVlR0RlFVTTNSVUVzU1VGQlRTeEpRVUZKTEVkQlFVY3NVVUZCVVN4RFFVRkRMRXRCUVVzc1MwRkJTeXhSUVVGUkxFTkJRVU1zVDBGQlR5eEpRVUZKTEZGQlFWRXNRMEZCUXl4UFFVRlBMRU5CUVVNc1MwRkJTeXhGUVVGRE8wVkJRek5GTEVsQlFVa3NRMEZCUXl4SlFVRkpMRVZCUVVVN1NVRkRWQ3hQUVVGUExFdEJRVXM3UjBGRFlqdEZRVU5FUVN4SlFVRk5MRXRCUVVzc1IwRkJSeXhOUVVGTkxFTkJRVU1zU1VGQlNTeERRVUZETEVsQlFVa3NSVUZCUXp0RlFVTXZRaXhQUVVGUExFdEJRVXNzUTBGQlF5eEpRVUZKTEZkQlFVTXNSMEZCUlN4VFFVRkhMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU1zUzBGQlN5eFRRVUZUTEVOQlFVTXNVMEZCVXl4RFFVRkRMR05CUVZjc1EwRkJRenREUVVOd1JUczdRVUZGUkN4QlFVRlBMRk5CUVZNc0swSkJRU3RDTEVWQlFVVXNVMEZCVXl4RlFVRlRMRWxCUVVrc1JVRkJWVHRGUVVNdlJTeEpRVUZKTEZkQlFWY3NSMEZCUnl4SFFVRkhMRVZCUVVVN1NVRkRja0lzVlVGQlZTeERRVUZETERSRVFVRTBSQ3hGUVVGRE8wZEJRM3BGT3p0RlFVVkVMRWxCUVVrc1EwRkJReXhKUVVGSkxFVkJRVVU3U1VGRFZDeFBRVUZQTEV0QlFVczdSMEZEWWpzN1JVRkZSQ3hKUVVGSkxFTkJRVU1zVTBGQlV5eERRVUZETEd0Q1FVRnJRaXhEUVVGRExFVkJRVVU3U1VGRGJFTXNUMEZCVHl4TFFVRkxPMGRCUTJJN1JVRkRSRUVzU1VGQlRTeExRVUZMTEVkQlFVY3NUVUZCVFN4RFFVRkRMRWxCUVVrc1EwRkJReXhUUVVGVExFTkJRVU1zYTBKQlFXdENMRU5CUVVNc1EwRkJReXhMUVVGTExFVkJRVU03UlVGRE9VUXNUMEZCVHl4TFFVRkxMRU5CUVVNc1NVRkJTU3hYUVVGRExFZEJRVVVzVTBGQlJ5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRMRXRCUVVzc1UwRkJVeXhEUVVGRExHdENRVUZyUWl4RFFVRkRMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU1zU1VGQlF5eERRVUZETzBOQlF6TkZPenRCUVVWRUxFRkJRV1VzVTBGQlV5eHBRa0ZCYVVJN1JVRkRka01zU1VGQlNUdEZRVU5LTEZsQlFWazdSVUZEV2l4UlFVRlJPMFZCUTFVN1JVRkRiRUlzU1VGQlNTeFJRVUZSTEVOQlFVTXNWVUZCVlN4RlFVRkZPMGxCUTNaQ1FTeEpRVUZOTEV0QlFVc3NSMEZCUnl4SlFVRkpMRU5CUVVNc1RVRkJUVHRSUVVOeVFpeHZRMEZCYjBNc1EwRkJReXhKUVVGSkxFTkJRVU1zVFVGQlRTeERRVUZETzFGQlEycEVMRzlEUVVGdlF5eERRVUZETEVsQlFVa3NSVUZCUXp0SlFVTTVReXhQUVVGUExFdEJRVXNzUTBGQlF5eE5RVUZOTEZkQlFVTXNUVUZCU3l4VFFVTjJRaXdyUWtGQkswSXNRMEZCUXl4SlFVRkpMRVZCUVVVc1VVRkJVU3hEUVVGRExFdEJRVXNzUTBGQlF6dE5RVU55UkN4SlFVRkpMRU5CUVVNc2EwSkJRV3RDTEVOQlFVTXNRMEZCUXl4SlFVRkpMRXRCUVVzc1VVRkJVU3hEUVVGRExFOUJRVWs3UzBGRGFFUTdSMEZEUmp0RlFVTkVRU3hKUVVGTkxGbEJRVmtzUjBGQlJ5eFBRVUZQTEZGQlFWRXNTMEZCU3l4VlFVRlZMRWRCUVVjc1VVRkJVU3hEUVVGRExFOUJRVThzUTBGQlF5eEpRVUZKTEVkQlFVY3NVVUZCVVN4RFFVRkRMRXRCUVVrN1JVRkRNMFpCTEVsQlFVMHNWVUZCVlN4SFFVRkhMRWxCUVVrc1EwRkJReXhOUVVGTk8wMUJRekZDTERCQ1FVRXdRaXhEUVVGRExFbEJRVWtzUTBGQlF6dE5RVU5vUXl3MlFrRkJOa0lzUTBGQlF5eEpRVUZKTEVWQlFVTTdSVUZEZGtNc1QwRkJUeXhWUVVGVkxFTkJRVU1zVFVGQlRTeFhRVUZGTEZOQlFWTXNSVUZCUlR0SlFVTnVReXhKUVVGSkxFTkJRVU1zVTBGQlV5eERRVUZETEUxQlFVMHNTVUZCU1N4RFFVRkRMRk5CUVZNc1EwRkJReXhSUVVGUkxFTkJRVU1zVDBGQlR5eEZRVUZGTzAxQlEzQkVMRTlCUVU4c1MwRkJTenRMUVVOaU8wbEJRMFFzVDBGQlR5eHhRa0ZCY1VJc1EwRkJReXhUUVVGVExFVkJRVVVzVVVGQlVTeERRVUZETEVsQlFVa3NhVUpCUVdsQ0xFTkJRVU1zVTBGQlV5eEZRVUZGTEZsQlFWa3NRMEZCUXp0SFFVTm9SeXhEUVVGRE8wTkJRMGc3TzBGREwwZEVPenRCUVZOQkxFbEJRWEZDTEZsQlFWa3NSMEZKTDBJc2NVSkJRVmNzUlVGQlJTeFJRVUZSTEVWQlFTdENPMFZCUTNCRUxFbEJRVTBzUTBGQlF5eFJRVUZSTEVkQlFVY3NVVUZCVVN4SlFVRkpMRWRCUVVVN1JVRkRhRU1zU1VGQlRTeERRVUZETEUxQlFVMHNSMEZCUnl4SlFVRkpMRU5CUVVNc1VVRkJVU3hEUVVGRExFOUJRVTA3UlVGRGJrTTdPMEZCUlVnc2RVSkJRVVVzUlVGQlJTeG5Ra0ZCUlN4TFFVRkxMRVZCUVdkRE8wVkJRM3BETEVsQlFVMHNTMEZCU3l4SFFVRkhMRWxCUVVrc1EwRkJReXhOUVVGTkxFZEJRVWNzUTBGQlF5eEZRVUZGTzBsQlF6ZENMRlZCUVZrc2VVSkJRWE5DTEV0QlFVc3NSMEZCUnp0SFFVTjZRenRGUVVOSUxFOUJRVk1zU1VGQlNTeERRVUZETEZGQlFWRXNRMEZCUXl4TFFVRkxMRU5CUVVNN1JVRkROVUk3TzBGQlJVZ3NkVUpCUVVVc1ZVRkJWU3d3UWtGQlZUdEZRVU53UWl4SlFVRk5MRU5CUVVNc01rSkJRVEpDTEVOQlFVTXNXVUZCV1N4RlFVRkRPenRGUVVWb1JDeFZRVUZaTEVOQlFVTXNPRVZCUVRoRkxFVkJRVU03UlVGRE0wWTdPMEZCUlVnc2RVSkJRVVVzVDBGQlR5eDFRa0ZCVlR0RlFVTnFRaXhKUVVGTkxFTkJRVU1zTWtKQlFUSkNMRU5CUVVNc1UwRkJVeXhGUVVGRE96dEZRVVUzUXl4VlFVRlpMRU5CUVVNc01rVkJRVEpGTEVWQlFVTTdSVUZEZUVZN08wRkJSVWdzZFVKQlFVVXNVVUZCVVN4elFrRkJSU3hSUVVGUkxFVkJRWEZDTzBWQlEzWkRMRWxCUVUwc1EwRkJReXd5UWtGQk1rSXNRMEZCUXl4VlFVRlZMRVZCUVVNN08wVkJSVGxETEU5QlFWTXNTVUZCU1N4RFFVRkRMRkZCUVZFc1EwRkJReXhMUVVGTExGZEJRVU1zVTBGQlVTeFRRVUZITEU5QlFVOHNRMEZCUXl4UlFVRlJMRU5CUVVNc1VVRkJVU3hKUVVGRExFTkJRVU03UlVGRGJFVTdPMEZCUlVnc2RVSkJRVVVzVFVGQlRTeHpRa0ZCWVR0RlFVTnVRaXhQUVVGVExFbEJRVWtzUTBGQlF5eE5RVUZOTEVkQlFVY3NRMEZCUXl4SlFVRkpMRWxCUVVrc1EwRkJReXhSUVVGUkxFTkJRVU1zUzBGQlN5eFhRVUZETEZOQlFWRXNVMEZCUnl4UFFVRlBMRU5CUVVNc1RVRkJUU3hMUVVGRkxFTkJRVU03UlVGRE0wVTdPMEZCUlVnc2RVSkJRVVVzVFVGQlRTeHZRa0ZCUlN4VFFVRlRMRVZCUVRCQ08wVkJRek5ETEU5QlFWTXNTVUZCU1N4WlFVRlpMRU5CUVVNc1NVRkJTU3hEUVVGRExGRkJRVkVzUTBGQlF5eE5RVUZOTEVOQlFVTXNVMEZCVXl4RFFVRkRMRU5CUVVNN1JVRkRla1E3TzBGQlJVZ3NkVUpCUVVVc1QwRkJUeXgxUWtGQllUdEZRVU53UWl4SlFVRk5MRU5CUVVNc01rSkJRVEpDTEVOQlFVTXNVMEZCVXl4RlFVRkRPenRGUVVVM1F5eFBRVUZUTEVsQlFVa3NRMEZCUXl4TlFVRk5MRWRCUVVjc1EwRkJReXhKUVVGSkxFbEJRVWtzUTBGQlF5eFJRVUZSTEVOQlFVTXNTMEZCU3l4WFFVRkRMRk5CUVZFc1UwRkJSeXhQUVVGUExFTkJRVU1zVDBGQlR5eExRVUZGTEVOQlFVTTdSVUZETlVVN08wRkJSVWdzZFVKQlFVVXNUMEZCVHl4MVFrRkJWVHRGUVVOcVFpeEpRVUZOTEVOQlFVTXNNa0pCUVRKQ0xFTkJRVU1zVTBGQlV5eEZRVUZET3p0RlFVVTNReXhWUVVGWkxFTkJRVU1zTWtWQlFUSkZMRVZCUVVNN1JVRkRlRVk3TzBGQlJVZ3NkVUpCUVVVc1kwRkJZeXc0UWtGQlZUdEZRVU40UWl4SlFVRk5MRU5CUVVNc01rSkJRVEpDTEVOQlFVTXNaMEpCUVdkQ0xFVkJRVU03TzBWQlJYQkVMRlZCUVZrc1EwRkJReXhyUmtGQmEwWXNSVUZCUXp0RlFVTXZSanM3UVVGRlNDeDFRa0ZCUlN4WlFVRlpMREJDUVVGRkxGTkJRVk1zUlVGQlZTeExRVUZMTEVWQlFXMUNPMFZCUTNwRUxFbEJRVTBzUTBGQlF5d3lRa0ZCTWtJc1EwRkJReXhqUVVGakxFVkJRVU03TzBWQlJXeEVMRTlCUVZNc1NVRkJTU3hEUVVGRExGRkJRVkVzUTBGQlF5eExRVUZMTEZkQlFVTXNVMEZCVVN4VFFVRkhMRTlCUVU4c1EwRkJReXhaUVVGWkxFTkJRVU1zVTBGQlV5eEZRVUZGTEV0QlFVc3NTVUZCUXl4RFFVRkRPMFZCUXpsRk96dEJRVVZJTEhWQ1FVRkZMRkZCUVZFc2MwSkJRVVVzVTBGQlV5eEZRVUZ0UWp0RlFVTjBReXhKUVVGTkxFTkJRVU1zTWtKQlFUSkNMRU5CUVVNc1ZVRkJWU3hGUVVGRE96dEZRVVU1UXl4UFFVRlRMRWxCUVVrc1EwRkJReXhSUVVGUkxFTkJRVU1zUzBGQlN5eFhRVUZETEZOQlFWRXNVMEZCUnl4UFFVRlBMRU5CUVVNc1VVRkJVU3hEUVVGRExGTkJRVk1zU1VGQlF5eERRVUZETzBWQlEyNUZPenRCUVVWSUxIVkNRVUZGTEU5QlFVOHNjVUpCUVVVc1NVRkJTU3hGUVVGVkxFdEJRVXNzUlVGQmJVSTdSVUZETDBNc1NVRkJUU3hEUVVGRExESkNRVUV5UWl4RFFVRkRMRk5CUVZNc1JVRkJRenM3UlVGRk4wTXNUMEZCVXl4SlFVRkpMRU5CUVVNc1VVRkJVU3hEUVVGRExFdEJRVXNzVjBGQlF5eFRRVUZSTEZOQlFVY3NUMEZCVHl4RFFVRkRMRTlCUVU4c1EwRkJReXhKUVVGSkxFVkJRVVVzUzBGQlN5eEpRVUZETEVOQlFVTTdSVUZEY0VVN08wRkJSVWdzZFVKQlFVVXNVVUZCVVN4elFrRkJSU3hMUVVGTExFVkJRVlVzUzBGQlN5eEZRVUZ0UWp0RlFVTnFSQ3hKUVVGTkxFTkJRVU1zTWtKQlFUSkNMRU5CUVVNc1ZVRkJWU3hGUVVGRE96dEZRVVU1UXl4UFFVRlRMRWxCUVVrc1EwRkJReXhSUVVGUkxFTkJRVU1zUzBGQlN5eFhRVUZETEZOQlFWRXNVMEZCUnl4UFFVRlBMRU5CUVVNc1VVRkJVU3hEUVVGRExFdEJRVXNzUlVGQlJTeExRVUZMTEVsQlFVTXNRMEZCUXp0RlFVTjBSVHM3UVVGRlNDeDFRa0ZCUlN4UFFVRlBMSFZDUVVGVk8wVkJRMnBDTEVsQlFVMHNRMEZCUXl3eVFrRkJNa0lzUTBGQlF5eFRRVUZUTEVWQlFVTTdPMFZCUlRkRExGVkJRVmtzUTBGQlF5d3lSVUZCTWtVc1JVRkJRenRGUVVONFJqczdRVUZGU0N4MVFrRkJSU3hKUVVGSkxHOUNRVUZWTzBWQlEyUXNTVUZCVFN4RFFVRkRMREpDUVVFeVFpeERRVUZETEUxQlFVMHNSVUZCUXpzN1JVRkZNVU1zVlVGQldTeERRVUZETEhkRlFVRjNSU3hGUVVGRE8wVkJRM0pHT3p0QlFVVklMSFZDUVVGRkxFbEJRVWtzYjBKQlFWVTdSVUZEWkN4SlFVRk5MRU5CUVVNc01rSkJRVEpDTEVOQlFVTXNUVUZCVFN4RlFVRkRPenRGUVVVeFF5eFZRVUZaTEVOQlFVTXNkMFZCUVhkRkxFVkJRVU03UlVGRGNrWTdPMEZCUlVnc2RVSkJRVVVzUlVGQlJTeG5Ra0ZCUlN4UlFVRlJMRVZCUVhGQ08wVkJRMnBETEVsQlFVMHNRMEZCUXl3eVFrRkJNa0lzUTBGQlF5eEpRVUZKTEVWQlFVTTdPMFZCUlhoRExFOUJRVk1zU1VGQlNTeERRVUZETEZGQlFWRXNRMEZCUXl4TFFVRkxMRmRCUVVNc1UwRkJVU3hUUVVGSExFOUJRVThzUTBGQlF5eEZRVUZGTEVOQlFVTXNVVUZCVVN4SlFVRkRMRU5CUVVNN1JVRkROVVE3TzBGQlJVZ3NkVUpCUVVVc1QwRkJUeXgxUWtGQllUdEZRVU53UWl4SlFVRk5MRU5CUVVNc01rSkJRVEpDTEVOQlFVTXNVMEZCVXl4RlFVRkRPenRGUVVVM1F5eFBRVUZUTEVsQlFVa3NRMEZCUXl4UlFVRlJMRU5CUVVNc1MwRkJTeXhYUVVGRExGTkJRVkVzVTBGQlJ5eFBRVUZQTEVOQlFVTXNUMEZCVHl4TFFVRkZMRU5CUVVNN1JVRkRla1E3TzBGQlJVZ3NkVUpCUVVVc1UwRkJVeXg1UWtGQllUdEZRVU4wUWl4SlFVRk5MRU5CUVVNc01rSkJRVEpDTEVOQlFVTXNWMEZCVnl4RlFVRkRPenRGUVVVdlF5eFBRVUZUTEVsQlFVa3NRMEZCUXl4UlFVRlJMRU5CUVVNc1MwRkJTeXhYUVVGRExGTkJRVkVzVTBGQlJ5eFBRVUZQTEVOQlFVTXNVMEZCVXl4TFFVRkZMRU5CUVVNN1JVRkRNMFE3TzBGQlJVZ3NkVUpCUVVVc1lVRkJZU3cyUWtGQllUdEZRVU14UWl4SlFVRk5MRU5CUVVNc01rSkJRVEpDTEVOQlFVTXNaVUZCWlN4RlFVRkRPenRGUVVWdVJDeFBRVUZUTEVsQlFVa3NRMEZCUXl4UlFVRlJMRU5CUVVNc1MwRkJTeXhYUVVGRExGTkJRVkVzVTBGQlJ5eFBRVUZQTEVOQlFVTXNZVUZCWVN4TFFVRkZMRU5CUVVNN1JVRkRMMFE3TzBGQlJVZ3NkVUpCUVVVc1NVRkJTU3h2UWtGQlZUdEZRVU5rTEVsQlFVMHNRMEZCUXl3eVFrRkJNa0lzUTBGQlF5eE5RVUZOTEVWQlFVTTdPMFZCUlRGRExGVkJRVmtzUTBGQlF5eDNSVUZCZDBVc1JVRkJRenRGUVVOeVJqczdRVUZGU0N4MVFrRkJSU3hMUVVGTExIRkNRVUZWTzBWQlEyWXNTVUZCVFN4RFFVRkRMREpDUVVFeVFpeERRVUZETEU5QlFVOHNSVUZCUXpzN1JVRkZNME1zVlVGQldTeERRVUZETEhsRlFVRjVSU3hGUVVGRE8wVkJRM1JHT3p0QlFVVklMSFZDUVVGRkxFbEJRVWtzYjBKQlFWVTdSVUZEWkN4SlFVRk5MRU5CUVVNc01rSkJRVEpDTEVOQlFVTXNUVUZCVFN4RlFVRkRPenRGUVVVeFF5eFZRVUZaTEVOQlFVTXNkMFZCUVhkRkxFVkJRVU03UlVGRGNrWTdPMEZCUlVnc2RVSkJRVVVzTWtKQlFUSkNMSGxEUVVGRkxFMUJRVTBzUlVGQlowSTdSVUZEYmtRc1NVRkJUU3hKUVVGSkxFTkJRVU1zVVVGQlVTeERRVUZETEUxQlFVMHNTMEZCU3l4RFFVRkRMRVZCUVVVN1NVRkRhRU1zVlVGQldTeEZRVUZKTEUxQlFVMHNiME5CUVN0Q08wZEJRM0JFTzBWQlEwWTdPMEZCUlVnc2RVSkJRVVVzVjBGQlZ5eDVRa0ZCUlN4UlFVRlJMRVZCUVdkQ08wVkJRM0pETEVsQlFVMHNRMEZCUXl3eVFrRkJNa0lzUTBGQlF5eGhRVUZoTEVWQlFVTTdPMFZCUldwRUxFbEJRVTBzUTBGQlF5eFJRVUZSTEVOQlFVTXNUMEZCVHl4WFFVRkRMRk5CUVZFc1UwRkJSeXhQUVVGUExFTkJRVU1zVjBGQlZ5eERRVUZETEZGQlFWRXNTVUZCUXl4RlFVRkRPMFZCUTJoRk96dEJRVVZJTEhWQ1FVRkZMRTlCUVU4c2NVSkJRVVVzU1VGQlNTeEZRVUZuUWp0RlFVTTNRaXhKUVVGTkxFTkJRVU1zTWtKQlFUSkNMRU5CUVVNc1UwRkJVeXhGUVVGRE96dEZRVVUzUXl4SlFVRk5MRU5CUVVNc1VVRkJVU3hEUVVGRExFOUJRVThzVjBGQlF5eFRRVUZSTEZOQlFVY3NUMEZCVHl4RFFVRkRMRTlCUVU4c1EwRkJReXhKUVVGSkxFbEJRVU1zUlVGQlF6dEZRVU40UkRzN1FVRkZTQ3gxUWtGQlJTeFZRVUZWTEhkQ1FVRkZMRXRCUVVzc1JVRkJaMEk3UlVGRGFrTXNTVUZCVFN4RFFVRkRMREpDUVVFeVFpeERRVUZETEZsQlFWa3NSVUZCUXpzN1JVRkZhRVFzU1VGQlRTeERRVUZETEZGQlFWRXNRMEZCUXl4UFFVRlBMRmRCUVVNc1UwRkJVU3hUUVVGSExFOUJRVThzUTBGQlF5eFZRVUZWTEVOQlFVTXNTMEZCU3l4SlFVRkRMRVZCUVVNN1JVRkROVVE3TzBGQlJVZ3NkVUpCUVVVc1VVRkJVU3h6UWtGQlJTeExRVUZMTEVWQlFXZENPMFZCUXk5Q0xFbEJRVTBzUTBGQlF5d3lRa0ZCTWtJc1EwRkJReXhWUVVGVkxFVkJRVU03TzBWQlJUbERMRWxCUVUwc1EwRkJReXhSUVVGUkxFTkJRVU1zVDBGQlR5eFhRVUZETEZOQlFWRXNVMEZCUnl4UFFVRlBMRU5CUVVNc1VVRkJVU3hEUVVGRExFdEJRVXNzU1VGQlF5eEZRVUZETzBWQlF6RkVPenRCUVVWSUxIVkNRVUZGTEU5QlFVOHNjVUpCUVVVc1MwRkJTeXhGUVVGVkxFOUJRVThzUlVGQlowSTdSVUZETDBNc1NVRkJUU3hEUVVGRExESkNRVUV5UWl4RFFVRkRMRk5CUVZNc1JVRkJRenM3UlVGRk4wTXNTVUZCVFN4RFFVRkRMRkZCUVZFc1EwRkJReXhQUVVGUExGZEJRVU1zVTBGQlVTeFRRVUZITEU5QlFVOHNRMEZCUXl4UFFVRlBMRU5CUVVNc1MwRkJTeXhGUVVGRkxFOUJRVThzU1VGQlF5eEZRVUZETzBWQlEyeEZPenRCUVVWSUxIVkNRVUZGTEUxQlFVMHNjMEpCUVZVN1JVRkRhRUlzU1VGQlRTeERRVUZETERKQ1FVRXlRaXhEUVVGRExGRkJRVkVzUlVGQlF6dEZRVU0xUXl4SlFVRk5MRU5CUVVNc1owWkJRV2RHTEVWQlFVTTdSVUZEZGtZN08wRkJSVWdzZFVKQlFVVXNUMEZCVHl4MVFrRkJWVHRGUVVOcVFpeEpRVUZOTEVOQlFVTXNNa0pCUVRKQ0xFTkJRVU1zVTBGQlV5eEZRVUZET3p0RlFVVTNReXhKUVVGTkxFTkJRVU1zVVVGQlVTeERRVUZETEU5QlFVOHNWMEZCUXl4VFFVRlJMRk5CUVVjc1QwRkJUeXhEUVVGRExFOUJRVThzUzBGQlJTeEZRVUZETzBOQlEzQkVPenRCUTNSTlNEczdRVUZKUVN4SlFVRnhRaXhaUVVGWkxFZEJSeTlDTEhGQ1FVRlhMRVZCUVVVc1VVRkJVU3hGUVVGVk8wVkJReTlDTEVsQlFVMHNRMEZCUXl4UlFVRlJMRWRCUVVjc1UwRkJVVHRGUVVONlFqczdRVUZGU0N4MVFrRkJSU3hGUVVGRkxHdENRVUZWTzBWQlExb3NWVUZCV1N3MFFrRkJkMElzU1VGQlNTeERRVUZETEZOQlFWRXNNa05CUVhORE8wVkJRM1JHT3p0QlFVVklMSFZDUVVGRkxGVkJRVlVzTUVKQlFWVTdSVUZEY0VJc1ZVRkJXU3cwUWtGQmQwSXNTVUZCU1N4RFFVRkRMRk5CUVZFc2JVUkJRVGhETzBWQlF6bEdPenRCUVVWSUxIVkNRVUZGTEU5QlFVOHNkVUpCUVZVN1JVRkRha0lzVlVGQldTdzBRa0ZCZDBJc1NVRkJTU3hEUVVGRExGTkJRVkVzWjBSQlFUSkRPMFZCUXpOR096dEJRVVZJTEhWQ1FVRkZMRkZCUVZFc2QwSkJRVlU3UlVGRGJFSXNWVUZCV1N3MFFrRkJkMElzU1VGQlNTeERRVUZETEZOQlFWRXNhVVJCUVRSRE8wVkJRelZHT3p0QlFVVklMSFZDUVVGRkxFOUJRVThzZFVKQlFWVTdSVUZEYWtJc1ZVRkJXU3cwUWtGQmQwSXNTVUZCU1N4RFFVRkRMRk5CUVZFc1owUkJRVEpETzBWQlF6TkdPenRCUVVWSUxIVkNRVUZGTEdOQlFXTXNPRUpCUVZVN1JVRkRlRUlzVlVGQldTdzBRa0ZCZDBJc1NVRkJTU3hEUVVGRExGTkJRVkVzZFVSQlFXdEVPMFZCUTJ4SE96dEJRVVZJTEhWQ1FVRkZMRTFCUVUwc2MwSkJRV0U3UlVGRGJrSXNUMEZCVXl4TFFVRkxPMFZCUTJJN08wRkJSVWdzZFVKQlFVVXNUVUZCVFN4elFrRkJWVHRGUVVOb1FpeFZRVUZaTERSQ1FVRjNRaXhKUVVGSkxFTkJRVU1zVTBGQlVTd3JRMEZCTUVNN1JVRkRNVVk3TzBGQlJVZ3NkVUpCUVVVc1QwRkJUeXgxUWtGQlZUdEZRVU5xUWl4VlFVRlpMRFJDUVVGM1FpeEpRVUZKTEVOQlFVTXNVMEZCVVN4blJFRkJNa003UlVGRE0wWTdPMEZCUlVnc2RVSkJRVVVzV1VGQldTdzBRa0ZCVlR0RlFVTjBRaXhWUVVGWkxEUkNRVUYzUWl4SlFVRkpMRU5CUVVNc1UwRkJVU3h4UkVGQlowUTdSVUZEYUVjN08wRkJSVWdzZFVKQlFVVXNVVUZCVVN4M1FrRkJWVHRGUVVOc1FpeFZRVUZaTERSQ1FVRjNRaXhKUVVGSkxFTkJRVU1zVTBGQlVTeHBSRUZCTkVNN1JVRkROVVk3TzBGQlJVZ3NkVUpCUVVVc1QwRkJUeXgxUWtGQlZUdEZRVU5xUWl4VlFVRlpMRFJDUVVGM1FpeEpRVUZKTEVOQlFVTXNVMEZCVVN4blJFRkJNa003UlVGRE0wWTdPMEZCUlVnc2RVSkJRVVVzVVVGQlVTeDNRa0ZCVlR0RlFVTnNRaXhWUVVGWkxEUkNRVUYzUWl4SlFVRkpMRU5CUVVNc1UwRkJVU3hwUkVGQk5FTTdSVUZETlVZN08wRkJSVWdzZFVKQlFVVXNUMEZCVHl4MVFrRkJWVHRGUVVOcVFpeFZRVUZaTERSQ1FVRjNRaXhKUVVGSkxFTkJRVU1zVTBGQlVTeG5SRUZCTWtNN1JVRkRNMFk3TzBGQlJVZ3NkVUpCUVVVc1NVRkJTU3h2UWtGQlZUdEZRVU5rTEZWQlFWa3NORUpCUVhkQ0xFbEJRVWtzUTBGQlF5eFRRVUZSTERaRFFVRjNRenRGUVVONFJqczdRVUZGU0N4MVFrRkJSU3hKUVVGSkxHOUNRVUZWTzBWQlEyUXNWVUZCV1N3MFFrRkJkMElzU1VGQlNTeERRVUZETEZOQlFWRXNOa05CUVhkRE8wVkJRM2hHT3p0QlFVVklMSFZDUVVGRkxFVkJRVVVzYTBKQlFWVTdSVUZEV2l4VlFVRlpMRFJDUVVGM1FpeEpRVUZKTEVOQlFVTXNVMEZCVVN3eVEwRkJjME03UlVGRGRFWTdPMEZCUlVnc2RVSkJRVVVzVDBGQlR5eDFRa0ZCVlR0RlFVTnFRaXhWUVVGWkxEUkNRVUYzUWl4SlFVRkpMRU5CUVVNc1UwRkJVU3huUkVGQk1rTTdSVUZETTBZN08wRkJSVWdzZFVKQlFVVXNVMEZCVXl4NVFrRkJWVHRGUVVOdVFpeFZRVUZaTERSQ1FVRjNRaXhKUVVGSkxFTkJRVU1zVTBGQlVTeHJSRUZCTmtNN1JVRkROMFk3TzBGQlJVZ3NkVUpCUVVVc1lVRkJZU3cyUWtGQlZUdEZRVU4yUWl4VlFVRlpMRFJDUVVGM1FpeEpRVUZKTEVOQlFVTXNVMEZCVVN4elJFRkJhVVE3UlVGRGFrYzdPMEZCUlVnc2RVSkJRVVVzU1VGQlNTeHZRa0ZCVlR0RlFVTmtMRlZCUVZrc05FSkJRWGRDTEVsQlFVa3NRMEZCUXl4VFFVRlJMRFpEUVVGM1F6dEZRVU40UmpzN1FVRkZTQ3gxUWtGQlJTeExRVUZMTEhGQ1FVRlZPMFZCUTJZc1ZVRkJXU3cwUWtGQmQwSXNTVUZCU1N4RFFVRkRMRk5CUVZFc09FTkJRWGxETzBWQlEzcEdPenRCUVVWSUxIVkNRVUZGTEVsQlFVa3NiMEpCUVZVN1JVRkRaQ3hWUVVGWkxEUkNRVUYzUWl4SlFVRkpMRU5CUVVNc1UwRkJVU3cyUTBGQmQwTTdSVUZEZUVZN08wRkJSVWdzZFVKQlFVVXNWMEZCVnl3eVFrRkJWVHRGUVVOeVFpeFZRVUZaTERSQ1FVRjNRaXhKUVVGSkxFTkJRVU1zVTBGQlVTeHZSRUZCSzBNN1JVRkRMMFk3TzBGQlJVZ3NkVUpCUVVVc1QwRkJUeXgxUWtGQlZUdEZRVU5xUWl4VlFVRlpMRFJDUVVGM1FpeEpRVUZKTEVOQlFVTXNVMEZCVVN4blJFRkJNa003UlVGRE0wWTdPMEZCUlVnc2RVSkJRVVVzVlVGQlZTd3dRa0ZCVlR0RlFVTndRaXhWUVVGWkxEUkNRVUYzUWl4SlFVRkpMRU5CUVVNc1UwRkJVU3h0UkVGQk9FTTdSVUZET1VZN08wRkJSVWdzZFVKQlFVVXNVVUZCVVN4M1FrRkJWVHRGUVVOc1FpeFZRVUZaTERSQ1FVRjNRaXhKUVVGSkxFTkJRVU1zVTBGQlVTeHBSRUZCTkVNN1JVRkROVVk3TzBGQlJVZ3NkVUpCUVVVc1QwRkJUeXgxUWtGQlZUdEZRVU5xUWl4VlFVRlpMRFJDUVVGM1FpeEpRVUZKTEVOQlFVTXNVMEZCVVN4blJFRkJNa003UlVGRE0wWTdPMEZCUlVnc2RVSkJRVVVzVFVGQlRTeHpRa0ZCVlR0RlFVTm9RaXhWUVVGWkxFTkJRVU1zZVVaQlFYbEdMRVZCUVVNN1JVRkRkRWM3TzBGQlJVZ3NkVUpCUVVVc1QwRkJUeXgxUWtGQlZUdEZRVU5xUWl4VlFVRlpMRFJDUVVGM1FpeEpRVUZKTEVOQlFVTXNVMEZCVVN4blJFRkJNa003UTBGRE0wWTdPMEZEYWtsSU96dEJRVk5CTEZOQlFWTXNZVUZCWVN4RlFVRkZMRXRCUVVzc1JVRkJVeXhMUVVGM1FpeEZRVUZuUWpzclFrRkJia01zUjBGQmFVSTdPMFZCUXpGRUxFdEJRVXNzUTBGQlF5eEpRVUZKTEVOQlFVTXNTMEZCU3l4RlFVRkRPenRGUVVWcVFpeEpRVUZKTEV0QlFVc3NRMEZCUXl4UFFVRlBMRU5CUVVNc1MwRkJTeXhEUVVGRExGRkJRVkVzUTBGQlF5eEZRVUZGTzBsQlEycERMRXRCUVVzc1EwRkJReXhSUVVGUkxFTkJRVU1zVDBGQlR5eFhRVUZGTEZWQlFWVXNSVUZCUlR0TlFVTnNReXhoUVVGaExFTkJRVU1zVlVGQlZTeEZRVUZGTEV0QlFVc3NSVUZCUXp0TFFVTnFReXhGUVVGRE8wZEJRMGc3TzBWQlJVUXNTVUZCU1N4TFFVRkxMRU5CUVVNc1MwRkJTeXhGUVVGRk8wbEJRMllzWVVGQllTeERRVUZETEV0QlFVc3NRMEZCUXl4TFFVRkxMRU5CUVVNc1RVRkJUU3hGUVVGRkxFdEJRVXNzUlVGQlF6dEhRVU42UXpzN1JVRkZSQ3hQUVVGUExFdEJRVXM3UTBGRFlqczdRVUZGUkN4VFFVRlRMRzlDUVVGdlFpeEZRVUZGTEUxQlFVMHNSVUZCT0VJN1JVRkRha1VzVDBGQlR5eE5RVUZOTEVOQlFVTXNUVUZCVFN4WFFVRkZMRXRCUVVzc1JVRkJSU3hMUVVGTExFVkJRVVVzVTBGQlJ5eExRVUZMTEV0QlFVc3NUVUZCVFN4RFFVRkRMRk5CUVZNc1YwRkJReXhOUVVGTExGTkJRVWNzUzBGQlN5eERRVUZETEVkQlFVY3NTMEZCU3l4SlFVRkpMRU5CUVVNc1RVRkJSeXhKUVVGRExFTkJRVU03UTBGRGJrYzdPMEZCUlVRc1UwRkJVeXhqUVVGakxFVkJRVVVzU1VGQlNTeEZRVUZUTEU5QlFVOHNSVUZCYlVJN1JVRkRPVVFzVDBGQlR5eEpRVUZKTEVOQlFVTXNTVUZCU1N4SlFVRkpMRWxCUVVrc1EwRkJReXhKUVVGSkxFTkJRVU1zUjBGQlJ5eExRVUZMTEU5QlFVODdRMEZET1VNN08wRkJSVVFzVTBGQlV5eGxRVUZsTEVWQlFVVXNTMEZCU3l4RlFVRlRMRTlCUVU4c1JVRkJkMEk3UlVGRGNrVkJMRWxCUVUwc1MwRkJTeXhIUVVGSExHRkJRV0VzUTBGQlF5eExRVUZMTEVWQlFVTTdSVUZEYkVOQkxFbEJRVTBzWjBKQlFXZENMRWRCUVVjc1MwRkJTeXhEUVVGRExFMUJRVTBzVjBGQlF5eE5RVUZMTEZOQlFVY3NZMEZCWXl4RFFVRkRMRWxCUVVrc1JVRkJSU3hQUVVGUExFbEJRVU1zUlVGQlF6czdPMFZCUnpWRlFTeEpRVUZOTEhOQ1FVRnpRaXhIUVVGSExHZENRVUZuUWl4RFFVRkRMRTFCUVUwc1YwRkJReXhOUVVGTE8wbEJRekZFTEVOQlFVTXNRMEZCUXl4TFFVRkxMRU5CUVVNc1QwRkJUeXhEUVVGRExFdEJRVXNzUTBGQlF5eEpRVUZKTEVOQlFVTXNTVUZCU1N4RFFVRkRMRWRCUVVjc1EwRkJRenROUVVOeVF5eEZRVUZETzBWQlEwWXNUMEZCVHl4dlFrRkJiMElzUTBGQlF5eHpRa0ZCYzBJc1EwRkJRenREUVVOd1JEczdRVUZGUkN4VFFVRlRMRzFDUVVGdFFpeEZRVUZGTEVsQlFVa3NSVUZCVXl4UlFVRlJMRVZCUVcxQ08wVkJRM0JGTEU5QlFVOHNTVUZCU1N4RFFVRkRMRWRCUVVjc1NVRkJTU3hKUVVGSkxFTkJRVU1zUjBGQlJ5eERRVUZETEZsQlFWa3NTVUZCU1N4SlFVRkpMRU5CUVVNc1IwRkJSeXhEUVVGRExFOUJRVThzUTBGQlF5eFJRVUZSTEVOQlFVTTdRMEZEZGtVN08wRkJSVVFzVTBGQlV5eHZRa0ZCYjBJN1JVRkRNMElzUzBGQlN6dEZRVU5NTEZGQlFWRTdSVUZEVFR0RlFVTmtRU3hKUVVGTkxFdEJRVXNzUjBGQlJ5eGhRVUZoTEVOQlFVTXNTMEZCU3l4RlFVRkRPMFZCUTJ4RFFTeEpRVUZOTEdGQlFXRXNSMEZCUnl4TFFVRkxMRU5CUVVNc1RVRkJUU3hYUVVGRExFMUJRVXM3U1VGRGRFTXNiVUpCUVcxQ0xFTkJRVU1zU1VGQlNTeEZRVUZGTEZGQlFWRXNRMEZCUXp0TlFVTndReXhGUVVGRE8wVkJRMFlzVDBGQlR5eHZRa0ZCYjBJc1EwRkJReXhoUVVGaExFTkJRVU03UTBGRE0wTTdPMEZCUlVRc1FVRkJaU3hUUVVGVExGVkJRVlU3UlVGRGFFTXNTMEZCU3p0RlFVTk1MRVZCUVVVN1JVRkRSaXhaUVVGWk8wVkJRMW9zVVVGQlVUdEZRVU5OTzBWQlEyUXNTVUZCU1N4WlFVRlpMRXRCUVVzc1dVRkJXU3hGUVVGRk8wbEJRMnBETEVsQlFVa3NRMEZCUXl4RlFVRkZMRVZCUVVVN1RVRkRVQ3hWUVVGVkxFTkJRVU1zTWtSQlFUSkVMRVZCUVVNN1MwRkRlRVU3TzBsQlJVUXNUMEZCVHl4bFFVRmxMRU5CUVVNc1MwRkJTeXhGUVVGRkxGRkJRVkVzUTBGQlF5eEhRVUZITEVOQlFVTTdSMEZETlVNN08wVkJSVVFzVDBGQlR5eHZRa0ZCYjBJc1EwRkJReXhMUVVGTExFVkJRVVVzVVVGQlVTeERRVUZETzBOQlF6ZERPenRCUXpGRlJEczdRVUZGUVN4QlFVRmxMRk5CUVZNc1dVRkJXVHRGUVVOc1F5eFBRVUZQTzBWQlExQXNVVUZCVVR0RlFVTk5PMFZCUTJSQkxFbEJRVTBzUzBGQlN5eEhRVUZITEVkQlFVVTdSVUZEYUVJc1NVRkJTU3hEUVVGRExFOUJRVThzU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4blFrRkJaMElzU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4UFFVRlBMRVZCUVVVN1NVRkROMFFzVDBGQlR5eExRVUZMTzBkQlEySTdPMFZCUlVRc1NVRkJTU3hQUVVGUExFTkJRVU1zVDBGQlR5eERRVUZETEZGQlFWRXNRMEZCUXl4RlFVRkZPMGxCUXpkQ0xFdEJRVXNzUTBGQlF5eEpRVUZKTEVOQlFVTXNUMEZCVHl4RlFVRkRPMGRCUTNCQ096dEZRVVZFTEU5QlFVOHNTMEZCU3l4RFFVRkRMRTFCUVUwc1EwRkJReXhGUVVGRkxFTkJRVU1zUzBGQlN5eERRVUZETEVsQlFVa3NRMEZCUXl4UFFVRlBMRU5CUVVNc1owSkJRV2RDTEVOQlFVTXNVVUZCVVN4RFFVRkRMRU5CUVVNc1EwRkJRenREUVVOMlJUczdRVU5vUWtRN08wRkJZMEVzUVVGQlpTeFRRVUZUTEVsQlFVazdSVUZETVVJc1JVRkJSVHRGUVVOR0xFdEJRVXM3UlVGRFRDeFBRVUZQTzBWQlExQXNVVUZCVVR0RlFVTnJRanRGUVVNeFFrRXNTVUZCVFN4WlFVRlpMRWRCUVVjc2MwSkJRWE5DTEVOQlFVTXNVVUZCVVN4RlFVRkZMRTFCUVUwc1JVRkJRenM3UlVGRk4wUXNTVUZCU1N4RFFVRkRMRXRCUVVzc1NVRkJTU3hEUVVGRExFVkJRVVVzU1VGQlNTeFpRVUZaTEV0QlFVc3NXVUZCV1N4RlFVRkZPMGxCUTJ4RUxGVkJRVlVzUTBGQlF5dzRTVUZCT0Vrc1JVRkJRenRIUVVNelNqczdSVUZGUkN4SlFVRkpMRmxCUVZrc1MwRkJTeXhyUWtGQmEwSXNTVUZCU1N4WlFVRlpMRXRCUVVzc1lVRkJZU3hGUVVGRk8wbEJRM3BGUVN4SlFVRk5MRWxCUVVrc1IwRkJSeXhGUVVGRkxFbEJRVWtzVFVGQlN6dEpRVU40UWl4SlFVRkpMRU5CUVVNc1NVRkJTU3hGUVVGRk8wMUJRMVFzVDBGQlR5eEZRVUZGTzB0QlExWTdTVUZEUkN4UFFVRlBMR2xDUVVGcFFpeERRVUZETEVsQlFVa3NSVUZCUlN4WlFVRlpMRVZCUVVVc1VVRkJVU3hEUVVGRE8wZEJRM1pFT3p0RlFVVkVMRWxCUVVrc1JVRkJSU3hKUVVGSkxFVkJRVVVzUTBGQlF5eExRVUZMTEVsQlFVa3NVVUZCVVN4RFFVRkRMRWRCUVVjc1NVRkJTU3hGUVVGRkxFTkJRVU1zUzBGQlN5eEpRVUZKTEVWQlFVVXNRMEZCUXl4TFFVRkxMRU5CUVVNc1VVRkJVU3hEUVVGRExFZEJRVWNzUTBGQlF5eFpRVUZaTEVkQlFVY3NSVUZCUlR0SlFVTjJSaXhQUVVGUExFTkJRVU1zUlVGQlJTeERRVUZETEV0QlFVc3NRMEZCUXl4UlFVRlJMRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU03UjBGRGFFTTdPMFZCUlVRc1NVRkJTU3hMUVVGTExFVkJRVVU3U1VGRFZFRXNTVUZCVFN4TFFVRkxMRWRCUVVjc1ZVRkJWU3hEUVVGRExFdEJRVXNzUlVGQlJTeEZRVUZGTEVWQlFVVXNXVUZCV1N4RlFVRkZMRkZCUVZFc1JVRkJRenRKUVVNelJDeEpRVUZKTEZsQlFWa3NTMEZCU3l4WlFVRlpMRVZCUVVVN1RVRkRha01zVDBGQlR5eExRVUZMTzB0QlEySTdTVUZEUkN4UFFVRlBMRXRCUVVzc1EwRkJReXhOUVVGTkxFZEJRVWNzUTBGQlF5eEhRVUZITEV0QlFVc3NSMEZCUnl4WlFVRlpMRU5CUVVNc1QwRkJUeXhGUVVGRkxGRkJRVkVzUTBGQlF6dEhRVU5zUlRzN1JVRkZSQ3hQUVVGUExGbEJRVmtzUTBGQlF5eFBRVUZQTEVWQlFVVXNVVUZCVVN4RFFVRkRPME5CUTNaRE96dEJReTlEUkRzN1FVRk5RU3hCUVVGbExGTkJRVk1zWVVGQllUdEZRVU51UXl4SlFVRkpPMFZCUTBvc1QwRkJUenRGUVVOUU8wVkJRMEVzVDBGQlR5eEpRVUZKTEZsQlFWa3NSMEZCUnp0TlFVTjBRaXhKUVVGSkxGVkJRVlVzUTBGQlF5eEpRVUZKTEVWQlFVVXNUMEZCVHl4RFFVRkRPMDFCUXpkQ0xFbEJRVWtzVDBGQlR5eERRVUZETEVsQlFVa3NSVUZCUlN4UFFVRlBMRU5CUVVNN1EwRkRMMEk3TzBGRFlrUkRMRWxCUVVrc1EwRkJReXhIUVVGSExFVkJRVU03TzBGQlJWUXNVMEZCVXl4VFFVRlRMRVZCUVVVc1QwRkJUeXhGUVVGRk8wVkJRek5DTEU5QlFVOHNRMEZCUXl4SlFVRkpMRU5CUVVNc1QwRkJUeXhYUVVGRExFdEJRVWs3U1VGRGRrSXNTVUZCU1N4SFFVRkhMRU5CUVVNc1UwRkJVeXhMUVVGTExFTkJRVU1zUlVGQlJUdE5RVU4yUWl4TlFVRk5PMHRCUTFBN1NVRkRSQ3hIUVVGSExFTkJRVU1zVTBGQlV5eEhRVUZITEVWQlFVTTdTVUZEYWtJc1IwRkJSeXhEUVVGRExFbEJRVWtzUTBGQlF5eFBRVUZQTEVOQlFVTXNVMEZCVXl4RlFVRkRPMGxCUXpOQ0xFZEJRVWNzUTBGQlF5eEpRVUZKTEVkQlFVY3NSMEZCUnl4RFFVRkRMRWxCUVVrc1EwRkJReXhKUVVGSkxGZEJRVVVzUTBGQlF5eEZRVUZGTEVOQlFVTXNSVUZCUlN4VFFVRkhMRU5CUVVNc1EwRkJReXhGUVVGRkxFZEJRVWNzUTBGQlF5eERRVUZETEV0QlFVVXNSVUZCUXp0SFFVTm9SQ3hGUVVGRE8wTkJRMGc3TzBGQlJVUXNVMEZCVXl4bFFVRmxMRVZCUVVVc1JVRkJSU3hGUVVGRk8wVkJRelZDTEVsQlFVa3NSVUZCUlN4RFFVRkRMRk5CUVZNc1JVRkJSVHRKUVVOb1FpeEZRVUZGTEVOQlFVTXNVMEZCVXl4RFFVRkRMRTlCUVU4c1EwRkJReXhUUVVGVExFVkJRVU03UjBGRGFFTTdPMFZCUlVRc1NVRkJTU3hGUVVGRkxFTkJRVU1zYVVKQlFXbENMRVZCUVVVN1NVRkRlRUlzVFVGQlRTeERRVUZETEVsQlFVa3NRMEZCUXl4RlFVRkZMRU5CUVVNc2FVSkJRV2xDTEVOQlFVTXNRMEZCUXl4UFFVRlBMRmRCUVVVc1pVRkJaU3hGUVVGRk8wMUJRekZFTEZOQlFWTXNRMEZCUXl4RlFVRkZMRU5CUVVNc2FVSkJRV2xDTEVOQlFVTXNaVUZCWlN4RFFVRkRMRVZCUVVNN1MwRkRha1FzUlVGQlF6dEhRVU5JT3p0RlFVVkVMRk5CUVZNc1EwRkJReXhGUVVGRkxFTkJRVU1zVVVGQlVTeEZRVUZET3p0RlFVVjBRaXhGUVVGRkxFTkJRVU1zVTBGQlV5eERRVUZETEU5QlFVOHNRMEZCUXl4bFFVRmxMRVZCUVVNN1EwRkRkRU03TzBGQlJVUXNRVUZCVHl4VFFVRlRMR0ZCUVdFc1JVRkJSU3hGUVVGRkxFVkJRVVU3UlVGRGFrTXNaVUZCWlN4RFFVRkRMRVZCUVVVc1JVRkJRenRGUVVOdVFpeERRVUZETEVkQlFVVTdRMEZEU2pzN1FVTm9RMFE3TzBGQk1rSkJMRWxCUVhGQ0xFOUJRVThzUjBGWk1VSXNaMEpCUVZjc1JVRkJSU3hKUVVGSkxFVkJRVzFDTEU5QlFVOHNSVUZCYTBJN1JVRkROMFFzU1VGQlRTeEpRVUZKTEZsQlFWa3NUMEZCVHl4RlFVRkZPMGxCUXpkQ0xFbEJRVTBzUTBGQlF5eFBRVUZQTEVkQlFVY3NTMEZCU1R0SlFVTnlRaXhKUVVGTkxFTkJRVU1zUzBGQlN5eEhRVUZITEV0QlFVazdSMEZEYkVJc1RVRkJUVHRKUVVOUUxFbEJRVTBzUTBGQlF5eExRVUZMTEVkQlFVY3NTMEZCU1R0SlFVTnVRaXhKUVVGTkxFTkJRVU1zVDBGQlR5eEhRVUZITEVsQlFVa3NRMEZCUXl4SlFVRkhPMGRCUTNoQ08wVkJRMGdzU1VGQlRTeEpRVUZKTEVOQlFVTXNTMEZCU3l4TFFVRkxMRWxCUVVrc1EwRkJReXhMUVVGTExFTkJRVU1zYTBKQlFXdENMRU5CUVVNc1NVRkJTU3hKUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZETEdsQ1FVRnBRaXhEUVVGRExFVkJRVVU3U1VGRGNFWXNTVUZCVFN4RFFVRkRMSEZDUVVGeFFpeEhRVUZITEV0QlFVazdSMEZEYkVNN1JVRkRTQ3hKUVVGTkxFTkJRVU1zVDBGQlR5eEhRVUZITEZGQlFVODdSVUZEZUVJc1NVRkJUU3hEUVVGRExFOUJRVThzUjBGQlJ5eE5RVUZOTEVkQlFVa3NSMEZCUnl4RFFVRkRMRTlCUVU4c1EwRkJReXhMUVVGTExFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTXNRMEZCUXl4WlFVRkxMRWRCUVVjc1EwRkJReXhQUVVGUExFTkJRVU1zUzBGQlN5eERRVUZETEVkQlFVY3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhKUVVGSE8wVkJRMjVHT3p0QlFVVklMR3RDUVVGRkxFVkJRVVVzYTBKQlFVazdSVUZEVGl4VlFVRlpMRU5CUVVNc2RVTkJRWFZETEVWQlFVTTdSVUZEY0VRN096czdPMEZCUzBnc2EwSkJRVVVzVlVGQlZTd3dRa0ZCWjBNN1JVRkRNVU1zU1VGQlVTeFZRVUZWTEVkQlFVY3NTVUZCU1N4RFFVRkRMRTlCUVU4c1EwRkJReXhYUVVGVk8wVkJRelZETEVsQlFWRXNXVUZCV1N4SFFVRkhMRWRCUVVVN1JVRkRla0lzUzBGQlQwRXNTVUZCU1N4RFFVRkRMRWRCUVVjc1EwRkJReXhGUVVGRkxFTkJRVU1zUjBGQlJ5eFZRVUZWTEVOQlFVTXNUVUZCVFN4RlFVRkZMRU5CUVVNc1JVRkJSU3hGUVVGRk8wbEJRelZETEVsQlFWRXNSMEZCUnl4SFFVRkhMRlZCUVZVc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eEZRVUZETzBsQlEyaERMRmxCUVdNc1EwRkJReXhIUVVGSExFTkJRVU1zVTBGQlV5eERRVUZETEVkQlFVY3NSMEZCUnl4RFFVRkRMRTFCUVVzN1IwRkRlRU03UlVGRFNDeFBRVUZUTEZsQlFWazdSVUZEY0VJN096czdPMEZCUzBnc2EwSkJRVVVzVDBGQlR5eDFRa0ZCYlVJN096czdSVUZGTVVJc1NVRkJVU3hUUVVGVExFZEJRVWNzU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4WlFVRlpMRU5CUVVNc1QwRkJUeXhGUVVGRE8wVkJRM1JFTEVsQlFVMHNUMEZCVHl4SFFVRkhMRk5CUVZNc1IwRkJSeXhUUVVGVExFTkJRVU1zUzBGQlN5eERRVUZETEVkQlFVY3NRMEZCUXl4SFFVRkhMRWRCUVVVN08wVkJSWEpFTEVsQlFVMHNTVUZCU1N4RFFVRkRMRVZCUVVVc1NVRkJTU3hKUVVGSkxFTkJRVU1zUlVGQlJTeERRVUZETEUxQlFVMHNSVUZCUlR0SlFVTXZRaXhKUVVGUkxHOUNRVUZ2UWl4SFFVRkhMRWRCUVVVN1NVRkRha01zU1VGQlRTeFpRVUZYTzBsQlEycENMRTFCUVZFc1EwRkJReXhKUVVGSkxFTkJRVU1zU1VGQlNTeERRVUZETEVWQlFVVXNRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJReXhQUVVGUExGZEJRVVVzUjBGQlJ5eEZRVUZGT3p0TlFVVXhReXhYUVVGaExFZEJRVWRGTEUxQlFVa3NRMEZCUXl4RlFVRkZMRU5CUVVNc1RVRkJUU3hEUVVGRExFZEJRVWNzUlVGQlF6czdPMDFCUjI1RExGZEJRV0VzUjBGQlJ5eFhRVUZYTEVOQlFVTXNTMEZCU3l4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlF6dE5RVU42UXl4dlFrRkJjMElzUTBGQlF5eFhRVUZYTEVOQlFVTXNSMEZCUnl4SlFVRkhPMHRCUTNoRExFVkJRVU03U1VGRFNpeFBRVUZUTEVkQlFVY3NUMEZCVHl4RFFVRkRMRWRCUVVjc1YwRkJReXhYUVVGVkxGTkJRVWNzYjBKQlFXOUNMRU5CUVVNc1UwRkJVeXhEUVVGRExFbEJRVWtzV1VGQlV5eEZRVUZETzBkQlEycEdPMFZCUTBnc1QwRkJVeXhQUVVGUE8wVkJRMlk3T3pzN08wRkJTMGdzYTBKQlFVVXNVVUZCVVN4elFrRkJSU3hSUVVGUkxFVkJRVms3UlVGRE9VSXNTVUZCVVN4WlFVRlpMRWRCUVVjc2MwSkJRWE5DTEVOQlFVTXNVVUZCVVN4RlFVRkZMRlZCUVZVc1JVRkJRenRGUVVOdVJTeEpRVUZSTEV0QlFVc3NSMEZCUjBNc1NVRkJUeXhEUVVGRExFbEJRVWtzUTBGQlF5eEZRVUZGTEVWQlFVVXNTVUZCU1N4RFFVRkRMRXRCUVVzc1JVRkJSU3hKUVVGSkxFTkJRVU1zVDBGQlR5eEZRVUZGTEZGQlFWRXNSVUZCUXp0RlFVTndSU3hKUVVGUkxFVkJRVVVzUjBGQlJ5eFpRVUZaTEV0QlFVc3NXVUZCV1N4SFFVRkhMRXRCUVVzc1IwRkJSeXhKUVVGSkxFTkJRVU1zUlVGQlJTeERRVUZETEZGQlFWRXNSVUZCUXp0RlFVTjBSU3hQUVVGVExFdEJRVXNzUTBGQlF5eE5RVUZOTEVkQlFVY3NRMEZCUXl4SlFVRkpMRVZCUVVVN1JVRkRPVUk3T3pzN08wRkJTMGdzYTBKQlFVVXNUMEZCVHl4eFFrRkJSU3hMUVVGTExFVkJRVmM3UlVGRGVrSXNTVUZCVFN4RFFVRkRMRWxCUVVrc1EwRkJReXhSUVVGUkxFbEJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTXNSVUZCUlN4RlFVRkZPMGxCUTJoRExGVkJRVmtzUTBGQlF5eDNSRUZCZDBRc1JVRkJRenRIUVVOeVJUdEZRVU5JTEVsQlFVMHNTMEZCU3l4RlFVRkZPMGxCUTFnc1QwRkJVeXhKUVVGSkxFTkJRVU1zVVVGQlVTeERRVUZETEV0QlFVc3NRMEZCUXp0SFFVTTFRanRGUVVOSUxFOUJRVk1zU1VGQlNTeERRVUZETEZGQlFWRTdSVUZEY2tJN096czdPMEZCUzBnc2EwSkJRVVVzWTBGQll5dzRRa0ZCU1R0RlFVTnNRaXhKUVVGTkxFTkJRVU1zU1VGQlNTeERRVUZETEdWQlFXVXNTVUZCU1N4RFFVRkRMRWxCUVVrc1EwRkJReXhGUVVGRkxFVkJRVVU3U1VGRGRrTXNWVUZCV1N4RFFVRkRMQ3RFUVVFclJDeEZRVUZETzBkQlF6VkZPMFZCUTBnc1QwRkJVeXhKUVVGSkxFTkJRVU1zWlVGQlpUdEZRVU0xUWpzN096czdRVUZMU0N4clFrRkJSU3hOUVVGTkxITkNRVUZoTzBWQlEyNUNMRWxCUVUwc1NVRkJTU3hEUVVGRExFVkJRVVVzUlVGQlJUdEpRVU5pTEU5QlFWTXNRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhGUVVGRkxFbEJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTXNSVUZCUlN4RFFVRkRMRmxCUVZrN1IwRkRNVU03UlVGRFNDeFBRVUZUTEVsQlFVazdSVUZEV2pzN1FVRkZTQ3hyUWtGQlJTeE5RVUZOTEhOQ1FVRkpPMFZCUTFZc1ZVRkJXU3hEUVVGRExESkRRVUV5UXl4RlFVRkRPMFZCUTNoRU96czdPenRCUVV0SUxHdENRVUZGTEU5QlFVOHNkVUpCUVdFN1JVRkRjRUlzU1VGQlRTeERRVUZETEhGR1FVRnhSaXhGUVVGRE96dEZRVVUzUml4SlFVRk5MRTlCUVU4c1IwRkJSeXhKUVVGSkxFTkJRVU1zVVVGQlR6czdSVUZGTlVJc1NVRkJUU3hEUVVGRExFOUJRVThzUlVGQlJUdEpRVU5rTEU5QlFWTXNTMEZCU3p0SFFVTmlPenRGUVVWSUxFOUJRVk1zVDBGQlR5eEZRVUZGTzBsQlEyaENMRWxCUVUwc1QwRkJUeXhEUVVGRExFdEJRVXNzUzBGQlN5eFBRVUZQTEVOQlFVTXNTMEZCU3l4RFFVRkRMRlZCUVZVc1MwRkJTeXhSUVVGUkxFbEJRVWtzVDBGQlR5eERRVUZETEV0QlFVc3NRMEZCUXl4UFFVRlBMRXRCUVVzc1RVRkJUU3hEUVVGRExFVkJRVVU3VFVGRGJFY3NUMEZCVXl4TFFVRkxPMHRCUTJJN1NVRkRTQ3hQUVVGVExFZEJRVWNzVDBGQlR5eERRVUZETEdOQlFXRTdSMEZEYUVNN08wVkJSVWdzVDBGQlV5eEpRVUZKTzBWQlExbzdPenM3TzBGQlMwZ3NhMEpCUVVVc1dVRkJXU3d3UWtGQlJTeFRRVUZUTEVWQlFWVXNTMEZCU3l4RlFVRlZPMFZCUTJoRUxFbEJRVTBzUTBGQlF5dzRTa0ZCT0Vvc1JVRkJRenM3UlVGRmRFc3NTVUZCVFN4UFFVRlBMRk5CUVZNc1MwRkJTeXhSUVVGUkxFVkJRVVU3U1VGRGJrTXNWVUZCV1N4RFFVRkRMRFpFUVVFMlJDeEZRVUZETzBkQlF6RkZPenRGUVVWSUxFbEJRVTBzVDBGQlR5eExRVUZMTEV0QlFVc3NVVUZCVVN4RlFVRkZPMGxCUXk5Q0xGVkJRVmtzUTBGQlF5eDVSRUZCZVVRc1JVRkJRenRIUVVOMFJUczdSVUZGU0N4UFFVRlRMRU5CUVVNc1JVRkJSU3hKUVVGSkxFTkJRVU1zVDBGQlR5eEpRVUZKTEVsQlFVa3NRMEZCUXl4UFFVRlBMRU5CUVVNc1dVRkJXU3hEUVVGRExGTkJRVk1zUTBGQlF5eExRVUZMTEV0QlFVc3NRMEZCUXp0RlFVTXhSVHM3T3pzN1FVRkxTQ3hyUWtGQlJTeFJRVUZSTEhOQ1FVRkZMRk5CUVZNc1JVRkJWVHM3TzBWQlF6ZENMRWxCUVUwc1EwRkJReXh2U2tGQmIwb3NSVUZCUXp0RlFVTTFTaXhKUVVGTkxGZEJRVmNzUjBGQlJ5eFZRVUZUT3p0RlFVVTNRaXhKUVVGTkxFOUJRVThzVjBGQlZ5eExRVUZMTEZGQlFWRXNSVUZCUlR0SlFVTnlReXhWUVVGWkxFTkJRVU1zTkVOQlFUUkRMRVZCUVVNN1IwRkRla1E3T3p0RlFVZElMRWxCUVUwc1NVRkJTU3hEUVVGRExFVkJRVVVzU1VGQlNTeEpRVUZKTEVOQlFVTXNSVUZCUlN4RFFVRkRMRTFCUVUwc1NVRkJTU3hKUVVGSkxFTkJRVU1zUlVGQlJTeERRVUZETEUxQlFVMHNRMEZCUXl4WFFVRlhMRU5CUVVNc1JVRkJSVHRKUVVNNVJDeFhRVUZoTEVkQlFVY3NTVUZCU1N4RFFVRkRMRVZCUVVVc1EwRkJReXhOUVVGTkxFTkJRVU1zVjBGQlZ5eEZRVUZETzBkQlF6RkRPenRGUVVWSUxFbEJRVkVzYTBKQlFXdENMRWRCUVVjc1YwRkJWenRMUVVOdVF5eExRVUZMTEVOQlFVTXNSMEZCUnl4RFFVRkRPMHRCUTFZc1MwRkJTeXhYUVVGRExGRkJRVThzVTBGQlIwUXNUVUZCU1N4RFFVRkRMRTlCUVU4c1EwRkJReXhUUVVGVExFTkJRVU1zVVVGQlVTeERRVUZETEUxQlFVMHNTVUZCUXl4RlFVRkRPenRGUVVVM1JDeFBRVUZUTEVOQlFVTXNSVUZCUlN4SlFVRkpMRU5CUVVNc1QwRkJUeXhKUVVGSkxHdENRVUZyUWl4RFFVRkRPMFZCUXpsRE96czdPenRCUVV0SUxHdENRVUZGTEU5QlFVOHNjVUpCUVVVc1NVRkJTU3hGUVVGVkxFdEJRVXNzUlVGQlZUdEZRVU4wUXl4SlFVRk5MRU5CUVVNc0swbEJRU3RKTEVWQlFVTTdPMFZCUlhaS0xFbEJRVTBzUTBGQlF5eEpRVUZKTEVOQlFVTXNZMEZCWXl4RlFVRkZPMGxCUXpGQ0xGVkJRVmtzUTBGQlF5eHZSRUZCYjBRc1JVRkJRenRIUVVOcVJUdEZRVU5JTEVsQlFVMHNUMEZCVHl4SlFVRkpMRXRCUVVzc1VVRkJVU3hGUVVGRk8wbEJRemxDTEZWQlFWa3NRMEZCUXl4dFJFRkJiVVFzUlVGQlF6dEhRVU5vUlRzN08wVkJSMGdzU1VGQlRTeEpRVUZKTEVOQlFVTXNSVUZCUlN4SlFVRkpMRWxCUVVrc1EwRkJReXhGUVVGRkxFTkJRVU1zVVVGQlVTeEpRVUZKTEVsQlFVa3NRMEZCUXl4RlFVRkZMRU5CUVVNc1VVRkJVU3hEUVVGRExGTkJRVk1zU1VGQlNTeEpRVUZKTEVOQlFVTXNSVUZCUlN4RFFVRkRMRkZCUVZFc1EwRkJReXhUUVVGVExFTkJRVU1zU1VGQlNTeERRVUZETEV0QlFVc3NTMEZCU3l4RlFVRkZPMGxCUXpkSExFOUJRVk1zU1VGQlNUdEhRVU5hT3p0RlFVVklMRTlCUVZNc1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eEZRVUZGTEVsQlFVa3NRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhGUVVGRkxFTkJRVU1zVFVGQlRTeEpRVUZKTEVsQlFVa3NRMEZCUXl4RlFVRkZMRU5CUVVNc1RVRkJUU3hEUVVGRExFbEJRVWtzUTBGQlF5eExRVUZMTEV0QlFVczdSVUZEZGtVN096czdPMEZCUzBnc2EwSkJRVVVzVVVGQlVTeHpRa0ZCUlN4TFFVRkxMRVZCUVZVc1MwRkJTeXhGUVVGVk8wVkJRM2hETEVsQlFVMHNRMEZCUXl4M1IwRkJkMGNzUlVGQlF6czdSVUZGYUVnc1NVRkJUU3hQUVVGUExFdEJRVXNzUzBGQlN5eFJRVUZSTEVWQlFVVTdTVUZETDBJc1ZVRkJXU3hEUVVGRExIRkVRVUZ4UkN4RlFVRkRPMGRCUTJ4Rk96dEZRVVZJTEVsQlFVMHNUMEZCVHl4TFFVRkxMRXRCUVVzc1VVRkJVU3hGUVVGRk8wbEJReTlDTEZWQlFWa3NRMEZCUXl4dFJFRkJiVVFzUlVGQlF6dEhRVU5vUlRzN08wVkJSMGdzU1VGQlRTeFRRVUZUTEVOQlFVTXNVMEZCVXl4RFFVRkRMRkZCUVZFc1MwRkJTeXhUUVVGVExFTkJRVU1zVTBGQlV5eERRVUZETEZGQlFWRXNRMEZCUXl4VFFVRlRMRU5CUVVNc1NVRkJTU3hUUVVGVExFTkJRVU1zVTBGQlV5eERRVUZETEZGQlFWRXNRMEZCUXl4UFFVRlBMRU5CUVVNc1EwRkJReXhGUVVGRk8wbEJRM2hJTEU5QlFWTXNRMEZCUXl4SlFVRkpMRU5CUVVNc0swWkJRU3RHTEVWQlFVTTdSMEZET1VjN1JVRkRTQ3hKUVVGUkxFbEJRVWtzUjBGQlJ5eFJRVUZSTEVOQlFVTXNZVUZCWVN4RFFVRkRMRTFCUVUwc1JVRkJRenRGUVVNM1F5eEpRVUZSTEZkQlFWY3NSMEZCUnl4UlFVRlJMRU5CUVVNc1lVRkJZU3hEUVVGRExFdEJRVXNzUlVGQlF6czdSVUZGYmtRc1NVRkJUU3hGUVVGRkxFbEJRVWtzV1VGQldTeFBRVUZQTEVOQlFVTXNSVUZCUlR0SlFVTm9ReXhQUVVGVExFdEJRVXM3UjBGRFlqdEZRVU5JTEVsQlFWRXNVVUZCVVN4SFFVRkhMRWxCUVVrc1EwRkJReXhaUVVGWkxFTkJRVU1zVjBGQlZ5eEZRVUZGTEVsQlFVa3NSVUZCUXpzN1JVRkZka1FzVjBGQllTeERRVUZETEV0QlFVc3NRMEZCUXl4TFFVRkxMRU5CUVVNc1IwRkJSeXhOUVVGTE96dEZRVVZzUXl4SlFVRk5MRU5CUVVNc1NVRkJTU3hEUVVGRExFOUJRVThzUTBGQlF5eHJRa0ZCYTBJc1MwRkJTeXhKUVVGSkxFTkJRVU1zUlVGQlJTeEpRVUZKTEVsQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1JVRkJSVHM3U1VGRmFrVXNTVUZCVVN4RlFVRkZMRWRCUVVjc1NVRkJTU3hEUVVGRExFVkJRVVVzU1VGQlNTeEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRMRTlCUVU4c1EwRkJReXhOUVVGTE8wbEJRMmhFTEVsQlFVMHNRMEZCUXl4WlFVRlpMRU5CUVVNc1JVRkJSU3hEUVVGRExFdEJRVXNzUTBGQlF5eE5RVUZOTEVOQlFVTXNSMEZCUnl4RlFVRkZMRWxCUVVrc1JVRkJRenRIUVVNM1F6czdSVUZGU0N4SlFVRlJMRTlCUVU4c1IwRkJSeXhOUVVGTkxFTkJRVU1zWjBKQlFXZENMRU5CUVVNc1NVRkJTU3hEUVVGRExFOUJRVThzUTBGQlF5eERRVUZETEV0QlFVc3NSVUZCUXp0RlFVTTVSQ3hKUVVGUkxHRkJRV0VzUjBGQlJ5eE5RVUZOTEVOQlFVTXNaMEpCUVdkQ0xFTkJRVU1zVVVGQlVTeERRVUZETEVOQlFVTXNTMEZCU3l4RlFVRkRPMFZCUTJoRkxFOUJRVk1zUTBGQlF5eEZRVUZGTEU5QlFVOHNTVUZCU1N4aFFVRmhMRWxCUVVrc1QwRkJUeXhMUVVGTExHRkJRV0VzUTBGQlF6dEZRVU5xUlRzN096czdRVUZMU0N4clFrRkJSU3hKUVVGSkxIRkNRVUZGTEZGQlFWRXNSVUZCYjBNN1JVRkRiRVFzU1VGQlVTeExRVUZMTEVkQlFVZERMRWxCUVU4c1EwRkJReXhKUVVGSkxFTkJRVU1zUlVGQlJTeEZRVUZGTEVsQlFVa3NRMEZCUXl4TFFVRkxMRVZCUVVVc1NVRkJTU3hEUVVGRExFOUJRVThzUlVGQlJTeFJRVUZSTEVWQlFVTTdSVUZEY0VVc1NVRkJUU3hMUVVGTExFTkJRVU1zVFVGQlRTeExRVUZMTEVOQlFVTXNSVUZCUlR0SlFVTjRRaXhKUVVGTkxGRkJRVkVzUTBGQlF5eEhRVUZITEVWQlFVVTdUVUZEYkVJc1QwRkJVeXhKUVVGSkxGbEJRVmtzWTBGQlV5eFJRVUZSTEVOQlFVTXNTVUZCUnl4VFFVRkpPMHRCUTJwRU8wbEJRMGdzVDBGQlV5eEpRVUZKTEZsQlFWa3NRMEZCUXl4UFFVRlBMRkZCUVZFc1MwRkJTeXhSUVVGUkxFZEJRVWNzVVVGQlVTeEhRVUZITEZkQlFWY3NRMEZCUXp0SFFVTXZSVHRGUVVOSUxFOUJRVk1zWVVGQllTeERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJSU3hKUVVGSkxFTkJRVU1zVDBGQlR5eERRVUZETzBWQlF6ZERPenM3T3p0QlFVdElMR3RDUVVGRkxFOUJRVThzZFVKQlFVVXNVVUZCVVN4RlFVRXdRanM3TzBWQlF6TkRMSE5DUVVGM1FpeERRVUZETEZGQlFWRXNSVUZCUlN4VFFVRlRMRVZCUVVNN1JVRkROME1zU1VGQlVTeExRVUZMTEVkQlFVZEJMRWxCUVU4c1EwRkJReXhKUVVGSkxFTkJRVU1zUlVGQlJTeEZRVUZGTEVsQlFVa3NRMEZCUXl4TFFVRkxMRVZCUVVVc1NVRkJTU3hEUVVGRExFOUJRVThzUlVGQlJTeFJRVUZSTEVWQlFVTTdSVUZEY0VVc1NVRkJVU3hSUVVGUkxFZEJRVWNzUzBGQlN5eERRVUZETEVkQlFVY3NWMEZCUXl4TlFVRkxMRk5CUXpsQ0xHRkJRV0VzUTBGQlF5eEpRVUZKTEVWQlFVVkVMRTFCUVVrc1EwRkJReXhQUVVGUExFbEJRVU03U1VGRGJFTTdSVUZEU0N4UFFVRlRMRWxCUVVrc1dVRkJXU3hEUVVGRExGRkJRVkVzUTBGQlF6dEZRVU5zUXpzN096czdRVUZMU0N4clFrRkJSU3hKUVVGSkxHOUNRVUZaTzBWQlEyaENMRTlCUVZNc1NVRkJTU3hEUVVGRExFOUJRVThzUTBGQlF5eFRRVUZUTzBWQlF6bENPenM3T3p0QlFVdElMR3RDUVVGRkxFVkJRVVVzWjBKQlFVVXNVVUZCVVN4RlFVRnhRanRGUVVOcVF5eEpRVUZSTEZsQlFWa3NSMEZCUnl4elFrRkJjMElzUTBGQlF5eFJRVUZSTEVWQlFVVXNTVUZCU1N4RlFVRkRPenRGUVVVM1JDeEpRVUZOTEZsQlFWa3NTMEZCU3l4aFFVRmhMRVZCUVVVN1NVRkRjRU1zU1VGQlRTeERRVUZETEVsQlFVa3NRMEZCUXl4RlFVRkZMRVZCUVVVN1RVRkRaQ3hQUVVGVExFdEJRVXM3UzBGRFlqdEpRVU5JTEU5QlFWTXNhVUpCUVdsQ0xFTkJRVU1zU1VGQlNTeERRVUZETEVWQlFVVXNSVUZCUlN4UlFVRlJMRU5CUVVNc1NVRkJTU3hEUVVGRE8wZEJRMnBFT3p0RlFVVklMRWxCUVUwc1dVRkJXU3hMUVVGTExHdENRVUZyUWl4RlFVRkZPMGxCUTNwRExFbEJRVTBzUTBGQlF5eEpRVUZKTEVOQlFVTXNSVUZCUlN4RlFVRkZPMDFCUTJRc1QwRkJVeXhMUVVGTE8wdEJRMkk3U1VGRFNDeEpRVUZOTEZGQlFWRXNRMEZCUXl4VlFVRlZMRVZCUVVVN1RVRkRla0lzVDBGQlV5d3JRa0ZCSzBJc1EwRkJReXhKUVVGSkxFTkJRVU1zUlVGQlJTeERRVUZETEUxQlFVMHNSVUZCUlN4UlFVRlJMRU5CUVVNc1MwRkJTeXhEUVVGRE8wdEJRM1pGTzBsQlEwZ3NUMEZCVXl4eFFrRkJjVUlzUTBGQlF5eEpRVUZKTEVOQlFVTXNSVUZCUlN4RlFVRkZMRkZCUVZFc1EwRkJRenRIUVVOb1JEczdSVUZGU0N4SlFVRk5MRmxCUVZrc1MwRkJTeXhaUVVGWkxFVkJRVVU3U1VGRGJrTXNWVUZCV1N4RFFVRkRMR3RFUVVGclJDeEZRVUZETzBkQlF5OUVPenRGUVVWSUxFbEJRVTBzVDBGQlR5eFJRVUZSTEV0QlFVc3NVVUZCVVN4RlFVRkZPMGxCUTJ4RExFOUJRVk1zUzBGQlN6dEhRVU5pT3p0RlFVVklMRTlCUVZNc1EwRkJReXhGUVVGRkxFbEJRVWtzUTBGQlF5eFBRVUZQTzBWQlEzaENMRWxCUVUwc1EwRkJReXhQUVVGUExFTkJRVU1zV1VGQldUdEZRVU16UWl4SlFVRk5MRU5CUVVNc1QwRkJUeXhEUVVGRExFOUJRVThzUTBGQlF5eFJRVUZSTEVOQlFVTXNRMEZCUXp0RlFVTm9RenM3T3pzN1FVRkxTQ3hyUWtGQlJTeFBRVUZQTEhWQ1FVRmhPMFZCUTNCQ0xFbEJRVTBzUTBGQlF5eEpRVUZKTEVOQlFVTXNTMEZCU3l4RlFVRkZPMGxCUTJwQ0xFOUJRVk1zU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4VFFVRlRMRXRCUVVzc1JVRkJSVHRIUVVOeVF6dEZRVU5JTEVsQlFVMHNTVUZCU1N4RFFVRkRMRXRCUVVzc1EwRkJReXhSUVVGUkxFVkJRVVU3U1VGRGVrSXNUMEZCVXl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExGRkJRVkVzUTBGQlF5eExRVUZMTEZkQlFVTXNUMEZCVFN4VFFVRkhMRXRCUVVzc1EwRkJReXhaUVVGVExFTkJRVU03UjBGRE0wUTdSVUZEU0N4UFFVRlRMRWxCUVVrc1EwRkJReXhMUVVGTExFTkJRVU1zVVVGQlVTeExRVUZMTEZOQlFWTXNTVUZCU1N4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExGRkJRVkVzUTBGQlF5eE5RVUZOTEV0QlFVc3NRMEZCUXp0RlFVTTNSVHM3T3pzN1FVRkxTQ3hyUWtGQlJTeFRRVUZUTEhsQ1FVRmhPMFZCUTNSQ0xFbEJRVTBzVDBGQlR5eEhRVUZITEVsQlFVa3NRMEZCUXl4UlFVRlBPenRGUVVVMVFpeEpRVUZOTEVOQlFVTXNUMEZCVHl4RlFVRkZPMGxCUTJRc1QwRkJVeXhMUVVGTE8wZEJRMkk3TzBWQlJVZ3NUMEZCVXl4UFFVRlBMRVZCUVVVN1NVRkRhRUlzU1VGQlRTeFBRVUZQTEVOQlFVTXNTMEZCU3l4TFFVRkxMRTlCUVU4c1EwRkJReXhMUVVGTExFTkJRVU1zVlVGQlZTeExRVUZMTEZGQlFWRXNTVUZCU1N4UFFVRlBMRU5CUVVNc1MwRkJTeXhEUVVGRExFOUJRVThzUzBGQlN5eE5RVUZOTEVOQlFVTXNSVUZCUlR0TlFVTnNSeXhQUVVGVExFdEJRVXM3UzBGRFlqdEpRVU5JTEU5QlFWTXNSMEZCUnl4UFFVRlBMRU5CUVVNc1kwRkJZVHRIUVVOb1F6czdSVUZGU0N4UFFVRlRMRWxCUVVrN1JVRkRXanM3T3pzN1FVRkxTQ3hyUWtGQlJTeGhRVUZoTERaQ1FVRmhPMFZCUXpGQ0xFOUJRVk1zUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4alFVRmpPMFZCUXpkQ096czdPenRCUVV0SUxHdENRVUZGTEVsQlFVa3NiMEpCUVZrN1JVRkRhRUlzU1VGQlRTeEpRVUZKTEVOQlFVTXNSVUZCUlN4RlFVRkZPMGxCUTJJc1QwRkJVeXhKUVVGSkxFTkJRVU1zUlVGQlJTeERRVUZETEZGQlFWRXNRMEZCUXl4SlFVRkpPMGRCUXpkQ096dEZRVVZJTEVsQlFVMHNRMEZCUXl4SlFVRkpMRU5CUVVNc1MwRkJTeXhGUVVGRk8wbEJRMnBDTEU5QlFWTXNTVUZCU1N4RFFVRkRMRTlCUVU4c1EwRkJReXhQUVVGUE8wZEJRelZDT3p0RlFVVklMRTlCUVZNc1NVRkJTU3hEUVVGRExFdEJRVXNzUTBGQlF5eEhRVUZITzBWQlEzUkNPenM3T3p0QlFVdElMR3RDUVVGRkxFdEJRVXNzY1VKQlFUWkNPMFZCUTJ4RExFbEJRVTBzU1VGQlNTeERRVUZETEhGQ1FVRnhRaXhGUVVGRk8wbEJRMmhETEZWQlFWa3NRMEZCUXl4eFJVRkJjVVVzUlVGQlF6dEhRVU5zUmp0RlFVTklMRWxCUVUwc1EwRkJReXhKUVVGSkxFTkJRVU1zUlVGQlJTeEZRVUZGTzBsQlEyUXNWVUZCV1N4RFFVRkRMR3RFUVVGclJDeEZRVUZETzBkQlF5OUVPenRGUVVWSUxFbEJRVTBzVDBGQlRUdEZRVU5hTEVsQlFVMHNTVUZCU1N4RFFVRkRMRVZCUVVVc1NVRkJTU3hKUVVGSkxFTkJRVU1zUlVGQlJTeERRVUZETEZGQlFWRXNTVUZCU1N4SlFVRkpMRU5CUVVNc1JVRkJSU3hEUVVGRExGRkJRVkVzUTBGQlF5eFRRVUZUTEVWQlFVVTdTVUZETDBRc1RVRkJVU3hIUVVGSExFbEJRVWtzUTBGQlF5eEZRVUZGTEVOQlFVTXNVVUZCVVN4RFFVRkRMRlZCUVZNN1IwRkRjRU1zVFVGQlRUczdTVUZGVUN4TlFVRlJMRWRCUVVjc1NVRkJTU3hEUVVGRExFVkJRVVVzUTBGQlF5eFBRVUZOTzBkQlEzaENPMFZCUTBnc1QwRkJVeXhOUVVGTkxFbEJRVWtzUlVGQlJUdEZRVU53UWpzN096czdRVUZMU0N4clFrRkJSU3hQUVVGUExIRkNRVUZGTEVsQlFVa3NSVUZCVlRzN08wVkJRM1pDTEVsQlFVMHNTVUZCU1N4RFFVRkRMSEZDUVVGeFFpeEZRVUZGTzBsQlEyaERMRlZCUVZrc1EwRkJReXcyUkVGQk5rUXNSVUZCUXp0SFFVTXhSVHM3UlVGRlNDeEpRVUZOTEVOQlFVTXNTVUZCU1N4RFFVRkRMRVZCUVVVc1JVRkJSVHRKUVVOa0xGVkJRVmtzUTBGQlF5eDNSRUZCZDBRc1JVRkJRenRIUVVOeVJUczdSVUZGU0N4TlFVRlJMRU5CUVVNc1NVRkJTU3hEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEU5QlFVOHNWMEZCUlN4SFFVRkhMRVZCUVVVN08wbEJSV2hETEUxQlFVMHNRMEZCUXl4RlFVRkZMRU5CUVVNc1NVRkJTU3hEUVVGRFFTeE5RVUZKTEVOQlFVTXNSVUZCUlN4RlFVRkZMRU5CUVVNc1IwRkJSeXhEUVVGRExFVkJRVVVzU1VGQlNTeERRVUZETEVkQlFVY3NRMEZCUXl4RlFVRkRPMGRCUTNoRExFVkJRVU03UlVGRFNEczdPenM3UVVGTFNDeHJRa0ZCUlN4WFFVRlhMSGxDUVVGRkxGRkJRVkVzUlVGQlZUczdPMFZCUXk5Q0xFbEJRVTBzUTBGQlF5eEpRVUZKTEVOQlFVTXNZMEZCWXl4RlFVRkZPMGxCUXpGQ0xGVkJRVmtzUTBGQlF5dzBSRUZCTkVRc1JVRkJRenRIUVVONlJUczdSVUZGU0N4SlFVRk5MRU5CUVVNc2IwdEJRVzlMTEVWQlFVTTdPMFZCUlRWTExFMUJRVkVzUTBGQlF5eEpRVUZKTEVOQlFVTXNVVUZCVVN4RFFVRkRMRU5CUVVNc1QwRkJUeXhYUVVGRkxFZEJRVWNzUlVGQlJUdEpRVU53UXl4SlFVRk5RU3hOUVVGSkxFTkJRVU1zVDBGQlR5eEhRVUZITEVkQlFVY3NSVUZCUlRzN1RVRkZlRUlzU1VGQlRTeERRVUZEUVN4TlFVRkpMRU5CUVVNc1JVRkJSU3hEUVVGRExHbENRVUZwUWl4RFFVRkRMRWRCUVVjc1EwRkJReXhGUVVGRk8xRkJRM0pETEZWQlFWa3NlVWhCUVhOSUxFZEJRVWNzTWtOQlFYTkRPMDlCUXpGTE96dE5RVVZJTEUxQlFVMHNRMEZCUXl4RlFVRkZMRU5CUVVNc2FVSkJRV2xDTEVOQlFVTXNSMEZCUnl4RFFVRkRMRU5CUVVNc1MwRkJTeXhIUVVGSExGRkJRVkVzUTBGQlF5eEhRVUZITEVWQlFVTTdPMDFCUlhSRUxFMUJRVTBzUTBGQlF5eEZRVUZGTEVOQlFVTXNhVUpCUVdsQ0xFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTXNUVUZCVFN4bFFVRk5MRk5CUVVjc1VVRkJVU3hEUVVGRExFZEJRVWNzUzBGQlF6dExRVU0xUkN4TlFVRk5PMDFCUTFBc1NVRkJUU3hQUVVGUExFZEJRVWNzVFVGQlN6czdUVUZGY2tJc1RVRkJUU3hEUVVGRExFVkJRVVVzUTBGQlF5eFRRVUZUTEVOQlFVTXNUMEZCVHl4WFFVRkRMRk5CUVZFN1VVRkRiRU1zU1VGQlRTeFBRVUZQTEVOQlFVTXNUVUZCVFN4RFFVRkRMRWxCUVVrc1NVRkJTU3hIUVVGSExFbEJRVWtzVDBGQlR5eERRVUZETEVWQlFVVXNRMEZCUXl4UlFVRlJMRU5CUVVNc1MwRkJTeXhEUVVGRExFOUJRVThzUlVGQlJUdFZRVU55UlN4UFFVRlRMRU5CUVVNc1JVRkJSU3hEUVVGRExGRkJRVkVzUTBGQlF5eExRVUZMTEVOQlFVTXNUMEZCVHl4SFFVRkhMR3RDUVVNdlFpeFBRVUZQTEVOQlFVTXNSVUZCUlN4RFFVRkRMRkZCUVZFc1EwRkJReXhMUVVGTExFTkJRVU1zVDBGQlR5eEZRVU55UXp0VlFVTklMRTFCUVZFc1EwRkJReXhqUVVGakxFTkJRVU1zVDBGQlR5eERRVUZETEVWQlFVVXNRMEZCUXl4UlFVRlJMRU5CUVVNc1MwRkJTeXhEUVVGRExFOUJRVThzUlVGQlJTeEhRVUZITEVWQlFVVXNSVUZCUlN4SFFVRkhMRVZCUVVVc1dVRkJXU3hGUVVGRkxFOUJRVThzVVVGQlVTeERRVUZETEVkQlFVY3NRMEZCUXl4RlFVRkZMRVZCUVVVc1JVRkJRenRWUVVNNVJ5eFBRVUZUTEVkQlFVY3NTMEZCU1R0VFFVTm1PMDlCUTBZc1JVRkJRenM3TzAxQlIwb3NTVUZCVFN4RFFVRkRMRTlCUVU4c1NVRkJTU3hEUVVGRFFTeE5RVUZKTEVOQlFVTXNSVUZCUlN4RFFVRkRMRk5CUVZNc1EwRkJReXhKUVVGSkxGZEJRVU1zUjBGQlJTeFRRVUZITEVOQlFVTXNRMEZCUXl4TlFVRk5MRU5CUVVNc1NVRkJTU3hMUVVGTExFMUJRVWNzUTBGQlF5eEZRVUZGTzFGQlEzSkZMRlZCUVZrc2VVaEJRWE5JTEVkQlFVY3NNa05CUVhORE8wOUJRekZMT3p0TlFVVklMRTFCUVUwc1EwRkJReXhGUVVGRkxFTkJRVU1zVTBGQlV5eERRVUZETEU5QlFVOHNWMEZCUlN4UFFVRlBMRVZCUVVVN1VVRkRjRU1zU1VGQlRTeFBRVUZQTEVOQlFVTXNUVUZCVFN4RFFVRkRMRWxCUVVrc1MwRkJTeXhIUVVGSExFVkJRVVU3VlVGRGFrTXNUMEZCVXl4RFFVRkRMRXRCUVVzc1IwRkJSeXhSUVVGUkxFTkJRVU1zUjBGQlJ5eEZRVUZETzFWQlF5OUNMRTlCUVZNc1EwRkJReXhOUVVGTkxHVkJRVTBzVTBGQlJ5eFJRVUZSTEVOQlFVTXNSMEZCUnl4TFFVRkRPMU5CUTNKRE8wOUJRMFlzUlVGQlF6dExRVU5JTzBkQlEwWXNSVUZCUXpzN1JVRkZTaXhKUVVGTkxFTkJRVU1zUlVGQlJTeERRVUZETEZOQlFWTXNRMEZCUXl4UFFVRlBMRmRCUVVVc1QwRkJUeXhGUVVGRk8wbEJRM0JETEU5QlFWTXNRMEZCUXl4SFFVRkhMRWRCUVVVN1IwRkRaQ3hGUVVGRE8wVkJRMGc3T3pzN08wRkJTMGdzYTBKQlFVVXNWVUZCVlN4M1FrRkJSU3hQUVVGUExFVkJRVlU3T3p0RlFVTTNRaXhKUVVGTkxFTkJRVU1zU1VGQlNTeERRVUZETEdOQlFXTXNSVUZCUlR0SlFVTXhRaXhWUVVGWkxFTkJRVU1zTWtSQlFUSkVMRVZCUVVNN1IwRkRlRVU3UlVGRFNDeE5RVUZSTEVOQlFVTXNTVUZCU1N4RFFVRkRMRTlCUVU4c1EwRkJReXhEUVVGRExFOUJRVThzVjBGQlJTeEhRVUZITEVWQlFVVTdPMGxCUlc1RExFMUJRVTBzUTBGQlF5eEZRVUZGTEVOQlFVTXNSMEZCUnl4RFFVRkRMRWRCUVVjc1QwRkJUeXhEUVVGRExFZEJRVWNzUlVGQlF6czdTVUZGTjBJc1RVRkJUU3hEUVVGRExFVkJRVVVzUTBGQlF5eFJRVUZSTEVOQlFVTXNUMEZCVHl4RFFVRkRMRWRCUVVjc1EwRkJReXhIUVVGSExFOUJRVThzUTBGQlF5eEhRVUZITEVWQlFVTTdSMEZETjBNc1JVRkJRenRGUVVOSU96czdPenRCUVV0SUxHdENRVUZGTEZGQlFWRXNjMEpCUVVVc1NVRkJTU3hGUVVGVk96czdSVUZEZUVJc1NVRkJUU3hKUVVGSkxFTkJRVU1zY1VKQlFYRkNMRVZCUVVVN1NVRkRhRU1zVlVGQldTeERRVUZETERoRVFVRTRSQ3hGUVVGRE8wZEJRek5GTzBWQlEwZ3NTVUZCVFN4RFFVRkRMRWxCUVVrc1EwRkJReXhqUVVGakxFbEJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTXNSVUZCUlN4RlFVRkZPMGxCUTNSRExGVkJRVmtzUTBGQlF5eDVSRUZCZVVRc1JVRkJRenRIUVVOMFJUdEZRVU5JTEVsQlFVMHNTVUZCU1N4RFFVRkRMRVZCUVVVc1NVRkJTU3hKUVVGSkxFTkJRVU1zUlVGQlJTeERRVUZETEZGQlFWRXNTVUZCU1N4RFFVRkRMRWxCUVVrc1EwRkJReXhGUVVGRkxFTkJRVU1zVVVGQlVTeERRVUZETEZOQlFWTXNSVUZCUlR0SlFVTm9SU3hKUVVGTkxFTkJRVU1zUlVGQlJTeERRVUZETEZGQlFWRXNRMEZCUXl4VFFVRlRMRWRCUVVjc1IwRkJSVHRIUVVOb1F6dEZRVU5JTEUxQlFWRXNRMEZCUXl4SlFVRkpMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zVDBGQlR5eFhRVUZGTEVkQlFVY3NSVUZCUlRzN08wbEJSMmhETEVsQlFVMHNRMEZCUTBFc1RVRkJTU3hEUVVGRExFVkJRVVVzUTBGQlF5eFJRVUZSTEVOQlFVTXNVMEZCVXl4SlFVRkpMRU5CUVVOQkxFMUJRVWtzUTBGQlF5eEZRVUZGTEVOQlFVTXNVVUZCVVN4RFFVRkRMRk5CUVZNc1EwRkJReXhSUVVGUkxFTkJRVU1zUjBGQlJ5eERRVUZETEVWQlFVVTdUVUZET1VVc1ZVRkJXU3h6UTBGQmJVTXNSMEZCUnl4dFJFRkJPRU03UzBGREwwWTdPenRKUVVkSUxFbEJRVTFCTEUxQlFVa3NRMEZCUXl4RlFVRkZMRU5CUVVNc1RVRkJUU3hGUVVGRk8wMUJRM0JDTEUxQlFVMHNRMEZCUXl4RlFVRkZMRU5CUVVNc1RVRkJUU3hEUVVGRExFZEJRVWNzUTBGQlF5eEhRVUZITEVsQlFVa3NRMEZCUXl4SFFVRkhMRVZCUVVNN08wMUJSV3BETEUxQlFVMHNRMEZCUXl4RlFVRkZMRU5CUVVNc1RVRkJUU3hEUVVGRExFZEJRVWNzUTBGQlF5eEhRVUZITEVsQlFVa3NRMEZCUXl4SFFVRkhMRVZCUVVNN08wMUJSV3BETEUxQlFVMHNRMEZCUXl4RlFVRkZMRU5CUVVNc1VVRkJVU3hEUVVGRExGTkJRVk1zUTBGQlF5eEhRVUZITEVOQlFVTXNSMEZCUnl4SlFVRkpMRU5CUVVNc1IwRkJSeXhGUVVGRE8wdEJRelZETEUxQlFVMDdPMDFCUlZBc1RVRkJUU3hEUVVGRExFVkJRVVVzUTBGQlF5eEhRVUZITEVOQlFVTXNSMEZCUnl4SlFVRkpMRU5CUVVNc1IwRkJSeXhGUVVGRE96dE5RVVV4UWl4TlFVRk5MRU5CUVVNc1JVRkJSU3hEUVVGRExGRkJRVkVzUTBGQlF5eFRRVUZUTEVOQlFVTXNSMEZCUnl4RFFVRkRMRWRCUVVjc1NVRkJTU3hEUVVGRExFZEJRVWNzUlVGQlF6dExRVU0xUXp0SFFVTkdMRVZCUVVNN096dEZRVWRLTEVsQlFVMHNRMEZCUXl4TFFVRkxMRWRCUVVjc1NVRkJTU3hEUVVGRExFVkJRVVVzUTBGQlF5eFBRVUZOTzBWQlF6VkNPenM3T3p0QlFVdElMR3RDUVVGRkxFbEJRVWtzYjBKQlFWazdSVUZEYUVJc1NVRkJUU3hEUVVGRExFbEJRVWtzUTBGQlF5eFBRVUZQTEVWQlFVVTdTVUZEYmtJc1ZVRkJXU3hEUVVGRExEUkVRVUUwUkN4RlFVRkRPMGRCUTNwRk96dEZRVVZJTEU5QlFWTXNTVUZCU1N4RFFVRkRMRTlCUVU4c1EwRkJReXhYUVVGWExFTkJRVU1zU1VGQlNTeEZRVUZGTzBWQlEzWkRPenM3T3p0QlFVdElMR3RDUVVGRkxFOUJRVThzZFVKQlFVazdSVUZEV0N4SlFVRk5MRU5CUVVNc1NVRkJTU3hEUVVGRExHTkJRV01zUlVGQlJUdEpRVU14UWl4VlFVRlpMRU5CUVVNc2QwUkJRWGRFTEVWQlFVTTdSMEZEY2tVN08wVkJSVWdzU1VGQlRTeEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRlZCUVZVc1JVRkJSVHRKUVVNM1FpeEpRVUZOTEVOQlFVTXNUMEZCVHl4RFFVRkRMRlZCUVZVc1EwRkJReXhYUVVGWExFTkJRVU1zU1VGQlNTeERRVUZETEU5QlFVOHNSVUZCUXp0SFFVTnNSRHM3UlVGRlNDeEpRVUZOTEVOQlFVTXNSVUZCUlN4RFFVRkRMRkZCUVZFc1IwRkJSVHRGUVVOdVFqczdPenM3UVVGTFNDeHJRa0ZCUlN4UFFVRlBMSEZDUVVGRkxFbEJRVWtzUlVGQlZTeFBRVUZ2UWl4RlFVRkZPM0ZEUVVGbUxFZEJRVmM3TzBWQlEzcERMRWxCUVUwc1QwRkJUeXhKUVVGSkxFdEJRVXNzVVVGQlVTeEZRVUZGTzBsQlF6bENMRlZCUVZrc1EwRkJReXd5UTBGQk1rTXNSVUZCUXp0SFFVTjRSRHM3UlVGRlNDeEpRVUZOTEVOQlFVTXNTVUZCU1N4RFFVRkRMRTlCUVU4c1JVRkJSVHRKUVVOdVFpeFZRVUZaTEVOQlFVTXNLMFJCUVN0RUxFVkJRVU03UjBGRE5VVTdPMFZCUlVnc1NVRkJUU3hQUVVGUExFTkJRVU1zVFVGQlRTeEZRVUZGTzBsQlEzQkNMRlZCUVZrc1EwRkJReXc0U2tGQk9Fb3NSVUZCUXp0SFFVTXpTenM3TzBWQlIwZ3NTVUZCVFN4SlFVRkpMRU5CUVVNc1ZVRkJWU3hGUVVGRkxFTkJRVU1zVVVGQlVTeEZRVUZGTzBsQlEyaERMRTFCUVZFN1IwRkRVRHM3UlVGRlNDeEpRVUZSTEZOQlFWTXNSMEZCUnp0SlFVTnNRaXhMUVVGUExFVkJRVVVzUlVGQlJUdEpRVU5ZTEVkQlFVc3NSVUZCUlN4RFFVRkRPMGxCUTFJc1RVRkJVU3hGUVVGRkxFVkJRVVU3U1VGRFdpeEhRVUZMTEVWQlFVVXNSVUZCUlR0SlFVTlVMRXRCUVU4c1JVRkJSU3hGUVVGRk8wbEJRMWdzUlVGQlNTeEZRVUZGTEVWQlFVVTdTVUZEVWl4SlFVRk5MRVZCUVVVc1JVRkJSVHRKUVVOV0xFbEJRVTBzUlVGQlJTeEZRVUZGTzBsQlExWXNTMEZCVHl4RlFVRkZMRVZCUVVVN1NVRkRXQ3hIUVVGTExFVkJRVVVzUlVGQlJUdEpRVU5VTEVsQlFVMHNSVUZCUlN4RlFVRkZPMGxCUTFZc1UwRkJWeXhGUVVGRkxFTkJRVU03U1VGRFpDeE5RVUZSTEVWQlFVVXNSVUZCUlR0SlFVTmFMRTFCUVZFc1JVRkJSU3hGUVVGRk8wbEJRMW9zVVVGQlZTeEZRVUZGTEVWQlFVVTdTVUZEWWpzN1JVRkZTQ3hKUVVGUkxFdEJRVXNzUjBGQlJ5eEpRVUZKTEVOQlFVTXNTMEZCU3l4RFFVRkRMRWRCUVVjc1JVRkJRenM3UlVGRkwwSXNTVUZCVFN4WlFVRlhPenM3UlVGSGFrSXNTVUZCVFN4UlFVRlJMRTFCUVUwc1EwRkJReXhMUVVGTExFTkJRVU1zUzBGQlN5eFZRVUZWTEVWQlFVVTdTVUZETVVNc1YwRkJZU3hIUVVGSExFbEJRVWtzVFVGQlRTeERRVUZETEV0QlFVc3NRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVVU3VFVGRGVrTXNUMEZCVXl4RlFVRkZMRWxCUVVrN1RVRkRaaXhWUVVGWkxFVkJRVVVzU1VGQlNUdExRVU5xUWl4RlFVRkRPMGRCUTBnc1RVRkJUVHRKUVVOUUxGZEJRV0VzUjBGQlJ5eFJRVUZSTEVOQlFVTXNWMEZCVnl4RFFVRkRMRTlCUVU4c1JVRkJRenRKUVVNM1F5eFhRVUZoTEVOQlFVTXNVMEZCVXl4RFFVRkRMRXRCUVVzc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlJTeEpRVUZKTEVWQlFVVXNTVUZCU1N4RlFVRkRPMGRCUXpWRE96dEZRVVZJTEVsQlFVMHNUMEZCVHl4RlFVRkZPMGxCUTJJc1RVRkJVU3hEUVVGRExFbEJRVWtzUTBGQlF5eFBRVUZQTEVOQlFVTXNRMEZCUXl4UFFVRlBMRmRCUVVNc1MwRkJTVHM3VFVGRmFrTXNWMEZCWVN4RFFVRkRMRWRCUVVjc1EwRkJReXhIUVVGSExFOUJRVThzUTBGQlF5eEhRVUZITEVWQlFVTTdTMEZEYUVNc1JVRkJRenRIUVVOSU96dEZRVVZJTEVsQlFVMHNTMEZCU3l4RFFVRkRMRTFCUVUwc1MwRkJTeXhEUVVGRExFVkJRVVU3TzBsQlJYaENMRmRCUVdFc1EwRkJReXhQUVVGUExFZEJRVWNzVTBGQlV5eERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJRenRIUVVNeFF6czdSVUZGU0N4SlFVRk5MRU5CUVVNc1QwRkJUeXhEUVVGRExHRkJRV0VzUTBGQlF5eFhRVUZYTEVWQlFVTTdSVUZEZWtNc1NVRkJUU3hKUVVGSkxFTkJRVU1zUzBGQlN5eEZRVUZGTzBsQlEyaENMR0ZCUVdVc1EwRkJReXhKUVVGSkxFTkJRVU1zUlVGQlJTeEpRVUZKTEVsQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1QwRkJUeXhEUVVGRExFdEJRVXNzUlVGQlF6dEhRVU51UkR0RlFVTkdPenRCUVVWSUxHdENRVUZGTEUxQlFVMHNjMEpCUVVrN1JVRkRWaXhKUVVGTkxFTkJRVU1zZVVaQlFYbEdMRVZCUVVNN1EwRkRhRWM3TzBGRGVtNUNTQ3hUUVVGVExGZEJRVmNzUlVGQlJTeEhRVUZITEVWQlFVVTdSVUZEZWtJc1IwRkJSeXhEUVVGRExFbEJRVWtzUTBGQlF5eFBRVUZQTEVOQlFVTXNZMEZCWXl4RlFVRkRPME5CUTJwRE96dEJRVVZFTEZOQlFWTXNZMEZCWXl4RlFVRkZMRTlCUVU4c1JVRkJSVHRGUVVOb1F5eEpRVUZKTEU5QlFVOHNRMEZCUXl4SlFVRkpMRXRCUVVzc1NVRkJTU3hGUVVGRk8wbEJRM3BDTEUxQlFVMDdSMEZEVUR0RlFVTkVMRTlCUVU4c1EwRkJReXhKUVVGSkxFZEJRVWNzUzBGQlNUdEZRVU51UWl4UFFVRlBMRU5CUVVNc1NVRkJTU3hEUVVGRExFOUJRVThzUTBGQlF5eFhRVUZYTEVWQlFVTTdRMEZEYkVNN08wRkJSVVFzUVVGQlR5eFRRVUZUTEdsQ1FVRnBRaXhGUVVGRkxFVkJRVVVzUlVGQlJUdEZRVU55UXl4SlFVRkpMRVZCUVVVc1EwRkJReXhUUVVGVExFVkJRVVU3U1VGRGFFSXNSVUZCUlN4RFFVRkRMRk5CUVZNc1EwRkJReXhQUVVGUExFTkJRVU1zWTBGQll5eEZRVUZETzBkQlEzSkRPenRGUVVWRUxFbEJRVWtzUlVGQlJTeERRVUZETEdsQ1FVRnBRaXhGUVVGRk8wbEJRM2hDTEUxQlFVMHNRMEZCUXl4SlFVRkpMRU5CUVVNc1JVRkJSU3hEUVVGRExHbENRVUZwUWl4RFFVRkRMRU5CUVVNc1QwRkJUeXhYUVVGRkxHVkJRV1VzUlVGQlJUdE5RVU14UkN4alFVRmpMRU5CUVVNc1JVRkJSU3hEUVVGRExHbENRVUZwUWl4RFFVRkRMR1ZCUVdVc1EwRkJReXhGUVVGRE8wdEJRM1JFTEVWQlFVTTdSMEZEU0RzN1JVRkZSQ3hqUVVGakxFTkJRVU1zUlVGQlJTeERRVUZETEZGQlFWRXNSVUZCUXpzN1JVRkZNMElzUlVGQlJTeERRVUZETEZOQlFWTXNRMEZCUXl4UFFVRlBMRU5CUVVNc2FVSkJRV2xDTEVWQlFVTTdRMEZEZUVNN08wRkRNVUpFT3p0QlFVMUJMRWxCUVhGQ0xGVkJRVlU3UlVGRE4wSXNiVUpCUVZjc1JVRkJSU3hGUVVGRkxFVkJRV0VzVDBGQlR5eEZRVUZyUWp0SlFVTnVSRVVzWlVGQlN5eFBRVUZETEVWQlFVVXNRMEZCUXl4TlFVRk5MRVZCUVVVc1QwRkJUeXhGUVVGRE96czdTVUZIZWtJc1RVRkJUU3hEUVVGRExHTkJRV01zUTBGQlF5eEpRVUZKTEVWQlFVVXNUMEZCVHl4SFFVRkhPMDFCUTNCRExFZEJRVWNzWTBGQlN5eFRRVUZITEVWQlFVVXNRMEZCUXl4VFFVRk5PMDFCUTNCQ0xFZEJRVWNzWTBGQlN5eEZRVUZMTzB0QlEyUXNSMEZCUlRzN1NVRkZTQ3hOUVVGTkxFTkJRVU1zWTBGQll5eERRVUZETEVsQlFVa3NSVUZCUlN4VFFVRlRMRWRCUVVjN1RVRkRkRU1zUjBGQlJ5eGpRVUZMTEZOQlFVY3NSVUZCUlN4RFFVRkRMRTFCUVVjN1RVRkRha0lzUjBGQlJ5eGpRVUZMTEVWQlFVczdTMEZEWkN4SFFVRkZPMGxCUTBnc1NVRkJTU3hEUVVGRExFVkJRVVVzUjBGQlJ5eEhRVUZGTzBsQlExb3NTVUZCU1N4UFFVRlBMRU5CUVVNc1NVRkJTU3hGUVVGRk8wMUJRMmhDTEdsQ1FVRnBRaXhEUVVGRExFVkJRVVVzUlVGQlF6dE5RVU55UWl4aFFVRmhMRU5CUVVNc1JVRkJSU3hGUVVGRE8wdEJRMnhDTzBsQlEwUXNTVUZCU1N4RFFVRkRMR05CUVdNc1IwRkJSeXhMUVVGSk8wbEJRekZDTEVsQlFVa3NRMEZCUXl4eFFrRkJjVUlzUjBGQlJ5eEZRVUZGTEVOQlFVTXNVVUZCVVN4RFFVRkRMSFZDUVVGelFqdEpRVU12UkN4SlFVRkpMRU5CUVVNc1VVRkJVU3hIUVVGSExFVkJRVVVzUTBGQlF5eFZRVUZUTzBsQlF6VkNMRWxCUVVrc1EwRkJReXhsUVVGbExFZEJRVWNzUlVGQlJTeERRVUZETEdsQ1FVRm5RanM3T3pzN096czdSVUYwUWs0N08wRkRUbmhET3p0QlFVbEJMRk5CUVZNc1YwRkJWeXhGUVVGRkxFbEJRVWtzUlVGQlowSTdSVUZEZUVNc1QwRkJUeXhMUVVGTExFTkJRVU1zVDBGQlR5eERRVUZETEVsQlFVa3NRMEZCUXl4TFFVRkxMRWxCUVVrc1MwRkJTeXhKUVVGSkxFbEJRVWtzVDBGQlR5eEpRVUZKTEV0QlFVc3NVVUZCVVN4RFFVRkRMRWxCUVVrc1QwRkJUeXhKUVVGSkxFdEJRVXNzVVVGQlVUdERRVU4wUnpzN1FVRkZSQ3hCUVVGUExGTkJRVk1zWVVGQllTeEZRVUZGTEV0QlFVc3NSVUZCWjBJN1JVRkRiRVFzUzBGQlN5eEpRVUZKTEUxQlFVMHNRMEZCUXl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU1zVDBGQlR5eFhRVUZGTEVkQlFVY3NSVUZCUlR0SlFVTjRReXhKUVVGSkxFTkJRVU1zVjBGQlZ5eERRVUZETEV0QlFVc3NRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJReXhGUVVGRk8wMUJRelZDTEZWQlFWVXNRMEZCUXl4clJVRkJhMFVzUlVGQlF6dExRVU12UlRzN1NVRkZSQ3hKUVVGSkxFdEJRVXNzUTBGQlF5eFBRVUZQTEVOQlFVTXNTMEZCU3l4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRExFVkJRVVU3VFVGRE4wSXNTMEZCU3l4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRExFOUJRVThzVjBGQlJTeFRRVUZUTEVWQlFVVTdVVUZETjBJc1NVRkJTU3hEUVVGRExGZEJRVmNzUTBGQlF5eFRRVUZUTEVOQlFVTXNSVUZCUlR0VlFVTXpRaXhWUVVGVkxFTkJRVU1zYTBWQlFXdEZMRVZCUVVNN1UwRkRMMFU3VDBGRFJpeEZRVUZETzB0QlEwZzdSMEZEUml4RlFVRkRPME5CUTBnN08wRkRkRUpFT3p0QlFVMUJMRk5CUVZNc1YwRkJWeXhGUVVGRkxFVkJRVVVzUlVGQllTeFJRVUZSTEVWQlFWVXNVMEZCVXl4RlFVRXJSRHRGUVVNM1NFb3NTVUZCU1N4TFFVRkpPMFZCUTFJc1NVRkJTU3hQUVVGUExGTkJRVk1zUzBGQlN5eFJRVUZSTEVWQlFVVTdTVUZEYWtNc1NVRkJTU3hEUVVGRFN5eHpRMEZCYTBJc1JVRkJSVHROUVVOMlFpeFZRVUZWTEVOQlFVTXNOa2RCUVRaSExFVkJRVU03UzBGRE1VZzdTVUZEUkN4SlFVRkpMRTFCUVUwc1EwRkJReXhUUVVGVExFTkJRVU1zVTBGQlV5eERRVUZETEV0QlFVc3NRMEZCUXl4WlFVRlpMRU5CUVVNc1JVRkJSVHROUVVOc1JDeFZRVUZWTEVOQlFVTXNiMGRCUVc5SExFVkJRVU03UzBGRGFrZzdTVUZEUkU0c1NVRkJUU3hUUVVGVExFZEJRVWNzU1VGQlNTeE5RVUZOTEVOQlFVTXNVMEZCVXl4SFFVRkZPMGxCUTNoRFFTeEpRVUZOTEZOQlFWTXNSMEZCUnl4VFFVRlRMRU5CUVVNc1pVRkJaU3hEUVVGRExGTkJRVk1zUlVGQlJTeFhRVUZYTEVWQlFVTTdTVUZEYmtWQkxFbEJRVTBzVlVGQlZTeEhRVUZITEZOQlFWTXNRMEZCUXl4SlFVRkpMRWRCUVVVN1NVRkRia01zU1VGQlNTeFZRVUZWTEVOQlFVTXNRMEZCUXl4RFFVRkRMRXRCUVVzc1IwRkJSeXhKUVVGSkxGVkJRVlVzUTBGQlF5eFZRVUZWTEVOQlFVTXNUVUZCVFN4SFFVRkhMRU5CUVVNc1EwRkJReXhMUVVGTExFZEJRVWNzU1VGQlNTeFRRVUZUTEVOQlFVTXNTVUZCU1N4RFFVRkRMR2xDUVVGcFFpeExRVUZMTEVOQlFVTXNSVUZCUlR0TlFVTm9TQ3hKUVVGSkxFZEJRVWNzUlVGQlJTeERRVUZETEdOQlFXTXNRMEZCUTAwc2MwTkJRV3RDTEVOQlFVTXNVMEZCVXl4RFFVRkRMRVZCUVVNN1MwRkRlRVFzVFVGQlRUdE5RVU5NVGl4SlFVRk5MR05CUVdNc1IwRkJSMDBzYzBOQlFXdENMRmxCUVZNc1UwRkJVeXh0UWtGQll6dE5RVU42UlU0c1NVRkJUU3huUWtGQlowSXNSMEZCUnl4RlFVRkZMRU5CUVVNc1dVRkJXU3hEUVVGRExGRkJRVkVzUTBGQlF5eG5Ra0ZCWlR0TlFVTnFSU3hGUVVGRkxFTkJRVU1zV1VGQldTeERRVUZETEZGQlFWRXNRMEZCUXl4bFFVRmxMRWRCUVVjc1kwRkJZeXhEUVVGRExHZENRVUZsTzAxQlEzcEZMRWxCUVVrc1IwRkJSeXhqUVVGakxFTkJRVU1zVFVGQlRTeERRVUZETEVsQlFVa3NRMEZCUXl4RlFVRkZMRU5CUVVNc1dVRkJXU3hGUVVGRkxFVkJRVVVzUTBGQlF5eGpRVUZqTEVOQlFVTXNRMEZCUXl4VFFVRlJPMDFCUXpsRkxFVkJRVVVzUTBGQlF5eFpRVUZaTEVOQlFVTXNVVUZCVVN4RFFVRkRMR1ZCUVdVc1IwRkJSeXhwUWtGQlowSTdTMEZETlVRN1IwRkRSaXhOUVVGTk8wbEJRMHdzU1VGQlNTeEhRVUZITEVWQlFVVXNRMEZCUXl4alFVRmpMRU5CUVVNc1UwRkJVeXhGUVVGRE8wZEJRM0JETzBWQlEwUXNTVUZCU1N4TFFVRkxMRU5CUVVNc1QwRkJUeXhEUVVGRExFbEJRVWtzUTBGQlF5eEZRVUZGTzBsQlEzWkNMRWxCUVVrc1MwRkJTeXhEUVVGRExFOUJRVThzUTBGQlF5eEZRVUZGTEVOQlFVTXNUVUZCVFN4RFFVRkRMRkZCUVZFc1EwRkJReXhEUVVGRExFVkJRVVU3VFVGRGRFTXNSVUZCUlN4RFFVRkRMRTFCUVUwc1EwRkJReXhSUVVGUkxFTkJRVU1zUjBGQlJ5eEZRVUZOTEVOQlFVTXNUVUZCVFN4RFFVRkRMRkZCUVZFc1EwRkJReXhUUVVGTExFbEJRVWtzUlVGQlF6dExRVU40UkN4TlFVRk5PMDFCUTB3c1JVRkJSU3hEUVVGRExFMUJRVTBzUTBGQlF5eFJRVUZSTEVOQlFVTXNSMEZCUnl4WFFVRkpMRWxCUVVrc1IwRkJRenRMUVVOb1F6dEhRVU5HTEUxQlFVMDdTVUZEVEN4SlFVRkpMRXRCUVVzc1EwRkJReXhQUVVGUExFTkJRVU1zUlVGQlJTeERRVUZETEUxQlFVMHNRMEZCUXl4UlFVRlJMRU5CUVVNc1EwRkJReXhGUVVGRk8wMUJRM1JETEVWQlFVVXNRMEZCUXl4TlFVRk5MRU5CUVVNc1VVRkJVU3hEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETEVsQlFVa3NSVUZCUXp0TFFVTXZRaXhOUVVGTk8wMUJRMHdzUlVGQlJTeERRVUZETEUxQlFVMHNRMEZCUXl4UlFVRlJMRU5CUVVNc1IwRkJSeXhEUVVGRExFbEJRVWtzUlVGQlF6dExRVU0zUWp0SFFVTkdPME5CUTBZN08wRkJSVVFzUVVGQlR5eFRRVUZUTEZGQlFWRXNSVUZCUlN4RlFVRkZMRVZCUVdFc1MwRkJTeXhGUVVGblFqdEZRVU0xUkN4aFFVRmhMRU5CUVVNc1MwRkJTeXhGUVVGRE8wVkJRM0JDTEUxQlFVMHNRMEZCUXl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU1zVDBGQlR5eFhRVUZGTEVkQlFVY3NSVUZCUlR0SlFVTXZRaXhKUVVGSkxFdEJRVXNzUTBGQlF5eFBRVUZQTEVOQlFVTXNTMEZCU3l4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRExFVkJRVVU3VFVGRE4wSXNTMEZCU3l4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRExFOUJRVThzVjBGQlJTeFRRVUZUTEVWQlFVVTdVVUZETjBJc1YwRkJWeXhEUVVGRExFVkJRVVVzUlVGQlJTeEhRVUZITEVWQlFVVXNVMEZCVXl4RlFVRkRPMDlCUTJoRExFVkJRVU03UzBGRFNDeE5RVUZOTzAxQlEwd3NWMEZCVnl4RFFVRkRMRVZCUVVVc1JVRkJSU3hIUVVGSExFVkJRVVVzUzBGQlN5eERRVUZETEVkQlFVY3NRMEZCUXl4RlFVRkRPMHRCUTJwRE8wZEJRMFlzUlVGQlF6dERRVU5JT3p0QlEzaEVSRHM3UVVGTFFTeEJRVUZQTEZOQlFWTXNZMEZCWXl4RlFVRkZMRVZCUVVVc1JVRkJZU3hYUVVGWExFVkJRV2RDTzBWQlEzaEZMRTFCUVUwc1EwRkJReXhKUVVGSkxFTkJRVU1zVjBGQlZ5eERRVUZETEVOQlFVTXNUMEZCVHl4WFFVRkZMRWRCUVVjc1JVRkJSVHRKUVVOeVEwRXNTVUZCVFN4UlFVRlJMRWRCUVVjc1YwRkJWeXhEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZETEVsQlFVa3NSMEZCUlR0SlFVTjRReXhKUVVGSkxGRkJRVkVzUTBGQlF5eE5RVUZOTEVOQlFVTXNRMEZCUXl4RlFVRkZMRU5CUVVNc1EwRkJReXhMUVVGTExGZEJRVmNzUlVGQlJUdE5RVU42UXl4VlFVRlZMRU5CUVVNc05rVkJRVFpGTEVWQlFVTTdTMEZETVVZN1NVRkRSRUVzU1VGQlRTeFRRVUZUTEVkQlFVY3NTVUZCU1N4TlFVRk5MRU5CUVVNc1UwRkJVeXhIUVVGRk8wbEJRM2hEUVN4SlFVRk5MRk5CUVZNc1IwRkJSeXhUUVVGVExFTkJRVU1zWlVGQlpTeERRVUZETEZGQlFWRXNSVUZCUlN4WFFVRlhMRVZCUVVNN1NVRkRiRVVzUlVGQlJTeERRVUZETERCQ1FVRXdRaXhEUVVGRExFZEJRVWNzUTBGQlF5eEhRVUZIVFN4elEwRkJhMElzUTBGQlF5eFJRVUZSTEVOQlFVTXNRMEZCUXl4UFFVRk5PMGxCUTNoRkxFVkJRVVVzUTBGQlF5eDVRa0ZCZVVJc1EwRkJReXhIUVVGSExFTkJRVU1zUjBGQlJ5eFRRVUZUTEVOQlFVTXNTVUZCU1N4RFFVRkRMRlZCUVZVc1EwRkJReXhaUVVGWkxFTkJRVU1zV1VGQldTeEZRVUZETzBkQlEzcEdMRVZCUVVNN1EwRkRTRHM3UVVOb1FrUTdRVUZEUVR0QlFVZEJMRUZCUVdVc1UwRkJVeXhSUVVGUkxFVkJRVVVzWjBKQlFXZENMRVZCUVZWRExFMUJRVWNzUlVGQllUdEZRVU14UlN4TlFVRk5MRU5CUVVNc1NVRkJTU3hEUVVGRExHZENRVUZuUWl4RFFVRkRMRU5CUVVNc1QwRkJUeXhYUVVGRkxFZEJRVWNzUlVGQlJUdEpRVU14UXl4SlFVRkpPMDFCUTBaQkxFMUJRVWNzUTBGQlF5eFRRVUZUTEVOQlFVTXNSMEZCUnl4RFFVRkRMRWRCUVVjc1owSkJRV2RDTEVOQlFVTXNSMEZCUnl4RlFVRkRPMHRCUXpORExFTkJRVU1zVDBGQlR5eERRVUZETEVWQlFVVTdUVUZEVml4SlFVRkpMRzlEUVVGcFF5eEhRVUZITERCR1FVRnhSanRMUVVNNVNEdEpRVU5FUXl4SFFVRkxMRU5CUVVNc1NVRkJTU3hEUVVGRExHTkJRV01zUTBGQlEwUXNUVUZCUnl4RlFVRkZMRWRCUVVjc1JVRkJSU3huUWtGQlowSXNRMEZCUXl4SFFVRkhMRU5CUVVNc1JVRkJRenRIUVVNelJDeEZRVUZETzBOQlEwZzdPMEZEV0dNc1UwRkJVeXhSUVVGUkxFVkJRVVVzUlVGQlJTeEZRVUZGTEV0QlFVc3NSVUZCUlR0RlFVTXpRMUFzU1VGQlRTeGpRVUZqTEVkQlFVY3NSMEZCUnl4RFFVRkRMRTFCUVUwc1EwRkJReXhQUVVGTk8wVkJRM2hETEVkQlFVY3NRMEZCUXl4TlFVRk5MRU5CUVVNc1RVRkJUU3hIUVVGSExFdEJRVWs3UlVGRGVFSXNTVUZCU1N4TFFVRkxMRVZCUVVVN1NVRkRWQ3hGUVVGRkxFTkJRVU1zVFVGQlRTeEhRVUZITEUxQlFVczdSMEZEYkVJc1RVRkJUVHRKUVVOTUxFVkJRVVVzUTBGQlF5eE5RVUZOTEVkQlFVY3NSMEZCUlR0SFFVTm1PMFZCUTBRc1IwRkJSeXhEUVVGRExFMUJRVTBzUTBGQlF5eE5RVUZOTEVkQlFVY3NaVUZCWXp0RFFVTnVRenM3UVVOVVl5eFRRVUZUTEZsQlFWa3NSVUZCUlN4RlFVRkZMRVZCUVVVc1UwRkJVeXhGUVVGRk8wVkJRMjVFUVN4SlFVRk5MR05CUVdNc1IwRkJSeXhIUVVGSExFTkJRVU1zVFVGQlRTeERRVUZETEU5QlFVMDdSVUZEZUVNc1IwRkJSeXhEUVVGRExFMUJRVTBzUTBGQlF5eE5RVUZOTEVkQlFVY3NTMEZCU1R0RlFVTjRRaXhKUVVGSkxGTkJRVk1zUlVGQlJUdEpRVU5pTEVWQlFVVXNRMEZCUXl4VlFVRlZMRWRCUVVjc1ZVRkJVenRIUVVNeFFpeE5RVUZOTzBsQlEwd3NSVUZCUlN4RFFVRkRMRlZCUVZVc1IwRkJSeXhIUVVGRk8wZEJRMjVDTzBWQlEwUXNSMEZCUnl4RFFVRkRMRTFCUVUwc1EwRkJReXhOUVVGTkxFZEJRVWNzWlVGQll6dERRVU51UXpzN1FVTllSQ3hUUVVGVExGVkJRVlVzUlVGQlJTeFRRVUZUTEVWQlFVVXNZVUZCWVN4RlFVRkZMRTlCUVU4c1JVRkJSVHRGUVVOMFJFRXNTVUZCVFN4UFFVRlBMRWRCUVVjc1QwRkJUeXhoUVVGaExFdEJRVXNzVlVGQlZUdE5RVU12UXl4aFFVRmhPMDFCUTJJc1RVRkJUU3hEUVVGRExFMUJRVTBzUTBGQlF5eEZRVUZGTEVWQlFVVXNZVUZCWVN4RlFVRkRPenRGUVVWd1F5eFBRVUZQTEVOQlFVTXNXVUZCV1N4SFFVRkhMRk5CUVZNc2RVSkJRWFZDTEVsQlFVazdTVUZEZWtRc1NVRkJTU3hEUVVGRExGTkJRVk1zUjBGQlJ5eFBRVUZQTEU5QlFVOHNTMEZCU3l4VlFVRlZPMUZCUXpGRExFOUJRVThzUTBGQlF5eEpRVUZKTEVOQlFVTXNTVUZCU1N4RFFVRkRPMUZCUTJ4Q0xGRkJRVTg3U1VGRFdqdERRVU5HT3p0QlExWkVPenRCUVVWQkxFRkJRVThzVTBGQlV5eFRRVUZUTEVWQlFVVXNSVUZCUlN4RlFVRmhMRTlCUVU4c1JVRkJWU3hqUVVGakxFVkJRV003UlVGRGNrWkJMRWxCUVUwc1NVRkJTU3hIUVVGSExFVkJRVVVzUTBGQlF5eE5RVUZMTzBWQlEzSkNMRVZCUVVVc1EwRkJReXhMUVVGTExHRkJRVWtzU1VGQlNTeEZRVUZYT3pzN08wbEJRM3BDTEVOQlFVTXNUMEZCVHl4RFFVRkRMRWxCUVVrc1EwRkJReXhMUVVGTExFOUJRVThzUTBGQlF5eEpRVUZKTEVOQlFVTXNSMEZCUnl4RlFVRkZMRU5CUVVNc1JVRkJSU3hKUVVGSkxFTkJRVU1zU1VGQlNTeEZRVUZETzBsQlEyeEVMR05CUVdNc1EwRkJReXhKUVVGSkxFTkJRVU1zVVVGQlJTeEpRVUZKTEZGQlFVVXNTVUZCU1N4RlFVRkZMRVZCUVVNN1NVRkRia01zVDBGQlR5eEpRVUZKTEVOQlFVTXNWVUZCU1N4VFFVRkRMRVZCUVVVc1JVRkJSU3hKUVVGSkxGZEJRVXNzVFVGQlNTeERRVUZETzBsQlEzQkRPME5CUTBZN08wRkJSVVFzUVVGQlR5eFRRVUZUTEdOQlFXTXNSVUZCUlN4SFFVRkhMRVZCUVdFN1JVRkRPVU1zUjBGQlJ5eERRVUZETEV0QlFVc3NRMEZCUXp0SlFVTlNMRmxCUVZrc1JVRkJSU3haUVVGWk8wMUJRM2hDTEVsQlFVa3NRMEZCUXl4VFFVRlRMRWRCUVVjc1RVRkJUU3hEUVVGRExFMUJRVTBzUTBGQlF5eEpRVUZKTEVWQlFVTTdUVUZEY0VNc1NVRkJTU3hEUVVGRExHZENRVUZuUWl4SFFVRkhMRWRCUVVVN1RVRkRNVUlzVTBGQlV5eERRVUZETEVsQlFVa3NSVUZCUlN4SlFVRkpMRU5CUVVNc1UwRkJVeXhGUVVGRkxFbEJRVWtzUTBGQlF5eG5Ra0ZCWjBJc1JVRkJRenRMUVVOMlJEdEhRVU5HTEVWQlFVTTdRMEZEU0RzN1FVTnVRa1E3TzBGQlNVRXNRVUZCVHl4VFFVRlRMR1ZCUVdVc1JVRkJSU3hUUVVGVExFVkJRV0U3UlVGRGNrUXNTVUZCU1N4VFFVRlRMRU5CUVVNc1ZVRkJWU3hGUVVGRk8wbEJRM2hDTEUxQlFVMHNRMEZCUXl4SlFVRkpMRU5CUVVNc1UwRkJVeXhEUVVGRExGVkJRVlVzUTBGQlF5eERRVUZETEU5QlFVOHNWMEZCUlN4RFFVRkRMRVZCUVVVN1RVRkROVU5CTEVsQlFVMHNSMEZCUnl4SFFVRkhMRk5CUVZNc1EwRkJReXhWUVVGVkxFTkJRVU1zUTBGQlF5eEZRVUZETzAxQlEyNURMRWxCUVVrc1EwRkJReXhIUVVGSExFTkJRVU1zVFVGQlRTeEZRVUZGTzFGQlEyWXNaVUZCWlN4RFFVRkRMRWRCUVVjc1JVRkJRenRQUVVOeVFqdExRVU5HTEVWQlFVTTdSMEZEU0R0RlFVTkVMRWxCUVVrc1UwRkJVeXhEUVVGRExFOUJRVThzUlVGQlJUdEpRVU55UWl4bFFVRmxMRU5CUVVNc1UwRkJVeXhEUVVGRExFOUJRVThzUlVGQlF6dEhRVU51UXp0RlFVTkVMRWxCUVVrc1UwRkJVeXhEUVVGRExGRkJRVkVzUlVGQlJUdEpRVU4wUWl4TlFVRk5MRU5CUVVNc1RVRkJUU3hEUVVGRExGTkJRVk1zUlVGQlJVMHNjME5CUVd0Q0xFTkJRVU1zVTBGQlV5eERRVUZETEZGQlFWRXNRMEZCUXl4RlFVRkRPMGRCUTJwRk8wTkJRMFk3TzBGRGJrSkVPenRCUVZOQkxGTkJRVk5ITEdkQ1FVRmpMRVZCUVVVc1NVRkJTU3hGUVVGRk8wVkJRemRDTEU5QlFVOHNTVUZCU1N4TFFVRkxMRWxCUVVrc1EwRkJReXhOUVVGTkxFbEJRVWtzU1VGQlNTeERRVUZETEZGQlFWRXNTVUZCU1N4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRE8wTkJRemxFT3p0QlFVVkVMRk5CUVZNc1YwRkJWeXhGUVVGRkxFbEJRVWtzUlVGQlR6dEZRVU12UWl4UFFVRlBMRU5CUVVNc1EwRkJReXhKUVVGSk8wMUJRMVFzVDBGQlR5eEpRVUZKTEV0QlFVc3NVVUZCVVR0UFFVTjJRaXhKUVVGSkxFdEJRVXNzU1VGQlNTeERRVUZETzA5QlEyUkJMR2RDUVVGakxFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTTdRMEZETTBJN08wRkJSVVFzVTBGQlV5eHRRa0ZCYlVJc1JVRkJSU3hKUVVGSkxFVkJRVVU3UlVGRGJFTXNUMEZCVHl4SlFVRkpMRXRCUVVzc1YwRkJWeXhKUVVGSkxFbEJRVWtzUzBGQlN5eFpRVUZaTEVsQlFVa3NTVUZCU1N4TFFVRkxMR2xDUVVGcFFqdERRVU51UmpzN1FVRkZSQ3hUUVVGVExHbENRVUZwUWl4RlFVRkZMRk5CUVZNc1JVRkJjVUk3UlVGRGVFUXNUMEZCVHp0SlFVTk1MRXRCUVVzc1JVRkJSU3hUUVVGVExFTkJRVU1zUzBGQlN6dEpRVU4wUWl4SlFVRkpMRVZCUVVVc1UwRkJVeXhEUVVGRExFbEJRVWs3U1VGRGNFSXNSVUZCUlN4RlFVRkZMRk5CUVZNc1EwRkJReXhGUVVGRk8wbEJRMmhDTEVkQlFVY3NSVUZCUlN4VFFVRlRMRU5CUVVNc1IwRkJSenRKUVVOc1FpeEhRVUZITEVWQlFVVXNVMEZCVXl4RFFVRkRMRWRCUVVjN1NVRkRiRUlzUzBGQlN5eEZRVUZGTEZOQlFWTXNRMEZCUXl4TFFVRkxPMGxCUTNSQ0xGRkJRVkVzUlVGQlJTeFRRVUZUTEVOQlFVTXNVVUZCVVR0SlFVTTFRaXhMUVVGTExFVkJRVVVzVTBGQlV5eERRVUZETEV0QlFVczdTVUZEZEVJc1YwRkJWeXhGUVVGRkxGTkJRVk1zUTBGQlF5eFhRVUZYTzBsQlEyeERMRmRCUVZjc1JVRkJSU3hUUVVGVExFTkJRVU1zVjBGQlZ6dEpRVU5zUXl4TFFVRkxMRVZCUVVVc1UwRkJVeXhEUVVGRExFdEJRVXM3U1VGRGRFSXNaVUZCWlN4RlFVRkZMRk5CUVZNc1EwRkJReXhsUVVGbE8wbEJRekZETEZGQlFWRXNSVUZCUlN4VFFVRlRMRU5CUVVNc1VVRkJVVHRKUVVNMVFpeFZRVUZWTEVWQlFVVXNVMEZCVXl4RFFVRkRMRlZCUVZVN1IwRkRha003UTBGRFJqdEJRVU5FTEZOQlFWTXNiMEpCUVc5Q0xFVkJRVVVzWTBGQll5eEZRVUZWTEdsQ1FVRnBRaXhGUVVGeFFqdEZRVU16Uml4SlFVRkpMRU5CUVVOSUxITkRRVUZyUWl4RlFVRkZPMGxCUTNaQ0xGVkJRVlVzUTBGQlF5dzJSMEZCTmtjc1JVRkJRenRIUVVNeFNEczdSVUZGUkN4SlFVRkpMR05CUVdNc1EwRkJReXhQUVVGUExFTkJRVU1zVTBGQlV5eERRVUZETEdsQ1FVRnBRaXhEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRPMFZCUTNCRkxHTkJRV01zUTBGQlF5eFBRVUZQTEVOQlFVTXNWVUZCVlN4RFFVRkRMR2xDUVVGcFFpeERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRMRXRCUVVzc1EwRkJReXhEUVVGRE8wVkJRMnBGTEdOQlFXTXNRMEZCUXl4UFFVRlBMRU5CUVVNc1VVRkJVU3hEUVVGRExHbENRVUZwUWl4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExFdEJRVXNzUTBGQlF5eERRVUZETEVWQlFVVTdTVUZETDBRc1ZVRkJWU3hEUVVGRExHdEVRVUZyUkN4RlFVRkRPMGRCUXk5RU96dEZRVVZFTEU5QlFVOHNhMEpCUTBZc2FVSkJRV2xDTEVOQlFVTXNhVUpCUVdsQ0xFTkJRVU03U1VGRGRrTkJMSE5EUVVGeFFpeERRVUZETEdOQlFXTXNRMEZCUXl4RFFVTjBRenREUVVOR096dEJRVVZFTEZOQlFWTXNaVUZCWlN4RlFVRkZMR2xDUVVGcFFpeEZRVUZoTzBWQlEzUkVMRTlCUVU4c2EwSkJRMFlzYVVKQlFXbENMRU5CUVVNc2FVSkJRV2xDTEVOQlFVTTdTMEZEZGtNc1RVRkJUU3haUVVGRkxFZEJRVVVzVTBGQlJ5eERRVUZETEVOQlFVTXNSVUZCUlN4TFFVRkRMRU5CUTI1Q08wTkJRMFk3TzBGQlJVUXNRVUZCVHl4VFFVRlRMRzlDUVVGdlFpeEZRVUZGTEd0Q1FVRXJRaXhGUVVGRkxFdEJRVXNzUlVGQmEwSTdlVVJCUVhSRExFZEJRVmM3TzBWQlEycEZUaXhKUVVGTkxGVkJRVlVzUjBGQlJ5eEhRVUZGTzBWQlEzSkNMRWxCUVVrc1EwRkJReXhMUVVGTExFVkJRVVU3U1VGRFZpeFBRVUZQTEZWQlFWVTdSMEZEYkVJN1JVRkRSQ3hKUVVGSkxFdEJRVXNzUTBGQlF5eFBRVUZQTEVOQlFVTXNTMEZCU3l4RFFVRkRMRVZCUVVVN1NVRkRlRUlzUzBGQlN5eERRVUZETEU5QlFVOHNWMEZCUXl4TlFVRkxPMDFCUTJwQ0xFbEJRVWtzU1VGQlNTeExRVUZMTEV0QlFVc3NSVUZCUlR0UlFVTnNRaXhOUVVGTk8wOUJRMUE3TzAxQlJVUXNTVUZCU1N4UFFVRlBMRWxCUVVrc1MwRkJTeXhSUVVGUkxFVkJRVVU3VVVGRE5VSXNWVUZCVlN4RFFVRkRMSE5FUVVGelJDeEZRVUZETzA5QlEyNUZPMDFCUTBRc1ZVRkJWU3hEUVVGRExFbEJRVWtzUTBGQlF5eEhRVUZITEdWQlFXVXNRMEZCUXl4RlFVRkZMRVZCUVVNN1MwRkRka01zUlVGQlF6dEhRVU5JTEUxQlFVMDdTVUZEVEN4TlFVRk5MRU5CUVVNc1NVRkJTU3hEUVVGRExFdEJRVXNzUTBGQlF5eERRVUZETEU5QlFVOHNWMEZCUXl4TlFVRkxPMDFCUXpsQ0xFbEJRVWtzUzBGQlN5eERRVUZETEVsQlFVa3NRMEZCUXl4TFFVRkxMRXRCUVVzc1JVRkJSVHRSUVVONlFpeE5RVUZOTzA5QlExQTdUVUZEUkN4SlFVRkpMRU5CUVVNc1YwRkJWeXhEUVVGRExFdEJRVXNzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RlFVRkZPMUZCUXpkQ0xGVkJRVlVzUTBGQlF5d3dSRUZCTUVRc1JVRkJRenRQUVVOMlJUdE5RVU5FTEVsQlFVa3NTMEZCU3l4RFFVRkRMRWxCUVVrc1EwRkJReXhMUVVGTExFbEJRVWtzUlVGQlJUdFJRVU40UWl4VlFVRlZMRU5CUVVNc1NVRkJTU3hEUVVGRExFZEJRVWNzWlVGQlpTeERRVUZETEVWQlFVVXNSVUZCUXp0UlFVTjBReXhOUVVGTk8wOUJRMUE3TzAxQlJVUXNTVUZCU1N4MVFrRkJkVUlzUTBGQlF5eExRVUZMTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNc1JVRkJSVHRSUVVONFF5eGxRVUZsTEVOQlFVTXNTMEZCU3l4RFFVRkRMRWxCUVVrc1EwRkJReXhGUVVGRE8wOUJRemRDT3p0TlFVVkVMRWxCUVVrc2EwSkJRV3RDTEVOQlFVTXNTVUZCU1N4RFFVRkRMRVZCUVVVN08xRkJSVFZDTEU5QlFVOHNhMEpCUVd0Q0xFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTXNUVUZCU3p0UlFVTnlReXhKUVVGSkxFOUJRVThzUzBGQlN5eERRVUZETEVsQlFVa3NRMEZCUXl4TFFVRkxMRkZCUVZFc1JVRkJSVHRWUVVOdVF5eFZRVUZWTEVOQlFVTXNTVUZCU1N4RFFVRkRMRWRCUVVjc2IwSkJRVzlDTEVOQlFVTXNTMEZCU3l4RFFVRkRMRWxCUVVrc1EwRkJReXhGUVVGRkxHdENRVUZyUWl4RFFVRkRMRWxCUVVrc1EwRkJReXhGUVVGRE8xTkJReTlGTEUxQlFVMDdWVUZEVEN4VlFVRlZMRU5CUVVNc1NVRkJTU3hEUVVGRExFZEJRVWNzYTBKQlEyUXNTMEZCU3l4RFFVRkRMRWxCUVVrc1EwRkJRenRoUVVOa0xFbEJRVWtzUlVGQlJTeHJRa0ZCYTBJc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eExRVUZKTEVWQlEzQkRPMU5CUTBZN1QwRkRSaXhOUVVGTk8xRkJRMHdzU1VGQlNTeFBRVUZQTEV0QlFVc3NRMEZCUXl4SlFVRkpMRU5CUVVNc1MwRkJTeXhSUVVGUkxFVkJRVVU3VlVGRGJrTXNTVUZCU1N4RFFVRkRUU3h6UTBGQmEwSXNSVUZCUlR0WlFVTjJRaXhWUVVGVkxFTkJRVU1zTmtkQlFUWkhMRVZCUVVNN1YwRkRNVWc3VlVGRFJDeFZRVUZWTEVOQlFVTXNTVUZCU1N4RFFVRkRMRWRCUVVjc2EwSkJRMlJCTEhORFFVRnJRaXhEUVVGRExFdEJRVXNzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RlFVTnVRenRUUVVOR0xFMUJRVTA3VlVGRFRDeFZRVUZWTEVOQlFVTXNTVUZCU1N4RFFVRkRMRWRCUVVjc2EwSkJRMlFzUzBGQlN5eERRVUZETEVsQlFVa3NRMEZCUXl4RlFVTm1PMU5CUTBZN1QwRkRSanM3VFVGRlJDeEpRVUZKTEVkQlFVY3NRMEZCUXl4TlFVRk5MRU5CUVVNc1pVRkJaU3hGUVVGRk8xRkJRemxDTEVkQlFVY3NRMEZCUXl4TlFVRk5MRU5CUVVNc1pVRkJaU3hEUVVGRExFbEJRVWtzUTBGQlF5eEpRVUZKTEVWQlFVTTdUMEZEZEVNN1MwRkRSaXhGUVVGRE8wZEJRMGc3UlVGRFJDeFBRVUZQTEZWQlFWVTdRMEZEYkVJN08wRkJSVVFzVTBGQlV5eGpRVUZqTEVWQlFVVXNWVUZCVlN4RlFVRlZMR2xDUVVGcFFpeEZRVUZWTzBWQlEzUkZMRTFCUVUwc1EwRkJReXhKUVVGSkxFTkJRVU1zVlVGQlZTeERRVUZETEVOQlFVTXNUMEZCVHl4WFFVRkRMRmRCUVZVN08wbEJSWGhETEU5QlFVOHNWVUZCVlN4RFFVRkRMRk5CUVZNc1EwRkJReXhEUVVGRExFMUJRVXM3U1VGRGJFTXNTVUZCU1N4RFFVRkRMRlZCUVZVc1EwRkJReXhUUVVGVExFTkJRVU1zUTBGQlF5eEpRVUZKTEVWQlFVVTdUVUZETDBJc1ZVRkJWU3hEUVVGRExGTkJRVk1zUTBGQlF5eERRVUZETEVsQlFVa3NSMEZCUnl4VlFVRlRPMHRCUTNaRE8wbEJRMFFzYVVKQlFXbENMRU5CUVVNc1UwRkJVeXhEUVVGRExFZEJRVWNzWlVGQlpTeERRVUZETEZWQlFWVXNRMEZCUXl4VFFVRlRMRU5CUVVNc1JVRkJRenM3TzBsQlIzSkZMRWxCUVVrc1IwRkJSeXhEUVVGRExFMUJRVTBzUTBGQlF5eGxRVUZsTEVWQlFVVTdUVUZET1VJc1IwRkJSeXhEUVVGRExFMUJRVTBzUTBGQlF5eGxRVUZsTEVOQlFVTXNTVUZCU1N4RFFVRkRMRk5CUVZNc1JVRkJRenRMUVVNelF6dEhRVU5HTEVWQlFVTTdRMEZEU0RzN1FVRkZSQ3hCUVVGUExGTkJRVk1zTUVKQlFUQkNMRVZCUVVVc1UwRkJVeXhGUVVGeFFqdEZRVU40UlU0c1NVRkJUU3hwUWtGQmFVSXNSMEZCUnl4SFFVRkZPenRGUVVVMVFpeEpRVUZKTEZOQlFWTXNRMEZCUXl4VlFVRlZMRVZCUVVVN1NVRkRlRUlzWTBGQll5eERRVUZETEZOQlFWTXNRMEZCUXl4VlFVRlZMRVZCUVVVc2FVSkJRV2xDTEVWQlFVTTdSMEZEZUVRN08wVkJSVVJETEVsQlFVa3NVVUZCVVN4SFFVRkhMRk5CUVZNc1EwRkJReXhSUVVGUE96czdSVUZIYUVNc1QwRkJUeXhSUVVGUkxFVkJRVVU3U1VGRFppeEpRVUZKTEZGQlFWRXNRMEZCUXl4VlFVRlZMRVZCUVVVN1RVRkRka0lzWTBGQll5eERRVUZETEZGQlFWRXNRMEZCUXl4VlFVRlZMRVZCUVVVc2FVSkJRV2xDTEVWQlFVTTdTMEZEZGtRN1NVRkRSQ3hSUVVGUkxFZEJRVWNzVVVGQlVTeERRVUZETEZGQlFVODdSMEZETlVJN08wVkJSVVFzU1VGQlNTeFRRVUZUTEVOQlFVTXNZVUZCWVN4SlFVRkpMRk5CUVZNc1EwRkJReXhoUVVGaExFTkJRVU1zVlVGQlZTeEZRVUZGTzBsQlEycEZMR05CUVdNc1EwRkJReXhUUVVGVExFTkJRVU1zWVVGQllTeERRVUZETEZWQlFWVXNSVUZCUlN4cFFrRkJhVUlzUlVGQlF6dEhRVU4wUlRzN1JVRkZSQ3hQUVVGUExHbENRVUZwUWp0RFFVTjZRanM3UVVGRlJDeEJRVUZQTEZOQlFWTXNPRUpCUVRoQ0xFVkJRVVVzVVVGQlVTeEZRVUZ4UWp0RlFVTXpSVVFzU1VGQlRTeFZRVUZWTEVkQlFVY3NSMEZCUlR0RlFVTnlRaXhOUVVGTkxFTkJRVU1zU1VGQlNTeERRVUZETEZGQlFWRXNRMEZCUXl4UFFVRlBMRU5CUVVNc1ZVRkJWU3hEUVVGRExFTkJRVU1zVDBGQlR5eFhRVUZGTEVOQlFVTXNSVUZCUlR0SlFVTnVSQ3hKUVVGSkxHMUNRVUZ0UWl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRk8wMUJRekZDTEUxQlFVMDdTMEZEVURzN1NVRkZSQ3hWUVVGVkxFTkJRVU1zUTBGQlF5eERRVUZETEVkQlFVY3NaVUZCWlN4RFFVRkRMRkZCUVZFc1EwRkJReXhQUVVGUExFTkJRVU1zVlVGQlZTeERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRPMGxCUXk5RUxFOUJRVThzVVVGQlVTeERRVUZETEU5QlFVOHNRMEZCUXl4VlFVRlZMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zVFVGQlN6dEpRVU16UXl4UFFVRlBMRlZCUVZVc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eE5RVUZMTzBkQlF6TkNMRVZCUVVNN1JVRkRSaXhQUVVGUExGVkJRVlU3UTBGRGJFSTdPMEZEZWt4RU96dEJRVWxCTEVGQlFVOHNVMEZCVTFVc2FVSkJRV1VzUlVGQlJTeFRRVUZUTEVWQlFXRTdSVUZEY2tRc1NVRkJTU3hUUVVGVExFTkJRVU1zVlVGQlZTeEZRVUZGTzBsQlEzaENMRTFCUVUwc1EwRkJReXhKUVVGSkxFTkJRVU1zVTBGQlV5eERRVUZETEZWQlFWVXNRMEZCUXl4RFFVRkRMRTlCUVU4c1YwRkJSU3hEUVVGRExFVkJRVVU3VFVGRE5VTldMRWxCUVUwc1IwRkJSeXhIUVVGSExGTkJRVk1zUTBGQlF5eFZRVUZWTEVOQlFVTXNRMEZCUXl4RlFVRkRPMDFCUTI1RExFbEJRVWtzUTBGQlF5eEhRVUZITEVOQlFVTXNUVUZCVFN4RlFVRkZPMUZCUTJaVkxHbENRVUZsTEVOQlFVTXNSMEZCUnl4RlFVRkRPMDlCUTNKQ08wdEJRMFlzUlVGQlF6dEhRVU5JTzBWQlEwUXNTVUZCU1N4VFFVRlRMRU5CUVVNc1QwRkJUeXhGUVVGRk8wbEJRM0pDUVN4cFFrRkJaU3hEUVVGRExGTkJRVk1zUTBGQlF5eFBRVUZQTEVWQlFVTTdSMEZEYmtNN1JVRkRSQ3hKUVVGSkxGTkJRVk1zUTBGQlF5eFJRVUZSTEVWQlFVVTdTVUZEZEVJc1RVRkJUU3hEUVVGRExFMUJRVTBzUTBGQlF5eFRRVUZUTEVWQlFVVktMSE5EUVVGclFpeERRVUZETEZOQlFWTXNRMEZCUXl4UlFVRlJMRU5CUVVNc1JVRkJRenRIUVVOcVJUdERRVU5HT3p0QlEyNUNZeXhUUVVGVExIRkNRVUZ4UWl4RlFVRkZMRTlCUVU4c1JVRkJSVHRGUVVOMFJDeFBRVUZQTEU5QlFVOHNRMEZCUXl4cFFrRkJaMEk3UlVGREwwSXNUMEZCVHl4UFFVRlBMRU5CUVVNc1RVRkJTenRGUVVOd1FpeFBRVUZQTEU5QlFVOHNRMEZCUXl4TlFVRkxPMFZCUTNCQ0xFOUJRVThzVDBGQlR5eERRVUZETEZOQlFWRTdSVUZEZGtJc1QwRkJUeXhQUVVGUExFTkJRVU1zVFVGQlN6dEZRVU53UWl4UFFVRlBMRTlCUVU4c1EwRkJReXhSUVVGUE8wVkJRM1JDTEU5QlFVOHNUMEZCVHl4RFFVRkRMRTFCUVVzN1JVRkRjRUlzVDBGQlR5eFBRVUZQTEVOQlFVTXNUVUZCU3p0RlFVTndRaXhQUVVGUExFOUJRVThzUTBGQlF5eFZRVUZUTzBOQlEzcENPenRCUTFaRU96dEJRVTFCTEZOQlFWTXNjVUpCUVhGQ0xFVkJRVVVzUzBGQlZTeEZRVUZGTEVOQlFVTXNSVUZCUlRzclFrRkJWaXhIUVVGSE96dEZRVU4wUXl4SlFVRkpMRXRCUVVzc1EwRkJReXhQUVVGUExFTkJRVU1zUzBGQlN5eERRVUZETEU5QlFVOHNRMEZCUXl4RlFVRkZPMGxCUTJoRExFOUJRVThzUzBGQlN5eERRVUZETEU5QlFVOHNRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJReXhEUVVGRE8wZEJRelZDT3p0RlFVVkVMRWxCUVVrc1QwRkJUeXhMUVVGTExFTkJRVU1zVDBGQlR5eExRVUZMTEZGQlFWRXNSVUZCUlR0SlFVTnlReXhQUVVGUExFTkJRVU1zUTBGQlF5eERRVUZEUVN4elEwRkJhMElzUTBGQlF5eExRVUZMTEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNc1EwRkJRenRIUVVNNVF6dEZRVU5FVGl4SlFVRk5MRkZCUVZFc1IwRkJSeXhIUVVGRk8wVkJRMjVDTEUxQlFVMHNRMEZCUXl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU1zVDBGQlR5eFhRVUZETEZWQlFWTTdTVUZEYkVNc1NVRkJTU3hMUVVGTExFTkJRVU1zVDBGQlR5eERRVUZETEV0QlFVc3NRMEZCUXl4UlFVRlJMRU5CUVVNc1EwRkJReXhGUVVGRk8wMUJRMnhETEV0QlFVc3NRMEZCUXl4UlFVRlJMRU5CUVVNc1EwRkJReXhQUVVGUExGZEJRVU1zVFVGQlN6dFJRVU16UWtFc1NVRkJUU3hUUVVGVExFZEJRVWNzVDBGQlR5eEpRVUZKTEV0QlFVc3NVVUZCVVN4SFFVRkhUU3h6UTBGQmEwSXNRMEZCUXl4SlFVRkpMRU5CUVVNc1IwRkJSeXhMUVVGSk8xRkJRelZGVGl4SlFVRk5MRTlCUVU4c1IwRkJSeXhEUVVGRExFTkJRVU1zVTBGQlV5eEZRVUZETzFGQlF6VkNMRTlCUVU4c1EwRkJReXhKUVVGSkxFTkJRVU1zU1VGQlNTeEhRVUZITEZOQlFWRTdVVUZETlVJc1VVRkJVU3hEUVVGRExFbEJRVWtzUTBGQlF5eFBRVUZQTEVWQlFVTTdUMEZEZGtJc1JVRkJRenRMUVVOSUxFMUJRVTA3VFVGRFRFRXNTVUZCVFN4VFFVRlRMRWRCUVVjc1QwRkJUeXhMUVVGTExFTkJRVU1zVVVGQlVTeERRVUZETEV0QlFVc3NVVUZCVVN4SFFVRkhUU3h6UTBGQmEwSXNRMEZCUXl4TFFVRkxMRU5CUVVNc1VVRkJVU3hEUVVGRExFTkJRVU1zUjBGQlJ5eExRVUZMTEVOQlFVTXNVVUZCVVN4RlFVRkRPMDFCUXpkSFRpeEpRVUZOTEVsQlFVa3NSMEZCUnl4RFFVRkRMRU5CUVVNc1UwRkJVeXhGUVVGRE8wMUJRM3BDTEVsQlFVa3NRMEZCUXl4SlFVRkpMRU5CUVVNc1NVRkJTU3hIUVVGSExGTkJRVkU3VFVGRGVrSXNVVUZCVVN4RFFVRkRMRWxCUVVrc1EwRkJReXhKUVVGSkxFVkJRVU03UzBGRGNFSTdSMEZEUml4RlFVRkRPMFZCUTBZc1QwRkJUeXhSUVVGUk8wTkJRMmhDT3p0QlFVVkVMRUZCUVdVc1UwRkJVeXg1UWtGQmVVSXNSVUZCUlN4VFFVRlRMRVZCUVdFc1pVRkJaU3hGUVVGWE8wVkJRMnBITEVsQlFVa3NaVUZCWlN4RFFVRkRMRTlCUVU4c1NVRkJTU3hQUVVGUExHVkJRV1VzUTBGQlF5eFBRVUZQTEV0QlFVc3NVVUZCVVN4RlFVRkZPMGxCUXpGRkxGVkJRVlVzUTBGQlF5eHBRMEZCYVVNc1JVRkJRenRIUVVNNVF6dEZRVU5FTEVsQlFVa3NaVUZCWlN4RFFVRkRMRXRCUVVzc1JVRkJSVHRKUVVONlFpeGhRVUZoTEVOQlFVTXNaVUZCWlN4RFFVRkRMRXRCUVVzc1JVRkJRenRIUVVOeVF6czdSVUZGUkN4UFFVRlBPMGxCUTB3c2RVSkJRVTBzUlVGQlJTeERRVUZETEVWQlFWazdUVUZEYmtJc1QwRkJUeXhEUVVGRE8xRkJRMDRzVTBGQlV6dFJRVU5VTEdWQlFXVXNRMEZCUXl4UFFVRlBMRWxCUVVrc1UwRkJVeXhEUVVGRExIVkNRVUYxUWp0UlFVTTFSQ3hEUVVGRExHVkJRV1VzUTBGQlF5eFBRVUZQTEVsQlFVa3NaVUZCWlN4RFFVRkRMRTlCUVU4c1EwRkJReXhSUVVGUkxFbEJRVWtzWlVGQlpTeERRVUZETEU5QlFVOHNRMEZCUXl4UlFVRlJMRU5CUVVNc1IwRkJSeXhYUVVGRExFZEJRVVVzVTBGQlJ5eFBRVUZQTEVOQlFVTXNTMEZCU3l4VlFVRlZMRWRCUVVjc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eEhRVUZITEVsQlFVTXNRMEZCUXl4TFFVRkxMSEZDUVVGeFFpeERRVUZETEdWQlFXVXNRMEZCUXl4TFFVRkxMRVZCUVVVc1EwRkJReXhEUVVGRE8wOUJRMnhOTzB0QlEwWTdTVUZEUkN4SlFVRkpMRVZCUVVVc1UwRkJVeXhEUVVGRExFbEJRVWs3U1VGRGNFSXNjMEpCUVhOQ0xFVkJRVVVzU1VGQlNUdEhRVU0zUWp0RFFVTkdPenRCUTNCRVJEczdRVUZwUWtFc1FVRkJaU3hUUVVGVExHTkJRV003UlVGRGNFTXNVMEZCVXp0RlFVTlVMRTlCUVU4N1JVRkRVQ3hIUVVGSE8wVkJRMUU3UlVGRFdDeEpRVUZKTEU5QlFVOHNRMEZCUXl4TFFVRkxMRVZCUVVVN1NVRkRha0lzVVVGQlVTeERRVUZETEU5QlFVOHNRMEZCUXl4TFFVRkxMRVZCUVVVc1IwRkJSeXhGUVVGRE8wZEJRemRDT3p0RlFVVkVMRWxCUVVrc1EwRkJReXhUUVVGVExFTkJRVU1zVDBGQlR5eEpRVUZKTEZOQlFWTXNRMEZCUXl4UFFVRlBMRU5CUVVNc1ZVRkJWU3hMUVVGTExGTkJRVk1zUTBGQlF5eFZRVUZWTEVWQlFVVTdTVUZETDBVc1UwRkJVeXhIUVVGSExIbENRVUY1UWl4RFFVRkRMRk5CUVZNc1JVRkJSU3hQUVVGUExFVkJRVU03UjBGRE1VUXNUVUZCVFN4SlFVRkpMRTlCUVU4c1EwRkJReXhQUVVGUExFVkJRVVU3U1VGRE1VSXNWVUZCVlR0TlFVTlNMSEZGUVVGeFJUdE5RVU4wUlR0SFFVTkdPenRGUVVWRUxFbEJRVWtzVDBGQlR5eERRVUZETEU5QlFVOHNSVUZCUlR0SlFVTnVRaXhWUVVGVkxFTkJRVU1zVTBGQlV5eEZRVUZGTEU5QlFVOHNRMEZCUXl4UFFVRlBMRVZCUVVVc1QwRkJUeXhGUVVGRE8wZEJRMmhFT3p0RlFVVkVMRWxCUVVrc2RVSkJRWFZDTEVOQlFVTXNVMEZCVXl4RFFVRkRMRVZCUVVVN1NVRkRkRU5WTEdsQ1FVRmxMRU5CUVVNc1UwRkJVeXhGUVVGRE8wZEJRek5DT3p0RlFVVkVMR05CUVdNc1EwRkJReXhIUVVGSExFVkJRVU03TzBWQlJXNUNWaXhKUVVGTkxGZEJRVmNzUjBGQlJ5eEhRVUZITEVOQlFVTXNUVUZCVFN4RFFVRkRMRk5CUVZNc1JVRkJRenM3UlVGRmVrTkJMRWxCUVUwc1pVRkJaU3hIUVVGSExHdENRVUZMTEU5QlFVOHNSVUZCUlR0RlFVTjBRMWNzY1VKQlFXRXNRMEZCUXl4bFFVRmxMRVZCUVVNN1JVRkRPVUlzU1VGQlNTeFBRVUZQTEVOQlFVTXNTMEZCU3l4RlFVRkZPMGxCUTJwQ0xHVkJRV1VzUTBGQlF5eFZRVUZWTEVkQlFVY3NhMEpCUTNoQ0xHVkJRV1VzUTBGQlF5eFZRVUZWT3p0TlFVVTNRaXh2UWtGQmRVSXNRMEZCUXl4VFFVRlRMRU5CUVVNc1ZVRkJWU3hGUVVGRkxFOUJRVThzUTBGQlF5eExRVUZMTEVOQlFVTXNSVUZETjBRN1IwRkRSanM3UlVGRlJGZ3NTVUZCVFN4RlFVRkZMRWRCUVVjc1NVRkJTU3hYUVVGWExFTkJRVU1zWlVGQlpTeEZRVUZET3p0RlFVVXpReXhSUVVGUkxFTkJRVU1zUlVGQlJTeEZRVUZGTEU5QlFVOHNRMEZCUXl4TFFVRkxMRVZCUVVNN1JVRkRNMElzV1VGQldTeERRVUZETEVWQlFVVXNSVUZCUlN4UFFVRlBMRU5CUVVNc1UwRkJVeXhGUVVGRE96dEZRVVZ1UXl4SlFVRkpMRTlCUVU4c1EwRkJReXhYUVVGWExFVkJRVVU3U1VGRGRrSXNTVUZCU1N4TlFVRk5MRU5CUVVNc1UwRkJVeXhEUVVGRExGTkJRVk1zUTBGQlF5eExRVUZMTEVOQlFVTXNXVUZCV1N4RFFVRkRMRVZCUVVVN1RVRkRiRVFzVlVGQlZTeERRVUZETEN0R1FVRXJSaXhGUVVGRE8wdEJRelZITzBsQlEwUkJMRWxCUVUwc1ZVRkJWU3hIUVVGSExFMUJRVTBzUjBGQlNTeEhRVUZITEVOQlFVTXNUMEZCVHl4RFFVRkRMRXRCUVVzc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF5eERRVUZETEZsQlFVc3NSMEZCUnl4RFFVRkRMRTlCUVU4c1EwRkJReXhMUVVGTExFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRWxCUVVjN1NVRkRkRVlzU1VGQlNTeFZRVUZWTEVsQlFVa3NSMEZCUnl4RlFVRkZPMDFCUTNKQ0xFVkJRVVVzUTBGQlF5d3dRa0ZCTUVJc1IwRkJSeXhIUVVGRk8wMUJRMnhETEVWQlFVVXNRMEZCUXl4NVFrRkJlVUlzUjBGQlJ5eEhRVUZGTzAxQlEycERRU3hKUVVGTkxGVkJRVlVzUjBGQlJ5eEZRVUZGTEVOQlFVTXNXVUZCV1N4RFFVRkRMRWRCUVVVN08wMUJSWEpETEVWQlFVVXNRMEZCUXl4WlFVRlpMRU5CUVVNc1JVRkJSU3hIUVVGSExGVkJRVlVzU1VGQlNTeEZRVUZGTEZGQlFWRXNSVUZCUlN4TFFVRkxMRVZCUVVVc1ZVRkJWU3hGUVVGRk8xRkJRMmhGUVN4SlFVRk5MRmxCUVZrc1IwRkJSeXhGUVVGRkxFTkJRVU1zTUVKQlFUQkNMRU5CUVVNc1NVRkJTU3hGUVVGRE8xRkJRM2hFUVN4SlFVRk5MRk5CUVZNc1IwRkJSeXhGUVVGRkxFTkJRVU1zZVVKQlFYbENMRU5CUVVNc1NVRkJTU3hGUVVGRE8xRkJRM0JFTEVsQlFVa3NXVUZCV1N4RlFVRkZPMVZCUTJoQ0xFdEJRVXNzUjBGQlJ5eHJRa0ZCU3l4VlFVRlZMRVZCUVVVc1MwRkJVU3hGUVVGRk8xVkJRMjVEUVN4SlFVRk5MRXRCUVVzc1IwRkJSeXhIUVVGRk8xVkJRMmhDUVN4SlFVRk5MRTlCUVU4c1IwRkJSeXhEUVVGRExFbEJRVWtzUlVGQlJTeEpRVUZKTEVWQlFVVXNTVUZCU1N4RlFVRkZMRWxCUVVrc1JVRkJSU3hKUVVGSkxFVkJRVVVzU1VGQlNTeEZRVUZGTEVsQlFVa3NSVUZCUlN4SlFVRkpMRVZCUVVVc1NVRkJTU3hGUVVGRkxFbEJRVWtzUlVGQlJTeEpRVUZKTEVWQlFVVXNTVUZCU1N4RlFVRkZMRWxCUVVrc1JVRkJSU3hKUVVGSkxFVkJRVVVzU1VGQlNTeEZRVUZGTEVsQlFVa3NSVUZCUXp0VlFVTm9TQ3hQUVVGUExFTkJRVU1zVDBGQlR5eFhRVUZGTEVkQlFVY3NSVUZCUlR0WlFVTndRaXhMUVVGTExFTkJRVU1zUjBGQlJ5eERRVUZETEVkQlFVY3NSVUZCUlN4RFFVRkRMRmxCUVZrc1EwRkJReXhIUVVGSExFVkJRVU03VjBGRGJFTXNSVUZCUXp0VlFVTkdMRXRCUVVzc1EwRkJReXhUUVVGVExFTkJRVU1zUjBGQlJ5eE5RVUZMTzFWQlEzaENMRTlCUVU4c1dVRkJXU3hEUVVGRExFbEJRVWtzUTBGQlF5eExRVUZMTEVOQlFVTTdVMEZEYUVNc1RVRkJUVHRWUVVOTUxFOUJRVThzVlVGQlZTeERRVUZETEVsQlFVa3NRMEZCUXl4RlFVRkZMRU5CUVVNc1dVRkJXU3hGUVVGRkxFbEJRVWtzUlVGQlJTeFJRVUZSTEVWQlFVVXNTMEZCU3l4RlFVRkZMRlZCUVZVc1EwRkJRenRUUVVNelJUdFJRVU5HT3pzN1RVRkhSQ3hqUVVGakxFTkJRVU1zUlVGQlJTeEZRVUZGTEU5QlFVOHNRMEZCUXl4WFFVRlhMRVZCUVVNN1MwRkRlRU1zVFVGQlRUdE5RVU5NTEZWQlFWVXNRMEZCUXl4MVJFRkJkVVFzUlVGQlF6dExRVU53UlR0SFFVTkdPenRGUVVWRUxFbEJRVWtzVDBGQlR5eERRVUZETEV0QlFVc3NSVUZCUlR0SlFVTnFRaXhSUVVGUkxFTkJRVU1zUlVGQlJTeEZRVUZGTEU5QlFVOHNRMEZCUXl4TFFVRkxMRVZCUVVNN1IwRkROVUk3TzBWQlJVUXNUMEZCVHl4RlFVRkZPME5CUTFZN08wRkRjRWRFT3p0QlFVVkJMRUZCUVdVc1UwRkJVeXhoUVVGaExFbEJRWGRDTzBWQlF6TkVMRWxCUVVrc1VVRkJVU3hGUVVGRk8wbEJRMXBCTEVsQlFVMHNTVUZCU1N4SFFVRkhMRkZCUVZFc1EwRkJReXhoUVVGaExFTkJRVU1zUzBGQlN5eEZRVUZET3p0SlFVVXhReXhKUVVGSkxGRkJRVkVzUTBGQlF5eEpRVUZKTEVWQlFVVTdUVUZEYWtJc1VVRkJVU3hEUVVGRExFbEJRVWtzUTBGQlF5eFhRVUZYTEVOQlFVTXNTVUZCU1N4RlFVRkRPMHRCUTJoRE8wbEJRMFFzVDBGQlR5eEpRVUZKTzBkQlExbzdRMEZEUmpzN1FVTllSRHM3T3pzN096dEJRVTlCTEZOQlFWTXNZMEZCWXl4SFFVRkhPMFZCUTNoQ0xFbEJRVWtzUTBGQlF5eFJRVUZSTEVkQlFVY3NSVUZCUlN4RFFVRkRPMFZCUTI1Q0xFbEJRVWtzUTBGQlF5eEpRVUZKTEVkQlFVY3NRMEZCUXl4RFFVRkRPME5CUTJZN08wRkJSVVFzYlVKQlFXTXNSMEZCUnl4alFVRmpMRU5CUVVNN08wRkRXbWhET3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096dEJRV2REUVN4VFFVRlRMRVZCUVVVc1EwRkJReXhMUVVGTExFVkJRVVVzUzBGQlN5eEZRVUZGTzBWQlEzaENMRTlCUVU4c1MwRkJTeXhMUVVGTExFdEJRVXNzUzBGQlN5eExRVUZMTEV0QlFVc3NTMEZCU3l4SlFVRkpMRXRCUVVzc1MwRkJTeXhMUVVGTExFTkJRVU1zUTBGQlF6dERRVU5vUlRzN1FVRkZSQ3hSUVVGakxFZEJRVWNzUlVGQlJTeERRVUZET3pzN096czdPenM3TzBGRE1VSndRaXhUUVVGVExGbEJRVmtzUTBGQlF5eExRVUZMTEVWQlFVVXNSMEZCUnl4RlFVRkZPMFZCUTJoRExFbEJRVWtzVFVGQlRTeEhRVUZITEV0QlFVc3NRMEZCUXl4TlFVRk5MRU5CUVVNN1JVRkRNVUlzVDBGQlR5eE5RVUZOTEVWQlFVVXNSVUZCUlR0SlFVTm1MRWxCUVVsWkxFbEJRVVVzUTBGQlF5eExRVUZMTEVOQlFVTXNUVUZCVFN4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVVVzUjBGQlJ5eERRVUZETEVWQlFVVTdUVUZETjBJc1QwRkJUeXhOUVVGTkxFTkJRVU03UzBGRFpqdEhRVU5HTzBWQlEwUXNUMEZCVHl4RFFVRkRMRU5CUVVNc1EwRkJRenREUVVOWU96dEJRVVZFTEdsQ1FVRmpMRWRCUVVjc1dVRkJXU3hEUVVGRE96czdRVU5xUWpsQ0xFbEJRVWtzVlVGQlZTeEhRVUZITEV0QlFVc3NRMEZCUXl4VFFVRlRMRU5CUVVNN096dEJRVWRxUXl4SlFVRkpMRTFCUVUwc1IwRkJSeXhWUVVGVkxFTkJRVU1zVFVGQlRTeERRVUZET3pzN096czdPenM3T3p0QlFWY3ZRaXhUUVVGVExHVkJRV1VzUTBGQlF5eEhRVUZITEVWQlFVVTdSVUZETlVJc1NVRkJTU3hKUVVGSkxFZEJRVWNzU1VGQlNTeERRVUZETEZGQlFWRTdUVUZEY0VJc1MwRkJTeXhIUVVGSFF5eGhRVUZaTEVOQlFVTXNTVUZCU1N4RlFVRkZMRWRCUVVjc1EwRkJReXhEUVVGRE96dEZRVVZ3UXl4SlFVRkpMRXRCUVVzc1IwRkJSeXhEUVVGRExFVkJRVVU3U1VGRFlpeFBRVUZQTEV0QlFVc3NRMEZCUXp0SFFVTmtPMFZCUTBRc1NVRkJTU3hUUVVGVExFZEJRVWNzU1VGQlNTeERRVUZETEUxQlFVMHNSMEZCUnl4RFFVRkRMRU5CUVVNN1JVRkRhRU1zU1VGQlNTeExRVUZMTEVsQlFVa3NVMEZCVXl4RlFVRkZPMGxCUTNSQ0xFbEJRVWtzUTBGQlF5eEhRVUZITEVWQlFVVXNRMEZCUXp0SFFVTmFMRTFCUVUwN1NVRkRUQ3hOUVVGTkxFTkJRVU1zU1VGQlNTeERRVUZETEVsQlFVa3NSVUZCUlN4TFFVRkxMRVZCUVVVc1EwRkJReXhEUVVGRExFTkJRVU03UjBGRE4wSTdSVUZEUkN4RlFVRkZMRWxCUVVrc1EwRkJReXhKUVVGSkxFTkJRVU03UlVGRFdpeFBRVUZQTEVsQlFVa3NRMEZCUXp0RFFVTmlPenRCUVVWRUxHOUNRVUZqTEVkQlFVY3NaVUZCWlN4RFFVRkRPenM3T3pzN096czdPenRCUTNaQ2FrTXNVMEZCVXl4WlFVRlpMRU5CUVVNc1IwRkJSeXhGUVVGRk8wVkJRM3BDTEVsQlFVa3NTVUZCU1N4SFFVRkhMRWxCUVVrc1EwRkJReXhSUVVGUk8wMUJRM0JDTEV0QlFVc3NSMEZCUjBFc1lVRkJXU3hEUVVGRExFbEJRVWtzUlVGQlJTeEhRVUZITEVOQlFVTXNRMEZCUXpzN1JVRkZjRU1zVDBGQlR5eExRVUZMTEVkQlFVY3NRMEZCUXl4SFFVRkhMRk5CUVZNc1IwRkJSeXhKUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1EwRkRMME03TzBGQlJVUXNhVUpCUVdNc1IwRkJSeXhaUVVGWkxFTkJRVU03T3pzN096czdPenM3TzBGRFVEbENMRk5CUVZNc1dVRkJXU3hEUVVGRExFZEJRVWNzUlVGQlJUdEZRVU42UWl4UFFVRlBRU3hoUVVGWkxFTkJRVU1zU1VGQlNTeERRVUZETEZGQlFWRXNSVUZCUlN4SFFVRkhMRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU1zUTBGQlF6dERRVU01UXpzN1FVRkZSQ3hwUWtGQll5eEhRVUZITEZsQlFWa3NRMEZCUXpzN096czdPenM3T3pzN08wRkRTRGxDTEZOQlFWTXNXVUZCV1N4RFFVRkRMRWRCUVVjc1JVRkJSU3hMUVVGTExFVkJRVVU3UlVGRGFFTXNTVUZCU1N4SlFVRkpMRWRCUVVjc1NVRkJTU3hEUVVGRExGRkJRVkU3VFVGRGNFSXNTMEZCU3l4SFFVRkhRU3hoUVVGWkxFTkJRVU1zU1VGQlNTeEZRVUZGTEVkQlFVY3NRMEZCUXl4RFFVRkRPenRGUVVWd1F5eEpRVUZKTEV0QlFVc3NSMEZCUnl4RFFVRkRMRVZCUVVVN1NVRkRZaXhGUVVGRkxFbEJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTTdTVUZEV2l4SlFVRkpMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUjBGQlJ5eEZRVUZGTEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNN1IwRkRla0lzVFVGQlRUdEpRVU5NTEVsQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUjBGQlJ5eExRVUZMTEVOQlFVTTdSMEZEZUVJN1JVRkRSQ3hQUVVGUExFbEJRVWtzUTBGQlF6dERRVU5pT3p0QlFVVkVMR2xDUVVGakxFZEJRVWNzV1VGQldTeERRVUZET3pzN096czdPenM3UVVOYU9VSXNVMEZCVXl4VFFVRlRMRU5CUVVNc1QwRkJUeXhGUVVGRk96czdSVUZETVVJc1NVRkJTU3hMUVVGTExFZEJRVWNzUTBGQlF5eERRVUZETzAxQlExWXNUVUZCVFN4SFFVRkhMRTlCUVU4c1NVRkJTU3hKUVVGSkxFZEJRVWNzUTBGQlF5eEhRVUZITEU5QlFVOHNRMEZCUXl4TlFVRk5MRU5CUVVNN08wVkJSV3hFTEVsQlFVa3NRMEZCUXl4TFFVRkxMRVZCUVVVc1EwRkJRenRGUVVOaUxFOUJRVThzUlVGQlJTeExRVUZMTEVkQlFVY3NUVUZCVFN4RlFVRkZPMGxCUTNaQ0xFbEJRVWtzUzBGQlN5eEhRVUZITEU5QlFVOHNRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJRenRKUVVNelFsWXNUVUZCU1N4RFFVRkRMRWRCUVVjc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNTMEZCU3l4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03UjBGRE9VSTdRMEZEUmpzN08wRkJSMFFzVTBGQlV5eERRVUZETEZOQlFWTXNRMEZCUXl4TFFVRkxMRWRCUVVkWExHVkJRV01zUTBGQlF6dEJRVU16UXl4VFFVRlRMRU5CUVVNc1UwRkJVeXhEUVVGRExGRkJRVkVzUTBGQlF5eEhRVUZIUXl4blFrRkJaU3hEUVVGRE8wRkJRMmhFTEZOQlFWTXNRMEZCUXl4VFFVRlRMRU5CUVVNc1IwRkJSeXhIUVVGSFF5eGhRVUZaTEVOQlFVTTdRVUZEZGtNc1UwRkJVeXhEUVVGRExGTkJRVk1zUTBGQlF5eEhRVUZITEVkQlFVZERMR0ZCUVZrc1EwRkJRenRCUVVOMlF5eFRRVUZUTEVOQlFVTXNVMEZCVXl4RFFVRkRMRWRCUVVjc1IwRkJSME1zWVVGQldTeERRVUZET3p0QlFVVjJReXhqUVVGakxFZEJRVWNzVTBGQlV5eERRVUZET3pzN096czdPenM3UVVOMFFqTkNMRk5CUVZNc1ZVRkJWU3hIUVVGSE8wVkJRM0JDTEVsQlFVa3NRMEZCUXl4UlFVRlJMRWRCUVVjc1NVRkJTVU1zVlVGQlV5eERRVUZETzBWQlF6bENMRWxCUVVrc1EwRkJReXhKUVVGSkxFZEJRVWNzUTBGQlF5eERRVUZETzBOQlEyWTdPMEZCUlVRc1pVRkJZeXhIUVVGSExGVkJRVlVzUTBGQlF6czdRVU5rTlVJN096czdPenM3T3p0QlFWTkJMRk5CUVZNc1YwRkJWeXhEUVVGRExFZEJRVWNzUlVGQlJUdEZRVU40UWl4SlFVRkpMRWxCUVVrc1IwRkJSeXhKUVVGSkxFTkJRVU1zVVVGQlVUdE5RVU53UWl4TlFVRk5MRWRCUVVjc1NVRkJTU3hEUVVGRExGRkJRVkVzUTBGQlF5eERRVUZETEVkQlFVY3NRMEZCUXl4RFFVRkRPenRGUVVWcVF5eEpRVUZKTEVOQlFVTXNTVUZCU1N4SFFVRkhMRWxCUVVrc1EwRkJReXhKUVVGSkxFTkJRVU03UlVGRGRFSXNUMEZCVHl4TlFVRk5MRU5CUVVNN1EwRkRaanM3UVVGRlJDeG5Ra0ZCWXl4SFFVRkhMRmRCUVZjc1EwRkJRenM3UVVOcVFqZENPenM3T3pzN096czdRVUZUUVN4VFFVRlRMRkZCUVZFc1EwRkJReXhIUVVGSExFVkJRVVU3UlVGRGNrSXNUMEZCVHl4SlFVRkpMRU5CUVVNc1VVRkJVU3hEUVVGRExFZEJRVWNzUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXp0RFFVTXZRanM3UVVGRlJDeGhRVUZqTEVkQlFVY3NVVUZCVVN4RFFVRkRPenRCUTJJeFFqczdPenM3T3pzN08wRkJVMEVzVTBGQlV5eFJRVUZSTEVOQlFVTXNSMEZCUnl4RlFVRkZPMFZCUTNKQ0xFOUJRVThzU1VGQlNTeERRVUZETEZGQlFWRXNRMEZCUXl4SFFVRkhMRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU03UTBGREwwSTdPMEZCUlVRc1lVRkJZeXhIUVVGSExGRkJRVkVzUTBGQlF6czdPenM3T3pzN1FVTmlNVUk3UVVGRFFTeEpRVUZKTEZWQlFWVXNSMEZCUnl4UFFVRlBReXhqUVVGTkxFbEJRVWtzVVVGQlVTeEpRVUZKUVN4alFVRk5MRWxCUVVsQkxHTkJRVTBzUTBGQlF5eE5RVUZOTEV0QlFVc3NUVUZCVFN4SlFVRkpRU3hqUVVGTkxFTkJRVU03TzBGQlJUTkdMR1ZCUVdNc1IwRkJSeXhWUVVGVkxFTkJRVU03T3p0QlEwRTFRaXhKUVVGSkxGRkJRVkVzUjBGQlJ5eFBRVUZQTEVsQlFVa3NTVUZCU1N4UlFVRlJMRWxCUVVrc1NVRkJTU3hKUVVGSkxFbEJRVWtzUTBGQlF5eE5RVUZOTEV0QlFVc3NUVUZCVFN4SlFVRkpMRWxCUVVrc1EwRkJRenM3TzBGQlIycEdMRWxCUVVrc1NVRkJTU3hIUVVGSFF5eFhRVUZWTEVsQlFVa3NVVUZCVVN4SlFVRkpMRkZCUVZFc1EwRkJReXhoUVVGaExFTkJRVU1zUlVGQlJTeERRVUZET3p0QlFVVXZSQ3hUUVVGakxFZEJRVWNzU1VGQlNTeERRVUZET3pzN1FVTk1kRUlzU1VGQlNTeE5RVUZOTEVkQlFVZERMRXRCUVVrc1EwRkJReXhOUVVGTkxFTkJRVU03TzBGQlJYcENMRmRCUVdNc1IwRkJSeXhOUVVGTkxFTkJRVU03T3p0QlEwWjRRaXhKUVVGSkxGZEJRVmNzUjBGQlJ5eE5RVUZOTEVOQlFVTXNVMEZCVXl4RFFVRkRPenM3UVVGSGJrTXNTVUZCU1N4alFVRmpMRWRCUVVjc1YwRkJWeXhEUVVGRExHTkJRV01zUTBGQlF6czdPenM3T3p0QlFVOW9SQ3hKUVVGSkxHOUNRVUZ2UWl4SFFVRkhMRmRCUVZjc1EwRkJReXhSUVVGUkxFTkJRVU03T3p0QlFVZG9SQ3hKUVVGSkxHTkJRV01zUjBGQlIwTXNUMEZCVFN4SFFVRkhRU3hQUVVGTkxFTkJRVU1zVjBGQlZ5eEhRVUZITEZOQlFWTXNRMEZCUXpzN096czdPenM3TzBGQlV6ZEVMRk5CUVZNc1UwRkJVeXhEUVVGRExFdEJRVXNzUlVGQlJUdEZRVU40UWl4SlFVRkpMRXRCUVVzc1IwRkJSeXhqUVVGakxFTkJRVU1zU1VGQlNTeERRVUZETEV0QlFVc3NSVUZCUlN4alFVRmpMRU5CUVVNN1RVRkRiRVFzUjBGQlJ5eEhRVUZITEV0QlFVc3NRMEZCUXl4alFVRmpMRU5CUVVNc1EwRkJRenM3UlVGRmFFTXNTVUZCU1R0SlFVTkdMRXRCUVVzc1EwRkJReXhqUVVGakxFTkJRVU1zUjBGQlJ5eFRRVUZUTEVOQlFVTTdTVUZEYkVNc1NVRkJTU3hSUVVGUkxFZEJRVWNzU1VGQlNTeERRVUZETzBkQlEzSkNMRU5CUVVNc1QwRkJUeXhEUVVGRExFVkJRVVVzUlVGQlJUczdSVUZGWkN4SlFVRkpMRTFCUVUwc1IwRkJSeXh2UWtGQmIwSXNRMEZCUXl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU03UlVGRE9VTXNTVUZCU1N4UlFVRlJMRVZCUVVVN1NVRkRXaXhKUVVGSkxFdEJRVXNzUlVGQlJUdE5RVU5VTEV0QlFVc3NRMEZCUXl4alFVRmpMRU5CUVVNc1IwRkJSeXhIUVVGSExFTkJRVU03UzBGRE4wSXNUVUZCVFR0TlFVTk1MRTlCUVU4c1MwRkJTeXhEUVVGRExHTkJRV01zUTBGQlF5eERRVUZETzB0QlF6bENPMGRCUTBZN1JVRkRSQ3hQUVVGUExFMUJRVTBzUTBGQlF6dERRVU5tT3p0QlFVVkVMR05CUVdNc1IwRkJSeXhUUVVGVExFTkJRVU03TzBGRE4wTXpRanRCUVVOQkxFbEJRVWxETEdGQlFWY3NSMEZCUnl4TlFVRk5MRU5CUVVNc1UwRkJVeXhEUVVGRE96czdPenM3TzBGQlQyNURMRWxCUVVsRExITkNRVUZ2UWl4SFFVRkhSQ3hoUVVGWExFTkJRVU1zVVVGQlVTeERRVUZET3pzN096czdPenM3UVVGVGFFUXNVMEZCVXl4alFVRmpMRU5CUVVNc1MwRkJTeXhGUVVGRk8wVkJRemRDTEU5QlFVOURMSE5DUVVGdlFpeERRVUZETEVsQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJRenREUVVONlF6czdRVUZGUkN4dFFrRkJZeXhIUVVGSExHTkJRV01zUTBGQlF6czdPMEZEYUVKb1F5eEpRVUZKTEU5QlFVOHNSMEZCUnl4bFFVRmxPMGxCUTNwQ0xGbEJRVmtzUjBGQlJ5eHZRa0ZCYjBJc1EwRkJRenM3TzBGQlIzaERMRWxCUVVsRExHZENRVUZqTEVkQlFVZElMRTlCUVUwc1IwRkJSMEVzVDBGQlRTeERRVUZETEZkQlFWY3NSMEZCUnl4VFFVRlRMRU5CUVVNN096czdPenM3T3p0QlFWTTNSQ3hUUVVGVExGVkJRVlVzUTBGQlF5eExRVUZMTEVWQlFVVTdSVUZEZWtJc1NVRkJTU3hMUVVGTExFbEJRVWtzU1VGQlNTeEZRVUZGTzBsQlEycENMRTlCUVU4c1MwRkJTeXhMUVVGTExGTkJRVk1zUjBGQlJ5eFpRVUZaTEVkQlFVY3NUMEZCVHl4RFFVRkRPMGRCUTNKRU8wVkJRMFFzVDBGQlR5eERRVUZEUnl4blFrRkJZeXhKUVVGSlFTeG5Ra0ZCWXl4SlFVRkpMRTFCUVUwc1EwRkJReXhMUVVGTExFTkJRVU03VFVGRGNrUkRMRlZCUVZNc1EwRkJReXhMUVVGTExFTkJRVU03VFVGRGFFSkRMR1ZCUVdNc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF6dERRVU16UWpzN1FVRkZSQ3hsUVVGakxFZEJRVWNzVlVGQlZTeERRVUZET3p0QlF6TkNOVUk3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdRVUY1UWtFc1UwRkJVeXhSUVVGUkxFTkJRVU1zUzBGQlN5eEZRVUZGTzBWQlEzWkNMRWxCUVVrc1NVRkJTU3hIUVVGSExFOUJRVThzUzBGQlN5eERRVUZETzBWQlEzaENMRTlCUVU4c1MwRkJTeXhKUVVGSkxFbEJRVWtzUzBGQlN5eEpRVUZKTEVsQlFVa3NVVUZCVVN4SlFVRkpMRWxCUVVrc1NVRkJTU3hWUVVGVkxFTkJRVU1zUTBGQlF6dERRVU5zUlRzN1FVRkZSQ3hqUVVGakxFZEJRVWNzVVVGQlVTeERRVUZET3pzN1FVTXhRakZDTEVsQlFVa3NVVUZCVVN4SFFVRkhMSGRDUVVGM1FqdEpRVU51UXl4UFFVRlBMRWRCUVVjc2JVSkJRVzFDTzBsQlF6ZENMRTFCUVUwc1IwRkJSeXcwUWtGQk5FSTdTVUZEY2tNc1VVRkJVU3hIUVVGSExHZENRVUZuUWl4RFFVRkRPenM3T3pzN096czdPenM3T3pzN096czdPMEZCYlVKb1F5eFRRVUZUTEZWQlFWVXNRMEZCUXl4TFFVRkxMRVZCUVVVN1JVRkRla0lzU1VGQlNTeERRVUZEUXl4VlFVRlJMRU5CUVVNc1MwRkJTeXhEUVVGRExFVkJRVVU3U1VGRGNFSXNUMEZCVHl4TFFVRkxMRU5CUVVNN1IwRkRaRHM3TzBWQlIwUXNTVUZCU1N4SFFVRkhMRWRCUVVkRExGZEJRVlVzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXp0RlFVTTFRaXhQUVVGUExFZEJRVWNzU1VGQlNTeFBRVUZQTEVsQlFVa3NSMEZCUnl4SlFVRkpMRTFCUVUwc1NVRkJTU3hIUVVGSExFbEJRVWtzVVVGQlVTeEpRVUZKTEVkQlFVY3NTVUZCU1N4UlFVRlJMRU5CUVVNN1EwRkRPVVU3TzBGQlJVUXNaMEpCUVdNc1IwRkJSeXhWUVVGVkxFTkJRVU03T3p0QlEycEROVUlzU1VGQlNTeFZRVUZWTEVkQlFVZFNMRXRCUVVrc1EwRkJReXh2UWtGQmIwSXNRMEZCUXl4RFFVRkRPenRCUVVVMVF5eGxRVUZqTEVkQlFVY3NWVUZCVlN4RFFVRkRPenM3UVVOR05VSXNTVUZCU1N4VlFVRlZMRWxCUVVrc1YwRkJWenRGUVVNelFpeEpRVUZKTEVkQlFVY3NSMEZCUnl4UlFVRlJMRU5CUVVNc1NVRkJTU3hEUVVGRFV5eFhRVUZWTEVsQlFVbEJMRmRCUVZVc1EwRkJReXhKUVVGSkxFbEJRVWxCTEZkQlFWVXNRMEZCUXl4SlFVRkpMRU5CUVVNc1VVRkJVU3hKUVVGSkxFVkJRVVVzUTBGQlF5eERRVUZETzBWQlEzcEdMRTlCUVU4c1IwRkJSeXhKUVVGSkxHZENRVUZuUWl4SFFVRkhMRWRCUVVjc1NVRkJTU3hGUVVGRkxFTkJRVU03UTBGRE5VTXNSVUZCUlN4RFFVRkRMRU5CUVVNN096czdPenM3T3p0QlFWTk1MRk5CUVZNc1VVRkJVU3hEUVVGRExFbEJRVWtzUlVGQlJUdEZRVU4wUWl4UFFVRlBMRU5CUVVNc1EwRkJReXhWUVVGVkxFdEJRVXNzVlVGQlZTeEpRVUZKTEVsQlFVa3NRMEZCUXl4RFFVRkRPME5CUXpkRE96dEJRVVZFTEdGQlFXTXNSMEZCUnl4UlFVRlJMRU5CUVVNN08wRkRia0l4UWp0QlFVTkJMRWxCUVVrc1UwRkJVeXhIUVVGSExGRkJRVkVzUTBGQlF5eFRRVUZUTEVOQlFVTTdPenRCUVVkdVF5eEpRVUZKTEZsQlFWa3NSMEZCUnl4VFFVRlRMRU5CUVVNc1VVRkJVU3hEUVVGRE96czdPenM3T3pzN1FVRlRkRU1zVTBGQlV5eFJRVUZSTEVOQlFVTXNTVUZCU1N4RlFVRkZPMFZCUTNSQ0xFbEJRVWtzU1VGQlNTeEpRVUZKTEVsQlFVa3NSVUZCUlR0SlFVTm9RaXhKUVVGSk8wMUJRMFlzVDBGQlR5eFpRVUZaTEVOQlFVTXNTVUZCU1N4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRE8wdEJRMmhETEVOQlFVTXNUMEZCVHl4RFFVRkRMRVZCUVVVc1JVRkJSVHRKUVVOa0xFbEJRVWs3VFVGRFJpeFJRVUZSTEVsQlFVa3NSMEZCUnl4RlFVRkZMRVZCUVVVN1MwRkRjRUlzUTBGQlF5eFBRVUZQTEVOQlFVTXNSVUZCUlN4RlFVRkZPMGRCUTJZN1JVRkRSQ3hQUVVGUExFVkJRVVVzUTBGQlF6dERRVU5ZT3p0QlFVVkVMR0ZCUVdNc1IwRkJSeXhSUVVGUkxFTkJRVU03T3pzN096dEJRMmhDTVVJc1NVRkJTU3haUVVGWkxFZEJRVWNzY1VKQlFYRkNMRU5CUVVNN096dEJRVWQ2UXl4SlFVRkpMRmxCUVZrc1IwRkJSeXcyUWtGQk5rSXNRMEZCUXpzN08wRkJSMnBFTEVsQlFVbERMRmRCUVZNc1IwRkJSeXhSUVVGUkxFTkJRVU1zVTBGQlV6dEpRVU01UWxJc1lVRkJWeXhIUVVGSExFMUJRVTBzUTBGQlF5eFRRVUZUTEVOQlFVTTdPenRCUVVkdVF5eEpRVUZKVXl4alFVRlpMRWRCUVVkRUxGZEJRVk1zUTBGQlF5eFJRVUZSTEVOQlFVTTdPenRCUVVkMFF5eEpRVUZKUlN4blFrRkJZeXhIUVVGSFZpeGhRVUZYTEVOQlFVTXNZMEZCWXl4RFFVRkRPenM3UVVGSGFFUXNTVUZCU1N4VlFVRlZMRWRCUVVjc1RVRkJUU3hEUVVGRExFZEJRVWM3UlVGRGVrSlRMR05CUVZrc1EwRkJReXhKUVVGSkxFTkJRVU5ETEdkQ1FVRmpMRU5CUVVNc1EwRkJReXhQUVVGUExFTkJRVU1zV1VGQldTeEZRVUZGTEUxQlFVMHNRMEZCUXp0SFFVTTVSQ3hQUVVGUExFTkJRVU1zZDBSQlFYZEVMRVZCUVVVc1QwRkJUeXhEUVVGRExFZEJRVWNzUjBGQlJ6dERRVU5zUml4RFFVRkRPenM3T3pzN096czdPMEZCVlVZc1UwRkJVeXhaUVVGWkxFTkJRVU1zUzBGQlN5eEZRVUZGTzBWQlF6TkNMRWxCUVVrc1EwRkJRMHdzVlVGQlVTeERRVUZETEV0QlFVc3NRMEZCUXl4SlFVRkpUU3hUUVVGUkxFTkJRVU1zUzBGQlN5eERRVUZETEVWQlFVVTdTVUZEZGtNc1QwRkJUeXhMUVVGTExFTkJRVU03UjBGRFpEdEZRVU5FTEVsQlFVa3NUMEZCVHl4SFFVRkhReXhaUVVGVkxFTkJRVU1zUzBGQlN5eERRVUZETEVkQlFVY3NWVUZCVlN4SFFVRkhMRmxCUVZrc1EwRkJRenRGUVVNMVJDeFBRVUZQTEU5QlFVOHNRMEZCUXl4SlFVRkpMRU5CUVVORExGTkJRVkVzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXl4RFFVRkRPME5CUTNSRE96dEJRVVZFTEdsQ1FVRmpMRWRCUVVjc1dVRkJXU3hEUVVGRE96dEJRemxET1VJN096czdPenM3TzBGQlVVRXNVMEZCVXl4UlFVRlJMRU5CUVVNc1RVRkJUU3hGUVVGRkxFZEJRVWNzUlVGQlJUdEZRVU0zUWl4UFFVRlBMRTFCUVUwc1NVRkJTU3hKUVVGSkxFZEJRVWNzVTBGQlV5eEhRVUZITEUxQlFVMHNRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJRenREUVVOcVJEczdRVUZGUkN4aFFVRmpMRWRCUVVjc1VVRkJVU3hEUVVGRE96czdPenM3T3pzN08wRkRSREZDTEZOQlFWTXNVMEZCVXl4RFFVRkRMRTFCUVUwc1JVRkJSU3hIUVVGSExFVkJRVVU3UlVGRE9VSXNTVUZCU1N4TFFVRkxMRWRCUVVkRExGTkJRVkVzUTBGQlF5eE5RVUZOTEVWQlFVVXNSMEZCUnl4RFFVRkRMRU5CUVVNN1JVRkRiRU1zVDBGQlQwTXNZVUZCV1N4RFFVRkRMRXRCUVVzc1EwRkJReXhIUVVGSExFdEJRVXNzUjBGQlJ5eFRRVUZUTEVOQlFVTTdRMEZEYUVRN08wRkJSVVFzWTBGQll5eEhRVUZITEZOQlFWTXNRMEZCUXpzN08wRkRXak5DTEVsQlFVa3NSMEZCUnl4SFFVRkhReXhWUVVGVExFTkJRVU5zUWl4TFFVRkpMRVZCUVVVc1MwRkJTeXhEUVVGRExFTkJRVU03TzBGQlJXcERMRkZCUVdNc1IwRkJSeXhIUVVGSExFTkJRVU03T3p0QlEwaHlRaXhKUVVGSkxGbEJRVmtzUjBGQlIydENMRlZCUVZNc1EwRkJReXhOUVVGTkxFVkJRVVVzVVVGQlVTeERRVUZETEVOQlFVTTdPMEZCUlM5RExHbENRVUZqTEVkQlFVY3NXVUZCV1N4RFFVRkRPenM3T3pzN096czdRVU5KT1VJc1UwRkJVeXhUUVVGVExFZEJRVWM3UlVGRGJrSXNTVUZCU1N4RFFVRkRMRkZCUVZFc1IwRkJSME1zWVVGQldTeEhRVUZIUVN4aFFVRlpMRU5CUVVNc1NVRkJTU3hEUVVGRExFZEJRVWNzUlVGQlJTeERRVUZETzBWQlEzWkVMRWxCUVVrc1EwRkJReXhKUVVGSkxFZEJRVWNzUTBGQlF5eERRVUZETzBOQlEyWTdPMEZCUlVRc1kwRkJZeXhIUVVGSExGTkJRVk1zUTBGQlF6czdRVU5rTTBJN096czdPenM3T3pzN1FVRlZRU3hUUVVGVExGVkJRVlVzUTBGQlF5eEhRVUZITEVWQlFVVTdSVUZEZGtJc1NVRkJTU3hOUVVGTkxFZEJRVWNzU1VGQlNTeERRVUZETEVkQlFVY3NRMEZCUXl4SFFVRkhMRU5CUVVNc1NVRkJTU3hQUVVGUExFbEJRVWtzUTBGQlF5eFJRVUZSTEVOQlFVTXNSMEZCUnl4RFFVRkRMRU5CUVVNN1JVRkRlRVFzU1VGQlNTeERRVUZETEVsQlFVa3NTVUZCU1N4TlFVRk5MRWRCUVVjc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF6dEZRVU0xUWl4UFFVRlBMRTFCUVUwc1EwRkJRenREUVVObU96dEJRVVZFTEdWQlFXTXNSMEZCUnl4VlFVRlZMRU5CUVVNN096dEJRMkkxUWl4SlFVRkpMR05CUVdNc1IwRkJSeXd5UWtGQk1rSXNRMEZCUXpzN08wRkJSMnBFTEVsQlFVbHFRaXhoUVVGWExFZEJRVWNzVFVGQlRTeERRVUZETEZOQlFWTXNRMEZCUXpzN08wRkJSMjVETEVsQlFVbFZMR2RDUVVGakxFZEJRVWRXTEdGQlFWY3NRMEZCUXl4alFVRmpMRU5CUVVNN096czdPenM3T3pzN08wRkJWMmhFTEZOQlFWTXNUMEZCVHl4RFFVRkRMRWRCUVVjc1JVRkJSVHRGUVVOd1FpeEpRVUZKTEVsQlFVa3NSMEZCUnl4SlFVRkpMRU5CUVVNc1VVRkJVU3hEUVVGRE8wVkJRM3BDTEVsQlFVbHBRaXhoUVVGWkxFVkJRVVU3U1VGRGFFSXNTVUZCU1N4TlFVRk5MRWRCUVVjc1NVRkJTU3hEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZETzBsQlEzWkNMRTlCUVU4c1RVRkJUU3hMUVVGTExHTkJRV01zUjBGQlJ5eFRRVUZUTEVkQlFVY3NUVUZCVFN4RFFVRkRPMGRCUTNaRU8wVkJRMFFzVDBGQlQxQXNaMEpCUVdNc1EwRkJReXhKUVVGSkxFTkJRVU1zU1VGQlNTeEZRVUZGTEVkQlFVY3NRMEZCUXl4SFFVRkhMRWxCUVVrc1EwRkJReXhIUVVGSExFTkJRVU1zUjBGQlJ5eFRRVUZUTEVOQlFVTTdRMEZETDBRN08wRkJSVVFzV1VGQll5eEhRVUZITEU5QlFVOHNRMEZCUXpzN08wRkRNVUo2UWl4SlFVRkpWaXhoUVVGWExFZEJRVWNzVFVGQlRTeERRVUZETEZOQlFWTXNRMEZCUXpzN08wRkJSMjVETEVsQlFVbFZMR2RDUVVGakxFZEJRVWRXTEdGQlFWY3NRMEZCUXl4alFVRmpMRU5CUVVNN096czdPenM3T3pzN08wRkJWMmhFTEZOQlFWTXNUMEZCVHl4RFFVRkRMRWRCUVVjc1JVRkJSVHRGUVVOd1FpeEpRVUZKTEVsQlFVa3NSMEZCUnl4SlFVRkpMRU5CUVVNc1VVRkJVU3hEUVVGRE8wVkJRM3BDTEU5QlFVOXBRaXhoUVVGWkxFbEJRVWtzU1VGQlNTeERRVUZETEVkQlFVY3NRMEZCUXl4TFFVRkxMRk5CUVZNc1NVRkJTVkFzWjBKQlFXTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1NVRkJTU3hGUVVGRkxFZEJRVWNzUTBGQlF5eERRVUZETzBOQlEyeEdPenRCUVVWRUxGbEJRV01zUjBGQlJ5eFBRVUZQTEVOQlFVTTdPenRCUTI1Q2VrSXNTVUZCU1ZFc1owSkJRV01zUjBGQlJ5d3lRa0ZCTWtJc1EwRkJRenM3T3pzN096czdPenM3TzBGQldXcEVMRk5CUVZNc1QwRkJUeXhEUVVGRExFZEJRVWNzUlVGQlJTeExRVUZMTEVWQlFVVTdSVUZETTBJc1NVRkJTU3hKUVVGSkxFZEJRVWNzU1VGQlNTeERRVUZETEZGQlFWRXNRMEZCUXp0RlFVTjZRaXhKUVVGSkxFTkJRVU1zU1VGQlNTeEpRVUZKTEVsQlFVa3NRMEZCUXl4SFFVRkhMRU5CUVVNc1IwRkJSeXhEUVVGRExFZEJRVWNzUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXp0RlFVTnVReXhKUVVGSkxFTkJRVU1zUjBGQlJ5eERRVUZETEVkQlFVY3NRMEZCUTBRc1lVRkJXU3hKUVVGSkxFdEJRVXNzUzBGQlN5eFRRVUZUTEVsQlFVbERMR2RDUVVGakxFZEJRVWNzUzBGQlN5eERRVUZETzBWQlF6TkZMRTlCUVU4c1NVRkJTU3hEUVVGRE8wTkJRMkk3TzBGQlJVUXNXVUZCWXl4SFFVRkhMRTlCUVU4c1EwRkJRenM3T3pzN096czdPMEZEVkhwQ0xGTkJRVk1zU1VGQlNTeERRVUZETEU5QlFVOHNSVUZCUlRzN08wVkJRM0pDTEVsQlFVa3NTMEZCU3l4SFFVRkhMRU5CUVVNc1EwRkJRenROUVVOV0xFMUJRVTBzUjBGQlJ5eFBRVUZQTEVsQlFVa3NTVUZCU1N4SFFVRkhMRU5CUVVNc1IwRkJSeXhQUVVGUExFTkJRVU1zVFVGQlRTeERRVUZET3p0RlFVVnNSQ3hKUVVGSkxFTkJRVU1zUzBGQlN5eEZRVUZGTEVOQlFVTTdSVUZEWWl4UFFVRlBMRVZCUVVVc1MwRkJTeXhIUVVGSExFMUJRVTBzUlVGQlJUdEpRVU4yUWl4SlFVRkpMRXRCUVVzc1IwRkJSeXhQUVVGUExFTkJRVU1zUzBGQlN5eERRVUZETEVOQlFVTTdTVUZETTBKMlF5eE5RVUZKTEVOQlFVTXNSMEZCUnl4RFFVRkRMRXRCUVVzc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlJTeExRVUZMTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRIUVVNNVFqdERRVU5HT3pzN1FVRkhSQ3hKUVVGSkxFTkJRVU1zVTBGQlV5eERRVUZETEV0QlFVc3NSMEZCUjNkRExGVkJRVk1zUTBGQlF6dEJRVU5xUXl4SlFVRkpMRU5CUVVNc1UwRkJVeXhEUVVGRExGRkJRVkVzUTBGQlF5eEhRVUZIUXl4WFFVRlZMRU5CUVVNN1FVRkRkRU1zU1VGQlNTeERRVUZETEZOQlFWTXNRMEZCUXl4SFFVRkhMRWRCUVVkRExGRkJRVThzUTBGQlF6dEJRVU0zUWl4SlFVRkpMRU5CUVVNc1UwRkJVeXhEUVVGRExFZEJRVWNzUjBGQlIwTXNVVUZCVHl4RFFVRkRPMEZCUXpkQ0xFbEJRVWtzUTBGQlF5eFRRVUZUTEVOQlFVTXNSMEZCUnl4SFFVRkhReXhSUVVGUExFTkJRVU03TzBGQlJUZENMRk5CUVdNc1IwRkJSeXhKUVVGSkxFTkJRVU03T3pzN096czdPenRCUTNCQ2RFSXNVMEZCVXl4aFFVRmhMRWRCUVVjN1JVRkRka0lzU1VGQlNTeERRVUZETEVsQlFVa3NSMEZCUnl4RFFVRkRMRU5CUVVNN1JVRkRaQ3hKUVVGSkxFTkJRVU1zVVVGQlVTeEhRVUZITzBsQlEyUXNUVUZCVFN4RlFVRkZMRWxCUVVsRExFdEJRVWs3U1VGRGFFSXNTMEZCU3l4RlFVRkZMRXRCUVV0RExFbEJRVWNzU1VGQlNUbENMRlZCUVZNc1EwRkJRenRKUVVNM1FpeFJRVUZSTEVWQlFVVXNTVUZCU1RaQ0xFdEJRVWs3UjBGRGJrSXNRMEZCUXp0RFFVTklPenRCUVVWRUxHdENRVUZqTEVkQlFVY3NZVUZCWVN4RFFVRkRPenRCUTNCQ0wwSTdPenM3T3pzN1FVRlBRU3hUUVVGVExGTkJRVk1zUTBGQlF5eExRVUZMTEVWQlFVVTdSVUZEZUVJc1NVRkJTU3hKUVVGSkxFZEJRVWNzVDBGQlR5eExRVUZMTEVOQlFVTTdSVUZEZUVJc1QwRkJUeXhEUVVGRExFbEJRVWtzU1VGQlNTeFJRVUZSTEVsQlFVa3NTVUZCU1N4SlFVRkpMRkZCUVZFc1NVRkJTU3hKUVVGSkxFbEJRVWtzVVVGQlVTeEpRVUZKTEVsQlFVa3NTVUZCU1N4VFFVRlRPMDlCUTJoR0xFdEJRVXNzUzBGQlN5eFhRVUZYTzA5QlEzSkNMRXRCUVVzc1MwRkJTeXhKUVVGSkxFTkJRVU1zUTBGQlF6dERRVU4wUWpzN1FVRkZSQ3hqUVVGakxFZEJRVWNzVTBGQlV5eERRVUZET3pzN096czdPenM3TzBGRFNqTkNMRk5CUVZNc1ZVRkJWU3hEUVVGRExFZEJRVWNzUlVGQlJTeEhRVUZITEVWQlFVVTdSVUZETlVJc1NVRkJTU3hKUVVGSkxFZEJRVWNzUjBGQlJ5eERRVUZETEZGQlFWRXNRMEZCUXp0RlFVTjRRaXhQUVVGUFJTeFZRVUZUTEVOQlFVTXNSMEZCUnl4RFFVRkRPMDFCUTJwQ0xFbEJRVWtzUTBGQlF5eFBRVUZQTEVkQlFVY3NTVUZCU1N4UlFVRlJMRWRCUVVjc1VVRkJVU3hIUVVGSExFMUJRVTBzUTBGQlF6dE5RVU5vUkN4SlFVRkpMRU5CUVVNc1IwRkJSeXhEUVVGRE8wTkJRMlE3TzBGQlJVUXNaVUZCWXl4SFFVRkhMRlZCUVZVc1EwRkJRenM3T3pzN096czdPenM3UVVOT05VSXNVMEZCVXl4alFVRmpMRU5CUVVNc1IwRkJSeXhGUVVGRk8wVkJRek5DTEVsQlFVa3NUVUZCVFN4SFFVRkhReXhYUVVGVkxFTkJRVU1zU1VGQlNTeEZRVUZGTEVkQlFVY3NRMEZCUXl4RFFVRkRMRkZCUVZFc1EwRkJReXhEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZETzBWQlEyeEVMRWxCUVVrc1EwRkJReXhKUVVGSkxFbEJRVWtzVFVGQlRTeEhRVUZITEVOQlFVTXNSMEZCUnl4RFFVRkRMRU5CUVVNN1JVRkROVUlzVDBGQlR5eE5RVUZOTEVOQlFVTTdRMEZEWmpzN1FVRkZSQ3h0UWtGQll5eEhRVUZITEdOQlFXTXNRMEZCUXpzN096czdPenM3T3pzN1FVTk9hRU1zVTBGQlV5eFhRVUZYTEVOQlFVTXNSMEZCUnl4RlFVRkZPMFZCUTNoQ0xFOUJRVTlCTEZkQlFWVXNRMEZCUXl4SlFVRkpMRVZCUVVVc1IwRkJSeXhEUVVGRExFTkJRVU1zUjBGQlJ5eERRVUZETEVkQlFVY3NRMEZCUXl4RFFVRkRPME5CUTNaRE96dEJRVVZFTEdkQ1FVRmpMRWRCUVVjc1YwRkJWeXhEUVVGRE96czdPenM3T3pzN096dEJRMG8zUWl4VFFVRlRMRmRCUVZjc1EwRkJReXhIUVVGSExFVkJRVVU3UlVGRGVFSXNUMEZCVDBFc1YwRkJWU3hEUVVGRExFbEJRVWtzUlVGQlJTeEhRVUZITEVOQlFVTXNRMEZCUXl4SFFVRkhMRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU03UTBGRGRrTTdPMEZCUlVRc1owSkJRV01zUjBGQlJ5eFhRVUZYTEVOQlFVTTdPenM3T3pzN096czdPenRCUTBnM1FpeFRRVUZUTEZkQlFWY3NRMEZCUXl4SFFVRkhMRVZCUVVVc1MwRkJTeXhGUVVGRk8wVkJReTlDTEVsQlFVa3NTVUZCU1N4SFFVRkhRU3hYUVVGVkxFTkJRVU1zU1VGQlNTeEZRVUZGTEVkQlFVY3NRMEZCUXp0TlFVTTFRaXhKUVVGSkxFZEJRVWNzU1VGQlNTeERRVUZETEVsQlFVa3NRMEZCUXpzN1JVRkZja0lzU1VGQlNTeERRVUZETEVkQlFVY3NRMEZCUXl4SFFVRkhMRVZCUVVVc1MwRkJTeXhEUVVGRExFTkJRVU03UlVGRGNrSXNTVUZCU1N4RFFVRkRMRWxCUVVrc1NVRkJTU3hKUVVGSkxFTkJRVU1zU1VGQlNTeEpRVUZKTEVsQlFVa3NSMEZCUnl4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRE8wVkJRM1pETEU5QlFVOHNTVUZCU1N4RFFVRkRPME5CUTJJN08wRkJSVVFzWjBKQlFXTXNSMEZCUnl4WFFVRlhMRU5CUVVNN096czdPenM3T3p0QlExSTNRaXhUUVVGVExGRkJRVkVzUTBGQlF5eFBRVUZQTEVWQlFVVTdPenRGUVVONlFpeEpRVUZKTEV0QlFVc3NSMEZCUnl4RFFVRkRMRU5CUVVNN1RVRkRWaXhOUVVGTkxFZEJRVWNzVDBGQlR5eEpRVUZKTEVsQlFVa3NSMEZCUnl4RFFVRkRMRWRCUVVjc1QwRkJUeXhEUVVGRExFMUJRVTBzUTBGQlF6czdSVUZGYkVRc1NVRkJTU3hEUVVGRExFdEJRVXNzUlVGQlJTeERRVUZETzBWQlEySXNUMEZCVHl4RlFVRkZMRXRCUVVzc1IwRkJSeXhOUVVGTkxFVkJRVVU3U1VGRGRrSXNTVUZCU1N4TFFVRkxMRWRCUVVjc1QwRkJUeXhEUVVGRExFdEJRVXNzUTBGQlF5eERRVUZETzBsQlF6TkNhRVFzVFVGQlNTeERRVUZETEVkQlFVY3NRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVVVzUzBGQlN5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1IwRkRPVUk3UTBGRFJqczdPMEZCUjBRc1VVRkJVU3hEUVVGRExGTkJRVk1zUTBGQlF5eExRVUZMTEVkQlFVZHBSQ3hqUVVGaExFTkJRVU03UVVGRGVrTXNVVUZCVVN4RFFVRkRMRk5CUVZNc1EwRkJReXhSUVVGUkxFTkJRVU1zUjBGQlIwTXNaVUZCWXl4RFFVRkRPMEZCUXpsRExGRkJRVkVzUTBGQlF5eFRRVUZUTEVOQlFVTXNSMEZCUnl4SFFVRkhReXhaUVVGWExFTkJRVU03UVVGRGNrTXNVVUZCVVN4RFFVRkRMRk5CUVZNc1EwRkJReXhIUVVGSExFZEJRVWRETEZsQlFWY3NRMEZCUXp0QlFVTnlReXhSUVVGUkxFTkJRVU1zVTBGQlV5eERRVUZETEVkQlFVY3NSMEZCUjBNc1dVRkJWeXhEUVVGRE96dEJRVVZ5UXl4aFFVRmpMRWRCUVVjc1VVRkJVU3hEUVVGRE96czdRVU14UWpGQ0xFbEJRVWtzWjBKQlFXZENMRWRCUVVjc1IwRkJSeXhEUVVGRE96czdPenM3T3pzN096czdRVUZaTTBJc1UwRkJVeXhSUVVGUkxFTkJRVU1zUjBGQlJ5eEZRVUZGTEV0QlFVc3NSVUZCUlR0RlFVTTFRaXhKUVVGSkxFbEJRVWtzUjBGQlJ5eEpRVUZKTEVOQlFVTXNVVUZCVVN4RFFVRkRPMFZCUTNwQ0xFbEJRVWtzU1VGQlNTeFpRVUZaY2tNc1ZVRkJVeXhGUVVGRk8wbEJRemRDTEVsQlFVa3NTMEZCU3l4SFFVRkhMRWxCUVVrc1EwRkJReXhSUVVGUkxFTkJRVU03U1VGRE1VSXNTVUZCU1N4RFFVRkRPRUlzU1VGQlJ5eExRVUZMTEV0QlFVc3NRMEZCUXl4TlFVRk5MRWRCUVVjc1owSkJRV2RDTEVkQlFVY3NRMEZCUXl4RFFVRkRMRVZCUVVVN1RVRkRha1FzUzBGQlN5eERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRMRWRCUVVjc1JVRkJSU3hMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETzAxQlEzcENMRWxCUVVrc1EwRkJReXhKUVVGSkxFZEJRVWNzUlVGQlJTeEpRVUZKTEVOQlFVTXNTVUZCU1N4RFFVRkRPMDFCUTNoQ0xFOUJRVThzU1VGQlNTeERRVUZETzB0QlEySTdTVUZEUkN4SlFVRkpMRWRCUVVjc1NVRkJTU3hEUVVGRExGRkJRVkVzUjBGQlJ5eEpRVUZKVVN4VFFVRlJMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU03UjBGRE5VTTdSVUZEUkN4SlFVRkpMRU5CUVVNc1IwRkJSeXhEUVVGRExFZEJRVWNzUlVGQlJTeExRVUZMTEVOQlFVTXNRMEZCUXp0RlFVTnlRaXhKUVVGSkxFTkJRVU1zU1VGQlNTeEhRVUZITEVsQlFVa3NRMEZCUXl4SlFVRkpMRU5CUVVNN1JVRkRkRUlzVDBGQlR5eEpRVUZKTEVOQlFVTTdRMEZEWWpzN1FVRkZSQ3hoUVVGakxFZEJRVWNzVVVGQlVTeERRVUZET3pzN096czdPenM3UVVOdVFqRkNMRk5CUVZNc1MwRkJTeXhEUVVGRExFOUJRVThzUlVGQlJUdEZRVU4wUWl4SlFVRkpMRWxCUVVrc1IwRkJSeXhKUVVGSkxFTkJRVU1zVVVGQlVTeEhRVUZITEVsQlFVbDBReXhWUVVGVExFTkJRVU1zVDBGQlR5eERRVUZETEVOQlFVTTdSVUZEYkVRc1NVRkJTU3hEUVVGRExFbEJRVWtzUjBGQlJ5eEpRVUZKTEVOQlFVTXNTVUZCU1N4RFFVRkRPME5CUTNaQ096czdRVUZIUkN4TFFVRkxMRU5CUVVNc1UwRkJVeXhEUVVGRExFdEJRVXNzUjBGQlIzVkRMRmRCUVZVc1EwRkJRenRCUVVOdVF5eExRVUZMTEVOQlFVTXNVMEZCVXl4RFFVRkRMRkZCUVZFc1EwRkJReXhIUVVGSFF5eFpRVUZYTEVOQlFVTTdRVUZEZUVNc1MwRkJTeXhEUVVGRExGTkJRVk1zUTBGQlF5eEhRVUZITEVkQlFVZERMRk5CUVZFc1EwRkJRenRCUVVNdlFpeExRVUZMTEVOQlFVTXNVMEZCVXl4RFFVRkRMRWRCUVVjc1IwRkJSME1zVTBGQlVTeERRVUZETzBGQlF5OUNMRXRCUVVzc1EwRkJReXhUUVVGVExFTkJRVU1zUjBGQlJ5eEhRVUZIUXl4VFFVRlJMRU5CUVVNN08wRkJSUzlDTEZWQlFXTXNSMEZCUnl4TFFVRkxMRU5CUVVNN08wRkRNVUoyUWpzN096czdPenM3TzBGQlUwRXNVMEZCVXl4VFFVRlRMRU5CUVVNc1MwRkJTeXhGUVVGRkxGRkJRVkVzUlVGQlJUdEZRVU5zUXl4SlFVRkpMRXRCUVVzc1IwRkJSeXhEUVVGRExFTkJRVU03VFVGRFZpeE5RVUZOTEVkQlFVY3NTMEZCU3l4SlFVRkpMRWxCUVVrc1IwRkJSeXhEUVVGRExFZEJRVWNzUzBGQlN5eERRVUZETEUxQlFVMHNRMEZCUXpzN1JVRkZPVU1zVDBGQlR5eEZRVUZGTEV0QlFVc3NSMEZCUnl4TlFVRk5MRVZCUVVVN1NVRkRka0lzU1VGQlNTeFJRVUZSTEVOQlFVTXNTMEZCU3l4RFFVRkRMRXRCUVVzc1EwRkJReXhGUVVGRkxFdEJRVXNzUlVGQlJTeExRVUZMTEVOQlFVTXNTMEZCU3l4TFFVRkxMRVZCUVVVN1RVRkRiRVFzVFVGQlRUdExRVU5RTzBkQlEwWTdSVUZEUkN4UFFVRlBMRXRCUVVzc1EwRkJRenREUVVOa096dEJRVVZFTEdOQlFXTXNSMEZCUnl4VFFVRlRMRU5CUVVNN08wRkRia0l6UWl4SlFVRkpMR05CUVdNc1NVRkJTU3hYUVVGWE8wVkJReTlDTEVsQlFVazdTVUZEUml4SlFVRkpMRWxCUVVrc1IwRkJSM1JDTEZWQlFWTXNRMEZCUXl4TlFVRk5MRVZCUVVVc1owSkJRV2RDTEVOQlFVTXNRMEZCUXp0SlFVTXZReXhKUVVGSkxFTkJRVU1zUlVGQlJTeEZRVUZGTEVWQlFVVXNSVUZCUlN4RlFVRkZMRU5CUVVNc1EwRkJRenRKUVVOcVFpeFBRVUZQTEVsQlFVa3NRMEZCUXp0SFFVTmlMRU5CUVVNc1QwRkJUeXhEUVVGRExFVkJRVVVzUlVGQlJUdERRVU5tTEVWQlFVVXNRMEZCUXl4RFFVRkRPenRCUVVWTUxHMUNRVUZqTEVkQlFVY3NZMEZCWXl4RFFVRkRPenM3T3pzN096czdPenRCUTBOb1F5eFRRVUZUTEdWQlFXVXNRMEZCUXl4TlFVRk5MRVZCUVVVc1IwRkJSeXhGUVVGRkxFdEJRVXNzUlVGQlJUdEZRVU16UXl4SlFVRkpMRWRCUVVjc1NVRkJTU3hYUVVGWExFbEJRVWwxUWl4bFFVRmpMRVZCUVVVN1NVRkRlRU5CTEdWQlFXTXNRMEZCUXl4TlFVRk5MRVZCUVVVc1IwRkJSeXhGUVVGRk8wMUJRekZDTEdOQlFXTXNSVUZCUlN4SlFVRkpPMDFCUTNCQ0xGbEJRVmtzUlVGQlJTeEpRVUZKTzAxQlEyeENMRTlCUVU4c1JVRkJSU3hMUVVGTE8wMUJRMlFzVlVGQlZTeEZRVUZGTEVsQlFVazdTMEZEYWtJc1EwRkJReXhEUVVGRE8wZEJRMG9zVFVGQlRUdEpRVU5NTEUxQlFVMHNRMEZCUXl4SFFVRkhMRU5CUVVNc1IwRkJSeXhMUVVGTExFTkJRVU03UjBGRGNrSTdRMEZEUmpzN1FVRkZSQ3h2UWtGQll5eEhRVUZITEdWQlFXVXNRMEZCUXpzN08wRkRjRUpxUXl4SlFVRkpka01zWVVGQlZ5eEhRVUZITEUxQlFVMHNRMEZCUXl4VFFVRlRMRU5CUVVNN096dEJRVWR1UXl4SlFVRkpWU3huUWtGQll5eEhRVUZIVml4aFFVRlhMRU5CUVVNc1kwRkJZeXhEUVVGRE96czdPenM3T3pzN096czdRVUZaYUVRc1UwRkJVeXhYUVVGWExFTkJRVU1zVFVGQlRTeEZRVUZGTEVkQlFVY3NSVUZCUlN4TFFVRkxMRVZCUVVVN1JVRkRka01zU1VGQlNTeFJRVUZSTEVkQlFVY3NUVUZCVFN4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRE8wVkJRek5DTEVsQlFVa3NSVUZCUlZVc1owSkJRV01zUTBGQlF5eEpRVUZKTEVOQlFVTXNUVUZCVFN4RlFVRkZMRWRCUVVjc1EwRkJReXhKUVVGSmRFSXNTVUZCUlN4RFFVRkRMRkZCUVZFc1JVRkJSU3hMUVVGTExFTkJRVU1zUTBGQlF6dFBRVU42UkN4TFFVRkxMRXRCUVVzc1UwRkJVeXhKUVVGSkxFVkJRVVVzUjBGQlJ5eEpRVUZKTEUxQlFVMHNRMEZCUXl4RFFVRkRMRVZCUVVVN1NVRkROME52UkN4blFrRkJaU3hEUVVGRExFMUJRVTBzUlVGQlJTeEhRVUZITEVWQlFVVXNTMEZCU3l4RFFVRkRMRU5CUVVNN1IwRkRja003UTBGRFJqczdRVUZGUkN4blFrRkJZeXhIUVVGSExGZEJRVmNzUTBGQlF6czdPenM3T3pzN096czdPMEZEWkRkQ0xGTkJRVk1zVlVGQlZTeERRVUZETEUxQlFVMHNSVUZCUlN4TFFVRkxMRVZCUVVVc1RVRkJUU3hGUVVGRkxGVkJRVlVzUlVGQlJUdEZRVU55UkN4SlFVRkpMRXRCUVVzc1IwRkJSeXhEUVVGRExFMUJRVTBzUTBGQlF6dEZRVU53UWl4TlFVRk5MRXRCUVVzc1RVRkJUU3hIUVVGSExFVkJRVVVzUTBGQlF5eERRVUZET3p0RlFVVjRRaXhKUVVGSkxFdEJRVXNzUjBGQlJ5eERRVUZETEVOQlFVTTdUVUZEVml4TlFVRk5MRWRCUVVjc1MwRkJTeXhEUVVGRExFMUJRVTBzUTBGQlF6czdSVUZGTVVJc1QwRkJUeXhGUVVGRkxFdEJRVXNzUjBGQlJ5eE5RVUZOTEVWQlFVVTdTVUZEZGtJc1NVRkJTU3hIUVVGSExFZEJRVWNzUzBGQlN5eERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRPenRKUVVWMlFpeEpRVUZKTEZGQlFWRXNSMEZCUnl4VlFVRlZPMUZCUTNKQ0xGVkJRVlVzUTBGQlF5eE5RVUZOTEVOQlFVTXNSMEZCUnl4RFFVRkRMRVZCUVVVc1RVRkJUU3hEUVVGRExFZEJRVWNzUTBGQlF5eEZRVUZGTEVkQlFVY3NSVUZCUlN4TlFVRk5MRVZCUVVVc1RVRkJUU3hEUVVGRE8xRkJRM3BFTEZOQlFWTXNRMEZCUXpzN1NVRkZaQ3hKUVVGSkxGRkJRVkVzUzBGQlN5eFRRVUZUTEVWQlFVVTdUVUZETVVJc1VVRkJVU3hIUVVGSExFMUJRVTBzUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXp0TFFVTjRRanRKUVVORUxFbEJRVWtzUzBGQlN5eEZRVUZGTzAxQlExUkJMR2RDUVVGbExFTkJRVU1zVFVGQlRTeEZRVUZGTEVkQlFVY3NSVUZCUlN4UlFVRlJMRU5CUVVNc1EwRkJRenRMUVVONFF5eE5RVUZOTzAxQlEweERMRmxCUVZjc1EwRkJReXhOUVVGTkxFVkJRVVVzUjBGQlJ5eEZRVUZGTEZGQlFWRXNRMEZCUXl4RFFVRkRPMHRCUTNCRE8wZEJRMFk3UlVGRFJDeFBRVUZQTEUxQlFVMHNRMEZCUXp0RFFVTm1PenRCUVVWRUxHVkJRV01zUjBGQlJ5eFZRVUZWTEVOQlFVTTdPMEZEZGtNMVFqczdPenM3T3pzN08wRkJVMEVzVTBGQlV5eFRRVUZUTEVOQlFVTXNRMEZCUXl4RlFVRkZMRkZCUVZFc1JVRkJSVHRGUVVNNVFpeEpRVUZKTEV0QlFVc3NSMEZCUnl4RFFVRkRMRU5CUVVNN1RVRkRWaXhOUVVGTkxFZEJRVWNzUzBGQlN5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPenRGUVVWMFFpeFBRVUZQTEVWQlFVVXNTMEZCU3l4SFFVRkhMRU5CUVVNc1JVRkJSVHRKUVVOc1FpeE5RVUZOTEVOQlFVTXNTMEZCU3l4RFFVRkRMRWRCUVVjc1VVRkJVU3hEUVVGRExFdEJRVXNzUTBGQlF5eERRVUZETzBkQlEycERPMFZCUTBRc1QwRkJUeXhOUVVGTkxFTkJRVU03UTBGRFpqczdRVUZGUkN4alFVRmpMRWRCUVVjc1UwRkJVeXhEUVVGRE96dEJRMjVDTTBJN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenRCUVhkQ1FTeFRRVUZUTEZsQlFWa3NRMEZCUXl4TFFVRkxMRVZCUVVVN1JVRkRNMElzVDBGQlR5eExRVUZMTEVsQlFVa3NTVUZCU1N4SlFVRkpMRTlCUVU4c1MwRkJTeXhKUVVGSkxGRkJRVkVzUTBGQlF6dERRVU5zUkRzN1FVRkZSQ3hyUWtGQll5eEhRVUZITEZsQlFWa3NRMEZCUXpzN08wRkRlRUk1UWl4SlFVRkpMRTlCUVU4c1IwRkJSeXh2UWtGQmIwSXNRMEZCUXpzN096czdPenM3TzBGQlUyNURMRk5CUVZNc1pVRkJaU3hEUVVGRExFdEJRVXNzUlVGQlJUdEZRVU01UWl4UFFVRlBReXhqUVVGWkxFTkJRVU1zUzBGQlN5eERRVUZETEVsQlFVbHdReXhYUVVGVkxFTkJRVU1zUzBGQlN5eERRVUZETEVsQlFVa3NUMEZCVHl4RFFVRkRPME5CUXpWRU96dEJRVVZFTEc5Q1FVRmpMRWRCUVVjc1pVRkJaU3hEUVVGRE96czdRVU5pYWtNc1NVRkJTVTRzWVVGQlZ5eEhRVUZITEUxQlFVMHNRMEZCUXl4VFFVRlRMRU5CUVVNN096dEJRVWR1UXl4SlFVRkpWU3huUWtGQll5eEhRVUZIVml4aFFVRlhMRU5CUVVNc1kwRkJZeXhEUVVGRE96czdRVUZIYUVRc1NVRkJTU3h2UWtGQmIwSXNSMEZCUjBFc1lVRkJWeXhEUVVGRExHOUNRVUZ2UWl4RFFVRkRPenM3T3pzN096czdPenM3T3pzN096czdPenRCUVc5Q05VUXNTVUZCU1N4WFFVRlhMRWRCUVVjeVF5eG5Ra0ZCWlN4RFFVRkRMRmRCUVZjc1JVRkJSU3hQUVVGUExGTkJRVk1zUTBGQlF5eEZRVUZGTEVWQlFVVXNRMEZCUXl4SFFVRkhRU3huUWtGQlpTeEhRVUZITEZOQlFWTXNTMEZCU3l4RlFVRkZPMFZCUTNoSExFOUJRVTlFTEdOQlFWa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1NVRkJTV2hETEdkQ1FVRmpMRU5CUVVNc1NVRkJTU3hEUVVGRExFdEJRVXNzUlVGQlJTeFJRVUZSTEVOQlFVTTdTVUZEYUVVc1EwRkJReXh2UWtGQmIwSXNRMEZCUXl4SlFVRkpMRU5CUVVNc1MwRkJTeXhGUVVGRkxGRkJRVkVzUTBGQlF5eERRVUZETzBOQlF5OURMRU5CUVVNN08wRkJSVVlzYVVKQlFXTXNSMEZCUnl4WFFVRlhMRU5CUVVNN08wRkRia00zUWpzN096czdPenM3T3pzN096czdPenM3T3pzN096czdRVUYxUWtFc1NVRkJTU3hQUVVGUExFZEJRVWNzUzBGQlN5eERRVUZETEU5QlFVOHNRMEZCUXpzN1FVRkZOVUlzWVVGQll5eEhRVUZITEU5QlFVOHNRMEZCUXpzN1FVTjZRbnBDT3pzN096czdPenM3T3pzN08wRkJZVUVzVTBGQlV5eFRRVUZUTEVkQlFVYzdSVUZEYmtJc1QwRkJUeXhMUVVGTExFTkJRVU03UTBGRFpEczdRVUZGUkN4bFFVRmpMRWRCUVVjc1UwRkJVeXhEUVVGRE96czdPMEZEWWpOQ0xFbEJRVWtzVjBGQlZ5eEhRVUZITEZGQlFXTXNTVUZCU1N4UlFVRlJMRWxCUVVrc1QwRkJUeXhKUVVGSkxFTkJRVU1zVDBGQlR5eERRVUZETEZGQlFWRXNTVUZCU1N4UFFVRlBMRU5CUVVNN096dEJRVWQ0Uml4SlFVRkpMRlZCUVZVc1IwRkJSeXhYUVVGWExFbEJRVWtzVVVGQllTeEpRVUZKTEZGQlFWRXNTVUZCU1N4TlFVRk5MRWxCUVVrc1EwRkJReXhOUVVGTkxFTkJRVU1zVVVGQlVTeEpRVUZKTEUxQlFVMHNRMEZCUXpzN08wRkJSMnhITEVsQlFVa3NZVUZCWVN4SFFVRkhMRlZCUVZVc1NVRkJTU3hWUVVGVkxFTkJRVU1zVDBGQlR5eExRVUZMTEZkQlFWY3NRMEZCUXpzN08wRkJSM0pGTEVsQlFVa3NUVUZCVFN4SFFVRkhMR0ZCUVdFc1IwRkJSMW9zUzBGQlNTeERRVUZETEUxQlFVMHNSMEZCUnl4VFFVRlRMRU5CUVVNN096dEJRVWR5UkN4SlFVRkpMR05CUVdNc1IwRkJSeXhOUVVGTkxFZEJRVWNzVFVGQlRTeERRVUZETEZGQlFWRXNSMEZCUnl4VFFVRlRMRU5CUVVNN096czdPenM3T3pzN096czdPenM3T3pzN1FVRnRRakZFTEVsQlFVa3NVVUZCVVN4SFFVRkhMR05CUVdNc1NVRkJTVGhETEZkQlFWTXNRMEZCUXpzN1FVRkZNME1zWTBGQll5eEhRVUZITEZGQlFWRXNRMEZCUXpzN08wRkRja014UWp0QlFVTkJMRWxCUVVrc1owSkJRV2RDTEVkQlFVY3NaMEpCUVdkQ0xFTkJRVU03T3p0QlFVZDRReXhKUVVGSkxGRkJRVkVzUjBGQlJ5eHJRa0ZCYTBJc1EwRkJRenM3T3pzN096czdPenRCUVZWc1F5eFRRVUZUTEU5QlFVOHNRMEZCUXl4TFFVRkxMRVZCUVVVc1RVRkJUU3hGUVVGRk8wVkJRemxDTEUxQlFVMHNSMEZCUnl4TlFVRk5MRWxCUVVrc1NVRkJTU3hIUVVGSExHZENRVUZuUWl4SFFVRkhMRTFCUVUwc1EwRkJRenRGUVVOd1JDeFBRVUZQTEVOQlFVTXNRMEZCUXl4TlFVRk5PMHRCUTFvc1QwRkJUeXhMUVVGTExFbEJRVWtzVVVGQlVTeEpRVUZKTEZGQlFWRXNRMEZCUXl4SlFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExFTkJRVU03UzBGRGFrUXNTMEZCU3l4SFFVRkhMRU5CUVVNc1EwRkJReXhKUVVGSkxFdEJRVXNzUjBGQlJ5eERRVUZETEVsQlFVa3NRMEZCUXl4SlFVRkpMRXRCUVVzc1IwRkJSeXhOUVVGTkxFTkJRVU1zUTBGQlF6dERRVU53UkRzN1FVRkZSQ3haUVVGakxFZEJRVWNzVDBGQlR5eERRVUZET3p0QlEzSkNla0k3UVVGRFFTeEpRVUZKUXl4clFrRkJaMElzUjBGQlJ5eG5Ra0ZCWjBJc1EwRkJRenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenRCUVRSQ2VFTXNVMEZCVXl4UlFVRlJMRU5CUVVNc1MwRkJTeXhGUVVGRk8wVkJRM1pDTEU5QlFVOHNUMEZCVHl4TFFVRkxMRWxCUVVrc1VVRkJVVHRKUVVNM1FpeExRVUZMTEVkQlFVY3NRMEZCUXl4RFFVRkRMRWxCUVVrc1MwRkJTeXhIUVVGSExFTkJRVU1zU1VGQlNTeERRVUZETEVsQlFVa3NTMEZCU3l4SlFVRkpRU3hyUWtGQlowSXNRMEZCUXp0RFFVTTNSRHM3UVVGRlJDeGpRVUZqTEVkQlFVY3NVVUZCVVN4RFFVRkRPenM3UVVNM1FqRkNMRWxCUVVsRExGTkJRVThzUjBGQlJ5eHZRa0ZCYjBJN1NVRkRPVUlzVVVGQlVTeEhRVUZITEdkQ1FVRm5RanRKUVVNelFpeFBRVUZQTEVkQlFVY3NhMEpCUVd0Q08wbEJRelZDTEU5QlFVOHNSMEZCUnl4bFFVRmxPMGxCUTNwQ0xGRkJRVkVzUjBGQlJ5eG5Ra0ZCWjBJN1NVRkRNMEpETEZOQlFVOHNSMEZCUnl4dFFrRkJiVUk3U1VGRE4wSXNUVUZCVFN4SFFVRkhMR05CUVdNN1NVRkRka0lzVTBGQlV5eEhRVUZITEdsQ1FVRnBRanRKUVVNM1FpeFRRVUZUTEVkQlFVY3NhVUpCUVdsQ08wbEJRemRDTEZOQlFWTXNSMEZCUnl4cFFrRkJhVUk3U1VGRE4wSXNUVUZCVFN4SFFVRkhMR05CUVdNN1NVRkRka0lzVTBGQlV5eEhRVUZITEdsQ1FVRnBRanRKUVVNM1FpeFZRVUZWTEVkQlFVY3NhMEpCUVd0Q0xFTkJRVU03TzBGQlJYQkRMRWxCUVVrc1kwRkJZeXhIUVVGSExITkNRVUZ6UWp0SlFVTjJReXhYUVVGWExFZEJRVWNzYlVKQlFXMUNPMGxCUTJwRExGVkJRVlVzUjBGQlJ5eDFRa0ZCZFVJN1NVRkRjRU1zVlVGQlZTeEhRVUZITEhWQ1FVRjFRanRKUVVOd1F5eFBRVUZQTEVkQlFVY3NiMEpCUVc5Q08wbEJRemxDTEZGQlFWRXNSMEZCUnl4eFFrRkJjVUk3U1VGRGFFTXNVVUZCVVN4SFFVRkhMSEZDUVVGeFFqdEpRVU5vUXl4UlFVRlJMRWRCUVVjc2NVSkJRWEZDTzBsQlEyaERMR1ZCUVdVc1IwRkJSeXcwUWtGQk5FSTdTVUZET1VNc1UwRkJVeXhIUVVGSExITkNRVUZ6UWp0SlFVTnNReXhUUVVGVExFZEJRVWNzYzBKQlFYTkNMRU5CUVVNN096dEJRVWQyUXl4SlFVRkpMR05CUVdNc1IwRkJSeXhGUVVGRkxFTkJRVU03UVVGRGVFSXNZMEZCWXl4RFFVRkRMRlZCUVZVc1EwRkJReXhIUVVGSExHTkJRV01zUTBGQlF5eFZRVUZWTEVOQlFVTTdRVUZEZGtRc1kwRkJZeXhEUVVGRExFOUJRVThzUTBGQlF5eEhRVUZITEdOQlFXTXNRMEZCUXl4UlFVRlJMRU5CUVVNN1FVRkRiRVFzWTBGQll5eERRVUZETEZGQlFWRXNRMEZCUXl4SFFVRkhMR05CUVdNc1EwRkJReXhSUVVGUkxFTkJRVU03UVVGRGJrUXNZMEZCWXl4RFFVRkRMR1ZCUVdVc1EwRkJReXhIUVVGSExHTkJRV01zUTBGQlF5eFRRVUZUTEVOQlFVTTdRVUZETTBRc1kwRkJZeXhEUVVGRExGTkJRVk1zUTBGQlF5eEhRVUZITEVsQlFVa3NRMEZCUXp0QlFVTnFReXhqUVVGakxFTkJRVU5FTEZOQlFVOHNRMEZCUXl4SFFVRkhMR05CUVdNc1EwRkJReXhSUVVGUkxFTkJRVU03UVVGRGJFUXNZMEZCWXl4RFFVRkRMR05CUVdNc1EwRkJReXhIUVVGSExHTkJRV01zUTBGQlF5eFBRVUZQTEVOQlFVTTdRVUZEZUVRc1kwRkJZeXhEUVVGRExGZEJRVmNzUTBGQlF5eEhRVUZITEdOQlFXTXNRMEZCUXl4UFFVRlBMRU5CUVVNN1FVRkRja1FzWTBGQll5eERRVUZETEZGQlFWRXNRMEZCUXl4SFFVRkhMR05CUVdNc1EwRkJRME1zVTBGQlR5eERRVUZETzBGQlEyeEVMR05CUVdNc1EwRkJReXhOUVVGTkxFTkJRVU1zUjBGQlJ5eGpRVUZqTEVOQlFVTXNVMEZCVXl4RFFVRkRPMEZCUTJ4RUxHTkJRV01zUTBGQlF5eFRRVUZUTEVOQlFVTXNSMEZCUnl4alFVRmpMRU5CUVVNc1UwRkJVeXhEUVVGRE8wRkJRM0pFTEdOQlFXTXNRMEZCUXl4TlFVRk5MRU5CUVVNc1IwRkJSeXhqUVVGakxFTkJRVU1zVTBGQlV5eERRVUZETzBGQlEyeEVMR05CUVdNc1EwRkJReXhWUVVGVkxFTkJRVU1zUjBGQlJ5eExRVUZMTEVOQlFVTTdPenM3T3pzN096dEJRVk51UXl4VFFVRlRMR2RDUVVGblFpeERRVUZETEV0QlFVc3NSVUZCUlR0RlFVTXZRaXhQUVVGUFRDeGpRVUZaTEVOQlFVTXNTMEZCU3l4RFFVRkRPMGxCUTNoQ1RTeFZRVUZSTEVOQlFVTXNTMEZCU3l4RFFVRkRMRTFCUVUwc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eGpRVUZqTEVOQlFVTXhReXhYUVVGVkxFTkJRVU1zUzBGQlN5eERRVUZETEVOQlFVTXNRMEZCUXp0RFFVTnFSVHM3UVVGRlJDeHhRa0ZCWXl4SFFVRkhMR2RDUVVGblFpeERRVUZET3p0QlF6TkViRU03T3pzN096czdRVUZQUVN4VFFVRlRMRk5CUVZNc1EwRkJReXhKUVVGSkxFVkJRVVU3UlVGRGRrSXNUMEZCVHl4VFFVRlRMRXRCUVVzc1JVRkJSVHRKUVVOeVFpeFBRVUZQTEVsQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJRenRIUVVOd1FpeERRVUZETzBOQlEwZzdPMEZCUlVRc1kwRkJZeXhIUVVGSExGTkJRVk1zUTBGQlF6czdPenRCUTFZelFpeEpRVUZKTEZkQlFWY3NSMEZCUnl4UlFVRmpMRWxCUVVrc1VVRkJVU3hKUVVGSkxFOUJRVThzU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4UlFVRlJMRWxCUVVrc1QwRkJUeXhEUVVGRE96czdRVUZIZUVZc1NVRkJTU3hWUVVGVkxFZEJRVWNzVjBGQlZ5eEpRVUZKTEZGQlFXRXNTVUZCU1N4UlFVRlJMRWxCUVVrc1RVRkJUU3hKUVVGSkxFTkJRVU1zVFVGQlRTeERRVUZETEZGQlFWRXNTVUZCU1N4TlFVRk5MRU5CUVVNN096dEJRVWRzUnl4SlFVRkpMR0ZCUVdFc1IwRkJSeXhWUVVGVkxFbEJRVWtzVlVGQlZTeERRVUZETEU5QlFVOHNTMEZCU3l4WFFVRlhMRU5CUVVNN096dEJRVWR5UlN4SlFVRkpMRmRCUVZjc1IwRkJSeXhoUVVGaExFbEJRVWxVTEZkQlFWVXNRMEZCUXl4UFFVRlBMRU5CUVVNN096dEJRVWQwUkN4SlFVRkpMRkZCUVZFc1NVRkJTU3hYUVVGWE8wVkJRM3BDTEVsQlFVazdTVUZEUml4UFFVRlBMRmRCUVZjc1NVRkJTU3hYUVVGWExFTkJRVU1zVDBGQlR5eEpRVUZKTEZkQlFWY3NRMEZCUXl4UFFVRlBMRU5CUVVNc1RVRkJUU3hEUVVGRExFTkJRVU03UjBGRE1VVXNRMEZCUXl4UFFVRlBMRU5CUVVNc1JVRkJSU3hGUVVGRk8wTkJRMllzUlVGQlJTeERRVUZETEVOQlFVTTdPMEZCUlV3c1kwRkJZeXhIUVVGSExGRkJRVkVzUTBGQlF6czdPenRCUTJoQ01VSXNTVUZCU1N4blFrRkJaMElzUjBGQlIyOUVMRk5CUVZFc1NVRkJTVUVzVTBGQlVTeERRVUZETEZsQlFWa3NRMEZCUXpzN096czdPenM3T3pzN096czdPenM3T3p0QlFXMUNla1FzU1VGQlNTeFpRVUZaTEVkQlFVY3NaMEpCUVdkQ0xFZEJRVWRETEZWQlFWTXNRMEZCUXl4blFrRkJaMElzUTBGQlF5eEhRVUZIUXl4cFFrRkJaMElzUTBGQlF6czdRVUZGY2tZc2EwSkJRV01zUjBGQlJ5eFpRVUZaTEVOQlFVTTdPenRCUTJ4Q09VSXNTVUZCU1c1RUxHRkJRVmNzUjBGQlJ5eE5RVUZOTEVOQlFVTXNVMEZCVXl4RFFVRkRPenM3UVVGSGJrTXNTVUZCU1ZVc1owSkJRV01zUjBGQlIxWXNZVUZCVnl4RFFVRkRMR05CUVdNc1EwRkJRenM3T3pzN096czdPenRCUVZWb1JDeFRRVUZUTEdGQlFXRXNRMEZCUXl4TFFVRkxMRVZCUVVVc1UwRkJVeXhGUVVGRk8wVkJRM1pETEVsQlFVa3NTMEZCU3l4SFFVRkhiMFFzVTBGQlR5eERRVUZETEV0QlFVc3NRMEZCUXp0TlFVTjBRaXhMUVVGTExFZEJRVWNzUTBGQlF5eExRVUZMTEVsQlFVbERMR0ZCUVZjc1EwRkJReXhMUVVGTExFTkJRVU03VFVGRGNFTXNUVUZCVFN4SFFVRkhMRU5CUVVNc1MwRkJTeXhKUVVGSkxFTkJRVU1zUzBGQlN5eEpRVUZKUXl4VlFVRlJMRU5CUVVNc1MwRkJTeXhEUVVGRE8wMUJRelZETEUxQlFVMHNSMEZCUnl4RFFVRkRMRXRCUVVzc1NVRkJTU3hEUVVGRExFdEJRVXNzU1VGQlNTeERRVUZETEUxQlFVMHNTVUZCU1VNc1kwRkJXU3hEUVVGRExFdEJRVXNzUTBGQlF6dE5RVU16UkN4WFFVRlhMRWRCUVVjc1MwRkJTeXhKUVVGSkxFdEJRVXNzU1VGQlNTeE5RVUZOTEVsQlFVa3NUVUZCVFR0TlFVTm9SQ3hOUVVGTkxFZEJRVWNzVjBGQlZ5eEhRVUZIUXl4VlFVRlRMRU5CUVVNc1MwRkJTeXhEUVVGRExFMUJRVTBzUlVGQlJTeE5RVUZOTEVOQlFVTXNSMEZCUnl4RlFVRkZPMDFCUXpORUxFMUJRVTBzUjBGQlJ5eE5RVUZOTEVOQlFVTXNUVUZCVFN4RFFVRkRPenRGUVVVelFpeExRVUZMTEVsQlFVa3NSMEZCUnl4SlFVRkpMRXRCUVVzc1JVRkJSVHRKUVVOeVFpeEpRVUZKTEVOQlFVTXNVMEZCVXl4SlFVRkpPVU1zWjBKQlFXTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1MwRkJTeXhGUVVGRkxFZEJRVWNzUTBGQlF6dFJRVU0zUXl4RlFVRkZMRmRCUVZjN08xZEJSVllzUjBGQlJ5eEpRVUZKTEZGQlFWRTdPMWxCUldRc1RVRkJUU3hMUVVGTExFZEJRVWNzU1VGQlNTeFJRVUZSTEVsQlFVa3NSMEZCUnl4SlFVRkpMRkZCUVZFc1EwRkJReXhEUVVGRE96dFpRVVV2UXl4TlFVRk5MRXRCUVVzc1IwRkJSeXhKUVVGSkxGRkJRVkVzU1VGQlNTeEhRVUZITEVsQlFVa3NXVUZCV1N4SlFVRkpMRWRCUVVjc1NVRkJTU3haUVVGWkxFTkJRVU1zUTBGQlF6czdWMEZGTTBVclF5eFJRVUZQTEVOQlFVTXNSMEZCUnl4RlFVRkZMRTFCUVUwc1EwRkJRenRUUVVOMFFpeERRVUZETEVWQlFVVTdUVUZEVGl4TlFVRk5MRU5CUVVNc1NVRkJTU3hEUVVGRExFZEJRVWNzUTBGQlF5eERRVUZETzB0QlEyeENPMGRCUTBZN1JVRkRSQ3hQUVVGUExFMUJRVTBzUTBGQlF6dERRVU5tT3p0QlFVVkVMR3RDUVVGakxFZEJRVWNzWVVGQllTeERRVUZET3p0QlEyaEVMMEk3UVVGRFFTeEpRVUZKZWtRc1lVRkJWeXhIUVVGSExFMUJRVTBzUTBGQlF5eFRRVUZUTEVOQlFVTTdPenM3T3pzN096dEJRVk51UXl4VFFVRlRMRmRCUVZjc1EwRkJReXhMUVVGTExFVkJRVVU3UlVGRE1VSXNTVUZCU1N4SlFVRkpMRWRCUVVjc1MwRkJTeXhKUVVGSkxFdEJRVXNzUTBGQlF5eFhRVUZYTzAxQlEycERMRXRCUVVzc1IwRkJSeXhEUVVGRExFOUJRVThzU1VGQlNTeEpRVUZKTEZWQlFWVXNTVUZCU1N4SlFVRkpMRU5CUVVNc1UwRkJVeXhMUVVGTFFTeGhRVUZYTEVOQlFVTTdPMFZCUlhwRkxFOUJRVThzUzBGQlN5eExRVUZMTEV0QlFVc3NRMEZCUXp0RFFVTjRRanM3UVVGRlJDeG5Ra0ZCWXl4SFFVRkhMRmRCUVZjc1EwRkJRenM3UVVOcVFqZENPenM3T3pzN096dEJRVkZCTEZOQlFWTXNUMEZCVHl4RFFVRkRMRWxCUVVrc1JVRkJSU3hUUVVGVExFVkJRVVU3UlVGRGFFTXNUMEZCVHl4VFFVRlRMRWRCUVVjc1JVRkJSVHRKUVVOdVFpeFBRVUZQTEVsQlFVa3NRMEZCUXl4VFFVRlRMRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU1zUTBGQlF6dEhRVU0zUWl4RFFVRkRPME5CUTBnN08wRkJSVVFzV1VGQll5eEhRVUZITEU5QlFVOHNRMEZCUXpzN08wRkRXSHBDTEVsQlFVa3NWVUZCVlN4SFFVRkhNRVFzVVVGQlR5eERRVUZETEUxQlFVMHNRMEZCUXl4SlFVRkpMRVZCUVVVc1RVRkJUU3hEUVVGRExFTkJRVU03TzBGQlJUbERMR1ZCUVdNc1IwRkJSeXhWUVVGVkxFTkJRVU03T3p0QlEwUTFRaXhKUVVGSk1VUXNZVUZCVnl4SFFVRkhMRTFCUVUwc1EwRkJReXhUUVVGVExFTkJRVU03T3p0QlFVZHVReXhKUVVGSlZTeG5Ra0ZCWXl4SFFVRkhWaXhoUVVGWExFTkJRVU1zWTBGQll5eERRVUZET3pzN096czdPenM3UVVGVGFFUXNVMEZCVXl4UlFVRlJMRU5CUVVNc1RVRkJUU3hGUVVGRk8wVkJRM2hDTEVsQlFVa3NRMEZCUXpKRUxGbEJRVmNzUTBGQlF5eE5RVUZOTEVOQlFVTXNSVUZCUlR0SlFVTjRRaXhQUVVGUFF5eFhRVUZWTEVOQlFVTXNUVUZCVFN4RFFVRkRMRU5CUVVNN1IwRkRNMEk3UlVGRFJDeEpRVUZKTEUxQlFVMHNSMEZCUnl4RlFVRkZMRU5CUVVNN1JVRkRhRUlzUzBGQlN5eEpRVUZKTEVkQlFVY3NTVUZCU1N4TlFVRk5MRU5CUVVNc1RVRkJUU3hEUVVGRExFVkJRVVU3U1VGRE9VSXNTVUZCU1d4RUxHZENRVUZqTEVOQlFVTXNTVUZCU1N4RFFVRkRMRTFCUVUwc1JVRkJSU3hIUVVGSExFTkJRVU1zU1VGQlNTeEhRVUZITEVsQlFVa3NZVUZCWVN4RlFVRkZPMDFCUXpWRUxFMUJRVTBzUTBGQlF5eEpRVUZKTEVOQlFVTXNSMEZCUnl4RFFVRkRMRU5CUVVNN1MwRkRiRUk3UjBGRFJqdEZRVU5FTEU5QlFVOHNUVUZCVFN4RFFVRkRPME5CUTJZN08wRkJSVVFzWVVGQll5eEhRVUZITEZGQlFWRXNRMEZCUXpzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3TzBGRFJERkNMRk5CUVZNc1YwRkJWeXhEUVVGRExFdEJRVXNzUlVGQlJUdEZRVU14UWl4UFFVRlBMRXRCUVVzc1NVRkJTU3hKUVVGSkxFbEJRVWx6UXl4VlFVRlJMRU5CUVVNc1MwRkJTeXhEUVVGRExFMUJRVTBzUTBGQlF5eEpRVUZKTEVOQlFVTndReXhaUVVGVkxFTkJRVU1zUzBGQlN5eERRVUZETEVOQlFVTTdRMEZEZEVVN08wRkJSVVFzYVVKQlFXTXNSMEZCUnl4WFFVRlhMRU5CUVVNN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096dEJRMEUzUWl4VFFVRlRMRWxCUVVrc1EwRkJReXhOUVVGTkxFVkJRVVU3UlVGRGNFSXNUMEZCVDJsRUxHRkJRVmNzUTBGQlF5eE5RVUZOTEVOQlFVTXNSMEZCUjBNc1kwRkJZU3hEUVVGRExFMUJRVTBzUTBGQlF5eEhRVUZIUXl4VFFVRlJMRU5CUVVNc1RVRkJUU3hEUVVGRExFTkJRVU03UTBGRGRrVTdPMEZCUlVRc1ZVRkJZeXhIUVVGSExFbEJRVWtzUTBGQlF6czdPenM3T3pzN096czdRVU40UW5SQ0xGTkJRVk1zVlVGQlZTeERRVUZETEUxQlFVMHNSVUZCUlN4TlFVRk5MRVZCUVVVN1JVRkRiRU1zVDBGQlR5eE5RVUZOTEVsQlFVbERMRmRCUVZVc1EwRkJReXhOUVVGTkxFVkJRVVZETEUxQlFVa3NRMEZCUXl4TlFVRk5MRU5CUVVNc1JVRkJSU3hOUVVGTkxFTkJRVU1zUTBGQlF6dERRVU16UkRzN1FVRkZSQ3hsUVVGakxFZEJRVWNzVlVGQlZTeERRVUZET3p0QlEyaENOVUk3T3pzN096czdPenRCUVZOQkxGTkJRVk1zV1VGQldTeERRVUZETEUxQlFVMHNSVUZCUlR0RlFVTTFRaXhKUVVGSkxFMUJRVTBzUjBGQlJ5eEZRVUZGTEVOQlFVTTdSVUZEYUVJc1NVRkJTU3hOUVVGTkxFbEJRVWtzU1VGQlNTeEZRVUZGTzBsQlEyeENMRXRCUVVzc1NVRkJTU3hIUVVGSExFbEJRVWtzVFVGQlRTeERRVUZETEUxQlFVMHNRMEZCUXl4RlFVRkZPMDFCUXpsQ0xFMUJRVTBzUTBGQlF5eEpRVUZKTEVOQlFVTXNSMEZCUnl4RFFVRkRMRU5CUVVNN1MwRkRiRUk3UjBGRFJqdEZRVU5FTEU5QlFVOHNUVUZCVFN4RFFVRkRPME5CUTJZN08wRkJSVVFzYVVKQlFXTXNSMEZCUnl4WlFVRlpMRU5CUVVNN096dEJRMlE1UWl4SlFVRkpha1VzWTBGQlZ5eEhRVUZITEUxQlFVMHNRMEZCUXl4VFFVRlRMRU5CUVVNN096dEJRVWR1UXl4SlFVRkpWU3huUWtGQll5eEhRVUZIVml4alFVRlhMRU5CUVVNc1kwRkJZeXhEUVVGRE96czdPenM3T3pzN1FVRlRhRVFzVTBGQlV5eFZRVUZWTEVOQlFVTXNUVUZCVFN4RlFVRkZPMFZCUXpGQ0xFbEJRVWtzUTBGQlEwc3NWVUZCVVN4RFFVRkRMRTFCUVUwc1EwRkJReXhGUVVGRk8wbEJRM0pDTEU5QlFVODJSQ3hoUVVGWkxFTkJRVU1zVFVGQlRTeERRVUZETEVOQlFVTTdSMEZETjBJN1JVRkRSQ3hKUVVGSkxFOUJRVThzUjBGQlIxQXNXVUZCVnl4RFFVRkRMRTFCUVUwc1EwRkJRenROUVVNM1FpeE5RVUZOTEVkQlFVY3NSVUZCUlN4RFFVRkRPenRGUVVWb1FpeExRVUZMTEVsQlFVa3NSMEZCUnl4SlFVRkpMRTFCUVUwc1JVRkJSVHRKUVVOMFFpeEpRVUZKTEVWQlFVVXNSMEZCUnl4SlFVRkpMR0ZCUVdFc1MwRkJTeXhQUVVGUExFbEJRVWtzUTBGQlEycEVMR2RDUVVGakxFTkJRVU1zU1VGQlNTeERRVUZETEUxQlFVMHNSVUZCUlN4SFFVRkhMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVVU3VFVGRE4wVXNUVUZCVFN4RFFVRkRMRWxCUVVrc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF6dExRVU5zUWp0SFFVTkdPMFZCUTBRc1QwRkJUeXhOUVVGTkxFTkJRVU03UTBGRFpqczdRVUZGUkN4bFFVRmpMRWRCUVVjc1ZVRkJWU3hEUVVGRE96czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3TzBGRFREVkNMRk5CUVZONVJDeFJRVUZOTEVOQlFVTXNUVUZCVFN4RlFVRkZPMFZCUTNSQ0xFOUJRVTlPTEdGQlFWY3NRMEZCUXl4TlFVRk5MRU5CUVVNc1IwRkJSME1zWTBGQllTeERRVUZETEUxQlFVMHNSVUZCUlN4SlFVRkpMRU5CUVVNc1IwRkJSMDBzVjBGQlZTeERRVUZETEUxQlFVMHNRMEZCUXl4RFFVRkRPME5CUXk5Rk96dEJRVVZFTEZsQlFXTXNSMEZCUjBRc1VVRkJUU3hEUVVGRE96czdPenM3T3pzN096dEJRMjVDZUVJc1UwRkJVeXhaUVVGWkxFTkJRVU1zVFVGQlRTeEZRVUZGTEUxQlFVMHNSVUZCUlR0RlFVTndReXhQUVVGUExFMUJRVTBzU1VGQlNVZ3NWMEZCVlN4RFFVRkRMRTFCUVUwc1JVRkJSVWNzVVVGQlRTeERRVUZETEUxQlFVMHNRMEZCUXl4RlFVRkZMRTFCUVUwc1EwRkJReXhEUVVGRE8wTkJRemRFT3p0QlFVVkVMR2xDUVVGakxFZEJRVWNzV1VGQldTeERRVUZET3pzN08wRkRZamxDTEVsQlFVa3NWMEZCVnl4SFFVRkhMRkZCUVdNc1NVRkJTU3hSUVVGUkxFbEJRVWtzVDBGQlR5eEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRkZCUVZFc1NVRkJTU3hQUVVGUExFTkJRVU03T3p0QlFVZDRSaXhKUVVGSkxGVkJRVlVzUjBGQlJ5eFhRVUZYTEVsQlFVa3NVVUZCWVN4SlFVRkpMRkZCUVZFc1NVRkJTU3hOUVVGTkxFbEJRVWtzUTBGQlF5eE5RVUZOTEVOQlFVTXNVVUZCVVN4SlFVRkpMRTFCUVUwc1EwRkJRenM3TzBGQlIyeEhMRWxCUVVrc1lVRkJZU3hIUVVGSExGVkJRVlVzU1VGQlNTeFZRVUZWTEVOQlFVTXNUMEZCVHl4TFFVRkxMRmRCUVZjc1EwRkJRenM3TzBGQlIzSkZMRWxCUVVrc1RVRkJUU3hIUVVGSExHRkJRV0VzUjBGQlIzSkZMRXRCUVVrc1EwRkJReXhOUVVGTkxFZEJRVWNzVTBGQlV6dEpRVU5vUkN4WFFVRlhMRWRCUVVjc1RVRkJUU3hIUVVGSExFMUJRVTBzUTBGQlF5eFhRVUZYTEVkQlFVY3NVMEZCVXl4RFFVRkRPenM3T3pzN096czdPMEZCVlRGRUxGTkJRVk1zVjBGQlZ5eERRVUZETEUxQlFVMHNSVUZCUlN4TlFVRk5MRVZCUVVVN1JVRkRia01zU1VGQlNTeE5RVUZOTEVWQlFVVTdTVUZEVml4UFFVRlBMRTFCUVUwc1EwRkJReXhMUVVGTExFVkJRVVVzUTBGQlF6dEhRVU4yUWp0RlFVTkVMRWxCUVVrc1RVRkJUU3hIUVVGSExFMUJRVTBzUTBGQlF5eE5RVUZOTzAxQlEzUkNMRTFCUVUwc1IwRkJSeXhYUVVGWExFZEJRVWNzVjBGQlZ5eERRVUZETEUxQlFVMHNRMEZCUXl4SFFVRkhMRWxCUVVrc1RVRkJUU3hEUVVGRExGZEJRVmNzUTBGQlF5eE5RVUZOTEVOQlFVTXNRMEZCUXpzN1JVRkZhRVlzVFVGQlRTeERRVUZETEVsQlFVa3NRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJRenRGUVVOd1FpeFBRVUZQTEUxQlFVMHNRMEZCUXp0RFFVTm1PenRCUVVWRUxHTkJRV01zUjBGQlJ5eFhRVUZYTEVOQlFVTTdPenRCUTJ4RE4wSTdPenM3T3pzN08wRkJVVUVzVTBGQlV5eFRRVUZUTEVOQlFVTXNUVUZCVFN4RlFVRkZMRXRCUVVzc1JVRkJSVHRGUVVOb1F5eEpRVUZKTEV0QlFVc3NSMEZCUnl4RFFVRkRMRU5CUVVNN1RVRkRWaXhOUVVGTkxFZEJRVWNzVFVGQlRTeERRVUZETEUxQlFVMHNRMEZCUXpzN1JVRkZNMElzUzBGQlN5eExRVUZMTEV0QlFVc3NSMEZCUnl4TFFVRkxMRU5CUVVNc1RVRkJUU3hEUVVGRExFTkJRVU1zUTBGQlF6dEZRVU5xUXl4UFFVRlBMRVZCUVVVc1MwRkJTeXhIUVVGSExFMUJRVTBzUlVGQlJUdEpRVU4yUWl4TFFVRkxMRU5CUVVNc1MwRkJTeXhEUVVGRExFZEJRVWNzVFVGQlRTeERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRPMGRCUXpsQ08wVkJRMFFzVDBGQlR5eExRVUZMTEVOQlFVTTdRMEZEWkRzN1FVRkZSQ3hqUVVGakxFZEJRVWNzVTBGQlV5eERRVUZET3p0QlEyNUNNMEk3T3pzN096czdPenRCUVZOQkxGTkJRVk1zVjBGQlZ5eERRVUZETEV0QlFVc3NSVUZCUlN4VFFVRlRMRVZCUVVVN1JVRkRja01zU1VGQlNTeExRVUZMTEVkQlFVY3NRMEZCUXl4RFFVRkRPMDFCUTFZc1RVRkJUU3hIUVVGSExFdEJRVXNzU1VGQlNTeEpRVUZKTEVkQlFVY3NRMEZCUXl4SFFVRkhMRXRCUVVzc1EwRkJReXhOUVVGTk8wMUJRM3BETEZGQlFWRXNSMEZCUnl4RFFVRkRPMDFCUTFvc1RVRkJUU3hIUVVGSExFVkJRVVVzUTBGQlF6czdSVUZGYUVJc1QwRkJUeXhGUVVGRkxFdEJRVXNzUjBGQlJ5eE5RVUZOTEVWQlFVVTdTVUZEZGtJc1NVRkJTU3hMUVVGTExFZEJRVWNzUzBGQlN5eERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRPMGxCUTNwQ0xFbEJRVWtzVTBGQlV5eERRVUZETEV0QlFVc3NSVUZCUlN4TFFVRkxMRVZCUVVVc1MwRkJTeXhEUVVGRExFVkJRVVU3VFVGRGJFTXNUVUZCVFN4RFFVRkRMRkZCUVZFc1JVRkJSU3hEUVVGRExFZEJRVWNzUzBGQlN5eERRVUZETzB0QlF6VkNPMGRCUTBZN1JVRkRSQ3hQUVVGUExFMUJRVTBzUTBGQlF6dERRVU5tT3p0QlFVVkVMR2RDUVVGakxFZEJRVWNzVjBGQlZ5eERRVUZET3p0QlEzaENOMEk3T3pzN096czdPenM3T3pzN096czdPenRCUVd0Q1FTeFRRVUZUTEZOQlFWTXNSMEZCUnp0RlFVTnVRaXhQUVVGUExFVkJRVVVzUTBGQlF6dERRVU5ZT3p0QlFVVkVMR1ZCUVdNc1IwRkJSeXhUUVVGVExFTkJRVU03T3p0QlEyeENNMElzU1VGQlNVVXNZMEZCVnl4SFFVRkhMRTFCUVUwc1EwRkJReXhUUVVGVExFTkJRVU03T3p0QlFVZHVReXhKUVVGSmNVVXNjMEpCUVc5Q0xFZEJRVWR5UlN4alFVRlhMRU5CUVVNc2IwSkJRVzlDTEVOQlFVTTdPenRCUVVjMVJDeEpRVUZKTEdkQ1FVRm5RaXhIUVVGSExFMUJRVTBzUTBGQlF5eHhRa0ZCY1VJc1EwRkJRenM3T3pzN096czdPMEZCVTNCRUxFbEJRVWtzVlVGQlZTeEhRVUZITEVOQlFVTXNaMEpCUVdkQ0xFZEJRVWR6UlN4WFFVRlRMRWRCUVVjc1UwRkJVeXhOUVVGTkxFVkJRVVU3UlVGRGFFVXNTVUZCU1N4TlFVRk5MRWxCUVVrc1NVRkJTU3hGUVVGRk8wbEJRMnhDTEU5QlFVOHNSVUZCUlN4RFFVRkRPMGRCUTFnN1JVRkRSQ3hOUVVGTkxFZEJRVWNzVFVGQlRTeERRVUZETEUxQlFVMHNRMEZCUXl4RFFVRkRPMFZCUTNoQ0xFOUJRVTlETEZsQlFWY3NRMEZCUXl4blFrRkJaMElzUTBGQlF5eE5RVUZOTEVOQlFVTXNSVUZCUlN4VFFVRlRMRTFCUVUwc1JVRkJSVHRKUVVNMVJDeFBRVUZQUml4elFrRkJiMElzUTBGQlF5eEpRVUZKTEVOQlFVTXNUVUZCVFN4RlFVRkZMRTFCUVUwc1EwRkJReXhEUVVGRE8wZEJRMnhFTEVOQlFVTXNRMEZCUXp0RFFVTktMRU5CUVVNN08wRkJSVVlzWlVGQll5eEhRVUZITEZWQlFWVXNRMEZCUXpzN096czdPenM3T3p0QlEyeENOVUlzVTBGQlV5eFhRVUZYTEVOQlFVTXNUVUZCVFN4RlFVRkZMRTFCUVUwc1JVRkJSVHRGUVVOdVF5eFBRVUZQVEN4WFFVRlZMRU5CUVVNc1RVRkJUU3hGUVVGRlVTeFhRVUZWTEVOQlFVTXNUVUZCVFN4RFFVRkRMRVZCUVVVc1RVRkJUU3hEUVVGRExFTkJRVU03UTBGRGRrUTdPMEZCUlVRc1owSkJRV01zUjBGQlJ5eFhRVUZYTEVOQlFVTTdPMEZEWmpkQ096czdPenM3T3p0QlFWRkJMRk5CUVZNc1UwRkJVeXhEUVVGRExFdEJRVXNzUlVGQlJTeE5RVUZOTEVWQlFVVTdSVUZEYUVNc1NVRkJTU3hMUVVGTExFZEJRVWNzUTBGQlF5eERRVUZETzAxQlExWXNUVUZCVFN4SFFVRkhMRTFCUVUwc1EwRkJReXhOUVVGTk8wMUJRM1JDTEUxQlFVMHNSMEZCUnl4TFFVRkxMRU5CUVVNc1RVRkJUU3hEUVVGRE96dEZRVVV4UWl4UFFVRlBMRVZCUVVVc1MwRkJTeXhIUVVGSExFMUJRVTBzUlVGQlJUdEpRVU4yUWl4TFFVRkxMRU5CUVVNc1RVRkJUU3hIUVVGSExFdEJRVXNzUTBGQlF5eEhRVUZITEUxQlFVMHNRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJRenRIUVVOMlF6dEZRVU5FTEU5QlFVOHNTMEZCU3l4RFFVRkRPME5CUTJRN08wRkJSVVFzWTBGQll5eEhRVUZITEZOQlFWTXNRMEZCUXpzN08wRkRhRUl6UWl4SlFVRkpMRmxCUVZrc1IwRkJSMlFzVVVGQlR5eERRVUZETEUxQlFVMHNRMEZCUXl4alFVRmpMRVZCUVVVc1RVRkJUU3hEUVVGRExFTkJRVU03TzBGQlJURkVMR2xDUVVGakxFZEJRVWNzV1VGQldTeERRVUZET3pzN1FVTkRPVUlzU1VGQlNXVXNhMEpCUVdkQ0xFZEJRVWNzVFVGQlRTeERRVUZETEhGQ1FVRnhRaXhEUVVGRE96czdPenM3T3pzN1FVRlRjRVFzU1VGQlNTeFpRVUZaTEVkQlFVY3NRMEZCUTBFc2EwSkJRV2RDTEVkQlFVZElMRmRCUVZNc1IwRkJSeXhUUVVGVExFMUJRVTBzUlVGQlJUdEZRVU5zUlN4SlFVRkpMRTFCUVUwc1IwRkJSeXhGUVVGRkxFTkJRVU03UlVGRGFFSXNUMEZCVHl4TlFVRk5MRVZCUVVVN1NVRkRZa2tzVlVGQlV5eERRVUZETEUxQlFVMHNSVUZCUlVZc1YwRkJWU3hEUVVGRExFMUJRVTBzUTBGQlF5eERRVUZETEVOQlFVTTdTVUZEZEVNc1RVRkJUU3hIUVVGSFJ5eGhRVUZaTEVOQlFVTXNUVUZCVFN4RFFVRkRMRU5CUVVNN1IwRkRMMEk3UlVGRFJDeFBRVUZQTEUxQlFVMHNRMEZCUXp0RFFVTm1MRU5CUVVNN08wRkJSVVlzYVVKQlFXTXNSMEZCUnl4WlFVRlpMRU5CUVVNN096czdPenM3T3pzN1FVTmlPVUlzVTBGQlV5eGhRVUZoTEVOQlFVTXNUVUZCVFN4RlFVRkZMRTFCUVUwc1JVRkJSVHRGUVVOeVF5eFBRVUZQV0N4WFFVRlZMRU5CUVVNc1RVRkJUU3hGUVVGRldTeGhRVUZaTEVOQlFVTXNUVUZCVFN4RFFVRkRMRVZCUVVVc1RVRkJUU3hEUVVGRExFTkJRVU03UTBGRGVrUTdPMEZCUlVRc2EwSkJRV01zUjBGQlJ5eGhRVUZoTEVOQlFVTTdPenM3T3pzN096czdPenM3UVVORUwwSXNVMEZCVXl4alFVRmpMRU5CUVVNc1RVRkJUU3hGUVVGRkxGRkJRVkVzUlVGQlJTeFhRVUZYTEVWQlFVVTdSVUZEY2tRc1NVRkJTU3hOUVVGTkxFZEJRVWNzVVVGQlVTeERRVUZETEUxQlFVMHNRMEZCUXl4RFFVRkRPMFZCUXpsQ0xFOUJRVTk0UWl4VFFVRlBMRU5CUVVNc1RVRkJUU3hEUVVGRExFZEJRVWNzVFVGQlRTeEhRVUZIYzBJc1ZVRkJVeXhEUVVGRExFMUJRVTBzUlVGQlJTeFhRVUZYTEVOQlFVTXNUVUZCVFN4RFFVRkRMRU5CUVVNc1EwRkJRenREUVVNeFJUczdRVUZGUkN4dFFrRkJZeXhIUVVGSExHTkJRV01zUTBGQlF6czdPenM3T3pzN08wRkRVbWhETEZOQlFWTXNWVUZCVlN4RFFVRkRMRTFCUVUwc1JVRkJSVHRGUVVNeFFpeFBRVUZQUnl4bFFVRmpMRU5CUVVNc1RVRkJUU3hGUVVGRldpeE5RVUZKTEVWQlFVVlBMRmRCUVZVc1EwRkJReXhEUVVGRE8wTkJRMnBFT3p0QlFVVkVMR1ZCUVdNc1IwRkJSeXhWUVVGVkxFTkJRVU03T3pzN096czdPenM3UVVOSU5VSXNVMEZCVXl4WlFVRlpMRU5CUVVNc1RVRkJUU3hGUVVGRk8wVkJRelZDTEU5QlFVOUxMR1ZCUVdNc1EwRkJReXhOUVVGTkxFVkJRVVZXTEZGQlFVMHNSVUZCUlZNc1lVRkJXU3hEUVVGRExFTkJRVU03UTBGRGNrUTdPMEZCUlVRc2FVSkJRV01zUjBGQlJ5eFpRVUZaTEVOQlFVTTdPenRCUTFvNVFpeEpRVUZKTEZGQlFWRXNSMEZCUnpWRUxGVkJRVk1zUTBGQlEyeENMRXRCUVVrc1JVRkJSU3hWUVVGVkxFTkJRVU1zUTBGQlF6czdRVUZGTTBNc1lVRkJZeXhIUVVGSExGRkJRVkVzUTBGQlF6czdPMEZEUmpGQ0xFbEJRVWtzVDBGQlR5eEhRVUZIYTBJc1ZVRkJVeXhEUVVGRGJFSXNTMEZCU1N4RlFVRkZMRk5CUVZNc1EwRkJReXhEUVVGRE96dEJRVVY2UXl4WlFVRmpMRWRCUVVjc1QwRkJUeXhEUVVGRE96czdRVU5HZWtJc1NVRkJTU3hIUVVGSExFZEJRVWRyUWl4VlFVRlRMRU5CUVVOc1FpeExRVUZKTEVWQlFVVXNTMEZCU3l4RFFVRkRMRU5CUVVNN08wRkJSV3BETEZGQlFXTXNSMEZCUnl4SFFVRkhMRU5CUVVNN096dEJRMFp5UWl4SlFVRkpMRTlCUVU4c1IwRkJSMnRDTEZWQlFWTXNRMEZCUTJ4Q0xFdEJRVWtzUlVGQlJTeFRRVUZUTEVOQlFVTXNRMEZCUXpzN1FVRkZla01zV1VGQll5eEhRVUZITEU5QlFVOHNRMEZCUXpzN08wRkRSM3BDTEVsQlFVbG5SaXhSUVVGTkxFZEJRVWNzWTBGQll6dEpRVU4yUWtNc1YwRkJVeXhIUVVGSExHbENRVUZwUWp0SlFVTTNRaXhWUVVGVkxFZEJRVWNzYTBKQlFXdENPMGxCUXk5Q1F5eFJRVUZOTEVkQlFVY3NZMEZCWXp0SlFVTjJRa01zV1VGQlZTeEhRVUZITEd0Q1FVRnJRaXhEUVVGRE96dEJRVVZ3UXl4SlFVRkpReXhoUVVGWExFZEJRVWNzYlVKQlFXMUNMRU5CUVVNN096dEJRVWQwUXl4SlFVRkpMR3RDUVVGclFpeEhRVUZIY2tVc1UwRkJVU3hEUVVGRGMwVXNVMEZCVVN4RFFVRkRPMGxCUTNaRExHRkJRV0VzUjBGQlIzUkZMRk5CUVZFc1EwRkJRMWtzU1VGQlJ5eERRVUZETzBsQlF6ZENMR2xDUVVGcFFpeEhRVUZIV2l4VFFVRlJMRU5CUVVOMVJTeFJRVUZQTEVOQlFVTTdTVUZEY2tNc1lVRkJZU3hIUVVGSGRrVXNVMEZCVVN4RFFVRkRkMFVzU1VGQlJ5eERRVUZETzBsQlF6ZENMR2xDUVVGcFFpeEhRVUZIZUVVc1UwRkJVU3hEUVVGRGVVVXNVVUZCVHl4RFFVRkRMRU5CUVVNN096czdPenM3T3p0QlFWTXhReXhKUVVGSkxFMUJRVTBzUjBGQlIyaEdMRmRCUVZVc1EwRkJRenM3TzBGQlIzaENMRWxCUVVrc1EwRkJRelpGTEZOQlFWRXNTVUZCU1N4TlFVRk5MRU5CUVVNc1NVRkJTVUVzVTBGQlVTeERRVUZETEVsQlFVa3NWMEZCVnl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zU1VGQlNVUXNZVUZCVnp0TFFVTnVSWHBFTEVsQlFVY3NTVUZCU1N4TlFVRk5MRU5CUVVNc1NVRkJTVUVzU1VGQlJ5eERRVUZETEVsQlFVbHhSQ3hSUVVGTkxFTkJRVU03UzBGRGFrTk5MRkZCUVU4c1NVRkJTU3hOUVVGTkxFTkJRVU5CTEZGQlFVOHNRMEZCUXl4UFFVRlBMRVZCUVVVc1EwRkJReXhKUVVGSkxGVkJRVlVzUTBGQlF6dExRVU51UkVNc1NVRkJSeXhKUVVGSkxFMUJRVTBzUTBGQlF5eEpRVUZKUVN4SlFVRkhMRU5CUVVNc1NVRkJTVXdzVVVGQlRTeERRVUZETzB0QlEycERUU3hSUVVGUExFbEJRVWtzVFVGQlRTeERRVUZETEVsQlFVbEJMRkZCUVU4c1EwRkJReXhKUVVGSlRDeFpRVUZWTEVOQlFVTXNSVUZCUlR0RlFVTnNSQ3hOUVVGTkxFZEJRVWNzVTBGQlV5eExRVUZMTEVWQlFVVTdTVUZEZGtJc1NVRkJTU3hOUVVGTkxFZEJRVWN6UlN4WFFVRlZMRU5CUVVNc1MwRkJTeXhEUVVGRE8xRkJRekZDTEVsQlFVa3NSMEZCUnl4TlFVRk5MRWxCUVVsNVJTeFhRVUZUTEVkQlFVY3NTMEZCU3l4RFFVRkRMRmRCUVZjc1IwRkJSeXhUUVVGVE8xRkJRekZFTEZWQlFWVXNSMEZCUnl4SlFVRkpMRWRCUVVkc1JTeFRRVUZSTEVOQlFVTXNTVUZCU1N4RFFVRkRMRWRCUVVjc1JVRkJSU3hEUVVGRE96dEpRVVUxUXl4SlFVRkpMRlZCUVZVc1JVRkJSVHROUVVOa0xGRkJRVkVzVlVGQlZUdFJRVU5vUWl4TFFVRkxMR3RDUVVGclFpeEZRVUZGTEU5QlFVOXhSU3hoUVVGWExFTkJRVU03VVVGRE5VTXNTMEZCU3l4aFFVRmhMRVZCUVVVc1QwRkJUMG9zVVVGQlRTeERRVUZETzFGQlEyeERMRXRCUVVzc2FVSkJRV2xDTEVWQlFVVXNUMEZCVHl4VlFVRlZMRU5CUVVNN1VVRkRNVU1zUzBGQlN5eGhRVUZoTEVWQlFVVXNUMEZCVDBVc1VVRkJUU3hEUVVGRE8xRkJRMnhETEV0QlFVc3NhVUpCUVdsQ0xFVkJRVVVzVDBGQlQwTXNXVUZCVlN4RFFVRkRPMDlCUXpORE8wdEJRMFk3U1VGRFJDeFBRVUZQTEUxQlFVMHNRMEZCUXp0SFFVTm1MRU5CUVVNN1EwRkRTRHM3UVVGRlJDeFhRVUZqTEVkQlFVY3NUVUZCVFN4RFFVRkRPenRCUTNwRWVFSTdRVUZEUVN4SlFVRkpha1lzWTBGQlZ5eEhRVUZITEUxQlFVMHNRMEZCUXl4VFFVRlRMRU5CUVVNN096dEJRVWR1UXl4SlFVRkpWU3huUWtGQll5eEhRVUZIVml4alFVRlhMRU5CUVVNc1kwRkJZeXhEUVVGRE96czdPenM3T3pzN1FVRlRhRVFzVTBGQlV5eGpRVUZqTEVOQlFVTXNTMEZCU3l4RlFVRkZPMFZCUXpkQ0xFbEJRVWtzVFVGQlRTeEhRVUZITEV0QlFVc3NRMEZCUXl4TlFVRk5PMDFCUTNKQ0xFMUJRVTBzUjBGQlJ5eExRVUZMTEVOQlFVTXNWMEZCVnl4RFFVRkRMRTFCUVUwc1EwRkJReXhEUVVGRE96czdSVUZIZGtNc1NVRkJTU3hOUVVGTkxFbEJRVWtzVDBGQlR5eExRVUZMTEVOQlFVTXNRMEZCUXl4RFFVRkRMRWxCUVVrc1VVRkJVU3hKUVVGSlZTeG5Ra0ZCWXl4RFFVRkRMRWxCUVVrc1EwRkJReXhMUVVGTExFVkJRVVVzVDBGQlR5eERRVUZETEVWQlFVVTdTVUZEYUVZc1RVRkJUU3hEUVVGRExFdEJRVXNzUjBGQlJ5eExRVUZMTEVOQlFVTXNTMEZCU3l4RFFVRkRPMGxCUXpOQ0xFMUJRVTBzUTBGQlF5eExRVUZMTEVkQlFVY3NTMEZCU3l4RFFVRkRMRXRCUVVzc1EwRkJRenRIUVVNMVFqdEZRVU5FTEU5QlFVOHNUVUZCVFN4RFFVRkRPME5CUTJZN08wRkJSVVFzYlVKQlFXTXNSMEZCUnl4alFVRmpMRU5CUVVNN096dEJRM1JDYUVNc1NVRkJTU3hWUVVGVkxFZEJRVWRhTEV0QlFVa3NRMEZCUXl4VlFVRlZMRU5CUVVNN08wRkJSV3BETEdWQlFXTXNSMEZCUnl4VlFVRlZMRU5CUVVNN096czdPenM3T3p0QlEwazFRaXhUUVVGVExHZENRVUZuUWl4RFFVRkRMRmRCUVZjc1JVRkJSVHRGUVVOeVF5eEpRVUZKTEUxQlFVMHNSMEZCUnl4SlFVRkpMRmRCUVZjc1EwRkJReXhYUVVGWExFTkJRVU1zVjBGQlZ5eERRVUZETEZWQlFWVXNRMEZCUXl4RFFVRkRPMFZCUTJwRkxFbEJRVWw1Uml4WFFVRlZMRU5CUVVNc1RVRkJUU3hEUVVGRExFTkJRVU1zUjBGQlJ5eERRVUZETEVsQlFVbEJMRmRCUVZVc1EwRkJReXhYUVVGWExFTkJRVU1zUTBGQlF5eERRVUZETzBWQlEzaEVMRTlCUVU4c1RVRkJUU3hEUVVGRE8wTkJRMlk3TzBGQlJVUXNjVUpCUVdNc1IwRkJSeXhuUWtGQlowSXNRMEZCUXpzN096czdPenM3T3p0QlEweHNReXhUUVVGVExHRkJRV0VzUTBGQlF5eFJRVUZSTEVWQlFVVXNUVUZCVFN4RlFVRkZPMFZCUTNaRExFbEJRVWtzVFVGQlRTeEhRVUZITEUxQlFVMHNSMEZCUjBNc2FVSkJRV2RDTEVOQlFVTXNVVUZCVVN4RFFVRkRMRTFCUVUwc1EwRkJReXhIUVVGSExGRkJRVkVzUTBGQlF5eE5RVUZOTEVOQlFVTTdSVUZETVVVc1QwRkJUeXhKUVVGSkxGRkJRVkVzUTBGQlF5eFhRVUZYTEVOQlFVTXNUVUZCVFN4RlFVRkZMRkZCUVZFc1EwRkJReXhWUVVGVkxFVkJRVVVzVVVGQlVTeERRVUZETEZWQlFWVXNRMEZCUXl4RFFVRkRPME5CUTI1R096dEJRVVZFTEd0Q1FVRmpMRWRCUVVjc1lVRkJZU3hEUVVGRE96dEJRMll2UWpzN096czdPenM3UVVGUlFTeFRRVUZUTEZkQlFWY3NRMEZCUXl4SFFVRkhMRVZCUVVVc1NVRkJTU3hGUVVGRk96dEZRVVU1UWl4SFFVRkhMRU5CUVVNc1IwRkJSeXhEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dEZRVU14UWl4UFFVRlBMRWRCUVVjc1EwRkJRenREUVVOYU96dEJRVVZFTEdkQ1FVRmpMRWRCUVVjc1YwRkJWeXhEUVVGRE96dEJRMlEzUWpzN096czdPenM3T3pzN08wRkJXVUVzVTBGQlV5eFhRVUZYTEVOQlFVTXNTMEZCU3l4RlFVRkZMRkZCUVZFc1JVRkJSU3hYUVVGWExFVkJRVVVzVTBGQlV5eEZRVUZGTzBWQlF6VkVMRWxCUVVrc1MwRkJTeXhIUVVGSExFTkJRVU1zUTBGQlF6dE5RVU5XTEUxQlFVMHNSMEZCUnl4TFFVRkxMRWxCUVVrc1NVRkJTU3hIUVVGSExFTkJRVU1zUjBGQlJ5eExRVUZMTEVOQlFVTXNUVUZCVFN4RFFVRkRPenRGUVVVNVF5eEpRVUZKTEZOQlFWTXNTVUZCU1N4TlFVRk5MRVZCUVVVN1NVRkRka0lzVjBGQlZ5eEhRVUZITEV0QlFVc3NRMEZCUXl4RlFVRkZMRXRCUVVzc1EwRkJReXhEUVVGRE8wZEJRemxDTzBWQlEwUXNUMEZCVHl4RlFVRkZMRXRCUVVzc1IwRkJSeXhOUVVGTkxFVkJRVVU3U1VGRGRrSXNWMEZCVnl4SFFVRkhMRkZCUVZFc1EwRkJReXhYUVVGWExFVkJRVVVzUzBGQlN5eERRVUZETEV0QlFVc3NRMEZCUXl4RlFVRkZMRXRCUVVzc1JVRkJSU3hMUVVGTExFTkJRVU1zUTBGQlF6dEhRVU5xUlR0RlFVTkVMRTlCUVU4c1YwRkJWeXhEUVVGRE8wTkJRM0JDT3p0QlFVVkVMR2RDUVVGakxFZEJRVWNzVjBGQlZ5eERRVUZET3p0QlEzcENOMEk3T3pzN096czdRVUZQUVN4VFFVRlRMRlZCUVZVc1EwRkJReXhIUVVGSExFVkJRVVU3UlVGRGRrSXNTVUZCU1N4TFFVRkxMRWRCUVVjc1EwRkJReXhEUVVGRE8wMUJRMVlzVFVGQlRTeEhRVUZITEV0QlFVc3NRMEZCUXl4SFFVRkhMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU03TzBWQlJUZENMRWRCUVVjc1EwRkJReXhQUVVGUExFTkJRVU1zVTBGQlV5eExRVUZMTEVWQlFVVXNSMEZCUnl4RlFVRkZPMGxCUXk5Q0xFMUJRVTBzUTBGQlF5eEZRVUZGTEV0QlFVc3NRMEZCUXl4SFFVRkhMRU5CUVVNc1IwRkJSeXhGUVVGRkxFdEJRVXNzUTBGQlF5eERRVUZETzBkQlEyaERMRU5CUVVNc1EwRkJRenRGUVVOSUxFOUJRVThzVFVGQlRTeERRVUZETzBOQlEyWTdPMEZCUlVRc1pVRkJZeXhIUVVGSExGVkJRVlVzUTBGQlF6czdPMEZEV2pWQ0xFbEJRVWtzWlVGQlpTeEhRVUZITEVOQlFVTXNRMEZCUXpzN096czdPenM3T3pzN1FVRlhlRUlzVTBGQlV5eFJRVUZSTEVOQlFVTXNSMEZCUnl4RlFVRkZMRTFCUVUwc1JVRkJSU3hUUVVGVExFVkJRVVU3UlVGRGVFTXNTVUZCU1N4TFFVRkxMRWRCUVVjc1RVRkJUU3hIUVVGSExGTkJRVk1zUTBGQlEwTXNWMEZCVlN4RFFVRkRMRWRCUVVjc1EwRkJReXhGUVVGRkxHVkJRV1VzUTBGQlF5eEhRVUZIUVN4WFFVRlZMRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU03UlVGRGJrWXNUMEZCVDBNc1dVRkJWeXhEUVVGRExFdEJRVXNzUlVGQlJVTXNXVUZCVnl4RlFVRkZMRWxCUVVrc1IwRkJSeXhEUVVGRExGZEJRVmNzUTBGQlF5eERRVUZETzBOQlF6ZEVPenRCUVVWRUxHRkJRV01zUjBGQlJ5eFJRVUZSTEVOQlFVTTdPMEZEY2tJeFFqdEJRVU5CTEVsQlFVa3NUMEZCVHl4SFFVRkhMRTFCUVUwc1EwRkJRenM3T3pzN096czdPMEZCVTNKQ0xGTkJRVk1zVjBGQlZ5eERRVUZETEUxQlFVMHNSVUZCUlR0RlFVTXpRaXhKUVVGSkxFMUJRVTBzUjBGQlJ5eEpRVUZKTEUxQlFVMHNRMEZCUXl4WFFVRlhMRU5CUVVNc1RVRkJUU3hEUVVGRExFMUJRVTBzUlVGQlJTeFBRVUZQTEVOQlFVTXNTVUZCU1N4RFFVRkRMRTFCUVUwc1EwRkJReXhEUVVGRExFTkJRVU03UlVGRGVrVXNUVUZCVFN4RFFVRkRMRk5CUVZNc1IwRkJSeXhOUVVGTkxFTkJRVU1zVTBGQlV5eERRVUZETzBWQlEzQkRMRTlCUVU4c1RVRkJUU3hEUVVGRE8wTkJRMlk3TzBGQlJVUXNaMEpCUVdNc1IwRkJSeXhYUVVGWExFTkJRVU03TzBGRGFFSTNRanM3T3pzN096czdRVUZSUVN4VFFVRlRMRmRCUVZjc1EwRkJReXhIUVVGSExFVkJRVVVzUzBGQlN5eEZRVUZGT3p0RlFVVXZRaXhIUVVGSExFTkJRVU1zUjBGQlJ5eERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRPMFZCUTJZc1QwRkJUeXhIUVVGSExFTkJRVU03UTBGRFdqczdRVUZGUkN4blFrRkJZeXhIUVVGSExGZEJRVmNzUTBGQlF6czdRVU5rTjBJN096czdPenM3UVVGUFFTeFRRVUZUTEZWQlFWVXNRMEZCUXl4SFFVRkhMRVZCUVVVN1JVRkRka0lzU1VGQlNTeExRVUZMTEVkQlFVY3NRMEZCUXl4RFFVRkRPMDFCUTFZc1RVRkJUU3hIUVVGSExFdEJRVXNzUTBGQlF5eEhRVUZITEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNN08wVkJSVGRDTEVkQlFVY3NRMEZCUXl4UFFVRlBMRU5CUVVNc1UwRkJVeXhMUVVGTExFVkJRVVU3U1VGRE1VSXNUVUZCVFN4RFFVRkRMRVZCUVVVc1MwRkJTeXhEUVVGRExFZEJRVWNzUzBGQlN5eERRVUZETzBkQlEzcENMRU5CUVVNc1EwRkJRenRGUVVOSUxFOUJRVThzVFVGQlRTeERRVUZETzBOQlEyWTdPMEZCUlVRc1pVRkJZeXhIUVVGSExGVkJRVlVzUTBGQlF6czdPMEZEV2pWQ0xFbEJRVWxETEdsQ1FVRmxMRWRCUVVjc1EwRkJReXhEUVVGRE96czdPenM3T3pzN096dEJRVmQ0UWl4VFFVRlRMRkZCUVZFc1EwRkJReXhIUVVGSExFVkJRVVVzVFVGQlRTeEZRVUZGTEZOQlFWTXNSVUZCUlR0RlFVTjRReXhKUVVGSkxFdEJRVXNzUjBGQlJ5eE5RVUZOTEVkQlFVY3NVMEZCVXl4RFFVRkRReXhYUVVGVkxFTkJRVU1zUjBGQlJ5eERRVUZETEVWQlFVVkVMR2xDUVVGbExFTkJRVU1zUjBGQlIwTXNWMEZCVlN4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRE8wVkJRMjVHTEU5QlFVOUlMRmxCUVZjc1EwRkJReXhMUVVGTExFVkJRVVZKTEZsQlFWY3NSVUZCUlN4SlFVRkpMRWRCUVVjc1EwRkJReXhYUVVGWExFTkJRVU1zUTBGQlF6dERRVU0zUkRzN1FVRkZSQ3hoUVVGakxFZEJRVWNzVVVGQlVTeERRVUZET3pzN1FVTnNRakZDTEVsQlFVa3NWMEZCVnl4SFFVRkhMMFlzVDBGQlRTeEhRVUZIUVN4UFFVRk5MRU5CUVVNc1UwRkJVeXhIUVVGSExGTkJRVk03U1VGRGJrUXNZVUZCWVN4SFFVRkhMRmRCUVZjc1IwRkJSeXhYUVVGWExFTkJRVU1zVDBGQlR5eEhRVUZITEZOQlFWTXNRMEZCUXpzN096czdPenM3TzBGQlUyeEZMRk5CUVZNc1YwRkJWeXhEUVVGRExFMUJRVTBzUlVGQlJUdEZRVU16UWl4UFFVRlBMR0ZCUVdFc1IwRkJSeXhOUVVGTkxFTkJRVU1zWVVGQllTeERRVUZETEVsQlFVa3NRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJReXhIUVVGSExFVkJRVVVzUTBGQlF6dERRVU5vUlRzN1FVRkZSQ3huUWtGQll5eEhRVUZITEZkQlFWY3NRMEZCUXpzN096czdPenM3T3p0QlExQTNRaXhUUVVGVExHVkJRV1VzUTBGQlF5eFZRVUZWTEVWQlFVVXNUVUZCVFN4RlFVRkZPMFZCUXpORExFbEJRVWtzVFVGQlRTeEhRVUZITEUxQlFVMHNSMEZCUjNsR0xHbENRVUZuUWl4RFFVRkRMRlZCUVZVc1EwRkJReXhOUVVGTkxFTkJRVU1zUjBGQlJ5eFZRVUZWTEVOQlFVTXNUVUZCVFN4RFFVRkRPMFZCUXpsRkxFOUJRVThzU1VGQlNTeFZRVUZWTEVOQlFVTXNWMEZCVnl4RFFVRkRMRTFCUVUwc1JVRkJSU3hWUVVGVkxFTkJRVU1zVlVGQlZTeEZRVUZGTEZWQlFWVXNRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJRenREUVVOeVJqczdRVUZGUkN4dlFrRkJZeXhIUVVGSExHVkJRV1VzUTBGQlF6czdPMEZEVG1wRExFbEJRVWxQTEZOQlFVOHNSMEZCUnl4clFrRkJhMEk3U1VGRE5VSkRMRk5CUVU4c1IwRkJSeXhsUVVGbE8wbEJRM3BDYkVJc1VVRkJUU3hIUVVGSExHTkJRV003U1VGRGRrSnRRaXhYUVVGVExFZEJRVWNzYVVKQlFXbENPMGxCUXpkQ1F5eFhRVUZUTEVkQlFVY3NhVUpCUVdsQ08wbEJRemRDYkVJc1VVRkJUU3hIUVVGSExHTkJRV003U1VGRGRrSnRRaXhYUVVGVExFZEJRVWNzYVVKQlFXbENPMGxCUXpkQ0xGTkJRVk1zUjBGQlJ5eHBRa0ZCYVVJc1EwRkJRenM3UVVGRmJFTXNTVUZCU1VNc1owSkJRV01zUjBGQlJ5eHpRa0ZCYzBJN1NVRkRka05zUWl4aFFVRlhMRWRCUVVjc2JVSkJRVzFDTzBsQlEycERiVUlzV1VGQlZTeEhRVUZITEhWQ1FVRjFRanRKUVVOd1EwTXNXVUZCVlN4SFFVRkhMSFZDUVVGMVFqdEpRVU53UTBNc1UwRkJUeXhIUVVGSExHOUNRVUZ2UWp0SlFVTTVRa01zVlVGQlVTeEhRVUZITEhGQ1FVRnhRanRKUVVOb1EwTXNWVUZCVVN4SFFVRkhMSEZDUVVGeFFqdEpRVU5vUTBNc1ZVRkJVU3hIUVVGSExIRkNRVUZ4UWp0SlFVTm9RME1zYVVKQlFXVXNSMEZCUnl3MFFrRkJORUk3U1VGRE9VTkRMRmRCUVZNc1IwRkJSeXh6UWtGQmMwSTdTVUZEYkVORExGZEJRVk1zUjBGQlJ5eHpRa0ZCYzBJc1EwRkJRenM3T3pzN096czdPenM3T3pzN08wRkJaWFpETEZOQlFWTXNZMEZCWXl4RFFVRkRMRTFCUVUwc1JVRkJSU3hIUVVGSExFVkJRVVVzVTBGQlV5eEZRVUZGTEUxQlFVMHNSVUZCUlR0RlFVTjBSQ3hKUVVGSkxFbEJRVWtzUjBGQlJ5eE5RVUZOTEVOQlFVTXNWMEZCVnl4RFFVRkRPMFZCUXpsQ0xGRkJRVkVzUjBGQlJ6dEpRVU5VTEV0QlFVdFVMR2RDUVVGak8wMUJRMnBDTEU5QlFVOWFMR2xDUVVGblFpeERRVUZETEUxQlFVMHNRMEZCUXl4RFFVRkRPenRKUVVWc1F5eExRVUZMVHl4VFFVRlBMRU5CUVVNN1NVRkRZaXhMUVVGTFF5eFRRVUZQTzAxQlExWXNUMEZCVHl4SlFVRkpMRWxCUVVrc1EwRkJReXhEUVVGRExFMUJRVTBzUTBGQlF5eERRVUZET3p0SlFVVXpRaXhMUVVGTFpDeGhRVUZYTzAxQlEyUXNUMEZCVHpSQ0xHTkJRV0VzUTBGQlF5eE5RVUZOTEVWQlFVVXNUVUZCVFN4RFFVRkRMRU5CUVVNN08wbEJSWFpETEV0QlFVdFVMRmxCUVZVc1EwRkJReXhEUVVGRExFdEJRVXRETEZsQlFWVXNRMEZCUXp0SlFVTnFReXhMUVVGTFF5eFRRVUZQTEVOQlFVTXNRMEZCUXl4TFFVRkxReXhWUVVGUkxFTkJRVU1zUTBGQlF5eExRVUZMUXl4VlFVRlJMRU5CUVVNN1NVRkRNME1zUzBGQlMwTXNWVUZCVVN4RFFVRkRMRU5CUVVNc1MwRkJTME1zYVVKQlFXVXNRMEZCUXl4RFFVRkRMRXRCUVV0RExGZEJRVk1zUTBGQlF5eERRVUZETEV0QlFVdERMRmRCUVZNN1RVRkRha1VzVDBGQlQwVXNaMEpCUVdVc1EwRkJReXhOUVVGTkxFVkJRVVVzVFVGQlRTeERRVUZETEVOQlFVTTdPMGxCUlhwRExFdEJRVXRxUXl4UlFVRk5PMDFCUTFRc1QwRkJUMnRETEZOQlFWRXNRMEZCUXl4TlFVRk5MRVZCUVVVc1RVRkJUU3hGUVVGRkxGTkJRVk1zUTBGQlF5eERRVUZET3p0SlFVVTNReXhMUVVGTFppeFhRVUZUTEVOQlFVTTdTVUZEWml4TFFVRkxSU3hYUVVGVE8wMUJRMW9zVDBGQlR5eEpRVUZKTEVsQlFVa3NRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJRenM3U1VGRk1VSXNTMEZCUzBRc1YwRkJVenROUVVOYUxFOUJRVTlsTEZsQlFWY3NRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJRenM3U1VGRk4wSXNTMEZCUzJwRExGRkJRVTA3VFVGRFZDeFBRVUZQYTBNc1UwRkJVU3hEUVVGRExFMUJRVTBzUlVGQlJTeE5RVUZOTEVWQlFVVXNVMEZCVXl4RFFVRkRMRU5CUVVNN08wbEJSVGRETEV0QlFVc3NVMEZCVXp0TlFVTmFMRTlCUVU5RExGbEJRVmNzUTBGQlF5eE5RVUZOTEVOQlFVTXNRMEZCUXp0SFFVTTVRanREUVVOR096dEJRVVZFTEcxQ1FVRmpMRWRCUVVjc1kwRkJZeXhEUVVGRE96czdRVU0xUldoRExFbEJRVWtzV1VGQldTeEhRVUZITEUxQlFVMHNRMEZCUXl4TlFVRk5MRU5CUVVNN096czdPenM3T3pzN1FVRlZha01zU1VGQlNTeFZRVUZWTEVsQlFVa3NWMEZCVnp0RlFVTXpRaXhUUVVGVExFMUJRVTBzUjBGQlJ5eEZRVUZGTzBWQlEzQkNMRTlCUVU4c1UwRkJVeXhMUVVGTExFVkJRVVU3U1VGRGNrSXNTVUZCU1N4RFFVRkRPVWNzVlVGQlVTeERRVUZETEV0QlFVc3NRMEZCUXl4RlFVRkZPMDFCUTNCQ0xFOUJRVThzUlVGQlJTeERRVUZETzB0QlExZzdTVUZEUkN4SlFVRkpMRmxCUVZrc1JVRkJSVHROUVVOb1FpeFBRVUZQTEZsQlFWa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJRenRMUVVNMVFqdEpRVU5FTEUxQlFVMHNRMEZCUXl4VFFVRlRMRWRCUVVjc1MwRkJTeXhEUVVGRE8wbEJRM3BDTEVsQlFVa3NUVUZCVFN4SFFVRkhMRWxCUVVrc1RVRkJUU3hEUVVGRE8wbEJRM2hDTEUxQlFVMHNRMEZCUXl4VFFVRlRMRWRCUVVjc1UwRkJVeXhEUVVGRE8wbEJRemRDTEU5QlFVOHNUVUZCVFN4RFFVRkRPMGRCUTJZc1EwRkJRenREUVVOSUxFVkJRVVVzUTBGQlF5eERRVUZET3p0QlFVVk1MR1ZCUVdNc1IwRkJSeXhWUVVGVkxFTkJRVU03T3pzN096czdPenRCUTJ4Q05VSXNVMEZCVXl4bFFVRmxMRU5CUVVNc1RVRkJUU3hGUVVGRk8wVkJReTlDTEU5QlFVOHNRMEZCUXl4UFFVRlBMRTFCUVUwc1EwRkJReXhYUVVGWExFbEJRVWtzVlVGQlZTeEpRVUZKTEVOQlFVTnpSQ3haUVVGWExFTkJRVU1zVFVGQlRTeERRVUZETzAxQlEyNUZlVVFzVjBGQlZTeERRVUZEZWtNc1lVRkJXU3hEUVVGRExFMUJRVTBzUTBGQlF5eERRVUZETzAxQlEyaERMRVZCUVVVc1EwRkJRenREUVVOU096dEJRVVZFTEc5Q1FVRmpMRWRCUVVjc1pVRkJaU3hEUVVGRE96czdRVU5KYWtNc1NVRkJTV2xDTEdsQ1FVRmxMRWRCUVVjc1EwRkJRenRKUVVOdVFpeGxRVUZsTEVkQlFVY3NRMEZCUXp0SlFVTnVRaXhyUWtGQmEwSXNSMEZCUnl4RFFVRkRMRU5CUVVNN096dEJRVWN6UWl4SlFVRkpPVU1zVTBGQlR5eEhRVUZITEc5Q1FVRnZRanRKUVVNNVFuVkZMRlZCUVZFc1IwRkJSeXhuUWtGQlowSTdTVUZETTBKMFFpeFRRVUZQTEVkQlFVY3NhMEpCUVd0Q08wbEJRelZDUXl4VFFVRlBMRWRCUVVjc1pVRkJaVHRKUVVONlFuTkNMRlZCUVZFc1IwRkJSeXhuUWtGQlowSTdTVUZETTBKMlJTeFRRVUZQTEVkQlFVY3NiVUpCUVcxQ08wbEJRemRDZDBVc1VVRkJUU3hIUVVGSExEUkNRVUUwUWp0SlFVTnlRM3BETEZGQlFVMHNSMEZCUnl4alFVRmpPMGxCUTNaQ2JVSXNWMEZCVXl4SFFVRkhMR2xDUVVGcFFqdEpRVU0zUW14Q0xGZEJRVk1zUjBGQlJ5eHBRa0ZCYVVJN1NVRkROMEp0UWl4WFFVRlRMRWRCUVVjc2FVSkJRV2xDTzBsQlF6ZENiRUlzVVVGQlRTeEhRVUZITEdOQlFXTTdTVUZEZGtKdFFpeFhRVUZUTEVkQlFVY3NhVUpCUVdsQ08wbEJRemRDY1VJc1YwRkJVeXhIUVVGSExHbENRVUZwUWp0SlFVTTNRblpETEZsQlFWVXNSMEZCUnl4clFrRkJhMElzUTBGQlF6czdRVUZGY0VNc1NVRkJTVzFDTEdkQ1FVRmpMRWRCUVVjc2MwSkJRWE5DTzBsQlEzWkRiRUlzWVVGQlZ5eEhRVUZITEcxQ1FVRnRRanRKUVVOcVEyMUNMRmxCUVZVc1IwRkJSeXgxUWtGQmRVSTdTVUZEY0VORExGbEJRVlVzUjBGQlJ5eDFRa0ZCZFVJN1NVRkRjRU5ETEZOQlFVOHNSMEZCUnl4dlFrRkJiMEk3U1VGRE9VSkRMRlZCUVZFc1IwRkJSeXh4UWtGQmNVSTdTVUZEYUVORExGVkJRVkVzUjBGQlJ5eHhRa0ZCY1VJN1NVRkRhRU5ETEZWQlFWRXNSMEZCUnl4eFFrRkJjVUk3U1VGRGFFTkRMR2xDUVVGbExFZEJRVWNzTkVKQlFUUkNPMGxCUXpsRFF5eFhRVUZUTEVkQlFVY3NjMEpCUVhOQ08wbEJRMnhEUXl4WFFVRlRMRWRCUVVjc2MwSkJRWE5DTEVOQlFVTTdPenRCUVVkMlF5eEpRVUZKTEdGQlFXRXNSMEZCUnl4RlFVRkZMRU5CUVVNN1FVRkRka0lzWVVGQllTeERRVUZETDBRc1UwRkJUeXhEUVVGRExFZEJRVWNzWVVGQllTeERRVUZEZFVVc1ZVRkJVU3hEUVVGRE8wRkJRMmhFTEdGQlFXRXNRMEZCUTJwQ0xHZENRVUZqTEVOQlFVTXNSMEZCUnl4aFFVRmhMRU5CUVVOc1FpeGhRVUZYTEVOQlFVTTdRVUZETVVRc1lVRkJZU3hEUVVGRFlTeFRRVUZQTEVOQlFVTXNSMEZCUnl4aFFVRmhMRU5CUVVORExGTkJRVThzUTBGQlF6dEJRVU12UXl4aFFVRmhMRU5CUVVOTExGbEJRVlVzUTBGQlF5eEhRVUZITEdGQlFXRXNRMEZCUTBNc1dVRkJWU3hEUVVGRE8wRkJRM0pFTEdGQlFXRXNRMEZCUTBNc1UwRkJUeXhEUVVGRExFZEJRVWNzWVVGQllTeERRVUZEUXl4VlFVRlJMRU5CUVVNN1FVRkRhRVFzWVVGQllTeERRVUZEUXl4VlFVRlJMRU5CUVVNc1IwRkJSeXhoUVVGaExFTkJRVU16UWl4UlFVRk5MRU5CUVVNN1FVRkRMME1zWVVGQllTeERRVUZEYlVJc1YwRkJVeXhEUVVGRExFZEJRVWNzWVVGQllTeERRVUZEYkVJc1YwRkJVeXhEUVVGRE8wRkJRMjVFTEdGQlFXRXNRMEZCUTIxQ0xGZEJRVk1zUTBGQlF5eEhRVUZITEdGQlFXRXNRMEZCUTJ4Q0xGRkJRVTBzUTBGQlF6dEJRVU5vUkN4aFFVRmhMRU5CUVVOdFFpeFhRVUZUTEVOQlFVTXNSMEZCUnl4aFFVRmhMRU5CUVVOeFFpeFhRVUZUTEVOQlFVTTdRVUZEYmtRc1lVRkJZU3hEUVVGRFpDeFZRVUZSTEVOQlFVTXNSMEZCUnl4aFFVRmhMRU5CUVVORExHbENRVUZsTEVOQlFVTTdRVUZEZUVRc1lVRkJZU3hEUVVGRFF5eFhRVUZUTEVOQlFVTXNSMEZCUnl4aFFVRmhMRU5CUVVORExGZEJRVk1zUTBGQlF5eEhRVUZITEVsQlFVa3NRMEZCUXp0QlFVTXpSQ3hoUVVGaExFTkJRVU5UTEZWQlFWRXNRMEZCUXl4SFFVRkhMR0ZCUVdFc1EwRkJRM1pGTEZOQlFVOHNRMEZCUXp0QlFVTm9SQ3hoUVVGaExFTkJRVU5yUXl4WlFVRlZMRU5CUVVNc1IwRkJSeXhMUVVGTExFTkJRVU03T3pzN096czdPenM3T3pzN096czdPenRCUVd0Q2JFTXNVMEZCVXl4VFFVRlRMRU5CUVVNc1MwRkJTeXhGUVVGRkxFOUJRVThzUlVGQlJTeFZRVUZWTEVWQlFVVXNSMEZCUnl4RlFVRkZMRTFCUVUwc1JVRkJSU3hMUVVGTExFVkJRVVU3UlVGRGFrVXNTVUZCU1N4TlFVRk5PMDFCUTA0c1RVRkJUU3hIUVVGSExFOUJRVThzUjBGQlIxY3NhVUpCUVdVN1RVRkRiRU1zVFVGQlRTeEhRVUZITEU5QlFVOHNSMEZCUnl4bFFVRmxPMDFCUTJ4RExFMUJRVTBzUjBGQlJ5eFBRVUZQTEVkQlFVY3NhMEpCUVd0Q0xFTkJRVU03TzBWQlJURkRMRWxCUVVrc1ZVRkJWU3hGUVVGRk8wbEJRMlFzVFVGQlRTeEhRVUZITEUxQlFVMHNSMEZCUnl4VlFVRlZMRU5CUVVNc1MwRkJTeXhGUVVGRkxFZEJRVWNzUlVGQlJTeE5RVUZOTEVWQlFVVXNTMEZCU3l4RFFVRkRMRWRCUVVjc1ZVRkJWU3hEUVVGRExFdEJRVXNzUTBGQlF5eERRVUZETzBkQlF6ZEZPMFZCUTBRc1NVRkJTU3hOUVVGTkxFdEJRVXNzVTBGQlV5eEZRVUZGTzBsQlEzaENMRTlCUVU4c1RVRkJUU3hEUVVGRE8wZEJRMlk3UlVGRFJDeEpRVUZKTEVOQlFVTjJSaXhWUVVGUkxFTkJRVU1zUzBGQlN5eERRVUZETEVWQlFVVTdTVUZEY0VJc1QwRkJUeXhMUVVGTExFTkJRVU03UjBGRFpEdEZRVU5FTEVsQlFVa3NTMEZCU3l4SFFVRkhLME1zVTBGQlR5eERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRPMFZCUXpOQ0xFbEJRVWtzUzBGQlN5eEZRVUZGTzBsQlExUXNUVUZCVFN4SFFVRkhjVVVzWlVGQll5eERRVUZETEV0QlFVc3NRMEZCUXl4RFFVRkRPMGxCUXk5Q0xFbEJRVWtzUTBGQlF5eE5RVUZOTEVWQlFVVTdUVUZEV0N4UFFVRlBReXhWUVVGVExFTkJRVU1zUzBGQlN5eEZRVUZGTEUxQlFVMHNRMEZCUXl4RFFVRkRPMHRCUTJwRE8wZEJRMFlzVFVGQlRUdEpRVU5NTEVsQlFVa3NSMEZCUnl4SFFVRkhReXhQUVVGTkxFTkJRVU1zUzBGQlN5eERRVUZETzFGQlEyNUNMRTFCUVUwc1IwRkJSeXhIUVVGSExFbEJRVWsxUlN4VFFVRlBMRWxCUVVrc1IwRkJSeXhKUVVGSmQwVXNVVUZCVFN4RFFVRkRPenRKUVVVM1F5eEpRVUZKYWtVc1ZVRkJVU3hEUVVGRExFdEJRVXNzUTBGQlF5eEZRVUZGTzAxQlEyNUNMRTlCUVU5elJTeFpRVUZYTEVOQlFVTXNTMEZCU3l4RlFVRkZMRTFCUVUwc1EwRkJReXhEUVVGRE8wdEJRMjVETzBsQlEwUXNTVUZCU1N4SFFVRkhMRWxCUVVrM1F5eFhRVUZUTEVsQlFVa3NSMEZCUnl4SlFVRkpha01zVTBGQlR5eExRVUZMTEUxQlFVMHNTVUZCU1N4RFFVRkRMRTFCUVUwc1EwRkJReXhGUVVGRk8wMUJRemRFTEUxQlFVMHNSMEZCUnl4RFFVRkRMRTFCUVUwc1NVRkJTU3hOUVVGTkxFbEJRVWtzUlVGQlJTeEhRVUZISzBVc1owSkJRV1VzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXp0TlFVTXhSQ3hKUVVGSkxFTkJRVU1zVFVGQlRTeEZRVUZGTzFGQlExZ3NUMEZCVHl4TlFVRk5PMWxCUTFSRExHTkJRV0VzUTBGQlF5eExRVUZMTEVWQlFVVkRMR0ZCUVZrc1EwRkJReXhOUVVGTkxFVkJRVVVzUzBGQlN5eERRVUZETEVOQlFVTTdXVUZEYWtSRExGbEJRVmNzUTBGQlF5eExRVUZMTEVWQlFVVkRMRmRCUVZVc1EwRkJReXhOUVVGTkxFVkJRVVVzUzBGQlN5eERRVUZETEVOQlFVTXNRMEZCUXp0UFFVTnVSRHRMUVVOR0xFMUJRVTA3VFVGRFRDeEpRVUZKTEVOQlFVTXNZVUZCWVN4RFFVRkRMRWRCUVVjc1EwRkJReXhGUVVGRk8xRkJRM1pDTEU5QlFVOHNUVUZCVFN4SFFVRkhMRXRCUVVzc1IwRkJSeXhGUVVGRkxFTkJRVU03VDBGRE5VSTdUVUZEUkN4TlFVRk5MRWRCUVVkRExHVkJRV01zUTBGQlF5eExRVUZMTEVWQlFVVXNSMEZCUnl4RlFVRkZMRk5CUVZNc1JVRkJSU3hOUVVGTkxFTkJRVU1zUTBGQlF6dExRVU40UkR0SFFVTkdPenRGUVVWRUxFdEJRVXNzUzBGQlN5eExRVUZMTEVkQlFVY3NTVUZCU1VNc1RVRkJTeXhEUVVGRExFTkJRVU03UlVGRE4wSXNTVUZCU1N4UFFVRlBMRWRCUVVjc1MwRkJTeXhEUVVGRExFZEJRVWNzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXp0RlFVTXZRaXhKUVVGSkxFOUJRVThzUlVGQlJUdEpRVU5ZTEU5QlFVOHNUMEZCVHl4RFFVRkRPMGRCUTJoQ08wVkJRMFFzUzBGQlN5eERRVUZETEVkQlFVY3NRMEZCUXl4TFFVRkxMRVZCUVVVc1RVRkJUU3hEUVVGRExFTkJRVU03TzBWQlJYcENMRWxCUVVrc1VVRkJVU3hIUVVGSExFMUJRVTA3VDBGRGFFSXNUVUZCVFN4SFFVRkhReXhoUVVGWkxFZEJRVWRETEZkQlFWVTdUMEZEYkVNc1RVRkJUU3hIUVVGSExFMUJRVTBzUjBGQlIzQkZMRTFCUVVrc1EwRkJReXhEUVVGRE96dEZRVVUzUWl4SlFVRkpMRXRCUVVzc1IwRkJSeXhMUVVGTExFZEJRVWNzVTBGQlV5eEhRVUZITEZGQlFWRXNRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJRenRGUVVOb1JIRkZMRlZCUVZNc1EwRkJReXhMUVVGTExFbEJRVWtzUzBGQlN5eEZRVUZGTEZOQlFWTXNVVUZCVVN4RlFVRkZMRWRCUVVjc1JVRkJSVHRKUVVOb1JDeEpRVUZKTEV0QlFVc3NSVUZCUlR0TlFVTlVMRWRCUVVjc1IwRkJSeXhSUVVGUkxFTkJRVU03VFVGRFppeFJRVUZSTEVkQlFVY3NTMEZCU3l4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRE8wdEJRM1pDT3p0SlFVVkVOMFlzV1VGQlZ5eERRVUZETEUxQlFVMHNSVUZCUlN4SFFVRkhMRVZCUVVVc1UwRkJVeXhEUVVGRExGRkJRVkVzUlVGQlJTeFBRVUZQTEVWQlFVVXNWVUZCVlN4RlFVRkZMRWRCUVVjc1JVRkJSU3hMUVVGTExFVkJRVVVzUzBGQlN5eERRVUZETEVOQlFVTXNRMEZCUXp0SFFVTjJSaXhEUVVGRExFTkJRVU03UlVGRFNDeFBRVUZQTEUxQlFVMHNRMEZCUXp0RFFVTm1PenRCUVVWRUxHTkJRV01zUjBGQlJ5eFRRVUZUTEVOQlFVTTdPenRCUTNKS00wSXNTVUZCU1cxRUxHbENRVUZsTEVkQlFVY3NRMEZCUXp0SlFVTnVRakpETEc5Q1FVRnJRaXhIUVVGSExFTkJRVU1zUTBGQlF6czdPenM3T3pzN096czdPenM3T3pzN096czdRVUZ2UWpOQ0xGTkJRVk1zVTBGQlV5eERRVUZETEV0QlFVc3NSVUZCUlR0RlFVTjRRaXhQUVVGUFF5eFZRVUZUTEVOQlFVTXNTMEZCU3l4RlFVRkZOVU1zYVVKQlFXVXNSMEZCUnpKRExHOUNRVUZyUWl4RFFVRkRMRU5CUVVNN1EwRkRMMFE3TzBGQlJVUXNaVUZCWXl4SFFVRkhMRk5CUVZNc1EwRkJRenM3UVVNMVFsb3NVMEZCVXl4WlFVRlpMRVZCUVVVc1lVRkJZU3hGUVVGRkxFVkJRVVVzUlVGQlJUdEZRVU4yUkM5S0xFbEJRVTBzUzBGQlN5eEhRVUZITEVOQlFVTXNUMEZCVHl4aFFVRmhMRXRCUVVzc1VVRkJVVHROUVVNMVF5eGhRVUZoTzAxQlEySXNTVUZCU1N4TFFVRkxMRU5CUVVNc1lVRkJZU3hGUVVGRE96dEZRVVUxUWl4RlFVRkZMRU5CUVVNc1RVRkJUU3hIUVVGSExFMUJRVXM3TzBWQlJXcENMRTFCUVUwc1MwRkJTenREUVVOYU96dEJRMUpFT3p0QlFVMUJMRk5CUVZNc1kwRkJZeXhKUVVGbE8wVkJRM0JEUVN4SlFVRk5MRkZCUVZFc1IwRkJSeXhIUVVGSExFTkJRVU1zVFVGQlRTeEhRVUZGT3pzN1JVRkhOMElzVFVGQlRTeERRVUZETEVsQlFVa3NRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJReXhQUVVGUExGZEJRVU1zUzBGQlNUdEpRVU16UWl4SlFVRkpMRU5CUVVNc1VVRkJVU3hEUVVGRExHTkJRV01zUTBGQlF5eEhRVUZITEVOQlFVTXNSVUZCUlR0TlFVTnFRMEVzU1VGQlRTeFJRVUZSTEVkQlFVY3NSMEZCUnl4RFFVRkRMRWRCUVVjc1JVRkJRenROUVVONlFpeFJRVUZSTEVOQlFVTXNSMEZCUnl4RFFVRkRMRWRCUVVjc1QwRkJUeXhSUVVGUkxFdEJRVXNzVVVGQlVUdFZRVU40UTJsTExGZEJRVk1zUTBGQlF5eFJRVUZSTEVOQlFVTTdWVUZEYmtJc1UwRkJVVHRMUVVOaU8wZEJRMFlzUlVGQlF6czdPMFZCUjBZc1VVRkJVU3hEUVVGRExFMUJRVTBzUjBGQlIwRXNWMEZCVXl4RFFVRkRMRWRCUVVjc1EwRkJReXhOUVVGTkxFVkJRVU03TzBWQlJYWkRMRkZCUVZFc1EwRkJReXhOUVVGTkxFTkJRVU1zV1VGQldTeEhRVUZITEdGQlFWazdPenM3UlVGSk0wTXNVVUZCVVN4RFFVRkRMRTFCUVUwc1EwRkJReXh4UWtGQmNVSXNSMEZCUnl4SFFVRkhMRU5CUVVNc1RVRkJUU3hEUVVGRExITkNRVUZ4UWpzN096czdSVUZMZUVVc1VVRkJVU3hEUVVGRExFOUJRVThzUTBGQlF5eExRVUZMTEVkQlFVY3NVMEZCVVRzN08wVkJSMnBETEVsQlFVa3NVVUZCVVN4RFFVRkRMR2xDUVVGcFFpeEpRVUZKTEZGQlFWRXNRMEZCUXl4cFFrRkJhVUlzUTBGQlF5eE5RVUZOTEVWQlFVVTdTVUZEYmtVc1VVRkJVU3hEUVVGRExHbENRVUZwUWl4RFFVRkRMRTFCUVUwc1IwRkJSeXhGUVVGRE8wZEJRM1JETzBWQlEwUnFTeXhKUVVGTkxFZEJRVWNzUjBGQlJ5eFJRVUZSTEVOQlFVTXNTVUZCUnp0RlFVTjRRaXhSUVVGUkxFTkJRVU1zUjBGQlJ5eGhRVUZKTEUxQlFVMHNSVUZCVnpzN096dEpRVU12UWl4SlFVRkpMRTFCUVUwc1EwRkJReXhUUVVGVExFdEJRVXNzU1VGQlNTeEZRVUZGTzAxQlF6ZENMRTFCUVUwc1EwRkJReXhUUVVGVExFZEJRVWNzVFVGQlN6dExRVU42UWp0SlFVTkVMRWxCUVVrc1RVRkJUU3hEUVVGRExFOUJRVThzU1VGQlNTeE5RVUZOTEVOQlFVTXNUMEZCVHl4RFFVRkRMRk5CUVZNc1MwRkJTeXhKUVVGSkxFVkJRVVU3VFVGRGRrUXNUVUZCVFN4RFFVRkRMRTlCUVU4c1EwRkJReXhUUVVGVExFZEJRVWNzVFVGQlN6dExRVU5xUXp0SlFVTkVMRWRCUVVjc1EwRkJReXhWUVVGSkxGRkJRVU1zVVVGQlVTeEZRVUZGTEUxQlFVMHNWMEZCU3l4TlFVRkpMRVZCUVVNN1NVRkRjRU03UlVGRFJDeFBRVUZQTEZGQlFWRTdRMEZEYUVJN08wRkRhRVJFT3p0QlFVVkJMRk5CUVZNc1ZVRkJWU3hGUVVGRkxFZEJRVWNzUlVGQlJTeFBRVUZQTEVWQlFVVXNUVUZCVFN4RlFVRkZPMFZCUTNwRExFbEJRVWtzVDBGQlR6dExRVU5TTEUxQlFVMHNRMEZCUXl4SFFVRkhMRU5CUVVNc1NVRkJTU3hOUVVGTkxFTkJRVU1zU1VGQlNTeERRVUZETEUxQlFVMHNRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJReXhEUVVGRExFMUJRVTBzUjBGQlJ5eERRVUZETEVOQlFVTXNSVUZCUlR0SlFVTjBSQ3hKUVVGSkxFdEJRVXNzUTBGQlF5eFBRVUZQTEVOQlFVTXNUMEZCVHl4RFFVRkRMRVZCUVVVN1RVRkRNVUlzVDBGQlR5eFBRVU5MTEZOQlExQXNUVUZCVFN4RFFVRkRMRWxCUVVrc1EwRkJReXhOUVVGTkxFTkJRVU1zUjBGQlJ5eERRVUZETEVsQlFVa3NSVUZCUlN4RFFVRkRMRU5CUVVNN1MwRkRja01zVFVGQlRUdE5RVU5NTEU5QlFVOHNhMEpCUTBZc1RVRkJUU3hEUVVGRExFZEJRVWNzUTBGQlF6dFJRVU5rTEU5QlFWVXNRMEZEV0R0TFFVTkdPMGRCUTBZN1EwRkRSanM3UVVGRlJDeEJRVUZQTEZOQlFWTXNXVUZCV1R0RlFVTXhRaXhQUVVGUE8wVkJRMUFzVFVGQlRUdEZRVU5ITzBWQlExUXNUMEZCVHl4clFrRkRSaXhQUVVGUE8wdEJRMVlzUzBGQlN5eEZRVUZGTEZWQlFWVXNRMEZCUXl4UFFVRlBMRVZCUVVVc1QwRkJUeXhEUVVGRExFdEJRVXNzUlVGQlJTeE5RVUZOTEVOQlFVTTdTVUZEYWtRc1MwRkJTeXhGUVVGRkxGVkJRVlVzUTBGQlF5eFBRVUZQTEVWQlFVVXNUMEZCVHl4RFFVRkRMRXRCUVVzc1JVRkJSU3hOUVVGTkxFTkJRVU03U1VGRGFrUXNUMEZCVHl4RlFVRkZMRlZCUVZVc1EwRkJReXhUUVVGVExFVkJRVVVzVDBGQlR5eERRVUZETEU5QlFVOHNSVUZCUlN4TlFVRk5MRVZCUVVNc1EwRkRlRVE3UTBGRFJqczdRVU0xUWtRN08wRkJTVUVzVTBGQlV5eFpRVUZaTEVWQlFVVXNTMEZCU3l4RlFVRnJRanRGUVVNMVEwRXNTVUZCVFN4WFFVRlhMRWRCUVVjc1MwRkJTeXhKUVVGSkxFdEJRVXNzUTBGQlF5eHBRa0ZCWjBJN1JVRkRia1FzU1VGQlNTeFhRVUZYTEVsQlFVa3NWMEZCVnl4RFFVRkRMRWxCUVVrc1EwRkJReXhQUVVGUExFTkJRVU1zVVVGQlVTeEZRVUZGTzBsQlEzQkVMRTlCUVU4c1dVRkJXU3hEUVVGRExITkNRVUZ6UWl4RFFVRkRMRmRCUVZjc1EwRkJReXhSUVVGUkxFTkJRVU1zUTBGQlF6dEhRVU5zUlN4TlFVRk5PMGxCUTB3c1QwRkJUeXhMUVVGTE8wZEJRMkk3UTBGRFJqczdRVUZGUkN4VFFVRlRMRmRCUVZjc1JVRkJSU3hMUVVGTExFVkJRVk1zVVVGQlVTeEZRVUZyUWp0RlFVTTFSQ3hQUVVGUExGRkJRVkVzUTBGQlF5eEhRVUZITEV0QlFVc3NTMEZCU3l4RFFVRkRMRWRCUVVjc1NVRkJTU3hSUVVGUkxFTkJRVU1zUjBGQlJ5eExRVUZMTEV0QlFVc3NRMEZCUXl4SFFVRkhPME5CUTJoRk96dEJRVVZFTEZOQlFWTXNjMEpCUVhOQ0xFVkJRVVVzVVVGQlVTeEZRVUY1UWp0RlFVTm9SU3hKUVVGSkxFdEJRVXNzUTBGQlF5eFBRVUZQTEVOQlFVTXNVVUZCVVN4RFFVRkRMRVZCUVVVN1NVRkRNMElzUzBGQlMwTXNTVUZCU1N4RFFVRkRMRWRCUVVjc1EwRkJReXhGUVVGRkxFTkJRVU1zUjBGQlJ5eFJRVUZSTEVOQlFVTXNUVUZCVFN4RlFVRkZMRU5CUVVNc1JVRkJSU3hGUVVGRk8wMUJRM2hEUkN4SlFVRk5MRU5CUVVNc1IwRkJSeXhSUVVGUkxFTkJRVU1zUTBGQlF5eEZRVUZETzAxQlEzSkNMRWxCUVVrc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF5eG5Ra0ZCWjBJc1NVRkJTU3hyUWtGQmEwSXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRk8xRkJRM1JFTEU5QlFVOHNRMEZCUXp0UFFVTlVPMHRCUTBZN1IwRkRSanREUVVOR096dEJRVVZFTEZOQlFWTXNWMEZCVnl4RlFVRkZMRXRCUVVzc1JVRkJaMEk3UlVGRGVrTTdTVUZEUlN4UFFVRlBMRXRCUVVzc1MwRkJTeXhSUVVGUk8wbEJRM3BDTEU5QlFVOHNTMEZCU3l4TFFVRkxMRkZCUVZFN08wbEJSWHBDTEU5QlFVOHNTMEZCU3l4TFFVRkxMRkZCUVZFN1NVRkRla0lzVDBGQlR5eExRVUZMTEV0QlFVc3NVMEZCVXp0SFFVTXpRanREUVVOR096dEJRVVZFTEZOQlFWTXNhMEpCUVd0Q0xFVkJRVVVzU1VGQlNTeEZRVUZyUWp0RlFVTnFSQ3hQUVVGUExFbEJRVWtzUTBGQlF5eFRRVUZUTEVsQlFVa3NTVUZCU1N4RFFVRkRMRmxCUVZrN1EwRkRNME03UVVGRFJFRTdRVUZMUVN4VFFVRlRMRzFDUVVGdFFpeEZRVUZGTEV0QlFVc3NSVUZCYlVJN1JVRkRjRVFzVVVGQlVTeExRVUZMTEVkQlFVY3NTMEZCU3l4RFFVRkRMRTFCUVUwc1IwRkJSenRKUVVNM1FpeEpRVUZKTEV0QlFVc3NRMEZCUXl4SlFVRkpMRU5CUVVNc1ZVRkJWU3hGUVVGRk8wMUJRM3BDTEU5QlFVOHNTVUZCU1R0TFFVTmFPMGRCUTBZN1EwRkRSanM3UVVGRlJDeHhRa0ZCWlR0RlFVTmlMSFZDUVVGTkxFVkJRVVVzUTBGQlF5eEZRVUZaTzBsQlEyNUNReXhKUVVGSkxGRkJRVkVzUjBGQmEwSXNTVUZCU1N4RFFVRkRMRkZCUVZFc1EwRkJReXhuUWtGQlpUdEpRVU16UkN4SlFVRkpMRU5CUVVNc1VVRkJVU3hGUVVGRk8wMUJRMklzVFVGQlRUdExRVU5RT3pzN1NVRkhSQ3hSUVVGUkxFZEJRVWNzVVVGQlVTeERRVUZETEUxQlFVMHNWMEZCUlN4RFFVRkRMRVZCUVZNc1UwRkJSeXhEUVVGRExFTkJRVU1zUjBGQlJ5eEpRVUZKTEd0Q1FVRnJRaXhEUVVGRExFTkJRVU1zU1VGQlF5eEZRVUZET3p0SlFVVjRSU3hKUVVGSkxFTkJRVU1zVVVGQlVTeERRVUZETEUxQlFVMHNSVUZCUlR0TlFVTndRaXhOUVVGTk8wdEJRMUE3T3p0SlFVZEVMRWxCUVVrc1VVRkJVU3hEUVVGRExFMUJRVTBzUjBGQlJ5eERRVUZETEVWQlFVVTdUVUZEZGtJc1NVRkJTVHRSUVVOR0xIbEVRVUY1UkR0VFFVTjRSQ3dyUWtGQkswSTdVVUZEYWtNN1MwRkRSanM3U1VGRlJFUXNTVUZCVFN4SlFVRkpMRWRCUVZjc1NVRkJTU3hEUVVGRExFdEJRVWs3T3p0SlFVYzVRaXhKUVVGSkxFbEJRVWtzU1VGQlNTeEpRVUZKTEV0QlFVc3NVVUZCVVN4SlFVRkpMRWxCUVVrc1MwRkJTeXhSUVVGUk8wMUJRMmhFTzAxQlEwRXNTVUZCU1R0UlFVTkdMRFpDUVVFMlFpeEhRVUZITEVsQlFVazdVVUZEY2tNN1MwRkRSanM3U1VGRlJFRXNTVUZCVFN4UlFVRlJMRWRCUVZVc1VVRkJVU3hEUVVGRExFTkJRVU1zUlVGQlF6czdPenRKUVVsdVF5eEpRVUZKTEcxQ1FVRnRRaXhEUVVGRExFbEJRVWtzUTBGQlF5eE5RVUZOTEVOQlFVTXNSVUZCUlR0TlFVTndReXhQUVVGUExGRkJRVkU3UzBGRGFFSTdPenM3U1VGSlJFRXNTVUZCVFN4TFFVRkxMRWRCUVZjc1dVRkJXU3hEUVVGRExGRkJRVkVzUlVGQlF6czdTVUZGTlVNc1NVRkJTU3hEUVVGRExFdEJRVXNzUlVGQlJUdE5RVU5XTEU5QlFVOHNVVUZCVVR0TFFVTm9RanM3U1VGRlJFRXNTVUZCVFN4RlFVRkZMRWRCUVZjc2JVSkJRV2RDTEVsQlFVa3NRMEZCUXl4TFFVRkpMRTlCUVVjN1NVRkRMME1zUzBGQlN5eERRVUZETEVkQlFVY3NSMEZCUnl4TFFVRkxMRU5CUVVNc1IwRkJSeXhKUVVGSkxFbEJRVWs3VVVGRGVrSXNTMEZCU3l4RFFVRkRMRk5CUVZNN1ZVRkRZaXhGUVVGRkxFZEJRVWNzVTBGQlV6dFZRVU5rTEVWQlFVVXNSMEZCUnl4TFFVRkxMRU5CUVVNc1IwRkJSenRSUVVOb1FpeFhRVUZYTEVOQlFVTXNTMEZCU3l4RFFVRkRMRWRCUVVjc1EwRkJRenRYUVVOdVFpeE5RVUZOTEVOQlFVTXNTMEZCU3l4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRExFOUJRVThzUTBGQlF5eEZRVUZGTEVOQlFVTXNTMEZCU3l4RFFVRkRMRWRCUVVjc1MwRkJTeXhEUVVGRExFZEJRVWNzUjBGQlJ5eEZRVUZGTEVkQlFVY3NTMEZCU3l4RFFVRkRMRWRCUVVjN1ZVRkRha1VzUzBGQlN5eERRVUZETEVsQlFVYzdPMGxCUldaQkxFbEJRVTBzU1VGQlNTeEpRVUZaTEV0QlFVc3NRMEZCUXl4SlFVRkpMRXRCUVVzc1MwRkJTeXhEUVVGRExFbEJRVWtzUjBGQlJ5eEZRVUZGTEVOQlFVTXNSVUZCUXp0SlFVTjBSRUVzU1VGQlRTeFhRVUZYTEVkQlFWY3NTVUZCU1N4RFFVRkRMRTlCUVUwN1NVRkRka05CTEVsQlFVMHNVVUZCVVN4SFFVRlhMRmxCUVZrc1EwRkJReXhYUVVGWExFVkJRVU03U1VGRGJFUXNTVUZCU1N4TFFVRkxMRU5CUVVNc1NVRkJTU3hEUVVGRExGVkJRVlVzU1VGQlNTeExRVUZMTEVOQlFVTXNTVUZCU1N4RFFVRkRMRlZCUVZVc1EwRkJReXhKUVVGSkxGZEJRVU1zUjBGQlJTeFRRVUZITEVOQlFVTXNRMEZCUXl4SlFVRkpMRXRCUVVzc1UwRkJUU3hEUVVGRExFVkJRVVU3VFVGREwwVXNTMEZCU3l4RFFVRkRMRWxCUVVrc1EwRkJReXhKUVVGSkxFZEJRVWNzUzBGQlNUdExRVU4yUWpzN096dEpRVWxFTEVsQlFVa3NTMEZCU3l4RFFVRkRMRWxCUVVrc1EwRkJReXhWUVVGVkxFbEJRVWtzUzBGQlN5eERRVUZETEVsQlFVa3NRMEZCUXl4VlFVRlZMRU5CUVVNc1NVRkJTU3hYUVVGRExFZEJRVVVzVTBGQlJ5eERRVUZETEVOQlFVTXNTVUZCU1N4TFFVRkxMRk5CUVUwc1EwRkJReXhGUVVGRk8wMUJReTlGTEV0QlFVc3NRMEZCUXl4SlFVRkpMRU5CUVVNc1NVRkJTU3hIUVVGSExFdEJRVWs3UzBGRGRrSTdTVUZEUkR0TlFVTkZMRkZCUVZFN1UwRkRUQ3hSUVVGUkxFTkJRVU1zU1VGQlNUdFRRVU5pTEVOQlFVTXNWMEZCVnl4RFFVRkRMRXRCUVVzc1JVRkJSU3hSUVVGUkxFTkJRVU03VTBGRE4wSXNRMEZCUXl4clFrRkJhMElzUTBGQlF5eFJRVUZSTEVOQlFVTTdPMU5CUlRkQ0xFVkJRVVVzVVVGQlVTeERRVUZETEdsQ1FVRnBRaXhKUVVGSkxGRkJRVkVzUTBGQlF5eHBRa0ZCYVVJc1EwRkJReXhOUVVGTkxFTkJRVU1zVTBGQlV5eERRVUZETzAxQlF5OUZPMDFCUTBFc1VVRkJVU3hEUVVGRExFbEJRVWtzUjBGQlJ5eHJRa0ZCU3l4SlFVRkpMRVZCUVVVN1MwRkROVUk3U1VGRFJDeFBRVUZQTEZGQlFWRTdSMEZEYUVJN1EwRkRSanM3UVVOMlNVUTdPMEZCUlVFc01FSkJRV1U3UlVGRFlpeDFRa0ZCVFN4RlFVRkZMRU5CUVVNc1JVRkJXVHRKUVVOdVFrRXNTVUZCVFN4SFFVRkhMRWRCUVZjc1NVRkJTU3hEUVVGRExFZEJRVWNzU1VGQlNTeEpRVUZKTEVOQlFVTXNUVUZCVFN4RFFVRkRMRWxCUVVrc1EwRkJReXhIUVVGSExFbEJRVWtzVDBGQlRUdEpRVU01UkVFc1NVRkJUU3hSUVVGUkxFZEJRV2xDTEVsQlFVa3NRMEZCUXl4TlFVRk5MRU5CUVVNc1QwRkJUeXhKUVVGSkxFZEJRVVU3TzBsQlJYaEVMRTlCUVU4c1EwRkJReXhEUVVGRExFZEJRVWNzUlVGQlJTeEpRVUZKTEVWQlFVVXNVVUZCVVN4RFFVRkRPMGRCUXpsQ08wTkJRMFk3TzBGRFRrUXNZVUZCWlR0RlFVTmlMRXRCUVVzc1JVRkJSVHRKUVVOTUxGVkJRVlVzUlVGQlJTeGpRVUZqTzBsQlF6RkNMR3RDUVVGclFpeEZRVUZGTEcxQ1FVRnRRanRIUVVONFF6dEZRVU5FTEV0QlFVc3NSVUZCUlN4RlFVRkZPMFZCUTFRc1QwRkJUeXhGUVVGRkxFVkJRVVU3UTBGRFdqczdRVU5XUkRzN1FVRmxRU3hIUVVGSExFTkJRVU1zVFVGQlRTeERRVUZETEdGQlFXRXNSMEZCUnl4TlFVRkxPMEZCUTJoRExFZEJRVWNzUTBGQlF5eE5RVUZOTEVOQlFVTXNVVUZCVVN4SFFVRkhMRTFCUVVzN1FVRkRNMElzUjBGQlJ5eERRVUZETEUxQlFVMHNRMEZCUXl4WlFVRlpMRWRCUVVjc1lVRkJXVHM3UVVGRmRFTXNRVUZCWlN4VFFVRlRMRXRCUVVzc1JVRkJSU3hUUVVGVExFVkJRV0VzVDBGQmNVSXNSVUZCWXp0dFEwRkJOVUlzUjBGQldUczdPMFZCUlhSRkxFOUJRVThzVTBGQlV5eERRVUZETEUxQlFVczdSVUZEZEVKQkxFbEJRVTBzVVVGQlVTeEhRVUZITEU5QlFVOHNRMEZCUXl4UlFVRlJMRWxCUVVrc1kwRkJZeXhIUVVGRk8wVkJRM0pFUVN4SlFVRk5MRVZCUVVVc1IwRkJSeXhqUVVGakxFTkJRVU1zVTBGQlV5eEZRVUZGTEZsQlFWa3NRMEZCUXl4UFFVRlBMRVZCUVVVc1RVRkJUU3hEUVVGRExFVkJRVVVzVVVGQlVTeEZRVUZET3p0RlFVVTNSU3hKUVVGSkxFOUJRVThzUTBGQlF5eG5Ra0ZCWjBJc1JVRkJSVHRKUVVNMVFpeEZRVUZGTEVOQlFVTXNUVUZCVFN4RFFVRkRMR0ZCUVdFc1JVRkJSU3hGUVVGRE8wZEJRek5DTEUxQlFVMDdTVUZEVEN4RlFVRkZMRU5CUVVNc1RVRkJUU3hIUVVGRk8wZEJRMW83TzBWQlJVUkJMRWxCUVUwc2EwSkJRV3RDTEVkQlFVY3NNRUpCUVRCQ0xFTkJRVU1zUlVGQlJTeERRVUZETEVOQlFVTXNTVUZCU1N4WFFVRkRMRWRCUVVVc1UwRkJSeXhEUVVGRExFTkJRVU1zVTBGQlRTeEZRVUZET3p0RlFVVTNSU3hKUVVGSkxHdENRVUZyUWl4RlFVRkZPMGxCUTNSQ0xFOUJRVThzYTBKQlFXdENMRU5CUVVNc1RVRkJUU3hEUVVGRE8wZEJRMnhET3p0RlFVVkVRU3hKUVVGTkxHVkJRV1VzUjBGQlJ6dEpRVU4wUWl4clFrRkJhMElzUlVGQlJTeERRVUZETEVOQlFVTXNUMEZCVHl4RFFVRkRMR2RDUVVGblFqdEpRVU01UXl4SlFVRkpMRVZCUVVVc1EwRkJReXhIUVVGSExFOUJRVThzUTBGQlF5eEpRVUZKTEVsQlFVa3NUMEZCVHl4RFFVRkRMRWxCUVVrc1MwRkJTeXhUUVVGVExFVkJRVVU3U1VGRGRrUTdPMFZCUlVRc1QwRkJUeXhKUVVGSkxGVkJRVlVzUTBGQlF5eEZRVUZGTEVWQlFVVXNaVUZCWlN4RFFVRkRPME5CUXpORE96dEJRek5EUkRzN1FVRmxRU3hCUVVGbExGTkJRVk1zVDBGQlR6dEZRVU0zUWl4VFFVRlRPMFZCUTFRc1QwRkJjVUk3UlVGRFZEdHRRMEZFVEN4SFFVRlpPenRGUVVWdVFrRXNTVUZCVFN4SFFVRkhMRWRCUVVjc1QwRkJUeXhEUVVGRExGRkJRVkVzU1VGQlNTeEpRVUZIT3pzN08wVkJTVzVETEVsQlFVa3NVMEZCVXl4RFFVRkRMRWxCUVVrc1NVRkJTU3hUUVVGVExFTkJRVU1zVlVGQlZTeEZRVUZGTzBsQlF6RkRMRTlCUVU4c1UwRkJVeXhEUVVGRExGVkJRVlVzUTBGQlF5eFZRVUZWTEVOQlFVTXNVVUZCVVN4RFFVRkRMRk5CUVZNc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eEZRVUZETzBsQlEycEZMRTlCUVU4c1UwRkJVeXhEUVVGRExGVkJRVlVzUTBGQlF5eFRRVUZUTEVOQlFVTXNVMEZCVXl4RFFVRkRMRWxCUVVrc1EwRkJReXhGUVVGRE8wZEJRM1pFT3p0RlFVVkVRU3hKUVVGTkxHbENRVUZwUWl4SFFVRkhMREJDUVVFd1FpeERRVUZETEZOQlFWTXNSVUZCUXp0RlFVTXZSRUVzU1VGQlRTeDFRa0ZCZFVJc1IwRkJSeXc0UWtGQk9FSXNRMEZCUXl4SFFVRkhMRVZCUVVNN08wVkJSVzVGTEU5QlFVOHNTMEZCU3l4RFFVRkRMRk5CUVZNc1JVRkJSU3hyUWtGRGJrSXNUMEZCVHp0TFFVTldMRlZCUVZVc1JVRkJSU3hyUWtGRlVDeDFRa0ZCZFVJN1RVRkRNVUlzYVVKQlFXOUNMRVZCUTNKQ0xFTkJRMFlzUTBGQlF6dERRVU5JT3p0QlEzWkRSRHRCUVVOQlFTeEpRVUZOTEU5QlFVOHNSMEZCYjBJc1EwRkJReXhOUVVGTkxFVkJRVVVzVFVGQlRTeEZRVUZETzBGQlEycEVRU3hKUVVGTkxGVkJRVlVzUjBGQmIwSXNRMEZCUXl4TlFVRk5MRVZCUVVVc1MwRkJTeXhGUVVGRE96dEJRVVZ1UkN4eFFrRkJaVHRGUVVOaUxFbEJRVWtzUlVGQlJTeG5Ra0ZCWjBJN1JVRkRkRUlzUzBGQlN5eEZRVUZGTzBsQlEwd3NSVUZCUlN4RlFVRkZPMDFCUTBZc1NVRkJTU3hGUVVGRkxFOUJRVTg3VFVGRFlpeFJRVUZSTEVWQlFVVXNTVUZCU1R0TFFVTm1PMGxCUTBRc1IwRkJSeXhGUVVGRk8wMUJRMGdzU1VGQlNTeEZRVUZGTEUxQlFVMDdUVUZEV2l4UFFVRlBMRVZCUVVVc1IwRkJSenRMUVVOaU8wbEJRMFFzUzBGQlN5eEZRVUZGTEU5QlFVODdTVUZEWkN4TlFVRk5MRVZCUVVVc1QwRkJUenRKUVVObUxFOUJRVThzUlVGQlJTeFBRVUZQTzBsQlEyaENMRmRCUVZjc1JVRkJSU3hOUVVGTk8wbEJRMjVDTEdkQ1FVRm5RaXhGUVVGRkxFMUJRVTA3U1VGRGVFSXNTMEZCU3l4RlFVRkZPMDFCUTB3c1NVRkJTU3hGUVVGRkxGVkJRVlU3VFVGRGFFSXNUMEZCVHl4RlFVRkZMRTlCUVU4N1MwRkRha0k3UjBGRFJqdEZRVU5FTEhWQ1FVRk5MRVZCUVVVc1EwRkJReXhGUVVGWk8wbEJRMjVDTEU5QlFVOHNRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhIUVVGSExFVkJRVVVzVTBGQlV5eEZRVUZGTEVsQlFVa3NRMEZCUXl4TlFVRk5MRU5CUVVNc1QwRkJUeXhEUVVGRE8wZEJRMjVFTzBOQlEwWTdPMEZEY0VKRUxGbEJRV1U3YTBKQlEySXNZMEZCWXp0VlFVTmtMRTFCUVUwN1UwRkRUaXhMUVVGTE8xZEJRMHdzVDBGQlR6dHJRa0ZEVUN4alFVRmpPM1ZDUVVOa0xHMUNRVUZ0UWp0clFrRkRia0lzWTBGQll6dERRVU5tT3pzN095SjlcbiIsIi8vIEBmbG93XG5cbmZ1bmN0aW9uIGdldE9wdGlvbnMgKGtleSwgb3B0aW9ucywgY29uZmlnKSB7XG4gIGlmIChvcHRpb25zIHx8XG4gICAgKGNvbmZpZ1trZXldICYmIE9iamVjdC5rZXlzKGNvbmZpZ1trZXldKS5sZW5ndGggPiAwKSkge1xuICAgIGlmIChBcnJheS5pc0FycmF5KG9wdGlvbnMpKSB7XG4gICAgICByZXR1cm4gW1xuICAgICAgICAuLi5vcHRpb25zLFxuICAgICAgICAuLi5PYmplY3Qua2V5cyhjb25maWdba2V5XSB8fCB7fSldXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLmNvbmZpZ1trZXldLFxuICAgICAgICAuLi5vcHRpb25zXG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtZXJnZU9wdGlvbnMgKFxuICBvcHRpb25zOiBPcHRpb25zLFxuICBjb25maWc6IE9wdGlvbnNcbik6IE9wdGlvbnMge1xuICByZXR1cm4ge1xuICAgIC4uLm9wdGlvbnMsXG4gICAgc3R1YnM6IGdldE9wdGlvbnMoJ3N0dWJzJywgb3B0aW9ucy5zdHVicywgY29uZmlnKSxcbiAgICBtb2NrczogZ2V0T3B0aW9ucygnbW9ja3MnLCBvcHRpb25zLm1vY2tzLCBjb25maWcpLFxuICAgIG1ldGhvZHM6IGdldE9wdGlvbnMoJ21ldGhvZHMnLCBvcHRpb25zLm1ldGhvZHMsIGNvbmZpZylcbiAgfVxufVxuXG4iLCJpbXBvcnQgdGVzdFV0aWxzIGZyb20gJ0B2dWUvdGVzdC11dGlscydcblxuZXhwb3J0IGRlZmF1bHQgdGVzdFV0aWxzLmNvbmZpZ1xuIiwiLy8gQGZsb3dcblxuaW1wb3J0IFZ1ZSBmcm9tICd2dWUnXG5pbXBvcnQgY3JlYXRlSW5zdGFuY2UgZnJvbSAnY3JlYXRlLWluc3RhbmNlJ1xuaW1wb3J0IHsgdGhyb3dFcnJvciB9IGZyb20gJ3NoYXJlZC91dGlsJ1xuaW1wb3J0IHsgY3JlYXRlUmVuZGVyZXIgfSBmcm9tICd2dWUtc2VydmVyLXJlbmRlcmVyJ1xuaW1wb3J0IHRlc3RVdGlscyBmcm9tICdAdnVlL3Rlc3QtdXRpbHMnXG5pbXBvcnQgeyBtZXJnZU9wdGlvbnMgfSBmcm9tICdzaGFyZWQvbWVyZ2Utb3B0aW9ucydcbmltcG9ydCBjb25maWcgZnJvbSAnLi9jb25maWcnXG5cblZ1ZS5jb25maWcucHJvZHVjdGlvblRpcCA9IGZhbHNlXG5WdWUuY29uZmlnLmRldnRvb2xzID0gZmFsc2VcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcmVuZGVyVG9TdHJpbmcgKGNvbXBvbmVudDogQ29tcG9uZW50LCBvcHRpb25zOiBPcHRpb25zID0ge30pOiBzdHJpbmcge1xuICBjb25zdCByZW5kZXJlciA9IGNyZWF0ZVJlbmRlcmVyKClcblxuICBpZiAoIXJlbmRlcmVyKSB7XG4gICAgdGhyb3dFcnJvcigncmVuZGVyVG9TdHJpbmcgbXVzdCBiZSBydW4gaW4gbm9kZS4gSXQgY2Fubm90IGJlIHJ1biBpbiBhIGJyb3dzZXInKVxuICB9XG4gIC8vIFJlbW92ZSBjYWNoZWQgY29uc3RydWN0b3JcbiAgZGVsZXRlIGNvbXBvbmVudC5fQ3RvclxuXG4gIGlmIChvcHRpb25zLmF0dGFjaFRvRG9jdW1lbnQpIHtcbiAgICB0aHJvd0Vycm9yKCd5b3UgY2Fubm90IHVzZSBhdHRhY2hUb0RvY3VtZW50IHdpdGggcmVuZGVyVG9TdHJpbmcnKVxuICB9XG4gIGNvbnN0IHZ1ZUNsYXNzID0gb3B0aW9ucy5sb2NhbFZ1ZSB8fCB0ZXN0VXRpbHMuY3JlYXRlTG9jYWxWdWUoKVxuICBjb25zdCB2bSA9IGNyZWF0ZUluc3RhbmNlKGNvbXBvbmVudCwgbWVyZ2VPcHRpb25zKG9wdGlvbnMsIGNvbmZpZyksIHZ1ZUNsYXNzKVxuICBsZXQgcmVuZGVyZWRTdHJpbmcgPSAnJ1xuXG4gIC8vICRGbG93SWdub3JlXG4gIHJlbmRlcmVyLnJlbmRlclRvU3RyaW5nKHZtLCAoZXJyLCByZXMpID0+IHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICBjb25zb2xlLmxvZyhlcnIpXG4gICAgfVxuICAgIHJlbmRlcmVkU3RyaW5nID0gcmVzXG4gIH0pXG4gIHJldHVybiByZW5kZXJlZFN0cmluZ1xufVxuIiwiLy8gQGZsb3dcblxuaW1wb3J0IHJlbmRlclRvU3RyaW5nIGZyb20gJy4vcmVuZGVyVG9TdHJpbmcnXG5pbXBvcnQgY2hlZXJpbyBmcm9tICdjaGVlcmlvJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiByZW5kZXIgKGNvbXBvbmVudDogQ29tcG9uZW50LCBvcHRpb25zOiBPcHRpb25zID0ge30pOiBzdHJpbmcge1xuICBjb25zdCByZW5kZXJlZFN0cmluZyA9IHJlbmRlclRvU3RyaW5nKGNvbXBvbmVudCwgb3B0aW9ucylcbiAgcmV0dXJuIGNoZWVyaW8ubG9hZCgnJykocmVuZGVyZWRTdHJpbmcpXG59XG4iLCJpbXBvcnQgcmVuZGVyVG9TdHJpbmcgZnJvbSAnLi9yZW5kZXJUb1N0cmluZydcbmltcG9ydCByZW5kZXIgZnJvbSAnLi9yZW5kZXInXG5pbXBvcnQgY29uZmlnIGZyb20gJy4vY29uZmlnJ1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIHJlbmRlclRvU3RyaW5nLFxuICBjb25maWcsXG4gIHJlbmRlclxufVxuIl0sIm5hbWVzIjpbImNvbnN0IiwibGV0IiwiY29tcGlsZVRvRnVuY3Rpb25zIiwiVnVlIiwiJCRWdWUiLCJpc1Z1ZUNvbXBvbmVudCIsImNvbXBpbGVUZW1wbGF0ZSIsImRlbGV0ZW9wdGlvbnMiLCJfaW50ZXJvcERlZmF1bHQiLCJyZXF1aXJlJCQwIiwidGhyb3dFcnJvciIsIndhcm4iLCJjYW1lbGl6ZVJFIiwiY2FtZWxpemUiLCJjYXBpdGFsaXplIiwiaHlwaGVuYXRlUkUiLCJoeXBoZW5hdGUiLCJpc0RvbVNlbGVjdG9yIiwiY29tcG9uZW50TmVlZHNDb21waWxpbmciLCJpc1JlZlNlbGVjdG9yIiwiaXNOYW1lU2VsZWN0b3IiLCJpc1ZhbGlkU2xvdCIsInZhbGlkYXRlU2xvdHMiLCJhZGRTbG90VG9WbSIsInZ1ZVRlbXBsYXRlQ29tcGlsZXIiLCJhZGRTbG90cyIsImFkZFNjb3BlZFNsb3RzIiwiYWRkTW9ja3MiLCJhZGRBdHRycyIsImFkZExpc3RlbmVycyIsImFkZFByb3ZpZGUiLCJsb2dFdmVudHMiLCJhcmd1bWVudHMiLCJhZGRFdmVudExvZ2dlciIsImlzVnVlQ29tcG9uZW50JDEiLCJpc1ZhbGlkU3R1YiIsImlzUmVxdWlyZWRDb21wb25lbnQiLCJnZXRDb3JlUHJvcGVydGllcyIsImNyZWF0ZVN0dWJGcm9tU3RyaW5nIiwiY3JlYXRlQmxhbmtTdHViIiwiY3JlYXRlQ29tcG9uZW50U3R1YnMiLCJzdHViQ29tcG9uZW50cyIsImNyZWF0ZUNvbXBvbmVudFN0dWJzRm9yQWxsIiwiY3JlYXRlQ29tcG9uZW50U3R1YnNGb3JHbG9iYWxzIiwiY29tcGlsZVRlbXBsYXRlJDEiLCJkZWxldGVNb3VudGluZ09wdGlvbnMiLCJjcmVhdGVGdW5jdGlvbmFsU2xvdHMiLCJjcmVhdGVGdW5jdGlvbmFsQ29tcG9uZW50IiwiY3JlYXRlSW5zdGFuY2UiLCJjb21tb25qc0dsb2JhbCIsImdsb2JhbCIsImNyZWF0ZUNvbW1vbmpzTW9kdWxlIiwiZ2V0T3B0aW9ucyIsIm1lcmdlT3B0aW9ucyIsInRlc3RVdGlscyIsImNyZWF0ZVJlbmRlcmVyIiwiY29uZmlnIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7O0FBRUEsQUFBTyxTQUFTLFVBQVUsRUFBRSxHQUFHLEVBQVU7RUFDdkMsTUFBTSxJQUFJLEtBQUsseUJBQXNCLEdBQUcsRUFBRztDQUM1Qzs7QUFFRCxBQUFPLFNBQVMsSUFBSSxFQUFFLEdBQUcsRUFBVTtFQUNqQyxPQUFPLENBQUMsS0FBSyx5QkFBc0IsR0FBRyxHQUFHO0NBQzFDOztBQUVEQSxJQUFNLFVBQVUsR0FBRyxTQUFRO0FBQzNCLEFBQU9BLElBQU0sUUFBUSxhQUFJLEdBQUcsRUFBVSxTQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsVUFBVSxZQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsU0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFdBQVcsRUFBRSxHQUFHLEtBQUUsS0FBQzs7Ozs7QUFLcEcsQUFBT0EsSUFBTSxVQUFVLGFBQUksR0FBRyxFQUFVLFNBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBQzs7Ozs7QUFLckZBLElBQU0sV0FBVyxHQUFHLGFBQVk7QUFDaEMsQUFBT0EsSUFBTSxTQUFTLGFBQUksR0FBRyxFQUFVLFNBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsS0FBSyxDQUFDLENBQUMsV0FBVyxLQUFFOztBQ3RCdkY7O0FBSUEsU0FBUyxXQUFXLEVBQUUsSUFBSSxFQUFnQjtFQUN4QyxPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSSxLQUFLLElBQUksSUFBSSxPQUFPLElBQUksS0FBSyxRQUFRLENBQUMsSUFBSSxPQUFPLElBQUksS0FBSyxRQUFRO0NBQ3RHOztBQUVELEFBQU8sU0FBUyxhQUFhLEVBQUUsS0FBSyxFQUFnQjtFQUNsRCxLQUFLLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLFdBQUUsR0FBRyxFQUFFO0lBQ3hDLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7TUFDNUIsVUFBVSxDQUFDLGtFQUFrRSxFQUFDO0tBQy9FOztJQUVELElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtNQUM3QixLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxXQUFFLFNBQVMsRUFBRTtRQUM3QixJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxFQUFFO1VBQzNCLFVBQVUsQ0FBQyxrRUFBa0UsRUFBQztTQUMvRTtPQUNGLEVBQUM7S0FDSDtHQUNGLEVBQUM7Q0FDSDs7QUN0QkQ7O0FBTUEsU0FBUyxXQUFXLEVBQUUsRUFBRSxFQUFhLFFBQVEsRUFBVSxTQUFTLEVBQStEO0VBQzdIQyxJQUFJLEtBQUk7RUFDUixJQUFJLE9BQU8sU0FBUyxLQUFLLFFBQVEsRUFBRTtJQUNqQyxJQUFJLENBQUNDLHNDQUFrQixFQUFFO01BQ3ZCLFVBQVUsQ0FBQyw2R0FBNkcsRUFBQztLQUMxSDtJQUNELElBQUksTUFBTSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxFQUFFO01BQ2xELFVBQVUsQ0FBQyxvR0FBb0csRUFBQztLQUNqSDtJQUNERixJQUFNLFNBQVMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxTQUFTLEdBQUU7SUFDeENBLElBQU0sU0FBUyxHQUFHLFNBQVMsQ0FBQyxlQUFlLENBQUMsU0FBUyxFQUFFLFdBQVcsRUFBQztJQUNuRUEsSUFBTSxVQUFVLEdBQUcsU0FBUyxDQUFDLElBQUksR0FBRTtJQUNuQyxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksVUFBVSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLFNBQVMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEtBQUssQ0FBQyxFQUFFO01BQ2hILElBQUksR0FBRyxFQUFFLENBQUMsY0FBYyxDQUFDRSxzQ0FBa0IsQ0FBQyxTQUFTLENBQUMsRUFBQztLQUN4RCxNQUFNO01BQ0xGLElBQU0sY0FBYyxHQUFHRSxzQ0FBa0IsWUFBUyxTQUFTLG1CQUFjO01BQ3pFRixJQUFNLGdCQUFnQixHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLGdCQUFlO01BQ2pFLEVBQUUsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLGVBQWUsR0FBRyxjQUFjLENBQUMsZ0JBQWU7TUFDekUsSUFBSSxHQUFHLGNBQWMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxZQUFZLEVBQUUsRUFBRSxDQUFDLGNBQWMsQ0FBQyxDQUFDLFNBQVE7TUFDOUUsRUFBRSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsZUFBZSxHQUFHLGlCQUFnQjtLQUM1RDtHQUNGLE1BQU07SUFDTCxJQUFJLEdBQUcsRUFBRSxDQUFDLGNBQWMsQ0FBQyxTQUFTLEVBQUM7R0FDcEM7RUFDRCxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7SUFDdkIsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRTtNQUN0QyxFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQU0sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFNBQUssSUFBSSxFQUFDO0tBQ3hELE1BQU07TUFDTCxFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLFdBQUksSUFBSSxHQUFDO0tBQ2hDO0dBQ0YsTUFBTTtJQUNMLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUU7TUFDdEMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFDO0tBQy9CLE1BQU07TUFDTCxFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFDO0tBQzdCO0dBQ0Y7Q0FDRjs7QUFFRCxBQUFPLFNBQVMsUUFBUSxFQUFFLEVBQUUsRUFBYSxLQUFLLEVBQWdCO0VBQzVELGFBQWEsQ0FBQyxLQUFLLEVBQUM7RUFDcEIsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLFdBQUUsR0FBRyxFQUFFO0lBQy9CLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtNQUM3QixLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxXQUFFLFNBQVMsRUFBRTtRQUM3QixXQUFXLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxTQUFTLEVBQUM7T0FDaEMsRUFBQztLQUNILE1BQU07TUFDTCxXQUFXLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUM7S0FDakM7R0FDRixFQUFDO0NBQ0g7O0FDeEREOztBQUtBLEFBQU8sU0FBUyxjQUFjLEVBQUUsRUFBRSxFQUFhLFdBQVcsRUFBZ0I7RUFDeEUsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxPQUFPLFdBQUUsR0FBRyxFQUFFO0lBQ3JDQSxJQUFNLFFBQVEsR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxHQUFFO0lBQ3hDLElBQUksUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssV0FBVyxFQUFFO01BQ3pDLFVBQVUsQ0FBQyw2RUFBNkUsRUFBQztLQUMxRjtJQUNEQSxJQUFNLFNBQVMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxTQUFTLEdBQUU7SUFDeENBLElBQU0sU0FBUyxHQUFHLFNBQVMsQ0FBQyxlQUFlLENBQUMsUUFBUSxFQUFFLFdBQVcsRUFBQztJQUNsRSxFQUFFLENBQUMsMEJBQTBCLENBQUMsR0FBRyxDQUFDLEdBQUdFLHNDQUFrQixDQUFDLFFBQVEsQ0FBQyxDQUFDLE9BQU07SUFDeEUsRUFBRSxDQUFDLHlCQUF5QixDQUFDLEdBQUcsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxZQUFZLEVBQUM7R0FDekYsRUFBQztDQUNIOztBQ2hCRDtBQUNBO0FBR0EsQUFBZSxTQUFTLFFBQVEsRUFBRSxnQkFBZ0IsRUFBVUMsTUFBRyxFQUFhO0VBQzFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxPQUFPLFdBQUUsR0FBRyxFQUFFO0lBQzFDLElBQUk7TUFDRkEsTUFBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsR0FBRyxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUM7S0FDM0MsQ0FBQyxPQUFPLENBQUMsRUFBRTtNQUNWLElBQUksb0NBQWlDLEdBQUcsMEZBQXFGO0tBQzlIO0lBQ0RDLEdBQUssQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDRCxNQUFHLEVBQUUsR0FBRyxFQUFFLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxFQUFDO0dBQzNELEVBQUM7Q0FDSDs7QUNYYyxTQUFTLFFBQVEsRUFBRSxFQUFFLEVBQUUsS0FBSyxFQUFFO0VBQzNDSCxJQUFNLGNBQWMsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLE9BQU07RUFDeEMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsS0FBSTtFQUN4QixJQUFJLEtBQUssRUFBRTtJQUNULEVBQUUsQ0FBQyxNQUFNLEdBQUcsTUFBSztHQUNsQixNQUFNO0lBQ0wsRUFBRSxDQUFDLE1BQU0sR0FBRyxHQUFFO0dBQ2Y7RUFDRCxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxlQUFjO0NBQ25DOztBQ1RjLFNBQVMsWUFBWSxFQUFFLEVBQUUsRUFBRSxTQUFTLEVBQUU7RUFDbkRBLElBQU0sY0FBYyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsT0FBTTtFQUN4QyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxLQUFJO0VBQ3hCLElBQUksU0FBUyxFQUFFO0lBQ2IsRUFBRSxDQUFDLFVBQVUsR0FBRyxVQUFTO0dBQzFCLE1BQU07SUFDTCxFQUFFLENBQUMsVUFBVSxHQUFHLEdBQUU7R0FDbkI7RUFDRCxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxlQUFjO0NBQ25DOztBQ1hELFNBQVMsVUFBVSxFQUFFLFNBQVMsRUFBRSxhQUFhLEVBQUUsT0FBTyxFQUFFO0VBQ3REQSxJQUFNLE9BQU8sR0FBRyxPQUFPLGFBQWEsS0FBSyxVQUFVO01BQy9DLGFBQWE7TUFDYixNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxhQUFhLEVBQUM7O0VBRXBDLE9BQU8sQ0FBQyxZQUFZLEdBQUcsU0FBUyx1QkFBdUIsSUFBSTtJQUN6RCxJQUFJLENBQUMsU0FBUyxHQUFHLE9BQU8sT0FBTyxLQUFLLFVBQVU7UUFDMUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDbEIsUUFBTztJQUNaO0NBQ0Y7O0FDVkQ7O0FBRUEsQUFBTyxTQUFTLFNBQVMsRUFBRSxFQUFFLEVBQWEsT0FBTyxFQUFVLGNBQWMsRUFBYztFQUNyRkEsSUFBTSxJQUFJLEdBQUcsRUFBRSxDQUFDLE1BQUs7RUFDckIsRUFBRSxDQUFDLEtBQUssYUFBSSxJQUFJLEVBQVc7Ozs7SUFDekIsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUM7SUFDbEQsY0FBYyxDQUFDLElBQUksQ0FBQyxRQUFFLElBQUksUUFBRSxJQUFJLEVBQUUsRUFBQztJQUNuQyxPQUFPLElBQUksQ0FBQyxVQUFJLFNBQUMsRUFBRSxFQUFFLElBQUksV0FBSyxNQUFJLENBQUM7SUFDcEM7Q0FDRjs7QUFFRCxBQUFPLFNBQVMsY0FBYyxFQUFFLEdBQUcsRUFBYTtFQUM5QyxHQUFHLENBQUMsS0FBSyxDQUFDO0lBQ1IsWUFBWSxFQUFFLFlBQVk7TUFDeEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksRUFBQztNQUNwQyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsR0FBRTtNQUMxQixTQUFTLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixFQUFDO0tBQ3ZEO0dBQ0YsRUFBQztDQUNIOztBQ25CRDtBQUNBO0FBdUNBLEFBQU8sU0FBUyx1QkFBdUIsRUFBRSxTQUFTLEVBQWE7RUFDN0QsT0FBTyxTQUFTO0lBQ2QsQ0FBQyxTQUFTLENBQUMsTUFBTTtLQUNoQixTQUFTLENBQUMsUUFBUSxJQUFJLFNBQVMsQ0FBQyxPQUFPLENBQUM7SUFDekMsQ0FBQyxTQUFTLENBQUMsVUFBVTtDQUN4Qjs7QUM3Q0Q7O0FBSUEsQUFBTyxTQUFTLGVBQWUsRUFBRSxTQUFTLEVBQWE7RUFDckQsSUFBSSxTQUFTLENBQUMsVUFBVSxFQUFFO0lBQ3hCLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDLE9BQU8sV0FBRSxDQUFDLEVBQUU7TUFDNUNBLElBQU0sR0FBRyxHQUFHLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFDO01BQ25DLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFO1FBQ2YsZUFBZSxDQUFDLEdBQUcsRUFBQztPQUNyQjtLQUNGLEVBQUM7R0FDSDtFQUNELElBQUksU0FBUyxDQUFDLE9BQU8sRUFBRTtJQUNyQixlQUFlLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBQztHQUNuQztFQUNELElBQUksU0FBUyxDQUFDLFFBQVEsRUFBRTtJQUN0QixNQUFNLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRUUsc0NBQWtCLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxFQUFDO0dBQ2pFO0NBQ0Y7O0FDbkJEOztBQVNBLFNBQVNHLGdCQUFjLEVBQUUsSUFBSSxFQUFFO0VBQzdCLE9BQU8sSUFBSSxLQUFLLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDO0NBQzlEOztBQUVELFNBQVMsV0FBVyxFQUFFLElBQUksRUFBTztFQUMvQixPQUFPLENBQUMsQ0FBQyxJQUFJO01BQ1QsT0FBTyxJQUFJLEtBQUssUUFBUTtPQUN2QixJQUFJLEtBQUssSUFBSSxDQUFDO09BQ2RBLGdCQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7Q0FDM0I7O0FBTUQsU0FBUyxpQkFBaUIsRUFBRSxTQUFTLEVBQXFCO0VBQ3hELE9BQU87SUFDTCxLQUFLLEVBQUUsU0FBUyxDQUFDLEtBQUs7SUFDdEIsSUFBSSxFQUFFLFNBQVMsQ0FBQyxJQUFJO0lBQ3BCLEVBQUUsRUFBRSxTQUFTLENBQUMsRUFBRTtJQUNoQixHQUFHLEVBQUUsU0FBUyxDQUFDLEdBQUc7SUFDbEIsR0FBRyxFQUFFLFNBQVMsQ0FBQyxHQUFHO0lBQ2xCLEtBQUssRUFBRSxTQUFTLENBQUMsS0FBSztJQUN0QixRQUFRLEVBQUUsU0FBUyxDQUFDLFFBQVE7SUFDNUIsS0FBSyxFQUFFLFNBQVMsQ0FBQyxLQUFLO0lBQ3RCLFdBQVcsRUFBRSxTQUFTLENBQUMsV0FBVztJQUNsQyxXQUFXLEVBQUUsU0FBUyxDQUFDLFdBQVc7SUFDbEMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxLQUFLO0lBQ3RCLGVBQWUsRUFBRSxTQUFTLENBQUMsZUFBZTtJQUMxQyxRQUFRLEVBQUUsU0FBUyxDQUFDLFFBQVE7SUFDNUIsVUFBVSxFQUFFLFNBQVMsQ0FBQyxVQUFVO0dBQ2pDO0NBQ0Y7QUFDRCxTQUFTLG9CQUFvQixFQUFFLGNBQWMsRUFBVSxpQkFBaUIsRUFBcUI7RUFDM0YsSUFBSSxDQUFDSCxzQ0FBa0IsRUFBRTtJQUN2QixVQUFVLENBQUMsNkdBQTZHLEVBQUM7R0FDMUg7O0VBRUQsSUFBSSxjQUFjLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztFQUNwRSxjQUFjLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztFQUNqRSxjQUFjLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO0lBQy9ELFVBQVUsQ0FBQyxrREFBa0QsRUFBQztHQUMvRDs7RUFFRCxPQUFPLGtCQUNGLGlCQUFpQixDQUFDLGlCQUFpQixDQUFDO0lBQ3ZDQSxzQ0FBcUIsQ0FBQyxjQUFjLENBQUMsQ0FDdEM7Q0FDRjs7QUFFRCxTQUFTLGVBQWUsRUFBRSxpQkFBaUIsRUFBYTtFQUN0RCxPQUFPLGtCQUNGLGlCQUFpQixDQUFDLGlCQUFpQixDQUFDO0tBQ3ZDLE1BQU0sWUFBRSxHQUFFLFNBQUcsQ0FBQyxDQUFDLEVBQUUsS0FBQyxDQUNuQjtDQUNGOztBQUVELEFBQU8sU0FBUyxvQkFBb0IsRUFBRSxrQkFBK0IsRUFBRSxLQUFLLEVBQWtCO3lEQUF0QyxHQUFXOztFQUNqRUYsSUFBTSxVQUFVLEdBQUcsR0FBRTtFQUNyQixJQUFJLENBQUMsS0FBSyxFQUFFO0lBQ1YsT0FBTyxVQUFVO0dBQ2xCO0VBQ0QsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO0lBQ3hCLEtBQUssQ0FBQyxPQUFPLFdBQUMsTUFBSztNQUNqQixJQUFJLElBQUksS0FBSyxLQUFLLEVBQUU7UUFDbEIsTUFBTTtPQUNQOztNQUVELElBQUksT0FBTyxJQUFJLEtBQUssUUFBUSxFQUFFO1FBQzVCLFVBQVUsQ0FBQyxzREFBc0QsRUFBQztPQUNuRTtNQUNELFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxlQUFlLENBQUMsRUFBRSxFQUFDO0tBQ3ZDLEVBQUM7R0FDSCxNQUFNO0lBQ0wsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLFdBQUMsTUFBSztNQUM5QixJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxLQUFLLEVBQUU7UUFDekIsTUFBTTtPQUNQO01BQ0QsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRTtRQUM3QixVQUFVLENBQUMsMERBQTBELEVBQUM7T0FDdkU7TUFDRCxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxJQUFJLEVBQUU7UUFDeEIsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLGVBQWUsQ0FBQyxFQUFFLEVBQUM7UUFDdEMsTUFBTTtPQUNQOztNQUVELElBQUksdUJBQXVCLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUU7UUFDeEMsZUFBZSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBQztPQUM3Qjs7TUFFRCxJQUFJLGtCQUFrQixDQUFDLElBQUksQ0FBQyxFQUFFOztRQUU1QixPQUFPLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDLE1BQUs7UUFDckMsSUFBSSxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxRQUFRLEVBQUU7VUFDbkMsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLG9CQUFvQixDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsRUFBQztTQUMvRSxNQUFNO1VBQ0wsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLGtCQUNkLEtBQUssQ0FBQyxJQUFJLENBQUM7YUFDZCxJQUFJLEVBQUUsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSSxFQUNwQztTQUNGO09BQ0YsTUFBTTtRQUNMLElBQUksT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssUUFBUSxFQUFFO1VBQ25DLElBQUksQ0FBQ0Usc0NBQWtCLEVBQUU7WUFDdkIsVUFBVSxDQUFDLDZHQUE2RyxFQUFDO1dBQzFIO1VBQ0QsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLGtCQUNkQSxzQ0FBa0IsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsRUFDbkM7U0FDRixNQUFNO1VBQ0wsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLGtCQUNkLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFDZjtTQUNGO09BQ0Y7O01BRUQsSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRTtRQUM5QixHQUFHLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFDO09BQ3RDO0tBQ0YsRUFBQztHQUNIO0VBQ0QsT0FBTyxVQUFVO0NBQ2xCOztBQ25JRDs7QUFJQSxBQUFPLFNBQVNJLGlCQUFlLEVBQUUsU0FBUyxFQUFhO0VBQ3JELElBQUksU0FBUyxDQUFDLFVBQVUsRUFBRTtJQUN4QixNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxPQUFPLFdBQUUsQ0FBQyxFQUFFO01BQzVDTixJQUFNLEdBQUcsR0FBRyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBQztNQUNuQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRTtRQUNmTSxpQkFBZSxDQUFDLEdBQUcsRUFBQztPQUNyQjtLQUNGLEVBQUM7R0FDSDtFQUNELElBQUksU0FBUyxDQUFDLE9BQU8sRUFBRTtJQUNyQkEsaUJBQWUsQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFDO0dBQ25DO0VBQ0QsSUFBSSxTQUFTLENBQUMsUUFBUSxFQUFFO0lBQ3RCLE1BQU0sQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFSixzQ0FBa0IsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEVBQUM7R0FDakU7Q0FDRjs7QUNuQmMsU0FBUyxxQkFBcUIsRUFBRSxPQUFPLEVBQUU7RUFDdEQsT0FBTyxPQUFPLENBQUMsaUJBQWdCO0VBQy9CLE9BQU8sT0FBTyxDQUFDLE1BQUs7RUFDcEIsT0FBTyxPQUFPLENBQUMsTUFBSztFQUNwQixPQUFPLE9BQU8sQ0FBQyxTQUFRO0VBQ3ZCLE9BQU8sT0FBTyxDQUFDLE1BQUs7RUFDcEIsT0FBTyxPQUFPLENBQUMsUUFBTztFQUN0QixPQUFPLE9BQU8sQ0FBQyxNQUFLO0VBQ3BCLE9BQU8sT0FBTyxDQUFDLE1BQUs7RUFDcEIsT0FBTyxPQUFPLENBQUMsVUFBUztDQUN6Qjs7QUNWRDs7QUFNQSxTQUFTLHFCQUFxQixFQUFFLEtBQVUsRUFBRSxDQUFDLEVBQUU7K0JBQVYsR0FBRzs7RUFDdEMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFBRTtJQUNoQyxPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztHQUM1Qjs7RUFFRCxJQUFJLE9BQU8sS0FBSyxDQUFDLE9BQU8sS0FBSyxRQUFRLEVBQUU7SUFDckMsT0FBTyxDQUFDLENBQUMsQ0FBQ0Esc0NBQWtCLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7R0FDOUM7RUFDREYsSUFBTSxRQUFRLEdBQUcsR0FBRTtFQUNuQixNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sV0FBQyxVQUFTO0lBQ2xDLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRTtNQUNsQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsT0FBTyxXQUFDLE1BQUs7UUFDM0JBLElBQU0sU0FBUyxHQUFHLE9BQU8sSUFBSSxLQUFLLFFBQVEsR0FBR0Usc0NBQWtCLENBQUMsSUFBSSxDQUFDLEdBQUcsS0FBSTtRQUM1RUYsSUFBTSxPQUFPLEdBQUcsQ0FBQyxDQUFDLFNBQVMsRUFBQztRQUM1QixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxTQUFRO1FBQzVCLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFDO09BQ3ZCLEVBQUM7S0FDSCxNQUFNO01BQ0xBLElBQU0sU0FBUyxHQUFHLE9BQU8sS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLFFBQVEsR0FBR0Usc0NBQWtCLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLFFBQVEsRUFBQztNQUM3R0YsSUFBTSxJQUFJLEdBQUcsQ0FBQyxDQUFDLFNBQVMsRUFBQztNQUN6QixJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxTQUFRO01BQ3pCLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFDO0tBQ3BCO0dBQ0YsRUFBQztFQUNGLE9BQU8sUUFBUTtDQUNoQjs7QUFFRCxBQUFlLFNBQVMseUJBQXlCLEVBQUUsU0FBUyxFQUFhLGVBQWUsRUFBVztFQUNqRyxJQUFJLGVBQWUsQ0FBQyxPQUFPLElBQUksT0FBTyxlQUFlLENBQUMsT0FBTyxLQUFLLFFBQVEsRUFBRTtJQUMxRSxVQUFVLENBQUMsaUNBQWlDLEVBQUM7R0FDOUM7RUFDRCxJQUFJLGVBQWUsQ0FBQyxLQUFLLEVBQUU7SUFDekIsYUFBYSxDQUFDLGVBQWUsQ0FBQyxLQUFLLEVBQUM7R0FDckM7O0VBRUQsT0FBTztJQUNMLHVCQUFNLEVBQUUsQ0FBQyxFQUFZO01BQ25CLE9BQU8sQ0FBQztRQUNOLFNBQVM7UUFDVCxlQUFlLENBQUMsT0FBTyxJQUFJLFNBQVMsQ0FBQyx1QkFBdUI7UUFDNUQsQ0FBQyxlQUFlLENBQUMsT0FBTyxJQUFJLGVBQWUsQ0FBQyxPQUFPLENBQUMsUUFBUSxJQUFJLGVBQWUsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEdBQUcsV0FBQyxHQUFFLFNBQUcsT0FBTyxDQUFDLEtBQUssVUFBVSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFDLENBQUMsS0FBSyxxQkFBcUIsQ0FBQyxlQUFlLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztPQUNsTTtLQUNGO0lBQ0QsSUFBSSxFQUFFLFNBQVMsQ0FBQyxJQUFJO0lBQ3BCLHNCQUFzQixFQUFFLElBQUk7R0FDN0I7Q0FDRjs7QUNwREQ7O0FBaUJBLEFBQWUsU0FBUyxjQUFjO0VBQ3BDLFNBQVM7RUFDVCxPQUFPO0VBQ1AsR0FBRztFQUNRO0VBQ1gsSUFBSSxPQUFPLENBQUMsS0FBSyxFQUFFO0lBQ2pCLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsRUFBQztHQUM3Qjs7RUFFRCxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sSUFBSSxTQUFTLENBQUMsT0FBTyxDQUFDLFVBQVUsS0FBSyxTQUFTLENBQUMsVUFBVSxFQUFFO0lBQy9FLFNBQVMsR0FBRyx5QkFBeUIsQ0FBQyxTQUFTLEVBQUUsT0FBTyxFQUFDO0dBQzFELE1BQU0sSUFBSSxPQUFPLENBQUMsT0FBTyxFQUFFO0lBQzFCLFVBQVU7TUFDUixxRUFBcUU7TUFDdEU7R0FDRjs7RUFFRCxJQUFJLE9BQU8sQ0FBQyxPQUFPLEVBQUU7SUFDbkIsVUFBVSxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBQztHQUNoRDs7RUFFRCxJQUFJLHVCQUF1QixDQUFDLFNBQVMsQ0FBQyxFQUFFO0lBQ3RDTSxpQkFBZSxDQUFDLFNBQVMsRUFBQztHQUMzQjs7RUFFRCxjQUFjLENBQUMsR0FBRyxFQUFDOztFQUVuQk4sSUFBTSxXQUFXLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUM7O0VBRXpDQSxJQUFNLGVBQWUsR0FBRyxrQkFBSyxPQUFPLEVBQUU7RUFDdENPLHFCQUFhLENBQUMsZUFBZSxFQUFDO0VBQzlCLElBQUksT0FBTyxDQUFDLEtBQUssRUFBRTtJQUNqQixlQUFlLENBQUMsVUFBVSxHQUFHLGtCQUN4QixlQUFlLENBQUMsVUFBVTs7TUFFN0Isb0JBQXVCLENBQUMsU0FBUyxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQzdEO0dBQ0Y7O0VBRURQLElBQU0sRUFBRSxHQUFHLElBQUksV0FBVyxDQUFDLGVBQWUsRUFBQzs7RUFFM0MsUUFBUSxDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUMsS0FBSyxFQUFDO0VBQzNCLFlBQVksQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLFNBQVMsRUFBQzs7RUFFbkMsSUFBSSxPQUFPLENBQUMsV0FBVyxFQUFFO0lBQ3ZCLElBQUksTUFBTSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxFQUFFO01BQ2xELFVBQVUsQ0FBQywrRkFBK0YsRUFBQztLQUM1RztJQUNEQSxJQUFNLFVBQVUsR0FBRyxNQUFNLEdBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxZQUFLLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFHO0lBQ3RGLElBQUksVUFBVSxJQUFJLEdBQUcsRUFBRTtNQUNyQixFQUFFLENBQUMsMEJBQTBCLEdBQUcsR0FBRTtNQUNsQyxFQUFFLENBQUMseUJBQXlCLEdBQUcsR0FBRTtNQUNqQ0EsSUFBTSxVQUFVLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxHQUFFOztNQUVyQyxFQUFFLENBQUMsWUFBWSxDQUFDLEVBQUUsR0FBRyxVQUFVLElBQUksRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRTtRQUNoRUEsSUFBTSxZQUFZLEdBQUcsRUFBRSxDQUFDLDBCQUEwQixDQUFDLElBQUksRUFBQztRQUN4REEsSUFBTSxTQUFTLEdBQUcsRUFBRSxDQUFDLHlCQUF5QixDQUFDLElBQUksRUFBQztRQUNwRCxJQUFJLFlBQVksRUFBRTtVQUNoQixLQUFLLEdBQUcsa0JBQUssVUFBVSxFQUFFLEtBQVEsRUFBRTtVQUNuQ0EsSUFBTSxLQUFLLEdBQUcsR0FBRTtVQUNoQkEsSUFBTSxPQUFPLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUM7VUFDaEgsT0FBTyxDQUFDLE9BQU8sV0FBRSxHQUFHLEVBQUU7WUFDcEIsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUFDO1dBQ2xDLEVBQUM7VUFDRixLQUFLLENBQUMsU0FBUyxDQUFDLEdBQUcsTUFBSztVQUN4QixPQUFPLFlBQVksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1NBQ2hDLE1BQU07VUFDTCxPQUFPLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLFlBQVksRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxVQUFVLENBQUM7U0FDM0U7UUFDRjs7O01BR0QsY0FBYyxDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUMsV0FBVyxFQUFDO0tBQ3hDLE1BQU07TUFDTCxVQUFVLENBQUMsdURBQXVELEVBQUM7S0FDcEU7R0FDRjs7RUFFRCxJQUFJLE9BQU8sQ0FBQyxLQUFLLEVBQUU7SUFDakIsUUFBUSxDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUMsS0FBSyxFQUFDO0dBQzVCOztFQUVELE9BQU8sRUFBRTtDQUNWOzs7O0FDbEdELFNBQVNRLGlCQUFlLEVBQUUsRUFBRSxFQUFFLEVBQUUsT0FBTyxDQUFDLEVBQUUsS0FBSyxPQUFPLEVBQUUsS0FBSyxRQUFRLENBQUMsSUFBSSxTQUFTLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRTs7QUFFbEgsSUFBSUwsS0FBRyxHQUFHSyxpQkFBZSxDQUFDQyxHQUFjLENBQUMsQ0FBQzs7Ozs7QUFLMUMsU0FBU0MsWUFBVSxFQUFFLEdBQUcsRUFBRTtFQUN4QixNQUFNLElBQUksS0FBSyxFQUFFLG9CQUFvQixHQUFHLEdBQUcsRUFBRTtDQUM5Qzs7QUFFRCxTQUFTQyxNQUFJLEVBQUUsR0FBRyxFQUFFO0VBQ2xCLE9BQU8sQ0FBQyxLQUFLLEVBQUUsb0JBQW9CLEdBQUcsR0FBRyxFQUFFLENBQUM7Q0FDN0M7O0FBRUQsSUFBSUMsWUFBVSxHQUFHLFFBQVEsQ0FBQztBQUMxQixJQUFJQyxVQUFRLEdBQUcsVUFBVSxHQUFHLEVBQUUsRUFBRSxPQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUNELFlBQVUsRUFBRSxVQUFVLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsV0FBVyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQzs7Ozs7QUFLeEgsSUFBSUUsWUFBVSxHQUFHLFVBQVUsR0FBRyxFQUFFLEVBQUUsT0FBTyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDOzs7OztBQUt2RixJQUFJQyxhQUFXLEdBQUcsWUFBWSxDQUFDO0FBQy9CLElBQUlDLFdBQVMsR0FBRyxVQUFVLEdBQUcsRUFBRSxFQUFFLE9BQU8sR0FBRyxDQUFDLE9BQU8sQ0FBQ0QsYUFBVyxFQUFFLEtBQUssQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLEVBQUUsQ0FBQzs7QUFFekYsSUFBSSxPQUFPLE1BQU0sS0FBSyxXQUFXLEVBQUU7RUFDakNMLFlBQVU7SUFDUixpRkFBaUY7SUFDakYsNkRBQTZEO0lBQzdELG1GQUFtRjtHQUNwRixDQUFDO0NBQ0g7O0FBRUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFO0VBQzlCLE9BQU8sQ0FBQyxTQUFTLENBQUMsT0FBTztRQUNuQixPQUFPLENBQUMsU0FBUyxDQUFDLGVBQWU7UUFDakMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxrQkFBa0I7UUFDcEMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxpQkFBaUI7UUFDbkMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0I7UUFDbEMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxxQkFBcUI7UUFDdkMsVUFBVSxDQUFDLEVBQUU7VUFDWCxJQUFJLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztVQUN4RSxJQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO1VBQ3ZCLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxFQUFFLEVBQUU7VUFDL0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQ2QsQ0FBQztDQUNUOztBQUVELElBQUksT0FBTyxNQUFNLENBQUMsTUFBTSxLQUFLLFVBQVUsRUFBRTtFQUN2QyxDQUFDLFlBQVk7SUFDWCxNQUFNLENBQUMsTUFBTSxHQUFHLFVBQVUsTUFBTSxFQUFFO01BQ2hDLElBQUksV0FBVyxHQUFHLFNBQVMsQ0FBQzs7TUFFNUIsSUFBSSxNQUFNLEtBQUssU0FBUyxJQUFJLE1BQU0sS0FBSyxJQUFJLEVBQUU7UUFDM0MsTUFBTSxJQUFJLFNBQVMsQ0FBQyw0Q0FBNEMsQ0FBQztPQUNsRTs7TUFFRCxJQUFJLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7TUFDNUIsS0FBSyxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUUsS0FBSyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLEVBQUU7UUFDckQsSUFBSSxNQUFNLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2hDLElBQUksTUFBTSxLQUFLLFNBQVMsSUFBSSxNQUFNLEtBQUssSUFBSSxFQUFFO1VBQzNDLEtBQUssSUFBSSxPQUFPLElBQUksTUFBTSxFQUFFO1lBQzFCLElBQUksTUFBTSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsRUFBRTtjQUNsQyxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2FBQ25DO1dBQ0Y7U0FDRjtPQUNGO01BQ0QsT0FBTyxNQUFNO0tBQ2QsQ0FBQztHQUNILEdBQUcsQ0FBQztDQUNOOzs7O0FBSUQsU0FBU08sZUFBYSxFQUFFLFFBQVEsRUFBRTtFQUNoQyxJQUFJLE9BQU8sUUFBUSxLQUFLLFFBQVEsRUFBRTtJQUNoQyxPQUFPLEtBQUs7R0FDYjs7RUFFRCxJQUFJO0lBQ0YsSUFBSSxPQUFPLFFBQVEsS0FBSyxXQUFXLEVBQUU7TUFDbkNQLFlBQVUsQ0FBQyw0RUFBNEUsQ0FBQyxDQUFDO0tBQzFGO0dBQ0YsQ0FBQyxPQUFPLEtBQUssRUFBRTtJQUNkQSxZQUFVLENBQUMsNEVBQTRFLENBQUMsQ0FBQztHQUMxRjs7RUFFRCxJQUFJO0lBQ0YsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUNqQyxPQUFPLElBQUk7R0FDWixDQUFDLE9BQU8sS0FBSyxFQUFFO0lBQ2QsT0FBTyxLQUFLO0dBQ2I7Q0FDRjs7QUFFRCxTQUFTTCxnQkFBYyxFQUFFLFNBQVMsRUFBRTtFQUNsQyxJQUFJLE9BQU8sU0FBUyxLQUFLLFVBQVUsSUFBSSxTQUFTLENBQUMsT0FBTyxFQUFFO0lBQ3hELE9BQU8sSUFBSTtHQUNaOztFQUVELElBQUksU0FBUyxLQUFLLElBQUksSUFBSSxPQUFPLFNBQVMsS0FBSyxRQUFRLEVBQUU7SUFDdkQsT0FBTyxLQUFLO0dBQ2I7O0VBRUQsSUFBSSxTQUFTLENBQUMsT0FBTyxJQUFJLFNBQVMsQ0FBQyxLQUFLLEVBQUU7SUFDeEMsT0FBTyxJQUFJO0dBQ1o7O0VBRUQsT0FBTyxPQUFPLFNBQVMsQ0FBQyxNQUFNLEtBQUssVUFBVTtDQUM5Qzs7QUFFRCxTQUFTYSx5QkFBdUIsRUFBRSxTQUFTLEVBQUU7RUFDM0MsT0FBTyxTQUFTO0lBQ2QsQ0FBQyxTQUFTLENBQUMsTUFBTTtLQUNoQixTQUFTLENBQUMsUUFBUSxJQUFJLFNBQVMsQ0FBQyxPQUFPLENBQUM7SUFDekMsQ0FBQyxTQUFTLENBQUMsVUFBVTtDQUN4Qjs7QUFFRCxTQUFTQyxlQUFhLEVBQUUsZ0JBQWdCLEVBQUU7RUFDeEMsSUFBSSxPQUFPLGdCQUFnQixLQUFLLFFBQVEsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLGdCQUFnQixJQUFJLEVBQUUsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7SUFDNUYsT0FBTyxLQUFLO0dBQ2I7O0VBRUQsT0FBTyxPQUFPLGdCQUFnQixDQUFDLEdBQUcsS0FBSyxRQUFRO0NBQ2hEOztBQUVELFNBQVNDLGdCQUFjLEVBQUUsaUJBQWlCLEVBQUU7RUFDMUMsSUFBSSxPQUFPLGlCQUFpQixLQUFLLFFBQVEsSUFBSSxpQkFBaUIsS0FBSyxJQUFJLEVBQUU7SUFDdkUsT0FBTyxLQUFLO0dBQ2I7O0VBRUQsT0FBTyxDQUFDLENBQUMsaUJBQWlCLENBQUMsSUFBSTtDQUNoQzs7QUFFRCxJQUFJLGFBQWEsR0FBRyxlQUFlLENBQUM7QUFDcEMsSUFBSSxrQkFBa0IsR0FBRyxvQkFBb0IsQ0FBQztBQUM5QyxJQUFJLFlBQVksR0FBRyxjQUFjLENBQUM7QUFDbEMsSUFBSSxZQUFZLEdBQUcsY0FBYyxDQUFDO0FBQ2xDLElBQUksV0FBVyxHQUFHLE1BQU0sRUFBRSxDQUFDakIsS0FBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxJQUFJQSxLQUFHLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDNUYsSUFBSSxrQkFBa0IsR0FBRyxXQUFXLElBQUksR0FBRyxHQUFHLFdBQVcsR0FBRyxtQkFBbUIsQ0FBQzs7OztBQUloRixTQUFTLHNCQUFzQixFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUU7RUFDckQsSUFBSWMsZUFBYSxDQUFDLFFBQVEsQ0FBQyxFQUFFLEVBQUUsT0FBTyxZQUFZLEVBQUU7RUFDcEQsSUFBSUcsZ0JBQWMsQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLE9BQU8sYUFBYSxFQUFFO0VBQ3RELElBQUlmLGdCQUFjLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxPQUFPLGtCQUFrQixFQUFFO0VBQzNELElBQUljLGVBQWEsQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLE9BQU8sWUFBWSxFQUFFOztFQUVwRFQsWUFBVSxFQUFFLFVBQVUsR0FBRyxVQUFVLEdBQUcsc0ZBQXNGLEVBQUUsQ0FBQztDQUNoSTs7OztBQUlELFNBQVMsMEJBQTBCO0VBQ2pDLEVBQUU7RUFDRixVQUFVO0VBQ1Y7RUFDQSxLQUFLLFVBQVUsS0FBSyxLQUFLLENBQUMsS0FBRyxVQUFVLEdBQUcsRUFBRSxHQUFDOztFQUU3QyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0VBQ3BCLEVBQUUsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFVBQVUsS0FBSyxFQUFFO0lBQ3BDLDBCQUEwQixDQUFDLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQztHQUMvQyxDQUFDLENBQUM7O0VBRUgsT0FBTyxVQUFVO0NBQ2xCOztBQUVELFNBQVMsNkJBQTZCO0VBQ3BDLEtBQUs7RUFDTCxVQUFVO0VBQ1Y7RUFDQSxLQUFLLFVBQVUsS0FBSyxLQUFLLENBQUMsS0FBRyxVQUFVLEdBQUcsRUFBRSxHQUFDOztFQUU3QyxJQUFJLEtBQUssQ0FBQyxLQUFLLEVBQUU7SUFDZixVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztHQUM5QjtFQUNELElBQUksS0FBSyxDQUFDLFFBQVEsRUFBRTtJQUNsQixLQUFLLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEtBQUssRUFBRTtNQUN0Qyw2QkFBNkIsQ0FBQyxLQUFLLEVBQUUsVUFBVSxDQUFDLENBQUM7S0FDbEQsQ0FBQyxDQUFDO0dBQ0o7O0VBRUQsT0FBTyxVQUFVO0NBQ2xCOztBQUVELFNBQVMsb0NBQW9DO0VBQzNDLEtBQUs7RUFDTCxVQUFVO0VBQ1Y7RUFDQSxLQUFLLFVBQVUsS0FBSyxLQUFLLENBQUMsS0FBRyxVQUFVLEdBQUcsRUFBRSxHQUFDOztFQUU3QyxJQUFJLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLEtBQUssQ0FBQyxpQkFBaUIsRUFBRTtJQUN4RCxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0dBQ3hCO0VBQ0QsSUFBSSxLQUFLLENBQUMsUUFBUSxFQUFFO0lBQ2xCLEtBQUssQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLFVBQVUsS0FBSyxFQUFFO01BQ3RDLG9DQUFvQyxDQUFDLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQztLQUN6RCxDQUFDLENBQUM7R0FDSjtFQUNELE9BQU8sVUFBVTtDQUNsQjs7QUFFRCxTQUFTLGlCQUFpQixFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUU7RUFDcEMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsTUFBTSxJQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCO0lBQ2hELEVBQUUsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEtBQUssSUFBSTtLQUNwRCxFQUFFLENBQUMsTUFBTTtJQUNWLEVBQUUsQ0FBQyxNQUFNLENBQUMsaUJBQWlCO0lBQzNCLEVBQUUsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQztJQUMxQyxFQUFFLENBQUMsUUFBUSxJQUFJLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxLQUFLLElBQUk7SUFDeEMsRUFBRSxDQUFDLE9BQU8sSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksS0FBSyxJQUFJLENBQUM7Q0FDMUM7O0FBRUQsU0FBUyxxQkFBcUIsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFO0VBQ25ELElBQUksSUFBSSxHQUFHLFFBQVEsQ0FBQyxLQUFLLEtBQUssUUFBUSxDQUFDLE9BQU8sSUFBSSxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO0VBQzFFLElBQUksQ0FBQyxJQUFJLEVBQUU7SUFDVCxPQUFPLEtBQUs7R0FDYjtFQUNELElBQUksS0FBSyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7RUFDOUIsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLEVBQUUsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssU0FBUyxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDO0NBQ3hGOztBQUVELFNBQVMsK0JBQStCLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRTtFQUN6RCxJQUFJLFdBQVcsR0FBRyxHQUFHLEVBQUU7SUFDckJBLFlBQVUsQ0FBQyw0REFBNEQsQ0FBQyxDQUFDO0dBQzFFOztFQUVELElBQUksQ0FBQyxJQUFJLEVBQUU7SUFDVCxPQUFPLEtBQUs7R0FDYjs7RUFFRCxJQUFJLENBQUMsU0FBUyxDQUFDLGtCQUFrQixDQUFDLEVBQUU7SUFDbEMsT0FBTyxLQUFLO0dBQ2I7RUFDRCxJQUFJLEtBQUssR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO0VBQzdELE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxFQUFFLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7Q0FDL0Y7O0FBRUQsU0FBUyxpQkFBaUI7RUFDeEIsSUFBSTtFQUNKLFlBQVk7RUFDWixRQUFRO0VBQ1I7RUFDQSxJQUFJLFFBQVEsQ0FBQyxVQUFVLEVBQUU7SUFDdkIsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU07UUFDbkIsb0NBQW9DLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztRQUNqRCxvQ0FBb0MsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMvQyxPQUFPLEtBQUssQ0FBQyxNQUFNLENBQUMsVUFBVSxJQUFJLEVBQUUsRUFBRSxPQUFPLCtCQUErQixDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsS0FBSyxDQUFDO01BQ2hHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLElBQUksS0FBSyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUU7S0FDbkQ7R0FDRjtFQUNELElBQUksWUFBWSxHQUFHLE9BQU8sUUFBUSxLQUFLLFVBQVUsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDO0VBQzFGLElBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxNQUFNO01BQ3hCLDBCQUEwQixDQUFDLElBQUksQ0FBQztNQUNoQyw2QkFBNkIsQ0FBQyxJQUFJLENBQUMsQ0FBQztFQUN4QyxPQUFPLFVBQVUsQ0FBQyxNQUFNLENBQUMsVUFBVSxTQUFTLEVBQUU7SUFDNUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRTtNQUNwRCxPQUFPLEtBQUs7S0FDYjtJQUNELE9BQU8scUJBQXFCLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxJQUFJLGlCQUFpQixDQUFDLFNBQVMsRUFBRSxZQUFZLENBQUM7R0FDaEcsQ0FBQztDQUNIOzs7O0FBSUQsSUFBSSxZQUFZLEdBQUcsU0FBUyxZQUFZLEVBQUUsUUFBUSxFQUFFO0VBQ2xELElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxJQUFJLEVBQUUsQ0FBQztFQUMvQixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO0NBQ3BDLENBQUM7O0FBRUYsWUFBWSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEdBQUcsU0FBUyxFQUFFLEVBQUUsS0FBSyxFQUFFO0VBQzlDLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO0lBQzNCQSxZQUFVLEVBQUUsb0JBQW9CLEdBQUcsS0FBSyxFQUFFLENBQUM7R0FDNUM7RUFDRCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO0NBQzVCLENBQUM7O0FBRUYsWUFBWSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUcsU0FBUyxVQUFVLElBQUk7RUFDekQsSUFBSSxDQUFDLDJCQUEyQixDQUFDLFlBQVksQ0FBQyxDQUFDOztFQUUvQ0EsWUFBVSxDQUFDLDhFQUE4RSxDQUFDLENBQUM7Q0FDNUYsQ0FBQzs7QUFFRixZQUFZLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxTQUFTLE9BQU8sSUFBSTtFQUNuRCxJQUFJLENBQUMsMkJBQTJCLENBQUMsU0FBUyxDQUFDLENBQUM7O0VBRTVDQSxZQUFVLENBQUMsMkVBQTJFLENBQUMsQ0FBQztDQUN6RixDQUFDOztBQUVGLFlBQVksQ0FBQyxTQUFTLENBQUMsUUFBUSxHQUFHLFNBQVMsUUFBUSxFQUFFLFFBQVEsRUFBRTtFQUM3RCxJQUFJLENBQUMsMkJBQTJCLENBQUMsVUFBVSxDQUFDLENBQUM7O0VBRTdDLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsVUFBVSxPQUFPLEVBQUUsRUFBRSxPQUFPLE9BQU8sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDO0NBQ3RGLENBQUM7O0FBRUYsWUFBWSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsU0FBUyxNQUFNLElBQUk7RUFDakQsT0FBTyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxVQUFVLE9BQU8sRUFBRSxFQUFFLE9BQU8sT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQztDQUMvRixDQUFDOztBQUVGLFlBQVksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLFNBQVMsTUFBTSxFQUFFLFNBQVMsRUFBRTtFQUMxRCxPQUFPLElBQUksWUFBWSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0NBQ3pELENBQUM7O0FBRUYsWUFBWSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUcsU0FBUyxPQUFPLElBQUk7RUFDbkQsSUFBSSxDQUFDLDJCQUEyQixDQUFDLFNBQVMsQ0FBQyxDQUFDOztFQUU1QyxPQUFPLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLFVBQVUsT0FBTyxFQUFFLEVBQUUsT0FBTyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDO0NBQ2hHLENBQUM7O0FBRUYsWUFBWSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUcsU0FBUyxPQUFPLElBQUk7RUFDbkQsSUFBSSxDQUFDLDJCQUEyQixDQUFDLFNBQVMsQ0FBQyxDQUFDOztFQUU1Q0EsWUFBVSxDQUFDLDJFQUEyRSxDQUFDLENBQUM7Q0FDekYsQ0FBQzs7QUFFRixZQUFZLENBQUMsU0FBUyxDQUFDLGNBQWMsR0FBRyxTQUFTLGNBQWMsSUFBSTtFQUNqRSxJQUFJLENBQUMsMkJBQTJCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQzs7RUFFbkRBLFlBQVUsQ0FBQyxrRkFBa0YsQ0FBQyxDQUFDO0NBQ2hHLENBQUM7O0FBRUYsWUFBWSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEdBQUcsU0FBUyxZQUFZLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRTtFQUM3RSxJQUFJLENBQUMsMkJBQTJCLENBQUMsY0FBYyxDQUFDLENBQUM7O0VBRWpELE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsVUFBVSxPQUFPLEVBQUUsRUFBRSxPQUFPLE9BQU8sQ0FBQyxZQUFZLENBQUMsU0FBUyxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQztDQUNsRyxDQUFDOztBQUVGLFlBQVksQ0FBQyxTQUFTLENBQUMsUUFBUSxHQUFHLFNBQVMsUUFBUSxFQUFFLFNBQVMsRUFBRTtFQUM5RCxJQUFJLENBQUMsMkJBQTJCLENBQUMsVUFBVSxDQUFDLENBQUM7O0VBRTdDLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsVUFBVSxPQUFPLEVBQUUsRUFBRSxPQUFPLE9BQU8sQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDO0NBQ3ZGLENBQUM7O0FBRUYsWUFBWSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUcsU0FBUyxPQUFPLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRTtFQUM5RCxJQUFJLENBQUMsMkJBQTJCLENBQUMsU0FBUyxDQUFDLENBQUM7O0VBRTVDLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsVUFBVSxPQUFPLEVBQUUsRUFBRSxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQztDQUN4RixDQUFDOztBQUVGLFlBQVksQ0FBQyxTQUFTLENBQUMsUUFBUSxHQUFHLFNBQVMsUUFBUSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUU7RUFDakUsSUFBSSxDQUFDLDJCQUEyQixDQUFDLFVBQVUsQ0FBQyxDQUFDOztFQUU3QyxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLFVBQVUsT0FBTyxFQUFFLEVBQUUsT0FBTyxPQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUM7Q0FDMUYsQ0FBQzs7QUFFRixZQUFZLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxTQUFTLE9BQU8sSUFBSTtFQUNuRCxJQUFJLENBQUMsMkJBQTJCLENBQUMsU0FBUyxDQUFDLENBQUM7O0VBRTVDQSxZQUFVLENBQUMsMkVBQTJFLENBQUMsQ0FBQztDQUN6RixDQUFDOztBQUVGLFlBQVksQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFHLFNBQVMsSUFBSSxJQUFJO0VBQzdDLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxNQUFNLENBQUMsQ0FBQzs7RUFFekNBLFlBQVUsQ0FBQyx3RUFBd0UsQ0FBQyxDQUFDO0NBQ3RGLENBQUM7O0FBRUYsWUFBWSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEdBQUcsU0FBUyxJQUFJLElBQUk7RUFDN0MsSUFBSSxDQUFDLDJCQUEyQixDQUFDLE1BQU0sQ0FBQyxDQUFDOztFQUV6Q0EsWUFBVSxDQUFDLHdFQUF3RSxDQUFDLENBQUM7Q0FDdEYsQ0FBQzs7QUFFRixZQUFZLENBQUMsU0FBUyxDQUFDLEVBQUUsR0FBRyxTQUFTLEVBQUUsRUFBRSxRQUFRLEVBQUU7RUFDakQsSUFBSSxDQUFDLDJCQUEyQixDQUFDLElBQUksQ0FBQyxDQUFDOztFQUV2QyxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLFVBQVUsT0FBTyxFQUFFLEVBQUUsT0FBTyxPQUFPLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQztDQUNoRixDQUFDOztBQUVGLFlBQVksQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFHLFNBQVMsT0FBTyxJQUFJO0VBQ25ELElBQUksQ0FBQywyQkFBMkIsQ0FBQyxTQUFTLENBQUMsQ0FBQzs7RUFFNUMsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxVQUFVLE9BQU8sRUFBRSxFQUFFLE9BQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUUsQ0FBQztDQUM3RSxDQUFDOztBQUVGLFlBQVksQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFHLFNBQVMsU0FBUyxJQUFJO0VBQ3ZELElBQUksQ0FBQywyQkFBMkIsQ0FBQyxXQUFXLENBQUMsQ0FBQzs7RUFFOUMsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxVQUFVLE9BQU8sRUFBRSxFQUFFLE9BQU8sT0FBTyxDQUFDLFNBQVMsRUFBRSxDQUFDLEVBQUUsQ0FBQztDQUMvRSxDQUFDOztBQUVGLFlBQVksQ0FBQyxTQUFTLENBQUMsYUFBYSxHQUFHLFNBQVMsYUFBYSxJQUFJO0VBQy9ELElBQUksQ0FBQywyQkFBMkIsQ0FBQyxlQUFlLENBQUMsQ0FBQzs7RUFFbEQsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxVQUFVLE9BQU8sRUFBRSxFQUFFLE9BQU8sT0FBTyxDQUFDLGFBQWEsRUFBRSxDQUFDLEVBQUUsQ0FBQztDQUNuRixDQUFDOztBQUVGLFlBQVksQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFHLFNBQVMsSUFBSSxJQUFJO0VBQzdDLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxNQUFNLENBQUMsQ0FBQzs7RUFFekNBLFlBQVUsQ0FBQyx3RUFBd0UsQ0FBQyxDQUFDO0NBQ3RGLENBQUM7O0FBRUYsWUFBWSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQUcsU0FBUyxLQUFLLElBQUk7RUFDL0MsSUFBSSxDQUFDLDJCQUEyQixDQUFDLE9BQU8sQ0FBQyxDQUFDOztFQUUxQ0EsWUFBVSxDQUFDLHlFQUF5RSxDQUFDLENBQUM7Q0FDdkYsQ0FBQzs7QUFFRixZQUFZLENBQUMsU0FBUyxDQUFDLElBQUksR0FBRyxTQUFTLElBQUksSUFBSTtFQUM3QyxJQUFJLENBQUMsMkJBQTJCLENBQUMsTUFBTSxDQUFDLENBQUM7O0VBRXpDQSxZQUFVLENBQUMsd0VBQXdFLENBQUMsQ0FBQztDQUN0RixDQUFDOztBQUVGLFlBQVksQ0FBQyxTQUFTLENBQUMsMkJBQTJCLEdBQUcsU0FBUywyQkFBMkIsRUFBRSxNQUFNLEVBQUU7RUFDakcsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7SUFDOUJBLFlBQVUsRUFBRSxNQUFNLEdBQUcsOEJBQThCLEVBQUUsQ0FBQztHQUN2RDtDQUNGLENBQUM7O0FBRUYsWUFBWSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUcsU0FBUyxXQUFXLEVBQUUsUUFBUSxFQUFFO0VBQ25FLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxhQUFhLENBQUMsQ0FBQzs7RUFFaEQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsVUFBVSxPQUFPLEVBQUUsRUFBRSxPQUFPLE9BQU8sQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7Q0FDckYsQ0FBQzs7QUFFRixZQUFZLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxTQUFTLE9BQU8sRUFBRSxJQUFJLEVBQUU7RUFDdkQsSUFBSSxDQUFDLDJCQUEyQixDQUFDLFNBQVMsQ0FBQyxDQUFDOztFQUU1QyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxVQUFVLE9BQU8sRUFBRSxFQUFFLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztDQUM3RSxDQUFDOztBQUVGLFlBQVksQ0FBQyxTQUFTLENBQUMsVUFBVSxHQUFHLFNBQVMsVUFBVSxFQUFFLEtBQUssRUFBRTtFQUM5RCxJQUFJLENBQUMsMkJBQTJCLENBQUMsWUFBWSxDQUFDLENBQUM7O0VBRS9DLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLFVBQVUsT0FBTyxFQUFFLEVBQUUsT0FBTyxPQUFPLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0NBQ2pGLENBQUM7O0FBRUYsWUFBWSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEdBQUcsU0FBUyxRQUFRLEVBQUUsS0FBSyxFQUFFO0VBQzFELElBQUksQ0FBQywyQkFBMkIsQ0FBQyxVQUFVLENBQUMsQ0FBQzs7RUFFN0MsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsVUFBVSxPQUFPLEVBQUUsRUFBRSxPQUFPLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7Q0FDL0UsQ0FBQzs7QUFFRixZQUFZLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxTQUFTLE9BQU8sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFO0VBQ2pFLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxTQUFTLENBQUMsQ0FBQzs7RUFFNUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsVUFBVSxPQUFPLEVBQUUsRUFBRSxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0NBQ3ZGLENBQUM7O0FBRUYsWUFBWSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsU0FBUyxNQUFNLElBQUk7RUFDakQsSUFBSSxDQUFDLDJCQUEyQixDQUFDLFFBQVEsQ0FBQyxDQUFDO0VBQzNDQyxNQUFJLENBQUMsZ0ZBQWdGLENBQUMsQ0FBQztDQUN4RixDQUFDOztBQUVGLFlBQVksQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFHLFNBQVMsT0FBTyxJQUFJO0VBQ25ELElBQUksQ0FBQywyQkFBMkIsQ0FBQyxTQUFTLENBQUMsQ0FBQzs7RUFFNUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsVUFBVSxPQUFPLEVBQUUsRUFBRSxPQUFPLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztDQUN6RSxDQUFDOzs7O0FBSUYsSUFBSSxZQUFZLEdBQUcsU0FBUyxZQUFZLEVBQUUsUUFBUSxFQUFFO0VBQ2xELElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO0NBQzFCLENBQUM7O0FBRUYsWUFBWSxDQUFDLFNBQVMsQ0FBQyxFQUFFLEdBQUcsU0FBUyxFQUFFLElBQUk7RUFDekNELFlBQVUsRUFBRSxzQkFBc0IsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcscUNBQXFDLEVBQUUsQ0FBQztDQUNoRyxDQUFDOztBQUVGLFlBQVksQ0FBQyxTQUFTLENBQUMsVUFBVSxHQUFHLFNBQVMsVUFBVSxJQUFJO0VBQ3pEQSxZQUFVLEVBQUUsc0JBQXNCLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLDZDQUE2QyxFQUFFLENBQUM7Q0FDeEcsQ0FBQzs7QUFFRixZQUFZLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxTQUFTLE9BQU8sSUFBSTtFQUNuREEsWUFBVSxFQUFFLHNCQUFzQixJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRywwQ0FBMEMsRUFBRSxDQUFDO0NBQ3JHLENBQUM7O0FBRUYsWUFBWSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEdBQUcsU0FBUyxRQUFRLElBQUk7RUFDckRBLFlBQVUsRUFBRSxzQkFBc0IsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsMkNBQTJDLEVBQUUsQ0FBQztDQUN0RyxDQUFDOztBQUVGLFlBQVksQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFHLFNBQVMsT0FBTyxJQUFJO0VBQ25EQSxZQUFVLEVBQUUsc0JBQXNCLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLDBDQUEwQyxFQUFFLENBQUM7Q0FDckcsQ0FBQzs7QUFFRixZQUFZLENBQUMsU0FBUyxDQUFDLGNBQWMsR0FBRyxTQUFTLGNBQWMsSUFBSTtFQUNqRUEsWUFBVSxFQUFFLHNCQUFzQixJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxpREFBaUQsRUFBRSxDQUFDO0NBQzVHLENBQUM7O0FBRUYsWUFBWSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsU0FBUyxNQUFNLElBQUk7RUFDakQsT0FBTyxLQUFLO0NBQ2IsQ0FBQzs7QUFFRixZQUFZLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxTQUFTLE1BQU0sSUFBSTtFQUNqREEsWUFBVSxFQUFFLHNCQUFzQixJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyx5Q0FBeUMsRUFBRSxDQUFDO0NBQ3BHLENBQUM7O0FBRUYsWUFBWSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUcsU0FBUyxPQUFPLElBQUk7RUFDbkRBLFlBQVUsRUFBRSxzQkFBc0IsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsMENBQTBDLEVBQUUsQ0FBQztDQUNyRyxDQUFDOztBQUVGLFlBQVksQ0FBQyxTQUFTLENBQUMsWUFBWSxHQUFHLFNBQVMsWUFBWSxJQUFJO0VBQzdEQSxZQUFVLEVBQUUsc0JBQXNCLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLCtDQUErQyxFQUFFLENBQUM7Q0FDMUcsQ0FBQzs7QUFFRixZQUFZLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBRyxTQUFTLFFBQVEsSUFBSTtFQUNyREEsWUFBVSxFQUFFLHNCQUFzQixJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRywyQ0FBMkMsRUFBRSxDQUFDO0NBQ3RHLENBQUM7O0FBRUYsWUFBWSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUcsU0FBUyxPQUFPLElBQUk7RUFDbkRBLFlBQVUsRUFBRSxzQkFBc0IsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsMENBQTBDLEVBQUUsQ0FBQztDQUNyRyxDQUFDOztBQUVGLFlBQVksQ0FBQyxTQUFTLENBQUMsUUFBUSxHQUFHLFNBQVMsUUFBUSxJQUFJO0VBQ3JEQSxZQUFVLEVBQUUsc0JBQXNCLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLDJDQUEyQyxFQUFFLENBQUM7Q0FDdEcsQ0FBQzs7QUFFRixZQUFZLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxTQUFTLE9BQU8sSUFBSTtFQUNuREEsWUFBVSxFQUFFLHNCQUFzQixJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRywwQ0FBMEMsRUFBRSxDQUFDO0NBQ3JHLENBQUM7O0FBRUYsWUFBWSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEdBQUcsU0FBUyxJQUFJLElBQUk7RUFDN0NBLFlBQVUsRUFBRSxzQkFBc0IsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsdUNBQXVDLEVBQUUsQ0FBQztDQUNsRyxDQUFDOztBQUVGLFlBQVksQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFHLFNBQVMsSUFBSSxJQUFJO0VBQzdDQSxZQUFVLEVBQUUsc0JBQXNCLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLHVDQUF1QyxFQUFFLENBQUM7Q0FDbEcsQ0FBQzs7QUFFRixZQUFZLENBQUMsU0FBUyxDQUFDLEVBQUUsR0FBRyxTQUFTLEVBQUUsSUFBSTtFQUN6Q0EsWUFBVSxFQUFFLHNCQUFzQixJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxxQ0FBcUMsRUFBRSxDQUFDO0NBQ2hHLENBQUM7O0FBRUYsWUFBWSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUcsU0FBUyxPQUFPLElBQUk7RUFDbkRBLFlBQVUsRUFBRSxzQkFBc0IsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsMENBQTBDLEVBQUUsQ0FBQztDQUNyRyxDQUFDOztBQUVGLFlBQVksQ0FBQyxTQUFTLENBQUMsU0FBUyxHQUFHLFNBQVMsU0FBUyxJQUFJO0VBQ3ZEQSxZQUFVLEVBQUUsc0JBQXNCLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLDRDQUE0QyxFQUFFLENBQUM7Q0FDdkcsQ0FBQzs7QUFFRixZQUFZLENBQUMsU0FBUyxDQUFDLGFBQWEsR0FBRyxTQUFTLGFBQWEsSUFBSTtFQUMvREEsWUFBVSxFQUFFLHNCQUFzQixJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxnREFBZ0QsRUFBRSxDQUFDO0NBQzNHLENBQUM7O0FBRUYsWUFBWSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEdBQUcsU0FBUyxJQUFJLElBQUk7RUFDN0NBLFlBQVUsRUFBRSxzQkFBc0IsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsdUNBQXVDLEVBQUUsQ0FBQztDQUNsRyxDQUFDOztBQUVGLFlBQVksQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLFNBQVMsS0FBSyxJQUFJO0VBQy9DQSxZQUFVLEVBQUUsc0JBQXNCLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLHdDQUF3QyxFQUFFLENBQUM7Q0FDbkcsQ0FBQzs7QUFFRixZQUFZLENBQUMsU0FBUyxDQUFDLElBQUksR0FBRyxTQUFTLElBQUksSUFBSTtFQUM3Q0EsWUFBVSxFQUFFLHNCQUFzQixJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyx1Q0FBdUMsRUFBRSxDQUFDO0NBQ2xHLENBQUM7O0FBRUYsWUFBWSxDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUcsU0FBUyxXQUFXLElBQUk7RUFDM0RBLFlBQVUsRUFBRSxzQkFBc0IsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsOENBQThDLEVBQUUsQ0FBQztDQUN6RyxDQUFDOztBQUVGLFlBQVksQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFHLFNBQVMsT0FBTyxJQUFJO0VBQ25EQSxZQUFVLEVBQUUsc0JBQXNCLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLDBDQUEwQyxFQUFFLENBQUM7Q0FDckcsQ0FBQzs7QUFFRixZQUFZLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBRyxTQUFTLFVBQVUsSUFBSTtFQUN6REEsWUFBVSxFQUFFLHNCQUFzQixJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyw2Q0FBNkMsRUFBRSxDQUFDO0NBQ3hHLENBQUM7O0FBRUYsWUFBWSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEdBQUcsU0FBUyxRQUFRLElBQUk7RUFDckRBLFlBQVUsRUFBRSxzQkFBc0IsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsMkNBQTJDLEVBQUUsQ0FBQztDQUN0RyxDQUFDOztBQUVGLFlBQVksQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFHLFNBQVMsT0FBTyxJQUFJO0VBQ25EQSxZQUFVLEVBQUUsc0JBQXNCLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLDBDQUEwQyxFQUFFLENBQUM7Q0FDckcsQ0FBQzs7QUFFRixZQUFZLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxTQUFTLE1BQU0sSUFBSTtFQUNqREEsWUFBVSxDQUFDLHlGQUF5RixDQUFDLENBQUM7Q0FDdkcsQ0FBQzs7QUFFRixZQUFZLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxTQUFTLE9BQU8sSUFBSTtFQUNuREEsWUFBVSxFQUFFLHNCQUFzQixJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRywwQ0FBMEMsRUFBRSxDQUFDO0NBQ3JHLENBQUM7Ozs7QUFJRixTQUFTLGFBQWEsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFO0VBQ3BDLEtBQUssS0FBSyxLQUFLLEtBQUssQ0FBQyxLQUFHLEtBQUssR0FBRyxFQUFFLEdBQUM7O0VBRW5DLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7O0VBRWxCLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUU7SUFDakMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsVUFBVSxVQUFVLEVBQUU7TUFDM0MsYUFBYSxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQztLQUNsQyxDQUFDLENBQUM7R0FDSjs7RUFFRCxJQUFJLEtBQUssQ0FBQyxLQUFLLEVBQUU7SUFDZixhQUFhLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7R0FDMUM7O0VBRUQsT0FBTyxLQUFLO0NBQ2I7O0FBRUQsU0FBUyxvQkFBb0IsRUFBRSxNQUFNLEVBQUU7RUFDckMsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFLE9BQU8sS0FBSyxLQUFLLE1BQU0sQ0FBQyxTQUFTLENBQUMsVUFBVSxJQUFJLEVBQUUsRUFBRSxPQUFPLEtBQUssQ0FBQyxHQUFHLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUM7Q0FDekk7O0FBRUQsU0FBUyxjQUFjLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRTtFQUN0QyxPQUFPLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEtBQUssT0FBTztDQUM5Qzs7QUFFRCxTQUFTLGVBQWUsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFO0VBQ3hDLElBQUksS0FBSyxHQUFHLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztFQUNqQyxJQUFJLGdCQUFnQixHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsVUFBVSxJQUFJLEVBQUUsRUFBRSxPQUFPLGNBQWMsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7OztFQUcvRixJQUFJLHNCQUFzQixHQUFHLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxVQUFVLElBQUksRUFBRSxFQUFFO0lBQ3JFLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQztJQUNwQyxFQUFFLENBQUMsQ0FBQztFQUNOLE9BQU8sb0JBQW9CLENBQUMsc0JBQXNCLENBQUM7Q0FDcEQ7O0FBRUQsU0FBUyxtQkFBbUIsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFO0VBQzVDLE9BQU8sSUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUM7Q0FDdkU7O0FBRUQsU0FBUyxvQkFBb0I7RUFDM0IsS0FBSztFQUNMLFFBQVE7RUFDUjtFQUNBLElBQUksS0FBSyxHQUFHLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztFQUNqQyxJQUFJLGFBQWEsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQVUsSUFBSSxFQUFFLEVBQUU7SUFDakQsbUJBQW1CLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQztJQUNuQyxFQUFFLENBQUMsQ0FBQztFQUNOLE9BQU8sb0JBQW9CLENBQUMsYUFBYSxDQUFDO0NBQzNDOztBQUVELFNBQVMsVUFBVTtFQUNqQixLQUFLO0VBQ0wsRUFBRTtFQUNGLFlBQVk7RUFDWixRQUFRO0VBQ1I7RUFDQSxJQUFJLFlBQVksS0FBSyxZQUFZLEVBQUU7SUFDakMsSUFBSSxDQUFDLEVBQUUsRUFBRTtNQUNQQSxZQUFVLENBQUMsMkRBQTJELENBQUMsQ0FBQztLQUN6RTs7SUFFRCxPQUFPLGVBQWUsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLEdBQUcsQ0FBQztHQUM1Qzs7RUFFRCxPQUFPLG9CQUFvQixDQUFDLEtBQUssRUFBRSxRQUFRLENBQUM7Q0FDN0M7Ozs7QUFJRCxTQUFTLFlBQVk7RUFDbkIsT0FBTztFQUNQLFFBQVE7RUFDUjtFQUNBLElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQztFQUNmLElBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFO0lBQzdELE9BQU8sS0FBSztHQUNiOztFQUVELElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRTtJQUM3QixLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0dBQ3JCOztFQUVELE9BQU8sS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztDQUN2RTs7OztBQUlELFNBQVMsSUFBSTtFQUNYLEVBQUU7RUFDRixLQUFLO0VBQ0wsT0FBTztFQUNQLFFBQVE7RUFDUjtFQUNBLElBQUksWUFBWSxHQUFHLHNCQUFzQixDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQzs7RUFFNUQsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLEVBQUUsSUFBSSxZQUFZLEtBQUssWUFBWSxFQUFFO0lBQ2xEQSxZQUFVLENBQUMsOElBQThJLENBQUMsQ0FBQztHQUM1Sjs7RUFFRCxJQUFJLFlBQVksS0FBSyxrQkFBa0IsSUFBSSxZQUFZLEtBQUssYUFBYSxFQUFFO0lBQ3pFLElBQUksSUFBSSxHQUFHLEVBQUUsSUFBSSxLQUFLLENBQUM7SUFDdkIsSUFBSSxDQUFDLElBQUksRUFBRTtNQUNULE9BQU8sRUFBRTtLQUNWO0lBQ0QsT0FBTyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFLFFBQVEsQ0FBQztHQUN2RDs7RUFFRCxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsS0FBSyxJQUFJLFFBQVEsQ0FBQyxHQUFHLElBQUksRUFBRSxDQUFDLEtBQUssSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsWUFBWVAsS0FBRyxFQUFFO0lBQ3ZGLE9BQU8sQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztHQUNoQzs7RUFFRCxJQUFJLEtBQUssRUFBRTtJQUNULElBQUksS0FBSyxHQUFHLFVBQVUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLFlBQVksRUFBRSxRQUFRLENBQUMsQ0FBQztJQUMxRCxJQUFJLFlBQVksS0FBSyxZQUFZLEVBQUU7TUFDakMsT0FBTyxLQUFLO0tBQ2I7SUFDRCxPQUFPLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxHQUFHLEtBQUssR0FBRyxZQUFZLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQztHQUNsRTs7RUFFRCxPQUFPLFlBQVksQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDO0NBQ3ZDOzs7O0FBSUQsU0FBUyxhQUFhO0VBQ3BCLElBQUk7RUFDSixPQUFPO0VBQ1A7RUFDQSxPQUFPLElBQUksWUFBWUEsS0FBRztNQUN0QixJQUFJLFVBQVUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDO01BQzdCLElBQUksT0FBTyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUM7Q0FDL0I7O0FBRUQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDOztBQUVWLFNBQVMsU0FBUyxFQUFFLE9BQU8sRUFBRTtFQUMzQixPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEdBQUcsRUFBRTtJQUNsQyxJQUFJLEdBQUcsQ0FBQyxTQUFTLEtBQUssQ0FBQyxFQUFFO01BQ3ZCLE1BQU07S0FDUDtJQUNELEdBQUcsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDO0lBQ2xCLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzVCLEdBQUcsQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7R0FDbkUsQ0FBQyxDQUFDO0NBQ0o7O0FBRUQsU0FBUyxlQUFlLEVBQUUsRUFBRSxFQUFFO0VBQzVCLElBQUksRUFBRSxDQUFDLFNBQVMsRUFBRTtJQUNoQixFQUFFLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztHQUNqQzs7RUFFRCxJQUFJLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRTtJQUN4QixNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLGVBQWUsRUFBRTtNQUNuRSxTQUFTLENBQUMsRUFBRSxDQUFDLGlCQUFpQixDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7S0FDbEQsQ0FBQyxDQUFDO0dBQ0o7O0VBRUQsU0FBUyxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQzs7RUFFdkIsRUFBRSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7Q0FDdkM7O0FBRUQsU0FBUyxhQUFhLEVBQUUsRUFBRSxFQUFFO0VBQzFCLGVBQWUsQ0FBQyxFQUFFLENBQUMsQ0FBQztFQUNwQixDQUFDLEVBQUUsQ0FBQztDQUNMOzs7O0FBSUQsSUFBSSxPQUFPLEdBQUcsU0FBUyxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRTtFQUM3QyxJQUFJLElBQUksWUFBWSxPQUFPLEVBQUU7SUFDM0IsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7SUFDcEIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7R0FDbkIsTUFBTTtJQUNMLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO0lBQ2xCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQztHQUN6QjtFQUNELElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFO0lBQ2xGLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxJQUFJLENBQUM7R0FDbkM7RUFDRCxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztFQUN2QixJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sRUFBRSxDQUFDQSxLQUFHLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLElBQUlBLEtBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztDQUMxRixDQUFDOztBQUVGLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFBRSxHQUFHLFNBQVMsRUFBRSxJQUFJO0VBQ3BDTyxZQUFVLENBQUMsdUNBQXVDLENBQUMsQ0FBQztDQUNyRCxDQUFDOzs7OztBQUtGLE9BQU8sQ0FBQyxTQUFTLENBQUMsVUFBVSxHQUFHLFNBQVMsVUFBVSxJQUFJO0VBQ3BELElBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDO0VBQ3pDLElBQUksWUFBWSxHQUFHLEVBQUUsQ0FBQztFQUN0QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtJQUMxQyxJQUFJLEdBQUcsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzdCLFlBQVksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQztHQUN6QztFQUNELE9BQU8sWUFBWTtDQUNwQixDQUFDOzs7OztBQUtGLE9BQU8sQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFHLFNBQVMsT0FBTyxJQUFJO0lBQzVDLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQzs7O0VBR3BCLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0VBQ25ELElBQUksT0FBTyxHQUFHLFNBQVMsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQzs7RUFFcEQsSUFBSSxJQUFJLENBQUMsRUFBRSxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFO0lBQzdCLElBQUksb0JBQW9CLEdBQUcsRUFBRSxDQUFDO0lBQzlCLElBQUksV0FBVyxDQUFDO0lBQ2hCLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxHQUFHLEVBQUU7O01BRWpELFdBQVcsR0FBRyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQzs7O01BR3BDLFdBQVcsR0FBRyxXQUFXLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO01BQ3hDLG9CQUFvQixDQUFDLFdBQVcsQ0FBQyxHQUFHLEdBQUcsQ0FBQztLQUN6QyxDQUFDLENBQUM7SUFDSCxPQUFPLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLFNBQVMsRUFBRSxFQUFFLE9BQU8sb0JBQW9CLENBQUMsU0FBUyxDQUFDLElBQUksU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0dBQ3RHO0VBQ0QsT0FBTyxPQUFPO0NBQ2YsQ0FBQzs7Ozs7QUFLRixPQUFPLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBRyxTQUFTLFFBQVEsRUFBRSxRQUFRLEVBQUU7RUFDeEQsSUFBSSxZQUFZLEdBQUcsc0JBQXNCLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0VBQ2hFLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztFQUM5RCxJQUFJLEVBQUUsR0FBRyxZQUFZLEtBQUssWUFBWSxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0VBQ25FLE9BQU8sS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksRUFBRTtDQUM5QixDQUFDOzs7OztBQUtGLE9BQU8sQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFHLFNBQVMsT0FBTyxFQUFFLEtBQUssRUFBRTtFQUNuRCxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUU7SUFDOUJBLFlBQVUsQ0FBQyx3REFBd0QsQ0FBQyxDQUFDO0dBQ3RFO0VBQ0QsSUFBSSxLQUFLLEVBQUU7SUFDVCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO0dBQzVCO0VBQ0QsT0FBTyxJQUFJLENBQUMsUUFBUTtDQUNyQixDQUFDOzs7OztBQUtGLE9BQU8sQ0FBQyxTQUFTLENBQUMsY0FBYyxHQUFHLFNBQVMsY0FBYyxJQUFJO0VBQzVELElBQUksQ0FBQyxJQUFJLENBQUMsZUFBZSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRTtJQUNyQ0EsWUFBVSxDQUFDLCtEQUErRCxDQUFDLENBQUM7R0FDN0U7RUFDRCxPQUFPLElBQUksQ0FBQyxlQUFlO0NBQzVCLENBQUM7Ozs7O0FBS0YsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsU0FBUyxNQUFNLElBQUk7RUFDNUMsSUFBSSxJQUFJLENBQUMsRUFBRSxFQUFFO0lBQ1gsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsWUFBWTtHQUMxQztFQUNELE9BQU8sSUFBSTtDQUNaLENBQUM7O0FBRUYsT0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsU0FBUyxNQUFNLElBQUk7RUFDNUNBLFlBQVUsQ0FBQywyQ0FBMkMsQ0FBQyxDQUFDO0NBQ3pELENBQUM7Ozs7O0FBS0YsT0FBTyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUcsU0FBUyxPQUFPLElBQUk7RUFDOUNDLE1BQUksQ0FBQyxxRkFBcUYsQ0FBQyxDQUFDOztFQUU1RixJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDOztFQUUzQixJQUFJLENBQUMsT0FBTyxFQUFFO0lBQ1osT0FBTyxLQUFLO0dBQ2I7O0VBRUQsT0FBTyxPQUFPLEVBQUU7SUFDZCxJQUFJLE9BQU8sQ0FBQyxLQUFLLEtBQUssT0FBTyxDQUFDLEtBQUssQ0FBQyxVQUFVLEtBQUssUUFBUSxJQUFJLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxLQUFLLE1BQU0sQ0FBQyxFQUFFO01BQ2hHLE9BQU8sS0FBSztLQUNiO0lBQ0QsT0FBTyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUM7R0FDakM7O0VBRUQsT0FBTyxJQUFJO0NBQ1osQ0FBQzs7Ozs7QUFLRixPQUFPLENBQUMsU0FBUyxDQUFDLFlBQVksR0FBRyxTQUFTLFlBQVksRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFO0VBQ3hFQSxNQUFJLENBQUMsOEpBQThKLENBQUMsQ0FBQzs7RUFFckssSUFBSSxPQUFPLFNBQVMsS0FBSyxRQUFRLEVBQUU7SUFDakNELFlBQVUsQ0FBQyw2REFBNkQsQ0FBQyxDQUFDO0dBQzNFOztFQUVELElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxFQUFFO0lBQzdCQSxZQUFVLENBQUMseURBQXlELENBQUMsQ0FBQztHQUN2RTs7RUFFRCxPQUFPLENBQUMsRUFBRSxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxLQUFLLEtBQUssQ0FBQztDQUMxRSxDQUFDOzs7OztBQUtGLE9BQU8sQ0FBQyxTQUFTLENBQUMsUUFBUSxHQUFHLFNBQVMsUUFBUSxFQUFFLFNBQVMsRUFBRTtJQUN2RCxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUM7O0VBRXBCQyxNQUFJLENBQUMsb0pBQW9KLENBQUMsQ0FBQztFQUMzSixJQUFJLFdBQVcsR0FBRyxTQUFTLENBQUM7O0VBRTVCLElBQUksT0FBTyxXQUFXLEtBQUssUUFBUSxFQUFFO0lBQ25DRCxZQUFVLENBQUMsNENBQTRDLENBQUMsQ0FBQztHQUMxRDs7O0VBR0QsSUFBSSxJQUFJLENBQUMsRUFBRSxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxFQUFFO0lBQzVELFdBQVcsR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztHQUMzQzs7RUFFRCxJQUFJLGtCQUFrQixHQUFHLFdBQVc7S0FDakMsS0FBSyxDQUFDLEdBQUcsQ0FBQztLQUNWLEtBQUssQ0FBQyxVQUFVLE1BQU0sRUFBRSxFQUFFLE9BQU8sTUFBTSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDOztFQUVsRixPQUFPLENBQUMsRUFBRSxJQUFJLENBQUMsT0FBTyxJQUFJLGtCQUFrQixDQUFDO0NBQzlDLENBQUM7Ozs7O0FBS0YsT0FBTyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUcsU0FBUyxPQUFPLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRTtFQUN6REMsTUFBSSxDQUFDLCtJQUErSSxDQUFDLENBQUM7O0VBRXRKLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFO0lBQ3hCRCxZQUFVLENBQUMsb0RBQW9ELENBQUMsQ0FBQztHQUNsRTtFQUNELElBQUksT0FBTyxJQUFJLEtBQUssUUFBUSxFQUFFO0lBQzVCQSxZQUFVLENBQUMsbURBQW1ELENBQUMsQ0FBQztHQUNqRTs7O0VBR0QsSUFBSSxJQUFJLENBQUMsRUFBRSxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssS0FBSyxFQUFFO0lBQzNHLE9BQU8sSUFBSTtHQUNaOztFQUVELE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLEtBQUs7Q0FDdkUsQ0FBQzs7Ozs7QUFLRixPQUFPLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBRyxTQUFTLFFBQVEsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFO0VBQzVEQyxNQUFJLENBQUMsd0dBQXdHLENBQUMsQ0FBQzs7RUFFL0csSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUU7SUFDN0JELFlBQVUsQ0FBQyxxREFBcUQsQ0FBQyxDQUFDO0dBQ25FOztFQUVELElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxFQUFFO0lBQzdCQSxZQUFVLENBQUMsbURBQW1ELENBQUMsQ0FBQztHQUNqRTs7O0VBR0QsSUFBSSxTQUFTLENBQUMsU0FBUyxDQUFDLFFBQVEsS0FBSyxTQUFTLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsSUFBSSxTQUFTLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFO0lBQ3RILE9BQU8sQ0FBQyxJQUFJLENBQUMsK0ZBQStGLENBQUMsQ0FBQztHQUMvRztFQUNELElBQUksSUFBSSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7RUFDMUMsSUFBSSxXQUFXLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQzs7RUFFaEQsSUFBSSxFQUFFLElBQUksWUFBWSxPQUFPLENBQUMsRUFBRTtJQUM5QixPQUFPLEtBQUs7R0FDYjtFQUNELElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDOztFQUVwRCxXQUFXLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLEtBQUssQ0FBQzs7RUFFakMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsa0JBQWtCLEtBQUssSUFBSSxDQUFDLEVBQUUsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUU7O0lBRS9ELElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDO0lBQzdDLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO0dBQzlDOztFQUVELElBQUksT0FBTyxHQUFHLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7RUFDM0QsSUFBSSxhQUFhLEdBQUcsTUFBTSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO0VBQzdELE9BQU8sQ0FBQyxFQUFFLE9BQU8sSUFBSSxhQUFhLElBQUksT0FBTyxLQUFLLGFBQWEsQ0FBQztDQUNqRSxDQUFDOzs7OztBQUtGLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxHQUFHLFNBQVMsT0FBTyxFQUFFLFFBQVEsRUFBRTtFQUNuRCxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7RUFDOUQsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtJQUN0QixJQUFJLFFBQVEsQ0FBQyxHQUFHLEVBQUU7TUFDaEIsT0FBTyxJQUFJLFlBQVksRUFBRSxRQUFRLElBQUksUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksRUFBRTtLQUM1RDtJQUNELE9BQU8sSUFBSSxZQUFZLENBQUMsT0FBTyxRQUFRLEtBQUssUUFBUSxHQUFHLFFBQVEsR0FBRyxXQUFXLENBQUM7R0FDL0U7RUFDRCxPQUFPLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQztDQUM3QyxDQUFDOzs7OztBQUtGLE9BQU8sQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFHLFNBQVMsU0FBUyxFQUFFLFFBQVEsRUFBRTtJQUN0RCxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUM7O0VBRXBCLHNCQUFzQixDQUFDLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FBQztFQUM1QyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7RUFDOUQsSUFBSSxRQUFRLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFVLElBQUksRUFBRSxFQUFFLE9BQU8sYUFBYSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRTtHQUN2RixDQUFDO0VBQ0YsT0FBTyxJQUFJLFlBQVksQ0FBQyxRQUFRLENBQUM7Q0FDbEMsQ0FBQzs7Ozs7QUFLRixPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksR0FBRyxTQUFTLElBQUksSUFBSTtFQUN4QyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUztDQUM5QixDQUFDOzs7OztBQUtGLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFBRSxHQUFHLFNBQVMsRUFBRSxFQUFFLFFBQVEsRUFBRTtFQUM1QyxJQUFJLFlBQVksR0FBRyxzQkFBc0IsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7O0VBRTFELElBQUksWUFBWSxLQUFLLGFBQWEsRUFBRTtJQUNsQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRTtNQUNaLE9BQU8sS0FBSztLQUNiO0lBQ0QsT0FBTyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUM7R0FDakQ7O0VBRUQsSUFBSSxZQUFZLEtBQUssa0JBQWtCLEVBQUU7SUFDdkMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUU7TUFDWixPQUFPLEtBQUs7S0FDYjtJQUNELElBQUksUUFBUSxDQUFDLFVBQVUsRUFBRTtNQUN2QixPQUFPLCtCQUErQixDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxLQUFLLENBQUM7S0FDdkU7SUFDRCxPQUFPLHFCQUFxQixDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsUUFBUSxDQUFDO0dBQ2hEOztFQUVELElBQUksWUFBWSxLQUFLLFlBQVksRUFBRTtJQUNqQ0EsWUFBVSxDQUFDLGtEQUFrRCxDQUFDLENBQUM7R0FDaEU7O0VBRUQsSUFBSSxPQUFPLFFBQVEsS0FBSyxRQUFRLEVBQUU7SUFDaEMsT0FBTyxLQUFLO0dBQ2I7O0VBRUQsT0FBTyxDQUFDLEVBQUUsSUFBSSxDQUFDLE9BQU87RUFDdEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZO0VBQ3pCLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0NBQ2hDLENBQUM7Ozs7O0FBS0YsT0FBTyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUcsU0FBUyxPQUFPLElBQUk7RUFDOUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUU7SUFDZixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxLQUFLLEVBQUU7R0FDckM7RUFDRCxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFO0lBQ3ZCLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLFVBQVUsS0FBSyxFQUFFLEVBQUUsT0FBTyxLQUFLLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQztHQUMvRTtFQUNELE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQU0sS0FBSyxDQUFDO0NBQzdFLENBQUM7Ozs7O0FBS0YsT0FBTyxDQUFDLFNBQVMsQ0FBQyxTQUFTLEdBQUcsU0FBUyxTQUFTLElBQUk7RUFDbEQsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQzs7RUFFM0IsSUFBSSxDQUFDLE9BQU8sRUFBRTtJQUNaLE9BQU8sS0FBSztHQUNiOztFQUVELE9BQU8sT0FBTyxFQUFFO0lBQ2QsSUFBSSxPQUFPLENBQUMsS0FBSyxLQUFLLE9BQU8sQ0FBQyxLQUFLLENBQUMsVUFBVSxLQUFLLFFBQVEsSUFBSSxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sS0FBSyxNQUFNLENBQUMsRUFBRTtNQUNoRyxPQUFPLEtBQUs7S0FDYjtJQUNELE9BQU8sR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDO0dBQ2pDOztFQUVELE9BQU8sSUFBSTtDQUNaLENBQUM7Ozs7O0FBS0YsT0FBTyxDQUFDLFNBQVMsQ0FBQyxhQUFhLEdBQUcsU0FBUyxhQUFhLElBQUk7RUFDMUQsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWM7Q0FDN0IsQ0FBQzs7Ozs7QUFLRixPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksR0FBRyxTQUFTLElBQUksSUFBSTtFQUN4QyxJQUFJLElBQUksQ0FBQyxFQUFFLEVBQUU7SUFDWCxPQUFPLElBQUksQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUk7R0FDN0I7O0VBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUU7SUFDZixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTztHQUM1Qjs7RUFFRCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRztDQUN0QixDQUFDOzs7OztBQUtGLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLFNBQVMsS0FBSyxJQUFJO0VBQzFDLElBQUksSUFBSSxDQUFDLHFCQUFxQixFQUFFO0lBQzlCQSxZQUFVLENBQUMscUVBQXFFLENBQUMsQ0FBQztHQUNuRjtFQUNELElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFO0lBQ1pBLFlBQVUsQ0FBQyxrREFBa0QsQ0FBQyxDQUFDO0dBQ2hFOztFQUVELElBQUksTUFBTSxDQUFDO0VBQ1gsSUFBSSxJQUFJLENBQUMsRUFBRSxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRTtJQUM3RCxNQUFNLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDO0dBQ3JDLE1BQU07O0lBRUwsTUFBTSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDO0dBQ3pCO0VBQ0QsT0FBTyxNQUFNLElBQUksRUFBRTtDQUNwQixDQUFDOzs7OztBQUtGLE9BQU8sQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFHLFNBQVMsT0FBTyxFQUFFLElBQUksRUFBRTtJQUNoRCxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUM7O0VBRXBCLElBQUksSUFBSSxDQUFDLHFCQUFxQixFQUFFO0lBQzlCQSxZQUFVLENBQUMsNkRBQTZELENBQUMsQ0FBQztHQUMzRTs7RUFFRCxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRTtJQUNaQSxZQUFVLENBQUMsd0RBQXdELENBQUMsQ0FBQztHQUN0RTs7RUFFRCxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEdBQUcsRUFBRTs7SUFFdkMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0dBQzdDLENBQUMsQ0FBQztDQUNKLENBQUM7Ozs7O0FBS0YsT0FBTyxDQUFDLFNBQVMsQ0FBQyxXQUFXLEdBQUcsU0FBUyxXQUFXLEVBQUUsUUFBUSxFQUFFO0lBQzVELElBQUksTUFBTSxHQUFHLElBQUksQ0FBQzs7RUFFcEIsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUU7SUFDeEJBLFlBQVUsQ0FBQyw0REFBNEQsQ0FBQyxDQUFDO0dBQzFFOztFQUVEQyxNQUFJLENBQUMsb0tBQW9LLENBQUMsQ0FBQzs7RUFFM0ssTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxHQUFHLEVBQUU7SUFDM0MsSUFBSSxNQUFNLENBQUMsT0FBTyxHQUFHLEdBQUcsRUFBRTs7TUFFeEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLEVBQUU7UUFDckNELFlBQVUsRUFBRSxvSEFBb0gsR0FBRyxHQUFHLEdBQUcscUNBQXFDLEVBQUUsQ0FBQztPQUNsTDs7TUFFRCxNQUFNLENBQUMsRUFBRSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7O01BRXZELE1BQU0sQ0FBQyxFQUFFLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxHQUFHLFlBQVksRUFBRSxPQUFPLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUM7S0FDakYsTUFBTTtNQUNMLElBQUksT0FBTyxHQUFHLEtBQUssQ0FBQzs7TUFFcEIsTUFBTSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFVBQVUsT0FBTyxFQUFFO1FBQzdDLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLElBQUksR0FBRyxJQUFJLE9BQU8sQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUU7VUFDbkUsT0FBTyxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7VUFDekYsTUFBTSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxZQUFZLEVBQUUsT0FBTyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7VUFDN0csT0FBTyxHQUFHLElBQUksQ0FBQztTQUNoQjtPQUNGLENBQUMsQ0FBQzs7O01BR0gsSUFBSSxDQUFDLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFO1FBQ3pGQSxZQUFVLEVBQUUsb0hBQW9ILEdBQUcsR0FBRyxHQUFHLHFDQUFxQyxFQUFFLENBQUM7T0FDbEw7O01BRUQsTUFBTSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFVBQVUsT0FBTyxFQUFFO1FBQzdDLElBQUksT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssR0FBRyxFQUFFO1VBQy9CLE9BQU8sQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1VBQzlCLE9BQU8sQ0FBQyxNQUFNLEdBQUcsWUFBWSxFQUFFLE9BQU8sUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQztTQUN4RDtPQUNGLENBQUMsQ0FBQztLQUNKO0dBQ0YsQ0FBQyxDQUFDOztFQUVILElBQUksQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxVQUFVLE9BQU8sRUFBRTtJQUMzQyxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUM7R0FDZixDQUFDLENBQUM7Q0FDSixDQUFDOzs7OztBQUtGLE9BQU8sQ0FBQyxTQUFTLENBQUMsVUFBVSxHQUFHLFNBQVMsVUFBVSxFQUFFLE9BQU8sRUFBRTtJQUN6RCxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUM7O0VBRXBCLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFO0lBQ3hCQSxZQUFVLENBQUMsMkRBQTJELENBQUMsQ0FBQztHQUN6RTtFQUNELE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsR0FBRyxFQUFFOztJQUUxQyxNQUFNLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQzs7SUFFOUIsTUFBTSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztHQUNoRCxDQUFDLENBQUM7Q0FDSixDQUFDOzs7OztBQUtGLE9BQU8sQ0FBQyxTQUFTLENBQUMsUUFBUSxHQUFHLFNBQVMsUUFBUSxFQUFFLElBQUksRUFBRTtJQUNsRCxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUM7O0VBRXBCLElBQUksSUFBSSxDQUFDLHFCQUFxQixFQUFFO0lBQzlCQSxZQUFVLENBQUMsOERBQThELENBQUMsQ0FBQztHQUM1RTtFQUNELElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRTtJQUNwQ0EsWUFBVSxDQUFDLHlEQUF5RCxDQUFDLENBQUM7R0FDdkU7RUFDRCxJQUFJLElBQUksQ0FBQyxFQUFFLElBQUksSUFBSSxDQUFDLEVBQUUsQ0FBQyxRQUFRLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUU7SUFDOUQsSUFBSSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztHQUNqQztFQUNELE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsR0FBRyxFQUFFOzs7SUFHdkMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLFNBQVMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEVBQUU7TUFDaEZBLFlBQVUsRUFBRSxpQ0FBaUMsR0FBRyxHQUFHLEdBQUcsNkNBQTZDLEVBQUUsQ0FBQztLQUN2Rzs7O0lBR0QsSUFBSSxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRTtNQUNwQixNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7O01BRWxDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQzs7TUFFbEMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUMvQyxNQUFNOztNQUVMLE1BQU0sQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDOztNQUUzQixNQUFNLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQy9DO0dBQ0YsQ0FBQyxDQUFDOzs7RUFHSCxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDO0NBQzdCLENBQUM7Ozs7O0FBS0YsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEdBQUcsU0FBUyxJQUFJLElBQUk7RUFDeEMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7SUFDakJBLFlBQVUsQ0FBQyw0REFBNEQsQ0FBQyxDQUFDO0dBQzFFOztFQUVELE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFO0NBQ3ZDLENBQUM7Ozs7O0FBS0YsT0FBTyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUcsU0FBUyxPQUFPLElBQUk7RUFDOUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUU7SUFDeEJBLFlBQVUsQ0FBQyx3REFBd0QsQ0FBQyxDQUFDO0dBQ3RFOztFQUVELElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUU7SUFDM0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztHQUNuRDs7RUFFRCxJQUFJLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDO0NBQ3BCLENBQUM7Ozs7O0FBS0YsT0FBTyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUcsU0FBUyxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRTtJQUN6RCxLQUFLLE9BQU8sS0FBSyxLQUFLLENBQUMsS0FBRyxPQUFPLEdBQUcsRUFBRSxHQUFDOztFQUV6QyxJQUFJLE9BQU8sSUFBSSxLQUFLLFFBQVEsRUFBRTtJQUM1QkEsWUFBVSxDQUFDLDJDQUEyQyxDQUFDLENBQUM7R0FDekQ7O0VBRUQsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7SUFDakJBLFlBQVUsQ0FBQywrREFBK0QsQ0FBQyxDQUFDO0dBQzdFOztFQUVELElBQUksT0FBTyxDQUFDLE1BQU0sRUFBRTtJQUNsQkEsWUFBVSxDQUFDLDhKQUE4SixDQUFDLENBQUM7R0FDNUs7OztFQUdELElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLFFBQVEsRUFBRTtJQUM5QixNQUFNO0dBQ1A7O0VBRUQsSUFBSSxTQUFTLEdBQUc7SUFDZCxLQUFLLEVBQUUsRUFBRTtJQUNULEdBQUcsRUFBRSxDQUFDO0lBQ04sTUFBTSxFQUFFLEVBQUU7SUFDVixHQUFHLEVBQUUsRUFBRTtJQUNQLEtBQUssRUFBRSxFQUFFO0lBQ1QsRUFBRSxFQUFFLEVBQUU7SUFDTixJQUFJLEVBQUUsRUFBRTtJQUNSLElBQUksRUFBRSxFQUFFO0lBQ1IsS0FBSyxFQUFFLEVBQUU7SUFDVCxHQUFHLEVBQUUsRUFBRTtJQUNQLElBQUksRUFBRSxFQUFFO0lBQ1IsU0FBUyxFQUFFLENBQUM7SUFDWixNQUFNLEVBQUUsRUFBRTtJQUNWLE1BQU0sRUFBRSxFQUFFO0lBQ1YsUUFBUSxFQUFFLEVBQUU7R0FDYixDQUFDOztFQUVGLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7O0VBRTVCLElBQUksV0FBVyxDQUFDOzs7RUFHaEIsSUFBSSxRQUFRLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxVQUFVLEVBQUU7SUFDeEMsV0FBVyxHQUFHLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUU7TUFDdkMsT0FBTyxFQUFFLElBQUk7TUFDYixVQUFVLEVBQUUsSUFBSTtLQUNqQixDQUFDLENBQUM7R0FDSixNQUFNO0lBQ0wsV0FBVyxHQUFHLFFBQVEsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDNUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0dBQzdDOztFQUVELElBQUksT0FBTyxFQUFFO0lBQ1gsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxHQUFHLEVBQUU7O01BRTFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDakMsQ0FBQyxDQUFDO0dBQ0o7O0VBRUQsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTs7SUFFdEIsV0FBVyxDQUFDLE9BQU8sR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FDM0M7O0VBRUQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLENBQUM7RUFDeEMsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO0lBQ2QsYUFBYSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7R0FDcEQ7Q0FDRixDQUFDOztBQUVGLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLFNBQVMsTUFBTSxJQUFJO0VBQzVDQyxNQUFJLENBQUMseUZBQXlGLENBQUMsQ0FBQztDQUNqRyxDQUFDOztBQUVGLFNBQVMsV0FBVyxFQUFFLEdBQUcsRUFBRTtFQUN6QixHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztDQUNsQzs7QUFFRCxTQUFTLGNBQWMsRUFBRSxPQUFPLEVBQUU7RUFDaEMsSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLElBQUksRUFBRTtJQUN6QixNQUFNO0dBQ1A7RUFDRCxPQUFPLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztFQUNwQixPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztDQUNuQzs7QUFFRCxTQUFTLGlCQUFpQixFQUFFLEVBQUUsRUFBRTtFQUM5QixJQUFJLEVBQUUsQ0FBQyxTQUFTLEVBQUU7SUFDaEIsRUFBRSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7R0FDdEM7O0VBRUQsSUFBSSxFQUFFLENBQUMsaUJBQWlCLEVBQUU7SUFDeEIsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxlQUFlLEVBQUU7TUFDbkUsY0FBYyxDQUFDLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO0tBQ3ZELENBQUMsQ0FBQztHQUNKOztFQUVELGNBQWMsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUM7O0VBRTVCLEVBQUUsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7Q0FDekM7Ozs7QUFJRCxJQUFJLFVBQVUsSUFBSSxVQUFVLFVBQVUsRUFBRTtFQUN0QyxTQUFTLFVBQVUsRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFO0lBQ2hDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7OztJQUcxQyxNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxPQUFPLEdBQUc7TUFDcEMsR0FBRyxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRTtNQUN0QyxHQUFHLEVBQUUsWUFBWSxFQUFFO0tBQ3BCLEVBQUUsQ0FBQzs7SUFFSixNQUFNLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxTQUFTLEdBQUc7TUFDdEMsR0FBRyxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRTtNQUNuQyxHQUFHLEVBQUUsWUFBWSxFQUFFO0tBQ3BCLEVBQUUsQ0FBQztJQUNKLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO0lBQ2IsSUFBSSxPQUFPLENBQUMsSUFBSSxFQUFFO01BQ2hCLGlCQUFpQixDQUFDLEVBQUUsQ0FBQyxDQUFDO01BQ3RCLGFBQWEsQ0FBQyxFQUFFLENBQUMsQ0FBQztLQUNuQjtJQUNELElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO0lBQzNCLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDLHNCQUFzQixDQUFDO0lBQ2hFLElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDLFNBQVMsQ0FBQztJQUM3QixJQUFJLENBQUMsZUFBZSxHQUFHLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQztHQUM1Qzs7RUFFRCxLQUFLLFVBQVUsS0FBRyxVQUFVLENBQUMsU0FBUyxHQUFHLFVBQVUsR0FBQztFQUNwRCxVQUFVLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsVUFBVSxJQUFJLFVBQVUsQ0FBQyxTQUFTLEVBQUUsQ0FBQztFQUMzRSxVQUFVLENBQUMsU0FBUyxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUM7O0VBRTlDLE9BQU8sVUFBVSxDQUFDO0NBQ25CLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQzs7OztBQUlaLFNBQVNVLGFBQVcsRUFBRSxJQUFJLEVBQUU7RUFDMUIsT0FBTyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLElBQUksS0FBSyxJQUFJLElBQUksT0FBTyxJQUFJLEtBQUssUUFBUSxDQUFDLElBQUksT0FBTyxJQUFJLEtBQUssUUFBUTtDQUN0Rzs7QUFFRCxTQUFTQyxlQUFhLEVBQUUsS0FBSyxFQUFFO0VBQzdCLEtBQUssSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEdBQUcsRUFBRTtJQUNqRCxJQUFJLENBQUNELGFBQVcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtNQUM1QlgsWUFBVSxDQUFDLGtFQUFrRSxDQUFDLENBQUM7S0FDaEY7O0lBRUQsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO01BQzdCLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxTQUFTLEVBQUU7UUFDdEMsSUFBSSxDQUFDVyxhQUFXLENBQUMsU0FBUyxDQUFDLEVBQUU7VUFDM0JYLFlBQVUsQ0FBQyxrRUFBa0UsQ0FBQyxDQUFDO1NBQ2hGO09BQ0YsQ0FBQyxDQUFDO0tBQ0o7R0FDRixDQUFDLENBQUM7Q0FDSjs7OztBQUlELFNBQVNhLGFBQVcsRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRTtFQUM3QyxJQUFJLElBQUksQ0FBQztFQUNULElBQUksT0FBTyxTQUFTLEtBQUssUUFBUSxFQUFFO0lBQ2pDLElBQUksQ0FBQ0MsNEJBQW1CLENBQUMsa0JBQWtCLEVBQUU7TUFDM0NkLFlBQVUsQ0FBQyw2R0FBNkcsQ0FBQyxDQUFDO0tBQzNIO0lBQ0QsSUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLEVBQUU7TUFDbERBLFlBQVUsQ0FBQyxvR0FBb0csQ0FBQyxDQUFDO0tBQ2xIO0lBQ0QsSUFBSSxTQUFTLEdBQUcsSUFBSSxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDdkMsSUFBSSxTQUFTLEdBQUcsU0FBUyxDQUFDLGVBQWUsQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDbEUsSUFBSSxVQUFVLEdBQUcsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ2xDLElBQUksVUFBVSxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxVQUFVLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksU0FBUyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsS0FBSyxDQUFDLEVBQUU7TUFDaEgsSUFBSSxHQUFHLEVBQUUsQ0FBQyxjQUFjLENBQUNjLDRCQUFtQixDQUFDLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7S0FDN0UsTUFBTTtNQUNMLElBQUksY0FBYyxHQUFHQSw0QkFBbUIsQ0FBQyxrQkFBa0IsRUFBRSxPQUFPLEdBQUcsU0FBUyxHQUFHLGFBQWEsRUFBRSxDQUFDO01BQ25HLElBQUksZ0JBQWdCLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDO01BQ2hFLEVBQUUsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLGVBQWUsR0FBRyxjQUFjLENBQUMsZUFBZSxDQUFDO01BQzFFLElBQUksR0FBRyxjQUFjLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsWUFBWSxFQUFFLEVBQUUsQ0FBQyxjQUFjLENBQUMsQ0FBQyxRQUFRLENBQUM7TUFDL0UsRUFBRSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsZUFBZSxHQUFHLGdCQUFnQixDQUFDO0tBQzdEO0dBQ0YsTUFBTTtJQUNMLElBQUksR0FBRyxFQUFFLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0dBQ3JDO0VBQ0QsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO0lBQ3ZCLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUU7TUFDdEMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztLQUN6RCxNQUFNO01BQ0wsRUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxDQUFDO0tBQ3pDO0dBQ0YsTUFBTTtJQUNMLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUU7TUFDdEMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDaEMsTUFBTTtNQUNMLEVBQUUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUM5QjtHQUNGO0NBQ0Y7O0FBRUQsU0FBU0MsVUFBUSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUU7RUFDNUJILGVBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztFQUNyQixNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEdBQUcsRUFBRTtJQUN4QyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7TUFDN0IsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLFNBQVMsRUFBRTtRQUN0Q0MsYUFBVyxDQUFDLEVBQUUsRUFBRSxHQUFHLEVBQUUsU0FBUyxDQUFDLENBQUM7T0FDakMsQ0FBQyxDQUFDO0tBQ0osTUFBTTtNQUNMQSxhQUFXLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztLQUNsQztHQUNGLENBQUMsQ0FBQztDQUNKOzs7O0FBSUQsU0FBU0csZ0JBQWMsRUFBRSxFQUFFLEVBQUUsV0FBVyxFQUFFO0VBQ3hDLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsR0FBRyxFQUFFO0lBQzlDLElBQUksUUFBUSxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUN2QyxJQUFJLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLFdBQVcsRUFBRTtNQUN6Q2hCLFlBQVUsQ0FBQyw2RUFBNkUsQ0FBQyxDQUFDO0tBQzNGO0lBQ0QsSUFBSSxTQUFTLEdBQUcsSUFBSSxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDdkMsSUFBSSxTQUFTLEdBQUcsU0FBUyxDQUFDLGVBQWUsQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDakUsRUFBRSxDQUFDLDBCQUEwQixDQUFDLEdBQUcsQ0FBQyxHQUFHYyw0QkFBbUIsQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLENBQUM7SUFDN0YsRUFBRSxDQUFDLHlCQUF5QixDQUFDLEdBQUcsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsQ0FBQztHQUMxRixDQUFDLENBQUM7Q0FDSjs7OztBQUlELFNBQVNHLFVBQVEsRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLEVBQUU7RUFDM0MsTUFBTSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEdBQUcsRUFBRTtJQUNuRCxJQUFJO01BQ0YsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsR0FBRyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUMvQyxDQUFDLE9BQU8sQ0FBQyxFQUFFO01BQ1ZoQixNQUFJLEVBQUUsK0JBQStCLEdBQUcsR0FBRyxHQUFHLG9GQUFvRixFQUFFLENBQUM7S0FDdEk7SUFDRFIsS0FBRyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0dBQzdELENBQUMsQ0FBQztDQUNKOztBQUVELFNBQVN5QixVQUFRLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRTtFQUM1QixJQUFJLGNBQWMsR0FBR3pCLEtBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO0VBQ3ZDQSxLQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7RUFDekIsSUFBSSxLQUFLLEVBQUU7SUFDVCxFQUFFLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztHQUNuQixNQUFNO0lBQ0wsRUFBRSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7R0FDaEI7RUFDREEsS0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsY0FBYyxDQUFDO0NBQ3BDOztBQUVELFNBQVMwQixjQUFZLEVBQUUsRUFBRSxFQUFFLFNBQVMsRUFBRTtFQUNwQyxJQUFJLGNBQWMsR0FBRzFCLEtBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO0VBQ3ZDQSxLQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7RUFDekIsSUFBSSxTQUFTLEVBQUU7SUFDYixFQUFFLENBQUMsVUFBVSxHQUFHLFNBQVMsQ0FBQztHQUMzQixNQUFNO0lBQ0wsRUFBRSxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUM7R0FDcEI7RUFDREEsS0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsY0FBYyxDQUFDO0NBQ3BDOztBQUVELFNBQVMyQixZQUFVLEVBQUUsU0FBUyxFQUFFLGFBQWEsRUFBRSxPQUFPLEVBQUU7RUFDdEQsSUFBSSxPQUFPLEdBQUcsT0FBTyxhQUFhLEtBQUssVUFBVTtNQUM3QyxhQUFhO01BQ2IsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsYUFBYSxDQUFDLENBQUM7O0VBRXJDLE9BQU8sQ0FBQyxZQUFZLEdBQUcsU0FBUyx1QkFBdUIsSUFBSTtJQUN6RCxJQUFJLENBQUMsU0FBUyxHQUFHLE9BQU8sT0FBTyxLQUFLLFVBQVU7UUFDMUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDbEIsT0FBTyxDQUFDO0dBQ2IsQ0FBQztDQUNIOzs7O0FBSUQsU0FBU0MsV0FBUyxFQUFFLEVBQUUsRUFBRSxPQUFPLEVBQUUsY0FBYyxFQUFFO0VBQy9DLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUM7RUFDcEIsRUFBRSxDQUFDLEtBQUssR0FBRyxVQUFVLElBQUksRUFBRTs7O0lBQ3pCLElBQUksSUFBSSxHQUFHLEVBQUUsRUFBRSxHQUFHLEdBQUcsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7SUFDMUMsUUFBUSxHQUFHLEVBQUUsR0FBRyxDQUFDLEtBQUcsSUFBSSxFQUFFLEdBQUcsRUFBRSxHQUFHQyxXQUFTLEVBQUUsR0FBRyxHQUFHLENBQUMsRUFBRSxHQUFDOztJQUV2RCxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ25ELGNBQWMsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQ2hELE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQztHQUMxRCxDQUFDO0NBQ0g7O0FBRUQsU0FBU0MsZ0JBQWMsRUFBRSxHQUFHLEVBQUU7RUFDNUIsR0FBRyxDQUFDLEtBQUssQ0FBQztJQUNSLFlBQVksRUFBRSxZQUFZO01BQ3hCLElBQUksQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztNQUNyQyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsRUFBRSxDQUFDO01BQzNCRixXQUFTLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7S0FDeEQ7R0FDRixDQUFDLENBQUM7Q0FDSjs7OztBQUlELFNBQVN6QixpQkFBZSxFQUFFLFNBQVMsRUFBRTtFQUNuQyxJQUFJLFNBQVMsQ0FBQyxVQUFVLEVBQUU7SUFDeEIsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFO01BQ3JELElBQUksR0FBRyxHQUFHLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7TUFDbEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUU7UUFDZkEsaUJBQWUsQ0FBQyxHQUFHLENBQUMsQ0FBQztPQUN0QjtLQUNGLENBQUMsQ0FBQztHQUNKO0VBQ0QsSUFBSSxTQUFTLENBQUMsT0FBTyxFQUFFO0lBQ3JCQSxpQkFBZSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztHQUNwQztFQUNELElBQUksU0FBUyxDQUFDLFFBQVEsRUFBRTtJQUN0QixNQUFNLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRWtCLDRCQUFtQixDQUFDLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0dBQ3RGO0NBQ0Y7Ozs7QUFJRCxTQUFTVSxrQkFBZ0IsRUFBRSxJQUFJLEVBQUU7RUFDL0IsT0FBTyxJQUFJLEtBQUssSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUM7Q0FDOUQ7O0FBRUQsU0FBU0MsYUFBVyxFQUFFLElBQUksRUFBRTtFQUMxQixPQUFPLENBQUMsQ0FBQyxJQUFJO01BQ1QsT0FBTyxJQUFJLEtBQUssUUFBUTtPQUN2QixJQUFJLEtBQUssSUFBSSxDQUFDO09BQ2RELGtCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDO0NBQzdCOztBQUVELFNBQVNFLHFCQUFtQixFQUFFLElBQUksRUFBRTtFQUNsQyxPQUFPLElBQUksS0FBSyxXQUFXLElBQUksSUFBSSxLQUFLLFlBQVksSUFBSSxJQUFJLEtBQUssaUJBQWlCO0NBQ25GOztBQUVELFNBQVNDLG1CQUFpQixFQUFFLFNBQVMsRUFBRTtFQUNyQyxPQUFPO0lBQ0wsS0FBSyxFQUFFLFNBQVMsQ0FBQyxLQUFLO0lBQ3RCLElBQUksRUFBRSxTQUFTLENBQUMsSUFBSTtJQUNwQixFQUFFLEVBQUUsU0FBUyxDQUFDLEVBQUU7SUFDaEIsR0FBRyxFQUFFLFNBQVMsQ0FBQyxHQUFHO0lBQ2xCLEdBQUcsRUFBRSxTQUFTLENBQUMsR0FBRztJQUNsQixLQUFLLEVBQUUsU0FBUyxDQUFDLEtBQUs7SUFDdEIsUUFBUSxFQUFFLFNBQVMsQ0FBQyxRQUFRO0lBQzVCLEtBQUssRUFBRSxTQUFTLENBQUMsS0FBSztJQUN0QixXQUFXLEVBQUUsU0FBUyxDQUFDLFdBQVc7SUFDbEMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxXQUFXO0lBQ2xDLEtBQUssRUFBRSxTQUFTLENBQUMsS0FBSztJQUN0QixlQUFlLEVBQUUsU0FBUyxDQUFDLGVBQWU7SUFDMUMsUUFBUSxFQUFFLFNBQVMsQ0FBQyxRQUFRO0lBQzVCLFVBQVUsRUFBRSxTQUFTLENBQUMsVUFBVTtHQUNqQztDQUNGO0FBQ0QsU0FBU0Msc0JBQW9CLEVBQUUsY0FBYyxFQUFFLGlCQUFpQixFQUFFO0VBQ2hFLElBQUksQ0FBQ2QsNEJBQW1CLENBQUMsa0JBQWtCLEVBQUU7SUFDM0NkLFlBQVUsQ0FBQyw2R0FBNkcsQ0FBQyxDQUFDO0dBQzNIOztFQUVELElBQUksY0FBYyxDQUFDLE9BQU8sQ0FBQ00sV0FBUyxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO0VBQ3BFLGNBQWMsQ0FBQyxPQUFPLENBQUNGLFlBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztFQUNqRSxjQUFjLENBQUMsT0FBTyxDQUFDRCxVQUFRLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtJQUMvREgsWUFBVSxDQUFDLGtEQUFrRCxDQUFDLENBQUM7R0FDaEU7O0VBRUQsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRTJCLG1CQUFpQixDQUFDLGlCQUFpQixDQUFDO0lBQzNEYiw0QkFBbUIsQ0FBQyxrQkFBa0IsQ0FBQyxjQUFjLENBQUMsQ0FBQztDQUMxRDs7QUFFRCxTQUFTZSxpQkFBZSxFQUFFLGlCQUFpQixFQUFFO0VBQzNDLE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUVGLG1CQUFpQixDQUFDLGlCQUFpQixDQUFDO0lBQzNELENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7Q0FDNUM7O0FBRUQsU0FBU0csc0JBQW9CLEVBQUUsa0JBQWtCLEVBQUUsS0FBSyxFQUFFO0VBQ3hELEtBQUssa0JBQWtCLEtBQUssS0FBSyxDQUFDLEtBQUcsa0JBQWtCLEdBQUcsRUFBRSxHQUFDOztFQUU3RCxJQUFJLFVBQVUsR0FBRyxFQUFFLENBQUM7RUFDcEIsSUFBSSxDQUFDLEtBQUssRUFBRTtJQUNWLE9BQU8sVUFBVTtHQUNsQjtFQUNELElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtJQUN4QixLQUFLLENBQUMsT0FBTyxDQUFDLFVBQVUsSUFBSSxFQUFFO01BQzVCLElBQUksSUFBSSxLQUFLLEtBQUssRUFBRTtRQUNsQixNQUFNO09BQ1A7O01BRUQsSUFBSSxPQUFPLElBQUksS0FBSyxRQUFRLEVBQUU7UUFDNUI5QixZQUFVLENBQUMsc0RBQXNELENBQUMsQ0FBQztPQUNwRTtNQUNELFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRzZCLGlCQUFlLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDeEMsQ0FBQyxDQUFDO0dBQ0osTUFBTTtJQUNMLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsSUFBSSxFQUFFO01BQ3pDLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLEtBQUssRUFBRTtRQUN6QixNQUFNO09BQ1A7TUFDRCxJQUFJLENBQUNKLGFBQVcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRTtRQUM3QnpCLFlBQVUsQ0FBQywwREFBMEQsQ0FBQyxDQUFDO09BQ3hFO01BQ0QsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSSxFQUFFO1FBQ3hCLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRzZCLGlCQUFlLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDdkMsTUFBTTtPQUNQOztNQUVELElBQUlyQix5QkFBdUIsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRTtRQUN4Q1osaUJBQWUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztPQUM5Qjs7TUFFRCxJQUFJLGtCQUFrQixDQUFDLElBQUksQ0FBQyxFQUFFOztRQUU1QixPQUFPLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUN0QyxJQUFJLE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLFFBQVEsRUFBRTtVQUNuQyxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUdnQyxzQkFBb0IsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztTQUNoRixNQUFNO1VBQ0wsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUM7WUFDOUMsQ0FBQyxJQUFJLEVBQUUsa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztTQUMxQztPQUNGLE1BQU07UUFDTCxJQUFJLE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLFFBQVEsRUFBRTtVQUNuQyxJQUFJLENBQUNkLDRCQUFtQixDQUFDLGtCQUFrQixFQUFFO1lBQzNDZCxZQUFVLENBQUMsNkdBQTZHLENBQUMsQ0FBQztXQUMzSDtVQUNELFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRWMsNEJBQW1CLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUMzRixNQUFNO1VBQ0wsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1NBQ25EO09BQ0Y7O01BRUQsSUFBSXJCLEtBQUcsQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFO1FBQzlCQSxLQUFHLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7T0FDdkM7S0FDRixDQUFDLENBQUM7R0FDSjtFQUNELE9BQU8sVUFBVTtDQUNsQjs7QUFFRCxTQUFTc0MsZ0JBQWMsRUFBRSxVQUFVLEVBQUUsaUJBQWlCLEVBQUU7RUFDdEQsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxTQUFTLEVBQUU7O0lBRW5ELE9BQU8sVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEtBQUssQ0FBQztJQUNuQyxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLElBQUksRUFBRTtNQUMvQixVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsSUFBSSxHQUFHLFNBQVMsQ0FBQztLQUN4QztJQUNELGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxHQUFHRixpQkFBZSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDOzs7SUFHdEUsSUFBSXBDLEtBQUcsQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFO01BQzlCQSxLQUFHLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7S0FDNUM7R0FDRixDQUFDLENBQUM7Q0FDSjs7QUFFRCxTQUFTdUMsNEJBQTBCLEVBQUUsU0FBUyxFQUFFO0VBQzlDLElBQUksaUJBQWlCLEdBQUcsRUFBRSxDQUFDOztFQUUzQixJQUFJLFNBQVMsQ0FBQyxVQUFVLEVBQUU7SUFDeEJELGdCQUFjLENBQUMsU0FBUyxDQUFDLFVBQVUsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO0dBQ3pEOztFQUVELElBQUksUUFBUSxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUM7OztFQUdqQyxPQUFPLFFBQVEsRUFBRTtJQUNmLElBQUksUUFBUSxDQUFDLFVBQVUsRUFBRTtNQUN2QkEsZ0JBQWMsQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLGlCQUFpQixDQUFDLENBQUM7S0FDeEQ7SUFDRCxRQUFRLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQztHQUM3Qjs7RUFFRCxJQUFJLFNBQVMsQ0FBQyxhQUFhLElBQUksU0FBUyxDQUFDLGFBQWEsQ0FBQyxVQUFVLEVBQUU7SUFDakVBLGdCQUFjLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxVQUFVLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztHQUN2RTs7RUFFRCxPQUFPLGlCQUFpQjtDQUN6Qjs7QUFFRCxTQUFTRSxnQ0FBOEIsRUFBRSxRQUFRLEVBQUU7RUFDakQsSUFBSSxVQUFVLEdBQUcsRUFBRSxDQUFDO0VBQ3BCLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQUU7SUFDNUQsSUFBSVAscUJBQW1CLENBQUMsQ0FBQyxDQUFDLEVBQUU7TUFDMUIsTUFBTTtLQUNQOztJQUVELFVBQVUsQ0FBQyxDQUFDLENBQUMsR0FBR0csaUJBQWUsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2hFLE9BQU8sUUFBUSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0lBQzVDLE9BQU8sVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztHQUM1QixDQUFDLENBQUM7RUFDSCxPQUFPLFVBQVU7Q0FDbEI7Ozs7QUFJRCxTQUFTSyxtQkFBaUIsRUFBRSxTQUFTLEVBQUU7RUFDckMsSUFBSSxTQUFTLENBQUMsVUFBVSxFQUFFO0lBQ3hCLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsRUFBRTtNQUNyRCxJQUFJLEdBQUcsR0FBRyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO01BQ2xDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFO1FBQ2ZBLG1CQUFpQixDQUFDLEdBQUcsQ0FBQyxDQUFDO09BQ3hCO0tBQ0YsQ0FBQyxDQUFDO0dBQ0o7RUFDRCxJQUFJLFNBQVMsQ0FBQyxPQUFPLEVBQUU7SUFDckJBLG1CQUFpQixDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztHQUN0QztFQUNELElBQUksU0FBUyxDQUFDLFFBQVEsRUFBRTtJQUN0QixNQUFNLENBQUMsTUFBTSxDQUFDLFNBQVMsRUFBRXBCLDRCQUFtQixDQUFDLGtCQUFrQixDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0dBQ3RGO0NBQ0Y7O0FBRUQsU0FBU3FCLHVCQUFxQixFQUFFLE9BQU8sRUFBRTtFQUN2QyxPQUFPLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQztFQUNoQyxPQUFPLE9BQU8sQ0FBQyxLQUFLLENBQUM7RUFDckIsT0FBTyxPQUFPLENBQUMsS0FBSyxDQUFDO0VBQ3JCLE9BQU8sT0FBTyxDQUFDLFFBQVEsQ0FBQztFQUN4QixPQUFPLE9BQU8sQ0FBQyxLQUFLLENBQUM7RUFDckIsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDO0VBQ3ZCLE9BQU8sT0FBTyxDQUFDLEtBQUssQ0FBQztFQUNyQixPQUFPLE9BQU8sQ0FBQyxLQUFLLENBQUM7RUFDckIsT0FBTyxPQUFPLENBQUMsU0FBUyxDQUFDO0NBQzFCOzs7O0FBSUQsU0FBU0MsdUJBQXFCLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRTtFQUN4QyxLQUFLLEtBQUssS0FBSyxLQUFLLENBQUMsS0FBRyxLQUFLLEdBQUcsRUFBRSxHQUFDOztFQUVuQyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFFO0lBQ2hDLE9BQU8sS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0dBQzVCOztFQUVELElBQUksT0FBTyxLQUFLLENBQUMsT0FBTyxLQUFLLFFBQVEsRUFBRTtJQUNyQyxPQUFPLENBQUMsQ0FBQyxDQUFDdEIsNEJBQW1CLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7R0FDbEU7RUFDRCxJQUFJLFFBQVEsR0FBRyxFQUFFLENBQUM7RUFDbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxRQUFRLEVBQUU7SUFDN0MsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFO01BQ2xDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxJQUFJLEVBQUU7UUFDdEMsSUFBSSxTQUFTLEdBQUcsT0FBTyxJQUFJLEtBQUssUUFBUSxHQUFHQSw0QkFBbUIsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUM7UUFDL0YsSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzNCLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQztRQUM3QixRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO09BQ3hCLENBQUMsQ0FBQztLQUNKLE1BQU07TUFDTCxJQUFJLFNBQVMsR0FBRyxPQUFPLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxRQUFRLEdBQUdBLDRCQUFtQixDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztNQUNoSSxJQUFJLElBQUksR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUM7TUFDeEIsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDO01BQzFCLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDckI7R0FDRixDQUFDLENBQUM7RUFDSCxPQUFPLFFBQVE7Q0FDaEI7O0FBRUQsU0FBU3VCLDJCQUF5QixFQUFFLFNBQVMsRUFBRSxlQUFlLEVBQUU7RUFDOUQsSUFBSSxlQUFlLENBQUMsT0FBTyxJQUFJLE9BQU8sZUFBZSxDQUFDLE9BQU8sS0FBSyxRQUFRLEVBQUU7SUFDMUVyQyxZQUFVLENBQUMsaUNBQWlDLENBQUMsQ0FBQztHQUMvQztFQUNELElBQUksZUFBZSxDQUFDLEtBQUssRUFBRTtJQUN6QlksZUFBYSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQztHQUN0Qzs7RUFFRCxPQUFPO0lBQ0wsTUFBTSxFQUFFLFNBQVMsTUFBTSxFQUFFLENBQUMsRUFBRTtNQUMxQixPQUFPLENBQUM7UUFDTixTQUFTO1FBQ1QsZUFBZSxDQUFDLE9BQU8sSUFBSSxTQUFTLENBQUMsdUJBQXVCO1FBQzVELENBQUMsZUFBZSxDQUFDLE9BQU8sSUFBSSxlQUFlLENBQUMsT0FBTyxDQUFDLFFBQVEsSUFBSSxlQUFlLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEVBQUUsRUFBRSxPQUFPLE9BQU8sQ0FBQyxLQUFLLFVBQVUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLd0IsdUJBQXFCLENBQUMsZUFBZSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7T0FDdE47S0FDRjtJQUNELElBQUksRUFBRSxTQUFTLENBQUMsSUFBSTtJQUNwQixzQkFBc0IsRUFBRSxJQUFJO0dBQzdCO0NBQ0Y7Ozs7QUFJRCxTQUFTRSxnQkFBYztFQUNyQixTQUFTO0VBQ1QsT0FBTztFQUNQLEdBQUc7RUFDSDtFQUNBLElBQUksT0FBTyxDQUFDLEtBQUssRUFBRTtJQUNqQnJCLFVBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0dBQzlCOztFQUVELElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxJQUFJLFNBQVMsQ0FBQyxPQUFPLENBQUMsVUFBVSxLQUFLLFNBQVMsQ0FBQyxVQUFVLEVBQUU7SUFDL0UsU0FBUyxHQUFHb0IsMkJBQXlCLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0dBQzNELE1BQU0sSUFBSSxPQUFPLENBQUMsT0FBTyxFQUFFO0lBQzFCckMsWUFBVTtNQUNSLHFFQUFxRTtLQUN0RSxDQUFDO0dBQ0g7O0VBRUQsSUFBSSxPQUFPLENBQUMsT0FBTyxFQUFFO0lBQ25Cb0IsWUFBVSxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0dBQ2pEOztFQUVELElBQUlaLHlCQUF1QixDQUFDLFNBQVMsQ0FBQyxFQUFFO0lBQ3RDMEIsbUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUM7R0FDOUI7O0VBRURYLGdCQUFjLENBQUMsR0FBRyxDQUFDLENBQUM7O0VBRXBCLElBQUksV0FBVyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7O0VBRXhDLElBQUksZUFBZSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0VBQ2pEWSx1QkFBcUIsQ0FBQyxlQUFlLENBQUMsQ0FBQztFQUN2QyxJQUFJLE9BQU8sQ0FBQyxLQUFLLEVBQUU7SUFDakIsZUFBZSxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxlQUFlLENBQUMsVUFBVTs7TUFFdkVMLHNCQUFvQixDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7R0FDOUQ7O0VBRUQsSUFBSSxFQUFFLEdBQUcsSUFBSSxXQUFXLENBQUMsZUFBZSxDQUFDLENBQUM7O0VBRTFDWixVQUFRLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztFQUM1QkMsY0FBWSxDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7O0VBRXBDLElBQUksT0FBTyxDQUFDLFdBQVcsRUFBRTtJQUN2QixJQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsRUFBRTtNQUNsRG5CLFlBQVUsQ0FBQywrRkFBK0YsQ0FBQyxDQUFDO0tBQzdHO0lBQ0QsSUFBSSxVQUFVLEdBQUcsTUFBTSxFQUFFLENBQUNQLEtBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsSUFBSUEsS0FBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0lBQzNGLElBQUksVUFBVSxJQUFJLEdBQUcsRUFBRTtNQUNyQixFQUFFLENBQUMsMEJBQTBCLEdBQUcsRUFBRSxDQUFDO01BQ25DLEVBQUUsQ0FBQyx5QkFBeUIsR0FBRyxFQUFFLENBQUM7TUFDbEMsSUFBSSxVQUFVLEdBQUcsRUFBRSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUM7O01BRXBDLEVBQUUsQ0FBQyxZQUFZLENBQUMsRUFBRSxHQUFHLFVBQVUsSUFBSSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFO1FBQ2hFLElBQUksWUFBWSxHQUFHLEVBQUUsQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN2RCxJQUFJLFNBQVMsR0FBRyxFQUFFLENBQUMseUJBQXlCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbkQsSUFBSSxZQUFZLEVBQUU7VUFDaEIsS0FBSyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQztVQUM3QyxJQUFJLEtBQUssR0FBRyxFQUFFLENBQUM7VUFDZixJQUFJLE9BQU8sR0FBRyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1VBQy9HLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBVSxHQUFHLEVBQUU7WUFDN0IsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQUM7V0FDbkMsQ0FBQyxDQUFDO1VBQ0gsS0FBSyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEtBQUssQ0FBQztVQUN6QixPQUFPLFlBQVksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1NBQ2hDLE1BQU07VUFDTCxPQUFPLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLFlBQVksRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxVQUFVLENBQUM7U0FDM0U7T0FDRixDQUFDOzs7TUFHRnVCLGdCQUFjLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxXQUFXLENBQUMsQ0FBQztLQUN6QyxNQUFNO01BQ0xoQixZQUFVLENBQUMsdURBQXVELENBQUMsQ0FBQztLQUNyRTtHQUNGOztFQUVELElBQUksT0FBTyxDQUFDLEtBQUssRUFBRTtJQUNqQmUsVUFBUSxDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7R0FDN0I7O0VBRUQsT0FBTyxFQUFFO0NBQ1Y7Ozs7QUFJRCxTQUFTLGFBQWEsSUFBSTtFQUN4QixJQUFJLFFBQVEsRUFBRTtJQUNaLElBQUksSUFBSSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7O0lBRXpDLElBQUksUUFBUSxDQUFDLElBQUksRUFBRTtNQUNqQixRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUNqQztJQUNELE9BQU8sSUFBSTtHQUNaO0NBQ0Y7Ozs7Ozs7OztBQVNELFNBQVMsY0FBYyxHQUFHO0VBQ3hCLElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO0VBQ25CLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO0NBQ2Y7O0FBRUQsSUFBSSxlQUFlLEdBQUcsY0FBYyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBa0NyQyxTQUFTLEVBQUUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFO0VBQ3hCLE9BQU8sS0FBSyxLQUFLLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxJQUFJLEtBQUssS0FBSyxLQUFLLENBQUMsQ0FBQztDQUNoRTs7QUFFRCxJQUFJLElBQUksR0FBRyxFQUFFLENBQUM7Ozs7Ozs7Ozs7QUFVZCxTQUFTLFlBQVksQ0FBQyxLQUFLLEVBQUUsR0FBRyxFQUFFO0VBQ2hDLElBQUksTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7RUFDMUIsT0FBTyxNQUFNLEVBQUUsRUFBRTtJQUNmLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRTtNQUMvQixPQUFPLE1BQU0sQ0FBQztLQUNmO0dBQ0Y7RUFDRCxPQUFPLENBQUMsQ0FBQyxDQUFDO0NBQ1g7O0FBRUQsSUFBSSxhQUFhLEdBQUcsWUFBWSxDQUFDOzs7QUFHakMsSUFBSSxVQUFVLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQzs7O0FBR2pDLElBQUksTUFBTSxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUM7Ozs7Ozs7Ozs7O0FBVy9CLFNBQVMsZUFBZSxDQUFDLEdBQUcsRUFBRTtFQUM1QixJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUTtNQUNwQixLQUFLLEdBQUcsYUFBYSxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQzs7RUFFckMsSUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUFFO0lBQ2IsT0FBTyxLQUFLLENBQUM7R0FDZDtFQUNELElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0VBQ2hDLElBQUksS0FBSyxJQUFJLFNBQVMsRUFBRTtJQUN0QixJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7R0FDWixNQUFNO0lBQ0wsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO0dBQzdCO0VBQ0QsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDO0VBQ1osT0FBTyxJQUFJLENBQUM7Q0FDYjs7QUFFRCxJQUFJLGdCQUFnQixHQUFHLGVBQWUsQ0FBQzs7Ozs7Ozs7Ozs7QUFXdkMsU0FBUyxZQUFZLENBQUMsR0FBRyxFQUFFO0VBQ3pCLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRO01BQ3BCLEtBQUssR0FBRyxhQUFhLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDOztFQUVyQyxPQUFPLEtBQUssR0FBRyxDQUFDLEdBQUcsU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUMvQzs7QUFFRCxJQUFJLGFBQWEsR0FBRyxZQUFZLENBQUM7Ozs7Ozs7Ozs7O0FBV2pDLFNBQVMsWUFBWSxDQUFDLEdBQUcsRUFBRTtFQUN6QixPQUFPLGFBQWEsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0NBQy9DOztBQUVELElBQUksYUFBYSxHQUFHLFlBQVksQ0FBQzs7Ozs7Ozs7Ozs7O0FBWWpDLFNBQVMsWUFBWSxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUU7RUFDaEMsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVE7TUFDcEIsS0FBSyxHQUFHLGFBQWEsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7O0VBRXJDLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRTtJQUNiLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQztJQUNaLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztHQUN6QixNQUFNO0lBQ0wsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQztHQUN4QjtFQUNELE9BQU8sSUFBSSxDQUFDO0NBQ2I7O0FBRUQsSUFBSSxhQUFhLEdBQUcsWUFBWSxDQUFDOzs7Ozs7Ozs7QUFTakMsU0FBUyxTQUFTLENBQUMsT0FBTyxFQUFFO0VBQzFCLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQzs7RUFFbEIsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO01BQ1YsTUFBTSxHQUFHLE9BQU8sSUFBSSxJQUFJLEdBQUcsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7O0VBRWxELElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztFQUNiLE9BQU8sRUFBRSxLQUFLLEdBQUcsTUFBTSxFQUFFO0lBQ3ZCLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMzQixNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztHQUNoQztDQUNGOzs7QUFHRCxTQUFTLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBRyxlQUFlLENBQUM7QUFDNUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxnQkFBZ0IsQ0FBQztBQUNqRCxTQUFTLENBQUMsU0FBUyxDQUFDLEdBQUcsR0FBRyxhQUFhLENBQUM7QUFDeEMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEdBQUcsYUFBYSxDQUFDO0FBQ3hDLFNBQVMsQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFHLGFBQWEsQ0FBQzs7QUFFeEMsSUFBSSxVQUFVLEdBQUcsU0FBUyxDQUFDOzs7Ozs7Ozs7QUFTM0IsU0FBUyxVQUFVLEdBQUc7RUFDcEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLFVBQVUsQ0FBQztFQUMvQixJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztDQUNmOztBQUVELElBQUksV0FBVyxHQUFHLFVBQVUsQ0FBQzs7Ozs7Ozs7Ozs7QUFXN0IsU0FBUyxXQUFXLENBQUMsR0FBRyxFQUFFO0VBQ3hCLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRO01BQ3BCLE1BQU0sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7O0VBRWpDLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztFQUN0QixPQUFPLE1BQU0sQ0FBQztDQUNmOztBQUVELElBQUksWUFBWSxHQUFHLFdBQVcsQ0FBQzs7Ozs7Ozs7Ozs7QUFXL0IsU0FBUyxRQUFRLENBQUMsR0FBRyxFQUFFO0VBQ3JCLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7Q0FDL0I7O0FBRUQsSUFBSSxTQUFTLEdBQUcsUUFBUSxDQUFDOzs7Ozs7Ozs7OztBQVd6QixTQUFTLFFBQVEsQ0FBQyxHQUFHLEVBQUU7RUFDckIsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUMvQjs7QUFFRCxJQUFJLFNBQVMsR0FBRyxRQUFRLENBQUM7O0FBRXpCLElBQUl3QixnQkFBYyxHQUFHLE9BQU8sTUFBTSxLQUFLLFdBQVcsR0FBRyxNQUFNLEdBQUcsT0FBT0MsY0FBTSxLQUFLLFdBQVcsR0FBR0EsY0FBTSxHQUFHLE9BQU8sSUFBSSxLQUFLLFdBQVcsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDOztBQUUvSSxTQUFTQyxzQkFBb0IsQ0FBQyxFQUFFLEVBQUUsTUFBTSxFQUFFO0NBQ3pDLE9BQU8sTUFBTSxHQUFHLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUM7Q0FDNUU7OztBQUdELElBQUksVUFBVSxHQUFHLE9BQU9GLGdCQUFjLElBQUksUUFBUSxJQUFJQSxnQkFBYyxJQUFJQSxnQkFBYyxDQUFDLE1BQU0sS0FBSyxNQUFNLElBQUlBLGdCQUFjLENBQUM7O0FBRTNILElBQUksV0FBVyxHQUFHLFVBQVUsQ0FBQzs7O0FBRzdCLElBQUksUUFBUSxHQUFHLE9BQU8sSUFBSSxJQUFJLFFBQVEsSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxNQUFNLElBQUksSUFBSSxDQUFDOzs7QUFHakYsSUFBSSxJQUFJLEdBQUcsV0FBVyxJQUFJLFFBQVEsSUFBSSxRQUFRLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQzs7QUFFaEUsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDOzs7QUFHakIsSUFBSSxNQUFNLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQzs7QUFFMUIsSUFBSSxPQUFPLEdBQUcsTUFBTSxDQUFDOzs7QUFHckIsSUFBSSxXQUFXLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQzs7O0FBR25DLElBQUksY0FBYyxHQUFHLFdBQVcsQ0FBQyxjQUFjLENBQUM7Ozs7Ozs7QUFPaEQsSUFBSSxvQkFBb0IsR0FBRyxXQUFXLENBQUMsUUFBUSxDQUFDOzs7QUFHaEQsSUFBSSxjQUFjLEdBQUcsT0FBTyxHQUFHLE9BQU8sQ0FBQyxXQUFXLEdBQUcsU0FBUyxDQUFDOzs7Ozs7Ozs7QUFTL0QsU0FBUyxTQUFTLENBQUMsS0FBSyxFQUFFO0VBQ3hCLElBQUksS0FBSyxHQUFHLGNBQWMsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLGNBQWMsQ0FBQztNQUNsRCxHQUFHLEdBQUcsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDOztFQUVoQyxJQUFJO0lBQ0YsS0FBSyxDQUFDLGNBQWMsQ0FBQyxHQUFHLFNBQVMsQ0FBQztJQUNsQyxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUM7R0FDckIsQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFOztFQUVkLElBQUksTUFBTSxHQUFHLG9CQUFvQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztFQUM5QyxJQUFJLFFBQVEsRUFBRTtJQUNaLElBQUksS0FBSyxFQUFFO01BQ1QsS0FBSyxDQUFDLGNBQWMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztLQUM3QixNQUFNO01BQ0wsT0FBTyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUM7S0FDOUI7R0FDRjtFQUNELE9BQU8sTUFBTSxDQUFDO0NBQ2Y7O0FBRUQsSUFBSSxVQUFVLEdBQUcsU0FBUyxDQUFDOzs7QUFHM0IsSUFBSSxhQUFhLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQzs7Ozs7OztBQU9yQyxJQUFJLHNCQUFzQixHQUFHLGFBQWEsQ0FBQyxRQUFRLENBQUM7Ozs7Ozs7OztBQVNwRCxTQUFTLGNBQWMsQ0FBQyxLQUFLLEVBQUU7RUFDN0IsT0FBTyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7Q0FDM0M7O0FBRUQsSUFBSSxlQUFlLEdBQUcsY0FBYyxDQUFDOzs7QUFHckMsSUFBSSxPQUFPLEdBQUcsZUFBZTtJQUN6QixZQUFZLEdBQUcsb0JBQW9CLENBQUM7OztBQUd4QyxJQUFJLGdCQUFnQixHQUFHLE9BQU8sR0FBRyxPQUFPLENBQUMsV0FBVyxHQUFHLFNBQVMsQ0FBQzs7Ozs7Ozs7O0FBU2pFLFNBQVMsVUFBVSxDQUFDLEtBQUssRUFBRTtFQUN6QixJQUFJLEtBQUssSUFBSSxJQUFJLEVBQUU7SUFDakIsT0FBTyxLQUFLLEtBQUssU0FBUyxHQUFHLFlBQVksR0FBRyxPQUFPLENBQUM7R0FDckQ7RUFDRCxPQUFPLENBQUMsZ0JBQWdCLElBQUksZ0JBQWdCLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQztNQUN6RCxVQUFVLENBQUMsS0FBSyxDQUFDO01BQ2pCLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQztDQUM1Qjs7QUFFRCxJQUFJLFdBQVcsR0FBRyxVQUFVLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTJCN0IsU0FBUyxRQUFRLENBQUMsS0FBSyxFQUFFO0VBQ3ZCLElBQUksSUFBSSxHQUFHLE9BQU8sS0FBSyxDQUFDO0VBQ3hCLE9BQU8sS0FBSyxJQUFJLElBQUksS0FBSyxJQUFJLElBQUksUUFBUSxJQUFJLElBQUksSUFBSSxVQUFVLENBQUMsQ0FBQztDQUNsRTs7QUFFRCxJQUFJLFVBQVUsR0FBRyxRQUFRLENBQUM7OztBQUcxQixJQUFJLFFBQVEsR0FBRyx3QkFBd0I7SUFDbkMsT0FBTyxHQUFHLG1CQUFtQjtJQUM3QixNQUFNLEdBQUcsNEJBQTRCO0lBQ3JDLFFBQVEsR0FBRyxnQkFBZ0IsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW1CaEMsU0FBUyxVQUFVLENBQUMsS0FBSyxFQUFFO0VBQ3pCLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEVBQUU7SUFDdEIsT0FBTyxLQUFLLENBQUM7R0FDZDs7O0VBR0QsSUFBSSxHQUFHLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO0VBQzdCLE9BQU8sR0FBRyxJQUFJLE9BQU8sSUFBSSxHQUFHLElBQUksTUFBTSxJQUFJLEdBQUcsSUFBSSxRQUFRLElBQUksR0FBRyxJQUFJLFFBQVEsQ0FBQztDQUM5RTs7QUFFRCxJQUFJLFlBQVksR0FBRyxVQUFVLENBQUM7OztBQUc5QixJQUFJLFVBQVUsR0FBRyxLQUFLLENBQUMsb0JBQW9CLENBQUMsQ0FBQzs7QUFFN0MsSUFBSSxXQUFXLEdBQUcsVUFBVSxDQUFDOzs7QUFHN0IsSUFBSSxVQUFVLElBQUksV0FBVztFQUMzQixJQUFJLEdBQUcsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsSUFBSSxXQUFXLENBQUMsSUFBSSxJQUFJLFdBQVcsQ0FBQyxJQUFJLENBQUMsUUFBUSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0VBQzVGLE9BQU8sR0FBRyxJQUFJLGdCQUFnQixHQUFHLEdBQUcsSUFBSSxFQUFFLENBQUM7Q0FDNUMsRUFBRSxDQUFDLENBQUM7Ozs7Ozs7OztBQVNMLFNBQVMsUUFBUSxDQUFDLElBQUksRUFBRTtFQUN0QixPQUFPLENBQUMsQ0FBQyxVQUFVLEtBQUssVUFBVSxJQUFJLElBQUksQ0FBQyxDQUFDO0NBQzdDOztBQUVELElBQUksU0FBUyxHQUFHLFFBQVEsQ0FBQzs7O0FBR3pCLElBQUksU0FBUyxHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQUM7OztBQUduQyxJQUFJLFlBQVksR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDOzs7Ozs7Ozs7QUFTdEMsU0FBUyxRQUFRLENBQUMsSUFBSSxFQUFFO0VBQ3RCLElBQUksSUFBSSxJQUFJLElBQUksRUFBRTtJQUNoQixJQUFJO01BQ0YsT0FBTyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ2hDLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRTtJQUNkLElBQUk7TUFDRixRQUFRLElBQUksR0FBRyxFQUFFLEVBQUU7S0FDcEIsQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFO0dBQ2Y7RUFDRCxPQUFPLEVBQUUsQ0FBQztDQUNYOztBQUVELElBQUksU0FBUyxHQUFHLFFBQVEsQ0FBQzs7Ozs7O0FBTXpCLElBQUksWUFBWSxHQUFHLHFCQUFxQixDQUFDOzs7QUFHekMsSUFBSSxZQUFZLEdBQUcsNkJBQTZCLENBQUM7OztBQUdqRCxJQUFJLFdBQVcsR0FBRyxRQUFRLENBQUMsU0FBUztJQUNoQyxhQUFhLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQzs7O0FBR3JDLElBQUksY0FBYyxHQUFHLFdBQVcsQ0FBQyxRQUFRLENBQUM7OztBQUcxQyxJQUFJLGdCQUFnQixHQUFHLGFBQWEsQ0FBQyxjQUFjLENBQUM7OztBQUdwRCxJQUFJLFVBQVUsR0FBRyxNQUFNLENBQUMsR0FBRztFQUN6QixjQUFjLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxNQUFNLENBQUM7R0FDbEUsT0FBTyxDQUFDLHdEQUF3RCxFQUFFLE9BQU8sQ0FBQyxHQUFHLEdBQUc7Q0FDbEYsQ0FBQzs7Ozs7Ozs7OztBQVVGLFNBQVMsWUFBWSxDQUFDLEtBQUssRUFBRTtFQUMzQixJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxJQUFJLFNBQVMsQ0FBQyxLQUFLLENBQUMsRUFBRTtJQUMxQyxPQUFPLEtBQUssQ0FBQztHQUNkO0VBQ0QsSUFBSSxPQUFPLEdBQUcsWUFBWSxDQUFDLEtBQUssQ0FBQyxHQUFHLFVBQVUsR0FBRyxZQUFZLENBQUM7RUFDOUQsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0NBQ3ZDOztBQUVELElBQUksYUFBYSxHQUFHLFlBQVksQ0FBQzs7Ozs7Ozs7OztBQVVqQyxTQUFTLFFBQVEsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFO0VBQzdCLE9BQU8sTUFBTSxJQUFJLElBQUksR0FBRyxTQUFTLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQ2pEOztBQUVELElBQUksU0FBUyxHQUFHLFFBQVEsQ0FBQzs7Ozs7Ozs7OztBQVV6QixTQUFTLFNBQVMsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFO0VBQzlCLElBQUksS0FBSyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7RUFDbkMsT0FBTyxhQUFhLENBQUMsS0FBSyxDQUFDLEdBQUcsS0FBSyxHQUFHLFNBQVMsQ0FBQztDQUNqRDs7QUFFRCxJQUFJLFVBQVUsR0FBRyxTQUFTLENBQUM7OztBQUczQixJQUFJLEdBQUcsR0FBRyxVQUFVLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDOztBQUVuQyxJQUFJLElBQUksR0FBRyxHQUFHLENBQUM7OztBQUdmLElBQUksWUFBWSxHQUFHLFVBQVUsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7O0FBRWhELElBQUksYUFBYSxHQUFHLFlBQVksQ0FBQzs7Ozs7Ozs7O0FBU2pDLFNBQVMsU0FBUyxHQUFHO0VBQ25CLElBQUksQ0FBQyxRQUFRLEdBQUcsYUFBYSxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7RUFDekQsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7Q0FDZjs7QUFFRCxJQUFJLFVBQVUsR0FBRyxTQUFTLENBQUM7Ozs7Ozs7Ozs7OztBQVkzQixTQUFTLFVBQVUsQ0FBQyxHQUFHLEVBQUU7RUFDdkIsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7RUFDeEQsSUFBSSxDQUFDLElBQUksSUFBSSxNQUFNLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztFQUM1QixPQUFPLE1BQU0sQ0FBQztDQUNmOztBQUVELElBQUksV0FBVyxHQUFHLFVBQVUsQ0FBQzs7O0FBRzdCLElBQUksY0FBYyxHQUFHLDJCQUEyQixDQUFDOzs7QUFHakQsSUFBSSxhQUFhLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQzs7O0FBR3JDLElBQUksZ0JBQWdCLEdBQUcsYUFBYSxDQUFDLGNBQWMsQ0FBQzs7Ozs7Ozs7Ozs7QUFXcEQsU0FBUyxPQUFPLENBQUMsR0FBRyxFQUFFO0VBQ3BCLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7RUFDekIsSUFBSSxhQUFhLEVBQUU7SUFDakIsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ3ZCLE9BQU8sTUFBTSxLQUFLLGNBQWMsR0FBRyxTQUFTLEdBQUcsTUFBTSxDQUFDO0dBQ3ZEO0VBQ0QsT0FBTyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxTQUFTLENBQUM7Q0FDakU7O0FBRUQsSUFBSSxRQUFRLEdBQUcsT0FBTyxDQUFDOzs7QUFHdkIsSUFBSSxhQUFhLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQzs7O0FBR3JDLElBQUksZ0JBQWdCLEdBQUcsYUFBYSxDQUFDLGNBQWMsQ0FBQzs7Ozs7Ozs7Ozs7QUFXcEQsU0FBUyxPQUFPLENBQUMsR0FBRyxFQUFFO0VBQ3BCLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7RUFDekIsT0FBTyxhQUFhLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLFNBQVMsSUFBSSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0NBQ3JGOztBQUVELElBQUksUUFBUSxHQUFHLE9BQU8sQ0FBQzs7O0FBR3ZCLElBQUksZ0JBQWdCLEdBQUcsMkJBQTJCLENBQUM7Ozs7Ozs7Ozs7OztBQVluRCxTQUFTLE9BQU8sQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFO0VBQzNCLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7RUFDekIsSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7RUFDbkMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsYUFBYSxJQUFJLEtBQUssS0FBSyxTQUFTLElBQUksZ0JBQWdCLEdBQUcsS0FBSyxDQUFDO0VBQzlFLE9BQU8sSUFBSSxDQUFDO0NBQ2I7O0FBRUQsSUFBSSxRQUFRLEdBQUcsT0FBTyxDQUFDOzs7Ozs7Ozs7QUFTdkIsU0FBUyxJQUFJLENBQUMsT0FBTyxFQUFFO0VBQ3JCLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQzs7RUFFbEIsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO01BQ1YsTUFBTSxHQUFHLE9BQU8sSUFBSSxJQUFJLEdBQUcsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7O0VBRWxELElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztFQUNiLE9BQU8sRUFBRSxLQUFLLEdBQUcsTUFBTSxFQUFFO0lBQ3ZCLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUMzQixNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztHQUNoQztDQUNGOzs7QUFHRCxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBRyxVQUFVLENBQUM7QUFDbEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxXQUFXLENBQUM7QUFDdkMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEdBQUcsUUFBUSxDQUFDO0FBQzlCLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFHLFFBQVEsQ0FBQztBQUM5QixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsR0FBRyxRQUFRLENBQUM7O0FBRTlCLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQzs7Ozs7Ozs7O0FBU2pCLFNBQVMsYUFBYSxHQUFHO0VBQ3ZCLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO0VBQ2QsSUFBSSxDQUFDLFFBQVEsR0FBRztJQUNkLE1BQU0sRUFBRSxJQUFJLEtBQUs7SUFDakIsS0FBSyxFQUFFLEtBQUssSUFBSSxJQUFJLFVBQVUsQ0FBQztJQUMvQixRQUFRLEVBQUUsSUFBSSxLQUFLO0dBQ3BCLENBQUM7Q0FDSDs7QUFFRCxJQUFJLGNBQWMsR0FBRyxhQUFhLENBQUM7Ozs7Ozs7OztBQVNuQyxTQUFTLFNBQVMsQ0FBQyxLQUFLLEVBQUU7RUFDeEIsSUFBSSxJQUFJLEdBQUcsT0FBTyxLQUFLLENBQUM7RUFDeEIsT0FBTyxDQUFDLElBQUksSUFBSSxRQUFRLElBQUksSUFBSSxJQUFJLFFBQVEsSUFBSSxJQUFJLElBQUksUUFBUSxJQUFJLElBQUksSUFBSSxTQUFTO09BQ2hGLEtBQUssS0FBSyxXQUFXO09BQ3JCLEtBQUssS0FBSyxJQUFJLENBQUMsQ0FBQztDQUN0Qjs7QUFFRCxJQUFJLFVBQVUsR0FBRyxTQUFTLENBQUM7Ozs7Ozs7Ozs7QUFVM0IsU0FBUyxVQUFVLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRTtFQUM1QixJQUFJLElBQUksR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDO0VBQ3hCLE9BQU8sVUFBVSxDQUFDLEdBQUcsQ0FBQztNQUNsQixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksUUFBUSxHQUFHLFFBQVEsR0FBRyxNQUFNLENBQUM7TUFDaEQsSUFBSSxDQUFDLEdBQUcsQ0FBQztDQUNkOztBQUVELElBQUksV0FBVyxHQUFHLFVBQVUsQ0FBQzs7Ozs7Ozs7Ozs7QUFXN0IsU0FBUyxjQUFjLENBQUMsR0FBRyxFQUFFO0VBQzNCLElBQUksTUFBTSxHQUFHLFdBQVcsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7RUFDbkQsSUFBSSxDQUFDLElBQUksSUFBSSxNQUFNLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztFQUM1QixPQUFPLE1BQU0sQ0FBQztDQUNmOztBQUVELElBQUksZUFBZSxHQUFHLGNBQWMsQ0FBQzs7Ozs7Ozs7Ozs7QUFXckMsU0FBUyxXQUFXLENBQUMsR0FBRyxFQUFFO0VBQ3hCLE9BQU8sV0FBVyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7Q0FDeEM7O0FBRUQsSUFBSSxZQUFZLEdBQUcsV0FBVyxDQUFDOzs7Ozs7Ozs7OztBQVcvQixTQUFTLFdBQVcsQ0FBQyxHQUFHLEVBQUU7RUFDeEIsT0FBTyxXQUFXLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUN4Qzs7QUFFRCxJQUFJLFlBQVksR0FBRyxXQUFXLENBQUM7Ozs7Ozs7Ozs7OztBQVkvQixTQUFTLFdBQVcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFO0VBQy9CLElBQUksSUFBSSxHQUFHLFdBQVcsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDO01BQzdCLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDOztFQUVyQixJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztFQUNyQixJQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7RUFDdkMsT0FBTyxJQUFJLENBQUM7Q0FDYjs7QUFFRCxJQUFJLFlBQVksR0FBRyxXQUFXLENBQUM7Ozs7Ozs7OztBQVMvQixTQUFTLFFBQVEsQ0FBQyxPQUFPLEVBQUU7RUFDekIsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDOztFQUVsQixJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7TUFDVixNQUFNLEdBQUcsT0FBTyxJQUFJLElBQUksR0FBRyxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQzs7RUFFbEQsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0VBQ2IsT0FBTyxFQUFFLEtBQUssR0FBRyxNQUFNLEVBQUU7SUFDdkIsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzNCLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0dBQ2hDO0NBQ0Y7OztBQUdELFFBQVEsQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLGNBQWMsQ0FBQztBQUMxQyxRQUFRLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLGVBQWUsQ0FBQztBQUMvQyxRQUFRLENBQUMsU0FBUyxDQUFDLEdBQUcsR0FBRyxZQUFZLENBQUM7QUFDdEMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEdBQUcsWUFBWSxDQUFDO0FBQ3RDLFFBQVEsQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFHLFlBQVksQ0FBQzs7QUFFdEMsSUFBSSxTQUFTLEdBQUcsUUFBUSxDQUFDOzs7QUFHekIsSUFBSSxnQkFBZ0IsR0FBRyxHQUFHLENBQUM7Ozs7Ozs7Ozs7OztBQVkzQixTQUFTLFFBQVEsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFO0VBQzVCLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7RUFDekIsSUFBSSxJQUFJLFlBQVksVUFBVSxFQUFFO0lBQzlCLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7SUFDMUIsSUFBSSxDQUFDLElBQUksS0FBSyxLQUFLLENBQUMsTUFBTSxHQUFHLGdCQUFnQixHQUFHLENBQUMsQ0FBQyxFQUFFO01BQ2xELEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztNQUN6QixJQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQztNQUN4QixPQUFPLElBQUksQ0FBQztLQUNiO0lBQ0QsSUFBSSxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7R0FDN0M7RUFDRCxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztFQUNyQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7RUFDdEIsT0FBTyxJQUFJLENBQUM7Q0FDYjs7QUFFRCxJQUFJLFNBQVMsR0FBRyxRQUFRLENBQUM7Ozs7Ozs7OztBQVN6QixTQUFTLEtBQUssQ0FBQyxPQUFPLEVBQUU7RUFDdEIsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztFQUNuRCxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7Q0FDdkI7OztBQUdELEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLFdBQVcsQ0FBQztBQUNwQyxLQUFLLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLFlBQVksQ0FBQztBQUN6QyxLQUFLLENBQUMsU0FBUyxDQUFDLEdBQUcsR0FBRyxTQUFTLENBQUM7QUFDaEMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEdBQUcsU0FBUyxDQUFDO0FBQ2hDLEtBQUssQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFHLFNBQVMsQ0FBQzs7QUFFaEMsSUFBSSxNQUFNLEdBQUcsS0FBSyxDQUFDOzs7Ozs7Ozs7OztBQVduQixTQUFTLFNBQVMsQ0FBQyxLQUFLLEVBQUUsUUFBUSxFQUFFO0VBQ2xDLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztNQUNWLE1BQU0sR0FBRyxLQUFLLElBQUksSUFBSSxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDOztFQUU5QyxPQUFPLEVBQUUsS0FBSyxHQUFHLE1BQU0sRUFBRTtJQUN2QixJQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxLQUFLLEtBQUssRUFBRTtNQUNsRCxNQUFNO0tBQ1A7R0FDRjtFQUNELE9BQU8sS0FBSyxDQUFDO0NBQ2Q7O0FBRUQsSUFBSSxVQUFVLEdBQUcsU0FBUyxDQUFDOztBQUUzQixJQUFJLGNBQWMsSUFBSSxXQUFXO0VBQy9CLElBQUk7SUFDRixJQUFJLElBQUksR0FBRyxVQUFVLENBQUMsTUFBTSxFQUFFLGdCQUFnQixDQUFDLENBQUM7SUFDaEQsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDakIsT0FBTyxJQUFJLENBQUM7R0FDYixDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUU7Q0FDZixFQUFFLENBQUMsQ0FBQzs7QUFFTCxJQUFJLGVBQWUsR0FBRyxjQUFjLENBQUM7Ozs7Ozs7Ozs7O0FBV3JDLFNBQVMsZUFBZSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFO0VBQzNDLElBQUksR0FBRyxJQUFJLFdBQVcsSUFBSSxlQUFlLEVBQUU7SUFDekMsZUFBZSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUU7TUFDM0IsY0FBYyxFQUFFLElBQUk7TUFDcEIsWUFBWSxFQUFFLElBQUk7TUFDbEIsT0FBTyxFQUFFLEtBQUs7TUFDZCxVQUFVLEVBQUUsSUFBSTtLQUNqQixDQUFDLENBQUM7R0FDSixNQUFNO0lBQ0wsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQztHQUNyQjtDQUNGOztBQUVELElBQUksZ0JBQWdCLEdBQUcsZUFBZSxDQUFDOzs7QUFHdkMsSUFBSSxhQUFhLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQzs7O0FBR3JDLElBQUksZ0JBQWdCLEdBQUcsYUFBYSxDQUFDLGNBQWMsQ0FBQzs7Ozs7Ozs7Ozs7O0FBWXBELFNBQVMsV0FBVyxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFO0VBQ3ZDLElBQUksUUFBUSxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztFQUMzQixJQUFJLEVBQUUsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO09BQzdELEtBQUssS0FBSyxTQUFTLElBQUksRUFBRSxHQUFHLElBQUksTUFBTSxDQUFDLENBQUMsRUFBRTtJQUM3QyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO0dBQ3RDO0NBQ0Y7O0FBRUQsSUFBSSxZQUFZLEdBQUcsV0FBVyxDQUFDOzs7Ozs7Ozs7Ozs7QUFZL0IsU0FBUyxVQUFVLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFO0VBQ3JELElBQUksS0FBSyxHQUFHLENBQUMsTUFBTSxDQUFDO0VBQ3BCLE1BQU0sS0FBSyxNQUFNLEdBQUcsRUFBRSxDQUFDLENBQUM7O0VBRXhCLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztNQUNWLE1BQU0sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDOztFQUUxQixPQUFPLEVBQUUsS0FBSyxHQUFHLE1BQU0sRUFBRTtJQUN2QixJQUFJLEdBQUcsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7O0lBRXZCLElBQUksUUFBUSxHQUFHLFVBQVU7UUFDckIsVUFBVSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUM7UUFDekQsU0FBUyxDQUFDOztJQUVkLElBQUksUUFBUSxLQUFLLFNBQVMsRUFBRTtNQUMxQixRQUFRLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ3hCO0lBQ0QsSUFBSSxLQUFLLEVBQUU7TUFDVCxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0tBQ3pDLE1BQU07TUFDTCxZQUFZLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQztLQUNyQztHQUNGO0VBQ0QsT0FBTyxNQUFNLENBQUM7Q0FDZjs7QUFFRCxJQUFJLFdBQVcsR0FBRyxVQUFVLENBQUM7Ozs7Ozs7Ozs7O0FBVzdCLFNBQVMsU0FBUyxDQUFDLENBQUMsRUFBRSxRQUFRLEVBQUU7RUFDOUIsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO01BQ1YsTUFBTSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQzs7RUFFdEIsT0FBTyxFQUFFLEtBQUssR0FBRyxDQUFDLEVBQUU7SUFDbEIsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztHQUNqQztFQUNELE9BQU8sTUFBTSxDQUFDO0NBQ2Y7O0FBRUQsSUFBSSxVQUFVLEdBQUcsU0FBUyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTBCM0IsU0FBUyxZQUFZLENBQUMsS0FBSyxFQUFFO0VBQzNCLE9BQU8sS0FBSyxJQUFJLElBQUksSUFBSSxPQUFPLEtBQUssSUFBSSxRQUFRLENBQUM7Q0FDbEQ7O0FBRUQsSUFBSSxjQUFjLEdBQUcsWUFBWSxDQUFDOzs7QUFHbEMsSUFBSSxPQUFPLEdBQUcsb0JBQW9CLENBQUM7Ozs7Ozs7OztBQVNuQyxTQUFTLGVBQWUsQ0FBQyxLQUFLLEVBQUU7RUFDOUIsT0FBTyxjQUFjLENBQUMsS0FBSyxDQUFDLElBQUksV0FBVyxDQUFDLEtBQUssQ0FBQyxJQUFJLE9BQU8sQ0FBQztDQUMvRDs7QUFFRCxJQUFJLGdCQUFnQixHQUFHLGVBQWUsQ0FBQzs7O0FBR3ZDLElBQUksYUFBYSxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUM7OztBQUdyQyxJQUFJLGdCQUFnQixHQUFHLGFBQWEsQ0FBQyxjQUFjLENBQUM7OztBQUdwRCxJQUFJLG9CQUFvQixHQUFHLGFBQWEsQ0FBQyxvQkFBb0IsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFvQjlELElBQUksV0FBVyxHQUFHLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxPQUFPLFNBQVMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxHQUFHLGdCQUFnQixHQUFHLFNBQVMsS0FBSyxFQUFFO0VBQzFHLE9BQU8sY0FBYyxDQUFDLEtBQUssQ0FBQyxJQUFJLGdCQUFnQixDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDO0lBQ3BFLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQztDQUMvQyxDQUFDOztBQUVGLElBQUksYUFBYSxHQUFHLFdBQVcsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXlCaEMsSUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQzs7QUFFNUIsSUFBSSxTQUFTLEdBQUcsT0FBTyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7QUFleEIsU0FBUyxTQUFTLEdBQUc7RUFDbkIsT0FBTyxLQUFLLENBQUM7Q0FDZDs7QUFFRCxJQUFJLFdBQVcsR0FBRyxTQUFTLENBQUM7O0FBRTVCLElBQUksVUFBVSxHQUFHRSxzQkFBb0IsQ0FBQyxVQUFVLE1BQU0sRUFBRSxPQUFPLEVBQUU7O0FBRWpFLElBQUksV0FBVyxHQUFHLFFBQVEsSUFBSSxRQUFRLElBQUksT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsSUFBSSxPQUFPLENBQUM7OztBQUdsRixJQUFJLFVBQVUsR0FBRyxXQUFXLElBQUksUUFBUSxJQUFJLFFBQVEsSUFBSSxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxJQUFJLE1BQU0sQ0FBQzs7O0FBRzdGLElBQUksYUFBYSxHQUFHLFVBQVUsSUFBSSxVQUFVLENBQUMsT0FBTyxLQUFLLFdBQVcsQ0FBQzs7O0FBR3JFLElBQUksTUFBTSxHQUFHLGFBQWEsR0FBRyxLQUFLLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQzs7O0FBR3RELElBQUksY0FBYyxHQUFHLE1BQU0sR0FBRyxNQUFNLENBQUMsUUFBUSxHQUFHLFNBQVMsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW1CMUQsSUFBSSxRQUFRLEdBQUcsY0FBYyxJQUFJLFdBQVcsQ0FBQzs7QUFFN0MsTUFBTSxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUM7Q0FDekIsQ0FBQyxDQUFDOzs7QUFHSCxJQUFJLGdCQUFnQixHQUFHLGdCQUFnQixDQUFDOzs7QUFHeEMsSUFBSSxRQUFRLEdBQUcsa0JBQWtCLENBQUM7Ozs7Ozs7Ozs7QUFVbEMsU0FBUyxPQUFPLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRTtFQUM5QixNQUFNLEdBQUcsTUFBTSxJQUFJLElBQUksR0FBRyxnQkFBZ0IsR0FBRyxNQUFNLENBQUM7RUFDcEQsT0FBTyxDQUFDLENBQUMsTUFBTTtLQUNaLE9BQU8sS0FBSyxJQUFJLFFBQVEsSUFBSSxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ2pELEtBQUssR0FBRyxDQUFDLENBQUMsSUFBSSxLQUFLLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLEdBQUcsTUFBTSxDQUFDLENBQUM7Q0FDcEQ7O0FBRUQsSUFBSSxRQUFRLEdBQUcsT0FBTyxDQUFDOzs7QUFHdkIsSUFBSSxrQkFBa0IsR0FBRyxnQkFBZ0IsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTRCMUMsU0FBUyxRQUFRLENBQUMsS0FBSyxFQUFFO0VBQ3ZCLE9BQU8sT0FBTyxLQUFLLElBQUksUUFBUTtJQUM3QixLQUFLLEdBQUcsQ0FBQyxDQUFDLElBQUksS0FBSyxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxJQUFJLGtCQUFrQixDQUFDO0NBQy9EOztBQUVELElBQUksVUFBVSxHQUFHLFFBQVEsQ0FBQzs7O0FBRzFCLElBQUksU0FBUyxHQUFHLG9CQUFvQjtJQUNoQyxRQUFRLEdBQUcsZ0JBQWdCO0lBQzNCLE9BQU8sR0FBRyxrQkFBa0I7SUFDNUIsT0FBTyxHQUFHLGVBQWU7SUFDekIsUUFBUSxHQUFHLGdCQUFnQjtJQUMzQixTQUFTLEdBQUcsbUJBQW1CO0lBQy9CLE1BQU0sR0FBRyxjQUFjO0lBQ3ZCLFNBQVMsR0FBRyxpQkFBaUI7SUFDN0IsU0FBUyxHQUFHLGlCQUFpQjtJQUM3QixTQUFTLEdBQUcsaUJBQWlCO0lBQzdCLE1BQU0sR0FBRyxjQUFjO0lBQ3ZCLFNBQVMsR0FBRyxpQkFBaUI7SUFDN0IsVUFBVSxHQUFHLGtCQUFrQixDQUFDOztBQUVwQyxJQUFJLGNBQWMsR0FBRyxzQkFBc0I7SUFDdkMsV0FBVyxHQUFHLG1CQUFtQjtJQUNqQyxVQUFVLEdBQUcsdUJBQXVCO0lBQ3BDLFVBQVUsR0FBRyx1QkFBdUI7SUFDcEMsT0FBTyxHQUFHLG9CQUFvQjtJQUM5QixRQUFRLEdBQUcscUJBQXFCO0lBQ2hDLFFBQVEsR0FBRyxxQkFBcUI7SUFDaEMsUUFBUSxHQUFHLHFCQUFxQjtJQUNoQyxlQUFlLEdBQUcsNEJBQTRCO0lBQzlDLFNBQVMsR0FBRyxzQkFBc0I7SUFDbEMsU0FBUyxHQUFHLHNCQUFzQixDQUFDOzs7QUFHdkMsSUFBSSxjQUFjLEdBQUcsRUFBRSxDQUFDO0FBQ3hCLGNBQWMsQ0FBQyxVQUFVLENBQUMsR0FBRyxjQUFjLENBQUMsVUFBVSxDQUFDO0FBQ3ZELGNBQWMsQ0FBQyxPQUFPLENBQUMsR0FBRyxjQUFjLENBQUMsUUFBUSxDQUFDO0FBQ2xELGNBQWMsQ0FBQyxRQUFRLENBQUMsR0FBRyxjQUFjLENBQUMsUUFBUSxDQUFDO0FBQ25ELGNBQWMsQ0FBQyxlQUFlLENBQUMsR0FBRyxjQUFjLENBQUMsU0FBUyxDQUFDO0FBQzNELGNBQWMsQ0FBQyxTQUFTLENBQUMsR0FBRyxJQUFJLENBQUM7QUFDakMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxHQUFHLGNBQWMsQ0FBQyxRQUFRLENBQUM7QUFDcEQsY0FBYyxDQUFDLGNBQWMsQ0FBQyxHQUFHLGNBQWMsQ0FBQyxPQUFPLENBQUM7QUFDeEQsY0FBYyxDQUFDLFdBQVcsQ0FBQyxHQUFHLGNBQWMsQ0FBQyxPQUFPLENBQUM7QUFDckQsY0FBYyxDQUFDLFFBQVEsQ0FBQyxHQUFHLGNBQWMsQ0FBQyxTQUFTLENBQUM7QUFDcEQsY0FBYyxDQUFDLE1BQU0sQ0FBQyxHQUFHLGNBQWMsQ0FBQyxTQUFTLENBQUM7QUFDbEQsY0FBYyxDQUFDLFNBQVMsQ0FBQyxHQUFHLGNBQWMsQ0FBQyxTQUFTLENBQUM7QUFDckQsY0FBYyxDQUFDLE1BQU0sQ0FBQyxHQUFHLGNBQWMsQ0FBQyxTQUFTLENBQUM7QUFDbEQsY0FBYyxDQUFDLFVBQVUsQ0FBQyxHQUFHLEtBQUssQ0FBQzs7Ozs7Ozs7O0FBU25DLFNBQVMsZ0JBQWdCLENBQUMsS0FBSyxFQUFFO0VBQy9CLE9BQU8sY0FBYyxDQUFDLEtBQUssQ0FBQztJQUMxQixVQUFVLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Q0FDcEU7O0FBRUQsSUFBSSxpQkFBaUIsR0FBRyxnQkFBZ0IsQ0FBQzs7Ozs7Ozs7O0FBU3pDLFNBQVMsU0FBUyxDQUFDLElBQUksRUFBRTtFQUN2QixPQUFPLFNBQVMsS0FBSyxFQUFFO0lBQ3JCLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0dBQ3BCLENBQUM7Q0FDSDs7QUFFRCxJQUFJLFVBQVUsR0FBRyxTQUFTLENBQUM7O0FBRTNCLElBQUksU0FBUyxHQUFHQSxzQkFBb0IsQ0FBQyxVQUFVLE1BQU0sRUFBRSxPQUFPLEVBQUU7O0FBRWhFLElBQUksV0FBVyxHQUFHLFFBQVEsSUFBSSxRQUFRLElBQUksT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsSUFBSSxPQUFPLENBQUM7OztBQUdsRixJQUFJLFVBQVUsR0FBRyxXQUFXLElBQUksUUFBUSxJQUFJLFFBQVEsSUFBSSxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxJQUFJLE1BQU0sQ0FBQzs7O0FBRzdGLElBQUksYUFBYSxHQUFHLFVBQVUsSUFBSSxVQUFVLENBQUMsT0FBTyxLQUFLLFdBQVcsQ0FBQzs7O0FBR3JFLElBQUksV0FBVyxHQUFHLGFBQWEsSUFBSSxXQUFXLENBQUMsT0FBTyxDQUFDOzs7QUFHdkQsSUFBSSxRQUFRLElBQUksV0FBVztFQUN6QixJQUFJO0lBQ0YsT0FBTyxXQUFXLElBQUksV0FBVyxDQUFDLE9BQU8sSUFBSSxXQUFXLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0dBQzFFLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRTtDQUNmLEVBQUUsQ0FBQyxDQUFDOztBQUVMLE1BQU0sQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDO0NBQ3pCLENBQUMsQ0FBQzs7O0FBR0gsSUFBSSxnQkFBZ0IsR0FBRyxTQUFTLElBQUksU0FBUyxDQUFDLFlBQVksQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW1CM0QsSUFBSSxZQUFZLEdBQUcsZ0JBQWdCLEdBQUcsVUFBVSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsaUJBQWlCLENBQUM7O0FBRXZGLElBQUksY0FBYyxHQUFHLFlBQVksQ0FBQzs7O0FBR2xDLElBQUksYUFBYSxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUM7OztBQUdyQyxJQUFJLGdCQUFnQixHQUFHLGFBQWEsQ0FBQyxjQUFjLENBQUM7Ozs7Ozs7Ozs7QUFVcEQsU0FBUyxhQUFhLENBQUMsS0FBSyxFQUFFLFNBQVMsRUFBRTtFQUN2QyxJQUFJLEtBQUssR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDO01BQ3hCLEtBQUssR0FBRyxDQUFDLEtBQUssSUFBSSxhQUFhLENBQUMsS0FBSyxDQUFDO01BQ3RDLE1BQU0sR0FBRyxDQUFDLEtBQUssSUFBSSxDQUFDLEtBQUssSUFBSSxVQUFVLENBQUMsS0FBSyxDQUFDO01BQzlDLE1BQU0sR0FBRyxDQUFDLEtBQUssSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLE1BQU0sSUFBSSxjQUFjLENBQUMsS0FBSyxDQUFDO01BQzdELFdBQVcsR0FBRyxLQUFLLElBQUksS0FBSyxJQUFJLE1BQU0sSUFBSSxNQUFNO01BQ2hELE1BQU0sR0FBRyxXQUFXLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLEdBQUcsRUFBRTtNQUM1RCxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQzs7RUFFM0IsS0FBSyxJQUFJLEdBQUcsSUFBSSxLQUFLLEVBQUU7SUFDckIsSUFBSSxDQUFDLFNBQVMsSUFBSSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQztRQUMvQyxFQUFFLFdBQVc7O1dBRVYsR0FBRyxJQUFJLFFBQVE7O1lBRWQsTUFBTSxLQUFLLEdBQUcsSUFBSSxRQUFRLElBQUksR0FBRyxJQUFJLFFBQVEsQ0FBQyxDQUFDOztZQUUvQyxNQUFNLEtBQUssR0FBRyxJQUFJLFFBQVEsSUFBSSxHQUFHLElBQUksWUFBWSxJQUFJLEdBQUcsSUFBSSxZQUFZLENBQUMsQ0FBQzs7V0FFM0UsUUFBUSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUM7U0FDdkIsQ0FBQyxFQUFFO01BQ04sTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUNsQjtHQUNGO0VBQ0QsT0FBTyxNQUFNLENBQUM7Q0FDZjs7QUFFRCxJQUFJLGNBQWMsR0FBRyxhQUFhLENBQUM7OztBQUduQyxJQUFJLGFBQWEsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDOzs7Ozs7Ozs7QUFTckMsU0FBUyxXQUFXLENBQUMsS0FBSyxFQUFFO0VBQzFCLElBQUksSUFBSSxHQUFHLEtBQUssSUFBSSxLQUFLLENBQUMsV0FBVztNQUNqQyxLQUFLLEdBQUcsQ0FBQyxPQUFPLElBQUksSUFBSSxVQUFVLElBQUksSUFBSSxDQUFDLFNBQVMsS0FBSyxhQUFhLENBQUM7O0VBRTNFLE9BQU8sS0FBSyxLQUFLLEtBQUssQ0FBQztDQUN4Qjs7QUFFRCxJQUFJLFlBQVksR0FBRyxXQUFXLENBQUM7Ozs7Ozs7Ozs7QUFVL0IsU0FBUyxPQUFPLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRTtFQUNoQyxPQUFPLFNBQVMsR0FBRyxFQUFFO0lBQ25CLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0dBQzdCLENBQUM7Q0FDSDs7QUFFRCxJQUFJLFFBQVEsR0FBRyxPQUFPLENBQUM7OztBQUd2QixJQUFJLFVBQVUsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQzs7QUFFL0MsSUFBSSxXQUFXLEdBQUcsVUFBVSxDQUFDOzs7QUFHN0IsSUFBSSxhQUFhLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQzs7O0FBR3JDLElBQUksZ0JBQWdCLEdBQUcsYUFBYSxDQUFDLGNBQWMsQ0FBQzs7Ozs7Ozs7O0FBU3BELFNBQVMsUUFBUSxDQUFDLE1BQU0sRUFBRTtFQUN4QixJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxFQUFFO0lBQ3pCLE9BQU8sV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0dBQzVCO0VBQ0QsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO0VBQ2hCLEtBQUssSUFBSSxHQUFHLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFO0lBQzlCLElBQUksZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsSUFBSSxHQUFHLElBQUksYUFBYSxFQUFFO01BQzlELE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDbEI7R0FDRjtFQUNELE9BQU8sTUFBTSxDQUFDO0NBQ2Y7O0FBRUQsSUFBSSxTQUFTLEdBQUcsUUFBUSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUEyQnpCLFNBQVMsV0FBVyxDQUFDLEtBQUssRUFBRTtFQUMxQixPQUFPLEtBQUssSUFBSSxJQUFJLElBQUksVUFBVSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztDQUMxRTs7QUFFRCxJQUFJLGFBQWEsR0FBRyxXQUFXLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQThCaEMsU0FBUyxJQUFJLENBQUMsTUFBTSxFQUFFO0VBQ3BCLE9BQU8sYUFBYSxDQUFDLE1BQU0sQ0FBQyxHQUFHLGNBQWMsQ0FBQyxNQUFNLENBQUMsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7Q0FDM0U7O0FBRUQsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDOzs7Ozs7Ozs7OztBQVdsQixTQUFTLFVBQVUsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFO0VBQ2xDLE9BQU8sTUFBTSxJQUFJLFdBQVcsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0NBQzlEOztBQUVELElBQUksV0FBVyxHQUFHLFVBQVUsQ0FBQzs7Ozs7Ozs7Ozs7QUFXN0IsU0FBUyxZQUFZLENBQUMsTUFBTSxFQUFFO0VBQzVCLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztFQUNoQixJQUFJLE1BQU0sSUFBSSxJQUFJLEVBQUU7SUFDbEIsS0FBSyxJQUFJLEdBQUcsSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUU7TUFDOUIsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUNsQjtHQUNGO0VBQ0QsT0FBTyxNQUFNLENBQUM7Q0FDZjs7QUFFRCxJQUFJLGFBQWEsR0FBRyxZQUFZLENBQUM7OztBQUdqQyxJQUFJLGNBQWMsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDOzs7QUFHdEMsSUFBSSxnQkFBZ0IsR0FBRyxjQUFjLENBQUMsY0FBYyxDQUFDOzs7Ozs7Ozs7QUFTckQsU0FBUyxVQUFVLENBQUMsTUFBTSxFQUFFO0VBQzFCLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEVBQUU7SUFDdkIsT0FBTyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7R0FDOUI7RUFDRCxJQUFJLE9BQU8sR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDO01BQzlCLE1BQU0sR0FBRyxFQUFFLENBQUM7O0VBRWhCLEtBQUssSUFBSSxHQUFHLElBQUksTUFBTSxFQUFFO0lBQ3RCLElBQUksRUFBRSxHQUFHLElBQUksYUFBYSxLQUFLLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFO01BQy9FLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDbEI7R0FDRjtFQUNELE9BQU8sTUFBTSxDQUFDO0NBQ2Y7O0FBRUQsSUFBSSxXQUFXLEdBQUcsVUFBVSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBeUI3QixTQUFTLFFBQVEsQ0FBQyxNQUFNLEVBQUU7RUFDeEIsT0FBTyxhQUFhLENBQUMsTUFBTSxDQUFDLEdBQUcsY0FBYyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7Q0FDbkY7O0FBRUQsSUFBSSxRQUFRLEdBQUcsUUFBUSxDQUFDOzs7Ozs7Ozs7OztBQVd4QixTQUFTLFlBQVksQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFO0VBQ3BDLE9BQU8sTUFBTSxJQUFJLFdBQVcsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0NBQ2hFOztBQUVELElBQUksYUFBYSxHQUFHLFlBQVksQ0FBQzs7QUFFakMsSUFBSSxZQUFZLEdBQUdBLHNCQUFvQixDQUFDLFVBQVUsTUFBTSxFQUFFLE9BQU8sRUFBRTs7QUFFbkUsSUFBSSxXQUFXLEdBQUcsUUFBUSxJQUFJLFFBQVEsSUFBSSxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxJQUFJLE9BQU8sQ0FBQzs7O0FBR2xGLElBQUksVUFBVSxHQUFHLFdBQVcsSUFBSSxRQUFRLElBQUksUUFBUSxJQUFJLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLElBQUksTUFBTSxDQUFDOzs7QUFHN0YsSUFBSSxhQUFhLEdBQUcsVUFBVSxJQUFJLFVBQVUsQ0FBQyxPQUFPLEtBQUssV0FBVyxDQUFDOzs7QUFHckUsSUFBSSxNQUFNLEdBQUcsYUFBYSxHQUFHLEtBQUssQ0FBQyxNQUFNLEdBQUcsU0FBUztJQUNqRCxXQUFXLEdBQUcsTUFBTSxHQUFHLE1BQU0sQ0FBQyxXQUFXLEdBQUcsU0FBUyxDQUFDOzs7Ozs7Ozs7O0FBVTFELFNBQVMsV0FBVyxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUU7RUFDbkMsSUFBSSxNQUFNLEVBQUU7SUFDVixPQUFPLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztHQUN2QjtFQUNELElBQUksTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNO01BQ3RCLE1BQU0sR0FBRyxXQUFXLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxHQUFHLElBQUksTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQzs7RUFFaEYsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztFQUNwQixPQUFPLE1BQU0sQ0FBQztDQUNmOztBQUVELE1BQU0sQ0FBQyxPQUFPLEdBQUcsV0FBVyxDQUFDO0NBQzVCLENBQUMsQ0FBQzs7Ozs7Ozs7OztBQVVILFNBQVMsU0FBUyxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUU7RUFDaEMsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO01BQ1YsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7O0VBRTNCLEtBQUssS0FBSyxLQUFLLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7RUFDakMsT0FBTyxFQUFFLEtBQUssR0FBRyxNQUFNLEVBQUU7SUFDdkIsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztHQUM5QjtFQUNELE9BQU8sS0FBSyxDQUFDO0NBQ2Q7O0FBRUQsSUFBSSxVQUFVLEdBQUcsU0FBUyxDQUFDOzs7Ozs7Ozs7OztBQVczQixTQUFTLFdBQVcsQ0FBQyxLQUFLLEVBQUUsU0FBUyxFQUFFO0VBQ3JDLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztNQUNWLE1BQU0sR0FBRyxLQUFLLElBQUksSUFBSSxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTTtNQUN6QyxRQUFRLEdBQUcsQ0FBQztNQUNaLE1BQU0sR0FBRyxFQUFFLENBQUM7O0VBRWhCLE9BQU8sRUFBRSxLQUFLLEdBQUcsTUFBTSxFQUFFO0lBQ3ZCLElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN6QixJQUFJLFNBQVMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFO01BQ2xDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQztLQUM1QjtHQUNGO0VBQ0QsT0FBTyxNQUFNLENBQUM7Q0FDZjs7QUFFRCxJQUFJLFlBQVksR0FBRyxXQUFXLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBb0IvQixTQUFTLFNBQVMsR0FBRztFQUNuQixPQUFPLEVBQUUsQ0FBQztDQUNYOztBQUVELElBQUksV0FBVyxHQUFHLFNBQVMsQ0FBQzs7O0FBRzVCLElBQUksY0FBYyxHQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUM7OztBQUd0QyxJQUFJLHNCQUFzQixHQUFHLGNBQWMsQ0FBQyxvQkFBb0IsQ0FBQzs7O0FBR2pFLElBQUksZ0JBQWdCLEdBQUcsTUFBTSxDQUFDLHFCQUFxQixDQUFDOzs7Ozs7Ozs7QUFTcEQsSUFBSSxVQUFVLEdBQUcsQ0FBQyxnQkFBZ0IsR0FBRyxXQUFXLEdBQUcsU0FBUyxNQUFNLEVBQUU7RUFDbEUsSUFBSSxNQUFNLElBQUksSUFBSSxFQUFFO0lBQ2xCLE9BQU8sRUFBRSxDQUFDO0dBQ1g7RUFDRCxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0VBQ3hCLE9BQU8sWUFBWSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxFQUFFLFNBQVMsTUFBTSxFQUFFO0lBQzdELE9BQU8sc0JBQXNCLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztHQUNwRCxDQUFDLENBQUM7Q0FDSixDQUFDOztBQUVGLElBQUksV0FBVyxHQUFHLFVBQVUsQ0FBQzs7Ozs7Ozs7OztBQVU3QixTQUFTLFdBQVcsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFO0VBQ25DLE9BQU8sV0FBVyxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsTUFBTSxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7Q0FDekQ7O0FBRUQsSUFBSSxZQUFZLEdBQUcsV0FBVyxDQUFDOzs7Ozs7Ozs7O0FBVS9CLFNBQVMsU0FBUyxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUU7RUFDaEMsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO01BQ1YsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNO01BQ3RCLE1BQU0sR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDOztFQUUxQixPQUFPLEVBQUUsS0FBSyxHQUFHLE1BQU0sRUFBRTtJQUN2QixLQUFLLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztHQUN2QztFQUNELE9BQU8sS0FBSyxDQUFDO0NBQ2Q7O0FBRUQsSUFBSSxVQUFVLEdBQUcsU0FBUyxDQUFDOzs7QUFHM0IsSUFBSSxZQUFZLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxjQUFjLEVBQUUsTUFBTSxDQUFDLENBQUM7O0FBRTNELElBQUksYUFBYSxHQUFHLFlBQVksQ0FBQzs7O0FBR2pDLElBQUksa0JBQWtCLEdBQUcsTUFBTSxDQUFDLHFCQUFxQixDQUFDOzs7Ozs7Ozs7QUFTdEQsSUFBSSxZQUFZLEdBQUcsQ0FBQyxrQkFBa0IsR0FBRyxXQUFXLEdBQUcsU0FBUyxNQUFNLEVBQUU7RUFDdEUsSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO0VBQ2hCLE9BQU8sTUFBTSxFQUFFO0lBQ2IsVUFBVSxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUN4QyxNQUFNLEdBQUcsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0dBQ2hDO0VBQ0QsT0FBTyxNQUFNLENBQUM7Q0FDZixDQUFDOztBQUVGLElBQUksYUFBYSxHQUFHLFlBQVksQ0FBQzs7Ozs7Ozs7OztBQVVqQyxTQUFTLGFBQWEsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFO0VBQ3JDLE9BQU8sV0FBVyxDQUFDLE1BQU0sRUFBRSxhQUFhLENBQUMsTUFBTSxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7Q0FDM0Q7O0FBRUQsSUFBSSxjQUFjLEdBQUcsYUFBYSxDQUFDOzs7Ozs7Ozs7Ozs7O0FBYW5DLFNBQVMsY0FBYyxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFO0VBQ3JELElBQUksTUFBTSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztFQUM5QixPQUFPLFNBQVMsQ0FBQyxNQUFNLENBQUMsR0FBRyxNQUFNLEdBQUcsVUFBVSxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztDQUM3RTs7QUFFRCxJQUFJLGVBQWUsR0FBRyxjQUFjLENBQUM7Ozs7Ozs7OztBQVNyQyxTQUFTLFVBQVUsQ0FBQyxNQUFNLEVBQUU7RUFDMUIsT0FBTyxlQUFlLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxXQUFXLENBQUMsQ0FBQztDQUNyRDs7QUFFRCxJQUFJLFdBQVcsR0FBRyxVQUFVLENBQUM7Ozs7Ozs7Ozs7QUFVN0IsU0FBUyxZQUFZLENBQUMsTUFBTSxFQUFFO0VBQzVCLE9BQU8sZUFBZSxDQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsYUFBYSxDQUFDLENBQUM7Q0FDekQ7O0FBRUQsSUFBSSxhQUFhLEdBQUcsWUFBWSxDQUFDOzs7QUFHakMsSUFBSSxRQUFRLEdBQUcsVUFBVSxDQUFDLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQzs7QUFFN0MsSUFBSSxTQUFTLEdBQUcsUUFBUSxDQUFDOzs7QUFHekIsSUFBSSxPQUFPLEdBQUcsVUFBVSxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQzs7QUFFM0MsSUFBSSxRQUFRLEdBQUcsT0FBTyxDQUFDOzs7QUFHdkIsSUFBSSxHQUFHLEdBQUcsVUFBVSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQzs7QUFFbkMsSUFBSSxJQUFJLEdBQUcsR0FBRyxDQUFDOzs7QUFHZixJQUFJLE9BQU8sR0FBRyxVQUFVLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxDQUFDOztBQUUzQyxJQUFJLFFBQVEsR0FBRyxPQUFPLENBQUM7OztBQUd2QixJQUFJLFFBQVEsR0FBRyxjQUFjO0lBQ3pCLFdBQVcsR0FBRyxpQkFBaUI7SUFDL0IsVUFBVSxHQUFHLGtCQUFrQjtJQUMvQixRQUFRLEdBQUcsY0FBYztJQUN6QixZQUFZLEdBQUcsa0JBQWtCLENBQUM7O0FBRXRDLElBQUksYUFBYSxHQUFHLG1CQUFtQixDQUFDOzs7QUFHeEMsSUFBSSxrQkFBa0IsR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDO0lBQ3pDLGFBQWEsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDO0lBQy9CLGlCQUFpQixHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUM7SUFDdkMsYUFBYSxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUM7SUFDL0IsaUJBQWlCLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDOzs7Ozs7Ozs7QUFTNUMsSUFBSSxNQUFNLEdBQUcsV0FBVyxDQUFDOzs7QUFHekIsSUFBSSxDQUFDLFNBQVMsSUFBSSxNQUFNLENBQUMsSUFBSSxTQUFTLENBQUMsSUFBSSxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLGFBQWE7S0FDdkUsSUFBSSxJQUFJLE1BQU0sQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLFFBQVEsQ0FBQztLQUNyQyxRQUFRLElBQUksTUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLFVBQVUsQ0FBQztLQUNyRCxJQUFJLElBQUksTUFBTSxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksUUFBUSxDQUFDO0tBQ3JDLFFBQVEsSUFBSSxNQUFNLENBQUMsSUFBSSxRQUFRLENBQUMsSUFBSSxZQUFZLENBQUMsRUFBRTtFQUN0RCxNQUFNLEdBQUcsU0FBUyxLQUFLLEVBQUU7SUFDdkIsSUFBSSxNQUFNLEdBQUcsV0FBVyxDQUFDLEtBQUssQ0FBQztRQUMzQixJQUFJLEdBQUcsTUFBTSxJQUFJLFdBQVcsR0FBRyxLQUFLLENBQUMsV0FBVyxHQUFHLFNBQVM7UUFDNUQsVUFBVSxHQUFHLElBQUksR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDOztJQUU3QyxJQUFJLFVBQVUsRUFBRTtNQUNkLFFBQVEsVUFBVTtRQUNoQixLQUFLLGtCQUFrQixFQUFFLE9BQU8sYUFBYSxDQUFDO1FBQzlDLEtBQUssYUFBYSxFQUFFLE9BQU8sUUFBUSxDQUFDO1FBQ3BDLEtBQUssaUJBQWlCLEVBQUUsT0FBTyxVQUFVLENBQUM7UUFDMUMsS0FBSyxhQUFhLEVBQUUsT0FBTyxRQUFRLENBQUM7UUFDcEMsS0FBSyxpQkFBaUIsRUFBRSxPQUFPLFlBQVksQ0FBQztPQUM3QztLQUNGO0lBQ0QsT0FBTyxNQUFNLENBQUM7R0FDZixDQUFDO0NBQ0g7O0FBRUQsSUFBSSxPQUFPLEdBQUcsTUFBTSxDQUFDOzs7QUFHckIsSUFBSSxjQUFjLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQzs7O0FBR3RDLElBQUksZ0JBQWdCLEdBQUcsY0FBYyxDQUFDLGNBQWMsQ0FBQzs7Ozs7Ozs7O0FBU3JELFNBQVMsY0FBYyxDQUFDLEtBQUssRUFBRTtFQUM3QixJQUFJLE1BQU0sR0FBRyxLQUFLLENBQUMsTUFBTTtNQUNyQixNQUFNLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQzs7O0VBR3ZDLElBQUksTUFBTSxJQUFJLE9BQU8sS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLFFBQVEsSUFBSSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxFQUFFO0lBQ2xGLE1BQU0sQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQztJQUMzQixNQUFNLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUM7R0FDNUI7RUFDRCxPQUFPLE1BQU0sQ0FBQztDQUNmOztBQUVELElBQUksZUFBZSxHQUFHLGNBQWMsQ0FBQzs7O0FBR3JDLElBQUksVUFBVSxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUM7O0FBRWxDLElBQUksV0FBVyxHQUFHLFVBQVUsQ0FBQzs7Ozs7Ozs7O0FBUzdCLFNBQVMsZ0JBQWdCLENBQUMsV0FBVyxFQUFFO0VBQ3JDLElBQUksTUFBTSxHQUFHLElBQUksV0FBVyxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7RUFDakUsSUFBSSxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7RUFDMUQsT0FBTyxNQUFNLENBQUM7Q0FDZjs7QUFFRCxJQUFJLGlCQUFpQixHQUFHLGdCQUFnQixDQUFDOzs7Ozs7Ozs7O0FBVXpDLFNBQVMsYUFBYSxDQUFDLFFBQVEsRUFBRSxNQUFNLEVBQUU7RUFDdkMsSUFBSSxNQUFNLEdBQUcsTUFBTSxHQUFHLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDO0VBQzNFLE9BQU8sSUFBSSxRQUFRLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQztDQUNuRjs7QUFFRCxJQUFJLGNBQWMsR0FBRyxhQUFhLENBQUM7Ozs7Ozs7Ozs7QUFVbkMsU0FBUyxXQUFXLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRTs7RUFFOUIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDMUIsT0FBTyxHQUFHLENBQUM7Q0FDWjs7QUFFRCxJQUFJLFlBQVksR0FBRyxXQUFXLENBQUM7Ozs7Ozs7Ozs7Ozs7O0FBYy9CLFNBQVMsV0FBVyxDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRTtFQUM1RCxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7TUFDVixNQUFNLEdBQUcsS0FBSyxJQUFJLElBQUksR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQzs7RUFFOUMsSUFBSSxTQUFTLElBQUksTUFBTSxFQUFFO0lBQ3ZCLFdBQVcsR0FBRyxLQUFLLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztHQUM5QjtFQUNELE9BQU8sRUFBRSxLQUFLLEdBQUcsTUFBTSxFQUFFO0lBQ3ZCLFdBQVcsR0FBRyxRQUFRLENBQUMsV0FBVyxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7R0FDakU7RUFDRCxPQUFPLFdBQVcsQ0FBQztDQUNwQjs7QUFFRCxJQUFJLFlBQVksR0FBRyxXQUFXLENBQUM7Ozs7Ozs7OztBQVMvQixTQUFTLFVBQVUsQ0FBQyxHQUFHLEVBQUU7RUFDdkIsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO01BQ1YsTUFBTSxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7O0VBRTdCLEdBQUcsQ0FBQyxPQUFPLENBQUMsU0FBUyxLQUFLLEVBQUUsR0FBRyxFQUFFO0lBQy9CLE1BQU0sQ0FBQyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO0dBQ2hDLENBQUMsQ0FBQztFQUNILE9BQU8sTUFBTSxDQUFDO0NBQ2Y7O0FBRUQsSUFBSSxXQUFXLEdBQUcsVUFBVSxDQUFDOzs7QUFHN0IsSUFBSSxlQUFlLEdBQUcsQ0FBQyxDQUFDOzs7Ozs7Ozs7OztBQVd4QixTQUFTLFFBQVEsQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRTtFQUN4QyxJQUFJLEtBQUssR0FBRyxNQUFNLEdBQUcsU0FBUyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsRUFBRSxlQUFlLENBQUMsR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7RUFDckYsT0FBTyxZQUFZLENBQUMsS0FBSyxFQUFFLFlBQVksRUFBRSxJQUFJLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztDQUMvRDs7QUFFRCxJQUFJLFNBQVMsR0FBRyxRQUFRLENBQUM7OztBQUd6QixJQUFJLE9BQU8sR0FBRyxNQUFNLENBQUM7Ozs7Ozs7OztBQVNyQixTQUFTLFdBQVcsQ0FBQyxNQUFNLEVBQUU7RUFDM0IsSUFBSSxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0VBQ3pFLE1BQU0sQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQztFQUNwQyxPQUFPLE1BQU0sQ0FBQztDQUNmOztBQUVELElBQUksWUFBWSxHQUFHLFdBQVcsQ0FBQzs7Ozs7Ozs7OztBQVUvQixTQUFTLFdBQVcsQ0FBQyxHQUFHLEVBQUUsS0FBSyxFQUFFOztFQUUvQixHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0VBQ2YsT0FBTyxHQUFHLENBQUM7Q0FDWjs7QUFFRCxJQUFJLFlBQVksR0FBRyxXQUFXLENBQUM7Ozs7Ozs7OztBQVMvQixTQUFTLFVBQVUsQ0FBQyxHQUFHLEVBQUU7RUFDdkIsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO01BQ1YsTUFBTSxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7O0VBRTdCLEdBQUcsQ0FBQyxPQUFPLENBQUMsU0FBUyxLQUFLLEVBQUU7SUFDMUIsTUFBTSxDQUFDLEVBQUUsS0FBSyxDQUFDLEdBQUcsS0FBSyxDQUFDO0dBQ3pCLENBQUMsQ0FBQztFQUNILE9BQU8sTUFBTSxDQUFDO0NBQ2Y7O0FBRUQsSUFBSSxXQUFXLEdBQUcsVUFBVSxDQUFDOzs7QUFHN0IsSUFBSSxpQkFBaUIsR0FBRyxDQUFDLENBQUM7Ozs7Ozs7Ozs7O0FBVzFCLFNBQVMsUUFBUSxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFO0VBQ3hDLElBQUksS0FBSyxHQUFHLE1BQU0sR0FBRyxTQUFTLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxFQUFFLGlCQUFpQixDQUFDLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0VBQ3ZGLE9BQU8sWUFBWSxDQUFDLEtBQUssRUFBRSxZQUFZLEVBQUUsSUFBSSxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7Q0FDL0Q7O0FBRUQsSUFBSSxTQUFTLEdBQUcsUUFBUSxDQUFDOzs7QUFHekIsSUFBSSxXQUFXLEdBQUcsT0FBTyxHQUFHLE9BQU8sQ0FBQyxTQUFTLEdBQUcsU0FBUztJQUNyRCxhQUFhLEdBQUcsV0FBVyxHQUFHLFdBQVcsQ0FBQyxPQUFPLEdBQUcsU0FBUyxDQUFDOzs7Ozs7Ozs7QUFTbEUsU0FBUyxXQUFXLENBQUMsTUFBTSxFQUFFO0VBQzNCLE9BQU8sYUFBYSxHQUFHLE1BQU0sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO0NBQ2hFOztBQUVELElBQUksWUFBWSxHQUFHLFdBQVcsQ0FBQzs7Ozs7Ozs7OztBQVUvQixTQUFTLGVBQWUsQ0FBQyxVQUFVLEVBQUUsTUFBTSxFQUFFO0VBQzNDLElBQUksTUFBTSxHQUFHLE1BQU0sR0FBRyxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLEdBQUcsVUFBVSxDQUFDLE1BQU0sQ0FBQztFQUMvRSxPQUFPLElBQUksVUFBVSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUM7Q0FDckY7O0FBRUQsSUFBSSxnQkFBZ0IsR0FBRyxlQUFlLENBQUM7OztBQUd2QyxJQUFJLFNBQVMsR0FBRyxrQkFBa0I7SUFDOUIsU0FBUyxHQUFHLGVBQWU7SUFDM0IsUUFBUSxHQUFHLGNBQWM7SUFDekIsV0FBVyxHQUFHLGlCQUFpQjtJQUMvQixXQUFXLEdBQUcsaUJBQWlCO0lBQy9CLFFBQVEsR0FBRyxjQUFjO0lBQ3pCLFdBQVcsR0FBRyxpQkFBaUI7SUFDL0IsU0FBUyxHQUFHLGlCQUFpQixDQUFDOztBQUVsQyxJQUFJLGdCQUFnQixHQUFHLHNCQUFzQjtJQUN6QyxhQUFhLEdBQUcsbUJBQW1CO0lBQ25DLFlBQVksR0FBRyx1QkFBdUI7SUFDdEMsWUFBWSxHQUFHLHVCQUF1QjtJQUN0QyxTQUFTLEdBQUcsb0JBQW9CO0lBQ2hDLFVBQVUsR0FBRyxxQkFBcUI7SUFDbEMsVUFBVSxHQUFHLHFCQUFxQjtJQUNsQyxVQUFVLEdBQUcscUJBQXFCO0lBQ2xDLGlCQUFpQixHQUFHLDRCQUE0QjtJQUNoRCxXQUFXLEdBQUcsc0JBQXNCO0lBQ3BDLFdBQVcsR0FBRyxzQkFBc0IsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7O0FBZXpDLFNBQVMsY0FBYyxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRTtFQUN0RCxJQUFJLElBQUksR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDO0VBQzlCLFFBQVEsR0FBRztJQUNULEtBQUssZ0JBQWdCO01BQ25CLE9BQU8saUJBQWlCLENBQUMsTUFBTSxDQUFDLENBQUM7O0lBRW5DLEtBQUssU0FBUyxDQUFDO0lBQ2YsS0FBSyxTQUFTO01BQ1osT0FBTyxJQUFJLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDOztJQUUzQixLQUFLLGFBQWE7TUFDaEIsT0FBTyxjQUFjLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDOztJQUV4QyxLQUFLLFlBQVksQ0FBQyxDQUFDLEtBQUssWUFBWSxDQUFDO0lBQ3JDLEtBQUssU0FBUyxDQUFDLENBQUMsS0FBSyxVQUFVLENBQUMsQ0FBQyxLQUFLLFVBQVUsQ0FBQztJQUNqRCxLQUFLLFVBQVUsQ0FBQyxDQUFDLEtBQUssaUJBQWlCLENBQUMsQ0FBQyxLQUFLLFdBQVcsQ0FBQyxDQUFDLEtBQUssV0FBVztNQUN6RSxPQUFPLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQzs7SUFFMUMsS0FBSyxRQUFRO01BQ1gsT0FBTyxTQUFTLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQzs7SUFFOUMsS0FBSyxXQUFXLENBQUM7SUFDakIsS0FBSyxXQUFXO01BQ2QsT0FBTyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQzs7SUFFMUIsS0FBSyxXQUFXO01BQ2QsT0FBTyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7O0lBRTlCLEtBQUssUUFBUTtNQUNYLE9BQU8sU0FBUyxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsU0FBUyxDQUFDLENBQUM7O0lBRTlDLEtBQUssU0FBUztNQUNaLE9BQU8sWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0dBQy9CO0NBQ0Y7O0FBRUQsSUFBSSxlQUFlLEdBQUcsY0FBYyxDQUFDOzs7QUFHckMsSUFBSSxZQUFZLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQzs7Ozs7Ozs7OztBQVVqQyxJQUFJLFVBQVUsSUFBSSxXQUFXO0VBQzNCLFNBQVMsTUFBTSxHQUFHLEVBQUU7RUFDcEIsT0FBTyxTQUFTLEtBQUssRUFBRTtJQUNyQixJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxFQUFFO01BQ3RCLE9BQU8sRUFBRSxDQUFDO0tBQ1g7SUFDRCxJQUFJLFlBQVksRUFBRTtNQUNoQixPQUFPLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUM1QjtJQUNELE1BQU0sQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO0lBQ3pCLElBQUksTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDO0lBQ3hCLE1BQU0sQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO0lBQzdCLE9BQU8sTUFBTSxDQUFDO0dBQ2YsQ0FBQztDQUNILEVBQUUsQ0FBQyxDQUFDOztBQUVMLElBQUksV0FBVyxHQUFHLFVBQVUsQ0FBQzs7Ozs7Ozs7O0FBUzdCLFNBQVMsZUFBZSxDQUFDLE1BQU0sRUFBRTtFQUMvQixPQUFPLENBQUMsT0FBTyxNQUFNLENBQUMsV0FBVyxJQUFJLFVBQVUsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUM7TUFDcEUsV0FBVyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztNQUNsQyxFQUFFLENBQUM7Q0FDUjs7QUFFRCxJQUFJLGdCQUFnQixHQUFHLGVBQWUsQ0FBQzs7O0FBR3ZDLElBQUksaUJBQWlCLEdBQUcsQ0FBQztJQUNyQixlQUFlLEdBQUcsQ0FBQztJQUNuQixrQkFBa0IsR0FBRyxDQUFDLENBQUM7OztBQUczQixJQUFJLFNBQVMsR0FBRyxvQkFBb0I7SUFDaEMsVUFBVSxHQUFHLGdCQUFnQjtJQUM3QixTQUFTLEdBQUcsa0JBQWtCO0lBQzlCLFNBQVMsR0FBRyxlQUFlO0lBQzNCLFVBQVUsR0FBRyxnQkFBZ0I7SUFDN0IsU0FBUyxHQUFHLG1CQUFtQjtJQUMvQixRQUFRLEdBQUcsNEJBQTRCO0lBQ3ZDLFFBQVEsR0FBRyxjQUFjO0lBQ3pCLFdBQVcsR0FBRyxpQkFBaUI7SUFDL0IsV0FBVyxHQUFHLGlCQUFpQjtJQUMvQixXQUFXLEdBQUcsaUJBQWlCO0lBQy9CLFFBQVEsR0FBRyxjQUFjO0lBQ3pCLFdBQVcsR0FBRyxpQkFBaUI7SUFDL0IsV0FBVyxHQUFHLGlCQUFpQjtJQUMvQixZQUFZLEdBQUcsa0JBQWtCLENBQUM7O0FBRXRDLElBQUksZ0JBQWdCLEdBQUcsc0JBQXNCO0lBQ3pDLGFBQWEsR0FBRyxtQkFBbUI7SUFDbkMsWUFBWSxHQUFHLHVCQUF1QjtJQUN0QyxZQUFZLEdBQUcsdUJBQXVCO0lBQ3RDLFNBQVMsR0FBRyxvQkFBb0I7SUFDaEMsVUFBVSxHQUFHLHFCQUFxQjtJQUNsQyxVQUFVLEdBQUcscUJBQXFCO0lBQ2xDLFVBQVUsR0FBRyxxQkFBcUI7SUFDbEMsaUJBQWlCLEdBQUcsNEJBQTRCO0lBQ2hELFdBQVcsR0FBRyxzQkFBc0I7SUFDcEMsV0FBVyxHQUFHLHNCQUFzQixDQUFDOzs7QUFHekMsSUFBSSxhQUFhLEdBQUcsRUFBRSxDQUFDO0FBQ3ZCLGFBQWEsQ0FBQyxTQUFTLENBQUMsR0FBRyxhQUFhLENBQUMsVUFBVSxDQUFDO0FBQ3BELGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLGFBQWEsQ0FBQyxhQUFhLENBQUM7QUFDOUQsYUFBYSxDQUFDLFNBQVMsQ0FBQyxHQUFHLGFBQWEsQ0FBQyxTQUFTLENBQUM7QUFDbkQsYUFBYSxDQUFDLFlBQVksQ0FBQyxHQUFHLGFBQWEsQ0FBQyxZQUFZLENBQUM7QUFDekQsYUFBYSxDQUFDLFNBQVMsQ0FBQyxHQUFHLGFBQWEsQ0FBQyxVQUFVLENBQUM7QUFDcEQsYUFBYSxDQUFDLFVBQVUsQ0FBQyxHQUFHLGFBQWEsQ0FBQyxRQUFRLENBQUM7QUFDbkQsYUFBYSxDQUFDLFdBQVcsQ0FBQyxHQUFHLGFBQWEsQ0FBQyxXQUFXLENBQUM7QUFDdkQsYUFBYSxDQUFDLFdBQVcsQ0FBQyxHQUFHLGFBQWEsQ0FBQyxRQUFRLENBQUM7QUFDcEQsYUFBYSxDQUFDLFdBQVcsQ0FBQyxHQUFHLGFBQWEsQ0FBQyxXQUFXLENBQUM7QUFDdkQsYUFBYSxDQUFDLFVBQVUsQ0FBQyxHQUFHLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQztBQUM1RCxhQUFhLENBQUMsV0FBVyxDQUFDLEdBQUcsYUFBYSxDQUFDLFdBQVcsQ0FBQyxHQUFHLElBQUksQ0FBQztBQUMvRCxhQUFhLENBQUMsVUFBVSxDQUFDLEdBQUcsYUFBYSxDQUFDLFNBQVMsQ0FBQztBQUNwRCxhQUFhLENBQUMsWUFBWSxDQUFDLEdBQUcsS0FBSyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFrQnBDLFNBQVMsU0FBUyxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFO0VBQ2pFLElBQUksTUFBTTtNQUNOLE1BQU0sR0FBRyxPQUFPLEdBQUcsaUJBQWlCO01BQ3BDLE1BQU0sR0FBRyxPQUFPLEdBQUcsZUFBZTtNQUNsQyxNQUFNLEdBQUcsT0FBTyxHQUFHLGtCQUFrQixDQUFDOztFQUUxQyxJQUFJLFVBQVUsRUFBRTtJQUNkLE1BQU0sR0FBRyxNQUFNLEdBQUcsVUFBVSxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLEtBQUssQ0FBQyxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztHQUM3RTtFQUNELElBQUksTUFBTSxLQUFLLFNBQVMsRUFBRTtJQUN4QixPQUFPLE1BQU0sQ0FBQztHQUNmO0VBQ0QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsRUFBRTtJQUN0QixPQUFPLEtBQUssQ0FBQztHQUNkO0VBQ0QsSUFBSSxLQUFLLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO0VBQzdCLElBQUksS0FBSyxFQUFFO0lBQ1QsTUFBTSxHQUFHLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNoQyxJQUFJLENBQUMsTUFBTSxFQUFFO01BQ1gsT0FBTyxVQUFVLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0tBQ2xDO0dBQ0YsTUFBTTtJQUNMLElBQUksR0FBRyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUM7UUFDcEIsTUFBTSxHQUFHLEdBQUcsSUFBSSxTQUFTLElBQUksR0FBRyxJQUFJLFFBQVEsQ0FBQzs7SUFFakQsSUFBSSxVQUFVLENBQUMsS0FBSyxDQUFDLEVBQUU7TUFDckIsT0FBTyxZQUFZLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0tBQ3BDO0lBQ0QsSUFBSSxHQUFHLElBQUksV0FBVyxJQUFJLEdBQUcsSUFBSSxTQUFTLEtBQUssTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUU7TUFDakUsTUFBTSxHQUFHLENBQUMsTUFBTSxJQUFJLE1BQU0sSUFBSSxFQUFFLEdBQUcsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLENBQUM7TUFDM0QsSUFBSSxDQUFDLE1BQU0sRUFBRTtRQUNYLE9BQU8sTUFBTTtZQUNULGNBQWMsQ0FBQyxLQUFLLEVBQUUsYUFBYSxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNuRCxZQUFZLENBQUMsS0FBSyxFQUFFLFdBQVcsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztPQUNyRDtLQUNGLE1BQU07TUFDTCxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1FBQ3ZCLE9BQU8sTUFBTSxHQUFHLEtBQUssR0FBRyxFQUFFLENBQUM7T0FDNUI7TUFDRCxNQUFNLEdBQUcsZUFBZSxDQUFDLEtBQUssRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0tBQ3pEO0dBQ0Y7O0VBRUQsS0FBSyxLQUFLLEtBQUssR0FBRyxJQUFJLE1BQU0sQ0FBQyxDQUFDO0VBQzlCLElBQUksT0FBTyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7RUFDL0IsSUFBSSxPQUFPLEVBQUU7SUFDWCxPQUFPLE9BQU8sQ0FBQztHQUNoQjtFQUNELEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxDQUFDOztFQUV6QixJQUFJLFFBQVEsR0FBRyxNQUFNO09BQ2hCLE1BQU0sR0FBRyxhQUFhLEdBQUcsV0FBVztPQUNwQyxNQUFNLEdBQUcsTUFBTSxHQUFHLE1BQU0sQ0FBQyxDQUFDOztFQUUvQixJQUFJLEtBQUssR0FBRyxLQUFLLEdBQUcsU0FBUyxHQUFHLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztFQUNoRCxVQUFVLENBQUMsS0FBSyxJQUFJLEtBQUssRUFBRSxTQUFTLFFBQVEsRUFBRSxHQUFHLEVBQUU7SUFDakQsSUFBSSxLQUFLLEVBQUU7TUFDVCxHQUFHLEdBQUcsUUFBUSxDQUFDO01BQ2YsUUFBUSxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUN2Qjs7SUFFRCxZQUFZLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxTQUFTLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0dBQ3hGLENBQUMsQ0FBQztFQUNILE9BQU8sTUFBTSxDQUFDO0NBQ2Y7O0FBRUQsSUFBSSxVQUFVLEdBQUcsU0FBUyxDQUFDOzs7QUFHM0IsSUFBSSxpQkFBaUIsR0FBRyxDQUFDO0lBQ3JCLG9CQUFvQixHQUFHLENBQUMsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFvQjdCLFNBQVMsU0FBUyxDQUFDLEtBQUssRUFBRTtFQUN4QixPQUFPLFVBQVUsQ0FBQyxLQUFLLEVBQUUsaUJBQWlCLEdBQUcsb0JBQW9CLENBQUMsQ0FBQztDQUNwRTs7QUFFRCxJQUFJLFdBQVcsR0FBRyxTQUFTLENBQUM7O0FBRTVCLFNBQVMsWUFBWSxFQUFFLGFBQWEsRUFBRSxFQUFFLEVBQUU7RUFDeEMsSUFBSSxLQUFLLEdBQUcsQ0FBQyxPQUFPLGFBQWEsS0FBSyxRQUFRO01BQzFDLGFBQWE7TUFDYixJQUFJLEtBQUssQ0FBQyxhQUFhLENBQUMsQ0FBQzs7RUFFN0IsRUFBRSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7O0VBRWxCLE1BQU0sS0FBSztDQUNaOzs7O0FBSUQsU0FBUyxjQUFjLElBQUk7RUFDekIsSUFBSSxRQUFRLEdBQUdoRCxLQUFHLENBQUMsTUFBTSxFQUFFLENBQUM7OztFQUc1QixNQUFNLENBQUMsSUFBSSxDQUFDQSxLQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxHQUFHLEVBQUU7SUFDdEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLEVBQUU7TUFDakMsSUFBSSxRQUFRLEdBQUdBLEtBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztNQUN4QixRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsT0FBTyxRQUFRLEtBQUssUUFBUTtVQUN4QyxXQUFXLENBQUMsUUFBUSxDQUFDO1VBQ3JCLFFBQVEsQ0FBQztLQUNkO0dBQ0YsQ0FBQyxDQUFDOzs7RUFHSCxRQUFRLENBQUMsTUFBTSxHQUFHLFdBQVcsQ0FBQ0EsS0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDOztFQUUxQyxRQUFRLENBQUMsTUFBTSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUM7Ozs7RUFJNUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsR0FBR0EsS0FBRyxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQzs7Ozs7RUFLekUsUUFBUSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEdBQUcsUUFBUSxDQUFDOzs7RUFHbEMsSUFBSSxRQUFRLENBQUMsaUJBQWlCLElBQUksUUFBUSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sRUFBRTtJQUNuRSxRQUFRLENBQUMsaUJBQWlCLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztHQUN2QztFQUNELElBQUksR0FBRyxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUM7RUFDdkIsUUFBUSxDQUFDLEdBQUcsR0FBRyxVQUFVLE1BQU0sRUFBRTs7O0lBQy9CLElBQUksSUFBSSxHQUFHLEVBQUUsRUFBRSxHQUFHLEdBQUcsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7SUFDMUMsUUFBUSxHQUFHLEVBQUUsR0FBRyxDQUFDLEtBQUcsSUFBSSxFQUFFLEdBQUcsRUFBRSxHQUFHNkIsV0FBUyxFQUFFLEdBQUcsR0FBRyxDQUFDLEVBQUUsR0FBQzs7SUFFdkQsSUFBSSxNQUFNLENBQUMsU0FBUyxLQUFLLElBQUksRUFBRTtNQUM3QixNQUFNLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztLQUMxQjtJQUNELElBQUksTUFBTSxDQUFDLE9BQU8sSUFBSSxNQUFNLENBQUMsT0FBTyxDQUFDLFNBQVMsS0FBSyxJQUFJLEVBQUU7TUFDdkQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO0tBQ2xDO0lBQ0QsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0dBQzFELENBQUM7RUFDRixPQUFPLFFBQVE7Q0FDaEI7Ozs7QUFJRCxTQUFTLFVBQVUsRUFBRSxHQUFHLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRTtFQUN6QyxJQUFJLE9BQU87S0FDUixNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEVBQUU7SUFDdEQsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFO01BQzFCLE9BQU8sT0FBTyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztLQUN2RCxNQUFNO01BQ0wsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDO1FBQ2xDLE9BQU8sQ0FBQztLQUNYO0dBQ0Y7Q0FDRjs7QUFFRCxTQUFTLFlBQVk7RUFDbkIsT0FBTztFQUNQLE1BQU07RUFDTjtFQUNBLE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsT0FBTztJQUM5QixDQUFDLEtBQUssRUFBRSxVQUFVLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDO0lBQ2xELEtBQUssRUFBRSxVQUFVLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDO0lBQ2pELE9BQU8sRUFBRSxVQUFVLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztDQUM1RDs7OztBQUlELFNBQVMsWUFBWSxFQUFFLEtBQUssRUFBRTtFQUM1QixJQUFJLFdBQVcsR0FBRyxLQUFLLElBQUksS0FBSyxDQUFDLGdCQUFnQixDQUFDO0VBQ2xELElBQUksV0FBVyxJQUFJLFdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRTtJQUNwRCxPQUFPLFlBQVksQ0FBQyxzQkFBc0IsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7R0FDbEUsTUFBTTtJQUNMLE9BQU8sS0FBSztHQUNiO0NBQ0Y7O0FBRUQsU0FBUyxXQUFXLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRTtFQUNyQyxPQUFPLFFBQVEsQ0FBQyxHQUFHLEtBQUssS0FBSyxDQUFDLEdBQUcsSUFBSSxRQUFRLENBQUMsR0FBRyxLQUFLLEtBQUssQ0FBQyxHQUFHO0NBQ2hFOztBQUVELFNBQVMsc0JBQXNCLEVBQUUsUUFBUSxFQUFFO0VBQ3pDLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRTtJQUMzQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtNQUN4QyxJQUFJLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7TUFDcEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLGdCQUFnQixJQUFJLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7UUFDdEQsT0FBTyxDQUFDO09BQ1Q7S0FDRjtHQUNGO0NBQ0Y7O0FBRUQsU0FBUyxXQUFXLEVBQUUsS0FBSyxFQUFFO0VBQzNCO0lBQ0UsT0FBTyxLQUFLLEtBQUssUUFBUTtJQUN6QixPQUFPLEtBQUssS0FBSyxRQUFROztJQUV6QixPQUFPLEtBQUssS0FBSyxRQUFRO0lBQ3pCLE9BQU8sS0FBSyxLQUFLLFNBQVM7R0FDM0I7Q0FDRjs7QUFFRCxTQUFTLGtCQUFrQixFQUFFLElBQUksRUFBRTtFQUNqQyxPQUFPLElBQUksQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLFlBQVk7Q0FDM0M7O0FBRUQsU0FBUyxtQkFBbUIsRUFBRSxLQUFLLEVBQUU7RUFDbkMsUUFBUSxLQUFLLEdBQUcsS0FBSyxDQUFDLE1BQU0sR0FBRztJQUM3QixJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFO01BQ3pCLE9BQU8sSUFBSTtLQUNaO0dBQ0Y7Q0FDRjs7QUFFRCxJQUFJLGNBQWMsR0FBRztFQUNuQixNQUFNLEVBQUUsU0FBUyxNQUFNLEVBQUUsQ0FBQyxFQUFFO0lBQzFCLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDO0lBQzdDLElBQUksQ0FBQyxRQUFRLEVBQUU7TUFDYixNQUFNO0tBQ1A7OztJQUdELFFBQVEsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUMsR0FBRyxJQUFJLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDOztJQUVwRixJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRTtNQUNwQixNQUFNO0tBQ1A7OztJQUdELElBQUksUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7TUFDdkJyQixNQUFJO1FBQ0YseURBQXlEO1NBQ3hELCtCQUErQjtPQUNqQyxDQUFDO0tBQ0g7O0lBRUQsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQzs7O0lBR3JCLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxRQUFRLElBQUksSUFBSSxLQUFLLFFBQVE7TUFDaEQ7TUFDQUEsTUFBSTtRQUNGLDZCQUE2QixHQUFHLElBQUk7T0FDckMsQ0FBQztLQUNIOztJQUVELElBQUksUUFBUSxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7OztJQUkzQixJQUFJLG1CQUFtQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRTtNQUNwQyxPQUFPLFFBQVE7S0FDaEI7Ozs7SUFJRCxJQUFJLEtBQUssR0FBRyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7O0lBRW5DLElBQUksQ0FBQyxLQUFLLEVBQUU7TUFDVixPQUFPLFFBQVE7S0FDaEI7O0lBRUQsSUFBSSxFQUFFLEdBQUcsZUFBZSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLENBQUM7SUFDN0MsS0FBSyxDQUFDLEdBQUcsR0FBRyxLQUFLLENBQUMsR0FBRyxJQUFJLElBQUk7UUFDekIsS0FBSyxDQUFDLFNBQVM7VUFDYixFQUFFLEdBQUcsU0FBUztVQUNkLEVBQUUsR0FBRyxLQUFLLENBQUMsR0FBRztRQUNoQixXQUFXLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQztXQUNuQixNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsS0FBSyxDQUFDLEdBQUcsR0FBRyxFQUFFLEdBQUcsS0FBSyxDQUFDLEdBQUc7VUFDakUsS0FBSyxDQUFDLEdBQUcsQ0FBQzs7SUFFaEIsSUFBSSxJQUFJLElBQUksS0FBSyxDQUFDLElBQUksS0FBSyxLQUFLLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDN0MsSUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUM5QixJQUFJLFFBQVEsR0FBRyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDekMsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLFVBQVUsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQyxJQUFJLEtBQUssTUFBTSxDQUFDLEVBQUUsQ0FBQyxFQUFFO01BQ25HLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztLQUN4Qjs7OztJQUlELElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxVQUFVLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUMsSUFBSSxLQUFLLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBRTtNQUNuRyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7S0FDeEI7SUFDRDtNQUNFLFFBQVE7U0FDTCxRQUFRLENBQUMsSUFBSTtTQUNiLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUM7U0FDN0IsQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLENBQUM7O1NBRTdCLEVBQUUsUUFBUSxDQUFDLGlCQUFpQixJQUFJLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDO01BQy9FO01BQ0EsUUFBUSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztLQUN6QztJQUNELE9BQU8sUUFBUTtHQUNoQjtFQUNGOzs7O0FBSUQsSUFBSSxtQkFBbUIsR0FBRztFQUN4QixNQUFNLEVBQUUsU0FBUyxNQUFNLEVBQUUsQ0FBQyxFQUFFO0lBQzFCLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLE1BQU0sQ0FBQztJQUNyRCxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sSUFBSSxFQUFFLENBQUM7O0lBRXpDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDO0dBQzlCO0VBQ0Y7O0FBRUQsSUFBSSxNQUFNLEdBQUc7RUFDWCxLQUFLLEVBQUU7SUFDTCxVQUFVLEVBQUUsY0FBYztJQUMxQixrQkFBa0IsRUFBRSxtQkFBbUI7R0FDeEM7RUFDRCxLQUFLLEVBQUUsRUFBRTtFQUNULE9BQU8sRUFBRSxFQUFFO0VBQ1o7Ozs7QUFJRFIsS0FBRyxDQUFDLE1BQU0sQ0FBQyxhQUFhLEdBQUcsS0FBSyxDQUFDO0FBQ2pDQSxLQUFHLENBQUMsTUFBTSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7QUFDNUJBLEtBQUcsQ0FBQyxNQUFNLENBQUMsWUFBWSxHQUFHLFlBQVksQ0FBQzs7QUFFdkMsU0FBUyxLQUFLLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRTtFQUNsQyxLQUFLLE9BQU8sS0FBSyxLQUFLLENBQUMsS0FBRyxPQUFPLEdBQUcsRUFBRSxHQUFDOzs7RUFHdkMsT0FBTyxTQUFTLENBQUMsS0FBSyxDQUFDO0VBQ3ZCLElBQUksUUFBUSxHQUFHLE9BQU8sQ0FBQyxRQUFRLElBQUksY0FBYyxFQUFFLENBQUM7RUFDcEQsSUFBSSxFQUFFLEdBQUc2QyxnQkFBYyxDQUFDLFNBQVMsRUFBRSxZQUFZLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDOztFQUU1RSxJQUFJLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRTtJQUM1QixFQUFFLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUM7R0FDNUIsTUFBTTtJQUNMLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztHQUNiOztFQUVELElBQUksa0JBQWtCLEdBQUcsMEJBQTBCLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDOztFQUVoRyxJQUFJLGtCQUFrQixFQUFFO0lBQ3RCLE9BQU8sa0JBQWtCLENBQUMsTUFBTSxDQUFDO0dBQ2xDOztFQUVELElBQUksZUFBZSxHQUFHO0lBQ3BCLGtCQUFrQixFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCO0lBQzlDLElBQUksRUFBRSxDQUFDLEdBQUcsT0FBTyxDQUFDLElBQUksSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLFNBQVMsRUFBRTtHQUN2RCxDQUFDOztFQUVGLE9BQU8sSUFBSSxVQUFVLENBQUMsRUFBRSxFQUFFLGVBQWUsQ0FBQztDQUMzQzs7OztBQUlELFNBQVMsT0FBTztFQUNkLFNBQVM7RUFDVCxPQUFPO0VBQ1A7RUFDQSxLQUFLLE9BQU8sS0FBSyxLQUFLLENBQUMsS0FBRyxPQUFPLEdBQUcsRUFBRSxHQUFDOztFQUV2QyxJQUFJLEdBQUcsR0FBRyxPQUFPLENBQUMsUUFBUSxJQUFJN0MsS0FBRyxDQUFDOzs7O0VBSWxDLElBQUksU0FBUyxDQUFDLElBQUksSUFBSSxTQUFTLENBQUMsVUFBVSxFQUFFO0lBQzFDLE9BQU8sU0FBUyxDQUFDLFVBQVUsQ0FBQ1csWUFBVSxDQUFDRCxVQUFRLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNsRSxPQUFPLFNBQVMsQ0FBQyxVQUFVLENBQUNHLFdBQVMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztHQUN4RDs7RUFFRCxJQUFJLGlCQUFpQixHQUFHMEIsNEJBQTBCLENBQUMsU0FBUyxDQUFDLENBQUM7RUFDOUQsSUFBSSx1QkFBdUIsR0FBR0MsZ0NBQThCLENBQUMsR0FBRyxDQUFDLENBQUM7O0VBRWxFLE9BQU8sS0FBSyxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxPQUFPO0lBQy9DLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLHVCQUF1QjtNQUNwRCxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUMxQjs7O0FBR0QsSUFBSSxPQUFPLEdBQUcsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDL0IsSUFBSSxVQUFVLEdBQUcsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7O0FBRWpDLElBQUksY0FBYyxHQUFHO0VBQ25CLElBQUksRUFBRSxnQkFBZ0I7RUFDdEIsS0FBSyxFQUFFO0lBQ0wsRUFBRSxFQUFFO01BQ0YsSUFBSSxFQUFFLE9BQU87TUFDYixRQUFRLEVBQUUsSUFBSTtLQUNmO0lBQ0QsR0FBRyxFQUFFO01BQ0gsSUFBSSxFQUFFLE1BQU07TUFDWixPQUFPLEVBQUUsR0FBRztLQUNiO0lBQ0QsS0FBSyxFQUFFLE9BQU87SUFDZCxNQUFNLEVBQUUsT0FBTztJQUNmLE9BQU8sRUFBRSxPQUFPO0lBQ2hCLFdBQVcsRUFBRSxNQUFNO0lBQ25CLGdCQUFnQixFQUFFLE1BQU07SUFDeEIsS0FBSyxFQUFFO01BQ0wsSUFBSSxFQUFFLFVBQVU7TUFDaEIsT0FBTyxFQUFFLE9BQU87S0FDakI7R0FDRjtFQUNELE1BQU0sRUFBRSxTQUFTLE1BQU0sRUFBRSxDQUFDLEVBQUU7SUFDMUIsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUM7R0FDbkQ7RUFDRjs7QUFFRCxJQUFJLEtBQUssR0FBRztFQUNWLGNBQWMsRUFBRSxjQUFjO0VBQzlCLE1BQU0sRUFBRSxNQUFNO0VBQ2QsS0FBSyxFQUFFLEtBQUs7RUFDWixPQUFPLEVBQUUsT0FBTztFQUNoQixjQUFjLEVBQUUsY0FBYztFQUM5QixtQkFBbUIsRUFBRSxtQkFBbUI7RUFDeEMsY0FBYyxFQUFFLGNBQWM7RUFDL0I7O0FBRUQsZ0JBQWMsR0FBRyxLQUFLLENBQUM7O0FDenRKdkI7O0FBRUEsU0FBU1MsWUFBVSxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFO0VBQ3pDLElBQUksT0FBTztLQUNSLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsRUFBRTtJQUN0RCxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUU7TUFDMUIsT0FBTyxPQUNLLFNBQ1AsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7S0FDckMsTUFBTTtNQUNMLE9BQU8sa0JBQ0YsTUFBTSxDQUFDLEdBQUcsQ0FBQztRQUNkLE9BQVUsQ0FDWDtLQUNGO0dBQ0Y7Q0FDRjs7QUFFRCxBQUFPLFNBQVNDLGNBQVk7RUFDMUIsT0FBTztFQUNQLE1BQU07RUFDRztFQUNULE9BQU8sa0JBQ0YsT0FBTztLQUNWLEtBQUssRUFBRUQsWUFBVSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQztJQUNqRCxLQUFLLEVBQUVBLFlBQVUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUM7SUFDakQsT0FBTyxFQUFFQSxZQUFVLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFDLENBQ3hEO0NBQ0Y7O0FDMUJELGVBQWVFLFlBQVMsQ0FBQyxNQUFNOztBQ0YvQjs7QUFVQSxHQUFHLENBQUMsTUFBTSxDQUFDLGFBQWEsR0FBRyxNQUFLO0FBQ2hDLEdBQUcsQ0FBQyxNQUFNLENBQUMsUUFBUSxHQUFHLE1BQUs7O0FBRTNCLEFBQWUsU0FBUyxjQUFjLEVBQUUsU0FBUyxFQUFhLE9BQXFCLEVBQVU7bUNBQXhCLEdBQVk7O0VBQy9FdEQsSUFBTSxRQUFRLEdBQUd1RCxnQ0FBYyxHQUFFOztFQUVqQyxJQUFJLENBQUMsUUFBUSxFQUFFO0lBQ2IsVUFBVSxDQUFDLG1FQUFtRSxFQUFDO0dBQ2hGOztFQUVELE9BQU8sU0FBUyxDQUFDLE1BQUs7O0VBRXRCLElBQUksT0FBTyxDQUFDLGdCQUFnQixFQUFFO0lBQzVCLFVBQVUsQ0FBQyxxREFBcUQsRUFBQztHQUNsRTtFQUNEdkQsSUFBTSxRQUFRLEdBQUcsT0FBTyxDQUFDLFFBQVEsSUFBSXNELFlBQVMsQ0FBQyxjQUFjLEdBQUU7RUFDL0R0RCxJQUFNLEVBQUUsR0FBRyxjQUFjLENBQUMsU0FBUyxFQUFFcUQsY0FBWSxDQUFDLE9BQU8sRUFBRUcsUUFBTSxDQUFDLEVBQUUsUUFBUSxFQUFDO0VBQzdFdkQsSUFBSSxjQUFjLEdBQUcsR0FBRTs7O0VBR3ZCLFFBQVEsQ0FBQyxjQUFjLENBQUMsRUFBRSxZQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUU7SUFDckMsSUFBSSxHQUFHLEVBQUU7TUFDUCxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBQztLQUNqQjtJQUNELGNBQWMsR0FBRyxJQUFHO0dBQ3JCLEVBQUM7RUFDRixPQUFPLGNBQWM7Q0FDdEI7O0FDckNEOztBQUtBLEFBQWUsU0FBUyxNQUFNLEVBQUUsU0FBUyxFQUFhLE9BQXFCLEVBQVU7bUNBQXhCLEdBQVk7O0VBQ3ZFRCxJQUFNLGNBQWMsR0FBRyxjQUFjLENBQUMsU0FBUyxFQUFFLE9BQU8sRUFBQztFQUN6RCxPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsY0FBYyxDQUFDO0NBQ3hDOztBQ0pELGNBQWU7a0JBQ2IsY0FBYztVQUNkd0QsUUFBTTtVQUNOLE1BQU07Q0FDUDs7OzsifQ==
