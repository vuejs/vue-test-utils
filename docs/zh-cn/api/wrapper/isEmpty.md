# `isEmpty()`

断言 `Wrapper` 并不包含子节点。

- **返回值：**`{boolean}`

- **示例：**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.isEmpty()).toBe(true)
```
