# hasAttribute(atributo, valor)

Verifica se algum wrapper do Array tem o `atributo` com `valor` correspondente no elemento do DOM.

- **Argumentos:**
  - `{String} atributo`
  - `{String} valor`

- **Retorna:** `{Boolean}`

- **Exemplo:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const divArray = wrapper.findAll('div')

expect(divArray.hasAttribute('id', 'foo')).toBe(true)
```
