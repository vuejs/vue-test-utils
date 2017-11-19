'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Vue = _interopDefault(require('vue'));
var cloneDeep = _interopDefault(require('lodash/cloneDeep'));
var vueTemplateCompiler = require('vue-template-compiler');

// 

function throwError (msg) {
  throw new Error(("[vue-test-utils]: " + msg))
}

function warn (msg) {
  console.error(("[vue-test-utils]: " + msg));
}

if (typeof window === 'undefined') {
  throwError(
    'window is undefined, vue-test-utils needs to be run in a browser environment.\n' +
    'You can run the tests in node using jsdom + jsdom-global.\n' +
    'See https://vue-test-utils.vuejs.org/en/guides/common-tips.html for more details.'
  );
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
      (stub === true) ||
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
    class: component.class,
    staticClass: component.staticClass,
    staticStyle: component.staticStyle,
    style: component.style,
    normalizedStyle: component.normalizedStyle,
    nativeOn: component.nativeOn
  }
}
function createStubFromString (templateString, originalComponent) {
  if (!vueTemplateCompiler.compileToFunctions) {
    throwError('vueTemplateCompiler is undefined, you must pass components explicitly if vue-template-compiler is undefined');
  }
  return Object.assign({}, getCoreProperties(originalComponent),
    vueTemplateCompiler.compileToFunctions(templateString))
}

function createBlankStub (originalComponent) {
  return Object.assign({}, getCoreProperties(originalComponent),
    {render: function () {}})
}

function stubComponents (component, stubs) {
  if (!component.components) {
    component.components = {};
  }

  if (Array.isArray(stubs)) {
    stubs.forEach(function (stub) {
      if (stub === false) {
        return
      }

      if (typeof stub !== 'string') {
        throwError('each item in an options.stubs array must be a string');
      }
      component.components[stub] = createBlankStub({});
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
        component.components[stub] = createBlankStub({});
        return
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
          if (!vueTemplateCompiler.compileToFunctions) {
            throwError('vueTemplateCompiler is undefined, you must pass components explicitly if vue-template-compiler is undefined');
          }
          component.components[stub] = Object.assign({}, vueTemplateCompiler.compileToFunctions(stubs[stub]));
          stubLifeCycleEvents(component.components[stub]);
        } else {
          component.components[stub] = Object.assign({}, stubs[stub]);
        }
      }
      // ignoreElements does not exist in Vue 2.0.x
      if (Vue.config.ignoredElements) {
        Vue.config.ignoredElements.push(stub);
      }
    });
  }
}

function stubAllComponents (component) {
  Object.keys(component.components).forEach(function (c) {
    // Remove cached constructor
    delete component.components[c]._Ctor;
    component.components[c] = createBlankStub(component.components[c]);

    // ignoreElements does not exist in Vue 2.0.x
    if (Vue.config.ignoredElements) {
      Vue.config.ignoredElements.push(c);
    }
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



function isRefSelector (refOptionsObject) {
  if (typeof refOptionsObject !== 'object') {
    return false
  }

  if (refOptionsObject === null) {
    return false
  }

  var validFindKeys = ['ref'];
  var entries = Object.entries(refOptionsObject);

  if (!entries.length) {
    return false
  }

  var isValid = entries.every(function (ref) {
    var key = ref[0];
    var value = ref[1];

    return validFindKeys.includes(key) && typeof value === 'string'
  });

  return isValid
}

//

var selectorTypes = {
  DOM_SELECTOR: 'DOM_SELECTOR',
  VUE_COMPONENT: 'VUE_COMPONENT',
  OPTIONS_OBJECT: 'OPTIONS_OBJECT'
};

function getSelectorType (selector) {
  if (isDomSelector(selector)) {
    return selectorTypes.DOM_SELECTOR
  }

  if (isVueComponent(selector)) {
    return selectorTypes.VUE_COMPONENT
  }

  if (isRefSelector(selector)) {
    return selectorTypes.OPTIONS_OBJECT
  }
}

function getSelectorTypeOrThrow (selector, methodName) {
  var selectorType = getSelectorType(selector);
  if (!selectorType) {
    throwError(("wrapper." + methodName + "() must be passed a valid CSS selector, Vue constructor, or valid find option object"));
  }
  return selectorType
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
        (vm._vnode && vm._vnode.functionalOptions && vm._vnode.functionalOptions.name === name) ||
        vm.$options && vm.$options.name === name
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

//

function nodeMatchesSelector (node, selector) {
  return node.elm && node.elm.getAttribute && node.elm.matches(selector)
}

function findVNodesBySelector (vNode, selector) {
  var nodes = findAllVNodes(vNode);
  var filteredNodes = nodes.filter(function (node) { return nodeMatchesSelector(node, selector); });
  return removeDuplicateNodes(filteredNodes)
}

// 

function nodeMatchesRef (node, refName) {
  return node.data && node.data.ref === refName
}

function findVNodesByRef (vNode, refName) {
  var nodes = findAllVNodes(vNode);
  var refFilteredNodes = nodes.filter(function (node) { return nodeMatchesRef(node, refName); });
  // Only return refs defined on top-level VNode to provide the same behavior as selecting via vm.$ref.{someRefName}
  var mainVNodeFilteredNodes = refFilteredNodes.filter(function (node) { return !!vNode.context.$refs[node.data.ref]; });
  return removeDuplicateNodes(mainVNodeFilteredNodes)
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

WrapperArray.prototype.emitted = function emitted () {
  this.throwErrorIfWrappersIsEmpty('emitted');

  throwError('emitted must be called on a single wrapper, use at(i) to access a wrapper');
};

WrapperArray.prototype.emittedByOrder = function emittedByOrder () {
  this.throwErrorIfWrappersIsEmpty('emittedByOrder');

  throwError('emittedByOrder must be called on a single wrapper, use at(i) to access a wrapper');
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

  this.wrappers.forEach(function (wrapper) { return wrapper.update(); });
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
  throwError(("find did not return " + (this.selector) + ", cannot call at() on empty Wrapper"));
};

ErrorWrapper.prototype.contains = function contains () {
  throwError(("find did not return " + (this.selector) + ", cannot call contains() on empty Wrapper"));
};

ErrorWrapper.prototype.emitted = function emitted () {
  throwError(("find did not return " + (this.selector) + ", cannot call emitted() on empty Wrapper"));
};

ErrorWrapper.prototype.emittedByOrder = function emittedByOrder () {
  throwError(("find did not return " + (this.selector) + ", cannot call emittedByOrder() on empty Wrapper"));
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

ErrorWrapper.prototype.setComputed = function setComputed () {
  throwError(("find did not return " + (this.selector) + ", cannot call setComputed() on empty Wrapper"));
};

ErrorWrapper.prototype.setData = function setData () {
  throwError(("find did not return " + (this.selector) + ", cannot call setData() on empty Wrapper"));
};

ErrorWrapper.prototype.setMethods = function setMethods () {
  throwError(("find did not return " + (this.selector) + ", cannot call setMethods() on empty Wrapper"));
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

ErrorWrapper.prototype.destroy = function destroy () {
  throwError(("find did not return " + (this.selector) + ", cannot call destroy() on empty Wrapper"));
};

// 

var Wrapper = function Wrapper (vnode, update, options) {
  this.vnode = vnode;
  this.element = vnode.elm;
  this.update = update;
  this.options = options;
  this.version = Number(((Vue.version.split('.')[0]) + "." + (Vue.version.split('.')[1])));
};

Wrapper.prototype.at = function at () {
  throwError('at() must be called on a WrapperArray');
};

/**
 * Checks if wrapper contains provided selector.
 */
Wrapper.prototype.contains = function contains (selector) {
  var selectorType = getSelectorTypeOrThrow(selector, 'contains');

  if (selectorType === selectorTypes.VUE_COMPONENT) {
    var vm = this.vm || this.vnode.context.$root;
    return findVueComponents(vm, selector.name).length > 0
  }

  if (selectorType === selectorTypes.OPTIONS_OBJECT) {
    if (!this.isVueComponent) {
      throwError('$ref selectors can only be used on Vue component wrappers');
    }
    var nodes = findVNodesByRef(this.vnode, selector.ref);
    return nodes.length > 0
  }

  if (selectorType === selectorTypes.DOM_SELECTOR && this.element instanceof HTMLElement) {
    return this.element.querySelectorAll(selector).length > 0
  }

  return false
};

/**
 * Returns an object containing custom events emitted by the Wrapper vm
 */
Wrapper.prototype.emitted = function emitted () {
  if (!this._emitted && !this.vm) {
    throwError('wrapper.emitted() can only be called on a Vue instance');
  }
  return this._emitted
};

/**
 * Returns an Array containing custom events emitted by the Wrapper vm
 */
Wrapper.prototype.emittedByOrder = function emittedByOrder () {
  if (!this._emittedByOrder && !this.vm) {
    throwError('wrapper.emittedByOrder() can only be called on a Vue instance');
  }
  return this._emittedByOrder
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

  return !!(this.element && this.element.getAttribute(attribute) === value)
};

/**
 * Asserts wrapper has a class name
 */
Wrapper.prototype.hasClass = function hasClass (className) {
    var this$1 = this;

  var targetClass = className;

  if (typeof targetClass !== 'string') {
    throwError('wrapper.hasClass() must be passed a string');
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
  if (!this.isVueComponent) {
    throwError('wrapper.hasProp() must be called on a Vue instance');
  }
  if (typeof prop !== 'string') {
    throwError('wrapper.hasProp() must be passed prop as a string');
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
  return !!(elStyle && mockNodeStyle && elStyle === mockNodeStyle)
};

/**
 * Finds first node in tree of the current wrapper that matches the provided selector.
 */
Wrapper.prototype.find = function find (selector) {
  var selectorType = getSelectorTypeOrThrow(selector, 'find');

  if (selectorType === selectorTypes.VUE_COMPONENT) {
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

  if (selectorType === selectorTypes.OPTIONS_OBJECT) {
    if (!this.isVueComponent) {
      throwError('$ref selectors can only be used on Vue component wrappers');
    }
    var nodes$1 = findVNodesByRef(this.vnode, selector.ref);
    if (nodes$1.length === 0) {
      return new ErrorWrapper(("ref=\"" + (selector.ref) + "\""))
    }
    return new Wrapper(nodes$1[0], this.update, this.options)
  }

  var nodes = findVNodesBySelector(this.vnode, selector);

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

  var selectorType = getSelectorTypeOrThrow(selector, 'findAll');

  if (selectorType === selectorTypes.VUE_COMPONENT) {
    if (!selector.name) {
      throwError('.findAll() requires component to have a name property');
    }
    var vm = this.vm || this.vnode.context.$root;
    var components = findVueComponents(vm, selector.name);
    return new WrapperArray(components.map(function (component) { return new VueWrapper(component, this$1.options); }))
  }

  if (selectorType === selectorTypes.OPTIONS_OBJECT) {
    if (!this.isVueComponent) {
      throwError('$ref selectors can only be used on Vue component wrappers');
    }
    var nodes$1 = findVNodesByRef(this.vnode, selector.ref);
    return new WrapperArray(nodes$1.map(function (node) { return new Wrapper(node, this$1.update, this$1.options); }))
  }

  function nodeMatchesSelector (node, selector) {
    return node.elm && node.elm.getAttribute && node.elm.matches(selector)
  }

  var nodes = findVNodesBySelector(this.vnode, selector);
  var matchingNodes = nodes.filter(function (node) { return nodeMatchesSelector(node, selector); });

  return new WrapperArray(matchingNodes.map(function (node) { return new Wrapper(node, this$1.update, this$1.options); }))
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

  if (selectorType === selectorTypes.VUE_COMPONENT && this.isVueComponent) {
    if (typeof selector.name !== 'string') {
      throwError('a Component used as a selector must have a name property');
    }
    return vmCtorMatchesName(this.vm, selector.name)
  }

  if (selectorType === selectorTypes.OPTIONS_OBJECT) {
    throwError('$ref selectors can not be used with wrapper.is()');
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
  return this.vnode.children === undefined || this.vnode.children.length === 0
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

  Object.keys(data).forEach(function (key) {
    // $FlowIgnore : Problem with possibly null this.vm
    this$1.vm._watchers.forEach(function (watcher) {
      if (watcher.expression === key) { watcher.run(); }
    });
  });

  this.update();
};

/**
 * Sets vm computed
 */
Wrapper.prototype.setComputed = function setComputed (computed) {
    var this$1 = this;

  if (!this.isVueComponent) {
    throwError('wrapper.setComputed() can only be called on a Vue instance');
  }

  Object.keys(computed).forEach(function (key) {
    if (this$1.version > 2.1) {
      // $FlowIgnore : Problem with possibly null this.vm
      if (!this$1.vm._computedWatchers[key]) {
        throwError(("wrapper.setComputed() was passed a value that does not exist as a computed property on the Vue instance. Property " + key + " does not exist on the Vue instance"));
      }
      // $FlowIgnore : Problem with possibly null this.vm
      this$1.vm._computedWatchers[key].value = computed[key];
    } else {
      // $FlowIgnore : Problem with possibly null this.vm
      if (!this$1.vm._watchers.some(function (w) { return w.getter.name === key; })) {
        throwError(("wrapper.setComputed() was passed a value that does not exist as a computed property on the Vue instance. Property " + key + " does not exist on the Vue instance"));
      }
      // $FlowIgnore : Problem with possibly null this.vm
      this$1.vm._watchers.forEach(function (watcher) {
        if (watcher.getter.name === key) {
          watcher.value = computed[key];
        }
      });
    }
  });
  this.update();
};

/**
 * Sets vm methods
 */
Wrapper.prototype.setMethods = function setMethods (methods) {
    var this$1 = this;

  if (!this.isVueComponent) {
    throwError('wrapper.setMethods() can only be called on a Vue instance');
  }
  Object.keys(methods).forEach(function (key) {
    // $FlowIgnore : Problem with possibly null this.vm
    this$1.vm[key] = methods[key];
    // $FlowIgnore : Problem with possibly null this.vm
    this$1.vm.$options.methods[key] = methods[key];
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
    if (this$1.vm._props) {
      this$1.vm._props[key] = data[key];
    } else {
      // $FlowIgnore : Problem with possibly null this.vm
      this$1.vm[key] = data[key];
    }
  });

  Object.keys(data).forEach(function (key) {
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
  if (!this.element) {
    throwError('cannot call wrapper.text() on a wrapper without an element');
  }

  return this.element.textContent.trim()
};

/**
 * Calls destroy on vm
 */
Wrapper.prototype.destroy = function destroy () {
  if (!this.isVueComponent) {
    throwError('wrapper.destroy() can only be called on a Vue instance');
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
    if ( options === void 0 ) options = {};

  if (typeof type !== 'string') {
    throwError('wrapper.trigger() must be passed a string');
  }

  if (!this.element) {
    throwError('cannot call wrapper.trigger() on a wrapper without an element');
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

// 

function update () {
  this._update(this._render());
  this.$children.forEach(function (child) { return update.call(child); });
}

var VueWrapper = (function (Wrapper$$1) {
  function VueWrapper (vm, options) {
    Wrapper$$1.call(this, vm._vnode, update.bind(vm), options);

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
    this.isVueComponent = true;
    this._emitted = Object.create(null);
    this._emittedByOrder = [];

    logEvents(vm, this._emitted, this._emittedByOrder);
  }

  if ( Wrapper$$1 ) VueWrapper.__proto__ = Wrapper$$1;
  VueWrapper.prototype = Object.create( Wrapper$$1 && Wrapper$$1.prototype );
  VueWrapper.prototype.constructor = VueWrapper;

  return VueWrapper;
}(Wrapper));

// 

function isValidSlot$1 (slot) {
  return Array.isArray(slot) || (slot !== null && typeof slot === 'object') || typeof slot === 'string'
}

function addSlotToVm (vm, slotName, slotValue) {
  if (Array.isArray(vm.$slots[slotName])) {
    if (typeof slotValue === 'string') {
      if (!vueTemplateCompiler.compileToFunctions) {
        throwError('vueTemplateCompiler is undefined, you must pass components explicitly if vue-template-compiler is undefined');
      }
      vm.$slots[slotName].push(vm.$createElement(vueTemplateCompiler.compileToFunctions(slotValue)));
    } else {
      vm.$slots[slotName].push(vm.$createElement(slotValue));
    }
  } else {
    if (typeof slotValue === 'string') {
      if (!vueTemplateCompiler.compileToFunctions) {
        throwError('vueTemplateCompiler is undefined, you must pass components explicitly if vue-template-compiler is undefined');
      }
      vm.$slots[slotName] = [vm.$createElement(vueTemplateCompiler.compileToFunctions(slotValue))];
    } else {
      vm.$slots[slotName] = [vm.$createElement(slotValue)]; // eslint-disable-line no-param-reassign
    }
  }
}

function addSlots (vm, slots) {
  Object.keys(slots).forEach(function (key) {
    if (!isValidSlot$1(slots[key])) {
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
function addMocks (mockedProperties, Vue$$1) {
  Object.keys(mockedProperties).forEach(function (key) {
    Vue$$1.prototype[key] = mockedProperties[key];
    Vue.util.defineReactive(Vue$$1, key, mockedProperties[key]);
  });
}

function addAttrs (vm, attrs) {
  var originalVueConfig = Vue.config;
  Vue.config.silent = true;
  if (attrs) {
    vm.$attrs = attrs;
  } else {
    vm.$attrs = {};
  }
  Vue.config.silent = originalVueConfig.silent;
}

function addListeners (vm, listeners) {
  var originalVueConfig = Vue.config;
  Vue.config.silent = true;
  if (listeners) {
    vm.$listeners = listeners;
  } else {
    vm.$listeners = {};
  }
  Vue.config.silent = originalVueConfig.silent;
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

function compileTemplate (component) {
  Object.assign(component, vueTemplateCompiler.compileToFunctions(component.template));
}

function errorHandler (errorOrString, vm) {
  var error = (typeof errorOrString === 'object')
    ? errorOrString
    : new Error(errorOrString);

  vm._error = error;

  throw error
}

// 

function createLocalVue () {
  var instance = Vue.extend();

  // clone global APIs
  Object.keys(Vue).forEach(function (key) {
    if (!instance.hasOwnProperty(key)) {
      var original = Vue[key];
      instance[key] = typeof original === 'object'
        ? cloneDeep(original)
        : original;
    }
  });

  // config is not enumerable
  instance.config = cloneDeep(Vue.config);

  instance.config.errorHandler = errorHandler;

  // option merge strategies need to be exposed by reference
  // so that merge strats registered by plguins can work properly
  instance.config.optionMergeStrategies = Vue.config.optionMergeStrategies;

  // make sure all extends are based on this instance.
  // this is important so that global components registered by plugins,
  // e.g. router-link are created using the correct base constructor
  instance.options._base = instance;

  // compat for vue-router < 2.7.1 where it does not allow multiple installs
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

// 

function getRealChild (vnode) {
  var compOptions = vnode && vnode.componentOptions;
  if (compOptions && compOptions.Ctor.options.abstract) {
    return getRealChild(getFirstComponentChild(compOptions.children))
  } else {
    return vnode
  }
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

function isAsyncPlaceholder (node) {
  return node.isComment && node.asyncFactory
}
var camelizeRE = /-(\w)/g;
var camelize = function (str) {
  return str.replace(camelizeRE, function (_, c) { return c ? c.toUpperCase() : ''; })
};

function extractTransitionData (comp) {
  var data = {};
  var options = comp.$options;
  // props
  for (var key in options.propsData) {
    data[key] = comp[key];
  }
  // events.
  // extract listeners and pass them directly to the transition methods
  var listeners = options._parentListeners;
  for (var key$1 in listeners) {
    data[camelize(key$1)] = listeners[key$1];
  }
  return data
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
      warn(
         '<transition> can only be used on a single element. Use ' +
         '<transition-group> for lists.'
       );
    }

    var mode = this.mode;

     // warn invalid mode
    if (mode && mode !== 'in-out' && mode !== 'out-in'
     ) {
      warn(
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

    (child.data || (child.data = {})).transition = extractTransitionData(this);

     // mark v-show
     // so that the transition module can hand over the control to the directive
    if (child.data.directives && child.data.directives.some(function (d) { return d.name === 'show'; })) {
      child.data.show = true;
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
  }
};

//
function getStubs (optionStubs) {
  if (optionStubs || Object.keys(config.stubs).length > 0) {
    if (Array.isArray(optionStubs)) {
      return optionStubs.concat( Object.keys(config.stubs))
    } else {
      return Object.assign({}, config.stubs,
        optionStubs)
    }
  }
}

function extractOptions (
  options
) {
  return {
    mocks: options.mocks,
    context: options.context,
    provide: options.provide,
    stubs: getStubs(options.stubs),
    attrs: options.attrs,
    listeners: options.listeners,
    slots: options.slots,
    localVue: options.localVue
  }
}

function deleteMountingOptions (options) {
  delete options.custom;
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

function isValidSlot (slot) {
  return Array.isArray(slot) || (slot !== null && typeof slot === 'object') || typeof slot === 'string'
}

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
        if (!isValidSlot(slot)) {
          throwError('slots[key] must be a Component, string or an array of Components');
        }
        var component = typeof slot === 'string' ? vueTemplateCompiler.compileToFunctions(slot) : slot;
        var newSlot = h(component);
        newSlot.data.slot = slotType;
        children.push(newSlot);
      });
    } else {
      if (!isValidSlot(slots[slotType])) {
        throwError('slots[key] must be a Component, string or an array of Components');
      }
      var component = typeof slots[slotType] === 'string' ? vueTemplateCompiler.compileToFunctions(slots[slotType]) : slots[slotType];
      var slot = h(component);
      slot.data.slot = slotType;
      children.push(slot);
    }
  });
  return children
}

function createConstructor (
  component,
  options
) {
  var mountingOptions = extractOptions(options);

  var vue = mountingOptions.localVue || createLocalVue();

  if (mountingOptions.mocks) {
    addMocks(mountingOptions.mocks, vue);
  }

  if (component.functional) {
    if (mountingOptions.context && typeof mountingOptions.context !== 'object') {
      throwError('mount.context must be an object');
    }

    var clonedComponent = cloneDeep(component);
    component = {
      render: function render (h) {
        return h(
          clonedComponent,
          mountingOptions.context || component.FunctionalRenderContext,
          (mountingOptions.context && mountingOptions.context.children) || createFunctionalSlots(mountingOptions.slots, h)
        )
      }
    };
  } else if (mountingOptions.context) {
    throwError(
      'mount.context can only be used when mounting a functional component'
    );
  }

  if (mountingOptions.provide) {
    addProvide(component, mountingOptions.provide, options);
  }

  if (mountingOptions.stubs) {
    stubComponents(component, mountingOptions.stubs);
  }

  if (!component.render && component.template && !component.functional) {
    compileTemplate(component);
  }

  var Constructor = vue.extend(component);

  var instanceOptions = Object.assign({}, options);
  deleteMountingOptions(instanceOptions);

  var vm = new Constructor(instanceOptions);

  addAttrs(vm, mountingOptions.attrs);
  addListeners(vm, mountingOptions.listeners);

  if (mountingOptions.slots) {
    addSlots(vm, mountingOptions.slots);
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
Vue.config.errorHandler = errorHandler;

function mount (component, options) {
  if ( options === void 0 ) options = {};

  var componentToMount = options.clone === false ? component : cloneDeep(component.extend ? component.options : component);
  // Remove cached constructor
  delete componentToMount._Ctor;

  var vm = createConstructor(componentToMount, options);

  if (options.attachToDocument) {
    vm.$mount(createElement());
  } else {
    vm.$mount();
  }

  if (vm._error) {
    throw (vm._error)
  }

  return new VueWrapper(vm, { attachedToDocument: !!options.attachToDocument })
}

//

function shallow (component, options) {
  if ( options === void 0 ) options = {};

  var vue = options.localVue || Vue;
  var clonedComponent = cloneDeep(component.extend ? component.options : component);

  if (clonedComponent.components) {
    stubAllComponents(clonedComponent);
  }

  stubGlobalComponents(clonedComponent, vue);

  return mount(clonedComponent, options)
}

var index = {
  createLocalVue: createLocalVue,
  config: config,
  mount: mount,
  shallow: shallow,
  TransitionStub: TransitionStub,
  TransitionGroupStub: TransitionGroupStub
};

module.exports = index;
