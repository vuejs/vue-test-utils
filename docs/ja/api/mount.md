# mount(component,{,options}])

- **引数:**

  - `{Component} コンポーネント(component)`
  - `{Object} オプション(options)`

- **戻り値:** `{Wrapper}`

- **オプション:**

[オプション](/docs/ja/api/options.md)を見る

- **使い方:**


最初のDOMノードまたはVueコンポーネント一致セレクタの[`ラッパー`](/docs/ja/api/wrapper/README.md)を返します。

有効な[セレクタ](/docs/ja/api/selectors.md)を使用してください。

**オプションなし:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const wrapper = mount(Foo)
    expect(wrapper.contains('div')).to.equal(true)
  })
})
```
**Vueオプションを使用:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const wrapper = mount(Foo, {
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
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const wrapper = mount(Foo, {
      attachToDocument: true
    })
    expect(wrapper.contains('div')).to.equal(true)
  })
})
```
**デフォルトおよび名前付きスロット:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'
import Bar from './Bar.vue'
import FooBar from './FooBar.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const wrapper = mount(Foo, {
      slots: {
        default: [Bar, FooBar],
        fooBar: FooBar, // Will match <slot name="FooBar" />,
        foo: '<div />'
      }
    })
    expect(wrapper.contains('div')).to.equal(true)
  })
})
```

**グローバルプロパティのスタブ:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const $route = { path: 'http://www.example-path.com' }
    const wrapper = mount(Foo, {
      intercept: {
        $route
      }
    })
    expect(wrapper.vm.$route.path).to.equal($route.path)
  })
})
```

**コンポーネントのスタブ:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'
import Bar from './Bar.vue'
import Faz from './Faz.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const wrapper = mount(Foo, {
      stub: {
        Bar: '<div class="stubbed />',
        BarFoo: true,
        FooBar: Faz
      }
    })
    expect(wrapper.contains('.stubbed')).to.equal(true)
    expect(wrapper.contains(Bar)).to.equal(true)
  })
})
```

- **参照:** [`ラッパー`](/docs/ja/api/wrapper/README.md)
