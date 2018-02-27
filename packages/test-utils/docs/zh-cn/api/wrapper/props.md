# `props()`

返回 `Wrapper` `vm` 的 props 对象。

**注意：该包裹器必须包含一个 Vue 示例。**

- **返回值：**`{[prop: string]: any}`

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
```
