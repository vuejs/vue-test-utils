# contains(selector)

- **引数:**
  - `{string|Component} セレクタ(selector)`

- **戻り値:** `{boolean}`

- **使い方:**

`Wrapper`に要素、もしくは[セレクタ](/docs/ja/api/selectors.md)で指定したコンポーネントを含んでいるかアサートします。

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
expect(wrapper.contains('p')).to.equal(true)
expect(wrapper.contains(Bar)).to.equal(true)
```

- **参照:** [セレクタ](/docs/ja/api/selectors.md)
