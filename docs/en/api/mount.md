# mount(component,{,options}])

- **Arguments:**

  - `{Component} component`
  - `{Object} options`

- **Returns:** `{Wrapper}`

- **Options:**

See [options](/api/options.md)

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
