# hasProp(prop, value)

- **Arguments:**
  - `{string} prop`
  - `{any} value`

- **Returns:** `{boolean}`

- **Usage:**

Assert `Wrapper` `vm` has `prop` matching `value`.

Returns `true` if `Wrapper` `vm` has `prop` matching `value`.

**Note the Wrapper must contain a Vue instance.**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.hasProp('bar', 10)).to.equal(true)
```