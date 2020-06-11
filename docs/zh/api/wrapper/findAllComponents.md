## findAllComponents

为所有匹配的 Vue 组件返回一个 [`WrapperArray`](../wrapper-array/)。

- **参数：**

  - `{Component|ref|name} selector`

- **返回值：** `{WrapperArray}`

- **示例：**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
const bar = wrapper.findAllComponents(Bar).at(0)
expect(bar.exists()).toBeTruthy()
const bars = wrapper.findAllComponents(Bar)
expect(bar).toHaveLength(1)
```
