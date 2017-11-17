# hasClass(nomeDaClasse)

Verifica se algum embrulho do array contém uma classe com o nome `nomeDaClasse` no elemento do DOM.

- **Argumentos:**
  - `{string} nomeDaClasse`

- **Retorna:** `{boolean}`

- **Exemplo:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const divArray = wrapper.findAll('div')

expect(divArray.hasClass('bar')).toBe(true)
```
