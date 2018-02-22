# `renderToString(component {, options}])`

- **Arguments:**

  - `{Component} component`
  - `{Object} options`
    - `{Object} context`
      - `{Array<Component|Object>|Component} children`
    - `{Object} slots`
        - `{Array<Componet|Object>|Component|String} default`
        - `{Array<Componet|Object>|Component|String} named`
    - `{Object} mocks`
    - `{Object|Array<string>} stubs`
    - `{Vue} localVue`

- **Returns:** `{string}`

- **Options:**

See [options](./options.md)

- **Usage:**

Renders a component to HTML.

`renderToString` uses [`vue-server-renderer`](https://ssr.vuejs.org/en/basic.html) under the hood, to render a component to HTML.

**Without options:**

```js
import { renderToString } from '@vue/test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const renderedString = renderToString(Foo)
    expect(renderedString).toContain('<div></div>')
  })
})
```

**With Vue options:**

```js
import { renderToString } from '@vue/test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const renderedString = renderToString(Foo, {
      propsData: {
        color: 'red'
      }
    })
    expect(renderedString).toContain('red')
  })
})
```

**Default and named slots:**

```js
import { renderToString } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'
import FooBar from './FooBar.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const renderedString = renderToString(Foo, {
      slots: {
        default: [Bar, FooBar],
        fooBar: FooBar, // Will match <slot name="FooBar" />,
        foo: '<div />'
      }
    })
    expect(renderedString).toContain('<div></div>')
  })
})
```

**Stubbing global properties:**

```js
import { renderToString } from '@vue/test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const $route = { path: 'http://www.example-path.com' }
    const renderedString = renderToString(Foo, {
      mocks: {
        $route
      }
    })
    expect(renderedString).toContain($route.path)
  })
})
```
