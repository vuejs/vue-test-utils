# find(selector)

Returns [`Wrapper`](README.md) of first DOM node or Vue component matching selector and predicate.

Use any valid [selector](../selectors.md) and an optional predicate.

- **Arguments:**
  - `{string|Component} selector`
  - `{function} predicate`

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

- **See also:** [Wrapper](README.md)
