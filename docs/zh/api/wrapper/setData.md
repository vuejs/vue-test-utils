## setData

设置 `Wrapper` `vm` 的属性。

`setData` 通过递归调用 `Vue.set` 生效。

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
