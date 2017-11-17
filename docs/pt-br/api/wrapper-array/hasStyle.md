# hasStyle(estilo, valor)

Verifica se algum wrapper do Array tem o `estilo` com o `valor` no elemento do DOM.

Retorna `true` se o wrapper contém o `estilo` com o `valor`.

**Nota: para detectarmos os estilos deve-se usar o `jsdom`.**

- **Argumentos:**
  - `{String} estilo`
  - `{String} valor`

- **Retorna:** `{Boolean}`

- **Exemplo:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const divArray = wrapper.findAll('div')

expect(divArray.hasStyle('cor', 'vermelha')).toBe(true)
```
