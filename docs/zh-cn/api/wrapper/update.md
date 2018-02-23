# `update()`

强制根 Vue 组件重渲染。

如果在包含一个 `vm` 的 `Wrapper` 上调用，则会强制 `Wrapper` `vm` 重渲染。

- **示例：**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.vm.bar).toBe('bar')
wrapper.vm.bar = 'new value'
wrapper.update()
expect(wrapper.vm.bar).toBe('new value')
```
