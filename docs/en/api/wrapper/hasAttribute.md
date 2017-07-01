# hasAttribute(attribute, value)

- **Arguments:**
  - `{string} attribute`
  - `{string} value`

- **Returns:** `{boolean}`

- **Usage:**

Assert `Wrapper` DOM node has attribute matching value.

Returns `true` if `Wrapper` DOM node contains attribute with matching value.

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.hasAttribute('id', 'foo')).to.equal(true)
```