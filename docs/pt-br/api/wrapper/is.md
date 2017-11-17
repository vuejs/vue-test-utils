# is(seletor)

Verifica se o `vm` do wrapper possui o [seletor](../selectors.md) informado.

- **Argumentos:**
  - `{string|Component} seletor`

- **Retorna:** `{boolean}`

- **Exemplo:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.is('div')).toBe(true)
```
