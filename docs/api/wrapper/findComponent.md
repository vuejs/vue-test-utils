## findComponent

Returns `Wrapper` of first matching Vue component.

- **Arguments:**

  - `{Component|ref|name} selector`

- **Returns:** `{Wrapper}`

- **Example:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)

const bar = wrapper.findComponent(Bar) //=> finds Bar by component instance
expect(bar.exists()).toBe(true)
const barByName = wrapper.findComponent({ name: 'bar' }) //=> finds Bar by `name`
expect(barByName.exists()).toBe(true)
const barRef = wrapper.findComponent({ ref: 'bar' }) //=> finds Bar by `ref`
expect(barRef.exists()).toBe(true)
```
