# hasAttribute(attribute, value)

- **引数:**
  - `{string} attribute`
  - `{string} value`

- **戻り値:** `{boolean}`

- **使い方:**

`WrapperArray`の全ての`Wrapper`が`value`と一致する属性を持っているかアサートします。

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const divArray = wrapper.findAll('div')
expect(divArray.hasAttribute('id', 'foo')).to.equal(true)
```
