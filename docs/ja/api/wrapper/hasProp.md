# hasProp(prop, value)

- **引数:**
  - `{string} プロパティ(prop)`
  - `{any} 値(value)`

- **戻り値:** `{boolean}`

- **使い方:**

`Wrapper`、`vm`が`value`と一致する`prop`を持っているかアサートします。

`Wrapper`、`vm`が`value`と一致する `prop`を持つ場合は`true`を返します。

**ラッパーにはVueインスタンスが含まれている必要があることに注意してください。**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.hasProp('bar', 10)).to.equal(true)
```