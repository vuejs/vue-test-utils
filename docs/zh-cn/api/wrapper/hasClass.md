# hasClass(className)

(翻译中……)

Assert `Wrapper` DOM node has class contains `className`.

Returns `true` if `Wrapper` DOM node contains class.

- **Arguments:**
  - `{string} className`

- **Returns:** `{boolean}`

- **Example:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.hasClass('bar')).toBe(true)
```
