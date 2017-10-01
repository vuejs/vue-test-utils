# find(selector)

Returns [`Wrapper`](README.md) of first DOM node or Vue component matching selector.

Use any valid [selector](../selectors.md).

- **Arguments:**
  - `{string|Component} selector`

- **Returns:** `{Wrapper}`

- **Example:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
const div = wrapper.find('div')
expect(div.is('div')).toBe(true)
const bar = wrapper.find(Bar)
expect(bar.is(Bar)).toBe(true)
```

- **See also:** [Wrapper](/docs/en/api/wrapper/README.md)
