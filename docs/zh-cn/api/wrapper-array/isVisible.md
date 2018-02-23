# `isVisible()`

断言每个 `WrapperArray` 中的每个 `Wrapper` 是否可见。

如果至少一个元素的祖先拥有 `display: none` 或 `visibility: hidden` 样式则返回 `false`。

这可以用于断言一个组件是否被 `v-show` 所隐藏。

- **返回值：** `{boolean}`

- **示例：**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.isVisible()).toBe(true)
expect(wrapper.findAll('.is-not-visible').isVisible()).toBe(false)
expect(wrapper.findAll('.is-visible').isVisible()).toBe(true)
```
