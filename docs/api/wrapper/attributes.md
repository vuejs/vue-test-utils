## attributes

Returns `Wrapper` DOM node attribute object. If `key` is provided, the value for the `key` will be returned.

- **Arguments:**

  - `{string} key` **optional**

- **Returns:** `{[attribute: string]: any} | string`

- **Example:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.attributes().id).toBe('foo')
expect(wrapper.attributes('id')).toBe('foo')
```
