## props

Return `Wrapper` `vm` props object. If `key` is provided, the value for the `key` will be returned.

**Note the Wrapper must contain a Vue instance.**

- **Arguments:**

  - `{string} key` **optional**

- **Returns:** `{[prop: string]: any} | any`

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
expect(wrapper.props('bar')).toBe('baz')
```
