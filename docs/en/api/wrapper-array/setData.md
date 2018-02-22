# `setData(data)`

Sets `Wrapper` `vm` data and forces update on each `Wrapper` in `WrapperArray`.

**Note every `Wrapper` must contain a Vue instance.**

- **Arguments:**
  - `{Object} data`

- **Example:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
const barArray = wrapper.findAll(Bar)
barArray.setData({ foo: 'bar' })
expect(barArray.at(0).vm.foo).toBe('bar')
```
