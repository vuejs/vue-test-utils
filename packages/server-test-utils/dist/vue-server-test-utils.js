'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var vueTemplateCompiler = require('vue-template-compiler');
var Vue = _interopDefault(require('vue'));
var testUtils = _interopDefault(require('@vue/test-utils'));
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

  if (component.extendOptions && !component.options.render) {
    compileTemplate(component.options);
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
    compileTemplate(component);
  }

  addEventLogger(vue);

  var Constructor = vue.extend(component);

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
        warn(("an extended child component " + c + " has been modified to ensure it has the correct instance properties. This means it is not possible to find the component with a component selector. To find the component, you must stub it manually using the mocks mounting option."));
      }
      instanceOptions.components[c] = vue.extend(component.components[c]);
    }
  });

  Object.keys(stubComponents).forEach(function (c) {
    vue.component(c, stubComponents[c]);
  });

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
    provide: getOptions('provide', options.provide, config)})
}

var config = testUtils.config

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
  var vueClass = options.localVue || testUtils.createLocalVue();
  var vm = createInstance(component, mergeOptions(options, config), vueClass);
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

var index = {
  renderToString: renderToString,
  config: config,
  render: render
}

module.exports = index;
