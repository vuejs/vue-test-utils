# setData(data)

Define os dados do `vm` do wrapper e força a sua atualização.

**Nota: o wrapper deve ser uma instância do Vue.**

- **Argumentos:**
  - `{Object} data`

- **Exemplo:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
wrapper.setData({ foo: 'bar' })
expect(wrapper.vm.foo).toBe('bar')
```
