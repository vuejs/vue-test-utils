import Vuex from 'vuex'
import VueTestUtils, { mount, createLocalVue, config } from '../'
import { normalOptions, functionalOptions, ClassComponent } from './resources'

/**
 * Should create wrapper vm based on (function) component options or constructors
 * The users can specify component type via the type parameter
 */
const normalWrapper = mount(normalOptions)
const normalFoo: string = normalWrapper.vm.foo

const classWrapper = mount(ClassComponent)
const classFoo: string = classWrapper.vm.bar

const functinalWrapper = mount(functionalOptions)

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
  },
  sync: true
})

mount(functionalOptions, {
  context: {
    props: { foo: 'test' }
  },
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
config.methods['foo'] = () => ({
  bar: true
})
config.provide = {
  foo: {}
}
config.provide['foo'] = {
  bar: {}
}
config.logModifiedComponents = true
config.silent = true

// Check we can use default export
VueTestUtils.config.silent = false
