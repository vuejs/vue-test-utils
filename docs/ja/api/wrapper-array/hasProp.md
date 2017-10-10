# hasProp(prop, value)

`vm` が `value` に一致する `prop` を持つ `WrapperArray` において全て `Wrapper` か検証します。

**WrapperにはVueインスタンスを含む必要があることに注意してください。**

- **引数:**
  - `{string} prop`
  - `{any} value`

- **戻り値:** `{boolean}`

- **例:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
const barArray = wrapper.findAll(Bar)
expect(barArray.hasProp('bar', 10)).toBe(true)
```
