# hasAttribute(attribute, value)

Verifica se algum wrapper do Array tem o `atributo` com `value` correspondente no elemento do DOM.

- **Argumentos:**
  - `{String} attribute`
  - `{String} value`

- **Retorna:** `{Boolean}`

- **Exemplo:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const divArray = wrapper.findAll('div')

expect(divArray.hasAttribute('id', 'foo')).toBe(true)
```
