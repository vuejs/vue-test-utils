# is(selector)

Verifica se o `vm` do wrapper possui o [seletor](../selectors.md) informado.

- **Argumentos:**
  - `{String|Component} selector`

- **Retorna:** `{Boolean}`

- **Exemplo:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.is('div')).toBe(true)
```
