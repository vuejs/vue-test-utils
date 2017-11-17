# hasAttribute(atributo, valor)

Verifica se algum wrapper do array tem o `atributo` com `valor` correspondente no elemento do DOM.

- **Argumentos:**
  - `{string} atributo`
  - `{string} valor`

- **Retorna:** `{boolean}`

- **Exemplo:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const divArray = wrapper.findAll('div')

expect(divArray.hasAttribute('id', 'foo')).toBe(true)
```
