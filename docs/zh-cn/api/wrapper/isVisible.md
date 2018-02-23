# `isVisible()`

断言 `Wrapper` 是否可见。

如果有一个祖先元素拥有 `display: none` 或 `visibility: hidden` 样式则返回 `false`。

这可以用于断言一个组件是否被 `v-show` 所隐藏。

- **返回值：** `{boolean}`

- **示例：**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.isVisible()).toBe(true)
expect(wrapper.find('.is-not-visible').isVisible()).toBe(false)
```
