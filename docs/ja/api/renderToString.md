## renderToString()

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

- **戻り値:** `{Promise<string>}`

- **オプション:**

[オプション](./options.md)を参照してください。

- **使い方:**

コンポーネントを HTML にレンダリングします。

コンポーネントを HTML にレンダリングするために、`renderToString` は内部で [`vue-server-renderer`](https://ssr.vuejs.org/en/basic.html) を使用します。

`renderToString` は `@vue/server-test-utils` パッケージに含まれています。

**オプションなし:**

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

**Vue オプションを使用:**

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

**デフォルトおよび名前付きスロット:**

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
        fooBar: FooBar, // <slot name="FooBar" /> にマッチします。
        foo: '<div />'
      }
    })
    expect(str).toContain('<div></div>')
  })
})
```

**グローバルプロパティをスタブする:**

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
