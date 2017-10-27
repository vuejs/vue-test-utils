# shallow(component {, options}])

- **Принимает:**

  - `{Component} component`
  - `{Object} options`
    - `{boolean} attachToDocument`
    - `{Object} context`
    - `{Object} slots`
        - `{Array<Componet|Object>|Component|String} default`
        - `{Array<Componet|Object>|Component|String} named`
    - `{Object} mocks`
    - `{Object|Array<string>} stubs`
    - `{boolean} clone`
    - `{Object} children`
    - `{Vue} localVue`

- **Возвращает:** `{Wrapper}`

- **Опции:**

See [options](./options.md)

- **Использование:**

Returns [`Wrapper`](./wrapper/README.md) of first DOM node or Vue component matching selector.

Stubs all child components.

Используйте любой валидный [селектор](./selectors.md).

**Без опций:**

```js
import { shallow } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const wrapper = shallow(Foo)
    expect(wrapper.contains('div')).toBe(true)
  })
})
```

**С опциями Vue:**

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
    expect(wrapper.hasProp('color', 'red')).toBe(true)
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
    expect(wrapper.contains('div')).toBe(true)
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
    expect(wrapper.find('div')).toBe(true)
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
      mocks: {
        $route
      }
    })
    expect(wrapper.vm.$route.path).toBe($route.path)
  })
})
```
