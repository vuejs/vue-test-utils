# hasClass(className)

Verifica se o wrapper do elemento do DOM contém uma classe informada pelo `className`.

Retorna `true` se o wrapper contém a classe.

- **Argumentos:**
  - `{String} className`

- **Retorna:** `{Boolean}`

- **Exemplo:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.hasClass('bar')).toBe(true)
```
