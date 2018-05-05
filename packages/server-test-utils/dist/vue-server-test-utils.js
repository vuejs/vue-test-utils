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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidnVlLXNlcnZlci10ZXN0LXV0aWxzLmpzIiwic291cmNlcyI6WyIuLi8uLi9zaGFyZWQvdXRpbC5qcyIsIi4uLy4uL2NyZWF0ZS1pbnN0YW5jZS92YWxpZGF0ZS1zbG90cy5qcyIsIi4uLy4uL2NyZWF0ZS1pbnN0YW5jZS9hZGQtc2xvdHMuanMiLCIuLi8uLi9jcmVhdGUtaW5zdGFuY2UvYWRkLXNjb3BlZC1zbG90cy5qcyIsIi4uLy4uL2NyZWF0ZS1pbnN0YW5jZS9hZGQtbW9ja3MuanMiLCIuLi8uLi9jcmVhdGUtaW5zdGFuY2UvYWRkLXByb3ZpZGUuanMiLCIuLi8uLi9jcmVhdGUtaW5zdGFuY2UvbG9nLWV2ZW50cy5qcyIsIi4uLy4uL3NoYXJlZC92YWxpZGF0b3JzLmpzIiwiLi4vLi4vc2hhcmVkL2NvbXBpbGUtdGVtcGxhdGUuanMiLCIuLi8uLi9zaGFyZWQvc3R1Yi1jb21wb25lbnRzLmpzIiwiLi4vLi4vY3JlYXRlLWluc3RhbmNlL2NvbXBpbGUtdGVtcGxhdGUuanMiLCIuLi8uLi9jcmVhdGUtaW5zdGFuY2UvZGVsZXRlLW1vdW50aW5nLW9wdGlvbnMuanMiLCIuLi8uLi9jcmVhdGUtaW5zdGFuY2UvY3JlYXRlLWZ1bmN0aW9uYWwtY29tcG9uZW50LmpzIiwiLi4vLi4vY3JlYXRlLWluc3RhbmNlL2NyZWF0ZS1pbnN0YW5jZS5qcyIsIi4uLy4uL3NoYXJlZC9tZXJnZS1vcHRpb25zLmpzIiwiLi4vc3JjL2NvbmZpZy5qcyIsIi4uL3NyYy9yZW5kZXJUb1N0cmluZy5qcyIsIi4uL3NyYy9yZW5kZXIuanMiLCIuLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQGZsb3dcblxuZXhwb3J0IGZ1bmN0aW9uIHRocm93RXJyb3IgKG1zZzogc3RyaW5nKSB7XG4gIHRocm93IG5ldyBFcnJvcihgW3Z1ZS10ZXN0LXV0aWxzXTogJHttc2d9YClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdhcm4gKG1zZzogc3RyaW5nKSB7XG4gIGNvbnNvbGUuZXJyb3IoYFt2dWUtdGVzdC11dGlsc106ICR7bXNnfWApXG59XG5cbmNvbnN0IGNhbWVsaXplUkUgPSAvLShcXHcpL2dcbmV4cG9ydCBjb25zdCBjYW1lbGl6ZSA9IChzdHI6IHN0cmluZykgPT4gc3RyLnJlcGxhY2UoY2FtZWxpemVSRSwgKF8sIGMpID0+IGMgPyBjLnRvVXBwZXJDYXNlKCkgOiAnJylcblxuLyoqXG4gKiBDYXBpdGFsaXplIGEgc3RyaW5nLlxuICovXG5leHBvcnQgY29uc3QgY2FwaXRhbGl6ZSA9IChzdHI6IHN0cmluZykgPT4gc3RyLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgc3RyLnNsaWNlKDEpXG5cbi8qKlxuICogSHlwaGVuYXRlIGEgY2FtZWxDYXNlIHN0cmluZy5cbiAqL1xuY29uc3QgaHlwaGVuYXRlUkUgPSAvXFxCKFtBLVpdKS9nXG5leHBvcnQgY29uc3QgaHlwaGVuYXRlID0gKHN0cjogc3RyaW5nKSA9PiBzdHIucmVwbGFjZShoeXBoZW5hdGVSRSwgJy0kMScpLnRvTG93ZXJDYXNlKClcbiIsIi8vIEBmbG93XG5cbmltcG9ydCB7IHRocm93RXJyb3IgfSBmcm9tICdzaGFyZWQvdXRpbCdcblxuZnVuY3Rpb24gaXNWYWxpZFNsb3QgKHNsb3Q6IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gQXJyYXkuaXNBcnJheShzbG90KSB8fCAoc2xvdCAhPT0gbnVsbCAmJiB0eXBlb2Ygc2xvdCA9PT0gJ29iamVjdCcpIHx8IHR5cGVvZiBzbG90ID09PSAnc3RyaW5nJ1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVTbG90cyAoc2xvdHM6IE9iamVjdCk6IHZvaWQge1xuICBzbG90cyAmJiBPYmplY3Qua2V5cyhzbG90cykuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgaWYgKCFpc1ZhbGlkU2xvdChzbG90c1trZXldKSkge1xuICAgICAgdGhyb3dFcnJvcignc2xvdHNba2V5XSBtdXN0IGJlIGEgQ29tcG9uZW50LCBzdHJpbmcgb3IgYW4gYXJyYXkgb2YgQ29tcG9uZW50cycpXG4gICAgfVxuXG4gICAgaWYgKEFycmF5LmlzQXJyYXkoc2xvdHNba2V5XSkpIHtcbiAgICAgIHNsb3RzW2tleV0uZm9yRWFjaCgoc2xvdFZhbHVlKSA9PiB7XG4gICAgICAgIGlmICghaXNWYWxpZFNsb3Qoc2xvdFZhbHVlKSkge1xuICAgICAgICAgIHRocm93RXJyb3IoJ3Nsb3RzW2tleV0gbXVzdCBiZSBhIENvbXBvbmVudCwgc3RyaW5nIG9yIGFuIGFycmF5IG9mIENvbXBvbmVudHMnKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cbiAgfSlcbn1cbiIsIi8vIEBmbG93XG5cbmltcG9ydCB7IGNvbXBpbGVUb0Z1bmN0aW9ucyB9IGZyb20gJ3Z1ZS10ZW1wbGF0ZS1jb21waWxlcidcbmltcG9ydCB7IHRocm93RXJyb3IgfSBmcm9tICdzaGFyZWQvdXRpbCdcbmltcG9ydCB7IHZhbGlkYXRlU2xvdHMgfSBmcm9tICcuL3ZhbGlkYXRlLXNsb3RzJ1xuXG5mdW5jdGlvbiBpc1NpbmdsZUVsZW1lbnQgKHNsb3RWYWx1ZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIGNvbnN0IF9zbG90VmFsdWUgPSBzbG90VmFsdWUudHJpbSgpXG4gIGlmIChfc2xvdFZhbHVlWzBdICE9PSAnPCcgfHwgX3Nsb3RWYWx1ZVtfc2xvdFZhbHVlLmxlbmd0aCAtIDFdICE9PSAnPicpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuICBjb25zdCBkb21QYXJzZXIgPSBuZXcgd2luZG93LkRPTVBhcnNlcigpXG4gIGNvbnN0IF9kb2N1bWVudCA9IGRvbVBhcnNlci5wYXJzZUZyb21TdHJpbmcoc2xvdFZhbHVlLCAndGV4dC9odG1sJylcbiAgcmV0dXJuIF9kb2N1bWVudC5ib2R5LmNoaWxkRWxlbWVudENvdW50ID09PSAxXG59XG5cbi8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vdnVlanMvdnVlLXRlc3QtdXRpbHMvcHVsbC8yNzRcbmZ1bmN0aW9uIGNyZWF0ZVZOb2RlcyAodm06IENvbXBvbmVudCwgc2xvdFZhbHVlOiBzdHJpbmcpIHtcbiAgY29uc3QgY29tcGlsZWRSZXN1bHQgPSBjb21waWxlVG9GdW5jdGlvbnMoYDxkaXY+JHtzbG90VmFsdWV9e3sgfX08L2Rpdj5gKVxuICBjb25zdCBfc3RhdGljUmVuZGVyRm5zID0gdm0uX3JlbmRlclByb3h5LiRvcHRpb25zLnN0YXRpY1JlbmRlckZuc1xuICB2bS5fcmVuZGVyUHJveHkuJG9wdGlvbnMuc3RhdGljUmVuZGVyRm5zID0gY29tcGlsZWRSZXN1bHQuc3RhdGljUmVuZGVyRm5zXG4gIGNvbnN0IGVsZW0gPSBjb21waWxlZFJlc3VsdC5yZW5kZXIuY2FsbCh2bS5fcmVuZGVyUHJveHksIHZtLiRjcmVhdGVFbGVtZW50KS5jaGlsZHJlblxuICB2bS5fcmVuZGVyUHJveHkuJG9wdGlvbnMuc3RhdGljUmVuZGVyRm5zID0gX3N0YXRpY1JlbmRlckZuc1xuICByZXR1cm4gZWxlbVxufVxuXG5mdW5jdGlvbiB2YWxpZGF0ZUVudmlyb25tZW50ICgpOiB2b2lkIHtcbiAgaWYgKCFjb21waWxlVG9GdW5jdGlvbnMpIHtcbiAgICB0aHJvd0Vycm9yKCd2dWVUZW1wbGF0ZUNvbXBpbGVyIGlzIHVuZGVmaW5lZCwgeW91IG11c3QgcGFzcyBjb21wb25lbnRzIGV4cGxpY2l0bHkgaWYgdnVlLXRlbXBsYXRlLWNvbXBpbGVyIGlzIHVuZGVmaW5lZCcpXG4gIH1cbiAgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgdGhyb3dFcnJvcigndGhlIHNsb3RzIHN0cmluZyBvcHRpb24gZG9lcyBub3Qgc3VwcG9ydCBzdHJpbmdzIGluIHNlcnZlci10ZXN0LXVpdGxzLicpXG4gIH1cbiAgaWYgKHdpbmRvdy5uYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9QaGFudG9tSlMvaSkpIHtcbiAgICB0aHJvd0Vycm9yKCd0aGUgc2xvdHMgb3B0aW9uIGRvZXMgbm90IHN1cHBvcnQgc3RyaW5ncyBpbiBQaGFudG9tSlMuIFBsZWFzZSB1c2UgUHVwcGV0ZWVyLCBvciBwYXNzIGEgY29tcG9uZW50LicpXG4gIH1cbn1cblxuZnVuY3Rpb24gYWRkU2xvdFRvVm0gKHZtOiBDb21wb25lbnQsIHNsb3ROYW1lOiBzdHJpbmcsIHNsb3RWYWx1ZTogU2xvdFZhbHVlKTogdm9pZCB7XG4gIGxldCBlbGVtXG4gIGlmICh0eXBlb2Ygc2xvdFZhbHVlID09PSAnc3RyaW5nJykge1xuICAgIHZhbGlkYXRlRW52aXJvbm1lbnQoKVxuICAgIGlmIChpc1NpbmdsZUVsZW1lbnQoc2xvdFZhbHVlKSkge1xuICAgICAgZWxlbSA9IHZtLiRjcmVhdGVFbGVtZW50KGNvbXBpbGVUb0Z1bmN0aW9ucyhzbG90VmFsdWUpKVxuICAgIH0gZWxzZSB7XG4gICAgICBlbGVtID0gY3JlYXRlVk5vZGVzKHZtLCBzbG90VmFsdWUpXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGVsZW0gPSB2bS4kY3JlYXRlRWxlbWVudChzbG90VmFsdWUpXG4gIH1cbiAgaWYgKEFycmF5LmlzQXJyYXkoZWxlbSkpIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh2bS4kc2xvdHNbc2xvdE5hbWVdKSkge1xuICAgICAgdm0uJHNsb3RzW3Nsb3ROYW1lXSA9IFsuLi52bS4kc2xvdHNbc2xvdE5hbWVdLCAuLi5lbGVtXVxuICAgIH0gZWxzZSB7XG4gICAgICB2bS4kc2xvdHNbc2xvdE5hbWVdID0gWy4uLmVsZW1dXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmIChBcnJheS5pc0FycmF5KHZtLiRzbG90c1tzbG90TmFtZV0pKSB7XG4gICAgICB2bS4kc2xvdHNbc2xvdE5hbWVdLnB1c2goZWxlbSlcbiAgICB9IGVsc2Uge1xuICAgICAgdm0uJHNsb3RzW3Nsb3ROYW1lXSA9IFtlbGVtXVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYWRkU2xvdHMgKHZtOiBDb21wb25lbnQsIHNsb3RzOiBPYmplY3QpOiB2b2lkIHtcbiAgdmFsaWRhdGVTbG90cyhzbG90cylcbiAgT2JqZWN0LmtleXMoc2xvdHMpLmZvckVhY2goKGtleSkgPT4ge1xuICAgIGlmIChBcnJheS5pc0FycmF5KHNsb3RzW2tleV0pKSB7XG4gICAgICBzbG90c1trZXldLmZvckVhY2goKHNsb3RWYWx1ZSkgPT4ge1xuICAgICAgICBhZGRTbG90VG9WbSh2bSwga2V5LCBzbG90VmFsdWUpXG4gICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICBhZGRTbG90VG9WbSh2bSwga2V5LCBzbG90c1trZXldKVxuICAgIH1cbiAgfSlcbn1cbiIsIi8vIEBmbG93XG5cbmltcG9ydCB7IGNvbXBpbGVUb0Z1bmN0aW9ucyB9IGZyb20gJ3Z1ZS10ZW1wbGF0ZS1jb21waWxlcidcbmltcG9ydCB7IHRocm93RXJyb3IgfSBmcm9tICdzaGFyZWQvdXRpbCdcblxuZXhwb3J0IGZ1bmN0aW9uIGFkZFNjb3BlZFNsb3RzICh2bTogQ29tcG9uZW50LCBzY29wZWRTbG90czogT2JqZWN0KTogdm9pZCB7XG4gIE9iamVjdC5rZXlzKHNjb3BlZFNsb3RzKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICBjb25zdCB0ZW1wbGF0ZSA9IHNjb3BlZFNsb3RzW2tleV0udHJpbSgpXG4gICAgaWYgKHRlbXBsYXRlLnN1YnN0cigwLCA5KSA9PT0gJzx0ZW1wbGF0ZScpIHtcbiAgICAgIHRocm93RXJyb3IoJ3RoZSBzY29wZWRTbG90cyBvcHRpb24gZG9lcyBub3Qgc3VwcG9ydCBhIHRlbXBsYXRlIHRhZyBhcyB0aGUgcm9vdCBlbGVtZW50LicpXG4gICAgfVxuICAgIGNvbnN0IGRvbVBhcnNlciA9IG5ldyB3aW5kb3cuRE9NUGFyc2VyKClcbiAgICBjb25zdCBfZG9jdW1lbnQgPSBkb21QYXJzZXIucGFyc2VGcm9tU3RyaW5nKHRlbXBsYXRlLCAndGV4dC9odG1sJylcbiAgICB2bS4kX3Z1ZVRlc3RVdGlsc19zY29wZWRTbG90c1trZXldID0gY29tcGlsZVRvRnVuY3Rpb25zKHRlbXBsYXRlKS5yZW5kZXJcbiAgICB2bS4kX3Z1ZVRlc3RVdGlsc19zbG90U2NvcGVzW2tleV0gPSBfZG9jdW1lbnQuYm9keS5maXJzdENoaWxkLmdldEF0dHJpYnV0ZSgnc2xvdC1zY29wZScpXG4gIH0pXG59XG4iLCIvLyBAZmxvd1xuaW1wb3J0ICQkVnVlIGZyb20gJ3Z1ZSdcbmltcG9ydCB7IHdhcm4gfSBmcm9tICdzaGFyZWQvdXRpbCdcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gYWRkTW9ja3MgKG1vY2tlZFByb3BlcnRpZXM6IE9iamVjdCwgVnVlOiBDb21wb25lbnQpIHtcbiAgT2JqZWN0LmtleXMobW9ja2VkUHJvcGVydGllcykuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgdHJ5IHtcbiAgICAgIFZ1ZS5wcm90b3R5cGVba2V5XSA9IG1vY2tlZFByb3BlcnRpZXNba2V5XVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHdhcm4oYGNvdWxkIG5vdCBvdmVyd3JpdGUgcHJvcGVydHkgJHtrZXl9LCB0aGlzIHVzdWFsbHkgY2F1c2VkIGJ5IGEgcGx1Z2luIHRoYXQgaGFzIGFkZGVkIHRoZSBwcm9wZXJ0eSBhcyBhIHJlYWQtb25seSB2YWx1ZWApXG4gICAgfVxuICAgICQkVnVlLnV0aWwuZGVmaW5lUmVhY3RpdmUoVnVlLCBrZXksIG1vY2tlZFByb3BlcnRpZXNba2V5XSlcbiAgfSlcbn1cbiIsImZ1bmN0aW9uIGFkZFByb3ZpZGUgKGNvbXBvbmVudCwgb3B0aW9uUHJvdmlkZSwgb3B0aW9ucykge1xuICBjb25zdCBwcm92aWRlID0gdHlwZW9mIG9wdGlvblByb3ZpZGUgPT09ICdmdW5jdGlvbidcbiAgICA/IG9wdGlvblByb3ZpZGVcbiAgICA6IE9iamVjdC5hc3NpZ24oe30sIG9wdGlvblByb3ZpZGUpXG5cbiAgb3B0aW9ucy5iZWZvcmVDcmVhdGUgPSBmdW5jdGlvbiB2dWVUZXN0VXRpbEJlZm9yZUNyZWF0ZSAoKSB7XG4gICAgdGhpcy5fcHJvdmlkZWQgPSB0eXBlb2YgcHJvdmlkZSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgPyBwcm92aWRlLmNhbGwodGhpcylcbiAgICAgIDogcHJvdmlkZVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGFkZFByb3ZpZGVcbiIsIi8vIEBmbG93XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2dFdmVudHMgKHZtOiBDb21wb25lbnQsIGVtaXR0ZWQ6IE9iamVjdCwgZW1pdHRlZEJ5T3JkZXI6IEFycmF5PGFueT4pIHtcbiAgY29uc3QgZW1pdCA9IHZtLiRlbWl0XG4gIHZtLiRlbWl0ID0gKG5hbWUsIC4uLmFyZ3MpID0+IHtcbiAgICAoZW1pdHRlZFtuYW1lXSB8fCAoZW1pdHRlZFtuYW1lXSA9IFtdKSkucHVzaChhcmdzKVxuICAgIGVtaXR0ZWRCeU9yZGVyLnB1c2goeyBuYW1lLCBhcmdzIH0pXG4gICAgcmV0dXJuIGVtaXQuY2FsbCh2bSwgbmFtZSwgLi4uYXJncylcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYWRkRXZlbnRMb2dnZXIgKHZ1ZTogQ29tcG9uZW50KSB7XG4gIHZ1ZS5taXhpbih7XG4gICAgYmVmb3JlQ3JlYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLl9fZW1pdHRlZCA9IE9iamVjdC5jcmVhdGUobnVsbClcbiAgICAgIHRoaXMuX19lbWl0dGVkQnlPcmRlciA9IFtdXG4gICAgICBsb2dFdmVudHModGhpcywgdGhpcy5fX2VtaXR0ZWQsIHRoaXMuX19lbWl0dGVkQnlPcmRlcilcbiAgICB9XG4gIH0pXG59XG4iLCIvLyBAZmxvd1xuaW1wb3J0IHsgdGhyb3dFcnJvciB9IGZyb20gJy4vdXRpbCdcblxuZXhwb3J0IGZ1bmN0aW9uIGlzRG9tU2VsZWN0b3IgKHNlbGVjdG9yOiBhbnkpIHtcbiAgaWYgKHR5cGVvZiBzZWxlY3RvciAhPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIHRyeSB7XG4gICAgaWYgKHR5cGVvZiBkb2N1bWVudCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRocm93RXJyb3IoJ21vdW50IG11c3QgYmUgcnVuIGluIGEgYnJvd3NlciBlbnZpcm9ubWVudCBsaWtlIFBoYW50b21KUywganNkb20gb3IgY2hyb21lJylcbiAgICB9XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgdGhyb3dFcnJvcignbW91bnQgbXVzdCBiZSBydW4gaW4gYSBicm93c2VyIGVudmlyb25tZW50IGxpa2UgUGhhbnRvbUpTLCBqc2RvbSBvciBjaHJvbWUnKVxuICB9XG5cbiAgdHJ5IHtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKVxuICAgIHJldHVybiB0cnVlXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzVnVlQ29tcG9uZW50IChjb21wb25lbnQ6IGFueSkge1xuICBpZiAodHlwZW9mIGNvbXBvbmVudCA9PT0gJ2Z1bmN0aW9uJyAmJiBjb21wb25lbnQub3B0aW9ucykge1xuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICBpZiAoY29tcG9uZW50ID09PSBudWxsIHx8IHR5cGVvZiBjb21wb25lbnQgIT09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICBpZiAoY29tcG9uZW50LmV4dGVuZHMgfHwgY29tcG9uZW50Ll9DdG9yKSB7XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIHJldHVybiB0eXBlb2YgY29tcG9uZW50LnJlbmRlciA9PT0gJ2Z1bmN0aW9uJ1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29tcG9uZW50TmVlZHNDb21waWxpbmcgKGNvbXBvbmVudDogQ29tcG9uZW50KSB7XG4gIHJldHVybiBjb21wb25lbnQgJiZcbiAgICAhY29tcG9uZW50LnJlbmRlciAmJlxuICAgIChjb21wb25lbnQudGVtcGxhdGUgfHwgY29tcG9uZW50LmV4dGVuZHMpICYmXG4gICAgIWNvbXBvbmVudC5mdW5jdGlvbmFsXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1JlZlNlbGVjdG9yIChyZWZPcHRpb25zT2JqZWN0OiBhbnkpIHtcbiAgaWYgKHR5cGVvZiByZWZPcHRpb25zT2JqZWN0ICE9PSAnb2JqZWN0JyB8fCBPYmplY3Qua2V5cyhyZWZPcHRpb25zT2JqZWN0IHx8IHt9KS5sZW5ndGggIT09IDEpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIHJldHVybiB0eXBlb2YgcmVmT3B0aW9uc09iamVjdC5yZWYgPT09ICdzdHJpbmcnXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc05hbWVTZWxlY3RvciAobmFtZU9wdGlvbnNPYmplY3Q6IGFueSkge1xuICBpZiAodHlwZW9mIG5hbWVPcHRpb25zT2JqZWN0ICE9PSAnb2JqZWN0JyB8fCBuYW1lT3B0aW9uc09iamVjdCA9PT0gbnVsbCkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgcmV0dXJuICEhbmFtZU9wdGlvbnNPYmplY3QubmFtZVxufVxuIiwiLy8gQGZsb3dcblxuaW1wb3J0IHsgY29tcGlsZVRvRnVuY3Rpb25zIH0gZnJvbSAndnVlLXRlbXBsYXRlLWNvbXBpbGVyJ1xuXG5leHBvcnQgZnVuY3Rpb24gY29tcGlsZVRlbXBsYXRlIChjb21wb25lbnQ6IENvbXBvbmVudCkge1xuICBpZiAoY29tcG9uZW50LmNvbXBvbmVudHMpIHtcbiAgICBPYmplY3Qua2V5cyhjb21wb25lbnQuY29tcG9uZW50cykuZm9yRWFjaCgoYykgPT4ge1xuICAgICAgY29uc3QgY21wID0gY29tcG9uZW50LmNvbXBvbmVudHNbY11cbiAgICAgIGlmICghY21wLnJlbmRlcikge1xuICAgICAgICBjb21waWxlVGVtcGxhdGUoY21wKVxuICAgICAgfVxuICAgIH0pXG4gIH1cbiAgaWYgKGNvbXBvbmVudC5leHRlbmRzKSB7XG4gICAgY29tcGlsZVRlbXBsYXRlKGNvbXBvbmVudC5leHRlbmRzKVxuICB9XG4gIGlmIChjb21wb25lbnQudGVtcGxhdGUpIHtcbiAgICBPYmplY3QuYXNzaWduKGNvbXBvbmVudCwgY29tcGlsZVRvRnVuY3Rpb25zKGNvbXBvbmVudC50ZW1wbGF0ZSkpXG4gIH1cbn1cbiIsIi8vIEBmbG93XG5cbmltcG9ydCBWdWUgZnJvbSAndnVlJ1xuaW1wb3J0IHsgY29tcGlsZVRvRnVuY3Rpb25zIH0gZnJvbSAndnVlLXRlbXBsYXRlLWNvbXBpbGVyJ1xuaW1wb3J0IHsgdGhyb3dFcnJvciB9IGZyb20gJy4vdXRpbCdcbmltcG9ydCB7IGNvbXBvbmVudE5lZWRzQ29tcGlsaW5nIH0gZnJvbSAnLi92YWxpZGF0b3JzJ1xuaW1wb3J0IHsgY29tcGlsZVRlbXBsYXRlIH0gZnJvbSAnLi9jb21waWxlLXRlbXBsYXRlJ1xuaW1wb3J0IHsgY2FwaXRhbGl6ZSwgY2FtZWxpemUsIGh5cGhlbmF0ZSB9IGZyb20gJy4vdXRpbCdcblxuZnVuY3Rpb24gaXNWdWVDb21wb25lbnQgKGNvbXApIHtcbiAgcmV0dXJuIGNvbXAgJiYgKGNvbXAucmVuZGVyIHx8IGNvbXAudGVtcGxhdGUgfHwgY29tcC5vcHRpb25zKVxufVxuXG5mdW5jdGlvbiBpc1ZhbGlkU3R1YiAoc3R1YjogYW55KSB7XG4gIHJldHVybiAhIXN0dWIgJiZcbiAgICAgIHR5cGVvZiBzdHViID09PSAnc3RyaW5nJyB8fFxuICAgICAgKHN0dWIgPT09IHRydWUpIHx8XG4gICAgICAoaXNWdWVDb21wb25lbnQoc3R1YikpXG59XG5cbmZ1bmN0aW9uIGlzUmVxdWlyZWRDb21wb25lbnQgKG5hbWUpIHtcbiAgcmV0dXJuIG5hbWUgPT09ICdLZWVwQWxpdmUnIHx8IG5hbWUgPT09ICdUcmFuc2l0aW9uJyB8fCBuYW1lID09PSAnVHJhbnNpdGlvbkdyb3VwJ1xufVxuXG5mdW5jdGlvbiBnZXRDb3JlUHJvcGVydGllcyAoY29tcG9uZW50OiBDb21wb25lbnQpOiBPYmplY3Qge1xuICByZXR1cm4ge1xuICAgIGF0dHJzOiBjb21wb25lbnQuYXR0cnMsXG4gICAgbmFtZTogY29tcG9uZW50Lm5hbWUsXG4gICAgb246IGNvbXBvbmVudC5vbixcbiAgICBrZXk6IGNvbXBvbmVudC5rZXksXG4gICAgcmVmOiBjb21wb25lbnQucmVmLFxuICAgIHByb3BzOiBjb21wb25lbnQucHJvcHMsXG4gICAgZG9tUHJvcHM6IGNvbXBvbmVudC5kb21Qcm9wcyxcbiAgICBjbGFzczogY29tcG9uZW50LmNsYXNzLFxuICAgIHN0YXRpY0NsYXNzOiBjb21wb25lbnQuc3RhdGljQ2xhc3MsXG4gICAgc3RhdGljU3R5bGU6IGNvbXBvbmVudC5zdGF0aWNTdHlsZSxcbiAgICBzdHlsZTogY29tcG9uZW50LnN0eWxlLFxuICAgIG5vcm1hbGl6ZWRTdHlsZTogY29tcG9uZW50Lm5vcm1hbGl6ZWRTdHlsZSxcbiAgICBuYXRpdmVPbjogY29tcG9uZW50Lm5hdGl2ZU9uLFxuICAgIGZ1bmN0aW9uYWw6IGNvbXBvbmVudC5mdW5jdGlvbmFsXG4gIH1cbn1cbmZ1bmN0aW9uIGNyZWF0ZVN0dWJGcm9tU3RyaW5nICh0ZW1wbGF0ZVN0cmluZzogc3RyaW5nLCBvcmlnaW5hbENvbXBvbmVudDogQ29tcG9uZW50KTogT2JqZWN0IHtcbiAgaWYgKCFjb21waWxlVG9GdW5jdGlvbnMpIHtcbiAgICB0aHJvd0Vycm9yKCd2dWVUZW1wbGF0ZUNvbXBpbGVyIGlzIHVuZGVmaW5lZCwgeW91IG11c3QgcGFzcyBjb21wb25lbnRzIGV4cGxpY2l0bHkgaWYgdnVlLXRlbXBsYXRlLWNvbXBpbGVyIGlzIHVuZGVmaW5lZCcpXG4gIH1cblxuICBpZiAodGVtcGxhdGVTdHJpbmcuaW5kZXhPZihoeXBoZW5hdGUob3JpZ2luYWxDb21wb25lbnQubmFtZSkpICE9PSAtMSB8fFxuICB0ZW1wbGF0ZVN0cmluZy5pbmRleE9mKGNhcGl0YWxpemUob3JpZ2luYWxDb21wb25lbnQubmFtZSkpICE9PSAtMSB8fFxuICB0ZW1wbGF0ZVN0cmluZy5pbmRleE9mKGNhbWVsaXplKG9yaWdpbmFsQ29tcG9uZW50Lm5hbWUpKSAhPT0gLTEpIHtcbiAgICB0aHJvd0Vycm9yKCdvcHRpb25zLnN0dWIgY2Fubm90IGNvbnRhaW4gYSBjaXJjdWxhciByZWZlcmVuY2UnKVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICAuLi5nZXRDb3JlUHJvcGVydGllcyhvcmlnaW5hbENvbXBvbmVudCksXG4gICAgLi4uY29tcGlsZVRvRnVuY3Rpb25zKHRlbXBsYXRlU3RyaW5nKVxuICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUJsYW5rU3R1YiAob3JpZ2luYWxDb21wb25lbnQ6IENvbXBvbmVudCkge1xuICByZXR1cm4ge1xuICAgIC4uLmdldENvcmVQcm9wZXJ0aWVzKG9yaWdpbmFsQ29tcG9uZW50KSxcbiAgICByZW5kZXI6IGggPT4gaCgnJylcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQ29tcG9uZW50U3R1YnMgKG9yaWdpbmFsQ29tcG9uZW50czogT2JqZWN0ID0ge30sIHN0dWJzOiBPYmplY3QpOiBPYmplY3Qge1xuICBjb25zdCBjb21wb25lbnRzID0ge31cbiAgaWYgKCFzdHVicykge1xuICAgIHJldHVybiBjb21wb25lbnRzXG4gIH1cbiAgaWYgKEFycmF5LmlzQXJyYXkoc3R1YnMpKSB7XG4gICAgc3R1YnMuZm9yRWFjaChzdHViID0+IHtcbiAgICAgIGlmIChzdHViID09PSBmYWxzZSkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBzdHViICE9PSAnc3RyaW5nJykge1xuICAgICAgICB0aHJvd0Vycm9yKCdlYWNoIGl0ZW0gaW4gYW4gb3B0aW9ucy5zdHVicyBhcnJheSBtdXN0IGJlIGEgc3RyaW5nJylcbiAgICAgIH1cbiAgICAgIGNvbXBvbmVudHNbc3R1Yl0gPSBjcmVhdGVCbGFua1N0dWIoe30pXG4gICAgfSlcbiAgfSBlbHNlIHtcbiAgICBPYmplY3Qua2V5cyhzdHVicykuZm9yRWFjaChzdHViID0+IHtcbiAgICAgIGlmIChzdHVic1tzdHViXSA9PT0gZmFsc2UpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBpZiAoIWlzVmFsaWRTdHViKHN0dWJzW3N0dWJdKSkge1xuICAgICAgICB0aHJvd0Vycm9yKCdvcHRpb25zLnN0dWIgdmFsdWVzIG11c3QgYmUgcGFzc2VkIGEgc3RyaW5nIG9yIGNvbXBvbmVudCcpXG4gICAgICB9XG4gICAgICBpZiAoc3R1YnNbc3R1Yl0gPT09IHRydWUpIHtcbiAgICAgICAgY29tcG9uZW50c1tzdHViXSA9IGNyZWF0ZUJsYW5rU3R1Yih7fSlcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGlmIChjb21wb25lbnROZWVkc0NvbXBpbGluZyhzdHVic1tzdHViXSkpIHtcbiAgICAgICAgY29tcGlsZVRlbXBsYXRlKHN0dWJzW3N0dWJdKVxuICAgICAgfVxuXG4gICAgICBpZiAob3JpZ2luYWxDb21wb25lbnRzW3N0dWJdKSB7XG4gICAgICAgIC8vIFJlbW92ZSBjYWNoZWQgY29uc3RydWN0b3JcbiAgICAgICAgZGVsZXRlIG9yaWdpbmFsQ29tcG9uZW50c1tzdHViXS5fQ3RvclxuICAgICAgICBpZiAodHlwZW9mIHN0dWJzW3N0dWJdID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIGNvbXBvbmVudHNbc3R1Yl0gPSBjcmVhdGVTdHViRnJvbVN0cmluZyhzdHVic1tzdHViXSwgb3JpZ2luYWxDb21wb25lbnRzW3N0dWJdKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbXBvbmVudHNbc3R1Yl0gPSB7XG4gICAgICAgICAgICAuLi5zdHVic1tzdHViXSxcbiAgICAgICAgICAgIG5hbWU6IG9yaWdpbmFsQ29tcG9uZW50c1tzdHViXS5uYW1lXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAodHlwZW9mIHN0dWJzW3N0dWJdID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIGlmICghY29tcGlsZVRvRnVuY3Rpb25zKSB7XG4gICAgICAgICAgICB0aHJvd0Vycm9yKCd2dWVUZW1wbGF0ZUNvbXBpbGVyIGlzIHVuZGVmaW5lZCwgeW91IG11c3QgcGFzcyBjb21wb25lbnRzIGV4cGxpY2l0bHkgaWYgdnVlLXRlbXBsYXRlLWNvbXBpbGVyIGlzIHVuZGVmaW5lZCcpXG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbXBvbmVudHNbc3R1Yl0gPSB7XG4gICAgICAgICAgICAuLi5jb21waWxlVG9GdW5jdGlvbnMoc3R1YnNbc3R1Yl0pXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbXBvbmVudHNbc3R1Yl0gPSB7XG4gICAgICAgICAgICAuLi5zdHVic1tzdHViXVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gaWdub3JlRWxlbWVudHMgZG9lcyBub3QgZXhpc3QgaW4gVnVlIDIuMC54XG4gICAgICBpZiAoVnVlLmNvbmZpZy5pZ25vcmVkRWxlbWVudHMpIHtcbiAgICAgICAgVnVlLmNvbmZpZy5pZ25vcmVkRWxlbWVudHMucHVzaChzdHViKVxuICAgICAgfVxuICAgIH0pXG4gIH1cbiAgcmV0dXJuIGNvbXBvbmVudHNcbn1cblxuZnVuY3Rpb24gc3R1YkNvbXBvbmVudHMgKGNvbXBvbmVudHM6IE9iamVjdCwgc3R1YmJlZENvbXBvbmVudHM6IE9iamVjdCkge1xuICBPYmplY3Qua2V5cyhjb21wb25lbnRzKS5mb3JFYWNoKGNvbXBvbmVudCA9PiB7XG4gICAgLy8gUmVtb3ZlIGNhY2hlZCBjb25zdHJ1Y3RvclxuICAgIGRlbGV0ZSBjb21wb25lbnRzW2NvbXBvbmVudF0uX0N0b3JcbiAgICBpZiAoIWNvbXBvbmVudHNbY29tcG9uZW50XS5uYW1lKSB7XG4gICAgICBjb21wb25lbnRzW2NvbXBvbmVudF0ubmFtZSA9IGNvbXBvbmVudFxuICAgIH1cbiAgICBzdHViYmVkQ29tcG9uZW50c1tjb21wb25lbnRdID0gY3JlYXRlQmxhbmtTdHViKGNvbXBvbmVudHNbY29tcG9uZW50XSlcblxuICAgIC8vIGlnbm9yZUVsZW1lbnRzIGRvZXMgbm90IGV4aXN0IGluIFZ1ZSAyLjAueFxuICAgIGlmIChWdWUuY29uZmlnLmlnbm9yZWRFbGVtZW50cykge1xuICAgICAgVnVlLmNvbmZpZy5pZ25vcmVkRWxlbWVudHMucHVzaChjb21wb25lbnQpXG4gICAgfVxuICB9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQ29tcG9uZW50U3R1YnNGb3JBbGwgKGNvbXBvbmVudDogQ29tcG9uZW50KTogT2JqZWN0IHtcbiAgY29uc3Qgc3R1YmJlZENvbXBvbmVudHMgPSB7fVxuXG4gIGlmIChjb21wb25lbnQuY29tcG9uZW50cykge1xuICAgIHN0dWJDb21wb25lbnRzKGNvbXBvbmVudC5jb21wb25lbnRzLCBzdHViYmVkQ29tcG9uZW50cylcbiAgfVxuXG4gIGxldCBleHRlbmRlZCA9IGNvbXBvbmVudC5leHRlbmRzXG5cbiAgLy8gTG9vcCB0aHJvdWdoIGV4dGVuZGVkIGNvbXBvbmVudCBjaGFpbnMgdG8gc3R1YiBhbGwgY2hpbGQgY29tcG9uZW50c1xuICB3aGlsZSAoZXh0ZW5kZWQpIHtcbiAgICBpZiAoZXh0ZW5kZWQuY29tcG9uZW50cykge1xuICAgICAgc3R1YkNvbXBvbmVudHMoZXh0ZW5kZWQuY29tcG9uZW50cywgc3R1YmJlZENvbXBvbmVudHMpXG4gICAgfVxuICAgIGV4dGVuZGVkID0gZXh0ZW5kZWQuZXh0ZW5kc1xuICB9XG5cbiAgaWYgKGNvbXBvbmVudC5leHRlbmRPcHRpb25zICYmIGNvbXBvbmVudC5leHRlbmRPcHRpb25zLmNvbXBvbmVudHMpIHtcbiAgICBzdHViQ29tcG9uZW50cyhjb21wb25lbnQuZXh0ZW5kT3B0aW9ucy5jb21wb25lbnRzLCBzdHViYmVkQ29tcG9uZW50cylcbiAgfVxuXG4gIHJldHVybiBzdHViYmVkQ29tcG9uZW50c1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQ29tcG9uZW50U3R1YnNGb3JHbG9iYWxzIChpbnN0YW5jZTogQ29tcG9uZW50KTogT2JqZWN0IHtcbiAgY29uc3QgY29tcG9uZW50cyA9IHt9XG4gIE9iamVjdC5rZXlzKGluc3RhbmNlLm9wdGlvbnMuY29tcG9uZW50cykuZm9yRWFjaCgoYykgPT4ge1xuICAgIGlmIChpc1JlcXVpcmVkQ29tcG9uZW50KGMpKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBjb21wb25lbnRzW2NdID0gY3JlYXRlQmxhbmtTdHViKGluc3RhbmNlLm9wdGlvbnMuY29tcG9uZW50c1tjXSlcbiAgICBkZWxldGUgaW5zdGFuY2Uub3B0aW9ucy5jb21wb25lbnRzW2NdLl9DdG9yIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tcGFyYW0tcmVhc3NpZ25cbiAgICBkZWxldGUgY29tcG9uZW50c1tjXS5fQ3RvciAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXBhcmFtLXJlYXNzaWduXG4gIH0pXG4gIHJldHVybiBjb21wb25lbnRzXG59XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgeyBjb21waWxlVG9GdW5jdGlvbnMgfSBmcm9tICd2dWUtdGVtcGxhdGUtY29tcGlsZXInXG5cbmV4cG9ydCBmdW5jdGlvbiBjb21waWxlVGVtcGxhdGUgKGNvbXBvbmVudDogQ29tcG9uZW50KSB7XG4gIGlmIChjb21wb25lbnQuY29tcG9uZW50cykge1xuICAgIE9iamVjdC5rZXlzKGNvbXBvbmVudC5jb21wb25lbnRzKS5mb3JFYWNoKChjKSA9PiB7XG4gICAgICBjb25zdCBjbXAgPSBjb21wb25lbnQuY29tcG9uZW50c1tjXVxuICAgICAgaWYgKCFjbXAucmVuZGVyKSB7XG4gICAgICAgIGNvbXBpbGVUZW1wbGF0ZShjbXApXG4gICAgICB9XG4gICAgfSlcbiAgfVxuICBpZiAoY29tcG9uZW50LmV4dGVuZHMpIHtcbiAgICBjb21waWxlVGVtcGxhdGUoY29tcG9uZW50LmV4dGVuZHMpXG4gIH1cbiAgaWYgKGNvbXBvbmVudC50ZW1wbGF0ZSkge1xuICAgIE9iamVjdC5hc3NpZ24oY29tcG9uZW50LCBjb21waWxlVG9GdW5jdGlvbnMoY29tcG9uZW50LnRlbXBsYXRlKSlcbiAgfVxufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZGVsZXRlTW91bnRpbmdPcHRpb25zIChvcHRpb25zKSB7XG4gIGRlbGV0ZSBvcHRpb25zLmF0dGFjaFRvRG9jdW1lbnRcbiAgZGVsZXRlIG9wdGlvbnMubW9ja3NcbiAgZGVsZXRlIG9wdGlvbnMuc2xvdHNcbiAgZGVsZXRlIG9wdGlvbnMubG9jYWxWdWVcbiAgZGVsZXRlIG9wdGlvbnMuc3R1YnNcbiAgZGVsZXRlIG9wdGlvbnMuY29udGV4dFxuICBkZWxldGUgb3B0aW9ucy5jbG9uZVxuICBkZWxldGUgb3B0aW9ucy5hdHRyc1xuICBkZWxldGUgb3B0aW9ucy5saXN0ZW5lcnNcbiAgZGVsZXRlIG9wdGlvbnMucHJvcHNEYXRhXG59XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgeyBjb21waWxlVG9GdW5jdGlvbnMgfSBmcm9tICd2dWUtdGVtcGxhdGUtY29tcGlsZXInXG5pbXBvcnQgeyB0aHJvd0Vycm9yIH0gZnJvbSAnc2hhcmVkL3V0aWwnXG5pbXBvcnQgeyB2YWxpZGF0ZVNsb3RzIH0gZnJvbSAnLi92YWxpZGF0ZS1zbG90cydcblxuZnVuY3Rpb24gY3JlYXRlRnVuY3Rpb25hbFNsb3RzIChzbG90cyA9IHt9LCBoKSB7XG4gIGlmIChBcnJheS5pc0FycmF5KHNsb3RzLmRlZmF1bHQpKSB7XG4gICAgcmV0dXJuIHNsb3RzLmRlZmF1bHQubWFwKGgpXG4gIH1cblxuICBpZiAodHlwZW9mIHNsb3RzLmRlZmF1bHQgPT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIFtoKGNvbXBpbGVUb0Z1bmN0aW9ucyhzbG90cy5kZWZhdWx0KSldXG4gIH1cbiAgY29uc3QgY2hpbGRyZW4gPSBbXVxuICBPYmplY3Qua2V5cyhzbG90cykuZm9yRWFjaChzbG90VHlwZSA9PiB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoc2xvdHNbc2xvdFR5cGVdKSkge1xuICAgICAgc2xvdHNbc2xvdFR5cGVdLmZvckVhY2goc2xvdCA9PiB7XG4gICAgICAgIGNvbnN0IGNvbXBvbmVudCA9IHR5cGVvZiBzbG90ID09PSAnc3RyaW5nJyA/IGNvbXBpbGVUb0Z1bmN0aW9ucyhzbG90KSA6IHNsb3RcbiAgICAgICAgY29uc3QgbmV3U2xvdCA9IGgoY29tcG9uZW50KVxuICAgICAgICBuZXdTbG90LmRhdGEuc2xvdCA9IHNsb3RUeXBlXG4gICAgICAgIGNoaWxkcmVuLnB1c2gobmV3U2xvdClcbiAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGNvbXBvbmVudCA9IHR5cGVvZiBzbG90c1tzbG90VHlwZV0gPT09ICdzdHJpbmcnID8gY29tcGlsZVRvRnVuY3Rpb25zKHNsb3RzW3Nsb3RUeXBlXSkgOiBzbG90c1tzbG90VHlwZV1cbiAgICAgIGNvbnN0IHNsb3QgPSBoKGNvbXBvbmVudClcbiAgICAgIHNsb3QuZGF0YS5zbG90ID0gc2xvdFR5cGVcbiAgICAgIGNoaWxkcmVuLnB1c2goc2xvdClcbiAgICB9XG4gIH0pXG4gIHJldHVybiBjaGlsZHJlblxufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjcmVhdGVGdW5jdGlvbmFsQ29tcG9uZW50IChjb21wb25lbnQ6IENvbXBvbmVudCwgbW91bnRpbmdPcHRpb25zOiBPcHRpb25zKSB7XG4gIGlmIChtb3VudGluZ09wdGlvbnMuY29udGV4dCAmJiB0eXBlb2YgbW91bnRpbmdPcHRpb25zLmNvbnRleHQgIT09ICdvYmplY3QnKSB7XG4gICAgdGhyb3dFcnJvcignbW91bnQuY29udGV4dCBtdXN0IGJlIGFuIG9iamVjdCcpXG4gIH1cbiAgaWYgKG1vdW50aW5nT3B0aW9ucy5zbG90cykge1xuICAgIHZhbGlkYXRlU2xvdHMobW91bnRpbmdPcHRpb25zLnNsb3RzKVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICByZW5kZXIgKGg6IEZ1bmN0aW9uKSB7XG4gICAgICByZXR1cm4gaChcbiAgICAgICAgY29tcG9uZW50LFxuICAgICAgICBtb3VudGluZ09wdGlvbnMuY29udGV4dCB8fCBjb21wb25lbnQuRnVuY3Rpb25hbFJlbmRlckNvbnRleHQsXG4gICAgICAgIChtb3VudGluZ09wdGlvbnMuY29udGV4dCAmJiBtb3VudGluZ09wdGlvbnMuY29udGV4dC5jaGlsZHJlbiAmJiBtb3VudGluZ09wdGlvbnMuY29udGV4dC5jaGlsZHJlbi5tYXAoeCA9PiB0eXBlb2YgeCA9PT0gJ2Z1bmN0aW9uJyA/IHgoaCkgOiB4KSkgfHwgY3JlYXRlRnVuY3Rpb25hbFNsb3RzKG1vdW50aW5nT3B0aW9ucy5zbG90cywgaClcbiAgICAgIClcbiAgICB9LFxuICAgIG5hbWU6IGNvbXBvbmVudC5uYW1lLFxuICAgIF9pc0Z1bmN0aW9uYWxDb250YWluZXI6IHRydWVcbiAgfVxufVxuIiwiLy8gQGZsb3dcblxuaW1wb3J0IFZ1ZSBmcm9tICd2dWUnXG5pbXBvcnQgeyBhZGRTbG90cyB9IGZyb20gJy4vYWRkLXNsb3RzJ1xuaW1wb3J0IHsgYWRkU2NvcGVkU2xvdHMgfSBmcm9tICcuL2FkZC1zY29wZWQtc2xvdHMnXG5pbXBvcnQgYWRkTW9ja3MgZnJvbSAnLi9hZGQtbW9ja3MnXG5pbXBvcnQgYWRkQXR0cnMgZnJvbSAnLi9hZGQtYXR0cnMnXG5pbXBvcnQgYWRkTGlzdGVuZXJzIGZyb20gJy4vYWRkLWxpc3RlbmVycydcbmltcG9ydCBhZGRQcm92aWRlIGZyb20gJy4vYWRkLXByb3ZpZGUnXG5pbXBvcnQgeyBhZGRFdmVudExvZ2dlciB9IGZyb20gJy4vbG9nLWV2ZW50cydcbmltcG9ydCB7IGNyZWF0ZUNvbXBvbmVudFN0dWJzIH0gZnJvbSAnc2hhcmVkL3N0dWItY29tcG9uZW50cydcbmltcG9ydCB7IHRocm93RXJyb3IgfSBmcm9tICdzaGFyZWQvdXRpbCdcbmltcG9ydCB7IGNvbXBpbGVUZW1wbGF0ZSB9IGZyb20gJy4vY29tcGlsZS10ZW1wbGF0ZSdcbmltcG9ydCBkZWxldGVvcHRpb25zIGZyb20gJy4vZGVsZXRlLW1vdW50aW5nLW9wdGlvbnMnXG5pbXBvcnQgY3JlYXRlRnVuY3Rpb25hbENvbXBvbmVudCBmcm9tICcuL2NyZWF0ZS1mdW5jdGlvbmFsLWNvbXBvbmVudCdcbmltcG9ydCB7IGNvbXBvbmVudE5lZWRzQ29tcGlsaW5nIH0gZnJvbSAnc2hhcmVkL3ZhbGlkYXRvcnMnXG5cbmZ1bmN0aW9uIGlzRGVzdHJ1Y3R1cmluZ1Nsb3RTY29wZSAoc2xvdFNjb3BlOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIHNsb3RTY29wZVswXSA9PT0gJ3snICYmIHNsb3RTY29wZVtzbG90U2NvcGUubGVuZ3RoIC0gMV0gPT09ICd9J1xufVxuXG5mdW5jdGlvbiBnZXRWdWVUZW1wbGF0ZUNvbXBpbGVySGVscGVycyAocHJveHk6IE9iamVjdCk6IE9iamVjdCB7XG4gIGNvbnN0IGhlbHBlcnMgPSB7fVxuICBjb25zdCBuYW1lcyA9IFsnX2MnLCAnX28nLCAnX24nLCAnX3MnLCAnX2wnLCAnX3QnLCAnX3EnLCAnX2knLCAnX20nLCAnX2YnLCAnX2snLCAnX2InLCAnX3YnLCAnX2UnLCAnX3UnLCAnX2cnXVxuICBuYW1lcy5mb3JFYWNoKChuYW1lKSA9PiB7XG4gICAgaGVscGVyc1tuYW1lXSA9IHByb3h5W25hbWVdXG4gIH0pXG4gIHJldHVybiBoZWxwZXJzXG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNyZWF0ZUluc3RhbmNlIChcbiAgY29tcG9uZW50OiBDb21wb25lbnQsXG4gIG9wdGlvbnM6IE9wdGlvbnMsXG4gIHZ1ZTogQ29tcG9uZW50LFxuICBlbG06IEVsZW1lbnRcbik6IENvbXBvbmVudCB7XG4gIGlmIChvcHRpb25zLm1vY2tzKSB7XG4gICAgYWRkTW9ja3Mob3B0aW9ucy5tb2NrcywgdnVlKVxuICB9XG5cbiAgaWYgKChjb21wb25lbnQub3B0aW9ucyAmJiBjb21wb25lbnQub3B0aW9ucy5mdW5jdGlvbmFsKSB8fCBjb21wb25lbnQuZnVuY3Rpb25hbCkge1xuICAgIGNvbXBvbmVudCA9IGNyZWF0ZUZ1bmN0aW9uYWxDb21wb25lbnQoY29tcG9uZW50LCBvcHRpb25zKVxuICB9IGVsc2UgaWYgKG9wdGlvbnMuY29udGV4dCkge1xuICAgIHRocm93RXJyb3IoXG4gICAgICAnbW91bnQuY29udGV4dCBjYW4gb25seSBiZSB1c2VkIHdoZW4gbW91bnRpbmcgYSBmdW5jdGlvbmFsIGNvbXBvbmVudCdcbiAgICApXG4gIH1cblxuICBpZiAob3B0aW9ucy5wcm92aWRlKSB7XG4gICAgYWRkUHJvdmlkZShjb21wb25lbnQsIG9wdGlvbnMucHJvdmlkZSwgb3B0aW9ucylcbiAgfVxuXG4gIGlmIChjb21wb25lbnROZWVkc0NvbXBpbGluZyhjb21wb25lbnQpKSB7XG4gICAgY29tcGlsZVRlbXBsYXRlKGNvbXBvbmVudClcbiAgfVxuXG4gIGFkZEV2ZW50TG9nZ2VyKHZ1ZSlcblxuICBcbiAgY29uc3QgaW5zdGFuY2VPcHRpb25zID0geyAuLi5vcHRpb25zIH1cbiAgZGVsZXRlb3B0aW9ucyhpbnN0YW5jZU9wdGlvbnMpXG4gIC8vICRGbG93SWdub3JlXG4gIFxuICBpZiAob3B0aW9ucy5zdHVicykge1xuICAgIGluc3RhbmNlT3B0aW9ucy5jb21wb25lbnRzID0ge1xuICAgICAgLi4uaW5zdGFuY2VPcHRpb25zLmNvbXBvbmVudHMsXG4gICAgICAvLyAkRmxvd0lnbm9yZVxuICAgICAgLi4uY3JlYXRlQ29tcG9uZW50U3R1YnMoY29tcG9uZW50LmNvbXBvbmVudHMsIG9wdGlvbnMuc3R1YnMpXG4gICAgfVxuICB9XG5cbiAgY29uc3QgQ29uc3RydWN0b3IgPSB2dWUuZXh0ZW5kKGNvbXBvbmVudCkuZXh0ZW5kKGluc3RhbmNlT3B0aW9ucylcbiAgT2JqZWN0LmtleXMoaW5zdGFuY2VPcHRpb25zLmNvbXBvbmVudHMgfHwge30pLmZvckVhY2goa2V5ID0+IHtcbiAgICBDb25zdHJ1Y3Rvci5jb21wb25lbnQoa2V5LCBpbnN0YW5jZU9wdGlvbnMuY29tcG9uZW50c1trZXldKVxuICAgIHZ1ZS5jb21wb25lbnQoa2V5LCBpbnN0YW5jZU9wdGlvbnMuY29tcG9uZW50c1trZXldKVxuICB9KVxuICBjb25zdCBQYXJlbnQgPSB2dWUuZXh0ZW5kKHtcbiAgICBwcm92aWRlOiBvcHRpb25zLnByb3ZpZGUsXG4gICAgZGF0YSAoKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBwcm9wc0RhdGE6IG9wdGlvbnMucHJvcHNEYXRhIHx8IHt9LFxuICAgICAgICBhdHRyczogb3B0aW9ucy5hdHRycyB8fCB7fSxcbiAgICAgICAgbGlzdGVuZXJzOiBvcHRpb25zLmxpc3RlbmVycyB8fCB7fVxuICAgICAgfVxuICAgIH0sXG4gICAgcmVuZGVyIChoKSB7XG4gICAgICBjb25zdCB2bm9kZSA9IGgoQ29uc3RydWN0b3IsIHtcbiAgICAgICAgcmVmOiAndm0nLFxuICAgICAgICBwcm9wczogdGhpcy5wcm9wc0RhdGEsXG4gICAgICAgIG9uOiB0aGlzLmxpc3RlbmVycyxcbiAgICAgICAgYXR0cnM6IHRoaXMuYXR0cnNcbiAgICAgIH0pXG5cbiAgICAgIHJldHVybiB2bm9kZVxuICAgIH1cbiAgfSlcblxuICBjb25zdCBwYXJlbnQgPSBuZXcgUGFyZW50KCkuJG1vdW50KGVsbSlcblxuICBjb25zdCB2bSA9IHBhcmVudC4kcmVmcy52bVxuXG4gIGlmIChvcHRpb25zLnNjb3BlZFNsb3RzKSB7XG4gICAgaWYgKHdpbmRvdy5uYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9QaGFudG9tSlMvaSkpIHtcbiAgICAgIHRocm93RXJyb3IoJ3RoZSBzY29wZWRTbG90cyBvcHRpb24gZG9lcyBub3Qgc3VwcG9ydCBQaGFudG9tSlMuIFBsZWFzZSB1c2UgUHVwcGV0ZWVyLCBvciBwYXNzIGEgY29tcG9uZW50LicpXG4gICAgfVxuICAgIGNvbnN0IHZ1ZVZlcnNpb24gPSBOdW1iZXIoYCR7VnVlLnZlcnNpb24uc3BsaXQoJy4nKVswXX0uJHtWdWUudmVyc2lvbi5zcGxpdCgnLicpWzFdfWApXG4gICAgaWYgKHZ1ZVZlcnNpb24gPj0gMi41KSB7XG4gICAgICB2bS4kX3Z1ZVRlc3RVdGlsc19zY29wZWRTbG90cyA9IHt9XG4gICAgICB2bS4kX3Z1ZVRlc3RVdGlsc19zbG90U2NvcGVzID0ge31cbiAgICAgIGNvbnN0IHJlbmRlclNsb3QgPSB2bS5fcmVuZGVyUHJveHkuX3RcblxuICAgICAgdm0uX3JlbmRlclByb3h5Ll90ID0gZnVuY3Rpb24gKG5hbWUsIGZlZWRiYWNrLCBwcm9wcywgYmluZE9iamVjdCkge1xuICAgICAgICBjb25zdCBzY29wZWRTbG90Rm4gPSB2bS4kX3Z1ZVRlc3RVdGlsc19zY29wZWRTbG90c1tuYW1lXVxuICAgICAgICBjb25zdCBzbG90U2NvcGUgPSB2bS4kX3Z1ZVRlc3RVdGlsc19zbG90U2NvcGVzW25hbWVdXG4gICAgICAgIGlmIChzY29wZWRTbG90Rm4pIHtcbiAgICAgICAgICBwcm9wcyA9IHsgLi4uYmluZE9iamVjdCwgLi4ucHJvcHMgfVxuICAgICAgICAgIGNvbnN0IGhlbHBlcnMgPSBnZXRWdWVUZW1wbGF0ZUNvbXBpbGVySGVscGVycyh2bS5fcmVuZGVyUHJveHkpXG4gICAgICAgICAgbGV0IHByb3h5ID0geyAuLi5oZWxwZXJzIH1cbiAgICAgICAgICBpZiAoaXNEZXN0cnVjdHVyaW5nU2xvdFNjb3BlKHNsb3RTY29wZSkpIHtcbiAgICAgICAgICAgIHByb3h5ID0geyAuLi5oZWxwZXJzLCAuLi5wcm9wcyB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHByb3h5W3Nsb3RTY29wZV0gPSBwcm9wc1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gc2NvcGVkU2xvdEZuLmNhbGwocHJveHkpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHJlbmRlclNsb3QuY2FsbCh2bS5fcmVuZGVyUHJveHksIG5hbWUsIGZlZWRiYWNrLCBwcm9wcywgYmluZE9iamVjdClcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyAkRmxvd0lnbm9yZVxuICAgICAgYWRkU2NvcGVkU2xvdHModm0sIG9wdGlvbnMuc2NvcGVkU2xvdHMpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93RXJyb3IoJ3RoZSBzY29wZWRTbG90cyBvcHRpb24gaXMgb25seSBzdXBwb3J0ZWQgaW4gdnVlQDIuNSsuJylcbiAgICB9XG4gIH1cblxuICBpZiAob3B0aW9ucy5zbG90cykge1xuICAgIGFkZFNsb3RzKHZtLCBvcHRpb25zLnNsb3RzKVxuICB9XG5cbiAgcmV0dXJuIHZtXG59XG4iLCIvLyBAZmxvd1xuXG5mdW5jdGlvbiBnZXRPcHRpb25zIChrZXksIG9wdGlvbnMsIGNvbmZpZykge1xuICBpZiAob3B0aW9ucyB8fFxuICAgIChjb25maWdba2V5XSAmJiBPYmplY3Qua2V5cyhjb25maWdba2V5XSkubGVuZ3RoID4gMCkpIHtcbiAgICBpZiAob3B0aW9ucyBpbnN0YW5jZW9mIEZ1bmN0aW9uKSB7XG4gICAgICByZXR1cm4gb3B0aW9uc1xuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShvcHRpb25zKSkge1xuICAgICAgcmV0dXJuIFtcbiAgICAgICAgLi4ub3B0aW9ucyxcbiAgICAgICAgLi4uT2JqZWN0LmtleXMoY29uZmlnW2tleV0gfHwge30pXVxuICAgIH0gZWxzZSBpZiAoIShjb25maWdba2V5XSBpbnN0YW5jZW9mIEZ1bmN0aW9uKSkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4uY29uZmlnW2tleV0sXG4gICAgICAgIC4uLm9wdGlvbnNcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDb25maWcgY2FuJ3QgYmUgYSBGdW5jdGlvbi5gKVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbWVyZ2VPcHRpb25zIChcbiAgb3B0aW9uczogT3B0aW9ucyxcbiAgY29uZmlnOiBPcHRpb25zXG4pOiBPcHRpb25zIHtcbiAgcmV0dXJuIHtcbiAgICAuLi5vcHRpb25zLFxuICAgIHN0dWJzOiBnZXRPcHRpb25zKCdzdHVicycsIG9wdGlvbnMuc3R1YnMsIGNvbmZpZyksXG4gICAgbW9ja3M6IGdldE9wdGlvbnMoJ21vY2tzJywgb3B0aW9ucy5tb2NrcywgY29uZmlnKSxcbiAgICBtZXRob2RzOiBnZXRPcHRpb25zKCdtZXRob2RzJywgb3B0aW9ucy5tZXRob2RzLCBjb25maWcpLFxuICAgIHByb3ZpZGU6IGdldE9wdGlvbnMoJ3Byb3ZpZGUnLCBvcHRpb25zLnByb3ZpZGUsIGNvbmZpZylcbiAgfVxufVxuXG4iLCJpbXBvcnQgdGVzdFV0aWxzIGZyb20gJ0B2dWUvdGVzdC11dGlscydcblxuZXhwb3J0IGRlZmF1bHQgdGVzdFV0aWxzLmNvbmZpZ1xuIiwiLy8gQGZsb3dcblxuaW1wb3J0IFZ1ZSBmcm9tICd2dWUnXG5pbXBvcnQgY3JlYXRlSW5zdGFuY2UgZnJvbSAnY3JlYXRlLWluc3RhbmNlJ1xuaW1wb3J0IHsgdGhyb3dFcnJvciB9IGZyb20gJ3NoYXJlZC91dGlsJ1xuaW1wb3J0IHsgY3JlYXRlUmVuZGVyZXIgfSBmcm9tICd2dWUtc2VydmVyLXJlbmRlcmVyJ1xuaW1wb3J0IHRlc3RVdGlscyBmcm9tICdAdnVlL3Rlc3QtdXRpbHMnXG5pbXBvcnQgeyBtZXJnZU9wdGlvbnMgfSBmcm9tICdzaGFyZWQvbWVyZ2Utb3B0aW9ucydcbmltcG9ydCBjb25maWcgZnJvbSAnLi9jb25maWcnXG5cblZ1ZS5jb25maWcucHJvZHVjdGlvblRpcCA9IGZhbHNlXG5WdWUuY29uZmlnLmRldnRvb2xzID0gZmFsc2VcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcmVuZGVyVG9TdHJpbmcgKGNvbXBvbmVudDogQ29tcG9uZW50LCBvcHRpb25zOiBPcHRpb25zID0ge30pOiBzdHJpbmcge1xuICBjb25zdCByZW5kZXJlciA9IGNyZWF0ZVJlbmRlcmVyKClcblxuICBpZiAoIXJlbmRlcmVyKSB7XG4gICAgdGhyb3dFcnJvcigncmVuZGVyVG9TdHJpbmcgbXVzdCBiZSBydW4gaW4gbm9kZS4gSXQgY2Fubm90IGJlIHJ1biBpbiBhIGJyb3dzZXInKVxuICB9XG4gIC8vIFJlbW92ZSBjYWNoZWQgY29uc3RydWN0b3JcbiAgZGVsZXRlIGNvbXBvbmVudC5fQ3RvclxuXG4gIGlmIChvcHRpb25zLmF0dGFjaFRvRG9jdW1lbnQpIHtcbiAgICB0aHJvd0Vycm9yKCd5b3UgY2Fubm90IHVzZSBhdHRhY2hUb0RvY3VtZW50IHdpdGggcmVuZGVyVG9TdHJpbmcnKVxuICB9XG4gIGNvbnN0IHZ1ZUNsYXNzID0gb3B0aW9ucy5sb2NhbFZ1ZSB8fCB0ZXN0VXRpbHMuY3JlYXRlTG9jYWxWdWUoKVxuICBjb25zdCB2bSA9IGNyZWF0ZUluc3RhbmNlKGNvbXBvbmVudCwgbWVyZ2VPcHRpb25zKG9wdGlvbnMsIGNvbmZpZyksIHZ1ZUNsYXNzKVxuICBsZXQgcmVuZGVyZWRTdHJpbmcgPSAnJ1xuXG4gIC8vICRGbG93SWdub3JlXG4gIHJlbmRlcmVyLnJlbmRlclRvU3RyaW5nKHZtLCAoZXJyLCByZXMpID0+IHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICBjb25zb2xlLmxvZyhlcnIpXG4gICAgfVxuICAgIHJlbmRlcmVkU3RyaW5nID0gcmVzXG4gIH0pXG4gIHJldHVybiByZW5kZXJlZFN0cmluZ1xufVxuIiwiLy8gQGZsb3dcblxuaW1wb3J0IHJlbmRlclRvU3RyaW5nIGZyb20gJy4vcmVuZGVyVG9TdHJpbmcnXG5pbXBvcnQgY2hlZXJpbyBmcm9tICdjaGVlcmlvJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiByZW5kZXIgKGNvbXBvbmVudDogQ29tcG9uZW50LCBvcHRpb25zOiBPcHRpb25zID0ge30pOiBzdHJpbmcge1xuICBjb25zdCByZW5kZXJlZFN0cmluZyA9IHJlbmRlclRvU3RyaW5nKGNvbXBvbmVudCwgb3B0aW9ucylcbiAgcmV0dXJuIGNoZWVyaW8ubG9hZCgnJykocmVuZGVyZWRTdHJpbmcpXG59XG4iLCJpbXBvcnQgcmVuZGVyVG9TdHJpbmcgZnJvbSAnLi9yZW5kZXJUb1N0cmluZydcbmltcG9ydCByZW5kZXIgZnJvbSAnLi9yZW5kZXInXG5pbXBvcnQgY29uZmlnIGZyb20gJy4vY29uZmlnJ1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIHJlbmRlclRvU3RyaW5nLFxuICBjb25maWcsXG4gIHJlbmRlclxufVxuIl0sIm5hbWVzIjpbImNvbnN0IiwiY29tcGlsZVRvRnVuY3Rpb25zIiwibGV0IiwiVnVlIiwiJCRWdWUiLCJpc1Z1ZUNvbXBvbmVudCIsImNvbXBpbGVUZW1w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
