## createWrapper(node [, options])

- **Arguments:**

  - `{vm|HTMLElement} node`
  - `{Object} options`
    - `{Boolean} attachedToDocument`

- **Retours:**

  - `{Wrapper}`

- **Usage:**

`createWrapper` crée un `Wrapper` pour une instance Vue montée, ou un élément HTML.

```js
import { createWrapper } from '@vue/test-utils'
import Foo from './Foo.vue'

const Constructor = Vue.extend(Foo)
const vm = new Constructor().$mount()
const wrapper = createWrapper(vm)
expect(wrapper.vm.foo).toBe(true)
```
