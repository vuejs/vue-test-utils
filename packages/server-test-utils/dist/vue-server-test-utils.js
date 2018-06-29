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
  if (typeof slotValue === 'string' && !startsWithTag(slotValue)) {
    return slotValue
  }

  var el =
    typeof slotValue === 'string' ? vueTemplateCompiler.compileToFunctions(slotValue) : slotValue;

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
      var nodes = content.map(function (slotDef) { return createVNodesForSlot(h, slotDef, key); });
      return acc.concat(nodes)
    }

    return acc.concat(createVNodesForSlot(h, content, key))
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
  var camelizedStr = str.replace(
    camelizeRE,
    function (_, c) { return (c ? c.toUpperCase() : ''); }
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

var vueVersion = Number(
  ((Vue.version.split('.')[0]) + "." + (Vue.version.split('.')[1]))
);

// 

function addMocks (mockedProperties, Vue$$1) {
  Object.keys(mockedProperties).forEach(function (key) {
    try {
      Vue$$1.prototype[key] = mockedProperties[key];
    } catch (e) {
      warn(
        "could not overwrite property " + key + ", this is " +
        "usually caused by a plugin that has added " +
        "the property as a read-only value"
      );
    }
    Vue.util.defineReactive(Vue$$1, key, mockedProperties[key]);
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
  return (
    component &&
    !component.render &&
    (component.template || component.extends || component.extendOptions) &&
    !component.functional
  )
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
  return (
    (!!stub && typeof stub === 'string') ||
    stub === true ||
    isVueComponent$1(stub)
  )
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
    throwError(
      "vueTemplateCompiler is undefined, you must pass " +
        "precompiled components if vue-template-compiler is " +
        "undefined"
    );
  }

  if (templateContainsComponent(templateString, name)) {
    throwError('options.stub cannot contain a circular reference');
  }

  return Object.assign({}, getCoreProperties(originalComponent),
    vueTemplateCompiler.compileToFunctions(templateString))
}

function createBlankStub (originalComponent) {
  var name = (originalComponent.name) + "-stub";

  // ignoreElements does not exist in Vue 2.0.x
  if (Vue.config.ignoredElements) {
    Vue.config.ignoredElements.push(name);
  }

  return Object.assign({}, getCoreProperties(originalComponent),
    {render: function render (h) {
      return h(name)
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
        throwError("each item in an options.stubs array must be a " + "string");
      }
      components[stub] = createBlankStub({ name: stub });
    });
  } else {
    Object.keys(stubs).forEach(function (stub) {
      if (stubs[stub] === false) {
        return
      }
      if (!isValidStub(stubs[stub])) {
        throwError(
          "options.stub values must be passed a string or " + "component"
        );
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
          components[stub] = createStubFromString(
            stubs[stub],
            originalComponents[stub],
            stub
          );
        } else {
          components[stub] = Object.assign({}, stubs[stub],
            {name: originalComponents[stub].name});
        }
      } else {
        if (typeof stubs[stub] === 'string') {
          if (!vueTemplateCompiler.compileToFunctions) {
            throwError(
              "vueTemplateCompiler is undefined, you must pass " +
                "precompiled components if vue-template-compiler is " +
                "undefined"
            );
          }
          components[stub] = Object.assign({}, vueTemplateCompiler.compileToFunctions(stubs[stub]));
        } else {
          components[stub] = Object.assign({}, stubs[stub]);
        }
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
  return (
    Array.isArray(slot) ||
    (slot !== null && typeof slot === 'object') ||
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
    if (!isValidSlot(slots[key])) {
      throwError(
        "slots[key] must be a Component, string or an array " + "of Components"
      );
    }

    requiresTemplateCompiler(slots[key]);

    if (Array.isArray(slots[key])) {
      slots[key].forEach(function (slotValue) {
        if (!isValidSlot(slotValue)) {
          throwError(
            "slots[key] must be a Component, string or an array " +
              "of Components"
          );
        }
        requiresTemplateCompiler(slotValue);
      });
    }
  });
}

// 

function createFunctionalComponent (
  component,
  mountingOptions
) {
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
        (mountingOptions.context &&
          mountingOptions.context.children &&
          mountingOptions.context.children.map(
            function (x) { return (typeof x === 'function' ? x(h) : x); }
          )) ||
          createSlotVNodes(h, mountingOptions.slots || {})
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
  if (
    (component.options && component.options.functional) ||
    component.functional
  ) {
    component = createFunctionalComponent(component, options);
  } else if (options.context) {
    throwError(
      "mount.context can only be used when mounting a " + "functional component"
    );
  }

  if (componentNeedsCompiling(component)) {
    compileTemplate(component);
  }

  addEventLogger(_Vue);

  var instanceOptions = Object.assign({}, options);

  deleteMountingOptions(instanceOptions);

  var stubComponents = createComponentStubs(
    // $FlowIgnore
    component.components,
    // $FlowIgnore
    options.stubs
  );
  if (options.stubs) {
    instanceOptions.components = Object.assign({}, instanceOptions.components,
      // $FlowIgnore
      stubComponents);
  }
  _Vue.mixin({
    created: function created () {
      Object.assign(
        this.$options.components,
        stubComponents
      );
    }
  });
  Object.keys(component.components || {}).forEach(function (c) {
    if (
      component.components[c].extendOptions &&
      !instanceOptions.components[c]
    ) {
      if (options.logModifiedComponents) {
        warn(
          "an extended child component <" + c + "> has been modified " +
          "to ensure it has the correct instance properties. " +
          "This means it is not possible to find the component " +
          "with a component selector. To find the component, " +
          "you must stub it manually using the stubs mounting " +
          "option."
        );
      }
      instanceOptions.components[c] = _Vue.extend(component.components[c]);
    }
  });

  if (component.options) {
    component.options._base = _Vue;
  }

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
  if (
    options.provide &&
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
      return h(
        Constructor,
        {
          ref: 'vm',
          props: options.propsData,
          on: options.listeners,
          attrs: options.attrs
        },
        slots
      )
    }
  });

  return new Parent()
}

// 

function getOptions (key, options, config) {
  if (options || (config[key] && Object.keys(config[key]).length > 0)) {
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

function mergeOptions (options, config) {
  return Object.assign({}, options,
    {logModifiedComponents: config.logModifiedComponents,
    stubs: getOptions('stubs', options.stubs, config),
    mocks: getOptions('mocks', options.mocks, config),
    methods: getOptions('methods', options.methods, config),
    provide: getOptions('provide', options.provide, config),
    sync: !!(options.sync || options.sync === undefined)})
}

var config = testUtils.config

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
  // Remove cached constructor
  delete component._Ctor;

  if (options.attachToDocument) {
    throwError("you cannot use attachToDocument with " + "renderToString");
  }
  var vueConstructor = testUtils.createLocalVue(options.localVue);
  var vm = createInstance(
    component,
    mergeOptions(options, config),
    vueConstructor
  );
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
