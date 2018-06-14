'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var vueTemplateCompiler = require('vue-template-compiler');
var Vue = _interopDefault(require('vue'));
var testUtils = _interopDefault(require('@vue/test-utils'));
var vueServerRenderer = require('vue-server-renderer');
var cheerio = _interopDefault(require('cheerio'));

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

function componentNeedsCompiling (component) {
  return component &&
    !component.render &&
    (component.template ||
      component.extends ||
      component.extendOptions) &&
    !component.functional
}

function templateContainsComponent (template, name) {
  return [capitalize, camelize, hyphenate].some(function (format) {
    var re = new RegExp(("<" + (format(name)) + "\\s*(\\s|>|(/>))"), 'g');
    return re.test(template)
  })
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidnVlLXNlcnZlci10ZXN0LXV0aWxzLmpzIiwic291cmNlcyI6WyIuLi8uLi9jcmVhdGUtaW5zdGFuY2UvYWRkLXNsb3RzLmpzIiwiLi4vLi4vc2hhcmVkL3V0aWwuanMiLCIuLi8uLi9jcmVhdGUtaW5zdGFuY2UvYWRkLW1vY2tzLmpzIiwiLi4vLi4vY3JlYXRlLWluc3RhbmNlL2xvZy1ldmVudHMuanMiLCIuLi8uLi9zaGFyZWQvdmFsaWRhdG9ycy5qcyIsIi4uLy4uL3NoYXJlZC9jb21waWxlLXRlbXBsYXRlLmpzIiwiLi4vLi4vc2hhcmVkL3N0dWItY29tcG9uZW50cy5qcyIsIi4uLy4uL2NyZWF0ZS1pbnN0YW5jZS9kZWxldGUtbW91bnRpbmctb3B0aW9ucy5qcyIsIi4uLy4uL2NyZWF0ZS1pbnN0YW5jZS92YWxpZGF0ZS1zbG90cy5qcyIsIi4uLy4uL2NyZWF0ZS1pbnN0YW5jZS9jcmVhdGUtZnVuY3Rpb25hbC1jb21wb25lbnQuanMiLCIuLi8uLi9jcmVhdGUtaW5zdGFuY2UvY3JlYXRlLWluc3RhbmNlLmpzIiwiLi4vLi4vc2hhcmVkL21lcmdlLW9wdGlvbnMuanMiLCIuLi9zcmMvY29uZmlnLmpzIiwiLi4vc3JjL3JlbmRlclRvU3RyaW5nLmpzIiwiLi4vc3JjL3JlbmRlci5qcyIsIi4uL3NyYy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBAZmxvd1xuXG5pbXBvcnQgeyBjb21waWxlVG9GdW5jdGlvbnMgfSBmcm9tICd2dWUtdGVtcGxhdGUtY29tcGlsZXInXG5cbmZ1bmN0aW9uIHN0YXJ0c1dpdGhUYWcgKHN0cikge1xuICByZXR1cm4gc3RyICYmIHN0ci50cmltKClbMF0gPT09ICc8J1xufVxuXG5mdW5jdGlvbiBjcmVhdGVWTm9kZXNGb3JTbG90IChcbiAgaDogRnVuY3Rpb24sXG4gIHNsb3RWYWx1ZTogU2xvdFZhbHVlLFxuICBuYW1lOiBzdHJpbmdcbik6IFZOb2RlIHwgc3RyaW5nIHtcbiAgaWYgKHR5cGVvZiBzbG90VmFsdWUgPT09ICdzdHJpbmcnICYmXG4gICFzdGFydHNXaXRoVGFnKHNsb3RWYWx1ZSkpIHtcbiAgICByZXR1cm4gc2xvdFZhbHVlXG4gIH1cblxuICBjb25zdCBlbCA9IHR5cGVvZiBzbG90VmFsdWUgPT09ICdzdHJpbmcnXG4gICAgPyBjb21waWxlVG9GdW5jdGlvbnMoc2xvdFZhbHVlKVxuICAgIDogc2xvdFZhbHVlXG5cbiAgY29uc3Qgdm5vZGUgPSBoKGVsKVxuICB2bm9kZS5kYXRhLnNsb3QgPSBuYW1lXG4gIHJldHVybiB2bm9kZVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU2xvdFZOb2RlcyAoXG4gIGg6IEZ1bmN0aW9uLFxuICBzbG90czogU2xvdHNPYmplY3Rcbik6IEFycmF5PFZOb2RlIHwgc3RyaW5nPiB7XG4gIHJldHVybiBPYmplY3Qua2V5cyhzbG90cykucmVkdWNlKChhY2MsIGtleSkgPT4ge1xuICAgIGNvbnN0IGNvbnRlbnQgPSBzbG90c1trZXldXG4gICAgaWYgKEFycmF5LmlzQXJyYXkoY29udGVudCkpIHtcbiAgICAgIGNvbnN0IG5vZGVzID0gY29udGVudC5yZWR1Y2UoKGFjY0lubmVyLCBzbG90RGVmKSA9PiB7XG4gICAgICAgIHJldHVybiBhY2NJbm5lci5jb25jYXQoY3JlYXRlVk5vZGVzRm9yU2xvdChoLCBzbG90RGVmLCBrZXkpKVxuICAgICAgfSwgW10pXG4gICAgICByZXR1cm4gYWNjLmNvbmNhdChub2RlcylcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGFjYy5jb25jYXQoY3JlYXRlVk5vZGVzRm9yU2xvdChoLCBjb250ZW50LCBrZXkpKVxuICAgIH1cbiAgfSwgW10pXG59XG4iLCIvLyBAZmxvd1xuaW1wb3J0IFZ1ZSBmcm9tICd2dWUnXG5cbmV4cG9ydCBmdW5jdGlvbiB0aHJvd0Vycm9yIChtc2c6IHN0cmluZykge1xuICB0aHJvdyBuZXcgRXJyb3IoYFt2dWUtdGVzdC11dGlsc106ICR7bXNnfWApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3YXJuIChtc2c6IHN0cmluZykge1xuICBjb25zb2xlLmVycm9yKGBbdnVlLXRlc3QtdXRpbHNdOiAke21zZ31gKVxufVxuXG5jb25zdCBjYW1lbGl6ZVJFID0gLy0oXFx3KS9nXG5leHBvcnQgY29uc3QgY2FtZWxpemUgPSAoc3RyOiBzdHJpbmcpID0+IHtcbiAgY29uc3QgY2FtZWxpemVkU3RyID0gc3RyLnJlcGxhY2UoY2FtZWxpemVSRSwgKF8sIGMpID0+IGMgPyBjLnRvVXBwZXJDYXNlKCkgOiAnJylcbiAgcmV0dXJuIGNhbWVsaXplZFN0ci5jaGFyQXQoMCkudG9Mb3dlckNhc2UoKSArIGNhbWVsaXplZFN0ci5zbGljZSgxKVxufVxuXG4vKipcbiAqIENhcGl0YWxpemUgYSBzdHJpbmcuXG4gKi9cbmV4cG9ydCBjb25zdCBjYXBpdGFsaXplID0gKHN0cjogc3RyaW5nKSA9PiBzdHIuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzdHIuc2xpY2UoMSlcblxuLyoqXG4gKiBIeXBoZW5hdGUgYSBjYW1lbENhc2Ugc3RyaW5nLlxuICovXG5jb25zdCBoeXBoZW5hdGVSRSA9IC9cXEIoW0EtWl0pL2dcbmV4cG9ydCBjb25zdCBoeXBoZW5hdGUgPSAoc3RyOiBzdHJpbmcpID0+IHN0ci5yZXBsYWNlKGh5cGhlbmF0ZVJFLCAnLSQxJykudG9Mb3dlckNhc2UoKVxuXG5leHBvcnQgY29uc3QgdnVlVmVyc2lvbiA9IE51bWJlcihgJHtWdWUudmVyc2lvbi5zcGxpdCgnLicpWzBdfS4ke1Z1ZS52ZXJzaW9uLnNwbGl0KCcuJylbMV19YClcbiIsIi8vIEBmbG93XG5pbXBvcnQgJCRWdWUgZnJvbSAndnVlJ1xuaW1wb3J0IHsgd2FybiB9IGZyb20gJ3NoYXJlZC91dGlsJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBhZGRNb2NrcyAobW9ja2VkUHJvcGVydGllczogT2JqZWN0LCBWdWU6IENvbXBvbmVudCkge1xuICBPYmplY3Qua2V5cyhtb2NrZWRQcm9wZXJ0aWVzKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICB0cnkge1xuICAgICAgVnVlLnByb3RvdHlwZVtrZXldID0gbW9ja2VkUHJvcGVydGllc1trZXldXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgd2FybihgY291bGQgbm90IG92ZXJ3cml0ZSBwcm9wZXJ0eSAke2tleX0sIHRoaXMgdXN1YWxseSBjYXVzZWQgYnkgYSBwbHVnaW4gdGhhdCBoYXMgYWRkZWQgdGhlIHByb3BlcnR5IGFzIGEgcmVhZC1vbmx5IHZhbHVlYClcbiAgICB9XG4gICAgJCRWdWUudXRpbC5kZWZpbmVSZWFjdGl2ZShWdWUsIGtleSwgbW9ja2VkUHJvcGVydGllc1trZXldKVxuICB9KVxufVxuIiwiLy8gQGZsb3dcblxuZXhwb3J0IGZ1bmN0aW9uIGxvZ0V2ZW50cyAodm06IENvbXBvbmVudCwgZW1pdHRlZDogT2JqZWN0LCBlbWl0dGVkQnlPcmRlcjogQXJyYXk8YW55Pikge1xuICBjb25zdCBlbWl0ID0gdm0uJGVtaXRcbiAgdm0uJGVtaXQgPSAobmFtZSwgLi4uYXJncykgPT4ge1xuICAgIChlbWl0dGVkW25hbWVdIHx8IChlbWl0dGVkW25hbWVdID0gW10pKS5wdXNoKGFyZ3MpXG4gICAgZW1pdHRlZEJ5T3JkZXIucHVzaCh7IG5hbWUsIGFyZ3MgfSlcbiAgICByZXR1cm4gZW1pdC5jYWxsKHZtLCBuYW1lLCAuLi5hcmdzKVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhZGRFdmVudExvZ2dlciAodnVlOiBDb21wb25lbnQpIHtcbiAgdnVlLm1peGluKHtcbiAgICBiZWZvcmVDcmVhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuX19lbWl0dGVkID0gT2JqZWN0LmNyZWF0ZShudWxsKVxuICAgICAgdGhpcy5fX2VtaXR0ZWRCeU9yZGVyID0gW11cbiAgICAgIGxvZ0V2ZW50cyh0aGlzLCB0aGlzLl9fZW1pdHRlZCwgdGhpcy5fX2VtaXR0ZWRCeU9yZGVyKVxuICAgIH1cbiAgfSlcbn1cbiIsIi8vIEBmbG93XG5pbXBvcnQge1xuICB0aHJvd0Vycm9yLFxuICBjYXBpdGFsaXplLFxuICBjYW1lbGl6ZSxcbiAgaHlwaGVuYXRlXG59IGZyb20gJy4vdXRpbCdcblxuZXhwb3J0IGZ1bmN0aW9uIGlzRG9tU2VsZWN0b3IgKHNlbGVjdG9yOiBhbnkpIHtcbiAgaWYgKHR5cGVvZiBzZWxlY3RvciAhPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIHRyeSB7XG4gICAgaWYgKHR5cGVvZiBkb2N1bWVudCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRocm93RXJyb3IoJ21vdW50IG11c3QgYmUgcnVuIGluIGEgYnJvd3NlciBlbnZpcm9ubWVudCBsaWtlIFBoYW50b21KUywganNkb20gb3IgY2hyb21lJylcbiAgICB9XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgdGhyb3dFcnJvcignbW91bnQgbXVzdCBiZSBydW4gaW4gYSBicm93c2VyIGVudmlyb25tZW50IGxpa2UgUGhhbnRvbUpTLCBqc2RvbSBvciBjaHJvbWUnKVxuICB9XG5cbiAgdHJ5IHtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKVxuICAgIHJldHVybiB0cnVlXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzVnVlQ29tcG9uZW50IChjb21wb25lbnQ6IGFueSkge1xuICBpZiAodHlwZW9mIGNvbXBvbmVudCA9PT0gJ2Z1bmN0aW9uJyAmJiBjb21wb25lbnQub3B0aW9ucykge1xuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICBpZiAoY29tcG9uZW50ID09PSBudWxsIHx8IHR5cGVvZiBjb21wb25lbnQgIT09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICBpZiAoY29tcG9uZW50LmV4dGVuZHMgfHwgY29tcG9uZW50Ll9DdG9yKSB7XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIHJldHVybiB0eXBlb2YgY29tcG9uZW50LnJlbmRlciA9PT0gJ2Z1bmN0aW9uJ1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29tcG9uZW50TmVlZHNDb21waWxpbmcgKGNvbXBvbmVudDogQ29tcG9uZW50KSB7XG4gIHJldHVybiBjb21wb25lbnQgJiZcbiAgICAhY29tcG9uZW50LnJlbmRlciAmJlxuICAgIChjb21wb25lbnQudGVtcGxhdGUgfHxcbiAgICAgIGNvbXBvbmVudC5leHRlbmRzIHx8XG4gICAgICBjb21wb25lbnQuZXh0ZW5kT3B0aW9ucykgJiZcbiAgICAhY29tcG9uZW50LmZ1bmN0aW9uYWxcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUmVmU2VsZWN0b3IgKHJlZk9wdGlvbnNPYmplY3Q6IGFueSkge1xuICBpZiAodHlwZW9mIHJlZk9wdGlvbnNPYmplY3QgIT09ICdvYmplY3QnIHx8IE9iamVjdC5rZXlzKHJlZk9wdGlvbnNPYmplY3QgfHwge30pLmxlbmd0aCAhPT0gMSkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgcmV0dXJuIHR5cGVvZiByZWZPcHRpb25zT2JqZWN0LnJlZiA9PT0gJ3N0cmluZydcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzTmFtZVNlbGVjdG9yIChuYW1lT3B0aW9uc09iamVjdDogYW55KSB7XG4gIGlmICh0eXBlb2YgbmFtZU9wdGlvbnNPYmplY3QgIT09ICdvYmplY3QnIHx8IG5hbWVPcHRpb25zT2JqZWN0ID09PSBudWxsKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICByZXR1cm4gISFuYW1lT3B0aW9uc09iamVjdC5uYW1lXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0ZW1wbGF0ZUNvbnRhaW5zQ29tcG9uZW50ICh0ZW1wbGF0ZTogc3RyaW5nLCBuYW1lOiBzdHJpbmcpIHtcbiAgcmV0dXJuIFtjYXBpdGFsaXplLCBjYW1lbGl6ZSwgaHlwaGVuYXRlXS5zb21lKChmb3JtYXQpID0+IHtcbiAgICBjb25zdCByZSA9IG5ldyBSZWdFeHAoYDwke2Zvcm1hdChuYW1lKX1cXFxccyooXFxcXHN8PnwoXFwvPikpYCwgJ2cnKVxuICAgIHJldHVybiByZS50ZXN0KHRlbXBsYXRlKVxuICB9KVxufVxuIiwiLy8gQGZsb3dcblxuaW1wb3J0IHsgY29tcGlsZVRvRnVuY3Rpb25zIH0gZnJvbSAndnVlLXRlbXBsYXRlLWNvbXBpbGVyJ1xuXG5leHBvcnQgZnVuY3Rpb24gY29tcGlsZVRlbXBsYXRlIChjb21wb25lbnQ6IENvbXBvbmVudCkge1xuICBpZiAoY29tcG9uZW50LnRlbXBsYXRlKSB7XG4gICAgT2JqZWN0LmFzc2lnbihjb21wb25lbnQsIGNvbXBpbGVUb0Z1bmN0aW9ucyhjb21wb25lbnQudGVtcGxhdGUpKVxuICB9XG5cbiAgaWYgKGNvbXBvbmVudC5jb21wb25lbnRzKSB7XG4gICAgT2JqZWN0LmtleXMoY29tcG9uZW50LmNvbXBvbmVudHMpLmZvckVhY2goKGMpID0+IHtcbiAgICAgIGNvbnN0IGNtcCA9IGNvbXBvbmVudC5jb21wb25lbnRzW2NdXG4gICAgICBpZiAoIWNtcC5yZW5kZXIpIHtcbiAgICAgICAgY29tcGlsZVRlbXBsYXRlKGNtcClcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgaWYgKGNvbXBvbmVudC5leHRlbmRzKSB7XG4gICAgY29tcGlsZVRlbXBsYXRlKGNvbXBvbmVudC5leHRlbmRzKVxuICB9XG5cbiAgaWYgKGNvbXBvbmVudC5leHRlbmRPcHRpb25zICYmICFjb21wb25lbnQub3B0aW9ucy5yZW5kZXIpIHtcbiAgICBjb21waWxlVGVtcGxhdGUoY29tcG9uZW50Lm9wdGlvbnMpXG4gIH1cbn1cbiIsIi8vIEBmbG93XG5cbmltcG9ydCBWdWUgZnJvbSAndnVlJ1xuaW1wb3J0IHsgY29tcGlsZVRvRnVuY3Rpb25zIH0gZnJvbSAndnVlLXRlbXBsYXRlLWNvbXBpbGVyJ1xuaW1wb3J0IHsgdGhyb3dFcnJvciB9IGZyb20gJy4vdXRpbCdcbmltcG9ydCB7XG4gIGNvbXBvbmVudE5lZWRzQ29tcGlsaW5nLFxuICB0ZW1wbGF0ZUNvbnRhaW5zQ29tcG9uZW50XG59IGZyb20gJy4vdmFsaWRhdG9ycydcbmltcG9ydCB7IGNvbXBpbGVUZW1wbGF0ZSB9IGZyb20gJy4vY29tcGlsZS10ZW1wbGF0ZSdcblxuZnVuY3Rpb24gaXNWdWVDb21wb25lbnQgKGNvbXApIHtcbiAgcmV0dXJuIGNvbXAgJiYgKGNvbXAucmVuZGVyIHx8IGNvbXAudGVtcGxhdGUgfHwgY29tcC5vcHRpb25zKVxufVxuXG5mdW5jdGlvbiBpc1ZhbGlkU3R1YiAoc3R1YjogYW55KSB7XG4gIHJldHVybiAhIXN0dWIgJiZcbiAgICAgIHR5cGVvZiBzdHViID09PSAnc3RyaW5nJyB8fFxuICAgICAgKHN0dWIgPT09IHRydWUpIHx8XG4gICAgICAoaXNWdWVDb21wb25lbnQoc3R1YikpXG59XG5cbmZ1bmN0aW9uIGlzUmVxdWlyZWRDb21wb25lbnQgKG5hbWUpIHtcbiAgcmV0dXJuIG5hbWUgPT09ICdLZWVwQWxpdmUnIHx8IG5hbWUgPT09ICdUcmFuc2l0aW9uJyB8fCBuYW1lID09PSAnVHJhbnNpdGlvbkdyb3VwJ1xufVxuXG5mdW5jdGlvbiBnZXRDb3JlUHJvcGVydGllcyAoY29tcG9uZW50OiBDb21wb25lbnQpOiBPYmplY3Qge1xuICByZXR1cm4ge1xuICAgIGF0dHJzOiBjb21wb25lbnQuYXR0cnMsXG4gICAgbmFtZTogY29tcG9uZW50Lm5hbWUsXG4gICAgb246IGNvbXBvbmVudC5vbixcbiAgICBrZXk6IGNvbXBvbmVudC5rZXksXG4gICAgcmVmOiBjb21wb25lbnQucmVmLFxuICAgIHByb3BzOiBjb21wb25lbnQucHJvcHMsXG4gICAgZG9tUHJvcHM6IGNvbXBvbmVudC5kb21Qcm9wcyxcbiAgICBjbGFzczogY29tcG9uZW50LmNsYXNzLFxuICAgIHN0YXRpY0NsYXNzOiBjb21wb25lbnQuc3RhdGljQ2xhc3MsXG4gICAgc3RhdGljU3R5bGU6IGNvbXBvbmVudC5zdGF0aWNTdHlsZSxcbiAgICBzdHlsZTogY29tcG9uZW50LnN0eWxlLFxuICAgIG5vcm1hbGl6ZWRTdHlsZTogY29tcG9uZW50Lm5vcm1hbGl6ZWRTdHlsZSxcbiAgICBuYXRpdmVPbjogY29tcG9uZW50Lm5hdGl2ZU9uLFxuICAgIGZ1bmN0aW9uYWw6IGNvbXBvbmVudC5mdW5jdGlvbmFsXG4gIH1cbn1cbmZ1bmN0aW9uIGNyZWF0ZVN0dWJGcm9tU3RyaW5nIChcbiAgdGVtcGxhdGVTdHJpbmc6IHN0cmluZyxcbiAgb3JpZ2luYWxDb21wb25lbnQ6IENvbXBvbmVudCxcbiAgbmFtZTogc3RyaW5nXG4pOiBPYmplY3Qge1xuICBpZiAoIWNvbXBpbGVUb0Z1bmN0aW9ucykge1xuICAgIHRocm93RXJyb3IoJ3Z1ZVRlbXBsYXRlQ29tcGlsZXIgaXMgdW5kZWZpbmVkLCB5b3UgbXVzdCBwYXNzIHByZWNvbXBpbGVkIGNvbXBvbmVudHMgaWYgdnVlLXRlbXBsYXRlLWNvbXBpbGVyIGlzIHVuZGVmaW5lZCcpXG4gIH1cblxuICBpZiAodGVtcGxhdGVDb250YWluc0NvbXBvbmVudCh0ZW1wbGF0ZVN0cmluZywgbmFtZSkpIHtcbiAgICB0aHJvd0Vycm9yKCdvcHRpb25zLnN0dWIgY2Fubm90IGNvbnRhaW4gYSBjaXJjdWxhciByZWZlcmVuY2UnKVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICAuLi5nZXRDb3JlUHJvcGVydGllcyhvcmlnaW5hbENvbXBvbmVudCksXG4gICAgLi4uY29tcGlsZVRvRnVuY3Rpb25zKHRlbXBsYXRlU3RyaW5nKVxuICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUJsYW5rU3R1YiAob3JpZ2luYWxDb21wb25lbnQ6IENvbXBvbmVudCkge1xuICByZXR1cm4ge1xuICAgIC4uLmdldENvcmVQcm9wZXJ0aWVzKG9yaWdpbmFsQ29tcG9uZW50KSxcbiAgICByZW5kZXIgKGgpIHtcbiAgICAgIHJldHVybiBoKGAke29yaWdpbmFsQ29tcG9uZW50Lm5hbWV9LXN0dWJgKVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQ29tcG9uZW50U3R1YnMgKFxuICBvcmlnaW5hbENvbXBvbmVudHM6IE9iamVjdCA9IHt9LFxuICBzdHViczogT2JqZWN0XG4pOiBPYmplY3Qge1xuICBjb25zdCBjb21wb25lbnRzID0ge31cbiAgaWYgKCFzdHVicykge1xuICAgIHJldHVybiBjb21wb25lbnRzXG4gIH1cbiAgaWYgKEFycmF5LmlzQXJyYXkoc3R1YnMpKSB7XG4gICAgc3R1YnMuZm9yRWFjaChzdHViID0+IHtcbiAgICAgIGlmIChzdHViID09PSBmYWxzZSkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBzdHViICE9PSAnc3RyaW5nJykge1xuICAgICAgICB0aHJvd0Vycm9yKCdlYWNoIGl0ZW0gaW4gYW4gb3B0aW9ucy5zdHVicyBhcnJheSBtdXN0IGJlIGEgc3RyaW5nJylcbiAgICAgIH1cbiAgICAgIGNvbXBvbmVudHNbc3R1Yl0gPSBjcmVhdGVCbGFua1N0dWIoeyBuYW1lOiBzdHViIH0pXG4gICAgfSlcbiAgfSBlbHNlIHtcbiAgICBPYmplY3Qua2V5cyhzdHVicykuZm9yRWFjaChzdHViID0+IHtcbiAgICAgIGlmIChzdHVic1tzdHViXSA9PT0gZmFsc2UpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBpZiAoIWlzVmFsaWRTdHViKHN0dWJzW3N0dWJdKSkge1xuICAgICAgICB0aHJvd0Vycm9yKCdvcHRpb25zLnN0dWIgdmFsdWVzIG11c3QgYmUgcGFzc2VkIGEgc3RyaW5nIG9yIGNvbXBvbmVudCcpXG4gICAgICB9XG4gICAgICBpZiAoc3R1YnNbc3R1Yl0gPT09IHRydWUpIHtcbiAgICAgICAgY29tcG9uZW50c1tzdHViXSA9IGNyZWF0ZUJsYW5rU3R1Yih7IG5hbWU6IHN0dWIgfSlcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGlmIChjb21wb25lbnROZWVkc0NvbXBpbGluZyhzdHVic1tzdHViXSkpIHtcbiAgICAgICAgY29tcGlsZVRlbXBsYXRlKHN0dWJzW3N0dWJdKVxuICAgICAgfVxuXG4gICAgICBpZiAob3JpZ2luYWxDb21wb25lbnRzW3N0dWJdKSB7XG4gICAgICAgIC8vIFJlbW92ZSBjYWNoZWQgY29uc3RydWN0b3JcbiAgICAgICAgZGVsZXRlIG9yaWdpbmFsQ29tcG9uZW50c1tzdHViXS5fQ3RvclxuICAgICAgICBpZiAodHlwZW9mIHN0dWJzW3N0dWJdID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIGNvbXBvbmVudHNbc3R1Yl0gPSBjcmVhdGVTdHViRnJvbVN0cmluZyhzdHVic1tzdHViXSwgb3JpZ2luYWxDb21wb25lbnRzW3N0dWJdLCBzdHViKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbXBvbmVudHNbc3R1Yl0gPSB7XG4gICAgICAgICAgICAuLi5zdHVic1tzdHViXSxcbiAgICAgICAgICAgIG5hbWU6IG9yaWdpbmFsQ29tcG9uZW50c1tzdHViXS5uYW1lXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAodHlwZW9mIHN0dWJzW3N0dWJdID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIGlmICghY29tcGlsZVRvRnVuY3Rpb25zKSB7XG4gICAgICAgICAgICB0aHJvd0Vycm9yKCd2dWVUZW1wbGF0ZUNvbXBpbGVyIGlzIHVuZGVmaW5lZCwgeW91IG11c3QgcGFzcyBwcmVjb21waWxlZCBjb21wb25lbnRzIGlmIHZ1ZS10ZW1wbGF0ZS1jb21waWxlciBpcyB1bmRlZmluZWQnKVxuICAgICAgICAgIH1cbiAgICAgICAgICBjb21wb25lbnRzW3N0dWJdID0ge1xuICAgICAgICAgICAgLi4uY29tcGlsZVRvRnVuY3Rpb25zKHN0dWJzW3N0dWJdKVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb21wb25lbnRzW3N0dWJdID0ge1xuICAgICAgICAgICAgLi4uc3R1YnNbc3R1Yl1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vIGlnbm9yZUVsZW1lbnRzIGRvZXMgbm90IGV4aXN0IGluIFZ1ZSAyLjAueFxuICAgICAgaWYgKFZ1ZS5jb25maWcuaWdub3JlZEVsZW1lbnRzKSB7XG4gICAgICAgIFZ1ZS5jb25maWcuaWdub3JlZEVsZW1lbnRzLnB1c2goYCR7c3R1Yn0tc3R1YmApXG4gICAgICB9XG4gICAgfSlcbiAgfVxuICByZXR1cm4gY29tcG9uZW50c1xufVxuXG5mdW5jdGlvbiBzdHViQ29tcG9uZW50cyAoY29tcG9uZW50czogT2JqZWN0LCBzdHViYmVkQ29tcG9uZW50czogT2JqZWN0KSB7XG4gIE9iamVjdC5rZXlzKGNvbXBvbmVudHMpLmZvckVhY2goY29tcG9uZW50ID0+IHtcbiAgICAvLyBSZW1vdmUgY2FjaGVkIGNvbnN0cnVjdG9yXG4gICAgZGVsZXRlIGNvbXBvbmVudHNbY29tcG9uZW50XS5fQ3RvclxuICAgIGlmICghY29tcG9uZW50c1tjb21wb25lbnRdLm5hbWUpIHtcbiAgICAgIGNvbXBvbmVudHNbY29tcG9uZW50XS5uYW1lID0gY29tcG9uZW50XG4gICAgfVxuICAgIHN0dWJiZWRDb21wb25lbnRzW2NvbXBvbmVudF0gPSBjcmVhdGVCbGFua1N0dWIoY29tcG9uZW50c1tjb21wb25lbnRdKVxuXG4gICAgLy8gaWdub3JlRWxlbWVudHMgZG9lcyBub3QgZXhpc3QgaW4gVnVlIDIuMC54XG4gICAgaWYgKFZ1ZS5jb25maWcuaWdub3JlZEVsZW1lbnRzKSB7XG4gICAgICBWdWUuY29uZmlnLmlnbm9yZWRFbGVtZW50cy5wdXNoKGAke2NvbXBvbmVudHNbY29tcG9uZW50XS5uYW1lfS1zdHViYClcbiAgICB9XG4gIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVDb21wb25lbnRTdHVic0ZvckFsbCAoY29tcG9uZW50OiBDb21wb25lbnQpOiBPYmplY3Qge1xuICBjb25zdCBzdHViYmVkQ29tcG9uZW50cyA9IHt9XG5cbiAgaWYgKGNvbXBvbmVudC5jb21wb25lbnRzKSB7XG4gICAgc3R1YkNvbXBvbmVudHMoY29tcG9uZW50LmNvbXBvbmVudHMsIHN0dWJiZWRDb21wb25lbnRzKVxuICB9XG5cbiAgbGV0IGV4dGVuZGVkID0gY29tcG9uZW50LmV4dGVuZHNcblxuICAvLyBMb29wIHRocm91Z2ggZXh0ZW5kZWQgY29tcG9uZW50IGNoYWlucyB0byBzdHViIGFsbCBjaGlsZCBjb21wb25lbnRzXG4gIHdoaWxlIChleHRlbmRlZCkge1xuICAgIGlmIChleHRlbmRlZC5jb21wb25lbnRzKSB7XG4gICAgICBzdHViQ29tcG9uZW50cyhleHRlbmRlZC5jb21wb25lbnRzLCBzdHViYmVkQ29tcG9uZW50cylcbiAgICB9XG4gICAgZXh0ZW5kZWQgPSBleHRlbmRlZC5leHRlbmRzXG4gIH1cblxuICBpZiAoY29tcG9uZW50LmV4dGVuZE9wdGlvbnMgJiYgY29tcG9uZW50LmV4dGVuZE9wdGlvbnMuY29tcG9uZW50cykge1xuICAgIHN0dWJDb21wb25lbnRzKGNvbXBvbmVudC5leHRlbmRPcHRpb25zLmNvbXBvbmVudHMsIHN0dWJiZWRDb21wb25lbnRzKVxuICB9XG5cbiAgcmV0dXJuIHN0dWJiZWRDb21wb25lbnRzXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVDb21wb25lbnRTdHVic0Zvckdsb2JhbHMgKGluc3RhbmNlOiBDb21wb25lbnQpOiBPYmplY3Qge1xuICBjb25zdCBjb21wb25lbnRzID0ge31cbiAgT2JqZWN0LmtleXMoaW5zdGFuY2Uub3B0aW9ucy5jb21wb25lbnRzKS5mb3JFYWNoKChjKSA9PiB7XG4gICAgaWYgKGlzUmVxdWlyZWRDb21wb25lbnQoYykpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbXBvbmVudHNbY10gPSBjcmVhdGVCbGFua1N0dWIoaW5zdGFuY2Uub3B0aW9ucy5jb21wb25lbnRzW2NdKVxuICAgIGRlbGV0ZSBpbnN0YW5jZS5vcHRpb25zLmNvbXBvbmVudHNbY10uX0N0b3IgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1wYXJhbS1yZWFzc2lnblxuICAgIGRlbGV0ZSBjb21wb25lbnRzW2NdLl9DdG9yIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tcGFyYW0tcmVhc3NpZ25cbiAgfSlcbiAgcmV0dXJuIGNvbXBvbmVudHNcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGRlbGV0ZU1vdW50aW5nT3B0aW9ucyAob3B0aW9ucykge1xuICBkZWxldGUgb3B0aW9ucy5hdHRhY2hUb0RvY3VtZW50XG4gIGRlbGV0ZSBvcHRpb25zLm1vY2tzXG4gIGRlbGV0ZSBvcHRpb25zLnNsb3RzXG4gIGRlbGV0ZSBvcHRpb25zLmxvY2FsVnVlXG4gIGRlbGV0ZSBvcHRpb25zLnN0dWJzXG4gIGRlbGV0ZSBvcHRpb25zLmNvbnRleHRcbiAgZGVsZXRlIG9wdGlvbnMuY2xvbmVcbiAgZGVsZXRlIG9wdGlvbnMuYXR0cnNcbiAgZGVsZXRlIG9wdGlvbnMubGlzdGVuZXJzXG4gIGRlbGV0ZSBvcHRpb25zLnByb3BzRGF0YVxufVxuIiwiLy8gQGZsb3dcblxuaW1wb3J0IHsgdGhyb3dFcnJvciB9IGZyb20gJ3NoYXJlZC91dGlsJ1xuaW1wb3J0IHsgY29tcGlsZVRvRnVuY3Rpb25zIH0gZnJvbSAndnVlLXRlbXBsYXRlLWNvbXBpbGVyJ1xuXG5mdW5jdGlvbiBpc1ZhbGlkU2xvdCAoc2xvdDogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiBBcnJheS5pc0FycmF5KHNsb3QpIHx8XG4gICAoc2xvdCAhPT0gbnVsbCAmJiB0eXBlb2Ygc2xvdCA9PT0gJ29iamVjdCcpIHx8XG4gICB0eXBlb2Ygc2xvdCA9PT0gJ3N0cmluZydcbn1cblxuZnVuY3Rpb24gcmVxdWlyZXNUZW1wbGF0ZUNvbXBpbGVyIChzbG90KSB7XG4gIGlmICh0eXBlb2Ygc2xvdCA9PT0gJ3N0cmluZycgJiYgIWNvbXBpbGVUb0Z1bmN0aW9ucykge1xuICAgIHRocm93RXJyb3IoJ3Z1ZVRlbXBsYXRlQ29tcGlsZXIgaXMgdW5kZWZpbmVkLCB5b3UgbXVzdCBwYXNzIHByZWNvbXBpbGVkIGNvbXBvbmVudHMgaWYgdnVlLXRlbXBsYXRlLWNvbXBpbGVyIGlzIHVuZGVmaW5lZCcpXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlU2xvdHMgKHNsb3RzOiBTbG90c09iamVjdCk6IHZvaWQge1xuICBPYmplY3Qua2V5cyhzbG90cykuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgaWYgKCFpc1ZhbGlkU2xvdChzbG90c1trZXldKSkge1xuICAgICAgdGhyb3dFcnJvcignc2xvdHNba2V5XSBtdXN0IGJlIGEgQ29tcG9uZW50LCBzdHJpbmcgb3IgYW4gYXJyYXkgb2YgQ29tcG9uZW50cycpXG4gICAgfVxuXG4gICAgcmVxdWlyZXNUZW1wbGF0ZUNvbXBpbGVyKHNsb3RzW2tleV0pXG5cbiAgICBpZiAoQXJyYXkuaXNBcnJheShzbG90c1trZXldKSkge1xuICAgICAgc2xvdHNba2V5XS5mb3JFYWNoKChzbG90VmFsdWUpID0+IHtcbiAgICAgICAgaWYgKCFpc1ZhbGlkU2xvdChzbG90VmFsdWUpKSB7XG4gICAgICAgICAgdGhyb3dFcnJvcignc2xvdHNba2V5XSBtdXN0IGJlIGEgQ29tcG9uZW50LCBzdHJpbmcgb3IgYW4gYXJyYXkgb2YgQ29tcG9uZW50cycpXG4gICAgICAgIH1cbiAgICAgICAgcmVxdWlyZXNUZW1wbGF0ZUNvbXBpbGVyKHNsb3RWYWx1ZSlcbiAgICAgIH0pXG4gICAgfVxuICB9KVxufVxuIiwiLy8gQGZsb3dcblxuaW1wb3J0IHsgY29tcGlsZVRvRnVuY3Rpb25zIH0gZnJvbSAndnVlLXRlbXBsYXRlLWNvbXBpbGVyJ1xuaW1wb3J0IHsgdGhyb3dFcnJvciB9IGZyb20gJ3NoYXJlZC91dGlsJ1xuaW1wb3J0IHsgdmFsaWRhdGVTbG90cyB9IGZyb20gJy4vdmFsaWRhdGUtc2xvdHMnXG5cbmZ1bmN0aW9uIGNyZWF0ZUZ1bmN0aW9uYWxTbG90cyAoc2xvdHMgPSB7fSwgaCkge1xuICBpZiAoQXJyYXkuaXNBcnJheShzbG90cy5kZWZhdWx0KSkge1xuICAgIHJldHVybiBzbG90cy5kZWZhdWx0Lm1hcChoKVxuICB9XG5cbiAgaWYgKHR5cGVvZiBzbG90cy5kZWZhdWx0ID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBbaChjb21waWxlVG9GdW5jdGlvbnMoc2xvdHMuZGVmYXVsdCkpXVxuICB9XG4gIGNvbnN0IGNoaWxkcmVuID0gW11cbiAgT2JqZWN0LmtleXMoc2xvdHMpLmZvckVhY2goc2xvdFR5cGUgPT4ge1xuICAgIGlmIChBcnJheS5pc0FycmF5KHNsb3RzW3Nsb3RUeXBlXSkpIHtcbiAgICAgIHNsb3RzW3Nsb3RUeXBlXS5mb3JFYWNoKHNsb3QgPT4ge1xuICAgICAgICBjb25zdCBjb21wb25lbnQgPSB0eXBlb2Ygc2xvdCA9PT0gJ3N0cmluZycgPyBjb21waWxlVG9GdW5jdGlvbnMoc2xvdCkgOiBzbG90XG4gICAgICAgIGNvbnN0IG5ld1Nsb3QgPSBoKGNvbXBvbmVudClcbiAgICAgICAgbmV3U2xvdC5kYXRhLnNsb3QgPSBzbG90VHlwZVxuICAgICAgICBjaGlsZHJlbi5wdXNoKG5ld1Nsb3QpXG4gICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBjb21wb25lbnQgPSB0eXBlb2Ygc2xvdHNbc2xvdFR5cGVdID09PSAnc3RyaW5nJyA/IGNvbXBpbGVUb0Z1bmN0aW9ucyhzbG90c1tzbG90VHlwZV0pIDogc2xvdHNbc2xvdFR5cGVdXG4gICAgICBjb25zdCBzbG90ID0gaChjb21wb25lbnQpXG4gICAgICBzbG90LmRhdGEuc2xvdCA9IHNsb3RUeXBlXG4gICAgICBjaGlsZHJlbi5wdXNoKHNsb3QpXG4gICAgfVxuICB9KVxuICByZXR1cm4gY2hpbGRyZW5cbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY3JlYXRlRnVuY3Rpb25hbENvbXBvbmVudCAoY29tcG9uZW50OiBDb21wb25lbnQsIG1vdW50aW5nT3B0aW9uczogT3B0aW9ucykge1xuICBpZiAobW91bnRpbmdPcHRpb25zLmNvbnRleHQgJiYgdHlwZW9mIG1vdW50aW5nT3B0aW9ucy5jb250ZXh0ICE9PSAnb2JqZWN0Jykge1xuICAgIHRocm93RXJyb3IoJ21vdW50LmNvbnRleHQgbXVzdCBiZSBhbiBvYmplY3QnKVxuICB9XG4gIGlmIChtb3VudGluZ09wdGlvbnMuc2xvdHMpIHtcbiAgICB2YWxpZGF0ZVNsb3RzKG1vdW50aW5nT3B0aW9ucy5zbG90cylcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgcmVuZGVyIChoOiBGdW5jdGlvbikge1xuICAgICAgcmV0dXJuIGgoXG4gICAgICAgIGNvbXBvbmVudCxcbiAgICAgICAgbW91bnRpbmdPcHRpb25zLmNvbnRleHQgfHwgY29tcG9uZW50LkZ1bmN0aW9uYWxSZW5kZXJDb250ZXh0LFxuICAgICAgICAobW91bnRpbmdPcHRpb25zLmNvbnRleHQgJiYgbW91bnRpbmdPcHRpb25zLmNvbnRleHQuY2hpbGRyZW4gJiYgbW91bnRpbmdPcHRpb25zLmNvbnRleHQuY2hpbGRyZW4ubWFwKHggPT4gdHlwZW9mIHggPT09ICdmdW5jdGlvbicgPyB4KGgpIDogeCkpIHx8IGNyZWF0ZUZ1bmN0aW9uYWxTbG90cyhtb3VudGluZ09wdGlvbnMuc2xvdHMsIGgpXG4gICAgICApXG4gICAgfSxcbiAgICBuYW1lOiBjb21wb25lbnQubmFtZSxcbiAgICBfaXNGdW5jdGlvbmFsQ29udGFpbmVyOiB0cnVlXG4gIH1cbn1cbiIsIi8vIEBmbG93XG5cbmltcG9ydCB7IGNyZWF0ZVNsb3RWTm9kZXMgfSBmcm9tICcuL2FkZC1zbG90cydcbmltcG9ydCBhZGRNb2NrcyBmcm9tICcuL2FkZC1tb2NrcydcbmltcG9ydCB7IGFkZEV2ZW50TG9nZ2VyIH0gZnJvbSAnLi9sb2ctZXZlbnRzJ1xuaW1wb3J0IHsgY3JlYXRlQ29tcG9uZW50U3R1YnMgfSBmcm9tICdzaGFyZWQvc3R1Yi1jb21wb25lbnRzJ1xuaW1wb3J0IHsgdGhyb3dFcnJvciwgd2FybiwgdnVlVmVyc2lvbiB9IGZyb20gJ3NoYXJlZC91dGlsJ1xuaW1wb3J0IHsgY29tcGlsZVRlbXBsYXRlIH0gZnJvbSAnc2hhcmVkL2NvbXBpbGUtdGVtcGxhdGUnXG5pbXBvcnQgZGVsZXRlTW91bnRpbmdPcHRpb25zIGZyb20gJy4vZGVsZXRlLW1vdW50aW5nLW9wdGlvbnMnXG5pbXBvcnQgY3JlYXRlRnVuY3Rpb25hbENvbXBvbmVudCBmcm9tICcuL2NyZWF0ZS1mdW5jdGlvbmFsLWNvbXBvbmVudCdcbmltcG9ydCB7IGNvbXBvbmVudE5lZWRzQ29tcGlsaW5nIH0gZnJvbSAnc2hhcmVkL3ZhbGlkYXRvcnMnXG5pbXBvcnQgeyB2YWxpZGF0ZVNsb3RzIH0gZnJvbSAnLi92YWxpZGF0ZS1zbG90cydcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY3JlYXRlSW5zdGFuY2UgKFxuICBjb21wb25lbnQ6IENvbXBvbmVudCxcbiAgb3B0aW9uczogT3B0aW9ucyxcbiAgX1Z1ZTogQ29tcG9uZW50LFxuICBlbG0/OiBFbGVtZW50XG4pOiBDb21wb25lbnQge1xuICAvLyBSZW1vdmUgY2FjaGVkIGNvbnN0cnVjdG9yXG4gIGRlbGV0ZSBjb21wb25lbnQuX0N0b3JcblxuICBpZiAob3B0aW9ucy5tb2Nrcykge1xuICAgIGFkZE1vY2tzKG9wdGlvbnMubW9ja3MsIF9WdWUpXG4gIH1cbiAgaWYgKChjb21wb25lbnQub3B0aW9ucyAmJiBjb21wb25lbnQub3B0aW9ucy5mdW5jdGlvbmFsKSB8fCBjb21wb25lbnQuZnVuY3Rpb25hbCkge1xuICAgIGNvbXBvbmVudCA9IGNyZWF0ZUZ1bmN0aW9uYWxDb21wb25lbnQoY29tcG9uZW50LCBvcHRpb25zKVxuICB9IGVsc2UgaWYgKG9wdGlvbnMuY29udGV4dCkge1xuICAgIHRocm93RXJyb3IoXG4gICAgICAnbW91bnQuY29udGV4dCBjYW4gb25seSBiZSB1c2VkIHdoZW4gbW91bnRpbmcgYSBmdW5jdGlvbmFsIGNvbXBvbmVudCdcbiAgICApXG4gIH1cblxuICBpZiAoY29tcG9uZW50TmVlZHNDb21waWxpbmcoY29tcG9uZW50KSkge1xuICAgIGNvbXBpbGVUZW1wbGF0ZShjb21wb25lbnQpXG4gIH1cblxuICBhZGRFdmVudExvZ2dlcihfVnVlKVxuXG4gIGNvbnN0IGluc3RhbmNlT3B0aW9ucyA9IHtcbiAgICAuLi5vcHRpb25zXG4gIH1cblxuICBkZWxldGVNb3VudGluZ09wdGlvbnMoaW5zdGFuY2VPcHRpb25zKVxuXG4gIC8vICRGbG93SWdub3JlXG4gIGNvbnN0IHN0dWJDb21wb25lbnRzID0gY3JlYXRlQ29tcG9uZW50U3R1YnMoY29tcG9uZW50LmNvbXBvbmVudHMsIG9wdGlvbnMuc3R1YnMpXG4gIGlmIChvcHRpb25zLnN0dWJzKSB7XG4gICAgaW5zdGFuY2VPcHRpb25zLmNvbXBvbmVudHMgPSB7XG4gICAgICAuLi5pbnN0YW5jZU9wdGlvbnMuY29tcG9uZW50cyxcbiAgICAgIC8vICRGbG93SWdub3JlXG4gICAgICAuLi5zdHViQ29tcG9uZW50c1xuICAgIH1cbiAgfVxuXG4gIE9iamVjdC5rZXlzKGNvbXBvbmVudC5jb21wb25lbnRzIHx8IHt9KS5mb3JFYWNoKChjKSA9PiB7XG4gICAgaWYgKGNvbXBvbmVudC5jb21wb25lbnRzW2NdLmV4dGVuZE9wdGlvbnMgJiZcbiAgICAgICFpbnN0YW5jZU9wdGlvbnMuY29tcG9uZW50c1tjXSkge1xuICAgICAgaWYgKG9wdGlvbnMubG9nTW9kaWZpZWRDb21wb25lbnRzKSB7XG4gICAgICAgIHdhcm4oYGFuIGV4dGVuZGVkIGNoaWxkIGNvbXBvbmVudCAke2N9IGhhcyBiZWVuIG1vZGlmaWVkIHRvIGVuc3VyZSBpdCBoYXMgdGhlIGNvcnJlY3QgaW5zdGFuY2UgcHJvcGVydGllcy4gVGhpcyBtZWFucyBpdCBpcyBub3QgcG9zc2libGUgdG8gZmluZCB0aGUgY29tcG9uZW50IHdpdGggYSBjb21wb25lbnQgc2VsZWN0b3IuIFRvIGZpbmQgdGhlIGNvbXBvbmVudCwgeW91IG11c3Qgc3R1YiBpdCBtYW51YWxseSB1c2luZyB0aGUgc3R1YnMgbW91bnRpbmcgb3B0aW9uLmApXG4gICAgICB9XG4gICAgICBpbnN0YW5jZU9wdGlvbnMuY29tcG9uZW50c1tjXSA9IF9WdWUuZXh0ZW5kKGNvbXBvbmVudC5jb21wb25lbnRzW2NdKVxuICAgIH1cbiAgfSlcblxuICBPYmplY3Qua2V5cyhzdHViQ29tcG9uZW50cykuZm9yRWFjaChjID0+IHtcbiAgICBfVnVlLmNvbXBvbmVudChjLCBzdHViQ29tcG9uZW50c1tjXSlcbiAgfSlcblxuICBjb25zdCBDb25zdHJ1Y3RvciA9IHZ1ZVZlcnNpb24gPCAyLjMgJiYgdHlwZW9mIGNvbXBvbmVudCA9PT0gJ2Z1bmN0aW9uJ1xuICAgID8gY29tcG9uZW50LmV4dGVuZChpbnN0YW5jZU9wdGlvbnMpXG4gICAgOiBfVnVlLmV4dGVuZChjb21wb25lbnQpLmV4dGVuZChpbnN0YW5jZU9wdGlvbnMpXG5cbiAgT2JqZWN0LmtleXMoaW5zdGFuY2VPcHRpb25zLmNvbXBvbmVudHMgfHwge30pLmZvckVhY2goa2V5ID0+IHtcbiAgICBDb25zdHJ1Y3Rvci5jb21wb25lbnQoa2V5LCBpbnN0YW5jZU9wdGlvbnMuY29tcG9uZW50c1trZXldKVxuICAgIF9WdWUuY29tcG9uZW50KGtleSwgaW5zdGFuY2VPcHRpb25zLmNvbXBvbmVudHNba2V5XSlcbiAgfSlcblxuICBpZiAob3B0aW9ucy5zbG90cykge1xuICAgIHZhbGlkYXRlU2xvdHMob3B0aW9ucy5zbG90cylcbiAgfVxuXG4gIC8vIE9iamVjdHMgYXJlIG5vdCByZXNvbHZlZCBpbiBleHRlbmRlZCBjb21wb25lbnRzIGluIFZ1ZSA8IDIuNVxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vdnVlanMvdnVlL2lzc3Vlcy82NDM2XG4gIGlmIChvcHRpb25zLnByb3ZpZGUgJiZcbiAgICB0eXBlb2Ygb3B0aW9ucy5wcm92aWRlID09PSAnb2JqZWN0JyAmJlxuICAgIHZ1ZVZlcnNpb24gPCAyLjVcbiAgKSB7XG4gICAgY29uc3Qgb2JqID0geyAuLi5vcHRpb25zLnByb3ZpZGUgfVxuICAgIG9wdGlvbnMucHJvdmlkZSA9ICgpID0+IG9ialxuICB9XG5cbiAgY29uc3QgUGFyZW50ID0gX1Z1ZS5leHRlbmQoe1xuICAgIHByb3ZpZGU6IG9wdGlvbnMucHJvdmlkZSxcbiAgICByZW5kZXIgKGgpIHtcbiAgICAgIGNvbnN0IHNsb3RzID0gb3B0aW9ucy5zbG90c1xuICAgICAgICA/IGNyZWF0ZVNsb3RWTm9kZXMoaCwgb3B0aW9ucy5zbG90cylcbiAgICAgICAgOiB1bmRlZmluZWRcbiAgICAgIHJldHVybiBoKENvbnN0cnVjdG9yLCB7XG4gICAgICAgIHJlZjogJ3ZtJyxcbiAgICAgICAgcHJvcHM6IG9wdGlvbnMucHJvcHNEYXRhLFxuICAgICAgICBvbjogb3B0aW9ucy5saXN0ZW5lcnMsXG4gICAgICAgIGF0dHJzOiBvcHRpb25zLmF0dHJzXG4gICAgICB9LCBzbG90cylcbiAgICB9XG4gIH0pXG5cbiAgcmV0dXJuIG5ldyBQYXJlbnQoKVxufVxuIiwiLy8gQGZsb3dcblxuZnVuY3Rpb24gZ2V0T3B0aW9ucyAoa2V5LCBvcHRpb25zLCBjb25maWcpIHtcbiAgaWYgKG9wdGlvbnMgfHxcbiAgICAoY29uZmlnW2tleV0gJiYgT2JqZWN0LmtleXMoY29uZmlnW2tleV0pLmxlbmd0aCA+IDApKSB7XG4gICAgaWYgKG9wdGlvbnMgaW5zdGFuY2VvZiBGdW5jdGlvbikge1xuICAgICAgcmV0dXJuIG9wdGlvbnNcbiAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkob3B0aW9ucykpIHtcbiAgICAgIHJldHVybiBbXG4gICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIC4uLk9iamVjdC5rZXlzKGNvbmZpZ1trZXldIHx8IHt9KV1cbiAgICB9IGVsc2UgaWYgKCEoY29uZmlnW2tleV0gaW5zdGFuY2VvZiBGdW5jdGlvbikpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLmNvbmZpZ1trZXldLFxuICAgICAgICAuLi5vcHRpb25zXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ29uZmlnIGNhbid0IGJlIGEgRnVuY3Rpb24uYClcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1lcmdlT3B0aW9ucyAoXG4gIG9wdGlvbnM6IE9wdGlvbnMsXG4gIGNvbmZpZzogT3B0aW9uc1xuKTogT3B0aW9ucyB7XG4gIHJldHVybiB7XG4gICAgLi4ub3B0aW9ucyxcbiAgICBsb2dNb2RpZmllZENvbXBvbmVudHM6IGNvbmZpZy5sb2dNb2RpZmllZENvbXBvbmVudHMsXG4gICAgc3R1YnM6IGdldE9wdGlvbnMoJ3N0dWJzJywgb3B0aW9ucy5zdHVicywgY29uZmlnKSxcbiAgICBtb2NrczogZ2V0T3B0aW9ucygnbW9ja3MnLCBvcHRpb25zLm1vY2tzLCBjb25maWcpLFxuICAgIG1ldGhvZHM6IGdldE9wdGlvbnMoJ21ldGhvZHMnLCBvcHRpb25zLm1ldGhvZHMsIGNvbmZpZyksXG4gICAgcHJvdmlkZTogZ2V0T3B0aW9ucygncHJvdmlkZScsIG9wdGlvbnMucHJvdmlkZSwgY29uZmlnKSxcbiAgICBzeW5jOiAhISgob3B0aW9ucy5zeW5jIHx8IG9wdGlvbnMuc3luYyA9PT0gdW5kZWZpbmVkKSlcbiAgfVxufVxuXG4iLCJpbXBvcnQgdGVzdFV0aWxzIGZyb20gJ0B2dWUvdGVzdC11dGlscydcblxuZXhwb3J0IGRlZmF1bHQgdGVzdFV0aWxzLmNvbmZpZ1xuIiwiLy8gQGZsb3dcblxuaW1wb3J0IFZ1ZSBmcm9tICd2dWUnXG5pbXBvcnQgY3JlYXRlSW5zdGFuY2UgZnJvbSAnY3JlYXRlLWluc3RhbmNlJ1xuaW1wb3J0IHsgdGhyb3dFcnJvciB9IGZyb20gJ3NoYXJlZC91dGlsJ1xuaW1wb3J0IHsgY3JlYXRlUmVuZGVyZXIgfSBmcm9tICd2dWUtc2VydmVyLXJlbmRlcmVyJ1xuaW1wb3J0IHRlc3RVdGlscyBmcm9tICdAdnVlL3Rlc3QtdXRpbHMnXG5pbXBvcnQgeyBtZXJnZU9wdGlvbnMgfSBmcm9tICdzaGFyZWQvbWVyZ2Utb3B0aW9ucydcbmltcG9ydCBjb25maWcgZnJvbSAnLi9jb25maWcnXG5cblZ1ZS5jb25maWcucHJvZHVjdGlvblRpcCA9IGZhbHNlXG5WdWUuY29uZmlnLmRldnRvb2xzID0gZmFsc2VcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcmVuZGVyVG9TdHJpbmcgKGNvbXBvbmVudDogQ29tcG9uZW50LCBvcHRpb25zOiBPcHRpb25zID0ge30pOiBzdHJpbmcge1xuICBjb25zdCByZW5kZXJlciA9IGNyZWF0ZVJlbmRlcmVyKClcblxuICBpZiAoIXJlbmRlcmVyKSB7XG4gICAgdGhyb3dFcnJvcigncmVuZGVyVG9TdHJpbmcgbXVzdCBiZSBydW4gaW4gbm9kZS4gSXQgY2Fubm90IGJlIHJ1biBpbiBhIGJyb3dzZXInKVxuICB9XG4gIC8vIFJlbW92ZSBjYWNoZWQgY29uc3RydWN0b3JcbiAgZGVsZXRlIGNvbXBvbmVudC5fQ3RvclxuXG4gIGlmIChvcHRpb25zLmF0dGFjaFRvRG9jdW1lbnQpIHtcbiAgICB0aHJvd0Vycm9yKCd5b3UgY2Fubm90IHVzZSBhdHRhY2hUb0RvY3VtZW50IHdpdGggcmVuZGVyVG9TdHJpbmcnKVxuICB9XG4gIGNvbnN0IHZ1ZUNsYXNzID0gb3B0aW9ucy5sb2NhbFZ1ZSB8fCB0ZXN0VXRpbHMuY3JlYXRlTG9jYWxWdWUoKVxuICBjb25zdCB2bSA9IGNyZWF0ZUluc3RhbmNlKGNvbXBvbmVudCwgbWVyZ2VPcHRpb25zKG9wdGlvbnMsIGNvbmZpZyksIHZ1ZUNsYXNzKVxuICBsZXQgcmVuZGVyZWRTdHJpbmcgPSAnJ1xuXG4gIC8vICRGbG93SWdub3JlXG4gIHJlbmRlcmVyLnJlbmRlclRvU3RyaW5nKHZtLCAoZXJyLCByZXMpID0+IHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICBjb25zb2xlLmxvZyhlcnIpXG4gICAgfVxuICAgIHJlbmRlcmVkU3RyaW5nID0gcmVzXG4gIH0pXG4gIHJldHVybiByZW5kZXJlZFN0cmluZ1xufVxuIiwiLy8gQGZsb3dcblxuaW1wb3J0IHJlbmRlclRvU3RyaW5nIGZyb20gJy4vcmVuZGVyVG9TdHJpbmcnXG5pbXBvcnQgY2hlZXJpbyBmcm9tICdjaGVlcmlvJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiByZW5kZXIgKGNvbXBvbmVudDogQ29tcG9uZW50LCBvcHRpb25zOiBPcHRpb25zID0ge30pOiBzdHJpbmcge1xuICBjb25zdCByZW5kZXJlZFN0cmluZyA9IHJlbmRlclRvU3RyaW5nKGNvbXBvbmVudCwgb3B0aW9ucylcbiAgcmV0dXJuIGNoZWVyaW8ubG9hZCgnJykocmVuZGVyZWRTdHJpbmcpXG59XG4iLCJpbXBvcnQgcmVuZGVyVG9TdHJpbmcgZnJvbSAnLi9yZW5kZXJUb1N0cmluZydcbmltcG9ydCByZW5kZXIgZnJvbSAnLi9yZW5kZXInXG5pbXBvcnQgY29uZmlnIGZyb20gJy4vY29uZmlnJ1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIHJlbmRlclRvU3RyaW5nLFxuICBjb25maWcsXG4gIHJlbmRlclxufVxuIl0sIm5hbWVzIjpbImNvbnN0IiwiY29tcGlsZVRvRnVuY3Rpb25zIiwiVnVlIiwiJCRWdWUiLCJpc1Z1ZUNvbXBvbmVudCIsImNyZWF0ZVJlbmRlcmVyIiwibGV0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7O0FBSUEsU0FBUyxhQUFhLEVBQUUsR0FBRyxFQUFFO0VBQzNCLE9BQU8sR0FBRyxJQUFJLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHO0NBQ3BDOztBQUVELFNBQVMsbUJBQW1CO0VBQzFCLENBQUM7RUFDRCxTQUFTO0VBQ1QsSUFBSTtFQUNZO0VBQ2hCLElBQUksT0FBTyxTQUFTLEtBQUssUUFBUTtFQUNqQyxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsRUFBRTtJQUN6QixPQUFPLFNBQVM7R0FDakI7O0VBRURBLElBQU0sRUFBRSxHQUFHLE9BQU8sU0FBUyxLQUFLLFFBQVE7TUFDcENDLHNDQUFrQixDQUFDLFNBQVMsQ0FBQztNQUM3QixVQUFTOztFQUViRCxJQUFNLEtBQUssR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFDO0VBQ25CLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLEtBQUk7RUFDdEIsT0FBTyxLQUFLO0NBQ2I7O0FBRUQsQUFBTyxTQUFTLGdCQUFnQjtFQUM5QixD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
