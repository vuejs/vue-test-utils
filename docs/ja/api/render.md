# `render(component {, options}])`

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

- **戻り値:** `{CheerioWrapper}`

- **オプション:**

[オプション](./options.md)を参照してください。

- **使い方:**

オブジェクトを文字列にレンダリングして [cheerio wrapper](https://github.com/cheeriojs/cheerio) を返します。

Cheerio は Node.js で jQuery のように DOM をスキャンするためのライブラリです。  
これは Vue Test Utils の [`Wrapper`](wrapper/README.md) に似ているAPIを持っています。

コンポーネントを静的なHTMLにレンダリングするために、`render` は内部で [`vue-server-renderer`](https://ssr.vuejs.org/en/basic.html) を使用します。

`render` は `@vue/server-test-utils` パッケージに含まれています。

**オプションなし:**

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

**Vueオプションを使用:**

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

**デフォルトおよび名前付きスロット:**

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

**グローバルプロパティをスタブする:**

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
