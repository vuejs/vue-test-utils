# hasStyle(style, value)

Verifica se algum wrapper do Array tem o `style` com o `value` no elemento do DOM.

Retorna `true` se o wrapper contém o `style` com o `value`.

**Nota: para detectarmos os styles deve-se usar o `jsdom`.**

- **Argumentos:**
  - `{String} style`
  - `{String} value`

- **Retorna:** `{Boolean}`

- **Exemplo:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const divArray = wrapper.findAll('div')

expect(divArray.hasStyle('cor', 'vermelha')).toBe(true)
```
