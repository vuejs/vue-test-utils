# hasAttribute(attribute, value)

- **Arguments:**
  - `{string} attribute`
  - `{string} value`

- **Returns:** `{boolean}`

- **Usage:**

Assert every `Wrapper` in `WrapperArray` DOM node has `attribute` matching `value`. 

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const divArray = wrapper.findAll('div')
expect(divArray.hasAttribute('id', 'foo')).to.equal(true)
```
