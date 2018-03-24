# `render(component {, options}])`

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

- **Returns:** `{CheerioWrapper}`

- **Options:**

See [options](./options.md)

- **Usage:**

Renders an object to a string and returns a [cheerio wrapper](https://github.com/cheeriojs/cheerio).

Cheerio is a jQuery-like library to traverse the DOM in Node.js. It has a similar API to the Vue Test Utils [`Wrapper`](wrapper/README.md).

`render` uses [`vue-server-renderer`](https://ssr.vuejs.org/en/basic.html) under the hood, to render a component to static HTML.

`render` is exported from the `@vue/server-test-utils` package.

**Without options:**

```js
import { render } from '@vue/server-test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const wrapper = render(Foo)
    expect(wrapper.text()).toContain('<div></div>')
  })
})
```

**With Vue options:**

```js
import { render } from '@vue/server-test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const wrapper = render(Foo, {
      propsData: {
        color: 'red'
      }
    })
    expect(wrapper.text()).toContain('red')
  })
})
```

**Default and named slots:**

```js
import { render } from '@vue/server-test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'
import FooBar from './FooBar.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const wrapper = render(Foo, {
      slots: {
        default: [Bar, FooBar],
        fooBar: FooBar, // Will match <slot name="FooBar" />,
        foo: '<div />'
      }
    })
    expect(wrapper.text()).toContain('<div></div>')
  })
})
```

**Stubbing global properties:**

```js
import { render } from '@vue/server-test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const $route = { path: 'http://www.example-path.com' }
    const wrapper = render(Foo, {
      mocks: {
        $route
      }
    })
    expect(wrapper.text()).toContain($route.path)
  })
})
```
