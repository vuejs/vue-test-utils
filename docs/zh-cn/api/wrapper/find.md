# `find(selector)`

返回匹配选择器的第一个 DOM 节点或 Vue 组件的 [`Wrapper`](README.md)。

可以使用任何有效的[选择器](../selectors.md)。

- **参数：**
  - `{string|Component} selector`

- **返回值：**`{Wrapper}`

- **示例：**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
const div = wrapper.find('div')
expect(div.is('div')).toBe(true)
const bar = wrapper.find(Bar)
expect(bar.is(Bar)).toBe(true)
```

- **延伸阅读：**[Wrapper](README.md)
