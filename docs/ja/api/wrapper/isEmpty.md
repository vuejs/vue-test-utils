# isEmpty()

- **戻り値:** `{boolean}`

- **使い方:**

`Wrapper`に子ノードを含んでいないかアサートします。

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.isEmpty()).to.equal(true)
```