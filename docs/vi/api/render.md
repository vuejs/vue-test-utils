## render()

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

- **Trả về:** `{Promise<CheerioWrapper>}`

- **Các option:**

Xem tất cả [option](./options.md)

- **Sử dụng:**

Render một object thành strinhg và trả về một
Renders an object to a string and returns a [cheerio wrapper](https://github.com/cheeriojs/cheerio).

Cheerio là một thư viện như jQuery để duyệt qua các DOM trong Node.js. Nó có các API tương tự như Vue Test Utils [`Wrapper`](wrapper/).

`render` sử dụng [`vue-server-renderer`](https://ssr.vuejs.org/en/basic.html) bên dưới, để render component sang HTML tĩnh.

`render` đã bao gồm trong package `@vue/server-test-utils`.

**Không thêm option:**

```js
import { render } from '@vue/server-test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', async () => {
    const wrapper = await render(Foo)
    expect(wrapper.text()).toContain('<div></div>')
  })
})
```

**Với option:**

```js
import { render } from '@vue/server-test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', async () => {
    const wrapper = await render(Foo, {
      propsData: {
        color: 'red'
      }
    })
    expect(wrapper.text()).toContain('red')
  })
})
```

**Với default slot và name slot:**

```js
import { render } from '@vue/server-test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'
import FooBar from './FooBar.vue'

describe('Foo', () => {
  it('renders a div', async () => {
    const wrapper = await render(Foo, {
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

**Xóa các property toàn cục:**

```js
import { render } from '@vue/server-test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', async () => {
    const $route = { path: 'http://www.example-path.com' }
    const wrapper = await render(Foo, {
      mocks: {
        $route
      }
    })
    expect(wrapper.text()).toContain($route.path)
  })
})
```
