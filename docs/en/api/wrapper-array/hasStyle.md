# hasStyle(style, value)

Assert every `Wrapper` in `WrapperArray` DOM node has style matching value.

Returns `true` if `Wrapper` DOM node has `style` matching `value`.

**Note will only detect inline styles when running in `jsdom`.**
- **Arguments:**
  - `{string} style`
  - `{string} value`

- **Returns:** `{boolean}`

- **Example:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const divArray = wrapper.findAll('div')
expect(divArray.hasStyle('color', 'red')).toBe(true)
```
