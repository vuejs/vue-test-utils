# is(selector)

(翻译中……)

Assert every `Wrapper` in `WrapperArray` DOM node or `vm` matches [selector](../selectors.md).

- **Arguments:**
  - `{string|Component} selector`

- **Returns:** `{boolean}`

- **Example:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const divArray = wrapper.find('div')
expect(divArray.is('div')).toBe(true)
```
