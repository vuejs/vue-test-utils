# Mounting Options

<p><strong>⚠Cette page est actuellement en cours de traduction française. Vous pouvez repasser plus tard ou <a href="https://github.com/vuejs-fr/vue-test-utils" target="_blank">participer à la traduction</a> de celle-ci dès maintenant !</strong></p><p>Options for `mount` and `shallow`. The options object can contain both `vue-test-utils` mounting options and raw Vue options.</p>

Vue options are passed to the component when a new instance is created. , e.g. `store`, `propsData`. For a full list, see the [Vue API docs](https://vuejs.org/v2/api/).

## `vue-test-utils` Specific Mounting Options

- [`context`](#context)
- [`slots`](#slots)
- [`stubs`](#stubs)
- [`mocks`](#mocks)
- [`localVue`](#localvue)
- [`attachToDocument`](#attachtodocument)
- [`attrs`](#attrs)
- [`provide`](#provide)
- [`listeners`](#listeners)

### `context`

- type: `Object`

Passes context to functional component. Can only be used with functional components.

Example:

```js
const wrapper = mount(Component, {
  context: {
    props: { show: true }
  }
})

expect(wrapper.is(Component)).toBe(true)
```

### `slots`

- type: `{ [name: string]: Array<Component>|Component|string }`

Provide an object of slot contents to the component. The key corresponds to the slot name. The value can be either a component, an array of components, or a template string.

Example:

```js
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = shallow(Component, {
  slots: {
    default: [Foo, Bar],
    fooBar: Foo, // Will match `<slot name="FooBar" />`.
    foo: '<div />'
  }
})
expect(wrapper.find('div')).toBe(true)
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

Component will be attach to DOM when rendered if set to `true`. This can be used with [`hasStyle`](wrapper/hasStyle.md) to check multi element CSS selectors.

### `attrs`

- type: `Object`

Set the component instance's `$attrs` object.

### `listeners`

- type: `Object`

Set the component instance's `$listeners` object.

### `provide`

- type: `Object`

Pass properties for components to use in injection. See [provide/inject](https://vuejs.org/v2/api/#provide-inject).
