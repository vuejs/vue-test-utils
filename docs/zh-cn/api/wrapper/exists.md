# exists()

Assert `Wrapper` or `WrapperArray` exists.

Returns false if called on an empty `Wrapper` or `WrapperArray`.

- **Returns:** `{boolean}`

- **Example:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.exists()).toBe(true)
expect(wrapper.find('does-not-exist').exists()).toBe(false)
expect(wrapper.findAll('div').exists()).toBe(true)
expect(wrapper.findAll('does-not-exist').exists()).toBe(false)
```
