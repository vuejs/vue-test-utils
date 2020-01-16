## createWrapper(node [, options])

- **Arguments:**

  - `{vm|HTMLElement} node`
  - `{Object} options`
    - `{Boolean} attachedToDocument`

- **Returns:**

  - `{Wrapper}`

- **Usage:**

`createWrapper` creates a `Wrapper` for a mounted Vue instance, or an HTML element.

```js
import { createWrapper } from '@vue/test-utils'
import Foo from './Foo.vue'

const Constructor = Vue.extend(Foo)
const vm = new Constructor().$mount()
const wrapper = createWrapper(vm)
expect(wrapper.vm.foo).toBe(true)
```
