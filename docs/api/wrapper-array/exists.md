## exists

Assert `WrapperArray` exists.

Returns false if called on a `WrapperArray` with no `Wrapper` objects, or if
any of them do not exist.

- **Returns:** `{boolean}`

- **Example:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.findAll('div').exists()).toBe(true)
expect(wrapper.findAll('does-not-exist').exists()).toBe(false)
```
