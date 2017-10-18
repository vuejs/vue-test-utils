# setData(data)

Sets `Wrapper` `vm` data and forces update.

**Note the Wrapper must contain a Vue instance.**

- **Arguments:**
  - `{Object} data`

- **Example:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
wrapper.setData({ foo: 'bar' })
expect(wrapper.vm.foo).toBe('bar')
```
