import Vuex from 'vuex'
import { render, renderToString, config } from '../'
import { normalOptions, functionalOptions, Normal, ClassComponent } from './resources'

const store = new Vuex.Store({})

async function test () {
  const renderResult: Cheerio = await render(
    {
      template: '<p>foo</p>'
    },
    {
      attachToDocument: true,
      scopedSlots: {
        foo: `<div>Foo</div>`
      }
    }
  )
  const str: string = await renderToString(ClassComponent)
}

test()

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

/**
 * Test for config
 */
config.stubs = ['a']
config.stubs = {
  foo: normalOptions,
  bar: functionalOptions,
  baz: ClassComponent,
  qux: `<div>Test</div>`,
  quux: true
}
config.mocks = {
  foo: 'bar',
}
config.methods = {
  foo: () => {}
}
config.provide = {
  foo: {}
}
