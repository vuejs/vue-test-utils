# isEmpty()

- **戻り値:** `{boolean}`

- **使い方:**

`WrapperArray`のすべての`Wrapper`に子ノードを含んでいないかアサートします。

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const divArray = wrapper.findAll('div')
expect(divArray.isEmpty()).to.equal(true)
```