# `attributes()`

Returns `Wrapper` DOM node attribute object.

- **Returns:** `{[attribute: string]: any}`

- **Example:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.attributes().id).toBe('foo')
```
