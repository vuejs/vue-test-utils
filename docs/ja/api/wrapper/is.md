# is(selector)

- **引数:**
  - `{string|Component} セレクタ(selector)`

- **戻り値:** `{boolean}`

- **使い方:**

`Wrapper`のDOMノードか`vm`がセレクタと一致しているかアサートします。

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.is('div')).to.equal(true)
```