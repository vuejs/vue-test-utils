## findAllComponents

Returns a [`WrapperArray`](../wrapper-array/) of all matching Vue components.

- **Arguments:**

  - `{Component|ref|name} selector`

- **Returns:** `{WrapperArray}`

- **Example:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
const bar = wrapper.findAllComponents(Bar).at(0)
expect(bar.exists()).toBeTruthy()
const bars = wrapper.findAllComponents(Bar)
expect(bars).toHaveLength(1)
```
