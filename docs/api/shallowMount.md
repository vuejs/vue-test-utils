## shallowMount()

- **Arguments:**

  - `{Component} component`
  - `{Object} options`
    - `{boolean} attachToDocument`
    - `{Object} context`
      - `{Array<Component|Object>|Component} children`
    - `{Object} slots`
      - `{Array<Component|Object>|Component|String} default`
      - `{Array<Component|Object>|Component|String} named`
    - `{Object} mocks`
    - `{Object|Array<string>} stubs`
    - `{Vue} localVue`

- **Returns:** `{Wrapper}`

- **Options:**

See [options](./options.md)

- **Usage:**

Like [`mount`](mount.md), it creates a [`Wrapper`](wrapper/) that contains the mounted and rendered Vue component, but with stubbed child components.

**Without options:**

```js
import { shallowMount } from '@vue/test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const wrapper = shallowMount(Foo)
    expect(wrapper.contains('div')).toBe(true)
  })
})
```

**With Vue options:**

```js
import { shallowMount } from '@vue/test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const wrapper = shallowMount(Foo, {
      propsData: {
        color: 'red'
      }
    })
    expect(wrapper.props().color).toBe('red')
  })
})
```

**Attach to DOM:**

```js
import { shallowMount } from '@vue/test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const wrapper = shallowMount(Foo, {
      attachToDocument: true
    })
    expect(wrapper.contains('div')).toBe(true)
  })
})
```

**Default and named slots:**

```js
import { shallowMount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'
import FooBar from './FooBar.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const wrapper = shallowMount(Foo, {
      slots: {
        default: [Bar, FooBar],
        fooBar: FooBar, // Will match <slot name="FooBar" />,
        foo: '<div />'
      }
    })
    expect(wrapper.contains('div')).toBe(true)
  })
})
```

**Stubbing global properties:**

```js
import { shallowMount } from '@vue/test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const $route = { path: 'http://www.example-path.com' }
    const wrapper = shallowMount(Foo, {
      mocks: {
        $route
      }
    })
    expect(wrapper.vm.$route.path).toBe($route.path)
  })
})
```
