# Mounting Options

Options for `mount` and `shallow`. The options object can contain both `vue-test-utils` mounting options and other options.

## `vue-test-utils` Specific Mounting Options

- [`context`](#context)
- [`slots`](#slots)
- [`stubs`](#stubs)
- [`mocks`](#mocks)
- [`localVue`](#localvue)
- [`attachToDocument`](#attachtodocument)
- [`attrs`](#attrs)
- [`listeners`](#listeners)
- [`clone`](#clone)
- [`provide`](#provide)

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
import { expect } from 'chai'
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
There are two limitations to this.

This does not support PhantomJS.  
Please use [Puppeteer](ihttps://github.com/karma-runner/karma-chrome-launcher#headless-chromium-with-puppeteer).

This works for the text below.

```js
const wrapper1 = mount(ComponentWithSlots, { slots: { default: '1{{ foo }}2' }})
const wrapper2 = mount(ComponentWithSlots, { slots: { default: '<p>1</p>{{ foo }}<p>2</p>' }})
const wrapper3 = mount(ComponentWithSlots, { slots: { default: '<p>1</p>{{ foo }}' }})
const wrapper4 = mount(ComponentWithSlots, { slots: { default: '123' }})
const wrapper5 = mount(ComponentWithSlots, { slots: { default: '1<p>2</p>{{ foo }}3' }})
```

This does not work for the text below.  
When there are some elements, `{{ }}` is required.

```js
const wrapper1 = mount(ComponentWithSlots, { slots: { default: '<p>1</p><p>2</p>' }})
const wrapper2 = mount(ComponentWithSlots, { slots: { default: '1<p>2</p>3' }})
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
import { expect } from 'chai'

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
import { createLocalVue, mount } from 'vue-test-utils'
import VueRouter from 'vue-router'
import { expect } from 'chai'
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

Component will be attach to DOM when rendered if set to `true`. This can be used with [`hasStyle`](wrapper/hasStyle.md) to check multi element CSS selectors.

### `attrs`

- type: `Object`

Set the component instance's `$attrs` object.

### `listeners`

- type: `Object`

Set the component instance's `$listeners` object.

### `clone`

- type: `boolean`
- default: `true`

Clones component before mounting if `true`, which avoids mutating the original component definition.

### `provide`

- type: `Object`

Pass properties for components to use in injection. See [provide/inject](https://vuejs.org/v2/api/#provide-inject).

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
expect(wrapper.text()).to.equal('aBC')
```
