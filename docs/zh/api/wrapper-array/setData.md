## setData

为 `WrapperArray` 的每个 `Wrapper` `vm` 都设置数据。

**注意：该包裹器必须包含一个 Vue 实例。**

- **参数：**

  - `{Object} data`

- **示例：**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

test('setData demo', async () => {
  const wrapper = mount(Foo)
  const barArray = wrapper.findAll(Bar)
  await barArray.setData({ foo: 'bar' })
  expect(barArray.at(0).vm.foo).toBe('bar')
})
```
