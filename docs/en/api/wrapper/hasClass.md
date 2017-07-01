# hasClass(className)

- **Arguments:**
  - `{string} className`

- **Returns:** `{boolean}`

- **Usage:**

Assert `Wrapper` DOM node has class contains `className`.

Returns `true` if `Wrapper` DOM node contains class.

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.hasClass('bar')).to.equal(true)
```