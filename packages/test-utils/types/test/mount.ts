import Vuex from 'vuex'
import VueTestUtils, { mount, createLocalVue, config } from '../'
import { normalOptions, functionalOptions, ClassComponent, extendedFunctionalComponent, extendedNormalComponent } from './resources'

/**
 * Should create wrapper vm based on (function) component options or constructors
 * The users can specify component type via the type parameter
 */
const normalWrapper = mount(normalOptions)
const normalFoo: string = normalWrapper.vm.foo

const extendedNormalWrapper = mount(extendedNormalComponent)
const extendedNormalFoo: string = extendedNormalWrapper.vm.foo

const classWrapper = mount(ClassComponent)
const classFoo: string = classWrapper.vm.bar

const functionalWrapper = mount(functionalOptions)
const extendedFunctionalWrapper = mount(extendedFunctionalComponent)

/**
 * Test for mount options
 */
const localVue = createLocalVue()
localVue.use(Vuex)

const store = new Vuex.Store({})

mount(ClassComponent, {
  attachToDocument: true,
  localVue,
  mocks: {
    $store: store
  },
  attachTo: '#el',
  parentComponent: normalOptions,
  slots: {
    default: `<div>Foo</div>`,
    foo: [normalOptions, functionalOptions],
    bar: ClassComponent
  },
  scopedSlots: {
    baz: `<div>Baz</div>`
  },
  stubs: {
    foo: normalOptions,
    bar: functionalOptions,
    baz: ClassComponent,
    qux: `<div>Test</div>`,
    quux: true
  },
  attrs: {
    attribute: 'attr'
  },
  listeners: {
    listener: () => {},
    listeners: [() => {}, () => {}]
  }
})

mount(functionalOptions, {
  context: {
    props: { foo: 'test' }
  },
  attachTo: document.createElement('div'),
  stubs: ['child']
})

mount(extendedFunctionalComponent, {
  context: {
    props: { foo: 'test' },
    data: {}
  },
  attachTo: document.createElement('div'),
  stubs: ['child']
})

/**
 * MountOptions should receive Vue's component options
 */
mount(ClassComponent, {
  propsData: {
    test: 'test'
  },
  created () {
    this.bar
  }
})

/**
 * Test for config
 */
config.stubs = {
  foo: normalOptions,
  bar: functionalOptions,
  baz: ClassComponent,
  qux: `<div>Test</div>`,
  quux: true
}
config.stubs['quuux'] = true
config.mocks = {
  foo: 'bar',
}
config.mocks['foo'] = {
  bar: 'baz'
}
config.methods = {
  foo: () => {}
}
config.methods['foo'] = () => true
config.provide = {
  foo: {}
}
config.provide['foo'] = {
  bar: {}
}
config.showDeprecationWarnings = false

// Check we can use default export
VueTestUtils.config.showDeprecationWarnings = false
