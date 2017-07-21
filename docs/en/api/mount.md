# mount(component,{,options}])

- **Arguments:**

  - `{Component} component`
  - `{Object} options`
    - `{boolean} attachToDocument`
    - `{Object} context`
    - `{Object} slots`  
        - `{Array<Componet|Object>|Component|String} default`  
        - `{Array<Componet|Object>|Component|String} named`  
    - `{Object} intercept`
    - `{Object|Array<string>} stubs`
    - `{boolean} clone`
    - `{Object} children`
    - `{Vue} localVue`

- **Returns:** `{Wrapper}`

- **Options:**

`options` (`Object`): a Vue options object. Vue options are passed to the component when a new instance is created. , e.g. `store`, `propsData`. For full list, see the [Vue API](https://vuejs.org/v2/api/). Also takes vue-test-utils options:

`options.attachToDocument` (`boolean`): Component will attach to DOM when rendered. This can be used with [`hasStyle`](/api/wrapper/hasStyle.md) to check multi element CSS selectors

`options.clone` (`boolean`): Clones component before editing if `true`, does not if `false`. Defaults to `true`

`options.context` (`Object`): Passes context to functional component. Can only be used with functional components

`options.children` (`Array<string|Component|Function>`): Passes children to be rendered by functional components

`options.localVue` (`Object`): vue class to use in `mount`. See [createLocalVue](/api/createLocalVue.md)

`options.slots` (`Object`): Render component with slots.

`options.slots.default` (`Array[Component]|Component|String`): Default slot object to render, can be a Vue component or array of Vue components

`options.slots.name` (`Array[Component]|Component`): Named slots. i.e. slots.name will match a <slot name="name" />, can be a Vue component or array of Vue components

`options.intercept` (`Object`): Add globals to Vue instance.

`options.stubs` (`Object|Array<string>`): Stubs components matching the name. Takes object or array of strings

- **Usage:**

Returns [`Wrapper`](/api/wrapper/README.md) of first DOM node or Vue component matching selector. 

Use any valid [selector](/api/selectors.md).

**Without options:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const wrapper = mount(Foo)
    expect(wrapper.contains('div')).to.equal(true)
  })
})
```
**With Vue options:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const wrapper = mount(Foo, {
      propsData: {
        color: 'red'
      }
    })
    expect(wrapper.hasProp('color', 'red')).to.equal(true)
  })
})
```

**Attach to DOM:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const wrapper = mount(Foo, {
      attachToDocument: true
    })
    expect(wrapper.contains('div')).to.equal(true)
  })
})
```
**Default and named slots:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'
import Bar from './Bar.vue'
import FooBar from './FooBar.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const wrapper = mount(Foo, {
      slots: {
        default: [Bar, FooBar],
        fooBar: FooBar, // Will match <slot name="FooBar" />,
        foo: '<div />'
      }
    })
    expect(wrapper.contains('div')).to.equal(true)
  })
})
```

**Stubbing global properties:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const $route = { path: 'http://www.example-path.com' }
    const wrapper = mount(Foo, {
      intercept: {
        $route
      }
    })
    expect(wrapper.vm.$route.path).to.equal($route.path)
  })
})
```

**Stubbing components:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'
import Bar from './Bar.vue'
import Faz from './Faz.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const wrapper = mount(Foo, {
      stub: {
        Bar: '<div class="stubbed />',
        BarFoo: true,
        FooBar: Faz
      }
    })
    expect(wrapper.contains('.stubbed')).to.equal(true)
    expect(wrapper.contains(Bar)).to.equal(true)
  })
})
```

- **See also:** [Wrapper](/api/wrapper/README.md)
