# `update()`

强制 `WrapperArray` 的每个 `Wrapper` 都根 Vue 组件重渲染。

如果调用在 Vue 组件的包裹器数组上，则会强制每个 Vue 组件都重渲染。

- **示例：**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const divArray = wrapper.findAll('div')
expect(divArray.at(0).vm.bar).toBe('bar')
divArray.at(0).vm.bar = 'new value'
divArray.update()
expect(divArray.at(0).vm.bar).toBe('new value')
```
