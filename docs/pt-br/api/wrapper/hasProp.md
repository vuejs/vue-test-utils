# hasProp(propriedade, value)

Verifica se o `vm` do wrapper possui uma pripriedade com o valor definido.

Retorna `true` se o `vm` do wrapper tem a `propriedade` com o `value` passado.

**Nota: o wrapper deve conter uma instância do Vue.**

- **Argumentos:**
  - `{String} propriedade`
  - `{any} value`

- **Retorna:** `{Boolean}`

- **Exemplo:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.hasProp('bar', 10)).toBe(true)
```
