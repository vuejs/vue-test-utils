# shallow(component,{,options}])

- **Arguments:**

  - `{Component} component`
  - `{Object} options`
    - `{boolean} attachToDocument`
    - `{Object} context`
    - `{Object} slots`
        - `{Array<Component|Object>|Component|String} default`
        - `{Array<Component|Object>|Component|String} named`
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

Stubs all child components.

Use any valid [selector](/api/selectors.md).

**Without options:**

```js
import { shallow } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const wrapper = shallow(Foo)
    expect(wrapper.contains('div')).to.equal(true)
  })
})
```

**With Vue options:**

```js
import { shallow } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const wrapper = shallow(Foo, {
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
import { shallow } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const wrapper = shallow(Foo, {
      attachToDocument: true
    })
    expect(wrapper.contains('div')).to.equal(true)
  })
})
```

**Default and named slots:**

```js
import { shallow } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'
import Bar from './Bar.vue'
import FooBar from './FooBar.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const wrapper = shallow(Foo, {
      slots: {
        default: [Bar, FooBar],
        fooBar: FooBar, // Will match <slot name="FooBar" />,
        foo: '<div />'
      }
    })
    expect(wrapper.find('div')).to.equal(true)
  })
})
```

**Stubbing global properties:**

```js
import { shallow } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const $route = { path: 'http://www.example-path.com' }
    const wrapper = shallow(Foo, {
      intercept: {
        $route
      }
    })
    expect(wrapper.vm.$route.path).to.equal($route.path)
  })
})
```
