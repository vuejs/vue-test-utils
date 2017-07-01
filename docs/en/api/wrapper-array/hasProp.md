# hasProp(prop, value)

Check if every wrapper vm in wrapper array has prop matching value 

Can only be called on a Vue instance.

# hasProp(prop, value)

- **Arguments:**
  - `{string} prop`
  - `{any} value`

- **Returns:** `{boolean}`

- **Usage:**

Assert every `Wrapper` in `WrapperArray`  `vm` has `prop` matching `value`.

**Note the Wrapper must contain a Vue instance.**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
const barArray = wrapper.findAll(Bar)
expect(barArray.hasProp('bar', 10)).to.equal(true)
```
