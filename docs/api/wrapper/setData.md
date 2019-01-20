## setData

Sets `Wrapper` `vm` data.

setData works by recursively calling Vue.set.

**Note the Wrapper must contain a Vue instance.**

- **Arguments:**

  - `{Object} data`

- **Example:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
wrapper.setData({ foo: 'bar' })
expect(wrapper.vm.foo).toBe('bar')
```
