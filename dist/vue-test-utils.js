'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Vue = _interopDefault(require('vue'));
var lodash = require('lodash');
var vueTemplateCompiler = require('vue-template-compiler');

// 

function throwError (msg) {
  throw new Error(("[vue-test-utils]: " + msg))
}

// 

var LIFECYCLE_HOOKS = [
  'beforeCreate',
  'created',
  'beforeMount',
  'mounted',
  'beforeUpdate',
  'updated',
  'beforeDestroy',
  'destroyed',
  'activated',
  'deactivated'
];

function stubLifeCycleEvents (component) {
  LIFECYCLE_HOOKS.forEach(function (hook) {
    component[hook] = function () {}; // eslint-disable-line no-param-reassign
  });
}

function isValidStub (stub) {
  return !!stub &&
      (typeof stub === 'string' ||
      (typeof stub === 'object' &&
      typeof stub.render === 'function'))
}

function isRequiredComponent (name) {
  return name === 'KeepAlive' || name === 'Transition' || name === 'TransitionGroup'
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
    class: component.class
  }
}
function createStubFromString (templateString, originalComponent) {
  return Object.assign({}, getCoreProperties(originalComponent),
    vueTemplateCompiler.compileToFunctions(templateString))
}

function createBlankStub (originalComponent) {
  return Object.assign({}, getCoreProperties(originalComponent),
    {render: function () {}})
}

function stubComponents (component, stubs) {
  Object.keys(stubs).forEach(function (stub) {
    if (!isValidStub(stubs[stub])) {
      throwError('options.stub values must be passed a string or component');
    }

    if (!component.components) {
      component.components = {};
    }

    if (component.components[stub]) {
        // Remove cached constructor
      delete component.components[stub]._Ctor;
      if (typeof stubs[stub] === 'string') {
        component.components[stub] = createStubFromString(stubs[stub], component.components[stub]);
        stubLifeCycleEvents(component.components[stub]);
      } else {
        component.components[stub] = Object.assign({}, stubs[stub],
          {name: component.components[stub].name});
      }
    } else {
      if (typeof stubs[stub] === 'string') {
        component.components[stub] = Object.assign({}, vueTemplateCompiler.compileToFunctions(stubs[stub]));
        stubLifeCycleEvents(component.components[stub]);
      } else {
        component.components[stub] = Object.assign({}, stubs[stub]);
      }
    }
    Vue.config.ignoredElements.push(stub);
  });
}

function stubAllComponents (component) {
  Object.keys(component.components).forEach(function (c) {
        // Remove cached constructor
    delete component.components[c]._Ctor;
    component.components[c] = createBlankStub(component.components[c]);

    Vue.config.ignoredElements.push(c);
    stubLifeCycleEvents(component.components[c]);
  });
}

function stubGlobalComponents (component, instance) {
  Object.keys(instance.options.components).forEach(function (c) {
    if (isRequiredComponent(c)) {
      return
    }

    if (!component.components) {
      component.components = {}; // eslint-disable-line no-param-reassign
    }

    component.components[c] = createBlankStub(instance.options.components[c]);
    delete instance.options.components[c]._Ctor; // eslint-disable-line no-param-reassign
    delete component.components[c]._Ctor; // eslint-disable-line no-param-reassign
    stubLifeCycleEvents(component.components[c]);
  });
}

// 
function isDomSelector (selector) {
  if (typeof selector !== 'string') {
    return false
  }

  try {
    if (typeof document === 'undefined') {
      throwError('mount must be run in a browser environment like PhantomJS, jsdom or chrome');
    }
  } catch (error) {
    throwError('mount must be run in a browser environment like PhantomJS, jsdom or chrome');
  }

  try {
    document.querySelector(selector);
    return true
  } catch (error) {
    return false
  }
}

function isVueComponent (component) {
  if (typeof component === 'function') {
    return false
  }

  if (component === null) {
    return false
  }

  if (typeof component !== 'object') {
    return false
  }

  return typeof component.render === 'function'
}

function isValidSelector (selector) {
  if (isDomSelector(selector)) {
    return true
  }

  return isVueComponent(selector)
}

// 

function findAllVueComponents (vm, components) {
  if ( components === void 0 ) components = [];

  components.push(vm);

  vm.$children.forEach(function (child) {
    findAllVueComponents(child, components);
  });

  return components
}

function vmCtorMatchesName (vm, name) {
  return (vm.$vnode && vm.$vnode.componentOptions && vm.$vnode.componentOptions.Ctor.options.name === name) ||
        (vm._vnode && vm._vnode.functionalOptions && vm._vnode.functionalOptions.name === name)
}

function findVueComponents (vm, componentName) {
  var components = findAllVueComponents(vm);
  return components.filter(function (component) {
    if (!component.$vnode) {
      return false
    }
    return vmCtorMatchesName(component, componentName)
  })
}

// 

function findAllVNodes (vnode, nodes) {
  if ( nodes === void 0 ) nodes = [];

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

function nodeMatchesSelector (node, selector) {
  return node.elm && node.elm.getAttribute && node.elm.matches(selector)
}

function removeDuplicateNodes (vNodes) {
  var uniqueNodes = [];
  vNodes.forEach(function (vNode) {
    var exists = uniqueNodes.some(function (node) { return vNode.elm === node.elm; });
    if (!exists) {
      uniqueNodes.push(vNode);
    }
  });
  return uniqueNodes
}

function findMatchingVNodes (vNode, selector) {
  var nodes = findAllVNodes(vNode);
  var filteredNodes = nodes.filter(function (node) { return nodeMatchesSelector(node, selector); });
  return removeDuplicateNodes(filteredNodes)
}

// 



var WrapperArray = function WrapperArray (wrappers) {
  this.wrappers = wrappers || [];
  this.length = this.wrappers.length;
};

WrapperArray.prototype.at = function at (index) {
  if (index > this.length - 1) {
    throwError(("no item exists at " + index));
  }
  return this.wrappers[index]
};

WrapperArray.prototype.contains = function contains (selector) {
  this.throwErrorIfWrappersIsEmpty('contains');

  return this.wrappers.every(function (wrapper) { return wrapper.contains(selector); })
};

WrapperArray.prototype.exists = function exists () {
  return this.wrappers.length > 0
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

  throwError('findAll must be called on a single wrapper, use at(i) to access a wrapper');
};

WrapperArray.prototype.find = function find () {
  this.throwErrorIfWrappersIsEmpty('find');

  throwError('find must be called on a single wrapper, use at(i) to access a wrapper');
};

WrapperArray.prototype.html = function html () {
  this.throwErrorIfWrappersIsEmpty('html');

  throwError('html must be called on a single wrapper, use at(i) to access a wrapper');
};

WrapperArray.prototype.is = function is (selector) {
  this.throwErrorIfWrappersIsEmpty('is');

  return this.wrappers.every(function (wrapper) { return wrapper.is(selector); })
};

WrapperArray.prototype.isEmpty = function isEmpty () {
  this.throwErrorIfWrappersIsEmpty('isEmpty');

  return this.wrappers.every(function (wrapper) { return wrapper.isEmpty(); })
};

WrapperArray.prototype.isVueInstance = function isVueInstance () {
  this.throwErrorIfWrappersIsEmpty('isVueInstance');

  return this.wrappers.every(function (wrapper) { return wrapper.isVueInstance(); })
};

WrapperArray.prototype.name = function name () {
  this.throwErrorIfWrappersIsEmpty('name');

  throwError('name must be called on a single wrapper, use at(i) to access a wrapper');
};

WrapperArray.prototype.text = function text () {
  this.throwErrorIfWrappersIsEmpty('text');

  throwError('text must be called on a single wrapper, use at(i) to access a wrapper');
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

  this.wrappers.forEach(function (wrapper) { return wrapper.update(); });
};

// 
var ErrorWrapper = function ErrorWrapper (selector) {
  this.selector = selector;
};

ErrorWrapper.prototype.at = function at () {
  throwError(("find did not return " + (this.selector) + ", cannot call at() on empty Wrapper"));
};

ErrorWrapper.prototype.contains = function contains () {
  throwError(("find did not return " + (this.selector) + ", cannot call contains() on empty Wrapper"));
};

ErrorWrapper.prototype.exists = function exists () {
  return false
};

ErrorWrapper.prototype.hasAttribute = function hasAttribute () {
  throwError(("find did not return " + (this.selector) + ", cannot call hasAttribute() on empty Wrapper"));
};

ErrorWrapper.prototype.hasClass = function hasClass () {
  throwError(("find did not return " + (this.selector) + ", cannot call hasClass() on empty Wrapper"));
};

ErrorWrapper.prototype.hasProp = function hasProp () {
  throwError(("find did not return " + (this.selector) + ", cannot call hasProp() on empty Wrapper"));
};

ErrorWrapper.prototype.hasStyle = function hasStyle () {
  throwError(("find did not return " + (this.selector) + ", cannot call hasStyle() on empty Wrapper"));
};

ErrorWrapper.prototype.findAll = function findAll () {
  throwError(("find did not return " + (this.selector) + ", cannot call findAll() on empty Wrapper"));
};

ErrorWrapper.prototype.find = function find () {
  throwError(("find did not return " + (this.selector) + ", cannot call find() on empty Wrapper"));
};

ErrorWrapper.prototype.html = function html () {
  throwError(("find did not return " + (this.selector) + ", cannot call html() on empty Wrapper"));
};

ErrorWrapper.prototype.is = function is () {
  throwError(("find did not return " + (this.selector) + ", cannot call is() on empty Wrapper"));
};

ErrorWrapper.prototype.isEmpty = function isEmpty () {
  throwError(("find did not return " + (this.selector) + ", cannot call isEmpty() on empty Wrapper"));
};

ErrorWrapper.prototype.isVueInstance = function isVueInstance () {
  throwError(("find did not return " + (this.selector) + ", cannot call isVueInstance() on empty Wrapper"));
};

ErrorWrapper.prototype.name = function name () {
  throwError(("find did not return " + (this.selector) + ", cannot call name() on empty Wrapper"));
};

ErrorWrapper.prototype.text = function text () {
  throwError(("find did not return " + (this.selector) + ", cannot call text() on empty Wrapper"));
};

ErrorWrapper.prototype.setData = function setData () {
  throwError(("find did not return " + (this.selector) + ", cannot call setData() on empty Wrapper"));
};

ErrorWrapper.prototype.setProps = function setProps () {
  throwError(("find did not return " + (this.selector) + ", cannot call setProps() on empty Wrapper"));
};

ErrorWrapper.prototype.trigger = function trigger () {
  throwError(("find did not return " + (this.selector) + ", cannot call trigger() on empty Wrapper"));
};

ErrorWrapper.prototype.update = function update () {
  throwError(("find did not return " + (this.selector) + ", cannot call update() on empty Wrapper"));
};

// 

var Wrapper = function Wrapper (vnode, update, options) {
  this.vnode = vnode;
  this.element = vnode.elm;
  this.update = update;
  this.options = options;
};

Wrapper.prototype.at = function at () {
  throwError('at() must be called on a WrapperArray');
};

/**
 * Checks if wrapper contains provided selector.
 */
Wrapper.prototype.contains = function contains (selector) {
  if (!isValidSelector(selector)) {
    throwError('wrapper.contains() must be passed a valid CSS selector or a Vue constructor');
  }

  if (typeof selector === 'object') {
    var vm = this.vm || this.vnode.context.$root;
    return findVueComponents(vm, selector.name).length > 0
  }

  if (typeof selector === 'string' && this.element instanceof HTMLElement) {
    return this.element.querySelectorAll(selector).length > 0
  }

  return false
};

/**
 * Utility to check wrapper exists. Returns true as Wrapper always exists
 */
Wrapper.prototype.exists = function exists () {
  return true
};

/**
 * Checks if wrapper has an attribute with matching value
 */
Wrapper.prototype.hasAttribute = function hasAttribute (attribute, value) {
  if (typeof attribute !== 'string') {
    throwError('wrapper.hasAttribute() must be passed attribute as a string');
  }

  if (typeof value !== 'string') {
    throwError('wrapper.hasAttribute() must be passed value as a string');
  }

  return this.element && this.element.getAttribute(attribute) === value
};

/**
 * Asserts wrapper has a class name
 */
Wrapper.prototype.hasClass = function hasClass (className) {
  if (typeof className !== 'string') {
    throwError('wrapper.hasClass() must be passed a string');
  }

  return this.element.className.split(' ').indexOf(className) !== -1
};

/**
 * Asserts wrapper has a prop name
 */
Wrapper.prototype.hasProp = function hasProp (prop, value) {
  if (!this.isVueComponent) {
    throwError('wrapper.hasProp() must be called on a Vue instance');
  }
  if (typeof prop !== 'string') {
    throwError('wrapper.hasProp() must be passed prop as a string');
  }

  return !!this.vm && !!this.vm.$props && this.vm.$props[prop] === value
};

/**
 * Checks if wrapper has a style with value
 */
Wrapper.prototype.hasStyle = function hasStyle (style, value) {
  if (typeof style !== 'string') {
    throwError('wrapper.hasStyle() must be passed style as a string');
  }

  if (typeof value !== 'string') {
    throwError('wrapper.hasClass() must be passed value as string');
  }

    /* istanbul ignore next */
  if (navigator.userAgent.includes && (navigator.userAgent.includes('node.js') || navigator.userAgent.includes('jsdom'))) {
    console.warn('wrapper.hasStyle is not fully supported when running jsdom - only inline styles are supported'); // eslint-disable-line no-console
  }
  var body = document.querySelector('body');
  var mockElement = document.createElement('div');

  if (!(body instanceof HTMLElement)) {
    return false
  }
  var mockNode = body.insertBefore(mockElement, null);
  // $FlowIgnore : Flow thinks style[style] returns a number
  mockElement.style[style] = value;

  if (!this.options.attachedToDocument) {
    var vm = this.vm || this.vnode.context.$root;
    body.insertBefore(vm.$root._vnode.elm, null);
  }

  var elStyle = window.getComputedStyle(this.element)[style];
  var mockNodeStyle = window.getComputedStyle(mockNode)[style];
  return elStyle === mockNodeStyle
};

/**
 * Finds first node in tree of the current wrapper that matches the provided selector.
 */
Wrapper.prototype.find = function find (selector) {
  if (!isValidSelector(selector)) {
    throwError('wrapper.find() must be passed a valid CSS selector or a Vue constructor');
  }

  if (typeof selector === 'object') {
    if (!selector.name) {
      throwError('.find() requires component to have a name property');
    }
    var vm = this.vm || this.vnode.context.$root;
    var components = findVueComponents(vm, selector.name);
    if (components.length === 0) {
      return new ErrorWrapper('Component')
    }
    return new VueWrapper(components[0], this.options)
  }

  var nodes = findMatchingVNodes(this.vnode, selector);

  if (nodes.length === 0) {
    return new ErrorWrapper(selector)
  }
  return new Wrapper(nodes[0], this.update, this.options)
};

/**
 * Finds node in tree of the current wrapper that matches the provided selector.
 */
Wrapper.prototype.findAll = function findAll (selector) {
    var this$1 = this;

  if (!isValidSelector(selector)) {
    throwError('wrapper.findAll() must be passed a valid CSS selector or a Vue constructor');
  }

  if (typeof selector === 'object') {
    if (!selector.name) {
      throwError('.findAll() requires component to have a name property');
    }
    var vm = this.vm || this.vnode.context.$root;
    var components = findVueComponents(vm, selector.name);
    return new WrapperArray(components.map(function (component) { return new VueWrapper(component, this$1.options); }))
  }

  function nodeMatchesSelector (node, selector) {
    return node.elm && node.elm.getAttribute && node.elm.matches(selector)
  }

  var nodes = findMatchingVNodes(this.vnode, selector);
  var matchingNodes = nodes.filter(function (node) { return nodeMatchesSelector(node, selector); });

  return new WrapperArray(matchingNodes.map(function (node) { return new Wrapper(node, this$1.update, this$1.options); }))
};

/**
 * Returns HTML of element as a string
 */
Wrapper.prototype.html = function html () {
  var tmp = document.createElement('div');
  tmp.appendChild(this.element);
  return tmp.innerHTML
};

/**
 * Checks if node matches selector
 */
Wrapper.prototype.is = function is (selector) {
  if (!isValidSelector(selector)) {
    throwError('wrapper.is() must be passed a valid CSS selector or a Vue constructor');
  }

  if (typeof selector === 'object') {
    if (!this.isVueComponent) {
      return false
    }
    // TODO: Throw error if component does not have name
    return vmCtorMatchesName(this.vm, selector.name)
  }
  return this.element.getAttribute && this.element.matches(selector)
};

/**
 * Checks if node is empty
 */
Wrapper.prototype.isEmpty = function isEmpty () {
  return this.vnode.children === undefined
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
  if (this.isVueComponent && this.vm) {
    return this.vm.$options.name
  }

  return this.vnode.tag
};

/**
 * Sets vm data
 */
Wrapper.prototype.setData = function setData (data) {
    var this$1 = this;

  if (!this.isVueComponent) {
    throwError('wrapper.setData() can only be called on a Vue instance');
  }

  Object.keys(data).forEach(function (key) {
    // $FlowIgnore : Problem with possibly null this.vm
    this$1.vm.$set(this$1.vm, [key], data[key]);
  });
  this.update();
};

/**
 * Sets vm props
 */
Wrapper.prototype.setProps = function setProps (data) {
    var this$1 = this;

  if (!this.isVueComponent || !this.vm) {
    throwError('wrapper.setProps() can only be called on a Vue instance');
  }

  Object.keys(data).forEach(function (key) {
    // $FlowIgnore : Problem with possibly null this.vm
    this$1.vm._props[key] = data[key];
    // $FlowIgnore : Problem with possibly null this.vm
    this$1.vm._watchers.forEach(function (watcher) {
      if (watcher.expression === key) { watcher.run(); }
    });
  });
  this.update();
  // $FlowIgnore : Problem with possibly null this.vm
  this.vnode = this.vm._vnode;
};

/**
 * Return text of wrapper element
 */
Wrapper.prototype.text = function text () {
  return this.element.textContent
};

/**
 * Dispatches a DOM event on wrapper
 */
Wrapper.prototype.trigger = function trigger (type, options) {
    if ( options === void 0 ) options = {};

  if (typeof type !== 'string') {
    throwError('wrapper.trigger() must be passed a string');
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
    right: 39
  };

  var event = type.split('.');

  var eventObject = new window.Event(event[0], {
    bubbles: true,
    cancelable: true
  });

  if (options && options.preventDefault) {
    eventObject.preventDefault();
  }

  if (options) {
    Object.keys(options).forEach(function (key) {
      eventObject[key] = options[key];
    });
  }

  if (event.length === 2) {
    eventObject.keyCode = modifiers[event[1]];
  }

  this.element.dispatchEvent(eventObject);
  this.update();
};

// 

function update () {
  this._update(this._render());
}

var VueWrapper = (function (Wrapper$$1) {
  function VueWrapper (vm, options) {
    Wrapper$$1.call(this, vm._vnode, update.bind(vm), options);

    // $FlowIgnore : issue with defineProperty - https://github.com/facebook/flow/issues/285
    Object.defineProperty(this, 'vnode', ({
      get: function () { return vm._vnode; },
      set: function () {}
    }));

    this.vm = vm;
    this.isVueComponent = true;
  }

  if ( Wrapper$$1 ) VueWrapper.__proto__ = Wrapper$$1;
  VueWrapper.prototype = Object.create( Wrapper$$1 && Wrapper$$1.prototype );
  VueWrapper.prototype.constructor = VueWrapper;

  return VueWrapper;
}(Wrapper));

// 

function isValidSlot (slot) {
  return Array.isArray(slot) || (slot !== null && typeof slot === 'object') || typeof slot === 'string'
}

function addSlotToVm (vm, slotName, slotValue) {
  if (Array.isArray(vm.$slots[slotName])) {
    if (typeof slotValue === 'string') {
      vm.$slots[slotName].push(vm.$createElement(vueTemplateCompiler.compileToFunctions(slotValue)));
    } else {
      vm.$slots[slotName].push(vm.$createElement(slotValue));
    }
  } else {
    if (typeof slotValue === 'string') {
      vm.$slots[slotName] = [vm.$createElement(vueTemplateCompiler.compileToFunctions(slotValue))];
    } else {
      vm.$slots[slotName] = [vm.$createElement(slotValue)]; // eslint-disable-line no-param-reassign
    }
  }
}

function addSlots (vm, slots) {
  Object.keys(slots).forEach(function (key) {
    if (!isValidSlot(slots[key])) {
      throwError('slots[key] must be a Component, string or an array of Components');
    }

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

function addGlobals (globals) {
  return {
    install: function (Vue$$1) {
      Object.keys(globals).forEach(function (key) {
        Vue$$1.prototype[key] = globals[key];
      });
    }
  }
}

function addProvide (component, options) {
  var provide = typeof options.provide === 'function'
    ? options.provide
    : Object.assign({}, options.provide);

  delete options.provide;

  options.beforeCreate = function vueTestUtilBeforeCreate () {
    this._provided = typeof provide === 'function'
      ? provide.call(this)
      : provide;
  };
}

// 

function createConstructor (component, options) {
  var vue = options.localVue || Vue;

  if (options.context) {
    if (!component.functional) {
      throwError('mount.context can only be used when mounting a functional component');
    }

    if (typeof options.context !== 'object') {
      throwError('mount.context must be an object');
    }
    var clonedComponent = lodash.cloneDeep(component);
    component = {
      render: function render (h) {
        return h(clonedComponent, options.context)
      }
    };
  }

  if (options.provide) {
    addProvide(component, options);
  }

  if (options.stub) {
    stubComponents(component, options.stub);
  }

  var Constructor = vue.extend(component);

  if (options.intercept) {
    var globals = addGlobals(options.intercept);
    Constructor.use(globals);
  }

  var vm = new Constructor(options);

  if (options.slots) {
    addSlots(vm, options.slots);
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

// 

Vue.config.productionTip = false;

function mount (component, options) {
  if ( options === void 0 ) options = {};

  if (!window) {
    throwError('window is undefined, vue-test-utils needs to be run in a browser environment.\n You can run the tests in node using JSDOM');
  }

  // Remove cached constructor
  delete component._Ctor;

  var vm = createConstructor(component, options);

  if (options.attachToDocument) {
    vm.$mount(createElement());
  } else {
    vm.$mount();
  }

  return new VueWrapper(vm, { attachedToDocument: !!options.attachToDocument })
}

// 

function shallow (component, options) {
  if ( options === void 0 ) options = {};

  var vue = options.localVue || Vue;
  var clonedComponent = lodash.cloneDeep(component);

  if (clonedComponent.components) {
    stubAllComponents(clonedComponent);
  }

  stubGlobalComponents(clonedComponent, vue);

  return mount(clonedComponent, options)
}

// 

function createLocalVue () {
  var instance = Vue.extend();
  instance.version = Vue.version;
  instance.config = lodash.cloneDeep(Vue.config);
  instance.util = lodash.cloneDeep(Vue.util);
  return instance
}

var index = {
  createLocalVue: createLocalVue,
  mount: mount,
  shallow: shallow
};

module.exports = index;
