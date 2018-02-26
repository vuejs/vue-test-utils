# `renderToString(component {, options}])`

- **参数：**

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

- **返回值：** `{string}`

- **选项：**

查阅[挂载选项](./options.md)

- **使用：**

将一个组件渲染为 HTML。

`renderToString` 在底层使用了 [`vue-server-renderer`](https://ssr.vuejs.org/en/basic.html) 来将一个组件渲染为 HTML。

**不带选项：**

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

**带 Vue 选项：**

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

**默认插槽和具名插槽：**

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

**全局属性存根：**

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
