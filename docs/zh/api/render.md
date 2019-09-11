## render()

- **参数：**

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

- **返回值：** `{Promise<CheerioWrapper>}`

- **选项：**

查阅[挂载选项](./options.md)

- **使用：**

将一个对象渲染成为一个字符串并返回一个 [cheerio 包裹器](https://github.com/cheeriojs/cheerio)。

Cheerio 是一个类似 jQuery 的库，可以在 Node.js 中游览 DOM 对象。它的 API 和 Vue Test Utils 的 [`Wrapper`](wrapper/) 类似。

`render` 在底层使用 [`vue-server-renderer`](https://ssr.vuejs.org/zh/basic.html) 将一个组件渲染为静态的 HTML。

`render` 被包含在了 `@vue/server-test-utils` 包之中。

**不带选项：**

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

**带 Vue 选项：**

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

**默认插槽和具名插槽：**

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

**全局属性存根：**

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
