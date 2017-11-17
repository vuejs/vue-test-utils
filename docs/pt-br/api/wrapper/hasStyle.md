# hasStyle(estilo, valor)

Verifica se o elemento do DOM do embrulho possui uma propriedade de estilo com esse valor.

Retorna `true` se o wrapper possui um `estilo` com o `valor`.

**Nota: só iremos detectar os estilos quando executado com o `jsdom`.**

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
expect(wrapper.hasStyle('color', 'red')).toBe(true)
```
