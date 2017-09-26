# hasProp(prop, value)

- **Usage:**

Assert every `Wrapper` in `WrapperArray`  `vm` has `prop` matching `value`.

**Note the Wrapper must contain a Vue instance.**

- **Arguments:**
  - `{string} prop`
  - `{any} value`

- **Returns:** `{boolean}`

- **Example:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
const barArray = wrapper.findAll(Bar)
expect(barArray.hasProp('bar', 10)).to.equal(true)
```
