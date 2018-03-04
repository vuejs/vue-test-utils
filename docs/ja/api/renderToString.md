# `renderToString(component {, options}])`

- **引数:**

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

- **戻り値:** `{string}`

- **オプション:**

[オプション](./options.md)を参照してください。

- **使い方:**

コンポーネントをHTMLにレンダリングします。

コンポーネントをHTMLにレンダリングするために、`renderToString` は内部で [`vue-server-renderer`](https://ssr.vuejs.org/en/basic.html) を使用します。

**オプションなし:**

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

**Vueオプションを使用:**

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

**デフォルトおよび名前付きスロット:**

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
        fooBar: FooBar, // <slot name="FooBar" /> にマッチします。
        foo: '<div />'
      }
    })
    expect(renderedString).toContain('<div></div>')
  })
})
```

**グローバルプロパティをスタブする:**

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
