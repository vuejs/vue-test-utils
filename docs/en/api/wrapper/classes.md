# `classes()`

Return `Wrapper` DOM node classes.

Returns Array of class names.

- **Returns:** `Array<{string}>`

- **Example:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.classes()).toContain('bar')
```
