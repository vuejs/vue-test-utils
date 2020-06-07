## findComponent

返回第一个匹配的 Vue 组件的 `Wrapper`。

- **参数：**

  - `{Component|ref|name} selector`

- **返回值：** `{Wrapper}`

- **示例：**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)

const bar = wrapper.findComponent(Bar) // => 通过组件实例找到 Bar
expect(bar.exists()).toBe(true)
const barByName = wrapper.findComponent({ name: 'bar' }) // => 通过 `name` 找到 Bar
expect(barByName.exists()).toBe(true)
const barRef = wrapper.findComponent({ ref: 'bar' }) // => 通过 `ref` 找到 Bar
expect(barRef.exists()).toBe(true)
```
