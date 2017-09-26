# hasAttribute(attribute, value)

- **Usage:**

Assert every `Wrapper` in `WrapperArray` DOM node has `attribute` matching `value`. 

- **Arguments:**
  - `{string} attribute`
  - `{string} value`

- **Returns:** `{boolean}`

- **Example:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const divArray = wrapper.findAll('div')
expect(divArray.hasAttribute('id', 'foo')).to.equal(true)
```
