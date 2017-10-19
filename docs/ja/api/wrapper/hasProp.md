# hasProp(prop, value)

`Wrapper` `vm`が `value` と一致する `prop` を持っているか検証します。

`Wrapper` `vm`が `value` と一致する `prop` を持つ場合は `true` を返します。


**Wrapper には Vue インスタンスが含まれている必要があることに注意してください。**

- **引数:**
  - `{string} prop`
  - `{any} value`

- **戻り値:** `{boolean}`

- **例:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.hasProp('bar', 10)).toBe(true)
```
