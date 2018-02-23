# `contains(selector)`

判断 `Wrapper` 是否包含了一个匹配[选择器](../selectors.md)的元素或组件。

- **参数：**
  - `{string|Component} selector`

- **返回值：** `{boolean}`

- **示例：**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
expect(wrapper.contains('p')).toBe(true)
expect(wrapper.contains(Bar)).toBe(true)
```

- **延伸阅读：**[选择器](../selectors.md)
