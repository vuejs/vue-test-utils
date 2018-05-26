## setData(data)

设置 `Wrapper` `vm` 的属性。

`setData` 通过合并现有的属性生效，被覆写的数组除外。

**注意：该包裹器必须包含一个 Vue 示例。**

- **参数：**
  - `{Object} data`

- **示例：**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
wrapper.setData({ foo: 'bar' })
expect(wrapper.vm.foo).toBe('bar')
```
