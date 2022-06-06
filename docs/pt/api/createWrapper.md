## O método createWrapper(node [, options])

- **Argumentos:**

  - `{vm|HTMLElement} node`
  - `{Object} options`
    - `{Boolean} attachedToDocument`

- **Retorna:**

  - `{Wrapper}`

- **Uso:**

O `createWrapper` cria um `Wrapper` (envolvedor) para uma instância do Vue montada, ou um elemento HTML.

```js
import { createWrapper } from '@vue/test-utils'
import Foo from './Foo.vue'

const Constructor = Vue.extend(Foo)
const vm = new Constructor().$mount()
const wrapper = createWrapper(vm)
expect(wrapper.vm.foo).toBe(true)
```
