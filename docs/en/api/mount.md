# `mount(component {, options}])`

- **Arguments:**

  - `{Component} component`
  - `{Object} options`

- **Returns:** `{Wrapper}`

- **Options:**

See [options](options.md)

- **Usage:**

Creates a [`Wrapper`](wrapper/README.md) that contains the mounted and rendered Vue component.

**Without options:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const wrapper = mount(Foo)
    expect(wrapper.contains('div')).toBe(true)
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
    expect(wrapper.hasProp('color', 'red')).toBe(true)
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
    expect(wrapper.contains('div')).toBe(true)
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
        fooBar: FooBar, // Will match `<slot name="FooBar" />`.
        foo: '<div />'
      }
    })
    expect(wrapper.contains('div')).toBe(true)
  })
})
```

**Stubbing global properties and lifecycle hooks:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const $route = { path: 'http://www.example-path.com' }
    const mounted = () => { /* original mounted hook suppressed */ }
    const wrapper = mount(Foo, {
      mocks: {
        $route,
        mounted
      }
    })
    expect(wrapper.vm.$route.path).toBe($route.path)
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
      stubs: {
        Bar: '<div class="stubbed" />',
        BarFoo: true,
        FooBar: Faz
      }
    })
    expect(wrapper.contains('.stubbed')).toBe(true)
    expect(wrapper.contains(Bar)).toBe(true)
  })
})
```

- **See also:** [Wrapper](wrapper/README.md)
