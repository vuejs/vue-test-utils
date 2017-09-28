# contains(selector)

Assert `Wrapper` contains an element or component matching [selector](../selectors.md).

- **Arguments:**
  - `{string|Component} selector`

- **Returns:** `{boolean}`

- **Example:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
expect(wrapper.contains('p')).to.equal(true)
expect(wrapper.contains(Bar)).to.equal(true)
```

- **See also:** [selectors](../selectors.md)
