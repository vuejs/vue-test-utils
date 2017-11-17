# hasClass(nomeDaClasse)

Verifica se algum wrapper do Array contém uma classe com o nome `nomeDaClasse` no elemento do DOM.

- **Argumentos:**
  - `{String} nomeDaClasse`

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
