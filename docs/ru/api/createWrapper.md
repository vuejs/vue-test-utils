## createWrapper(node [, options])

- **Аргументы:**

  - `{vm|HTMLElement} node`
  - `{Object} options`
    - `{Boolean} sync`
    - `{Boolean} attachedToDocument`

- **Возвращает:**

  - `{Wrapper}`

- **Использование:**

`createWrapper` создает `Wrapper` для смонтированного экземпляра Vue или HTML-элемента.

```js
import { createWrapper } from '@vue/test-utils'
import Foo from './Foo.vue'

const Constructor = Vue.extend(Foo)
const vm = new Constructor().$mount()
const wrapper = createWrapper(vm)
expect(wrapper.vm.foo).toBe(true)
```
