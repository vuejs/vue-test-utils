# options

Options for mount and shallow. The options object can contain vue-test-utils options and Vue options together.

Vue options are passed to the component when a new instance is created. , e.g. `store`, `propsData`. For full list, see the [Vue API](https://vuejs.org/v2/api/). Also takes vue-test-utils options:

- **Options:**

- `{Object} options`
  - `{boolean} attachToDocument`
  - `{Object} attrs`
  - `{Object} children`
  - `{boolean} clone`
  - `{Object} context`
  - `{Object} intercept`
  - `{Vue} localVue`
  - `{Object} slots`  
      - `{Array<Componet|Object>|Component|String} default`  
      - `{Array<Componet|Object>|Component|String} named`  
      - `{Object|Array<string>} stubs`
  - `{Object|Function} provide`

`options` (`Object`): a Vue options object. Vue options are passed to the component when a new instance is created. , e.g. `store`, `propsData`. For full list, see the [Vue API](https://vuejs.org/v2/api/). Also takes vue-test-utils options:

`options.attachToDocument` (`boolean`): Component will attach to DOM when rendered. This can be used with [`hasStyle`](wrapper/hasStyle.md) to check multi element CSS selectors

`options.attrs` (`Object`): Attrs object to pass to component.

`options.children` (`Array<string|Component|Function>`): Passes children to be rendered by functional components

`options.clone` (`boolean`): Clones component before editing if `true`, does not if `false`. Defaults to `true`

`options.context` (`Object`): Passes context to functional component. Can only be used with functional components

`options.intercept` (`Object`): Add globals to Vue instance.

`options.localVue` (`Object`): vue class to use in `mount`. See [createLocalVue](createLocalVue.md)

`options.propsData` (`Object`): Data for props in component

`options.slots` (`Object`): Render component with slots.

`options.slots.default` (`Array[Component]|Component|String`): Default slot object to render, can be a Vue component or array of Vue components

`options.slots.name` (`Array[Component]|Component`): Named slots. i.e. slots.name will match a <slot name="name" />, can be a Vue component or array of Vue components

`options.stubs` (`Object|Array<string>`): Stubs components matching the name. Takes object or array of strings

`options.provide` (`Object`): Provides value to component

- **Usage:**

**With Vue options:**

```js
import { expect } from 'chai'

const wrapper = shallow(Component, {
  propsData: {
    color: 'red'
  }
})
expect(wrapper.hasProp('color', 'red')).to.equal(true)
```

**Do not clone component**

```js
import { expect } from 'chai'

const wrapper = mount(Component, {
  clone: false
})

expect(wrapper.hasProp('color', 'red')).to.equal(true)
```

**Attach to DOM:**

```js
import { expect } from 'chai'

const wrapper = shallow(Component, {
  attachToDocument: true
})
expect(wrapper.contains('div')).to.equal(true)
```

**Pass attrs:**

```js
shallow(Component, {
  attrs: {
    attribute: 'value'
  }
})
```

**Mount a functional component:**

```js
import { expect } from 'chai'

const wrapper = mount(Component, {
  context: {
    props: { show: true }
  }
})

expect(wrapper.is(Component)).to.equal(true)
```

**Stub global properties:**

```js
import { expect } from 'chai'

const $route = { path: 'http://www.example-path.com' }
const wrapper = shallow(Component, {
  intercept: {
    $route
  }
})
expect(wrapper.vm.$route.path).to.equal($route.path)
```

**Install Vue Router with a local Vue:**

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
expect(wrapper.vm.$route).to.be.an('object')
```

**Default and named slots:**

```js
import { expect } from 'chai'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = shallow(Component, {
  slots: {
    default: [Foo, Bar],
    fooBar: Foo, // Will match <slot name="FooBar" />,
    foo: '<div />'
  }
})
expect(wrapper.find('div')).to.equal(true)
```

**Stub components:**

```js
import Foo from './Foo.vue'

mount(Component, {
  stubs: ['registered-component']
})

shallow(Component, {
  stubs: {
    'registered-component': Foo,
    'another-component': true
  }
})
```

**Provide data to components:**

```js
import { expect } from 'chai'

const wrapper = mount(Component, {
  provide: { fromMount: 'functionValue' }
})
expect(wrapper.text()).to.contain('functionValue')
```

**Provide data to components:**

```js
const wrapper = shallow(Component, {
  provide () {
    return {
      fromMount: 'functionValue'
    }
  }
})

expect(wrapper.text()).to.contain('functionValue')
```
