'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Vue = _interopDefault(require('vue'));
var vueTemplateCompiler = require('vue-template-compiler');

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

if (typeof window === 'undefined') {
  throwError(
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

function componentNeedsCompiling (component) {
  return component &&
    !component.render &&
    (component.template || component.extends) &&
    !component.functional
}

function isRefSelector (refOptionsObject) {
  if (typeof refOptionsObject !== 'object' || Object.keys(refOptionsObject || {}).length !== 1) {
    return false
  }

  return typeof refOptionsObject.ref === 'string'
}

function isNameSelector (nameOptionsObject) {
  if (typeof nameOptionsObject !== 'object' || nameOptionsObject === null) {
    return false
  }

  return !!nameOptionsObject.name
}

var NAME_SELECTOR = 'NAME_SELECTOR';
var COMPONENT_SELECTOR = 'COMPONENT_SELECTOR';
var REF_SELECTOR = 'REF_SELECTOR';
var DOM_SELECTOR = 'DOM_SELECTOR';
var VUE_VERSION = Number(((Vue.version.split('.')[0]) + "." + (Vue.version.split('.')[1])));
var FUNCTIONAL_OPTIONS = VUE_VERSION >= 2.5 ? 'fnOptions' : 'functionalOptions';

// 

function getSelectorTypeOrThrow (selector, methodName) {
  if (isDomSelector(selector)) { return DOM_SELECTOR }
  if (isNameSelector(selector)) { return NAME_SELECTOR }
  if (isVueComponent(selector)) { return COMPONENT_SELECTOR }
  if (isRefSelector(selector)) { return REF_SELECTOR }

  throwError(("wrapper." + methodName + "() must be passed a valid CSS selector, Vue constructor, or valid find option object"));
}

// 

function findAllVueComponentsFromVm (
  vm,
  components
) {
  if ( components === void 0 ) components = [];

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
  if ( components === void 0 ) components = [];

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
  if ( components === void 0 ) components = [];

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
    throwError('find for functional components is not support in Vue < 2.3');
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
    throwError(("no item exists at " + index));
  }
  return this.wrappers[index]
};

WrapperArray.prototype.attributes = function attributes () {
  this.throwErrorIfWrappersIsEmpty('attributes');

  throwError('attributes must be called on a single wrapper, use at(i) to access a wrapper');
};

WrapperArray.prototype.classes = function classes () {
  this.throwErrorIfWrappersIsEmpty('classes');

  throwError('classes must be called on a single wrapper, use at(i) to access a wrapper');
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

  throwError('name must be called on a single wrapper, use at(i) to access a wrapper');
};

WrapperArray.prototype.props = function props () {
  this.throwErrorIfWrappersIsEmpty('props');

  throwError('props must be called on a single wrapper, use at(i) to access a wrapper');
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
  warn('update has been removed. All changes are now synchrnous without calling update');
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

ErrorWrapper.prototype.attributes = function attributes () {
  throwError(("find did not return " + (this.selector) + ", cannot call attributes() on empty Wrapper"));
};

ErrorWrapper.prototype.classes = function classes () {
  throwError(("find did not return " + (this.selector) + ", cannot call classes() on empty Wrapper"));
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

ErrorWrapper.prototype.filter = function filter () {
  throwError(("find did not return " + (this.selector) + ", cannot call filter() on empty Wrapper"));
};

ErrorWrapper.prototype.visible = function visible () {
  throwError(("find did not return " + (this.selector) + ", cannot call visible() on empty Wrapper"));
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

ErrorWrapper.prototype.isVisible = function isVisible () {
  throwError(("find did not return " + (this.selector) + ", cannot call isVisible() on empty Wrapper"));
};

ErrorWrapper.prototype.isVueInstance = function isVueInstance () {
  throwError(("find did not return " + (this.selector) + ", cannot call isVueInstance() on empty Wrapper"));
};

ErrorWrapper.prototype.name = function name () {
  throwError(("find did not return " + (this.selector) + ", cannot call name() on empty Wrapper"));
};

ErrorWrapper.prototype.props = function props () {
  throwError(("find did not return " + (this.selector) + ", cannot call props() on empty Wrapper"));
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
  throwError("update has been removed from vue-test-utils. All updates are now synchronous by default");
};

ErrorWrapper.prototype.destroy = function destroy () {
  throwError(("find did not return " + (this.selector) + ", cannot call destroy() on empty Wrapper"));
};

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
      throwError('$ref selectors can only be used on Vue component wrappers');
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
    throwError('cannot find a Vue instance on a DOM node. The node you are calling find on does not exist in the VDom. Are you adding the node as innerHTML?');
  }

  if (selectorType === COMPONENT_SELECTOR || selectorType === NAME_SELECTOR) {
    var root = vm || vnode;
    if (!root) {
      return []
    }
    return findVueComponents(root, selectorType, selector)
  }

  if (vm && vm.$refs && selector.ref in vm.$refs && vm.$refs[selector.ref] instanceof Vue) {
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
  return node instanceof Vue
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
  this.version = Number(((Vue.version.split('.')[0]) + "." + (Vue.version.split('.')[1])));
};

Wrapper.prototype.at = function at () {
  throwError('at() must be called on a WrapperArray');
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
    throwError('wrapper.emitted() can only be called on a Vue instance');
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
    throwError('wrapper.emittedByOrder() can only be called on a Vue instance');
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
 * Utility to check wrapper is visible. Returns false if a parent element has display: none or visibility: hidden style.
 */
Wrapper.prototype.visible = function visible () {
  warn('visible has been deprecated and will be removed in version 1, use isVisible instead');

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
  warn('hasAttribute() has been deprecated and will be removed in version 1.0.0. Use attributes() instead—https://vue-test-utils.vuejs.org/en/api/wrapper/attributes');

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

  warn('hasClass() has been deprecated and will be removed in version 1.0.0. Use classes() instead—https://vue-test-utils.vuejs.org/en/api/wrapper/classes');
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
  warn('hasProp() has been deprecated and will be removed in version 1.0.0. Use props() instead—https://vue-test-utils.vuejs.org/en/api/wrapper/props');

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
  warn('hasStyle() has been deprecated and will be removed in version 1.0.0. Use wrapper.element.style instead');

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
    throwError('wrapper.props() cannot be called on a mounted functional component.');
  }
  if (!this.vm) {
    throwError('wrapper.props() must be called on a Vue instance');
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
    throwError('wrapper.setData() canot be called on a functional component');
  }

  if (!this.vm) {
    throwError('wrapper.setData() can only be called on a Vue instance');
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
    throwError('wrapper.setComputed() can only be called on a Vue instance');
  }

  warn('setComputed() has been deprecated and will be removed in version 1.0.0. You can overwrite computed properties by passing a computed object in the mounting options');

  Object.keys(computed).forEach(function (key) {
    if (this$1.version > 2.1) {
      // $FlowIgnore : Problem with possibly null this.vm
      if (!this$1.vm._computedWatchers[key]) {
        throwError(("wrapper.setComputed() was passed a value that does not exist as a computed property on the Vue instance. Property " + key + " does not exist on the Vue instance"));
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
        throwError(("wrapper.setComputed() was passed a value that does not exist as a computed property on the Vue instance. Property " + key + " does not exist on the Vue instance"));
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
    throwError('wrapper.setMethods() can only be called on a Vue instance');
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
    throwError('wrapper.setProps() canot be called on a functional component');
  }
  if (!this.isVueComponent || !this.vm) {
    throwError('wrapper.setProps() can only be called on a Vue instance');
  }
  if (this.vm && this.vm.$options && !this.vm.$options.propsData) {
    this.vm.$options.propsData = {};
  }
  Object.keys(data).forEach(function (key) {
    // Ignore properties that were not specified in the component options
    // $FlowIgnore : Problem with possibly null this.vm
    if (!this$1.vm.$options._propKeys || !this$1.vm.$options._propKeys.includes(key)) {
      throwError(("wrapper.setProps() called with " + key + " property which is not defined on component"));
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

  if (options.target) {
    throwError('you cannot set the target value of an event. See the notes section of the docs for more details—https://vue-test-utils.vuejs.org/en/api/wrapper/trigger.html');
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
  warn('update has been removed from vue-test-utils. All updates are now synchronous by default');
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

  if ( Wrapper$$1 ) VueWrapper.__proto__ = Wrapper$$1;
  VueWrapper.prototype = Object.create( Wrapper$$1 && Wrapper$$1.prototype );
  VueWrapper.prototype.constructor = VueWrapper;

  return VueWrapper;
}(Wrapper));

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

function stubComponents (components, stubbedComponents) {
  Object.keys(components).forEach(function (component) {
    // Remove cached constructor
    delete components[component]._Ctor;
    if (!components[component].name) {
      components[component].name = component;
    }
    stubbedComponents[component] = createBlankStub(components[component]);

    // ignoreElements does not exist in Vue 2.0.x
    if (Vue.config.ignoredElements) {
      Vue.config.ignoredElements.push(component);
    }
  });
}

function createComponentStubsForAll (component) {
  var stubbedComponents = {};

  if (component.components) {
    stubComponents(component.components, stubbedComponents);
  }

  var extended = component.extends;

  // Loop through extended component chains to stub all child components
  while (extended) {
    if (extended.components) {
      stubComponents(extended.components, stubbedComponents);
    }
    extended = extended.extends;
  }

  if (component.extendOptions && component.extendOptions.components) {
    stubComponents(component.extendOptions.components, stubbedComponents);
  }

  return stubbedComponents
}

function createComponentStubsForGlobals (instance) {
  var components = {};
  Object.keys(instance.options.components).forEach(function (c) {
    if (isRequiredComponent(c)) {
      return
    }

    components[c] = createBlankStub(instance.options.components[c]);
    delete instance.options.components[c]._Ctor; // eslint-disable-line no-param-reassign
    delete components[c]._Ctor; // eslint-disable-line no-param-reassign
  });
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

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

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
  var instance = Vue.extend();

  // clone global APIs
  Object.keys(Vue).forEach(function (key) {
    if (!instance.hasOwnProperty(key)) {
      var original = Vue[key];
      instance[key] = typeof original === 'object'
        ? cloneDeep_1(original)
        : original;
    }
  });

  // config is not enumerable
  instance.config = cloneDeep_1(Vue.config);

  instance.config.errorHandler = errorHandler;

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
}

// 

var TransitionGroupStub = {
  render: function render (h) {
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
  methods: {}
}

// 

Vue.config.productionTip = false;
Vue.config.devtools = false;
Vue.config.errorHandler = errorHandler;

function mount (component, options) {
  if ( options === void 0 ) options = {};

  // Remove cached constructor
  delete component._Ctor;
  var vueClass = options.localVue || createLocalVue();
  var vm = createInstance(component, mergeOptions(options, config), vueClass);

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
  if ( options === void 0 ) options = {};

  var vue = options.localVue || Vue;

  // remove any recursive components added to the constructor
  // in vm._init from previous tests
  if (component.name && component.components) {
    delete component.components[capitalize(camelize(component.name))];
    delete component.components[hyphenate(component.name)];
  }

  var stubbedComponents = createComponentStubsForAll(component);
  var stubbedGlobalComponents = createComponentStubsForGlobals(vue);

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
}

var index = {
  createLocalVue: createLocalVue,
  config: config,
  mount: mount,
  shallow: shallow,
  TransitionStub: TransitionStub,
  TransitionGroupStub: TransitionGroupStub,
  RouterLinkStub: RouterLinkStub
}

module.exports = index;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidnVlLXRlc3QtdXRpbHMuanMiLCJzb3VyY2VzIjpbIi4uLy4uL3NoYXJlZC91dGlsLmpzIiwiLi4vc3JjL3dhcm4taWYtbm8td2luZG93LmpzIiwiLi4vc3JjL21hdGNoZXMtcG9seWZpbGwuanMiLCIuLi9zcmMvb2JqZWN0LWFzc2lnbi1wb2x5ZmlsbC5qcyIsIi4uLy4uL3NoYXJlZC92YWxpZGF0b3JzLmpzIiwiLi4vc3JjL2NvbnN0cy5qcyIsIi4uL3NyYy9nZXQtc2VsZWN0b3ItdHlwZS5qcyIsIi4uL3NyYy9maW5kLXZ1ZS1jb21wb25lbnRzLmpzIiwiLi4vc3JjL3dyYXBwZXItYXJyYXkuanMiLCIuLi9zcmMvZXJyb3Itd3JhcHBlci5qcyIsIi4uL3NyYy9maW5kLXZub2Rlcy5qcyIsIi4uL3NyYy9maW5kLWRvbS1ub2Rlcy5qcyIsIi4uL3NyYy9maW5kLmpzIiwiLi4vc3JjL2NyZWF0ZS13cmFwcGVyLmpzIiwiLi4vc3JjL29yZGVyLXdhdGNoZXJzLmpzIiwiLi4vc3JjL3dyYXBwZXIuanMiLCIuLi9zcmMvc2V0LXdhdGNoZXJzLXRvLXN5bmMuanMiLCIuLi9zcmMvdnVlLXdyYXBwZXIuanMiLCIuLi8uLi9jcmVhdGUtaW5zdGFuY2UvdmFsaWRhdGUtc2xvdHMuanMiLCIuLi8uLi9jcmVhdGUtaW5zdGFuY2UvYWRkLXNsb3RzLmpzIiwiLi4vLi4vY3JlYXRlLWluc3RhbmNlL2FkZC1zY29wZWQtc2xvdHMuanMiLCIuLi8uLi9jcmVhdGUtaW5zdGFuY2UvYWRkLW1vY2tzLmpzIiwiLi4vLi4vY3JlYXRlLWluc3RhbmNlL2FkZC1hdHRycy5qcyIsIi4uLy4uL2NyZWF0ZS1pbnN0YW5jZS9hZGQtbGlzdGVuZXJzLmpzIiwiLi4vLi4vY3JlYXRlLWluc3RhbmNlL2FkZC1wcm92aWRlLmpzIiwiLi4vLi4vY3JlYXRlLWluc3RhbmNlL2xvZy1ldmVudHMuanMiLCIuLi8uLi9zaGFyZWQvY29tcGlsZS10ZW1wbGF0ZS5qcyIsIi4uLy4uL3NoYXJlZC9zdHViLWNvbXBvbmVudHMuanMiLCIuLi8uLi9jcmVhdGUtaW5zdGFuY2UvY29tcGlsZS10ZW1wbGF0ZS5qcyIsIi4uLy4uL2NyZWF0ZS1pbnN0YW5jZS9kZWxldGUtbW91bnRpbmctb3B0aW9ucy5qcyIsIi4uLy4uL2NyZWF0ZS1pbnN0YW5jZS9jcmVhdGUtZnVuY3Rpb25hbC1jb21wb25lbnQuanMiLCIuLi8uLi9jcmVhdGUtaW5zdGFuY2UvY3JlYXRlLWluc3RhbmNlLmpzIiwiLi4vc3JjL2NyZWF0ZS1lbGVtZW50LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fbGlzdENhY2hlQ2xlYXIuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL2VxLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYXNzb2NJbmRleE9mLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fbGlzdENhY2hlRGVsZXRlLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fbGlzdENhY2hlR2V0LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fbGlzdENhY2hlSGFzLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fbGlzdENhY2hlU2V0LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fTGlzdENhY2hlLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fc3RhY2tDbGVhci5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX3N0YWNrRGVsZXRlLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fc3RhY2tHZXQuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19zdGFja0hhcy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2ZyZWVHbG9iYWwuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19yb290LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fU3ltYm9sLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fZ2V0UmF3VGFnLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fb2JqZWN0VG9TdHJpbmcuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19iYXNlR2V0VGFnLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9pc09iamVjdC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvaXNGdW5jdGlvbi5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2NvcmVKc0RhdGEuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19pc01hc2tlZC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX3RvU291cmNlLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZUlzTmF0aXZlLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fZ2V0VmFsdWUuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19nZXROYXRpdmUuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19NYXAuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19uYXRpdmVDcmVhdGUuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19oYXNoQ2xlYXIuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19oYXNoRGVsZXRlLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9faGFzaEdldC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2hhc2hIYXMuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19oYXNoU2V0LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fSGFzaC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX21hcENhY2hlQ2xlYXIuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19pc0tleWFibGUuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19nZXRNYXBEYXRhLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fbWFwQ2FjaGVEZWxldGUuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19tYXBDYWNoZUdldC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX21hcENhY2hlSGFzLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fbWFwQ2FjaGVTZXQuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19NYXBDYWNoZS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX3N0YWNrU2V0LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fU3RhY2suanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19hcnJheUVhY2guanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19kZWZpbmVQcm9wZXJ0eS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VBc3NpZ25WYWx1ZS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Fzc2lnblZhbHVlLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fY29weU9iamVjdC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VUaW1lcy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvaXNPYmplY3RMaWtlLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZUlzQXJndW1lbnRzLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9pc0FyZ3VtZW50cy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvaXNBcnJheS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvc3R1YkZhbHNlLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9pc0J1ZmZlci5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2lzSW5kZXguanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL2lzTGVuZ3RoLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZUlzVHlwZWRBcnJheS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VVbmFyeS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX25vZGVVdGlsLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9pc1R5cGVkQXJyYXkuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19hcnJheUxpa2VLZXlzLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9faXNQcm90b3R5cGUuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19vdmVyQXJnLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fbmF0aXZlS2V5cy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VLZXlzLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9pc0FycmF5TGlrZS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gva2V5cy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VBc3NpZ24uanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19uYXRpdmVLZXlzSW4uanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19iYXNlS2V5c0luLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9rZXlzSW4uanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19iYXNlQXNzaWduSW4uanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19jbG9uZUJ1ZmZlci5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2NvcHlBcnJheS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2FycmF5RmlsdGVyLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9zdHViQXJyYXkuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19nZXRTeW1ib2xzLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fY29weVN5bWJvbHMuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19hcnJheVB1c2guanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19nZXRQcm90b3R5cGUuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19nZXRTeW1ib2xzSW4uanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19jb3B5U3ltYm9sc0luLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZUdldEFsbEtleXMuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19nZXRBbGxLZXlzLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fZ2V0QWxsS2V5c0luLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fRGF0YVZpZXcuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19Qcm9taXNlLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fU2V0LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fV2Vha01hcC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2dldFRhZy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2luaXRDbG9uZUFycmF5LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fVWludDhBcnJheS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Nsb25lQXJyYXlCdWZmZXIuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19jbG9uZURhdGFWaWV3LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYWRkTWFwRW50cnkuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19hcnJheVJlZHVjZS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX21hcFRvQXJyYXkuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19jbG9uZU1hcC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Nsb25lUmVnRXhwLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYWRkU2V0RW50cnkuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19zZXRUb0FycmF5LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fY2xvbmVTZXQuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvbG9kYXNoL19jbG9uZVN5bWJvbC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Nsb25lVHlwZWRBcnJheS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2luaXRDbG9uZUJ5VGFnLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZUNyZWF0ZS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2luaXRDbG9uZU9iamVjdC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VDbG9uZS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvY2xvbmVEZWVwLmpzIiwiLi4vc3JjL2Vycm9yLWhhbmRsZXIuanMiLCIuLi9zcmMvY3JlYXRlLWxvY2FsLXZ1ZS5qcyIsIi4uLy4uL3NoYXJlZC9tZXJnZS1vcHRpb25zLmpzIiwiLi4vc3JjL2NvbXBvbmVudHMvVHJhbnNpdGlvblN0dWIuanMiLCIuLi9zcmMvY29tcG9uZW50cy9UcmFuc2l0aW9uR3JvdXBTdHViLmpzIiwiLi4vc3JjL2NvbmZpZy5qcyIsIi4uL3NyYy9tb3VudC5qcyIsIi4uL3NyYy9zaGFsbG93LmpzIiwiLi4vc3JjL2NvbXBvbmVudHMvUm91dGVyTGlua1N0dWIuanMiLCIuLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQGZsb3dcblxuZXhwb3J0IGZ1bmN0aW9uIHRocm93RXJyb3IgKG1zZzogc3RyaW5nKSB7XG4gIHRocm93IG5ldyBFcnJvcihgW3Z1ZS10ZXN0LXV0aWxzXTogJHttc2d9YClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdhcm4gKG1zZzogc3RyaW5nKSB7XG4gIGNvbnNvbGUuZXJyb3IoYFt2dWUtdGVzdC11dGlsc106ICR7bXNnfWApXG59XG5cbmNvbnN0IGNhbWVsaXplUkUgPSAvLShcXHcpL2dcbmV4cG9ydCBjb25zdCBjYW1lbGl6ZSA9IChzdHI6IHN0cmluZykgPT4gc3RyLnJlcGxhY2UoY2FtZWxpemVSRSwgKF8sIGMpID0+IGMgPyBjLnRvVXBwZXJDYXNlKCkgOiAnJylcblxuLyoqXG4gKiBDYXBpdGFsaXplIGEgc3RyaW5nLlxuICovXG5leHBvcnQgY29uc3QgY2FwaXRhbGl6ZSA9IChzdHI6IHN0cmluZykgPT4gc3RyLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgc3RyLnNsaWNlKDEpXG5cbi8qKlxuICogSHlwaGVuYXRlIGEgY2FtZWxDYXNlIHN0cmluZy5cbiAqL1xuY29uc3QgaHlwaGVuYXRlUkUgPSAvXFxCKFtBLVpdKS9nXG5leHBvcnQgY29uc3QgaHlwaGVuYXRlID0gKHN0cjogc3RyaW5nKSA9PiBzdHIucmVwbGFjZShoeXBoZW5hdGVSRSwgJy0kMScpLnRvTG93ZXJDYXNlKClcbiIsImltcG9ydCB7IHRocm93RXJyb3IgfSBmcm9tICdzaGFyZWQvdXRpbCdcblxuaWYgKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnKSB7XG4gIHRocm93RXJyb3IoXG4gICAgJ3dpbmRvdyBpcyB1bmRlZmluZWQsIHZ1ZS10ZXN0LXV0aWxzIG5lZWRzIHRvIGJlIHJ1biBpbiBhIGJyb3dzZXIgZW52aXJvbm1lbnQuXFxuJyArXG4gICAgJ1lvdSBjYW4gcnVuIHRoZSB0ZXN0cyBpbiBub2RlIHVzaW5nIGpzZG9tICsganNkb20tZ2xvYmFsLlxcbicgK1xuICAgICdTZWUgaHR0cHM6Ly92dWUtdGVzdC11dGlscy52dWVqcy5vcmcvZW4vZ3VpZGVzL2NvbW1vbi10aXBzLmh0bWwgZm9yIG1vcmUgZGV0YWlscy4nXG4gIClcbn1cbiIsImlmICghRWxlbWVudC5wcm90b3R5cGUubWF0Y2hlcykge1xuICBFbGVtZW50LnByb3RvdHlwZS5tYXRjaGVzID1cbiAgICAgICAgRWxlbWVudC5wcm90b3R5cGUubWF0Y2hlc1NlbGVjdG9yIHx8XG4gICAgICAgIEVsZW1lbnQucHJvdG90eXBlLm1vek1hdGNoZXNTZWxlY3RvciB8fFxuICAgICAgICBFbGVtZW50LnByb3RvdHlwZS5tc01hdGNoZXNTZWxlY3RvciB8fFxuICAgICAgICBFbGVtZW50LnByb3RvdHlwZS5vTWF0Y2hlc1NlbGVjdG9yIHx8XG4gICAgICAgIEVsZW1lbnQucHJvdG90eXBlLndlYmtpdE1hdGNoZXNTZWxlY3RvciB8fFxuICAgICAgICBmdW5jdGlvbiAocykge1xuICAgICAgICAgIGNvbnN0IG1hdGNoZXMgPSAodGhpcy5kb2N1bWVudCB8fCB0aGlzLm93bmVyRG9jdW1lbnQpLnF1ZXJ5U2VsZWN0b3JBbGwocylcbiAgICAgICAgICBsZXQgaSA9IG1hdGNoZXMubGVuZ3RoXG4gICAgICAgICAgd2hpbGUgKC0taSA+PSAwICYmIG1hdGNoZXMuaXRlbShpKSAhPT0gdGhpcykge31cbiAgICAgICAgICByZXR1cm4gaSA+IC0xXG4gICAgICAgIH1cbn1cbiIsImlmICh0eXBlb2YgT2JqZWN0LmFzc2lnbiAhPT0gJ2Z1bmN0aW9uJykge1xuICAoZnVuY3Rpb24gKCkge1xuICAgIE9iamVjdC5hc3NpZ24gPSBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgICAndXNlIHN0cmljdCdcbiAgICAgIGlmICh0YXJnZXQgPT09IHVuZGVmaW5lZCB8fCB0YXJnZXQgPT09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNvbnZlcnQgdW5kZWZpbmVkIG9yIG51bGwgdG8gb2JqZWN0JylcbiAgICAgIH1cblxuICAgICAgdmFyIG91dHB1dCA9IE9iamVjdCh0YXJnZXQpXG4gICAgICBmb3IgKHZhciBpbmRleCA9IDE7IGluZGV4IDwgYXJndW1lbnRzLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICB2YXIgc291cmNlID0gYXJndW1lbnRzW2luZGV4XVxuICAgICAgICBpZiAoc291cmNlICE9PSB1bmRlZmluZWQgJiYgc291cmNlICE9PSBudWxsKSB7XG4gICAgICAgICAgZm9yICh2YXIgbmV4dEtleSBpbiBzb3VyY2UpIHtcbiAgICAgICAgICAgIGlmIChzb3VyY2UuaGFzT3duUHJvcGVydHkobmV4dEtleSkpIHtcbiAgICAgICAgICAgICAgb3V0cHV0W25leHRLZXldID0gc291cmNlW25leHRLZXldXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gb3V0cHV0XG4gICAgfVxuICB9KSgpXG59XG4iLCIvLyBAZmxvd1xuaW1wb3J0IHsgdGhyb3dFcnJvciB9IGZyb20gJy4vdXRpbCdcblxuZXhwb3J0IGZ1bmN0aW9uIGlzRG9tU2VsZWN0b3IgKHNlbGVjdG9yOiBhbnkpIHtcbiAgaWYgKHR5cGVvZiBzZWxlY3RvciAhPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIHRyeSB7XG4gICAgaWYgKHR5cGVvZiBkb2N1bWVudCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRocm93RXJyb3IoJ21vdW50IG11c3QgYmUgcnVuIGluIGEgYnJvd3NlciBlbnZpcm9ubWVudCBsaWtlIFBoYW50b21KUywganNkb20gb3IgY2hyb21lJylcbiAgICB9XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgdGhyb3dFcnJvcignbW91bnQgbXVzdCBiZSBydW4gaW4gYSBicm93c2VyIGVudmlyb25tZW50IGxpa2UgUGhhbnRvbUpTLCBqc2RvbSBvciBjaHJvbWUnKVxuICB9XG5cbiAgdHJ5IHtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKVxuICAgIHJldHVybiB0cnVlXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzVnVlQ29tcG9uZW50IChjb21wb25lbnQ6IGFueSkge1xuICBpZiAodHlwZW9mIGNvbXBvbmVudCA9PT0gJ2Z1bmN0aW9uJyAmJiBjb21wb25lbnQub3B0aW9ucykge1xuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICBpZiAoY29tcG9uZW50ID09PSBudWxsIHx8IHR5cGVvZiBjb21wb25lbnQgIT09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICBpZiAoY29tcG9uZW50LmV4dGVuZHMgfHwgY29tcG9uZW50Ll9DdG9yKSB7XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIHJldHVybiB0eXBlb2YgY29tcG9uZW50LnJlbmRlciA9PT0gJ2Z1bmN0aW9uJ1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29tcG9uZW50TmVlZHNDb21waWxpbmcgKGNvbXBvbmVudDogQ29tcG9uZW50KSB7XG4gIHJldHVybiBjb21wb25lbnQgJiZcbiAgICAhY29tcG9uZW50LnJlbmRlciAmJlxuICAgIChjb21wb25lbnQudGVtcGxhdGUgfHwgY29tcG9uZW50LmV4dGVuZHMpICYmXG4gICAgIWNvbXBvbmVudC5mdW5jdGlvbmFsXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1JlZlNlbGVjdG9yIChyZWZPcHRpb25zT2JqZWN0OiBhbnkpIHtcbiAgaWYgKHR5cGVvZiByZWZPcHRpb25zT2JqZWN0ICE9PSAnb2JqZWN0JyB8fCBPYmplY3Qua2V5cyhyZWZPcHRpb25zT2JqZWN0IHx8IHt9KS5sZW5ndGggIT09IDEpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIHJldHVybiB0eXBlb2YgcmVmT3B0aW9uc09iamVjdC5yZWYgPT09ICdzdHJpbmcnXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc05hbWVTZWxlY3RvciAobmFtZU9wdGlvbnNPYmplY3Q6IGFueSkge1xuICBpZiAodHlwZW9mIG5hbWVPcHRpb25zT2JqZWN0ICE9PSAnb2JqZWN0JyB8fCBuYW1lT3B0aW9uc09iamVjdCA9PT0gbnVsbCkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgcmV0dXJuICEhbmFtZU9wdGlvbnNPYmplY3QubmFtZVxufVxuIiwiaW1wb3J0IFZ1ZSBmcm9tICd2dWUnXG5cbmV4cG9ydCBjb25zdCBOQU1FX1NFTEVDVE9SID0gJ05BTUVfU0VMRUNUT1InXG5leHBvcnQgY29uc3QgQ09NUE9ORU5UX1NFTEVDVE9SID0gJ0NPTVBPTkVOVF9TRUxFQ1RPUidcbmV4cG9ydCBjb25zdCBSRUZfU0VMRUNUT1IgPSAnUkVGX1NFTEVDVE9SJ1xuZXhwb3J0IGNvbnN0IERPTV9TRUxFQ1RPUiA9ICdET01fU0VMRUNUT1InXG5leHBvcnQgY29uc3QgVlVFX1ZFUlNJT04gPSBOdW1iZXIoYCR7VnVlLnZlcnNpb24uc3BsaXQoJy4nKVswXX0uJHtWdWUudmVyc2lvbi5zcGxpdCgnLicpWzFdfWApXG5leHBvcnQgY29uc3QgRlVOQ1RJT05BTF9PUFRJT05TID0gVlVFX1ZFUlNJT04gPj0gMi41ID8gJ2ZuT3B0aW9ucycgOiAnZnVuY3Rpb25hbE9wdGlvbnMnXG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQge1xuICBpc0RvbVNlbGVjdG9yLFxuICBpc05hbWVTZWxlY3RvcixcbiAgaXNSZWZTZWxlY3RvcixcbiAgaXNWdWVDb21wb25lbnRcbn0gZnJvbSAnc2hhcmVkL3ZhbGlkYXRvcnMnXG5pbXBvcnQge1xuICB0aHJvd0Vycm9yXG59IGZyb20gJ3NoYXJlZC91dGlsJ1xuaW1wb3J0IHtcbiAgUkVGX1NFTEVDVE9SLFxuICBDT01QT05FTlRfU0VMRUNUT1IsXG4gIE5BTUVfU0VMRUNUT1IsXG4gIERPTV9TRUxFQ1RPUlxufSBmcm9tICcuL2NvbnN0cydcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZ2V0U2VsZWN0b3JUeXBlT3JUaHJvdyAoc2VsZWN0b3I6IFNlbGVjdG9yLCBtZXRob2ROYW1lOiBzdHJpbmcpOiBzdHJpbmcgfCB2b2lkIHtcbiAgaWYgKGlzRG9tU2VsZWN0b3Ioc2VsZWN0b3IpKSByZXR1cm4gRE9NX1NFTEVDVE9SXG4gIGlmIChpc05hbWVTZWxlY3RvcihzZWxlY3RvcikpIHJldHVybiBOQU1FX1NFTEVDVE9SXG4gIGlmIChpc1Z1ZUNvbXBvbmVudChzZWxlY3RvcikpIHJldHVybiBDT01QT05FTlRfU0VMRUNUT1JcbiAgaWYgKGlzUmVmU2VsZWN0b3Ioc2VsZWN0b3IpKSByZXR1cm4gUkVGX1NFTEVDVE9SXG5cbiAgdGhyb3dFcnJvcihgd3JhcHBlci4ke21ldGhvZE5hbWV9KCkgbXVzdCBiZSBwYXNzZWQgYSB2YWxpZCBDU1Mgc2VsZWN0b3IsIFZ1ZSBjb25zdHJ1Y3Rvciwgb3IgdmFsaWQgZmluZCBvcHRpb24gb2JqZWN0YClcbn1cbiIsIi8vIEBmbG93XG5pbXBvcnQge1xuICBGVU5DVElPTkFMX09QVElPTlMsXG4gIFZVRV9WRVJTSU9OXG59IGZyb20gJy4vY29uc3RzJ1xuaW1wb3J0IHtcbiAgdGhyb3dFcnJvclxufSBmcm9tICdzaGFyZWQvdXRpbCdcblxuZXhwb3J0IGZ1bmN0aW9uIGZpbmRBbGxWdWVDb21wb25lbnRzRnJvbVZtIChcbiAgdm06IENvbXBvbmVudCxcbiAgY29tcG9uZW50czogQXJyYXk8Q29tcG9uZW50PiA9IFtdXG4pOiBBcnJheTxDb21wb25lbnQ+IHtcbiAgY29tcG9uZW50cy5wdXNoKHZtKVxuICB2bS4kY2hpbGRyZW4uZm9yRWFjaCgoY2hpbGQpID0+IHtcbiAgICBmaW5kQWxsVnVlQ29tcG9uZW50c0Zyb21WbShjaGlsZCwgY29tcG9uZW50cylcbiAgfSlcblxuICByZXR1cm4gY29tcG9uZW50c1xufVxuXG5mdW5jdGlvbiBmaW5kQWxsVnVlQ29tcG9uZW50c0Zyb21Wbm9kZSAoXG4gIHZub2RlOiBDb21wb25lbnQsXG4gIGNvbXBvbmVudHM6IEFycmF5PENvbXBvbmVudD4gPSBbXVxuKTogQXJyYXk8Q29tcG9uZW50PiB7XG4gIGlmICh2bm9kZS5jaGlsZCkge1xuICAgIGNvbXBvbmVudHMucHVzaCh2bm9kZS5jaGlsZClcbiAgfVxuICBpZiAodm5vZGUuY2hpbGRyZW4pIHtcbiAgICB2bm9kZS5jaGlsZHJlbi5mb3JFYWNoKChjaGlsZCkgPT4ge1xuICAgICAgZmluZEFsbFZ1ZUNvbXBvbmVudHNGcm9tVm5vZGUoY2hpbGQsIGNvbXBvbmVudHMpXG4gICAgfSlcbiAgfVxuXG4gIHJldHVybiBjb21wb25lbnRzXG59XG5cbmZ1bmN0aW9uIGZpbmRBbGxGdW5jdGlvbmFsQ29tcG9uZW50c0Zyb21Wbm9kZSAoXG4gIHZub2RlOiBDb21wb25lbnQsXG4gIGNvbXBvbmVudHM6IEFycmF5PENvbXBvbmVudD4gPSBbXVxuKTogQXJyYXk8Q29tcG9uZW50PiB7XG4gIGlmICh2bm9kZVtGVU5DVElPTkFMX09QVElPTlNdIHx8IHZub2RlLmZ1bmN0aW9uYWxDb250ZXh0KSB7XG4gICAgY29tcG9uZW50cy5wdXNoKHZub2RlKVxuICB9XG4gIGlmICh2bm9kZS5jaGlsZHJlbikge1xuICAgIHZub2RlLmNoaWxkcmVuLmZvckVhY2goKGNoaWxkKSA9PiB7XG4gICAgICBmaW5kQWxsRnVuY3Rpb25hbENvbXBvbmVudHNGcm9tVm5vZGUoY2hpbGQsIGNvbXBvbmVudHMpXG4gICAgfSlcbiAgfVxuICByZXR1cm4gY29tcG9uZW50c1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdm1DdG9yTWF0Y2hlc05hbWUgKHZtOiBDb21wb25lbnQsIG5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gISEoKHZtLiR2bm9kZSAmJiB2bS4kdm5vZGUuY29tcG9uZW50T3B0aW9ucyAmJlxuICAgIHZtLiR2bm9kZS5jb21wb25lbnRPcHRpb25zLkN0b3Iub3B0aW9ucy5uYW1lID09PSBuYW1lKSB8fFxuICAgICh2bS5fdm5vZGUgJiZcbiAgICB2bS5fdm5vZGUuZnVuY3Rpb25hbE9wdGlvbnMgJiZcbiAgICB2bS5fdm5vZGUuZnVuY3Rpb25hbE9wdGlvbnMubmFtZSA9PT0gbmFtZSkgfHxcbiAgICB2bS4kb3B0aW9ucyAmJiB2bS4kb3B0aW9ucy5uYW1lID09PSBuYW1lIHx8XG4gICAgdm0ub3B0aW9ucyAmJiB2bS5vcHRpb25zLm5hbWUgPT09IG5hbWUpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2bUN0b3JNYXRjaGVzU2VsZWN0b3IgKGNvbXBvbmVudDogQ29tcG9uZW50LCBzZWxlY3RvcjogT2JqZWN0KSB7XG4gIGNvbnN0IEN0b3IgPSBzZWxlY3Rvci5fQ3RvciB8fCAoc2VsZWN0b3Iub3B0aW9ucyAmJiBzZWxlY3Rvci5vcHRpb25zLl9DdG9yKVxuICBpZiAoIUN0b3IpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuICBjb25zdCBDdG9ycyA9IE9iamVjdC5rZXlzKEN0b3IpXG4gIHJldHVybiBDdG9ycy5zb21lKGMgPT4gQ3RvcltjXSA9PT0gY29tcG9uZW50Ll9fcHJvdG9fXy5jb25zdHJ1Y3Rvcilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHZtRnVuY3Rpb25hbEN0b3JNYXRjaGVzU2VsZWN0b3IgKGNvbXBvbmVudDogVk5vZGUsIEN0b3I6IE9iamVjdCkge1xuICBpZiAoVlVFX1ZFUlNJT04gPCAyLjMpIHtcbiAgICB0aHJvd0Vycm9yKCdmaW5kIGZvciBmdW5jdGlvbmFsIGNvbXBvbmVudHMgaXMgbm90IHN1cHBvcnQgaW4gVnVlIDwgMi4zJylcbiAgfVxuXG4gIGlmICghQ3Rvcikge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgaWYgKCFjb21wb25lbnRbRlVOQ1RJT05BTF9PUFRJT05TXSkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG4gIGNvbnN0IEN0b3JzID0gT2JqZWN0LmtleXMoY29tcG9uZW50W0ZVTkNUSU9OQUxfT1BUSU9OU10uX0N0b3IpXG4gIHJldHVybiBDdG9ycy5zb21lKGMgPT4gQ3RvcltjXSA9PT0gY29tcG9uZW50W0ZVTkNUSU9OQUxfT1BUSU9OU10uX0N0b3JbY10pXG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGZpbmRWdWVDb21wb25lbnRzIChcbiAgcm9vdDogQ29tcG9uZW50LFxuICBzZWxlY3RvclR5cGU6ID9zdHJpbmcsXG4gIHNlbGVjdG9yOiBPYmplY3Rcbik6IEFycmF5PENvbXBvbmVudD4ge1xuICBpZiAoc2VsZWN0b3IuZnVuY3Rpb25hbCkge1xuICAgIGNvbnN0IG5vZGVzID0gcm9vdC5fdm5vZGVcbiAgICAgID8gZmluZEFsbEZ1bmN0aW9uYWxDb21wb25lbnRzRnJvbVZub2RlKHJvb3QuX3Zub2RlKVxuICAgICAgOiBmaW5kQWxsRnVuY3Rpb25hbENvbXBvbmVudHNGcm9tVm5vZGUocm9vdClcbiAgICByZXR1cm4gbm9kZXMuZmlsdGVyKG5vZGUgPT5cbiAgICAgIHZtRnVuY3Rpb25hbEN0b3JNYXRjaGVzU2VsZWN0b3Iobm9kZSwgc2VsZWN0b3IuX0N0b3IpIHx8XG4gICAgICBub2RlW0ZVTkNUSU9OQUxfT1BUSU9OU10ubmFtZSA9PT0gc2VsZWN0b3IubmFtZVxuICAgIClcbiAgfVxuICBjb25zdCBuYW1lU2VsZWN0b3IgPSB0eXBlb2Ygc2VsZWN0b3IgPT09ICdmdW5jdGlvbicgPyBzZWxlY3Rvci5vcHRpb25zLm5hbWUgOiBzZWxlY3Rvci5uYW1lXG4gIGNvbnN0IGNvbXBvbmVudHMgPSByb290Ll9pc1Z1ZVxuICAgID8gZmluZEFsbFZ1ZUNvbXBvbmVudHNGcm9tVm0ocm9vdClcbiAgICA6IGZpbmRBbGxWdWVDb21wb25lbnRzRnJvbVZub2RlKHJvb3QpXG4gIHJldHVybiBjb21wb25lbnRzLmZpbHRlcigoY29tcG9uZW50KSA9PiB7XG4gICAgaWYgKCFjb21wb25lbnQuJHZub2RlICYmICFjb21wb25lbnQuJG9wdGlvbnMuZXh0ZW5kcykge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICAgIHJldHVybiB2bUN0b3JNYXRjaGVzU2VsZWN0b3IoY29tcG9uZW50LCBzZWxlY3RvcikgfHwgdm1DdG9yTWF0Y2hlc05hbWUoY29tcG9uZW50LCBuYW1lU2VsZWN0b3IpXG4gIH0pXG59XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgdHlwZSBXcmFwcGVyIGZyb20gJy4vd3JhcHBlcidcbmltcG9ydCB0eXBlIFZ1ZVdyYXBwZXIgZnJvbSAnLi92dWUtd3JhcHBlcidcbmltcG9ydCB7XG4gIHRocm93RXJyb3IsXG4gIHdhcm5cbn0gZnJvbSAnc2hhcmVkL3V0aWwnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFdyYXBwZXJBcnJheSBpbXBsZW1lbnRzIEJhc2VXcmFwcGVyIHtcbiAgd3JhcHBlcnM6IEFycmF5PFdyYXBwZXIgfCBWdWVXcmFwcGVyPjtcbiAgbGVuZ3RoOiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3IgKHdyYXBwZXJzOiBBcnJheTxXcmFwcGVyIHwgVnVlV3JhcHBlcj4pIHtcbiAgICB0aGlzLndyYXBwZXJzID0gd3JhcHBlcnMgfHwgW11cbiAgICB0aGlzLmxlbmd0aCA9IHRoaXMud3JhcHBlcnMubGVuZ3RoXG4gIH1cblxuICBhdCAoaW5kZXg6IG51bWJlcik6IFdyYXBwZXIgfCBWdWVXcmFwcGVyIHtcbiAgICBpZiAoaW5kZXggPiB0aGlzLmxlbmd0aCAtIDEpIHtcbiAgICAgIHRocm93RXJyb3IoYG5vIGl0ZW0gZXhpc3RzIGF0ICR7aW5kZXh9YClcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMud3JhcHBlcnNbaW5kZXhdXG4gIH1cblxuICBhdHRyaWJ1dGVzICgpOiB2b2lkIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgnYXR0cmlidXRlcycpXG5cbiAgICB0aHJvd0Vycm9yKCdhdHRyaWJ1dGVzIG11c3QgYmUgY2FsbGVkIG9uIGEgc2luZ2xlIHdyYXBwZXIsIHVzZSBhdChpKSB0byBhY2Nlc3MgYSB3cmFwcGVyJylcbiAgfVxuXG4gIGNsYXNzZXMgKCk6IHZvaWQge1xuICAgIHRoaXMudGhyb3dFcnJvcklmV3JhcHBlcnNJc0VtcHR5KCdjbGFzc2VzJylcblxuICAgIHRocm93RXJyb3IoJ2NsYXNzZXMgbXVzdCBiZSBjYWxsZWQgb24gYSBzaW5nbGUgd3JhcHBlciwgdXNlIGF0KGkpIHRvIGFjY2VzcyBhIHdyYXBwZXInKVxuICB9XG5cbiAgY29udGFpbnMgKHNlbGVjdG9yOiBTZWxlY3Rvcik6IGJvb2xlYW4ge1xuICAgIHRoaXMudGhyb3dFcnJvcklmV3JhcHBlcnNJc0VtcHR5KCdjb250YWlucycpXG5cbiAgICByZXR1cm4gdGhpcy53cmFwcGVycy5ldmVyeSh3cmFwcGVyID0+IHdyYXBwZXIuY29udGFpbnMoc2VsZWN0b3IpKVxuICB9XG5cbiAgZXhpc3RzICgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5sZW5ndGggPiAwICYmIHRoaXMud3JhcHBlcnMuZXZlcnkod3JhcHBlciA9PiB3cmFwcGVyLmV4aXN0cygpKVxuICB9XG5cbiAgZmlsdGVyIChwcmVkaWNhdGU6IEZ1bmN0aW9uKTogV3JhcHBlckFycmF5IHtcbiAgICByZXR1cm4gbmV3IFdyYXBwZXJBcnJheSh0aGlzLndyYXBwZXJzLmZpbHRlcihwcmVkaWNhdGUpKVxuICB9XG5cbiAgdmlzaWJsZSAoKTogYm9vbGVhbiB7XG4gICAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ3Zpc2libGUnKVxuXG4gICAgcmV0dXJuIHRoaXMubGVuZ3RoID4gMCAmJiB0aGlzLndyYXBwZXJzLmV2ZXJ5KHdyYXBwZXIgPT4gd3JhcHBlci52aXNpYmxlKCkpXG4gIH1cblxuICBlbWl0dGVkICgpOiB2b2lkIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgnZW1pdHRlZCcpXG5cbiAgICB0aHJvd0Vycm9yKCdlbWl0dGVkIG11c3QgYmUgY2FsbGVkIG9uIGEgc2luZ2xlIHdyYXBwZXIsIHVzZSBhdChpKSB0byBhY2Nlc3MgYSB3cmFwcGVyJylcbiAgfVxuXG4gIGVtaXR0ZWRCeU9yZGVyICgpOiB2b2lkIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgnZW1pdHRlZEJ5T3JkZXInKVxuXG4gICAgdGhyb3dFcnJvcignZW1pdHRlZEJ5T3JkZXIgbXVzdCBiZSBjYWxsZWQgb24gYSBzaW5nbGUgd3JhcHBlciwgdXNlIGF0KGkpIHRvIGFjY2VzcyBhIHdyYXBwZXInKVxuICB9XG5cbiAgaGFzQXR0cmlidXRlIChhdHRyaWJ1dGU6IHN0cmluZywgdmFsdWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHRoaXMudGhyb3dFcnJvcklmV3JhcHBlcnNJc0VtcHR5KCdoYXNBdHRyaWJ1dGUnKVxuXG4gICAgcmV0dXJuIHRoaXMud3JhcHBlcnMuZXZlcnkod3JhcHBlciA9PiB3cmFwcGVyLmhhc0F0dHJpYnV0ZShhdHRyaWJ1dGUsIHZhbHVlKSlcbiAgfVxuXG4gIGhhc0NsYXNzIChjbGFzc05hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHRoaXMudGhyb3dFcnJvcklmV3JhcHBlcnNJc0VtcHR5KCdoYXNDbGFzcycpXG5cbiAgICByZXR1cm4gdGhpcy53cmFwcGVycy5ldmVyeSh3cmFwcGVyID0+IHdyYXBwZXIuaGFzQ2xhc3MoY2xhc3NOYW1lKSlcbiAgfVxuXG4gIGhhc1Byb3AgKHByb3A6IHN0cmluZywgdmFsdWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHRoaXMudGhyb3dFcnJvcklmV3JhcHBlcnNJc0VtcHR5KCdoYXNQcm9wJylcblxuICAgIHJldHVybiB0aGlzLndyYXBwZXJzLmV2ZXJ5KHdyYXBwZXIgPT4gd3JhcHBlci5oYXNQcm9wKHByb3AsIHZhbHVlKSlcbiAgfVxuXG4gIGhhc1N0eWxlIChzdHlsZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ2hhc1N0eWxlJylcblxuICAgIHJldHVybiB0aGlzLndyYXBwZXJzLmV2ZXJ5KHdyYXBwZXIgPT4gd3JhcHBlci5oYXNTdHlsZShzdHlsZSwgdmFsdWUpKVxuICB9XG5cbiAgZmluZEFsbCAoKTogdm9pZCB7XG4gICAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ2ZpbmRBbGwnKVxuXG4gICAgdGhyb3dFcnJvcignZmluZEFsbCBtdXN0IGJlIGNhbGxlZCBvbiBhIHNpbmdsZSB3cmFwcGVyLCB1c2UgYXQoaSkgdG8gYWNjZXNzIGEgd3JhcHBlcicpXG4gIH1cblxuICBmaW5kICgpOiB2b2lkIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgnZmluZCcpXG5cbiAgICB0aHJvd0Vycm9yKCdmaW5kIG11c3QgYmUgY2FsbGVkIG9uIGEgc2luZ2xlIHdyYXBwZXIsIHVzZSBhdChpKSB0byBhY2Nlc3MgYSB3cmFwcGVyJylcbiAgfVxuXG4gIGh0bWwgKCk6IHZvaWQge1xuICAgIHRoaXMudGhyb3dFcnJvcklmV3JhcHBlcnNJc0VtcHR5KCdodG1sJylcblxuICAgIHRocm93RXJyb3IoJ2h0bWwgbXVzdCBiZSBjYWxsZWQgb24gYSBzaW5nbGUgd3JhcHBlciwgdXNlIGF0KGkpIHRvIGFjY2VzcyBhIHdyYXBwZXInKVxuICB9XG5cbiAgaXMgKHNlbGVjdG9yOiBTZWxlY3Rvcik6IGJvb2xlYW4ge1xuICAgIHRoaXMudGhyb3dFcnJvcklmV3JhcHBlcnNJc0VtcHR5KCdpcycpXG5cbiAgICByZXR1cm4gdGhpcy53cmFwcGVycy5ldmVyeSh3cmFwcGVyID0+IHdyYXBwZXIuaXMoc2VsZWN0b3IpKVxuICB9XG5cbiAgaXNFbXB0eSAoKTogYm9vbGVhbiB7XG4gICAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ2lzRW1wdHknKVxuXG4gICAgcmV0dXJuIHRoaXMud3JhcHBlcnMuZXZlcnkod3JhcHBlciA9PiB3cmFwcGVyLmlzRW1wdHkoKSlcbiAgfVxuXG4gIGlzVmlzaWJsZSAoKTogYm9vbGVhbiB7XG4gICAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ2lzVmlzaWJsZScpXG5cbiAgICByZXR1cm4gdGhpcy53cmFwcGVycy5ldmVyeSh3cmFwcGVyID0+IHdyYXBwZXIuaXNWaXNpYmxlKCkpXG4gIH1cblxuICBpc1Z1ZUluc3RhbmNlICgpOiBib29sZWFuIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgnaXNWdWVJbnN0YW5jZScpXG5cbiAgICByZXR1cm4gdGhpcy53cmFwcGVycy5ldmVyeSh3cmFwcGVyID0+IHdyYXBwZXIuaXNWdWVJbnN0YW5jZSgpKVxuICB9XG5cbiAgbmFtZSAoKTogdm9pZCB7XG4gICAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ25hbWUnKVxuXG4gICAgdGhyb3dFcnJvcignbmFtZSBtdXN0IGJlIGNhbGxlZCBvbiBhIHNpbmdsZSB3cmFwcGVyLCB1c2UgYXQoaSkgdG8gYWNjZXNzIGEgd3JhcHBlcicpXG4gIH1cblxuICBwcm9wcyAoKTogdm9pZCB7XG4gICAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ3Byb3BzJylcblxuICAgIHRocm93RXJyb3IoJ3Byb3BzIG11c3QgYmUgY2FsbGVkIG9uIGEgc2luZ2xlIHdyYXBwZXIsIHVzZSBhdChpKSB0byBhY2Nlc3MgYSB3cmFwcGVyJylcbiAgfVxuXG4gIHRleHQgKCk6IHZvaWQge1xuICAgIHRoaXMudGhyb3dFcnJvcklmV3JhcHBlcnNJc0VtcHR5KCd0ZXh0JylcblxuICAgIHRocm93RXJyb3IoJ3RleHQgbXVzdCBiZSBjYWxsZWQgb24gYSBzaW5nbGUgd3JhcHBlciwgdXNlIGF0KGkpIHRvIGFjY2VzcyBhIHdyYXBwZXInKVxuICB9XG5cbiAgdGhyb3dFcnJvcklmV3JhcHBlcnNJc0VtcHR5IChtZXRob2Q6IHN0cmluZyk6IHZvaWQge1xuICAgIGlmICh0aGlzLndyYXBwZXJzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhyb3dFcnJvcihgJHttZXRob2R9IGNhbm5vdCBiZSBjYWxsZWQgb24gMCBpdGVtc2ApXG4gICAgfVxuICB9XG5cbiAgc2V0Q29tcHV0ZWQgKGNvbXB1dGVkOiBPYmplY3QpOiB2b2lkIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgnc2V0Q29tcHV0ZWQnKVxuXG4gICAgdGhpcy53cmFwcGVycy5mb3JFYWNoKHdyYXBwZXIgPT4gd3JhcHBlci5zZXRDb21wdXRlZChjb21wdXRlZCkpXG4gIH1cblxuICBzZXREYXRhIChkYXRhOiBPYmplY3QpOiB2b2lkIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgnc2V0RGF0YScpXG5cbiAgICB0aGlzLndyYXBwZXJzLmZvckVhY2god3JhcHBlciA9PiB3cmFwcGVyLnNldERhdGEoZGF0YSkpXG4gIH1cblxuICBzZXRNZXRob2RzIChwcm9wczogT2JqZWN0KTogdm9pZCB7XG4gICAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ3NldE1ldGhvZHMnKVxuXG4gICAgdGhpcy53cmFwcGVycy5mb3JFYWNoKHdyYXBwZXIgPT4gd3JhcHBlci5zZXRNZXRob2RzKHByb3BzKSlcbiAgfVxuXG4gIHNldFByb3BzIChwcm9wczogT2JqZWN0KTogdm9pZCB7XG4gICAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ3NldFByb3BzJylcblxuICAgIHRoaXMud3JhcHBlcnMuZm9yRWFjaCh3cmFwcGVyID0+IHdyYXBwZXIuc2V0UHJvcHMocHJvcHMpKVxuICB9XG5cbiAgdHJpZ2dlciAoZXZlbnQ6IHN0cmluZywgb3B0aW9uczogT2JqZWN0KTogdm9pZCB7XG4gICAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ3RyaWdnZXInKVxuXG4gICAgdGhpcy53cmFwcGVycy5mb3JFYWNoKHdyYXBwZXIgPT4gd3JhcHBlci50cmlnZ2VyKGV2ZW50LCBvcHRpb25zKSlcbiAgfVxuXG4gIHVwZGF0ZSAoKTogdm9pZCB7XG4gICAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ3VwZGF0ZScpXG4gICAgd2FybigndXBkYXRlIGhhcyBiZWVuIHJlbW92ZWQuIEFsbCBjaGFuZ2VzIGFyZSBub3cgc3luY2hybm91cyB3aXRob3V0IGNhbGxpbmcgdXBkYXRlJylcbiAgfVxuXG4gIGRlc3Ryb3kgKCk6IHZvaWQge1xuICAgIHRoaXMudGhyb3dFcnJvcklmV3JhcHBlcnNJc0VtcHR5KCdkZXN0cm95JylcblxuICAgIHRoaXMud3JhcHBlcnMuZm9yRWFjaCh3cmFwcGVyID0+IHdyYXBwZXIuZGVzdHJveSgpKVxuICB9XG59XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgeyB0aHJvd0Vycm9yIH0gZnJvbSAnc2hhcmVkL3V0aWwnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEVycm9yV3JhcHBlciBpbXBsZW1lbnRzIEJhc2VXcmFwcGVyIHtcbiAgc2VsZWN0b3I6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvciAoc2VsZWN0b3I6IHN0cmluZykge1xuICAgIHRoaXMuc2VsZWN0b3IgPSBzZWxlY3RvclxuICB9XG5cbiAgYXQgKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoYGZpbmQgZGlkIG5vdCByZXR1cm4gJHt0aGlzLnNlbGVjdG9yfSwgY2Fubm90IGNhbGwgYXQoKSBvbiBlbXB0eSBXcmFwcGVyYClcbiAgfVxuXG4gIGF0dHJpYnV0ZXMgKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoYGZpbmQgZGlkIG5vdCByZXR1cm4gJHt0aGlzLnNlbGVjdG9yfSwgY2Fubm90IGNhbGwgYXR0cmlidXRlcygpIG9uIGVtcHR5IFdyYXBwZXJgKVxuICB9XG5cbiAgY2xhc3NlcyAoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihgZmluZCBkaWQgbm90IHJldHVybiAke3RoaXMuc2VsZWN0b3J9LCBjYW5ub3QgY2FsbCBjbGFzc2VzKCkgb24gZW1wdHkgV3JhcHBlcmApXG4gIH1cblxuICBjb250YWlucyAoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihgZmluZCBkaWQgbm90IHJldHVybiAke3RoaXMuc2VsZWN0b3J9LCBjYW5ub3QgY2FsbCBjb250YWlucygpIG9uIGVtcHR5IFdyYXBwZXJgKVxuICB9XG5cbiAgZW1pdHRlZCAoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihgZmluZCBkaWQgbm90IHJldHVybiAke3RoaXMuc2VsZWN0b3J9LCBjYW5ub3QgY2FsbCBlbWl0dGVkKCkgb24gZW1wdHkgV3JhcHBlcmApXG4gIH1cblxuICBlbWl0dGVkQnlPcmRlciAoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihgZmluZCBkaWQgbm90IHJldHVybiAke3RoaXMuc2VsZWN0b3J9LCBjYW5ub3QgY2FsbCBlbWl0dGVkQnlPcmRlcigpIG9uIGVtcHR5IFdyYXBwZXJgKVxuICB9XG5cbiAgZXhpc3RzICgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIGZpbHRlciAoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihgZmluZCBkaWQgbm90IHJldHVybiAke3RoaXMuc2VsZWN0b3J9LCBjYW5ub3QgY2FsbCBmaWx0ZXIoKSBvbiBlbXB0eSBXcmFwcGVyYClcbiAgfVxuXG4gIHZpc2libGUgKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoYGZpbmQgZGlkIG5vdCByZXR1cm4gJHt0aGlzLnNlbGVjdG9yfSwgY2Fubm90IGNhbGwgdmlzaWJsZSgpIG9uIGVtcHR5IFdyYXBwZXJgKVxuICB9XG5cbiAgaGFzQXR0cmlidXRlICgpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKGBmaW5kIGRpZCBub3QgcmV0dXJuICR7dGhpcy5zZWxlY3Rvcn0sIGNhbm5vdCBjYWxsIGhhc0F0dHJpYnV0ZSgpIG9uIGVtcHR5IFdyYXBwZXJgKVxuICB9XG5cbiAgaGFzQ2xhc3MgKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoYGZpbmQgZGlkIG5vdCByZXR1cm4gJHt0aGlzLnNlbGVjdG9yfSwgY2Fubm90IGNhbGwgaGFzQ2xhc3MoKSBvbiBlbXB0eSBXcmFwcGVyYClcbiAgfVxuXG4gIGhhc1Byb3AgKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoYGZpbmQgZGlkIG5vdCByZXR1cm4gJHt0aGlzLnNlbGVjdG9yfSwgY2Fubm90IGNhbGwgaGFzUHJvcCgpIG9uIGVtcHR5IFdyYXBwZXJgKVxuICB9XG5cbiAgaGFzU3R5bGUgKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoYGZpbmQgZGlkIG5vdCByZXR1cm4gJHt0aGlzLnNlbGVjdG9yfSwgY2Fubm90IGNhbGwgaGFzU3R5bGUoKSBvbiBlbXB0eSBXcmFwcGVyYClcbiAgfVxuXG4gIGZpbmRBbGwgKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoYGZpbmQgZGlkIG5vdCByZXR1cm4gJHt0aGlzLnNlbGVjdG9yfSwgY2Fubm90IGNhbGwgZmluZEFsbCgpIG9uIGVtcHR5IFdyYXBwZXJgKVxuICB9XG5cbiAgZmluZCAoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihgZmluZCBkaWQgbm90IHJldHVybiAke3RoaXMuc2VsZWN0b3J9LCBjYW5ub3QgY2FsbCBmaW5kKCkgb24gZW1wdHkgV3JhcHBlcmApXG4gIH1cblxuICBodG1sICgpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKGBmaW5kIGRpZCBub3QgcmV0dXJuICR7dGhpcy5zZWxlY3Rvcn0sIGNhbm5vdCBjYWxsIGh0bWwoKSBvbiBlbXB0eSBXcmFwcGVyYClcbiAgfVxuXG4gIGlzICgpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKGBmaW5kIGRpZCBub3QgcmV0dXJuICR7dGhpcy5zZWxlY3Rvcn0sIGNhbm5vdCBjYWxsIGlzKCkgb24gZW1wdHkgV3JhcHBlcmApXG4gIH1cblxuICBpc0VtcHR5ICgpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKGBmaW5kIGRpZCBub3QgcmV0dXJuICR7dGhpcy5zZWxlY3Rvcn0sIGNhbm5vdCBjYWxsIGlzRW1wdHkoKSBvbiBlbXB0eSBXcmFwcGVyYClcbiAgfVxuXG4gIGlzVmlzaWJsZSAoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihgZmluZCBkaWQgbm90IHJldHVybiAke3RoaXMuc2VsZWN0b3J9LCBjYW5ub3QgY2FsbCBpc1Zpc2libGUoKSBvbiBlbXB0eSBXcmFwcGVyYClcbiAgfVxuXG4gIGlzVnVlSW5zdGFuY2UgKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoYGZpbmQgZGlkIG5vdCByZXR1cm4gJHt0aGlzLnNlbGVjdG9yfSwgY2Fubm90IGNhbGwgaXNWdWVJbnN0YW5jZSgpIG9uIGVtcHR5IFdyYXBwZXJgKVxuICB9XG5cbiAgbmFtZSAoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihgZmluZCBkaWQgbm90IHJldHVybiAke3RoaXMuc2VsZWN0b3J9LCBjYW5ub3QgY2FsbCBuYW1lKCkgb24gZW1wdHkgV3JhcHBlcmApXG4gIH1cblxuICBwcm9wcyAoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihgZmluZCBkaWQgbm90IHJldHVybiAke3RoaXMuc2VsZWN0b3J9LCBjYW5ub3QgY2FsbCBwcm9wcygpIG9uIGVtcHR5IFdyYXBwZXJgKVxuICB9XG5cbiAgdGV4dCAoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihgZmluZCBkaWQgbm90IHJldHVybiAke3RoaXMuc2VsZWN0b3J9LCBjYW5ub3QgY2FsbCB0ZXh0KCkgb24gZW1wdHkgV3JhcHBlcmApXG4gIH1cblxuICBzZXRDb21wdXRlZCAoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihgZmluZCBkaWQgbm90IHJldHVybiAke3RoaXMuc2VsZWN0b3J9LCBjYW5ub3QgY2FsbCBzZXRDb21wdXRlZCgpIG9uIGVtcHR5IFdyYXBwZXJgKVxuICB9XG5cbiAgc2V0RGF0YSAoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihgZmluZCBkaWQgbm90IHJldHVybiAke3RoaXMuc2VsZWN0b3J9LCBjYW5ub3QgY2FsbCBzZXREYXRhKCkgb24gZW1wdHkgV3JhcHBlcmApXG4gIH1cblxuICBzZXRNZXRob2RzICgpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKGBmaW5kIGRpZCBub3QgcmV0dXJuICR7dGhpcy5zZWxlY3Rvcn0sIGNhbm5vdCBjYWxsIHNldE1ldGhvZHMoKSBvbiBlbXB0eSBXcmFwcGVyYClcbiAgfVxuXG4gIHNldFByb3BzICgpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKGBmaW5kIGRpZCBub3QgcmV0dXJuICR7dGhpcy5zZWxlY3Rvcn0sIGNhbm5vdCBjYWxsIHNldFByb3BzKCkgb24gZW1wdHkgV3JhcHBlcmApXG4gIH1cblxuICB0cmlnZ2VyICgpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKGBmaW5kIGRpZCBub3QgcmV0dXJuICR7dGhpcy5zZWxlY3Rvcn0sIGNhbm5vdCBjYWxsIHRyaWdnZXIoKSBvbiBlbXB0eSBXcmFwcGVyYClcbiAgfVxuXG4gIHVwZGF0ZSAoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihgdXBkYXRlIGhhcyBiZWVuIHJlbW92ZWQgZnJvbSB2dWUtdGVzdC11dGlscy4gQWxsIHVwZGF0ZXMgYXJlIG5vdyBzeW5jaHJvbm91cyBieSBkZWZhdWx0YClcbiAgfVxuXG4gIGRlc3Ryb3kgKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoYGZpbmQgZGlkIG5vdCByZXR1cm4gJHt0aGlzLnNlbGVjdG9yfSwgY2Fubm90IGNhbGwgZGVzdHJveSgpIG9uIGVtcHR5IFdyYXBwZXJgKVxuICB9XG59XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQge1xuICBSRUZfU0VMRUNUT1Jcbn0gZnJvbSAnLi9jb25zdHMnXG5pbXBvcnQge1xuICB0aHJvd0Vycm9yXG59IGZyb20gJ3NoYXJlZC91dGlsJ1xuXG5mdW5jdGlvbiBmaW5kQWxsVk5vZGVzICh2bm9kZTogVk5vZGUsIG5vZGVzOiBBcnJheTxWTm9kZT4gPSBbXSk6IEFycmF5PFZOb2RlPiB7XG4gIG5vZGVzLnB1c2godm5vZGUpXG5cbiAgaWYgKEFycmF5LmlzQXJyYXkodm5vZGUuY2hpbGRyZW4pKSB7XG4gICAgdm5vZGUuY2hpbGRyZW4uZm9yRWFjaCgoY2hpbGRWTm9kZSkgPT4ge1xuICAgICAgZmluZEFsbFZOb2RlcyhjaGlsZFZOb2RlLCBub2RlcylcbiAgICB9KVxuICB9XG5cbiAgaWYgKHZub2RlLmNoaWxkKSB7XG4gICAgZmluZEFsbFZOb2Rlcyh2bm9kZS5jaGlsZC5fdm5vZGUsIG5vZGVzKVxuICB9XG5cbiAgcmV0dXJuIG5vZGVzXG59XG5cbmZ1bmN0aW9uIHJlbW92ZUR1cGxpY2F0ZU5vZGVzICh2Tm9kZXM6IEFycmF5PFZOb2RlPik6IEFycmF5PFZOb2RlPiB7XG4gIHJldHVybiB2Tm9kZXMuZmlsdGVyKCh2Tm9kZSwgaW5kZXgpID0+IGluZGV4ID09PSB2Tm9kZXMuZmluZEluZGV4KG5vZGUgPT4gdk5vZGUuZWxtID09PSBub2RlLmVsbSkpXG59XG5cbmZ1bmN0aW9uIG5vZGVNYXRjaGVzUmVmIChub2RlOiBWTm9kZSwgcmVmTmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiBub2RlLmRhdGEgJiYgbm9kZS5kYXRhLnJlZiA9PT0gcmVmTmFtZVxufVxuXG5mdW5jdGlvbiBmaW5kVk5vZGVzQnlSZWYgKHZOb2RlOiBWTm9kZSwgcmVmTmFtZTogc3RyaW5nKTogQXJyYXk8Vk5vZGU+IHtcbiAgY29uc3Qgbm9kZXMgPSBmaW5kQWxsVk5vZGVzKHZOb2RlKVxuICBjb25zdCByZWZGaWx0ZXJlZE5vZGVzID0gbm9kZXMuZmlsdGVyKG5vZGUgPT4gbm9kZU1hdGNoZXNSZWYobm9kZSwgcmVmTmFtZSkpXG4gIC8vIE9ubHkgcmV0dXJuIHJlZnMgZGVmaW5lZCBvbiB0b3AtbGV2ZWwgVk5vZGUgdG8gcHJvdmlkZSB0aGUgc2FtZVxuICAvLyBiZWhhdmlvciBhcyBzZWxlY3RpbmcgdmlhIHZtLiRyZWYue3NvbWVSZWZOYW1lfVxuICBjb25zdCBtYWluVk5vZGVGaWx0ZXJlZE5vZGVzID0gcmVmRmlsdGVyZWROb2Rlcy5maWx0ZXIobm9kZSA9PiAoXG4gICAgISF2Tm9kZS5jb250ZXh0LiRyZWZzW25vZGUuZGF0YS5yZWZdXG4gICkpXG4gIHJldHVybiByZW1vdmVEdXBsaWNhdGVOb2RlcyhtYWluVk5vZGVGaWx0ZXJlZE5vZGVzKVxufVxuXG5mdW5jdGlvbiBub2RlTWF0Y2hlc1NlbGVjdG9yIChub2RlOiBWTm9kZSwgc2VsZWN0b3I6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gbm9kZS5lbG0gJiYgbm9kZS5lbG0uZ2V0QXR0cmlidXRlICYmIG5vZGUuZWxtLm1hdGNoZXMoc2VsZWN0b3IpXG59XG5cbmZ1bmN0aW9uIGZpbmRWTm9kZXNCeVNlbGVjdG9yIChcbiAgdk5vZGU6IFZOb2RlLFxuICBzZWxlY3Rvcjogc3RyaW5nXG4pOiBBcnJheTxWTm9kZT4ge1xuICBjb25zdCBub2RlcyA9IGZpbmRBbGxWTm9kZXModk5vZGUpXG4gIGNvbnN0IGZpbHRlcmVkTm9kZXMgPSBub2Rlcy5maWx0ZXIobm9kZSA9PiAoXG4gICAgbm9kZU1hdGNoZXNTZWxlY3Rvcihub2RlLCBzZWxlY3RvcilcbiAgKSlcbiAgcmV0dXJuIHJlbW92ZUR1cGxpY2F0ZU5vZGVzKGZpbHRlcmVkTm9kZXMpXG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGZpbmRWbm9kZXMgKFxuICB2bm9kZTogVk5vZGUsXG4gIHZtOiBDb21wb25lbnQgfCBudWxsLFxuICBzZWxlY3RvclR5cGU6ID9zdHJpbmcsXG4gIHNlbGVjdG9yOiBPYmplY3QgfCBzdHJpbmdcbik6IEFycmF5PFZOb2RlPiB7XG4gIGlmIChzZWxlY3RvclR5cGUgPT09IFJFRl9TRUxFQ1RPUikge1xuICAgIGlmICghdm0pIHtcbiAgICAgIHRocm93RXJyb3IoJyRyZWYgc2VsZWN0b3JzIGNhbiBvbmx5IGJlIHVzZWQgb24gVnVlIGNvbXBvbmVudCB3cmFwcGVycycpXG4gICAgfVxuICAgIC8vICRGbG93SWdub3JlXG4gICAgcmV0dXJuIGZpbmRWTm9kZXNCeVJlZih2bm9kZSwgc2VsZWN0b3IucmVmKVxuICB9XG4gIC8vICRGbG93SWdub3JlXG4gIHJldHVybiBmaW5kVk5vZGVzQnlTZWxlY3Rvcih2bm9kZSwgc2VsZWN0b3IpXG59XG4iLCIvLyBAZmxvd1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBmaW5kRE9NTm9kZXMgKFxuICBlbGVtZW50OiBFbGVtZW50IHwgbnVsbCxcbiAgc2VsZWN0b3I6IHN0cmluZ1xuKTogQXJyYXk8Vk5vZGU+IHtcbiAgY29uc3Qgbm9kZXMgPSBbXVxuICBpZiAoIWVsZW1lbnQgfHwgIWVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCB8fCAhZWxlbWVudC5tYXRjaGVzKSB7XG4gICAgcmV0dXJuIG5vZGVzXG4gIH1cblxuICBpZiAoZWxlbWVudC5tYXRjaGVzKHNlbGVjdG9yKSkge1xuICAgIG5vZGVzLnB1c2goZWxlbWVudClcbiAgfVxuICAvLyAkRmxvd0lnbm9yZVxuICByZXR1cm4gbm9kZXMuY29uY2F0KFtdLnNsaWNlLmNhbGwoZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKSkpXG59XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgZmluZFZub2RlcyBmcm9tICcuL2ZpbmQtdm5vZGVzJ1xuaW1wb3J0IGZpbmRWdWVDb21wb25lbnRzIGZyb20gJy4vZmluZC12dWUtY29tcG9uZW50cydcbmltcG9ydCBmaW5kRE9NTm9kZXMgZnJvbSAnLi9maW5kLWRvbS1ub2RlcydcbmltcG9ydCB7XG4gIENPTVBPTkVOVF9TRUxFQ1RPUixcbiAgTkFNRV9TRUxFQ1RPUixcbiAgRE9NX1NFTEVDVE9SXG59IGZyb20gJy4vY29uc3RzJ1xuaW1wb3J0IFZ1ZSBmcm9tICd2dWUnXG5pbXBvcnQgZ2V0U2VsZWN0b3JUeXBlT3JUaHJvdyBmcm9tICcuL2dldC1zZWxlY3Rvci10eXBlJ1xuaW1wb3J0IHsgdGhyb3dFcnJvciB9IGZyb20gJ3NoYXJlZC91dGlsJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBmaW5kIChcbiAgdm06IENvbXBvbmVudCB8IG51bGwsXG4gIHZub2RlOiBWTm9kZSB8IG51bGwsXG4gIGVsZW1lbnQ6IEVsZW1lbnQsXG4gIHNlbGVjdG9yOiBTZWxlY3RvclxuKTogQXJyYXk8Vk5vZGUgfCBDb21wb25lbnQ+IHtcbiAgY29uc3Qgc2VsZWN0b3JUeXBlID0gZ2V0U2VsZWN0b3JUeXBlT3JUaHJvdyhzZWxlY3RvciwgJ2ZpbmQnKVxuXG4gIGlmICghdm5vZGUgJiYgIXZtICYmIHNlbGVjdG9yVHlwZSAhPT0gRE9NX1NFTEVDVE9SKSB7XG4gICAgdGhyb3dFcnJvcignY2Fubm90IGZpbmQgYSBWdWUgaW5zdGFuY2Ugb24gYSBET00gbm9kZS4gVGhlIG5vZGUgeW91IGFyZSBjYWxsaW5nIGZpbmQgb24gZG9lcyBub3QgZXhpc3QgaW4gdGhlIFZEb20uIEFyZSB5b3UgYWRkaW5nIHRoZSBub2RlIGFzIGlubmVySFRNTD8nKVxuICB9XG5cbiAgaWYgKHNlbGVjdG9yVHlwZSA9PT0gQ09NUE9ORU5UX1NFTEVDVE9SIHx8IHNlbGVjdG9yVHlwZSA9PT0gTkFNRV9TRUxFQ1RPUikge1xuICAgIGNvbnN0IHJvb3QgPSB2bSB8fCB2bm9kZVxuICAgIGlmICghcm9vdCkge1xuICAgICAgcmV0dXJuIFtdXG4gICAgfVxuICAgIHJldHVybiBmaW5kVnVlQ29tcG9uZW50cyhyb290LCBzZWxlY3RvclR5cGUsIHNlbGVjdG9yKVxuICB9XG5cbiAgaWYgKHZtICYmIHZtLiRyZWZzICYmIHNlbGVjdG9yLnJlZiBpbiB2bS4kcmVmcyAmJiB2bS4kcmVmc1tzZWxlY3Rvci5yZWZdIGluc3RhbmNlb2YgVnVlKSB7XG4gICAgcmV0dXJuIFt2bS4kcmVmc1tzZWxlY3Rvci5yZWZdXVxuICB9XG5cbiAgaWYgKHZub2RlKSB7XG4gICAgY29uc3Qgbm9kZXMgPSBmaW5kVm5vZGVzKHZub2RlLCB2bSwgc2VsZWN0b3JUeXBlLCBzZWxlY3RvcilcbiAgICBpZiAoc2VsZWN0b3JUeXBlICE9PSBET01fU0VMRUNUT1IpIHtcbiAgICAgIHJldHVybiBub2Rlc1xuICAgIH1cbiAgICByZXR1cm4gbm9kZXMubGVuZ3RoID4gMCA/IG5vZGVzIDogZmluZERPTU5vZGVzKGVsZW1lbnQsIHNlbGVjdG9yKVxuICB9XG5cbiAgcmV0dXJuIGZpbmRET01Ob2RlcyhlbGVtZW50LCBzZWxlY3Rvcilcbn1cbiIsIi8vIEBmbG93XG5cbmltcG9ydCBWdWUgZnJvbSAndnVlJ1xuaW1wb3J0IFdyYXBwZXIgZnJvbSAnLi93cmFwcGVyJ1xuaW1wb3J0IFZ1ZVdyYXBwZXIgZnJvbSAnLi92dWUtd3JhcHBlcidcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY3JlYXRlV3JhcHBlciAoXG4gIG5vZGU6IFZOb2RlIHwgQ29tcG9uZW50LFxuICBvcHRpb25zOiBXcmFwcGVyT3B0aW9uc1xuKSB7XG4gIHJldHVybiBub2RlIGluc3RhbmNlb2YgVnVlXG4gICAgPyBuZXcgVnVlV3JhcHBlcihub2RlLCBvcHRpb25zKVxuICAgIDogbmV3IFdyYXBwZXIobm9kZSwgb3B0aW9ucylcbn1cbiIsImxldCBpID0gMFxuXG5mdW5jdGlvbiBvcmRlckRlcHMgKHdhdGNoZXIpIHtcbiAgd2F0Y2hlci5kZXBzLmZvckVhY2goZGVwID0+IHtcbiAgICBpZiAoZGVwLl9zb3J0ZWRJZCA9PT0gaSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGRlcC5fc29ydGVkSWQgPSBpXG4gICAgZGVwLnN1YnMuZm9yRWFjaChvcmRlckRlcHMpXG4gICAgZGVwLnN1YnMgPSBkZXAuc3Vicy5zb3J0KChhLCBiKSA9PiBhLmlkIC0gYi5pZClcbiAgfSlcbn1cblxuZnVuY3Rpb24gb3JkZXJWbVdhdGNoZXJzICh2bSkge1xuICBpZiAodm0uX3dhdGNoZXJzKSB7XG4gICAgdm0uX3dhdGNoZXJzLmZvckVhY2gob3JkZXJEZXBzKVxuICB9XG5cbiAgaWYgKHZtLl9jb21wdXRlZFdhdGNoZXJzKSB7XG4gICAgT2JqZWN0LmtleXModm0uX2NvbXB1dGVkV2F0Y2hlcnMpLmZvckVhY2goKGNvbXB1dGVkV2F0Y2hlcikgPT4ge1xuICAgICAgb3JkZXJEZXBzKHZtLl9jb21wdXRlZFdhdGNoZXJzW2NvbXB1dGVkV2F0Y2hlcl0pXG4gICAgfSlcbiAgfVxuXG4gIG9yZGVyRGVwcyh2bS5fd2F0Y2hlcilcblxuICB2bS4kY2hpbGRyZW4uZm9yRWFjaChvcmRlclZtV2F0Y2hlcnMpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvcmRlcldhdGNoZXJzICh2bSkge1xuICBvcmRlclZtV2F0Y2hlcnModm0pXG4gIGkrK1xufVxuIiwiLy8gQGZsb3dcblxuaW1wb3J0IFZ1ZSBmcm9tICd2dWUnXG5pbXBvcnQgZ2V0U2VsZWN0b3JUeXBlT3JUaHJvdyBmcm9tICcuL2dldC1zZWxlY3Rvci10eXBlJ1xuaW1wb3J0IHtcbiAgUkVGX1NFTEVDVE9SLFxuICBDT01QT05FTlRfU0VMRUNUT1IsXG4gIE5BTUVfU0VMRUNUT1IsXG4gIEZVTkNUSU9OQUxfT1BUSU9OU1xufSBmcm9tICcuL2NvbnN0cydcbmltcG9ydCB7XG4gIHZtQ3Rvck1hdGNoZXNOYW1lLFxuICB2bUN0b3JNYXRjaGVzU2VsZWN0b3IsXG4gIHZtRnVuY3Rpb25hbEN0b3JNYXRjaGVzU2VsZWN0b3Jcbn0gZnJvbSAnLi9maW5kLXZ1ZS1jb21wb25lbnRzJ1xuaW1wb3J0IFdyYXBwZXJBcnJheSBmcm9tICcuL3dyYXBwZXItYXJyYXknXG5pbXBvcnQgRXJyb3JXcmFwcGVyIGZyb20gJy4vZXJyb3Itd3JhcHBlcidcbmltcG9ydCB7XG4gIHRocm93RXJyb3IsXG4gIHdhcm5cbn0gZnJvbSAnc2hhcmVkL3V0aWwnXG5pbXBvcnQgZmluZEFsbCBmcm9tICcuL2ZpbmQnXG5pbXBvcnQgY3JlYXRlV3JhcHBlciBmcm9tICcuL2NyZWF0ZS13cmFwcGVyJ1xuaW1wb3J0IHtcbiAgb3JkZXJXYXRjaGVyc1xufSBmcm9tICcuL29yZGVyLXdhdGNoZXJzJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBXcmFwcGVyIGltcGxlbWVudHMgQmFzZVdyYXBwZXIge1xuICB2bm9kZTogVk5vZGUgfCBudWxsO1xuICB2bTogQ29tcG9uZW50IHwgbnVsbDtcbiAgX2VtaXR0ZWQ6IHsgW25hbWU6IHN0cmluZ106IEFycmF5PEFycmF5PGFueT4+IH07XG4gIF9lbWl0dGVkQnlPcmRlcjogQXJyYXk8eyBuYW1lOiBzdHJpbmc7IGFyZ3M6IEFycmF5PGFueT4gfT47XG4gIGlzVnVlQ29tcG9uZW50OiBib29sZWFuO1xuICBlbGVtZW50OiBFbGVtZW50O1xuICB1cGRhdGU6IEZ1bmN0aW9uO1xuICBvcHRpb25zOiBXcmFwcGVyT3B0aW9ucztcbiAgdmVyc2lvbjogbnVtYmVyO1xuICBpc0Z1bmN0aW9uYWxDb21wb25lbnQ6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3IgKG5vZGU6IFZOb2RlIHwgRWxlbWVudCwgb3B0aW9uczogV3JhcHBlck9wdGlvbnMpIHtcbiAgICBpZiAobm9kZSBpbnN0YW5jZW9mIEVsZW1lbnQpIHtcbiAgICAgIHRoaXMuZWxlbWVudCA9IG5vZGVcbiAgICAgIHRoaXMudm5vZGUgPSBudWxsXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudm5vZGUgPSBub2RlXG4gICAgICB0aGlzLmVsZW1lbnQgPSBub2RlLmVsbVxuICAgIH1cbiAgICBpZiAodGhpcy52bm9kZSAmJiAodGhpcy52bm9kZVtGVU5DVElPTkFMX09QVElPTlNdIHx8IHRoaXMudm5vZGUuZnVuY3Rpb25hbENvbnRleHQpKSB7XG4gICAgICB0aGlzLmlzRnVuY3Rpb25hbENvbXBvbmVudCA9IHRydWVcbiAgICB9XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9uc1xuICAgIHRoaXMudmVyc2lvbiA9IE51bWJlcihgJHtWdWUudmVyc2lvbi5zcGxpdCgnLicpWzBdfS4ke1Z1ZS52ZXJzaW9uLnNwbGl0KCcuJylbMV19YClcbiAgfVxuXG4gIGF0ICgpIHtcbiAgICB0aHJvd0Vycm9yKCdhdCgpIG11c3QgYmUgY2FsbGVkIG9uIGEgV3JhcHBlckFycmF5JylcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIE9iamVjdCBjb250YWluaW5nIGFsbCB0aGUgYXR0cmlidXRlL3ZhbHVlIHBhaXJzIG9uIHRoZSBlbGVtZW50LlxuICAgKi9cbiAgYXR0cmlidXRlcyAoKTogeyBbbmFtZTogc3RyaW5nXTogc3RyaW5nIH0ge1xuICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSB0aGlzLmVsZW1lbnQuYXR0cmlidXRlc1xuICAgIGNvbnN0IGF0dHJpYnV0ZU1hcCA9IHt9XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhdHRyaWJ1dGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBhdHQgPSBhdHRyaWJ1dGVzLml0ZW0oaSlcbiAgICAgIGF0dHJpYnV0ZU1hcFthdHQubG9jYWxOYW1lXSA9IGF0dC52YWx1ZVxuICAgIH1cbiAgICByZXR1cm4gYXR0cmlidXRlTWFwXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiBBcnJheSBjb250YWluaW5nIGFsbCB0aGUgY2xhc3NlcyBvbiB0aGUgZWxlbWVudFxuICAgKi9cbiAgY2xhc3NlcyAoKTogQXJyYXk8c3RyaW5nPiB7XG4gICAgLy8gd29ya3MgZm9yIEhUTUwgRWxlbWVudCBhbmQgU1ZHIEVsZW1lbnRcbiAgICBjb25zdCBjbGFzc05hbWUgPSB0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKCdjbGFzcycpXG4gICAgbGV0IGNsYXNzZXMgPSBjbGFzc05hbWUgPyBjbGFzc05hbWUuc3BsaXQoJyAnKSA6IFtdXG4gICAgLy8gSGFuZGxlIGNvbnZlcnRpbmcgY3NzbW9kdWxlcyBpZGVudGlmaWVycyBiYWNrIHRvIHRoZSBvcmlnaW5hbCBjbGFzcyBuYW1lXG4gICAgaWYgKHRoaXMudm0gJiYgdGhpcy52bS4kc3R5bGUpIHtcbiAgICAgIGNvbnN0IGNzc01vZHVsZUlkZW50aWZpZXJzID0ge31cbiAgICAgIGxldCBtb2R1bGVJZGVudFxuICAgICAgT2JqZWN0LmtleXModGhpcy52bS4kc3R5bGUpLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgICAvLyAkRmxvd0lnbm9yZSA6IEZsb3cgdGhpbmtzIHZtIGlzIGEgcHJvcGVydHlcbiAgICAgICAgbW9kdWxlSWRlbnQgPSB0aGlzLnZtLiRzdHlsZVtrZXldXG4gICAgICAgIC8vIENTUyBNb2R1bGVzIG1heSBiZSBtdWx0aS1jbGFzcyBpZiB0aGV5IGV4dGVuZCBvdGhlcnMuXG4gICAgICAgIC8vIEV4dGVuZGVkIGNsYXNzZXMgc2hvdWxkIGJlIGFscmVhZHkgcHJlc2VudCBpbiAkc3R5bGUuXG4gICAgICAgIG1vZHVsZUlkZW50ID0gbW9kdWxlSWRlbnQuc3BsaXQoJyAnKVswXVxuICAgICAgICBjc3NNb2R1bGVJZGVudGlmaWVyc1ttb2R1bGVJZGVudF0gPSBrZXlcbiAgICAgIH0pXG4gICAgICBjbGFzc2VzID0gY2xhc3Nlcy5tYXAoY2xhc3NOYW1lID0+IGNzc01vZHVsZUlkZW50aWZpZXJzW2NsYXNzTmFtZV0gfHwgY2xhc3NOYW1lKVxuICAgIH1cbiAgICByZXR1cm4gY2xhc3Nlc1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiB3cmFwcGVyIGNvbnRhaW5zIHByb3ZpZGVkIHNlbGVjdG9yLlxuICAgKi9cbiAgY29udGFpbnMgKHNlbGVjdG9yOiBTZWxlY3Rvcikge1xuICAgIGNvbnN0IHNlbGVjdG9yVHlwZSA9IGdldFNlbGVjdG9yVHlwZU9yVGhyb3coc2VsZWN0b3IsICdjb250YWlucycpXG4gICAgY29uc3Qgbm9kZXMgPSBmaW5kQWxsKHRoaXMudm0sIHRoaXMudm5vZGUsIHRoaXMuZWxlbWVudCwgc2VsZWN0b3IpXG4gICAgY29uc3QgaXMgPSBzZWxlY3RvclR5cGUgPT09IFJFRl9TRUxFQ1RPUiA/IGZhbHNlIDogdGhpcy5pcyhzZWxlY3RvcilcbiAgICByZXR1cm4gbm9kZXMubGVuZ3RoID4gMCB8fCBpc1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW4gb2JqZWN0IGNvbnRhaW5pbmcgY3VzdG9tIGV2ZW50cyBlbWl0dGVkIGJ5IHRoZSBXcmFwcGVyIHZtXG4gICAqL1xuICBlbWl0dGVkIChldmVudD86IHN0cmluZykge1xuICAgIGlmICghdGhpcy5fZW1pdHRlZCAmJiAhdGhpcy52bSkge1xuICAgICAgdGhyb3dFcnJvcignd3JhcHBlci5lbWl0dGVkKCkgY2FuIG9ubHkgYmUgY2FsbGVkIG9uIGEgVnVlIGluc3RhbmNlJylcbiAgICB9XG4gICAgaWYgKGV2ZW50KSB7XG4gICAgICByZXR1cm4gdGhpcy5fZW1pdHRlZFtldmVudF1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZWRcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIEFycmF5IGNvbnRhaW5pbmcgY3VzdG9tIGV2ZW50cyBlbWl0dGVkIGJ5IHRoZSBXcmFwcGVyIHZtXG4gICAqL1xuICBlbWl0dGVkQnlPcmRlciAoKSB7XG4gICAgaWYgKCF0aGlzLl9lbWl0dGVkQnlPcmRlciAmJiAhdGhpcy52bSkge1xuICAgICAgdGhyb3dFcnJvcignd3JhcHBlci5lbWl0dGVkQnlPcmRlcigpIGNhbiBvbmx5IGJlIGNhbGxlZCBvbiBhIFZ1ZSBpbnN0YW5jZScpXG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9lbWl0dGVkQnlPcmRlclxuICB9XG5cbiAgLyoqXG4gICAqIFV0aWxpdHkgdG8gY2hlY2sgd3JhcHBlciBleGlzdHMuIFJldHVybnMgdHJ1ZSBhcyBXcmFwcGVyIGFsd2F5cyBleGlzdHNcbiAgICovXG4gIGV4aXN0cyAoKTogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMudm0pIHtcbiAgICAgIHJldHVybiAhIXRoaXMudm0gJiYgIXRoaXMudm0uX2lzRGVzdHJveWVkXG4gICAgfVxuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICBmaWx0ZXIgKCkge1xuICAgIHRocm93RXJyb3IoJ2ZpbHRlcigpIG11c3QgYmUgY2FsbGVkIG9uIGEgV3JhcHBlckFycmF5JylcbiAgfVxuXG4gIC8qKlxuICAgKiBVdGlsaXR5IHRvIGNoZWNrIHdyYXBwZXIgaXMgdmlzaWJsZS4gUmV0dXJucyBmYWxzZSBpZiBhIHBhcmVudCBlbGVtZW50IGhhcyBkaXNwbGF5OiBub25lIG9yIHZpc2liaWxpdHk6IGhpZGRlbiBzdHlsZS5cbiAgICovXG4gIHZpc2libGUgKCk6IGJvb2xlYW4ge1xuICAgIHdhcm4oJ3Zpc2libGUgaGFzIGJlZW4gZGVwcmVjYXRlZCBhbmQgd2lsbCBiZSByZW1vdmVkIGluIHZlcnNpb24gMSwgdXNlIGlzVmlzaWJsZSBpbnN0ZWFkJylcblxuICAgIGxldCBlbGVtZW50ID0gdGhpcy5lbGVtZW50XG5cbiAgICBpZiAoIWVsZW1lbnQpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIHdoaWxlIChlbGVtZW50KSB7XG4gICAgICBpZiAoZWxlbWVudC5zdHlsZSAmJiAoZWxlbWVudC5zdHlsZS52aXNpYmlsaXR5ID09PSAnaGlkZGVuJyB8fCBlbGVtZW50LnN0eWxlLmRpc3BsYXkgPT09ICdub25lJykpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgICBlbGVtZW50ID0gZWxlbWVudC5wYXJlbnRFbGVtZW50XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgd3JhcHBlciBoYXMgYW4gYXR0cmlidXRlIHdpdGggbWF0Y2hpbmcgdmFsdWVcbiAgICovXG4gIGhhc0F0dHJpYnV0ZSAoYXR0cmlidXRlOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpIHtcbiAgICB3YXJuKCdoYXNBdHRyaWJ1dGUoKSBoYXMgYmVlbiBkZXByZWNhdGVkIGFuZCB3aWxsIGJlIHJlbW92ZWQgaW4gdmVyc2lvbiAxLjAuMC4gVXNlIGF0dHJpYnV0ZXMoKSBpbnN0ZWFk4oCUaHR0cHM6Ly92dWUtdGVzdC11dGlscy52dWVqcy5vcmcvZW4vYXBpL3dyYXBwZXIvYXR0cmlidXRlcycpXG5cbiAgICBpZiAodHlwZW9mIGF0dHJpYnV0ZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93RXJyb3IoJ3dyYXBwZXIuaGFzQXR0cmlidXRlKCkgbXVzdCBiZSBwYXNzZWQgYXR0cmlidXRlIGFzIGEgc3RyaW5nJylcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3dFcnJvcignd3JhcHBlci5oYXNBdHRyaWJ1dGUoKSBtdXN0IGJlIHBhc3NlZCB2YWx1ZSBhcyBhIHN0cmluZycpXG4gICAgfVxuXG4gICAgcmV0dXJuICEhKHRoaXMuZWxlbWVudCAmJiB0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlKGF0dHJpYnV0ZSkgPT09IHZhbHVlKVxuICB9XG5cbiAgLyoqXG4gICAqIEFzc2VydHMgd3JhcHBlciBoYXMgYSBjbGFzcyBuYW1lXG4gICAqL1xuICBoYXNDbGFzcyAoY2xhc3NOYW1lOiBzdHJpbmcpIHtcbiAgICB3YXJuKCdoYXNDbGFzcygpIGhhcyBiZWVuIGRlcHJlY2F0ZWQgYW5kIHdpbGwgYmUgcmVtb3ZlZCBpbiB2ZXJzaW9uIDEuMC4wLiBVc2UgY2xhc3NlcygpIGluc3RlYWTigJRodHRwczovL3Z1ZS10ZXN0LXV0aWxzLnZ1ZWpzLm9yZy9lbi9hcGkvd3JhcHBlci9jbGFzc2VzJylcbiAgICBsZXQgdGFyZ2V0Q2xhc3MgPSBjbGFzc05hbWVcblxuICAgIGlmICh0eXBlb2YgdGFyZ2V0Q2xhc3MgIT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvd0Vycm9yKCd3cmFwcGVyLmhhc0NsYXNzKCkgbXVzdCBiZSBwYXNzZWQgYSBzdHJpbmcnKVxuICAgIH1cblxuICAgIC8vIGlmICRzdHlsZSBpcyBhdmFpbGFibGUgYW5kIGhhcyBhIG1hdGNoaW5nIHRhcmdldCwgdXNlIHRoYXQgaW5zdGVhZC5cbiAgICBpZiAodGhpcy52bSAmJiB0aGlzLnZtLiRzdHlsZSAmJiB0aGlzLnZtLiRzdHlsZVt0YXJnZXRDbGFzc10pIHtcbiAgICAgIHRhcmdldENsYXNzID0gdGhpcy52bS4kc3R5bGVbdGFyZ2V0Q2xhc3NdXG4gICAgfVxuXG4gICAgY29uc3QgY29udGFpbnNBbGxDbGFzc2VzID0gdGFyZ2V0Q2xhc3NcbiAgICAgIC5zcGxpdCgnICcpXG4gICAgICAuZXZlcnkodGFyZ2V0ID0+IHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnModGFyZ2V0KSlcblxuICAgIHJldHVybiAhISh0aGlzLmVsZW1lbnQgJiYgY29udGFpbnNBbGxDbGFzc2VzKVxuICB9XG5cbiAgLyoqXG4gICAqIEFzc2VydHMgd3JhcHBlciBoYXMgYSBwcm9wIG5hbWVcbiAgICovXG4gIGhhc1Byb3AgKHByb3A6IHN0cmluZywgdmFsdWU6IHN0cmluZykge1xuICAgIHdhcm4oJ2hhc1Byb3AoKSBoYXMgYmVlbiBkZXByZWNhdGVkIGFuZCB3aWxsIGJlIHJlbW92ZWQgaW4gdmVyc2lvbiAxLjAuMC4gVXNlIHByb3BzKCkgaW5zdGVhZOKAlGh0dHBzOi8vdnVlLXRlc3QtdXRpbHMudnVlanMub3JnL2VuL2FwaS93cmFwcGVyL3Byb3BzJylcblxuICAgIGlmICghdGhpcy5pc1Z1ZUNvbXBvbmVudCkge1xuICAgICAgdGhyb3dFcnJvcignd3JhcHBlci5oYXNQcm9wKCkgbXVzdCBiZSBjYWxsZWQgb24gYSBWdWUgaW5zdGFuY2UnKVxuICAgIH1cbiAgICBpZiAodHlwZW9mIHByb3AgIT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvd0Vycm9yKCd3cmFwcGVyLmhhc1Byb3AoKSBtdXN0IGJlIHBhc3NlZCBwcm9wIGFzIGEgc3RyaW5nJylcbiAgICB9XG5cbiAgICAvLyAkcHJvcHMgb2JqZWN0IGRvZXMgbm90IGV4aXN0IGluIFZ1ZSAyLjEueCwgc28gdXNlICRvcHRpb25zLnByb3BzRGF0YSBpbnN0ZWFkXG4gICAgaWYgKHRoaXMudm0gJiYgdGhpcy52bS4kb3B0aW9ucyAmJiB0aGlzLnZtLiRvcHRpb25zLnByb3BzRGF0YSAmJiB0aGlzLnZtLiRvcHRpb25zLnByb3BzRGF0YVtwcm9wXSA9PT0gdmFsdWUpIHtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuXG4gICAgcmV0dXJuICEhdGhpcy52bSAmJiAhIXRoaXMudm0uJHByb3BzICYmIHRoaXMudm0uJHByb3BzW3Byb3BdID09PSB2YWx1ZVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiB3cmFwcGVyIGhhcyBhIHN0eWxlIHdpdGggdmFsdWVcbiAgICovXG4gIGhhc1N0eWxlIChzdHlsZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKSB7XG4gICAgd2FybignaGFzU3R5bGUoKSBoYXMgYmVlbiBkZXByZWNhdGVkIGFuZCB3aWxsIGJlIHJlbW92ZWQgaW4gdmVyc2lvbiAxLjAuMC4gVXNlIHdyYXBwZXIuZWxlbWVudC5zdHlsZSBpbnN0ZWFkJylcblxuICAgIGlmICh0eXBlb2Ygc3R5bGUgIT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvd0Vycm9yKCd3cmFwcGVyLmhhc1N0eWxlKCkgbXVzdCBiZSBwYXNzZWQgc3R5bGUgYXMgYSBzdHJpbmcnKVxuICAgIH1cblxuICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvd0Vycm9yKCd3cmFwcGVyLmhhc0NsYXNzKCkgbXVzdCBiZSBwYXNzZWQgdmFsdWUgYXMgc3RyaW5nJylcbiAgICB9XG5cbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIGlmIChuYXZpZ2F0b3IudXNlckFnZW50LmluY2x1ZGVzICYmIChuYXZpZ2F0b3IudXNlckFnZW50LmluY2x1ZGVzKCdub2RlLmpzJykgfHwgbmF2aWdhdG9yLnVzZXJBZ2VudC5pbmNsdWRlcygnanNkb20nKSkpIHtcbiAgICAgIGNvbnNvbGUud2Fybignd3JhcHBlci5oYXNTdHlsZSBpcyBub3QgZnVsbHkgc3VwcG9ydGVkIHdoZW4gcnVubmluZyBqc2RvbSAtIG9ubHkgaW5saW5lIHN0eWxlcyBhcmUgc3VwcG9ydGVkJykgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zb2xlXG4gICAgfVxuICAgIGNvbnN0IGJvZHkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5JylcbiAgICBjb25zdCBtb2NrRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG5cbiAgICBpZiAoIShib2R5IGluc3RhbmNlb2YgRWxlbWVudCkpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgICBjb25zdCBtb2NrTm9kZSA9IGJvZHkuaW5zZXJ0QmVmb3JlKG1vY2tFbGVtZW50LCBudWxsKVxuICAgIC8vICRGbG93SWdub3JlIDogRmxvdyB0aGlua3Mgc3R5bGVbc3R5bGVdIHJldHVybnMgYSBudW1iZXJcbiAgICBtb2NrRWxlbWVudC5zdHlsZVtzdHlsZV0gPSB2YWx1ZVxuXG4gICAgaWYgKCF0aGlzLm9wdGlvbnMuYXR0YWNoZWRUb0RvY3VtZW50ICYmICh0aGlzLnZtIHx8IHRoaXMudm5vZGUpKSB7XG4gICAgICAvLyAkRmxvd0lnbm9yZSA6IFBvc3NpYmxlIG51bGwgdmFsdWUsIHdpbGwgYmUgcmVtb3ZlZCBpbiAxLjAuMFxuICAgICAgY29uc3Qgdm0gPSB0aGlzLnZtIHx8IHRoaXMudm5vZGUuY29udGV4dC4kcm9vdFxuICAgICAgYm9keS5pbnNlcnRCZWZvcmUodm0uJHJvb3QuX3Zub2RlLmVsbSwgbnVsbClcbiAgICB9XG5cbiAgICBjb25zdCBlbFN0eWxlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUodGhpcy5lbGVtZW50KVtzdHlsZV1cbiAgICBjb25zdCBtb2NrTm9kZVN0eWxlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUobW9ja05vZGUpW3N0eWxlXVxuICAgIHJldHVybiAhIShlbFN0eWxlICYmIG1vY2tOb2RlU3R5bGUgJiYgZWxTdHlsZSA9PT0gbW9ja05vZGVTdHlsZSlcbiAgfVxuXG4gIC8qKlxuICAgKiBGaW5kcyBmaXJzdCBub2RlIGluIHRyZWUgb2YgdGhlIGN1cnJlbnQgd3JhcHBlciB0aGF0IG1hdGNoZXMgdGhlIHByb3ZpZGVkIHNlbGVjdG9yLlxuICAgKi9cbiAgZmluZCAoc2VsZWN0b3I6IFNlbGVjdG9yKTogV3JhcHBlciB8IEVycm9yV3JhcHBlciB7XG4gICAgY29uc3Qgbm9kZXMgPSBmaW5kQWxsKHRoaXMudm0sIHRoaXMudm5vZGUsIHRoaXMuZWxlbWVudCwgc2VsZWN0b3IpXG4gICAgaWYgKG5vZGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgaWYgKHNlbGVjdG9yLnJlZikge1xuICAgICAgICByZXR1cm4gbmV3IEVycm9yV3JhcHBlcihgcmVmPVwiJHtzZWxlY3Rvci5yZWZ9XCJgKVxuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBFcnJvcldyYXBwZXIodHlwZW9mIHNlbGVjdG9yID09PSAnc3RyaW5nJyA/IHNlbGVjdG9yIDogJ0NvbXBvbmVudCcpXG4gICAgfVxuICAgIHJldHVybiBjcmVhdGVXcmFwcGVyKG5vZGVzWzBdLCB0aGlzLm9wdGlvbnMpXG4gIH1cblxuICAvKipcbiAgICogRmluZHMgbm9kZSBpbiB0cmVlIG9mIHRoZSBjdXJyZW50IHdyYXBwZXIgdGhhdCBtYXRjaGVzIHRoZSBwcm92aWRlZCBzZWxlY3Rvci5cbiAgICovXG4gIGZpbmRBbGwgKHNlbGVjdG9yOiBTZWxlY3Rvcik6IFdyYXBwZXJBcnJheSB7XG4gICAgZ2V0U2VsZWN0b3JUeXBlT3JUaHJvdyhzZWxlY3RvciwgJ2ZpbmRBbGwnKVxuICAgIGNvbnN0IG5vZGVzID0gZmluZEFsbCh0aGlzLnZtLCB0aGlzLnZub2RlLCB0aGlzLmVsZW1lbnQsIHNlbGVjdG9yKVxuICAgIGNvbnN0IHdyYXBwZXJzID0gbm9kZXMubWFwKG5vZGUgPT5cbiAgICAgIGNyZWF0ZVdyYXBwZXIobm9kZSwgdGhpcy5vcHRpb25zKVxuICAgIClcbiAgICByZXR1cm4gbmV3IFdyYXBwZXJBcnJheSh3cmFwcGVycylcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIEhUTUwgb2YgZWxlbWVudCBhcyBhIHN0cmluZ1xuICAgKi9cbiAgaHRtbCAoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50Lm91dGVySFRNTFxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiBub2RlIG1hdGNoZXMgc2VsZWN0b3JcbiAgICovXG4gIGlzIChzZWxlY3RvcjogU2VsZWN0b3IpOiBib29sZWFuIHtcbiAgICBjb25zdCBzZWxlY3RvclR5cGUgPSBnZXRTZWxlY3RvclR5cGVPclRocm93KHNlbGVjdG9yLCAnaXMnKVxuXG4gICAgaWYgKHNlbGVjdG9yVHlwZSA9PT0gTkFNRV9TRUxFQ1RPUikge1xuICAgICAgaWYgKCF0aGlzLnZtKSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgICAgcmV0dXJuIHZtQ3Rvck1hdGNoZXNOYW1lKHRoaXMudm0sIHNlbGVjdG9yLm5hbWUpXG4gICAgfVxuXG4gICAgaWYgKHNlbGVjdG9yVHlwZSA9PT0gQ09NUE9ORU5UX1NFTEVDVE9SKSB7XG4gICAgICBpZiAoIXRoaXMudm0pIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgICBpZiAoc2VsZWN0b3IuZnVuY3Rpb25hbCkge1xuICAgICAgICByZXR1cm4gdm1GdW5jdGlvbmFsQ3Rvck1hdGNoZXNTZWxlY3Rvcih0aGlzLnZtLl92bm9kZSwgc2VsZWN0b3IuX0N0b3IpXG4gICAgICB9XG4gICAgICByZXR1cm4gdm1DdG9yTWF0Y2hlc1NlbGVjdG9yKHRoaXMudm0sIHNlbGVjdG9yKVxuICAgIH1cblxuICAgIGlmIChzZWxlY3RvclR5cGUgPT09IFJFRl9TRUxFQ1RPUikge1xuICAgICAgdGhyb3dFcnJvcignJHJlZiBzZWxlY3RvcnMgY2FuIG5vdCBiZSB1c2VkIHdpdGggd3JhcHBlci5pcygpJylcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHNlbGVjdG9yID09PSAnb2JqZWN0Jykge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgcmV0dXJuICEhKHRoaXMuZWxlbWVudCAmJlxuICAgIHRoaXMuZWxlbWVudC5nZXRBdHRyaWJ1dGUgJiZcbiAgICB0aGlzLmVsZW1lbnQubWF0Y2hlcyhzZWxlY3RvcikpXG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIGlmIG5vZGUgaXMgZW1wdHlcbiAgICovXG4gIGlzRW1wdHkgKCk6IGJvb2xlYW4ge1xuICAgIGlmICghdGhpcy52bm9kZSkge1xuICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudC5pbm5lckhUTUwgPT09ICcnXG4gICAgfVxuICAgIGlmICh0aGlzLnZub2RlLmNoaWxkcmVuKSB7XG4gICAgICByZXR1cm4gdGhpcy52bm9kZS5jaGlsZHJlbi5ldmVyeSh2bm9kZSA9PiB2bm9kZS5pc0NvbW1lbnQpXG4gICAgfVxuICAgIHJldHVybiB0aGlzLnZub2RlLmNoaWxkcmVuID09PSB1bmRlZmluZWQgfHwgdGhpcy52bm9kZS5jaGlsZHJlbi5sZW5ndGggPT09IDBcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgbm9kZSBpcyB2aXNpYmxlXG4gICAqL1xuICBpc1Zpc2libGUgKCk6IGJvb2xlYW4ge1xuICAgIGxldCBlbGVtZW50ID0gdGhpcy5lbGVtZW50XG5cbiAgICBpZiAoIWVsZW1lbnQpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIHdoaWxlIChlbGVtZW50KSB7XG4gICAgICBpZiAoZWxlbWVudC5zdHlsZSAmJiAoZWxlbWVudC5zdHlsZS52aXNpYmlsaXR5ID09PSAnaGlkZGVuJyB8fCBlbGVtZW50LnN0eWxlLmRpc3BsYXkgPT09ICdub25lJykpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgICBlbGVtZW50ID0gZWxlbWVudC5wYXJlbnRFbGVtZW50XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgd3JhcHBlciBpcyBhIHZ1ZSBpbnN0YW5jZVxuICAgKi9cbiAgaXNWdWVJbnN0YW5jZSAoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICEhdGhpcy5pc1Z1ZUNvbXBvbmVudFxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgbmFtZSBvZiBjb21wb25lbnQsIG9yIHRhZyBuYW1lIGlmIG5vZGUgaXMgbm90IGEgVnVlIGNvbXBvbmVudFxuICAgKi9cbiAgbmFtZSAoKTogc3RyaW5nIHtcbiAgICBpZiAodGhpcy52bSkge1xuICAgICAgcmV0dXJuIHRoaXMudm0uJG9wdGlvbnMubmFtZVxuICAgIH1cblxuICAgIGlmICghdGhpcy52bm9kZSkge1xuICAgICAgcmV0dXJuIHRoaXMuZWxlbWVudC50YWdOYW1lXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMudm5vZGUudGFnXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiBPYmplY3QgY29udGFpbmluZyB0aGUgcHJvcCBuYW1lL3ZhbHVlIHBhaXJzIG9uIHRoZSBlbGVtZW50XG4gICAqL1xuICBwcm9wcyAoKTogeyBbbmFtZTogc3RyaW5nXTogYW55IH0ge1xuICAgIGlmICh0aGlzLmlzRnVuY3Rpb25hbENvbXBvbmVudCkge1xuICAgICAgdGhyb3dFcnJvcignd3JhcHBlci5wcm9wcygpIGNhbm5vdCBiZSBjYWxsZWQgb24gYSBtb3VudGVkIGZ1bmN0aW9uYWwgY29tcG9uZW50LicpXG4gICAgfVxuICAgIGlmICghdGhpcy52bSkge1xuICAgICAgdGhyb3dFcnJvcignd3JhcHBlci5wcm9wcygpIG11c3QgYmUgY2FsbGVkIG9uIGEgVnVlIGluc3RhbmNlJylcbiAgICB9XG4gICAgLy8gJHByb3BzIG9iamVjdCBkb2VzIG5vdCBleGlzdCBpbiBWdWUgMi4xLngsIHNvIHVzZSAkb3B0aW9ucy5wcm9wc0RhdGEgaW5zdGVhZFxuICAgIGxldCBfcHJvcHNcbiAgICBpZiAodGhpcy52bSAmJiB0aGlzLnZtLiRvcHRpb25zICYmIHRoaXMudm0uJG9wdGlvbnMucHJvcHNEYXRhKSB7XG4gICAgICBfcHJvcHMgPSB0aGlzLnZtLiRvcHRpb25zLnByb3BzRGF0YVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyAkRmxvd0lnbm9yZVxuICAgICAgX3Byb3BzID0gdGhpcy52bS4kcHJvcHNcbiAgICB9XG4gICAgcmV0dXJuIF9wcm9wcyB8fCB7fSAvLyBSZXR1cm4gYW4gZW1wdHkgb2JqZWN0IGlmIG5vIHByb3BzIGV4aXN0XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB2bSBkYXRhXG4gICAqL1xuICBzZXREYXRhIChkYXRhOiBPYmplY3QpIHtcbiAgICBpZiAodGhpcy5pc0Z1bmN0aW9uYWxDb21wb25lbnQpIHtcbiAgICAgIHRocm93RXJyb3IoJ3dyYXBwZXIuc2V0RGF0YSgpIGNhbm90IGJlIGNhbGxlZCBvbiBhIGZ1bmN0aW9uYWwgY29tcG9uZW50JylcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMudm0pIHtcbiAgICAgIHRocm93RXJyb3IoJ3dyYXBwZXIuc2V0RGF0YSgpIGNhbiBvbmx5IGJlIGNhbGxlZCBvbiBhIFZ1ZSBpbnN0YW5jZScpXG4gICAgfVxuXG4gICAgT2JqZWN0LmtleXMoZGF0YSkuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAvLyAkRmxvd0lnbm9yZSA6IFByb2JsZW0gd2l0aCBwb3NzaWJseSBudWxsIHRoaXMudm1cbiAgICAgIHRoaXMudm0uJHNldCh0aGlzLnZtLCBba2V5XSwgZGF0YVtrZXldKVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogU2V0cyB2bSBjb21wdXRlZFxuICAgKi9cbiAgc2V0Q29tcHV0ZWQgKGNvbXB1dGVkOiBPYmplY3QpIHtcbiAgICBpZiAoIXRoaXMuaXNWdWVDb21wb25lbnQpIHtcbiAgICAgIHRocm93RXJyb3IoJ3dyYXBwZXIuc2V0Q29tcHV0ZWQoKSBjYW4gb25seSBiZSBjYWxsZWQgb24gYSBWdWUgaW5zdGFuY2UnKVxuICAgIH1cblxuICAgIHdhcm4oJ3NldENvbXB1dGVkKCkgaGFzIGJlZW4gZGVwcmVjYXRlZCBhbmQgd2lsbCBiZSByZW1vdmVkIGluIHZlcnNpb24gMS4wLjAuIFlvdSBjYW4gb3ZlcndyaXRlIGNvbXB1dGVkIHByb3BlcnRpZXMgYnkgcGFzc2luZyBhIGNvbXB1dGVkIG9iamVjdCBpbiB0aGUgbW91bnRpbmcgb3B0aW9ucycpXG5cbiAgICBPYmplY3Qua2V5cyhjb21wdXRlZCkuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICBpZiAodGhpcy52ZXJzaW9uID4gMi4xKSB7XG4gICAgICAgIC8vICRGbG93SWdub3JlIDogUHJvYmxlbSB3aXRoIHBvc3NpYmx5IG51bGwgdGhpcy52bVxuICAgICAgICBpZiAoIXRoaXMudm0uX2NvbXB1dGVkV2F0Y2hlcnNba2V5XSkge1xuICAgICAgICAgIHRocm93RXJyb3IoYHdyYXBwZXIuc2V0Q29tcHV0ZWQoKSB3YXMgcGFzc2VkIGEgdmFsdWUgdGhhdCBkb2VzIG5vdCBleGlzdCBhcyBhIGNvbXB1dGVkIHByb3BlcnR5IG9uIHRoZSBWdWUgaW5zdGFuY2UuIFByb3BlcnR5ICR7a2V5fSBkb2VzIG5vdCBleGlzdCBvbiB0aGUgVnVlIGluc3RhbmNlYClcbiAgICAgICAgfVxuICAgICAgICAvLyAkRmxvd0lnbm9yZSA6IFByb2JsZW0gd2l0aCBwb3NzaWJseSBudWxsIHRoaXMudm1cbiAgICAgICAgdGhpcy52bS5fY29tcHV0ZWRXYXRjaGVyc1trZXldLnZhbHVlID0gY29tcHV0ZWRba2V5XVxuICAgICAgICAvLyAkRmxvd0lnbm9yZSA6IFByb2JsZW0gd2l0aCBwb3NzaWJseSBudWxsIHRoaXMudm1cbiAgICAgICAgdGhpcy52bS5fY29tcHV0ZWRXYXRjaGVyc1trZXldLmdldHRlciA9ICgpID0+IGNvbXB1dGVkW2tleV1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCBpc1N0b3JlID0gZmFsc2VcbiAgICAgICAgLy8gJEZsb3dJZ25vcmUgOiBQcm9ibGVtIHdpdGggcG9zc2libHkgbnVsbCB0aGlzLnZtXG4gICAgICAgIHRoaXMudm0uX3dhdGNoZXJzLmZvckVhY2god2F0Y2hlciA9PiB7XG4gICAgICAgICAgaWYgKHdhdGNoZXIuZ2V0dGVyLnZ1ZXggJiYga2V5IGluIHdhdGNoZXIudm0uJG9wdGlvbnMuc3RvcmUuZ2V0dGVycykge1xuICAgICAgICAgICAgd2F0Y2hlci52bS4kb3B0aW9ucy5zdG9yZS5nZXR0ZXJzID0ge1xuICAgICAgICAgICAgICAuLi53YXRjaGVyLnZtLiRvcHRpb25zLnN0b3JlLmdldHRlcnNcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh3YXRjaGVyLnZtLiRvcHRpb25zLnN0b3JlLmdldHRlcnMsIGtleSwgeyBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIGNvbXB1dGVkW2tleV0gfSB9KVxuICAgICAgICAgICAgaXNTdG9yZSA9IHRydWVcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG5cbiAgICAgICAgLy8gJEZsb3dJZ25vcmUgOiBQcm9ibGVtIHdpdGggcG9zc2libHkgbnVsbCB0aGlzLnZtXG4gICAgICAgIGlmICghaXNTdG9yZSAmJiAhdGhpcy52bS5fd2F0Y2hlcnMuc29tZSh3ID0+IHcuZ2V0dGVyLm5hbWUgPT09IGtleSkpIHtcbiAgICAgICAgICB0aHJvd0Vycm9yKGB3cmFwcGVyLnNldENvbXB1dGVkKCkgd2FzIHBhc3NlZCBhIHZhbHVlIHRoYXQgZG9lcyBub3QgZXhpc3QgYXMgYSBjb21wdXRlZCBwcm9wZXJ0eSBvbiB0aGUgVnVlIGluc3RhbmNlLiBQcm9wZXJ0eSAke2tleX0gZG9lcyBub3QgZXhpc3Qgb24gdGhlIFZ1ZSBpbnN0YW5jZWApXG4gICAgICAgIH1cbiAgICAgICAgLy8gJEZsb3dJZ25vcmUgOiBQcm9ibGVtIHdpdGggcG9zc2libHkgbnVsbCB0aGlzLnZtXG4gICAgICAgIHRoaXMudm0uX3dhdGNoZXJzLmZvckVhY2goKHdhdGNoZXIpID0+IHtcbiAgICAgICAgICBpZiAod2F0Y2hlci5nZXR0ZXIubmFtZSA9PT0ga2V5KSB7XG4gICAgICAgICAgICB3YXRjaGVyLnZhbHVlID0gY29tcHV0ZWRba2V5XVxuICAgICAgICAgICAgd2F0Y2hlci5nZXR0ZXIgPSAoKSA9PiBjb21wdXRlZFtrZXldXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH0pXG4gICAgLy8gJEZsb3dJZ25vcmUgOiBQcm9ibGVtIHdpdGggcG9zc2libHkgbnVsbCB0aGlzLnZtXG4gICAgdGhpcy52bS5fd2F0Y2hlcnMuZm9yRWFjaCgod2F0Y2hlcikgPT4ge1xuICAgICAgd2F0Y2hlci5ydW4oKVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogU2V0cyB2bSBtZXRob2RzXG4gICAqL1xuICBzZXRNZXRob2RzIChtZXRob2RzOiBPYmplY3QpIHtcbiAgICBpZiAoIXRoaXMuaXNWdWVDb21wb25lbnQpIHtcbiAgICAgIHRocm93RXJyb3IoJ3dyYXBwZXIuc2V0TWV0aG9kcygpIGNhbiBvbmx5IGJlIGNhbGxlZCBvbiBhIFZ1ZSBpbnN0YW5jZScpXG4gICAgfVxuICAgIE9iamVjdC5rZXlzKG1ldGhvZHMpLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgLy8gJEZsb3dJZ25vcmUgOiBQcm9ibGVtIHdpdGggcG9zc2libHkgbnVsbCB0aGlzLnZtXG4gICAgICB0aGlzLnZtW2tleV0gPSBtZXRob2RzW2tleV1cbiAgICAgIC8vICRGbG93SWdub3JlIDogUHJvYmxlbSB3aXRoIHBvc3NpYmx5IG51bGwgdGhpcy52bVxuICAgICAgdGhpcy52bS4kb3B0aW9ucy5tZXRob2RzW2tleV0gPSBtZXRob2RzW2tleV1cbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdm0gcHJvcHNcbiAgICovXG4gIHNldFByb3BzIChkYXRhOiBPYmplY3QpIHtcbiAgICBpZiAodGhpcy5pc0Z1bmN0aW9uYWxDb21wb25lbnQpIHtcbiAgICAgIHRocm93RXJyb3IoJ3dyYXBwZXIuc2V0UHJvcHMoKSBjYW5vdCBiZSBjYWxsZWQgb24gYSBmdW5jdGlvbmFsIGNvbXBvbmVudCcpXG4gICAgfVxuICAgIGlmICghdGhpcy5pc1Z1ZUNvbXBvbmVudCB8fCAhdGhpcy52bSkge1xuICAgICAgdGhyb3dFcnJvcignd3JhcHBlci5zZXRQcm9wcygpIGNhbiBvbmx5IGJlIGNhbGxlZCBvbiBhIFZ1ZSBpbnN0YW5jZScpXG4gICAgfVxuICAgIGlmICh0aGlzLnZtICYmIHRoaXMudm0uJG9wdGlvbnMgJiYgIXRoaXMudm0uJG9wdGlvbnMucHJvcHNEYXRhKSB7XG4gICAgICB0aGlzLnZtLiRvcHRpb25zLnByb3BzRGF0YSA9IHt9XG4gICAgfVxuICAgIE9iamVjdC5rZXlzKGRhdGEpLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgLy8gSWdub3JlIHByb3BlcnRpZXMgdGhhdCB3ZXJlIG5vdCBzcGVjaWZpZWQgaW4gdGhlIGNvbXBvbmVudCBvcHRpb25zXG4gICAgICAvLyAkRmxvd0lnbm9yZSA6IFByb2JsZW0gd2l0aCBwb3NzaWJseSBudWxsIHRoaXMudm1cbiAgICAgIGlmICghdGhpcy52bS4kb3B0aW9ucy5fcHJvcEtleXMgfHwgIXRoaXMudm0uJG9wdGlvbnMuX3Byb3BLZXlzLmluY2x1ZGVzKGtleSkpIHtcbiAgICAgICAgdGhyb3dFcnJvcihgd3JhcHBlci5zZXRQcm9wcygpIGNhbGxlZCB3aXRoICR7a2V5fSBwcm9wZXJ0eSB3aGljaCBpcyBub3QgZGVmaW5lZCBvbiBjb21wb25lbnRgKVxuICAgICAgfVxuXG4gICAgICAvLyAkRmxvd0lnbm9yZSA6IFByb2JsZW0gd2l0aCBwb3NzaWJseSBudWxsIHRoaXMudm1cbiAgICAgIGlmICh0aGlzLnZtLl9wcm9wcykge1xuICAgICAgICB0aGlzLnZtLl9wcm9wc1trZXldID0gZGF0YVtrZXldXG4gICAgICAgIC8vICRGbG93SWdub3JlIDogUHJvYmxlbSB3aXRoIHBvc3NpYmx5IG51bGwgdGhpcy52bS4kcHJvcHNcbiAgICAgICAgdGhpcy52bS4kcHJvcHNba2V5XSA9IGRhdGFba2V5XVxuICAgICAgICAvLyAkRmxvd0lnbm9yZSA6IFByb2JsZW0gd2l0aCBwb3NzaWJseSBudWxsIHRoaXMudm0uJG9wdGlvbnNcbiAgICAgICAgdGhpcy52bS4kb3B0aW9ucy5wcm9wc0RhdGFba2V5XSA9IGRhdGFba2V5XVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gJEZsb3dJZ25vcmUgOiBQcm9ibGVtIHdpdGggcG9zc2libHkgbnVsbCB0aGlzLnZtXG4gICAgICAgIHRoaXMudm1ba2V5XSA9IGRhdGFba2V5XVxuICAgICAgICAvLyAkRmxvd0lnbm9yZSA6IFByb2JsZW0gd2l0aCBwb3NzaWJseSBudWxsIHRoaXMudm0uJG9wdGlvbnNcbiAgICAgICAgdGhpcy52bS4kb3B0aW9ucy5wcm9wc0RhdGFba2V5XSA9IGRhdGFba2V5XVxuICAgICAgfVxuICAgIH0pXG5cbiAgICAvLyAkRmxvd0lnbm9yZSA6IFByb2JsZW0gd2l0aCBwb3NzaWJseSBudWxsIHRoaXMudm1cbiAgICB0aGlzLnZub2RlID0gdGhpcy52bS5fdm5vZGVcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gdGV4dCBvZiB3cmFwcGVyIGVsZW1lbnRcbiAgICovXG4gIHRleHQgKCk6IHN0cmluZyB7XG4gICAgaWYgKCF0aGlzLmVsZW1lbnQpIHtcbiAgICAgIHRocm93RXJyb3IoJ2Nhbm5vdCBjYWxsIHdyYXBwZXIudGV4dCgpIG9uIGEgd3JhcHBlciB3aXRob3V0IGFuIGVsZW1lbnQnKVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmVsZW1lbnQudGV4dENvbnRlbnQudHJpbSgpXG4gIH1cblxuICAvKipcbiAgICogQ2FsbHMgZGVzdHJveSBvbiB2bVxuICAgKi9cbiAgZGVzdHJveSAoKSB7XG4gICAgaWYgKCF0aGlzLmlzVnVlQ29tcG9uZW50KSB7XG4gICAgICB0aHJvd0Vycm9yKCd3cmFwcGVyLmRlc3Ryb3koKSBjYW4gb25seSBiZSBjYWxsZWQgb24gYSBWdWUgaW5zdGFuY2UnKVxuICAgIH1cblxuICAgIGlmICh0aGlzLmVsZW1lbnQucGFyZW50Tm9kZSkge1xuICAgICAgdGhpcy5lbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5lbGVtZW50KVxuICAgIH1cbiAgICAvLyAkRmxvd0lnbm9yZVxuICAgIHRoaXMudm0uJGRlc3Ryb3koKVxuICB9XG5cbiAgLyoqXG4gICAqIERpc3BhdGNoZXMgYSBET00gZXZlbnQgb24gd3JhcHBlclxuICAgKi9cbiAgdHJpZ2dlciAodHlwZTogc3RyaW5nLCBvcHRpb25zOiBPYmplY3QgPSB7fSkge1xuICAgIGlmICh0eXBlb2YgdHlwZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93RXJyb3IoJ3dyYXBwZXIudHJpZ2dlcigpIG11c3QgYmUgcGFzc2VkIGEgc3RyaW5nJylcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuZWxlbWVudCkge1xuICAgICAgdGhyb3dFcnJvcignY2Fubm90IGNhbGwgd3JhcHBlci50cmlnZ2VyKCkgb24gYSB3cmFwcGVyIHdpdGhvdXQgYW4gZWxlbWVudCcpXG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnMudGFyZ2V0KSB7XG4gICAgICB0aHJvd0Vycm9yKCd5b3UgY2Fubm90IHNldCB0aGUgdGFyZ2V0IHZhbHVlIG9mIGFuIGV2ZW50LiBTZWUgdGhlIG5vdGVzIHNlY3Rpb24gb2YgdGhlIGRvY3MgZm9yIG1vcmUgZGV0YWlsc+KAlGh0dHBzOi8vdnVlLXRlc3QtdXRpbHMudnVlanMub3JnL2VuL2FwaS93cmFwcGVyL3RyaWdnZXIuaHRtbCcpXG4gICAgfVxuXG4gICAgLy8gRG9uJ3QgZmlyZSBldmVudCBvbiBhIGRpc2FibGVkIGVsZW1lbnRcbiAgICBpZiAodGhpcy5hdHRyaWJ1dGVzKCkuZGlzYWJsZWQpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnN0IG1vZGlmaWVycyA9IHtcbiAgICAgIGVudGVyOiAxMyxcbiAgICAgIHRhYjogOSxcbiAgICAgIGRlbGV0ZTogNDYsXG4gICAgICBlc2M6IDI3LFxuICAgICAgc3BhY2U6IDMyLFxuICAgICAgdXA6IDM4LFxuICAgICAgZG93bjogNDAsXG4gICAgICBsZWZ0OiAzNyxcbiAgICAgIHJpZ2h0OiAzOSxcbiAgICAgIGVuZDogMzUsXG4gICAgICBob21lOiAzNixcbiAgICAgIGJhY2tzcGFjZTogOCxcbiAgICAgIGluc2VydDogNDUsXG4gICAgICBwYWdldXA6IDMzLFxuICAgICAgcGFnZWRvd246IDM0XG4gICAgfVxuXG4gICAgY29uc3QgZXZlbnQgPSB0eXBlLnNwbGl0KCcuJylcblxuICAgIGxldCBldmVudE9iamVjdFxuXG4gICAgLy8gRmFsbGJhY2sgZm9yIElFMTAsMTEgLSBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8yNjU5NjEyM1xuICAgIGlmICh0eXBlb2YgKHdpbmRvdy5FdmVudCkgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGV2ZW50T2JqZWN0ID0gbmV3IHdpbmRvdy5FdmVudChldmVudFswXSwge1xuICAgICAgICBidWJibGVzOiB0cnVlLFxuICAgICAgICBjYW5jZWxhYmxlOiB0cnVlXG4gICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICBldmVudE9iamVjdCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdFdmVudCcpXG4gICAgICBldmVudE9iamVjdC5pbml0RXZlbnQoZXZlbnRbMF0sIHRydWUsIHRydWUpXG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnMpIHtcbiAgICAgIE9iamVjdC5rZXlzKG9wdGlvbnMpLmZvckVhY2goa2V5ID0+IHtcbiAgICAgICAgLy8gJEZsb3dJZ25vcmVcbiAgICAgICAgZXZlbnRPYmplY3Rba2V5XSA9IG9wdGlvbnNba2V5XVxuICAgICAgfSlcbiAgICB9XG5cbiAgICBpZiAoZXZlbnQubGVuZ3RoID09PSAyKSB7XG4gICAgICAvLyAkRmxvd0lnbm9yZVxuICAgICAgZXZlbnRPYmplY3Qua2V5Q29kZSA9IG1vZGlmaWVyc1tldmVudFsxXV1cbiAgICB9XG5cbiAgICB0aGlzLmVsZW1lbnQuZGlzcGF0Y2hFdmVudChldmVudE9iamVjdClcbiAgICBpZiAodGhpcy52bm9kZSkge1xuICAgICAgb3JkZXJXYXRjaGVycyh0aGlzLnZtIHx8IHRoaXMudm5vZGUuY29udGV4dC4kcm9vdClcbiAgICB9XG4gIH1cblxuICB1cGRhdGUgKCkge1xuICAgIHdhcm4oJ3VwZGF0ZSBoYXMgYmVlbiByZW1vdmVkIGZyb20gdnVlLXRlc3QtdXRpbHMuIEFsbCB1cGRhdGVzIGFyZSBub3cgc3luY2hyb25vdXMgYnkgZGVmYXVsdCcpXG4gIH1cbn1cbiIsImZ1bmN0aW9uIHNldERlcHNTeW5jIChkZXApIHtcbiAgZGVwLnN1YnMuZm9yRWFjaChzZXRXYXRjaGVyU3luYylcbn1cblxuZnVuY3Rpb24gc2V0V2F0Y2hlclN5bmMgKHdhdGNoZXIpIHtcbiAgaWYgKHdhdGNoZXIuc3luYyA9PT0gdHJ1ZSkge1xuICAgIHJldHVyblxuICB9XG4gIHdhdGNoZXIuc3luYyA9IHRydWVcbiAgd2F0Y2hlci5kZXBzLmZvckVhY2goc2V0RGVwc1N5bmMpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRXYXRjaGVyc1RvU3luYyAodm0pIHtcbiAgaWYgKHZtLl93YXRjaGVycykge1xuICAgIHZtLl93YXRjaGVycy5mb3JFYWNoKHNldFdhdGNoZXJTeW5jKVxuICB9XG5cbiAgaWYgKHZtLl9jb21wdXRlZFdhdGNoZXJzKSB7XG4gICAgT2JqZWN0LmtleXModm0uX2NvbXB1dGVkV2F0Y2hlcnMpLmZvckVhY2goKGNvbXB1dGVkV2F0Y2hlcikgPT4ge1xuICAgICAgc2V0V2F0Y2hlclN5bmModm0uX2NvbXB1dGVkV2F0Y2hlcnNbY29tcHV0ZWRXYXRjaGVyXSlcbiAgICB9KVxuICB9XG5cbiAgc2V0V2F0Y2hlclN5bmModm0uX3dhdGNoZXIpXG5cbiAgdm0uJGNoaWxkcmVuLmZvckVhY2goc2V0V2F0Y2hlcnNUb1N5bmMpXG59XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgV3JhcHBlciBmcm9tICcuL3dyYXBwZXInXG5pbXBvcnQgeyBzZXRXYXRjaGVyc1RvU3luYyB9IGZyb20gJy4vc2V0LXdhdGNoZXJzLXRvLXN5bmMnXG5pbXBvcnQgeyBvcmRlcldhdGNoZXJzIH0gZnJvbSAnLi9vcmRlci13YXRjaGVycydcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVnVlV3JhcHBlciBleHRlbmRzIFdyYXBwZXIgaW1wbGVtZW50cyBCYXNlV3JhcHBlciB7XG4gIGNvbnN0cnVjdG9yICh2bTogQ29tcG9uZW50LCBvcHRpb25zOiBXcmFwcGVyT3B0aW9ucykge1xuICAgIHN1cGVyKHZtLl92bm9kZSwgb3B0aW9ucylcblxuICAgIC8vICRGbG93SWdub3JlIDogaXNzdWUgd2l0aCBkZWZpbmVQcm9wZXJ0eSAtIGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9mbG93L2lzc3Vlcy8yODVcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3Zub2RlJywgKHtcbiAgICAgIGdldDogKCkgPT4gdm0uX3Zub2RlLFxuICAgICAgc2V0OiAoKSA9PiB7fVxuICAgIH0pKVxuICAgIC8vICRGbG93SWdub3JlXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdlbGVtZW50JywgKHtcbiAgICAgIGdldDogKCkgPT4gdm0uJGVsLFxuICAgICAgc2V0OiAoKSA9PiB7fVxuICAgIH0pKVxuICAgIHRoaXMudm0gPSB2bVxuICAgIGlmIChvcHRpb25zLnN5bmMpIHtcbiAgICAgIHNldFdhdGNoZXJzVG9TeW5jKHZtKVxuICAgICAgb3JkZXJXYXRjaGVycyh2bSlcbiAgICB9XG4gICAgdGhpcy5pc1Z1ZUNvbXBvbmVudCA9IHRydWVcbiAgICB0aGlzLmlzRnVuY3Rpb25hbENvbXBvbmVudCA9IHZtLiRvcHRpb25zLl9pc0Z1bmN0aW9uYWxDb250YWluZXJcbiAgICB0aGlzLl9lbWl0dGVkID0gdm0uX19lbWl0dGVkXG4gICAgdGhpcy5fZW1pdHRlZEJ5T3JkZXIgPSB2bS5fX2VtaXR0ZWRCeU9yZGVyXG4gIH1cbn1cbiIsIi8vIEBmbG93XG5cbmltcG9ydCB7IHRocm93RXJyb3IgfSBmcm9tICdzaGFyZWQvdXRpbCdcblxuZnVuY3Rpb24gaXNWYWxpZFNsb3QgKHNsb3Q6IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gQXJyYXkuaXNBcnJheShzbG90KSB8fCAoc2xvdCAhPT0gbnVsbCAmJiB0eXBlb2Ygc2xvdCA9PT0gJ29iamVjdCcpIHx8IHR5cGVvZiBzbG90ID09PSAnc3RyaW5nJ1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVTbG90cyAoc2xvdHM6IE9iamVjdCk6IHZvaWQge1xuICBzbG90cyAmJiBPYmplY3Qua2V5cyhzbG90cykuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgaWYgKCFpc1ZhbGlkU2xvdChzbG90c1trZXldKSkge1xuICAgICAgdGhyb3dFcnJvcignc2xvdHNba2V5XSBtdXN0IGJlIGEgQ29tcG9uZW50LCBzdHJpbmcgb3IgYW4gYXJyYXkgb2YgQ29tcG9uZW50cycpXG4gICAgfVxuXG4gICAgaWYgKEFycmF5LmlzQXJyYXkoc2xvdHNba2V5XSkpIHtcbiAgICAgIHNsb3RzW2tleV0uZm9yRWFjaCgoc2xvdFZhbHVlKSA9PiB7XG4gICAgICAgIGlmICghaXNWYWxpZFNsb3Qoc2xvdFZhbHVlKSkge1xuICAgICAgICAgIHRocm93RXJyb3IoJ3Nsb3RzW2tleV0gbXVzdCBiZSBhIENvbXBvbmVudCwgc3RyaW5nIG9yIGFuIGFycmF5IG9mIENvbXBvbmVudHMnKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cbiAgfSlcbn1cbiIsIi8vIEBmbG93XG5cbmltcG9ydCB7IGNvbXBpbGVUb0Z1bmN0aW9ucyB9IGZyb20gJ3Z1ZS10ZW1wbGF0ZS1jb21waWxlcidcbmltcG9ydCB7IHRocm93RXJyb3IgfSBmcm9tICdzaGFyZWQvdXRpbCdcbmltcG9ydCB7IHZhbGlkYXRlU2xvdHMgfSBmcm9tICcuL3ZhbGlkYXRlLXNsb3RzJ1xuXG5mdW5jdGlvbiBhZGRTbG90VG9WbSAodm06IENvbXBvbmVudCwgc2xvdE5hbWU6IHN0cmluZywgc2xvdFZhbHVlOiBDb21wb25lbnQgfCBzdHJpbmcgfCBBcnJheTxDb21wb25lbnQ+IHwgQXJyYXk8c3RyaW5nPik6IHZvaWQge1xuICBsZXQgZWxlbVxuICBpZiAodHlwZW9mIHNsb3RWYWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICBpZiAoIWNvbXBpbGVUb0Z1bmN0aW9ucykge1xuICAgICAgdGhyb3dFcnJvcigndnVlVGVtcGxhdGVDb21waWxlciBpcyB1bmRlZmluZWQsIHlvdSBtdXN0IHBhc3MgY29tcG9uZW50cyBleHBsaWNpdGx5IGlmIHZ1ZS10ZW1wbGF0ZS1jb21waWxlciBpcyB1bmRlZmluZWQnKVxuICAgIH1cbiAgICBpZiAod2luZG93Lm5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL1BoYW50b21KUy9pKSkge1xuICAgICAgdGhyb3dFcnJvcigndGhlIHNsb3RzIG9wdGlvbiBkb2VzIG5vdCBzdXBwb3J0IHN0cmluZ3MgaW4gUGhhbnRvbUpTLiBQbGVhc2UgdXNlIFB1cHBldGVlciwgb3IgcGFzcyBhIGNvbXBvbmVudC4nKVxuICAgIH1cbiAgICBjb25zdCBkb21QYXJzZXIgPSBuZXcgd2luZG93LkRPTVBhcnNlcigpXG4gICAgY29uc3QgX2RvY3VtZW50ID0gZG9tUGFyc2VyLnBhcnNlRnJvbVN0cmluZyhzbG90VmFsdWUsICd0ZXh0L2h0bWwnKVxuICAgIGNvbnN0IF9zbG90VmFsdWUgPSBzbG90VmFsdWUudHJpbSgpXG4gICAgaWYgKF9zbG90VmFsdWVbMF0gPT09ICc8JyAmJiBfc2xvdFZhbHVlW19zbG90VmFsdWUubGVuZ3RoIC0gMV0gPT09ICc+JyAmJiBfZG9jdW1lbnQuYm9keS5jaGlsZEVsZW1lbnRDb3VudCA9PT0gMSkge1xuICAgICAgZWxlbSA9IHZtLiRjcmVhdGVFbGVtZW50KGNvbXBpbGVUb0Z1bmN0aW9ucyhzbG90VmFsdWUpKVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBjb21waWxlZFJlc3VsdCA9IGNvbXBpbGVUb0Z1bmN0aW9ucyhgPGRpdj4ke3Nsb3RWYWx1ZX17eyB9fTwvZGl2PmApXG4gICAgICBjb25zdCBfc3RhdGljUmVuZGVyRm5zID0gdm0uX3JlbmRlclByb3h5LiRvcHRpb25zLnN0YXRpY1JlbmRlckZuc1xuICAgICAgdm0uX3JlbmRlclByb3h5LiRvcHRpb25zLnN0YXRpY1JlbmRlckZucyA9IGNvbXBpbGVkUmVzdWx0LnN0YXRpY1JlbmRlckZuc1xuICAgICAgZWxlbSA9IGNvbXBpbGVkUmVzdWx0LnJlbmRlci5jYWxsKHZtLl9yZW5kZXJQcm94eSwgdm0uJGNyZWF0ZUVsZW1lbnQpLmNoaWxkcmVuXG4gICAgICB2bS5fcmVuZGVyUHJveHkuJG9wdGlvbnMuc3RhdGljUmVuZGVyRm5zID0gX3N0YXRpY1JlbmRlckZuc1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBlbGVtID0gdm0uJGNyZWF0ZUVsZW1lbnQoc2xvdFZhbHVlKVxuICB9XG4gIGlmIChBcnJheS5pc0FycmF5KGVsZW0pKSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkodm0uJHNsb3RzW3Nsb3ROYW1lXSkpIHtcbiAgICAgIHZtLiRzbG90c1tzbG90TmFtZV0gPSBbLi4udm0uJHNsb3RzW3Nsb3ROYW1lXSwgLi4uZWxlbV1cbiAgICB9IGVsc2Uge1xuICAgICAgdm0uJHNsb3RzW3Nsb3ROYW1lXSA9IFsuLi5lbGVtXVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh2bS4kc2xvdHNbc2xvdE5hbWVdKSkge1xuICAgICAgdm0uJHNsb3RzW3Nsb3ROYW1lXS5wdXNoKGVsZW0pXG4gICAgfSBlbHNlIHtcbiAgICAgIHZtLiRzbG90c1tzbG90TmFtZV0gPSBbZWxlbV1cbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFkZFNsb3RzICh2bTogQ29tcG9uZW50LCBzbG90czogT2JqZWN0KTogdm9pZCB7XG4gIHZhbGlkYXRlU2xvdHMoc2xvdHMpXG4gIE9iamVjdC5rZXlzKHNsb3RzKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShzbG90c1trZXldKSkge1xuICAgICAgc2xvdHNba2V5XS5mb3JFYWNoKChzbG90VmFsdWUpID0+IHtcbiAgICAgICAgYWRkU2xvdFRvVm0odm0sIGtleSwgc2xvdFZhbHVlKVxuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgYWRkU2xvdFRvVm0odm0sIGtleSwgc2xvdHNba2V5XSlcbiAgICB9XG4gIH0pXG59XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgeyBjb21waWxlVG9GdW5jdGlvbnMgfSBmcm9tICd2dWUtdGVtcGxhdGUtY29tcGlsZXInXG5pbXBvcnQgeyB0aHJvd0Vycm9yIH0gZnJvbSAnc2hhcmVkL3V0aWwnXG5cbmV4cG9ydCBmdW5jdGlvbiBhZGRTY29wZWRTbG90cyAodm06IENvbXBvbmVudCwgc2NvcGVkU2xvdHM6IE9iamVjdCk6IHZvaWQge1xuICBPYmplY3Qua2V5cyhzY29wZWRTbG90cykuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgY29uc3QgdGVtcGxhdGUgPSBzY29wZWRTbG90c1trZXldLnRyaW0oKVxuICAgIGlmICh0ZW1wbGF0ZS5zdWJzdHIoMCwgOSkgPT09ICc8dGVtcGxhdGUnKSB7XG4gICAgICB0aHJvd0Vycm9yKCd0aGUgc2NvcGVkU2xvdHMgb3B0aW9uIGRvZXMgbm90IHN1cHBvcnQgYSB0ZW1wbGF0ZSB0YWcgYXMgdGhlIHJvb3QgZWxlbWVudC4nKVxuICAgIH1cbiAgICBjb25zdCBkb21QYXJzZXIgPSBuZXcgd2luZG93LkRPTVBhcnNlcigpXG4gICAgY29uc3QgX2RvY3VtZW50ID0gZG9tUGFyc2VyLnBhcnNlRnJvbVN0cmluZyh0ZW1wbGF0ZSwgJ3RleHQvaHRtbCcpXG4gICAgdm0uJF92dWVUZXN0VXRpbHNfc2NvcGVkU2xvdHNba2V5XSA9IGNvbXBpbGVUb0Z1bmN0aW9ucyh0ZW1wbGF0ZSkucmVuZGVyXG4gICAgdm0uJF92dWVUZXN0VXRpbHNfc2xvdFNjb3Blc1trZXldID0gX2RvY3VtZW50LmJvZHkuZmlyc3RDaGlsZC5nZXRBdHRyaWJ1dGUoJ3Nsb3Qtc2NvcGUnKVxuICB9KVxufVxuIiwiLy8gQGZsb3dcbmltcG9ydCAkJFZ1ZSBmcm9tICd2dWUnXG5pbXBvcnQgeyB3YXJuIH0gZnJvbSAnc2hhcmVkL3V0aWwnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGFkZE1vY2tzIChtb2NrZWRQcm9wZXJ0aWVzOiBPYmplY3QsIFZ1ZTogQ29tcG9uZW50KSB7XG4gIE9iamVjdC5rZXlzKG1vY2tlZFByb3BlcnRpZXMpLmZvckVhY2goKGtleSkgPT4ge1xuICAgIHRyeSB7XG4gICAgICBWdWUucHJvdG90eXBlW2tleV0gPSBtb2NrZWRQcm9wZXJ0aWVzW2tleV1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB3YXJuKGBjb3VsZCBub3Qgb3ZlcndyaXRlIHByb3BlcnR5ICR7a2V5fSwgdGhpcyB1c3VhbGx5IGNhdXNlZCBieSBhIHBsdWdpbiB0aGF0IGhhcyBhZGRlZCB0aGUgcHJvcGVydHkgYXMgYSByZWFkLW9ubHkgdmFsdWVgKVxuICAgIH1cbiAgICAkJFZ1ZS51dGlsLmRlZmluZVJlYWN0aXZlKFZ1ZSwga2V5LCBtb2NrZWRQcm9wZXJ0aWVzW2tleV0pXG4gIH0pXG59XG4iLCJpbXBvcnQgVnVlIGZyb20gJ3Z1ZSdcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gYWRkQXR0cnMgKHZtLCBhdHRycykge1xuICBjb25zdCBvcmlnaW5hbFNpbGVudCA9IFZ1ZS5jb25maWcuc2lsZW50XG4gIFZ1ZS5jb25maWcuc2lsZW50ID0gdHJ1ZVxuICBpZiAoYXR0cnMpIHtcbiAgICB2bS4kYXR0cnMgPSBhdHRyc1xuICB9IGVsc2Uge1xuICAgIHZtLiRhdHRycyA9IHt9XG4gIH1cbiAgVnVlLmNvbmZpZy5zaWxlbnQgPSBvcmlnaW5hbFNpbGVudFxufVxuIiwiaW1wb3J0IFZ1ZSBmcm9tICd2dWUnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGFkZExpc3RlbmVycyAodm0sIGxpc3RlbmVycykge1xuICBjb25zdCBvcmlnaW5hbFNpbGVudCA9IFZ1ZS5jb25maWcuc2lsZW50XG4gIFZ1ZS5jb25maWcuc2lsZW50ID0gdHJ1ZVxuICBpZiAobGlzdGVuZXJzKSB7XG4gICAgdm0uJGxpc3RlbmVycyA9IGxpc3RlbmVyc1xuICB9IGVsc2Uge1xuICAgIHZtLiRsaXN0ZW5lcnMgPSB7fVxuICB9XG4gIFZ1ZS5jb25maWcuc2lsZW50ID0gb3JpZ2luYWxTaWxlbnRcbn1cbiIsImZ1bmN0aW9uIGFkZFByb3ZpZGUgKGNvbXBvbmVudCwgb3B0aW9uUHJvdmlkZSwgb3B0aW9ucykge1xuICBjb25zdCBwcm92aWRlID0gdHlwZW9mIG9wdGlvblByb3ZpZGUgPT09ICdmdW5jdGlvbidcbiAgICA/IG9wdGlvblByb3ZpZGVcbiAgICA6IE9iamVjdC5hc3NpZ24oe30sIG9wdGlvblByb3ZpZGUpXG5cbiAgb3B0aW9ucy5iZWZvcmVDcmVhdGUgPSBmdW5jdGlvbiB2dWVUZXN0VXRpbEJlZm9yZUNyZWF0ZSAoKSB7XG4gICAgdGhpcy5fcHJvdmlkZWQgPSB0eXBlb2YgcHJvdmlkZSA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgPyBwcm92aWRlLmNhbGwodGhpcylcbiAgICAgIDogcHJvdmlkZVxuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGFkZFByb3ZpZGVcbiIsIi8vIEBmbG93XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2dFdmVudHMgKHZtOiBDb21wb25lbnQsIGVtaXR0ZWQ6IE9iamVjdCwgZW1pdHRlZEJ5T3JkZXI6IEFycmF5PGFueT4pIHtcbiAgY29uc3QgZW1pdCA9IHZtLiRlbWl0XG4gIHZtLiRlbWl0ID0gKG5hbWUsIC4uLmFyZ3MpID0+IHtcbiAgICAoZW1pdHRlZFtuYW1lXSB8fCAoZW1pdHRlZFtuYW1lXSA9IFtdKSkucHVzaChhcmdzKVxuICAgIGVtaXR0ZWRCeU9yZGVyLnB1c2goeyBuYW1lLCBhcmdzIH0pXG4gICAgcmV0dXJuIGVtaXQuY2FsbCh2bSwgbmFtZSwgLi4uYXJncylcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYWRkRXZlbnRMb2dnZXIgKHZ1ZTogQ29tcG9uZW50KSB7XG4gIHZ1ZS5taXhpbih7XG4gICAgYmVmb3JlQ3JlYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLl9fZW1pdHRlZCA9IE9iamVjdC5jcmVhdGUobnVsbClcbiAgICAgIHRoaXMuX19lbWl0dGVkQnlPcmRlciA9IFtdXG4gICAgICBsb2dFdmVudHModGhpcywgdGhpcy5fX2VtaXR0ZWQsIHRoaXMuX19lbWl0dGVkQnlPcmRlcilcbiAgICB9XG4gIH0pXG59XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgeyBjb21waWxlVG9GdW5jdGlvbnMgfSBmcm9tICd2dWUtdGVtcGxhdGUtY29tcGlsZXInXG5cbmV4cG9ydCBmdW5jdGlvbiBjb21waWxlVGVtcGxhdGUgKGNvbXBvbmVudDogQ29tcG9uZW50KSB7XG4gIGlmIChjb21wb25lbnQuY29tcG9uZW50cykge1xuICAgIE9iamVjdC5rZXlzKGNvbXBvbmVudC5jb21wb25lbnRzKS5mb3JFYWNoKChjKSA9PiB7XG4gICAgICBjb25zdCBjbXAgPSBjb21wb25lbnQuY29tcG9uZW50c1tjXVxuICAgICAgaWYgKCFjbXAucmVuZGVyKSB7XG4gICAgICAgIGNvbXBpbGVUZW1wbGF0ZShjbXApXG4gICAgICB9XG4gICAgfSlcbiAgfVxuICBpZiAoY29tcG9uZW50LmV4dGVuZHMpIHtcbiAgICBjb21waWxlVGVtcGxhdGUoY29tcG9uZW50LmV4dGVuZHMpXG4gIH1cbiAgaWYgKGNvbXBvbmVudC50ZW1wbGF0ZSkge1xuICAgIE9iamVjdC5hc3NpZ24oY29tcG9uZW50LCBjb21waWxlVG9GdW5jdGlvbnMoY29tcG9uZW50LnRlbXBsYXRlKSlcbiAgfVxufVxuIiwiLy8gQGZsb3dcblxuaW1wb3J0IFZ1ZSBmcm9tICd2dWUnXG5pbXBvcnQgeyBjb21waWxlVG9GdW5jdGlvbnMgfSBmcm9tICd2dWUtdGVtcGxhdGUtY29tcGlsZXInXG5pbXBvcnQgeyB0aHJvd0Vycm9yIH0gZnJvbSAnLi91dGlsJ1xuaW1wb3J0IHsgY29tcG9uZW50TmVlZHNDb21waWxpbmcgfSBmcm9tICcuL3ZhbGlkYXRvcnMnXG5pbXBvcnQgeyBjb21waWxlVGVtcGxhdGUgfSBmcm9tICcuL2NvbXBpbGUtdGVtcGxhdGUnXG5pbXBvcnQgeyBjYXBpdGFsaXplLCBjYW1lbGl6ZSwgaHlwaGVuYXRlIH0gZnJvbSAnLi91dGlsJ1xuXG5mdW5jdGlvbiBpc1Z1ZUNvbXBvbmVudCAoY29tcCkge1xuICByZXR1cm4gY29tcCAmJiAoY29tcC5yZW5kZXIgfHwgY29tcC50ZW1wbGF0ZSB8fCBjb21wLm9wdGlvbnMpXG59XG5cbmZ1bmN0aW9uIGlzVmFsaWRTdHViIChzdHViOiBhbnkpIHtcbiAgcmV0dXJuICEhc3R1YiAmJlxuICAgICAgdHlwZW9mIHN0dWIgPT09ICdzdHJpbmcnIHx8XG4gICAgICAoc3R1YiA9PT0gdHJ1ZSkgfHxcbiAgICAgIChpc1Z1ZUNvbXBvbmVudChzdHViKSlcbn1cblxuZnVuY3Rpb24gaXNSZXF1aXJlZENvbXBvbmVudCAobmFtZSkge1xuICByZXR1cm4gbmFtZSA9PT0gJ0tlZXBBbGl2ZScgfHwgbmFtZSA9PT0gJ1RyYW5zaXRpb24nIHx8IG5hbWUgPT09ICdUcmFuc2l0aW9uR3JvdXAnXG59XG5cbmZ1bmN0aW9uIGdldENvcmVQcm9wZXJ0aWVzIChjb21wb25lbnQ6IENvbXBvbmVudCk6IE9iamVjdCB7XG4gIHJldHVybiB7XG4gICAgYXR0cnM6IGNvbXBvbmVudC5hdHRycyxcbiAgICBuYW1lOiBjb21wb25lbnQubmFtZSxcbiAgICBvbjogY29tcG9uZW50Lm9uLFxuICAgIGtleTogY29tcG9uZW50LmtleSxcbiAgICByZWY6IGNvbXBvbmVudC5yZWYsXG4gICAgcHJvcHM6IGNvbXBvbmVudC5wcm9wcyxcbiAgICBkb21Qcm9wczogY29tcG9uZW50LmRvbVByb3BzLFxuICAgIGNsYXNzOiBjb21wb25lbnQuY2xhc3MsXG4gICAgc3RhdGljQ2xhc3M6IGNvbXBvbmVudC5zdGF0aWNDbGFzcyxcbiAgICBzdGF0aWNTdHlsZTogY29tcG9uZW50LnN0YXRpY1N0eWxlLFxuICAgIHN0eWxlOiBjb21wb25lbnQuc3R5bGUsXG4gICAgbm9ybWFsaXplZFN0eWxlOiBjb21wb25lbnQubm9ybWFsaXplZFN0eWxlLFxuICAgIG5hdGl2ZU9uOiBjb21wb25lbnQubmF0aXZlT24sXG4gICAgZnVuY3Rpb25hbDogY29tcG9uZW50LmZ1bmN0aW9uYWxcbiAgfVxufVxuZnVuY3Rpb24gY3JlYXRlU3R1YkZyb21TdHJpbmcgKHRlbXBsYXRlU3RyaW5nOiBzdHJpbmcsIG9yaWdpbmFsQ29tcG9uZW50OiBDb21wb25lbnQpOiBPYmplY3Qge1xuICBpZiAoIWNvbXBpbGVUb0Z1bmN0aW9ucykge1xuICAgIHRocm93RXJyb3IoJ3Z1ZVRlbXBsYXRlQ29tcGlsZXIgaXMgdW5kZWZpbmVkLCB5b3UgbXVzdCBwYXNzIGNvbXBvbmVudHMgZXhwbGljaXRseSBpZiB2dWUtdGVtcGxhdGUtY29tcGlsZXIgaXMgdW5kZWZpbmVkJylcbiAgfVxuXG4gIGlmICh0ZW1wbGF0ZVN0cmluZy5pbmRleE9mKGh5cGhlbmF0ZShvcmlnaW5hbENvbXBvbmVudC5uYW1lKSkgIT09IC0xIHx8XG4gIHRlbXBsYXRlU3RyaW5nLmluZGV4T2YoY2FwaXRhbGl6ZShvcmlnaW5hbENvbXBvbmVudC5uYW1lKSkgIT09IC0xIHx8XG4gIHRlbXBsYXRlU3RyaW5nLmluZGV4T2YoY2FtZWxpemUob3JpZ2luYWxDb21wb25lbnQubmFtZSkpICE9PSAtMSkge1xuICAgIHRocm93RXJyb3IoJ29wdGlvbnMuc3R1YiBjYW5ub3QgY29udGFpbiBhIGNpcmN1bGFyIHJlZmVyZW5jZScpXG4gIH1cblxuICByZXR1cm4ge1xuICAgIC4uLmdldENvcmVQcm9wZXJ0aWVzKG9yaWdpbmFsQ29tcG9uZW50KSxcbiAgICAuLi5jb21waWxlVG9GdW5jdGlvbnModGVtcGxhdGVTdHJpbmcpXG4gIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlQmxhbmtTdHViIChvcmlnaW5hbENvbXBvbmVudDogQ29tcG9uZW50KSB7XG4gIHJldHVybiB7XG4gICAgLi4uZ2V0Q29yZVByb3BlcnRpZXMob3JpZ2luYWxDb21wb25lbnQpLFxuICAgIHJlbmRlcjogaCA9PiBoKCcnKVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVDb21wb25lbnRTdHVicyAob3JpZ2luYWxDb21wb25lbnRzOiBPYmplY3QgPSB7fSwgc3R1YnM6IE9iamVjdCk6IE9iamVjdCB7XG4gIGNvbnN0IGNvbXBvbmVudHMgPSB7fVxuICBpZiAoIXN0dWJzKSB7XG4gICAgcmV0dXJuIGNvbXBvbmVudHNcbiAgfVxuICBpZiAoQXJyYXkuaXNBcnJheShzdHVicykpIHtcbiAgICBzdHVicy5mb3JFYWNoKHN0dWIgPT4ge1xuICAgICAgaWYgKHN0dWIgPT09IGZhbHNlKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIHN0dWIgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRocm93RXJyb3IoJ2VhY2ggaXRlbSBpbiBhbiBvcHRpb25zLnN0dWJzIGFycmF5IG11c3QgYmUgYSBzdHJpbmcnKVxuICAgICAgfVxuICAgICAgY29tcG9uZW50c1tzdHViXSA9IGNyZWF0ZUJsYW5rU3R1Yih7fSlcbiAgICB9KVxuICB9IGVsc2Uge1xuICAgIE9iamVjdC5rZXlzKHN0dWJzKS5mb3JFYWNoKHN0dWIgPT4ge1xuICAgICAgaWYgKHN0dWJzW3N0dWJdID09PSBmYWxzZSkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGlmICghaXNWYWxpZFN0dWIoc3R1YnNbc3R1Yl0pKSB7XG4gICAgICAgIHRocm93RXJyb3IoJ29wdGlvbnMuc3R1YiB2YWx1ZXMgbXVzdCBiZSBwYXNzZWQgYSBzdHJpbmcgb3IgY29tcG9uZW50JylcbiAgICAgIH1cbiAgICAgIGlmIChzdHVic1tzdHViXSA9PT0gdHJ1ZSkge1xuICAgICAgICBjb21wb25lbnRzW3N0dWJdID0gY3JlYXRlQmxhbmtTdHViKHt9KVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgaWYgKGNvbXBvbmVudE5lZWRzQ29tcGlsaW5nKHN0dWJzW3N0dWJdKSkge1xuICAgICAgICBjb21waWxlVGVtcGxhdGUoc3R1YnNbc3R1Yl0pXG4gICAgICB9XG5cbiAgICAgIGlmIChvcmlnaW5hbENvbXBvbmVudHNbc3R1Yl0pIHtcbiAgICAgICAgLy8gUmVtb3ZlIGNhY2hlZCBjb25zdHJ1Y3RvclxuICAgICAgICBkZWxldGUgb3JpZ2luYWxDb21wb25lbnRzW3N0dWJdLl9DdG9yXG4gICAgICAgIGlmICh0eXBlb2Ygc3R1YnNbc3R1Yl0gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgY29tcG9uZW50c1tzdHViXSA9IGNyZWF0ZVN0dWJGcm9tU3RyaW5nKHN0dWJzW3N0dWJdLCBvcmlnaW5hbENvbXBvbmVudHNbc3R1Yl0pXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29tcG9uZW50c1tzdHViXSA9IHtcbiAgICAgICAgICAgIC4uLnN0dWJzW3N0dWJdLFxuICAgICAgICAgICAgbmFtZTogb3JpZ2luYWxDb21wb25lbnRzW3N0dWJdLm5hbWVcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc3R1YnNbc3R1Yl0gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgaWYgKCFjb21waWxlVG9GdW5jdGlvbnMpIHtcbiAgICAgICAgICAgIHRocm93RXJyb3IoJ3Z1ZVRlbXBsYXRlQ29tcGlsZXIgaXMgdW5kZWZpbmVkLCB5b3UgbXVzdCBwYXNzIGNvbXBvbmVudHMgZXhwbGljaXRseSBpZiB2dWUtdGVtcGxhdGUtY29tcGlsZXIgaXMgdW5kZWZpbmVkJylcbiAgICAgICAgICB9XG4gICAgICAgICAgY29tcG9uZW50c1tzdHViXSA9IHtcbiAgICAgICAgICAgIC4uLmNvbXBpbGVUb0Z1bmN0aW9ucyhzdHVic1tzdHViXSlcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29tcG9uZW50c1tzdHViXSA9IHtcbiAgICAgICAgICAgIC4uLnN0dWJzW3N0dWJdXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBpZ25vcmVFbGVtZW50cyBkb2VzIG5vdCBleGlzdCBpbiBWdWUgMi4wLnhcbiAgICAgIGlmIChWdWUuY29uZmlnLmlnbm9yZWRFbGVtZW50cykge1xuICAgICAgICBWdWUuY29uZmlnLmlnbm9yZWRFbGVtZW50cy5wdXNoKHN0dWIpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuICByZXR1cm4gY29tcG9uZW50c1xufVxuXG5mdW5jdGlvbiBzdHViQ29tcG9uZW50cyAoY29tcG9uZW50czogT2JqZWN0LCBzdHViYmVkQ29tcG9uZW50czogT2JqZWN0KSB7XG4gIE9iamVjdC5rZXlzKGNvbXBvbmVudHMpLmZvckVhY2goY29tcG9uZW50ID0+IHtcbiAgICAvLyBSZW1vdmUgY2FjaGVkIGNvbnN0cnVjdG9yXG4gICAgZGVsZXRlIGNvbXBvbmVudHNbY29tcG9uZW50XS5fQ3RvclxuICAgIGlmICghY29tcG9uZW50c1tjb21wb25lbnRdLm5hbWUpIHtcbiAgICAgIGNvbXBvbmVudHNbY29tcG9uZW50XS5uYW1lID0gY29tcG9uZW50XG4gICAgfVxuICAgIHN0dWJiZWRDb21wb25lbnRzW2NvbXBvbmVudF0gPSBjcmVhdGVCbGFua1N0dWIoY29tcG9uZW50c1tjb21wb25lbnRdKVxuXG4gICAgLy8gaWdub3JlRWxlbWVudHMgZG9lcyBub3QgZXhpc3QgaW4gVnVlIDIuMC54XG4gICAgaWYgKFZ1ZS5jb25maWcuaWdub3JlZEVsZW1lbnRzKSB7XG4gICAgICBWdWUuY29uZmlnLmlnbm9yZWRFbGVtZW50cy5wdXNoKGNvbXBvbmVudClcbiAgICB9XG4gIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVDb21wb25lbnRTdHVic0ZvckFsbCAoY29tcG9uZW50OiBDb21wb25lbnQpOiBPYmplY3Qge1xuICBjb25zdCBzdHViYmVkQ29tcG9uZW50cyA9IHt9XG5cbiAgaWYgKGNvbXBvbmVudC5jb21wb25lbnRzKSB7XG4gICAgc3R1YkNvbXBvbmVudHMoY29tcG9uZW50LmNvbXBvbmVudHMsIHN0dWJiZWRDb21wb25lbnRzKVxuICB9XG5cbiAgbGV0IGV4dGVuZGVkID0gY29tcG9uZW50LmV4dGVuZHNcblxuICAvLyBMb29wIHRocm91Z2ggZXh0ZW5kZWQgY29tcG9uZW50IGNoYWlucyB0byBzdHViIGFsbCBjaGlsZCBjb21wb25lbnRzXG4gIHdoaWxlIChleHRlbmRlZCkge1xuICAgIGlmIChleHRlbmRlZC5jb21wb25lbnRzKSB7XG4gICAgICBzdHViQ29tcG9uZW50cyhleHRlbmRlZC5jb21wb25lbnRzLCBzdHViYmVkQ29tcG9uZW50cylcbiAgICB9XG4gICAgZXh0ZW5kZWQgPSBleHRlbmRlZC5leHRlbmRzXG4gIH1cblxuICBpZiAoY29tcG9uZW50LmV4dGVuZE9wdGlvbnMgJiYgY29tcG9uZW50LmV4dGVuZE9wdGlvbnMuY29tcG9uZW50cykge1xuICAgIHN0dWJDb21wb25lbnRzKGNvbXBvbmVudC5leHRlbmRPcHRpb25zLmNvbXBvbmVudHMsIHN0dWJiZWRDb21wb25lbnRzKVxuICB9XG5cbiAgcmV0dXJuIHN0dWJiZWRDb21wb25lbnRzXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVDb21wb25lbnRTdHVic0Zvckdsb2JhbHMgKGluc3RhbmNlOiBDb21wb25lbnQpOiBPYmplY3Qge1xuICBjb25zdCBjb21wb25lbnRzID0ge31cbiAgT2JqZWN0LmtleXMoaW5zdGFuY2Uub3B0aW9ucy5jb21wb25lbnRzKS5mb3JFYWNoKChjKSA9PiB7XG4gICAgaWYgKGlzUmVxdWlyZWRDb21wb25lbnQoYykpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbXBvbmVudHNbY10gPSBjcmVhdGVCbGFua1N0dWIoaW5zdGFuY2Uub3B0aW9ucy5jb21wb25lbnRzW2NdKVxuICAgIGRlbGV0ZSBpbnN0YW5jZS5vcHRpb25zLmNvbXBvbmVudHNbY10uX0N0b3IgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1wYXJhbS1yZWFzc2lnblxuICAgIGRlbGV0ZSBjb21wb25lbnRzW2NdLl9DdG9yIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tcGFyYW0tcmVhc3NpZ25cbiAgfSlcbiAgcmV0dXJuIGNvbXBvbmVudHNcbn1cbiIsIi8vIEBmbG93XG5cbmltcG9ydCB7IGNvbXBpbGVUb0Z1bmN0aW9ucyB9IGZyb20gJ3Z1ZS10ZW1wbGF0ZS1jb21waWxlcidcblxuZXhwb3J0IGZ1bmN0aW9uIGNvbXBpbGVUZW1wbGF0ZSAoY29tcG9uZW50OiBDb21wb25lbnQpIHtcbiAgaWYgKGNvbXBvbmVudC5jb21wb25lbnRzKSB7XG4gICAgT2JqZWN0LmtleXMoY29tcG9uZW50LmNvbXBvbmVudHMpLmZvckVhY2goKGMpID0+IHtcbiAgICAgIGNvbnN0IGNtcCA9IGNvbXBvbmVudC5jb21wb25lbnRzW2NdXG4gICAgICBpZiAoIWNtcC5yZW5kZXIpIHtcbiAgICAgICAgY29tcGlsZVRlbXBsYXRlKGNtcClcbiAgICAgIH1cbiAgICB9KVxuICB9XG4gIGlmIChjb21wb25lbnQuZXh0ZW5kcykge1xuICAgIGNvbXBpbGVUZW1wbGF0ZShjb21wb25lbnQuZXh0ZW5kcylcbiAgfVxuICBpZiAoY29tcG9uZW50LnRlbXBsYXRlKSB7XG4gICAgT2JqZWN0LmFzc2lnbihjb21wb25lbnQsIGNvbXBpbGVUb0Z1bmN0aW9ucyhjb21wb25lbnQudGVtcGxhdGUpKVxuICB9XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBkZWxldGVNb3VudGluZ09wdGlvbnMgKG9wdGlvbnMpIHtcbiAgZGVsZXRlIG9wdGlvbnMuYXR0YWNoVG9Eb2N1bWVudFxuICBkZWxldGUgb3B0aW9ucy5tb2Nrc1xuICBkZWxldGUgb3B0aW9ucy5zbG90c1xuICBkZWxldGUgb3B0aW9ucy5sb2NhbFZ1ZVxuICBkZWxldGUgb3B0aW9ucy5zdHVic1xuICBkZWxldGUgb3B0aW9ucy5jb250ZXh0XG4gIGRlbGV0ZSBvcHRpb25zLmNsb25lXG4gIGRlbGV0ZSBvcHRpb25zLmF0dHJzXG4gIGRlbGV0ZSBvcHRpb25zLmxpc3RlbmVyc1xufVxuIiwiLy8gQGZsb3dcblxuaW1wb3J0IHsgY29tcGlsZVRvRnVuY3Rpb25zIH0gZnJvbSAndnVlLXRlbXBsYXRlLWNvbXBpbGVyJ1xuaW1wb3J0IHsgdGhyb3dFcnJvciB9IGZyb20gJ3NoYXJlZC91dGlsJ1xuaW1wb3J0IHsgdmFsaWRhdGVTbG90cyB9IGZyb20gJy4vdmFsaWRhdGUtc2xvdHMnXG5cbmZ1bmN0aW9uIGNyZWF0ZUZ1bmN0aW9uYWxTbG90cyAoc2xvdHMgPSB7fSwgaCkge1xuICBpZiAoQXJyYXkuaXNBcnJheShzbG90cy5kZWZhdWx0KSkge1xuICAgIHJldHVybiBzbG90cy5kZWZhdWx0Lm1hcChoKVxuICB9XG5cbiAgaWYgKHR5cGVvZiBzbG90cy5kZWZhdWx0ID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBbaChjb21waWxlVG9GdW5jdGlvbnMoc2xvdHMuZGVmYXVsdCkpXVxuICB9XG4gIGNvbnN0IGNoaWxkcmVuID0gW11cbiAgT2JqZWN0LmtleXMoc2xvdHMpLmZvckVhY2goc2xvdFR5cGUgPT4ge1xuICAgIGlmIChBcnJheS5pc0FycmF5KHNsb3RzW3Nsb3RUeXBlXSkpIHtcbiAgICAgIHNsb3RzW3Nsb3RUeXBlXS5mb3JFYWNoKHNsb3QgPT4ge1xuICAgICAgICBjb25zdCBjb21wb25lbnQgPSB0eXBlb2Ygc2xvdCA9PT0gJ3N0cmluZycgPyBjb21waWxlVG9GdW5jdGlvbnMoc2xvdCkgOiBzbG90XG4gICAgICAgIGNvbnN0IG5ld1Nsb3QgPSBoKGNvbXBvbmVudClcbiAgICAgICAgbmV3U2xvdC5kYXRhLnNsb3QgPSBzbG90VHlwZVxuICAgICAgICBjaGlsZHJlbi5wdXNoKG5ld1Nsb3QpXG4gICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBjb21wb25lbnQgPSB0eXBlb2Ygc2xvdHNbc2xvdFR5cGVdID09PSAnc3RyaW5nJyA/IGNvbXBpbGVUb0Z1bmN0aW9ucyhzbG90c1tzbG90VHlwZV0pIDogc2xvdHNbc2xvdFR5cGVdXG4gICAgICBjb25zdCBzbG90ID0gaChjb21wb25lbnQpXG4gICAgICBzbG90LmRhdGEuc2xvdCA9IHNsb3RUeXBlXG4gICAgICBjaGlsZHJlbi5wdXNoKHNsb3QpXG4gICAgfVxuICB9KVxuICByZXR1cm4gY2hpbGRyZW5cbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY3JlYXRlRnVuY3Rpb25hbENvbXBvbmVudCAoY29tcG9uZW50OiBDb21wb25lbnQsIG1vdW50aW5nT3B0aW9uczogT3B0aW9ucykge1xuICBpZiAobW91bnRpbmdPcHRpb25zLmNvbnRleHQgJiYgdHlwZW9mIG1vdW50aW5nT3B0aW9ucy5jb250ZXh0ICE9PSAnb2JqZWN0Jykge1xuICAgIHRocm93RXJyb3IoJ21vdW50LmNvbnRleHQgbXVzdCBiZSBhbiBvYmplY3QnKVxuICB9XG4gIGlmIChtb3VudGluZ09wdGlvbnMuc2xvdHMpIHtcbiAgICB2YWxpZGF0ZVNsb3RzKG1vdW50aW5nT3B0aW9ucy5zbG90cylcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgcmVuZGVyIChoOiBGdW5jdGlvbikge1xuICAgICAgcmV0dXJuIGgoXG4gICAgICAgIGNvbXBvbmVudCxcbiAgICAgICAgbW91bnRpbmdPcHRpb25zLmNvbnRleHQgfHwgY29tcG9uZW50LkZ1bmN0aW9uYWxSZW5kZXJDb250ZXh0LFxuICAgICAgICAobW91bnRpbmdPcHRpb25zLmNvbnRleHQgJiYgbW91bnRpbmdPcHRpb25zLmNvbnRleHQuY2hpbGRyZW4gJiYgbW91bnRpbmdPcHRpb25zLmNvbnRleHQuY2hpbGRyZW4ubWFwKHggPT4gdHlwZW9mIHggPT09ICdmdW5jdGlvbicgPyB4KGgpIDogeCkpIHx8IGNyZWF0ZUZ1bmN0aW9uYWxTbG90cyhtb3VudGluZ09wdGlvbnMuc2xvdHMsIGgpXG4gICAgICApXG4gICAgfSxcbiAgICBuYW1lOiBjb21wb25lbnQubmFtZSxcbiAgICBfaXNGdW5jdGlvbmFsQ29udGFpbmVyOiB0cnVlXG4gIH1cbn1cbiIsIi8vIEBmbG93XG5cbmltcG9ydCBWdWUgZnJvbSAndnVlJ1xuaW1wb3J0IHsgYWRkU2xvdHMgfSBmcm9tICcuL2FkZC1zbG90cydcbmltcG9ydCB7IGFkZFNjb3BlZFNsb3RzIH0gZnJvbSAnLi9hZGQtc2NvcGVkLXNsb3RzJ1xuaW1wb3J0IGFkZE1vY2tzIGZyb20gJy4vYWRkLW1vY2tzJ1xuaW1wb3J0IGFkZEF0dHJzIGZyb20gJy4vYWRkLWF0dHJzJ1xuaW1wb3J0IGFkZExpc3RlbmVycyBmcm9tICcuL2FkZC1saXN0ZW5lcnMnXG5pbXBvcnQgYWRkUHJvdmlkZSBmcm9tICcuL2FkZC1wcm92aWRlJ1xuaW1wb3J0IHsgYWRkRXZlbnRMb2dnZXIgfSBmcm9tICcuL2xvZy1ldmVudHMnXG5pbXBvcnQgeyBjcmVhdGVDb21wb25lbnRTdHVicyB9IGZyb20gJ3NoYXJlZC9zdHViLWNvbXBvbmVudHMnXG5pbXBvcnQgeyB0aHJvd0Vycm9yIH0gZnJvbSAnc2hhcmVkL3V0aWwnXG5pbXBvcnQgeyBjb21waWxlVGVtcGxhdGUgfSBmcm9tICcuL2NvbXBpbGUtdGVtcGxhdGUnXG5pbXBvcnQgZGVsZXRlb3B0aW9ucyBmcm9tICcuL2RlbGV0ZS1tb3VudGluZy1vcHRpb25zJ1xuaW1wb3J0IGNyZWF0ZUZ1bmN0aW9uYWxDb21wb25lbnQgZnJvbSAnLi9jcmVhdGUtZnVuY3Rpb25hbC1jb21wb25lbnQnXG5pbXBvcnQgeyBjb21wb25lbnROZWVkc0NvbXBpbGluZyB9IGZyb20gJ3NoYXJlZC92YWxpZGF0b3JzJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjcmVhdGVJbnN0YW5jZSAoXG4gIGNvbXBvbmVudDogQ29tcG9uZW50LFxuICBvcHRpb25zOiBPcHRpb25zLFxuICB2dWU6IENvbXBvbmVudFxuKTogQ29tcG9uZW50IHtcbiAgaWYgKG9wdGlvbnMubW9ja3MpIHtcbiAgICBhZGRNb2NrcyhvcHRpb25zLm1vY2tzLCB2dWUpXG4gIH1cblxuICBpZiAoKGNvbXBvbmVudC5vcHRpb25zICYmIGNvbXBvbmVudC5vcHRpb25zLmZ1bmN0aW9uYWwpIHx8IGNvbXBvbmVudC5mdW5jdGlvbmFsKSB7XG4gICAgY29tcG9uZW50ID0gY3JlYXRlRnVuY3Rpb25hbENvbXBvbmVudChjb21wb25lbnQsIG9wdGlvbnMpXG4gIH0gZWxzZSBpZiAob3B0aW9ucy5jb250ZXh0KSB7XG4gICAgdGhyb3dFcnJvcihcbiAgICAgICdtb3VudC5jb250ZXh0IGNhbiBvbmx5IGJlIHVzZWQgd2hlbiBtb3VudGluZyBhIGZ1bmN0aW9uYWwgY29tcG9uZW50J1xuICAgIClcbiAgfVxuXG4gIGlmIChvcHRpb25zLnByb3ZpZGUpIHtcbiAgICBhZGRQcm92aWRlKGNvbXBvbmVudCwgb3B0aW9ucy5wcm92aWRlLCBvcHRpb25zKVxuICB9XG5cbiAgaWYgKGNvbXBvbmVudE5lZWRzQ29tcGlsaW5nKGNvbXBvbmVudCkpIHtcbiAgICBjb21waWxlVGVtcGxhdGUoY29tcG9uZW50KVxuICB9XG5cbiAgYWRkRXZlbnRMb2dnZXIodnVlKVxuXG4gIGNvbnN0IENvbnN0cnVjdG9yID0gdnVlLmV4dGVuZChjb21wb25lbnQpXG5cbiAgY29uc3QgaW5zdGFuY2VPcHRpb25zID0geyAuLi5vcHRpb25zIH1cbiAgZGVsZXRlb3B0aW9ucyhpbnN0YW5jZU9wdGlvbnMpXG4gIGlmIChvcHRpb25zLnN0dWJzKSB7XG4gICAgaW5zdGFuY2VPcHRpb25zLmNvbXBvbmVudHMgPSB7XG4gICAgICAuLi5pbnN0YW5jZU9wdGlvbnMuY29tcG9uZW50cyxcbiAgICAgIC8vICRGbG93SWdub3JlXG4gICAgICAuLi5jcmVhdGVDb21wb25lbnRTdHVicyhjb21wb25lbnQuY29tcG9uZW50cywgb3B0aW9ucy5zdHVicylcbiAgICB9XG4gIH1cblxuICBjb25zdCB2bSA9IG5ldyBDb25zdHJ1Y3RvcihpbnN0YW5jZU9wdGlvbnMpXG5cbiAgYWRkQXR0cnModm0sIG9wdGlvbnMuYXR0cnMpXG4gIGFkZExpc3RlbmVycyh2bSwgb3B0aW9ucy5saXN0ZW5lcnMpXG5cbiAgaWYgKG9wdGlvbnMuc2NvcGVkU2xvdHMpIHtcbiAgICBpZiAod2luZG93Lm5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL1BoYW50b21KUy9pKSkge1xuICAgICAgdGhyb3dFcnJvcigndGhlIHNjb3BlZFNsb3RzIG9wdGlvbiBkb2VzIG5vdCBzdXBwb3J0IFBoYW50b21KUy4gUGxlYXNlIHVzZSBQdXBwZXRlZXIsIG9yIHBhc3MgYSBjb21wb25lbnQuJylcbiAgICB9XG4gICAgY29uc3QgdnVlVmVyc2lvbiA9IE51bWJlcihgJHtWdWUudmVyc2lvbi5zcGxpdCgnLicpWzBdfS4ke1Z1ZS52ZXJzaW9uLnNwbGl0KCcuJylbMV19YClcbiAgICBpZiAodnVlVmVyc2lvbiA+PSAyLjUpIHtcbiAgICAgIHZtLiRfdnVlVGVzdFV0aWxzX3Njb3BlZFNsb3RzID0ge31cbiAgICAgIHZtLiRfdnVlVGVzdFV0aWxzX3Nsb3RTY29wZXMgPSB7fVxuICAgICAgY29uc3QgcmVuZGVyU2xvdCA9IHZtLl9yZW5kZXJQcm94eS5fdFxuXG4gICAgICB2bS5fcmVuZGVyUHJveHkuX3QgPSBmdW5jdGlvbiAobmFtZSwgZmVlZGJhY2ssIHByb3BzLCBiaW5kT2JqZWN0KSB7XG4gICAgICAgIGNvbnN0IHNjb3BlZFNsb3RGbiA9IHZtLiRfdnVlVGVzdFV0aWxzX3Njb3BlZFNsb3RzW25hbWVdXG4gICAgICAgIGNvbnN0IHNsb3RTY29wZSA9IHZtLiRfdnVlVGVzdFV0aWxzX3Nsb3RTY29wZXNbbmFtZV1cbiAgICAgICAgaWYgKHNjb3BlZFNsb3RGbikge1xuICAgICAgICAgIHByb3BzID0geyAuLi5iaW5kT2JqZWN0LCAuLi5wcm9wcyB9XG4gICAgICAgICAgY29uc3QgcHJveHkgPSB7fVxuICAgICAgICAgIGNvbnN0IGhlbHBlcnMgPSBbJ19jJywgJ19vJywgJ19uJywgJ19zJywgJ19sJywgJ190JywgJ19xJywgJ19pJywgJ19tJywgJ19mJywgJ19rJywgJ19iJywgJ192JywgJ19lJywgJ191JywgJ19nJ11cbiAgICAgICAgICBoZWxwZXJzLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgICAgICAgcHJveHlba2V5XSA9IHZtLl9yZW5kZXJQcm94eVtrZXldXG4gICAgICAgICAgfSlcbiAgICAgICAgICBwcm94eVtzbG90U2NvcGVdID0gcHJvcHNcbiAgICAgICAgICByZXR1cm4gc2NvcGVkU2xvdEZuLmNhbGwocHJveHkpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHJlbmRlclNsb3QuY2FsbCh2bS5fcmVuZGVyUHJveHksIG5hbWUsIGZlZWRiYWNrLCBwcm9wcywgYmluZE9iamVjdClcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyAkRmxvd0lnbm9yZVxuICAgICAgYWRkU2NvcGVkU2xvdHModm0sIG9wdGlvbnMuc2NvcGVkU2xvdHMpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93RXJyb3IoJ3RoZSBzY29wZWRTbG90cyBvcHRpb24gaXMgb25seSBzdXBwb3J0ZWQgaW4gdnVlQDIuNSsuJylcbiAgICB9XG4gIH1cblxuICBpZiAob3B0aW9ucy5zbG90cykge1xuICAgIGFkZFNsb3RzKHZtLCBvcHRpb25zLnNsb3RzKVxuICB9XG5cbiAgcmV0dXJuIHZtXG59XG4iLCIvLyBAZmxvd1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjcmVhdGVFbGVtZW50ICgpOiBIVE1MRWxlbWVudCB8IHZvaWQge1xuICBpZiAoZG9jdW1lbnQpIHtcbiAgICBjb25zdCBlbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcblxuICAgIGlmIChkb2N1bWVudC5ib2R5KSB7XG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGVsZW0pXG4gICAgfVxuICAgIHJldHVybiBlbGVtXG4gIH1cbn1cbiIsIi8qKlxuICogUmVtb3ZlcyBhbGwga2V5LXZhbHVlIGVudHJpZXMgZnJvbSB0aGUgbGlzdCBjYWNoZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgY2xlYXJcbiAqIEBtZW1iZXJPZiBMaXN0Q2FjaGVcbiAqL1xuZnVuY3Rpb24gbGlzdENhY2hlQ2xlYXIoKSB7XG4gIHRoaXMuX19kYXRhX18gPSBbXTtcbiAgdGhpcy5zaXplID0gMDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBsaXN0Q2FjaGVDbGVhcjtcbiIsIi8qKlxuICogUGVyZm9ybXMgYVxuICogW2BTYW1lVmFsdWVaZXJvYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtc2FtZXZhbHVlemVybylcbiAqIGNvbXBhcmlzb24gYmV0d2VlbiB0d28gdmFsdWVzIHRvIGRldGVybWluZSBpZiB0aGV5IGFyZSBlcXVpdmFsZW50LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjb21wYXJlLlxuICogQHBhcmFtIHsqfSBvdGhlciBUaGUgb3RoZXIgdmFsdWUgdG8gY29tcGFyZS5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgdmFsdWVzIGFyZSBlcXVpdmFsZW50LCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIHZhciBvYmplY3QgPSB7ICdhJzogMSB9O1xuICogdmFyIG90aGVyID0geyAnYSc6IDEgfTtcbiAqXG4gKiBfLmVxKG9iamVjdCwgb2JqZWN0KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmVxKG9iamVjdCwgb3RoZXIpO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmVxKCdhJywgJ2EnKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmVxKCdhJywgT2JqZWN0KCdhJykpO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmVxKE5hTiwgTmFOKTtcbiAqIC8vID0+IHRydWVcbiAqL1xuZnVuY3Rpb24gZXEodmFsdWUsIG90aGVyKSB7XG4gIHJldHVybiB2YWx1ZSA9PT0gb3RoZXIgfHwgKHZhbHVlICE9PSB2YWx1ZSAmJiBvdGhlciAhPT0gb3RoZXIpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGVxO1xuIiwidmFyIGVxID0gcmVxdWlyZSgnLi9lcScpO1xuXG4vKipcbiAqIEdldHMgdGhlIGluZGV4IGF0IHdoaWNoIHRoZSBga2V5YCBpcyBmb3VuZCBpbiBgYXJyYXlgIG9mIGtleS12YWx1ZSBwYWlycy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIGluc3BlY3QuXG4gKiBAcGFyYW0geyp9IGtleSBUaGUga2V5IHRvIHNlYXJjaCBmb3IuXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBSZXR1cm5zIHRoZSBpbmRleCBvZiB0aGUgbWF0Y2hlZCB2YWx1ZSwgZWxzZSBgLTFgLlxuICovXG5mdW5jdGlvbiBhc3NvY0luZGV4T2YoYXJyYXksIGtleSkge1xuICB2YXIgbGVuZ3RoID0gYXJyYXkubGVuZ3RoO1xuICB3aGlsZSAobGVuZ3RoLS0pIHtcbiAgICBpZiAoZXEoYXJyYXlbbGVuZ3RoXVswXSwga2V5KSkge1xuICAgICAgcmV0dXJuIGxlbmd0aDtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIC0xO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFzc29jSW5kZXhPZjtcbiIsInZhciBhc3NvY0luZGV4T2YgPSByZXF1aXJlKCcuL19hc3NvY0luZGV4T2YnKTtcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIGFycmF5UHJvdG8gPSBBcnJheS5wcm90b3R5cGU7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIHNwbGljZSA9IGFycmF5UHJvdG8uc3BsaWNlO1xuXG4vKipcbiAqIFJlbW92ZXMgYGtleWAgYW5kIGl0cyB2YWx1ZSBmcm9tIHRoZSBsaXN0IGNhY2hlLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBkZWxldGVcbiAqIEBtZW1iZXJPZiBMaXN0Q2FjaGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gcmVtb3ZlLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBlbnRyeSB3YXMgcmVtb3ZlZCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBsaXN0Q2FjaGVEZWxldGUoa2V5KSB7XG4gIHZhciBkYXRhID0gdGhpcy5fX2RhdGFfXyxcbiAgICAgIGluZGV4ID0gYXNzb2NJbmRleE9mKGRhdGEsIGtleSk7XG5cbiAgaWYgKGluZGV4IDwgMCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICB2YXIgbGFzdEluZGV4ID0gZGF0YS5sZW5ndGggLSAxO1xuICBpZiAoaW5kZXggPT0gbGFzdEluZGV4KSB7XG4gICAgZGF0YS5wb3AoKTtcbiAgfSBlbHNlIHtcbiAgICBzcGxpY2UuY2FsbChkYXRhLCBpbmRleCwgMSk7XG4gIH1cbiAgLS10aGlzLnNpemU7XG4gIHJldHVybiB0cnVlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGxpc3RDYWNoZURlbGV0ZTtcbiIsInZhciBhc3NvY0luZGV4T2YgPSByZXF1aXJlKCcuL19hc3NvY0luZGV4T2YnKTtcblxuLyoqXG4gKiBHZXRzIHRoZSBsaXN0IGNhY2hlIHZhbHVlIGZvciBga2V5YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgZ2V0XG4gKiBAbWVtYmVyT2YgTGlzdENhY2hlXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIGdldC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBlbnRyeSB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gbGlzdENhY2hlR2V0KGtleSkge1xuICB2YXIgZGF0YSA9IHRoaXMuX19kYXRhX18sXG4gICAgICBpbmRleCA9IGFzc29jSW5kZXhPZihkYXRhLCBrZXkpO1xuXG4gIHJldHVybiBpbmRleCA8IDAgPyB1bmRlZmluZWQgOiBkYXRhW2luZGV4XVsxXTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBsaXN0Q2FjaGVHZXQ7XG4iLCJ2YXIgYXNzb2NJbmRleE9mID0gcmVxdWlyZSgnLi9fYXNzb2NJbmRleE9mJyk7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGEgbGlzdCBjYWNoZSB2YWx1ZSBmb3IgYGtleWAgZXhpc3RzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBoYXNcbiAqIEBtZW1iZXJPZiBMaXN0Q2FjaGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgZW50cnkgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYW4gZW50cnkgZm9yIGBrZXlgIGV4aXN0cywgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBsaXN0Q2FjaGVIYXMoa2V5KSB7XG4gIHJldHVybiBhc3NvY0luZGV4T2YodGhpcy5fX2RhdGFfXywga2V5KSA+IC0xO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGxpc3RDYWNoZUhhcztcbiIsInZhciBhc3NvY0luZGV4T2YgPSByZXF1aXJlKCcuL19hc3NvY0luZGV4T2YnKTtcblxuLyoqXG4gKiBTZXRzIHRoZSBsaXN0IGNhY2hlIGBrZXlgIHRvIGB2YWx1ZWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIHNldFxuICogQG1lbWJlck9mIExpc3RDYWNoZVxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byBzZXQuXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBzZXQuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBsaXN0IGNhY2hlIGluc3RhbmNlLlxuICovXG5mdW5jdGlvbiBsaXN0Q2FjaGVTZXQoa2V5LCB2YWx1ZSkge1xuICB2YXIgZGF0YSA9IHRoaXMuX19kYXRhX18sXG4gICAgICBpbmRleCA9IGFzc29jSW5kZXhPZihkYXRhLCBrZXkpO1xuXG4gIGlmIChpbmRleCA8IDApIHtcbiAgICArK3RoaXMuc2l6ZTtcbiAgICBkYXRhLnB1c2goW2tleSwgdmFsdWVdKTtcbiAgfSBlbHNlIHtcbiAgICBkYXRhW2luZGV4XVsxXSA9IHZhbHVlO1xuICB9XG4gIHJldHVybiB0aGlzO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGxpc3RDYWNoZVNldDtcbiIsInZhciBsaXN0Q2FjaGVDbGVhciA9IHJlcXVpcmUoJy4vX2xpc3RDYWNoZUNsZWFyJyksXG4gICAgbGlzdENhY2hlRGVsZXRlID0gcmVxdWlyZSgnLi9fbGlzdENhY2hlRGVsZXRlJyksXG4gICAgbGlzdENhY2hlR2V0ID0gcmVxdWlyZSgnLi9fbGlzdENhY2hlR2V0JyksXG4gICAgbGlzdENhY2hlSGFzID0gcmVxdWlyZSgnLi9fbGlzdENhY2hlSGFzJyksXG4gICAgbGlzdENhY2hlU2V0ID0gcmVxdWlyZSgnLi9fbGlzdENhY2hlU2V0Jyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBsaXN0IGNhY2hlIG9iamVjdC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge0FycmF5fSBbZW50cmllc10gVGhlIGtleS12YWx1ZSBwYWlycyB0byBjYWNoZS5cbiAqL1xuZnVuY3Rpb24gTGlzdENhY2hlKGVudHJpZXMpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBlbnRyaWVzID09IG51bGwgPyAwIDogZW50cmllcy5sZW5ndGg7XG5cbiAgdGhpcy5jbGVhcigpO1xuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIHZhciBlbnRyeSA9IGVudHJpZXNbaW5kZXhdO1xuICAgIHRoaXMuc2V0KGVudHJ5WzBdLCBlbnRyeVsxXSk7XG4gIH1cbn1cblxuLy8gQWRkIG1ldGhvZHMgdG8gYExpc3RDYWNoZWAuXG5MaXN0Q2FjaGUucHJvdG90eXBlLmNsZWFyID0gbGlzdENhY2hlQ2xlYXI7XG5MaXN0Q2FjaGUucHJvdG90eXBlWydkZWxldGUnXSA9IGxpc3RDYWNoZURlbGV0ZTtcbkxpc3RDYWNoZS5wcm90b3R5cGUuZ2V0ID0gbGlzdENhY2hlR2V0O1xuTGlzdENhY2hlLnByb3RvdHlwZS5oYXMgPSBsaXN0Q2FjaGVIYXM7XG5MaXN0Q2FjaGUucHJvdG90eXBlLnNldCA9IGxpc3RDYWNoZVNldDtcblxubW9kdWxlLmV4cG9ydHMgPSBMaXN0Q2FjaGU7XG4iLCJ2YXIgTGlzdENhY2hlID0gcmVxdWlyZSgnLi9fTGlzdENhY2hlJyk7XG5cbi8qKlxuICogUmVtb3ZlcyBhbGwga2V5LXZhbHVlIGVudHJpZXMgZnJvbSB0aGUgc3RhY2suXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGNsZWFyXG4gKiBAbWVtYmVyT2YgU3RhY2tcbiAqL1xuZnVuY3Rpb24gc3RhY2tDbGVhcigpIHtcbiAgdGhpcy5fX2RhdGFfXyA9IG5ldyBMaXN0Q2FjaGU7XG4gIHRoaXMuc2l6ZSA9IDA7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc3RhY2tDbGVhcjtcbiIsIi8qKlxuICogUmVtb3ZlcyBga2V5YCBhbmQgaXRzIHZhbHVlIGZyb20gdGhlIHN0YWNrLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBkZWxldGVcbiAqIEBtZW1iZXJPZiBTdGFja1xuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byByZW1vdmUuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGVudHJ5IHdhcyByZW1vdmVkLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIHN0YWNrRGVsZXRlKGtleSkge1xuICB2YXIgZGF0YSA9IHRoaXMuX19kYXRhX18sXG4gICAgICByZXN1bHQgPSBkYXRhWydkZWxldGUnXShrZXkpO1xuXG4gIHRoaXMuc2l6ZSA9IGRhdGEuc2l6ZTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzdGFja0RlbGV0ZTtcbiIsIi8qKlxuICogR2V0cyB0aGUgc3RhY2sgdmFsdWUgZm9yIGBrZXlgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBnZXRcbiAqIEBtZW1iZXJPZiBTdGFja1xuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byBnZXQuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgZW50cnkgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIHN0YWNrR2V0KGtleSkge1xuICByZXR1cm4gdGhpcy5fX2RhdGFfXy5nZXQoa2V5KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzdGFja0dldDtcbiIsIi8qKlxuICogQ2hlY2tzIGlmIGEgc3RhY2sgdmFsdWUgZm9yIGBrZXlgIGV4aXN0cy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgaGFzXG4gKiBAbWVtYmVyT2YgU3RhY2tcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgZW50cnkgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYW4gZW50cnkgZm9yIGBrZXlgIGV4aXN0cywgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBzdGFja0hhcyhrZXkpIHtcbiAgcmV0dXJuIHRoaXMuX19kYXRhX18uaGFzKGtleSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc3RhY2tIYXM7XG4iLCIvKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYGdsb2JhbGAgZnJvbSBOb2RlLmpzLiAqL1xudmFyIGZyZWVHbG9iYWwgPSB0eXBlb2YgZ2xvYmFsID09ICdvYmplY3QnICYmIGdsb2JhbCAmJiBnbG9iYWwuT2JqZWN0ID09PSBPYmplY3QgJiYgZ2xvYmFsO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZyZWVHbG9iYWw7XG4iLCJ2YXIgZnJlZUdsb2JhbCA9IHJlcXVpcmUoJy4vX2ZyZWVHbG9iYWwnKTtcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBzZWxmYC4gKi9cbnZhciBmcmVlU2VsZiA9IHR5cGVvZiBzZWxmID09ICdvYmplY3QnICYmIHNlbGYgJiYgc2VsZi5PYmplY3QgPT09IE9iamVjdCAmJiBzZWxmO1xuXG4vKiogVXNlZCBhcyBhIHJlZmVyZW5jZSB0byB0aGUgZ2xvYmFsIG9iamVjdC4gKi9cbnZhciByb290ID0gZnJlZUdsb2JhbCB8fCBmcmVlU2VsZiB8fCBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHJvb3Q7XG4iLCJ2YXIgcm9vdCA9IHJlcXVpcmUoJy4vX3Jvb3QnKTtcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgU3ltYm9sID0gcm9vdC5TeW1ib2w7XG5cbm1vZHVsZS5leHBvcnRzID0gU3ltYm9sO1xuIiwidmFyIFN5bWJvbCA9IHJlcXVpcmUoJy4vX1N5bWJvbCcpO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIFVzZWQgdG8gcmVzb2x2ZSB0aGVcbiAqIFtgdG9TdHJpbmdUYWdgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1vYmplY3QucHJvdG90eXBlLnRvc3RyaW5nKVxuICogb2YgdmFsdWVzLlxuICovXG52YXIgbmF0aXZlT2JqZWN0VG9TdHJpbmcgPSBvYmplY3RQcm90by50b1N0cmluZztcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgc3ltVG9TdHJpbmdUYWcgPSBTeW1ib2wgPyBTeW1ib2wudG9TdHJpbmdUYWcgOiB1bmRlZmluZWQ7XG5cbi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBiYXNlR2V0VGFnYCB3aGljaCBpZ25vcmVzIGBTeW1ib2wudG9TdHJpbmdUYWdgIHZhbHVlcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSByYXcgYHRvU3RyaW5nVGFnYC5cbiAqL1xuZnVuY3Rpb24gZ2V0UmF3VGFnKHZhbHVlKSB7XG4gIHZhciBpc093biA9IGhhc093blByb3BlcnR5LmNhbGwodmFsdWUsIHN5bVRvU3RyaW5nVGFnKSxcbiAgICAgIHRhZyA9IHZhbHVlW3N5bVRvU3RyaW5nVGFnXTtcblxuICB0cnkge1xuICAgIHZhbHVlW3N5bVRvU3RyaW5nVGFnXSA9IHVuZGVmaW5lZDtcbiAgICB2YXIgdW5tYXNrZWQgPSB0cnVlO1xuICB9IGNhdGNoIChlKSB7fVxuXG4gIHZhciByZXN1bHQgPSBuYXRpdmVPYmplY3RUb1N0cmluZy5jYWxsKHZhbHVlKTtcbiAgaWYgKHVubWFza2VkKSB7XG4gICAgaWYgKGlzT3duKSB7XG4gICAgICB2YWx1ZVtzeW1Ub1N0cmluZ1RhZ10gPSB0YWc7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlbGV0ZSB2YWx1ZVtzeW1Ub1N0cmluZ1RhZ107XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0UmF3VGFnO1xuIiwiLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqXG4gKiBVc2VkIHRvIHJlc29sdmUgdGhlXG4gKiBbYHRvU3RyaW5nVGFnYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtb2JqZWN0LnByb3RvdHlwZS50b3N0cmluZylcbiAqIG9mIHZhbHVlcy5cbiAqL1xudmFyIG5hdGl2ZU9iamVjdFRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG5cbi8qKlxuICogQ29udmVydHMgYHZhbHVlYCB0byBhIHN0cmluZyB1c2luZyBgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZ2AuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNvbnZlcnQuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBjb252ZXJ0ZWQgc3RyaW5nLlxuICovXG5mdW5jdGlvbiBvYmplY3RUb1N0cmluZyh2YWx1ZSkge1xuICByZXR1cm4gbmF0aXZlT2JqZWN0VG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gb2JqZWN0VG9TdHJpbmc7XG4iLCJ2YXIgU3ltYm9sID0gcmVxdWlyZSgnLi9fU3ltYm9sJyksXG4gICAgZ2V0UmF3VGFnID0gcmVxdWlyZSgnLi9fZ2V0UmF3VGFnJyksXG4gICAgb2JqZWN0VG9TdHJpbmcgPSByZXF1aXJlKCcuL19vYmplY3RUb1N0cmluZycpO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgbnVsbFRhZyA9ICdbb2JqZWN0IE51bGxdJyxcbiAgICB1bmRlZmluZWRUYWcgPSAnW29iamVjdCBVbmRlZmluZWRdJztcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgc3ltVG9TdHJpbmdUYWcgPSBTeW1ib2wgPyBTeW1ib2wudG9TdHJpbmdUYWcgOiB1bmRlZmluZWQ7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYGdldFRhZ2Agd2l0aG91dCBmYWxsYmFja3MgZm9yIGJ1Z2d5IGVudmlyb25tZW50cy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBgdG9TdHJpbmdUYWdgLlxuICovXG5mdW5jdGlvbiBiYXNlR2V0VGFnKHZhbHVlKSB7XG4gIGlmICh2YWx1ZSA9PSBudWxsKSB7XG4gICAgcmV0dXJuIHZhbHVlID09PSB1bmRlZmluZWQgPyB1bmRlZmluZWRUYWcgOiBudWxsVGFnO1xuICB9XG4gIHJldHVybiAoc3ltVG9TdHJpbmdUYWcgJiYgc3ltVG9TdHJpbmdUYWcgaW4gT2JqZWN0KHZhbHVlKSlcbiAgICA/IGdldFJhd1RhZyh2YWx1ZSlcbiAgICA6IG9iamVjdFRvU3RyaW5nKHZhbHVlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlR2V0VGFnO1xuIiwiLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyB0aGVcbiAqIFtsYW5ndWFnZSB0eXBlXShodHRwOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtZWNtYXNjcmlwdC1sYW5ndWFnZS10eXBlcylcbiAqIG9mIGBPYmplY3RgLiAoZS5nLiBhcnJheXMsIGZ1bmN0aW9ucywgb2JqZWN0cywgcmVnZXhlcywgYG5ldyBOdW1iZXIoMClgLCBhbmQgYG5ldyBTdHJpbmcoJycpYClcbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhbiBvYmplY3QsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc09iamVjdCh7fSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QoXy5ub29wKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KG51bGwpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3QodmFsdWUpIHtcbiAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsdWU7XG4gIHJldHVybiB2YWx1ZSAhPSBudWxsICYmICh0eXBlID09ICdvYmplY3QnIHx8IHR5cGUgPT0gJ2Z1bmN0aW9uJyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNPYmplY3Q7XG4iLCJ2YXIgYmFzZUdldFRhZyA9IHJlcXVpcmUoJy4vX2Jhc2VHZXRUYWcnKSxcbiAgICBpc09iamVjdCA9IHJlcXVpcmUoJy4vaXNPYmplY3QnKTtcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIGFzeW5jVGFnID0gJ1tvYmplY3QgQXN5bmNGdW5jdGlvbl0nLFxuICAgIGZ1bmNUYWcgPSAnW29iamVjdCBGdW5jdGlvbl0nLFxuICAgIGdlblRhZyA9ICdbb2JqZWN0IEdlbmVyYXRvckZ1bmN0aW9uXScsXG4gICAgcHJveHlUYWcgPSAnW29iamVjdCBQcm94eV0nO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYSBgRnVuY3Rpb25gIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIGZ1bmN0aW9uLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNGdW5jdGlvbihfKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzRnVuY3Rpb24oL2FiYy8pO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNGdW5jdGlvbih2YWx1ZSkge1xuICBpZiAoIWlzT2JqZWN0KHZhbHVlKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICAvLyBUaGUgdXNlIG9mIGBPYmplY3QjdG9TdHJpbmdgIGF2b2lkcyBpc3N1ZXMgd2l0aCB0aGUgYHR5cGVvZmAgb3BlcmF0b3JcbiAgLy8gaW4gU2FmYXJpIDkgd2hpY2ggcmV0dXJucyAnb2JqZWN0JyBmb3IgdHlwZWQgYXJyYXlzIGFuZCBvdGhlciBjb25zdHJ1Y3RvcnMuXG4gIHZhciB0YWcgPSBiYXNlR2V0VGFnKHZhbHVlKTtcbiAgcmV0dXJuIHRhZyA9PSBmdW5jVGFnIHx8IHRhZyA9PSBnZW5UYWcgfHwgdGFnID09IGFzeW5jVGFnIHx8IHRhZyA9PSBwcm94eVRhZztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc0Z1bmN0aW9uO1xuIiwidmFyIHJvb3QgPSByZXF1aXJlKCcuL19yb290Jyk7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBvdmVycmVhY2hpbmcgY29yZS1qcyBzaGltcy4gKi9cbnZhciBjb3JlSnNEYXRhID0gcm9vdFsnX19jb3JlLWpzX3NoYXJlZF9fJ107XG5cbm1vZHVsZS5leHBvcnRzID0gY29yZUpzRGF0YTtcbiIsInZhciBjb3JlSnNEYXRhID0gcmVxdWlyZSgnLi9fY29yZUpzRGF0YScpO1xuXG4vKiogVXNlZCB0byBkZXRlY3QgbWV0aG9kcyBtYXNxdWVyYWRpbmcgYXMgbmF0aXZlLiAqL1xudmFyIG1hc2tTcmNLZXkgPSAoZnVuY3Rpb24oKSB7XG4gIHZhciB1aWQgPSAvW14uXSskLy5leGVjKGNvcmVKc0RhdGEgJiYgY29yZUpzRGF0YS5rZXlzICYmIGNvcmVKc0RhdGEua2V5cy5JRV9QUk9UTyB8fCAnJyk7XG4gIHJldHVybiB1aWQgPyAoJ1N5bWJvbChzcmMpXzEuJyArIHVpZCkgOiAnJztcbn0oKSk7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGBmdW5jYCBoYXMgaXRzIHNvdXJjZSBtYXNrZWQuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGBmdW5jYCBpcyBtYXNrZWQsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaXNNYXNrZWQoZnVuYykge1xuICByZXR1cm4gISFtYXNrU3JjS2V5ICYmIChtYXNrU3JjS2V5IGluIGZ1bmMpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzTWFza2VkO1xuIiwiLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIGZ1bmNQcm90byA9IEZ1bmN0aW9uLnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gcmVzb2x2ZSB0aGUgZGVjb21waWxlZCBzb3VyY2Ugb2YgZnVuY3Rpb25zLiAqL1xudmFyIGZ1bmNUb1N0cmluZyA9IGZ1bmNQcm90by50b1N0cmluZztcblxuLyoqXG4gKiBDb252ZXJ0cyBgZnVuY2AgdG8gaXRzIHNvdXJjZSBjb2RlLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBjb252ZXJ0LlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgc291cmNlIGNvZGUuXG4gKi9cbmZ1bmN0aW9uIHRvU291cmNlKGZ1bmMpIHtcbiAgaWYgKGZ1bmMgIT0gbnVsbCkge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gZnVuY1RvU3RyaW5nLmNhbGwoZnVuYyk7XG4gICAgfSBjYXRjaCAoZSkge31cbiAgICB0cnkge1xuICAgICAgcmV0dXJuIChmdW5jICsgJycpO1xuICAgIH0gY2F0Y2ggKGUpIHt9XG4gIH1cbiAgcmV0dXJuICcnO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRvU291cmNlO1xuIiwidmFyIGlzRnVuY3Rpb24gPSByZXF1aXJlKCcuL2lzRnVuY3Rpb24nKSxcbiAgICBpc01hc2tlZCA9IHJlcXVpcmUoJy4vX2lzTWFza2VkJyksXG4gICAgaXNPYmplY3QgPSByZXF1aXJlKCcuL2lzT2JqZWN0JyksXG4gICAgdG9Tb3VyY2UgPSByZXF1aXJlKCcuL190b1NvdXJjZScpO1xuXG4vKipcbiAqIFVzZWQgdG8gbWF0Y2ggYFJlZ0V4cGBcbiAqIFtzeW50YXggY2hhcmFjdGVyc10oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtcGF0dGVybnMpLlxuICovXG52YXIgcmVSZWdFeHBDaGFyID0gL1tcXFxcXiQuKis/KClbXFxde318XS9nO1xuXG4vKiogVXNlZCB0byBkZXRlY3QgaG9zdCBjb25zdHJ1Y3RvcnMgKFNhZmFyaSkuICovXG52YXIgcmVJc0hvc3RDdG9yID0gL15cXFtvYmplY3QgLis/Q29uc3RydWN0b3JcXF0kLztcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIGZ1bmNQcm90byA9IEZ1bmN0aW9uLnByb3RvdHlwZSxcbiAgICBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIHJlc29sdmUgdGhlIGRlY29tcGlsZWQgc291cmNlIG9mIGZ1bmN0aW9ucy4gKi9cbnZhciBmdW5jVG9TdHJpbmcgPSBmdW5jUHJvdG8udG9TdHJpbmc7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBpZiBhIG1ldGhvZCBpcyBuYXRpdmUuICovXG52YXIgcmVJc05hdGl2ZSA9IFJlZ0V4cCgnXicgK1xuICBmdW5jVG9TdHJpbmcuY2FsbChoYXNPd25Qcm9wZXJ0eSkucmVwbGFjZShyZVJlZ0V4cENoYXIsICdcXFxcJCYnKVxuICAucmVwbGFjZSgvaGFzT3duUHJvcGVydHl8KGZ1bmN0aW9uKS4qPyg/PVxcXFxcXCgpfCBmb3IgLis/KD89XFxcXFxcXSkvZywgJyQxLio/JykgKyAnJCdcbik7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uaXNOYXRpdmVgIHdpdGhvdXQgYmFkIHNoaW0gY2hlY2tzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgbmF0aXZlIGZ1bmN0aW9uLFxuICogIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gYmFzZUlzTmF0aXZlKHZhbHVlKSB7XG4gIGlmICghaXNPYmplY3QodmFsdWUpIHx8IGlzTWFza2VkKHZhbHVlKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICB2YXIgcGF0dGVybiA9IGlzRnVuY3Rpb24odmFsdWUpID8gcmVJc05hdGl2ZSA6IHJlSXNIb3N0Q3RvcjtcbiAgcmV0dXJuIHBhdHRlcm4udGVzdCh0b1NvdXJjZSh2YWx1ZSkpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VJc05hdGl2ZTtcbiIsIi8qKlxuICogR2V0cyB0aGUgdmFsdWUgYXQgYGtleWAgb2YgYG9iamVjdGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb2JqZWN0XSBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBwcm9wZXJ0eSB0byBnZXQuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgcHJvcGVydHkgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIGdldFZhbHVlKG9iamVjdCwga2V5KSB7XG4gIHJldHVybiBvYmplY3QgPT0gbnVsbCA/IHVuZGVmaW5lZCA6IG9iamVjdFtrZXldO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldFZhbHVlO1xuIiwidmFyIGJhc2VJc05hdGl2ZSA9IHJlcXVpcmUoJy4vX2Jhc2VJc05hdGl2ZScpLFxuICAgIGdldFZhbHVlID0gcmVxdWlyZSgnLi9fZ2V0VmFsdWUnKTtcblxuLyoqXG4gKiBHZXRzIHRoZSBuYXRpdmUgZnVuY3Rpb24gYXQgYGtleWAgb2YgYG9iamVjdGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgbWV0aG9kIHRvIGdldC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBmdW5jdGlvbiBpZiBpdCdzIG5hdGl2ZSwgZWxzZSBgdW5kZWZpbmVkYC5cbiAqL1xuZnVuY3Rpb24gZ2V0TmF0aXZlKG9iamVjdCwga2V5KSB7XG4gIHZhciB2YWx1ZSA9IGdldFZhbHVlKG9iamVjdCwga2V5KTtcbiAgcmV0dXJuIGJhc2VJc05hdGl2ZSh2YWx1ZSkgPyB2YWx1ZSA6IHVuZGVmaW5lZDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZXROYXRpdmU7XG4iLCJ2YXIgZ2V0TmF0aXZlID0gcmVxdWlyZSgnLi9fZ2V0TmF0aXZlJyksXG4gICAgcm9vdCA9IHJlcXVpcmUoJy4vX3Jvb3QnKTtcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgdGhhdCBhcmUgdmVyaWZpZWQgdG8gYmUgbmF0aXZlLiAqL1xudmFyIE1hcCA9IGdldE5hdGl2ZShyb290LCAnTWFwJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gTWFwO1xuIiwidmFyIGdldE5hdGl2ZSA9IHJlcXVpcmUoJy4vX2dldE5hdGl2ZScpO1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyB0aGF0IGFyZSB2ZXJpZmllZCB0byBiZSBuYXRpdmUuICovXG52YXIgbmF0aXZlQ3JlYXRlID0gZ2V0TmF0aXZlKE9iamVjdCwgJ2NyZWF0ZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5hdGl2ZUNyZWF0ZTtcbiIsInZhciBuYXRpdmVDcmVhdGUgPSByZXF1aXJlKCcuL19uYXRpdmVDcmVhdGUnKTtcblxuLyoqXG4gKiBSZW1vdmVzIGFsbCBrZXktdmFsdWUgZW50cmllcyBmcm9tIHRoZSBoYXNoLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBjbGVhclxuICogQG1lbWJlck9mIEhhc2hcbiAqL1xuZnVuY3Rpb24gaGFzaENsZWFyKCkge1xuICB0aGlzLl9fZGF0YV9fID0gbmF0aXZlQ3JlYXRlID8gbmF0aXZlQ3JlYXRlKG51bGwpIDoge307XG4gIHRoaXMuc2l6ZSA9IDA7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaGFzaENsZWFyO1xuIiwiLyoqXG4gKiBSZW1vdmVzIGBrZXlgIGFuZCBpdHMgdmFsdWUgZnJvbSB0aGUgaGFzaC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgZGVsZXRlXG4gKiBAbWVtYmVyT2YgSGFzaFxuICogQHBhcmFtIHtPYmplY3R9IGhhc2ggVGhlIGhhc2ggdG8gbW9kaWZ5LlxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byByZW1vdmUuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGVudHJ5IHdhcyByZW1vdmVkLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGhhc2hEZWxldGUoa2V5KSB7XG4gIHZhciByZXN1bHQgPSB0aGlzLmhhcyhrZXkpICYmIGRlbGV0ZSB0aGlzLl9fZGF0YV9fW2tleV07XG4gIHRoaXMuc2l6ZSAtPSByZXN1bHQgPyAxIDogMDtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBoYXNoRGVsZXRlO1xuIiwidmFyIG5hdGl2ZUNyZWF0ZSA9IHJlcXVpcmUoJy4vX25hdGl2ZUNyZWF0ZScpO1xuXG4vKiogVXNlZCB0byBzdGFuZC1pbiBmb3IgYHVuZGVmaW5lZGAgaGFzaCB2YWx1ZXMuICovXG52YXIgSEFTSF9VTkRFRklORUQgPSAnX19sb2Rhc2hfaGFzaF91bmRlZmluZWRfXyc7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogR2V0cyB0aGUgaGFzaCB2YWx1ZSBmb3IgYGtleWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGdldFxuICogQG1lbWJlck9mIEhhc2hcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gZ2V0LlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIGVudHJ5IHZhbHVlLlxuICovXG5mdW5jdGlvbiBoYXNoR2V0KGtleSkge1xuICB2YXIgZGF0YSA9IHRoaXMuX19kYXRhX187XG4gIGlmIChuYXRpdmVDcmVhdGUpIHtcbiAgICB2YXIgcmVzdWx0ID0gZGF0YVtrZXldO1xuICAgIHJldHVybiByZXN1bHQgPT09IEhBU0hfVU5ERUZJTkVEID8gdW5kZWZpbmVkIDogcmVzdWx0O1xuICB9XG4gIHJldHVybiBoYXNPd25Qcm9wZXJ0eS5jYWxsKGRhdGEsIGtleSkgPyBkYXRhW2tleV0gOiB1bmRlZmluZWQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaGFzaEdldDtcbiIsInZhciBuYXRpdmVDcmVhdGUgPSByZXF1aXJlKCcuL19uYXRpdmVDcmVhdGUnKTtcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYSBoYXNoIHZhbHVlIGZvciBga2V5YCBleGlzdHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGhhc1xuICogQG1lbWJlck9mIEhhc2hcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgZW50cnkgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYW4gZW50cnkgZm9yIGBrZXlgIGV4aXN0cywgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBoYXNoSGFzKGtleSkge1xuICB2YXIgZGF0YSA9IHRoaXMuX19kYXRhX187XG4gIHJldHVybiBuYXRpdmVDcmVhdGUgPyAoZGF0YVtrZXldICE9PSB1bmRlZmluZWQpIDogaGFzT3duUHJvcGVydHkuY2FsbChkYXRhLCBrZXkpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGhhc2hIYXM7XG4iLCJ2YXIgbmF0aXZlQ3JlYXRlID0gcmVxdWlyZSgnLi9fbmF0aXZlQ3JlYXRlJyk7XG5cbi8qKiBVc2VkIHRvIHN0YW5kLWluIGZvciBgdW5kZWZpbmVkYCBoYXNoIHZhbHVlcy4gKi9cbnZhciBIQVNIX1VOREVGSU5FRCA9ICdfX2xvZGFzaF9oYXNoX3VuZGVmaW5lZF9fJztcblxuLyoqXG4gKiBTZXRzIHRoZSBoYXNoIGBrZXlgIHRvIGB2YWx1ZWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIHNldFxuICogQG1lbWJlck9mIEhhc2hcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gc2V0LlxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gc2V0LlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgaGFzaCBpbnN0YW5jZS5cbiAqL1xuZnVuY3Rpb24gaGFzaFNldChrZXksIHZhbHVlKSB7XG4gIHZhciBkYXRhID0gdGhpcy5fX2RhdGFfXztcbiAgdGhpcy5zaXplICs9IHRoaXMuaGFzKGtleSkgPyAwIDogMTtcbiAgZGF0YVtrZXldID0gKG5hdGl2ZUNyZWF0ZSAmJiB2YWx1ZSA9PT0gdW5kZWZpbmVkKSA/IEhBU0hfVU5ERUZJTkVEIDogdmFsdWU7XG4gIHJldHVybiB0aGlzO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGhhc2hTZXQ7XG4iLCJ2YXIgaGFzaENsZWFyID0gcmVxdWlyZSgnLi9faGFzaENsZWFyJyksXG4gICAgaGFzaERlbGV0ZSA9IHJlcXVpcmUoJy4vX2hhc2hEZWxldGUnKSxcbiAgICBoYXNoR2V0ID0gcmVxdWlyZSgnLi9faGFzaEdldCcpLFxuICAgIGhhc2hIYXMgPSByZXF1aXJlKCcuL19oYXNoSGFzJyksXG4gICAgaGFzaFNldCA9IHJlcXVpcmUoJy4vX2hhc2hTZXQnKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgaGFzaCBvYmplY3QuXG4gKlxuICogQHByaXZhdGVcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtBcnJheX0gW2VudHJpZXNdIFRoZSBrZXktdmFsdWUgcGFpcnMgdG8gY2FjaGUuXG4gKi9cbmZ1bmN0aW9uIEhhc2goZW50cmllcykge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IGVudHJpZXMgPT0gbnVsbCA/IDAgOiBlbnRyaWVzLmxlbmd0aDtcblxuICB0aGlzLmNsZWFyKCk7XG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgdmFyIGVudHJ5ID0gZW50cmllc1tpbmRleF07XG4gICAgdGhpcy5zZXQoZW50cnlbMF0sIGVudHJ5WzFdKTtcbiAgfVxufVxuXG4vLyBBZGQgbWV0aG9kcyB0byBgSGFzaGAuXG5IYXNoLnByb3RvdHlwZS5jbGVhciA9IGhhc2hDbGVhcjtcbkhhc2gucHJvdG90eXBlWydkZWxldGUnXSA9IGhhc2hEZWxldGU7XG5IYXNoLnByb3RvdHlwZS5nZXQgPSBoYXNoR2V0O1xuSGFzaC5wcm90b3R5cGUuaGFzID0gaGFzaEhhcztcbkhhc2gucHJvdG90eXBlLnNldCA9IGhhc2hTZXQ7XG5cbm1vZHVsZS5leHBvcnRzID0gSGFzaDtcbiIsInZhciBIYXNoID0gcmVxdWlyZSgnLi9fSGFzaCcpLFxuICAgIExpc3RDYWNoZSA9IHJlcXVpcmUoJy4vX0xpc3RDYWNoZScpLFxuICAgIE1hcCA9IHJlcXVpcmUoJy4vX01hcCcpO1xuXG4vKipcbiAqIFJlbW92ZXMgYWxsIGtleS12YWx1ZSBlbnRyaWVzIGZyb20gdGhlIG1hcC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgY2xlYXJcbiAqIEBtZW1iZXJPZiBNYXBDYWNoZVxuICovXG5mdW5jdGlvbiBtYXBDYWNoZUNsZWFyKCkge1xuICB0aGlzLnNpemUgPSAwO1xuICB0aGlzLl9fZGF0YV9fID0ge1xuICAgICdoYXNoJzogbmV3IEhhc2gsXG4gICAgJ21hcCc6IG5ldyAoTWFwIHx8IExpc3RDYWNoZSksXG4gICAgJ3N0cmluZyc6IG5ldyBIYXNoXG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbWFwQ2FjaGVDbGVhcjtcbiIsIi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgc3VpdGFibGUgZm9yIHVzZSBhcyB1bmlxdWUgb2JqZWN0IGtleS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBzdWl0YWJsZSwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc0tleWFibGUodmFsdWUpIHtcbiAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsdWU7XG4gIHJldHVybiAodHlwZSA9PSAnc3RyaW5nJyB8fCB0eXBlID09ICdudW1iZXInIHx8IHR5cGUgPT0gJ3N5bWJvbCcgfHwgdHlwZSA9PSAnYm9vbGVhbicpXG4gICAgPyAodmFsdWUgIT09ICdfX3Byb3RvX18nKVxuICAgIDogKHZhbHVlID09PSBudWxsKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc0tleWFibGU7XG4iLCJ2YXIgaXNLZXlhYmxlID0gcmVxdWlyZSgnLi9faXNLZXlhYmxlJyk7XG5cbi8qKlxuICogR2V0cyB0aGUgZGF0YSBmb3IgYG1hcGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBtYXAgVGhlIG1hcCB0byBxdWVyeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIHJlZmVyZW5jZSBrZXkuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgbWFwIGRhdGEuXG4gKi9cbmZ1bmN0aW9uIGdldE1hcERhdGEobWFwLCBrZXkpIHtcbiAgdmFyIGRhdGEgPSBtYXAuX19kYXRhX187XG4gIHJldHVybiBpc0tleWFibGUoa2V5KVxuICAgID8gZGF0YVt0eXBlb2Yga2V5ID09ICdzdHJpbmcnID8gJ3N0cmluZycgOiAnaGFzaCddXG4gICAgOiBkYXRhLm1hcDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZXRNYXBEYXRhO1xuIiwidmFyIGdldE1hcERhdGEgPSByZXF1aXJlKCcuL19nZXRNYXBEYXRhJyk7XG5cbi8qKlxuICogUmVtb3ZlcyBga2V5YCBhbmQgaXRzIHZhbHVlIGZyb20gdGhlIG1hcC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgZGVsZXRlXG4gKiBAbWVtYmVyT2YgTWFwQ2FjaGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gcmVtb3ZlLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBlbnRyeSB3YXMgcmVtb3ZlZCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBtYXBDYWNoZURlbGV0ZShrZXkpIHtcbiAgdmFyIHJlc3VsdCA9IGdldE1hcERhdGEodGhpcywga2V5KVsnZGVsZXRlJ10oa2V5KTtcbiAgdGhpcy5zaXplIC09IHJlc3VsdCA/IDEgOiAwO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG1hcENhY2hlRGVsZXRlO1xuIiwidmFyIGdldE1hcERhdGEgPSByZXF1aXJlKCcuL19nZXRNYXBEYXRhJyk7XG5cbi8qKlxuICogR2V0cyB0aGUgbWFwIHZhbHVlIGZvciBga2V5YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgZ2V0XG4gKiBAbWVtYmVyT2YgTWFwQ2FjaGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gZ2V0LlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIGVudHJ5IHZhbHVlLlxuICovXG5mdW5jdGlvbiBtYXBDYWNoZUdldChrZXkpIHtcbiAgcmV0dXJuIGdldE1hcERhdGEodGhpcywga2V5KS5nZXQoa2V5KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBtYXBDYWNoZUdldDtcbiIsInZhciBnZXRNYXBEYXRhID0gcmVxdWlyZSgnLi9fZ2V0TWFwRGF0YScpO1xuXG4vKipcbiAqIENoZWNrcyBpZiBhIG1hcCB2YWx1ZSBmb3IgYGtleWAgZXhpc3RzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBoYXNcbiAqIEBtZW1iZXJPZiBNYXBDYWNoZVxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBlbnRyeSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBhbiBlbnRyeSBmb3IgYGtleWAgZXhpc3RzLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIG1hcENhY2hlSGFzKGtleSkge1xuICByZXR1cm4gZ2V0TWFwRGF0YSh0aGlzLCBrZXkpLmhhcyhrZXkpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG1hcENhY2hlSGFzO1xuIiwidmFyIGdldE1hcERhdGEgPSByZXF1aXJlKCcuL19nZXRNYXBEYXRhJyk7XG5cbi8qKlxuICogU2V0cyB0aGUgbWFwIGBrZXlgIHRvIGB2YWx1ZWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIHNldFxuICogQG1lbWJlck9mIE1hcENhY2hlXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIHNldC5cbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHNldC5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIG1hcCBjYWNoZSBpbnN0YW5jZS5cbiAqL1xuZnVuY3Rpb24gbWFwQ2FjaGVTZXQoa2V5LCB2YWx1ZSkge1xuICB2YXIgZGF0YSA9IGdldE1hcERhdGEodGhpcywga2V5KSxcbiAgICAgIHNpemUgPSBkYXRhLnNpemU7XG5cbiAgZGF0YS5zZXQoa2V5LCB2YWx1ZSk7XG4gIHRoaXMuc2l6ZSArPSBkYXRhLnNpemUgPT0gc2l6ZSA/IDAgOiAxO1xuICByZXR1cm4gdGhpcztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBtYXBDYWNoZVNldDtcbiIsInZhciBtYXBDYWNoZUNsZWFyID0gcmVxdWlyZSgnLi9fbWFwQ2FjaGVDbGVhcicpLFxuICAgIG1hcENhY2hlRGVsZXRlID0gcmVxdWlyZSgnLi9fbWFwQ2FjaGVEZWxldGUnKSxcbiAgICBtYXBDYWNoZUdldCA9IHJlcXVpcmUoJy4vX21hcENhY2hlR2V0JyksXG4gICAgbWFwQ2FjaGVIYXMgPSByZXF1aXJlKCcuL19tYXBDYWNoZUhhcycpLFxuICAgIG1hcENhY2hlU2V0ID0gcmVxdWlyZSgnLi9fbWFwQ2FjaGVTZXQnKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbWFwIGNhY2hlIG9iamVjdCB0byBzdG9yZSBrZXktdmFsdWUgcGFpcnMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtBcnJheX0gW2VudHJpZXNdIFRoZSBrZXktdmFsdWUgcGFpcnMgdG8gY2FjaGUuXG4gKi9cbmZ1bmN0aW9uIE1hcENhY2hlKGVudHJpZXMpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBlbnRyaWVzID09IG51bGwgPyAwIDogZW50cmllcy5sZW5ndGg7XG5cbiAgdGhpcy5jbGVhcigpO1xuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIHZhciBlbnRyeSA9IGVudHJpZXNbaW5kZXhdO1xuICAgIHRoaXMuc2V0KGVudHJ5WzBdLCBlbnRyeVsxXSk7XG4gIH1cbn1cblxuLy8gQWRkIG1ldGhvZHMgdG8gYE1hcENhY2hlYC5cbk1hcENhY2hlLnByb3RvdHlwZS5jbGVhciA9IG1hcENhY2hlQ2xlYXI7XG5NYXBDYWNoZS5wcm90b3R5cGVbJ2RlbGV0ZSddID0gbWFwQ2FjaGVEZWxldGU7XG5NYXBDYWNoZS5wcm90b3R5cGUuZ2V0ID0gbWFwQ2FjaGVHZXQ7XG5NYXBDYWNoZS5wcm90b3R5cGUuaGFzID0gbWFwQ2FjaGVIYXM7XG5NYXBDYWNoZS5wcm90b3R5cGUuc2V0ID0gbWFwQ2FjaGVTZXQ7XG5cbm1vZHVsZS5leHBvcnRzID0gTWFwQ2FjaGU7XG4iLCJ2YXIgTGlzdENhY2hlID0gcmVxdWlyZSgnLi9fTGlzdENhY2hlJyksXG4gICAgTWFwID0gcmVxdWlyZSgnLi9fTWFwJyksXG4gICAgTWFwQ2FjaGUgPSByZXF1aXJlKCcuL19NYXBDYWNoZScpO1xuXG4vKiogVXNlZCBhcyB0aGUgc2l6ZSB0byBlbmFibGUgbGFyZ2UgYXJyYXkgb3B0aW1pemF0aW9ucy4gKi9cbnZhciBMQVJHRV9BUlJBWV9TSVpFID0gMjAwO1xuXG4vKipcbiAqIFNldHMgdGhlIHN0YWNrIGBrZXlgIHRvIGB2YWx1ZWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIHNldFxuICogQG1lbWJlck9mIFN0YWNrXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIHNldC5cbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHNldC5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIHN0YWNrIGNhY2hlIGluc3RhbmNlLlxuICovXG5mdW5jdGlvbiBzdGFja1NldChrZXksIHZhbHVlKSB7XG4gIHZhciBkYXRhID0gdGhpcy5fX2RhdGFfXztcbiAgaWYgKGRhdGEgaW5zdGFuY2VvZiBMaXN0Q2FjaGUpIHtcbiAgICB2YXIgcGFpcnMgPSBkYXRhLl9fZGF0YV9fO1xuICAgIGlmICghTWFwIHx8IChwYWlycy5sZW5ndGggPCBMQVJHRV9BUlJBWV9TSVpFIC0gMSkpIHtcbiAgICAgIHBhaXJzLnB1c2goW2tleSwgdmFsdWVdKTtcbiAgICAgIHRoaXMuc2l6ZSA9ICsrZGF0YS5zaXplO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIGRhdGEgPSB0aGlzLl9fZGF0YV9fID0gbmV3IE1hcENhY2hlKHBhaXJzKTtcbiAgfVxuICBkYXRhLnNldChrZXksIHZhbHVlKTtcbiAgdGhpcy5zaXplID0gZGF0YS5zaXplO1xuICByZXR1cm4gdGhpcztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzdGFja1NldDtcbiIsInZhciBMaXN0Q2FjaGUgPSByZXF1aXJlKCcuL19MaXN0Q2FjaGUnKSxcbiAgICBzdGFja0NsZWFyID0gcmVxdWlyZSgnLi9fc3RhY2tDbGVhcicpLFxuICAgIHN0YWNrRGVsZXRlID0gcmVxdWlyZSgnLi9fc3RhY2tEZWxldGUnKSxcbiAgICBzdGFja0dldCA9IHJlcXVpcmUoJy4vX3N0YWNrR2V0JyksXG4gICAgc3RhY2tIYXMgPSByZXF1aXJlKCcuL19zdGFja0hhcycpLFxuICAgIHN0YWNrU2V0ID0gcmVxdWlyZSgnLi9fc3RhY2tTZXQnKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgc3RhY2sgY2FjaGUgb2JqZWN0IHRvIHN0b3JlIGtleS12YWx1ZSBwYWlycy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge0FycmF5fSBbZW50cmllc10gVGhlIGtleS12YWx1ZSBwYWlycyB0byBjYWNoZS5cbiAqL1xuZnVuY3Rpb24gU3RhY2soZW50cmllcykge1xuICB2YXIgZGF0YSA9IHRoaXMuX19kYXRhX18gPSBuZXcgTGlzdENhY2hlKGVudHJpZXMpO1xuICB0aGlzLnNpemUgPSBkYXRhLnNpemU7XG59XG5cbi8vIEFkZCBtZXRob2RzIHRvIGBTdGFja2AuXG5TdGFjay5wcm90b3R5cGUuY2xlYXIgPSBzdGFja0NsZWFyO1xuU3RhY2sucHJvdG90eXBlWydkZWxldGUnXSA9IHN0YWNrRGVsZXRlO1xuU3RhY2sucHJvdG90eXBlLmdldCA9IHN0YWNrR2V0O1xuU3RhY2sucHJvdG90eXBlLmhhcyA9IHN0YWNrSGFzO1xuU3RhY2sucHJvdG90eXBlLnNldCA9IHN0YWNrU2V0O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFN0YWNrO1xuIiwiLyoqXG4gKiBBIHNwZWNpYWxpemVkIHZlcnNpb24gb2YgYF8uZm9yRWFjaGAgZm9yIGFycmF5cyB3aXRob3V0IHN1cHBvcnQgZm9yXG4gKiBpdGVyYXRlZSBzaG9ydGhhbmRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fSBbYXJyYXldIFRoZSBhcnJheSB0byBpdGVyYXRlIG92ZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRlZSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIGBhcnJheWAuXG4gKi9cbmZ1bmN0aW9uIGFycmF5RWFjaChhcnJheSwgaXRlcmF0ZWUpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBhcnJheSA9PSBudWxsID8gMCA6IGFycmF5Lmxlbmd0aDtcblxuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIGlmIChpdGVyYXRlZShhcnJheVtpbmRleF0sIGluZGV4LCBhcnJheSkgPT09IGZhbHNlKSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGFycmF5O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFycmF5RWFjaDtcbiIsInZhciBnZXROYXRpdmUgPSByZXF1aXJlKCcuL19nZXROYXRpdmUnKTtcblxudmFyIGRlZmluZVByb3BlcnR5ID0gKGZ1bmN0aW9uKCkge1xuICB0cnkge1xuICAgIHZhciBmdW5jID0gZ2V0TmF0aXZlKE9iamVjdCwgJ2RlZmluZVByb3BlcnR5Jyk7XG4gICAgZnVuYyh7fSwgJycsIHt9KTtcbiAgICByZXR1cm4gZnVuYztcbiAgfSBjYXRjaCAoZSkge31cbn0oKSk7XG5cbm1vZHVsZS5leHBvcnRzID0gZGVmaW5lUHJvcGVydHk7XG4iLCJ2YXIgZGVmaW5lUHJvcGVydHkgPSByZXF1aXJlKCcuL19kZWZpbmVQcm9wZXJ0eScpO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBhc3NpZ25WYWx1ZWAgYW5kIGBhc3NpZ25NZXJnZVZhbHVlYCB3aXRob3V0XG4gKiB2YWx1ZSBjaGVja3MuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBtb2RpZnkuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHByb3BlcnR5IHRvIGFzc2lnbi5cbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGFzc2lnbi5cbiAqL1xuZnVuY3Rpb24gYmFzZUFzc2lnblZhbHVlKG9iamVjdCwga2V5LCB2YWx1ZSkge1xuICBpZiAoa2V5ID09ICdfX3Byb3RvX18nICYmIGRlZmluZVByb3BlcnR5KSB7XG4gICAgZGVmaW5lUHJvcGVydHkob2JqZWN0LCBrZXksIHtcbiAgICAgICdjb25maWd1cmFibGUnOiB0cnVlLFxuICAgICAgJ2VudW1lcmFibGUnOiB0cnVlLFxuICAgICAgJ3ZhbHVlJzogdmFsdWUsXG4gICAgICAnd3JpdGFibGUnOiB0cnVlXG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgb2JqZWN0W2tleV0gPSB2YWx1ZTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VBc3NpZ25WYWx1ZTtcbiIsInZhciBiYXNlQXNzaWduVmFsdWUgPSByZXF1aXJlKCcuL19iYXNlQXNzaWduVmFsdWUnKSxcbiAgICBlcSA9IHJlcXVpcmUoJy4vZXEnKTtcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBBc3NpZ25zIGB2YWx1ZWAgdG8gYGtleWAgb2YgYG9iamVjdGAgaWYgdGhlIGV4aXN0aW5nIHZhbHVlIGlzIG5vdCBlcXVpdmFsZW50XG4gKiB1c2luZyBbYFNhbWVWYWx1ZVplcm9gXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1zYW1ldmFsdWV6ZXJvKVxuICogZm9yIGVxdWFsaXR5IGNvbXBhcmlzb25zLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gbW9kaWZ5LlxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBwcm9wZXJ0eSB0byBhc3NpZ24uXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBhc3NpZ24uXG4gKi9cbmZ1bmN0aW9uIGFzc2lnblZhbHVlKG9iamVjdCwga2V5LCB2YWx1ZSkge1xuICB2YXIgb2JqVmFsdWUgPSBvYmplY3Rba2V5XTtcbiAgaWYgKCEoaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIGtleSkgJiYgZXEob2JqVmFsdWUsIHZhbHVlKSkgfHxcbiAgICAgICh2YWx1ZSA9PT0gdW5kZWZpbmVkICYmICEoa2V5IGluIG9iamVjdCkpKSB7XG4gICAgYmFzZUFzc2lnblZhbHVlKG9iamVjdCwga2V5LCB2YWx1ZSk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBhc3NpZ25WYWx1ZTtcbiIsInZhciBhc3NpZ25WYWx1ZSA9IHJlcXVpcmUoJy4vX2Fzc2lnblZhbHVlJyksXG4gICAgYmFzZUFzc2lnblZhbHVlID0gcmVxdWlyZSgnLi9fYmFzZUFzc2lnblZhbHVlJyk7XG5cbi8qKlxuICogQ29waWVzIHByb3BlcnRpZXMgb2YgYHNvdXJjZWAgdG8gYG9iamVjdGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBzb3VyY2UgVGhlIG9iamVjdCB0byBjb3B5IHByb3BlcnRpZXMgZnJvbS5cbiAqIEBwYXJhbSB7QXJyYXl9IHByb3BzIFRoZSBwcm9wZXJ0eSBpZGVudGlmaWVycyB0byBjb3B5LlxuICogQHBhcmFtIHtPYmplY3R9IFtvYmplY3Q9e31dIFRoZSBvYmplY3QgdG8gY29weSBwcm9wZXJ0aWVzIHRvLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2N1c3RvbWl6ZXJdIFRoZSBmdW5jdGlvbiB0byBjdXN0b21pemUgY29waWVkIHZhbHVlcy5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgYG9iamVjdGAuXG4gKi9cbmZ1bmN0aW9uIGNvcHlPYmplY3Qoc291cmNlLCBwcm9wcywgb2JqZWN0LCBjdXN0b21pemVyKSB7XG4gIHZhciBpc05ldyA9ICFvYmplY3Q7XG4gIG9iamVjdCB8fCAob2JqZWN0ID0ge30pO1xuXG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gcHJvcHMubGVuZ3RoO1xuXG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgdmFyIGtleSA9IHByb3BzW2luZGV4XTtcblxuICAgIHZhciBuZXdWYWx1ZSA9IGN1c3RvbWl6ZXJcbiAgICAgID8gY3VzdG9taXplcihvYmplY3Rba2V5XSwgc291cmNlW2tleV0sIGtleSwgb2JqZWN0LCBzb3VyY2UpXG4gICAgICA6IHVuZGVmaW5lZDtcblxuICAgIGlmIChuZXdWYWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBuZXdWYWx1ZSA9IHNvdXJjZVtrZXldO1xuICAgIH1cbiAgICBpZiAoaXNOZXcpIHtcbiAgICAgIGJhc2VBc3NpZ25WYWx1ZShvYmplY3QsIGtleSwgbmV3VmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhc3NpZ25WYWx1ZShvYmplY3QsIGtleSwgbmV3VmFsdWUpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gb2JqZWN0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNvcHlPYmplY3Q7XG4iLCIvKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLnRpbWVzYCB3aXRob3V0IHN1cHBvcnQgZm9yIGl0ZXJhdGVlIHNob3J0aGFuZHNcbiAqIG9yIG1heCBhcnJheSBsZW5ndGggY2hlY2tzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge251bWJlcn0gbiBUaGUgbnVtYmVyIG9mIHRpbWVzIHRvIGludm9rZSBgaXRlcmF0ZWVgLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0ZWUgVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcmVzdWx0cy5cbiAqL1xuZnVuY3Rpb24gYmFzZVRpbWVzKG4sIGl0ZXJhdGVlKSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgcmVzdWx0ID0gQXJyYXkobik7XG5cbiAgd2hpbGUgKCsraW5kZXggPCBuKSB7XG4gICAgcmVzdWx0W2luZGV4XSA9IGl0ZXJhdGVlKGluZGV4KTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VUaW1lcztcbiIsIi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgb2JqZWN0LWxpa2UuIEEgdmFsdWUgaXMgb2JqZWN0LWxpa2UgaWYgaXQncyBub3QgYG51bGxgXG4gKiBhbmQgaGFzIGEgYHR5cGVvZmAgcmVzdWx0IG9mIFwib2JqZWN0XCIuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgb2JqZWN0LWxpa2UsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc09iamVjdExpa2Uoe30pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdExpa2UoXy5ub29wKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc09iamVjdExpa2UobnVsbCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdExpa2UodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlICE9IG51bGwgJiYgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzT2JqZWN0TGlrZTtcbiIsInZhciBiYXNlR2V0VGFnID0gcmVxdWlyZSgnLi9fYmFzZUdldFRhZycpLFxuICAgIGlzT2JqZWN0TGlrZSA9IHJlcXVpcmUoJy4vaXNPYmplY3RMaWtlJyk7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBhcmdzVGFnID0gJ1tvYmplY3QgQXJndW1lbnRzXSc7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uaXNBcmd1bWVudHNgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFuIGBhcmd1bWVudHNgIG9iamVjdCxcbiAqL1xuZnVuY3Rpb24gYmFzZUlzQXJndW1lbnRzKHZhbHVlKSB7XG4gIHJldHVybiBpc09iamVjdExpa2UodmFsdWUpICYmIGJhc2VHZXRUYWcodmFsdWUpID09IGFyZ3NUYWc7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUlzQXJndW1lbnRzO1xuIiwidmFyIGJhc2VJc0FyZ3VtZW50cyA9IHJlcXVpcmUoJy4vX2Jhc2VJc0FyZ3VtZW50cycpLFxuICAgIGlzT2JqZWN0TGlrZSA9IHJlcXVpcmUoJy4vaXNPYmplY3RMaWtlJyk7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIHByb3BlcnR5SXNFbnVtZXJhYmxlID0gb2JqZWN0UHJvdG8ucHJvcGVydHlJc0VudW1lcmFibGU7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgbGlrZWx5IGFuIGBhcmd1bWVudHNgIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhbiBgYXJndW1lbnRzYCBvYmplY3QsXG4gKiAgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzQXJndW1lbnRzKGZ1bmN0aW9uKCkgeyByZXR1cm4gYXJndW1lbnRzOyB9KCkpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcmd1bWVudHMoWzEsIDIsIDNdKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbnZhciBpc0FyZ3VtZW50cyA9IGJhc2VJc0FyZ3VtZW50cyhmdW5jdGlvbigpIHsgcmV0dXJuIGFyZ3VtZW50czsgfSgpKSA/IGJhc2VJc0FyZ3VtZW50cyA6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiBpc09iamVjdExpa2UodmFsdWUpICYmIGhhc093blByb3BlcnR5LmNhbGwodmFsdWUsICdjYWxsZWUnKSAmJlxuICAgICFwcm9wZXJ0eUlzRW51bWVyYWJsZS5jYWxsKHZhbHVlLCAnY2FsbGVlJyk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGlzQXJndW1lbnRzO1xuIiwiLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBjbGFzc2lmaWVkIGFzIGFuIGBBcnJheWAgb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFuIGFycmF5LCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNBcnJheShbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcnJheShkb2N1bWVudC5ib2R5LmNoaWxkcmVuKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc0FycmF5KCdhYmMnKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc0FycmF5KF8ubm9vcCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXk7XG5cbm1vZHVsZS5leHBvcnRzID0gaXNBcnJheTtcbiIsIi8qKlxuICogVGhpcyBtZXRob2QgcmV0dXJucyBgZmFsc2VgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4xMy4wXG4gKiBAY2F0ZWdvcnkgVXRpbFxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy50aW1lcygyLCBfLnN0dWJGYWxzZSk7XG4gKiAvLyA9PiBbZmFsc2UsIGZhbHNlXVxuICovXG5mdW5jdGlvbiBzdHViRmFsc2UoKSB7XG4gIHJldHVybiBmYWxzZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzdHViRmFsc2U7XG4iLCJ2YXIgcm9vdCA9IHJlcXVpcmUoJy4vX3Jvb3QnKSxcbiAgICBzdHViRmFsc2UgPSByZXF1aXJlKCcuL3N0dWJGYWxzZScpO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYGV4cG9ydHNgLiAqL1xudmFyIGZyZWVFeHBvcnRzID0gdHlwZW9mIGV4cG9ydHMgPT0gJ29iamVjdCcgJiYgZXhwb3J0cyAmJiAhZXhwb3J0cy5ub2RlVHlwZSAmJiBleHBvcnRzO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYG1vZHVsZWAuICovXG52YXIgZnJlZU1vZHVsZSA9IGZyZWVFeHBvcnRzICYmIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlICYmICFtb2R1bGUubm9kZVR5cGUgJiYgbW9kdWxlO1xuXG4vKiogRGV0ZWN0IHRoZSBwb3B1bGFyIENvbW1vbkpTIGV4dGVuc2lvbiBgbW9kdWxlLmV4cG9ydHNgLiAqL1xudmFyIG1vZHVsZUV4cG9ydHMgPSBmcmVlTW9kdWxlICYmIGZyZWVNb2R1bGUuZXhwb3J0cyA9PT0gZnJlZUV4cG9ydHM7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIEJ1ZmZlciA9IG1vZHVsZUV4cG9ydHMgPyByb290LkJ1ZmZlciA6IHVuZGVmaW5lZDtcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgZm9yIHRob3NlIHdpdGggdGhlIHNhbWUgbmFtZSBhcyBvdGhlciBgbG9kYXNoYCBtZXRob2RzLiAqL1xudmFyIG5hdGl2ZUlzQnVmZmVyID0gQnVmZmVyID8gQnVmZmVyLmlzQnVmZmVyIDogdW5kZWZpbmVkO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgYnVmZmVyLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4zLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgYnVmZmVyLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNCdWZmZXIobmV3IEJ1ZmZlcigyKSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0J1ZmZlcihuZXcgVWludDhBcnJheSgyKSk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG52YXIgaXNCdWZmZXIgPSBuYXRpdmVJc0J1ZmZlciB8fCBzdHViRmFsc2U7XG5cbm1vZHVsZS5leHBvcnRzID0gaXNCdWZmZXI7XG4iLCIvKiogVXNlZCBhcyByZWZlcmVuY2VzIGZvciB2YXJpb3VzIGBOdW1iZXJgIGNvbnN0YW50cy4gKi9cbnZhciBNQVhfU0FGRV9JTlRFR0VSID0gOTAwNzE5OTI1NDc0MDk5MTtcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IHVuc2lnbmVkIGludGVnZXIgdmFsdWVzLiAqL1xudmFyIHJlSXNVaW50ID0gL14oPzowfFsxLTldXFxkKikkLztcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIHZhbGlkIGFycmF5LWxpa2UgaW5kZXguXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHBhcmFtIHtudW1iZXJ9IFtsZW5ndGg9TUFYX1NBRkVfSU5URUdFUl0gVGhlIHVwcGVyIGJvdW5kcyBvZiBhIHZhbGlkIGluZGV4LlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSB2YWxpZCBpbmRleCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc0luZGV4KHZhbHVlLCBsZW5ndGgpIHtcbiAgbGVuZ3RoID0gbGVuZ3RoID09IG51bGwgPyBNQVhfU0FGRV9JTlRFR0VSIDogbGVuZ3RoO1xuICByZXR1cm4gISFsZW5ndGggJiZcbiAgICAodHlwZW9mIHZhbHVlID09ICdudW1iZXInIHx8IHJlSXNVaW50LnRlc3QodmFsdWUpKSAmJlxuICAgICh2YWx1ZSA+IC0xICYmIHZhbHVlICUgMSA9PSAwICYmIHZhbHVlIDwgbGVuZ3RoKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc0luZGV4O1xuIiwiLyoqIFVzZWQgYXMgcmVmZXJlbmNlcyBmb3IgdmFyaW91cyBgTnVtYmVyYCBjb25zdGFudHMuICovXG52YXIgTUFYX1NBRkVfSU5URUdFUiA9IDkwMDcxOTkyNTQ3NDA5OTE7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSB2YWxpZCBhcnJheS1saWtlIGxlbmd0aC5cbiAqXG4gKiAqKk5vdGU6KiogVGhpcyBtZXRob2QgaXMgbG9vc2VseSBiYXNlZCBvblxuICogW2BUb0xlbmd0aGBdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLXRvbGVuZ3RoKS5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHZhbGlkIGxlbmd0aCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzTGVuZ3RoKDMpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNMZW5ndGgoTnVtYmVyLk1JTl9WQUxVRSk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNMZW5ndGgoSW5maW5pdHkpO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzTGVuZ3RoKCczJyk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0xlbmd0aCh2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09ICdudW1iZXInICYmXG4gICAgdmFsdWUgPiAtMSAmJiB2YWx1ZSAlIDEgPT0gMCAmJiB2YWx1ZSA8PSBNQVhfU0FGRV9JTlRFR0VSO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzTGVuZ3RoO1xuIiwidmFyIGJhc2VHZXRUYWcgPSByZXF1aXJlKCcuL19iYXNlR2V0VGFnJyksXG4gICAgaXNMZW5ndGggPSByZXF1aXJlKCcuL2lzTGVuZ3RoJyksXG4gICAgaXNPYmplY3RMaWtlID0gcmVxdWlyZSgnLi9pc09iamVjdExpa2UnKTtcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIGFyZ3NUYWcgPSAnW29iamVjdCBBcmd1bWVudHNdJyxcbiAgICBhcnJheVRhZyA9ICdbb2JqZWN0IEFycmF5XScsXG4gICAgYm9vbFRhZyA9ICdbb2JqZWN0IEJvb2xlYW5dJyxcbiAgICBkYXRlVGFnID0gJ1tvYmplY3QgRGF0ZV0nLFxuICAgIGVycm9yVGFnID0gJ1tvYmplY3QgRXJyb3JdJyxcbiAgICBmdW5jVGFnID0gJ1tvYmplY3QgRnVuY3Rpb25dJyxcbiAgICBtYXBUYWcgPSAnW29iamVjdCBNYXBdJyxcbiAgICBudW1iZXJUYWcgPSAnW29iamVjdCBOdW1iZXJdJyxcbiAgICBvYmplY3RUYWcgPSAnW29iamVjdCBPYmplY3RdJyxcbiAgICByZWdleHBUYWcgPSAnW29iamVjdCBSZWdFeHBdJyxcbiAgICBzZXRUYWcgPSAnW29iamVjdCBTZXRdJyxcbiAgICBzdHJpbmdUYWcgPSAnW29iamVjdCBTdHJpbmddJyxcbiAgICB3ZWFrTWFwVGFnID0gJ1tvYmplY3QgV2Vha01hcF0nO1xuXG52YXIgYXJyYXlCdWZmZXJUYWcgPSAnW29iamVjdCBBcnJheUJ1ZmZlcl0nLFxuICAgIGRhdGFWaWV3VGFnID0gJ1tvYmplY3QgRGF0YVZpZXddJyxcbiAgICBmbG9hdDMyVGFnID0gJ1tvYmplY3QgRmxvYXQzMkFycmF5XScsXG4gICAgZmxvYXQ2NFRhZyA9ICdbb2JqZWN0IEZsb2F0NjRBcnJheV0nLFxuICAgIGludDhUYWcgPSAnW29iamVjdCBJbnQ4QXJyYXldJyxcbiAgICBpbnQxNlRhZyA9ICdbb2JqZWN0IEludDE2QXJyYXldJyxcbiAgICBpbnQzMlRhZyA9ICdbb2JqZWN0IEludDMyQXJyYXldJyxcbiAgICB1aW50OFRhZyA9ICdbb2JqZWN0IFVpbnQ4QXJyYXldJyxcbiAgICB1aW50OENsYW1wZWRUYWcgPSAnW29iamVjdCBVaW50OENsYW1wZWRBcnJheV0nLFxuICAgIHVpbnQxNlRhZyA9ICdbb2JqZWN0IFVpbnQxNkFycmF5XScsXG4gICAgdWludDMyVGFnID0gJ1tvYmplY3QgVWludDMyQXJyYXldJztcblxuLyoqIFVzZWQgdG8gaWRlbnRpZnkgYHRvU3RyaW5nVGFnYCB2YWx1ZXMgb2YgdHlwZWQgYXJyYXlzLiAqL1xudmFyIHR5cGVkQXJyYXlUYWdzID0ge307XG50eXBlZEFycmF5VGFnc1tmbG9hdDMyVGFnXSA9IHR5cGVkQXJyYXlUYWdzW2Zsb2F0NjRUYWddID1cbnR5cGVkQXJyYXlUYWdzW2ludDhUYWddID0gdHlwZWRBcnJheVRhZ3NbaW50MTZUYWddID1cbnR5cGVkQXJyYXlUYWdzW2ludDMyVGFnXSA9IHR5cGVkQXJyYXlUYWdzW3VpbnQ4VGFnXSA9XG50eXBlZEFycmF5VGFnc1t1aW50OENsYW1wZWRUYWddID0gdHlwZWRBcnJheVRhZ3NbdWludDE2VGFnXSA9XG50eXBlZEFycmF5VGFnc1t1aW50MzJUYWddID0gdHJ1ZTtcbnR5cGVkQXJyYXlUYWdzW2FyZ3NUYWddID0gdHlwZWRBcnJheVRhZ3NbYXJyYXlUYWddID1cbnR5cGVkQXJyYXlUYWdzW2FycmF5QnVmZmVyVGFnXSA9IHR5cGVkQXJyYXlUYWdzW2Jvb2xUYWddID1cbnR5cGVkQXJyYXlUYWdzW2RhdGFWaWV3VGFnXSA9IHR5cGVkQXJyYXlUYWdzW2RhdGVUYWddID1cbnR5cGVkQXJyYXlUYWdzW2Vycm9yVGFnXSA9IHR5cGVkQXJyYXlUYWdzW2Z1bmNUYWddID1cbnR5cGVkQXJyYXlUYWdzW21hcFRhZ10gPSB0eXBlZEFycmF5VGFnc1tudW1iZXJUYWddID1cbnR5cGVkQXJyYXlUYWdzW29iamVjdFRhZ10gPSB0eXBlZEFycmF5VGFnc1tyZWdleHBUYWddID1cbnR5cGVkQXJyYXlUYWdzW3NldFRhZ10gPSB0eXBlZEFycmF5VGFnc1tzdHJpbmdUYWddID1cbnR5cGVkQXJyYXlUYWdzW3dlYWtNYXBUYWddID0gZmFsc2U7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uaXNUeXBlZEFycmF5YCB3aXRob3V0IE5vZGUuanMgb3B0aW1pemF0aW9ucy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHR5cGVkIGFycmF5LCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGJhc2VJc1R5cGVkQXJyYXkodmFsdWUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0TGlrZSh2YWx1ZSkgJiZcbiAgICBpc0xlbmd0aCh2YWx1ZS5sZW5ndGgpICYmICEhdHlwZWRBcnJheVRhZ3NbYmFzZUdldFRhZyh2YWx1ZSldO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VJc1R5cGVkQXJyYXk7XG4iLCIvKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLnVuYXJ5YCB3aXRob3V0IHN1cHBvcnQgZm9yIHN0b3JpbmcgbWV0YWRhdGEuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGNhcCBhcmd1bWVudHMgZm9yLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgY2FwcGVkIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBiYXNlVW5hcnkoZnVuYykge1xuICByZXR1cm4gZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gZnVuYyh2YWx1ZSk7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZVVuYXJ5O1xuIiwidmFyIGZyZWVHbG9iYWwgPSByZXF1aXJlKCcuL19mcmVlR2xvYmFsJyk7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgZXhwb3J0c2AuICovXG52YXIgZnJlZUV4cG9ydHMgPSB0eXBlb2YgZXhwb3J0cyA9PSAnb2JqZWN0JyAmJiBleHBvcnRzICYmICFleHBvcnRzLm5vZGVUeXBlICYmIGV4cG9ydHM7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgbW9kdWxlYC4gKi9cbnZhciBmcmVlTW9kdWxlID0gZnJlZUV4cG9ydHMgJiYgdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUgJiYgIW1vZHVsZS5ub2RlVHlwZSAmJiBtb2R1bGU7XG5cbi8qKiBEZXRlY3QgdGhlIHBvcHVsYXIgQ29tbW9uSlMgZXh0ZW5zaW9uIGBtb2R1bGUuZXhwb3J0c2AuICovXG52YXIgbW9kdWxlRXhwb3J0cyA9IGZyZWVNb2R1bGUgJiYgZnJlZU1vZHVsZS5leHBvcnRzID09PSBmcmVlRXhwb3J0cztcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBwcm9jZXNzYCBmcm9tIE5vZGUuanMuICovXG52YXIgZnJlZVByb2Nlc3MgPSBtb2R1bGVFeHBvcnRzICYmIGZyZWVHbG9iYWwucHJvY2VzcztcblxuLyoqIFVzZWQgdG8gYWNjZXNzIGZhc3RlciBOb2RlLmpzIGhlbHBlcnMuICovXG52YXIgbm9kZVV0aWwgPSAoZnVuY3Rpb24oKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGZyZWVQcm9jZXNzICYmIGZyZWVQcm9jZXNzLmJpbmRpbmcgJiYgZnJlZVByb2Nlc3MuYmluZGluZygndXRpbCcpO1xuICB9IGNhdGNoIChlKSB7fVxufSgpKTtcblxubW9kdWxlLmV4cG9ydHMgPSBub2RlVXRpbDtcbiIsInZhciBiYXNlSXNUeXBlZEFycmF5ID0gcmVxdWlyZSgnLi9fYmFzZUlzVHlwZWRBcnJheScpLFxuICAgIGJhc2VVbmFyeSA9IHJlcXVpcmUoJy4vX2Jhc2VVbmFyeScpLFxuICAgIG5vZGVVdGlsID0gcmVxdWlyZSgnLi9fbm9kZVV0aWwnKTtcblxuLyogTm9kZS5qcyBoZWxwZXIgcmVmZXJlbmNlcy4gKi9cbnZhciBub2RlSXNUeXBlZEFycmF5ID0gbm9kZVV0aWwgJiYgbm9kZVV0aWwuaXNUeXBlZEFycmF5O1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYSB0eXBlZCBhcnJheS5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDMuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHR5cGVkIGFycmF5LCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNUeXBlZEFycmF5KG5ldyBVaW50OEFycmF5KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzVHlwZWRBcnJheShbXSk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG52YXIgaXNUeXBlZEFycmF5ID0gbm9kZUlzVHlwZWRBcnJheSA/IGJhc2VVbmFyeShub2RlSXNUeXBlZEFycmF5KSA6IGJhc2VJc1R5cGVkQXJyYXk7XG5cbm1vZHVsZS5leHBvcnRzID0gaXNUeXBlZEFycmF5O1xuIiwidmFyIGJhc2VUaW1lcyA9IHJlcXVpcmUoJy4vX2Jhc2VUaW1lcycpLFxuICAgIGlzQXJndW1lbnRzID0gcmVxdWlyZSgnLi9pc0FyZ3VtZW50cycpLFxuICAgIGlzQXJyYXkgPSByZXF1aXJlKCcuL2lzQXJyYXknKSxcbiAgICBpc0J1ZmZlciA9IHJlcXVpcmUoJy4vaXNCdWZmZXInKSxcbiAgICBpc0luZGV4ID0gcmVxdWlyZSgnLi9faXNJbmRleCcpLFxuICAgIGlzVHlwZWRBcnJheSA9IHJlcXVpcmUoJy4vaXNUeXBlZEFycmF5Jyk7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhcnJheSBvZiB0aGUgZW51bWVyYWJsZSBwcm9wZXJ0eSBuYW1lcyBvZiB0aGUgYXJyYXktbGlrZSBgdmFsdWVgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBxdWVyeS5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gaW5oZXJpdGVkIFNwZWNpZnkgcmV0dXJuaW5nIGluaGVyaXRlZCBwcm9wZXJ0eSBuYW1lcy5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMuXG4gKi9cbmZ1bmN0aW9uIGFycmF5TGlrZUtleXModmFsdWUsIGluaGVyaXRlZCkge1xuICB2YXIgaXNBcnIgPSBpc0FycmF5KHZhbHVlKSxcbiAgICAgIGlzQXJnID0gIWlzQXJyICYmIGlzQXJndW1lbnRzKHZhbHVlKSxcbiAgICAgIGlzQnVmZiA9ICFpc0FyciAmJiAhaXNBcmcgJiYgaXNCdWZmZXIodmFsdWUpLFxuICAgICAgaXNUeXBlID0gIWlzQXJyICYmICFpc0FyZyAmJiAhaXNCdWZmICYmIGlzVHlwZWRBcnJheSh2YWx1ZSksXG4gICAgICBza2lwSW5kZXhlcyA9IGlzQXJyIHx8IGlzQXJnIHx8IGlzQnVmZiB8fCBpc1R5cGUsXG4gICAgICByZXN1bHQgPSBza2lwSW5kZXhlcyA/IGJhc2VUaW1lcyh2YWx1ZS5sZW5ndGgsIFN0cmluZykgOiBbXSxcbiAgICAgIGxlbmd0aCA9IHJlc3VsdC5sZW5ndGg7XG5cbiAgZm9yICh2YXIga2V5IGluIHZhbHVlKSB7XG4gICAgaWYgKChpbmhlcml0ZWQgfHwgaGFzT3duUHJvcGVydHkuY2FsbCh2YWx1ZSwga2V5KSkgJiZcbiAgICAgICAgIShza2lwSW5kZXhlcyAmJiAoXG4gICAgICAgICAgIC8vIFNhZmFyaSA5IGhhcyBlbnVtZXJhYmxlIGBhcmd1bWVudHMubGVuZ3RoYCBpbiBzdHJpY3QgbW9kZS5cbiAgICAgICAgICAga2V5ID09ICdsZW5ndGgnIHx8XG4gICAgICAgICAgIC8vIE5vZGUuanMgMC4xMCBoYXMgZW51bWVyYWJsZSBub24taW5kZXggcHJvcGVydGllcyBvbiBidWZmZXJzLlxuICAgICAgICAgICAoaXNCdWZmICYmIChrZXkgPT0gJ29mZnNldCcgfHwga2V5ID09ICdwYXJlbnQnKSkgfHxcbiAgICAgICAgICAgLy8gUGhhbnRvbUpTIDIgaGFzIGVudW1lcmFibGUgbm9uLWluZGV4IHByb3BlcnRpZXMgb24gdHlwZWQgYXJyYXlzLlxuICAgICAgICAgICAoaXNUeXBlICYmIChrZXkgPT0gJ2J1ZmZlcicgfHwga2V5ID09ICdieXRlTGVuZ3RoJyB8fCBrZXkgPT0gJ2J5dGVPZmZzZXQnKSkgfHxcbiAgICAgICAgICAgLy8gU2tpcCBpbmRleCBwcm9wZXJ0aWVzLlxuICAgICAgICAgICBpc0luZGV4KGtleSwgbGVuZ3RoKVxuICAgICAgICApKSkge1xuICAgICAgcmVzdWx0LnB1c2goa2V5KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBhcnJheUxpa2VLZXlzO1xuIiwiLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBsaWtlbHkgYSBwcm90b3R5cGUgb2JqZWN0LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgcHJvdG90eXBlLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGlzUHJvdG90eXBlKHZhbHVlKSB7XG4gIHZhciBDdG9yID0gdmFsdWUgJiYgdmFsdWUuY29uc3RydWN0b3IsXG4gICAgICBwcm90byA9ICh0eXBlb2YgQ3RvciA9PSAnZnVuY3Rpb24nICYmIEN0b3IucHJvdG90eXBlKSB8fCBvYmplY3RQcm90bztcblxuICByZXR1cm4gdmFsdWUgPT09IHByb3RvO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzUHJvdG90eXBlO1xuIiwiLyoqXG4gKiBDcmVhdGVzIGEgdW5hcnkgZnVuY3Rpb24gdGhhdCBpbnZva2VzIGBmdW5jYCB3aXRoIGl0cyBhcmd1bWVudCB0cmFuc2Zvcm1lZC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gd3JhcC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHRyYW5zZm9ybSBUaGUgYXJndW1lbnQgdHJhbnNmb3JtLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIG92ZXJBcmcoZnVuYywgdHJhbnNmb3JtKSB7XG4gIHJldHVybiBmdW5jdGlvbihhcmcpIHtcbiAgICByZXR1cm4gZnVuYyh0cmFuc2Zvcm0oYXJnKSk7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gb3ZlckFyZztcbiIsInZhciBvdmVyQXJnID0gcmVxdWlyZSgnLi9fb3ZlckFyZycpO1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyBmb3IgdGhvc2Ugd2l0aCB0aGUgc2FtZSBuYW1lIGFzIG90aGVyIGBsb2Rhc2hgIG1ldGhvZHMuICovXG52YXIgbmF0aXZlS2V5cyA9IG92ZXJBcmcoT2JqZWN0LmtleXMsIE9iamVjdCk7XG5cbm1vZHVsZS5leHBvcnRzID0gbmF0aXZlS2V5cztcbiIsInZhciBpc1Byb3RvdHlwZSA9IHJlcXVpcmUoJy4vX2lzUHJvdG90eXBlJyksXG4gICAgbmF0aXZlS2V5cyA9IHJlcXVpcmUoJy4vX25hdGl2ZUtleXMnKTtcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5rZXlzYCB3aGljaCBkb2Vzbid0IHRyZWF0IHNwYXJzZSBhcnJheXMgYXMgZGVuc2UuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMuXG4gKi9cbmZ1bmN0aW9uIGJhc2VLZXlzKG9iamVjdCkge1xuICBpZiAoIWlzUHJvdG90eXBlKG9iamVjdCkpIHtcbiAgICByZXR1cm4gbmF0aXZlS2V5cyhvYmplY3QpO1xuICB9XG4gIHZhciByZXN1bHQgPSBbXTtcbiAgZm9yICh2YXIga2V5IGluIE9iamVjdChvYmplY3QpKSB7XG4gICAgaWYgKGhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBrZXkpICYmIGtleSAhPSAnY29uc3RydWN0b3InKSB7XG4gICAgICByZXN1bHQucHVzaChrZXkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VLZXlzO1xuIiwidmFyIGlzRnVuY3Rpb24gPSByZXF1aXJlKCcuL2lzRnVuY3Rpb24nKSxcbiAgICBpc0xlbmd0aCA9IHJlcXVpcmUoJy4vaXNMZW5ndGgnKTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhcnJheS1saWtlLiBBIHZhbHVlIGlzIGNvbnNpZGVyZWQgYXJyYXktbGlrZSBpZiBpdCdzXG4gKiBub3QgYSBmdW5jdGlvbiBhbmQgaGFzIGEgYHZhbHVlLmxlbmd0aGAgdGhhdCdzIGFuIGludGVnZXIgZ3JlYXRlciB0aGFuIG9yXG4gKiBlcXVhbCB0byBgMGAgYW5kIGxlc3MgdGhhbiBvciBlcXVhbCB0byBgTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVJgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFycmF5LWxpa2UsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0FycmF5TGlrZShbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcnJheUxpa2UoZG9jdW1lbnQuYm9keS5jaGlsZHJlbik7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0FycmF5TGlrZSgnYWJjJyk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0FycmF5TGlrZShfLm5vb3ApO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNBcnJheUxpa2UodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlICE9IG51bGwgJiYgaXNMZW5ndGgodmFsdWUubGVuZ3RoKSAmJiAhaXNGdW5jdGlvbih2YWx1ZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNBcnJheUxpa2U7XG4iLCJ2YXIgYXJyYXlMaWtlS2V5cyA9IHJlcXVpcmUoJy4vX2FycmF5TGlrZUtleXMnKSxcbiAgICBiYXNlS2V5cyA9IHJlcXVpcmUoJy4vX2Jhc2VLZXlzJyksXG4gICAgaXNBcnJheUxpa2UgPSByZXF1aXJlKCcuL2lzQXJyYXlMaWtlJyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhcnJheSBvZiB0aGUgb3duIGVudW1lcmFibGUgcHJvcGVydHkgbmFtZXMgb2YgYG9iamVjdGAuXG4gKlxuICogKipOb3RlOioqIE5vbi1vYmplY3QgdmFsdWVzIGFyZSBjb2VyY2VkIHRvIG9iamVjdHMuIFNlZSB0aGVcbiAqIFtFUyBzcGVjXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1vYmplY3Qua2V5cylcbiAqIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogQHN0YXRpY1xuICogQHNpbmNlIDAuMS4wXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IE9iamVjdFxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcy5cbiAqIEBleGFtcGxlXG4gKlxuICogZnVuY3Rpb24gRm9vKCkge1xuICogICB0aGlzLmEgPSAxO1xuICogICB0aGlzLmIgPSAyO1xuICogfVxuICpcbiAqIEZvby5wcm90b3R5cGUuYyA9IDM7XG4gKlxuICogXy5rZXlzKG5ldyBGb28pO1xuICogLy8gPT4gWydhJywgJ2InXSAoaXRlcmF0aW9uIG9yZGVyIGlzIG5vdCBndWFyYW50ZWVkKVxuICpcbiAqIF8ua2V5cygnaGknKTtcbiAqIC8vID0+IFsnMCcsICcxJ11cbiAqL1xuZnVuY3Rpb24ga2V5cyhvYmplY3QpIHtcbiAgcmV0dXJuIGlzQXJyYXlMaWtlKG9iamVjdCkgPyBhcnJheUxpa2VLZXlzKG9iamVjdCkgOiBiYXNlS2V5cyhvYmplY3QpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGtleXM7XG4iLCJ2YXIgY29weU9iamVjdCA9IHJlcXVpcmUoJy4vX2NvcHlPYmplY3QnKSxcbiAgICBrZXlzID0gcmVxdWlyZSgnLi9rZXlzJyk7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uYXNzaWduYCB3aXRob3V0IHN1cHBvcnQgZm9yIG11bHRpcGxlIHNvdXJjZXNcbiAqIG9yIGBjdXN0b21pemVyYCBmdW5jdGlvbnMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIGRlc3RpbmF0aW9uIG9iamVjdC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBzb3VyY2UgVGhlIHNvdXJjZSBvYmplY3QuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGBvYmplY3RgLlxuICovXG5mdW5jdGlvbiBiYXNlQXNzaWduKG9iamVjdCwgc291cmNlKSB7XG4gIHJldHVybiBvYmplY3QgJiYgY29weU9iamVjdChzb3VyY2UsIGtleXMoc291cmNlKSwgb2JqZWN0KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlQXNzaWduO1xuIiwiLyoqXG4gKiBUaGlzIGZ1bmN0aW9uIGlzIGxpa2VcbiAqIFtgT2JqZWN0LmtleXNgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1vYmplY3Qua2V5cylcbiAqIGV4Y2VwdCB0aGF0IGl0IGluY2x1ZGVzIGluaGVyaXRlZCBlbnVtZXJhYmxlIHByb3BlcnRpZXMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMuXG4gKi9cbmZ1bmN0aW9uIG5hdGl2ZUtleXNJbihvYmplY3QpIHtcbiAgdmFyIHJlc3VsdCA9IFtdO1xuICBpZiAob2JqZWN0ICE9IG51bGwpIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gT2JqZWN0KG9iamVjdCkpIHtcbiAgICAgIHJlc3VsdC5wdXNoKGtleSk7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbmF0aXZlS2V5c0luO1xuIiwidmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9pc09iamVjdCcpLFxuICAgIGlzUHJvdG90eXBlID0gcmVxdWlyZSgnLi9faXNQcm90b3R5cGUnKSxcbiAgICBuYXRpdmVLZXlzSW4gPSByZXF1aXJlKCcuL19uYXRpdmVLZXlzSW4nKTtcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5rZXlzSW5gIHdoaWNoIGRvZXNuJ3QgdHJlYXQgc3BhcnNlIGFycmF5cyBhcyBkZW5zZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcy5cbiAqL1xuZnVuY3Rpb24gYmFzZUtleXNJbihvYmplY3QpIHtcbiAgaWYgKCFpc09iamVjdChvYmplY3QpKSB7XG4gICAgcmV0dXJuIG5hdGl2ZUtleXNJbihvYmplY3QpO1xuICB9XG4gIHZhciBpc1Byb3RvID0gaXNQcm90b3R5cGUob2JqZWN0KSxcbiAgICAgIHJlc3VsdCA9IFtdO1xuXG4gIGZvciAodmFyIGtleSBpbiBvYmplY3QpIHtcbiAgICBpZiAoIShrZXkgPT0gJ2NvbnN0cnVjdG9yJyAmJiAoaXNQcm90byB8fCAhaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIGtleSkpKSkge1xuICAgICAgcmVzdWx0LnB1c2goa2V5KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlS2V5c0luO1xuIiwidmFyIGFycmF5TGlrZUtleXMgPSByZXF1aXJlKCcuL19hcnJheUxpa2VLZXlzJyksXG4gICAgYmFzZUtleXNJbiA9IHJlcXVpcmUoJy4vX2Jhc2VLZXlzSW4nKSxcbiAgICBpc0FycmF5TGlrZSA9IHJlcXVpcmUoJy4vaXNBcnJheUxpa2UnKTtcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGFycmF5IG9mIHRoZSBvd24gYW5kIGluaGVyaXRlZCBlbnVtZXJhYmxlIHByb3BlcnR5IG5hbWVzIG9mIGBvYmplY3RgLlxuICpcbiAqICoqTm90ZToqKiBOb24tb2JqZWN0IHZhbHVlcyBhcmUgY29lcmNlZCB0byBvYmplY3RzLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMy4wLjBcbiAqIEBjYXRlZ29yeSBPYmplY3RcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMuXG4gKiBAZXhhbXBsZVxuICpcbiAqIGZ1bmN0aW9uIEZvbygpIHtcbiAqICAgdGhpcy5hID0gMTtcbiAqICAgdGhpcy5iID0gMjtcbiAqIH1cbiAqXG4gKiBGb28ucHJvdG90eXBlLmMgPSAzO1xuICpcbiAqIF8ua2V5c0luKG5ldyBGb28pO1xuICogLy8gPT4gWydhJywgJ2InLCAnYyddIChpdGVyYXRpb24gb3JkZXIgaXMgbm90IGd1YXJhbnRlZWQpXG4gKi9cbmZ1bmN0aW9uIGtleXNJbihvYmplY3QpIHtcbiAgcmV0dXJuIGlzQXJyYXlMaWtlKG9iamVjdCkgPyBhcnJheUxpa2VLZXlzKG9iamVjdCwgdHJ1ZSkgOiBiYXNlS2V5c0luKG9iamVjdCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ga2V5c0luO1xuIiwidmFyIGNvcHlPYmplY3QgPSByZXF1aXJlKCcuL19jb3B5T2JqZWN0JyksXG4gICAga2V5c0luID0gcmVxdWlyZSgnLi9rZXlzSW4nKTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5hc3NpZ25JbmAgd2l0aG91dCBzdXBwb3J0IGZvciBtdWx0aXBsZSBzb3VyY2VzXG4gKiBvciBgY3VzdG9taXplcmAgZnVuY3Rpb25zLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBkZXN0aW5hdGlvbiBvYmplY3QuXG4gKiBAcGFyYW0ge09iamVjdH0gc291cmNlIFRoZSBzb3VyY2Ugb2JqZWN0LlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBgb2JqZWN0YC5cbiAqL1xuZnVuY3Rpb24gYmFzZUFzc2lnbkluKG9iamVjdCwgc291cmNlKSB7XG4gIHJldHVybiBvYmplY3QgJiYgY29weU9iamVjdChzb3VyY2UsIGtleXNJbihzb3VyY2UpLCBvYmplY3QpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VBc3NpZ25JbjtcbiIsInZhciByb290ID0gcmVxdWlyZSgnLi9fcm9vdCcpO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYGV4cG9ydHNgLiAqL1xudmFyIGZyZWVFeHBvcnRzID0gdHlwZW9mIGV4cG9ydHMgPT0gJ29iamVjdCcgJiYgZXhwb3J0cyAmJiAhZXhwb3J0cy5ub2RlVHlwZSAmJiBleHBvcnRzO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYG1vZHVsZWAuICovXG52YXIgZnJlZU1vZHVsZSA9IGZyZWVFeHBvcnRzICYmIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlICYmICFtb2R1bGUubm9kZVR5cGUgJiYgbW9kdWxlO1xuXG4vKiogRGV0ZWN0IHRoZSBwb3B1bGFyIENvbW1vbkpTIGV4dGVuc2lvbiBgbW9kdWxlLmV4cG9ydHNgLiAqL1xudmFyIG1vZHVsZUV4cG9ydHMgPSBmcmVlTW9kdWxlICYmIGZyZWVNb2R1bGUuZXhwb3J0cyA9PT0gZnJlZUV4cG9ydHM7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIEJ1ZmZlciA9IG1vZHVsZUV4cG9ydHMgPyByb290LkJ1ZmZlciA6IHVuZGVmaW5lZCxcbiAgICBhbGxvY1Vuc2FmZSA9IEJ1ZmZlciA/IEJ1ZmZlci5hbGxvY1Vuc2FmZSA6IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBDcmVhdGVzIGEgY2xvbmUgb2YgIGBidWZmZXJgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0J1ZmZlcn0gYnVmZmVyIFRoZSBidWZmZXIgdG8gY2xvbmUuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtpc0RlZXBdIFNwZWNpZnkgYSBkZWVwIGNsb25lLlxuICogQHJldHVybnMge0J1ZmZlcn0gUmV0dXJucyB0aGUgY2xvbmVkIGJ1ZmZlci5cbiAqL1xuZnVuY3Rpb24gY2xvbmVCdWZmZXIoYnVmZmVyLCBpc0RlZXApIHtcbiAgaWYgKGlzRGVlcCkge1xuICAgIHJldHVybiBidWZmZXIuc2xpY2UoKTtcbiAgfVxuICB2YXIgbGVuZ3RoID0gYnVmZmVyLmxlbmd0aCxcbiAgICAgIHJlc3VsdCA9IGFsbG9jVW5zYWZlID8gYWxsb2NVbnNhZmUobGVuZ3RoKSA6IG5ldyBidWZmZXIuY29uc3RydWN0b3IobGVuZ3RoKTtcblxuICBidWZmZXIuY29weShyZXN1bHQpO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsb25lQnVmZmVyO1xuIiwiLyoqXG4gKiBDb3BpZXMgdGhlIHZhbHVlcyBvZiBgc291cmNlYCB0byBgYXJyYXlgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fSBzb3VyY2UgVGhlIGFycmF5IHRvIGNvcHkgdmFsdWVzIGZyb20uXG4gKiBAcGFyYW0ge0FycmF5fSBbYXJyYXk9W11dIFRoZSBhcnJheSB0byBjb3B5IHZhbHVlcyB0by5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyBgYXJyYXlgLlxuICovXG5mdW5jdGlvbiBjb3B5QXJyYXkoc291cmNlLCBhcnJheSkge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IHNvdXJjZS5sZW5ndGg7XG5cbiAgYXJyYXkgfHwgKGFycmF5ID0gQXJyYXkobGVuZ3RoKSk7XG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgYXJyYXlbaW5kZXhdID0gc291cmNlW2luZGV4XTtcbiAgfVxuICByZXR1cm4gYXJyYXk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY29weUFycmF5O1xuIiwiLyoqXG4gKiBBIHNwZWNpYWxpemVkIHZlcnNpb24gb2YgYF8uZmlsdGVyYCBmb3IgYXJyYXlzIHdpdGhvdXQgc3VwcG9ydCBmb3JcbiAqIGl0ZXJhdGVlIHNob3J0aGFuZHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl9IFthcnJheV0gVGhlIGFycmF5IHRvIGl0ZXJhdGUgb3Zlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHByZWRpY2F0ZSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBuZXcgZmlsdGVyZWQgYXJyYXkuXG4gKi9cbmZ1bmN0aW9uIGFycmF5RmlsdGVyKGFycmF5LCBwcmVkaWNhdGUpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBhcnJheSA9PSBudWxsID8gMCA6IGFycmF5Lmxlbmd0aCxcbiAgICAgIHJlc0luZGV4ID0gMCxcbiAgICAgIHJlc3VsdCA9IFtdO1xuXG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgdmFyIHZhbHVlID0gYXJyYXlbaW5kZXhdO1xuICAgIGlmIChwcmVkaWNhdGUodmFsdWUsIGluZGV4LCBhcnJheSkpIHtcbiAgICAgIHJlc3VsdFtyZXNJbmRleCsrXSA9IHZhbHVlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFycmF5RmlsdGVyO1xuIiwiLyoqXG4gKiBUaGlzIG1ldGhvZCByZXR1cm5zIGEgbmV3IGVtcHR5IGFycmF5LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4xMy4wXG4gKiBAY2F0ZWdvcnkgVXRpbFxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBuZXcgZW1wdHkgYXJyYXkuXG4gKiBAZXhhbXBsZVxuICpcbiAqIHZhciBhcnJheXMgPSBfLnRpbWVzKDIsIF8uc3R1YkFycmF5KTtcbiAqXG4gKiBjb25zb2xlLmxvZyhhcnJheXMpO1xuICogLy8gPT4gW1tdLCBbXV1cbiAqXG4gKiBjb25zb2xlLmxvZyhhcnJheXNbMF0gPT09IGFycmF5c1sxXSk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBzdHViQXJyYXkoKSB7XG4gIHJldHVybiBbXTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzdHViQXJyYXk7XG4iLCJ2YXIgYXJyYXlGaWx0ZXIgPSByZXF1aXJlKCcuL19hcnJheUZpbHRlcicpLFxuICAgIHN0dWJBcnJheSA9IHJlcXVpcmUoJy4vc3R1YkFycmF5Jyk7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIHByb3BlcnR5SXNFbnVtZXJhYmxlID0gb2JqZWN0UHJvdG8ucHJvcGVydHlJc0VudW1lcmFibGU7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIGZvciB0aG9zZSB3aXRoIHRoZSBzYW1lIG5hbWUgYXMgb3RoZXIgYGxvZGFzaGAgbWV0aG9kcy4gKi9cbnZhciBuYXRpdmVHZXRTeW1ib2xzID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scztcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGFycmF5IG9mIHRoZSBvd24gZW51bWVyYWJsZSBzeW1ib2xzIG9mIGBvYmplY3RgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHN5bWJvbHMuXG4gKi9cbnZhciBnZXRTeW1ib2xzID0gIW5hdGl2ZUdldFN5bWJvbHMgPyBzdHViQXJyYXkgOiBmdW5jdGlvbihvYmplY3QpIHtcbiAgaWYgKG9iamVjdCA9PSBudWxsKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG4gIG9iamVjdCA9IE9iamVjdChvYmplY3QpO1xuICByZXR1cm4gYXJyYXlGaWx0ZXIobmF0aXZlR2V0U3ltYm9scyhvYmplY3QpLCBmdW5jdGlvbihzeW1ib2wpIHtcbiAgICByZXR1cm4gcHJvcGVydHlJc0VudW1lcmFibGUuY2FsbChvYmplY3QsIHN5bWJvbCk7XG4gIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBnZXRTeW1ib2xzO1xuIiwidmFyIGNvcHlPYmplY3QgPSByZXF1aXJlKCcuL19jb3B5T2JqZWN0JyksXG4gICAgZ2V0U3ltYm9scyA9IHJlcXVpcmUoJy4vX2dldFN5bWJvbHMnKTtcblxuLyoqXG4gKiBDb3BpZXMgb3duIHN5bWJvbHMgb2YgYHNvdXJjZWAgdG8gYG9iamVjdGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBzb3VyY2UgVGhlIG9iamVjdCB0byBjb3B5IHN5bWJvbHMgZnJvbS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb2JqZWN0PXt9XSBUaGUgb2JqZWN0IHRvIGNvcHkgc3ltYm9scyB0by5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgYG9iamVjdGAuXG4gKi9cbmZ1bmN0aW9uIGNvcHlTeW1ib2xzKHNvdXJjZSwgb2JqZWN0KSB7XG4gIHJldHVybiBjb3B5T2JqZWN0KHNvdXJjZSwgZ2V0U3ltYm9scyhzb3VyY2UpLCBvYmplY3QpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNvcHlTeW1ib2xzO1xuIiwiLyoqXG4gKiBBcHBlbmRzIHRoZSBlbGVtZW50cyBvZiBgdmFsdWVzYCB0byBgYXJyYXlgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJheSBUaGUgYXJyYXkgdG8gbW9kaWZ5LlxuICogQHBhcmFtIHtBcnJheX0gdmFsdWVzIFRoZSB2YWx1ZXMgdG8gYXBwZW5kLlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIGBhcnJheWAuXG4gKi9cbmZ1bmN0aW9uIGFycmF5UHVzaChhcnJheSwgdmFsdWVzKSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gdmFsdWVzLmxlbmd0aCxcbiAgICAgIG9mZnNldCA9IGFycmF5Lmxlbmd0aDtcblxuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIGFycmF5W29mZnNldCArIGluZGV4XSA9IHZhbHVlc1tpbmRleF07XG4gIH1cbiAgcmV0dXJuIGFycmF5O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFycmF5UHVzaDtcbiIsInZhciBvdmVyQXJnID0gcmVxdWlyZSgnLi9fb3ZlckFyZycpO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBnZXRQcm90b3R5cGUgPSBvdmVyQXJnKE9iamVjdC5nZXRQcm90b3R5cGVPZiwgT2JqZWN0KTtcblxubW9kdWxlLmV4cG9ydHMgPSBnZXRQcm90b3R5cGU7XG4iLCJ2YXIgYXJyYXlQdXNoID0gcmVxdWlyZSgnLi9fYXJyYXlQdXNoJyksXG4gICAgZ2V0UHJvdG90eXBlID0gcmVxdWlyZSgnLi9fZ2V0UHJvdG90eXBlJyksXG4gICAgZ2V0U3ltYm9scyA9IHJlcXVpcmUoJy4vX2dldFN5bWJvbHMnKSxcbiAgICBzdHViQXJyYXkgPSByZXF1aXJlKCcuL3N0dWJBcnJheScpO1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyBmb3IgdGhvc2Ugd2l0aCB0aGUgc2FtZSBuYW1lIGFzIG90aGVyIGBsb2Rhc2hgIG1ldGhvZHMuICovXG52YXIgbmF0aXZlR2V0U3ltYm9scyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHM7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhcnJheSBvZiB0aGUgb3duIGFuZCBpbmhlcml0ZWQgZW51bWVyYWJsZSBzeW1ib2xzIG9mIGBvYmplY3RgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHN5bWJvbHMuXG4gKi9cbnZhciBnZXRTeW1ib2xzSW4gPSAhbmF0aXZlR2V0U3ltYm9scyA/IHN0dWJBcnJheSA6IGZ1bmN0aW9uKG9iamVjdCkge1xuICB2YXIgcmVzdWx0ID0gW107XG4gIHdoaWxlIChvYmplY3QpIHtcbiAgICBhcnJheVB1c2gocmVzdWx0LCBnZXRTeW1ib2xzKG9iamVjdCkpO1xuICAgIG9iamVjdCA9IGdldFByb3RvdHlwZShvYmplY3QpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGdldFN5bWJvbHNJbjtcbiIsInZhciBjb3B5T2JqZWN0ID0gcmVxdWlyZSgnLi9fY29weU9iamVjdCcpLFxuICAgIGdldFN5bWJvbHNJbiA9IHJlcXVpcmUoJy4vX2dldFN5bWJvbHNJbicpO1xuXG4vKipcbiAqIENvcGllcyBvd24gYW5kIGluaGVyaXRlZCBzeW1ib2xzIG9mIGBzb3VyY2VgIHRvIGBvYmplY3RgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gc291cmNlIFRoZSBvYmplY3QgdG8gY29weSBzeW1ib2xzIGZyb20uXG4gKiBAcGFyYW0ge09iamVjdH0gW29iamVjdD17fV0gVGhlIG9iamVjdCB0byBjb3B5IHN5bWJvbHMgdG8uXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGBvYmplY3RgLlxuICovXG5mdW5jdGlvbiBjb3B5U3ltYm9sc0luKHNvdXJjZSwgb2JqZWN0KSB7XG4gIHJldHVybiBjb3B5T2JqZWN0KHNvdXJjZSwgZ2V0U3ltYm9sc0luKHNvdXJjZSksIG9iamVjdCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY29weVN5bWJvbHNJbjtcbiIsInZhciBhcnJheVB1c2ggPSByZXF1aXJlKCcuL19hcnJheVB1c2gnKSxcbiAgICBpc0FycmF5ID0gcmVxdWlyZSgnLi9pc0FycmF5Jyk7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYGdldEFsbEtleXNgIGFuZCBgZ2V0QWxsS2V5c0luYCB3aGljaCB1c2VzXG4gKiBga2V5c0Z1bmNgIGFuZCBgc3ltYm9sc0Z1bmNgIHRvIGdldCB0aGUgZW51bWVyYWJsZSBwcm9wZXJ0eSBuYW1lcyBhbmRcbiAqIHN5bWJvbHMgb2YgYG9iamVjdGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGtleXNGdW5jIFRoZSBmdW5jdGlvbiB0byBnZXQgdGhlIGtleXMgb2YgYG9iamVjdGAuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBzeW1ib2xzRnVuYyBUaGUgZnVuY3Rpb24gdG8gZ2V0IHRoZSBzeW1ib2xzIG9mIGBvYmplY3RgLlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcyBhbmQgc3ltYm9scy5cbiAqL1xuZnVuY3Rpb24gYmFzZUdldEFsbEtleXMob2JqZWN0LCBrZXlzRnVuYywgc3ltYm9sc0Z1bmMpIHtcbiAgdmFyIHJlc3VsdCA9IGtleXNGdW5jKG9iamVjdCk7XG4gIHJldHVybiBpc0FycmF5KG9iamVjdCkgPyByZXN1bHQgOiBhcnJheVB1c2gocmVzdWx0LCBzeW1ib2xzRnVuYyhvYmplY3QpKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlR2V0QWxsS2V5cztcbiIsInZhciBiYXNlR2V0QWxsS2V5cyA9IHJlcXVpcmUoJy4vX2Jhc2VHZXRBbGxLZXlzJyksXG4gICAgZ2V0U3ltYm9scyA9IHJlcXVpcmUoJy4vX2dldFN5bWJvbHMnKSxcbiAgICBrZXlzID0gcmVxdWlyZSgnLi9rZXlzJyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhcnJheSBvZiBvd24gZW51bWVyYWJsZSBwcm9wZXJ0eSBuYW1lcyBhbmQgc3ltYm9scyBvZiBgb2JqZWN0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcyBhbmQgc3ltYm9scy5cbiAqL1xuZnVuY3Rpb24gZ2V0QWxsS2V5cyhvYmplY3QpIHtcbiAgcmV0dXJuIGJhc2VHZXRBbGxLZXlzKG9iamVjdCwga2V5cywgZ2V0U3ltYm9scyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0QWxsS2V5cztcbiIsInZhciBiYXNlR2V0QWxsS2V5cyA9IHJlcXVpcmUoJy4vX2Jhc2VHZXRBbGxLZXlzJyksXG4gICAgZ2V0U3ltYm9sc0luID0gcmVxdWlyZSgnLi9fZ2V0U3ltYm9sc0luJyksXG4gICAga2V5c0luID0gcmVxdWlyZSgnLi9rZXlzSW4nKTtcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGFycmF5IG9mIG93biBhbmQgaW5oZXJpdGVkIGVudW1lcmFibGUgcHJvcGVydHkgbmFtZXMgYW5kXG4gKiBzeW1ib2xzIG9mIGBvYmplY3RgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzIGFuZCBzeW1ib2xzLlxuICovXG5mdW5jdGlvbiBnZXRBbGxLZXlzSW4ob2JqZWN0KSB7XG4gIHJldHVybiBiYXNlR2V0QWxsS2V5cyhvYmplY3QsIGtleXNJbiwgZ2V0U3ltYm9sc0luKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZXRBbGxLZXlzSW47XG4iLCJ2YXIgZ2V0TmF0aXZlID0gcmVxdWlyZSgnLi9fZ2V0TmF0aXZlJyksXG4gICAgcm9vdCA9IHJlcXVpcmUoJy4vX3Jvb3QnKTtcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgdGhhdCBhcmUgdmVyaWZpZWQgdG8gYmUgbmF0aXZlLiAqL1xudmFyIERhdGFWaWV3ID0gZ2V0TmF0aXZlKHJvb3QsICdEYXRhVmlldycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IERhdGFWaWV3O1xuIiwidmFyIGdldE5hdGl2ZSA9IHJlcXVpcmUoJy4vX2dldE5hdGl2ZScpLFxuICAgIHJvb3QgPSByZXF1aXJlKCcuL19yb290Jyk7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIHRoYXQgYXJlIHZlcmlmaWVkIHRvIGJlIG5hdGl2ZS4gKi9cbnZhciBQcm9taXNlID0gZ2V0TmF0aXZlKHJvb3QsICdQcm9taXNlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUHJvbWlzZTtcbiIsInZhciBnZXROYXRpdmUgPSByZXF1aXJlKCcuL19nZXROYXRpdmUnKSxcbiAgICByb290ID0gcmVxdWlyZSgnLi9fcm9vdCcpO1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyB0aGF0IGFyZSB2ZXJpZmllZCB0byBiZSBuYXRpdmUuICovXG52YXIgU2V0ID0gZ2V0TmF0aXZlKHJvb3QsICdTZXQnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBTZXQ7XG4iLCJ2YXIgZ2V0TmF0aXZlID0gcmVxdWlyZSgnLi9fZ2V0TmF0aXZlJyksXG4gICAgcm9vdCA9IHJlcXVpcmUoJy4vX3Jvb3QnKTtcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgdGhhdCBhcmUgdmVyaWZpZWQgdG8gYmUgbmF0aXZlLiAqL1xudmFyIFdlYWtNYXAgPSBnZXROYXRpdmUocm9vdCwgJ1dlYWtNYXAnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBXZWFrTWFwO1xuIiwidmFyIERhdGFWaWV3ID0gcmVxdWlyZSgnLi9fRGF0YVZpZXcnKSxcbiAgICBNYXAgPSByZXF1aXJlKCcuL19NYXAnKSxcbiAgICBQcm9taXNlID0gcmVxdWlyZSgnLi9fUHJvbWlzZScpLFxuICAgIFNldCA9IHJlcXVpcmUoJy4vX1NldCcpLFxuICAgIFdlYWtNYXAgPSByZXF1aXJlKCcuL19XZWFrTWFwJyksXG4gICAgYmFzZUdldFRhZyA9IHJlcXVpcmUoJy4vX2Jhc2VHZXRUYWcnKSxcbiAgICB0b1NvdXJjZSA9IHJlcXVpcmUoJy4vX3RvU291cmNlJyk7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBtYXBUYWcgPSAnW29iamVjdCBNYXBdJyxcbiAgICBvYmplY3RUYWcgPSAnW29iamVjdCBPYmplY3RdJyxcbiAgICBwcm9taXNlVGFnID0gJ1tvYmplY3QgUHJvbWlzZV0nLFxuICAgIHNldFRhZyA9ICdbb2JqZWN0IFNldF0nLFxuICAgIHdlYWtNYXBUYWcgPSAnW29iamVjdCBXZWFrTWFwXSc7XG5cbnZhciBkYXRhVmlld1RhZyA9ICdbb2JqZWN0IERhdGFWaWV3XSc7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBtYXBzLCBzZXRzLCBhbmQgd2Vha21hcHMuICovXG52YXIgZGF0YVZpZXdDdG9yU3RyaW5nID0gdG9Tb3VyY2UoRGF0YVZpZXcpLFxuICAgIG1hcEN0b3JTdHJpbmcgPSB0b1NvdXJjZShNYXApLFxuICAgIHByb21pc2VDdG9yU3RyaW5nID0gdG9Tb3VyY2UoUHJvbWlzZSksXG4gICAgc2V0Q3RvclN0cmluZyA9IHRvU291cmNlKFNldCksXG4gICAgd2Vha01hcEN0b3JTdHJpbmcgPSB0b1NvdXJjZShXZWFrTWFwKTtcblxuLyoqXG4gKiBHZXRzIHRoZSBgdG9TdHJpbmdUYWdgIG9mIGB2YWx1ZWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHF1ZXJ5LlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgYHRvU3RyaW5nVGFnYC5cbiAqL1xudmFyIGdldFRhZyA9IGJhc2VHZXRUYWc7XG5cbi8vIEZhbGxiYWNrIGZvciBkYXRhIHZpZXdzLCBtYXBzLCBzZXRzLCBhbmQgd2VhayBtYXBzIGluIElFIDExIGFuZCBwcm9taXNlcyBpbiBOb2RlLmpzIDwgNi5cbmlmICgoRGF0YVZpZXcgJiYgZ2V0VGFnKG5ldyBEYXRhVmlldyhuZXcgQXJyYXlCdWZmZXIoMSkpKSAhPSBkYXRhVmlld1RhZykgfHxcbiAgICAoTWFwICYmIGdldFRhZyhuZXcgTWFwKSAhPSBtYXBUYWcpIHx8XG4gICAgKFByb21pc2UgJiYgZ2V0VGFnKFByb21pc2UucmVzb2x2ZSgpKSAhPSBwcm9taXNlVGFnKSB8fFxuICAgIChTZXQgJiYgZ2V0VGFnKG5ldyBTZXQpICE9IHNldFRhZykgfHxcbiAgICAoV2Vha01hcCAmJiBnZXRUYWcobmV3IFdlYWtNYXApICE9IHdlYWtNYXBUYWcpKSB7XG4gIGdldFRhZyA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgdmFyIHJlc3VsdCA9IGJhc2VHZXRUYWcodmFsdWUpLFxuICAgICAgICBDdG9yID0gcmVzdWx0ID09IG9iamVjdFRhZyA/IHZhbHVlLmNvbnN0cnVjdG9yIDogdW5kZWZpbmVkLFxuICAgICAgICBjdG9yU3RyaW5nID0gQ3RvciA/IHRvU291cmNlKEN0b3IpIDogJyc7XG5cbiAgICBpZiAoY3RvclN0cmluZykge1xuICAgICAgc3dpdGNoIChjdG9yU3RyaW5nKSB7XG4gICAgICAgIGNhc2UgZGF0YVZpZXdDdG9yU3RyaW5nOiByZXR1cm4gZGF0YVZpZXdUYWc7XG4gICAgICAgIGNhc2UgbWFwQ3RvclN0cmluZzogcmV0dXJuIG1hcFRhZztcbiAgICAgICAgY2FzZSBwcm9taXNlQ3RvclN0cmluZzogcmV0dXJuIHByb21pc2VUYWc7XG4gICAgICAgIGNhc2Ugc2V0Q3RvclN0cmluZzogcmV0dXJuIHNldFRhZztcbiAgICAgICAgY2FzZSB3ZWFrTWFwQ3RvclN0cmluZzogcmV0dXJuIHdlYWtNYXBUYWc7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0VGFnO1xuIiwiLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBJbml0aWFsaXplcyBhbiBhcnJheSBjbG9uZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIGNsb25lLlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBpbml0aWFsaXplZCBjbG9uZS5cbiAqL1xuZnVuY3Rpb24gaW5pdENsb25lQXJyYXkoYXJyYXkpIHtcbiAgdmFyIGxlbmd0aCA9IGFycmF5Lmxlbmd0aCxcbiAgICAgIHJlc3VsdCA9IGFycmF5LmNvbnN0cnVjdG9yKGxlbmd0aCk7XG5cbiAgLy8gQWRkIHByb3BlcnRpZXMgYXNzaWduZWQgYnkgYFJlZ0V4cCNleGVjYC5cbiAgaWYgKGxlbmd0aCAmJiB0eXBlb2YgYXJyYXlbMF0gPT0gJ3N0cmluZycgJiYgaGFzT3duUHJvcGVydHkuY2FsbChhcnJheSwgJ2luZGV4JykpIHtcbiAgICByZXN1bHQuaW5kZXggPSBhcnJheS5pbmRleDtcbiAgICByZXN1bHQuaW5wdXQgPSBhcnJheS5pbnB1dDtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGluaXRDbG9uZUFycmF5O1xuIiwidmFyIHJvb3QgPSByZXF1aXJlKCcuL19yb290Jyk7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIFVpbnQ4QXJyYXkgPSByb290LlVpbnQ4QXJyYXk7XG5cbm1vZHVsZS5leHBvcnRzID0gVWludDhBcnJheTtcbiIsInZhciBVaW50OEFycmF5ID0gcmVxdWlyZSgnLi9fVWludDhBcnJheScpO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBjbG9uZSBvZiBgYXJyYXlCdWZmZXJgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5QnVmZmVyfSBhcnJheUJ1ZmZlciBUaGUgYXJyYXkgYnVmZmVyIHRvIGNsb25lLlxuICogQHJldHVybnMge0FycmF5QnVmZmVyfSBSZXR1cm5zIHRoZSBjbG9uZWQgYXJyYXkgYnVmZmVyLlxuICovXG5mdW5jdGlvbiBjbG9uZUFycmF5QnVmZmVyKGFycmF5QnVmZmVyKSB7XG4gIHZhciByZXN1bHQgPSBuZXcgYXJyYXlCdWZmZXIuY29uc3RydWN0b3IoYXJyYXlCdWZmZXIuYnl0ZUxlbmd0aCk7XG4gIG5ldyBVaW50OEFycmF5KHJlc3VsdCkuc2V0KG5ldyBVaW50OEFycmF5KGFycmF5QnVmZmVyKSk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY2xvbmVBcnJheUJ1ZmZlcjtcbiIsInZhciBjbG9uZUFycmF5QnVmZmVyID0gcmVxdWlyZSgnLi9fY2xvbmVBcnJheUJ1ZmZlcicpO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBjbG9uZSBvZiBgZGF0YVZpZXdgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gZGF0YVZpZXcgVGhlIGRhdGEgdmlldyB0byBjbG9uZS5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzRGVlcF0gU3BlY2lmeSBhIGRlZXAgY2xvbmUuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBjbG9uZWQgZGF0YSB2aWV3LlxuICovXG5mdW5jdGlvbiBjbG9uZURhdGFWaWV3KGRhdGFWaWV3LCBpc0RlZXApIHtcbiAgdmFyIGJ1ZmZlciA9IGlzRGVlcCA/IGNsb25lQXJyYXlCdWZmZXIoZGF0YVZpZXcuYnVmZmVyKSA6IGRhdGFWaWV3LmJ1ZmZlcjtcbiAgcmV0dXJuIG5ldyBkYXRhVmlldy5jb25zdHJ1Y3RvcihidWZmZXIsIGRhdGFWaWV3LmJ5dGVPZmZzZXQsIGRhdGFWaWV3LmJ5dGVMZW5ndGgpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsb25lRGF0YVZpZXc7XG4iLCIvKipcbiAqIEFkZHMgdGhlIGtleS12YWx1ZSBgcGFpcmAgdG8gYG1hcGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBtYXAgVGhlIG1hcCB0byBtb2RpZnkuXG4gKiBAcGFyYW0ge0FycmF5fSBwYWlyIFRoZSBrZXktdmFsdWUgcGFpciB0byBhZGQuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGBtYXBgLlxuICovXG5mdW5jdGlvbiBhZGRNYXBFbnRyeShtYXAsIHBhaXIpIHtcbiAgLy8gRG9uJ3QgcmV0dXJuIGBtYXAuc2V0YCBiZWNhdXNlIGl0J3Mgbm90IGNoYWluYWJsZSBpbiBJRSAxMS5cbiAgbWFwLnNldChwYWlyWzBdLCBwYWlyWzFdKTtcbiAgcmV0dXJuIG1hcDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBhZGRNYXBFbnRyeTtcbiIsIi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBfLnJlZHVjZWAgZm9yIGFycmF5cyB3aXRob3V0IHN1cHBvcnQgZm9yXG4gKiBpdGVyYXRlZSBzaG9ydGhhbmRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fSBbYXJyYXldIFRoZSBhcnJheSB0byBpdGVyYXRlIG92ZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRlZSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHBhcmFtIHsqfSBbYWNjdW11bGF0b3JdIFRoZSBpbml0aWFsIHZhbHVlLlxuICogQHBhcmFtIHtib29sZWFufSBbaW5pdEFjY3VtXSBTcGVjaWZ5IHVzaW5nIHRoZSBmaXJzdCBlbGVtZW50IG9mIGBhcnJheWAgYXNcbiAqICB0aGUgaW5pdGlhbCB2YWx1ZS5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBhY2N1bXVsYXRlZCB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gYXJyYXlSZWR1Y2UoYXJyYXksIGl0ZXJhdGVlLCBhY2N1bXVsYXRvciwgaW5pdEFjY3VtKSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gYXJyYXkgPT0gbnVsbCA/IDAgOiBhcnJheS5sZW5ndGg7XG5cbiAgaWYgKGluaXRBY2N1bSAmJiBsZW5ndGgpIHtcbiAgICBhY2N1bXVsYXRvciA9IGFycmF5WysraW5kZXhdO1xuICB9XG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgYWNjdW11bGF0b3IgPSBpdGVyYXRlZShhY2N1bXVsYXRvciwgYXJyYXlbaW5kZXhdLCBpbmRleCwgYXJyYXkpO1xuICB9XG4gIHJldHVybiBhY2N1bXVsYXRvcjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBhcnJheVJlZHVjZTtcbiIsIi8qKlxuICogQ29udmVydHMgYG1hcGAgdG8gaXRzIGtleS12YWx1ZSBwYWlycy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG1hcCBUaGUgbWFwIHRvIGNvbnZlcnQuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGtleS12YWx1ZSBwYWlycy5cbiAqL1xuZnVuY3Rpb24gbWFwVG9BcnJheShtYXApIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICByZXN1bHQgPSBBcnJheShtYXAuc2l6ZSk7XG5cbiAgbWFwLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIGtleSkge1xuICAgIHJlc3VsdFsrK2luZGV4XSA9IFtrZXksIHZhbHVlXTtcbiAgfSk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbWFwVG9BcnJheTtcbiIsInZhciBhZGRNYXBFbnRyeSA9IHJlcXVpcmUoJy4vX2FkZE1hcEVudHJ5JyksXG4gICAgYXJyYXlSZWR1Y2UgPSByZXF1aXJlKCcuL19hcnJheVJlZHVjZScpLFxuICAgIG1hcFRvQXJyYXkgPSByZXF1aXJlKCcuL19tYXBUb0FycmF5Jyk7XG5cbi8qKiBVc2VkIHRvIGNvbXBvc2UgYml0bWFza3MgZm9yIGNsb25pbmcuICovXG52YXIgQ0xPTkVfREVFUF9GTEFHID0gMTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgY2xvbmUgb2YgYG1hcGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBtYXAgVGhlIG1hcCB0byBjbG9uZS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNsb25lRnVuYyBUaGUgZnVuY3Rpb24gdG8gY2xvbmUgdmFsdWVzLlxuICogQHBhcmFtIHtib29sZWFufSBbaXNEZWVwXSBTcGVjaWZ5IGEgZGVlcCBjbG9uZS5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIGNsb25lZCBtYXAuXG4gKi9cbmZ1bmN0aW9uIGNsb25lTWFwKG1hcCwgaXNEZWVwLCBjbG9uZUZ1bmMpIHtcbiAgdmFyIGFycmF5ID0gaXNEZWVwID8gY2xvbmVGdW5jKG1hcFRvQXJyYXkobWFwKSwgQ0xPTkVfREVFUF9GTEFHKSA6IG1hcFRvQXJyYXkobWFwKTtcbiAgcmV0dXJuIGFycmF5UmVkdWNlKGFycmF5LCBhZGRNYXBFbnRyeSwgbmV3IG1hcC5jb25zdHJ1Y3Rvcik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY2xvbmVNYXA7XG4iLCIvKiogVXNlZCB0byBtYXRjaCBgUmVnRXhwYCBmbGFncyBmcm9tIHRoZWlyIGNvZXJjZWQgc3RyaW5nIHZhbHVlcy4gKi9cbnZhciByZUZsYWdzID0gL1xcdyokLztcblxuLyoqXG4gKiBDcmVhdGVzIGEgY2xvbmUgb2YgYHJlZ2V4cGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSByZWdleHAgVGhlIHJlZ2V4cCB0byBjbG9uZS5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIGNsb25lZCByZWdleHAuXG4gKi9cbmZ1bmN0aW9uIGNsb25lUmVnRXhwKHJlZ2V4cCkge1xuICB2YXIgcmVzdWx0ID0gbmV3IHJlZ2V4cC5jb25zdHJ1Y3RvcihyZWdleHAuc291cmNlLCByZUZsYWdzLmV4ZWMocmVnZXhwKSk7XG4gIHJlc3VsdC5sYXN0SW5kZXggPSByZWdleHAubGFzdEluZGV4O1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsb25lUmVnRXhwO1xuIiwiLyoqXG4gKiBBZGRzIGB2YWx1ZWAgdG8gYHNldGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBzZXQgVGhlIHNldCB0byBtb2RpZnkuXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBhZGQuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGBzZXRgLlxuICovXG5mdW5jdGlvbiBhZGRTZXRFbnRyeShzZXQsIHZhbHVlKSB7XG4gIC8vIERvbid0IHJldHVybiBgc2V0LmFkZGAgYmVjYXVzZSBpdCdzIG5vdCBjaGFpbmFibGUgaW4gSUUgMTEuXG4gIHNldC5hZGQodmFsdWUpO1xuICByZXR1cm4gc2V0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFkZFNldEVudHJ5O1xuIiwiLyoqXG4gKiBDb252ZXJ0cyBgc2V0YCB0byBhbiBhcnJheSBvZiBpdHMgdmFsdWVzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gc2V0IFRoZSBzZXQgdG8gY29udmVydC5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgdmFsdWVzLlxuICovXG5mdW5jdGlvbiBzZXRUb0FycmF5KHNldCkge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIHJlc3VsdCA9IEFycmF5KHNldC5zaXplKTtcblxuICBzZXQuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSkge1xuICAgIHJlc3VsdFsrK2luZGV4XSA9IHZhbHVlO1xuICB9KTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzZXRUb0FycmF5O1xuIiwidmFyIGFkZFNldEVudHJ5ID0gcmVxdWlyZSgnLi9fYWRkU2V0RW50cnknKSxcbiAgICBhcnJheVJlZHVjZSA9IHJlcXVpcmUoJy4vX2FycmF5UmVkdWNlJyksXG4gICAgc2V0VG9BcnJheSA9IHJlcXVpcmUoJy4vX3NldFRvQXJyYXknKTtcblxuLyoqIFVzZWQgdG8gY29tcG9zZSBiaXRtYXNrcyBmb3IgY2xvbmluZy4gKi9cbnZhciBDTE9ORV9ERUVQX0ZMQUcgPSAxO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBjbG9uZSBvZiBgc2V0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IHNldCBUaGUgc2V0IHRvIGNsb25lLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2xvbmVGdW5jIFRoZSBmdW5jdGlvbiB0byBjbG9uZSB2YWx1ZXMuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtpc0RlZXBdIFNwZWNpZnkgYSBkZWVwIGNsb25lLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgY2xvbmVkIHNldC5cbiAqL1xuZnVuY3Rpb24gY2xvbmVTZXQoc2V0LCBpc0RlZXAsIGNsb25lRnVuYykge1xuICB2YXIgYXJyYXkgPSBpc0RlZXAgPyBjbG9uZUZ1bmMoc2V0VG9BcnJheShzZXQpLCBDTE9ORV9ERUVQX0ZMQUcpIDogc2V0VG9BcnJheShzZXQpO1xuICByZXR1cm4gYXJyYXlSZWR1Y2UoYXJyYXksIGFkZFNldEVudHJ5LCBuZXcgc2V0LmNvbnN0cnVjdG9yKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjbG9uZVNldDtcbiIsInZhciBTeW1ib2wgPSByZXF1aXJlKCcuL19TeW1ib2wnKTtcblxuLyoqIFVzZWQgdG8gY29udmVydCBzeW1ib2xzIHRvIHByaW1pdGl2ZXMgYW5kIHN0cmluZ3MuICovXG52YXIgc3ltYm9sUHJvdG8gPSBTeW1ib2wgPyBTeW1ib2wucHJvdG90eXBlIDogdW5kZWZpbmVkLFxuICAgIHN5bWJvbFZhbHVlT2YgPSBzeW1ib2xQcm90byA/IHN5bWJvbFByb3RvLnZhbHVlT2YgOiB1bmRlZmluZWQ7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGNsb25lIG9mIHRoZSBgc3ltYm9sYCBvYmplY3QuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBzeW1ib2wgVGhlIHN5bWJvbCBvYmplY3QgdG8gY2xvbmUuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBjbG9uZWQgc3ltYm9sIG9iamVjdC5cbiAqL1xuZnVuY3Rpb24gY2xvbmVTeW1ib2woc3ltYm9sKSB7XG4gIHJldHVybiBzeW1ib2xWYWx1ZU9mID8gT2JqZWN0KHN5bWJvbFZhbHVlT2YuY2FsbChzeW1ib2wpKSA6IHt9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsb25lU3ltYm9sO1xuIiwidmFyIGNsb25lQXJyYXlCdWZmZXIgPSByZXF1aXJlKCcuL19jbG9uZUFycmF5QnVmZmVyJyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGNsb25lIG9mIGB0eXBlZEFycmF5YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IHR5cGVkQXJyYXkgVGhlIHR5cGVkIGFycmF5IHRvIGNsb25lLlxuICogQHBhcmFtIHtib29sZWFufSBbaXNEZWVwXSBTcGVjaWZ5IGEgZGVlcCBjbG9uZS5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIGNsb25lZCB0eXBlZCBhcnJheS5cbiAqL1xuZnVuY3Rpb24gY2xvbmVUeXBlZEFycmF5KHR5cGVkQXJyYXksIGlzRGVlcCkge1xuICB2YXIgYnVmZmVyID0gaXNEZWVwID8gY2xvbmVBcnJheUJ1ZmZlcih0eXBlZEFycmF5LmJ1ZmZlcikgOiB0eXBlZEFycmF5LmJ1ZmZlcjtcbiAgcmV0dXJuIG5ldyB0eXBlZEFycmF5LmNvbnN0cnVjdG9yKGJ1ZmZlciwgdHlwZWRBcnJheS5ieXRlT2Zmc2V0LCB0eXBlZEFycmF5Lmxlbmd0aCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY2xvbmVUeXBlZEFycmF5O1xuIiwidmFyIGNsb25lQXJyYXlCdWZmZXIgPSByZXF1aXJlKCcuL19jbG9uZUFycmF5QnVmZmVyJyksXG4gICAgY2xvbmVEYXRhVmlldyA9IHJlcXVpcmUoJy4vX2Nsb25lRGF0YVZpZXcnKSxcbiAgICBjbG9uZU1hcCA9IHJlcXVpcmUoJy4vX2Nsb25lTWFwJyksXG4gICAgY2xvbmVSZWdFeHAgPSByZXF1aXJlKCcuL19jbG9uZVJlZ0V4cCcpLFxuICAgIGNsb25lU2V0ID0gcmVxdWlyZSgnLi9fY2xvbmVTZXQnKSxcbiAgICBjbG9uZVN5bWJvbCA9IHJlcXVpcmUoJy4vX2Nsb25lU3ltYm9sJyksXG4gICAgY2xvbmVUeXBlZEFycmF5ID0gcmVxdWlyZSgnLi9fY2xvbmVUeXBlZEFycmF5Jyk7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBib29sVGFnID0gJ1tvYmplY3QgQm9vbGVhbl0nLFxuICAgIGRhdGVUYWcgPSAnW29iamVjdCBEYXRlXScsXG4gICAgbWFwVGFnID0gJ1tvYmplY3QgTWFwXScsXG4gICAgbnVtYmVyVGFnID0gJ1tvYmplY3QgTnVtYmVyXScsXG4gICAgcmVnZXhwVGFnID0gJ1tvYmplY3QgUmVnRXhwXScsXG4gICAgc2V0VGFnID0gJ1tvYmplY3QgU2V0XScsXG4gICAgc3RyaW5nVGFnID0gJ1tvYmplY3QgU3RyaW5nXScsXG4gICAgc3ltYm9sVGFnID0gJ1tvYmplY3QgU3ltYm9sXSc7XG5cbnZhciBhcnJheUJ1ZmZlclRhZyA9ICdbb2JqZWN0IEFycmF5QnVmZmVyXScsXG4gICAgZGF0YVZpZXdUYWcgPSAnW29iamVjdCBEYXRhVmlld10nLFxuICAgIGZsb2F0MzJUYWcgPSAnW29iamVjdCBGbG9hdDMyQXJyYXldJyxcbiAgICBmbG9hdDY0VGFnID0gJ1tvYmplY3QgRmxvYXQ2NEFycmF5XScsXG4gICAgaW50OFRhZyA9ICdbb2JqZWN0IEludDhBcnJheV0nLFxuICAgIGludDE2VGFnID0gJ1tvYmplY3QgSW50MTZBcnJheV0nLFxuICAgIGludDMyVGFnID0gJ1tvYmplY3QgSW50MzJBcnJheV0nLFxuICAgIHVpbnQ4VGFnID0gJ1tvYmplY3QgVWludDhBcnJheV0nLFxuICAgIHVpbnQ4Q2xhbXBlZFRhZyA9ICdbb2JqZWN0IFVpbnQ4Q2xhbXBlZEFycmF5XScsXG4gICAgdWludDE2VGFnID0gJ1tvYmplY3QgVWludDE2QXJyYXldJyxcbiAgICB1aW50MzJUYWcgPSAnW29iamVjdCBVaW50MzJBcnJheV0nO1xuXG4vKipcbiAqIEluaXRpYWxpemVzIGFuIG9iamVjdCBjbG9uZSBiYXNlZCBvbiBpdHMgYHRvU3RyaW5nVGFnYC5cbiAqXG4gKiAqKk5vdGU6KiogVGhpcyBmdW5jdGlvbiBvbmx5IHN1cHBvcnRzIGNsb25pbmcgdmFsdWVzIHdpdGggdGFncyBvZlxuICogYEJvb2xlYW5gLCBgRGF0ZWAsIGBFcnJvcmAsIGBOdW1iZXJgLCBgUmVnRXhwYCwgb3IgYFN0cmluZ2AuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBjbG9uZS5cbiAqIEBwYXJhbSB7c3RyaW5nfSB0YWcgVGhlIGB0b1N0cmluZ1RhZ2Agb2YgdGhlIG9iamVjdCB0byBjbG9uZS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNsb25lRnVuYyBUaGUgZnVuY3Rpb24gdG8gY2xvbmUgdmFsdWVzLlxuICogQHBhcmFtIHtib29sZWFufSBbaXNEZWVwXSBTcGVjaWZ5IGEgZGVlcCBjbG9uZS5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIGluaXRpYWxpemVkIGNsb25lLlxuICovXG5mdW5jdGlvbiBpbml0Q2xvbmVCeVRhZyhvYmplY3QsIHRhZywgY2xvbmVGdW5jLCBpc0RlZXApIHtcbiAgdmFyIEN0b3IgPSBvYmplY3QuY29uc3RydWN0b3I7XG4gIHN3aXRjaCAodGFnKSB7XG4gICAgY2FzZSBhcnJheUJ1ZmZlclRhZzpcbiAgICAgIHJldHVybiBjbG9uZUFycmF5QnVmZmVyKG9iamVjdCk7XG5cbiAgICBjYXNlIGJvb2xUYWc6XG4gICAgY2FzZSBkYXRlVGFnOlxuICAgICAgcmV0dXJuIG5ldyBDdG9yKCtvYmplY3QpO1xuXG4gICAgY2FzZSBkYXRhVmlld1RhZzpcbiAgICAgIHJldHVybiBjbG9uZURhdGFWaWV3KG9iamVjdCwgaXNEZWVwKTtcblxuICAgIGNhc2UgZmxvYXQzMlRhZzogY2FzZSBmbG9hdDY0VGFnOlxuICAgIGNhc2UgaW50OFRhZzogY2FzZSBpbnQxNlRhZzogY2FzZSBpbnQzMlRhZzpcbiAgICBjYXNlIHVpbnQ4VGFnOiBjYXNlIHVpbnQ4Q2xhbXBlZFRhZzogY2FzZSB1aW50MTZUYWc6IGNhc2UgdWludDMyVGFnOlxuICAgICAgcmV0dXJuIGNsb25lVHlwZWRBcnJheShvYmplY3QsIGlzRGVlcCk7XG5cbiAgICBjYXNlIG1hcFRhZzpcbiAgICAgIHJldHVybiBjbG9uZU1hcChvYmplY3QsIGlzRGVlcCwgY2xvbmVGdW5jKTtcblxuICAgIGNhc2UgbnVtYmVyVGFnOlxuICAgIGNhc2Ugc3RyaW5nVGFnOlxuICAgICAgcmV0dXJuIG5ldyBDdG9yKG9iamVjdCk7XG5cbiAgICBjYXNlIHJlZ2V4cFRhZzpcbiAgICAgIHJldHVybiBjbG9uZVJlZ0V4cChvYmplY3QpO1xuXG4gICAgY2FzZSBzZXRUYWc6XG4gICAgICByZXR1cm4gY2xvbmVTZXQob2JqZWN0LCBpc0RlZXAsIGNsb25lRnVuYyk7XG5cbiAgICBjYXNlIHN5bWJvbFRhZzpcbiAgICAgIHJldHVybiBjbG9uZVN5bWJvbChvYmplY3QpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaW5pdENsb25lQnlUYWc7XG4iLCJ2YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuL2lzT2JqZWN0Jyk7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdENyZWF0ZSA9IE9iamVjdC5jcmVhdGU7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uY3JlYXRlYCB3aXRob3V0IHN1cHBvcnQgZm9yIGFzc2lnbmluZ1xuICogcHJvcGVydGllcyB0byB0aGUgY3JlYXRlZCBvYmplY3QuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBwcm90byBUaGUgb2JqZWN0IHRvIGluaGVyaXQgZnJvbS5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIG5ldyBvYmplY3QuXG4gKi9cbnZhciBiYXNlQ3JlYXRlID0gKGZ1bmN0aW9uKCkge1xuICBmdW5jdGlvbiBvYmplY3QoKSB7fVxuICByZXR1cm4gZnVuY3Rpb24ocHJvdG8pIHtcbiAgICBpZiAoIWlzT2JqZWN0KHByb3RvKSkge1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cbiAgICBpZiAob2JqZWN0Q3JlYXRlKSB7XG4gICAgICByZXR1cm4gb2JqZWN0Q3JlYXRlKHByb3RvKTtcbiAgICB9XG4gICAgb2JqZWN0LnByb3RvdHlwZSA9IHByb3RvO1xuICAgIHZhciByZXN1bHQgPSBuZXcgb2JqZWN0O1xuICAgIG9iamVjdC5wcm90b3R5cGUgPSB1bmRlZmluZWQ7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcbn0oKSk7XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUNyZWF0ZTtcbiIsInZhciBiYXNlQ3JlYXRlID0gcmVxdWlyZSgnLi9fYmFzZUNyZWF0ZScpLFxuICAgIGdldFByb3RvdHlwZSA9IHJlcXVpcmUoJy4vX2dldFByb3RvdHlwZScpLFxuICAgIGlzUHJvdG90eXBlID0gcmVxdWlyZSgnLi9faXNQcm90b3R5cGUnKTtcblxuLyoqXG4gKiBJbml0aWFsaXplcyBhbiBvYmplY3QgY2xvbmUuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBjbG9uZS5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIGluaXRpYWxpemVkIGNsb25lLlxuICovXG5mdW5jdGlvbiBpbml0Q2xvbmVPYmplY3Qob2JqZWN0KSB7XG4gIHJldHVybiAodHlwZW9mIG9iamVjdC5jb25zdHJ1Y3RvciA9PSAnZnVuY3Rpb24nICYmICFpc1Byb3RvdHlwZShvYmplY3QpKVxuICAgID8gYmFzZUNyZWF0ZShnZXRQcm90b3R5cGUob2JqZWN0KSlcbiAgICA6IHt9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGluaXRDbG9uZU9iamVjdDtcbiIsInZhciBTdGFjayA9IHJlcXVpcmUoJy4vX1N0YWNrJyksXG4gICAgYXJyYXlFYWNoID0gcmVxdWlyZSgnLi9fYXJyYXlFYWNoJyksXG4gICAgYXNzaWduVmFsdWUgPSByZXF1aXJlKCcuL19hc3NpZ25WYWx1ZScpLFxuICAgIGJhc2VBc3NpZ24gPSByZXF1aXJlKCcuL19iYXNlQXNzaWduJyksXG4gICAgYmFzZUFzc2lnbkluID0gcmVxdWlyZSgnLi9fYmFzZUFzc2lnbkluJyksXG4gICAgY2xvbmVCdWZmZXIgPSByZXF1aXJlKCcuL19jbG9uZUJ1ZmZlcicpLFxuICAgIGNvcHlBcnJheSA9IHJlcXVpcmUoJy4vX2NvcHlBcnJheScpLFxuICAgIGNvcHlTeW1ib2xzID0gcmVxdWlyZSgnLi9fY29weVN5bWJvbHMnKSxcbiAgICBjb3B5U3ltYm9sc0luID0gcmVxdWlyZSgnLi9fY29weVN5bWJvbHNJbicpLFxuICAgIGdldEFsbEtleXMgPSByZXF1aXJlKCcuL19nZXRBbGxLZXlzJyksXG4gICAgZ2V0QWxsS2V5c0luID0gcmVxdWlyZSgnLi9fZ2V0QWxsS2V5c0luJyksXG4gICAgZ2V0VGFnID0gcmVxdWlyZSgnLi9fZ2V0VGFnJyksXG4gICAgaW5pdENsb25lQXJyYXkgPSByZXF1aXJlKCcuL19pbml0Q2xvbmVBcnJheScpLFxuICAgIGluaXRDbG9uZUJ5VGFnID0gcmVxdWlyZSgnLi9faW5pdENsb25lQnlUYWcnKSxcbiAgICBpbml0Q2xvbmVPYmplY3QgPSByZXF1aXJlKCcuL19pbml0Q2xvbmVPYmplY3QnKSxcbiAgICBpc0FycmF5ID0gcmVxdWlyZSgnLi9pc0FycmF5JyksXG4gICAgaXNCdWZmZXIgPSByZXF1aXJlKCcuL2lzQnVmZmVyJyksXG4gICAgaXNPYmplY3QgPSByZXF1aXJlKCcuL2lzT2JqZWN0JyksXG4gICAga2V5cyA9IHJlcXVpcmUoJy4va2V5cycpO1xuXG4vKiogVXNlZCB0byBjb21wb3NlIGJpdG1hc2tzIGZvciBjbG9uaW5nLiAqL1xudmFyIENMT05FX0RFRVBfRkxBRyA9IDEsXG4gICAgQ0xPTkVfRkxBVF9GTEFHID0gMixcbiAgICBDTE9ORV9TWU1CT0xTX0ZMQUcgPSA0O1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgYXJnc1RhZyA9ICdbb2JqZWN0IEFyZ3VtZW50c10nLFxuICAgIGFycmF5VGFnID0gJ1tvYmplY3QgQXJyYXldJyxcbiAgICBib29sVGFnID0gJ1tvYmplY3QgQm9vbGVhbl0nLFxuICAgIGRhdGVUYWcgPSAnW29iamVjdCBEYXRlXScsXG4gICAgZXJyb3JUYWcgPSAnW29iamVjdCBFcnJvcl0nLFxuICAgIGZ1bmNUYWcgPSAnW29iamVjdCBGdW5jdGlvbl0nLFxuICAgIGdlblRhZyA9ICdbb2JqZWN0IEdlbmVyYXRvckZ1bmN0aW9uXScsXG4gICAgbWFwVGFnID0gJ1tvYmplY3QgTWFwXScsXG4gICAgbnVtYmVyVGFnID0gJ1tvYmplY3QgTnVtYmVyXScsXG4gICAgb2JqZWN0VGFnID0gJ1tvYmplY3QgT2JqZWN0XScsXG4gICAgcmVnZXhwVGFnID0gJ1tvYmplY3QgUmVnRXhwXScsXG4gICAgc2V0VGFnID0gJ1tvYmplY3QgU2V0XScsXG4gICAgc3RyaW5nVGFnID0gJ1tvYmplY3QgU3RyaW5nXScsXG4gICAgc3ltYm9sVGFnID0gJ1tvYmplY3QgU3ltYm9sXScsXG4gICAgd2Vha01hcFRhZyA9ICdbb2JqZWN0IFdlYWtNYXBdJztcblxudmFyIGFycmF5QnVmZmVyVGFnID0gJ1tvYmplY3QgQXJyYXlCdWZmZXJdJyxcbiAgICBkYXRhVmlld1RhZyA9ICdbb2JqZWN0IERhdGFWaWV3XScsXG4gICAgZmxvYXQzMlRhZyA9ICdbb2JqZWN0IEZsb2F0MzJBcnJheV0nLFxuICAgIGZsb2F0NjRUYWcgPSAnW29iamVjdCBGbG9hdDY0QXJyYXldJyxcbiAgICBpbnQ4VGFnID0gJ1tvYmplY3QgSW50OEFycmF5XScsXG4gICAgaW50MTZUYWcgPSAnW29iamVjdCBJbnQxNkFycmF5XScsXG4gICAgaW50MzJUYWcgPSAnW29iamVjdCBJbnQzMkFycmF5XScsXG4gICAgdWludDhUYWcgPSAnW29iamVjdCBVaW50OEFycmF5XScsXG4gICAgdWludDhDbGFtcGVkVGFnID0gJ1tvYmplY3QgVWludDhDbGFtcGVkQXJyYXldJyxcbiAgICB1aW50MTZUYWcgPSAnW29iamVjdCBVaW50MTZBcnJheV0nLFxuICAgIHVpbnQzMlRhZyA9ICdbb2JqZWN0IFVpbnQzMkFycmF5XSc7XG5cbi8qKiBVc2VkIHRvIGlkZW50aWZ5IGB0b1N0cmluZ1RhZ2AgdmFsdWVzIHN1cHBvcnRlZCBieSBgXy5jbG9uZWAuICovXG52YXIgY2xvbmVhYmxlVGFncyA9IHt9O1xuY2xvbmVhYmxlVGFnc1thcmdzVGFnXSA9IGNsb25lYWJsZVRhZ3NbYXJyYXlUYWddID1cbmNsb25lYWJsZVRhZ3NbYXJyYXlCdWZmZXJUYWddID0gY2xvbmVhYmxlVGFnc1tkYXRhVmlld1RhZ10gPVxuY2xvbmVhYmxlVGFnc1tib29sVGFnXSA9IGNsb25lYWJsZVRhZ3NbZGF0ZVRhZ10gPVxuY2xvbmVhYmxlVGFnc1tmbG9hdDMyVGFnXSA9IGNsb25lYWJsZVRhZ3NbZmxvYXQ2NFRhZ10gPVxuY2xvbmVhYmxlVGFnc1tpbnQ4VGFnXSA9IGNsb25lYWJsZVRhZ3NbaW50MTZUYWddID1cbmNsb25lYWJsZVRhZ3NbaW50MzJUYWddID0gY2xvbmVhYmxlVGFnc1ttYXBUYWddID1cbmNsb25lYWJsZVRhZ3NbbnVtYmVyVGFnXSA9IGNsb25lYWJsZVRhZ3Nbb2JqZWN0VGFnXSA9XG5jbG9uZWFibGVUYWdzW3JlZ2V4cFRhZ10gPSBjbG9uZWFibGVUYWdzW3NldFRhZ10gPVxuY2xvbmVhYmxlVGFnc1tzdHJpbmdUYWddID0gY2xvbmVhYmxlVGFnc1tzeW1ib2xUYWddID1cbmNsb25lYWJsZVRhZ3NbdWludDhUYWddID0gY2xvbmVhYmxlVGFnc1t1aW50OENsYW1wZWRUYWddID1cbmNsb25lYWJsZVRhZ3NbdWludDE2VGFnXSA9IGNsb25lYWJsZVRhZ3NbdWludDMyVGFnXSA9IHRydWU7XG5jbG9uZWFibGVUYWdzW2Vycm9yVGFnXSA9IGNsb25lYWJsZVRhZ3NbZnVuY1RhZ10gPVxuY2xvbmVhYmxlVGFnc1t3ZWFrTWFwVGFnXSA9IGZhbHNlO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmNsb25lYCBhbmQgYF8uY2xvbmVEZWVwYCB3aGljaCB0cmFja3NcbiAqIHRyYXZlcnNlZCBvYmplY3RzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjbG9uZS5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gYml0bWFzayBUaGUgYml0bWFzayBmbGFncy5cbiAqICAxIC0gRGVlcCBjbG9uZVxuICogIDIgLSBGbGF0dGVuIGluaGVyaXRlZCBwcm9wZXJ0aWVzXG4gKiAgNCAtIENsb25lIHN5bWJvbHNcbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtjdXN0b21pemVyXSBUaGUgZnVuY3Rpb24gdG8gY3VzdG9taXplIGNsb25pbmcuXG4gKiBAcGFyYW0ge3N0cmluZ30gW2tleV0gVGhlIGtleSBvZiBgdmFsdWVgLlxuICogQHBhcmFtIHtPYmplY3R9IFtvYmplY3RdIFRoZSBwYXJlbnQgb2JqZWN0IG9mIGB2YWx1ZWAuXG4gKiBAcGFyYW0ge09iamVjdH0gW3N0YWNrXSBUcmFja3MgdHJhdmVyc2VkIG9iamVjdHMgYW5kIHRoZWlyIGNsb25lIGNvdW50ZXJwYXJ0cy5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBjbG9uZWQgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIGJhc2VDbG9uZSh2YWx1ZSwgYml0bWFzaywgY3VzdG9taXplciwga2V5LCBvYmplY3QsIHN0YWNrKSB7XG4gIHZhciByZXN1bHQsXG4gICAgICBpc0RlZXAgPSBiaXRtYXNrICYgQ0xPTkVfREVFUF9GTEFHLFxuICAgICAgaXNGbGF0ID0gYml0bWFzayAmIENMT05FX0ZMQVRfRkxBRyxcbiAgICAgIGlzRnVsbCA9IGJpdG1hc2sgJiBDTE9ORV9TWU1CT0xTX0ZMQUc7XG5cbiAgaWYgKGN1c3RvbWl6ZXIpIHtcbiAgICByZXN1bHQgPSBvYmplY3QgPyBjdXN0b21pemVyKHZhbHVlLCBrZXksIG9iamVjdCwgc3RhY2spIDogY3VzdG9taXplcih2YWx1ZSk7XG4gIH1cbiAgaWYgKHJlc3VsdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuICBpZiAoIWlzT2JqZWN0KHZhbHVlKSkge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuICB2YXIgaXNBcnIgPSBpc0FycmF5KHZhbHVlKTtcbiAgaWYgKGlzQXJyKSB7XG4gICAgcmVzdWx0ID0gaW5pdENsb25lQXJyYXkodmFsdWUpO1xuICAgIGlmICghaXNEZWVwKSB7XG4gICAgICByZXR1cm4gY29weUFycmF5KHZhbHVlLCByZXN1bHQpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB2YXIgdGFnID0gZ2V0VGFnKHZhbHVlKSxcbiAgICAgICAgaXNGdW5jID0gdGFnID09IGZ1bmNUYWcgfHwgdGFnID09IGdlblRhZztcblxuICAgIGlmIChpc0J1ZmZlcih2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjbG9uZUJ1ZmZlcih2YWx1ZSwgaXNEZWVwKTtcbiAgICB9XG4gICAgaWYgKHRhZyA9PSBvYmplY3RUYWcgfHwgdGFnID09IGFyZ3NUYWcgfHwgKGlzRnVuYyAmJiAhb2JqZWN0KSkge1xuICAgICAgcmVzdWx0ID0gKGlzRmxhdCB8fCBpc0Z1bmMpID8ge30gOiBpbml0Q2xvbmVPYmplY3QodmFsdWUpO1xuICAgICAgaWYgKCFpc0RlZXApIHtcbiAgICAgICAgcmV0dXJuIGlzRmxhdFxuICAgICAgICAgID8gY29weVN5bWJvbHNJbih2YWx1ZSwgYmFzZUFzc2lnbkluKHJlc3VsdCwgdmFsdWUpKVxuICAgICAgICAgIDogY29weVN5bWJvbHModmFsdWUsIGJhc2VBc3NpZ24ocmVzdWx0LCB2YWx1ZSkpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoIWNsb25lYWJsZVRhZ3NbdGFnXSkge1xuICAgICAgICByZXR1cm4gb2JqZWN0ID8gdmFsdWUgOiB7fTtcbiAgICAgIH1cbiAgICAgIHJlc3VsdCA9IGluaXRDbG9uZUJ5VGFnKHZhbHVlLCB0YWcsIGJhc2VDbG9uZSwgaXNEZWVwKTtcbiAgICB9XG4gIH1cbiAgLy8gQ2hlY2sgZm9yIGNpcmN1bGFyIHJlZmVyZW5jZXMgYW5kIHJldHVybiBpdHMgY29ycmVzcG9uZGluZyBjbG9uZS5cbiAgc3RhY2sgfHwgKHN0YWNrID0gbmV3IFN0YWNrKTtcbiAgdmFyIHN0YWNrZWQgPSBzdGFjay5nZXQodmFsdWUpO1xuICBpZiAoc3RhY2tlZCkge1xuICAgIHJldHVybiBzdGFja2VkO1xuICB9XG4gIHN0YWNrLnNldCh2YWx1ZSwgcmVzdWx0KTtcblxuICB2YXIga2V5c0Z1bmMgPSBpc0Z1bGxcbiAgICA/IChpc0ZsYXQgPyBnZXRBbGxLZXlzSW4gOiBnZXRBbGxLZXlzKVxuICAgIDogKGlzRmxhdCA/IGtleXNJbiA6IGtleXMpO1xuXG4gIHZhciBwcm9wcyA9IGlzQXJyID8gdW5kZWZpbmVkIDoga2V5c0Z1bmModmFsdWUpO1xuICBhcnJheUVhY2gocHJvcHMgfHwgdmFsdWUsIGZ1bmN0aW9uKHN1YlZhbHVlLCBrZXkpIHtcbiAgICBpZiAocHJvcHMpIHtcbiAgICAgIGtleSA9IHN1YlZhbHVlO1xuICAgICAgc3ViVmFsdWUgPSB2YWx1ZVtrZXldO1xuICAgIH1cbiAgICAvLyBSZWN1cnNpdmVseSBwb3B1bGF0ZSBjbG9uZSAoc3VzY2VwdGlibGUgdG8gY2FsbCBzdGFjayBsaW1pdHMpLlxuICAgIGFzc2lnblZhbHVlKHJlc3VsdCwga2V5LCBiYXNlQ2xvbmUoc3ViVmFsdWUsIGJpdG1hc2ssIGN1c3RvbWl6ZXIsIGtleSwgdmFsdWUsIHN0YWNrKSk7XG4gIH0pO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VDbG9uZTtcbiIsInZhciBiYXNlQ2xvbmUgPSByZXF1aXJlKCcuL19iYXNlQ2xvbmUnKTtcblxuLyoqIFVzZWQgdG8gY29tcG9zZSBiaXRtYXNrcyBmb3IgY2xvbmluZy4gKi9cbnZhciBDTE9ORV9ERUVQX0ZMQUcgPSAxLFxuICAgIENMT05FX1NZTUJPTFNfRkxBRyA9IDQ7XG5cbi8qKlxuICogVGhpcyBtZXRob2QgaXMgbGlrZSBgXy5jbG9uZWAgZXhjZXB0IHRoYXQgaXQgcmVjdXJzaXZlbHkgY2xvbmVzIGB2YWx1ZWAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAxLjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHJlY3Vyc2l2ZWx5IGNsb25lLlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIGRlZXAgY2xvbmVkIHZhbHVlLlxuICogQHNlZSBfLmNsb25lXG4gKiBAZXhhbXBsZVxuICpcbiAqIHZhciBvYmplY3RzID0gW3sgJ2EnOiAxIH0sIHsgJ2InOiAyIH1dO1xuICpcbiAqIHZhciBkZWVwID0gXy5jbG9uZURlZXAob2JqZWN0cyk7XG4gKiBjb25zb2xlLmxvZyhkZWVwWzBdID09PSBvYmplY3RzWzBdKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGNsb25lRGVlcCh2YWx1ZSkge1xuICByZXR1cm4gYmFzZUNsb25lKHZhbHVlLCBDTE9ORV9ERUVQX0ZMQUcgfCBDTE9ORV9TWU1CT0xTX0ZMQUcpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsb25lRGVlcDtcbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGVycm9ySGFuZGxlciAoZXJyb3JPclN0cmluZywgdm0pIHtcbiAgY29uc3QgZXJyb3IgPSAodHlwZW9mIGVycm9yT3JTdHJpbmcgPT09ICdvYmplY3QnKVxuICAgID8gZXJyb3JPclN0cmluZ1xuICAgIDogbmV3IEVycm9yKGVycm9yT3JTdHJpbmcpXG5cbiAgdm0uX2Vycm9yID0gZXJyb3JcblxuICB0aHJvdyBlcnJvclxufVxuIiwiLy8gQGZsb3dcblxuaW1wb3J0IFZ1ZSBmcm9tICd2dWUnXG5pbXBvcnQgY2xvbmVEZWVwIGZyb20gJ2xvZGFzaC9jbG9uZURlZXAnXG5pbXBvcnQgZXJyb3JIYW5kbGVyIGZyb20gJy4vZXJyb3ItaGFuZGxlcidcblxuZnVuY3Rpb24gY3JlYXRlTG9jYWxWdWUgKCk6IENvbXBvbmVudCB7XG4gIGNvbnN0IGluc3RhbmNlID0gVnVlLmV4dGVuZCgpXG5cbiAgLy8gY2xvbmUgZ2xvYmFsIEFQSXNcbiAgT2JqZWN0LmtleXMoVnVlKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgaWYgKCFpbnN0YW5jZS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICBjb25zdCBvcmlnaW5hbCA9IFZ1ZVtrZXldXG4gICAgICBpbnN0YW5jZVtrZXldID0gdHlwZW9mIG9yaWdpbmFsID09PSAnb2JqZWN0J1xuICAgICAgICA/IGNsb25lRGVlcChvcmlnaW5hbClcbiAgICAgICAgOiBvcmlnaW5hbFxuICAgIH1cbiAgfSlcblxuICAvLyBjb25maWcgaXMgbm90IGVudW1lcmFibGVcbiAgaW5zdGFuY2UuY29uZmlnID0gY2xvbmVEZWVwKFZ1ZS5jb25maWcpXG5cbiAgaW5zdGFuY2UuY29uZmlnLmVycm9ySGFuZGxlciA9IGVycm9ySGFuZGxlclxuXG4gIC8vIG9wdGlvbiBtZXJnZSBzdHJhdGVnaWVzIG5lZWQgdG8gYmUgZXhwb3NlZCBieSByZWZlcmVuY2VcbiAgLy8gc28gdGhhdCBtZXJnZSBzdHJhdHMgcmVnaXN0ZXJlZCBieSBwbHVnaW5zIGNhbiB3b3JrIHByb3Blcmx5XG4gIGluc3RhbmNlLmNvbmZpZy5vcHRpb25NZXJnZVN0cmF0ZWdpZXMgPSBWdWUuY29uZmlnLm9wdGlvbk1lcmdlU3RyYXRlZ2llc1xuXG4gIC8vIG1ha2Ugc3VyZSBhbGwgZXh0ZW5kcyBhcmUgYmFzZWQgb24gdGhpcyBpbnN0YW5jZS5cbiAgLy8gdGhpcyBpcyBpbXBvcnRhbnQgc28gdGhhdCBnbG9iYWwgY29tcG9uZW50cyByZWdpc3RlcmVkIGJ5IHBsdWdpbnMsXG4gIC8vIGUuZy4gcm91dGVyLWxpbmsgYXJlIGNyZWF0ZWQgdXNpbmcgdGhlIGNvcnJlY3QgYmFzZSBjb25zdHJ1Y3RvclxuICBpbnN0YW5jZS5vcHRpb25zLl9iYXNlID0gaW5zdGFuY2VcblxuICAvLyBjb21wYXQgZm9yIHZ1ZS1yb3V0ZXIgPCAyLjcuMSB3aGVyZSBpdCBkb2VzIG5vdCBhbGxvdyBtdWx0aXBsZSBpbnN0YWxsc1xuICBpZiAoaW5zdGFuY2UuX2luc3RhbGxlZFBsdWdpbnMgJiYgaW5zdGFuY2UuX2luc3RhbGxlZFBsdWdpbnMubGVuZ3RoKSB7XG4gICAgaW5zdGFuY2UuX2luc3RhbGxlZFBsdWdpbnMubGVuZ3RoID0gMFxuICB9XG4gIGNvbnN0IHVzZSA9IGluc3RhbmNlLnVzZVxuICBpbnN0YW5jZS51c2UgPSAocGx1Z2luLCAuLi5yZXN0KSA9PiB7XG4gICAgaWYgKHBsdWdpbi5pbnN0YWxsZWQgPT09IHRydWUpIHtcbiAgICAgIHBsdWdpbi5pbnN0YWxsZWQgPSBmYWxzZVxuICAgIH1cbiAgICBpZiAocGx1Z2luLmluc3RhbGwgJiYgcGx1Z2luLmluc3RhbGwuaW5zdGFsbGVkID09PSB0cnVlKSB7XG4gICAgICBwbHVnaW4uaW5zdGFsbC5pbnN0YWxsZWQgPSBmYWxzZVxuICAgIH1cbiAgICB1c2UuY2FsbChpbnN0YW5jZSwgcGx1Z2luLCAuLi5yZXN0KVxuICB9XG4gIHJldHVybiBpbnN0YW5jZVxufVxuXG5leHBvcnQgZGVmYXVsdCBjcmVhdGVMb2NhbFZ1ZVxuIiwiLy8gQGZsb3dcblxuZnVuY3Rpb24gZ2V0T3B0aW9ucyAoa2V5LCBvcHRpb25zLCBjb25maWcpIHtcbiAgaWYgKG9wdGlvbnMgfHxcbiAgICAoY29uZmlnW2tleV0gJiYgT2JqZWN0LmtleXMoY29uZmlnW2tleV0pLmxlbmd0aCA+IDApKSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkob3B0aW9ucykpIHtcbiAgICAgIHJldHVybiBbXG4gICAgICAgIC4uLm9wdGlvbnMsXG4gICAgICAgIC4uLk9iamVjdC5rZXlzKGNvbmZpZ1trZXldIHx8IHt9KV1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4uY29uZmlnW2tleV0sXG4gICAgICAgIC4uLm9wdGlvbnNcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1lcmdlT3B0aW9ucyAoXG4gIG9wdGlvbnM6IE9wdGlvbnMsXG4gIGNvbmZpZzogT3B0aW9uc1xuKTogT3B0aW9ucyB7XG4gIHJldHVybiB7XG4gICAgLi4ub3B0aW9ucyxcbiAgICBzdHViczogZ2V0T3B0aW9ucygnc3R1YnMnLCBvcHRpb25zLnN0dWJzLCBjb25maWcpLFxuICAgIG1vY2tzOiBnZXRPcHRpb25zKCdtb2NrcycsIG9wdGlvbnMubW9ja3MsIGNvbmZpZyksXG4gICAgbWV0aG9kczogZ2V0T3B0aW9ucygnbWV0aG9kcycsIG9wdGlvbnMubWV0aG9kcywgY29uZmlnKVxuICB9XG59XG5cbiIsIi8vIEBmbG93XG5cbmltcG9ydCB7IHdhcm4gfSBmcm9tICdzaGFyZWQvdXRpbCdcblxuZnVuY3Rpb24gZ2V0UmVhbENoaWxkICh2bm9kZTogP1ZOb2RlKTogP1ZOb2RlIHtcbiAgY29uc3QgY29tcE9wdGlvbnMgPSB2bm9kZSAmJiB2bm9kZS5jb21wb25lbnRPcHRpb25zXG4gIGlmIChjb21wT3B0aW9ucyAmJiBjb21wT3B0aW9ucy5DdG9yLm9wdGlvbnMuYWJzdHJhY3QpIHtcbiAgICByZXR1cm4gZ2V0UmVhbENoaWxkKGdldEZpcnN0Q29tcG9uZW50Q2hpbGQoY29tcE9wdGlvbnMuY2hpbGRyZW4pKVxuICB9IGVsc2Uge1xuICAgIHJldHVybiB2bm9kZVxuICB9XG59XG5cbmZ1bmN0aW9uIGlzU2FtZUNoaWxkIChjaGlsZDogVk5vZGUsIG9sZENoaWxkOiBWTm9kZSk6IGJvb2xlYW4ge1xuICByZXR1cm4gb2xkQ2hpbGQua2V5ID09PSBjaGlsZC5rZXkgJiYgb2xkQ2hpbGQudGFnID09PSBjaGlsZC50YWdcbn1cblxuZnVuY3Rpb24gZ2V0Rmlyc3RDb21wb25lbnRDaGlsZCAoY2hpbGRyZW46ID9BcnJheTxWTm9kZT4pOiA/Vk5vZGUge1xuICBpZiAoQXJyYXkuaXNBcnJheShjaGlsZHJlbikpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBjID0gY2hpbGRyZW5baV1cbiAgICAgIGlmIChjICYmIChjLmNvbXBvbmVudE9wdGlvbnMgfHwgaXNBc3luY1BsYWNlaG9sZGVyKGMpKSkge1xuICAgICAgICByZXR1cm4gY1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBpc1ByaW1pdGl2ZSAodmFsdWU6IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gKFxuICAgIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgfHxcbiAgICB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInIHx8XG4gICAgLy8gJEZsb3dJZ25vcmVcbiAgICB0eXBlb2YgdmFsdWUgPT09ICdzeW1ib2wnIHx8XG4gICAgdHlwZW9mIHZhbHVlID09PSAnYm9vbGVhbidcbiAgKVxufVxuXG5mdW5jdGlvbiBpc0FzeW5jUGxhY2Vob2xkZXIgKG5vZGU6IFZOb2RlKTogYm9vbGVhbiB7XG4gIHJldHVybiBub2RlLmlzQ29tbWVudCAmJiBub2RlLmFzeW5jRmFjdG9yeVxufVxuY29uc3QgY2FtZWxpemVSRSA9IC8tKFxcdykvZ1xuZXhwb3J0IGNvbnN0IGNhbWVsaXplID0gKHN0cjogc3RyaW5nKTogc3RyaW5nID0+IHtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKGNhbWVsaXplUkUsIChfLCBjKSA9PiBjID8gYy50b1VwcGVyQ2FzZSgpIDogJycpXG59XG5cbmZ1bmN0aW9uIGhhc1BhcmVudFRyYW5zaXRpb24gKHZub2RlOiBWTm9kZSk6ID9ib29sZWFuIHtcbiAgd2hpbGUgKCh2bm9kZSA9IHZub2RlLnBhcmVudCkpIHtcbiAgICBpZiAodm5vZGUuZGF0YS50cmFuc2l0aW9uKSB7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCB7XG4gIHJlbmRlciAoaDogRnVuY3Rpb24pIHtcbiAgICBsZXQgY2hpbGRyZW46ID9BcnJheTxWTm9kZT4gPSB0aGlzLiRvcHRpb25zLl9yZW5kZXJDaGlsZHJlblxuICAgIGlmICghY2hpbGRyZW4pIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIC8vIGZpbHRlciBvdXQgdGV4dCBub2RlcyAocG9zc2libGUgd2hpdGVzcGFjZXMpXG4gICAgY2hpbGRyZW4gPSBjaGlsZHJlbi5maWx0ZXIoKGM6IFZOb2RlKSA9PiBjLnRhZyB8fCBpc0FzeW5jUGxhY2Vob2xkZXIoYykpXG4gICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgaWYgKCFjaGlsZHJlbi5sZW5ndGgpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIC8vIHdhcm4gbXVsdGlwbGUgZWxlbWVudHNcbiAgICBpZiAoY2hpbGRyZW4ubGVuZ3RoID4gMSkge1xuICAgICAgd2FybihcbiAgICAgICAgJzx0cmFuc2l0aW9uPiBjYW4gb25seSBiZSB1c2VkIG9uIGEgc2luZ2xlIGVsZW1lbnQuIFVzZSAnICtcbiAgICAgICAgICc8dHJhbnNpdGlvbi1ncm91cD4gZm9yIGxpc3RzLidcbiAgICAgIClcbiAgICB9XG5cbiAgICBjb25zdCBtb2RlOiBzdHJpbmcgPSB0aGlzLm1vZGVcblxuICAgIC8vIHdhcm4gaW52YWxpZCBtb2RlXG4gICAgaWYgKG1vZGUgJiYgbW9kZSAhPT0gJ2luLW91dCcgJiYgbW9kZSAhPT0gJ291dC1pbidcbiAgICApIHtcbiAgICAgIHdhcm4oXG4gICAgICAgICdpbnZhbGlkIDx0cmFuc2l0aW9uPiBtb2RlOiAnICsgbW9kZVxuICAgICAgKVxuICAgIH1cblxuICAgIGNvbnN0IHJhd0NoaWxkOiBWTm9kZSA9IGNoaWxkcmVuWzBdXG5cbiAgICAvLyBpZiB0aGlzIGlzIGEgY29tcG9uZW50IHJvb3Qgbm9kZSBhbmQgdGhlIGNvbXBvbmVudCdzXG4gICAgLy8gcGFyZW50IGNvbnRhaW5lciBub2RlIGFsc28gaGFzIHRyYW5zaXRpb24sIHNraXAuXG4gICAgaWYgKGhhc1BhcmVudFRyYW5zaXRpb24odGhpcy4kdm5vZGUpKSB7XG4gICAgICByZXR1cm4gcmF3Q2hpbGRcbiAgICB9XG5cbiAgICAvLyBhcHBseSB0cmFuc2l0aW9uIGRhdGEgdG8gY2hpbGRcbiAgICAvLyB1c2UgZ2V0UmVhbENoaWxkKCkgdG8gaWdub3JlIGFic3RyYWN0IGNvbXBvbmVudHMgZS5nLiBrZWVwLWFsaXZlXG4gICAgY29uc3QgY2hpbGQ6ID9WTm9kZSA9IGdldFJlYWxDaGlsZChyYXdDaGlsZClcblxuICAgIGlmICghY2hpbGQpIHtcbiAgICAgIHJldHVybiByYXdDaGlsZFxuICAgIH1cblxuICAgIGNvbnN0IGlkOiBzdHJpbmcgPSBgX190cmFuc2l0aW9uLSR7dGhpcy5fdWlkfS1gXG4gICAgY2hpbGQua2V5ID0gY2hpbGQua2V5ID09IG51bGxcbiAgICAgID8gY2hpbGQuaXNDb21tZW50XG4gICAgICAgID8gaWQgKyAnY29tbWVudCdcbiAgICAgICAgOiBpZCArIGNoaWxkLnRhZ1xuICAgICAgOiBpc1ByaW1pdGl2ZShjaGlsZC5rZXkpXG4gICAgICAgID8gKFN0cmluZyhjaGlsZC5rZXkpLmluZGV4T2YoaWQpID09PSAwID8gY2hpbGQua2V5IDogaWQgKyBjaGlsZC5rZXkpXG4gICAgICAgIDogY2hpbGQua2V5XG5cbiAgICBjb25zdCBkYXRhOiBPYmplY3QgPSAoY2hpbGQuZGF0YSB8fCAoY2hpbGQuZGF0YSA9IHt9KSlcbiAgICBjb25zdCBvbGRSYXdDaGlsZDogP1ZOb2RlID0gdGhpcy5fdm5vZGVcbiAgICBjb25zdCBvbGRDaGlsZDogP1ZOb2RlID0gZ2V0UmVhbENoaWxkKG9sZFJhd0NoaWxkKVxuICAgIGlmIChjaGlsZC5kYXRhLmRpcmVjdGl2ZXMgJiYgY2hpbGQuZGF0YS5kaXJlY3RpdmVzLnNvbWUoZCA9PiBkLm5hbWUgPT09ICdzaG93JykpIHtcbiAgICAgIGNoaWxkLmRhdGEuc2hvdyA9IHRydWVcbiAgICB9XG5cbiAgICAvLyBtYXJrIHYtc2hvd1xuICAgIC8vIHNvIHRoYXQgdGhlIHRyYW5zaXRpb24gbW9kdWxlIGNhbiBoYW5kIG92ZXIgdGhlIGNvbnRyb2wgdG8gdGhlIGRpcmVjdGl2ZVxuICAgIGlmIChjaGlsZC5kYXRhLmRpcmVjdGl2ZXMgJiYgY2hpbGQuZGF0YS5kaXJlY3RpdmVzLnNvbWUoZCA9PiBkLm5hbWUgPT09ICdzaG93JykpIHtcbiAgICAgIGNoaWxkLmRhdGEuc2hvdyA9IHRydWVcbiAgICB9XG4gICAgaWYgKFxuICAgICAgb2xkQ2hpbGQgJiZcbiAgICAgICAgIG9sZENoaWxkLmRhdGEgJiZcbiAgICAgICAgICFpc1NhbWVDaGlsZChjaGlsZCwgb2xkQ2hpbGQpICYmXG4gICAgICAgICAhaXNBc3luY1BsYWNlaG9sZGVyKG9sZENoaWxkKSAmJlxuICAgICAgICAgLy8gIzY2ODcgY29tcG9uZW50IHJvb3QgaXMgYSBjb21tZW50IG5vZGVcbiAgICAgICAgICEob2xkQ2hpbGQuY29tcG9uZW50SW5zdGFuY2UgJiYgb2xkQ2hpbGQuY29tcG9uZW50SW5zdGFuY2UuX3Zub2RlLmlzQ29tbWVudClcbiAgICApIHtcbiAgICAgIG9sZENoaWxkLmRhdGEgPSB7IC4uLmRhdGEgfVxuICAgIH1cbiAgICByZXR1cm4gcmF3Q2hpbGRcbiAgfVxufVxuIiwiLy8gQGZsb3dcblxuZXhwb3J0IGRlZmF1bHQge1xuICByZW5kZXIgKGg6IEZ1bmN0aW9uKSB7XG4gICAgY29uc3QgdGFnOiBzdHJpbmcgPSB0aGlzLnRhZyB8fCB0aGlzLiR2bm9kZS5kYXRhLnRhZyB8fCAnc3BhbidcbiAgICBjb25zdCBjaGlsZHJlbjogQXJyYXk8Vk5vZGU+ID0gdGhpcy4kc2xvdHMuZGVmYXVsdCB8fCBbXVxuXG4gICAgcmV0dXJuIGgodGFnLCBudWxsLCBjaGlsZHJlbilcbiAgfVxufVxuIiwiaW1wb3J0IFRyYW5zaXRpb25TdHViIGZyb20gJy4vY29tcG9uZW50cy9UcmFuc2l0aW9uU3R1YidcbmltcG9ydCBUcmFuc2l0aW9uR3JvdXBTdHViIGZyb20gJy4vY29tcG9uZW50cy9UcmFuc2l0aW9uR3JvdXBTdHViJ1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIHN0dWJzOiB7XG4gICAgdHJhbnNpdGlvbjogVHJhbnNpdGlvblN0dWIsXG4gICAgJ3RyYW5zaXRpb24tZ3JvdXAnOiBUcmFuc2l0aW9uR3JvdXBTdHViXG4gIH0sXG4gIG1vY2tzOiB7fSxcbiAgbWV0aG9kczoge31cbn1cbiIsIi8vIEBmbG93XG5cbmltcG9ydCAnLi93YXJuLWlmLW5vLXdpbmRvdydcbmltcG9ydCAnLi9tYXRjaGVzLXBvbHlmaWxsJ1xuaW1wb3J0ICcuL29iamVjdC1hc3NpZ24tcG9seWZpbGwnXG5pbXBvcnQgVnVlIGZyb20gJ3Z1ZSdcbmltcG9ydCBWdWVXcmFwcGVyIGZyb20gJy4vdnVlLXdyYXBwZXInXG5pbXBvcnQgY3JlYXRlSW5zdGFuY2UgZnJvbSAnY3JlYXRlLWluc3RhbmNlJ1xuaW1wb3J0IGNyZWF0ZUVsZW1lbnQgZnJvbSAnLi9jcmVhdGUtZWxlbWVudCdcbmltcG9ydCBjcmVhdGVMb2NhbFZ1ZSBmcm9tICcuL2NyZWF0ZS1sb2NhbC12dWUnXG5pbXBvcnQgZXJyb3JIYW5kbGVyIGZyb20gJy4vZXJyb3ItaGFuZGxlcidcbmltcG9ydCB7IGZpbmRBbGxWdWVDb21wb25lbnRzRnJvbVZtIH0gZnJvbSAnLi9maW5kLXZ1ZS1jb21wb25lbnRzJ1xuaW1wb3J0IHsgbWVyZ2VPcHRpb25zIH0gZnJvbSAnc2hhcmVkL21lcmdlLW9wdGlvbnMnXG5pbXBvcnQgY29uZmlnIGZyb20gJy4vY29uZmlnJ1xuXG5WdWUuY29uZmlnLnByb2R1Y3Rpb25UaXAgPSBmYWxzZVxuVnVlLmNvbmZpZy5kZXZ0b29scyA9IGZhbHNlXG5WdWUuY29uZmlnLmVycm9ySGFuZGxlciA9IGVycm9ySGFuZGxlclxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBtb3VudCAoY29tcG9uZW50OiBDb21wb25lbnQsIG9wdGlvbnM6IE9wdGlvbnMgPSB7fSk6IFZ1ZVdyYXBwZXIge1xuICAvLyBSZW1vdmUgY2FjaGVkIGNvbnN0cnVjdG9yXG4gIGRlbGV0ZSBjb21wb25lbnQuX0N0b3JcbiAgY29uc3QgdnVlQ2xhc3MgPSBvcHRpb25zLmxvY2FsVnVlIHx8IGNyZWF0ZUxvY2FsVnVlKClcbiAgY29uc3Qgdm0gPSBjcmVhdGVJbnN0YW5jZShjb21wb25lbnQsIG1lcmdlT3B0aW9ucyhvcHRpb25zLCBjb25maWcpLCB2dWVDbGFzcylcblxuICBpZiAob3B0aW9ucy5hdHRhY2hUb0RvY3VtZW50KSB7XG4gICAgdm0uJG1vdW50KGNyZWF0ZUVsZW1lbnQoKSlcbiAgfSBlbHNlIHtcbiAgICB2bS4kbW91bnQoKVxuICB9XG5cbiAgY29uc3QgY29tcG9uZW50V2l0aEVycm9yID0gZmluZEFsbFZ1ZUNvbXBvbmVudHNGcm9tVm0odm0pLmZpbmQoYyA9PiBjLl9lcnJvcilcblxuICBpZiAoY29tcG9uZW50V2l0aEVycm9yKSB7XG4gICAgdGhyb3cgKGNvbXBvbmVudFdpdGhFcnJvci5fZXJyb3IpXG4gIH1cblxuICBjb25zdCB3cmFwcHBlck9wdGlvbnMgPSB7XG4gICAgYXR0YWNoZWRUb0RvY3VtZW50OiAhIW9wdGlvbnMuYXR0YWNoVG9Eb2N1bWVudCxcbiAgICBzeW5jOiAhISgob3B0aW9ucy5zeW5jIHx8IG9wdGlvbnMuc3luYyA9PT0gdW5kZWZpbmVkKSlcbiAgfVxuXG4gIHJldHVybiBuZXcgVnVlV3JhcHBlcih2bSwgd3JhcHBwZXJPcHRpb25zKVxufVxuIiwiLy8gQGZsb3dcblxuaW1wb3J0ICcuL3dhcm4taWYtbm8td2luZG93J1xuaW1wb3J0IFZ1ZSBmcm9tICd2dWUnXG5pbXBvcnQgbW91bnQgZnJvbSAnLi9tb3VudCdcbmltcG9ydCB0eXBlIFZ1ZVdyYXBwZXIgZnJvbSAnLi92dWUtd3JhcHBlcidcbmltcG9ydCB7XG4gIGNyZWF0ZUNvbXBvbmVudFN0dWJzRm9yQWxsLFxuICBjcmVhdGVDb21wb25lbnRTdHVic0Zvckdsb2JhbHNcbn0gZnJvbSAnc2hhcmVkL3N0dWItY29tcG9uZW50cydcbmltcG9ydCB7IGNhbWVsaXplLFxuICBjYXBpdGFsaXplLFxuICBoeXBoZW5hdGVcbn0gZnJvbSAnc2hhcmVkL3V0aWwnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHNoYWxsb3cgKFxuICBjb21wb25lbnQ6IENvbXBvbmVudCxcbiAgb3B0aW9uczogT3B0aW9ucyA9IHt9XG4pOiBWdWVXcmFwcGVyIHtcbiAgY29uc3QgdnVlID0gb3B0aW9ucy5sb2NhbFZ1ZSB8fCBWdWVcblxuICAvLyByZW1vdmUgYW55IHJlY3Vyc2l2ZSBjb21wb25lbnRzIGFkZGVkIHRvIHRoZSBjb25zdHJ1Y3RvclxuICAvLyBpbiB2bS5faW5pdCBmcm9tIHByZXZpb3VzIHRlc3RzXG4gIGlmIChjb21wb25lbnQubmFtZSAmJiBjb21wb25lbnQuY29tcG9uZW50cykge1xuICAgIGRlbGV0ZSBjb21wb25lbnQuY29tcG9uZW50c1tjYXBpdGFsaXplKGNhbWVsaXplKGNvbXBvbmVudC5uYW1lKSldXG4gICAgZGVsZXRlIGNvbXBvbmVudC5jb21wb25lbnRzW2h5cGhlbmF0ZShjb21wb25lbnQubmFtZSldXG4gIH1cblxuICBjb25zdCBzdHViYmVkQ29tcG9uZW50cyA9IGNyZWF0ZUNvbXBvbmVudFN0dWJzRm9yQWxsKGNvbXBvbmVudClcbiAgY29uc3Qgc3R1YmJlZEdsb2JhbENvbXBvbmVudHMgPSBjcmVhdGVDb21wb25lbnRTdHVic0Zvckdsb2JhbHModnVlKVxuXG4gIHJldHVybiBtb3VudChjb21wb25lbnQsIHtcbiAgICAuLi5vcHRpb25zLFxuICAgIGNvbXBvbmVudHM6IHtcbiAgICAgIC8vIHN0dWJiZWQgY29tcG9uZW50cyBhcmUgdXNlZCBpbnN0ZWFkIG9mIG9yaWdpbmFsIGNvbXBvbmVudHMgY29tcG9uZW50c1xuICAgICAgLi4uc3R1YmJlZEdsb2JhbENvbXBvbmVudHMsXG4gICAgICAuLi5zdHViYmVkQ29tcG9uZW50c1xuICAgIH1cbiAgfSlcbn1cbiIsIi8vIEBmbG93XG5jb25zdCB0b1R5cGVzOiBBcnJheTxGdW5jdGlvbj4gPSBbU3RyaW5nLCBPYmplY3RdXG5jb25zdCBldmVudFR5cGVzOiBBcnJheTxGdW5jdGlvbj4gPSBbU3RyaW5nLCBBcnJheV1cblxuZXhwb3J0IGRlZmF1bHQge1xuICBuYW1lOiAnUm91dGVyTGlua1N0dWInLFxuICBwcm9wczoge1xuICAgIHRvOiB7XG4gICAgICB0eXBlOiB0b1R5cGVzLFxuICAgICAgcmVxdWlyZWQ6IHRydWVcbiAgICB9LFxuICAgIHRhZzoge1xuICAgICAgdHlwZTogU3RyaW5nLFxuICAgICAgZGVmYXVsdDogJ2EnXG4gICAgfSxcbiAgICBleGFjdDogQm9vbGVhbixcbiAgICBhcHBlbmQ6IEJvb2xlYW4sXG4gICAgcmVwbGFjZTogQm9vbGVhbixcbiAgICBhY3RpdmVDbGFzczogU3RyaW5nLFxuICAgIGV4YWN0QWN0aXZlQ2xhc3M6IFN0cmluZyxcbiAgICBldmVudDoge1xuICAgICAgdHlwZTogZXZlbnRUeXBlcyxcbiAgICAgIGRlZmF1bHQ6ICdjbGljaydcbiAgICB9XG4gIH0sXG4gIHJlbmRlciAoaDogRnVuY3Rpb24pIHtcbiAgICByZXR1cm4gaCh0aGlzLnRhZywgdW5kZWZpbmVkLCB0aGlzLiRzbG90cy5kZWZhdWx0KVxuICB9XG59XG4iLCJpbXBvcnQgc2hhbGxvdyBmcm9tICcuL3NoYWxsb3cnXG5pbXBvcnQgbW91bnQgZnJvbSAnLi9tb3VudCdcbmltcG9ydCBjcmVhdGVMb2NhbFZ1ZSBmcm9tICcuL2NyZWF0ZS1sb2NhbC12dWUnXG5pbXBvcnQgVHJhbnNpdGlvblN0dWIgZnJvbSAnLi9jb21wb25lbnRzL1RyYW5zaXRpb25TdHViJ1xuaW1wb3J0IFRyYW5zaXRpb25Hcm91cFN0dWIgZnJvbSAnLi9jb21wb25lbnRzL1RyYW5zaXRpb25Hcm91cFN0dWInXG5pbXBvcnQgUm91dGVyTGlua1N0dWIgZnJvbSAnLi9jb21wb25lbnRzL1JvdXRlckxpbmtTdHViJ1xuaW1wb3J0IGNvbmZpZyBmcm9tICcuL2NvbmZpZydcblxuZXhwb3J0IGRlZmF1bHQge1xuICBjcmVhdGVMb2NhbFZ1ZSxcbiAgY29uZmlnLFxuICBtb3VudCxcbiAgc2hhbGxvdyxcbiAgVHJhbnNpdGlvblN0dWIsXG4gIFRyYW5zaXRpb25Hcm91cFN0dWIsXG4gIFJvdXRlckxpbmtTdHViXG59XG4iXSwibmFtZXMiOlsiY29uc3QiLCJsZXQiLCJhcmd1bWVudHMiLCJ0aGlzIiwiZmluZEFsbCIsInN1cGVyIiwiY29tcGlsZVRvRnVuY3Rpb25zIiwiVnVlIiwiJCRWdWUiLCJpc1Z1ZUNvbXBvbmVudCIsImNvbXBpbGVUZW1wbGF0ZSIsImRlbGV0ZW9wdGlvbnMiLCJlcSIsImFzc29jSW5kZXhPZiIsImxpc3RDYWNoZUNsZWFyIiwibGlzdENhY2hlRGVsZXRlIiwibGlzdENhY2hlR2V0IiwibGlzdENhY2hlSGFzIiwibGlzdENhY2hlU2V0IiwiTGlzdENhY2hlIiwiZ2xvYmFsIiwiZnJlZUdsb2JhbCIsInJvb3QiLCJTeW1ib2wiLCJvYmplY3RQcm90byIsIm5hdGl2ZU9iamVjdFRvU3RyaW5nIiwic3ltVG9TdHJpbmdUYWciLCJnZXRSYXdUYWciLCJvYmplY3RUb1N0cmluZyIsImlzT2JqZWN0IiwiYmFzZUdldFRhZyIsImNvcmVKc0RhdGEiLCJmdW5jUHJvdG8iLCJmdW5jVG9TdHJpbmciLCJoYXNPd25Qcm9wZXJ0eSIsImlzTWFza2VkIiwiaXNGdW5jdGlvbiIsInRvU291cmNlIiwiZ2V0VmFsdWUiLCJiYXNlSXNOYXRpdmUiLCJnZXROYXRpdmUiLCJuYXRpdmVDcmVhdGUiLCJIQVNIX1VOREVGSU5FRCIsImhhc2hDbGVhciIsImhhc2hEZWxldGUiLCJoYXNoR2V0IiwiaGFzaEhhcyIsImhhc2hTZXQiLCJIYXNoIiwiTWFwIiwiaXNLZXlhYmxlIiwiZ2V0TWFwRGF0YSIsIm1hcENhY2hlQ2xlYXIiLCJtYXBDYWNoZURlbGV0ZSIsIm1hcENhY2hlR2V0IiwibWFwQ2FjaGVIYXMiLCJtYXBDYWNoZVNldCIsIk1hcENhY2hlIiwic3RhY2tDbGVhciIsInN0YWNrRGVsZXRlIiwic3RhY2tHZXQiLCJzdGFja0hhcyIsInN0YWNrU2V0IiwiZGVmaW5lUHJvcGVydHkiLCJiYXNlQXNzaWduVmFsdWUiLCJhc3NpZ25WYWx1ZSIsImlzT2JqZWN0TGlrZSIsImJhc2VJc0FyZ3VtZW50cyIsInN0dWJGYWxzZSIsIk1BWF9TQUZFX0lOVEVHRVIiLCJhcmdzVGFnIiwiZnVuY1RhZyIsImlzTGVuZ3RoIiwibm9kZVV0aWwiLCJiYXNlVW5hcnkiLCJiYXNlSXNUeXBlZEFycmF5IiwiaXNBcnJheSIsImlzQXJndW1lbnRzIiwiaXNCdWZmZXIiLCJpc1R5cGVkQXJyYXkiLCJiYXNlVGltZXMiLCJpc0luZGV4Iiwib3ZlckFyZyIsImlzUHJvdG90eXBlIiwibmF0aXZlS2V5cyIsImlzQXJyYXlMaWtlIiwiYXJyYXlMaWtlS2V5cyIsImJhc2VLZXlzIiwiY29weU9iamVjdCIsImtleXMiLCJuYXRpdmVLZXlzSW4iLCJrZXlzSW4iLCJiYXNlS2V5c0luIiwicHJvcGVydHlJc0VudW1lcmFibGUiLCJzdHViQXJyYXkiLCJhcnJheUZpbHRlciIsImdldFN5bWJvbHMiLCJuYXRpdmVHZXRTeW1ib2xzIiwiYXJyYXlQdXNoIiwiZ2V0UHJvdG90eXBlIiwiZ2V0U3ltYm9sc0luIiwiYmFzZUdldEFsbEtleXMiLCJtYXBUYWciLCJvYmplY3RUYWciLCJzZXRUYWciLCJ3ZWFrTWFwVGFnIiwiZGF0YVZpZXdUYWciLCJEYXRhVmlldyIsIlByb21pc2UiLCJTZXQiLCJXZWFrTWFwIiwiVWludDhBcnJheSIsImNsb25lQXJyYXlCdWZmZXIiLCJtYXBUb0FycmF5IiwiYXJyYXlSZWR1Y2UiLCJhZGRNYXBFbnRyeSIsIkNMT05FX0RFRVBfRkxBRyIsInNldFRvQXJyYXkiLCJhZGRTZXRFbnRyeSIsImJvb2xUYWciLCJkYXRlVGFnIiwibnVtYmVyVGFnIiwicmVnZXhwVGFnIiwic3RyaW5nVGFnIiwiYXJyYXlCdWZmZXJUYWciLCJmbG9hdDMyVGFnIiwiZmxvYXQ2NFRhZyIsImludDhUYWciLCJpbnQxNlRhZyIsImludDMyVGFnIiwidWludDhUYWciLCJ1aW50OENsYW1wZWRUYWciLCJ1aW50MTZUYWciLCJ1aW50MzJUYWciLCJjbG9uZURhdGFWaWV3IiwiY2xvbmVUeXBlZEFycmF5IiwiY2xvbmVNYXAiLCJjbG9uZVJlZ0V4cCIsImNsb25lU2V0IiwiY2xvbmVTeW1ib2wiLCJiYXNlQ3JlYXRlIiwiYXJyYXlUYWciLCJlcnJvclRhZyIsImdlblRhZyIsInN5bWJvbFRhZyIsImluaXRDbG9uZUFycmF5IiwiY29weUFycmF5IiwiZ2V0VGFnIiwiY2xvbmVCdWZmZXIiLCJpbml0Q2xvbmVPYmplY3QiLCJjb3B5U3ltYm9sc0luIiwiYmFzZUFzc2lnbkluIiwiY29weVN5bWJvbHMiLCJiYXNlQXNzaWduIiwiaW5pdENsb25lQnlUYWciLCJTdGFjayIsImdldEFsbEtleXNJbiIsImdldEFsbEtleXMiLCJhcnJheUVhY2giLCJDTE9ORV9TWU1CT0xTX0ZMQUciLCJiYXNlQ2xvbmUiLCJjbG9uZURlZXAiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFFQSxBQUFPLFNBQVMsVUFBVSxFQUFFLEdBQUcsRUFBVTtFQUN2QyxNQUFNLElBQUksS0FBSyx5QkFBc0IsR0FBRyxFQUFHO0NBQzVDOztBQUVELEFBQU8sU0FBUyxJQUFJLEVBQUUsR0FBRyxFQUFVO0VBQ2pDLE9BQU8sQ0FBQyxLQUFLLHlCQUFzQixHQUFHLEdBQUc7Q0FDMUM7O0FBRURBLElBQU0sVUFBVSxHQUFHLFNBQVE7QUFDM0IsQUFBT0EsSUFBTSxRQUFRLGFBQUksR0FBRyxFQUFVLFNBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxVQUFVLFlBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxTQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsV0FBVyxFQUFFLEdBQUcsS0FBRSxLQUFDOzs7OztBQUtwRyxBQUFPQSxJQUFNLFVBQVUsYUFBSSxHQUFHLEVBQVUsU0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFDOzs7OztBQUtyRkEsSUFBTSxXQUFXLEdBQUcsYUFBWTtBQUNoQyxBQUFPQSxJQUFNLFNBQVMsYUFBSSxHQUFHLEVBQVUsU0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxLQUFLLENBQUMsQ0FBQyxXQUFXLEtBQUU7O0FDcEJ2RixJQUFJLE9BQU8sTUFBTSxLQUFLLFdBQVcsRUFBRTtFQUNqQyxVQUFVO0lBQ1IsaUZBQWlGO0lBQ2pGLDZEQUE2RDtJQUM3RCxtRkFBbUY7SUFDcEY7Q0FDRjs7QUNSRCxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUU7RUFD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
