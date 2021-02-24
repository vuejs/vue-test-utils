import Vuex from 'vuex'
import { shallowMount, createLocalVue } from '../'
import { normalOptions, functionalOptions, ClassComponent, extendedFunctionalComponent, extendedNormalComponent } from './resources'

/**
 * Should create wrapper vm based on (function) component options or constructors
 * The users can specify component type via the type parameter
 */
const normalWrapper = shallowMount(normalOptions)
const normalFoo: string = normalWrapper.vm.foo

const extendedNormalWrapper = shallowMount(extendedNormalComponent)
const extendedNormalFoo: string = extendedNormalWrapper.vm.foo

const classWrapper = shallowMount(ClassComponent)
const classFoo: string = classWrapper.vm.bar

const functinalWrapper = shallowMount(functionalOptions)
const extendedFunctionalWrapper = shallowMount(extendedFunctionalComponent)

/**
 * Test for shallowMount options
 */
const localVue = createLocalVue()
localVue.use(Vuex)

const store = new Vuex.Store({})

shallowMount(ClassComponent, {
  attachToDocument: true,
  localVue,
  mocks: {
    $store: store
  },
  slots: {
    default: `<div>Foo</div>`,
    foo: [normalOptions, functionalOptions],
    baz: ClassComponent
  },
  scopedSlots: {
    scopedFoo: `<div>scopedFoo</div>`,
    scopedBaz() {
      return `<div>scopedBaz</div>`;
    },
  },
  stubs: {
    foo: normalOptions,
    bar: functionalOptions,
    baz: ClassComponent,
    qux: `<div>Test</div>`
  }
})

shallowMount(functionalOptions, {
  context: {
    props: { foo: 'test' }
  },
  stubs: ['child']
})

shallowMount(extendedFunctionalComponent, {
  context: {
    props: { foo: 'test' },
    data: {}
  },
  stubs: ['child']
})

/**
 * ShallowMountOptions should receive Vue's component options
 */
shallowMount(ClassComponent, {
  propsData: {
    test: 'test'
  },
  created () {
    this.bar
  }
})
