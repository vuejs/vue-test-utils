# isEmpty()

- **Returns:** `{boolean}`

- **Usage:**

Assert `Wrapper` does not contain child node.

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.isEmpty()).to.equal(true)
```