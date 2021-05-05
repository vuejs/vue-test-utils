## name

::: warning Deprecation warning
`name` is deprecated and will be removed in future releases. See [vue-test-utils.vuejs.org/upgrading-to-v1/#name](https://vue-test-utils.vuejs.org/upgrading-to-v1/#name)
:::

Returns component name if `Wrapper` contains a Vue instance, or the tag name of `Wrapper` DOM node if `Wrapper` does not contain a Vue instance.

- **Returns:** `{string}`

- **Example:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.name()).toBe('Foo')
const p = wrapper.find('p')
expect(p.name()).toBe('p')
```
