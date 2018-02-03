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

function isVueComponent$1 (component) {
  if (typeof component === 'function' && component.options) {
    return true
  }

  if (component === null) {
    return false
  }

  if (typeof component !== 'object') {
    return false
  }

  if (component.extends) {
    return true
  }

  if (component._Ctor) {
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
  if (typeof refOptionsObject !== 'object') {
    return false
  }

  if (refOptionsObject === null) {
    return false
  }

  var validFindKeys = ['ref'];
  var keys = Object.keys(refOptionsObject);
  if (!keys.length) {
    return false
  }

  var isValid = Object.keys(refOptionsObject).every(function (key) {
    return validFindKeys.includes(key) &&
      typeof refOptionsObject[key] === 'string'
  });

  return isValid
}

function isNameSelector (nameOptionsObject) {
  if (typeof nameOptionsObject !== 'object') {
    return false
  }

  if (nameOptionsObject === null) {
    return false
  }

  return !!nameOptionsObject.name
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

function isVueComponent (comp) {
  return comp && (comp.render || comp.template || comp.options)
}

function isValidStub (stub) {
  return !!stub &&
      typeof stub === 'string' ||
      (stub === true) ||
      (isVueComponent(stub))
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
    console.log(components[component].name);
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

var NAME_SELECTOR = 'NAME_SELECTOR';
var COMPONENT_SELECTOR = 'COMPONENT_SELECTOR';
var REF_SELECTOR = 'REF_SELECTOR';
var DOM_SELECTOR = 'DOM_SELECTOR';
var VUE_VERSION = Number(((Vue.version.split('.')[0]) + "." + (Vue.version.split('.')[1])));
var FUNCTIONAL_OPTIONS = VUE_VERSION >= 2.5 ? 'fnOptions' : 'functionalOptions';

// 

function getSelectorType (selector) {
  if (isDomSelector(selector)) {
    return DOM_SELECTOR
  }

  if (isNameSelector(selector)) {
    return NAME_SELECTOR
  }

  if (isVueComponent$1(selector)) {
    return COMPONENT_SELECTOR
  }

  if (isRefSelector(selector)) {
    return REF_SELECTOR
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
  return (vm.$vnode && vm.$vnode.componentOptions &&
    vm.$vnode.componentOptions.Ctor.options.name === name) ||
    (vm._vnode && vm._vnode.functionalOptions &&
      vm._vnode.functionalOptions.name === name) ||
        vm.$options && vm.$options.name === name
}

function vmCtorMatchesSelector (component, selector) {
  var Ctor = selector._Ctor || selector.options && selector.options._Ctor;
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
  var components = root._isVue
    ? findAllVueComponentsFromVm(root)
    : findAllVueComponentsFromVnode(root);
  return components.filter(function (component) {
    if (!component.$vnode && !component.$options.extends) {
      return false
    }
    return selectorType === COMPONENT_SELECTOR
      ? vmCtorMatchesSelector(component, selector)
      : vmCtorMatchesName(component, selector.name)
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
  throwError(("find did not return " + (this.selector) + ", cannot call update() on empty Wrapper"));
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
  var uniqueNodes = [];
  vNodes.forEach(function (vNode) {
    var exists = uniqueNodes.some(function (node) { return vNode.elm === node.elm; });
    if (!exists) {
      uniqueNodes.push(vNode);
    }
  });
  return uniqueNodes
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
  update,
  options
) {
  return node instanceof Vue
    ? new VueWrapper(node, options)
    : new Wrapper(node, update, options)
}

// 

var Wrapper = function Wrapper (node, update, options) {
  if (node instanceof Element) {
    this.element = node;
    this.vnode = null;
  } else {
    this.vnode = node;
    this.element = node.elm;
  }
  this.update = update;
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

  var classes = this.element.className ? this.element.className.split(' ') : [];
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
  return createWrapper(nodes[0], this.update, this.options)
};

/**
 * Finds node in tree of the current wrapper that matches the provided selector.
 */
Wrapper.prototype.findAll = function findAll$1 (selector) {
    var this$1 = this;

  getSelectorTypeOrThrow(selector, 'findAll');
  var nodes = find(this.vm, this.vnode, this.element, selector);
  var wrappers = nodes.map(function (node) { return createWrapper(node, this$1.update, this$1.options); }
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

  if (!this.vm) {
    throwError('wrapper.setData() can only be called on a Vue instance');
  }

  Object.keys(data).forEach(function (key) {
    // $FlowIgnore : Problem with possibly null this.vm
    this$1.vm.$set(this$1.vm, [key], data[key]);
  });

  this.update(data);
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
  if (this.vm && this.vm.$options && !this.vm.$options.propsData) {
    this.vm.$options.propsData = {};
  }
  Object.keys(data).forEach(function (key) {
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

  this.update(data);
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
  this.update();
};

// 

function isValidSlot (slot) {
  return Array.isArray(slot) || (slot !== null && typeof slot === 'object') || typeof slot === 'string'
}

function addSlotToVm (vm, slotName, slotValue) {
  var elem;
  if (typeof slotValue === 'string') {
    if (!vueTemplateCompiler.compileToFunctions) {
      throwError('vueTemplateCompiler is undefined, you must pass components explicitly if vue-template-compiler is undefined');
    }
    if (window.navigator.userAgent.match(/PhantomJS/i)) {
      throwError('option.slots does not support strings in PhantomJS. Please use Puppeteer, or pass a component');
    }
    var domParser = new window.DOMParser();
    var document = domParser.parseFromString(slotValue, 'text/html');
    var _slotValue = slotValue.trim();
    if (_slotValue[0] === '<' && _slotValue[_slotValue.length - 1] === '>' && document.body.childElementCount === 1) {
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
var objectProto$1 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$1 = objectProto$1.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto$1.toString;

/** Built-in value references. */
var symToStringTag$1 = _Symbol ? _Symbol.toStringTag : undefined;

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty$1.call(value, symToStringTag$1),
      tag = value[symToStringTag$1];

  try {
    value[symToStringTag$1] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag$1] = tag;
    } else {
      delete value[symToStringTag$1];
    }
  }
  return result;
}

var _getRawTag = getRawTag;

/** Used for built-in method references. */
var objectProto$2 = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString$1 = objectProto$2.toString;

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
var nullTag = '[object Null]';
var undefinedTag = '[object Undefined]';

/** Built-in value references. */
var symToStringTag = _Symbol ? _Symbol.toStringTag : undefined;

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
  return (symToStringTag && symToStringTag in Object(value))
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
var asyncTag = '[object AsyncFunction]';
var funcTag$1 = '[object Function]';
var genTag$1 = '[object GeneratorFunction]';
var proxyTag = '[object Proxy]';

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
  return tag == funcTag$1 || tag == genTag$1 || tag == asyncTag || tag == proxyTag;
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
var funcProto$1 = Function.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString$1 = funcProto$1.toString;

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
      return funcToString$1.call(func);
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
var funcProto = Function.prototype;
var objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
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
var argsTag$1 = '[object Arguments]';

/**
 * The base implementation of `_.isArguments`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 */
function baseIsArguments(value) {
  return isObjectLike_1(value) && _baseGetTag(value) == argsTag$1;
}

var _baseIsArguments = baseIsArguments;

/** Used for built-in method references. */
var objectProto$7 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$6 = objectProto$7.hasOwnProperty;

/** Built-in value references. */
var propertyIsEnumerable = objectProto$7.propertyIsEnumerable;

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
  return isObjectLike_1(value) && hasOwnProperty$6.call(value, 'callee') &&
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
var argsTag$2 = '[object Arguments]';
var arrayTag$1 = '[object Array]';
var boolTag$1 = '[object Boolean]';
var dateTag$1 = '[object Date]';
var errorTag$1 = '[object Error]';
var funcTag$2 = '[object Function]';
var mapTag$1 = '[object Map]';
var numberTag$1 = '[object Number]';
var objectTag$1 = '[object Object]';
var regexpTag$1 = '[object RegExp]';
var setTag$1 = '[object Set]';
var stringTag$1 = '[object String]';
var weakMapTag$1 = '[object WeakMap]';

var arrayBufferTag$1 = '[object ArrayBuffer]';
var dataViewTag$1 = '[object DataView]';
var float32Tag$1 = '[object Float32Array]';
var float64Tag$1 = '[object Float64Array]';
var int8Tag$1 = '[object Int8Array]';
var int16Tag$1 = '[object Int16Array]';
var int32Tag$1 = '[object Int32Array]';
var uint8Tag$1 = '[object Uint8Array]';
var uint8ClampedTag$1 = '[object Uint8ClampedArray]';
var uint16Tag$1 = '[object Uint16Array]';
var uint32Tag$1 = '[object Uint32Array]';

/** Used to identify `toStringTag` values of typed arrays. */
var typedArrayTags = {};
typedArrayTags[float32Tag$1] = typedArrayTags[float64Tag$1] =
typedArrayTags[int8Tag$1] = typedArrayTags[int16Tag$1] =
typedArrayTags[int32Tag$1] = typedArrayTags[uint8Tag$1] =
typedArrayTags[uint8ClampedTag$1] = typedArrayTags[uint16Tag$1] =
typedArrayTags[uint32Tag$1] = true;
typedArrayTags[argsTag$2] = typedArrayTags[arrayTag$1] =
typedArrayTags[arrayBufferTag$1] = typedArrayTags[boolTag$1] =
typedArrayTags[dataViewTag$1] = typedArrayTags[dateTag$1] =
typedArrayTags[errorTag$1] = typedArrayTags[funcTag$2] =
typedArrayTags[mapTag$1] = typedArrayTags[numberTag$1] =
typedArrayTags[objectTag$1] = typedArrayTags[regexpTag$1] =
typedArrayTags[setTag$1] = typedArrayTags[stringTag$1] =
typedArrayTags[weakMapTag$1] = false;

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
var objectProto$6 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$5 = objectProto$6.hasOwnProperty;

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
    if ((inherited || hasOwnProperty$5.call(value, key)) &&
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
var objectProto$9 = Object.prototype;

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto$9;

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
var objectProto$8 = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty$7 = objectProto$8.hasOwnProperty;

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
var mapTag$2 = '[object Map]';
var objectTag$2 = '[object Object]';
var promiseTag = '[object Promise]';
var setTag$2 = '[object Set]';
var weakMapTag$2 = '[object WeakMap]';

var dataViewTag$2 = '[object DataView]';

/** Used to detect maps, sets, and weakmaps. */
var dataViewCtorString = _toSource(_DataView);
var mapCtorString = _toSource(_Map);
var promiseCtorString = _toSource(_Promise);
var setCtorString = _toSource(_Set);
var weakMapCtorString = _toSource(_WeakMap);

/**
 * Gets the `toStringTag` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
var getTag = _baseGetTag;

// Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
if ((_DataView && getTag(new _DataView(new ArrayBuffer(1))) != dataViewTag$2) ||
    (_Map && getTag(new _Map) != mapTag$2) ||
    (_Promise && getTag(_Promise.resolve()) != promiseTag) ||
    (_Set && getTag(new _Set) != setTag$2) ||
    (_WeakMap && getTag(new _WeakMap) != weakMapTag$2)) {
  getTag = function(value) {
    var result = _baseGetTag(value),
        Ctor = result == objectTag$2 ? value.constructor : undefined,
        ctorString = Ctor ? _toSource(Ctor) : '';

    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString: return dataViewTag$2;
        case mapCtorString: return mapTag$2;
        case promiseCtorString: return promiseTag;
        case setCtorString: return setTag$2;
        case weakMapCtorString: return weakMapTag$2;
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
var CLONE_DEEP_FLAG$2 = 1;

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
  var array = isDeep ? cloneFunc(_mapToArray(map), CLONE_DEEP_FLAG$2) : _mapToArray(map);
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
var CLONE_DEEP_FLAG$3 = 1;

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
  var array = isDeep ? cloneFunc(_setToArray(set), CLONE_DEEP_FLAG$3) : _setToArray(set);
  return _arrayReduce(array, _addSetEntry, new set.constructor);
}

var _cloneSet = cloneSet;

/** Used to convert symbols to primitives and strings. */
var symbolProto = _Symbol ? _Symbol.prototype : undefined;
var symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

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
var boolTag$2 = '[object Boolean]';
var dateTag$2 = '[object Date]';
var mapTag$3 = '[object Map]';
var numberTag$2 = '[object Number]';
var regexpTag$2 = '[object RegExp]';
var setTag$3 = '[object Set]';
var stringTag$2 = '[object String]';
var symbolTag$1 = '[object Symbol]';

var arrayBufferTag$2 = '[object ArrayBuffer]';
var dataViewTag$3 = '[object DataView]';
var float32Tag$2 = '[object Float32Array]';
var float64Tag$2 = '[object Float64Array]';
var int8Tag$2 = '[object Int8Array]';
var int16Tag$2 = '[object Int16Array]';
var int32Tag$2 = '[object Int32Array]';
var uint8Tag$2 = '[object Uint8Array]';
var uint8ClampedTag$2 = '[object Uint8ClampedArray]';
var uint16Tag$2 = '[object Uint16Array]';
var uint32Tag$2 = '[object Uint32Array]';

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
    case arrayBufferTag$2:
      return _cloneArrayBuffer(object);

    case boolTag$2:
    case dateTag$2:
      return new Ctor(+object);

    case dataViewTag$3:
      return _cloneDataView(object, isDeep);

    case float32Tag$2: case float64Tag$2:
    case int8Tag$2: case int16Tag$2: case int32Tag$2:
    case uint8Tag$2: case uint8ClampedTag$2: case uint16Tag$2: case uint32Tag$2:
      return _cloneTypedArray(object, isDeep);

    case mapTag$3:
      return _cloneMap(object, isDeep, cloneFunc);

    case numberTag$2:
    case stringTag$2:
      return new Ctor(object);

    case regexpTag$2:
      return _cloneRegExp(object);

    case setTag$3:
      return _cloneSet(object, isDeep, cloneFunc);

    case symbolTag$1:
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
var CLONE_DEEP_FLAG$1 = 1;
var CLONE_FLAT_FLAG = 2;
var CLONE_SYMBOLS_FLAG$1 = 4;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]';
var arrayTag = '[object Array]';
var boolTag = '[object Boolean]';
var dateTag = '[object Date]';
var errorTag = '[object Error]';
var funcTag = '[object Function]';
var genTag = '[object GeneratorFunction]';
var mapTag = '[object Map]';
var numberTag = '[object Number]';
var objectTag = '[object Object]';
var regexpTag = '[object RegExp]';
var setTag = '[object Set]';
var stringTag = '[object String]';
var symbolTag = '[object Symbol]';
var weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]';
var dataViewTag = '[object DataView]';
var float32Tag = '[object Float32Array]';
var float64Tag = '[object Float64Array]';
var int8Tag = '[object Int8Array]';
var int16Tag = '[object Int16Array]';
var int32Tag = '[object Int32Array]';
var uint8Tag = '[object Uint8Array]';
var uint8ClampedTag = '[object Uint8ClampedArray]';
var uint16Tag = '[object Uint16Array]';
var uint32Tag = '[object Uint32Array]';

/** Used to identify `toStringTag` values supported by `_.clone`. */
var cloneableTags = {};
cloneableTags[argsTag] = cloneableTags[arrayTag] =
cloneableTags[arrayBufferTag] = cloneableTags[dataViewTag] =
cloneableTags[boolTag] = cloneableTags[dateTag] =
cloneableTags[float32Tag] = cloneableTags[float64Tag] =
cloneableTags[int8Tag] = cloneableTags[int16Tag] =
cloneableTags[int32Tag] = cloneableTags[mapTag] =
cloneableTags[numberTag] = cloneableTags[objectTag] =
cloneableTags[regexpTag] = cloneableTags[setTag] =
cloneableTags[stringTag] = cloneableTags[symbolTag] =
cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] =
cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
cloneableTags[errorTag] = cloneableTags[funcTag] =
cloneableTags[weakMapTag] = false;

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
      isDeep = bitmask & CLONE_DEEP_FLAG$1,
      isFlat = bitmask & CLONE_FLAT_FLAG,
      isFull = bitmask & CLONE_SYMBOLS_FLAG$1;

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
        isFunc = tag == funcTag || tag == genTag;

    if (isBuffer_1(value)) {
      return _cloneBuffer(value, isDeep);
    }
    if (tag == objectTag || tag == argsTag || (isFunc && !object)) {
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
var CLONE_DEEP_FLAG = 1;
var CLONE_SYMBOLS_FLAG = 4;

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
  return _baseClone(value, CLONE_DEEP_FLAG | CLONE_SYMBOLS_FLAG);
}

var cloneDeep_1 = cloneDeep;

// 

function update (changedData) {
  var this$1 = this;

  // the only component made by mount()
  if (this.$_originalSlots) {
    this.$slots = cloneDeep_1(this.$_originalSlots);
  }
  if (this.$_mountingOptionsSlots) {
    addSlots(this, this.$_mountingOptionsSlots);
  }
  if (changedData) {
    Object.keys(changedData).forEach(function (key) {
       // $FlowIgnore : Problem with possibly null this.vm
      this$1._watchers.forEach(function (watcher) {
        if (watcher.expression === key) { watcher.run(); }
      });
    });
  } else {
    this._watchers.forEach(function (watcher) {
      watcher.run();
    });
  }
  var vnodes = this._render();
  this._update(vnodes);
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
    this._emitted = vm.__emitted;
    this._emittedByOrder = vm.__emittedByOrder;
  }

  if ( Wrapper$$1 ) VueWrapper.__proto__ = Wrapper$$1;
  VueWrapper.prototype = Object.create( Wrapper$$1 && Wrapper$$1.prototype );
  VueWrapper.prototype.constructor = VueWrapper;

  return VueWrapper;
}(Wrapper));

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
var camelizeRE$1 = /-(\w)/g;
var camelize$1 = function (str) {
  return str.replace(camelizeRE$1, function (_, c) { return c ? c.toUpperCase() : ''; })
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
    data[camelize$1(key$1)] = listeners[key$1];
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

    var id = "__transition-" + (this._uid) + "-";
    child.key = child.key == null
      ? child.isComment
        ? id + 'comment'
        : id + child.tag
      : isPrimitive(child.key)
        ? (String(child.key).indexOf(id) === 0 ? child.key : id + child.key)
        : child.key;

    var data = (child.data || (child.data = {})).transition = extractTransitionData(this);
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

function isValidSlot$1 (slot) {
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
        if (!isValidSlot$1(slot)) {
          throwError('slots[key] must be a Component, string or an array of Components');
        }
        var component = typeof slot === 'string' ? vueTemplateCompiler.compileToFunctions(slot) : slot;
        var newSlot = h(component);
        newSlot.data.slot = slotType;
        children.push(newSlot);
      });
    } else {
      if (!isValidSlot$1(slots[slotType])) {
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

function createFunctionalComponent (component, mountingOptions) {
  if (mountingOptions.context && typeof mountingOptions.context !== 'object') {
    throwError('mount.context must be an object');
  }

  return {
    render: function render (h) {
      return h(
        component,
        mountingOptions.context || component.FunctionalRenderContext,
        (mountingOptions.context && mountingOptions.context.children && mountingOptions.context.children.map(function (x) { return typeof x === 'function' ? x(h) : x; })) || createFunctionalSlots(mountingOptions.slots, h)
      )
    },
    name: component.name
  }
}

// 

function createConstructor (
  component,
  options
) {
  var mountingOptions = extractOptions(options);

  var vue = mountingOptions.localVue || createLocalVue();

  if (mountingOptions.mocks) {
    addMocks(mountingOptions.mocks, vue);
  }

  if ((component.options && component.options.functional) || component.functional) {
    component = createFunctionalComponent(component, mountingOptions);
  } else if (mountingOptions.context) {
    throwError(
      'mount.context can only be used when mounting a functional component'
    );
  }

  if (mountingOptions.provide) {
    addProvide(component, mountingOptions.provide, options);
  }

  if (componentNeedsCompiling(component)) {
    compileTemplate(component);
  }

  addEventLogger(vue);

  var Constructor = vue.extend(component);

  var instanceOptions = Object.assign({}, options);
  deleteMountingOptions(instanceOptions);

  if (mountingOptions.stubs) {
    instanceOptions.components = Object.assign({}, instanceOptions.components,
      // $FlowIgnore
      createComponentStubs(component.components, mountingOptions.stubs));
  }

  var vm = new Constructor(instanceOptions);

  addAttrs(vm, mountingOptions.attrs);
  addListeners(vm, mountingOptions.listeners);

  vm.$_mountingOptionsSlots = mountingOptions.slots;
  vm.$_originalSlots = cloneDeep_1(vm.$slots);

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

if (typeof Object.assign !== 'function') {
  (function () {
    Object.assign = function (target) {
      'use strict';
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

Vue.config.productionTip = false;
Vue.config.errorHandler = errorHandler;
Vue.config.devtools = false;

function mount (component, options) {
  if ( options === void 0 ) options = {};

  // Remove cached constructor
  delete component._Ctor;

  var vm = createConstructor(component, options);

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

module.exports = index;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidnVlLXRlc3QtdXRpbHMuanMiLCJzb3VyY2VzIjpbIi4uL3NyYy9saWIvdXRpbC5qcyIsIi4uL3NyYy9saWIvd2Fybi1pZi1uby13aW5kb3cuanMiLCIuLi9zcmMvbGliL3ZhbGlkYXRvcnMuanMiLCIuLi9zcmMvbGliL2NvbXBpbGUtdGVtcGxhdGUuanMiLCIuLi9zcmMvbGliL3N0dWItY29tcG9uZW50cy5qcyIsIi4uL3NyYy9saWIvY29uc3RzLmpzIiwiLi4vc3JjL2xpYi9nZXQtc2VsZWN0b3ItdHlwZS5qcyIsIi4uL3NyYy9saWIvZmluZC12dWUtY29tcG9uZW50cy5qcyIsIi4uL3NyYy93cmFwcGVycy93cmFwcGVyLWFycmF5LmpzIiwiLi4vc3JjL3dyYXBwZXJzL2Vycm9yLXdyYXBwZXIuanMiLCIuLi9zcmMvbGliL2ZpbmQtdm5vZGVzLmpzIiwiLi4vc3JjL2xpYi9maW5kLWRvbS1ub2Rlcy5qcyIsIi4uL3NyYy9saWIvZmluZC5qcyIsIi4uL3NyYy93cmFwcGVycy9jcmVhdGUtd3JhcHBlci5qcyIsIi4uL3NyYy93cmFwcGVycy93cmFwcGVyLmpzIiwiLi4vc3JjL2xpYi9hZGQtc2xvdHMuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19saXN0Q2FjaGVDbGVhci5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvZXEuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19hc3NvY0luZGV4T2YuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19saXN0Q2FjaGVEZWxldGUuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19saXN0Q2FjaGVHZXQuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19saXN0Q2FjaGVIYXMuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19saXN0Q2FjaGVTZXQuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19MaXN0Q2FjaGUuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19zdGFja0NsZWFyLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fc3RhY2tEZWxldGUuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19zdGFja0dldC5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX3N0YWNrSGFzLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fZnJlZUdsb2JhbC5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX3Jvb3QuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19TeW1ib2wuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19nZXRSYXdUYWcuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19vYmplY3RUb1N0cmluZy5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VHZXRUYWcuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL2lzT2JqZWN0LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9pc0Z1bmN0aW9uLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fY29yZUpzRGF0YS5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2lzTWFza2VkLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fdG9Tb3VyY2UuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19iYXNlSXNOYXRpdmUuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19nZXRWYWx1ZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2dldE5hdGl2ZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX01hcC5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX25hdGl2ZUNyZWF0ZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2hhc2hDbGVhci5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2hhc2hEZWxldGUuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19oYXNoR2V0LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9faGFzaEhhcy5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2hhc2hTZXQuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19IYXNoLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fbWFwQ2FjaGVDbGVhci5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2lzS2V5YWJsZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2dldE1hcERhdGEuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19tYXBDYWNoZURlbGV0ZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX21hcENhY2hlR2V0LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fbWFwQ2FjaGVIYXMuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19tYXBDYWNoZVNldC5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX01hcENhY2hlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fc3RhY2tTZXQuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19TdGFjay5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2FycmF5RWFjaC5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2RlZmluZVByb3BlcnR5LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZUFzc2lnblZhbHVlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYXNzaWduVmFsdWUuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19jb3B5T2JqZWN0LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZVRpbWVzLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9pc09iamVjdExpa2UuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19iYXNlSXNBcmd1bWVudHMuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL2lzQXJndW1lbnRzLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9pc0FycmF5LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9zdHViRmFsc2UuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL2lzQnVmZmVyLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9faXNJbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvaXNMZW5ndGguanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19iYXNlSXNUeXBlZEFycmF5LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZVVuYXJ5LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fbm9kZVV0aWwuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL2lzVHlwZWRBcnJheS5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2FycmF5TGlrZUtleXMuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19pc1Byb3RvdHlwZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX292ZXJBcmcuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19uYXRpdmVLZXlzLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZUtleXMuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL2lzQXJyYXlMaWtlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9rZXlzLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZUFzc2lnbi5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX25hdGl2ZUtleXNJbi5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VLZXlzSW4uanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL2tleXNJbi5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Jhc2VBc3NpZ25Jbi5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Nsb25lQnVmZmVyLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fY29weUFycmF5LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYXJyYXlGaWx0ZXIuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL3N0dWJBcnJheS5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2dldFN5bWJvbHMuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19jb3B5U3ltYm9scy5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2FycmF5UHVzaC5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2dldFByb3RvdHlwZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2dldFN5bWJvbHNJbi5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2NvcHlTeW1ib2xzSW4uanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19iYXNlR2V0QWxsS2V5cy5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2dldEFsbEtleXMuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19nZXRBbGxLZXlzSW4uanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19EYXRhVmlldy5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX1Byb21pc2UuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19TZXQuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19XZWFrTWFwLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fZ2V0VGFnLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9faW5pdENsb25lQXJyYXkuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19VaW50OEFycmF5LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fY2xvbmVBcnJheUJ1ZmZlci5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Nsb25lRGF0YVZpZXcuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19hZGRNYXBFbnRyeS5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2FycmF5UmVkdWNlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fbWFwVG9BcnJheS5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Nsb25lTWFwLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fY2xvbmVSZWdFeHAuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19hZGRTZXRFbnRyeS5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX3NldFRvQXJyYXkuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19jbG9uZVNldC5qcyIsIi4uL25vZGVfbW9kdWxlcy9sb2Rhc2gvX2Nsb25lU3ltYm9sLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fY2xvbmVUeXBlZEFycmF5LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9faW5pdENsb25lQnlUYWcuanMiLCIuLi9ub2RlX21vZHVsZXMvbG9kYXNoL19iYXNlQ3JlYXRlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9faW5pdENsb25lT2JqZWN0LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9fYmFzZUNsb25lLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2xvZGFzaC9jbG9uZURlZXAuanMiLCIuLi9zcmMvd3JhcHBlcnMvdnVlLXdyYXBwZXIuanMiLCIuLi9zcmMvbGliL2FkZC1tb2Nrcy5qcyIsIi4uL3NyYy9saWIvYWRkLWF0dHJzLmpzIiwiLi4vc3JjL2xpYi9hZGQtbGlzdGVuZXJzLmpzIiwiLi4vc3JjL2xpYi9hZGQtcHJvdmlkZS5qcyIsIi4uL3NyYy9saWIvbG9nLWV2ZW50cy5qcyIsIi4uL3NyYy9saWIvZXJyb3ItaGFuZGxlci5qcyIsIi4uL3NyYy9jcmVhdGUtbG9jYWwtdnVlLmpzIiwiLi4vc3JjL2NvbXBvbmVudHMvVHJhbnNpdGlvblN0dWIuanMiLCIuLi9zcmMvY29tcG9uZW50cy9UcmFuc2l0aW9uR3JvdXBTdHViLmpzIiwiLi4vc3JjL2NvbmZpZy5qcyIsIi4uL3NyYy9vcHRpb25zL2V4dHJhY3Qtb3B0aW9ucy5qcyIsIi4uL3NyYy9vcHRpb25zL2RlbGV0ZS1tb3VudGluZy1vcHRpb25zLmpzIiwiLi4vc3JjL2xpYi9jcmVhdGUtZnVuY3Rpb25hbC1jb21wb25lbnQuanMiLCIuLi9zcmMvbGliL2NyZWF0ZS1pbnN0YW5jZS5qcyIsIi4uL3NyYy9saWIvY3JlYXRlLWVsZW1lbnQuanMiLCIuLi9zcmMvbGliL3BvbHlmaWxscy9tYXRjaGVzLXBvbHlmaWxsLmpzIiwiLi4vc3JjL2xpYi9wb2x5ZmlsbHMvb2JqZWN0LWFzc2lnbi1wb2x5ZmlsbC5qcyIsIi4uL3NyYy9tb3VudC5qcyIsIi4uL3NyYy9zaGFsbG93LmpzIiwiLi4vc3JjL2NvbXBvbmVudHMvUm91dGVyTGlua1N0dWIuanMiLCIuLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQGZsb3dcblxuZXhwb3J0IGZ1bmN0aW9uIHRocm93RXJyb3IgKG1zZzogc3RyaW5nKTogdm9pZCB7XG4gIHRocm93IG5ldyBFcnJvcihgW3Z1ZS10ZXN0LXV0aWxzXTogJHttc2d9YClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdhcm4gKG1zZzogc3RyaW5nKTogdm9pZCB7XG4gIGNvbnNvbGUuZXJyb3IoYFt2dWUtdGVzdC11dGlsc106ICR7bXNnfWApXG59XG5cbmNvbnN0IGNhbWVsaXplUkUgPSAvLShcXHcpL2dcbmV4cG9ydCBjb25zdCBjYW1lbGl6ZSA9IChzdHI6IHN0cmluZyk6IHN0cmluZyA9PiBzdHIucmVwbGFjZShjYW1lbGl6ZVJFLCAoXywgYykgPT4gYyA/IGMudG9VcHBlckNhc2UoKSA6ICcnKVxuXG4vKipcbiAqIENhcGl0YWxpemUgYSBzdHJpbmcuXG4gKi9cbmV4cG9ydCBjb25zdCBjYXBpdGFsaXplID0gKHN0cjogc3RyaW5nKTogc3RyaW5nID0+IHN0ci5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHN0ci5zbGljZSgxKVxuXG4vKipcbiAqIEh5cGhlbmF0ZSBhIGNhbWVsQ2FzZSBzdHJpbmcuXG4gKi9cbmNvbnN0IGh5cGhlbmF0ZVJFID0gL1xcQihbQS1aXSkvZ1xuZXhwb3J0IGNvbnN0IGh5cGhlbmF0ZSA9IChzdHI6IHN0cmluZyk6IHN0cmluZyA9PiBzdHIucmVwbGFjZShoeXBoZW5hdGVSRSwgJy0kMScpLnRvTG93ZXJDYXNlKClcbiIsImltcG9ydCB7IHRocm93RXJyb3IgfSBmcm9tICcuL3V0aWwnXG5cbmlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJykge1xuICB0aHJvd0Vycm9yKFxuICAgICd3aW5kb3cgaXMgdW5kZWZpbmVkLCB2dWUtdGVzdC11dGlscyBuZWVkcyB0byBiZSBydW4gaW4gYSBicm93c2VyIGVudmlyb25tZW50LlxcbicgK1xuICAgICdZb3UgY2FuIHJ1biB0aGUgdGVzdHMgaW4gbm9kZSB1c2luZyBqc2RvbSArIGpzZG9tLWdsb2JhbC5cXG4nICtcbiAgICAnU2VlIGh0dHBzOi8vdnVlLXRlc3QtdXRpbHMudnVlanMub3JnL2VuL2d1aWRlcy9jb21tb24tdGlwcy5odG1sIGZvciBtb3JlIGRldGFpbHMuJ1xuICApXG59XG4iLCIvLyBAZmxvd1xuaW1wb3J0IHsgdGhyb3dFcnJvciB9IGZyb20gJy4vdXRpbCdcblxuZXhwb3J0IGZ1bmN0aW9uIGlzRG9tU2VsZWN0b3IgKHNlbGVjdG9yOiBhbnkpOiBib29sZWFuIHtcbiAgaWYgKHR5cGVvZiBzZWxlY3RvciAhPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIHRyeSB7XG4gICAgaWYgKHR5cGVvZiBkb2N1bWVudCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRocm93RXJyb3IoJ21vdW50IG11c3QgYmUgcnVuIGluIGEgYnJvd3NlciBlbnZpcm9ubWVudCBsaWtlIFBoYW50b21KUywganNkb20gb3IgY2hyb21lJylcbiAgICB9XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgdGhyb3dFcnJvcignbW91bnQgbXVzdCBiZSBydW4gaW4gYSBicm93c2VyIGVudmlyb25tZW50IGxpa2UgUGhhbnRvbUpTLCBqc2RvbSBvciBjaHJvbWUnKVxuICB9XG5cbiAgdHJ5IHtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKVxuICAgIHJldHVybiB0cnVlXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzVnVlQ29tcG9uZW50IChjb21wb25lbnQ6IGFueSk6IGJvb2xlYW4ge1xuICBpZiAodHlwZW9mIGNvbXBvbmVudCA9PT0gJ2Z1bmN0aW9uJyAmJiBjb21wb25lbnQub3B0aW9ucykge1xuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICBpZiAoY29tcG9uZW50ID09PSBudWxsKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICBpZiAodHlwZW9mIGNvbXBvbmVudCAhPT0gJ29iamVjdCcpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIGlmIChjb21wb25lbnQuZXh0ZW5kcykge1xuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICBpZiAoY29tcG9uZW50Ll9DdG9yKSB7XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIHJldHVybiB0eXBlb2YgY29tcG9uZW50LnJlbmRlciA9PT0gJ2Z1bmN0aW9uJ1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29tcG9uZW50TmVlZHNDb21waWxpbmcgKGNvbXBvbmVudDogYW55KSB7XG4gIHJldHVybiBjb21wb25lbnQgJiZcbiAgICAhY29tcG9uZW50LnJlbmRlciAmJlxuICAgIChjb21wb25lbnQudGVtcGxhdGUgfHwgY29tcG9uZW50LmV4dGVuZHMpICYmXG4gICAgIWNvbXBvbmVudC5mdW5jdGlvbmFsXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1ZhbGlkU2VsZWN0b3IgKHNlbGVjdG9yOiBhbnkpOiBib29sZWFuIHtcbiAgaWYgKGlzRG9tU2VsZWN0b3Ioc2VsZWN0b3IpKSB7XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIGlmIChpc1Z1ZUNvbXBvbmVudChzZWxlY3RvcikpIHtcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgaWYgKGlzTmFtZVNlbGVjdG9yKHNlbGVjdG9yKSkge1xuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICByZXR1cm4gaXNSZWZTZWxlY3RvcihzZWxlY3Rvcilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUmVmU2VsZWN0b3IgKHJlZk9wdGlvbnNPYmplY3Q6IGFueSkge1xuICBpZiAodHlwZW9mIHJlZk9wdGlvbnNPYmplY3QgIT09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICBpZiAocmVmT3B0aW9uc09iamVjdCA9PT0gbnVsbCkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgY29uc3QgdmFsaWRGaW5kS2V5cyA9IFsncmVmJ11cbiAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKHJlZk9wdGlvbnNPYmplY3QpXG4gIGlmICgha2V5cy5sZW5ndGgpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIGNvbnN0IGlzVmFsaWQgPSBPYmplY3Qua2V5cyhyZWZPcHRpb25zT2JqZWN0KS5ldmVyeSgoa2V5KSA9PiB7XG4gICAgcmV0dXJuIHZhbGlkRmluZEtleXMuaW5jbHVkZXMoa2V5KSAmJlxuICAgICAgdHlwZW9mIHJlZk9wdGlvbnNPYmplY3Rba2V5XSA9PT0gJ3N0cmluZydcbiAgfSlcblxuICByZXR1cm4gaXNWYWxpZFxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNOYW1lU2VsZWN0b3IgKG5hbWVPcHRpb25zT2JqZWN0OiBhbnkpOiBib29sZWFuIHtcbiAgaWYgKHR5cGVvZiBuYW1lT3B0aW9uc09iamVjdCAhPT0gJ29iamVjdCcpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIGlmIChuYW1lT3B0aW9uc09iamVjdCA9PT0gbnVsbCkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgcmV0dXJuICEhbmFtZU9wdGlvbnNPYmplY3QubmFtZVxufVxuIiwiLy8gQGZsb3dcblxuaW1wb3J0IHsgY29tcGlsZVRvRnVuY3Rpb25zIH0gZnJvbSAndnVlLXRlbXBsYXRlLWNvbXBpbGVyJ1xuXG5leHBvcnQgZnVuY3Rpb24gY29tcGlsZVRlbXBsYXRlIChjb21wb25lbnQ6IENvbXBvbmVudCkge1xuICBpZiAoY29tcG9uZW50LmNvbXBvbmVudHMpIHtcbiAgICBPYmplY3Qua2V5cyhjb21wb25lbnQuY29tcG9uZW50cykuZm9yRWFjaCgoYykgPT4ge1xuICAgICAgY29uc3QgY21wID0gY29tcG9uZW50LmNvbXBvbmVudHNbY11cbiAgICAgIGlmICghY21wLnJlbmRlcikge1xuICAgICAgICBjb21waWxlVGVtcGxhdGUoY21wKVxuICAgICAgfVxuICAgIH0pXG4gIH1cbiAgaWYgKGNvbXBvbmVudC5leHRlbmRzKSB7XG4gICAgY29tcGlsZVRlbXBsYXRlKGNvbXBvbmVudC5leHRlbmRzKVxuICB9XG4gIGlmIChjb21wb25lbnQudGVtcGxhdGUpIHtcbiAgICBPYmplY3QuYXNzaWduKGNvbXBvbmVudCwgY29tcGlsZVRvRnVuY3Rpb25zKGNvbXBvbmVudC50ZW1wbGF0ZSkpXG4gIH1cbn1cbiIsIi8vIEBmbG93XG5cbmltcG9ydCBWdWUgZnJvbSAndnVlJ1xuaW1wb3J0IHsgY29tcGlsZVRvRnVuY3Rpb25zIH0gZnJvbSAndnVlLXRlbXBsYXRlLWNvbXBpbGVyJ1xuaW1wb3J0IHsgdGhyb3dFcnJvciB9IGZyb20gJy4vdXRpbCdcbmltcG9ydCB7IGNvbXBvbmVudE5lZWRzQ29tcGlsaW5nIH0gZnJvbSAnLi92YWxpZGF0b3JzJ1xuaW1wb3J0IHsgY29tcGlsZVRlbXBsYXRlIH0gZnJvbSAnLi9jb21waWxlLXRlbXBsYXRlJ1xuXG5mdW5jdGlvbiBpc1Z1ZUNvbXBvbmVudCAoY29tcCkge1xuICByZXR1cm4gY29tcCAmJiAoY29tcC5yZW5kZXIgfHwgY29tcC50ZW1wbGF0ZSB8fCBjb21wLm9wdGlvbnMpXG59XG5cbmZ1bmN0aW9uIGlzVmFsaWRTdHViIChzdHViOiBhbnkpIHtcbiAgcmV0dXJuICEhc3R1YiAmJlxuICAgICAgdHlwZW9mIHN0dWIgPT09ICdzdHJpbmcnIHx8XG4gICAgICAoc3R1YiA9PT0gdHJ1ZSkgfHxcbiAgICAgIChpc1Z1ZUNvbXBvbmVudChzdHViKSlcbn1cblxuZnVuY3Rpb24gaXNSZXF1aXJlZENvbXBvbmVudCAobmFtZSkge1xuICByZXR1cm4gbmFtZSA9PT0gJ0tlZXBBbGl2ZScgfHwgbmFtZSA9PT0gJ1RyYW5zaXRpb24nIHx8IG5hbWUgPT09ICdUcmFuc2l0aW9uR3JvdXAnXG59XG5cbmZ1bmN0aW9uIGdldENvcmVQcm9wZXJ0aWVzIChjb21wb25lbnQ6IENvbXBvbmVudCk6IE9iamVjdCB7XG4gIHJldHVybiB7XG4gICAgYXR0cnM6IGNvbXBvbmVudC5hdHRycyxcbiAgICBuYW1lOiBjb21wb25lbnQubmFtZSxcbiAgICBvbjogY29tcG9uZW50Lm9uLFxuICAgIGtleTogY29tcG9uZW50LmtleSxcbiAgICByZWY6IGNvbXBvbmVudC5yZWYsXG4gICAgcHJvcHM6IGNvbXBvbmVudC5wcm9wcyxcbiAgICBkb21Qcm9wczogY29tcG9uZW50LmRvbVByb3BzLFxuICAgIGNsYXNzOiBjb21wb25lbnQuY2xhc3MsXG4gICAgc3RhdGljQ2xhc3M6IGNvbXBvbmVudC5zdGF0aWNDbGFzcyxcbiAgICBzdGF0aWNTdHlsZTogY29tcG9uZW50LnN0YXRpY1N0eWxlLFxuICAgIHN0eWxlOiBjb21wb25lbnQuc3R5bGUsXG4gICAgbm9ybWFsaXplZFN0eWxlOiBjb21wb25lbnQubm9ybWFsaXplZFN0eWxlLFxuICAgIG5hdGl2ZU9uOiBjb21wb25lbnQubmF0aXZlT24sXG4gICAgZnVuY3Rpb25hbDogY29tcG9uZW50LmZ1bmN0aW9uYWxcbiAgfVxufVxuZnVuY3Rpb24gY3JlYXRlU3R1YkZyb21TdHJpbmcgKHRlbXBsYXRlU3RyaW5nOiBzdHJpbmcsIG9yaWdpbmFsQ29tcG9uZW50OiBDb21wb25lbnQpOiBPYmplY3Qge1xuICBpZiAoIWNvbXBpbGVUb0Z1bmN0aW9ucykge1xuICAgIHRocm93RXJyb3IoJ3Z1ZVRlbXBsYXRlQ29tcGlsZXIgaXMgdW5kZWZpbmVkLCB5b3UgbXVzdCBwYXNzIGNvbXBvbmVudHMgZXhwbGljaXRseSBpZiB2dWUtdGVtcGxhdGUtY29tcGlsZXIgaXMgdW5kZWZpbmVkJylcbiAgfVxuICByZXR1cm4ge1xuICAgIC4uLmdldENvcmVQcm9wZXJ0aWVzKG9yaWdpbmFsQ29tcG9uZW50KSxcbiAgICAuLi5jb21waWxlVG9GdW5jdGlvbnModGVtcGxhdGVTdHJpbmcpXG4gIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlQmxhbmtTdHViIChvcmlnaW5hbENvbXBvbmVudDogQ29tcG9uZW50KSB7XG4gIHJldHVybiB7XG4gICAgLi4uZ2V0Q29yZVByb3BlcnRpZXMob3JpZ2luYWxDb21wb25lbnQpLFxuICAgIHJlbmRlcjogaCA9PiBoKCcnKVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVDb21wb25lbnRTdHVicyAob3JpZ2luYWxDb21wb25lbnRzOiBPYmplY3QgPSB7fSwgc3R1YnM6IE9iamVjdCk6IE9iamVjdCB7XG4gIGNvbnN0IGNvbXBvbmVudHMgPSB7fVxuICBpZiAoIXN0dWJzKSB7XG4gICAgcmV0dXJuIGNvbXBvbmVudHNcbiAgfVxuICBpZiAoQXJyYXkuaXNBcnJheShzdHVicykpIHtcbiAgICBzdHVicy5mb3JFYWNoKHN0dWIgPT4ge1xuICAgICAgaWYgKHN0dWIgPT09IGZhbHNlKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIHN0dWIgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRocm93RXJyb3IoJ2VhY2ggaXRlbSBpbiBhbiBvcHRpb25zLnN0dWJzIGFycmF5IG11c3QgYmUgYSBzdHJpbmcnKVxuICAgICAgfVxuICAgICAgY29tcG9uZW50c1tzdHViXSA9IGNyZWF0ZUJsYW5rU3R1Yih7fSlcbiAgICB9KVxuICB9IGVsc2Uge1xuICAgIE9iamVjdC5rZXlzKHN0dWJzKS5mb3JFYWNoKHN0dWIgPT4ge1xuICAgICAgaWYgKHN0dWJzW3N0dWJdID09PSBmYWxzZSkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGlmICghaXNWYWxpZFN0dWIoc3R1YnNbc3R1Yl0pKSB7XG4gICAgICAgIHRocm93RXJyb3IoJ29wdGlvbnMuc3R1YiB2YWx1ZXMgbXVzdCBiZSBwYXNzZWQgYSBzdHJpbmcgb3IgY29tcG9uZW50JylcbiAgICAgIH1cbiAgICAgIGlmIChzdHVic1tzdHViXSA9PT0gdHJ1ZSkge1xuICAgICAgICBjb21wb25lbnRzW3N0dWJdID0gY3JlYXRlQmxhbmtTdHViKHt9KVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgaWYgKGNvbXBvbmVudE5lZWRzQ29tcGlsaW5nKHN0dWJzW3N0dWJdKSkge1xuICAgICAgICBjb21waWxlVGVtcGxhdGUoc3R1YnNbc3R1Yl0pXG4gICAgICB9XG5cbiAgICAgIGlmIChvcmlnaW5hbENvbXBvbmVudHNbc3R1Yl0pIHtcbiAgICAgICAgLy8gUmVtb3ZlIGNhY2hlZCBjb25zdHJ1Y3RvclxuICAgICAgICBkZWxldGUgb3JpZ2luYWxDb21wb25lbnRzW3N0dWJdLl9DdG9yXG4gICAgICAgIGlmICh0eXBlb2Ygc3R1YnNbc3R1Yl0gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgY29tcG9uZW50c1tzdHViXSA9IGNyZWF0ZVN0dWJGcm9tU3RyaW5nKHN0dWJzW3N0dWJdLCBvcmlnaW5hbENvbXBvbmVudHNbc3R1Yl0pXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29tcG9uZW50c1tzdHViXSA9IHtcbiAgICAgICAgICAgIC4uLnN0dWJzW3N0dWJdLFxuICAgICAgICAgICAgbmFtZTogb3JpZ2luYWxDb21wb25lbnRzW3N0dWJdLm5hbWVcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc3R1YnNbc3R1Yl0gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgaWYgKCFjb21waWxlVG9GdW5jdGlvbnMpIHtcbiAgICAgICAgICAgIHRocm93RXJyb3IoJ3Z1ZVRlbXBsYXRlQ29tcGlsZXIgaXMgdW5kZWZpbmVkLCB5b3UgbXVzdCBwYXNzIGNvbXBvbmVudHMgZXhwbGljaXRseSBpZiB2dWUtdGVtcGxhdGUtY29tcGlsZXIgaXMgdW5kZWZpbmVkJylcbiAgICAgICAgICB9XG4gICAgICAgICAgY29tcG9uZW50c1tzdHViXSA9IHtcbiAgICAgICAgICAgIC4uLmNvbXBpbGVUb0Z1bmN0aW9ucyhzdHVic1tzdHViXSlcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29tcG9uZW50c1tzdHViXSA9IHtcbiAgICAgICAgICAgIC4uLnN0dWJzW3N0dWJdXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBpZ25vcmVFbGVtZW50cyBkb2VzIG5vdCBleGlzdCBpbiBWdWUgMi4wLnhcbiAgICAgIGlmIChWdWUuY29uZmlnLmlnbm9yZWRFbGVtZW50cykge1xuICAgICAgICBWdWUuY29uZmlnLmlnbm9yZWRFbGVtZW50cy5wdXNoKHN0dWIpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuICByZXR1cm4gY29tcG9uZW50c1xufVxuXG5mdW5jdGlvbiBzdHViQ29tcG9uZW50cyAoY29tcG9uZW50czogT2JqZWN0LCBzdHViYmVkQ29tcG9uZW50czogT2JqZWN0KSB7XG4gIE9iamVjdC5rZXlzKGNvbXBvbmVudHMpLmZvckVhY2goY29tcG9uZW50ID0+IHtcbiAgICAvLyBSZW1vdmUgY2FjaGVkIGNvbnN0cnVjdG9yXG4gICAgZGVsZXRlIGNvbXBvbmVudHNbY29tcG9uZW50XS5fQ3RvclxuICAgIGNvbnNvbGUubG9nKGNvbXBvbmVudHNbY29tcG9uZW50XS5uYW1lKVxuICAgIGlmICghY29tcG9uZW50c1tjb21wb25lbnRdLm5hbWUpIHtcbiAgICAgIGNvbXBvbmVudHNbY29tcG9uZW50XS5uYW1lID0gY29tcG9uZW50XG4gICAgfVxuICAgIHN0dWJiZWRDb21wb25lbnRzW2NvbXBvbmVudF0gPSBjcmVhdGVCbGFua1N0dWIoY29tcG9uZW50c1tjb21wb25lbnRdKVxuXG4gICAgLy8gaWdub3JlRWxlbWVudHMgZG9lcyBub3QgZXhpc3QgaW4gVnVlIDIuMC54XG4gICAgaWYgKFZ1ZS5jb25maWcuaWdub3JlZEVsZW1lbnRzKSB7XG4gICAgICBWdWUuY29uZmlnLmlnbm9yZWRFbGVtZW50cy5wdXNoKGNvbXBvbmVudClcbiAgICB9XG4gIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVDb21wb25lbnRTdHVic0ZvckFsbCAoY29tcG9uZW50OiBDb21wb25lbnQpOiBPYmplY3Qge1xuICBjb25zdCBzdHViYmVkQ29tcG9uZW50cyA9IHt9XG5cbiAgaWYgKGNvbXBvbmVudC5jb21wb25lbnRzKSB7XG4gICAgc3R1YkNvbXBvbmVudHMoY29tcG9uZW50LmNvbXBvbmVudHMsIHN0dWJiZWRDb21wb25lbnRzKVxuICB9XG5cbiAgbGV0IGV4dGVuZGVkID0gY29tcG9uZW50LmV4dGVuZHNcblxuICAvLyBMb29wIHRocm91Z2ggZXh0ZW5kZWQgY29tcG9uZW50IGNoYWlucyB0byBzdHViIGFsbCBjaGlsZCBjb21wb25lbnRzXG4gIHdoaWxlIChleHRlbmRlZCkge1xuICAgIGlmIChleHRlbmRlZC5jb21wb25lbnRzKSB7XG4gICAgICBzdHViQ29tcG9uZW50cyhleHRlbmRlZC5jb21wb25lbnRzLCBzdHViYmVkQ29tcG9uZW50cylcbiAgICB9XG4gICAgZXh0ZW5kZWQgPSBleHRlbmRlZC5leHRlbmRzXG4gIH1cblxuICBpZiAoY29tcG9uZW50LmV4dGVuZE9wdGlvbnMgJiYgY29tcG9uZW50LmV4dGVuZE9wdGlvbnMuY29tcG9uZW50cykge1xuICAgIHN0dWJDb21wb25lbnRzKGNvbXBvbmVudC5leHRlbmRPcHRpb25zLmNvbXBvbmVudHMsIHN0dWJiZWRDb21wb25lbnRzKVxuICB9XG5cbiAgcmV0dXJuIHN0dWJiZWRDb21wb25lbnRzXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVDb21wb25lbnRTdHVic0Zvckdsb2JhbHMgKGluc3RhbmNlOiBDb21wb25lbnQpOiBPYmplY3Qge1xuICBjb25zdCBjb21wb25lbnRzID0ge31cbiAgT2JqZWN0LmtleXMoaW5zdGFuY2Uub3B0aW9ucy5jb21wb25lbnRzKS5mb3JFYWNoKChjKSA9PiB7XG4gICAgaWYgKGlzUmVxdWlyZWRDb21wb25lbnQoYykpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbXBvbmVudHNbY10gPSBjcmVhdGVCbGFua1N0dWIoaW5zdGFuY2Uub3B0aW9ucy5jb21wb25lbnRzW2NdKVxuICAgIGRlbGV0ZSBpbnN0YW5jZS5vcHRpb25zLmNvbXBvbmVudHNbY10uX0N0b3IgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1wYXJhbS1yZWFzc2lnblxuICAgIGRlbGV0ZSBjb21wb25lbnRzW2NdLl9DdG9yIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tcGFyYW0tcmVhc3NpZ25cbiAgfSlcbiAgcmV0dXJuIGNvbXBvbmVudHNcbn1cbiIsImltcG9ydCBWdWUgZnJvbSAndnVlJ1xuXG5leHBvcnQgY29uc3QgTkFNRV9TRUxFQ1RPUiA9ICdOQU1FX1NFTEVDVE9SJ1xuZXhwb3J0IGNvbnN0IENPTVBPTkVOVF9TRUxFQ1RPUiA9ICdDT01QT05FTlRfU0VMRUNUT1InXG5leHBvcnQgY29uc3QgUkVGX1NFTEVDVE9SID0gJ1JFRl9TRUxFQ1RPUidcbmV4cG9ydCBjb25zdCBET01fU0VMRUNUT1IgPSAnRE9NX1NFTEVDVE9SJ1xuZXhwb3J0IGNvbnN0IFZVRV9WRVJTSU9OID0gTnVtYmVyKGAke1Z1ZS52ZXJzaW9uLnNwbGl0KCcuJylbMF19LiR7VnVlLnZlcnNpb24uc3BsaXQoJy4nKVsxXX1gKVxuZXhwb3J0IGNvbnN0IEZVTkNUSU9OQUxfT1BUSU9OUyA9IFZVRV9WRVJTSU9OID49IDIuNSA/ICdmbk9wdGlvbnMnIDogJ2Z1bmN0aW9uYWxPcHRpb25zJ1xuIiwiLy8gQGZsb3dcblxuaW1wb3J0IHtcbiAgaXNEb21TZWxlY3RvcixcbiAgaXNOYW1lU2VsZWN0b3IsXG4gIGlzUmVmU2VsZWN0b3IsXG4gIGlzVnVlQ29tcG9uZW50XG59IGZyb20gJy4vdmFsaWRhdG9ycy5qcydcbmltcG9ydCB7IHRocm93RXJyb3IgfSBmcm9tICcuLi9saWIvdXRpbCdcbmltcG9ydCB7XG4gIFJFRl9TRUxFQ1RPUixcbiAgQ09NUE9ORU5UX1NFTEVDVE9SLFxuICBOQU1FX1NFTEVDVE9SLFxuICBET01fU0VMRUNUT1Jcbn0gZnJvbSAnLi9jb25zdHMnXG5cbmZ1bmN0aW9uIGdldFNlbGVjdG9yVHlwZSAoc2VsZWN0b3I6IFNlbGVjdG9yKTogc3RyaW5nIHwgdm9pZCB7XG4gIGlmIChpc0RvbVNlbGVjdG9yKHNlbGVjdG9yKSkge1xuICAgIHJldHVybiBET01fU0VMRUNUT1JcbiAgfVxuXG4gIGlmIChpc05hbWVTZWxlY3RvcihzZWxlY3RvcikpIHtcbiAgICByZXR1cm4gTkFNRV9TRUxFQ1RPUlxuICB9XG5cbiAgaWYgKGlzVnVlQ29tcG9uZW50KHNlbGVjdG9yKSkge1xuICAgIHJldHVybiBDT01QT05FTlRfU0VMRUNUT1JcbiAgfVxuXG4gIGlmIChpc1JlZlNlbGVjdG9yKHNlbGVjdG9yKSkge1xuICAgIHJldHVybiBSRUZfU0VMRUNUT1JcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBnZXRTZWxlY3RvclR5cGVPclRocm93IChzZWxlY3RvcjogU2VsZWN0b3IsIG1ldGhvZE5hbWU6IHN0cmluZyk6IHN0cmluZyB8IHZvaWQge1xuICBjb25zdCBzZWxlY3RvclR5cGUgPSBnZXRTZWxlY3RvclR5cGUoc2VsZWN0b3IpXG4gIGlmICghc2VsZWN0b3JUeXBlKSB7XG4gICAgdGhyb3dFcnJvcihgd3JhcHBlci4ke21ldGhvZE5hbWV9KCkgbXVzdCBiZSBwYXNzZWQgYSB2YWxpZCBDU1Mgc2VsZWN0b3IsIFZ1ZSBjb25zdHJ1Y3Rvciwgb3IgdmFsaWQgZmluZCBvcHRpb24gb2JqZWN0YClcbiAgfVxuICByZXR1cm4gc2VsZWN0b3JUeXBlXG59XG4iLCIvLyBAZmxvd1xuaW1wb3J0IHtcbiAgQ09NUE9ORU5UX1NFTEVDVE9SLFxuICBGVU5DVElPTkFMX09QVElPTlMsXG4gIFZVRV9WRVJTSU9OXG59IGZyb20gJy4vY29uc3RzJ1xuaW1wb3J0IHtcbiAgICB0aHJvd0Vycm9yXG59IGZyb20gJy4vdXRpbCdcblxuZnVuY3Rpb24gZmluZEFsbFZ1ZUNvbXBvbmVudHNGcm9tVm0gKFxuICB2bTogQ29tcG9uZW50LFxuICBjb21wb25lbnRzOiBBcnJheTxDb21wb25lbnQ+ID0gW11cbik6IEFycmF5PENvbXBvbmVudD4ge1xuICBjb21wb25lbnRzLnB1c2godm0pXG4gIHZtLiRjaGlsZHJlbi5mb3JFYWNoKChjaGlsZCkgPT4ge1xuICAgIGZpbmRBbGxWdWVDb21wb25lbnRzRnJvbVZtKGNoaWxkLCBjb21wb25lbnRzKVxuICB9KVxuXG4gIHJldHVybiBjb21wb25lbnRzXG59XG5cbmZ1bmN0aW9uIGZpbmRBbGxWdWVDb21wb25lbnRzRnJvbVZub2RlIChcbiAgdm5vZGU6IENvbXBvbmVudCxcbiAgY29tcG9uZW50czogQXJyYXk8Q29tcG9uZW50PiA9IFtdXG4pOiBBcnJheTxDb21wb25lbnQ+IHtcbiAgaWYgKHZub2RlLmNoaWxkKSB7XG4gICAgY29tcG9uZW50cy5wdXNoKHZub2RlLmNoaWxkKVxuICB9XG4gIGlmICh2bm9kZS5jaGlsZHJlbikge1xuICAgIHZub2RlLmNoaWxkcmVuLmZvckVhY2goKGNoaWxkKSA9PiB7XG4gICAgICBmaW5kQWxsVnVlQ29tcG9uZW50c0Zyb21Wbm9kZShjaGlsZCwgY29tcG9uZW50cylcbiAgICB9KVxuICB9XG5cbiAgcmV0dXJuIGNvbXBvbmVudHNcbn1cblxuZnVuY3Rpb24gZmluZEFsbEZ1bmN0aW9uYWxDb21wb25lbnRzRnJvbVZub2RlIChcbiAgdm5vZGU6IENvbXBvbmVudCxcbiAgY29tcG9uZW50czogQXJyYXk8Q29tcG9uZW50PiA9IFtdXG4pOiBBcnJheTxDb21wb25lbnQ+IHtcbiAgaWYgKHZub2RlW0ZVTkNUSU9OQUxfT1BUSU9OU10gfHwgdm5vZGUuZnVuY3Rpb25hbENvbnRleHQpIHtcbiAgICBjb21wb25lbnRzLnB1c2godm5vZGUpXG4gIH1cbiAgaWYgKHZub2RlLmNoaWxkcmVuKSB7XG4gICAgdm5vZGUuY2hpbGRyZW4uZm9yRWFjaCgoY2hpbGQpID0+IHtcbiAgICAgIGZpbmRBbGxGdW5jdGlvbmFsQ29tcG9uZW50c0Zyb21Wbm9kZShjaGlsZCwgY29tcG9uZW50cylcbiAgICB9KVxuICB9XG4gIHJldHVybiBjb21wb25lbnRzXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2bUN0b3JNYXRjaGVzTmFtZSAodm06IENvbXBvbmVudCwgbmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiAodm0uJHZub2RlICYmIHZtLiR2bm9kZS5jb21wb25lbnRPcHRpb25zICYmXG4gICAgdm0uJHZub2RlLmNvbXBvbmVudE9wdGlvbnMuQ3Rvci5vcHRpb25zLm5hbWUgPT09IG5hbWUpIHx8XG4gICAgKHZtLl92bm9kZSAmJiB2bS5fdm5vZGUuZnVuY3Rpb25hbE9wdGlvbnMgJiZcbiAgICAgIHZtLl92bm9kZS5mdW5jdGlvbmFsT3B0aW9ucy5uYW1lID09PSBuYW1lKSB8fFxuICAgICAgICB2bS4kb3B0aW9ucyAmJiB2bS4kb3B0aW9ucy5uYW1lID09PSBuYW1lXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2bUN0b3JNYXRjaGVzU2VsZWN0b3IgKGNvbXBvbmVudDogQ29tcG9uZW50LCBzZWxlY3RvcjogT2JqZWN0KSB7XG4gIGNvbnN0IEN0b3IgPSBzZWxlY3Rvci5fQ3RvciB8fCBzZWxlY3Rvci5vcHRpb25zICYmIHNlbGVjdG9yLm9wdGlvbnMuX0N0b3JcbiAgY29uc3QgQ3RvcnMgPSBPYmplY3Qua2V5cyhDdG9yKVxuICByZXR1cm4gQ3RvcnMuc29tZShjID0+IEN0b3JbY10gPT09IGNvbXBvbmVudC5fX3Byb3RvX18uY29uc3RydWN0b3IpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB2bUZ1bmN0aW9uYWxDdG9yTWF0Y2hlc1NlbGVjdG9yIChjb21wb25lbnQ6IFZOb2RlLCBDdG9yOiBPYmplY3QpIHtcbiAgaWYgKFZVRV9WRVJTSU9OIDwgMi4zKSB7XG4gICAgdGhyb3dFcnJvcignZmluZCBmb3IgZnVuY3Rpb25hbCBjb21wb25lbnRzIGlzIG5vdCBzdXBwb3J0IGluIFZ1ZSA8IDIuMycpXG4gIH1cblxuICBpZiAoIUN0b3IpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIGlmICghY29tcG9uZW50W0ZVTkNUSU9OQUxfT1BUSU9OU10pIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuICBjb25zdCBDdG9ycyA9IE9iamVjdC5rZXlzKGNvbXBvbmVudFtGVU5DVElPTkFMX09QVElPTlNdLl9DdG9yKVxuICByZXR1cm4gQ3RvcnMuc29tZShjID0+IEN0b3JbY10gPT09IGNvbXBvbmVudFtGVU5DVElPTkFMX09QVElPTlNdLl9DdG9yW2NdKVxufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBmaW5kVnVlQ29tcG9uZW50cyAoXG4gIHJvb3Q6IENvbXBvbmVudCxcbiAgc2VsZWN0b3JUeXBlOiA/c3RyaW5nLFxuICBzZWxlY3RvcjogT2JqZWN0XG4pOiBBcnJheTxDb21wb25lbnQ+IHtcbiAgaWYgKHNlbGVjdG9yLmZ1bmN0aW9uYWwpIHtcbiAgICBjb25zdCBub2RlcyA9IHJvb3QuX3Zub2RlXG4gICAgPyBmaW5kQWxsRnVuY3Rpb25hbENvbXBvbmVudHNGcm9tVm5vZGUocm9vdC5fdm5vZGUpXG4gICAgOiBmaW5kQWxsRnVuY3Rpb25hbENvbXBvbmVudHNGcm9tVm5vZGUocm9vdClcbiAgICByZXR1cm4gbm9kZXMuZmlsdGVyKG5vZGUgPT5cbiAgICAgIHZtRnVuY3Rpb25hbEN0b3JNYXRjaGVzU2VsZWN0b3Iobm9kZSwgc2VsZWN0b3IuX0N0b3IpIHx8XG4gICAgICBub2RlW0ZVTkNUSU9OQUxfT1BUSU9OU10ubmFtZSA9PT0gc2VsZWN0b3IubmFtZVxuICAgIClcbiAgfVxuICBjb25zdCBjb21wb25lbnRzID0gcm9vdC5faXNWdWVcbiAgICA/IGZpbmRBbGxWdWVDb21wb25lbnRzRnJvbVZtKHJvb3QpXG4gICAgOiBmaW5kQWxsVnVlQ29tcG9uZW50c0Zyb21Wbm9kZShyb290KVxuICByZXR1cm4gY29tcG9uZW50cy5maWx0ZXIoKGNvbXBvbmVudCkgPT4ge1xuICAgIGlmICghY29tcG9uZW50LiR2bm9kZSAmJiAhY29tcG9uZW50LiRvcHRpb25zLmV4dGVuZHMpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgICByZXR1cm4gc2VsZWN0b3JUeXBlID09PSBDT01QT05FTlRfU0VMRUNUT1JcbiAgICAgID8gdm1DdG9yTWF0Y2hlc1NlbGVjdG9yKGNvbXBvbmVudCwgc2VsZWN0b3IpXG4gICAgICA6IHZtQ3Rvck1hdGNoZXNOYW1lKGNvbXBvbmVudCwgc2VsZWN0b3IubmFtZSlcbiAgfSlcbn1cbiIsIi8vIEBmbG93XG5cbmltcG9ydCB0eXBlIFdyYXBwZXIgZnJvbSAnLi93cmFwcGVyJ1xuaW1wb3J0IHR5cGUgVnVlV3JhcHBlciBmcm9tICcuL3Z1ZS13cmFwcGVyJ1xuaW1wb3J0IHsgdGhyb3dFcnJvciB9IGZyb20gJy4uL2xpYi91dGlsJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBXcmFwcGVyQXJyYXkgaW1wbGVtZW50cyBCYXNlV3JhcHBlciB7XG4gIHdyYXBwZXJzOiBBcnJheTxXcmFwcGVyIHwgVnVlV3JhcHBlcj47XG4gIGxlbmd0aDogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yICh3cmFwcGVyczogQXJyYXk8V3JhcHBlciB8IFZ1ZVdyYXBwZXI+KSB7XG4gICAgdGhpcy53cmFwcGVycyA9IHdyYXBwZXJzIHx8IFtdXG4gICAgdGhpcy5sZW5ndGggPSB0aGlzLndyYXBwZXJzLmxlbmd0aFxuICB9XG5cbiAgYXQgKGluZGV4OiBudW1iZXIpOiBXcmFwcGVyIHwgVnVlV3JhcHBlciB7XG4gICAgaWYgKGluZGV4ID4gdGhpcy5sZW5ndGggLSAxKSB7XG4gICAgICB0aHJvd0Vycm9yKGBubyBpdGVtIGV4aXN0cyBhdCAke2luZGV4fWApXG4gICAgfVxuICAgIHJldHVybiB0aGlzLndyYXBwZXJzW2luZGV4XVxuICB9XG5cbiAgYXR0cmlidXRlcyAoKTogdm9pZCB7XG4gICAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ2F0dHJpYnV0ZXMnKVxuXG4gICAgdGhyb3dFcnJvcignYXR0cmlidXRlcyBtdXN0IGJlIGNhbGxlZCBvbiBhIHNpbmdsZSB3cmFwcGVyLCB1c2UgYXQoaSkgdG8gYWNjZXNzIGEgd3JhcHBlcicpXG4gIH1cblxuICBjbGFzc2VzICgpOiB2b2lkIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgnY2xhc3NlcycpXG5cbiAgICB0aHJvd0Vycm9yKCdjbGFzc2VzIG11c3QgYmUgY2FsbGVkIG9uIGEgc2luZ2xlIHdyYXBwZXIsIHVzZSBhdChpKSB0byBhY2Nlc3MgYSB3cmFwcGVyJylcbiAgfVxuXG4gIGNvbnRhaW5zIChzZWxlY3RvcjogU2VsZWN0b3IpOiBib29sZWFuIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgnY29udGFpbnMnKVxuXG4gICAgcmV0dXJuIHRoaXMud3JhcHBlcnMuZXZlcnkod3JhcHBlciA9PiB3cmFwcGVyLmNvbnRhaW5zKHNlbGVjdG9yKSlcbiAgfVxuXG4gIGV4aXN0cyAoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMubGVuZ3RoID4gMCAmJiB0aGlzLndyYXBwZXJzLmV2ZXJ5KHdyYXBwZXIgPT4gd3JhcHBlci5leGlzdHMoKSlcbiAgfVxuXG4gIGZpbHRlciAocHJlZGljYXRlOiBGdW5jdGlvbik6IFdyYXBwZXJBcnJheSB7XG4gICAgcmV0dXJuIG5ldyBXcmFwcGVyQXJyYXkodGhpcy53cmFwcGVycy5maWx0ZXIocHJlZGljYXRlKSlcbiAgfVxuXG4gIHZpc2libGUgKCk6IGJvb2xlYW4ge1xuICAgIHRoaXMudGhyb3dFcnJvcklmV3JhcHBlcnNJc0VtcHR5KCd2aXNpYmxlJylcblxuICAgIHJldHVybiB0aGlzLmxlbmd0aCA+IDAgJiYgdGhpcy53cmFwcGVycy5ldmVyeSh3cmFwcGVyID0+IHdyYXBwZXIudmlzaWJsZSgpKVxuICB9XG5cbiAgZW1pdHRlZCAoKTogdm9pZCB7XG4gICAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ2VtaXR0ZWQnKVxuXG4gICAgdGhyb3dFcnJvcignZW1pdHRlZCBtdXN0IGJlIGNhbGxlZCBvbiBhIHNpbmdsZSB3cmFwcGVyLCB1c2UgYXQoaSkgdG8gYWNjZXNzIGEgd3JhcHBlcicpXG4gIH1cblxuICBlbWl0dGVkQnlPcmRlciAoKTogdm9pZCB7XG4gICAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ2VtaXR0ZWRCeU9yZGVyJylcblxuICAgIHRocm93RXJyb3IoJ2VtaXR0ZWRCeU9yZGVyIG11c3QgYmUgY2FsbGVkIG9uIGEgc2luZ2xlIHdyYXBwZXIsIHVzZSBhdChpKSB0byBhY2Nlc3MgYSB3cmFwcGVyJylcbiAgfVxuXG4gIGhhc0F0dHJpYnV0ZSAoYXR0cmlidXRlOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgnaGFzQXR0cmlidXRlJylcblxuICAgIHJldHVybiB0aGlzLndyYXBwZXJzLmV2ZXJ5KHdyYXBwZXIgPT4gd3JhcHBlci5oYXNBdHRyaWJ1dGUoYXR0cmlidXRlLCB2YWx1ZSkpXG4gIH1cblxuICBoYXNDbGFzcyAoY2xhc3NOYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgnaGFzQ2xhc3MnKVxuXG4gICAgcmV0dXJuIHRoaXMud3JhcHBlcnMuZXZlcnkod3JhcHBlciA9PiB3cmFwcGVyLmhhc0NsYXNzKGNsYXNzTmFtZSkpXG4gIH1cblxuICBoYXNQcm9wIChwcm9wOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgnaGFzUHJvcCcpXG5cbiAgICByZXR1cm4gdGhpcy53cmFwcGVycy5ldmVyeSh3cmFwcGVyID0+IHdyYXBwZXIuaGFzUHJvcChwcm9wLCB2YWx1ZSkpXG4gIH1cblxuICBoYXNTdHlsZSAoc3R5bGU6IHN0cmluZywgdmFsdWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHRoaXMudGhyb3dFcnJvcklmV3JhcHBlcnNJc0VtcHR5KCdoYXNTdHlsZScpXG5cbiAgICByZXR1cm4gdGhpcy53cmFwcGVycy5ldmVyeSh3cmFwcGVyID0+IHdyYXBwZXIuaGFzU3R5bGUoc3R5bGUsIHZhbHVlKSlcbiAgfVxuXG4gIGZpbmRBbGwgKCk6IHZvaWQge1xuICAgIHRoaXMudGhyb3dFcnJvcklmV3JhcHBlcnNJc0VtcHR5KCdmaW5kQWxsJylcblxuICAgIHRocm93RXJyb3IoJ2ZpbmRBbGwgbXVzdCBiZSBjYWxsZWQgb24gYSBzaW5nbGUgd3JhcHBlciwgdXNlIGF0KGkpIHRvIGFjY2VzcyBhIHdyYXBwZXInKVxuICB9XG5cbiAgZmluZCAoKTogdm9pZCB7XG4gICAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ2ZpbmQnKVxuXG4gICAgdGhyb3dFcnJvcignZmluZCBtdXN0IGJlIGNhbGxlZCBvbiBhIHNpbmdsZSB3cmFwcGVyLCB1c2UgYXQoaSkgdG8gYWNjZXNzIGEgd3JhcHBlcicpXG4gIH1cblxuICBodG1sICgpOiB2b2lkIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgnaHRtbCcpXG5cbiAgICB0aHJvd0Vycm9yKCdodG1sIG11c3QgYmUgY2FsbGVkIG9uIGEgc2luZ2xlIHdyYXBwZXIsIHVzZSBhdChpKSB0byBhY2Nlc3MgYSB3cmFwcGVyJylcbiAgfVxuXG4gIGlzIChzZWxlY3RvcjogU2VsZWN0b3IpOiBib29sZWFuIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgnaXMnKVxuXG4gICAgcmV0dXJuIHRoaXMud3JhcHBlcnMuZXZlcnkod3JhcHBlciA9PiB3cmFwcGVyLmlzKHNlbGVjdG9yKSlcbiAgfVxuXG4gIGlzRW1wdHkgKCk6IGJvb2xlYW4ge1xuICAgIHRoaXMudGhyb3dFcnJvcklmV3JhcHBlcnNJc0VtcHR5KCdpc0VtcHR5JylcblxuICAgIHJldHVybiB0aGlzLndyYXBwZXJzLmV2ZXJ5KHdyYXBwZXIgPT4gd3JhcHBlci5pc0VtcHR5KCkpXG4gIH1cblxuICBpc1Z1ZUluc3RhbmNlICgpOiBib29sZWFuIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgnaXNWdWVJbnN0YW5jZScpXG5cbiAgICByZXR1cm4gdGhpcy53cmFwcGVycy5ldmVyeSh3cmFwcGVyID0+IHdyYXBwZXIuaXNWdWVJbnN0YW5jZSgpKVxuICB9XG5cbiAgbmFtZSAoKTogdm9pZCB7XG4gICAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ25hbWUnKVxuXG4gICAgdGhyb3dFcnJvcignbmFtZSBtdXN0IGJlIGNhbGxlZCBvbiBhIHNpbmdsZSB3cmFwcGVyLCB1c2UgYXQoaSkgdG8gYWNjZXNzIGEgd3JhcHBlcicpXG4gIH1cblxuICBwcm9wcyAoKTogdm9pZCB7XG4gICAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ3Byb3BzJylcblxuICAgIHRocm93RXJyb3IoJ3Byb3BzIG11c3QgYmUgY2FsbGVkIG9uIGEgc2luZ2xlIHdyYXBwZXIsIHVzZSBhdChpKSB0byBhY2Nlc3MgYSB3cmFwcGVyJylcbiAgfVxuXG4gIHRleHQgKCk6IHZvaWQge1xuICAgIHRoaXMudGhyb3dFcnJvcklmV3JhcHBlcnNJc0VtcHR5KCd0ZXh0JylcblxuICAgIHRocm93RXJyb3IoJ3RleHQgbXVzdCBiZSBjYWxsZWQgb24gYSBzaW5nbGUgd3JhcHBlciwgdXNlIGF0KGkpIHRvIGFjY2VzcyBhIHdyYXBwZXInKVxuICB9XG5cbiAgdGhyb3dFcnJvcklmV3JhcHBlcnNJc0VtcHR5IChtZXRob2Q6IHN0cmluZyk6IHZvaWQge1xuICAgIGlmICh0aGlzLndyYXBwZXJzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhyb3dFcnJvcihgJHttZXRob2R9IGNhbm5vdCBiZSBjYWxsZWQgb24gMCBpdGVtc2ApXG4gICAgfVxuICB9XG5cbiAgc2V0Q29tcHV0ZWQgKGNvbXB1dGVkOiBPYmplY3QpOiB2b2lkIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgnc2V0Q29tcHV0ZWQnKVxuXG4gICAgdGhpcy53cmFwcGVycy5mb3JFYWNoKHdyYXBwZXIgPT4gd3JhcHBlci5zZXRDb21wdXRlZChjb21wdXRlZCkpXG4gIH1cblxuICBzZXREYXRhIChkYXRhOiBPYmplY3QpOiB2b2lkIHtcbiAgICB0aGlzLnRocm93RXJyb3JJZldyYXBwZXJzSXNFbXB0eSgnc2V0RGF0YScpXG5cbiAgICB0aGlzLndyYXBwZXJzLmZvckVhY2god3JhcHBlciA9PiB3cmFwcGVyLnNldERhdGEoZGF0YSkpXG4gIH1cblxuICBzZXRNZXRob2RzIChwcm9wczogT2JqZWN0KTogdm9pZCB7XG4gICAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ3NldE1ldGhvZHMnKVxuXG4gICAgdGhpcy53cmFwcGVycy5mb3JFYWNoKHdyYXBwZXIgPT4gd3JhcHBlci5zZXRNZXRob2RzKHByb3BzKSlcbiAgfVxuXG4gIHNldFByb3BzIChwcm9wczogT2JqZWN0KTogdm9pZCB7XG4gICAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ3NldFByb3BzJylcblxuICAgIHRoaXMud3JhcHBlcnMuZm9yRWFjaCh3cmFwcGVyID0+IHdyYXBwZXIuc2V0UHJvcHMocHJvcHMpKVxuICB9XG5cbiAgdHJpZ2dlciAoZXZlbnQ6IHN0cmluZywgb3B0aW9uczogT2JqZWN0KTogdm9pZCB7XG4gICAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ3RyaWdnZXInKVxuXG4gICAgdGhpcy53cmFwcGVycy5mb3JFYWNoKHdyYXBwZXIgPT4gd3JhcHBlci50cmlnZ2VyKGV2ZW50LCBvcHRpb25zKSlcbiAgfVxuXG4gIHVwZGF0ZSAoKTogdm9pZCB7XG4gICAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ3VwZGF0ZScpXG5cbiAgICB0aGlzLndyYXBwZXJzLmZvckVhY2god3JhcHBlciA9PiB3cmFwcGVyLnVwZGF0ZSgpKVxuICB9XG5cbiAgZGVzdHJveSAoKTogdm9pZCB7XG4gICAgdGhpcy50aHJvd0Vycm9ySWZXcmFwcGVyc0lzRW1wdHkoJ2Rlc3Ryb3knKVxuXG4gICAgdGhpcy53cmFwcGVycy5mb3JFYWNoKHdyYXBwZXIgPT4gd3JhcHBlci5kZXN0cm95KCkpXG4gIH1cbn1cbiIsIi8vIEBmbG93XG5pbXBvcnQgeyB0aHJvd0Vycm9yIH0gZnJvbSAnLi4vbGliL3V0aWwnXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEVycm9yV3JhcHBlciBpbXBsZW1lbnRzIEJhc2VXcmFwcGVyIHtcbiAgc2VsZWN0b3I6IHN0cmluZztcblxuICBjb25zdHJ1Y3RvciAoc2VsZWN0b3I6IHN0cmluZykge1xuICAgIHRoaXMuc2VsZWN0b3IgPSBzZWxlY3RvclxuICB9XG5cbiAgYXQgKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoYGZpbmQgZGlkIG5vdCByZXR1cm4gJHt0aGlzLnNlbGVjdG9yfSwgY2Fubm90IGNhbGwgYXQoKSBvbiBlbXB0eSBXcmFwcGVyYClcbiAgfVxuXG4gIGF0dHJpYnV0ZXMgKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoYGZpbmQgZGlkIG5vdCByZXR1cm4gJHt0aGlzLnNlbGVjdG9yfSwgY2Fubm90IGNhbGwgYXR0cmlidXRlcygpIG9uIGVtcHR5IFdyYXBwZXJgKVxuICB9XG5cbiAgY2xhc3NlcyAoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihgZmluZCBkaWQgbm90IHJldHVybiAke3RoaXMuc2VsZWN0b3J9LCBjYW5ub3QgY2FsbCBjbGFzc2VzKCkgb24gZW1wdHkgV3JhcHBlcmApXG4gIH1cblxuICBjb250YWlucyAoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihgZmluZCBkaWQgbm90IHJldHVybiAke3RoaXMuc2VsZWN0b3J9LCBjYW5ub3QgY2FsbCBjb250YWlucygpIG9uIGVtcHR5IFdyYXBwZXJgKVxuICB9XG5cbiAgZW1pdHRlZCAoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihgZmluZCBkaWQgbm90IHJldHVybiAke3RoaXMuc2VsZWN0b3J9LCBjYW5ub3QgY2FsbCBlbWl0dGVkKCkgb24gZW1wdHkgV3JhcHBlcmApXG4gIH1cblxuICBlbWl0dGVkQnlPcmRlciAoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihgZmluZCBkaWQgbm90IHJldHVybiAke3RoaXMuc2VsZWN0b3J9LCBjYW5ub3QgY2FsbCBlbWl0dGVkQnlPcmRlcigpIG9uIGVtcHR5IFdyYXBwZXJgKVxuICB9XG5cbiAgZXhpc3RzICgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIGZpbHRlciAoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihgZmluZCBkaWQgbm90IHJldHVybiAke3RoaXMuc2VsZWN0b3J9LCBjYW5ub3QgY2FsbCBmaWx0ZXIoKSBvbiBlbXB0eSBXcmFwcGVyYClcbiAgfVxuXG4gIHZpc2libGUgKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoYGZpbmQgZGlkIG5vdCByZXR1cm4gJHt0aGlzLnNlbGVjdG9yfSwgY2Fubm90IGNhbGwgdmlzaWJsZSgpIG9uIGVtcHR5IFdyYXBwZXJgKVxuICB9XG5cbiAgaGFzQXR0cmlidXRlICgpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKGBmaW5kIGRpZCBub3QgcmV0dXJuICR7dGhpcy5zZWxlY3Rvcn0sIGNhbm5vdCBjYWxsIGhhc0F0dHJpYnV0ZSgpIG9uIGVtcHR5IFdyYXBwZXJgKVxuICB9XG5cbiAgaGFzQ2xhc3MgKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoYGZpbmQgZGlkIG5vdCByZXR1cm4gJHt0aGlzLnNlbGVjdG9yfSwgY2Fubm90IGNhbGwgaGFzQ2xhc3MoKSBvbiBlbXB0eSBXcmFwcGVyYClcbiAgfVxuXG4gIGhhc1Byb3AgKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoYGZpbmQgZGlkIG5vdCByZXR1cm4gJHt0aGlzLnNlbGVjdG9yfSwgY2Fubm90IGNhbGwgaGFzUHJvcCgpIG9uIGVtcHR5IFdyYXBwZXJgKVxuICB9XG5cbiAgaGFzU3R5bGUgKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoYGZpbmQgZGlkIG5vdCByZXR1cm4gJHt0aGlzLnNlbGVjdG9yfSwgY2Fubm90IGNhbGwgaGFzU3R5bGUoKSBvbiBlbXB0eSBXcmFwcGVyYClcbiAgfVxuXG4gIGZpbmRBbGwgKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoYGZpbmQgZGlkIG5vdCByZXR1cm4gJHt0aGlzLnNlbGVjdG9yfSwgY2Fubm90IGNhbGwgZmluZEFsbCgpIG9uIGVtcHR5IFdyYXBwZXJgKVxuICB9XG5cbiAgZmluZCAoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihgZmluZCBkaWQgbm90IHJldHVybiAke3RoaXMuc2VsZWN0b3J9LCBjYW5ub3QgY2FsbCBmaW5kKCkgb24gZW1wdHkgV3JhcHBlcmApXG4gIH1cblxuICBodG1sICgpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKGBmaW5kIGRpZCBub3QgcmV0dXJuICR7dGhpcy5zZWxlY3Rvcn0sIGNhbm5vdCBjYWxsIGh0bWwoKSBvbiBlbXB0eSBXcmFwcGVyYClcbiAgfVxuXG4gIGlzICgpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKGBmaW5kIGRpZCBub3QgcmV0dXJuICR7dGhpcy5zZWxlY3Rvcn0sIGNhbm5vdCBjYWxsIGlzKCkgb24gZW1wdHkgV3JhcHBlcmApXG4gIH1cblxuICBpc0VtcHR5ICgpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKGBmaW5kIGRpZCBub3QgcmV0dXJuICR7dGhpcy5zZWxlY3Rvcn0sIGNhbm5vdCBjYWxsIGlzRW1wdHkoKSBvbiBlbXB0eSBXcmFwcGVyYClcbiAgfVxuXG4gIGlzVnVlSW5zdGFuY2UgKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoYGZpbmQgZGlkIG5vdCByZXR1cm4gJHt0aGlzLnNlbGVjdG9yfSwgY2Fubm90IGNhbGwgaXNWdWVJbnN0YW5jZSgpIG9uIGVtcHR5IFdyYXBwZXJgKVxuICB9XG5cbiAgbmFtZSAoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihgZmluZCBkaWQgbm90IHJldHVybiAke3RoaXMuc2VsZWN0b3J9LCBjYW5ub3QgY2FsbCBuYW1lKCkgb24gZW1wdHkgV3JhcHBlcmApXG4gIH1cblxuICBwcm9wcyAoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihgZmluZCBkaWQgbm90IHJldHVybiAke3RoaXMuc2VsZWN0b3J9LCBjYW5ub3QgY2FsbCBwcm9wcygpIG9uIGVtcHR5IFdyYXBwZXJgKVxuICB9XG5cbiAgdGV4dCAoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihgZmluZCBkaWQgbm90IHJldHVybiAke3RoaXMuc2VsZWN0b3J9LCBjYW5ub3QgY2FsbCB0ZXh0KCkgb24gZW1wdHkgV3JhcHBlcmApXG4gIH1cblxuICBzZXRDb21wdXRlZCAoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihgZmluZCBkaWQgbm90IHJldHVybiAke3RoaXMuc2VsZWN0b3J9LCBjYW5ub3QgY2FsbCBzZXRDb21wdXRlZCgpIG9uIGVtcHR5IFdyYXBwZXJgKVxuICB9XG5cbiAgc2V0RGF0YSAoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihgZmluZCBkaWQgbm90IHJldHVybiAke3RoaXMuc2VsZWN0b3J9LCBjYW5ub3QgY2FsbCBzZXREYXRhKCkgb24gZW1wdHkgV3JhcHBlcmApXG4gIH1cblxuICBzZXRNZXRob2RzICgpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKGBmaW5kIGRpZCBub3QgcmV0dXJuICR7dGhpcy5zZWxlY3Rvcn0sIGNhbm5vdCBjYWxsIHNldE1ldGhvZHMoKSBvbiBlbXB0eSBXcmFwcGVyYClcbiAgfVxuXG4gIHNldFByb3BzICgpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKGBmaW5kIGRpZCBub3QgcmV0dXJuICR7dGhpcy5zZWxlY3Rvcn0sIGNhbm5vdCBjYWxsIHNldFByb3BzKCkgb24gZW1wdHkgV3JhcHBlcmApXG4gIH1cblxuICB0cmlnZ2VyICgpOiB2b2lkIHtcbiAgICB0aHJvd0Vycm9yKGBmaW5kIGRpZCBub3QgcmV0dXJuICR7dGhpcy5zZWxlY3Rvcn0sIGNhbm5vdCBjYWxsIHRyaWdnZXIoKSBvbiBlbXB0eSBXcmFwcGVyYClcbiAgfVxuXG4gIHVwZGF0ZSAoKTogdm9pZCB7XG4gICAgdGhyb3dFcnJvcihgZmluZCBkaWQgbm90IHJldHVybiAke3RoaXMuc2VsZWN0b3J9LCBjYW5ub3QgY2FsbCB1cGRhdGUoKSBvbiBlbXB0eSBXcmFwcGVyYClcbiAgfVxuXG4gIGRlc3Ryb3kgKCk6IHZvaWQge1xuICAgIHRocm93RXJyb3IoYGZpbmQgZGlkIG5vdCByZXR1cm4gJHt0aGlzLnNlbGVjdG9yfSwgY2Fubm90IGNhbGwgZGVzdHJveSgpIG9uIGVtcHR5IFdyYXBwZXJgKVxuICB9XG59XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQge1xuICBSRUZfU0VMRUNUT1Jcbn0gZnJvbSAnLi9jb25zdHMnXG5pbXBvcnQge1xuICB0aHJvd0Vycm9yXG59IGZyb20gJy4vdXRpbCdcblxuZnVuY3Rpb24gZmluZEFsbFZOb2RlcyAodm5vZGU6IFZOb2RlLCBub2RlczogQXJyYXk8Vk5vZGU+ID0gW10pOiBBcnJheTxWTm9kZT4ge1xuICBub2Rlcy5wdXNoKHZub2RlKVxuXG4gIGlmIChBcnJheS5pc0FycmF5KHZub2RlLmNoaWxkcmVuKSkge1xuICAgIHZub2RlLmNoaWxkcmVuLmZvckVhY2goKGNoaWxkVk5vZGUpID0+IHtcbiAgICAgIGZpbmRBbGxWTm9kZXMoY2hpbGRWTm9kZSwgbm9kZXMpXG4gICAgfSlcbiAgfVxuXG4gIGlmICh2bm9kZS5jaGlsZCkge1xuICAgIGZpbmRBbGxWTm9kZXModm5vZGUuY2hpbGQuX3Zub2RlLCBub2RlcylcbiAgfVxuXG4gIHJldHVybiBub2Rlc1xufVxuXG5mdW5jdGlvbiByZW1vdmVEdXBsaWNhdGVOb2RlcyAodk5vZGVzOiBBcnJheTxWTm9kZT4pOiBBcnJheTxWTm9kZT4ge1xuICBjb25zdCB1bmlxdWVOb2RlcyA9IFtdXG4gIHZOb2Rlcy5mb3JFYWNoKCh2Tm9kZSkgPT4ge1xuICAgIGNvbnN0IGV4aXN0cyA9IHVuaXF1ZU5vZGVzLnNvbWUobm9kZSA9PiB2Tm9kZS5lbG0gPT09IG5vZGUuZWxtKVxuICAgIGlmICghZXhpc3RzKSB7XG4gICAgICB1bmlxdWVOb2Rlcy5wdXNoKHZOb2RlKVxuICAgIH1cbiAgfSlcbiAgcmV0dXJuIHVuaXF1ZU5vZGVzXG59XG5cbmZ1bmN0aW9uIG5vZGVNYXRjaGVzUmVmIChub2RlOiBWTm9kZSwgcmVmTmFtZTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiBub2RlLmRhdGEgJiYgbm9kZS5kYXRhLnJlZiA9PT0gcmVmTmFtZVxufVxuXG5mdW5jdGlvbiBmaW5kVk5vZGVzQnlSZWYgKHZOb2RlOiBWTm9kZSwgcmVmTmFtZTogc3RyaW5nKTogQXJyYXk8Vk5vZGU+IHtcbiAgY29uc3Qgbm9kZXMgPSBmaW5kQWxsVk5vZGVzKHZOb2RlKVxuICBjb25zdCByZWZGaWx0ZXJlZE5vZGVzID0gbm9kZXMuZmlsdGVyKG5vZGUgPT4gbm9kZU1hdGNoZXNSZWYobm9kZSwgcmVmTmFtZSkpXG4gIC8vIE9ubHkgcmV0dXJuIHJlZnMgZGVmaW5lZCBvbiB0b3AtbGV2ZWwgVk5vZGUgdG8gcHJvdmlkZSB0aGUgc2FtZVxuICAvLyBiZWhhdmlvciBhcyBzZWxlY3RpbmcgdmlhIHZtLiRyZWYue3NvbWVSZWZOYW1lfVxuICBjb25zdCBtYWluVk5vZGVGaWx0ZXJlZE5vZGVzID0gcmVmRmlsdGVyZWROb2Rlcy5maWx0ZXIobm9kZSA9PiAoXG4gICAgISF2Tm9kZS5jb250ZXh0LiRyZWZzW25vZGUuZGF0YS5yZWZdXG4gICkpXG4gIHJldHVybiByZW1vdmVEdXBsaWNhdGVOb2RlcyhtYWluVk5vZGVGaWx0ZXJlZE5vZGVzKVxufVxuXG5mdW5jdGlvbiBub2RlTWF0Y2hlc1NlbGVjdG9yIChub2RlOiBWTm9kZSwgc2VsZWN0b3I6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gbm9kZS5lbG0gJiYgbm9kZS5lbG0uZ2V0QXR0cmlidXRlICYmIG5vZGUuZWxtLm1hdGNoZXMoc2VsZWN0b3IpXG59XG5cbmZ1bmN0aW9uIGZpbmRWTm9kZXNCeVNlbGVjdG9yIChcbiAgdk5vZGU6IFZOb2RlLFxuICBzZWxlY3Rvcjogc3RyaW5nXG4pOiBBcnJheTxWTm9kZT4ge1xuICBjb25zdCBub2RlcyA9IGZpbmRBbGxWTm9kZXModk5vZGUpXG4gIGNvbnN0IGZpbHRlcmVkTm9kZXMgPSBub2Rlcy5maWx0ZXIobm9kZSA9PiAoXG4gICAgbm9kZU1hdGNoZXNTZWxlY3Rvcihub2RlLCBzZWxlY3RvcilcbiAgKSlcbiAgcmV0dXJuIHJlbW92ZUR1cGxpY2F0ZU5vZGVzKGZpbHRlcmVkTm9kZXMpXG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGZpbmRWbm9kZXMgKFxuICB2bm9kZTogVk5vZGUsXG4gIHZtOiBDb21wb25lbnQgfCBudWxsLFxuICBzZWxlY3RvclR5cGU6ID9zdHJpbmcsXG4gIHNlbGVjdG9yOiBPYmplY3QgfCBzdHJpbmdcbik6IEFycmF5PFZOb2RlPiB7XG4gIGlmIChzZWxlY3RvclR5cGUgPT09IFJFRl9TRUxFQ1RPUikge1xuICAgIGlmICghdm0pIHtcbiAgICAgIHRocm93RXJyb3IoJyRyZWYgc2VsZWN0b3JzIGNhbiBvbmx5IGJlIHVzZWQgb24gVnVlIGNvbXBvbmVudCB3cmFwcGVycycpXG4gICAgfVxuICAgIC8vICRGbG93SWdub3JlXG4gICAgcmV0dXJuIGZpbmRWTm9kZXNCeVJlZih2bm9kZSwgc2VsZWN0b3IucmVmKVxuICB9XG4gIC8vICRGbG93SWdub3JlXG4gIHJldHVybiBmaW5kVk5vZGVzQnlTZWxlY3Rvcih2bm9kZSwgc2VsZWN0b3IpXG59XG4iLCIvLyBAZmxvd1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBmaW5kRE9NTm9kZXMgKFxuICBlbGVtZW50OiBFbGVtZW50IHwgbnVsbCxcbiAgc2VsZWN0b3I6IHN0cmluZ1xuKTogQXJyYXk8Vk5vZGU+IHtcbiAgY29uc3Qgbm9kZXMgPSBbXVxuICBpZiAoIWVsZW1lbnQgfHwgIWVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCB8fCAhZWxlbWVudC5tYXRjaGVzKSB7XG4gICAgcmV0dXJuIG5vZGVzXG4gIH1cblxuICBpZiAoZWxlbWVudC5tYXRjaGVzKHNlbGVjdG9yKSkge1xuICAgIG5vZGVzLnB1c2goZWxlbWVudClcbiAgfVxuICAvLyAkRmxvd0lnbm9yZVxuICByZXR1cm4gbm9kZXMuY29uY2F0KFtdLnNsaWNlLmNhbGwoZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKSkpXG59XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgZmluZFZub2RlcyBmcm9tICcuL2ZpbmQtdm5vZGVzJ1xuaW1wb3J0IGZpbmRWdWVDb21wb25lbnRzIGZyb20gJy4vZmluZC12dWUtY29tcG9uZW50cydcbmltcG9ydCBmaW5kRE9NTm9kZXMgZnJvbSAnLi9maW5kLWRvbS1ub2RlcydcbmltcG9ydCB7XG4gIENPTVBPTkVOVF9TRUxFQ1RPUixcbiAgTkFNRV9TRUxFQ1RPUixcbiAgRE9NX1NFTEVDVE9SXG59IGZyb20gJy4vY29uc3RzJ1xuaW1wb3J0IFZ1ZSBmcm9tICd2dWUnXG5pbXBvcnQgZ2V0U2VsZWN0b3JUeXBlT3JUaHJvdyBmcm9tICcuL2dldC1zZWxlY3Rvci10eXBlJ1xuaW1wb3J0IHsgdGhyb3dFcnJvciB9IGZyb20gJy4vdXRpbCdcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZmluZCAoXG4gIHZtOiBDb21wb25lbnQgfCBudWxsLFxuICB2bm9kZTogVk5vZGUgfCBudWxsLFxuICBlbGVtZW50OiBFbGVtZW50LFxuICBzZWxlY3RvcjogU2VsZWN0b3Jcbik6IEFycmF5PFZOb2RlIHwgQ29tcG9uZW50PiB7XG4gIGNvbnN0IHNlbGVjdG9yVHlwZSA9IGdldFNlbGVjdG9yVHlwZU9yVGhyb3coc2VsZWN0b3IsICdmaW5kJylcblxuICBpZiAoIXZub2RlICYmICF2bSAmJiBzZWxlY3RvclR5cGUgIT09IERPTV9TRUxFQ1RPUikge1xuICAgIHRocm93RXJyb3IoJ2Nhbm5vdCBmaW5kIGEgVnVlIGluc3RhbmNlIG9uIGEgRE9NIG5vZGUuIFRoZSBub2RlIHlvdSBhcmUgY2FsbGluZyBmaW5kIG9uIGRvZXMgbm90IGV4aXN0IGluIHRoZSBWRG9tLiBBcmUgeW91IGFkZGluZyB0aGUgbm9kZSBhcyBpbm5lckhUTUw/JylcbiAgfVxuXG4gIGlmIChzZWxlY3RvclR5cGUgPT09IENPTVBPTkVOVF9TRUxFQ1RPUiB8fCBzZWxlY3RvclR5cGUgPT09IE5BTUVfU0VMRUNUT1IpIHtcbiAgICBjb25zdCByb290ID0gdm0gfHwgdm5vZGVcbiAgICBpZiAoIXJvb3QpIHtcbiAgICAgIHJldHVybiBbXVxuICAgIH1cbiAgICByZXR1cm4gZmluZFZ1ZUNvbXBvbmVudHMocm9vdCwgc2VsZWN0b3JUeXBlLCBzZWxlY3RvcilcbiAgfVxuXG4gIGlmICh2bSAmJiB2bS4kcmVmcyAmJiBzZWxlY3Rvci5yZWYgaW4gdm0uJHJlZnMgJiYgdm0uJHJlZnNbc2VsZWN0b3IucmVmXSBpbnN0YW5jZW9mIFZ1ZSkge1xuICAgIHJldHVybiBbdm0uJHJlZnNbc2VsZWN0b3IucmVmXV1cbiAgfVxuXG4gIGlmICh2bm9kZSkge1xuICAgIGNvbnN0IG5vZGVzID0gZmluZFZub2Rlcyh2bm9kZSwgdm0sIHNlbGVjdG9yVHlwZSwgc2VsZWN0b3IpXG4gICAgaWYgKHNlbGVjdG9yVHlwZSAhPT0gRE9NX1NFTEVDVE9SKSB7XG4gICAgICByZXR1cm4gbm9kZXNcbiAgICB9XG4gICAgcmV0dXJuIG5vZGVzLmxlbmd0aCA+IDAgPyBub2RlcyA6IGZpbmRET01Ob2RlcyhlbGVtZW50LCBzZWxlY3RvcilcbiAgfVxuXG4gIHJldHVybiBmaW5kRE9NTm9kZXMoZWxlbWVudCwgc2VsZWN0b3IpXG59XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgVnVlIGZyb20gJ3Z1ZSdcbmltcG9ydCBXcmFwcGVyIGZyb20gJy4vd3JhcHBlcidcbmltcG9ydCBWdWVXcmFwcGVyIGZyb20gJy4vdnVlLXdyYXBwZXInXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNyZWF0ZVdyYXBwZXIgKFxuICBub2RlOiBWTm9kZSB8IENvbXBvbmVudCxcbiAgdXBkYXRlOiBGdW5jdGlvbixcbiAgb3B0aW9uczogV3JhcHBlck9wdGlvbnNcbikge1xuICByZXR1cm4gbm9kZSBpbnN0YW5jZW9mIFZ1ZVxuICAgID8gbmV3IFZ1ZVdyYXBwZXIobm9kZSwgb3B0aW9ucylcbiAgICA6IG5ldyBXcmFwcGVyKG5vZGUsIHVwZGF0ZSwgb3B0aW9ucylcbn1cbiIsIi8vIEBmbG93XG5cbmltcG9ydCBWdWUgZnJvbSAndnVlJ1xuaW1wb3J0IGdldFNlbGVjdG9yVHlwZU9yVGhyb3cgZnJvbSAnLi4vbGliL2dldC1zZWxlY3Rvci10eXBlJ1xuaW1wb3J0IHtcbiAgUkVGX1NFTEVDVE9SLFxuICBDT01QT05FTlRfU0VMRUNUT1IsXG4gIE5BTUVfU0VMRUNUT1Jcbn0gZnJvbSAnLi4vbGliL2NvbnN0cydcbmltcG9ydCB7XG4gIHZtQ3Rvck1hdGNoZXNOYW1lLFxuICB2bUN0b3JNYXRjaGVzU2VsZWN0b3IsXG4gIHZtRnVuY3Rpb25hbEN0b3JNYXRjaGVzU2VsZWN0b3Jcbn0gZnJvbSAnLi4vbGliL2ZpbmQtdnVlLWNvbXBvbmVudHMnXG5pbXBvcnQgVnVlV3JhcHBlciBmcm9tICcuL3Z1ZS13cmFwcGVyJ1xuaW1wb3J0IFdyYXBwZXJBcnJheSBmcm9tICcuL3dyYXBwZXItYXJyYXknXG5pbXBvcnQgRXJyb3JXcmFwcGVyIGZyb20gJy4vZXJyb3Itd3JhcHBlcidcbmltcG9ydCB7IHRocm93RXJyb3IsIHdhcm4gfSBmcm9tICcuLi9saWIvdXRpbCdcbmltcG9ydCBmaW5kQWxsIGZyb20gJy4uL2xpYi9maW5kJ1xuaW1wb3J0IGNyZWF0ZVdyYXBwZXIgZnJvbSAnLi9jcmVhdGUtd3JhcHBlcidcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgV3JhcHBlciBpbXBsZW1lbnRzIEJhc2VXcmFwcGVyIHtcbiAgdm5vZGU6IFZOb2RlIHwgbnVsbDtcbiAgdm06IENvbXBvbmVudCB8IG51bGw7XG4gIF9lbWl0dGVkOiB7IFtuYW1lOiBzdHJpbmddOiBBcnJheTxBcnJheTxhbnk+PiB9O1xuICBfZW1pdHRlZEJ5T3JkZXI6IEFycmF5PHsgbmFtZTogc3RyaW5nOyBhcmdzOiBBcnJheTxhbnk+IH0+O1xuICBpc1Z1ZUNvbXBvbmVudDogYm9vbGVhbjtcbiAgZWxlbWVudDogRWxlbWVudDtcbiAgdXBkYXRlOiBGdW5jdGlvbjtcbiAgb3B0aW9uczogV3JhcHBlck9wdGlvbnM7XG4gIHZlcnNpb246IG51bWJlclxuXG4gIGNvbnN0cnVjdG9yIChub2RlOiBWTm9kZSB8IEVsZW1lbnQsIHVwZGF0ZTogRnVuY3Rpb24sIG9wdGlvbnM6IFdyYXBwZXJPcHRpb25zKSB7XG4gICAgaWYgKG5vZGUgaW5zdGFuY2VvZiBFbGVtZW50KSB7XG4gICAgICB0aGlzLmVsZW1lbnQgPSBub2RlXG4gICAgICB0aGlzLnZub2RlID0gbnVsbFxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnZub2RlID0gbm9kZVxuICAgICAgdGhpcy5lbGVtZW50ID0gbm9kZS5lbG1cbiAgICB9XG4gICAgdGhpcy51cGRhdGUgPSB1cGRhdGVcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zXG4gICAgdGhpcy52ZXJzaW9uID0gTnVtYmVyKGAke1Z1ZS52ZXJzaW9uLnNwbGl0KCcuJylbMF19LiR7VnVlLnZlcnNpb24uc3BsaXQoJy4nKVsxXX1gKVxuICB9XG5cbiAgYXQgKCkge1xuICAgIHRocm93RXJyb3IoJ2F0KCkgbXVzdCBiZSBjYWxsZWQgb24gYSBXcmFwcGVyQXJyYXknKVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW4gT2JqZWN0IGNvbnRhaW5pbmcgYWxsIHRoZSBhdHRyaWJ1dGUvdmFsdWUgcGFpcnMgb24gdGhlIGVsZW1lbnQuXG4gICAqL1xuICBhdHRyaWJ1dGVzICgpOiB7IFtuYW1lOiBzdHJpbmddOiBzdHJpbmcgfSB7XG4gICAgY29uc3QgYXR0cmlidXRlcyA9IHRoaXMuZWxlbWVudC5hdHRyaWJ1dGVzXG4gICAgY29uc3QgYXR0cmlidXRlTWFwID0ge31cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGF0dHJpYnV0ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGF0dCA9IGF0dHJpYnV0ZXMuaXRlbShpKVxuICAgICAgYXR0cmlidXRlTWFwW2F0dC5sb2NhbE5hbWVdID0gYXR0LnZhbHVlXG4gICAgfVxuICAgIHJldHVybiBhdHRyaWJ1dGVNYXBcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIEFycmF5IGNvbnRhaW5pbmcgYWxsIHRoZSBjbGFzc2VzIG9uIHRoZSBlbGVtZW50XG4gICAqL1xuICBjbGFzc2VzICgpOiBBcnJheTxzdHJpbmc+IHtcbiAgICBsZXQgY2xhc3NlcyA9IHRoaXMuZWxlbWVudC5jbGFzc05hbWUgPyB0aGlzLmVsZW1lbnQuY2xhc3NOYW1lLnNwbGl0KCcgJykgOiBbXVxuICAgIC8vIEhhbmRsZSBjb252ZXJ0aW5nIGNzc21vZHVsZXMgaWRlbnRpZmllcnMgYmFjayB0byB0aGUgb3JpZ2luYWwgY2xhc3MgbmFtZVxuICAgIGlmICh0aGlzLnZtICYmIHRoaXMudm0uJHN0eWxlKSB7XG4gICAgICBjb25zdCBjc3NNb2R1bGVJZGVudGlmaWVycyA9IHt9XG4gICAgICBsZXQgbW9kdWxlSWRlbnRcbiAgICAgIE9iamVjdC5rZXlzKHRoaXMudm0uJHN0eWxlKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgICAgLy8gJEZsb3dJZ25vcmUgOiBGbG93IHRoaW5rcyB2bSBpcyBhIHByb3BlcnR5XG4gICAgICAgIG1vZHVsZUlkZW50ID0gdGhpcy52bS4kc3R5bGVba2V5XVxuICAgICAgICAvLyBDU1MgTW9kdWxlcyBtYXkgYmUgbXVsdGktY2xhc3MgaWYgdGhleSBleHRlbmQgb3RoZXJzLlxuICAgICAgICAvLyBFeHRlbmRlZCBjbGFzc2VzIHNob3VsZCBiZSBhbHJlYWR5IHByZXNlbnQgaW4gJHN0eWxlLlxuICAgICAgICBtb2R1bGVJZGVudCA9IG1vZHVsZUlkZW50LnNwbGl0KCcgJylbMF1cbiAgICAgICAgY3NzTW9kdWxlSWRlbnRpZmllcnNbbW9kdWxlSWRlbnRdID0ga2V5XG4gICAgICB9KVxuICAgICAgY2xhc3NlcyA9IGNsYXNzZXMubWFwKGNsYXNzTmFtZSA9PiBjc3NNb2R1bGVJZGVudGlmaWVyc1tjbGFzc05hbWVdIHx8IGNsYXNzTmFtZSlcbiAgICB9XG4gICAgcmV0dXJuIGNsYXNzZXNcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgd3JhcHBlciBjb250YWlucyBwcm92aWRlZCBzZWxlY3Rvci5cbiAgICovXG4gIGNvbnRhaW5zIChzZWxlY3RvcjogU2VsZWN0b3IpIHtcbiAgICBjb25zdCBzZWxlY3RvclR5cGUgPSBnZXRTZWxlY3RvclR5cGVPclRocm93KHNlbGVjdG9yLCAnY29udGFpbnMnKVxuICAgIGNvbnN0IG5vZGVzID0gZmluZEFsbCh0aGlzLnZtLCB0aGlzLnZub2RlLCB0aGlzLmVsZW1lbnQsIHNlbGVjdG9yKVxuICAgIGNvbnN0IGlzID0gc2VsZWN0b3JUeXBlID09PSBSRUZfU0VMRUNUT1IgPyBmYWxzZSA6IHRoaXMuaXMoc2VsZWN0b3IpXG4gICAgcmV0dXJuIG5vZGVzLmxlbmd0aCA+IDAgfHwgaXNcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIG9iamVjdCBjb250YWluaW5nIGN1c3RvbSBldmVudHMgZW1pdHRlZCBieSB0aGUgV3JhcHBlciB2bVxuICAgKi9cbiAgZW1pdHRlZCAoZXZlbnQ/OiBzdHJpbmcpIHtcbiAgICBpZiAoIXRoaXMuX2VtaXR0ZWQgJiYgIXRoaXMudm0pIHtcbiAgICAgIHRocm93RXJyb3IoJ3dyYXBwZXIuZW1pdHRlZCgpIGNhbiBvbmx5IGJlIGNhbGxlZCBvbiBhIFZ1ZSBpbnN0YW5jZScpXG4gICAgfVxuICAgIGlmIChldmVudCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2VtaXR0ZWRbZXZlbnRdXG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9lbWl0dGVkXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiBBcnJheSBjb250YWluaW5nIGN1c3RvbSBldmVudHMgZW1pdHRlZCBieSB0aGUgV3JhcHBlciB2bVxuICAgKi9cbiAgZW1pdHRlZEJ5T3JkZXIgKCkge1xuICAgIGlmICghdGhpcy5fZW1pdHRlZEJ5T3JkZXIgJiYgIXRoaXMudm0pIHtcbiAgICAgIHRocm93RXJyb3IoJ3dyYXBwZXIuZW1pdHRlZEJ5T3JkZXIoKSBjYW4gb25seSBiZSBjYWxsZWQgb24gYSBWdWUgaW5zdGFuY2UnKVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fZW1pdHRlZEJ5T3JkZXJcbiAgfVxuXG4gIC8qKlxuICAgKiBVdGlsaXR5IHRvIGNoZWNrIHdyYXBwZXIgZXhpc3RzLiBSZXR1cm5zIHRydWUgYXMgV3JhcHBlciBhbHdheXMgZXhpc3RzXG4gICAqL1xuICBleGlzdHMgKCk6IGJvb2xlYW4ge1xuICAgIGlmICh0aGlzLnZtKSB7XG4gICAgICByZXR1cm4gISF0aGlzLnZtICYmICF0aGlzLnZtLl9pc0Rlc3Ryb3llZFxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgZmlsdGVyICgpIHtcbiAgICB0aHJvd0Vycm9yKCdmaWx0ZXIoKSBtdXN0IGJlIGNhbGxlZCBvbiBhIFdyYXBwZXJBcnJheScpXG4gIH1cblxuICAvKipcbiAgICogVXRpbGl0eSB0byBjaGVjayB3cmFwcGVyIGlzIHZpc2libGUuIFJldHVybnMgZmFsc2UgaWYgYSBwYXJlbnQgZWxlbWVudCBoYXMgZGlzcGxheTogbm9uZSBvciB2aXNpYmlsaXR5OiBoaWRkZW4gc3R5bGUuXG4gICAqL1xuICB2aXNpYmxlICgpOiBib29sZWFuIHtcbiAgICBsZXQgZWxlbWVudCA9IHRoaXMuZWxlbWVudFxuXG4gICAgaWYgKCFlbGVtZW50KSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICB3aGlsZSAoZWxlbWVudCkge1xuICAgICAgaWYgKGVsZW1lbnQuc3R5bGUgJiYgKGVsZW1lbnQuc3R5bGUudmlzaWJpbGl0eSA9PT0gJ2hpZGRlbicgfHwgZWxlbWVudC5zdHlsZS5kaXNwbGF5ID09PSAnbm9uZScpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgICAgZWxlbWVudCA9IGVsZW1lbnQucGFyZW50RWxlbWVudFxuICAgIH1cblxuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIGlmIHdyYXBwZXIgaGFzIGFuIGF0dHJpYnV0ZSB3aXRoIG1hdGNoaW5nIHZhbHVlXG4gICAqL1xuICBoYXNBdHRyaWJ1dGUgKGF0dHJpYnV0ZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKSB7XG4gICAgd2FybignaGFzQXR0cmlidXRlKCkgaGFzIGJlZW4gZGVwcmVjYXRlZCBhbmQgd2lsbCBiZSByZW1vdmVkIGluIHZlcnNpb24gMS4wLjAuIFVzZSBhdHRyaWJ1dGVzKCkgaW5zdGVhZOKAlGh0dHBzOi8vdnVlLXRlc3QtdXRpbHMudnVlanMub3JnL2VuL2FwaS93cmFwcGVyL2F0dHJpYnV0ZXMnKVxuXG4gICAgaWYgKHR5cGVvZiBhdHRyaWJ1dGUgIT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvd0Vycm9yKCd3cmFwcGVyLmhhc0F0dHJpYnV0ZSgpIG11c3QgYmUgcGFzc2VkIGF0dHJpYnV0ZSBhcyBhIHN0cmluZycpXG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93RXJyb3IoJ3dyYXBwZXIuaGFzQXR0cmlidXRlKCkgbXVzdCBiZSBwYXNzZWQgdmFsdWUgYXMgYSBzdHJpbmcnKVxuICAgIH1cblxuICAgIHJldHVybiAhISh0aGlzLmVsZW1lbnQgJiYgdGhpcy5lbGVtZW50LmdldEF0dHJpYnV0ZShhdHRyaWJ1dGUpID09PSB2YWx1ZSlcbiAgfVxuXG4gIC8qKlxuICAgKiBBc3NlcnRzIHdyYXBwZXIgaGFzIGEgY2xhc3MgbmFtZVxuICAgKi9cbiAgaGFzQ2xhc3MgKGNsYXNzTmFtZTogc3RyaW5nKSB7XG4gICAgd2FybignaGFzQ2xhc3MoKSBoYXMgYmVlbiBkZXByZWNhdGVkIGFuZCB3aWxsIGJlIHJlbW92ZWQgaW4gdmVyc2lvbiAxLjAuMC4gVXNlIGNsYXNzZXMoKSBpbnN0ZWFk4oCUaHR0cHM6Ly92dWUtdGVzdC11dGlscy52dWVqcy5vcmcvZW4vYXBpL3dyYXBwZXIvY2xhc3NlcycpXG4gICAgbGV0IHRhcmdldENsYXNzID0gY2xhc3NOYW1lXG5cbiAgICBpZiAodHlwZW9mIHRhcmdldENsYXNzICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3dFcnJvcignd3JhcHBlci5oYXNDbGFzcygpIG11c3QgYmUgcGFzc2VkIGEgc3RyaW5nJylcbiAgICB9XG5cbiAgICAvLyBpZiAkc3R5bGUgaXMgYXZhaWxhYmxlIGFuZCBoYXMgYSBtYXRjaGluZyB0YXJnZXQsIHVzZSB0aGF0IGluc3RlYWQuXG4gICAgaWYgKHRoaXMudm0gJiYgdGhpcy52bS4kc3R5bGUgJiYgdGhpcy52bS4kc3R5bGVbdGFyZ2V0Q2xhc3NdKSB7XG4gICAgICB0YXJnZXRDbGFzcyA9IHRoaXMudm0uJHN0eWxlW3RhcmdldENsYXNzXVxuICAgIH1cblxuICAgIGNvbnN0IGNvbnRhaW5zQWxsQ2xhc3NlcyA9IHRhcmdldENsYXNzXG4gICAgICAuc3BsaXQoJyAnKVxuICAgICAgLmV2ZXJ5KHRhcmdldCA9PiB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmNvbnRhaW5zKHRhcmdldCkpXG5cbiAgICByZXR1cm4gISEodGhpcy5lbGVtZW50ICYmIGNvbnRhaW5zQWxsQ2xhc3NlcylcbiAgfVxuXG4gIC8qKlxuICAgKiBBc3NlcnRzIHdyYXBwZXIgaGFzIGEgcHJvcCBuYW1lXG4gICAqL1xuICBoYXNQcm9wIChwcm9wOiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcpIHtcbiAgICB3YXJuKCdoYXNQcm9wKCkgaGFzIGJlZW4gZGVwcmVjYXRlZCBhbmQgd2lsbCBiZSByZW1vdmVkIGluIHZlcnNpb24gMS4wLjAuIFVzZSBwcm9wcygpIGluc3RlYWTigJRodHRwczovL3Z1ZS10ZXN0LXV0aWxzLnZ1ZWpzLm9yZy9lbi9hcGkvd3JhcHBlci9wcm9wcycpXG5cbiAgICBpZiAoIXRoaXMuaXNWdWVDb21wb25lbnQpIHtcbiAgICAgIHRocm93RXJyb3IoJ3dyYXBwZXIuaGFzUHJvcCgpIG11c3QgYmUgY2FsbGVkIG9uIGEgVnVlIGluc3RhbmNlJylcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBwcm9wICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3dFcnJvcignd3JhcHBlci5oYXNQcm9wKCkgbXVzdCBiZSBwYXNzZWQgcHJvcCBhcyBhIHN0cmluZycpXG4gICAgfVxuXG4gICAgLy8gJHByb3BzIG9iamVjdCBkb2VzIG5vdCBleGlzdCBpbiBWdWUgMi4xLngsIHNvIHVzZSAkb3B0aW9ucy5wcm9wc0RhdGEgaW5zdGVhZFxuICAgIGlmICh0aGlzLnZtICYmIHRoaXMudm0uJG9wdGlvbnMgJiYgdGhpcy52bS4kb3B0aW9ucy5wcm9wc0RhdGEgJiYgdGhpcy52bS4kb3B0aW9ucy5wcm9wc0RhdGFbcHJvcF0gPT09IHZhbHVlKSB7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cblxuICAgIHJldHVybiAhIXRoaXMudm0gJiYgISF0aGlzLnZtLiRwcm9wcyAmJiB0aGlzLnZtLiRwcm9wc1twcm9wXSA9PT0gdmFsdWVcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgd3JhcHBlciBoYXMgYSBzdHlsZSB3aXRoIHZhbHVlXG4gICAqL1xuICBoYXNTdHlsZSAoc3R5bGU6IHN0cmluZywgdmFsdWU6IHN0cmluZykge1xuICAgIHdhcm4oJ2hhc1N0eWxlKCkgaGFzIGJlZW4gZGVwcmVjYXRlZCBhbmQgd2lsbCBiZSByZW1vdmVkIGluIHZlcnNpb24gMS4wLjAuIFVzZSB3cmFwcGVyLmVsZW1lbnQuc3R5bGUgaW5zdGVhZCcpXG5cbiAgICBpZiAodHlwZW9mIHN0eWxlICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3dFcnJvcignd3JhcHBlci5oYXNTdHlsZSgpIG11c3QgYmUgcGFzc2VkIHN0eWxlIGFzIGEgc3RyaW5nJylcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3dFcnJvcignd3JhcHBlci5oYXNDbGFzcygpIG11c3QgYmUgcGFzc2VkIHZhbHVlIGFzIHN0cmluZycpXG4gICAgfVxuXG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICBpZiAobmF2aWdhdG9yLnVzZXJBZ2VudC5pbmNsdWRlcyAmJiAobmF2aWdhdG9yLnVzZXJBZ2VudC5pbmNsdWRlcygnbm9kZS5qcycpIHx8IG5hdmlnYXRvci51c2VyQWdlbnQuaW5jbHVkZXMoJ2pzZG9tJykpKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ3dyYXBwZXIuaGFzU3R5bGUgaXMgbm90IGZ1bGx5IHN1cHBvcnRlZCB3aGVuIHJ1bm5pbmcganNkb20gLSBvbmx5IGlubGluZSBzdHlsZXMgYXJlIHN1cHBvcnRlZCcpIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29uc29sZVxuICAgIH1cbiAgICBjb25zdCBib2R5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpXG4gICAgY29uc3QgbW9ja0VsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuXG4gICAgaWYgKCEoYm9keSBpbnN0YW5jZW9mIEVsZW1lbnQpKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gICAgY29uc3QgbW9ja05vZGUgPSBib2R5Lmluc2VydEJlZm9yZShtb2NrRWxlbWVudCwgbnVsbClcbiAgICAvLyAkRmxvd0lnbm9yZSA6IEZsb3cgdGhpbmtzIHN0eWxlW3N0eWxlXSByZXR1cm5zIGEgbnVtYmVyXG4gICAgbW9ja0VsZW1lbnQuc3R5bGVbc3R5bGVdID0gdmFsdWVcblxuICAgIGlmICghdGhpcy5vcHRpb25zLmF0dGFjaGVkVG9Eb2N1bWVudCAmJiAodGhpcy52bSB8fCB0aGlzLnZub2RlKSkge1xuICAgICAgLy8gJEZsb3dJZ25vcmUgOiBQb3NzaWJsZSBudWxsIHZhbHVlLCB3aWxsIGJlIHJlbW92ZWQgaW4gMS4wLjBcbiAgICAgIGNvbnN0IHZtID0gdGhpcy52bSB8fCB0aGlzLnZub2RlLmNvbnRleHQuJHJvb3RcbiAgICAgIGJvZHkuaW5zZXJ0QmVmb3JlKHZtLiRyb290Ll92bm9kZS5lbG0sIG51bGwpXG4gICAgfVxuXG4gICAgY29uc3QgZWxTdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHRoaXMuZWxlbWVudClbc3R5bGVdXG4gICAgY29uc3QgbW9ja05vZGVTdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKG1vY2tOb2RlKVtzdHlsZV1cbiAgICByZXR1cm4gISEoZWxTdHlsZSAmJiBtb2NrTm9kZVN0eWxlICYmIGVsU3R5bGUgPT09IG1vY2tOb2RlU3R5bGUpXG4gIH1cblxuICAvKipcbiAgICogRmluZHMgZmlyc3Qgbm9kZSBpbiB0cmVlIG9mIHRoZSBjdXJyZW50IHdyYXBwZXIgdGhhdCBtYXRjaGVzIHRoZSBwcm92aWRlZCBzZWxlY3Rvci5cbiAgICovXG4gIGZpbmQgKHNlbGVjdG9yOiBTZWxlY3Rvcik6IFdyYXBwZXIgfCBFcnJvcldyYXBwZXIgfCBWdWVXcmFwcGVyIHtcbiAgICBjb25zdCBub2RlcyA9IGZpbmRBbGwodGhpcy52bSwgdGhpcy52bm9kZSwgdGhpcy5lbGVtZW50LCBzZWxlY3RvcilcbiAgICBpZiAobm9kZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICBpZiAoc2VsZWN0b3IucmVmKSB7XG4gICAgICAgIHJldHVybiBuZXcgRXJyb3JXcmFwcGVyKGByZWY9XCIke3NlbGVjdG9yLnJlZn1cImApXG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IEVycm9yV3JhcHBlcih0eXBlb2Ygc2VsZWN0b3IgPT09ICdzdHJpbmcnID8gc2VsZWN0b3IgOiAnQ29tcG9uZW50JylcbiAgICB9XG4gICAgcmV0dXJuIGNyZWF0ZVdyYXBwZXIobm9kZXNbMF0sIHRoaXMudXBkYXRlLCB0aGlzLm9wdGlvbnMpXG4gIH1cblxuICAvKipcbiAgICogRmluZHMgbm9kZSBpbiB0cmVlIG9mIHRoZSBjdXJyZW50IHdyYXBwZXIgdGhhdCBtYXRjaGVzIHRoZSBwcm92aWRlZCBzZWxlY3Rvci5cbiAgICovXG4gIGZpbmRBbGwgKHNlbGVjdG9yOiBTZWxlY3Rvcik6IFdyYXBwZXJBcnJheSB7XG4gICAgZ2V0U2VsZWN0b3JUeXBlT3JUaHJvdyhzZWxlY3RvciwgJ2ZpbmRBbGwnKVxuICAgIGNvbnN0IG5vZGVzID0gZmluZEFsbCh0aGlzLnZtLCB0aGlzLnZub2RlLCB0aGlzLmVsZW1lbnQsIHNlbGVjdG9yKVxuICAgIGNvbnN0IHdyYXBwZXJzID0gbm9kZXMubWFwKG5vZGUgPT5cbiAgICAgIGNyZWF0ZVdyYXBwZXIobm9kZSwgdGhpcy51cGRhdGUsIHRoaXMub3B0aW9ucylcbiAgICApXG4gICAgcmV0dXJuIG5ldyBXcmFwcGVyQXJyYXkod3JhcHBlcnMpXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBIVE1MIG9mIGVsZW1lbnQgYXMgYSBzdHJpbmdcbiAgICovXG4gIGh0bWwgKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudC5vdXRlckhUTUxcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgbm9kZSBtYXRjaGVzIHNlbGVjdG9yXG4gICAqL1xuICBpcyAoc2VsZWN0b3I6IFNlbGVjdG9yKTogYm9vbGVhbiB7XG4gICAgY29uc3Qgc2VsZWN0b3JUeXBlID0gZ2V0U2VsZWN0b3JUeXBlT3JUaHJvdyhzZWxlY3RvciwgJ2lzJylcblxuICAgIGlmIChzZWxlY3RvclR5cGUgPT09IE5BTUVfU0VMRUNUT1IpIHtcbiAgICAgIGlmICghdGhpcy52bSkge1xuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH1cbiAgICAgIHJldHVybiB2bUN0b3JNYXRjaGVzTmFtZSh0aGlzLnZtLCBzZWxlY3Rvci5uYW1lKVxuICAgIH1cblxuICAgIGlmIChzZWxlY3RvclR5cGUgPT09IENPTVBPTkVOVF9TRUxFQ1RPUikge1xuICAgICAgaWYgKCF0aGlzLnZtKSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgICAgaWYgKHNlbGVjdG9yLmZ1bmN0aW9uYWwpIHtcbiAgICAgICAgcmV0dXJuIHZtRnVuY3Rpb25hbEN0b3JNYXRjaGVzU2VsZWN0b3IodGhpcy52bS5fdm5vZGUsIHNlbGVjdG9yLl9DdG9yKVxuICAgICAgfVxuICAgICAgcmV0dXJuIHZtQ3Rvck1hdGNoZXNTZWxlY3Rvcih0aGlzLnZtLCBzZWxlY3RvcilcbiAgICB9XG5cbiAgICBpZiAoc2VsZWN0b3JUeXBlID09PSBSRUZfU0VMRUNUT1IpIHtcbiAgICAgIHRocm93RXJyb3IoJyRyZWYgc2VsZWN0b3JzIGNhbiBub3QgYmUgdXNlZCB3aXRoIHdyYXBwZXIuaXMoKScpXG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBzZWxlY3RvciA9PT0gJ29iamVjdCcpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIHJldHVybiAhISh0aGlzLmVsZW1lbnQgJiZcbiAgICB0aGlzLmVsZW1lbnQuZ2V0QXR0cmlidXRlICYmXG4gICAgdGhpcy5lbGVtZW50Lm1hdGNoZXMoc2VsZWN0b3IpKVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiBub2RlIGlzIGVtcHR5XG4gICAqL1xuICBpc0VtcHR5ICgpOiBib29sZWFuIHtcbiAgICBpZiAoIXRoaXMudm5vZGUpIHtcbiAgICAgIHJldHVybiB0aGlzLmVsZW1lbnQuaW5uZXJIVE1MID09PSAnJ1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy52bm9kZS5jaGlsZHJlbiA9PT0gdW5kZWZpbmVkIHx8IHRoaXMudm5vZGUuY2hpbGRyZW4ubGVuZ3RoID09PSAwXG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIGlmIHdyYXBwZXIgaXMgYSB2dWUgaW5zdGFuY2VcbiAgICovXG4gIGlzVnVlSW5zdGFuY2UgKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAhIXRoaXMuaXNWdWVDb21wb25lbnRcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIG5hbWUgb2YgY29tcG9uZW50LCBvciB0YWcgbmFtZSBpZiBub2RlIGlzIG5vdCBhIFZ1ZSBjb21wb25lbnRcbiAgICovXG4gIG5hbWUgKCk6IHN0cmluZyB7XG4gICAgaWYgKHRoaXMudm0pIHtcbiAgICAgIHJldHVybiB0aGlzLnZtLiRvcHRpb25zLm5hbWVcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMudm5vZGUpIHtcbiAgICAgIHJldHVybiB0aGlzLmVsZW1lbnQudGFnTmFtZVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnZub2RlLnRhZ1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYW4gT2JqZWN0IGNvbnRhaW5pbmcgdGhlIHByb3AgbmFtZS92YWx1ZSBwYWlycyBvbiB0aGUgZWxlbWVudFxuICAgKi9cbiAgcHJvcHMgKCk6IHsgW25hbWU6IHN0cmluZ106IGFueSB9IHtcbiAgICBpZiAoIXRoaXMudm0pIHtcbiAgICAgIHRocm93RXJyb3IoJ3dyYXBwZXIucHJvcHMoKSBtdXN0IGJlIGNhbGxlZCBvbiBhIFZ1ZSBpbnN0YW5jZScpXG4gICAgfVxuICAgIC8vICRwcm9wcyBvYmplY3QgZG9lcyBub3QgZXhpc3QgaW4gVnVlIDIuMS54LCBzbyB1c2UgJG9wdGlvbnMucHJvcHNEYXRhIGluc3RlYWRcbiAgICBsZXQgX3Byb3BzXG4gICAgaWYgKHRoaXMudm0gJiYgdGhpcy52bS4kb3B0aW9ucyAmJiB0aGlzLnZtLiRvcHRpb25zLnByb3BzRGF0YSkge1xuICAgICAgX3Byb3BzID0gdGhpcy52bS4kb3B0aW9ucy5wcm9wc0RhdGFcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gJEZsb3dJZ25vcmVcbiAgICAgIF9wcm9wcyA9IHRoaXMudm0uJHByb3BzXG4gICAgfVxuICAgIHJldHVybiBfcHJvcHMgfHwge30gLy8gUmV0dXJuIGFuIGVtcHR5IG9iamVjdCBpZiBubyBwcm9wcyBleGlzdFxuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdm0gZGF0YVxuICAgKi9cbiAgc2V0RGF0YSAoZGF0YTogT2JqZWN0KSB7XG4gICAgaWYgKCF0aGlzLnZtKSB7XG4gICAgICB0aHJvd0Vycm9yKCd3cmFwcGVyLnNldERhdGEoKSBjYW4gb25seSBiZSBjYWxsZWQgb24gYSBWdWUgaW5zdGFuY2UnKVxuICAgIH1cblxuICAgIE9iamVjdC5rZXlzKGRhdGEpLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgLy8gJEZsb3dJZ25vcmUgOiBQcm9ibGVtIHdpdGggcG9zc2libHkgbnVsbCB0aGlzLnZtXG4gICAgICB0aGlzLnZtLiRzZXQodGhpcy52bSwgW2tleV0sIGRhdGFba2V5XSlcbiAgICB9KVxuXG4gICAgdGhpcy51cGRhdGUoZGF0YSlcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHZtIGNvbXB1dGVkXG4gICAqL1xuICBzZXRDb21wdXRlZCAoY29tcHV0ZWQ6IE9iamVjdCkge1xuICAgIGlmICghdGhpcy5pc1Z1ZUNvbXBvbmVudCkge1xuICAgICAgdGhyb3dFcnJvcignd3JhcHBlci5zZXRDb21wdXRlZCgpIGNhbiBvbmx5IGJlIGNhbGxlZCBvbiBhIFZ1ZSBpbnN0YW5jZScpXG4gICAgfVxuXG4gICAgd2Fybignc2V0Q29tcHV0ZWQoKSBoYXMgYmVlbiBkZXByZWNhdGVkIGFuZCB3aWxsIGJlIHJlbW92ZWQgaW4gdmVyc2lvbiAxLjAuMC4gWW91IGNhbiBvdmVyd3JpdGUgY29tcHV0ZWQgcHJvcGVydGllcyBieSBwYXNzaW5nIGEgY29tcHV0ZWQgb2JqZWN0IGluIHRoZSBtb3VudGluZyBvcHRpb25zJylcblxuICAgIE9iamVjdC5rZXlzKGNvbXB1dGVkKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgIGlmICh0aGlzLnZlcnNpb24gPiAyLjEpIHtcbiAgICAgICAgLy8gJEZsb3dJZ25vcmUgOiBQcm9ibGVtIHdpdGggcG9zc2libHkgbnVsbCB0aGlzLnZtXG4gICAgICAgIGlmICghdGhpcy52bS5fY29tcHV0ZWRXYXRjaGVyc1trZXldKSB7XG4gICAgICAgICAgdGhyb3dFcnJvcihgd3JhcHBlci5zZXRDb21wdXRlZCgpIHdhcyBwYXNzZWQgYSB2YWx1ZSB0aGF0IGRvZXMgbm90IGV4aXN0IGFzIGEgY29tcHV0ZWQgcHJvcGVydHkgb24gdGhlIFZ1ZSBpbnN0YW5jZS4gUHJvcGVydHkgJHtrZXl9IGRvZXMgbm90IGV4aXN0IG9uIHRoZSBWdWUgaW5zdGFuY2VgKVxuICAgICAgICB9XG4gICAgICAgIC8vICRGbG93SWdub3JlIDogUHJvYmxlbSB3aXRoIHBvc3NpYmx5IG51bGwgdGhpcy52bVxuICAgICAgICB0aGlzLnZtLl9jb21wdXRlZFdhdGNoZXJzW2tleV0udmFsdWUgPSBjb21wdXRlZFtrZXldXG4gICAgICAgIC8vICRGbG93SWdub3JlIDogUHJvYmxlbSB3aXRoIHBvc3NpYmx5IG51bGwgdGhpcy52bVxuICAgICAgICB0aGlzLnZtLl9jb21wdXRlZFdhdGNoZXJzW2tleV0uZ2V0dGVyID0gKCkgPT4gY29tcHV0ZWRba2V5XVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IGlzU3RvcmUgPSBmYWxzZVxuICAgICAgICAvLyAkRmxvd0lnbm9yZSA6IFByb2JsZW0gd2l0aCBwb3NzaWJseSBudWxsIHRoaXMudm1cbiAgICAgICAgdGhpcy52bS5fd2F0Y2hlcnMuZm9yRWFjaCh3YXRjaGVyID0+IHtcbiAgICAgICAgICBpZiAod2F0Y2hlci5nZXR0ZXIudnVleCAmJiBrZXkgaW4gd2F0Y2hlci52bS4kb3B0aW9ucy5zdG9yZS5nZXR0ZXJzKSB7XG4gICAgICAgICAgICB3YXRjaGVyLnZtLiRvcHRpb25zLnN0b3JlLmdldHRlcnMgPSB7XG4gICAgICAgICAgICAgIC4uLndhdGNoZXIudm0uJG9wdGlvbnMuc3RvcmUuZ2V0dGVyc1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHdhdGNoZXIudm0uJG9wdGlvbnMuc3RvcmUuZ2V0dGVycywga2V5LCB7IGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gY29tcHV0ZWRba2V5XSB9IH0pXG4gICAgICAgICAgICBpc1N0b3JlID0gdHJ1ZVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcblxuICAgICAgICAvLyAkRmxvd0lnbm9yZSA6IFByb2JsZW0gd2l0aCBwb3NzaWJseSBudWxsIHRoaXMudm1cbiAgICAgICAgaWYgKCFpc1N0b3JlICYmICF0aGlzLnZtLl93YXRjaGVycy5zb21lKHcgPT4gdy5nZXR0ZXIubmFtZSA9PT0ga2V5KSkge1xuICAgICAgICAgIHRocm93RXJyb3IoYHdyYXBwZXIuc2V0Q29tcHV0ZWQoKSB3YXMgcGFzc2VkIGEgdmFsdWUgdGhhdCBkb2VzIG5vdCBleGlzdCBhcyBhIGNvbXB1dGVkIHByb3BlcnR5IG9uIHRoZSBWdWUgaW5zdGFuY2UuIFByb3BlcnR5ICR7a2V5fSBkb2VzIG5vdCBleGlzdCBvbiB0aGUgVnVlIGluc3RhbmNlYClcbiAgICAgICAgfVxuICAgICAgICAvLyAkRmxvd0lnbm9yZSA6IFByb2JsZW0gd2l0aCBwb3NzaWJseSBudWxsIHRoaXMudm1cbiAgICAgICAgdGhpcy52bS5fd2F0Y2hlcnMuZm9yRWFjaCgod2F0Y2hlcikgPT4ge1xuICAgICAgICAgIGlmICh3YXRjaGVyLmdldHRlci5uYW1lID09PSBrZXkpIHtcbiAgICAgICAgICAgIHdhdGNoZXIudmFsdWUgPSBjb21wdXRlZFtrZXldXG4gICAgICAgICAgICB3YXRjaGVyLmdldHRlciA9ICgpID0+IGNvbXB1dGVkW2tleV1cbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfSlcbiAgICB0aGlzLnVwZGF0ZSgpXG4gIH1cblxuICAvKipcbiAgICogU2V0cyB2bSBtZXRob2RzXG4gICAqL1xuICBzZXRNZXRob2RzIChtZXRob2RzOiBPYmplY3QpIHtcbiAgICBpZiAoIXRoaXMuaXNWdWVDb21wb25lbnQpIHtcbiAgICAgIHRocm93RXJyb3IoJ3dyYXBwZXIuc2V0TWV0aG9kcygpIGNhbiBvbmx5IGJlIGNhbGxlZCBvbiBhIFZ1ZSBpbnN0YW5jZScpXG4gICAgfVxuICAgIE9iamVjdC5rZXlzKG1ldGhvZHMpLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgLy8gJEZsb3dJZ25vcmUgOiBQcm9ibGVtIHdpdGggcG9zc2libHkgbnVsbCB0aGlzLnZtXG4gICAgICB0aGlzLnZtW2tleV0gPSBtZXRob2RzW2tleV1cbiAgICAgIC8vICRGbG93SWdub3JlIDogUHJvYmxlbSB3aXRoIHBvc3NpYmx5IG51bGwgdGhpcy52bVxuICAgICAgdGhpcy52bS4kb3B0aW9ucy5tZXRob2RzW2tleV0gPSBtZXRob2RzW2tleV1cbiAgICB9KVxuICAgIHRoaXMudXBkYXRlKClcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHZtIHByb3BzXG4gICAqL1xuICBzZXRQcm9wcyAoZGF0YTogT2JqZWN0KSB7XG4gICAgaWYgKCF0aGlzLmlzVnVlQ29tcG9uZW50IHx8ICF0aGlzLnZtKSB7XG4gICAgICB0aHJvd0Vycm9yKCd3cmFwcGVyLnNldFByb3BzKCkgY2FuIG9ubHkgYmUgY2FsbGVkIG9uIGEgVnVlIGluc3RhbmNlJylcbiAgICB9XG4gICAgaWYgKHRoaXMudm0gJiYgdGhpcy52bS4kb3B0aW9ucyAmJiAhdGhpcy52bS4kb3B0aW9ucy5wcm9wc0RhdGEpIHtcbiAgICAgIHRoaXMudm0uJG9wdGlvbnMucHJvcHNEYXRhID0ge31cbiAgICB9XG4gICAgT2JqZWN0LmtleXMoZGF0YSkuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAvLyAkRmxvd0lnbm9yZSA6IFByb2JsZW0gd2l0aCBwb3NzaWJseSBudWxsIHRoaXMudm1cbiAgICAgIGlmICh0aGlzLnZtLl9wcm9wcykge1xuICAgICAgICB0aGlzLnZtLl9wcm9wc1trZXldID0gZGF0YVtrZXldXG4gICAgICAgIC8vICRGbG93SWdub3JlIDogUHJvYmxlbSB3aXRoIHBvc3NpYmx5IG51bGwgdGhpcy52bS4kcHJvcHNcbiAgICAgICAgdGhpcy52bS4kcHJvcHNba2V5XSA9IGRhdGFba2V5XVxuICAgICAgICAvLyAkRmxvd0lnbm9yZSA6IFByb2JsZW0gd2l0aCBwb3NzaWJseSBudWxsIHRoaXMudm0uJG9wdGlvbnNcbiAgICAgICAgdGhpcy52bS4kb3B0aW9ucy5wcm9wc0RhdGFba2V5XSA9IGRhdGFba2V5XVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gJEZsb3dJZ25vcmUgOiBQcm9ibGVtIHdpdGggcG9zc2libHkgbnVsbCB0aGlzLnZtXG4gICAgICAgIHRoaXMudm1ba2V5XSA9IGRhdGFba2V5XVxuICAgICAgICAvLyAkRmxvd0lnbm9yZSA6IFByb2JsZW0gd2l0aCBwb3NzaWJseSBudWxsIHRoaXMudm0uJG9wdGlvbnNcbiAgICAgICAgdGhpcy52bS4kb3B0aW9ucy5wcm9wc0RhdGFba2V5XSA9IGRhdGFba2V5XVxuICAgICAgfVxuICAgIH0pXG5cbiAgICB0aGlzLnVwZGF0ZShkYXRhKVxuICAgIC8vICRGbG93SWdub3JlIDogUHJvYmxlbSB3aXRoIHBvc3NpYmx5IG51bGwgdGhpcy52bVxuICAgIHRoaXMudm5vZGUgPSB0aGlzLnZtLl92bm9kZVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiB0ZXh0IG9mIHdyYXBwZXIgZWxlbWVudFxuICAgKi9cbiAgdGV4dCAoKTogc3RyaW5nIHtcbiAgICBpZiAoIXRoaXMuZWxlbWVudCkge1xuICAgICAgdGhyb3dFcnJvcignY2Fubm90IGNhbGwgd3JhcHBlci50ZXh0KCkgb24gYSB3cmFwcGVyIHdpdGhvdXQgYW4gZWxlbWVudCcpXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudC50ZXh0Q29udGVudC50cmltKClcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxscyBkZXN0cm95IG9uIHZtXG4gICAqL1xuICBkZXN0cm95ICgpIHtcbiAgICBpZiAoIXRoaXMuaXNWdWVDb21wb25lbnQpIHtcbiAgICAgIHRocm93RXJyb3IoJ3dyYXBwZXIuZGVzdHJveSgpIGNhbiBvbmx5IGJlIGNhbGxlZCBvbiBhIFZ1ZSBpbnN0YW5jZScpXG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZWxlbWVudC5wYXJlbnROb2RlKSB7XG4gICAgICB0aGlzLmVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLmVsZW1lbnQpXG4gICAgfVxuICAgIC8vICRGbG93SWdub3JlXG4gICAgdGhpcy52bS4kZGVzdHJveSgpXG4gIH1cblxuICAvKipcbiAgICogRGlzcGF0Y2hlcyBhIERPTSBldmVudCBvbiB3cmFwcGVyXG4gICAqL1xuICB0cmlnZ2VyICh0eXBlOiBzdHJpbmcsIG9wdGlvbnM6IE9iamVjdCA9IHt9KSB7XG4gICAgaWYgKHR5cGVvZiB0eXBlICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3dFcnJvcignd3JhcHBlci50cmlnZ2VyKCkgbXVzdCBiZSBwYXNzZWQgYSBzdHJpbmcnKVxuICAgIH1cblxuICAgIGlmICghdGhpcy5lbGVtZW50KSB7XG4gICAgICB0aHJvd0Vycm9yKCdjYW5ub3QgY2FsbCB3cmFwcGVyLnRyaWdnZXIoKSBvbiBhIHdyYXBwZXIgd2l0aG91dCBhbiBlbGVtZW50JylcbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucy50YXJnZXQpIHtcbiAgICAgIHRocm93RXJyb3IoJ3lvdSBjYW5ub3Qgc2V0IHRoZSB0YXJnZXQgdmFsdWUgb2YgYW4gZXZlbnQuIFNlZSB0aGUgbm90ZXMgc2VjdGlvbiBvZiB0aGUgZG9jcyBmb3IgbW9yZSBkZXRhaWxz4oCUaHR0cHM6Ly92dWUtdGVzdC11dGlscy52dWVqcy5vcmcvZW4vYXBpL3dyYXBwZXIvdHJpZ2dlci5odG1sJylcbiAgICB9XG5cbiAgICBjb25zdCBtb2RpZmllcnMgPSB7XG4gICAgICBlbnRlcjogMTMsXG4gICAgICB0YWI6IDksXG4gICAgICBkZWxldGU6IDQ2LFxuICAgICAgZXNjOiAyNyxcbiAgICAgIHNwYWNlOiAzMixcbiAgICAgIHVwOiAzOCxcbiAgICAgIGRvd246IDQwLFxuICAgICAgbGVmdDogMzcsXG4gICAgICByaWdodDogMzksXG4gICAgICBlbmQ6IDM1LFxuICAgICAgaG9tZTogMzYsXG4gICAgICBiYWNrc3BhY2U6IDgsXG4gICAgICBpbnNlcnQ6IDQ1LFxuICAgICAgcGFnZXVwOiAzMyxcbiAgICAgIHBhZ2Vkb3duOiAzNFxuICAgIH1cblxuICAgIGNvbnN0IGV2ZW50ID0gdHlwZS5zcGxpdCgnLicpXG5cbiAgICBsZXQgZXZlbnRPYmplY3RcblxuICAgIC8vIEZhbGxiYWNrIGZvciBJRTEwLDExIC0gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMjY1OTYxMjNcbiAgICBpZiAodHlwZW9mICh3aW5kb3cuRXZlbnQpID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBldmVudE9iamVjdCA9IG5ldyB3aW5kb3cuRXZlbnQoZXZlbnRbMF0sIHtcbiAgICAgICAgYnViYmxlczogdHJ1ZSxcbiAgICAgICAgY2FuY2VsYWJsZTogdHJ1ZVxuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgZXZlbnRPYmplY3QgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnRXZlbnQnKVxuICAgICAgZXZlbnRPYmplY3QuaW5pdEV2ZW50KGV2ZW50WzBdLCB0cnVlLCB0cnVlKVxuICAgIH1cblxuICAgIGlmIChvcHRpb25zKSB7XG4gICAgICBPYmplY3Qua2V5cyhvcHRpb25zKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICAgIC8vICRGbG93SWdub3JlXG4gICAgICAgIGV2ZW50T2JqZWN0W2tleV0gPSBvcHRpb25zW2tleV1cbiAgICAgIH0pXG4gICAgfVxuXG4gICAgaWYgKGV2ZW50Lmxlbmd0aCA9PT0gMikge1xuICAgICAgLy8gJEZsb3dJZ25vcmVcbiAgICAgIGV2ZW50T2JqZWN0LmtleUNvZGUgPSBtb2RpZmllcnNbZXZlbnRbMV1dXG4gICAgfVxuXG4gICAgdGhpcy5lbGVtZW50LmRpc3BhdGNoRXZlbnQoZXZlbnRPYmplY3QpXG4gICAgdGhpcy51cGRhdGUoKVxuICB9XG59XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgeyBjb21waWxlVG9GdW5jdGlvbnMgfSBmcm9tICd2dWUtdGVtcGxhdGUtY29tcGlsZXInXG5pbXBvcnQgeyB0aHJvd0Vycm9yIH0gZnJvbSAnLi91dGlsJ1xuXG5mdW5jdGlvbiBpc1ZhbGlkU2xvdCAoc2xvdDogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiBBcnJheS5pc0FycmF5KHNsb3QpIHx8IChzbG90ICE9PSBudWxsICYmIHR5cGVvZiBzbG90ID09PSAnb2JqZWN0JykgfHwgdHlwZW9mIHNsb3QgPT09ICdzdHJpbmcnXG59XG5cbmZ1bmN0aW9uIGFkZFNsb3RUb1ZtICh2bTogQ29tcG9uZW50LCBzbG90TmFtZTogc3RyaW5nLCBzbG90VmFsdWU6IENvbXBvbmVudCB8IHN0cmluZyB8IEFycmF5PENvbXBvbmVudD4gfCBBcnJheTxzdHJpbmc+KTogdm9pZCB7XG4gIGxldCBlbGVtXG4gIGlmICh0eXBlb2Ygc2xvdFZhbHVlID09PSAnc3RyaW5nJykge1xuICAgIGlmICghY29tcGlsZVRvRnVuY3Rpb25zKSB7XG4gICAgICB0aHJvd0Vycm9yKCd2dWVUZW1wbGF0ZUNvbXBpbGVyIGlzIHVuZGVmaW5lZCwgeW91IG11c3QgcGFzcyBjb21wb25lbnRzIGV4cGxpY2l0bHkgaWYgdnVlLXRlbXBsYXRlLWNvbXBpbGVyIGlzIHVuZGVmaW5lZCcpXG4gICAgfVxuICAgIGlmICh3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvUGhhbnRvbUpTL2kpKSB7XG4gICAgICB0aHJvd0Vycm9yKCdvcHRpb24uc2xvdHMgZG9lcyBub3Qgc3VwcG9ydCBzdHJpbmdzIGluIFBoYW50b21KUy4gUGxlYXNlIHVzZSBQdXBwZXRlZXIsIG9yIHBhc3MgYSBjb21wb25lbnQnKVxuICAgIH1cbiAgICBjb25zdCBkb21QYXJzZXIgPSBuZXcgd2luZG93LkRPTVBhcnNlcigpXG4gICAgY29uc3QgZG9jdW1lbnQgPSBkb21QYXJzZXIucGFyc2VGcm9tU3RyaW5nKHNsb3RWYWx1ZSwgJ3RleHQvaHRtbCcpXG4gICAgY29uc3QgX3Nsb3RWYWx1ZSA9IHNsb3RWYWx1ZS50cmltKClcbiAgICBpZiAoX3Nsb3RWYWx1ZVswXSA9PT0gJzwnICYmIF9zbG90VmFsdWVbX3Nsb3RWYWx1ZS5sZW5ndGggLSAxXSA9PT0gJz4nICYmIGRvY3VtZW50LmJvZHkuY2hpbGRFbGVtZW50Q291bnQgPT09IDEpIHtcbiAgICAgIGVsZW0gPSB2bS4kY3JlYXRlRWxlbWVudChjb21waWxlVG9GdW5jdGlvbnMoc2xvdFZhbHVlKSlcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgY29tcGlsZWRSZXN1bHQgPSBjb21waWxlVG9GdW5jdGlvbnMoYDxkaXY+JHtzbG90VmFsdWV9e3sgfX08L2Rpdj5gKVxuICAgICAgY29uc3QgX3N0YXRpY1JlbmRlckZucyA9IHZtLl9yZW5kZXJQcm94eS4kb3B0aW9ucy5zdGF0aWNSZW5kZXJGbnNcbiAgICAgIHZtLl9yZW5kZXJQcm94eS4kb3B0aW9ucy5zdGF0aWNSZW5kZXJGbnMgPSBjb21waWxlZFJlc3VsdC5zdGF0aWNSZW5kZXJGbnNcbiAgICAgIGVsZW0gPSBjb21waWxlZFJlc3VsdC5yZW5kZXIuY2FsbCh2bS5fcmVuZGVyUHJveHksIHZtLiRjcmVhdGVFbGVtZW50KS5jaGlsZHJlblxuICAgICAgdm0uX3JlbmRlclByb3h5LiRvcHRpb25zLnN0YXRpY1JlbmRlckZucyA9IF9zdGF0aWNSZW5kZXJGbnNcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgZWxlbSA9IHZtLiRjcmVhdGVFbGVtZW50KHNsb3RWYWx1ZSlcbiAgfVxuICBpZiAoQXJyYXkuaXNBcnJheShlbGVtKSkge1xuICAgIGlmIChBcnJheS5pc0FycmF5KHZtLiRzbG90c1tzbG90TmFtZV0pKSB7XG4gICAgICB2bS4kc2xvdHNbc2xvdE5hbWVdID0gWy4uLnZtLiRzbG90c1tzbG90TmFtZV0sIC4uLmVsZW1dXG4gICAgfSBlbHNlIHtcbiAgICAgIHZtLiRzbG90c1tzbG90TmFtZV0gPSBbLi4uZWxlbV1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkodm0uJHNsb3RzW3Nsb3ROYW1lXSkpIHtcbiAgICAgIHZtLiRzbG90c1tzbG90TmFtZV0ucHVzaChlbGVtKVxuICAgIH0gZWxzZSB7XG4gICAgICB2bS4kc2xvdHNbc2xvdE5hbWVdID0gW2VsZW1dXG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGFkZFNsb3RzICh2bTogQ29tcG9uZW50LCBzbG90czogT2JqZWN0KTogdm9pZCB7XG4gIE9iamVjdC5rZXlzKHNsb3RzKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICBpZiAoIWlzVmFsaWRTbG90KHNsb3RzW2tleV0pKSB7XG4gICAgICB0aHJvd0Vycm9yKCdzbG90c1trZXldIG11c3QgYmUgYSBDb21wb25lbnQsIHN0cmluZyBvciBhbiBhcnJheSBvZiBDb21wb25lbnRzJylcbiAgICB9XG5cbiAgICBpZiAoQXJyYXkuaXNBcnJheShzbG90c1trZXldKSkge1xuICAgICAgc2xvdHNba2V5XS5mb3JFYWNoKChzbG90VmFsdWUpID0+IHtcbiAgICAgICAgYWRkU2xvdFRvVm0odm0sIGtleSwgc2xvdFZhbHVlKVxuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgYWRkU2xvdFRvVm0odm0sIGtleSwgc2xvdHNba2V5XSlcbiAgICB9XG4gIH0pXG59XG5cbmV4cG9ydCBkZWZhdWx0IGFkZFNsb3RzXG4iLCIvKipcbiAqIFJlbW92ZXMgYWxsIGtleS12YWx1ZSBlbnRyaWVzIGZyb20gdGhlIGxpc3QgY2FjaGUuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGNsZWFyXG4gKiBAbWVtYmVyT2YgTGlzdENhY2hlXG4gKi9cbmZ1bmN0aW9uIGxpc3RDYWNoZUNsZWFyKCkge1xuICB0aGlzLl9fZGF0YV9fID0gW107XG4gIHRoaXMuc2l6ZSA9IDA7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbGlzdENhY2hlQ2xlYXI7XG4iLCIvKipcbiAqIFBlcmZvcm1zIGFcbiAqIFtgU2FtZVZhbHVlWmVyb2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLXNhbWV2YWx1ZXplcm8pXG4gKiBjb21wYXJpc29uIGJldHdlZW4gdHdvIHZhbHVlcyB0byBkZXRlcm1pbmUgaWYgdGhleSBhcmUgZXF1aXZhbGVudC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY29tcGFyZS5cbiAqIEBwYXJhbSB7Kn0gb3RoZXIgVGhlIG90aGVyIHZhbHVlIHRvIGNvbXBhcmUuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIHZhbHVlcyBhcmUgZXF1aXZhbGVudCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgb2JqZWN0ID0geyAnYSc6IDEgfTtcbiAqIHZhciBvdGhlciA9IHsgJ2EnOiAxIH07XG4gKlxuICogXy5lcShvYmplY3QsIG9iamVjdCk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5lcShvYmplY3QsIG90aGVyKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5lcSgnYScsICdhJyk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5lcSgnYScsIE9iamVjdCgnYScpKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5lcShOYU4sIE5hTik7XG4gKiAvLyA9PiB0cnVlXG4gKi9cbmZ1bmN0aW9uIGVxKHZhbHVlLCBvdGhlcikge1xuICByZXR1cm4gdmFsdWUgPT09IG90aGVyIHx8ICh2YWx1ZSAhPT0gdmFsdWUgJiYgb3RoZXIgIT09IG90aGVyKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBlcTtcbiIsInZhciBlcSA9IHJlcXVpcmUoJy4vZXEnKTtcblxuLyoqXG4gKiBHZXRzIHRoZSBpbmRleCBhdCB3aGljaCB0aGUgYGtleWAgaXMgZm91bmQgaW4gYGFycmF5YCBvZiBrZXktdmFsdWUgcGFpcnMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBpbnNwZWN0LlxuICogQHBhcmFtIHsqfSBrZXkgVGhlIGtleSB0byBzZWFyY2ggZm9yLlxuICogQHJldHVybnMge251bWJlcn0gUmV0dXJucyB0aGUgaW5kZXggb2YgdGhlIG1hdGNoZWQgdmFsdWUsIGVsc2UgYC0xYC5cbiAqL1xuZnVuY3Rpb24gYXNzb2NJbmRleE9mKGFycmF5LCBrZXkpIHtcbiAgdmFyIGxlbmd0aCA9IGFycmF5Lmxlbmd0aDtcbiAgd2hpbGUgKGxlbmd0aC0tKSB7XG4gICAgaWYgKGVxKGFycmF5W2xlbmd0aF1bMF0sIGtleSkpIHtcbiAgICAgIHJldHVybiBsZW5ndGg7XG4gICAgfVxuICB9XG4gIHJldHVybiAtMTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBhc3NvY0luZGV4T2Y7XG4iLCJ2YXIgYXNzb2NJbmRleE9mID0gcmVxdWlyZSgnLi9fYXNzb2NJbmRleE9mJyk7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBhcnJheVByb3RvID0gQXJyYXkucHJvdG90eXBlO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBzcGxpY2UgPSBhcnJheVByb3RvLnNwbGljZTtcblxuLyoqXG4gKiBSZW1vdmVzIGBrZXlgIGFuZCBpdHMgdmFsdWUgZnJvbSB0aGUgbGlzdCBjYWNoZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgZGVsZXRlXG4gKiBAbWVtYmVyT2YgTGlzdENhY2hlXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIHJlbW92ZS5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgZW50cnkgd2FzIHJlbW92ZWQsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gbGlzdENhY2hlRGVsZXRlKGtleSkge1xuICB2YXIgZGF0YSA9IHRoaXMuX19kYXRhX18sXG4gICAgICBpbmRleCA9IGFzc29jSW5kZXhPZihkYXRhLCBrZXkpO1xuXG4gIGlmIChpbmRleCA8IDApIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgdmFyIGxhc3RJbmRleCA9IGRhdGEubGVuZ3RoIC0gMTtcbiAgaWYgKGluZGV4ID09IGxhc3RJbmRleCkge1xuICAgIGRhdGEucG9wKCk7XG4gIH0gZWxzZSB7XG4gICAgc3BsaWNlLmNhbGwoZGF0YSwgaW5kZXgsIDEpO1xuICB9XG4gIC0tdGhpcy5zaXplO1xuICByZXR1cm4gdHJ1ZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBsaXN0Q2FjaGVEZWxldGU7XG4iLCJ2YXIgYXNzb2NJbmRleE9mID0gcmVxdWlyZSgnLi9fYXNzb2NJbmRleE9mJyk7XG5cbi8qKlxuICogR2V0cyB0aGUgbGlzdCBjYWNoZSB2YWx1ZSBmb3IgYGtleWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGdldFxuICogQG1lbWJlck9mIExpc3RDYWNoZVxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byBnZXQuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgZW50cnkgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIGxpc3RDYWNoZUdldChrZXkpIHtcbiAgdmFyIGRhdGEgPSB0aGlzLl9fZGF0YV9fLFxuICAgICAgaW5kZXggPSBhc3NvY0luZGV4T2YoZGF0YSwga2V5KTtcblxuICByZXR1cm4gaW5kZXggPCAwID8gdW5kZWZpbmVkIDogZGF0YVtpbmRleF1bMV07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbGlzdENhY2hlR2V0O1xuIiwidmFyIGFzc29jSW5kZXhPZiA9IHJlcXVpcmUoJy4vX2Fzc29jSW5kZXhPZicpO1xuXG4vKipcbiAqIENoZWNrcyBpZiBhIGxpc3QgY2FjaGUgdmFsdWUgZm9yIGBrZXlgIGV4aXN0cy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgaGFzXG4gKiBAbWVtYmVyT2YgTGlzdENhY2hlXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIGVudHJ5IHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGFuIGVudHJ5IGZvciBga2V5YCBleGlzdHMsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gbGlzdENhY2hlSGFzKGtleSkge1xuICByZXR1cm4gYXNzb2NJbmRleE9mKHRoaXMuX19kYXRhX18sIGtleSkgPiAtMTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBsaXN0Q2FjaGVIYXM7XG4iLCJ2YXIgYXNzb2NJbmRleE9mID0gcmVxdWlyZSgnLi9fYXNzb2NJbmRleE9mJyk7XG5cbi8qKlxuICogU2V0cyB0aGUgbGlzdCBjYWNoZSBga2V5YCB0byBgdmFsdWVgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBzZXRcbiAqIEBtZW1iZXJPZiBMaXN0Q2FjaGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gc2V0LlxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gc2V0LlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgbGlzdCBjYWNoZSBpbnN0YW5jZS5cbiAqL1xuZnVuY3Rpb24gbGlzdENhY2hlU2V0KGtleSwgdmFsdWUpIHtcbiAgdmFyIGRhdGEgPSB0aGlzLl9fZGF0YV9fLFxuICAgICAgaW5kZXggPSBhc3NvY0luZGV4T2YoZGF0YSwga2V5KTtcblxuICBpZiAoaW5kZXggPCAwKSB7XG4gICAgKyt0aGlzLnNpemU7XG4gICAgZGF0YS5wdXNoKFtrZXksIHZhbHVlXSk7XG4gIH0gZWxzZSB7XG4gICAgZGF0YVtpbmRleF1bMV0gPSB2YWx1ZTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBsaXN0Q2FjaGVTZXQ7XG4iLCJ2YXIgbGlzdENhY2hlQ2xlYXIgPSByZXF1aXJlKCcuL19saXN0Q2FjaGVDbGVhcicpLFxuICAgIGxpc3RDYWNoZURlbGV0ZSA9IHJlcXVpcmUoJy4vX2xpc3RDYWNoZURlbGV0ZScpLFxuICAgIGxpc3RDYWNoZUdldCA9IHJlcXVpcmUoJy4vX2xpc3RDYWNoZUdldCcpLFxuICAgIGxpc3RDYWNoZUhhcyA9IHJlcXVpcmUoJy4vX2xpc3RDYWNoZUhhcycpLFxuICAgIGxpc3RDYWNoZVNldCA9IHJlcXVpcmUoJy4vX2xpc3RDYWNoZVNldCcpO1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gbGlzdCBjYWNoZSBvYmplY3QuXG4gKlxuICogQHByaXZhdGVcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtBcnJheX0gW2VudHJpZXNdIFRoZSBrZXktdmFsdWUgcGFpcnMgdG8gY2FjaGUuXG4gKi9cbmZ1bmN0aW9uIExpc3RDYWNoZShlbnRyaWVzKSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gZW50cmllcyA9PSBudWxsID8gMCA6IGVudHJpZXMubGVuZ3RoO1xuXG4gIHRoaXMuY2xlYXIoKTtcbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICB2YXIgZW50cnkgPSBlbnRyaWVzW2luZGV4XTtcbiAgICB0aGlzLnNldChlbnRyeVswXSwgZW50cnlbMV0pO1xuICB9XG59XG5cbi8vIEFkZCBtZXRob2RzIHRvIGBMaXN0Q2FjaGVgLlxuTGlzdENhY2hlLnByb3RvdHlwZS5jbGVhciA9IGxpc3RDYWNoZUNsZWFyO1xuTGlzdENhY2hlLnByb3RvdHlwZVsnZGVsZXRlJ10gPSBsaXN0Q2FjaGVEZWxldGU7XG5MaXN0Q2FjaGUucHJvdG90eXBlLmdldCA9IGxpc3RDYWNoZUdldDtcbkxpc3RDYWNoZS5wcm90b3R5cGUuaGFzID0gbGlzdENhY2hlSGFzO1xuTGlzdENhY2hlLnByb3RvdHlwZS5zZXQgPSBsaXN0Q2FjaGVTZXQ7XG5cbm1vZHVsZS5leHBvcnRzID0gTGlzdENhY2hlO1xuIiwidmFyIExpc3RDYWNoZSA9IHJlcXVpcmUoJy4vX0xpc3RDYWNoZScpO1xuXG4vKipcbiAqIFJlbW92ZXMgYWxsIGtleS12YWx1ZSBlbnRyaWVzIGZyb20gdGhlIHN0YWNrLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBjbGVhclxuICogQG1lbWJlck9mIFN0YWNrXG4gKi9cbmZ1bmN0aW9uIHN0YWNrQ2xlYXIoKSB7XG4gIHRoaXMuX19kYXRhX18gPSBuZXcgTGlzdENhY2hlO1xuICB0aGlzLnNpemUgPSAwO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHN0YWNrQ2xlYXI7XG4iLCIvKipcbiAqIFJlbW92ZXMgYGtleWAgYW5kIGl0cyB2YWx1ZSBmcm9tIHRoZSBzdGFjay5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgZGVsZXRlXG4gKiBAbWVtYmVyT2YgU3RhY2tcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gcmVtb3ZlLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBlbnRyeSB3YXMgcmVtb3ZlZCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBzdGFja0RlbGV0ZShrZXkpIHtcbiAgdmFyIGRhdGEgPSB0aGlzLl9fZGF0YV9fLFxuICAgICAgcmVzdWx0ID0gZGF0YVsnZGVsZXRlJ10oa2V5KTtcblxuICB0aGlzLnNpemUgPSBkYXRhLnNpemU7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc3RhY2tEZWxldGU7XG4iLCIvKipcbiAqIEdldHMgdGhlIHN0YWNrIHZhbHVlIGZvciBga2V5YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgZ2V0XG4gKiBAbWVtYmVyT2YgU3RhY2tcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gZ2V0LlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIGVudHJ5IHZhbHVlLlxuICovXG5mdW5jdGlvbiBzdGFja0dldChrZXkpIHtcbiAgcmV0dXJuIHRoaXMuX19kYXRhX18uZ2V0KGtleSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc3RhY2tHZXQ7XG4iLCIvKipcbiAqIENoZWNrcyBpZiBhIHN0YWNrIHZhbHVlIGZvciBga2V5YCBleGlzdHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGhhc1xuICogQG1lbWJlck9mIFN0YWNrXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIGVudHJ5IHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGFuIGVudHJ5IGZvciBga2V5YCBleGlzdHMsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gc3RhY2tIYXMoa2V5KSB7XG4gIHJldHVybiB0aGlzLl9fZGF0YV9fLmhhcyhrZXkpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHN0YWNrSGFzO1xuIiwiLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBnbG9iYWxgIGZyb20gTm9kZS5qcy4gKi9cbnZhciBmcmVlR2xvYmFsID0gdHlwZW9mIGdsb2JhbCA9PSAnb2JqZWN0JyAmJiBnbG9iYWwgJiYgZ2xvYmFsLk9iamVjdCA9PT0gT2JqZWN0ICYmIGdsb2JhbDtcblxubW9kdWxlLmV4cG9ydHMgPSBmcmVlR2xvYmFsO1xuIiwidmFyIGZyZWVHbG9iYWwgPSByZXF1aXJlKCcuL19mcmVlR2xvYmFsJyk7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgc2VsZmAuICovXG52YXIgZnJlZVNlbGYgPSB0eXBlb2Ygc2VsZiA9PSAnb2JqZWN0JyAmJiBzZWxmICYmIHNlbGYuT2JqZWN0ID09PSBPYmplY3QgJiYgc2VsZjtcblxuLyoqIFVzZWQgYXMgYSByZWZlcmVuY2UgdG8gdGhlIGdsb2JhbCBvYmplY3QuICovXG52YXIgcm9vdCA9IGZyZWVHbG9iYWwgfHwgZnJlZVNlbGYgfHwgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcblxubW9kdWxlLmV4cG9ydHMgPSByb290O1xuIiwidmFyIHJvb3QgPSByZXF1aXJlKCcuL19yb290Jyk7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIFN5bWJvbCA9IHJvb3QuU3ltYm9sO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFN5bWJvbDtcbiIsInZhciBTeW1ib2wgPSByZXF1aXJlKCcuL19TeW1ib2wnKTtcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBVc2VkIHRvIHJlc29sdmUgdGhlXG4gKiBbYHRvU3RyaW5nVGFnYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtb2JqZWN0LnByb3RvdHlwZS50b3N0cmluZylcbiAqIG9mIHZhbHVlcy5cbiAqL1xudmFyIG5hdGl2ZU9iamVjdFRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIHN5bVRvU3RyaW5nVGFnID0gU3ltYm9sID8gU3ltYm9sLnRvU3RyaW5nVGFnIDogdW5kZWZpbmVkO1xuXG4vKipcbiAqIEEgc3BlY2lhbGl6ZWQgdmVyc2lvbiBvZiBgYmFzZUdldFRhZ2Agd2hpY2ggaWdub3JlcyBgU3ltYm9sLnRvU3RyaW5nVGFnYCB2YWx1ZXMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHF1ZXJ5LlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgcmF3IGB0b1N0cmluZ1RhZ2AuXG4gKi9cbmZ1bmN0aW9uIGdldFJhd1RhZyh2YWx1ZSkge1xuICB2YXIgaXNPd24gPSBoYXNPd25Qcm9wZXJ0eS5jYWxsKHZhbHVlLCBzeW1Ub1N0cmluZ1RhZyksXG4gICAgICB0YWcgPSB2YWx1ZVtzeW1Ub1N0cmluZ1RhZ107XG5cbiAgdHJ5IHtcbiAgICB2YWx1ZVtzeW1Ub1N0cmluZ1RhZ10gPSB1bmRlZmluZWQ7XG4gICAgdmFyIHVubWFza2VkID0gdHJ1ZTtcbiAgfSBjYXRjaCAoZSkge31cblxuICB2YXIgcmVzdWx0ID0gbmF0aXZlT2JqZWN0VG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG4gIGlmICh1bm1hc2tlZCkge1xuICAgIGlmIChpc093bikge1xuICAgICAgdmFsdWVbc3ltVG9TdHJpbmdUYWddID0gdGFnO1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWxldGUgdmFsdWVbc3ltVG9TdHJpbmdUYWddO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldFJhd1RhZztcbiIsIi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKlxuICogVXNlZCB0byByZXNvbHZlIHRoZVxuICogW2B0b1N0cmluZ1RhZ2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLW9iamVjdC5wcm90b3R5cGUudG9zdHJpbmcpXG4gKiBvZiB2YWx1ZXMuXG4gKi9cbnZhciBuYXRpdmVPYmplY3RUb1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xuXG4vKipcbiAqIENvbnZlcnRzIGB2YWx1ZWAgdG8gYSBzdHJpbmcgdXNpbmcgYE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmdgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjb252ZXJ0LlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgY29udmVydGVkIHN0cmluZy5cbiAqL1xuZnVuY3Rpb24gb2JqZWN0VG9TdHJpbmcodmFsdWUpIHtcbiAgcmV0dXJuIG5hdGl2ZU9iamVjdFRvU3RyaW5nLmNhbGwodmFsdWUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG9iamVjdFRvU3RyaW5nO1xuIiwidmFyIFN5bWJvbCA9IHJlcXVpcmUoJy4vX1N5bWJvbCcpLFxuICAgIGdldFJhd1RhZyA9IHJlcXVpcmUoJy4vX2dldFJhd1RhZycpLFxuICAgIG9iamVjdFRvU3RyaW5nID0gcmVxdWlyZSgnLi9fb2JqZWN0VG9TdHJpbmcnKTtcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIG51bGxUYWcgPSAnW29iamVjdCBOdWxsXScsXG4gICAgdW5kZWZpbmVkVGFnID0gJ1tvYmplY3QgVW5kZWZpbmVkXSc7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIHN5bVRvU3RyaW5nVGFnID0gU3ltYm9sID8gU3ltYm9sLnRvU3RyaW5nVGFnIDogdW5kZWZpbmVkO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBnZXRUYWdgIHdpdGhvdXQgZmFsbGJhY2tzIGZvciBidWdneSBlbnZpcm9ubWVudHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHF1ZXJ5LlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgYHRvU3RyaW5nVGFnYC5cbiAqL1xuZnVuY3Rpb24gYmFzZUdldFRhZyh2YWx1ZSkge1xuICBpZiAodmFsdWUgPT0gbnVsbCkge1xuICAgIHJldHVybiB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gdW5kZWZpbmVkVGFnIDogbnVsbFRhZztcbiAgfVxuICByZXR1cm4gKHN5bVRvU3RyaW5nVGFnICYmIHN5bVRvU3RyaW5nVGFnIGluIE9iamVjdCh2YWx1ZSkpXG4gICAgPyBnZXRSYXdUYWcodmFsdWUpXG4gICAgOiBvYmplY3RUb1N0cmluZyh2YWx1ZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUdldFRhZztcbiIsIi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgdGhlXG4gKiBbbGFuZ3VhZ2UgdHlwZV0oaHR0cDovL3d3dy5lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLWVjbWFzY3JpcHQtbGFuZ3VhZ2UtdHlwZXMpXG4gKiBvZiBgT2JqZWN0YC4gKGUuZy4gYXJyYXlzLCBmdW5jdGlvbnMsIG9iamVjdHMsIHJlZ2V4ZXMsIGBuZXcgTnVtYmVyKDApYCwgYW5kIGBuZXcgU3RyaW5nKCcnKWApXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYW4gb2JqZWN0LCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNPYmplY3Qoe30pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KF8ubm9vcCk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChudWxsKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0KHZhbHVlKSB7XG4gIHZhciB0eXBlID0gdHlwZW9mIHZhbHVlO1xuICByZXR1cm4gdmFsdWUgIT0gbnVsbCAmJiAodHlwZSA9PSAnb2JqZWN0JyB8fCB0eXBlID09ICdmdW5jdGlvbicpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzT2JqZWN0O1xuIiwidmFyIGJhc2VHZXRUYWcgPSByZXF1aXJlKCcuL19iYXNlR2V0VGFnJyksXG4gICAgaXNPYmplY3QgPSByZXF1aXJlKCcuL2lzT2JqZWN0Jyk7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBhc3luY1RhZyA9ICdbb2JqZWN0IEFzeW5jRnVuY3Rpb25dJyxcbiAgICBmdW5jVGFnID0gJ1tvYmplY3QgRnVuY3Rpb25dJyxcbiAgICBnZW5UYWcgPSAnW29iamVjdCBHZW5lcmF0b3JGdW5jdGlvbl0nLFxuICAgIHByb3h5VGFnID0gJ1tvYmplY3QgUHJveHldJztcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBjbGFzc2lmaWVkIGFzIGEgYEZ1bmN0aW9uYCBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBmdW5jdGlvbiwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzRnVuY3Rpb24oXyk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0Z1bmN0aW9uKC9hYmMvKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzRnVuY3Rpb24odmFsdWUpIHtcbiAgaWYgKCFpc09iamVjdCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgLy8gVGhlIHVzZSBvZiBgT2JqZWN0I3RvU3RyaW5nYCBhdm9pZHMgaXNzdWVzIHdpdGggdGhlIGB0eXBlb2ZgIG9wZXJhdG9yXG4gIC8vIGluIFNhZmFyaSA5IHdoaWNoIHJldHVybnMgJ29iamVjdCcgZm9yIHR5cGVkIGFycmF5cyBhbmQgb3RoZXIgY29uc3RydWN0b3JzLlxuICB2YXIgdGFnID0gYmFzZUdldFRhZyh2YWx1ZSk7XG4gIHJldHVybiB0YWcgPT0gZnVuY1RhZyB8fCB0YWcgPT0gZ2VuVGFnIHx8IHRhZyA9PSBhc3luY1RhZyB8fCB0YWcgPT0gcHJveHlUYWc7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNGdW5jdGlvbjtcbiIsInZhciByb290ID0gcmVxdWlyZSgnLi9fcm9vdCcpO1xuXG4vKiogVXNlZCB0byBkZXRlY3Qgb3ZlcnJlYWNoaW5nIGNvcmUtanMgc2hpbXMuICovXG52YXIgY29yZUpzRGF0YSA9IHJvb3RbJ19fY29yZS1qc19zaGFyZWRfXyddO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNvcmVKc0RhdGE7XG4iLCJ2YXIgY29yZUpzRGF0YSA9IHJlcXVpcmUoJy4vX2NvcmVKc0RhdGEnKTtcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IG1ldGhvZHMgbWFzcXVlcmFkaW5nIGFzIG5hdGl2ZS4gKi9cbnZhciBtYXNrU3JjS2V5ID0gKGZ1bmN0aW9uKCkge1xuICB2YXIgdWlkID0gL1teLl0rJC8uZXhlYyhjb3JlSnNEYXRhICYmIGNvcmVKc0RhdGEua2V5cyAmJiBjb3JlSnNEYXRhLmtleXMuSUVfUFJPVE8gfHwgJycpO1xuICByZXR1cm4gdWlkID8gKCdTeW1ib2woc3JjKV8xLicgKyB1aWQpIDogJyc7XG59KCkpO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgZnVuY2AgaGFzIGl0cyBzb3VyY2UgbWFza2VkLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgZnVuY2AgaXMgbWFza2VkLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGlzTWFza2VkKGZ1bmMpIHtcbiAgcmV0dXJuICEhbWFza1NyY0tleSAmJiAobWFza1NyY0tleSBpbiBmdW5jKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc01hc2tlZDtcbiIsIi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBmdW5jUHJvdG8gPSBGdW5jdGlvbi5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIHJlc29sdmUgdGhlIGRlY29tcGlsZWQgc291cmNlIG9mIGZ1bmN0aW9ucy4gKi9cbnZhciBmdW5jVG9TdHJpbmcgPSBmdW5jUHJvdG8udG9TdHJpbmc7XG5cbi8qKlxuICogQ29udmVydHMgYGZ1bmNgIHRvIGl0cyBzb3VyY2UgY29kZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gY29udmVydC5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIHNvdXJjZSBjb2RlLlxuICovXG5mdW5jdGlvbiB0b1NvdXJjZShmdW5jKSB7XG4gIGlmIChmdW5jICE9IG51bGwpIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGZ1bmNUb1N0cmluZy5jYWxsKGZ1bmMpO1xuICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiAoZnVuYyArICcnKTtcbiAgICB9IGNhdGNoIChlKSB7fVxuICB9XG4gIHJldHVybiAnJztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB0b1NvdXJjZTtcbiIsInZhciBpc0Z1bmN0aW9uID0gcmVxdWlyZSgnLi9pc0Z1bmN0aW9uJyksXG4gICAgaXNNYXNrZWQgPSByZXF1aXJlKCcuL19pc01hc2tlZCcpLFxuICAgIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9pc09iamVjdCcpLFxuICAgIHRvU291cmNlID0gcmVxdWlyZSgnLi9fdG9Tb3VyY2UnKTtcblxuLyoqXG4gKiBVc2VkIHRvIG1hdGNoIGBSZWdFeHBgXG4gKiBbc3ludGF4IGNoYXJhY3RlcnNdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLXBhdHRlcm5zKS5cbiAqL1xudmFyIHJlUmVnRXhwQ2hhciA9IC9bXFxcXF4kLiorPygpW1xcXXt9fF0vZztcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IGhvc3QgY29uc3RydWN0b3JzIChTYWZhcmkpLiAqL1xudmFyIHJlSXNIb3N0Q3RvciA9IC9eXFxbb2JqZWN0IC4rP0NvbnN0cnVjdG9yXFxdJC87XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBmdW5jUHJvdG8gPSBGdW5jdGlvbi5wcm90b3R5cGUsXG4gICAgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byByZXNvbHZlIHRoZSBkZWNvbXBpbGVkIHNvdXJjZSBvZiBmdW5jdGlvbnMuICovXG52YXIgZnVuY1RvU3RyaW5nID0gZnVuY1Byb3RvLnRvU3RyaW5nO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKiogVXNlZCB0byBkZXRlY3QgaWYgYSBtZXRob2QgaXMgbmF0aXZlLiAqL1xudmFyIHJlSXNOYXRpdmUgPSBSZWdFeHAoJ14nICtcbiAgZnVuY1RvU3RyaW5nLmNhbGwoaGFzT3duUHJvcGVydHkpLnJlcGxhY2UocmVSZWdFeHBDaGFyLCAnXFxcXCQmJylcbiAgLnJlcGxhY2UoL2hhc093blByb3BlcnR5fChmdW5jdGlvbikuKj8oPz1cXFxcXFwoKXwgZm9yIC4rPyg/PVxcXFxcXF0pL2csICckMS4qPycpICsgJyQnXG4pO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmlzTmF0aXZlYCB3aXRob3V0IGJhZCBzaGltIGNoZWNrcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIG5hdGl2ZSBmdW5jdGlvbixcbiAqICBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGJhc2VJc05hdGl2ZSh2YWx1ZSkge1xuICBpZiAoIWlzT2JqZWN0KHZhbHVlKSB8fCBpc01hc2tlZCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgdmFyIHBhdHRlcm4gPSBpc0Z1bmN0aW9uKHZhbHVlKSA/IHJlSXNOYXRpdmUgOiByZUlzSG9zdEN0b3I7XG4gIHJldHVybiBwYXR0ZXJuLnRlc3QodG9Tb3VyY2UodmFsdWUpKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlSXNOYXRpdmU7XG4iLCIvKipcbiAqIEdldHMgdGhlIHZhbHVlIGF0IGBrZXlgIG9mIGBvYmplY3RgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gW29iamVjdF0gVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgcHJvcGVydHkgdG8gZ2V0LlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIHByb3BlcnR5IHZhbHVlLlxuICovXG5mdW5jdGlvbiBnZXRWYWx1ZShvYmplY3QsIGtleSkge1xuICByZXR1cm4gb2JqZWN0ID09IG51bGwgPyB1bmRlZmluZWQgOiBvYmplY3Rba2V5XTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZXRWYWx1ZTtcbiIsInZhciBiYXNlSXNOYXRpdmUgPSByZXF1aXJlKCcuL19iYXNlSXNOYXRpdmUnKSxcbiAgICBnZXRWYWx1ZSA9IHJlcXVpcmUoJy4vX2dldFZhbHVlJyk7XG5cbi8qKlxuICogR2V0cyB0aGUgbmF0aXZlIGZ1bmN0aW9uIGF0IGBrZXlgIG9mIGBvYmplY3RgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIG1ldGhvZCB0byBnZXQuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgZnVuY3Rpb24gaWYgaXQncyBuYXRpdmUsIGVsc2UgYHVuZGVmaW5lZGAuXG4gKi9cbmZ1bmN0aW9uIGdldE5hdGl2ZShvYmplY3QsIGtleSkge1xuICB2YXIgdmFsdWUgPSBnZXRWYWx1ZShvYmplY3QsIGtleSk7XG4gIHJldHVybiBiYXNlSXNOYXRpdmUodmFsdWUpID8gdmFsdWUgOiB1bmRlZmluZWQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0TmF0aXZlO1xuIiwidmFyIGdldE5hdGl2ZSA9IHJlcXVpcmUoJy4vX2dldE5hdGl2ZScpLFxuICAgIHJvb3QgPSByZXF1aXJlKCcuL19yb290Jyk7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIHRoYXQgYXJlIHZlcmlmaWVkIHRvIGJlIG5hdGl2ZS4gKi9cbnZhciBNYXAgPSBnZXROYXRpdmUocm9vdCwgJ01hcCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1hcDtcbiIsInZhciBnZXROYXRpdmUgPSByZXF1aXJlKCcuL19nZXROYXRpdmUnKTtcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgdGhhdCBhcmUgdmVyaWZpZWQgdG8gYmUgbmF0aXZlLiAqL1xudmFyIG5hdGl2ZUNyZWF0ZSA9IGdldE5hdGl2ZShPYmplY3QsICdjcmVhdGUnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBuYXRpdmVDcmVhdGU7XG4iLCJ2YXIgbmF0aXZlQ3JlYXRlID0gcmVxdWlyZSgnLi9fbmF0aXZlQ3JlYXRlJyk7XG5cbi8qKlxuICogUmVtb3ZlcyBhbGwga2V5LXZhbHVlIGVudHJpZXMgZnJvbSB0aGUgaGFzaC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgY2xlYXJcbiAqIEBtZW1iZXJPZiBIYXNoXG4gKi9cbmZ1bmN0aW9uIGhhc2hDbGVhcigpIHtcbiAgdGhpcy5fX2RhdGFfXyA9IG5hdGl2ZUNyZWF0ZSA/IG5hdGl2ZUNyZWF0ZShudWxsKSA6IHt9O1xuICB0aGlzLnNpemUgPSAwO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGhhc2hDbGVhcjtcbiIsIi8qKlxuICogUmVtb3ZlcyBga2V5YCBhbmQgaXRzIHZhbHVlIGZyb20gdGhlIGhhc2guXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGRlbGV0ZVxuICogQG1lbWJlck9mIEhhc2hcbiAqIEBwYXJhbSB7T2JqZWN0fSBoYXNoIFRoZSBoYXNoIHRvIG1vZGlmeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gcmVtb3ZlLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBlbnRyeSB3YXMgcmVtb3ZlZCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBoYXNoRGVsZXRlKGtleSkge1xuICB2YXIgcmVzdWx0ID0gdGhpcy5oYXMoa2V5KSAmJiBkZWxldGUgdGhpcy5fX2RhdGFfX1trZXldO1xuICB0aGlzLnNpemUgLT0gcmVzdWx0ID8gMSA6IDA7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaGFzaERlbGV0ZTtcbiIsInZhciBuYXRpdmVDcmVhdGUgPSByZXF1aXJlKCcuL19uYXRpdmVDcmVhdGUnKTtcblxuLyoqIFVzZWQgdG8gc3RhbmQtaW4gZm9yIGB1bmRlZmluZWRgIGhhc2ggdmFsdWVzLiAqL1xudmFyIEhBU0hfVU5ERUZJTkVEID0gJ19fbG9kYXNoX2hhc2hfdW5kZWZpbmVkX18nO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIEdldHMgdGhlIGhhc2ggdmFsdWUgZm9yIGBrZXlgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBnZXRcbiAqIEBtZW1iZXJPZiBIYXNoXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIGdldC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBlbnRyeSB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gaGFzaEdldChrZXkpIHtcbiAgdmFyIGRhdGEgPSB0aGlzLl9fZGF0YV9fO1xuICBpZiAobmF0aXZlQ3JlYXRlKSB7XG4gICAgdmFyIHJlc3VsdCA9IGRhdGFba2V5XTtcbiAgICByZXR1cm4gcmVzdWx0ID09PSBIQVNIX1VOREVGSU5FRCA/IHVuZGVmaW5lZCA6IHJlc3VsdDtcbiAgfVxuICByZXR1cm4gaGFzT3duUHJvcGVydHkuY2FsbChkYXRhLCBrZXkpID8gZGF0YVtrZXldIDogdW5kZWZpbmVkO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGhhc2hHZXQ7XG4iLCJ2YXIgbmF0aXZlQ3JlYXRlID0gcmVxdWlyZSgnLi9fbmF0aXZlQ3JlYXRlJyk7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGEgaGFzaCB2YWx1ZSBmb3IgYGtleWAgZXhpc3RzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBoYXNcbiAqIEBtZW1iZXJPZiBIYXNoXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIGVudHJ5IHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGFuIGVudHJ5IGZvciBga2V5YCBleGlzdHMsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaGFzaEhhcyhrZXkpIHtcbiAgdmFyIGRhdGEgPSB0aGlzLl9fZGF0YV9fO1xuICByZXR1cm4gbmF0aXZlQ3JlYXRlID8gKGRhdGFba2V5XSAhPT0gdW5kZWZpbmVkKSA6IGhhc093blByb3BlcnR5LmNhbGwoZGF0YSwga2V5KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBoYXNoSGFzO1xuIiwidmFyIG5hdGl2ZUNyZWF0ZSA9IHJlcXVpcmUoJy4vX25hdGl2ZUNyZWF0ZScpO1xuXG4vKiogVXNlZCB0byBzdGFuZC1pbiBmb3IgYHVuZGVmaW5lZGAgaGFzaCB2YWx1ZXMuICovXG52YXIgSEFTSF9VTkRFRklORUQgPSAnX19sb2Rhc2hfaGFzaF91bmRlZmluZWRfXyc7XG5cbi8qKlxuICogU2V0cyB0aGUgaGFzaCBga2V5YCB0byBgdmFsdWVgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBzZXRcbiAqIEBtZW1iZXJPZiBIYXNoXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIHNldC5cbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHNldC5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIGhhc2ggaW5zdGFuY2UuXG4gKi9cbmZ1bmN0aW9uIGhhc2hTZXQoa2V5LCB2YWx1ZSkge1xuICB2YXIgZGF0YSA9IHRoaXMuX19kYXRhX187XG4gIHRoaXMuc2l6ZSArPSB0aGlzLmhhcyhrZXkpID8gMCA6IDE7XG4gIGRhdGFba2V5XSA9IChuYXRpdmVDcmVhdGUgJiYgdmFsdWUgPT09IHVuZGVmaW5lZCkgPyBIQVNIX1VOREVGSU5FRCA6IHZhbHVlO1xuICByZXR1cm4gdGhpcztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBoYXNoU2V0O1xuIiwidmFyIGhhc2hDbGVhciA9IHJlcXVpcmUoJy4vX2hhc2hDbGVhcicpLFxuICAgIGhhc2hEZWxldGUgPSByZXF1aXJlKCcuL19oYXNoRGVsZXRlJyksXG4gICAgaGFzaEdldCA9IHJlcXVpcmUoJy4vX2hhc2hHZXQnKSxcbiAgICBoYXNoSGFzID0gcmVxdWlyZSgnLi9faGFzaEhhcycpLFxuICAgIGhhc2hTZXQgPSByZXF1aXJlKCcuL19oYXNoU2V0Jyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGhhc2ggb2JqZWN0LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7QXJyYXl9IFtlbnRyaWVzXSBUaGUga2V5LXZhbHVlIHBhaXJzIHRvIGNhY2hlLlxuICovXG5mdW5jdGlvbiBIYXNoKGVudHJpZXMpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBlbnRyaWVzID09IG51bGwgPyAwIDogZW50cmllcy5sZW5ndGg7XG5cbiAgdGhpcy5jbGVhcigpO1xuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIHZhciBlbnRyeSA9IGVudHJpZXNbaW5kZXhdO1xuICAgIHRoaXMuc2V0KGVudHJ5WzBdLCBlbnRyeVsxXSk7XG4gIH1cbn1cblxuLy8gQWRkIG1ldGhvZHMgdG8gYEhhc2hgLlxuSGFzaC5wcm90b3R5cGUuY2xlYXIgPSBoYXNoQ2xlYXI7XG5IYXNoLnByb3RvdHlwZVsnZGVsZXRlJ10gPSBoYXNoRGVsZXRlO1xuSGFzaC5wcm90b3R5cGUuZ2V0ID0gaGFzaEdldDtcbkhhc2gucHJvdG90eXBlLmhhcyA9IGhhc2hIYXM7XG5IYXNoLnByb3RvdHlwZS5zZXQgPSBoYXNoU2V0O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEhhc2g7XG4iLCJ2YXIgSGFzaCA9IHJlcXVpcmUoJy4vX0hhc2gnKSxcbiAgICBMaXN0Q2FjaGUgPSByZXF1aXJlKCcuL19MaXN0Q2FjaGUnKSxcbiAgICBNYXAgPSByZXF1aXJlKCcuL19NYXAnKTtcblxuLyoqXG4gKiBSZW1vdmVzIGFsbCBrZXktdmFsdWUgZW50cmllcyBmcm9tIHRoZSBtYXAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGNsZWFyXG4gKiBAbWVtYmVyT2YgTWFwQ2FjaGVcbiAqL1xuZnVuY3Rpb24gbWFwQ2FjaGVDbGVhcigpIHtcbiAgdGhpcy5zaXplID0gMDtcbiAgdGhpcy5fX2RhdGFfXyA9IHtcbiAgICAnaGFzaCc6IG5ldyBIYXNoLFxuICAgICdtYXAnOiBuZXcgKE1hcCB8fCBMaXN0Q2FjaGUpLFxuICAgICdzdHJpbmcnOiBuZXcgSGFzaFxuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG1hcENhY2hlQ2xlYXI7XG4iLCIvKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIHN1aXRhYmxlIGZvciB1c2UgYXMgdW5pcXVlIG9iamVjdCBrZXkuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgc3VpdGFibGUsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaXNLZXlhYmxlKHZhbHVlKSB7XG4gIHZhciB0eXBlID0gdHlwZW9mIHZhbHVlO1xuICByZXR1cm4gKHR5cGUgPT0gJ3N0cmluZycgfHwgdHlwZSA9PSAnbnVtYmVyJyB8fCB0eXBlID09ICdzeW1ib2wnIHx8IHR5cGUgPT0gJ2Jvb2xlYW4nKVxuICAgID8gKHZhbHVlICE9PSAnX19wcm90b19fJylcbiAgICA6ICh2YWx1ZSA9PT0gbnVsbCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNLZXlhYmxlO1xuIiwidmFyIGlzS2V5YWJsZSA9IHJlcXVpcmUoJy4vX2lzS2V5YWJsZScpO1xuXG4vKipcbiAqIEdldHMgdGhlIGRhdGEgZm9yIGBtYXBgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gbWFwIFRoZSBtYXAgdG8gcXVlcnkuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSByZWZlcmVuY2Uga2V5LlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIG1hcCBkYXRhLlxuICovXG5mdW5jdGlvbiBnZXRNYXBEYXRhKG1hcCwga2V5KSB7XG4gIHZhciBkYXRhID0gbWFwLl9fZGF0YV9fO1xuICByZXR1cm4gaXNLZXlhYmxlKGtleSlcbiAgICA/IGRhdGFbdHlwZW9mIGtleSA9PSAnc3RyaW5nJyA/ICdzdHJpbmcnIDogJ2hhc2gnXVxuICAgIDogZGF0YS5tYXA7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0TWFwRGF0YTtcbiIsInZhciBnZXRNYXBEYXRhID0gcmVxdWlyZSgnLi9fZ2V0TWFwRGF0YScpO1xuXG4vKipcbiAqIFJlbW92ZXMgYGtleWAgYW5kIGl0cyB2YWx1ZSBmcm9tIHRoZSBtYXAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGRlbGV0ZVxuICogQG1lbWJlck9mIE1hcENhY2hlXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIHJlbW92ZS5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgZW50cnkgd2FzIHJlbW92ZWQsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gbWFwQ2FjaGVEZWxldGUoa2V5KSB7XG4gIHZhciByZXN1bHQgPSBnZXRNYXBEYXRhKHRoaXMsIGtleSlbJ2RlbGV0ZSddKGtleSk7XG4gIHRoaXMuc2l6ZSAtPSByZXN1bHQgPyAxIDogMDtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBtYXBDYWNoZURlbGV0ZTtcbiIsInZhciBnZXRNYXBEYXRhID0gcmVxdWlyZSgnLi9fZ2V0TWFwRGF0YScpO1xuXG4vKipcbiAqIEdldHMgdGhlIG1hcCB2YWx1ZSBmb3IgYGtleWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGdldFxuICogQG1lbWJlck9mIE1hcENhY2hlXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIGdldC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBlbnRyeSB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gbWFwQ2FjaGVHZXQoa2V5KSB7XG4gIHJldHVybiBnZXRNYXBEYXRhKHRoaXMsIGtleSkuZ2V0KGtleSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbWFwQ2FjaGVHZXQ7XG4iLCJ2YXIgZ2V0TWFwRGF0YSA9IHJlcXVpcmUoJy4vX2dldE1hcERhdGEnKTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYSBtYXAgdmFsdWUgZm9yIGBrZXlgIGV4aXN0cy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgaGFzXG4gKiBAbWVtYmVyT2YgTWFwQ2FjaGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgZW50cnkgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYW4gZW50cnkgZm9yIGBrZXlgIGV4aXN0cywgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBtYXBDYWNoZUhhcyhrZXkpIHtcbiAgcmV0dXJuIGdldE1hcERhdGEodGhpcywga2V5KS5oYXMoa2V5KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBtYXBDYWNoZUhhcztcbiIsInZhciBnZXRNYXBEYXRhID0gcmVxdWlyZSgnLi9fZ2V0TWFwRGF0YScpO1xuXG4vKipcbiAqIFNldHMgdGhlIG1hcCBga2V5YCB0byBgdmFsdWVgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBzZXRcbiAqIEBtZW1iZXJPZiBNYXBDYWNoZVxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byBzZXQuXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBzZXQuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBtYXAgY2FjaGUgaW5zdGFuY2UuXG4gKi9cbmZ1bmN0aW9uIG1hcENhY2hlU2V0KGtleSwgdmFsdWUpIHtcbiAgdmFyIGRhdGEgPSBnZXRNYXBEYXRhKHRoaXMsIGtleSksXG4gICAgICBzaXplID0gZGF0YS5zaXplO1xuXG4gIGRhdGEuc2V0KGtleSwgdmFsdWUpO1xuICB0aGlzLnNpemUgKz0gZGF0YS5zaXplID09IHNpemUgPyAwIDogMTtcbiAgcmV0dXJuIHRoaXM7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbWFwQ2FjaGVTZXQ7XG4iLCJ2YXIgbWFwQ2FjaGVDbGVhciA9IHJlcXVpcmUoJy4vX21hcENhY2hlQ2xlYXInKSxcbiAgICBtYXBDYWNoZURlbGV0ZSA9IHJlcXVpcmUoJy4vX21hcENhY2hlRGVsZXRlJyksXG4gICAgbWFwQ2FjaGVHZXQgPSByZXF1aXJlKCcuL19tYXBDYWNoZUdldCcpLFxuICAgIG1hcENhY2hlSGFzID0gcmVxdWlyZSgnLi9fbWFwQ2FjaGVIYXMnKSxcbiAgICBtYXBDYWNoZVNldCA9IHJlcXVpcmUoJy4vX21hcENhY2hlU2V0Jyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG1hcCBjYWNoZSBvYmplY3QgdG8gc3RvcmUga2V5LXZhbHVlIHBhaXJzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7QXJyYXl9IFtlbnRyaWVzXSBUaGUga2V5LXZhbHVlIHBhaXJzIHRvIGNhY2hlLlxuICovXG5mdW5jdGlvbiBNYXBDYWNoZShlbnRyaWVzKSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gZW50cmllcyA9PSBudWxsID8gMCA6IGVudHJpZXMubGVuZ3RoO1xuXG4gIHRoaXMuY2xlYXIoKTtcbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICB2YXIgZW50cnkgPSBlbnRyaWVzW2luZGV4XTtcbiAgICB0aGlzLnNldChlbnRyeVswXSwgZW50cnlbMV0pO1xuICB9XG59XG5cbi8vIEFkZCBtZXRob2RzIHRvIGBNYXBDYWNoZWAuXG5NYXBDYWNoZS5wcm90b3R5cGUuY2xlYXIgPSBtYXBDYWNoZUNsZWFyO1xuTWFwQ2FjaGUucHJvdG90eXBlWydkZWxldGUnXSA9IG1hcENhY2hlRGVsZXRlO1xuTWFwQ2FjaGUucHJvdG90eXBlLmdldCA9IG1hcENhY2hlR2V0O1xuTWFwQ2FjaGUucHJvdG90eXBlLmhhcyA9IG1hcENhY2hlSGFzO1xuTWFwQ2FjaGUucHJvdG90eXBlLnNldCA9IG1hcENhY2hlU2V0O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1hcENhY2hlO1xuIiwidmFyIExpc3RDYWNoZSA9IHJlcXVpcmUoJy4vX0xpc3RDYWNoZScpLFxuICAgIE1hcCA9IHJlcXVpcmUoJy4vX01hcCcpLFxuICAgIE1hcENhY2hlID0gcmVxdWlyZSgnLi9fTWFwQ2FjaGUnKTtcblxuLyoqIFVzZWQgYXMgdGhlIHNpemUgdG8gZW5hYmxlIGxhcmdlIGFycmF5IG9wdGltaXphdGlvbnMuICovXG52YXIgTEFSR0VfQVJSQVlfU0laRSA9IDIwMDtcblxuLyoqXG4gKiBTZXRzIHRoZSBzdGFjayBga2V5YCB0byBgdmFsdWVgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBzZXRcbiAqIEBtZW1iZXJPZiBTdGFja1xuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byBzZXQuXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBzZXQuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBzdGFjayBjYWNoZSBpbnN0YW5jZS5cbiAqL1xuZnVuY3Rpb24gc3RhY2tTZXQoa2V5LCB2YWx1ZSkge1xuICB2YXIgZGF0YSA9IHRoaXMuX19kYXRhX187XG4gIGlmIChkYXRhIGluc3RhbmNlb2YgTGlzdENhY2hlKSB7XG4gICAgdmFyIHBhaXJzID0gZGF0YS5fX2RhdGFfXztcbiAgICBpZiAoIU1hcCB8fCAocGFpcnMubGVuZ3RoIDwgTEFSR0VfQVJSQVlfU0laRSAtIDEpKSB7XG4gICAgICBwYWlycy5wdXNoKFtrZXksIHZhbHVlXSk7XG4gICAgICB0aGlzLnNpemUgPSArK2RhdGEuc2l6ZTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBkYXRhID0gdGhpcy5fX2RhdGFfXyA9IG5ldyBNYXBDYWNoZShwYWlycyk7XG4gIH1cbiAgZGF0YS5zZXQoa2V5LCB2YWx1ZSk7XG4gIHRoaXMuc2l6ZSA9IGRhdGEuc2l6ZTtcbiAgcmV0dXJuIHRoaXM7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc3RhY2tTZXQ7XG4iLCJ2YXIgTGlzdENhY2hlID0gcmVxdWlyZSgnLi9fTGlzdENhY2hlJyksXG4gICAgc3RhY2tDbGVhciA9IHJlcXVpcmUoJy4vX3N0YWNrQ2xlYXInKSxcbiAgICBzdGFja0RlbGV0ZSA9IHJlcXVpcmUoJy4vX3N0YWNrRGVsZXRlJyksXG4gICAgc3RhY2tHZXQgPSByZXF1aXJlKCcuL19zdGFja0dldCcpLFxuICAgIHN0YWNrSGFzID0gcmVxdWlyZSgnLi9fc3RhY2tIYXMnKSxcbiAgICBzdGFja1NldCA9IHJlcXVpcmUoJy4vX3N0YWNrU2V0Jyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhIHN0YWNrIGNhY2hlIG9iamVjdCB0byBzdG9yZSBrZXktdmFsdWUgcGFpcnMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtBcnJheX0gW2VudHJpZXNdIFRoZSBrZXktdmFsdWUgcGFpcnMgdG8gY2FjaGUuXG4gKi9cbmZ1bmN0aW9uIFN0YWNrKGVudHJpZXMpIHtcbiAgdmFyIGRhdGEgPSB0aGlzLl9fZGF0YV9fID0gbmV3IExpc3RDYWNoZShlbnRyaWVzKTtcbiAgdGhpcy5zaXplID0gZGF0YS5zaXplO1xufVxuXG4vLyBBZGQgbWV0aG9kcyB0byBgU3RhY2tgLlxuU3RhY2sucHJvdG90eXBlLmNsZWFyID0gc3RhY2tDbGVhcjtcblN0YWNrLnByb3RvdHlwZVsnZGVsZXRlJ10gPSBzdGFja0RlbGV0ZTtcblN0YWNrLnByb3RvdHlwZS5nZXQgPSBzdGFja0dldDtcblN0YWNrLnByb3RvdHlwZS5oYXMgPSBzdGFja0hhcztcblN0YWNrLnByb3RvdHlwZS5zZXQgPSBzdGFja1NldDtcblxubW9kdWxlLmV4cG9ydHMgPSBTdGFjaztcbiIsIi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBfLmZvckVhY2hgIGZvciBhcnJheXMgd2l0aG91dCBzdXBwb3J0IGZvclxuICogaXRlcmF0ZWUgc2hvcnRoYW5kcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheX0gW2FycmF5XSBUaGUgYXJyYXkgdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0ZWUgVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyBgYXJyYXlgLlxuICovXG5mdW5jdGlvbiBhcnJheUVhY2goYXJyYXksIGl0ZXJhdGVlKSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gYXJyYXkgPT0gbnVsbCA/IDAgOiBhcnJheS5sZW5ndGg7XG5cbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICBpZiAoaXRlcmF0ZWUoYXJyYXlbaW5kZXhdLCBpbmRleCwgYXJyYXkpID09PSBmYWxzZSkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIHJldHVybiBhcnJheTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBhcnJheUVhY2g7XG4iLCJ2YXIgZ2V0TmF0aXZlID0gcmVxdWlyZSgnLi9fZ2V0TmF0aXZlJyk7XG5cbnZhciBkZWZpbmVQcm9wZXJ0eSA9IChmdW5jdGlvbigpIHtcbiAgdHJ5IHtcbiAgICB2YXIgZnVuYyA9IGdldE5hdGl2ZShPYmplY3QsICdkZWZpbmVQcm9wZXJ0eScpO1xuICAgIGZ1bmMoe30sICcnLCB7fSk7XG4gICAgcmV0dXJuIGZ1bmM7XG4gIH0gY2F0Y2ggKGUpIHt9XG59KCkpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRlZmluZVByb3BlcnR5O1xuIiwidmFyIGRlZmluZVByb3BlcnR5ID0gcmVxdWlyZSgnLi9fZGVmaW5lUHJvcGVydHknKTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgYXNzaWduVmFsdWVgIGFuZCBgYXNzaWduTWVyZ2VWYWx1ZWAgd2l0aG91dFxuICogdmFsdWUgY2hlY2tzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gbW9kaWZ5LlxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBwcm9wZXJ0eSB0byBhc3NpZ24uXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBhc3NpZ24uXG4gKi9cbmZ1bmN0aW9uIGJhc2VBc3NpZ25WYWx1ZShvYmplY3QsIGtleSwgdmFsdWUpIHtcbiAgaWYgKGtleSA9PSAnX19wcm90b19fJyAmJiBkZWZpbmVQcm9wZXJ0eSkge1xuICAgIGRlZmluZVByb3BlcnR5KG9iamVjdCwga2V5LCB7XG4gICAgICAnY29uZmlndXJhYmxlJzogdHJ1ZSxcbiAgICAgICdlbnVtZXJhYmxlJzogdHJ1ZSxcbiAgICAgICd2YWx1ZSc6IHZhbHVlLFxuICAgICAgJ3dyaXRhYmxlJzogdHJ1ZVxuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIG9iamVjdFtrZXldID0gdmFsdWU7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlQXNzaWduVmFsdWU7XG4iLCJ2YXIgYmFzZUFzc2lnblZhbHVlID0gcmVxdWlyZSgnLi9fYmFzZUFzc2lnblZhbHVlJyksXG4gICAgZXEgPSByZXF1aXJlKCcuL2VxJyk7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogQXNzaWducyBgdmFsdWVgIHRvIGBrZXlgIG9mIGBvYmplY3RgIGlmIHRoZSBleGlzdGluZyB2YWx1ZSBpcyBub3QgZXF1aXZhbGVudFxuICogdXNpbmcgW2BTYW1lVmFsdWVaZXJvYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtc2FtZXZhbHVlemVybylcbiAqIGZvciBlcXVhbGl0eSBjb21wYXJpc29ucy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIG1vZGlmeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgcHJvcGVydHkgdG8gYXNzaWduLlxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gYXNzaWduLlxuICovXG5mdW5jdGlvbiBhc3NpZ25WYWx1ZShvYmplY3QsIGtleSwgdmFsdWUpIHtcbiAgdmFyIG9ialZhbHVlID0gb2JqZWN0W2tleV07XG4gIGlmICghKGhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBrZXkpICYmIGVxKG9ialZhbHVlLCB2YWx1ZSkpIHx8XG4gICAgICAodmFsdWUgPT09IHVuZGVmaW5lZCAmJiAhKGtleSBpbiBvYmplY3QpKSkge1xuICAgIGJhc2VBc3NpZ25WYWx1ZShvYmplY3QsIGtleSwgdmFsdWUpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYXNzaWduVmFsdWU7XG4iLCJ2YXIgYXNzaWduVmFsdWUgPSByZXF1aXJlKCcuL19hc3NpZ25WYWx1ZScpLFxuICAgIGJhc2VBc3NpZ25WYWx1ZSA9IHJlcXVpcmUoJy4vX2Jhc2VBc3NpZ25WYWx1ZScpO1xuXG4vKipcbiAqIENvcGllcyBwcm9wZXJ0aWVzIG9mIGBzb3VyY2VgIHRvIGBvYmplY3RgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gc291cmNlIFRoZSBvYmplY3QgdG8gY29weSBwcm9wZXJ0aWVzIGZyb20uXG4gKiBAcGFyYW0ge0FycmF5fSBwcm9wcyBUaGUgcHJvcGVydHkgaWRlbnRpZmllcnMgdG8gY29weS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb2JqZWN0PXt9XSBUaGUgb2JqZWN0IHRvIGNvcHkgcHJvcGVydGllcyB0by5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtjdXN0b21pemVyXSBUaGUgZnVuY3Rpb24gdG8gY3VzdG9taXplIGNvcGllZCB2YWx1ZXMuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGBvYmplY3RgLlxuICovXG5mdW5jdGlvbiBjb3B5T2JqZWN0KHNvdXJjZSwgcHJvcHMsIG9iamVjdCwgY3VzdG9taXplcikge1xuICB2YXIgaXNOZXcgPSAhb2JqZWN0O1xuICBvYmplY3QgfHwgKG9iamVjdCA9IHt9KTtcblxuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IHByb3BzLmxlbmd0aDtcblxuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIHZhciBrZXkgPSBwcm9wc1tpbmRleF07XG5cbiAgICB2YXIgbmV3VmFsdWUgPSBjdXN0b21pemVyXG4gICAgICA/IGN1c3RvbWl6ZXIob2JqZWN0W2tleV0sIHNvdXJjZVtrZXldLCBrZXksIG9iamVjdCwgc291cmNlKVxuICAgICAgOiB1bmRlZmluZWQ7XG5cbiAgICBpZiAobmV3VmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgbmV3VmFsdWUgPSBzb3VyY2Vba2V5XTtcbiAgICB9XG4gICAgaWYgKGlzTmV3KSB7XG4gICAgICBiYXNlQXNzaWduVmFsdWUob2JqZWN0LCBrZXksIG5ld1ZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXNzaWduVmFsdWUob2JqZWN0LCBrZXksIG5ld1ZhbHVlKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG9iamVjdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjb3B5T2JqZWN0O1xuIiwiLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy50aW1lc2Agd2l0aG91dCBzdXBwb3J0IGZvciBpdGVyYXRlZSBzaG9ydGhhbmRzXG4gKiBvciBtYXggYXJyYXkgbGVuZ3RoIGNoZWNrcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtudW1iZXJ9IG4gVGhlIG51bWJlciBvZiB0aW1lcyB0byBpbnZva2UgYGl0ZXJhdGVlYC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdGVlIFRoZSBmdW5jdGlvbiBpbnZva2VkIHBlciBpdGVyYXRpb24uXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHJlc3VsdHMuXG4gKi9cbmZ1bmN0aW9uIGJhc2VUaW1lcyhuLCBpdGVyYXRlZSkge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIHJlc3VsdCA9IEFycmF5KG4pO1xuXG4gIHdoaWxlICgrK2luZGV4IDwgbikge1xuICAgIHJlc3VsdFtpbmRleF0gPSBpdGVyYXRlZShpbmRleCk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlVGltZXM7XG4iLCIvKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIG9iamVjdC1saWtlLiBBIHZhbHVlIGlzIG9iamVjdC1saWtlIGlmIGl0J3Mgbm90IGBudWxsYFxuICogYW5kIGhhcyBhIGB0eXBlb2ZgIHJlc3VsdCBvZiBcIm9iamVjdFwiLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIG9iamVjdC1saWtlLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKHt9KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKF8ubm9vcCk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKG51bGwpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3RMaWtlKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSAhPSBudWxsICYmIHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0Jztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc09iamVjdExpa2U7XG4iLCJ2YXIgYmFzZUdldFRhZyA9IHJlcXVpcmUoJy4vX2Jhc2VHZXRUYWcnKSxcbiAgICBpc09iamVjdExpa2UgPSByZXF1aXJlKCcuL2lzT2JqZWN0TGlrZScpO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgYXJnc1RhZyA9ICdbb2JqZWN0IEFyZ3VtZW50c10nO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmlzQXJndW1lbnRzYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhbiBgYXJndW1lbnRzYCBvYmplY3QsXG4gKi9cbmZ1bmN0aW9uIGJhc2VJc0FyZ3VtZW50cyh2YWx1ZSkge1xuICByZXR1cm4gaXNPYmplY3RMaWtlKHZhbHVlKSAmJiBiYXNlR2V0VGFnKHZhbHVlKSA9PSBhcmdzVGFnO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VJc0FyZ3VtZW50cztcbiIsInZhciBiYXNlSXNBcmd1bWVudHMgPSByZXF1aXJlKCcuL19iYXNlSXNBcmd1bWVudHMnKSxcbiAgICBpc09iamVjdExpa2UgPSByZXF1aXJlKCcuL2lzT2JqZWN0TGlrZScpO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBwcm9wZXJ0eUlzRW51bWVyYWJsZSA9IG9iamVjdFByb3RvLnByb3BlcnR5SXNFbnVtZXJhYmxlO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGxpa2VseSBhbiBgYXJndW1lbnRzYCBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYW4gYGFyZ3VtZW50c2Agb2JqZWN0LFxuICogIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0FyZ3VtZW50cyhmdW5jdGlvbigpIHsgcmV0dXJuIGFyZ3VtZW50czsgfSgpKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQXJndW1lbnRzKFsxLCAyLCAzXSk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG52YXIgaXNBcmd1bWVudHMgPSBiYXNlSXNBcmd1bWVudHMoZnVuY3Rpb24oKSB7IHJldHVybiBhcmd1bWVudHM7IH0oKSkgPyBiYXNlSXNBcmd1bWVudHMgOiBmdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gaXNPYmplY3RMaWtlKHZhbHVlKSAmJiBoYXNPd25Qcm9wZXJ0eS5jYWxsKHZhbHVlLCAnY2FsbGVlJykgJiZcbiAgICAhcHJvcGVydHlJc0VudW1lcmFibGUuY2FsbCh2YWx1ZSwgJ2NhbGxlZScpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBpc0FyZ3VtZW50cztcbiIsIi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgY2xhc3NpZmllZCBhcyBhbiBgQXJyYXlgIG9iamVjdC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhbiBhcnJheSwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzQXJyYXkoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQXJyYXkoZG9jdW1lbnQuYm9keS5jaGlsZHJlbik7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNBcnJheSgnYWJjJyk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNBcnJheShfLm5vb3ApO1xuICogLy8gPT4gZmFsc2VcbiAqL1xudmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGlzQXJyYXk7XG4iLCIvKipcbiAqIFRoaXMgbWV0aG9kIHJldHVybnMgYGZhbHNlYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMTMuMFxuICogQGNhdGVnb3J5IFV0aWxcbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8udGltZXMoMiwgXy5zdHViRmFsc2UpO1xuICogLy8gPT4gW2ZhbHNlLCBmYWxzZV1cbiAqL1xuZnVuY3Rpb24gc3R1YkZhbHNlKCkge1xuICByZXR1cm4gZmFsc2U7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc3R1YkZhbHNlO1xuIiwidmFyIHJvb3QgPSByZXF1aXJlKCcuL19yb290JyksXG4gICAgc3R1YkZhbHNlID0gcmVxdWlyZSgnLi9zdHViRmFsc2UnKTtcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBleHBvcnRzYC4gKi9cbnZhciBmcmVlRXhwb3J0cyA9IHR5cGVvZiBleHBvcnRzID09ICdvYmplY3QnICYmIGV4cG9ydHMgJiYgIWV4cG9ydHMubm9kZVR5cGUgJiYgZXhwb3J0cztcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBtb2R1bGVgLiAqL1xudmFyIGZyZWVNb2R1bGUgPSBmcmVlRXhwb3J0cyAmJiB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZSAmJiAhbW9kdWxlLm5vZGVUeXBlICYmIG1vZHVsZTtcblxuLyoqIERldGVjdCB0aGUgcG9wdWxhciBDb21tb25KUyBleHRlbnNpb24gYG1vZHVsZS5leHBvcnRzYC4gKi9cbnZhciBtb2R1bGVFeHBvcnRzID0gZnJlZU1vZHVsZSAmJiBmcmVlTW9kdWxlLmV4cG9ydHMgPT09IGZyZWVFeHBvcnRzO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBCdWZmZXIgPSBtb2R1bGVFeHBvcnRzID8gcm9vdC5CdWZmZXIgOiB1bmRlZmluZWQ7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIGZvciB0aG9zZSB3aXRoIHRoZSBzYW1lIG5hbWUgYXMgb3RoZXIgYGxvZGFzaGAgbWV0aG9kcy4gKi9cbnZhciBuYXRpdmVJc0J1ZmZlciA9IEJ1ZmZlciA/IEJ1ZmZlci5pc0J1ZmZlciA6IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIGJ1ZmZlci5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMy4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIGJ1ZmZlciwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzQnVmZmVyKG5ldyBCdWZmZXIoMikpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNCdWZmZXIobmV3IFVpbnQ4QXJyYXkoMikpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xudmFyIGlzQnVmZmVyID0gbmF0aXZlSXNCdWZmZXIgfHwgc3R1YkZhbHNlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGlzQnVmZmVyO1xuIiwiLyoqIFVzZWQgYXMgcmVmZXJlbmNlcyBmb3IgdmFyaW91cyBgTnVtYmVyYCBjb25zdGFudHMuICovXG52YXIgTUFYX1NBRkVfSU5URUdFUiA9IDkwMDcxOTkyNTQ3NDA5OTE7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCB1bnNpZ25lZCBpbnRlZ2VyIHZhbHVlcy4gKi9cbnZhciByZUlzVWludCA9IC9eKD86MHxbMS05XVxcZCopJC87XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSB2YWxpZCBhcnJheS1saWtlIGluZGV4LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEBwYXJhbSB7bnVtYmVyfSBbbGVuZ3RoPU1BWF9TQUZFX0lOVEVHRVJdIFRoZSB1cHBlciBib3VuZHMgb2YgYSB2YWxpZCBpbmRleC5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgdmFsaWQgaW5kZXgsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaXNJbmRleCh2YWx1ZSwgbGVuZ3RoKSB7XG4gIGxlbmd0aCA9IGxlbmd0aCA9PSBudWxsID8gTUFYX1NBRkVfSU5URUdFUiA6IGxlbmd0aDtcbiAgcmV0dXJuICEhbGVuZ3RoICYmXG4gICAgKHR5cGVvZiB2YWx1ZSA9PSAnbnVtYmVyJyB8fCByZUlzVWludC50ZXN0KHZhbHVlKSkgJiZcbiAgICAodmFsdWUgPiAtMSAmJiB2YWx1ZSAlIDEgPT0gMCAmJiB2YWx1ZSA8IGxlbmd0aCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNJbmRleDtcbiIsIi8qKiBVc2VkIGFzIHJlZmVyZW5jZXMgZm9yIHZhcmlvdXMgYE51bWJlcmAgY29uc3RhbnRzLiAqL1xudmFyIE1BWF9TQUZFX0lOVEVHRVIgPSA5MDA3MTk5MjU0NzQwOTkxO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgdmFsaWQgYXJyYXktbGlrZSBsZW5ndGguXG4gKlxuICogKipOb3RlOioqIFRoaXMgbWV0aG9kIGlzIGxvb3NlbHkgYmFzZWQgb25cbiAqIFtgVG9MZW5ndGhgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy10b2xlbmd0aCkuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSB2YWxpZCBsZW5ndGgsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0xlbmd0aCgzKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzTGVuZ3RoKE51bWJlci5NSU5fVkFMVUUpO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzTGVuZ3RoKEluZmluaXR5KTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc0xlbmd0aCgnMycpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNMZW5ndGgodmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAnbnVtYmVyJyAmJlxuICAgIHZhbHVlID4gLTEgJiYgdmFsdWUgJSAxID09IDAgJiYgdmFsdWUgPD0gTUFYX1NBRkVfSU5URUdFUjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc0xlbmd0aDtcbiIsInZhciBiYXNlR2V0VGFnID0gcmVxdWlyZSgnLi9fYmFzZUdldFRhZycpLFxuICAgIGlzTGVuZ3RoID0gcmVxdWlyZSgnLi9pc0xlbmd0aCcpLFxuICAgIGlzT2JqZWN0TGlrZSA9IHJlcXVpcmUoJy4vaXNPYmplY3RMaWtlJyk7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBhcmdzVGFnID0gJ1tvYmplY3QgQXJndW1lbnRzXScsXG4gICAgYXJyYXlUYWcgPSAnW29iamVjdCBBcnJheV0nLFxuICAgIGJvb2xUYWcgPSAnW29iamVjdCBCb29sZWFuXScsXG4gICAgZGF0ZVRhZyA9ICdbb2JqZWN0IERhdGVdJyxcbiAgICBlcnJvclRhZyA9ICdbb2JqZWN0IEVycm9yXScsXG4gICAgZnVuY1RhZyA9ICdbb2JqZWN0IEZ1bmN0aW9uXScsXG4gICAgbWFwVGFnID0gJ1tvYmplY3QgTWFwXScsXG4gICAgbnVtYmVyVGFnID0gJ1tvYmplY3QgTnVtYmVyXScsXG4gICAgb2JqZWN0VGFnID0gJ1tvYmplY3QgT2JqZWN0XScsXG4gICAgcmVnZXhwVGFnID0gJ1tvYmplY3QgUmVnRXhwXScsXG4gICAgc2V0VGFnID0gJ1tvYmplY3QgU2V0XScsXG4gICAgc3RyaW5nVGFnID0gJ1tvYmplY3QgU3RyaW5nXScsXG4gICAgd2Vha01hcFRhZyA9ICdbb2JqZWN0IFdlYWtNYXBdJztcblxudmFyIGFycmF5QnVmZmVyVGFnID0gJ1tvYmplY3QgQXJyYXlCdWZmZXJdJyxcbiAgICBkYXRhVmlld1RhZyA9ICdbb2JqZWN0IERhdGFWaWV3XScsXG4gICAgZmxvYXQzMlRhZyA9ICdbb2JqZWN0IEZsb2F0MzJBcnJheV0nLFxuICAgIGZsb2F0NjRUYWcgPSAnW29iamVjdCBGbG9hdDY0QXJyYXldJyxcbiAgICBpbnQ4VGFnID0gJ1tvYmplY3QgSW50OEFycmF5XScsXG4gICAgaW50MTZUYWcgPSAnW29iamVjdCBJbnQxNkFycmF5XScsXG4gICAgaW50MzJUYWcgPSAnW29iamVjdCBJbnQzMkFycmF5XScsXG4gICAgdWludDhUYWcgPSAnW29iamVjdCBVaW50OEFycmF5XScsXG4gICAgdWludDhDbGFtcGVkVGFnID0gJ1tvYmplY3QgVWludDhDbGFtcGVkQXJyYXldJyxcbiAgICB1aW50MTZUYWcgPSAnW29iamVjdCBVaW50MTZBcnJheV0nLFxuICAgIHVpbnQzMlRhZyA9ICdbb2JqZWN0IFVpbnQzMkFycmF5XSc7XG5cbi8qKiBVc2VkIHRvIGlkZW50aWZ5IGB0b1N0cmluZ1RhZ2AgdmFsdWVzIG9mIHR5cGVkIGFycmF5cy4gKi9cbnZhciB0eXBlZEFycmF5VGFncyA9IHt9O1xudHlwZWRBcnJheVRhZ3NbZmxvYXQzMlRhZ10gPSB0eXBlZEFycmF5VGFnc1tmbG9hdDY0VGFnXSA9XG50eXBlZEFycmF5VGFnc1tpbnQ4VGFnXSA9IHR5cGVkQXJyYXlUYWdzW2ludDE2VGFnXSA9XG50eXBlZEFycmF5VGFnc1tpbnQzMlRhZ10gPSB0eXBlZEFycmF5VGFnc1t1aW50OFRhZ10gPVxudHlwZWRBcnJheVRhZ3NbdWludDhDbGFtcGVkVGFnXSA9IHR5cGVkQXJyYXlUYWdzW3VpbnQxNlRhZ10gPVxudHlwZWRBcnJheVRhZ3NbdWludDMyVGFnXSA9IHRydWU7XG50eXBlZEFycmF5VGFnc1thcmdzVGFnXSA9IHR5cGVkQXJyYXlUYWdzW2FycmF5VGFnXSA9XG50eXBlZEFycmF5VGFnc1thcnJheUJ1ZmZlclRhZ10gPSB0eXBlZEFycmF5VGFnc1tib29sVGFnXSA9XG50eXBlZEFycmF5VGFnc1tkYXRhVmlld1RhZ10gPSB0eXBlZEFycmF5VGFnc1tkYXRlVGFnXSA9XG50eXBlZEFycmF5VGFnc1tlcnJvclRhZ10gPSB0eXBlZEFycmF5VGFnc1tmdW5jVGFnXSA9XG50eXBlZEFycmF5VGFnc1ttYXBUYWddID0gdHlwZWRBcnJheVRhZ3NbbnVtYmVyVGFnXSA9XG50eXBlZEFycmF5VGFnc1tvYmplY3RUYWddID0gdHlwZWRBcnJheVRhZ3NbcmVnZXhwVGFnXSA9XG50eXBlZEFycmF5VGFnc1tzZXRUYWddID0gdHlwZWRBcnJheVRhZ3Nbc3RyaW5nVGFnXSA9XG50eXBlZEFycmF5VGFnc1t3ZWFrTWFwVGFnXSA9IGZhbHNlO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmlzVHlwZWRBcnJheWAgd2l0aG91dCBOb2RlLmpzIG9wdGltaXphdGlvbnMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSB0eXBlZCBhcnJheSwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBiYXNlSXNUeXBlZEFycmF5KHZhbHVlKSB7XG4gIHJldHVybiBpc09iamVjdExpa2UodmFsdWUpICYmXG4gICAgaXNMZW5ndGgodmFsdWUubGVuZ3RoKSAmJiAhIXR5cGVkQXJyYXlUYWdzW2Jhc2VHZXRUYWcodmFsdWUpXTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlSXNUeXBlZEFycmF5O1xuIiwiLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy51bmFyeWAgd2l0aG91dCBzdXBwb3J0IGZvciBzdG9yaW5nIG1ldGFkYXRhLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBjYXAgYXJndW1lbnRzIGZvci5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGNhcHBlZCBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gYmFzZVVuYXJ5KGZ1bmMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIGZ1bmModmFsdWUpO1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VVbmFyeTtcbiIsInZhciBmcmVlR2xvYmFsID0gcmVxdWlyZSgnLi9fZnJlZUdsb2JhbCcpO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYGV4cG9ydHNgLiAqL1xudmFyIGZyZWVFeHBvcnRzID0gdHlwZW9mIGV4cG9ydHMgPT0gJ29iamVjdCcgJiYgZXhwb3J0cyAmJiAhZXhwb3J0cy5ub2RlVHlwZSAmJiBleHBvcnRzO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYG1vZHVsZWAuICovXG52YXIgZnJlZU1vZHVsZSA9IGZyZWVFeHBvcnRzICYmIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlICYmICFtb2R1bGUubm9kZVR5cGUgJiYgbW9kdWxlO1xuXG4vKiogRGV0ZWN0IHRoZSBwb3B1bGFyIENvbW1vbkpTIGV4dGVuc2lvbiBgbW9kdWxlLmV4cG9ydHNgLiAqL1xudmFyIG1vZHVsZUV4cG9ydHMgPSBmcmVlTW9kdWxlICYmIGZyZWVNb2R1bGUuZXhwb3J0cyA9PT0gZnJlZUV4cG9ydHM7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgcHJvY2Vzc2AgZnJvbSBOb2RlLmpzLiAqL1xudmFyIGZyZWVQcm9jZXNzID0gbW9kdWxlRXhwb3J0cyAmJiBmcmVlR2xvYmFsLnByb2Nlc3M7XG5cbi8qKiBVc2VkIHRvIGFjY2VzcyBmYXN0ZXIgTm9kZS5qcyBoZWxwZXJzLiAqL1xudmFyIG5vZGVVdGlsID0gKGZ1bmN0aW9uKCkge1xuICB0cnkge1xuICAgIHJldHVybiBmcmVlUHJvY2VzcyAmJiBmcmVlUHJvY2Vzcy5iaW5kaW5nICYmIGZyZWVQcm9jZXNzLmJpbmRpbmcoJ3V0aWwnKTtcbiAgfSBjYXRjaCAoZSkge31cbn0oKSk7XG5cbm1vZHVsZS5leHBvcnRzID0gbm9kZVV0aWw7XG4iLCJ2YXIgYmFzZUlzVHlwZWRBcnJheSA9IHJlcXVpcmUoJy4vX2Jhc2VJc1R5cGVkQXJyYXknKSxcbiAgICBiYXNlVW5hcnkgPSByZXF1aXJlKCcuL19iYXNlVW5hcnknKSxcbiAgICBub2RlVXRpbCA9IHJlcXVpcmUoJy4vX25vZGVVdGlsJyk7XG5cbi8qIE5vZGUuanMgaGVscGVyIHJlZmVyZW5jZXMuICovXG52YXIgbm9kZUlzVHlwZWRBcnJheSA9IG5vZGVVdGlsICYmIG5vZGVVdGlsLmlzVHlwZWRBcnJheTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBjbGFzc2lmaWVkIGFzIGEgdHlwZWQgYXJyYXkuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAzLjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSB0eXBlZCBhcnJheSwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzVHlwZWRBcnJheShuZXcgVWludDhBcnJheSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc1R5cGVkQXJyYXkoW10pO1xuICogLy8gPT4gZmFsc2VcbiAqL1xudmFyIGlzVHlwZWRBcnJheSA9IG5vZGVJc1R5cGVkQXJyYXkgPyBiYXNlVW5hcnkobm9kZUlzVHlwZWRBcnJheSkgOiBiYXNlSXNUeXBlZEFycmF5O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGlzVHlwZWRBcnJheTtcbiIsInZhciBiYXNlVGltZXMgPSByZXF1aXJlKCcuL19iYXNlVGltZXMnKSxcbiAgICBpc0FyZ3VtZW50cyA9IHJlcXVpcmUoJy4vaXNBcmd1bWVudHMnKSxcbiAgICBpc0FycmF5ID0gcmVxdWlyZSgnLi9pc0FycmF5JyksXG4gICAgaXNCdWZmZXIgPSByZXF1aXJlKCcuL2lzQnVmZmVyJyksXG4gICAgaXNJbmRleCA9IHJlcXVpcmUoJy4vX2lzSW5kZXgnKSxcbiAgICBpc1R5cGVkQXJyYXkgPSByZXF1aXJlKCcuL2lzVHlwZWRBcnJheScpO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gYXJyYXkgb2YgdGhlIGVudW1lcmFibGUgcHJvcGVydHkgbmFtZXMgb2YgdGhlIGFycmF5LWxpa2UgYHZhbHVlYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcXVlcnkuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGluaGVyaXRlZCBTcGVjaWZ5IHJldHVybmluZyBpbmhlcml0ZWQgcHJvcGVydHkgbmFtZXMuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzLlxuICovXG5mdW5jdGlvbiBhcnJheUxpa2VLZXlzKHZhbHVlLCBpbmhlcml0ZWQpIHtcbiAgdmFyIGlzQXJyID0gaXNBcnJheSh2YWx1ZSksXG4gICAgICBpc0FyZyA9ICFpc0FyciAmJiBpc0FyZ3VtZW50cyh2YWx1ZSksXG4gICAgICBpc0J1ZmYgPSAhaXNBcnIgJiYgIWlzQXJnICYmIGlzQnVmZmVyKHZhbHVlKSxcbiAgICAgIGlzVHlwZSA9ICFpc0FyciAmJiAhaXNBcmcgJiYgIWlzQnVmZiAmJiBpc1R5cGVkQXJyYXkodmFsdWUpLFxuICAgICAgc2tpcEluZGV4ZXMgPSBpc0FyciB8fCBpc0FyZyB8fCBpc0J1ZmYgfHwgaXNUeXBlLFxuICAgICAgcmVzdWx0ID0gc2tpcEluZGV4ZXMgPyBiYXNlVGltZXModmFsdWUubGVuZ3RoLCBTdHJpbmcpIDogW10sXG4gICAgICBsZW5ndGggPSByZXN1bHQubGVuZ3RoO1xuXG4gIGZvciAodmFyIGtleSBpbiB2YWx1ZSkge1xuICAgIGlmICgoaW5oZXJpdGVkIHx8IGhhc093blByb3BlcnR5LmNhbGwodmFsdWUsIGtleSkpICYmXG4gICAgICAgICEoc2tpcEluZGV4ZXMgJiYgKFxuICAgICAgICAgICAvLyBTYWZhcmkgOSBoYXMgZW51bWVyYWJsZSBgYXJndW1lbnRzLmxlbmd0aGAgaW4gc3RyaWN0IG1vZGUuXG4gICAgICAgICAgIGtleSA9PSAnbGVuZ3RoJyB8fFxuICAgICAgICAgICAvLyBOb2RlLmpzIDAuMTAgaGFzIGVudW1lcmFibGUgbm9uLWluZGV4IHByb3BlcnRpZXMgb24gYnVmZmVycy5cbiAgICAgICAgICAgKGlzQnVmZiAmJiAoa2V5ID09ICdvZmZzZXQnIHx8IGtleSA9PSAncGFyZW50JykpIHx8XG4gICAgICAgICAgIC8vIFBoYW50b21KUyAyIGhhcyBlbnVtZXJhYmxlIG5vbi1pbmRleCBwcm9wZXJ0aWVzIG9uIHR5cGVkIGFycmF5cy5cbiAgICAgICAgICAgKGlzVHlwZSAmJiAoa2V5ID09ICdidWZmZXInIHx8IGtleSA9PSAnYnl0ZUxlbmd0aCcgfHwga2V5ID09ICdieXRlT2Zmc2V0JykpIHx8XG4gICAgICAgICAgIC8vIFNraXAgaW5kZXggcHJvcGVydGllcy5cbiAgICAgICAgICAgaXNJbmRleChrZXksIGxlbmd0aClcbiAgICAgICAgKSkpIHtcbiAgICAgIHJlc3VsdC5wdXNoKGtleSk7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYXJyYXlMaWtlS2V5cztcbiIsIi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgbGlrZWx5IGEgcHJvdG90eXBlIG9iamVjdC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHByb3RvdHlwZSwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc1Byb3RvdHlwZSh2YWx1ZSkge1xuICB2YXIgQ3RvciA9IHZhbHVlICYmIHZhbHVlLmNvbnN0cnVjdG9yLFxuICAgICAgcHJvdG8gPSAodHlwZW9mIEN0b3IgPT0gJ2Z1bmN0aW9uJyAmJiBDdG9yLnByb3RvdHlwZSkgfHwgb2JqZWN0UHJvdG87XG5cbiAgcmV0dXJuIHZhbHVlID09PSBwcm90bztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc1Byb3RvdHlwZTtcbiIsIi8qKlxuICogQ3JlYXRlcyBhIHVuYXJ5IGZ1bmN0aW9uIHRoYXQgaW52b2tlcyBgZnVuY2Agd2l0aCBpdHMgYXJndW1lbnQgdHJhbnNmb3JtZWQuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIHdyYXAuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSB0cmFuc2Zvcm0gVGhlIGFyZ3VtZW50IHRyYW5zZm9ybS5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBvdmVyQXJnKGZ1bmMsIHRyYW5zZm9ybSkge1xuICByZXR1cm4gZnVuY3Rpb24oYXJnKSB7XG4gICAgcmV0dXJuIGZ1bmModHJhbnNmb3JtKGFyZykpO1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG92ZXJBcmc7XG4iLCJ2YXIgb3ZlckFyZyA9IHJlcXVpcmUoJy4vX292ZXJBcmcnKTtcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgZm9yIHRob3NlIHdpdGggdGhlIHNhbWUgbmFtZSBhcyBvdGhlciBgbG9kYXNoYCBtZXRob2RzLiAqL1xudmFyIG5hdGl2ZUtleXMgPSBvdmVyQXJnKE9iamVjdC5rZXlzLCBPYmplY3QpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5hdGl2ZUtleXM7XG4iLCJ2YXIgaXNQcm90b3R5cGUgPSByZXF1aXJlKCcuL19pc1Byb3RvdHlwZScpLFxuICAgIG5hdGl2ZUtleXMgPSByZXF1aXJlKCcuL19uYXRpdmVLZXlzJyk7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8ua2V5c2Agd2hpY2ggZG9lc24ndCB0cmVhdCBzcGFyc2UgYXJyYXlzIGFzIGRlbnNlLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzLlxuICovXG5mdW5jdGlvbiBiYXNlS2V5cyhvYmplY3QpIHtcbiAgaWYgKCFpc1Byb3RvdHlwZShvYmplY3QpKSB7XG4gICAgcmV0dXJuIG5hdGl2ZUtleXMob2JqZWN0KTtcbiAgfVxuICB2YXIgcmVzdWx0ID0gW107XG4gIGZvciAodmFyIGtleSBpbiBPYmplY3Qob2JqZWN0KSkge1xuICAgIGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwga2V5KSAmJiBrZXkgIT0gJ2NvbnN0cnVjdG9yJykge1xuICAgICAgcmVzdWx0LnB1c2goa2V5KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlS2V5cztcbiIsInZhciBpc0Z1bmN0aW9uID0gcmVxdWlyZSgnLi9pc0Z1bmN0aW9uJyksXG4gICAgaXNMZW5ndGggPSByZXF1aXJlKCcuL2lzTGVuZ3RoJyk7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYXJyYXktbGlrZS4gQSB2YWx1ZSBpcyBjb25zaWRlcmVkIGFycmF5LWxpa2UgaWYgaXQnc1xuICogbm90IGEgZnVuY3Rpb24gYW5kIGhhcyBhIGB2YWx1ZS5sZW5ndGhgIHRoYXQncyBhbiBpbnRlZ2VyIGdyZWF0ZXIgdGhhbiBvclxuICogZXF1YWwgdG8gYDBgIGFuZCBsZXNzIHRoYW4gb3IgZXF1YWwgdG8gYE51bWJlci5NQVhfU0FGRV9JTlRFR0VSYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhcnJheS1saWtlLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNBcnJheUxpa2UoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQXJyYXlMaWtlKGRvY3VtZW50LmJvZHkuY2hpbGRyZW4pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcnJheUxpa2UoJ2FiYycpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNBcnJheUxpa2UoXy5ub29wKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlMaWtlKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSAhPSBudWxsICYmIGlzTGVuZ3RoKHZhbHVlLmxlbmd0aCkgJiYgIWlzRnVuY3Rpb24odmFsdWUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzQXJyYXlMaWtlO1xuIiwidmFyIGFycmF5TGlrZUtleXMgPSByZXF1aXJlKCcuL19hcnJheUxpa2VLZXlzJyksXG4gICAgYmFzZUtleXMgPSByZXF1aXJlKCcuL19iYXNlS2V5cycpLFxuICAgIGlzQXJyYXlMaWtlID0gcmVxdWlyZSgnLi9pc0FycmF5TGlrZScpO1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gYXJyYXkgb2YgdGhlIG93biBlbnVtZXJhYmxlIHByb3BlcnR5IG5hbWVzIG9mIGBvYmplY3RgLlxuICpcbiAqICoqTm90ZToqKiBOb24tb2JqZWN0IHZhbHVlcyBhcmUgY29lcmNlZCB0byBvYmplY3RzLiBTZWUgdGhlXG4gKiBbRVMgc3BlY10oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtb2JqZWN0LmtleXMpXG4gKiBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBzaW5jZSAwLjEuMFxuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBPYmplY3RcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMuXG4gKiBAZXhhbXBsZVxuICpcbiAqIGZ1bmN0aW9uIEZvbygpIHtcbiAqICAgdGhpcy5hID0gMTtcbiAqICAgdGhpcy5iID0gMjtcbiAqIH1cbiAqXG4gKiBGb28ucHJvdG90eXBlLmMgPSAzO1xuICpcbiAqIF8ua2V5cyhuZXcgRm9vKTtcbiAqIC8vID0+IFsnYScsICdiJ10gKGl0ZXJhdGlvbiBvcmRlciBpcyBub3QgZ3VhcmFudGVlZClcbiAqXG4gKiBfLmtleXMoJ2hpJyk7XG4gKiAvLyA9PiBbJzAnLCAnMSddXG4gKi9cbmZ1bmN0aW9uIGtleXMob2JqZWN0KSB7XG4gIHJldHVybiBpc0FycmF5TGlrZShvYmplY3QpID8gYXJyYXlMaWtlS2V5cyhvYmplY3QpIDogYmFzZUtleXMob2JqZWN0KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBrZXlzO1xuIiwidmFyIGNvcHlPYmplY3QgPSByZXF1aXJlKCcuL19jb3B5T2JqZWN0JyksXG4gICAga2V5cyA9IHJlcXVpcmUoJy4va2V5cycpO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmFzc2lnbmAgd2l0aG91dCBzdXBwb3J0IGZvciBtdWx0aXBsZSBzb3VyY2VzXG4gKiBvciBgY3VzdG9taXplcmAgZnVuY3Rpb25zLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBkZXN0aW5hdGlvbiBvYmplY3QuXG4gKiBAcGFyYW0ge09iamVjdH0gc291cmNlIFRoZSBzb3VyY2Ugb2JqZWN0LlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBgb2JqZWN0YC5cbiAqL1xuZnVuY3Rpb24gYmFzZUFzc2lnbihvYmplY3QsIHNvdXJjZSkge1xuICByZXR1cm4gb2JqZWN0ICYmIGNvcHlPYmplY3Qoc291cmNlLCBrZXlzKHNvdXJjZSksIG9iamVjdCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUFzc2lnbjtcbiIsIi8qKlxuICogVGhpcyBmdW5jdGlvbiBpcyBsaWtlXG4gKiBbYE9iamVjdC5rZXlzYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtb2JqZWN0LmtleXMpXG4gKiBleGNlcHQgdGhhdCBpdCBpbmNsdWRlcyBpbmhlcml0ZWQgZW51bWVyYWJsZSBwcm9wZXJ0aWVzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzLlxuICovXG5mdW5jdGlvbiBuYXRpdmVLZXlzSW4ob2JqZWN0KSB7XG4gIHZhciByZXN1bHQgPSBbXTtcbiAgaWYgKG9iamVjdCAhPSBudWxsKSB7XG4gICAgZm9yICh2YXIga2V5IGluIE9iamVjdChvYmplY3QpKSB7XG4gICAgICByZXN1bHQucHVzaChrZXkpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG5hdGl2ZUtleXNJbjtcbiIsInZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vaXNPYmplY3QnKSxcbiAgICBpc1Byb3RvdHlwZSA9IHJlcXVpcmUoJy4vX2lzUHJvdG90eXBlJyksXG4gICAgbmF0aXZlS2V5c0luID0gcmVxdWlyZSgnLi9fbmF0aXZlS2V5c0luJyk7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8ua2V5c0luYCB3aGljaCBkb2Vzbid0IHRyZWF0IHNwYXJzZSBhcnJheXMgYXMgZGVuc2UuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMuXG4gKi9cbmZ1bmN0aW9uIGJhc2VLZXlzSW4ob2JqZWN0KSB7XG4gIGlmICghaXNPYmplY3Qob2JqZWN0KSkge1xuICAgIHJldHVybiBuYXRpdmVLZXlzSW4ob2JqZWN0KTtcbiAgfVxuICB2YXIgaXNQcm90byA9IGlzUHJvdG90eXBlKG9iamVjdCksXG4gICAgICByZXN1bHQgPSBbXTtcblxuICBmb3IgKHZhciBrZXkgaW4gb2JqZWN0KSB7XG4gICAgaWYgKCEoa2V5ID09ICdjb25zdHJ1Y3RvcicgJiYgKGlzUHJvdG8gfHwgIWhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBrZXkpKSkpIHtcbiAgICAgIHJlc3VsdC5wdXNoKGtleSk7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUtleXNJbjtcbiIsInZhciBhcnJheUxpa2VLZXlzID0gcmVxdWlyZSgnLi9fYXJyYXlMaWtlS2V5cycpLFxuICAgIGJhc2VLZXlzSW4gPSByZXF1aXJlKCcuL19iYXNlS2V5c0luJyksXG4gICAgaXNBcnJheUxpa2UgPSByZXF1aXJlKCcuL2lzQXJyYXlMaWtlJyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhcnJheSBvZiB0aGUgb3duIGFuZCBpbmhlcml0ZWQgZW51bWVyYWJsZSBwcm9wZXJ0eSBuYW1lcyBvZiBgb2JqZWN0YC5cbiAqXG4gKiAqKk5vdGU6KiogTm9uLW9iamVjdCB2YWx1ZXMgYXJlIGNvZXJjZWQgdG8gb2JqZWN0cy5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDMuMC4wXG4gKiBAY2F0ZWdvcnkgT2JqZWN0XG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzLlxuICogQGV4YW1wbGVcbiAqXG4gKiBmdW5jdGlvbiBGb28oKSB7XG4gKiAgIHRoaXMuYSA9IDE7XG4gKiAgIHRoaXMuYiA9IDI7XG4gKiB9XG4gKlxuICogRm9vLnByb3RvdHlwZS5jID0gMztcbiAqXG4gKiBfLmtleXNJbihuZXcgRm9vKTtcbiAqIC8vID0+IFsnYScsICdiJywgJ2MnXSAoaXRlcmF0aW9uIG9yZGVyIGlzIG5vdCBndWFyYW50ZWVkKVxuICovXG5mdW5jdGlvbiBrZXlzSW4ob2JqZWN0KSB7XG4gIHJldHVybiBpc0FycmF5TGlrZShvYmplY3QpID8gYXJyYXlMaWtlS2V5cyhvYmplY3QsIHRydWUpIDogYmFzZUtleXNJbihvYmplY3QpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGtleXNJbjtcbiIsInZhciBjb3B5T2JqZWN0ID0gcmVxdWlyZSgnLi9fY29weU9iamVjdCcpLFxuICAgIGtleXNJbiA9IHJlcXVpcmUoJy4va2V5c0luJyk7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uYXNzaWduSW5gIHdpdGhvdXQgc3VwcG9ydCBmb3IgbXVsdGlwbGUgc291cmNlc1xuICogb3IgYGN1c3RvbWl6ZXJgIGZ1bmN0aW9ucy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgZGVzdGluYXRpb24gb2JqZWN0LlxuICogQHBhcmFtIHtPYmplY3R9IHNvdXJjZSBUaGUgc291cmNlIG9iamVjdC5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgYG9iamVjdGAuXG4gKi9cbmZ1bmN0aW9uIGJhc2VBc3NpZ25JbihvYmplY3QsIHNvdXJjZSkge1xuICByZXR1cm4gb2JqZWN0ICYmIGNvcHlPYmplY3Qoc291cmNlLCBrZXlzSW4oc291cmNlKSwgb2JqZWN0KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlQXNzaWduSW47XG4iLCJ2YXIgcm9vdCA9IHJlcXVpcmUoJy4vX3Jvb3QnKTtcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBleHBvcnRzYC4gKi9cbnZhciBmcmVlRXhwb3J0cyA9IHR5cGVvZiBleHBvcnRzID09ICdvYmplY3QnICYmIGV4cG9ydHMgJiYgIWV4cG9ydHMubm9kZVR5cGUgJiYgZXhwb3J0cztcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBtb2R1bGVgLiAqL1xudmFyIGZyZWVNb2R1bGUgPSBmcmVlRXhwb3J0cyAmJiB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZSAmJiAhbW9kdWxlLm5vZGVUeXBlICYmIG1vZHVsZTtcblxuLyoqIERldGVjdCB0aGUgcG9wdWxhciBDb21tb25KUyBleHRlbnNpb24gYG1vZHVsZS5leHBvcnRzYC4gKi9cbnZhciBtb2R1bGVFeHBvcnRzID0gZnJlZU1vZHVsZSAmJiBmcmVlTW9kdWxlLmV4cG9ydHMgPT09IGZyZWVFeHBvcnRzO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBCdWZmZXIgPSBtb2R1bGVFeHBvcnRzID8gcm9vdC5CdWZmZXIgOiB1bmRlZmluZWQsXG4gICAgYWxsb2NVbnNhZmUgPSBCdWZmZXIgPyBCdWZmZXIuYWxsb2NVbnNhZmUgOiB1bmRlZmluZWQ7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGNsb25lIG9mICBgYnVmZmVyYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtCdWZmZXJ9IGJ1ZmZlciBUaGUgYnVmZmVyIHRvIGNsb25lLlxuICogQHBhcmFtIHtib29sZWFufSBbaXNEZWVwXSBTcGVjaWZ5IGEgZGVlcCBjbG9uZS5cbiAqIEByZXR1cm5zIHtCdWZmZXJ9IFJldHVybnMgdGhlIGNsb25lZCBidWZmZXIuXG4gKi9cbmZ1bmN0aW9uIGNsb25lQnVmZmVyKGJ1ZmZlciwgaXNEZWVwKSB7XG4gIGlmIChpc0RlZXApIHtcbiAgICByZXR1cm4gYnVmZmVyLnNsaWNlKCk7XG4gIH1cbiAgdmFyIGxlbmd0aCA9IGJ1ZmZlci5sZW5ndGgsXG4gICAgICByZXN1bHQgPSBhbGxvY1Vuc2FmZSA/IGFsbG9jVW5zYWZlKGxlbmd0aCkgOiBuZXcgYnVmZmVyLmNvbnN0cnVjdG9yKGxlbmd0aCk7XG5cbiAgYnVmZmVyLmNvcHkocmVzdWx0KTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjbG9uZUJ1ZmZlcjtcbiIsIi8qKlxuICogQ29waWVzIHRoZSB2YWx1ZXMgb2YgYHNvdXJjZWAgdG8gYGFycmF5YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheX0gc291cmNlIFRoZSBhcnJheSB0byBjb3B5IHZhbHVlcyBmcm9tLlxuICogQHBhcmFtIHtBcnJheX0gW2FycmF5PVtdXSBUaGUgYXJyYXkgdG8gY29weSB2YWx1ZXMgdG8uXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgYGFycmF5YC5cbiAqL1xuZnVuY3Rpb24gY29weUFycmF5KHNvdXJjZSwgYXJyYXkpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBzb3VyY2UubGVuZ3RoO1xuXG4gIGFycmF5IHx8IChhcnJheSA9IEFycmF5KGxlbmd0aCkpO1xuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIGFycmF5W2luZGV4XSA9IHNvdXJjZVtpbmRleF07XG4gIH1cbiAgcmV0dXJuIGFycmF5O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNvcHlBcnJheTtcbiIsIi8qKlxuICogQSBzcGVjaWFsaXplZCB2ZXJzaW9uIG9mIGBfLmZpbHRlcmAgZm9yIGFycmF5cyB3aXRob3V0IHN1cHBvcnQgZm9yXG4gKiBpdGVyYXRlZSBzaG9ydGhhbmRzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0FycmF5fSBbYXJyYXldIFRoZSBhcnJheSB0byBpdGVyYXRlIG92ZXIuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBwcmVkaWNhdGUgVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgbmV3IGZpbHRlcmVkIGFycmF5LlxuICovXG5mdW5jdGlvbiBhcnJheUZpbHRlcihhcnJheSwgcHJlZGljYXRlKSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgbGVuZ3RoID0gYXJyYXkgPT0gbnVsbCA/IDAgOiBhcnJheS5sZW5ndGgsXG4gICAgICByZXNJbmRleCA9IDAsXG4gICAgICByZXN1bHQgPSBbXTtcblxuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIHZhciB2YWx1ZSA9IGFycmF5W2luZGV4XTtcbiAgICBpZiAocHJlZGljYXRlKHZhbHVlLCBpbmRleCwgYXJyYXkpKSB7XG4gICAgICByZXN1bHRbcmVzSW5kZXgrK10gPSB2YWx1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBhcnJheUZpbHRlcjtcbiIsIi8qKlxuICogVGhpcyBtZXRob2QgcmV0dXJucyBhIG5ldyBlbXB0eSBhcnJheS5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMTMuMFxuICogQGNhdGVnb3J5IFV0aWxcbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgbmV3IGVtcHR5IGFycmF5LlxuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgYXJyYXlzID0gXy50aW1lcygyLCBfLnN0dWJBcnJheSk7XG4gKlxuICogY29uc29sZS5sb2coYXJyYXlzKTtcbiAqIC8vID0+IFtbXSwgW11dXG4gKlxuICogY29uc29sZS5sb2coYXJyYXlzWzBdID09PSBhcnJheXNbMV0pO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gc3R1YkFycmF5KCkge1xuICByZXR1cm4gW107XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc3R1YkFycmF5O1xuIiwidmFyIGFycmF5RmlsdGVyID0gcmVxdWlyZSgnLi9fYXJyYXlGaWx0ZXInKSxcbiAgICBzdHViQXJyYXkgPSByZXF1aXJlKCcuL3N0dWJBcnJheScpO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBwcm9wZXJ0eUlzRW51bWVyYWJsZSA9IG9iamVjdFByb3RvLnByb3BlcnR5SXNFbnVtZXJhYmxlO1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyBmb3IgdGhvc2Ugd2l0aCB0aGUgc2FtZSBuYW1lIGFzIG90aGVyIGBsb2Rhc2hgIG1ldGhvZHMuICovXG52YXIgbmF0aXZlR2V0U3ltYm9scyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHM7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhcnJheSBvZiB0aGUgb3duIGVudW1lcmFibGUgc3ltYm9scyBvZiBgb2JqZWN0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBzeW1ib2xzLlxuICovXG52YXIgZ2V0U3ltYm9scyA9ICFuYXRpdmVHZXRTeW1ib2xzID8gc3R1YkFycmF5IDogZnVuY3Rpb24ob2JqZWN0KSB7XG4gIGlmIChvYmplY3QgPT0gbnVsbCkge1xuICAgIHJldHVybiBbXTtcbiAgfVxuICBvYmplY3QgPSBPYmplY3Qob2JqZWN0KTtcbiAgcmV0dXJuIGFycmF5RmlsdGVyKG5hdGl2ZUdldFN5bWJvbHMob2JqZWN0KSwgZnVuY3Rpb24oc3ltYm9sKSB7XG4gICAgcmV0dXJuIHByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwob2JqZWN0LCBzeW1ib2wpO1xuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0U3ltYm9scztcbiIsInZhciBjb3B5T2JqZWN0ID0gcmVxdWlyZSgnLi9fY29weU9iamVjdCcpLFxuICAgIGdldFN5bWJvbHMgPSByZXF1aXJlKCcuL19nZXRTeW1ib2xzJyk7XG5cbi8qKlxuICogQ29waWVzIG93biBzeW1ib2xzIG9mIGBzb3VyY2VgIHRvIGBvYmplY3RgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gc291cmNlIFRoZSBvYmplY3QgdG8gY29weSBzeW1ib2xzIGZyb20uXG4gKiBAcGFyYW0ge09iamVjdH0gW29iamVjdD17fV0gVGhlIG9iamVjdCB0byBjb3B5IHN5bWJvbHMgdG8uXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIGBvYmplY3RgLlxuICovXG5mdW5jdGlvbiBjb3B5U3ltYm9scyhzb3VyY2UsIG9iamVjdCkge1xuICByZXR1cm4gY29weU9iamVjdChzb3VyY2UsIGdldFN5bWJvbHMoc291cmNlKSwgb2JqZWN0KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjb3B5U3ltYm9scztcbiIsIi8qKlxuICogQXBwZW5kcyB0aGUgZWxlbWVudHMgb2YgYHZhbHVlc2AgdG8gYGFycmF5YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIG1vZGlmeS5cbiAqIEBwYXJhbSB7QXJyYXl9IHZhbHVlcyBUaGUgdmFsdWVzIHRvIGFwcGVuZC5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyBgYXJyYXlgLlxuICovXG5mdW5jdGlvbiBhcnJheVB1c2goYXJyYXksIHZhbHVlcykge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IHZhbHVlcy5sZW5ndGgsXG4gICAgICBvZmZzZXQgPSBhcnJheS5sZW5ndGg7XG5cbiAgd2hpbGUgKCsraW5kZXggPCBsZW5ndGgpIHtcbiAgICBhcnJheVtvZmZzZXQgKyBpbmRleF0gPSB2YWx1ZXNbaW5kZXhdO1xuICB9XG4gIHJldHVybiBhcnJheTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBhcnJheVB1c2g7XG4iLCJ2YXIgb3ZlckFyZyA9IHJlcXVpcmUoJy4vX292ZXJBcmcnKTtcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgZ2V0UHJvdG90eXBlID0gb3ZlckFyZyhPYmplY3QuZ2V0UHJvdG90eXBlT2YsIE9iamVjdCk7XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0UHJvdG90eXBlO1xuIiwidmFyIGFycmF5UHVzaCA9IHJlcXVpcmUoJy4vX2FycmF5UHVzaCcpLFxuICAgIGdldFByb3RvdHlwZSA9IHJlcXVpcmUoJy4vX2dldFByb3RvdHlwZScpLFxuICAgIGdldFN5bWJvbHMgPSByZXF1aXJlKCcuL19nZXRTeW1ib2xzJyksXG4gICAgc3R1YkFycmF5ID0gcmVxdWlyZSgnLi9zdHViQXJyYXknKTtcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgZm9yIHRob3NlIHdpdGggdGhlIHNhbWUgbmFtZSBhcyBvdGhlciBgbG9kYXNoYCBtZXRob2RzLiAqL1xudmFyIG5hdGl2ZUdldFN5bWJvbHMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzO1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gYXJyYXkgb2YgdGhlIG93biBhbmQgaW5oZXJpdGVkIGVudW1lcmFibGUgc3ltYm9scyBvZiBgb2JqZWN0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBzeW1ib2xzLlxuICovXG52YXIgZ2V0U3ltYm9sc0luID0gIW5hdGl2ZUdldFN5bWJvbHMgPyBzdHViQXJyYXkgOiBmdW5jdGlvbihvYmplY3QpIHtcbiAgdmFyIHJlc3VsdCA9IFtdO1xuICB3aGlsZSAob2JqZWN0KSB7XG4gICAgYXJyYXlQdXNoKHJlc3VsdCwgZ2V0U3ltYm9scyhvYmplY3QpKTtcbiAgICBvYmplY3QgPSBnZXRQcm90b3R5cGUob2JqZWN0KTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBnZXRTeW1ib2xzSW47XG4iLCJ2YXIgY29weU9iamVjdCA9IHJlcXVpcmUoJy4vX2NvcHlPYmplY3QnKSxcbiAgICBnZXRTeW1ib2xzSW4gPSByZXF1aXJlKCcuL19nZXRTeW1ib2xzSW4nKTtcblxuLyoqXG4gKiBDb3BpZXMgb3duIGFuZCBpbmhlcml0ZWQgc3ltYm9scyBvZiBgc291cmNlYCB0byBgb2JqZWN0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IHNvdXJjZSBUaGUgb2JqZWN0IHRvIGNvcHkgc3ltYm9scyBmcm9tLlxuICogQHBhcmFtIHtPYmplY3R9IFtvYmplY3Q9e31dIFRoZSBvYmplY3QgdG8gY29weSBzeW1ib2xzIHRvLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBgb2JqZWN0YC5cbiAqL1xuZnVuY3Rpb24gY29weVN5bWJvbHNJbihzb3VyY2UsIG9iamVjdCkge1xuICByZXR1cm4gY29weU9iamVjdChzb3VyY2UsIGdldFN5bWJvbHNJbihzb3VyY2UpLCBvYmplY3QpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNvcHlTeW1ib2xzSW47XG4iLCJ2YXIgYXJyYXlQdXNoID0gcmVxdWlyZSgnLi9fYXJyYXlQdXNoJyksXG4gICAgaXNBcnJheSA9IHJlcXVpcmUoJy4vaXNBcnJheScpO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBnZXRBbGxLZXlzYCBhbmQgYGdldEFsbEtleXNJbmAgd2hpY2ggdXNlc1xuICogYGtleXNGdW5jYCBhbmQgYHN5bWJvbHNGdW5jYCB0byBnZXQgdGhlIGVudW1lcmFibGUgcHJvcGVydHkgbmFtZXMgYW5kXG4gKiBzeW1ib2xzIG9mIGBvYmplY3RgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBrZXlzRnVuYyBUaGUgZnVuY3Rpb24gdG8gZ2V0IHRoZSBrZXlzIG9mIGBvYmplY3RgLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gc3ltYm9sc0Z1bmMgVGhlIGZ1bmN0aW9uIHRvIGdldCB0aGUgc3ltYm9scyBvZiBgb2JqZWN0YC5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMgYW5kIHN5bWJvbHMuXG4gKi9cbmZ1bmN0aW9uIGJhc2VHZXRBbGxLZXlzKG9iamVjdCwga2V5c0Z1bmMsIHN5bWJvbHNGdW5jKSB7XG4gIHZhciByZXN1bHQgPSBrZXlzRnVuYyhvYmplY3QpO1xuICByZXR1cm4gaXNBcnJheShvYmplY3QpID8gcmVzdWx0IDogYXJyYXlQdXNoKHJlc3VsdCwgc3ltYm9sc0Z1bmMob2JqZWN0KSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUdldEFsbEtleXM7XG4iLCJ2YXIgYmFzZUdldEFsbEtleXMgPSByZXF1aXJlKCcuL19iYXNlR2V0QWxsS2V5cycpLFxuICAgIGdldFN5bWJvbHMgPSByZXF1aXJlKCcuL19nZXRTeW1ib2xzJyksXG4gICAga2V5cyA9IHJlcXVpcmUoJy4va2V5cycpO1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gYXJyYXkgb2Ygb3duIGVudW1lcmFibGUgcHJvcGVydHkgbmFtZXMgYW5kIHN5bWJvbHMgb2YgYG9iamVjdGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMgYW5kIHN5bWJvbHMuXG4gKi9cbmZ1bmN0aW9uIGdldEFsbEtleXMob2JqZWN0KSB7XG4gIHJldHVybiBiYXNlR2V0QWxsS2V5cyhvYmplY3QsIGtleXMsIGdldFN5bWJvbHMpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldEFsbEtleXM7XG4iLCJ2YXIgYmFzZUdldEFsbEtleXMgPSByZXF1aXJlKCcuL19iYXNlR2V0QWxsS2V5cycpLFxuICAgIGdldFN5bWJvbHNJbiA9IHJlcXVpcmUoJy4vX2dldFN5bWJvbHNJbicpLFxuICAgIGtleXNJbiA9IHJlcXVpcmUoJy4va2V5c0luJyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhcnJheSBvZiBvd24gYW5kIGluaGVyaXRlZCBlbnVtZXJhYmxlIHByb3BlcnR5IG5hbWVzIGFuZFxuICogc3ltYm9scyBvZiBgb2JqZWN0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcyBhbmQgc3ltYm9scy5cbiAqL1xuZnVuY3Rpb24gZ2V0QWxsS2V5c0luKG9iamVjdCkge1xuICByZXR1cm4gYmFzZUdldEFsbEtleXMob2JqZWN0LCBrZXlzSW4sIGdldFN5bWJvbHNJbik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0QWxsS2V5c0luO1xuIiwidmFyIGdldE5hdGl2ZSA9IHJlcXVpcmUoJy4vX2dldE5hdGl2ZScpLFxuICAgIHJvb3QgPSByZXF1aXJlKCcuL19yb290Jyk7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIHRoYXQgYXJlIHZlcmlmaWVkIHRvIGJlIG5hdGl2ZS4gKi9cbnZhciBEYXRhVmlldyA9IGdldE5hdGl2ZShyb290LCAnRGF0YVZpZXcnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBEYXRhVmlldztcbiIsInZhciBnZXROYXRpdmUgPSByZXF1aXJlKCcuL19nZXROYXRpdmUnKSxcbiAgICByb290ID0gcmVxdWlyZSgnLi9fcm9vdCcpO1xuXG4vKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyB0aGF0IGFyZSB2ZXJpZmllZCB0byBiZSBuYXRpdmUuICovXG52YXIgUHJvbWlzZSA9IGdldE5hdGl2ZShyb290LCAnUHJvbWlzZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFByb21pc2U7XG4iLCJ2YXIgZ2V0TmF0aXZlID0gcmVxdWlyZSgnLi9fZ2V0TmF0aXZlJyksXG4gICAgcm9vdCA9IHJlcXVpcmUoJy4vX3Jvb3QnKTtcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgdGhhdCBhcmUgdmVyaWZpZWQgdG8gYmUgbmF0aXZlLiAqL1xudmFyIFNldCA9IGdldE5hdGl2ZShyb290LCAnU2V0Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gU2V0O1xuIiwidmFyIGdldE5hdGl2ZSA9IHJlcXVpcmUoJy4vX2dldE5hdGl2ZScpLFxuICAgIHJvb3QgPSByZXF1aXJlKCcuL19yb290Jyk7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIHRoYXQgYXJlIHZlcmlmaWVkIHRvIGJlIG5hdGl2ZS4gKi9cbnZhciBXZWFrTWFwID0gZ2V0TmF0aXZlKHJvb3QsICdXZWFrTWFwJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gV2Vha01hcDtcbiIsInZhciBEYXRhVmlldyA9IHJlcXVpcmUoJy4vX0RhdGFWaWV3JyksXG4gICAgTWFwID0gcmVxdWlyZSgnLi9fTWFwJyksXG4gICAgUHJvbWlzZSA9IHJlcXVpcmUoJy4vX1Byb21pc2UnKSxcbiAgICBTZXQgPSByZXF1aXJlKCcuL19TZXQnKSxcbiAgICBXZWFrTWFwID0gcmVxdWlyZSgnLi9fV2Vha01hcCcpLFxuICAgIGJhc2VHZXRUYWcgPSByZXF1aXJlKCcuL19iYXNlR2V0VGFnJyksXG4gICAgdG9Tb3VyY2UgPSByZXF1aXJlKCcuL190b1NvdXJjZScpO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgbWFwVGFnID0gJ1tvYmplY3QgTWFwXScsXG4gICAgb2JqZWN0VGFnID0gJ1tvYmplY3QgT2JqZWN0XScsXG4gICAgcHJvbWlzZVRhZyA9ICdbb2JqZWN0IFByb21pc2VdJyxcbiAgICBzZXRUYWcgPSAnW29iamVjdCBTZXRdJyxcbiAgICB3ZWFrTWFwVGFnID0gJ1tvYmplY3QgV2Vha01hcF0nO1xuXG52YXIgZGF0YVZpZXdUYWcgPSAnW29iamVjdCBEYXRhVmlld10nO1xuXG4vKiogVXNlZCB0byBkZXRlY3QgbWFwcywgc2V0cywgYW5kIHdlYWttYXBzLiAqL1xudmFyIGRhdGFWaWV3Q3RvclN0cmluZyA9IHRvU291cmNlKERhdGFWaWV3KSxcbiAgICBtYXBDdG9yU3RyaW5nID0gdG9Tb3VyY2UoTWFwKSxcbiAgICBwcm9taXNlQ3RvclN0cmluZyA9IHRvU291cmNlKFByb21pc2UpLFxuICAgIHNldEN0b3JTdHJpbmcgPSB0b1NvdXJjZShTZXQpLFxuICAgIHdlYWtNYXBDdG9yU3RyaW5nID0gdG9Tb3VyY2UoV2Vha01hcCk7XG5cbi8qKlxuICogR2V0cyB0aGUgYHRvU3RyaW5nVGFnYCBvZiBgdmFsdWVgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIGB0b1N0cmluZ1RhZ2AuXG4gKi9cbnZhciBnZXRUYWcgPSBiYXNlR2V0VGFnO1xuXG4vLyBGYWxsYmFjayBmb3IgZGF0YSB2aWV3cywgbWFwcywgc2V0cywgYW5kIHdlYWsgbWFwcyBpbiBJRSAxMSBhbmQgcHJvbWlzZXMgaW4gTm9kZS5qcyA8IDYuXG5pZiAoKERhdGFWaWV3ICYmIGdldFRhZyhuZXcgRGF0YVZpZXcobmV3IEFycmF5QnVmZmVyKDEpKSkgIT0gZGF0YVZpZXdUYWcpIHx8XG4gICAgKE1hcCAmJiBnZXRUYWcobmV3IE1hcCkgIT0gbWFwVGFnKSB8fFxuICAgIChQcm9taXNlICYmIGdldFRhZyhQcm9taXNlLnJlc29sdmUoKSkgIT0gcHJvbWlzZVRhZykgfHxcbiAgICAoU2V0ICYmIGdldFRhZyhuZXcgU2V0KSAhPSBzZXRUYWcpIHx8XG4gICAgKFdlYWtNYXAgJiYgZ2V0VGFnKG5ldyBXZWFrTWFwKSAhPSB3ZWFrTWFwVGFnKSkge1xuICBnZXRUYWcgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHZhciByZXN1bHQgPSBiYXNlR2V0VGFnKHZhbHVlKSxcbiAgICAgICAgQ3RvciA9IHJlc3VsdCA9PSBvYmplY3RUYWcgPyB2YWx1ZS5jb25zdHJ1Y3RvciA6IHVuZGVmaW5lZCxcbiAgICAgICAgY3RvclN0cmluZyA9IEN0b3IgPyB0b1NvdXJjZShDdG9yKSA6ICcnO1xuXG4gICAgaWYgKGN0b3JTdHJpbmcpIHtcbiAgICAgIHN3aXRjaCAoY3RvclN0cmluZykge1xuICAgICAgICBjYXNlIGRhdGFWaWV3Q3RvclN0cmluZzogcmV0dXJuIGRhdGFWaWV3VGFnO1xuICAgICAgICBjYXNlIG1hcEN0b3JTdHJpbmc6IHJldHVybiBtYXBUYWc7XG4gICAgICAgIGNhc2UgcHJvbWlzZUN0b3JTdHJpbmc6IHJldHVybiBwcm9taXNlVGFnO1xuICAgICAgICBjYXNlIHNldEN0b3JTdHJpbmc6IHJldHVybiBzZXRUYWc7XG4gICAgICAgIGNhc2Ugd2Vha01hcEN0b3JTdHJpbmc6IHJldHVybiB3ZWFrTWFwVGFnO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldFRhZztcbiIsIi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogSW5pdGlhbGl6ZXMgYW4gYXJyYXkgY2xvbmUuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IFRoZSBhcnJheSB0byBjbG9uZS5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgaW5pdGlhbGl6ZWQgY2xvbmUuXG4gKi9cbmZ1bmN0aW9uIGluaXRDbG9uZUFycmF5KGFycmF5KSB7XG4gIHZhciBsZW5ndGggPSBhcnJheS5sZW5ndGgsXG4gICAgICByZXN1bHQgPSBhcnJheS5jb25zdHJ1Y3RvcihsZW5ndGgpO1xuXG4gIC8vIEFkZCBwcm9wZXJ0aWVzIGFzc2lnbmVkIGJ5IGBSZWdFeHAjZXhlY2AuXG4gIGlmIChsZW5ndGggJiYgdHlwZW9mIGFycmF5WzBdID09ICdzdHJpbmcnICYmIGhhc093blByb3BlcnR5LmNhbGwoYXJyYXksICdpbmRleCcpKSB7XG4gICAgcmVzdWx0LmluZGV4ID0gYXJyYXkuaW5kZXg7XG4gICAgcmVzdWx0LmlucHV0ID0gYXJyYXkuaW5wdXQ7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpbml0Q2xvbmVBcnJheTtcbiIsInZhciByb290ID0gcmVxdWlyZSgnLi9fcm9vdCcpO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBVaW50OEFycmF5ID0gcm9vdC5VaW50OEFycmF5O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFVpbnQ4QXJyYXk7XG4iLCJ2YXIgVWludDhBcnJheSA9IHJlcXVpcmUoJy4vX1VpbnQ4QXJyYXknKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgY2xvbmUgb2YgYGFycmF5QnVmZmVyYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheUJ1ZmZlcn0gYXJyYXlCdWZmZXIgVGhlIGFycmF5IGJ1ZmZlciB0byBjbG9uZS5cbiAqIEByZXR1cm5zIHtBcnJheUJ1ZmZlcn0gUmV0dXJucyB0aGUgY2xvbmVkIGFycmF5IGJ1ZmZlci5cbiAqL1xuZnVuY3Rpb24gY2xvbmVBcnJheUJ1ZmZlcihhcnJheUJ1ZmZlcikge1xuICB2YXIgcmVzdWx0ID0gbmV3IGFycmF5QnVmZmVyLmNvbnN0cnVjdG9yKGFycmF5QnVmZmVyLmJ5dGVMZW5ndGgpO1xuICBuZXcgVWludDhBcnJheShyZXN1bHQpLnNldChuZXcgVWludDhBcnJheShhcnJheUJ1ZmZlcikpO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsb25lQXJyYXlCdWZmZXI7XG4iLCJ2YXIgY2xvbmVBcnJheUJ1ZmZlciA9IHJlcXVpcmUoJy4vX2Nsb25lQXJyYXlCdWZmZXInKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgY2xvbmUgb2YgYGRhdGFWaWV3YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IGRhdGFWaWV3IFRoZSBkYXRhIHZpZXcgdG8gY2xvbmUuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtpc0RlZXBdIFNwZWNpZnkgYSBkZWVwIGNsb25lLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgY2xvbmVkIGRhdGEgdmlldy5cbiAqL1xuZnVuY3Rpb24gY2xvbmVEYXRhVmlldyhkYXRhVmlldywgaXNEZWVwKSB7XG4gIHZhciBidWZmZXIgPSBpc0RlZXAgPyBjbG9uZUFycmF5QnVmZmVyKGRhdGFWaWV3LmJ1ZmZlcikgOiBkYXRhVmlldy5idWZmZXI7XG4gIHJldHVybiBuZXcgZGF0YVZpZXcuY29uc3RydWN0b3IoYnVmZmVyLCBkYXRhVmlldy5ieXRlT2Zmc2V0LCBkYXRhVmlldy5ieXRlTGVuZ3RoKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjbG9uZURhdGFWaWV3O1xuIiwiLyoqXG4gKiBBZGRzIHRoZSBrZXktdmFsdWUgYHBhaXJgIHRvIGBtYXBgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gbWFwIFRoZSBtYXAgdG8gbW9kaWZ5LlxuICogQHBhcmFtIHtBcnJheX0gcGFpciBUaGUga2V5LXZhbHVlIHBhaXIgdG8gYWRkLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBgbWFwYC5cbiAqL1xuZnVuY3Rpb24gYWRkTWFwRW50cnkobWFwLCBwYWlyKSB7XG4gIC8vIERvbid0IHJldHVybiBgbWFwLnNldGAgYmVjYXVzZSBpdCdzIG5vdCBjaGFpbmFibGUgaW4gSUUgMTEuXG4gIG1hcC5zZXQocGFpclswXSwgcGFpclsxXSk7XG4gIHJldHVybiBtYXA7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYWRkTWFwRW50cnk7XG4iLCIvKipcbiAqIEEgc3BlY2lhbGl6ZWQgdmVyc2lvbiBvZiBgXy5yZWR1Y2VgIGZvciBhcnJheXMgd2l0aG91dCBzdXBwb3J0IGZvclxuICogaXRlcmF0ZWUgc2hvcnRoYW5kcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheX0gW2FycmF5XSBUaGUgYXJyYXkgdG8gaXRlcmF0ZSBvdmVyLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0ZWUgVGhlIGZ1bmN0aW9uIGludm9rZWQgcGVyIGl0ZXJhdGlvbi5cbiAqIEBwYXJhbSB7Kn0gW2FjY3VtdWxhdG9yXSBUaGUgaW5pdGlhbCB2YWx1ZS5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2luaXRBY2N1bV0gU3BlY2lmeSB1c2luZyB0aGUgZmlyc3QgZWxlbWVudCBvZiBgYXJyYXlgIGFzXG4gKiAgdGhlIGluaXRpYWwgdmFsdWUuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgYWNjdW11bGF0ZWQgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIGFycmF5UmVkdWNlKGFycmF5LCBpdGVyYXRlZSwgYWNjdW11bGF0b3IsIGluaXRBY2N1bSkge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IGFycmF5ID09IG51bGwgPyAwIDogYXJyYXkubGVuZ3RoO1xuXG4gIGlmIChpbml0QWNjdW0gJiYgbGVuZ3RoKSB7XG4gICAgYWNjdW11bGF0b3IgPSBhcnJheVsrK2luZGV4XTtcbiAgfVxuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIGFjY3VtdWxhdG9yID0gaXRlcmF0ZWUoYWNjdW11bGF0b3IsIGFycmF5W2luZGV4XSwgaW5kZXgsIGFycmF5KTtcbiAgfVxuICByZXR1cm4gYWNjdW11bGF0b3I7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYXJyYXlSZWR1Y2U7XG4iLCIvKipcbiAqIENvbnZlcnRzIGBtYXBgIHRvIGl0cyBrZXktdmFsdWUgcGFpcnMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBtYXAgVGhlIG1hcCB0byBjb252ZXJ0LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBrZXktdmFsdWUgcGFpcnMuXG4gKi9cbmZ1bmN0aW9uIG1hcFRvQXJyYXkobWFwKSB7XG4gIHZhciBpbmRleCA9IC0xLFxuICAgICAgcmVzdWx0ID0gQXJyYXkobWFwLnNpemUpO1xuXG4gIG1hcC5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICByZXN1bHRbKytpbmRleF0gPSBba2V5LCB2YWx1ZV07XG4gIH0pO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG1hcFRvQXJyYXk7XG4iLCJ2YXIgYWRkTWFwRW50cnkgPSByZXF1aXJlKCcuL19hZGRNYXBFbnRyeScpLFxuICAgIGFycmF5UmVkdWNlID0gcmVxdWlyZSgnLi9fYXJyYXlSZWR1Y2UnKSxcbiAgICBtYXBUb0FycmF5ID0gcmVxdWlyZSgnLi9fbWFwVG9BcnJheScpO1xuXG4vKiogVXNlZCB0byBjb21wb3NlIGJpdG1hc2tzIGZvciBjbG9uaW5nLiAqL1xudmFyIENMT05FX0RFRVBfRkxBRyA9IDE7XG5cbi8qKlxuICogQ3JlYXRlcyBhIGNsb25lIG9mIGBtYXBgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gbWFwIFRoZSBtYXAgdG8gY2xvbmUuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjbG9uZUZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGNsb25lIHZhbHVlcy5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzRGVlcF0gU3BlY2lmeSBhIGRlZXAgY2xvbmUuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBjbG9uZWQgbWFwLlxuICovXG5mdW5jdGlvbiBjbG9uZU1hcChtYXAsIGlzRGVlcCwgY2xvbmVGdW5jKSB7XG4gIHZhciBhcnJheSA9IGlzRGVlcCA/IGNsb25lRnVuYyhtYXBUb0FycmF5KG1hcCksIENMT05FX0RFRVBfRkxBRykgOiBtYXBUb0FycmF5KG1hcCk7XG4gIHJldHVybiBhcnJheVJlZHVjZShhcnJheSwgYWRkTWFwRW50cnksIG5ldyBtYXAuY29uc3RydWN0b3IpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsb25lTWFwO1xuIiwiLyoqIFVzZWQgdG8gbWF0Y2ggYFJlZ0V4cGAgZmxhZ3MgZnJvbSB0aGVpciBjb2VyY2VkIHN0cmluZyB2YWx1ZXMuICovXG52YXIgcmVGbGFncyA9IC9cXHcqJC87XG5cbi8qKlxuICogQ3JlYXRlcyBhIGNsb25lIG9mIGByZWdleHBgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gcmVnZXhwIFRoZSByZWdleHAgdG8gY2xvbmUuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBjbG9uZWQgcmVnZXhwLlxuICovXG5mdW5jdGlvbiBjbG9uZVJlZ0V4cChyZWdleHApIHtcbiAgdmFyIHJlc3VsdCA9IG5ldyByZWdleHAuY29uc3RydWN0b3IocmVnZXhwLnNvdXJjZSwgcmVGbGFncy5leGVjKHJlZ2V4cCkpO1xuICByZXN1bHQubGFzdEluZGV4ID0gcmVnZXhwLmxhc3RJbmRleDtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjbG9uZVJlZ0V4cDtcbiIsIi8qKlxuICogQWRkcyBgdmFsdWVgIHRvIGBzZXRgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gc2V0IFRoZSBzZXQgdG8gbW9kaWZ5LlxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gYWRkLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyBgc2V0YC5cbiAqL1xuZnVuY3Rpb24gYWRkU2V0RW50cnkoc2V0LCB2YWx1ZSkge1xuICAvLyBEb24ndCByZXR1cm4gYHNldC5hZGRgIGJlY2F1c2UgaXQncyBub3QgY2hhaW5hYmxlIGluIElFIDExLlxuICBzZXQuYWRkKHZhbHVlKTtcbiAgcmV0dXJuIHNldDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBhZGRTZXRFbnRyeTtcbiIsIi8qKlxuICogQ29udmVydHMgYHNldGAgdG8gYW4gYXJyYXkgb2YgaXRzIHZhbHVlcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IHNldCBUaGUgc2V0IHRvIGNvbnZlcnQuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIHZhbHVlcy5cbiAqL1xuZnVuY3Rpb24gc2V0VG9BcnJheShzZXQpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICByZXN1bHQgPSBBcnJheShzZXQuc2l6ZSk7XG5cbiAgc2V0LmZvckVhY2goZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXN1bHRbKytpbmRleF0gPSB2YWx1ZTtcbiAgfSk7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc2V0VG9BcnJheTtcbiIsInZhciBhZGRTZXRFbnRyeSA9IHJlcXVpcmUoJy4vX2FkZFNldEVudHJ5JyksXG4gICAgYXJyYXlSZWR1Y2UgPSByZXF1aXJlKCcuL19hcnJheVJlZHVjZScpLFxuICAgIHNldFRvQXJyYXkgPSByZXF1aXJlKCcuL19zZXRUb0FycmF5Jyk7XG5cbi8qKiBVc2VkIHRvIGNvbXBvc2UgYml0bWFza3MgZm9yIGNsb25pbmcuICovXG52YXIgQ0xPTkVfREVFUF9GTEFHID0gMTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgY2xvbmUgb2YgYHNldGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBzZXQgVGhlIHNldCB0byBjbG9uZS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNsb25lRnVuYyBUaGUgZnVuY3Rpb24gdG8gY2xvbmUgdmFsdWVzLlxuICogQHBhcmFtIHtib29sZWFufSBbaXNEZWVwXSBTcGVjaWZ5IGEgZGVlcCBjbG9uZS5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIGNsb25lZCBzZXQuXG4gKi9cbmZ1bmN0aW9uIGNsb25lU2V0KHNldCwgaXNEZWVwLCBjbG9uZUZ1bmMpIHtcbiAgdmFyIGFycmF5ID0gaXNEZWVwID8gY2xvbmVGdW5jKHNldFRvQXJyYXkoc2V0KSwgQ0xPTkVfREVFUF9GTEFHKSA6IHNldFRvQXJyYXkoc2V0KTtcbiAgcmV0dXJuIGFycmF5UmVkdWNlKGFycmF5LCBhZGRTZXRFbnRyeSwgbmV3IHNldC5jb25zdHJ1Y3Rvcik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY2xvbmVTZXQ7XG4iLCJ2YXIgU3ltYm9sID0gcmVxdWlyZSgnLi9fU3ltYm9sJyk7XG5cbi8qKiBVc2VkIHRvIGNvbnZlcnQgc3ltYm9scyB0byBwcmltaXRpdmVzIGFuZCBzdHJpbmdzLiAqL1xudmFyIHN5bWJvbFByb3RvID0gU3ltYm9sID8gU3ltYm9sLnByb3RvdHlwZSA6IHVuZGVmaW5lZCxcbiAgICBzeW1ib2xWYWx1ZU9mID0gc3ltYm9sUHJvdG8gPyBzeW1ib2xQcm90by52YWx1ZU9mIDogdW5kZWZpbmVkO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBjbG9uZSBvZiB0aGUgYHN5bWJvbGAgb2JqZWN0LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gc3ltYm9sIFRoZSBzeW1ib2wgb2JqZWN0IHRvIGNsb25lLlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgY2xvbmVkIHN5bWJvbCBvYmplY3QuXG4gKi9cbmZ1bmN0aW9uIGNsb25lU3ltYm9sKHN5bWJvbCkge1xuICByZXR1cm4gc3ltYm9sVmFsdWVPZiA/IE9iamVjdChzeW1ib2xWYWx1ZU9mLmNhbGwoc3ltYm9sKSkgOiB7fTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjbG9uZVN5bWJvbDtcbiIsInZhciBjbG9uZUFycmF5QnVmZmVyID0gcmVxdWlyZSgnLi9fY2xvbmVBcnJheUJ1ZmZlcicpO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBjbG9uZSBvZiBgdHlwZWRBcnJheWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSB0eXBlZEFycmF5IFRoZSB0eXBlZCBhcnJheSB0byBjbG9uZS5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzRGVlcF0gU3BlY2lmeSBhIGRlZXAgY2xvbmUuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBjbG9uZWQgdHlwZWQgYXJyYXkuXG4gKi9cbmZ1bmN0aW9uIGNsb25lVHlwZWRBcnJheSh0eXBlZEFycmF5LCBpc0RlZXApIHtcbiAgdmFyIGJ1ZmZlciA9IGlzRGVlcCA/IGNsb25lQXJyYXlCdWZmZXIodHlwZWRBcnJheS5idWZmZXIpIDogdHlwZWRBcnJheS5idWZmZXI7XG4gIHJldHVybiBuZXcgdHlwZWRBcnJheS5jb25zdHJ1Y3RvcihidWZmZXIsIHR5cGVkQXJyYXkuYnl0ZU9mZnNldCwgdHlwZWRBcnJheS5sZW5ndGgpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsb25lVHlwZWRBcnJheTtcbiIsInZhciBjbG9uZUFycmF5QnVmZmVyID0gcmVxdWlyZSgnLi9fY2xvbmVBcnJheUJ1ZmZlcicpLFxuICAgIGNsb25lRGF0YVZpZXcgPSByZXF1aXJlKCcuL19jbG9uZURhdGFWaWV3JyksXG4gICAgY2xvbmVNYXAgPSByZXF1aXJlKCcuL19jbG9uZU1hcCcpLFxuICAgIGNsb25lUmVnRXhwID0gcmVxdWlyZSgnLi9fY2xvbmVSZWdFeHAnKSxcbiAgICBjbG9uZVNldCA9IHJlcXVpcmUoJy4vX2Nsb25lU2V0JyksXG4gICAgY2xvbmVTeW1ib2wgPSByZXF1aXJlKCcuL19jbG9uZVN5bWJvbCcpLFxuICAgIGNsb25lVHlwZWRBcnJheSA9IHJlcXVpcmUoJy4vX2Nsb25lVHlwZWRBcnJheScpO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgYm9vbFRhZyA9ICdbb2JqZWN0IEJvb2xlYW5dJyxcbiAgICBkYXRlVGFnID0gJ1tvYmplY3QgRGF0ZV0nLFxuICAgIG1hcFRhZyA9ICdbb2JqZWN0IE1hcF0nLFxuICAgIG51bWJlclRhZyA9ICdbb2JqZWN0IE51bWJlcl0nLFxuICAgIHJlZ2V4cFRhZyA9ICdbb2JqZWN0IFJlZ0V4cF0nLFxuICAgIHNldFRhZyA9ICdbb2JqZWN0IFNldF0nLFxuICAgIHN0cmluZ1RhZyA9ICdbb2JqZWN0IFN0cmluZ10nLFxuICAgIHN5bWJvbFRhZyA9ICdbb2JqZWN0IFN5bWJvbF0nO1xuXG52YXIgYXJyYXlCdWZmZXJUYWcgPSAnW29iamVjdCBBcnJheUJ1ZmZlcl0nLFxuICAgIGRhdGFWaWV3VGFnID0gJ1tvYmplY3QgRGF0YVZpZXddJyxcbiAgICBmbG9hdDMyVGFnID0gJ1tvYmplY3QgRmxvYXQzMkFycmF5XScsXG4gICAgZmxvYXQ2NFRhZyA9ICdbb2JqZWN0IEZsb2F0NjRBcnJheV0nLFxuICAgIGludDhUYWcgPSAnW29iamVjdCBJbnQ4QXJyYXldJyxcbiAgICBpbnQxNlRhZyA9ICdbb2JqZWN0IEludDE2QXJyYXldJyxcbiAgICBpbnQzMlRhZyA9ICdbb2JqZWN0IEludDMyQXJyYXldJyxcbiAgICB1aW50OFRhZyA9ICdbb2JqZWN0IFVpbnQ4QXJyYXldJyxcbiAgICB1aW50OENsYW1wZWRUYWcgPSAnW29iamVjdCBVaW50OENsYW1wZWRBcnJheV0nLFxuICAgIHVpbnQxNlRhZyA9ICdbb2JqZWN0IFVpbnQxNkFycmF5XScsXG4gICAgdWludDMyVGFnID0gJ1tvYmplY3QgVWludDMyQXJyYXldJztcblxuLyoqXG4gKiBJbml0aWFsaXplcyBhbiBvYmplY3QgY2xvbmUgYmFzZWQgb24gaXRzIGB0b1N0cmluZ1RhZ2AuXG4gKlxuICogKipOb3RlOioqIFRoaXMgZnVuY3Rpb24gb25seSBzdXBwb3J0cyBjbG9uaW5nIHZhbHVlcyB3aXRoIHRhZ3Mgb2ZcbiAqIGBCb29sZWFuYCwgYERhdGVgLCBgRXJyb3JgLCBgTnVtYmVyYCwgYFJlZ0V4cGAsIG9yIGBTdHJpbmdgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gY2xvbmUuXG4gKiBAcGFyYW0ge3N0cmluZ30gdGFnIFRoZSBgdG9TdHJpbmdUYWdgIG9mIHRoZSBvYmplY3QgdG8gY2xvbmUuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjbG9uZUZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGNsb25lIHZhbHVlcy5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2lzRGVlcF0gU3BlY2lmeSBhIGRlZXAgY2xvbmUuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBpbml0aWFsaXplZCBjbG9uZS5cbiAqL1xuZnVuY3Rpb24gaW5pdENsb25lQnlUYWcob2JqZWN0LCB0YWcsIGNsb25lRnVuYywgaXNEZWVwKSB7XG4gIHZhciBDdG9yID0gb2JqZWN0LmNvbnN0cnVjdG9yO1xuICBzd2l0Y2ggKHRhZykge1xuICAgIGNhc2UgYXJyYXlCdWZmZXJUYWc6XG4gICAgICByZXR1cm4gY2xvbmVBcnJheUJ1ZmZlcihvYmplY3QpO1xuXG4gICAgY2FzZSBib29sVGFnOlxuICAgIGNhc2UgZGF0ZVRhZzpcbiAgICAgIHJldHVybiBuZXcgQ3Rvcigrb2JqZWN0KTtcblxuICAgIGNhc2UgZGF0YVZpZXdUYWc6XG4gICAgICByZXR1cm4gY2xvbmVEYXRhVmlldyhvYmplY3QsIGlzRGVlcCk7XG5cbiAgICBjYXNlIGZsb2F0MzJUYWc6IGNhc2UgZmxvYXQ2NFRhZzpcbiAgICBjYXNlIGludDhUYWc6IGNhc2UgaW50MTZUYWc6IGNhc2UgaW50MzJUYWc6XG4gICAgY2FzZSB1aW50OFRhZzogY2FzZSB1aW50OENsYW1wZWRUYWc6IGNhc2UgdWludDE2VGFnOiBjYXNlIHVpbnQzMlRhZzpcbiAgICAgIHJldHVybiBjbG9uZVR5cGVkQXJyYXkob2JqZWN0LCBpc0RlZXApO1xuXG4gICAgY2FzZSBtYXBUYWc6XG4gICAgICByZXR1cm4gY2xvbmVNYXAob2JqZWN0LCBpc0RlZXAsIGNsb25lRnVuYyk7XG5cbiAgICBjYXNlIG51bWJlclRhZzpcbiAgICBjYXNlIHN0cmluZ1RhZzpcbiAgICAgIHJldHVybiBuZXcgQ3RvcihvYmplY3QpO1xuXG4gICAgY2FzZSByZWdleHBUYWc6XG4gICAgICByZXR1cm4gY2xvbmVSZWdFeHAob2JqZWN0KTtcblxuICAgIGNhc2Ugc2V0VGFnOlxuICAgICAgcmV0dXJuIGNsb25lU2V0KG9iamVjdCwgaXNEZWVwLCBjbG9uZUZ1bmMpO1xuXG4gICAgY2FzZSBzeW1ib2xUYWc6XG4gICAgICByZXR1cm4gY2xvbmVTeW1ib2wob2JqZWN0KTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGluaXRDbG9uZUJ5VGFnO1xuIiwidmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9pc09iamVjdCcpO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RDcmVhdGUgPSBPYmplY3QuY3JlYXRlO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmNyZWF0ZWAgd2l0aG91dCBzdXBwb3J0IGZvciBhc3NpZ25pbmdcbiAqIHByb3BlcnRpZXMgdG8gdGhlIGNyZWF0ZWQgb2JqZWN0LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gcHJvdG8gVGhlIG9iamVjdCB0byBpbmhlcml0IGZyb20uXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBuZXcgb2JqZWN0LlxuICovXG52YXIgYmFzZUNyZWF0ZSA9IChmdW5jdGlvbigpIHtcbiAgZnVuY3Rpb24gb2JqZWN0KCkge31cbiAgcmV0dXJuIGZ1bmN0aW9uKHByb3RvKSB7XG4gICAgaWYgKCFpc09iamVjdChwcm90bykpIHtcbiAgICAgIHJldHVybiB7fTtcbiAgICB9XG4gICAgaWYgKG9iamVjdENyZWF0ZSkge1xuICAgICAgcmV0dXJuIG9iamVjdENyZWF0ZShwcm90byk7XG4gICAgfVxuICAgIG9iamVjdC5wcm90b3R5cGUgPSBwcm90bztcbiAgICB2YXIgcmVzdWx0ID0gbmV3IG9iamVjdDtcbiAgICBvYmplY3QucHJvdG90eXBlID0gdW5kZWZpbmVkO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG59KCkpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGJhc2VDcmVhdGU7XG4iLCJ2YXIgYmFzZUNyZWF0ZSA9IHJlcXVpcmUoJy4vX2Jhc2VDcmVhdGUnKSxcbiAgICBnZXRQcm90b3R5cGUgPSByZXF1aXJlKCcuL19nZXRQcm90b3R5cGUnKSxcbiAgICBpc1Byb3RvdHlwZSA9IHJlcXVpcmUoJy4vX2lzUHJvdG90eXBlJyk7XG5cbi8qKlxuICogSW5pdGlhbGl6ZXMgYW4gb2JqZWN0IGNsb25lLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gY2xvbmUuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBpbml0aWFsaXplZCBjbG9uZS5cbiAqL1xuZnVuY3Rpb24gaW5pdENsb25lT2JqZWN0KG9iamVjdCkge1xuICByZXR1cm4gKHR5cGVvZiBvYmplY3QuY29uc3RydWN0b3IgPT0gJ2Z1bmN0aW9uJyAmJiAhaXNQcm90b3R5cGUob2JqZWN0KSlcbiAgICA/IGJhc2VDcmVhdGUoZ2V0UHJvdG90eXBlKG9iamVjdCkpXG4gICAgOiB7fTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpbml0Q2xvbmVPYmplY3Q7XG4iLCJ2YXIgU3RhY2sgPSByZXF1aXJlKCcuL19TdGFjaycpLFxuICAgIGFycmF5RWFjaCA9IHJlcXVpcmUoJy4vX2FycmF5RWFjaCcpLFxuICAgIGFzc2lnblZhbHVlID0gcmVxdWlyZSgnLi9fYXNzaWduVmFsdWUnKSxcbiAgICBiYXNlQXNzaWduID0gcmVxdWlyZSgnLi9fYmFzZUFzc2lnbicpLFxuICAgIGJhc2VBc3NpZ25JbiA9IHJlcXVpcmUoJy4vX2Jhc2VBc3NpZ25JbicpLFxuICAgIGNsb25lQnVmZmVyID0gcmVxdWlyZSgnLi9fY2xvbmVCdWZmZXInKSxcbiAgICBjb3B5QXJyYXkgPSByZXF1aXJlKCcuL19jb3B5QXJyYXknKSxcbiAgICBjb3B5U3ltYm9scyA9IHJlcXVpcmUoJy4vX2NvcHlTeW1ib2xzJyksXG4gICAgY29weVN5bWJvbHNJbiA9IHJlcXVpcmUoJy4vX2NvcHlTeW1ib2xzSW4nKSxcbiAgICBnZXRBbGxLZXlzID0gcmVxdWlyZSgnLi9fZ2V0QWxsS2V5cycpLFxuICAgIGdldEFsbEtleXNJbiA9IHJlcXVpcmUoJy4vX2dldEFsbEtleXNJbicpLFxuICAgIGdldFRhZyA9IHJlcXVpcmUoJy4vX2dldFRhZycpLFxuICAgIGluaXRDbG9uZUFycmF5ID0gcmVxdWlyZSgnLi9faW5pdENsb25lQXJyYXknKSxcbiAgICBpbml0Q2xvbmVCeVRhZyA9IHJlcXVpcmUoJy4vX2luaXRDbG9uZUJ5VGFnJyksXG4gICAgaW5pdENsb25lT2JqZWN0ID0gcmVxdWlyZSgnLi9faW5pdENsb25lT2JqZWN0JyksXG4gICAgaXNBcnJheSA9IHJlcXVpcmUoJy4vaXNBcnJheScpLFxuICAgIGlzQnVmZmVyID0gcmVxdWlyZSgnLi9pc0J1ZmZlcicpLFxuICAgIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9pc09iamVjdCcpLFxuICAgIGtleXMgPSByZXF1aXJlKCcuL2tleXMnKTtcblxuLyoqIFVzZWQgdG8gY29tcG9zZSBiaXRtYXNrcyBmb3IgY2xvbmluZy4gKi9cbnZhciBDTE9ORV9ERUVQX0ZMQUcgPSAxLFxuICAgIENMT05FX0ZMQVRfRkxBRyA9IDIsXG4gICAgQ0xPTkVfU1lNQk9MU19GTEFHID0gNDtcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIGFyZ3NUYWcgPSAnW29iamVjdCBBcmd1bWVudHNdJyxcbiAgICBhcnJheVRhZyA9ICdbb2JqZWN0IEFycmF5XScsXG4gICAgYm9vbFRhZyA9ICdbb2JqZWN0IEJvb2xlYW5dJyxcbiAgICBkYXRlVGFnID0gJ1tvYmplY3QgRGF0ZV0nLFxuICAgIGVycm9yVGFnID0gJ1tvYmplY3QgRXJyb3JdJyxcbiAgICBmdW5jVGFnID0gJ1tvYmplY3QgRnVuY3Rpb25dJyxcbiAgICBnZW5UYWcgPSAnW29iamVjdCBHZW5lcmF0b3JGdW5jdGlvbl0nLFxuICAgIG1hcFRhZyA9ICdbb2JqZWN0IE1hcF0nLFxuICAgIG51bWJlclRhZyA9ICdbb2JqZWN0IE51bWJlcl0nLFxuICAgIG9iamVjdFRhZyA9ICdbb2JqZWN0IE9iamVjdF0nLFxuICAgIHJlZ2V4cFRhZyA9ICdbb2JqZWN0IFJlZ0V4cF0nLFxuICAgIHNldFRhZyA9ICdbb2JqZWN0IFNldF0nLFxuICAgIHN0cmluZ1RhZyA9ICdbb2JqZWN0IFN0cmluZ10nLFxuICAgIHN5bWJvbFRhZyA9ICdbb2JqZWN0IFN5bWJvbF0nLFxuICAgIHdlYWtNYXBUYWcgPSAnW29iamVjdCBXZWFrTWFwXSc7XG5cbnZhciBhcnJheUJ1ZmZlclRhZyA9ICdbb2JqZWN0IEFycmF5QnVmZmVyXScsXG4gICAgZGF0YVZpZXdUYWcgPSAnW29iamVjdCBEYXRhVmlld10nLFxuICAgIGZsb2F0MzJUYWcgPSAnW29iamVjdCBGbG9hdDMyQXJyYXldJyxcbiAgICBmbG9hdDY0VGFnID0gJ1tvYmplY3QgRmxvYXQ2NEFycmF5XScsXG4gICAgaW50OFRhZyA9ICdbb2JqZWN0IEludDhBcnJheV0nLFxuICAgIGludDE2VGFnID0gJ1tvYmplY3QgSW50MTZBcnJheV0nLFxuICAgIGludDMyVGFnID0gJ1tvYmplY3QgSW50MzJBcnJheV0nLFxuICAgIHVpbnQ4VGFnID0gJ1tvYmplY3QgVWludDhBcnJheV0nLFxuICAgIHVpbnQ4Q2xhbXBlZFRhZyA9ICdbb2JqZWN0IFVpbnQ4Q2xhbXBlZEFycmF5XScsXG4gICAgdWludDE2VGFnID0gJ1tvYmplY3QgVWludDE2QXJyYXldJyxcbiAgICB1aW50MzJUYWcgPSAnW29iamVjdCBVaW50MzJBcnJheV0nO1xuXG4vKiogVXNlZCB0byBpZGVudGlmeSBgdG9TdHJpbmdUYWdgIHZhbHVlcyBzdXBwb3J0ZWQgYnkgYF8uY2xvbmVgLiAqL1xudmFyIGNsb25lYWJsZVRhZ3MgPSB7fTtcbmNsb25lYWJsZVRhZ3NbYXJnc1RhZ10gPSBjbG9uZWFibGVUYWdzW2FycmF5VGFnXSA9XG5jbG9uZWFibGVUYWdzW2FycmF5QnVmZmVyVGFnXSA9IGNsb25lYWJsZVRhZ3NbZGF0YVZpZXdUYWddID1cbmNsb25lYWJsZVRhZ3NbYm9vbFRhZ10gPSBjbG9uZWFibGVUYWdzW2RhdGVUYWddID1cbmNsb25lYWJsZVRhZ3NbZmxvYXQzMlRhZ10gPSBjbG9uZWFibGVUYWdzW2Zsb2F0NjRUYWddID1cbmNsb25lYWJsZVRhZ3NbaW50OFRhZ10gPSBjbG9uZWFibGVUYWdzW2ludDE2VGFnXSA9XG5jbG9uZWFibGVUYWdzW2ludDMyVGFnXSA9IGNsb25lYWJsZVRhZ3NbbWFwVGFnXSA9XG5jbG9uZWFibGVUYWdzW251bWJlclRhZ10gPSBjbG9uZWFibGVUYWdzW29iamVjdFRhZ10gPVxuY2xvbmVhYmxlVGFnc1tyZWdleHBUYWddID0gY2xvbmVhYmxlVGFnc1tzZXRUYWddID1cbmNsb25lYWJsZVRhZ3Nbc3RyaW5nVGFnXSA9IGNsb25lYWJsZVRhZ3Nbc3ltYm9sVGFnXSA9XG5jbG9uZWFibGVUYWdzW3VpbnQ4VGFnXSA9IGNsb25lYWJsZVRhZ3NbdWludDhDbGFtcGVkVGFnXSA9XG5jbG9uZWFibGVUYWdzW3VpbnQxNlRhZ10gPSBjbG9uZWFibGVUYWdzW3VpbnQzMlRhZ10gPSB0cnVlO1xuY2xvbmVhYmxlVGFnc1tlcnJvclRhZ10gPSBjbG9uZWFibGVUYWdzW2Z1bmNUYWddID1cbmNsb25lYWJsZVRhZ3Nbd2Vha01hcFRhZ10gPSBmYWxzZTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5jbG9uZWAgYW5kIGBfLmNsb25lRGVlcGAgd2hpY2ggdHJhY2tzXG4gKiB0cmF2ZXJzZWQgb2JqZWN0cy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2xvbmUuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGJpdG1hc2sgVGhlIGJpdG1hc2sgZmxhZ3MuXG4gKiAgMSAtIERlZXAgY2xvbmVcbiAqICAyIC0gRmxhdHRlbiBpbmhlcml0ZWQgcHJvcGVydGllc1xuICogIDQgLSBDbG9uZSBzeW1ib2xzXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY3VzdG9taXplcl0gVGhlIGZ1bmN0aW9uIHRvIGN1c3RvbWl6ZSBjbG9uaW5nLlxuICogQHBhcmFtIHtzdHJpbmd9IFtrZXldIFRoZSBrZXkgb2YgYHZhbHVlYC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb2JqZWN0XSBUaGUgcGFyZW50IG9iamVjdCBvZiBgdmFsdWVgLlxuICogQHBhcmFtIHtPYmplY3R9IFtzdGFja10gVHJhY2tzIHRyYXZlcnNlZCBvYmplY3RzIGFuZCB0aGVpciBjbG9uZSBjb3VudGVycGFydHMuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgY2xvbmVkIHZhbHVlLlxuICovXG5mdW5jdGlvbiBiYXNlQ2xvbmUodmFsdWUsIGJpdG1hc2ssIGN1c3RvbWl6ZXIsIGtleSwgb2JqZWN0LCBzdGFjaykge1xuICB2YXIgcmVzdWx0LFxuICAgICAgaXNEZWVwID0gYml0bWFzayAmIENMT05FX0RFRVBfRkxBRyxcbiAgICAgIGlzRmxhdCA9IGJpdG1hc2sgJiBDTE9ORV9GTEFUX0ZMQUcsXG4gICAgICBpc0Z1bGwgPSBiaXRtYXNrICYgQ0xPTkVfU1lNQk9MU19GTEFHO1xuXG4gIGlmIChjdXN0b21pemVyKSB7XG4gICAgcmVzdWx0ID0gb2JqZWN0ID8gY3VzdG9taXplcih2YWx1ZSwga2V5LCBvYmplY3QsIHN0YWNrKSA6IGN1c3RvbWl6ZXIodmFsdWUpO1xuICB9XG4gIGlmIChyZXN1bHQgIT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbiAgaWYgKCFpc09iamVjdCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbiAgdmFyIGlzQXJyID0gaXNBcnJheSh2YWx1ZSk7XG4gIGlmIChpc0Fycikge1xuICAgIHJlc3VsdCA9IGluaXRDbG9uZUFycmF5KHZhbHVlKTtcbiAgICBpZiAoIWlzRGVlcCkge1xuICAgICAgcmV0dXJuIGNvcHlBcnJheSh2YWx1ZSwgcmVzdWx0KTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdmFyIHRhZyA9IGdldFRhZyh2YWx1ZSksXG4gICAgICAgIGlzRnVuYyA9IHRhZyA9PSBmdW5jVGFnIHx8IHRhZyA9PSBnZW5UYWc7XG5cbiAgICBpZiAoaXNCdWZmZXIodmFsdWUpKSB7XG4gICAgICByZXR1cm4gY2xvbmVCdWZmZXIodmFsdWUsIGlzRGVlcCk7XG4gICAgfVxuICAgIGlmICh0YWcgPT0gb2JqZWN0VGFnIHx8IHRhZyA9PSBhcmdzVGFnIHx8IChpc0Z1bmMgJiYgIW9iamVjdCkpIHtcbiAgICAgIHJlc3VsdCA9IChpc0ZsYXQgfHwgaXNGdW5jKSA/IHt9IDogaW5pdENsb25lT2JqZWN0KHZhbHVlKTtcbiAgICAgIGlmICghaXNEZWVwKSB7XG4gICAgICAgIHJldHVybiBpc0ZsYXRcbiAgICAgICAgICA/IGNvcHlTeW1ib2xzSW4odmFsdWUsIGJhc2VBc3NpZ25JbihyZXN1bHQsIHZhbHVlKSlcbiAgICAgICAgICA6IGNvcHlTeW1ib2xzKHZhbHVlLCBiYXNlQXNzaWduKHJlc3VsdCwgdmFsdWUpKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCFjbG9uZWFibGVUYWdzW3RhZ10pIHtcbiAgICAgICAgcmV0dXJuIG9iamVjdCA/IHZhbHVlIDoge307XG4gICAgICB9XG4gICAgICByZXN1bHQgPSBpbml0Q2xvbmVCeVRhZyh2YWx1ZSwgdGFnLCBiYXNlQ2xvbmUsIGlzRGVlcCk7XG4gICAgfVxuICB9XG4gIC8vIENoZWNrIGZvciBjaXJjdWxhciByZWZlcmVuY2VzIGFuZCByZXR1cm4gaXRzIGNvcnJlc3BvbmRpbmcgY2xvbmUuXG4gIHN0YWNrIHx8IChzdGFjayA9IG5ldyBTdGFjayk7XG4gIHZhciBzdGFja2VkID0gc3RhY2suZ2V0KHZhbHVlKTtcbiAgaWYgKHN0YWNrZWQpIHtcbiAgICByZXR1cm4gc3RhY2tlZDtcbiAgfVxuICBzdGFjay5zZXQodmFsdWUsIHJlc3VsdCk7XG5cbiAgdmFyIGtleXNGdW5jID0gaXNGdWxsXG4gICAgPyAoaXNGbGF0ID8gZ2V0QWxsS2V5c0luIDogZ2V0QWxsS2V5cylcbiAgICA6IChpc0ZsYXQgPyBrZXlzSW4gOiBrZXlzKTtcblxuICB2YXIgcHJvcHMgPSBpc0FyciA/IHVuZGVmaW5lZCA6IGtleXNGdW5jKHZhbHVlKTtcbiAgYXJyYXlFYWNoKHByb3BzIHx8IHZhbHVlLCBmdW5jdGlvbihzdWJWYWx1ZSwga2V5KSB7XG4gICAgaWYgKHByb3BzKSB7XG4gICAgICBrZXkgPSBzdWJWYWx1ZTtcbiAgICAgIHN1YlZhbHVlID0gdmFsdWVba2V5XTtcbiAgICB9XG4gICAgLy8gUmVjdXJzaXZlbHkgcG9wdWxhdGUgY2xvbmUgKHN1c2NlcHRpYmxlIHRvIGNhbGwgc3RhY2sgbGltaXRzKS5cbiAgICBhc3NpZ25WYWx1ZShyZXN1bHQsIGtleSwgYmFzZUNsb25lKHN1YlZhbHVlLCBiaXRtYXNrLCBjdXN0b21pemVyLCBrZXksIHZhbHVlLCBzdGFjaykpO1xuICB9KTtcbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlQ2xvbmU7XG4iLCJ2YXIgYmFzZUNsb25lID0gcmVxdWlyZSgnLi9fYmFzZUNsb25lJyk7XG5cbi8qKiBVc2VkIHRvIGNvbXBvc2UgYml0bWFza3MgZm9yIGNsb25pbmcuICovXG52YXIgQ0xPTkVfREVFUF9GTEFHID0gMSxcbiAgICBDTE9ORV9TWU1CT0xTX0ZMQUcgPSA0O1xuXG4vKipcbiAqIFRoaXMgbWV0aG9kIGlzIGxpa2UgYF8uY2xvbmVgIGV4Y2VwdCB0aGF0IGl0IHJlY3Vyc2l2ZWx5IGNsb25lcyBgdmFsdWVgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMS4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byByZWN1cnNpdmVseSBjbG9uZS5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBkZWVwIGNsb25lZCB2YWx1ZS5cbiAqIEBzZWUgXy5jbG9uZVxuICogQGV4YW1wbGVcbiAqXG4gKiB2YXIgb2JqZWN0cyA9IFt7ICdhJzogMSB9LCB7ICdiJzogMiB9XTtcbiAqXG4gKiB2YXIgZGVlcCA9IF8uY2xvbmVEZWVwKG9iamVjdHMpO1xuICogY29uc29sZS5sb2coZGVlcFswXSA9PT0gb2JqZWN0c1swXSk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBjbG9uZURlZXAodmFsdWUpIHtcbiAgcmV0dXJuIGJhc2VDbG9uZSh2YWx1ZSwgQ0xPTkVfREVFUF9GTEFHIHwgQ0xPTkVfU1lNQk9MU19GTEFHKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjbG9uZURlZXA7XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgV3JhcHBlciBmcm9tICcuL3dyYXBwZXInXG5pbXBvcnQgYWRkU2xvdHMgZnJvbSAnLi4vbGliL2FkZC1zbG90cydcbmltcG9ydCBjbG9uZURlZXAgZnJvbSAnbG9kYXNoL2Nsb25lRGVlcCdcblxuZnVuY3Rpb24gdXBkYXRlIChjaGFuZ2VkRGF0YSkge1xuICAvLyB0aGUgb25seSBjb21wb25lbnQgbWFkZSBieSBtb3VudCgpXG4gIGlmICh0aGlzLiRfb3JpZ2luYWxTbG90cykge1xuICAgIHRoaXMuJHNsb3RzID0gY2xvbmVEZWVwKHRoaXMuJF9vcmlnaW5hbFNsb3RzKVxuICB9XG4gIGlmICh0aGlzLiRfbW91bnRpbmdPcHRpb25zU2xvdHMpIHtcbiAgICBhZGRTbG90cyh0aGlzLCB0aGlzLiRfbW91bnRpbmdPcHRpb25zU2xvdHMpXG4gIH1cbiAgaWYgKGNoYW5nZWREYXRhKSB7XG4gICAgT2JqZWN0LmtleXMoY2hhbmdlZERhdGEpLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgIC8vICRGbG93SWdub3JlIDogUHJvYmxlbSB3aXRoIHBvc3NpYmx5IG51bGwgdGhpcy52bVxuICAgICAgdGhpcy5fd2F0Y2hlcnMuZm9yRWFjaCgod2F0Y2hlcikgPT4ge1xuICAgICAgICBpZiAod2F0Y2hlci5leHByZXNzaW9uID09PSBrZXkpIHsgd2F0Y2hlci5ydW4oKSB9XG4gICAgICB9KVxuICAgIH0pXG4gIH0gZWxzZSB7XG4gICAgdGhpcy5fd2F0Y2hlcnMuZm9yRWFjaCh3YXRjaGVyID0+IHtcbiAgICAgIHdhdGNoZXIucnVuKClcbiAgICB9KVxuICB9XG4gIGNvbnN0IHZub2RlcyA9IHRoaXMuX3JlbmRlcigpXG4gIHRoaXMuX3VwZGF0ZSh2bm9kZXMpXG4gIHRoaXMuJGNoaWxkcmVuLmZvckVhY2goY2hpbGQgPT4gdXBkYXRlLmNhbGwoY2hpbGQpKVxufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBWdWVXcmFwcGVyIGV4dGVuZHMgV3JhcHBlciBpbXBsZW1lbnRzIEJhc2VXcmFwcGVyIHtcbiAgY29uc3RydWN0b3IgKHZtOiBDb21wb25lbnQsIG9wdGlvbnM6IFdyYXBwZXJPcHRpb25zKSB7XG4gICAgc3VwZXIodm0uX3Zub2RlLCB1cGRhdGUuYmluZCh2bSksIG9wdGlvbnMpXG5cbiAgICAvLyAkRmxvd0lnbm9yZSA6IGlzc3VlIHdpdGggZGVmaW5lUHJvcGVydHkgLSBodHRwczovL2dpdGh1Yi5jb20vZmFjZWJvb2svZmxvdy9pc3N1ZXMvMjg1XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICd2bm9kZScsICh7XG4gICAgICBnZXQ6ICgpID0+IHZtLl92bm9kZSxcbiAgICAgIHNldDogKCkgPT4ge31cbiAgICB9KSlcbiAgICAvLyAkRmxvd0lnbm9yZVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnZWxlbWVudCcsICh7XG4gICAgICBnZXQ6ICgpID0+IHZtLiRlbCxcbiAgICAgIHNldDogKCkgPT4ge31cbiAgICB9KSlcbiAgICB0aGlzLnZtID0gdm1cbiAgICB0aGlzLmlzVnVlQ29tcG9uZW50ID0gdHJ1ZVxuICAgIHRoaXMuX2VtaXR0ZWQgPSB2bS5fX2VtaXR0ZWRcbiAgICB0aGlzLl9lbWl0dGVkQnlPcmRlciA9IHZtLl9fZW1pdHRlZEJ5T3JkZXJcbiAgfVxufVxuIiwiLy8gQGZsb3dcbmltcG9ydCAkJFZ1ZSBmcm9tICd2dWUnXG5pbXBvcnQgeyB3YXJuIH0gZnJvbSAnLi91dGlsJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBhZGRNb2NrcyAobW9ja2VkUHJvcGVydGllczogT2JqZWN0LCBWdWU6IENvbXBvbmVudCkge1xuICBPYmplY3Qua2V5cyhtb2NrZWRQcm9wZXJ0aWVzKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICB0cnkge1xuICAgICAgVnVlLnByb3RvdHlwZVtrZXldID0gbW9ja2VkUHJvcGVydGllc1trZXldXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgd2FybihgY291bGQgbm90IG92ZXJ3cml0ZSBwcm9wZXJ0eSAke2tleX0sIHRoaXMgdXN1YWxseSBjYXVzZWQgYnkgYSBwbHVnaW4gdGhhdCBoYXMgYWRkZWQgdGhlIHByb3BlcnR5IGFzIGEgcmVhZC1vbmx5IHZhbHVlYClcbiAgICB9XG4gICAgJCRWdWUudXRpbC5kZWZpbmVSZWFjdGl2ZShWdWUsIGtleSwgbW9ja2VkUHJvcGVydGllc1trZXldKVxuICB9KVxufVxuIiwiaW1wb3J0IFZ1ZSBmcm9tICd2dWUnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGFkZEF0dHJzICh2bSwgYXR0cnMpIHtcbiAgY29uc3Qgb3JpZ2luYWxWdWVDb25maWcgPSBWdWUuY29uZmlnXG4gIFZ1ZS5jb25maWcuc2lsZW50ID0gdHJ1ZVxuICBpZiAoYXR0cnMpIHtcbiAgICB2bS4kYXR0cnMgPSBhdHRyc1xuICB9IGVsc2Uge1xuICAgIHZtLiRhdHRycyA9IHt9XG4gIH1cbiAgVnVlLmNvbmZpZy5zaWxlbnQgPSBvcmlnaW5hbFZ1ZUNvbmZpZy5zaWxlbnRcbn1cbiIsImltcG9ydCBWdWUgZnJvbSAndnVlJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBhZGRMaXN0ZW5lcnMgKHZtLCBsaXN0ZW5lcnMpIHtcbiAgY29uc3Qgb3JpZ2luYWxWdWVDb25maWcgPSBWdWUuY29uZmlnXG4gIFZ1ZS5jb25maWcuc2lsZW50ID0gdHJ1ZVxuICBpZiAobGlzdGVuZXJzKSB7XG4gICAgdm0uJGxpc3RlbmVycyA9IGxpc3RlbmVyc1xuICB9IGVsc2Uge1xuICAgIHZtLiRsaXN0ZW5lcnMgPSB7fVxuICB9XG4gIFZ1ZS5jb25maWcuc2lsZW50ID0gb3JpZ2luYWxWdWVDb25maWcuc2lsZW50XG59XG4iLCJmdW5jdGlvbiBhZGRQcm92aWRlIChjb21wb25lbnQsIG9wdGlvblByb3ZpZGUsIG9wdGlvbnMpIHtcbiAgY29uc3QgcHJvdmlkZSA9IHR5cGVvZiBvcHRpb25Qcm92aWRlID09PSAnZnVuY3Rpb24nXG4gICAgPyBvcHRpb25Qcm92aWRlXG4gICAgOiBPYmplY3QuYXNzaWduKHt9LCBvcHRpb25Qcm92aWRlKVxuXG4gIG9wdGlvbnMuYmVmb3JlQ3JlYXRlID0gZnVuY3Rpb24gdnVlVGVzdFV0aWxCZWZvcmVDcmVhdGUgKCkge1xuICAgIHRoaXMuX3Byb3ZpZGVkID0gdHlwZW9mIHByb3ZpZGUgPT09ICdmdW5jdGlvbidcbiAgICAgID8gcHJvdmlkZS5jYWxsKHRoaXMpXG4gICAgICA6IHByb3ZpZGVcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBhZGRQcm92aWRlXG4iLCIvLyBAZmxvd1xuXG5leHBvcnQgZnVuY3Rpb24gbG9nRXZlbnRzICh2bTogQ29tcG9uZW50LCBlbWl0dGVkOiBPYmplY3QsIGVtaXR0ZWRCeU9yZGVyOiBBcnJheTxhbnk+KSB7XG4gIGNvbnN0IGVtaXQgPSB2bS4kZW1pdFxuICB2bS4kZW1pdCA9IChuYW1lLCAuLi5hcmdzKSA9PiB7XG4gICAgKGVtaXR0ZWRbbmFtZV0gfHwgKGVtaXR0ZWRbbmFtZV0gPSBbXSkpLnB1c2goYXJncylcbiAgICBlbWl0dGVkQnlPcmRlci5wdXNoKHsgbmFtZSwgYXJncyB9KVxuICAgIHJldHVybiBlbWl0LmNhbGwodm0sIG5hbWUsIC4uLmFyZ3MpXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFkZEV2ZW50TG9nZ2VyICh2dWU6IENvbXBvbmVudCkge1xuICB2dWUubWl4aW4oe1xuICAgIGJlZm9yZUNyZWF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5fX2VtaXR0ZWQgPSBPYmplY3QuY3JlYXRlKG51bGwpXG4gICAgICB0aGlzLl9fZW1pdHRlZEJ5T3JkZXIgPSBbXVxuICAgICAgbG9nRXZlbnRzKHRoaXMsIHRoaXMuX19lbWl0dGVkLCB0aGlzLl9fZW1pdHRlZEJ5T3JkZXIpXG4gICAgfVxuICB9KVxufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZXJyb3JIYW5kbGVyIChlcnJvck9yU3RyaW5nLCB2bSkge1xuICBjb25zdCBlcnJvciA9ICh0eXBlb2YgZXJyb3JPclN0cmluZyA9PT0gJ29iamVjdCcpXG4gICAgPyBlcnJvck9yU3RyaW5nXG4gICAgOiBuZXcgRXJyb3IoZXJyb3JPclN0cmluZylcblxuICB2bS5fZXJyb3IgPSBlcnJvclxuXG4gIHRocm93IGVycm9yXG59XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgVnVlIGZyb20gJ3Z1ZSdcbmltcG9ydCBjbG9uZURlZXAgZnJvbSAnbG9kYXNoL2Nsb25lRGVlcCdcbmltcG9ydCBlcnJvckhhbmRsZXIgZnJvbSAnLi9saWIvZXJyb3ItaGFuZGxlcidcblxuZnVuY3Rpb24gY3JlYXRlTG9jYWxWdWUgKCk6IENvbXBvbmVudCB7XG4gIGNvbnN0IGluc3RhbmNlID0gVnVlLmV4dGVuZCgpXG5cbiAgLy8gY2xvbmUgZ2xvYmFsIEFQSXNcbiAgT2JqZWN0LmtleXMoVnVlKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgaWYgKCFpbnN0YW5jZS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICBjb25zdCBvcmlnaW5hbCA9IFZ1ZVtrZXldXG4gICAgICBpbnN0YW5jZVtrZXldID0gdHlwZW9mIG9yaWdpbmFsID09PSAnb2JqZWN0J1xuICAgICAgICA/IGNsb25lRGVlcChvcmlnaW5hbClcbiAgICAgICAgOiBvcmlnaW5hbFxuICAgIH1cbiAgfSlcblxuICAvLyBjb25maWcgaXMgbm90IGVudW1lcmFibGVcbiAgaW5zdGFuY2UuY29uZmlnID0gY2xvbmVEZWVwKFZ1ZS5jb25maWcpXG5cbiAgaW5zdGFuY2UuY29uZmlnLmVycm9ySGFuZGxlciA9IGVycm9ySGFuZGxlclxuXG4gIC8vIG9wdGlvbiBtZXJnZSBzdHJhdGVnaWVzIG5lZWQgdG8gYmUgZXhwb3NlZCBieSByZWZlcmVuY2VcbiAgLy8gc28gdGhhdCBtZXJnZSBzdHJhdHMgcmVnaXN0ZXJlZCBieSBwbGd1aW5zIGNhbiB3b3JrIHByb3Blcmx5XG4gIGluc3RhbmNlLmNvbmZpZy5vcHRpb25NZXJnZVN0cmF0ZWdpZXMgPSBWdWUuY29uZmlnLm9wdGlvbk1lcmdlU3RyYXRlZ2llc1xuXG4gIC8vIG1ha2Ugc3VyZSBhbGwgZXh0ZW5kcyBhcmUgYmFzZWQgb24gdGhpcyBpbnN0YW5jZS5cbiAgLy8gdGhpcyBpcyBpbXBvcnRhbnQgc28gdGhhdCBnbG9iYWwgY29tcG9uZW50cyByZWdpc3RlcmVkIGJ5IHBsdWdpbnMsXG4gIC8vIGUuZy4gcm91dGVyLWxpbmsgYXJlIGNyZWF0ZWQgdXNpbmcgdGhlIGNvcnJlY3QgYmFzZSBjb25zdHJ1Y3RvclxuICBpbnN0YW5jZS5vcHRpb25zLl9iYXNlID0gaW5zdGFuY2VcblxuICAvLyBjb21wYXQgZm9yIHZ1ZS1yb3V0ZXIgPCAyLjcuMSB3aGVyZSBpdCBkb2VzIG5vdCBhbGxvdyBtdWx0aXBsZSBpbnN0YWxsc1xuICBjb25zdCB1c2UgPSBpbnN0YW5jZS51c2VcbiAgaW5zdGFuY2UudXNlID0gKHBsdWdpbiwgLi4ucmVzdCkgPT4ge1xuICAgIGlmIChwbHVnaW4uaW5zdGFsbGVkID09PSB0cnVlKSB7XG4gICAgICBwbHVnaW4uaW5zdGFsbGVkID0gZmFsc2VcbiAgICB9XG4gICAgaWYgKHBsdWdpbi5pbnN0YWxsICYmIHBsdWdpbi5pbnN0YWxsLmluc3RhbGxlZCA9PT0gdHJ1ZSkge1xuICAgICAgcGx1Z2luLmluc3RhbGwuaW5zdGFsbGVkID0gZmFsc2VcbiAgICB9XG4gICAgdXNlLmNhbGwoaW5zdGFuY2UsIHBsdWdpbiwgLi4ucmVzdClcbiAgfVxuICByZXR1cm4gaW5zdGFuY2Vcbn1cblxuZXhwb3J0IGRlZmF1bHQgY3JlYXRlTG9jYWxWdWVcbiIsIi8vIEBmbG93XG5cbmltcG9ydCB7IHdhcm4gfSBmcm9tICcuLi9saWIvdXRpbCdcblxuZnVuY3Rpb24gZ2V0UmVhbENoaWxkICh2bm9kZTogP1ZOb2RlKTogP1ZOb2RlIHtcbiAgY29uc3QgY29tcE9wdGlvbnMgPSB2bm9kZSAmJiB2bm9kZS5jb21wb25lbnRPcHRpb25zXG4gIGlmIChjb21wT3B0aW9ucyAmJiBjb21wT3B0aW9ucy5DdG9yLm9wdGlvbnMuYWJzdHJhY3QpIHtcbiAgICByZXR1cm4gZ2V0UmVhbENoaWxkKGdldEZpcnN0Q29tcG9uZW50Q2hpbGQoY29tcE9wdGlvbnMuY2hpbGRyZW4pKVxuICB9IGVsc2Uge1xuICAgIHJldHVybiB2bm9kZVxuICB9XG59XG5cbmZ1bmN0aW9uIGlzU2FtZUNoaWxkIChjaGlsZDogVk5vZGUsIG9sZENoaWxkOiBWTm9kZSk6IGJvb2xlYW4ge1xuICByZXR1cm4gb2xkQ2hpbGQua2V5ID09PSBjaGlsZC5rZXkgJiYgb2xkQ2hpbGQudGFnID09PSBjaGlsZC50YWdcbn1cblxuZnVuY3Rpb24gZ2V0Rmlyc3RDb21wb25lbnRDaGlsZCAoY2hpbGRyZW46ID9BcnJheTxWTm9kZT4pOiA/Vk5vZGUge1xuICBpZiAoQXJyYXkuaXNBcnJheShjaGlsZHJlbikpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBjID0gY2hpbGRyZW5baV1cbiAgICAgIGlmIChjICYmIChjLmNvbXBvbmVudE9wdGlvbnMgfHwgaXNBc3luY1BsYWNlaG9sZGVyKGMpKSkge1xuICAgICAgICByZXR1cm4gY1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBpc1ByaW1pdGl2ZSAodmFsdWU6IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gKFxuICAgIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgfHxcbiAgICB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInIHx8XG4gICAgLy8gJEZsb3dJZ25vcmVcbiAgICB0eXBlb2YgdmFsdWUgPT09ICdzeW1ib2wnIHx8XG4gICAgdHlwZW9mIHZhbHVlID09PSAnYm9vbGVhbidcbiAgKVxufVxuXG5mdW5jdGlvbiBpc0FzeW5jUGxhY2Vob2xkZXIgKG5vZGU6IFZOb2RlKTogYm9vbGVhbiB7XG4gIHJldHVybiBub2RlLmlzQ29tbWVudCAmJiBub2RlLmFzeW5jRmFjdG9yeVxufVxuY29uc3QgY2FtZWxpemVSRSA9IC8tKFxcdykvZ1xuZXhwb3J0IGNvbnN0IGNhbWVsaXplID0gKHN0cjogc3RyaW5nKTogc3RyaW5nID0+IHtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKGNhbWVsaXplUkUsIChfLCBjKSA9PiBjID8gYy50b1VwcGVyQ2FzZSgpIDogJycpXG59XG5cbmZ1bmN0aW9uIGV4dHJhY3RUcmFuc2l0aW9uRGF0YSAoY29tcDogQ29tcG9uZW50KTogT2JqZWN0IHtcbiAgY29uc3QgZGF0YSA9IHt9XG4gIGNvbnN0IG9wdGlvbnMgPSBjb21wLiRvcHRpb25zXG4gIC8vIHByb3BzXG4gIGZvciAoY29uc3Qga2V5IGluIG9wdGlvbnMucHJvcHNEYXRhKSB7XG4gICAgZGF0YVtrZXldID0gY29tcFtrZXldXG4gIH1cbiAgLy8gZXZlbnRzLlxuICAvLyBleHRyYWN0IGxpc3RlbmVycyBhbmQgcGFzcyB0aGVtIGRpcmVjdGx5IHRvIHRoZSB0cmFuc2l0aW9uIG1ldGhvZHNcbiAgY29uc3QgbGlzdGVuZXJzOiA/T2JqZWN0ID0gb3B0aW9ucy5fcGFyZW50TGlzdGVuZXJzXG4gIGZvciAoY29uc3Qga2V5IGluIGxpc3RlbmVycykge1xuICAgIGRhdGFbY2FtZWxpemUoa2V5KV0gPSBsaXN0ZW5lcnNba2V5XVxuICB9XG4gIHJldHVybiBkYXRhXG59XG5cbmZ1bmN0aW9uIGhhc1BhcmVudFRyYW5zaXRpb24gKHZub2RlOiBWTm9kZSk6ID9ib29sZWFuIHtcbiAgd2hpbGUgKCh2bm9kZSA9IHZub2RlLnBhcmVudCkpIHtcbiAgICBpZiAodm5vZGUuZGF0YS50cmFuc2l0aW9uKSB7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCB7XG4gIHJlbmRlciAoaDogRnVuY3Rpb24pIHtcbiAgICBsZXQgY2hpbGRyZW46ID9BcnJheTxWTm9kZT4gPSB0aGlzLiRvcHRpb25zLl9yZW5kZXJDaGlsZHJlblxuICAgIGlmICghY2hpbGRyZW4pIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgICAvLyBmaWx0ZXIgb3V0IHRleHQgbm9kZXMgKHBvc3NpYmxlIHdoaXRlc3BhY2VzKVxuICAgIGNoaWxkcmVuID0gY2hpbGRyZW4uZmlsdGVyKChjOiBWTm9kZSkgPT4gYy50YWcgfHwgaXNBc3luY1BsYWNlaG9sZGVyKGMpKVxuICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICBpZiAoIWNoaWxkcmVuLmxlbmd0aCkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgIC8vIHdhcm4gbXVsdGlwbGUgZWxlbWVudHNcbiAgICBpZiAoY2hpbGRyZW4ubGVuZ3RoID4gMSkge1xuICAgICAgd2FybihcbiAgICAgICAgICc8dHJhbnNpdGlvbj4gY2FuIG9ubHkgYmUgdXNlZCBvbiBhIHNpbmdsZSBlbGVtZW50LiBVc2UgJyArXG4gICAgICAgICAnPHRyYW5zaXRpb24tZ3JvdXA+IGZvciBsaXN0cy4nXG4gICAgICAgKVxuICAgIH1cblxuICAgIGNvbnN0IG1vZGU6IHN0cmluZyA9IHRoaXMubW9kZVxuXG4gICAgIC8vIHdhcm4gaW52YWxpZCBtb2RlXG4gICAgaWYgKG1vZGUgJiYgbW9kZSAhPT0gJ2luLW91dCcgJiYgbW9kZSAhPT0gJ291dC1pbidcbiAgICAgKSB7XG4gICAgICB3YXJuKFxuICAgICAgICAgJ2ludmFsaWQgPHRyYW5zaXRpb24+IG1vZGU6ICcgKyBtb2RlXG4gICAgICAgKVxuICAgIH1cblxuICAgIGNvbnN0IHJhd0NoaWxkOiBWTm9kZSA9IGNoaWxkcmVuWzBdXG5cbiAgICAgLy8gaWYgdGhpcyBpcyBhIGNvbXBvbmVudCByb290IG5vZGUgYW5kIHRoZSBjb21wb25lbnQnc1xuICAgICAvLyBwYXJlbnQgY29udGFpbmVyIG5vZGUgYWxzbyBoYXMgdHJhbnNpdGlvbiwgc2tpcC5cbiAgICBpZiAoaGFzUGFyZW50VHJhbnNpdGlvbih0aGlzLiR2bm9kZSkpIHtcbiAgICAgIHJldHVybiByYXdDaGlsZFxuICAgIH1cblxuICAgICAvLyBhcHBseSB0cmFuc2l0aW9uIGRhdGEgdG8gY2hpbGRcbiAgICAgLy8gdXNlIGdldFJlYWxDaGlsZCgpIHRvIGlnbm9yZSBhYnN0cmFjdCBjb21wb25lbnRzIGUuZy4ga2VlcC1hbGl2ZVxuICAgIGNvbnN0IGNoaWxkOiA/Vk5vZGUgPSBnZXRSZWFsQ2hpbGQocmF3Q2hpbGQpXG5cbiAgICBpZiAoIWNoaWxkKSB7XG4gICAgICByZXR1cm4gcmF3Q2hpbGRcbiAgICB9XG5cbiAgICBjb25zdCBpZDogc3RyaW5nID0gYF9fdHJhbnNpdGlvbi0ke3RoaXMuX3VpZH0tYFxuICAgIGNoaWxkLmtleSA9IGNoaWxkLmtleSA9PSBudWxsXG4gICAgICA/IGNoaWxkLmlzQ29tbWVudFxuICAgICAgICA/IGlkICsgJ2NvbW1lbnQnXG4gICAgICAgIDogaWQgKyBjaGlsZC50YWdcbiAgICAgIDogaXNQcmltaXRpdmUoY2hpbGQua2V5KVxuICAgICAgICA/IChTdHJpbmcoY2hpbGQua2V5KS5pbmRleE9mKGlkKSA9PT0gMCA/IGNoaWxkLmtleSA6IGlkICsgY2hpbGQua2V5KVxuICAgICAgICA6IGNoaWxkLmtleVxuXG4gICAgY29uc3QgZGF0YTogT2JqZWN0ID0gKGNoaWxkLmRhdGEgfHwgKGNoaWxkLmRhdGEgPSB7fSkpLnRyYW5zaXRpb24gPSBleHRyYWN0VHJhbnNpdGlvbkRhdGEodGhpcylcbiAgICBjb25zdCBvbGRSYXdDaGlsZDogP1ZOb2RlID0gdGhpcy5fdm5vZGVcbiAgICBjb25zdCBvbGRDaGlsZDogP1ZOb2RlID0gZ2V0UmVhbENoaWxkKG9sZFJhd0NoaWxkKVxuICAgIGlmIChjaGlsZC5kYXRhLmRpcmVjdGl2ZXMgJiYgY2hpbGQuZGF0YS5kaXJlY3RpdmVzLnNvbWUoZCA9PiBkLm5hbWUgPT09ICdzaG93JykpIHtcbiAgICAgIGNoaWxkLmRhdGEuc2hvdyA9IHRydWVcbiAgICB9XG5cbiAgICAgLy8gbWFyayB2LXNob3dcbiAgICAgLy8gc28gdGhhdCB0aGUgdHJhbnNpdGlvbiBtb2R1bGUgY2FuIGhhbmQgb3ZlciB0aGUgY29udHJvbCB0byB0aGUgZGlyZWN0aXZlXG4gICAgaWYgKGNoaWxkLmRhdGEuZGlyZWN0aXZlcyAmJiBjaGlsZC5kYXRhLmRpcmVjdGl2ZXMuc29tZShkID0+IGQubmFtZSA9PT0gJ3Nob3cnKSkge1xuICAgICAgY2hpbGQuZGF0YS5zaG93ID0gdHJ1ZVxuICAgIH1cbiAgICBpZiAoXG4gICAgICAgICBvbGRDaGlsZCAmJlxuICAgICAgICAgb2xkQ2hpbGQuZGF0YSAmJlxuICAgICAgICAgIWlzU2FtZUNoaWxkKGNoaWxkLCBvbGRDaGlsZCkgJiZcbiAgICAgICAgICFpc0FzeW5jUGxhY2Vob2xkZXIob2xkQ2hpbGQpICYmXG4gICAgICAgICAvLyAjNjY4NyBjb21wb25lbnQgcm9vdCBpcyBhIGNvbW1lbnQgbm9kZVxuICAgICAgICAgIShvbGRDaGlsZC5jb21wb25lbnRJbnN0YW5jZSAmJiBvbGRDaGlsZC5jb21wb25lbnRJbnN0YW5jZS5fdm5vZGUuaXNDb21tZW50KVxuICAgICAgICkge1xuICAgICAgb2xkQ2hpbGQuZGF0YSA9IHsgLi4uZGF0YSB9XG4gICAgfVxuICAgIHJldHVybiByYXdDaGlsZFxuICB9XG59XG4iLCIvLyBAZmxvd1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIHJlbmRlciAoaDogRnVuY3Rpb24pIHtcbiAgICBjb25zdCB0YWc6IHN0cmluZyA9IHRoaXMudGFnIHx8IHRoaXMuJHZub2RlLmRhdGEudGFnIHx8ICdzcGFuJ1xuICAgIGNvbnN0IGNoaWxkcmVuOiBBcnJheTxWTm9kZT4gPSB0aGlzLiRzbG90cy5kZWZhdWx0IHx8IFtdXG5cbiAgICByZXR1cm4gaCh0YWcsIG51bGwsIGNoaWxkcmVuKVxuICB9XG59XG4iLCJpbXBvcnQgVHJhbnNpdGlvblN0dWIgZnJvbSAnLi9jb21wb25lbnRzL1RyYW5zaXRpb25TdHViJ1xuaW1wb3J0IFRyYW5zaXRpb25Hcm91cFN0dWIgZnJvbSAnLi9jb21wb25lbnRzL1RyYW5zaXRpb25Hcm91cFN0dWInXG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgc3R1YnM6IHtcbiAgICB0cmFuc2l0aW9uOiBUcmFuc2l0aW9uU3R1YixcbiAgICAndHJhbnNpdGlvbi1ncm91cCc6IFRyYW5zaXRpb25Hcm91cFN0dWJcbiAgfVxufVxuIiwiLy8gQGZsb3dcbmltcG9ydCBjb25maWcgZnJvbSAnLi4vY29uZmlnJ1xuXG5mdW5jdGlvbiBnZXRTdHVicyAob3B0aW9uU3R1YnMpIHtcbiAgaWYgKG9wdGlvblN0dWJzIHx8IE9iamVjdC5rZXlzKGNvbmZpZy5zdHVicykubGVuZ3RoID4gMCkge1xuICAgIGlmIChBcnJheS5pc0FycmF5KG9wdGlvblN0dWJzKSkge1xuICAgICAgcmV0dXJuIFsuLi5vcHRpb25TdHVicywgLi4uT2JqZWN0LmtleXMoY29uZmlnLnN0dWJzKV1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgLi4uY29uZmlnLnN0dWJzLFxuICAgICAgICAuLi5vcHRpb25TdHVic1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBleHRyYWN0T3B0aW9ucyAoXG4gIG9wdGlvbnM6IE9wdGlvbnNcbik6IE9wdGlvbnMge1xuICByZXR1cm4ge1xuICAgIG1vY2tzOiBvcHRpb25zLm1vY2tzLFxuICAgIGNvbnRleHQ6IG9wdGlvbnMuY29udGV4dCxcbiAgICBwcm92aWRlOiBvcHRpb25zLnByb3ZpZGUsXG4gICAgc3R1YnM6IGdldFN0dWJzKG9wdGlvbnMuc3R1YnMpLFxuICAgIGF0dHJzOiBvcHRpb25zLmF0dHJzLFxuICAgIGxpc3RlbmVyczogb3B0aW9ucy5saXN0ZW5lcnMsXG4gICAgc2xvdHM6IG9wdGlvbnMuc2xvdHMsXG4gICAgbG9jYWxWdWU6IG9wdGlvbnMubG9jYWxWdWVcbiAgfVxufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZGVsZXRlTW91bnRpbmdPcHRpb25zIChvcHRpb25zKSB7XG4gIGRlbGV0ZSBvcHRpb25zLmN1c3RvbVxuICBkZWxldGUgb3B0aW9ucy5hdHRhY2hUb0RvY3VtZW50XG4gIGRlbGV0ZSBvcHRpb25zLm1vY2tzXG4gIGRlbGV0ZSBvcHRpb25zLnNsb3RzXG4gIGRlbGV0ZSBvcHRpb25zLmxvY2FsVnVlXG4gIGRlbGV0ZSBvcHRpb25zLnN0dWJzXG4gIGRlbGV0ZSBvcHRpb25zLmNvbnRleHRcbiAgZGVsZXRlIG9wdGlvbnMuY2xvbmVcbiAgZGVsZXRlIG9wdGlvbnMuYXR0cnNcbiAgZGVsZXRlIG9wdGlvbnMubGlzdGVuZXJzXG59XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgeyBjb21waWxlVG9GdW5jdGlvbnMgfSBmcm9tICd2dWUtdGVtcGxhdGUtY29tcGlsZXInXG5pbXBvcnQgeyB0aHJvd0Vycm9yIH0gZnJvbSAnLi91dGlsJ1xuXG5mdW5jdGlvbiBpc1ZhbGlkU2xvdCAoc2xvdDogYW55KTogYm9vbGVhbiB7XG4gIHJldHVybiBBcnJheS5pc0FycmF5KHNsb3QpIHx8IChzbG90ICE9PSBudWxsICYmIHR5cGVvZiBzbG90ID09PSAnb2JqZWN0JykgfHwgdHlwZW9mIHNsb3QgPT09ICdzdHJpbmcnXG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUZ1bmN0aW9uYWxTbG90cyAoc2xvdHMgPSB7fSwgaCkge1xuICBpZiAoQXJyYXkuaXNBcnJheShzbG90cy5kZWZhdWx0KSkge1xuICAgIHJldHVybiBzbG90cy5kZWZhdWx0Lm1hcChoKVxuICB9XG5cbiAgaWYgKHR5cGVvZiBzbG90cy5kZWZhdWx0ID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBbaChjb21waWxlVG9GdW5jdGlvbnMoc2xvdHMuZGVmYXVsdCkpXVxuICB9XG4gIGNvbnN0IGNoaWxkcmVuID0gW11cbiAgT2JqZWN0LmtleXMoc2xvdHMpLmZvckVhY2goc2xvdFR5cGUgPT4ge1xuICAgIGlmIChBcnJheS5pc0FycmF5KHNsb3RzW3Nsb3RUeXBlXSkpIHtcbiAgICAgIHNsb3RzW3Nsb3RUeXBlXS5mb3JFYWNoKHNsb3QgPT4ge1xuICAgICAgICBpZiAoIWlzVmFsaWRTbG90KHNsb3QpKSB7XG4gICAgICAgICAgdGhyb3dFcnJvcignc2xvdHNba2V5XSBtdXN0IGJlIGEgQ29tcG9uZW50LCBzdHJpbmcgb3IgYW4gYXJyYXkgb2YgQ29tcG9uZW50cycpXG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY29tcG9uZW50ID0gdHlwZW9mIHNsb3QgPT09ICdzdHJpbmcnID8gY29tcGlsZVRvRnVuY3Rpb25zKHNsb3QpIDogc2xvdFxuICAgICAgICBjb25zdCBuZXdTbG90ID0gaChjb21wb25lbnQpXG4gICAgICAgIG5ld1Nsb3QuZGF0YS5zbG90ID0gc2xvdFR5cGVcbiAgICAgICAgY2hpbGRyZW4ucHVzaChuZXdTbG90KVxuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCFpc1ZhbGlkU2xvdChzbG90c1tzbG90VHlwZV0pKSB7XG4gICAgICAgIHRocm93RXJyb3IoJ3Nsb3RzW2tleV0gbXVzdCBiZSBhIENvbXBvbmVudCwgc3RyaW5nIG9yIGFuIGFycmF5IG9mIENvbXBvbmVudHMnKVxuICAgICAgfVxuICAgICAgY29uc3QgY29tcG9uZW50ID0gdHlwZW9mIHNsb3RzW3Nsb3RUeXBlXSA9PT0gJ3N0cmluZycgPyBjb21waWxlVG9GdW5jdGlvbnMoc2xvdHNbc2xvdFR5cGVdKSA6IHNsb3RzW3Nsb3RUeXBlXVxuICAgICAgY29uc3Qgc2xvdCA9IGgoY29tcG9uZW50KVxuICAgICAgc2xvdC5kYXRhLnNsb3QgPSBzbG90VHlwZVxuICAgICAgY2hpbGRyZW4ucHVzaChzbG90KVxuICAgIH1cbiAgfSlcbiAgcmV0dXJuIGNoaWxkcmVuXG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNyZWF0ZUZ1bmN0aW9uYWxDb21wb25lbnQgKGNvbXBvbmVudDogQ29tcG9uZW50LCBtb3VudGluZ09wdGlvbnM6IE9wdGlvbnMpIHtcbiAgaWYgKG1vdW50aW5nT3B0aW9ucy5jb250ZXh0ICYmIHR5cGVvZiBtb3VudGluZ09wdGlvbnMuY29udGV4dCAhPT0gJ29iamVjdCcpIHtcbiAgICB0aHJvd0Vycm9yKCdtb3VudC5jb250ZXh0IG11c3QgYmUgYW4gb2JqZWN0JylcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgcmVuZGVyIChoOiBGdW5jdGlvbikge1xuICAgICAgcmV0dXJuIGgoXG4gICAgICAgIGNvbXBvbmVudCxcbiAgICAgICAgbW91bnRpbmdPcHRpb25zLmNvbnRleHQgfHwgY29tcG9uZW50LkZ1bmN0aW9uYWxSZW5kZXJDb250ZXh0LFxuICAgICAgICAobW91bnRpbmdPcHRpb25zLmNvbnRleHQgJiYgbW91bnRpbmdPcHRpb25zLmNvbnRleHQuY2hpbGRyZW4gJiYgbW91bnRpbmdPcHRpb25zLmNvbnRleHQuY2hpbGRyZW4ubWFwKHggPT4gdHlwZW9mIHggPT09ICdmdW5jdGlvbicgPyB4KGgpIDogeCkpIHx8IGNyZWF0ZUZ1bmN0aW9uYWxTbG90cyhtb3VudGluZ09wdGlvbnMuc2xvdHMsIGgpXG4gICAgICApXG4gICAgfSxcbiAgICBuYW1lOiBjb21wb25lbnQubmFtZVxuICB9XG59XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgYWRkU2xvdHMgZnJvbSAnLi9hZGQtc2xvdHMnXG5pbXBvcnQgYWRkTW9ja3MgZnJvbSAnLi9hZGQtbW9ja3MnXG5pbXBvcnQgYWRkQXR0cnMgZnJvbSAnLi9hZGQtYXR0cnMnXG5pbXBvcnQgYWRkTGlzdGVuZXJzIGZyb20gJy4vYWRkLWxpc3RlbmVycydcbmltcG9ydCBhZGRQcm92aWRlIGZyb20gJy4vYWRkLXByb3ZpZGUnXG5pbXBvcnQgeyBhZGRFdmVudExvZ2dlciB9IGZyb20gJy4vbG9nLWV2ZW50cydcbmltcG9ydCB7IGNyZWF0ZUNvbXBvbmVudFN0dWJzIH0gZnJvbSAnLi9zdHViLWNvbXBvbmVudHMnXG5pbXBvcnQgeyB0aHJvd0Vycm9yIH0gZnJvbSAnLi91dGlsJ1xuaW1wb3J0IHsgY29tcGlsZVRlbXBsYXRlIH0gZnJvbSAnLi9jb21waWxlLXRlbXBsYXRlJ1xuaW1wb3J0IGNyZWF0ZUxvY2FsVnVlIGZyb20gJy4uL2NyZWF0ZS1sb2NhbC12dWUnXG5pbXBvcnQgZXh0cmFjdE9wdGlvbnMgZnJvbSAnLi4vb3B0aW9ucy9leHRyYWN0LW9wdGlvbnMnXG5pbXBvcnQgZGVsZXRlTW91bnRpbmdPcHRpb25zIGZyb20gJy4uL29wdGlvbnMvZGVsZXRlLW1vdW50aW5nLW9wdGlvbnMnXG5pbXBvcnQgY3JlYXRlRnVuY3Rpb25hbENvbXBvbmVudCBmcm9tICcuL2NyZWF0ZS1mdW5jdGlvbmFsLWNvbXBvbmVudCdcbmltcG9ydCBjbG9uZURlZXAgZnJvbSAnbG9kYXNoL2Nsb25lRGVlcCdcbmltcG9ydCB7IGNvbXBvbmVudE5lZWRzQ29tcGlsaW5nIH0gZnJvbSAnLi92YWxpZGF0b3JzJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjcmVhdGVDb25zdHJ1Y3RvciAoXG4gIGNvbXBvbmVudDogQ29tcG9uZW50LFxuICBvcHRpb25zOiBPcHRpb25zXG4pOiBDb21wb25lbnQge1xuICBjb25zdCBtb3VudGluZ09wdGlvbnMgPSBleHRyYWN0T3B0aW9ucyhvcHRpb25zKVxuXG4gIGNvbnN0IHZ1ZSA9IG1vdW50aW5nT3B0aW9ucy5sb2NhbFZ1ZSB8fCBjcmVhdGVMb2NhbFZ1ZSgpXG5cbiAgaWYgKG1vdW50aW5nT3B0aW9ucy5tb2Nrcykge1xuICAgIGFkZE1vY2tzKG1vdW50aW5nT3B0aW9ucy5tb2NrcywgdnVlKVxuICB9XG5cbiAgaWYgKChjb21wb25lbnQub3B0aW9ucyAmJiBjb21wb25lbnQub3B0aW9ucy5mdW5jdGlvbmFsKSB8fCBjb21wb25lbnQuZnVuY3Rpb25hbCkge1xuICAgIGNvbXBvbmVudCA9IGNyZWF0ZUZ1bmN0aW9uYWxDb21wb25lbnQoY29tcG9uZW50LCBtb3VudGluZ09wdGlvbnMpXG4gIH0gZWxzZSBpZiAobW91bnRpbmdPcHRpb25zLmNvbnRleHQpIHtcbiAgICB0aHJvd0Vycm9yKFxuICAgICAgJ21vdW50LmNvbnRleHQgY2FuIG9ubHkgYmUgdXNlZCB3aGVuIG1vdW50aW5nIGEgZnVuY3Rpb25hbCBjb21wb25lbnQnXG4gICAgKVxuICB9XG5cbiAgaWYgKG1vdW50aW5nT3B0aW9ucy5wcm92aWRlKSB7XG4gICAgYWRkUHJvdmlkZShjb21wb25lbnQsIG1vdW50aW5nT3B0aW9ucy5wcm92aWRlLCBvcHRpb25zKVxuICB9XG5cbiAgaWYgKGNvbXBvbmVudE5lZWRzQ29tcGlsaW5nKGNvbXBvbmVudCkpIHtcbiAgICBjb21waWxlVGVtcGxhdGUoY29tcG9uZW50KVxuICB9XG5cbiAgYWRkRXZlbnRMb2dnZXIodnVlKVxuXG4gIGNvbnN0IENvbnN0cnVjdG9yID0gdnVlLmV4dGVuZChjb21wb25lbnQpXG5cbiAgY29uc3QgaW5zdGFuY2VPcHRpb25zID0geyAuLi5vcHRpb25zIH1cbiAgZGVsZXRlTW91bnRpbmdPcHRpb25zKGluc3RhbmNlT3B0aW9ucylcblxuICBpZiAobW91bnRpbmdPcHRpb25zLnN0dWJzKSB7XG4gICAgaW5zdGFuY2VPcHRpb25zLmNvbXBvbmVudHMgPSB7XG4gICAgICAuLi5pbnN0YW5jZU9wdGlvbnMuY29tcG9uZW50cyxcbiAgICAgIC8vICRGbG93SWdub3JlXG4gICAgICAuLi5jcmVhdGVDb21wb25lbnRTdHVicyhjb21wb25lbnQuY29tcG9uZW50cywgbW91bnRpbmdPcHRpb25zLnN0dWJzKVxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHZtID0gbmV3IENvbnN0cnVjdG9yKGluc3RhbmNlT3B0aW9ucylcblxuICBhZGRBdHRycyh2bSwgbW91bnRpbmdPcHRpb25zLmF0dHJzKVxuICBhZGRMaXN0ZW5lcnModm0sIG1vdW50aW5nT3B0aW9ucy5saXN0ZW5lcnMpXG5cbiAgdm0uJF9tb3VudGluZ09wdGlvbnNTbG90cyA9IG1vdW50aW5nT3B0aW9ucy5zbG90c1xuICB2bS4kX29yaWdpbmFsU2xvdHMgPSBjbG9uZURlZXAodm0uJHNsb3RzKVxuXG4gIGlmIChtb3VudGluZ09wdGlvbnMuc2xvdHMpIHtcbiAgICBhZGRTbG90cyh2bSwgbW91bnRpbmdPcHRpb25zLnNsb3RzKVxuICB9XG5cbiAgcmV0dXJuIHZtXG59XG4iLCIvLyBAZmxvd1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjcmVhdGVFbGVtZW50ICgpOiBIVE1MRWxlbWVudCB8IHZvaWQge1xuICBpZiAoZG9jdW1lbnQpIHtcbiAgICBjb25zdCBlbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcblxuICAgIGlmIChkb2N1bWVudC5ib2R5KSB7XG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGVsZW0pXG4gICAgfVxuICAgIHJldHVybiBlbGVtXG4gIH1cbn1cbiIsImlmICghRWxlbWVudC5wcm90b3R5cGUubWF0Y2hlcykge1xuICBFbGVtZW50LnByb3RvdHlwZS5tYXRjaGVzID1cbiAgICAgICAgRWxlbWVudC5wcm90b3R5cGUubWF0Y2hlc1NlbGVjdG9yIHx8XG4gICAgICAgIEVsZW1lbnQucHJvdG90eXBlLm1vek1hdGNoZXNTZWxlY3RvciB8fFxuICAgICAgICBFbGVtZW50LnByb3RvdHlwZS5tc01hdGNoZXNTZWxlY3RvciB8fFxuICAgICAgICBFbGVtZW50LnByb3RvdHlwZS5vTWF0Y2hlc1NlbGVjdG9yIHx8XG4gICAgICAgIEVsZW1lbnQucHJvdG90eXBlLndlYmtpdE1hdGNoZXNTZWxlY3RvciB8fFxuICAgICAgICBmdW5jdGlvbiAocykge1xuICAgICAgICAgIGNvbnN0IG1hdGNoZXMgPSAodGhpcy5kb2N1bWVudCB8fCB0aGlzLm93bmVyRG9jdW1lbnQpLnF1ZXJ5U2VsZWN0b3JBbGwocylcbiAgICAgICAgICBsZXQgaSA9IG1hdGNoZXMubGVuZ3RoXG4gICAgICAgICAgd2hpbGUgKC0taSA+PSAwICYmIG1hdGNoZXMuaXRlbShpKSAhPT0gdGhpcykge31cbiAgICAgICAgICByZXR1cm4gaSA+IC0xXG4gICAgICAgIH1cbn1cbiIsImlmICh0eXBlb2YgT2JqZWN0LmFzc2lnbiAhPT0gJ2Z1bmN0aW9uJykge1xuICAoZnVuY3Rpb24gKCkge1xuICAgIE9iamVjdC5hc3NpZ24gPSBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgICAndXNlIHN0cmljdCdcbiAgICAgIGlmICh0YXJnZXQgPT09IHVuZGVmaW5lZCB8fCB0YXJnZXQgPT09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNvbnZlcnQgdW5kZWZpbmVkIG9yIG51bGwgdG8gb2JqZWN0JylcbiAgICAgIH1cblxuICAgICAgdmFyIG91dHB1dCA9IE9iamVjdCh0YXJnZXQpXG4gICAgICBmb3IgKHZhciBpbmRleCA9IDE7IGluZGV4IDwgYXJndW1lbnRzLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICB2YXIgc291cmNlID0gYXJndW1lbnRzW2luZGV4XVxuICAgICAgICBpZiAoc291cmNlICE9PSB1bmRlZmluZWQgJiYgc291cmNlICE9PSBudWxsKSB7XG4gICAgICAgICAgZm9yICh2YXIgbmV4dEtleSBpbiBzb3VyY2UpIHtcbiAgICAgICAgICAgIGlmIChzb3VyY2UuaGFzT3duUHJvcGVydHkobmV4dEtleSkpIHtcbiAgICAgICAgICAgICAgb3V0cHV0W25leHRLZXldID0gc291cmNlW25leHRLZXldXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gb3V0cHV0XG4gICAgfVxuICB9KSgpXG59XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgJy4vbGliL3dhcm4taWYtbm8td2luZG93J1xuaW1wb3J0IFZ1ZSBmcm9tICd2dWUnXG5pbXBvcnQgVnVlV3JhcHBlciBmcm9tICcuL3dyYXBwZXJzL3Z1ZS13cmFwcGVyJ1xuaW1wb3J0IGNyZWF0ZUluc3RhbmNlIGZyb20gJy4vbGliL2NyZWF0ZS1pbnN0YW5jZSdcbmltcG9ydCBjcmVhdGVFbGVtZW50IGZyb20gJy4vbGliL2NyZWF0ZS1lbGVtZW50J1xuaW1wb3J0ICcuL2xpYi9wb2x5ZmlsbHMvbWF0Y2hlcy1wb2x5ZmlsbCdcbmltcG9ydCAnLi9saWIvcG9seWZpbGxzL29iamVjdC1hc3NpZ24tcG9seWZpbGwnXG5pbXBvcnQgZXJyb3JIYW5kbGVyIGZyb20gJy4vbGliL2Vycm9yLWhhbmRsZXInXG5cblZ1ZS5jb25maWcucHJvZHVjdGlvblRpcCA9IGZhbHNlXG5WdWUuY29uZmlnLmVycm9ySGFuZGxlciA9IGVycm9ySGFuZGxlclxuVnVlLmNvbmZpZy5kZXZ0b29scyA9IGZhbHNlXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG1vdW50IChjb21wb25lbnQ6IENvbXBvbmVudCwgb3B0aW9uczogT3B0aW9ucyA9IHt9KTogVnVlV3JhcHBlciB7XG4gIC8vIFJlbW92ZSBjYWNoZWQgY29uc3RydWN0b3JcbiAgZGVsZXRlIGNvbXBvbmVudC5fQ3RvclxuXG4gIGNvbnN0IHZtID0gY3JlYXRlSW5zdGFuY2UoY29tcG9uZW50LCBvcHRpb25zKVxuXG4gIGlmIChvcHRpb25zLmF0dGFjaFRvRG9jdW1lbnQpIHtcbiAgICB2bS4kbW91bnQoY3JlYXRlRWxlbWVudCgpKVxuICB9IGVsc2Uge1xuICAgIHZtLiRtb3VudCgpXG4gIH1cblxuICBpZiAodm0uX2Vycm9yKSB7XG4gICAgdGhyb3cgKHZtLl9lcnJvcilcbiAgfVxuXG4gIHJldHVybiBuZXcgVnVlV3JhcHBlcih2bSwgeyBhdHRhY2hlZFRvRG9jdW1lbnQ6ICEhb3B0aW9ucy5hdHRhY2hUb0RvY3VtZW50IH0pXG59XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQgJy4vbGliL3dhcm4taWYtbm8td2luZG93J1xuaW1wb3J0IFZ1ZSBmcm9tICd2dWUnXG5pbXBvcnQge1xuICBjcmVhdGVDb21wb25lbnRTdHVic0ZvckFsbCxcbiAgY3JlYXRlQ29tcG9uZW50U3R1YnNGb3JHbG9iYWxzXG59IGZyb20gJy4vbGliL3N0dWItY29tcG9uZW50cydcbmltcG9ydCBtb3VudCBmcm9tICcuL21vdW50J1xuaW1wb3J0IHR5cGUgVnVlV3JhcHBlciBmcm9tICcuL3dyYXBwZXJzL3Z1ZS13cmFwcGVyJ1xuaW1wb3J0IHtcbiAgY2FtZWxpemUsXG4gIGNhcGl0YWxpemUsXG4gIGh5cGhlbmF0ZVxufSBmcm9tICcuL2xpYi91dGlsJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBzaGFsbG93IChcbiAgY29tcG9uZW50OiBDb21wb25lbnQsXG4gIG9wdGlvbnM6IE9wdGlvbnMgPSB7fVxuKTogVnVlV3JhcHBlciB7XG4gIGNvbnN0IHZ1ZSA9IG9wdGlvbnMubG9jYWxWdWUgfHwgVnVlXG5cbiAgLy8gcmVtb3ZlIGFueSByZWN1cnNpdmUgY29tcG9uZW50cyBhZGRlZCB0byB0aGUgY29uc3RydWN0b3JcbiAgLy8gaW4gdm0uX2luaXQgZnJvbSBwcmV2aW91cyB0ZXN0c1xuICBpZiAoY29tcG9uZW50Lm5hbWUgJiYgY29tcG9uZW50LmNvbXBvbmVudHMpIHtcbiAgICBkZWxldGUgY29tcG9uZW50LmNvbXBvbmVudHNbY2FwaXRhbGl6ZShjYW1lbGl6ZShjb21wb25lbnQubmFtZSkpXVxuICAgIGRlbGV0ZSBjb21wb25lbnQuY29tcG9uZW50c1toeXBoZW5hdGUoY29tcG9uZW50Lm5hbWUpXVxuICB9XG5cbiAgY29uc3Qgc3R1YmJlZENvbXBvbmVudHMgPSBjcmVhdGVDb21wb25lbnRTdHVic0ZvckFsbChjb21wb25lbnQpXG4gIGNvbnN0IHN0dWJiZWRHbG9iYWxDb21wb25lbnRzID0gY3JlYXRlQ29tcG9uZW50U3R1YnNGb3JHbG9iYWxzKHZ1ZSlcblxuICByZXR1cm4gbW91bnQoY29tcG9uZW50LCB7XG4gICAgLi4ub3B0aW9ucyxcbiAgICBjb21wb25lbnRzOiB7XG4gICAgICAvLyBzdHViYmVkIGNvbXBvbmVudHMgYXJlIHVzZWQgaW5zdGVhZCBvZiBvcmlnaW5hbCBjb21wb25lbnRzIGNvbXBvbmVudHNcbiAgICAgIC4uLnN0dWJiZWRHbG9iYWxDb21wb25lbnRzLFxuICAgICAgLi4uc3R1YmJlZENvbXBvbmVudHNcbiAgICB9XG4gIH0pXG59XG4iLCIvLyBAZmxvd1xuY29uc3QgdG9UeXBlczogQXJyYXk8RnVuY3Rpb24+ID0gW1N0cmluZywgT2JqZWN0XVxuY29uc3QgZXZlbnRUeXBlczogQXJyYXk8RnVuY3Rpb24+ID0gW1N0cmluZywgQXJyYXldXG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgbmFtZTogJ1JvdXRlckxpbmtTdHViJyxcbiAgcHJvcHM6IHtcbiAgICB0bzoge1xuICAgICAgdHlwZTogdG9UeXBlcyxcbiAgICAgIHJlcXVpcmVkOiB0cnVlXG4gICAgfSxcbiAgICB0YWc6IHtcbiAgICAgIHR5cGU6IFN0cmluZyxcbiAgICAgIGRlZmF1bHQ6ICdhJ1xuICAgIH0sXG4gICAgZXhhY3Q6IEJvb2xlYW4sXG4gICAgYXBwZW5kOiBCb29sZWFuLFxuICAgIHJlcGxhY2U6IEJvb2xlYW4sXG4gICAgYWN0aXZlQ2xhc3M6IFN0cmluZyxcbiAgICBleGFjdEFjdGl2ZUNsYXNzOiBTdHJpbmcsXG4gICAgZXZlbnQ6IHtcbiAgICAgIHR5cGU6IGV2ZW50VHlwZXMsXG4gICAgICBkZWZhdWx0OiAnY2xpY2snXG4gICAgfVxuICB9LFxuICByZW5kZXIgKGg6IEZ1bmN0aW9uKSB7XG4gICAgcmV0dXJuIGgodGhpcy50YWcsIHVuZGVmaW5lZCwgdGhpcy4kc2xvdHMuZGVmYXVsdClcbiAgfVxufVxuIiwiaW1wb3J0IHNoYWxsb3cgZnJvbSAnLi9zaGFsbG93J1xuaW1wb3J0IG1vdW50IGZyb20gJy4vbW91bnQnXG5pbXBvcnQgY3JlYXRlTG9jYWxWdWUgZnJvbSAnLi9jcmVhdGUtbG9jYWwtdnVlJ1xuaW1wb3J0IFRyYW5zaXRpb25TdHViIGZyb20gJy4vY29tcG9uZW50cy9UcmFuc2l0aW9uU3R1YidcbmltcG9ydCBUcmFuc2l0aW9uR3JvdXBTdHViIGZyb20gJy4vY29tcG9uZW50cy9UcmFuc2l0aW9uR3JvdXBTdHViJ1xuaW1wb3J0IFJvdXRlckxpbmtTdHViIGZyb20gJy4vY29tcG9uZW50cy9Sb3V0ZXJMaW5rU3R1YidcbmltcG9ydCBjb25maWcgZnJvbSAnLi9jb25maWcnXG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgY3JlYXRlTG9jYWxWdWUsXG4gIGNvbmZpZyxcbiAgbW91bnQsXG4gIHNoYWxsb3csXG4gIFRyYW5zaXRpb25TdHViLFxuICBUcmFuc2l0aW9uR3JvdXBTdHViLFxuICBSb3V0ZXJMaW5rU3R1YlxufVxuIl0sIm5hbWVzIjpbImNvbnN0IiwiaXNWdWVDb21wb25lbnQiLCJjb21waWxlVG9GdW5jdGlvbnMiLCJsZXQiLCJ0aGlzIiwiZmluZEFsbCIsImVxIiwiYXNzb2NJbmRleE9mIiwibGlzdENhY2hlQ2xlYXIiLCJsaXN0Q2FjaGVEZWxldGUiLCJsaXN0Q2FjaGVHZXQiLCJsaXN0Q2FjaGVIYXMiLCJsaXN0Q2FjaGVTZXQiLCJMaXN0Q2FjaGUiLCJnbG9iYWwiLCJmcmVlR2xvYmFsIiwicm9vdCIsIm9iamVjdFByb3RvIiwiaGFzT3duUHJvcGVydHkiLCJzeW1Ub1N0cmluZ1RhZyIsIlN5bWJvbCIsIm5hdGl2ZU9iamVjdFRvU3RyaW5nIiwiZ2V0UmF3VGFnIiwib2JqZWN0VG9TdHJpbmciLCJmdW5jVGFnIiwiZ2VuVGFnIiwiaXNPYmplY3QiLCJiYXNlR2V0VGFnIiwiY29yZUpzRGF0YSIsImZ1bmNQcm90byIsImZ1bmNUb1N0cmluZyIsImlzTWFza2VkIiwiaXNGdW5jdGlvbiIsInRvU291cmNlIiwiZ2V0VmFsdWUiLCJiYXNlSXNOYXRpdmUiLCJnZXROYXRpdmUiLCJuYXRpdmVDcmVhdGUiLCJIQVNIX1VOREVGSU5FRCIsImhhc2hDbGVhciIsImhhc2hEZWxldGUiLCJoYXNoR2V0IiwiaGFzaEhhcyIsImhhc2hTZXQiLCJIYXNoIiwiTWFwIiwiaXNLZXlhYmxlIiwiZ2V0TWFwRGF0YSIsIm1hcENhY2hlQ2xlYXIiLCJtYXBDYWNoZURlbGV0ZSIsIm1hcENhY2hlR2V0IiwibWFwQ2FjaGVIYXMiLCJtYXBDYWNoZVNldCIsIk1hcENhY2hlIiwic3RhY2tDbGVhciIsInN0YWNrRGVsZXRlIiwic3RhY2tHZXQiLCJzdGFja0hhcyIsInN0YWNrU2V0IiwiZGVmaW5lUHJvcGVydHkiLCJiYXNlQXNzaWduVmFsdWUiLCJhc3NpZ25WYWx1ZSIsImFyZ3NUYWciLCJpc09iamVjdExpa2UiLCJiYXNlSXNBcmd1bWVudHMiLCJzdHViRmFsc2UiLCJNQVhfU0FGRV9JTlRFR0VSIiwiYXJyYXlUYWciLCJib29sVGFnIiwiZGF0ZVRhZyIsImVycm9yVGFnIiwibWFwVGFnIiwibnVtYmVyVGFnIiwib2JqZWN0VGFnIiwicmVnZXhwVGFnIiwic2V0VGFnIiwic3RyaW5nVGFnIiwid2Vha01hcFRhZyIsImFycmF5QnVmZmVyVGFnIiwiZGF0YVZpZXdUYWciLCJmbG9hdDMyVGFnIiwiZmxvYXQ2NFRhZyIsImludDhUYWciLCJpbnQxNlRhZyIsImludDMyVGFnIiwidWludDhUYWciLCJ1aW50OENsYW1wZWRUYWciLCJ1aW50MTZUYWciLCJ1aW50MzJUYWciLCJpc0xlbmd0aCIsIm5vZGVVdGlsIiwiYmFzZVVuYXJ5IiwiYmFzZUlzVHlwZWRBcnJheSIsImlzQXJyYXkiLCJpc0FyZ3VtZW50cyIsImlzQnVmZmVyIiwiaXNUeXBlZEFycmF5IiwiYmFzZVRpbWVzIiwiaXNJbmRleCIsIm92ZXJBcmciLCJpc1Byb3RvdHlwZSIsIm5hdGl2ZUtleXMiLCJpc0FycmF5TGlrZSIsImFycmF5TGlrZUtleXMiLCJiYXNlS2V5cyIsImNvcHlPYmplY3QiLCJrZXlzIiwibmF0aXZlS2V5c0luIiwia2V5c0luIiwiYmFzZUtleXNJbiIsInByb3BlcnR5SXNFbnVtZXJhYmxlIiwic3R1YkFycmF5IiwiYXJyYXlGaWx0ZXIiLCJnZXRTeW1ib2xzIiwibmF0aXZlR2V0U3ltYm9scyIsImFycmF5UHVzaCIsImdldFByb3RvdHlwZSIsImdldFN5bWJvbHNJbiIsImJhc2VHZXRBbGxLZXlzIiwiRGF0YVZpZXciLCJQcm9taXNlIiwiU2V0IiwiV2Vha01hcCIsIlVpbnQ4QXJyYXkiLCJjbG9uZUFycmF5QnVmZmVyIiwiQ0xPTkVfREVFUF9GTEFHIiwibWFwVG9BcnJheSIsImFycmF5UmVkdWNlIiwiYWRkTWFwRW50cnkiLCJzZXRUb0FycmF5IiwiYWRkU2V0RW50cnkiLCJzeW1ib2xUYWciLCJjbG9uZURhdGFWaWV3IiwiY2xvbmVUeXBlZEFycmF5IiwiY2xvbmVNYXAiLCJjbG9uZVJlZ0V4cCIsImNsb25lU2V0IiwiY2xvbmVTeW1ib2wiLCJiYXNlQ3JlYXRlIiwiQ0xPTkVfU1lNQk9MU19GTEFHIiwiaW5pdENsb25lQXJyYXkiLCJjb3B5QXJyYXkiLCJnZXRUYWciLCJjbG9uZUJ1ZmZlciIsImluaXRDbG9uZU9iamVjdCIsImNvcHlTeW1ib2xzSW4iLCJiYXNlQXNzaWduSW4iLCJjb3B5U3ltYm9scyIsImJhc2VBc3NpZ24iLCJpbml0Q2xvbmVCeVRhZyIsIlN0YWNrIiwiZ2V0QWxsS2V5c0luIiwiZ2V0QWxsS2V5cyIsImFycmF5RWFjaCIsImJhc2VDbG9uZSIsImNsb25lRGVlcCIsInN1cGVyIiwiVnVlIiwiJCRWdWUiLCJjYW1lbGl6ZVJFIiwiY2FtZWxpemUiLCJrZXkiLCJpc1ZhbGlkU2xvdCIsImFyZ3VtZW50cyIsImNyZWF0ZUluc3RhbmNlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7O0FBRUEsQUFBTyxTQUFTLFVBQVUsRUFBRSxHQUFHLEVBQWdCO0VBQzdDLE1BQU0sSUFBSSxLQUFLLEVB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
