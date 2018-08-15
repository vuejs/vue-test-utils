# Mounting Options

Options for `mount` and `shallowMount`. The options object can contain both Vue Test Utils mounting options and other options.

- [`context`](#context)
- [`slots`](#slots)
- [`scopedSlots`](#scopedslots)
- [`stubs`](#stubs)
- [`mocks`](#mocks)
- [`localVue`](#localvue)
- [`attachToDocument`](#attachtodocument)
- [`propsData`](#propsdata)
- [`attrs`](#attrs)
- [`listeners`](#listeners)
- [`parentComponent`](#parentcomponent)
- [`provide`](#provide)
- [`sync`](#sync)

## context

- type: `Object`

Passes context to functional component. Can only be used with [functional components](https://vuejs.org/v2/guide/render-function.html#Functional-Components).

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

## slots

- type: `{ [name: string]: Array<Component>|Component|string }`

Provide an object of slot contents to the component. The key corresponds to the slot name. The value can be either a component, an array of components, or a template string, or text.

Example:

```js
import Foo from './Foo.vue'

const bazComponent = {
  name: 'baz-component',
  template: '<p>baz</p>'
}

const wrapper = shallowMount(Component, {
  slots: {
    default: [Foo, '<my-component />', 'text'],
    fooBar: Foo, // Will match `<slot name="FooBar" />`.
    foo: '<div />',
    bar: 'bar',
    baz: bazComponent,
    qux: '<my-component />'
  }
})

expect(wrapper.find('div')).toBe(true)
```

## scopedSlots

- type: `{ [name: string]: string|Function }`

Provide an object of scoped slots to the component. The key corresponds to the slot name.

You can set the name of the props using the slot-scope attribute:

```js
shallowMount(Component, {
  scopedSlots: {
    foo: '<p slot-scope="foo">{{foo.index}},{{foo.text}}</p>'
  }
})
```

Otherwise props are available as a `props` object when the slot is evaluated:

```js
shallowMount(Component, {
  scopedSlots: {
    default: '<p>{{props.index}},{{props.text}}</p>'
  }
})
```

You can also pass a function that takes the props as an argument:

```js
shallowMount(Component, {
  scopedSlots: {
    foo: function (props) {
      return this.$createElement('div', props.index)
    }
  }
})
```

Or you can use JSX. If you write JSX in a method, `this.$createElement` is auto-injected by babel-plugin-transform-vue-jsx:

```js
shallowMount(Component, {
  scopedSlots: {
    foo (props) {
      return <div>{ props.text }</div>
    }
  }
})
```

## stubs

- type: `{ [name: string]: Component | boolean } | Array<string>`

Stubs child components. Can be an Array of component names to stub, or an object. If `stubs` is an Array, every stub is `<${component name}-stub>`.

Example:

```js
import Foo from './Foo.vue'

mount(Component, {
  stubs: ['registered-component']
})

shallowMount(Component, {
  stubs: {
    // stub with a specific implementation
    'registered-component': Foo,
    // create default stub.
    // the component name of default stub is another-component in this case.
    // the default stub is <${the component name of default stub}-stub>.
    'another-component': true
  }
})
```

## mocks

- type: `Object`

Add additional properties to the instance. Useful for mocking global injections.

Example:

```js
const $route = { path: 'http://www.example-path.com' }
const wrapper = shallowMount(Component, {
  mocks: {
    $route
  }
})
expect(wrapper.vm.$route.path).toBe($route.path)
```

## localVue

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

## attachToDocument

- type: `boolean`
- default: `false`

Component will be attached to DOM when rendered if set to `true`.

## attrs

- type: `Object`

Set the component instance's `$attrs` object.

## propsData

- type: `Object`

Set the component instance's props. 

Example:

```js
const Component = {
  template: '<div>{{ msg }}</div>',
  props: ['msg']
}
const wrapper = mount(Component, {
  propsData: {
    msg: 'aBC'
  }
})
expect(wrapper.text()).toBe('aBC')
```

::: tip 
It's worth noting that `propsData` is actually a [Vue API](https://vuejs.org/v2/api/#propsData), not a proprietary
`vue-test-utils` option. It is processed through [`extends`](#other-options).
::: 

## listeners

- type: `Object`

Set the component instance's `$listeners` object.

## parentComponent

- type: `Object`

Component to use as parent for mounted component.

Example:

```js
import Foo from './Foo.vue'

const wrapper = shallowMount(Component, {
  parentComponent: Foo
})
expect(wrapper.vm.$parent.name).toBe('foo')
```

## provide

- type: `Object`

Pass properties for components to use in injection. See [provide/inject](https://vuejs.org/v2/api/#provide-inject).

## sync

- type: `boolean`
- default: `true`

When `sync` is `true`, the Vue component is rendered synchronously.  
When `sync` is `false`, the Vue component is rendered asynchronously.

## Other options

When the options for `mount` and `shallowMount` contain the options other than the mounting options, the component options are overwritten with those using [extends](https://vuejs.org/v2/api/#extends).

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
