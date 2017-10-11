# shallow(component,{,options}])

- **引数:**

  - `{Component} component`
  - `{Object} options`
    - `{boolean} attachToDocument`
    - `{Object} context`
    - `{Object} slots`
        - `{Array<Componet|Object>|Component|String} default`
        - `{Array<Componet|Object>|Component|String} named`
    - `{Object} intercept`
    - `{Object|Array<string>} stubs`
    - `{boolean} clone`
    - `{Object} children`
    - `{Vue} localVue`

- **戻り値:** `{Wrapper}`

- **オプション:**

[オプション](/docs/ja/api/options.md)を参照してください。

- **使い方:**

最初のDOMノードまたはVueコンポーネント一致セレクタの[`Wrapper`](/docs/ja/api/wrapper/README.md)を返します。

全ての子コンポーネントをスタブします。

有効な[セレクタ](/docs/ja/api/selectors.md)を使用してください。

**オプションなし:**

```js
import { shallow } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const wrapper = shallow(Foo)
    expect(wrapper.contains('div')).to.equal(true)
  })
})
```

**Vueオプションを使用:**

```js
import { shallow } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const wrapper = shallow(Foo, {
      propsData: {
        color: 'red'
      }
    })
    expect(wrapper.hasProp('color', 'red')).to.equal(true)
  })
})
```

**DOMへのアタッチ:**

```js
import { shallow } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const wrapper = shallow(Foo, {
      attachToDocument: true
    })
    expect(wrapper.contains('div')).to.equal(true)
  })
})
```

**デフォルトおよび名前付きスロット:**

```js
import { shallow } from 'vue-test-utils'
import { expect } from 'chai'
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
    expect(wrapper.find('div')).to.equal(true)
  })
})
```

**グローバルプロパティのスタブ:**

```js
import { shallow } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const $route = { path: 'http://www.example-path.com' }
    const wrapper = shallow(Foo, {
      intercept: {
        $route
      }
    })
    expect(wrapper.vm.$route.path).to.equal($route.path)
  })
})
```
