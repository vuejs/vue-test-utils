## classes

Return `Wrapper` DOM node classes.

Returns Array of class names. Or a boolean if a class name is provided.

- **Arguments:**

  - `{string} className` **optional**

- **Returns:** `Array<{string}> | boolean`

- **Example:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.classes()).toContain('bar')
expect(wrapper.classes('bar')).toBe(true)
```
