import Vuex from 'vuex'
import { shallow, createLocalVue } from '../'
import { normalOptions, functionalOptions, Normal, ClassComponent } from './resources'

/**
 * Should create wrapper vm based on (function) component options or constructors
 * The users can specify component type via the type parameter
 */
const normalWrapper = shallow(normalOptions)
const normalFoo: string = normalWrapper.vm.foo

const classWrapper = shallow(ClassComponent)
const classFoo: string = classWrapper.vm.bar

const functinalWrapper = shallow(functionalOptions)

/**
 * Test for shallow options
 */
const localVue = createLocalVue()
localVue.use(Vuex)

const store = new Vuex.Store({})

shallow(ClassComponent, {
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
  stubs: {
    foo: normalOptions,
    bar: functionalOptions,
    baz: ClassComponent,
    qux: `<div>Test</div>`
  }
})

shallow(functionalOptions, {
  context: {
    props: { foo: 'test' }
  },
  stubs: ['child']
})

/**
 * ShallowOptions should receive Vue's component options
 */
shallow(ClassComponent, {
  propsData: {
    test: 'test'
  },
  created () {
    this.bar
  }
})
