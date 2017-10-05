# hasProp(prop, value)

Assert `Wrapper` `vm` has `prop` matching `value`.

Returns `true` if `Wrapper` `vm` has `prop` matching `value`.


**Note: the Wrapper must contain a Vue instance.**

- **Arguments:**
  - `{string} prop`
  - `{any} value`

- **Returns:** `{boolean}`

- **Example:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.hasProp('bar', 10)).toBe(true)
```
