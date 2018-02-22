# `props()`

Return `Wrapper` `vm` props object.

**Note the Wrapper must contain a Vue instance.**

- **Returns:** `{[prop: string]: any}`

- **Example:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo, {
  propsData: {
    bar: 'baz'
  }
})
expect(wrapper.props().bar).toBe('baz')
```
