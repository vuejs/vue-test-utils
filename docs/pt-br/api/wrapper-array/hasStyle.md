# hasStyle(estilo, valor)

Verifica se algum embrulho do array tem o `estilo` com o `valor` no elemento do DOM.

Retorna `true` se o embrulho contém o `estilo` com o `valor`.

**Nota: para detectarmos os estilos deve-se usar o `jsdom`.**

- **Argumentos:**
  - `{string} estilo`
  - `{string} valor`

- **Retorna:** `{boolean}`

- **Exemplo:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const divArray = wrapper.findAll('div')

expect(divArray.hasStyle('cor', 'vermelha')).toBe(true)
```
