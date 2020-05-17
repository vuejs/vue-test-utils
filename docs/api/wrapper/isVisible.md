## isVisible

::: warning Deprecation warning
`isVisible` is deprecated and will be removed in future releases.

Consider a custom matcher such as those provided in [jest-dom](https://github.com/testing-library/jest-dom#tobevisible).

When using with findComponent, access the DOM element with `findComponent(Comp).element`
:::

Assert `Wrapper` is visible.

Returns `false` if an ancestor element has `display: none` or `visibility: hidden` style.

This can be used to assert that a component is hidden by `v-show`.

- **Returns:** `{boolean}`

- **Example:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.isVisible()).toBe(true)
expect(wrapper.find('.is-not-visible').isVisible()).toBe(false)
```
