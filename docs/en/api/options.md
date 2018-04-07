# Mounting Options

Options for `mount` and `shallow`. The options object can contain both Vue Test Utils mounting options and other options.

## Vue Test Utils Specific Mounting Options

- [`context`](#context)
- [`slots`](#slots)
- [`scopedSlots`](#scopedslots)
- [`stubs`](#stubs)
- [`mocks`](#mocks)
- [`localVue`](#localvue)
- [`attachToDocument`](#attachtodocument)
- [`attrs`](#attrs)
- [`listeners`](#listeners)
- [`provide`](#provide)
- [`sync`](#sync)

### `context`

- type: `Object`

Passes context to functional component. Can only be used with functional components.

Example:

```js
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Component, {
  context: {
    props: { show: true },
    children: [Foo, Bar]
  }
})

expect(wrapper.is(Component)).toBe(true)
```

### `slots`

- type: `{ [name: string]: Array<Component>|Component|string }`

Provide an object of slot contents to the component. The key corresponds to the slot name. The value can be either a component, an array of components, or a template string, or text.

Example:

```js
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = shallow(Component, {
  slots: {
    default: [Foo, Bar],
    fooBar: Foo, // Will match `<slot name="FooBar" />`.
    foo: '<div />',
    bar: 'bar'
  }
})
expect(wrapper.find('div')).toBe(true)
```

#### Passing text

You can pass text to `slots`.  
There is a limitation to this.

This does not support PhantomJS.  
Please use [Puppeteer](https://github.com/karma-runner/karma-chrome-launcher#headless-chromium-with-puppeteer).

### `scopedSlots`

- type: `{ [name: string]: string }`

Provide an object of scoped slots contents to the component. The key corresponds to the slot name. The value can be a template string.

There are two limitations.  

* This option is only supported in vue@2.5+.

* You can not use `<template>` tag as the root element in the `scopedSlots` option.

Example:

```js
const wrapper = shallow(Component, {
  scopedSlots: {
    foo: '<p slot-scope="props">{{props.index}},{{props.text}}</p>'
  }
})
expect(wrapper.find('#fooWrapper').html()).toBe('<div id="fooWrapper"><p>0,text1</p><p>1,text2</p><p>2,text3</p></div>')
```

### `stubs`

- type: `{ [name: string]: Component | boolean } | Array<string>`

Stubs child components. Can be an Array of component names to stub, or an object. If `stubs` is an Array, every stub is `<!---->`.

Example:

```js
import Foo from './Foo.vue'

mount(Component, {
  stubs: ['registered-component']
})

shallow(Component, {
  stubs: {
    // stub with a specific implementation
    'registered-component': Foo,
    // create default stub
    'another-component': true
  }
})
```

### `mocks`

- type: `Object`

Add additional properties to the instance. Useful for mocking global injections.

Example:

```js
const $route = { path: 'http://www.example-path.com' }
const wrapper = shallow(Component, {
  mocks: {
    $route
  }
})
expect(wrapper.vm.$route.path).toBe($route.path)
```

### `localVue`

- type: `Vue`

A local copy of Vue created by [`createLocalVue`](./createLocalVue.md) to use when mounting the component. Installing plugins on this copy of `Vue` prevents polluting the original `Vue` copy.

Example:

```js
import { createLocalVue, mount } from '@vue/test-utils'
import VueRouter from 'vue-router'
import Foo from './Foo.vue'

const localVue = createLocalVue()
localVue.use(VueRouter)

const routes = [
  { path: '/foo', component: Foo }
]

const router = new VueRouter({
  routes
})

const wrapper = mount(Component, {
  localVue,
  router
})
expect(wrapper.vm.$route).toBeInstanceOf(Object)
```

### `attachToDocument`

- type: `boolean`
- default: `false`

Component will be attach to DOM when rendered if set to `true`.

### `attrs`

- type: `Object`

Set the component instance's `$attrs` object.

### `listeners`

- type: `Object`

Set the component instance's `$listeners` object.

### `provide`

- type: `Object`

Pass properties for components to use in injection. See [provide/inject](https://vuejs.org/v2/api/#provide-inject).

### `sync`

- type: `boolean`
- default: `true`

Sets all watchers to run synchronously.

When `sync` is `true`, the Vue component is rendered synchronously.  
When `sync` is `false`, the Vue component is rendered asynchronously.

## Other options

When the options for `mount` and `shallow` contain the options other than the mounting options, the component options are overwritten with those using [extends](https://vuejs.org/v2/api/#extends).

```js
const Component = {
  template: '<div>{{ foo() }}{{ bar() }}{{ baz() }}</div>',
  methods: {
    foo () {
      return 'a'
    },
    bar () {
      return 'b'
    }
  }
}
const options = {
  methods: {
    bar () {
      return 'B'
    },
    baz () {
      return 'C'
    }
  }
}
const wrapper = mount(Component, options)
expect(wrapper.text()).toBe('aBC')
```
