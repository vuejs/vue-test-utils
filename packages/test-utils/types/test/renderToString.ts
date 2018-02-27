import Vuex from 'vuex'
import { mount, renderToString, createLocalVue } from '../'
import { normalOptions, functionalOptions, Normal, ClassComponent } from './resources'

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

renderToString(ClassComponent, {
  localVue,
  mocks: {
    $store: store
  },
  slots: {
    default: `<div>Foo</div>`,
    foo: [normalOptions, functionalOptions],
    bar: ClassComponent
  },
  stubs: {
    foo: normalOptions,
    bar: functionalOptions,
    baz: ClassComponent,
    qux: `<div>Test</div>`
  },
  attrs: {
    attribute: 'attr'
  },
  listeners: {
    listener: () => {}
  }
})
