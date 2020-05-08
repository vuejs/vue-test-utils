## isEmpty

::: warning
`isEmpty` is deprecated and will be removed in future releases.

Consider a custom matcher such as those provided in [jest-dom](https://github.com/testing-library/jest-dom#tobeempty).

When using with findComponent, access the DOM element with `findComponent(Comp).element`
:::

Assert `Wrapper` does not contain child node.

- **Returns:** `{boolean}`

- **Example:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.isEmpty()).toBe(true)
```
