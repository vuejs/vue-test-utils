# mount(component,{,options}])

- **Arguments:**

  - `{Component} component`
  - `{Object} options`
    - `{boolean} attachToDocument`
    - `{Object} context`
    - `{Object} slots`  
        - `{Array<Componet|Object>|Component|String} default`  
        - `{Array<Componet|Object>|Component|String} named`  
    - `{Object} globals`
    - `{Object} instance`
    - `{Object} stub` 
    
- **Arguments:**

- **Returns:** `{Wrapper}`

- **Options:**

`options` (`Object`): a Vue options object. Vue options are passed to the component when a new instance is created. , e.g. `store`, `propsData`. For full list, see the [Vue API](https://vuejs.org/v2/api/). Also takes vue-test-utils options:

`options.attachToDocument` (`Boolean`): Component will attach to DOM when rendered. This can be used with [`hasStyle`](/api/wrapper/hasStyle.md) to check multi element CSS selectors

`options.context` (`Object`): Passes context to functional component. Can only be used with functional components

`options.slots` (`Object`): Render component with slots.

`options.slots.default` (`Array[Component]|Component|String`): Default slot object to render, can be a Vue component or array of Vue components

`options.slots.name` (`Array[Component]|Component`): Named slots. i.e. slots.name will match a <slot name="name" />, can be a Vue component or array of Vue components

`options.globals` (`Object`): Add globals to Vue instance.

`options.instance` ('Object): instance for vue-test-utils to use. See [scopedVue](/api/scopedVue.md)

`options.stub` ('Object): Stubs components matchng the name passed with a string 

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

**Adding globals:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const $route = { path: 'http://www.example-path.com' }
    const wrapper = mount(Foo, {
      globals: {
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
import Bar from './Bar'

describe('Foo', () => {
  it('renders a div', () => {
    const wrapper = mount(Foo, {
      stub: {
        Bar: '<div class="stubbed />'
      }
    })
    expect(wrapper.contains('.stubbed')).to.equal(true)
    expect(wrapper.contains(Bar)).to.equal(true)
  })
})
```

- **See also:** [Wrapper](/api/wrapper/README.md)
