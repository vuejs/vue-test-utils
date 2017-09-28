# isEmpty()

Assert every `Wrapper` in `WrapperArray` does not contain child node.

- **Returns:** `{boolean}`

- **Example:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const divArray = wrapper.findAll('div')
expect(divArray.isEmpty()).to.equal(true)
```
