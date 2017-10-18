# is(selector)

Assert `Wrapper` DOM node or `vm` matches [selector](../selectors.md).

- **Arguments:**
  - `{string|Component} selector`

- **Returns:** `{boolean}`

- **Example:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.is('div')).toBe(true)
```
