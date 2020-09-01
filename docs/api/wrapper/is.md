## is

::: warning Deprecation warning
Using `is` to assert that wrapper matches DOM selector is deprecated and will be removed.

For such use cases consider a custom matcher such as those provided in [jest-dom](https://github.com/testing-library/jest-dom#custom-matchers).
or for DOM element type assertion use native [`Element.tagName`](https://developer.mozilla.org/en-US/docs/Web/API/Element/tagName) instead.

To keep these tests, a valid replacement for:

- `is('DOM_SELECTOR')` is an assertion of `wrapper.element.tagName`.
- `is('ATTR_NAME')` is a truthy assertion of `wrapper.attributes('ATTR_NAME')`.
- `is('CLASS_NAME')` is a truthy assertion of `wrapper.classes('CLASS_NAME')`.

Assertion against component definition is not deprecated

When using with findComponent, access the DOM element with `findComponent(Comp).element`
:::

Assert `Wrapper` DOM node or `vm` matches [selector](../selectors.md).

- **Arguments:**

  - `{string|Component} selector`

- **Returns:** `{boolean}`

- **Example:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.is('div')).toBe(true)
```
