# hasClass(nomeDaClasse)

Verifica se o wrapper do elemento do DOM contém uma classe informada pelo `nomeDaClasse`.

Retorna `true` se o wrapper contém a classe.

- **Argumentos:**
  - `{string} nomeDaClasse`

- **Retorna:** `{boolean}`

- **Exemplo:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.hasClass('bar')).toBe(true)
```
