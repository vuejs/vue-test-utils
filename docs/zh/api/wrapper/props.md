## props

返回 `Wrapper` `vm` 的 props 对象。如果提供了 `key`，则返回这个 `key` 对应的值。

**注意：该包裹器必须包含一个 Vue 实例。**

- **参数：**

  - `{string} key` **可选的**

- **返回值：**`{[prop: string]: any} | any`

- **示例：**

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
