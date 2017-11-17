# setData(dados)

Define os dados do `vm` do embrulho e força a sua atualização.

**Nota: o wrapper deve ser uma instância do Vue.**

- **Argumentos:**
  - `{Object} dados`

- **Exemplo:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
wrapper.setData({ foo: 'bar' })
expect(wrapper.vm.foo).toBe('bar')
```
