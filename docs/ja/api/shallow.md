# shallow(component {, options}])

- **引数:**

  - `{Component} component`
  - `{Object} options`
    - `{boolean} attachToDocument`
    - `{Object} context`
      - `{Array<Component|Object>|Component} children`
    - `{Object} slots`
        - `{Array<Componet|Object>|Component|String} default`
        - `{Array<Componet|Object>|Component|String} named`
    - `{Object} mocks`
    - `{Object|Array<string>} stubs`
    - `{Vue} localVue`

- **戻り値:** `{Wrapper}`

- **オプション:**

[オプション](./options.md)を参照してください。

- **使い方:**

[`mount`](mount.md)のようにマウントされて描画された Vue コンポーネントを含む [`Wrapper`](./wrapper/README.md) を生成しますが、  
子コンポーネントはスタブされたコンポーネントです。

**オプションなし:**

```js
import { shallow } from '@vue/test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const wrapper = shallow(Foo)
    expect(wrapper.contains('div')).toBe(true)
  })
})
```

**Vueオプションを使用:**

```js
import { shallow } from '@vue/test-utils'
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

**DOMへのアタッチ:**

```js
import { shallow } from '@vue/test-utils'
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

**デフォルトおよび名前付きスロット:**

```js
import { shallow } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'
import FooBar from './FooBar.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const wrapper = shallow(Foo, {
      slots: {
        default: [Bar, FooBar],
        fooBar: FooBar, // <slot name="FooBar" /> と一致する,
        foo: '<div />'
      }
    })
    expect(wrapper.find('div')).toBe(true)
  })
})
```

**グローバルプロパティのスタブ:**

```js
import { shallow } from '@vue/test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const $route = { path: 'http://www.example-path.com' }
    const wrapper = shallow(Foo, {
      intercept: {
        $route
      }
    })
    expect(wrapper.vm.$route.path).toBe($route.path)
  })
})
```
