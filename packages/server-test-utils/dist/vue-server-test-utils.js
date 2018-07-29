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
  slotValue
) {
  var el = vueTemplateCompiler.compileToFunctions(("<div>" + slotValue + "</div>"));
  var _staticRenderFns = vm._renderProxy.$options.staticRenderFns;
  var _staticTrees = vm._renderProxy._staticTrees;
  vm._renderProxy._staticTrees = [];
  vm._renderProxy.$options.staticRenderFns = el.staticRenderFns;
  var vnode = el.render.call(vm._renderProxy, vm.$createElement);
  vm._renderProxy.$options.staticRenderFns = _staticRenderFns;
  vm._renderProxy._staticTrees = _staticTrees;
  return vnode.children
}

function createVNodesForSlot (
  vm,
  slotValue,
  name
) {
  var vnode;
  if (typeof slotValue === 'string') {
    var vnodes = createVNodes(vm, slotValue);
    if (vnodes.length > 1) {
      return vnodes
    }
    vnode = vnodes[0];
  } else {
    vnode = vm.$createElement(slotValue);
  }
  if (vnode.data) {
    vnode.data.slot = name;
  } else {
    vnode.data = { slot: name };
  }
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

function addMocks (
  mockedProperties,
  Vue$$1
) {
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

function isVueComponent (component) {
  if (typeof component === 'function' && component.options) {
    return true
  }

  if (component === null || typeof component !== 'object') {
    return false
  }

  if (component.extends || component._Ctor) {
    return true
  }

  if (typeof component.template === 'string') {
    return true
  }

  return typeof component.render === 'function'
}

function componentNeedsCompiling (component) {
  return (
    component &&
    !component.render &&
    (component.template || component.extends || component.extendOptions) &&
    !component.functional
  )
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

function isPlainObject (obj) {
  return Object.prototype.toString.call(obj) === '[object Object]'
}

function isRequiredComponent (name) {
  return (
    name === 'KeepAlive' || name === 'Transition' || name === 'TransitionGroup'
  )
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

function isVueComponentStub (comp) {
  return comp && comp.template || isVueComponent(comp)
}

function isValidStub (stub) {
  return (
    (!!stub && typeof stub === 'string') ||
    stub === true ||
    isVueComponentStub(stub)
  )
}

function resolveComponent (obj, component) {
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
    on: componentOptions.on,
    key: componentOptions.key,
    ref: componentOptions.ref,
    props: componentOptions.props,
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

  var componentOptions = typeof originalComponent === 'function'
    ? originalComponent.extendOptions
    : originalComponent;

  return Object.assign({}, getCoreProperties(componentOptions),
    vueTemplateCompiler.compileToFunctions(templateString))
}

function createBlankStub (
  originalComponent,
  name
) {
  var componentOptions = typeof originalComponent === 'function'
    ? originalComponent.extendOptions
    : originalComponent;
  var tagName = name + "-stub";

  // ignoreElements does not exist in Vue 2.0.x
  if (Vue.config.ignoredElements) {
    Vue.config.ignoredElements.push(tagName);
  }

  return Object.assign({}, getCoreProperties(componentOptions),
    {render: function render (h, context) {
      return h(
        tagName,
        {
          attrs: componentOptions.functional ? Object.assign({}, context.props,
            context.data.attrs) : Object.assign({}, this.$props)
        },
        context ? context.children : this.$slots.default
      )
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
      var component = resolveComponent(originalComponents, stub);

      components[stub] = createBlankStub(component, stub);
    });
  } else {
    var stubsObject = (stubs);
    Object.keys(stubsObject).forEach(function (stubName) {
      var stub = stubsObject[stubName];
      if (stub === false) {
        return
      }

      if (!isValidStub(stub)) {
        throwError(
          "options.stub values must be passed a string or " + "component"
        );
      }

      if (stub === true) {
        var component = resolveComponent(originalComponents, stubName);
        components[stubName] = createBlankStub(component, stubName);
        return
      }

      if (typeof stub !== 'string' && componentNeedsCompiling(stub)) {
        compileTemplate(stub);
      }

      if (originalComponents[stubName]) {
        // Remove cached constructor
        delete originalComponents[stubName]._Ctor;
        if (typeof stub === 'string') {
          components[stubName] = createStubFromString(
            stub,
            originalComponents[stubName],
            stubName
          );
        } else {
          var stubObject = (stub);
          components[stubName] = Object.assign({}, stubObject,
            {name: originalComponents[stubName].name});
        }
      } else {
        if (typeof stub === 'string') {
          if (!vueTemplateCompiler.compileToFunctions) {
            throwError(
              "vueTemplateCompiler is undefined, you must pass " +
                "precompiled components if vue-template-compiler is " +
                "undefined"
            );
          }
          components[stubName] = Object.assign({}, vueTemplateCompiler.compileToFunctions(stub));
        } else {
          var stubObject$1 = (stub);
          components[stubName] = Object.assign({}, stubObject$1);
        }
      }
    });
  }
  return components
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
  'propsData'
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
          createSlotVNodes(this, mountingOptions.slots || {})
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

function getVueTemplateCompilerHelpers () {
  var vue = new Vue();
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
  if (vueVersion < 2.1) {
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
  scopedSlotsOption
) {
  var scopedSlots = {};
  if (!scopedSlotsOption) {
    return scopedSlots
  }
  validateEnvironment();
  var helpers = getVueTemplateCompilerHelpers();
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

function createInstance (
  component,
  options,
  _Vue,
  elm
) {
  // Remove cached constructor
  delete component._Ctor;

  // mounting options are vue-test-utils specific
  //
  // instance options are options that are passed to the
  // root instance when it's instantiated
  //
  // component options are the root components options
  var componentOptions = typeof component === 'function'
    ? component.extendOptions
    : component;

  var instanceOptions = extractInstanceOptions(options);

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

  // Replace globally registered components with components extended
  // from localVue. This makes sure the beforeMount mixins to add stubs
  // is applied to globally registered components.
  // Vue version must be 2.3 or greater, because of a bug resolving
  // extended constructor options (https://github.com/vuejs/vue/issues/4976)
  if (vueVersion > 2.2) {
    for (var c in _Vue.options.components) {
      if (!isRequiredComponent(c)) {
        _Vue.component(c, _Vue.extend(_Vue.options.components[c]));
      }
    }
  }

  var stubComponents = createComponentStubs(
    component.components,
    // $FlowIgnore
    options.stubs
  );
  if (options.stubs) {
    instanceOptions.components = Object.assign({}, instanceOptions.components,
      stubComponents);
  }
  function addStubComponentsMixin () {
    Object.assign(
      this.$options.components,
      stubComponents
    );
  }
  _Vue.mixin({
    beforeMount: addStubComponentsMixin,
    // beforeCreate is for components created in node, which
    // never mount
    beforeCreate: addStubComponentsMixin
  });
  Object.keys(componentOptions.components || {}).forEach(function (c) {
    if (
      componentOptions.components[c].extendOptions &&
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
      instanceOptions.components[c] = _Vue.extend(
        componentOptions.components[c]
      );
    }
  });

  if (component.options) {
    component.options._base = _Vue;
  }

  // when component constructed by Vue.extend,
  // use its own extend method to keep component information
  var Constructor = typeof component === 'function'
    ? component.extend(instanceOptions)
    : _Vue.extend(component).extend(instanceOptions);

  Object.keys(instanceOptions.components || {}).forEach(function (key) {
    Constructor.component(key, instanceOptions.components[key]);
    _Vue.component(key, instanceOptions.components[key]);
  });

  if (options.slots) {
    compileTemplateForSlots(options.slots);
    // $FlowIgnore
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

  var scopedSlots = createScopedSlots(options.scopedSlots);

  if (options.parentComponent && !isPlainObject(options.parentComponent)) {
    throwError(
      "options.parentComponent should be a valid Vue component " +
      "options object"
    );
  }

  var parentComponentOptions = options.parentComponent || {};
  parentComponentOptions.provide = options.provide;
  parentComponentOptions.render = function (h) {
    var slots = options.slots
      ? createSlotVNodes(this, options.slots)
      : undefined;
    return h(
      Constructor,
      {
        ref: 'vm',
        on: options.listeners,
        attrs: Object.assign({}, options.attrs,
          // pass as attrs so that inheritAttrs works correctly
          // propsData should take precedence over attrs
          options.propsData),
        scopedSlots: scopedSlots
      },
      slots
    )
  };
  var Parent = _Vue.extend(parentComponentOptions);

  return new Parent()
}

// 

function getOption (option, config) {
  if (option || (config && Object.keys(config).length > 0)) {
    if (option instanceof Function) {
      return option
    } else if (Array.isArray(option)) {
      return option.concat( Object.keys(config || {}))
    } else if (config instanceof Function) {
      throw new Error("Config can't be a Function.")
    } else {
      return Object.assign({}, config,
        option)
    }
  }
}

function mergeOptions (options, config) {
  var mocks = (getOption(options.mocks, config.mocks));
  var methods = (
    (getOption(options.methods, config.methods)));
  var provide = ((getOption(options.provide, config.provide)));
  return Object.assign({}, options,
    {logModifiedComponents: config.logModifiedComponents,
    stubs: getOption(options.stubs, config.stubs),
    mocks: mocks,
    methods: methods,
    provide: provide,
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
