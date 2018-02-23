# hasStyle(style, value)

Verifica se o elemento do DOM do wrapper possui uma propriedade de estilo com esse valor.

Retorna `true` se o wrapper possui um `style` com o `value`.

**Nota: só iremos detectar os estilos quando executado com o `jsdom`.**

- **Argumentos:**
  - `{String} style`
  - `{String} value`

- **Retorna:** `{Boolean}`

- **Exemplo:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.hasStyle('color', 'red')).toBe(true)
```
