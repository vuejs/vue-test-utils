## createWrapper(node [, options])

- **参数：**

  - `{vm|HTMLElement} node`
  - `{Object} options`
    - `{Boolean} attachedToDocument`

- **返回值：**

  - `{Wrapper}`

- **用法：**

`createWrapper` 为一个被挂载的 Vue 实例或一个 HTML 元素创建一个 `Wrapper`。

```js
import { createWrapper } from '@vue/test-utils'
import Foo from './Foo.vue'

const Constructor = Vue.extend(Foo)
const vm = new Constructor().$mount()
const wrapper = createWrapper(vm)
expect(wrapper.vm.foo).toBe(true)
```
