## createWrapper(node [, options])

- **Các tham số:**

  - `{vm|HTMLElement} node`
  - `{Object} options`
    - `{Boolean} sync`
    - `{Boolean} attachedToDocument`

- **Trả về:**

  - `{Wrapper}`

- **Sử dụng:**

`createWrapper` tạo `Wrapper` cho Vue instance đã mount, hoặc một HTML element.

```js
import { createWrapper } from '@vue/test-utils'
import Foo from './Foo.vue'

const Constructor = Vue.extend(Foo)
const vm = new Constructor().$mount()
const wrapper = createWrapper(vm)
expect(wrapper.vm.foo).toBe(true)
```
