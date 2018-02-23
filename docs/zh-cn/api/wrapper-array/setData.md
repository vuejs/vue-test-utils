# `setData(data)`

为 `WrapperArray` 的每个 `Wrapper` `vm` 都设置数据并强行更新。

**注意：该包裹器必须包含一个 Vue 示例。**

- **参数：**
  - `{Object} data`

- **示例：**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
const barArray = wrapper.findAll(Bar)
barArray.setData({ foo: 'bar' })
expect(barArray.at(0).vm.foo).toBe('bar')
```
