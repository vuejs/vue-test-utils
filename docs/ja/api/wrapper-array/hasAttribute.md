# hasAttribute(attribute, value)

`WrapperArray` の全ての `Wrapper` が `value` と一致する属性を持っているか検証します。

- **引数:**
  - `{string} attribute`
  - `{string} value`

- **戻り値:** `{boolean}`

- **例:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const divArray = wrapper.findAll('div')
expect(divArray.hasAttribute('id', 'foo')).toBe(true)
```
