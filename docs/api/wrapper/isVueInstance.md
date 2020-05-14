## isVueInstance

::: warning Deprecation warning
`isVueInstance` is deprecated and will be removed in future releases.
:::

Assert `Wrapper` is Vue instance.

- **Returns:** `{boolean}`

- **Example:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.isVueInstance()).toBe(true)
```
