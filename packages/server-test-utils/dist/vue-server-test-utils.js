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
  if ( mockedProperties === void 0 ) mockedProperties = {};

  if (mockedProperties === false) {
    return
  }
  Object.keys(mockedProperties).forEach(function (key) {
    try {
      // $FlowIgnore
      Vue$$1.prototype[key] = mockedProperties[key];
    } catch (e) {
      warn(
        "could not overwrite property " + key + ", this is " +
        "usually caused by a plugin that has added " +
        "the property as a read-only value"
      );
    }
    // $FlowIgnore
    Vue.util.defineReactive(Vue$$1, key, mockedProperties[key]);
  });
}

// This is used instead of Vue.mixin. The reason is that
// Vue.mixin is slower, and remove modified options
// https://github.com/vuejs/vue/issues/8710

function addHook (options, hook, fn) {
  if (options[hook] && !Array.isArray(options[hook])) {
    options[hook] = [options[hook]];
  }
  (options[hook] || (options[hook] = [])).push(fn);
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
  addHook(_Vue.options, 'beforeCreate', function () {
    this.__emitted = Object.create(null);
    this.__emittedByOrder = [];
    logEvents(this, this.__emitted, this.__emittedByOrder);
  }
  );
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

function createClassString (staticClass, dynamicClass) {
  if (staticClass && dynamicClass) {
    return staticClass + ' ' + dynamicClass
  }
  return staticClass || dynamicClass
}

function createStubFromComponent (
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
    {$_vueTestUtils_original: originalComponent,
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
  name
) {
  if ( originalComponent === void 0 ) originalComponent = {};

  if (templateContainsComponent(templateString, name)) {
    throwError('options.stub cannot contain a circular reference');
  }

  var componentOptions = typeof originalComponent === 'function'
    ? originalComponent.extendOptions
    : originalComponent;

  return Object.assign({}, getCoreProperties(componentOptions),
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
  stubs
) {
  if ( originalComponents === void 0 ) originalComponents = {};

  return Object.keys(stubs || {}).reduce(function (acc, stubName) {
    var stub = stubs[stubName];

    validateStub(stub);

    if (stub === false) {
      return acc
    }

    if (stub === true) {
      var component = resolveComponent(originalComponents, stubName);
      acc[stubName] = createStubFromComponent(component, stubName);
      return acc
    }

    if (originalComponents[stubName]) {
      // Remove cached constructor
      delete originalComponents[stubName]._Ctor;
    }

    if (typeof stub === 'string') {
      acc[stubName] = createStubFromString(
        stub,
        originalComponents[stubName],
        stubName
      );
      return acc
    }

    if (componentNeedsCompiling(stub)) {
      compileTemplate(stub);
    }
    var name = originalComponents[stubName] &&
    originalComponents[stubName].name;

    acc[stubName] = Object.assign({}, {name: name},
      stub);

    return acc
  }, {})
}

function addStubs (component, stubs, _Vue) {
  var stubComponents = createStubsFromStubsObject(
    component.components,
    stubs
  );

  function addStubComponentsMixin () {
    Object.assign(
      this.$options.components,
      stubComponents
    );
  }

  addHook(_Vue.options, 'beforeMount', addStubComponentsMixin);
  // beforeCreate is for components created in node, which
  // never mount
  addHook(_Vue.options, 'beforeCreate', addStubComponentsMixin);
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
  'sync'
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

  var data = mountingOptions.context ||
    component.FunctionalRenderContext || {};
  data.scopedSlots = createScopedSlots(mountingOptions.scopedSlots);

  return {
    render: function render (h) {
      return h(
        component,
        data,
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

function createdFrom (extendOptions, componentOptions) {
  while (extendOptions) {
    if (extendOptions === componentOptions) {
      return true
    }
    if (extendOptions._vueTestUtilsRoot === componentOptions) {
      return true
    }
    extendOptions = extendOptions.extendOptions;
  }
}

function resolveComponents (options, components) {
  if ( options === void 0 ) options = {};
  if ( components === void 0 ) components = {};

  var extendOptions = options.extendOptions;
  while (extendOptions) {
    resolveComponents(extendOptions, components);
    extendOptions = extendOptions.extendOptions;
  }
  var extendsFrom = options.extends;
  while (extendsFrom) {
    resolveComponents(extendsFrom, components);
    extendsFrom = extendsFrom.extends;
  }
  Object.keys(options.components || {}).forEach(function (c) {
    components[c] = options.components[c];
  });
  return components
}

function shouldExtend (component) {
  while (component) {
    if (component.extendOptions) {
      return true
    }
    component = component.extends;
  }
}

// Components created with Vue.extend are not created internally in Vue
// by extending a localVue constructor. To make sure they inherit
// properties add to a localVue constructor, we must create new components by
// extending the original extended components from the localVue constructor.
// We apply a global mixin that overwrites the components original
// components with the extended components when they are created.
function extendExtendedComponents (
  component,
  _Vue,
  logModifiedComponents,
  excludedComponents,
  stubAllComponents
) {
  if ( excludedComponents === void 0 ) excludedComponents = { };
  if ( stubAllComponents === void 0 ) stubAllComponents = false;

  var extendedComponents = Object.create(null);
  var components = resolveComponents(component);

  Object.keys(components).forEach(function (c) {
    var comp = components[c];
    var shouldExtendComponent =
      (shouldExtend(comp) &&
      !excludedComponents[c]) ||
      stubAllComponents;
    if (shouldExtendComponent) {
      if (logModifiedComponents) {
        warn(
          "The child component <" + c + "> has been modified to ensure " +
          "it is created with properties injected by Vue Test Utils. \n" +
          "This is because the component was created with Vue.extend, " +
          "or uses the Vue Class Component decorator. \n" +
          "Because the component has been modified, it is not possible " +
          "to find it with a component selector. To find the " +
          "component, you must stub it manually using the stubs mounting " +
          "option, or use a name or ref selector. \n" +
          "You can hide this warning by setting the Vue Test Utils " +
          "config.logModifiedComponents option to false."
        );
      }

      var extendedComp = _Vue.extend(comp);
      // Used to identify component in a render tree
      extendedComp.options.$_vueTestUtils_original = comp;
      extendedComponents[c] = extendedComp;
    }
    // If a component has been replaced with an extended component
    // all its child components must also be replaced.
    extendExtendedComponents(
      comp,
      _Vue,
      logModifiedComponents,
      {},
      shouldExtendComponent
    );
  });
  if (Object.keys(extendedComponents).length > 0) {
    addHook(_Vue.options, 'beforeCreate', function addExtendedOverwrites () {
      if (createdFrom(this.constructor, component)) {
        Object.assign(
          this.$options.components,
          extendedComponents
        );
      }
    });
  }
}

// 

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

function createInstance (
  component,
  options,
  _Vue
) {
  // Remove cached constructor
  delete component._Ctor;

  // make sure all extends are based on this instance
  _Vue.options._base = _Vue;

  if (
    vueVersion < 2.3 &&
    typeof component === 'function' &&
    component.options
  ) {
    UNSUPPORTED_VERSION_OPTIONS.forEach(function (option) {
      if (options[option]) {
        throwError(vueExtendUnsupportedOption(option));
      }
    });
  }

  // instance options are options that are passed to the
  // root instance when it's instantiated
  var instanceOptions = extractInstanceOptions(options);

  addEventLogger(_Vue);
  addMocks(options.mocks, _Vue);
  addStubs(component, options.stubs, _Vue);

  if (
    (component.options && component.options.functional) ||
    component.functional
  ) {
    component = createFunctionalComponent(component, options);
  } else if (options.context) {
    throwError(
      "mount.context can only be used when mounting a " +
      "functional component"
    );
  }

  if (componentNeedsCompiling(component)) {
    compileTemplate(component);
  }

  // Replace globally registered components with components extended
  // from localVue.
  // Vue version must be 2.3 or greater, because of a bug resolving
  // extended constructor options (https://github.com/vuejs/vue/issues/4976)
  if (vueVersion > 2.2) {
    for (var c in _Vue.options.components) {
      if (!isRequiredComponent(c)) {
        var extendedComponent = _Vue.extend(_Vue.options.components[c]);
        extendedComponent.options.$_vueTestUtils_original =
          _Vue.options.components[c];
        _Vue.component(c, _Vue.extend(_Vue.options.components[c]));
      }
    }
  }

  extendExtendedComponents(
    component,
    _Vue,
    options.logModifiedComponents,
    instanceOptions.components
  );

  if (component.options) {
    component.options._base = _Vue;
  }

  // extend component from _Vue to add properties and mixins
  // extend does not work correctly for sub class components in Vue < 2.2
  var Constructor = typeof component === 'function' && vueVersion < 2.3
    ? component.extend(instanceOptions)
    : _Vue.extend(component).extend(instanceOptions);

  // Keep reference to component mount was called with
  Constructor._vueTestUtilsRoot = component;

  // used to identify extended component using constructor
  Constructor.options.$_vueTestUtils_original = component;
  if (options.slots) {
    compileTemplateForSlots(options.slots);
    // validate slots outside of the createSlots function so
    // that we can throw an error without it being caught by
    // the Vue error handler
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
    {logModifiedComponents: config.logModifiedComponents,
    stubs: getOption(normalizeStubs(options.stubs), config.stubs),
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

  var vm = createInstance(
    component,
    mergeOptions(options, config),
    testUtils.createLocalVue(options.localVue)
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
