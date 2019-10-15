## renderToString()

- **Các tham số:**

  - `{Component} component`
  - `{Object} options`
    - `{Object} context`
      - `{Array<Component|Object>|Component} children`
    - `{Object} slots`
      - `{Array<Component|Object>|Component|String} default`
      - `{Array<Component|Object>|Component|String} named`
    - `{Object} mocks`
    - `{Object|Array<string>} stubs`
    - `{Vue} localVue`

- **Trả về:** `{Promise<string>}`

- **Các option:**

Xem tất cả [option](./options.md)

- **Sử dụng:**

Renders một component ra HTML.

`renderToString` sử dụng [`vue-server-renderer`](https://ssr.vuejs.org/en/basic.html) để render một component ra HTML.

`renderToString` nằm trong package `@vue/server-test-utils`.

**Không thêm option:**

```js
import { renderToString } from '@vue/server-test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', async () => {
    const str = await renderToString(Foo)
    expect(str).toContain('<div></div>')
  })
})
```

**Với option:**

```js
import { renderToString } from '@vue/server-test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', async () => {
    const str = await renderToString(Foo, {
      propsData: {
        color: 'red'
      }
    })
    expect(str).toContain('red')
  })
})
```

**Với default slot và name slot:**

```js
import { renderToString } from '@vue/server-test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'
import FooBar from './FooBar.vue'

describe('Foo', () => {
  it('renders a div', async () => {
    const str = await renderToString(Foo, {
      slots: {
        default: [Bar, FooBar],
        fooBar: FooBar, // Will match <slot name="FooBar" />,
        foo: '<div />'
      }
    })
    expect(str).toContain('<div></div>')
  })
})
```

**Xóa các property toàn cục:**

```js
import { renderToString } from '@vue/server-test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', async () => {
    const $route = { path: 'http://www.example-path.com' }
    const str = await renderToString(Foo, {
      mocks: {
        $route
      }
    })
    expect(str).toContain($route.path)
  })
})
```
