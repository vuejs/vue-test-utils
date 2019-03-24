## setData

Sets `Wrapper` `vm` data.

setData works by recursively calling Vue.set.

The key of the `data` in the argument can also be a path to the component's nested data.

**Note: the Wrapper must contain a Vue instance.**

- **Arguments:**

  - `{Object} data`

- **Example:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
wrapper.setData({ foo: 'bar' })
expect(wrapper.vm.foo).toBe('bar')

wrapper.setData({ 'baz.baq': 'qux' })
expect(wrapper.vm.baz.baq).toBe('qux')
```
