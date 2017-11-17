# hasProp(propriedade, valor)

Verifica se o `vm` do wrapper possui uma pripriedade com o valor definido.

Retorna `true` se o `vm` do wrapper tem a `propriedade` com o `valor` passado.

**Nota: o wrapper deve conter uma instância do Vue.**

- **Argumentos:**
  - `{string} propriedade`
  - `{any} valor`

- **Retorna:** `{boolean}`

- **Exemplo:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.hasProp('bar', 10)).toBe(true)
```
