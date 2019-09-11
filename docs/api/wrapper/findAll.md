## findAll

Returns a [`WrapperArray`](../wrapper-array/).

Use any valid [selector](../selectors.md).

- **Arguments:**

  - `{string|Component} selector`

- **Returns:** `{WrapperArray}`

- **Example:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
const div = wrapper.findAll('div').at(0)
expect(div.is('div')).toBe(true)
const bar = wrapper.findAll(Bar).at(0)
expect(bar.is(Bar)).toBe(true)
```
