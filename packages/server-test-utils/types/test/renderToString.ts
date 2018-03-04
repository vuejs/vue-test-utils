import Vuex from 'vuex'
import { renderToString } from '../'
import { normalOptions, functionalOptions, Normal, ClassComponent } from './resources'

const store = new Vuex.Store({})

renderToString(ClassComponent, {
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
